# Leyline vs heroic power parity at comparable points

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `leyline-vs-heroic`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

I have everything I need. Writing the analysis.

---

# LEYLINE ↔ HEROIC POWER PARITY — the answer to question 2

**Headline: the structural asymmetry the brief asks me to reason from does not exist in the data.** The premise — "heroic paths carry no colour rank gate, so their whole 25-talent tree is reachable by ~L4–L5, while leyline trees lock their deepest talents behind rank 3+, i.e. L6+" — is an artifact of the depth model, not a fact about the talents. The rank cap of 2 applies to **every skill**, not just leyline colours. Once that is applied consistently, **every heroic tree has 5–7 talents locked to level 6 or later, against leyline's 4–8.** Heroic trees are gated *slightly harder* in the L4–L5 band than leyline trees, not softer.

The real parity failure is elsewhere, is one-sided, and is caused by about six specific talents. Details below, all checkable.

---

## 1. The measurement correction that changes the answer

`SYSTEM-PRIMER.md` §Scaling: *"Tier 1 = levels 1–5, max skill rank **2**; Tier 2 = levels 6–10, max skill rank **3**."* That is a global cap on skill ranks. The dossier header, however, defines earliest-L as *"a **Colour 3+** prerequisite is unreachable before level 6"* — it applies the rule only to the five colour skills. Every non-colour `X 3+` prerequisite in the corpus is therefore reported 2–4 levels too early.

I recomputed earliest-legal-level for all 365 talents applying the rank-3 rule to **all** skills (attributes excluded — those advance on their own 3/6/9 track), and propagating through prerequisite and connection chains (connections treated as OR-groups, prose prerequisite clauses ANDed):

```
TREE               n   rows-that-move   trueL>=6   dossier says L>=6
leyline/White     25         0              4              4
leyline/Blue      25         3              8              7
leyline/Black     25         4              7              4
leyline/Red       25         4              7              5
leyline/Green     25         5              8              6
heroic/Agent      25         7              7              0
heroic/Envoy      25         6              6              0
heroic/Hunter     25         6              6              0
heroic/Leader     25         5              5              0
heroic/Scholar    25         6              6              0
heroic/Warrior    25         6              6              0
```

52 of 365 talents move. **The dossier reports zero L6 talents in every heroic tree; the true number is 5–7 per tree — statistically identical to leyline's 4–8.**

The talents that move most consequentially, all heroic, all reported at L2–L4 and all actually L6:

| Talent | Tree | Gate | Dossier L | True L |
|---|---|---|---|---|
| **Devastating Blow** | Warrior | Athletics 3+ | L2 | **L6** |
| **Wit's End** | Warrior | Intimidation 3+ | L3 | **L6** |
| **Fatal Thrust** | Hunter | Perception 3+ | L2 | **L6** |
| **Overcharge** | Scholar | Crafting 3+ | L2 | **L6** |
| **Foresight** (+1 Reaction/turn) | Envoy | Discipline 3+ | L4 | **L6** |
| **Quick Analysis's siblings** — Fast Talker, Trickster's Hand | Agent | Insight 3+ / Thievery 3+ | L3 | **L6** |
| **Synchronized Assault** (capstone) | Leader | Leadership 3+ | L5 | **L6** |
| **Turning Point** (capstone) | Scholar | Deduction 3+ (behind Contingency, Lore 3+) | L4 | **L7** |
| **Mercurial Façade** | Agent | Deception 3+, behind Subtle Takedown (L6) | L4 | **L7** |

The three biggest talent-supplied damage numbers in the heroic atlas — Wit's End (4d6), Fatal Thrust (4d4), Devastating Blow (2d8) — are **all** level-6 talents. There is no such thing as a level-2 Warrior with Devastating Blow.

Four leyline rows also move for the same reason: Black's **Extract Thought** (Deception 3+, L3→L6, dragging **Composed** and **Whispered Doubt** to L7 and **Puppeteer** to L8), Red's **Feeding Frenzy** (Intimidation 3+, L3→L6, dragging **Frenzied Tempo** to L7), Green's **Pack Sense** and **Natural Recovery** (Survival 3+ / Medicine 3+, L3→L6, dragging **Apex Predator** and **Reknit Form** to L7 and **Vital Surge** to L8), and Blue's **Baleful** (Persuasion 3+, L4→L7).

**Recommendation for the repo, independent of design:** `derive-dossiers.js` should treat any `<skill> 3+` clause as a level-6 gate. Right now `docs/analysis/talent-ecosystem` mis-times 14% of the corpus, and every profile that used the earliest-L column for pacing judgments inherited the error.

---

## 2. Band by band, by depth

```
TREE            d0 d1 d2 d3 d4 d5   maxDepth
leyline/White    5  5  5  6  4  0      4
leyline/Blue     4  6  8  6  1  0      4
leyline/Black    4  6  5  4  4  2      5
leyline/Red      4  6  5  5  3  2      5
leyline/Green    4  5  7  6  3  0      4
heroic/Agent     7  6  9  3  0  0      3
heroic/Envoy     7  7  5  6  0  0      3
heroic/Hunter    7  6  9  3  0  0      3
heroic/Leader    7  5  7  5  1  0      4
heroic/Scholar   7  9  6  3  0  0      3
heroic/Warrior   7  8  8  2  0  0      3
```

The two atlases have genuinely different **shapes**, and this is the asymmetry that is real:

- **Leyline trees are narrow and deep**: 4–5 entries, depth reaching 4–5. Black and Red carry depth-5 nodes (Sovereign of Solitude, Double Dip, Chain Detonation, Unstoppable).
- **Heroic trees are wide and shallow**: 7 entries every time, depth stopping at 3 (Leader is the one exception, one depth-4 node — Synchronized Assault).

**Depth 0.** Heroic offers 7 entries, leyline offers 4 (White nominally 5, but **Pillar of Order is a depth-0 entry gated at White 3+ — an entry node no one can take until level 6**, which reads as an authoring error rather than a decision). Heroic therefore gives roughly double the level-1 menu. This matters most at L1–L3, when the player owns 1–3 talents and wants the best three; a 6-option menu beats a 3-option menu even when the individual options are weaker.

**Depth 1–2.** Comparable in count. This is where both atlases put their engines: Black's Severance and Blood Price, Green's Mender's Instinct and Grasping Vines, Warrior's Mighty and Feinting Strike, Agent's Quick Analysis, Envoy's Practical Demonstration. Rough parity on quality; leyline's depth-1–2 nodes cost Investiture, heroic's are mostly free.

**Depth 3+.** Leyline is deeper (White 10 talents at d3+, Black 10, Red 10, Green 9, Blue 7) versus heroic (Envoy 6, Leader 6, Agent 3, Hunter 3, Scholar 3, **Warrior 2**). Warrior having only two talents past depth 2 (Meteoric Leap, Precise Parry — both L6, both behind the Shardblade gate for one of them) is the thinnest late tree in the eleven.

---

## 3. Band by band, by **level** — and the finding that inverts the premise

Talents legally available (menu size, not talents owned):

```
             ≤L3   ≤L5   ≤L8      new talents unlocked at:  L4   L5
leyline/White  14    21    25                                 5    2
leyline/Blue   15    17    25                                 2    0
leyline/Black  14    18    25                                 2    2
leyline/Red    14    18    25                                 3    1
leyline/Green  14    17    25                                 3    0
heroic/Agent   18    18    25                                 0    0
heroic/Envoy   19    19    25                                 0    0
heroic/Hunter  17    19    25                                 2    0
heroic/Leader  18    20    25                                 2    0
heroic/Scholar 18    19    25                                 1    0
heroic/Warrior 19    19    25                                 0    0
```

Read the last two columns. **Warrior, Envoy and Agent unlock nothing at all at level 4 and nothing at level 5.** Their trees go: seven entries at L1, depth-1 at L2, depth-2 at L3, then a two-level plateau, then six talents at once at L6. Hunter, Leader and Scholar unlock nothing at L5. On the leyline side only Blue and Green have a dead level 5; White, Black and Red open new nodes at both L4 and L5.

So the felt curve is the **reverse** of the brief's assumption:

- **Levels 1–3:** heroic is broader (17–19 options vs 14–15) and cheaper (13–21 cost-free talents per tree vs 9–15). A heroic character at L3 has picked three talents from a wider, mostly-free menu.
- **Levels 4–5:** heroic **stalls**. The L4 and L5 talents a Warrior buys are the 4th- and 5th-best items from the same L1–L3 menu — Practiced Kata, Signature Weapon, Surefooted. A leyline character at L4–L5 is buying genuinely deeper nodes: Black's Predatory Patience and Dark Investiture, White's Shield Wall and Unyielding Accord, Red's Explosive Leap and Reckless Momentum, Green's Pack Pressure.
- **Level 6:** both sides open six-ish new talents at once. Only leyline's numbers change (§6).
- **Levels 7–10:** both sides flatten completely on numbers. Tier stays 2 and the rank cap stays 3 for the whole band, so nothing scales; growth is one talent per level for both. By L8 every tree in the eleven has its full 25 available.

**Does a heroic character peak earlier and then flatten?** They *front-load* earlier — 76% of the tree available by L3 versus leyline's 57% — and then plateau hard for two levels. They do not "peak"; they arrive at their operating power at L3 and stay there until L6.

**Does a leyline character spend 1–5 weaker in exchange for a stronger 6+?** Only Blue and White do. Black is the strongest damage tree in the eleven **at level 1** (§7) and is stronger again at 6+. That is not a trade, it is a straight win.

---

## 4. The rank bill — the gate nobody counted

Every `X n+` prerequisite in each tree, taking the max rank demanded per skill:

```
TREE            skills gated   rank bill   detail
leyline/White        2             5       White 3, Leadership 2   (+ Strength 3 attr)
leyline/Blue         2             6       Blue 3, Persuasion 3
leyline/Black        2             6       Black 3, Deception 3
leyline/Red          2             6       Red 3, Intimidation 3
leyline/Green        3             9       Green 3, Survival 3, Medicine 3
heroic/Agent         4            12       Deduction 3, Insight 3, Deception 3, Thievery 3
heroic/Envoy         4            12       Discipline 3, Persuasion 3, Lore 3, Leadership 3
heroic/Hunter        4            12       Perception 3, Agility 3, Stealth 3, Survival 3
heroic/Leader        4            12       Leadership 3, Athletics 3, Persuasion 3, Deception 3
heroic/Scholar       4            12       Crafting 3, Lore 3, Deduction 3, Medicine 3
heroic/Warrior       4            12       Intimidation 3, Athletics 3, Perception 3, Discipline 3
```

Every heroic tree costs **12 skill ranks across 4 different skills** to fully unlock. Every leyline tree costs **5–9 ranks across 2–3**. At 2 ranks per level that is a six-level difference in skill budget between Warrior and White.

And leyline's ranks are **double-dipped**: the colour rank is simultaneously (a) the prerequisite, (b) the skill you roll for every talent test, (c) the `[Die]` size in every damage and heal formula, and (d) Attunement Range and `[Size]`. Warrior's Athletics 3 buys prerequisites and Athletics tests. Black's Black 3 buys prerequisites, every Black attack test, `d6→d8` on Withering Ray/Dark Investiture/Sovereign of Solitude, and 30 ft → 60 ft of Attunement Range.

**Leyline pays half the rank price and gets four returns on it.** This is the single largest unremarked structural advantage in the comparison, and it points the opposite direction from the brief's premise.

---

## 5. Entry talents: are leyline entries worth more or less than heroic entries?

Three components, priced separately.

**(a) The free skill rank.** All six heroic path descriptions carry the line *"If you choose X as your starting path, gain a free skill rank in Y"* (Warrior→Athletics, Agent→Insight, Envoy→Discipline, Hunter→Perception, Leader→Leadership, Scholar→Lore). **None of the five leyline path descriptions carries it** — `grep "Starting Skill" INTENT-*.md` returns exactly six files, all heroic. The leyline descriptions also omit the "path key talent" sentence the heroic ones all carry.

That is worth one rank, permanently, in a currency that costs half a level. For leyline it would be worth *more* than for heroic (double-dipped, §4). Whether this is a deliberate asymmetry or a gap in `data/path-descriptions.json` is a designer question, but as written a heroic character starts half a level ahead in skill ranks.

**(b) The Key talent.** Assuming both are free with the path (the primer states this explicitly for leyline; the heroic descriptions say the key "unlocks access to the specialties" but do not say "free" — this is the one place I cannot settle inside the fence, see §10):

| | Leyline Key | Heroic Key |
|---|---|---|
| Form | a Passive rider on **Draw Mana**, an Action you must spend | a real talent you activate |
| White | allies in range regain `tier` HP (1 at T1, 2 at T2) | — |
| Blue | advantage on your next **Cognitive** test | — |
| Black | isolated enemies in range become **Weakened** | — |
| Red | advantage on next Physical test **and you lose your Reaction** | — |
| Green | create difficult terrain within `[Size]` (5 ft at T1) | — |
| Agent | — | **Opportunist**: reroll your plot die once per round, free |
| Scholar | — | **Erudition**: two free skill ranks + an expertise, re-specable |
| Envoy | — | **Rousing Presence**: an ally is Determined *for the scene* |
| Hunter | — | **Seek Quarry**: advantage on all tests to find/attack/study one target |
| Leader | — | **Decisive Command**: 1A + 1 focus, ally adds a d4 to a roll |
| Warrior | — | **Vigilant Stance**: Dodge/Reactive Strike cost 1 less focus; other stances become Free Actions |

Erudition alone is worth **two skill ranks — a whole level's skill budget — free, forever, and reassignable**, which is more than any leyline Key. Opportunist is the only plot-die reroll in all 365 talents and costs nothing. Seek Quarry delivers a permanent advantage against a chosen target with no action and no cost.

Against that, four of the five leyline Keys are conditional and one (**Red**) is a net negative in most rounds — losing your Reaction every time you refuel, in a system where Dodge and Reactive Strike are the universal defensive baseline, is a real cost paid to gain a binary advantage on one Physical test. Black's Key is the standout leyline key: it applies a condition to multiple enemies, and it feeds three other Black talents (Sapping Hex, Spoils of Isolation, Predatory Patience).

**Verdict: heroic Keys are worth materially more than leyline Keys**, with Black the only close case.

**(c) The purchasable entries.** 6 heroic vs 3 leyline at L1. But on individual quality the leyline entries are stronger:

- **Withering Ray** (Black, d0, L1, 1 Action): `2[Tier][Die]` vital = **2d6, avg 7.0**, ignores Deflect, costs **no Investiture** (only half `[Die]` ≈ 1.75 HP), and carries **no once-per-turn limiter** — three casts per Slow turn is legal as written.
- **Hollow Command** (Black, d0, L1, 2 Actions, 1 Inv): *"the target cannot take actions on its next turn."* The primer prices action denial as the most valuable category in the game; this removes a whole turn, and it is available at level 1.
- **Verdant Mend** (Green, d0, L1): `[Tier][Die] + Green modifier` healing ≈ 7.5 at L1, against an L1 health pool of `10 + STR`.
- **Deadly Trap** (Hunter, d0, L1, 2 Actions, no cost): 2d4 = 5 plus **Immobilized**, or 2d4 plus **Afflicted[3 + Survival ranks]** vital ongoing.
- **Cheap Shot** (Agent, d0, L1, 1 Action, 1 focus): unarmed attack, on a hit the target is **Stunned** — the only Stun in 365 talents.
- **Stonestance** (Warrior, d0, L1, free): +1 Deflect **and enemies within your reach must spend an extra Action to attack your allies**. An action tax on every enemy in reach, permanent, free.
- **Tagging Shot** (Hunter, d0, L1, **3 Actions**): move 5 ft and make a ranged attack to apply quarry — which the free Key applies as a Special. A whole Slow turn to duplicate a free talent. This is the worst talent in the eleven trees and it is an entry node.

**Net on entries: heroic gets more entries and a better Key; leyline gets better individual entries.** They come out close, with one exception — Black's entry package (Withering Ray + Hollow Command + the Weakening Key) is stronger than any heroic entry package at level 1, and it is the origin of the parity failure in §9.

---

## 6. The economies: Investiture vs Focus, quantified

```
TREE            cost-free  Inv-costers(total)  focus-costers(total)  Opp  HP
leyline/White      10          15 (18)              1 (2)             2   0
leyline/Blue        9          15 (18)              1 (2)             1   0
leyline/Black      15           9 (11)              1 (2)             1   2
leyline/Red        14           9 (10)              0 (0)             3   0
leyline/Green      11          13 (15)              0 (0)             2   0
heroic/Agent       13           0                  12 (22)            0   0
heroic/Envoy       17           0                   8 (9)             0   0
heroic/Hunter      21           0                   4 (7)             0   0
heroic/Leader      14           0                  11 (16)            0   0
heroic/Scholar     18           0                   7 (13)            1   0
heroic/Warrior     18           0                   7 (10)            0   0
```

**Sustain over a five-round fight (15 Actions on Slow turns):**

*Leyline, Tier 1.* Pool ≈ 4 (`2 + max(AWA,PRE)`), Draw Mana returns 1 per Action. Solving `3N − d ≤ d + 4` at N=5 gives d ≥ 5.5 → **6 Actions drawing, 9 payload = 60% uptime**. At Tier 2 Draw Mana returns 2, giving d ≥ 3 → **12 payload of 15 = 80%**. Investiture is **unbounded** at that tax rate; the fight can go 20 rounds.

*Heroic.* Focus max = `2 + WIL` (≈5 at WIL 3), plus `+tier` from Focused Mind / Composed / Clear Mind → ~6 at T1, ~7 at T2. **It does not refill in combat** — the only in-combat focus generation anywhere is Envoy's Galvanize/Applied Motivation/Lessons in Patience (4 of the corpus's 8 focus-restorers), Leader's Cutthroat Tactics (+1 on a Complication), Hunter's Cold Eyes (+1 on a quarry kill), and Black's Siphoned Will / Predatory Insight. So a heroic character has ~7 units for the **whole fight**, i.e. 1.4/round over five rounds.

**The asymmetry that matters is not the size of the pools, it is that focus is also the defensive baseline.** Dodge (1 focus), Aid (1 focus) and Reactive Strike (1 focus) are standard reactions available to everyone. A heroic character's talent costs compete directly with their own ability to Dodge. A leyline character's do not: leyline trees carry **exactly one focus-costing talent each in White, Blue and Black and zero in Red and Green**, so a leyline mage's full focus pool stays free for Dodge/Aid/Reactive Strike while their talents run off a separately-refillable resource.

**Effective budget over five rounds at Tier 2: leyline ~10 units of Investiture *plus* an untouched 7-focus defensive pool; heroic ~7 units of focus that must cover talents and defence together.** Roughly a 2× advantage to leyline, and it widens with fight length because leyline's is a flow and heroic's is a stock.

**The counterweights, which are real:**

1. **Free play.** Heroic averages 16.8 cost-free talents per tree, leyline 11.8. A Warrior with Stonestance, Mighty, Combat Training, Hardy, Surefooted, Formation Drills and Defensive Position has a permanently-on package that never costs anything. No leyline tree assembles that.
2. **Action economy.** Heroic buys Actions; leyline spends them. Agent's Quick Analysis / Fast Talker / Trickster's Hand each convert 2 focus into **2 Actions** as a Free Action — the best conversion rate in the game. Cautious Advance, Windstance, Flamestance, Through the Fray, Turning Point and Synchronized Assault all grant actions. The leyline atlas has essentially none, and pays a 20–40% Action tax on top. This substantially offsets the resource gap.
3. **Short fights favour heroic.** In a 1–2 round encounter the heroic character dumps 5–7 focus immediately with no tax; the leyline character has 4–6 Investiture and also no tax yet. Roughly even, and heroic's action-granting tips it. **Fight length is the swing variable, and it is a GM-controlled variable** — which means the parity verdict is partly a scenario-design question, not only a talent-design one.

**One more heroic tax:** eight heroic talents carry a GM-granted narrative or equipment prerequisite, and the chains behind them are large. **Zero leyline talents do.**

```
heroic/Leader    8/25 behind a GM grant  (Rumormonger→Baleful/Shrewd Command/Well Dressed→
                                          Set at Odds/Grand Deception; Authority→Synchronized Assault)
heroic/Warrior   6/25  (Shard Training→Windstance→Shattering Blow→Precise Parry; →Bloodstance→Meteoric Leap)
heroic/Hunter    4/25  (Animal Bond→Protective Bond→Feral Connection/Pack Hunting)
heroic/Envoy     4/25  (High Society Contacts→Practiced Oratory; Instill Confidence→Foresight)
heroic/Agent     2/25
heroic/Scholar   0/25
every leyline    0/25
```

Leader's **capstone requires a noble title**; Warrior's entire Shardbearer specialty requires a Shardblade *and* Shardplate; Envoy's Foresight — the only unconditional extra Reaction in the game — requires "a companion" the tree never grants. A leyline mage's tree is entirely purchasable with level-ups.

---

## 7. Scaling: the level-6 cliff, quantified per formula

Every authored roll formula in the eleven trees, evaluated at Tier 1 rank 2 and Tier 2 rank 3:

```
TREE     TALENT                FORMULA                                    T1r2  T2r3  ratio
Black    Withering Ray         (2*@tier)d(2*@skills.black.rank+2)          7.0  18.0   2.57
Black    Dark Investiture      (@tier)d(2*@skills.black.rank+2)            3.5   9.0   2.57
Black    Sovereign of Solitude (@tier)d(2*@skills.black.rank+2)            3.5   9.0   2.57
Red      Searing Bolt          (@tier)d(2*@skills.red.rank+2)              3.5   9.0   2.57
Red      Flame Surge           (@tier)d(2*@skills.red.rank+2)              3.5   9.0   2.57
Red      Volatile Strike       floor((@tier)d(...)/2)                      1.0   4.0   4.00
Red      Shockwave Slam        floor((@tier)d(...)/2)                      1.0   4.0   4.00
White    Retributive Guard     (@tier)d(2*@skills.white.rank+2)            3.5   9.0   2.57
White    Mending Aura   HEAL   floor((@tier)d(...)/2)                      1.0   4.0   4.00
Green    Verdant Mend   HEAL   (@tier)d(...)+@skills.green.mod             3.5+  9.0+  2.57
Green    Mender's Instinct HEAL(@tier)d(...)                               3.5   9.0   2.57
--------------------------------------------------------------------------------------------
Warrior  Devastating Blow      (2+max(@tier-2,0))d8                        9.0   9.0   1.00
Warrior  Wit's End             (4+max((@tier-2)*2,0))d6                   14.0  14.0   1.00
Hunter   Fatal Thrust          4d4                                        10.0  10.0   1.00
Hunter   Deadly Trap           2d4                                         5.0   5.0   1.00
Agent    Cheap Shot            @scalar.damage.unarmed                      2.5   2.5   1.00
Scholar  Field Medicine  HEAL  @skills.med.rank                            2.0   3.0   1.50
Scholar  Applied Medicine HEAL @skills.lor.rank                            2.0   3.0   1.50
```

**Every leyline formula multiplies by 2.57× at level 6. Every heroic damage formula is literally constant from level 2 to level 10.** Devastating Blow's `max(@tier-2,0)` term does not fire until Tier 3, which does not exist below level 11.

Scaling-channel census (how many talents in each tree scale on what):

```
TREE            rank-scaled   tier-scaled   [Tier][Die]/[Size]-scaled
leyline/White        2             1                5
leyline/Blue         0             2                4
leyline/Black        1             4                6
leyline/Red          1             1               10
leyline/Green        3             1                8
heroic/Agent         0             3                0
heroic/Envoy         6             2                0
heroic/Hunter        5             3                0
heroic/Leader        3             3                0
heroic/Scholar       6             2                0
heroic/Warrior       3             2                0
```

**Heroic has zero `[Tier][Die]` scaling anywhere.** All heroic growth is linear: `+1` when tier goes 1→2 (Mighty: +2→+3 per action spent; Surefooted's terrain reduction; Composed's focus), or `+1` when a rank goes 2→3 (Feinting Strike's focus drain = Intimidation ranks; Pack Hunting's `+Survival ranks`; Steady Aim's `+Perception ranks`; Practiced Oratory/Resolute Stand/Synchronized Assault's target counts). Hunter is the one heroic tree that scales its damage by **talent purchase** rather than by level — Deadly Trap goes 2d4 → 2d6 (Experienced Trapper, L2) → 2d8 (Hunter's Edge, true L6) — which is a legitimate alternative design and worth noting as the model that works.

**So both sides flatten from L6 to L10. The difference is entirely in the size of the L6 step: leyline ×2.57, heroic ×1.0–×1.5.**

---

## 8. Rankings

Scored on what a character in that tree actually contributes per round, using the talent set legally ownable at that level. Weapon dice excluded on both sides — every character, leyline mages included, can Strike; the primer prices a talent that reproduces a standard action at roughly zero.

### Power at L3 (3 talents + Key; Tier 1, rank 2)

| # | Tree | What it actually does at L3 |
|---|---|---|
| 1 | **leyline/Black** | Withering Ray at **7.0 vital/Action**, Deflect-ignoring, Investiture-free, unlimited per turn; **Hollow Command** removes an enemy's entire next turn; the Key Weakens isolated enemies for free on every refuel. Nothing else in the eleven trees is close on output at level 3. |
| 2 | **heroic/Warrior** | Stonestance (+1 Deflect, and every enemy in reach pays an **extra Action** to attack your allies) + Combat Training + Mighty (+2/action). All permanent, all free, no resource spend at all. |
| 3 | **heroic/Agent** | Opportunist (free plot-die reroll every round) + **Cheap Shot** (the only Stunned in 365 — two fewer enemy actions) + Quick Analysis (2 focus → **2 Actions**). The best action economy and the only fate manipulation at this level. |
| 4 | **heroic/Hunter** | Deadly Trap upgraded by Experienced Trapper: **2d6 = 7** plus Immobilized, *or* **Afflicted[5 vital/turn]** ongoing — and it costs no resource at all. Seek Quarry gives a permanent free advantage. |
| 5 | **leyline/Green** | Verdant Mend (≈7.5 healing at L1, against ~12 HP pools) + Mender's Instinct (reactive 3.5 on an ally hitting half) + **Grasping Vines** (Restrained: movement 0 *and* disadvantage on everything). Best heal and best hard control in the leyline atlas at L2. |
| 6 | **heroic/Leader** | Decisive Command + Combat Coordination = a free d4 to an ally **every time you Strike**, no action; Tactical Ploy denies a Reaction and imposes disadvantage. |
| 7 | **heroic/Envoy** | Rousing Presence + Practical Demonstration = scene-long Determined delivered as a **Free Action, unlimited, for zero cost**; Steadfast Challenge Disorients (no reactions) and imposes disadvantage. |
| 8 | **leyline/Red** | Searing Bolt 3.5/Action but Investiture-taxed to ≈1.75 amortised; Incite forces a Strike on the nearest character or costs the Reaction. Real but thin. |
| 9 | **leyline/White** | Guardian Stance (+1 Deflect to you and an adjacent ally, permanent, free) + the Key trickling `tier` HP to the whole party on every refuel + Retributive Guard (3.5 spirit, Reaction). Solid, small, and entirely dependent on there being allies present. |
| 10 | **heroic/Scholar** | Erudition (two free skill ranks) + Field Medicine → Swift Healer at L2 makes healing a **Free Action** every round. Zero damage, zero control, zero mitigation. Best out-of-combat tree in the game and close to inert inside one. |
| 11 | **leyline/Blue** | Forewarned (a conditional extra Reaction if you guessed right), Calculated Patience (advantage on the first test of a Slow turn), Pattern Recognition (disadvantage, but only *after* you succeed on a Cognitive test). One binary advantage, one binary disadvantage, a maybe-Reaction, and no damage. Clearly last. |

### Power at L5 (5 talents + Key; still Tier 1, rank 2)

Nothing has changed for Warrior, Envoy or Agent — they have bought two more entry-tier talents. Leyline has added depth.

| # | Tree | Change since L3 |
|---|---|---|
| 1 | **leyline/Black** | + Predatory Patience (L4: `+[Die]` to attack tests against Weakened enemies **and regain 1 Investiture** on a successful hit — an Investiture engine fed by its own free Key) + Dark Investiture (L4: 3.5 vital **plus Afflicted[3.5 vital/turn]** ongoing) + Sanguine Reservoir (L5: banks the HP Withering Ray spends and lets you spend it as Investiture). Also **Blood Price** (d1, L2, free Passive) grants advantage on your next Black test whenever you lose HP to a Ritual talent — and Withering Ray *is* a Ritual talent whose cost is losing HP. From level 2, every Withering Ray carries advantage. Self-fuelling, free, permanent. |
| 2 | **heroic/Warrior** | + Swift Strikes (1 focus, second Strike), Formation Drills, Surefooted, Practiced Kata. All useful, none new in kind. Devastating Blow and Wit's End are **not available**. |
| 3 | **heroic/Hunter** | + Backstep, Cold Eyes, Animal Bond chain. Fatal Thrust is **not available** (Perception 3+). |
| 4 | **leyline/Green** | + Thorn Field (terrain ticks 1.75 keen), Coordinated Hunt, Pack Pressure (L4: whole party repositions free, then every adjacent Strike deals `+[Tier][Die]` for a round). |
| 5 | **leyline/White** | Best menu growth in the eleven — **21 of 25 available at L5**, the highest of any tree. + Shield Wall (attacks against two adjacent allies deal `half [Tier][Die]` less, permanent, free), Devoted Conduit, Unyielding Accord. |
| 6 | **heroic/Agent** | Unchanged in kind. |
| 7 | **heroic/Leader** | + Resolute Stand, Confident Command (command die d4→d6). |
| 8 | **leyline/Red** | + Momentum's Edge (L3) — see §9, the bug — and Mighty (L4), Explosive Leap/Shockwave Slam (L4), Reckless Momentum (L5). |
| 9 | **heroic/Envoy** | Unchanged in kind; Foresight, its best talent, is L6. |
| 10 | **heroic/Scholar** | + Applied Medicine, Deep Contemplation. Still zero damage. |
| 11 | **leyline/Blue** | + Probable Outcome (L3: change your fast/slow choice after everyone has declared — genuinely strong and under-rated), Probability Cascade, Read Intent. Counterspell, the tree's teeth, is L6. Still zero damage. |

### Power at L8 (8 talents + Key; Tier 2, rank 3 — full menu on both sides)

| # | Tree | Talent-supplied output per Slow turn |
|---|---|---|
| 1 | **leyline/Black** | **Three Withering Rays per turn at 4d8 = 18 vital each ≈ 54 Deflect-ignoring damage**, at zero Investiture cost, with advantage from Blood Price, `+d8` to each test from Predatory Patience against the Key's own Weakened targets, HP cost banked by Sanguine Reservoir and refunded by Predator's Due (`2d8` HP + 1 Investiture per kill). Plus Dark Investiture's Afflicted[2d8/turn] and Hollow Command's whole-turn denial. |
| 2 | **heroic/Warrior** | Best turn: Devastating Blow (2 Actions) = `2d8` (9) + Mighty (+3 × 2 actions = 6) = **15 talent damage**, plus a Strike (+3) = ~18/turn. The execute line — Feinting Strike (2A, 2 focus) to strip focus, then Wit's End (2A, 1 focus) = `4d6` (14) + Mighty (6) = **20 Deflect-ignoring** — takes **four Actions across two turns**, i.e. ~5/Action. |
| 3 | **leyline/Red** | Searing Bolt `2d8` (9) + Kindle (`+Red modifier`) per Action, Arc Flash arcing `half [Tier][Die]` (4) to a second target as a Special, Flame Surge 9 in a 10 ft area, Afterburn's Afflicted[4/turn], Chain Detonation on kills. Taxed to ~67% uptime. |
| 4 | **heroic/Hunter** | Deadly Trap at `2d8` (9) + Immobilized or Afflicted[3 + Survival 3 = 6/turn], Fatal Thrust `4d4` (10) on unsuspecting targets, Unrelenting Salvo lifting the once-per-turn same-weapon restriction, Mighty +3. |
| 5 | **heroic/Agent** | Three separate `+2 Actions` Free Actions (Quick Analysis, Fast Talker, Trickster's Hand), Stunned on demand, plot-die control. Damage still ~2.5. |
| 6 | **leyline/Green** | `2d8` (9) heals + `tier + Green mod` regeneration, `half [Tier][Die]` (4) terrain ticks, Reknit Form (the only Injury removal in 365 talents), Restrained on demand, Drive the Prey. |
| 7 | **heroic/Envoy** | **Foresight** (an unconditional second Reaction every turn — one of only two in the corpus), scene-long Determined delivered free and unlimited, party focus battery, Rallying Shout reviving an unconscious ally. |
| 8 | **leyline/White** | Shield Wall (`half [Tier][Die]` = 4 off every attack against two adjacent allies, permanent, free), Devoted Conduit, Unbreakable Line (an adjacent ally dropping to 0 drops to 1 instead), `tier` = 2 HP to every ally on every refuel. One damage talent: Retributive Guard, 9 spirit, once per round at most because it is a Reaction. |
| 9 | **heroic/Leader** | d8 command die, Authority doubling range and target count, Synchronized Assault granting up to 3 allies an extra Strike. Damage: `Mighty +3`. Heavily patron-gated (8/25). |
| 10 | **heroic/Scholar** | Turning Point (party-wide `+1 Action`), Resuscitation, `+Medicine + Lore ranks` on every heal, the game's only fabrial economy. Zero damage, zero control. |
| 11 | **leyline/Blue** | Counterspell (the only talent-activation interruption in 365), Ghostly Walls + Absolute Stillness (movement 0, disadvantage on Physical, no Reactions), Probability Cascade. Zero damage. Its whole kit lands at once at L6 and it is still the weakest of the eleven. |

---

## 9. Holding the "mortal, comparable to Heroic path characters" claim to account

`leyline-revision-guide` §Revision Principles 9: *"Leyline mages are mortal. Comparable to Heroic path characters, not Radiants… Strong and versatile, but human-scale. Radiant-equivalent power lives in the Deity Domain trees."*

**Verdict per tree:**

| Tree | Claim holds? | Why |
|---|---|---|
| **leyline/Green** | **Yes** | Comparable to Scholar/Envoy. Heals more sustainably than Scholar (Investiture renews, recovery dice don't) but has less breadth. Owns Injury removal, which Scholar does not. Fair trade. |
| **leyline/Red** | **Yes, with one exception** | Broadly comparable to Warrior/Hunter once the Investiture tax is priced. The exception is Momentum's Edge (below). |
| **leyline/White** | **Below the claim** | Comparable in kind to Leader/Envoy, but weaker in execution. Seven Reaction talents competing for one Reaction slot per round means most of the tree cannot fire; 15 Investiture-costers with **zero bonus regen** (the worst ratio in the atlas) means the tree cannot afford itself; and its single damage talent is a conditional Reaction. Its own free Key out-heals its entire Coordination branch: the Key gives every ally `tier` HP on an Action you were spending anyway, while **Mending Aura** (depth 4, L5) gives `half [Tier][Die]` = 1.0 at Tier 1 for an Opportunity **and** 1 Investiture. |
| **leyline/Blue** | **Well below the claim** | Weakest of the eleven at L3, L5 and L8. 15 Investiture-costers, zero regen, five Reactions for one slot, zero damage, and its three real teeth (Counterspell, Ghostly Walls/Absolute Stillness, Living Image) are all L6+. It is also the tree whose stated capstone identity — *"Plot Die manipulation is Blue's capstone identity"* — is implemented in **zero** Blue talents while heroic/Agent has six. |
| **leyline/Black** | **Violates the claim outright** | The single strongest combat tree in the eleven at every level measured, and by a wide margin at L8. |

**Where the mismatch is worst, and the exact talents that cause it:**

1. **`Withering Ray` (leyline/Black, depth 0, L1).** `2[Tier][Die]` vital = **4d8 (18) per Action at Tier 2**, ignoring Deflect, with **no Investiture cost**, **no once-per-turn limiter**, and (via Blood Price, depth 1, L2, free) permanent advantage on the attack. Three of them fit in a Slow turn. Compare the best heroic talent-damage turn — Devastating Blow's 15 over two Actions — and it is roughly **3.5× the heroic ceiling** on a Deflect-ignoring damage type. Everything Black does downstream (Severance converting all damage to vital, Sapping Hex, Predatory Patience's `+[Die]` and Investiture refund, Predator's Due's HP+Investiture refund on kills) is a multiplier on that one card. **This is the parity failure.** The cleanest fixes, in ascending order of intervention: (a) add a once-per-turn limiter; (b) cut `2[Tier][Die]` to `[Tier][Die]` — bringing it in line with Searing Bolt and Dark Investiture, which use exactly that formula; (c) add a 1-Investiture cost, which would place it under the same Draw Mana tax every other leyline damage talent pays. I would take (b) plus (c): it is the only leyline damage entry that is both double-sized *and* Investiture-free.

2. **`Momentum's Edge` (leyline/Red, depth 2, L3).** *"bonus impact damage equal to your Speed"*, authored as `@movement.walk.rate` — a DerivedValueField object, so as shipped it probably delivers nothing. **If it ever resolves it is +25 to +30 impact damage on every Strike after a 20-foot approach, at level 3**, against 1–4 for every other damage rider in the game and against Warrior's L6 Devastating Blow at 9. This is simultaneously a live bug and, if fixed naively, the largest single balance break in the eleven trees. It needs a decision (Speed *attribute*, not movement rate, is the obvious reading) before it is wired.

3. **`Pillar of Order` (leyline/White, depth 0, gated White 3+).** A depth-0 **entry node** that cannot be taken until level 6. Almost certainly an authoring error; it makes White's real entry menu three talents, the narrowest in the game.

4. **`Tagging Shot` (heroic/Hunter, depth 0, 3 Actions).** An entry node that spends a whole Slow turn to apply the quarry mark that Seek Quarry — the free Key — applies as a Special. It is also one of only four 3-Action talents in the eleven trees, and the leyline guide's own benchmark table sets 3-Action at **0%**. The other three (Close the Case, Grand Deception, Synchronized Assault) are at least deep capstone-ish nodes; this one is an entry.

5. **The heroic flat-damage formulas.** `Devastating Blow` = 2d8 at level 6 and 2d8 at level 10. `Wit's End` = 4d6 at both. `Fatal Thrust` = 4d4 at both. These do not break parity today because Black is the outlier, but they are what makes heroic's L6–L10 band feel like nothing is happening. Hunter shows the fix that fits heroic's design language: scale the number by **talent purchase** (Deadly Trap 2d4 → 2d6 → 2d8) rather than by tier. Warrior has two spare talent slots at depth 3 to hold exactly such an upgrade.

6. **The two structural gaps under the designer's control, not the talents':** the missing "Starting Skill" grant on all five leyline paths (heroic gets a free rank, leyline does not), and the missing consistency between the two atlases' rank bills (12 ranks across 4 skills for every heroic tree; 5–9 across 2–3 for leyline, double-dipped).

---

## 10. What I could not settle inside the scope fence

- **Whether heroic Key talents are granted free with the path.** The primer states it explicitly for leyline ("granted free with the path"); the six heroic path descriptions say only that the Key "unlocks access to the specialties". Section 5's entry-value comparison assumes both are free. If heroic Keys cost a talent slot, heroic entry value drops by roughly one talent and the L1–L3 picture tightens. **What would settle it:** the heroic path documents in `data/path-descriptions.json`, or the advancement rules in `docs/ACTOR_STAT_DERIVATION.md` — both in scope; the system's own compendium is not.
- **Whether attribute gates behave like skill gates.** `Shared Burden` (leyline/White) requires **Strength 3+**, an attribute rather than a skill. Attribute points arrive at levels 3/6/9, so this may or may not be a level gate. I excluded attributes from the rank-bill and the true-L computation and flagged them separately.
- **The absolute value of `Green modifier` / `Red modifier`** (Verdant Mend, Kindle, Pack Sense, Bound by Word, Shared Conviction). "Modifier" composition — attribute plus ranks, or ranks alone — is not stated in any dossier source. I used ≈+4 at rank 2 as a working figure and flagged every place it is load-bearing.
- **Whether 18 vital per Action is "a lot".** That depends on adversary HP and Deflect, which the scope fence excludes. What is *not* scope-dependent is the **ratio**: Withering Ray at Tier 2 delivers about 3.5× the best heroic talent-supplied damage per Action, on a damage type the target cannot Deflect. The parity claim is a relative one, and the relative answer is settled.
- **Whether fights at Ben's table run 2 rounds or 6.** §6 shows heroic wins the burst economy and leyline wins the attrition economy, with the crossover somewhere around round 3. **This is the single most decision-relevant unknown in the whole comparison**, it is measurable at the table rather than in the data, and it means part of the parity answer is an encounter-design lever, not only a talent-design one.

## Adversarial verification

**22 load-bearing claims checked: 10 confirmed, 11 corrected, 1 refuted.**

The analysis's central MEASUREMENT is right and I reproduced it independently, cell for cell. The dossier's `earliest L` applies the rank-3 to level-6 rule only to the five colour skills, so 52 of 365 talents (14.2%) are mis-timed, and every heroic tree really does carry 5-7 level-6 talents against a dossier-reported zero. My own fixpoint recompute returned the analysis's moved/trueL6 columns exactly (0/3/4/4/5/7/6/6/5/6/6 and 4/8/7/7/8/7/6/6/5/6/6), plus its exact menu table, depth histogram, rank-bill table and GM-gate chain table. Its HEADLINE is the weak half of its own work: "the structural asymmetry does not exist" rests on a MENU-SIZE table used to make a POWER claim. Every character in both atlases gains exactly one talent per level from L1 to L10, so nobody "stalls"; a two-level menu plateau is a choice-quality claim the analysis never demonstrates. Its own section 7 then confirms the asymmetry the brief pointed at, in a form it never folds back into the headline: leyline formulas multiply x2.57 at level 6, heroic formulas multiply by 1.00. The correct statement is that the asymmetry is REAL but MISATTRIBUTED - not gate timing (roughly symmetric once measured properly) but formula scaling. The Withering Ray parity failure survives, but the multiple is inflated (3.0x not 3.5x on talent-supplied damage) and narrows further once you count the weapon hit that every heroic damage talent explicitly requires and no Black damage talent does. Nine corrections, two refutations.

### Claims

1. **CONFIRMED** — The dossier's earliest-L applies the rank-3 gate only to colour skills; recomputing for all skills moves 52 of 365 talents and gives heroic trees 5-7 L6 talents vs leyline 4-8. Table of 11 rows.
   - Evidence: Reproduced independently with my own fixpoint solver (connections = OR-group, prose clauses ANDed, any non-colour 'X 3+' = L6). Moved counts 0/3/4/4/5/7/6/6/5/6/6 and trueL6 4/8/7/7/8/7/6/6/5/6/6 match the analysis exactly, as does its dossier-L6 column (White 4, Blue 7, Black 4, Red 5, Green 6, heroic all 0). The JSON confirms the cause: rankGate is populated only for colour prereqs - Devastating Blow shows 'gate=' empty with 'prereq=Combat Training; Athletics 3+' at L2. SYSTEM-PRIMER: 'Tier 1 = levels 1-5, max skill rank 2' is unqualified. 52/365 = 14.2%, matching the analysis's '14% of the corpus'. Deity trees move zero rows.
2. **CONFIRMED** — Named-talent move table: Devastating Blow L2->L6, Wit's End L3->L6, Fatal Thrust L2->L6, Overcharge L2->L6, Foresight L4->L6, Fast Talker/Trickster's Hand L3->L6, Synchronized Assault L5->L6, Turning Point L4->L7, Mercurial Facade L4->L7; plus leyline Extract Thought/Feeding Frenzy/Pack Sense/Natural Recovery/Baleful chains.
   - Evidence: Every row reproduced. My solver also returns the exact downstream drags the analysis names: Composed and Whispered Doubt to L7 and Puppeteer to L8 (Black), Frenzied Tempo to L7 (Red), Apex Predator and Reknit Form to L7 and Vital Surge to L8 (Green), Baleful to L7 (Blue).
3. **CONFIRMED** — Section 2 depth histogram and section 3 menu-size table (<=L3 / <=L5 / <=L8, new talents at L4 and L5).
   - Evidence: Exact match on all 11 rows of both tables. Depth: heroic d0=7 every tree, max depth 3 except Leader 4; leyline d0=4 (White 5), Black and Red reach d5. Menu: Warrior/Envoy/Agent newL4=0 and newL5=0; Hunter/Leader/Scholar newL5=0; Blue and Green newL5=0; White 5/2, Black 2/2, Red 3/1. Depth-3+ counts (White 10, Black 10, Red 10, Green 9, Blue 7 vs Envoy 6, Leader 6, Agent 3, Hunter 3, Scholar 3, Warrior 2) all check out.
4. **CORRECTED** — '76% of the tree available by L3 versus leyline's 57%.'
   - Evidence: Heroic <=L3 counts are 18,19,17,18,18,19 -> mean 18.17/25 = 72.7%, not 76%. Leyline 14,15,14,14,14 -> 14.2/25 = 56.8% = 57% correct.
   - Corrected: 73% of the heroic tree is legal by L3 versus 57% of the leyline tree.
5. **CORRECTED** — 'The felt curve is the REVERSE of the brief's assumption' - heroic stalls at L4-L5 while leyline buys genuinely deeper nodes.
   - Evidence: This is a menu-size table (section 3) carrying a power conclusion. Advancement is 1 talent per level for both atlases at every level 1-10, so a heroic character at L5 owns five talents and a leyline character owns five talents. A larger or smaller menu changes CHOICE quality, not power. The analysis half-concedes this ('the 4th- and 5th-best items from the same L1-L3 menu') but never shows leyline's newly-unlocked d3/d4 nodes beat heroic's 4th/5th picks - section 8's L5 table asserts it without a metric. Meanwhile the analysis's own section 7 shows the one genuine discontinuity runs the OTHER way and supports the brief's premise: every leyline damage/heal formula multiplies x2.57 at L6, every heroic damage formula by 1.00.
   - Corrected: Gate timing is roughly symmetric once measured properly - that part of the brief's premise is refuted. But the leyline-is-back-loaded premise survives via a different mechanism the analysis identifies and then does not credit: leyline numbers step x2.57 at level 6 and heroic numbers do not step at all. The asymmetry is real; its cause was misattributed to gate timing.
6. **REFUTED** — 'Pillar of Order is a depth-0 entry gated at White 3+ ... it makes White's real entry menu three talents, the narrowest in the game.'
   - Evidence: Pillar of Order is d0, White 3+, L6 - the gate half is confirmed. But the 'narrowest in the game' half is false: every leyline tree has exactly 3 purchasable depth-0 talents at L1 once the free Key is removed (Black: Unnerving Approach, Withering Ray, Hollow Command; Blue: Forewarned, Calculated Patience, Phantom Double; Green: Primal Awareness, Verdant Mend, Pack Hunter; Red: Reckless Advance, Searing Bolt, Incite; White: Guiding Signal, Guardian Stance, Terms of Accord). White is TIED at 3, not narrower. It is also not a generic entry - it is a Reaction costing 1 Investiture that only fires when an ally rolls a Complication.
   - Corrected: Pillar of Order is a depth-0 node unreachable until L6, which is an authoring oddity worth a ruling - but White's L1 entry menu is 3 purchasable talents, exactly the leyline norm, not the narrowest in the game.
7. **CONFIRMED** — Section 4 rank-bill table: every heroic tree costs 12 ranks across 4 skills; leyline 5-9 across 2-3.
   - Evidence: Extracted every 'X n+' prereq and took the max rank per skill. White: White 3 + Leadership 2 = 5 (plus Strength 3 attribute). Blue/Black/Red = 6 each. Green = Green 3 + Survival 3 + Medicine 3 = 9. All six heroic trees = 3+3+3+3 = 12 across four distinct skills. Exact.
8. **CONFIRMED** — All six heroic path descriptions grant a free starting skill rank; none of the five leyline descriptions does.
   - Evidence: grep -il 'starting skill' INTENT-*.md returns exactly six files, all heroic. INTENT-heroic-Warrior.md: 'Starting Skill: Athletics. If you choose Warrior as your starting path, gain a free skill rank in Athletics.' INTENT-leyline-Black.md carries no such line and no key-talent sentence.
9. **CORRECTED** — Section 6 economy table (cost-free / Investiture-costers / focus-costers per tree).
   - Evidence: Ten of eleven rows reproduce exactly. Blue is wrong: I count 16 Investiture-costing talents, not 15. The 16th is Counterspell, whose cost field reads '2 Focus; 1 Investiure' - a typo in the source data that the deterministic census's classifier also missed. The verified leyline-Blue profile the analysis was handed already flags this ('the census gives Blue 0 regen / 15 costers (16 in truth; Counterspell's Cost field misspells Investiure so the classifier misses it)'), so this was catchable from its own sources.
   - Corrected: leyline/Blue: 16 Investiture-costers, not 15. It makes Blue's economy slightly worse than the analysis argued, so it strengthens rather than weakens its Blue verdict. Separately: data/leyline.json owes a typo fix on Counterspell's Cost field.
10. **CONFIRMED** — Leyline trees carry exactly one focus-costing talent each in White, Blue and Black and zero in Red and Green, so a leyline mage's focus pool stays free for Dodge/Aid/Reactive Strike.
   - Evidence: Cost-field census: White foc=1, Blue foc=1, Black foc=1, Red foc=0, Green foc=0; heroic Agent 12, Leader 11, Envoy 8, Scholar 7, Warrior 7, Hunter 4. This is the analysis's strongest economic point and it holds.
11. **CONFIRMED** — Four of the corpus's eight focus-restorers are Envoy's.
   - Evidence: Text search for restore/recover/regain focus returns eight genuine restorers: Siphoned Will and Predatory Insight (leyline/Black), Galvanize, Applied Motivation, Inspired Zeal and Lessons in Patience (Envoy), Cold Eyes (Hunter), Cutthroat Tactics (Leader). Agent's Gather Evidence grants the Focused condition, not focus. The brief's own deterministic census (6 producers / 4 trees, Envoy 2) is the thing that is wrong here, not the analysis. The analysis names only three of the four Envoy talents in prose (it omits Inspired Zeal) while stating the count as four.
12. **CONFIRMED** — Eight heroic talents sit behind a GM grant; chains behind them are Leader 8/25, Warrior 6/25, Hunter 4/25, Envoy 4/25, Agent 2/25, Scholar 0/25, every leyline 0/25.
   - Evidence: The eight gated talents are High Society Contacts (Agent, Envoy), Underworld Contacts (Agent), Instill Confidence (Envoy), Animal Bond (Hunter), Authority and Rumormonger (Leader), Shard Training (Warrior); zero in leyline and Scholar. Taint-propagation with AND-of-groups semantics reproduces the per-tree chain counts exactly. Caveat: Bloodstance's prose ANDs 'Shard Training; Mighty' while its connections array ORs them - iron rule 7's third, ungated case. If Foundry honours the connections OR, Bloodstance and Meteoric Leap are reachable via Mighty alone and Warrior's chain is 4/25, not 6/25.
13. **CORRECTED** — Section 7: every leyline formula multiplies by 2.57x at level 6; every heroic damage formula is literally constant from level 2 to level 10; heroic has zero [Tier][Die] scaling anywhere.
   - Evidence: Substance confirmed. (@tier)d(2*rank+2) = 1d6 (3.5) at T1r2 and 2d8 (9.0) at T2r3, ratio 2.571. Devastating Blow (2+max(@tier-2,0))d8 and Wit's End (4+max((@tier-2)*2,0))d6 both have a dead term until Tier 3, i.e. level 11+. Fatal Thrust 4d4 and Deadly Trap 2d4 are literal constants. Scholar's heals are @skills.med.rank / @skills.lor.rank, ratio 1.5. A regex over all 150 heroic descriptions returns ZERO hits for [Tier], [Die] or [Size]; the only tier references are 16 linear '+1 + your tier' style riders. Two arithmetic errors: the three floor(XdY/2) rows are misvalued - floor(1d6/2) averages 1.5 not 1.0 and floor(2d8/2) averages 4.25 not 4.0, so their ratio is 2.83 not 4.00. This propagates to Mending Aura ('= 1.0 at Tier 1' -> 1.5) and Shield Wall. One omission: Scholar has THREE heal formulas (Field Medicine, Swift Healer, Applied Medicine); the table lists two.
   - Corrected: Same conclusion; correct the floor() rows to 1.5 -> 4.25 (ratio 2.83) and add Scholar's Swift Healer as a third heal formula.
14. **CONFIRMED** — Withering Ray: depth 0, L1, 1 Action, 2[Tier][Die] vital = 2d6 (7.0) at T1r2 and 4d8 (18) at T2r3, ignores Deflect, no Investiture cost, no once-per-turn limiter, three casts fit in a Slow turn, and it is the only leyline damage entry that is both double-sized and Investiture-free.
   - Evidence: Text: 'Lose half [Die] health, then make a ranged Black attack vs. Spiritual ... On a hit, deal 2[Tier][Die] vital damage.' Cost field is 'Lose HP = half [Die]' - no Investiture. Formula (2 * @tier)d(2 * @skills.black.rank + 2), type vital. It is the ONLY formula in all 365 with a 2x tier multiplier; every other leyline damage formula is (@tier)d(...) or floor((@tier)d(...)/2). No limiter text. Two footnotes the analysis omits: at Black rank 1 (legal at L1, since the prereq is only Black 1+) it is 2d4 = 5, not 7; and the self-damage is floor(half [Die]) = 1.5 HP per cast at T1 and 2.0 at T2, so three casts a turn costs ~6 HP.
15. **CORRECTED** — 'Roughly 3.5x the heroic ceiling on a Deflect-ignoring damage type' - the parity failure.
   - Evidence: Two problems. (1) Arithmetic: the analysis compares three Black Actions (54 vital) against two Warrior Actions (15). Like for like over one Slow turn it is 54 vs 18 (Devastating Blow 2d8 + Mighty 6 over two Actions, plus a Strike with Mighty 3), i.e. 3.0x, and 18/Action vs 6/Action, also 3.0x. (2) Methodology: 'weapon dice excluded on both sides' is not neutral here. Every heroic damage talent is a rider ON a weapon attack - Devastating Blow 'Make a melee weapon attack vs. Physical, rolling an EXTRA 2d8'; Wit's End 'deals an EXTRA 4d6'; Fatal Thrust 'ADD 4d4 damage'. Every Black damage talent is self-contained (Withering Ray makes its own ranged Black attack; so do Searing Bolt, Flame Surge, Dark Investiture, Sovereign of Solitude). So excluding weapon dice subtracts real output from the heroic side of every comparison and none from Black's. At a plausible 8-9 per weapon hit the Warrior turn is ~35 against Black's 54, ratio ~1.5x. The weapon is genuinely outside the 365-talent fence, which is exactly why section 10 should have listed it and did not.
   - Corrected: Black's Withering Ray line delivers ~3.0x the heroic ceiling on TALENT-SUPPLIED damage per Slow turn, and roughly 1.5x on total turn output once the weapon hit each heroic damage talent explicitly requires is counted. The gap is real, is worst on a Deflect-ignoring damage type, and still makes Withering Ray the single balance outlier - but the headline multiple is inflated by a factor of two.
16. **CORRECTED** — 'From level 2, every Withering Ray carries advantage. Self-fuelling, free, permanent.' (Blood Price) and 'Severance converting all damage to vital.'
   - Evidence: Blood Price: 'When you lose health to activate a Ritual talent, gain an advantage on your NEXT Black test.' The advantage lands on the following test, so the first Ritual activation of a fight is unadvantaged; and advantage is binary, so it is worth exactly zero whenever any other source is already present. Severance: 'Your attacks against ISOLATED characters deal vital damage instead of their normal damage type' - not all damage. Black's own verified profile says the tree 'cannot start' isolation.
   - Corrected: Blood Price advantages every Withering Ray after the first Ritual activation; Severance converts damage type only against Isolated targets (no ally within 5 ft), a state Black cannot create on demand.
17. **CORRECTED** — Section 8's L8 Black turn: three Withering Rays (54 vital) WITH advantage from Blood Price AND +d8 per test from Predatory Patience against the Key's Weakened targets.
   - Evidence: Action-budget double-count. Predatory Patience reads 'When you attack a WEAKENED creature, add [Die] to the test.' The only in-tree source of Weakened is the Black Attunement Key, which fires on Draw Mana - a 1-Action spend. A turn that spends all three Actions on Rays cannot also have Drawn Mana that turn, and Weakened has no stated duration in the Key text. The turn also silently drops ~6 HP of self-damage, and Sanguine Reservoir caps Reserve at ranks in Black (3) and converts it to Investiture, not back into health.
   - Corrected: The realistic L8 Black turn is either 3 Rays for 54 vital with no Predatory Patience bonus, or Draw Mana + 2 Rays for 36 vital with the +d8 and the Investiture refund - not both. Either way it is still the largest talent-supplied damage turn in the eleven trees.
18. **CORRECTED** — 'Erudition alone is worth two skill ranks - a whole level's skill budget - free, forever, and reassignable, which is more than any leyline Key.'
   - Evidence: Verbatim text: 'TEMPORARILY gain a cultural or utility expertise and a rank in two NON-INVESTED COGNITIVE skills. Reassign these after a long rest with library access.' Two restrictions the analysis drops: the ranks go only into cognitive skills you have no investment in, and they are temporary/reassignable rather than 'free, forever'. Critically, they cannot advance the four skills Scholar's own 12-rank bill demands past rank 1, so they do not offset section 4's rank-bill gap the way the analysis implies.
   - Corrected: Erudition grants an expertise plus rank 1 in two cognitive skills you have not invested in, reassignable after a long rest. It is a genuinely strong Key, but it is not a level's worth of skill budget and it cannot pay any part of Scholar's rank-3 bill.
19. **CORRECTED** — 'Agent's Quick Analysis / Fast Talker / Trickster's Hand each convert 2 focus into 2 Actions as a Free Action - the best conversion rate in the game.'
   - Evidence: Quick Analysis verbatim: 'Spend 2 focus to gain 2 actions for COGNITIVE TESTS with Use a Skill, Gain Advantage, or an Agent talent.' These are restricted Actions - they cannot Strike, cannot Move, cannot pay for another path's Action-cost talent that is not a cognitive test. Presenting them as '2 Actions' alongside the leyline atlas's 'essentially none' overstates the offset.
   - Corrected: Agent's three Free-Action grants buy 2 RESTRICTED Actions for 2 focus - cognitive tests via Use a Skill, Gain Advantage, or an Agent talent only.
20. **CORRECTED** — 'Tagging Shot ... is also one of only four 3-Action talents in the eleven trees, and the leyline guide's own benchmark table sets 3-Action at 0%.'
   - Evidence: The count is right: exactly four 3-Action talents outside deity - Tagging Shot (Hunter, d0), Close the Case (Agent, d3), Grand Deception (Leader, d3), Synchronized Assault (Leader, d4); zero in all five leyline trees. But DESIGN-GUIDE-CLAIMS.md line 30 shows the same row as 'Heroic 2% | Radiant 1% | TARGET Leyline 0%' - the 0% is the target for LEYLINE trees, and the guide records official heroic paths at 2%. Holding a Hunter talent to leyline's 0% target is a category error.
   - Corrected: Tagging Shot is one of only four 3-Action talents outside deity, all heroic. Judge it against the guide's observed heroic rate of 2% (Hunter is at 4%), not against the 0% leyline target - the substantive criticism, that a 3-Action ENTRY node duplicates what the free Key does as a Special, stands on its own.
21. **CONFIRMED** — Exclusivity claims: Cheap Shot is the only Stun in 365; Opportunist is the only plot-die reroll; Reknit Form is the only Injury removal; Foresight is one of only two extra-Reaction grants; Counterspell is the only talent-activation interruption.
   - Evidence: Full-corpus text search. Stunned: 3 hits, and only Cheap Shot APPLIES it (Natural Recovery and Devoted Presence remove it). Plot-die reroll: Opportunist only (Watchful Eye extends it to an ally; Double Down extends it again; Chaos's Shatter Focus is a test reroll, not a plot die). Injury removal: Reknit Form only (Ongoing Care removes a condition CAUSED BY an injury). Extra reaction: Foresight (unconditional) and Hunter's Sidestep (conditional, Dodge only, no-armour). Counterspell: sole hit. NARROWING the analysis missed on the last one - Counterspell fires only 'When a character within Attunement Range SPENDS INVESTITURE to activate a talent', so it is inert against all six heroic paths, which spend focus and never Investiture. Section 8 lists it as one of Blue's three 'teeth' without that caveat.
22. **CORRECTED** — Section 5(b): leyline Keys are 'a Passive rider on Draw Mana, an Action you must spend' while heroic Keys are 'a real talent you activate'; verdict heroic Keys are worth materially more.
   - Evidence: The framing cuts both ways and the analysis only shows one side. Three of the six heroic Keys cost an action EVERY use - Rousing Presence is a 1-Action, Decisive Command is 1 Action PLUS 1 focus, Vigilant Stance is a 1-Action mode entry; only Opportunist, Erudition and Seek Quarry are Specials. The leyline riders are free on an Action the mage has to spend anyway to have any Investiture at all. Red's Key is still correctly identified as a net negative ('lose your Reaction until your next turn'). Separately, a data divergence inside the Key the analysis prices: INTENT-leyline-Black.md says 'enemies within range with no ally within 10 ft become Weakened' while the talent text and SYSTEM-PRIMER both say 5 feet.
   - Corrected: Heroic Keys are worth more on average, but not because leyline Keys ride a spent Action - Draw Mana is spent regardless. The honest comparison is: three heroic Keys are free-on-a-Special (Opportunist, Erudition, Seek Quarry) and beat every leyline Key; three cost an Action or an Action plus focus every use and are closer to a wash. And the Black key has a 5ft-vs-10ft divergence between its talent text and its path description that owes a fix.

### What the analysis missed

- The weapon-dice exclusion is asymmetric: heroic damage talents are riders on a weapon attack ('rolling an extra 2d8', 'deals an extra 4d6', 'Add 4d4 damage'), leyline damage talents are self-contained. This belonged in section 10 and was not listed.
- Withering Ray's self-damage is dropped from the section 8 turn maths: floor(half [Die]) = ~1.5 HP per cast at Tier 1 and ~2.0 at Tier 2, so three casts a turn costs ~4.5-6 HP against a 10+STR pool. Sanguine Reservoir caps Reserve at ranks in Black and converts it to Investiture, not back into health.
- The section 8 L8 Black turn double-counts the action budget: Predatory Patience's +[Die] needs Weakened, whose only in-tree source is the Key's Draw Mana - a 1-Action spend that cannot happen in a turn spending all three Actions on Rays.
- At Black rank 1 (legal at L1, since the prereq is only Black 1+) Withering Ray is 2d4 = 5, not 7. Every section 8 L3 number assumes rank 2 is already bought.
- Erudition's restriction to 'two NON-INVESTED COGNITIVE skills', temporary and reassignable - which is why it cannot pay any part of Scholar's own rank-3 bill.
- Quick Analysis grants 2 RESTRICTED Actions (cognitive tests via Use a Skill, Gain Advantage, or an Agent talent), not 2 general Actions.
- Three of the six heroic Keys cost an Action every use (Rousing Presence, Vigilant Stance, and Decisive Command at 1 Action + 1 focus); only Opportunist, Erudition and Seek Quarry are Specials. The section 5(b) framing prices only the leyline side's action cost.
- Fatal Thrust reads 'gain TWO advantages if the weapon is Discreet' - per SYSTEM-PRIMER two advantages fold to one. A designer-visible instance of the binary-advantage bug sitting inside one of the three heroic damage talents the analysis benchmarks.
- The three floor(XdY/2) formula rows are misvalued (1.0 and 4.0 instead of 1.5 and 4.25, ratio 2.83 not 4.00), which propagates into the Mending Aura and Shield Wall valuations.
- Scholar has three heal formulas, not two - Swift Healer is missing from the section 7 table.
- The skill-rank budget gate (12 ranks across four skills cannot all be at rank 3 by level 6) is computed in section 4 and never folded into the trueL model, understating heroic's real gating.
- Bloodstance's prose/connections prerequisite divergence, and the 5ft-vs-10ft divergence between the Black Attunement talent text and its own path description.

### Surviving findings, in priority order

1. THE MEASUREMENT FIX, and it is the most valuable thing in the analysis: derive-dossiers.js sets rankGate only for the five colour skills, so every non-colour 'X 3+' prerequisite is reported 2-4 levels early. 52 of 365 talents (14.2%) are mis-timed, every heroic tree carries 5-7 level-6 talents that the dossier reports as zero, and every profile that used the earliest-L column for pacing inherited the error. Independently reproduced cell for cell. Fix: treat any '<skill> 3+' clause as a level-6 gate.
2. THE ASYMMETRY IS REAL BUT MISATTRIBUTED. Gate timing is roughly symmetric once measured properly (heroic 5-7 L6 talents vs leyline 4-8), which refutes the brief's stated premise. But the leyline-is-back-loaded intuition survives via a different mechanism the analysis proves in section 7 and then does not let revise its own headline: every leyline damage and heal formula multiplies x2.57 at level 6 ((@tier)d(2*rank+2): 1d6 -> 2d8) and every heroic damage formula multiplies by 1.00 (Devastating Blow's and Wit's End's tier terms are dead until Tier 3, i.e. level 11). Zero occurrences of [Tier]/[Die]/[Size] in any of the 150 heroic descriptions.
3. WITHERING RAY IS THE PARITY FAILURE, at a corrected magnitude. Depth 0, level 1, 1 Action, 2[Tier][Die] vital = 2d6 at T1r2 and 4d8 at T2r3, ignoring Deflect, no Investiture cost, no once-per-turn limiter, three casts per Slow turn. It is the ONLY formula in all 365 talents with a 2x tier multiplier. Corrected multiple: 3.0x the heroic talent-damage ceiling per Slow turn (54 vs 18), not 3.5x, and ~1.5x on total turn output once the weapon hit that Devastating Blow, Wit's End and Fatal Thrust each explicitly require is counted. The analysis's three proposed fixes still apply; (b)+(c) - cut to [Tier][Die] and add 1 Investiture - remains the right pick, because it is the only leyline damage entry that is both double-sized and free.
4. METHODOLOGICAL BIAS THE ANALYSIS INTRODUCED AND DID NOT FLAG: 'weapon dice excluded on both sides' is not symmetric. Every heroic damage talent is an EXTRA-damage rider on a weapon attack the talent itself makes; every leyline damage talent is self-contained. The exclusion therefore subtracts real output from one side of every comparison in sections 8 and 9. Weapons are outside the 365-talent fence, so this belonged in section 10's list of unsettleable questions and was omitted.
5. SECTION 3 IS A MENU-SIZE TABLE CARRYING A POWER CONCLUSION. Advancement is 1 talent per level for both atlases at every level 1-10, so no one 'stalls' at L4-L5; the plateau is in choice, not in power. The claim that leyline's L4-L5 nodes beat heroic's 4th and 5th picks is asserted in section 8 and never measured. (Corrected sub-figure: 73% of the heroic tree is legal by L3, not 76%; leyline's 57% is right.)
6. THE TWO STRUCTURAL GAPS UNDER THE DESIGNER'S CONTROL, both confirmed verbatim: (a) all six heroic path descriptions grant a free starting skill rank and none of the five leyline descriptions does (grep 'starting skill' returns exactly six files, all heroic); (b) every heroic tree costs 12 ranks across 4 skills to fully unlock against leyline's 5-9 across 2-3, and leyline's ranks are quadruple-dipped (prerequisite, test skill, [Die] size, Attunement Range). Both reproduce exactly.
7. WHAT THE ANALYSIS MISSED THAT STRENGTHENS ITS OWN CASE: it never folds the skill-rank BUDGET into trueL. At 2 ranks per level, no heroic tree can be fully unlocked at level 6 - 12 ranks across four skills is six levels of skill budget - so heroic's effective gating is worse than its own recomputed trueL says. The leyline colour rank, by contrast, is bought anyway because it is also the test skill and the die size.
8. BLUE'S ECONOMY IS ONE TALENT WORSE THAN REPORTED: 16 Investiture-costers, not 15. The 16th is Counterspell, whose Cost field in the source data misspells 'Investiure', which is why both the deterministic census and the analysis missed it. Two repo actions: fix the typo in data/leyline.json, and note that the verified leyline-Blue profile the analysis was handed already carried the correct figure.
9. COUNTERSPELL IS INERT AGAINST HALF THE COMPARISON. It triggers only when a character 'spends Investiture to activate a talent'. No heroic path spends Investiture - all six run on focus - so Blue's signature counter cannot touch Warrior, Agent, Envoy, Leader, Scholar or Hunter at all. Section 8 lists it among Blue's three 'teeth' without that caveat, which makes Blue's L6+ case weaker still.
10. TWO DATA DEFECTS FOUND IN PASSING, both worth rulings: (a) Bloodstance's prose ANDs 'Shard Training; Mighty' while its connections array ORs them - iron rule 7's third, ungated case, and it changes Warrior's GM-gated chain count from 6/25 to 4/25 depending on which Foundry honours; (b) INTENT-leyline-Black.md states the Draw Mana rider as 'no ally within 10 ft' while the Black Leyline Attunement talent and SYSTEM-PRIMER both say 5 feet.
