#!/usr/bin/env python3
"""region_overlay.py — build a region-map settlement overlay (rulings 139-144).

The region-forge workflow tool, first run against Ben's Palewater region canvas:
  1. detect the painted anchor glyphs on the region export and solve the
     world->region similarity transform (never eyeball the alignment);
  2. classify the drawn water and snap every river-adjacent placement to Ben's
     actual painted channel (the freehand art deviates from the world trace);
  3. sketch the derived tributary guides (mouths load-bearing, middles repaintable);
  4. place driver-tagged market towns per the ruling-144 per-nation mixes
     (seeded -> deterministic re-runs);
  5. render a full-canvas transparent PNG guide layer for Procreate insertion,
     plus a JSON sidecar of every placement (world px) for the gazetteer commit —
     including corrected world px for cities whose guide spot snapped to the art.

Region-specific facts (anchors, corridor kms, exclusion art, driver mixes) live in
CONFIG; the machinery below it is region-agnostic and moves into the region-forge
skill as-is.
"""

import json
import math
import random
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]

CONFIG = {
    "map_json": ROOT / "source-materials/maps/thyrcross.map.json",
    "seed": 143,  # the ruling that placed the cities
    "anchors": {
        "elmsworth": {"world": (1036, 1359), "guess": (753, 260)},
        "heartholt": {"world": (885, 1514), "guess": (463, 578)},
        "withervale": {"world": (1220, 1796), "guess": (1140, 1149)},
    },
    "channel_waterway": "border-river",
    "channel_origin_world": (1036, 1359),   # Elmsworth, km 0
    "corridor_end_km": 1444,                # Withervale
    "wild_from_km": 620,                    # below the ferry-pair: both banks wild
    "wild_halfwidth_px": 45,                # region px (~35 km) hard suppression
    "fort_band_px": (45, 130),
    "barge_day_km": 110,                    # ruling 84 barge_down
    "exclude_polys": [
        [(0, 0), (600, 0), (545, 175), (400, 300), (240, 365), (0, 405)],
    ],
    "lake_seeds": {"great-lake": (870, 140), "sw-lake": (390, 1290)},
    # id -> (label, side) — side "left" flips the label west of the glyph.
    "city_labels": {
        "city-15": ("Elmsworth ~18k (painted)", "right"),
        "city-30": ("city-30 · ferry port ~12k", "left"),
        "city-31": ("city-31 · ferry twin ~15k", "right"),
        "city-32": ("city-32 · lakeshore ~12k ⚑", "right"),
        "city-33": ("city-33 · west door ~10k ⚑", "right"),
        "city-36": ("city-36 · crossroads ~12k ⚑", "left"),
    },
    "painted_cities": {"city-15"},          # ring + label only, no glyph guide
    "river_snap_cities": {"city-30": "west", "city-31": "east"},
    "lake_snap_cities": {"city-32": ("great-lake", "west")},
    "corridor_slots": [
        (140, "west", "slot · km 140"),
        (300, "west", "slot · km 300"),
        (430, "west", "slot · km 430"),
        (250, "east", "slot · km 250"),
        (430, "east", "slot · km 430"),
    ],
    "tributaries": [
        ("trib-T1", "thalendor", 180, [(420, 345), (540, 420), (650, 445)]),
        ("trib-T2", "thalendor", 500, [(300, 645), (470, 600), (660, 630), (860, 610)]),
        ("trib-T3", "thalendor", 870, [(600, 1100), (740, 1010), (880, 930)]),
        ("trib-T4", "thalendor", 1300, [(430, 1235), (640, 1200), (860, 1150), (1020, 1120)]),
        ("trib-C1", "corvaine", 250, [(1360, 420), (1220, 450), (1080, 470)]),
        ("trib-C2", "corvaine", 650, [(1360, 900), (1280, 820), (1200, 760)]),
        ("trib-C3", "corvaine", 1100, [(1350, 1350), (1290, 1180), (1230, 1010)]),
    ],
    "town_counts": {"thalendor": 85, "corvaine": 45},
    "driver_mix": {
        "thalendor": {"water": 0.35, "shrine": 0.25, "specialty": 0.20, "junction": 0.10, "fort": 0.10},
        "corvaine": {"water": 0.25, "shrine": 0.10, "specialty": 0.20, "junction": 0.30, "fort": 0.15},
    },
    "roads": [
        ["@city-15", "@heartholt"],          # Ben's drawn dotted route
        ["@heartholt", "@city-30"],
        ["@heartholt", (240, 700), "@city-33"],
        ["@city-15", "@city-32"],
        ["@city-31", "@city-36"],
        ["@city-36", (1310, 180), (1330, 0)],
        ["@city-36", (1384, 520)],
    ],
}

DRIVER_STYLE = {
    "water": (91, 141, 184),
    "shrine": (122, 158, 95),
    "specialty": (201, 123, 74),
    "junction": (217, 164, 65),
    "fort": (176, 74, 74),
}


# ---------------------------------------------------------------- geometry ---

def solve_similarity(pairs):
    A, B = [], []
    for (x, y), (X, Y) in pairs:
        A.append([x, -y, 1, 0]); B.append(X)
        A.append([y, x, 0, 1]); B.append(Y)
    (a, b, tx, ty), *_ = np.linalg.lstsq(np.array(A, float), np.array(B, float), rcond=None)
    def w2r(p):
        return (a * p[0] - b * p[1] + tx, b * p[0] + a * p[1] + ty)
    det = a * a + b * b
    def r2w(p):
        X, Y = p[0] - tx, p[1] - ty
        return ((a * X + b * Y) / det, (-b * X + a * Y) / det)
    scale = math.hypot(a, b)
    rot = math.degrees(math.atan2(b, a))
    resid = [math.hypot(*(np.subtract(w2r(w), r))) for w, r in pairs]
    return w2r, r2w, scale, rot, resid


def detect_anchor(lum, guess, r=45, min_blob=8, max_extent=42):
    """Most compact dark blob NEAREST the guess (river ink and label text run long
    or sit farther out; the glyph is the compact blob under the guess)."""
    gx, gy = guess
    win = lum[gy - r:gy + r, gx - r:gx + r]
    thr = np.percentile(win, 5)
    lab, n = ndimage.label(win <= thr)
    best, best_d = None, 1e9
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < min_blob:
            continue
        w = xs.max() - xs.min() + 1
        h = ys.max() - ys.min() + 1
        if w > max_extent or h > max_extent:
            continue
        if min(w, h) / max(w, h) < 0.45:
            continue  # elongated ink
        cx, cy = xs.mean(), ys.mean()
        d = math.hypot(cx - r, cy - r)
        if d < best_d:
            best_d, best = d, (cx + gx - r, cy + gy - r)
    if best is None:
        raise SystemExit(f"anchor detection failed near {guess}")
    return best


def water_mask(arr):
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    m = (b > 0.45 * r + 15) & (b > 0.8 * g)
    m = ndimage.binary_opening(m, iterations=2)
    m = ndimage.binary_closing(m, iterations=2)
    return m


def channel_sampler(gaz, waterway_id, origin_world):
    K = gaz["meta"]["km_per_px"]
    pts = next(w for w in gaz["waterways"] if w["id"] == waterway_id)["polyline"]
    dist = lambda a, b: math.hypot(a[0] - b[0], a[1] - b[1]) * K
    oi = min(range(len(pts)), key=lambda i: dist(pts[i], origin_world))
    cum = [0.0]
    for i in range(1, len(pts)):
        cum.append(cum[-1] + dist(pts[i - 1], pts[i]))
    def at_km(km):
        t = cum[oi] + km
        for i in range(oi, len(pts) - 1):
            if cum[i + 1] >= t:
                f = (t - cum[i]) / (cum[i + 1] - cum[i])
                return (pts[i][0] + f * (pts[i + 1][0] - pts[i][0]),
                        pts[i][1] + f * (pts[i + 1][1] - pts[i][1]))
        return tuple(pts[-1])
    return at_km


def catmull(points, steps=24):
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = (np.array(pts[j], float) for j in (i - 1, i, i + 1, i + 2))
        for s in range(steps):
            t = s / steps
            out.append(tuple(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                                    + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)))
    out.append(tuple(pts[-2]))
    return out


def meander(ctrl, rng, wiggle=(7, 15)):
    """Subdivide a control polyline and push alternate midpoints sideways: rivers, not rulers."""
    dense = []
    for i in range(len(ctrl) - 1):
        a, b = np.array(ctrl[i], float), np.array(ctrl[i + 1], float)
        n = max(2, int(np.linalg.norm(b - a) // 60))
        for s in range(n):
            dense.append(a + (b - a) * (s / n))
    dense.append(np.array(ctrl[-1], float))
    out = []
    for i, p in enumerate(dense):
        if 0 < i < len(dense) - 1:
            d = dense[i + 1] - dense[i - 1]
            L = np.linalg.norm(d) or 1
            perp = np.array([-d[1], d[0]]) / L
            p = p + perp * rng.uniform(*wiggle) * (1 if i % 2 else -1)
        out.append(tuple(p))
    return out


def point_in_poly(poly, x, y):
    inside, j = False, len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]; xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def poly_distance(path, x, y):
    best, bi = 1e9, 0
    for i in range(len(path) - 1):
        (x1, y1), (x2, y2) = path[i], path[i + 1]
        dx, dy = x2 - x1, y2 - y1
        L2 = dx * dx + dy * dy or 1e-9
        t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / L2))
        d = math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
        if d < best:
            best, bi = d, i
    return best, bi


def side_of(path, x, y):
    """-1 west/left of the border path (Thalendor), +1 east/right (Corvaine)."""
    _, i = poly_distance(path, x, y)
    (x1, y1), (x2, y2) = path[i], path[i + 1]
    cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
    return -1 if cross > 0 else 1


# ------------------------------------------------------------------- build ---

def main():
    cfg = CONFIG
    region_image, out_png, out_json = sys.argv[1], sys.argv[2], sys.argv[3]
    rng = random.Random(cfg["seed"])
    gaz = json.load(open(cfg["map_json"]))

    im = Image.open(region_image).convert("RGB")
    W, H = im.size
    arr = np.asarray(im)
    lum = arr.astype(int).sum(axis=2)

    # 1. transform from painted anchors
    pairs, detected = [], {}
    for name, spec in cfg["anchors"].items():
        r = detect_anchor(lum, spec["guess"])
        detected[name] = r
        pairs.append((spec["world"], r))
    w2r, r2w, scale, rot, resid = solve_similarity(pairs)
    print(f"transform: scale {scale:.4f}, rotation {rot:+.2f} deg, "
          f"residuals {['%.1f' % e for e in resid]} px")
    if abs(rot) > 1.5:
        print("WARN: rotation > 1.5 deg — an anchor detection is probably contaminated")
    km_per_region_px = gaz["meta"]["km_per_px"] / scale

    # 2. water + the DRAWN main channel (snap target for everything river-adjacent)
    water = water_mask(arr)
    dist_to_water = ndimage.distance_transform_edt(~water)
    at_km = channel_sampler(gaz, cfg["channel_waterway"], cfg["channel_origin_world"])

    lab, _n = ndimage.label(water)
    votes = Counter()
    wys, wxs = np.where(water)
    wtree = cKDTree(np.column_stack([wxs, wys]))
    for km in range(0, cfg["corridor_end_km"], 60):
        x, y = w2r(at_km(km))
        if not (0 <= x < W and 0 <= y < H):
            continue
        _, idx = wtree.query([x, y])
        votes[lab[wys[idx], wxs[idx]]] += 1
    river_comp = votes.most_common(1)[0][0]
    rys, rxs = np.where(lab == river_comp)
    rtree = cKDTree(np.column_stack([rxs, rys]))

    def snap_river(p):
        _, idx = rtree.query(p)
        return float(rxs[idx]), float(rys[idx])

    def drawn_km(km):
        """km mark projected onto the drawn channel (centre-ish via double snap)."""
        x, y = snap_river(w2r(at_km(km)))
        # nudge to local water centroid so ticks sit in the channel, not the edge
        win = 6
        ys2, xs2 = np.where(water[int(y) - win:int(y) + win, int(x) - win:int(x) + win])
        if len(xs2):
            return (float(xs2.mean() + x - win), float(ys2.mean() + y - win))
        return (x, y)

    ch_drawn = [drawn_km(k) for k in range(0, cfg["corridor_end_km"] + 1, 20)]
    border_path = [(920, -10), (900, 120), (840, 230)] + ch_drawn

    def wildness(x, y):
        d, i = poly_distance(ch_drawn, x, y)
        return d if i * 20 >= cfg["wild_from_km"] else None

    def bank_spot(km, bank, lo=5, hi=12):
        """A point on the given bank of the drawn river at km."""
        cx, cy = drawn_km(km)
        want = -1 if bank == "west" else 1
        for d in range(6, 40, 2):
            for ang in np.linspace(0, 2 * math.pi, 16, endpoint=False):
                x, y = cx + d * math.cos(ang), cy + d * math.sin(ang)
                if not (0 <= int(x) < W and 0 <= int(y) < H):
                    continue
                if lo <= dist_to_water[int(y), int(x)] <= hi and side_of(border_path, x, y) == want:
                    return (x, y)
        return (cx + (18 if bank == "east" else -18), cy)

    excl = cfg["exclude_polys"]

    def usable(x, y, min_water_clear=4):
        if not (24 < x < W - 24 and 24 < y < H - 24):
            return False
        if any(point_in_poly(p, x, y) for p in excl):
            return False
        if dist_to_water[int(y), int(x)] < min_water_clear:
            return False
        return True

    # 3. cities: gazetteer px -> region, then snap the flagged ones to the art
    site_px = {s["id"]: s["px"] for s in gaz["sites"]}
    cities = {"heartholt": w2r(site_px["heartholt"])}
    for c in gaz["cities"]:
        if c["id"] in cfg["city_labels"]:
            cities[c["id"]] = w2r(c["px"])
    cities["city-15"] = detected["elmsworth"]  # city-15 IS Elmsworth (ruling 140)
    city_adjust = {}
    for cid, bank in cfg["river_snap_cities"].items():
        cities[cid] = bank_spot(550, bank, lo=6, hi=14)
        city_adjust[cid] = [round(v, 1) for v in r2w(cities[cid])]
    lake_edges = {}
    for lname, seed in cfg["lake_seeds"].items():
        comp = lab[seed[1], seed[0]]
        if comp:
            edge = (lab == comp) & ~ndimage.binary_erosion(lab == comp, iterations=2)
            ys2, xs2 = np.where(edge)
            lake_edges[lname] = np.column_stack([xs2, ys2])
    for cid, (lname, side) in cfg["lake_snap_cities"].items():
        pts = lake_edges[lname]
        pool = pts[pts[:, 0] < np.median(pts[:, 0])] if side == "west" else pts
        pool = pool[(pool[:, 1] > 40) & (pool[:, 1] < H - 40)]
        gx, gy = cities[cid]
        i = int(np.argmin((pool[:, 0] - gx) ** 2 + (pool[:, 1] - gy) ** 2))
        x, y = float(pool[i, 0]), float(pool[i, 1])
        # step onto land
        for d in range(4, 20, 2):
            if usable(x - d, y, 3):
                x -= d
                break
        cities[cid] = (x, y)
        city_adjust[cid] = [round(v, 1) for v in r2w(cities[cid])]
    city_pts = list(cities.values())
    withervale = detected["withervale"]
    print("city adjustments (world px):", city_adjust)

    def resolve(wp):
        return cities[wp[1:]] if isinstance(wp, str) and wp.startswith("@") else wp

    roads = [[resolve(p) for p in road] for road in cfg["roads"]]

    # 4. tributaries: meander + trail the tail onto the drawn river
    tribs = []
    for name, nation, mouth_km, ctrl in cfg["tributaries"]:
        mouth = bank_spot(mouth_km, "west" if nation == "thalendor" else "east", lo=0, hi=2)
        path = catmull(meander(list(ctrl) + [mouth], rng), steps=10)
        mx, my = snap_river(path[-1])
        path.append((mx, my))
        tribs.append({"id": name, "nation": nation, "mouth_km": mouth_km, "path": path})

    # 5. towns
    placed = []

    def spaced(x, y, min_d=18):
        if any(math.hypot(x - p["x"], y - p["y"]) < min_d for p in placed):
            return False
        if any(math.hypot(x - cx, y - cy) < 30 for cx, cy in city_pts):
            return False
        if math.hypot(x - withervale[0], y - withervale[1]) < 30:
            return False
        return True

    def try_place(x, y, driver, nation, min_water_clear=4, wild_ok=False):
        if not usable(x, y, min_water_clear):
            return False
        w = wildness(x, y)
        if w is not None and not wild_ok:
            if w < cfg["wild_halfwidth_px"]:
                return False
            if w < cfg["fort_band_px"][1] and driver != "fort":
                return False
        if side_of(border_path, x, y) != (-1 if nation == "thalendor" else 1):
            return False
        if not spaced(x, y):
            return False
        placed.append({"x": x, "y": y, "driver": driver, "nation": nation})
        return True

    def near_water_spot(cx, cy, tries=40, radius=14):
        for _ in range(tries):
            x = cx + rng.uniform(-radius, radius)
            y = cy + rng.uniform(-radius, radius)
            if 0 <= int(x) < W and 0 <= int(y) < H and 4 <= dist_to_water[int(y), int(x)] <= 11:
                return x, y
        return None

    budget = {n: {d: round(cfg["town_counts"][n] * f) for d, f in cfg["driver_mix"][n].items()}
              for n in cfg["town_counts"]}

    def fill(nation, driver, target, gen, cap=800):
        made, tries = 0, 0
        while made < target and tries < cap:
            tries += 1
            spot = gen()
            if spot and try_place(spot[0], spot[1], driver, nation):
                made += 1
        return made

    t_tribs = [t for t in tribs if t["nation"] == "thalendor"]
    c_tribs = [t for t in tribs if t["nation"] == "corvaine"]

    def water_gen(nation):
        def gen():
            roll = rng.random()
            if roll < 0.34:
                cx, cy = drawn_km(rng.uniform(40, 560))
            elif roll < 0.75:
                tr = rng.choice(t_tribs if nation == "thalendor" else c_tribs)
                cx, cy = tr["path"][rng.randrange(int(len(tr["path"]) * 0.1),
                                                  int(len(tr["path"]) * 0.85))]
            elif nation == "thalendor":
                pts = lake_edges[rng.choice(["great-lake", "sw-lake"])]
                cx, cy = pts[rng.randrange(len(pts))]
            else:
                cx, cy = drawn_km(rng.uniform(40, 560))
            return near_water_spot(cx, cy)
        return gen

    def road_gen():
        road = rng.choice(roads)
        path = catmull(road, steps=12) if len(road) > 2 else \
            [tuple(np.array(road[0]) * (1 - t) + np.array(road[1]) * t)
             for t in np.linspace(0, 1, 24)]
        cx, cy = path[rng.randrange(2, len(path) - 2)]
        return (cx + rng.uniform(-8, 8), cy + rng.uniform(-8, 8))

    def scatter_gen(x0, x1, y0, y1):
        return lambda: (rng.uniform(x0, x1), rng.uniform(y0, y1))

    hx, hy = cities["heartholt"]

    def ring_gen():
        ang = rng.uniform(0, 2 * math.pi)
        rad = rng.uniform(60, 140)
        return (hx + rad * math.cos(ang), hy + rad * math.sin(ang))

    def fort_gen(side):
        def gen():
            km = rng.uniform(cfg["wild_from_km"], 1350)
            cx, cy = drawn_km(km)
            d = rng.uniform(*cfg["fort_band_px"])
            x = cx - d if side == "west" else cx + d
            return (x, cy + rng.uniform(-25, 25))
        return gen

    # Thalendor
    fill("thalendor", "water", budget["thalendor"]["water"], water_gen("thalendor"))
    fill("thalendor", "junction", budget["thalendor"]["junction"], road_gen)
    fill("thalendor", "shrine", 6, ring_gen)
    fill("thalendor", "shrine", budget["thalendor"]["shrine"] - 6,
         scatter_gen(150, 1000, 350, 1250))
    made = 0
    while made < budget["thalendor"]["fort"]:
        g = fort_gen("west")()
        if g and usable(*g) and side_of(border_path, *g) == -1 and spaced(*g):
            w = wildness(*g)
            if w is None or w >= cfg["fort_band_px"][0]:
                placed.append({"x": g[0], "y": g[1], "driver": "fort", "nation": "thalendor"})
                made += 1
    fill("thalendor", "specialty", budget["thalendor"]["specialty"],
         lambda: (scatter_gen(180, 560, 380, 540)() if rng.random() < 0.3
                  else scatter_gen(120, 1000, 400, 1300)()))
    # Corvaine
    fill("corvaine", "water", budget["corvaine"]["water"], water_gen("corvaine"))
    fill("corvaine", "junction", budget["corvaine"]["junction"], road_gen)
    fill("corvaine", "shrine", budget["corvaine"]["shrine"], scatter_gen(950, 1360, 60, 1050))
    made = 0
    while made < budget["corvaine"]["fort"]:
        g = fort_gen("east")()
        if g and usable(*g) and side_of(border_path, *g) == 1 and spaced(*g):
            w = wildness(*g)
            if w is None or w >= cfg["fort_band_px"][0]:
                placed.append({"x": g[0], "y": g[1], "driver": "fort", "nation": "corvaine"})
                made += 1
    fill("corvaine", "specialty", budget["corvaine"]["specialty"],
         scatter_gen(950, 1360, 80, 1080))
    # top-up to totals
    for nation, total in cfg["town_counts"].items():
        have = sum(1 for p in placed if p["nation"] == nation)
        gen = scatter_gen(100, 1050, 300, 1330) if nation == "thalendor" \
            else scatter_gen(920, 1360, 60, 1100)
        fill(nation, "specialty", total - have, gen, cap=3000)

    print("placed:", {n: dict(Counter(p["driver"] for p in placed if p["nation"] == n))
                      for n in cfg["town_counts"]})

    # ------------------------------------------------------------- render ---
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    try:
        F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        Fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
    except OSError:
        F = Fs = ImageFont.load_default()

    def text_outlined(xy, s, font, fill=(255, 250, 235, 255)):
        x, y = xy
        for ox, oy in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1)):
            dr.text((x + ox, y + oy), s, font=font, fill=(20, 15, 5, 220))
        dr.text((x, y), s, font=font, fill=fill)

    label_boxes = []

    def label_at(x, y, s, font, side="right"):
        w = dr.textlength(s, font=font)
        lx = x + 18 if side == "right" else x - 18 - w
        lx = max(6, min(W - w - 6, lx))
        ly = y - 12
        for _ in range(8):  # nudge down out of collisions
            box = (lx, ly, lx + w, ly + 22)
            if not any(box[0] < b[2] and box[2] > b[0] and box[1] < b[3] and box[3] > b[1]
                       for b in label_boxes):
                break
            ly += 20
        label_boxes.append((lx, ly, lx + w, ly + 22))
        text_outlined((lx, ly), s, font)

    for cx, cy in ((30, 30), (W - 30, 30), (30, H - 30), (W - 30, H - 30), (W // 2, H // 2)):
        dr.line([(cx - 14, cy), (cx + 14, cy)], fill=(255, 255, 255, 180), width=2)
        dr.line([(cx, cy - 14), (cx, cy + 14)], fill=(255, 255, 255, 180), width=2)

    for road in roads:
        path = catmull(road, steps=12) if len(road) > 2 else road
        dr.line([tuple(map(int, p)) for p in path], fill=(230, 215, 180, 70), width=3)

    for t in tribs:
        dr.line([tuple(map(int, p)) for p in t["path"]], fill=(120, 165, 205, 170), width=4)
        mx, my = t["path"][-1]
        dr.ellipse([mx - 6, my - 6, mx + 6, my + 6], outline=(120, 165, 205, 230), width=2)
        sx, sy = t["path"][0]
        text_outlined((min(sx + 8, W - 40), sy - 10), t["id"].split("-")[1], Fs, (170, 200, 225, 255))

    for day in range(1, 14):
        km = day * cfg["barge_day_km"]
        if km > cfg["corridor_end_km"]:
            break
        x, y = drawn_km(km)
        dr.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 255, 255, 160))
        text_outlined((x + 6, y - 8), f"d{day}", Fs, (255, 255, 255, 210))
        label_boxes.append((x + 6, y - 8, x + 6 + dr.textlength(f"d{day}", font=Fs), y + 12))

    for p in placed:
        c = DRIVER_STYLE[p["driver"]]
        x, y = p["x"], p["y"]
        dr.ellipse([x - 5, y - 5, x + 5, y + 5], fill=c + (235,), outline=(25, 18, 8, 255), width=1)

    for km, bank, label in cfg["corridor_slots"]:
        x, y = bank_spot(km, bank)
        dr.ellipse([x - 8, y - 8, x + 8, y + 8], outline=(255, 250, 235, 255), width=3)
        label_at(x, y, label, Fs, "right" if bank == "east" else "left")

    for cid, (x, y) in cities.items():
        if cid == "heartholt":
            dr.ellipse([x - 16, y - 16, x + 16, y + 16], outline=(140, 220, 140, 120), width=2)
            continue
        label, side = cfg["city_labels"][cid]
        if cid in cfg["painted_cities"]:
            dr.ellipse([x - 18, y - 18, x + 18, y + 18], outline=(140, 220, 140, 130), width=2)
        else:
            d = 14
            dr.polygon([(x, y - d), (x + d, y), (x, y + d), (x - d, y)],
                       outline=(255, 250, 235, 255), width=3)
            dr.polygon([(x, y - 7), (x + 7, y), (x, y + 7), (x - 7, y)],
                       outline=(255, 250, 235, 200), width=2)
        label_at(x, y, label, F, side)
    dr.ellipse([detected["withervale"][0] - 20, detected["withervale"][1] - 20,
                detected["withervale"][0] + 20, detected["withervale"][1] + 20],
               outline=(140, 220, 140, 120), width=2)  # elmsworth/heartholt rings drawn above

    lx, ly = 28, 70
    dr.rounded_rectangle([lx - 12, ly - 14, lx + 320, ly + 216], radius=10, fill=(20, 15, 5, 175))
    text_outlined((lx, ly), "SETTLEMENT GUIDE — DRAFT", F)
    ly += 34
    for d, c in DRIVER_STYLE.items():
        dr.ellipse([lx, ly + 3, lx + 12, ly + 15], fill=c + (255,))
        text_outlined((lx + 20, ly), f"{d} town", Fs)
        ly += 24
    text_outlined((lx, ly), "◇ new city glyph · ○ named slot", Fs); ly += 24
    text_outlined((lx, ly), "blue lines: derived tributaries", Fs); ly += 24
    text_outlined((lx, ly), f"d1-d13 barge days · {km_per_region_px:.2f} km/px", Fs)

    ov.save(out_png)

    out = {
        "transform": {"scale_region_px_per_world_px": scale, "rotation_deg": rot,
                      "residuals_px": resid, "region_native_px": [W, H],
                      "anchors_region_px": {k: [round(v, 1) for v in p]
                                            for k, p in detected.items()}},
        "city_adjustments_world_px": city_adjust,
        "towns": [{"px": [round(v, 1) for v in r2w((p["x"], p["y"]))],
                   "region_px": [round(p["x"], 1), round(p["y"], 1)],
                   "nation": p["nation"], "driver": p["driver"]} for p in placed],
        "tributaries": [{"id": t["id"], "nation": t["nation"], "mouth_km": t["mouth_km"],
                         "polyline_world": [[round(v, 1) for v in r2w(p)]
                                            for p in t["path"][::4]]}
                        for t in tribs],
    }
    json.dump(out, open(out_json, "w"), indent=1)
    print(f"wrote {out_png} and {out_json}")


if __name__ == "__main__":
    main()
