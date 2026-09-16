# Allomancy, Feruchemy and the Radiant paths against Edha's Leyline and Deity trees

Written 2026-09-16 by the PM session of record, on Ben's ask: *"a comparison of the allomancy and
feruchemy talents to our Deity and Leyline talents — power level, damage per talent, things their
system does ours doesn't … include the Radiant paths … I've purchased and installed the Mistborn
Handbook."* DOCS-ONLY. Every number below is regenerable by the scripts in
[`talent-comparison/`](talent-comparison/README.md); the licensed text they read is never committed.
The companion document is [`metalworks-comparison.md`](metalworks-comparison.md) (the codebase).

## Contents

- [A. The corpora and the method](#a-the-corpora-and-the-method)
- [B. How each family is built](#b-how-each-family-is-built)
- [C. The measurements](#c-the-measurements)
  - [C.1 Action-type mix](#c1-action-type-mix)
  - [C.2 Cost](#c2-cost)
  - [C.3 Damage](#c3-damage)
  - [C.4 Depth and gating](#c4-depth-and-gating)
  - [C.5 Automation on the document](#c5-automation-on-the-document)
- [D. Findings](#d-findings)
- [E. What their system does that ours does not, and the reverse](#e-what-their-system-does-that-ours-does-not-and-the-reverse)
- [F. The rulings menu](#f-the-rulings-menu)
- [Appendix — per-tree table for Edha's 21 trees](#appendix--per-tree-table-for-edhas-21-trees)

## A. The corpora and the method

| Corpus | Source | n | What the rows carry |
|---|---|---|---|
| **Mistborn — Allomancy** | `cosmere-rpg-mistborn-handbook` 1.0.0, pack `metallic-arts` (read from a scratch copy with `classic-level`) | 83 talents | full 3.x documents: activation type and cost, consumption rows, damage formula, skill test, events, effects, folder (metal) |
| **Mistborn — Feruchemy** | same pack | 85 talents | same |
| **Mistborn — Metalborn paths** | pack `metalborn-paths` (Misting, Mistborn, Ferring, Feruchemist, Twinborn) | 38 talents | same, plus 51 goals and the five path items |
| **Mistborn — powers and trees** | pack `metallic-arts` | 67 `power` items (33 Allomancy, 34 Feruchemy, nascent variants included), 37 `talent_tree` items | the base Burn / Store / Tap actions; node prerequisites (talent, skill rank, power, connection, ancestry) |
| **Radiant paths** | `source-materials/legacy-uploads/CosmereRPG Talents.xlsx` (Ben's atlas-era sheet; descriptions are condensed, not the card text) | 225 talents, 9 orders × 25 | path, specialty, action type, cost, prerequisites, a one-line description |
| **Official heroic paths** | the same sheet | 149 talents, 6 paths | same — the control group, because Edha's heroic atlas is 114/133 identical to it |
| **Edha** | `docs/analysis/talent-ecosystem/derive-dossiers.js` → `all-talents.json` (the ecosystem review's join of `data/*.json` and the authored overlay) | 365 talents: 125 leyline, 90 deity, 150 heroic | action, cost, consumption, damage formula, depth, earliest level, rank gate, rule count |

**Two honesty notes before any number.** The Mistborn rows are machine-readable at the same depth as
Edha's (a real activation, real consumption rows, a real formula), so Mistborn ↔ Edha comparisons are
like-for-like. The Radiant rows are a spreadsheet summary — cost and action type are reliable,
damage and scaling have to be read out of one-line prose, and "prerequisites" are names. Radiant
numbers are therefore quoted with fewer decimals and used for *shape*, not for dice. And the
Metalworks talents carry their behaviour in prose (23 rules on 206 talents); nothing below scores
"what the engine does", only what the card says and costs.

**Units.** Action types are normalised to the seven the design guides use (Passive, Special, 1
Action, 2 Actions, 3 Actions, Free Action, Reaction). A 3.x Mistborn talent with no embedded action
is a Passive; an action whose cost type is `spe` is a Special. Percentages are of the family's n.

## B. How each family is built

The three families answer "where does the magic come from" differently, and every later number is
downstream of that.

**Mistborn.** A *power* is the unit — Steel Allomancy, Pewter Feruchemy — and it is a `power` item
that (1) unlocks a non-core Invested skill (`all` on Willpower, `fer` on Intellect), (2) carries the
base actions, and (3) owns a talent tree. Allomantic powers have one **Burn** action (1 Action; a
free "sense" burn while you hold 1 Investiture, then *"spend 1 Investiture or more, up to your
Metallic Art limit"*) plus one or two named uses (Steelpush: Propel / Shoot Coin; Ironpull: Propel /
Lurching Crash). Feruchemical powers have **Store** (1 Action, free, an ongoing debuff that earns 1
charge per scene) and **Tap** (1 Action, spend 1 charge from the metalmind, an ongoing buff for
*ranks in Feruchemy* rounds). The **Metallic Art limit** — how much you may spend on one effect —
equals your skill rank; the **Metallic Art die** runs d4 → d12 by rank; **range** doubles per rank
(20 ft → 320 ft); ongoing effects are maintained as a Free Action for the same cost. The five
Metalborn *paths* are mutually exclusive key talents (a Snap or a Heritage) that grant one or all
powers, at first *nascent* (narrative-only) until a **Metalborn goal** is completed. The per-metal
trees are small: 2 – 7 nodes, average 5, depth 0 – 3, gated by owning the power, by Invested-skill
rank (none / 2 / 3 / 4), and by talent chains. The talents are **modifiers of the base action**:
82 % of Allomancy and 71 % of Feruchemy talents are Passive or Special; the cost sits on Burn and Tap.

**Radiant.** An *order* is the unit. The key talent (*First Ideal – Windrunner*, level 2+) grants an
Investiture score and the three Radiant actions (Breathe Stormlight, Enhance, Regenerate); the
First / Second / Third / Fourth Ideals are **goals** at levels 2 / 4 / 8 / 13 that unlock the two
surges as skills, Empowered, the Shardblade, the Shardplate. Ninety-four of the 225 talents are gated
on speaking an Ideal (53 on the First alone), 116 on another talent; the trees are shallow (106 at depth 0, 50 at depth 1)
and wide. Damage comes from the surge's power die and from the surge *actions*, not from talents:
eight talents mention `2d4`, two `1d6`. Again the talents are riders: 76 % Passive or Special, 29 %
cost anything.

**Edha.** The *colour* is the unit, but it is a core skill with no base action and no power item.
Every leyline talent is its own action or passive; damage and effect are on the talent, priced on the
talent, and scaled by `[Tier][Die]` = `(@tier)d(2 × rank + 2)`. The five leyline trees are 25 talents
deep (depth 0 – 5, gated by colour rank 1+ / 2+ / 3+ and by chains). Deity trees are 9 talents behind
a two-colour gate (2+/2+ or 3+/3+), depth 0 – 3, and **every one of them prices its talents**: 80 %
consume Investiture, at 1 – 4 a cast. Draw Mana (1 Action → tier Investiture) is the refill; there is
no scene-start refill, no variable spend, no "limit by rank".

## C. The measurements

### C.1 Action-type mix

Percent of each family's talents. The two design-guide targets are the rows the leyline and deity
guides ask for.

| Family | n | Passive | Special | 1 Act | 2 Act | 3 Act | Free | Reaction | Passive + Special |
|---|---|---|---|---|---|---|---|---|---|
| Mistborn — Allomancy | 83 | 45 | 37 | 7 | 0 | 0 | 5 | 6 | **82** |
| Mistborn — Feruchemy | 85 | 29 | 41 | 13 | 5 | 1 | 4 | 7 | **71** |
| Mistborn — Metalborn paths | 38 | 50 | 37 | 5 | 0 | 0 | 8 | 0 | **87** |
| Radiant (9 orders) | 225 | 38 | 39 | 7 | 10 | 1 | 3 | 2 | **76** |
| Official heroic (control) | 149 | 34 | 30 | 14 | 8 | 2 | 7 | 5 | 64 |
| **Edha leyline** | 125 | 43 | 22 | 11 | 7 | 0 | 2 | **14** | 66 |
| **Edha deity** | 90 | 16 | **0** | **38** | **23** | **11** | 7 | 6 | **16** |
| Edha heroic | 150 | 34 | 27 | 13 | 9 | 3 | 8 | 7 | 61 |
| *leyline guide target* | | 35 | 25 – 30 | | | | | | |
| *deity guide target* | | | 15 – 20 | | | | 10 – 15 | | |

Read across the official rows first: **every published Invested family is 71 – 87 % Passive +
Special**, with 1 – 13 % single Actions and almost no 2- or 3-Action talents (Radiant's 10 % of
2-Action talents is the high mark). The published shape is *"the power is the action; the talents
change what the action does"*. Edha leyline is inside that band on Passive + Special (66 %, a touch
low) and outside it on Reactions (14 % against 2 – 7 % everywhere else — the White finding from the
ecosystem review, R-95/R-96, in a second data set). Edha deity is outside it on every column: 0 %
Special, 72 % costing at least one Action, 11 % 3-Action capstones against 0 – 2 % anywhere official.

### C.2 Cost

"Costed" = the talent consumes a pool when used (a real consumption row for Mistborn and Edha; the
Cost column for the spreadsheet corpora).

| Family | Costed | Of which | Pool refill | Per-effect limit | Variable spend |
|---|---|---|---|---|---|
| Mistborn — Allomancy | **34 %** | Investiture 20 %, Focus 13 % | scenes start full (1 if Surprised); *Drink Vial* refills | **your Allomancy rank** | yes — *"1 or more, up to your limit"*; flaring = spending the limit |
| Mistborn — Feruchemy | **46 %** | metalmind charges 40 %, Focus 6 % | Store earns 1 charge per scene stored; metalmind capacity by tier (4 at tier 2, 8 at 3+) | 1 charge per Tap; talents raise it | yes — many *"instead of 1 charge, spend any number"* talents |
| Mistborn — Metalborn paths | 8 % | Focus 5 %, Investiture 3 %, uses 3 % (three talents) | — | — | — |
| Radiant | **29 %** | Investiture 27 % (1: 12 %; 2 – 3: 5 %; variable: 4 %; 2: 3 %; 3: 2 %), Opportunity / Focus 2 % | Breathe Stormlight from spheres | *"up to your ranks in [surge]"* on the variable ones | yes — 10 talents |
| Official heroic | 32 % | Focus (1: 14 %, 2: 13 %, 3: 3 %) | rest | — | rare (3) |
| **Edha leyline** | **48 %** | Investiture 48 % (1: 41 %, 2: 6 %, 3: 1 %; three of the 1s also cost 2 Focus) | Draw Mana, 1 Action → tier | none | 2 talents ("Variable Investiture") |
| **Edha deity** | **80 %** | Investiture 80 % (1: 38 %, 2: 31 %, 3: 10 %, 4: 1 %) | Draw Mana | none | none |
| Edha heroic | 31 % | Focus (1: 15 %, 2: 13 %, 3: 3 %) | rest | — | — |

The gap is structural, not a tuning slip. A Coinshot pays Investiture **once**, on Burn / Steelpush,
and every talent after that is free; a Destruction cleric pays on **each** of the nine talents
because there is no base action to have paid on. Edha deity at 80 % costed is two and a half times
the most expensive published family (Feruchemy, whose "cost" is charges you earned by storing during
downtime). Edha's Investiture sums per tree (the sum of every talent's minimum cost): Blue 18, White
17, Green 14, Black 11, Red 10; deity Power 15, Chaos 14, Death 14, Life 13, Sovereignty 13,
Civilization 11, Fate 11, Destruction 10, Knowledge 10, Order 10 — a nine-talent deity tree carries
as much Investiture pricing as a twenty-five-talent colour.

### C.3 Damage

**Where damage lives.**

| Family | Talents with a machine damage formula | Prose mentions "damage" | Explicit dice in prose | Where the damage really comes from |
|---|---|---|---|---|
| Mistborn — Allomancy | **5 of 83** (three ride the Metallic Art die: *Ironpull Shot*, *Lurching Strike*, *Pushed Shot*; *Regenerate* heals `1d6 + @tier`; *Flaring Refocus* costs `1d4` vital) | 10 | 1d4 ×5, 1d6 ×4 | the power's own attack actions — *Shoot Coin* and *Lurching Crash* roll `@scalar.power.<metal>.die` impact (1d4 at rank 1 … 1d12 at rank 5) |
| Mistborn — Feruchemy | **2 of 85** (*Searing Palm* — the brass die, energy; *Thermal Conduction* — `@skills.fer.mod` energy) | 9 | 1d4 ×6, 1d6 ×3, 1d8 ×2, 1d10 ×1 | Tap Strength's Enhanced [Strength +2] on a weapon Strike |
| Radiant | — (spreadsheet) | 20 of 225 | 2d4 ×8, 1d6 ×2, 3d4 ×2, 1d4 ×2; *Gravitational Slam*: 1d4 impact per 10 ft | the surge actions and the surge power die; talents add small riders (*"extra damage equal to your ranks in Discipline"*) |
| Edha leyline | **8 of 125** + 3 heals (Red 4, Black 3, White 1) | 26 | — | the talent itself, `(@tier)d(2 × rank + 2)` |
| Edha deity | **24 of 90** + 5 heals | 60 | — | the talent itself, same die, often `+ @attr` |
| Edha heroic | 6 + 3 heals | — | 2d4, 4d4, 2d8, `(4 + max((@tier − 2) × 2, 0))d6` | riders on the weapon Strike (as in the published heroic set) |

**How it scales.** The system's power die and Edha's `[Tier][Die]` use the *same* die table by rank.
Edha multiplies it by tier.

| Rank (levels) | Metallic Art / surge die | mean | Edha `[Tier][Die]` | mean | ratio |
|---|---|---|---|---|---|
| 1 (L1) | d4 | 2.5 | 1d4 | 2.5 | 1.0 |
| 2 (L1 – 5) | d6 | 3.5 | 1d6 | 3.5 | 1.0 |
| 3 (L6 – 10) | d8 | 4.5 | **2d8** | 9.0 | **2.0** |
| 4 (L11 – 15) | d10 | 5.5 | **3d10** | 16.5 | **3.0** |
| 5 (L16+) | d12 | 6.5 | **4d12** | 26.0 | **4.0** |

Per hit at tier 1 the two are identical, and both add the skill modifier. From level 6 the official
die climbs one step per rank while Edha's climbs a step *and* adds a die per tier. The ecosystem review
measured this from the heroic side (README §"Heroic damage is flat…", R-105 answered (c): accept and
document). This document adds the official Invested side: **the published game keeps power damage
nearly flat by design and spends its scaling on reach, duration, targets and effect size** — a
Steelpush moves 20 ft per Investiture, range doubles per rank, effect size runs Small → Gargantuan by
rank (`config.ts:1194-1215`), and Enhanced [Strength] scales with the Investiture spent. Damage is
the one axis the publisher chose *not* to scale hard, and it is the one axis Edha scales hardest.

**Deflect.** The official attack actions are impact or energy — deflectable. 44 % of Edha's typed
formulas ignore Deflect (vital / spirit), concentrated in Chaos, Order, Knowledge and Black.

### C.4 Depth and gating

| Family | Depth 0 | 1 | 2 | 3 | 4 | 5 | Gate kinds (share of talents) | Earliest level |
|---|---|---|---|---|---|---|---|---|
| Mistborn (all 37 trees) | 69 | 88 | 43 | 6 | — | — | own the power (every tree root); Invested-skill rank 2: 25 %, rank 3: 32 %, rank 4: 8 %, rank 5: 1 talent; talent chain 137 | L1 60 %, L6 32 %, L11 8 % |
| Radiant | 106 | 50 | 31 | 34 | 4 | — | Ideal (goal) 42 %; talent chain 52 %; level 4 % | the Ideals: L2 / L4 / L8 / L13 |
| Edha leyline | 21 | 29 | 30 | 26 | 15 | 4 | colour rank 1+: 40 %, 2+: 18 %, 3+: 19 %; off-colour skill 10 % | L1 16 %, L2 23 %, L3 18 %, L4 14 %, L5 4 %, **L6 24 %** |
| Edha deity | 20 | 40 | 20 | 10 | — | — | two colours at 2+/2+ (7 trees) or 3+/3+ (3 trees) | L1 22 %, L2 38 %, L3 22 %, L4 11 %, L6 7 % |
| Edha heroic | 42 | 40 | 45 | 22 | 1 | — | off-colour skill ranks | L1 28 %, L2 25 %, L3 19 %, L6 24 % |

Published trees are **shallow and rank-gated**: a metal tree is five talents, two of them behind
rank 3, and the Twinborn tree is the deepest at three. Edha's colours are **deep and chain-gated**
(depth 4 – 5 exists only in Edha), and the level-6 wall (24 % of leyline and heroic talents open at
L6, because rank 3 and tier 2 arrive together) is shared with the official corpus in kind — Mistborn's
rank-3 gate is 32 % of its talents — but not in size. Radiant's gates are *narrative*: an Ideal
spoken, a goal completed. Nothing in Edha gates on a goal; deity trees gate on two colour ranks.

### C.5 Automation on the document

| Family | Rules per talent | Handler types used | Talents with ActiveEffects |
|---|---|---|---|
| Mistborn (206) | **0.11** (23 rules, all on the five key talents) | grant-items, remove-items, update-actor | 6 |
| Edha (365) | **1.14** (415 rules) | 102 `edha-*` + update-actor | 32 |

Not a quality gap in either direction — it is the design decision the codebase document (§b) calls
"rulebook versus referee". The published talents describe; Edha's adjudicate.

## D. Findings

**D-1. The deity atlas is the outlier against every published Invested family, on shape and on
price — and the leyline atlas is not.** Deity: 0 % Special (published: 30 – 41 %), 72 % of talents
costing Actions (published: 8 – 20 %), 11 % three-Action talents (published: 0 – 1 %), 80 % costed
(published: 8 – 46 %). Leyline sits inside the published bands on every column except Reactions.
R-108 (answered (a), 2026-09-13) already restated the deity Special target and deferred conversion
"until the leyline agency work has landed"; this measurement is the comparison it asked to revisit
with, and it says the target is right and the atlas is far from it. **The pricing is the larger
half:** a deity tree charges on every talent because it has no base action to charge on. → R-151.

**D-2. Edha's damage scaling is the published die times tier, on purpose, and it is the one axis
where Edha out-scales the publisher by 2 – 4×.** Already ruled (R-105 (c): accept and document) from
the heroic comparison; the Invested comparison agrees and adds the reason the publisher's curve is
flat — their scaling goes to reach, duration and effect size. No new ruling; R-105's documentation
should cite this table.

**D-3. The published model puts the cost on a base power action and lets talents ride it free; Edha
has no base action per colour, so every talent is priced on its own.** This is the root of D-1 and of
the ecosystem review's "eight sealed loops" and "Blue and White have 15 Investiture-costing talents
and zero regen". A *Draw Mana*-like base action per colour — "Channel White: 1 Action, spend 1 to
[rank] Investiture, gain the colour's ongoing frame until the end of your next turn; maintain as a
Free Action" — with talents re-typed as riders on it, is the structural fix the published design
implies. It is also a rewrite of 125 talents' costs and action types. → R-152 (design seed, not a
build).

**D-4. Variable spend with a rank limit ("flare") exists in every published Invested family and in
two Edha talents.** Mistborn: 20 of 83 Allomancy costs are *"1 or more, up to your limit"*; Radiant:
10 "Variable Investiture" talents; Edha leyline: 2, deity: 0. The consume dialog already supports
`{min, max}` rows (the Mistborn packs use `max: -1` for "up to your limit"), so the mechanic is free
to build at the data level once a limit rule exists. → R-153.

**D-5. Narrative gates (goals, Ideals) are the published progression spine for Invested paths;
Edha uses rank gates only.** Metalborn goals unlock the full power from its nascent form; the Ideals
unlock surges, Empowered, Blade and Plate. The system's `goal` item, `goal-complete` event and
`goal` prerequisite type all exist at 2.1.0 and 3.1.0. A deity's rites are the obvious Edha
analogue (canon §"rites" per god). → R-154 (design seed).

**D-6. The heroic control group says the method is sound.** Edha heroic (114 of 133 talents shared
with the published set) lands within 1 – 4 points of the published heroic mix on every column, and
its cost profile is identical (31 % vs 32 % Focus-costed). Where Edha diverges from the published
game, it is by design in the leyline and deity atlases, not by drift in the pipeline.

**D-7. The Mistborn heroic pack is a second edition of the six heroic paths.** 135 talents, 78 shared
with the Stormlight list, 57 new (Era-2 flavour: *Crack Shot*, *Gunsmith*, *Detonation Expert*,
*Fanning*) and 52 dropped (*Fatal Thrust*, *Shard Training*, the stances). Nothing for Edha to act
on; noted so nobody diffs the two and reports "the system changed the heroic talents".

## E. What their system does that ours does not, and the reverse

**Theirs, not ours**

- **A base power action with variable spend up to a rank limit** (the Metallic Art limit; Radiant's
  "up to your ranks in [surge]"). Edha has fixed costs and two variable talents.
- **Store / Tap charge economies** on an equipment item (`item_resource` charges on a metalmind),
  earned per scene, spent per use, capacity by tier. Edha's counted resources are engine ledgers.
- **Nascent powers and goal gates** — the power arrives narrative-only and is unlocked by play.
- **Maintain as a Free Action** for the same cost, as the universal ongoing-effect rule.
- **Effect size and range that scale by rank** (Small → Gargantuan; 20 ft → 320 ft) as native
  scalars. Edha's Attunement Range per colour rank is the same idea, engine-owned.
- **Magnitude conditions**: Enhanced [Strength +2], Diminished [Strength −1] — the system's
  `diminished` is now a real condition (F4's collision).
- **Resonance and Compounding** (Twinborn: two powers interacting; burning your own metalmind).
- **Investiture-detection and -hiding** (Bronze / Copper), **time bubbles** (Bendalloy / Cadmium:
  bonus rounds and delay points), **spend-everything bursts** (Duralumin / Nicrosil).
- **Mutually exclusive key talents** (choose one Metalborn path, ever).
- **Enrichers** — `[[test skill=all]]`, `[[damage 1d4 impact]]` — a clickable roll inside the card.

**Ours, not theirs**

- **Contests** — 40 talents resolve an opposed test against the target's skill, engine-rolled.
- **Two-colour gates** on deity trees, and the colour-thematic test convention.
- **Draw Mana** as an in-combat refill (published Invested pools refill at scene start).
- **Zones, hazards and dangerous terrain** as Region behaviours; **summons** with sustain caps.
- **Per-tree signature resources** (Omen, Quarry, Harvested Remain, Ordained Ground, Snare, Edict,
  Charge, Bounty).
- **The level-6 double step** (tier 1 → 2 and rank cap 2 → 3 together), and tier-multiplied dice.
- **Deflect-bypassing damage as tree identity** (Chaos, Order, Knowledge, Black).
- **Adjudication on the document** — 415 rules a GM can read and edit on the Events tab.

## F. The rulings menu

Filed in `EDHA_RULINGS.md` §L on 2026-09-16 with these ids and recommended defaults; the codebase
document's B1 / B2 / B3 / B5 / B10 are R-146 … R-150 there. These four are the design side.

| Ruling | Question | Recommended default |
|---|---|---|
| **R-151** | The deity atlas prices 80 % of its talents and has no Specials, against 8 – 46 % and 30 – 41 % in every published Invested family. Re-price now (drop the Investiture cost from the riders and passives that carry one, keep it on the sources), re-type now (convert standalone Actions to Specials per tree), or hold for R-152's structural answer? | **hold for R-152, but record the numbers in the deity guide now** (DOCS-ONLY) — re-pricing nine trees twice is the cost of deciding early |
| **R-152** | Should each colour gain a base "Channel" action — 1 Action, spend 1 – rank Investiture, an ongoing frame, maintained free — with talents re-typed as riders on it, the way Burn and Tap carry the cost for the metals? | **no build now; file as a design seed for after playtest-1**, because it re-costs 215 talents and every bench row on them |
| **R-153** | Adopt "spend 1 or more, up to your rank" as an Edha cost shape on the talents whose effect already scales with something (damage dice, targets, range), using the consume dialog's `{min, max}` rows | **yes, as a convention for new and revised talents**; no sweep of existing cards |
| **R-154** | Should deity trees gain a narrative gate — a rite completed, a `goal` item — for the capstone or the second entry, as the Ideals and the Metalborn goals do? | **no for now**; revisit with the canon rites work (lore-forge), since the goal must exist in canon before it exists on a sheet |

## Appendix — per-tree table for Edha's 21 trees

Regenerated from `all-talents.json` (2026-09-16). Percentages of the tree's n; `inv` / `foc` are the
sums of every talent's minimum cost; `dmgF` / `healF` are machine formulas; `L6` is the count of
talents whose earliest level is 6.

| Tree | n | Pass % | Spec % | 1A | 2A | 3A | Free | Reac | costed % | inv | foc | dmgF | healF | avg depth | max depth | L6 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Black | 25 | 60 | 4 | 3 | 3 | 0 | 1 | 2 | 36 | 11 | 2 | 3 | 0 | 2.16 | 5 | 5 |
| Blue | 25 | 36 | 20 | 3 | 2 | 0 | 1 | 5 | 60 | 18 | 2 | 0 | 0 | 1.68 | 4 | 7 |
| Green | 25 | 36 | 28 | 3 | 3 | 0 | 0 | 3 | 48 | 14 | 0 | 0 | 2 | 1.96 | 4 | 8 |
| Red | 25 | 44 | 32 | 3 | 1 | 0 | 1 | 1 | 36 | 10 | 0 | 4 | 0 | 2.12 | 5 | 6 |
| White | 25 | 40 | 28 | 2 | 0 | 0 | 0 | 6 | 60 | 17 | 2 | 1 | 1 | 1.96 | 4 | 4 |
| Chaos | 9 | 11 | 0 | 3 | 3 | 1 | 0 | 1 | 89 | 14 | 0 | 5 | 0 | 1.22 | 3 | 0 |
| Civilization | 9 | 11 | 0 | 2 | 3 | 1 | 1 | 1 | 78 | 11 | 0 | 2 | 0 | 1.22 | 3 | 0 |
| Death | 9 | 11 | 0 | 4 | 3 | 1 | 0 | 0 | 89 | 14 | 0 | 3 | 0 | 1.22 | 3 | 0 |
| Destruction | 9 | 22 | 0 | 2 | 2 | 1 | 1 | 1 | 67 | 10 | 0 | 6 | 0 | 1.22 | 3 | 0 |
| Fate | 9 | 11 | 0 | 2 | 2 | 1 | 2 | 1 | 78 | 11 | 0 | 3 | 0 | 1.22 | 3 | 0 |
| Knowledge | 9 | 33 | 0 | 5 | 0 | 1 | 0 | 0 | 67 | 10 | 0 | 0 | 0 | 1.22 | 3 | 2 |
| Life | 9 | 11 | 0 | 6 | 1 | 1 | 0 | 0 | 89 | 13 | 0 | 0 | 5 | 1.22 | 3 | 1 |
| Order | 9 | 22 | 0 | 2 | 2 | 1 | 1 | 1 | 67 | 10 | 0 | 4 | 0 | 1.22 | 3 | 1 |
| Power | 9 | 0 | 0 | 3 | 4 | 1 | 1 | 0 | 100 | 15 | 0 | 1 | 0 | 1.22 | 3 | 0 |
| Sovereignty | 9 | 22 | 0 | 5 | 1 | 1 | 0 | 0 | 78 | 13 | 0 | 0 | 0 | 1.22 | 3 | 2 |
| Agent | 25 | 32 | 28 | 1 | 2 | 1 | 4 | 2 | 48 | 0 | 22 | 1 | 0 | 1.32 | 3 | 7 |
| Envoy | 25 | 40 | 32 | 2 | 1 | 0 | 2 | 2 | 28 | 0 | 8 | 0 | 0 | 1.40 | 3 | 6 |
| Hunter | 25 | 32 | 28 | 4 | 2 | 1 | 2 | 1 | 16 | 0 | 7 | 2 | 0 | 1.32 | 3 | 6 |
| Leader | 25 | 32 | 32 | 4 | 1 | 2 | 1 | 1 | 36 | 0 | 14 | 0 | 0 | 1.52 | 4 | 5 |
| Scholar | 25 | 36 | 24 | 1 | 3 | 0 | 3 | 3 | 36 | 0 | 16 | 0 | 3 | 1.24 | 3 | 6 |
| Warrior | 25 | 32 | 16 | 8 | 4 | 0 | 0 | 1 | 20 | 0 | 7 | 3 | 0 | 1.20 | 3 | 6 |
