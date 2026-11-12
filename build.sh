#!/bin/sh
# One command: Explore Surabaya · Kampus Kita Seluas Kota (Reels 1080x1920 and TV 1920x1080)
#   sh build.sh            both formats
#   sh build.sh reels      one format
# Needs: sh setup.sh (library + core tier), espeak-ng for the scratch voice,
# and sh setup.sh geo (.venv-geo) only to re-fetch imagery and buildings.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
[ -s "$HERE/sat/imagery/city.jpg" ] || "$HERE/.venv-geo/bin/python" "$HERE/sat/tools/fetch_s2.py"
[ -s "$HERE/whitemodel/model.json" ] || { sh "$HERE/whitemodel/fetch_buildings.sh"; "$HERE/.venv-geo/bin/python" "$HERE/whitemodel/prep.py"; }
for FMT in ${1:-reels tv}; do
  DUR=180; [ "$FMT" = tv ] && DUR=188
  sh "$HERE/render_parts.sh" $FMT
  "$LIB/.venv/bin/python" "$HERE/voice/scratch_vo.py" $DUR > /dev/null
  "$LIB/.venv/bin/python" "$HERE/audio/mix.py" $FMT
  "$LIB/.venv/bin/python" "$HERE/assemble.py" $FMT
done
