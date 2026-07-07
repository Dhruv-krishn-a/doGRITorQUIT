#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-desktop-binary> [path-to-frontend-dist]" >&2
  exit 1
fi

BINARY_PATH="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
if [[ ! -f "$BINARY_PATH" ]]; then
  echo "Desktop binary not found: $BINARY_PATH" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCH_DIR="$ROOT_DIR/packaging/arch"
TAURI_CONF="$ROOT_DIR/apps/desktop/src-tauri/tauri.conf.json"
ICON_SOURCE="$ROOT_DIR/apps/desktop/src-tauri/icons/128x128.png"
FRONTEND_DIST_INPUT="${2:-$ROOT_DIR/apps/desktop/dist}"
FRONTEND_DIST="$(cd "$FRONTEND_DIST_INPUT" && pwd)"
if [[ ! -f "$FRONTEND_DIST/index.html" ]]; then
  echo "Frontend dist not found or incomplete at: $FRONTEND_DIST (missing index.html)" >&2
  exit 1
fi

VERSION="$(node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(c.version);" "$TAURI_CONF")"
PKGNAME="grit-io"
BINARY_NAME="$PKGNAME"
ICON_NAME="$PKGNAME.png"
DESKTOP_NAME="$PKGNAME.desktop"
FRONTEND_ARCHIVE="$PKGNAME-frontend-$VERSION.tar.gz"

mkdir -p "$ARCH_DIR"
cp "$BINARY_PATH" "$ARCH_DIR/$BINARY_NAME"
cp "$ICON_SOURCE" "$ARCH_DIR/$ICON_NAME"
tar -C "$FRONTEND_DIST" -czf "$ARCH_DIR/$FRONTEND_ARCHIVE" .

cat > "$ARCH_DIR/$DESKTOP_NAME" <<DESKTOP
[Desktop Entry]
Type=Application
Name=grit.io
Comment=Offline-first productivity suite
Exec=/usr/bin/grit-io %u
Icon=grit-io
Terminal=false
Categories=Office;Productivity;
StartupWMClass=grit.io
MimeType=x-scheme-handler/gritorquit;x-scheme-handler/grit.io;x-scheme-handler/grit-io;
DESKTOP

SHA256="$(sha256sum "$ARCH_DIR/$BINARY_NAME" | awk '{print $1}')"
FRONTEND_SHA256="$(sha256sum "$ARCH_DIR/$FRONTEND_ARCHIVE" | awk '{print $1}')"

cat > "$ARCH_DIR/PKGBUILD" <<PKG
pkgname=$PKGNAME
pkgver=$VERSION
pkgrel=1
pkgdesc="grit.io desktop application"
arch=('x86_64')
url='https://www.gritorquit.in'
license=('custom:proprietary')
depends=('glibc' 'gtk3' 'webkit2gtk-4.1')
source=("$BINARY_NAME" "$DESKTOP_NAME" "$ICON_NAME" "$FRONTEND_ARCHIVE")
sha256sums=('$SHA256' 'SKIP' 'SKIP' '$FRONTEND_SHA256')
options=('!debug')

package() {
  install -Dm755 "$BINARY_NAME" "\$pkgdir/usr/bin/grit-io"
  install -dm755 "\$pkgdir/usr/lib/grit.io"
  tar -xzf "$FRONTEND_ARCHIVE" -C "\$pkgdir/usr/lib/grit.io"

  install -Dm644 "$DESKTOP_NAME" "\$pkgdir/usr/share/applications/grit-io.desktop"
  install -Dm644 "$ICON_NAME" "\$pkgdir/usr/share/pixmaps/grit-io.png"
}
PKG

cd "$ARCH_DIR"
makepkg -sf --noconfirm

echo "Arch package generated in: $ARCH_DIR"