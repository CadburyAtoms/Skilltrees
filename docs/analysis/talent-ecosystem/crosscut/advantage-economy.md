# The advantage economy — the most crowded space in the game

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `advantage-economy`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# The advantage economy — ecosystem analysis

## 0. Headline

The census says advantage is "over-produced" (45 producers / 7 consumers). That framing is wrong in a way that matters. **Advantage is not a currency. It is a boolean state, and it already has a free universal producer built into the rules: the Aid reaction (1 focus, any character, no talent).** So the real finding is not "too many producers, no sinks" — it is that **36 talents across 13 trees compete with a standard reaction every character already has, and with each other, for a slot that holds exactly one value.**

Three concrete consequences, all checkable below:

1. **Two talent texts are literally unimplementable**: heroic/Hunter **Fatal Thrust** ("gain two advantages") and heroic/Warrior **Defensive Position** ("adds two disadvantages to attacks against you, instead of one"). Defensive Position is the worse case — the second disadvantage *is* the talent's entire upgrade over the free standard Brace action, so in Foundry the talent's first clause is a no-op.
2. **The single best advantage talent in the game is free, passive, level 2, party-wide and unlimited** — deity/Order **Lawkeeper's Eye** — and it zeroes out nine paid advantage talents in other trees, including one in its own tree (Final Decree).
3. **The seven trees that never touch advantage are not the losers.** leyline/White, deity/Chaos, Death, Destruction, Knowledge, Life and Sovereignty have zero advantage talents between them, and four of them buff through the **numeric channel** (+1 to all defenses, +1 to all tests, command die, +Tier vital, damage-die steps, raise-the-stakes) which *does* stack. On a per-talent basis they are better designed for a party than Green's five-talent advantage block.

---

## 1. The corrected ledger — all 48 talents, reclassified

I re-derived the ledger from `all-talents.json` rather than trusting it: filtering every talent whose description or authored body contains `advantage` after masking `disadvantage` returns **exactly 48 talents across 14 trees**, matching `advantage-ledger.md` line for line. I also checked for advantage-equivalents written without the word (`roll twice`, `take the higher`, `reroll`): only three hits exist and none is an advantage grant — heroic/Agent's **Opportunist** and **Double Down** (plot-die rerolls) and deity/Chaos's **Shatter Focus** ("that enemy rerolls and takes the lower result"). Shatter Focus is worth flagging separately: it is the only *disadvantage-shaped* effect in the game implemented as an actual second roll rather than through the advantage flag, so **it is the one "disadvantage" in the corpus that stacks with a real disadvantage.**

I use four categories, because the ledger's implied binary (producer/consumer) conflates two different things — talents that touch the advantage *state* and talents that touch the **Gain Advantage standard action**, which is an action-economy interaction, not an advantage-economy one.

| Category | Count | Trees |
|---|---|---|
| **PRODUCER** — grants an advantage to some character | **36** | 13 |
| **CONSUMER** — keys off / redirects an existing advantage | **2** | 2 |
| **DENIER** — prevents or negates an advantage | **2** | 2 |
| **ACTION-RIDER** — triggers on or grants the *Gain Advantage action*, produces no advantage | **11** | 6 (all heroic) |
| Unique talents (3 fall in two categories) | **48** | 14 |

**Producer : consumer = 18 : 1.**

### PRODUCERS (36)

**leyline/Blue — 4.** Blue Leyline Attunement (Key, free, L1, next Cognitive test) · Calculated Patience (∞, free, d0/L1, first test on a Slow turn) · Reactive Analysis (Special, 1 Inv, d1/L2) · Anticipate (Reaction, 1 Inv, d3/L6, ally's influence-resistance test).

**leyline/Black — 2.** Blood Price (∞, free, d1/L2, next Black test) · Predatory Insight (Special, Opportunity + 1 Inv, d2/L3, next Deception test).

**leyline/Red — 4.** Red Leyline Attunement (Key, next Physical test — **and lose your Reaction**) · Flashpoint (Passive, d2/L3, choice-branch) · Reckless Gambit (Special, Opportunity + 1 Inv, d3/L6, one ally + Exhausted[−2]) · Frenzied Tempo (∞, free, d3, Influence tests on a Fast turn).

**leyline/Green — 5.** Primal Awareness (∞, free, d0/L1, Perception to detect/track) · Predator's Instinct (∞, free, d1/L2, track injured/below-half) · Pack Hunter (Special, **1 Investiture**, d0/L1, you + one ally, one attack) · Scent the Weak (★, free, d2/L3, first test each round vs lowest-HP) · Apex Predator (∞, free, d3/L6, all Physical tests while 3+ enemies in your terrain).

**leyline/White — 0.**

**heroic/Agent — 3.** Sleuth's Instincts (Passive, d3, Cognitive vs known motivation) · Close the Case (in-line on its own test) · Shadow Step (in-line, if in cover/obscured).

**heroic/Envoy — 2.** Well Dressed (Special, d1/L2, first social test) · Guiding Oration (Passive, d2/L3, one ally — but requires you to have spent an Action on Gain Advantage).

**heroic/Hunter — 4.** Seek Quarry (Special, free, d0/**L1**, advantage on tests to find, **attack** and study your quarry — the broadest free grant in the game) · Fatal Thrust (in-line, "two advantages") · Shadowing (Special, 3 focus, stealth) · Hunter's Edge (Passive, companion vs quarry).

**heroic/Leader — 1.** Well Dressed (Special, d2/L3 — verbatim identical to Envoy's, one depth deeper).

**heroic/Scholar — 1.** Turning Point (in-line, if you took a Slow turn).

**heroic/Warrior — 4.** Flamestance (Intimidation) · Ironstance (Insight) · Windstance (Agility) · Meteoric Leap (in-line, in Shardplate).

**deity/Order — 2.** **Lawkeeper's Eye** (Passive, **free, no action**, d1/L2 — "you **and your allies** have advantage on attack tests against that character", persists while the Edict holds) · Final Decree (3 Actions + 3 Investiture, once per scene, Witnesses gain one advantage on next attack).

**deity/Civilization — 1.** Bonds of Community (Reaction, free, d1/L2, allies in a Foundation gain temp HP + advantage on next attack).

**deity/Power — 3.** Kneel (free rider on a 1-Action/1-Inv talent: advantage on attacks vs any Compelled/Frightened/Weakened character) · Warlord's Advance (free rider, Presence social tests) · Investiture of Command (2 Actions + 2 Investiture + **unreducible self spirit damage**, 3 allies, one attack each).

**deity/Fate — 0.**
**deity/Chaos, Death, Destruction, Knowledge, Life, Sovereignty — 0 each.**

### CONSUMERS (2)
- **leyline/Red — Emotional Overload** (Special, 1 Inv, d1/L2): "When a character within Attunement Range **gains an advantage from any source**, spend 1 Investiture. It gains a disadvantage on its next non-attack test." The only pure trigger-on-advantage in the corpus. Note it does not *remove* the advantage.
- **heroic/Scholar — Strategize** (Special, 2 focus, d0/L1): "After you Gain Advantage using an Erudition skill, **grant that advantage to an ally instead**." The only transfer in the game.

### DENIERS (2)
- **leyline/Green — Natural Order** (2 Actions + 2 Investiture, d4/L6): enemies "cannot benefit from illusions, magical concealment, or **advantage gained from deception**." Extremely narrow — it denies one *source class*, not advantage.
- **deity/Fate — Bulwark Ground** (Passive, free, d1/L2): "attacks against that ally **cannot benefit from advantage**." The only general advantage denial in the corpus, and it is a defensive aura, not a debuff.

### ACTION-RIDERS (11 — all heroic)
Agent: Quick Analysis, Fast Talker, Trickster's Hand (each grants 2 Actions usable for *Use a Skill / Gain Advantage /* an Agent talent). Envoy: Practical Demonstration, Guiding Oration†. Hunter: Exploit Weakness ("Gain Advantage on your quarry without spending an action"). Leader: Through the Fray (an ally may Gain Advantage as a reaction). Scholar: Strategize†, Keen Insight. Warrior: Flamestance†, Cautious Advance.  († also counted above.)

**Structural note:** every one of the 11 is heroic. No leyline or deity talent interacts with the Gain Advantage action at all. That is a clean atlas boundary and it is worth keeping deliberately rather than by accident.

---

## 2. The third classifier bug (the brief predicted one; here it is — three of them)

`resource-economy.js` reports **advantage: 45 producers / 13 trees, 7 consumers / 5 trees.** Diffed against my read of the text:

| Talent | Classifier says | Text says | Effect |
|---|---|---|---|
| **deity/Civilization — Bonds of Community** | absent | "each ally … gains temporary HP equal to your White **and an advantage on its next attack test**" | **Producer missed entirely.** Civilization is dropped from the producer tree list — hence 13 trees not 14. |
| **leyline/Blue — Anticipate** | absent | "give that character **an advantage** on their resistance test" | Producer missed. Blue counted at 3, is 4. |
| **deity/Fate — Bulwark Ground** | counted as **both** producer and consumer | "attacks against that ally **cannot benefit from advantage**" | It is a **denier**, neither. Counted twice, wrongly, in both columns. |
| **leyline/Green — Natural Order** | counted as consumer | denies advantage from deception | Denier, not consumer. |
| **Envoy Practical Demonstration / Guiding Oration, Scholar Keen Insight** | counted as consumers | trigger on the *Gain Advantage action* | Action-riders. Only Guiding Oration also produces. |

Net: the true producer count is **36, not 45** (the classifier over-counts by folding action-riders and deniers into "producers"), across **13 trees, not 13** (it happens to land on 13 for the wrong reasons — it adds Fate and drops Civilization). The true consumer count is **2, not 7**.

The same defect bit the disadvantage row: the census reports **14 producers**; the text gives **15**. The one it missed is **heroic/Warrior — Defensive Position** ("adds **two disadvantages** … instead of one") — i.e. the regex missed precisely the talent whose phrasing the implementation cannot honour.

---

## 3. The valuation rule: Aid is the benchmark, not the effect size

One advantage is a large effect. `2d20kh` has an expected value of **13.825** against `1d20`'s 10.5 (**+3.33 average**), and at the middle of the curve it converts a 50% test into a 75% test (**+25 percentage points**, the maximum; +19pp at p=0.3, +16pp at p=0.8). A second advantage on the same roll is worth **+0.00**. Verified in the engine, twice over:

- `15-blue-calculation.js:235` `edhaNextModFoldMode` — "Boolean-OR per direction; both directions present cancel to null."
- `52-green-instinct.js:27` `edhaGrantAdvAttack` — writes a single actor flag `advAttackNext`; a second grant overwrites the same boolean.
- `49-order.js:154`, in the engine's own header: *"Lawkeeper + Kneel advantage don't compound (advantage is binary)."* The implementers already found this.

The decisive fact the census misses is in the standard-action list (`cosmere-canon-reference` §Aid, SR p.34): **Aid is a reaction, costs 1 focus, grants an ally an advantage, and every character has it with no talent at all.** Gain Advantage is likewise a 1-Action skill test any character can take.

So the correct valuation of an advantage-granting talent is:

> **Worth = (what Aid costs) − (what this talent costs), plus (rolls covered beyond one), plus (skills Aid cannot reach).**
> An advantage grant that costs *more* than 1 focus + a Reaction and covers *one* roll is a design error by construction.

Under that rule the ranking of the 36 producers is not about power at all — it is about cost:

- **Free, no action, unlimited rolls** → very strong. Lawkeeper's Eye, Seek Quarry, Kneel's rider, Apex Predator, Scent the Weak, Sleuth's Instincts, Hunter's Edge, the three Warrior stances, Blue/Black/Red Keys.
- **Free rider on something you were doing anyway** → fine. Flashpoint, Warlord's Advance, Close the Case, Shadow Step, Turning Point, Meteoric Leap, Fatal Thrust.
- **Costs more than Aid, covers one roll** → **dominated by a standard reaction.** Pack Hunter, Reckless Gambit, Anticipate, Guiding Oration, Through the Fray, Investiture of Command's clause, Final Decree's clause, Bonds of Community's clause, Exploit Weakness.

---

## 4. Advantage exposure by tree

"Producers" = talents that grant an advantage. "Pure" = removing the advantage clause leaves nothing of mechanical substance. "Paid" = costs a resource or ≥1 Action for the advantage itself.

| Tree | Producers | % of tree | Pure | Paid | Also touches Gain Advantage action | Total exposure |
|---|---|---|---|---|---|---|
| **deity/Power** | 3/9 | **33%** | 0 | 1 (Investiture of Command) | 0 | 33% |
| **deity/Order** | 2/9 | 22% | 0 | 1 (Final Decree) | 0 | 22% |
| **leyline/Green** | 5/25 | **20%** | 2 | 1 (Pack Hunter, 1 Inv) | 0 | 20% (+ Natural Order = 24%) |
| **heroic/Hunter** | 4/25 | 16% | 1 | 1 (Shadowing) | 1 | **20%** |
| **heroic/Warrior** | 4/25 | 16% | 0 | 1 (Meteoric Leap) | 2 | 20% |
| **heroic/Agent** | 3/25 | 12% | 0 | 2 | 3 | **24%** |
| **leyline/Blue** | 4/25 | 16% | 2 | 2 | 0 | 16% |
| **leyline/Red** | 4/25 | 16% | 3 | 1 | 0 | 16% |
| **heroic/Scholar** | 1/25 | 4% | 0 | 0 | 2 | 12% |
| **heroic/Envoy** | 2/25 | 8% | 1 | 0 | 2 | 12% |
| **deity/Civilization** | 1/9 | 11% | 0 | 0 | 0 | 11% |
| **leyline/Black** | 2/25 | 8% | 1 | 1 | 0 | 8% |
| **heroic/Leader** | 1/25 | 4% | 0 | 0 | 1 | 8% |
| **deity/Fate** | 0/9 | 0% | — | — | — | 11% (denier) |
| **leyline/White, deity/Chaos, Death, Destruction, Knowledge, Life, Sovereignty** | 0 | **0%** | — | — | — | **0%** |

### Who loses the most when advantage is valued at its true worth

**1. leyline/Green.** Five producers — the most of any leyline tree — and they are *anti-synergistic with each other*, which the Green profile already flags. Concretely: **Scent the Weak** (free, ★) gives advantage on your first test each round against the lowest-HP enemy, which in a focus-fire party *is* the enemy you are attacking. **Pack Hunter** costs **1 Investiture** — in a tree with **zero Investiture regeneration and thirteen Investiture costers** — to give you and one ally advantage on one attack against a target you are both adjacent to, i.e. the target you were already focusing. Once Scent the Weak is owned at L3, Pack Hunter's self-half is dead and its ally-half is worse than that ally's own Aid. **Apex Predator** (L6) grants advantage on *all* Physical tests while 3+ enemies stand in your terrain — which subsumes Pack Hunter and Scent the Weak entirely. And **Primal Awareness** and **Predator's Instinct** both grant advantage on tracking tests; Predator's Instinct's tracking clause is a strict subset of Primal Awareness's in most scenes, and its real value is the free fear-sense.
 *Green's five advantage talents deliver, in a combat round, about the output of one Aid.*

**2. deity/Power (33%, highest share in the game).** **Investiture of Command** spends 2 of 3 Actions on a Slow turn, 2 Investiture (in a tree with **0 regen / 9 costers**), and takes unreducible spirit damage equal to your tier, to give three allies temp HP plus one advantage each. Those three allies could each have Aided someone for 1 focus with a Reaction they were not otherwise spending. Half the talent's payload is worth zero if any of them already has advantage — and **Kneel**, this tree's own depth-0 entry, gives *you* advantage on attacks against any Compelled/Frightened/Weakened character permanently and for free.

**3. leyline/Red.** Red is the only tree whose **Attunement Key charges a price for its advantage**: "gain an advantage on your next Physical test. **Lose your Reaction until the start of your next turn.**" Every other Key is a pure gain (White heals the party, Black Weakens enemies, Green makes terrain, Blue grants advantage free). In any party that already has a live advantage source, **Red's Key is a strict penalty on Draw Mana** — you surrender the round's Reaction and receive nothing. Then **Reckless Gambit** (depth 3/L6): Opportunity + 1 Investiture to grant an ally advantage on one test **and make them Exhausted[−2]**. If that ally already has advantage, you have paid Red's most expensive cost line to inflict a cumulative penalty on a teammate. That is the only *net-negative* advantage talent in the corpus.

**4. leyline/Blue** — and this bears directly on the designer's stated worry. Blue's four producers are two free-but-narrow passives (Key: Cognitive only; Calculated Patience: first test on a Slow turn) and two paid ones. **Anticipate** (depth 3, **L6**) costs a Reaction *and* 1 Investiture to give one ally advantage on one influence-resistance test — that is Aid plus an Investiture, at level six, for a narrower trigger. It is dominated by a standard reaction every character already has. (The Blue profile independently ranks Anticipate bottom-3; the economics say the same thing for a different reason.)

**5. heroic/Hunter — the clearest in-tree self-redundancy in the corpus.** **Seek Quarry** (depth 0, **level 1**, free Special) already grants advantage on tests to *find, attack and study* the quarry, permanently. Therefore:
   - **Exploit Weakness** (Free Action, depth 2/L3) — "Gain Advantage on your quarry without spending an action" — is **dead on arrival against its own tree's entry talent.**
   - **Fatal Thrust**'s "gain two advantages if the weapon is Discreet" is worth **zero** in the tree's own intended line, because the target of Fatal Thrust is normally your quarry and Seek Quarry has already supplied the one advantage the engine can hold.

**Trees that lose nothing:** White, Chaos, Death, Destruction, Knowledge, Life, Sovereignty. Several are *better off*, because they buff through channels that stack: Order's Covenant (+1 to all defenses), Civilization's Lay Foundation (+1 to all defenses), Fate's Ordained Ground (+1 to all defenses), Power's Mantle (+1 to all tests for every ally), Leader's command die (d4→d10, added to the roll), Knowledge's Pack Share (+Tier bonus Vital for every ally), Sovereignty's die-size steps, White's raise-the-stakes and Terms of Accord (+1). **The numeric channel is the well-designed half of this game's buff economy and the binary channel is the crowded half.**

---

## 5. How many independent sources are live in a round, and what the second is worth

Two answers, because the collision unit is a **roll**, not a round.

**Baseline supply, before any talent.** A 4-PC party holds 4 Reactions, so it can produce up to **4 advantage instances per round via Aid** at 1 focus each, plus one per Action anybody spends on Gain Advantage. There is no talent-free party that lacks advantage.

**With talents.** Take a plausible party of the shape the review describes (a White PC and a Blue PC among them), each PC holding one leyline + one heroic path, at L2–L3: White+Envoy, Blue+Scholar, Red+Warrior, Green+Hunter.

For **one attack roll** by the Red/Warrior PC against the focused enemy, the live sources are:
1. Red Leyline Attunement (if that PC Drew Mana this turn) — next Physical test.
2. Green/Pack Hunter (1 Investiture, if the Green PC is adjacent to the same enemy).
3. Any of the other three PCs' **Aid** (1 focus, their Reaction).
4. Envoy/Guiding Oration, if the Envoy spent an Action on Gain Advantage.
5. Scholar/Strategize, transferring an advantage the Scholar earned.

That is **five independent routes to one boolean**. The first is worth ~+3.3 average / up to +25pp. **The second through fifth are worth exactly 0.00.**

Widen the frame and the picture stays: across the whole party in one round there are perhaps 4–8 attack rolls, and a party like this can generate 8+ independent advantage instances, of which at most one per roll ever registers. **The binding constraint is rolls, not sources — and the game supplies roughly twice as many sources as there are rolls to spend them on.**

Add one deity/Order character and it collapses further: **Lawkeeper's Eye** is free, passive, costs no action to place or maintain, and gives **the whole party advantage on every attack test against the Edict-bound target for as long as the Edict holds**. Against that one talent, the following become dead weight for the duration:

### Dead-weight list — talents that go to zero when a party already has a granter

| Talent | Cost paid for nothing |
|---|---|
| **leyline/Red — Reckless Gambit** | Opportunity + 1 Investiture, **and the recipient becomes Exhausted[−2]**. Net negative: you pay to debuff a teammate. |
| **leyline/Green — Pack Hunter** | 1 Investiture in a tree with 0 regen / 13 costers, for one attack roll. |
| **deity/Power — Investiture of Command** | 2 Actions + 2 Investiture + unreducible self spirit damage; half the payload (the advantage) is void, leaving [Tier][Die] temp HP ×3 that itself does not stack (§8). |
| **deity/Order — Final Decree** (Witness advantage clause) | 3 Actions + 3 Investiture, once per scene — redundant against **its own tree's** Lawkeeper's Eye. |
| **heroic/Hunter — Exploit Weakness** | Dead against Seek Quarry (same tree, depth 0, level 1). |
| **heroic/Hunter — Fatal Thrust** (Discreet clause) | Dead against Seek Quarry in the tree's own intended line. |
| **heroic/Envoy — Guiding Oration** | Requires you to spend a whole **Action** on Gain Advantage first; delivers one ally-advantage. Strictly worse than that ally spending a **Reaction** on Aid. |
| **heroic/Leader — Through the Fray** | 1 Action so an ally may Gain Advantage **as a reaction** — i.e. you spend your Action so they can do, with a skill test against the enemy's defence, what Aid lets any ally do with the same reaction and no test. |
| **leyline/Blue — Anticipate** | Reaction + 1 Investiture at L6 for a narrower Aid. |
| **deity/Civilization — Bonds of Community** (advantage clause) | Rare trigger (a character drops to 0 HP inside your Foundation), one attack roll. |
| **heroic/Envoy + heroic/Leader — Well Dressed** | Verbatim duplicate in two trees. Two PCs who both take it get **one** advantage between them per social scene. |
| **leyline/Red — Red Leyline Attunement** | Not dead but **net negative**: you lose your Reaction (and therefore Aid, Dodge, Reactive Strike) to gain an advantage someone else already supplied. |

---

## 6. Text the binary implementation cannot deliver

I searched all 365 for `two advantages`, `two disadvantages`, `additional advantage`, `another advantage`, `second advantage`, `advantage twice`, `stack`, `cannot benefit from advantage`, `already ha(s|ve) advantage`. Complete results:

1. **heroic/Hunter — Fatal Thrust** (2 Actions, free, depth 1/L2): *"Attack an unsuspecting target with a light melee weapon vs. Cognitive. Add 4d4 damage, and **gain two advantages** if the weapon is Discreet."* → delivers one. And, as shown above, usually **zero**, because the tree's own Seek Quarry has already set the flag.

2. **heroic/Warrior — Defensive Position** (Passive, depth 1/L2): *"The Brace action adds **two disadvantages** to attacks against you, **instead of one**, and allies can Brace behind your shield."* → **This is the worse of the two.** Canon Brace (`cosmere-canon-reference` §Brace, SR p.32) already grants attacks against you disadvantage, for free, as a standard action. Defensive Position's *entire* upgrade over the free action is the second disadvantage, and the engine folds it away. In Foundry the talent's only live clause is "allies can Brace behind your shield". A whole talent slot at depth 1 delivers one shared-cover rider. (The Warrior profile independently lists Defensive Position among its weak talents; this is why.)

3. **deity/Sovereignty — Sovereign's Favor**: *"This talent's temporary HP does not stack."* — the only card in 365 that states a stacking rule. Correct, and correctly written; see §8 for why it is also an indictment of the other thirteen.

4. **deity/Life — Overgrowth**: *"+1 Deflect until end of scene, **stacks to 3**"* — this one is fine. Deflect is a numeric stat, not the binary flag, and the talent bounds it explicitly. It is the model for how a stacking effect should be written.

5. **Near-miss worth recording as correct practice — leyline/Blue — Probability Cascade**: *"give a creature … disadvantage on its **next two tests**."* This is the *right* way to write a "bigger" disadvantage under a binary implementation: two separate rolls, each getting one step. It should be the template for any future "double" language.

6. **Redundant-by-construction phrasing — heroic/Hunter — Shadowing**: *"Your quarry gains a **disadvantage** to sense you, and you gain an **advantage** to avoid their notice."* These two clauses describe the two sides of the same opposed test. Whichever side the table rolls, one step applies; the other clause is decorative. Not broken, but it reads as two effects and is one.

---

## 7. Design, implementation, or documentation? — the argument

**It is all three, and the order matters, because the order determines what a ruling has to fix first.**

### It is an IMPLEMENTATION problem first, and this is not a close call.
The printed rules **count**. `cosmere-canon-reference` §advantage/disadvantage: *"Cancel each other 1-for-1. [SR p.18]"* — "1-for-1" is only meaningful language if more than one can exist. Two Edha talents were written by a designer reading those rules and counting (Fatal Thrust, Defensive Position). The canon **Empowered** condition ("Gain advantage on all tests") assumes a state that other grants can sit alongside. **The rules as written support a count; the shipped system 2.1.0 implements a tri-state; the Edha engine folds to match.** That is a divergence between the ruleset and the code, not a designer error.

And the fix is cheaper than it looks, because **the stacking primitive already exists in the engine**. `edha-next-test-mod` carries a `formula` field applied by term concatenation, and item 49 made those **SUM** — `15-blue-calculation.js:260`: *"they SUM, so every matching entry appends its own term."* It is currently used by exactly one adversary ability (`Probability Net`, −1d6) and by **no talent**. A designer who wants a second advantage to mean something does not need new engine architecture; they need to route the second grant through the summing channel instead of the boolean one.

### It is a DESIGN problem second, and this is the deeper one.
Even with perfect stacking, **13 of 21 trees were handed the same lever** and 7 were handed none — and the 7 without are not weaker for it. The design guides do not assign advantage as anybody's key mechanic: the leyline guide gives Blue "Plot Die manipulation", White "Plot Die integration", Green "clusters", Black "isolates", Red "escalates momentum". **Nobody was told to own advantage, so everybody got a little.** That is the classic shape of an unowned mechanic. The trees that ended up strongest in the buff role — Leader (command die), White (raise-the-stakes and +1), Order/Civilization/Fate (+1 to all defenses), Power (+1 to all tests), Knowledge (+Tier vital), Sovereignty (die steps) — all got there through channels that stack. That is not a coincidence; it is the design telling you which channel works.

### It is a DOCUMENTATION problem third, and cheaply fixed.
Nothing on any card says advantage does not stack. `SYSTEM-PRIMER.md` records it and the engine header records it (`49-order.js:154`), but the player-facing text does not, so a player who takes Pack Hunter *and* Scent the Weak, or Seek Quarry *and* Exploit Weakness, has bought the same boolean twice with no warning. The one card in the corpus that does warn — Sovereign's Favor — proves the fix is a single sentence.

### What a ruling would have to decide

**R-α — Does advantage stack? Three exits, and the choice cascades.**
 - **(i) Keep binary (RAI = the shipped behaviour).** Then Fatal Thrust and Defensive Position must be **rewritten** (Fatal Thrust: convert the Discreet clause to something else — extra dice, an injury-roll penalty, ignore Deflect; Defensive Position: convert the second disadvantage to a numeric +2 Deflect or "attackers cannot benefit from advantage against you", which would make it Fate/Bulwark Ground's melee twin). And the ~10 paid single-roll grants must be re-priced.
 - **(ii) Make it count (RAW).** Real engine work, but bounded to `edhaNextModFoldMode` and the `advAttackNext` flag, which would both have to become counters. Cost: every existing advantage interaction has to be re-tested; benefit: 36 talents become additive and the crowding problem evaporates.
 - **(iii) Hybrid — cheapest, and already built.** Keep the boolean for the first advantage; route the *second* through the existing summing `formula` channel as `+1d6`. Fatal Thrust becomes "advantage, and +1d6 if Discreet"; Defensive Position becomes "Brace, and attacks against you take an additional −1d6". No new engine architecture; item 49 shipped the mechanism.

**R-β — the pricing rule, if binary stays.** Proposed default: *an advantage grant may not cost more than Aid does (1 focus + a Reaction) unless it covers more than one roll or reaches a test Aid cannot.* That single rule condemns Pack Hunter, Reckless Gambit, Anticipate, Guiding Oration, Through the Fray, Investiture of Command's clause and Final Decree's clause, and it validates Lawkeeper's Eye, Seek Quarry, Kneel and Scent the Weak.

**R-γ — Does the Red Attunement Key keep its Reaction cost?** It is the only Key that charges, and it charges for the game's most duplicated benefit. Recommended default: keep the cost but widen the benefit (e.g. also grants the advantage to an ally within Attunement Range), or drop the Reaction cost.

**R-δ — Is Exploit Weakness replaceable?** It is dead against Seek Quarry at every level. Recommended default: replace, not re-price.

**R-ε — Do Envoy and Leader both keep Well Dressed?** A verbatim duplicate whose payload is a boolean is the worst case for duplication.

**R-ζ — Does Blue keep both directions of the binary?** Blue's Key produces advantage while Blue's five-talent identity imposes disadvantage. See §8.

---

## 8. The three other lopsided currencies

### DISADVANTAGE — 15 producers (not 14), 0 consumers. The zero is not the problem.

Full list, verified from the text: leyline/White **Voice of Authority**; leyline/Blue **Intercept**, **Absolute Stillness**, **Pattern Recognition**, **False Premise**, **Probability Cascade**; leyline/Black **Coercive Pressure**; leyline/Red **Emotional Overload**; heroic/Envoy **Steadfast Challenge**; heroic/Hunter **Shadowing**; heroic/Leader **Valiant Intervention**, **Tactical Ploy**; heroic/Scholar **Keen Insight**; heroic/Warrior **Precise Parry**, **Defensive Position**.

**"0 consumers" is a malformed complaint.** Disadvantage is a terminal state, not a resource: nothing *should* consume it, any more than something should consume "Prone". The census's verdict "PRODUCED, NEVER CONSUMED" measures a category error.

**The real problem is the same binary collision, and it lands hardest on the one tree that made disadvantage its identity.** Four of Blue's five disadvantage talents target *"their next test"* — Pattern Recognition ("their next test this round"), False Premise ("their next test"), Intercept ("that action"), Probability Cascade ("its next two tests"). Any two of them fired at the same enemy in the same round produce **one net step**. Blue therefore pays five talent slots and (for Pattern Recognition, False Premise, Intercept and Probability Cascade) **four Investiture plus an Opportunity** to buy something whose ceiling per enemy per round is a single boolean.

Quantified: Blue's five-talent disadvantage block delivers, against one enemy in one round, the same mechanical output as **one** of them. The claim that Blue "wins by imposing disadvantage" overstates the block by roughly **5:1**. Probability Cascade is the exception and the model — its two steps land on two *different* tests, so both register.

Second-order finding: **advantage and disadvantage cancel**, and the party produces 36 advantages while enemies produce the incoming disadvantage. Blue is the only tree standing on both sides of the same scalar — its own Attunement Key grants advantage while its identity imposes disadvantage. Not a bug (different targets), but it means Blue's identity is built on the most contested boolean in the game from both directions.

**If any single tree should get the summing `formula` channel first, it is Blue.** A "−1d6 on their next test, and these stack" version of Pattern Recognition / False Premise / Probability Cascade would make Blue's five-talent block additive, would use a primitive that already ships, and would give Blue a mechanical identity nothing else in the game has.

### PLOT DIE — the census verdict is an artifact of a narrow regex, and Blue does not own it

The inline census says *"Plot Die 3 talents / 2 trees (leyline/Red and heroic/Agent ONLY)"* and `resource-economy.json` says 9 producers / 6 consumers. Both undercount, because **"raise the stakes" *is* the plot-die trigger**. Searching for `plot die|raise the stakes` returns **10 talents across 5 trees**:

| Tree | Talents | What they do |
|---|---|---|
| **heroic/Agent — 6** | Opportunist, Watchful Eye, Get 'Em Talking, Subtle Takedown, Risky Behavior, Cheap Shot | Rerolls (the corpus's **only** ones — Opportunist, Watchful Eye on an ally, and Double Down's follow-up), plus four raise-the-stakes sources |
| **leyline/White — 4** | Concordant Presence, Guiding Signal, Unity of Purpose, **Pillar of Order** | Three grant raise-the-stakes to allies; **Pillar of Order is the only face-EDIT in all 365** — "change a Complication to a blank face" |
| **leyline/Red — 1** | Reckless Momentum | Spend Opportunity to roll the Plot Die on your next test |
| **heroic/Leader — 1** | Cutthroat Tactics | Ally raises the stakes instead of rolling the command die |
| **heroic/Scholar — 1** | Overcharge | Raise the stakes on a fabrial attack |
| **leyline/Blue** | **0** | — |

And the plot die's *output* is Opportunity, which has **9 producers and 17 consumers across 9 trees** (`resource-economy.json`). **So the plot-die economy is the healthiest currency in the game, not the sickest** — the chain raise-the-stakes → plot die → Opportunity → 17 spenders is the one closed loop that spans all three atlases. The census verdict "OVER-PRODUCED" is measuring the wrong link.

**But the ownership claim fails outright.** `DESIGN-GUIDE-CLAIMS.md` line 89: *"**Key mechanic**: Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression."* **Blue has zero of 25.** Meanwhile:
- The guide's *own* line 82 assigns the same mechanic to White: *"**Key mechanic**: Plot Die integration. White rewards coordinated group action."* White built four talents for it. **The two intent sources give the same key mechanic to two different colours, and the one that was told it was a "capstone identity" built none of it.**
- The literal effect the guide reserves for Blue — editing a rolled face — exists exactly once in the corpus, and it is **White's Pillar of Order**.
- The *manipulation* fantasy (reroll the plot die, reroll an ally's plot die, upgrade a Complication to an Opportunity) is built out in full by **heroic/Agent**, a path any Blue character can also take.

This bears directly on the designer's question 4 and on the Blue/Scholar worry. Blue's guide-stated identity was never built; what remains of Blue is a disadvantage block worth ~1/5 of its talent count (above) plus foreknowledge and illusion. **That is why Blue reads thin — not because it lacks damage.** The cheapest high-value repair to Blue is the capstone the design guide already promised: a Blue plot-die line that *chooses* faces, which would be unique in the leyline atlas (White *adds* plot dice; Blue would *edit* results) and would not collide with anything, because face-choice is a numeric/state manipulation, not a boolean.

### TEMPORARY HP — 14 producers, 0 consumers. **Not a problem, and the engine already ruled on it — but 13 of 14 cards are silent.**

"0 consumers" is again a category error: temp HP is spent by being hit. The engine implements it as a pool consumed in `preApplyDamage` before Deflect and before real HP (`28-temporary-hp.js`).

**The finding that matters is stacking, and it is already decided in code and undocumented on the cards.** `28-temporary-hp.js:6`: *"the pool does not stack, a larger grant replaces a smaller one."* `33-triggered-effect-resolution.js:211`: *"edhaGrantTempHpCross, NOT edhaWriteTempHp — Temp HP does not stack, it **KEEPS THE HIGHER**."*

Of the 14 talents that grant temp HP, **exactly one says so**: deity/Sovereignty's **Sovereign's Favor** ("This talent's temporary HP does not stack"). The other thirteen are silent about a rule that materially changes what they are:

| Talent | Grant | Cadence | What silence costs |
|---|---|---|---|
| deity/Order — **Bear Witness** | ranks in White (1–3) | **start of each round**, every Covenant ally | Reads as a scene-long ratchet; is actually a permanent floor of 1–3 |
| deity/Fate — **Bulwark Ground** | your tier (1–2) | **start of each round**, any ally on Ordained Ground | Same |
| deity/Order — Shoulder the Oath | ranks in White | per damage event | Cannot combine with Bear Witness — the higher wins |
| deity/Order — Final Decree | [Tier][Die] | once per scene | Overwrites Bear Witness's 1–3 with 1d6–2d8, then nothing accumulates |
| deity/Power — Investiture of Command | [Tier][Die] ×3 allies | once | Does not add to anything already on them |
| deity/Civilization — Bonds of Community | your White | per trigger | Same |
| deity/Death — Death Ward, deity/Life — Life Surge & Overgrowth (overflow), deity/Power — Warlord's Advance, deity/Sovereignty — Edict of the Fallen, leyline/Black — Spoils of Isolation, leyline/Green — Vital Surge | varies | — | Same |

The engine's own comment records that this has already bitten at the table: `04-black-ritual.js:359` — *"`tempHp` joined 07-27d (bench run 6: Bulwark {2}, Edict {2}, Favor {15} rode through THREE [scenes])"* — three temp-HP pools persisted across scene boundaries until the sweep was added.

**Two real observations beyond the documentation gap:**
- **Distribution is deity-only in practice.** 11 of the 14 are deity (Order 3, Power 2, Life 2, Sovereignty 2, Civilization 1, Death 1, Fate 1); leyline has 2 (Black's Spoils of Isolation, Green's Vital Surge); **heroic has zero**. Temp HP is a deity-atlas mitigation channel. That is defensible design, but it means the heroic atlas's only durability lever is Hardy's max-HP raise (shared verbatim across seven trees) and the leyline atlas's is White's damage reduction.
- **Magnitudes are bimodal and the small half barely registers.** The "ranks in White" / "your tier" grants are 1–3 points against a starting pool of 10+STR — under 15% of a health bar, and because they keep-the-higher rather than accumulate, a round-by-round grant of 2 is a *flat* 2, not 2 per round. The [Tier][Die] grants (1d6 → 2d8, avg 3.5 → 9) are meaningful. **Bear Witness and Bulwark Ground are the two most affected: both read as per-round engines and are, under the implemented rule, a one-time floor.**

**Recommended default ruling (temp HP):** adopt the engine's behaviour as canon (keeps-higher, never stacks) and add the Sovereign's Favor sentence to the other thirteen cards — or, if per-round accumulation was the intent for Bear Witness and Bulwark Ground, say so explicitly on those two and give them a cap, because those two are the only talents whose *cadence* implies accumulation.

---

## 9. What I could not settle inside the fence, and what would settle it

- **How often a party actually has an advantage source live.** I modelled it from talent costs and the standard-action list. Confirming the *frequency* would need adversary statblocks (how many enemies impose disadvantage, cancelling the party's advantage) — explicitly out of scope. What would settle it: a bench run recording, over five combats, how many attack rolls resolved with `advantageMode === "advantage"` and how many distinct sources had written to `advAttackNext` on each.
- **Whether Warrior's stances are mutually exclusive.** No talent text says so; the Warrior profile calls it inferred. It does not change the advantage arithmetic (Flamestance/Ironstance/Windstance grant advantage on three *different* skills — Intimidation, Insight, Agility — so they never collide with each other), but it changes whether the tree sells three advantages and delivers one. **A ruling, not a measurement.**
- **Whether the printed SR rules intend advantages to count.** "Cancel each other 1-for-1" strongly implies yes, and two Edha talents were written assuming yes. Confirming would need the SR text beyond what `cosmere-canon-reference` quotes. This is the load-bearing question behind R-α and it is worth resolving before re-pricing anything.

## Adversarial verification

**19 load-bearing claims checked: 5 confirmed, 9 corrected, 5 refuted.**

The ledger arithmetic is sound and the classifier-bug section is the best work in the piece — every one of its five diffs against resource-economy.json checks out exactly, and the disadvantage miss (Defensive Position) is confirmed. But its three headline consequences are all damaged. (1) The claim that Defensive Position's first clause "is a no-op in Foundry" because "the engine folds it away" is refuted at the source: Defensive Position and Fatal Thrust are both UNWIRED (hasEvents=false, eventCount=0) — no engine code touches either, so no engine folds anything; it is a table ruling, not an implementation behaviour. (2) Lawkeeper's Eye is not "unlimited": its enabler Edict costs 1 Action + 1 Investiture per placement, is capped at tier concurrent Edicts, is consumed on the first violation, needs line of sight, and covers only ATTACK tests against that one target — so it cannot zero out the social/stealth/Cognitive grants in the dead-weight table, and "nine" is unsupported. (3) The plot-die count is wrong by roughly half: the analysis's own regex misses "raises", its own table lists 13 rows against a stated 10, the true union is 13/6 trees, and resource-economy.json's plot_die row alone carries 15 distinct talents and already grades the currency "balanced-ish" — so the analysis argued against a verdict its own JSON does not contain. Its exclusivity claim that Pillar of Order is the only plot-die face-edit is refuted by Agent's Sure Outcome ("any Complication to Opportunity"), which its own supplied profile digest names as Agent's best talent. On the central conclusion, the opposite case is stronger on the count: only about 15 of the 36 producers can land on an attack roll; the other ~21 sit on distinct skills (Intimidation/Insight/Agility/Deception/Perception/Erudition/social) that never collide, and the acute redundancy is intra-character in three specific pairings (Green+Hunter, Order, Power), not ecosystem-wide. The analysis's conclusion survives the restatement, but ~2.5x over-counted. Best new finding it missed: the engine has TWO temp-HP writers with OPPOSITE behaviour — edhaGrantTempHpCross keeps the higher, edhaWriteTempHp's own chat flavor says "replacing any previous" and its header says "OVERWRITES the old, even if smaller" — so there is no single "engine behaviour" to canonise, and Life's Overgrowth/Life Surge overflow and Black's Spoils of Isolation ride the overwriting path, where a smaller grant deletes a larger pool.

### Claims

1. **CONFIRMED** — The advantage ledger is exactly 48 talents across 14 trees, and reclassifies to 36 PRODUCERS / 2 CONSUMERS / 2 DENIERS / 11 ACTION-RIDERS with 3 talents in two categories.
   - Evidence: Re-derived from all-talents.json by masking 'disadvantage' then matching 'advantage': 48 hits across 14 trees, per-tree counts identical to advantage-ledger.md (Green 6, Agent 6, Red 5, Hunter 5, Warrior 5, Blue 4, Envoy 3, Scholar 3, Power 3, Black 2, Leader 2, Order 2, Civilization 1, Fate 1). The producer list sums to 36 across 13 trees; 36+2+2+11-3 = 48. Action-riders are all six heroic trees; no leyline or deity talent touches the Gain Advantage action.
2. **CONFIRMED** — resource-economy.js has a third classifier bug — it misses Civilization/Bonds of Community and Blue/Anticipate as producers, double-counts Fate/Bulwark Ground in both columns, types Green/Natural Order as a consumer, and folds Envoy's Practical Demonstration and Guiding Oration and Scholar's Keen Insight into consumers. And the disadvantage census reports 14 where the text gives 15, missing Warrior/Defensive Position.
   - Evidence: resource-economy.json 'advantage' row: producers 45 / 13 trees, consumers 7 / 5 trees. Its prod map has Blue at 3 (no Anticipate) and no deity/Civilization key at all; Bulwark Ground appears in BOTH prod and cons; cons = [Emotional Overload, Natural Order, Practical Demonstration, Guiding Oration, Strategize, Keen Insight, Bulwark Ground]. Its 'disadvantage' row lists exactly 14 names and Defensive Position is absent, while a text scan returns 15. Every diff in the analysis's §2 table is correct.
3. **REFUTED** — heroic/Warrior Defensive Position is literally unimplementable: 'the engine folds it away', and 'in Foundry the talent's only live clause is allies can Brace behind your shield'.
   - Evidence: all-talents.json: Defensive Position hasEvents=false, eventCount=0, hasEffects=false, effectCount=0. Fatal Thrust likewise (hasEvents=false, eventCount=0). Neither talent is wired at all, so no engine path — advantageMode, edhaNextModFoldMode, or otherwise — ever sees them. The card text is adjudicated by the GM at the table. Separately, the analysis omits that canon Brace REQUIRES cover ('hide behind cover within 5 ft to grant attacks against you disadvantage... Some effects (Defensive trait, Prone condition, certain talents) allow Brace without cover' — cosmere-canon-reference §Brace, SR p.32), which makes the surviving clause a canon Brace-without-cover enabler for allies, not the throwaway rider the analysis calls it.
   - Corrected: Two cards (Fatal Thrust, Defensive Position) are written to a counting model the shipped dice code cannot express. Both are UNWIRED, so nothing in the engine folds anything — whether the second step does anything is a table ruling, not implementation behaviour. Defensive Position's surviving clause is substantive: it grants allies the canon Brace-without-cover allowance.
4. **CORRECTED** — The single best advantage talent in the game is free, passive, level 2, party-wide and unlimited — deity/Order Lawkeeper's Eye — and it zeroes out nine paid advantage talents in other trees.
   - Evidence: Lawkeeper's Eye (Passive, no cost, depth 1, L2) reads: 'While you can see a character bound by one of your Edicts, you and your allies have advantage on attack tests against that character.' Its prerequisite Edict is 1 Action + 1 Investiture per placement, 'You may sustain up to your [tier]' active Edicts, and the Edict is CONSUMED the first time the bound character takes the prohibited action. deity/Order has 0 Investiture regen against 6 costers. The advantage covers only ATTACK tests against one visible bound target, so it cannot touch Well Dressed (social), Anticipate (influence-resistance), Shadowing (stealth), Sleuth's Instincts (Cognitive) or Frenzied Tempo (Influence) — five of the twelve rows in the dead-weight table. The 'nine' is not derivable from the table, which lists twelve.
   - Corrected: Lawkeeper's Eye is the best-priced advantage grant in the corpus — free, passive, party-wide — but it is not unlimited: it requires a live Edict (1 Action + 1 Investiture, capped at tier, consumed on violation), line of sight, and it covers only attack tests against that one target. It genuinely dominates Final Decree's Witness clause, Bonds of Community, Investiture of Command, Pack Hunter and Fatal Thrust's Discreet clause — five, not nine — and touches none of the non-attack grants.
5. **REFUTED** — Pack Hunter, Investiture of Command, Guiding Oration and Through the Fray are 'dominated by a standard reaction' (Aid) and are dead weight.
   - Evidence: Pack Hunter is a Special (no Action) costing 1 Investiture and grants advantage to TWO characters — 'You both gain an advantage on your next attack test against it.' Replicating it with Aid costs 2 focus AND 2 Reactions from two other characters. The analysis's own pricing rule credits 'rolls covered beyond one', so its own rule acquits Pack Hunter. Investiture of Command grants advantage + [Tier][Die] temp HP to up to 3 allies; Aid grants an ally an advantage, so a character cannot Aid themselves — the claim that 'those three allies could each have Aided someone' is backwards, and replicating it needs three OTHER characters' Reactions plus focus, impossible in a 4-PC roster. Guiding Oration is a Passive with no cost that rides on a Gain Advantage action taken for your own benefit; charging the whole Action to the ally-rider mis-costs it. Through the Fray offers Disengage OR Gain Advantage and costs the recipient no focus, so it is a different trade, not 'strictly worse'.
   - Corrected: Of the paid single-roll grants, the ones genuinely dominated by Aid are Anticipate (Reaction + 1 Investiture at L6 for one narrower roll), Reckless Gambit (Opportunity + 1 Investiture AND the recipient becomes Exhausted[-2]) and Final Decree's Witness clause. Pack Hunter and Investiture of Command are multi-target and Aid cannot replicate them; Guiding Oration and Through the Fray are free riders or different trades.
6. **REFUTED** — Envoy and Leader's Well Dressed is a verbatim duplicate, and 'two PCs who both take it get one advantage between them per social scene'.
   - Evidence: The texts differ: Envoy reads 'Gain Fashion expertise...', Leader reads 'Gain a Fashion expertise...'. More importantly, advantage is a per-character, per-roll state; each PC gains an advantage on their OWN first Deception/Leadership/Persuasion test. Two PCs holding it get two advantages on two different rolls. The claim treats advantage as a party-level pool, which is the exact error the analysis's own §5 warns against ('the collision unit is a roll, not a round').
   - Corrected: Well Dressed is a near-duplicate (one article differs) shipped in two trees. Two PCs who both take it each get their own advantage on their own first social test — the duplication is a design-economy complaint about repeated talent slots, not a mechanical collision.
7. **REFUTED** — Searching all 365 for `plot die|raise the stakes` returns 10 talents across 5 trees, and resource-economy.json's 9-producers/6-consumers also undercounts.
   - Evidence: The stated regex misses the inflected form: White's Concordant Presence and Guiding Signal both read 'raises the stakes', and Agent's Subtle Takedown and Cheap Shot read 'raising the stakes'. The correct union `plot die|rais\w* the stakes` returns 13 talents across 6 trees (Agent 6, White 3, Red 1, Leader 1, Scholar 1, Fate 1). The analysis's own table lists 13 rows (Agent 6 + White 4 + Red 1 + Leader 1 + Scholar 1) against its stated 10 — an internal contradiction. And resource-economy.json's plot_die row already carries White's three raise-the-stakes talents plus Fate, Leader, Scholar and five Agent talents: 15 distinct names across 6 trees, graded 'balanced-ish'. Adding the four the script misses (Pillar of Order, Watchful Eye, Subtle Takedown, Cheap Shot) gives 19 talents / 6 trees.
   - Corrected: The plot-die footprint is 19 talents across 6 trees (Agent 8, White 4, Scholar 4, Red 1, Leader 1, Fate 1). resource-economy.json already grades it 'balanced-ish' and already counts White's three — only the brief's narrow inline keyword count (3 talents / 2 trees) and its OVER-PRODUCED verdict undercount. Blue still has zero on every measure.
8. **REFUTED** — Pillar of Order is the only face-EDIT in all 365; 'the literal effect the guide reserves for Blue — editing a rolled face — exists exactly once in the corpus'.
   - Evidence: heroic/Agent Sure Outcome: 'When you use Opportunist, spend 2 focus to change Opportunity to Complication 4, or any Complication to Opportunity.' That is a strictly larger face edit than changing a Complication to a blank. heroic/Scholar Contingency: 'Spend 2 focus to remove Complication from the test of an ally within 20 ft.' The analysis's own supplied profile digest lists Sure Outcome as heroic/Agent's single best talent ('Converts any Complication to an Opportunity'), so the exclusivity claim contradicts its own source.
   - Corrected: Face editing exists in three trees: Agent's Sure Outcome (Complication to Opportunity, or the reverse) is the strongest, White's Pillar of Order (Complication to blank) and Scholar's Contingency (remove a Complication from an ally's test). Blue has none of it, which is the point the analysis wanted — the guide's promised Blue capstone is built out by heroic/Agent, not by White alone.
9. **CORRECTED** — Temporary HP: the engine already ruled — 'keeps-higher, never stacks' — and the recommended default is to adopt that behaviour as canon and add the Sovereign's Favor sentence to the other thirteen cards.
   - Evidence: Two writers with OPPOSITE behaviour ship in the same engine. 51-green-restoration.js:93 edhaGrantTempHpCross keeps the higher ('A TIE is not a win: the incumbent grant keeps both its value and its name'). But 28-temporary-hp.js:12 states the house rule as 'only ONE source of Temp HP at a time (a new grant OVERWRITES the old, even if smaller)', edhaWriteTempHp (28:31) writes unconditionally, and 53-native-event-system.js:61 posts the chat flavor '...replacing any previous.' The generic single-target path is explicitly the overwriting one: 33-triggered-effect-resolution.js:237 'Every pre-07-24u mode: first target only, replace-not-keep. Unchanged on purpose.' The heal-overflow path (deity/Life Life Surge and Overgrowth, 03-where-an-effect-lives.js:882) and the total-dealt path (53:3071) also call edhaWriteTempHp. So a smaller grant can DELETE a larger pool on those routes.
   - Corrected: There is no single engine behaviour to canonise. edhaGrantTempHpCross keeps the higher (Bear Witness, Shoulder the Oath, Final Decree, Bonds of Community, Death Ward, Bulwark Ground, Investiture of Command, Warlord's Advance, the Sovereignty die-step rider); edhaWriteTempHp replaces even downward, and is what the generic single-target thp effect, the Life heal-overflow (Life Surge / Overgrowth) and the total-dealt grant use. The ruling has to pick one behaviour and unify the writers BEFORE any card text is written, or thirteen cards will document a rule the code does not uniformly obey.
10. **CORRECTED** — 11 of the 14 temp-HP talents are deity; leyline has 2; heroic has zero.
   - Evidence: A text scan returns exactly 14 temp-HP talents matching the analysis's list. By atlas: deity 12 (Order 3, Power 2, Life 2, Sovereignty 2, Civilization 1, Death 1, Fate 1), leyline 2 (Black Spoils of Isolation, Green Vital Surge), heroic 0. The analysis's own parenthetical sums to 12, not 11.
   - Corrected: 12 of the 14 are deity, 2 are leyline, 0 are heroic. The distributional point (temp HP is a deity-atlas mitigation channel) stands and is slightly stronger.
11. **CORRECTED** — Advantage is worth +3.33 average on 2d20kh, +25 percentage points at p=0.5 (the maximum), +19pp at p=0.3, +16pp at p=0.8.
   - Evidence: E[max(2d20)] = (2*2870 - 210)/400 = 13.825, so +3.325 over 10.5 — correct. The pp gain is p - p^2, maximised at p=0.5 giving +25pp — correct. At p=0.8: 0.8 - 0.64 = +16pp — correct. At p=0.3: 0.3 - 0.09 = +21pp, not +19pp.
   - Corrected: +3.33 average; +25pp at p=0.5 (the maximum), +21pp at p=0.3, +16pp at p=0.8.
12. **CORRECTED** — 'Sovereign's Favor is the only card in 365 that states a stacking rule.'
   - Evidence: A scan for 'stack' across all 365 returns exactly two cards: Sovereign's Favor ('This talent's temporary HP does not stack') and deity/Life Overgrowth ('+1 Deflect until end of scene, stacks to 3'). The analysis names Overgrowth itself four lines later as item 4.
   - Corrected: Sovereign's Favor is the only card that states a NON-stacking rule; Overgrowth is the only card that states a stacking cap. Two cards in 365 address stacking at all.
13. **CONFIRMED** — Only three talents in 365 use reroll/roll-twice/take-the-higher language, and none grants an advantage: Agent's Opportunist and Double Down, and Chaos's Shatter Focus.
   - Evidence: Regex over description + authored text returns exactly those three. Shatter Focus is implemented as `edha-reroll-react` (42-chaos.js:119, 'remove your mark from... reroll-take-lower'), i.e. a genuine second roll independent of advantageMode, so the claim that it is the one disadvantage-shaped effect that stacks with a real disadvantage holds.
14. **CONFIRMED** — deity/Fate Bulwark Ground is the only general advantage denial in the corpus; Green's Natural Order denies only one source class.
   - Evidence: A scan for 'cannot benefit / can't benefit / negate / lose an advantage' returns three hits: Bulwark Ground ('attacks against that ally cannot benefit from advantage'), Natural Order ('cannot benefit from illusions, magical concealment, or advantage gained from deception') and White's Counterpoint (negates an influence effect, not advantage).
15. **CORRECTED** — Seven trees never touch advantage (White, Chaos, Death, Destruction, Knowledge, Life, Sovereignty), four buff through the stacking numeric channel, and 'on a per-talent basis they are better designed for a party than Green's five-talent advantage block'.
   - Evidence: The seven-tree list is confirmed (21 trees minus the 14 with advantage mentions). The numeric-channel four are White (raise-the-stakes, Terms of Accord +1), Knowledge (+Tier Vital on the mark), Sovereignty (die-size steps) and Life (+Tier Vital on the Diagnosed). But the verified profiles score deity/Chaos buff 0 / healing 0 / protection 0 ('Cannot help an ally at all. Zero buffs, zero advantage granting'), deity/Destruction buff 0 / healing 0 / protection 0 ('Nothing ally-facing at all. Not one of the nine talents targets, names, or benefits an ally'), and deity/Death buff 0. Three of the seven have no ally-facing effect whatsoever.
   - Corrected: Seven trees never touch advantage. Four of them (White, Knowledge, Sovereignty, Life) buff through the stacking numeric channel and are better designed for a party than Green's five-talent block. The other three (Chaos, Death, Destruction) do not buff a party at all — they avoid the crowded channel by not competing for the role.
16. **CORRECTED** — The engine citations: edhaNextModFoldMode 'Boolean-OR per direction; both directions present cancel to null'; edhaGrantAdvAttack writes a single actor flag; 49-order.js 'Lawkeeper + Kneel advantage don't compound (advantage is binary)'; 04-black-ritual.js 'tempHp joined 07-27d (bench run 6: Bulwark {2}, Edict {2}, Favor {15} rode through THREE [scenes])'.
   - Evidence: The first three are verbatim and in the cited files. The fourth is misquoted: 04-black-ritual.js:359 reads 'rode through THREE combat deletes on three trees while AEs/ledgers/statuses/markedBy swept clean'. The bracketed '[scenes]' is the analysis's substitution, not an editorial expansion of the source's word, and the source does not say scene boundaries — it says three combat deletes.
   - Corrected: The three advantage-folding citations are verbatim. The temp-HP bench citation should read: 'Bulwark {2}, Edict {2}, Favor {15} rode through THREE combat deletes on three trees while AEs/ledgers/statuses/markedBy swept clean' — i.e. the transient survived combat deletion, which is the same substantive point without the invented word.
17. **CORRECTED** — Blue's five-talent disadvantage block delivers, against one enemy in one round, the same output as one of them — the claim that Blue 'wins by imposing disadvantage' overstates the block by roughly 5:1.
   - Evidence: Disadvantage collides per TEST, not per round — the analysis's own §5 states this ('the collision unit is a roll, not a round') and then abandons it here. Pattern Recognition ('their next test this round') and False Premise ('their next test') do collide when both aim at the same next test, but an enemy makes several tests per round and a later firing lands on a later test. Probability Cascade explicitly covers 'its next two tests' — two separate rolls, both register. Absolute Stillness is persistent ('Creatures you have reduced to 0 Speed also have disadvantage on Physical tests and cannot take Reactions'), so it is the talent that actually dominates the other four against an immobilised target, and it is excluded from the four the analysis counts.
   - Corrected: Blue's disadvantage block overlaps on the 'next test' window: Pattern Recognition and False Premise are directly redundant when fired at the same roll. Against a multi-test round the block is closer to 2:1 overstated than 5:1, and the real in-tree dominator is Absolute Stillness (persistent, all Physical tests) rather than the binary collision. The recommendation — route Blue through the summing `formula` channel — survives either figure.
18. **CONFIRMED** — The corrected producer count is 36 not 45, across 13 trees 'not 13'.
   - Evidence: 36 producers across 13 trees is correct and matches the ledger; the census's 45/13 lands on 13 by adding Fate and dropping Civilization, exactly as claimed. The prose '13 trees, not 13' is a typo, not an error of substance.
19. **CORRECTED** — The exposure table: Power 33%, Order 22%, Green 20%, Hunter 20%, Warrior 20%, Agent 24%, Blue 16%, Red 16%, Scholar 12%, Envoy 12%, Civilization 11%, Black 8%, Leader 8%, Fate 11%.
   - Evidence: All percentages recompute correctly against the ledger except leyline/Red: Red has 5 ledger entries (Red Leyline Attunement, Flashpoint, Emotional Overload, Reckless Gambit, Frenzied Tempo) = 20% total exposure, not 16%. The table counts Scholar's consumer (Strategize) and Green's denier (Natural Order) in its exposure column, so excluding Red's consumer is inconsistent.
   - Corrected: leyline/Red total exposure is 20% (5/25), not 16%. Every other row is arithmetically correct.

### What the analysis missed

- That heroic/Warrior Defensive Position and heroic/Hunter Fatal Thrust are UNWIRED (hasEvents=false, eventCount=0) — the single most load-bearing fact about its own 'unimplementable text' headline, and it asserted the opposite mechanism (that the engine folds them away).
- That the engine ships TWO temp-HP writers with opposite behaviour (edhaWriteTempHp 'replacing any previous' / 'OVERWRITES the old, even if smaller' vs edhaGrantTempHpCross 'keeps the higher'), so its recommended ruling 'adopt the engine's behaviour as canon' has no single behaviour to adopt — and Life's Overgrowth/Life Surge overflow rides the overwriting path, where a smaller grant deletes a larger pool.
- That its own supplied resource-economy.json already grades plot_die 'balanced-ish' with 9 producers across 6 trees including White's three — so its §8 rebuttal of an 'OVER-PRODUCED' verdict was aimed at the brief's narrow inline keyword table, not at the JSON, and it never says so.
- That heroic/Agent's Sure Outcome ('any Complication to Opportunity') is a larger plot-die face edit than White's Pillar of Order, refuting its own exclusivity claim — despite Sure Outcome being named as Agent's single best talent in the profile digest it was handed.
- That its own regex missed the inflected 'raises the stakes', which is why its stated count (10) contradicts its own table (13) and the true figure (19 across 6 trees).
- That advantage is per-character, so two PCs holding Well Dressed get two advantages on two different rolls — its 'one advantage between them' line applies its own 'the collision unit is a roll' principle backwards.
- That Aid cannot self-target, which breaks its Investiture-of-Command argument ('those three allies could each have Aided someone') and means multi-target grants like Pack Hunter and Investiture of Command are things Aid structurally cannot replicate.
- That Lawkeeper's Eye's enabler is not free — Edict is 1 Action + 1 Investiture per placement, capped at tier concurrent, consumed on the first violation, and the advantage requires line of sight — so 'unlimited' and 'zeroes out nine' are both unsupported.
- That deity/Chaos, Death and Destruction have zero ally-facing effects of any kind (verified profiles: buff 0, healing 0, protection 0 for Chaos and Destruction), so 'the seven trees that never touch advantage are better designed for a party' is false for three of the seven.
- That leyline/Blue's Absolute Stillness is a PERSISTENT all-Physical-tests disadvantage, which is the talent that actually dominates Blue's other four disadvantage cards against an immobilised target — a sharper in-tree finding than the 5:1 round-collision argument it made instead.

### Surviving findings, in priority order

1. TEMP HP HAS TWO CONTRADICTORY WRITERS IN THE SHIPPED ENGINE — the single highest-value item, and the analysis got it backwards. edhaGrantTempHpCross (51-green-restoration.js:93) keeps the higher; edhaWriteTempHp (28-temporary-hp.js:31) replaces unconditionally, with its own house-rule header saying 'a new grant OVERWRITES the old, even if smaller' and its own chat flavor saying 'replacing any previous' (53-native-event-system.js:61). The generic single-target path is explicitly the overwriting one (33-triggered-effect-resolution.js:237, 'first target only, replace-not-keep. Unchanged on purpose'), as are Life's heal-overflow grants (Life Surge, Overgrowth — 03-where-an-effect-lives.js:882) and the total-dealt grant (53:3071). So on those routes a SMALLER grant deletes a LARGER pool. Any ruling must unify the writers first; writing 'does not stack' onto thirteen cards would document a rule the code does not uniformly obey.
2. THE RESOURCE-ECONOMY CLASSIFIER BUGS ARE REAL AND EXACTLY AS DESCRIBED — verified line-for-line against resource-economy.json. Advantage: Bonds of Community and Anticipate missed as producers; Bulwark Ground counted in BOTH columns; Natural Order typed as a consumer when it is a denier; Envoy's Practical Demonstration and Guiding Oration and Scholar's Keen Insight typed as consumers when they ride the Gain Advantage ACTION. True figures 36 producers / 2 consumers / 2 deniers / 11 action-riders. Disadvantage: the census's 14 misses Warrior's Defensive Position — the one talent whose phrasing the implementation cannot honour. Plot die: the row misses Pillar of Order, Watchful Eye, Subtle Takedown and Cheap Shot.
3. FATAL THRUST AND DEFENSIVE POSITION ARE UNWIRED, NOT MIS-IMPLEMENTED. Both carry hasEvents=false / eventCount=0 / hasEffects=false. The 'two advantages' / 'two disadvantages' text is a rules-model divergence adjudicated by the GM, and no engine folding is involved. This changes the fix: it is a card-text ruling (R-alpha), not an engine change, and it can be made without touching any code — which makes the analysis's cheapest exit (route the second step through the existing summing `formula` channel as -1d6) require WIRING these two talents, not editing an existing handler.
4. THE CROWDING IS REAL BUT ~2.5x OVER-COUNTED, AND THE COST IS A TALENT SLOT NOT A RESOURCE. Only about 15 of the 36 producers can land on an attack roll (Pack Hunter, Scent the Weak, Apex Predator, Red Key, Reckless Gambit, Seek Quarry, Fatal Thrust, Exploit Weakness, Hunter's Edge, Meteoric Leap, Lawkeeper's Eye, Final Decree, Bonds of Community, Kneel, Investiture of Command). The other ~21 sit on distinct, non-colliding skills — Cognitive (Blue Key, Sleuth's Instincts), Perception/tracking (Primal Awareness, Predator's Instinct), Deception (Predatory Insight), Intimidation/Insight/Agility (the three Warrior stances, which the analysis itself concedes never collide), stealth (Shadowing, Shadow Step), social (both Well Dressed), influence-resistance (Anticipate), Erudition (Strategize), Deduction (Close the Case, Turning Point). Since a PC holds one leyline + one heroic path or one deity tree, the ACUTE redundancy lives in three places: Green+Hunter (Pack Hunter / Scent the Weak / Apex Predator / Seek Quarry / Exploit Weakness / Fatal Thrust all on the same attack), deity/Order (Lawkeeper's Eye vs Final Decree's Witness clause), deity/Power (Kneel's standing rider vs Investiture of Command). And a competent player who owns the free grant simply never spends the paid one — so the harm is a wasted talent slot, not a wasted Investiture, and the dead-weight table's 'cost paid for nothing' column overstates it.
5. THE PRICING RULE (R-beta) SURVIVES AND GETS STRONGER WHEN RESTATED AS A SLOT RULE, but its condemned list must be corrected. Genuinely dominated by Aid: Anticipate (Reaction + 1 Investiture at L6 for one narrower roll), Reckless Gambit (Opportunity + 1 Investiture AND the recipient takes Exhausted[-2] — the corpus's only net-negative advantage grant), Final Decree's Witness clause (3 Actions + 3 Investiture, redundant against its own tree's Lawkeeper's Eye), and Exploit Weakness (dead against Seek Quarry at depth 0/L1 in its own tree). NOT dominated, contrary to the analysis: Pack Hunter (a Special granting TWO characters advantage for 1 Investiture — two Aids cost 2 focus and 2 Reactions), Investiture of Command (three allies at once; Aid cannot self-target, so this cannot be replicated by a 4-PC party at all), Guiding Oration (a free Passive rider on a Gain Advantage you took for yourself), Through the Fray (saves the recipient's focus and offers Disengage).
6. THE PLOT-DIE OWNERSHIP FINDING SURVIVES AND IS THE MOST ACTIONABLE ANSWER TO THE DESIGNER'S BLUE WORRY — with corrected numbers. The footprint is 19 talents across 6 trees (Agent 8, White 4, Scholar 4, Red 1, Leader 1, Fate 1), not 10 across 5. Blue has zero on every measure. DESIGN-GUIDE-CLAIMS.md line 89 calls plot-die manipulation 'Blue's capstone identity' while line 82 gives 'Plot Die integration' to White; White built four, Agent built eight including the corpus's only rerolls (Opportunist, Watchful Eye, Double Down) and the largest face edit (Sure Outcome, 'any Complication to Opportunity'), and Blue built none. A Blue plot-die line that CHOOSES faces would be unique in the leyline atlas (White adds plot dice, Agent rerolls them, Blue would set them), would collide with no binary channel, and would repair Blue without adding damage — which is the specific answer the designer asked for.
7. KNEEL'S RIDER IS A FREE, PARTY-INDEPENDENT ADVANTAGE ENGINE AND THE ANALYSIS UNDERSELLS IT. Kneel's standing clause reads 'You have an advantage on attack tests against any Compelled, Frightened, or Weakened character in Attunement Range.' Per the verified Power profile no talent in the corpus produces Frightened, but leyline/Black's Attunement Key produces Weakened for free on every Draw Mana — and deity/Power gates on Black 2+, so every Power character IS a Black character. Kneel's rider therefore fires on the tree's own free refuel, with no ally, no Investiture and no action. That strengthens the analysis's own point that Investiture of Command's advantage half is void in this tree, and it never says it.
8. SCOPE LEAKS TO FLAG. §5's supply model ('a 4-PC party holds 4 Reactions... a party like this can generate 8+ independent advantage instances') is a PC-build-ladder argument: it assumes a 4-PC roster and specific path pairings (White+Envoy, Blue+Scholar, Red+Warrior, Green+Hunter), neither of which is in the 365 talents. The analysis flags the adversary half of this in §9 but not the build half. It also does not price the Aid benchmark honestly: Aid costs the aider's ONE Reaction for the round (competing with Dodge, Reactive Strike and every Reaction talent) plus 1 focus from a pool of 2+WIL, so a 4-Aid round means the party takes no other reaction all round.
9. TWO CANON DETAILS THE ANALYSIS OMITTED THAT CUT AGAINST ITS OWN ARGUMENT. (a) Canon Brace REQUIRES cover (cosmere-canon-reference §Brace, SR p.32), so Defensive Position's surviving clause — 'allies can Brace behind your shield' — is the canon Brace-without-cover allowance, a real effect rather than a consolation prize. (b) Canon Gain Advantage grants an advantage 'on your next test against that enemy using a DIFFERENT skill' (SR p.32), a restriction Aid does not carry; the analysis quotes Gain Advantage as an unrestricted free substitute and it is not.
