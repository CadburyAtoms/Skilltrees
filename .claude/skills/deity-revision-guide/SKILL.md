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

The 10 confirmed identities, with each deity's color split for the test rule.

### 🟢⚫ Morrath — Death (Green + Black)
- **Fantasy:** Necromancer. Death-touch on the Black entry; corpse-harvest on the Green entry. Harvested Remains fuel the corpse-magic talents.
- **Color split:** Black tests for curses, vital damage, Death Ward against unwilling targets, and direct diminishment. Green tests rare — most Green talents are placements or interactions with already-dead targets.
- **Homebrew resource:** Harvested Remain.
- **Gameplay loop:** Kill (Black) → harvest the corpse (Green) → spend Remains on Bone Garden / Risen Servant / Speak with the Fallen / Raise Dead.

### 🔵⚫ Maelith — Chaos (Blue + Black)
- **Fantasy:** Complication-broker. Force Complications onto enemy tests, then convert them into focus, advantage, or vital damage on Isolated targets.
- **Color split:** Blue tests for forcing Complications and disrupting cognition; Black tests for vital-damage payloads and exploiting Isolation.
- **Homebrew resource:** TBD — likely a Complication token banked by the player.
- **Gameplay loop:** Pressure (Blue) → Complication generated → bank → spend on Isolation-payoff (Black).

### ⚪🔵 Tessavain — Order (White + Blue)
- **Fantasy:** Lawgiver. Declare rules and pacts; punish violation; bind allies in covenant.
- **Color split:** White tests for binding pacts and group coordination; Blue tests for oath-violation detection, cognitive enforcement, and Lawkeeper foresight.
- **Homebrew resource:** Sacred Oaths and Binding Clauses (declared rules) function as soft tokens.
- **Gameplay loop:** Declare law → enemy violates → punish; or swear pact → mutual buff.

### 🟢🔵 Anaveth — Life (Green + Blue)
- **Fantasy:** Vital surgeon. Healing comes with riders (temp HP, deflect, condition removal); mutations enhance allies; HP knowledge enables precision damage.
- **Color split:** Green tests for healing, regeneration, and biological mutation; Blue tests for vital-knowledge precision damage and analysis riders.
- **Homebrew resource:** Mutations- buff allies with natural armor or poison. Plant manipulation if more damage is needed?
- **Gameplay loop:** Diagnose (Blue) → heal-and-mutate (Green) → ally becomes the engine.

### ⚫⚪ Verdannis — Sovereignty (Black + White)
- **Fantasy:** King-arbiter. Elevate one ally and diminish one enemy at a time.
- **Color split:** **Black tests for diminish; White tests for elevate.** This is the cleanest example of the color-thematic test rule.
- **Homebrew resource:** Decree zones (declared laws within a radius).
- **Gameplay loop:** Diminish target → elevate ally → bring them into Decree.

### 🔴🟢 Gnothis — Knowledge (Red + Green)
- **Fantasy:** Predator-scholar. Insight stacks on a studied target escalate damage from you and your allies; the pack shares the hunt.
- **Color split:** Red tests for the damage payload that comes from accumulated insight; Green tests for stack-generation, observation, and pack-share.
- **Homebrew resource:** Insight stacks on a marked target.
- **Gameplay loop:** Study (Green) → stack → strike (Red) → killing blow is a payload.

### ⚪🟢 Olvarra — Fate (White + Green)
- **Fantasy:** Oracle-trapper. Foreknowledge places Snares on predicted squares; allies anchor Ordained Ground positions; the board is set before initiative.
- **Color split:** White tests for ordained-ground bulwark effects and ally-coordination; Green tests for snare-trigger payloads and trap-spread (Disoriented, etc.).
- **Homebrew resources:** Ordained Ground (White-flavored, ally-anchored); Snare (Green-flavored, enemy-triggered).
- **Gameplay loop:** See (Read the Threads) → place (Ordained Ground + Snare) → enemy walks in → trigger.

### 🔴⚪ Kethane — Civilization (Red + White)
- **Fantasy:** Construct-smith. Build, specialize, repair, and command Combat Constructs across the battlefield.
- **Color split:** Red tests for Construct combat-attack tests and kinetic damage riders; White tests for community-buff effects and coordination (Trade Routes, Bonds of Community).
- **Homebrew resource:** Combat Construct (the persistent companion entity).
- **Gameplay loop:** Build (White-ish setup) → specialize (Red riders) → command and chain.

### ⚫🔴 Tyrith — Power (Black + Red)
- **Fantasy:** Conqueror. Dominate enemies into Compelled / Weakened (Black); kills escalate damage and chain (Red).
- **Color split:** Black tests for Compelled / Weakened / control; Red tests rare — most Red talents are weapon attacks or kinetic riders that don't need a contested test.
- **Homebrew resource:** Kill-count counter that scales Warlord's Fury.
- **Gameplay loop:** Kneel (Black) → exploit dominated target → kill → Momentum chain → Mantle.

### 🔵🔴 Razkael — Destruction (Blue + Red)
- **Fantasy:** Pyrotechnician / siege engineer. Plant delayed Charges; detonations leave dangerous terrain that keeps doing damage.
- **Color split:** Blue tests for precision (Pinpoint Charge) and structural targeting; Red tests for kinetic riders (Concussive Yield's Prone save, Fault Line's Speed save).
- **Homebrew resources:** Charge (Blue-flavored), dangerous terrain (Red-flavored).
- **Gameplay loop:** Place Charges + Pyre → wait / trigger → detonations chain → capstone detonates everything at once.

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

