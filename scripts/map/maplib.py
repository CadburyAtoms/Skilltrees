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
