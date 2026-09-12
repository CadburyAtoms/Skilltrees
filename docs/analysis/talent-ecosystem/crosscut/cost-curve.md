# Cost, action-type and shape audit against the design standard

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `cost-curve`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

## COST, ACTION-TYPE AND SHAPE AUDIT — all 21 trees against the two design standards

Every number below is computed from `all-talents.json` (365 rows). Action glyphs are normalised: `∞`→Passive, `★`→Special, `◇`→Free Action, `⟲`→Reaction, `Action`→1 Action. Cost is parsed from the `cost` field (`undefined` and `—` both = no resource cost). Word counts are whitespace tokens of `description`.

---

## 0. Two corrections to the brief's own framing, before anything else

**(a) "Blue is 12 of 25 Passive by the function census" — Blue is not over the line, and Black is over it by 25 points.**
The `functional-overlap.js` `passive_always` column is a *prose* classifier, not the `action` field. By action type Blue is **9/25 = 36% Passive**, *under* the guide's 40% conversion trigger. The trees actually over the line are:

| Tree | Passive | % | Special | % |
|---|---|---|---|---|
| **leyline/Black** | **15/25** | **60%** | **1/25** | **4%** |
| leyline/Red | 11/25 | 44% | 8/25 | 32% |
| leyline/White | 10/25 | 40% | 6/25 | 24% |
| heroic/Envoy | 10/25 | 40% | 8/25 | 32% |
| heroic/Scholar | 10/25 | 40% | 10/25 | 40% |

Blue (36%) and Green (36%) are compliant. **Black is the Passive problem, and it is not close** — 60% against a 35% target, paired with the worst Special share in the leyline atlas (4%). The three Blue talents the prose classifier over-counted are `Telepathic Network` (2 Actions, scene-long), `Living Image` (Special, always-on upgrade) and `Probable Outcome`.

**(b) The leyline design guide is stale on two of its own claims.** It says "the current leyline trees have **0% Specials and 14% 3-Action costs** — both need fixing." Both are fixed and the guide was never updated: leyline now runs **21.6% Specials** and **0 (zero) 3-Action talents across all 125 leyline rows**. Anyone auditing against the guide's prose rather than its target table will chase two dead problems. The Special gap has migrated: it now lives in `leyline/Black` (4%) and in **all ten deity trees (0%)**.

---

## 1. Action-type distribution — the full table

Percentages are of the tree's own n (25 leyline/heroic, 9 deity).

| Tree | n | Pass | Spec | 1A | 2A | 3A | Free | Reac | %Pass | %Spec | %1A | %2A | %3A | %Fr | %Re |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| leyline/Black | 25 | 15 | 1 | 3 | 3 | 0 | 1 | 2 | **60** | **4** | 12 | 12 | 0 | 4 | 8 |
| leyline/Blue | 25 | 9 | 5 | 3 | 2 | 0 | 1 | 5 | 36 | 20 | 12 | 8 | 0 | 4 | **20** |
| leyline/Green | 25 | 9 | 7 | 3 | 3 | 0 | 0 | 3 | 36 | 28 | 12 | 12 | 0 | 0 | 12 |
| leyline/Red | 25 | 11 | 8 | 3 | 1 | 0 | 1 | 1 | 44 | 32 | 12 | 4 | 0 | 4 | 4 |
| leyline/White | 25 | 10 | 6 | 1 | 1 | 0 | 0 | 7 | 40 | 24 | **4** | 4 | 0 | 0 | **28** |
| *leyline TARGET* | | | | | | | | | *35* | *25–30* | *15* | *8* | ***0*** | *5–8* | *5–8* |
| **leyline TOTAL** | **125** | 54 | 27 | 13 | 10 | **0** | 3 | 18 | **43.2** | **21.6** | **10.4** | 8.0 | **0** | **2.4** | **14.4** |
| heroic/Agent | 25 | 8 | 7 | 1 | 2 | 1 | 4 | 2 | 32 | 28 | 4 | 8 | 4 | 16 | 8 |
| heroic/Envoy | 25 | 10 | 8 | 2 | 1 | 0 | 2 | 2 | 40 | 32 | 8 | 4 | 0 | 8 | 8 |
| heroic/Hunter | 25 | 8 | 7 | 4 | 2 | 1 | 2 | 1 | 32 | 28 | 16 | 8 | 4 | 8 | 4 |
| heroic/Leader | 25 | 8 | 8 | 4 | 1 | **2** | 1 | 1 | 32 | 32 | 16 | 4 | **8** | 4 | 4 |
| heroic/Scholar | 25 | 10 | 10 | 1 | 2 | 0 | 1 | 1 | 40 | 40 | 4 | 8 | 0 | 4 | 4 |
| heroic/Warrior | 25 | 7 | 4 | 9 | 4 | 0 | 0 | 1 | 28 | 16 | **36** | 16 | 0 | 0 | 4 |
| *official heroic benchmark* | | | | | | | | | *34* | *30* | *14* | *8* | *2* | *7* | *5* |
| **heroic TOTAL** | **150** | 51 | 44 | 21 | 12 | 4 | 10 | 8 | **34.0** | **29.3** | **14.0** | **8.0** | **2.7** | **6.7** | **5.3** |
| deity/Chaos | 9 | 1 | **0** | 3 | 3 | 1 | 0 | 1 | 11 | 0 | 33 | 33 | 11 | 0 | 11 |
| deity/Civilization | 9 | 1 | **0** | 2 | 3 | 1 | 1 | 1 | 11 | 0 | 22 | 33 | 11 | 11 | 11 |
| deity/Death | 9 | 1 | **0** | 4 | 3 | 1 | 0 | 0 | 11 | 0 | 44 | 33 | 11 | 0 | 0 |
| deity/Destruction | 9 | 2 | **0** | 2 | 2 | 1 | 1 | 1 | 22 | 0 | 22 | 22 | 11 | 11 | 11 |
| deity/Fate | 9 | 1 | **0** | 2 | 2 | 1 | 2 | 1 | 11 | 0 | 22 | 22 | 11 | 22 | 11 |
| deity/Knowledge | 9 | 3 | **0** | 5 | **0** | 1 | 0 | 0 | 33 | 0 | 56 | **0** | 11 | 0 | 0 |
| deity/Life | 9 | 1 | **0** | 6 | 1 | 1 | 0 | 0 | 11 | 0 | **67** | 11 | 11 | 0 | 0 |
| deity/Order | 9 | 2 | **0** | 2 | 2 | 1 | 1 | 1 | 22 | 0 | 22 | 22 | 11 | 11 | 11 |
| deity/Power | 9 | **0** | **0** | 3 | 4 | 1 | 1 | 0 | **0** | 0 | 33 | 44 | 11 | 11 | 0 |
| deity/Sovereignty | 9 | 2 | **0** | 5 | 1 | 1 | 0 | 0 | 22 | 0 | 56 | 11 | 11 | 0 | 0 |
| *deity TARGET* | | | | | | | | | *25–30* | *15–20* | *25–35* | *15–25* | *cap only* | *10–15* | *~10* |
| **deity TOTAL** | **90** | 14 | **0** | 34 | 21 | 10 | 6 | 5 | **15.6** | **0** | **37.8** | 23.3 | 11.1 | 6.7 | 5.6 |

**The single largest structural drift in the entire system: deity/Special = 0, ten trees out of ten, 90 talents out of 90.** Against a stated 15–20% target that is a shortfall of roughly 14–18 talents' worth of Specials. It is also the *only* target that every single tree in an atlas misses in the same direction.

**Second largest: the heroic atlas is a bullseye and the leyline atlas is not.** Heroic totals (34.0 / 29.3 / 14.0 / 8.0 / 2.7 / 6.7 / 5.3) match the official heroic benchmark (34 / 30 / 14 / 8 / 2 / 7 / 5) to within 0.7 points on every row. Leyline totals miss by +8.2 Passive, −5.9 Special, −4.6 Action, −4.1 Free, **+7.9 Reaction**. Whatever process produced the heroic atlas hit the benchmark; the process that produced leyline did not.

### 1a. The deity targets are arithmetically unhittable — a bug in the guide, not (only) in the trees

A 9-talent tree can only express counts of 0, 1/9 (11.1%), 2/9 (22.2%), 3/9 (33.3%)…

- **Passive target 25–30%** — nearest legal values are 22.2% and 33.3%. **No 9-talent tree can hit the band.**
- **Special target 15–20%** — nearest legal values are 11.1% and 22.2%. **Unhittable.**
- Free Action 10–15% → 11.1% ✔ hittable. Reaction ~10% → 11.1% ✔. 3 Actions "one per tree" → 11.1% ✔. Action 25–35% → 22.2% or 33.3% ✔. 2 Actions 15–25% → 22.2% ✔.

So two of the seven deity targets cannot be satisfied by the tree size the same guide prescribes ("cleanest shape has 9 talents"). That partially excuses the Passive shortfall (11% is the nearest legal value below the band on seven trees). **It does not excuse Special = 0**: 11.1% was available to every tree and no tree took it. The fix is to restate the deity targets as counts (`2–3 Passive, 1–2 Special, 2–3 Action, 2 two-Action, 1 Free, 1 Reaction, 1 capstone` = 9–10) rather than as percentages.

### 1b. 3-Action audit — every one of the four non-capstone offenders is a bottom-three talent in its own tree

There are **14 three-Action talents**. Ten are deity capstones at depth 3 — exactly one per deity tree, exactly what the deity guide sanctions. **Compliant, 10/10.** The remaining four are all heroic and all violations:

| Tree | Talent | Action | Cost | Depth | Its own profile's verdict |
|---|---|---|---|---|---|
| heroic/Hunter | **Tagging Shot** | 3 Actions | none | **d0, L1** | **#1 worst talent in the tree** |
| heroic/Agent | **Close the Case** | 3 Actions | 3 Focus | d3 | **#1 worst talent in the tree** |
| heroic/Leader | **Grand Deception** | 3 Actions | 3 Focus | d3 | **#1 worst talent in the tree** |
| heroic/Leader | **Synchronized Assault** | 3 Actions | 2 Focus | d4 (capstone) | **#2 worst talent in the tree** |

**Four for four.** Thirteen other analysts, working independently and without this audit, put every single non-capstone 3-Action talent in their tree's bottom three. This is the cleanest causal link in the whole review: *the action-type violation is the weakness*, not a coincidence beside it. `Tagging Shot` is the extreme case — a **depth-0, level-1 entry** that consumes an entire Slow turn (3 of 3 Actions) to "Move 5 ft and make a ranged attack. On a hit or a graze, the target becomes your quarry," where the quarry mark alone is what other Hunter entries hand out for free.

Leader is the only tree in the system with **two** 3-Action talents (8% of the tree), and both are in its bottom two.

### 1c. The sanctioned 3-Action slot is *also* failing — 9 of 10 deity capstones are flagged weak by their own profile

| Deity capstone | 3A + cost | In its tree's weak list? |
|---|---|---|
| Chaos — Unravel Everything | 3A + 3I | yes |
| Civilization — Magnum Opus | 3A + 3I | yes |
| Death — Raise Dead | 3A + **4I** | yes (**#1 bottom**) |
| Destruction — The Unmooring | 3A + 3I | yes ("capstone undersold") |
| Fate — Thread of Inevitability | 3A + 3I | yes (**#2 bottom**) |
| Knowledge — The Final Study | 3A + 3I | yes (**#2 bottom**) |
| Life — Apex Form | 3A + 3I | yes |
| Order — Final Decree | 3A + 3I | yes |
| Sovereignty — Sovereignty | 3A + 3I | yes (appears in *both* top-3 and weak lists) |
| **Power — Mantle of the Aspirant** | 3A + 3I | **no — listed #3 best** |

**The mechanism is arithmetic, and it is the same every time.** A 3-Action / 3-Investiture / once-per-scene capstone costs its whole turn *plus* the Draw Mana Actions to afford it. At Tier 2, Draw Mana returns 2 Investiture per Action, so 3 Investiture is **1.5 Actions of income** on top of the 3 Actions to fire: a true price of **~4.5 Actions spread over two turns**, once per scene. Meanwhile the same tree's best repeatable — deity/Knowledge's `Predatory Strike` at 1 Action + 1 Investiture, i.e. **1.5 Actions all-in** — can be fired every round. **A 3-Action capstone must beat three copies of the tree's best repeatable to break even, and beat it once.** Nine capstones do not clear that bar.

At Tier 1 (levels 1–5, the range the pre-session-one review actually covers) it is worse: Draw Mana returns **1** Investiture per Action, so a 3-Investiture capstone costs 3 Actions of income + 3 Actions to fire = **6 Actions = two entire Slow turns**, out of a starting pool of ~4 Investiture. The deity guide's principle 9 says "don't undersell the capstones"; the cost structure sells them out from under themselves regardless of what the text says.

### 1d. Action-type honesty (deity principle 10) — clean, with one systematic exception

**Zero** talents typed Action/2A/3A are trigger-shaped ("When an enemy…", "use your Reaction to…"). That rule is being followed.

But the *inverse* leak exists and is unpoliced: **7 talents typed Special or Free Action fire on another character's action** — i.e. they are Reactions that do not consume the one-per-round Reaction slot.

| | Tree | Talent | Trigger |
|---|---|---|---|
| Special | leyline/White | **Unbreakable Line** (d4, 3 Investiture) | "when an ally adjacent to you would drop to 0 health" |
| Special | leyline/Blue | Reactive Analysis (d1) | "when a character…fails a test" |
| Special | leyline/Red | Emotional Overload (d1) | "when a character…gains an advantage" |
| Special | leyline/Red | Breaking Point (d4) | "when a character…takes damage for the second time" |
| Special | leyline/Green | Spreading Roots (d2) | "when a character ends their turn in your difficult terrain" |
| Special | leyline/Green | Pack Sense (d2) | "when an ally makes an attack test" |
| Special | heroic/Envoy | Inspired Zeal (d3) | "when an ally uses Determined" |

`Unbreakable Line` is the one that matters: it is a once-per-round death-save interrupt that costs **no Reaction**, in a tree that already has seven Reactions fighting over one slot. It is mechanically stronger than every one of White's actual Reactions *because* it dodges the cap. Either it should be a Reaction, or the six others should be, or the guide should state that a Special may carry an off-turn trigger — right now the standard is silent and the trees have quietly discovered the loophole.

---

## 2. Reaction over-supply against the 1-per-round cap

Leyline target 5–8%. Actual: **White 28% (7 talents), Blue 20% (5), Green 12% (3)**, Black 8%, Red 4%.

**22 of the system's 31 Reactions also cost a resource** — the slot *and* Investiture/Focus. All seven of White's do:

| White Reaction | depth | cost |
|---|---|---|
| Interposing Shield | d1 | 1 Investiture |
| Retributive Guard | d1 | 1 Investiture |
| Counterpoint | d1 | 1 Investiture |
| Shared Burden | d2 | 2 Investiture |
| Shared Conviction | d3 | 2 Focus + 1 Investiture |
| Pillar of Order | d0 | 1 Investiture |
| Voice of Authority | d4 | 1 Investiture |

**The consequence is that White cannot spend more than about 1–2 Investiture per round no matter how many talents it owns**, because six of its seven premium plays are locked behind a slot it only gets once. The White profile records "structurally the BEST-sustaining leyline tree" — that is true, and this table is *why*: the Reaction glut is a de-facto spending cap masquerading as sustainability. A White player who owns four Reactions has bought three redundant talents and a resource problem they will never feel. Blue's five Reactions (all Investiture-costed, four of them level-2-reachable) are the same shape one notch less severe.

This is the drift that produces the "White is a reactive bodyguard who can't act on its own turn" finding elsewhere: with 28% Reaction and only **4% 1-Action (one talent: `Terms of Accord`)**, White has almost nothing to *do* on its own initiative. Its 1-Action share is the lowest in the system and its Reaction share is the highest; that is one deviation, counted twice.

---

## 3. The cost curve

### 3a. Mean resource cost by depth band

| Tree | d0 | d1–2 | d3+ | shape |
|---|---|---|---|---|
| leyline/Black | 0.50 I | 0.27 I | 0.60 I | flat |
| leyline/Blue | 0.50 I | 0.79 I | 0.71 I | flat |
| leyline/Green | 0.50 I | 0.42 I | 0.78 I | flat |
| **leyline/Red** | **0.75 I** | 0.45 I | **0.20 I** | **inverted** |
| leyline/White | 0.60 I | 0.70 I | 0.80 I | flat |
| heroic/Agent | 1.00 F | 0.80 F | 1.00 F | flat |
| heroic/Warrior | 0.14 F | 0.38 F | 1.50 F | rising ✔ |
| heroic/Scholar | 0.43 F | 0.40 F | 1.33 F | rising ✔ |
| heroic/Leader | 0.29 F | 0.50 F | 1.00 F | rising ✔ |
| **every deity tree** | **1.0 I** *(Death 0.5, Chaos 1.5)* | **0.83–1.67 I** | **3.0 I** *(Death 4.0)* | **textbook ✔** |

**The leyline atlas does not have a cost curve.** Its deepest talents cost the same as its entries, or less. Red's is actively inverted: 0.75 Investiture at depth 0, 0.20 at depth 3+.

### 3b. Leyline uses only the bottom rung of its own cost scale

The guide's scale is "1 = routine, 2 = significant, 3 = a big play." Across **125 leyline talents**:

- **1 Investiture: 55 talents**
- **2 Investiture: 9 talents** (Black 2, Blue 3, Green 2, Red 1, White 1)
- **3 Investiture: 1 talent** — `White/Unbreakable Line`, the *only* 3-cost talent in the entire leyline atlas
- **4 Investiture: 0**
- Focus: **3 talents in 125** (White `Shared Conviction`, Blue `Counterspell`, Black `Puppeteer`) — all three are 2 Focus *and* 1 Investiture, i.e. Focus never appears alone
- HP: **2 talents in 365**, both Black (`Withering Ray`, `Dark Investiture`)

Deity, by contrast, uses the whole scale: **31 × 1I, 28 × 2I, 10 × 3I, 1 × 4I** across 90 talents. Heroic uses the whole Focus scale: **22 × 1F, 20 × 2F, 4 × 3F**.

So leyline's entire pricing vocabulary is "free or 1 Investiture." That is why leyline back-loading is done **entirely with rank gates rather than with cost** — and why a rank-3 gate reads as a level-6 wall rather than as a price. It also means the guide's stated thematic cost identities are essentially unimplemented:

- *"Black pays in blood and willpower — HP loss (Physical), Focus (Cognitive), Investiture sparingly."* Black has **2 HP-costing talents and 1 Focus-costing talent** out of 25; nine cost Investiture. It pays in Investiture like everybody else.
- *"Blue — Focus for precision plays."* Blue has **one** Focus talent (`Counterspell`, which also costs Investiture) and **15 Investiture costers**.
- *"Red should have 'spend Opportunity to [devastating effect]' talents."* Red has 3 Opportunity talents, the most of any tree — the closest thing to a delivered cost identity in the atlas — but two of the three (`Reckless Momentum`, `Afterburn`) are depth-4/L5–6 riders, not "devastating."
- *"White — Opportunity for bonus coordination effects."* 2 (`Mending Aura`, `Collective Resolve`). Delivered, thinly.

### 3c. Depth-0 talents priced at 2+ units (should be routine, aren't)

Only five in the whole corpus, and three of them are defensible:

| Tree | Talent | Action | Cost |
|---|---|---|---|
| **leyline/Blue** | **Phantom Double** | **2 Actions** | **2 Investiture** |
| **deity/Chaos** | **Isolating Pressure** | 1 Action | **2 Investiture** |
| heroic/Agent | Sure Outcome | Special | 2 Focus |
| heroic/Agent | Plausible Excuse | Reaction | 2 Focus |
| heroic/Scholar | Strategize | Special | 2 Focus |

`Phantom Double` is the worst-priced entry talent in the game: **2 of your 3 Actions plus half your entire level-1 Investiture pool (2 of ~4)**, at depth 0, to place a 1-HP illusion that each enemy independently gets a Perception test to ignore. It is also the longest leyline description in the corpus at 76 words. Blue's profile lists it in its weak set; the cost line is why. `Isolating Pressure` is likewise in Chaos's weak list and its bottom three — a 2-Investiture depth-0 in a tree whose starting pool is ~4.

### 3d. Depth-3+ talents costing 0–1 for a fight-deciding effect

There are **56** of these, but most are unremarkable Passives. Five are genuinely fight-deciding at a price of nothing:

| Tree | Talent | Action | Cost | Depth | What it does |
|---|---|---|---|---|---|
| **heroic/Envoy** | **Foresight** | Passive | **none** | d3 | *"Gain an additional reaction each turn."* — the only unconditional extra Reaction in 365 talents, in a system where the 1/round cap is the tightest constraint in the action economy. Six words. |
| **heroic/Leader** | **Authority** | Passive | **none** | d3 | *"Double the range of Leader talents that affect allies, and double the number of allies affected."* — a whole-path multiplier whose prerequisite is not a talent at all but a narrative station ("Title granting you command of 5+ people"). |
| leyline/White | Shield Wall | Passive | none | d3 | permanent half-[Tier][Die] mitigation on every attack against two-or-more adjacent allies, no trigger, no slot |
| leyline/Red | Chain Detonation | Passive | none | d5 | free AoE propagation on every Conflagration kill |
| heroic/Hunter | Unrelenting Salvo | Passive | none | d3 | lifts the once-per-turn same-weapon Strike restriction — the only talent in the corpus that does |

`Foresight` and `Authority` are the two clearest under-prices in the system. Both are free permanent Passives that change how an entire path operates; both sit at depth 3 with no resource cost at all, in an atlas whose depth-3 mean is 0.17–1.5 Focus. Note that **no deity talent appears on this list** — deity's depth-3 slot always costs 3 Investiture. The two atlases have opposite failure modes: deity over-prices its deep slot into unusability, heroic under-prices it into free.

---

## 4. Per-tree resource weight: what each tree asks of a resource it cannot refill

Investiture-costing talents / bonus regenerators (regen from the census; costers recounted here):

| Tree | Inv costers | Bonus regen | Total Inv to fire all once | L≤5 talents costing Investiture |
|---|---|---|---|---|
| **leyline/White** | **15/25** | **0** | 18 | **12 of 21 (57%)** |
| **leyline/Blue** | **15/25** | **0** | 18 | **12 of 18 (67%)** |
| leyline/Green | 12/25 | 0 | 14 | 8 of 19 (42%) |
| leyline/Black | 9/25 | 2 | 11 | 6 of 21 (29%) |
| leyline/Red | 9/25 | 2 | 10 | 7 of 20 (35%) |
| deity/Power | 9/9 | 0 | 15 | — |
| deity/Chaos, Death, Life | 8/9 | 1 each | 13–14 | — |
| deity/Sovereignty, Fate, Civilization | 7/9 | 1 / 0 / 0 | 11–13 | — |
| deity/Order, Knowledge, Destruction | 6/9 | 0 / 1 / 0 | 10 | — |
| every heroic tree | 0 | n/a (Focus economy) | 0 | — |

**What this does in play, at Tier 1 (levels 1–5, pool ~4, Draw Mana = 1 Investiture per Action):**

- **Blue is the worst case in the system.** Two-thirds of everything Blue can own before level 6 costs Investiture, it generates none, and **five of those costers are Reactions** competing for one slot. A level-3 Blue mage with four talents will typically have three that cost Investiture and one Reaction slot to fire them through. After four spends the tree runs at 50% uptime — one Action to Draw, one to spend — forever. This is the mechanical content of the Blue profile's "the tree's real kit does not assemble until level 6": it is not only rank gates, it is that Blue has no way to *pay* for the kit it has.
- **White has the same 15/0 ratio but does not feel it**, for the reason in §2: seven of its costers are Reactions, so the one-per-round cap physically prevents White from ever outrunning Draw Mana. White's Reaction over-supply and White's zero-regen exposure are the same design decision, and one accidentally cancels the other.
- **Green (12/0) is the quiet one.** Its Draw Mana rider *creates difficult terrain for free*, so Green is the only zero-regen tree whose refuel Action still does something. That is why 42% coster share reads as tolerable where Blue's 67% does not.
- **Black and Red (9 costers, 2 regen each) are the only leyline trees with a working economy**, and both profiles independently describe their damage lines as "effectively unlimited." That is not a coincidence; it is the only two trees where the census shows income.
- **deity/Power is the most exposed tree in the corpus: 9 of 9 talents cost Investiture, zero produce, 15 Investiture to install the kit** against a ~4 pool. It is also the only tree in the system with **0 Passives and 0 Specials** — every single talent costs both an action type *and* a resource. Power has no free move at all.

---

## 5. Passive share — and what the Passives actually are

Splitting each tree's Passives into *trigger-shaped* (fires on a named event — the guide's own conversion candidates, since a Special is defined as "rides on an action you were already taking") and *flat stat sticks*:

| Tree | Passive | trigger-shaped | flat stat stick | of which shared-stock filler |
|---|---|---|---|---|
| **leyline/Black** | 15 (60%) | **11** | 4 | 2 (Hardy, Composed) |
| leyline/Red | 11 (44%) | 10 | 1 | 1 (Mighty) |
| leyline/White | 10 (40%) | 7 | 3 | 1 (Hardy) |
| heroic/Envoy | 10 (40%) | 5 | 5 | 4 |
| heroic/Scholar | 10 (40%) | 1 | **9** | 1 |
| leyline/Blue | 9 (36%) | 4 | 5 | 3 |
| leyline/Green | 9 (36%) | 4 | 5 | 2 |
| heroic/Agent | 8 (32%) | 1 | **7** | 5 |
| heroic/Leader | 8 (32%) | 3 | 5 | 4 |
| heroic/Hunter | 8 (32%) | 2 | 6 | 3 |
| heroic/Warrior | 7 (28%) | 1 | 6 | 3 |

Two different diseases wear the same number:

- **Black, Red, White** are Passive-heavy because their *riders* are typed Passive. Black's eleven trigger-shaped Passives are the exact population the guide's revision principle 1 names ("could it be a Special instead?"), and Black has **one** Special. This is a pure typing decision, not a power problem — and it is the reason Black's profile reads "FRONT-LOADED… the damage line is effectively unlimited": 15 of Black's 25 talents cost no action and no resource, so a Black character's whole kit runs concurrently with whatever else they are doing. **Black is the strongest per-Action leyline tree because it is 60% Passive, and 60% Passive is the standard's most-flagged violation. The violation and the strength are the same fact.**
- **Scholar and Agent** are Passive-heavy because of **flat stat sticks and shared stock**: Agent's 8 Passives include 5 shared-name talents (Hardy, Collected, Mighty, Baleful, Surefooted, High Society Contacts) and Scholar's 10 include 9 non-triggered always-ons. These are slot filler, and they are why Agent's profile calls the tree "WALLED IN BREADTH."

**Shared-stock filler system-wide: 39 of 365 slots (10.7%) carry a name that exists in another tree.** Hardy ×7, Mighty ×6, Collected ×5, Composed ×3, Baleful ×3, Surefooted ×3, plus six ×2 pairs. Heroic trees carry 5–6 each; leyline trees carry 1–3; **deity carries exactly one** (`Shatter Focus`, shared with leyline/Red — and the two are *different mechanics under the same name*, which is a live trap for anyone auditing the focus economy by grep). The heroic atlas is where the filler lives: **28 of the 39 shared slots are heroic**, i.e. heroic paths spend 18.7% of their talent budget on stock the player could have got elsewhere.

---

## 6. Description length

Leyline target 20–25 words. Deity targets banded: entry/tier-2 ~30–45, tier-3 synthesis ~40–55, capstone ≤70.

| Tree | mean | median | min | max | >25w | >40w | >55w |
|---|---|---|---|---|---|---|---|
| leyline/White | 21.2 | 19 | 9 | 39 | 5 | 0 | 0 |
| leyline/Black | 21.9 | 22 | 7 | 35 | 9 | 0 | 0 |
| leyline/Red | 23.7 | 24 | 12 | 36 | 9 | 0 | 0 |
| leyline/Green | 24.0 | 22 | 8 | 45 | 10 | 1 | 0 |
| leyline/Blue | 24.7 | 23 | 7 | **76** | 10 | 1 | 1 |
| heroic/Envoy | **16.4** | 17 | 6 | 27 | 2 | 0 | 0 |
| heroic/Agent | **17.2** | 18 | 8 | 31 | 3 | 0 | 0 |
| heroic/Leader | 19.2 | 20 | 9 | 36 | 3 | 0 | 0 |
| heroic/Scholar | 19.3 | 18 | 8 | 35 | 5 | 0 | 0 |
| heroic/Hunter | 22.0 | 19 | 9 | 50 | 6 | 2 | 0 |
| heroic/Warrior | 23.4 | 23 | 9 | 39 | 9 | 0 | 0 |
| deity/Chaos | 39.1 | 37 | 28 | 61 | — | 3 | 1 |
| deity/Life | 43.6 | 43 | 31 | 63 | — | 5 | 1 |
| deity/Sovereignty | 44.0 | 38 | 22 | 69 | — | 4 | 3 |
| deity/Knowledge | 46.8 | 49 | 35 | 60 | — | 7 | 2 |
| deity/Civilization | 49.3 | 46 | 14 | 75 | — | 6 | 4 |
| deity/Death | 49.3 | 48 | 28 | 71 | — | 6 | 4 |
| deity/Power | 49.3 | 53 | 33 | 71 | — | 5 | 4 |
| deity/Destruction | 51.6 | 50 | 17 | **101** | — | 6 | 4 |
| deity/Order | 56.6 | 53 | 25 | 82 | — | 7 | 4 |
| **deity/Fate** | **61.8** | 59 | 43 | **93** | — | **9 of 9** | 5 |

**All five leyline trees hit the 20–25 target on the mean.** Compliant.

**Two heroic trees are meaningfully *under* target: Envoy 16.4 and Agent 17.2.** The guide has no floor, so this is not a violation — but it is diagnostic. Envoy's shortest talents are `Foresight` (6 words), `Rousing Presence` (8), `Collected` (8), `Composed` (9): four of its 25 talents are under ten words. A tree whose median talent is 17 words is either extremely elegant or extremely thin, and Envoy's profile ("the three specialty labels are close to arbitrary") suggests the latter for most of them and the former for `Foresight`.

**Deity total word overrun against the banded caps: 498 words.** Concentrated:

| Tree | overrun (words) | per talent |
|---|---|---|
| deity/Fate | **108** | 12.0 |
| deity/Destruction | 90 | 10.0 |
| deity/Order | 86 | 9.6 |
| deity/Civilization | 56 | 6.2 |
| deity/Death / Power | 54 each | 6.0 |
| deity/Chaos | **0** | 0.0 |

**I tested and rejected the obvious excuse.** Deity entries that create a persistent token carry a boilerplate sustain-cap sentence ("You may sustain up to your tier X; unused X fade at the end of the scene"). That boilerplate appears on **9 talents and totals only 114 words, mean 12.7 each**. Stripping it entirely leaves Fate at 58.7 mean and Order at 53.7 — still over. **The deity length overrun is genuine overload, not formatting.**

### The genuinely overloaded talents

**`deity/Destruction — Set Charge`, 101 words, at depth 0.** The longest talent in the game, and it is an *entry node*. It bundles six mechanics: (1) place a token, (2) declare an arbitrary trigger from a four-item menu, (3) **grant yourself a permanent Free Action** ("You may detonate any of your Charges as a Free Action on your turn"), (4) AoE damage on detonation, (5) permanent dangerous-terrain creation, (6) a sustain cap plus a fizzle rule. Any three of those is a talent. Item (3) in particular is a Free Action grant hidden inside a 1-Action talent — precisely the action-type-honesty violation the deity guide's principle 10 was written to catch, and it evades the check because the grant is buried in sentence three.

**`deity/Fate — Thread of Inevitability`, 93 words, the capstone**, and Fate is the only tree where **all nine talents exceed 40 words**. It declares an arbitrary narrative trigger, then on that trigger resolves two entirely separate mass effects (every Ordained Ground grants a free Strike-or-Aid; every Snare detonates at its own centre). It is also in Fate's bottom three. Same pattern as §1c: the longest talent in a tree is repeatedly the one the tree's own profile says does not work.

**`deity/Order — Edict` (77w) and `Covenant` (73w)** are both **depth-0 entries at 1.7× their 45-word cap**. Order's profile calls the entries "the highest value-per-Action in the tree," so here length tracks quality — but they are still two entry talents a new player must parse before their first turn.

**`leyline/Blue — Phantom Double`, 76 words**, is the leyline atlas's only >55-word talent and it is *three times* the 25-word cap, at depth 0, for 2 Actions and 2 Investiture. It is the clearest single case in the corpus of the guide's own diagnosis being literally true: *"if you can't say it in 25 words the talent is doing too much."* It creates an entity with HP, runs a per-enemy opposed test, has separate success and failure clauses, and has a destruction condition.

At the other end, the six-to-nine-word talents (`Foresight`, `Composed`, `Collected`, `Hardy`, `Opportunist`, `Rousing Presence`) are almost entirely the shared-stock filler of §5 plus `Foresight`, which is the most powerful free Passive in the system stated in six words. Brevity is not the tell; **`Foresight` proves that a six-word talent can be the best talent in its tree, and `Set Charge` proves a 101-word talent can be the entry node.** Length correlates with overload only inside the deity atlas.

---

## 7. Prerequisite pacing (leyline principle 5: "3rd node and beyond should gate on skill investment")

Depth ≥2 talents carrying a rank gate:

| Tree | deep talents | rank-gated | ungated deep talents |
|---|---|---|---|
| leyline/Blue | 15 | **15 (100%)** | — |
| leyline/White | 15 | 14 | Unity of Purpose |
| leyline/Black | 15 | 13 | Hardy, Composed *(both shared stock)* |
| leyline/Green | 16 | 13 | Scent the Weak, Coordinated Hunt, Packmate's Warning |
| leyline/Red | 15 | **11** | Shockwave Slam, Explosive Leap, Reckless Momentum, Frenzied Tempo |
| heroic/Hunter | 12 | **7** | Hardy, Mighty, Cold Eyes, Swift Strikes, Surefooted |
| heroic/Agent | 12 | 8 | Hardy, Mighty, High Society Contacts, Underworld Contacts |
| heroic/Warrior | 10 | 8 | Surefooted, Swift Strikes |
| heroic/Scholar | 9 | 7 | Experimental Tinkering, Keen Insight |
| heroic/Leader | 13 | 10 | Mighty, Well Dressed, Baleful |
| heroic/Envoy | 11 | 9 | High Society Contacts, Instill Confidence |

Leyline is broadly compliant (66 of 76 deep talents gated), and the ungated exceptions are mostly the shared-stock filler — which is arguably correct, since Hardy should not need a rank gate. **Red is the outlier at 11/15**, and three of its four ungated deep talents (`Shockwave Slam`, `Explosive Leap`, `Reckless Momentum`) are free or Opportunity-only — the same talents that make Red's cost curve invert. Red's depth-3+ band is simultaneously the cheapest and the least gated in the leyline atlas.

Heroic gating is looser throughout, but heroic has no stated target here.

---

## 8. Data defects found in passing

| Field | Talent | Defect |
|---|---|---|
| `cost` | leyline/Blue **Counterspell** | `"2 Focus; 1 Investiure"` — **misspelled resource name.** Any cost parser keyed on "Investiture" will read this talent as costing 0 Investiture. |
| `cost` | leyline/Red **Volatile Strike** | `"1 Investiture "` — trailing space; breaks exact-string matching |
| `cost` | Blue `Living Image`, Green `Reknit Form` | `"Variable Investiture"` — unparseable, no scale given in the cost field |
| `cost` | Envoy `Practiced Oratory`, Leader `Resolute Stand`, Leader `Set at Odds` | `"Variable Focus"` — same |
| `description` | leyline/Blue **Absolute Stillness** | *"Creatures you have reduced to 0 Speed also **has** disadvantage"* — the authored overlay already fixes this; the source prose owes the fix (matches the brief's known divergence list) |
| `description` | leyline/White **Collective Resolve** | *"gran allies"* — same, authored side already fixed |

The `Counterspell` typo is the one that matters: it is a silent under-count in any Investiture-economy analysis run off the cost field, and it is exactly the class of third classifier bug the brief predicted.

**Deity principle 6 (spend phrase in the description opening): fully compliant.** Seven talents do not open with "Spend X Investiture" — `Sealed Edict`, `Pinpoint Charge`, `Inevitable Snare` (all Free-Action upgrade riders, which the guide explicitly exempts) and `Shoulder the Oath`, `Bonds of Community`, `Combustion Chain`, `Hexmark` (all Reactions with no Investiture cost). Zero real violations in 90 talents.

---

## 9. Ranked: distance from the standard

L1 distance = sum of |actual% − target%| across all seven action types, in percentage points. Word overrun = total words above the applicable cap.

| # | Tree | L1 dist | word overrun | The deviations that drive it |
|---|---|---|---|---|
| 1 | **deity/Life** | **102 pp** | 3 | 1 Action **+37**; Special −18; Passive −16; Free −13; Reaction −10 |
| 2 | **deity/Knowledge** | 91 pp | 27 | 1 Action +26; 2 Actions **−20 (zero)**; Special −18; Free −13; Reaction −10 |
| 3 | deity/Death | 84 pp | 54 | Special −18; Passive −16; 1A +14; 2A +13; Free −13; Reaction −10 |
| 4 | **deity/Power** | 84 pp | 54 | **Passive −28 (zero)**; Special −18; 2 Actions +24; Reaction −10 |
| 5 | deity/Sovereignty | 80 pp | 20 | 1 Action +26; Special −18; Free −13; Reaction −10 |
| 6 | deity/Chaos | 64 pp | **0** | Special −18; Passive −16; 2A +13; Free −13 |
| 7 | **heroic/Warrior** | 60 pp | 65 | **1 Action +22**; Special −14 |
| 8 | **leyline/Black** | 60 pp | 51 | **Passive +25; Special −24** |
| 9 | deity/Civilization | 58 pp | 56 | Special −18; Passive −16; 2A +13 |
| 10 | deity/Fate | 55 pp | **108** | Special −18; Passive −16 |
| 11 | **leyline/White** | 52 pp | 47 | **Reaction +22; 1 Action −11** |
| 12 | deity/Order | 35 pp | 86 | Special −18 |
| 13 | deity/Destruction | 35 pp | 90 | Special −18 |
| 14 | heroic/Scholar | 32 pp | 25 | Special +10; 1 Action −10 |
| 15 | heroic/Agent | 28 pp | 9 | 1 Action −10 |
| 16 | leyline/Blue | 28 pp | 113 | Reaction +14 |
| 17 | leyline/Red | 26 pp | 44 | — none ≥10 pp |
| 18 | heroic/Envoy | 24 pp | 3 | — |
| 19 | leyline/Green | 21 pp | 81 | — |
| 20 | heroic/Leader | 20 pp | 14 | — *(but 2 illegal 3-Action talents)* |
| 21 | **heroic/Hunter** | **10 pp** | 75 | — *(but 1 illegal 3-Action talent, at depth 0)* |

Note what the L1 metric conceals, and read it with §1b and §1c: **Hunter is the most standard-conformant tree in the system by distribution and still contains the single worst-typed talent in the game.** The metric is a screen, not a verdict.

---

## 10. Which deviations are harmless, and which caused a problem another analysis found

### Harmless — do not spend budget here

1. **Leyline 3-Action = 0%.** Already fixed; the guide's prose is stale. No action.
2. **Deity Passive at 11% on seven trees.** The 25–30% band is unhittable at n=9 (§1a); 11% is the nearest legal value below it. Fix the *guide*, not the trees.
3. **Deity Reaction 0–11%.** Same arithmetic. 11% = one Reaction, which six of ten trees have.
4. **Heroic atlas-level distribution.** 34.0/29.3/14.0/8.0/2.7/6.7/5.3 against the official 34/30/14/8/2/7/5 — within 0.7 pp on every row. Whatever produced heroic worked.
5. **Ungated deep talents that are shared stock** (Hardy, Mighty, Collected, Surefooted). A +1-max-HP Passive does not need a rank gate.
6. **Leyline description means (21.2–24.7).** All five trees inside 20–25. Compliant.
7. **Deity spend-phrase compliance.** 90/90 real compliance. Compliant.
8. **Envoy and Agent at 16–17 mean words.** Under target but no floor exists, and `Foresight` proves brevity is not the failure mode.

### Harmful — each of these is the mechanical cause of a finding another analyst reached independently

1. **Non-capstone 3-Action talents (4 of them) → all four are their tree's bottom-1 or bottom-2.** `Tagging Shot` (Hunter, depth 0, L1, 3 Actions), `Close the Case` (Agent), `Grand Deception` and `Synchronized Assault` (Leader). This is the highest-confidence, lowest-cost fix in the audit: four talents, four independently-confirmed failures, one rule already written down and already enforced perfectly in the leyline atlas. Restructure each to 2 Actions plus a Free-Action follow-up, per the deity guide's own pitfall entry.

2. **The 3-Action + 3-Investiture deity capstone slot → 9 of 10 deity capstones are flagged weak by their own tree's profile.** True price at Tier 2 is ~4.5 Actions (3 to fire + 1.5 Actions of Draw Mana income) for a once-per-scene effect; at Tier 1 it is ~6 Actions, two entire Slow turns, against a 4-Investiture pool. The rule is *sanctioned* by the deity guide and is nonetheless producing the weakest talent in nine trees out of ten. This is the answer to the designer's question 3 ("do deity paths feel similar in power to each other?") at the top of every tree: **they feel similar because nine of their ten capstones are equally unusable.** Only `deity/Power — Mantle of the Aspirant` escapes, and it escapes because it pays four ways at once rather than once per scene.

3. **deity/Special = 0 across 90 talents.** With no Specials, a deity character's every play consumes a real Action, which is why deity trees run 37.8% 1-Action and 23.3% 2-Action — the two highest shares in the system. Combined with §4 (six deity trees have zero Investiture regen, and Power has 9 costers with 0 producers), this is the direct cause of the "2–3 rounds of full-strength play, then nothing" verdict that Sovereignty, Power, Order, Fate and Civilization's profiles each reached independently. **One Special per deity tree (11.1%, the nearest legal value) would change the deity round economy more than any content change.**

4. **leyline/Black at 60% Passive / 4% Special.** Not a weakness — it is *why* Black's damage line is "effectively unlimited" and why its profile reads FRONT-LOADED with depth-0 scored 5. 15 of 25 talents cost no action and no resource. If Ben converts Black's eleven trigger-shaped Passives to Specials as the guide's principle 4 literally instructs, **he will nerf the tree**, because a Special still competes with the action it rides on in a way a Passive does not. Flag this as a rule that must not be applied mechanically to Black.

5. **leyline/White at 28% Reaction (7 talents) with all seven costing Investiture and 0 bonus regen, and only 4% 1-Action (one talent).** One deviation producing three separate findings elsewhere: (a) "White cannot act on its own turn"; (b) "22 of 25 talents need a second body"; (c) "structurally the best-sustaining leyline tree" — which is true only because the 1-Reaction cap makes it impossible for White to spend fast enough to run dry. Reducing White's Reactions to 2–3 and converting the rest to Specials or 1-Actions would fix (a) and (b) and *expose* the resource problem (c) is currently hiding.

6. **leyline/Blue: 67% of pre-L6 talents cost Investiture, zero regen, five Reactions competing for one slot.** The economic half of the "Blue's kit doesn't assemble until level 6" finding. Rank gates are the half everyone sees; the other half is that even the ungated talents cannot be paid for at 50% uptime.

7. **The leyline cost curve is flat (and Red's is inverted), because leyline uses only one rung of its own three-rung cost scale.** 55 talents at 1 Investiture, 9 at 2, exactly **1** at 3, 0 at 4, across 125 talents. Consequence: leyline power is paced *entirely* by rank gates, which makes the level-6 discontinuity (rank 3 → d8 *and* Tier 2 in one step) even sharper than it needs to be, since nothing in the cost structure ramps alongside it. Deity, using all four rungs, has a textbook 1 → 1 → 3 curve; heroic, using all three Focus rungs, has 0.14 → 0.38 → 1.50 on Warrior. Leyline is the only atlas with no curve at all.

8. **Seven Specials/Free Actions that fire on another character's action** and therefore duck the 1-Reaction cap — most consequentially `White/Unbreakable Line` (3 Investiture, once per round, ally-drops-to-0 interrupt, no Reaction spent) sitting in the tree that already has seven Reactions. Either the standard should permit off-turn Specials explicitly, or these seven should be retyped. As written the guide is silent and the trees are exploiting the silence.

9. **`Phantom Double` — the only leyline talent that fails four standards at once.** Depth 0, 2 Actions, 2 Investiture (half a level-1 pool), 76 words (3× the cap). Every leyline standard it can violate, it violates. It is a single-talent fix and it is Blue's worst entry.

10. **Heroic paths spend 28 of 39 shared-name slots (18.7% of the heroic talent budget) on stock that exists in other trees**, concentrated in Agent (6), Envoy (6), Hunter (5), Leader (5), Warrior (5). Deity spends one; leyline spends 1–3. This is the structural cause of the "41 of 365 slots are a talent that also exists in another tree" finding and of Agent's "walled in breadth" verdict — a heroic tree effectively has 19–20 distinctive talents, not 25, while a leyline tree has 22–24.

---

## 11. What this audit cannot settle

- **Whether any given effect size is correctly priced** requires an adversary baseline (is 1d6 a lot?) — out of scope by ruling. What would settle it: running the deity capstones' true action price (§1c) against an actual encounter's HP budget in `data/adversaries.json`.
- **Whether `Foresight` and `Authority` are genuinely over-powered or merely under-priced relative to their tree** needs a table test, not a text audit. Both are `🤖` candidates: a bench run can measure how often an Envoy actually uses the second Reaction.
- **The `"Variable Investiture"` / `"Variable Focus"` costs (6 talents)** cannot be placed on the cost curve at all — the cost field gives no scale. They are excluded from every mean in §3 and someone should decide what they actually cost before the next economy pass.

## Adversarial verification

**32 load-bearing claims checked: 15 confirmed, 15 corrected, 2 refuted.**

The audit's arithmetic is unusually clean — I re-derived the full action-type table, the word-count table, the 498-word deity overrun, the depth-band cost means, the shared-stock census (39/365, heroic 28, deity 1), the prerequisite-pacing table and five of the L1 distances, and every one reproduced exactly. What fails is (a) three named-talent errors, (b) two counts it got wrong because it did not apply the very data defect it discovered, and (c) its causal framing. The single biggest miss is a third classifier bug it should have caught: the dossier's `earliestLevel` field only applies the rank-3→L6 rule to leyline COLOUR gates, so 42 of 365 talents carrying an "X 3+" skill prerequisite report L2–L5. All 36 heroic ones. That means every heroic path has 5–7 talents that are genuinely level 6+ where the data says zero, which falsifies the brief's own structural premise ("heroic trees are reachable by ~L4–L5") and contaminates §3d, §4 and §9. Its flagship under-price, Envoy's `Foresight`, is not a free depth-3 Passive at L4 — it is L6 behind `Discipline 3+` and `Instill Confidence`, which itself requires "a companion" the Envoy tree never grants. On the causal thesis ("the action-type violation IS the weakness") the opposite case wins on the word "cause": it holds cleanly for Tagging Shot, fails outright for Grand Deception and Close the Case, whose payloads are thin at any action price, and the deity-capstone break-even model overstates the alternative because three copies of a 1-Action weapon-attack talent in one turn is illegal under the once-per-turn same-weapon Strike restriction. The finding survives as a targeting claim, not a causal one — and the prescribed fix (retype to 2 Actions + Free Action) would leave two of the four unfixed.

### Claims

1. **CONFIRMED** — §1 The full action-type distribution table for all 21 trees, plus atlas totals: leyline 43.2/21.6/10.4/8.0/0/2.4/14.4; heroic 34.0/29.3/14.0/8.0/2.7/6.7/5.3; deity 15.6/0/37.8/23.3/11.1/6.7/5.6.
   - Evidence: Recounted from all-talents.json with glyphs normalised (∞→Passive, ★→Special, ◇→Free, ⟲→Reaction). Every one of the 21 rows and all three atlas totals match to the talent. Leyline Passive 54/125, Special 27/125, 1A 13/125, 2A 10/125, 3A 0/125, Free 3/125, Reaction 18/125. Deity Special = 0 in all ten trees, 90/90.
2. **CONFIRMED** — §1 The heroic atlas hits its own benchmark (34/30/14/8/2/7/5) to within 0.7pp on every row; the leyline atlas misses by +8.2 Passive, −5.9 Special, +7.9 Reaction.
   - Evidence: Heroic actuals 34.0/29.3/14.0/8.0/2.7/6.7/5.3 against 34/30/14/8/2/7/5; max row deviation 0.7pp (Special). Leyline actual 43.2 vs 35 target = +8.2; 21.6 vs 27.5 = −5.9; 14.4 vs 6.5 = +7.9. Both computed from the recount above.
3. **CONFIRMED** — §0(b) The leyline design guide's prose is stale — it says 'The current leyline trees have 0% Specials and 14% 3-Action costs — both need fixing'; both are fixed.
   - Evidence: DESIGN-GUIDE-CLAIMS.md line 32 carries that sentence verbatim. Actual leyline: 27 Specials / 125 = 21.6%, and 0 three-Action talents in 125 rows (the 14 three-Action talents in the corpus are 10 deity capstones + 4 heroic).
4. **CORRECTED** — §1a The deity Passive (25–30%) and Special (15–20%) targets are arithmetically unhittable, because a 9-talent tree can only express 0, 11.1%, 22.2%, 33.3%…
   - Evidence: The arithmetic is right for n=9, and DESIGN-GUIDE-CLAIMS.md lines 156–157 do state both as percentages. But line 148 of the SAME guide says 'Deity trees run 8–10 talents total', and at n=10 both bands are hittable EXACTLY: 3/10 = 30% Passive (top of the band) and 2/10 = 20% Special (top of the band).
   - Corrected: The deity Passive and Special bands are unhittable at n=9 — the size the guide calls 'cleanest' — but hittable at n=10, which the same guide sanctions in the line above. The finding is therefore not 'the targets are impossible' but 'all ten trees were built at the one legal size where two of the seven targets cannot be met', which makes it a tree-shape decision as much as a guide bug. The recommended fix (restate targets as counts) is still right, but it should be paired with either moving to n=10 or explicitly blessing n=9's 11.1%/22.2% grid.
5. **CONFIRMED** — §1b There are 14 three-Action talents; 10 are deity capstones at depth 3 (compliant, 10/10); the remaining 4 are heroic violations — Tagging Shot (Hunter, d0, L1), Close the Case (Agent, d3), Grand Deception (Leader, d3), Synchronized Assault (Leader, d4) — and all four are their own tree's bottom-1 or bottom-2 talent.
   - Evidence: Exactly 14 rows have action='3 Actions'. All ten deity ones are depth 3, one per tree. The four heroic ones match on tree, depth and cost (Close the Case 3 Focus, Grand Deception 3 Focus, Synchronized Assault 2 Focus, Tagging Shot no cost). Bottom-three lists: Agent bot = [Close the Case, Mercurial Façade, Watchful Eye]; Leader bot = [Grand Deception, Synchronized Assault, Through the Fray]; Hunter bot = [Tagging Shot, Exploit Weakness, Steady Aim]. Four for four.
6. **CORRECTED** — §1b/§10#1 The causal claim: 'the action-type violation IS the weakness, not a coincidence beside it' — the cleanest causal link in the review; the fix is to restructure each to 2 Actions plus a Free-Action follow-up.
   - Evidence: OPPOSITE CASE. (i) The convergence is not independent: every dossier line prints the action cost, so thirteen analysts scoring value-per-Action will mechanically rank the highest Action price lowest — the same judgment made twice, not two measurements converging. (ii) The counterfactual fails for two of four. Grand Deception's entire text is 'Spend 3 focus to test Deception (DC 15) to reveal a ruse that changes a detail' — 14 words, no mechanical payload, at 1 Action it is still the worst talent in Leader. Close the Case is 'test Deduction vs. Cognitive… On success, they back down' — a non-combat social resolution for 3 focus; retyping does not give it a payload. (iii) It holds cleanly for Tagging Shot: heroic/Hunter's Seek Quarry is a depth-0, L1, zero-cost SPECIAL that grants the quarry mark plus advantage, so Tagging Shot spends a whole Slow turn on the same mark plus a Move and a Strike — retyped to 1 Action it is fine. The analysis names the comparison but never names Seek Quarry.
   - Corrected: The four non-capstone 3-Action talents are correctly identified as their trees' worst, but the action type is the CAUSE in only two of them (Tagging Shot, and arguably Synchronized Assault). Grand Deception and Close the Case are payload failures that survive any retyping. State it as a targeting finding ('fix these four') rather than a causal law, and give Grand Deception and Close the Case new effects, not new action types.
7. **CORRECTED** — §1c 9 of 10 deity capstones are flagged weak by their own tree's profile; only Power's Mantle of the Aspirant escapes; 'they feel similar because nine of their ten capstones are equally unusable.'
   - Evidence: Checked the ten profile JSONs directly. Nine capstones do appear in a weakTalents entry — but two of those nine ALSO appear in the same profile's topThree. deity-Destruction weakTalents names it 'The Unmooring (partial — capstone undersold, not a never-pick)' and its topThree entry calls it 'the only genuinely scene-defining effect in the tree'. deity-Sovereignty's topThree says 'Sovereignty — the capstone package… It sets the tree's ceiling even though it is the thinnest of the ten.' Bottom-three placements: only Death, Fate and Knowledge put their capstone in bottomThree.
   - Corrected: Seven of ten deity capstones are unambiguously flagged weak; two more (Destruction's The Unmooring, Sovereignty's Sovereignty) appear in BOTH their tree's weak list and its top three — i.e. 'undersold against guide principle 9', not unusable; one (Power's Mantle) is top-three only. The cost mechanism the analysis describes is corroborated verbatim by both double-listed profiles, so the pricing diagnosis survives; 'equally unusable' does not.
8. **CORRECTED** — §1c The mechanism is 'a 3-Action / 3-Investiture / once-per-scene capstone' and 'is the same every time'.
   - Evidence: deity/Chaos's Unravel Everything carries no once-per-scene clause (grep of its description); it is the only repeatable capstone. deity/Death's Raise Dead costs 4 Investiture, not 3 — which the analysis's own table shows but its prose formula does not.
   - Corrected: Nine of ten capstones are 3 Actions + 3 Investiture + once per scene; Death is 3A + 4I + once per scene; Chaos's Unravel Everything is 3A + 3I and REPEATABLE. The 'same every time' framing is off by one in each direction.
9. **CORRECTED** — §1c 'A 3-Action capstone must beat three copies of the tree's best repeatable to break even' — e.g. three Predatory Strikes at 1 Action + 1 Investiture each.
   - Evidence: heroic/Hunter's Unrelenting Salvo reads 'You can Strike your quarry more than once per turn with the same ranged weapon' — and a corpus grep for 'more than once per turn' returns that one talent only. The baseline therefore restricts a character to one Strike per turn with the same weapon. deity/Knowledge's Predatory Strike is 'Spend 1 Investiture and make a melee or ranged weapon attack', so three of them in one Slow turn is not legal.
   - Corrected: The break-even bar is lower than 3× the best repeatable wherever that repeatable is a weapon Strike. For Knowledge the honest comparison is one Predatory Strike plus two other Actions (Draw Mana, Move, a second weapon), not three Predatory Strikes — which cuts the stated 3× hurdle by up to two-thirds. The Tier-1 leg of the argument (3 Investiture = 3 Draw Mana Actions + 3 Actions to fire = two whole Slow turns) is unaffected and stands.
10. **CONFIRMED** — §1d Zero talents typed Action/2A/3A are trigger-shaped, but 7 talents typed Special or Free Action fire on another character's action and so duck the 1-Reaction cap — Unbreakable Line, Reactive Analysis, Emotional Overload, Breaking Point, Spreading Roots, Pack Sense, Inspired Zeal.
   - Evidence: A scan of every Special/Free-typed talent for an 'when a/an ally|enemy|character' trigger returns exactly those seven, plus one near-miss (leyline/Black Predatory Insight, whose off-turn clause is a secondary 'Regain 1 focus when any character…' rider). No Action/2A/3A talent opens with When/Whenever/If. Unbreakable Line verbatim: 'Once per round, when an ally adjacent to you would drop to 0 health, spend 3 Investiture and test White with a DC equal to 1/2 of the damage taken. On a success, they drop to 1 health instead.'
11. **CORRECTED** — §1d/§10#8 'the standard is silent and the trees have quietly discovered the loophole' — either these seven should be Reactions or the guide should permit off-turn Specials.
   - Evidence: Principle 10, quoted verbatim from DESIGN-GUIDE-CLAIMS.md line 214, is a DEITY-guide rule and says only that such a talent 'is a Reaction (⟲), not an Action (▶)' — it never mentions Specials. Six of the seven offenders are leyline, and the LEYLINE guide's revision principle 1 (line 53) instructs the opposite: 'When revising a talent that says "costs 1 Action to do X when Y happens," ask whether it could be a Special instead.'
   - Corrected: The six leyline off-turn Specials are the leyline guide's own principle 1 applied as written, not a discovered loophole — the two guides disagree with each other, which is where the problem starts. The genuine finding is narrower and still worth acting on: White's Unbreakable Line is a 3-Investiture death-save interrupt that competes for no Reaction slot in the tree with seven Reactions, and it is the only one of the seven whose effect size makes the free slot decisive. Note it is also L6 (White 3+) and requires a successful White test at DC = half the damage, which the analysis omits.
12. **REFUTED** — §2 White has 'only 4% 1-Action (one talent: Terms of Accord)'.
   - Evidence: leyline/White Terms of Accord is action='Special' ('When you and a character within Attunement Range verbally agree on a shared objective, spend 1 Investiture…'). White's single 1-Action talent is Guiding Signal (depth 0, 1 Investiture): 'Spend 1 Investiture to designate a character within Attunement Range. The next ally who tests against it this round raises the stakes.'
   - Corrected: White's 1-Action share is 4% — one talent, Guiding Signal (d0, 1 Investiture). The percentage and the argument built on it are correct; the talent named is wrong.
13. **CONFIRMED** — §2 22 of the system's 31 Reactions also cost a resource, and all seven of White's do (Interposing Shield d1 1I, Retributive Guard d1 1I, Counterpoint d1 1I, Shared Burden d2 2I, Shared Conviction d3 2F+1I, Pillar of Order d0 1I, Voice of Authority d4 1I).
   - Evidence: 31 Reaction-typed talents in the corpus (leyline 18, heroic 8, deity 5); 22 carry a non-empty cost, 9 are free (Red Shatter Focus, Green Packmate's Warning, Agent Watchful Eye, Envoy Withering Retort, Leader Resilient Hero, and the four deity Reactions Shoulder the Oath / Bonds of Community / Combustion Chain / Hexmark). White's seven-row table matches on name, depth and cost exactly.
14. **REFUTED** — §2 Blue's five Reactions are 'all Investiture-costed, four of them level-2-reachable'.
   - Evidence: Intercept d1 L2, Redirect Momentum d1 L2, False Premise d2 L3, Counterspell d2 L6 (Blue 3+), Anticipate d3 L6 (Blue 3+). Two are level-2-reachable, not four.
   - Corrected: Blue's five Reactions all cost Investiture, but only TWO are reachable at level 2 (Intercept, Redirect Momentum); False Premise is L3 and Counterspell and Anticipate are both behind Blue 3+, i.e. level 6. This makes Blue's early-game Reaction contention milder than claimed and pushes more of the problem into the level-6 wall the same analysis identifies elsewhere.
15. **CORRECTED** — §2 'White cannot spend more than about 1–2 Investiture per round no matter how many talents it owns, because six of its seven premium plays are locked behind a slot it only gets once.'
   - Evidence: White's 15 Investiture costers split 7 Reaction / 6 Special / 1 one-Action (Guiding Signal) / 1 two-Action (Ordered Advance). Beacon of Stability is a Special that rides Draw Mana itself. So a White character with 3 Actions can legally Draw Mana (+Beacon, 1I), fire Guiding Signal (1I) and still spend a Reaction (1I) in the same round.
   - Corrected: White has eight non-Reaction Investiture sinks, six of them Specials, so its per-round ceiling is ~3 Investiture, not 1–2. The Reaction glut is real (7 talents, one slot, all costed) and the §10#5 conclusion that White cannot act on its own initiative survives on the 4% 1-Action figure — but the sharper 'the Reaction cap is a de-facto spending cap that accidentally cancels the zero-regen exposure' is overstated by roughly a factor of two.
16. **CORRECTED** — §3a Mean resource cost by depth band — leyline flat, Red inverted (0.75/0.45/0.20), heroic Warrior/Scholar/Leader rising, every deity tree textbook 1.0 → 0.83–1.67 → 3.0.
   - Evidence: Every printed figure reproduces exactly. But the deity depth bands are n=2 / n=6 / n=1 — the 'd3+' column is a single talent, the capstone, in all ten trees. And the heroic table omits two trees that invert: Envoy 0.29 → 0.42 → 0.17 and Hunter 0.00 → 0.40 → 0.33.
   - Corrected: The numbers stand. The framing does not: deity has no cost CURVE, it has a capstone price (one talent per tree at depth 3+), and heroic is 3 rising / 2 inverted / 1 flat, not a curve-having atlas. 'Leyline is the only atlas with no curve at all' (§10#7) should read 'leyline and half the heroic atlas have no curve; deity's is one data point per tree.'
17. **CORRECTED** — §3b Across 125 leyline talents: 55 at 1 Investiture, 9 at 2, exactly 1 at 3, 0 at 4; Focus only 3 talents, all 2F+1I; HP only 2, both Black.
   - Evidence: Leyline cost-field census: 1 Investiture in any combination = 50 (39 plain + 6 'Opportunity; 1 Investiture' + 2 '2 Focus; 1 Investiture' + 1 '2 Focus; 1 Investiure' + 1 '1 Investiture + Lose HP = Tier' + 1 '1 Investiture ' with trailing space). 2 Investiture = 9 ✓. 3 Investiture = 1 (White/Unbreakable Line) ✓. 4 = 0 ✓. Focus = 3, all 2F+1I ✓. HP = 2, Withering Ray ('Lose HP = half [Die]') and Dark Investiture ('1 Investiture + Lose HP = Tier'), both Black ✓. No cost = 59; Opportunity-only = 3; Variable = 2.
   - Corrected: 50 talents at 1 Investiture, not 55 (the extra 5 are the 3 Opportunity-only and 2 'Variable Investiture' rows, which are not 1-Investiture talents). Everything else in §3b is exact, and the conclusion — leyline's entire pricing vocabulary is 'free or 1 Investiture' — is if anything strengthened: 109 of 125 leyline talents are free or 1 Investiture.
18. **CORRECTED** — §3b Deity uses the whole cost scale: 31 × 1I, 28 × 2I, 10 × 3I, 1 × 4I across 90 talents.
   - Evidence: Deity cost-field census: 1 Investiture = 34 (33 plain + 1 '1 Investiture, Opportunity'); 2 Investiture = 28; 3 Investiture = 9; 4 Investiture = 1; no cost = 18 (7 '—' + 11 empty string). Total 90.
   - Corrected: 34 × 1I, 28 × 2I, 9 × 3I, 1 × 4I, 18 free. Note the '10 × 3I' contradicts the analysis's own §1c table, which correctly shows nine capstones at 3I plus Death at 4I — all nine 3-Investiture talents in the deity atlas ARE capstones, which is a sharper version of the same point. Also: 18 free deity talents, of which 11 have an EMPTY-STRING cost field rather than '—' — a third cost-field encoding the analysis's parser description ('undefined and — both = no resource cost') does not mention.
19. **CONFIRMED** — §3b The stated thematic cost identities are unimplemented — Black pays Investiture like everyone else (2 HP / 1 Focus of 25); Blue has one Focus talent and 15 Investiture costers; Red has 3 Opportunity talents, the most of any tree, two of them (Reckless Momentum, Afterburn) depth-4/L5–6 riders; White has 2 Opportunity talents.
   - Evidence: Opportunity-costing talents by tree: Red 3 (Reckless Momentum d4 L5, Afterburn d4 L6, Reckless Gambit d3 L6) — the highest; White 2 (Mending Aura d4 L5, Collective Resolve d3 L4); Green 2; Blue 1 (Probability Cascade); Black 1 (Predatory Insight); Scholar 1; Power 1. Black's HP costers are exactly Withering Ray and Dark Investiture; its only Focus coster is Puppeteer. Guide lines 90/96/103 carry the quoted cost identities verbatim.
20. **CONFIRMED** — §3c Only five talents in the whole corpus are depth-0 and priced at 2+ resource units: Phantom Double (Blue, 2A + 2I), Isolating Pressure (Chaos, 1A + 2I), Sure Outcome (Agent, Special + 2F), Plausible Excuse (Agent, Reaction + 2F), Strategize (Scholar, Special + 2F).
   - Evidence: A sweep of all 365 for depth===0 and total resource units ≥2 returns exactly those five, with those action types and costs. Phantom Double verified at 76 words, depth 0, level 1, 2 Actions, 2 Investiture, and its text does run a per-enemy Perception test against your Cognitive defense with separate success/failure clauses and a 1-HP destruction condition, as described.
21. **CORRECTED** — §3d Foresight (Envoy) and Authority (Leader) are 'the two clearest under-prices in the system' — free permanent Passives at depth 3 with no resource cost that change how an entire path operates.
   - Evidence: Authority stands: prerequisites = 'Title granting you command of 5+ people' (a campaign station, no rank gate), depth 3, genuinely L4, no cost. Foresight does not: prerequisites = 'Instill Confidence; Discipline 3+'. Discipline 3+ is a rank-3 gate, i.e. LEVEL 6 — the dossier's earliestLevel says 4 because that field only applies the rank-3 rule to leyline colour gates. And Instill Confidence itself requires 'Lessons in Patience; a companion' — an entity no Envoy talent grants. The Envoy profile already records Foresight among 'depth 3+ — 6 talents, ALL gated at L6'.
   - Corrected: Authority is the clearest under-price in the system. Foresight is a level-6 talent behind a rank-3 skill gate and a two-step chain whose middle link (Instill Confidence) requires a companion the Envoy path cannot produce — it is not a free depth-3 Passive at all, and it belongs with the level-6 wall findings rather than with the free-capstone findings. It IS still the only unconditional extra Reaction in 365 talents (heroic/Hunter's Sidestep grants one too, but only 'to Dodge when you're not wearing armor with deflect of 2 or higher') — that hedge was correct.
22. **CORRECTED** — §4 Investiture-coster table: White 15/25 (18 total), Blue 15/25 (18 total), Green 12/25 (14 total), Black 9/25 (11), Red 9/25 (10), Power 9/9 (15).
   - Evidence: Recount with a regex tolerant of the 'Investiure' typo: White 15/25, 18 total ✓. Blue 16/25, 19 total. Green 13/25, 15 total. Black 9/25, 11 ✓. Red 9/25, 10 ✓. Power 9/9, 15 ✓; Chaos 8/9 (14), Death 8/9 (14), Life 8/9 (13), Civilization 7/9 (11), Fate 7/9 (11), Sovereignty 7/9 (13), Order 6/9 (10), Knowledge 6/9 (10), Destruction 6/9 (10).
   - Corrected: Blue is 16/25 costers and 19 total Investiture; Green is 13/25 and 15. The Blue miscount is exactly Counterspell — the talent whose 'Investiure' typo the analysis itself flags in §8 as 'a silent under-count in any Investiture-economy analysis run off the cost field'. It ran that under-count. Direction of the conclusion is unchanged and slightly reinforced: Blue is the most Investiture-exposed tree in the atlas at 16/25 with zero regen.
23. **CORRECTED** — §10#3 'six deity trees have zero Investiture regen'.
   - Evidence: The brief's resource-economy census lists regen 1 each for Chaos, Death, Life, Knowledge and Sovereignty and 0 for Order, Civilization, Destruction, Fate and Power.
   - Corrected: Five deity trees have zero Investiture regen: Order, Civilization, Destruction, Fate and Power. The rest of the sentence (Power has 9 costers and 0 producers) is correct.
24. **CONFIRMED** — §5 Black's 15 Passives split 11 trigger-shaped / 4 flat stat sticks, two of which are shared stock (Hardy, Composed), and 15 of Black's 25 talents cost no action and no resource.
   - Evidence: Black's 15 Passives: 11 open with a When/Whenever trigger (Black Leyline Attunement, Predatory Patience, Sapping Hex, Blood Price, Necrotic Grasp, Sanguine Reservoir, Predator's Due, Siphoned Will, Coercive Pressure, Extract Thought, Whispered Doubt); 4 are flat (Severance, Dread Presence, Hardy, Composed), of which Hardy and Composed are shared stock. Zero of the 15 carries a cost field — 15/25 genuinely free-and-actionless. §10#4's warning (converting them to Specials would nerf the tree) rests on a verified premise.
25. **CONFIRMED** — §5 Shared-stock filler is 39 of 365 slots (10.7%), 28 of them heroic (18.7% of the heroic budget), leyline 1–3 per tree, deity exactly one (Shatter Focus, shared with leyline/Red, different mechanics under the same name).
   - Evidence: Duplicate-name census across all 365: Hardy ×7, Mighty ×6, Collected ×5, Composed ×3, Baleful ×3, Surefooted ×3, and six ×2 pairs (Shatter Focus, High Society Contacts, Well Dressed, Customary Garb, Combat Training, Swift Strikes) = 39 slots across 12 names. By atlas: heroic 28, leyline 10, deity 1. 28/150 = 18.7%. The one deity instance is Chaos's Shatter Focus (Reaction, 1 Investiture) against leyline/Red's Shatter Focus (Reaction, no cost). One minor slip: the §5 prose lists Agent's five shared Passives as six names by including High Society Contacts, which is a Special.
26. **CONFIRMED** — §6 Word-count table for all 21 trees, and deity overrun against the banded caps totalling 498 words (Fate 108, Destruction 90, Order 86, Civilization 56, Death 54, Power 54, Chaos 0); the sustain boilerplate is 9 talents / 114 words and stripping it leaves Fate at 58.7 and Order at 53.7.
   - Evidence: Every mean, median, min, max and >25/>40/>55 count reproduces exactly. The 498 total and every per-tree overrun reproduce with caps of 45 words for depth 0–1, 55 for depth 2 and 70 for depth 3. The 'You may sustain…' boilerplate appears on exactly 9 talents (Order Edict/Covenant, Civilization Forge Construct/Lay Foundation, Death Reaper's Harvest/Risen Servant, Destruction Set Charge, Fate Ordained Ground/Snare); 114/9 = 12.7. Longest talents confirmed: Set Charge 101w at depth 0, Thread of Inevitability 93w capstone, Final Decree 82w, Edict 77w d0, Phantom Double 76w d0, Covenant 73w d0.
27. **CORRECTED** — §6 Set Charge's buried 'You may detonate any of your Charges as a Free Action on your turn' is 'precisely the action-type-honesty violation the deity guide's principle 10 was written to catch'.
   - Evidence: Principle 10 verbatim (guide line 214): 'A talent whose effect triggers on another character's action is a Reaction (⟲), not an Action (▶). A talent that grants an upgrade rider applied during another talent's placement is a Free Action (◇), not an Action.' It governs the talent's OWN action type and upgrade riders; it says nothing about a Free Action granted inside a talent's body. The quoted Set Charge clause is verbatim correct.
   - Corrected: Set Charge is a genuine overload case (101 words, six mechanics, depth 0) and the buried permanent Free-Action grant is worth flagging — but it is not a principle-10 violation. If it violates anything it is pitfall 'Synthesis nodes / capstones' and leyline principle 2's 'one core effect per talent'. Cite the right rule or the fix will be argued away.
28. **CONFIRMED** — §7 Prerequisite-pacing table: 66 of 76 deep leyline talents are rank-gated; Red is the outlier at 11/15 with Shockwave Slam, Explosive Leap, Reckless Momentum and Frenzied Tempo ungated.
   - Evidence: Recomputed over depth≥2 talents counting either a rankGate field or an 'N+' token in prerequisites. White 14/15 (ungated: Unity of Purpose), Blue 15/15, Black 13/15 (Hardy, Composed), Red 11/15 (Shockwave Slam, Explosive Leap, Reckless Momentum, Frenzied Tempo), Green 13/16 (Scent the Weak, Coordinated Hunt, Packmate's Warning) = 66/76. Every heroic row and every named ungated talent also matches.
29. **CONFIRMED** — §8 Data defects: Counterspell's cost reads '2 Focus; 1 Investiure'; Volatile Strike has a trailing space; Living Image / Reknit Form say 'Variable Investiture'; Practiced Oratory / Resolute Stand / Set at Odds say 'Variable Focus'; Absolute Stillness says 'also has disadvantage'; Collective Resolve says 'gran allies'.
   - Evidence: All eight verified byte-for-byte in all-talents.json. Counterspell cost = "2 Focus; 1 Investiure"; Volatile Strike cost = "1 Investiture "; Absolute Stillness = 'Creatures you have reduced to 0 Speed also has disadvantage on Physical tests…'; Collective Resolve = '…to gran allies within Attunement Range Determined.' The claim that deity principle 6 (spend-phrase opening) is 90/90 compliant with seven exempt talents also holds — the seven exempt are the three Free-Action upgrade riders (Sealed Edict, Pinpoint Charge, Inevitable Snare) and four zero-cost Reactions (Shoulder the Oath, Bonds of Community, Combustion Chain, Hexmark).
30. **CORRECTED** — §11 The six 'Variable Investiture' / 'Variable Focus' talents 'cannot be placed on the cost curve at all — the cost field gives no scale.'
   - Evidence: Two of the six state their scale in the description. leyline/Green Reknit Form: 'Spend 2 Investiture and touch a creature to remove one temporary injury, or spend 3 Investiture to remove a permanent injury.' leyline/Blue Living Image: 'Complex illusions cost 1 Investiture per round to maintain.'
   - Corrected: Four of the six are genuinely open-ended (all three 'Variable Focus' talents, which scale with a skill rank, plus the parsing gap). Reknit Form is 2-or-3 Investiture and Living Image is 1 Investiture per round — both placeable. Fixing their cost fields is a two-line data change, not a design decision.
31. **CONFIRMED** — §9 The L1-distance ranking (deity/Life 102pp worst, heroic/Hunter 10pp best), with word-overrun column.
   - Evidence: Reproduced the metric as the sum of |actual% − target-midpoint| over the seven action types. Life: 1A +36.7, Special −17.5, Passive −16.4, Free −12.5, Reaction −10, 2A −8.9 = 102. Black: Passive +25, Special −23.5, 2A +4, 1A −3, Free −2.5, Reaction +1.5 = 59.5 ≈ 60. White 51.5 ≈ 52. Blue 27.5 ≈ 28. Hunter 10 exactly. The word-overrun column reproduces exactly for all 11 non-deity trees against the 25-word cap (Blue 113, Green 81, Hunter 75, Warrior 65, Black 51, White 47, Red 44, Scholar 25, Leader 14, Agent 9, Envoy 3).
32. **CONFIRMED** — §10#3 deity Special = 0 is the direct cause of the '2–3 rounds then nothing' verdict, because deity runs the system's two highest 1-Action (37.8%) and 2-Action (23.3%) shares.
   - Evidence: deity 1A 34/90 = 37.8% against leyline 10.4% and heroic 14.0%; deity 2A 21/90 = 23.3% against leyline 8.0% and heroic 8.0%. Both are the highest in the system by a wide margin. Combined with the corrected regen census (five deity trees at zero regen, Power 9 costers / 0 producers) the mechanism holds. 'One Special per deity tree (11.1%) would change the deity round economy more than any content change' is the strongest actionable item in the audit.

### What the analysis missed

- THE THIRD CLASSIFIER BUG, and it is bigger than the one the analysis found. The dossier's `earliestLevel` field applies the rank-3 → level-6 rule ONLY to leyline colour gates (the `rankGate` field), never to skill-rank prerequisites written into the `prerequisites` string. 42 of 365 talents carry an 'X 3+' prerequisite and report earliestLevel 2–5. Examples: heroic/Envoy Foresight 'Instill Confidence; Discipline 3+' → L4; heroic/Agent Close the Case 'Hardy; Deduction 3+' → L4; heroic/Warrior Devastating Blow 'Combat Training; Athletics 3+' → L2; heroic/Scholar Overcharge 'Prized Acquisition; Crafting 3+' → L2; leyline/Green Natural Recovery 'Green 2+; Medicine 3+' → L3. The analysis's own §7 table counts exactly these prerequisites, so it had the data in hand and used the contaminated field anyway in §3d, §4 and §9.
- CONSEQUENCE THE BRIEF'S OWN STRUCTURAL PREMISE GETS WRONG. Under the corrected rule every heroic path has 5–7 talents that are genuinely level 6+, where the data says zero: Agent 7/25, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5 — 36 of 150 heroic talents (24%). The brief's stated structural fact ('heroic paths carry NO leyline-colour rank gate, so their whole tree is reachable by ~L4–L5') is false as a reachability claim; heroic paths gate on non-colour skills instead, at the same level-6 cliff. This bears directly on the designer's question 2 (do heroic and leyline feel similar in power at similar points along the tree) and a shape audit is exactly the analysis that should have answered it.
- THE CORRECTED PRE-L6 DENOMINATORS, which the analysis's §4 argument depends on. Excluding rank-3-gated talents: Blue 12 of 17 pre-L6 talents cost Investiture (71%, worse than the 67% claimed and the worst in the system); White 11 of 20 (55%); Green 7 of 17 (41%); Black 6 of 20 (30%); Red 7 of 19 (37%). The Blue conclusion survives and hardens; the numbers printed do not.
- SIX MORE DESCRIPTION TYPOS beyond the two listed, one of them the same defect class as Counterspell but worse. heroic/Envoy Practiced Oratory reads 'When you use Rousing **Resence** or Steadfast Challenge…' — a broken cross-reference to Rousing Presence, the talent its entire effect keys off; a name-keyed grep or an engine handler resolving that string finds nothing. Also heroic/Leader Set at Odds 'Spend focus equal **lto** the number of targets'; heroic/Envoy Peaceful Solution 'you **ase** tensions and end combat'; heroic/Envoy Rallying Shout and heroic/Scholar Resuscitation both write '**Unconcious**' (a condition name); heroic/Scholar Field Medicine writes 'heal a **concious** character'. All six are in the heroic atlas, which is also the 32–68% unwired atlas — worth pairing with the wiring pass.
- A THIRD COST-FIELD ENCODING. The analysis says its parser treats 'undefined' and '—' as no cost. There is a third: 11 deity talents carry an EMPTY STRING cost (Order Lawkeeper's Eye / Bear Witness / Shoulder the Oath, Civilization Tempered Edge / Bonds of Community, Death Reaper's Harvest, Destruction Concussive Yield / Walking Ruin / Combustion Chain, Fate Bulwark Ground / Hexmark). Any parser keyed on the two documented sentinels mis-handles 12% of the deity atlas. Its own §3b deity totals are off partly because of this.
- THE UNNAMED COMPARISON IN ITS BEST FINDING. §1b's Tagging Shot argument says 'the quarry mark alone is what other Hunter entries hand out for free' without naming the talent. It is Seek Quarry — Special, depth 0, level 1, no cost: 'Choose a character to be your quarry, gaining an advantage on tests to find, attack, and study them.' Naming it turns a rhetorical point into a one-line falsifiable diff and makes the retype fix obvious (1 Action: Move 5 ft, ranged attack, apply quarry).

### Surviving findings, in priority order

1. deity/Special = 0 across all ten trees and all 90 talents, against a stated 15–20% target — the only target every tree in an atlas misses in the same direction, and the direct mechanical cause of deity running the system's highest 1-Action (37.8%) and 2-Action (23.3%) shares. Combined with five deity trees at zero Investiture regen (Order, Civilization, Destruction, Fate, Power), this is the '2–3 rounds then nothing' verdict five profiles reached independently. One Special per deity tree — 11.1%, the nearest legal value at n=9 — is the highest-leverage change in the audit. FULLY CONFIRMED.
2. The deity capstone slot is mispriced. Nine of ten capstones appear in their own profile's weak list; seven unambiguously so. The mechanism holds after correction: 3 Actions to fire plus 1.5 Actions of Draw Mana income at Tier 2 (3 Actions of income at Tier 1) for a once-per-scene effect, against a repeatable the same tree can fire every round — though the break-even bar is lower than the stated 3× wherever the repeatable is a weapon Strike, because the once-per-turn same-weapon restriction (lifted only by Hunter's Unrelenting Salvo) forbids three copies in one turn. Two of the nine (Destruction's The Unmooring, Sovereignty's Sovereignty) also sit in their tree's TOP three, so 'equally unusable' overstates it; 'undersold against guide principle 9' is the honest reading for those two. Chaos's Unravel Everything is the one repeatable capstone; Death's costs 4 Investiture.
3. Four non-capstone 3-Action talents exist and all four are their tree's bottom-1 or bottom-2: Tagging Shot (Hunter, depth 0, level 1), Close the Case (Agent), Grand Deception and Synchronized Assault (Leader). The targeting is right; the causal claim is not. Retyping fixes Tagging Shot cleanly — Seek Quarry hands out the same mark as a free depth-0 Special — but Grand Deception ('Spend 3 focus to test Deception (DC 15) to reveal a ruse that changes a detail') and Close the Case are payload failures that survive any action price. Fix all four, but give two of them new effects, not new action types.
4. THE LEVEL-6 WALL IS SYSTEM-WIDE, NOT LEYLINE-ONLY — and this is new, not in the analysis. 42 talents carry a rank-3 skill gate that the dossier's earliestLevel field ignores, 36 of them heroic. Every heroic path has 5–7 talents that are genuinely level 6+ (Agent 7/25, Envoy/Hunter/Scholar/Warrior 6, Leader 5). Heroic paths do not gate on colour, so they gate on Deduction/Discipline/Athletics/Persuasion instead, at the same cliff. Any answer to the designer's question 2 that assumes heroic trees are fully open by L4–L5 is built on a broken field; regenerate earliestLevel to honour every 'N+' prerequisite before the next pass.
5. Leyline has one rung of a three-rung cost scale: 109 of 125 talents are free or 1 Investiture; 9 cost 2; exactly one costs 3 (White's Unbreakable Line); none costs 4. Its depth-3+ band costs the same as its entries or less (Red inverts, 0.75 → 0.45 → 0.20). Leyline power is therefore paced entirely by rank gates (66 of 76 deep talents gated), which is why the level-6 step — rank 3 → d8 AND Tier 2 in one move — lands as a cliff with nothing in the cost structure ramping alongside it. The claimed contrast is weaker than stated: deity's 'curve' is one talent per tree (the capstone) and half the heroic atlas inverts too (Envoy 0.29→0.42→0.17, Hunter 0.00→0.40→0.33).
6. leyline/Blue is the most Investiture-exposed tree in the system: 16 of 25 talents cost Investiture (19 total to fire each once), zero bonus regen, and 12 of the 17 talents reachable before level 6 are costers — 71%. Five Reactions all cost Investiture, but only two are reachable at level 2 (Intercept, Redirect Momentum); Counterspell and Anticipate are both behind Blue 3+ = level 6. This is the economic half of the 'Blue's kit does not assemble until level 6' finding: rank gates are the visible half, the inability to pay at 50% Draw Mana uptime is the other.
7. leyline/White: 28% Reaction (7 talents), every one costing Investiture, zero bonus regen, and a 4% 1-Action share — one talent, Guiding Signal (NOT Terms of Accord, which is a Special). One deviation counted twice: highest Reaction share and lowest 1-Action share in the system, which is why White reads as a bodyguard who cannot act on its own initiative. The spending-cap corollary is weaker than claimed — White has eight non-Reaction Investiture sinks and can legally spend ~3 per round — so trimming Reactions to 2–3 and converting the rest to 1-Actions would fix the initiative problem WITHOUT the compensating benefit the analysis credits.
8. leyline/Black at 60% Passive / 4% Special is the standard's most-flagged violation and is simultaneously the reason the tree works: 15 of its 25 talents cost no action AND no resource (verified — zero of Black's Passives carries a cost), 11 of the 15 are trigger-shaped riders. Applying leyline revision principle 4 ('Eliminate Passives above 35%… convert some to Specials') mechanically to Black would nerf it. Flag Black as an explicit exemption in the guide rather than leaving the rule to be applied literally.
9. The deity Passive and Special bands are unhittable at n=9 but hittable at n=10, a size the same guide sanctions ('deity trees run 8–10 talents'). All ten trees were built at the one legal size where two of seven targets cannot be met. Restate the deity targets as counts (2–3 Passive, 1–2 Special, 2–3 Action, 2 two-Action, 1 Free, 1 Reaction, 1 capstone) or move to n=10 — but do not treat 11% Passive as a violation, because it is the nearest legal value below the band.
10. Data hygiene, all one-line fixes and all verified verbatim: Counterspell's cost 'Investiure' (which silently under-counts Blue's Investiture exposure — the analysis flagged it and then committed it); Volatile Strike's trailing space; eleven deity talents with an empty-string cost field rather than '—'; Reknit Form and Living Image marked 'Variable Investiture' when their descriptions state the scale (2-or-3, and 1 per round); and seven description typos, of which Envoy Practiced Oratory's 'Rousing Resence' is a broken cross-reference to the talent its whole effect keys off, and 'Unconcious' appears twice as a condition name.
