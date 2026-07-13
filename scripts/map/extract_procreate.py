"""Extract full-canvas layer PNGs from a .procreate file (Ben's hand-drawn maps).

Proven against Thycross.procreate (2026-07-12 session). Key facts this encodes so no
session ever re-derives them:
  * .procreate is a zip; Document.archive is an NSKeyedArchiver plist (plistlib reads it).
  * Layer tiles are {col}~{row}.lz4 files of Apple-chunked LZ4: bv41 (u32 raw size, u32
    comp size, LZ4 block) / bv4- (stored) / bv4$ (end), 64 KB blocks sharing one output
    buffer per tile. python-lz4's block API rejects them -> pure-python decoder below.
  * Tiles assemble VERTICALLY FLIPPED (Procreate row order); we un-flip by default.
  * Everything is read in-memory from the zip (no extraction -> no Windows MAX_PATH pain).

Usage:
  python scripts/map/extract_procreate.py <file.procreate> --list
  python scripts/map/extract_procreate.py <file.procreate> --layer "Political Map" \
      [--layer "Cities" ...] --out source-materials/maps/ [--no-flip]
"""
import argparse
import io
import os
import plistlib
import re
import struct
import sys
import zipfile

from PIL import Image

TILE = 256


def lz4_block_into(out, src):
    """Decompress one raw LZ4 block into the shared bytearray `out`."""
    i, n = 0, len(src)
    while i < n:
        tok = src[i]; i += 1
        lit = tok >> 4
        if lit == 15:
            while True:
                b = src[i]; i += 1; lit += b
                if b != 255:
                    break
        out += src[i:i + lit]; i += lit
        if i >= n:
            break
        off = src[i] | (src[i + 1] << 8); i += 2
        ml = tok & 15
        if ml == 15:
            while True:
                b = src[i]; i += 1; ml += b
                if b != 255:
                    break
        ml += 4
        start = len(out) - off
        if off >= ml:
            out += out[start:start + ml]
        else:  # overlapping match (run)
            for j in range(ml):
                out.append(out[start + j])


def apple_lz4(data):
    """Decode Apple compression-framework chunked LZ4 (bv41/bv4-/bv4$)."""
    out = bytearray()
    pos, n = 0, len(data)
    while pos + 4 <= n:
        magic = data[pos:pos + 4]
        if magic == b"bv4$":
            break
        if magic == b"bv41":
            _dsize, csize = struct.unpack_from("<II", data, pos + 4)
            lz4_block_into(out, data[pos + 12:pos + 12 + csize])
            pos += 12 + csize
        elif magic == b"bv4-":
            (dsize,) = struct.unpack_from("<I", data, pos + 4)
            out += data[pos + 8:pos + 8 + dsize]
            pos += 8 + dsize
        else:
            raise ValueError(f"unexpected chunk magic {magic!r} at offset {pos}")
    return bytes(out)


def read_document(zf):
    """Parse Document.archive -> (canvas_w, canvas_h, [layer dicts, top-to-bottom])."""
    pl = plistlib.load(io.BytesIO(zf.read("Document.archive")))
    objs = pl["$objects"]

    def deref(x):
        return objs[x.data] if isinstance(x, plistlib.UID) else x

    top = deref(pl["$top"]["root"])
    size = deref(top["size"])  # e.g. "{2865, 3399}"
    w, h = (int(v) for v in re.findall(r"\d+", str(size)))
    layers = []
    for uid in deref(top["layers"])["NS.objects"]:
        layer = deref(uid)
        layers.append({
            "name": str(deref(layer.get("name"))),
            "uuid": str(deref(layer.get("UUID"))),
            "hidden": bool(deref(layer.get("hidden"))),
            "opacity": float(deref(layer.get("opacity", 1.0))),
        })
    return w, h, layers


def extract_layer(zf, layer, w, h, flip=True):
    """Reassemble one layer's sparse tile set into a full-canvas RGBA image."""
    cols = (w + TILE - 1) // TILE
    rows = (h + TILE - 1) // TILE
    canvas = Image.new("RGBA", (cols * TILE, rows * TILE), (0, 0, 0, 0))
    prefix = layer["uuid"] + "/"
    raw = TILE * TILE * 4
    n_tiles = 0
    for name in zf.namelist():
        if not name.startswith(prefix) or not name.endswith(".lz4"):
            continue
        c, r = (int(v) for v in os.path.basename(name)[:-4].split("~"))
        dec = apple_lz4(zf.read(name))
        if len(dec) != raw:
            raise ValueError(f"tile {name}: got {len(dec)} bytes, expected {raw}")
        canvas.paste(Image.frombytes("RGBA", (TILE, TILE), dec), (c * TILE, r * TILE))
        n_tiles += 1
    img = canvas.crop((0, 0, w, h))
    if flip:
        img = img.transpose(Image.FLIP_TOP_BOTTOM)
    return img, n_tiles


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("procreate", help="path to the .procreate file")
    ap.add_argument("--list", action="store_true", help="list layers and exit")
    ap.add_argument("--layer", action="append", default=[], help="layer name to extract (repeatable)")
    ap.add_argument("--out", default=".", help="output directory for layer PNGs")
    ap.add_argument("--no-flip", action="store_true", help="skip the vertical un-flip")
    args = ap.parse_args()

    st = os.stat(args.procreate)
    with zipfile.ZipFile(args.procreate) as zf:
        w, h, layers = read_document(zf)
        print(f"{os.path.basename(args.procreate)}: canvas {w}x{h}, {len(layers)} layers "
              f"(size={st.st_size}, mtime={int(st.st_mtime)})")
        if args.list or not args.layer:
            for i, l in enumerate(layers):
                vis = "hidden" if l["hidden"] else "visible"
                print(f"  {i:2d} | {vis:7s} op={l['opacity']:.2f} | {l['name']!r} | {l['uuid']}")
            return
        by_name = {l["name"].lower(): l for l in layers}
        os.makedirs(args.out, exist_ok=True)
        for want in args.layer:
            layer = by_name.get(want.lower())
            if layer is None:
                sys.exit(f"ERROR: no layer named {want!r} (use --list)")
            img, n = extract_layer(zf, layer, w, h, flip=not args.no_flip)
            out = os.path.join(args.out, f"layer-{slug(want)}.png")
            img.save(out)
            print(f"  {want!r}: {n} tiles -> {out}")


if __name__ == "__main__":
    main()
