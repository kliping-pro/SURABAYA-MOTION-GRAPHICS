#!/bin/sh
# Render SATU section untuk audit (klip pendek, tanpa suara) atau satu still.
#   sh render_section.sh S2 tv            → audit/S2_tv.mp4
#   sh render_section.sh S5 reels         → audit/S5_reels.mp4
#   sh render_section.sh S9 tv "2 4.5 8"  → audit/S9_tv_2.jpg … (still di detik window)
#   sh render_section.sh spine tv         → peta penuh (animatic, jendela placeholder)
# Section: S0 S2 S3 S4 S5 S6 S7 S8 S9 spine   (S1 & S10 ada di dalam spine)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
SEC=${1:?section, mis. S2}; FMT=${2:-tv}; AT=$3
if [ "$FMT" = tv ]; then SIZE=1920x1080; else SIZE=1080x1920; fi
case $SEC in
  S0) DIR=sat; Q="&shot=S0" ;;   S8) DIR=sat; Q="&shot=S8" ;;
  S2) DIR=whitemodel ;;  S3) DIR=sketch ;;  S4) DIR=iso ;;  S5) DIR=tilt ;;
  S6) DIR=silk ;;  S7) DIR=lowpoly ;;  S9) DIR=lantern ;;
  spine) DIR=map; Q="&animatic=1&subs=0" ;;
  *) echo "section tidak dikenal: $SEC"; exit 1 ;;
esac
mkdir -p "$HERE/audit"; cd "$LIB"
if [ -n "$AT" ]; then
  node core/render/still.mjs "$HERE/$DIR" $AT --size $SIZE --q "fmt=$FMT$Q" --prefix "${SEC}_${FMT}_" --out "$HERE/audit"
else
  node core/render/video.mjs "$HERE/$DIR" --fps 30 --workers 3 --size $SIZE --q "fmt=$FMT$Q" --out "$HERE/audit/${SEC}_${FMT}.mp4"
fi
