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
node docs/analysis/talent-ecosystem/deity-gate-audit.js   <outdir>   # two-colour gates on all three channels + signature resources
node docs/analysis/talent-ecosystem/advantage-classify.js <outdir>   # every advantage-naming talent, classified by hand
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
damage doubles at level 6 and overtakes them there.

**But the level at which each side gets its damage is the other half of the answer, and correcting
the rank-gate bug reversed it.** All three of heroic's big damage talents are **level-6 gated by an
off-colour skill**:

| Talent | gate | earliest level | Tier 1 | Tier 2 |
|---|---|---|---|---|
| Warrior `Devastating Blow` | `Athletics 3+` | **L6** | — | 2d8 = 9 |
| Warrior `Wit's End` | `Intimidation 3+` | **L6** | — | 4d6 = 14 |
| Hunter `Fatal Thrust` | `Perception 3+` | **L6** | — | 4d4 = 10 |
| Hunter `Deadly Trap` | `Survival 1+` | L1 | 2d4 = 5 | 2d4 = 5 |
| Red `Searing Bolt` | `Red 1+` | **L1** | 1d6 = 3.5 | 2d8 = 9 |
| Black `Withering Ray` | `Black 1+` | **L1** | 2d6 = 7 vital | 4d8 = 18 vital |

So the honest shape is: **leyline has real damage from level 1 and heroic does not.** Black's
`Withering Ray` is 2d6 = 7 *vital* (ignores Deflect) for one Action at level 1; the strongest thing
a heroic character can do before level 6 is a weapon Strike plus `Mighty`'s +2. Then at level 6
both sides spike together — heroic's three talents arrive, leyline's dice double — and after that
heroic flattens for the rest of the tier while leyline keeps climbing with rank.

The mismatch is real but it is **not** the front-loaded-heroic/back-loaded-leyline story the first
draft of this document told. It is: leyline ahead early, both spike at 6, leyline pulls away after.

### Reachability by level 5 — heroic and leyline are at parity

> ⚠️ **This section previously said "every heroic tree is 100% available by level 5".** That was
> a bug in `derive-dossiers.js`, caught by the review's own verification pass: the rank-3 → L6 rule
> was applied only to the five leyline colours, so a talent gated on `Athletics 3+` or
> `Perception 3+` fell through and was dropped. **43 talents were mis-levelled, 37 of them
> heroic.** The rank cap is universal — `validate-build.py`: "max skill rank 2 up to level 5, 3
> from level 6" — for every skill, not just colours. Fixed; the numbers below are the corrected
> ones, and they say something different.

| Tree | reachable by L5 | of 25 |
|---|---|---|
| leyline/White | 21 | 84% |
| leyline/Black; heroic/Leader | 20 | 80% |
| leyline/Red; heroic/Envoy, Hunter, Scholar, Warrior | 19 | 76% |
| heroic/Agent | 18 | 72% |
| leyline/Blue, Green | 17 | 68% |

Every tree in both atlases opens 68–84% of itself by level 5. **There is no front-loading
asymmetry.** What there is instead is a shared level-6 wall: `maxL` is 6 for all eleven
25-talent trees, and the L6-gated count per tree is near-symmetric (heroic mean 6.0, leyline 6.4).

> A second, smaller correction, also from the review's own problem ledger: the first version of
> this fix swept up **attributes** with skills. `Shared Burden` gates on `Strength 3+`, and
> attributes advance on attribute points at levels 3/6/9, not the skill-rank cap — so it is a
> level-3 talent, not level-6. It is the only attribute gate in the data.

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

**Nine of ten deity trees never roll one of their two gate colours — but only one gets nothing at
all from it.** A gate colour can pay back its rank three ways, all visible in the authored overlay:
it is **rolled** (`skill: "<colour>"`), it **sizes a roll** (`@skills.<colour>.rank` in a damage,
heal or temp-HP formula), or it sets **reach** (`rangeColor`, `color`, `allyRange` and similar —
that colour's Attunement Range). `deity-gate-audit.js` counts all three. Each cell reads
*first colour / second colour*; "rolled", "sizes" and "reach" count references, "talents" counts
the talents that read the colour at all:

| Tree | gate | rank | rolled | sizes | reach | talents | verdict |
|---|---|---|---|---|---|---|---|
| Chaos | black / blue | 2+ / 2+ | 6 / 7 | 5 / 7 | 0 / 3 | 3 / 5 | both used — the only tree that rolls both |
| Civilization | red / white | 2+ / 2+ | 0 / 0 | 3 / 5 | 2 / 1 | 3 / 4 | red thin · white used, never rolled |
| Death | black / green | 2+ / 2+ | 2 / 0 | 6 / 3 | 4 / 3 | 4 / 3 | green thin |
| Destruction | blue / red | 2+ / 2+ | 0 / 1 | 1 / 8 | 0 / 7 | 1 / 8 | **blue near-dead** — `Pinpoint Charge` only |
| Fate | green / white | 2+ / 2+ | 0 / 0 | 3 / 0 | 4 / 0 | 5 / 0 | **white is a toll booth** — no talent reads it |
| Knowledge | red / green | 3+ / 3+ | 4 / 0 | 10 / 0 | 1 / 7 | 4 / 7 | green sets reach, never rolled |
| Life | blue / green | 3+ / 3+ | 1 / 0 | 0 / 11 | 1 / 0 | 1 / 8 | **blue near-dead** — `Surgical Precision` only |
| Order | blue / white | 3+ / 2+ | 2 / 0 | 4 / 4 | 6 / 2 | 5 / 3 | white thin |
| Power | black / red | 2+ / 2+ | 4 / 0 | 1 / 3 | 7 / 1 | 4 / 2 | red thin |
| Sovereignty | black / white | 3+ / 3+ | 6 / 0 | 0 / 1 | 3 / 2 | 3 / 3 | white thin |

**Exactly one gate colour is a toll booth: Fate's White.** Two more pay back through a single
talent (Destruction's Blue, Life's Blue), and five are *thin* — never rolled, and read by only two
or three talents (Civilization's Red, Death's Green, Order's White, Power's Red, Sovereignty's
White). Across all ten trees, 11 of the 20 gate colours are never rolled.

> ⚠️ **Correction.** An earlier draft of this section said five deity trees get *nothing* from a
> gate colour, and that *"four of the five dead colours are White. White is gated by four deity
> trees and mechanically rewarded by none of them."* That came from a script that read only the
> rolled skill and the talent's own damage formula. The cross-cut's problem ledger re-counted with
> the reach channel included, and `deity-gate-audit.js` now counts all three channels and agrees
> with it. Civilization's White sizes its Construct and Foundation dice, Knowledge's Green sets the
> reach of seven talents, and Order's White sizes four formulas. White is not the colour nobody
> rewards.

What survives is the guide's own worked example. Of Sovereignty it says *"Black tests for
diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule"*
— and Sovereignty rolls Black on three talents and White on none. Its White 3+ gate, a level-6
investment, buys `Sovereign's Favor`'s temp-HP die and two reach fields. **R-99.**

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
| **advantage** | 36 talents, 13 trees | 7 consume or deny it | **does not stack on one roll** — but only 9–19 of the 36 can reach an attack roll (`advantage-classify.js`) |
| **disadvantage** | *withdrawn* | — | the same binary scalar; the earlier regex count (14 / 0) was wrong in the same way as advantage's and is withdrawn — see R-98 for Blue's five |
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

> ⚠️ **Correction.** An earlier draft of this section read: *"the system's own lang file calls the
> SPD attribute "Speed". `@attr.spd` is both the natural reading and the in-family magnitude."*
> That was wrong, and the cross-cut's verification pass caught it. Every one of the eleven uses of
> "Speed" across all 365 talents means a movement rate in feet or a tested skill — decisively,
> Red's own `Unstoppable`, "move up to half your Speed" — and Speed is never a flat damage adder
> anywhere in the corpus (those are Awareness, Intellect, Strength, Willpower and Presence). The
> card and the engine mean the same thing; there is no wording to clarify.

So `Momentum's Edge` is two problems, not one: an **implementation** bug (the reference does not
resolve, so the talent probably does nothing today) and a separate **design** question (+25–30
flat on a free depth-2 Passive, if it did resolve). Rewording fixes neither. **R-95**'s recommended
default is to fix the resolution *and* retune the payload to `[Tier][Die]` — in family with
`Kindle` and `Predatory Patience`, scaling with tier and rank, and keeping the charge fantasy the
20-ft trigger already encodes.

`formula-audit.js` makes this class re-runnable; it is otherwise clean across all 365 talents.

### 2. Blue and Scholar do NOT do the same thing — but Blue's stated identity is in Agent

Read side by side, Blue and Scholar share **two** talents, both system-wide generic filler that
three to five other trees also carry. Everything else diverges: Blue is disadvantage, denial,
illusion and information; Scholar is crafting, medicine, skill-flexibility and advantage
redirection. **Verdict: DISTINCT.** The 0.794 function-vector similarity (rank 10 of 210 — nine
pairs are more similar, topped by Black↔Red at 0.911) is a *fantasy* adjacency: both are "the
clever one who doesn't hit things". That is worth fixing in the prose, not in the talents.

There is a second, weaker point worth stating with its caveat attached. The leyline design guide
gives Blue plot-die manipulation as its *"capstone identity"* — and Blue has **zero** plot-die
talents while heroic/Agent has six, including `Sure Outcome`, the exact face-editing effect the
guide's sentence describes.

> ⚠️ **But that line sits under a disclaimer, which this review initially missed and its own
> defence advocate caught.** `PART 4: COLOR IDENTITIES` opens with *"**Note:** Attunement/Physical/
> Cognitive have been replaced by Specialties. The descriptions below are reference, not law."* So
> the plot-die claim is a **design note that was never built**, not a broken promise — and Blue's
> player-facing path description never mentions the plot die at all. Report it as an unbuilt idea.
>
> The Sovereignty/Decree case is **not** weakened the same way, and the asymmetry is decisive: the
> deity guide's PART 4 carries no such disclaimer (it says "The 10 **confirmed** identities"), and
> Sovereignty's *player-facing* path description promises Decree twice, in the prose a player reads
> when choosing a god.

### 3. Two of Blue's disadvantage talents collide — not all five

Blue imposes disadvantage with five talents, the largest single-tree block in the game, and
disadvantage is one binary scalar boolean-OR'd by `edhaNextModFoldMode`. But the binary rule only
bites a second source **on the same roll**, and Blue's five mostly land on different rolls:
`Intercept` on a declared action, `Probability Cascade` across a creature's next *two* tests,
`Absolute Stillness` as a standing state on a creature at 0 Speed. **Only `Pattern Recognition`
and `False Premise` both write "their next test"** — so on one target in one round the second is
worthless, and a player who owns both pays two Investiture for one disadvantage.

> ⚠️ **Correction.** An earlier draft of this section was titled "Blue's core lever is binary, so
> five talents do one talent's work" and pointed at the summing `formula` channel as the fix. The
> cross-cut's problem ledger showed that over-applies the rule, and it carries a surviving
> objection to the summing channel: used by one adversary ability and no talent, and uncapped
> additive penalties are the biggest balance risk the review found. **R-98** is narrowed to the one
> real pair, with a default of re-aiming `False Premise`.

### 4. The real diagnosis: White has two talents in twenty-five it can spend an Action on

This arrived last, from the cross-cut pass, and it is the best number in the review. Counting only
talents that cost `1 Action`, `2 Actions` or `3 Actions` — the things a player *chooses to do on
their own turn* (`agency-census.js`):

| Tree | action-costing | of | % |
|---|---|---|---|
| **leyline/White** | **2** | 25 | **8%** — `Guiding Signal` (1A, L1) and `Ordered Advance` (2A, L4). That is the entire list. |
| heroic/Envoy, heroic/Scholar | 3 | 25 | 12% |
| leyline/Red, heroic/Agent | 4 | 25 | 16% |
| leyline/Blue | 5 | 25 | 20% — and three of the five are scene setup (`Phantom Double`, `Telepathic Network`, `Phantom Barricade`) |
| leyline/Black, Green | 6 | 25 | 24% |
| heroic/Hunter, Leader | 7 | 25 | 28% |
| heroic/Warrior | 13 | 25 | 52% |
| every deity tree | 5–8 | **9** | 56–89% |

By atlas: leyline **18%**, heroic **25%**, deity **72%**.

**This reframes the whole review.** What the two PCs experience is not "I deal zero damage" — a
Blue player who `Counterspell`s an enemy's talent has visibly done something, and a White player
whose `Shield Wall` shaves damage off every attack on two adjacent allies contributes every round.
What they experience is: *three Actions on a Slow turn, and a twenty-five-talent tree that offers
two things to spend them on.* "Damage" was standing in for four properties at once — an effect
that is **self-initiated, always legal, always resolves, and produces a visible number**. Damage is
the cheapest single purchase of all four; it is not the only one, and it brings a fifth thing
nobody asked for, which is White and Blue becoming damage trees.

All four independently-framed remediation passes — minimal-change, identity-first, systemic and
player-experience — reached this separately, and all four say **no** to damage for either tree.

Note the contrast with **deity/Sovereignty, which is 78% action-costing (7 of 9)**. Sovereignty
has no agency problem at all; its problem is that what those Actions buy is ±1 average damage.
Two different failures that a damage count cannot tell apart.

### 4b. Why White in particular is hostage

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

## Determinable defects — these need a fix, not a decision

Nothing here is a design question. Each is checkable, each is wrong, and none is in the rulings
because there is nothing for Ben to decide. **Not fixed in this pass** — this review changed no
talent data.

| # | Defect | Evidence |
|---|---|---|
| 1 | **Two live iron-rule-7 divergences in deity/Death.** `Raise Dead`'s card reads "Necrotic Cascade **or** Speak with the Fallen"; its `connections` are `[Necrotic Cascade, Risen Servant]`. A player who took Speak with the Fallen is refused by Foundry with no reason on the card; a player who took Risen Servant is allowed by a talent the card never names. `Necrotic Cascade` has the same shape (card: "Consuming Decay"; connections add `Death Ward`). | `data/domain.json`. This is exactly the prose-vs-`connections` case CLAUDE.md iron rule 7 flags as **ungated**. |
| 2 | **`Frightened` is required by two talents and produced by none.** deity/Power's `Kneel` and `Absolute Authority` both key on "Compelled, **Frightened**, or Weakened". Grep of all 365 returns three hits and no producer. Both clauses are permanently dead. | A player reads a condition on their own card and nothing in the game can cause it. |
| 3 | **`Interposing Shield` is missing a token.** It reads `reduce that damage by half [Die]` where both its siblings read `half [Tier][Die]` — `Devoted Conduit` and `Shield Wall`. So White's **costed Reaction** mitigates ~2.0 at Tier 2 while its **free Passives** mitigate ~4.5. Almost certainly an authoring slip. | One token, one talent. |
| 4 | **`Counterspell`'s cost field is misspelt** — `"2 Focus; 1 Investiure"` in `data/leyline.json`. Blue therefore reads as 15 Investiture-costing talents in every automated census when it is 16, and one of this review's own critics reproduced the miss. | Invisible at the table; permanently corrupts census runs. |
| 5 | **deity/Chaos's capstone is the only one of ten with no once-per-scene limiter.** Every other deity capstone carries one; `Unravel Everything` does not, so it is repeatable every turn the player can pay for it. | A nine-of-ten conformance break nobody had checked. |
| 6 | **The design guide states Black's Draw Mana radius at double the shipped value** — the guide says "no ally within 10 ft", three shipped talents in two trees say 5 ft. Stale doc; a hazard the next time anyone authors from it. | `DESIGN-GUIDE-CLAIMS.md` vs `data/leyline.json`. |
| 7 | **leyline/Black is 60% Passive** (15 of 25) against its own guide's "eliminate Passives above 35%", and 4% Special against a 25–30% target. The other four leyline trees complied with the same revision pass. The defence advocate conceded this one outright: *"no reading of the guide excuses it."* | `agency-census.js` / action-type census. |

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
2. **Leyline vs heroic at comparable points.** No, but not in the direction the first draft of this
   review claimed. On **availability** they are at parity: every tree in both atlases opens 68–80%
   of itself by level 5, and all eleven 25-talent trees wall at level 6. On **damage**, leyline is
   ahead early — Black's `Withering Ray` is 2d6 vital for one Action at **level 1**, while all
   three of heroic's big damage talents (`Devastating Blow`, `Wit's End`, `Fatal Thrust`) are
   gated behind an off-colour `Skill 3+`, i.e. **level 6**. Both sides spike at 6; after that
   heroic is flat for the rest of the tier and leyline keeps climbing with rank.
3. **Deity parity.** Not close. Sovereignty is last by a wide margin — no damage, no independent
   effect, and a signature resource that was never built. Life is low-damage but legitimate.
   Chaos, Order, Death, Destruction and Knowledge are strong. The two-colour gate is priced
   inconsistently, though less badly than the first draft of this review said: nine of ten trees
   never roll one of their gate colours, but counting what a colour sizes and how far it reaches,
   exactly one gate colour pays back nothing at all (Fate's White), two pay back through a single
   talent, and five are thin.
4. **Synergies.** Mostly absent by construction. Leyline and deity run on Investiture, heroic on
   Focus; eight resources are sealed single-tree loops; and the currency shared most widely —
   advantage, granted by 36 talents across 13 trees — does not stack on a single roll. That makes
   a few specific builds redundant (Green + Hunter; Order's own `Lawkeeper's Eye` against its
   `Final Decree`; an Order ally against a Power character's `Kneel`), rather than making every
   second advantage granter worthless. The deity two-colour gate, the system's only *designed*
   cross-path synergy, is a toll booth for one gate colour of twenty and weak for seven more.

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
