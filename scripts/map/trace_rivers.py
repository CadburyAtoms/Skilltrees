"""Trace a waterway centerline from the Rivers And Lakes layer into the gazetteer.

Skeletonizes the layer's paint (Zhang-Suen thinning, pure numpy), then walks the
skeleton graph along the shortest path between two given endpoints and stores the
simplified polyline as a gazetteer waterway. Rivers are digitized one at a time, on
demand — run once per named river with endpoints read off the map.

Usage:
  python scripts/map/trace_rivers.py <rivers-layer.png> --id border-river \
      --name "⚑ the border river" --from 1435,1530 --to 1470,2450 \
      --flow "north-to-south" [--ds 3] [--navigable]
"""
import argparse
import sys
from collections import deque

import numpy as np
from PIL import Image

import maplib


def zhang_suen(mask):
    """Thin a bool mask to a 1-px skeleton (vectorized Zhang-Suen)."""
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


def nearest_skel(skel_pts, p):
    arr = np.array(skel_pts)
    d = ((arr - np.array(p)) ** 2).sum(axis=1)
    i = int(d.argmin())
    return skel_pts[i], float(d[i] ** 0.5)


def shortest_path(skel, a, b):
    """BFS shortest path along skeleton pixels (8-connected)."""
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


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("rivers_png")
    ap.add_argument("--id", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--from", dest="src", required=True, help="x,y (full-res px)")
    ap.add_argument("--to", dest="dst", required=True, help="x,y (full-res px)")
    ap.add_argument("--flow", default="", help='flow direction note, e.g. "north-to-south"')
    ap.add_argument("--navigable", action="store_true")
    ap.add_argument("--ds", type=int, default=3)
    ap.add_argument("--eps", type=float, default=1.5)
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    ds = args.ds
    img = Image.open(args.rivers_png).convert("RGBA")
    small = img.resize((img.width // ds, img.height // ds), Image.NEAREST)
    mask = np.array(small)[..., 3] > 60
    print(f"skeletonizing {int(mask.sum())} water px at 1/{ds}...")
    skel = zhang_suen(mask)
    ys, xs = np.where(skel)
    pts = list(zip(xs.tolist(), ys.tolist()))
    print(f"skeleton: {len(pts)} px")

    src = tuple(int(v) // ds for v in args.src.split(","))
    dst = tuple(int(v) // ds for v in args.dst.split(","))
    a, da = nearest_skel(pts, src)
    b, db = nearest_skel(pts, dst)
    print(f"endpoints snapped: {tuple(v * ds for v in a)} (off {da * ds:.0f}px), "
          f"{tuple(v * ds for v in b)} (off {db * ds:.0f}px)")
    path = shortest_path(skel, a, b)
    if path is None:
        sys.exit("ERROR: endpoints are not connected on the skeleton (different water bodies?)")
    simp = maplib.simplify_dp(path, args.eps)
    poly = [[int(x * ds), int(y * ds)] for x, y in simp]
    length_km = maplib.polyline_length_px(poly) * gaz["meta"]["km_per_px"]

    entry = {
        "id": args.id, "name": args.name, "flow": args.flow,
        "navigable": bool(args.navigable), "length_km": round(length_km),
        "polyline": poly,
    }
    gaz["waterways"] = [wway for wway in gaz["waterways"] if wway["id"] != args.id] + [entry]
    maplib.save_gazetteer(gaz)
    print(f"waterway '{args.id}': {len(poly)} pts, {length_km:.0f} km -> gazetteer")


if __name__ == "__main__":
    main()
