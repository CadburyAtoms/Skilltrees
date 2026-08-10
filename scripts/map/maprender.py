"""Shared PIL render scaffold for the Thyrcross map render/overlay scripts
(wave 3B, 2026-08-10) — font loading, label/text-halo drawing, the settlement
driver-color palette, and the region-canvas inverse transform. Consolidated
out of render.py, render_player.py, paint_overlay.py, hydro_overlay.py, and
render_settlements.py, which had each grown their own byte-identical or
drifted copy.

region_overlay.py and world_settlement.py carry the same shapes but are
OUT OF SCOPE for this pass (deferred) — their copies stay as-is; do not point
them at this module without a separate review of their own drift.

Every consumer here already hard-requires PIL, so PIL is imported at module
level — unlike maplib.py's raster helpers, which import PIL/numpy lazily so
maplib itself stays importable with neither (lint_map.py's CI job installs
Pillow but not numpy).
"""
import math

from PIL import ImageFont

# Font search order — unified 2026-08-10. render.py / render_player.py /
# paint_overlay.py / hydro_overlay.py already agreed on Windows-first; only
# render_settlements.py's old inline (bold, reg) loader tried DejaVu first,
# so on a machine carrying both font sets it alone picked a different
# typeface. load_fonts() below now shares this same order.
FONTS = ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]

INK = (255, 0, 230, 255)   # magenta paint-guide ink (paint_overlay.py / hydro_overlay.py)
HALO = (0, 0, 0, 235)

# Settlement driver -> marker color (render_settlements.py). region_overlay.py
# and world_settlement.py keep their own copies (deferred, out of scope).
DRIVER_STYLE = {
    "water": (91, 141, 184),
    "shrine": (122, 158, 95),
    "specialty": (201, 123, 74),
    "junction": (217, 164, 65),
    "fort": (176, 74, 74),
}


def font(size):
    """Single bold font at `size`, first path in FONTS that resolves."""
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def load_fonts(large, small):
    """Bold+regular font pair at (large, small) sizes — render_settlements.py's
    shape. Search order matches FONTS (Windows first, then DejaVu); the old
    inline loader this replaces tried DejaVu first, the one place that
    disagreed with every other renderer (fixed 2026-08-10)."""
    for bold, reg in (
        ("C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ):
        try:
            return ImageFont.truetype(bold, large), ImageFont.truetype(reg, small)
        except OSError:
            continue
    return ImageFont.load_default(), ImageFont.load_default()


def boxed_label(draw, x, y, text, fill, fnt, bg=(0, 0, 0, 190), pad=(12, 9, 16)):
    """Centered text on a filled box. Defaults reproduce render.py's geometry
    (bg alpha 190, pad 12/9/16); render_player.py's tighter box (alpha 170,
    pad 8/6/10) is supplied by its own wrapper, not a different default here
    — each caller keeps its current geometry explicitly."""
    bb = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x0, y0 = x - tw // 2, y - th // 2
    p1, p2, p3 = pad
    draw.rectangle([x0 - p1, y0 - p2, x0 + tw + p1, y0 + th + p3], fill=bg)
    draw.text((x0, y0), text, fill=fill, font=fnt)


def haloed_text(draw, xy, text, fnt, ink=INK, halo=HALO):
    """Text with an 8-direction halo — paint_overlay.py's / hydro_overlay.py's
    marker labels. Unified on hydro_overlay.py's parameterized form (the
    other copy hardcoded fill=INK)."""
    x, y = xy
    for ox in (-3, 0, 3):
        for oy in (-3, 0, 3):
            if ox or oy:
                draw.text((x + ox, y + oy), text, fill=halo, font=fnt)
    draw.text((x, y), text, fill=ink, font=fnt)


def text_outlined(draw, xy, s, font, fill=(255, 250, 235, 255), halo=(20, 15, 5, 220)):
    """4-direction outlined text — render_settlements.py's legend/label style.
    (region_overlay.py's 6-offset variant is a different shape and is
    deferred — do not merge it into this one.)"""
    x, y = xy
    for ox, oy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        draw.text((x + ox, y + oy), s, font=font, fill=halo)
    draw.text((x, y), s, font=font, fill=fill)


def region_frame_corners(gaz, region_idx=0, anchor_id="elmsworth"):
    """World-px corners of a region map's canvas frame, as a closed 5-point
    ring — the inverse of region_maps[i].world_transform. Moved out of
    render_settlements.py's inline math (2026-08-10), derived entirely from
    the gazetteer: native_px is the canvas size and world_transform gives
    scale/rotation/the anchor's REGION px. The anchor's WORLD px isn't stored
    under region_maps itself — it's the matching gazetteer site (id
    "elmsworth" carries px [1036, 1359], the value render_settlements.py used
    to hardcode here)."""
    rm = gaz["region_maps"][region_idx]
    wt = rm["world_transform"]
    s, rot = wt["scale_region_px_per_world_px"], math.radians(wt["rotation_deg"])
    a_, b_ = s * math.cos(rot), s * math.sin(rot)
    ax, ay = wt["anchors"][anchor_id]["region_px"]
    wx, wy = next(p["px"] for p in gaz["sites"] if p["id"] == anchor_id)
    tx, ty = ax - (a_ * wx - b_ * wy), ay - (b_ * wx + a_ * wy)
    det = a_ * a_ + b_ * b_

    def r2w(p):
        X, Y = p[0] - tx, p[1] - ty
        return ((a_ * X + b_ * Y) / det, (-b_ * X + a_ * Y) / det)

    w, h = rm["native_px"]
    return [r2w(p) for p in ((0, 0), (w, 0), (w, h), (0, h), (0, 0))]
