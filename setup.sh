#!/bin/sh
# Sekali saja: siapkan library Lemo-Opuscar (render pipeline + core tools) yang dipakai film ini.
#   sh setup.sh                 clone library ke vendor/lemo-opuscar (kalau belum ada) + pasang dependensi core
#   LIB=/path/lemo sh setup.sh  pakai clone library yang sudah ada
#   sh setup.sh geo             + venv .venv-geo (rasterio dll.) untuk mengambil ulang citra Sentinel-2 & data bangunan
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB_REPO=${LIB_REPO:-https://github.com/kliping-pro/lemo-opuscar}
if [ -z "$LIB" ] && [ ! -f "$HERE/vendor/lemo-opuscar/core/render/video.mjs" ] && [ ! -f "$HERE/../lemo-opuscar/core/render/video.mjs" ] && [ ! -f "$HERE/../../core/render/video.mjs" ]; then
  mkdir -p "$HERE/vendor"; git clone --depth 1 "$LIB_REPO" "$HERE/vendor/lemo-opuscar"
fi
. "$HERE/lib.sh"
echo "library: $LIB"
(cd "$LIB" && sh plugin/skills/lemo-opuscar/scripts/setup.sh deps)
command -v ffmpeg >/dev/null || echo "! ffmpeg belum ada (wajib untuk perakitan): apt install ffmpeg / brew install ffmpeg"
command -v espeak-ng >/dev/null || echo "! espeak-ng belum ada (hanya untuk suara sementara): apt install espeak-ng / brew install espeak-ng"
if [ "$1" = geo ]; then
  [ -x "$HERE/.venv-geo/bin/python" ] || python3 -m venv "$HERE/.venv-geo"
  "$HERE/.venv-geo/bin/python" -m pip install --quiet -r "$HERE/requirements-geo.txt"
  echo "venv geo siap: $HERE/.venv-geo"
fi
echo "siap. Lanjut: sh build.sh   (atau sh render_section.sh S2 tv)"
