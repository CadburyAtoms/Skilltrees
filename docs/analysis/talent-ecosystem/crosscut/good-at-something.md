# The uniqueness ledger — is every tree good at something?

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `good-at-something`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

# THE UNIQUENESS LEDGER — is every tree good at something?

**Scope note up front.** Everything below is checked against `dossier/<atlas>-<Tree>.md` and `all-talents.json`. Where a number depends on something outside the 365 talents — weapon dice, armour Deflect, adversary HP — I say so rather than guessing. Numbers use the primer's table: Tier 1 = L1–5, rank 2, so `[Tier][Die]` = **1d6 (avg 3.5)**; Tier 2 = L6–10, rank 3, so `[Tier][Die]` = **2d8 (avg 9)**. `[Size]` = 5 ft at rank 2, 10 ft at rank 3. Starting Investiture ≈ 4; Draw Mana returns Tier per Action.

**One measurement I made myself, because it turned out to be load-bearing.** Talent slots that are a verbatim copy of a talent in another tree:

| Tree | Shared-stock slots | Which |
|---|---|---|
| heroic/Leader | **7 / 25 (28%)** | Hardy, Customary Garb, Mighty, Well Dressed, Baleful, Focused Mind (=Composed), Well Supplied¹ |
| heroic/Envoy | **6 / 25 (24%)** | Collected, Customary Garb, Composed, Mighty, Well Dressed, High Society Contacts |
| heroic/Agent | **6 / 25 (24%)** | Baleful, Collected, Surefooted, Hardy, High Society Contacts, Mighty |
| heroic/Hunter | 5 / 25 | Combat Training, Hardy, Surefooted, Mighty, Swift Strikes |
| heroic/Warrior | 5 / 25 | Combat Training, Hardy, Surefooted, Mighty, Swift Strikes |
| leyline/Blue | 3 / 25 | Collected, Composed, Baleful |
| leyline Green/Black | 2 / 25 each | Hardy + Collected / Hardy + Composed |
| leyline White/Red | 1 / 25 each | Hardy / Mighty |
| heroic/Scholar | 2 / 25 | Collected, Clear Mind (=Composed verbatim) |
| **all ten deity trees** | **0 / 9** | — |

¹ Well Supplied is Leader-only by name but is the same "expertise + spend 2 focus for an Opportunity on a niche social test" shape as High Society Contacts / Rumormonger / Underworld Contacts, of which there are five instances across three trees.

39 slots carry a duplicated *name*; 36 carry byte-identical *text*. **The heroic atlas is where identity leaks**, and that is a large part of why heroic paths feel less distinct than deity paths — not a power problem, an authorship problem.

---

## PART 1 — THE ONE THING EACH TREE IS BEST AT

For each: the claim, the proof, the runner-up, and the margin.

---

### leyline/White — **standing, free, untriggered ally damage mitigation**

**Shield Wall** (Passive, depth 3, earliest L4, no action, no cost): *"When two or more allies are adjacent to you, attacks against them deal half [Tier][Die] less damage."* Unlimited instances, unlimited targets, no test, no duration, permanent. At T2 that is **−4.5 damage on every attack against every adjacent ally, forever, for nothing.** Stacked with **Guardian Stance** (depth 0, L1, free: +1 Deflect to you and an adjacent ally) and **Devoted Conduit** (free: −half [Tier][Die] on damage an ally takes for someone else).

**Runner-up: deity/Order.** Shoulder the Oath is the best *single-instance* mitigation in the game — *"take half that damage instead and reduce the remaining damage to that ally by your ranks in White. Both you and that ally gain temporary HP equal to your ranks in White."* But it is a **Reaction** (one per round, hard cap), targets one Covenant ally, and the Covenant itself costs 1 Action + 1 Investiture and is capped at tier.

**Margin.** In a round where four enemy attacks land on two allies adjacent to the caster: White prevents ~18 (4 × 4.5) for zero resources. Order prevents half of one attack plus 3 flat, once, and burns its Reaction. **White wins ~4×** and does it without spending anything.

**Third place is worse than it reads.** heroic/Warrior's **Defensive Position** — *"The Brace action adds two disadvantages to attacks against you, instead of one"* — is **inert under the implementation**. Advantage/disadvantage is one binary scalar (`d20.number = 2; kl`), so the second disadvantage is worth literally zero. Defensive Position and Formation Drills give allies who spend a whole Action to Brace exactly what Bracing already gave them.

---

### leyline/Blue — **creating physical obstruction and fabricated scenes out of nothing** (marginal; see Part 3)

Blue is the only tree in 365 that **creates an illusion as an object with hit points**: **Phantom Barricade** (1 Action, 1 Inv, depth 1, L2 — *"health equal to 2[Die]… lasts for the scene… provides cover and blocks movement"*), **Phantom Double**, **Holographic Illusion**, **Living Image**. A corpus scan for wall/barricade/cover-creation returns only these.

**Runner-up: nobody.** Civilization's Foundation and Fate's Ordained Ground are buff squares, not cover; nothing else in the game puts a solid obstacle on the map.

**The margin is uncontested and the value is small.** Phantom Barricade is a good talent. It is not a pillar, and it is the *only* uncontested claim Blue has that is worth an Action. See Part 3 — Blue is on the failure list on the strength of everything else.

---

### leyline/Black — **turning one enemy off, at level 1, with no precondition**

**Hollow Command** (2 Actions, 1 Inv, **depth 0, earliest L1**): *"test Deception vs. Spiritual… On a success, the target cannot take actions on its next turn."* An entire enemy turn — three Actions in a three-Action economy — deleted, for two of yours, at character level 1, with no setup.

**Runner-up: deity/Power's Absolute Authority** (2 Actions, 2 Inv, depth 1, L2): *"you choose the target's action on its next turn."* Strictly better in kind (you get to use their turn, not just delete it) but **requires the target already Compelled, Frightened, or Weakened** — a precondition Power must buy with Kneel first, i.e. one more Action and one more Investiture. Second runner-up: **heroic/Agent's Cheap Shot**, the only Stunned application in 365 (Stunned = "two fewer actions", so 2 of 3, not 3 of 3), for 1 Action + 1 focus.

**Margin.** Black removes 3 enemy Actions for 2 of its own with zero setup at L1. Power removes/steals 3 for 3 Actions + 3 Investiture across two talents at L2. Agent removes 2 for 1 Action + 1 focus but must land an unarmed attack vs Cognitive. **Black wins on unconditionality and on level.**

Black's second, corroborating claim: **Withering Ray** is the best repeatable damage in the leyline atlas — `2[Tier][Die]` **vital** (ignores Deflect) for **1 Action and no Investiture** at depth 0 / L1. That is 2d6 = 7 at T1 and **4d8 = 18 at T2, every Action, forever**, paid for in ~2 HP that **Sanguine Reservoir** banks back *as Investiture*. Red's headline damage talent, Searing Bolt, is `1[Tier][Die]` **energy** (Deflect-reduced) for 1 Action **plus** 1 Investiture — one third the damage against a lesser damage type at a higher price.

---

### leyline/Red — **free, action-free, party-wide, escalating NUMERIC bonus**

**Battle Fever** (Passive, depth 1, L2, no action, no cost): *"Each time damage is dealt within Attunement Range, you and allies gain +1 to your next test (max = Rank). Resets at start of your turn."* Plus **Feeding Frenzy** for enemy-on-enemy damage. This is a **numeric** bonus, not advantage — so unlike the 45 advantage-granting talents in the corpus, it is **not** capped by the binary scalar. It stacks.

**Runner-up: heroic/Leader's command die.** Decisive Command gives *one* ally *one* d4 (avg 2.5), for 1 Action + 1 focus, upgraded to d10 (avg 5.5) only after buying three more talents (Confident / Shrewd / Demonstrative Command) and made free-after-a-Strike by a fourth (Combat Coordination).

**Margin.** In a 4-person fight with five damage instances a round, Battle Fever gives **every** character +2 (T1) or **+3** (T2) on their next test — one talent, no action, no resource, from level 2. Leader gives **one** ally +2.5 for an Action and a focus, and needs five talents to reach +5.5 for one ally. **Red wins on breadth and cost by roughly 4 party-members-to-1**; Leader wins on peak magnitude to a single target. Red's uptime is partial (it resets at the start of your turn), which is the honest deduction.

**What Red is NOT best at, contrary to its own name.** Its Conflagration line — the specialty the path description sells — loses single-target damage to Black (above) and loses area damage to deity/Destruction on every axis. And **Momentum's Edge**, the one talent that would make Red the highest-ceiling damage tree in the game (*"bonus impact damage equal to your Speed"*, i.e. +20 to +30 against 1–4 for every other rider in the corpus), reads `@movement.walk.rate`, a DerivedValueField **object** — so it almost certainly delivers nothing. **Red's actual best thing is a party buff it is not named after.**

---

### leyline/Green — **undoing damage that has already stuck: injuries and conditions**

**Reknit Form** (2 Actions, variable Inv, depth 3, L6): *"Spend 2 Investiture and touch a creature to remove one temporary injury, or spend 3 Investiture to remove a permanent injury."* **This is the only talent in all 365 that removes an injury.** Paired with **Natural Recovery** (Special, Opportunity, depth 2, L3), which scrubs **four** conditions — Afflicted, Disoriented, Stunned, Weakened — attached to any Green heal.

**Runner-up: nobody, on injuries.** heroic/Scholar's **Ongoing Care** removes *"one condition caused by their injury"* during a rest — it treats a symptom and leaves the injury. deity/Death's Raise Dead and deity/Life's Apex Form **inflict** injuries. On conditions, the runner-up is deity/Life's **Surgical Precision**, which removes **three** (Weakened, Disoriented, Slowed) and requires a contested Blue vs Physical.

**Margin.** 1-of-365 on injuries, and 4 conditions to Life's 3 on the condition scrub — plus Green's is untested and Life's requires a success. Green also owns the only threshold Reaction heal (**Mender's Instinct**, fires automatically when an ally drops to half) and the only free, self-renewing terrain generator (the Green Attunement Key rebuilds difficult terrain on every Draw Mana at zero cost).

---

### heroic/Agent — **the plot die**

Four exclusives, all at or near depth 0. **Opportunist** (Key, Special, free, L1): *"Once per round, you can reroll your plot die"* — the only plot-die reroll in 365. **Sure Outcome** (Special, 2 focus, depth 0, L1): *"change Opportunity to Complication 4, or any Complication to Opportunity"* — the only face conversion. **Double Down**: reroll again. **Watchful Eye**: use Opportunist on an ally's die.

**Runner-up: leyline/White**, which is the only other tree with a plot-die programme — four talents (Guiding Signal, Concordant Presence, Unity of Purpose force a plot die by raising the stakes; **Pillar of Order** blanks a Complication).

**Margin.** White can *delete* a Complication: Reaction, 1 Investiture, depth 0 but **White 3+ so earliest L6**. Agent can *convert it into an Opportunity*: Special, 2 focus, **level 1**. Agent gets a strictly better outcome, five levels earlier, without spending its Reaction. **Agent wins outright.** And leyline/Blue, which the design guide names as the owner of this mechanic — *"Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression"* — **has zero plot-die talents.** Agent has six, including the exact effect the guide reserves for Blue.

---

### heroic/Envoy — **giving other people focus, in the atlas that runs on focus**

Four of the corpus's small handful of focus producers are Envoy's, and **they are the only ally-facing ones in the game**: **Galvanize** (2 Actions, free: *"An ally rolls their recovery die and recovers that much focus"* — d4 to d10 by their WIL), **Lessons in Patience** (*"your target recovers 1 focus"* on every Rousing Presence, and Practical Demonstration makes Rousing Presence a **Free Action** whenever you Gain Advantage or hit), **Applied Motivation** (+half Lore ranks on any focus recovery you cause), **Inspired Zeal** (allies up to your Discipline ranks each recover 1).

**Runner-up:** three trees produce focus and **all three are self-only** — leyline/Black (Siphoned Will, Predatory Insight), heroic/Hunter (Cold Eyes: 1 focus on a quarry kill), heroic/Leader (Cutthroat Tactics: 1 focus when your ally rolls a Complication).

**Margin.** Against a heroic atlas that spends focus in 12 Agent talents, 11 Leader, 8 Envoy, 7 Scholar, 7 Warrior, Envoy is **1-of-1 on refilling anyone but yourself**, and its baseline loop (Practical Demonstration + Rousing Presence + Lessons in Patience) is **free, unlimited, and Free-Action**. Envoy also owns the only **unconditional** extra Reaction in 365 (**Foresight**: *"Gain an additional reaction each turn"* — Hunter's Sidestep is Dodge-only and armour-gated; Blue's Forewarned requires a correct prediction), which matters because the 1-Reaction cap is the hardest cap in the system. And **Peaceful Solution** is the only talent that ends a combat without violence.

---

### heroic/Hunter — **martial output at literally zero resource cost, indefinitely**

Only 4 of Hunter's 25 talents spend anything (Shadowing 3 focus, Backstep 2, Pack Hunting 1, Swift Strikes 1). **Everything that defines the tree is free**: Seek Quarry, Combat Training, Killing Edge, Startling Blow, Animal Bond, **Deadly Trap**, Steady Aim, Sharp Eye, Exploit Weakness, **Unrelenting Salvo**, Experienced Trapper, Hunter's Edge, Feral Connection. Hunter mentions Investiture **once in 25 talents**, as information (Sharp Eye), and Opportunity **zero times**.

The signature piece: **Deadly Trap** (2 Actions, **no cost**, depth 0, L1) → *Impaling: "roll 2d4 keen damage. Target is Afflicted [vital damage equal to 3 + your ranks in Survival]"* — upgraded **for free** to 2d6/2 rounds (Experienced Trapper) and **2d8/3 rounds** (Hunter's Edge). At Survival 3 that is **6 Deflect-ignoring vital per turn, ongoing, for zero resources, reusable every fight.** And **Unrelenting Salvo** is the only talent in 365 that lifts the once-per-turn same-weapon Strike restriction.

**Runner-up on traps: deity/Fate's Snare** (1 Action, **1 Investiture**, one-shot, consumed when triggered): `[Tier][Die] + Awareness` keen + Restrained. **Runner-up on zero-cost sustain: heroic/Warrior** at 7 focus-costers.

**Margin.** At T1 Hunter's trap (2d4 + ~5/turn ongoing vital, free, repeatable) beats Fate's Snare (1d6+AWA ≈ 5.5 once, 1 Inv). At T2 Fate's upgraded Inevitable Snare (2 × 2d8 = 18 + Disoriented, 2 Inv) beats it on burst. **That is uncomfortable: a deity tree only just beats a heroic tree at the deity tree's own signature mechanic, and only from level 6, and only by spending Investiture the heroic tree does not need.** Flagged in Part 5.

---

### heroic/Leader — **social leverage, outright**

**17 of 25 talents** touch influence, persuasion, deception, intimidation, leadership, or command, against Envoy's 10 and Agent's 8. Unlike its rivals, most of Leader's are bespoke rather than shared stock: **Set at Odds** (*"Test Leadership vs. their highest Spiritual to make them hostile to each other"* — the only mass mutual-hostility effect in 365), **Tactical Ploy**, **Imposing Posture**, **Grand Deception**, **Rumormonger**, **Cutthroat Tactics**.

And it owns two structural exclusives: **the command die** — the only granted, **upsizable** bonus die in all 21 trees, and the only granted bonus that grows by buying more talents (d4 → d6 → d8 → d10 across three Command talents) — and **Authority** (Passive, depth 3): *"Double the range of Leader talents that affect allies, and double the number of allies affected."* Nothing else in the corpus doubles an entire path's ally-facing footprint.

**Runner-up: heroic/Envoy** at 10 social talents — but 4 of those 10 (Well Dressed, High Society Contacts, and the Customary Garb/Composed defensive stock) are shared verbatim with Leader itself.

**Margin.** 17 to 10, and Leader's are the ones the other tree does not have.

---

### heroic/Scholar — **out-of-combat problem solving, and the only crafting economy**

Three uncontested exclusives. **Fabrials**: five talents in 365 mention them and **all five are Scholar's** (Efficient Engineer, Prized Acquisition, Inventive Design, Experimental Tinkering, Overcharge) — a full craft/upgrade/reconfigure loop with a reusable special gem. **Rewriting the character sheet**: Erudition + Mind and Body + Emotional Intelligence + Deep Study grant **six reassignable skill ranks plus expertises**, re-specced after a long rest; no other tree grants a skill rank at all. **Seven expertise grants**, the most in the atlas (Agent 5, Warrior 6 across 3 talents, every deity tree 0). Plus **Resuscitation** (3 focus, depth 2, L3): revive someone *"who died recently"* — the corpus's second-cheapest death reversal after Envoy's Rallying Shout, and 1 Investiture-free level earlier than Death's Raise Dead.

**Runner-up on exploration: heroic/Hunter** (Experienced Trapper's foraging + tool-fashioning, Surefooted) and **heroic/Agent** (Cover Story, two Contacts, Mercurial Façade). Neither crafts, neither re-specs, neither raises the dead.

**Margin.** 10 of Scholar's 25 talents do nothing once initiative is rolled. That is the finding *and* the claim: **no other tree comes within half of it.** Whether that counts as "good at something" is question (d) and I answer it in Part 3.

---

### heroic/Warrior — **combat modes, and taxing the enemy's action economy**

**Seven named stances** (Vigilant, Flame, Iron, Stone, Wind, Vine, Blood), each a 1-Action mode switch, with **Vigilant Stance** as the hub that makes every further switch a Free Action and **Practiced Kata** letting you start each scene already in one. A corpus grep for "stance" returns 14 talents; 8 are Warrior's and **none of the other six is a mode you enter** (White's Guardian Stance is a Passive; Chaos's Unweaving only names "stance" as something it strips). Warrior is the only tree in the game with character-level mode switching.

The best of them: **Stonestance** (depth 0, **L1**, free): *"Your deflect increases by 1, and enemies within your reach must spend an additional Action to attack your allies who aren't in Stonestance."* **This is the only ACTION TAX in 365** — the only talent that makes an enemy pay Action currency to do a normal thing. In a three-Action economy that is up to a third of an enemy's turn, permanently, for nothing, from level 1.

**Runner-up: nobody.** No other talent taxes an enemy's Actions. The nearest analogues are outright denial (Black's Hollow Command, Agent's Cheap Shot) which cost you Actions and a test; Stonestance costs neither and never stops.

Warrior also owns Shard equipment outright (4 talents), Brace modification outright (3 of the corpus's 4 Brace-touching talents), and the graze suite (7 of 10).

---

### deity/Chaos — **ending an effect that is already running**

**Unweaving** (2 Actions, 2 Inv, depth 1, L2): *"end one magical buff, stance, or sustained effect on the target."* **This is the only dispel in 365 talents.** The corpus is full of scene-long installs it is the sole answer to: Warrior's stances, Power's Mantle of the Aspirant, Civilization's Colossus and Bastion, Life's Apex Form and Primal Regeneration, Destruction's Walking Ruin, Sovereignty's Sovereignty, Order's Concord, Knowledge's The Pack.

**Runner-up: leyline/Blue's Counterspell** — *"When a character… spends Investiture to activate a talent… On a success, the talent fails."* Different mechanic: Counterspell **prevents**, Unweaving **removes**. Counterspell can only fire in the instant of activation, is a Reaction (1/round), costs 2 focus + 1 Investiture, and is gated Blue 3+ = **L6**. Unweaving works at **L2**, on your own turn, against anything already on the board.

**Margin.** 1-of-1 for removal. Chaos also owns the **only forced enemy reroll** in the game (**Shatter Focus**: *"that enemy rerolls and takes the lower result"* — a real, non-binary, non-cancellable penalty, unlike the 45 advantage talents) and the **only banked-misfortune marker placed on a creature and detonated for damage** (the Omen).

---

### deity/Civilization — **summons, and free damage that costs you no actions**

Six of nine talents build or upgrade the **Combat Construct**: Forge Construct → Tempered Edge → Siege Form / Arsenal → Bastion → Magnum Opus. It is the only summoned entity in 365 with a multi-talent upgrade ladder owned by its own tree, and the only one with **modes**.

**The number that matters.** Forge Construct (1 Action + 1 Inv, **L1**) gives one melee attack per turn for `[Tier][Die]` impact. **Tempered Edge** (Passive, **free**, depth 1) adds *"an additional [Tier][Die] energy damage and ignore deflect."* **Arsenal** (2 Actions + 2 Inv, once, depth 2) adds *"an additional attack per turn"* plus a free 15-ft-move Strike on a kill. Assembled: **2 attacks × 2[Tier][Die] = 4[Tier][Die] per round, half of it Deflect-ignoring, on a separate initiative slot, costing you zero Actions.** That is 4d6 ≈ 14/round at L3 and **8d8 ≈ 36/round at L6**, sustained, forever, after a three-talent setup.

**Runner-up: heroic/Hunter's animal companion** (Animal Bond, Protective Bond, Feral Connection, Hunter's Edge — 4 talents). But **Hunter never grants the companion**: `prereq: Animal companion` is a GM-issued Reward, not a talent. Third: deity/Death's Risen Servant (one talent, one Harvested Remain, no upgrades).

**Margin.** 6 talents to 4, Civilization actually creates the entity, and the entity out-damages every character-facing repeatable in the leyline and heroic atlases while consuming none of the caster's Actions. Civilization also owns **the only teleport in 365** (Trade Routes).

---

### deity/Death — **generating Investiture off other people's kills**

**Reaper's Harvest** (Passive, no cost, no action, **depth 0, earliest L1**): *"When a character drops to 0 HP within your Attunement Range, you recover 1 Investiture and mark the corpse as a Harvested Remain."* No once-per-round cap. Triggers on **any** character — minions your allies drop, enemies killed by hazards, anyone.

**Runner-up: every other Investiture producer in the game is capped or conditional.** Chaos's Void Sense: *once per round*, and only off a creature bearing your Omen. Knowledge's Accumulate: *once per round*, only off your one Insight target. Life's Prognosis: *once per round*, only off your one Diagnosed creature. Sovereignty's Expose: only when a Censured creature fails a test. leyline/Black's Predator's Due: only when **you** reduce someone to 0, and it is gated Black 3+ = L6.

**Margin.** In a fight where four minions die anywhere in range, Death refuels **4 Investiture** to everyone else's **1**. And it does so from level 1, as a Passive, with no target of its own to maintain. **This is the best resource engine in the game and it is not close.**

Death also holds four clean 1-of-1s: the only **resurrection** (Raise Dead), the only **corpse interrogation** (Speak with the Fallen), the only **heal denial** (*"cannot regain HP"*, Withering Touch), and the only scene-long, **no-test, no-save** ongoing damage tick that leeches half its damage back to the caster (Consuming Decay).

---

### deity/Destruction — **persistent, spreading, no-save area denial**

**The only source of created "dangerous terrain" in all 365 talents.** Eight of nine talents touch it. Three trees only *mitigate* it (Agent / Hunter / Warrior's shared Surefooted); nobody else *makes* it. And Destruction is the only tree whose zones **spread** (Combustion Chain), **merge** (Cascading Failure, The Unmooring), **upgrade their own damage die mid-scene** (The Unmooring), and are **painted by walking** (Walking Ruin — the only "hazard follows your movement path" effect in the game).

**Runner-up on terrain: leyline/Green** (6 difficult-terrain talents, free and self-renewing via the Attunement Key, and Thorn Field makes it deal half [Tier][Die] keen). **Green's is movement terrain that happens to hurt; Destruction's is hazard terrain that happens to slow.**

**Margin, and Destruction's second and better claim: reliability.** **Set Charge** (1 Action + 1 Inv, depth 0, L1) does `[Tier][Die]` energy to *everyone within 10 ft* with **no attack roll and no saving throw**, detonated on a **Free Action** at a moment you choose. Every comparable AoE in the corpus makes you roll or lets them save: Red's Flame Surge (Athletics vs Red, half on a success), Civilization's Bastion (Agility vs Red), Chaos's Cascade Collapse (Blue vs Cognitive), Order's Verdict (Discipline vs Blue). **Destruction is the only tree whose area damage cannot miss.**

---

### deity/Fate — **Restrain with no saving throw**

**Snare** (1 Action + 1 Inv, depth 0, **L1**): *"The first enemy character to enter the Snare's square triggers it: the target takes [Tier][Die] + Awareness keen damage and is Restrained until the start of your next turn."* **No test, no save, no attack roll.** Restrained is the harshest condition in the primer's list — movement 0 **and** disadvantage on everything except escaping.

**Runner-up: leyline/Green's Grasping Vines** — the only other Restrain in 365 (1 Action + 1 Inv, depth 1, L2), which requires winning **Green vs Physical defence** and then **1 Investiture at the start of every turn** to maintain.

**Margin.** Fate's Restrain is free of any test; Green's is contested and metered. Green's is targetable at range and lasts as long as you pay; Fate's requires the enemy to walk into a 5-ft square. **This is a narrow Fate win on reliability-per-cost, and I would not call it decisive.** Fate's cleaner exclusives are structural rather than powerful: it is the only talent that hands an **ally** the trigger for the caster's own hazard (Foreknown Strike), and the only delayed trigger declared as an **arbitrary narrative event** (Thread of Inevitability: *"a character drops to 0 HP, a particular enemy crosses a threshold, an ally reaches a designated location, or the GM raises the stakes"*).

---

### deity/Knowledge — **the single-target damage ceiling, by a factor of 2.5×**

**Predatory Strike** (1 Action + 1 Inv, **depth 0, L1**): *"deal bonus Vital damage equal to [Tier][Die] per Insight on the target."* **Studied Mark** places 2 Insight; **Accumulate** (Passive, free, depth 1) adds 1 at the start of every one of your turns and **refunds the Investiture** whenever the mark takes damage from any source. Cap is 5.

The arithmetic, entirely from talent text: round 1 Studied Mark (2 Insight), round 2 Accumulate (3), round 3 (4), round 4 (5, capped). From round 4 onward, **Predatory Strike deals weapon damage + 5 × [Tier][Die] Vital, per Action, effectively free** (Accumulate refunds the cost). That is **5d6 = 17.5 at Tier 1** and **10d8 = 45 at Tier 2**, and it is reachable at **character level 2** with two talents.

**Runners-up on per-Action damage:** leyline/Black's Withering Ray at 4d8 = 18 (T2, 1 Action). deity/Chaos's Isolating Ruin at up to 2 × (2d8 + AWA) ≈ 26 for **2** Actions. deity/Civilization's Construct at 36/round but that is a whole round, not an Action, and needs three talents.

**Margin. 45 to 18 — Knowledge deals 2.5× the next-best single Action in the game, and its second- and third-best talents (The Pack, Death Mark) hand the *same* multiplier to the whole party.** No tree is more clearly best at its thing.

---

### deity/Life — **healing magnitude**

Five heal formulas — the most in the corpus — and every one carries a rider. The peak: **Surgical Precision** (1 Action + 1 Inv, depth 1): heal `[Tier][Die] × 2` **and** remove a condition. With **Prognosis** (Passive, free, depth 1) adding *"+[Tier][Die] healing on a creature that has a condition"*, one Action at L6 heals **4d8 + 2d8 = 27 HP and strips a condition.**

**Runner-up: leyline/Green's Verdant Mend** — 1 Action + 1 Inv for `[Tier][Die] + Green modifier` ≈ **13 at L6**. Third: heroic/Scholar's Field Medicine → Swift Healer → Applied Medicine chain, which at Medicine 3 / Lore 3 restores the patient's recovery die + 9, **as a Free Action for 1 focus** — about 13.5, and the best *action economy* on healing in the game.

**Margin. 27 to 13 — Life heals roughly double.** But the tie splits three ways and everyone keeps something (see Part 2).

Life's second exclusive: **Vital Diagnosis** (1 Action + 1 Inv, depth 0, **L1**) is the most complete enemy read in the corpus — *"exact HP, max HP, conditions, and Physical and Spiritual defenses"* — and it converts that read into **party-wide Deflect-ignoring bonus damage for the scene**: *"You and allies dealing damage to the Diagnosed creature deal additional Vital damage equal to your Tier."*

---

### deity/Order — **the declared prohibition, and the free permanent party-wide advantage that rides on it**

**Edict** (1 Action + 1 Inv, depth 0, L1): *"place an Edict on a character… declaring one prohibited action (move from its space, attack a chosen ally, activate Investiture, etc.). The first time the bound character takes the prohibited action, it takes [Tier][Die] + Intellect spirit damage and is Disoriented."* **This is the only prohibition-shaped effect in 365** — every other control effect in the game tells a target what it *must* do or prevents it outright; Edict tells it what it may not do and lets it choose.

**Lawkeeper's Eye** (Passive, **no cost, no action, no test**, depth 1, L2): *"When you place an Edict, you learn the bound character's intended action on its next turn. While you can see a character bound by one of your Edicts, **you and your allies have advantage on attack tests against that character**."*

**Runner-up on party-wide advantage:** deity/Civilization's Bonds of Community (needs a character to drop to 0 HP inside a Foundation; one attack). deity/Power's Investiture of Command (2 Actions + 2 Inv, 3 allies, one attack each, **and you take unreducible spirit damage**). Both are one-shot; Lawkeeper's Eye is **permanent, free, untested, and unlimited in duration.**

**Margin.** Lawkeeper's Eye is the best free buff in the game — and it is also the best *intent-reading* effect, beating leyline/Blue's Read Intent (1 Action + 1 Inv + contested Blue vs Cognitive) at zero cost with a party buff attached.

---

### deity/Power — **taking over an enemy's turn, at level 2**

**Kneel** (1 Action + 1 Inv, depth 0, L1) is the **only source of the Compelled condition in 365** (three grep hits; all three are Power's). **Absolute Authority** (2 Actions + 2 Inv, depth 1, **L2**): *"you choose the target's action on its next turn."*

**Runner-up: leyline/Black's Puppeteer** — the only other "dictate an action" effect. It requires the target to be at **0 focus** (which Black cannot itself produce — only heroic/Warrior's Feinting Strike reliably strips focus with a weapon), is gated **Black 3+ = L6**, sits at depth 4, costs a **Reaction** plus 2 focus plus 1 Investiture, and chooses only **one** of the target's actions.

**Margin.** Power reaches a strictly better version of the effect **four levels earlier**, on its own turn, with a precondition it supplies itself with its own depth-0 entry. **Power wins decisively.** It also owns the only literal party-wide **+1 to all tests** (Mantle of the Aspirant) and the only two "cannot be reduced" damage clauses in the corpus.

---

### deity/Sovereignty — **damage die size manipulation. And that is the finding.**

Sovereignty is the **only tree in 365 that changes a damage die's size in either direction** (grep-verified). Censure / Decree of Ruin / Edict of the Fallen step an enemy down the d4→d12 ladder; Exalt / Investiture of Authority / Sovereign's Balance / Sovereignty step an ally up.

**It is a true 1-of-1 and it is not a "something", because both halves are dominated.** See Part 3.

---

## PART 2 — THE TIES, RESOLVED

| Axis | Contenders | Winner | Margin | Does the loser still have a "something"? |
|---|---|---|---|---|
| **Healing** | Life / Green / Scholar | **Life on magnitude (27 vs 13 per Action at L6); Green on repair (only injury removal in 365, 4-condition scrub)** | 2× on magnitude; 1-of-365 on repair | Yes for both — this is a genuine split, not a loss. **Scholar loses:** its heals are bounded by the *patient's* recovery dice (a resource it cannot replenish), it removes no condition in combat and no injury ever. Scholar's something is downtime, not healing. |
| **Ally protection** | White / Order / Warrior / Civilization | **White** | ~4× per round vs Order, and free | Order keeps the best single-instance redirect. **Warrior loses this one badly** — Defensive Position's "two disadvantages" is worth zero under the binary implementation, and Formation Drills makes allies spend an Action to get what Bracing already gave them. Warrior's something is the action tax. |
| **Summons** | Civilization / Hunter / Death | **Civilization** | 6 talents to 4; and it actually *grants* the entity | Hunter's something is zero-cost sustain; Death's is Investiture generation. No loser. |
| **Terrain / zones** | Destruction / Green / Fate / Civilization | **Destruction on hazard, Green on movement terrain (free + self-renewing), Fate on ally-anchored squares** | Destruction is 1-of-1 on the "dangerous terrain" keyword; Green is 1-of-1 on free regeneration | **Civilization loses this and it doesn't matter** (its something is summons). But see the near-duplicate flag below. |
| **Information** | Order / Life / Knowledge / Blue / Fate / Hunter | **Order on intent-reading (free, passive, untested, permanent, +party advantage); Life on statblock reading (exact HP, max HP, conditions, both defences)** | Order's is free where Blue's costs 1 Action + 1 Inv + a contested test | **Blue loses information despite having the most information talents.** Read Intent is strictly dominated by Lawkeeper's Eye and by Fate's Read the Threads (same information *plus* it repositions a hazard onto the target's path). |
| **Action economy** | Agent / Envoy / Scholar / Warrior / Leader | **Agent on raw count (three Free Actions each granting +2 Actions); Envoy on the Reaction slot (only unconditional extra Reaction); Scholar on party-wide (Turning Point: +1 Action to every party member)** | Agent's +6/turn is theoretical — the granted Actions can only buy Use a Skill, Gain Advantage, or an Agent talent, and **Gain Advantage's second use is worth zero under the binary rule** | **Leader loses:** Synchronized Assault costs **3 Actions + 2 focus** — an entire Slow turn — to give allies-up-to-Leadership-ranks one Action each. In a 4-person party that is roughly net zero, restricted to Strikes, and gated behind a contested test. Leader's something is social. |
| **Social** | Leader / Envoy / Agent | **Leader** | 17 talents to 10 to 8, and Leader's are bespoke where the others' are shared stock | Envoy's something is focus; Agent's is the plot die. |
| **Plot die** | Agent / White | **Agent** | Converts a Complication to an Opportunity at **L1** for 2 focus; White can only blank one at **L6** for a Reaction + 1 Inv | White's something is protection. |
| **Resource generation** | Death (Investiture) / Envoy (Focus) / Black (self-sufficiency) | **Three separate winners on three currencies** | Death's is uncapped where every rival is once-per-round | Clean three-way split. |
| **Control / denial** | Black / Power / Fate / Agent / **Blue** | **Black on unconditional denial at L1; Power on turn-hijacking at L2; Fate on untested Restrain; Agent on Stunned (1-of-1)** | — | **Blue loses, and this is the proof of its whole problem.** Ghostly Walls (depth 3, **L6**, Blue 3+, 1 Action + **2** Inv, contested, *"movement rate becomes 0"*) plus **Absolute Stillness** (a second talent slot, depth 4, L6) to add *"disadvantage on Physical tests and cannot take Reactions"* — **two talent slots at level 6 for four Investiture-worth of effect** — approximates what **Green's Grasping Vines** does with **one talent at level 2 for 1 Investiture** (Restrained *is* movement 0 plus disadvantage on everything but escape). Blue reaches a strictly worse version of a Green effect four levels later at twice the cost. |
| **Damage die manipulation** | Sovereignty alone | **Sovereignty, uncontested — and it still loses**, because the *effects* it produces are dominated: see below | — | **No.** |

### The near-duplicate nobody has flagged

**deity/Civilization — Lay Foundation:** Free Action, 1 Investiture, **10 ft** square, *"Allies that begin their turn in a Foundation gain +1 to all defenses until the start of their next turn. You may sustain up to your tier Foundations."*
**deity/Fate — Ordained Ground:** Free Action, 1 Investiture, **5 ft** square, *"An ally that begins its turn on an Ordained Ground square gains +1 to all defenses until the start of its next turn **and may use the Aid action at up to 30 ft range** from that square. You may sustain up to your tier Ordained Ground squares."*

These are the **same depth-0 entry talent in two different deity trees**, differing only in area (Civilization's is 4× larger) and one rider (Fate's extends Aid range). Both are entry nodes, both cost the same, both cap at tier. That is a design duplication across atlases that the functional-overlap cosine would not catch, because the deity vocabulary differs.

---

## PART 3 — THE FAILURE LIST

### FAILURE 1 — **deity/Sovereignty**. Cause: **(c) power concentrated on an axis someone else owns better** — and (a) on top of it.

Sovereignty's only mechanic is die-size stepping. Both halves are dominated by talents that are cheaper, longer-lasting, and available without a second colour gate.

**Its DIMINISH half loses to a free leyline Passive.** Censure (1 Action + 1 Inv + contested Black vs Cognitive) steps the enemy's damage die down one — about **−1 average per die, for one round**. Edict of the Fallen (2 Actions + 2 Inv) steps it down two, scene-long — about **−2 per die**. Against a two-dice attacker attacking twice a round, the capstone-adjacent talent prevents about **8 damage a round**.
White's **Shield Wall** — Passive, depth 3, **free, no action, no test, no cap** — prevents **half [Tier][Die] = 4.5 per attack against every adjacent ally**, so **~18 in the same round**. A leyline tree, using no resources, mitigates twice as much as a deity tree spending 2 Actions and 2 Investiture. That inverts the stated design intent ("Radiant-equivalent power lives in the Deity Domain trees") in the most direct comparison available.

**Its ELEVATE half loses to two other deity trees.** Exalt (1 Action + 1 Inv) steps one ally's die up one — **+1 average per die, for one round, for one ally.**
- deity/Life's **Vital Diagnosis** (1 Action + 1 Inv, depth 0, L1) gives **you and every ally** `+Tier` **Vital** (Deflect-ignoring) damage against a target, **for the scene**. At T2 that is +2 unstoppable damage per attack from four characters for a whole fight.
- deity/Knowledge's **The Pack** (1 Action + 2 Inv) gives **allies** bonus Vital equal to your Insight count — **up to +5 per attack**, for the scene.
Sovereignty pays the same price for **+1 average, to one ally, for one round.**

**And it has nothing else.** Zero damage, on both independent evidence streams (no prose damage source, `isDamageFormula=false` on all nine). Zero healing. Zero terrain, summons, information, exploration, mobility, resource generation beyond one conditional refund. Its promised signature resource — **Decree**, described in *both* intent sources as *"a declared law projected within a radius: allies inside are elevated, enemies inside are diminished"* — **exists in no talent**. All nine are single-target. The word appears once, in the title "Decree of Ruin".

**And the entry price is the worst in the game.** Black 2+ **and** White 2+ to enter; **Black 3+ and White 3+** for its scene-long talents, i.e. level 6 and six skill ranks in two colours. It tests **Black three times and White zero times**, and never uses White to size a die — so White 3+ buys literally nothing but the gate. The deity design guide says of exactly this tree: *"Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule."* Half of that rule is not implemented.

**Verdict: Sovereignty has no "something." It is the clearest design failure in the 365.**

### FAILURE 2 — **leyline/Blue**. Cause: **(c) primarily, with (b) and a timing problem the axis scores hide.**

Blue's one uncontested claim (illusions and obstruction) is real but small. Everything it is *supposed* to be good at is owned better elsewhere:

- **Disadvantage.** Blue has the largest single-tree block of disadvantage-imposition in the game (5 of 15 corpus-wide: Pattern Recognition, Intercept, False Premise, Probability Cascade, Absolute Stillness). **The implementation folds them all into one binary scalar.** The engine's own comment — `edhaNextModFoldMode`: *"Boolean-OR per direction; both directions present cancel to null"* — settles it. Five talents produce, at most, one talent's worth of effect in any given round. And the census says the corpus **produces disadvantage in 14 talents across 9 trees and consumes it in zero**.
- **Control.** Beaten by Green at half the price and four levels earlier (Ghostly Walls + Absolute Stillness vs Grasping Vines — see Part 2).
- **Information.** Beaten by Order (free, permanent, untested) and Fate (same read plus board manipulation).
- **Probability / the plot die.** The design guide states *"Plot Die manipulation is Blue's capstone identity."* **Blue has zero plot-die talents.** Agent has six.
- **Damage.** Zero, confirmed by both evidence streams.

**Plus a timing failure the profile scores understate.** Seven of Blue's 25 talents are gated **Blue 3+**, i.e. **level 6**: Composed, Counterspell, Collected, Anticipate, Ghostly Walls, Living Image, Absolute Stillness. **Every one of Blue's teeth is on the far side of that gate.** Before L6 the tree is five disadvantage talents that fold into one, three illusions, and Forewarned. Two of the seven L6 talents (Composed: +tier max focus; Collected: +2 to two defences) are stat sticks in a tree where 16 of 25 talents spend Investiture and none generates any.

**Verdict: Blue's "something" (obstruction/illusion) is defensible but is not a pillar. It should be treated as a failure of magnitude, not of identity.** The identity is fine and unique; the tree just does not have a round in which it is the best thing at the table.

### FAILURE 3 (conditional) — **heroic/Scholar**. Cause: **(d) power on an axis that does not matter often enough to notice** — but the axis is uncontested and this is a table decision, not a data one.

Scholar genuinely owns downtime, crafting, and sheet-rewriting, and **10 of its 25 talents do nothing once initiative is rolled.** Not one of its 25 talents contains the word "damage." Its two genuinely strong combat talents are **Turning Point** (2 Actions + 2 focus → +1 Action to you *and every ally*, once, contested vs the enemy leader — excellent, and one of only two party-wide Action grants in the game) and **Swift Healer** (Field Medicine as a **Free Action**, the best healing action-economy in the corpus).

I am **not** putting Scholar on the failure list, because its something is real, exclusive, and by a wide margin. But it is the only tree in the game whose value is set entirely by how the GM runs the campaign. **What would settle it: how many sessions have downtime, crafting, or a rest phase.** That is outside the talent fence and I will not guess.

### Not on the failure list, with reasons

- **leyline/White** passes. Its problem is not power (protection 5, and I stand by it) but **dependency**: **24 of 25 White talents require another body** — only Hardy is self-contained — and **7 of its 25 are Reactions competing for a single Reaction slot per round**, which is the highest Reaction density in the game (28%, against a leyline design target of 5–8%). Adding damage to White would be solving a problem White does not have. Its problem is that it can never act alone and it can only fire one of its seven Reactions.
- **leyline/Red** passes, but on a talent it is not named after (Battle Fever), and with **Momentum's Edge probably broken**. If Momentum's Edge were fixed, Red's ceiling would be the highest in the leyline atlas by an order of magnitude and the tree would need rebalancing, not buffing.
- **heroic/Leader** passes on social, but note it is the tree with the most shared stock (7/25 = 28%) and the weakest capstone in the atlas (Synchronized Assault: 3 Actions + 2 focus for roughly net-zero party Actions).

---

## PART 4 — POWER RANKING, ALL 21

**Stated basis.** Expected contribution to the outcome of a **typical combat round at character level 6** (Tier 2, rank 3 where the tree's own gates allow it), scored on:
1. **damage delivered or prevented per Action spent** (the primary term);
2. **enemy Actions denied**, priced at ~⅓ of an enemy turn each per the primer;
3. **uptime** — how many rounds the tree sustains its best line before its resource floor (Draw Mana at 2 Inv/Action, focus max 2+WIL);
4. **reachability** — how much of the tree is actually online at L6.

Non-combat capability counts at a discount, because 15 of the 21 trees are built for combat rounds. Ally-facing power is priced against the designer's actual table: a **four-person party**. Deity trees are expected to out-power leyline and heroic trees (stated intent); a deity tree being beaten by a leyline tree is a defect, not a ranking artefact.

**Unresolvable inside the fence, stated once:** Warrior, Hunter, Power, Knowledge, and Death deliver a large share of their damage through *weapon dice*, which live in equipment, not in the 365. Their absolute floors are therefore uncertain. **What would settle it: the weapon table.** All figures below are **talent-added** damage, which is comparable across trees.

| # | Tree | Tier |
|---|---|---|
| 1 | **deity/Knowledge** | S |
| 2 | **deity/Civilization** | S |
| 3 | **deity/Destruction** | S |
| 4 | **deity/Death** | A |
| 5 | **leyline/Black** | A |
| 6 | **deity/Order** | A |
| 7 | **deity/Power** | A |
| 8 | **heroic/Warrior** | A |
| 9 | **deity/Life** | B |
| 10 | **leyline/Green** | B |
| 11 | **heroic/Envoy** | B |
| 12 | **deity/Chaos** | B |
| 13 | **heroic/Leader** | B |
| 14 | **leyline/White** | B |
| 15 | **deity/Fate** | B |
| 16 | **leyline/Red** | C |
| 17 | **heroic/Hunter** | C |
| 18 | **heroic/Agent** | C |
| 19 | **heroic/Scholar** | C |
| 20 | **leyline/Blue** | D |
| 21 | **deity/Sovereignty** | D |

### Working — the top three

**#1 deity/Knowledge.** Two talents (Studied Mark, depth 0; Accumulate, depth 1), reachable at **character level 2**, produce a repeatable **1-Action** attack for weapon + **5 × [Tier][Die] Vital** = **10d8 = 45 average, Deflect-ignoring**, from round 4 of every fight onward. Accumulate refunds the Investiture *"when that creature takes damage from any source"* — including your allies' attacks — so the loop is effectively **free**. Uptime: unlimited. Reachability at L6: 7 of 9 talents. Then it hands the same escalation to the party (The Pack: allies deal `+Insight` Vital, scene-long; Death Mark: every ally deals `[Tier][Die]` Vital on the kill). **Nothing else in the corpus reaches half of 45 in one Action.** Its gaps are total (zero control, zero defence, zero healing, zero mobility, zero Reactions), but on the stated basis — contribution per round — it is first and the margin is enormous.

**#2 deity/Civilization.** Forge Construct (1 Action + 1 Inv, **L1**) + Tempered Edge (**free** Passive, depth 1) + Arsenal (2 Actions + 2 Inv once, depth 2) = **two attacks a round at 2[Tier][Die] each, half of it ignoring Deflect, on a separate initiative slot, consuming none of your Actions**. At T2: **8d8 ≈ 36 damage per round, forever, for free**, plus a chain Strike on every kill. Meanwhile the character's own Actions are free to lay Foundations (+1 to all defences, 10 ft, sustained to tier) and Bastion (fortified: difficult terrain + `[Tier][Die]` impact on entry + Slowed save). It is #2 rather than #1 only because the setup costs three talents and the first two rounds, and because the caster personally cannot attack anything.

**#3 deity/Destruction.** The most **reliable** damage engine in the game: Set Charge (1 Action + 1 Inv, depth 0, L1) applies `[Tier][Die]` energy to everyone in 10 ft with **no attack roll and no save**, detonated on a **Free Action** at a time of your choosing, and leaves scene-long dangerous terrain. Six damage formulas, the most in the corpus. Fault Line (2 Actions + 2 Inv) is a 60 ft × 5 ft line for `[Tier][Die] + Strength` plus a Prone save plus permanent hazard. The capstone merges every hazard placed all scene into one zone and upgrades its die. Uptime: the tree's costs are **setup**, not per-round, so a placed Charge and a painted zone keep working while you Draw Mana. Its gaps (no healing, no protection, nothing ally-facing at all) keep it behind #1 and #2 but not by much.

### Working — the bottom three

**#19 heroic/Scholar.** Contributes **exactly zero damage** at every depth and every tier — not one of its 25 talents contains the word "damage." No movement, no forced movement, no terrain, no area effect except Turning Point's Action grant, no in-combat condition removal (Ongoing Care works only during a rest; Contingency only on a Complication). Its two real combat rounds are Turning Point (+1 Action per party member, once, gated on identifying an enemy leader) and Swift Healer (Free Action heal, bounded by the *patient's* recovery dice, which Scholar cannot replenish). **On the stated basis — combat rounds — Scholar contributes in roughly 2 rounds of a 5-round fight.** It ranks 19th and not lower only because those two rounds are genuinely strong and because its downtime ownership is total.

**#20 leyline/Blue.** Zero damage on both evidence streams. Its main lever produces five instances of an effect the engine can only hold **one** of. Every one of its seven best talents is gated behind **Blue 3+ = level 6**, so at L1–5 it is playing with the shallow half of the tree. When they arrive, they are: a Reaction that stops one talent (Counterspell, needs the enemy to have spent Investiture on a talent, 2 focus + 1 Inv, contested); two stat sticks (Composed, Collected); an anti-influence Reaction (Anticipate); and a two-talent immobilise (Ghostly Walls + Absolute Stillness) that is **strictly worse than Green's one-talent Grasping Vines at level 2**. It generates no Investiture and spends it in 16 of 25 talents. It is ranked above Sovereignty because it has 25 talents rather than 9, has real breadth, and owns cover-creation outright.

**#21 deity/Sovereignty.** Zero damage, zero healing, zero terrain, zero summons, zero information, zero exploration, zero mobility, zero Reactions. Nine talents, all single-target, all doing one thing — and that one thing prevents about **8 damage a round** at its best, where a **free** White Passive prevents about **18**, or grants **+1 average per die to one ally for one round**, where a same-cost Life or Knowledge talent grants Deflect-ignoring bonus damage to the *whole party* for the *whole scene*. It charges the highest entry price in the game (Black 3+ **and** White 3+ for its scene-long half = level 6 and six skill ranks in two colours) and never rolls White once. Its promised signature resource does not exist. **It is last, and it is last by a clear margin: it is the only tree in the 365 that is both worse than a free leyline Passive at its own job and has no second job.**

---

## PART 5 — WHO TO WARN A PLAYER AWAY FROM AT SESSION ZERO

**Hard warn — do not let a player take this expecting it to work:**

1. **deity/Sovereignty.** Tell them plainly: it costs six skill ranks in two colours, it deals no damage, heals nothing, and its unique mechanic (die stepping) prevents less damage than a White leyline Passive that costs nothing. And the thing the path description sells them — Decree zones, *"allies inside are elevated, enemies inside are diminished"* — **is not in the tree.** A player who reads the path description and picks Sovereignty has been mis-sold. This one needs a fix, not a warning.

**Warn with conditions — fine if the player knows what they are choosing:**

2. **leyline/Blue.** *"You will not deal damage, and your best five talents arrive at level 6."* A Blue player at levels 1–5 has: Forewarned, illusions, and disadvantage that stops mattering the moment anyone else in the party imposes it too. If the campaign is expected to run levels 1–5 (which, given this is a pre-session-one review, it is), **Blue is the single worst experience in the game to be handed at level 1.** If the table will reach L6+, Blue becomes a real controller with unique tools.

3. **deity/Chaos.** The Omen cap is *"up to tier Omens"* — **which is ONE until level 6.** With a cap of 1: **Spreading Omen** *"place an Omen on the target and one additional enemy… subject to your Omen cap"* places one and loses the other, so it is a strictly worse Entropy Strike with no damage attached; **Cascade Collapse** *"remove all your Omens simultaneously"* removes exactly one for **2 Actions + 2 Investiture**, i.e. worse than Entropy Strike's 1 Action + 1 Investiture for the same damage plus an Omen placed. **Three of Chaos's nine talents are dominated by its own depth-0 entry for the whole of levels 1–5.** Warn the player, or fix the cap.

4. **leyline/White.** *"You will need people to stand next to you, and you get one Reaction a round."* 24 of White's 25 talents need another body. Seven of them are Reactions competing for one slot — a White player who buys Counterpoint, Interposing Shield, Retributive Guard, Shared Burden, Shared Conviction, Voice of Authority and Pillar of Order has spent seven talent slots on a resource they can use **once per round**. Steer them to the Passives (Guardian Stance, Shield Wall, Devoted Conduit, Unyielding Accord), which are the tree's actual strength and are free.

5. **deity/Fate.** Five of nine talents (Ordained Ground, Bulwark Ground, Weave the Thread, Foreknown Strike, Thread of Inevitability) pay off **only if an ally voluntarily stands on a square you nominate**. This is a social contract with the other players, not a mechanic. In a party that will not cooperate positionally, more than half of Fate is inert. And it can never spring its own Snare until depth 2.

6. **deity/Civilization.** *"You will never personally attack anything."* Not one of the nine talents lets the character deal damage with their own body. Some players love this; some will be miserable.

7. **heroic/Scholar.** *"Ten of your twenty-five talents do nothing in a fight."* Only take it if the GM is running downtime, crafting, and travel. Otherwise the player is buying a character sheet with a 40% hole in it. Pair it with anything.

8. **heroic/Hunter — one specific trap.** Four of Hunter's 25 talents (Animal Bond, Protective Bond, Feral Connection, Hunter's Edge) hang off *"prereq: Animal companion"* — a **GM-issued Reward, not a talent**. A player who plans a Tracker build without securing the companion first has planned four dead levels. Same trap on Warrior's **Shard Training** (*"Access to a Shardblade and Shardplate"*, gating six talents), Agent's and Envoy's and Leader's Contacts talents (*"Patron"*), and Leader's **Authority** (*"Title granting you command of 5+ people"*).

**Explicitly do NOT warn away:**

- **leyline/White**, on the grounds of having no damage. White's problem is dependency and Reaction contention, not damage. Its protection is the best in the game and adding damage to it would blur a working identity to fix a problem it does not have.
- **heroic/Scholar** on the grounds of having no damage. Scholar's problem is that its axis may not come up, not that it is weak on the axis.

---

## PART 6 — THE THREE FINDINGS I WOULD ACT ON FIRST

1. **Sovereignty is broken, not weak.** It needs the Decree zone its own description promises, it needs White to be rolled at least once, and its diminish half needs to be worth more than a free White Passive. Everything else in this report is a balance question; this one is a promise the data does not keep.

2. **Blue's stated identity was given to Agent.** The leyline design guide reserves plot-die manipulation as *"Blue's capstone identity"*; Blue has zero plot-die talents and Agent has six, including the exact effect (choosing a face) the guide reserves for Blue. **This is the cheapest fix in the report** — Blue's problem is not that it has no damage, it is that the mechanic it was designed around was never built. Give Blue the plot die and it becomes a tree with a pillar, without touching its no-damage identity.

3. **The binary advantage scalar is silently deleting design work across the whole corpus.** 45 talents in 13 trees produce advantage and 7 in 5 trees consume it; 14 produce disadvantage and **zero** consume it. Blue's five disadvantage talents are worth roughly one. Warrior's Defensive Position ("two disadvantages") is worth zero. Hunter's Fatal Thrust ("gain two advantages") is worth one. The engine **already has** the stacking alternative — `edha-next-test-mod`'s `formula` field, which item 49 made sum by term concatenation, currently used by one adversary ability and no talent. **Converting redundant advantage-granters to `−1d6`/`+1d6` formula modifiers would recover real design value in at least six trees without writing a new primitive.**

## Adversarial verification

**30 load-bearing claims checked: 11 confirmed, 15 corrected, 4 refuted.**

The ledger's spine survives: the exclusivity claims are mostly real (I re-grepped 20 of them and only three broke), the shared-stock measurement is exactly right (36 byte-identical slots, verified), and the three big design defects it names — Sovereignty mis-sold, Blue's plot-die identity built into Agent, binary advantage eating design work — are all confirmed against talent text. But it fails on two axes. (1) ARITHMETIC AND OMISSION IN ITS #1 FINDING: the Sovereignty failure case ignores two of the tree's nine talents (Sovereign's Favor's [Tier][Die] temp HP on every Exalt, ~9/round at T2; Expose's uncapped Investiture refund plus an ally Reactive Strike on every miss), and asserts "all nine are single-target" when Edict of the Fallen pays every ally in Attunement Range. "It has nothing else" is false as written; "it is mis-sold and its lever is invisible" survives. (2) A SYSTEMIC LEVEL ERROR IT INHERITED WITHOUT CHECKING: 43 talents carry a non-colour rank-3+ gate but are listed below L6, 37 of them heroic (6-7 per heroic tree). The rank cap is 2 through L5 for every skill, not just colours, so heroic trees are NOT "reachable by ~L4-L5" — Warrior's Wit's End and Devastating Blow, Scholar's Turning Point and Resuscitation, Envoy's Foresight and Peaceful Solution, Green's Natural Recovery and Hunter's Hunter's Edge are all level 6. That guts the analysis's "Blue's timing failure is unique" framing and several of its per-talent level claims. Also missed: the "up to your tier" token cap is 1 for all of L1-5 in SEVEN deity trees (Chaos, Order x2, Civilization, Death, Destruction, Fate x2) — the analysis flagged it only for Chaos and shipped a session-zero warning for Chaos alone when it is a systemic deity-atlas problem. Smaller breaks: Searing Bolt is HALF Withering Ray's dice, not "one third"; Power's Absolute Authority steals ONE action, not a turn, and needs two contested tests and a whole Slow turn, so "Power wins decisively" over Black inverts; Blue spends Investiture in 15 talents, not 16; Leader's shared stock is 5 by name and 5 by text, not 7; deity/Chaos shares a talent NAME with leyline/Red, so "all ten deity trees 0/9" is false.

### Claims

1. **CONFIRMED** — 36 of 365 talent slots carry byte-identical text with another tree; 39 carry a duplicated name. Focused Mind (Leader) = Clear Mind (Scholar) = Composed (Envoy) verbatim.
   - Evidence: Grouping all 365 descriptions by normalised text yields exactly 36 slots sharing text with at least one other: Hardy 2 (White/Green) + Hardy 4 (Agent/Hunter/Leader/Warrior), Collected 5, Composed 2 (Blue/Black), Baleful 3, Mighty 6, High Society Contacts 2, Surefooted 3, Customary Garb 2, 'increase your max and current focus by your tier' 3 (Envoy:Composed / Leader:Focused Mind / Scholar:Clear Mind), Combat Training 2, Swift Strikes 2. Duplicated-name slots total exactly 39. Both of the analysis's headline numbers reproduce.
2. **CORRECTED** — Per-tree shared-stock table: Leader 7/25, Envoy 6, Agent 6, Hunter 5, Warrior 5, Blue 3, Green/Black 2 each, White/Red 1 each, Scholar 2, all ten deity trees 0/9.
   - Evidence: By duplicated NAME the per-tree counts are Agent 6, Envoy 6, Hunter 5, Leader 5, Warrior 5, Blue 3, Black 2, Green 2, Red 2, White 1, Scholar 1, deity/Chaos 1. Leader is 5, not 7 — the analysis padded it with Focused Mind (a name-unique talent) and Well Supplied (its own footnote admits this is shape, not text). Red is 2 (Mighty + Shatter Focus), not 1. Scholar is 1 by name (Collected) / 2 by text (Collected + Clear Mind). And deity/Chaos's Shatter Focus shares its name with leyline/Red's Shatter Focus, so 'all ten deity trees 0/9' is false on names (it holds on text).
   - Corrected: 39 slots carry a duplicated name and 36 byte-identical text. By name: Agent 6, Envoy 6, Hunter 5, Leader 5, Warrior 5, Blue 3, Black/Green/Red 2, White/Scholar 1, deity/Chaos 1 (Shatter Focus, shared with leyline/Red; the text differs). The heroic atlas is still where identity leaks — 27 of the 39 slots are heroic — and that conclusion is unaffected.
3. **REFUTED** — Heroic paths carry no rank gate that pushes talents to level 6; leyline trees uniquely back-load behind rank 3 (= L6), and 'every one of Blue's teeth is on the far side of that gate' is a distinctive timing failure.
   - Evidence: The primer states the skill-rank cap is 2 through L5 for EVERY skill, not just colours. 43 talents carry a non-colour rank-3+ prerequisite while the dossier lists them below L6, and 37 are heroic: Agent 7 (Fast Talker, Trickster's Hand, Subtle Takedown, Shadow Step, Close the Case, Sleuth's Instincts, Mercurial Facade), Envoy 6 (Foresight, Peaceful Solution, Inspired Zeal, Rallying Shout, Sage Counsel, Practiced Oratory), Hunter 6 (Hunter's Edge, Unrelenting Salvo, Fatal Thrust, Sidestep, Exploit Weakness, Pack Hunting), Leader 6 (Synchronized Assault, Set at Odds, Grand Deception, Relentless March, Resilient Hero, Authority), Scholar 6 (Turning Point, Resuscitation, Contingency, Ongoing Care, Overwhelm with Details, Overcharge), Warrior 6 (Wit's End, Devastating Blow, Meteoric Leap, Vinestance, Precise Parry, Wary), plus Green 2 (Natural Recovery, Pack Sense), Black 1, Blue 1, Red 1, White 1. Every heroic tree has 6-7 talents at L6, exactly like the leyline trees.
   - Corrected: Blue's 7 Blue-3+ talents (Composed, Counterspell, Collected, Anticipate, Ghostly Walls, Living Image, Absolute Stillness — verified, exactly those seven) are all L6, but so are 6-7 talents in EVERY heroic tree. Blue's distinctiveness at L1-5 is that it has zero damage and its remaining kit is five disadvantage talents that fold to one, not that it is uniquely back-loaded. The dossier's `earliestLevel` field applies the rank-3 -> L6 rule only to leyline colour ranks; every non-colour rank-3 gate in it is under-computed by 1-4 levels, and the analysis used those numbers verbatim.
4. **CORRECTED** — deity/Sovereignty has no 'something': zero damage, zero healing, zero terrain, summons, information, exploration, mobility, Reactions, and 'resource generation beyond one conditional refund'; all nine talents are single-target; its diminish half prevents ~8/round where White's free Shield Wall prevents ~18.
   - Evidence: Two of the nine talents are absent from the analysis's entire treatment. Sovereign's Favor (Passive, free, depth 1, L2): 'When you use Exalt on an ally, they also gain temporary HP equal to [Tier][Die]' — at T2 that is 2d8 ~ 9 points of soak per Action spent on Exalt, repeatable every round. Expose (Passive, free, depth 1, L2): 'When a creature affected by your Censure fails a test, you recover 1 Investiture' — NO once-per-round cap, unlike Chaos's Void Sense, Knowledge's Accumulate and Life's Prognosis, which the analysis correctly notes are capped — 'When that creature fails an attack test, any ally in Attunement Range who is that attack's target may make a Reactive Strike against it', i.e. the tree converts enemy misses into party damage. And Edict of the Fallen reads 'each ally in Attunement Range gains temporary HP equal to your Tier', which is not single-target. The die-step arithmetic itself checks out (2 steps x 2 dice x 2 attacks = 8), and Shield Wall's 'half [Tier][Die]' at T2 is ~4.25 after the floor the parallel Mending Aura formula shows (floor(2d8/2)), so 4 attacks = ~17 not 18.
   - Corrected: Sovereignty is mis-sold, not empty. Its promised Decree radius exists in no talent (confirmed: 'die size' returns only Sovereignty's seven, and 'Decree' appears only in the title Decree of Ruin) and White is a near-pure toll booth (three Black tests, zero White tests, no damage die sized by White — though Sovereign's Favor's [Tier][Die] has no stated governing rank and could legitimately be White, which the analysis should have checked). But the per-round accounting at L6 with Censure + Sovereign's Favor + Expose + Edict of the Fallen is roughly 8 damage prevented by die-stepping + ~9 temp HP + party-wide temp HP on every enemy miss + free ally Reactive Strikes + uncapped Investiture refunds — comparable in raw mitigation to Shield Wall's ~17, with Sovereignty paying Actions and Investiture where White pays geometry (Shield Wall needs two or more allies ADJACENT, and White owns no forced movement to make that happen). The real defects are: the lever is invisible at the table, both scene-long talents are L6 behind rank 3 in two colours, and the signature zone was never built.
5. **CORRECTED** — deity/Knowledge is #1: Predatory Strike deals weapon + 5 x [Tier][Die] Vital = 10d8 = 45 per Action, effectively free, reachable at character level 2 with two talents.
   - Evidence: Accumulate's prerequisite is Studied Mark, not Predatory Strike. The loop therefore needs THREE talents — Predatory Strike (d0, L1), Studied Mark (d0), Accumulate (d1) — and at one talent per level is reachable at L3, not L2. The 45 average is right if the multiplier resolves (10d8 = 45) and the cap is right ('Insight may not exceed 5'). 'Effectively free' holds only at one Predatory Strike per round: Accumulate reads 'you recover 1 Investiture once per round' — the analysis quotes the trigger and drops the cap here, while correctly citing that same cap against Knowledge in its Death section. Two further caveats it omits: Predatory Strike requires a weapon attack to HIT, and its authored roll formula is `(@tier)d(2*@skills.red.rank+2)` — a single [Tier][Die] — so the x5 multiplier lives in event code, not in the rolled formula.
   - Corrected: Knowledge's ceiling is weapon damage + 5[Tier][Die] Vital = 10d8 = 45 at Tier 2, on a hit, once per round for free (a second Predatory Strike in the same round costs a full Investiture). It needs three talents and is reachable at L3, with the Insight cap reached at the start of round 2. It is still the highest single-Action talent-added damage in the corpus and #1 on the analysis's stated basis; the margin over Black's Withering Ray (4d8 = 18) is real.
6. **REFUTED** — leyline/Red's Searing Bolt is 'one third the damage' of Black's Withering Ray at a higher price.
   - Evidence: Searing Bolt: 'rolling [Tier][Die] energy damage on a success', formula `(@tier)d(2*@skills.red.rank+2)`. Withering Ray: 'deal 2[Tier][Die] vital damage', formula `(2*@tier)d(2*@skills.black.rank+2)`. That is 1 unit vs 2 units — HALF, not one third. The rest of the comparison stands (energy is Deflect-reduced, vital is not; Searing Bolt costs 1 Investiture where Withering Ray costs 'Lose half [Die] health', ~1.5-1.75 HP).
   - Corrected: Withering Ray deals twice Searing Bolt's dice, in a Deflect-ignoring type, for HP instead of Investiture. Black still wins the leyline repeatable-damage comparison decisively; the multiplier is 2x, not 3x.
7. **CORRECTED** — deity/Power is best at 'taking over an enemy's turn, at level 2' and beats leyline/Black's Puppeteer decisively.
   - Evidence: Absolute Authority reads 'you choose the target's action on its next turn' — one action, the same scope the analysis criticises Puppeteer for ('chooses only one of the target's actions'). It requires a target already Compelled/Frightened/Weakened; Kneel's Compelled lasts only 'until the start of your next turn', so Kneel (1 Action, 1 Inv, Black vs Cognitive) and Absolute Authority (2 Actions, 2 Inv, Black vs Cognitive) must be spent in the SAME turn — a full Slow turn and 3 Investiture, through two contested tests, to steal one enemy action. Meanwhile the analysis's own Black section is right that Hollow Command (2 Actions, 1 Inv, one test) deletes an entire enemy turn at L1. The claim in the Black section that 'Power removes/steals 3 for 3 Actions + 3 Investiture' overstates Power by 3x.
   - Corrected: Power's Kneel is the only source of Compelled (grep-confirmed, three hits, all Power). Absolute Authority steals ONE enemy action for a whole Slow turn and 3 Investiture across two contested tests. It reaches action-dictation four levels earlier than Puppeteer, which is real, but it is not 'a strictly better version' and it is dominated by Black's own Hollow Command on Actions-denied-per-Action-spent.
8. **CONFIRMED** — heroic/Warrior's Stonestance is the only ACTION TAX in 365.
   - Evidence: Searching all 365 for 'additional action / extra action / spend an extra / costs an additional' returns exactly two hits: Stonestance ('enemies within your reach must spend an additional Action to attack your allies who aren't in Stonestance') and Death's Speak with the Fallen (an Investiture surcharge on repeat use, not an action tax). Verbatim quote is accurate; depth 0, L1, no cost, no test, all confirmed.
9. **CORRECTED** — heroic/Warrior's Defensive Position is 'inert under the implementation' because a second disadvantage is worth zero.
   - Evidence: Full text: 'The Brace action adds two disadvantages to attacks against you, instead of one, AND ALLIES CAN BRACE BEHIND YOUR SHIELD.' The analysis quotes only the first clause. The first clause is indeed inert under the binary scalar; the second is a separate, non-inert benefit, and Formation Drills extends the whole talent to allies within 10 ft.
   - Corrected: Defensive Position's headline clause ('two disadvantages instead of one') is worth zero under the binary implementation, but the talent is not inert — its second clause lets allies Brace behind your shield, and Formation Drills propagates that. The finding is 'the marquee number is fake', not 'the talent does nothing'.
10. **CONFIRMED** — deity/Chaos's Unweaving is the only dispel in 365.
   - Evidence: A corpus scan for 'dispel / end one magical / sustained effect' returns exactly one hit: Unweaving, 'end one magical buff, stance, or sustained effect on the target', 2 Actions, 2 Investiture, depth 1, L2. Blue's Counterspell is correctly distinguished as prevention-at-activation. Minor: the analysis's quote drops 'test Black vs. Spiritual. On success,' — the dispel is contested and can fail.
11. **CONFIRMED** — deity/Civilization's Trade Routes is the only teleport in 365.
   - Evidence: 'teleport' returns exactly one talent. Checking the near-misses (Agent's Shadow Step is a hide-after-Disengage; Destruction's Walking Ruin and Warrior's Surefooted are Speed bumps) finds no unnamed equivalent.
12. **CONFIRMED** — leyline/Blue uniquely creates physical obstruction and illusions; nothing else in the game puts a solid obstacle on the map.
   - Evidence: 'illusion / provides cover / blocks movement / barrier' returns Phantom Barricade, Holographic Illusion, Living Image (all Blue) plus Green's Natural Order, which only NEGATES illusions. Phantom Double is a fourth Blue illusion (depth 0, L1). Civilization's Foundation/Bastion is difficult terrain, not blocking, confirming the runner-up analysis. Worth adding what the analysis does not: Phantom Barricade's health is '2[Die]' = ~7 HP at rank 2, so the obstruction is genuinely fragile — which supports the analysis's own verdict that the claim is uncontested but small.
13. **CORRECTED** — heroic/Agent's Sure Outcome converts a Complication to an Opportunity at L1 for 2 focus, a strictly better outcome than White's Pillar of Order, 'five levels earlier, without spending its Reaction'.
   - Evidence: Sure Outcome's full text begins 'WHEN YOU USE OPPORTUNIST, spend 2 focus to change Opportunity to Complication 4, or any Complication to Opportunity.' The analysis drops the trigger. Opportunist is 'Once per round, you can reroll your plot die' — so the conversion only applies to a reroll you make, once per round, on YOUR die. Reaching an ALLY's die requires Watchful Eye, which is a Reaction — the same Reaction cost the analysis charges White with. Also unmentioned: Scholar's Contingency ('remove Complication from the test of an ally within 20 ft', 2 focus) is a third Complication-fixer.
   - Corrected: Agent still wins the plot-die axis outright (only reroll in 365, only face conversion, four core talents at depth 0-1 against White's four raise-the-stakes talents), and Blue has zero. But the conversion is once-per-round, only on a reroll, and touching an ally's die costs Agent's Reaction too.
14. **CORRECTED** — heroic/Envoy is the only tree that restores focus to anyone but yourself, on four talents, in a baseline loop that is 'free, unlimited, and Free-Action'.
   - Evidence: The four ally-facing focus talents check out (Galvanize, Applied Motivation, Inspired Zeal, and Lessons in Patience — 'When you use Rousing Presence, your target recoveres 1 focus', a typo that hides it from naive greps). The three rival producers are self-only as stated (Black's Siphoned Will and Predatory Insight, Hunter's Cold Eyes, Leader's Cutthroat Tactics — that is four talents in three trees, and the analysis's list is right). But the loop is not free: Practical Demonstration reads 'WHEN YOU GAIN ADVANTAGE OR HIT WITH AN ATTACK, use your Rousing Presence as a Free Action'. Gain Advantage is a 1-Action standard action, and Envoy grants no attack.
   - Corrected: Envoy is 1-of-1 on refilling anyone but yourself. Its baseline loop costs one of your three Actions per round (spent on Gain Advantage) to convert into one ally focus plus Determined — cheap and unlimited, but not free.
15. **CONFIRMED** — heroic/Envoy's Foresight is the only unconditional extra Reaction in 365.
   - Evidence: 'additional reaction / extra reaction / reaction each turn' returns exactly two: Foresight ('Gain an additional reaction each turn', Passive, no cost) and Hunter's Sidestep ('an additional reaction to Dodge when you're not wearing armor with deflect of 2 or higher'). Blue's Forewarned grants 1 Reaction only on a correct prediction. Caveat the analysis omits: Foresight sits behind Instill Confidence, whose prerequisite is 'a companion' the tree never grants, and Discipline 3+ makes it level 6.
16. **CONFIRMED** — heroic/Scholar contributes exactly zero damage — not one of its 25 talents contains the word 'damage'.
   - Evidence: Scanning all 25 Scholar talents (name + description + authored text) for /damage/i returns zero hits. leyline/Blue returns zero as well. Both zero-damage claims survive at the strongest possible standard.
17. **REFUTED** — Scholar's Resuscitation is 'the corpus's second-cheapest death reversal after Envoy's Rallying Shout, and 1 Investiture-free level earlier than Death's Raise Dead'.
   - Evidence: Rallying Shout reads 'Rousing Presence can revive an Unconcious ally' — unconsciousness, not death; it is not a death reversal at all. Resuscitation ('revive an Unconcious character OR ONE WHO DIED RECENTLY', 3 focus) is therefore the cheapest death reversal in the corpus, and it also breaks Death's 'only resurrection' exclusivity down to one of two. But it is gated Medicine 3+ = level 6, not the L3 the dossier lists, so it arrives TWO levels LATER than Raise Dead (3 Actions, 4 Investiture, depth 3, L4), not one earlier.
   - Corrected: Death's Raise Dead is one of two death reversals, not the only one; Scholar's Resuscitation is the other and is cheaper (3 focus, no Investiture) but arrives at L6 against Raise Dead's L4. Raise Dead keeps a real edge: it restores a body to life with 1 HP and acts on your initiative, where Resuscitation rides Field Medicine.
18. **CONFIRMED** — leyline/Green owns the only removal of an injury in all 365 talents, plus the only threshold Reaction heal.
   - Evidence: Reknit Form ('remove one temporary injury, or spend 3 Investiture to remove a permanent injury', 2 Actions, depth 3, Green 3+ = L6) is the sole injury remover; Scholar's Ongoing Care treats a condition caused by an injury, and Death's Raise Dead and Life's Apex Form inflict them. Mender's Instinct ('When an ally in Attunement Range drops to half health or below, spend 1 Investiture to restore [Tier][Die]') is the only threshold-triggered Reaction heal. One correction to the supporting sentence: Natural Recovery's four-condition scrub is Medicine 3+ and therefore L6, not the L3 the analysis states.
19. **CORRECTED** — deity/Life heals roughly double leyline/Green — 27 HP per Action at L6 against ~13.
   - Evidence: Surgical Precision's full text: 'Spend 1 Investiture and touch a willing creature. TEST BLUE VS. PHYSICAL. On success, heal [Tier][Die] x 2 and remove one condition (Weakened, Disoriented, or Slowed). ON FAILURE, HEAL [Tier][Die] ONLY.' It is also depth 1 but Blue 3+, i.e. earliest L6, which the analysis omits while quoting 'depth 1'. Prognosis's +[Tier][Die] applies only 'to heal a creature that HAS A CONDITION'. So 27 = 4d8 + 2d8 requires a successful contested test AND a conditioned target; the unconditional success case is 4d8 = 18, and failure is 2d8 = 9.
   - Corrected: Life's peak heal is 18 on a successful test at L6 (4d8), 27 if the target also carries a condition, 9 on a failure. Against Green's untested Verdant Mend at ~13, Life's advantage is ~1.4x baseline and 2x in the conditional best case — not a flat double. Life still owns healing magnitude (5 heal formulas, the most in the corpus, including the only 2x[Tier][Die] expression), and the three-way split with Green (repair) and Scholar (action economy) stands.
20. **CONFIRMED** — deity/Destruction is the only tree whose area damage cannot miss — Set Charge does [Tier][Die] to everyone within 10 ft with no attack roll and no save, detonated on a Free Action.
   - Evidence: Set Charge verbatim: 'You may detonate any of your Charges as a Free Action on your turn. When a Charge detonates, each character within 10 ft takes [Tier][Die] energy damage and the detonation point becomes dangerous terrain for the scene.' No test clause. The named comparators check out: Fault Line and Bastion and Verdict and Cascade Collapse all carry a test. What the analysis omits: 'You may sustain up to your tier Charges', so exactly ONE Charge exists at a time for the whole of L1-5, which makes Cascading Failure and The Unmooring's 'all your active Charges detonate' a one-Charge effect until level 6.
21. **CONFIRMED** — deity/Fate's Snare is the only Restrain with no saving throw; leyline/Green's Grasping Vines is the only other Restrain and is contested plus metered.
   - Evidence: 'Restrained' returns exactly two talents in 365. Snare: 'The first enemy character to enter the Snare's square triggers it: the target takes [Tier][Die] + Awareness keen damage and is Restrained until the start of your next turn' — no test. Grasping Vines: 'test Green vs. Physical defense... Spend 1 Investiture at the start of your turn to maintain the vines.' The analysis's own hedge ('a narrow Fate win on reliability-per-cost, and I would not call it decisive') is the right call.
22. **CORRECTED** — leyline/Blue's Ghostly Walls + Absolute Stillness is 'strictly worse than Green's one-talent Grasping Vines at level 2'.
   - Evidence: Ghostly Walls: 1 Action + 2 Investiture, L6, Blue vs Cognitive, 'movement rate becomes 0 until end of your next turn' — no maintenance cost, and it requires 'a character you can influence', an influence-subsystem dependency the analysis does not mention. Absolute Stillness adds 'disadvantage on Physical tests AND CANNOT TAKE REACTIONS'. Restrained is movement 0 plus disadvantage on everything but escape, but does NOT deny Reactions. Grasping Vines costs 1 Investiture up front plus 1 EVERY TURN to maintain, so over three rounds the two packages cost 4 vs 3 Investiture.
   - Corrected: Blue's immobilise costs two talent slots and arrives four levels later than Green's one; per-round Investiture cost is comparable once Grasping Vines' maintenance is counted, and Blue's package adds Reaction denial that Restrained does not. 'Later and clumsier' is right; 'strictly worse' is not.
23. **CORRECTED** — leyline/White is the reference implementation of standing free ally mitigation; Shield Wall prevents ~4.5 per attack at T2, ~18 in a four-attack round.
   - Evidence: Shield Wall verbatim and its depth-3 / earliest-L4 placement both check out. But 'half [Tier][Die]' rounds down — the parallel authored formula on Mending Aura is `floor((@tier)d(...)/2)` — so at T2 it is ~4.25 per attack (~17 in the four-attack round), and at Tier 1 it is floor(1d6/2) = ~1.5 per attack, not the 1.75 a naive halving gives. The dependency numbers are better than the analysis's own source: 24 of 25 White talents name an ally, enemy, character or adjacency; only Hardy is self-contained — verified, and stronger than the profile's 22. The seven Reactions are exactly the seven named.
   - Corrected: Shield Wall prevents ~4.25 per attack at Tier 2 and ~1.5 at Tier 1, free and permanently, but only while TWO OR MORE allies stand adjacent to the caster — a formation White owns no talent to create. White's protection primacy survives; the margin over every rival is smaller at Tier 1 than the analysis's figures imply.
24. **CORRECTED** — deity/Order's Lawkeeper's Eye is 'permanent, free, untested, and unlimited in duration' and the best free buff in the game.
   - Evidence: Full text: 'WHILE YOU CAN SEE a character bound by ONE OF YOUR EDICTS, you and your allies have advantage on attack tests against that character.' Edict is consumed the first time the prohibited action is taken, unviolated Edicts fade at end of scene, and 'You may sustain up to your tier Edicts' — one Edict for all of L1-5. So the buff runs on one enemy at a time, only while that Edict is unviolated and the target is in line of sight. And the payload is ADVANTAGE, which the analysis itself establishes is binary and worth zero if any other party member is already supplying it — a discount it applies to Blue's five disadvantage talents and to Hunter's Fatal Thrust but not here.
   - Corrected: Lawkeeper's Eye is a free, untested, no-action party-wide advantage against one Edict-bound enemy at a time, lasting until that Edict is violated or the scene ends, and worth nothing in a round where anyone else already grants advantage on that attack. It is a very good free Passive, not 'the best free buff in the game'.
25. **CORRECTED** — deity/Death's Reaper's Harvest is the best resource engine in the game 'and it is not close' — every other Investiture producer is capped or conditional.
   - Evidence: Reaper's Harvest checks out: Passive, free, depth 0, L1, triggers on ANY character dropping to 0 HP in Attunement Range, no once-per-round cap. The exclusivity framing is slightly off: Sovereignty's Expose ('When a creature affected by your Censure fails a test, you recover 1 Investiture') and Black's Predatory Patience ('On a successful attack against a Weakened creature, regain 1 Investiture') are also UNCAPPED, merely conditional — only Chaos's Void Sense, Knowledge's Accumulate and Life's Prognosis carry the once-per-round clause.
   - Corrected: Reaper's Harvest is the best Investiture engine in the game: uncapped, free, level 1, and keyed to a trigger the party supplies. Two rivals (Sovereignty's Expose, Black's Predatory Patience) are uncapped-but-conditional rather than capped; three (Void Sense, Accumulate, Prognosis) are explicitly once per round.
26. **CORRECTED** — heroic/Leader owns social outright, 17 talents to Envoy's 10 to Agent's 8, and its capstone Synchronized Assault is 'roughly net zero'.
   - Evidence: The 17/10/8 split does not reproduce and contradicts the verified Leader profile, which measures 12 of 25 against the next tree's 4. A broad keyword sweep gives Leader 19, White 6, Envoy 6, Blue 5, Agent 5. Every measure puts Leader first by a wide margin, so the conclusion is safe and only the numbers are unsupported. On the capstone: Synchronized Assault (3 Actions + 2 focus, Leadership 3+ = L6) grants 'allies up to your ranks in Leadership... an Action for an additional Strike', so at Leadership 3 it converts three LEADER Actions — which the analysis itself prices at +2 or +3 damage each — into up to three ally Strikes from the party's actual damage dealers. That is a large positive value conversion, not net zero.
   - Corrected: Leader owns social leverage outright by every count taken (12 to 4 on the verified profile; 19 to 6 on a broad sweep), and its exclusives — the command die, its upsizing chain, Authority's doubling, Set at Odds as the only mass mutual-hostility effect — all verify. Synchronized Assault is action-count-neutral but value-positive, and its real weaknesses are the L6 gate, the contested test, and the 3-Action price.
27. **CORRECTED** — deity/Chaos's Omen cap is 1 until level 6, which dominates three of its nine talents at levels 1-5; the tree needs a warning or a cap fix.
   - Evidence: The mechanic verifies: 'You may have up to tier Omens active simultaneously; placements beyond this cap are lost.' At cap 1, Spreading Omen (same cost and action as Entropy Strike, places one usable Omen, deals no damage) is strictly dominated by Entropy Strike. Cascade Collapse at cap 1 removes exactly one Omen for 2 Actions + 2 Investiture — worse per resource than Entropy Strike, but NOT dominated: it also applies Disoriented, which Entropy Strike does not. And the analysis says 'three of Chaos's nine talents are dominated' while naming only two.
   - Corrected: At Tier 1 the Omen cap is 1, which makes Spreading Omen strictly dominated by Entropy Strike and makes Cascade Collapse (2 Actions, 2 Investiture, 1 Omen removed, [Tier][Die] + Disoriented) a poor buy against Isolating Pressure (1 Action, 2 Investiture, 1 Omen removed, [Tier][Die] + Awareness vital + Isolated). Two talents, not three. AND THE PROBLEM IS NOT CHAOS'S: seven deity trees carry the same 'up to your tier' token cap — see the missed-findings list.
28. **CONFIRMED** — The near-duplicate nobody has flagged: Civilization's Lay Foundation and Fate's Ordained Ground are the same depth-0 entry in two deity trees.
   - Evidence: Both verbatim: Free Action, 1 Investiture, designate a square for the scene, 'allies that begin their turn in a Foundation gain +1 to all defenses until the start of their next turn. You may sustain up to your tier Foundations' vs 'An ally that begins its turn on an Ordained Ground square gains +1 to all defenses until the start of its next turn and may use the Aid action at up to 30 ft range from that square. You may sustain up to your tier Ordained Ground squares.' Identical action type, identical cost, identical buff, identical sustain cap; the only differences are 10 ft vs 5 ft and Fate's Aid-range rider. This is the analysis's best original finding and it holds exactly.
29. **CORRECTED** — leyline/Blue spends Investiture in 16 of 25 talents and generates none.
   - Evidence: Counting Blue talents whose Cost field names Investiture gives 15, matching the brief's resource-economy figure of 'Blue 0 regen / 15 costers'. The analysis states 16 twice. Zero generation confirmed.
   - Corrected: Blue spends Investiture in 15 of 25 talents and generates none — the worst producer-to-consumer ratio in the leyline atlas alongside White (0/15).
30. **REFUTED** — leyline/Red's Momentum's Edge reads @movement.walk.rate, a DerivedValueField object, so it almost certainly delivers nothing.
   - Evidence: Momentum's Edge has NO authored damage formula at all in the talent data — damageFormula is empty and damage is null. Its prose reads 'the attack deals bonus impact damage equal to your Speed'. Whether an event handler resolves @movement.walk.rate is engine code, which the scope fence explicitly excludes. Within the 365-talent fence this claim cannot be checked in either direction, and the analysis presents it as established.
   - Corrected: Momentum's Edge (Passive, free, depth 2, L3) promises bonus impact damage equal to your Speed — an order of magnitude larger than any other damage rider in the corpus (+20 to +30 against 1-4). It carries no authored roll formula, so whether it delivers is an engine question outside this review's scope. What WOULD settle it: reading the talent's system.events in data/authored/leyline-red.json against the engine handler. The design implication is unchanged: if it resolves, Red needs rebalancing rather than buffing.

### What the analysis missed

- THE LEVEL TABLE IS WRONG FOR 43 TALENTS AND THE ANALYSIS USED IT UNCHECKED. The dossier's `earliestLevel` applies the rank-3 -> level-6 rule only to leyline COLOUR ranks, but the primer says the skill-rank cap is 2 through L5 for every skill. 43 talents carry a non-colour rank-3+ prerequisite and are listed below L6 — 37 of them heroic, 6 or 7 in every single heroic tree. This is the analysis's biggest miss because it is load-bearing for its own session-zero advice: it warns that Blue is uniquely punishing at L1-5 because its teeth are at L6, when Warrior's Wit's End and Devastating Blow, Scholar's Turning Point and Resuscitation, Envoy's Foresight and Peaceful Solution, Agent's Fast Talker and Trickster's Hand and Close the Case, Hunter's Hunter's Edge and Unrelenting Salvo, Leader's Synchronized Assault and Set at Odds, and Green's Natural Recovery are all L6 too. It also invalidates the brief's structural claim that heroic trees are 'reachable by ~L4-L5', which the analysis was told to account for rather than rediscover — but it was told to challenge the brief where the text disagrees, and here it does.
- THE 'UP TO YOUR TIER' TOKEN CAP IS 1 FOR ALL OF LEVELS 1-5 IN SEVEN DEITY TREES, NOT JUST CHAOS. Verified: Chaos's Omens, Order's Edicts AND Covenants, Civilization's Foundations, Death's Harvested Remains and Risen Servants, Destruction's Charges, Fate's Ordained Ground AND Snares. The analysis found this problem in Chaos, wrote a hard session-zero warning about it, and never asked whether the same clause appears elsewhere — which its own exclusivity remit required. The consequences it missed are concrete: at L1-5, Destruction's Cascading Failure and The Unmooring detonate exactly one Charge; Fate's whole zone-engineering identity is one square and one Snare; Civilization's Trade Routes ('choose TWO of your active Foundations') is UNCASTABLE below level 6 because you can only sustain one Foundation; Order's Lawkeeper's Eye and Final Decree run on a single Edict. This is a systemic Tier-1 flattening of the deity atlas and it belongs in Part 6 above two of the three items that are there.
- IT NEVER READ TWO OF SOVEREIGNTY'S NINE TALENTS. Sovereign's Favor and Expose appear nowhere in the Sovereignty section, the Part-2 tie table, the Part-3 failure case or the Part-4 working — yet Sovereign's Favor is the tree's largest per-Action output ([Tier][Die] temp HP, ~9 at T2, on every Exalt) and Expose is a free L2 uncapped Investiture engine that also converts enemy misses into ally Reactive Strikes. A ledger whose central verdict is 'this tree has nothing else' must account for all nine cards.
- IT DID NOT APPLY ITS OWN BINARY-ADVANTAGE DISCOUNT CONSISTENTLY. It correctly discounts Blue's five disadvantage talents, Warrior's Defensive Position and Hunter's Fatal Thrust to one unit or zero — then crowns Order's Lawkeeper's Eye 'the best free buff in the game' on the strength of a party-wide ADVANTAGE grant, and lists Civilization's Bonds of Community and Power's Investiture of Command as advantage runners-up without the same haircut. The same discount would also have caught that Kneel's 'You have an advantage on attack tests against any Compelled, Frightened, or Weakened character' is redundant with any party advantage source.
- HIT PROBABILITY IS ABSENT FROM EVERY DAMAGE COMPARISON. Knowledge's 45, Civilization's 36 per round and Black's 18 all require weapon/Construct attacks to LAND, while Destruction's Set Charge and Fate's Snare cannot miss and Sovereignty's die-stepping is unconditional on success only. The analysis names reliability as Destruction's second and better claim, then ranks Knowledge and Civilization above it on raw expected damage without discounting either for the attack roll. Since the attack bonus and the Construct's to-hit are equipment and statblock facts outside the fence, the honest statement is that the top-three ordering cannot be settled inside the 365 talents, and what would settle it is the weapon table plus the Construct's attack bonus.
- IT DID NOT CHECK WHETHER WHITE IS TRULY VACUOUS IN SOVEREIGNTY. Sovereign's Favor's temp HP is '[Tier][Die]' with no stated governing rank, and Sovereignty is a Black/White tree. If White sizes that die, the 'White 3+ buys literally nothing but the gate' claim — which is finding #1's sharpest edge and is repeated in the hard session-zero warn — is wrong. The data does not say, and neither does the analysis; what would settle it is the authored rule in data/authored/deity-sovereignty.json.
- MINOR BUT REPEATED: the analysis quotes talents accurately but truncates the qualifying clause five times in a way that always favours its argument — Unweaving drops 'test Black vs. Spiritual. On success'; Sure Outcome drops 'When you use Opportunist'; Accumulate drops 'once per round'; Surgical Precision drops the Blue-vs-Physical test and the Blue 3+ gate; Defensive Position drops 'and allies can Brace behind your shield'. Each is individually small; the pattern is a systematic optimism about whichever talent the paragraph is arguing for.

### Surviving findings, in priority order

1. THE THREE ZERO-DAMAGE TREES ARE REAL AND ONE OF THEM IS A GENUINE FAILURE. leyline/Blue and heroic/Scholar contain the word 'damage' zero times across 50 talents; deity/Sovereignty has no damage formula on any of nine. Blue and Scholar each own a real, uncontested axis (obstruction/illusion; crafting and downtime). Sovereignty's owned axis — damage die-size stepping, verified 1-of-1 by grep — is the weakest of the three, and it is the only tree whose PATH DESCRIPTION promises a mechanic the tree does not contain: both intent sources sell a Decree radius where allies are elevated and enemies diminished, and no Sovereignty talent creates a zone, radius or aura. Act on the mis-selling first; it is a promise the data does not keep, not a balance question.
2. BLUE'S DESIGNED IDENTITY WAS BUILT INTO HEROIC/AGENT. The leyline design guide calls plot-die manipulation 'Blue's capstone identity' and 'choosing any Plot Die face is the ultimate Blue expression'. Blue has zero plot-die talents. Agent has the only reroll in 365 (Opportunist), the only face conversion (Sure Outcome), a second reroll (Double Down) and an ally-reroll (Watchful Eye), all at depth 0-1. leyline/White fields four raise-the-stakes/Complication talents and is the only other tree with a plot-die programme. This remains the cheapest high-value fix in the report and it does not require giving Blue damage.
3. THE 'UP TO YOUR TIER' CAP FLATTENS SEVEN DEITY TREES FOR THE ENTIRE LEVEL RANGE THIS REVIEW IS ABOUT. Chaos's Omens, Order's Edicts and Covenants, Civilization's Foundations, Death's Remains and Risen Servants, Destruction's Charges, Fate's Ordained Ground and Snares are all capped at 1 until level 6. Civilization's Trade Routes is literally uncastable below L6 (it requires two active Foundations). Chaos's Spreading Omen is strictly dominated by its own entry. Every 'detonate all your X' talent is a one-token talent. This is a single-clause fix with atlas-wide reach and it was invisible to every deterministic measure in the brief.
4. THE HEROIC ATLAS IS BACK-LOADED TO LEVEL 6 EXACTLY LIKE THE LEYLINE ATLAS, AND THE TOOLING SAYS OTHERWISE. 43 talents sit behind a non-colour rank-3+ gate while being listed below L6, 37 of them heroic — 6 or 7 per heroic tree. Any answer to the designer's question 2 ('do heroic and leyline paths feel similar in power at similar points along the tree?') built on the dossier's earliestLevel column is built on sand. Fix derive-dossiers.js to apply the rank-2-through-L5 cap to every skill, then re-ask the question.
5. IDENTITY LEAKS IN THE HEROIC ATLAS, MEASURED EXACTLY: 36 of 365 slots carry byte-identical text with another tree and 27 of the 39 duplicated-name slots are heroic. Mighty is verbatim in six trees, Collected in five, Hardy in seven under three variants, and 'increase your max and current focus by your tier' ships in three trees under three different names (Envoy's Composed, Leader's Focused Mind, Scholar's Clear Mind). All ten deity trees are clean on text. This is an authorship problem, not a power problem, and it is a large part of why heroic paths feel less distinct.
6. TWO DEITY ENTRY TALENTS ARE THE SAME CARD IN DIFFERENT TREES. Civilization's Lay Foundation and Fate's Ordained Ground are both Free Action, 1 Investiture, designate-a-square-for-the-scene, +1 to all defenses to an ally who begins its turn there, sustain up to your tier. They differ only in area (10 ft vs 5 ft) and Fate's Aid-range rider. The cosine-similarity tool cannot see this because the two trees' vocabularies differ, which makes it the best original finding in the analysis and the strongest argument for reading text rather than trusting the overlap matrix.
7. BINARY ADVANTAGE IS DELETING DESIGN WORK, AND THE STACKING PRIMITIVE ALREADY EXISTS. Confirmed instances in raw text: Hunter's Fatal Thrust 'gain two advantages', Warrior's Defensive Position 'adds two disadvantages... instead of one', Blue's five disadvantage talents, Power's Kneel advantage rider, Order's Lawkeeper's Eye party advantage, Civilization's Bonds of Community. The engine's edha-next-test-mod formula field already sums by term concatenation and is used by no talent. Converting the redundant grants to +/-1d6 formula modifiers recovers real value in at least six trees without new engine work. This is the highest-leverage of the three actions the analysis proposes and it is the one it got completely right.
8. SOVEREIGNTY'S ACTUAL DEFECT LIST, CORRECTED. Not 'it has nothing else' — Sovereign's Favor delivers ~9 temp HP per Exalt at Tier 2 and Expose is an uncapped free Investiture engine that also arms ally Reactive Strikes. The defects that survive contact with all nine cards are: (a) the promised Decree zone does not exist in any talent; (b) White is charged at 2+ to enter and 3+ for the Exalt line, is never tested, and sizes no damage die — verify whether it sizes Sovereign's Favor's [Tier][Die] before treating this as final; (c) both scene-long talents are level 6 behind rank 3 in two colours, so at L1-5 the whole tree is one-round buffs; (d) its headline lever changes an enemy's damage roll by 1-2 per die, which no player at the table will ever perceive. Fix the perception problem and the promise, not the power.
