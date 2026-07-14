"""Measure a nation's water fraction — the free (non-dial) input of a land budget.

Counts Rivers-and-Lakes blue on the base map (thyrcross.png) inside the nation's traced
polygon, per the ruling-26 method (lore-forge Phase 4b): water is *measured*, never a dial.
The blue classifier (blue channel dominant over red/green) reproduces Thalendor's recorded
11.7% at 11.5% on the same polygon — calibration is pinned by that check, which this script
re-runs and reports every time.

Usage: python scripts/map/water_frac.py [nation ...]   (default: all traced nations)
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

import maplib

BASE_MAP = os.path.join(os.path.dirname(maplib.GAZETTEER), "thyrcross.png")
# Thalendor's land_budget records the 2026-07-13 hand measurement this classifier must match.
CALIBRATION_NATION = "Thalendor"
CALIBRATION_RECORDED = 0.117
CALIBRATION_TOL = 0.01


def water_mask(img_rgb):
    r, g, b = img_rgb[..., 0], img_rgb[..., 1], img_rgb[..., 2]
    return (b > r + 15) & (b > g + 8)


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
    img = np.array(Image.open(BASE_MAP).convert("RGB")).astype(int)
    water = water_mask(img)

    by_name = {n["name"].lower(): n for n in gaz["nations"]}
    wanted = [by_name[w.lower()] for w in args.nations] if args.nations else gaz["nations"]

    cal = nation_water_frac(by_name[CALIBRATION_NATION.lower()], water, img.shape[:2])
    drift = abs(cal - CALIBRATION_RECORDED)
    print(f"calibration {CALIBRATION_NATION}: {cal:.1%} vs recorded "
          f"{CALIBRATION_RECORDED:.1%} ({'OK' if drift <= CALIBRATION_TOL else 'DRIFTED'})")
    if drift > CALIBRATION_TOL:
        sys.exit("ERROR: classifier no longer reproduces the recorded calibration — "
                 "re-derive the blue thresholds before trusting any number below.")

    for nation in wanted:
        f = nation_water_frac(nation, water, img.shape[:2])
        if f is None:
            print(f"{nation['name']}: no traced polygon — skipped")
        else:
            print(f"{nation['name']}: water {f:.1%} of {nation['area_km2_approx']:,} km²")


if __name__ == "__main__":
    main()
