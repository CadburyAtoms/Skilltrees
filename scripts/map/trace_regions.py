"""Trace nation border polygons from the extracted Political Map layer into the gazetteer.

Method: competitive multi-source BFS. All ten nations flood simultaneously from their
anchors; a pixel joins a nation only if colour-compatible with THAT nation's seed colour
(the political layer reuses fill colours across nations, so colour alone can't key
regions), and the Country Borders layer — dilated so the dashes close — acts as a wall
wherever Ben actually drew a border. Whoever reaches a contested pixel first claims it.
Each claim's outer boundary is Moore-traced, simplified (closed-loop-safe DP), and
written back as nation.polygon in full-res px.

Usage:
  python scripts/map/trace_regions.py <political.png> <borders.png> [--ds 4] [--tol 45]
"""
import argparse
import sys
from collections import deque

import numpy as np
from PIL import Image

import maplib

NEIGH8 = [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1)]


def find_seed(rgb, alpha, anchor, max_r=14):
    """Nearest painted, non-label-red pixel to the anchor."""
    ax, ay = anchor
    h, w = alpha.shape
    for r in range(max_r):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                x, y = ax + dx, ay + dy
                if 0 <= x < w and 0 <= y < h and alpha[y, x]:
                    px = rgb[y, x].astype(int)
                    if not (px[0] > 180 and px[1] < 90 and px[2] < 90):
                        return (x, y)
    raise ValueError(f"no paint near anchor {anchor}")


def trace_boundary(mask):
    ys, xs = np.where(mask)
    start = (int(xs[ys == ys.min()].min()), int(ys.min()))
    contour = [start]
    prev_dir = 6
    cur = start
    h, w = mask.shape
    for _ in range(int(mask.sum()) * 4):
        for k in range(8):
            d = (prev_dir + 5 + k) % 8
            dy, dx = NEIGH8[d]
            nx, ny = cur[0] + dx, cur[1] + dy
            if 0 <= nx < w and 0 <= ny < h and mask[ny, nx]:
                cur = (nx, ny)
                prev_dir = d
                contour.append(cur)
                break
        else:
            break
        if cur == start and len(contour) > 2:
            break
    return contour


def simplify_closed(contour, eps):
    """DP-simplify a closed contour by splitting at the point farthest from the start
    (plain DP degenerates when first == last)."""
    if len(contour) < 8:
        return contour
    sx, sy = contour[0]
    far = max(range(len(contour)), key=lambda i: (contour[i][0] - sx) ** 2 + (contour[i][1] - sy) ** 2)
    a = maplib.simplify_dp(contour[: far + 1], eps)
    b = maplib.simplify_dp(contour[far:], eps)
    return a[:-1] + b[:-1]


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("political_png")
    ap.add_argument("borders_png")
    ap.add_argument("--ds", type=int, default=4)
    ap.add_argument("--tol", type=int, default=45, help="per-channel colour tolerance")
    ap.add_argument("--eps", type=float, default=2.5, help="simplify epsilon (downsampled px)")
    ap.add_argument("--wall-dilate", type=int, default=3, help="border-dash dilation radius (ds px)")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    ds = args.ds
    pol = Image.open(args.political_png).convert("RGBA")
    if list(pol.size) != gaz["meta"]["canvas_px"]:
        sys.exit(f"ERROR: layer size {pol.size} != canvas {gaz['meta']['canvas_px']}")
    small = pol.resize((pol.width // ds, pol.height // ds), Image.NEAREST)
    arr = np.array(small)
    # R-68 (2026-08-10): was >120, reconciled onto trace_nations.py's PAINT_ALPHA
    # (128) — can shift a re-traced boundary by a pixel; intended, on record.
    rgb, alpha = arr[..., :3].astype(int), arr[..., 3] > maplib.PAINT_ALPHA

    bor = Image.open(args.borders_png).convert("RGBA").resize(small.size, Image.NEAREST)
    wall = np.array(bor)[..., 3] > maplib.WATER_ALPHA
    for _ in range(args.wall_dilate):  # close the dash gaps
        wall = (wall | np.roll(wall, 1, 0) | np.roll(wall, -1, 0)
                | np.roll(wall, 1, 1) | np.roll(wall, -1, 1))

    h, w = alpha.shape
    claim = np.full((h, w), -1, dtype=np.int8)
    ok = []
    seeds = []
    q = deque()
    for i, nat in enumerate(gaz["nations"]):
        seed = find_seed(rgb, alpha, tuple(v // ds for v in nat["anchor_px"]))
        seeds.append(seed)
        seed_col = rgb[seed[1], seed[0]]
        ok_i = alpha & (np.abs(rgb - seed_col).sum(axis=2) <= args.tol * 3) & ~wall
        ok_i[seed[1], seed[0]] = True  # seed always claimable
        ok.append(ok_i)
        claim[seed[1], seed[0]] = i
        q.append((seed[0], seed[1], i))

    def run_bfs(queue):
        while queue:
            x, y, i = queue.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and claim[ny, nx] == -1 and ok[i][ny, nx]:
                    claim[ny, nx] = i
                    queue.append((nx, ny, i))

    run_bfs(q)  # round 1: strict tolerance, first arrival claims

    # Round 2+: regions with strong internal tone variation (highlight blobs) stall the
    # strict pass — re-flood from every claimed frontier with widened tolerance into
    # still-unclaimed paint only, so round-1 borders are preserved.
    for round_no in range(2, 4):
        tol2 = args.tol * (1.6 ** (round_no - 1))
        q2 = deque()
        for i, nat in enumerate(gaz["nations"]):
            seed = seeds[i]
            seed_col = rgb[seed[1], seed[0]]
            ok[i] = alpha & (np.abs(rgb - seed_col).sum(axis=2) <= tol2 * 3) & ~wall
            ys, xs = np.where(claim == i)
            for x, y in zip(xs.tolist(), ys.tolist()):
                q2.append((x, y, i))
        run_bfs(q2)

    total = 0
    for i, nat in enumerate(gaz["nations"]):
        mask = claim == i
        n_px = int(mask.sum())
        total += n_px
        contour = trace_boundary(mask)
        simp = simplify_closed(contour, args.eps)
        nat["polygon"] = [[int(x * ds), int(y * ds)] for x, y in simp]
        nat["area_km2_approx"] = int(n_px * (ds * gaz["meta"]["km_per_px"]) ** 2)
        print(f"{nat['name']:12s} ({nat['map_letter']}): {n_px:7d} px -> "
              f"{len(simp):4d}-pt polygon, ~{nat['area_km2_approx']:,} km^2")
    painted = int(alpha.sum())
    print(f"claimed {total}/{painted} painted px ({100 * total / painted:.1f}%)")
    maplib.save_gazetteer(gaz)
    print("polygons written to gazetteer")


if __name__ == "__main__":
    main()
