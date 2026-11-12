"""Derive a detailed Pearl Harbor shoreline from the USGS-based DEM.

Why: the offline OSM land polygons are coarse (Ford Island = 6 points).
In the terrarium z15 tiles over Pearl Harbor, water surfaces are encoded as
integer-valued, perfectly constant blocks (bathymetry/hydro-flattening),
while land has fractional, varying elevations. We detect water that way,
restrict it to the vicinity of OSM water (to reject flat quantised land),
keep only components connected to the sea, and vectorise the result.

Output: data/geo/harbor_land.geojson (land polygons, lon/lat).
Limitation: this is the MODERN shoreline. Areas east of -157.925 (later
airport/reef-runway fill) are excluded; see research/sources.md.
"""
import json, math, os, pickle, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from shapely.geometry import Polygon, box, mapping
from shapely.ops import unary_union
from skimage import measure

sys.path.insert(0, os.path.dirname(__file__))
from build_terrain import fetch_tile, merc_y, CACHE, ROOT  # noqa: E402
from concurrent.futures import ThreadPoolExecutor

Z = 15
N = 2 ** Z
LON0, LON1, LAT0, LAT1 = -158.06, -157.925, 21.30, 21.41
tx0, tx1 = int((LON0 + 180) / 360 * N), int((LON1 + 180) / 360 * N)
ty0, ty1 = int(merc_y(LAT1) * N), int(merc_y(LAT0) * N)

jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
with ThreadPoolExecutor(16) as ex:
    tiles = list(ex.map(lambda j: fetch_tile(Z, *j), jobs))
cols = tx1 - tx0 + 1
e = np.vstack([np.hstack(tiles[r * cols:(r + 1) * cols]) for r in range(ty1 - ty0 + 1)])
h, w = e.shape


def to_px(lon, lat):
    return ((lon + 180) / 360 * N - tx0) * 256, (merc_y(lat) * N - ty0) * 256


def to_ll(x, y):
    lon = (x / 256 + tx0) / N * 360 - 180
    yy = (y / 256 + ty0) / N
    return lon, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * yy))))


# OSM land raster (coarse) for vicinity gating
g = pickle.load(open(os.path.join(CACHE, "osm_lands.pkl"), "rb"))
lo0, la1 = to_ll(0, 0)
lo1, la0 = to_ll(w, h)
bb = box(lo0, la0, lo1, la1)
m = Image.new("L", (w, h), 0)
d = ImageDraw.Draw(m)
for x in g:
    if x.intersects(bb):
        c = x.intersection(bb)
        for p in getattr(c, "geoms", [c]):
            if p.geom_type != "Polygon":
                continue
            d.polygon([to_px(*q) for q in p.exterior.coords], fill=255)
            for hh in p.interiors:
                d.polygon([to_px(*q) for q in hh.coords], fill=0)
osm_land = np.asarray(m) > 0

isint = np.abs(e - np.round(e)) < 1e-3
const = (ndimage.maximum_filter(e, 5) - ndimage.minimum_filter(e, 5)) < 1e-3
cand = ndimage.binary_closing(isint & const, iterations=2)
near_water = ndimage.binary_dilation(~osm_land, iterations=30)
water = (cand & near_water) | ((e < 0.3) & ~osm_land) | (e < -0.5)
water = ndimage.binary_opening(ndimage.binary_closing(water, iterations=2), iterations=2)
# keep only water connected to the open sea (bottom edge)
lab, _ = ndimage.label(water)
sea_ids = set(np.unique(lab[-3:, :])) - {0}
water = np.isin(lab, list(sea_ids))
water = ndimage.binary_dilation(water, iterations=2)
# fill small land specks
lab, nl = ndimage.label(~water)
sizes = ndimage.sum(~water, lab, range(1, nl + 1))
land = np.isin(lab, np.where(sizes > 1500)[0] + 1)
land = ndimage.gaussian_filter(land.astype(float), 1.2) > 0.5

polys = []
padded = np.pad(land, 1, constant_values=False)
for cnt in measure.find_contours(padded.astype(float), 0.5):
    pts = [to_ll(c[1] - 1, c[0] - 1) for c in cnt]
    if len(pts) < 8:
        continue
    poly = Polygon(pts).buffer(0)
    if poly.area < 1e-7:
        continue
    polys.append(poly.simplify(0.00002))
land_geom = unary_union(polys).intersection(box(LON0, LAT0, LON1, LAT1))
out = os.path.join(ROOT, "data/geo/harbor_land.geojson")
json.dump({"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": mapping(land_geom)}]}, open(out, "w"))
print("wrote", out, land_geom.geom_type, len(getattr(land_geom, "geoms", [land_geom])))
