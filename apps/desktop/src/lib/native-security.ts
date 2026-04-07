import { invoke } from "@tauri-apps/api/core";

export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export type PreparedOfflineLease = {
  expiresAt: number;
  lastOnlineMonotonicMs: number;
  lastSafeSystemTime: number;
};

export type LeaseValidationResult = {
  isValid: boolean;
  isOfflineModeEnabled: boolean;
  reason?: string | null;
  currentSystemTime: number;
};

export async function getNativeDeviceId(): Promise<string | null> {
  if (!isTauri) return null;

  return invoke<string>("get_device_id");
}

export async function prepareOfflineLease(token: string): Promise<PreparedOfflineLease | null> {
  if (!isTauri) return null;

  const result = await invoke<{
    expires_at: number;
    last_online_monotonic_ms: number;
    last_safe_system_time: number;
  }>("prepare_offline_lease", { token });

  return {
    expiresAt: result.expires_at,
    lastOnlineMonotonicMs: result.last_online_monotonic_ms,
    lastSafeSystemTime: result.last_safe_system_time,
  };
}

export async function verifyOfflineLease(
  token: string,
  lastOnlineMonotonicMs: number,
  lastSafeSystemTime: number,
): Promise<LeaseValidationResult | null> {
  if (!isTauri) return null;

  const result = await invoke<{
    is_valid: boolean;
    is_offline_mode_enabled: boolean;
    reason?: string | null;
    current_system_time: number;
  }>("verify_offline_lease", {
    token,
    lastOnlineMonotonicMs,
    lastSafeSystemTime,
  });

  return {
    isValid: result.is_valid,
    isOfflineModeEnabled: result.is_offline_mode_enabled,
    reason: result.reason ?? null,
    currentSystemTime: result.current_system_time,
  };
}
