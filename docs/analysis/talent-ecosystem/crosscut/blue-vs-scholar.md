# Blue vs Scholar head-to-head (the trigger question)

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `blue-vs-scholar`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# Blue vs Scholar — head-to-head

**Sources read in full:** `dossier/leyline-Blue.md` (25), `dossier/heroic-Scholar.md` (25), `dossier/leyline-White.md` (25), `dossier/heroic-Envoy.md` (25), `dossier/deity-Order.md` (9), `SYSTEM-PRIMER.md`, `DESIGN-GUIDE-CLAIMS.md`, `INTENT-leyline-Blue.md`, `INTENT-heroic-Scholar.md`, `INTENT-leyline-White.md`, `INTENT-heroic-Envoy.md`, `advantage-ledger.md`, plus re-runs and rebuilds of `docs/analysis/talent-ecosystem/functional-overlap.js` against `all-talents.json`.

---

## 0. VERDICT

**DISTINCT. Confidence: high (0.85).**

Blue and Scholar share **one verbatim talent out of fifty** (`Collected`, which is in five trees) and **one near-verbatim talent** (Blue's `Composed` / Scholar's `Clear Mind`, a +focus stat stick that exists in five trees). Every other correspondence is loose. On a repaired similarity vector the pair falls from **rank 10 of 210 to rank 111 of 210** (§6).

The three talents that drive the verdict:

| Driving talent | Why it decides |
|---|---|
| **Scholar — Swift Healer** (Free Action, 1 focus, L2) | Turns Field Medicine into a free-action heal of `recovery die + Medicine ranks ×2 + Lore ranks`. Blue has **zero** healing of any resource. This alone means the two characters are not doing the same job in a fight. |
| **Blue — Probability Cascade** (Special, Opportunity + 1 Inv, L4) | Disadvantage on a target's *next two tests*. Scholar's entire debuff bench is one Passive (`Keen Insight`) and one Exhausted rider (`Anatomical Insight`). Blue's core loop has no Scholar analogue. |
| **`Collected` (verbatim, both trees)** | The *only* hard overlap — and it is generic filler present in Blue, Green, Agent, Envoy and Scholar. It is evidence of a shared-stock problem across the whole atlas, not of a Blue/Scholar identity collision. |

**But the designer's instinct is not wrong — it is pointed at the wrong axis.** The thing that makes Blue and Scholar feel the same at the table is not overlap, it is **shared absence** (§7). Both put a character at the table who cannot reduce an enemy's HP. That is a negative-space collision, and it needs a different fix from a positive-space one.

---

## 1. Correspondence table — BLUE → nearest Scholar equivalent

Grades: **IDENTICAL** (verbatim), **NEAR** (same effect, trivial wording delta), **TWIN** (same mechanical output, different trigger or currency), **COUSIN** (same trigger or same fantasy, different output), **NONE**.

| # | Blue talent (action / cost / depth / true L) | Nearest Scholar talent | Grade | Note |
|---|---|---|---|---|
| 1 | Calculated Patience (∞ / — / d0 / L1) | Know Your Moment; Turning Point's slow-turn clause | COUSIN | Both reward going late. Blue = advantage on one test; Scholar = +2 all defenses until your turn. |
| 2 | Forewarned (∞ / — / d0 / L1) | — | NONE | Declare a character + action type; if it happens, **gain 1 Reaction**. Nothing in Scholar predicts. |
| 3 | Phantom Double (2A / 2 Inv / d0 / L1) | — | NONE | Blue is the only tree in 365 that creates illusions. |
| 4 | Blue Leyline Attunement (Key) | Erudition (Key) | NONE | Same *slot*, zero shared function. Blue's Key = advantage on next Cognitive; Scholar's = two reassignable skill ranks. |
| 5 | **Pattern Recognition** (Special / 1 Inv / d1 / L2) | **Keen Insight** | **TWIN** | Both: land a cognitive-flavoured action → enemy's next test has disadvantage. Closest pair in the two trees. |
| 6 | Intercept (Reaction / 1 Inv / d1 / L2) | — | NONE | Rides Forewarned. |
| 7 | Reactive Analysis (Special / 1 Inv / d1 / L2) | — | NONE | Monetises other people's failed tests. Scholar's Contingency reacts to an *ally's* Complication — opposite direction. |
| 8 | Telepathic Network (2A / 2 Inv / d1 / L2) | Erudition / Deep Study | COUSIN | The only shared noun is *expertise*: Scholar **generates** it, Blue **distributes** it to allies. Complementary, not duplicate. |
| 9 | Phantom Barricade (1A / 1 Inv / d1 / L2) | — | NONE | Cover + blocks movement, 2[Die] HP. |
| 10 | Redirect Momentum (Reaction / 1 Inv / d1 / L2) | — | NONE | Forced movement; Scholar has zero. |
| 11 | Composed (∞ / — / d2 / **L6**) | **Clear Mind** | **NEAR** | Blue: "maximum focus by your tier". Scholar: "max **and current** focus by your tier". Scholar's is strictly better and reachable four levels earlier. |
| 12 | Counterspell (Reaction / 2 foc + 1 Inv / d2 / **L6**) | — | NONE | Only talent in 365 that makes another character's talent *fail during activation*. |
| 13 | False Premise (Reaction / 1 Inv / d2 / L3) | Keen Insight | TWIN | Second claimant on the same Scholar card. |
| 14 | Subtle Suggestion (Special / 1 Inv / d2 / L3) | — | NONE | Applies Disoriented. Scholar applies no conditions except Exhausted. |
| 15 | **Collected** (∞ / — / d2 / **L6**) | **Collected** | **IDENTICAL** | Verbatim. Also in Green, Agent, Envoy. Scholar's is at **L2**, Blue's at **L6**. |
| 16 | Probable Outcome (∞ / — / d2 / L3) | — | NONE | Change your fast/slow choice after everyone else has chosen. No Scholar turn-order manipulation. |
| 17 | Holographic Illusion (Free / 1 Inv / d2 / L3) | — | NONE | |
| 18 | Phantom Step (Passive / — / d2 / L3) | — | NONE | Ally mobility. Scholar has no movement talent at all. |
| 19 | Anticipate (Reaction / 1 Inv / d3 / **L6**) | — | NONE | Anti-influence. Scholar has none. |
| 20 | Baleful (∞ / — / d3 / **L6**, not L4) | Keen Insight (influence clause) | COUSIN | Both touch the influence subsystem from opposite ends. |
| 21 | Probability Cascade (Special / Opp + 1 Inv / d3 / L4) | — | NONE | |
| 22 | Read Intent (1A / 1 Inv / d3 / L4) | — | NONE | Atlas twins are deity/Order's Lawkeeper's Eye and deity/Fate's Read the Threads, not Scholar. |
| 23 | Ghostly Walls (1A / 2 Inv / d3 / **L6**) | — | NONE | |
| 24 | Living Image (Special / var. Inv / d3 / **L6**) | — | NONE | |
| 25 | Absolute Stillness (∞ / — / d4 / **L7**) | Strategize's reaction-denial clause | COUSIN | Both deny Reactions; Blue's is gated on 0 Speed, Scholar's on 2 focus and a granted advantage. |

**Blue totals: IDENTICAL 1 · NEAR 1 · TWIN 2 · COUSIN 4 · NONE 17.**

---

## 2. Correspondence table — SCHOLAR → nearest Blue equivalent

| # | Scholar talent (action / cost / depth / true L) | Nearest Blue talent | Grade | Note |
|---|---|---|---|---|
| 1 | Efficient Engineer (Passive / — / d0 / L1) | — | NONE | Crafting economy. Blue has none. |
| 2 | Prized Acquisition (Special / — / d0 / L1) | — | NONE | |
| 3 | Erudition (Key, Special / — / d0 / L1) | Telepathic Network | COUSIN | Only tree in 365 that rewrites its own skill list; the only Blue contact is expertise-sharing. |
| 4 | Mind and Body (Passive / — / d0 / L1) | — | NONE | |
| 5 | Strategize (Special / 2 foc / d0 / L1) | Anticipate | COUSIN | Blue's only ally-facing advantage grant, and it is restricted to influence-resistance tests. Strategize is general. |
| 6 | Emotional Intelligence (Passive / — / d0 / L1) | — | NONE | |
| 7 | Field Medicine (1A / 1 foc / d0 / L1) | — | NONE | |
| 8 | Deep Study (Passive / — / d1 / L2) | — | NONE | |
| 9 | Fine Handiwork (Special / — / d1 / L2) | — | NONE | |
| 10 | Inventive Design (Passive / — / d1 / L2) | — | NONE | |
| 11 | Overcharge (Special / — / d1 / **L6**, not L2) | — | NONE | **Raises the stakes.** Blue has zero plot-die talents. |
| 12 | **Clear Mind** (Passive / — / d1 / L2) | **Composed** | **NEAR** | |
| 13 | Know Your Moment (Passive / — / d1 / L2) | Calculated Patience; Collected | COUSIN | |
| 14 | Anatomical Insight (Special / 1 foc or Opp / d1 / L2) | — | NONE | **Exhausted[−X] is cumulative** (primer §Conditions). Blue's disadvantage is not. See §8. |
| 15 | **Collected** (Passive / — / d1 / L2) | **Collected** | **IDENTICAL** | |
| 16 | Swift Healer (Free / — / d1 / L2) | — | NONE | |
| 17 | Experimental Tinkering (Special / — / d2 / L3) | — | NONE | |
| 18 | Contingency (Reaction / 2 foc / d2 / **L6**, not L3) | — | NONE | Removes a Complication from an ally's test. Blue cannot touch the plot die. White's Pillar of Order is the atlas twin. |
| 19 | Deep Contemplation (2A / — / d2 / L3) | — | NONE | |
| 20 | Applied Medicine (Passive / — / d2 / L3) | — | NONE | |
| 21 | Ongoing Care (Special / — / d2 / **L6**, not L3) | — | NONE | |
| 22 | Resuscitation (Special / 3 foc / d2 / **L6**, not L3) | — | NONE | |
| 23 | Overwhelm with Details (Special / 2 foc / d3 / **L6**) | — | NONE | Modifier substitution; White's Bound by Word is the atlas twin. |
| 24 | **Keen Insight** (Passive / — / d3 / **L6**) | **Pattern Recognition / False Premise** | **TWIN** | |
| 25 | Turning Point (2A / 2 foc / d3 / **L7**) | Probable Outcome; Forewarned | COUSIN | Both are "outthink them → tempo". Blue's payload is one conditional Reaction; Scholar's is **+1 Action for the whole party**. |

**Scholar totals: IDENTICAL 1 · NEAR 1 · TWIN 1 · COUSIN 4 · NONE 18.**

---

## 3. Quantified overlap, and how it ranks in the atlas

| Measure | Blue → Scholar | Scholar → Blue |
|---|---|---|
| Hard overlap (IDENTICAL + NEAR) | **2 / 25 = 8%** | **2 / 25 = 8%** |
| Any real twin (+ TWIN) | 4 / 25 = 16% | 3 / 25 = 12% |
| Any correspondence at all (+ COUSIN) | 8 / 25 = 32% | 7 / 25 = 28% |
| No correspondence whatever | **17 / 25 = 68%** | **18 / 25 = 72%** |

Set against the atlas. Exact-text duplicate counts, every nonzero tree pair in all 365 talents:

```
 5  heroic/Hunter  <-> heroic/Warrior     <- the actual duplication problem
 3  heroic/Agent   <-> heroic/Envoy
 3  heroic/Agent   <-> heroic/Hunter
 3  heroic/Agent   <-> heroic/Leader
 3  heroic/Agent   <-> heroic/Warrior
 3  heroic/Envoy   <-> heroic/Leader
 2  leyline/Blue   <-> heroic/Agent
 2  heroic/Envoy   <-> heroic/Scholar
 2  heroic/Hunter  <-> heroic/Leader
 2  heroic/Leader  <-> heroic/Warrior
 1  leyline/Blue   <-> heroic/Scholar     <- the pair under review, tied 11th
 ...17 more pairs at 1
```

**Blue↔Scholar is tied for 11th out of 28 duplicating pairs.** Blue duplicates *heroic/Agent* twice as hard as it duplicates Scholar (`Collected` + `Baleful`). Scholar duplicates *Envoy* twice as hard as it duplicates Blue (`Collected` + the `Composed`/`Clear Mind` text). Hunter↔Warrior share five verbatim talents (`Combat Training`, `Swift Strikes`, `Surefooted`, `Hardy`, `Mighty`) — 20% of both trees — and nobody flagged that pair.

And both Blue↔Scholar overlaps are **generic filler, not identity**:
- `Collected` ("Increase your Cognitive and Spiritual defenses by 2") appears verbatim in **5 trees**: Blue, Green, Agent, Envoy, Scholar.
- The "+focus by your tier" stat stick appears in **5 trees** across two wordings: Blue `Composed`, Black `Composed`, Envoy `Composed`, Leader `Focused Mind`, Scholar `Clear Mind`.

If you deleted both from both trees, neither tree would lose one gram of its identity. That is the definition of a non-problem.

---

## 4. The three findings, separated

### (a) Same fantasy, different mechanics — YES, and it is fine

Blue's **Foresight** specialty (Forewarned, Calculated Patience, Probable Outcome, Read Intent, Reactive Analysis, Intercept, Telepathic Network) and Scholar's **Strategist** specialty (Strategize, Clear Mind, Know Your Moment, Contingency, Deep Contemplation, Keen Insight, Turning Point) sell the *same* player fantasy: *"I saw this coming; I planned for it."* Both intent files lean on it — Blue "read the battle a beat before it happens… a problem already half-solved"; Scholar "Always three steps ahead, Strategists know timing is everything."

The mechanics are almost disjoint:

| | Blue Foresight | Scholar Strategist |
|---|---|---|
| Currency | Investiture (16 of 25 talents) | Focus (7 of 25); **zero Investiture in the whole tree** |
| Output | Impose disadvantage; deny a Reaction; grant yourself one | Grant Actions; repair the plot die; re-spec skills |
| Prediction | Explicit tokens: declared character + action (Forewarned), GM reveals the intent (Read Intent), turn-order re-choice (Probable Outcome) | None. Scholar has **zero foreknowledge talents** — my rebuilt vector scores Blue 3, Scholar 0 |
| Payoff timing | Enemy's next test | Your party's next turn |

This is a healthy shared fantasy served two ways. **No action needed.**

### (b) Different fantasy, same mechanics — one instance, and it is the real (small) problem

**Blue `Pattern Recognition` / `False Premise` ↔ Scholar `Keen Insight`.**

- Pattern Recognition: *"When you succeed on a Cognitive test against a character, you may spend 1 Investiture. If you do, their next test this round has disadvantage."*
- False Premise: *"When a character within Attunement Range succeeds on a Cognitive test, spend 1 Investiture and test Blue vs. their Cognitive defense. On a success, impose disadvantage on their next test."*
- Keen Insight: *"After you Gain Advantage, the target must resist your influence or gain a disadvantage on their next test."*

Different fantasy (leyline pattern-reading vs. burying someone in citations); identical mechanical output (one enemy, one disadvantage, next test). This is the category the brief flags as "the one that actually bites players," and it does bite — but note the asymmetry that defuses it: Blue pays 1 Investiture per use and can do it every round; Scholar's is a **free Passive** riding on the standard Gain Advantage action, but it is the tree's **only** debuff, sits at depth 3, and is truly **level 6** (Deep Contemplation → Lore 2+ chain plus its own place in the ladder — see §9).

Blue does this *as its job*, five times over. Scholar does it *once, incidentally, at the bottom of a branch*. That is an acceptable amount of bleed.

### (c) Genuinely the same — one talent, and it belongs to five trees

`Collected`. Not a Blue/Scholar problem; a shared-stock problem. Same for the focus stat stick.

---

## 5. The five function-vector claims, checked against text

| Census claim | What the text says | Verdict |
|---|---|---|
| **Blue 4 advantage-granters vs Scholar 3** | Blue's four (verified against `advantage-ledger.md`): Blue Leyline Attunement (*next Cognitive test*), Calculated Patience (*first test of a slow turn*), Reactive Analysis (*next test against them*), Anticipate (*ally's influence-resistance test*). **Three of the four write to the same slot — "your next test."** A Blue mage who Draws Mana on a slow turn while an enemy fails a test has three advantage sources aimed at one d20 and, per the primer's boolean-OR fold, **gets one**. Scholar's "three": only `Strategize` grants anything, and it *redirects* the standard Gain Advantage action rather than creating advantage; `Keen Insight` is a **consumer** (it triggers on Gain Advantage and outputs disadvantage); `Turning Point` is a conditional self-advantage. | **Census reads near-parity (4 v 3). Reality is near-parity too — at ~1 unit each.** Blue's 4 collapse to 1; Scholar's 3 are really 1 redirect. Neither tree is an advantage engine. |
| **Blue 5 disadvantage-imposers vs Scholar 1** | Blue's five are real: Pattern Recognition, Intercept, False Premise, Probability Cascade, Absolute Stillness. But the same fold applies: Pattern Recognition and False Premise both write "their next test," and Probability Cascade ("next **two** tests") subsumes both. On one enemy in one round Blue delivers **at most two independent units** (one on a declared action via Intercept, one on the next test(s)). And `resource-economy.json` is decisive: **disadvantage is produced by 14 talents across 9 trees and consumed by zero.** It is a terminal output with no downstream. | **The count is right; the value is roughly 40% of what it reads.** This is Blue's biggest single design liability and it is not a Scholar problem. |
| **Blue 12 passives vs Scholar 4** | **This is not an action-type measurement.** The `passive_always` regex is `/^when \|^whenever \|^at the start\|^once per/` — it measures **how the sentence starts**. Real action types from the census: Blue 9 Passive / 5 Special / 5 Reaction / 3 Action / 2×2-Action / 1 Free. Scholar **10 Passive** / 10 Special / 1 Reaction / 1 Action / 2×2-Action / 1 Free. **Scholar has MORE passives than Blue (10 v 9).** | **Claim inverted.** The real action-type divergence is elsewhere: Blue 5 Reactions vs Scholar 1, and Scholar 10 Specials vs Blue 5. Blue's five Reactions compete for the one-per-round cap; only `Forewarned` relieves it, and only on a correct prediction. Scholar's 10 Specials cost nothing extra — the primer calls Special "the workhorse." |
| **Blue 4 social vs Scholar 1** | Correct and load-bearing. Blue: Subtle Suggestion, Baleful, Anticipate, Ghostly Walls — all key on the **influence** subsystem, three of them as a coherent package (tax the resistance, punish the success, defend the ally). Scholar: `Keen Insight` alone. | **Confirmed.** Blue owns influence-adjacency; Scholar does not compete. |
| **Scholar 2 heals vs Blue 0** | Undercounted. Scholar carries **three** `type: heal` roll formulas — `Field Medicine` (`@skills.med.rank`), `Swift Healer` (`@skills.med.rank`), `Applied Medicine` (`@skills.lor.rank`) — plus `Resuscitation` (revive) and `Ongoing Care` (condition removal at rest). Blue has zero of all five. | **Confirmed and understated.** This is the largest single functional gap between the trees. |

---

## 6. What the similarity metric actually measured

The 0.794 / rank-10 figure comes from a 27-dimension cosine over regex presence rates. Three of those dimensions are **sentence-shape features, not functions**: `passive_always` (does the text start with "When"), `duration_scene` (does it contain "for the scene"), `reaction_gated` (does it start with "When an ally/enemy"). Blue's prose is overwhelmingly trigger-shaped; Scholar's is "Gain…" / "Spend…" shaped.

A fourth dimension is broken. **`deal_damage` misses 33 of the 43 formula-carrying talents in the atlas** — it requires the verb *deal*, and most damage talents say *takes*:

```
HAS a damage formula but deal_damage regex MISSES (33):
  Black: Sovereign of Solitude, Dark Investiture
  Red: Volatile Strike, Shockwave Slam, Searing Bolt, Flame Surge
  Agent: Cheap Shot | Hunter: Fatal Thrust, Deadly Trap | Warrior: Wit's End, Devastating Blow
  Chaos: Cascade Collapse, Isolating Ruin
  Order: Edict, Sealed Edict, Verdict, Final Decree      <- all four
  Civilization: Bastion, Magnum Opus
  Death: Consuming Decay, Bone Garden, Necrotic Cascade
  Destruction: Set Charge, Pinpoint Charge, Cascading Failure, Fault Line
  Fate: Snare, Inevitable Snare, Foreknown Strike
  Power: Warlord's Advance, Momentum of Victory, Unstoppable Advance
  Knowledge: Predatory Strike
```

**This is the third classifier bug the brief predicted.** It matters system-wide: the `deal_damage` dimension is ~77% blind, so *every* pair in that top-15 list is being ranked on a vector that barely sees damage. It happens not to inflate Blue↔Scholar specifically (both are genuinely 0), but it is why leyline/Blue↔leyline/Red scores 0.864.

I rebuilt the vector: dropped the three sentence-shape dimensions, fixed `deal_damage` to accept *takes*, tightened `grant_action`, and added four real functions (`illusion`, `craft`, `plotdie`, `foreknowledge`).

```
leyline/Blue <-> heroic/Scholar   cos 0.337   RANK 111 of 210   (was 0.794, rank 10)
```

Function counts on the repaired vector:

```
                    Blue  Scholar
  heal                 0        2
  impose_disadvantage  5        1
  social               4        1
  illusion             2        0
  foreknowledge        3        0
  plotdie              1        5
  craft/expertise      1       13
```

**The trees are near-orthogonal.** Blue is disadvantage + illusion + foreknowledge + influence. Scholar is crafting + skill-sheet + medicine + plot-die. On the rebuilt metric they are in the bottom half of the atlas for similarity.

One more inversion worth naming: the leyline guide says *"Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression."* On the plot-die/Opportunity axis, **Scholar 5, Blue 1**. Scholar has two literal plot-die talents (`Overcharge` raises the stakes; `Contingency` removes a Complication from an ally's test) and Blue has **zero**. On the one mechanic the design guide reserves for Blue, Scholar beats it 2–0. That is a genuine — if unexpected — overlap finding, and it runs the opposite way to the one the review was called to investigate.

---

## 7. What actually makes them feel the same: the negative space

Both trees deal zero damage — confirmed by two independent measures. But that is only half of it. The real difference is **how much of each tree is inert once initiative is rolled**.

**Scholar talents that do nothing in a combat round (11 of 25 = 44%):** Efficient Engineer, Prized Acquisition, Erudition, Mind and Body, Emotional Intelligence, Deep Study, Fine Handiwork, Inventive Design, Experimental Tinkering, Deep Contemplation, Ongoing Care.

**Blue talents that do nothing in a combat round (3 of 25 = 12%):** Telepathic Network, Holographic Illusion, Living Image.

Now price a single combat round at level 5 (Tier 1, rank 2 cap, `[Tier][Die]` = 1d6, `[Size]` = 5 ft, Investiture pool ≈ 4–5, Key granted free).

**Blue, five picks (Calculated Patience, Pattern Recognition, Reactive Analysis, False Premise, Phantom Barricade):**
- Action 1 — Use a Skill for a Cognitive test against an enemy; on success trigger Pattern Recognition (Special, 1 Inv) → their next test this round has disadvantage.
- Action 2 — Draw Mana (+1 Inv, advantage on next Cognitive).
- Action 3 — Phantom Barricade (1 Inv) → a 2d6-HP wall.
- Reaction — False Premise (1 Inv) → disadvantage on someone's next test.
- **Net for the whole turn: two enemy d20s rolled at disadvantage, one wall.** Zero HP moved in either direction.

**Scholar, five picks (Field Medicine, Swift Healer, Emotional Intelligence, Collected, Applied Medicine):**
- Free Action — Swift Healer/Field Medicine (1 focus, test Medicine DC 15): heal `recovery die + Medicine 2 + Medicine 2 + Lore 2` = **d6 + 6 ≈ 9.5 HP**.
- Actions 1–3 still entirely free for Strike, Aid, Gain Advantage, Move.
- **Net for the whole turn: ~9.5 HP restored, at the cost of a Free Action, and three Actions still in hand.**

Two conclusions, and they point in opposite directions:

1. **They are not the same at the table.** One imposes two disadvantages and spends its whole turn; the other restores ~9.5 HP as a free action and keeps its turn.
2. **Scholar is materially stronger than Blue in exactly the pre-session-one window the review is about (L1–5)** — and it is stronger *without* dealing damage. That is a proof-by-example that "no damage" is not the thing making Blue weak. Blue's problem is that its output has no magnitude: disadvantage is binary, non-stacking (primer §Advantage), and — per `resource-economy.json` — consumed by **zero talents in the entire game**.

---

## 8. Where the seam should be

Both trees already contain the answer; neither needs a new fantasy.

**Blue must own — and Scholar must not touch:**

| Blue owns | Evidence it already does | What Scholar must give up / stay out of |
|---|---|---|
| **Making an enemy's die worse** | 5 of the atlas's 14 disadvantage talents. | Retire `Keen Insight`'s disadvantage clause, or re-cut it as an **Exhausted[−X]** rider so it reads as *Scholar's* mechanic (see below). Scholar already owns Exhausted via `Anatomical Insight`. |
| **Illusion** | The only tree in 365 that creates illusions: Phantom Double, Phantom Barricade, Holographic Illusion, Living Image, Phantom Step, Ghostly Walls. | Scholar has no claim here. Fine as-is. |
| **Foreknowledge as a declared token** | Forewarned (declare a character + action), Read Intent (GM reveals the next action), Probable Outcome (re-choose fast/slow after everyone). | Scholar's Strategist branch should stay on **tempo** (grant Actions, repair rolls), not on prediction. It currently does — no change needed. |
| **Talent-activation interruption** | `Counterspell` is the only talent in 365 that makes another character's talent fail. | Scholar cannot reach this and should not. |
| **Anti-influence** | Subtle Suggestion, Baleful, Anticipate + Ghostly Walls' influence gate. | Keen Insight's influence test is the one Scholar toe over the line. |

**Scholar must own — and Blue must not touch:**

| Scholar owns | Evidence | What Blue must stay out of |
|---|---|---|
| **The character sheet** | Only tree in 365 that grants and reassigns skill ranks (Erudition, Deep Study, Mind and Body, Emotional Intelligence, Deep Contemplation). 7 expertise grants — the most in the atlas. | Blue's `Telepathic Network` currently *shares your expertise with allies*. That is the one Blue toe over Scholar's line. It reads better as **shared foreknowledge** (e.g. allies in the network learn what Read Intent reveals) than as shared expertise. |
| **Fabrials / crafting** | Only 5 fabrial talents in 365, all Scholar's. | No contact. |
| **Restoring HP** | 3 heal formulas, revive, injury-condition removal at rest. | Blue must stay at zero heals. Confirmed no contact today. |
| **Buying the party time** | `Turning Point` is a party-wide +1 Action. | Blue's tempo play must stay *self*-scoped (an extra Reaction, a turn-order re-choice) — which it already is. |
| **Stacking numeric penalties** | `Anatomical Insight` → **Exhausted[−X]**, cumulative per the primer. | Blue should *not* be given a stacking penalty of the Exhausted kind — see the mechanical recommendation below. |

**The one mechanical change that would fix Blue without giving it damage.** The primer records that the engine already carries the fix and no talent uses it:

> `edha-next-test-mod` also carries a `formula` field — a dice/flat modifier on the next test (`−1d6`) applied by term concatenation, and item 49 made those **SUM**: "every matching entry appends its own term". It is currently used by one adversary ability (`Probability Net`) and by no talent.

Blue's five disadvantage talents fold into one binary state. If Blue's deeper nodes (Probability Cascade at minimum, plausibly False Premise as the second) delivered a **summing `−1d6`-style formula penalty** instead of, or on top of, binary disadvantage, then:
- Blue's five debuffs stop being redundant with each other and with every other advantage/disadvantage source in the party;
- Blue gains a *magnitude* it can scale on `[Tier][Die]`, which is exactly the lever every other leyline tree has and Blue does not;
- **the seam against Scholar sharpens rather than blurs**: Scholar's Exhausted[−X] scales on `half Medicine ranks` (a skill), Blue's would scale on `[Tier][Die]` (the leyline scaling channel). Same category, different currency, different curve;
- no engine work is needed, and no damage is added to Blue.

I would recommend this over adding damage to Blue. It answers "every tree is good at something" by making Blue *good at the thing it already claims to be good at*, which currently it measurably is not.

---

## 9. A correction that bears on the parity question (Q2)

**The dossier's `earliest L` column applies the rank-3 → level-6 rule only to leyline colour ranks.** It ignores every non-colour rank-3 gate. That makes the brief's "structural fact" — *"heroic paths carry NO leyline-colour rank gate, so their whole tree is reachable by ~L4–L5"* — wrong for six of the eleven 25-talent trees.

Talents whose own prereq string carries a `3+` gate, and are therefore unreachable before level 6 under the primer's own rank-cap table:

```
leyline/Blue    8   (7 x Blue 3+, plus Baleful @ Persuasion 3+ — dossier says L4)
leyline/Green   8
heroic/Agent    7   (dossier dates all seven at L2-L4)
leyline/Red     6
heroic/Envoy    6   (dossier dates all six at L4)
heroic/Hunter   6
heroic/Scholar  6   (dossier: Overcharge L2, Contingency L3, Ongoing Care L3,
                     Resuscitation L3, Overwhelm w/ Details L4, Turning Point L4
                     — all six are actually L6, Turning Point L7 via its chain)
heroic/Warrior  6
leyline/White   5
leyline/Black   5
heroic/Leader   5
```

So the corrected comparison for the pair under review is **Blue 8 of 25 at L6+, Scholar 6 of 25 at L6+** — near parity, not the leyline-is-gated / heroic-is-open asymmetry the brief assumes.

And the skill-rank *budget* runs the other way from the intuition. At 2 skill ranks per level, a level-6 character has ~12 ranks to spend:
- **Blue** unlocks all eight of its deep talents with **6 ranks** (Blue 3 + Persuasion 3).
- **Scholar** needs **12 ranks in four separate skills** (Crafting 3 + Lore 3 + Medicine 3 + Deduction 3) to unlock all six — i.e. the entire level-6 budget, leaving nothing for anything else. A real Scholar picks two of the four and permanently forfeits the other two branches.

**Blue's deep tree is cheaper to reach than Scholar's.** Whatever else is wrong with Blue, gating is not it — and a parity analysis built on the dossier's `earliest L` column will be wrong for Scholar, Envoy, Agent, Hunter and Warrior.

---

## 10. Widening by exactly one step: does White have the same problem?

**Not with a heroic path. White's overlap partners are `deity/Order` and `heroic/Envoy`, and both beat it at its own job.**

The brief is right that White↔Leader is not the pair. On the shipped metric it is rank 162 of 210; reading the text confirms it (Leader is 12 social-leverage talents plus the command die; White is 6 mitigation talents plus the plot die). But the metric is unstable — my rebuilt vector puts White↔Leader at rank 34 — which is itself evidence that no cosine should decide this. The text decides it.

### 10a. `deity/Order` reimplements White's Bulwark lane, better and free

| | leyline/White — **Shared Burden** | deity/Order — **Shoulder the Oath** |
|---|---|---|
| Action | Reaction | Reaction |
| Cost | **2 Investiture** | **— (free)** |
| Prereq | Strength 3+; White 2+ → truly **L6** | Covenant → **L2** |
| Range | adjacent ally | any Covenant ally in Attunement Range |
| Effect | take half that damage in their place | take half instead, **and** reduce the ally's remaining half by **your ranks in White**, **and** both of you gain temporary HP equal to **your ranks in White** |

Order's version is free, longer-ranged, four levels earlier, and does three things where White's does one. **And it pays out in White's own skill rank — which White's own tree barely uses.**

Across all 365 talents, a colour skill rank is used as a *magnitude*:

```
RED   16 talents
GREEN 11
BLACK  9
BLUE   8
WHITE  4   -> leyline/White: Mending Aura, Retributive Guard
              deity/Order:   Bear Witness, Shoulder the Oath
```

**Half of every use of "ranks in White" in the entire game is in a deity tree.** `Bear Witness` pays each Covenant ally temporary HP equal to your ranks in White, every round, free — and White itself has **zero temp-HP talents** (the atlas's 14 are spread over Order 3, Power 2, Life 2, Sovereignty 2, and one each in Black, Green, Civilization, Death, Fate).

This also **corrects the deity-gate-audit's toll-booth list**: Order's White 2+ is *not* a pure toll booth. Two of Order's nine talents scale on ranks in White. The audit's columns look only at "tests (skill field)" and "sizes damage die," and miss a colour rank used as a flat additive. The four remaining toll booths (Civilization white 2+, Fate white 2+, Knowledge green 3+, Sovereignty white 3+) stand.

Deity trees are *supposed* to outpower leyline trees — the primer is explicit. So Order being stronger is design working. **The problem is that it is the same thing, not that it is stronger.** Category (b): different fantasy (Lawgiver's pact vs. Marshal's formation), same mechanics (Reaction, take half your ally's damage, hand out defence bonuses and temp HP). This is the one that bites, exactly as the brief predicts — and unlike Blue/Scholar, here it bites on the tree's *core identity*, not on its filler.

Full White↔Order correspondence:

| White | Order | Grade |
|---|---|---|
| Shared Burden | **Shoulder the Oath** | TWIN — strictly dominated |
| Terms of Accord (+1 to tests on a shared objective) + Unyielding Accord (+1 Cog/Spi to adjacent allies) | **Covenant** (+1 to **all** defenses, scene, Aid at range, sustain up to tier) | TWIN — same verbal-pact fiction, same +1, wider |
| Unity of Purpose (two allies aid → raise the stakes) | Concord (Covenant allies grant Aid as a Free Action) | COUSIN |
| Guiding Signal (designate a target, next ally testing against it raises the stakes) | Lawkeeper's Eye (you **and your allies** have advantage vs the Edicted target — free Passive) | COUSIN |
| — (White has no temp HP) | Bear Witness | Order-only, paid in White ranks |

### 10b. `heroic/Envoy` out-produces White's Coordination lane at zero Investiture cost

| White | Envoy | Grade |
|---|---|---|
| **Collective Resolve** (Special, Opportunity + 1 Inv, depth 3, L4): grant allies in range Determined | **Rousing Presence** (1 Action, **no cost**, the free Key, L1): an ally becomes Determined **until end of scene** — and `Practical Demonstration` (Free Action, depth 0, L1) makes it a **Free Action whenever you Gain Advantage or hit** | TWIN — Envoy is unlimited and free; White pays an Opportunity + 1 Investiture. White's is AoE, which is its one edge. |
| **Beacon of Stability** (Special, Draw Mana + 1 Inv, L3): remove one condition from an ally | **Devoted Presence** (Special, 1 focus, L2): remove Prone, Slowed, Stunned **and** Surprised | TWIN — four conditions vs one, cheaper currency, a level earlier |
| Shared Conviction (Reaction, 2 foc + 1 Inv: add your White modifier to a failing ally's test) | Sound Advice (Reaction, 1 foc: Rousing Presence on an ally who failed) | COUSIN |
| Unbreakable Line (Special, 3 Inv, L6: ally drops to 1 HP instead of 0) | Rallying Shout (Passive, L6: Rousing Presence revives an Unconscious ally + heals) | COUSIN |
| Unyielding Accord / Terms of Accord (+1) | Stalwart Presence (+2 to one defense, 1 focus, repeatable) | COUSIN |

Determined census across all 365: **Envoy 3 talents, White 1.** Ally-condition-removal census: one each in White, Green, Envoy, Scholar, Life.

### 10c. What White does still own outright

`ALLY damage mitigation` returns **5 talents in the whole game: 4 White + 1 Order**. Guardian Stance (+1 Deflect to you and an adjacent ally, free Passive, depth 0, L1), Devoted Conduit, Shield Wall, Interposing Shield, plus Disciplined Mind on the influence side. Nothing else in the atlas does free, permanent, untriggered, multi-target damage reduction.

**So White's finding is not "White = X."** It is: *White's Bulwark half is duplicated by deity/Order at higher power and lower cost, White's Coordination half is duplicated by heroic/Envoy at lower cost and earlier, and White's own colour rank is the least mechanically instantiated in the game (4 uses, half of them outside White).* White is not colliding with a peer — it is being **hollowed out from both sides**.

---

## 11. Uncertainties, and what would settle them

1. **Scholar's healing throughput depends on recovery dice per rest, which is not in scope.** `Field Medicine` heals `recovery die + Medicine ranks` and consumes the *target's* recovery die. If a character has 2–3 recovery dice per long rest, Scholar's free-action heal is capped at 2–3 uses per rest, not 5 per scene, and the §7 comparison narrows substantially in Blue's favour. **What would settle it:** the recovery-dice-per-rest count from `docs/ACTOR_STAT_DERIVATION.md` or the Stormlight advancement table. The primer gives only the WIL→die-size ladder, not the count.

2. **Whether disadvantage is worth what I priced it at** depends on adversary hit rates, which the scope fence excludes. I priced one disadvantage as roughly "half an attack denied" (a ~50% test drops to ~25% under 2d20-keep-low). **What would settle it:** adversary defence values, which are out of scope by ruling.

3. **`Overcharge` references a "fabrial attack" that no talent in the 365 defines.** I could not price it and did not include it in any comparison. It may be defined in the Stormlight Handbook (out of scope) or nowhere.

4. **Attunement Range on a two-colour deity tree is ambiguous** — `deity/Order` gates Blue 2+ and White 2+ and nothing in the data says which rank sets the radius for Bear Witness / Shoulder the Oath. If it is White, §10a's finding is even sharper; if Blue, the "paid in White ranks" point still stands on the two explicit `ranks in White` clauses.

5. **`Turning Point`'s value scales with party size** (+1 Action each). In a 4-PC party it is +4 Actions for 2 Actions; solo it is net −1. I priced it at 4-PC. **What would settle it:** the campaign's actual party size, which is a table fact, not a talent fact.

6. **Three classifier bugs are now known** (`advantage` inside `disadvantage` — already fixed; `Shield Wall` — already fixed; `deal_damage` missing *takes* — **new, §6**). A fourth is likely. I would specifically re-check `detect_info`, which scores Blue at 1 when Blue has three foreknowledge talents (Forewarned and Probable Outcome contain none of its verbs), and `grant_action`, which scores Blue at 3 when two of the three hits are the phrases *"cannot take Reactions"* and *"takes the declared action."*

## Adversarial verification

**27 load-bearing claims checked: 12 confirmed, 12 corrected, 3 refuted.**

The verdict (DISTINCT) survives, but its quantitative spine does not. I re-ran the shipped functional-overlap.js and rebuilt the analysis's "repaired" vector in stages: dropping the three sentence-shape dimensions moves Blue<->Scholar from rank 10 to rank 20; adding the deal_damage fix moves it to 25; the four hand-added dimensions (illusion, craft, plotdie, foreknowledge) move it from 25 to ~122. So roughly 97 of the ~101 rank places the analysis attributes to bug-fixing come from four dimensions chosen precisely because one tree has them and the other does not. The defensible bug-fix-only figure is rank ~25 of 210 (cos 0.66) — still the top 12% of pairs, not "bottom half" and not "near-orthogonal". The text-level correspondence table (17/25 and 18/25 with no correspondence at all) is the real evidence for DISTINCT and should carry the verdict alone. Two factual errors bite: Scholar's Keen Insight is level 4, not level 6 (the analysis's own section 9 list omits it), which removes the "it sits at the bottom of a branch" defusing argument from the one genuine mechanical collision; and the section 7 Blue loadout is illegal under iron rule 7 (Phantom Barricade's connections require Phantom Double, which is not among the five picks). Section 9's rank-3 gate table is the analysis's best work and I confirmed it exactly, with one correction: White's fifth "gate" is Strength 3+, an attribute, not a skill rank, so White is 4 and Shared Burden is not "truly L6". Section 10's White findings are real but three of its census numbers are wrong. The plot-die finding points at the wrong tree: Scholar has zero literal plot-die talents, and on the raise-the-stakes/Complication measure leyline/White beats Blue 4-0 and heroic/Agent 6-0 on the mechanic the design guide calls "Blue's capstone identity" — while the same guide gives White "Plot Die integration" as ITS key mechanic. That is the leyline-internal identity swap the analysis was one step from and did not take.

### Claims

1. **CONFIRMED** — Blue and Scholar share exactly one verbatim talent out of fifty (Collected, present in five trees) and one near-verbatim (Blue's Composed vs Scholar's Clear Mind, a +focus stat stick present in five trees across two wordings).
   - Evidence: Normalised-text duplicate scan of all 365: Collected — "Increase your Cognitive and Spiritual defenses by 2." — verbatim in leyline/Blue (d2, L6, Blue 3+), leyline/Green, heroic/Agent, heroic/Envoy, heroic/Scholar (d1, L2). Blue Composed = "Increase your maximum focus by your tier" (also leyline/Black); Scholar Clear Mind = Envoy Composed = Leader Focused Mind = "Increase your max and current focus by your tier". Scholar's is strictly better and four levels earlier, as the analysis says.
2. **CONFIRMED** — Blue<->Scholar is tied 11th of 28 exact-duplicate tree pairs; Hunter<->Warrior share five verbatim talents (Combat Training, Swift Strikes, Surefooted, Hardy, Mighty); Blue duplicates Agent twice as hard (Collected + Baleful) and Scholar duplicates Envoy twice as hard (Collected + Clear Mind).
   - Evidence: My independent duplicate scan reproduces the analysis's table exactly: 28 nonzero pairs, Hunter<->Warrior 5, Agent<->Envoy/Agent<->Leader/Agent<->Hunter/Agent<->Warrior/Envoy<->Leader 3, four pairs at 2 including Blue<->Agent and Envoy<->Scholar, 18 pairs at 1 including Blue<->Scholar.
3. **CORRECTED** — On a repaired similarity vector the pair falls from rank 10 of 210 to rank 111 of 210 (cos 0.794 -> 0.337), showing the trees are near-orthogonal.
   - Evidence: Re-ran the shipped script: Blue<->Scholar cos=0.794 RANK 10 of 210, White<->Leader RANK 162 — both exactly as the analysis reports. Then decomposed the rebuild. (B) drop passive_always/duration_scene/reaction_gated only: cos 0.661, rank 20. (C) B plus a deal_damage that accepts 'takes ... damage': cos 0.661, rank 25 (unchanged cosine — both trees are genuinely 0 damage, as the analysis concedes). (D) C plus the four added dimensions: cos 0.328, rank 122 — within noise of the analysis's 0.337/111. So ~97 of the ~101 rank places come from adding four dimensions selected because Blue has illusion/foreknowledge and Scholar has craft/plotdie. Corrected claim: the bug-fix-only repair puts Blue<->Scholar at rank ~25 of 210 (cos ~0.66) — still top 12%. Also internally inconsistent: the analysis disowns the rebuilt metric when it moves White<->Leader from 162 to 34 ("no cosine should decide this") but headlines it in the section 0 verdict.
4. **CONFIRMED** — The deal_damage regex misses 33 of the 43 formula-carrying talents in the atlas — the third classifier bug the brief predicted.
   - Evidence: Applied the shipped regex /deals?\s+(?:an?\s+)?(\[[^\]]+\]|\d*d\d+|\d+)[^.;]{0,30}damage/ to the 43 talents with isDamageFormula=true: exactly 33 misses, and the tree-by-tree list matches the analysis name for name (Black 2, Red 4, Agent 1, Hunter 2, Warrior 2, Chaos 2, Order 4, Civilization 2, Death 3, Destruction 4, Fate 3, Power 3, Knowledge 1). One nit: the stated cause ("it requires the verb deal, and most damage talents say takes") is imprecise — ten of the 33 do contain 'deal'; the regex fails on the dice-token-within-30-characters window, not on the verb alone.
5. **CONFIRMED** — The passive_always dimension is a sentence-shape feature, not an action type; the real action types are Blue 9 Passive / 5 Special / 5 Reaction / 3 Action / 2x2-Action / 1 Free and Scholar 10 Passive / 10 Special / 1 Reaction / 1 Action / 2x2-Action / 1 Free — Scholar has MORE passives than Blue.
   - Evidence: functional-overlap.js line 37: passive_always:/^when |^whenever |^at the start|^once per/ — it matches on sentence opening. Counting the action field in all-talents.json reproduces both trees' distributions exactly (both sum to 25) and matches the brief's own action-type census row.
6. **CONFIRMED** — Scholar carries three type:heal roll formulas (Field Medicine, Swift Healer, Applied Medicine) and Blue zero; the census's 'Scholar 2 heals' undercounts.
   - Evidence: 11 talents carry isHealFormula=true; Scholar's three are Field Medicine (@skills.med.rank), Swift Healer (@skills.med.rank), Applied Medicine (@skills.lor.rank). No Blue talent carries a heal formula or the word heal.
7. **REFUTED** — Scholar's Keen Insight sits at depth 3 and is 'truly level 6', so Blue's disadvantage collision with it is acceptable bleed.
   - Evidence: Keen Insight: depth 3, earliestLevel 4, prerequisites 'Deep Contemplation' with no rank-3 anywhere in its chain (Strategize needs Deduction 1+, Clear Mind needs Strategize, Deep Contemplation needs Clear Mind + Lore 2+). Chain-corrected earliest level = 4. The analysis's own section 9 lists Scholar's six L6 talents and Keen Insight is not among them — an internal contradiction. Worse for the argument: Keen Insight costs no Investiture and fires off any Gain Advantage, while Blue's Pattern Recognition costs 1 Investiture and requires a successful Cognitive test against the target — so the 'asymmetry that defuses it' runs the wrong way. Corrected: Scholar's only debuff is available at L4, is cheaper per use than Blue's, and is arguably the better of the two; the bleed is real but small because it is one talent, not because it is late.
   - Corrected: Keen Insight is depth 3 / level 4, with no rank-3 gate in its chain. It is Scholar's only debuff, but per use it is cheaper and more repeatable than Blue's Pattern Recognition.
8. **CORRECTED** — Section 9's rank-3 gate table: Blue 8, Green 8, Agent 7, Red 6, Envoy 6, Hunter 6, Scholar 6, Warrior 6, White 5, Black 5, Leader 5 — so the brief's 'heroic paths are reachable by L4-L5' is wrong for six of the eleven 25-talent trees.
   - Evidence: I counted talents whose own prerequisite string contains '3+' across all 365 and reproduced every number exactly. The one correction: White's fifth entry is Shared Burden, gated on 'Strength 3+; White 2+'. Strength is an ATTRIBUTE, not a skill (primer: Health = 10 + STR, Focus = 2 + WIL, Investiture = 2 + max(AWA,PRE)), and the rank-cap-2-until-L6 table governs skill ranks only. White is therefore 4, not 5. Every other tree's 3+ gates are genuine skills (Agent: Deduction/Insight/Deception/Thievery; Envoy: Discipline/Persuasion/Lore/Leadership; Scholar: Crafting/Lore/Medicine/Deduction; Warrior: Athletics/Intimidation/Perception/Discipline; Hunter: Perception/Agility/Stealth/Survival; Leader: Athletics/Persuasion/Leadership/Deception).
   - Corrected: Blue 8, Green 8, Agent 7, Red 6, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Black 5, Leader 5, White 4 (Shared Burden's Strength 3+ is an attribute gate, not a skill-rank gate).
9. **CONFIRMED** — Blue 8 of 25 at L6+ vs Scholar 6 of 25 is near parity, not the leyline-gated / heroic-open asymmetry the brief assumes.
   - Evidence: Confirmed by the own-prereq count above and by an independent chain-propagating recomputation (earliest = max(gate level, depth+1, 1 + max(prereq earliest))): chain-corrected L6+ counts are Blue 8, Green 8, White 8, Agent 7, Black 7, Red 7, Leader 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6. Every 25-talent tree has 6-8 talents behind a level-6 wall. The dossier's earliest-L column reports 0 for all six heroic trees, so it is wrong for all of them.
10. **CONFIRMED** — Blue unlocks all eight of its deep talents with 6 ranks (Blue 3 + Persuasion 3); Scholar needs 12 ranks in four separate skills (Crafting 3 + Lore 3 + Medicine 3 + Deduction 3). Blue's deep tree is cheaper to reach.
   - Evidence: Blue's eight 3+ gates are seven x 'Blue 3+' plus Baleful's 'Persuasion 3+'. Scholar's six are Crafting 3+ (Overcharge), Lore 3+ (Overwhelm with Details, Contingency, Ongoing Care), Medicine 3+ (Resuscitation), Deduction 3+ (Turning Point) — four distinct skills. Scope note: the '2 skill ranks per level' budget comes from the advancement table in build-forge, not from SYSTEM-PRIMER.md, and sits next to the out-of-scope PC build ladder.
11. **CORRECTED** — Chain-corrected levels: Absolute Stillness L7, Turning Point L7, Overcharge L6, Contingency L6, Ongoing Care L6, Resuscitation L6, Overwhelm with Details L6, Baleful L6.
   - Evidence: All confirmed except Baleful. Baleful's connections are ['Counterspell'], and Counterspell is gated Blue 3+ (earliest L6); one talent per level makes Baleful L7, not L6. The same slip applies to Anticipate, which the analysis also dates L6 — its connection is Collected (Blue 3+, L6), so it is L7. Both were derived correctly for Absolute Stillness and Turning Point, so this is inconsistent application of the analysis's own rule.
   - Corrected: Blue's Baleful and Anticipate are both L7, not L6, because each hangs off a Blue 3+ parent.
12. **REFUTED** — Section 7 combat-round comparison, Blue side: five picks (Calculated Patience, Pattern Recognition, Reactive Analysis, False Premise, Phantom Barricade) producing two disadvantaged enemy d20s and one wall.
   - Evidence: Illegal loadout under iron rule 7. Phantom Barricade's connections field is ['Phantom Double'] — a managed talent prerequisite — and Phantom Double is not among the five picks. At L5 the Blue player must either spend a sixth pick on Phantom Double (2 Actions, 2 Investiture) or drop the wall. Correcting it does not reverse the section's direction; it worsens Blue's turn to 'two disadvantages, net -1 Investiture, nothing else'. Say so rather than leaving an illegal build in the report.
13. **CORRECTED** — Section 7 Scholar side: Swift Healer/Field Medicine heals recovery die + Medicine 2 + Medicine 2 + Lore 2 = d6 + 6 ~= 9.5 HP as a Free Action, leaving all three Actions in hand.
   - Evidence: Text check: Field Medicine = 'Spend 1 focus and test Medicine (DC 15) to heal a concious character. On success, add your ranks in Medicine to their recovery die.' Swift Healer = 'Use Field Medicine as a Free Action. Your healing abilities restore additional health equal to your ranks in Medicine.' Applied Medicine = '+ your ranks in Lore.' The arithmetic is right at L5 with Medicine 2 / Lore 2 and a WIL-2/3 d6 recovery die. What the analysis omits: it is a DC 15 test that can fail (Blue's turn is priced at full success too, but Blue's is at least opposed); it costs 1 focus per use against a pool of 2+WIL; it cannot touch an unconscious character without Resuscitation (3 focus, Medicine 3+, L6); and it spends the TARGET's recovery die — a per-rest pool the Scholar cannot refill, which the analysis flags in section 11 and then ignores in the headline comparison.
   - Corrected: On a successful DC-15 Medicine test, Swift Healer restores d6+6 (~9.5) HP for 1 focus as a Free Action at L5, capped by the party's recovery dice per rest and unusable on an unconscious ally before L6.
14. **CORRECTED** — Scholar is materially stronger than Blue in the L1-5 window, which proves 'no damage' is not what makes Blue weak.
   - Evidence: The conclusion probably survives but not on the evidence given: the Blue loadout is illegal, the Scholar heal is priced deterministically and unbounded, and 11 of Scholar's 25 talents are counted as combat-inert while four of those eleven (Erudition, Deep Study, Mind and Body which grants a weapon expertise, Emotional Intelligence) permanently modify the sheet in ways that apply in combat — the brief's own census says 10 of 25, and the analysis silently raised it to 11. The defensible version: at L1-5 Scholar converts one focus and a Free Action into party sustain while Blue converts an Action plus 1-3 Investiture into one or two non-stacking binary penalties, so neither tree is idle and the claim that Blue's weakness is 'no magnitude' rather than 'no damage' stands on Blue's own text (advantage/disadvantage is one binary scalar per the primer), not on the Scholar comparison.
   - Corrected: Blue's problem is that its output has no magnitude — five disadvantage talents fold into one binary state — which is provable from Blue's text and the primer alone. The Scholar throughput comparison is too dependent on unpriceable recovery dice and an illegal Blue build to carry it.
15. **CORRECTED** — Blue's four advantage-granters (Blue Leyline Attunement, Calculated Patience, Reactive Analysis, Anticipate) collapse to one unit; Scholar's three are really one redirect (Strategize grants an advantage it did not create, Keen Insight is a consumer, Turning Point is conditional self-advantage).
   - Evidence: advantage-ledger.md lists exactly those four Blue and three Scholar entries, and the re-classification is right verbatim: Strategize = 'After you Gain Advantage using an Erudition skill, grant that advantage to an ally instead'; Keen Insight = 'After you Gain Advantage, the target must resist...'; Turning Point = 'gaining an advantage if you took a slow turn'. But 'Blue's 4 collapse to 1' overstates: Anticipate is ally-facing and lands on an influence-resistance test, so it rarely shares a d20 with the other three. Two independent units in a good round is the realistic ceiling, not one.
   - Corrected: Blue's four advantage sources deliver at most two independent units in a round (three are self-facing and can collide on one d20; Anticipate is ally-facing on a resistance test).
16. **CORRECTED** — Blue's five disadvantage-imposers are real (Pattern Recognition, Intercept, False Premise, Probability Cascade, Absolute Stillness) but 'the value is roughly 40% of what it reads'.
   - Evidence: The five are confirmed verbatim, and 15 talents across 9 trees name 'disadvantage' (Blue 5, Leader 2, Warrior 2, White/Black/Red/Envoy/Hunter/Scholar 1 each), consistent with the census's 14 producers. The '40%' figure has no derivation anywhere in the analysis — it is asserted. Drop it or replace it with the mechanism: Pattern Recognition and False Premise both write 'their next test' and Probability Cascade subsumes both, and Intercept and False Premise are both Reactions competing for the single per-round slot.
   - Corrected: Blue's five disadvantage talents deliver at most two independent penalties per enemy per round: the three 'next test' writers fold to one, and two of the five are Reactions competing for the one-per-round cap.
17. **CORRECTED** — Scholar has two literal plot-die talents (Overcharge, Contingency) and Blue zero, so on the one mechanic the design guide reserves for Blue, Scholar beats it 2-0.
   - Evidence: Neither Overcharge ('raise the stakes on a fabrial attack') nor Contingency ('remove Complication from the test of an ally') contains the phrase 'plot die'. Literal plot-die talents in all 365: exactly 3, in leyline/Red (Reckless Momentum) and heroic/Agent (Opportunist, Watchful Eye) — the census the brief supplied. On the raise-the-stakes-plus-Complication measure the counts are Agent 6, leyline/White 4 (Concordant Presence, Guiding Signal, Unity of Purpose, Pillar of Order), Scholar 2, Leader 1, Fate 1, Blue 0. Naming Scholar as the thief is arbitrary: White beats Blue 4-0 and Agent 6-0 on the same mechanic, and White's Pillar of Order literally edits a rolled plot-die face — the effect the guide calls 'the ultimate Blue expression'. Three of Scholar's five 'plotdie/Opportunity' dimension hits are crafting-scoped Opportunity-range expansions with no combat value.
   - Corrected: Blue has zero plot-die talents. The mechanic the leyline guide assigns Blue as its 'capstone identity' is held by heroic/Agent (6) and leyline/White (4); Scholar's 2 are crafting-adjacent and one of them (Overcharge) fires on a 'fabrial attack' the analysis itself cannot price.
18. **CONFIRMED** — Counterspell is the only talent in 365 that makes another character's talent fail during activation.
   - Evidence: Full-corpus scan for 'the talent fails', counter, cannot activate, 'ends a magical/sustained' returns exactly one hit: leyline/Blue Counterspell.
19. **CORRECTED** — Blue is the only tree in 365 that creates illusions, and Blue's illusion suite is six talents (Phantom Double, Phantom Barricade, Holographic Illusion, Living Image, Phantom Step, Ghostly Walls).
   - Evidence: Exclusivity confirmed: 'illusion/illusory' appears in 4 talents — Blue's Holographic Illusion, Living Image, Phantom Double, and leyline/Green's Natural Order, which only denies enemies the benefit of illusions and creates none. But the six-talent suite is inflated: Phantom Barricade is 'a shimmering barrier ... has health equal to 2[Die]', Phantom Step is ally movement, Ghostly Walls sets movement rate to 0. Those three are the Illusion *specialty label*, not illusions. Three talents create an illusion.
   - Corrected: Blue is the only tree in 365 that creates illusions, in three talents (Phantom Double, Holographic Illusion, Living Image); the other three 'Illusion' entries are specialty-labelled effects that create no illusion.
20. **CONFIRMED** — Scholar is the only tree in 365 that grants or reassigns skill ranks (five talents); the only tree with fabrials (five talents); Turning Point is one of only two party-wide extra-Action grants.
   - Evidence: Skill-rank granting/reassignment: Erudition, Deep Study, Mind and Body, Emotional Intelligence, Deep Contemplation — all Scholar, no other tree. 'fabrial' appears in exactly 5 talents, all Scholar. Party-wide Action grants: Scholar's Turning Point ('you and your allies gain an Action on your next turns') and heroic/Leader's Synchronized Assault ('allies up to your ranks in Leadership gain an Action') — exactly two.
21. **CORRECTED** — deity/Order's Shoulder the Oath strictly dominates leyline/White's Shared Burden: free vs 2 Investiture, Attunement Range vs adjacent, L2 vs a 'truly L6' Shared Burden, and three effects vs one.
   - Evidence: Both texts confirmed verbatim, and Order's version does genuinely do three things (take half, reduce the ally's remaining half by your ranks in White, both gain temp HP equal to your ranks in White) against White's one. Two corrections. (1) Shared Burden is gated 'Strength 3+; White 2+' — Strength is an attribute, so the L6 claim is unsupported; at depth 2 it is L3. The real gap is one level, not four. (2) Shoulder the Oath is free per use but not free: it requires Covenant (1 Action + 1 Investiture per ally, sustain up to your tier) and the Blue 2+/White 2+ deity gate. The domination finding survives; the size of it is overstated.
   - Corrected: Shoulder the Oath (L2, free per use, behind a 1-Action/1-Investiture Covenant) does three things where Shared Burden (L3, 2 Investiture, adjacent only) does one — a real but one-level, setup-cost-bearing gap, not a four-level free lunch.
22. **CORRECTED** — A colour skill rank is used as a magnitude in RED 16, GREEN 11, BLACK 9, BLUE 8, WHITE 4 talents — and half of every use of 'ranks in White' in the entire game is in a deity tree.
   - Evidence: Scanning descriptions, authored text and roll formulas for 'ranks in <colour>' / '<colour> modifier' / @skills.<colour>.rank: WHITE 6 — leyline/White's Shared Conviction ('add your White modifier to their result'), Bound by Word ('use your White modifier in place of their own'), Mending Aura and Retributive Guard (@skills.white.rank), plus deity/Order's Bear Witness and Shoulder the Oath. The analysis missed the two 'White modifier' talents. So one third sits outside White, not half. BLACK 9 and BLUE 8 reproduce exactly; my broader scan gives RED 17 and GREEN 13. White remains last by a wide margin, so the direction of the finding survives.
   - Corrected: White is used as a magnitude in 6 talents — the fewest of the five colours (Red 17, Green 13, Black 9, Blue 8) — of which 4 are in leyline/White and 2 in deity/Order.
23. **CONFIRMED** — Order's White 2+ is not a pure toll booth (two Order talents scale on ranks in White); the audit's other four toll booths stand.
   - Evidence: Bear Witness and Shoulder the Oath both pay in 'your ranks in White'. deity-gate-audit's columns read only the skill test field and the damage-die sizer, and miss a colour rank used as a flat additive. Sovereignty, Civilization, Fate and Knowledge produce no hits in any White/Green magnitude scan, so their toll booths stand.
24. **CONFIRMED** — White has zero temp-HP talents; the atlas's 14 are Order 3, Power 2, Life 2, Sovereignty 2, and one each in Black, Green, Civilization, Death, Fate. Determined census: Envoy 3, White 1.
   - Evidence: 'temporary health/HP' scan returns exactly 14 talents in exactly that distribution, with no leyline/White entry. 'Determined' returns 4 talents: heroic/Envoy's Rousing Presence, Inspired Zeal, Instill Confidence and leyline/White's Collective Resolve.
25. **REFUTED** — Ally damage mitigation returns 5 talents in the whole game: 4 White + 1 Order. Nothing else in the atlas does free, permanent, untriggered, multi-target damage reduction.
   - Evidence: The census is wrong. Ally-facing mitigation also exists in deity/Life (Overgrowth '+1 Deflect until end of scene, stacks to 3', Apex Form '+2', Lifeline 'when that creature takes damage you may take up to half instead'), deity/Power (Mantle of the Aspirant redirects damage outward to allies), deity/Order (Shoulder the Oath), heroic/Warrior (Formation Drills 'Allies within 10 ft who Brace gain the benefits of your Defensive Position'; Stonestance taxes enemies attacking your allies) and heroic/Envoy (Withering Retort, self-only). The narrower claim does survive: Guardian Stance ('While an ally is adjacent to you, you both gain +1 Deflect') and Shield Wall ('When two or more allies are adjacent to you, attacks against them deal half [Tier][Die] less damage') are the only free, permanent, untriggered, multi-target reductions in the corpus.
   - Corrected: White holds 5 of roughly a dozen ally-mitigation talents across the atlas, and is the sole owner of free, permanent, untriggered, multi-target damage reduction (Guardian Stance, Shield Wall).
26. **CONFIRMED** — heroic/Envoy out-produces White's Coordination lane: Rousing Presence is the free Key at L1 granting scene-long Determined against White's Collective Resolve (Opportunity + 1 Investiture, depth 3, L4); Devoted Presence removes four conditions for 1 focus at L2 against Beacon of Stability's one condition for 1 Investiture plus a Draw Mana at L3.
   - Evidence: All four texts verbatim, and Rousing Presence's specialty field is 'Key' (Envoy's only Key). Rousing Presence: 'An ally becomes Determined until end of scene.' Practical Demonstration (Free Action, depth 0, L1, Leadership 1+): 'When you Gain Advantage or hit with an attack, use your Rousing Presence as a Free Action.' Devoted Presence removes Prone, Slowed, Stunned and Surprised. Collective Resolve is the AoE edge the analysis names, and White's Determined carries no stated duration against Envoy's 'until end of scene' — Envoy wins on that axis too.
27. **CORRECTED** — Overall verdict: Blue and Scholar are DISTINCT, confidence 0.85.
   - Evidence: The verdict survives on text: 17 of 25 Blue talents and 18 of 25 Scholar talents have no correspondence at all; the currencies are disjoint (Blue spends Investiture in 16 of 25 and Focus in 1; Scholar spends Focus in 7 of 25 and Investiture in exactly 0); the specialty splits are 8/8/8 each and Blue's whole Illusion third has zero Scholar contact; Scholar heals and rewrites the character sheet, Blue does neither. But the confidence figure was carried by a metric that only reaches rank 111 once four hand-chosen dimensions are added — the honest bug-fix-only figure is rank ~25 of 210 — and by a Keen Insight level that is wrong. Confidence should sit around 0.75, resting on the correspondence table and the currency split, not on any cosine.
   - Corrected: DISTINCT, confidence ~0.75, on the text-level correspondence table (17/25 and 18/25 with no correspondence), the disjoint currencies (Blue 16/25 Investiture and 0 heals; Scholar 0/25 Investiture, 7/25 Focus, 3 heal formulas) and the Illusion/Artifabrian specialty split — not on the rebuilt cosine.

### What the analysis missed

- The plot-die finding points at the wrong tree and the analysis had the evidence in its own brief. DESIGN-GUIDE-CLAIMS.md line 89 gives Blue 'Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression' — and line 82 gives leyline/White 'Key mechanic: Plot Die integration' in the same document. Two leyline trees are assigned the same key mechanic, Blue has zero implementations, and White has four (Concordant Presence, Guiding Signal, Unity of Purpose, and Pillar of Order, which literally changes a rolled Complication to a blank face). The overlap problem starts in the design guide, exactly the failure mode the brief told the analyst to look for, and the analysis chased Scholar's two crafting-adjacent hits instead.
- The Scholar intent file settles the trigger question from the designer's own side and was not used: 'Other Heroic Paths. The Agent and Envoy paths make excellent multi-path choices.' The two paths the designer recommends pairing with Scholar are precisely the two Scholar duplicates most (Envoy: Collected + Clear Mind; Agent: Collected plus the shared filler bench). Blue is not mentioned anywhere in Scholar's intent, and Scholar is not mentioned in Blue's. That is free, designer-sourced support for DISTINCT.
- The section 7 Blue loadout is illegal under iron rule 7 — Phantom Barricade's connections are ['Phantom Double'], a managed prerequisite, and Phantom Double is not among the five picks. A head-to-head that prices a turn must price a legal build.
- Blue's specialty structure is the cleanest structural argument for DISTINCT and never appears: Blue is Key 1 / Foresight 8 / Calculation 8 / Illusion 8, Scholar is Key 1 / Artifabrian 8 / Strategist 8 / Surgeon 8. A full third of Blue (Illusion) and a full third of Scholar (Artifabrian) have literally zero contact with the other tree. That is 16 of 50 talents excluded from collision before any regex runs.
- Strength 3+ is an attribute gate, not a skill-rank gate, so Shared Burden is not 'truly L6' and White's own-3+ count in section 9 is 4, not 5. The analysis applied the primer's rank-cap table to a stat the primer explicitly treats as an attribute (Health = 10 + STR).
- Blue's Composed is close to dead weight for a reason the analysis's own currency table implies but never states: Composed raises maximum focus, and exactly one Blue talent in 25 spends focus (Counterspell, 2 focus). Blue's section 7 'inert in combat' count of 3 should probably be 4.
- Scope leak in the section 8 recommendation: the only existing consumer of the edha-next-test-mod formula field is the adversary ability Probability Net. Nothing inside the 365-talent fence demonstrates the primitive works, so the recommendation cannot be validated in scope — say so.
- Baleful and Anticipate are L7, not L6, by the analysis's own chain rule (each hangs off a Blue 3+ parent). Applying the rule to Absolute Stillness and Turning Point but not to these two is inconsistent.

### Surviving findings, in priority order

1. The verdict stands: Blue and Scholar are distinct. 17 of 25 Blue talents and 18 of 25 Scholar talents have no correspondence in the other tree; the two overlaps (Collected, the +focus stat stick) are five-tree shared stock that carries no identity; the currencies are disjoint (Blue 16/25 Investiture, Scholar 0/25 Investiture and 7/25 Focus); Scholar heals three ways and rewrites its own skill sheet, Blue does neither. Confidence ~0.75, on text, not on any cosine.
2. Section 9 is the analysis's most valuable output and it survives verification exactly: the dossier's earliestLevel column applies the rank-3 -> level-6 rule only to leyline colour ranks and therefore understates every heroic tree. Chain-corrected, every 25-talent tree has 6-8 talents behind a level-6 wall (Blue 8, Green 8, White 8, Agent 7, Black 7, Red 7, Leader 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6). Any parity analysis built on that column is wrong for Agent, Envoy, Hunter, Scholar, Warrior and Leader. Blue's deep tree is also the cheapest in the game to unlock (6 ranks in two skills against Scholar's 12 in four).
3. The deal_damage classifier is 77% blind — it misses 33 of the 43 formula-carrying talents, name for name as the analysis lists them. This is the third predicted classifier bug and it corrupts every pair in the shipped top-15, including the Blue<->Red 0.864 that made the brief's list. Fix the regex before any further use of functional-overlap.js.
4. The similarity metric cannot settle this question and the analysis's own rebuild proves it: dropping three sentence-shape dimensions moves Blue<->Scholar from rank 10 to 20, fixing deal_damage moves it to 25, and four hand-added dimensions move it to ~122 — while the same rebuild moves White<->Leader from rank 162 to the low 40s. Retire the cosine as an arbiter and keep the correspondence tables.
5. Blue's real defect is magnitude, not damage, and this is provable from Blue's text plus the primer alone. Five disadvantage talents write to one binary scalar; three of them target 'their next test' and Probability Cascade subsumes both of the others; two of the five are Reactions competing for one slot. The proposed fix (give Blue's deep nodes the already-summing edha-next-test-mod formula penalty, scaled on [Tier][Die], against Scholar's skill-rank-scaled Exhausted) is the right shape — with the caveat that its only precedent is an out-of-scope adversary ability.
6. White, not Scholar, is the tree being hollowed out, and the analysis is right about the mechanism even where its numbers need repair. deity/Order's Shoulder the Oath (L2, free per use behind Covenant) does three things where White's Shared Burden (L3, 2 Investiture, adjacent only) does one, and pays out in ranks in White — a magnitude White itself uses in only 4 of its 25 talents, the fewest of any colour (Red 17, Green 13, Black 9, Blue 8, White 6 total). heroic/Envoy's Rousing Presence chain beats White's Collective Resolve and Beacon of Stability on cost, level and breadth. White's surviving exclusive is free, permanent, untriggered, multi-target damage reduction (Guardian Stance, Shield Wall) — not the five-talent monopoly the analysis claimed.
7. One genuine mechanical collision remains between Blue and Scholar, and it is worse than the analysis concluded: Scholar's Keen Insight is level 4, not level 6, costs no Investiture, and fires off any Gain Advantage, while Blue's Pattern Recognition costs 1 Investiture and needs a successful contested Cognitive test. If Blue is to own 'making an enemy's die worse', Keen Insight's disadvantage clause is the line to redraw — re-cut it as an Exhausted[-X] rider, which Scholar already owns via Anatomical Insight.
8. The design guide gives 'Plot Die' as a key mechanic to two different leyline trees (Blue line 89, White line 82). Blue implements none of it; White implements four; heroic/Agent implements six including the exact face-conversion effect the guide calls 'the ultimate Blue expression'. Either take the plot die off Blue's identity statement or build it, but the collision to fix is White/Agent versus Blue, not Scholar versus Blue.
