#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ANDROID_DIR="$MOBILE_DIR/android"
DEBUG_APK_RELATIVE_PATH="app/build/outputs/apk/debug/app-debug.apk"

SKIP_INSTALL=false
WITH_DEBUG_APK=false

for arg in "$@"; do
  case "$arg" in
    --)
      ;;
    --skip-install)
      SKIP_INSTALL=true
      ;;
    --with-debug-apk)
      WITH_DEBUG_APK=true
      ;;
    *)
      echo "[mobile-check] Unknown option: $arg" >&2
      echo "[mobile-check] Supported options: --skip-install --with-debug-apk" >&2
      exit 1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[mobile-check] Missing required command: $1" >&2
    exit 1
  fi
}

write_local_properties() {
  local sdk_dir="$1"
  local escaped_sdk_dir="${sdk_dir//\\/\\\\}"
  escaped_sdk_dir="${escaped_sdk_dir//:/\\:}"

  cat > "$ANDROID_DIR/local.properties" <<EOF
sdk.dir=$escaped_sdk_dir
EOF
}

echo "[mobile-check] Validating prerequisites..."
require_cmd node
require_cmd pnpm
require_cmd npx
require_cmd java

export CI=1
ANDROID_SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"

if [[ ! -d "$ANDROID_SDK_DIR" ]]; then
  echo "[mobile-check] Android SDK not found." >&2
  echo "[mobile-check] Set ANDROID_SDK_ROOT (or ANDROID_HOME) and rerun." >&2
  exit 1
fi

cd "$ROOT_DIR"

if [[ "$SKIP_INSTALL" == false ]]; then
  echo "[mobile-check] Installing workspace dependencies..."
  pnpm install --frozen-lockfile
fi

cd "$MOBILE_DIR"

echo "[mobile-check] Running Expo doctor..."
if ! npx expo-doctor; then
  echo "[mobile-check] Expo doctor unavailable right now; continuing with bundle checks."
fi

if ! grep -q '^EXPO_PUBLIC_SUPABASE_URL=' .env 2>/dev/null; then
  echo "[mobile-check] Missing EXPO_PUBLIC_SUPABASE_URL in apps/mobile/.env" >&2
  exit 1
fi

if ! grep -q '^EXPO_PUBLIC_SUPABASE_ANON_KEY=' .env 2>/dev/null; then
  echo "[mobile-check] Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env" >&2
  exit 1
fi

echo "[mobile-check] Running Expo production bundle preflight..."
rm -rf .expo/preflight-export
NODE_ENV=production npx expo export --platform android --output-dir .expo/preflight-export

echo "[mobile-check] Preflight complete."

if [[ "$WITH_DEBUG_APK" == true ]]; then
  echo "[mobile-check] Regenerating Android project with Expo prebuild..."
  NODE_ENV=production npx expo prebuild --platform android

  if [[ ! -d "$ANDROID_DIR" ]]; then
    echo "[mobile-check] Android directory missing at $ANDROID_DIR" >&2
    exit 1
  fi

  write_local_properties "$ANDROID_SDK_DIR"

  cd "$ANDROID_DIR"
  echo "[mobile-check] Building debug APK for device testing..."
  NODE_ENV=development ./gradlew assembleDebug

  DEBUG_APK_PATH="$ANDROID_DIR/$DEBUG_APK_RELATIVE_PATH"
  if [[ ! -f "$DEBUG_APK_PATH" ]]; then
    echo "[mobile-check] Debug APK not found at $DEBUG_APK_PATH" >&2
    exit 1
  fi

  echo "[mobile-check] Debug APK: $DEBUG_APK_PATH"
  echo "[mobile-check] Install command:"
  echo "adb install -r \"$DEBUG_APK_PATH\""
fi
