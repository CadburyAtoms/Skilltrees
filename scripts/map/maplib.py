"""Shared helpers for the Thyrcross map pipeline (gazetteer IO + 2D geometry).

The gazetteer (source-materials/maps/thyrcross.map.json) is THE machine-readable
geographic source of truth; canon doc §5a is its prose summary. All coordinates are
full-resolution pixels on thyrcross.png (2865x3399); meta.km_per_px converts to km.
"""
import json
import math
import os

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
GAZETTEER = os.path.join(REPO, "source-materials", "maps", "thyrcross.map.json")

WATER_ALPHA = 60    # rivers/lakes layer paint threshold (alpha > this = water)
PAINT_ALPHA = 128   # nation-wash / political-layer paint threshold (ruling R-68,
                     # 2026-08-10 reconciliation of the 120 vs 128 split)


def load_gazetteer(path=None):
    with open(path or GAZETTEER, encoding="utf-8") as f:
        return json.load(f)


def save_gazetteer(gaz, path=None):
    with open(path or GAZETTEER, "w", encoding="utf-8", newline="\n") as f:
        json.dump(gaz, f, indent=1, ensure_ascii=False)
        f.write("\n")


def dist_px(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def polyline_length_px(pts):
    return sum(dist_px(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def nearest_vertex(pts, p):
    """Index of the polyline vertex nearest to point p."""
    best, bi = float("inf"), 0
    for i, q in enumerate(pts):
        d = dist_px(q, p)
        if d < best:
            best, bi = d, i
    return bi, best


def along_polyline_px(pts, a, b):
    """Length along the polyline between the vertices nearest a and b (px).
    Returns (length, offside_a, offside_b) where offside_* is each point's
    distance from the line (how far off-channel the endpoint sits)."""
    ia, da = nearest_vertex(pts, a)
    ib, db = nearest_vertex(pts, b)
    lo, hi = min(ia, ib), max(ia, ib)
    return polyline_length_px(pts[lo:hi + 1]), da, db


def point_in_poly(p, poly):
    """Ray-casting point-in-polygon. poly = [[x,y], ...]."""
    x, y = p
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def nation_at(gaz, p):
    """Nation dict containing point p (by traced polygon), or None."""
    for nat in gaz["nations"]:
        poly = nat.get("polygon")
        if poly and point_in_poly(p, poly):
            return nat
    return None


def simplify_dp(pts, epsilon):
    """Douglas-Peucker polyline simplification."""
    if len(pts) < 3:
        return list(pts)
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / norm
        if d > dmax:
            dmax, idx = d, i
    if dmax > epsilon:
        left = simplify_dp(pts[: idx + 1], epsilon)
        right = simplify_dp(pts[idx:], epsilon)
        return left[:-1] + right
    return [list(pts[0]), list(pts[-1])]


def find_place(gaz, name):
    """Look up a named place (site, city, or nation anchor) case-insensitively.
    Returns (kind, dict, (x, y))."""
    key = name.strip().lower()
    for s in gaz.get("sites", []):
        if key in (s["id"].lower(), s.get("name", "").lower()):
            return "site", s, tuple(s["px"])
    for c in gaz.get("cities", []):
        if key == c["id"].lower() or key == (c.get("name") or "").lower():
            return "city", c, tuple(c["px"])
    for n in gaz.get("nations", []):
        if key in (n["id"].lower(), n["name"].lower(), n["map_letter"].lower()):
            return "nation", n, tuple(n["anchor_px"])
    raise KeyError(f"no place named {name!r} in the gazetteer")


# ---------------------------------------------------------------------------
# point-to-segment / polyline geometry (wave 3A, 2026-08-10 — was duplicated
# across lint_map.py and trace_hydrology.py)
# ---------------------------------------------------------------------------

def seg_dist(p, a, b):
    """Distance from point p to segment a-b."""
    px, py = p
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    dd = dx * dx + dy * dy
    if dd == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dd))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def polyline_dist(p, pts, closed=False):
    """Distance from point p to a polyline (or closed polygon ring)."""
    if len(pts) < 2:
        return math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) if pts else 1e9
    best = 1e9
    n = len(pts)
    for i in range(n if closed else n - 1):
        best = min(best, seg_dist(p, pts[i], pts[(i + 1) % n]))
    return best


def project_on_polyline(p, ring, closed=True):
    """Point on the polyline/ring's segments nearest to p, as [x, y] rounded
    ints — trace_hydrology.py's snap_to_ring (mouths anchor to shores/channels).
    Default closed=True to match that original call shape (always wraps mod n,
    including when `ring` is really an open waterway polyline — preserved as-is)."""
    best, bp = 1e18, p
    n = len(ring)
    for i in range(n if closed else n - 1):
        ax, ay = ring[i]
        bx, by = ring[(i + 1) % n]
        dx, dy = bx - ax, by - ay
        dd = dx * dx + dy * dy or 1e-9
        t = max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - ay) * dy) / dd))
        qx, qy = ax + t * dx, ay + t * dy
        d = (p[0] - qx) ** 2 + (p[1] - qy) ** 2
        if d < best:
            best, bp = d, (qx, qy)
    return [int(round(bp[0])), int(round(bp[1]))]


# ---------------------------------------------------------------------------
# skeleton/raster tracing (wave 3A — was duplicated across trace_rivers.py and
# trace_hydrology.py). numpy/PIL are imported LAZILY inside these functions
# only: maplib.py itself must stay importable with no numpy — lint_map.py's
# CI job installs Pillow but not numpy (validate.yml), and it only needs the
# pure-math helpers above.
# ---------------------------------------------------------------------------

def zhang_suen(mask):
    """Thin a bool mask to a 1-px skeleton (vectorized Zhang-Suen thinning)."""
    import numpy as np
    img = mask.copy()

    def neighbors(a):
        p2 = np.roll(a, 1, 0)
        p3 = np.roll(np.roll(a, 1, 0), -1, 1)
        p4 = np.roll(a, -1, 1)
        p5 = np.roll(np.roll(a, -1, 0), -1, 1)
        p6 = np.roll(a, -1, 0)
        p7 = np.roll(np.roll(a, -1, 0), 1, 1)
        p8 = np.roll(a, 1, 1)
        p9 = np.roll(np.roll(a, 1, 0), 1, 1)
        return p2, p3, p4, p5, p6, p7, p8, p9

    while True:
        changed = False
        for phase in (0, 1):
            p2, p3, p4, p5, p6, p7, p8, p9 = neighbors(img)
            b = (p2.astype(np.uint8) + p3 + p4 + p5 + p6 + p7 + p8 + p9)
            seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            a = np.zeros_like(b)
            for i in range(8):
                a += (~seq[i] & seq[i + 1]).astype(np.uint8)
            if phase == 0:
                cond = (~p2 | ~p4 | ~p6) & (~p4 | ~p6 | ~p8)
            else:
                cond = (~p2 | ~p4 | ~p8) & (~p2 | ~p6 | ~p8)
            kill = img & (b >= 2) & (b <= 6) & (a == 1) & cond
            if kill.any():
                img &= ~kill
                changed = True
        if not changed:
            return img


def skeleton_path(skel, a, b):
    """Shortest 8-connected path between two (x, y) points on a skeleton
    raster/mask (indexed skel[y, x], truthy = skeleton px) — trace_rivers.py's
    shortest_path / trace_hydrology.py's bfs_path."""
    from collections import deque
    h, w = skel.shape
    prev = {}
    q = deque([a])
    seen = {a}
    while q:
        cur = q.popleft()
        if cur == b:
            path = [cur]
            while cur in prev:
                cur = prev[cur]
                path.append(cur)
            return path[::-1]
        x, y = cur
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == dy == 0:
                    continue
                nxt = (x + dx, y + dy)
                if 0 <= nxt[0] < w and 0 <= nxt[1] < h and skel[nxt[1], nxt[0]] and nxt not in seen:
                    seen.add(nxt)
                    prev[nxt] = cur
                    q.append(nxt)
    return None


def nearest_true(mask, p):
    """Nearest true px of a bool raster mask to (x, y) — small local search,
    then global fallback. trace_hydrology.py's nearest_true."""
    import numpy as np
    x, y = p
    for r in (6, 15, 40, 120):
        y0, y1 = max(0, y - r), min(mask.shape[0], y + r + 1)
        x0, x1 = max(0, x - r), min(mask.shape[1], x + r + 1)
        win = mask[y0:y1, x0:x1]
        if win.any():
            ys, xs = np.where(win)
            i = int(np.hypot(xs + x0 - x, ys + y0 - y).argmin())
            return (int(xs[i] + x0), int(ys[i] + y0))
    ys, xs = np.where(mask)
    i = int(np.hypot(xs - x, ys - y).argmin())
    return (int(xs[i]), int(ys[i]))


def polygon_mask(polygon, shape):
    """Boolean mask, True inside `polygon`, on a (h, w) canvas — water_frac.py."""
    import numpy as np
    from PIL import Image, ImageDraw
    m = Image.new("1", (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in polygon], fill=1)
    return np.array(m, bool)
