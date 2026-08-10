#!/usr/bin/env python3
"""render_settlements.py — the full-continent settlement guide layer from CANON.

Renders gazetteer `market_towns` (ruling 161: 1,240 driver-tagged towns with
populations) as a transparent world-canvas overlay: dot radius scales with the
town's population tier, driver colors per region-forge, city rings + the
Palewater region frame for orientation. Pure render — no derivation; re-run
after any gazetteer settlement change.

Usage: python scripts/map/render_settlements.py <out-overlay.png> [<out-composite.jpg>]
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

import maprender
from maprender import DRIVER_STYLE

ROOT = Path(__file__).resolve().parents[2]
GAZ = ROOT / "source-materials/maps/thyrcross.map.json"
BASE = ROOT / "source-materials/maps/thyrcross.png"

# Pop tier -> SHAPE (Ben 2026-07-22: sizes must be identifiable at a glance;
# shape beats radius on a dense map): circle < square < triangle < diamond.
TIERS = [(3500, "circle", 3), (6000, "square", 4), (8000, "triangle", 6),
         (10001, "diamond", 7)]


def tier(pop):
    for ceil, shape, r in TIERS:
        if pop < ceil or ceil == TIERS[-1][0]:
            return shape, r
    return TIERS[-1][1], TIERS[-1][2]


def draw_shape(dr, x, y, shape, r, fill, outline=(25, 18, 8, 255)):
    if shape == "circle":
        dr.ellipse([x - r, y - r, x + r, y + r], fill=fill, outline=outline, width=1)
    elif shape == "square":
        dr.rectangle([x - r, y - r, x + r, y + r], fill=fill, outline=outline, width=1)
    elif shape == "triangle":
        dr.polygon([(x, y - r), (x + r, y + r * 0.8), (x - r, y + r * 0.8)],
                   fill=fill, outline=outline, width=1)
    elif shape == "diamond":
        dr.polygon([(x, y - r), (x + r, y), (x, y + r), (x - r, y)],
                   fill=fill, outline=outline, width=1)


def main():
    out_png = sys.argv[1]
    out_jpg = sys.argv[2] if len(sys.argv) > 2 else None
    gaz = json.load(open(GAZ))
    W, H = gaz["meta"]["canvas_px"]
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    F, Fs = maprender.load_fonts(26, 18)

    def text_outlined(xy, s, font, fill=(255, 250, 235, 255)):
        return maprender.text_outlined(dr, xy, s, font, fill=fill)

    # region frame (orientation)
    corners = maprender.region_frame_corners(gaz)
    dr.line([tuple(map(int, c)) for c in corners], fill=(255, 255, 255, 80), width=2)

    # city rings (Ben's glyph tier — orientation only)
    for c in gaz["cities"]:
        x, y = c["px"]
        dr.ellipse([x - 9, y - 9, x + 9, y + 9], outline=(255, 250, 235, 150), width=2)

    towns = gaz["market_towns"]["towns"]
    top = {}
    for t in towns:
        if t["nation"] not in top or t["pop"] > top[t["nation"]]["pop"]:
            top[t["nation"]] = t
    for t in sorted(towns, key=lambda t: t["pop"]):
        x, y = t["px"]
        shape, r = tier(t["pop"])
        draw_shape(dr, x, y, shape, r, DRIVER_STYLE[t["driver"]] + (235,))
    for t in top.values():   # each nation's biggest town gets a halo
        x, y = t["px"]
        dr.ellipse([x - 10, y - 10, x + 10, y + 10],
                   outline=(255, 250, 235, 210), width=2)

    lx, ly = 40, 60
    dr.rounded_rectangle([lx - 14, ly - 16, lx + 470, ly + 314], radius=10,
                         fill=(20, 15, 5, 180))
    text_outlined((lx, ly), "SETTLEMENT LAYER — ruling 161 (canon)", F)
    ly += 40
    for d, c in DRIVER_STYLE.items():
        dr.ellipse([lx, ly + 4, lx + 14, ly + 18], fill=c + (255,))
        text_outlined((lx + 22, ly), f"{d} town", Fs)
        ly += 26
    sx = lx + 8
    for shape, r, label in (("circle", 3, "2-3.5k"), ("square", 4, "3.5-6k"),
                            ("triangle", 6, "6-8k"), ("diamond", 7, "8-10k")):
        draw_shape(dr, sx, ly + 11, shape, r, (235, 225, 205, 255))
        text_outlined((sx + 14, ly), label, Fs)
        sx += 105
    ly += 26
    text_outlined((lx, ly), "halo: nation's biggest town · ring: city glyph", Fs); ly += 26
    text_outlined((lx, ly), "white rect: Palewater region frame", Fs); ly += 26
    n_pop = sum(t["pop"] for t in towns)
    text_outlined((lx, ly),
                  f"{len(towns)} towns · {n_pop / 1e6:.2f}M town-tier"
                  f" · continent ~5.68M", Fs); ly += 26
    text_outlined((lx, ly), "ashkar + sylvaneth pending their walks", Fs)

    ov.save(out_png)
    print(f"wrote {out_png} ({len(towns)} towns)")
    if out_jpg:
        base = Image.open(BASE).convert("RGBA")
        Image.alpha_composite(base, ov).convert("RGB").save(out_jpg, quality=90)
        print(f"wrote {out_jpg}")


if __name__ == "__main__":
    main()
