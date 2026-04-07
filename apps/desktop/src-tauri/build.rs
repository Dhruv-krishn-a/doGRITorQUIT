use sha2::{Digest, Sha256};
use std::{
    env,
    fs,
    path::{Path, PathBuf},
};

fn main() {
    track_frontend_dist_changes(Path::new("../dist"));
    tauri_build::build();

    let manifest = build_frontend_integrity_manifest(Path::new("../dist"));
    let out_dir = PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR not set"));
    let output = out_dir.join("frontend_integrity_manifest.json");

    fs::write(output, manifest).expect("failed to write frontend integrity manifest");
}

fn track_frontend_dist_changes(root: &Path) {
    // Ensure Cargo reruns build.rs when frontend artifacts change.
    println!("cargo:rerun-if-changed={}", root.display());
    if !root.exists() {
        return;
    }

    emit_rerun_paths(root);
}

fn emit_rerun_paths(path: &Path) {
    println!("cargo:rerun-if-changed={}", path.display());
    let Ok(read_dir) = fs::read_dir(path) else {
        return;
    };

    for entry in read_dir.flatten() {
        let child = entry.path();
        if child.is_dir() {
            emit_rerun_paths(&child);
        } else {
            println!("cargo:rerun-if-changed={}", child.display());
        }
    }
}

fn build_frontend_integrity_manifest(root: &Path) -> String {
    if !root.exists() {
      return "{}".to_string();
    }

    let mut entries = Vec::new();
    collect_hashes(root, root, &mut entries);
    entries.sort_by(|a, b| a.0.cmp(&b.0));

    let body = entries
      .into_iter()
      .map(|(path, hash)| format!("\"{}\":\"{}\"", escape_json(&path), hash))
      .collect::<Vec<_>>()
      .join(",");

    format!("{{{body}}}")
}

fn collect_hashes(root: &Path, current: &Path, entries: &mut Vec<(String, String)>) {
    let Ok(read_dir) = fs::read_dir(current) else {
      return;
    };

    for entry in read_dir.flatten() {
      let path = entry.path();
      if path.is_dir() {
        collect_hashes(root, &path, entries);
        continue;
      }

      let Ok(bytes) = fs::read(&path) else {
        continue;
      };

      let relative = path
        .strip_prefix(root)
        .unwrap_or(&path)
        .to_string_lossy()
        .replace('\\', "/");

      let mut hasher = Sha256::new();
      hasher.update(bytes);
      let hash = hex::encode(hasher.finalize());
      entries.push((relative, hash));
    }
}

fn escape_json(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}
