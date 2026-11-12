"""Build dark documentary-style terrain textures + vector coastlines.

Sources (free, attribution in research/sources.md):
  - Elevation: AWS Terrain Tiles "terrarium" (Mapzen; SRTM/GMTED/ETOPO1/USGS NED etc.)
  - Land polygons: OpenStreetMap via simonepri/geo-maps earth-lands-10m (ODbL)
  - Coastlines (small scale): Natural Earth 10m (public domain)

Output (public/geo/):
  <region>.jpg            terrain texture in Web Mercator
  regions.json            bounds of each texture in world units
  coast_<region>.json     SVG path data in world units

World units: u = (lon_east + 180) / 360 * W, v = mercator_y * W, W = 100000.
lon_east is continuous across the antimeridian (lon < 0 -> +360) so the
North Pacific is contiguous.
"""
import io, json, math, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union
from shapely import affinity

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "data/geo/raw")
CACHE = os.path.join(ROOT, "data/geo/cache")
OUT = os.path.join(ROOT, "public/geo")
os.makedirs(CACHE, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
W = 100000.0

REGIONS = {
    # name: (lon_min_east, lon_max_east, lat_min, lat_max, zoom, land_source)
    "pacific": (100.0, 242.0, -4.0, 64.0, 6, "ne"),
    "hawaii": (197.6, 206.4, 18.2, 23.4, 10, "osm"),
    "oahu": (201.62, 202.42, 21.18, 21.80, 13, "osm"),
}


def merc_y(lat):
    s = math.radians(lat)
    return (1 - math.log(math.tan(s) + 1 / math.cos(s)) / math.pi) / 2


def lonlat_to_world(lon, lat):
    return (lon + 180) / 360 * W, merc_y(lat) * W


def fetch_tile(z, x, y):
    n = 2 ** z
    xw = x % n
    p = os.path.join(CACHE, f"t{z}_{xw}_{y}.png")
    if not os.path.exists(p):
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{xw}/{y}.png"
        for attempt in range(4):
            try:
                data = urllib.request.urlopen(url, timeout=60).read()
                break
            except Exception:
                if attempt == 3:
                    raise
        with open(p, "wb") as f:
            f.write(data)
    a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def load_land(src, lon0, lon1, lat0, lat1):
    """Return shapely land geometry in continuous east-longitude."""
    pad = 0.5
    geoms = []
    if src == "ne":
        files = ["ne_10m_land.geojson", "ne_10m_minor_islands.geojson"]
        feats = []
        for f in files:
            feats += [shape(ft["geometry"]) for ft in json.load(open(os.path.join(RAW, f)))["features"]]
        all_geom = feats
    else:
        p = os.path.join(CACHE, "osm_lands.pkl")
        import pickle
        if os.path.exists(p):
            all_geom = pickle.load(open(p, "rb"))
        else:
            gc = json.load(open(os.path.join(RAW, "package/map.geo.json")))
            all_geom = [shape(g) for g in gc["geometries"]]
            pickle.dump(all_geom, open(p, "wb"))
    for shift in (0, 360):
        b = box(lon0 - shift - pad, lat0 - pad, lon1 - shift + pad, lat1 + pad)
        for g in all_geom:
            if g.intersects(b):
                c = g.intersection(b)
                if not c.is_empty:
                    geoms.append(affinity.translate(c, xoff=shift))
    return unary_union(geoms) if geoms else None


def chaikin(coords, it=2):
    pts = list(coords)
    for _ in range(it):
        out = []
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i][:2], pts[i + 1][:2]
            out += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        out.append(out[0])
        pts = out
    return pts


def build(name):
    lon0, lon1, lat0, lat1, z, src = REGIONS[name]
    n = 2 ** z
    tx0 = int((lon0 + 180) / 360 * n)
    tx1 = int((lon1 + 180) / 360 * n)
    ty0 = int(merc_y(lat1) * n)
    ty1 = int(merc_y(lat0) * n)
    print(name, "tiles", (tx1 - tx0 + 1) * (ty1 - ty0 + 1), flush=True)
    jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
    with ThreadPoolExecutor(16) as ex:
        tiles = list(ex.map(lambda xy: fetch_tile(z, *xy), jobs))
    cols = tx1 - tx0 + 1
    rows = [np.hstack(tiles[r * cols:(r + 1) * cols]) for r in range(ty1 - ty0 + 1)]
    elev = np.vstack(rows)
    H, Wp = elev.shape
    # world bounds of the mosaic
    bx0, by0 = tx0 / n * W, ty0 / n * W
    bx1, by1 = (tx1 + 1) / n * W, (ty1 + 1) / n * W

    # ---- land mask from vector polygons (fixes blobby DEM coastlines)
    land = load_land(src, tx0 / n * 360 - 180, (tx1 + 1) / n * 360 - 180, lat0 - 3, lat1 + 3)
    mask_img = Image.new("L", (Wp, H), 0)
    dr = ImageDraw.Draw(mask_img)

    def to_px(lon, lat):
        wx, wy = lonlat_to_world(lon, lat)
        return (wx - bx0) / (bx1 - bx0) * Wp, (wy - by0) / (by1 - by0) * H

    polys = []
    if land is not None:
        for g in getattr(land, "geoms", [land]):
            if g.geom_type == "Polygon":
                polys.append(g)
            elif g.geom_type == "MultiPolygon":
                polys += list(g.geoms)
    smooth_it = 0 if src == "ne" else 2
    rings = []  # (is_hole, smoothed lon/lat coords)
    for p in polys:
        rings.append((False, chaikin(p.exterior.coords, smooth_it)))
        for hole in p.interiors:
            rings.append((True, chaikin(hole.coords, smooth_it)))
    for hole, rc in sorted(rings, key=lambda r: r[0]):
        dr.polygon([to_px(*c) for c in rc], fill=0 if hole else 255)
    mask = np.asarray(mask_img).astype(np.float32) / 255

    # ---- shading
    lat_c = (lat0 + lat1) / 2
    px_m = 40075016.0 * math.cos(math.radians(lat_c)) / (256 * n)
    e = ndimage.gaussian_filter(elev, 0.6)
    gy, gx = np.gradient(e, px_m)
    exaggeration = {"pacific": 9.0, "hawaii": 2.6, "oahu": 1.6}[name]
    gx *= exaggeration
    gy *= exaggeration
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)

    def shade(az, alt):
        az, alt = math.radians(az), math.radians(alt)
        return np.clip(np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)

    hs = 0.55 * shade(315, 40) + 0.25 * shade(270, 30) + 0.20 * shade(0, 55)
    flat = math.sin(math.radians(40)) * 0.55 + math.sin(math.radians(30)) * 0.25 + math.sin(math.radians(55)) * 0.2
    rel = hs - flat  # relief signal around 0

    rng = np.random.default_rng(7)
    grain = ndimage.gaussian_filter(rng.standard_normal((H, Wp)).astype(np.float32), 0.7)
    mott = ndimage.gaussian_filter(rng.standard_normal((H, Wp)).astype(np.float32), 18 if name != "pacific" else 10)
    mott /= mott.std() + 1e-6

    # land: graphite with cool tint, satellite-like mottling
    hnorm = np.clip(elev / {"pacific": 3000, "hawaii": 3000, "oahu": 1000}[name], 0, 1)
    land_base = np.array([60, 68, 72], np.float32)
    land_rgb = (land_base
                + rel[..., None] * np.array([175, 185, 190], np.float32)
                + hnorm[..., None] * np.array([10, 12, 12], np.float32)
                + mott[..., None] * 5
                + grain[..., None] * 6)
    # sea: deep navy with bathymetric relief
    depth = np.clip(-elev / 6000, 0, 1)
    sea_base = np.array([13, 23, 31], np.float32) - depth[..., None] * np.array([5, 8, 10], np.float32)
    sea_rgb = (sea_base
               + rel[..., None] * np.array([20, 30, 36], np.float32) * (0.6 if name == "pacific" else 0.35)
               + mott[..., None] * 1.5
               + grain[..., None] * 2.5)
    # shallow shelf glow near coasts
    dist = ndimage.distance_transform_edt(mask < 0.5)
    shelf = np.exp(-dist / (6 if name == "pacific" else 14))
    sea_rgb += shelf[..., None] * np.array([6, 20, 24], np.float32) * (1 - mask[..., None])

    m = ndimage.gaussian_filter(mask, 0.8)[..., None]
    rgb = land_rgb * m + sea_rgb * (1 - m)
    # coastline glow baked into the texture (soft, so it survives LOD scaling;
    # the crisp 1px line itself is drawn as a vector in the engine)
    edge = np.abs(m[..., 0] - ndimage.uniform_filter(m[..., 0], 3)) * 4
    sig = {"pacific": 2.2, "hawaii": 3.0, "oahu": 5.0}[name]
    glow = ndimage.gaussian_filter(edge, sig) * 3 + ndimage.gaussian_filter(edge, sig * 4) * 2.2
    rgb = rgb + np.clip(glow, 0, 1.4)[..., None] * np.array([40, 120, 118], np.float32)
    rgb8 = np.clip(rgb, 0, 255).astype(np.uint8)
    if name == "pacific":
        alpha = np.full((H, Wp), 255, np.uint8)
    else:
        fx = np.minimum(np.arange(Wp), np.arange(Wp)[::-1]) / (Wp * 0.08)
        fy = np.minimum(np.arange(H), np.arange(H)[::-1]) / (H * 0.08)
        f = np.clip(np.minimum(fy[:, None], fx[None, :]), 0, 1)
        alpha = (f * f * (3 - 2 * f) * 255).astype(np.uint8)
    rgba = np.dstack([rgb8, alpha])
    for old in os.listdir(OUT):
        if old.startswith(name + "_") and old.endswith(".webp"):
            os.remove(os.path.join(OUT, old))
    TS = 2048
    tile_list = []
    for ty in range(0, H, TS):
        for tx in range(0, Wp, TS):
            sub = rgba[ty:ty + TS, tx:tx + TS]
            fn = f"{name}_{ty // TS}_{tx // TS}.webp"
            Image.fromarray(sub, "RGBA").save(os.path.join(OUT, fn), quality=90, method=5)
            h, w = sub.shape[:2]
            tile_list.append({"file": fn, "x0": bx0 + (bx1 - bx0) * tx / Wp, "y0": by0 + (by1 - by0) * ty / H,
                              "x1": bx0 + (bx1 - bx0) * (tx + w) / Wp, "y1": by0 + (by1 - by0) * (ty + h) / H})

    # ---- vector coastline in world units (simplified to ~0.6 px of this texture)
    tol_deg = (lon1 - lon0) / Wp * 0.6
    from shapely.geometry import LinearRing
    d = []
    for _, rc in rings:
        if len(rc) < 4:
            continue
        ring = LinearRing(rc).simplify(tol_deg)
        if ring.is_empty or len(ring.coords) < 4:
            continue
        pts = [lonlat_to_world(*c) for c in ring.coords]
        xs = [q[0] for q in pts]; ys = [q[1] for q in pts]
        if (max(xs) - min(xs)) * (max(ys) - min(ys)) < ((bx1 - bx0) / Wp * 2) ** 2:
            continue
        d.append("M" + "L".join(f"{x:.3f},{y:.3f}" for x, y in pts) + "Z")
    json.dump({"d": "".join(d)}, open(os.path.join(OUT, f"coast_{name}.json"), "w"))
    return {"x0": bx0, "y0": by0, "x1": bx1, "y1": by1, "w": Wp, "h": H, "zoom": z, "tiles": tile_list}


if __name__ == "__main__":
    names = sys.argv[1:] or list(REGIONS)
    reg_path = os.path.join(OUT, "regions.json")
    regs = json.load(open(reg_path)) if os.path.exists(reg_path) else {}
    for nm in names:
        regs[nm] = build(nm)
        print(nm, regs[nm], flush=True)
    json.dump(regs, open(reg_path, "w"), indent=1)
