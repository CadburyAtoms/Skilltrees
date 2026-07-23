---
name: region-forge
description: Build the settlement layer of an Edha region-level map — derive cities/market towns from population + trade geometry, sketch hydrologically-sane tributaries, generate the driver-tagged town overlay for Ben's Procreate canvas. Use whenever Ben shares a region map export or asks to populate/plot cities, towns, rivers, or roads on a region map ("here's the region map for session N", "how many cities should be here", "plot the towns", "make me an overlay"). Drives: register the canvas (anchor glyphs → transform) → derive the rosters (rulings 150–152 method) → tributaries rivers-first (hydrology rules, ruling 156) → driver-mix town placement (rulings 155/157: exogeneity order, derived spacing) → overlay draft → Ben's visual gate → gazetteer commit → the ruling-118 naming pass. The Palewater map (rulings 150–157, 2026-07-22) is the worked example.
---

# Region-forge — from "here's my region canvas" to an approved settlement overlay

Born from the 2026-07-22 Palewater pass (rulings 150–156). The deliverable is always the
same shape: a full-canvas **transparent PNG guide layer** Ben drops into his Procreate
stack and paints under, plus the same placements committed to the gazetteer as queryable
canon. The tool is `scripts/map/region_overlay.py` — region-specific facts live in its
CONFIG block; everything below it is reusable machinery.

**The gates are lore-forge's gates.** Population/urbanization dials, city rosters, driver
mixes, and every placement batch are walked with Ben in section order, approval before
commit. The overlay itself ships as a DRAFT (composite + layer) and Ben's visual yes is
the gate that lets instance data into the gazetteer. Nothing about this skill relaxes that.

## Phase 1 — Register the canvas (never eyeball the alignment)

1. Get the export at **native resolution** (ask — a downscaled JPG silently degrades the
   final layer). Record `native_px` and confirm the scale bar.
2. Ben's already-painted glyphs are the anchors: detect ≥3 (compact-dark-blob detection in
   `detect_anchor`; guesses within ~50 px), solve the world→region **similarity transform**
   (`solve_similarity`). Sanity: rotation ≈ 0; |rot| > 1.5° means a detection grabbed river
   ink or label text — fix the detection, don't ship the rotation.
3. Classify the drawn water (`water_mask`) and snap everything river-adjacent to the
   **painted** channel (`snap_river`/`drawn_km`) — Ben's freehand art deviates from the
   world-map trace and **the drawn art wins**. Gazetteer world-px for anything snapped
   (e.g. the Palewater ferry-pair cities) gets synced back through the inverse transform.
4. Register the canvas in the gazetteer's `region_maps` (native_px, km_per_px, transform,
   anchors) so every future placement on this map is a query, not an eyeball.

## Phase 2 — The settlement derivation (the rulings, not vibes)

- **Tiers (ruling 150):** capital / cities (~10k+, world-glyph tier) / market towns
  (2k–10k, the region-map tier) / villages (unplotted unless plot-relevant).
- **Cities from trade geometry (150):** heads of navigation, mouths/confluences, harbors,
  border roads, capitals, resource centers. Absorb an existing vibes-glyph at a derived
  node (the Aldercourt/Brandmere pattern); mint a new glyph where geometry demands
  (`painted: false` until Ben's brush).
- **Counts and populations are BOTTOM-UP now (ruling 161, supersedes the ruling-85 basis):**
  the world is frontier / points-of-light — the mapped settlement layer is ~complete, ~10%
  of people live in unmapped hamlets, and **national population derives FROM the settlement
  layer** (towns × dial avg size + cities, ÷ 0.9 — `settle_gazetteer.py` closes the
  ledgers in `meta.population_ledgers` exactly). Region passes take their counts from the
  dials' `national_towns` / the density law, never from a population prose figure. New
  nations still need their dials walked with Ben first — lore-forge Phase 4b owns that
  (and its 2026-07-22 demand-side ledger + reconciliation gates are the method).
- **No dot without a driver (ruling 155):** every market town is water / specialty /
  junction / fort / shrine, with a per-nation mix dial. The driver is stored in the
  gazetteer `market_towns` block — queryable canon, and each is a one-line hook a session
  can spend.
- **Spacing is derived, never eyeballed (ruling 157):** target market-town spacing =
  **⅔ × the day-rate of the nation's dominant farm-to-market mode** (the one-day-return
  market rule — a third of the day out, a third trading, a third home; it reproduces the
  13th-c English 6⅔-mile market statute). The inputs live in the gazetteer:
  `meta.travel_modes_km_per_day` (full mode table — foot_loaded 24, cart_ox 18,
  cart_horse 32, horse 50, boat_local up/down 20/50, courier 140, plus the ruled four)
  and `meta.settlement_dials` (per-nation `draft_animal` → dominant mode → spacing —
  **Ben's tunable dial**; Thalendor ox/foot_loaded → 16 km, Corvaine horse/cart_horse →
  21 km). Two traps: **carts extend load, not range** — a loaded ox-cart is slower than a
  walker, so ox nations keep foot spacing; and **cities follow a different rhythm** —
  long-haul day-multiples (barge 110, caravan 30–40), major trunk nodes ~100–150 km apart
  (the ferry-pair at barge-day 5 obeys this). A nation with no dial yet gets it walked
  with Ben (lore-forge Phase 4b) before its region pass.

## Phase 3 — Tributaries FIRST, towns second (hydrology rules, ruling 156)

The main river's feeders are canon geography and towns snap to them, so they precede
placement. The rules that the opus audit made law after the Palewater draft-1 failure
(5 of 7 tributaries were *barbed* — sourced downstream of their mouths):

- **Source uphill/upstream of the mouth**; the course *descends* into the river — for a
  N→S river that means sources north of mouths, confluences opening downstream. Never flat,
  never parallel to the main river for long reaches.
- **Dendritic**: majors get forks. **Lakes with outflows get inflows.** A head reach fed by
  a lake outflow correctly has no tributary of its own.
- **Mouths are load-bearing** (towns and canon snap there); middles are Ben's to repaint
  freely — say so in the waterway note. Mouths that fall in a wild/suppressed corridor do
  no settlement work; that can be fine (scenic) but check the settled band has at least one
  working confluence (the trib-T5 lesson).

## Phase 3C — The CONTINENTAL hydrology pass (ruling 156 scaled to the whole map)

Run once per world map (or when Ben's topography answers change): derive every basin
and trunk river before ANY settlement refinement — water towns need true rivers. The
2026-07-23 pass (Ben's H1–H9 brief in EDHA_SETTLEMENT_AUDIT.md → gazetteer `lakes[]` /
`basins[]` / waterway upserts) is the worked example; `scripts/map/trace_hydrology.py`
is the tool (CONFIG = the continental inventory; report mode, then `--update`) and
`scripts/map/hydro_overlay.py` renders the Procreate guide + the review composite.

1. **Fixed points FIRST.** Walk the topography questions with Ben before deriving
   anything (which mountains are the roof, where each lake drains, which lakes are
   closed, the weather model). His answers are the pins; everything else is derived
   from paint + those pins and stays ⚑ repaintable.
2. **Component-analyze the drawn water layer — never assume connectivity.** Label the
   paint's connected components and put every one in the inventory (lake / channel /
   dash-chain / speck-anchor / non-canon stray). Overlapping bounding boxes are NOT
   connectivity (the flag-1 audit error). Tiny specks are evidence: Ben's dashes
   often anchor a derived course.
3. **Lakes are seed-grown, not thresholded.** Rivers are drawn over-width (ruling
   153), so a width threshold can't separate lake from channel — grow each KNOWN lake
   from a seed via morphological opening (per-lake radius), or take the whole
   component for marsh/narrow lakes. Shores are schematics; say so.
4. **Trace painted trunks as skeleton paths** between chosen endpoints (the
   trace_rivers.py machinery), clipping each trace at its OWN source/mouth lakes only
   (other lakes' grown masks graze channels and would split them). Bridge declared
   paint gaps (dashed mouth reaches) explicitly. Headwater ink may interleave across
   a divide (one painted blob serving two basins) — split by declared endpoints and
   call the divide schematic.
5. **Derive the rest under the laws**, each with a `_basis` naming its ruling:
   source uphill of mouth; courses descend and never cross a painted channel; lakes
   with outflows get inflows (compact splatter lakes may be `headwater: true` —
   inflows sub-scale); ONE outlet per lake; closed lakes say so; arid country gets
   ephemeral washes + waterhole chains + rim springs (the H8 Australian model), not
   perennial rivers. Every waterway: polyline SOURCE→MOUTH, `flow` text, `mouth`
   {sea|lake|waterway|pan} — mouths load-bearing, middles repaintable.
6. **Basins are geodesic partitions, honestly labeled.** Multi-source BFS over land
   from each system's water (+ the coast as the residual coastal-fringe class) gives
   first-order watershed polygons. No elevation model exists: divides are SCHEMATIC,
   flagged as such, and Ben's brush outranks them.
7. **Lint enforces the laws** (lint_map.py hydrology section): mouth anchoring, one
   outlet per lake, inflow presence, DAG termination at sea/pan/closed lake, basin
   cross-references; settlement water-reference resolution stays a WARNING until the
   settlement layer re-runs on the new rivers.
8. **Deliver guides, not repaints.** Derived courses ship `painted: false` on the
   hydro overlay; Ben paints, then flags flip. New forks the derivation surfaces
   (which inlet, joined-or-separate basins, surface-vs-karst connectors) are batched
   with recommended defaults — never decided silently.

Continental gotchas (each earned 2026-07-23): the base art paints rivers in sea-navy
AND they touch the sea, so a sea flood-fill leaks upstream — mask the rivers layer
out first; a derived feeder that crosses a painted channel is wrong even when the
terrain "allows" it (reroute or shorten — the T1/fenholt lessons); city glyphs sit
20–30 km off their lake shores at world scale — "on the lake" means nearest-glyph,
not zero distance.

## Phase 4 — Placement (what the generator encodes; don't hand-place)

**Driver order = descending exogeneity (ruling 157): water → specialty → fort → shrine →
junction.** Place what immovable geography pins hardest first — every later driver must
dodge the earlier ones, and a movable driver dodging a pinned one is fine while the
reverse corrupts both. Water nodes and resource bodies (the ore is where it is) are
equally pinned, and specialty towns generate the road demand junctions derive from; forts
come third because the ones with teeth guard *things already placed* (fords, ferries,
mines — ruling 155's "ferry garrisons"); shrines fourth because **remoteness is computed
relative to everything already placed** — a shrine placed early is retroactively
not-remote (exception: exogenous sacred geography like Root-Network dense points may pin
as early as water); junctions last by definition — they exist only where the derived road
graph crosses itself. *(The Palewater run predates this: the code's water → fort →
specialty → shrine order is seed-frozen under the approved draft-2 — do NOT re-run
Palewater with reordered code; the next region's config adopts the 157 order and the
derived spacing dials in place of the flat `min_d` constants.)*

`region_overlay.py` is seeded and deterministic — same config, same map. The rules it
enforces, which any edit must preserve: water towns prefer confluences, then lower trib
courses, then banks/lakeshores; **junction towns sit only at true crossings** (road×road,
road×tributary bridge, confluence) on a road graph **derived** from the settlements (MST +
k-nearest lattice per nation; roads never cross painted water except at a ferry/bridge
city); specialty towns anchor to features (mountain-fringe mines, water-edge mills);
shrine towns take the *most remote* interior spots — that is what keeps a
forest-interior-empty rule true on the map; forts hold their band along wild corridors.
**Shortfalls are reported, never relabeled** — an unfillable driver quota is a geographic
finding for Ben (the in-frame Corvaine junction deficit), not an error to scatter away.

## Phase 5 — The draft gate, then the commit

1. Render, composite over the export, **inspect it yourself** (Read the composite: check
   anchors ring the painted glyphs, pairs straddle the river, nothing sits in water or a
   wild zone), then send Ben BOTH the composite and the transparent layer. This is a DRAFT.
2. On change requests: config edits + re-run (the audit loop is cheap; Ben's "send an opus
   subagent at it" pass caught what self-review missed — offer it for big revisions).
3. On the visual yes, commit the batch: tributary `waterways` entries, the `market_towns`
   block, `region_maps` registration, any city px syncs — then handoff delta, TODO, canon
   ruling, codex/dashboard rebuilds, the full doc gates. Docs-only, no rebuild, say so.

## Phase 6 — The naming pass is separate (ruling 118)

Corridor/label-tier towns, new cities, lakes, and tributaries get names in a dedicated
god-fossil walk with Ben, by section (see W30 for the Palewater queue). Unnamed cities do
NOT join `paint_overlay.py`'s world-canvas backlog — the painting pass rides the naming
close-out.

## Gotchas (each earned)

- A "Withervale ring 40 px off" anchor = contaminated blob detection → bogus rotation that
  grows with distance. Check residuals AND rotation before trusting the transform.
- Tributary guide lines are not in the painted-water mask — placement tests that require
  water adjacency reject every bridge/mouth candidate on them. Place at the crossing.
- Near-neighbor road graphs are nearly planar: road×road crossings are rare, so junction
  quotas starve. Densify k and retry; if still short, that's the geography talking.
- The nation border along a border-river: the **bank rule beats the coarse polygon** within
  ~30 px of the drawn channel (the polygons drift ~20 px off the trace in places).
