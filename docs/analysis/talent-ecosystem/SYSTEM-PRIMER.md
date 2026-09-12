# System primer — the rules a power judgment rests on

Copied into every dossier by `derive-dossiers.js`. Every line here is checked against a named
source; where two repo docs disagree, the disagreement is recorded rather than resolved silently.
**Treat this as the shared frame.** A profile that judges a talent's power without these numbers
is guessing.

## Action economy

* **3 Actions per Slow turn, 2 Actions per Fast turn.** Fast turns resolve before Slow turns.
  (`.claude/skills/leyline-revision-guide/SKILL.md` §Action Economy; corroborated by the canon
  Stunned condition — "gain two fewer actions" — and Surprised — "gain one fewer action".)
* **1 Reaction per round** per creature unless a talent says otherwise. This is a hard cap and it
  is load-bearing: a tree with seven Reaction talents can still only use ONE per round.
* **Special** is the workhorse action type in official Cosmere design — it rides on an action you
  were already taking and costs nothing extra. A Special is worth materially more than an Action
  of the same effect size.
* Standard actions, all available to every character without any talent:
  Strike (1▶), Move (1▶), Interact (1▶), **Gain Advantage (1▶)**, Grapple (1▶), Shove (1▶),
  Brace (1▶), Disengage (1▶), Ready (1▶ + readied cost), Recover (2▶), Use a Skill (1▶);
  reactions Dodge (1 focus), Aid (1 focus), Reactive Strike (1 focus), Avoid Danger; free actions
  Banter, Drop. (`.claude/skills/cosmere-canon-reference/SKILL.md` §Standard Actions.)
  **A talent that reproduces a standard action is worth roughly zero.** In particular, every
  character can already Gain Advantage as a 1-Action skill test, and every character can already
  Aid an ally for 1 focus as a Reaction.

## Advantage — binary, not stacking. This is the single most load-bearing fact here.

The cosmere-rpg system 2.1.0 implements advantage as a **tri-state** (`AdvantageMode` =
None / Advantage / Disadvantage), and `configureModifiers()` does exactly this:

```js
if (this.hasAdvantage)      { d20.number = 2; d20.modifiers.push('kh'); }
else if (this.hasDisadvantage) { d20.number = 2; d20.modifiers.push('kl'); }
else                        { d20.number = 1; }
```

(`<FoundryData>/systems/cosmere-rpg/index.js`, system 2.1.0 — the version Ben runs.)

**The Edha engine has already had to solve this**, which settles it beyond doubt.
`module-src/scripts/engine/15-blue-calculation.js` carries `edhaNextModFoldMode`, whose own
comment reads: *"fold a list of MATCHING entries into the one advantageMode the system can hold.
Boolean-OR per direction; both directions present cancel to null."* Two advantage sources fold to
one advantage. An advantage and a disadvantage cancel to nothing.

**Disadvantage is the same scalar**, so everything below applies to it equally — which matters,
because imposing disadvantage is leyline/Blue's main lever and Blue has five talents that do it.

Consequences you must reason with:

* **A second source of advantage on the same roll is worth literally nothing.** Not diminishing —
  zero. Two talents that both grant an advantage on the same test are not additive; they are
  redundant.
* Advantage and disadvantage **cancel 1-for-1** (`cosmere-canon-reference` §advantage/disadvantage,
  SR p.18), and the implementation reflects this: net state, not a count.
* Therefore "N talents grant an advantage" is NOT a measure of N units of value. Judge advantage
  granting by *how often it is the ONLY source in that moment*, and by whether the tree also
  supplies something to spend it on.
* Caveat worth stating where it matters: this is the implemented behaviour. If the printed rules
  stack advantages, the table still plays the implementation. Flag it rather than assuming.
* **There IS a stacking alternative already in the engine.** `edha-next-test-mod` also carries a
  `formula` field — a dice/flat modifier on the next test (`−1d6`) applied by term concatenation,
  and item 49 made those **SUM**: "every matching entry appends its own term". It is currently
  used by one adversary ability (`Probability Net`) and by no talent. So a designer who wants a
  penalty that stacks does not need new engine work — the primitive exists.

## Resources

| Resource | Max | Refill |
|---|---|---|
| **Health** | advancement table, `10 + STR` at L1 | recovery die (WIL ladder: 0–1 d4, 2–3 d6, 4–5 d8, 6–7 d10) |
| **Focus** | `2 + WIL` | rests |
| **Investiture** | `2 + max(AWA, PRE)`, only if attuned (~4 at L1) | **Draw Mana**, and talents |

(`docs/ACTOR_STAT_DERIVATION.md` — the authority; `edhaDeriveInvestiture` writes the Investiture
override.)

**Draw Mana** — the leyline economy, and the number most power arguments turn on:

> 1 Action: recover Investiture **equal to your Tier**, and trigger your colour's Attunement rider.

(`module-src/scripts/engine/52-green-instinct.js` `edhaDrawMana`, and
`.claude/skills/leyline-revision-guide/SKILL.md` §Key Mechanic.)

So at **Tier 1 (levels 1–5), Draw Mana converts 1 Action into 1 Investiture.** A leyline character
whose kit costs 1 Investiture per Action can spend their starting pool (~4) and then sustains at
best **50% uptime** — one Action drawing, one Action spending. At Tier 2 it is 1 Action for 2
Investiture, so 2/3 uptime. Bonus-regen talents are the lever that breaks this; count them.

The five Attunement Keys are Always Active, cost nothing, and are granted free with the path:

| Colour | Draw Mana rider |
|---|---|
| White | allies you can see within Attunement Range regain Health equal to your tier |
| Blue | gain an advantage on your next Cognitive test |
| Black | enemies you can see in Attunement Range with **no ally within 5 ft** become Weakened |
| Red | gain an advantage on your next Physical test; **lose your Reaction** until your next turn |
| Green | create difficult terrain within [Size] of a point in Attunement Range |

## Scaling notation

* **[Die]** = rank die: d4 (rank 1), d6 (2), d8 (3), d10 (4), d12 (5). `half [Die]` rounds down.
* **[Tier][Die]** = that many rank dice — at Tier 1 rank 2 that is `1d6`; at Tier 2 rank 3, `2d8`.
* **[Size]** = 2.5 / 5 / 10 / 15 / 20 ft by rank.
* **Attunement Range** = 15 / 30 / 60 / 90 / 120 ft by rank.

**Tier / rank-cap table — use this one:** Tier 1 = levels 1–5, max skill rank **2**;
Tier 2 = levels 6–10, max skill rank **3**. (`docs/ACTOR_STAT_DERIVATION.md`, derived from the
system's own advancement table.)

> ⚠️ Doc drift, recorded not resolved: `.claude/skills/leyline-revision-guide/SKILL.md` says
> "Tier 1 = levels 1–4, Tier 2 = levels 5–9". The `ACTOR_STAT_DERIVATION` table is derived from the
> shipped system and wins. The dossiers' `earliest L` values use the L1–5 / L6–10 split.

Practical consequence: a level-1–5 character is **rank 2 at best**, so `[Tier][Die]` is `1d6`
for the whole of the level range this review is about. The rank-3 gate on deep leyline talents is
a **level 6** gate, and it upgrades the die to d8 *and* doubles the tier multiplier at the same
step — leyline power is discontinuous at L6 in a way heroic power is not.

## Damage types

* **Impact, Keen, Energy** — reduced by Deflect.
* **Vital, Spirit** — ignore Deflect entirely. Materially stronger per die; the design guides say
  to use them sparingly. Weigh a `[Tier][Die] spirit` well above a `[Tier][Die] impact`.

## Conditions worth pricing

Disoriented (no reactions, obscured senses), Restrained (movement 0, disadvantage on everything
but escape), Immobilized (movement 0), Slowed (movement halved), Prone, Stunned (lose reaction,
two fewer actions), Surprised, Weakened, Exhausted[−X] (cumulative), Afflicted[X] (ongoing damage),
Focused (talents cost 1 less focus), Determined, Enhanced[+X], Empowered.
(`cosmere-canon-reference` §Conditions.)

Action denial (Stunned, Disoriented, Restrained) is the most valuable category in a 3-action
economy — removing one enemy Action is worth about a third of an enemy turn.

## Stated design intent about relative power (this is a designer claim, hold it to account)

From `.claude/skills/leyline-revision-guide/SKILL.md` §Revision Principles:

* **"Leyline mages are mortal. Comparable to Heroic path characters, not Radiants… Strong and
  versatile, but human-scale. Radiant-equivalent power lives in the Deity Domain trees."**
  So leyline↔heroic parity IS the stated target, and deity trees are *intended* to be stronger
  per talent. A deity talent out-powering a leyline talent is design working, not a bug — but
  9 deity talents outclassing 25 leyline talents in TOTAL would be.
* Action-type targets for leyline: ~35% Passive, ~25–30% Special, ~15% Action, ~8% 2-Action,
  ~5–8% Free, ~5–8% Reaction, **0% 3-Action**.
* Description target: 20–25 words. Cost scale: 1 = routine, 2 = significant, 3 = a big play.
* Colour boundaries are explicit: "Green heals deeply (and removes Injuries); White heals
  shallowly (and cannot remove Injuries). Black isolates; Green clusters. Blue manipulates
  probability; Red escalates momentum."

From `.claude/skills/deity-revision-guide/SKILL.md`: 3-Action costs exist in deity design **for
the capstone slot only**, one per tree at most.

## Scope fence

This review covers the **365 Edha talents only**. Adversary statblocks, `docs/levelup-builds.json`
PC ladders, and the system's own native talent compendium are **out of scope by the designer's
ruling** — do not read them and do not condition a finding on them. Where a question genuinely
cannot be answered without them (e.g. "is 1d6 a lot against a real enemy?"), say so and say what
would settle it, rather than reaching outside scope.
