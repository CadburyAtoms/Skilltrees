# Critique — an independent check of the seventeen rulings (2026-09-12)

The review's numbers were already re-run and matched by an earlier session. What had not been
done was a judgment of whether the *conclusions* are right. This file is that judgment. Every
claim below was re-derived from the talent text (`data/leyline.json`, `data/cosmere.json`,
`data/domain.json`, `data/authored/`), the engine sources under `module-src/scripts/engine/`,
and the cosmere-rpg 2.1.0 system bundle and Foundry 13.351 core in Ben's install — never from the
README. Where a ruling is marked WEAKENED or WRONG, the ruling in `EDHA_RULINGS.md` and the
README carry a dated ⚠️ note pointing here; the Ask/default shape of every ruling is kept.

**Verdict vocabulary.** HOLDS — the evidence is true and sufficient and the default is the best
option. WEAKENED — a load-bearing number or premise is wrong or thin, but the ask survives and the
default survives or changes only in emphasis. WRONG — the load-bearing claim is false under the
rules the table actually plays, or the default would do harm.

## The table

| Ruling | Verdict | One line |
|---|---|---|
| R-95 Momentum's Edge | **HOLDS**, stronger | The rider cannot resolve: Foundry 13 turns the object into a rune-wrapped JSON blob, so the Strike's damage roll fails whenever the 20 ft trigger is met. Walk rate is a table, not `20 + 5·SPD` — 25 at SPD 2. |
| R-96 Blue / White damage | **WEAKENED** | "Two in twenty-five" counts standalone Actions only; the guide's own definition of a Special is an on-turn play, and White has five. Inclusive count 7 of 25, still last but by one talent. Reason 2 rests on a false claim. Minimal set proven safe by mutation. |
| R-97 Sovereignty | **HOLDS** | Rescored blind: 13 again. "No independent effect" is wrong in wording — Sovereign's Favor is unmediated temp HP — but the ranking stands. Default (a) needs the moving-radius constraint. |
| R-98 Blue collision | **WEAKENED** | The pair is real (both write the same next-test disadvantage). The reason for narrowing away from the summing channel is false: seven player talents use it today. |
| R-99 Deity gates | **HOLDS** | Verified against the authored rules; nothing to add. |
| R-100 Advantage | **HOLDS**, one caveat | Tri-state confirmed in the system source. Under SR p.18's 1-for-1 cancel, two advantages beat one disadvantage; the engine's fold cancels that case to nothing. |
| R-101 Adversary yardstick | **HOLDS** | A scope ruling; the biggest blind spot found here was action semantics, not adversary numbers. |
| R-102 Shared talents | **HOLDS** | Data as stated. |
| R-103 Scholar downtime | **HOLDS** | Data as stated. |
| R-104 Intent drift | **HOLDS** | A judgment; the one over-reach (Blue's plot die) is already caveated. |
| R-105 Heroic flat vs leyline doubling | **WRONG** on "leyline ahead early"; default changed to (c) | The comparison dropped the weapon die and the system's `+ mod` on every hit. Per Action before level 6, a Strike with Mighty is at parity with Withering Ray and ahead of Searing Bolt. |
| R-106 Multi-enemy | **HOLDS** | The ten-tree zero list is text-true. The "only three repeatable plays before level 6" sub-claim undercounts by four or five. |
| R-107 Temp HP writers | **HOLDS** | Every cited line verified; exactly three talents reach the overwriting writer. |
| R-108 Deity Specials | **HOLDS** | 65 / 13 / 7 / 5 / 0 reproduced from the authored activation types. |
| R-109 Tier caps | **HOLDS** | `Trade Routes` reads "choose two of your active Foundations"; `Lay Foundation` sustains up to your tier. |
| R-110 Two advantages | **WRONG** on "worth nothing"; default changed | Both talents are manual, so the table plays SR p.18, where a second advantage is insurance against a disadvantage. The summing objection cites a channel seven talents already use. |
| R-111 Withering Ray | **WEAKENED**; default changed to (b) | Arithmetic true. Framing wrong: a three-Strike heroic turn is the same size, free, and every character has it. Once-per-turn would put Black below a Strike turn. |

Counts: 11 HOLDS, 4 WEAKENED, 2 WRONG. No ruling added or retired — 17 stay open.

---

## Per-ruling findings

### R-95 — HOLDS, and the implementation half is stronger than the ruling says

**Checked.** The rider is an `edha-damage-rider` with `bonusFormula: "@movement.walk.rate"` and
`whenMovedTowardFt: 20` (`data/authored/leyline-red.json`). Its path is `edhaRiderBonus` →
`edhaFoldRiderFormula` (`03-where-an-effect-lives.js:198–211`), which calls
`Roll.replaceFormulaData` with no `missing` option. The roll data is the actor's `system` object
spread into a plain object (`cosmere-rpg/index.js:9321–9324`; Foundry's `Actor#getRollData` is
`return this.system`, `foundry.mjs:41462`), so `movement.walk.rate` arrives as the
`DerivedValueField`-initialised object — a plain object with getters and no `toString`
(`index.js:7917–7962`). Foundry 13.351's `replaceFormulaData` handles an Object value by returning
`ᚖ{…json…}ᚖ`. That string contains no `@`, so `edhaFoldRiderFormula` hands it on as the resolved
rider, and `edhaWrapRollDamage` appends it to the Strike's formula (`03:223–233`). A formula
containing a rune-wrapped JSON object cannot parse.

**So the outcome is ECO-2's case (1)** — the damage roll errors — and it is worse than "the talent
silently does nothing": whenever a Red character has moved 20 ft toward the target, the *whole
Strike's damage roll* fails, not just the rider. The bench row still earns its place (to see how the
system surfaces the error), but the code path is deterministic.

**One number corrected.** The walk rate is not `20 + 5·SPD`. The system uses a table,
`MOVEMENT_RATES = [20, 25, 30, 40, 60, 80]` indexed by `ceil(SPD / 2)` (`index.js:8539–8542`):
SPD 0 → 20, SPD 1–2 → 25, SPD 3–4 → 30. At SPD 2 the rider would be **25**, not 30. Same order of
magnitude, same design problem. The "every other rider is worth 1–4" claim reproduces from the
authored `bonusFormula` set (Mighty `(1 + @tier)`, Kindle `@skills.red.mod`, Predatory Patience
`1d(2·rank+2)`, Volatile Strike half a rank die).

**Default.** (a) stands. `[Tier][Die]` is in family with Predatory Patience's `1d6` and keeps the
charge precondition as the price.

### R-96 — WEAKENED in its evidence; the conclusion (no damage; the minimal set) survives

**1. The census's exclusion rule contradicts the guide.** `agency-census.js` counts 1/2/3-Action
talents only, on the premise that Reactions, Specials, Free Actions and Passives are not "something
you CHOOSE to do on your own initiative". The leyline guide defines a Special as *"Spend [resource]
to modify [action you were already taking]… they ride on existing actions"*
(`leyline-revision-guide/SKILL.md:28`), and its first revision principle converts Actions *into*
Specials (`:88`). A Special that rides Draw Mana or your own influence test is chosen on your turn.
The census therefore penalises a tree for obeying the guide, and it does so most to the tree with
the most on-turn Specials — White.

**2. The re-count.** Counting every play a character can initiate on their own turn — Action-costing
talents, self-initiated Free Actions, and Specials that ride the player's own action or spend an
Opportunity — and excluding Passives, Reactions, and Specials that wait on someone else:

| Tree | narrow (Actions only) | inclusive | of 25 |
|---|---|---|---|
| White | 2 | **7** | 28% |
| Black | 6 | 8 | 32% |
| Scholar | 3 | 9 | 36% |
| Blue | 5 | 10 | 40% |
| Envoy | 3 | 10 | 40% |
| Green | 6 | 10 | 40% |
| Red | 4 | 11 | 44% |
| Hunter | 7 | 12 | 48% |
| Leader | 7 | 14 | 56% |
| Warrior | 13 | 14 | 56% |
| Agent | 4 | 15 | 60% |

White's seven: `Guiding Signal` and `Ordered Advance` (standalone), `Beacon of Stability` (rides
Draw Mana), `Overwhelming Authority` (rides your influence test), `Terms of Accord` (your own
agreement), `Collective Resolve` and `Mending Aura` (spend an Opportunity). White is still last —
but by one talent to Black, not by eleven to Warrior, and 28% not 8%. The honest version of the
headline is: **White has two standalone plays, three riders on Actions it takes anyway, and two
plays gated on the plot die.** Draw Mana itself — a self-initiated Action that heals every visible
ally for Tier — is excluded by both counts because it is the Key, which is the defence advocate's
point and is not answered by the census.

**3. Reason 2 for adopting the minimal set is false.** The ruling says the minimal set "is the
only set that keeps Blue off the summing channel", which is "proven on no player talent".
`edha-next-test-mod`'s summing `formula` field is carried today by **seven player talents**:
`Pack Hunting` (`heroic-hunter.json:524`, `@skills.sur.rank`), `Confident`, `Decisive`,
`Demonstrative` and `Shrewd Command` (`heroic-leader.json:138/277/359/853`, `1d(4 + 2·@owned)`),
`Tactical Ploy` (`heroic-leader.json:965`, **−1d4**, a summing *penalty* on a player card), and
`Overwhelm with Details` (`heroic-scholar.json:754`, `@skills.lor.mod`) — plus the adversary
`Probability Net` (`adversaries.json:260`). Reasons 1, 3 and 4 stand on their own; reason 2 should
be struck, and the same false premise appears in the primer, R-98 and R-110.

**4. The minimal set, checked.**
- *Read Intent to depth 1 as an OR parent of Pattern Recognition.* Mutated `data/leyline.json`
  (`Read Intent.connections = ["Forewarned"]`;
  `Pattern Recognition.connections = ["Calculated Patience", "Read Intent"]`), ran
  `scripts/validate.js` — **"Validated 4 files. 0 warnings."** — and `tests/run.js` — **1085
  passed**; then restored. Every `connections` entry joins ONE managed prerequisite group, OR
  within (`scripts/foundry-build.js:531–545`, `validate-build.py:124–129`), so the edit is legal.
  Regenerated dossiers put `Read Intent` at depth 1 / level 2; `Pattern Recognition` was already
  depth 1 / level 2 under `Calculated Patience`. Neither card names a talent in its prose prereq
  (both read `Blue 2+`), so iron rule 7's third case does not arise. Blue rolls Intellect
  (`foundry-build.js:82`, `blue: "int"`), so a `Read Intent` success is a Cognitive test and
  satisfies `Pattern Recognition`'s trigger; `Pattern Recognition` is wired as a self-confirmed
  prompt (`edha-prompt-pick`), so no cross-talent event is needed. **One correction:** the loop is
  a *level-3* loop (Forewarned L1 → Read Intent L2 → Pattern Recognition L3), not level 2.
- *Interposing Shield as a Special.* The engine never reads a talent's activation type when firing
  it: `edha-damage-react` rules are swept by `edhaWatchersOfRule` (`13-white-bulwark.js:160`) and
  nothing in the engine tracks or consumes a Reaction slot (no `"rea"` gate anywhere). Retyping it
  changes the card and the table rule, nothing in the engine — it will keep firing. The corollary
  is a gap the ruling's bench note should know about: the engine already posts *every* matching
  White reaction card on one hit, so "exactly one White mitigation fires per hit" is not
  engine-enforced today; the one-Reaction rule is played by hand.
- *Ordered Advance at 1 Action.* 1 Action + 1 Investiture for every ally within 10 ft to move half
  their Speed without provoking, once you also spend a Move. Strong but conditioned on formation
  and on your own move; not dominant over `Reckless Advance` (self, `[Size]` ft) or `Phantom Step`
  (free, `[Size]` ft). Acceptable.
- *Shared Burden at 1 Investiture.* It then costs what `Interposing Shield` costs and takes half
  the hit off the ally where the Shield takes ~1.5–2. The price is the White mage's own HP, and
  Order's `Shoulder the Oath` already does the same for a heal bonus. Not dominant; and once the
  Shield is a Special the two stack on one hit by design.

**5. The matrix argument is at the noise floor** — see the rescore below. "Blue 28 and White 27
against Red 25" becomes 28 / 26 / 27 on a blind rescore; the three trees are within the rubric's
resolution of each other. "Paid for in breadth" should read "comparable in breadth".

**Verdict.** WEAKENED. The conclusion — no damage; land the minimal set; escalate on evidence —
survives, and is if anything better supported by the inclusive count (White's problem is that
five of its seven plays are riders or plot-die-gated, which damage would not fix). The ruling text
now says so.

### R-97 — HOLDS

**Rescore** (rubric from `review-workflow.js`): damage 0, scaling 0, control 1, **debuff 3** (five
talents, each −1 average per die; Black and Blue do it better), **protection 3** (`Sovereign's
Favor` grants `[Tier][Die]` temp HP on every `Exalt` — 3.5 at Tier 1, 9 at Tier 2, no roll —
plus `Edict of the Fallen`'s party temp HP), healing 0, buff 3, action economy 1, mobility 0,
zone 0, information 0, social 0, exploration 0, summons 0, resource 2. **Total 13** — identical to
the profile by a different route. Last in the deity atlas by four, per talent as well as in total.

**Two wording corrections.** "No independent effect of any kind" is false: `Sovereign's Favor`'s
temp HP is unmediated and visible (the problem ledger's own dropped item 9 says so). And the
d4/d12 clamp caps a two-step shift at ±2 average per die, and the whole ladder at 4, not "about
±3". Neither moves the verdict.

**The promise is verified**: the player-facing path description carries *"Signature resource:
Decree — a declared law projected within a radius"* (`INTENT-deity-Sovereignty.md`), and the deity
guide carries *"Decree zones"* and the loop (`DESIGN-GUIDE-CLAIMS.md:246–250`). No talent in
`data/domain.json` creates a zone.

**Default.** (a) stands, with the defence advocate's constraint attached: `Lay Foundation` and
`Ordained Ground` are already the same designate-a-square Free Action, so a Decree built as a
third square would create the corpus's worst duplication a third time. Build it as a radius that
moves with the arbiter, or a zone that steps dice rather than granting flat defence.

### R-98 — WEAKENED in its reasoning; the finding holds

The two rules are exactly as described: `Pattern Recognition` and `False Premise` both carry
`edha-next-test-mod {target: "victim", mode: "disadvantage", count: 1}` (the first with
`expireEndOfRound`), and `edhaNextModFoldMode` (`15-blue-calculation.js:235–243`) folds them to one.
The other three write different targets or different moments. The narrowing is right.

What is wrong is the *reason* the ruling gives for preferring (a) over (b): that the summing
channel "is used today by one adversary ability and no talent, so it is unproven on player
talents". Seven player talents use it (R-96 §3 above), including a summing penalty. The surviving
objection is only the design one — uncapped additive penalties — which is a preference, not a
finding. (a) is still the smaller change; (b) is more available than the ruling admits.

### R-99 — HOLDS

Verified against `data/authored/deity-*.json` by the earlier session; re-read for this critique:
`Sovereign's Favor` sizes off `@skills.white.rank`, which is the one White reference the audit
counts for Sovereignty. Nothing to add.

### R-100 — HOLDS, with one caveat

Tri-state confirmed: `AdvantageMode` is None / Advantage / Disadvantage; `configureModifiers()`
sets `d20.number = 2` with `kh` or `kl` (`index.js:4015–4032`), `hasAdvantage` reads the enum
(`:3786`), and the pre-roll derivation is a boolean pair (`:1932–1940`). The engine's fold is
`adv && dis → null` (`15-blue-calculation.js:241`).

The caveat: the printed rule (`cosmere-canon-reference/SKILL.md:480`, SR p.18) says advantages
and disadvantages *"cancel each other 1-for-1"* — so two advantages against one disadvantage is
one advantage at the table, and the engine's fold cancels that case to nothing. On any roll with
a disadvantage present, a second advantage source is worth something under the printed rule.
That does not change the collisions the ruling names (all advantage-on-advantage), but it is the
fact R-110 turns on.

### R-101 — HOLDS

Nothing to verify. Worth recording: the largest measurement error found in this critique was not
the missing adversary yardstick but the review's own action-type semantics (R-96) and its
omission of the weapon die (R-105). A yardstick pass should start from the turn ledger below.

### R-102, R-103, R-104 — HOLD

Data as stated (`shared-talents.js`, `combat-share.js`, the intent files). R-104's one over-reach —
Blue's plot die, which sits under a "reference, not law" header — is already caveated in the
ruling.

### R-105 — WRONG on "leyline is ahead early"; default changed to (c)

**What the comparison left out.** Every hit in cosmere-rpg adds the roller's skill modifier to the
damage roll: `formula: rollData.mod !== undefined ? \`${formula} + ${rollData.mod}\` : formula`
(`index.js:6845–6848`), where `mod = skill.rank + attribute.value` (`:7487–7500`). That applies
to a weapon Strike *and* to `Withering Ray`. The heroic talents in the table are riders on a
Strike, so their base is the weapon's die plus that mod; the ruling compared them to `Withering
Ray`'s dice alone.

**Per Action, levels 1–5** (rank 2, attribute 2, so mod 4; a d6–d8 weapon):

| play | dice | + mod | ≈ per Action | cost |
|---|---|---|---|---|
| heroic Strike | 3.5–4.5 | +4 | 7.5–8.5 | free, unlimited |
| Strike + `Mighty` | 3.5–4.5 + 2 | +4 | 9.5–10.5 | free, unlimited |
| Black `Withering Ray` | 7 (2d6) | +4 | 11 | ~1.5 HP a cast, Black vs Spiritual, vital |
| Red `Searing Bolt` | 3.5 (1d6) | +4 | 7.5 | 1 Investiture, Deflect applies |

Leyline is not ahead early. Black's one talent is at parity with a Strike-and-Mighty turn; Red's
is behind it. `Withering Ray`'s real edge is ignoring Deflect and targeting Spiritual defence, paid
in health — a type edge, not a size edge.

**At level 6** (rank 3, mod 5): `Devastating Blow` = weapon 4.5 + 2d8 9 + mod 5 = 18.5 for two
Actions, plus `Mighty` 2 per action = 22.5; `Withering Ray` = 4d8 18 + 5 = 23 for one Action.
Here leyline (Black specifically) does pull ahead per Action, and the "heroic dice are flat across
tiers 1 and 2" clause is literally true of the formulas — but `Mighty` scales with tier and the
weapon's own die is a growth channel leyline casters do not have.

**Default.** (b) — a tier-2 step for heroic riders — double-dips a growth channel heroic already
has (the defence advocate's fixRisks 5), and the level-1–5 premise that motivated it is gone.
Changed to **(c) accept and document**; (a) and (b) remain on the card as alternatives.

### R-106 — HOLDS on the count that matters; one sub-claim corrected

A full-text read of all 365 confirms the ten trees with **no** talent that damages more than one
enemy: White, Blue, Agent, Envoy, Hunter, Leader, Scholar, Fate, Life, Sovereignty. Warrior's is
`Meteoric Leap` (level 6). The party conclusion stands.

The sub-claim "before level 6 only three have a repeatable group play" undercounts. Also
repeatable before level 6: Destruction's `Fault Line` (L3, a 60 ft line, each character), `Pyre`
(L1, spreading dangerous terrain) and `Cascading Failure` (L3); Death's `Bone Garden` (L2, a
10 ft square for the scene); Civilization's `Bastion` (L3, every Foundation for the scene);
Power's `Unstoppable Advance` (L2, each enemy whose space you move through). Seven or eight,
not three. None of them is in a tree the party holds, so nothing changes for R-106's ask.

### R-107 — HOLDS

Every citation verified: the header's two contradictory lines (`28-temporary-hp.js:6` and `:13`),
`edhaWriteTempHp` (`:31`), `edhaGrantTempHpCross` (`51-green-restoration.js:93`, `wins = inc >
held`), heal overflow (`03-where-an-effect-lives.js:882`), `thpFromTotal`
(`53-native-event-system.js:3071`), the list-members grant (`33-triggered-effect-resolution.js:218`)
and the single-target replace (`:237`). Cross-checked against the data: the only authored rules
that reach `edhaWriteTempHp` are `Life Surge` and `Overgrowth` (`edha-overflow-thp`) and `Spoils of
Isolation` (`thpFromTotal`). `Investiture of Command` (`maxTargets: 3`), `Bear Witness`
(`list-members`) and `Sovereign's Favor` (`target: "victim"`, `53:48–56`) all route through the
keep-higher writer, as do `Bulwark Ground` (`43-fate.js:527`), `Death Ward` (`45-death.js:201`),
Power's on-kill grants (`47-power.js:394`) and `Final Decree` (`49-order.js:734`). Three talents,
exactly as the ruling says. Default (a) is right.

### R-108 — HOLDS

Reproduced from `activation.cost.type` across `data/authored/deity-*.json`: 34 one-Action, 21
two-Action, 10 three-Action (65), 13 Passive, 7 Free Action, 5 Reaction, **0 Special**. (The
source `action` field types `Walking Ruin` as a Passive where the authored overlay types it a Free
Action — a one-talent hygiene note, not a finding.)

### R-109 — HOLDS

`Trade Routes` (Civilization, depth 1, level 2): *"choose two of your active Foundations"*.
`Lay Foundation`: *"You may sustain up to your tier Foundations."* Tier is 1 until level 6
(`index.js:740–747`). Uncastable as stated. `Forge Construct` sustains a flat one. Default (a)
stands.

### R-110 — WRONG on "worth nothing"; default changed

Both talents are declared MANUAL in the heroic header (`16-heroic-paths.js:46–48` for `Fatal
Thrust`, `:91–92` for `Defensive Position`) and carry no events or effects, so the table plays the
*printed* rule, not the engine's fold. Under SR p.18 advantages and disadvantages cancel
one-for-one: a character with two advantages who is handed a disadvantage still rolls with
advantage; a character with one does not. "Two advantages" is therefore insurance against a
disadvantage, which is a real and common case (`Defensive Position`'s two disadvantages against
an attacker who has advantage from Prone or a stance, for instance). The card does not "say
something false"; it says something the engine cannot represent — and the engine is not involved.

The ruling's objection to the summing remedy — "a primitive that one adversary ability and no
talent uses today" — is the same false premise as R-96 §3 and R-98.

**Default changed.** From (a) "reword both to one advantage" — which would delete the insurance
value — to: **keep both cards as written and add one line to each, "advantages and disadvantages
cancel one-for-one; roll with whatever remains", plus a guide note that the engine folds
two-against-one to nothing and these two talents are played by hand.** The old (a), (b) and (c)
stay on the card as alternatives.

### R-111 — WEAKENED; default changed to (b)

**Arithmetic verified.** `(2 * @tier)d(2 * @skills.black.rank + 2)`: 2d6 = 7 at rank 2, 4d8 = 18
at rank 3 (`data/authored/leyline-black.json`). The HP cost rule is `floor(1d(2·rank+2) / 2)`:
average 1.5 at rank 2, 2.0 at rank 3. Its only other wired rule is `edha-single-target`. The
`oncePerTurn` key already exists in the engine and on seven authored rules, so (a) is an authoring
change, as stated.

**The framing is wrong.** A three-cast turn is not an outlier: every character can Strike three
times, and with the `+ mod` the ruling omitted (R-105) the two turns are the same size —
`Withering Ray` ×3 ≈ 33 vital versus Spiritual, at ~4.5 HP from a ~12 HP level-1 pool; Strike ×3
with `Mighty` ≈ 31 versus Physical, minus Deflect three times, free. Black's turn is bigger only by
what Deflect would have taken, and it costs roughly a third of the caster's health. The ruling's
"R-105's 'leyline is ahead early' rests mostly on this talent" is right, and R-105 is now WRONG on
that point for the same reason.

**Default changed.** (a) once per turn would put Black's signature line *below* a heroic
Strike turn, at an HP cost. Changed to **(b) keep it as it is and write it into the guides as the
leyline damage ceiling**, with the per-Action parity above as the reason; (a) and (c) remain.

---

## The four rules facts, checked at source

| Primer claim | Verified where | Result |
|---|---|---|
| Advantage is one binary scalar; disadvantage the same | `cosmere-rpg/index.js:4015–4032` (`configureModifiers`), `:3786`, `:1932–1940`; `15-blue-calculation.js:235–243` | **True** in the implementation. The printed rule cancels 1-for-1 (canon reference `:480`), which the engine's fold does not represent for two-against-one. |
| One Reaction per round | `cosmere-canon-reference/SKILL.md:114` ("one per round by default") | **True as a rule**; **not enforced by the engine** — no reaction-slot tracking exists, and the damage-react dispatcher posts every matching card. |
| Draw Mana is 1 Action for Tier Investiture; max is 2 + max(AWA, PRE) | `52-green-instinct.js:277–280` (recover `tier`), `:486–488` (max), `docs/ACTOR_STAT_DERIVATION.md:82`; the Draw Mana item is built as one universal Action (`foundry-build.js:404`) | **True.** |
| Level 6 is a double step | `index.js:740–747`: level 6 is the first row with `tier: 2` and `maxSkillRanks: 3`; attribute points at 3, 6, 9 | **True**, for every skill (so for heroic gates too — the primer's "not for heroic" applies only to heroic *damage formulas*, which carry no rank term). |

One correction to the primer: its stacking-alternative paragraph says the summing `formula` channel
is "used by one adversary ability (`Probability Net`) and by no talent". Seven player talents use
it (R-96 §3). Noted in `SYSTEM-PRIMER.md`.

## The capability matrix — a blind rescore of three trees

Scored from talent text alone on the `review-workflow.js` rubric, before re-reading the profiles.

| Tree | profile | rescore | axes that moved |
|---|---|---|---|
| leyline/White | 27 | **26** | debuff 2 → 1 (one pure debuff, at level 6) |
| leyline/Red | 25 | **27** | scaling 3 → 4 (four `[Tier][Die]` sources repeatable every round); mobility 2 → 3 (three self-moves incl. a free half-Speed move) |
| deity/Sovereignty | 13 | **13** | debuff 4 → 3; protection 2 → 3 (`Sovereign's Favor` every turn) |

Two scorers landed within ±2 on all three trees, which is about the rubric's resolution. That is
good news for the profiles and bad news for the one sentence in R-96 that leans on the ordering:
Blue 28, Red 27, White 26 are not distinguishable. Sovereignty's 13 is robust — it is four below
the next deity tree under either scorer.

## The engine claims, with lines

- **R-95 path**: `03-where-an-effect-lives.js:175` (`whenMovedTowardFt` gate), `:198–203`
  (`edhaFoldRiderFormula`, `replaceFormulaData` without `missing`), `:204–211`, `:223–233`;
  `19-red-momentum-frenzy.js:224–227` (the comment that names the object); Foundry
  `replaceFormulaData` (rune-wrapped JSON for an Object); system `index.js:7917–7962`
  (`DerivedValueField`), `:8397` (the field), `:8462` (derived from SPD), `:8539–8542` (the
  table). The test-rider path, `01-shared-core.js:724`, is a different family and passes
  `missing: "0"`, which does not help here: the key is present.
- **R-107 writers**: listed under R-107 above.
- **R-98 / R-110 summing channel**: `15-blue-calculation.js:259–271` (term concatenation, item 49);
  consumers with a `formula`: `heroic-hunter.json:524`, `heroic-leader.json:138, 277, 359, 853,
  965`, `heroic-scholar.json:754`, `adversaries.json:260`. Two Red rules (`Emotional Overload`,
  `Reckless Gambit`) carry an empty `formula` field and use `mode` only.

## The defence advocate, and the dropped items

**Arguments dismissed too easily.**
1. *White's Draw Mana turn is not a dead round* (intentional 8, caseFor… WHITE). The ledger says
   this "did not survive review" — but the only instrument that overruled it was the agency census,
   whose exclusion rule this critique finds unsound. The argument is correct as far as it goes:
   White's refuel Action is a party heal, and `Beacon of Stability` rides it. It does not dissolve
   the agency point (the advocate concedes that itself), but it belongs in R-96's text as a fact,
   not as a defeated objection.
2. *Un-flattening heroic damage double-dips* (fixRisks 5). Correct, and it is the reason R-105's
   default changes.
3. *Read the token before rewriting the number* (fixRisks 9). Half right: the "Speed = skill
   modifier" reading was correctly rejected by the review, but the advocate's instinct that the
   card was fine was closer than the ruling's "+25–30" framing, because the value was never going
   to resolve at all.
4. *A Decree zone as a third designate-a-square* (fixRisks 2). Right, and now attached to R-97.
5. *The summing channel is unproven on player talents* (fixRisks 4). The advocate made the same
   error as the review; both are corrected here.

**Dropped items, re-read.** Nine of the eleven were dropped rightly. Two were not:
- **Dropped 8** ("White out-contributes Red at Tier 2 by 2:1") was withdrawn on four grounds that
  are all sound — but the *inverse* comparison, which the review kept, has the same defect. Its
  "leyline ahead early" table omits the Strike's base and mod. The standard applied to the dropped
  item should have been applied to R-105.
- **Dropped 9** ("Sovereignty does nothing for its owner / every effect is mediated") was dropped
  correctly, and then the README's finding 5 and R-97 kept saying "no independent effect of any
  kind". The dropped item's correction did not propagate.

## What a 365-talent text review structurally cannot see

- **Nothing was measured at a table.** Every number here is a *count of talents*, and a count of
  talents is not a rate of play. A tree with two standalone Actions that a player uses every round
  may feel busier than one with seven the player never reaches for. The review's most-cited
  number (R-96) is exactly the kind that play would revise first.
- **Adversary numbers were fenced out** (R-101), so no damage or mitigation figure has a
  denominator. The critique's own per-Action table is an internal comparison only.
- **The rubric is combat-shaped.** Fifteen axes, eleven of them combat; Scholar's and Blue's best
  work sits on the other four. Two scorers agreeing within ±2 shows the rubric is repeatable, not
  that it is right.
- **Action-type semantics were assumed, not read.** The single largest error found here — that a
  Special is "not chosen on your turn" — came from a premise nobody checked against the guide's
  own definition. A text review inherits the reviewer's model of the rules.
- **Formulas were compared without their base.** Riders were compared to standalone spells as if
  both stood alone (R-105, R-111).

**The one follow-up measurement that would most change a decision: a turn ledger.** Over the next
three fights, for every PC turn, record which of the three Actions went to (i) a talent on the
sheet, (ii) Draw Mana or a standard action, (iii) nothing useful. Twenty rows per PC. That number
— the share of Actions a sheet actually fills — is what R-96 is guessing at from a talent count,
and it settles whether White's seven plays are used or merely present. It also gives R-106 its
missing input (enemies per encounter) for free, and it costs the table nothing.

## What was corrected in place (all DOCS-ONLY)

- `EDHA_RULINGS.md`: ⚠️ notes on R-95 (walk-rate table; the roll fails), R-96 (census rule,
  inclusive count, reason 2, level-3 loop, engine facts on the retype), R-97 (wording; radius
  constraint), R-98 (summing-channel premise), R-100 (1-for-1 caveat), R-105 (default → (c)),
  R-106 (pre-L6 count), R-110 (default → keep the cards, add the cancel line), R-111
  (default → (b)). Ask/default shape kept on every ruling; 17 remain open.
- `README.md`: matching ⚠️ notes under findings 1, 3, 4, 6, 10, 11 and the heroic-vs-leyline
  damage section.
- `SYSTEM-PRIMER.md`: the summing-channel sentence.
- `EDHA_FOUNDRY_TEST_CHECKLIST.md`: ECO-2's expected outcome now names case (1) as what the code
  predicts.
