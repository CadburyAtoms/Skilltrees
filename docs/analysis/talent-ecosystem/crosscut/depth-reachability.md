# Tree structure — depth, reachability and whether the climb pays

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `depth-reachability`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# Tree structure — depth, reachability, and whether the climb pays

**Method.** Everything below is computed from `all-talents.json` (365 rows: `depth`, `earliestLevel`, `prerequisites`, `connections`, `action`, `cost`, `damageFormula`) and cross-read against the 21 dossiers and the 21 verified profiles. Where a number is mine I say how it was derived; where a judgment is another analyst's I label it. Two corrections to the shared frame come first, because six of the questions below change answer once they land.

---

## 0. Two corrections to the shared frame

### 0.1 The dossier's `depth` is PROSE depth, not the depth Foundry enforces

`depth` in the dossier is derived from the `prerequisites` prose string. The prerequisite Foundry actually enforces is `connections` (iron rule 7: "every entry in a talent's `connections` array becomes a **managed talent prerequisite**"). I recomputed depth from `connections` alone. They disagree on **29 talents in 6 trees**:

| Tree | prose→enforced |
|---|---|
| **heroic/Hunter** | **all 25 talents → depth 0** (see §6.1) |
| leyline/Red | Flashpoint d2→**d0**; Mighty d3→**d1**; Afterburn d4→**d2**; Chain Detonation d5→**d3** |
| leyline/Green | Scent the Weak d2→**d1**; Pack Pressure d3→**d2**; Drive the Prey d4→**d3** |
| leyline/White | Unity of Purpose d2→**d1** |
| heroic/Warrior | Bloodstance d2→**d1**; Meteoric Leap d3→**d2** |
| heroic/Envoy | Inspired Zeal d3→**d2** |

No cycles and no inverted edges survive anywhere — the enforced-depth fixpoint converged on all 21 trees, so iron rule 7's DFS gate is doing its job. What it does *not* catch is the third case the rule names (prose and `connections` naming different parents), and that case is still live in five places: **leyline/Green Scent the Weak** (prose "Predator's Instinct", connections `Pack Hunter`) and **Coordinated Hunt** (prose "Pack Hunter", connections `Predator's Instinct`) — a straight swap; **leyline/White Unity of Purpose** (prose "Concordant Presence", connections `Guiding Signal`); **deity/Death Raise Dead** (prose "Necrotic Cascade or Speak with the Fallen", connections `Necrotic Cascade` OR `Risen Servant`); **deity/Death Necrotic Cascade** (prose "Consuming Decay", connections `Consuming Decay` OR **`Death Ward`** — looser than the card says); **heroic/Leader Confident Command** (prose "Customary Garb", connections `Relentless March` OR `Customary Garb` — also looser).

### 0.2 "Heroic paths carry no rank gate, so the whole tree is reachable by L4–L5" is false

That structural fact was given to me as settled. It is not. The rank cap of 2 until level 6 (SYSTEM-PRIMER, `ACTOR_STAT_DERIVATION`) applies to **every** skill, not just the five leyline colours. Heroic trees gate on Deduction 3+, Athletics 3+, Persuasion 3+, Discipline 3+, Perception 3+, Agility 3+, Stealth 3+, Thievery 3+, Lore 3+, Medicine 3+, Crafting 3+, Intimidation 3+, Leadership 3+, Insight 3+ — and every one of those is a level-6 gate.

The dossier `earliestLevel` column encodes only the colour gates, so it undercounts the heroic atlas by **30 talents**:

```
heroic/Agent    7 undercounted   Sleuth's Instincts, Close the Case, Subtle Takedown,
                                 Mercurial Façade, Shadow Step, Fast Talker, Trickster's Hand
heroic/Envoy    6   Peaceful Solution, Practiced Oratory, Sage Counsel, Inspired Zeal,
                    Foresight, Rallying Shout   (its ENTIRE depth-3 band)
heroic/Hunter   6   Exploit Weakness, Unrelenting Salvo, Fatal Thrust, Sidestep,
                    Hunter's Edge, Pack Hunting
heroic/Leader   5   Resilient Hero, Relentless March, Synchronized Assault, Set at Odds,
                    Grand Deception
heroic/Scholar  6   Overcharge, Overwhelm with Details, Contingency, Turning Point,
                    Ongoing Care, Resuscitation
heroic/Warrior  6   Vinestance, Wit's End, Precise Parry, Meteoric Leap,
                    Devastating Blow, Wary
leyline (5 trees) 6 more: White Shared Burden(Leadership 3+), Blue Baleful(Persuasion 3+),
                    Black Extract Thought(Deception 3+), Red Feeding Frenzy(Intimidation 3+),
                    Green Pack Sense(Survival 3+), Green Natural Recovery(Medicine 3+)
```

**The consequence that matters most for this whole review:** `Devastating Blow` — the benchmark cited in the ecosystem brief as "2d8 at level 2 and still 2d8 at level 10" — has prerequisite `Combat Training; **Athletics 3+**`. It is a **level 6** talent. So is `Wit's End` (Intimidation 3+, 4d6) and `Fatal Thrust` (Perception 3+, 4d4). Three of the heroic atlas's five damage formulas are unavailable before level 6, the exact level at which the leyline die doubles. The "heroic is flat while leyline spikes" story is real but the shape is different from the one on the table: heroic doesn't spike, **and heroic's damage talents don't exist before the spike either.**

Corrected L6-gate census (my count, all skills):

| | L6-gated talents | % of tree |
|---|---|---|
| leyline | White 6, Blue 8, Black 7, Red 7, Green 8 | 24–32% |
| heroic | Agent 7, Envoy 6, Hunter 6, Leader 5, Scholar 6, Warrior 6 | 20–28% |
| deity | Chaos/Civ/Death/Destr/Fate/Power **0**, Order 1, Life/Know/Sov 2 | 0–22% |

Leyline and heroic are gated at essentially the same rate. **Deity is barely gated at all.**

---

## 1. Depth distribution and width

Enforced depth (from `connections`), width per band, and the earliest level each band opens for a character who takes the cheapest legal chain:

```
TREE                 d0  d1  d2  d3  d4  d5 | maxDepth  roots(non-Key)  meanBranch  leaves
leyline/White         5   6   4   6   4   - |    4            3            5.0        7
leyline/Blue          4   6   8   6   1   - |    4            2*           7.0        9
leyline/Black         4   6   5   4   4   2 |    5            3            7.0        7
leyline/Red           5   7   5   5   2   1 |    5            4†           5.0        8
leyline/Green         4   6   7   6   2   - |    4            3            7.0        7
heroic/Agent          7   6   9   3   -   - |    3            6            3.0       12
heroic/Envoy          7   7   6   5   -   - |    3            5            3.6        9
heroic/Hunter        25   -   -   -   -   - |    0            0           n/a        25
heroic/Leader         7   5   7   5   1   - |    4            5            3.6        9
heroic/Scholar        7   9   6   3   -   - |    3            6            3.0       12
heroic/Warrior        7   9   8   1   -   - |    3            6            3.0       11
deity  ×10            2   4   2   1   -   - |    3            2            3.5        1
```
\* Blue's third specialty has **no root** (§6.4). † includes the orphaned Flashpoint (§6.2).

**Wide and shallow: the heroic atlas.** 7 depth-0 entries, 6 of which lead somewhere, mean branch 3.0–3.6 talents, max depth 3. At level-up a heroic player is choosing between ~6 short ladders. They can sample four specialties by level 4 and lose nothing.

**Narrow and deep: the leyline atlas.** 4–5 entries of which exactly **one per specialty** is real (White Coordination and Red Conflagration have a second root only because of the two data faults in §6.2/§6.3). Mean branch 5.0–7.0, max depth 4–5. A leyline player choosing `Verdant Mend` at level 1 has opened a **sealed 8-talent Restoration branch** and closed nothing else — but every further step in it is 1 pick deeper, and by level 5 they have five picks in a 25-talent tree of which 8 sit behind one entry they may not have bought.

**Narrowest of all: deity.** 2 entries, 9 talents, and a topology that is byte-identical in all ten trees (§2).

**Structural width of the level-up choice.** The more useful number than "width at depth d" is **how many talents newly become legal at each level** for a single-path character. Computed as `max(minimum picks along the cheapest ancestor chain, 6 if any rank-3 gate on that chain)`:

```
TREE                 L1  L2  L3  L4  L5  L6  | ≤L5   L6
leyline/White         4   6   3   4   2   6  |  19    6
leyline/Blue          4   6   5   2   0   8  |  17    8
leyline/Black         4   6   4   2   2   7  |  18    7
leyline/Red           5   7   3   2   1   7  |  18    7
leyline/Green         4   6   5   2   0   8  |  17    8
heroic/Agent          7   6   5   0   0   7  |  18    7
heroic/Envoy          7   7   5   0   0   6  |  19    6
heroic/Hunter        19   0   0   0   0   6  |  19    6
heroic/Leader         7   5   6   2   0   5  |  20    5
heroic/Scholar        7   8   3   1   0   6  |  19    6
heroic/Warrior        7   8   4   0   0   6  |  19    6
deity/Chaos,Civ,      2   4   2   1   0   0  |   9    0
  Death,Destr,
  Fate,Power
deity/Order           2   3   2   1   0   1  |   8    1
deity/Life,Know,Sov   2   2   2   1   0   2  |   7    2
```

Two facts fall out of that table and neither is small:

- **Level 5 opens nothing new in 18 of 21 trees.** Only leyline/White (2), leyline/Black (2) and leyline/Red (1) put anything at level 5. In every heroic tree and every deity tree, and in Blue and Green, a player levelling from 4 to 5 is choosing from a menu they already had.
- **Levels 4 AND 5 together open nothing at all in four trees** — heroic/Agent, heroic/Envoy, heroic/Hunter, heroic/Warrior — and one talent in heroic/Scholar. In Agent, Envoy and Warrior *the entire depth-3 band is rank-3 gated*, so the graph's "deep" content and the calendar's "level 6" content are the same set, and the two levels in between are structurally dead.

That is the level-up experience the shape produces: a rich L1–L3, two flat levels, then a quarter of the tree at once.

---

## 2. The corpus has exactly two shapes, and the leyline guide forbids one of them

Every leyline and heroic tree is **1 Key + 3 specialties × 8 talents = 25**, without exception (verified on the `specialty` field: `Key:1, X:8, Y:8, Z:8` in all eleven; heroic/Leader is `7/9/8` and is the only wobble). Every deity tree is **2 entries → 2 children each → 2 synthesis (each an OR of one child from each pair) → 1 capstone (OR of both synthesis nodes)** — 10 edges, 3 OR-joins, 1 leaf, in all ten, identically.

The leyline design guide's revision principle 8 says verbatim: *"Each tree meets its own needs. Do NOT impose a uniform node count or structure across all 15 trees. Let the tree's mechanical logic determine its shape."* The leyline atlas is a five-fold copy of one 1+8+8+8 template. Principle 8 is not being followed, and (separately) the deity guide **prescribes** its template, so the deity uniformity is intentional and the leyline uniformity is not.

The deity lattice is, structurally, the best-designed shape in the corpus and I want to say so plainly before criticising its contents: every talent is reachable, the capstone is reachable from either half, the OR-joins mean no single pick is ever mandatory, and it costs exactly 4 picks to reach the end from either entry. Its problem is not its shape (§3.2).

---

## 3. Does the climb pay?

### 3.1 Band ratings — the other analysts' judgment

`powerByDepth` ratings from the 21 verified profiles, with the delta I care about:

```
TREE                d0   d1-2   d3+    d3+ minus d0
leyline/Black        5     3      4        -1
deity/Knowledge      4     4      2        -2
heroic/Agent         4     4      2        -2
heroic/Leader        4     3      2        -2
deity/Civilization   4     3      3        -1
deity/Death          4     5      3        -1
deity/Life           4     3      3        -1
deity/Order          4     3      3        -1
heroic/Warrior       4     4      3        -1
deity/Chaos          3     3      3         0
deity/Destruction    4     3      4         0
deity/Fate           3     4      3         0
deity/Power          4     3      4         0
heroic/Envoy         4     3      4         0
leyline/Green        3     4      3         0
leyline/Red          3     5      3         0
deity/Sovereignty    2     3      3        +1
heroic/Hunter        3     3      4        +1
leyline/White        3     3      4        +1
leyline/Blue         2     3      4        +2
heroic/Scholar       2     3      4        +2
```

**In 15 of 21 trees the deep band is rated no better than the entry band** (9 negative, 6 flat). Only 6 trees pay for the climb, and three of those (Blue, Scholar, Sovereignty) pay only because their *entries* are rated 2 — the climb is recovering from a bad start, not building to a peak.

### 3.2 Independent structural corroboration — the weak-flag rate rises with depth

Rather than take those ratings on trust, I counted how many talents each profile put in `weakTalents` or `bottomThree`, bucketed by depth, across all 21 trees:

```
depth 0    : 25 / 83  flagged weak = 30%
depth 1-2  : 73 / 203                36%
depth 3+   : 36 / 79                 46%
```

Monotone. **A talent is 1.5× more likely to be judged weak if it is deep than if it is an entry.** Twenty-one independent reviewers, judging different trees against different intents, produced a corpus in which the reward for climbing is negative.

The mechanism is visible in the cost data. Mean action cost and mean resource cost by band (Passive/Special/Free/Reaction = 0 Actions):

```
                    d0            d1-2          d3+
deity (all ten)  0.5-1.0 A     0.5-1.5 A     3.0 A / 3-4 resource
heroic/Leader    0.57 A        0.00 A        1.33 A, 2× three-Action
heroic/Agent     0.43 A        0.13 A        1.00 A, 1× three-Action
heroic/Scholar   0.14 A        0.13 A        0.67 A / 1.33 res
heroic/Warrior   0.71 A        0.63 A        1.00 A / 1.50 res
leyline/White    0.20 A/0.60r  0.00 A/0.70r  0.20 A/1.00r
leyline/Green    0.25 A/0.50r  0.08 A/0.42r  0.78 A/0.78r
```

Deep talents cost *more actions and more resource* than entries in 17 of 21 trees. Where the effect does not scale correspondingly, the climb is strictly negative. **The deity atlas is the extreme case: the capstone band costs 3 Actions and 3 Investiture in ten trees out of ten (Death: 4 Investiture), against entries at 0.5–1.0 Actions and 1 Investiture.** A Fast turn has 2 Actions — so every deity capstone in the game is *unplayable on a Fast turn*, and at level 4, the level it unlocks, 3 Investiture is roughly three-quarters of a starting pool of `2 + max(AWA,PRE)` ≈ 4–5.

**Nine of ten deity capstones are flagged weak by their own tree's reviewer.** Only `deity/Power`'s *Mantle of the Aspirant* survives. This is not a coincidence of ten independent judgments; it is the shape. The deity guide's own pitfall list says *"Capstones that don't pay off the tree's investment"* and *"don't undersell the capstones"*, and the template it prescribes — 3 Actions / 3 Investiture / once per scene, at depth 3, reachable at **level 4** — prices the capstone as a Tier-2 play and delivers it in Tier 1.

### 3.3 Every depth-2+ talent judged weaker than a depth-0 talent in the same tree

The question asked for the list. These are talents at enforced depth ≥ 2 that appear in their tree's `weakTalents`/`bottomThree`, set against that tree's depth-0 talents that appear in `topThree`. **67 talents, 39% of the 173 talents at depth 2+.**

**deity (19 of 30 depth-2+ talents = 63%)**
- Chaos: *Cascade Collapse* (d2, 2A/2Inv), *Unravel Everything* (d3, 3A/3Inv) — vs **Entropy Strike** (d0, 1A/1Inv). Isolating Ruin at d2 deals double the capstone's damage for two-thirds the actions.
- Civilization: *Magnum Opus* (d3, 3A/3Inv) — vs **Forge Construct** (d0, 1A/1Inv).
- Death: *Risen Servant* (d2, 1A/1Inv), *Raise Dead* (d3, **3A/4Inv**, more than a starting pool) — vs **Reaper's Harvest** (d0, free Passive).
- Destruction: *Cascading Failure* (d2, 2A/2Inv), *The Unmooring* (d3, 3A/3Inv) — vs **Set Charge** (d0, 1A/1Inv). Three Free-Action Set Charge detonations buy more for the same Investiture and no scene cap.
- Fate: *Thread of Inevitability* (d3, 3A/3Inv) — vs **Snare** (d0, 1A/1Inv).
- Knowledge: *The Final Study* (d3, 3A/3Inv) — vs **Predatory Strike** (d0, 1A/1Inv), which deals the same per-Insight dice with no scene limit.
- Life: *Lifeline* (d2, 1A/2Inv), *Primal Regeneration* (d2, 2A/2Inv), *Apex Form* (d3, 3A/3Inv) — vs **Vital Diagnosis** (d0, 1A/1Inv).
- Order: *Verdict* (d2, 2A/2Inv), *Concord* (d2, 2A/2Inv), *Final Decree* (d3, 3A/3Inv) — vs **Covenant** (d0, 1A/1Inv).
- Power: *Investiture of Command* (d2, 2A/2Inv), *Warlord's Fury* (d2, 2A/2Inv) — vs **Kneel** (d0, 1A/1Inv).
- Sovereignty: *Sovereign's Balance* (d2, 1A/2Inv), *Sovereignty* (d3, 3A/3Inv) — and Sovereignty has **no depth-0 talent in its own top three**; its best talent is *Edict of the Fallen* at d2.

**heroic (22 of 67 = 33%)**
- Agent: *Close the Case* (d3, **3A/3 focus**), *Mercurial Façade* (d3) — vs **Sure Outcome** and **Cheap Shot**, both d0/L1.
- Envoy: *Calm Appeal* (d2), *High Society Contacts* (d2, Special/2 focus), *Guiding Oration* (d2), *Sage Counsel* (d3), *Peaceful Solution* (d3) — vs **Practical Demonstration** (d0, Free Action, no cost) and **Steadfast Challenge** (d0).
- Hunter: *Hardy* (d2), *Sidestep* (d2), *Exploit Weakness* (d2), *Swift Strikes* (d3) — vs **Deadly Trap** and **Animal Bond**, both d0/L1. (Hunter's depths are prose-only; see §6.1.)
- Leader: *Well Dressed* (d2), *Mighty* (d2), *Demonstrative Command* (d3), *Grand Deception* (d3, **3A/3 focus**), *Synchronized Assault* (**d4, 3A/2 focus, the capstone**) — vs **Decisive Command** (the free Key) and **Combat Coordination** (d0, Free Action).
- Scholar: *Deep Contemplation* (d2, 2A), *Contingency* (d2, Reaction/2 focus), *Keen Insight* (d3), *Overwhelm with Details* (d3) — vs **Efficient Engineer** (d0).
- Warrior: *Swift Strikes* (d2, 1A/1 focus, "the Strike every character already has"), *Bloodstance* (d2) — vs **Stonestance** (d0, free).

**leyline (26 of 76 = 34%)**
- White: *Unity of Purpose* (d2 prose / **d1 enforced**), *Shared Burden* (d2, Reaction/2Inv, truly L6), *Overwhelming Authority* (d2), *Ordered Advance* (d3, 2A/1Inv), *Hardy* (d3, L6, a +max-HP stat stick behind a White 3+ gate) — vs **Guardian Stance** (d0, free, permanent).
- Blue: *Collected* (d2, **L6**, free Passive, +2 to two defences), *Anticipate* (d3, L6, Reaction+1Inv), *Ghostly Walls* (d3, L6, 1A/2Inv), *Living Image* (d3, L6), *Baleful* (d3, truly L6) — vs **Forewarned** (d0, L1, no action, no cost).
- Black: *Spoils of Isolation* (d2, 2A/1Inv for a flat 1–2 damage AoE), *Cruel Step* (d2), *Composed* (d3, one whole talent slot for +2 max focus), *Puppeteer* (d4, **L6**, Reaction + 2 focus + 1 Inv, and requires a 0-focus enemy Black cannot create) — vs **Withering Ray** (d0, L1, 1 Action, 2[Tier][Die] vital) and **Hollow Command** (d0). Black's depth-0 band is the only band in the corpus rated **5**, and its depth-3+ band is rated 4. This is the clearest single case of "the entry is the tree".
- Red: *Shatter Focus* (d2), *Feeding Frenzy* (d2, truly L6), *Shockwave Slam* (d3), *Mighty* (d3 prose / **d1 enforced**), *Frenzied Tempo* (d3), *Reckless Gambit* (d3, L6, costs an Opportunity *and* 1 Investiture) — and Red has **no depth-0 talent in its own top three** (its best three are Momentum's Edge d2, Kindle d2, Battle Fever d1).
- Green: *Hardy* (d2), *Collected* (d3), *Packmate's Warning* (d3, burns the round's one Reaction), *Apex Predator* (d3, L6), *Drive the Prey* (d4, L6, 2A/2Inv, double-gated Green 3+ **and** Survival 3+), *Natural Order* (d4, L6, 2A/2Inv) — and Green also has **no depth-0 talent in its top three**.

### 3.4 Where the climb *does* pay, and why

Six trees. Three of them (leyline/Blue +2, heroic/Scholar +2, deity/Sovereignty +1) pay because the entries are bad, and that is a different problem wearing the same face. The two honest cases are **leyline/White** (+1: *Shield Wall* at d3/L4 is a free permanent multi-target mitigation Passive, *Unbreakable Line* at d4/L6 is the tree's #2 talent) and **heroic/Hunter** (+1 — but its graph is broken, so "depth 3" is not a thing a Hunter has to climb to; see §6.1). **leyline/Blue is the single clearest designed back-load in the corpus**: its d0 band is rated 2, its d3+ band 4, it has the joint-most L6 talents (8), and 5 of its 8 Calculation talents are level 6. Its reviewer's verdict — "a tree whose real kit does not assemble until level 6" — is structurally exactly right.

---

## 4. Reachability under the real advancement rules

**The binding constraint is picks, not depth.** With 1 talent per level and a maximum enforced depth of 5, no talent in the corpus is ever unreachable for depth reasons — every talent costs `enforced depth + 1` picks, and the worst case in the game is 6 (`leyline/Black Sovereign of Solitude`, `Double Dip`; `leyline/Red Unstoppable`).

Pick-cost distribution (minimum picks in-tree to legally own a talent):

```
TREE                 1p  2p  3p  4p  5p  6p | ≥5 picks
leyline/White         5   6   4   6   4   0 |    4
leyline/Blue          4   6   8   6   1   0 |    1
leyline/Black         4   6   5   4   4   2 |    6
leyline/Red           5   7   5   5   2   1 |    3
leyline/Green         4   6   7   6   2   0 |    2
heroic/Agent          7   6   9   3   0   0 |    0
heroic/Envoy          7   7   6   5   0   0 |    0
heroic/Hunter        25   0   0   0   0   0 |    0
heroic/Leader         7   5   7   5   1   0 |    1
heroic/Scholar        7   9   6   3   0   0 |    0
heroic/Warrior        7   9   8   1   0   0 |    0
deity ×10             2   4   2   1   0   0 |    0
```

**By level 5** a single-path character has 5 picks: 5 of 25 (**20%**) of a leyline or heroic tree, or 5 of 9 (**56%**) of a deity tree. Structure never binds — even Black's 6-pick capstones are level-gated to 6 anyway, so picks and levels bind together.

**By level 10**, 10 picks: 10 of 25 (**40%**) of a leyline or heroic tree. But a deity tree is only 9 talents — **a deity-path character owns their entire tree at level 9 and has a spare pick at level 10.** Nothing in a deity tree is ever unreachable for any reason. That asymmetry is worth stating baldly for question 3 ("do deity paths feel similar in power to each other?"): they feel similar in part because *they are all completable*, while no leyline or heroic character ever sees more than 40% of theirs.

**Cost to the payoff:**

| | picks to the deepest node | level it lands |
|---|---|---|
| **deity, all ten** | **4** | **L4** (Order/Life/Knowledge/Sovereignty can also reach it at L4 by taking the ungated sibling) |
| leyline | White 5, Blue 5, Green 4–5, Black 6, Red 4–6 | **L6 in every tree** |
| heroic | Envoy 3–4, Warrior 3–4, Agent 4, Scholar 4, Leader 5 | **L6 in every tree** (except Scholar's *Keen Insight*, L4) |

**The deity gate.** Deity entries require two colours at rank 2+ — a skill-rank cost, not a talent-pick cost, so it does not consume picks. Note the OR-structure means the rank-3 gates inside Order, Life, Knowledge and Sovereignty **never block progress**: `Sealed Edict` (Blue 3+), `Surgical Precision`/`Adaptive Mutation` (Blue 3+/Green 3+), `Pack Share`/`Killing Blow` (Green 3+/Red 3+), `Investiture of Authority`/`Decree of Ruin` (White 3+/Black 3+) each have an ungated sibling feeding the same synthesis node. They are pure optional extras, and every one of them sits at **2 picks / level 6** — a talent you could have had at level 2 by pick-cost, withheld to level 6 by rank.

**Talents effectively unreachable for a split-pick character.** A character splitting 10 picks between a deity tree (4 to capstone) and a leyline tree (6 remaining) can still reach anything: Black's 6-pick capstones are exactly affordable. At 5 picks in a leyline tree the following become unreachable: `Black Sovereign of Solitude`, `Black Double Dip` (6p), `Red Unstoppable` (6p). At 4 picks: those plus `White` 4 talents, `Black` 6, `Red` 3, `Green` 2, `Blue` 1, `Leader` 1. **The heroic atlas is uniquely split-friendly: not one heroic talent costs more than 5 picks, and 4 of 6 heroic trees cap out at 4.** That is a real and probably unintended advantage for multi-path characters.

**One thing I cannot settle inside the fence.** Deity entries demand 4 skill ranks (two colours at 2) at level 1 while leyline entries demand 1. Whether a level-1 character has 4 spare ranks is a character-creation question answered by the system's advancement table, not by the 365 talents. If they do not, every `earliestLevel 1` on a deity talent is wrong and the whole deity atlas shifts later. What would settle it: the L1 skill-rank allotment in `docs/ACTOR_STAT_DERIVATION.md` / the system advancement table.

---

## 5. The L6 cliff, quantified

Level 6 does five things at once. Four of them hit leyline and deity; one of them hits heroic.

1. **Tier 1 → 2.** `[Tier][Die]` goes from 1 die to 2.
2. **Rank cap 2 → 3.** `[Die]` goes d6 → d8.
3. **Rank-3 gates open** — 5–8 talents per leyline/heroic tree, 0–2 per deity tree.
4. **Attunement Range 30 ft → 60 ft**; **[Size] 5 ft → 10 ft** (both from the rank table).
5. **Draw Mana yields 2 Investiture per Action instead of 1** — sustain goes from 50% uptime to 67%.

**Numeric discontinuity, computed by evaluating every authored damage formula at (tier 1, rank 2) and (tier 2, rank 3):**

```
leyline / deity — [Tier][Die] family
  (@tier)d(2*rank+2)                3.5 → 9.0    ×2.57
  (2*@tier)d(2*rank+2)  [Withering Ray]  7.0 → 18.0   ×2.57
  floor((@tier)d(...)/2) [Volatile Strike, Shockwave Slam]  1.0 → 4.0  ×4.00
  (@tier)d(...) + @attr  [Isolating Pressure, Edict, Snare,
                          Withering Touch, Fault Line, …]  6.5 → 12.0  ×1.85
  @tier  [Momentum of Victory]        1.0 → 2.0   ×2.00

heroic — every single formula
  Devastating Blow (2 + max(@tier-2,0))d8    9.0 → 9.0   ×1.00
  Wit's End (4 + max((@tier-2)*2,0))d6      14.0 → 14.0  ×1.00
  Fatal Thrust 4d4                          10.0 → 10.0  ×1.00
  Deadly Trap 2d4                            5.0 →  5.0  ×1.00
  Cheap Shot @scalar.damage.unarmed          2.0 →  2.0  ×1.00
```

**Every leyline and deity damage formula multiplies by 1.85–4.00 at level 6. Every heroic damage formula multiplies by exactly 1.00.** The two heroic formulas that *do* carry a tier term (`Devastating Blow`, `Wit's End`) are written to step at **tier 3**, i.e. level 11 — outside the entire 1–10 band this game is being played in. That is not "flat by design"; it looks like a tier-2/tier-3 off-by-one in two formulas.

**Structural discontinuity.** From the level-opening table in §1: leyline dumps 24–32% of its tree at L6 after opening 0–2 talents at L4 and L5; heroic dumps 20–28% at L6 after opening 0–2 at L4–L5; deity dumps 0–22%.

**Is it designed or accidental?** Split verdict:

- **The tier/rank coincidence is designed and is fine.** `ACTOR_STAT_DERIVATION` puts tier 2 and rank cap 3 on the same step; that is the system's, not Edha's.
- **Putting a quarter of every tree behind rank 3 is Edha's own choice, and it is the leyline guide's revision principle 5 ("Add skill rank gates to deep nodes… 3rd-node-and-beyond talents should gate on skill investment") executed literally.** The guide asked for pacing; what it produced was a synchronised unlock. Nothing in it says *all* the deep nodes, and nothing warned that "rank 3" and "level 6" are the same event.
- **The heroic side is an accident with two distinct causes.** (a) Heroic rank-3 gates were treated in the dossier — and, I suspect, in design — as ordinary prerequisites rather than as level-6 locks, which is how `Devastating Blow` came to be described as a level-2 talent (§0.2). (b) The two tier-scaling heroic formulas step at tier 3 rather than tier 2, so heroic gains nothing numeric at the moment leyline gains ×2.57.
- **The deity side is the sharpest anomaly.** Deity gets multipliers 1, 2, 4 and 5 at level 6 and almost none of multiplier 3 — six deity trees have **zero** L6 gates. So a deity character's power more than doubles at level 6 without any new choices to make, and their capstone was already in hand at level 4. The deity atlas is front-loaded structurally and back-loaded numerically at the same time. `deity/Chaos`'s reviewer put it exactly: the capstone's power "is a step function on the tier boundary, not on depth."

**Worked comparison at the cliff.** A Black mage at L5: `Withering Ray`, 1 Action, 1 Investiture, 2d6 = 7 avg vital (ignores Deflect). At L6: 4d8 = 18. A Warrior at L5: weapon Strike + `Mighty` (+1+tier = +2), and `Devastating Blow` is not legal yet. At L6: `Devastating Blow` for **2 Actions** = 2d8 = 9 (Deflect-reduced), i.e. 4.5 per Action, against the Black mage's 18 per Action. The gap at level 6 is roughly **4×, per Action, in favour of leyline** — and it is heroic's rank gates that put `Devastating Blow` there in the first place.

---

## 6. Structural pathologies

### 6.1 heroic/Hunter's tree does not exist — all 25 `connections` arrays are empty

Every one of Hunter's 25 talents has `connections: []`. Its prose prerequisites are real and chain correctly (`Sharp Eye ← Tagging Shot`, `Cold Eyes ← Shadowing`, `Unrelenting Salvo ← Hardy`, and 15 more), but **`connections` is what Foundry enforces**. In play, Hunter is not a tree: it is 25 independent picks gated only by skill rank. `Unrelenting Salvo` — the only talent in the corpus that lifts the once-per-turn same-weapon Strike restriction, prose depth 3 — is a **level-6, one-pick** talent. `Mighty` and `Swift Strikes`, prose depth 3, are **level-1, one-pick** talents. `Fatal Thrust` (4d4, prose depth 1 behind `Startling Blow`) needs no `Startling Blow` at all.

This is the single largest structural defect in the corpus and it is a pure data bug: 18 prose edges that were never written into `connections`. It also invalidates the Hunter row of every depth-based comparison in this review and in the profiles, and it is very likely why Hunter's `powerByDepth` reads +1 for the climb — there is no climb.

**Fix:** populate `connections` from the prose for all 18. Check the same class of defect across the repo before assuming Hunter is the only one — `leyline/Red Flashpoint` below is the same bug at n=1.

### 6.2 leyline/Red `Flashpoint` is an orphan, and it drags a four-talent chain two levels forward

`Flashpoint` prose reads `Flame Surge or Arc Flash; Red 1+`; `connections` is `[]`. It is therefore a **depth-0 entry** in Foundry — Red's fifth root and its Conflagration specialty's second — and everything downstream shifts: `Mighty` d3→**d1** (available at L2 instead of L4), `Afterburn` d4→**d2**, `Chain Detonation` d5→**d3**. `Mighty` is a free no-action Passive; making it a 2-pick L2 talent rather than a 4-pick L4 one is a material power change nobody chose.

### 6.3 leyline/Green's Instinct branch has its two parents swapped

`Scent the Weak` prose says `Predator's Instinct`, `connections` says `Pack Hunter`. `Coordinated Hunt` prose says `Pack Hunter`, `connections` says `Predator's Instinct`. They are exactly transposed. Foundry therefore runs `Scent the Weak` at depth 1 (L2, not L3) and shortens `Pack Pressure` → `Drive the Prey` by a level each. This is the *third* case iron rule 7 names as non-fatal-but-ungated, and it is still on `main`.

### 6.4 leyline/Blue's Calculation specialty has no entry of its own

Blue's three roots are `Forewarned` (Foresight), `Calculated Patience` (Foresight) and `Phantom Double` (Illusion). **All eight Calculation talents hang off Foresight nodes** — `Pattern Recognition` and `Reactive Analysis` from `Calculated Patience`, `Anticipate` from `Collected`. A player who wants Blue's *stated* identity — the guide calls probability control Blue's core and plot-die manipulation "Blue's capstone identity" — cannot enter it directly; they must buy two Foresight talents first, and then find that 5 of Calculation's 8 (`Composed`, `Counterspell`, `Anticipate`, `Baleful`, plus `Collected` on the path in) are **level 6**. `Counterspell`, the tree's #2 talent by its reviewer's ranking, costs 3 picks *and* Blue 3+ — level 6, minimum.

Every other leyline tree gives each specialty its own root. Blue is the exception, and it is the exception in the specialty the design guide says defines it.

### 6.5 leyline/White `Pillar of Order` is a stranded root

`Pillar of Order` is at depth 0 — an entry — with prerequisite `White 3+`, i.e. **level 6**. It has one child, `Interposing Shield`, which is also reachable from `Guardian Stance` (a real L1 entry). Its sole-gateway count is **0**: it gates nothing that is not otherwise reachable. So White ships four entries of which one cannot be taken until level 6 and, when taken, unlocks nothing new. It is an entry in the layout and a leaf in practice.

### 6.6 heroic/Leader's Officer line is a six-node ladder with no choice in it

`Focused Mind → Well Supplied → Relentless March → Confident Command → Authority → Synchronized Assault`. Five consecutive out-degree-1 nodes — the longest run in the corpus (next is `leyline/Black`'s `Sapping Hex → Spoils of Isolation → Predatory Patience → Dread Presence → Sovereign of Solitude`, four). It ends in the tree's capstone, which the reviewer calls "a break-even trade dressed as a capstone", and it passes through `Authority`, whose prerequisite is **"Title granting you command of 5+ people"** — a GM grant, not a talent. Five levels of forced picks to reach a capstone rated 2, through a gate the player cannot buy.

Other pure ladders worth naming, all four long and all ending in an L6 node: White `Devoted Conduit → Hardy → Shield Wall → Unbreakable Line`; Blue `Redirect Momentum → Phantom Step → Ghostly Walls → Absolute Stillness`; Red `Flashpoint → Mighty → Afterburn → Chain Detonation`; Green `Resurgent Growth → Natural Recovery → Reknit Form → Vital Surge`; Envoy `Sound Advice → Lessons in Patience → Instill Confidence → Foresight`; Warrior `Stonestance → Mighty → Bloodstance → Meteoric Leap`.

### 6.7 Nine talents are gated on GM grants the player cannot buy — and one of them gates a whole specialty

Prerequisites that are neither a talent nor a skill rank, all in the heroic atlas:

| Talent | Gate | What it locks |
|---|---|---|
| heroic/Warrior **Shard Training** (d0 entry) | "Access to a Shardblade and Shardplate" | 5 descendants, 3 of them solely — the whole Shardbearer line (`Windstance`, `Shattering Blow`, `Precise Parry`, and `Bloodstance`/`Meteoric Leap` via the OR) |
| heroic/Hunter **Animal Bond** (d0 entry, the reviewer's #2 talent) | "Animal companion" | `Protective Bond`, `Feral Connection`, `Pack Hunting` — 4 of 25 talents |
| heroic/Leader **Rumormonger** (d1) | "A patron" | `Well Dressed`, `Baleful`, `Shrewd Command`, `Set at Odds`, `Grand Deception` — 5 talents, most of Politico |
| heroic/Leader **Authority** (d3) | "Title granting you command of 5+ people" | the capstone `Synchronized Assault` |
| heroic/Envoy **Instill Confidence** (d2) | "a companion" | `Foresight` (the only unconditional extra Reaction in the game) |
| heroic/Agent **High Society Contacts**, **Underworld Contacts**; heroic/Envoy **High Society Contacts** | "Patron", "follower in criminal underworld" | themselves |

An entry talent that requires a reward is not a choice at level 1; it is a request to the GM. The leyline and deity atlases contain zero of these.

### 6.8 Entries that dominate their own trees

Three trees are defined by a depth-0 talent that nothing deeper matches:

- **leyline/Black**: `Withering Ray` (d0, 1 Action, 1 Investiture, 2[Tier][Die] vital — the largest per-Action damage expression in the leyline atlas at any depth) and `Hollow Command` (d0, the only whole-turn action denial in the game). Black's d0 band is the only band in the corpus rated **5**. Nothing at depth 3+ competes; the reviewer's deep-band exemplars are an economy engine, not a bigger hammer.
- **deity/Knowledge**: `Predatory Strike` (d0, 1 Action, 1 Investiture) strictly dominates `Killing Blow` (d1, 1 Action, **2** Investiture, **Red 3+/L6**, identical formula) and out-damages the 3-Action capstone `The Final Study` — "three consecutive Predatory Strikes would deal roughly triple the dice for the same total Investiture, keep the stack, and add three weapons' worth of damage on top."
- **deity/Destruction**: `Set Charge` (d0, Free-Action detonation) versus `The Unmooring` (d3, 3A/3Inv/once per scene) — "roughly what three Free-Action Set Charge detonations across an ordinary turn produce for 3 Investiture and no once-per-scene limit."

`Killing Blow` deserves separate mention as the corpus's clearest strictly-dominated talent: same tree, same formula, same action, deeper, one more Investiture, and four levels later.

### 6.9 Talents nothing connects to

Leaf counts run 7–12 in leyline/heroic and exactly **1** in every deity tree. High-leaf trees (`heroic/Agent` 12, `heroic/Scholar` 12, `heroic/Warrior` 11, `leyline/Blue` 9) end in a wide fringe of terminal picks, which is fine. What is not fine is a *root* that is also a leaf — a talent with no parent and no child, which the layout presents as part of a tree but which is a standalone purchase: `heroic/Envoy` **Rousing Presence** (the Key) and **Collected**; `heroic/Leader` **Decisive Command** (the Key) and **Tactical Ploy**; `heroic/Warrior` **Vigilant Stance** (the Key); `heroic/Agent` **Opportunist** (the Key); `heroic/Scholar` **Erudition** (the Key); all five leyline Attunement Keys. The Keys are free with the path, so their zero degree is correct. **`heroic/Envoy Collected` and `heroic/Leader Tactical Ploy` are the two genuine isolates** — real picks, in a tree, connected to nothing.

A related point about Keys that is easy to miss: leyline Keys are always-on passive riders on Draw Mana; **heroic Keys are active talents** — `Decisive Command` costs 1 focus and an Action, `Rousing Presence` an Action, `Vigilant Stance` an Action. If Keys are free with the path (as they are for leyline, per the primer), then heroic paths are handed a free *active* talent while leyline paths are handed a free trigger. `heroic/Warrior`'s `Vigilant Stance` is also the stance system's hub — "you can enter other stances as a Free Action" — so Warrior's signature subsystem is switched on by a talent that costs nothing and appears in the graph as an isolated root.

### 6.10 The 3-Action problem is a depth-band problem

The leyline guide says leyline should be **0% three-Action**, and it is: zero across all 125 leyline talents. The deity guide permits 3 Actions **for the capstone slot only, one per tree** — and all ten deity trees have exactly one, correctly placed. But heroic has four, and their placement is what makes them pathological: `heroic/Agent Close the Case` (d3), `heroic/Leader Grand Deception` (d3) and `Synchronized Assault` (d4) sit in the deep band of the two heroic trees whose deep band is rated **2**, and `heroic/Hunter Tagging Shot` is a **3-Action depth-0 entry** and its reviewer's worst talent ("3 Actions — a whole Slow turn — to do what the Key already does").

---

## 7. What the shape is telling you, against the designer's four questions

**On Q2 (do heroic and leyline feel similar in power at similar points along the tree?).** At similar *depths*, roughly yes — the band ratings cluster at 3–4 for both. At similar *levels*, no, and the divergence is at level 6, in leyline's favour by about 2.5× on every damage number and by a full extra tier of range and area. Before level 6 the picture inverts: heroic has 7 entries against leyline's 3, no Investiture economy to sustain (heroic runs on focus and free Passives), and its best talents — `Practical Demonstration`, `Stonestance`, `Mighty`, `Decisive Command`, `Deadly Trap` — are all free, permanent and level 1–2. **The two atlases are not out of parity on average; they are out of phase.**

**On Q3 (do deity paths feel similar to each other?).** Structurally they are identical to the node — same 2/4/2/1 lattice, same 4-picks-to-capstone, same 3A/3Inv/once-per-scene capstone, same L4 completion of the critical path, same L9 completion of the tree. Whatever differences a player feels between two deity paths are entirely differences of *content*, never of shape or pacing. And the shape has one systematic flaw shared by all ten: the capstone is priced for tier 2 and delivered at level 4, which is why nine of ten reviewers independently flagged it.

**The three changes with the best structure-to-effort ratio:**

1. **Populate `heroic/Hunter`'s 18 missing `connections`** and fix `leyline/Red Flashpoint`, the `leyline/Green` swap, `leyline/White Unity of Purpose`, and the two `deity/Death` drifts. Six data faults, all mechanical, all currently changing what players can take. Add a gate: `prerequisites` naming an in-tree talent that is absent from `connections` should fail the build — that one rule catches Hunter, Flashpoint and both Green edges.
2. **Stop putting the whole deep band behind rank 3.** Revision principle 5 asked for pacing on deep nodes; taken literally it produced a level-6 avalanche and two dead levels. Moving roughly half of each tree's rank-3 gates down to rank 2 would give levels 4 and 5 something to open, and would specifically un-strand `Devastating Blow` (2 picks, level 6), `Overcharge` (2 picks, level 6), `Pillar of Order` (an entry at level 6), and the eight deity tier-2 talents that cost 2 picks and wait until 6.
3. **Re-price the deity capstone, or move it.** 3 Actions is unplayable on a Fast turn and 3 Investiture is three-quarters of the pool at the level it unlocks. Either drop it to 2 Actions / 2 Investiture, or gate it at rank 3 so it arrives at level 6 with Tier 2 behind it — which is what every one of its formulas is written for.

## Adversarial verification

**32 load-bearing claims checked: 11 confirmed, 16 corrected, 5 refuted.**

The analysis's method (recompute depth from `connections`, not prose) is right and its graph findings are almost all reproducible exactly — the 29-talent depth disagreement, Hunter's 25 empty `connections` arrays with 18 missing prose edges, Red's orphaned Flashpoint, Green's transposed Instinct parents, Blue's rootless Calculation specialty, White's stranded Pillar of Order, the two true isolates, the 3-Action census, the depth/leaf histograms and the "L5 opens nothing in 18 of 21 trees" table all check out against the raw rows. What fails is the arithmetic layered on top and one damage comparison. Its headline count is wrong by its own table (16 of 21 trees, not 15; 5 trees pay for the climb, not 6). Its §5 worked comparison rests on two textual errors: Withering Ray costs HEALTH ("Lose HP = half [Die]"), not 1 Investiture, and Devastating Blow is a rider on a weapon attack that also carries Mighty's +1+tier PER ACTION — so the claimed "roughly 4× per Action in favour of leyline" is ~2.4× before weapon dice. Its Chaos example is exactly backwards. Its §3.3 "67 weak talents" list mixes prose and enforced depth against its own declared method and includes three talents that are their own reviewer's TOP-THREE picks. And it missed the single largest structural defect in the corpus: 96 talents (26%, 89 of them leyline) carry a `connections`-enforced talent prerequisite that the printed card text never names — four times larger than the divergence class it did report, and its proposed build gate would not catch one of them. On the load-bearing conclusion, the opposite case is better for two of three atlases: outside the ten prescribed deity capstones, 79% of depth-3+ talents cost ZERO Actions, and the three "entries dominate" cases are precisely trees where a deep free Passive (Accumulate, Tempered Edge, Blood Price) is what makes the entry good. The climb-doesn't-pay finding should be restated as a DEITY-CAPSTONE finding, not a corpus finding.

### Claims

1. **CONFIRMED** — §0.1 — Enforced depth (from `connections`) disagrees with the dossier's prose `depth` on 29 talents across 6 trees (Hunter, Red, Green, White, Warrior, Envoy).
   - Evidence: Fixpoint recompute over `connections` returns exactly 29 diffs: leyline/White 1 (Unity of Purpose 2→1), leyline/Red 4 (Flashpoint 2→0, Mighty 3→1, Afterburn 4→2, Chain Detonation 5→3), leyline/Green 3 (Scent the Weak 2→1, Pack Pressure 3→2, Drive the Prey 4→3), heroic/Envoy 1 (Inspired Zeal 3→2), heroic/Warrior 2 (Bloodstance 2→1, Meteoric Leap 3→2), heroic/Hunter 18. Talent-for-talent match with the analysis's table.
2. **REFUTED** — §0.1 — The third iron-rule-7 case (prose and `connections` naming different parents) 'is still live in five places'.
   - Evidence: That is the smallest of three divergence classes and the analysis found only two of them. Systematic scan of all 365: (A) 96 talents have a non-empty `connections` array — a managed, Foundry-enforced talent prerequisite — whose `prerequisites` card text names NO in-tree talent at all (leyline/White 19, Blue 20, Black 19, Red 13, Green 18 = 89 leyline; plus Leader 3, Scholar 1, Chaos/Order/Life 1 each). Example: leyline/Blue Counterspell, prereq text 'Blue 3+', connections ['Pattern Recognition']. (B) 19 talents name an in-tree parent the connections do not enforce (Hunter 18 + Red Flashpoint). (C) 6 have both but divergent (the 5 places named). Total 121 talents, not 5.
   - Corrected: Prose and `connections` diverge on 121 of 365 talents in three classes. The dominant class is invisible to the analysis's own proposed gate: 96 talents (26% of the corpus, 89 of them leyline) are gated by a talent prerequisite the card never mentions, so a player reading the card cannot tell the talent is chained at all. The recommended gate ('prerequisites naming an in-tree talent absent from connections should fail the build') catches class B and C only — 25 talents — and zero of the 96.
3. **CONFIRMED** — §0.2 — The rank cap of 2 until level 6 applies to every skill, not just the five colours, so heroic rank-3 gates are level-6 gates.
   - Evidence: SYSTEM-PRIMER: 'Tier 1 = levels 1–5, max skill rank 2; Tier 2 = levels 6–10, max skill rank 3', with no skill-class exception. Every heroic tree carries 5–7 rank-3 gates on Deduction/Athletics/Persuasion/Discipline/Perception/Agility/Stealth/Deception/Lore/Medicine/Crafting/Intimidation/Leadership, and every one carries a dossier `earliestLevel` below 6.
4. **CORRECTED** — §0.2 — The dossier `earliestLevel` column 'undercounts the heroic atlas by 30 talents'.
   - Evidence: The analysis's own code block names 36 heroic talents (Agent 7, Envoy 6, Hunter 6, Leader 5, Scholar 6, Warrior 6), plus 6 leyline. My scan agrees with those 42 names exactly once the false positive in 'command of 5+ people' is excluded. 30 is wrong against its own list.
   - Corrected: The `earliestLevel` column undercounts 36 heroic talents and 6 leyline talents — 42 corpus-wide.
5. **CONFIRMED** — §0.2 — Devastating Blow is a level-6 talent, and three of the heroic atlas's five damage formulas are unavailable before level 6.
   - Evidence: Verbatim rows: Devastating Blow prereq 'Combat Training; Athletics 3+'; Wit's End 'Feinting Strike; Intimidation 3+'; Fatal Thrust 'Startling Blow; Perception 3+'. `isDamageFormula` returns exactly 5 heroic rows — those three plus Deadly Trap (2d4, Survival 1+, L1) and Cheap Shot (@scalar.damage.unarmed, L1). Three of five are rank-3 gated.
6. **CORRECTED** — §0.2 — Corrected L6-gate census: leyline White 6, Blue 8, Black 7, Red 7, Green 8.
   - Evidence: Direct rank-3 gate counts are White 5, Blue 8, Black 5, Red 6, Green 8. The analysis's higher numbers are not reproducible from the prerequisite strings and it does not state whether they include chain-inherited L6. The comparative conclusion is unaffected: leyline 20–32%, heroic 20–28%, deity 0–22%.
   - Corrected: Rank-3 gated: White 5, Blue 8, Black 5, Red 6, Green 8; Agent 7, Envoy 6, Hunter 6, Leader 5, Scholar 6, Warrior 6; deity Chaos/Civ/Death/Destr/Fate/Power 0, Order 1, Life/Knowledge/Sovereignty 2. Leyline and heroic are gated at the same rate; deity is barely gated. Conclusion stands.
7. **CONFIRMED** — §1 — Enforced depth histogram and leaf counts per tree.
   - Evidence: Every cell reproduces: White 5/6/4/6/4, Blue 4/6/8/6/1, Black 4/6/5/4/4/2, Red 5/7/5/5/2/1, Green 4/6/7/6/2, Agent 7/6/9/3, Envoy 7/7/6/5, Hunter 25, Leader 7/5/7/5/1, Scholar 7/9/6/3, Warrior 7/9/8/1, deity 2/4/2/1 ×10. Leaves: 7/9/7/8/7/12/9/25/9/12/11 and exactly 1 per deity tree.
8. **CORRECTED** — §1 — The 'roots(non-Key)' column: White 3, Blue 2, Envoy 5, Leader 5, Hunter 0.
   - Evidence: Actual non-Key talents with empty `connections`: White 4 (Guiding Signal, Pillar of Order, Guardian Stance, Terms of Accord), Blue 3 (Forewarned, Calculated Patience, Phantom Double), Envoy 6, Leader 6, Hunter 24. The table contradicts the analysis's own §6.5 ('White ships four entries') and §6.4 (which correctly names three Blue roots), and Hunter's '0' contradicts §6.1 ('25 independent picks'). The 'meanBranch' column is not reproducible from any consistent formula and is internally inconsistent with the roots column it sits beside.
   - Corrected: Non-Key roots: White 4, Blue 3, Black 3, Red 4, Green 3, Agent 6, Envoy 6, Hunter 24, Leader 6, Scholar 6, Warrior 6, deity 2 each.
9. **CONFIRMED** — §1 — Level 5 opens nothing new in 18 of 21 trees; only leyline/White (2), Black (2) and Red (1) put anything at level 5.
   - Evidence: Independent recompute of max(enforced picks, 6 if rank-3 on the cheapest chain) gives an L5 column of White 2, Black 2, Red 1 and zero everywhere else — all 6 heroic trees, all 10 deity trees, Blue and Green.
10. **CORRECTED** — §1 — Levels 4 AND 5 together open nothing at all in four trees: Agent, Envoy, Hunter, Warrior.
   - Evidence: True for Agent, Envoy and Warrior (L4=L5=0, and their entire enforced depth-3 bands are 100% rank-3 gated — Agent: Sleuth's Instincts/Close the Case Deduction 3+, Mercurial Façade Deception 3+; Envoy: all five Discipline/Persuasion/Lore/Leadership 3+; Warrior: Precise Parry Perception 3+). Hunter's L4=0 is an artifact of the empty-`connections` bug the analysis itself diagnoses in §6.1. Honouring Hunter's 18 prose edges gives an opening profile of 7/5/5/2/0/6 — L4 opens 2 (Mighty, Swift Strikes).
   - Corrected: Levels 4 and 5 open nothing in three trees — heroic/Agent, heroic/Envoy, heroic/Warrior — plus one talent at L4 in Scholar (Keen Insight, the only non-rank-3 talent in its depth-3 band). Hunter does not belong on the list once its own data bug is corrected.
11. **CONFIRMED** — §2 — Every leyline/heroic tree is 1 Key + 3 specialties × 8 = 25 (Leader 7/9/8 the only wobble); every deity tree is the same 2→4→2→1 lattice with 10 edges, 3 OR-joins and 1 leaf.
   - Evidence: Specialty counts confirm 1/8/8/8 in all eleven except Leader (Key 1, Champion 7, Officer 9, Politico 8). All ten deity trees produce an identical enforced histogram 2/4/2/1, identical leaf count 1, and identical OR-structure — verified node-by-node on Order, Life, Knowledge and Sovereignty.
12. **CORRECTED** — §2 — The leyline guide's revision principle 8 forbids the uniform template the leyline atlas uses, while the deity guide prescribes the deity one, so deity uniformity is intentional and leyline uniformity is not.
   - Evidence: Principle 8 is verbatim ('Each tree meets its own needs. Do NOT impose a uniform node count or structure across all 15 trees. Let the tree's mechanical logic determine its shape.') — but '15 trees' is 5 leyline + 10 deity, so it binds the deity atlas too. The deity guide then prescribes exactly what principle 8 forbids ('Cleanest shape has 9 talents (2 entries + 4 tier-2 riders + 2 tier-3 synthesis + 1 capstone)'). The brief asked analysts to name where the two intent sources disagree; this is one and the analysis excused it instead.
   - Corrected: Principle 8's scope is all 15 leyline+deity trees. Both atlases violate it and the two design guides directly contradict each other on whether a uniform template is allowed. That contradiction, not the leyline atlas alone, is the finding.
13. **REFUTED** — §3.1 — 'In 15 of 21 trees the deep band is rated no better than the entry band (9 negative, 6 flat). Only 6 trees pay for the climb.'
   - Evidence: Its own table has 9 negative and SEVEN zero rows (Chaos, Destruction, Fate, Power, Envoy, Green, Red), and only FIVE positive (Sovereignty +1, Hunter +1, White +1, Blue +2, Scholar +2). 9+7+5=21. Reading powerByDepth straight out of the 21 profile JSONs reproduces those deltas exactly.
   - Corrected: 16 of 21 trees rate the deep band no better than the entry band (9 negative, 7 flat). Five trees pay. Three of the five (Blue, Scholar, Sovereignty) have entry bands rated 2, so the climb is recovering from a bad start; heroic/Hunter's +1 is an artifact of its broken graph. That leaves exactly ONE tree in the corpus — leyline/White — where a healthy entry band is genuinely improved on by depth (Shield Wall d3/L4, Unbreakable Line d4/L6). That is a sharper and more useful statement than the analysis made.
14. **CORRECTED** — §3.2 — Weak-flag rate rises monotonically with depth: 30% / 36% / 46%.
   - Evidence: Recount over all 21 profiles' weakTalents+bottomThree, deduped, bucketed by prose depth: 26/83, 80/203, 36/79 = 31% / 39% / 46%. Bucketed by enforced depth (the analysis's own preferred measure): 33/102, 75/192, 34/71 = 32% / 39% / 48%. The monotone trend and the ~1.5× ratio survive either way.
   - Corrected: 31% / 39% / 46% (prose) or 32% / 39% / 48% (enforced). Conclusion unchanged and, per the 'missed' list, understated.
15. **CORRECTED** — §3.2 — 'Deep talents cost more actions and more resource than entries in 17 of 21 trees.'
   - Evidence: Recomputed mean Action cost and mean resource cost per enforced band across all 21 trees: BOTH rise in 13 trees, of which 10 are the deity trees by prescription (3 Actions / 3 Investiture capstone, Death 4 Inv). Outside deity the mechanism holds in only Green, Agent, Leader and Scholar. In leyline/Red (0.60→0.00), heroic/Envoy (0.57→0.00) and heroic/Warrior (0.71→0.00) the deep band costs FEWER actions than the entry band, and leyline/White is flat (0.20→0.20).
   - Corrected: Actions AND resource both rise with depth in 13 of 21 trees, ten of which are the deity trees where the deity guide mandates it. In leyline and heroic the 'deep costs more' mechanism holds in four trees and inverts in three.
16. **CORRECTED** — §3.2 — Nine of ten deity capstones are flagged weak by their own tree's reviewer; only Power's Mantle of the Aspirant survives.
   - Evidence: Literally true — Unravel Everything, Final Decree, Magnum Opus, Raise Dead, The Unmooring, Thread of Inevitability, Apex Form, The Final Study and Sovereignty all appear in weakTalents; Mantle does not. But two of the nine appear in the SAME reviewer's topThree: Destruction's entry reads verbatim 'The Unmooring (partial — capstone undersold, not a never-pick)' and it is the reviewer's #3 pick; Sovereignty's capstone is the Sovereignty reviewer's #3 pick.
   - Corrected: Seven of ten deity capstones are unambiguously condemned by their own reviewer; two more (The Unmooring, Sovereignty) are flagged with an explicit qualifier and simultaneously ranked in that tree's top three; one (Mantle of the Aspirant) is praised.
17. **CONFIRMED** — §3.2 — Every deity capstone is 3 Actions and therefore unplayable on a Fast turn, and 3 Investiture is ~three-quarters of a starting pool at level 4.
   - Evidence: Action census returns exactly ten 3-Action deity talents, all at depth 3, all once-per-scene: Unravel Everything, Final Decree, Magnum Opus, Raise Dead (4 Inv), The Unmooring, Thread of Inevitability, Mantle of the Aspirant, Apex Form, The Final Study, Sovereignty. SYSTEM-PRIMER: 'Fast turns' have 2 Actions; Investiture pool is '2 + max(AWA, PRE)' ≈ 4.
18. **CORRECTED** — §3.3 — '67 talents, 39% of the 173 talents at depth 2+' are judged weaker than a depth-0 talent in the same tree.
   - Evidence: The section says 'talents at enforced depth ≥ 2' but the denominator 173 is PROSE depth. Enforced depth ≥2 across the corpus is 156 (leyline 72, heroic 54, deity 30) — the analysis uses 76/67/30. Its heroic list also includes four Hunter talents that have no enforced depth ≥2 at all, contradicting the method it declared two sections earlier. And at least three named talents are their own reviewer's topThree picks: deity/Order Verdict ('the structural keystone'), deity/Destruction The Unmooring, deity/Sovereignty Sovereignty.
   - Corrected: Excluding the four Hunter entries and the three top-three talents, 60 of 156 enforced-depth-2+ talents (38%) are flagged weak. The headline percentage survives by coincidence; the derivation does not.
19. **REFUTED** — §3.3 — 'Chaos: Isolating Ruin at d2 deals double the capstone's damage for two-thirds the actions.'
   - Evidence: Backwards. Unravel Everything: 'Place an Omen on every enemy in Attunement Range up to your cap … each removed Omen deals [Tier][Die] + Awareness spirit damage and Disorients its bearer … Enemies that are Isolated when their Omen is removed instead take 2[Tier][Die] vital damage.' At Tier 2 the Omen cap is 2, so against two Isolated bearers that is 2 × 2[Tier][Die] = 4 [Tier][Die] = 8d8 — which is exactly the '8d8' the Chaos profile's own damagePeak field states. Isolating Ruin is single-target: '[Tier][Die] + Awareness vital … If the target bears an Omen, remove it and deal an additional [Tier][Die] + Awareness vital', i.e. 2[Tier][Die] + 2×AWA = 4d8 + 2 AWA.
   - Corrected: Chaos's capstone deals roughly DOUBLE Isolating Ruin's damage at Tier 2, plus Disoriented, plus AoE. The reviewer's actual complaint about it is placement and cost (3 Actions / 3 Investiture / once per scene, arriving at L4 with Tier-1 dice), not that a depth-2 talent out-damages it.
20. **CORRECTED** — §5 — Every leyline/deity damage formula multiplies ×1.85–4.00 at level 6; every heroic formula multiplies ×1.00 because Devastating Blow and Wit's End step at tier 3.
   - Evidence: Formula families confirmed and exhaustive over the 43 damage rows. Verbatim: Devastating Blow `(2 + max(@tier - 2, 0))d8` and Wit's End `(4 + max((@tier - 2) * 2, 0))d6` — both flat from tier 1 to tier 2, stepping only at tier 3 (level 11). One row is miscalculated: `floor((@tier)d(2*rank+2)/2)` (Volatile Strike, Shockwave Slam) is E[floor(1d6/2)] = 1.5 → E[floor(2d8/2)] = 4.25, a ×2.83 step. The analysis took floor of the mean (1.0 → 4.0) instead of the mean of the floor.
   - Corrected: Leyline/deity formulas multiply ×1.85–2.83 at level 6 (not ×4.00); heroic formulas multiply ×1.00. The conclusion — heroic gains nothing numeric at the exact level leyline roughly 2.5×es — is unaffected.
21. **REFUTED** — §5/§6.8 — 'Withering Ray, 1 Action, 1 Investiture, 2[Tier][Die] vital.'
   - Evidence: Withering Ray's cost field is 'Lose HP = half [Die]' and its text reads 'Lose half [Die] health, then make a ranged Black attack vs. Spiritual … On a hit, deal 2[Tier][Die] vital damage.' It spends no Investiture at all. The Black profile the analysis cites says so in its own topThree entry: 'costing a mean 1.5 health rather than Investiture, so it repeats every Action indefinitely'.
   - Corrected: Withering Ray is 1 Action costing ~1.5 health (half d6) at Tier 1 and ~2.25 (half d8) at Tier 2, and no Investiture. This makes the analysis's point STRONGER, not weaker — the talent is not throttled by Draw Mana at all — but the stated cost is wrong in both places it appears.
22. **REFUTED** — §5 — 'The gap at level 6 is roughly 4×, per Action, in favour of leyline' (Withering Ray 18/Action vs Devastating Blow 4.5/Action).
   - Evidence: Devastating Blow is a rider, not a standalone: 'Make a melee weapon atack vs. Physical, rolling an EXTRA 2d8 damage.' The Warrior also holds Mighty (Passive, no cost, depth 1, L2): 'When you hit with a weapon or unarmed attack, FOR EACH ACTION SPENT, deal extra damage equal to 1 + your tier' — +6 on a 2-Action attack at Tier 2. The Warrior's L6 two-Action line is therefore weapon dice + 2d8 + 6 ≈ weapon + 15, i.e. ≥7.5/Action, against Withering Ray's 18/Action.
   - Corrected: The per-Action gap at level 6 is ≤2.4× before weapon dice, and lower after them. SCOPE FLAG: the residual depends on weapon damage and on `@scalar.damage.unarmed`, neither of which is defined anywhere in the 365 talents — the comparison cannot be closed inside the fence. What WOULD settle it is a weapon-damage table, which is out of scope. The directional finding (leyline steps at L6, heroic does not) survives; the multiplier does not.
23. **CONFIRMED** — §6.1 — heroic/Hunter's 25 `connections` arrays are all empty, hiding 18 prose edges; Hunter is 25 independent picks gated only by skill rank.
   - Evidence: All 25 Hunter rows have `connections: []`. Exactly 18 carry a `prerequisites` string naming an in-tree talent (Sharp Eye←Tagging Shot, Hardy←Steady Aim, Unrelenting Salvo←Hardy, Mighty←Cold Eyes, Fatal Thrust←Startling Blow, and 13 more). Enforced depth is 0 for all 25.
24. **CONFIRMED** — §6.2/§6.3/§6.4/§6.5 — Red's Flashpoint is an orphan root shifting Mighty/Afterburn/Chain Detonation forward; Green's Scent the Weak and Coordinated Hunt have transposed parents; Blue's Calculation specialty has no root of its own; White's Pillar of Order is an entry gated at White 3+ that gates nothing.
   - Evidence: Flashpoint: prereq 'Flame Surge or Arc Flash; Red 1+', connections []; Mighty connections ['Flashpoint'] → enforced depth 1, L2. Green: Scent the Weak prereq 'Predator's Instinct' / connections ['Pack Hunter']; Coordinated Hunt prereq 'Pack Hunter' / connections ['Predator's Instinct'] — exactly transposed. Blue's three non-Key roots are Forewarned (Foresight), Calculated Patience (Foresight), Phantom Double (Illusion); all 8 Calculation talents hang off Foresight nodes. Pillar of Order: prereq 'White 3+', connections [], sole child Interposing Shield whose connections are ['Pillar of Order','Guardian Stance'] and whose prereq is 'White 1+' — so it gates nothing not otherwise reachable at level 1.
25. **CORRECTED** — §6.6 — heroic/Leader's Officer line is a six-node ladder with no choice in it: five consecutive out-degree-1 nodes, the longest run in the corpus.
   - Evidence: Out-degrees confirm the run: Focused Mind 1 → Well Supplied 1 → Relentless March 1 → Confident Command 1 → Authority 1 → Synchronized Assault (leaf). Longest in the corpus (Black's Sapping Hex→Spoils of Isolation→Predatory Patience→Dread Presence is four). But Confident Command's connections are ['Relentless March','Customary Garb'] — an OR — so there are two distinct 4-pick routes into the ladder's back half, via Focused Mind→Well Supplied→Relentless March or via Through the Fray→Customary Garb.
   - Corrected: Five consecutive out-degree-1 nodes ending in the capstone, with exactly one branch point (Confident Command's two parents). 'No choice in it' overstates by one decision.
26. **CORRECTED** — §6.7 — 'Nine talents are gated on GM grants the player cannot buy', all in the heroic atlas; leyline and deity contain zero.
   - Evidence: A prerequisite-segment scan that excludes rank gates and in-tree talent names returns exactly 8: Warrior Shard Training ('Access to a Shardblade and Shardplate'), Hunter Animal Bond ('Animal companion'), Leader Rumormonger ('A patron'), Leader Authority ('Title granting you command of 5+ people'), Envoy Instill Confidence ('a companion'), Envoy High Society Contacts, Agent High Society Contacts ('Patron in high society'), Agent Underworld Contacts ('Patron or follower in criminal underworld'). The analysis's own table lists these same 8. Zero in leyline and deity — confirmed.
   - Corrected: Eight talents, not nine. Everything else in §6.7 stands, including that two of them (Shard Training, Animal Bond) are depth-0 ENTRIES.
27. **CORRECTED** — §6.8 — deity/Knowledge Killing Blow is 'the corpus's clearest strictly-dominated talent': same tree, same formula, same action, deeper, one more Investiture, four levels later.
   - Evidence: Both carry `(@tier)d(2 * @skills.red.rank + 2)`; Predatory Strike is 1 Action / 1 Investiture / depth 0 / L1, Killing Blow is 1 Action / 2 Investiture / depth 1 / Red 3+ / L6. But the texts differ: Predatory Strike is a weapon attack that deals nothing on a miss and ADDS an Insight; Killing Blow tests Red vs Physical and 'On failure, deal [Tier][Die] Vital damage and remove 1 Insight' — a guaranteed floor Predatory Strike has no equivalent of.
   - Corrected: Killing Blow is dominated in the common case (it costs double, arrives four levels later, spends the whole stack, and adds no weapon damage) but is not STRICTLY dominated: it deals damage on a failed test where Predatory Strike deals none on a miss.
28. **CORRECTED** — §6.9 — heroic/Envoy Collected and heroic/Leader Tactical Ploy are the only genuine isolates (non-Key talents with no parent and no child); and 'heroic Keys are active talents' while leyline Keys are free triggers.
   - Evidence: Isolate scan over all 21 trees returns exactly those two (excluding Hunter, where every talent is an isolate) — CONFIRMED. But the Key claim is half right: Rousing Presence (Action), Decisive Command (Action, 1 Focus) and Vigilant Stance (Action) are active; Opportunist, Seek Quarry and Erudition are all Special, which SYSTEM-PRIMER prices as riding on an action you were already taking and costing nothing extra.
   - Corrected: Three of six heroic Keys cost an Action; three are Specials and are effectively free, like the leyline riders. The 'heroic gets a free active talent, leyline gets a trigger' asymmetry applies to Envoy, Leader and Warrior only.
29. **CONFIRMED** — §6.10 — leyline is 0% three-Action; deity has exactly one per tree, correctly placed at the capstone; heroic has four, three of them in deep bands rated 2 and one (Tagging Shot) a 3-Action depth-0 entry.
   - Evidence: Action census: zero 3-Action rows across all 125 leyline talents; ten deity rows, all at depth 3; four heroic rows — Agent Close the Case (d3, 3 Focus), Leader Grand Deception (d3, 3 Focus), Leader Synchronized Assault (d4, 2 Focus), Hunter Tagging Shot (d0, no cost). Matches the deity guide verbatim ('3 Actions | Capstones only — one per tree, max') and its pitfall '3-Action talents below the capstone. If a talent below the capstone needs 3 Actions, it's doing too much.'
30. **CONFIRMED** — §4 — Pick costs, and 'the worst case in the game is 6 (Black Sovereign of Solitude, Double Dip; Red Unstoppable)'.
   - Evidence: Enforced depth 5 exists on exactly three talents corpus-wide: leyline/Black Sovereign of Solitude, leyline/Black Double Dip, leyline/Red Unstoppable. Pick cost = enforced depth + 1 = 6.
31. **CORRECTED** — §4 — 'The heroic atlas is uniquely split-friendly: not one heroic talent costs more than 5 picks.'
   - Evidence: Heroic max picks: Agent 4, Envoy 4, Hunter 1, Leader 5, Scholar 4, Warrior 4 — the 5-pick ceiling holds. But every deity tree also caps at 4 picks (max enforced depth 3), which the analysis's own table on the next line states. Deity is at least as split-friendly.
   - Corrected: Heroic (≤5 picks) and deity (≤4 picks) are both split-friendly; only leyline demands 5–6 picks for its deepest nodes. 'Uniquely' is wrong.
32. **CORRECTED** — §5 — 'Leyline dumps 24–32% of its tree at L6.'
   - Evidence: The analysis's level model caps at 6, so a child of an L6 parent is also counted at L6 — but that child needs a further pick. Recomputing with max(picks, rank-3 floor) propagated through parents: leyline opens 4/25 (White), 5/25 (Blue), 4/25 (Black), 4/25 (Red), 5/25 (Green) at exactly L6 — 16–20% — with the remainder at L7 and, in Black and Red, L8. The analysis's own profile digests already record this (Black: 'Whispered Doubt/Composed truly L7, Puppeteer truly L8').
   - Corrected: Leyline opens 16–20% of the tree at exactly level 6 and the rest of the gated band across L7–L8. The avalanche is real; it is one to two levels wider and correspondingly shallower than stated.

### What the analysis missed

- THE BIG ONE — 96 silent connections. 96 of 365 talents (26%; 89 of them leyline) carry a `connections`-enforced talent prerequisite that the card's `prerequisites` text never names (e.g. leyline/Blue Counterspell reads 'Blue 3+' and is gated on Pattern Recognition; leyline/White Unbreakable Line reads 'White 3+' and is gated on Shield Wall). This is four times larger than every divergence class the analysis reported combined, it is the reason the leyline atlas 'looks' shallow on card text and plays deep, and the build gate the analysis proposes in recommendation 1 catches ZERO of them. The gate should be bidirectional: (a) an in-tree talent named in `prerequisites` must appear in `connections`; (b) every entry in `connections` must be named in `prerequisites`.
- THE ANALYSIS UNDERSOLD ITS OWN BEST EVIDENCE. It used weakTalents/bottomThree, which is quota-forced (every reviewer had to name three). The unforced mirror is topThree, and it is a cleaner and steeper gradient in the same direction: 23/83 = 28% of depth-0 talents are their tree's top-three picks, 31/203 = 15% at depth 1-2, 9/79 = 11% at depth 3+. The top-to-weak ratio collapses 0.90 → 0.38 → 0.24 with depth. That is a much stronger statement than '1.5× more likely to be judged weak'.
- IT NEVER RAN THE OBVIOUS COUNTER-TEST — whether deep talents MULTIPLY the entry rather than replace it. 48 of 61 enforced-depth-3+ talents outside the ten prescribed deity capstones (79%) cost zero Actions, against 55% of entries. Its three flagship 'entry dominates' cases are all trees where a deep free Passive is what makes the entry good: deity/Knowledge Accumulate (d1, Passive, no cost) places an Insight every turn and Predatory Strike deals '[Tier][Die] Vital damage per Insight'; deity/Civilization Tempered Edge (d1, Passive, no cost) adds [Tier][Die] energy to every Construct attack and makes it ignore Deflect, and Arsenal (d2) doubles the attacks; leyline/Black Blood Price (d1, Passive, no cost) hands Withering Ray advantage on essentially every cast.
- IT USED heroic/Hunter AS EVIDENCE IN §1 AFTER DECLARING IT INVALID IN §6.1. §6.1 says the Hunter bug 'invalidates the Hunter row of every depth-based comparison in this review', yet Hunter supplies one of the four trees in §1's 'levels 4 and 5 open nothing' headline, four of the 67 talents in §3.3, and the '+1 pays for the climb' row in §3.1 (which §6.1 itself attributes to the bug).
- IT MISREAD THREE SOURCE ENTRIES AS CONDEMNATIONS. deity/Order Verdict is that reviewer's #2 topThree pick ('the structural keystone'); deity/Destruction The Unmooring is a topThree pick whose weakTalents entry reads verbatim 'partial — capstone undersold, not a never-pick'; deity/Sovereignty Sovereignty is that reviewer's #3 pick. All three are listed in §3.3 as talents 'judged weaker than a depth-0 talent in the same tree'.
- IT CITED THE DEITY GUIDE AGAINST THE DEITY CAPSTONES WHEN THE GUIDE'S OWN EXAMPLES ACQUIT THEM. The pitfall quoted ('Capstones that don't pay off the tree's investment') continues verbatim: 'a capstone for a charge-placing tree should detonate the charges; a capstone for an insight-stacking tree should consume the stacks for a massive payload; a capstone for a snare-laying tree should trigger every snare on a predicted event.' Destruction's The Unmooring detonates all Charges, Knowledge's The Final Study consumes all Insight, Fate's Thread of Inevitability fires on a predicted event. Three of the ten capstones are the guide's literal worked examples of doing it RIGHT. The real defect is pricing and timing (3A/3Inv/once-per-scene at level 4 with Tier-1 dice), which is what the analysis's recommendation 3 correctly targets — the quote does not support the argument it is attached to.
- IT NEVER ASKED WHERE A DEITY CHARACTER'S SPARE PICKS GO. Its own §4 establishes that a deity tree completes at level 9 and that every deity entry demands two leyline colours at rank 2+. So every deity character is also a two-colour leyline character with 1-2 spare picks, and those picks land in leyline trees at 1-4 picks each — exactly the band the analysis says is the best-value band. That is a structural synergy answer to the designer's question 4, sitting in its own data, unstated.
- AN OUT-OF-SCOPE NUMBER PASSED AS A CHECKED ONE. §5's heroic table gives Cheap Shot's `@scalar.damage.unarmed` as '2.0 → 2.0 ×1.00'. That scalar is defined nowhere in the 365 talents; whether unarmed damage is flat across tiers is a system-native question the scope fence excludes. It should have been flagged, not evaluated.

### Surviving findings, in priority order

1. heroic/Hunter's 25 `connections` arrays are empty and 18 prose edges are unenforced — CONFIRMED, and it is the single largest structural defect the analysis found. In Foundry, Hunter is 25 independent picks: Unrelenting Salvo (the corpus's only lift of the once-per-turn same-weapon Strike restriction, prose depth 3) is a one-pick level-6 talent; Mighty and Swift Strikes are one-pick level-1 talents; Fatal Thrust (4d4) needs no Startling Blow.
2. 96 talents (26% of the corpus, 89 of them leyline) are gated by a `connections` prerequisite the card text never names — a defect four times larger than everything the analysis reported and one its proposed gate would not catch. Add a bidirectional gate: every in-tree talent named in `prerequisites` must appear in `connections`, AND every `connections` entry must be named in `prerequisites`. That one rule catches Hunter (18), Flashpoint, the Green swap, the two Death drifts, Leader's Confident Command, and all 96 silent edges.
3. The rank cap of 2 until level 6 applies to EVERY skill, so heroic rank-3 gates are level-6 gates and the dossier `earliestLevel` column understates 42 talents (36 heroic, 6 leyline). Devastating Blow ('Combat Training; Athletics 3+'), Wit's End (Intimidation 3+) and Fatal Thrust (Perception 3+) — three of the heroic atlas's five damage formulas — do not exist before level 6. Fix the derivation, not the design, before any further comparison is drawn from that column.
4. Level 5 opens nothing new in 18 of 21 trees, and levels 4 AND 5 together open nothing in heroic/Agent, heroic/Envoy and heroic/Warrior (Hunter drops off that list once its data bug is fixed) — because those trees' entire depth-3 bands are 100% rank-3 gated. Two structurally dead levels in the middle of the band the campaign is actually being played in.
5. The climb-doesn't-pay finding is a DEITY finding, not a corpus finding. All ten deity capstones are 3 Actions / 3 Investiture (Death 4) / once per scene, at depth 3, reachable at level 4 with Tier-1 dice, and unplayable on a Fast turn (2 Actions). Seven of ten are unambiguously condemned by their own reviewer. Outside those ten, 79% of depth-3+ talents cost zero Actions and function as free multipliers on the entry — so for leyline and heroic the correct statement is that depth buys riders, not replacements, and the reviewers' entry-bias partly measures 'which talent is the tree's engine'.
6. Corrected headline: 16 of 21 trees (not 15) rate the deep band no better than the entry band — 9 negative, 7 flat — and 5 trees (not 6) pay. Three of the five pay only because their entries are rated 2, and heroic/Hunter's is a bug artifact. leyline/White is the ONLY tree in the corpus where a healthy entry band is genuinely improved on by depth (Shield Wall d3, Unbreakable Line d4).
7. Every leyline and deity damage formula multiplies ×1.85–2.83 at level 6; every heroic formula multiplies ×1.00, because the two heroic formulas carrying a tier term step at tier 3 (level 11), outside the whole 1–10 band. `(2 + max(@tier - 2, 0))d8` and `(4 + max((@tier - 2) * 2, 0))d6` look like a tier-2/tier-3 off-by-one and are the cheapest single fix on the board. The per-Action power gap at level 6 is ≤2.4×, not 4× — Devastating Blow is a rider on a weapon attack and Mighty adds 1+tier PER ACTION on top.
8. Blue's Calculation specialty has no root of its own — all eight talents hang off Foresight nodes, and 5 of the 8 are level 6, including Counterspell (3 picks AND Blue 3+). The leyline guide calls probability control Blue's core and plot-die manipulation 'Blue's capstone identity'; a player cannot enter that specialty directly at all. Every other leyline tree gives each specialty its own root.
9. White's Pillar of Order is an entry gated at White 3+ (level 6) whose only child, Interposing Shield, is reachable from Guardian Stance at level 1 — an entry in the layout, a leaf in practice. heroic/Envoy Collected and heroic/Leader Tactical Ploy are the corpus's only two genuine isolates: real picks, drawn inside a tree, connected to nothing.
10. Eight talents are gated on GM grants no player can buy, all in the heroic atlas (leyline and deity have zero). Two are depth-0 ENTRIES — Warrior's Shard Training (5 descendants) and Hunter's Animal Bond (4 talents, and its reviewer's #2 pick) — and Leader's Rumormonger gates most of the Politico specialty while Authority gates the capstone.
