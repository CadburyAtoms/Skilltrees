#!/usr/bin/env python3
"""world_settlement.py — the region-forge derivation at WORLD scale (ruling 157).

Runs the ruling-150/155/157 settlement pipeline over the full Thyrcross canvas
for every nation whose settlement dials are RULED (gazetteer meta.settlement_dials
— currently Thalendor + Corvaine, rulings 151/152/157). Nations without dials are
skipped loudly: their dials are invented world-content behind Ben's gate.

Method per nation:
  count   = usable land km2 / km2_per_town (the national density law)
  spacing = market_spacing_km from the dial (2/3 x dominant-mode day-rate)
  order   = water -> specialty -> fort -> shrine -> junction (exogeneity, r157)
  seeds   = already-placed towns (the Palewater region draft) are FIXED, credited
            against the national quota, and enforce spacing on newcomers.

Usage:
  python scripts/map/world_settlement.py <seed-sidecar.json|-> <out-overlay.png> <out-sidecar.json>
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
    "rivers_png": ROOT / "source-materials/maps/thyrcross-rivers.png",
    "base_png": ROOT / "source-materials/maps/thyrcross.png",
    "seed": 157,
    # dialed nations only — every nation in meta.settlement_dials runs; ashkar +
    # sylvaneth are deferred by ruling (no dial entry -> skipped loudly)
    "nations": ["thalendor", "corvaine", "malcurr", "lunavar", "goldenport",
                "canticle", "vorsk", "kettavar"],
    "driver_mix": {                          # ruling 155 mixes for the walked two;
        "thalendor": {"water": 0.35, "shrine": 0.25, "specialty": 0.20, "junction": 0.10, "fort": 0.10},
        "corvaine": {"water": 0.25, "shrine": 0.10, "specialty": 0.20, "junction": 0.30, "fort": 0.15},
    },                                       # others carry driver_mix in their dial
    "lattice_k": {"thalendor": 2, "corvaine": 3, "malcurr": 3, "lunavar": 2,
                  "goldenport": 3, "canticle": 3, "vorsk": 2, "kettavar": 2},
    "max_road_km": 120,
    # Palewater wild corridor (ruling 154/156): km 620-1444 along border-river,
    # hard suppression within ~35 km, fort band 35-100 km (world px below)
    "wild_from_km": 620,
    "wild_to_km": 1444,
    "wild_hard_px": 22,
    "fort_band_px": (22, 63),
    "channel_origin_world": (1036, 1359),    # Elmsworth, km 0
    "ferry_cities": ("city-30", "city-31"),
    "junction_f": 0.78,
    "relax_f": 0.72,
}

DRIVER_STYLE = {
    "water": (91, 141, 184),
    "shrine": (122, 158, 95),
    "specialty": (201, 123, 74),
    "junction": (217, 164, 65),
    "fort": (176, 74, 74),
}


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


def seg_intersect(p1, p2, p3, p4):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den
    if 0.02 < t < 0.98 and 0.02 < u < 0.98:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None


def main():
    cfg = CONFIG
    seed_json, out_png, out_json = sys.argv[1], sys.argv[2], sys.argv[3]
    rng = random.Random(cfg["seed"])
    gaz = json.load(open(cfg["map_json"]))
    K = gaz["meta"]["km_per_px"]
    W, H = gaz["meta"]["canvas_px"]

    dials = {n: d for n, d in gaz["meta"]["settlement_dials"].items()
             if not n.startswith("_")}
    skipped = [n["id"] for n in gaz["nations"] if n["id"] not in dials]
    print(f"dialed nations: {sorted(dials)}  |  SKIPPED (dials not ruled): {sorted(skipped)}")

    # water mask from the extracted Rivers And Lakes layer
    rl = np.asarray(Image.open(cfg["rivers_png"]).convert("RGBA"))
    water = rl[:, :, 3] > 60
    dist_to_water = ndimage.distance_transform_edt(~water)

    # nation masks (rasterized polygons)
    masks = {}
    for nat in gaz["nations"]:
        if "polygon" not in nat:
            continue
        im = Image.new("L", (W, H), 0)
        ImageDraw.Draw(im).polygon([tuple(p) for p in nat["polygon"]], fill=255)
        masks[nat["id"]] = np.asarray(im) > 0

    def nation_at(x, y):
        xi, yi = int(x), int(y)
        if not (0 <= xi < W and 0 <= yi < H):
            return None
        for n, m in masks.items():
            if m[yi, xi]:
                return n
        return None

    # Palewater wild corridor
    at_km = channel_sampler(gaz, "border-river", cfg["channel_origin_world"])
    wild_pts = [at_km(km) for km in range(cfg["wild_from_km"], cfg["wild_to_km"], 10)]
    wildtree = cKDTree(wild_pts)

    def wildness(x, y):
        d, _ = wildtree.query([x, y])
        return d

    # borders (for forts): own-mask pixels adjacent to a DIFFERENT nation mask
    all_ids = list(masks)
    stack = np.zeros((H, W), dtype=np.int16)
    for i, n in enumerate(all_ids, 1):
        stack[masks[n] & (stack == 0)] = i
    border_pts = {n: [] for n in all_ids}
    step = 6
    for yy in range(6, H - 6, step):
        for xx in range(6, W - 6, step):
            v = stack[yy, xx]
            if v == 0:
                continue
            win = stack[yy - 5:yy + 6, xx - 5:xx + 6]
            vals = set(win[win > 0].tolist())
            if len(vals) > 1:
                border_pts[all_ids[v - 1]].append((xx, yy))

    # coastline (for water towns): own-mask pixels near no-nation open space
    coast_pts = {n: [] for n in all_ids}
    any_mask = stack > 0
    dist_to_open = ndimage.distance_transform_edt(any_mask)
    for yy in range(6, H - 6, step):
        for xx in range(6, W - 6, step):
            v = stack[yy, xx]
            if v and 2 < dist_to_open[yy, xx] <= 8:
                coast_pts[all_ids[v - 1]].append((xx, yy))

    # allowed-placement masks: the polygon, minus a rim-only cut where ruled
    # (Canticle r99-105: settled life within 25 km fresh water / 50 km of sea —
    # the Hush interior stays EMPTY)
    allowed = {}
    for n in dials:
        m = masks[n].copy()
        if dials[n].get("rim_only"):
            rim = (dist_to_water <= 25 / K) | (dist_to_open <= 50 / K)
            m &= rim
        allowed[n] = m

    # water-adjacent candidate pixels per nation (drawn rivers/lakes)
    near_w = (dist_to_water >= 3) & (dist_to_water <= 8)
    wnear = {n: np.argwhere(near_w & allowed[n]) for n in dials}

    # seeds: the already-derived region towns (world px)
    seeds = []
    if seed_json != "-":
        sj = json.load(open(seed_json))
        for t in sj["towns"]:
            seeds.append({"x": t["px"][0], "y": t["px"][1],
                          "nation": t["nation"], "driver": t["driver"], "seed": True})
    print(f"seeds: {len(seeds)} region-derived towns held fixed")

    # budgets: usable area / density law, minus seed credit
    usable_km2, counts = {}, {}
    cell = (step * K) ** 2
    for n in dials:
        m = 0
        for yy in range(6, H - 6, step):
            for xx in range(6, W - 6, step):
                if not allowed[n][yy, xx] or water[yy, xx]:
                    continue
                if cfg["wild_from_km"] and wildness(xx, yy) < cfg["wild_hard_px"]:
                    continue
                m += 1
        usable_km2[n] = m * cell
        # count: population-derived where the dial carries it (the 2026-07-22
        # six), else the area / density law (Thalendor + Corvaine, r151/152 —
        # derived numbers beat prose estimates, Ben's method ruling)
        if "national_towns" in dials[n]:
            counts[n] = dials[n]["national_towns"]
        else:
            counts[n] = round(usable_km2[n] / gazetteer_density(gaz, n))
    print("usable km2:", {n: round(v) for n, v in usable_km2.items()},
          "-> national counts:", counts)

    spacing_px = {n: dials[n]["market_spacing_km"] / K for n in dials}
    print("spacing px:", {n: round(v, 1) for n, v in spacing_px.items()})

    budget = {}
    for n in dials:
        mix = cfg["driver_mix"].get(n) or dials[n]["driver_mix"]
        per = {d: round(counts[n] * f) for d, f in mix.items()}
        for s in seeds:
            if s["nation"] == n and s["driver"] in per:
                per[s["driver"]] -= 1
        budget[n] = {d: max(0, v) for d, v in per.items()}
    print("off-frame budget:", budget)

    placed = list(seeds)
    cities = [(c["px"][0], c["px"][1]) for c in gaz["cities"]]
    site_px = {s["id"]: s["px"] for s in gaz["sites"]}
    if "heartholt" in site_px:
        cities.append(tuple(site_px["heartholt"]))

    def spaced(x, y, min_d):
        if any(math.hypot(x - p["x"], y - p["y"]) < min_d for p in placed):
            return False
        if any(math.hypot(x - cx, y - cy) < 15 for cx, cy in cities):
            return False
        return True

    def try_place(x, y, driver, nation, min_d=None):
        if not (12 < x < W - 12 and 12 < y < H - 12):
            return False
        if water[int(y), int(x)] or dist_to_water[int(y), int(x)] < 2:
            return False
        if nation_at(x, y) != nation or not allowed[nation][int(y), int(x)]:
            return False
        w = wildness(x, y)
        if w < cfg["wild_hard_px"]:
            return False
        if w < cfg["fort_band_px"][1] and driver != "fort":
            return False
        if min_d is None:
            min_d = spacing_px[nation]
        if not spaced(x, y, min_d):
            return False
        placed.append({"x": x, "y": y, "driver": driver, "nation": nation})
        return True

    def fill(nation, driver, target, gen, cap=4000, min_d=None):
        made, tries = 0, 0
        while made < target and tries < cap:
            tries += 1
            spot = gen()
            if spot and try_place(spot[0], spot[1], driver, nation, min_d=min_d):
                made += 1
        return made

    def water_gen(n):
        pts = wnear[n]
        cps = coast_pts[n]

        def gen():
            if len(pts) and (not cps or rng.random() < 0.7):
                y, x = pts[rng.randrange(len(pts))]
                return (float(x), float(y))
            if cps:
                x, y = cps[rng.randrange(len(cps))]
                return (x + rng.uniform(-3, 3), y + rng.uniform(-3, 3))
            return None
        return gen

    def specialty_gen(n):
        pts = wnear[n]
        ys, xs = np.nonzero(allowed[n])

        def gen():
            if len(pts) and rng.random() < 0.5:
                y, x = pts[rng.randrange(len(pts))]
                return (x + rng.uniform(-10, 10), y + rng.uniform(-10, 10))
            i = rng.randrange(len(xs))
            return (float(xs[i]), float(ys[i]))
        return gen

    def shrine_gen(n):
        ys, xs = np.nonzero(allowed[n])

        def gen():
            best, iso = None, -1
            for _ in range(6):
                i = rng.randrange(len(xs))
                x, y = float(xs[i]), float(ys[i])
                d = min([dist_to_water[int(y), int(x)]] +
                        [math.hypot(x - p["x"], y - p["y"]) for p in placed[-60:]] +
                        [math.hypot(x - cx, y - cy) for cx, cy in cities])
                if d > iso:
                    iso, best = d, (x, y)
            return best
        return gen

    def fort_gen(n):
        bps = border_pts[n]
        on_corridor = n in ("thalendor", "corvaine")

        def gen():
            if on_corridor and rng.random() < 0.5:
                km = rng.uniform(cfg["wild_from_km"], cfg["wild_to_km"])
                cx, cy = at_km(km)
                d = rng.uniform(*cfg["fort_band_px"])
                s = -1 if n == "thalendor" else 1
                return (cx + s * d, cy + rng.uniform(-12, 12))
            if bps:
                x, y = bps[rng.randrange(len(bps))]
                return (x + rng.uniform(-8, 8), y + rng.uniform(-8, 8))
            return None
        return gen

    shortfalls = {}
    for n in cfg["nations"]:
        n_w = fill(n, "water", budget[n]["water"], water_gen(n))
        n_sp = fill(n, "specialty", budget[n]["specialty"], specialty_gen(n))
        n_f = fill(n, "fort", budget[n]["fort"], fort_gen(n))
        n_sh = fill(n, "shrine", budget[n]["shrine"], shrine_gen(n))
        shortfalls[n] = {"water": budget[n]["water"] - n_w, "fort": budget[n]["fort"] - n_f,
                         "specialty": budget[n]["specialty"] - n_sp,
                         "shrine": budget[n]["shrine"] - n_sh}

    # derived road graph + junctions
    ferry = set()
    for cid in cfg["ferry_cities"]:
        c = next((c for c in gaz["cities"] if c["id"] == cid), None)
        if c:
            ferry.add(tuple(c["px"]))
    chan_pts = next(w for w in gaz["waterways"] if w["id"] == "border-river")["polyline"]
    chan_dense = []
    for i in range(len(chan_pts) - 1):
        a, b = chan_pts[i], chan_pts[i + 1]
        n_ = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) // 4))
        for s in range(n_):
            chan_dense.append((a[0] + (b[0] - a[0]) * s / n_,
                               a[1] + (b[1] - a[1]) * s / n_))
    chantree = cKDTree(chan_dense)

    def build_graph(nation, k):
        nodes = [(p["x"], p["y"]) for p in placed if p["nation"] == nation]
        for c in gaz["cities"]:
            if nation_at(*c["px"]) == nation:
                nodes.append(tuple(c["px"]))
        eset = set()
        if len(nodes) > 1:
            from scipy.sparse.csgraph import minimum_spanning_tree
            P = np.array(nodes)
            D = np.hypot(P[:, None, 0] - P[None, :, 0], P[:, None, 1] - P[None, :, 1])
            mst = minimum_spanning_tree(D).tocoo()
            eset = {tuple(sorted((int(i), int(j)))) for i, j in zip(mst.row, mst.col)}
        max_edge = cfg["max_road_km"] / K
        pts = np.array(nodes)
        tree = cKDTree(pts)
        for i in range(len(nodes)):
            dd, jj = tree.query(pts[i], k=min(k + 1, len(nodes)))
            for d, j in zip(np.atleast_1d(dd), np.atleast_1d(jj)):
                if j != i and d <= max_edge:
                    eset.add(tuple(sorted((i, int(j)))))

        # The MAIN channel blocks roads (ferry cities only — ruling 154); other
        # drawn water: a SHORT crossing is a bridge (junction candidate), a
        # long one (lake, wide reach) blocks the edge.
        kept, bridges = [], []
        for i, j in eset:
            a, b = nodes[i], nodes[j]
            n_ = max(2, int(math.hypot(b[0] - a[0], b[1] - a[1]) // 3))
            run, max_run, run_mid, chan = 0, 0, None, False
            for s_ in range(1, n_):
                x = a[0] + (b[0] - a[0]) * s_ / n_
                y = a[1] + (b[1] - a[1]) * s_ / n_
                if water[int(y), int(x)]:
                    run += 1
                    if run > max_run:
                        max_run, run_mid = run, (x, y)
                    d, _ = chantree.query([x, y])
                    if d < 7:
                        chan = True
                else:
                    run = 0
            if chan and a not in ferry and b not in ferry:
                continue
            if max_run * 3 > 14:      # >~22 km of water: no bridge, no road
                continue
            kept.append((a, b))
            if run_mid is not None:
                bridges.append(run_mid)
        return nodes, kept, bridges

    graphs = {}
    for n in cfg["nations"]:
        need = budget[n]["junction"]
        made = 0
        for k in range(cfg["lattice_k"][n], cfg["lattice_k"][n] + 3):
            graphs[n] = build_graph(n, k)
            _, edges, bridges = graphs[n]
            cand = [(p, 3.0) for e1, e2 in combinations(edges, 2)
                    if not (set(map(tuple, e1)) & set(map(tuple, e2)))
                    and (p := seg_intersect(e1[0], e1[1], e2[0], e2[1]))]
            cand += [(p, 2.5) for p in bridges]
            rng.shuffle(cand)
            cand.sort(key=lambda c: -c[1])
            for p, _score in cand:
                if made >= need:
                    break
                spots = [p] + [(p[0] + r * math.cos(t), p[1] + r * math.sin(t))
                               for r in (4, 7) for t in np.linspace(0, 6.283, 8, endpoint=False)]
                for s_ in spots:
                    if try_place(s_[0], s_[1], "junction", n,
                                 min_d=cfg["junction_f"] * spacing_px[n]):
                        made += 1
                        break
            if made >= need:
                break
        shortfalls[n]["junction"] = need - made

    # relaxed top-up, mix preserved, remainder REPORTED
    gens = {"water": water_gen, "specialty": specialty_gen, "shrine": shrine_gen,
            "fort": fort_gen}
    for n, defs in shortfalls.items():
        for d, deficit in list(defs.items()):
            if deficit <= 0 or d not in gens:
                continue
            got = fill(n, d, deficit, gens[d](n), cap=6000,
                       min_d=cfg["relax_f"] * spacing_px[n])
            defs[d] = deficit - got
    remaining = {n: {d: v for d, v in defs.items() if v > 0}
                 for n, defs in shortfalls.items()}
    new_towns = [p for p in placed if not p.get("seed")]
    print("mix (new):", {n: dict(Counter(p["driver"] for p in new_towns if p["nation"] == n))
                         for n in cfg["nations"]})
    if any(remaining.values()):
        print("UNFILLED (signal, not scatter):", remaining)

    # ------------------------------------------------------------- render ---
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    for bold, reg in (("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                       "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
                      ("C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf")):
        try:
            F = ImageFont.truetype(bold, 26)
            Fs = ImageFont.truetype(reg, 18)
            break
        except OSError:
            F = Fs = ImageFont.load_default()

    def text_outlined(xy, s, font, fill=(255, 250, 235, 255)):
        x, y = xy
        for ox, oy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            dr.text((x + ox, y + oy), s, font=font, fill=(20, 15, 5, 220))
        dr.text((x, y), s, font=font, fill=fill)

    for nat in graphs:
        for a, b in graphs[nat][1]:
            dr.line([tuple(map(int, a)), tuple(map(int, b))], fill=(230, 215, 180, 36), width=1)

    # the Palewater region frame, for orientation
    rm = gaz["region_maps"][0]["world_transform"]
    s, rot = rm["scale_region_px_per_world_px"], math.radians(rm["rotation_deg"])
    a_ = s * math.cos(rot); b_ = s * math.sin(rot)
    ax, ay = rm["anchors"]["elmsworth"]["region_px"]
    wx, wy = 1036, 1359
    tx = ax - (a_ * wx - b_ * wy); ty = ay - (b_ * wx + a_ * wy)
    det = a_ * a_ + b_ * b_

    def r2w(p):
        X, Y = p[0] - tx, p[1] - ty
        return ((a_ * X + b_ * Y) / det, (-b_ * X + a_ * Y) / det)
    corners = [r2w(p) for p in ((0, 0), (1384, 0), (1384, 1384), (0, 1384), (0, 0))]
    dr.line([tuple(map(int, c)) for c in corners], fill=(255, 255, 255, 90), width=2)

    for p in placed:
        c = DRIVER_STYLE[p["driver"]]
        x, y = p["x"], p["y"]
        r = 3 if p.get("seed") else 4
        dr.ellipse([x - r, y - r, x + r, y + r], fill=c + (235,),
                   outline=(25, 18, 8, 255), width=1)

    lx, ly = 40, 60
    dr.rounded_rectangle([lx - 14, ly - 16, lx + 430, ly + 262], radius=10, fill=(20, 15, 5, 180))
    text_outlined((lx, ly), "WORLD SETTLEMENT — DRAFT 2 · r157", F)
    ly += 40
    for d, c in DRIVER_STYLE.items():
        dr.ellipse([lx, ly + 4, lx + 14, ly + 18], fill=c + (255,))
        text_outlined((lx + 22, ly), f"{d} town", Fs)
        ly += 26
    text_outlined((lx, ly), "small dots: Palewater region seeds (fixed)", Fs); ly += 26
    text_outlined((lx, ly), "white rect: Palewater region frame", Fs); ly += 26
    spc = " / ".join(f"{n[0].upper()} {dials[n]['market_spacing_km']} km" for n in sorted(dials))
    text_outlined((lx, ly), f"derived spacing: {spc}", Fs); ly += 26
    text_outlined((lx, ly), f"dialed: {', '.join(sorted(dials))} — others GATED", Fs)

    ov.save(out_png)
    out = {
        "usable_km2": {n: round(v) for n, v in usable_km2.items()},
        "national_counts": counts,
        "unfilled": remaining,
        "towns": [{"px": [round(p["x"], 1), round(p["y"], 1)], "nation": p["nation"],
                   "driver": p["driver"], "seed": bool(p.get("seed"))} for p in placed],
    }
    json.dump(out, open(out_json, "w"), indent=1)
    print(f"wrote {out_png} and {out_json}")


def gazetteer_density(gaz, nation):
    """km2-per-town national density law (rulings 151/152): stored beside the
    dial; falls back to the ruled constants for the two walked nations."""
    d = gaz["meta"]["settlement_dials"].get(nation, {})
    if "km2_per_town" in d:
        return d["km2_per_town"]
    return {"thalendor": 5700, "corvaine": 2900}[nation]


if __name__ == "__main__":
    main()
