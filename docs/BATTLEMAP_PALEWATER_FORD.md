# Battle map — Palewater Ford (session 1, §3)

**Drawing brief for Ben's Procreate pass.** Art lands at
`source-materials/maps/battle/palewater-ford.png` + a `battle_maps` gazetteer entry in
`source-materials/maps/thyrcross.map.json` (add after the art exists, then re-run
`python3 scripts/map/lint_map.py`).

Everything here is derived from `EDHA_SESSION_1_SCRIPT.md` §3 (the scene as approved),
canon **ruling 153** (the Palewater's true width), **ruling 39** (encounter size),
and the statted roster in `data/adversaries.json`. Where the script left a number
unstated, this doc picks one and says so.

---

## 0. Three calls for Ben before you draw

1. **The map is a *window*, not the whole ford — so there is no true shoreline on it.**
   Half a mile of braid (ruling 153 / the read-aloud) is **528 squares** wide; a 30×20 map
   is **150 ft**, about 6% of it. So the "Corvaine bank" of §3 is drawn here as a
   **withy bar** — a long willow-grown gravel island on the Corvaine side of the navigable
   channel — with the true east shore ~1,500–2,000 ft further off-map. This keeps the
   read-aloud, the ruling, and the tactical map all true at once. *Alternative if you hate
   it: narrow the ford itself, which costs ruling 153.* **Default = the withy bar.**
2. **Enemy token count: draw for 6.** §3's default is Roek + 2 Raiders + 1 Line-Caller = **4**;
   §10's 2026-07-16 approval line reads "Roek + 3 Raiders," which is the same fight if
   "3 Raiders" means the three minions (2 Raiders + the Line-Caller). Scaling adds up to
   2 more. Confirm the reading, but the *drawing* doesn't change: leave room for six.
3. **Barge size: 40 ft × 15 ft = 8 × 3 squares.** The 3-square beam is §3's stated deck width;
   the 8-square length is picked here so three barges accordion along the channel diagonal
   inside a 30×20 canvas. If you want more elbow room, draw **34 × 22** instead and
   everything below scales without changing.

---

## 1. Canvas & grid

| | |
|---|---|
| **Grid** | 5 ft squares (Cosmere RPG standard) |
| **Map size** | **30 × 20 squares = 150 × 100 ft** (roomier option: 34 × 22) |
| **Pixels** | **150 px/square → 4500 × 3000 px**; set Foundry's grid size to 150 |
| **Bleed** | draw 1 extra square of art all around, outside the 30×20 — gives slack when aligning the grid in Foundry |
| **Orientation** | **North up.** Corvaine = **right (east)**, Thalendor = **left (west)**, downstream = **toward the bottom**, bearing slightly right (the ford at (1148,1669) runs SSE toward Withervale at (1220,1796)) |
| **Light** | flat overcast, midmorning, no strong cast shadows — token rings have to read over gravel |
| **Season** | late-summer / early-autumn **low water**. That is *why* it is fordable; the whole map should look like a river with its bones showing |

---

## 2. The water — widths and depths

The ford is where the Palewater stops being a river and becomes a braid: **~800 m (half a
mile) of gravel and thin brown water**, with exactly one slot deep enough to float a laden
barge. That slot is the whole reason the convoy is here, and the shallows are the whole
reason the raiders are.

Four depth bands, painted as four values — light to dark:

| Band | Depth | Reads as | Rule (§3) |
|---|---|---|---|
| **Dry gravel bar** | 6–18 in **above** water | pale gray-tan, dry crown, dark wet fringe | firm ground, normal move |
| **Shin-deep** | ~1 ft | milky brown, gravel visible through it | difficult terrain (Slowed) |
| **Knee-deep braid** | 1.5–2 ft | opaque silt-brown, fast riffle texture | difficult terrain (Slowed) — everyone, raiders too |
| **The channel** | **6–7 ft**, with a pull | dark green-brown, glassy, a visible current seam and a downstream V | too deep to wade — swimming |

**The channel is 5–6 squares (25–30 ft) wide.** That is the number that makes "single file,
dead slow" true: a 15-ft barge in a 28-ft slot has nowhere to pass. It enters the top edge
around x 8–13 and leaves the bottom edge around x 13–18, in a lazy S — corner-to-corner in
feel, never straight.

**Barges draw 2.5 ft laden**, so the channel floats them with a couple of feet to spare and
nothing else on the map does.

---

## 3. Ground plan (x = 1–30 left→right, y = 1–20 top→bottom)

```
        W (Thalendor, open braid)                        E (Corvaine)
   x  1-7          7-17               16-26        24-28      27-30
   ┌────────┬──────────────────┬──────────────┬──────────┬────────┐
 y │ braid  │   THE CHANNEL    │ CENTRAL BAR  │  wade    │ WITHY  │
 1 │ lanes  │   (5-6 sq wide,  │  dry gravel  │  lane    │  BAR   │
 . │ + one  │    snaking S)    │  firm ground │ knee-    │ willow │
 . │ low    │                  │  Roek's      │ deep     │ scrub  │
20 │ bar    │  ← barges here   │  ground      │          │ (cover)│
   └────────┴──────────────────┴──────────────┴──────────┴────────┘
              downstream ↓ (SSE)
```

- **x 1–7 — Thalendor-side braid.** Knee-deep lanes and one low, bare gravel bar (x 2–6,
  y 8–14). No cover, nothing to fight over. This is the party's open flank and where a
  dropped PC gets dragged. The far west bank is off-map.
- **x 7–17 — the deep channel.** See §2. The barges live here.
- **x 16–26 — the central bar.** The big one: ~10 × 14 squares of dry gravel, driftwood
  snags, a bleached log or two, a scatter of flood cobbles. Its **western edge is
  scoured into a 1.5–2 ft lip** where the channel undercuts it — *that* is the half-cover
  edge from §3, and it runs the bar's whole channel side. This is Roek's ground and the
  thing the lead barge grounds on.
- **x 24–28 — the wade lane.** Knee-deep braid between the central bar and the willows.
  Where the raiders are standing when the read-aloud ends — water at their knees.
- **x 27–30 — the withy bar (the "Corvaine bank").** Willow scrub, dense enough to hide a
  dozen people. The crossbow line's cover. True Corvaine shore off-map, 1,500+ ft east.

### Two hard constraints — the encounter breaks without them

1. **Keep the willow line within 12 squares (60 ft) of the barge string.** Crossbow range is
   60 ft; §3's round 1 is the line shooting *from cover*. If the scrub sits further out they
   have to step onto open gravel to shoot and the whole opening beat inverts.
2. **No more than 2 squares of Slowed water between the central bar and the barge gunwales.**
   Boarders are Move 25 ft (5 squares) and halve it in water. They cross the bar on firm
   ground and take contact on round 2. Widen that gap and the wade takes five rounds and the
   fight dies in the shallows.

---

## 4. The barges

Three identical laden grain-barges — river lighters, not boats. Flat-bottomed, blunt at both
ends, built to be poled.

| | |
|---|---|
| **Size** | **40 ft × 15 ft = 8 × 3 squares** |
| **Freeboard** | ~3 ft (a hop up from the water, a step down from the bar lip) |
| **Laden draft** | 2.5 ft |
| **Cargo** | ~25 tonnes each, ~75 across the three — call it a winter's bread for a village of a thousand |
| **Crew** | steersman + 2 polers each; Wick on the lead barge's steering oar |

**Deck plan (8 × 3), bow at the top:**

```
  ┌───┬───┬───┐
  │   │   │   │   fore platform 3 x 2 — bare planking, coiled line,
  │   │   │   │   the poles racked along the gunwale
  ├───┼───┼───┤
  │gng│GRN│gng│   waist 3 x 4 — grain in TWO lashed canvas mounds
  │way│AIN│way│   (1 x 2 each), a clear crossing square between them,
  │   │ + │   │   1-square poling gangways down both sides
  │   │GRN│   │
  ├───┼───┼───┤
  │   │   │   │   stern platform 3 x 2 — the steering oar over the
  │   │ ⚓ │   │   transom, a low rail, the bell on the lead barge
  └───┴───┴───┘
```

**Draw the grain mounds waist-high (~3 ft), not chest-high.** They should give half cover and
cost a square to scramble over — not block line of sight and turn each deck into two
corridors. The clear square amidships is deliberate: it is the crossing point and it is
where boarders and PCs meet.

**Look:** tar-black below the waterline, silver-gray sun-bleached timber above, ochre-brown
canvas over the grain, rope everywhere. 16-ft ash poles. A bell on the lead barge (it pays
off in §3b). A dog on one of them — canon, and worth a token if you want one.

### The pile-up (this is the map's centerpiece)

Roek drops the lead poleman, the lead barge noses onto the bar, and the two behind — dead
slow but unstoppable — accordion into it.

- **Lead barge:** bow riding up on the **central bar's western lip**, canted ~15° to
  starboard, stern still afloat in the channel. Bow around (16, 13).
- **Barge 2:** nosed into the lead's stern quarter, ~(13, 9), angled slightly off it.
- **Barge 3:** nosed into 2, ~(11, 5), the last one still fully in the channel.
- The three make a shallow zigzag up the channel, **nearest deck corners one square (5 ft)
  apart** — a free hop, or a trivial Athletics with your hands full.
- **The gangplank:** a loose plank, 1 × 2 squares, lying on the lead barge's stern — the crew
  drops it between 1 and 2 on round 1. Draw it stowed; the GM narrates it into place.

The grounded bow is the chokepoint, the best cover on the map, and the thing everyone is
fighting over. It should be the most legible object in the image.

---

## 5. The banks (what "bank" means here)

There is no shoreline on the battle map — say it out loud, because it is the thing that
usually surprises a GM mid-scene. What *reads* as bank:

- **The willow wall (right edge).** Osier stools cut back for generations, throwing 8–12 ft
  whips; gray-green, dusty, dense as a hedge. A **flood-wrack line** along its foot —
  bleached branches, matted reed, a snarl of last spring's debris — and the gravel beneath it
  stained rust-brown. Deep enough that the read-aloud's "comes apart into people" works.
- **The bar edges.** Every bar has a dry pale crown and a dark wet fringe; the channel-side
  edges are cut into small 1–2 ft cliffs. That lip is the cover, so make it visible from
  above — a shadow line, not a color change.

**For the wider establishing view, if you draw one** (not needed for play):

- **Corvaine / east bank:** low cut-bank, 3–6 ft of pale silt over gravel, then grass plain to
  the horizon. No trees but the willow fringe. Skeindeer country.
- **Thalendor / west bank:** lower and wetter — sedge, reed, alder scrub, the ground going
  soft before it goes dry.

---

## 6. Tokens — who is actually on the map

**Enemies with tokens: 4 by default, 6 at the scaling ceiling.** All Medium, 1 × 1.

| Token | Count | Notes |
|---|---|---|
| **Sgt. Halden Roek** (rival) | 1 | holds the central bar |
| **Corvaine Line-Caller** (minion, White-invested) | 1 | wades a pace behind the boarders |
| **Corvaine Raider** (minion) | 2 | +1 per PC over 3; +1 more for a melee-heavy party |

**Everyone else:**

- **PCs:** 3 (baseline), starting on the decks.
- **Wick:** 1 token, noncombatant, at the lead barge's steering oar.
- **The nine crew:** **no tokens.** They are behind the grain the moment the first quarrel
  flies. Draw them into the art if you like — they are scenery, not actors.
- **The eight second-line raiders:** **two flavor tokens at most**, back in the willows.
  Never eight. They shoot from the scrub, haul grain, and break with Roek.

**Peak token load: ~10–13.** The three decks give 72 squares and the central bar ~140, so
there is room to spare — the pressure in this fight comes from the water, not from crowding.

**Deployment bands to leave clear when you draw:**

- **Raiders:** the wade lane and the east half of the central bar (x 22–28) — 2 squares deep.
- **Crossbow line:** the willows, x 27–30.
- **PCs:** the three decks.

---

## 7. Dressing, and what not to draw

**Do draw:** driftwood snags and a bleached log on the central bar; flood-wrack at the willow
foot; a few ash-gray tollbird crows on the snags; one or two dead fish on the bar's tideline
(the wasting, understated — §2's wrong catch pays off here); pole-marks and boot-scuffs in the
wet gravel; the current seam where channel meets shallow.

**Do not draw:** any pier, jetty, bridge, building, or fence; any boat but the three barges;
any tree but willow; the far shore on either side; blood, bodies, or damage — the map is the
moment *before*.

**Palette discipline:** keep the bar surfaces low-saturation and the channel dark. Token rings
(red, blue, green) have to read against gravel at 150 px, and pale over-bright gravel is the
one thing that kills a Foundry map.

---

## 8. When the art lands

1. Drop the PNG at `source-materials/maps/battle/palewater-ford.png`.
2. Add the `battle_maps` entry to `source-materials/maps/thyrcross.map.json` (site
   `palewater-ford`, grid 150 px, 30 × 20 squares).
3. `python3 scripts/map/lint_map.py` (needs Pillow) + `npm run gates`.
4. Foundry: new scene, grid 150, background = the PNG. No walls needed — every terrain call in
   §3 is GM-adjudicated, and the channel reads as a moat without lighting help.
