"""Render the PLAYER-SAFE labeled map (for EDHA_PLAYER_PRIMER.html).

Unlike render.py (the GM composite: every gazetteer site, red markers), this renders only
common-knowledge geography:
  - nation labels (same as GM render)
  - every NAMED city (the public towns — all appear in EDHA_PLAYER_PRIMER.md)
  - an explicit allowlist of public sites (capitals / landmarks the primer names)

Sites NOT on the allowlist (session-secret landmarks: Black Altar Crossing, Withervale,
Palewater Ford, the Ashhold, Elmsworth, ...) are omitted on purpose. If a site becomes
player-known at the table, add it to PUBLIC_SITES and rebuild.

Outputs a quality-88 JPEG (base64-embedded whole into the primer HTML, so size matters).

Usage:
  python scripts/map/render_player.py            # -> source-materials/maps/thyrcross-player.jpg
"""
import os

from PIL import Image, ImageDraw, ImageFont

import maplib

FONTS = ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]

# Public common-knowledge sites (everything else in gazetteer["sites"] is GM-only).
# City-mirror sites (Kaelmouth, Raskeld, Kaelgate, ...) are covered by the named-cities pass.
PUBLIC_SITES = {
    "heartholt": "capital",        # Thalendor's capital — common knowledge
    "canticle-capital": "capital",  # Arcanta (primer §Canticle)
    "salt-heart-pan": "landmark",   # the Hush, the great salt pan (primer §Canticle)
    "west-border-lake": "landmark",  # Lake Vespera, public geography
}

# Capitals among the named cities get the capital label style.
CAPITAL_CITIES = {"Maelstrand", "Kenmere", "Aldercourt", "Goldenport", "Moonmere", "Kragmoot", "Kaelmouth"}


def font(size):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def boxed_label(draw, x, y, text, fill, fnt, bg=(0, 0, 0, 170)):
    bb = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x0, y0 = x - tw // 2, y - th // 2
    draw.rectangle([x0 - 8, y0 - 6, x0 + tw + 8, y0 + th + 10], fill=bg)
    draw.text((x0, y0), text, fill=fill, font=fnt)


def main():
    gaz = maplib.load_gazetteer()
    maps_dir = os.path.dirname(maplib.GAZETTEER)
    img = Image.open(os.path.join(maps_dir, "thyrcross.png")).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    f_nation, f_cap, f_town = font(52), font(36), font(30)

    for nat in gaz["nations"]:
        x, y = nat["anchor_px"]
        dx, dy = nat.get("label_offset", [0, -60])
        boxed_label(draw, x + dx, y + dy, nat["name"], (255, 240, 120), f_nation)

    for city in gaz["cities"]:
        if not city.get("name"):
            continue
        x, y = city["px"]
        capital = city["name"] in CAPITAL_CITIES
        fnt = f_cap if capital else f_town
        fill = (255, 226, 168) if capital else (235, 238, 248)
        r = 9 if capital else 7
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(20, 24, 40, 255),
                     outline=(235, 238, 248, 255), width=3)
        boxed_label(draw, x, y - (34 if capital else 28), city["name"], fill, fnt)

    for site in gaz["sites"]:
        kind = PUBLIC_SITES.get(site["id"])
        if not kind:
            continue
        x, y = site["px"]
        if kind == "capital":
            draw.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(20, 24, 40, 255),
                         outline=(255, 226, 168, 255), width=3)
            boxed_label(draw, x, y - 34, site["name"], (255, 226, 168), f_cap)
        else:
            boxed_label(draw, x, y, site["name"], (200, 225, 255), f_town, bg=(0, 20, 50, 150))

    out = os.path.join(maps_dir, "thyrcross-player.jpg")
    img.convert("RGB").save(out, quality=88)
    print(f"rendered -> {out} ({os.path.getsize(out) // 1024} KB)")


if __name__ == "__main__":
    main()
