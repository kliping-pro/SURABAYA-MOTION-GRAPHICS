#!/bin/sh
# Animatic: the Transit Map spine with placeholder windows and scratch narration (timing check only).
#   sh animatic.sh reels|tv
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
FMT=${1:-reels}
if [ "$FMT" = tv ]; then SIZE=1920x1080; DUR=188; else SIZE=1080x1920; DUR=180; fi
cd "$LIB"
node core/render/video.mjs "$HERE/map" --fps 30 --workers 3 --size $SIZE --q "fmt=$FMT" --out "$HERE/map/out/${FMT}_video.mp4"
"$LIB/.venv/bin/python" "$HERE/voice/scratch_vo.py" $DUR > /dev/null
ffmpeg -v error -y -i "$HERE/map/out/${FMT}_video.mp4" -i "$HERE/voice/scratch_vo.wav" -c:v copy -c:a aac -b:a 160k -shortest "$HERE/animatic_${FMT}.mp4"
echo "done: $HERE/animatic_${FMT}.mp4"
