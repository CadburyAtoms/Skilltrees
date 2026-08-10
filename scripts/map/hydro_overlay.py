"""Hydrology paint-guide overlay — the hydrology pass → Ben's-Procreate handoff.

The paint_overlay.py pattern, for waterways: renders a transparent full-canvas PNG
(meta.canvas_px) of everything the 2026-07-23 hydrology pass DERIVED but Ben's
Rivers And Lakes layer doesn't show yet (`painted: false` waterways) — dashed
courses with a mouth arrowhead, waterhole chains and pan-rim springs as circles,
the Hush's pan as a schematic ellipse. Ben imports it as a top guide layer, paints
under it (mouths are load-bearing, middles are his to reroute), deletes the layer,
and a session flips the `painted` flags.

Also renders the full review composite (--composite): base map + lake shores +
painted traces + derived courses + basin boundaries, for the draft gate.

Usage:
  python scripts/map/hydro_overlay.py               # write hydro-overlay.png (guide)
  python scripts/map/hydro_overlay.py --composite   # + hydro-composite.jpg (review)
"""
import argparse
import math
import os

from PIL import Image, ImageDraw

import maplib
from maprender import INK, font, haloed_text

OUT_GUIDE = os.path.join(os.path.dirname(maplib.GAZETTEER), "hydro-overlay.png")
OUT_COMP = os.path.join(os.path.dirname(maplib.GAZETTEER), "hydro-composite.jpg")


def dashed(draw, pts, fill, width=4, dash=14, gap=9):
    """Draw a dashed polyline."""
    on, rem = True, dash
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg == 0:
            continue
        ux, uy = (x1 - x0) / seg, (y1 - y0) / seg
        t = 0.0
        while t < seg:
            step = min(rem, seg - t)
            if on:
                draw.line([x0 + ux * t, y0 + uy * t,
                           x0 + ux * (t + step), y0 + uy * (t + step)],
                          fill=fill, width=width)
            t += step
            rem -= step
            if rem <= 0:
                on = not on
                rem = dash if on else gap


def arrowhead(draw, p_from, p_to, fill, size=16, width=4):
    """Arrowhead at p_to pointing along p_from -> p_to (the flow direction)."""
    dx, dy = p_to[0] - p_from[0], p_to[1] - p_from[1]
    d = math.hypot(dx, dy) or 1e-9
    ux, uy = dx / d, dy / d
    for sign in (1, -1):
        px = -uy * sign, ux * sign
        draw.line([p_to[0], p_to[1],
                   p_to[0] - ux * size + px[0] * size * 0.6,
                   p_to[1] - uy * size + px[1] * size * 0.6],
                  fill=fill, width=width)


def draw_waterway(draw, w, ink, fnt, label=True):
    pts = [tuple(p) for p in w["polyline"]]
    if len(pts) < 2:
        return
    dashed(draw, pts, ink, width=4)
    arrowhead(draw, pts[-2], pts[-1], ink)
    for hole in w.get("waterholes", []):
        x, y = hole
        draw.ellipse([x - 7, y - 7, x + 7, y + 7], outline=ink, width=3)
    if label:
        mx, my = pts[len(pts) // 2]
        haloed_text(draw, (mx + 10, my - 34), w["id"], fnt, ink)


def render_guide(gaz, out):
    w, h = gaz["meta"]["canvas_px"]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    f_small = font(28)
    n = 0
    for way in gaz["waterways"]:
        if way.get("painted", True):
            continue
        draw_waterway(draw, way, INK, f_small)
        n += 1
    for basin in gaz["basins"]:
        pan = basin.get("pan")
        if pan:
            cx, cy = pan["center"]
            rx, ry = pan["rx_px"], pan["ry_px"]
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry],
                         outline=INK, width=4)
            haloed_text(draw, (cx - 60, cy - 20), "the Hush (pan)", f_small)
        for spring in basin.get("rim_springs", []):
            x, y = spring
            draw.ellipse([x - 6, y - 6, x + 6, y + 6], outline=INK, width=3)
            draw.ellipse([x - 12, y - 12, x + 12, y + 12], outline=INK, width=2)
    img.save(out)
    print(f"hydro guide overlay -> {out}  ({n} derived waterway(s); import into "
          f"Procreate as a top layer)")


def render_composite(gaz, out):
    base = Image.open(os.path.join(os.path.dirname(maplib.GAZETTEER),
                                   "thyrcross.png")).convert("RGB")
    img = base.copy()
    draw = ImageDraw.Draw(img, "RGBA")
    f_small, f_big = font(26), font(38)
    for lake in gaz["lakes"]:
        pts = [tuple(p) for p in lake["shore"]]
        if len(pts) > 2:
            draw.line(pts + [pts[0]], fill=(255, 220, 0), width=3)
    for way in gaz["waterways"]:
        pts = [tuple(p) for p in way["polyline"]]
        if len(pts) < 2:
            continue
        if way.get("kind") == "ephemeral":
            ink = (255, 140, 0, 255)
            dashed(draw, pts, ink, width=4)
        elif way.get("painted", True):
            ink = (0, 90, 255, 255)
            draw.line(pts, fill=ink, width=4)
        else:
            ink = INK
            dashed(draw, pts, ink, width=4)
        arrowhead(draw, pts[-2], pts[-1], ink)
        for hole in way.get("waterholes", []):
            draw.ellipse([hole[0] - 6, hole[1] - 6, hole[0] + 6, hole[1] + 6],
                         outline=ink, width=3)
        mx, my = pts[len(pts) // 2]
        haloed_text(draw, (mx + 8, my - 30), way["id"], f_small, ink)
    for basin in gaz["basins"]:
        pts = [tuple(p) for p in basin.get("polygon", [])]
        if len(pts) > 2:
            draw.line(pts + [pts[0]], fill=(255, 255, 255, 180), width=2)
        pan = basin.get("pan")
        if pan:
            cx, cy = pan["center"]
            draw.ellipse([cx - pan["rx_px"], cy - pan["ry_px"],
                          cx + pan["rx_px"], cy + pan["ry_px"]],
                         outline=(255, 140, 0), width=3)
        for spring in basin.get("rim_springs", []):
            draw.ellipse([spring[0] - 5, spring[1] - 5,
                          spring[0] + 5, spring[1] + 5],
                         outline=(255, 140, 0), width=2)
    img.save(out, quality=90)
    print(f"hydro review composite -> {out}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--composite", action="store_true",
                    help="also render the full review composite")
    args = ap.parse_args()
    gaz = maplib.load_gazetteer()
    render_guide(gaz, OUT_GUIDE)
    if args.composite:
        render_composite(gaz, OUT_COMP)


if __name__ == "__main__":
    main()
