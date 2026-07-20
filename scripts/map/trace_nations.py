"""Trace nation polygons straight off Ben's per-nation Procreate layers (2026-07-19+ format).

Replaces the legacy flood-fill path (trace_regions.py, which needed the retired
'Political Map' + 'Country Borders' layers). Since the redraw, Thycross.procreate
carries one wash layer per nation; this script:

  1. extracts Land + the ten nation layers in-memory (extract_procreate helpers),
  2. resolves Ben's brush slack into a WATERTIGHT partition of the Land mask —
     every land pixel gets exactly one owner. Coast/river fringe (wash stopping a
     few px short of the coastline), gaps between washes, and double-painted
     overlap strips are all settled by a competitive BFS: each nation floods
     outward from the pixels only it painted, first arrival claims. This encodes
     Ben's stated intent (2026-07-20: he fills gaps/overlaps deliberately — the
     residue is brush slack, not canon). Repainting the source layer is always
     the override: exclusively-painted pixels are never reassigned.
  3. traces each nation's largest region at ds=4 / eps=2.5 (same style as the
     07-19 registration, so polygon churn stays reviewable),
  4. writes polygon + area_km2_approx (full-res partition pixel count — areas now
     sum exactly to the land area) + meta.source back to the gazetteer, and
     regenerates thyrcross-political.png (partition tinted with each layer's own
     wash colour) + thyrcross-borders.png (interior seams).
  5. audits city/site containment: prints every place whose partition owner
     disagrees with its stored `nation` field — REPORTED, never auto-edited
     (nation reassignment is canon, i.e. Ben's call).

Usage:
  python scripts/map/trace_nations.py                  # report only, write nothing
  python scripts/map/trace_nations.py --update         # gazetteer + political/borders PNGs
  python scripts/map/trace_nations.py --procreate path/to/file.procreate
"""
import argparse
import os
import zipfile
from collections import deque

import numpy as np
from PIL import Image

import extract_procreate as ep
import maplib
from trace_regions import trace_boundary, simplify_closed

ALPHA_T = 128
DS = 4
EPS = 2.5
BORDER_INK = (40, 30, 25, 220)


def layer_image(zf, layers, name, w, h):
    by_name = {l["name"].lower(): l for l in layers}
    if name.lower() not in by_name:
        raise SystemExit(f"ERROR: no layer named {name!r} in the .procreate")
    img, _ = ep.extract_layer(zf, by_name[name.lower()], w, h)
    return np.array(img)


def partition(land, nation_masks):
    """Assign every land pixel to exactly one nation (see module docstring)."""
    h, w = land.shape
    n = len(nation_masks)
    cov = np.zeros((h, w), dtype=np.uint8)
    for m in nation_masks:
        cov += m.astype(np.uint8)

    claim = np.full((h, w), -1, dtype=np.int8)
    q = deque()
    for i, m in enumerate(nation_masks):
        exclusive = land & m & (cov == 1)
        claim[exclusive] = i
        ys, xs = np.nonzero(exclusive)
        # frontier only (pixels with a non-exclusive 4-neighbour) would be
        # cheaper, but whole-region seeding keeps the code obvious and the
        # canvas is small enough (2236x2976) that BFS cost is negligible.
        q.extend(zip(xs.tolist(), ys.tolist(), [i] * len(xs)))

    unresolved = land & (claim == -1)
    n_unres = int(unresolved.sum())
    while q:
        x, y, i = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and land[ny, nx] and claim[ny, nx] == -1:
                claim[ny, nx] = i
                q.append((nx, ny, i))

    orphans = int((land & (claim == -1)).sum())
    return claim, n_unres, orphans


def wash_color(rgba, mask):
    """Median RGB of the painted wash (median resists soft-edge blends)."""
    ys, xs = np.nonzero(mask)
    px = rgba[ys, xs, :3]
    return tuple(int(v) for v in np.median(px, axis=0))


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--procreate", default=None,
                    help="path to the .procreate (default: meta.source.file from the gazetteer)")
    ap.add_argument("--update", action="store_true",
                    help="write gazetteer + political/borders renders (default: report only)")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    maps_dir = os.path.dirname(maplib.GAZETTEER)
    src_path = args.procreate or os.path.join(
        maplib.REPO, gaz["meta"]["source"]["file"].replace("/", os.sep))
    st = os.stat(src_path)

    with zipfile.ZipFile(src_path) as zf:
        w, h, layers = ep.read_document(zf)
        if [w, h] != gaz["meta"]["canvas_px"]:
            raise SystemExit(f"ERROR: canvas {w}x{h} != gazetteer {gaz['meta']['canvas_px']} — "
                             f"a resize means EVERY coordinate re-derives; see the 07-19 delta.")
        land = layer_image(zf, layers, "Land", w, h)[:, :, 3] >= ALPHA_T
        rgbas = {n["id"]: layer_image(zf, layers, n["name"], w, h) for n in gaz["nations"]}

    masks = [rgbas[n["id"]][:, :, 3] >= ALPHA_T for n in gaz["nations"]]
    claim, n_unres, orphans = partition(land, masks)
    print(f"partition: {int(land.sum()):,} land px, {n_unres:,} resolved by BFS "
          f"({100 * n_unres / max(land.sum(), 1):.1f}%), {orphans:,} orphan px")
    if orphans:
        print("WARN  orphan land (no nation wash anywhere on its island) left unclaimed — "
              "list via: land pixels with claim == -1")

    km2 = gaz["meta"]["km_per_px"] ** 2
    small = claim[::DS, ::DS]
    for i, nat in enumerate(gaz["nations"]):
        full_px = int((claim == i).sum())
        mask_s = small == i
        # largest 4-connected region only (islands beyond it are the known
        # multi-polygon backlog item)
        lab_seen = np.zeros(mask_s.shape, dtype=bool)
        best = None
        ys, xs = np.nonzero(mask_s)
        for y0, x0 in zip(ys.tolist(), xs.tolist()):
            if lab_seen[y0, x0]:
                continue
            comp = []
            dq = deque([(y0, x0)])
            lab_seen[y0, x0] = True
            while dq:
                y, x = dq.popleft()
                comp.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < mask_s.shape[0] and 0 <= nx < mask_s.shape[1] \
                            and mask_s[ny, nx] and not lab_seen[ny, nx]:
                        lab_seen[ny, nx] = True
                        dq.append((ny, nx))
            if best is None or len(comp) > len(best):
                best = comp
        big = np.zeros(mask_s.shape, dtype=bool)
        big[tuple(np.array(best).T)] = True
        poly = [[int(x * DS), int(y * DS)] for x, y in simplify_closed(trace_boundary(big), EPS)]
        old_area = nat.get("area_km2_approx")
        new_area = int(full_px * km2)
        print(f"  {nat['name']:12s} {full_px:>9,} px -> {len(poly):3d}-pt polygon, "
              f"~{new_area:,} km^2 (was {old_area:,})")
        nat["polygon"] = poly
        nat["area_km2_approx"] = new_area

    print("\ncontainment audit (partition owner vs stored nation):")
    flips = 0
    for c in gaz.get("cities", []) + gaz.get("sites", []):
        x, y = c["px"]
        owner = claim[y, x]
        owner_id = gaz["nations"][owner]["id"] if owner >= 0 else None
        stored = c.get("nation")
        if stored and owner_id and stored != owner_id:
            flips += 1
            print(f"  FLIP  {c.get('name') or c['id']:22s} stored={stored} partition={owner_id} — Ben's call")
        elif owner_id is None:
            print(f"  WARN  {c.get('name') or c['id']:22s} at ({x},{y}) sits on unclaimed/no-land px")
    if not flips:
        print("  no nation flips")

    if not args.update:
        print("\n(report only — rerun with --update to write)")
        return

    gaz["meta"]["source"] = {
        "file": os.path.relpath(src_path, maplib.REPO).replace(os.sep, "/"),
        "size": st.st_size, "mtime": int(st.st_mtime),
        "layers_used": [n["name"] for n in gaz["nations"]] + ["Land", "Cities", "Rivers And Lakes"],
    }
    maplib.save_gazetteer(gaz)
    print(f"gazetteer updated -> {maplib.GAZETTEER}")

    pol = np.zeros((h, w, 4), dtype=np.uint8)
    for i, nat in enumerate(gaz["nations"]):
        r, g, b = wash_color(rgbas[nat["id"]], masks[i])
        pol[claim == i] = (r, g, b, 255)
    Image.fromarray(pol).save(os.path.join(maps_dir, "thyrcross-political.png"))

    inner = claim.copy()
    seam = np.zeros((h, w), dtype=bool)
    for ax, sh in ((0, 1), (1, 1)):
        a, b = inner, np.roll(inner, sh, axis=ax)
        edge = (a != b) & (a >= 0) & (b >= 0)
        seam |= edge | np.roll(edge, -sh, axis=ax)
    bor = np.zeros((h, w, 4), dtype=np.uint8)
    bor[seam] = BORDER_INK
    Image.fromarray(bor).save(os.path.join(maps_dir, "thyrcross-borders.png"))
    print("renders updated -> thyrcross-political.png, thyrcross-borders.png")


if __name__ == "__main__":
    main()
