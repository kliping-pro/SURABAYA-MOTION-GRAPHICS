#!/bin/sh
# Render every part of the film for one format: the map spine (no placeholders, no subtitles) and the eight windows.
#   sh render_parts.sh reels|tv
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
FMT=${1:-reels}
if [ "$FMT" = tv ]; then SIZE=1920x1080; else SIZE=1080x1920; fi
OUT="$HERE/parts/$FMT"; mkdir -p "$OUT"
cd "$LIB"
r() { # dir query name
  [ -s "$OUT/$3.mp4" ] && { echo "skip $3"; return; }
  node core/render/video.mjs "$HERE/$1" --fps 30 --workers 3 --size $SIZE --q "fmt=$FMT$2" --out "$OUT/$3.mp4" 2>&1 | grep -E "^done|rror" || true
}
r sat "&shot=S0" S0
r whitemodel "" S2
r sketch "" S3
r iso "" S4
r tilt "" S5
r silk "" S6
r lowpoly "" S7
r sat "&shot=S8" S8
r lantern "" S9
r map "&animatic=0&subs=0" spine
echo "parts done: $OUT"
