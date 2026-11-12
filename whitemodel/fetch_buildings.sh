#!/bin/sh
# Google Open Buildings v3 (CC BY 4.0 / ODbL, used under CC BY 4.0): stream the S2 level-4 cell 2dd and keep only
# footprints within ~1.3 km of Tugu Pahlawan (-7.2459, 112.7378) with confidence >= 0.70. Nothing large is stored.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
curl -sfL "https://storage.googleapis.com/open-buildings-data/v3/polygons_s2_level_4_gzip/2dd_buildings.csv.gz" \
 | gunzip -c \
 | awk -F, 'NR==1 || ($1 > -7.2580 && $1 < -7.2340 && $2 > 112.7258 && $2 < 112.7498 && $4 >= 0.70)' \
 > "$HERE/data/buildings_tugu.csv"
wc -l "$HERE/data/buildings_tugu.csv"
