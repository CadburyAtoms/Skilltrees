"""Measure a nation's water fraction — the free (non-dial) input of a land budget.

Counts Rivers-and-Lakes LAYER paint inside the nation's traced polygon, per the ruling-26
method (lore-forge Phase 4b): water is *measured*, never a dial. Since the 2026-07-19 map
redraw this reads the committed layer export (`thyrcross-rivers.png`, alpha > 60) directly —
no colour classifier, no calibration drift. The pinned check: Thalendor's land_budget records
the value this measurement produced when it was taken (re-run and compared every time).

Usage: python scripts/map/water_frac.py [nation ...]   (default: all traced nations)
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

import maplib

RIVERS_LAYER = os.path.join(os.path.dirname(maplib.GAZETTEER), "thyrcross-rivers.png")
# Thalendor's land_budget records the 2026-07-19 layer measurement this script must reproduce.
CALIBRATION_NATION = "Thalendor"
CALIBRATION_TOL = 0.005


def polygon_mask(polygon, shape):
    m = Image.new("1", (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in polygon], fill=1)
    return np.array(m, bool)


def nation_water_frac(nation, water, shape):
    if not nation.get("polygon"):
        return None
    m = polygon_mask(nation["polygon"], shape)
    return float((water & m).sum() / m.sum())


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("nations", nargs="*", help="nation names (default: all traced)")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    water = np.array(Image.open(RIVERS_LAYER))[..., 3] > 60
    if list(water.shape[::-1]) != gaz["meta"]["canvas_px"]:
        sys.exit(f"ERROR: {os.path.basename(RIVERS_LAYER)} size {water.shape[::-1]} != canvas "
                 f"{gaz['meta']['canvas_px']} — re-extract the Rivers And Lakes layer.")

    by_name = {n["name"].lower(): n for n in gaz["nations"]}
    wanted = [by_name[w.lower()] for w in args.nations] if args.nations else gaz["nations"]

    cal_nation = by_name[CALIBRATION_NATION.lower()]
    recorded = cal_nation.get("land_budget", {}).get("water_frac")
    cal = nation_water_frac(cal_nation, water, water.shape)
    if recorded is not None:
        drift = abs(cal - recorded)
        print(f"calibration {CALIBRATION_NATION}: {cal:.1%} vs recorded "
              f"{recorded:.1%} ({'OK' if drift <= CALIBRATION_TOL else 'DRIFTED'})")
        if drift > CALIBRATION_TOL:
            sys.exit("ERROR: measurement no longer reproduces the recorded land_budget value — "
                     "the rivers layer or the polygon changed; re-measure and update the "
                     "land_budget (and its dependent canon numbers) deliberately, not silently.")

    for nation in wanted:
        f = nation_water_frac(nation, water, water.shape)
        if f is None:
            print(f"{nation['name']}: no traced polygon — skipped")
        else:
            print(f"{nation['name']}: water {f:.1%} of {nation['area_km2_approx']:,} km²")


if __name__ == "__main__":
    main()
