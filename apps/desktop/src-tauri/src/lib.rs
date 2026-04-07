use base64::{
    engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD},
    Engine as _,
};
use hmac::{Hmac, Mac};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    fs,
    io,
    path::Path,
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};

#[cfg(any(target_os = "macos", target_os = "windows"))]
use std::process::Command;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager, State,
};
use tauri_plugin_opener::init;

type HmacSha256 = Hmac<Sha256>;

const FRONTEND_INTEGRITY_MANIFEST: &str = include_str!(concat!(
    env!("OUT_DIR"),
    "/frontend_integrity_manifest.json"
));

struct AppState {
    entitlements_cache: Mutex<Option<serde_json::Value>>,
}

fn normalize_api_origin(base_url: &str) -> String {
    let trimmed = base_url.trim().trim_end_matches('/');
    trimmed
        .strip_suffix("/api")
        .unwrap_or(trimmed)
        .to_string()
}

#[derive(serde::Deserialize)]
struct OfflineLeasePayload {
    did: String,
    exp: u64,
    iat: Option<u64>,
    dur: u64,
}

#[derive(Serialize)]
struct PreparedOfflineLease {
    expires_at: u64,
    last_online_monotonic_ms: u64,
    last_safe_system_time: u64,
}

#[derive(Serialize)]
struct LeaseValidationResult {
    is_valid: bool,
    is_offline_mode_enabled: bool,
    reason: Option<String>,
    current_system_time: u64,
}

#[derive(Serialize)]
struct SavePdfResult {
    saved: bool,
    path: Option<String>,
}

#[tauri::command]
fn notify(app: tauri::AppHandle, title: String, body: String) {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .unwrap();
}

#[tauri::command]
async fn fetch_entitlements(
    state: State<'_, AppState>,
    base_url: String,
    token: String,
) -> Result<serde_json::Value, String> {
    // Check cache first
    {
        let cache = state.entitlements_cache.lock().unwrap();
        if let Some(data) = &*cache {
            return Ok(data.clone());
        }
    }

    let client = reqwest::Client::new();
    let origin = normalize_api_origin(&base_url);
    let url = format!("{}/api/entitlements", origin);
    
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    if !response.status().is_success() {
        return Err(format!("API Error: {}", response.status()));
    }
    
    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    
    // Update cache
    {
        let mut cache = state.entitlements_cache.lock().unwrap();
        *cache = Some(data.clone());
    }

    Ok(data)
}

#[tauri::command]
fn clear_entitlements_cache(state: State<'_, AppState>) -> Result<(), String> {
    let mut cache = state.entitlements_cache.lock().unwrap();
    *cache = None;
    Ok(())
}

#[tauri::command]
async fn save_pdf_with_dialog(
    suggested_file_name: String,
    base64_data: String,
    initial_directory: Option<String>,
) -> Result<SavePdfResult, String> {
    let mut file_name = if suggested_file_name.trim().is_empty() {
        "Notes.pdf".to_string()
    } else {
        suggested_file_name
    };

    // Sanitize the file name to prevent path traversal
    file_name = file_name.replace('/', "_").replace('\\', "_").replace("..", "");

    // 1. OPEN DIALOG ON MAIN THREAD
    // Standard FileDialog::new() from `rfd` must run on the UI thread on some Linux envs.
    let mut dialog = rfd::FileDialog::new();
    dialog = dialog.set_file_name(&file_name).add_filter("PDF", &["pdf"]);
    
    if let Some(initial_dir) = initial_directory {
        if !initial_dir.trim().is_empty() {
            dialog = dialog.set_directory(initial_dir);
        }
    }

    let target = dialog.save_file();

    let Some(path) = target else {
        return Ok(SavePdfResult {
            saved: false,
            path: None,
        });
    };

    // 2. DISK I/O ON BACKGROUND THREAD
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = STANDARD
            .decode(base64_data)
            .map_err(|e| format!("PDF decode failed: {e}"))?;

        fs::write(&path, bytes).map_err(|e| format!("Failed to write PDF: {e}"))?;
        
        Ok(SavePdfResult {
            saved: true,
            path: Some(path.to_string_lossy().to_string()),
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
fn get_device_id() -> Result<String, String> {
    current_device_id()
}

#[tauri::command]
fn prepare_offline_lease(token: String) -> Result<PreparedOfflineLease, String> {
    let payload = verify_token_signature_and_payload(&token)?;
    ensure_device_matches(&payload)?;

    Ok(PreparedOfflineLease {
        expires_at: payload.exp,
        last_online_monotonic_ms: current_monotonic_ms()?,
        last_safe_system_time: current_system_time_ms(),
    })
}

#[tauri::command]
fn verify_offline_lease(
    token: String,
    last_online_monotonic_ms: u64,
    last_safe_system_time: u64,
) -> Result<LeaseValidationResult, String> {
    let payload = verify_token_signature_and_payload(&token)?;
    ensure_device_matches(&payload)?;

    let now_monotonic_ms = current_monotonic_ms()?;
    let now_system_ms = current_system_time_ms();

    // 1. Time Travel Guard: If system clock moved back significantly, invalidate.
    // Increased grace period to 5 minutes (300,000ms) to account for sleep/wake drift.
    if now_system_ms + 300_000 < last_safe_system_time {
        return Ok(LeaseValidationResult {
            is_valid: false,
            is_offline_mode_enabled: true,
            reason: Some("CLOCK_TAMPERING_DETECTED".to_string()),
            current_system_time: now_system_ms,
        });
    }

    // 2. Expiry Check
    let is_reboot = now_monotonic_ms < last_online_monotonic_ms;
    
    if is_reboot {
        // Monotonic clock reset (likely reboot). Fallback to System Time for absolute expiry.
        if now_system_ms > payload.exp {
            return Ok(LeaseValidationResult {
                is_valid: false,
                is_offline_mode_enabled: true,
                reason: Some("OFFLINE_DURATION_EXCEEDED".to_string()),
                current_system_time: now_system_ms,
            });
        }
    } else {
        // Normal Monotonic Check (Robust against system clock manipulation)
        let elapsed_ms = now_monotonic_ms - last_online_monotonic_ms;
        
        let offline_duration_ms = payload
            .dur
            .checked_mul(60 * 60 * 1000)
            .ok_or_else(|| "LEASE_DURATION_OVERFLOW".to_string())?;

        let max_allowed_ms = match payload.iat {
            Some(issued_at) if payload.exp > issued_at => {
                offline_duration_ms.min(payload.exp - issued_at)
            }
            Some(_) => return Err("LEASE_INVALID_EXPIRY_RANGE".to_string()),
            None => offline_duration_ms,
        };

        if elapsed_ms > max_allowed_ms {
            return Ok(LeaseValidationResult {
                is_valid: false,
                is_offline_mode_enabled: true,
                reason: Some("OFFLINE_DURATION_EXCEEDED".to_string()),
                current_system_time: now_system_ms,
            });
        }
    }

    Ok(LeaseValidationResult {
        is_valid: true,
        is_offline_mode_enabled: true,
        reason: None,
        current_system_time: now_system_ms,
    })
}

fn verify_token_signature_and_payload(token: &str) -> Result<OfflineLeasePayload, String> {
    let mut parts = token.split('.');
    let header = parts
        .next()
        .ok_or_else(|| "LEASE_TOKEN_MALFORMED".to_string())?;
    let payload = parts
        .next()
        .ok_or_else(|| "LEASE_TOKEN_MALFORMED".to_string())?;
    let signature = parts
        .next()
        .ok_or_else(|| "LEASE_TOKEN_MALFORMED".to_string())?;

    if parts.next().is_some() {
        return Err("LEASE_TOKEN_MALFORMED".to_string());
    }

    let secret = offline_token_secret()?;

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|_| "LEASE_SECRET_INVALID".to_string())?;
    mac.update(format!("{header}.{payload}").as_bytes());

    let signature_bytes = URL_SAFE_NO_PAD
        .decode(signature)
        .map_err(|_| "LEASE_SIGNATURE_MALFORMED".to_string())?;
    mac.verify_slice(&signature_bytes)
        .map_err(|_| "LEASE_SIGNATURE_INVALID".to_string())?;

    let payload_bytes = URL_SAFE_NO_PAD
        .decode(payload)
        .map_err(|_| "LEASE_PAYLOAD_INVALID".to_string())?;

    serde_json::from_slice::<OfflineLeasePayload>(&payload_bytes)
        .map_err(|_| "LEASE_PAYLOAD_INVALID".to_string())
}

fn ensure_device_matches(payload: &OfflineLeasePayload) -> Result<(), String> {
    let current_device_id = current_device_id()?;
    if payload.did != current_device_id {
        return Err("LEASE_DEVICE_MISMATCH".to_string());
    }

    Ok(())
}

fn current_device_id() -> Result<String, String> {
    let raw = raw_device_fingerprint().ok_or_else(|| "DEVICE_ID_UNAVAILABLE".to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());
    Ok(hex::encode(hasher.finalize()))
}

fn raw_device_fingerprint() -> Option<String> {
    #[cfg(target_os = "linux")]
    {
        for path in ["/etc/machine-id", "/var/lib/dbus/machine-id"] {
            if let Ok(value) = fs::read_to_string(path) {
                let trimmed = value.trim();
                if !trimmed.is_empty() {
                    return Some(format!("linux:{trimmed}"));
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = Command::new("ioreg")
            .args(["-rd1", "-c", "IOPlatformExpertDevice"])
            .output()
        {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if let Some((_, value)) = line.split_once("IOPlatformUUID") {
                    let cleaned = value.replace(['=', '"'], "").trim().to_string();
                    if !cleaned.is_empty() {
                        return Some(format!("macos:{cleaned}"));
                    }
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        for program in [
            ("wmic", vec!["csproduct", "get", "uuid"]),
            (
                "powershell",
                vec![
                    "-NoProfile",
                    "-Command",
                    "(Get-CimInstance Win32_ComputerSystemProduct).UUID",
                ],
            ),
        ] {
            if let Ok(output) = Command::new(program.0).args(program.1).output() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() || trimmed.eq_ignore_ascii_case("uuid") {
                        continue;
                    }

                    return Some(format!("windows:{trimmed}"));
                }
            }
        }
    }

    let hostname = std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("COMPUTERNAME"))
        .ok();
    let username = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .ok();

    match (hostname, username) {
        (Some(host), Some(user)) => Some(format!("fallback:{host}:{user}")),
        (Some(host), None) => Some(format!("fallback:{host}")),
        _ => None,
    }
}

fn offline_token_secret() -> Result<String, String> {
    if let Some(secret) = option_env!("OFFLINE_TOKEN_SECRET") {
        if !secret.trim().is_empty() {
            return Ok(secret.to_string());
        }
    }

    if let Ok(secret) = std::env::var("OFFLINE_TOKEN_SECRET") {
        if !secret.trim().is_empty() {
            return Ok(secret);
        }
    }

    if cfg!(debug_assertions) {
        return Ok("fallback-secret-for-dev".to_string());
    }

    Err("OFFLINE_TOKEN_SECRET_MISSING".to_string())
}

fn verify_frontend_integrity(app: &tauri::AppHandle) -> Result<(), String> {
    if cfg!(debug_assertions) {
        return Ok(());
    }

    let manifest = parse_integrity_manifest(FRONTEND_INTEGRITY_MANIFEST)?;
    if manifest.is_empty() {
        return Ok(());
    }

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("RESOURCE_DIR_ERROR: {e}"))?;

    for (relative_path, expected_hash) in manifest {
        let absolute_path = resource_dir.join(Path::new(&relative_path));
        let bytes = fs::read(&absolute_path)
            .map_err(|_| format!("INTEGRITY_FILE_MISSING: {}", absolute_path.display()))?;
        let actual_hash = sha256_hex(&bytes);

        if actual_hash != expected_hash {
            return Err(format!("INTEGRITY_CHECK_FAILED: {relative_path}"));
        }
    }

    Ok(())
}

fn parse_integrity_manifest(raw: &str) -> Result<BTreeMap<String, String>, String> {
    serde_json::from_str(raw).map_err(|_| "INTEGRITY_MANIFEST_INVALID".to_string())
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hex::encode(hasher.finalize())
}

#[cfg(target_os = "linux")]
fn current_monotonic_ms() -> Result<u64, String> {
    let mut ts = Timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };

    let result = unsafe { clock_gettime(CLOCK_BOOTTIME, &mut ts as *mut Timespec) };
    if result != 0 {
        return Err("MONOTONIC_CLOCK_UNAVAILABLE".to_string());
    }

    Ok((ts.tv_sec as u64 * 1000) + (ts.tv_nsec as u64 / 1_000_000))
}

#[cfg(target_os = "macos")]
fn current_monotonic_ms() -> Result<u64, String> {
    let mut ts = Timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };

    let result = unsafe { clock_gettime(CLOCK_UPTIME_RAW, &mut ts as *mut Timespec) };
    if result != 0 {
        return Err("MONOTONIC_CLOCK_UNAVAILABLE".to_string());
    }

    Ok((ts.tv_sec as u64 * 1000) + (ts.tv_nsec as u64 / 1_000_000))
}

#[cfg(target_os = "windows")]
fn current_monotonic_ms() -> Result<u64, String> {
    Ok(unsafe { GetTickCount64() })
}

fn current_system_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

#[cfg(any(target_os = "linux", target_os = "macos"))]
#[repr(C)]
struct Timespec {
    tv_sec: i64,
    tv_nsec: i64,
}

#[cfg(target_os = "linux")]
const CLOCK_BOOTTIME: i32 = 7;

#[cfg(target_os = "macos")]
const CLOCK_UPTIME_RAW: i32 = 8;

#[cfg(any(target_os = "linux", target_os = "macos"))]
unsafe extern "C" {
    fn clock_gettime(clk_id: i32, tp: *mut Timespec) -> i32;
}

#[cfg(target_os = "windows")]
unsafe extern "system" {
    fn GetTickCount64() -> u64;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            entitlements_cache: Mutex::new(None),
        })
        .plugin(init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            notify,
            fetch_entitlements,
            clear_entitlements_cache,
            save_pdf_with_dialog,
            get_device_id,
            prepare_offline_lease,
            verify_offline_lease
        ])
        .setup(|app| {
            if let Err(message) = verify_frontend_integrity(&app.handle()) {
                return Err(io::Error::new(io::ErrorKind::Other, message).into());
            }

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.hide().unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
