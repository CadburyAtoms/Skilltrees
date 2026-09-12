# Redundancy and overlap across all 21 trees

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `overlap-matrix`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# REDUNDANCY AND OVERLAP ACROSS ALL 21 TREES

## 0. Method, and why I disagree with the census's headline pair

I ran two independent measures over `all-talents.json` (365 rows) and read the full text of all 21 trees.

**(a) Verbatim/near-verbatim duplication.** Jaccard similarity over stop-worded description bags, all cross-tree pairs, threshold 0.45 → 86 pairs. This is the only measure that cannot be an artefact: it compares the actual printed rules.

**(b) Rarity-weighted mechanical similarity.** 56 fine-grained mechanical predicates (not themes — e.g. `ctl:actionDeny`, `heal:tempHP`, `act:grantReaction`, `ter:dangerous`), each weighted by inverse tree-frequency, cosine over the weighted vectors. Rare shared mechanics count; "both have passives" does not.

The two measures agree with each other and **both disagree with the census's function-vector ranking**, in a way that matters:

| Pair | census function-vector | my rarity-weighted rank |
|---|---|---|
| leyline/Black ↔ leyline/Red | **0.920 (rank 1 of 210)** | 0.157 — **rank 80 of 210** |
| leyline/Blue ↔ heroic/Scholar | 0.794 (rank 11) | 0.172 — rank 75 |
| deity/Order ↔ deity/Power | not in top 15 | **0.701 — rank 1** |
| deity/Chaos ↔ deity/Knowledge | not in top 15 | 0.626 — rank 3 |
| heroic/Envoy ↔ heroic/Leader | not in top 15 | 0.604 — rank 5 |

**Black ↔ Red 0.920 is an artefact, and I can say exactly of what.** The census vector's 18 functions are dominated by high-count coarse buckets — `passive_always` (Black 15, Red 11), plus "has a damage source", "has a condition", "debuffs an enemy". Both trees are 25-talent leyline trees built out of free passives that hurt one enemy. Of course they correlate. But when you ask *which specific mechanics* they share, the answer is four slots out of fifty (§2.4). Their cores — Black's Weakened/Isolated **vital** attrition plus whole-turn action denial, versus Red's **energy** AoE-propagation plus a movement-into-damage charge engine — have no mechanical contact at all. Black has zero energy damage, zero AoE beyond a flat 1-2 point tick, zero movement-scaling. Red has zero vital damage, zero Weakened interaction, zero action denial.

**The census's Blue↔Scholar 0.794 is the same artefact in a different direction** (§5). Both trees are cerebral, both are heavy on passives, and both have a hole where damage should be — and "has no damage" is a *shared absence*, which a cosine over a positive-valued vector reads as agreement.

Everything below is justified from talent text, not from either vector.

---

## 1. TIER 0 — THE SHARED-STOCK LAYER (the largest single redundancy in the system)

This is not "overlap" in the analytical sense. It is **the same talent, printed in more than one tree**. 41 of 365 slots (11.2%). Verified by exact-name match and by normalised-text match; the two agree.

### 1.1 The shared-stock roster, with per-copy details

| Talent | Trees | Text identical? | Notes |
|---|---|---|---|
| **Hardy** (+1 max HP/level) | 7: White, Black, Green, Agent, Hunter, Leader, Warrior | 3 wordings, one effect | White's copy is behind **White 3+ (L6)**; Leader's and Warrior's are **d1/L2**. Same talent, five levels apart. |
| **Mighty** (on weapon/unarmed hit, +1+tier per action spent) | 6: Red, Agent, Envoy, Hunter, Leader, Warrior | **Verbatim, all six** | Red's is d3/L4; Warrior's and Envoy's are d1/L2. |
| **Collected** (+2 Cognitive & Spiritual defenses) | 5: Blue, Green, Agent, Envoy, Scholar | **Verbatim, all five** | Blue's costs a **Blue 3+ / L6** slot. Envoy's is **d0/L1, free**. |
| **Composed / Focused Mind / Clear Mind** (+tier max focus) | 5: Blue, Black, Envoy, Leader, Scholar | Two variants ("max" vs "max and current") | Three of the five don't share the name. Leader's *Focused Mind* is d0/L1; Blue's *Composed* is d2/**L6**. |
| **Baleful** (resisting your influence costs +tier focus) | 3: Blue, Agent, Leader | **Verbatim** | |
| **Surefooted** (+10 movement; halve falling/dangerous-terrain damage) | 3: Agent, Hunter, Warrior | **Verbatim** | |
| **Combat Training** (weapon+armor+Military Life expertise; free graze 1/round) | 2: Hunter, Warrior | **Verbatim**, both d0/L1 | |
| **Swift Strikes** (1 focus: second Strike, same weapon) | 2: Hunter, Warrior | **Verbatim** | Warrior d2/L3, Hunter d3/L4 |
| **High Society Contacts** | 2: Agent, Envoy | **Verbatim**, both Special/2 Focus/d2/L3 | |
| **Well Dressed** | 2: Envoy, Leader | Verbatim but for one article | |
| **Customary Garb** | 2: Envoy, Leader | **Verbatim** (including the same two typos: "Prsentable", "Spriritual") | |
| **Shatter Focus** | 2: Red, Chaos | **DIFFERENT MECHANICS** | See §1.4 — this is a naming collision, not shared stock. |

### 1.2 Where the shared stock is concentrated

| Tree | shared slots / 25 | | Tree | shared slots / 25 |
|---|---|---|---|---|
| heroic/Agent | **6 (24%)** | | leyline/Blue | 3 (12%) |
| heroic/Envoy | **6 (24%)** | | leyline/Black | 2 (8%) |
| heroic/Leader | **6 (24%)** | | leyline/Green | 2 (8%) |
| heroic/Hunter | 5 (20%) | | leyline/Red | 2 (8%, one nominal) |
| heroic/Warrior | 5 (20%) | | leyline/White | 1 (4%) |
| heroic/Scholar | 2 (8%) | | every deity tree | **0 (0%)** |

**Atlas totals: heroic 30/150 (20%), leyline 10/125 (8%), deity 1/90 (1%).**

The finding: **the "each tree is good at something" problem is worst in the heroic atlas, and one fifth of it is literally the same talents.** Agent, Envoy and Leader each spend six of their twenty-five slots on cards that are not theirs. Envoy's shared six (Mighty, Collected, Composed, High Society Contacts, Well Dressed, Customary Garb) are a quarter of the tree, and four of them are also in Leader — which is Envoy's nearest neighbour by every measure (§2.3).

### 1.3 A fourth template that isn't name-shared but is functionally identical

The **"Gain X expertise. Spend 2 focus to add Opportunity to a [social] test"** card exists five times in three trees:

- heroic/Agent — *High Society Contacts* (Special, 2 Focus, d2/L3), *Underworld Contacts* (Special, 2 Focus, d2/L3)
- heroic/Envoy — *High Society Contacts* (Special, 2 Focus, d2/L3)
- heroic/Leader — *Well Supplied* (Special, 2 Focus, d1/L2), *Rumormonger* (Special, 2 Focus, d1/L2)

Same action type, same cost, same payload, same depth band, different flavour noun. Jaccard 0.47–0.53 pairwise. Three trees' social-utility identity is built out of one card printed five times.

### 1.4 Two naming collisions worth fixing regardless of balance

- **Shatter Focus** exists twice with *different rules*: leyline/Red (Reaction, free, d2/L3 — "when a character within Attunement Range fails a test, it loses 1 focus") and deity/Chaos (Reaction, 1 Investiture, d1/L2 — "an enemy bearing one of your Omens rerolls and takes the lower result"). Two differently-named things sharing a name in one compendium is a table hazard.
- **Composed / Focused Mind / Clear Mind** is the inverse: one thing with three names.

---

## 2. THE OVERLAP MATRIX — RANKED, WITH MECHANICAL JUSTIFICATION

Ordered worst-first. For each pair: **[R] = redundancy** (both do it, neither better) or **[D] = strict domination** (one does it and more).

---

### 2.1 ★★★★★ deity/Order ↔ deity/Power — 0.701, rank 1 of 210 — **[R], severe**

Two 9-talent trees, both gated Black-or-Blue + a second colour, both structured as *"mark one enemy with a declared constraint, and buff/shield your allies."*

Shared specific mechanics:

| Mechanic | Order | Power |
|---|---|---|
| Give allies **[Tier][Die] temp HP + advantage on their next attack test** | *Final Decree*: "every Witness gains [Tier][Die] temporary HP and an advantage on its next attack test" | *Investiture of Command*: "Each chosen ally gains [Tier][Die] temporary HP and an advantage on its next attack test" |
| Party advantage against one marked enemy | *Lawkeeper's Eye* (Passive, free, d1): "you **and your allies** have advantage on attack tests against that character" | *Kneel* (d0, 1A/1Inv): "**You** have an advantage on attack tests against any Compelled, Frightened, or Weakened character" |
| Damage redirection between characters | *Shoulder the Oath* (Reaction, free): take half an ally's damage | *Mantle of the Aspirant* (capstone): redirect up to tier of your damage **to** allies |
| Unreducible / Deflect-ignoring **spirit** damage on a Cognitive attack | *Edict*, *Sealed Edict*, *Verdict*, *Final Decree* (4 talents) | *Crown of Thorns*, *Mantle* (2 talents) |
| Read a target's declared next action | *Lawkeeper's Eye* | *Absolute Authority* (choose it outright) |
| Attack **Cognitive** defence with the tree's gate colour | Blue vs Cognitive ×2 | Black vs Cognitive ×3 |

**The temp-HP+advantage clause is the sharpest.** *Investiture of Command* (2 Actions, 2 Investiture, d2/L3) buys, for up to three allies, exactly what one clause of *Final Decree* buys for every Covenant ally — and Order's version is a rider on a talent that also mass-triggers Edicts and deals AoE spirit damage. **Neither dominates overall** — Order's ally half is a two-way pact with a free Reaction, Power's is a self-buff aura with a once-per-scene cap — but a party cannot tell them apart in play from the ally's seat: both hand you temp HP and one unit of advantage.

**The one clean domination inside the pair [D]:** Order's *Lawkeeper's Eye* is **free, a Passive, and party-wide**; Power's *Kneel* advantage clause is **self-only and costs an Action plus 1 Investiture plus a successful Black vs Cognitive test**. Kneel is still worth taking for Compelled — but its advantage clause is dominated outright by a free passive in another tree.

---

### 2.2 ★★★★★ deity/Chaos ↔ deity/Knowledge ↔ deity/Life — 0.626 (Chaos↔Knowledge, rank 3) — **the identical-engine triangle**

These three trees share **the same depth-1 Passive, written three times**:

> **deity/Chaos — Void Sense** (Passive, no cost, d1, L2): "…Once per round, when an enemy bearing one of your Omens in Attunement Range **takes damage from any source, you recover 1 Investiture**."
>
> **deity/Knowledge — Accumulate** (Passive, no cost, d1, L2): "…When that creature **takes damage from any source, you recover 1 Investiture once per round**."
>
> **deity/Life — Prognosis** (Passive, no cost, d1, L2): "When a Diagnosed creature **takes damage from any source, you recover 1 Investiture once per round**."

Same action type, same cost (none), same depth, same earliest level, same trigger, same frequency cap, same amount. Three of the system's **eight** Investiture-regen talents are this one card. That is not thematic convergence; it is one solved economic problem pasted three times.

The surrounding structure repeats too:
- All three trees open with a **1-Action / 1-Investiture depth-0 mark**: *Entropy Strike* (Omen), *Studied Mark* (Insight), *Vital Diagnosis* (Diagnosed).
- Chaos and Knowledge both **cash the mark for damage** and both close with a **3-Action / 3-Investiture capstone that removes all marks for [Tier][Die] + attribute damage each** (*Unravel Everything* / *The Final Study*).
- Knowledge's *Studied Mark* and Life's *Vital Diagnosis* are **the same reveal**: current HP, conditions, Physical and Spiritual defenses, on one creature, for 1 Action + 1 Investiture at d0/L1. Life's adds max HP and a **+Tier Vital party-wide rider**; Knowledge's adds 2 Insight. **[D] — Life's *Vital Diagnosis* strictly dominates *Studied Mark* as an information talent** (more data, same price, same action, same depth) and matches it as a damage rider (+Tier Vital for everyone vs. Insight that only the Knowledge character converts until *Pack Share* at L6).

**Verdict:** Chaos↔Knowledge is **[R]** on the mark-and-detonate loop — Chaos does spirit/vital + Disoriented + a dispel, Knowledge does vital multiplication + information. Knowledge↔Life is **[D] on the reveal clause only**, otherwise complementary (Knowledge amplifies damage, Life heals).

---

### 2.3 ★★★★★ heroic/Envoy ↔ heroic/Leader — 0.604, rank 5 — **[R], and it's architectural**

These two are built to **the same blueprint**, not merely similar:

> A **Key talent that is a cheap, repeatable single-ally buff**, followed by a tree of Specials that modify the Key.

- **Envoy**: *Rousing Presence* (Action, no cost — ally becomes Determined). Nine talents modify it: *Sound Advice*, *Practical Demonstration*, *Devoted Presence*, *Stalwart Presence*, *Lessons in Patience*, *Instill Confidence*, *Practiced Oratory*, *Sage Counsel*, *Rallying Shout*.
- **Leader**: *Decisive Command* (Action, 1 focus — ally gets a d4 command die). Seven talents modify it: *Combat Coordination*, *Relentless March*, *Confident Command*, *Shrewd Command*, *Demonstrative Command*, *Cutthroat Tactics*, *Authority*.

Four of twenty-five slots are literally shared (*Mighty*, *Well Dressed*, *Customary Garb*, and *Composed*=*Focused Mind*). Both then buy the §1.3 social-Opportunity card, both apply Disoriented, both raise Physical/Spiritual defenses via *Customary Garb*, both spend focus as their sole currency, both have zero Investiture interaction.

**Where they genuinely separate — and this is the argument that they are NOT redundant:**
- Leader's command die is a **stacking numeric bonus** (d4→d10) and the only granted, upsizable bonus die in the game. Envoy's Determined is a **binary condition** with a small canon payload (add an Opportunity to one failed test, then it ends).
- Envoy is the party **focus battery**: four of the system's eight focus-restoring talents (*Galvanize*, *Applied Motivation*, *Inspired Zeal*, *Lessons in Patience*). Leader has one (*Cutthroat Tactics*).
- Envoy owns the only non-violent combat exit (*Calm Appeal* → *Peaceful Solution*). Leader owns social influence outright (11 influence-touching talents to Envoy's 3).

**Verdict [R], not [D]** — but with a caveat the designer should hear: at levels 1–3 they *play* almost identically, because the differentiating talents (*Confident/Shrewd/Demonstrative Command* at L3–L4, *Peaceful Solution* at L4, *Foresight* at L4) are all past the depth-0/1 band, and the depth-0/1 band is where the shared stock lives.

---

### 2.4 ★★★ leyline/Black ↔ leyline/Red — census rank 1 (0.920), **my rank 80 (0.157)** — **NOT the redundancy the census says it is**

Actual shared mechanics, exhaustively:

1. **A near-duplicate mobility talent.** `[R]`
   - Black *Cruel Step*: **1 Action, 1 Investiture**, move **10 ft** toward an Isolated character **without provoking Reactive Strikes** (d2/L3)
   - Red *Reckless Advance*: **1 Action, 1 Investiture**, move **[Size] ft** toward a character or objective **without provoking reactions** (d0/L1)
   
   Same action, same cost, same effect class. [Size] is 5 ft at rank 2 and 10 ft at rank 3, so *Cruel Step* is strictly the better movement (10 ft flat) but demands an Isolated target. **Both trees' own profiles list their copy in the bottom three.** Two trees each wasted a slot on the same bad card.
2. **A push.** Black *Unnerving Approach* (Free Action, 1 Inv, push an ally-of-target [Size] away) vs Red *Shockwave Slam* (★ Special, free, push target [Size] + collision damage). **[D]** — Red's is free, on a Special, and adds damage; Black's is 1 Investiture. Black's is not dominated *in purpose* (it manufactures Isolated), but as a push it is worse in every term.
3. **Reaction denial.** Black *Extract Thought*; Red *Flashpoint*, *Incite*. `[R]`, and this is 3 of the system's 7 reaction-denial talents.
4. **Focus attrition.** Red *Shatter Focus* (enemy fails a test → −1 focus) feeds Black's *Coercive Pressure*, *Whispered Doubt*, *Predatory Insight*, *Puppeteer*. **This is synergy, not redundancy** — Red produces the state Black consumes.
5. **An Investiture regenerator each** (*Predatory Patience*/*Predator's Due* vs *Flashpoint*) — 3 of the system's 8.

That is 4 shared slots of 50, plus a synergy. **Everything else is disjoint**: Black has 5 vital-damage talents and 0 energy; Red has 6 energy and 0 vital. Black is the only tree in the game with `"cannot take actions"` (*Hollow Command*). Red is the only tree whose damage reads a movement rate (*Momentum's Edge*). Black's Attunement Key applies Weakened; Red's costs you your Reaction.

**Verdict: this pair is not a redundancy problem. Do not act on the 0.920.** If the designer wants a single fix from this pair, it is: **delete one of *Cruel Step* / *Reckless Advance*.**

---

### 2.5 ★★★★ deity/Civilization ↔ deity/Fate — the twin ally-buff square — **[R], with one clause of [D]**

> **Civilization — Lay Foundation** (Free Action, 1 Investiture, d0/L1): "designate a **10 ft square** in Attunement Range as a Foundation for the scene. Allies that begin their turn in a Foundation gain **+1 to all defenses until the start of their next turn**. You may sustain up to **your tier** Foundations."
>
> **Fate — Ordained Ground** (Free Action, 1 Investiture, d0/L1): "designate a **5 ft square** in Attunement Range as Ordained Ground for the scene. An ally that begins its turn on an Ordained Ground square gains **+1 to all defenses until the start of its next turn** and may use the Aid action at up to 30 ft range from that square. You may sustain up to **your tier** Ordained Ground squares."

Identical action type, identical cost, identical depth, identical level, identical duration, identical sustain cap, identical buff. The only differences are 10 ft vs 5 ft and the Aid rider. Jaccard 0.514 — and the residual is entirely the two proper nouns.

The upgrade ladders mirror each other too:
- **Link two squares:** Civilization *Trade Routes* (1A/1Inv, ally teleports between them as a Free Action) ↔ Fate *Weave the Thread* (2A/2Inv, ally Aids as a Free Action + free Reactive Strike).
- **Temp HP from standing in your square:** Fate *Bulwark Ground* (Passive, tier temp HP at start of round) ↔ Civilization *Bonds of Community* (Reaction, White-ranks temp HP + advantage) ↔ **and Order's *Bear Witness*** (Passive, White-ranks temp HP at start of round to Covenant allies). Three trees, three ally-temp-HP passives, two of them keyed off "start of each round."
- **Free-Action upgrade rider bought at placement:** Fate *Inevitable Snare* ↔ Order *Sealed Edict* — Jaccard 0.500, and structurally identical: "When you place a [X], spend an additional 1 Investiture to declare it [Upgraded]. When it triggers, it deals an additional [Tier][Die] [type] damage, and the target tests [Skill] vs. your [Colour]; on a failure, it is also [Condition]."

**The design docs are the cause, and they say so.** `DESIGN-GUIDE-CLAIMS.md` gives Civilization "White tests for **community-buff effects and coordination**" and gives Fate "White tests for **ordained-ground bulwark effects and ally-coordination**." Two trees were handed the same brief for their White half. The overlap starts upstream of the talents.

---

### 2.6 ★★★ leyline/White ↔ leyline/Blue — one **verbatim duplicate** across two leyline trees

This is the single worst individual case in the corpus, and it is between two trees the designer already believes are the problem cases:

> **leyline/White — Overwhelming Authority** (Special, 1 Investiture, d2, L3): "When you successfully influence a character, spend 1 Investiture. The target also becomes Disoriented until the end of your next turn."
>
> **leyline/Blue — Subtle Suggestion** (Special, 1 Investiture, d2, L3): "When you successfully influence a character, you may spend 1 Investiture. The target also becomes Disoriented until the end of your next turn."

**Jaccard 1.000.** Same action type, same cost, same depth, same earliest level, same trigger, same payload, different names, two different colours of the same atlas. The only textual difference is "you may". Neither tree produces an influence attempt of its own, so both are equally dead without an outside influence source — this is one card wearing two hats in the two trees that most need distinct identities.

Otherwise White↔Blue is low (rank ~50s): White's mitigation is Reaction+Investiture damage reduction, Blue's is illusions and disadvantage. They share the anti-influence niche (White *Counterpoint*, *Disciplined Mind*, *Unyielding Accord*; Blue *Anticipate*, *Baleful*) and the "negate an enemy talent" niche (White *Counterpoint* negates an influence effect; Blue *Counterspell* makes an Investiture talent fail; Chaos *Unweaving* ends a running effect — 3 trees, 3 talents, three different triggers → **[R] but genuinely differentiated**).

---

### 2.7 ★★★ heroic/Hunter ↔ heroic/Warrior — 0.423, rank 15 — **[R] on the shared stock, [D] on one card**

Five shared slots: *Combat Training* (verbatim, both d0/L1), *Swift Strikes* (verbatim), *Hardy*, *Mighty*, *Surefooted*. That is **20% of each tree**, and it is concentrated in the depth-0/1 band where a character actually is at levels 1–3.

**[D]:** *Swift Strikes* is Warrior d2/**L3** and Hunter d3/**L4**. Same card, one level cheaper in Warrior, and Warrior also has the free graze from *Combat Training* plus *Devastating Blow*'s 2d8 to spend the extra Strike on. Hunter's copy is worse purely by position.

Their identities do separate: Warrior owns the seven-mode stance system and the only Brace-modifying talents; Hunter owns the quarry mark, concealed traps, the animal companion (4 talents), and the only lifting of the once-per-turn same-weapon Strike rule (*Unrelenting Salvo*). **[R], mild — the fix is the shared stock, not the trees.**

---

### 2.8 ★★★ heroic/Agent ↔ heroic/Leader (0.605, rank 4) and heroic/Agent ↔ heroic/Warrior (0.532, rank 9)

**Agent↔Leader** shares *Hardy*, *Mighty*, *Baleful* plus the whole "raise the stakes / plot die / Complication" currency (Agent 6 talents, Leader 2) and the §1.3 contacts card. **[R]** — but Agent owns the only plot-die *reroll* in the game (*Opportunist*, *Double Down*) and Leader owns the command die; the currencies touch but the levers are different.

**Agent↔Warrior** is driven by `act:grantAction` — the only two trees with 3 action-granting talents each. **But this is a false positive on inspection:**
- Agent's three (*Quick Analysis*, *Fast Talker*, *Trickster's Hand*) are **Free Action, 2 focus, "+2 actions for [Cognitive/Spiritual/Physical] tests with Use a Skill, Gain Advantage, or an Agent talent."** These are **three copies of one card inside a single tree** — the worst *intra*-tree redundancy in the corpus, and it costs Agent three of its 25 slots for one mechanic split by test category.
- Warrior's three (*Cautious Advance*, *Flamestance*, *Windstance*) grant Actions to perform **standard actions everyone already has** (Brace, Gain Advantage, Disengage, attack). Per SYSTEM-PRIMER, "a talent that reproduces a standard action is worth roughly zero" — *Cautious Advance* spends 2 of your 3 Actions to get back 2 Actions restricted to Brace/Gain Advantage, which is a net loss.

So the *measured* overlap is real but the *value* is low on both sides. **Flag Agent's triplication as its own defect independent of the pairing.**

---

### 2.9 ★★ leyline/Red ↔ deity/Destruction — 0.594, rank 6 — **[D], and it is the clearest cross-atlas domination in the system**

Both are the energy-damage AoE trees. Red has 6 energy talents, Destruction has 5 + 8 dangerous-terrain talents. Compare like for like:

| | leyline/Red *Flame Surge* | deity/Destruction *Set Charge* |
|---|---|---|
| Cost | **2 Actions, 2 Investiture** | **1 Action, 1 Investiture** |
| Depth/Level | d1 / L2 | d0 / L1 |
| Payload | [Tier][Die] energy in [Size] (5 ft at Tier 1), **Athletics test halves it** | [Tier][Die] energy in **10 ft**, **no roll, no save** |
| Residue | none | **the point becomes dangerous terrain for the scene** |
| Detonation | immediate | **your choice, as a Free Action, on a declared trigger** |

*Set Charge* costs half as much, arrives a level earlier, hits a wider radius, cannot be saved against, leaves a permanent hazard, and lets you choose the timing. This is exactly what the leyline guide's *"Radiant-equivalent power lives in the Deity Domain trees"* intends — but it means a Red character who also takes Destruction (Red 2+ is one of Destruction's two gate colours, so Red players are the natural buyers) **has bought a strictly better version of their own tree's headline for one talent slot**. Red's *Arc Flash*, *Afterburn*, *Chain Detonation* still add value on top; Red's *Flame Surge* becomes dead weight.

Same shape, one atlas down: **deity/Destruction ↔ deity/Civilization (0.424)** share the persistent-square idiom, and *Fault Line*'s "structures and Constructs along the line take **triple damage**" is a written hard counter to Civilization's entire Combat Construct line.

---

### 2.10 ★★ leyline/Green ↔ deity/Death — 0.498, rank 10 — **[R], complementary**

Both create difficult-terrain squares (Green owns 6 of the game's 10 difficult-terrain talents; Death's *Bone Garden* is one more), both heal, both are Black/Green-adjacent. But Green heals **allies** (5 heal talents, 2 formulas, and *Reknit Form* is the only Injury removal in 365) while Death heals **only the caster** off enemy damage (*Consuming Decay* leeches half back). **[R] — genuinely distinct.** The notable thing is that Death is one of Green's two gate colours, so this is another "the deity tree is the leyline tree's upgrade" adjacency.

Related and stronger: **deity/Civilization *Forge Construct* ↔ deity/Death *Risen Servant*** (Jaccard 0.509) are the same statblock template — 1 Action, 1 Investiture, adjacent space, for the scene, HP = [Tier][Die], Speed 25 ft, defenses = yours minus N, one melee attack per turn dealing [Tier][Die], acts on your initiative immediately after your turn. **[D] — *Forge Construct* dominates**: it is d0/L1 (vs d2/L3), has +tier×2 more HP, deflect 1, defenses −2 rather than −3, needs no Harvested Remain, and has a **four-talent upgrade ladder** behind it (*Tempered Edge*, *Siege Form*, *Arsenal*, *Magnum Opus*). *Risen Servant* is a lone card with one supporting talent.

---

### 2.11 ★★ leyline/Green ↔ heroic/Scholar — 0.400, rank 21 — **the healing pair, and the one the designer should look at instead of Blue↔Scholar**

Healing is a 4-tree competency at 3+: Life 5, Green 5, Scholar 4, Envoy 3. Green and Scholar are the two non-deity healers and they *do* collide:

| | leyline/Green | heroic/Scholar |
|---|---|---|
| Repeatable heal | *Verdant Mend* (1A, 1 Inv, [Tier][Die] + Green mod) | *Field Medicine* (Action, 1 focus, Medicine rank added to their recovery die) → *Swift Healer* makes it a **Free Action** |
| Amplifier | *Resurgent Growth* (regen next turn) | *Applied Medicine* (+Lore ranks) |
| Condition removal | *Natural Recovery* (Opportunity: remove Afflicted/Disoriented/Stunned/Weakened) | *Ongoing Care* (**rest only**) |
| Revival | — | *Resuscitation* (revive Unconscious/recently dead) |
| Injury removal | ***Reknit Form* — the only one in 365** | — |
| Cost currency | Investiture | focus |

**[R], and cleanly separated by the guide's own boundary** ("Green heals deeply and removes Injuries; White heals shallowly and cannot"). The real difference is timing: Green heals **in combat, reactively** (*Mender's Instinct* is the only threshold-triggered healing Reaction in the game); Scholar's best healing is a **Free Action** (*Swift Healer*) but rides the patient's recovery die, a resource Scholar cannot replenish. **Not a domination either way.** The genuine problem is that Scholar's whole healing branch is 8 of 25 talents that key off resources and moments Scholar cannot create.

---

## 3. STRUCTURAL REDUNDANCY: THE DEITY TEMPLATE

This is the largest finding in the report and it is not a pair — it is all ten trees at once.

**Every deity tree has the identical node graph.** Verified over all 90 deity talents:

```
depth 0: 2 talents   (both gated "ColourA 2+; ColourB 2+")
depth 1: 4 talents   (two hanging off each entry)
depth 2: 2 talents   (each with an "A or B" prerequisite)
depth 3: 1 capstone
```

**Ten out of ten. Zero variation.**

And the slots are filled to a price list:

| Slot | The uniform shape | Exceptions across all 10 trees |
|---|---|---|
| Entry ×2 | **1 Action / 1 Investiture** | Death's *Reaper's Harvest* is a Passive; Fate's *Ordained Ground* and Civilization's *Lay Foundation* are Free Actions; Chaos's *Isolating Pressure* costs 2 Inv |
| depth-2 ×2 | **2 Actions / 2 Investiture** | — (near-universal) |
| Capstone | **3 Actions / 3 Investiture, once per scene** | **Death's *Raise Dead* costs 4 Inv; Chaos's *Unravel Everything* is the ONLY capstone with no once-per-scene limiter** |
| Special actions | **0 talents in all ten trees** | none — against a stated deity target of 15–20% Special |

Consequences the designer should weigh:

1. **The nine talents are the same nine talents ten times over, differing only in payload noun.** A player who has played one deity tree knows the pacing of all ten: two entries at L1, four riders at L2, two 2-Action plays at L3, a once-per-scene 3-Action button at L4.
2. **The rhythm is uniform because the price list is uniform**, so power differences between deity trees come entirely from *payload quality*, not from cost or structure. That is why the deity axis-sums are so unequal (§7): Civilization 28, Death 28, Life 27, Fate 26 … Order 19, Chaos 17, **Sovereignty 13** — all buying at the same prices.
3. **Chaos's uncapped capstone is a live outlier.** *Unravel Everything* is the one 3-Action/3-Investiture capstone with no "once per scene." Either that is intended and Chaos should be assessed as repeatable, or it is an omission.

**And the deity gate is a second structural redundancy.** All ten trees charge **two leyline colours at rank 2+**. The gate audit already establishes that nine of ten never test one of the two, and five get nothing at all from it (Order/Civilization/Fate White 2+, Knowledge Green 3+, Sovereignty White 3+). I add one observation: **because the gate is uniform, every deity character is also two-thirds of a leyline character** — and that is exactly why so many deity↔leyline overlaps in §2 exist. Destruction gates Red 2+ and duplicates Red's job. Knowledge gates Green 2+ and re-implements Green's *Pack Sense*. Death gates Black 2+ and re-implements Black's Weakened economy. **The gate structurally guarantees that each deity tree overlaps its own gate colours.**

---

## 4. STRICT DOMINATIONS — the consolidated list

These are the findings that matter most, because a dominated talent is a wasted slot rather than a redundant choice.

| # | Dominated | Dominating | Evidence |
|---|---|---|---|
| 1 | **leyline/Red *Flame Surge*** (2A/2Inv, d1/L2, [Size] radius, Athletics test halves) | **deity/Destruction *Set Charge*** (1A/1Inv, d0/L1, 10 ft, no roll, no save, leaves dangerous terrain, player-timed) | Half the cost, one level earlier, wider, unsaveable, plus permanent residue and delayed detonation. Red 2+ is Destruction's gate, so the same character can hold both. |
| 2 | **deity/Death *Risen Servant*** (d2/L3, costs a Harvested Remain, HP=[Tier][Die], def −3, 1 supporting talent) | **deity/Civilization *Forge Construct*** (d0/L1, no token, HP=[Tier][Die]+tier×2, deflect 1, def −2, 4 supporting talents) | Same statblock template, strictly better on every line, two depth steps shallower. |
| 3 | **deity/Power *Kneel*'s advantage clause** ("**you** have advantage vs Compelled/Frightened/Weakened", costs 1A + 1Inv + a Black vs Cognitive test) | **deity/Order *Lawkeeper's Eye*** ("you **and your allies** have advantage on attack tests against that character", Passive, free) | Free vs. an Action+Investiture+test; party-wide vs. self-only. |
| 4 | **deity/Knowledge *Studied Mark*'s reveal** (HP, conditions, Phys/Spirit def) | **deity/Life *Vital Diagnosis*** (HP, **max HP**, conditions, Phys/Spirit def, **for the scene**, **+ a party-wide +Tier Vital rider**) | Same action, same cost, same depth, same level; strictly more information plus a damage rider Knowledge doesn't get until *Pack Share* at L6. |
| 5 | **heroic/Hunter *Swift Strikes*** (d3/L4) | **heroic/Warrior *Swift Strikes*** (d2/L3) | Verbatim identical talent, one level cheaper, in a tree with better things to spend the extra Strike on. |
| 6 | **leyline/Blue *Collected*** (d2, **Blue 3+ = L6**) | **heroic/Envoy *Collected*** (d0, **L1**, free) | Verbatim identical talent. Blue spends a level-6, rank-3-gated slot on what Envoy gets as a free entry. Same applies to Blue's *Composed* (L6) vs Leader's *Focused Mind* (L1). |
| 7 | **leyline/Black *Unnerving Approach*** as a push (Free Action, **1 Investiture**, push [Size]) | **leyline/Red *Shockwave Slam*** (★ Special, **free**, push [Size] + half [Tier][Die] collision damage) | Red's is free, on a Special, and adds damage. Black's still uniquely creates Isolated, so this is domination on the push clause only. |
| 8 | **leyline/Red *Reckless Advance*** ↔ **leyline/Black *Cruel Step*** | *mutual* — Cruel Step is a flat 10 ft (better at Tier 1) but needs an Isolated target | Not domination but **mutual waste**: both trees' own profiles rank their copy in the bottom three. |

**Also note the inverse of #6, which is the more general fact:** the shared-stock talents are priced by *depth in the host tree*, not by their own value. *Hardy* is L2 in Leader and Warrior and **L6 behind White 3+** in leyline/White. *Collected* is L1 in Envoy and **L6** in Blue. *Mighty* is L2 in Warrior/Envoy and L4 in Red/Hunter. **The same card costs a leyline character up to five more levels than a heroic one.** That is a systematic tax on leyline trees that nobody chose.

---

## 5. leyline/Blue ↔ heroic/Scholar — treated rigorously, and NOT privileged

The designer flagged this pair. My rarity-weighted measure puts it at **rank 75 of 210 (0.172)**, well below Order↔Power, Chaos↔Knowledge, Envoy↔Leader, Civilization↔Fate. Here is the full accounting so the judgment is checkable.

### 5.1 What they actually share — exhaustively, three items

1. ***Collected*** — verbatim identical talent (+2 Cognitive & Spiritual defenses). Blue's is d2/**L6 behind Blue 3+**; Scholar's is d1/L2. **[D] to Scholar.**
2. **+tier max focus** — Blue's *Composed* ("max focus"); Scholar's *Clear Mind* ("max **and current** focus"). Same card, Scholar's is marginally better and four levels cheaper. **[D] to Scholar.**
3. **One disadvantage-imposer keyed to influence.** Scholar's *Keen Insight* ("After you Gain Advantage, the target must resist your influence or gain a disadvantage on their next test") is functionally a Blue card in a Scholar tree. It duplicates the *shape* of Blue's *Pattern Recognition* / *False Premise* / *Probability Cascade* / *Subtle Suggestion*.

**That is the whole list.** Three slots, two of which are the generic shared stock.

### 5.2 What they do not share — the disjoint set is enormous

| Blue has, Scholar has none of | Scholar has, Blue has none of |
|---|---|
| Investiture as its cost currency (16 of 25 talents) | focus as its cost currency (7 of 25); **zero** Investiture interaction |
| **The illusion subsystem** — *Phantom Double*, *Holographic Illusion*, *Phantom Barricade*, *Living Image* (Blue is the only creator of illusions in 365) | **The fabrial crafting economy** — *Efficient Engineer*, *Prized Acquisition*, *Inventive Design*, *Fine Handiwork*, *Overcharge*, *Experimental Tinkering* (6 talents; **monopoly**) |
| **Talent negation** — *Counterspell* is the only card that makes another character's talent FAIL as it activates | **Character-sheet rewriting** — *Erudition* / *Deep Study* / *Mind and Body* / *Emotional Intelligence* / *Deep Contemplation* grant and reassign **six skill ranks and seven expertises** (**monopoly**) |
| **0-Speed lock chain** — *Ghostly Walls* → *Absolute Stillness* | **Healing** — 3 heal formulas, *Resuscitation* (revive), *Ongoing Care* (condition removal on rest) |
| **Foreknowledge tokens** — *Forewarned* → *Intercept*, *Read Intent*, *Probable Outcome* | **Party-wide Action grant** — *Turning Point* (one of only 3 in the game) |
| Persistent physical zones (*Phantom Barricade*, *Ghostly Walls*) | Complication removal for an ally (*Contingency*) |
| 5 disadvantage-imposers — **the largest block in the game** | The plot-die *Overcharge* Free-Action Strike |

**Blue's `terrain_zone` 2, `information` 4, `summons` 1 against Scholar's 0/2/0. Scholar's `healing` 4, `exploration_utility` 5 against Blue's 0/3.**

### 5.3 So why does it *feel* like they do the same thing?

Not because of shared mechanics. Because of **shared negative space plus a shared party slot.** Both are:

- **Zero damage.** Confirmed twice for each (prose classifier and Foundry roll formulas). Blue: the word "damage" appears in **zero** of its 25 descriptions. Scholar: the word "damage" appears in **zero** of its 25 descriptions.
- **Intellect-forward** and passive-heavy (Blue 36% Passive, Scholar 40% Passive + 40% Special — the two highest non-Action profiles in the heroic/leyline atlases).
- **Reliant on other people's dice.** Blue's *Reactive Analysis* needs someone to fail; *False Premise* needs someone to succeed on a Cognitive test; *Counterspell* needs an enemy to spend Investiture. Scholar's *Contingency* needs an ally to roll a Complication; *Strategize* needs you to have Gained Advantage; *Turning Point* needs an identifiable enemy leader.
- **Slow to assemble.** Eight of Blue's 25 talents are unreachable before L6 (Blue 3+), and its three teeth (*Counterspell*, *Ghostly Walls*, *Absolute Stillness*) all arrive at L6 together. Scholar has 14 rank gates, six of them rank 3 = L6.

**Verdict: this is not a redundancy problem. It is two different trees answering the same *party* question — "what does the smart character who doesn't fight do?" — and answering it with the same *cadence*.** The fix, if the designer wants one, is not to differentiate their mechanics (they already are, radically) but to change what they *feel* like in a round: give one of them a repeatable, self-initiated, on-your-turn play. Blue's kit is 5 Reactions and 5 Specials, all waiting on somebody else; Scholar's is 10 Specials and 10 Passives, 10 of them pure downtime.

**If the designer must pick one pair to act on from this whole report, it should be Order↔Power or Civilization↔Fate, not Blue↔Scholar.**

---

## 6. THE INVERSE — MONOPOLIES AND SINGLE-SOURCED CAPABILITIES

A mechanic implemented by exactly one tree. Verified by full-corpus text search.

### 6.1 True monopolies (1 tree)

| Mechanic | Owner | Talents | Fragility |
|---|---|---|---|
| **Damage die size manipulation** (the d4–d12 ladder, both directions) | **deity/Sovereignty** | all 7 non-passive talents | **CRITICAL** — see §6.4 |
| **Fabrial crafting** | heroic/Scholar | *Efficient Engineer*, *Prized Acquisition*, *Inventive Design*, *Fine Handiwork*, *Overcharge*, *Experimental Tinkering* (6) | Low — it is 24% of Scholar and Scholar is otherwise fine at it |
| **Granting/reassigning skill ranks** | heroic/Scholar | *Erudition*, *Deep Study*, *Mind and Body*, *Emotional Intelligence*, *Deep Contemplation* | Low |
| **`"cannot take actions"`** (whole-turn action denial) | leyline/Black | ***Hollow Command*** (1 talent, d0/L1) | **HIGH** — see §6.3 |
| **Teleport** | deity/Civilization | ***Trade Routes*** (1 talent) — and it moves *allies between two Foundations*, not you | **HIGH** — the system has no self-teleport at all |
| **Ending combat without violence** | heroic/Envoy | *Calm Appeal* → *Peaceful Solution* | Medium — the only non-combat resolution mechanic in 365 |
| **Making enemies hostile to each other** | heroic/Leader | *Set at Odds* | Low |
| **Investiture-talent negation** | leyline/Blue | *Counterspell* (the only card that makes a talent fail as it activates) | Medium — the only mirror-match answer |
| **HP→Investiture conversion** | leyline/Black | *Sanguine Reservoir* → *Double Dip* | Low |
| **Injury removal** | leyline/Green | ***Reknit Form*** (the only removal of temporary or permanent Injuries in 365) | **HIGH** — Injuries are inflicted by 3 other trees and removable by one talent |
| **Resurrection** | deity/Death | *Raise Dead* (3A/4Inv, once/scene, inflicts an extra Injury) | Medium — Scholar's *Resuscitation* and Envoy's *Rallying Shout* cover the *recently dead / Unconscious* case |
| **Corpse interrogation** | deity/Death | *Speak with the Fallen* | Low |
| **Heal denial** ("cannot regain HP") | deity/Death | *Withering Touch* | Low |
| **Forced enemy reroll** | deity/Chaos | *Shatter Focus* | Low |
| **Upsizable granted bonus die** (command die d4→d10) | heroic/Leader | 5 talents | Low |
| **The stance system** (7 mutually-exclusive combat modes) | heroic/Warrior | 8 talents | Low |
| **Enemy Action taxation** | heroic/Warrior | *Stonestance* ("enemies within your reach must spend an additional Action to attack your allies") | Medium |
| **Shard equipment** | heroic/Warrior | *Shard Training*, *Shattering Blow*, *Meteoric Leap*, *Precise Parry* | Low |
| **Brace modification** | heroic/Warrior | *Cautious Advance*, *Defensive Position*, *Formation Drills* | Low |

### 6.2 Near-monopolies (2 trees) — thin, and worth knowing

| Mechanic | Trees | Talents |
|---|---|---|
| **Restrained** | Green (*Grasping Vines*), Fate (*Snare*) | 2 talents in 365 |
| **Immobilized** | Hunter (*Deadly Trap*), Power (*Unstoppable Advance*) | 2 talents |
| **Compelled** | Power (*Kneel*, *Absolute Authority*), Death (*Risen Servant* — immunity only) | Power is the sole producer |
| **Frightened** | Power, Death — **both as a prerequisite/immunity; NO talent in 365 applies Frightened** | 0 producers |
| **Reroll** | Agent (*Opportunist*, *Double Down*), Chaos (*Shatter Focus*) | 3 talents |
| **"Drop to 1 HP instead"** | White (*Unbreakable Line*), Death (*Death Ward*) | 2 talents |
| **Illusion** | Blue (3 talents), Green (*Natural Order* — negates them) | Blue is the sole creator |
| **Exhausted[−X]** | Red (*Reckless Gambit*), Scholar (*Anatomical Insight*) | 2 talents |
| **Isolated** | Black (4), Chaos (3) | Black's Attunement Key is the only *reliable* producer |
| **Determined** | Envoy (*Rousing Presence*, *Inspired Zeal*, *Instill Confidence*), White (*Collective Resolve*) | **[D] to Envoy** — Envoy's is 1 Action free at d0/L1 and becomes a Free Action via *Practical Demonstration*; White's is Special + Opportunity + 1 Investiture at d3/L4 |
| **Extra Reaction** | Blue (*Forewarned*, conditional), Envoy (*Foresight*, unconditional), Hunter (*Sidestep*, armour-gated) | 3 talents against a hard 1/round cap |
| **Ally buff square** | Civilization (*Lay Foundation*), Fate (*Ordained Ground*, *Bulwark Ground*) | The §2.5 duplicate |
| **Stunned (application)** | Agent (*Cheap Shot*) alone — Green and Envoy only *remove* it | **1 producer in 365** |

### 6.3 The two monopolies that are genuine system fragilities

**(a) Action denial has one card.** SYSTEM-PRIMER: *"Action denial (Stunned, Disoriented, Restrained) is the most valuable category in a 3-action economy."* The corpus delivers:
- `"cannot take actions"` — **one talent**: leyline/Black *Hollow Command* (2 Actions, 1 Investiture, Deception vs Spiritual, d0/L1).
- **Stunned** ("two fewer actions") applied by **one talent**: heroic/Agent *Cheap Shot* (1 Action, 1 focus, unarmed Thievery vs Cognitive, d0/L1).
- Restrained: 2 talents. Immobilized: 2 talents.

**Seven talents out of 365 remove enemy actions**, and if the party has no Black mage and no Agent, the party's *entire* answer to a boss's turn is Disoriented (11 trees, but it only costs the reaction and senses) and forced movement. That is a system-level hole, not a tree-level one.

**(b) The Investiture economy is one card printed three times.** Eight Investiture-regen talents exist in 365. Three of them are the identical passive from §2.2 (*Void Sense*, *Accumulate*, *Prognosis*). The other five: Black's *Predatory Patience* and *Predator's Due*, Red's *Flashpoint*, Death's *Reaper's Harvest*, Sovereignty's *Expose*. **Every leyline tree except Black and Red has zero regen against 13–15 Investiture-costing talents** (White 0/15, Blue 0/15, Green 0/13). **Seven of ten deity trees have zero.** So the answer to "how do I pay for this tree?" is *Draw Mana*, i.e. **50% uptime at Tier 1** for the whole level range this review covers.

### 6.4 The fragility case: deity/Sovereignty

Sovereignty is the one tree where a monopoly and a weakness coincide, and that is the definition of a fragility.

- It **monopolises** the damage-die-size ladder — all seven producing talents in the corpus, no other tree touches it in either direction.
- It has the **lowest axis sum in the game (13 of a possible 75)**, nine axes at zero, and is the only tree with **`damage_direct` 0, `healing` 0, `terrain_zone` 0, `summons` 0, `information` 0, `social_influence` 0, `exploration_utility` 0, `mobility` 0** simultaneously.
- Its promised signature resource **Decree** (a radius/zone, promised by both intent sources) exists in **no talent**; all nine are single-target.
- It is charged **White 3+** — a level-6, six-rank investment — and **tests White zero times**, while the design guide calls it *"the cleanest example of the color-thematic test rule."*
- My mechanical similarity scores Sovereignty at **0.000 against nine of the twenty other trees**, the most orthogonal tree in the system — but that orthogonality is because its one mechanic is not in anyone else's vocabulary, not because it does many distinctive things.

**And its elevate half is dominated anyway.** Sovereignty's *Exalt* (1 Action, 1 Investiture, one ally's damage die +1 step until the start of your next turn) buys roughly **+1 average damage per die** for one round. deity/Knowledge's *The Pack* (1 Action, 2 Investiture, **for the scene**) gives **every ally in range +[Insight count] Vital damage** against the marked creature. Same action, one more Investiture, permanent instead of one round, party-wide instead of one ally, Deflect-ignoring instead of not.

**Sovereignty is the single-sourced axis that is also the weakest tree. If the designer removes or reworks it, the die-size ladder leaves the system entirely.**

---

## 7. THE PER-AXIS CENSUS

Scores are mine. Where I diverge from the verified profile I say so and give the reason (§7.3).

### 7.1 The matrix

| Tree | dmg | dscl | ctrl | debf | prot | heal | buff | acte | mobi | terr | info | soc | expl | summ | reco | **Σ** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| leyline/White | 1 | 1 | 2 | 2 | **5** | 2 | 3 | 2 | 2 | 0 | 0 | 2 | 2 | 0 | 3 | 27 |
| leyline/Blue | 0 | 0 | 3 | **4** | 2 | 0 | 2 | 3 | 1 | 2 | **4** | 2 | 3 | 1 | 1 | 28 |
| leyline/Black | **4** | **4** | **4** | **4** | 1 | 1 | 2 | 2 | 1 | 1 | 0 | 2 | 0 | 0 | **4** | 30 |
| leyline/Red | **5** | 3 | 3 | 2 | 0 | 0 | 3 | 2 | **3**† | 1 | 1 | 1 | 1 | 0 | 1 | 26 |
| leyline/Green | 2 | 2 | 3 | 1 | 2 | **5** | 3 | 2 | 1 | **4** | 3 | 0 | 3 | 0 | 0 | 31 |
| heroic/Agent | 1 | 1 | 3 | 2 | 2 | 0 | 2 | **4** | 2 | 0 | 3 | **4** | **4** | 0 | 3 | 31 |
| heroic/Envoy | 1 | 1 | 3 | 2 | 3 | 3 | **4** | 3 | 0 | 0 | 0 | 3 | 2 | 0 | **5** | 30 |
| heroic/Hunter | 3 | 3 | 2 | 1 | 2 | 1 | 2 | 3 | 2 | 2 | 3 | 0 | **4** | 3 | 1 | 32 |
| heroic/Leader | 1 | 1 | 3 | 3 | 2 | 1 | **4** | 3 | 2 | 0 | 1 | **5** | 2 | 0 | 2 | 30 |
| heroic/Scholar | 0 | 0 | 1 | 2 | 2 | **4** | 2 | 3 | 0 | 0 | 2 | 1 | **5** | 0 | 2 | 24 |
| heroic/Warrior | **4** | 3 | 3 | 3 | **4** | 0 | 1 | 3 | 2 | 1 | 1 | 2 | 2 | 0 | 2 | 31 |
| deity/Chaos | **4** | 3 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 2 | 17 |
| deity/Civilization | **4** | **4** | 2 | 0 | 3 | 0 | 1 | 3 | 2 | 3 | 0 | 0 | 1 | **5** | 0 | 28 |
| deity/Death | **4** | **4** | 1 | 1 | 2 | 2 | 0 | 2 | 0 | 2 | 2 | 0 | 3 | 2 | 3 | 28 |
| deity/Destruction | **5** | 3 | 2 | 1 | 0 | 0 | 0 | 2 | 1 | **5** | 0 | 0 | 2 | 0 | 0 | 21 |
| deity/Fate | 3 | 3 | 3 | 2 | 2 | 0 | 2 | 3 | 0 | **5** | 2 | 0 | 1 | 0 | 0 | 26 |
| deity/Knowledge | **5** | **5** | 0 | 2 | 0 | 1 | 3 | 2 | 0 | 0 | 3 | 0 | 1 | 0 | 2 | 24 |
| deity/Life | 2 | 2 | 1 | 2 | 3 | **5** | **4** | 1 | 1 | 0 | 2 | 0 | 2 | 0 | 2 | 27 |
| deity/Order | 3 | 2 | 3 | 1 | 3 | 0 | 3 | 2 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 19 |
| deity/Power | 3 | 3 | 3 | 1 | 2 | 0 | 3 | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 20 |
| deity/Sovereignty | 0 | 0 | 1 | **4** | 2 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **13** |

† my one divergence — see §7.3.

### 7.2 Per-axis: commodity, contested, or monopoly

| Axis | Σ | trees >0 | trees ≥3 | 5s | 4s | Verdict |
|---|---|---|---|---|---|---|
| **damage_direct** | 55 | 18/21 | **12** | Destruction, Knowledge, Red | Chaos, Civilization, Death, Warrior, Black | **COMMODITY.** 12 of 21 trees have a real damage competency; 3 have none (Blue, Scholar, Sovereignty). Damage is the least distinguishing thing a tree can do. |
| **damage_scaling** | 48 | 18/21 | 11 | Knowledge | Civilization, Death, Black | **COMMODITY**, but note Knowledge is the lone 5 — it is the only tree that multiplies dice by a counter (`[Tier][Die] per Insight`). |
| **control** | 49 | 20/21 | 12 | — | Black | **COMMODITY BY COUNT, MONOPOLY BY SUBSTANCE.** 12 trees at 3+, but the substance is thin (§6.3): 20 trees can Disorient or push; **one** can remove a whole turn. Nobody scores 5 because nobody deserves it. |
| **debuff** | 43 | 20/21 | 6 | — | Sovereignty, Black, Blue | **CONTESTED.** And badly served by the engine: disadvantage is produced by 14 talents in 9 trees and **consumed by nothing**, and it is binary — Blue's five disadvantage talents largely do one talent's work. |
| **protection** | 42 | 17/21 | 6 | **White** | Warrior | **NEAR-MONOPOLY.** White is the only 5 and the gap is real: it holds the only 2 flat damage-reduction talents (*Interposing Shield*, *Devoted Conduit*, *Shield Wall*) and 7 Reactions. Warrior's is self-and-Brace, not ally mitigation. 4 trees have zero. |
| **healing** | 25 | **10/21** | 4 | **Life, Green** | Scholar | **SCARCE.** The lowest-coverage combat-relevant axis: 11 of 21 trees cannot restore a point of anything to anyone. Life owns the 5 largest heal formulas; Green owns depth and the Injury monopoly; Scholar owns Free-Action healing and revival; Envoy owns focus. Four suppliers for 21 trees. |
| **buff** | 47 | 18/21 | 10 | — | Life, Envoy, Leader | **COMMODITY, AND OVERSTATED.** 45 talents grant advantage across 13 trees and **only 7 talents in 5 trees consume it** — and advantage is binary, so a second source in the same round is worth **literally zero**. The real buff currencies are Leader's command die (numeric, stacking, upsizable) and Life's/Knowledge's flat damage riders. |
| **action_economy** | 48 | 20/21 | 9 | — | Agent | **CONTESTED**, and the leader (Agent) gets there by printing one card three times (*Quick Analysis*/*Fast Talker*/*Trickster's Hand*). Only 3 talents in 365 grant an ally an Action (*Synchronized Assault*, *Turning Point*, *Flamestance*). Only 3 grant an extra Reaction against a hard 1/round cap. |
| **mobility** | 21 | 13/21 | **1**† | — | — | **THE SYSTEM'S THINNEST AXIS.** No tree above 3. 8 trees at zero, including **six of ten deity trees**. One teleport in 365 (*Trade Routes*, and it moves allies). The standard movement bump (`+10 ft`) is printed 4 times: *Surefooted* ×3 and Destruction's *Walking Ruin*. |
| **terrain_zone** | 26 | 10/21 | 4 | **Destruction, Fate** | Green | **MONOPOLISED BY THREE.** 11 of 21 trees cannot touch the map at all. Destruction owns *dangerous* terrain (8 of the 11 talents); Green owns *difficult* terrain (6 of 10); Fate owns tokens. Civilization is fourth and its *Bastion* re-implements Green's difficult terrain. |
| **information** | 29 | 14/21 | 5 | — | Blue | **CONTESTED-THIN.** Blue is the only 4. Only 4 talents reveal a statblock (*Sharp Eye*, *Vital Diagnosis*, *Studied Mark*, *Pack Share*) and 5 read a declared next action (*Forewarned*, *Intercept*, *Read Intent*, *Lawkeeper's Eye*, *Read the Threads*). 7 trees at zero. |
| **social_influence** | 24 | **11/21** | 3 | **Leader** | Agent | **MONOPOLY.** Leader has 11 influence-touching talents; the next tree (Blue) has 4. **Ten of 21 trees have zero, including all ten deity trees but Order and Power at 1.** If nobody at the table plays Leader, Agent or Envoy, the party has almost no talent-based social leverage. |
| **exploration_utility** | 39 | 17/21 | 6 | **Scholar** | Agent, Hunter | **HEROIC-OWNED.** All three 4-5s are heroic. Scholar is 40% downtime (10 of 25 talents do nothing after initiative). 4 trees at zero — Black, Order, Power, Sovereignty. |
| **summons** | 11 | **4/21** | 2 | **Civilization** | — | **THE MOST MONOPOLISED AXIS IN THE SYSTEM.** 17 of 21 trees have zero. Civilization has 6 talents; Hunter 4 (and requires an out-of-tree companion it never grants); Death 1 (*Risen Servant*, dominated per §4); Blue 1 (*Phantom Double*, 1 HP, takes no actions). |
| **resource_economy** | 35 | 15/21 | 5 | **Envoy** | Black | **THIN AND MISPRICED.** Envoy is the only 5 (4 of 8 focus-restorers). 8 Investiture regenerators exist, 3 of which are the same card (§2.2). **6 trees at zero**, including four deity trees that spend 6-9 Investiture each. |

**Reading of the census:** the axes with 10+ trees at 3 or better — `damage_direct`, `damage_scaling`, `control`, `buff`, `action_economy` — are commodities, and it is no accident that these are the ones the designer's questions circle. The axes that actually distinguish trees are **healing (10 trees), terrain_zone (10), social_influence (11), summons (4)** — three of the four are heroic- or deity-only, and the fourth is essentially one tree.

### 7.3 My one divergence from the verified profiles

**leyline/Red `mobility` 2 → 3.** The profile scores 2. Red has four talents that move the character — *Reckless Advance* (d0), *Explosive Leap* (d3, Free Action, no cost), *Unstoppable* (d5, move half Speed free after dealing damage on a Fast turn), plus *Surefooted*-equivalent absent — and, uniquely in the corpus, **its damage ceiling is a function of how far it moved**: *Momentum's Edge* pays "bonus impact damage equal to your Speed" for moving 20 ft into a Strike. Red is the only tree where movement is a damage stat. That is "a real, usable competency; several talents, at least one good one" — a 3. (I note the caveat the census raised: *Momentum's Edge* references `@movement.walk.rate`, a DerivedValueField object, so the rider may deliver nothing in Foundry. **That is an implementation bug, not a design fact**, and I score the design.)

I accept every other profile score. Notably I do **not** raise anyone to `mobility` 4-5: nothing in the corpus deserves it, and that is itself the finding.

---

## 8. RANKED SUMMARY — THE WORST OFFENDERS

1. **The deity template** — all ten trees share one node graph (2/4/2/1), one price list, one capstone shape, and zero Special actions. The most consequential redundancy in the system because it is unanimous.
2. **The shared-stock layer** — 41 slots (11%), concentrated at 24% in Agent/Envoy/Leader, and priced by host-tree depth rather than value (*Collected* is L1 in Envoy and L6 in Blue).
3. **The identical Investiture passive** — *Void Sense* / *Accumulate* / *Prognosis*: same action, cost, depth, level, trigger, cap, amount, in three deity trees. Three of the system's eight regen talents.
4. **deity/Order ↔ deity/Power (rank 1)** — same ally temp-HP+advantage package, same damage redirection, same party-advantage-on-a-marked-enemy, same Cognitive-attack spirit damage. `[R]` overall, `[D]` on *Kneel*'s advantage clause.
5. **deity/Civilization *Lay Foundation* ↔ deity/Fate *Ordained Ground*** — Jaccard 0.514 and the residual is two proper nouns. Both design docs assign the same White brief.
6. **leyline/White *Overwhelming Authority* ↔ leyline/Blue *Subtle Suggestion*** — **Jaccard 1.000**. The same card, in two leyline trees, at the same depth, same level, same cost, same action type.
7. **heroic/Envoy ↔ heroic/Leader (rank 5)** — the same architecture (Key ally-buff + rider tree), 4 verbatim shared slots, and the differentiating talents all sit past L3.
8. **deity/Chaos ↔ deity/Knowledge (rank 3)** — same mark-place-detonate loop, same regen passive, same 3A/3Inv all-marks-detonate capstone.
9. **heroic/Agent's internal triplication** — *Quick Analysis* / *Fast Talker* / *Trickster's Hand* are one card split by test category, 12% of the tree.
10. **leyline/Red *Flame Surge* dominated by deity/Destruction *Set Charge*** — half cost, one level earlier, wider, unsaveable, leaves residue, player-timed; and Red 2+ is Destruction's gate.
11. **heroic/Hunter ↔ heroic/Warrior** — 5 shared slots (20%) all in the depth-0/1 band, and *Swift Strikes* is one level cheaper in Warrior.
12. **leyline/Black *Cruel Step* ↔ leyline/Red *Reckless Advance*** — the same bad talent, twice, both flagged bottom-three by their own profiles.

**Explicitly NOT an offender: leyline/Black ↔ leyline/Red at the census's 0.920.** Four shared slots of fifty; the cores are disjoint; one of the four "overlaps" is a synergy (Red's *Shatter Focus* feeds Black's focus economy).

---

## 9. WHAT WOULD SETTLE THE OPEN QUESTIONS

Three claims in this report I could not close inside the 365-talent fence:

1. **Whether *Momentum's Edge* delivers anything.** `@movement.walk.rate` is a DerivedValueField object; if it resolves to ~30 it is 3× every other damage rider in the game, and if it resolves to `NaN`/0 Red's damage ceiling is much lower than I scored. **Settled by:** rolling *Momentum's Edge* once at a live table and reading the chat card. This is a `🤖` bench row, not a design question.
2. **Whether *Overcharge* (Scholar) does anything at all.** It requires "a fabrial attack," and no talent in any of the 21 trees defines what a fabrial attack is or does. **Settled by:** the system's own equipment rules, which are out of scope by the designer's ruling.
3. **Whether the domination in §4 #1 matters at the table.** *Set Charge* beating *Flame Surge* on every printed term is certain; whether 1d6 vs 1d6 in a 10 ft radius is decisive depends on adversary HP and Deflect, which are explicitly out of scope. **Settled by:** an adversary-inclusive pass, or a single playtest of a Red/Destruction character.

One recommendation that needs no further evidence: **the shared-stock layer should be lifted out of the trees entirely.** *Hardy*, *Mighty*, *Collected*, *Composed*, *Surefooted*, *Baleful*, *Customary Garb* and *Well Dressed* are generic character options masquerading as tree identity. Printing them once, outside the atlases, would return **41 slots** — enough to give leyline/Blue three real cards, heroic/Scholar two combat turns, and every deity tree the Special action the design guide asks for and none of them has.

## Adversarial verification

**25 load-bearing claims checked: 7 confirmed, 12 corrected, 6 refuted.**

The report's central substantive conclusions survive: the deity node graph is genuinely identical 2/4/2/1 across all ten trees; the Void Sense / Accumulate / Prognosis passive is one card printed three times; Lay Foundation and Ordained Ground are the same card with two proper nouns, and both design-guide quotes that caused it are verbatim; Overwhelming Authority and Subtle Suggestion differ by the words "you may"; and the census's Black<->Red 0.920 really is an artefact (Black 5 vital / 0 energy, Red 6 energy / 0 vital, both counts exact). But the arithmetic is loose in a dozen places and three exclusivity claims are false in ways that change conclusions. The shared-stock total is 39 slots (10.7%), not 41 (11.2%) — the report double-counts the two Shatter Focus slots its own §1.4 excludes, and its §1.2 tree table ("every deity tree 0") contradicts its own atlas total ("deity 1/90"). Two of the eight "strict dominations" collapse on reading the text: Risen Servant sustains up to TIER servants against Forge Construct's exactly ONE, so it is a trade not a domination; and Kneel's advantage clause is a standing free rider that only needs a Compelled/Frightened/Weakened target — which the Black Attunement Key, mandatory for every Power character, supplies on every Draw Mana. The §6.3 "action denial has one card" fragility is the worst error: the enumeration sums to six not seven, and it omits Power's Kneel (Compelled = "must spend its next action either moving toward you or doing nothing", d0/L1, repeatable), Absolute Authority, Puppeteer, Incite and Stonestance. What survives is the much narrower true claim that whole-turn denial is one card. Biggest miss: the rank-3 = level-6 rule applies to SKILL ranks too, and the dossier's earliestLevel column silently ignores it — 36 of 150 heroic talents (24%) are rank-3 gated, so every heroic depth/level argument in the report is built on numbers it knew were wrong (it applies the rule once, to Scholar, and nowhere else). Applying it consistently strengthens the report's Envoy<->Leader finding and weakens its Hunter domination. Second-biggest miss: it never ran its own duplication test INSIDE trees except anecdotally — Sovereignty's nine talents are built from two clauses ("damage die size increases by one step (maximum d12)" x4, "decreases by one step (minimum d4)" x5), a denser redundancy than any cross-tree pair in the report, sitting in the tree it calls weakest.

### Claims

1. **CORRECTED** — 41 of 365 slots (11.2%) are a talent that also exists in another tree; heroic 30/150 (20%), leyline 10/125 (8%), deity 1/90 (1%) — while the per-tree table says every deity tree is 0 (0%).
   - Evidence: Exact-name duplicate sweep over all-talents.json returns 12 duplicated names / 39 slots, including the 2 Shatter Focus slots. §1.4 of the report itself declares Shatter Focus a naming collision with DIFFERENT mechanics, not shared stock (leyline/Red: Reaction, free, 'when a character within Attunement Range fails a test, it loses 1 focus'; deity/Chaos: Reaction, 1 Investiture, 'an enemy bearing one of your Omens... rerolls and takes the lower result'). Excluding it and adding the two renamed Composed variants (Leader/Focused Mind d0/L1, Scholar/Clear Mind d1/L2) gives 39. Per-tree recount: Agent 6, Envoy 6, Leader 6, Hunter 5, Warrior 5, Scholar 2 (heroic 30); White 1, Blue 3, Black 2, Green 2, Red 1 (leyline 9); deity 0.
   - Corrected: 39 of 365 slots (10.7%) are shared stock: heroic 30/150 (20%), leyline 9/125 (7.2%), deity 0/90 (0%). The heroic concentration finding — Agent, Envoy and Leader each spending six of twenty-five slots on cards that are not theirs — is unaffected and is the strongest half of the finding.
2. **CORRECTED** — Hardy exists in 7 trees; White's copy is behind White 3+ (L6), Leader's and Warrior's are d1/L2 — 'same talent, five levels apart'.
   - Evidence: Hardy: leyline/White d3/L6 (White 3+), leyline/Black d2/L3, leyline/Green d2/L3, heroic/Agent d2/L3, heroic/Hunter d2/L3, heroic/Leader d1/L2, heroic/Warrior d1/L2. L6 minus L2 is four levels.
   - Corrected: Seven trees, four levels apart. The report's more general §4 claim — 'the same card costs a leyline character up to five more levels than a heroic one' — is separately CONFIRMED via Collected (leyline/Blue d2/L6 behind Blue 3+ vs heroic/Envoy d0/L1, free, no prerequisite).
3. **CONFIRMED** — Every deity tree has the identical node graph: depth 0 = 2 talents, depth 1 = 4, depth 2 = 2, depth 3 = 1 capstone. Ten out of ten. Zero variation.
   - Evidence: Depth histogram over all 90 deity talents returns {0:2, 1:4, 2:2, 3:1} for Chaos, Order, Civilization, Death, Destruction, Fate, Power, Life, Knowledge and Sovereignty without exception. Both entries in every tree carry the two-colour rank-2 gate; every depth-2 node carries an 'A or B' prerequisite; every capstone is depth 3.
4. **CORRECTED** — The deity price list is uniform: entries 1 Action / 1 Investiture (four named exceptions), depth-2 pairs 2 Actions / 2 Investiture with no exceptions ('near-universal'), capstone 3 Actions / 3 Investiture once per scene.
   - Evidence: The entry exceptions are complete and correct (Death/Reaper's Harvest Passive; Fate/Ordained Ground and Civilization/Lay Foundation Free Actions; Chaos/Isolating Pressure 2 Investiture). But six of the twenty depth-2 talents deviate from 2A/2I: Death/Necrotic Cascade 1A/1I, Death/Risen Servant 1A/1I, Life/Lifeline 1A/2I, Knowledge/Death Mark Passive/no cost, Knowledge/The Pack 1A/2I, Sovereignty/Sovereign's Balance 1A/2I. The report's table prints an em-dash (no exceptions) for that row.
   - Corrected: The depth-2 price is 2A/2I in 14 of 20 cases (70%), not near-universal. Death, Life, Knowledge and Sovereignty all price at least one depth-2 node below the template. The capstone claims stand exactly: Chaos/Unravel Everything is verified as the only capstone lacking 'Once per scene' (the other nine all carry the phrase verbatim), and Death/Raise Dead is the only 4-Investiture capstone.
5. **CORRECTED** — A player who has played one deity tree knows the pacing of all ten: two entries at L1, four riders at L2, two 2-Action plays at L3, a once-per-scene 3-Action button at L4.
   - Evidence: Seven of the forty depth-1 deity talents are colour-rank-3 gated and therefore L6, not L2: Order/Sealed Edict (Blue 3+), Life/Adaptive Mutation (Green 3+), Life/Surgical Precision (Blue 3+), Knowledge/Killing Blow (Red 3+), Knowledge/Pack Share (Green 3+), Sovereignty/Decree of Ruin (Black 3+), Sovereignty/Investiture of Authority (White 3+).
   - Corrected: The NODE GRAPH is uniform across all ten trees (confirmed); the LEVEL pacing is not. Four of ten trees hold back one or two depth-1 riders behind a rank-3 gate to level 6 — Sovereignty, Life and Knowledge each lose two of their four L2 riders that way, which is a large part of why those trees feel differently paced despite identical shape.
6. **CONFIRMED** — leyline/White Overwhelming Authority and leyline/Blue Subtle Suggestion are the same card at Jaccard 1.000 — same action type, cost, depth, earliest level, trigger and payload, differing only in 'you may'.
   - Evidence: White/Overwhelming Authority (Special, 1 Investiture, d2, L3, White 2+): 'When you successfully influence a character, spend 1 Investiture. The target also becomes Disoriented until the end of your next turn.' Blue/Subtle Suggestion (Special, 1 Investiture, d2, L3, Blue 1+): 'When you successfully influence a character, you may spend 1 Investiture. The target also becomes Disoriented until the end of your next turn.' Both verbatim as quoted. The one substantive difference the report notes but does not price: White's spend is mandatory, Blue's optional.
7. **CONFIRMED** — deity/Civilization Lay Foundation and deity/Fate Ordained Ground are the same card (identical action type, cost, depth, level, duration, sustain cap and buff; differing only in 10 ft vs 5 ft and the Aid rider), and the two design guides handed both trees the same White brief.
   - Evidence: Both talents quoted verbatim and correctly; both Free Action / 1 Investiture / d0 / L1 / scene duration / 'sustain up to your tier' / '+1 to all defenses until the start of their next turn'. DESIGN-GUIDE-CLAIMS.md, Kethane-Civilization: 'White tests for community-buff effects and coordination (Trade Routes, Bonds of Community)'; Olvarra-Fate: 'White tests for ordained-ground bulwark effects and ally-coordination'. Both verbatim. The causal claim is stronger than the report makes it: the guide's Civilization brief names Trade Routes and Bonds of Community as the White half and never asks for a Foundation zone at all, so Lay Foundation is a tree-side invention that landed on Fate's shape.
8. **CONFIRMED** — deity/Chaos Void Sense, deity/Knowledge Accumulate and deity/Life Prognosis are one card written three times — same action type, cost (none), depth, earliest level, trigger, frequency cap and amount.
   - Evidence: All three are Passive, no cost, depth 1, L2. Void Sense: '...when an enemy bearing one of your Omens in Attunement Range takes damage from any source, you recover 1 Investiture' (once per round). Accumulate: 'When that creature takes damage from any source, you recover 1 Investiture once per round.' Prognosis: 'When a Diagnosed creature takes damage from any source, you recover 1 Investiture once per round.' All three quotations verbatim. All three trees also open with a 1-Action / 1-Investiture depth-0 mark as claimed (Entropy Strike, Studied Mark, Vital Diagnosis).
9. **CORRECTED** — Chaos and Knowledge both close with a 3-Action / 3-Investiture capstone that removes all marks for '[Tier][Die] + attribute damage each' (Unravel Everything / The Final Study).
   - Evidence: Unravel Everything: places an Omen on EVERY enemy in Attunement Range up to cap, then removes all Omens, 'each removed Omen deals [Tier][Die] + Awareness spirit damage' — AoE, per-mark, with an attribute adder. The Final Study: 'test Red vs. Physical against the creature bearing your Insight. On success, deal [Tier][Die] Vital damage per Insight and remove all Insight' — single target, dice multiplied by the counter, no attribute term, and gated on a test.
   - Corrected: Both are 3A/3I mark-clearing capstones, but they are different machines: Chaos's is an untested AoE that fires one [Tier][Die]+Awareness packet per enemy, Knowledge's is a tested single-target strike whose dice count is the Insight stack. The shared structure is 'spend all marks at once', not the payload shape.
10. **CONFIRMED** — The census's Black<->Red 0.920 (rank 1 of 210) is an artefact and should not be acted on: only 4 shared slots of 50, the cores are disjoint, and one of the four overlaps is actually a synergy.
   - Evidence: Damage-type sweep over all 365: leyline/Black has 5 vital-damage talents (Spoils of Isolation, Severance, Sovereign of Solitude, Withering Ray, Dark Investiture) and 0 energy; leyline/Red has 6 energy (Kindle, Searing Bolt, Flame Surge, Arc Flash, Afterburn, Chain Detonation) and 0 vital. Both counts exact as stated. Hollow Command is the corpus's only 'cannot take actions'. The synergy is real: Red/Shatter Focus strips focus on any failed test in range, and Black's Coercive Pressure ('When an enemy within Attunement Range loses focus, it has a disadvantage on its next Cognitive test'), Whispered Doubt, Predatory Insight ('Regain 1 focus when any character reaches 0 focus') and Puppeteer ('a character... with 0 focus') all consume that state. The near-duplicate mobility pair is also real: Cruel Step (1A/1I, move 10 ft toward an Isolated character, no Reactive Strikes) vs Reckless Advance (1A/1I, move [Size] ft toward a character or objective, no reactions).
11. **REFUTED** — Methodological premise: 'The two measures agree with each other and both disagree with the census's function-vector ranking.'
   - Evidence: The report's own §2.6 falsifies this. The corpus's single most identical cross-tree pair — White/Overwhelming Authority vs Blue/Subtle Suggestion, which the Jaccard measure scores 1.000 — is ranked by the rarity-weighted measure at 'rank ~50s'. The two measures disagree at exactly the case where agreement would have been most probative. Worse, the rarity-weighted measure scores deity/Sovereignty at 0.000 against nine of twenty trees and calls it 'the most orthogonal tree in the system' at the same moment the report concludes Sovereignty is the emptiest tree in the game (axis sum 13, nine axes at zero). A metric that ranks the game's least capable tree as its most distinctive is measuring private vocabulary, not play. The substantive conclusion about Black<->Red is nevertheless correct, and it is correct on the talent text, not on the competing metric — the report leads with its weaker argument.
12. **REFUTED** — Strict domination #2: deity/Death Risen Servant is dominated by deity/Civilization Forge Construct — 'same statblock template, strictly better on every line, two depth steps shallower'.
   - Evidence: Forge Construct: 'You may sustain one active Construct.' Risen Servant: 'You may sustain up to your tier Risen Servants.' At Tier 2 that is two servants — two [Tier][Die] keen attacks per round against the Construct's one base attack. Risen Servant is additionally 'immune to Frightened, Compelled, and Disoriented'; Forge Construct has no condition immunities. Forge Construct wins on HP (+tier x2), deflect 1, defenses -2 vs -3, depth (d0/L1 vs d2/L3), no token cost, and a four-talent upgrade ladder.
   - Corrected: Forge Construct is better as a single durable, upgradeable entity; Risen Servant is better as a scalable count with condition immunity. Neither strictly dominates. The report reads the two statblocks line-by-line and stops before the sustain clause, which is the line that decides it.
13. **CORRECTED** — Strict domination #3: deity/Power Kneel's advantage clause is dominated by deity/Order Lawkeeper's Eye — 'free vs an Action+Investiture+test; party-wide vs self-only'.
   - Evidence: Kneel's full text: 'Spend 1 Investiture and choose a character in Attunement Range. Test Black vs. Cognitive. On a success, the target is Compelled... You have an advantage on attack tests against any Compelled, Frightened, or Weakened character in Attunement Range.' The advantage sentence is a standing rider on the talent, not a consequence of the test succeeding — the Action and Investiture buy Compelled. And Power gates Black 2+, so every Power character carries the Black Attunement Key, which per SYSTEM-PRIMER makes 'enemies you can see in Attunement Range with no ally within 5 ft' Weakened on every Draw Mana, for free.
   - Corrected: Lawkeeper's Eye is better — party-wide, unconditional, Passive — but Kneel's advantage clause costs nothing and fires off the free Black key against any isolated enemy. The domination is on scope (party-wide vs self-only), not on price, and the report's pricing argument is wrong.
14. **CORRECTED** — Strict domination #4: deity/Knowledge Studied Mark is strictly dominated by deity/Life Vital Diagnosis — more information at the same price, and Vital Diagnosis 'matches it as a damage rider'.
   - Evidence: Studied Mark places 2 Insight. Predatory Strike (Knowledge's d0/L1 entry) deals 'bonus Vital damage equal to [Tier][Die] per Insight on the target' — so those 2 Insight are worth 2 x [Tier][Die] (2d6 at Tier 1, 4d8 at Tier 2) on the very next Strike, and they persist and accumulate via Accumulate up to a cap of 5. Vital Diagnosis's rider is 'additional Vital damage equal to your Tier' — 1 or 2 flat, party-wide.
   - Corrected: Vital Diagnosis dominates Studied Mark on the INFORMATION clause only (adds max HP, states 'for the scene'). As a damage rider Studied Mark is worth several times more to the mark-holder from level 1, and more still as Insight stacks. The report's own §7.2 correctly identifies Knowledge as the only tree that multiplies dice by a counter; §4 then prices that counter at zero.
15. **REFUTED** — Only 3 talents in 365 grant an ally an Action (Synchronized Assault, Turning Point, Flamestance).
   - Evidence: Flamestance grants the WARRIOR an action, not an ally: 'when only one enemy is in reach and no allies are, gain an Action to attack or Gain Advantage.' Text sweep for ally action grants returns at least nine: heroic/Leader Synchronized Assault ('allies up to your ranks in Leadership gain an Action'), heroic/Scholar Turning Point ('you and your allies gain an Action on your next turns'), deity/Order Concord ('an ally... may, as a Free Action on its turn, grant any other Covenant ally the benefit of the Aid action'), deity/Fate Weave the Thread (Free-Action Aid plus 'a free Reactive Strike'), deity/Fate Foreknown Strike (ally triggers a Snare 'as a Free Action on its turn'), deity/Fate Thread of Inevitability ('grants its standing ally a free Strike or Aid'), deity/Knowledge The Final Study ('each ally... may immediately make a free Strike'), deity/Civilization Trade Routes ('an ally... may teleport to the other as a Free Action'), deity/Sovereignty Expose ('any ally... may make a Reactive Strike').
   - Corrected: At least nine talents grant an ally an action or free action, and six of the nine are deity talents. Ally action-granting is a deity-atlas competency the report's action_economy axis reading misses entirely — which matters, because it is the axis it calls 'contested' and awards to Agent.
16. **REFUTED** — System fragility: 'Seven talents out of 365 remove enemy actions', so a party with no Black mage and no Agent has no answer to a boss's turn but Disoriented and forced movement.
   - Evidence: The report's own enumeration sums to six, not seven (Hollow Command 1 + Cheap Shot 1 + Restrained 2 + Immobilized 2). It omits: deity/Power Kneel (d0/L1, 1A/1I, repeatable — Compelled: 'the target must spend its next action either moving toward you or doing nothing'); deity/Power Absolute Authority ('you choose the target's action on its next turn'); leyline/Black Puppeteer ('choose one of its actions on that turn'); leyline/Red Incite ('it must Strike the nearest character or lose its Reaction'); heroic/Warrior Stonestance ('enemies within your reach must spend an additional Action to attack your allies').
   - Corrected: The action-denial bench is roughly eleven talents across seven trees (Black, Red, Green, Agent, Hunter, Warrior, Fate, Power). The narrow claim that survives, and is worth keeping, is the one the text supports exactly: whole-turn denial — the literal phrase 'cannot take actions' — exists on exactly one talent in 365, leyline/Black's Hollow Command, at d0/L1 for 2 Actions and 1 Investiture.
17. **REFUTED** — deity/Sovereignty's elevate half is dominated anyway: Exalt is beaten by deity/Knowledge's The Pack (same action, one more Investiture, scene instead of one round, party-wide instead of one ally, Deflect-ignoring).
   - Evidence: The Pack: 'For the scene, allies in Attunement Range deal bonus Vital damage equal to your Insight count on attacks against the creature bearing your Insight' — restricted to the single marked creature, at depth 2 / L3, behind Accumulate or Pack Share (Pack Share being Green 3+ = L6). Exalt: d0/L1, 1A/1I, raises a chosen ally's damage die one step against everything they attack, with no target restriction.
   - Corrected: The Pack is stronger against one focused target; Exalt is unrestricted and available at level 1 with no prerequisite. They are not comparable enough for a domination verdict, and the report's own §6.4 framing ('dominated anyway') overstates the case it needs least — Sovereignty's real problem is the missing Decree, not this comparison.
18. **CONFIRMED** — deity/Sovereignty's promised signature resource Decree exists in no talent; all nine are single-target; it is charged White 3+ and tests White zero times, while the guide calls it 'the cleanest example of the color-thematic test rule'.
   - Evidence: All nine Sovereignty talents read in full: Censure, Exalt, Decree of Ruin, Expose, Investiture of Authority, Sovereign's Favor, Sovereign's Balance, Edict of the Fallen, Sovereignty. No zone, radius or aura appears in any of them. Every one names 'a creature', 'an ally', or 'one willing ally and one enemy'. Tests: Censure (Black vs Cognitive), Decree of Ruin (Black vs Cognitive), Edict of the Fallen (Black vs Spiritual) — White is never rolled. DESIGN-GUIDE-CLAIMS.md, Verdannis: 'Homebrew resource: Decree zones (declared laws within a radius)' and 'Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule.' Both verbatim. One nuance the report overstates: Edict of the Fallen carries a party-wide rider ('each ally in Attunement Range gains temporary HP equal to your Tier'), so 'all nine are single-target' is true of targeting but not of every effect.
19. **CORRECTED** — The axis matrix in §7.1 reproduces the verified profiles with exactly one declared divergence (leyline/Red mobility 2 -> 3), and the per-axis totals in §7.2 are correct.
   - Evidence: All 21 rows and all 315 cells match the verified profile digest with only the declared Red divergence. All fifteen column sums recompute correctly except mobility: White 2 + Blue 1 + Black 1 + Red 3 + Green 1 + Agent 2 + Envoy 0 + Hunter 2 + Leader 2 + Scholar 0 + Warrior 2 + Chaos 0 + Civ 2 + Death 0 + Destruction 1 + Fate 0 + Knowledge 0 + Life 1 + Order 0 + Power 2 + Sovereignty 0 = 22.
   - Corrected: mobility Sigma is 22, not 21 — the report summed the column using Red's pre-divergence 2 while printing 3. Every other total (damage 55, scaling 48, control 49, debuff 43, protection 42, healing 25, buff 47, action_economy 48, terrain 26, information 29, social 24, exploration 39, summons 11, resource 35) and every trees>0 / trees>=3 count verifies exactly.
20. **CORRECTED** — leyline/White holds 'the only 2 flat damage-reduction talents (Interposing Shield, Devoted Conduit, Shield Wall)'.
   - Evidence: The clause is self-contradictory ('only 2' followed by three names) and the exclusivity is false. Corpus sweep for damage reduction returns four in White (Interposing Shield 'reduce that damage by half [Die]'; Devoted Conduit 'reduce that damage by half [Tier][Die]'; Shield Wall 'attacks against them deal half [Tier][Die] less damage'; Shared Burden 'take half that damage in their place') plus deity/Order Shoulder the Oath ('take half that damage instead and reduce the remaining damage to that ally by your ranks in White') and heroic Surefooted x3 (environmental only).
   - Corrected: White holds four ally damage-mitigation talents and is the only tree with more than one; deity/Order's Shoulder the Oath is the only other true ally damage-reduction talent in the corpus. White's protection 5 score is unaffected.
21. **CORRECTED** — Blue is slow to assemble: eight of Blue's 25 talents are unreachable before L6 (Blue 3+); Scholar has 14 rank gates, six of them rank 3 = L6.
   - Evidence: leyline/Blue rankGate histogram: Blue 1+ nine, Blue 2+ six, Blue 3+ SEVEN, none three. The seven Blue 3+ talents are Collected, Ghostly Walls, Living Image, Absolute Stillness, Composed, Counterspell, Anticipate. Scholar's count verifies exactly: 14 talents carry a rank prerequisite, six of them rank 3 (Overcharge/Crafting 3+, Overwhelm with Details/Lore 3+, Contingency/Lore 3+, Turning Point/Deduction 3+, Ongoing Care/Lore 3+, Resuscitation/Medicine 3+).
   - Corrected: Seven, not eight. The substantive point — that Blue's three teeth (Counterspell, Ghostly Walls, Absolute Stillness) all arrive at L6 together — is confirmed: all three carry Blue 3+.
22. **CONFIRMED** — leyline/Blue and heroic/Scholar are not a redundancy problem — they share only three slots (Collected, the max-focus card, one influence-keyed disadvantage), their disjoint sets are enormous, and the designer should act on Order<->Power or Civilization<->Fate instead.
   - Evidence: Blue: the word 'damage' appears in zero of its 25 descriptions. Scholar: zero of 25. Verified independently. The disjoint set is real and checkable: Blue owns the corpus's only illusion creation, the only talent-activation negation (Counterspell), the 0-Speed lock chain, foreknowledge tokens, and 5 of the corpus's 15 disadvantage-imposers (Intercept, Absolute Stillness, Pattern Recognition, False Premise, Probability Cascade — the largest single-tree block, confirmed); Scholar owns the only fabrial economy, the only skill-rank rewriting, three heal formulas and a revival. THE OPPOSITE CASE, stated at its strongest: the designer did not ask whether they share mechanics — he said two PCs are in paths with NO damage talents and 'if it turns out that Scholar and Blue do the same thing, the design needs re-evaluating'. On that question they DO converge: both are 25-talent trees contributing zero damage and zero self-mobility, both key off other people's dice, and both assemble late (Blue 7 talents at L6, Scholar 6). WHICH CASE IS BETTER: the report's, on mechanics — a GM would never mistake a Blue turn for a Scholar turn. But its headline ('this is not a redundancy problem... do not act on Blue<->Scholar') answers the wrong question, and its own §5.3 paragraph ('shared negative space plus a shared party slot') is the right answer buried under a wrong headline. The report should have led with §5.3 and dropped the ranking argument.
23. **CORRECTED** — heroic/Envoy and heroic/Leader are architectural twins that play almost identically at levels 1-3, because their differentiating talents (Confident/Shrewd/Demonstrative Command at L3-L4, Peaceful Solution at L4, Foresight at L4) all sit past the depth-0/1 band.
   - Evidence: The architecture claim verifies: Envoy has nine talents that reference Rousing Presence (Sound Advice, Practical Demonstration, Devoted Presence, Stalwart Presence, Lessons in Patience, Instill Confidence, Practiced Oratory, Sage Counsel, Rallying Shout) and Leader has seven that modify Decisive Command (Combat Coordination, Relentless March, Confident/Shrewd/Demonstrative Command, Cutthroat Tactics, Authority). But the level figures come from the dossier's earliestLevel column, which ignores skill-rank gates. Peaceful Solution requires Discipline 3+, Foresight requires Discipline 3+, Practiced Oratory Persuasion 3+, Sage Counsel Lore 3+, Inspired Zeal Discipline 3+, Rallying Shout Leadership 3+ — six Envoy talents at true L6. Leader's Confident and Shrewd Command carry no rank-3 gate and land genuinely at L3.
   - Corrected: They play alike through level FIVE, not level three, and they diverge asymmetrically: Leader's command die starts upsizing at L3 while every one of Envoy's six differentiators waits for level 6. This is a stronger version of the report's own finding, and its own Scholar section shows it knew the rule.
24. **CORRECTED** — Strict domination #1: leyline/Red Flame Surge is dominated by deity/Destruction Set Charge — 'the clearest cross-atlas domination in the system'.
   - Evidence: Every printed term checks out: Flame Surge 2A/2I, d1/L2, [Size] radius (5 ft at rank 2), 'tests Athletics vs. Red. On a failure, they take [Tier][Die] energy damage, and half as much on a success'. Set Charge 1A/1I, d0/L1, 10 ft, no roll, no save, 'the detonation point becomes dangerous terrain for the scene', detonation as a Free Action on a declared trigger, sustain up to tier. But SYSTEM-PRIMER records the designer's stated intent verbatim: 'Leyline mages are mortal. Comparable to Heroic path characters, not Radiants... Radiant-equivalent power lives in the Deity Domain trees.' A deity talent out-powering a leyline talent is the design working as specified. The report also omits that Set Charge demands Blue 2+ as well as Red 2+ — four skill ranks across two colours, two of them off-colour for a Red mage.
   - Corrected: The comparison is arithmetically correct and should be demoted from 'the clearest cross-atlas domination in the system' to 'intended power stratification, possibly mispriced'. It does not belong at the head of a domination table alongside same-atlas cases, and the report's own §9 already concedes that whether it matters at the table depends on adversary HP and Deflect, which are out of scope.
25. **REFUTED** — Closing recommendation: lifting the shared-stock layer out of the trees would return 41 slots — 'enough to give leyline/Blue three real cards, heroic/Scholar two combat turns, and every deity tree the Special action the design guide asks for and none of them has'.
   - Evidence: Deity trees contain zero shared-stock talents (verified: none of the 90 deity talents is an exact-name or renamed duplicate of a talent in another tree). The freed slots are 30 in heroic and 9 in leyline. Talent slots are per-tree, not fungible across atlases — removing Collected from Envoy cannot fund a Special action in Chaos.
   - Corrected: Lifting the shared stock frees 30 heroic slots and 9 leyline slots and zero deity slots. Blue gets back three (Collected, Composed, Baleful — all currently at L4-L6); Scholar gets back two. The deity-Special gap is a separate problem requiring net-new deity talents, and pairing the two recommendations obscures both.

### What the analysis missed

- The rank-3 = level-6 rule applies to SKILL ranks, not just colour ranks, and the dossier's earliestLevel column silently ignores it. 36 of 150 heroic talents (24%) are rank-3 gated: Agent 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5. The report applies the rule exactly once (Scholar §5.3, where it verifies exactly) and then builds every other heroic depth/level argument on numbers it knew were wrong — §2.3's 'identical at L1-3', §2.7's Swift Strikes rationale, §4's domination positions.
- It never ran its own duplication test INSIDE trees except anecdotally (Agent's Quick Analysis / Fast Talker / Trickster's Hand). Sovereignty's nine talents are assembled from two clauses repeated four and five times — a denser redundancy than any cross-tree pair in the report, in the tree it independently identifies as the weakest and most fragile in the game.
- It never tested the designer's actual premise. The review exists because two PCs are in paths with no damage talents — White and Blue. The report examines Blue exhaustively and uses White only as one half of a single verbatim card in §2.6. White <-> Envoy and White <-> Order go unexamined despite obvious overlap (White protection 5 / Envoy 3 / Order 3; both White and Envoy produce Determined; both White and Order are ally-damage-mitigation trees with a Reaction-heavy profile). If the designer's two zero-damage PCs are White and Blue, White's neighbours are the load-bearing question.
- Its own §2.6 falsifies its §0 methodological premise that 'the two measures agree with each other': the corpus's single Jaccard-1.000 cross-tree pair is ranked ~50th by the rarity-weighted measure. And its rarity-weighted measure scores Sovereignty as the most orthogonal tree in the system at the same moment the report calls Sovereignty the emptiest — a live counterexample it prints without noticing.
- The §1.2 tree table ('every deity tree 0 (0%)') and the §1.2 atlas total ('deity 1/90 (1%)') contradict each other, and the contradiction is exactly the two Shatter Focus slots that §1.4 declares are NOT shared stock — which is where the headline 41 comes from.
- Kneel's advantage clause reads as a standing rider, not a consequence of the test, and Power gates Black 2+ — so the Black Attunement Key's free Weakened application on every Draw Mana is its natural feeder. The report reads Kneel three times (§2.1, §4 #3, §6.2) and never joins it to the key.

### Surviving findings, in priority order

1. THE DEITY TEMPLATE. All ten deity trees share one node graph — depth 0: 2, depth 1: 4, depth 2: 2, depth 3: 1 — with zero variation across all 90 talents, plus a near-uniform price list (entries 1A/1I with four named exceptions; capstones 3A/3I once-per-scene with two named exceptions) and zero Special actions against a stated deity target of 15-20%. This is the report's largest and best-evidenced finding and it survives intact. Corrections: the depth-2 price deviates in 6 of 20 cases, and four trees hold depth-1 riders behind rank-3 gates to L6, so the LEVEL pacing is not uniform even though the shape is.
2. THE SHARED-STOCK LAYER: 39 slots (10.7%), not 41. Concentrated at 6 of 25 in each of Agent, Envoy and Leader and 5 of 25 in each of Hunter and Warrior — heroic 30/150 (20%), leyline 9/125, deity 0/90. Priced by host-tree depth rather than value: Collected is free at d0/L1 in Envoy and costs a Blue 3+ / level-6 slot in Blue; Mighty is verbatim identical in six trees; Combat Training is verbatim in Hunter and Warrior at d0/L1 in both. The §1.3 template — 'Gain X expertise. Spend 2 focus to add Opportunity to a [social] test', Special, 2 Focus — is printed five times across three trees, verified verbatim in structure.
3. THE IDENTICAL INVESTITURE PASSIVE. Chaos/Void Sense, Knowledge/Accumulate and Life/Prognosis are the same card: Passive, no cost, depth 1, L2, 'takes damage from any source, you recover 1 Investiture once per round'. Three of the eight literal Investiture-regen talents in 365 are one card, in the atlas that has no other economy. (Black's Sanguine Reservoir is a ninth, indirect source — HP banked as Reserve, spendable as Investiture, capped at ranks in Black — which the report names as a monopoly in §6.1 and then omits from its own regen census in §6.3.)
4. THE TWIN ALLY-BUFF SQUARE, AND ITS CAUSE UPSTREAM. Civilization/Lay Foundation and Fate/Ordained Ground are the same card at the same price, action type, depth, level, duration and sustain cap. The design guide handed both trees the same White brief in near-identical words, and never asked Civilization for a zone at all. Fixing this at the talent layer without fixing the guide will reproduce it.
5. ONE CARD, TWO LEYLINE COLOURS. White/Overwhelming Authority and Blue/Subtle Suggestion are the same Special, at the same cost, depth and level, differing by the words 'you may' — in the two trees that most need distinct identities and in the atlas where colour identity is the whole point.
6. ORDER <-> POWER share a verbatim clause: 'temporary HP and an advantage on its next attack test' for [Tier][Die], in Final Decree and Investiture of Command. Both also redirect damage between characters and both attack Cognitive with their gate colour for Deflect-ignoring spirit damage. This is a real redundancy. The report's [D] verdict on Kneel's advantage clause is wrong on price (it is a free standing rider fed by the Black Attunement Key that every Power character carries) but right on scope (self-only vs party-wide).
7. ENVOY <-> LEADER are architectural twins — a cheap repeatable single-ally buff as the Key, plus nine and seven talents respectively that modify it — sharing four verbatim slots. Stronger than the report states: applying the rank-3 = L6 rule, all six of Envoy's differentiators are level 6 while Leader's command die starts upsizing at level 3. They play alike through level five.
8. SOVEREIGNTY IS THE FRAGILITY. It monopolises the damage-die ladder, has the lowest axis sum in the game (13, nine axes at zero), and its promised signature resource Decree exists in no talent — all nine target one creature and none creates a zone, radius or aura. It is charged White 3+ (a level-6, six-rank investment) and rolls White zero times, in the tree the guide calls 'the cleanest example of the color-thematic test rule'. NEW, and worse than the report found: its nine talents are built from two clauses — 'damage die size increases by one step (maximum d12)' appears in Exalt, Investiture of Authority, Sovereign's Balance and Sovereignty; 'decreases by one step (minimum d4)' in Censure, Decree of Ruin, Edict of the Fallen, Sovereign's Balance and Sovereignty. That is a denser redundancy than any cross-tree pair in the report, and the report never looked for it because it only ran its duplication test between trees.
9. THE RANK-3 = LEVEL-6 GATE IS UNCOUNTED ACROSS THE WHOLE HEROIC ATLAS. 36 of 150 heroic talents (24%) carry a rank-3 skill prerequisite — Agent 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5 — and the dossier's earliestLevel column ignores them while honouring colour-rank gates, dating several at L2-L4. The report applies the rule once, to Scholar, and nowhere else. This is a defect in the shared ground-truth data that every one of the thirteen analyses is exposed to, and correcting it changes the answer to the designer's question 2: heroic paths are NOT fully reachable by L4-L5.
10. BLUE <-> SCHOLAR is not a mechanical redundancy — the disjoint sets are large and checkable, and 'damage' appears in zero of all 50 descriptions on both sides. But the report's headline answers the wrong question. What Blue and Scholar share is a party ROLE SLOT and a failure mode: zero damage, no self-mobility, late assembly (Blue 7 talents at L6, Scholar 6), and dependence on other people's dice. That is exactly what the designer said needs re-evaluating, and the fix the report proposes in its own §5.3 — give one of them a repeatable, self-initiated, on-your-turn play — is the right recommendation regardless of where the pair ranks on any similarity metric.
11. ALLY ACTION-GRANTING IS A DEITY COMPETENCY THE REPORT MISSED. At least nine talents grant an ally an action or free action and six are deity talents (Order/Concord, Fate/Weave the Thread, Fate/Foreknown Strike, Fate/Thread of Inevitability, Knowledge/The Final Study, Civilization/Trade Routes, plus Sovereignty/Expose). The claim of three is false and it distorts the action_economy axis reading.
12. ACTION DENIAL IS NOT ONE CARD. The corpus fields roughly eleven action-denial or action-taxation talents across seven trees, including Power/Kneel at depth 0 / level 1. What IS single-sourced is the literal phrase 'cannot take actions' — leyline/Black's Hollow Command, one talent in 365. Keep the narrow claim; drop the party-composition fragility argument built on the wide one.
13. EDITORIAL, and cheap to fix: heroic/Envoy's Practiced Oratory reads 'When you use Rousing Resence or Steadfast Challenge' — a typo inside a talent whose entire function is to reference another talent by name, and a fourth typo family beyond the three the report catalogued (Customary Garb's 'Prsentable'/'Spriritual', Peaceful Solution's 'you ase tensions', Devastating Blow's 'melee weapon atack').
