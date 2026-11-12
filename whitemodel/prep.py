# Build model.json for the white model of the Tugu Pahlawan area from Google Open Buildings v3 footprints (CC BY 4.0).
# Open Buildings has footprints only (no heights): every building is extruded to one stated height, printed on screen.
# The monument itself (not a building) is added from its documented form: 41.15 m, ten flutes, eleven segments
# (RESEARCH.md); its other proportions are simplified and the identity label says so.
# Model units: 1 unit = 100 m on the ground (1:1000 at 10 cm per unit is irrelevant on screen; the scale bar is computed).
import csv, json, math, os, re, sys
csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
LAT0, LON0 = -7.2459, 112.7378                 # Tugu Pahlawan
HALF = 420.0                                    # metres: the plate is 840 m square
H_BLD = 6.0                                     # uniform building height (no height data)
mx = 111320 * math.cos(math.radians(LAT0)); my = 110574
def local(lon, lat): return ((lon - LON0) * mx, -(lat - LAT0) * my)   # x east, z south (metres)
out, n_all = [], 0
with open(f'{HERE}/data/buildings_tugu.csv') as f:
    for row in csv.reader(f):
        if row[0] == 'latitude': continue
        lat, lon, area, conf, wkt = float(row[0]), float(row[1]), float(row[2]), float(row[3]), row[4]
        n_all += 1
        x, z = local(lon, lat)
        if abs(x) > HALF - 8 or abs(z) > HALF - 8 or area < 12: continue
        if math.hypot(x, z) < 70: continue          # the monument's plaza: the monument is modelled separately
        rings = re.findall(r'\(([^()]+)\)', wkt)
        R = []
        for r in rings:
            pts = [tuple(map(float, p.split())) for p in r.split(',')]
            R.append([[round(v / 100, 5) for v in local(lo, la)] for lo, la in pts[:-1]])
        if R and len(R[0]) >= 3: out.append({'r': R, 'a': area, 'd': math.hypot(x, z)})
out.sort(key=lambda b: b['d'])
model = {
    'unit_m': 100, 'half': HALF / 100, 'h': H_BLD / 100,
    'b': [[b['r'], round(b['d'] / 100, 4)] for b in out],
    'tugu': {'h': 41.15 / 100, 'flutes': 10, 'segments': 11},
}
json.dump(model, open(f'{HERE}/model.json', 'w'), separators=(',', ':'))
stats = {'buildings_in_plate': len(out), 'buildings_read': n_all, 'plate_m': HALF * 2, 'building_height_m': H_BLD,
         'tugu_height_m': 41.15, 'flutes': 10, 'segments': 11, 'source': 'Google Open Buildings v3 (CC BY 4.0), confidence >= 0.70'}
json.dump(stats, open(f'{HERE}/stats.json', 'w'), indent=1)
print(stats)
