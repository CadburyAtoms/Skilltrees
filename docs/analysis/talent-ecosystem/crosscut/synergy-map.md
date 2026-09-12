# Cross-path synergy map

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `synergy-map`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

I have everything I need. Writing the analysis.

# Cross-path synergy map — the 365 Edha talents

**Bottom line up front.** There are exactly three things in this game that combine across paths, and only one of them was designed on purpose.

1. **Numeric bonuses stack without limit and nothing caps them.** Ten trees add flat/dice bonuses to *someone else's* roll or damage, all additively. This is the real synergy layer and no design document mentions it.
2. **Advantage — which 45 talents in 13 trees grant — has no consumer anywhere in the atlas.** Not "over-produced": *terminal*. I checked all 48 ledger entries and every one of the four apparent "consumers" is keyed on the **Gain Advantage action**, not on holding an advantage. Zero talents in 365 pay you for having one.
3. **The two atlases run on non-overlapping currencies** and touch at exactly one point, which is broken. All 150 heroic talents contain **one** mention of Investiture (Hunter's `Sharp Eye`, read-only). All 90 deity talents contain **zero** mentions of focus, **zero** of Draw Mana, and one of Opportunity.

The designed synergy — the deity two-colour gate — works properly in **four** of ten trees, is thematically-but-not-mechanically paid in **three**, and is dead in **three**. The gate audit's five "toll booths" are not the right five.

---

## PART 0 — Corrections to the deterministic layer

Three errors in the inputs, all load-bearing.

### 0.1 There is a ninth sealed loop, and the census misses it because of the third classifier bug you predicted

`resource-economy.json` rates **Charge** "balanced-ish — 2 producers / 2 consumers in 2 trees", the second consumer tree being `heroic/Warrior → Shattering Blow`. That is a name collision, not a consumer:

> Shattering Blow: "spend 2 focus to **deplete 1 charge from their armor**"

Those are **Shardplate armour charges** (minted by Warrior's `Shard Training`: "Your Shardplate has 2 additional charges"), not deity/Destruction's placed explosive Charge. Nothing outside deity/Destruction reads a Destruction Charge. **Charge is sealed loop #9.**

### 0.2 The census enumerates 8 sealed loops; the true count of single-tree tokens is 21

The census only counted tokens someone thought to name. Adding the ones it never looked for, every named resource/token in the game and its reach:

| Token | Tree | Any reader outside that tree? |
|---|---|---|
| Omen | Chaos | No |
| Quarry | Hunter | No |
| fabrial | Scholar | No |
| Harvested Remain | Death | No |
| Ordained Ground / Snare / Hexmark | Fate | No |
| Edict / Covenant / Witness / Concord | Order | No |
| damage die size | Sovereignty | No |
| **Charge / Pinpoint Charge** | Destruction | **No (corrected)** |
| **Insight** | Knowledge | **No** |
| **Diagnosed / Mutation** | Life | **No** |
| **Combat Construct / Foundation** | Civilization | **One, and it's hostile** — Destruction's `Fault Line`: "structures and **Constructs** along the line take **triple damage**" |
| **Accord** | White | **No** |
| **Reserve** | Black | **No** |
| **Telepathic Network** | Blue | **No** (its only reader is Blue's own `Anticipate`) |
| **Stance** | Warrior | **No** |
| **Erudition** | Scholar | **No** |
| **command die** | Leader | **No** |
| **"Bounty"** | Power | Not even a *tree* loop — produced and consumed entirely inside one talent, `Warlord's Fury` |
| dangerous terrain | Destruction | **Yes** — `Surefooted` (Agent/Hunter/Warrior) mitigates it |
| difficult terrain | Green (+3 producers) | **Yes, but ownership-bound** — see §4.8 |
| **Determined** | White + Envoy | **Yes — the only genuine cross-tree token pair in the atlas.** See §4.11 |

**Of ~21 named tokens, exactly one (Determined) has a producer in one tree and a consumer in a different tree.** Every homebrew resource the deity guide calls "the spine of the tree" is a spine that connects to nothing else.

### 0.3 The dossier's `earliest L` column understates 41 gates, most of them heroic

The structural fact in your brief — "heroic paths carry no leyline-colour rank gate, so their whole tree is reachable by ~L4-L5" — is false in the direction that matters for combos. **41 talents carry a rank-3 *skill* prerequisite (Deduction 3+, Intimidation 3+, Perception 3+…) but are labelled earliest L2–L5.** Rank 3 needs level 6. 36 of the 41 are heroic:

Agent 7 · Envoy 6 · Hunter 6 · Leader 5 · Scholar 6 · Warrior 6 · leyline 5 (Black `Extract Thought`, Blue `Baleful`, Green `Natural Recovery` + `Pack Sense`, Red `Feeding Frenzy`).

(White's `Shared Burden` is a 42nd hit but gates on **Strength** 3+ — an attribute, not a skill — so it escapes the rank cap. Excluded.)

Consequences for this analysis specifically: **Envoy's `Foresight` is L6, not L4** (Discipline 3+). **Warrior's `Wit's End` is L6, not L3** (Intimidation 3+). **Scholar's `Turning Point` is L6, not L4** (Deduction 3+). **Hunter's `Pack Hunting` is L6, not L3** (Perception 3+). Four of the strongest cross-path pieces in the game all land on the same level as the leyline rank-3 discontinuity, which is a bigger deal for question 2 than for question 4 but I'm flagging it here because it re-dates half my combo table.

---

## PART 1 — The mechanical-keyword graph

### 1.1 The two atlases share one currency and it is broken

Computed from the `cost` field of all 365 talents:

| Tree | Investiture-costed talents / total Investiture | focus-costed / total focus | Opportunity-costed |
|---|---|---|---|
| leyline/White | 15 / 18 | 1 / 2 | 2 |
| leyline/Blue | 15 / 17 | 1 / 2 | 1 |
| leyline/Green | 13 / 14 | 0 | 2 |
| leyline/Black | 9 / 11 | 1 / 2 | 1 |
| leyline/Red | 9 / 10 | 0 | 3 |
| **all 6 heroic trees** | **0 / 0** | 49 / 74 | 1 |
| **all 10 deity trees** | 72 / 121 | **0 / 0** | **1** |

- **Heroic → Investiture: one read-only mention in 150 talents** (Hunter's `Sharp Eye`: "learn… if their health, focus, or Investiture are below half").
- **Deity → focus: zero mentions in 90 talents.**
- **Deity → Draw Mana: zero mentions in 90 talents**, despite every deity tree spending 10–15 Investiture to deploy against a starting pool of ~4 and eight of ten producing none.
- **Deity → Opportunity: one talent** (`Momentum of Victory`). **Deity → plot die: one clause** (Fate's `Thread of Inevitability` may name "the GM raises the stakes" as its declared event).

So a leyline/deity character who multiclasses heroic does not gain synergy; they gain a **second, hermetically separate resource pool and a second kit that never touches the first**. That is not nothing — it is genuine anti-fragility, since a leyline character at 0 Investiture can still play their heroic half — but it is parallel play, not combination.

### 1.2 Opportunity — the one shared currency, and the largest broken seam in the game

**Ten talents in the leyline and deity atlases cost an Opportunity. Those two atlases produce zero Opportunity.**

| Consumer | Tree | Depth / L | What it buys |
|---|---|---|---|
| `Mending Aura` | White | 4 / L5 | half [Tier][Die] health to **every** ally in [Size] |
| `Collective Resolve` | White | 3 / L4 | Determined to **all** allies in Attunement Range |
| `Probability Cascade` | Blue | 3 / L4 | disadvantage on a creature's next **two** tests |
| `Sudden Growth` | Green | 3 / L6 | difficult terrain at a character you can sense |
| `Natural Recovery` | Green | 2 / L6 | strip Afflicted / Disoriented / Stunned / Weakened |
| `Afterburn` | Red | 4 / L6 | Afflicted[half [Tier][Die] energy] |
| `Reckless Momentum` | Red | 4 / L5 | roll the Plot Die on your next test |
| `Reckless Gambit` | Red | 3 / L6 | grant advantage; target becomes Exhausted[-2] |
| `Predatory Insight` | Black | 2 / L3 | advantage on Deception + 1 focus on any 0-focus event |
| `Momentum of Victory` | Power | 1 / L2 | free 15 ft move + melee Strike, +tier damage |

Per the canon reference (`cosmere-canon-reference` §plot die, §Opportunity, SR p.8–9), an Opportunity comes from exactly two places: **the plot die landing on Opportunity, which only happens when someone raises the stakes**, or **rolling within your Opportunity range on the d20 (default: natural 20)**.

Producers of *either*, across all 365:

- **raise the stakes** — 9 talents, 4 trees: White ×3 (`Guiding Signal`, `Concordant Presence`, `Unity of Purpose`), Agent ×4 (`Get 'Em Talking`, `Risky Behavior`, `Cheap Shot`, `Subtle Takedown`), Leader ×1 (`Cutthroat Tactics`), Scholar ×1 (`Overcharge`).
- **Opportunity range expansion** — 4 talents, 2 trees: Warrior `Signature Weapon` (+1, one weapon expertise), Warrior `Bloodstance` (+2, all attacks and physical tests, at −2 to all three defences), Scholar `Efficient Engineer` (+2) and `Experimental Tinkering` (+1) — **crafting only**.
- **direct Opportunity grants** — 5 talents, 3 trees, all narrowly scoped: Agent `High Society Contacts` / `Underworld Contacts`, Envoy `High Society Contacts`, Leader `Well Supplied` / `Rumormonger`. Every one is social or logistical: *"add Opportunity to a test to interact in high society"*, *"to requisition resources"*, *"to spread misinformation"*. **None of them works on an attack or a leyline talent.**
- **the one true converter** — Agent `Sure Outcome` (depth 0, L1, Special, 2 focus): *"When you use Opportunist, spend 2 focus to change Opportunity to Complication 4, **or any Complication to Opportunity**."*

**Therefore:** without a heroic/Agent, a heroic/Warrior in Bloodstance, or a leyline/White marshal in the party, all ten talents above fire on a natural 20. That is roughly once per twenty tests. `Afterburn` is Red's depth-4 capstone-adjacent talent; `Mending Aura` is White's depth-4 heal; `Natural Recovery` is Green's only condition-strip. Three trees' late-game payload is gated on a currency their entire atlas cannot make.

### 1.3 Conditions: only three of twelve are wired as anything

I grepped all 365 for talents that *require* a condition on the target (not merely apply one):

| Condition | Producer talents / trees | Talents that REQUIRE it |
|---|---|---|
| **Weakened** | Black Key + `Sapping Hex`; Order `Sealed Edict`; Power `Absolute Authority` (on failure) — **3 trees** | **7 talents, 3 trees:** Black `Spoils of Isolation`, `Predatory Patience`, `Dread Presence`, `Sovereign of Solitude`; Death `Consuming Decay`; Power `Kneel` (advantage clause), `Absolute Authority` |
| **Isolated** | Black `Unnerving Approach`, `Dread Presence`; Chaos `Isolating Pressure`, `Isolating Ruin` — **2 trees** | **4 talents, 2 trees:** Black `Sapping Hex`, `Severance`, `Cruel Step`; Chaos `Unravel Everything` |
| **Surprised / "unsuspecting"** | Hunter `Startling Blow`, Agent `Mercurial Façade` | Hunter `Fatal Thrust`, Agent `Subtle Takedown` |
| Disoriented | **14 talents, 11 trees — the most-produced condition in the game** | **ZERO**, cross-tree or otherwise. (Envoy's `Calm Appeal` reads only the Disoriented its own `Steadfast Challenge` applied.) |
| Prone | 7 talents, 6 trees | ZERO |
| Restrained | Green `Grasping Vines`, Fate `Snare` | ZERO |
| Slowed | 6 talents, 6 trees | ZERO |
| Stunned | 3 talents, 3 trees | ZERO |
| Afflicted[X] | 5 talents, 5 trees | ZERO |
| Compelled / Frightened | Power ×2 / **nothing produces Frightened** | Power ×2 (in-tree) |
| temporary HP | 14 talents, 9 trees | ZERO |
| disadvantage | 14 talents, 9 trees | ZERO, and binary anyway |

**Weakened is the best-connected mechanical object in the game** — three producer trees, five consumer trees, spanning both atlases — and it is produced *free, with no action, by the Black Attunement Key*. That single line is the load-bearing joint of the whole ecosystem. See §3.1.

**Disoriented is the exact opposite**: 11 of 21 trees make it and nothing in the game cares that a target has it beyond the condition's own text. If you want a cheap lever to create cross-path combination, "when you damage a Disoriented target…" riders would light up eleven trees at once.

### 1.4 The numeric-bonus layer — the thing that actually stacks

Per SYSTEM-PRIMER, advantage folds by boolean-OR. **Flat and dice bonuses do not.** Everything in this table adds to another character's roll or damage, and none of it is capped by any rule I can find in the 365:

| Talent | Tree | Adds to an ally's… |
|---|---|---|
| `Decisive Command` → `Confident`/`Shrewd`/`Demonstrative Command` | Leader | one die roll: **d4 → d10** |
| `Shared Conviction` | White | a failing test: **+White modifier** (Reaction, 2 focus + 1 Inv) |
| `Bound by Word` | White | *substitutes* your White modifier for theirs on accord tests |
| `Pack Sense` | Green | attack vs. a target in your difficult terrain: **+Green modifier** |
| `Pack Hunting` | Hunter | attack **or damage** vs. your quarry: **+ranks in Survival** |
| `Battle Fever` | Red | you and all allies, next test: **+1 (max = Rank)**, on *any* damage in range |
| `Feeding Frenzy` | Red | same, on enemy-attacks-enemy |
| `Coordinated Hunt` | Green | damage: **+number of distinct attackers this round (max Rank)** |
| `Pack Pressure` | Green | adjacent-Strike damage: **+[Tier][Die]** |
| `The Pack` | Knowledge | every ally's attacks on the marked creature: **+Insight (up to 5) Vital** |
| `Pack Share` | Knowledge | every ally's attacks on the marked creature: **+Tier Vital** |
| `Vital Diagnosis` | Life | you and every ally vs. the Diagnosed creature: **+Tier Vital** |
| `Hexmark` | Fate | **+[Tier] keen every time it takes damage from any source** |
| `Concord` | Order | each Covenant ally's first attack per round: **+Presence** |
| `Mantle of the Aspirant` | Power | allies in range: **+1 to all tests** |
| `Terms of Accord` | White | **+1** to tests pursuing the objective, for the scene |
| `Exalt` / `Investiture of Authority` / `Sovereign's Balance` / `Sovereignty` | Sovereignty | ally's damage **die size +1 or +2 steps** |

**A single ally attack against a single enemy can legally carry:** a d10 command die (Leader) + Green modifier (Pack Sense) + ranks in Survival (Pack Hunting) + Rank (Battle Fever) + 1 (Mantle) on the roll; and +Insight Vital (Knowledge) + Tier Vital (Life) + Tier keen (Hexmark) + Presence (Concord) + one die-size step (Exalt) on the damage. Nine different trees, all additive, no cap.

Meanwhile that same character can be handed advantage by five talents and only one of them counts.

**This is the answer to question 4 in one sentence: the game's synergy lives entirely in a numeric layer nobody documented, while the layer everybody wrote talents for (advantage) is inert.**

### 1.5 The advantage inversion, verified against the ledger

I re-classified all 48 ledger entries. `resource-economy.json` names 7 "consumers" in 5 trees. Reading the text:

| Claimed consumer | What it actually reads |
|---|---|
| Envoy `Practical Demonstration` | *"When you **Gain Advantage** or hit with an attack…"* — the **1▶ standard action** |
| Envoy `Guiding Oration` | *"After you **Gain Advantage**…"* — the action |
| Scholar `Strategize` | *"After you **Gain Advantage** using an Erudition skill, grant that advantage to an ally instead"* — the action, and it **transfers** rather than consumes |
| Scholar `Keen Insight` | *"After you **Gain Advantage**…"* — the action |
| Red `Emotional Overload` | **punishes** an advantage |
| Green `Natural Order` | **denies** advantage gained from deception |
| Fate `Bulwark Ground` | **denies** attackers advantage against your ally |

**Zero of seven read the advantage state as an input.** The system has two different things spelled the same way: the **state** (binary, produced 45 times) and the **action** (`Gain Advantage`, 1▶, available to every character with no talent at all). Six talents key on the action. Nothing keys on the state.

The corollary is a real combo, and it is the opposite of the one you'd guess — see §3.6.

---

## PART 2 — The deity gate, tree by tree: does the colour get paid?

The mechanical half is done (which colour is tested, which sizes a die). Here is the half a regex cannot do: **does owning that colour's leyline tree, and holding its free Attunement Key, change how the deity tree plays?**

The five Attunement Keys are the crux. They are free, always-on, cost no action, and are granted with the path — so **every deity character holds two of them**, and one of them charges rent.

> White: allies in range regain Health = tier · Blue: advantage on next Cognitive test · **Black: enemies in range with no ally within 5 ft become Weakened** · **Red: advantage on next Physical test; lose your Reaction until your next turn** · Green: create difficult terrain within [Size]

### VERDICT TABLE

| Deity | Gate | Colour A verdict | Colour B verdict |
|---|---|---|---|
| **Power** | Black 2+ / Red 2+ | **PAID IN FULL** — Black Key is the tree's engine | PAID (Red rank sizes 2 formulas) but **taxed** |
| **Death** | Black 2+ / Green 2+ | **PAID IN FULL** — Black Key unlocks `Consuming Decay` | **PAID** — Green rank sizes `Bone Garden`; Green Key + `Thorn Field` |
| **Chaos** | Blue 2+ / Black 2+ | **PAID** — Blue Key buffs the Blue-vs-Cognitive tests | **PAID IN FULL** — Chaos *applies* Isolated, Black *monetises* it |
| **Order** | Blue 2+ / White 2+ | **PAID** — 4 Blue formulas, 2 Blue DCs | **PAID — the gate audit is WRONG.** See below |
| **Civilization** | Red 2+ / White 2+ | PAID (2 formulas, 2 DCs) but **taxed** | **THEMATICALLY PAID** — Foundations manufacture White's adjacency |
| **Fate** | White 2+ / Green 2+ | **THEMATICALLY PAID** — see below | PAID (3 formulas, 1 DC) + Green Key |
| **Destruction** | Blue 2+ / Red 2+ | **NEAR-DEAD** — Blue sizes exactly one formula | PAID (5 formulas, 2 DCs) but **taxed** |
| **Life** | Blue 3+ / Green 3+ | **NEAR-DEAD** — Blue is tested once, by a talent that itself gates Blue 3+ | **PAID IN FULL** — Green rank sizes all five heals |
| **Knowledge** | Red 3+ / Green 3+ | PAID (3 formulas, 2 tests) | **DEAD** — the harshest gate in the atlas buys nothing |
| **Sovereignty** | Black 3+ / White 3+ | PAID (3 tests) | **DEAD, AND THE DESIGN DOC KNOWS IT ISN'T** |

### The three the audit got wrong

**Order's White 2+ is not a toll booth.** `deity-Order.md` uses `ranks in White` **three times**, and they are the entire magnitude of the tree's protective half:

- `Bear Witness` (depth 1, L2, free Passive): *"each ally in a Covenant with you within Attunement Range gains temporary HP equal to your **ranks in White**"* — at the start of **every round**, to **every** Covenant ally, for the scene.
- `Shoulder the Oath` (depth 1, L2, Reaction, free): *"take half that damage instead and reduce the remaining damage to that ally by your **ranks in White**. Both you and that ally gain temporary HP equal to your **ranks in White**."*

At White 2 that is 2 temp HP per ally per round plus a −2/+2/+2 Reaction; at White 3 it is 3/−3/+3/+3. The gate audit's script only looked for *tests* and *die sizes*, so it read `ranks in White` as decoration. It is the opposite: White rank is the only scaling input the Covenant branch has. **Order is a false positive. Remove it from the toll-booth list.**

**Civilization's White 2+ is thematically paid, mechanically thin.** One talent uses it — `Bonds of Community`: *"temporary HP equal to your **White**"* — and that talent needs a character to drop to 0 HP inside a Foundation, which is a rare trigger. But the *play* payoff is real and large: `Lay Foundation` is a **10 ft square**, i.e. a 2×2 grid holding four adjacent allies, sustained up to your tier, for 1 Investiture as a **Free Action** at level 1. That is precisely the ally-adjacency that leyline/White's entire Bulwark specialty demands and cannot produce for itself:

- `Guardian Stance` (depth 0, L1, free Passive): +1 Deflect to you and any adjacent ally
- `Shield Wall` (depth 3, L4, free Passive): two or more allies adjacent to you → attacks against them deal **half [Tier][Die] less damage** (~3 at Tier 1, ~4.5 at Tier 2)
- `Unyielding Accord` (depth 4, L5): allies gain +1 Cog/Spir **while adjacent to another ally**
- `Interposing Shield`, `Retributive Guard`, `Shared Burden`: all require adjacency or 10 ft

A Civilization disciple who spends four talents in White converts a Free Action into a permanent formation buff. **The White gate is repaid, but only if the player buys further into White — the deity tree itself doesn't pay it.** That distinction matters: the gate charges 2 ranks up front and the refund is optional.

**Fate's White 2+ is the weakest of the three "thematically paid" cases.** White appears **zero** times in Fate's nine talents — no test, no die, no modifier. The play argument is the same as Civilization's but weaker, because `Ordained Ground` places **5 ft** squares, one creature each. You need two adjacent squares (tier 2, i.e. L6) before two allies stand adjacent. Against that, the thematic fit is exact — `Ordained Ground` grants +1 to all defenses and **Aid at 30 ft range**, which is White's Coordination specialty verbatim, and `Weave the Thread` grants Aid as a **Free Action**, which combos into White's `Unity of Purpose` ("when **two or more allies aid the same test**, raise the stakes") — the only talent in the game that converts Aid into a plot die. **Fate + White is a genuine engine, but you have to build it; the gate does not hand it to you.**

### The two that are genuinely dead

**Knowledge's Green 3+ is the worst gate in the game.** Green is never tested, never sizes a die, never supplies a modifier, never appears. And it is **rank 3**, meaning level 6 and six skill ranks across two colours before the tree is complete. Two of Knowledge's nine talents (`Pack Share`, `Killing Blow`) are individually gated at rank 3 — so a Knowledge character reaches five of nine talents at L1–L3 and then waits three levels for a colour that does nothing. The play argument is thin: Green's `Pack Sense` (+Green modifier when an ally attacks a target in your difficult terrain) stacks with Knowledge's `The Pack` (+Insight Vital from every ally) on the same ally attack — but that requires the Knowledge disciple to *also* buy Green's terrain line, and Knowledge is a single-target amplifier for which terrain does nothing.

**Sovereignty's White 3+ is dead and the deity guide says the opposite.** White appears zero times in nine talents. The Black Key's Weakened output is consumed by **no** Sovereignty talent. And the guide's own text reads:

> "**Black tests for diminish; White tests for elevate.** This is the cleanest example of the color-thematic test rule."

The tree tests Black three times (`Censure`, `Decree of Ruin`, `Edict of the Fallen`) and White zero times. `Exalt`, `Investiture of Authority`, `Sovereign's Balance` and `Sovereignty` — the entire elevate half — contain no test at all. The rule the guide holds up as its cleanest example is implemented in exactly half. Combined with the missing **Decree** radius (both intent sources promise a zone; all nine talents are single-target), Sovereignty is the tree where stated design and shipped talents diverge most, and its gate is a pure 6-rank toll for a nine-talent tree.

**Life's Blue 3+ deserves a mention** the audit missed for the opposite reason. Blue *is* tested — once, by `Surgical Precision`, which itself carries the Blue 3+ gate. So the tree's entry gate of Blue 3+ buys one talent that already gates itself. Everything else in Life scales on Green. It is a near-toll-booth that escaped the list on a technicality.

### Corrected toll-booth list

**Genuinely dead: Knowledge/Green 3+, Sovereignty/White 3+.**
**Near-dead: Destruction/Blue 2+ (one formula), Life/Blue 3+ (one self-gating test).**
**Alive but only if you spend more talents in the colour: Civilization/White 2+, Fate/White 2+.**
**False positive — remove: Order/White 2+.**

Four of the five in the census were White. **Two of them are alive.** The real White problem is narrower and worse: White is charged by four deity trees, and only in Order does the deity tree itself pay for it.

---

## PART 3 — The genuine cross-path combos

A real combo names two talents in different trees where one's output is the other's input. Ranked by how much it changes a character.

### 3.1 leyline/Black Attunement Key → deity/Power `Absolute Authority` **and** deity/Death `Consuming Decay`

**The best gate synergy in the game, and it's free.**

The Black Key: *"When you Draw Mana, enemies you can see within Attunement Range with no ally within 5 feet become Weakened."* No action beyond the Draw Mana you were making anyway, no Investiture, no test, no talent slot (it's granted with the path).

- **Power** (`Black 2+`): `Absolute Authority` (depth 1, L2, 2▶ + 2 Inv) requires a **Compelled, Frightened or Weakened** target and lets you *choose the target's action on its next turn*. Without the Key you must first land `Kneel` (1▶ + 1 Inv, test Black vs. Cognitive). **The Key saves 1 Action, 1 Investiture and an entire failure point, every single time.** Nothing in the game produces Frightened, so Weakened is two-thirds of the precondition space. `Kneel`'s second clause — advantage on attacks against any Compelled/Frightened/**Weakened** character — is also handed to you free.
- **Death** (`Black 2+`): `Consuming Decay` (depth 1, L2, 2▶ + 2 Inv) requires a **Weakened** target or one below half HP. Death's own nine talents never apply Weakened. Without the Key the tree's best sustained-damage talent is a *finisher*; with it, it is an *opener*.

Both trees charge Black 2+ and both spend it correctly. This is what a paid gate looks like.

### 3.2 heroic/Agent → the ten Opportunity-costed leyline/deity talents

**The largest cross-atlas value transfer in the game, and neither intent source mentions it.**

`Watchful Eye` (Agent, depth 0, **L1**, Reaction): *"Use Opportunist on the plot die of a willing ally within 20 ft."*
`Sure Outcome` (Agent, depth 0, **L1**, Special, 2 focus): *"…change Opportunity to Complication 4, or **any Complication to Opportunity**."*

From level 1, for 2 focus and a Reaction, an Agent converts a *party member's* Complication into an Opportunity at 20 ft. The recipients are listed in §1.2. `Double Down` (depth 1, L2) adds a second reroll.

Without an Agent, `Mending Aura`, `Afterburn`, `Natural Recovery`, `Probability Cascade` and six others fire on a natural 20. **Adding an Agent to the party is worth more to the White/Green/Red players than to the Agent.**

### 3.3 leyline/White → heroic/Agent (the plot-die faucet and the plot-die filter)

Agent's engine converts plot-die faces. White's engine **creates plot-die rolls that would not otherwise happen**:

- `Guiding Signal` (depth 0, **L1**, 1▶ + 1 Inv): designate a character; the next ally who tests against it this round **raises the stakes**
- `Concordant Presence` (depth 1, L2, **free Passive**): when an ally succeeds on a test, the next ally testing that same skill this round raises the stakes — no action, no cost, repeatable
- `Unity of Purpose` (depth 2, L3, **free Passive**): two or more allies aid the same test → raise the stakes

Neither works nearly as well alone: White manufactures rolls whose faces it can barely influence (`Pillar of Order` only blanks a Complication); Agent can reshape faces but only rolls one plot die per raised-stakes event. **Together they are the game's only Opportunity economy.** The functional-overlap script ranks White↔Leader 161st of 210 — dissimilar — but it measures *similarity*, and complementarity is what matters here. It never measured this.

### 3.4 leyline/Black `Severance` → deity/Chaos `Isolating Pressure` / `Isolating Ruin`

`Isolating Pressure` (Chaos entry, **L1**, 1▶ + 2 Inv): test Black vs. Physical → target **Isolated** until the start of your next turn.
`Severance` (Black, depth 1, **L2**, `Black 2+` — *already charged by the Chaos gate* — **free Passive**): *"Your attacks against Isolated characters deal **vital damage instead of their normal damage type**."*

Every weapon attack the character makes against that target now ignores Deflect. Also unlocked by the same Isolated state: `Sapping Hex` (hit an Isolated character → Weakened, which then feeds §3.1), `Cruel Step` (move 10 ft toward an Isolated character without provoking).

And it runs the other way: **Chaos is the only deity tree that solves its own Investiture problem**, because Black hands it two of the game's nine Investiture producers. `Void Sense` (Chaos, 1/round on an Omen-bearer taking damage from any source) + `Predatory Patience` (Black, +[Die] to the test and **1 Investiture on every successful attack against a Weakened creature**) + `Predator's Due` (Black, [Tier][Die] health and 1 Investiture on every kill). Three of nine producers on one character, against a tree that costs 14 Investiture to deploy.

**Black + Chaos is the most tightly integrated build in the atlas.** It is also the most anti-social — see §5.1.

### 3.5 heroic/Warrior `Feinting Strike` → leyline/Black `Puppeteer` (the 0-focus chain)

Only **two** talents in 365 require a target at 0 focus, and they sit in different atlases:

- Black `Puppeteer` (depth 4, L6, Reaction, 2 focus + 1 Inv): a 0-focus character takes its turn → **you choose one of its actions**
- Warrior `Wit's End` (depth 2 but Intimidation 3+, so **L6**, 2▶ + 1 focus): melee vs. Cognitive of a 0-focus target — **ignores deflect, +4d6, cannot graze**

And exactly **one** tree can drive a target to 0 focus with a weapon: Warrior's `Feinting Strike` (depth 1, L2, 1▶ + 2 focus) strips **focus equal to your ranks in Intimidation** (2 at Tier 1, 3 at Tier 2) plus the target's Reaction. `Vinestance` adds 1d4 on a Reaction. Against a typical pool of `2 + WIL` ≈ 4–5, that is two turns.

Black's contribution is the *taxation* layer, not the drain: `Whispered Doubt` (+1 focus per spend, 1/round/enemy), `Coercive Pressure` (any focus loss → disadvantage on their next Cognitive test), `Predatory Insight` (**regain 1 focus when any character reaches 0 focus** — the Warrior's kill feeds the Black mage). Red's `Shatter Focus` (Reaction, −1 focus on a failed test) is a third contributor from a third tree.

**Nothing in leyline/Black can zero a target's focus on its own.** The Warrior is not a nice-to-have partner for `Puppeteer`; he is the only supplier.

### 3.6 heroic/Warrior `Cautious Advance` → heroic/Scholar `Keen Insight` / heroic/Envoy `Practical Demonstration`

This is the combo the advantage inversion (§1.5) creates, and it is invisible to anyone reading "advantage" as a state.

`Cautious Advance` (Warrior, depth 0, **L1**, 2▶): *"Move up to half your movement, ignoring difficult terrain, then **gain 2 Actions to Brace or Gain Advantage**."* Action-neutral, plus a free half-move. On its own it is one of the worst talents in the game — you spend 2 Actions to get 2 Actions to do a thing worth almost nothing (the primer: *"A talent that reproduces a standard action is worth roughly zero"*).

But three talents pay you for **performing the Gain Advantage action**:

- Scholar `Keen Insight` (depth 3, **L6**): *"After you Gain Advantage, the target must resist your influence or gain a disadvantage on their next test."* → **two forced resist-or-disadvantage events per Cautious Advance**
- Envoy `Practical Demonstration` (depth 0, **L1**, Free Action): *"When you Gain Advantage or hit with an attack, use your Rousing Presence as a Free Action."* → **two free Rousing Presences**, i.e. two allies made Determined
- Scholar `Strategize` (depth 0, **L1**, Special, 2 focus): *"After you Gain Advantage using an Erudition skill, **grant that advantage to an ally instead**. You can spend 2 focus to also **prevent the target from using reactions against that ally**."*

Note what §1.5 makes of that last one: `Strategize` is the only talent in the game that **moves** an advantage, which matters precisely *because* advantage doesn't stack — handing yours to an ally who has none is the only way to make a second advantage source worth anything.

`Through the Fray` (Leader, depth 0, L1, 1▶) does the same for an ally: *"An ally within 20 ft can Disengage or **Gain Advantage as a reaction**."*

**Warrior + Scholar is, on this evidence, the strongest heroic pair in the game — and it is the pair with ZERO shared generic talents (§5.3) and it is recommended by neither path description.**

### 3.7 heroic/Envoy `Foresight` → leyline/White's seven Reactions

White has **7 Reaction talents — 28% of the tree, the highest in the game** — competing for the hard 1-per-round cap. Blue has 5. Green has 3.

`Foresight` (Envoy, depth 3, prereq Discipline 3+ so **L6, not L4**): *"Gain an additional reaction each turn."* It is one of exactly **two** reaction-granting talents in 365, and the only unconditional one (Hunter's `Sidestep` grants a second reaction **to Dodge only**, and only in armour with Deflect < 2). Blue's `Forewarned` grants one conditionally on a correct prediction.

Doubling the Reaction slot doubles the usable half of White's kit. Nothing else in the game does this.

### 3.8 leyline/Green `Thorn Field` → heroic/Hunter `Deadly Trap` / deity/Death `Bone Garden` / deity/Civilization `Bastion`

Green is the only tree that **taxes** its own zone keyword; four trees **produce** that keyword:

- Green: the Attunement Key (free, every Draw Mana), `Spreading Roots`, `Sudden Growth`
- Hunter `Deadly Trap`: *"Target is Immobilized and the area becomes difficult terrain"*
- Death `Bone Garden`: a 10 ft square, scene-long difficult terrain, [Tier][Die] keen on end-of-turn
- Civilization `Bastion`: *"enemies treat fortified Foundations as difficult terrain"*

Green's readers — `Thorn Field` (half [Tier][Die] keen on enter or start), `Spreading Roots` (expand [Size]), `Pack Sense` (+Green mod to ally attacks inside), `Apex Predator` (advantage on all Physical while three enemies stand in it) — all say **"your difficult terrain."** So this is a **same-character** combo, not a party one: a Green/Death or Green/Hunter build stacks `Thorn Field`'s half [Tier][Die] on top of `Bone Garden`'s [Tier][Die] or turns every `Deadly Trap` into a damage zone. Green + Death is gate-supported (Death charges Green 2+). Green + Hunter and Green + Civilization are free and unsupported.

### 3.9 The four "damage from any source" Investiture pumps → any high-damage-frequency party

Four talents convert **someone else's** damage into your Investiture:

| Talent | Tree | Trigger |
|---|---|---|
| `Void Sense` | Chaos | an Omen-bearer takes damage **from any source**, 1/round |
| `Accumulate` | Knowledge | the Insight-marked creature takes damage **from any source**, 1/round |
| `Prognosis` | Life | a Diagnosed creature takes damage **from any source**, 1/round |
| `Expose` | Sovereignty | a Censured creature **fails a test** |

These are half of the game's nine Investiture producers and they are all **party-funded**. Their value is a direct function of how many damage instances the party generates per round — which makes them worth roughly nothing beside a Sovereignty or Blue teammate, and a great deal beside a Red, Warrior, Hunter or Civilization Construct.

`Expose` is subtly different and better: it triggers on **failed tests**, so it is funded by whoever imposes save-or-suck effects — Destruction's `Concussive Yield` and `Fault Line` (Speed vs. your Red), Civilization's `Bastion` and `Magnum Opus` (Agility vs. your Red), Order's `Sealed Edict` and `Verdict` (Discipline vs. your Blue), Fate's `Inevitable Snare` (Speed vs. your Green). Ironically the tree with the most dead gate has the most *externally* well-connected economy talent.

### 3.10 The "drops to 0 HP" trigger cluster → a minion-heavy fight

Four talents fire on **any** character dropping to 0 HP in range — not just kills you made:

- Death `Reaper's Harvest` (**depth 0, L1, free Passive**): 1 Investiture **and** a Harvested Remain
- Death `Necrotic Cascade`: each enemy within 10 ft takes [Tier][Die] spirit
- Civilization `Bonds of Community`: allies in Foundations gain temp HP + advantage
- Destruction `Combustion Chain`: every dangerous-terrain zone you own spreads 5 ft, plus a new 10 ft radius

Two trees produce disposable bodies for these: Civilization's `Combat Construct` and Death's `Risen Servant`. A Death disciple's `Risen Servant` costs a Remain and **returns one when it dies** — near-perpetual. A Civilization Construct dying in a party with a Death disciple hands the Death player Investiture.

This is a genuine party-composition synergy and it is entirely undeclared. It is also the reason **Destruction + Civilization is a trap** — see §5.2.

### 3.11 leyline/White `Collective Resolve` → heroic/Envoy `Inspired Zeal` (the only cross-tree token pair)

`Collective Resolve` (White, depth 3, L4, Special, Opportunity + 1 Inv — **authored text; the generator prose omits the Investiture**): grants **Determined to all allies** in Attunement Range.
`Inspired Zeal` (Envoy, depth 3, Discipline 3+ so **L6**): *"When an ally uses Determined, choose other allies to recover 1 focus, up to your ranks in Discipline."*

Determined is the **only** named token in the entire atlas produced by one tree and read by a different one. A White marshal blankets the party in Determined; every ally who cashes it refunds focus to up to three more allies. Envoy's own `Rousing Presence` produces it one ally at a time; White produces it in bulk.

### 3.12 deity/Sovereignty `Exalt` → heroic/Warrior `Wit's End` / heroic/Hunter `Fatal Thrust`

If `Exalt`'s die-size step applies to a talent's bonus damage dice (see §6.1 — this is the open question that halves or doubles the tree), its best targets in the game are the two biggest fixed dice pools:

- Warrior `Wit's End`: `(4 + max((@tier-2)*2,0))d6` — **4d6 → 4d8 = +4 average**, and it already ignores Deflect
- Hunter `Fatal Thrust`: `4d4` → 4d6 = **+4 average**
- Warrior `Devastating Blow`: `(2 + max(@tier-2,0))d8` → 2d10 = +2

Sovereignty gates Black 3+/White 3+; Warrior and Hunter gate nothing. It is legal, cheap and cross-atlas — the pairing type neither design guide discusses.

### 3.13 heroic/Hunter `Startling Blow` → heroic/Agent `Subtle Takedown` (and the reverse)

`Startling Blow` (Hunter, depth 0, **L1**, 1▶, free): unarmed/improvised attack vs. Cognitive; on hit **or graze** the target is **Surprised**.
`Subtle Takedown` (Agent, depth 2, Insight 3+ so **L6**, 2▶): unarmed attack vs. an **unsuspecting** target's Cognitive, raising the stakes; on hit they can't communicate.
`Fatal Thrust` (Hunter, depth 1, Perception 3+ so **L6**, 2▶): attack an **unsuspecting** target; **+4d4** and two advantages if Discreet.
`Mercurial Façade` (Agent, depth 3, Deception 3+ so **L6**): the first character to see through your disguise is **Surprised**.

Agent + Hunter is a designer-recommended pair, and **this is the mechanical reason** — the only cross-tree Surprised producer/consumer pair. **Caveat, and it needs a ruling:** `Startling Blow` and `Mercurial Façade` say "**Surprised**"; `Fatal Thrust` and `Subtle Takedown` say "**unsuspecting**". If those are not the same word to the engine, the combo is broken by a typo.

### 3.14 `Surefooted` (Agent/Hunter/Warrior) → deity/Destruction's indiscriminate zones

Per the canon reference: dangerous terrain damages *"characters that enter or start their turn in those squares"* for **energy damage equal to the placer's tier** — friend and foe alike. Destruction owns the only dangerous terrain in the game and the capstone `The Unmooring` upgrades every square in the scene to **[Tier][Die]**.

`Surefooted` (identical text in Agent, Hunter and Warrior): *"Reduce damage from falling and **dangerous terrain** by **twice your tier**."* Against base dangerous terrain (tier), 2×tier fully negates it. **`Surefooted` is the game's only friendly-fire mitigation for a Destruction teammate, and it is a depth-1-or-2 free Passive in three different heroic trees.**

### 3.15 Forced movement (Blue / Red / Warrior / Green) → the Black Key's isolation requirement

The Black Key needs enemies **with no ally within 5 feet**. Black's own `Unnerving Approach` (Free Action, 1 Inv, once per turn) is the purpose-built enabler, but four other trees push bodies around for free or cheap:

- Blue `Redirect Momentum` (Reaction, 1 Inv): push [Size] in any direction — **the only *directed* push in the game**, so the only one that reliably creates isolation rather than randomising it
- Red `Shockwave Slam` (Special, free): push up to [Size] on any melee hit
- Warrior `Shattering Blow` (Special, 2 focus): each damaged target pushed 5 ft
- Green `Drive the Prey` (2▶, 2 Inv): target **must move away from you** on its next turn

Only leyline/Black and deity/Chaos convert isolation into anything. A Blue mage repositioning one enemy 5 ft is worth a free Weakened plus vital-damage conversion to the Black player. That is a genuine, invisible, cross-tree combo.

---

## PART 4 — Dead seams

### 4.1 leyline/Blue is the least-connected tree in the game

Blue produces **no token any other tree reads**. Its signature output — disadvantage, 5 of the game's 14 producers — is read by **zero talents in 365** and is binary anyway, so its five talents largely do one talent's work even inside Blue. `Telepathic Network` is read only by Blue's own `Anticipate`. Illusion is a four-talent subsystem with **one** external touch and it is hostile (Green's `Natural Order` shuts down enemy illusions). Blue consumes Investiture (15 talents) and Opportunity (1) and gives nothing back to anyone.

The one thing Blue supplies to a partner is `Redirect Momentum`'s directed push (§3.15) and `Counterspell`'s Investiture-activation interrupt, which only fires against **another Invested character** — i.e. it is a mirror-match answer, dead against an unInvested enemy.

**Blue's problem is not that it deals no damage. Blue's problem is that it participates in no economy.** That is a sharper statement of the designer's Blue-vs-Scholar worry than "they do the same thing": Scholar at least owns fabrials, Erudition, the healing clinic and `Turning Point`'s party Action grant. Blue owns disadvantage, which nothing reads.

### 4.2 The design guide's "Green clusters, Black isolates" opposition does not exist

> "Green's cluster engine mirrors Black's isolation engine." — leyline guide, Green identity

It doesn't. Green's difficult terrain **slows** enemies; it does not gather them. Green's adjacency bonuses are about **ally** adjacency, not enemy clustering — `Pack Hunter` ("move adjacent to an enemy **another ally** is adjacent to"), `Coordinated Hunt` ("you **and at least one ally** both attack the same character"), `Pack Pressure` ("you or an ally **adjacent to the same character**"). Black's isolation triggers read the **enemy's** allies ("no ally within 5 feet"). The two engines are **orthogonal, not opposed** — they neither counter nor combine. The stated mirroring is fictional in both directions.

### 4.3 Two hazard-zone vocabularies that never touch

**difficult terrain** (Green ×6, Hunter ×1, Death ×1, Civilization ×1) and **dangerous terrain** (Destruction ×6, mitigated by `Surefooted` ×3) are separate keywords with no interaction whatsoever. Nothing converts one to the other; no talent reads both. Green's `Thorn Field` — a talent whose entire text is "make your zone deal damage" — does not fire on a Destruction disciple's zones and vice versa. Two trees built the same idea twice under different names.

### 4.4 The deity atlas is a single-currency island

Zero focus, zero Draw Mana, one Opportunity, one plot-die clause across 90 talents. Whatever else a deity character takes — heroic path, second leyline colour — their deity half will never interact with it except through Investiture, which no heroic talent touches.

### 4.5 Every deity homebrew resource is sealed (§0.2)

The deity guide's principle 5 — *"Homebrew resources should be the spine of the tree"* — was followed exactly, and the consequence is that **ten trees each built a private spine that connects to nothing**. Omen, Insight, Harvested Remain, Charge, Ordained Ground, Snare, Hexmark, Edict, Covenant, Diagnosed, Mutation, Combat Construct, Foundation, damage die size: fourteen tokens, zero cross-tree readers, one hostile reader (`Fault Line` vs. Constructs).

### 4.6 Terminal conditions

Disoriented (11 trees produce, 0 require), Prone (6/0), Slowed (6/0), Stunned (3/0), Restrained (2/0), Afflicted (5/0), temporary HP (9/0), disadvantage (9/0). Roughly **60 talent slots** produce something no other talent in the game reads.

### 4.7 Frightened is required by two talents and produced by none

Power's `Kneel` (advantage clause) and `Absolute Authority` (targeting clause) both name **Frightened**. Nothing in 365 applies it. One-third of `Absolute Authority`'s precondition space is a null set.

### 4.8 Green's `Thorn Field` and its cousins are ownership-bound, so §3.8 works within a character and not within a party

Worth stating explicitly because it looks like a party combo and isn't: "**your** difficult terrain". A Green mage standing beside a Death disciple's `Bone Garden` gets nothing from it. Only a character who owns both trees does. Same for `Spreading Roots`, `Pack Sense`, `Apex Predator`.

---

## PART 5 — Anti-synergy

### 5.1 The Red Attunement Key's Reaction tax, imposed on four deity trees that never asked for it

> Red Leyline Attunement: *"When you Draw Mana, gain an advantage on your next Physical test. **Lose your Reaction until the start of your next turn.**"*

Red's is the **only** Key that charges a price. And **four deity trees force Red 2+**: Civilization, Destruction, Knowledge, Power.

Every deity character holds **both** of their gate colours' Keys (the Keys are "granted free with the path"; the gates are skill-rank requirements that presuppose the path). Both Key talents read "When you Draw Mana…" with no exclusivity clause. So a Red-gated deity character loses their Reaction on every refuel — and these are the most Investiture-starved trees in the game:

| Tree | Investiture to deploy | In-tree regen | Reactions it owns |
|---|---|---|---|
| Civilization | 11 | 0 | 1 (`Bonds of Community`) |
| Destruction | 10 | 0 | 1 (`Combustion Chain`) |
| Power | 15 | 0 | 0 |
| Knowledge | 10 | 1 (`Accumulate`) | 0 |

Against a pool of `2 + max(AWA,PRE)` ≈ 4, refilling at **1 Investiture per Action at Tier 1**, a Civilization or Destruction disciple Draws Mana on roughly every other Action — so their only Reaction is off about half the time.

**It gets worse for Civilization specifically**, because Civilization also gates **White 2+**, and White is the game's Reaction tree (7 Reactions, 28%). A Civilization player who follows the White gate into White's Bulwark line — which is exactly what §2's "thematically paid" argument recommends — buys `Interposing Shield`, `Retributive Guard`, `Shared Burden`, `Pillar of Order`, `Voice of Authority`, `Shared Conviction`, `Counterpoint`, and then turns them all off every time they refuel the Constructs.

**This is the sharpest anti-synergy in the game and a deity gate mandates it.** It is also the single finding here most dependent on a rules question — see §6.2.

### 5.2 deity/Destruction `Fault Line` deals TRIPLE damage to deity/Civilization's Constructs

> Fault Line: *"…and **structures and Constructs along the line take triple damage**."*

A 60 ft × 5 ft line from the caster, [Tier][Die] + Strength energy. The only Construct in the game is Civilization's `Combat Construct`, and it has HP equal to `[Tier][Die] + tier × 2` — about **10** at Tier 1, **16** at Tier 2 with `Magnum Opus`. Triple [Tier][Die] + Str at Tier 2 is ~27 + Strength. **A Destruction disciple can one-shot a friendly Civilization disciple's entire tree with a talent that names it.**

Compounding it: dangerous terrain damages *"characters"* indiscriminately, and Civilization's Construct is a persistent body that acts on your initiative and will be standing in the fight.

And a second-order one: **two Destruction disciples are strictly worse than one.** Per the canon reference, *"Multiple Destruction dangerous-terrain effects don't stack but merge geographically."* The second player's zones add area, not damage.

### 5.3 The designer's own recommended heroic pairings are the worst-overlapping ones

**41 of 365 talent slots (11.2%) are one of twelve generic effects duplicated verbatim across trees.** I recomputed this from normalised description text rather than names, which catches two the name-based pass misses:

- `Composed` (Blue, Black, Envoy) = `Focused Mind` (Leader) = `Clear Mind` (Scholar) — five slots, three names
- White's `Overwhelming Authority` and Blue's `Subtle Suggestion` are **97% identical text** (differ by "you may"), both Special, both 1 Investiture, both depth 2 / L3

Family counts: Hardy 7 trees · Mighty 6 · Collected 5 · Composed-family 5 · Baleful 3 · Surefooted 3 · Combat Training 2 · Swift Strikes 2 · High Society Contacts 2 · Customary Garb 2 · Well Dressed 2 · influence→Disoriented 2.

Now cross-reference with the "excellent multi-path choices" named in each heroic path description:

| Recommended pair | Shared generic slots | Which |
|---|---|---|
| **Hunter + Warrior** | **5** | Combat Training, Hardy, Mighty, Surefooted, Swift Strikes |
| **Envoy + Leader** | **4** | Composed/Focused Mind, Customary Garb, Mighty, Well Dressed |
| Agent + Hunter | 3 | Hardy, Mighty, Surefooted |
| Envoy + Scholar | 2 | Collected, Composed/Clear Mind |
| Leader + Warrior | 2 | Hardy, Mighty |
| Agent + Scholar | 1 | Collected |

**The two highest-overlap pairs in the entire fifteen-pair heroic matrix are both explicitly recommended**, and the two **zero**-overlap pairs — **Hunter + Scholar** and **Warrior + Scholar** — are recommended by nobody. Warrior + Scholar is, per §3.6, mechanically one of the best pairs in the game.

For Hunter + Warrior the waste is concrete: five of a 50-talent combined pool are the same talent. Worse, the shared pieces are load-bearing prerequisites — `Combat Training` gates Warrior's `Devastating Blow` and `Hardy`; `Hardy` gates Warrior's `Swift Strikes` and Hunter's `Unrelenting Salvo`. So the second copy is not merely redundant, it is unbuyable-but-required.

**And nothing in the text says whether the duplicates stack.** `Mighty` in Red and Warrior: is that +2(1+tier) or +1(1+tier)? `Hardy` in three trees: +3 max HP per level or +1? Undefined either way, and both answers are bad — stacking is degenerate, non-stacking is a dead slot.

### 5.4 Green + Hunter: ten advantage producers, one advantage

Green has five advantage producers (`Primal Awareness`, `Predator's Instinct`, `Pack Hunter`, `Scent the Weak`, `Apex Predator`). Hunter has five (`Seek Quarry`, `Exploit Weakness`, `Fatal Thrust`, `Shadowing`, `Hunter's Edge`). Every one of them points at the same kind of target — a tracked, marked, wounded or low-HP enemy:

- Green `Scent the Weak`: "You know which creature within Attunement Range has the lowest HP. Your **first test against it each round gains advantage**."
- Hunter `Seek Quarry`: "Choose a character to be your quarry, **gaining an advantage on tests to find, attack, and study them**."
- Hunter `Exploit Weakness`: "**Gain Advantage on your quarry** without spending an action."
- Green `Predator's Instinct`: "**Gain an advantage** on tests to track or locate characters suffering an injury or **below half health**."

Because advantage is boolean-OR'd, **a Green + Hunter character has bought roughly one advantage five times.** Neither intent source warns about it, and the resource census's "OVER-PRODUCED" verdict does not localise it. This is the worst redundancy pair in the game.

Hunter's `Fatal Thrust` even says *"gain **two advantages** if the weapon is Discreet"* — which in the implementation is exactly one.

### 5.5 leyline/Red `Emotional Overload` does hit allies — but it is not the trap it looks like

> *"When **a character** within Attunement Range gains an advantage from any source, spend 1 Investiture. It gains a disadvantage on its next non-attack test."*

"A character", not "an enemy" — so yes, it reads allies. But the Investiture spend is **optional**, so it is a lever the Red player chooses to pull, not a rule that fires against them. The real problem is different and worse: with 45 advantage-granting talents across 13 trees, the great majority of advantage events near a Red mage in a normal party are **the party's own**, which means the talent's trigger fires constantly on things the Red player must decline. It is a talent whose text promises a punish and whose practical experience is a stream of prompts to say no.

Two genuine uses survive: an enemy Invested caster (Blue Key, Red Key, deity/Power's `Kneel`), and — pointedly — **a teammate you want to sabotage**, which is presumably not the intent.

### 5.6 Three trees solve the same plot-die problem three different ways

An ally rolls a Complication:
- White `Pillar of Order` (Reaction, 1 Inv, **L6**): change it to a blank face
- Agent `Sure Outcome` (Special, 2 focus, **L1**): change it to an **Opportunity**
- Scholar `Contingency` (Reaction, 2 focus, Lore 3+ so **L6**): remove it

Three trees, two atlases, one event. `Sure Outcome` strictly dominates the other two — earliest, cheapest, and it converts rather than deletes. A party with an Agent has bought White's `Pillar of Order` and Scholar's `Contingency` for nothing.

### 5.7 leyline/Green `Natural Order` vs. leyline/Blue — checked, and it is a false alarm

> *"For the scene, **enemies** within your Attunement Range cannot benefit from illusions, magical concealment, or advantage gained from deception."*

It reads **enemies** only. Blue's `Phantom Double` victimises enemies rather than benefiting them; `Phantom Barricade`'s cover benefits whoever stands behind it, so shutting it off for enemies is a plus. **No conflict.** It *is* a hard counter to an enemy Blue mage and to enemy Deception-based advantage — which incidentally includes leyline/Black's `Predatory Insight` and heroic/Agent's Deception advantages, if those are on the other side.

### 5.8 The Sovereignty/Knowledge/Life redundancy

deity/Life's `Vital Diagnosis` and deity/Knowledge's `Studied Mark` are the same talent: 1▶ + 1 Investiture, depth 0, L1, mark one creature, reveal its statblock, grant the **whole party** a Vital-damage rider against it. They are in different trees with different gate colours (Blue/Green vs. Red/Green). Two players who each took one get an **additive** stack (+Tier and +Insight Vital from every party member); a party with only one has the whole effect already. Whether that reads as synergy or duplication depends entirely on party composition, and neither tree's text hints at the other.

Similarly, Sovereignty's entire **Exalt** half is dominated by Knowledge's amplifier: `Exalt` costs 1▶ + 1 Investiture for **one ally's** die size for **one round**; `The Pack` costs 1▶ + 2 Investiture for **every ally's** damage for the **scene**.

---

## PART 6 — Open questions I could not settle inside the fence, and what settles them

### 6.1 Does `Exalt`'s die-size step apply to `[Tier][Die]`?

`Exalt`, `Investiture of Authority`, `Sovereign's Balance` and `Sovereignty` all say "**damage die size**". Leyline and deity damage is `(@tier)d(2 * @skills.X.rank + 2)` — a rank-derived die, not a weapon die. `Edict of the Fallen` narrows to "damage die size **for attacks**", implying the others are broader.

If the step applies to `[Tier][Die]`, `Exalt` on a Knowledge disciple's `Killing Blow` at Insight 5 is 5d6 → 5d8 (**+5.8 average**). If it applies only to weapon dice, Sovereignty's entire elevate half is a martial-only buff and is worthless beside four of the five leyline colours.

**This ambiguity is worth roughly 2× on the value of the whole tree.** What settles it: the Foundry implementation of the die-size step in the engine, or a designer ruling. It is not decidable from the talent text.

### 6.2 Does a dual-attuned character trigger BOTH Attunement Key riders on one Draw Mana?

Every deity character is dual-attuned by construction. The primer's Draw Mana line reads "trigger **your colour's** Attunement rider" (singular); the five Key talents each read "When you Draw Mana, …" with no exclusivity clause and no "instead". Both Keys are in the 365, so this is in scope as a text question, and on the text the answer is **both fire**.

**If both fire**, §5.1 stands: Red's Reaction tax is imposed on four deity trees, and Black's Weakened is the free engine behind §3.1. **If only one fires** (player's choice, or a primary colour), §3.1 gets a cost and §5.1 largely evaporates. This single ruling moves more of this analysis than anything else in it.

What settles it: `edhaDrawMana` in `module-src/scripts/engine/52-green-instinct.js`, or a ruling.

### 6.3 Do the twelve duplicate-talent families stack?

`Mighty` in six trees, `Hardy` in seven, `Collected` in five, `Baleful` in three, `Surefooted` in three. A multi-path character can legally own two copies. Nothing in any of the texts addresses it. Both answers are bad (§5.3). What settles it: a ruling, and then either a "you may only benefit once" line on the shared text, or — better — collapsing the families into path-agnostic general talents so the duplicate slot can carry real content. That would free roughly 29 talent slots (41 minus 12 canonical copies).

### 6.4 Are "Surprised" and "unsuspecting" the same thing?

Hunter's `Startling Blow` and Agent's `Mercurial Façade` apply **Surprised**. Hunter's `Fatal Thrust` and Agent's `Subtle Takedown` require an **unsuspecting** target. If those differ, the only cross-tree Surprised loop in the game (§3.13) — and the mechanical basis of the designer-recommended Agent+Hunter pairing — is broken by a word choice. Surprised is a canon condition; "unsuspecting" is not in the conditions list. What settles it: the engine's condition matching, or rewording `Fatal Thrust` and `Subtle Takedown` to say Surprised.

### 6.5 Anything that depends on adversary statblocks

Out of scope by ruling, and it bites in three places: whether `Censure`'s die-size reduction is worth an Action depends on adversary damage dice; whether `Counterspell` is ever live depends on whether adversaries spend Investiture; whether the "drops to 0 HP" cluster (§3.10) fires often depends on minion density. I have not conditioned any finding on them.

---

## PART 7 — The seams, ranked by how much they change a real character

| # | Seam | Trees | Earliest | Effect on a real character |
|---|---|---|---|---|
| **1** | **Opportunity is produced only by heroic and spent only by leyline/deity** | Agent, Warrior, White, Leader, Scholar → White, Blue, Green, Red, Black, Power | L1 | **Ten talents go from ~5%-per-test to ~30–50%-per-test.** Turns three trees' depth-3/4 payload from theoretical to live. Largest single delta in the game. |
| **2** | **Advantage has no consumer; numeric bonuses stack without limit** | 13 trees produce advantage; 10 trees produce stacking numbers | L1 | Reframes every build decision. A player choosing between a 5th advantage source and a +2 is choosing between 0 and +2 and has no way to know. |
| **3** | **Black Attunement Key → Power `Absolute Authority` / Death `Consuming Decay`** | Black → Power, Death | L2 | Saves 1 Action + 1 Investiture + a failed-test risk **every use**, on the two trees' best mid-tree talents. Free. |
| **4** | **Warrior `Feinting Strike` → Black `Puppeteer` / `Predatory Insight` / Warrior `Wit's End`** | Warrior + Black | L6 | The only route to 0 focus in the game. Unlocks the two best 0-focus payoffs, which are otherwise unreachable. |
| **5** | **Red Attunement Key's Reaction tax on four Red-gated deity trees** *(anti)* | Red → Civilization, Destruction, Knowledge, Power | L1 | Turns off ~50% of the character's Reaction uptime for the whole campaign. Worst for Civilization, which also gates White. |
| **6** | **Black `Severance` → Chaos `Isolating Pressure`; Chaos `Void Sense` + Black `Predatory Patience` + `Predator's Due`** | Black + Chaos | L2 | Every weapon attack ignores Deflect; three of the game's nine Investiture producers on one sheet. The only deity build that fixes its own economy. |
| **7** | **White plot-die faucet → Agent plot-die filter** | White + Agent | L1 | Turns a 1/6 chance into a reroll-and-convert. Feeds seam #1 for the whole party. |
| **8** | **Envoy `Foresight` → White's 7 Reactions / Blue's 5** | Envoy + White/Blue | **L6** (Discipline 3+, not L4) | Doubles the usable fraction of the most Reaction-dense tree in the game. |
| **9** | **The 12 duplicate-talent families, and the designer's recommended pairs being the worst** *(anti)* | 11 trees | L1 | Hunter+Warrior wastes 5 of 50 slots, and the duplicates are prerequisites for other talents. Envoy+Leader wastes 4. |
| **10** | **Warrior `Cautious Advance` → Scholar `Keen Insight` / Envoy `Practical Demonstration`** | Warrior + Scholar/Envoy | L1 (Envoy) / L6 (Scholar) | Converts the game's most-derided talent into 2 free Rousing Presences or 2 forced disadvantages per use. |
| **11** | **The amplifier convergence: Life `Vital Diagnosis` + Knowledge `The Pack` + Fate `Hexmark` + Order `Lawkeeper's Eye` + Sovereignty `Censure` on one target** | 5 deity trees | L1–L3 | At Tier 2, +7 Deflect-ignoring damage on *every* party attack, plus party advantage, plus −2 die steps on the target. Fully additive. |
| **12** | **Green `Thorn Field`/`Spreading Roots` → Hunter `Deadly Trap` / Death `Bone Garden` / Civilization `Bastion`** | Green + 3 | L3 | Adds half [Tier][Die] keen to every zone the character owns. **Same character only.** |
| **13** | **The four "damage from any source" Investiture pumps → party damage frequency** | Chaos, Knowledge, Life, Sovereignty | L2 | ±1 Investiture/round is ±25% of a Tier-1 pool. Worth ~nothing beside Blue/Sovereignty, a lot beside Red/Warrior/Civilization. |
| **14** | **Destruction `Fault Line` triple damage to Civilization Constructs; indiscriminate dangerous terrain** *(anti)* | Destruction ↔ Civilization | L3 | One talent one-shots a teammate's whole tree. Mitigated only by `Surefooted` (3 heroic trees). |
| **15** | **Green + Hunter: ten advantage producers, one advantage** *(anti)* | Green + Hunter | L1 | Up to five wasted talent slots, and both intent sources are silent. |
| **16** | **White `Collective Resolve` → Envoy `Inspired Zeal`** | White + Envoy | L6 | The only cross-tree token pair in 365. Party-wide Determined → party-wide focus refund. |
| **17** | **Civilization `Lay Foundation` (10 ft square) → White's Bulwark adjacency line** | Civilization + White | L1 | The only free-action, sustained ally-clustering in the game; it is what White's `Guardian Stance`/`Shield Wall`/`Unyielding Accord` require and cannot make. |
| **18** | **Forced movement (Blue `Redirect Momentum`, Red `Shockwave Slam`, Warrior `Shattering Blow`, Green `Drive the Prey`) → Black Key isolation** | 4 trees → Black/Chaos | L2 | A 5 ft push from a teammate is a free Weakened plus a damage-type conversion for the Black player. |
| **19** | **Sovereignty `Exalt` → Warrior `Wit's End` / Hunter `Fatal Thrust`** | Sovereignty + Warrior/Hunter | L1 | +4 average per use — **if** §6.1 resolves in favour of bonus dice. |
| **20** | **`Surefooted` (Agent/Hunter/Warrior) → Destruction's indiscriminate zones** | 3 heroic → Destruction | L2 | 2×tier reduction fully cancels base dangerous terrain. The only friendly-fire answer in the game. |

---

## PART 8 — What this says about the designer's four questions

Answering only within question 4's remit, but the findings above bear on the others:

**On "every tree is good at something."** Every tree is good at something. **Not every tree participates in anything.** The three trees that neither give to nor take from a partner are **leyline/Blue** (produces no token any tree reads; its five disadvantage talents feed nothing), **deity/Chaos** and **deity/Destruction** (zero ally-facing talents between them — I verified this by reading all eighteen). Chaos and Destruction are self-sufficient strikers, which is a legitimate design. Blue is neither self-sufficient (zero damage, zero healing, zero mitigation) nor connected. **If you are going to change one tree, the argument for Blue is not "Blue has no damage" — it is "Blue has no interface."**

**On leyline↔heroic parity.** They cannot be compared at the same point on the tree because they run on different currencies that never convert, and because 36 heroic talents are six levels later than the dossier says (§0.3). The one thing that IS comparable: a heroic character can do their whole kit forever on focus and rests; a leyline character at Tier 1 sustains at 50% uptime because Draw Mana returns 1 Investiture per Action. That is a bigger power gap than any per-talent comparison.

**On deity parity.** The gate is worth 6 skill ranks and the trees pay back between 0 and 2 colours' worth. Knowledge and Sovereignty pay 6 ranks for effectively 3. Power, Death and Chaos pay 6 and get 6 plus a free engine.

**The cheapest fixes for question 4**, in ascending cost:
1. Add "when you damage a **Disoriented** target…" riders somewhere. Eleven trees produce it and nothing reads it; one rider connects eleven trees at once.
2. Give the leyline atlas **one** raise-the-stakes or Opportunity source. Ten talents in five trees currently depend on a heroic teammate.
3. Rule on §6.2 and, if both Keys fire, move Red's Reaction tax onto Red's own talents rather than the Key — four deity trees are paying it by accident.
4. Collapse the twelve duplicate families into path-agnostic general talents. That returns ~29 slots and stops the two designer-recommended pairs being the two worst.
5. Give **Sovereignty** the Decree radius both intent sources promise. A zone is an interface; nine single-target talents are not.

## Adversarial verification

**27 load-bearing claims checked: 9 confirmed, 14 corrected, 4 refuted.**

Adversarial re-check of the cross-path synergy map against raw talent text. The analysis is unusually well-sourced: its hardest structural findings — the 41 rank-3 mis-dated talents (I count 42, minus White's Shared Burden on an attribute = 41, and 36 heroic, exactly as claimed), the Order/White-2+ gate-audit false positive (three "ranks in White" instances, verbatim), the 15-pair heroic overlap matrix with both recommended pairs at the top and both zero-overlap pairs unrecommended, the deity Investiture/regen/Reaction table (11/0/1, 10/0/1, 15/0/0, 10/1/0 — exact), Weakened 7-requirer/3-tree and Isolated 4/2 counts, Frightened produced by nothing, and White's Overwhelming Authority ≡ Blue's Subtle Suggestion — all survive verbatim checking. Its unstated premise (every deity character holds both gate colours' Attunement Keys) turns out to be supported by a source it never cites: all ten INTENT-deity-*.md line 15 read "Requires attunement to both X and Y leylines." Five load-bearing claims fail. (1) "Nothing in leyline/Black can zero a target's focus; the Warrior is the only supplier for Puppeteer" is refuted by Black's own Whispered Doubt, which drains focus in-tree at depth 3 — seam #4 should drop. (2) Life's Vital Diagnosis and Knowledge's Studied Mark are NOT the same talent: Studied Mark grants no damage rider; the real duplicate is Vital Diagnosis (L1) vs Pack Share (L6), a parity finding the analysis missed. (3) Cautious Advance → Practical Demonstration is dead, because Practical Demonstration already fires on any attack hit. (4) "Zero talents read the advantage state as an input" is contradicted by the analysis's own table (Emotional Overload, Natural Order, Bulwark Ground all read it). (5) All ten deity ENTRY gates are 2+/2+, not the 3+/3+ the verdict table prints for Life, Knowledge and Sovereignty — the "6-rank toll" is a 4-rank entry toll plus an optional rank-3 that buys exactly one talent each. The single most load-bearing conclusion — "synergy lives in the numeric layer, advantage is inert" — is mislabelled: by the analysis's own definition of a combo, the numeric layer contains zero combos; the conditions layer is the actual interface, and every one of the analysis's own top-ranked combos runs on a condition.

### Claims

1. **CORRECTED** — Advantage is terminal: all apparent consumers key on the Gain Advantage ACTION, and zero talents in 365 read the advantage STATE as an input.
   - Evidence: I read all 60 advantage-naming talents. The positive half stands: no talent anywhere rewards holding an advantage, and the six Gain-Advantage riders are exactly as described (Envoy Practical Demonstration/Guiding Oration, Scholar Strategize/Keen Insight, Warrior Cautious Advance/Flamestance, plus Leader Through the Fray, Hunter Exploit Weakness, Agent's three Free-Action talents). But three talents read the STATE: leyline/Red Emotional Overload — 'When a character within Attunement Range gains an advantage from any source, spend 1 Investiture'; leyline/Green Natural Order — enemies 'cannot benefit from ... advantage gained from deception'; deity/Fate Bulwark Ground — 'attacks against that ally cannot benefit from advantage'. The analysis's own table lists all three and then asserts zero.
   - Corrected: No talent in 365 pays you for HOLDING an advantage. Exactly three read the advantage state at all, and all three are denials or punishes: Red's Emotional Overload, Green's Natural Order, Fate's Bulwark Ground. The 45 producers therefore feed six action-keyed riders and three anti-riders, and nothing else.
2. **CORRECTED** — Ten talents in the leyline and deity atlases cost an Opportunity; those two atlases produce zero Opportunity.
   - Evidence: The ten are exact (cost field): White Mending Aura d4/L5, White Collective Resolve d3/L4, Blue Probability Cascade d3/L4, Black Predatory Insight d2/L3, Red Reckless Momentum d4/L5, Red Afterburn d4/L6, Red Reckless Gambit d3/L6, Green Sudden Growth d3/L6, Green Natural Recovery d2/L3, Power Momentum of Victory d1/L2. The 'zero production' half is self-contradicted three lines later: raise-the-stakes exists in exactly 9 talents and leyline/White owns three of them (Guiding Signal d0/L1, Concordant Presence d1/L2, Unity of Purpose d2/L3). Raising the stakes is one of the two canonical Opportunity sources.
   - Corrected: Ten talents in leyline+deity cost an Opportunity (confirmed exactly). The two atlases produce Opportunity only indirectly and only in leyline/White, via three raise-the-stakes talents — and two of those three hand the plot die to an ALLY, so only Unity of Purpose can feed the White mage's own Opportunity costs. The Agent dependency is real; 'zero' is not.
3. **CONFIRMED** — 41 talents carry a rank-3 skill prerequisite but are labelled earliest L2–L5; 36 of them are heroic.
   - Evidence: Recomputed from prerequisites + earliestLevel: 42 talents with a '<skill> 3+' token and earliestLevel<6. Per tree: Agent 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5 (=36 heroic), plus leyline Blue Baleful, Black Extract Thought, Red Feeding Frenzy, Green Pack Sense, Green Natural Recovery (=5), plus White Shared Burden which gates on Strength 3+ — an attribute, correctly excluded by the analysis. 42−1 = 41. Exact.
4. **CORRECTED** — Re-datings: Envoy Foresight L6, Warrior Wit's End L6, Scholar Turning Point L6, Hunter Pack Hunting L6, Scholar Keen Insight L6, Agent Mercurial Facade L6.
   - Evidence: Foresight (Discipline 3+), Wit's End (Intimidation 3+), Turning Point (Deduction 3+), Pack Hunting (Perception 3+) — all confirmed L6. Keen Insight is NOT rank-gated: prereq = 'Deep Contemplation', whose prereq is 'Clear Mind; Lore 2+' — earliestLevel 4 and no rank-3 anywhere in the chain. Mercurial Facade's prereq is 'Subtle Takedown; Deception 3+' and Subtle Takedown is itself L6, so Mercurial Facade is L7.
   - Corrected: Foresight, Wit's End, Turning Point and Pack Hunting are L6 (confirmed). Keen Insight is L4, not L6 — which makes the Warrior+Scholar seam two levels earlier than claimed. Mercurial Facade is L7.
5. **CONFIRMED** — Order's White 2+ is a gate-audit false positive: 'ranks in White' appears three times and is the entire magnitude of the Covenant branch.
   - Evidence: Verbatim: Bear Witness — 'each ally in a Covenant with you within Attunement Range gains temporary HP equal to your ranks in White'; Shoulder the Oath — 'reduce the remaining damage to that ally by your ranks in White. Both you and that ally gain temporary HP equal to your ranks in White.' Three instances, two talents. I then grepped all 365 for 'ranks in <colour>' / 'your <colour>' as a magnitude: in the whole deity atlas only Order (White ×3) and Civilization's Bonds of Community ('temporary HP equal to your White') do it. Fate, Knowledge and Sovereignty use their toll colour nowhere at all. The gate audit's script looked only for tests and die sizes, so it could not see this. This is the analysis's strongest original correction.
6. **CORRECTED** — The deity gates are Life Blue 3+/Green 3+, Knowledge Red 3+/Green 3+, Sovereignty Black 3+/White 3+, and 'the gate is worth 6 skill ranks'.
   - Evidence: All twenty deity entry talents carry a 2+/2+ prerequisite: Life 'Blue 2+; Green 2+', Knowledge 'Red 2+; Green 2+', Sovereignty 'Black 2+; White 2+'. The 3+ values in the brief's audit table are the deepest rank demanded anywhere in the tree, on individual talents: Life Blue 3+ gates Surgical Precision and Green 3+ gates Adaptive Mutation; Knowledge Green 3+ gates Pack Share and Red 3+ gates Killing Blow; Sovereignty White 3+ gates Investiture of Authority and Black 3+ gates Decree of Ruin.
   - Corrected: Every deity ENTRY toll is 4 skill ranks (2+/2+), not 6. Rank 3 in a gate colour is an optional deepening that buys exactly one or two named talents. So 'Sovereignty's White 3+ is a pure 6-rank toll' becomes: Sovereignty charges 4 ranks at entry with White contributing nothing, and a further White rank buys precisely one talent (Investiture of Authority) while still never being tested or sizing a die. Same shape for Knowledge/Green 3+ → Pack Share. The toll-booth verdict survives; the price tag was doubled.
7. **REFUTED** — Life's entry gate of Blue 3+ buys one talent that already gates itself.
   - Evidence: Life's entries (Vital Diagnosis, Life Surge) both read 'Blue 2+; Green 2+'. There is no Blue 3+ entry gate. Blue 3+ appears only on Surgical Precision, which is a depth-1 talent, not the entry.
   - Corrected: Life charges Blue 2+ at entry and Blue does nothing at that rank — no test, no die, no modifier. Blue 3+ is a separate, optional purchase that buys the tree's single best talent (Surgical Precision, the largest heal formula in the game, and the tree's one Blue test). Life/Blue is a toll booth at the entry rank and paid at rank 3.
8. **CONFIRMED** — Every deity character holds both of their gate colours' Attunement Keys, because the gates presuppose the leyline path.
   - Evidence: The talent data alone does not support this — the deity prerequisites are bare skill ranks ('Black 2+; Red 2+'), and the five Attunement Keys are talents at depth 0 of the leyline trees. But the intent source settles it: INTENT-deity-Chaos.md through INTENT-deity-Sovereignty.md all carry, at line 15, '_Requires attunement to both X and Y leylines._' All ten. Attunement, not merely rank. The analysis reached the right answer from an assumption it never named; §5.1 and §3.1 rest on this and both stand.
9. **CORRECTED** — §3.1 (seam #3): the Black Attunement Key saves Power's Absolute Authority 1 Action, 1 Investiture and an entire failure point, every single time.
   - Evidence: Black Leyline Attunement, verbatim: 'When you Draw Mana, enemies you can see within Attunement Range with no ally within 5 feet become Weakened.' Absolute Authority requires 'a Compelled, Frightened, or Weakened character'. Consuming Decay requires 'a Weakened character or a character below half HP'. Both confirmed. But the Key's output is conditional on the enemy being isolated, which in a normal fight is the exception, not the default.
   - Corrected: The Black Key replaces Kneel (1 Action + 1 Investiture + a Black-vs-Cognitive test) as Absolute Authority's precondition WHENEVER the target has no ally within 5 ft — not every time. §3.15's forced-movement seam is therefore a prerequisite of §3.1, not an independent finding: without Blue's Redirect Momentum, Black's own Unnerving Approach, or terrain, the Key fires rarely. Note also Consuming Decay's second, unconditional trigger — 'below half HP' — which the party supplies for free and which the analysis omitted.
10. **REFUTED** — §3.5 (seam #4): nothing in leyline/Black can zero a target's focus on its own; the Warrior's Feinting Strike is the only supplier for Puppeteer and Wit's End.
   - Evidence: leyline/Black Whispered Doubt (Passive, no cost, depth 3, L4, Black 2+): 'When an enemy within Attunement Range spends focus, it spends 1 additional focus. Once per round per enemy.' That is a focus drain inside Black, four levels before Puppeteer (depth 4, L6, same tree). Against a 2+WIL pool (~4) an enemy using one focus reaction per round loses 2/round. Second supplier: leyline/Red Shatter Focus (Reaction) — 'When a character within Attunement Range fails a test, use this Reaction and it loses 1 focus.' Third class: Baleful (Blue, Agent, Leader) and Envoy's Calm Appeal tax influence resistance by tier / ranks in Discipline.
   - Corrected: Feinting Strike is the most RELIABLE focus drain (unconditional on a hit, ranks-in-Intimidation per hit) but not the only one. Black reaches 0 focus in-tree via Whispered Doubt; Red's Shatter Focus and the three Baleful copies are further sources. Seam #4 should fall out of the top ten: it is a same-tree combo dressed as a cross-path one.
11. **REFUTED** — §3.6 (seam #10): Warrior's Cautious Advance converts into 2 free Rousing Presences via Envoy's Practical Demonstration.
   - Evidence: Practical Demonstration, verbatim: 'When you Gain Advantage OR HIT WITH AN ATTACK, use your Rousing Presence as a Free Action.' No once-per-round limit. A Warrior spending the same 2 Actions on Strikes triggers it at least as often, hits something, and keeps the third Action. Cautious Advance adds a half-move and nothing else.
   - Corrected: The Envoy half of seam #10 is dead — Practical Demonstration already fires on ordinary attacks, which is what a Warrior does. The Scholar half survives and is BETTER than stated: Keen Insight is L4 (not L6), and Strategize's advantage TRANSFER is genuinely the only way in 365 to make a second advantage source worth anything, given the binary scalar.
12. **REFUTED** — §5.8: Life's Vital Diagnosis and Knowledge's Studied Mark are the same talent — 1 Action + 1 Investiture, depth 0, L1, mark, reveal statblock, grant the whole party a Vital-damage rider.
   - Evidence: Studied Mark, verbatim: 'Place 2 Insight on it and learn its current HP, conditions, and Physical and Spiritual defenses.' No damage rider of any kind. Vital Diagnosis: 'you know its exact HP, MAX HP, conditions, and Physical and Spiritual defenses. You and allies dealing damage to the Diagnosed creature deal additional Vital damage equal to your Tier.' Knowledge's actual analogue is Pack Share — 'allies in Attunement Range ... deal bonus Vital damage equal to your Tier on attacks against it' — at depth 1 and, because of its Green 3+ gate, L6.
   - Corrected: The duplicate pair is Life's Vital Diagnosis (depth 0, L1) and Knowledge's Pack Share (depth 1, L6): the same party-wide +Tier Vital rider, five levels apart, for the same 1 Action + 1 Investiture. Vital Diagnosis is strictly Studied Mark's reveal plus max HP plus a rider it does not have. This is a deity PARITY finding (question 3), not a synergy finding, and the analysis filed it in the wrong section.
13. **CORRECTED** — §5.2: Destruction's Fault Line can one-shot a friendly Civilization Construct (HP ~10 at Tier 1, ~16 at Tier 2 with Magnum Opus; Fault Line ~27+Strength).
   - Evidence: Forge Construct: 'HP equal to [Tier][Die] + your tier x 2' = 1d6+2 (mean 5.5) at Tier 1 rank 2, 2d8+4 (mean 13) at Tier 2 rank 3. Magnum Opus adds '[Tier][Die] x 2 additional HP' = 2x2d8 (mean 18), so ~31 at Tier 2, not 16. Fault Line: '[Tier][Die] + Strength energy damage ... structures and Constructs along the line take triple damage' = 3x(2d8+STR) ≈ 27 + 3xSTR at Tier 2, not 27+STR.
   - Corrected: Construct HP is ~5.5 at Tier 1, ~13 at Tier 2, ~31 with Magnum Opus. Fault Line delivers ~27+3xSTR at Tier 2 against Constructs. The one-shot claim holds comfortably at both tiers on a base Construct and is a coin-flip against a Colossus. Every number in the analysis was wrong; the conclusion was right and understated.
14. **CONFIRMED** — §5.3: 41 of 365 slots (11.2%) are one of twelve duplicate families; Hunter+Warrior share 5 and Envoy+Leader 4; both are designer-recommended; the two zero-overlap pairs (Hunter+Scholar, Warrior+Scholar) are recommended by nobody.
   - Evidence: Exact-text normalisation returns 36 slots / 12 families; adding the near-variants the analysis names recovers 41. Hardy IS in 7 trees — leyline/Black's copy reads 'maximum HP' where the other six read 'max/maximum health', which is why a naive match undercounts it. I computed the full 15-pair heroic matrix: Hunter+Warrior 5 (Combat Training, Hardy, Mighty, Surefooted, Swift Strikes), Envoy+Leader 4, Agent+Hunter 3, Agent+Envoy 3, Agent+Leader 3, Agent+Warrior 3, Envoy+Scholar 2, Hunter+Leader 2, Leader+Warrior 2, Agent+Scholar 1, Envoy+Hunter 1, Envoy+Warrior 1, Leader+Scholar 1, Hunter+Scholar 0, Scholar+Warrior 0. The six 'excellent multi-path choices' lines (INTENT-heroic-*.md line 26) are Agent-Hunter, Agent-Scholar, Envoy-Leader, Envoy-Scholar, Hunter-Warrior, Leader-Warrior. The top two overlaps are both recommended; both zero pairs are not. Prereq chains confirmed verbatim: Warrior Devastating Blow ← 'Combat Training; Athletics 3+', Warrior Hardy ← 'Combat Training', Warrior Swift Strikes ← 'Hardy', Hunter Unrelenting Salvo ← 'Hardy; Agility 3+'.
15. **CORRECTED** — §3.7: Foresight is one of exactly two reaction-granting talents in 365.
   - Evidence: Three: Envoy Foresight ('Gain an additional reaction each turn'), Hunter Sidestep ('Gain an additional reaction to Dodge when you're not wearing armor with deflect of 2 or higher'), and leyline/Blue Forewarned ('If that character takes the declared action before your next turn, you gain 1 Reaction') — which the analysis names in the same paragraph while still writing 'exactly two'. White's 7 Reactions and Blue's 5 are confirmed by action type; Green is 2 by action type, not 3.
   - Corrected: Foresight is one of three reaction-granting talents and the only unconditional one. Blue is the interesting case the analysis skipped: Blue owns both its own second-Reaction source (Forewarned, depth 0, L1, free) and 5 of the Reactions competing for the slot.
16. **CONFIRMED** — §1.3: Weakened has 3 producer trees and 7 requiring talents in 3 trees; Isolated 2 producer trees and 4 requirers; Disoriented has zero requirers.
   - Evidence: Weakened, 12 talents: producers Black Leyline Attunement, Black Sapping Hex, Order Sealed Edict, Power Absolute Authority (on failure); requirers Black Predatory Patience / Spoils of Isolation / Dread Presence / Sovereign of Solitude, Death Consuming Decay, Power Kneel and Absolute Authority = 7 in 3 trees. Isolated, 7 talents: producers Black Unnerving Approach, Chaos Isolating Pressure, Isolating Ruin; requirers Black Sapping Hex / Severance / Cruel Step, Chaos Unravel Everything = 4 in 2 trees. Disoriented, 14 talents: 11 produce, 3 remove (Green Natural Recovery, Life Surgical Precision, and Chaos Cascade Collapse applies it), zero require it. Exact.
17. **CORRECTED** — §1.3/§4.6: Stunned 3 producers in 3 trees, Prone 7/6, Slowed 6/6, and roughly 60 talent slots produce something nothing reads.
   - Evidence: Stunned has ONE producer: heroic/Agent Cheap Shot. The other two hits REMOVE it (Green Natural Recovery, Envoy Devoted Presence). Prone: 7 hits, 6 producers (Devoted Presence removes). Slowed: 6 hits, 4 producers (Devoted Presence and Surgical Precision remove). Afflicted: 5 hits, 4 producers (Natural Recovery removes). Restrained 2/0 and temporary HP 14/0 are exact. Re-totalling: Disoriented 11 + Prone 6 + Slowed 4 + Stunned 1 + Restrained 2 + Afflicted 4 + tempHP 14 + disadvantage ~9 = ~51.
   - Corrected: ~51 talent slots, not ~60, produce a condition or resource no talent reads — and Stunned in particular is a one-talent effect (Cheap Shot), not a three-tree one. The direction of the finding is unchanged and Disoriented remains the best fix target at 11 producers across 11 trees with zero readers.
18. **CORRECTED** — §1.4: Fate's Hexmark adds +[Tier] keen 'every time it takes damage from any source' — a pure multiplier on the party's damage instances.
   - Evidence: Hexmark, verbatim: 'the Hexmarked target takes an additional [Tier] keen damage whenever it takes damage from any source WHILE WITHIN 10 FT OF ANY OF YOUR ORDAINED GROUND SQUARES OR UNSPRUNG SNARES.' It is also typed Reaction and triggers only 'When an enemy triggers one of your Snares'.
   - Corrected: Hexmark is a positional rider: it pays only while the target stands within 10 ft of the Fate player's own tokens, and it costs the round's Reaction to apply. It belongs in the numeric-stack table with that condition attached, and it is not available to a party that cannot keep the target on the Fate player's ground.
19. **CORRECTED** — §6.1: Exalt on a Knowledge disciple's Killing Blow at Insight 5 is 5d6 → 5d8, +5.8 average; Wit's End 4d6 → 4d8 = +4; Devastating Blow 2d8 → 2d10 = +2.
   - Evidence: 5d6 mean 17.5, 5d8 mean 22.5 — the delta is +5.0, not +5.8. The other two are right, and right for the whole review range: Wit's End's formula is (4 + max((@tier-2)*2,0))d6, which is 4d6 at Tier 1 AND Tier 2; Devastating Blow's is (2 + max(@tier-2,0))d8, i.e. 2d8 through Tier 2. Exalt's text is confirmed: 'that ally's damage die size increases by one step (maximum d12)', and Edict of the Fallen does narrow to 'damage die size for attacks', so the §6.1 ambiguity is real.
   - Corrected: +5.0, not +5.8. The rest of §3.12/§6.1 stands, including the observation that the flatness of heroic dice through Tier 2 makes Wit's End and Fatal Thrust the best Exalt targets in the game.
20. **CORRECTED** — §3.2/§5.6: from level 1, for 2 focus and a Reaction, an Agent converts a party member's Complication into an Opportunity at 20 ft, and Sure Outcome strictly dominates White's Pillar of Order and Scholar's Contingency.
   - Evidence: Sure Outcome triggers 'When you use Opportunist' — your own plot die. Reaching an ally's die requires Watchful Eye ('Use Opportunist on the plot die of a willing ally within 20 ft'). Opportunist is the free Key, but Sure Outcome and Watchful Eye are two separate talents, so the ally conversion is L2 at the earliest, not L1. Cost is 2 focus of a 2+WIL pool (~4) per use, i.e. about two uses per rest.
   - Corrected: The Agent ally-Complication converter costs TWO talent slots (Watchful Eye + Sure Outcome) and lands at L2, at ~2 uses per rest. It still dominates Pillar of Order (L6) and Contingency (L6, Lore 3+) on timing and on converting rather than deleting — the domination claim survives, the level-1 claim does not.
21. **CORRECTED** — §3.13: Hunter's Startling Blow → Agent's Subtle Takedown/Fatal Thrust is the only cross-tree Surprised producer/consumer pair, and the Surprised-vs-'unsuspecting' mismatch may break it.
   - Evidence: Fatal Thrust's prerequisite is literally 'Startling Blow; Perception 3+' — they are the same tree and the same designed chain. So the word mismatch ('the target is Surprised' → 'Attack an unsuspecting target') is a bug INSIDE heroic/Hunter, between a talent and its own prerequisite. The genuinely cross-tree half is Hunter's Startling Blow → Agent's Subtle Takedown, plus Agent's Mercurial Facade (L7) → Hunter's Fatal Thrust.
   - Corrected: The Surprised/'unsuspecting' mismatch is more urgent than §6.4 says — it sits between Fatal Thrust and its own named prerequisite in the same tree — and correspondingly less load-bearing for §3.13 as a cross-path finding. The Agent+Hunter recommendation's real mechanical basis is thinner than claimed.
22. **CORRECTED** — Determined is the only named token with a producer in one tree and a consumer in a different tree.
   - Evidence: The Determined pair is real and exact: 4 Determined talents in 2 trees — White Collective Resolve (grants party-wide), Envoy Rousing Presence (grants), Envoy Instill Confidence (modifies), Envoy Inspired Zeal (reads: 'When an ally uses Determined, choose other allies to recover 1 focus'). But the analysis's own §0.2 table marks dangerous terrain 'Yes' (Destruction produces, Surefooted in Agent/Hunter/Warrior mitigates), and its own §1.3 shows Weakened and Isolated crossing trees and atlases.
   - Corrected: Determined is the only cross-tree pair among the tree-private homebrew RESOURCES. It is not the only cross-tree producer/consumer relationship in the game — dangerous terrain (Destruction → three heroic Surefooted copies), Weakened (Black Key/Sapping Hex/Sealed Edict → Black, Death, Power) and Isolated (Black, Chaos → Black, Chaos) all qualify, and the last two are the analysis's own best combos.
23. **CONFIRMED** — §5.3: White's Overwhelming Authority and Blue's Subtle Suggestion are 97% identical, differing by 'you may'.
   - Evidence: Verbatim. White: 'When you successfully influence a character, spend 1 Investiture. The target also becomes Disoriented until the end of your next turn.' Blue: 'When you successfully influence a character, you may spend 1 Investiture. The target also becomes Disoriented until the end of your next turn.' Both Special, both 1 Investiture, both depth 2, both L3. Stronger than the analysis states — the action type, cost, depth and level all match too.
24. **CONFIRMED** — §8: deity/Chaos and deity/Destruction have zero ally-facing talents between them.
   - Evidence: Neither 'ally' nor 'allies' appears in any of the 18 talent texts across the two trees. Every Chaos target clause reads 'the target' or 'each enemy'; every Destruction clause reads 'each character' or 'a character', which is indiscriminate rather than ally-facing.
25. **CONFIRMED** — §1.1 and §5.1 resource tables: deity Investiture-to-deploy Civilization 11 / Destruction 10 / Power 15 / Knowledge 10, in-tree regen 0/0/0/1, Reactions 1/1/0/0; heroic 49 focus-costed talents totalling 74 focus; leyline focus-costed White 1, Blue 1, Black 1; four deity trees force Red.
   - Evidence: Summed from cost fields: Chaos 14, Civilization 11, Death 14, Destruction 10, Fate 11, Knowledge 10, Life 13, Order 10, Power 15, Sovereignty 13. Reaction counts by action type: Chaos 1, Civilization 1, Death 0, Destruction 1, Fate 1, Knowledge 0, Life 0, Order 1, Power 0, Sovereignty 0. Heroic focus-costed = 49 talents / 74 focus; leyline = 3 talents / 6 focus. Red-gated deity entries: Civilization (Red 2+/White 2+), Destruction (Blue 2+/Red 2+), Knowledge (Red 2+/Green 2+), Power (Black 2+/Red 2+) — four, exact. Red Leyline Attunement's 'Lose your Reaction until the start of your next turn' is verbatim and is the only Key that charges.
26. **CORRECTED** — §2: a Knowledge character reaches five of nine talents at L1–L3.
   - Evidence: Six: Studied Mark (L1), Predatory Strike (L1), Accumulate (L2), Hunter's Discipline (L2), The Pack (L3), Death Mark (L3). The Final Study is L4; Pack Share (Green 3+) and Killing Blow (Red 3+) are L6.
   - Corrected: Six of nine at L1–L3, seven at L4, and two behind rank-3 gates at L6. The shape of the complaint — a long wait for a colour that never pays — survives; the count does not.
27. **CONFIRMED** — Frightened is required by two Power talents and produced by nothing in 365.
   - Evidence: Three hits for 'Frightened': Power's Kneel (advantage clause: 'any Compelled, Frightened, or Weakened character'), Power's Absolute Authority (targeting clause), and Death's Risen Servant, where it is an immunity granted to the summon. Nothing applies it. One third of Absolute Authority's precondition space is a null set, as claimed.

### What the analysis missed

- THE OPPOSITE CASE, AND IT IS BETTER. The analysis's single most load-bearing conclusion is 'the game's synergy lives entirely in a numeric layer nobody documented, while the layer everybody wrote talents for (advantage) is inert.' By the analysis's own definition in §3 — 'a real combo names two talents in different trees where one's output is the other's input' — the numeric layer contains ZERO combos. No entry in the §1.4 table reads any other entry. A Leader's command die is worth precisely the same beside a Life disciple as beside an empty chair; adding +d10 and +Tier Vital to one attack is two independent contributions landing on the same roll, not a combination. What §1.4 actually documents is an uncapped additive BALANCE risk. The real interface layer is the conditions layer, and it is measurable: Weakened (4 producers/3 trees -> 7 requirers/3 trees, crossing both atlases), Isolated (3->4), 0 focus (3 drains in 3 trees -> 2 payoffs in 2 atlases), drops-to-0-HP (4 readers in 3 deity trees), Surprised (2->2). Every one of the analysis's own top-ranked combos (§3.1, §3.4, §3.5, §3.10) runs on a condition; none runs on a number. The correct framing: conditions are the interface and only two of twelve are wired; numeric bonuses are the uncapped balance risk and are not an interface at all. Both findings survive; the label is the error — and it matters, because it is the difference between 'cap the stack' and 'wire the conditions', and only the second is the cheap fix the analysis itself lands on in §8.
- THE MULTI-PATH PREMISE IS NEVER FLAGGED. Every combo in Part 3 presumes a character holding two or three paths at once. Whether, when, and at what talent cost a PC can do that is a build-ladder question the scope fence excludes. The analysis correctly fences adversary dependence in §6.5 and correctly raises the both-Keys-fire question in §6.2, but never raises the prior question of whether the character holds both paths at all. It turns out to be settled in the analysis's favour by INTENT-deity-*.md line 15 ('Requires attunement to both X and Y leylines'), which the analysis never cites — it should have found that line, because it is the load-bearing sentence under seams #3, #5, #6 and #18.
- THE NUMERIC STACK IS PRESENTED WITHOUT ITS PRICES. Pack Sense costs 1 Investiture, Pack Hunting costs a Reaction plus 1 focus, Shared Conviction costs a Reaction plus 2 focus plus 1 Investiture, Hexmark costs the Reaction and only pays within 10 ft of the Fate player's own squares. 'Nine different trees, all additive, no cap' is legal but requires nine players each spending on the same attack in the same round, three of them their one Reaction. Also: Battle Fever and Feeding Frenzy read '+1 to your next test (max = Rank)' — the analysis writes '+Rank' into the stack, which is the cap, not the typical value (Rank is 2 for all of levels 1-5).
- §4.6's TERMINAL-SLOT COUNT DOUBLE-COUNTS REMOVERS AS PRODUCERS. Stunned in particular has one producer in 365 (Agent's Cheap Shot); the other two hits remove it. The corrected total is ~51 slots, not ~60. The analysis's own remit — 'recompute every numeric claim' — should have caught that a condition appearing in a removal clause is not a production of it.
- THE DESIGN-GUIDE-VS-TALENT-TEXT DRIFT ON THE BLACK KEY IS UNREPORTED. DESIGN-GUIDE-CLAIMS.md line 93 says Black's Draw Mana rider Weakens enemies 'with no ally within 10 ft'; the shipped talent says 5 feet. The analysis quotes the talent (correctly) but never notes that the second intent source doubles the radius of the mechanic that carries its #3 and #6 seams. Given the brief's instruction to say so where the two intent sources disagree, this belonged in the report.
- §1.2's PROBABILITY FIGURES ARE NOT DERIVED. 'Ten talents go from ~5%-per-test to ~30-50%-per-test' rests on the plot die's face distribution and the d20 Opportunity range, neither of which is in the 365 talents. §3.3's 1/6 is stated but never carried into the seam table's arithmetic. Flag as canon-reference-dependent, not talent-text-derivable.

### Surviving findings, in priority order

1. THE DEITY GATE AUDIT HAS ONE FALSE POSITIVE AND THE PRICE TAG IS HALF WHAT IS CLAIMED. Order's White 2+ is NOT a toll booth: 'ranks in White' is the entire magnitude of the Covenant branch (Bear Witness's per-round temp HP to every Covenant ally; Shoulder the Oath's -White damage reduction and +White temp HP to both parties). Remove Order from the list. Corrected list: genuinely dead = Knowledge/Green, Sovereignty/White; near-dead = Destruction/Blue (one formula), Life/Blue (entry rank buys nothing, rank 3 buys the tree's best talent); alive-if-you-keep-spending = Civilization/White, Fate/White. And every deity ENTRY gate is 2+/2+ = 4 skill ranks, not 6 — the rank-3 demands are per-talent deepenings that each buy exactly one named talent.
2. THE DESIGNER'S BLUE QUESTION HAS A SHARPER ANSWER THAN 'BLUE AND SCHOLAR OVERLAP', AND IT IS IN THE DATA VERBATIM. leyline/White's Overwhelming Authority and leyline/Blue's Subtle Suggestion are the same talent — same text but for 'you may', same Special action, same 1 Investiture, same depth 2, same L3. Blue's stated identity (disadvantage, 5 talents, the largest block in the game) is a binary scalar applied five times, read by nothing, and Blue produces no token any other tree reads. Blue's problem is not the missing damage; it is that Blue has no interface AND ships one of its 25 slots as White's talent. If one tree is to be changed, this is the evidence to change it on.
3. CONDITIONS ARE THE ECOSYSTEM'S INTERFACE, AND ONLY TWO OF THEM ARE WIRED. Weakened: 4 producer talents in 3 trees (Black Key, Sapping Hex, Sealed Edict, Absolute Authority-on-failure) feeding 7 requiring talents in 3 trees across both atlases. Isolated: 3 producers in 2 trees feeding 4 requirers in 2 trees. Everything else is terminal — Disoriented 11 producers across 11 trees and zero readers, temporary HP 14/0, Prone 6/0, Slowed 4/0, Afflicted 4/0, Restrained 2/0, Stunned 1/0. ~51 talent slots produce something no talent reads. A single generic 'when you damage a Disoriented target' rider connects eleven trees at once and is the cheapest available fix.
4. THE DESIGNER'S RECOMMENDED HEROIC PAIRS ARE THE TWO WORST, AND THE TWO BEST ARE RECOMMENDED BY NOBODY — verified across the full 15-pair matrix and all six INTENT lines. Hunter+Warrior share 5 of a 50-talent pool (Combat Training, Hardy, Mighty, Surefooted, Swift Strikes) and Envoy+Leader share 4; both are named 'excellent multi-path choices'. The only two zero-overlap pairs, Hunter+Scholar and Warrior+Scholar, are recommended by neither path. Worse, the duplicates are load-bearing prerequisites: Warrior's Combat Training gates Devastating Blow and Hardy, and Hardy gates Swift Strikes and Hunter's Unrelenting Salvo — so a second copy is unbuyable but required. 41 of 365 slots (11.2%) across 12 families; collapsing them into path-agnostic general talents returns ~29 slots.
5. 36 HEROIC TALENTS ARE SIX LEVELS LATER THAN THE DEPTH MODEL SAYS, WHICH KILLS THE 'HEROIC IS FULLY REACHABLE BY L4-L5' STRUCTURAL ASSUMPTION. 41 talents carry a rank-3 skill prerequisite while labelled earliest L2-L5; 36 are heroic (Agent 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5). Heroic power is therefore ALSO discontinuous at level 6, at the same step where leyline dice go 1d6 to 2d8. This bears directly on the designer's question 2 and it invalidates any leyline-vs-heroic comparison made off the dossier's earliest-L column.
6. THE RED ATTUNEMENT KEY TAXES FOUR DEITY TREES THAT NEVER ASKED FOR IT, AND THE PREMISE IS SOUND. Red's Key alone charges a price ('lose your Reaction until the start of your next turn'), and Civilization, Destruction, Knowledge and Power all gate Red. All ten INTENT-deity files state '_Requires attunement to both X and Y leylines_', so every deity character does hold both Keys. Those four trees cost 11/10/10/15 Investiture to deploy with 0/0/1/0 in-tree regen against a ~4 pool refilling at 1 per Action at Tier 1 — they Draw Mana constantly and lose the Reaction each time. Civilization is worst: it also gates White, the game's 7-Reaction tree.
7. THE CROSS-ATLAS OPPORTUNITY SEAM IS REAL BUT NARROWER THAN STATED. Exactly ten leyline/deity talents cost an Opportunity (verified from the cost field), including Green's only condition-strip, White's depth-4 heal, and Red's Afterburn. Opportunity comes only from a plot die or a natural-20-range roll, and leyline's only faucet is White's three raise-the-stakes talents — two of which hand the die to an ALLY, so only Unity of Purpose can feed the White mage's own costs. The Agent converter needs two talents (Watchful Eye + Sure Outcome) and lands at L2, at ~2 uses per rest.
8. THE DEITY PARITY FINDING THE ANALYSIS FILED UNDER THE WRONG QUESTION: Life's Vital Diagnosis (depth 0, L1, 1 Action + 1 Investiture) grants you and every ally +Tier Vital against the marked creature. Knowledge's identical rider is Pack Share, at depth 1 but L6 behind Green 3+. Same effect, same price, five levels apart. Knowledge's depth-0 mark (Studied Mark) grants no damage rider at all — it only reveals and places Insight. That is a direct answer to question 3, not a synergy note.
9. SEAM #4 SHOULD BE STRUCK AND #3 DOWNGRADED. Black reaches 0 focus without a Warrior (Whispered Doubt, free Passive, depth 3, L4, in the same tree as Puppeteer at depth 4), so the Feinting-Strike-to-Puppeteer 'only supplier' claim fails. And the Black Key's Weakened output only fires against enemies with no ally within 5 ft, so seam #3 is downstream of seam #18 (forced movement), not independent of it. The surviving top cross-path combos, in order: Black Severance + Chaos Isolating Pressure (every attack ignores Deflect from L2, on a gate colour Chaos already charges, plus three of the game's nine Investiture producers on one sheet); White's plot-die faucet + Agent's plot-die filter; Envoy's Foresight into White's seven Reactions; Civilization's 10 ft Lay Foundation into White's adjacency line; the four damage-from-any-source Investiture pumps against a high-damage-frequency party.
10. BUG REPORT, RAISED IN PRIORITY: Hunter's Fatal Thrust requires an 'unsuspecting' target and its own named prerequisite, Startling Blow, applies 'Surprised'. That is a broken chain inside one tree between a talent and the talent that gates it, not merely a cross-path wording risk. Agent's Subtle Takedown has the same 'unsuspecting' wording. 'Surprised' is a canon condition; 'unsuspecting' is not. Reword the two consumers or confirm the engine's matching.
