# Dipanggil (source) oleh semua script: mencari folder library Lemo-Opuscar dan menaruhnya di $LIB.
# Urutan: $LIB yang sudah di-set → vendor/lemo-opuscar (dari setup.sh) → ../lemo-opuscar (clone berdampingan)
#         → ../.. (repo ini ditaruh di lemo-opuscar/films/<nama>/).
if [ -z "$LIB" ]; then
  for c in "$HERE/vendor/lemo-opuscar" "$HERE/../lemo-opuscar" "$HERE/../.."; do
    [ -f "$c/core/render/video.mjs" ] && { LIB=$(cd "$c" && pwd); break; }
  done
fi
[ -n "$LIB" ] && [ -f "$LIB/core/render/video.mjs" ] || { echo "✗ Library Lemo-Opuscar tidak ketemu. Jalankan: sh setup.sh   (atau set LIB=/path/ke/lemo-opuscar)"; exit 1; }
export LIB
# Logo klien (brand/, lokal saja) harus terjangkau dari halaman peta: server render hanya me-mount folder halaman.
[ -d "$HERE/brand" ] && [ ! -e "$HERE/map/brand" ] && ln -s ../brand "$HERE/map/brand" 2>/dev/null || true
