"""Gazetteer lint — keeps the map data and the campaign docs from drifting apart.

Checks (exit 1 on any ERROR):
  1. Gazetteer integrity: canvas matches thyrcross.png; every nation has an anchor
     inside the canvas (and inside its own polygon, if traced); cities/sites in-canvas.
  2. City-nation containment: warns when a city marker falls outside every polygon.
  3. Doc drift: every "(x, y)"-style coordinate in the campaign docs must be in-canvas,
     and coordinates that name a site line must match the gazetteer within tolerance.

Usage: python scripts/map/lint_map.py
"""
import os
import re
import sys

from PIL import Image

import maplib

DOCS = ["EDHA_CAMPAIGN_CANON.md", "EDHA_CAMPAIGN_OPENING.md", "EDHA_SESSION_1_SCRIPT.md"]
COORD_RE = re.compile(r"\((\d{3,4}),\s?(\d{3,4})\)")
TOL_PX = 25

errors, warnings = [], []


def in_canvas(p, wh):
    return 0 <= p[0] < wh[0] and 0 <= p[1] < wh[1]


def main():
    gaz = maplib.load_gazetteer()
    wh = gaz["meta"]["canvas_px"]

    base = os.path.join(os.path.dirname(maplib.GAZETTEER), "thyrcross.png")
    if os.path.exists(base):
        size = list(Image.open(base).size)
        if size != wh:
            errors.append(f"canvas mismatch: gazetteer {wh} vs thyrcross.png {size}")
    else:
        warnings.append("thyrcross.png not found beside the gazetteer")

    for nat in gaz["nations"]:
        a = nat["anchor_px"]
        if not in_canvas(a, wh):
            errors.append(f"nation {nat['id']}: anchor {a} outside canvas")
        poly = nat.get("polygon")
        if not poly:
            warnings.append(f"nation {nat['id']}: no traced polygon")
        elif not maplib.point_in_poly(a, poly):
            errors.append(f"nation {nat['id']}: anchor {a} not inside its own polygon")

    for city in gaz["cities"]:
        if not in_canvas(city["px"], wh):
            errors.append(f"{city['id']}: {city['px']} outside canvas")
        elif maplib.nation_at(gaz, city["px"]) is None:
            warnings.append(f"{city['id']} at {city['px']} is outside every nation polygon")

    site_by_coord = {}
    unpainted = 0
    for site in gaz["sites"]:
        if not in_canvas(site["px"], wh):
            errors.append(f"site {site['id']}: {site['px']} outside canvas")
        site_by_coord[site["id"]] = tuple(site["px"])
        if "painted" not in site:
            errors.append(f"site {site['id']}: missing 'painted' flag (is it on Ben's "
                          f"Thycross.procreate yet? see scripts/map/paint_overlay.py)")
        elif not site["painted"]:
            unpainted += 1
    for city in gaz["cities"]:
        if city.get("name") and "painted" not in city:
            errors.append(f"{city['id']} ('{city['name']}'): named cities need a 'painted' "
                          f"flag too (the name isn't lettered on Ben's map until painted)")
    if unpainted:
        print(f"NOTE  {unpainted} site(s) not yet painted on Thycross.procreate — "
              f"regenerate the guide layer with scripts/map/paint_overlay.py")

    repo = maplib.REPO
    for doc in DOCS:
        path = os.path.join(repo, doc)
        if not os.path.exists(path):
            continue
        text = open(path, encoding="utf-8").read()
        for m in COORD_RE.finditer(text):
            p = (int(m.group(1)), int(m.group(2)))
            if not in_canvas(p, wh):
                # plenty of non-coordinate "(123, 456)" text could false-positive;
                # only flag pairs that LOOK like on-map coordinates gone out of range
                if 100 <= p[0] <= 9999 and 100 <= p[1] <= 9999:
                    warnings.append(f"{doc}: coordinate-looking pair {p} outside canvas")
                continue
            line = text[text.rfind("\n", 0, m.start()) + 1: m.start()]
            for site in gaz["sites"]:
                name = site.get("name") or site["id"]
                if name.lower() in line.lower():
                    gx, gy = site_by_coord[site["id"]]
                    if abs(p[0] - gx) > TOL_PX or abs(p[1] - gy) > TOL_PX:
                        errors.append(f"{doc}: '{name}' coordinate {p} drifted from gazetteer ({gx}, {gy})")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"lint_map: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
