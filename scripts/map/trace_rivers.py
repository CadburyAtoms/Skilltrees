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

import numpy as np
from PIL import Image

import maplib


def nearest_skel(skel_pts, p):
    """Exact nearest-neighbour search over an explicit list of skeleton points
    (as opposed to maplib.nearest_true's expanding-window raster search).
    NOT migrated to maplib.nearest_true: the two are not interchangeable —
    nearest_true's window search finds the nearest point WITHIN the first
    non-empty window, which is not always the true global nearest (a point
    just outside the window can be closer in Euclidean terms than the window's
    argmin; verified with a constructed counterexample in the wave-3A parity
    harness). nearest_skel here is an exact argmin, which this script's
    endpoint-snapping wants. See wave-3A report for the parity evidence."""
    arr = np.array(skel_pts)
    d = ((arr - np.array(p)) ** 2).sum(axis=1)
    i = int(d.argmin())
    return skel_pts[i], float(d[i] ** 0.5)


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
    mask = np.array(small)[..., 3] > maplib.WATER_ALPHA
    print(f"skeletonizing {int(mask.sum())} water px at 1/{ds}...")
    skel = maplib.zhang_suen(mask)
    ys, xs = np.where(skel)
    pts = list(zip(xs.tolist(), ys.tolist()))
    print(f"skeleton: {len(pts)} px")

    src = tuple(int(v) // ds for v in args.src.split(","))
    dst = tuple(int(v) // ds for v in args.dst.split(","))
    a, da = nearest_skel(pts, src)
    b, db = nearest_skel(pts, dst)
    print(f"endpoints snapped: {tuple(v * ds for v in a)} (off {da * ds:.0f}px), "
          f"{tuple(v * ds for v in b)} (off {db * ds:.0f}px)")
    path = maplib.skeleton_path(skel, a, b)
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
