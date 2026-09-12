# Damage distribution across all 21 trees

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `damage-distribution`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

I have all 21 dossiers, both evidence streams, and the primer. Writing the analysis.

---

# DAMAGE DISTRIBUTION ACROSS THE 21 TREES

## 0. Method, and the units everything below is in

**The unit.** One `[Tier][Die]` = **1d6 (mean 3.5)** at Tier 1 rank 2 (levels 1–5) and **2d8 (mean 9.0)** at Tier 2 rank 3 (levels 6–10). I abbreviate it **TD**. The L6 step multiplies every leyline and deity damage expression by **2.57×** in one move — that number does a lot of work below.

**Two damage counts, deliberately kept apart.**
- **Sources** = talents that create damage that would not otherwise exist.
- **Amplifiers** = talents that add to damage some other action was already producing (Mighty, Kindle, Vital Diagnosis, Exalt).

A tree of five amplifiers deals nothing on its own. This distinction is the whole answer to the designer's key question, so I never merge them.

**Normalising actions.** Damage is expressed as **TD per Action of the caster's own turn**, using a 3-Action Slow turn. A 2-Action nova is halved. A Free Action or Special adds nothing to the denominator. A Reaction is scored *per round*, not per Action, and is charged against the hard 1-Reaction cap. A summon or a persistent zone that fires on its own initiative is scored as **TD/round at zero marginal Action cost**, which is a genuinely different and better kind of damage.

**Damage type.** Vital and Spirit ignore Deflect; Impact, Keen and Energy do not. I do not apply a blanket multiplier — I compute the actual delivery fraction in §5, because the premium is not constant: it is enormous at Tier 1 and modest at Tier 2. Deflect values I can name from talent text alone are +1 (Guardian Stance, Stonestance, Overgrowth), +2 (Siege Form, Dense Tissue, Apex Form, Bastion), stacking to 3 (Overgrowth), and Hunter's Sidestep references "armor with deflect of 2 or higher." I use **Deflect 2** as the worked example and flag it as an assumption I cannot check inside the scope fence.

**What I do not price.** Weapon dice, attack bonuses and adversary Deflect are out of scope. So for Warrior, Hunter, Power, Death and Knowledge — all of whose best lines are *riders on a weapon Strike* — I report the **tree-added** component only and say so each time. This systematically understates the weapon-based trees and I flag where it matters.

---

## 1. The master table

Sustainable = repeatable indefinitely given the tree's own resource generation and Draw Mana at Tier 2 (1 Action → 2 Investiture). "R" = tree-added TD produced per round using a full 3-Action Slow turn at Tier 2 rank 3, single target, sustainable.

| # | Tree | Sources | Amps | First damage (depth / level) | Best repeatable line, Tier 2 | TD/Action | R (TD/round) | Type | Repeatability |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **deity/Knowledge** | 4 | 3 | d0 / **L1** | Predatory Strike at Insight 5 = 5×2d8 = **45 vital** | **5.00** | **10.0** | Vital | **Unlimited** (Accumulate refunds the Investiture) |
| 2 | **leyline/Black** | 4 | 1 | d0 / **L1** | Withering Ray = 4d8 = **18 vital**, cost is HP not Investiture | **2.00** | **6.0–8.0** | Vital | **Unlimited** by resource; capped by own HP (~2/cast) |
| 3 | **deity/Death** | 5 | 0 | d0 / **L1** | Withering Touch 2d8+WIL; + 4 TD/round of installed sources | 1.0+WIL | **5.0–6.0** | Vital / Spirit / Keen | Throttled → unlimited after setup |
| 4 | **deity/Civilization** | 5 | 0 | d0 / **L1** | Construct + Tempered Edge + Arsenal = 2 attacks × 2 TD | **0 (free)** | **4.0** | Impact+Energy, **ignores Deflect** | Unlimited after ~4 Actions of setup |
| 5 | **deity/Destruction** | 6 | 2 | d0 / **L1** | 2 Charges placed + Free-Action detonation, no roll, no save | 1.0–2.0 | **2.0** single / **6.0** vs 3 | Energy (Keen on Pinpoint) | Unlimited; Draw Mana exactly funds 2 Charges/round |
| 6 | **deity/Power** | 4 | 2 | d0 / **L1** | Warlord's Advance + Fury(+4) + Mantle(+2 spirit) | 1.0 + ~6 flat | **3.3** | Impact + Spirit | Throttled (0 Investiture regen) |
| 7 | **leyline/Red** | 6 | 4 | d0 / **L1** | Searing Bolt + Kindle (+Red mod) | 1.0 + ~4 | **2.5–3.0** | Energy | Throttled to 2/3 uptime; Key costs your Reaction |
| 8 | **deity/Chaos** | 5 | 0 | d0 / **L1** | Entropy Strike ×2 + Void Sense refund | 1.00 | **2.6** | Spirit / Vital | Throttled |
| 9 | **deity/Fate** | 4* | 1 | d0 / **L1** | Inevitable Snare = 2 TD + AWA **when entered** | 2.0 (on trigger) | **0–3.0** | Keen | Throttled; *all 4 sources are one delivery object |
| 10 | **heroic/Warrior** | 3 | 4 | d1 / L2 | Wit's End = 4d6 = **14, ignores Deflect** (2 Actions) | 0.78 | **1.8** + full weapon | Untyped/bypass | Focus-throttled (~5 focus, no regen) |
| 11 | **heroic/Hunter** | 3 | 4 | d0 / **L1** | Deadly Trap @ Hunter's Edge: 2d8 + Afflicted[3+Survival] vital × 3 rounds | 0.5 + tick | **1.5** + full weapon | Keen + **Vital** tick | **Unlimited — zero resource cost** |
| 12 | **deity/Order** | 4 | 0 | d0 / L1 | Edict→Verdict: 1 TD+INT + splash, 3 Actions | 0.4 | **1.3** single / 3.3 vs 3 | **Spirit** | Throttled; damage is **enemy-opt-in** until Verdict |
| 13 | **leyline/White** | **1** | 0 | d1 / L2 | Retributive Guard = 2d8 spirit, **Reaction only** | n/a | **0.6** expected | Spirit | 1/round max, contested, 7 Reactions compete |
| 14 | **leyline/Green** | **1** | 2 | **d2 / L3** | Thorn Field = floor(2d8/2) keen on entry | 0 (free) | **0.47 per enemy in terrain** | Keen | Unlimited (terrain is free on every Draw Mana) |
| 15 | **deity/Life** | **1** | 3 | d1 / **L6** | Venom Glands (granted to an ally): Afflicted[half TD **vital**] | 0 own | **0 own**; +1.3 TD of *party* damage | Vital riders | — |
| 16 | **heroic/Agent** | **0 net** | 1 | d0 / L1 | Cheap Shot's formula is `@scalar.damage.unarmed` — **the baseline every character has** | 0.33 (Mighty) | **0.33** | — | — |
| 17 | **heroic/Envoy** | **0** | 1 | d1 / L2 | Mighty only (+1+tier) | 0.33 | **0.33** | — | — |
| 18 | **heroic/Leader** | **0** | 1 | d2 / L3 | Mighty only; Synchronized Assault buys *ally* Strikes | 0.33 | **0.33** | — | — |
| 19 | **deity/Sovereignty** | **0** | 2 | **never** | Capstone: ±2 die steps = **±2 mean per die**, one ally, one enemy | **0.00** | **0.00** | — | Once per scene |
| 20 | **leyline/Blue** | **0** | 0 | **never** | — | **0.00** | **0.00** | — | — |
| 21 | **heroic/Scholar** | **0** | 0 | **never** | — | **0.00** | **0.00** | — | — |

Two facts from a straight lexical scan of all 365 descriptions, which I ran as a third independent stream:

- **`leyline/Blue` and `heroic/Scholar` are the only two trees in which the word "damage" never appears in any talent description at all.** 0 of 25 each. Every other tree mentions it at least once. Blue and Scholar are not "low-damage"; they are lexically disjoint from the damage system.
- **`deity/Sovereignty` mentions "damage" in 7 of 9 talents — always inside the phrase "damage die size."** It is the highest damage-word density of any leyline or heroic tree and it delivers zero damage. Any keyword-based tooling will mis-rank it.

---

## 2. Tiers of damage-havers, with numeric boundaries

Boundaries stated on two orthogonal measures so neither can be gamed:

**PRIMARY — sources ≥ 4 AND R ≥ 3.0 TD/round.** Five trees:
`deity/Knowledge` (4, 10.0) · `leyline/Black` (4, 6.0) · `deity/Death` (5, 5.5) · `deity/Civilization` (5, 4.0) · `deity/Power` (4, 3.3).

**SECONDARY — sources ≥ 4 AND 1.0 ≤ R < 3.0.** Five trees:
`leyline/Red` (6, 2.8) · `deity/Chaos` (5, 2.6) · `deity/Destruction` (6, 2.0 single / 6.0 AoE — it is *primary* against 3+ targets and secondary against one) · `deity/Fate` (4, 0–3.0 depending entirely on enemy movement) · `deity/Order` (4, 1.3).

**INCIDENTAL — sources 1–3, 0 < R < 2.0.** Four trees:
`heroic/Warrior` (3, 1.8) · `heroic/Hunter` (3, 1.5) · `leyline/White` (1, 0.6) · `leyline/Green` (1, 0.47/enemy).
Warrior and Hunter sit here **only because their weapon damage is out of scope**. On tree-added dice alone they are incidental; in play they are the two heroic paths that actually kill things, because they are also the only two that grant multiple weapon expertises (Warrior 3, Hunter 2 — Agent, Envoy and Leader grant **zero**, Scholar grants one).

**ZERO SOURCE — six trees:**
`leyline/Blue`, `heroic/Scholar`, `deity/Sovereignty`, `heroic/Envoy`, `heroic/Leader`, and effectively `heroic/Agent`.
`deity/Life` is a seventh borderline case: its only true source is Venom Glands, an *ally's* mutation, at L6, depth 1.

**This is the first correction the designer's framing needs.** The premise was "two characters in paths with NO damage talents — White and Blue." The measurement says:
- **Six trees create no damage, not two.** Blue, Scholar, Sovereignty, Envoy, Leader, Agent-net.
- **White is not one of them.** White has exactly one source (Retributive Guard, depth 1, L2, 2d8 spirit) — it is the singleton floor of the damage-*having* group, not a member of the zero group.
- The two trees grouped in the premise are in **different categories**, and (see §8) for opposite reasons.

---

## 3. Per-talent normalisation: deity vs leyline vs heroic

Deity trees are 9 talents; leyline and heroic are 25. Per-tree totals are not comparable, so:

| Atlas | Trees | Talents | Damage formulas | Formulas per talent | Formulas per tree | Talents mentioning damage |
|---|---|---|---|---|---|---|
| **deity** | 10 | 90 | **30** | **33.3%** | 3.0 | 60 / 90 = **67%** |
| **leyline** | 5 | 125 | **8** | **6.4%** | 1.6 | 26 / 125 = 21% |
| **heroic** | 6 | 150 | **5** | **3.3%** | 0.83 | 18 / 150 = 12% |

**A deity talent is 5.2× more likely to carry a damage formula than a leyline talent and 10.1× more likely than a heroic one.** Per-talent damage density by tree (formulas ÷ talents):

Destruction 67% · Chaos 56% · Death 44% · Order 44% · Knowledge 33% · Fate 33% · Power 33% · Civilization 22% · **Life 0% · Sovereignty 0%** ‖ Red 16% · Black 12% · White 4% · **Green 0% · Blue 0%** ‖ Warrior 8% · Hunter 8% · Agent 4% · **Envoy 0% · Leader 0% · Scholar 0%**.

The design guide sanctions deity trees being stronger per talent ("Radiant-equivalent power lives in the Deity Domain trees"; "Deity power is Radiant-tier"). What it does *not* sanction is the size of the gap at the top: **Knowledge's 9 talents out-damage all 25 of Red's by roughly 3.5×**, which crosses the primer's own stated red line ("9 deity talents outclassing 25 leyline talents in TOTAL would be" a bug).

**Structural fact:** eight of the ten deity trees deal damage at **depth 0, level 1** — the two exceptions are Life and Sovereignty. That is the deity guide's Principle 1 ("fantasy on the first talent, from both entries") interacting with the fact that eight of the ten deity fantasies are damage-shaped. It also means **the deity atlas has no ramp**: a deity character is a damage dealer on the turn they take their first talent, whereas Green's first damage arrives at depth 2 / L3 and White's at depth 1 / L2.

---

## 4. Heroic damage does not scale; leyline and deity damage does — and the crossover is exactly L6

The heroic formulas are literally flat across the level range this review covers:

- `heroic/Warrior` **Devastating Blow**: `(2 + max(@tier - 2, 0))d8` → **2d8 (mean 9) at Tier 1 AND Tier 2.** First changes at Tier 3.
- `heroic/Warrior` **Wit's End**: `(4 + max((@tier - 2) * 2, 0))d6` → **4d6 (mean 14) at Tier 1 AND Tier 2.**
- `heroic/Hunter` **Deadly Trap**: `2d4` flat; upgraded by *talent purchase*, not tier — 2d4 → 2d6 (Experienced Trapper, d1/L2) → 2d8 (Hunter's Edge, d2/L3). Hunter is the only heroic tree that scales its damage at all, and it does so by spending talent slots.
- `heroic/Agent` **Cheap Shot**: `@scalar.damage.unarmed` — the unarmed damage every character already has. Adds zero dice.

Against `[Tier][Die]` going 3.5 → 9.0 at L6, this produces an exact crossover:

| | Devastating Blow (9) | Wit's End (14) | in [Tier][Die] units |
|---|---|---|---|
| **Tier 1 (L2–5)** | 9 dmg | 14 dmg | **2.57 TD** / **4.00 TD** |
| **Tier 2 (L6–10)** | 9 dmg | 14 dmg | **1.00 TD** / **1.56 TD** |

**Both heroic damage talents lose exactly 61% of their relative value at the level-6 step, and neither number on the card changes.** At level 2, Devastating Blow's flat 2d8 is the biggest single damage expression in the game — bigger than Withering Ray's 2d6 (7), bigger than Searing Bolt's 1d6 (3.5), bigger than Predatory Strike's opening 1d6. At level 6 it is worth exactly one [Tier][Die] and Knowledge's entry talent deals **five** of them per Action.

Direct answer to **designer question 2** on the damage axis: **heroic and leyline are not merely "similar in power at similar points" — heroic is AHEAD at levels 2–5 and loses decisively at 6.** Best tree-added damage per Action:

| Level | Best heroic | Best leyline | Best deity | Ratio deity : heroic |
|---|---|---|---|---|
| L1 | Deadly Trap 2d4 = 5 (2 Actions) | **Withering Ray 2d6 = 7 vital** | Predatory Strike 1d6 = 3.5 vital | 0.7 : 1 |
| L2 | **Devastating Blow 9** (4.5/Action) | Withering Ray 7 | Consuming Decay 3.5/round scene-long | ~1 : 1 |
| L3 | **Wit's End 14** (7.0/Action) | Withering Ray 7 | Knowledge @ Insight 4 = 14 | 2.0 : 1 per Action |
| L5 | Wit's End 14 (7.0/Action) | Withering Ray 7 | **Knowledge @ Insight 5 = 17.5/Action** | 2.5 : 1 |
| L6 | Wit's End 14 (7.0/Action) | **Withering Ray 18/Action** | **Knowledge @ Insight 5 = 45/Action** | **6.4 : 1** |

The heroic column is a flat line. The other two step by 2.57× at L6. That is the shape of the problem, and it is a formula-authoring choice (`max(@tier - 2, 0)`), not a design intent I can find stated anywhere in either guide.

---

## 5. The Deflect layer — at Tier 1, damage *type* matters more than damage *count*

Deflect subtracts a flat amount per damage instance. Against a representative Deflect 2:

| Expression | Tier 1 mean | delivered vs Deflect 2 | Tier 2 mean | delivered vs Deflect 2 |
|---|---|---|---|---|
| `[Tier][Die]` (1d6 → 2d8) | 3.5 | **1.5 (43%)** | 9.0 | 7.0 (78%) |
| `half [Tier][Die]` = floor(Xd/2) | **1.5** | **0.0 (0%)** | 4.25 | 2.25 (53%) |
| `2[Tier][Die]` | 7.0 | 5.0 (71%) | 18.0 | 16.0 (89%) |

**Consequence 1 — the "half [Tier][Die]" riders are dead at levels 1–5 unless they bypass Deflect.** Talents whose entire payload is a Deflect-able `half [Tier][Die]`:
`leyline/Red` **Arc Flash** (energy), **Volatile Strike** (impact, and it also costs a *test*), **Shockwave Slam** (impact), **Afterburn** (Afflicted[half TD energy]), **Chain Detonation** (energy) — **five of Red's ten damage talents** — and `leyline/Green` **Thorn Field** (keen). At Tier 1 rank 2 each delivers a mean of **0.0** against Deflect 2. Red is the tree the census ranks as the game's biggest prose damage tree (8 offensive sources), and half its offensive bench rounds to zero for the first five levels.
The one talent in this shape that *works* is `deity/Life` **Venom Glands** — `Afflicted [half [Tier][Die] Vital]`. Same expression, bypassing type, full delivery.

**Consequence 2 — the deflect-bypass premium is 2.33× at Tier 1 and 1.29× at Tier 2.** So the vital/spirit trees are not merely "a bit better"; at low levels they are in a different band. Ranking the L1 entries by *delivered* damage against Deflect 2:

| L1 entry | raw | type | delivered | per Action |
|---|---|---|---|---|
| `leyline/Black` **Withering Ray** | 2d6 = 7.0 | Vital | **5.0** | **5.0** |
| `deity/Knowledge` **Predatory Strike** | 1d6 = 3.5 | Vital | 3.5 | 3.5 |
| `deity/Chaos` **Entropy Strike** | 1d6 = 3.5 | Spirit | 3.5 | 3.5 |
| `deity/Death` **Withering Touch** | 1d6+WIL | Vital | 3.5+WIL | 3.5+WIL |
| `deity/Destruction` **Set Charge** | 1d6 = 3.5 | Energy | 1.5 | 1.5 (×N in 10 ft) |
| `deity/Power` **Warlord's Advance** | 1d6 = 3.5 | Impact | 1.5 | 1.5 |
| `leyline/Red` **Searing Bolt** | 1d6 = 3.5 | Energy | **1.5** | **1.5** |
| `heroic/Hunter` **Deadly Trap** | 2d4 = 5.0 | Keen + Afflicted[3+Surv] **Vital** | 3.0 + 4/rd | 1.5 + tick |

**At level 1, `leyline/Black`'s depth-0 entry delivers 3.3× what `leyline/Red`'s depth-0 entry delivers, and Black pays HP (~1.5) while Red pays Investiture (which costs an extra Action to replace).** Red's own Attunement Key additionally *costs the player their Reaction* on every Draw Mana. Black is the strongest damage tree in the game at levels 1–5 and it is not close.

---

## 6. The Investiture throttle — the real per-Action rate for leyline and deity

Draw Mana converts **1 Action → Tier Investiture** (1 at Tier 1, 2 at Tier 2). For a tree with no bonus regen, a 1-Investiture attack therefore really costs **2 Actions at Tier 1** and **1.5 Actions at Tier 2**.

**The single most important number in this analysis:** a levels-1–5 leyline damage character with no Investiture regen sustains **1d6 every two Actions = 1.75 raw damage per Action**, which against Deflect 2 delivers **0.75/Action** if the type is Energy/Impact/Keen. That is the baseline the whole low-level game sits on.

Only four trees escape it, and they escape it in four different ways:

1. **`leyline/Black`** — Withering Ray's cost is **HP, not Investiture**. No Draw Mana tax at all. 2 TD vital per Action, every Action, from level 1. Throttled instead by ~1.5 HP/cast at Tier 1 against a ~12 HP body (≈2 full turns of maximum output), then by Sanguine Reservoir (banks that HP *as Investiture*, cap = Black ranks) and Predator's Due (regain `[Tier][Die]` HP + 1 Investiture per kill, L6).
2. **`deity/Knowledge`** — Accumulate refunds 1 Investiture per round when the marked creature takes damage *from any source*, including allies' attacks. Predatory Strike costs 1. **Knowledge is the only tree in the game whose peak damage line is Investiture-neutral.**
3. **`heroic/Hunter`** — Deadly Trap costs **nothing**. No focus, no Investiture, no once-per-scene. Placed for 2 Actions, upgraded twice by talent purchase to 2d8 + `Afflicted[3 + Survival ranks]` **vital** for 3 rounds. At Survival 3 that is 9 + (6 × 3) = **27 damage, 18 of it Deflect-ignoring, for 2 Actions and zero resource, at level 3.** It is the largest free damage package in the heroic atlas and the census under-counts it (see §9).
4. **`deity/Civilization` and `deity/Death`** — front-load Investiture into *installs* that then fire on their own initiative. Civilization's Construct with Tempered Edge + Arsenal throws **2 attacks × 2 TD = 36 damage per round at Tier 2 for zero Actions**, and Tempered Edge's added `[Tier][Die]` energy explicitly **ignores deflect**. Death's steady state after setup is ~4 TD/round free (two Risen Servants + Consuming Decay + Bone Garden) while its own 3 Actions stay available.

**Everything else is rate-limited to roughly one talent per 1.5–2 Actions**, and that — not the size of the dice — is why the mid-table trees feel similar to each other.

---

## 7. Exactly how far out Blue and White sit

**Blue.** Zero. Not "low." The word "damage" appears in 0 of 25 descriptions, there are 0 damage formulas, and the regex source-scan returns 0 rows. Three independent streams agree. Its nearest damage-adjacent talent is **Phantom Barricade** (depth 1, L2) — a barrier object with `2[Die]` *health* that blocks movement; it deals nothing. There is no talent in Blue that could be argued into the damage column even generously.

**White.** One. **Retributive Guard**, depth 1, earliest L2, `(@tier)d(2*@skills.white.rank+2)` **spirit**. Its per-use efficiency is actually normal — 2d8 = 9 spirit for 1 Investiture is exactly as Investiture-efficient as Red's Searing Bolt (9 energy for 1 Investiture) and *better* after Deflect. Its problem is the delivery conditions, all four of which must hold:
1. an ally must be **adjacent to you** (not merely in Attunement Range),
2. that ally must take damage,
3. the attacker must be within Attunement Range,
4. you must win a contested White vs. Spiritual test,
5. and you must spend the round's **one Reaction** — in a tree that carries **seven** Reaction talents (28% of the tree, the highest in the game; Interposing Shield, Retributive Guard, Shared Burden, Shared Conviction, Counterpoint, Voice of Authority, Pillar of Order all compete for the same slot).

So White's damage ceiling is **1 TD per round, expected ~0.6**, and every round you use it is a round you did not use Interposing Shield or Unbreakable Line.

**Outlier or continuum?** Both, and the distinction matters.

Ordered by source count: `6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0`.

That is a **smooth continuum from 6 down to 1, then a hard floor of six trees at exactly zero.** Blue is not the low end of a slope — it is one of six trees sitting on a floor, and the floor is a cliff, not a gradient. White (1) and Green (1) and Life (1) are the three trees on the last step above the cliff.

Ordered by R (TD/round): `10.0, 6.0, 5.5, 4.0, 3.3, 2.8, 2.6, 2.0, 2.0, 1.8, 1.5, 1.3, | 0.6, 0.47, 0.33, 0.33, 0.33, 0.0, 0.0, 0.0, 0.0`.

The largest proportional gap in the whole distribution is **Order (1.3) → White (0.6), a 2.2× step**, and the second largest is **Knowledge (10.0) → Black (6.0)**. So the ecosystem has **two** outliers, not one: Knowledge at the top and the zero-block at the bottom. The middle twelve trees span 1.3–6.0 and are a genuinely smooth ramp.

**And Green belongs in this conversation.** `leyline/Green` has exactly **one** damage source (Thorn Field), it arrives at **depth 2 / L3**, and it delivers `half [Tier][Die]` **keen** — mean 1.5 at Tier 1, **0 after Deflect 2**. A Green character deals **literally no damage at levels 1 and 2, and effectively no damage through level 5**, and cannot damage a target of their choosing at any level — the enemy must stand in the terrain. Green is a third near-zero tree that the premise did not name.

---

## 8. Is "no damage" PAID FOR, or is it a hole?

This is the load-bearing question, so here is an explicit budget rather than an impression. For each zero/near-zero tree I count what it actually buys, in the same countable terms, and give one measurable headline number.

### The structural budget data (all counted from the data, not judged)

| Tree | n | shared-stock talents | gated at L6+ | need another character | Reactions | always-on Passives |
|---|---|---|---|---|---|---|
| `leyline/Blue` | 25 | **3** | **7 (28%)** | 4 | **5** | 9 |
| `leyline/White` | 25 | 1 | 4 | **22 (88%)** | **7** | **10** |
| `heroic/Scholar` | 25 | 1 | 0 | 4 | 1 | **10** |
| `heroic/Envoy` | 25 | **6 (24%)** | 0 | 7 | 2 | **10** |
| `heroic/Leader` | 25 | 5 | 0 | 6 | 1 | 8 |
| `deity/Sovereignty` | 9 | 0 | **2 (22%)** | **7 (78%)** | 0 | 2 |
| `deity/Life` | 9 | 0 | 2 | 1 | 0 | 1 |

### `leyline/White` — **PAID FOR.** Yes, decisively.

White buys the best protection package in the game and it buys it in the cheapest possible action currency: **10 always-on Passives, of which the defensive ones cost no action and no resource, permanently.**

- **Shield Wall** (depth 3, L4, Passive, free): "*When two or more allies are adjacent to you, attacks against them deal half [Tier][Die] less damage.*" At Tier 2, `floor(2d8/2)` = **4.25 damage removed from every attack against every adjacent ally, forever, for zero Actions.** Assuming 4 incoming attacks per round against those allies (an assumption I cannot check inside the fence), that is **~17 damage/round prevented, free.** For comparison, Black's entire 3-Action Withering Ray turn *deals* 54. White prevents roughly a third of a top-tier damage turn every round while spending nothing.
- **Guardian Stance** (depth 0, L1, Passive, free): +1 Deflect to you and an adjacent ally, permanently, from level 1.
- **Devoted Conduit** (depth 2, Passive, free): reduce redirected damage by half `[Tier][Die]`.
- **The White Attunement Key** is the only Draw Mana rider that pays the party: allies in range regain **Tier HP every Draw Mana**. With three allies at Tier 2 and one Draw Mana per round that is **6 HP/round of free party healing, forever**, on an action White was spending anyway.
- **Unbreakable Line** (L6): the only reactive death-denial for someone else.

White's non-damage budget is not merely present, it is **larger per Action than most trees' damage budgets**. The trade is real.

The one honest caveat: **White's purchased budget exceeds its deliverable budget.** Seven Reaction talents against a hard cap of one Reaction per round means White can only ever cash one of its seven trigger-gated effects per round — and 22 of its 25 talents require a second body present. White is paid for *in a party*; a White character in a solo scene has almost nothing.

### `leyline/Blue` — **NOT PAID FOR.** This is a hole.

Blue's 25 talents do not buy a larger budget elsewhere. They buy one of the smallest budgets in the game, for four compounding reasons:

1. **Five of Blue's talents collapse into one binary effect.** Pattern Recognition, Intercept, False Premise, Probability Cascade and Absolute Stillness all impose disadvantage. Per the primer, `AdvantageMode` is a tri-state that boolean-ORs — a second disadvantage on the same roll is worth **literally zero**. Only **Probability Cascade** escapes (disadvantage on the next *two* tests), and it costs an Opportunity that Blue **cannot generate** (Blue is a pure Opportunity consumer, 0 producers). So Blue's signature axis, on which it fields the largest talent block in the game, delivers approximately **one talent's worth of effect**.
2. **Four more are an illusion subsystem with no combat numbers.** Phantom Double, Phantom Barricade, Holographic Illusion, Living Image. Phantom Barricade is the only one with a stat (`2[Die]` health). Nothing in the subsystem deals, prevents, or heals a defined quantity.
3. **Three are shared stat-sticks** — Composed (+focus, also in Black and Envoy), Collected (+2 defenses, also in Green, Agent, Envoy, Scholar), Probable Outcome.
4. **Blue's three genuine teeth are all L6.** Counterspell (Blue 3+), Ghostly Walls (Blue 3+), Absolute Stillness (Blue 3+). Blue has **7 talents gated at L6+, 28% of the tree — the highest proportion in the game.**

And what Blue does *not* have: **0 healing, 0 protection** (no damage reduction, no temp HP, no resistance, no interception — the barricade is an object, not mitigation), **0 resource generation**, 0 self-mobility, 0 damage.

**A Blue character at levels 1–5 has: no damage, no healing, no mitigation, no resource generation, one unit of disadvantage, and illusions.** That is not a trade. Blue's identity was purchased on credit and the payment is due at level 6.

Two further findings sharpen this. The leyline design guide states verbatim: *"Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression."* **Blue has zero plot-die talents.** `heroic/Agent` has six, including Opportunist (the atlas's only plot-die reroll) and Sure Outcome (converting any Complication to an Opportunity) — the exact effect the guide reserves for Blue. And `leyline/White` fields four more (Guiding Signal, Concordant Presence, Unity of Purpose, Pillar of Order). **The mechanic the guide names as Blue's capstone identity is implemented entirely in two other trees.**

### `deity/Sovereignty` — **NOT PAID FOR.** The clearest case in the corpus.

Sovereignty has 0 damage, 0 heal, 0 zone, 0 summon, 0 mobility, 0 information, 0 social, 0 exploration, 0 Reactions. Its whole budget is die-step manipulation. Quantify it:

**One die step is worth exactly +1 mean damage per die** (d4→d6 = 2.5→3.5; d6→d8 = 3.5→4.5). So:

- **Exalt** (depth 0, L1, 1 Action + 1 Investiture): +1 step on one ally's damage die **until the start of your next turn**. On a 1-die weapon that is **+1 damage, for one round, for a full Action and an Investiture.**
- **Sovereignty** (the capstone — 3 Actions, 3 Investiture, once per scene, L4): +2 steps to one ally and −2 to one enemy, for the scene. On a 2-die weapon that is **+4 per ally attack and −4 per enemy attack.**

Now the comparison that settles it. `deity/Life`'s **Vital Diagnosis** — depth 0, **level 1**, **1 Action + 1 Investiture** — gives "*you and every ally dealing damage to the Diagnosed creature deal additional Vital damage equal to your Tier*," for the scene. At Tier 2 that is **+2 per damage instance, party-wide, Deflect-ignoring, from a level-1 entry talent for one Action.**

**Sovereignty's 3-Action once-per-scene capstone buys a smaller, later, Deflect-able, single-ally version of what Life's level-1 entry buys the whole party for one Action.** Sovereignty is better only in the narrow case of one ally rolling many damage dice; Life is better across a party, arrives five levels earlier, and bypasses Deflect.

The debuff half fares no better. **Censure** (1 Action, 1 Investiture, contested test, one enemy, one round) reduces incoming damage by ~1–2. **`leyline/White`'s Shield Wall** (0 Actions, 0 cost, permanent, multi-ally) reduces it by **4.25 per attack**. Sovereignty's mitigation is outclassed **by a leyline tree** — from the atlas the guides explicitly designate as the *weaker*, mortal-scale one.

And the tree does not deliver its own stated signature. Both intent sources promise **Decree** — "a declared law projected within a radius: allies inside are elevated, enemies inside are diminished," with the loop "diminish target → elevate ally → bring them into Decree." **No Sovereignty talent creates a zone, a radius, or an aura. All nine are single-target.** The word appears only in the title "Decree of Ruin." Meanwhile the deity guide says of this exact tree: *"Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule."* The gate audit shows **Sovereignty tests Black three times and White zero times, while demanding White 3+ — a level-6, six-skill-rank investment that buys nothing but the gate.**

Sovereignty is the one tree in the 21 where I would say the budget is not merely unpaid but close to absent.

### `heroic/Scholar` — **PARTIALLY PAID FOR.**

Scholar buys two things nothing else in the game has:

- **The best per-Action healing in the game.** Field Medicine (depth 0, L1, 1 Action + 1 focus) heals recovery die + Medicine ranks. **Swift Healer** (depth 1, **L2**) makes it a **Free Action** and adds Medicine ranks again; **Applied Medicine** (depth 2, L3) adds Lore ranks. At Medicine 3 / Lore 3 with a d6 recovery die that is **~9.5 HP for a Free Action and 1 focus** — the Scholar heals *and still takes a full 3-Action turn*. Green's Verdant Mend heals more per use (2d8 + Green mod ≈ 14 at Tier 2) but costs a full Action and an Investiture. Nothing else in the game heals for free.
- **The only crafting economy.** "fabrial" appears in exactly 5 of 365 talents, all Scholar's. Erudition is the only reassignable skill-rank pool in the corpus.

Against that: **10 of 25 talents (40%) do nothing once initiative is rolled**, and only 1 of Scholar's 25 is shared stock — so unlike Envoy, its slots are its own. In a combat-heavy campaign Scholar is effectively a **15-talent tree competing against 25-talent trees**; in an exploration- or downtime-heavy one it is the richest tree in the game. **Scholar's answer is campaign-dependent, and it is the only tree of which that is true.**

One structural weakness worth naming: **the recovery die is the patient's resource and Scholar cannot replenish it**, so Scholar's total healing per rest is capped by the *party's* recovery dice, not by Scholar's own talents. Its per-Action rate is best-in-class; its per-day ceiling is not under its control.

### `heroic/Envoy` — **PAID FOR**, and under-measured by the census.

Envoy has 0 damage sources and buys, in exchange:
- **Practical Demonstration** (depth 0, L1, **Free Action, no cost**) turns Rousing Presence into a free rider on any Gain Advantage or attack hit. Combined with Lessons in Patience (target recovers 1 focus) and Applied Motivation (+half Lore ranks), Envoy runs an **infinite, zero-resource party focus battery** — four of the corpus's eight focus-restoring talents are Envoy's, and focus is the currency five of six heroic paths run on (Agent 12 costers, Leader 11, Envoy 8, Scholar 7, Warrior 7).
- **Foresight** (depth 3, L4, Passive): "*Gain an additional reaction each turn*" — the **only unconditional extra Reaction in the game**, and in a system with a hard 1-Reaction cap that is a very large effect.
- **Peaceful Solution**: the only talent in 365 that ends a combat without violence.

The one real cost: **6 of Envoy's 25 talents are shared stock** (Collected, Composed, Customary Garb, Well Dressed, High Society Contacts, Mighty) — tied with Agent for the most in the game — so Envoy's *distinctive* budget is 19 talents, not 25.

### `heroic/Leader` — **PAID FOR.**

- **The command die** is the only granted, upsizable bonus die in all 21 trees; three talents grow it d4→d6→d8→d10, and it is the only granted bonus in the corpus that gets bigger as you buy more talents.
- **Authority** (depth 3, L4, Passive): doubles both the range and the target count of every ally-facing Leader talent — the only such multiplier in the game.
- **12 of 25 talents touch influence/persuasion/deception/command** against the next tree's 4. Leader owns social influence outright.

Leader's zero damage is a genuine specialisation, not a gap. Its exposure is the same as Envoy's: it grants **zero weapon expertises**, so a Leader with no second path contributes +3 (Mighty) and a command die and nothing else to a fight's damage total.

### Summary of the budget test

| Tree | Damage sources | Non-damage budget | Verdict |
|---|---|---|---|
| `leyline/White` | 1 | Best-in-game protection: free permanent multi-ally mitigation worth ~17 dmg/round prevented, plus the only party-healing Attunement Key | **PAID** |
| `deity/Life` | 1 (ally-granted, L6) | Largest heals in the game (Surgical Precision `(2*@tier)d8` = 4d8 = 18, +9 with Prognosis, for 1 Action), condition removal, mutations, party-wide +Tier vital at L1 | **PAID** |
| `heroic/Envoy` | 0 | The party focus/Opportunity battery, the only unconditional extra Reaction, the only non-violent combat ender | **PAID** |
| `heroic/Leader` | 0 | The command die, Authority's doubling, 12 social talents | **PAID** |
| `heroic/Scholar` | 0 | Only free-Action healing; only crafting economy — but 40% of the tree is combat-inert | **PARTIAL — campaign-dependent** |
| `leyline/Blue` | 0 | 5 talents collapsing to 1 binary effect, 4 numberless illusions, 3 shared stat-sticks, 28% gated at L6, zero heal/protect/regen | **NOT PAID — a hole** |
| `deity/Sovereignty` | 0 | ±1–2 mean damage per die on one ally and one enemy; its promised Decree zone does not exist; its White 3+ gate buys nothing | **NOT PAID — a hole** |

**The clean form of the answer:** in each of the two magical atlases, one zero-damage tree pays for it and one does not. **White pays, Blue does not. Life pays, Sovereignty does not.** The designer's instinct that something is wrong is correct, but it is pointed at the wrong pair — the real pair is **Blue and Sovereignty**, and White is one of the trees demonstrating that the trade *can* work.

---

## 9. Where the deterministic census disagrees with the talent text — the third bug, found

The brief predicted a third classifier bug. There is one, and it has a single clean signature.

**Four talents phrase their damage with the verb "roll" rather than "deal"/"take", and the prose classifier misses all four:**

| Talent | Tree | depth / L | phrasing |
|---|---|---|---|
| **Searing Bolt** | `leyline/Red` | d0 / **L1** | "…**rolling** [Tier][Die] energy damage on a success" |
| **Devastating Blow** | `heroic/Warrior` | d1 / L2 | "…**rolling** an extra 2d8 damage" |
| **Deadly Trap** | `heroic/Hunter` | d0 / **L1** | "…**roll** 2d4 impact damage" |
| **Sovereign of Solitude** | `leyline/Black` | d5 / L6 | "…**rolling** [Tier][Die] vital damage on a success" |

This one rule explains every earliest-level disagreement in the census table:

- **`leyline/Red` earliestL is reported as 2. It is 1.** Excluding Searing Bolt leaves Flame Surge and Arc Flash at L2 — exactly the reported value. Red's first damage talent is a **depth-0, level-1** ranged attack with an authored Foundry damage formula.
- **`heroic/Warrior` is reported as "0 SOURCE"** — because its one non-weapon-conditional damage adder is roll-phrased.
- **`heroic/Hunter` earliestL 1 is right, but its SOURCE count of 1 under-counts Deadly Trap**, which is (as computed in §6) the largest free damage package in the heroic atlas.
- **`leyline/Black` shows 3 SOURCE**, missing Sovereign of Solitude, which is why Black looks like a smaller damage tree than it is.

**Two more disagreements to record, both where the *formula* stream misleads and the prose classifier is right:**

- **`heroic/Agent` Cheap Shot** carries a damage formula (`@scalar.damage.unarmed`) but adds **zero dice** — it is literally the unarmed damage every character already has, per the primer's standard-actions list. The census correctly scores Agent at 0 SOURCE; the formula count of 1 should not be read as damage capability.
- **`deity/Life`** is reported with earliestL 1 on the strength of Vital Diagnosis, which is a pure *amplifier*. Life's earliest true damage source is **Venom Glands (Adaptive Mutation, depth 1, L6, Green 3+)**, and it is granted to somebody else.

**A third data-quality finding, independent of classifiers — the tier-cap dead zone.** Several deity talents are gated on "up to your **tier**" of a resource, and at Tier 1 (levels 1–5) tier = 1, which makes them inoperable or degenerate:

- `deity/Chaos` **Spreading Omen** (depth 1, L2) places an Omen on the target "*and one additional enemy within 10 ft, subject to your Omen cap*." Cap = tier = **1** through level 5. The talent's entire distinguishing clause **cannot fire before level 6.**
- `deity/Chaos` **Cascade Collapse** (depth 2, L3, 2 Actions, 2 Investiture) removes *all* Omens for `[Tier][Die]` each. At cap 1 it hits **one** enemy for 1d6 — strictly worse than Entropy Strike, which does the same damage for **1** Action and **1** Investiture and *places* an Omen instead of consuming it.
- `deity/Destruction` **Cascading Failure** (depth 2, L3) pays 2 Actions + 2 Investiture for a clause that begins "*When two or more Charges detonate this way…*". Set Charge caps active Charges at tier = **1**. The payload **cannot fire before level 6.**
- `deity/Chaos` **Unravel Everything** (the 3-Action capstone) at Tier 2 detonates at most 2 Omens = 2 TD + 2×AWA over 3 Actions = **0.67 TD/Action** — **less per Action than the depth-0, level-1 entry it is built on.** The capstone is dominated by the entry, and the cause is the Omen cap.
- Same cap shape halves `deity/Death` (Remains and Risen Servants both = tier) and `deity/Fate` (unsprung Snares = tier) for the first five levels.

**Finally, `leyline/Red` Momentum's Edge** — the profile's flag stands and it is the single largest unresolved number in the damage picture. "*bonus impact damage equal to your Speed*" references `@movement.walk.rate`, a DerivedValueField **object**. If it resolves to nothing, Red's ceiling is ~2.8 TD/round. If it resolves to a Speed of 25–30, it adds **25–30 flat impact to a single Strike** — roughly **3 TD at Tier 2 and 8 TD at Tier 1** — against 1–4 for every other damage rider in the game, and it is a free depth-2 Passive available at L3. **Red is either the 7th-ranked damage tree or, at levels 1–5, the 1st, and nothing in the data distinguishes those two worlds.** This is checkable in one bench run and should be.

---

## 10. What I could not settle inside the scope fence

- **Whether any of these numbers is "a lot"** depends on adversary HP and Deflect, which the fence excludes. Everything above is *relative*. Settled by: reading three representative adversary blocks at CR-equivalents for L1, L5 and L8 and dividing.
- **Warrior's and Hunter's true damage** is dominated by weapon dice and attack bonus, both out of scope. Their placement in "Incidental" is a floor, not a verdict. Settled by: adding the base weapon table to the analysis fence.
- **Whether Momentum's Edge delivers** — §9. Settled by: one bench roll of a Red character's Strike after a 20-ft move.
- **Dangerous terrain's base damage is undefined in the corpus.** `deity/Destruction`'s The Unmooring says the merged zone's damage "*increases to [Tier][Die]*", implying a smaller default that no talent in the 365 states. That number silently sets the value of Pyre, Set Charge, Walking Ruin, Combustion Chain, Fault Line — most of Destruction's persistent output. Settled by: finding or authoring the dangerous-terrain baseline.
- **Whether advantage stacking is played as implemented.** The primer is unambiguous about the engine (boolean-OR, tri-state), and my Blue analysis in §8 rests on it. If the table houserules stacking advantage, Blue's five-disadvantage block becomes five units of effect instead of one and the "Blue is a hole" verdict weakens considerably. This is the single assumption most likely to overturn a conclusion here.

## Adversarial verification

**26 load-bearing claims checked: 8 confirmed, 15 corrected, 3 refuted.**

The analysis's descriptive statistics are almost entirely sound — I re-derived all 43 damage formulas, all per-atlas densities (deity 30/90, leyline 8/125, heroic 5/150; 5.2x and 10.1x), the damage-word counts (60/26/18), Blue and Scholar's zero-mention status, Sovereignty's 7/9 "damage die size" mentions, all shared-stock counts, White's 7 Reactions, and the Blue L6 gate count, and every one checked out verbatim. But its two central ARGUMENTS both fail on the same missed fact. The dossier's earliestLevel only applies the rank-3 gate to COLOUR prerequisites; the primer's rank cap (2 through L5, 3 from L6) applies to EVERY skill. 42 talents carry a non-colour "3+" prerequisite and are mis-dated. Two of them are Devastating Blow (Athletics 3+) and Wit's End (Intimidation 3+) — the entire heroic column of §4's crossover table. Both are level 6 talents, not L2/L3. §4's headline ("heroic is AHEAD at levels 2-5 and loses decisively at 6") is therefore refuted and inverted: heroic's only two real damage talents arrive at exactly the level leyline/deity step to 2d8, so leyline leads at every level. The same root cause makes §8's "gated at L6+" column read 0 for all six heroic trees when the true figures are 20-28%. Separately, the analysis mis-scores Mighty (its text reads "for each action spent", so Envoy/Leader/Agent's R is ~1.0 TD/round, not 0.33 — above White and Green, not below), applies Deflect 2 to Withering Ray's VITAL damage in §5 (understating its own Black-vs-Red point, 3.3x should be ~4.2x), and proves "Sovereignty is not paid for" with two broken comparisons — it compares Sovereignty's capstone to Vital Diagnosis without noticing the capstone is larger at any party size, and compares Sovereignty's WEAKEST debuff (Censure) to White's BEST mitigation (Shield Wall) while ignoring Edict of the Fallen, a scene-long -2 die steps at depth 2. The Sovereignty verdict survives on structural grounds (no zone, no Decree, White 3+ toll booth, 0 Reactions), not on the arithmetic offered. The Blue verdict is over-argued: the primer's rule is that a second advantage ON THE SAME ROLL is worth zero; Blue's five disadvantage talents fire on five different rolls at different times, so "collapse into one talent's worth of effect" over-applies the primer.

### Claims

1. **CONFIRMED** — leyline/Blue and heroic/Scholar are the only two trees in which the word "damage" never appears in any talent description at all. 0 of 25 each. Every other tree mentions it at least once.
   - Evidence: Scanned description + authoredDescription + authoredBody + flavor across all 365. Blue 0 hits, Scholar 0 hits. Next-lowest are heroic/Envoy 1 and heroic/Leader 1. Independently, both trees have 0 damage formulas and 0 damage-source census rows — three streams agree.
2. **CONFIRMED** — deity/Sovereignty mentions "damage" in 7 of 9 talents — always inside the phrase "damage die size."
   - Evidence: 7 of 9 (Exalt, Censure, Investiture of Authority, Decree of Ruin, Sovereign's Balance, Edict of the Fallen, Sovereignty); the two silent ones are Sovereign's Favor and Expose. Every one of the 7 is the phrase "damage die size" (Edict of the Fallen: "damage die size for attacks decreases by two steps"). Zero damage formulas.
3. **CONFIRMED** — deity 30 damage formulas / 90 talents (33.3%), leyline 8/125 (6.4%), heroic 5/150 (3.3%); a deity talent is 5.2x more likely to carry a formula than a leyline talent and 10.1x more than a heroic one. Per-tree densities Destruction 67% ... Agent 4%.
   - Evidence: Recounted isDamageFormula per tree: Chaos 5, Order 4, Civ 2, Death 4, Destruction 6, Fate 3, Power 3, Life 0, Knowledge 3, Sovereignty 0 = 30. White 1, Blue 0, Black 3, Red 4, Green 0 = 8. Agent 1, Envoy 0, Hunter 2, Leader 0, Scholar 0, Warrior 2 = 5. Total 43, matching the brief. 33.3/6.4 = 5.2; 33.3/3.3 = 10.1. Every per-tree percentage in §3 recomputes exactly.
4. **CONFIRMED** — Talents mentioning damage: deity 60/90 (67%), leyline 26/125 (21%), heroic 18/150 (12%).
   - Evidence: Description-field scan: deity 6+6+5+5+6+4+7+6+8+7 = 60; leyline 6+0+5+12+3 = 26; heroic 2+1+8+1+0+6 = 18.
5. **CONFIRMED** — Heroic damage formulas are literally flat across tiers 1 and 2: Devastating Blow (2 + max(@tier - 2, 0))d8 = 2d8 at both; Wit's End (4 + max((@tier - 2) * 2, 0))d6 = 4d6 at both; Deadly Trap 2d4 flat, upgraded by talent purchase not tier; Cheap Shot @scalar.damage.unarmed adds zero dice.
   - Evidence: All four formulas verbatim from all-talents.json. max(@tier-2,0) is 0 at both Tier 1 and Tier 2. Cheap Shot's formula is literally @scalar.damage.unarmed, the baseline every character has.
6. **REFUTED** — Devastating Blow is available at level 2, Wit's End at level 3, and Hunter's Edge (Deadly Trap -> 2d8/3 rounds) at level 3.
   - Evidence: Devastating Blow prereq = "Combat Training; Athletics 3+". Wit's End prereq = "Feinting Strike; Intimidation 3+". Hunter's Edge prereq = "Experienced Trapper; Survival 3+". SYSTEM-PRIMER.md: "Tier 1 = levels 1-5, max skill rank 2; Tier 2 = levels 6-10, max skill rank 3." The cap is on ALL skills, not just colours. The dossier's earliestLevel applies the rank gate only to colour prerequisites (the brief says so explicitly), so all three are mis-dated. 42 talents across the corpus carry a non-colour 3+ prereq with earliestLevel < 6.
   - Corrected: Devastating Blow, Wit's End and Hunter's Edge are all level 6 talents. Heroic/Warrior has NO tree-added damage talent before level 6 — its entire pre-L6 damage contribution is Mighty (+1+tier per action spent). The only heroic tree-added damage that exists at levels 1-5 is Hunter's Deadly Trap (2d4 -> 2d6 via Experienced Trapper, Perception 2+, legal at L2) plus Mighty in six trees.
7. **REFUTED** — Heroic and leyline are not merely similar in power at similar points — heroic is AHEAD at levels 2-5 and loses decisively at 6. Best heroic per Action: L2 Devastating Blow 4.5/Action, L3-L5 Wit's End 7.0/Action, against leyline's Withering Ray 7 total.
   - Evidence: The entire heroic column of §4's crossover table is built on two talents that do not exist before L6 (see previous claim). Correcting them empties the L2, L3 and L5 rows. At L1-5 the best heroic tree-added damage is Deadly Trap: 2 Actions, no resource, 2d6 keen (7) + Afflicted[3 + Survival 2 = 5] vital for 2 rounds = ~17 total, once per trap, and it must be entered. Leyline/Black's Withering Ray is 2d6 = 7 VITAL per Action for ~1.5 HP, i.e. ~21 vital per round with no Investiture cost at all.
   - Corrected: Leyline damage leads heroic at EVERY level in the L1-10 band, and the gap widens at L6 rather than opening there. Heroic's two real damage talents (Devastating Blow 2d8, Wit's End 4d6) arrive at exactly the level where [Tier][Die] steps 1d6 -> 2d8, so heroic never enjoys a lead and immediately inherits the flat-formula problem. The 61%-relative-value-loss arithmetic (2.57 TD -> 1.00 TD) is correct but applies from the moment the talents become available, not as a mid-career decline.
8. **CORRECTED** — heroic/Envoy, heroic/Leader and heroic/Agent each contribute R = 0.33 TD/round (Mighty only, +1+tier).
   - Evidence: Mighty's verbatim text (identical in all six trees that carry it — Red, Agent, Envoy, Hunter, Leader, Warrior): "When you hit with a weapon or unarmed attack, FOR EACH ACTION SPENT, deal extra damage equal to 1 + your tier." 0.33 TD is the per-ACTION rate (3 damage / 9 per TD at Tier 2). Over a 3-Action turn of Strikes that is 9 damage = 1.0 TD per ROUND. The analysis put 0.33 in both the TD/Action and the R (TD/round) columns.
   - Corrected: Envoy, Leader and Agent contribute ~1.0 TD/round of tree-added damage at Tier 2, not 0.33. This places them ABOVE leyline/White (0.6) and leyline/Green (0.47) in the analysis's own R ordering, which reverses §7's claim that White is "the singleton floor of the damage-having group" and that the ordering runs 0.6, 0.47, 0.33, 0.33, 0.33.
9. **CORRECTED** — §5 table: leyline/Black Withering Ray, raw 2d6 = 7.0, type Vital, delivered 5.0 against Deflect 2 — 3.3x what Red's Searing Bolt delivers.
   - Evidence: SYSTEM-PRIMER.md: "Vital, Spirit — ignore Deflect entirely." Every other vital/spirit row in the same table correctly shows raw = delivered (Predatory Strike 3.5 -> 3.5, Entropy Strike 3.5 -> 3.5, Withering Touch 3.5+WIL -> 3.5+WIL). Only Withering Ray's row subtracted Deflect from a Deflect-ignoring type, carried over from the "2[Tier][Die]" row of the preceding table.
   - Corrected: Withering Ray delivers 7.0, not 5.0. Against Red's Searing Bolt (1d6 energy, E[max(0, d6-2)] = 1.67 vs Deflect 2) the ratio is 4.2x, not 3.3x. The error understates the analysis's own conclusion.
10. **CORRECTED** — At Tier 1 a Deflect-able "half [Tier][Die]" payload delivers a mean of 0.0 against Deflect 2 (0%).
   - Evidence: half [Tier][Die] at Tier 1 rank 2 = floor(1d6/2) in {0,1,1,2,2,3}. Applying Deflect 2 with a floor at zero: {0,0,0,0,0,1}, mean 1/6 = 0.167. The analysis used plain subtraction (1.5 - 2 = negative -> 0) and reported an exact zero. The same floor-at-zero omission also makes its [Tier][Die] row 1.5 when the true expectation is E[max(0, d6-2)] = 10/6 = 1.67.
   - Corrected: ~0.17 (11% of raw), not 0.0. The qualitative point — that half-[Tier][Die] Deflect-able riders are near-worthless at Tier 1 — survives intact.
11. **CORRECTED** — Five of Red's ten damage talents are Deflect-able half [Tier][Die] payloads and round to zero for the first five levels: Arc Flash, Volatile Strike, Shockwave Slam, Afterburn, Chain Detonation.
   - Evidence: The five talents and their expressions are verbatim correct. But Afterburn is depth 4 / L6 (prereq Red 3+) and Chain Detonation is depth 5 / L6 (prereq Afterburn; Red 3+). Neither exists during the first five levels. Only Arc Flash (d1 L2), Volatile Strike (d1 L2) and Shockwave Slam (d3 L4, prereq Momentum's Edge) are reachable at Tier 1 — and Shockwave Slam's half-TD fires only "Collision with an obstacle".
   - Corrected: THREE of Red's damage talents are dead-on-arrival half-TD riders during levels 1-5, not five. The other two only unlock at L6, where the same expression is floor(2d8/2) = 4.25 and delivers ~2.3 after Deflect 2 — thin but not zero.
12. **CORRECTED** — §9 "the third classifier bug, found": four talents phrase damage with "roll" rather than "deal"/"take" and the prose classifier misses all four (Searing Bolt, Devastating Blow, Deadly Trap, Sovereign of Solitude). "This one rule explains every earliest-level disagreement in the census table."
   - Evidence: All four quotations are verbatim. But the census's own numbers refute three of the four inferences. Warrior: SOURCE 0 + SRC+AMP 2 = 2 offensive, earliestL 2 — Warrior's only two formula-bearing talents are Devastating Blow (L2) and Wit's End (L3), so earliestL 2 is only explicable if Devastating Blow WAS seen and classified SRC+AMP. Hunter: SOURCE 1 + SRC+AMP 2 = 3, earliestL 1 — Hunter's only L1 damage talent is Deadly Trap, so the SOURCE of 1 IS Deadly Trap. Black: 3 formulas, census SOURCE 3, earliestL 1; nothing indicates which three, so "missing Sovereign of Solitude" is unsupported. Only Red survives: census earliestL 2 with a depth-0 L1 formula-bearing attack (Searing Bolt) in the tree is genuinely inconsistent.
   - Corrected: The roll-phrasing bug is real but is demonstrated for ONE tree, leyline/Red (census earliestL 2 vs Searing Bolt at depth 0 / L1). The Warrior, Hunter and Black inferences are refuted or unsupported by the census's own earliestL column. The claim that it "explains every earliest-level disagreement" should be withdrawn.
13. **CONFIRMED** — deity/Knowledge tops the damage distribution at R = 10.0 TD/round; Predatory Strike at Insight 5 = 5 x 2d8 = 45 vital per Action.
   - Evidence: Studied Mark: "Insight may not exceed 5" — the cap is a flat 5, NOT the tier cap that governs Omens, Charges, Remains and Snares, so this survives the tier-cap dead-zone problem the analysis itself identifies. Predatory Strike: "deal bonus Vital damage equal to [Tier][Die] per Insight on the target", formula (@tier)d(2*@skills.red.rank+2) = 2d8 at Tier 2 rank 3. 5 x 9 = 45. Sustainability: Draw Mana (1 Action, +2 Inv) + Accumulate (+1 Inv/round) funds exactly 2 Predatory Strikes per round = 10 TD, which is the analysis's R. Ramp is ~2 rounds (Studied Mark places 2, Accumulate +1/turn, each Strike +1).
14. **CORRECTED** — Knowledge is the only tree in the game whose peak damage line is Investiture-neutral (Accumulate refunds the Investiture).
   - Evidence: Accumulate: "When that creature takes damage from any source, you recover 1 Investiture ONCE PER ROUND." One refund per round against Predatory Strike's 1 Investiture per cast. The peak line is 2-3 casts per round, so it is neutral only at ONE cast per round; the analysis's own R = 10.0 assumes a Draw Mana Action to fund the second.
   - Corrected: Knowledge's ONE-attack-per-round line is Investiture-neutral. Its peak line (2 attacks) needs one Draw Mana Action per round, which is why R is 10.0 and not 15.0. Compare deity/Death's Reaper's Harvest, which has no once-per-round cap at all ("When a character drops to 0 HP within your Attunement Range, you recover 1 Investiture") and leyline/Black's Withering Ray, whose cost is HP rather than Investiture and is therefore fully Draw-Mana-free.
15. **REFUTED** — Sovereignty's 3-Action once-per-scene capstone buys a smaller, later, Deflect-able, single-ally version of what Life's level-1 entry (Vital Diagnosis) buys the whole party for one Action. Sovereignty is better only in the narrow case of one ally rolling many damage dice.
   - Evidence: Sovereignty (3 Actions, 3 Inv, depth 3, L4): "For the scene: the ally's damage die size increases by two steps (maximum d12) and the enemy's damage die size decreases by two steps (minimum d4). Whenever the ally hits the enemy, the enemy cannot take reactions until the start of its next turn." The analysis quantifies only the first clause. On the analysis's own +1-mean-per-step figure and its own 2-die weapon assumption, that is +4 per ally attack AND -4 per enemy attack AND a scene-long reaction lock. Vital Diagnosis gives "+Tier" = +1 at Tier 1, +2 at Tier 2, per damage instance, to one marked creature. With three attacking allies at Tier 2, Vital Diagnosis is +6/round; Sovereignty's capstone is +4/round of offence plus ~4/round of mitigation plus reaction denial. Sovereignty is larger, not smaller, at any party size the analysis considers.
   - Corrected: Sovereignty's capstone is LARGER in total effect than Vital Diagnosis; what it loses on is ACTION EFFICIENCY and availability — 3 Actions + 3 Investiture once per scene at depth 3 / L4, against 1 Action + 1 Investiture, re-placeable, at depth 0 / L1. State the case as efficiency, not magnitude. Also note Vital Diagnosis's headline "+2 party-wide from a level-1 entry" mixes Tier 2 magnitude with level-1 availability: at levels 1-5 it is +1.
16. **CORRECTED** — Sovereignty's mitigation is outclassed by a leyline tree: Censure (1 Action, 1 Inv, contested, one enemy, one round) reduces incoming damage by ~1-2, against White's Shield Wall (0 Actions, permanent, multi-ally) at 4.25 per attack.
   - Evidence: The comparison picks Sovereignty's WEAKEST debuff and White's BEST mitigation. Sovereignty's actual best is Edict of the Fallen (2 Actions, 2 Investiture, depth 2, L3): "On success, FOR THE SCENE, that creature's damage die size for attacks decreases by two steps (minimum d4), and each time it fails an attack test, each ally in Attunement Range gains temporary HP equal to your Tier." On the analysis's own 2-die-weapon assumption that is -4 per attack for the whole scene from one 2-Action play, plus party temp HP on every miss — the same order as Shield Wall's 4.25.
   - Corrected: Sovereignty's best mitigation (Edict of the Fallen, -2 die steps scene-long, one enemy, any target) is comparable per-attack to White's Shield Wall (-4.25, any attacker, but only against 2+ allies adjacent to the White character). Shield Wall is broader and free; Edict of the Fallen needs no adjacency and needs no repeated investment. The "outclassed by a leyline tree" line does not survive.
17. **CORRECTED** — Five of Blue's talents collapse into one binary effect; Blue's signature axis delivers approximately one talent's worth of effect.
   - Evidence: The five talents are correctly named (Pattern Recognition, Intercept, False Premise, Probability Cascade, Absolute Stillness) and the primer's tri-state rule is quoted correctly. But the primer's rule is scoped to one roll: "A second source of advantage ON THE SAME ROLL is worth literally nothing." Read the five triggers: Pattern Recognition fires after YOUR Cognitive success on that character; Intercept fires when a Forewarned-designated creature takes its declared action; False Premise fires when ANY character in range succeeds on a Cognitive test; Probability Cascade is a Special spending an Opportunity; Absolute Stillness is a permanent rider on any creature you have reduced to 0 Speed. These fire on different targets, on different rolls, at different moments in a round.
   - Corrected: Blue's five disadvantage talents are redundant only when two of them land on the SAME roll, which their triggers make uncommon. Correctly stated: Blue can impose disadvantage on roughly one roll per Investiture, several times per fight, across different enemies — a real if unglamorous control competency, not one talent's worth. What genuinely does collapse is the analysis's implied stack (you cannot double-debuff one roll), and Probability Cascade remains the only one that escapes even that, at the cost of an Opportunity Blue provably cannot generate (resource-economy.json: Blue has 0 Opportunity producers, 1 consumer).
18. **CORRECTED** — Blue's three shared stat-sticks are Composed (+focus, also in Black and Envoy), Collected (+2 defenses, also in Green, Agent, Envoy, Scholar), and Probable Outcome.
   - Evidence: Duplicate-name scan across all 365: Blue's three shared talents are Composed (Blue/Black/Envoy), Collected (Blue/Green/Agent/Envoy/Scholar) and Baleful (Blue/Agent/Leader). "Probable Outcome" exists in Blue but is unique to Blue. The Composed and Collected tree lists in the analysis are exactly right.
   - Corrected: Blue's third shared-stock talent is Baleful, not Probable Outcome. The count of 3 is correct.
19. **CORRECTED** — Blue has 7 talents gated at L6+, 28% of the tree — the highest proportion in the game. §8's structural table: shared-stock White 1 / Blue 3 / Scholar 1 / Envoy 6 / Leader 5 / Sovereignty 0 / Life 0; Reactions White 7 / Blue 5 / Scholar 1 / Envoy 2 / Leader 1 / Sovereignty 0 / Life 0; Passives White 10 / Blue 9 / Scholar 10 / Envoy 10 / Leader 8 / Sovereignty 2 / Life 1.
   - Evidence: Every shared-stock, Reaction and Passive figure in that table recomputes EXACTLY from all-talents.json — a clean result. Blue's 7 at L6+ (28%) is also correct on the dossier's colour-only measure, and is the highest on that measure (Green 6/24% is next). But on the correct all-skill rank cap, the column is an artifact: Blue 8 (32%), Green 8 (32%), Agent 7 (28%), Red 6, Envoy 6, Hunter 6, Scholar 6, Warrior 6 (24% each), White 5, Black 5, Leader 5 (20%). The table's "0" for every heroic tree is the same colour-only bug that broke §4.
   - Corrected: Blue is TIED with Green at 32% gated to L6+, not the sole highest. And the table's zeroes for Scholar, Envoy and Leader are wrong: each has 6, 6 and 5 L6-gated talents respectively (24%, 24%, 20%). Blue's back-loading is real but not exceptional.
20. **CONFIRMED** — White's Shield Wall removes 4.25 damage from every attack against every adjacent ally for zero Actions; at 4 incoming attacks that is ~17 damage/round prevented, against Black's 3-Action Withering Ray turn dealing 54 — roughly a third of a top-tier damage turn, free.
   - Evidence: Shield Wall verbatim: "When two or more allies are adjacent to you, attacks against them deal half [Tier][Die] less damage." Passive, no cost, depth 3, L4 (prereq White 1+ only). E[floor(2d8/2)] = (9 - 0.5)/2 = 4.25. 4 x 4.25 = 17. Withering Ray at Tier 2 rank 3 = (2*2)d8 = 4d8 = 18 mean, x3 Actions = 54. 17/54 = 31%. The 4-attacks-per-round assumption is explicitly flagged by the analysis as uncheckable inside the fence, correctly. Note for the reader: at Tier 1 the same talent removes only 1.5 per attack.
21. **CONFIRMED** — Retributive Guard (2d8 = 9 spirit for 1 Investiture) is exactly as Investiture-efficient as Red's Searing Bolt (9 energy for 1 Investiture) and better after Deflect. White's damage ceiling is 1 TD/round, competing against seven Reaction talents for one slot.
   - Evidence: Both formulas are (@tier)d(2 * @skills.<colour>.rank + 2) = 2d8 at Tier 2 rank 3, both cost 1 Investiture. Spirit ignores Deflect, energy does not. White's seven Reactions verified by action-type scan: Interposing Shield, Retributive Guard, Shared Burden, Shared Conviction, Counterpoint, Voice of Authority, Pillar of Order — the highest count in the corpus (Blue 5 is next). The expected value of 0.6 rests on an unstated ~60% success rate for the contested White vs. Spiritual test, which is not derivable from talent text; treat 0.6 as illustrative, not measured. Note also that only 4 of the 7 Reactions exist before L6 (Shared Burden needs Strength 3+; Voice of Authority and Pillar of Order need White 3+).
22. **CORRECTED** — Envoy's Foresight (depth 3, L4, Passive) — "Gain an additional reaction each turn" — is the only unconditional extra Reaction in the game.
   - Evidence: Exclusivity CONFIRMED: a corpus scan for extra-reaction language returns exactly two talents — Foresight and heroic/Hunter's Sidestep ("Gain an additional reaction to Dodge when you're not wearing armor with deflect of 2 or higher"), which is doubly conditional. But Foresight's prereq is "Instill Confidence; Discipline 3+", so it is a level 6 talent, not L4.
   - Corrected: Foresight is the only unconditional extra Reaction in the game, and it arrives at LEVEL 6, not level 4. This matters for §8's Envoy verdict: Envoy's single largest structural payoff is a Tier 2 talent, so its "PAID FOR" case at levels 1-5 rests on Practical Demonstration and the focus battery alone.
23. **CORRECTED** — Scholar's Field Medicine + Swift Healer + Applied Medicine yields ~9.5 HP for a Free Action and 1 focus at Medicine 3 / Lore 3 with a d6 recovery die — the best per-Action healing in the game, and nothing else in the game heals for free.
   - Evidence: Formulas: Field Medicine adds @skills.med.rank, Swift Healer adds @skills.med.rank again AND makes it a Free Action, Applied Medicine adds @skills.lor.rank. With a d6 recovery die (mean 3.5) at Medicine 3 / Lore 3 the total is 3.5 + 3 + 3 + 3 = 12.5, not 9.5 (9.5 excludes Applied Medicine, which the same sentence invokes). Medicine 3 and Lore 3 are both level 6 by the rank cap, so the quoted numbers are a Tier 2 figure. Field Medicine's text also carries an unmentioned failure mode: "test Medicine (DC 15) to heal a concious character" — a failed test heals nothing.
   - Corrected: ~12.5 HP with all three talents (or 9.5 with Field Medicine + Swift Healer only), at level 6, on a successful DC 15 Medicine test, as a Free Action for 1 focus. The "free-Action healing is unique" claim survives — no other heal in the corpus is a Free Action — and the per-Action rate genuinely is best-in-class, since the Scholar keeps all 3 Actions.
24. **CORRECTED** — The mechanic the leyline guide names as Blue's capstone identity is implemented entirely in two other trees: Blue has zero plot-die talents, heroic/Agent has six, leyline/White fields four more (Guiding Signal, Concordant Presence, Unity of Purpose, Pillar of Order).
   - Evidence: Blue: zero — CONFIRMED, no Blue talent names plot die, Complication, or raising the stakes. White's four are CONFIRMED verbatim (Guiding Signal "raises the stakes"; Concordant Presence "raises the stakes"; Unity of Purpose "raise the stakes"; Pillar of Order "rolls a Complication ... change it to a blank face"). Agent's count is eight, not six: Opportunist, Watchful Eye, Get 'Em Talking, Sure Outcome, Risky Behavior, Cheap Shot, Double Down, Subtle Takedown. Also present elsewhere: leyline/Red Reckless Momentum, heroic/Leader Cutthroat Tactics, heroic/Scholar Overcharge and Contingency.
   - Corrected: Agent has eight plot-die/stakes talents, not six, and the mechanic is spread over five trees (Agent 8, White 4, Scholar 2, Red 1, Leader 1) — none of them Blue. The finding is stronger than stated, not weaker.
25. **CORRECTED** — The master table's "Sources" column: Knowledge 4, Black 4, Death 5, Civilization 5, Destruction 6, Power 4, Red 6, Chaos 5, Fate 4, Warrior 3, Hunter 3, Order 4, White 1, Green 1, Life 1, and 0 for Agent/Envoy/Leader/Sovereignty/Blue/Scholar.
   - Evidence: This column silently diverges from the deterministic census on 13 of 21 trees (census SOURCE: Knowledge 6, Civ 3, Destruction 3, Chaos 4, Fate 1, Power 1, Order 3, Green 2, Warrior 0, Hunter 1, Black 3, Life 0, Red 6). §9 declares and justifies only four re-classifications, three of which I refute above. A reader cannot tell which of the 21 numbers is re-derived from talent text and which is inherited. The §7 sorted list (6,6,5,5,5,4,4,4,4,4,3,3,1,1,1,0,0,0,0,0,0) and the whole "cliff not gradient" argument rest entirely on this undeclared re-count.
   - Corrected: The Sources column is the analysis's own re-classification and should be labelled as such, with the census delta stated per tree. The structural conclusion it supports — a smooth 6-to-1 continuum then a hard floor of six zero-source trees — is robust to the re-count (both streams put Blue, Scholar, Sovereignty, Envoy, Leader at zero) but the specific integers are not census-backed.
26. **CORRECTED** — deity/Sovereignty R = 0.00 TD/round; it deals literally no damage.
   - Evidence: Two independent streams do confirm zero damage FORMULAS and zero damage-creating prose — that part stands. But the analysis's own accounting is inconsistent: it scores Mighty (a flat rider on someone else's attack) as tree-added damage for five trees, then scores Sovereignty's die-step riders — which its own §8 quantifies at +4 per ally attack from the capstone and +2 from Exalt — at exactly 0.00. Under the analysis's stated rule ("Amplifiers = talents that add to damage some other action was already producing") Sovereignty has 2 amplifiers, which the table itself records in its Amps column.
   - Corrected: Sovereignty creates no damage, but its amplifier output is not zero and should be reported in the same units as Mighty's. Sovereign's Balance (1 Action, 2 Inv) is +1 step ally / -1 step enemy; Exalt is +1 step; the capstone is +2/-2 for the scene. On the analysis's own 2-die assumption that is roughly +2 to +4 per affected attack — comparable per-instance to Mighty's +3. The zero belongs in the Sources column only.

### What the analysis missed

- THE ROOT CAUSE, which its own remit ("recompute every ... depth and earliest-level value") should have caught: the dossier's earliestLevel applies the rank-3 gate only to COLOUR prerequisites. 42 talents carry a non-colour "3+" prerequisite with earliestLevel < 6 and are all really level 6. Other profiles in this same review corrected for it (the Agent profile flags Subtle Takedown/Fast Talker/Shadow Step/Trickster's Hand as L6; the Black profile flags Puppeteer as truly L8). This one omission breaks §4's crossover argument, §8's "gated at L6+" column, the Envoy Foresight date and the Scholar and Hunter damage numbers.
- Mighty's actual wording, "for each action spent" — quoted nowhere in the analysis despite Mighty being the sole damage contribution it assigns to three whole trees. It is the difference between R = 0.33 and R = 1.0 for Agent, Envoy and Leader, and it reorders the bottom of the analysis's own damage ranking.
- The Sovereignty capstone's third clause. The analysis quotes and prices the die-step halves and never mentions "Whenever the ally hits the enemy, the enemy cannot take reactions until the start of its next turn" — a scene-long reaction lock, which by the primer's own valuation ("Action denial ... is the most valuable category in a 3-action economy") is the most valuable thing in the tree.
- deity/Sovereignty's Edict of the Fallen entirely. It is the tree's largest effect (-2 damage die steps FOR THE SCENE, 2 Actions, depth 2 / L3, plus party temp HP on every enemy miss) and it is the talent that would have to be beaten for the "Sovereignty is not paid for" verdict to hold on mitigation grounds. The analysis compares White's best mitigation to Sovereignty's weakest.
- A scope violation it flags in one place and commits in another. It correctly fences off adversary Deflect and flags Deflect 2 as an assumption — but every Sovereignty and Exalt valuation in §8 silently assumes "a 2-die weapon", and weapon dice are explicitly out of scope. The entire Sovereignty-vs-Life comparison is denominated in an out-of-scope quantity with no flag.
- Momentum's Edge has a second reading the analysis never considers. "Speed" is used BOTH as a movement rate in feet (Forge Construct "Speed 25 ft", Walking Ruin "Your Speed increases by 10 ft") AND as a tested skill (Destruction's Concussive Yield "tests Speed vs. your Red"; Fate's Inevitable Snare "tests Speed vs. your Green"). If "bonus impact damage equal to your Speed" means the Speed skill modifier, the rider is +2 to +5, not +25 to +30. The analysis presents a two-world uncertainty (delivers nothing / delivers 25-30) when the text supports three.
- Wit's End's precondition cost. It is priced at 7.0 damage per Action but requires "a target who has 0 focus", a state Warrior reaches only by spending a separate Action on Feinting Strike. The true rate is roughly 14 over 3+ Actions.
- deity/Death's "~4 TD/round free" steady state needs three corpses, not one setup. Reaper's Harvest caps held Remains at your tier (2 at Tier 2) and Bone Garden and each Risen Servant each consume one, so two Servants plus a Garden requires three separate deaths inside Attunement Range.
- Tempered Edge's "ignore deflect" scope is ambiguous — "Your Combat Construct's melee attacks deal an additional [Tier][Die] energy damage and ignore deflect" can read as the rider only or the whole attack. The analysis uses the narrow reading in §6 and the broad one in the master table ("Impact+Energy, ignores Deflect") without noting the contradiction.
- An unresolved internal contradiction: §3 asserts "Knowledge's 9 talents out-damage all 25 of Red's by roughly 3.5x" and calls it a crossed red line, while §9 concedes Red might be the game's top damage tree at levels 1-5 if Momentum's Edge resolves. Both cannot be load-bearing; the red-line claim should be conditioned on the Momentum's Edge resolution.
- Retributive Guard's "expected ~0.6" TD/round embeds an undeclared ~60% success rate on a contested test whose difficulty is not derivable from talent text. §7 also lists five delivery conditions under the heading "all four of which must hold".

### Surviving findings, in priority order

1. Blue, Scholar and Sovereignty create no damage on three independent streams (prose census, authored Foundry formulas, and a lexical scan in which Blue and Scholar never use the word "damage" at all). White has exactly one source (Retributive Guard, depth 1 / L2, 2d8 spirit, Reaction-only). Six trees have zero sources, not the two the designer's premise names, and White is not one of them. This is the analysis's strongest and best-evidenced finding and it survives untouched.
2. THE CORRECTED ANSWER TO DESIGNER QUESTION 2, which reverses the analysis: heroic damage does not lead leyline at low levels and then lose at 6 — it never leads. Devastating Blow (Athletics 3+) and Wit's End (Intimidation 3+) are level 6 talents, so heroic/Warrior has NO tree-added damage before L6, and heroic's two real damage expressions arrive at exactly the level where leyline/deity step from 1d6 to 2d8. The flat-formula problem (2d8 and 4d6 unchanged across Tiers 1 and 2 by construction: max(@tier-2,0)) is confirmed and is a formula-authoring choice, not stated design intent. Fix candidate: make the heroic dice scale on @tier the way [Tier][Die] does, or drop the rank-3 gates so heroic damage actually exists at levels 2-5.
3. The deity/leyline per-talent gap is real, large, and confirmed by exact recount: a deity talent is 5.2x more likely to carry a damage formula than a leyline talent and 10.1x more than a heroic one (33.3% / 6.4% / 3.3%). Eight of ten deity trees deal damage at depth 0, level 1 — the deity atlas has no ramp. Knowledge's cap-5 Insight multiplier is verified from talent text ("Insight may not exceed 5") and is the only tier-capped-resource tree that escapes the tier-cap dead zone, which is why it tops the distribution.
4. The Investiture throttle is the real explanation for mid-table sameness, and the four escape routes are all text-verified: Black pays HP not Investiture (Withering Ray: "Lose half [Die] health"); Knowledge refunds once per round (Accumulate); Hunter's Deadly Trap costs no resource at all; Civilization and Death front-load into installs that fire on their own initiative (Construct 2 attacks x 2 TD = 36/round at Tier 2 for zero Actions).
5. The Blue verdict, SOFTENED but not overturned. Blue genuinely has 0 damage, 0 healing, 0 damage mitigation, 0 resource generation, 3 shared-stock slots, 0 Opportunity producers against 1 consumer, and 32% of the tree gated to L6 (tied with Green for the highest). But "five disadvantage talents collapse into one" over-applies the primer, whose rule is about a second source ON THE SAME ROLL; the five fire on different targets and different rolls. Correct verdict: Blue's budget is control/debuff/information, it is thinner than White's and sharply back-loaded, and its stated capstone identity (plot-die manipulation) is implemented in five other trees and not in Blue. That last point is the real defect and it is fully text-verified.
6. The Sovereignty verdict, SURVIVING ON STRUCTURE ONLY. The two comparisons the analysis uses to prove it are both broken (the capstone is larger than Vital Diagnosis, and Edict of the Fallen is comparable to Shield Wall). What survives is entirely structural and entirely text-checkable: nine single-target talents, zero Reactions, zero zones, zero summons, zero healing, zero damage; the promised Decree radius exists in no talent; and the White 3+ gate is a level-6 six-rank investment that the tree never tests and never uses to size a die. Argue it on the toll booth and the missing Decree, not on the arithmetic.
7. White is paid for, and the case is clean: 10 always-on Passives, Shield Wall removing 4.25 per attack against every adjacent ally for zero Actions permanently (1.5 at Tier 1), Guardian Stance's +1 Deflect from level 1, and the only Draw Mana rider that heals the party. Its honest limits are that 7 Reactions compete for one slot (only 4 of them before L6) and 22 of 25 talents need a second body. Envoy, Leader and Scholar are also paid for, though Envoy's largest payoff (Foresight, the only unconditional extra Reaction in the corpus) is L6, not L4, and Scholar's headline healing numbers are Tier 2 figures gated on a DC 15 test.
8. Two data-quality findings worth acting on independently of the damage question. (a) The roll-phrasing classifier gap is real but demonstrated for ONE tree: leyline/Red's census earliestL of 2 is inconsistent with Searing Bolt at depth 0 / L1 carrying an authored formula and the words "rolling [Tier][Die] energy damage". (b) The tier-cap dead zone is real and text-verified across five trees: Spreading Omen's extra Omen, Cascading Failure's "two or more Charges" clause, and Chaos's capstone Unravel Everything are all inoperable or dominated at Tier 1 because the cap equals tier = 1. Note the contrast that makes it a design lever: Knowledge's Insight cap is a flat 5 and Knowledge is the strongest damage tree in the game.
