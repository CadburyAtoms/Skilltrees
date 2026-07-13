"""Render labeled map composites from the gazetteer (deterministic — no hand-labeling).

Usage:
  python scripts/map/render.py --out source-materials/maps/thyrcross-labeled.png
  python scripts/map/render.py --debug --out check.png     # polygons + waterways + cities
  python scripts/map/render.py --route session-1-relief-run --out session1.png
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFont

import maplib

FONTS = ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]


def font(size):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def boxed_label(draw, x, y, text, fill, fnt, bg=(0, 0, 0, 190)):
    bb = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x0, y0 = x - tw // 2, y - th // 2
    draw.rectangle([x0 - 12, y0 - 9, x0 + tw + 12, y0 + th + 16], fill=bg)
    draw.text((x0, y0), text, fill=fill, font=fnt)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", required=True)
    ap.add_argument("--base", default=None, help="base map png (default: thyrcross.png beside gazetteer)")
    ap.add_argument("--political", default=None, help="political layer png to blend (optional)")
    ap.add_argument("--political-alpha", type=float, default=0.30)
    ap.add_argument("--debug", action="store_true", help="draw polygons, waterways, city markers")
    ap.add_argument("--route", help="route id to highlight (sites + legs)")
    ap.add_argument("--no-sites", action="store_true")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    maps_dir = os.path.dirname(maplib.GAZETTEER)
    base_path = args.base or os.path.join(maps_dir, "thyrcross.png")
    img = Image.open(base_path).convert("RGBA")

    if args.political:
        pol = Image.open(args.political).convert("RGBA")
        overlay = Image.blend(Image.new("RGBA", img.size, (0, 0, 0, 0)), pol, args.political_alpha)
        img = Image.alpha_composite(img, overlay)

    draw = ImageDraw.Draw(img, "RGBA")
    f_nation, f_site = font(52), font(38)

    if args.debug:
        for nat in gaz["nations"]:
            poly = nat.get("polygon")
            if poly:
                draw.polygon([tuple(p) for p in poly], outline=(255, 60, 220, 255), width=5)
        for wway in gaz["waterways"]:
            draw.line([tuple(p) for p in wway["polyline"]], fill=(40, 150, 255, 255), width=7)
        for city in gaz["cities"]:
            x, y = city["px"]
            draw.ellipse([x - 10, y - 10, x + 10, y + 10], outline=(255, 255, 0, 255), width=4)

    for nat in gaz["nations"]:
        x, y = nat["anchor_px"]
        dx, dy = nat.get("label_offset", [0, -60])
        name = nat["name"] + ("*" if nat.get("name_provisional") else "")
        boxed_label(draw, x + dx, y + dy, f"{nat['map_letter']}  {name}", (255, 240, 120), f_nation)

    if args.route:
        route = next(r for r in gaz["routes"] if r["id"] == args.route)
        via = route.get("via")
        if via:
            wway = next(w for w in gaz["waterways"] if w["id"] == via)
            draw.line([tuple(p) for p in wway["polyline"]], fill=(255, 90, 30, 220), width=9)

    if not args.no_sites:
        for i, site in enumerate(gaz["sites"], start=1):
            x, y = site["px"]
            dx, dy = site.get("label_offset", [150, 0])
            draw.ellipse([x - 13, y - 13, x + 13, y + 13], fill=(230, 30, 30, 255),
                         outline=(255, 255, 255, 255), width=3)
            boxed_label(draw, x + dx, y + dy, f"{i} {site['name']}", (255, 180, 180), f_site,
                        bg=(60, 0, 0, 200))

    img.convert("RGB").save(args.out)
    print(f"rendered -> {args.out}")


if __name__ == "__main__":
    main()
