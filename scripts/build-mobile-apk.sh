#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ANDROID_DIR="$MOBILE_DIR/android"
SKIP_INSTALL=false
SKIP_PREBUILD=false
CLEAN_PREBUILD=true
SKIP_GRADLE_CLEAN=false
BUILD_DEBUG=false

for arg in "$@"; do
  case "$arg" in
    --skip-install)
      SKIP_INSTALL=true
      ;;
    --skip-prebuild)
      SKIP_PREBUILD=true
      ;;
    --no-clean-prebuild)
      CLEAN_PREBUILD=false
      ;;
    --skip-gradle-clean)
      SKIP_GRADLE_CLEAN=true
      ;;
    --debug)
      BUILD_DEBUG=true
      ;;
    *)
      echo "[mobile-apk] Unknown option: $arg" >&2
      echo "[mobile-apk] Supported options: --skip-install --skip-prebuild --no-clean-prebuild --skip-gradle-clean --debug" >&2
      exit 1
      ;;
  esac
done

DIST_DIR="$MOBILE_DIR/dist"
if [[ "$BUILD_DEBUG" == true ]]; then
  APK_RELATIVE_PATH="app/build/outputs/apk/debug/app-debug.apk"
  DIST_APK_PATH="$DIST_DIR/Planner-debug.apk"
else
  APK_RELATIVE_PATH="app/build/outputs/apk/release/app-release.apk"
  DIST_APK_PATH="$DIST_DIR/Planner-release.apk"
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[mobile-apk] Missing required command: $1" >&2
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

echo "[mobile-apk] Validating build tools..."
require_cmd node
require_cmd pnpm
require_cmd npx
require_cmd java

# Expo CLI expects CI for non-interactive runs.
export CI=1

ANDROID_SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"

if [[ ! -d "$ANDROID_SDK_DIR" ]]; then
  echo "[mobile-apk] Android SDK not found." >&2
  echo "[mobile-apk] Set ANDROID_SDK_ROOT (or ANDROID_HOME) to your SDK path and rerun." >&2
  exit 1
fi

cd "$ROOT_DIR"

if [[ "$SKIP_INSTALL" == false ]]; then
  echo "[mobile-apk] Installing workspace dependencies..."
  pnpm install --frozen-lockfile
fi

cd "$MOBILE_DIR"

if [[ "$SKIP_PREBUILD" == false ]]; then
  echo "[mobile-apk] Regenerating native Android project (Expo prebuild)..."
  if [[ "$CLEAN_PREBUILD" == true ]]; then
    NODE_ENV=production npx expo prebuild --platform android --clean
  else
    NODE_ENV=production npx expo prebuild --platform android
  fi
fi

if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "[mobile-apk] Android directory was not generated at $ANDROID_DIR" >&2
  exit 1
fi

write_local_properties "$ANDROID_SDK_DIR"

cd "$ANDROID_DIR"

if [[ "$BUILD_DEBUG" == true ]]; then
  echo "[mobile-apk] Building debug APK..."
  if [[ "$SKIP_GRADLE_CLEAN" == true ]]; then
    NODE_ENV=development ./gradlew assembleDebug
  else
    NODE_ENV=development ./gradlew clean assembleDebug
  fi
else
  echo "[mobile-apk] Building release APK..."
  if [[ "$SKIP_GRADLE_CLEAN" == true ]]; then
    NODE_ENV=production ./gradlew assembleRelease
  else
    NODE_ENV=production ./gradlew clean assembleRelease
  fi
fi

APK_PATH="$ANDROID_DIR/$APK_RELATIVE_PATH"
if [[ ! -f "$APK_PATH" ]]; then
  echo "[mobile-apk] APK not found at $APK_PATH" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"
cp "$APK_PATH" "$DIST_APK_PATH"

echo "[mobile-apk] APK built successfully."
echo "[mobile-apk] Gradle output: $APK_PATH"
echo "[mobile-apk] Copied to:    $DIST_APK_PATH"
echo "[mobile-apk] Install on connected device:"
echo "adb install -r \"$DIST_APK_PATH\""
