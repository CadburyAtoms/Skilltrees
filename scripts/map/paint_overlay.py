"""Paint-guide overlay — the session-forge → Ben's-Procreate-map handoff.

Sessions invent places (sites, named cities) into the gazetteer; Ben's hand-drawn
Thycross.procreate doesn't know about them until he paints them. This renders a
transparent PNG at exactly the source canvas size (meta.canvas_px) with a crosshair +
name label for every gazetteer place still flagged `painted: false`. Ben imports it
into Procreate as a top guide layer, paints his art under each marker, deletes the
layer, and flips the flags (or tells a session to).

Coordinates need no conversion: gazetteer px ARE Procreate canvas px (extracted from it).

Usage:
  python scripts/map/paint_overlay.py            # write source-materials/maps/paint-overlay.png
  python scripts/map/paint_overlay.py --list     # just print the unpainted backlog
  python scripts/map/paint_overlay.py --all      # include already-painted places (full reference)

After painting: re-run scripts/map/extract_procreate.py so thyrcross.png and the traced
layers pick up the new art (this script warns when meta.source is stale vs the .procreate).
"""
import argparse
import os

from PIL import Image, ImageDraw

import maplib
from maprender import INK, font, haloed_text

OUT_DEFAULT = os.path.join(os.path.dirname(maplib.GAZETTEER), "paint-overlay.png")


def unpainted_places(gaz, include_painted=False):
    """(kind, dict) for every place Ben's source map is missing.

    Sites always carry the flag; cities only join the backlog once they have a
    name (the 29 anonymous dots are already drawn — a name is what needs painting).
    """
    out = []
    site_names = set()
    for s in gaz.get("sites", []):
        site_names.add((s.get("name") or s["id"]).lower())
        if include_painted or not s.get("painted", False):
            out.append(("site", s))
    for c in gaz.get("cities", []):
        # a named city that also has a site entry (e.g. Aldercourt = city-18) is
        # already covered by the site — don't list it twice
        if c.get("name") and c["name"].lower() not in site_names \
                and (include_painted or not c.get("painted", False)):
            out.append(("city", c))
    return out


def crosshair(draw, x, y, r=26, gap=9, w=5):
    draw.ellipse([x - r, y - r, x + r, y + r], outline=INK, width=w)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        draw.line([x + dx * gap, y + dy * gap, x + dx * (r + 18), y + dy * (r + 18)],
                  fill=INK, width=w)


def check_extraction_stale(gaz):
    src = gaz["meta"].get("source", {})
    path = os.path.join(maplib.REPO, src.get("file", "").replace("/", os.sep))
    if not src.get("file") or not os.path.exists(path):
        return  # .procreate lives on Ben's machine/OneDrive; silence when absent
    st = os.stat(path)
    if st.st_size != src.get("size") or int(st.st_mtime) != src.get("mtime"):
        print("WARN  Thycross.procreate differs from the extraction stamp in meta.source —")
        print("      thyrcross.png and the traced layers are STALE. After painting, re-run")
        print("      scripts/map/extract_procreate.py and re-trace (see MAP_CHEATSHEET.md).")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", default=OUT_DEFAULT)
    ap.add_argument("--list", action="store_true", help="print the unpainted backlog, render nothing")
    ap.add_argument("--all", action="store_true", help="include painted places (full reference overlay)")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    places = unpainted_places(gaz, include_painted=args.all)
    kpp = gaz["meta"]["km_per_px"]

    if args.list:
        if not places:
            print("nothing unpainted — Ben's map is current with the gazetteer")
        for kind, p in places:
            nat = maplib.nation_at(gaz, p["px"])
            mark = "painted" if p.get("painted") else "UNPAINTED"
            print(f"{mark:9s} {kind:4s} {p.get('name') or p['id']:22s} px({p['px'][0]}, {p['px'][1]})"
                  f"  {p['px'][0]*kpp:.0f},{p['px'][1]*kpp:.0f} km"
                  f"  {nat['name'] if nat else 'open water'}")
        check_extraction_stale(gaz)
        return

    w, h = gaz["meta"]["canvas_px"]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    f_name, f_hint = font(46), font(30)

    for kind, p in places:
        x, y = p["px"]
        crosshair(draw, x, y)
        dx, dy = p.get("label_offset", [56, -64])
        haloed_text(draw, (x + dx, y + dy), p.get("name") or p["id"], f_name)
        if kind == "city":
            haloed_text(draw, (x + dx, y + dy + 52), f"(name for existing dot {p['id']})", f_hint)

    img.save(args.out)
    print(f"paint overlay -> {args.out}  ({len(places)} marker(s); import into Procreate as a top layer)")
    for kind, p in places:
        print(f"  - {p.get('name') or p['id']} at ({p['px'][0]}, {p['px'][1]})")
    check_extraction_stale(gaz)


if __name__ == "__main__":
    main()
