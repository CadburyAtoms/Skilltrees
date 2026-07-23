#!/usr/bin/env python3
"""region_overlay.py — build a region-map settlement overlay (rulings 150-157).

The region-forge workflow tool, first run against Ben's Palewater region canvas:
  1. detect the painted anchor glyphs on the region export and solve the
     world->region similarity transform (never eyeball the alignment);
  2. classify the drawn water and snap every river-adjacent placement to Ben's
     actual painted channel (the freehand art deviates from the world trace);
  3. sketch the derived tributary guides — hydrology rules: sources on high
     ground NORTH/uphill of their mouths (no barbed confluences), courses
     descend into the river, dendritic forks, the great lake gets inflows;
  4. place driver-tagged market towns per the ruling-155 per-nation mixes
     (seeded -> deterministic re-runs), in the ruling-157 exogeneity order
     (water -> specialty -> fort -> shrine -> junction) with per-nation
     spacing DERIVED from gazetteer meta.settlement_dials (2/3 x the dominant
     farm-to-market mode's day-rate — the one-day-return market rule).
     Junction towns are NOT sampled along roads: the road graph is DERIVED
     from the settlements (MST + k-nearest lattice + backbone seeds), and
     junction towns sit at true crossings — road x road, road x water
     (bridge/ferry), confluences;
  5. render a full-canvas transparent PNG guide layer for Procreate insertion,
     plus a JSON sidecar of every placement (world px) for the gazetteer commit.

Region-specific facts (anchors, corridor kms, exclusion art, driver mixes) live in
CONFIG; the machinery below it is region-agnostic and moves into the region-forge
skill as-is.
"""

import json
import math
import random
import sys
from collections import Counter
from itertools import combinations
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]

CONFIG = {
    "map_json": ROOT / "source-materials/maps/thyrcross.map.json",
    "seed": 143,  # fixed pre-renumber id; placements are seed-deterministic, never change
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
    "city_labels": {
        "city-15": ("Elmsworth ~18k (painted)", "right"),
        "city-30": ("city-30 · ferry port ~12k", "left"),
        "city-31": ("city-31 · ferry twin ~15k", "right"),
        "city-32": ("city-32 · lakeshore ~12k ⚑", "right"),
        "city-33": ("city-33 · west door ~10k ⚑", "right"),
        "city-36": ("city-36 · crossroads ~12k ⚑", "left"),
    },
    "painted_cities": {"city-15"},
    "river_snap_cities": {"city-30": "west", "city-31": "east"},
    "lake_snap_cities": {"city-32": ("great-lake", "west")},
    "corridor_slots": [
        (140, "west", "slot · km 140"),
        (300, "west", "slot · km 300"),
        (430, "west", "slot · km 430"),
        (250, "east", "slot · km 250"),
        (430, "east", "slot · km 430"),
    ],
    # Tributaries (audit 2026-07-22): every source sits NORTH/uphill of its mouth
    # (the river flows N->S, so a confluence must open downstream); courses descend
    # across their basin instead of running parallel to the river; forks give
    # dendritic structure. T5 is the settled-band addition (mouth ~km 350) so the
    # busy reach has a working confluence. Mouths in the wild corridor are scenic.
    "tributaries": [
        ("trib-T1", "thalendor", 180, [(310, 300), (480, 390), (650, 445)],
         [[(560, 300), (585, 395)]]),
        ("trib-T5", "thalendor", 350, [(520, 380), (720, 470), (900, 520)],
         []),
        ("trib-T2", "thalendor", 500, [(560, 470), (820, 540), (1020, 575)],
         [[(700, 430), (830, 520)]]),
        ("trib-T3", "thalendor", 870, [(660, 740), (830, 790), (960, 800)],
         [[(760, 660), (860, 770)]]),
        ("trib-T4", "thalendor", 1300, [(700, 1060), (900, 1090), (1060, 1080)],
         [[(820, 980), (930, 1080)]]),
        ("trib-C1", "corvaine", 250, [(1360, 430), (1150, 470)],
         [[(1290, 330), (1230, 450)]]),
        ("trib-C2", "corvaine", 650, [(1360, 700), (1240, 720)],
         []),
        ("trib-C3", "corvaine", 1100, [(1360, 1010), (1240, 980)],
         []),
    ],
    # Short streams feeding the great lake from the Vorsk fringe (a lake with an
    # outflow needs inflows). They terminate on the lake edge, not the river.
    "lake_inflows": [
        [(350, 118), (520, 130)],
        [(620, 60), (700, 95)],
    ],
    # Ruling-151/152 national density laws (km2 per market town). The frame gets
    # its SHARE of the national roster: in-frame usable land / km2_per_town —
    # never the whole national count. town_counts is a manual override dial
    # (None = derive).
    "km2_per_town": {"thalendor": 5700, "corvaine": 2900},
    "town_counts": None,
    "driver_mix": {
        "thalendor": {"water": 0.35, "shrine": 0.25, "specialty": 0.20, "junction": 0.10, "fort": 0.10},
        "corvaine": {"water": 0.25, "shrine": 0.10, "specialty": 0.20, "junction": 0.30, "fort": 0.15},
    },
    # Backbone road seeds only (Ben's drawn route + off-frame exits). The rest of
    # the road graph is derived from the settlements.
    "roads": [
        ["@city-15", "@heartholt"],
        ["@heartholt", "@city-30"],
        ["@city-15", "@city-32"],
        ["@heartholt", (240, 700), "@city-33"],
        ["@city-31", "@city-36"],
        ["@city-36", (1330, 0)],
        ["@city-36", (1384, 520)],
    ],
    "lattice_k": {"thalendor": 2, "corvaine": 3},   # forest tracks vs road lattice
    "max_road_km": 120,
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
            continue
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
    """Subdivide and push midpoints sideways. High-frequency jitter plus one
    low-frequency wander scaled to course length, so long reaches actually
    swing instead of reading as rulers (audit fix #3)."""
    dense = []
    for i in range(len(ctrl) - 1):
        a, b = np.array(ctrl[i], float), np.array(ctrl[i + 1], float)
        n = max(2, int(np.linalg.norm(b - a) // 55))
        for s in range(n):
            dense.append(a + (b - a) * (s / n))
    dense.append(np.array(ctrl[-1], float))
    total = sum(np.linalg.norm(dense[i + 1] - dense[i]) for i in range(len(dense) - 1))
    big_amp = min(28.0, 6.0 + total * 0.045)
    phase = rng.uniform(0, 2 * math.pi)
    out = []
    for i, p in enumerate(dense):
        if 0 < i < len(dense) - 1:
            d = dense[i + 1] - dense[i - 1]
            L = np.linalg.norm(d) or 1
            perp = np.array([-d[1], d[0]]) / L
            frac = i / (len(dense) - 1)
            lowf = big_amp * math.sin(2.2 * math.pi * frac + phase) * math.sin(math.pi * frac)
            hif = rng.uniform(*wiggle) * (1 if i % 2 else -1)
            p = p + perp * (lowf + hif)
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


def seg_intersect(p1, p2, p3, p4):
    """Intersection point of segments p1p2 and p3p4, or None."""
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den
    if 0.02 < t < 0.98 and 0.02 < u < 0.98:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None


def seg_polyline_intersections(a, b, path, step=1):
    hits = []
    for i in range(0, len(path) - step, step):
        p = seg_intersect(a, b, path[i], path[i + step])
        if p:
            hits.append(p)
    return hits


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

    # 2. water + the DRAWN main channel
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
        x, y = snap_river(w2r(at_km(km)))
        win = 6
        ys2, xs2 = np.where(water[int(y) - win:int(y) + win, int(x) - win:int(x) + win])
        if len(xs2):
            return (float(xs2.mean() + x - win), float(ys2.mean() + y - win))
        return (x, y)

    # --- west-bank truth (Ben 2026-07-22): this export PREDATES the final
    # ruling-153 narrowing — the drawn channel is stale-wide and only its WEST
    # bank is right. Derive the true channel hugging the west bank (right bank
    # facing downstream = Thalendor), erase the stale river from the water mask,
    # paint the narrow true band in, and snap EVERYTHING to that. The rendered
    # band doubles as Ben's repaint guide.
    def _true_w_px(km):
        # ruling-153 true width 0.3->1.1 km; region maps draw ~3-4x over-width
        return 2.0 + 4.0 * min(1.0, km / cfg["corridor_end_km"])

    END = cfg["corridor_end_km"]

    # march west (right bank facing downstream) at 4-km resolution; tight
    # meander hairpins alias the march, so median-filter then smooth
    raw = []
    for km in range(0, END + 1, 4):
        # direction from the WORLD TRACE (smooth, truly downstream — the drawn
        # centroid path wiggles and mis-aims the march in hairpins)
        a = w2r(at_km(max(0, km - 10)))
        b = w2r(at_km(min(END, km + 10)))
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        wx, wy = -dy / L, dx / L
        # ray-scan west from the RAW trace point (snapping first pulls the
        # start into stale side-lobes): west bank = far edge of the first
        # substantial water run along the ray
        x, y = w2r(at_km(km))
        t, seen_water, edge = 0.0, 0, None
        while t < 110:
            xi, yi = int(x + wx * t), int(y + wy * t)
            if not (0 <= xi < W and 0 <= yi < H):
                break
            if water[yi, xi]:
                seen_water += 1
            elif seen_water >= 3:
                edge = t
                break
            elif t > 45 and seen_water == 0:
                break  # no channel west of this sample — bridge it
            t += 1
        if edge is None:
            raw.append(None)
        else:
            half = _true_w_px(km) / 2
            raw.append((x + wx * (edge - half), y + wy * (edge - half)))

    # continuity filter: a marched point jumping >26 px from its neighbor is a
    # hairpin mis-march (wrong-bank hit) — drop it and bridge the gap
    filt = [raw[0]]
    for p in raw[1:]:
        prev = filt[-1]
        if p is None or (prev is not None
                         and math.hypot(p[0] - prev[0], p[1] - prev[1]) > 26):
            filt.append(None)
        else:
            filt.append(p)
    first = next(i for i, p in enumerate(filt) if p is not None)
    for k in range(first):
        filt[k] = filt[first]
    i = 0
    while i < len(filt):
        if filt[i] is None:
            j = i
            while j < len(filt) and filt[j] is None:
                j += 1
            a = filt[i - 1]
            b = filt[j] if j < len(filt) else a
            for k in range(i, j):
                f = (k - i + 1) / (j - i + 1)
                filt[k] = (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
            i = j
        i += 1

    def _med(vals):
        s = sorted(vals)
        return s[len(s) // 2]

    pts = [( _med([p[0] for p in filt[max(0, i - 3):i + 4]]),
             _med([p[1] for p in filt[max(0, i - 3):i + 4]]) )
           for i in range(len(filt))]

    # validation: the spine hugs a bank of the stale water by definition — a
    # point far from stale water is a mis-march across a meander tongue. Reject
    # and re-bridge (dist transform of the pre-erase mask).
    stale_dist = ndimage.distance_transform_edt(~water)
    for i, p in enumerate(pts):
        xi, yi = int(min(max(p[0], 0), W - 1)), int(min(max(p[1], 0), H - 1))
        if stale_dist[yi, xi] > 10:
            pts[i] = None
    i = 0
    while i < len(pts):
        if pts[i] is None:
            j = i
            while j < len(pts) and pts[j] is None:
                j += 1
            a = pts[i - 1] if i else (pts[j] if j < len(pts) else (0, 0))
            b = pts[j] if j < len(pts) else a
            for k in range(i, j):
                f = (k - i + 1) / (j - i + 1)
                pts[k] = (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
            i = j
        i += 1

    true_dense = [(sum(p[0] for p in pts[max(0, i - 2):i + 3]) / len(pts[max(0, i - 2):i + 3]),
                   sum(p[1] for p in pts[max(0, i - 2):i + 3]) / len(pts[max(0, i - 2):i + 3]))
                  for i in range(len(pts))]
    ch_true = [true_dense[min(len(true_dense) - 1, k // 4)]
               for k in range(0, END + 1, 20)]

    # erase the stale channel (river pixels near the true line, past the lake
    # outflow reach), then paint the narrow band
    dense = [(p[0], p[1], i * 4) for i, p in enumerate(true_dense)]
    dtree = cKDTree([(p[0], p[1]) for p in dense])
    dense_km = np.array([p[2] for p in dense])
    rpix = np.column_stack([rxs, rys])
    dd, ii = dtree.query(rpix)
    erase = (dd < 80) & (dense_km[ii] > 80)
    water = water.copy()
    water[rys[erase], rxs[erase]] = False
    band = Image.new("L", (W, H), 0)
    bd = ImageDraw.Draw(band)
    for x, y, km in dense:
        r = _true_w_px(km) / 2
        bd.ellipse([x - r, y - r, x + r, y + r], fill=255)
    water |= np.asarray(band) > 0
    dist_to_water = ndimage.distance_transform_edt(~water)
    bys, bxs = np.nonzero(np.asarray(band) > 0)
    rxs, rys = bxs, bys
    rtree = cKDTree(np.column_stack([rxs, rys]))  # snap_river now = true band

    def drawn_km(km):  # redefined: interpolate the TRUE channel (4-km steps)
        i = min(len(true_dense) - 1.001, km / 4)
        lo = int(i)
        f = i - lo
        return (true_dense[lo][0] + f * (true_dense[lo + 1][0] - true_dense[lo][0]),
                true_dense[lo][1] + f * (true_dense[lo + 1][1] - true_dense[lo][1]))

    ch_drawn = ch_true
    border_path = [(920, -10), (900, 120), (840, 230)] + ch_drawn

    nat_polys = {n["id"]: n["polygon"] for n in gaz["nations"] if "polygon" in n}

    def nation_at(x, y):
        """Bank rule beats the coarse polygons near the river; polygons decide
        elsewhere; the extended border path covers the lake seam (audit fix #10)."""
        d, i = poly_distance(ch_drawn, x, y)
        if d < 30:
            (x1, y1), (x2, y2) = ch_drawn[i], ch_drawn[i + 1]
            cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
            return "thalendor" if cross > 0 else "corvaine"
        wx, wy = r2w((x, y))
        if point_in_poly(nat_polys["thalendor"], wx, wy):
            return "thalendor"
        if point_in_poly(nat_polys["corvaine"], wx, wy):
            return "corvaine"
        _, i = poly_distance(border_path, x, y)
        (x1, y1), (x2, y2) = border_path[i], border_path[i + 1]
        cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
        return "thalendor" if cross > 0 else "corvaine"

    def wildness(x, y):
        d, i = poly_distance(ch_drawn, x, y)
        return d if i * 20 >= cfg["wild_from_km"] else None

    def bank_spot(km, bank, lo=5, hi=12):
        cx, cy = drawn_km(km)
        want = "thalendor" if bank == "west" else "corvaine"
        for d in range(6, 40, 2):
            for ang in np.linspace(0, 2 * math.pi, 16, endpoint=False):
                x, y = cx + d * math.cos(ang), cy + d * math.sin(ang)
                if not (0 <= int(x) < W and 0 <= int(y) < H):
                    continue
                if lo <= dist_to_water[int(y), int(x)] <= hi and nation_at(x, y) == want:
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

    # 3. cities
    site_px = {s["id"]: s["px"] for s in gaz["sites"]}
    cities = {"heartholt": w2r(site_px["heartholt"])}
    for c in gaz["cities"]:
        if c["id"] in cfg["city_labels"]:
            cities[c["id"]] = w2r(c["px"])
    cities["city-15"] = detected["elmsworth"]  # city-15 IS Elmsworth (ruling 151)
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

    backbone = [[resolve(p) for p in road] for road in cfg["roads"]]

    # 4. tributaries: descending courses, forks, mouths on the drawn river
    tribs = []
    for name, nation, mouth_km, ctrl, forks in cfg["tributaries"]:
        mouth = bank_spot(mouth_km, "west" if nation == "thalendor" else "east", lo=0, hi=2)
        path = catmull(meander(list(ctrl) + [mouth], rng), steps=10)
        path.append(snap_river(path[-1]))
        fork_paths = []
        for fc in forks:
            # fork tail joins the nearest point on the parent course
            tail = min(path, key=lambda p: math.hypot(p[0] - fc[-1][0], p[1] - fc[-1][1]))
            fork_paths.append(catmull(meander(list(fc) + [tail], rng, wiggle=(4, 9)), steps=8))
        tribs.append({"id": name, "nation": nation, "mouth_km": mouth_km,
                      "path": path, "forks": fork_paths})
    lake_streams = []
    for ctrl in cfg["lake_inflows"]:
        pts = lake_edges["great-lake"]
        i = int(np.argmin((pts[:, 0] - ctrl[-1][0]) ** 2 + (pts[:, 1] - ctrl[-1][1]) ** 2))
        tail = (float(pts[i, 0]), float(pts[i, 1]))
        lake_streams.append(catmull(meander(list(ctrl) + [tail], rng, wiggle=(4, 9)), steps=8))

    trib_pts = [p for t in tribs for p in t["path"]]
    tribtree = cKDTree(np.array(trib_pts))
    mtn_edge = []
    for poly in excl:
        for i in range(len(poly)):
            a, b = np.array(poly[i], float), np.array(poly[(i + 1) % len(poly)], float)
            for s in range(0, int(np.linalg.norm(b - a)), 12):
                mtn_edge.append(a + (b - a) * (s / max(1, np.linalg.norm(b - a))))
    mtntree = cKDTree(np.array(mtn_edge))

    # 5. towns — non-junction drivers first; the road graph derives from them.
    # Spacing is DERIVED per nation (ruling 157): meta.settlement_dials carries
    # market_spacing_km = 2/3 x the dominant farm-to-market mode's day-rate
    # (draft_animal is Ben's tunable dial — retune it, re-derive, re-run).
    dials = {n: d for n, d in gaz["meta"]["settlement_dials"].items()
             if not n.startswith("_")}
    spacing_px = {n: d["market_spacing_km"] / km_per_region_px for n, d in dials.items()}
    JUNCTION_F = 0.78  # junctions sit at forced crossings — tighter tolerance
    RELAX_F = 0.72     # per-driver top-up refills
    print("derived spacing px:", {n: round(v, 1) for n, v in spacing_px.items()})
    placed = []

    def spaced(x, y, min_d):
        if any(math.hypot(x - p["x"], y - p["y"]) < min_d for p in placed):
            return False
        if any(math.hypot(x - cx, y - cy) < 30 for cx, cy in city_pts):
            return False
        if math.hypot(x - withervale[0], y - withervale[1]) < 30:
            return False
        return True

    def try_place(x, y, driver, nation, min_water_clear=4, wild_ok=False, min_d=None):
        if min_d is None:
            min_d = spacing_px[nation]
        if not usable(x, y, min_water_clear):
            return False
        w = wildness(x, y)
        if w is not None and not wild_ok:
            if w < cfg["wild_halfwidth_px"]:
                return False
            if w < cfg["fort_band_px"][1] and driver != "fort":
                return False
        if nation_at(x, y) != nation:
            return False
        if not spaced(x, y, min_d):
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

    # In-frame town budget = in-frame usable land / the national km2-per-town
    # density law (rulings 151/152) — the frame's SHARE of the national roster.
    # Usable = not water, not the mountain exclusion, not the hard wild band.
    if cfg["town_counts"]:
        counts = dict(cfg["town_counts"])
    else:
        step = 8
        tally = Counter()
        for yy in range(12, H - 12, step):
            for xx in range(12, W - 12, step):
                if water[yy, xx]:
                    continue
                if any(point_in_poly(p, xx, yy) for p in excl):
                    continue
                wz = wildness(xx, yy)
                if wz is not None and wz < cfg["wild_halfwidth_px"]:
                    continue
                tally[nation_at(xx, yy)] += 1
        cell_km2 = (step * km_per_region_px) ** 2
        counts = {n: round(tally[n] * cell_km2 / cfg["km2_per_town"][n])
                  for n in cfg["km2_per_town"]}
        print("in-frame usable km2:", {n: round(tally[n] * cell_km2) for n in tally},
              "-> derived town counts:", counts,
              f"(national ~200/~280; dial: km2_per_town)")
    budget = {n: {d: round(counts[n] * f) for d, f in cfg["driver_mix"][n].items()}
              for n in counts}

    def fill(nation, driver, target, gen, cap=800, min_d=None):
        made, tries = 0, 0
        while made < target and tries < cap:
            tries += 1
            spot = gen()
            if spot and try_place(spot[0], spot[1], driver, nation, min_d=min_d):
                made += 1
        return made

    t_tribs = [t for t in tribs if t["nation"] == "thalendor"]
    c_tribs = [t for t in tribs if t["nation"] == "corvaine"]

    def water_gen(nation):
        """Confluence-premium (audit fix #6): mouths first, then lower courses,
        then main-river bank / lakeshore."""
        my_tribs = t_tribs if nation == "thalendor" else c_tribs
        settled_mouths = [t for t in my_tribs if t["mouth_km"] < cfg["wild_from_km"]]
        def gen():
            roll = rng.random()
            if roll < 0.25 and settled_mouths:
                t = rng.choice(settled_mouths)
                cx, cy = t["path"][-1]
            elif roll < 0.60:
                t = rng.choice(my_tribs)
                path = t["path"]
                cx, cy = path[rng.randrange(int(len(path) * 0.55), int(len(path) * 0.98))]
            elif roll < 0.80 or nation == "corvaine":
                cx, cy = drawn_km(rng.uniform(40, 560))
            else:
                pts = lake_edges[rng.choice(list(lake_edges))]
                cx, cy = pts[rng.randrange(len(pts))]
            return near_water_spot(cx, cy)
        return gen

    def trib_distance(x, y):
        d, _ = tribtree.query([x, y])
        return d

    def specialty_gen(nation):
        """Feature-anchored (audit fix #7): mines hug the mountain fringe,
        mills/vineyards hug tributaries and lake shores; plains fallback."""
        def gen():
            roll = rng.random()
            if nation == "thalendor" and roll < 0.35:
                base = mtn_edge[rng.randrange(len(mtn_edge))]
                x = base[0] + rng.uniform(0, 45)
                y = base[1] + rng.uniform(0, 45)
                return (x, y)
            if roll < 0.75:
                p = trib_pts[rng.randrange(len(trib_pts))]
                x = p[0] + rng.uniform(-16, 16)
                y = p[1] + rng.uniform(-16, 16)
                if dist_to_water[int(min(max(y, 0), H - 1)), int(min(max(x, 0), W - 1))] >= 4:
                    return (x, y)
                return None
            if nation == "thalendor":
                return (rng.uniform(120, 1000), rng.uniform(400, 1300))
            return (rng.uniform(950, 1360), rng.uniform(80, 1080))
        return gen

    def shrine_gen(nation):
        """Remote groves (audit fix #7): best-of-N most-isolated interior spot.
        This is what keeps the deep interior empty-except-shrines true."""
        def gen():
            best, best_iso = None, -1
            for _ in range(6):
                if nation == "thalendor":
                    x, y = rng.uniform(120, 1020), rng.uniform(330, 1300)
                else:
                    x, y = rng.uniform(950, 1360), rng.uniform(60, 1050)
                iso = min(dist_to_water[int(y), int(x)], trib_distance(x, y),
                          min((math.hypot(x - cx, y - cy) for cx, cy in city_pts)))
                if iso > best_iso:
                    best_iso, best = iso, (x, y)
            return best
        return gen

    def fort_gen(side):
        def gen():
            km = rng.uniform(cfg["wild_from_km"], 1350)
            cx, cy = drawn_km(km)
            d = rng.uniform(*cfg["fort_band_px"])
            x = cx - d if side == "west" else cx + d
            return (x, cy + rng.uniform(-25, 25))
        return gen

    # Ruling-157 placement order: descending exogeneity. Water and specialty are
    # pinned by immovable geography (the confluence, the ore body) and feed the
    # road graph; forts third so they can guard things that exist; shrines
    # fourth because remoteness is computed against everything already placed;
    # junctions last by definition (stage 6 — the derived road graph).
    shortfalls = {}
    for nation in ("thalendor", "corvaine"):
        side = "west" if nation == "thalendor" else "east"
        n_water = fill(nation, "water", budget[nation]["water"], water_gen(nation))
        n_spec = fill(nation, "specialty", budget[nation]["specialty"], specialty_gen(nation))
        made = 0
        cap = 0
        while made < budget[nation]["fort"] and cap < 800:
            cap += 1
            g = fort_gen(side)()
            if g and usable(*g) and nation_at(*g) == nation and spaced(*g, spacing_px[nation]):
                w = wildness(*g)
                if w is None or w >= cfg["fort_band_px"][0]:
                    placed.append({"x": g[0], "y": g[1], "driver": "fort", "nation": nation})
                    made += 1
        n_shr = fill(nation, "shrine", budget[nation]["shrine"], shrine_gen(nation))
        shortfalls[nation] = {"water": budget[nation]["water"] - n_water,
                              "fort": budget[nation]["fort"] - made,
                              "specialty": budget[nation]["specialty"] - n_spec,
                              "shrine": budget[nation]["shrine"] - n_shr}

    # 6. derived road graph + junction towns (audit fixes #1/#5)
    def build_graph(nation, k):
        nodes = [(p["x"], p["y"]) for p in placed if p["nation"] == nation]
        for cid, pt in cities.items():
            if nation_at(*pt) == nation:  # ferry twins resolve by bank rule
                nodes.append(pt)
        # MST (Prim)
        edges = []
        if len(nodes) > 1:
            intree = {0}
            while len(intree) < len(nodes):
                best = None
                for i in intree:
                    for j in range(len(nodes)):
                        if j in intree:
                            continue
                        d = math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1])
                        if best is None or d < best[0]:
                            best = (d, i, j)
                intree.add(best[2])
                edges.append((best[1], best[2]))
        # k-nearest lattice
        max_edge = cfg["max_road_km"] / km_per_region_px
        eset = {tuple(sorted(e)) for e in edges}
        for i in range(len(nodes)):
            ds = sorted(((math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]), j)
                         for j in range(len(nodes)) if j != i))
            for d, j in ds[:k]:
                if d <= max_edge:
                    eset.add(tuple(sorted((i, j))))
        # roads do not cross painted water (river, lakes) except at the ferry pair
        ferry = {cities["city-30"], cities["city-31"]}
        def wet(a, b):
            n = max(2, int(math.hypot(b[0] - a[0], b[1] - a[1]) // 8))
            for s in range(1, n):
                x = a[0] + (b[0] - a[0]) * s / n
                y = a[1] + (b[1] - a[1]) * s / n
                if 0 <= int(x) < W and 0 <= int(y) < H and water[int(y), int(x)]:
                    return True
            return False
        kept = []
        for i, j in eset:
            a, b = nodes[i], nodes[j]
            if wet(a, b) and a not in ferry and b not in ferry:
                continue
            kept.append((a, b))
        return nodes, kept

    backbone_edges = []
    for road in backbone:
        for i in range(len(road) - 1):
            backbone_edges.append((road[i], road[i + 1]))
    ferry_edge = (cities["city-30"], cities["city-31"])

    def place_junctions(nation, target, k):
        nodes, edges = graphs[nation]
        all_edges = edges + [(a, b) for a, b in backbone_edges
                             if nation_at(*a) == nation or nation_at(*b) == nation]
        cand = []
        for e1, e2 in combinations(all_edges, 2):
            if set(map(tuple, e1)) & set(map(tuple, e2)):
                continue
            p = seg_intersect(e1[0], e1[1], e2[0], e2[1])
            if p:
                cand.append((p, 3.0, "road-x-road"))
        for a, b in all_edges:
            for t in tribs:
                for p in seg_polyline_intersections(a, b, t["path"], step=2):
                    cand.append((p, 2.5, "bridge"))
        for t in tribs:
            if t["nation"] == nation and t["mouth_km"] < cfg["wild_from_km"]:
                cand.append((t["path"][-1], 2.0, "mouth"))
            for f in t["forks"]:
                cand.append((f[-1], 1.5, "confluence"))
        rng.shuffle(cand)
        cand.sort(key=lambda c: -c[1])
        made = 0
        for p, score, kind in cand:
            if made >= target:
                break
            x, y = p
            # tributaries are guide lines, not painted water — a bridge town sits
            # right at the crossing; a mouth town prefers the painted riverbank
            spot = (near_water_spot(x, y) or (x, y)) if kind == "mouth" else (x, y)
            if try_place(spot[0], spot[1], "junction", nation,
                         min_d=JUNCTION_F * spacing_px[nation]):
                made += 1
        return made

    # shortfall densifies the lattice (k+1, k+2) instead of scattering (audit §D)
    graphs = {}
    for nation in ("thalendor", "corvaine"):
        need = budget[nation]["junction"]
        made = 0
        for k in range(cfg["lattice_k"][nation], cfg["lattice_k"][nation] + 3):
            graphs[nation] = build_graph(nation, k)
            made += place_junctions(nation, need - made, k)
            if made >= need:
                break
        shortfalls[nation]["junction"] = need - made

    # 7. per-driver top-up with relaxed spacing — the mix is preserved, and a
    # driver that still can't fill is REPORTED, not papered over (audit fix #4)
    gens = {"water": water_gen, "specialty": specialty_gen, "shrine": shrine_gen}
    for nation, defs in shortfalls.items():
        for driver, deficit in list(defs.items()):
            if deficit <= 0 or driver not in gens:
                continue
            got = fill(nation, driver, deficit, gens[driver](nation), cap=1500,
                       min_d=RELAX_F * spacing_px[nation])
            defs[driver] = deficit - got
    remaining = {n: {d: v for d, v in defs.items() if v > 0} for n, defs in shortfalls.items()}
    print("mix:", {n: dict(Counter(p["driver"] for p in placed if p["nation"] == n))
                   for n in counts})
    if any(remaining.values()):
        print("UNFILLED (signal, not scatter):", remaining)

    # ------------------------------------------------------------- render ---
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    for bold, reg in (("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                       "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
                      ("C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf")):
        try:
            F = ImageFont.truetype(bold, 20)
            Fs = ImageFont.truetype(reg, 15)
            break
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
        for _ in range(8):
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

    # derived roads: MST-ish graph faint, backbone a touch stronger
    for nation in graphs:
        for a, b in graphs[nation][1]:
            dr.line([tuple(map(int, a)), tuple(map(int, b))], fill=(230, 215, 180, 40), width=2)
    for a, b in backbone_edges + [ferry_edge]:
        dr.line([tuple(map(int, a)), tuple(map(int, b))], fill=(230, 215, 180, 80), width=3)

    # the narrowed true channel — Ben's repaint guide (west bank = truth).
    # Chunked polylines with curve joints: per-segment strokes leave arrowhead
    # blobs at sharp direction changes in the meander reaches.
    n3 = len(true_dense) // 3
    for chunk, wpx in ((true_dense[:n3 + 1], 3),
                       (true_dense[n3:2 * n3 + 1], 4),
                       (true_dense[2 * n3:], 5)):
        dr.line([tuple(map(int, p)) for p in chunk],
                fill=(110, 160, 210, 185), width=wpx, joint="curve")

    for t in tribs:
        dr.line([tuple(map(int, p)) for p in t["path"]], fill=(120, 165, 205, 170), width=4)
        for f in t["forks"]:
            dr.line([tuple(map(int, p)) for p in f], fill=(120, 165, 205, 130), width=3)
        mx, my = t["path"][-1]
        dr.ellipse([mx - 6, my - 6, mx + 6, my + 6], outline=(120, 165, 205, 230), width=2)
        sx, sy = t["path"][0]
        text_outlined((min(sx + 8, W - 40), sy - 10), t["id"].split("-")[1], Fs, (170, 200, 225, 255))
    for s in lake_streams:
        dr.line([tuple(map(int, p)) for p in s], fill=(120, 165, 205, 130), width=3)

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
    dr.ellipse([withervale[0] - 20, withervale[1] - 20, withervale[0] + 20, withervale[1] + 20],
               outline=(140, 220, 140, 120), width=2)

    lx, ly = 28, 70
    dr.rounded_rectangle([lx - 12, ly - 14, lx + 356, ly + 322], radius=10, fill=(20, 15, 5, 175))
    text_outlined((lx, ly), "SETTLEMENT GUIDE — DRAFT 4 · r157", F)
    ly += 34
    for d, c in DRIVER_STYLE.items():
        dr.ellipse([lx, ly + 3, lx + 12, ly + 15], fill=c + (255,))
        text_outlined((lx + 20, ly), f"{d} town", Fs)
        ly += 24
    text_outlined((lx, ly), "◇ new city glyph · ○ named slot", Fs); ly += 24
    text_outlined((lx, ly), "blue spine: narrowed Palewater (repaint", Fs); ly += 20
    text_outlined((lx, ly), "  guide — west bank = truth, r153)", Fs); ly += 24
    text_outlined((lx, ly), "blue: tributaries (forks + lake inflows)", Fs); ly += 24
    text_outlined((lx, ly), "tan: derived road graph", Fs); ly += 24
    spc = " / ".join(f"{n[0].upper()} {dials[n]['market_spacing_km']} km" for n in sorted(dials))
    text_outlined((lx, ly), f"derived spacing: {spc}", Fs); ly += 24
    text_outlined((lx, ly), f"d1-d13 barge days · {km_per_region_px:.2f} km/px", Fs)

    ov.save(out_png)

    out = {
        "transform": {"scale_region_px_per_world_px": scale, "rotation_deg": rot,
                      "residuals_px": resid, "region_native_px": [W, H],
                      "anchors_region_px": {k: [round(v, 1) for v in p]
                                            for k, p in detected.items()}},
        "city_adjustments_world_px": city_adjust,
        "unfilled": remaining,
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
