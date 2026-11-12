# Fetch Sentinel-2 L2A true colour (TCI, 10 m) for Surabaya and the Madura Strait from the AWS open-data COGs,
# passes of 2024-07-16 (west of the swath edge) filled with 2024-08-12 (east: the MERR, Suramadu, Madura), and mosaic two plates in UTM 49S (EPSG:32749):
#   imagery/city.jpg   ~ 46 x 40 km at 10 m  (Surabaya, the Kalimas, Suramadu, south Madura)
#   imagery/wide.jpg   ~ 240 x 180 km at 60 m (East Java and Madura, for the orbit zoom)
# plus imagery/plates.json with each plate's bounds (metres). Credit: Contains modified Copernicus Sentinel data 2024 (S2B, 16 Jul and 12 Aug).
import os, json, numpy as np, rasterio
from rasterio.merge import merge
from rasterio.enums import Resampling
from PIL import Image
os.environ.setdefault('CURL_CA_BUNDLE', '/root/.ccr/ca-bundle.crt'); os.environ['GDAL_DISABLE_READDIR_ON_OPEN'] = 'EMPTY_DIR'
os.environ['GDAL_HTTP_MAX_RETRY'] = '4'
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/49/M/{t}/2024/{m}/S2B_49M{t}_{d}_0_L2A/TCI.tif'
A, B = ('20240716', 7), ('20240812', 8)
def mosaic(tiles, bounds, res):
    srcs = [rasterio.open('/vsicurl/' + URL.format(t=t, d=d, m=m)) for t, (d, m) in tiles]
    arr, _ = merge(srcs, bounds=bounds, res=res, resampling=Resampling.average, nodata=0)
    return np.transpose(arr[:3], (1, 2, 0)).astype(np.float32)
def plate(name, tiles, bounds, res):
    # one mosaic per pass; the first pass wins except within `edge` pixels of its swath edge (dark, striped pixels there),
    # and the second pass is matched to the first in mean and spread over the pixels both see
    from scipy.ndimage import binary_erosion, gaussian_filter
    passes = {}
    for t, dm in tiles: passes.setdefault(dm, []).append((t, dm))
    (a, b) = [mosaic(v, bounds, res) for v in passes.values()]
    va, vb = a.max(2) > 0, b.max(2) > 0
    edge = max(3, int(600 / res))
    ka = binary_erosion(va, iterations=edge, border_value=1)
    both = ka & vb
    if both.sum() > 1000:
        for c in range(3):
            ma, sa, mb, sb = a[..., c][both].mean(), a[..., c][both].std(), b[..., c][both].mean(), b[..., c][both].std()
            b[..., c] = np.where(vb, (b[..., c] - mb) * (sa / max(sb, 1e-3)) + ma, 0)
    w = gaussian_filter(ka.astype(np.float32), edge / 3)[..., None]          # feather the seam
    w = np.where(vb[..., None], w, ka[..., None].astype(np.float32))
    img = np.clip(a * w + b * (1 - w), 0, 255).astype(np.uint8)
    Image.fromarray(img).save(f'{HERE}/imagery/{name}.jpg', quality=92)
    print(name, img.shape); return {'bounds': bounds, 'res': res, 'w': img.shape[1], 'h': img.shape[0]}
# UTM 49S: Surabaya centre ~ (692500, 9197000); Suramadu ~ (695000, 9205000)
P = {
  'city': plate('city', [('FM', A), ('FN', A), ('FM', B), ('FN', B)], (672000, 9178000, 718000, 9218000), 10),
  'wide': plate('wide', [('EM', A), ('EN', A), ('FM', A), ('FN', A), ('FM', B), ('FN', B), ('GM', B), ('GN', B)], (560000, 9110000, 840000, 9300000), 70),
}
json.dump({'crs': 'EPSG:32749', 'date': '2024-07-16 + 2024-08-12', 'plates': P}, open(f'{HERE}/imagery/plates.json', 'w'), indent=1)
