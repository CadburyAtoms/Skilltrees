# Talent ecosystem review — tooling, measured ground truth, and findings

Started 2026-09-09 from Ben's ask: *"what's the damage distribution between trees? do heroic and
leyline paths feel similar in power at similar points along the tree? do deity paths feel similar
to each other? are there synergies between paths?"* — triggered by a pre-session-one review
finding two PCs in paths with no damage talents (White and Blue).

Scope ruled by Ben: **the 365 talents only.** Adversaries, PC build ladders and system-native
talents are explicitly out. Ben also ruled that **adding damage to Blue and/or White is on the
table** — the no-damage identity is not fixed. **Nothing here changes a talent.** The deliverable
is a diagnosis plus ranked recommendations; no design decision is committed without Ben's yes.
The open questions are filed as rulings **R-95 … R-105** in `EDHA_RULINGS.md`, not as checklist
rows, because they ask Ben to *decide*, not to *look*.

## How to run it

```
node docs/analysis/talent-ecosystem/derive-dossiers.js    <outdir>   # 21 dossiers + intent + primer + guide claims
node docs/analysis/talent-ecosystem/damage-census.js      <outdir>   # damage classifier, roll-formula cross-check, wiring, damage types
node docs/analysis/talent-ecosystem/functional-overlap.js <outdir>   # tree-vs-tree function-vector overlap
node docs/analysis/talent-ecosystem/resource-economy.js   <outdir>   # producer/consumer census + advantage ledger + plot die
node docs/analysis/talent-ecosystem/deity-gate-audit.js   <outdir>   # two-colour gates + signature resources
node docs/analysis/talent-ecosystem/shared-talents.js     <outdir>   # cross-tree duplicate talents + data hygiene
node docs/analysis/talent-ecosystem/combat-share.js       <outdir>   # what does nothing once initiative is rolled
node docs/analysis/talent-ecosystem/formula-audit.js                 # @paths that will not resolve to a number
```

Run `derive-dossiers.js` first; every other script reads its `all-talents.json`. `<outdir>` is
scratch and gitignored. The agent review is `review-workflow.js`, invoked with the Workflow tool
(21 tree profiles, each double-challenged; 13 cross-cut analyses, each attacked by two adversarial
lenses and reconciled; a completeness critic, a defence advocate, and four framings of the
remediation options).

`derive-dossiers.js` is the useful one beyond this review. It joins `data/leyline.json`,
`data/cosmere.json`, `data/domain.json` and the `data/authored/` overlay into one row per talent,
and computes two things the raw data does not carry:

* **depth** — how many talents in the same tree you must own first. Mirrors the requirement model
  in `scripts/validate.js` / `scripts/validate-build.py`: every `connections` entry that resolves
  inside the tree is ONE managed prereq group satisfied by owning any member (iron rule 7), each
  prose prereq group is its own group, AND across groups.
* **earliestLevel** — earliest character level that can hold the talent: 1 talent per level from
  level 1, plus the rank gate (a `Colour 3+` prereq is unreachable before level 6, because the
  skill rank cap is 2 up to level 5 and 3 from level 6).

It also copies `SYSTEM-PRIMER.md` into the dossier, writes the 21 `INTENT-*.md` files, and
extracts both revision guides into `DESIGN-GUIDE-CLAIMS.md` as a second, more falsifiable intent
source.

## The rules facts every judgment here rests on

Full detail and citations in `SYSTEM-PRIMER.md`. The four that change conclusions:

1. **Advantage is binary and does not stack.** cosmere-rpg 2.1.0's `configureModifiers()` sets
   `d20.number = 2` with `kh`, full stop; and the Edha engine's own `edhaNextModFoldMode`
   boolean-ORs multiple sources into the one scalar the system holds. **Disadvantage is the same
   scalar.** A second advantage — or a second disadvantage — on the same roll is worth zero.
2. **1 Reaction per round**, and **3 Actions per slow turn / 2 per fast**.
3. **Draw Mana is 1 Action for Tier Investiture** — so 1 Investiture per Action at levels 1–5.
   Investiture max is `2 + max(AWA, PRE)`, about 4 at level 1.
4. **Level 6 is a double step for leyline and deity, and not for heroic.** Tier goes 1→2 and the
   rank cap goes 2→3 at the same level, so `[Tier][Die]` jumps `1d6` → `2d8` — 3.5 average to 9,
   in one level.

## Measured ground truth

### Damage — two independent measures, and they agree where it matters

The word "damage" hides four different things, and conflating them produced the original "White
has no damage talents" read. The classifier separates **source** (the talent creates damage),
**amplify** (adds to an attack you were already making), **mitigate** (reduces damage), and
**die-size** (Sovereignty's whole kit).

The second measure is independent of prose entirely: the authored Foundry overlay carries a
machine-readable roll formula on 54 talents — **43 damage and 11 heal** (`type: "heal"` is not
damage; Scholar's three and Green's two are heals). It is a **floor**, not a ceiling — a talent
can deal damage with no formula.

| Tree | prose sources | roll formulas | verdict |
|---|---|---|---|
| leyline/Red | 8 | 4 | the only real leyline damage tree |
| leyline/Black, leyline/Green | 3, 3 | 3, 0 | |
| **leyline/White** | **1** | **1** | `Retributive Guard` only, + 1 heal formula |
| **leyline/Blue** | **0** | **0** | both measures agree at zero |
| heroic/Hunter, Warrior | 3, 2 | 2, 2 | amplifiers on a weapon attack |
| heroic/Agent, Envoy, Leader | 1 each | 1, 0, 0 | |
| **heroic/Scholar** | **0** | **0** damage / 3 heal | both measures agree at zero |
| deity/Knowledge … deity/Fate | 7 … 1 | 3 … 3 | |
| **deity/Sovereignty** | **0** | **0** | both measures agree at zero |

**Three trees deal no damage, not two, and the third is a deity tree.** Blue, Scholar and
Sovereignty. Sovereignty is the only tree that deals no damage *and* has no independent effect —
all nine talents move a damage die size up (ally) or down (enemy), so it is purely parasitic on
someone else's attack. Life is the near-miss that is fine: it has no damage formulas either, but
it carries the five largest heal formulas in the game, which is an independent effect.

**"Damage talents" is not a valid cross-atlas unit.** Warrior has 2. Heroic damage does not live
in talents — it comes from the base system's weapon attack, which heroic talents *amplify*.
Leyline and deity talents *are* the damage source.

### Damage type — a parity axis a damage count cannot see

Vital and spirit ignore Deflect; impact, keen and energy do not. **19 of 40 typed damage formulas
(48%) ignore Deflect, and they are concentrated rather than spread:** Chaos 5/5, Order 4/4,
Knowledge 3/3, Black 3/3 and White 1/1 are entirely Deflect-ignoring. Six further talents bypass
Deflect in prose rather than by type (`The Unmooring`, `Tempered Edge`, `Wit's End`), which
narrows but does not erase the point: **leyline/Red and deity/Fate are the only damage-dealing
trees with no Deflect bypass of any kind.** deity/Knowledge has half deity/Destruction's damage
talents and every one of them bypasses armour.

### Heroic damage is flat through levels 1–10; leyline doubles at level 6

This is Ben's question 2, answered from the formulas rather than from feel.

| Talent | Tier 1 (L1–5) | Tier 2 (L6–10) | Tier 3 |
|---|---|---|---|
| leyline/deity `(@tier)d(2*rank+2)` | `1d6` = 3.5 | `2d8` = 9 | `3d10` = 16.5 |
| Black `Withering Ray` `(2*@tier)d(…)` | `2d6` = 7 | `4d8` = 18 | |
| Warrior `Devastating Blow` `(2+max(@tier−2,0))d8` | `2d8` = 9 | **`2d8` = 9** | `3d8` = 13.5 |
| Warrior `Wit's End` `(4+max((@tier−2)*2,0))d6` | `4d6` = 14 | **`4d6` = 14** | `6d6` = 21 |
| Hunter `Fatal Thrust` `4d4` | 10 | **10** | **10** |
| Hunter `Deadly Trap` `2d4` | 5 | **5** | **5** |

Heroic damage talents are **flat across tiers 1 and 2 — the whole of levels 1 to 10.** Leyline
damage doubles at level 6 and overtakes them there. So a heroic character is ahead at levels 1–5,
level with them at 6, and behind after; and a leyline character's power curve has a cliff at
exactly the level heroic's does not. That is a real, structural mismatch, and it is not visible
in any talent's text.

### Every heroic tree is fully available by level 5; leyline trees are not

| | reachable by L5 | of 25 |
|---|---|---|
| every heroic tree | 25 | 100% |
| leyline/White, Black | 21 | 84% |
| leyline/Red | 20 | 80% |
| leyline/Green | 19 | 76% |
| leyline/Blue | 18 | 72% |

### Trigger-gating — White is the outlier, and by a distance

A talent is trigger-gated if it is a Reaction, or fires only when an ally or enemy acts, or when
you are hit.

| Tree | Reactions | trigger-gated | % |
|---|---|---|---|
| **leyline/White** | **7** | **13** | **52%** |
| leyline/Blue | 5 | 8 | 32% |
| leyline/Green, Black, Red | 3, 2, 1 | 7, 6, 5 | 28 / 24 / 20% |
| heroic (all six) | 1–2 | 1–4 | 4–16% |
| deity (all ten) | 0–1 | 0–3 | 0–33% |

**White has seven Reactions and one Reaction per round.** Twenty-eight percent of the tree
competes for one slot every round, and 52% of it cannot be used on White's own initiative at all.

### Deity structure

**All ten deity trees have zero Special-action talents** — against a stated deity target of
15–20% Special and a leyline target of 25–30%. Every deity turn spends real Actions. Each tree has
exactly one 3-Action talent, its capstone, which is what the deity guide prescribes.

**Nine of ten deity trees charge for a colour they never test.** Five get nothing at all from it —
no test and no damage die sized by it, so the rank investment buys only the gate:

| Tree | gate | tests | sizes a damage die | dead colour |
|---|---|---|---|---|
| Chaos | black/blue | blue 3, black 3 | blue 3, black 2 | — the only clean one |
| Order | blue/white | blue 1 | blue 4 | **white 2+** |
| Civilization | red/white | none | red 2 | **white 2+** |
| Fate | green/white | none | green 3 | **white 2+** |
| Knowledge | red/green | red 2 | red 3 | **green 3+** |
| Sovereignty | black/white | black 3 | none | **white 3+** |

**Four of the five dead colours are White.** White is gated by four deity trees and mechanically
rewarded by none of them. Sovereignty demands White 3+ — a level-6, six-skill-rank investment —
and tests Black three times and White zero times, while the deity design guide says of exactly
this tree: *"Black tests for diminish; White tests for elevate. This is the cleanest example of
the color-thematic test rule."*

### Four stated signature mechanics were designed and never built

| Tree | promised, in both intent sources | reality |
|---|---|---|
| **Sovereignty** | **Decree** — "a declared law projected within a radius"; the deity guide adds "Decree zones" and the loop "diminish target → elevate ally → bring them into Decree" | No talent creates a zone, radius or aura. All nine are single-target. "Decree" survives only in the title `Decree of Ruin` and one flavour line. |
| **Power** | **Bounty** — "a tally of the fallen" | Named in no talent. `Warlord's Fury` implements an unnamed equivalent. |
| **Chaos** | **Omen** — "gained when you force a Complication onto an enemy"; the guide calls the resource "TBD — likely a Complication token" | Omens exist and work, but no Chaos talent touches a Complication. Omens are placed by winning a Blue test. |
| **Blue** | the leyline guide: *"Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression."* | Blue has **zero** plot-die talents. heroic/Agent has six — and `Sure Outcome` ("change Opportunity to Complication 4, or any Complication to Opportunity") is literally the guide's sentence, built in another atlas. |

White, by contrast, **delivers** its stated plot-die integration: `Guiding Signal`,
`Concordant Presence` and `Unity of Purpose` all raise the stakes, and `Pillar of Order` blanks a
Complication.

### Resource economy — where the synergy answer lives

| Resource | Produced by | Consumed by | Verdict |
|---|---|---|---|
| **advantage** | 45 talents, 13 trees | 7 talents, 5 trees | **over-produced, and it does not stack** |
| **disadvantage** | 14 talents, 9 trees | 0 | produced, never consumed; also does not stack |
| Investiture | 9 (bonus regen only) | 133 (the Cost field) | |
| Focus | 6 | 52 | |
| Opportunity | 9 | 17 | |
| plot die | 9 | 6 | balanced |
| Omen / Quarry / fabrial / Harvested Remain / Ordained Ground / Snare / Edict / die-size | 1 tree each | the same tree | **eight sealed loops** |

* **Cross-atlas synergy is suppressed by construction** — leyline and deity run on Investiture,
  heroic on Focus. The pools barely touch.
* **Blue and White have 15 Investiture-costing talents each and zero bonus regen.** Green has
  13 and zero. Black and Red have 9 each and two regen talents each. deity/Power costs Investiture
  on all nine of its talents.

### Eleven percent of the system is copy-paste

41 of 365 talent slots are a talent that also exists in another tree.

| Talent | trees |
|---|---|
| `Hardy` | 7 |
| `Mighty` | 6 |
| `Collected` | 5 |
| `Composed` == `Focused Mind` == `Clear Mind` | 5, under three names |
| `Baleful`, `Surefooted` | 3 each |
| `Well Dressed`, `Customary Garb`, `High Society Contacts`, `Combat Training`, `Swift Strikes` | 2 each |

Agent, Envoy and Leader are each **24% shared filler**. Blue and Scholar share exactly one talent
(`Collected`) plus one near-identical pair (`Composed`/`Clear Mind`) — and both are generic
talents that three to five other trees also carry.

### Scholar is the only substantially non-combat tree

| Tree | talents that do nothing once initiative is rolled |
|---|---|
| **heroic/Scholar** | **10 of 25 (40%)** — Erudition, Efficient Engineer, Prized Acquisition, Deep Study, Fine Handiwork, Experimental Tinkering, Mind and Body, Deep Contemplation, Emotional Intelligence, Ongoing Care |
| heroic/Agent | 5 (20%) |
| heroic/Envoy, Leader | 3 (12%) |
| heroic/Warrior | 2 (8%) |
| every leyline and deity tree, heroic/Hunter | 0 |

### The capability matrix — 21 trees scored on 15 axes

Each tree was profiled by a dedicated agent and then attacked twice: once by a forensic recount
lens and once by a comparative lens that checked every exclusivity claim against the other twenty
trees. **780 corrections were applied.** Scores are 0–5, strict: 0 = does not do this, 3 = a real
competency, 5 = the reference implementation.

| Tree | dmg | scal | ctrl | debuff | prot | heal | buff | act | mob | zone | info | social | explore | summon | resource | **Σ** |
|---|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| leyline/Green | 2 | 2 | 3 | 1 | 2 | **5** | 3 | 2 | 1 | **4** | 3 | 0 | 3 | 0 | 0 | **31** |
| leyline/Black | **4** | **4** | **4** | **4** | 1 | 1 | 2 | 2 | 1 | 1 | 0 | 2 | 0 | 0 | **4** | **30** |
| leyline/Blue | 0 | 0 | 3 | **4** | 2 | 0 | 2 | 3 | 1 | 2 | **4** | 2 | 3 | 1 | 1 | **28** |
| leyline/White | 1 | 1 | 2 | 2 | **5** | 2 | 3 | 2 | 2 | 0 | 0 | 2 | 2 | 0 | 3 | **27** |
| leyline/Red | **5** | 3 | 3 | 2 | 0 | 0 | 3 | 2 | 2 | 1 | 1 | 1 | 1 | 0 | 1 | **25** |
| heroic/Hunter | 3 | 3 | 2 | 1 | 2 | 1 | 2 | 3 | 2 | 2 | 3 | 0 | **4** | 3 | 1 | **32** |
| heroic/Agent | 1 | 1 | 3 | 2 | 2 | 0 | 2 | **4** | 2 | 0 | 3 | **4** | **4** | 0 | 3 | **31** |
| heroic/Warrior | **4** | 3 | 3 | 3 | **4** | 0 | 1 | 3 | 2 | 1 | 1 | 2 | 2 | 0 | 2 | **31** |
| heroic/Envoy | 1 | 1 | 3 | 2 | 3 | 3 | **4** | 3 | 0 | 0 | 0 | 3 | 2 | 0 | **5** | **30** |
| heroic/Leader | 1 | 1 | 3 | 3 | 2 | 1 | **4** | 3 | 2 | 0 | 1 | **5** | 2 | 0 | 2 | **30** |
| heroic/Scholar | 0 | 0 | 1 | 2 | 2 | **4** | 2 | 3 | 0 | 0 | 2 | 1 | **5** | 0 | 2 | **24** |
| deity/Civilization | **4** | **4** | 2 | 0 | 3 | 0 | 1 | 3 | 2 | 3 | 0 | 0 | 1 | **5** | 0 | **28** |
| deity/Death | **4** | **4** | 1 | 1 | 2 | 2 | 0 | 2 | 0 | 2 | 2 | 0 | 3 | 2 | 3 | **28** |
| deity/Life | 2 | 2 | 1 | 2 | 3 | **5** | **4** | 1 | 1 | 0 | 2 | 0 | 2 | 0 | 2 | **27** |
| deity/Fate | 3 | 3 | 3 | 2 | 2 | 0 | 2 | 3 | 0 | **5** | 2 | 0 | 1 | 0 | 0 | **26** |
| deity/Knowledge | **5** | **5** | 0 | 2 | 0 | 1 | 3 | 2 | 0 | 0 | 3 | 0 | 1 | 0 | 2 | **24** |
| deity/Destruction | **5** | 3 | 2 | 1 | 0 | 0 | 0 | 2 | 1 | **5** | 0 | 0 | 2 | 0 | 0 | **21** |
| deity/Power | 3 | 3 | 3 | 1 | 2 | 0 | 3 | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | **20** |
| deity/Order | 3 | 2 | 3 | 1 | 3 | 0 | 3 | 2 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | **19** |
| deity/Chaos | **4** | 3 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 2 | **17** |
| **deity/Sovereignty** | **0** | **0** | 1 | **4** | 2 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **13** |

**Compare only within an atlas** — deity trees have 9 talents to leyline and heroic's 25, so a
lower total is expected there and means nothing on its own.

* **Within leyline, Blue (28) and White (27) are not the weak trees. Red is (25).** The two trees
  Ben was worried about sit mid-pack, above the tree that does all the damage. That is the direct
  answer to "is no damage PAID FOR, or is it a hole?" — for Blue and White it is **paid for**, in
  breadth. Red buys its 5-on-damage by scoring 0 or 1 on eight of the other fourteen axes.
* **Within heroic, Scholar (24) is the outlier**, six below the next-lowest. Its only 5 is
  exploration utility, which is also the axis most likely to be undervalued by a combat-shaped
  rubric — but it is still the one heroic tree a player might feel short-changed by in a fight.
* **Within deity, Sovereignty (13) is a catastrophic outlier** — four below the next-lowest and
  less than half the top. Its single strength (debuff 4) is shared with Black and Blue, both of
  which also do everything else. It is the one tree where you cannot name a something it owns.

### The axes nobody owns, and the ones everybody has

| Axis | scores 4–5 | any presence |
|---|---|---|
| **mobility** | **NOBODY — not one tree in the game scores above 2** | 13/21 |
| summons | Civilization only | **4/21** |
| terrain / zone | Green, Destruction, Fate | 10/21 |
| healing | Green, Scholar, Life | 10/21 |
| social influence | Agent, Leader | 11/21 |
| information | Blue only | 14/21 |
| control | **Black only** | **20/21** |
| damage | 8 trees | 18/21 |

**Control is the system's commodity**: twenty of twenty-one trees have some, and exactly one is
good at it. Damage is nearly as common. **Mobility is an unclaimed axis** — no tree is built
around movement, which is a design opportunity rather than a defect. Monopolies worth protecting:
Green owns the only removal of Injuries in all 365 talents; Black owns the only whole-turn action
denial, the only HP→Investiture conversion, and the only damage-type conversion; Agent owns the
only plot-die reroll; Civilization owns summons outright.

### Intent drift is near-universal

**Twenty of the twenty-one trees are PARTIAL or DRIFTED against their own stated identity. Only
deity/Death delivers what it says.** That is not a per-tree defect; it is a documentation problem
at system scale. The prose was written before or alongside the talents and was never reconciled.
Representative:

* **leyline/Red** — "a melee charger disguised as a ranged pyromancer". Its prose, its specialty
  names and its Investiture costs all point at Conflagration; its actual ceiling is a free
  depth-2 Passive on a 20-foot run-up. And the promise repeated in *both* intent sources —
  "every wound taken is fuel", "damage taken feeds future power" — is delivered by **zero** talents.
* **leyline/Blue** — "a pure disadvantage-and-denial controller … not a probability manipulator",
  whose real kit does not assemble until level 6.
* **heroic/Scholar** — "empirically a CRAFTING-AND-CLINIC path", not the strategist its name implies.
* **deity/Fate** — "a battlefield-engineering tree, not an oracle": eight of nine talents place,
  move or detonate 5 ft tokens; exactly one does foreknowledge.
* **deity/Civilization** — "you spend your opening turn building an autonomous attacker … and then
  spend the rest of the fight doing very little while it does ~4 [Tier][Die] a round".

## Findings

### 1. `Momentum's Edge` is broken, and its design intent is ~10× every sibling

leyline/Red `Momentum's Edge` (depth 2, **level 3**, Passive, no cost) is wired as
`bonusFormula: "@movement.walk.rate"`. But `system.movement.walk.rate` is a **DerivedValueField
object**, not a number — the engine says so itself at `19-red-momentum-frenzy.js:224`, documenting
the *same mistake shipping once before* on 2026-07-27, where a raw `Number()` on that field made
every `edha-move {byHalfSpeed}` move 0 ft. That path was fixed with `edhaDerivedNum`. The
damage-rider path was not: it goes through `Roll.replaceFormulaData`, which does `String(value)`.

So the rider very likely delivers nothing. **Whether the damage roll errors or silently adds zero
needs a live table — this is a 🤖 bench row.**

And separately, if it *did* resolve: walk rate is `20 + 5·SPD` = **30 at SPD 2**, 40 with
`Surefooted`. Every other damage rider in the game is worth 1–4:

| rider | formula | ≈ at T1 |
|---|---|---|
| `Mighty` (six trees) | `(1 + @tier)` | 2 |
| `Hexmark` | `@tier` | 1 |
| `The Unmooring` | `@attr.int` | 3 |
| `Kindle` | `@skills.red.mod` | 3–5 |
| `Burning Drive` | half a rank die | 1.75 |
| `Predatory Patience`, `Prognosis` | `1d6` | 3.5 |
| **`Momentum's Edge`** | **`@movement.walk.rate`** | **30** |

The card says "damage equal to your Speed", and the system's own lang file calls the SPD attribute
"Speed". `@attr.spd` is both the natural reading and the in-family magnitude. **R-95.**

`formula-audit.js` makes this class re-runnable; it is otherwise clean across all 365 talents.

### 2. Blue and Scholar do NOT do the same thing — but Blue's stated identity is in Agent

Read side by side, Blue and Scholar share **two** talents, both system-wide generic filler that
three to five other trees also carry. Everything else diverges: Blue is disadvantage, denial,
illusion and information; Scholar is crafting, medicine, skill-flexibility and advantage
redirection. **Verdict: DISTINCT.** The 0.794 function-vector similarity (rank 10 of 210 — nine
pairs are more similar, topped by Black↔Red at 0.911) is a *fantasy* adjacency: both are "the
clever one who doesn't hit things". That is worth fixing in the prose, not in the talents.

The real identity collision is elsewhere and sharper: **the leyline design guide gives Blue
plot-die manipulation as its "capstone identity", and heroic/Agent has it.** Six plot-die talents
to Blue's zero, including the exact effect the guide reserves for Blue.

### 3. Blue's core lever is binary, so five talents do one talent's work

Blue imposes disadvantage with five talents. Disadvantage is the same non-stacking scalar as
advantage, boolean-OR'd by `edhaNextModFoldMode`. **A Blue mage's second disadvantage in a round
is worth zero**, so the tree's power is far flatter than its talent count suggests. Only
`Probability Cascade` escapes it, by spanning the target's next **two** tests rather than one.

The fix needs no new engine work: `edha-next-test-mod` already carries a `formula` field whose
dice/flat modifiers **SUM** (item 49). It is used today by one adversary ability and by no talent.
**R-98.**

### 4. White is not a damage problem; it is a permission problem

White's kit is 52% trigger-gated with seven Reactions competing for one slot, and most of it
additionally requires allies to be adjacent — `Guardian Stance`, `Interposing Shield`,
`Retributive Guard`, `Shared Burden`, `Shield Wall`, `Unyielding Accord` and `Unbreakable Line`
all need someone standing next to someone. Its kit is hostage to enemy target selection and to
party formation, neither of which the White player controls.

Its mitigation numbers are also nearly flat within levels 1–5: `Guardian Stance` at depth 0 gives
+1 Deflect; `Shield Wall` at depth 3 reduces `half [Tier][Die]` = **1.75** at Tier 1. The climb
buys +0.75 per hit and a harder condition. At level 6 `Shield Wall` becomes 4.5 and the climb
starts paying — the same L6 cliff as leyline damage, on mitigation.

**One genuine counterpoint that cuts the other way:** because White's kit is Reactions and
passives, White's *Actions* are free, so a White mage can Draw Mana every turn at no opportunity
cost — refilling exactly the 1 Investiture per round its one Reaction needs, and healing every
ally for Tier as the rider. White's economy is self-sustaining in a way Blue's is not. What White
lacks is not resources or things to spend them on; it is **permission to act on its own turn**.

### 5. Sovereignty is the worst tree in the system, and it is the one nobody had looked at

Nine talents, one verb: move a damage die one or two steps along `d4→d6→d8→d10→d12`. A step is
**±1 average damage per die**. `Censure` is 1 Action + 1 Investiture + a successful opposed test
to remove 1 average damage from one enemy for one round. There is no damage, no zone, no
independent effect, and no out-of-combat existence. Its ceiling — the whole tree invested, the
capstone spending a full 3-Action turn and 3 Investiture — is one ally and one enemy shifted two
steps for a scene, which the d4/d12 clamp caps at about ±3 per die.

On top of that: its promised signature resource does not exist (above), and it charges White 3+
while never testing White. Compare deity/Knowledge, whose `Killing Blow` deals `[Tier][Die]` per
Insight — up to `5d6` vital, ignoring Deflect — for 1 Action and 2 Investiture, repeatable.
**Sovereignty's entire scene-long ceiling is roughly one Knowledge Action.**

Life is the tree Sovereignty is often mistaken for and is *not* a problem: it also has no damage
formulas, but it has the five largest heal formulas in the game. The distinction that matters is
**independent effect**, not damage.

## Answers to Ben's four questions

1. **Damage distribution.** Red is the only real leyline damage tree (8 sources). Deity trees are
   ~3× denser in damage per talent than leyline and ~7.5× denser than heroic, but that partly
   measures where each atlas *puts* its damage. Three trees deal none: Blue, Scholar, Sovereignty.
   Damage **type** matters as much as count — Red and Fate are the only damage trees with no
   Deflect bypass at all, while Chaos, Order, Knowledge and Black bypass armour on every damage
   talent.

   **And the key sub-question — is "no damage" paid for, or is it a hole? — has three different
   answers.** For **Blue and White it is paid for**: on the 15-axis capability budget they score
   28 and 27 against Red's 25, so within leyline the two no-damage trees are *broader* than the
   damage tree. For **Scholar it is half a hole**: 24 against 30–32 for the rest of heroic, bought
   back in out-of-combat power the rubric under-weights but a fight does not. For **Sovereignty it
   is a hole**: 13, four below the next-lowest deity tree, with no independent effect of any kind.
2. **Leyline vs heroic at comparable points.** No, and the mismatch is structural rather than
   per-talent. Heroic trees are fully available by L5 and their damage is **flat from level 1 to
   level 10**; leyline trees are 72–84% available at L5 and their damage **doubles at level 6**.
   Heroic is ahead early, level at 6, behind after.
3. **Deity parity.** Not close. Sovereignty is last by a wide margin — no damage, no independent
   effect, a signature resource that was never built, and a dead gate colour. Life is low-damage
   but legitimate. Chaos, Order, Death, Destruction and Knowledge are strong. The two-colour gate
   is priced inconsistently: nine of ten trees charge for a colour they never test, and five get
   nothing at all from it.
4. **Synergies.** Mostly absent by construction. Leyline and deity run on Investiture, heroic on
   Focus; eight resources are sealed single-tree loops; and the one currency that *is* shared
   across 13 trees — advantage — does not stack, so a party's second advantage granter contributes
   nothing. The deity two-colour gate, which is the system's only *designed* cross-path synergy,
   is a toll booth in five of ten cases.

## Known limits of these measurements

* The classifiers are regex over talent text. Three of their bugs have been found and fixed
  during this review — `Shield Wall`'s "deal half `[Tier][Die]` **less** damage" reading as a
  damage source, `advantage on` matching inside `disadvantage on`, and the plot die undercounted
  by searching literal words instead of "raise the stakes". Assume a fourth exists, and check any
  load-bearing number against the talent text before acting on it.
* Cosine similarity over a curated vocabulary ranks pairs; it does not settle one.
* **Sizing mitigation and damage against real opposition is out of scope.** "`Shield Wall`
  prevents 1.75 damage" is only meaningful against a number for how hard things hit, and adversary
  statblocks were ruled out. **R-101** asks whether a follow-up pass may read them.
* Nothing here measures what a character actually does at the table, only what the talent data
  says. `Momentum's Edge`'s live behaviour in particular needs a bench run.
