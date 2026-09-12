# Deity-vs-deity parity

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `deity-parity`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# Deity-vs-Deity Parity — the ten domain trees measured against each other

**Scope:** the 90 deity talents (10 trees × 9). Everything numeric below is re-derived from `all-talents.json`, the dossier texts, and — where the prose was ambiguous — the authored Foundry overlay in `C:\dev\Skilltrees\data\authored\deity-*.json` and the rule schemas in `C:\dev\Skilltrees\module-src\scripts\engine\53-native-event-system.js`. Where I disagree with the deterministic census I say so and show the check.

---

## 0. Headline answers

1. **No, the ten deity trees are not similar in power.** The spread is roughly **6:1** in per-round combat swing between the top and the bottom. That is a wider spread than exists between the five leyline trees.
2. **Strongest: deity/Knowledge.** It contains the highest single-Action damage expression in all 365 talents (`Predatory Strike` at Insight cap = 5 × [Tier][Die] Vital = **45 mean at Tier 2**, for 1 Action and 1 Investiture), and the multiplication is **implementation-verified**, not just prose (see §8b — the census's roll-formula stream under-reads it).
3. **Weakest: deity/Sovereignty**, by the largest defensible margin in the analysis. Its two entries cost 1 Action + 1 Investiture each to move one damage die **one step for one round** (≈ ±1 point per die rolled). Every other deity tree's 1-Action/1-Investiture entry buys either a full [Tier][Die] of damage or a **scene-long** asset.
4. **The two-colour gate is NOT priced consistently.** Six trees need **4 skill ranks** for full access; Order needs 5; **Knowledge, Life and Sovereignty need 6** — a 50% surcharge, plus a hard level-6 wall on 2 of their 9 talents.
5. **The census's toll-booth list is wrong, and in the tree's favour in one case and against it in two.** Checked against both the prose and the authored implementation, there are exactly **two pure toll booths — Fate/White and Knowledge/Green** — colours a tree charges rank for and then references *nowhere*, not in a test, not as a number, not in a single formula in its authored file. Order/White, Civilization/White and Sovereignty/White all pay out; the census missed them because it only looked at tests and damage-die sizing.
6. **Several deity trees converge, but Destruction↔Fate is not the most important case.** There are **three verbatim template families** running across four, three and two trees respectively (§7), and the closest functional pair on my independent vector is **Chaos↔Knowledge (0.827)**, not Destruction↔Fate (0.769/0.779).
7. **"Radiant-equivalent power" is half-delivered.** The deity premium is real but it is paid out in **duration and clause-count**, not in numbers: 39% of deity talents create a scene-long effect vs 4.8% of leyline and 0% of heroic; deity descriptions average 49.1 words vs 23.1 leyline. But on **raw damage per Action** and on **hard control**, `leyline/Black`'s two depth-0, level-1 talents (`Withering Ray`, `Hollow Command`) beat most of the deity atlas outright (§8).

---

## 1. Method — the unit, and what "power" is measured in

**U = one [Tier][Die].** At Tier 1 / rank 2 (levels 1–5) U = 1d6 = **3.5**. At Tier 2 / rank 3 (levels 6–10) U = 2d8 = **9**. All damage below is in U and in Tier-2 points, because that is where the deepest nodes actually live.

**Why 9 talents is nearly a whole character.** Advancement is 1 talent per level. At level 9 a character holds 9 talents *total, across every tree they touch*. A 9-talent deity tree with a fixed DAG is therefore a near-exclusive commitment, and by the last slot there is **no choice left**. A leyline tree offers 25 talents for the same 9 slots (≈2.8 options per slot). **A deity talent has to be stronger than a leyline talent just to break even on lost optionality** — which is exactly why the designer's "Radiant-tier" intent is the right target, and why §8 tests whether it is met.

**Deployment cost, all nine talents once** (Passives, Free Actions and Reactions cost 0 Actions):

| Tree | Actions to deploy all 9 | Investiture to deploy all 9 | Free-value talents (0 Action, 0 Investiture) | In-tree Investiture regen |
|---|---|---|---|---|
| Knowledge | **8** | **10** | 3 (Accumulate, Hunter's Discipline, Death Mark) | 1 (Accumulate) |
| Order | 9 | **10** | 3 (Bear Witness, Lawkeeper's Eye, Shoulder the Oath) | 0 |
| Destruction | 9 | **10** | 3 (Concussive Yield, Walking Ruin, Combustion Chain) | 0 |
| Fate | 9 | 11 | 2 (Bulwark Ground, Hexmark) | 0 |
| Sovereignty | 10 | 13 | 2 (Expose, Sovereign's Favor) | 1 (Expose) |
| Civilization | 11 | 11 | 2 (Tempered Edge, Bonds of Community) | 0 |
| Life | 11 | 13 | 1 (Prognosis) | 1 (Prognosis) |
| Chaos | 12 | 14 | 1 (Void Sense) | 1 (Void Sense) |
| Death | 13 | 14 | 1 (Reaper's Harvest) | 1 (Reaper's Harvest) |
| **Power** | **14** | **15** | **0** | **0** |

**deity/Power is the only tree in the atlas with zero free-value talents.** Its one Free Action (`Momentum of Victory`) costs 1 Investiture **and an Opportunity**, and Power contains no Opportunity producer. It also has zero Passives, zero Reactions and zero Specials — every single point of output costs an Action *and* Investiture, and it spends the most Investiture in the atlas with no regen.

**Action-type distribution vs the deity guide's own targets** (Passive ~25–30%, Special ~15–20%, Free ~10–15%, Reaction ~10%, 3-Action = capstone only):

| Tree | Pass | Spec | 1A | 2A | 3A | Free | Reac | Meets Passive target (2–3 of 9)? |
|---|---|---|---|---|---|---|---|---|
| Chaos | 1 | 0 | 3 | 3 | 1 | 0 | 1 | ✗ |
| Order | 2 | 0 | 2 | 2 | 1 | 1 | 1 | ✓ |
| Civilization | 1 | 0 | 2 | 3 | 1 | 1 | 1 | ✗ |
| Death | 1 | 0 | 4 | 3 | 1 | 0 | 0 | ✗ |
| Destruction | 2 | 0 | 2 | 2 | 1 | 1 | 1 | ✓ |
| Fate | 1 | 0 | 2 | 2 | 1 | 2 | 1 | ✗ |
| Power | **0** | 0 | 3 | **4** | 1 | 1 | **0** | ✗ |
| Life | 1 | 0 | 6 | 1 | 1 | 0 | 0 | ✗ |
| Knowledge | **3** | 0 | 5 | 0 | 1 | 0 | 0 | ✓ |
| Sovereignty | 2 | 0 | 5 | 1 | 1 | 0 | 0 | ✓ |

The census's "zero Specials across all ten" is confirmed. Note the shape it produces: **Knowledge, Life and Sovereignty are 1-Action trees** (5–6 of 9), and Power is the only 2-Action-heavy tree (4 of 9). None over-subscribes the 1-Reaction-per-round cap (max 1 Reaction each), unlike leyline/White's seven.

---

## 2. The ranking

| # | Tree | Sustained output at T2 (per round) | Entries | Capstone | Coherence | Gate ranks |
|---|---|---|---|---|---|---|
| 1 | **Knowledge** | ~10U vital = **90** (2 × Predatory Strike at cap) | A+ / A | C — dominated by a depth-1 node | A+ | **6** |
| 2 | **Civilization** | **4U = 36 free** (0 Actions spent), + your 3 Actions unspent | A+ / A | A | B+ | 4 |
| 3 | **Destruction** | 1U AoE per Action, no roll, no save (3U+ vs a cluster) + persistent terrain ticks | A / A | A+ | A− | 4 |
| 4 | **Death** | ~2U free after ~3 rounds of installs, + 1U+WIL on demand | A / A | **D — the atlas's worst** | A+ | 4 |
| 5 | **Order** | 1U+INT per Edict violated (enemy-controlled) + free party-wide advantage | A− / B+ | A− | A | 5 |
| 6 | **Life** | 0 own damage; +Tier Vital on **every party attack** vs the mark, scene-long | **A+** / B+ | B+ | B+ | **6** |
| 7 | **Power** | 1U + weapon per Action, all melee | B+ / B+ | **A+** | B | 4 |
| 8 | **Fate** | 1U+AWA per Snare — enemy-triggered until depth 2 | B+ / B | B | A | 4 |
| 9 | **Chaos** | 1U spirit per Action, Deflect-ignoring | B+ / **D** | C — hard-capped at Tier targets | A+ | 4 |
| 10 | **Sovereignty** | **0 damage.** ≈±1–2 pts per enemy/ally damage die | **D / D** | C | A | **6** |

Tiers: **A — Knowledge, Civilization, Destruction.** **B — Death, Order, Life, Power.** **C — Fate, Chaos.** **D — Sovereignty.**
Fate/Chaos at 8–9 is the closest call in the list; my reasoning is in §3.8–3.9.

---

## 3. Tree by tree

### 3.1 Knowledge (Red + Green) — #1

**The engine.** `Studied Mark` (d0, L1, 1A/1I) places **2 Insight** and reads the target's HP, conditions and both defences. `Accumulate` (d1, L2, free Passive) adds **1 Insight per turn** and refunds **1 Investiture per round** whenever the mark takes damage from any source. `Predatory Strike` (d0, L1, 1A/1I) is a weapon attack that adds **[Tier][Die] Vital per Insight**, then places 1.

**Verified, because it is load-bearing.** The census's roll-formula stream reads Predatory Strike as a flat `(@tier)d(2*@skills.red.rank+2)` — one U. That is **wrong as a measure of the talent**. The multiplication lives in the authored `edha-damage-bonus` rule:

```
"amountFormula": "((@tier)d(2 * @colorRank + 2)) * max(@counter, 1)",
"counterStatus": "insight", "placeCounter": 1, "capFormula": "5"
```
(`data/authored/deity-knowledge.json`, `PredStrikeRider0`)

and the engine schema field confirms the semantics: *"The rolled formula is multiplied by max(count, 1) — ONE roll, then ×N, Killing Blow's 'per Insight'"* (`53-native-event-system.js:1352`). So it really is one roll × Insight, capped at 5.

**The number.** At Insight 5, Tier 2, Red 3: `2d8 × 5` = **45 Vital** (Deflect-ignoring) **per Action**, on top of the weapon's own damage, for 1 Investiture. Sustained: Draw Mana (1 Action → +2 Investiture) + Accumulate (+1/round) funds 2 Predatory Strikes per round = **~90 Vital per round**. Even at Tier 1 the ramp is brutal: at level 3 with Studied Mark + Predatory Strike + Accumulate, turn 2 is `5U × 3 Actions` = 15d6 ≈ **52** at level 3.

**Ceiling caveats, stated:** (a) Insight lives on **one creature at a time** — against three enemies Knowledge collapses to 1U per Action; (b) it needs weapon hits and the tree supplies **no accuracy** at all; (c) reaching cap takes ~3 turns.

**Capstone failure.** `The Final Study` (3A/3I, once per scene) does `[Tier][Die] × Insight` and then hands each ally a free Strike. `Killing Blow` (d1, **1 Action**, 2I) does the *same damage clause* for one third of the action cost. The capstone is dominated by a shallower node on its main clause — the guide's own "Capstones that don't pay off" pitfall, inverted.

**Gate:** Red 3 pays for itself (it sizes **all three** of the tree's damage formulas; `deity-knowledge.json` references `skills.red.rank` **10 times**). **Green 3 buys nothing** — 0 tests, 0 numeric reads, **0 references anywhere in the authored file**. It is the most expensive pure toll booth in the atlas.

**Gaps:** zero control, zero protection, zero healing, zero mobility, zero Reactions.

---

### 3.2 Civilization (Red + White) — #2

**The engine, and why it ranks this high.** `Forge Construct` (d0, **L1**, 1A/1I) is on the evidence the **best value-per-Action entry in the deity atlas**: one Action and one Investiture at level 1 buys a persistent second body with its own HP, its own initiative slot, deflect 1, and an attack **every round for the scene, at zero further cost**. `Tempered Edge` (d1, free Passive) adds `[Tier][Die]` energy **and makes the melee attack ignore Deflect**. `Arsenal` (d2, 2A/2I, once) grants a second attack per turn plus a move-and-free-Strike on a kill.

At level 3 with those three: **2 attacks × (1U impact + 1U Deflect-ignoring energy) = 4U = 36 damage per round, for zero Actions and zero ongoing Investiture**, while your own three Actions remain free. That is the highest *free* damage in the deity atlas by a distance.

**The second entry also delivers.** `Lay Foundation` is a **Free Action** for 1 Investiture: a 10-ft square, allies beginning their turn in it get +1 to all defences, sustain up to Tier. Both entries deliver the fantasy at L1 exactly as the guide demands.

**Capstone.** `Magnum Opus` (3A/3I, once per scene) upgrades the Construct into a Colossus with 2U extra HP, +2 defences, reach 10 ft, a 10-ft splash of 1U energy with a Prone save, and +2 defences to every ally in a Foundation. It pays off the tree.

**The unresolved hole — and it is the biggest single uncertainty in this whole ranking.** *The Combat Construct's attack bonus is never defined.* The talent text gives HP, Speed, defences, deflect and damage but no to-hit. Nor does the implementation: `edha-summon`'s schema exposes `attackName / attackFormula / attackType / attackRange` and **no accuracy field** (`53-native-event-system.js:1817–1846`). The same hole applies to Death's `Risen Servant`. **What would settle it:** a ruling on what a summon rolls to hit. If it is "the caster's attack test", Civilization is arguably #1; if it is a flat low number, its 36/round is materially discounted.

**Weaker links.** `Trade Routes` (1A/1I) needs *two* active Foundations, which needs Tier 2 (cap = tier) — so it is dead weight for the whole of levels 1–5. `Siege Form` spends 2 Actions and 1 Investiture to set your own attacker's Speed to 0.

---

### 3.3 Destruction (Blue + Red) — #3

**Why it out-ranks everything except raw output: reliability.** `Set Charge` (d0, L1, 1A/1I) places a Charge with a **player-declared trigger**, and *"You may detonate any of your Charges as a **Free Action** on your turn."* On detonation, **every character within 10 ft takes [Tier][Die] energy — no attack roll, no save** — and the point becomes dangerous terrain for the scene. Nothing else in the deity atlas delivers guaranteed area damage at that action cost. Against three clustered enemies that is **3U = 27 per Action** with zero variance.

Six damage formulas, the most of any tree. `Pyre` gives a second, ranged entry that also lays terrain. `Walking Ruin` (free Passive) turns every square you move through into dangerous terrain **and gives +10 ft Speed**. `Fault Line` (2A/2I) is a 60 × 5 ft line for 1U+STR with a Prone save, leaving terrain, and **triples damage to structures and Constructs** — a written hard counter to Civilization's whole tree.

**Capstone.** `The Unmooring` is the model the deity guide prescribes verbatim: all Charges detonate at once, radii widen to 15 ft, **ignoring Deflect**, and every dangerous-terrain square you have laid all scene merges into one hazard whose tick upgrades to a full [Tier][Die]. Best-in-atlas payoff-of-investment.

**Gaps:** zero healing, zero protection, zero resource generation, and **not one of its nine talents mentions an ally**. Blue is a near-toll (sizes exactly one formula, `Pinpoint Charge`).

---

### 3.4 Death (Black + Green) — #4

**The only tree whose economy is solved by an entry.** `Reaper's Harvest` (d0, **L1**, free Passive) recovers **1 Investiture per character dropping to 0 HP in Attunement Range, with no once-per-round cap**, marks the corpse, and starts each scene with 1 Remain. Four of the nine talents cost 1 Investiture; in a fight where things die, Death pays for itself.

**An install tree.** Its steady state is free damage from things you paid for once: `Consuming Decay` (2A/2I) = 1U Vital at the start of every target turn for the scene, **and you heal half of it**; `Necrotic Cascade` (1A/1I) = 1U spirit to everything within 10 ft of any drop, for the scene; `Bone Garden` (1A/1I + a Remain) = a difficult-terrain square dealing 1U keen per turn ended in it. Plus `Withering Touch` on demand (weapon + 1U+WIL Vital + **the atlas's only heal-denial**).

**The worst capstone in the deity atlas.** `Raise Dead` costs **3 Actions and 4 Investiture** — the highest single cost of any of the 365 talents — once per scene, to return a body at **1 HP, Disoriented, with one additional injury** the tree cannot remove. It produces zero value in the round it is cast, in a tree whose engine is combat installs. Compare Power's `Mantle of the Aspirant` at 3A/3I for four scene-long clauses.

**Authoring bug found (the only real one in the deity atlas).** Raise Dead's card reads `prereq: Necrotic Cascade or Speak with the Fallen`, but its managed `connections` are `["Necrotic Cascade", "Risen Servant"]`. Per iron rule 7, `connections` are the requirement Foundry enforces. **So `Speak with the Fallen` does not unlock Raise Dead despite the card saying it does, and `Risen Servant` does despite the card not saying so.** This is the third, ungated failure mode iron rule 7 names — prose and connections naming different parents.

**Gaps:** no mobility, no hard control, **zero Reactions, zero Specials, zero Free Actions** (0 of 9 each), and no talent uses the word "ally".

---

### 3.5 Order (Blue + White) — #5

**Its best talent is free.** `Lawkeeper's Eye` (d1, L2, free Passive) is, clause for clause, the strongest untriggered party effect in the deity atlas: *"you learn the bound character's intended action on its next turn. While you can see a character bound by one of your Edicts, **you and your allies have advantage on attack tests against that character**."* Permanent, no action, no cost, party-wide — and because advantage is binary, being the *only* source of it against a focused target is exactly the case where it is worth full price.

`Covenant` (d0, 1A/1I) is a scene-long mutual +1 to all defences plus Aid at Attunement Range. `Shoulder the Oath` (free Reaction) is the best damage-redirection clause in the game: take half the damage, **reduce the remainder by your ranks in White**, and *both* of you gain temp HP = ranks in White. `Bear Witness` (free Passive) pays temp HP = ranks in White to every Covenant ally **every round**, forever — over a 5-round fight with 2 Covenants that is ~30 temp HP for zero Actions.

**The structural weakness: its damage is the enemy's choice.** An Edict deals nothing until the bound character *takes the prohibited action*, and a competent enemy simply doesn't. The fix, `Verdict` (d2, L3, 2A/2I), forces the violation on a Blue-vs-Cognitive test and splashes 1U spirit — but that is 2 Actions and 2 Investiture, two levels deep, to make the entry reliable.

**Economy:** 10 Investiture to deploy, **zero regen**. Order is one of four deity trees with no Investiture producer at all.

**Gate correction:** the census lists Order/White as a toll booth. It is not. White is never *tested*, but it is consumed as a **number in three clauses across two talents** (`Bear Witness`, `Shoulder the Oath` ×2), and `deity-order.json` references `skills.white.rank` **four times** — the same count as Blue. Order's gate is honestly priced.

---

### 3.6 Life (Blue + Green) — #6

**The best single entry in the deity atlas, by value per Investiture.** `Vital Diagnosis` (d0, **L1**, 1A/1I, **no test**): exact HP, max HP, conditions and both defences, **for the scene**, plus *"You and allies dealing damage to the Diagnosed creature deal additional Vital damage equal to your Tier."* At Tier 2 with a four-PC party making 8 attacks a round against the mark, that one Action is **+16 Deflect-ignoring damage per round, forever**. Nothing else in the deity atlas converts one Action into that much sustained party output.

`Prognosis` (d1, free Passive) then refunds 1 Investiture per round from the party's own offence and adds 1U to any Life heal on a conditioned target. `Surgical Precision` heals `2[Tier][Die]` — the **largest heal expression in the game** — and removes a condition.

**The two problems.**
1. **Zero damage of its own** — all nine talents are riders, heals or mitigation.
2. **Two of nine are level-6 walled**: `Adaptive Mutation` (Green 3+) and `Surgical Precision` (Blue 3+), both at *depth 1*. Life at levels 1–5 is a seven-talent tree. And **Blue 3 is nearly a toll**: `deity-life.json` references `skills.green.rank` **11 times and `skills.blue.rank` zero times** — Surgical Precision *tests* Blue but *heals on Green's die*. Three skill ranks for one test bonus on one talent.
3. **Zero Reactions, zero Free Actions, zero Specials** — six of the nine are 1-Action.

---

### 3.7 Power (Black + Red) — #7

**The highest ceiling, the worst floor.** `Absolute Authority` (d1, 2A/2I) — *"you choose the target's action on its next turn"* — is the single strongest control effect in the deity atlas. `Mantle of the Aspirant` is one of the two best capstones in the atlas: scene-long, four clauses (+2 all defences, +Tier spirit on melee, **allies +1 to all tests**, redirect up to Tier damage to willing allies).

**And then the economy.** 15 Investiture to deploy (highest), **zero regen**, **zero Passives, zero Reactions, zero Specials**, and its only Free Action needs an Opportunity the tree cannot produce. Fourteen Actions to deploy all nine — the worst in the atlas.

**The control is priced badly at the entry.** `Kneel` (1A/1I + a contested test) makes the target Compelled for one round: *"must spend its next action either moving toward you or doing nothing."* Per the primer, that is **one Action of three** — roughly a third of a turn, for a full Action, an Investiture and a test that can fail. And `Absolute Authority` requires the target to already be Compelled, Frightened or Weakened — **Frightened is produced by no talent in the 365**, so the enabler is Kneel (another Action + Investiture) or the free Black Attunement Key's Weakened. Real cost of dictating one enemy turn: 3 Actions and 3 Investiture across two rounds.

**A promised resource that does not exist.** The path description sells *Bounty* — "a tally of the fallen; each enemy slain within your range adds one." No talent names it. `Warlord's Fury` implements an unnamed equivalent and caps it at **Tier × 2 = +4 flat damage at Tier 2**, bought for 2 Actions and 2 Investiture at depth 2. For comparison, `leyline/Red`'s **Mighty** — a free, permanent Passive that also ships verbatim in six trees — grants *"for each action spent, deal extra damage equal to 1 + your tier"*, i.e. **+6 on a two-Action attack, forever, for nothing**. A shared leyline stat-stick beats Power's signature.

---

### 3.8 Fate (Green + White) — #8

**The most elegantly-built tree in the atlas, and one of the least reliable.** Two token types (`Ordained Ground`, `Snare`), and every one of the other seven talents reads one of them. `Ordained Ground` is a **Free Action** for 1 Investiture — it costs no Action at all — and `Bulwark Ground` (free Passive) adds temp HP per round **and** *"attacks against that ally cannot benefit from advantage"*, which given the binary advantage scalar is a genuinely strong denial clause. `Snare` owns the atlas's **only untested Restrain**.

**The structural problem is trigger ownership.** A Snare pays out only when an enemy chooses to walk onto one specific 5-ft square. Fate **cannot spring its own traps at all** until `Foreknown Strike` at depth 2 (L3, 2A/2I) — and even then the trigger is handed to an *ally's* Free Action. Compare Destruction, whose entry Charge is detonated by the placer as a **Free Action** from turn one. Same structural job, opposite control.

Five of nine talents require an ally to voluntarily stand on a designated square. Zero healing, zero Investiture regen, zero self-mobility, zero Opportunity/Plot-Die interaction despite gating on White.

**Gate: White is a genuine pure toll booth.** Zero tests, zero numeric reads, zero formulas, and **zero occurrences of `skills.white.rank` in `deity-fate.json`** (which references `skills.green.rank` three times and White not once). Fate charges White 2+ and never touches it.

**Capstone caveat.** `Thread of Inevitability` triggers *every* unsprung Snare "in its space, treating the center as the triggering character" — so the Snares fire on **empty squares** unless enemies happen to be standing on them, and there are at most Tier (= 2) of them.

---

### 3.9 Chaos (Blue + Black) — #9

**A tight loop with a broken second entry.** The Omen appears in all nine talents; the loop is clean; `Shatter Focus` is the atlas's only forced enemy reroll; `Unweaving` is the only talent in the 365 that ends an already-running magical buff or stance. Its damage is entirely **Deflect-ignoring** (spirit and vital throughout) and its per-Action rate is reliable: `Entropy Strike` 1U spirit for 1 Action / 1 Investiture, `Isolating Ruin` 2U + 2×AWA vital for 2 Actions.

**The second entry fails the guide's own primary test.** `Isolating Pressure` (d0, L1, **1 Action, 2 Investiture** — half a level-1 pool) reads: *"the target is Isolated until the start of your next turn. **If the target bears an Omen**, also remove it and deal [Tier][Die] + Awareness vital damage."* Omens come from the *other* entry. At level 1 a character owns exactly one talent, so a player who takes Isolating Pressure alone spends an Action and half their Investiture to apply a **state that nothing they own reads**. That is precisely the deity guide's Revision Principle 1 ("Fantasy on the first talent — from *both* entries") and its own "Single-entry trees" pitfall. It is partially rescued later by out-of-tree Black talents (`Severance`, `Sapping Hex`), but not at the level where entries are supposed to land.

**The capstone is capped out of existence.** `Unravel Everything` (3A/3I) places an Omen on *"every enemy in Attunement Range **up to your cap**"* — and the cap is **your Tier**. So "Unravel Everything" hits **one** enemy at Tier 1 and **two** at Tier 2. A whole turn plus 3 Investiture for ~24 damage across two targets.

**Zero ally-facing content** — 0 of 9 talents mention allies. Second-highest Investiture load (14) against a conditional 1/round refund. And the census's finding stands: the path description sources Omens from *"forcing Complications"*, and **no talent in the tree forces a Complication.**

**Why Chaos ranks below Fate:** Fate has three zero-Action-cost talents to Chaos's one, its entry costs no Action at all, both of its entries work standalone, and it contributes to a party. Chaos's compensating advantage — reliable Deflect-ignoring damage on its own schedule — is real, which is why this is the closest call in the ranking.

---

### 3.10 Sovereignty (Black + White) — #10, and the margin

**What the nine talents do.** All nine move a **damage die one or two steps** up or down the d4–d12 ladder, on one ally or one enemy at a time. Confirmed in the implementation — every handler in `deity-sovereignty.json` is `edha-die-step` except `Expose` and `Sovereign's Favor`:

```
Censure → edha-die-step:-1     Exalt → edha-die-step:1
Decree of Ruin → -1,-1         Investiture of Authority → 1
Edict of the Fallen → -2,-1    Sovereign's Balance → edha-die-step
Sovereignty → edha-die-step    Expose → edha-die-step-react
Sovereign's Favor → edha-temp-hp:(@tier)d(2*@skills.white.rank+2)
```

**The arithmetic.** One die step on the d4→d12 ladder is worth exactly **+1 or −1 mean per die rolled** (2.5 / 3.5 / 4.5 / 5.5 / 6.5). Nothing in the 365 tells us how many dice an adversary rolls — that lives in adversary statblocks, which are out of scope — so the honest ceiling, using the only dice the fence contains ([Tier][Die] talents at Tier 2 = 2 dice), is **±2 points per damage instance**.

**The entry comparison, which is the whole case.** Every deity tree's depth-0 entries cost 1 Action + 1 Investiture. Here is what that buys:

| Tree | Entry | What 1 Action + 1 Investiture buys | Duration |
|---|---|---|---|
| Knowledge | Predatory Strike | up to 5U Vital (45 @ T2) | instant |
| Death | Withering Touch | weapon + 1U+WIL Vital + heal-denial | instant + 1 rnd |
| Chaos | Entropy Strike | 1U spirit + a marker | instant |
| Destruction | Set Charge | 1U to everything in 10 ft, no roll/save, + terrain | **scene** |
| Civilization | Forge Construct | a persistent second body attacking every round | **scene** |
| Life | Vital Diagnosis | full statblock + **party-wide** +Tier Vital | **scene** |
| Order | Covenant | +1 all defences to two characters + ranged mutual Aid | **scene** |
| Fate | Ordained Ground (**Free Action**) | ally square, +1 all defences, Aid at 30 ft | **scene** |
| **Sovereignty** | **Censure** | one enemy's damage die −1 step, **on a contested test** | **one round** |
| **Sovereignty** | **Exalt** | one ally's damage die +1 step | **one round** |

**Sovereignty is the only tree in the deity atlas whose *both* entries expire at the start of your next turn.** To hold a ~2-point swing you re-pay 1 Action and 1 Investiture *every round*, forever.

**Its best line, priced fairly.** `Exalt` + `Sovereign's Favor` (d1, free Passive) = 1 Action / 1 Investiture for +1 die step *and* `[Tier][Die]` temp HP on White's die = **9 temp HP at Tier 2**. That is a real talent. But it is dominated at the same cost by `Life Surge` (d0, 1A/1I, `[Tier][Die] + Awareness` = **12 real HP**, overflow becomes temp HP), and out-produced over any fight longer than three rounds by Order's `Bear Witness`, which pays temp HP **every round for free**.

`Edict of the Fallen` (d2, L3, 2A/2I) is the tree's genuine talent — scene-long −2 steps plus temp HP to *every* ally on every enemy miss — and it is the only sub-capstone node with scene-long multi-clause value.

**Five separate charges, each individually defensible:**
1. **Zero damage on both independent evidence streams** — 0 prose hits, 0 damage formulas, and no fixed-damage clause anywhere. The one other zero-damage deity tree, Life, carries the five largest heal formulas in the game as compensation. Sovereignty has no equivalent independent effect.
2. **The signature resource does not exist.** Both intent sources promise **Decree** as a *radius*: the path description says *"a declared law projected within a radius: allies inside are elevated, enemies inside are diminished"*; the deity guide says *"Decree zones (declared laws within a radius)"* with the loop *"diminish target → elevate ally → bring them into Decree."* **No Sovereignty talent creates a zone, a radius or an aura. All nine are single-target.** The word survives only in the title `Decree of Ruin`.
3. **The most expensive gate in the atlas, for the least return.** Black 3+ *and* White 3+ = **6 skill ranks**, joint-highest, and neither colour sizes a single damage or heal formula (the tree has none). White pays out exactly once, in `Sovereign's Favor`'s temp-HP formula — a payout invisible in the prose. Meanwhile the deity guide names this tree as *"the cleanest example of the color-thematic test rule"* with *"Black tests for diminish; White tests for elevate"* — and White is **tested zero times**.
4. **Ally-locked.** Five of nine need a willing ally in Attunement Range; the elevate half realises its value on someone else's turn.
5. **Redundant with better trees.** Its elevate half (Exalt / Investiture of Authority / Sovereign's Balance / Sovereignty) is a strictly weaker `Vital Diagnosis` or `Pack Share`; its diminish half is a strictly weaker leyline/Blue disadvantage (disadvantage converts a d20 to keep-lowest — worth roughly −3.3 on the roll — versus −1 per damage die).

**The margin, quantified.** Over a five-round Tier-2 fight, Sovereignty at full build produces roughly: ~15 damage prevented (−2 steps × ~5 enemy attacks × 1.5 dice), ~20 damage added (+2 × ~10 ally attacks), ~27 temp HP — call it **~60 points of swing** for ~6 Investiture and ~5 Actions. Knowledge over the same five rounds produces **~360**. Chaos produces **~70–90 of pure damage** and holds a dispel and a forced reroll besides. Even discounting damage against mitigation, **Sovereignty is the only tree whose whole-fight contribution is smaller than several single deity talents.**

---

## 4. The two-colour gate — all ten pairs, priced

The base gate is identical in *shape* for all ten (Colour1 2+, Colour2 2+ = 4 ranks). It is **not** identical in what you get back.

| Tree | Pair | Ranks for **full** tree access | Talents L6-walled | Tests C1 / C2 | Sizes dice C1 / C2 | Authored `skills.<c>.rank` refs | Verdict |
|---|---|---|---|---|---|---|---|
| Chaos | Blue+Black | **4** | 0 | 3 / 3 | 3 / 2 | — | **Cleanest.** Both colours tested and both size dice. |
| Destruction | Blue+Red | **4** | 0 | 0 / 2 | 1 / 5 | — | Blue thin (1 formula) but not a toll. |
| Death | Black+Green | **4** | 0 | 1 / 0 | 3 / 1 | — | Green thin, and the **two free Keys are the best pairing in the atlas** (see below). |
| Power | Black+Red | **4** | 0 | 2 / 0 | 0 / 2 | red ×3, black ×1 | Split cleanly: Black tests, Red sizes. |
| Civilization | Red+White | **4** | 0 | 2 / 0 | 2 / 0 | **white ×5**, red ×3 | **Census wrong** — White pays out *more* than Red in the implementation. |
| Fate | Green+White | **4** | 0 | 1 / **0** | 3 / **0** | green ×3, **white ×0** | **PURE TOLL BOOTH (White).** |
| Order | Blue+White | **5** (Blue 3) | 1 | 2 / 0 | 4 / 0 | white ×4, blue ×4 | **Census wrong** — White is a numeric scalar in 3 clauses. Honest. |
| Life | Blue+Green | **6** | 2 | 1 / 0 | 0 / 5 | **green ×11, blue ×0** | Blue 3 buys one test bonus on one talent. Near-toll. |
| Knowledge | Red+Green | **6** | 2 | 2 / **0** | 3 / **0** | **red ×10, green ×0** | **PURE TOLL BOOTH (Green).** Most expensive in the atlas. |
| Sovereignty | Black+White | **6** | 2 | 3 / **0** | 0 / 0 | white ×1 (temp HP), black ×0 | Worst return per rank in the atlas. |

**Correction to the census.** It lists five toll booths — *"Order white 2+ | Civilization white 2+ | Fate white 2+ | Knowledge green 3+ | Sovereignty white 3+ … four of the five are WHITE."* Checked against both the prose and the authored implementation, only **two** are true tolls: **Fate/White** and **Knowledge/Green** — one White, one Green. Order/White pays out in three clauses, Civilization/White in one clause and five formula references, Sovereignty/White in one temp-HP formula. The "White is the systematically unrewarded gate colour" conclusion is **not supported**; the real pattern is that **the colour the tree does not *test* is usually the colour it does not *scale* on either** — which is a tree-design consistency issue, not a White problem.

### The hidden half of the gate: the Attunement Keys

A deity character holds rank 2+ in two colours, i.e. is attuned to both, and the five Keys are *"Always Active, cost nothing, and are granted free with the path"*. **So the two-colour gate silently hands each deity path two free permanent riders — and these vary enormously in value, which is a real and unmeasured source of gate-pricing inequality.**

| Key | Value | Which trees get it |
|---|---|---|
| **Green** — free difficult terrain within [Size] of a point in range, every Draw Mana | **Best.** A free, repeatable zone. | Death, Fate, Life, Knowledge |
| **White** — allies in range regain HP = tier, every Draw Mana | Free party heal. | Order, Civilization, Fate, Sovereignty |
| **Black** — enemies with no ally within 5 ft become Weakened | Free offensive debuff. | Chaos, Death, Power, Sovereignty |
| **Blue** — advantage on next Cognitive test | Thin; binary; one test type. | Chaos, Order, Destruction, Life |
| **Red** — advantage on next Physical test, **lose your Reaction** | **A tax.** | Civilization, Destruction, Power, Knowledge |

Two consequences:

- **Death's gate (Black+Green) is the best-paid in the atlas.** The Black Key applies **Weakened**, and `Consuming Decay` — the tree's best install — *requires* a Weakened target. The Green Key lays free difficult terrain, which is `Bone Garden`'s medium. Death's two free Keys directly enable two of its own talents.
- **The Red Key actively conflicts with two trees that carry it.** Civilization (`Bonds of Community`) and Destruction (`Combustion Chain`) both hold Reaction talents, and Red's Key strips your Reaction every time you Draw Mana — which is the only way either tree funds its Investiture-only economy.

**Cheapest gates in practice: Death, Chaos, Destruction, Power** (4 ranks, both colours used, Keys that help or are neutral). **Most expensive: Sovereignty** (6 ranks, one payout), then **Knowledge** (6 ranks, one pure toll, a taxing Key) and **Life** (6 ranks, a near-toll).

---

## 5. Is any deity tree simply a worse version of a leyline tree?

I built an independent 20-dimension function vector over generic mechanics (excluding tree-proper nouns where possible) and scored all deity↔non-deity pairs. The result is structural:

> **Six of the ten deity trees are functionally closest to one of the two leyline colours they charge you to buy into.**

| Deity tree | Closest non-deity tree | Cosine | Is it a gate colour? |
|---|---|---|---|
| **Power** | **leyline/Red** | **0.853** | **yes** |
| Order | leyline/White | 0.750 | yes |
| Fate | leyline/Green | 0.738 | yes |
| Chaos | leyline/Black | 0.736 | yes |
| Death | leyline/Black | 0.703 | yes |
| **Sovereignty** | **leyline/White** | **0.702** | **yes — and it is Sovereignty's toll-booth colour** |
| Life | leyline/Black | 0.699 | no |
| Knowledge | heroic/Hunter | 0.651 | n/a |
| Civilization | heroic/Warrior | 0.639 | n/a |
| Destruction | heroic/Hunter | 0.589 | n/a |

**deity/Power ↔ leyline/Red at 0.853 is higher than the census's highest deity–deity pair (0.779) and higher than 6 of the 15 highest pairs in the whole 210-pair matrix.** Four of Power's nine talents — `Warlord's Advance`, `Unstoppable Advance`, `Momentum of Victory`, `Warlord's Fury` — are melee-momentum riders that leyline/Red already covers with `Volatile Strike`, `Momentum's Edge`, `Shockwave Slam`, `Unstoppable` and `Mighty`, and Red does one of them *better and for free* (`Mighty`: +1+tier per action spent, free permanent Passive, vs `Warlord's Fury`'s capped +4 for 2 Actions + 2 Investiture). Power's genuinely deity-tier content is **three talents**: `Kneel`, `Absolute Authority`, `Mantle of the Aspirant`.

**The sharpest single case is Chaos, because the overlap is not hypothetical.** Chaos is gated on Black 2+, so *every Chaos character is already a Black character*, choosing between a Black talent slot and a Chaos talent slot at every level.

| Job | leyline/Black | deity/Chaos |
|---|---|---|
| Single-target Deflect-ignoring damage | `Withering Ray` — **d0, L1, 1 Action, no Investiture**, **2[Tier][Die] Vital (18 @ T2)** | `Entropy Strike` — d0, L1, 1 Action, **1 Investiture**, **1[Tier][Die] spirit (9 @ T2)** |
| Isolation payoff | `Severance` — d1, **free Passive**: *all* your damage becomes Vital vs Isolated targets | `Isolating Pressure` — d0, 1 Action, **2 Investiture**: applies Isolated, deals nothing without an Omen |
| Hard control | `Hollow Command` — **d0, L1, 2 Actions, 1 Investiture**: *"the target cannot take actions on its next turn"* | none |

Chaos's unique contributions over Black are the Omen detonation cadence, the forced reroll (`Shatter Focus`) and the dispel (`Unweaving`) — three talents' worth against nine slots.

**Answer:** no deity tree is *strictly* dominated (each holds at least one thing its neighbouring leyline colour cannot do). But **Power is the deity tree with the least functional distance from a leyline tree it is gated behind**, and **Chaos is the one whose overlap is unavoidable in play**.

---

## 6. Do the ten deliver ten distinct fantasies?

Mostly yes at the *flavour* layer, and **less than you'd want at the mechanical layer**. Three template families run across the atlas.

### Template A — "the marked creature takes damage → recover 1 Investiture" free Passive (**4 trees**)

| Tree | Talent | Depth | Text |
|---|---|---|---|
| Chaos | `Void Sense` | 1 | *"Once per round, when an enemy bearing one of your Omens in Attunement Range takes damage from any source, you recover 1 Investiture."* |
| Knowledge | `Accumulate` | 1 | *"When that creature takes damage from any source, you recover 1 Investiture once per round."* |
| Life | `Prognosis` | 1 | *"When a Diagnosed creature takes damage from any source, you recover 1 Investiture once per round."* |
| Sovereignty | `Expose` | 1 | *"When a creature affected by your Censure **fails a test**, you recover 1 Investiture."* (variant) |

All four are depth-1, free Passives, on the same trigger shape, in four different trees. **This is a bigger convergence than Destruction↔Fate and the census did not surface it.**

### Template B — "the Free-Action upgrade rider for +1 Investiture at placement" (**3 trees**)

| Tree | Talent | Action / Cost / Depth | Text |
|---|---|---|---|
| Destruction | `Pinpoint Charge` | Free / 1 Inv / d1 | *"When you place a Charge…, spend an additional 1 Investiture to declare it a Pinpoint Charge."* |
| Fate | `Inevitable Snare` | Free / 1 Inv / d1 | *"When you place a Snare, spend an additional 1 Investiture to declare it an Inevitable Snare."* |
| Order | `Sealed Edict` | Free / 1 Inv / d1 | *"When you place an Edict, spend an additional 1 Investiture to declare it Sealed."* |

Same action type, same cost, same depth, same payload (+[Tier][Die] plus a rider). These are three copies of one talent with the noun changed. (They are, incidentally, the **only** three talents in the 365 using the phrase "spend an additional" other than heroic/Warrior's `Stonestance`.)

### Template C — the statblock reveal entry (**2 trees**)

`Studied Mark` (Knowledge, d0, 1A/1I) and `Vital Diagnosis` (Life, d0, 1A/1I) are the only two talents in the 365 that read *"HP, conditions, and Physical and Spiritual defenses."* Same depth, same action, same cost. Life's adds max HP and a **party-wide +Tier Vital rider**; Knowledge's adds 2 Insight. Life's is materially better at the same price.

### Destruction ↔ Fate (0.779 census / 0.769 mine) — checked, and it's real, but it is a **skeleton** convergence

Node-for-node:

| Role | Destruction | Fate |
|---|---|---|
| Entry: place a token on a square | `Set Charge` 1A/1I | `Snare` 1A/1I |
| Entry: the other lane | `Pyre` 1A/1I | `Ordained Ground` Free/1I |
| Free-Action upgrade rider (Template B) | `Pinpoint Charge` | `Inevitable Snare` |
| Free rider on token trigger | `Concussive Yield` (Prone save) | `Hexmark` (bonus keen) |
| 2-Action mass trigger | `Cascading Failure` | `Foreknown Strike` |
| 3-Action once-per-scene "detonate everything" | `The Unmooring` | `Thread of Inevitability` |

**But they are not redundant in play, and the reason is one clause.** Destruction *owns its own trigger* — *"You may detonate any of your Charges as a **Free Action** on your turn"* — from depth 0. Fate's Snare fires only when an enemy walks in, and Fate cannot trigger it itself until depth 2, and even then delegates the trigger to an ally. **Destruction is strictly better at the job they share.** If the design wants both, Fate should either own its trigger at depth 0 too, or drop the token-detonation skeleton and lean harder on the foreknowledge half (`Read the Threads` is the only genuinely oracular talent in the tree, and it is 1 of 9).

### The two closest ally-anchored squares are the same talent at different sizes

- `Lay Foundation` (Civilization, **Free Action**, 1 Investiture, **10 ft** square, allies beginning their turn gain +1 to all defences, sustain up to tier)
- `Ordained Ground` (Fate, **Free Action**, 1 Investiture, **5 ft** square, ally beginning their turn gains +1 to all defences, sustain up to tier)

Identical action, cost, cap, duration and buff. Civilization's covers **four times the area**; Fate's compensates with the Aid-at-30-ft clause. And `Trade Routes` (Civ, **1A/1I**) links two squares; `Weave the Thread` (Fate, **2A/2I**) links two squares — **twice the price for the same template**.

### The convergence my vector flags loudest: Chaos ↔ Knowledge (0.827)

Both are **single-bearer mark-and-cash trees**: place a marker on one enemy (Omen / Insight), cap it (tier / 5), run a depth-1 free Passive that refunds Investiture when the mark takes damage from *any* source, and cash the marker for Deflect-ignoring damage. They *feel* different because one is entropy-flavoured and one is study-flavoured, but the mechanical skeleton is the same and Knowledge's is ~5× stronger.

---

## 7. Testing the intent: "Radiant-equivalent power lives in the Deity Domain trees"

Six measurements. Two support the claim, one is neutral, three refute it.

**✅ MEASURE 1 — Persistence. The deity premium is real and large.**

| Atlas | n | Talents creating a **scene-long** effect | % |
|---|---|---|---|
| deity | 90 | **35** | **38.9%** |
| leyline | 125 | 6 | 4.8% |
| heroic | 150 | **0** | **0%** |

An 8× premium over leyline and an infinite one over heroic. This is the single clearest structural sense in which a deity talent is stronger: it buys a thing that stays.

**✅ MEASURE 2 — Clause count. Also real, and designed.** Average description length: **deity 49.1 words, leyline 23.1, heroic 19.6.** The deity guide budgets 30–45 words for entries and up to 70 for capstones against leyline's 20–25 — so the premium is deliberate, and it is delivered as *more clauses per talent*.

**➖ MEASURE 3 — Cost. The premium is bought, not granted.** Average Investiture cost per talent: **deity 1.34, leyline 0.56, heroic 0.00** (heroic runs on Focus, 0.49/talent). Deity talents cost **2.4× the Investiture** of a leyline talent. A deity character is not getting free power; they are getting a different exchange rate, on a resource that Draw Mana refills at **1/Action at Tier 1**.

**❌ MEASURE 4 — Damage per Action. Not delivered.** The strongest single-Action damage talent in the *leyline* atlas is `leyline/Black`'s **`Withering Ray`**: depth 0, level 1, 1 Action, **no Investiture** (it costs half [Die] HP), **2[Tier][Die] Vital = 18 mean at Tier 2**. It out-damages the best 1-Action entry of **eight of the ten deity trees**:

| Deity tree | Best 1-Action damage | vs Withering Ray's 18 |
|---|---|---|
| Knowledge | 45 (Predatory Strike at cap) | **beats it** |
| Death | weapon + 9 + WIL | roughly parity (depends on weapon) |
| Chaos | 9 spirit | loses 2:1 |
| Destruction | 9 energy (AoE) | loses 2:1 single-target, wins vs 2+ |
| Power | weapon + 9 impact | loses on the talent's own contribution |
| Order | 9 + INT (enemy-triggered) | loses |
| Fate | 9 + AWA (enemy-triggered) | loses |
| Civilization / Life / Sovereignty | 0 direct | loses |

**❌ MEASURE 5 — Hard control. Not delivered.** `leyline/Black`'s **`Hollow Command`** — depth 0, **level 1**, 2 Actions, 1 Investiture, no precondition — *"the target cannot take actions on its next turn."* That is a whole enemy turn. The deity atlas's best control, Power's `Absolute Authority`, is depth 1, costs 2 Actions and **2** Investiture, and **requires a precondition the tree charges another Action and Investiture to create**. A leyline entry out-controls a deity synthesis node on cost, depth, level and precondition.

**❌ MEASURE 6 — Free permanent value. Leyline has more of it.** `leyline/Red`'s **`Mighty`** (free Passive: *"for each action spent, deal extra damage equal to 1 + your tier"* on every weapon hit, forever — and it ships verbatim in six trees) and `leyline/White`'s **`Shield Wall`** (free, permanent, untriggered: *"When two or more allies are adjacent to you, attacks against them deal half [Tier][Die] less damage"*) have **no deity equivalent that is simultaneously free, permanent and untriggered**. Every deity free Passive is conditional on a marker you paid an Action and an Investiture to place.

**Verdict.** The intent is **half met**. Deity talents *are* individually stronger in the way the design guide actually built them — longer duration, more clauses, richer state. They are **not** stronger on the two axes a player notices at the table, and on those axes a depth-0 leyline/Black talent beats most of the deity atlas. If "Radiant-tier" is meant to read as *feels bigger*, the deity trees currently deliver *lasts longer* instead.

**And the sanity check the primer asks for holds — with one exception.** "9 deity talents outclassing 25 leyline talents in TOTAL" would be a bug. It is not happening: eight of ten deity trees deploy nine talents for less total combat swing than a leyline character extracts from `Withering Ray` + `Hollow Command` + `Severance` + `Mighty`-class free Passives. The exception is **Knowledge**, whose nine talents at Insight cap out-damage any nine-talent leyline selection by roughly 3–5×.

---

## 8. Data-integrity items found while measuring

These bear directly on the depth/level maths the parity analysis rests on, so they are reported rather than assumed away.

**a) `deity/Death` — `Raise Dead` prose and `connections` name different parents (iron rule 7, third case).**
Card: `prereq: Necrotic Cascade or Speak with the Fallen`. Managed `connections`: `["Necrotic Cascade", "Risen Servant"]`.
Foundry enforces `connections`, so **`Speak with the Fallen` does not unlock Raise Dead** despite the card, and **`Risen Servant` does** despite the card. This is the ungated failure mode iron rule 7 names, live in the deity atlas. It is the only prose↔connections *contradiction* among the 90 deity talents.

**b) Three deity talents print no talent prerequisite but carry a managed one.**
- `deity/Chaos` `Isolating Ruin` — card says `prereq: —`, connections require `Unweaving` or `Void Sense`.
- `deity/Life` `Apex Form` — card says `prereq: —`, connections require `Primal Regeneration` or `Lifeline`.
- `deity/Order` `Sealed Edict` — card says `prereq: Blue 3+` only, connections also require `Edict`.

**c) The census's roll-formula stream under-reads Knowledge by 5×.** `Predatory Strike`, `Killing Blow` and `The Final Study` all carry a flat `(@tier)d(...)` in `damage.formula`; the per-Insight multiplication lives in the authored `edha-damage-bonus` rule's `amountFormula`/`perCounterStatus` fields. **The census warned a third classifier bug existed. This is it** — not a false positive but a systematic *under*-count on the tree with the highest damage in the game. Any future census that ranks damage from `damageFormula` alone will rank Knowledge tenth-ish instead of first.

**d) The toll-booth census is wrong in three of five entries** (§4). Order/White, Civilization/White and Sovereignty/White all pay out; only Fate/White and Knowledge/Green are pure tolls.

**e) The Combat Construct's and Risen Servant's attack bonus is undefined in text *and* in the `edha-summon` schema.** This is the largest unresolved variable in the ranking (it moves Civilization between #1 and #4).

**f) The `earliest L` column assumes the gate's skill ranks are free.** If skill ranks accrue at 2/level (`CLAUDE.md`, build-forge: "1 talent + 2 skill ranks per level"), then Colour1 2+/Colour2 2+ = 4 ranks is not affordable until level 2 at the earliest, and the 6-rank trees (Knowledge, Life, Sovereignty) compound the delay. This is uniform across all ten trees and so does not change the *ranking*, but it means no deity entry is genuinely "L1" and the three 6-rank trees are later still. **What would settle it:** the starting skill-rank allocation, which lives in character creation — adjacent to the out-of-scope PC ladders, so I have flagged rather than asserted it.

---

## 9. What I would change, in priority order

1. **Sovereignty needs a rebuild, not a buff.** Give it the **Decree zone both intent sources promise** — that single change gives the tree an area effect, a reason for the White gate, and a second fantasy for its second entry. Failing that: make `Censure` and `Exalt` **scene-duration** (matching every other tree's entries) and drop the Black 3+ / White 3+ gates to bring it to 4 ranks like six of its peers.
2. **Fix Chaos's second entry.** `Isolating Pressure` must do something at level 1 without an Omen, or it violates the deity guide's own Revision Principle 1. And uncap `Unravel Everything` — a capstone that hits two enemies is not a capstone.
3. **Fix Death's capstone.** `Raise Dead` at 3 Actions + 4 Investiture is the most expensive talent in the atlas and delivers zero combat value in the round it fires. Move it to a Tier-3 node and give the capstone slot to something that cashes the Remains.
4. **Re-price Fate's Snare trigger.** Give it a placer-controlled detonation at depth 0, matching `Set Charge`'s Free Action, or accept that Destruction dominates the shared job.
5. **Give Power a free-value talent.** Zero Passives, zero Reactions, zero Specials and the highest Investiture load in the atlas is not "Radiant power"; it is a tree that runs out.
6. **Kill the two pure toll booths** (Fate/White, Knowledge/Green) — either test them, size a die on them, or change the gate colour.
7. **De-duplicate Template A and Template B.** Four near-verbatim "mark takes damage → 1 Investiture" Passives and three near-verbatim Free-Action upgrade riders are the reason the deity trees feel like variations rather than ten domains.
8. **If the goal is that deity power *feels* Radiant**, the lever is not more duration — that is already 8× leyline. It is a number a player sees. Right now `leyline/Black`'s level-1 `Withering Ray` hits harder than eight deity trees' best Action, and its level-1 `Hollow Command` out-controls the entire deity atlas.

## Adversarial verification

**32 load-bearing claims checked: 10 confirmed, 14 corrected, 8 refuted.**

The analysis is unusually well-grounded on structure and badly exposed on two things: (a) it searched the authored overlay for `skills.<colour>.rank` only, and so missed the `rangeColor` / `color` fields that are the OTHER way a colour is cashed in — which refutes its own headline #5 (Knowledge/Green is NOT a toll booth; there is exactly ONE pure toll booth in the atlas, Fate/White) and understates its Civilization correction (the Combat Construct's HP and attack dice are sized on WHITE, not Red — White is the tree's damage die); and (b) it treats temporary HP as accumulating, when `module-src/scripts/engine/28-temporary-hp.js` says "the pool does not stack, a larger grant replaces a smaller one" and the house rule is that a new grant overwrites the old EVEN IF SMALLER. That single fact deletes Order's "~30 temp HP for zero Actions" and a third of Sovereignty's "~60 points of swing", i.e. both ends of the headline 6:1 spread. Every deployment-cost number, every action-type count, every gate-rank count, the word-count and Investiture-cost measures, the three template families, Template B's "spend an additional" census, the Raise Dead connections bug and the Predatory Strike ×Insight implementation quote all check out exactly. The ordinal ranking (Knowledge highest ceiling, Sovereignty last) survives; the precision claimed for it does not, and Knowledge's #1 rests on an unflagged out-of-scope assumption (a single target surviving three rounds).

### Claims

1. **CONFIRMED** — §0.2/§3.1 — Predatory Strike really is one [Tier][Die] roll multiplied by Insight (cap 5), i.e. 2d8×5 = 45 mean Vital per Action at Tier 2, and the census's roll-formula stream under-reads it 5×.
   - Evidence: data/authored/deity-knowledge.json, rule PredStrikeRider0: "amountFormula": "((@tier)d(2 * @colorRank + 2)) * max(@counter, 1)", "counterStatus": "insight", "placeCounter": 1, "capFormula": "5", "color": "red". The engine schema hint for perCounterStatus reads verbatim: "The rolled formula is multiplied by max(count, 1) — ONE roll, then ×N, Killing Blow's 'per Insight'." Sustain check: at Tier 2 Draw Mana returns 2, Accumulate returns 1, two Predatory Strikes cost 2 — 1 Draw Mana + 2 Strikes = 3 Actions, net +1 Investiture, so ~90/round is arithmetically sustainable. Caveat the analysis does state: both are weapon attacks and the tree grants no accuracy.
2. **REFUTED** — §3.1 — "at level 3 with Studied Mark + Predatory Strike + Accumulate, turn 2 is 5U × 3 Actions = 15d6 ≈ 52."
   - Evidence: Three Predatory Strikes in one turn cost 3 Investiture against a pool of ~4 (2 + max(AWA,PRE)) and Tier-1 income of 1/Action from Draw Mana plus 1/round from Accumulate. After a normal round 1 (Studied Mark 1I + two Strikes 2I) only 1 Investiture plus Accumulate's 1 remain, so turn 2 is TWO Strikes. And Insight is not at cap for all three: Studied Mark places 2, Accumulate 1/turn, Predatory Strike 1 after damage.
   - Corrected: Best case at level 3 is 12d6 ≈ 42 in one burst turn, and only if round 1 is spent on Studied Mark plus two Draw Manas; the ordinary line is two Strikes ≈ 10d6 ≈ 35 for one round, settling to ~1–2 Strikes/round thereafter. The 52 figure is not reachable.
3. **REFUTED** — §0.5/§3.1/§4 — "Knowledge/Green is the most expensive pure toll booth in the atlas: 0 tests, 0 numeric reads, 0 references anywhere in the authored file."
   - Evidence: deity-knowledge.json contains "rangeColor": "green" three times — on Studied Mark's placement (edha-owner-list), on Hunter's Discipline's edha-counter-transfer and on Death Mark's edha-counter-transfer — plus Accumulate's "requireBearerRange": "green" and Pack Share's edha-damage-bonus "color": "green". The engine resolves rangeColor through edhaAttuneFtColor, i.e. that colour's Attunement Range (15/30/60/90/120 ft by rank). Green 3+ therefore moves the tree's whole operating radius from 30 ft to 60 ft — the radius inside which Accumulate refunds, the Insight transfers land, and Pack Share/The Pack/Death Mark reach allies.
   - Corrected: Knowledge/Green is not a toll booth: it sizes the tree's Attunement Range in five separate authored rules. The analysis's search was for `skills.<colour>.rank` only and missed the range channel.
4. **CORRECTED** — §0.5 — "there are exactly two pure toll booths — Fate/White and Knowledge/Green."
   - Evidence: deity-fate.json references neither skills.white.rank nor any white rangeColor; its three edha-zone handlers all carry "color": "green". Knowledge/Green fails the toll test (above). Order/White: 4 skills.white.rank refs + 2 white rangeColor. Civilization/White: 5 refs. Sovereignty/White: 1 (Sovereign's Favor temp-HP formula).
   - Corrected: There is exactly ONE pure toll booth in the deity atlas — Fate/White. That is a cleaner finding than the analysis's, and it kills the census's "four of five are WHITE" pattern outright rather than partially.
5. **CONFIRMED** — §0.5/§4 — the census's toll-booth list is wrong for Order/White, Civilization/White and Sovereignty/White.
   - Evidence: Order: Bear Witness "temporary HP equal to your ranks in White"; Shoulder the Oath "reduce the remaining damage … by your ranks in White" and "temporary HP equal to your ranks in White" — three clauses, two talents, matching 4 authored skills.white.rank refs. Civilization: Bonds of Community "temporary HP equal to your White". Sovereignty: Sovereign's Favor's authored formula "(@tier)d(2 * @skills.white.rank + 2)". BUT the analysis understated Civilization badly — see next row.
6. **REFUTED** — §4 — Civilization "Sizes dice C1/C2 = 2/0" (Red sizes dice, White does not).
   - Evidence: deity-civilization.json: the Combat Construct's own hpFormula is "(@tier)d(2 * @skills.white.rank + 2) + (@tier * 2)", its attackFormula ("Construct Slam") is "(@tier)d(2 * @skills.white.rank + 2)", Siege Form's ranged damageFormula is white-sized, and Magnum Opus's hpBonusFormula is "2 * ((@tier)d(2 * @skills.white.rank + 2))". Only Bastion, Magnum Opus's splash and Tempered Edge's rider are red-sized.
   - Corrected: White sizes the Construct's HP die AND its primary attack die — i.e. the whole engine of the tree the analysis ranks #2 — while Red sizes the Tempered Edge rider and the two zone effects. Civilization is, on the implementation, the second-cleanest gate in the atlas after Chaos, not a tree whose White is a marginal payout.
7. **REFUTED** — §3.5 — Bear Witness "pays temp HP = ranks in White to every Covenant ally every round, forever — over a 5-round fight with 2 Covenants that is ~30 temp HP for zero Actions."
   - Evidence: module-src/scripts/engine/28-temporary-hp.js header: "the pool does not stack, a larger grant replaces a smaller one" and "House rules: only ONE source of Temp HP at a time (a new grant OVERWRITES the old, even if smaller) … Temp HP cannot be healed, only replaced or spent." edhaWriteTempHp stores a single {value, source} flag.
   - Corrected: Each Covenant ally holds at most `ranks in White` (3 at Tier 2) of temp HP at any moment, refreshed at round start; the 30 is a sum of a pool that never sums. Worse, Bear Witness's round-start grant OVERWRITES a larger grant an ally is holding — including Shoulder the Oath's and Final Decree's [Tier][Die] — so at Tier 2 it can be actively negative. The same error inflates Sovereignty's "~27 temp HP" in §3.10 and therefore both ends of the headline spread.
8. **REFUTED** — §3.9 — Chaos's second entry Isolating Pressure "applies a state that nothing they own reads" at level 1, violating the deity guide's Revision Principle 1.
   - Evidence: Every Chaos character is gated Black 2+, so they hold the free Black Attunement Key: "enemies you can see in Attunement Range with no ally within 5 ft become Weakened" on every Draw Mana (SYSTEM-PRIMER.md). module-src/scripts/engine/03-where-an-effect-lives.js edhaIsIsolated returns true for an INFLICTED isolated status ("Chaos (Maelith) — INFLICTED Isolation counts the same as positional"), and 52-green-instinct.js's Draw Mana sweep filters on edhaIsIsolated when requireIsolated is set. 42-chaos.js:11: "Isolated → a registered, INFLICTABLE `isolated` status OR'd into edhaIsIsolated".
   - Corrected: At level 1, Isolating Pressure → Draw Mana → the target is Weakened, using a rider the tree's own gate hands the player for free. The fair charge is narrower: Isolating Pressure deals no DAMAGE without an Omen, and 2 Investiture is half a level-1 pool for a one-round state — not that nothing the player owns reads it.
9. **CORRECTED** — §3.3 — "Nothing else in the deity atlas delivers guaranteed area damage at that action cost" (Set Charge, 1A/1I, no attack roll, no save).
   - Evidence: Set Charge's own text confirms the no-roll clause. But Death's Necrotic Cascade (1 Action, 1 Investiture, depth 2): "For the scene, when a character drops to 0 HP within your Attunement Range, each enemy within 10 ft of it takes [Tier][Die] spirit damage." No test, no save, spirit (Deflect-ignoring), enemies only, and it recurs for free on every drop for the rest of the scene.
   - Corrected: Set Charge is one of two guaranteed area-damage effects at 1 Action / 1 Investiture; Necrotic Cascade is the other, and it is arguably better (Deflect-ignoring, free after the install, never hits allies). Related miss: Set Charge, Concussive Yield and Fault Line all read "each character"/"each character in the line" — Destruction's headline reliability comes with unremarked friendly fire, which the analysis never prices.
10. **REFUTED** — §7 MEASURE 6 — "Every deity free Passive is conditional on a marker you paid an Action and an Investiture to place", so leyline has free permanent value deity lacks.
   - Evidence: Destruction's Walking Ruin (Passive, no cost, depth 1, L2): "For the scene, every space you move through becomes dangerous terrain. Your Speed increases by 10 ft." No marker, no precondition, no trigger — and the analysis itself praises it in §3.3. Death's Reaper's Harvest recovers Investiture on ANY drop to 0 HP in range, again with no marker placed.
   - Corrected: At least two deity free Passives are unconditional. The narrower true claim is that deity has fewer of them and no free permanent DAMAGE rider of Mighty's shape.
11. **CORRECTED** — §7 MEASURE 5 — "the deity atlas's best control, Power's Absolute Authority", is out-controlled by leyline/Black's Hollow Command on cost, depth, level and precondition.
   - Evidence: Hollow Command is confirmed unique: it is the only talent in all 365 matching "cannot take actions" (d0, L1, 2A/1I). But it resolves on a Deception vs Spiritual test — an OFF-COLOUR skill a Black mage has no gate-driven reason to have ranks in — and the analysis records it as having "no precondition" while omitting the test. And the deity atlas's best control is not Absolute Authority: Fate's Snare (d0, L1, 1A/1I) applies Restrained with NO test and NO save, which the analysis's own §3.8 calls "the atlas's only untested Restrain".
   - Corrected: MEASURE 5 compares Black's best control against Power's rather than the deity atlas's best. Restated: Hollow Command denies a whole turn but needs an off-colour contested test; Fate's Snare denies movement and imposes broad disadvantage with no roll at all, at the same depth and level, for the price of the enemy walking onto a square.
12. **CORRECTED** — §3.10 — "All nine [Sovereignty talents] move a damage die one or two steps."
   - Evidence: Handler dump of data/authored/deity-sovereignty.json: Censure [edha-def-test, edha-die-step], Decree of Ruin [def-test, die-step ×2], Edict of the Fallen [def-test, die-step ×2], Exalt [die-step], Investiture of Authority [die-step], Sovereign's Balance [die-step], Sovereignty [die-step], Expose [edha-die-step-react], Sovereign's Favor [edha-watch, edha-temp-hp]. Expose's prose contains no die step at all (Investiture refund + a granted Reactive Strike); Sovereign's Favor is temp HP.
   - Corrected: Seven of nine move a die; Expose and Sovereign's Favor do not. The analysis's own code block shows this and its prose contradicts it.
13. **CONFIRMED** — §0.3/§3.10 — Sovereignty's signature resource Decree exists in no talent; all nine are single-target; the deity guide calls it "the cleanest example of the color-thematic test rule" with "Black tests for diminish; White tests for elevate" and White is tested zero times.
   - Evidence: All nine talent texts read "a willing ally" / "a creature" / "one willing ally and one enemy" — no radius, aura or zone anywhere. DESIGN-GUIDE-CLAIMS.md:248-250 verbatim: "**Color split:** **Black tests for diminish; White tests for elevate.** This is the cleanest example of the color-thematic test rule." / "**Homebrew resource:** Decree zones (declared laws within a radius)." / "**Gameplay loop:** Diminish target → elevate ally → bring them into Decree." INTENT-deity-Sovereignty.md verbatim: "_Decree_ — a declared law projected within a radius: allies inside are elevated, enemies inside are diminished." The three tests in the tree (Censure, Decree of Ruin, Edict of the Fallen) all carry "skill": "black".
14. **CORRECTED** — §3.10 charge 5 — Sovereignty's diminish half is "a strictly weaker leyline/Blue disadvantage (−3.3 on the roll versus −1 per damage die)".
   - Evidence: The −3.3 arithmetic is right (E[d20]=10.5, E[min of 2d20]=7.175). But the two are different currencies: disadvantage only matters near the hit threshold and applies to ONE roll, while Edict of the Fallen (2A/2I, depth 2) reduces the die by two steps for the SCENE on every attack the target makes, guaranteed, and adds party-wide temp HP on every miss.
   - Corrected: Not strictly weaker — differently shaped. Sovereignty's diminish is guaranteed, scene-long and applies to every damage instance; Blue's is larger per instance, single-roll, and cancels against any advantage the enemy holds.
15. **CORRECTED** — §3.5 — "Order is one of four deity trees with no Investiture producer at all."
   - Evidence: resource-economy.json and the analysis's OWN §1 table both show five zeros: Order, Civilization, Destruction, Fate, Power (Chaos, Death, Life, Knowledge, Sovereignty each have one).
   - Corrected: One of FIVE. The analysis contradicts its own table.
16. **CORRECTED** — §3.5 — Shoulder the Oath is "the best damage-redirection clause in the game".
   - Evidence: deity/Life's Lifeline (1A/2I, depth 2): "when that creature takes damage you may take up to half instead as Spirit damage, bypassing Deflect. When you take damage this way, the target immediately heals [Tier][Die] HP. Once per round." At Tier 2 that returns 2d8 ≈ 9 HP to the ally, against Shoulder the Oath's reduction of 3 plus 3 temp HP each — and Lifeline is a scene-long install whose interception is NOT typed as a Reaction, so it does not compete for the 1-Reaction-per-round cap, while Shoulder the Oath does.
   - Corrected: One of two or three best; Life's Lifeline is at least competitive at Tier 2 and is cheaper in action economy.
17. **CORRECTED** — §3.1 — Knowledge's capstone The Final Study "is dominated by a shallower node" (Killing Blow does the same damage clause for one third of the action cost).
   - Evidence: Killing Blow's rankGate is "Red 3+", earliestLevel 6 — the analysis itself lists it among Knowledge's two L6-walled talents. The Final Study is depth 3, earliestLevel 4. And The Final Study's success clause adds "each ally in Attunement Range may immediately make a free Strike", which Killing Blow lacks.
   - Corrected: At levels 4–5 The Final Study is available and Killing Blow is not, and the capstone carries a party-wide free-Strike clause on top. The domination is real only from level 6 and only on the damage clause.
18. **CONFIRMED** — §8a — Death's Raise Dead: card says prereq "Necrotic Cascade or Speak with the Fallen", managed connections are ["Necrotic Cascade","Risen Servant"] — the iron-rule-7 third case, live, and "the only prose↔connections contradiction among the 90 deity talents".
   - Evidence: all-talents.json Death/Raise Dead: prerequisites "Necrotic Cascade or Speak with the Fallen", connections ["Necrotic Cascade","Risen Servant"]. A full sweep of all 90 deity talents finds this is the only case where the prose names a parent the connections do not grant. But the §8b companion list is incomplete — see next row.
19. **CORRECTED** — §8b — "Three deity talents print no talent prerequisite but carry a managed one" (Chaos/Isolating Ruin, Life/Apex Form, Order/Sealed Edict).
   - Evidence: Those three check out. A full sweep of the 90 finds a fourth divergence the analysis missed: Death/Necrotic Cascade prints prereq "Consuming Decay" but its connections are ["Consuming Decay","Death Ward"] — an unlisted second OR-parent, so Foundry unlocks it from Death Ward against the card.
   - Corrected: Four deity talents diverge between prose prerequisite and managed connections; Death/Necrotic Cascade is the fourth and, like Raise Dead, sits in the Death tree.
20. **CONFIRMED** — §1 — the deployment-cost table (Actions to deploy all 9, Investiture to deploy all 9, free-value talents, in-tree regen) and "deity/Power is the only tree in the atlas with zero free-value talents".
   - Evidence: Recomputed all ten from all-talents.json action/cost fields: Knowledge 8A/10I, Order 9/10, Destruction 9/10, Fate 9/11, Sovereignty 10/13, Civilization 11/11, Life 11/13, Chaos 12/14, Death 13/14, Power 14/15 — every cell matches. Free-value counts (0 Action AND 0 resource) match: 3/3/3/2/2/2/1/1/1/0. Power's only Free Action, Momentum of Victory, costs "1 Investiture, Opportunity" and the tree produces no Opportunity.
21. **CONFIRMED** — §1 — the deity action-type distribution table, "zero Specials across all ten", and the Passive-target column (2–3 of 9).
   - Evidence: Recounted all 90 talents' action fields; every row matches, including Power 0 Passive / 4 two-Action / 0 Reaction, Knowledge 3 Passive / 5 one-Action / 0 two-Action, Life 6 one-Action. DESIGN-GUIDE-CLAIMS.md:156-161 gives the deity targets verbatim as Passive ~25–30%, Special ~15–20%, Free ~10–15%, Reaction ~10%, so 2–3 Passives of 9 is the right band. Six of ten miss it.
22. **CONFIRMED** — §0.4/§4 — six trees need 4 skill ranks for full access, Order 5, Knowledge/Life/Sovereignty 6, with 2 of 9 talents L6-walled in the three 6-rank trees.
   - Evidence: Rank gates above the entry pair: Order — Sealed Edict Blue 3+ (1 wall). Knowledge — Pack Share Green 3+, Killing Blow Red 3+ (2). Life — Surgical Precision Blue 3+, Adaptive Mutation Green 3+ (2). Sovereignty — Investiture of Authority White 3+, Decree of Ruin Black 3+ (2). Chaos, Civilization, Death, Destruction, Fate, Power carry no rank gate beyond their entries.
23. **CORRECTED** — §7 MEASURES 1–3 — scene-long effects deity 38.9% / leyline 4.8% / heroic 0%; description length 49.1 / 23.1 / 19.6 words; Investiture cost per talent 1.34 / 0.56 / 0.00 with heroic focus 0.49.
   - Evidence: Recomputed from all-talents.json: word counts 49.1 / 23.1 / 19.6 — exact. Investiture 1.34 / 0.56 / 0.00 and heroic focus 0.49 — exact. Scene-duration: leyline 6 of 125 = 4.8% exact; deity 39 of 90 = 43.3% on a strict "for the scene / until end of scene" filter (the analysis's 35 is on the low side, rule unstated); heroic 1 of 150 = 0.7%, not 0 — Envoy's Rousing Presence reads "An ally becomes Determined until end of scene".
   - Corrected: The persistence premium is real and roughly 9× over leyline and ~55× over heroic — not infinite over heroic. Everything else in MEASURES 1–3 is exact.
24. **CONFIRMED** — §6 — three verbatim template families: Template A (4 trees, "mark takes damage → recover 1 Investiture" depth-1 free Passive), Template B (3 trees, "spend an additional 1 Investiture" Free-Action rider), Template C (2 trees, the statblock-reveal entry).
   - Evidence: Template A: Void Sense, Accumulate, Prognosis all depth-1 Passives on the same "takes damage from any source … recover 1 Investiture once per round" shape; Expose is the variant. Template B: a search of all 365 for "spend an additional" returns exactly four talents — heroic/Warrior's Stonestance plus Sealed Edict, Pinpoint Charge and Inevitable Snare, all Free Action / 1 Investiture / depth 1. Template C: exactly two talents in 365 contain "conditions, and Physical and Spiritual defenses" — Studied Mark and Vital Diagnosis, both depth 0, 1 Action, 1 Investiture.
25. **CORRECTED** — §6 — "Trade Routes (Civ, 1A/1I) links two squares; Weave the Thread (Fate, 2A/2I) links two squares — twice the price for the same template."
   - Evidence: Trade Routes: "an ally standing in either linked Foundation may teleport to the other as a Free Action once per turn." Weave the Thread: "an ally standing on either linked square may use the Aid action as a Free Action once per round, and when an enemy triggers any Snare within 30 ft of either linked square, an ally standing on either linked square may make a free Reactive Strike."
   - Corrected: Same skeleton (link two of your own squares, scene duration), materially different payloads — a teleport versus a free Aid plus a free Reactive Strike. "Twice the price for the same template" is not supported.
26. **REFUTED** — §5 — an independent 20-dimension function vector places deity/Power↔leyline/Red at 0.853, "higher than the census's highest deity–deity pair (0.779) and higher than 6 of the 15 highest pairs in the whole 210-pair matrix", and Chaos↔Knowledge at 0.827 as the closest deity pair.
   - Evidence: None of these numbers can be checked against the sources supplied, and the comparison is invalid on its face: the census's cosines come from a vector space with atlas vocabulary controlled out, and the analysis's come from a differently-constructed 20-dimension vector. Comparing 0.853 from one metric to 0.779 and to the census's 210-pair ranking from another is not a comparison.
   - Corrected: Drop the numbers. The QUALITATIVE observations survive on talent text alone and are strong without them: Power's Warlord's Advance / Unstoppable Advance / Momentum of Victory / Warlord's Fury are melee-momentum riders on a chassis leyline/Red already owns; and Chaos↔Knowledge really are the same mark-cap-refund-detonate skeleton (Omen cap = tier vs Insight cap = 5; Void Sense vs Accumulate identical trigger).
27. **CORRECTED** — §3.7 — Warlord's Fury caps at Tier×2 = +4 at Tier 2, while leyline/Red's Mighty grants +6 on a two-Action attack "forever, for nothing" — "a shared leyline stat-stick beats Power's signature".
   - Evidence: Mighty (verbatim in six trees — leyline/Red, heroic/Agent, Envoy, Hunter, Leader, Warrior): "for each action spent, deal extra damage equal to 1 + your tier." At Tier 2 that is +3 per action spent. Power's own attack talents — Warlord's Advance and Momentum of Victory's Strike — are ONE-Action attacks, where Mighty pays +3, not +6. Warlord's Fury pays up to +4 on every melee attack for the scene, and the two stack.
   - Corrected: On the attacks Power actually makes, Warlord's Fury (+4) beats Mighty (+3) and stacks with it. The real charge against Warlord's Fury is its price (2 Actions + 2 Investiture, depth 2, and it starts at +0) and the fact that the guide's promised Bounty is unnamed — not that Mighty out-damages it.
28. **REFUTED** — §0.1/§3.10 — the deity spread is "roughly 6:1 in per-round combat swing" and "a wider spread than exists between the five leyline trees"; Sovereignty produces ~60 points of swing over five Tier-2 rounds against Knowledge's ~360.
   - Evidence: Three problems. (1) The temp-HP leg (~27) is void — temp HP does not accumulate (28-temporary-hp.js). (2) The mitigation leg imports "~1.5 dice" per adversary attack; the analysis itself says two paragraphs earlier that "Nothing in the 365 tells us how many dice an adversary rolls — that lives in adversary statblocks, which are out of scope", then uses the number anyway. (3) The comparison half is never computed: the analysis produces no per-round swing figure for any of the five leyline trees, so "wider than the leyline spread" is asserted, not measured (and leyline/Blue's damage spread against leyline/Red is already infinite).
   - Corrected: The ordinal claim stands — Knowledge has the highest ceiling and Sovereignty the lowest whole-fight contribution. The 6:1 ratio and the leyline comparison should be withdrawn; what is defensible is "Sovereignty is the only deity tree whose entire nine-talent contribution is smaller than several single deity talents", which is supportable from the entry-comparison table alone.
29. **CORRECTED** — §0.2/§2 — deity/Knowledge is the strongest deity tree.
   - Evidence: The strongest opposite case, built from talent text: Studied Mark says "You may have Insight on only one creature at a time; placing Insight on a new creature removes all existing Insight", so the 45-per-Action figure exists only against a single target that survives the ~3-turn ramp; against two or more enemies Knowledge collapses to 1U per Action (min-1 clause), which is last-place output. The tree grants no accuracy, so its headline number is multiplied by an unknown hit rate. Destruction's Set Charge, by contrast, is "no attack roll, no save" and scales with enemy count. Whether a target survives three rounds is an adversary-statblock question and is OUT OF SCOPE — yet the analysis flags scope on its §8f skill-rank footnote and not on its #1 pick.
   - Corrected: Knowledge has the highest CEILING in the deity atlas, conditional on a single durable target and on an accuracy source it does not own; Destruction has the highest FLOOR and the only unconditional damage. The unconditional "Knowledge's nine talents out-damage any nine-talent leyline selection by roughly 3–5×" should be restated as boss-fight-conditional, and the condition named as unsettleable inside the scope fence.
30. **CORRECTED** — §3.2/§3.3 — Civilization at level 3 produces "4U = 36 damage per round for zero Actions"; Destruction against three clustered enemies is "3U = 27 per Action".
   - Evidence: [Tier][Die] is 1d6 at Tier 1 rank 2 (levels 1–5) and 2d8 at Tier 2 rank 3 (levels 6–10) — SYSTEM-PRIMER.md. Level 3 is Tier 1, so 4U = 4d6 = 14 mean, not 36. 36 is the Tier 2 number, unreachable before level 6 — by which point the build is 3 of 9 talents deep and the analysis's Investiture and action budgets change too. Destruction's 27 is correctly a Tier 2 figure.
   - Corrected: Civilization's Construct throws ~14 per round at level 3 and ~36 per round from level 6. The claim is right about the shape (highest free damage in the atlas) and wrong about the level it lands at.
31. **CONFIRMED** — §8e — the Combat Construct's and Risen Servant's attack bonus is undefined in the text and in the edha-summon schema, and this is the largest unresolved variable in the ranking.
   - Evidence: 53-native-event-system.js edha-summon config schema exposes summonName, img, creatureType, hpFormula, speed, defensePenalty, deflect, conditionImmunities, attackName, attackFormula, attackType, attackRange, actsAfterCaster, sustainCap, replaceOldest, tokenSizeFt, tokenSizeColor, placeAt, rangeColor, rangeFt, bakedEffectsJson, extraItemsJson — no accuracy or attack-bonus field. Forge Construct and Risen Servant give HP, Speed, defences, deflect and damage but no to-hit.
32. **CONFIRMED** — §3.10 — "Sovereignty is the only tree in the deity atlas whose BOTH entries expire at the start of your next turn."
   - Evidence: Exalt: "Until the start of your next turn, that ally's damage die size increases by one step". Censure: "until the start of your next turn, that creature's damage die size decreases by one step". The only other trees with a one-round entry effect pair it with a damage entry: Chaos's Isolating Pressure expires but Entropy Strike deals damage and banks an Omen; Power's Kneel expires but Warlord's Advance deals damage. No other tree has two entries that both leave nothing behind.

### What the analysis missed

- The `rangeColor` / `color` channel in the authored overlay — the second way a gate colour is cashed in. Searching only `skills.<colour>.rank` produced the analysis's single biggest error (Knowledge/Green) and its weakest correction (Civilization/White).
- module-src/scripts/engine/28-temporary-hp.js — temp HP does not stack and a smaller new grant overwrites a larger existing one. The analysis summed temp HP over rounds in two places (Order §3.5, Sovereignty §3.10) and both are load-bearing on its ranking.
- Death/Necrotic Cascade's connections divergence (prose one parent, connections two) — missed by the §8a/§8b sweep that claimed completeness over the 90.
- Destruction's friendly fire: Set Charge, Concussive Yield and Fault Line all damage 'each character' in their area, not each enemy. The analysis's #3 ranking rests on 'reliability' and never prices the cost of that reliability.
- That the free Black Attunement Key reads the Isolated status the engine explicitly makes inflictable — which invalidates the Chaos Revision-Principle-1 charge in §3.9.
- Fate's Read the Threads at depth 1 (L2) as the partial fix for the trigger-ownership problem: it lets you relocate an unsprung Snare into the path the target has just told you it will take. §3.8 says Fate has no answer until depth 2.
- Killing Blow's Red 3+ / L6 gate, when arguing that it dominates the L4 capstone The Final Study — the analysis lists that gate in its own §3.1 and forgets it three paragraphs later.
- Hollow Command resolves on a Deception vs Spiritual test, an off-colour skill. MEASURE 5 calls it 'no precondition' while criticising Absolute Authority's, and never mentions the roll.
- Fate's Snare as the deity atlas's best control (untested, unsaved Restrained at depth 0 / L1) in MEASURE 5 — a point the analysis itself makes correctly in §3.8 and then drops.
- deity/Life's Lifeline as the comparison set for 'best damage-redirection clause in the game' — it heals 2d8 to the ally and does not consume the 1-per-round Reaction slot.
- Internal contradictions the analysis should have caught in its own draft: §3.5 'one of four' Investiture-producer-less trees vs its §1 table's five; §5's Sovereignty row calling White 'its toll-booth colour' after §4 established it is not; §3.10's 'all nine move a damage die' against its own handler list; MEASURE 6's 'every deity free Passive is conditional' against its own praise of Walking Ruin; §3.6's 'The two problems' followed by three.
- The leyline half of headline claim #1. The analysis asserts the deity spread is wider than the leyline spread and never computes a single leyline per-round swing figure.

### Surviving findings, in priority order

1. Exactly ONE pure toll booth exists in the deity atlas — Fate/White (zero skills.white.rank refs, zero white rangeColor, three green-coloured edha-zone handlers). Knowledge/Green is not one: Green sizes the tree's Attunement Range in five authored rules. The census's 'four of five tolls are WHITE' pattern is dead, and so is the analysis's replacement two-toll list.
2. Civilization's Combat Construct is sized on WHITE — hpFormula and the 'Construct Slam' attackFormula are both (@tier)d(2 * @skills.white.rank + 2), and Siege Form and Magnum Opus follow. The tree the analysis ranks #2 runs its entire damage engine off the colour the census called a toll booth. Both the census and the analysis under-read this.
3. Temporary HP does not stack and a new grant overwrites the old EVEN IF SMALLER (28-temporary-hp.js). Any deity comparison that sums temp HP over rounds is void — this deletes Order's '~30 temp HP for zero Actions', a third of Sovereignty's '~60 swing', and makes Bear Witness a possible net NEGATIVE at Tier 2 by overwriting Shoulder the Oath's and Final Decree's larger [Tier][Die] grants. This is a live design bug worth a ruling, not just a measurement fix.
4. deity/Sovereignty is the weakest tree and the case survives every check: zero damage on both evidence streams, seven of nine talents doing one thing (a ±1-mean die step), both entries expiring at the start of your next turn while every other tree's entry buys a full [Tier][Die] or a scene-long asset, six skill ranks of gate for one authored White reference, and the promised Decree radius present in BOTH intent sources and in zero talents. Withdraw the '~60 points of swing' arithmetic; the entry-comparison table alone carries the finding.
5. Death/Raise Dead is an iron-rule-7 third-case bug live on main (card: 'Necrotic Cascade or Speak with the Fallen'; connections: ['Necrotic Cascade','Risen Servant']). And there is a second the analysis missed: Death/Necrotic Cascade prints 'Consuming Decay' and carries connections ['Consuming Decay','Death Ward']. Both are in the Death tree; a sweep of the other nine deity trees finds no third.
6. The census's damage classifier really does under-read Knowledge ~5× — the per-Insight multiplication lives in the authored edha-damage-bonus amountFormula ('((@tier)d(2 * @colorRank + 2)) * max(@counter, 1)'), not in damage.formula. Any future census ranking damage from damageFormula alone will put the atlas's highest-ceiling tree near the bottom. This is the third classifier bug the brief predicted.
7. Knowledge's ceiling is boss-conditional and the condition is out of scope. Insight lives on one creature at a time and resets on retarget; against 2+ enemies Knowledge is a 1U-per-Action tree. Whether the headline 45/Action is ever realised depends on adversary durability, which the scope fence excludes — say so, rather than ranking on the ceiling.
8. Destruction has the highest FLOOR in the deity atlas — the only no-roll, no-save damage, and six damage formulas, the most of ANY of the 21 trees (leyline/Red is next at 4). But its Charge, Concussive Yield and Fault Line all read 'each character', i.e. friendly fire in a 10 ft radius the placer chooses. Nobody has priced that.
9. Six of ten deity trees miss the guide's own Passive target of 2–3 of 9, and all ten have zero Specials against a stated 15–20%. Power is the extreme: zero Passives, zero Reactions, zero Specials, 14 Actions and 15 Investiture to deploy, no regen, and its one Free Action needs an Opportunity the tree cannot make.
10. Three verbatim template families are the real convergence story, and all three check out: the depth-1 'mark takes damage → recover 1 Investiture' free Passive (Chaos/Knowledge/Life, with Sovereignty's Expose as a variant); the Free-Action 'spend an additional 1 Investiture' upgrade rider (Order/Destruction/Fate — exactly four talents in 365 use that phrase, the fourth being Warrior's Stonestance); and the statblock-reveal entry (Knowledge/Life — exactly two talents in 365 carry the phrase). This is a bigger deity-atlas problem than Destruction↔Fate and the census did not surface it.
11. Chaos's second entry is not the Revision-Principle-1 violation the analysis claims: every Chaos character holds Black 2+ and therefore the free Black Attunement Key, and edhaIsIsolated ORs in the INFLICTED isolated status, so Isolating Pressure → Draw Mana → Weakened works at level 1. The residual, narrower complaint is that it costs half a level-1 Investiture pool for a one-round state and no damage.
12. Order/Lawkeeper's Eye is genuinely unique and the analysis undersold it: 'you and your allies have advantage on attack tests against that character' is the ONLY such clause in all 365 talents (advantage-ledger.md line 94), free, passive, permanent, party-wide.
13. Data-integrity item nobody has flagged: Civilization's Bonds of Community reads 'temporary HP equal to your White' in prose but its authored handler is amountFormula '@skills.white.rank + @attr.wil'. That is a live prose↔implementation divergence outside the four flagged authored-text overrides, and it makes the talent stronger than its card at the table.
