# Talent ecosystem review — tooling and measured ground truth

**Status: interim.** The deterministic measurements below are complete and re-runnable. The
21-tree agent review (`review-workflow.js`) had not finished when this landed. Nothing here
proposes a change to any talent; it is measurement only.

Started 2026-09-09 from Ben's ask: *"what's the damage distribution between trees? do heroic and
leyline paths feel similar in power at similar points along the tree? do deity paths feel similar
to each other? are there synergies between paths?"* — triggered by a pre-session-one review
finding two PCs in paths with no damage talents (White and Blue).

Scope ruled by Ben: **the 365 talents only.** Adversaries, PC build ladders and system-native
talents are explicitly out. Ben also ruled that **adding damage to Blue and/or White is on the
table** — the no-damage identity is not fixed.

## How to run it

```
node docs/analysis/talent-ecosystem/derive-dossiers.js   <outdir>       # 21 per-tree dossiers + intent files
node docs/analysis/talent-ecosystem/damage-census.js     <outdir>       # damage classifier
node docs/analysis/talent-ecosystem/functional-overlap.js <outdir>      # tree-vs-tree overlap
```

`derive-dossiers.js` is the useful one beyond this review: it joins `data/leyline.json`,
`data/cosmere.json`, `data/domain.json` and the `data/authored/` overlay into one row per talent,
and computes two things the raw data does not carry:

* **depth** — how many talents in the same tree you must own first. Mirrors the requirement model
  in `scripts/validate.js` / `scripts/validate-build.py`: every `connections` entry that resolves
  inside the tree is ONE managed prereq group satisfied by owning any member (iron rule 7), each
  prose prereq group is its own group, AND across groups.
* **earliestLevel** — earliest character level that can hold the talent: 1 talent per level from
  level 1, plus the rank gate (a `Colour 3+` prereq is unreachable before level 6, because the
  skill rank cap is 2 up to level 5 and 3 from level 6).

## Measured ground truth

### Damage — count only talents that CREATE damage

The word "damage" hides four different things, and conflating them is what produced the original
"White has no damage talents" read. The classifier separates: **source** (the talent creates
damage), **amplify** (adds to an attack you were already making), **mitigate** (reduces damage),
**die-size** (Sovereignty's whole kit).

| Tree | Damage sources | of | |
|---|---|---|---|
| leyline/Red | 8 | 25 | the only real leyline damage tree |
| leyline/Black, leyline/Green | 3, 3 | 25 | |
| leyline/White | **1** | 25 | `Retributive Guard` only |
| leyline/Blue | **0** | 25 | |
| heroic/Hunter | 3 | 25 | |
| heroic/Warrior | 2 | 25 | |
| heroic/Agent, Envoy, Leader | 1 each | 25 | |
| heroic/Scholar | **0** | 25 | |
| deity/Knowledge … deity/Fate | 7 … 1 | 9 | |
| deity/Sovereignty | **0** | 9 | |

Three corrections to the framing the review started from:

1. **There are three zero-damage trees, not two, and the third is a deity tree.** Blue, Scholar and
   **Sovereignty**. All nine Sovereignty talents move a damage die size up (ally) or down (enemy);
   it is the only tree that deals no damage *and* has no independent effect — purely parasitic on
   someone else's attack. Every other deity tree has 4–8 damage sources out of nine.
2. **White is a different problem from Blue.** White has one damage source; its other five
   damage-mentioning talents are mitigation (`Shield Wall` reads "deal half [Tier][Die] **less**
   damage"). White's distinguishing number is elsewhere: **40% of White is trigger-gated** — 7
   Reactions plus 10 talents that only fire when an ally or enemy acts first, against 4–16% for
   every other tree. White's kit is hostage to enemy targeting, which is not a damage problem.
3. **"Damage talents" is not a valid cross-atlas unit.** Warrior has 2. Heroic damage does not live
   in talents — it comes from the base system's weapon attack, which heroic talents *amplify*
   (`Devastating Blow`: "rolling an extra 2d8"). Leyline and deity talents *are* the damage source.
   Per-talent, deity is ~3x denser in damage than leyline and ~7.5x denser than heroic, but that
   partly measures where each atlas puts its damage, not what a character ends up doing.

### Blue vs Scholar — the measure depends on controlling for atlas vocabulary

* Raw mechanical vocabulary: **cos 0.42, rank 130 of 210 pairs** — not similar.
* Controlled for atlas vocabulary (leyline says "Investiture"/"Attunement Range", heroic says
  "focus" + skill names; that confound alone separates the atlases): **cos 0.82, rank 8 of 210**.

Reading both trees directly: Scholar is a crafter/medic (7 Artifabrian fabrial talents, 7 Surgeon
healing talents), Blue is precognition/illusion. They are not the same tree, but they collide in
one place with a system-wide cause behind it — see Advantage below. `White <-> Leader` is rank
167/210, so that pairing is *not* a problem.

### Resource economy — where the synergy answer actually lives

Producer/consumer counts across all 365 talents:

| Resource | Produced by | Consumed by |
|---|---|---|
| **Advantage** | 42 talents, 10 trees | **4 talents, 2 trees** |
| Investiture | 7 talents (bonus regen only) | 122 talents, 15 trees |
| Focus | 14 talents | 59 talents, 9 trees |
| Omen | Chaos only | Chaos only |
| Quarry | Hunter only | Hunter only |
| Fabrial | Scholar only | Scholar only |
| damage die size | Sovereignty only | Sovereignty only |

* **Advantage is the most over-produced currency in the system** — everyone grants it, almost
  nothing keys off having it. Blue has 8 advantage-granting talents, Scholar 2 plus two that
  trigger off "after you Gain Advantage". They feel same-y because both stand in the most crowded,
  least-rewarded space in the game.
* **Cross-atlas synergy is suppressed by construction**: leyline and deity run on Investiture,
  heroic runs on Focus. The pools barely touch.
* **Four sealed loops** (Omen, Quarry, Fabrial, die-size) are produced and consumed by exactly one
  tree each and generate no cross-path play at all.
* Investiture is pool-based (`2 + max(AWA, PRE)`, ~4 at level 1) refreshed by the Draw Mana action.
  Seven talents give bonus regen — Black, Red and five deity trees have one each. **Blue and White
  have none**, while Blue has 13 Investiture-costing talents and White 12.

## Known limits of these measurements

* The classifiers are regex over talent text. `Shield Wall` ("deal half [Tier][Die] **less**
  damage") read as a damage SOURCE until a `less/no/half damage` guard was added — that is the bug
  that made White look like it had 2 damage talents when it has 1. It is fixed; assume others of
  the same shape exist, and check any load-bearing number against the talent text before acting
  on it.
* Cosine similarity over a curated vocabulary is a proxy for overlap, not a verdict. It is useful
  for ranking pairs, not for settling one.
* Nothing here measures what a character actually does at the table, only what the talent data says.
