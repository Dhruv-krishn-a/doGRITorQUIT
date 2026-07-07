#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$ROOT_DIR/apps/desktop"
TAURI_DIR="$DESKTOP_DIR/src-tauri"
DIST_DIR="$TAURI_DIR/target/release/bundle"

LINUX_ONLY=false
if [[ "${1:-}" == "--linux-only" ]]; then
  LINUX_ONLY=true
fi

cd "$ROOT_DIR"

echo "[desktop-packages] Installing dependencies if needed..."
pnpm install --frozen-lockfile

echo "[desktop-packages] Building desktop frontend..."
pnpm --filter desktop build

echo "[desktop-packages] Building Tauri bundles (.deb, .rpm, .AppImage)..."
NO_STRIP=1 pnpm --filter desktop tauri build --bundles deb,rpm,appimage

echo "[desktop-packages] Tauri bundles generated under: $DIST_DIR"

BINARY_PATH="$(find "$TAURI_DIR/target/release" -maxdepth 1 -type f \( -name 'gritorquit' -o -name 'grit.io' -o -name 'grit-io' -o -name 'desktop' \) | sort | head -n 1 || true)"
if [[ -z "$BINARY_PATH" ]]; then
  echo "[desktop-packages] ERROR: Desktop binary not found in $TAURI_DIR/target/release" >&2
  exit 1
fi

if command -v makepkg >/dev/null 2>&1; then
  echo "[desktop-packages] Building Arch package (.pkg.tar.zst) from native desktop binary..."
  "$ROOT_DIR/scripts/build-arch-package.sh" "$BINARY_PATH" "$DESKTOP_DIR/dist"
else
  echo "[desktop-packages] Skipping Arch package build (makepkg not available)."
  echo "[desktop-packages] On Arch, install base-devel and rerun this script to build .pkg.tar.zst"
fi

if [[ "$LINUX_ONLY" == true ]]; then
  echo "[desktop-packages] Linux packaging complete."
fi

echo "[desktop-packages] Done."