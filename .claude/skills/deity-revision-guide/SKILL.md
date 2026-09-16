---
name: deity-revision-guide
description: >
  Reference guide and design standards for revising or creating Deity talent trees in the Edha/Cosmere RPG homebrew system. Use this skill whenever the user asks to revise, write, review, or design Deity talents or talent trees — including requests like "rework the X deity tree", "design a tree for [deity]", "does this talent fit Death identity?", "balance this deity tree", "what's the fantasy of [deity]", or any task involving the 10 deity paths (Anaveth/Life, Gnothis/Knowledge, Kethane/Civilization, Maelith/Chaos, Morrath/Death, Olvarra/Fate, Razkael/Destruction, Tessavain/Order, Tyrith/Power, Verdannis/Sovereignty), two-entry tree structure, leyline-color test convention, or homebrew deity resources (Harvested Remain, Charge, dangerous terrain, Ordained Ground, Snare). Also trigger when the user shares a block of deity talent text for critique or improvement.
---

# Deity Talent Trees — Revision Guide

This skill contains the canonical design standards for the Deity system. Consult it whenever writing, revising, or reviewing Deity talents. Pair with `cosmere-canon-reference` for canonical capitalization and `phrasing-verifier` for description-level formatting checks.

---

## PART 1: WHAT MAKES A DEITY TREE DIFFERENT FROM A LEYLINE TREE

The deity system shares the leyline system's resources (focus, Investiture, Opportunity, HP, plot die) and action economy. It diverges in five structural ways.

### 1. No Key talent

Deity trees **do not have a Key talent**. There is no single gateway node that gates the rest of the tree. Older deity material that opens with a "Key" specialty is deprecated — convert to two entries.

### 2. Two entry nodes

Each deity tree has **two entry nodes**, both requiring `[Color1] 2+; [Color2] 2+` in the path's two leyline colors. The two entries should each independently deliver the deity's player-fantasy on turn one — a player who only takes one of the two should still feel the deity's archetype. From the two entries the tree branches, then converges into mid-tier synthesis nodes and (typically) a single capstone.

### 3. Deity tests use leyline-color skills, not deity-specific skills

When a deity talent calls for a test, the test rolls the **more thematically appropriate of the two leyline colors** against a defense. The pattern is `test [Color] vs. [Defense]`. There is no longer a "Sovereignty" or "Death" or "Chaos" skill — those are deprecated. Match the color to the talent's thematic direction (see Part 4 for the color-split rule per deity).

### 4. Specialty field equals path name

In the data file, every deity talent's `Specialty` field is just the path name (e.g. `Death`, `Power`, `Fate`). There is no `Key` value and no per-tier subdivision.

### 5. Investiture cost goes in the description opening

Every non-Passive deity talent opens its description with the spend phrasing: `Spend X Investiture and …` or `Spend X Investiture and an Opportunity to …`. Free-Action upgrade riders may embed the spend later (`When you place a Charge, spend an additional 1 Investiture to declare it a Pinpoint Charge`). Talents with `Passive` in the Cost field need no spend phrase.

---

## PART 2: DESIGN BENCHMARKS

### Tree size

Deity trees run **8–10 talents** total: 2 entries + 4–6 mid-tier + 1–2 capstones. Cleanest shape has 9 talents (2 entries + 4 tier-2 riders + 2 tier-3 synthesis + 1 capstone).

### Action type distribution targets

Looser than leyline because deity talents skew more active. Targets:

| Action Type    | Deity Target |
|----------------|--------------|
| Passive        | ~25–30%      |
| Special        | ~15–20%      |
| Action         | ~25–35%      |
| 2 Actions      | ~15–25%      |
| Free Action    | ~10–15% (upgrade riders, Opportunity spends) |
| Reaction       | ~10%         |
| 3 Actions      | **Capstones only** — one per tree, max |

3 Actions exist in deity design specifically for the capstone slot. Outside the capstone, prefer 2 Actions even for heavy effects.

> **R-108 (a), 2026-09-13 — target restated, nothing converted yet.** The deity atlas runs **0% Specials** across all ninety talents against this table's ~15–20% target (65 of 90 cost one or more Actions; the rest split across 13 Passives, 7 Free Actions and 5 Reactions). The one narrow conversion proposed — retype talents that "already ride another action" under Part 3 principle 10 — changes no talent on inspection: of the six candidates, four are already Passives, one is already a Free Action, and one (`Withering Touch`) is its own attack, not a rider. Converting standalone deity Actions into Specials now, before that authoring gap is closed, would only make deity trees more action-efficient and widen the deity-vs-leyline agency gap the primer already flags (R-96). So: **the target above stands as written, but do not convert any deity talent to a Special to chase it** until leyline's agency work (R-96) has landed and a fresh leyline-vs-deity comparison can be run. *(`EDHA_RULINGS.md` R-108, answered 2026-09-13.)*
>
> **Update 2026-09-16 (R-151, `EDHA_RULINGS.md` §K.21).** The same atlas also runs **80% costed**
> (72 of 90 talents spend Investiture on their own, at 1 – 4 a cast) against 8 – 46% costed in
> every published Invested family — see the Published benchmarks table below. R-151 (a) holds this
> re-pricing rather than converting talent-by-talent, because the root is structural: a deity tree
> charges on every talent because it has no base action to have charged on (**R-152**, §K.21). The
> structural fix is designed at `docs/design/channel-actions.md` (White approved, PR #419); the
> deity re-pricing itself is reopened as **R-159** (§L) once a deity pass runs the same way.

### Published benchmarks (2026-09-16)

From `docs/analysis/talent-comparison-mistborn-radiant.md` §C.1 (action-type mix) and §C.2 (cost),
the eight-family measurement behind R-151 (a) and R-153 (a) (`EDHA_RULINGS.md` §K.21).

**§C.1 — action-type mix (% of family's talents):**

| Family | n | Passive | Special | 1 Act | 2 Act | 3 Act | Free | Reaction | Passive + Special |
|---|---|---|---|---|---|---|---|---|---|
| Mistborn — Allomancy | 83 | 45 | 37 | 7 | 0 | 0 | 5 | 6 | **82** |
| Mistborn — Feruchemy | 85 | 29 | 41 | 13 | 5 | 1 | 4 | 7 | **71** |
| Mistborn — Metalborn paths | 38 | 50 | 37 | 5 | 0 | 0 | 8 | 0 | **87** |
| Radiant (9 orders) | 225 | 38 | 39 | 7 | 10 | 1 | 3 | 2 | **76** |
| Official heroic (control) | 149 | 34 | 30 | 14 | 8 | 2 | 7 | 5 | 64 |
| Edha leyline | 125 | 43 | 22 | 11 | 7 | 0 | 2 | 14 | 66 |
| **Edha deity** | 90 | 16 | **0** | **38** | **23** | **11** | 7 | 6 | **16** |
| Edha heroic | 150 | 34 | 27 | 13 | 9 | 3 | 8 | 7 | 61 |

Every published family runs 71 – 87% Passive + Special. Edha deity (16%) is outside every column:
0% Special, 72% costing at least one Action, 11% three-Action capstones against 0 – 2% published.

**§C.2 — cost (% of family's talents that consume a pool):**

| Family | Costed | Of which | Pool refill | Per-effect limit | Variable spend |
|---|---|---|---|---|---|
| Mistborn — Allomancy | **34%** | Investiture 20%, Focus 13% | scenes start full (1 if Surprised); *Drink Vial* refills | your Allomancy rank | yes — *"1 or more, up to your limit"*; flaring = spending the limit |
| Mistborn — Feruchemy | **46%** | metalmind charges 40%, Focus 6% | Store earns 1 charge/scene; capacity by tier | 1 charge per Tap; talents raise it | yes — many *"instead of 1 charge, spend any number"* talents |
| Mistborn — Metalborn paths | 8% | Focus 5%, Investiture 3%, uses 3% | — | — | — |
| Radiant | **29%** | Investiture 27%, Opportunity/Focus 2% | Breathe Stormlight from spheres | *"up to your ranks in [surge]"* on the variable ones | yes — 10 talents |
| Official heroic | 32% | Focus (1: 14%, 2: 13%, 3: 3%) | rest | — | rare (3) |
| Edha leyline | **48%** | Investiture 48% | Draw Mana, 1 Action → tier | none | 2 talents ("Variable Investiture") |
| **Edha deity** | **80%** | Investiture 80% (1: 38%, 2: 31%, 3: 10%, 4: 1%) | Draw Mana | none | **none** |
| Edha heroic | 31% | Focus (1: 15%, 2: 13%, 3: 3%) | rest | — | — |

Edha deity at 80% costed is two and a half times the most expensive published family. Edha's
Investiture sums per deity tree (minimum cost, summed): Power 15, Chaos 14, Death 14, Life 13,
Sovereignty 13, Civilization 11, Fate 11, Destruction 10, Knowledge 10, Order 10 — a nine-talent
deity tree carries as much Investiture pricing as a twenty-five-talent leyline colour.

### Variable spend ("1 or more, up to your rank")

**R-153 (a), 2026-09-16** (`EDHA_RULINGS.md` §K.21) — a convention for **new and revised**
talents; no sweep of existing cards. Every published Invested family uses variable spend; Edha
deity has zero talents that do (leyline has two). When a talent's effect already scales with
something numeric — damage dice, targets, range, duration — let the player spend more Investiture
for more of it instead of writing a flat cost:
- Use the consume dialog's `{min: 1, max: <rank>}` row (the Mistborn packs write `max: -1` for
  "up to your limit"; deity's limit is the talent's rank in whichever of its two colours the
  effect scales with).
- Card phrasing: `"Spend 1 or more Investiture, up to your [Colour] rank, to …"`, stating the
  per-point scaling in the same sentence.
- Only for talents whose effect is already a numeric scale, not for binary on/off effects.

### Description length

Deity talents run longer than leyline talents because they typically include `Spend → setup → test → success clause → failure clause → duration`. Targets:

- **Entry / Tier-2 talents:** ~30–45 words
- **Tier-3 synthesis talents:** ~40–55 words
- **Capstones:** up to ~70 words (more is overdesigned)

If a talent runs past these caps, split it. A capstone that runs 90+ words is doing too much.

### Cost scale

- 1 Investiture = entry-level routine effect
- 2 Investiture = tier-2 / synthesis effect
- 3 Investiture + once-per-scene = capstone
- 4 Investiture is reserved for the genuinely catastrophic (Raise Dead, etc.)
- Opportunity costs are elegant — pair with 1 Investiture for the deity's signature Opportunity-spend talent

### Prerequisite patterns

- **Entry nodes:** `[Color1] 2+; [Color2] 2+`
- **Tier-2 talents:** prereq one of the two entries
- **Tier-3 synthesis:** prereq `[Tier-2 talent A] or [Tier-2 talent B]` from each branch (allowing the player to reach synthesis from either side)
- **Capstone:** prereq one of the tier-3 synthesis nodes

Skill-rank gates beyond the entry-node `2+` requirement are rare in deity trees. The 2+ in both colors already gates the tree behind significant investment.

---

## PART 3: REVISION PRINCIPLES

**1. Fantasy on the first talent — from both entries.** A new player who picks either entry should feel the deity's archetype on turn one. No setup talents, no "preparation" before the fantasy lands. Withering Touch makes you a necromancer on turn one; Reaper's Harvest also makes you a necromancer on turn one.

**2. Each subsequent talent is a new twist on the same fantasy.** Curse → drain → spread → deny death → harvest → animate → interrogate → revive. No utility filler. If a talent doesn't add a new facet to the deity's identity, cut or replace it.

**3. Both branches deliver, then converge.** Tier-2 talents stay in their entry's lane (Black entry's branch stays Black-flavored; Green entry's branch stays Green-flavored). Tier-3 synthesis nodes bring the two halves together. The capstone is reachable from either tier-3 node.

**4. Color-thematic test rule.** When a talent tests, it tests the more thematically appropriate of the path's two colors. The rule of thumb: diminishment / curse / kinetic destruction / vital-damage / Isolation → the darker color (Black, Red, Blue). Restoration / buff / coordination / foresight / pack-tactics → the lighter color (White, Green). When uncertain, ask which leyline specialty (Bulwark/Isolation/Conflagration/etc.) the talent's effect resembles, then use that specialty's color.

**5. Homebrew resources should be the spine of the tree, not a side mechanic.** If a deity introduces a resource token (Harvested Remain, Charge, Ordained Ground, Snare), it should be generated by an entry and spent by most of the rest of the tree. Resources that only one or two talents interact with are usually a sign the tree's economy hasn't been thought through.

**6. Investiture cost in description opening.** Every non-Passive talent opens with `Spend X Investiture and …`. Cost field uses Title Case (`1 Investiture`, `2 Investiture, Opportunity`); description body uses lowercase verbs but preserves `Investiture` and `Opportunity` capitalization.

**7. Specialty field = path name.** No "Key" specialty, no tier subdivisions in the Specialty field. Every Death talent has `Specialty: Death`; every Power talent has `Specialty: Power`.


**9. Deity power is Radiant-tier.** Unlike leyline mages (who are mortal, comparable to Heroic paths), a deity-blessed character wields cosmic-scale magic — necromancy, prophecy, demolition, sovereignty, conquest. This is where the high-fantasy power lives in the Edha system. Don't undersell the capstones.

**10. Action-type honesty.** A talent whose effect triggers on another character's action is a Reaction (⟲), not an Action (▶). A talent that grants an upgrade rider applied during another talent's placement is a Free Action (◇), not an Action. If you find yourself writing "use Reaction to …" inside a ▶ talent, the talent should be ⟲.

---

## PART 4: DEITY IDENTITIES

The 10 identities **as built** (rewritten 2026-09-13 under R-104 (a); the readable per-tree read is `docs/analysis/talent-ecosystem/TREE-INTENT.md`). The **colour split** records what the talents actually roll and size. Where a gate colour buys nothing — no test, no die, no number — the entry says so and names the item that gives it a job, so that the next talent written for that tree is the one that fixes it. Where an old line promised a mechanic no talent delivers, the promise is named and retired.

### 🟢⚫ Morrath — Death (Green + Black)
- **Fantasy:** Necromancer, and an **economy of deaths** first: every drop to 0 HP within range refunds Investiture and leaves a Harvested Remain; the tree converts Remains into scene-long, action-free damage and utility (bone garden, risen servant, corpse interrogation) and, once a scene, the game's only resurrection. Death-touch on the Black entry; corpse-harvest on the Green entry. `Death Ward` is protection, not a kill.
- **Color split:** Black tests for the ward against unwilling targets; Black rank sizes the curse, the decay and the cascade; Green rank sizes the bone garden and the servant. No Green test — most Green talents are placements or interactions with the already-dead, as designed.
- **Homebrew resource:** Harvested Remain (5 of 9 by the two-branch design; corpses, not Investiture, are the rate limiter).
- **Gameplay loop:** Kill (Black) → harvest the corpse (Green) → install decay / cascade / garden → spend Remains on Risen Servant / Speak with the Fallen / Raise Dead.

### 🔵⚫ Maelith — Chaos (Blue + Black)
- **Fantasy:** **Mark-and-detonate striker.** An Omen is placed by *landing a Blue test* and spent for the forced reroll (the bearer rerolls and takes the lower result), for Isolate-and-wound, for Disorient-and-dispel, or shattered all at once for area spirit damage. All Chaos damage is spirit or vital — nothing is turned aside by Deflect. *(Corrected 2026-09-13: the old "force Complications onto enemy tests, then convert them into focus, advantage" was never built — no Chaos talent reads a Complication, seizes focus or steals advantage. Do not re-author those; the built identity is the striker.)*
- **Color split:** Blue tests place, spread and collapse Omens; Black tests isolate, unweave and ruin. Both colours size dice.
- **Homebrew resource:** Omen (built, 9 of 9). Known structural fault: the Black lane *spends* Omens it cannot *make* — a Chaos disciple who takes only the Black entry plays a weaker tree.
- **Gameplay loop:** Stamp (Entropy Strike) → spread → spend (Shatter Focus on the roll that matters, Isolating Ruin, Unweaving) → Cascade Collapse / Unravel Everything.

### ⚪🔵 Tessavain — Order (White + Blue)
- **Fantasy:** Lawgiver on one lane, oath-brother on the other. Declare Edicts (one prohibited act; the first violation is punished, and an Edict that never fires is an enemy controlled); swear Covenants (a two-way pact that shields both); force the violation with Verdict; bind the whole field with Final Decree.
- **Color split:** **Every test rolls Blue** and all four damage formulas size on Blue rank. White never tests — it carries **magnitude**: temp HP per round by White rank (`Bear Witness`), damage reduction and shared temp HP by White rank (`Shoulder the Oath`). That is a paid-for gate, not a toll. *(The old "White tests for binding pacts" line is retired.)*
- **Homebrew resources:** Edict and Covenant (9 of 9 — the tightest spine in the atlas). *(The old "Sacred Oaths and Binding Clauses" name is retired.)*
- **Gameplay loop:** Edict the enemy who is about to do the thing you cannot allow; Covenant the ally who is about to take the hits → Lawkeeper's Eye / Bear Witness for free → Verdict or Concord → Final Decree.

### 🟢🔵 Anaveth — Life (Green + Blue)
- **Fantasy:** **Diagnosis-economy healer.** Mark one creature: the party learns its statblock and deals +Tier vital to it, and (`Prognosis`) every wound it takes pays you Investiture. Spend that on the biggest heals in the game, each with a rider (temp HP overflow, stacking Deflect, condition removal, regeneration). **Mutation is the deep end** — `Adaptive Mutation` is Green 3+, level 6 — not the entry. *(Corrected 2026-09-13: the old "reading an ally's anatomy to strike an enemy's" has no talent; `Vital Diagnosis` marks any one creature.)*
- **Color split as built:** No Green test. One Blue test (`Surgical Precision`, Blue 3+, level 6). Green rank sizes every heal formula; Blue is otherwise a gate — **item 108 (R-99 (a)) gives it a job**; do not describe a Blue mechanic in Life until it lands.
- **Homebrew resources:** Diagnosis (the entry marker, and the economy) and Mutation (level 6).
- **Gameplay loop:** Diagnose the enemy the party will fight anyway → heal with the rider the moment needs, funded by the mark → mutate at the deep end → Apex Form.

### ⚫⚪ Verdannis — Sovereignty (Black + White)
- **Fantasy:** **Die-step arbiter.** Censure steps one enemy's damage die down; Exalt steps one ally's up; the scene-long versions and the paired judgments arrive deeper; an enemy under Censure that fails pays the court (Investiture back, a Reactive Strike for its target, temp HP to the party). One creature at a time.
- **Color split as built:** Every test rolls Black. **White is a pure gate** — no test, no die, no number reads it (**items 106 and 108**). *(The old "cleanest example of the colour-thematic test rule — White tests for elevate" is retired: the elevate half has no test at all.)*
- **Homebrew resource:** The die-step ladder today. **The Decree zone — a declared law within a radius that moves with the arbiter — is being built under item 106 (R-97 (a)).** Until it lands, no description or talent should refer to a Decree as existing.
- **Gameplay loop:** Censure the enemy whose blows you fear → Exalt the ally whose blows you want → scene versions → Sovereign's Balance / Edict of the Fallen → Sovereignty.

### 🔴🟢 Gnothis — Knowledge (Red + Green)
- **Fantasy:** Predator-scholar. Insight stacks on one studied target; every Insight multiplies the dice of the payload strike (the only dice-count multiplier in the game); the pack shares the read and the bonus; the kill carries the stack to the next quarry.
- **Color split as built:** Red tests the payload (`Killing Blow`, `The Final Study`) and sizes every damage die. **Green is a gate** — no Green test, no Green die; `Studied Mark` and `Pack Share` are untested. Green 2+ and Green 3+ are access tolls. *(Old "Green tests for stack-generation, observation, and pack-share" retired; not in item 108's scope — a future Knowledge change should give Green a number.)*
- **Homebrew resource:** Insight (9 of 9).
- **Gameplay loop:** Mark → strike the same creature every turn (the repeatable `Predatory Strike` out-damages the cash-out) → pack shares → re-mark on the kill; the verdict is a finisher, not the plan.

### ⚪🟢 Olvarra — Fate (White + Green)
- **Fantasy:** **Battlefield engineer.** Ordained Ground where allies will stand (defence, Aid at range, temp HP, no advantage against them); Snares where enemies will step (untested keen damage + Restrained); riders, links, an ally-sprung trigger, and a declared-event capstone. Foresight is one talent (`Read the Threads`), and it acts after placement. *(Corrected 2026-09-13: "the oracle who sets the board before initiative" — every placement costs an Action in combat; nothing places anything pre-initiative.)*
- **Color split as built:** Green rank sizes every Snare die. **White is a pure gate** — no test, no die, no number (**item 108 (R-99 (a))**). *(Old "White tests for ordained-ground bulwark effects" retired — `Bulwark Ground` is a Passive with no test.)*
- **Homebrew resources:** Ordained Ground (ally-anchored) and Snare (enemy-triggered), 9 of 9.
- **Gameplay loop:** Place (ground under the holder, Snare on the approach) → link / read-and-move → allies spring the traps → Thread of Inevitability.

### 🔴⚪ Kethane — Civilization (Red + White)
- **Fantasy:** Construct-smith. Build one Combat Construct on turn one; **arm** it with a six-talent ladder (tempered edge, siege form, second strike, Colossus); **reforge** it if it falls. Lay Foundations (steady, link as roads, fortify into walls with teeth). *(Corrected 2026-09-13: "repairs and commands it" — nothing repairs, and the Construct acts on its own initiative rather than being commanded turn by turn.)*
- **Color split as built:** Red rank sizes `Bastion` and `Magnum Opus` dice and their Agility saves. White carries magnitude in one talent (`Bonds of Community` temp HP = White) — a marginal gate, not a pure toll.
- **Homebrew resources:** Combat Construct (one active) and Foundation (up to tier; `Trade Routes` needs two — item 114 repairs it for the one-Foundation window).
- **Gameplay loop:** Forge → arm → Foundations under the party → fortify → Magnum Opus.

### ⚫🔴 Tyrith — Power (Black + Red)
- **Fantasy:** Conqueror. **Compelled** (the only source in the game) and the dictated action (`Absolute Authority` takes an enemy's turn and spends it); a melee warlord's riders (extra dice, temp HP and a step on the kill, the free charge on an Opportunity, walking through the line); scene-long amplifiers; the Mantle.
- **Color split:** Black tests for Compelled / the dictated action / control; Red rank sizes the melee riders. Red tests rare — the weapon attacks and kinetic riders need no contested test.
- **Homebrew resource:** **`Warlord's Fury`** — a scene-long install whose bonus counts enemies you have *bloodied* (below half) this scene, +1 on a kill, capped at tier × 2, and feeds **melee damage only**. *(Corrected 2026-09-13: there is no "Bounty" tally, it does not feed the domination talents, and it is not passive. Dead keyword: `Kneel` and `Absolute Authority` read Frightened, which no talent in the game applies.)*
- **Gameplay loop:** Kneel (Black) → Absolute Authority → advance through the line → Warlord's Fury → Mantle.

### 🔵🔴 Razkael — Destruction (Blue + Red)
- **Fantasy:** Pyrotechnician / siege engineer on two lanes: **Charges** (declared trigger, detonated on a Free Action, no roll, no save, dangerous terrain left behind) and **fire** (`Pyre` spreads every turn, `Combustion Chain` grows every zone on a death, `Walking Ruin` burns where you walk, `Fault Line` trenches the field). The edge is reliability — almost nothing here can miss or be saved against — and the only control is Prone; nothing pulls enemies into the zones.
- **Color split as built:** Everything rolls Red — every damage die sizes on Red rank and both saves are vs. Red. Blue sizes exactly one optional rider (`Pinpoint Charge`) and is otherwise a gate (**item 108 (R-99 (a))**). *(Old "Blue tests for precision (Pinpoint Charge)" retired — `Pinpoint Charge` has no test.)*
- **Homebrew resources:** Charge and dangerous terrain (the only source of the keyword), 9 of 9.
- **Gameplay loop:** Place Charges + Pyre → wait / trigger → Cascading Failure → The Unmooring detonates everything at once.

---

## PART 5: STANDARD TREE TOPOLOGY

Most deity trees converge on the two-entry / two-branch / synthesis / capstone shape:

```
   [Entry A — Color1]                  [Entry B — Color2]
       /        \                          /         \
   Tier-2A    Tier-2B                  Tier-2C     Tier-2D
       \        /                          \         /
        Synthesis A                        Synthesis B
                \                          /
                 \________________________/
                            |
                       Capstone
```

This shape isn't mandatory — let the deity's mechanics determine the structure — but it has proved robust for all four trees reworked so far (Death, Destruction, Fate, Power). Variations:

- **Synthesis nodes drawing from both branches** (e.g. Death's Necrotic Cascade reaches into either the Black or Green branch). Acceptable when the synthesis effect genuinely sits at the intersection.
- **Capstone with one prereq** (rather than `Synthesis A or Synthesis B`). Acceptable when the capstone clearly belongs to one branch's culmination.
- **Three entries** is reserved for future redesigns and should not be the default.

---

## PART 6: TEST PHRASING REFERENCE

Always `test [Color] vs. [Defense]`. Defense word is usually omitted.

| Defense | When to use |
|---------|-------------|
| Physical | Force, kinetic, raw strength; targets resist with Speed or Strength |
| Cognitive | Compelled, Weakened, Influence resistance; targets resist with Willpower |
| Spiritual | Dispel, oath-breaking, soul-touch effects; targets resist with Presence or Awareness |

| Active rolling skill | Used by |
|----------------------|---------|
| Black | Death (curse), Sovereignty (diminish), Power (dominate), Chaos (Isolation payoff) |
| Red | Destruction (kinetic save DCs), Power (rare), Knowledge (damage payload) |
| White | Sovereignty (elevate), Order (lawgiver), Fate (bulwark), Civilization (community) |
| Blue | Order (cognitive enforce), Knowledge (analysis), Fate (foresight), Destruction (precision), Chaos (force Complication) |
| Green | Life (heal/mutate), Death (rare — most green talents are placements), Knowledge (insight), Fate (snare-trigger), Knowledge (insight) |

When a talent's effect lands across both colors (e.g. Sovereignty's Equilibrium averages HP, which is neither pure diminish nor pure elevate), prefer no test and gate the talent by trigger conditions instead.

---

## PART 7: OUTPUT FORMAT

When proposing a deity tree rework, produce the response in this shape:

### Brief design rationale (2–3 sentences)

Open with what makes the two entries deliver the fantasy on turn one, and what the tree's gameplay loop is.

### New homebrew resources (if any)

For each new token: name, where placed, what triggers, what spends, caps, duration.

### Tree shape (ASCII diagram)

```
   [Entry A ▶ Color1]               [Entry B ◇ Color2]
       /         \                     /          \
   Tier-2     Tier-2              Tier-2      Tier-2
        \        /                     \         /
         Synthesis                    Synthesis
                 \                    /
                  \__________________/
                            |
                       Capstone
```

### The talents

For each talent, in this format:

> ### N. **[Name]** — [Color side] entry / Tier 2 / Synthesis / Capstone
> **Action ▶** · **Cost** · **Prereq**
>
> Spend X Investiture and [effect text matching all phrasing rules].
>
> *Flavor:* [in-world one-liner, never explaining mechanics]
>
> *Tags:* `[path identity]; [mechanic]; [condition if any]; [resource if any]`

Each talent runs ~30–60 words for the description, depending on complexity.

### What was cut / repurposed / added

Three short lists naming which talents from the previous version were dropped (and why), which were repurposed (and how), and which are new additions.

### Open questions

3–5 bullet points calling out balance or design questions for the user to confirm before the tree is locked. Examples: resource caps, save-DC scaling, capstone scope, action-type reclassifications.

---

## PART 8: COMMON PITFALLS

**The Key talent reflex.** When porting older deity material, the first instinct is to keep the Key talent as one of the two entries. Resist this — Key talents were typically passive infrastructure ("recover Investiture on kill") rather than fantasy-delivering on turn one. Convert the Key's effect into a passive rider on a new entry or fold it into a Tier-2 talent.

**Single-entry trees.** If you find yourself writing a tree where the "second entry" is actually a less-good version of the first entry, the tree only has one real fantasy. Either find a second genuine fantasy facet for the second entry, or admit the deity's identity is too narrow and reshape it.

**Synthesis nodes that just repeat tier-2.** A synthesis node should do something neither branch's tier-2 nodes do on their own. If the synthesis is "tier-2A but a little more," it should be cut and the resources reinvested in the capstone.

**Capstones that don't pay off the tree's investment.** A capstone for a charge-placing tree should detonate the charges; a capstone for an insight-stacking tree should consume the stacks for a massive payload; a capstone for a snare-laying tree should trigger every snare on a predicted event. A capstone that just buffs the player's defenses for the scene doesn't honor what the tree has been building.

**3-Action talents below the capstone.** If a talent below the capstone needs 3 Actions, it's doing too much. Split it into a 2-Action effect plus a Free Action follow-up, or fold the heavier half into the capstone.

**Deity-specific skill tests.** Anywhere the user's older material says `test Sovereignty vs. Spiritual` or `Discipline test vs. Cognitive` triggered by a deity talent, flag and rewrite to `test [Color] vs. [Defense]` using one of the deity's two leyline colors.

**Missing Investiture in description.** Every non-Passive talent must open with the spend phrasing. If you're reviewing existing talents, this is the most common phrasing-verifier flag.

---

## PART 9: HOW THIS SKILL RELATES TO OTHERS

- **`cosmere-canon-reference`** — the authoritative source for capitalization, conditions, attributes, defenses, action types, and standard phrasings. Load it for any phrasing question.
- **`leyline-revision-guide`** — the parallel skill for the five leyline color trees. Reference it for color-identity boundaries and any cross-system questions (e.g. "is this talent doing something Green Restoration already does?").
- **`talent-balance`** — the live-review skill for individual talents shown in the Designer. The deity identity table in talent-balance mirrors Part 4 of this skill; keep them in sync.
- **`phrasing-verifier`** — the auto-fix and source-categorization skill. The deity-test convention and cost-in-description rule are encoded there for batch checks; load it when applying bulk fixes across many deity talents.

When in doubt about a phrasing question, defer to `cosmere-canon-reference`. When in doubt about a balance or fantasy question, this skill's Parts 3 and 4 take precedence.

