# Map toolchain cheatsheet (scripts/map/ + thyrcross.map.json)

**The rule: geometry questions get QUERIED, never eyeballed.** The gazetteer
(`source-materials/maps/thyrcross.map.json`) is the machine-readable truth; canon §5a is its
prose summary; the PNGs are for humans. All coordinates are full-res pixels on `thyrcross.png`
(2865×3399, 1 px ≈ 1.5 km).

## Everyday queries

```bash
# distance + travel days between named places (sites, cities, nations)
python scripts/map/measure.py dist --from elmsworth --to withervale --via border-river
# a whole route's legs + totals
python scripts/map/measure.py route session-1-relief-run
# what's at / near a coordinate (nation, nearest site/city, distance to waterways)
python scripts/map/measure.py locate --at 1400,2280
# everything that has a name
python scripts/map/measure.py list
```

Travel speeds live in `meta.travel_modes_km_per_day` (barge_down 110 / barge_up 30 / road 40 /
foot 30 — Ben's rulings). Along-river distances use the traced channel; the drawn Palewater
meanders ~2.1× straight-line and that is INTENTIONAL, not an error to "correct."

## Adding a place (new town, fort, dungeon, landmark)

1. Get the coordinate: Ben clicks **`source-materials/maps/viewer.html`** (double-click to open;
   click the map; copy "(x, y)") — or snap to a traced feature (river ports sit ON the channel
   polyline; use `measure.py locate` to verify which nation contains it).
2. Add the entry to the gazetteer (`sites` for campaign locations, with `name_provisional: true`
   for ⚑ names and **`painted: false`** — lint errors without it) **before** any doc references it.
3. Regenerate the labeled map: `python scripts/map/render.py --political
   source-materials/maps/thyrcross-political.png --out source-materials/maps/thyrcross-labeled.png`
4. Regenerate the paint guide + codex (both committed, both reach Ben on pull):
   `python scripts/map/paint_overlay.py` and `node scripts/build-canon-codex.js`
   (CI fails on a stale codex the same way it fails on a stale bench sheet).
5. `python scripts/map/lint_map.py` must pass — it fails on doc coordinates that drift from the
   gazetteer (tolerance 25 px) and runs in CI.

## Getting new places onto Ben's painted map (the paint loop)

Sessions invent places into the gazetteer; Ben's hand-drawn `Thycross.procreate` doesn't know
until he paints them. The handoff is **`source-materials/maps/paint-overlay.png`** — a
transparent PNG at exactly canvas size (gazetteer px ARE Procreate canvas px) with a magenta
crosshair + label for every place still `painted: false`. Ben imports it into Procreate as a
top guide layer, paints his art under each marker, deletes the layer. Then:

1. Flip the painted places to `painted: true` (Ben says which; a session edits the gazetteer).
2. Re-extract (section below) so `thyrcross.png` + traced layers pick up the new art —
   `paint_overlay.py` warns when the `.procreate` stamp says extraction is stale.
3. Regenerate overlay + labeled map + codex.

`python scripts/map/paint_overlay.py --list` prints the unpainted backlog without rendering.

**When Ben moves a place while painting (his brush is the ruling):** nothing detects this
automatically — a session-forged placement is a *proposal* until painted, and if the drawn spot
disagrees with the gazetteer, the gazetteer is what's wrong. Ben clicks the new spot in
`viewer.html`, copies the `(x, y)`, and says so; the session updates the gazetteer px and then
follows the ripple — `lint_map.py` fails every doc still carrying the old coordinate, and
distances/travel times through that place must be re-measured (`measure.py`), not assumed
unchanged. Moved dots on the Cities layer also surface at re-extraction, but painted-art sites
do NOT — the viewer click is the reliable path. The `.procreate` itself is saved OVER the same
file (`source-materials/Thycross.procreate` — OneDrive-synced into the repo folder, gitignored);
a renamed copy is invisible to the staleness stamp and the whole pipeline.

## The human-facing canon view

**`EDHA_CANON_CODEX.html`** (repo root, double-click) is the Atlas+Codex: the map with every
gazetteer place clickable (capitals starred, unpainted places 🖌-tagged) cross-linked to the
rendered canon doc with TOC + search. Generated from canon MD + gazetteer by
`node scripts/build-canon-codex.js` — regenerate after either source changes; CI enforces sync.
It answers Ben's lookups ("which city is Thalendor's capital?") — it is NOT a source of truth.

## When Ben's art changes

The gazetteer's `meta.source` records the `.procreate` size/mtime at extraction time. If
`source-materials/Thycross.procreate` differs, re-extract before trusting layers:

```bash
python scripts/map/extract_procreate.py "<path>/Thycross.procreate" --list
python scripts/map/extract_procreate.py "<path>/Thycross.procreate" \
    --layer "Political Map" --layer "Country Borders" --layer "Cities" --out C:/pw/out
```

Then re-run `trace_regions.py` (polygons), `trace_rivers.py` (new channels), refresh the stamp,
`render.py`, `make_viewer.py`. Gotchas the extractor already handles: Apple-chunked LZ4 tiles,
the vertical flip, Windows MAX_PATH (work under a short path like `C:/pw/`).

## Battle maps

Ben hand-draws them in Procreate from the run-sheet's briefs. Delivered art lands at
`source-materials/maps/battle/<site-slug>.png` plus a `battle_maps` gazetteer entry
(`{id, site, file, grid: [w, h], ft_per_square}`) — that entry is what the Foundry scene import
will read later.
