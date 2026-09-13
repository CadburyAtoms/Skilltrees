# Balance review — the 21 trees against their honest intent (2026-09-13)

**What this is.** The talent ecosystem review (`README.md`) measured the system and filed seventeen
rulings; Ben answered them all on 2026-09-13, and the prose pass (`TREE-INTENT.md`, PR #349) made
every tree's description say what its talents do. This review asks the question that only makes
sense once the intent is honest: **does each tree deliver its job at a rate competitive with the
others, at the moments the table actually plays** — session one, the end of tier 1, and just past
the level-6 wall — and where it does not, what is the smallest change that fixes it?

**Scope.** The 365 talents, read as they are today (post PRs #329, #336, #337). Adversaries, PC
build ladders and system-native talents are out (as Ben ruled for the ecosystem review). The
heroic atlas is the Cosmere RPG's published talents plus Edha's two specialties (Leybreaker,
Ley-surveyor); **published heroic talents are noted where they matter but not proposed for change**
— diverging from the printed game is a different decision from balancing Edha's own trees, and
this review does not make it for Ben.

**What is already decided and is not re-opened.** R-95 (Momentum's Edge → `[Tier][Die]`, shipped),
R-96 (no damage for Blue or White; the minimal set, shipped), R-97 → R-119 (Sovereignty's Decree
is being built), R-98 → R-115, R-99 → R-118, R-100 → R-116, R-102, R-103 (shipped), R-104 (shipped),
R-105 (the heroic/leyline tier trade is accepted), R-106, R-107 → item 113, R-108 (deity Specials:
convert nothing yet), R-109 → R-117, R-110, R-111 (`Withering Ray` is the documented leyline damage
ceiling). Where this review's arithmetic bears on one of the PM's six waiting proposals
(`EDHA_RULINGS.md` §L, R-114 … R-119) it says so; it files **six new rulings, R-120 … R-125**, in
§D of the same file, each with a recommended default and the deploy class of every option.

**Method.** Every number below comes from `balance-turns.js` beside this file (run it; the
assumptions are at the top and they are the critique's baseline: the weapon's own die and the
system's `+ mod` on every hit, three Actions on a Slow turn, Investiture drawn at tier per Action)
or from the census scripts re-run on 2026-09-13 (`derive-dossiers.js` and the others named in
`README.md`). Control and support are argued in prose, not converted to damage. Seven load-bearing
claims were handed to an independent verifier before filing (its findings are in §7; two changed
what this review recommends).

---

## 1. The yardsticks

Five facts set the scale. Three are the critique's; two are new to this review.

1. **The free Strike is the floor.** Three Strikes with `Mighty` is about 31 damage a turn at
   level 1 and 40 at level 7, for nothing, every turn, for every character that can hold a weapon.
   A talent that costs an Action is measured against 8.5–13.5 damage the Action would have bought.
2. **`Withering Ray` is the leyline ceiling** (R-111): about 11 vital per Action at level 1 and 24
   at level 7, paid in the caster's own health rather than Investiture. Three casts a turn is the
   same size as a `Mighty` Strike turn; the edge is that vital ignores Deflect.
3. **Level 6 is a double step for leyline and deity** (tier 1 → 2 and rank cap 2 → 3 together):
   `[Tier][Die]` goes 1d6 → 2d8, average 3.5 → 9. Heroic dice stay flat; heroic's growth channel is
   the weapon, `Mighty` and the modifier (R-105).
4. **Investiture is an Action in disguise.** At tier 1, Draw Mana buys ONE Investiture for ONE
   Action. Once the starting pool (about four) is spent — two or three rounds into a fight — every
   "1 Action, 1 Investiture" talent is a two-Action play in steady state, and every "2 Actions, 2
   Investiture" talent is a whole turn. At tier 2 the draw buys two, so the tax halves. This is why
   the trees with an **income passive** (a refund that fires without an Action) play as if they
   had a fourth Action, and why `Withering Ray`'s health cost is a bigger edge than its dice.
5. **Advantage and disadvantage are one binary flag each** (the primer), and the expected value of
   either on a d20 is about three points — roughly a fifth of a hit's chance. A talent that spends
   an Action and an Investiture to impose disadvantage on one roll buys, in expectation, a fifth of
   one enemy attack: two or three points of damage prevented against the 8.5 an Action of damage
   would have dealt. Control and support talents earn their keep through *decisiveness* (the roll
   that decides the fight) and through their **free** layers (Passives, Specials, Reactions), not
   through their Action layers — which is the finding R-96 already made about White, generalised.

---

## 2. The ten findings, ranked

### 1. Knowledge's Insight multiplier is the largest outlier in the game — R-120

`Predatory Strike` (entry, level 1, 1 Action, 1 Investiture) adds **`[Tier][Die]` of vital damage
per Insight** to a weapon attack and then adds an Insight. `Studied Mark` places two, `Accumulate`
adds one every turn for free and refunds an Investiture whenever the quarry is hurt, each hit adds
one, and the cap is five. From the second turn of any fight the quarry carries five.

| line (from `balance-turns.js`) | L1 | L5 | L7 |
|---|---|---|---|
| Knowledge — draw + Predatory Strike ×2 at 5 Insight, sustained | **52** | **54** | **111** |
| Knowledge — Predatory Strike ×3, a pool turn | 78 | 81 | 166 |
| Black — Withering Ray ×3 (the leyline ceiling; costs health) | 33 | 36 | 72 |
| Warrior — Saltstance, Strike ×3 + Mighty (free) | 34 | 37 | 46 |
| Civilization — Construct + the disciple's Strike ×3 | 39 | 42 | 67 |
| Power — draw + Warlord's Advance ×2 with Fury at cap | 28 | 30 | 47 |

Vital, so none of it is turned by Deflect; sustainable, because `Accumulate` pays the second cast
back every round; and available from level 2. It is roughly **twice the leyline ceiling turn**
(which pays health), **twice the next deity**, and it is the *repeatable* line — the two talents
written as the payoff (`Killing Blow`, `The Final Study`) spend the stack for one hit of the same
size and are therefore never worth pressing, which the ecosystem review noticed and which is the
tell that the multiplier landed on the wrong talent. (The verifier's shape note: the bonus is ONE
`[Tier][Die]` roll multiplied by the Insight count, not five dice — the same average as the table,
with much more swing: a five-Insight strike at level 7 lands anywhere between 10 and 80 bonus
vital. The item also still carries a decoy `damage` formula beside the rider; see §7.)

**Recommended default (R-120 (b)):** `Predatory Strike` deals **one `[Tier][Die]` plus your Tier
per Insight** (level 7: 9 + 10 = 19 bonus per hit — the size of `Withering Ray`, and still the top
deity single-target line); `Killing Blow` and `The Final Study` keep `[Tier][Die]` per Insight, so
the cash-out becomes the burst it was written to be. Sustained turn 34 / 36 / 59. DATA + the
authored formula, REBUILD deity. Alternative (a): cap Insight at 3 (38 / 40 / 75 — still above the
ceiling at 7). Alternative (c): accept as the deity damage ceiling and write it into the guide, the
way R-111 did for `Withering Ray`.

### 2. Investiture income splits the deity atlas in two — R-121

Five deity trees carry a passive that pays Investiture back with no Action spent: Chaos (`Void
Sense`, once a round when an Omen-bearer is hurt), Life (`Prognosis`, once a round when the
Diagnosed creature is hurt), Knowledge (`Accumulate`, the same), Sovereignty (`Expose`, whenever a
Censured creature fails a test), Death (`Reaper's Harvest`, every death in range). Five do not:
Order, Civilization, Fate, Power, Destruction. Every leyline colour but Black is in the second
group too (Red's `Flashpoint` is a refund on a multi-hit; White, Blue and Green have none).

By yardstick 4, an income passive is close to a fourth Action every round from turn three on.
Among the five without one, Order, Civilization and Fate mostly *install* — Edicts, Covenants, the
Construct, Foundations, Ordained Ground and Snares persist for the scene, so their Investiture is
spent early and then sits. **Power and Destruction pay per activation and get nothing back**: a
Power disciple's `Kneel` + `Absolute Authority` is three Investiture, most of the level-1 pool, once
a fight; a Destruction disciple detonates one Charge per Investiture. Both are 100% Action-costed
trees (Power has no Passive at all) with no persistence beyond Destruction's terrain.

**Recommended default (R-121 (a)):** one income clause each, on an existing talent, in the tree's
own idiom — `Warlord's Advance`: *"If this attack reduces the target to 0 HP, you gain temporary HP
equal to your tier, **recover 1 Investiture**, and may move up to 10 ft as a Free Action"*;
`Concussive Yield` (Passive): *"… Once per round, when a Charge you set detonates and hits two or
more characters, **recover 1 Investiture**."* (the exact shape of Red's `Flashpoint`). DATA,
REBUILD deity; both are one authored rule on an existing card. Alternative (b): accept — the two are
burst trees and the pool is the price. Alternative (c): a system-level rule (Draw Mana refunds on a
kill) — wider than the problem.

### 3. Chaos is a single-target tree until level 6 — R-122

Every Chaos talent that places an Omen is bounded by *"You may have up to tier Omens active
simultaneously; placements beyond this cap are lost."* Tier is 1 until level 6. So `Spreading Omen`
(depth 1, level 2 — "place an Omen on the target and one additional enemy") places one; `Cascade
Collapse` ("remove all your Omens … each enemy whose Omen is removed takes …") hits one; the
capstone's "every enemy in Attunement Range up to your cap" is one. The tree's whole multi-target
identity — spread, collapse, unravel — is a tier-2 unlock, and at tier 1 Chaos is the weakest
damage deity per Investiture: `Entropy Strike` then `Isolating Ruin` on the one Omen is about 16
for three Investiture and three Actions.

A second fault sits in the same tree and the same fix: the Black lane (`Isolating Pressure`,
`Unweaving`, `Isolating Ruin`) *spends* Omens it cannot *make* — a disciple who enters through the
Black entry plays the weaker half of every card until they buy the Blue entry too.

**Recommended default (R-122 (a)):** the cap becomes **tier + 1** (two Omens at tier 1, three at
tier 2 — `capFormula`, one number in the authored overlay), and `Isolating Pressure` gains *"If the
target bears no Omen, place one"* on its success clause so the Black entry can start the engine.
DATA, REBUILD deity. Alternative (b): only `Spreading Omen`'s second Omen ignores the cap.
Alternative (c): accept — Chaos is a tier-2 tree.

### 4. Sovereignty — the gap is confirmed, and R-119's Decree closes most of it (no new ruling)

`Censure` is one Action and one Investiture to step one enemy's damage die down one size for one
round: against a d8 attacker who attacks twice, **about two points prevented**. `Exalt` is the
mirror: about one point per ally hit. The scene-long versions arrive at level 6 and make the
entries vestigial; the capstone, once a scene, is worth perhaps four points a round. Nothing else
in the game buys so little for an Action — the yardstick is 8.5 — and the tree has no other axis.

The Decree the PM proposed under R-119 (a) — a 15 ft radius that moves with the arbiter, one step
up for allies and one down for enemies at the start of their turns, 2 Investiture, once a scene —
is worth about **fifteen points a round for the rest of the scene** with three allies and three
enemies inside it (9 up, 6 down). Over a four-round fight that is sixty points for two Actions:
the best value-per-Action in the tree by a factor of ten, and the first thing that makes a
Sovereignty turn compare with a Withering Ray turn. **This review's arithmetic supports R-119 (a).**
Two things to fold into item 106's design gate rather than file separately: the entries go
vestigial the moment their scene versions arrive, so retune `Censure` and `Exalt` as riders or
cheaper plays when the Decree lands; and `Expose` (Investiture back on every failed test of a
Censured creature) is the income the tree needs — keep it reading Censure *and* the Decree.

### 5. Blue and White: the Action layer is priced like damage and buys a fifth of it

Yardstick 5, applied. Blue's `Pattern Recognition`, `Intercept`, `False Premise`, `Probability
Cascade`: one Investiture each for disadvantage on one roll — two or three expected points against
the 7.5 a `Searing Bolt` buys for the same Investiture. White's `Guiding Signal`: an Action and an
Investiture to raise the stakes on one ally's next test — a one-in-three chance of an Opportunity.
Where the two trees actually earn their place is the **free layer**: `Shield Wall` prevents about
seven points a round at level 4 and eighteen at level 7 for nothing; `Guardian Stance` is a
permanent Deflect for two characters at level 1; `Forewarned` is an extra Reaction every round you
guess right; `Counterspell` deletes a whole talent. R-96 (no damage; the minimal set) stands. What
is left is *when* the two trees' teeth arrive, and Blue's do not arrive until level 6 (finding 6).

### 6. Two signature talents sit behind the level-6 wall — R-123

Eight of Blue's twenty-five talents are Blue 3+ (level 6), and they are the three things the
prose now sells as Blue's height: the counterspell (`Counterspell`), the freeze (`Ghostly Walls`,
and `Absolute Stillness` behind it), the moving image (`Living Image`). Before level 6 Blue is a
disadvantage engine with a barricade and a double. Life's signature resource, Mutation, is
`Adaptive Mutation` at Green 3+ — level 6 — which the deity guide's own first principle
("fantasy on the first talent") forbids; the prose now honestly calls mutation "the deep end".

| tree | talents at level 6 | of | what waits there |
|---|---|---|---|
| Blue, Green | 8 | 25 | Blue: all three teeth. Green: Restoration and Territory upgrades — its tier-1 kit is whole |
| Agent | 7 | 25 | three of its action-granters |
| Red, Warrior, Hunter, Envoy, Scholar | 6 | 25 | Warrior's and Hunter's big dice |
| Black, Leader | 5 | 25 | |
| White | 4 | 25 | |
| Life, Knowledge, Sovereignty | 2 | 9 | Life: the mutation. Knowledge: the cash-out and the pack share. Sovereignty: the scene judgments |
| Order | 1 | 9 | |
| the other six deities | 0 | 9 | |

**Recommended default (R-123 (a)):** `Ghostly Walls` to Blue 2+ (the freeze becomes a depth-3,
level-4 play; `Absolute Stillness` stays 3+ behind it; `Counterspell` stays 3+ — a talent-negation
at level 3 would be too much) and `Adaptive Mutation` to Green 2+ (Life's fantasy on the entry's
own lane by level 2). DATA, REBUILD leyline + deity. Alternatives: (b) Blue only, (c) Life only,
(d) accept the walls.

### 7. Civilization's Construct is a second character at tier 2 — R-124

`Forge Construct` (one Action, one Investiture, level 1) and three riders — `Tempered Edge` (free:
"melee attacks deal an additional `[Tier][Die]` energy damage and ignore deflect"), `Siege Form`,
`Arsenal` (two attacks a turn, a free follow-up after a kill) — give the disciple an attacker on
its own initiative doing **14 damage a round at levels 3–5 and 36 at level 7, free after about four
Investiture of setup**, while the disciple's own three Actions are untouched (67 a turn at level 7
with plain Strikes; the model line above). That is the second-highest sustained line in the game
and the highest that costs nothing per round. The review's first reading was that `Tempered
Edge`'s "ignore deflect" might be a loose sentence; the verifier found the opposite — the rider is
wired to add the target's Deflect back so the *whole* attack lands as if Deflect were 0, and the
engine's own hint names Tempered Edge as the intended user. It is also the small part of the
number: a few points a round against the 36 the two attacks deal. Deity power is Radiant-tier by
design and the Construct absorbs attacks that would otherwise land on the party.

**Recommended default (R-124 (b)):** accept as written and document it — the deity guide's
Civilization entry says the Construct's melee attack bypasses Deflect and that the two-attack
Construct is the tree's damage ceiling, the way R-111 documented `Withering Ray`. DOCS-ONLY.
Alternative (a): narrow the bypass to the energy die (a retype of the rider's damage, since the
system subtracts Deflect once from the summed instances; DATA, REBUILD deity). Alternative (c):
`Arsenal`'s second attack only on the round after a kill — a bigger change than the evidence asks
for.

### 8. Power's two entries read a condition nothing in the game applies — R-125

`Kneel` ("advantage on attack tests against any Compelled, **Frightened**, or Weakened character")
and `Absolute Authority` ("choose a Compelled, **Frightened**, or Weakened character") both read
Frightened, and no talent in all 365 applies it (`Risen Servant` is merely immune to it); no adversary
ability applies it either. The canon reference lists Frightened among the homebrew conditions the
deity reviews promoted; Compelled was built and Frightened was not. The verifier found the intent
in the engine's status registry — *"Power (Tyrith) — GM-applied marker (nothing auto-inflicts it
yet)"* — so at a table where the GM applies fear by hand the clause is live; nothing tells a
player or a GM that.

**Recommended default (R-125 (a)):** replace Frightened with **Disoriented** in both — a condition
Chaos, Order, Red, White, Blue, Envoy and Leader all apply, which gives the one tree without an
income a little cross-path synergy for free. DATA, REBUILD deity. Alternatives: (b) keep it as the
GM-applied marker it was built as and say so on the cards and in the guide, (c) keep the reads and
build a Frightened source later.

### 9. Heroic: canon does most of the balancing, and the two things worth knowing are gates

Every heroic path has the free Strike floor and `Mighty`, so no heroic path is *behind* at any
level; Warrior is the chassis (the `Saltstance` line at 34 a turn from level 3 is the best free
damage in the game before level 6), and its Leybreaker specialty sits in family — `Breaker's
Charge` is `Devastating Blow` with an Investiture strip, at the same level-6 gate. Three notes for
the table rather than rulings:

- **Reward gates, counted transitively** (a talent is gated if every route to it passes through a
  GM-granted prerequisite): **Leader 8 of 25** (`Authority` and the capstone `Synchronized Assault`
  behind a title; `Rumormonger` and the whole Politico chain behind a patron), **Envoy 4**, **Hunter
  4** (the entire companion ladder), Agent 2, Scholar 0, Warrior 0 (Shardbearer's six left with it).
  The new prose warns Leader and Hunter players; the campaign material should say when a Leader
  gets a title and that a Tracker starts with the companion.
- **The Archer before level 6.** `Unrelenting Salvo` ("you can Strike your quarry more than once per
  turn with the same ranged weapon", Agility 3+) implies the base rule that a ranged weapon Strikes
  once a turn. If that rule is in play at Ben's table, an Archer's turn before level 6 is one shot
  plus two Actions of something else — a third of a melee Strike turn — and the Archer is a level-6
  specialty. Verify at the table; the canon reference does not state the rule either way.
- **`Cheap Shot`** (Thief, level 1, 1 Action + 1 focus: an unarmed Thievery attack vs Cognitive that
  Stuns on a hit) is the best control-per-Action in the heroic atlas — Stunned costs two Actions,
  so it trades one of yours for two of theirs, repeatably, against the defence brawlers are weakest
  in. It is a published talent; it is noted, not proposed for change.

### 10. Three design notes that are not defects

- **Mobility is unclaimed** (no tree scores above 2 on it in the capability matrix) — an
  opportunity for whatever tree next needs an identity, not a hole to patch.
- **Control is the commodity** (twenty of twenty-one trees have some; Black alone is *good* at it).
  The prose now says who denies, who commands, who provokes; the guides should keep new control
  talents inside those three verbs.
- **The families are healthy.** The mark trees, the zone trees and the summon trees use disjoint
  keywords with different mechanics (the ecosystem review's finding), and the prose pass gave each
  member of each family a distinct sentence. Nothing here proposes merging or removing any.

---

## 3. Leyline parity

| colour | best repeatable turn (L1 / L7, damage-equivalent) | income | self-initiated plays | Reactions | level-6 talents | the session-one turn |
|---|---|---|---|---|---|---|
| Black | 33 / 72 vital, costs health | Predatory Patience, Predator's Due, Reserve | 8 | 2 | 5 | whole: ray, deny a turn |
| Red | 37 / 54 charging; 23 / 42 bolting | Flashpoint (multi-hit) | 11 | 1 | 6 | whole: bolt or charge, Fast turn |
| Green | +12 / +18 party riders, free; 7.5 heal per Action | none | 10 | 3 | 8 | whole: vines, mend, pack |
| White | 7 / 18 prevented, free; the Draw Mana heal | none | 7 | 6 | 4 | thin: point, heal, react |
| Blue | 0; ~3 expected per disadvantage; a 7 HP wall | none | 10 | 5 | 8 | thin: barricade, double, predict |

(Self-initiated plays are the critique's hand count under R-96; Reactions and level-6 counts are
from the dossiers; White's Reactions are six since item 105 made `Interposing Shield` a Special.)

The five are five roles, and four of them have a whole turn at level 1. The two that do not are
the two R-96 already treated; what remains for them is timing (R-123 for Blue) and the free layer
carrying the Action layer (finding 5) — which is a shape the prose now sells honestly ("you rarely
strike first; you answer"). Black is the strongest colour per Action *and* the most sustainable,
because its damage costs health instead of Investiture (yardstick 4) — R-111 accepted this as the
ceiling; nothing here re-opens it, but every future leyline damage talent should be measured
against the steady-state Withering Ray turn, not the pool turn.

## 4. Heroic parity

Six paths on one floor. Warrior is the damage chassis and the only strip-and-execute; Hunter is
free and never runs dry (its whole core loop costs no Investiture, focus or Opportunity) but is
throttled before level 6 if ranged Strikes are once a turn; Agent owns the plot die and the
Stun; Envoy is the party's focus battery and the only non-violent ending; Leader is the command
die and the social-leverage tree, a third of it behind rewards; Scholar deals no damage and is the
best healer who needs no Investiture. Shared filler (`Hardy`, `Mighty`, `Collected`, the focus-cap
talent, `Surefooted`) is 24% of Agent, Envoy and Leader — slots that could carry each path's
promise, but the published set is what it is. No heroic ruling is filed.

## 5. Deity parity

| tree | best repeatable turn at L3 / L7 | income | Reactions | level-6 talents | the thing it alone does |
|---|---|---|---|---|---|
| Knowledge | **52 / 111** vital (R-120) | Accumulate | 0 | 2 | the dice-count multiplier |
| Civilization | 39 / 67 (Construct + Strikes; R-124) | none (installs) | 1 | 0 | the summon with a six-talent ladder; the only teleport |
| Death | 36 / 58 (free layer + Strikes) | Reaper's Harvest | 0 | 0 | resurrection, corpse interrogation, heal-denial |
| Power | 28 / 47 (R-121, R-125) | **none** | 0 | 0 | Compelled; the dictated action |
| Destruction | 14 / 36 on two targets, no roll, no save (R-121) | **none** | 1 | 0 | dangerous terrain; nothing here misses |
| Chaos | 16 (one Omen at tier 1; R-122) / 18 + Disoriented | Void Sense | 1 | 0 | the forced reroll; the dispel |
| Order | conditional: Edict 6.5 on violation, Verdict cascades | none (installs) | 1 | 1 | the prohibition; the two-way pact |
| Fate | conditional: Snare 6.5 + Restrained, 13 when an ally springs it | none (installs) | 1 | 0 | the untested Restrain; the ally-sprung trap |
| Life | 6 / 12 party vital tax; 6.5 / 18 heal per Action (R-123) | Prognosis | 0 | 2 | the biggest heals, every one with a rider |
| Sovereignty | 2 prevented per Action (R-119 → 15 a round) | Expose | 0 | 2 | the die-step ladder |

The ten deities are not similar to each other on the damage lane — a five-fold spread between
Knowledge and Chaos — and they should not be, because they are ten roles. What the atlas needs is
that each role's *value* be comparable, and three of the ten fail that test today: **Knowledge**
(too much, finding 1), **Sovereignty** (too little, being fixed), **Chaos at tier 1** (the identity
does not exist yet, finding 3). Two more are structurally handicapped rather than weak: **Power**
and **Destruction** (no income, finding 2). Death, Order, Fate, Civilization and Life are where a
deity tree should be.

## 6. Cross-atlas

- **Leyline vs heroic, per fight rather than per Action.** The critique's per-Action parity before
  level 6 holds, and the per-fight view sharpens it: a heroic turn is free forever, a leyline turn
  spends a pool that is gone by round three unless the tree refunds it. Red's bolt line at steady
  state (23 at level 1, including the draw) is below a plain Strike turn (25.5); Red's *charge*
  line is above it (37) because it is mostly free riders on Strikes. The leyline atlas's damage is
  competitive exactly where it rides the Strike or costs health; where it costs Investiture per
  cast, it is a burst.
- **Deity vs the leyline depth it costs.** A deity tree costs two colours at rank 2 and nine picks.
  Nine Knowledge picks buy the strongest sustained line in the game; nine Black picks buy the
  strongest *leyline* line at half the size and a health cost. That gap is the design — "deity
  power is Radiant-tier" — but R-120 keeps it at "clearly stronger" rather than "twice the
  ceiling", and the deity-vs-deity spread (§5) is the parity that matters.
- **The Investiture tax is the same for both.** Every leyline colour but Black and every deity tree
  but five plays a two-Action talent in steady state at tier 1. This is the single biggest hidden
  factor in how a tier-1 leyline or deity character *feels* next to a heroic one, and the guides
  should carry yardstick 4 explicitly.

## 7. Independent verification

Seven claims were handed to a separate verifier (read-only, working from the data files, the
authored overlay, the engine sources and the critique) before the rulings were filed. Its
verdicts, and what changed because of them:

| claim | verdict | what it found |
|---|---|---|
| Knowledge multiplies `[Tier][Die]` by the Insight count | **corrected in shape, confirmed in size** | The card's own `damage` formula is a decoy; the bonus is an `edha-damage-bonus` rider whose formula is `((@tier)d(2·rank+2)) × max(count, 1)` — **one roll multiplied by the count, not N dice**. Same mean as the review's table, much higher variance (a 5-Insight strike at level 7 swings between 10 and 80 bonus vital). `Killing Blow` and `The Final Study` use the same "one roll × N" shape. Sub-claims (Studied Mark places 2, Accumulate +1 per turn and 1 Investiture back once a round, cap 5) all confirmed. |
| Exactly five deity trees have an Investiture income passive | **confirmed** | `Void Sense`, `Reaper's Harvest`, `Prognosis`, `Accumulate`, `Expose` — all Passives; a sweep of all ninety deity cards and every authored handler that grants Investiture finds nothing in Order, Civilization, Fate, Power or Destruction. |
| Chaos's Omen cap is tier, and the Black lane only consumes | **confirmed** | `capFormula: "@tier"` with `evict: "refuse"` on every placement (Entropy Strike, both Spreading Omen targets, Unravel Everything); `Isolating Pressure`, `Isolating Ruin`, `Unweaving` and `Cascade Collapse` carry release-only rules. |
| The five level-6 gates | **confirmed** (one addition) | `Ghostly Walls` Blue 3+; `Absolute Stillness` Ghostly Walls + Blue 3+; `Counterspell` Blue 3+; `Adaptive Mutation` Green 3+ and Life Surge; `Surgical Precision` Blue 3+ **and Vital Diagnosis**. `validate-build.py`: rank cap 2 through level 5, 3 from level 6. |
| `Tempered Edge`'s Deflect bypass covers the whole attack | **resolved against the review's first reading — it is the whole attack, by design** | The rider carries `addTargetDeflect: true`: the engine adds the target's Deflect back as an extra impact instance so the hit "lands as if deflect were 0", and the hint names Tempered Edge as the intended user. The Siege Cannon is excluded. **Finding 7 and R-124 were rewritten**: the recommended default is now to accept and document, with the narrowing as the alternative, because the implementation is deliberate and the bypass is worth only a few points a round against the 36 the two attacks deal. |
| Nothing in the game applies Frightened | **confirmed, with a nuance** | Three mentions in 365 talents, all reads or immunities; no adversary ability applies it. The engine registers it as *"Power (Tyrith) — GM-applied marker (nothing auto-inflicts it yet)"* — so the clause is not dead at a table where the GM applies fear by hand; it is undocumented. **R-125 gained that as a real alternative.** |
| The critique's per-Action baseline | **confirmed** | Every hit adds the roller's skill modifier; a d6–d8 weapon; Strike + Mighty 9.5–10.5, Withering Ray 11, Searing Bolt 7.5 per Action at levels 1–5 — the numbers `balance-turns.js` reproduces. |

Three things the verifier raised unasked, carried forward:

- **The decoy formulas.** `Predatory Strike`, `Killing Blow` and `The Final Study` still carry a
  live, clickable `damage` formula on the item that duplicates what the rider applies; the only
  guard is a chat note. Whatever R-120 decides, the reshaped talent should drop the decoy or the
  note should stay prominent — it is a double-count surface.
- **Risen Servant's immunities.** `deity-death.json` sets `conditionImmunities: "frightened,
  compelled, disoriented"` on the summon, and `adversaries.json`'s own schema note says
  `frightened` / `compelled` are Edha-custom and not valid system ids — a bench check that the
  immunity binds rather than being silently dropped is filed as a 🤖 row.
- **A typo.** `Counterspell`'s cost read "1 Investiure"; fixed in this PR (card text, REBUILD
  leyline — the same rebuild the path descriptions already need).

## 8. What this review did not do

- It did not model hit chances, enemy Deflect values, or adversaries — every line is "if it
  lands", and R-101 keeps adversaries out of the yardstick.
- It did not convert control or support into damage. Where it says "about three expected points"
  it means the expected value of one binary flag on one d20 roll, nothing subtler.
- It did not play anything. Every number is a card read; the 🤖 rows that exist for the talents it
  names still need their bench runs.
- It did not propose changes to published heroic talents (§4) or re-open any answered ruling.

## 9. The rulings this review files

| ruling | tree | recommended default | deploy |
|---|---|---|---|
| R-120 | Knowledge | (b) `Predatory Strike` = one `[Tier][Die]` + Tier per Insight; the cash-outs keep the dice multiplier | DATA, REBUILD deity |
| R-121 | Power, Destruction | (a) one income clause each (`Warlord's Advance` on a kill; `Concussive Yield` on a multi-hit) | DATA, REBUILD deity |
| R-122 | Chaos | (a) Omen cap = tier + 1; `Isolating Pressure` places an Omen on an unmarked target | DATA, REBUILD deity |
| R-123 | Blue, Life | (a) `Ghostly Walls` → Blue 2+; `Adaptive Mutation` → Green 2+ | DATA, REBUILD leyline + deity |
| R-124 | Civilization | (b) accept the whole-attack Deflect bypass as designed and document the two-attack Construct as the tree's ceiling | DOCS-ONLY |
| R-125 | Power | (a) Frightened → Disoriented on `Kneel` and `Absolute Authority` (or (b) document it as the GM-applied marker it was built as) | DATA, REBUILD deity |

Plus one note into an open item: fold the vestigial-entries retune and `Expose`'s reach into item
106's design gate (finding 4). Nothing in this file changes a talent; every proposal waits for a
yes.
