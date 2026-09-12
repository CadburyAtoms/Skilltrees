# Can a no-damage path contribute? White and Blue in combat, tier by tier

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `nondamage-viability`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

I have everything I need. Writing the analysis.

# Can a no-damage path contribute? White and Blue in combat, tier by tier

## 0. Headline

**The zero-damage identity is not what is broken. The zero-*Action* identity is.**

leyline/White has **exactly one 1-Action talent and one 2-Action talent in 25** (Guiding Signal; Ordered Advance) — verified by hand against all 25 dossier entries, matching the census row `White 10 Pass / 6 Spec / 1 1Act / 1 2Act / 0 3Act / 0 Free / 7 Reac`. leyline/Blue has five Action-costing talents, and **three of them (Ghostly Walls, plus the Living Image embedded Action, plus the rank-3 half of the Illusion chain) are behind a Blue 3+ / level-6 wall**.

So the question "can a no-damage path contribute?" splits into two different answers:

- **White contributes, and the arithmetic is closer than anyone expects — but it contributes almost entirely on other people's turns.** At Tier 2 a White character's round is worth roughly *33 points of swing* (6 HP healed × ally, ~18 damage prevented, 9 spirit damage, one condition stripped) against leyline/Red's ~15–17 damage. White's failure is legibility and agency, not power.
- **Blue does not contribute at Tier 1, and the reason is not damage.** At level 1 a Blue character's only Action-cost talent is Phantom Double: 2 of 3 Actions and 2 of ~4 Investiture for a 1-HP decoy. Blue's actual teeth — Ghostly Walls + Absolute Stillness, a repeatable Speed-0 / disadvantage-on-Physical / no-Reactions lock — sit at level 6 behind a **five-talent chain**. Blue is the most back-loaded tree in the leyline atlas: **8 of 25 talents (32%) are level-6+**, against White's 4 of 25 (16%).

My recommendation, argued in full in §9: **no damage for White**; **one narrow damage talent for Blue, and only as the first-ever *consumer* of disadvantage** — but that is the fourth-most-important Blue fix, not the first.

---

## 1. What I verified, corrected, or refuted from the deterministic pass

| Claim in the brief | Verdict from the raw text |
|---|---|
| White has exactly 1 damage source (Retributive Guard) | **CONFIRMED.** Six talents contain the word "damage": Retributive Guard (source), Interposing Shield, Devoted Conduit, Shield Wall (mitigation), Shared Burden (redirection), Unbreakable Line (references damage as a DC input). 1 source / 4 mitigation-or-move / 1 reference. |
| Blue deals zero damage | **CONFIRMED** on both streams. No damage word in any offensive sense, no roll formula. |
| "~40% of White is trigger-gated — 7 Reactions plus 10 talents" | **The two halves of that sentence contradict each other** (7+10 = 17 = 68%, not 40%), and the census row says 13 / 52%. My own count below: **7 Reactions + 8 non-Reaction talents that require another creature to act first = 15 of 25 (60%)**, and **24 of 25 require a second body on the board at all**. Only **Hardy** — a generic +1 max HP passive shared verbatim across seven trees — functions with White alone in the room. |
| White has 15 Investiture costers and 0 regen; Blue the same; Black and Red have 2 regen and 9 costers | **Coster counts CONFIRMED** from `resource-economy.json`. **Red's regen count is WRONG — the classifier bug the brief invited me to find.** `Emotional Overload` is listed in `investiture.prod` *and* `investiture.cons`; its text is *"When a character within Attunement Range gains an advantage from any source, **spend 1 Investiture**. It gains a disadvantage on its next non-attack test."* It only spends. It is also listed in `advantage.prod` when its only advantage mention is a **trigger** — two misclassifications on one talent. **Red has ONE Investiture regen (Flashpoint), conditional on a Red talent hitting 2+ characters, once per round, and it requires Flame Surge or Arc Flash first.** Black's two are real but arrive at depth 3 / L4 (Predatory Patience, needs a Weakened target) and depth 4 / L6 (Predator's Due, needs a kill). |
| Blue↔Scholar 0.794 means "Blue and Scholar do the same thing" | **REFUTED as stated, confirmed as a symptom.** The function vectors diverge hard (Blue impose_disadvantage 5 / Scholar 1; Blue passive_always 12 / Scholar 4; Blue duration_scene 3 / Scholar 0; Scholar heal 2 / Blue 0). Blue is a combat controller with zero downtime talents; Scholar is 40% downtime. What they genuinely share is **an empty Tier-1 turn** — but for opposite reasons: Blue's Action-talents are level-gated, Scholar's are non-combat by design. Same symptom, different disease, and only Blue's is fixable by moving nodes. |
| The dossier `earliest L` column | **BUGGY for off-colour rank-3 gates.** Blue's **Baleful** is listed `earliest L4` on a `Persuasion 3+` prerequisite — but the rank cap is 2 until level 6, so it is L6. Same error in heroic/Agent's Close the Case (listed L4 on `Deduction 3+`). The calculator applies the rank-3→L6 rule only to the tree's own colour skill. This under-states Blue's back-loading by one talent and misstates several others across the atlas. |

**One new classifier concern:** `plot_die.prod` lists **leyline/White ×3** (Concordant Presence, Guiding Signal, Unity of Purpose) with **zero Blue entries** — which is correct, and which makes the design guide's line *"Plot Die manipulation is Blue's capstone identity"* a total miss. See §9.

---

## 2. leyline/White — what you actually do on your turn

### The structural fact everything follows from

White's 25 talents by action type, hand-verified:

- **Passive (10):** Guardian Stance, White Leyline Attunement, Disciplined Mind, Concordant Presence, Devoted Conduit, Unity of Purpose, Bound by Word, Hardy, Shield Wall, Unyielding Accord
- **Special (6):** Terms of Accord, Overwhelming Authority, Beacon of Stability, Collective Resolve, Unbreakable Line, Mending Aura
- **Reaction (7):** Pillar of Order, Counterpoint, Interposing Shield, Retributive Guard, Shared Burden, Shared Conviction, Voice of Authority
- **1 Action (1):** Guiding Signal
- **2 Actions (1):** Ordered Advance

**Against a 3-Action Slow turn, White has one talent it can point an Action at until level 4, and it is the worst-priced talent in the tree.**

### Levels 1–2 (2 talents, Tier 1, pool ~4, Draw Mana = +1)

Owned, realistically: Guardian Stance (L1) + Retributive Guard or Interposing Shield (L2).

```
▶  Draw Mana        +1 Investiture; every ally in range regains 1 HP (the White Key)
▶  Strike / Move / Gain Advantage / Aid   — no talent supports any of these
▶  Strike / Draw Mana again
⟲  Retributive Guard (1 Inv, test White vs Spiritual) → 1d6 spirit ≈ 3.5, ignores Deflect
    OR Interposing Shield (1 Inv) → move 10 ft, reduce an ally's damage by half [Die] ≈ 1.5
```

**The White player's *turn* at level 1–2 is Draw Mana and a weapon Strike their tree gives them nothing for.** Every talent they own executes on somebody else's turn. This is exactly the band session one sits in, which is why the problem surfaced now.

Two priced comparisons that make the Tier-1 experience concrete:

- **Interposing Shield** spends the round's only Reaction *and* 1 Investiture to reduce damage by **half [Die]** — at rank 2 that is `floor(1d6/2)`, mean **1.5**. Every character in the game already has **Dodge** (1 focus, Reaction) and **Aid** (1 focus, Reaction) for free. 1.5 damage is not a competitive use of the same slot.
- **Retributive Guard** is the better Reaction and it is the only damage in the tree: `(@tier)d(2*rank+2)` spirit, so 1d6 (3.5) at Tier 1, 2d8 (9) at Tier 2, **Deflect-ignoring**. Expected value at a ~55% contested-test rate: ~1.9/round at Tier 1, ~5/round at Tier 2.

### Levels 3–5 (3–5 talents, still Tier 1)

```
▶  Draw Mana  ★ Beacon of Stability rides it (1 Inv): remove ONE condition from an ally
▶  Guiding Signal (1 Action, 1 Inv): the next ally who tests against a designated target
   this round "raises the stakes" — i.e. rolls a Plot Die, which is as likely to hand the
   GM a Complication as to hand the party an Opportunity
▶  Strike / Move
⟲  Retributive Guard / Interposing Shield / Shared Burden
```

**Guiding Signal is badly priced against its own atlas.** heroic/Agent's **Risky Behavior** is *"Spend 1 focus to raise the stakes on your test"* — no Action, no Investiture, depth 0, L1. White pays **1 Action + 1 Investiture** to do the same for someone else, one test, once. That is a three-way worse price for a strictly conditional target.

**And White has an Opportunity mismatch inside its own tree.** It produces three plot-die effects — Guiding Signal (depth 0, L1), Concordant Presence (depth 1, L2), Unity of Purpose (depth 2, L3) — and its first *Opportunity spender* is **Collective Resolve at depth 3 (L4)** and **Mending Aura at depth 4 (L5)**. So for levels 1–3 White manufactures Plot Dice and has nothing to do with the Opportunity face, while eating the Complication face. The Coordination specialty is net-negative for its first three levels.

**Beacon of Stability is the genuinely good talent here** and nobody has said so: it is a **Special** riding Draw Mana, 1 Investiture, and it removes a condition. Per the primer, condition removal touches the most valuable category in a 3-action economy. It costs no Action at all.

### Level 6+ (Tier 2, rank 3, pool ~6, Draw Mana = +2)

```
▶  Draw Mana (+2)   allies regain 2 HP each  ★ Beacon (1 Inv): strip a condition
▶  Draw Mana (+2)   allies regain 2 HP each  ★ Mending Aura on an Opportunity + 1 Inv:
                    half 2d8 ≈ 4.5 HP to EVERY ally within 10 ft
▶  Strike / Move / Ordered Advance (2A, 1 Inv)
⟲  Retributive Guard (2d8 = 9 spirit) / Voice of Authority (disadvantage on an attack
    against an ally) / Unbreakable Line (Special, 3 Inv, ally at 0 HP drops to 1)
∞  Shield Wall: −4.5 damage on EVERY attack against 2+ adjacent allies, free, permanent
∞  Guardian Stance: +1 Deflect.  Unyielding Accord: +1 Cog/Spirit defenses to allies
```

**White's power is discontinuous at L6 for a reason nobody has named: it is not a new active, it is Shield Wall's number tripling.** `half [Tier][Die]` goes from `floor(1d6/2)` (mean **1.5**) to `floor(2d8/2)` (mean **4.5**). Against a fight where four enemy attacks land on two adjacent allies, that is **18 damage prevented per round, for free, with no action, no Reaction and no Investiture.** That is the single best line in the leyline atlas and it is a Passive.

**Scored honestly, a Tier-2 White round in a four-person party is worth roughly:**

| Component | Value/round |
|---|---|
| Draw Mana ×2 → 3 allies × 2 HP × 2 draws | 12 HP restored |
| Shield Wall on 4 incoming attacks | ~18 damage prevented |
| Retributive Guard | ~5 expected spirit damage |
| Beacon of Stability | 1 condition stripped |
| **Total swing** | **~35 points, plus a condition** |

Against leyline/Red's honest Tier-2 round (Draw Mana +2, Searing Bolt 2d8 = 9 energy + Kindle's Red modifier, Arc Flash Special for half 2d8 = 4.5 on a second target): **~15–17 damage**.

**On arithmetic, White out-contributes Red at Tier 2 by roughly 2:1.** That is the single most important number in this analysis, and it is the reason I do not recommend giving White damage.

---

## 3. leyline/Blue — what you actually do on your turn

Blue's 25 by action type, hand-verified against the census: **9 Passive, 5 Special, 3 1-Action, 2 2-Action, 1 Free, 5 Reaction.**

### Levels 1–2 (Tier 1, pool ~4)

The three depth-0 choices are **Calculated Patience (Passive), Forewarned (Passive), Phantom Double (2 Actions, 2 Investiture)**.

```
▶▶ Phantom Double (2 Inv): one decoy with 1 HP; each enemy tests Perception vs your
   Cognitive defense. Any hit destroys it.
▶  Draw Mana (+1; advantage on your next Cognitive test)
⟲  nothing owned
```

Or, if the player picked either Passive at level 1: **three standard actions and nothing else.**

**This is the emptiest level-1 turn in the 365-talent atlas.** Two of Blue's three entries do nothing on your own turn, and the third burns two-thirds of your Slow turn and half your Investiture pool on a 1-HP object.

**Blue's own Key is partly redundant with its own entry.** The Blue Attunement grants advantage on your next Cognitive test; **Calculated Patience** grants advantage on your first test on a Slow turn. Per the primer's `edhaNextModFoldMode` — advantage is boolean-OR'd — if you take a Slow turn and Draw Mana, both fire on the same roll and **the second is worth literally zero**. Blue's depth-0 Foresight pick is anti-synergistic with the free Key it comes with.

### Levels 3–5

```
▶  Phantom Barricade (1 Action, 1 Inv): a wall with 2[Die] = 2d6 ≈ 7 HP, gives cover,
   blocks movement.  This is Blue's first genuinely repeatable Action-cost play.
▶  Draw Mana (+1)
▶  Read Intent (L4, 1 Action, 1 Inv, test Blue vs Cognitive): learn one creature's next action
◇  Holographic Illusion (Free, 1 Inv): a static illusion up to [Size] = 5 ft
★  Pattern Recognition / Reactive Analysis (1 Inv each): ONE binary disadvantage/advantage
⟲  Redirect Momentum (1 Inv, contested Blue vs Athletics): move a creature 5 feet
```

Three problems in that block, all checkable:

1. **Redirect Momentum's number is broken at Tier 1.** `[Size]` is 2.5 ft at rank 1 and **5 ft at rank 2**. So the talent spends the round's only Reaction, 1 Investiture, and a contested test to shove a creature **one square**, or shave 5 ft off its movement. It is the worst rate in the tree.
2. **Pattern Recognition has a dead enabler.** It triggers on *"when you succeed on a **Cognitive test** against a character"* at depth 1 (L2) — but Blue's first talent that makes a test against a character is **Read Intent at depth 3 (L4)**, and it is not established anywhere in the data that "test Blue" *is* a Cognitive test (see §10). At levels 2–3, Pattern Recognition is very likely inert.
3. **Blue's disadvantage stack self-cancels.** `Pattern Recognition` imposes disadvantage on *"their next test this round"*; `False Premise` imposes disadvantage on *"their next test"*. Both live in the Calculation specialty, both hang off nodes a Calculation player buys. Fired on the same target in the same round, **the second is worth zero** by the binary rule. Only **Probability Cascade** ("next **two** tests") extracts two units, because the two tests are separate rolls.

### Level 6+ — Blue's actual identity

```
▶  Ghostly Walls (1 Action, 2 Inv, test Blue vs Cognitive):
   target's movement rate becomes 0 until end of your next turn
   ∞ + Absolute Stillness: that target ALSO has disadvantage on Physical tests
     and CANNOT TAKE REACTIONS
▶  Draw Mana (+2)
▶  spare
```

**This is a repeatable, 100%-uptime, single-target soft-Restrain plus reaction denial, and it is the best control effect in the leyline atlas.** Per the primer, *"action denial is the most valuable category in a 3-action economy."* It is worth far more than 2d8 of damage.

It arrives at level 6 behind the chain **Phantom Double → Redirect Momentum → Phantom Step → Ghostly Walls → Absolute Stillness** — five talents, i.e. five of the six talent slots a level-6 character has. And it costs 2 of the ~5–6 Investiture in the pool, every round, forever.

**Blue's real disease is a five-level dead zone, not a missing damage die.**

---

## 4. Resource ceiling — the arithmetic, and the correction that matters

**Setup, from the primer:** Investiture max = `2 + max(AWA, PRE)` ≈ 4 at L1, ~6 at L6 after the L3/L6 attribute points. Draw Mana = 1 Action → Tier Investiture (1 at L1–5, 2 at L6–10).

### The correction: White's spends and White's draws are on *different clocks*

This is the finding the "15 costers / 0 regen" census hides, and it is the strongest defence of White's design.

**White's Investiture sinks are 7 Reactions and 6 Specials. Its Investiture source is an Action.** So White does not compete with itself:

| Tier | White's steady state |
|---|---|
| Tier 1 (L1–5) | **1 Draw Mana Action per turn (+1) exactly funds 1 Reaction per round (−1). Forever. Pool never depletes. Two Actions still free.** |
| Tier 2 (L6–10) | **1 Draw Mana (+2) funds 1 Reaction + 1 Special (−2) per round. Forever. Two Actions still free.** |

**White's economy is precision-tuned to the 1-Reaction-per-round hard cap.** It cannot run dry, because it cannot legally spend faster than it draws. Nothing in the docs records this, and the deterministic census (15 costers / 0 regen — the worst ratio in the atlas alongside Blue) reads it as a catastrophe when it is actually an elegance.

**Second-order point:** because Draw Mana triggers the White Key regardless of whether the Investiture is banked, **Draw Mana is never a wasted Action for White even at a full pool** — the party still heals. White is the only colour of which that is true. (Compare Red, whose Key *charges* you your Reaction to draw.)

### Blue's steady state, by contrast

Blue's sinks are split across Actions *and* Reactions, so Blue *does* compete with itself:

| Tier | Blue's steady state |
|---|---|
| Tier 1 | Running Phantom Barricade (1 Action, 1 Inv) **and** a Reaction (1 Inv) needs 2 Inv/round against a draw rate of 1. **Pool 4 supports ~4 rounds of both, then Blue drops to one spend per round — 50% Action uptime — indefinitely.** |
| Tier 2 | Ghostly Walls costs 2 Inv; Draw Mana returns 2. **The lock is exactly self-funding at 2 of 3 Actions — and leaves zero Investiture for any Reaction.** A level-6 Blue running the lock cannot also Counterspell in the same round. |

That last line is a real constraint on the "Blue is fine at L6" story and should be checked at the table.

### Against Black and Red

- **Black:** 9 costers, 2 regen — but Predatory Patience is depth 3 / L4 and requires a **Weakened** target, and Predator's Due is depth 4 / L6 and requires a **kill**. Black's economy is no better than White's before level 4.
- **Red:** 9 costers, **1** regen (Flashpoint, once/round, conditional on a Red talent hitting 2+ characters, gated behind Flame Surge or Arc Flash). And **Red's sinks are Actions** — Searing Bolt is 1 Action + 1 Investiture — so Red trades one drawing Action for one spending Action: **50% uptime, the primer's own worst case**, plus the Red Key strips the Reaction on every draw.

**Conclusion of §4: on the resource ceiling, White is the best-designed leyline economy in the game and Blue is mid-table. The census metric was measuring the wrong thing.**

---

## 5. Trigger dependency — verified count, and why the count is the wrong question

**Category A — requires another creature to act, roll, or be hit first (15 of 25 = 60%):**
Pillar of Order⟲, Counterpoint⟲, Interposing Shield⟲, Retributive Guard⟲, Shared Burden⟲, Shared Conviction⟲, Voice of Authority⟲ (all seven Reactions), plus Concordant Presence, Devoted Conduit, Unity of Purpose, Bound by Word, Unbreakable Line, Shield Wall, Guiding Signal (payoff), Disciplined Mind.

**Category B — requires a second body present but not an action (9):** Terms of Accord, Guardian Stance, White Leyline Attunement, Unyielding Accord, Mending Aura, Ordered Advance, Beacon of Stability, Collective Resolve, Overwhelming Authority.

**Category C — works with White alone in the room (1):** **Hardy.** A generic `+1 max health per level` passive that ships verbatim in seven trees. It is not White content.

So: **24 of 25 White talents require a second body, and 15 require that body to do something specific first.** The brief's ~40% is too low; the census's 52% is close; 60% is the defensible number by the strict reading.

**But the count is the wrong metric, and this is my second-most-important finding.**

White's trigger *frequency* is the highest in the game. Its Reactions fire on **"an ally takes damage"** (Interposing Shield, Retributive Guard, Shared Burden) — an event that occurs in every round of every fight. Compare Blue's five Reactions:

| Blue Reaction | Trigger | Fires against three non-magical melee brutes? |
|---|---|---|
| Counterspell | a character **spends Investiture to activate a talent** | **Never** |
| Anticipate | you/a networked ally is targeted by an **influence effect** | **Never** |
| False Premise | a character **succeeds on a Cognitive test** | **Rarely** |
| Intercept | a **Forewarned** prediction comes true | Only if the guess lands |
| Redirect Momentum | a character **moves** | Yes |

**Blue is trigger-*fragile*: four of its five Reactions can be dead for an entire encounter depending on the adversary's kit. White is trigger-*reliable*: its Reactions cannot fail to have a legal target in a real fight.** The 60% figure is a description of White's design, not an indictment of it. The indictment is that White is 60% trigger-gated *and* has only two Action-talents — the two facts together mean the player has nothing to do while waiting.

**One genuine casualty of the Reaction cap:** seven Reactions competing for one slot means Interposing Shield, Retributive Guard, Shared Burden, Shared Conviction and Voice of Authority all trigger on overlapping events ("an ally is attacked / hurt / about to fail"). At level 6+, a White player owning four of them uses one and the other three are sunk talent slots. **Devoted Conduit and Shield Wall are the exception and that is why they are the tree's best talents — they are free Passives that fire without competing for the slot.**

---

## 6. White's damage-word audit — verified, with two mispricings found

The first-pass finding is correct. All six hits, with the numbers:

| Talent | Text | Classification | Value |
|---|---|---|---|
| Retributive Guard | *"deal [Tier][Die] spirit damage to the attacker"* | **SOURCE** | 3.5 (T1) → 9 (T2), Deflect-ignoring |
| Interposing Shield | *"reduce that damage by half [Die]"* | Mitigation | **1.5 (T1) → 2.0 (T2)** |
| Devoted Conduit | *"reduce that damage by half [Tier][Die]"* | Mitigation | 1.5 (T1) → 4.5 (T2) |
| Shield Wall | *"attacks against them deal half [Tier][Die] less damage"* | Mitigation | 1.5 (T1) → 4.5 (T2) |
| Shared Burden | *"take half that damage in their place"* | **Redirection, not reduction** | 0 party-net |
| Unbreakable Line | *"DC equal to 1/2 of the damage taken"* | Reference only | — |

**Two authoring problems fall straight out of that table.**

**(a) Interposing Shield uses `half [Die]` where its two siblings use `half [Tier][Die]`.** At Tier 1 they are identical (one die). At Tier 2 Interposing Shield mitigates **2.0** while Shield Wall and Devoted Conduit — which are **free, permanent Passives** — mitigate **4.5**. So at level 6 the Bulwark specialty's only mobile Reaction costs the round's Reaction *plus* 1 Investiture to do **less than half** what the free Passive sitting next to it does automatically. This looks like a slip, not a decision.

**(b) Shared Burden reduces party damage by exactly zero.** *"take half that damage in their place"* — the ally takes half, you take half, party total unchanged. It costs **2 Investiture** (two full rounds of Tier-1 Draw Mana) and the round's only Reaction to *move* damage. Its only real uses are keeping a low-HP ally above 0 and (if the rules allow — see §10) re-applying your Guardian Stance Deflect to the transferred half. It also gates on **Strength 3+**, an attribute a White build — whose Investiture pool is `2 + max(AWA, PRE)` — has no other reason to buy.

**(c) A third, separate one: Devoted Conduit's trigger essentially never fires.** *"When an ally within Attunement Range takes damage **intended for another creature**"* — damage redirection exists in exactly three places across all 365 talents: White's own **Shared Burden** (which redirects to *you*, not to an ally), deity/Order's **Shoulder the Oath**, and deity/Power's **Mantle of the Aspirant**. A White-only character can never cause this state. It is dead text in a depth-2 slot.

**(d) Unbreakable Line has an inverted difficulty curve.** *"test White with a DC equal to 1/2 of the damage taken."* It is the tree's only 3-Investiture talent and it gets **harder exactly as the hit gets more lethal** — a 20-damage hit is DC 10, a 40-damage hit is DC 20. The death-save that matters most is the one you fail.

---

## 7. The comparison that actually matters: not White vs Red — **White vs Warrior**

The designer's framing ("no damage talents") points at Red. The damaging comparison points at **heroic/Warrior**, because Warrior does White's job *and* damage, for free, at depth 0.

| | leyline/White, depth 0, L1 | heroic/Warrior, depth 0, L1 |
|---|---|---|
| Ally protection | **Guardian Stance:** +1 Deflect to you and **one adjacent ally**. Free, permanent. | **Stonestance:** +1 Deflect to **you**, and *"enemies within your reach must spend an **additional Action** to attack your allies who aren't in Stonestance."* Free, permanent. |
| Cost | 1 talent slot | 1 talent slot, 1 Action to enter (once) |
| Also does | nothing | is on the game's best damage chassis |

Stonestance taxes enemies an **Action** — the most valuable currency in the game per the primer — to attack any of your allies. Guardian Stance grants +1 Deflect to one of them. And at depth 1–2 Warrior adds **Defensive Position** (*Brace gives two disadvantages instead of one*) and **Formation Drills** (*allies within 10 ft who Brace get it too*) — free Passives that out-protect anything White owns before level 6.

**Now the offence side, with the honest caveat.** heroic/Warrior at level 2 with Combat Training + Devastating Blow:

- **Devastating Blow:** 2 Actions, **no resource cost**, melee weapon attack + `(2 + max(@tier−2, 0))d8` = **2d8 (mean 9) at every level from 2 to 10** — the flat-heroic-scaling fact from the brief, confirmed in the formula.
- **Mighty** (depth 1, L2, free Passive): *"for each action spent, deal extra damage equal to 1 + your tier"* — **+4** on a 2-Action attack at Tier 1.
- So a level-2 Warrior's headline turn is roughly `weapon + 9 + 4` — call it **~20 on a hit, ~12 expected**, every round, forever, for zero resources.

Against that same round:

| Tree | Expected contribution, level 2, per round |
|---|---|
| heroic/Warrior | **~12 damage**, no resource cost, indefinitely |
| leyline/Red | ~2 expected energy damage (Searing Bolt, 1 Action + 1 Inv, at 50% Action uptime) |
| leyline/White | **~3 HP healed per ally + ~1.5–3 mitigated + ~1.9 expected spirit** |
| leyline/Blue | **a 7-HP wall, or nothing** |

*(Weapon dice are outside the 365-talent fence; I have assumed a 1d8 weapon with a +3 attribute. The ratio is not sensitive to that assumption — Warrior's 2d8+4 talent contribution alone is 13, all of it from talents.)*

**But the comparison flips at Tier 2, and this is the finding that should stop any rush to add damage to White:**

| | Devastating Blow (Warrior) | Retributive Guard (White) |
|---|---|---|
| Damage | 2d8 = 9, **flat at all levels** | [Tier][Die] = **1d6 → 2d8 = 9 at L6** |
| Type | Deflect-**reduced** | Spirit — **ignores Deflect** |
| Cost | **2 of your 3 Actions** | **1 Reaction + 1 Investiture** |
| Level | 2 | 2 |

**At level 6, White's single damage talent delivers the same die expression as the heroic atlas's flagship damage talent, in a better damage type, off a Reaction instead of two-thirds of your turn.** White's problem at Tier 2 is emphatically not the *size* of its damage. It is that the damage only fires when an adjacent ally is hit, only once per round, and only on a successful contested test.

### The structural diagnosis

**Warrior and Red convert Actions into output at a good rate because their talents ride on Strike — an action the character already has.** Mighty, Devastating Blow, Swift Strikes, Wit's End, Shattering Blow all multiply an existing action.

**White converts Actions into output only through Draw Mana.** Nothing in White rides on Strike, on Move, or on any standard action except Aid. **Blue rides on nothing at all.** That is why the third Action of a White or Blue Slow turn is always wasted, and why the fix is not a damage number.

---

## 8. Bugs, mispricings and dead text found in the raw White and Blue texts

A worklist, most-load-bearing first. Every one is checkable against the dossier line cited.

1. **`Emotional Overload` (Red) is misclassified as an Investiture and advantage producer** in `resource-economy.json`. Its text only spends Investiture and only *consumes* advantage as a trigger. Corrected regen census: Black 2 (both late/conditional), **Red 1 (conditional)**, White 0, Blue 0, Green 0. The White/Blue-vs-Red economy gap the brief implies is roughly half what it looks like.
2. **The dossier `earliest L` column ignores off-colour rank-3 gates.** Blue's **Baleful** (`Persuasion 3+`) is listed L4; it is L6. Blue's true level-6 wall is **8 of 25 (32%)**, not 7.
3. **White's `Interposing Shield` uses `half [Die]` where `Devoted Conduit` and `Shield Wall` use `half [Tier][Die]`** — it mitigates 2.0 at Tier 2 against their 4.5, while costing a Reaction and 1 Investiture that they do not.
4. **White's `Devoted Conduit` triggers on a state a White-only character cannot create** (damage "intended for another creature"; only three redirection effects exist in 365 talents and White's own redirects to *you*, not to an ally).
5. **White's `Shared Burden` is party-net-zero damage** for 2 Investiture and the round's Reaction, gated behind `Strength 3+` on a Presence/Awareness caster.
6. **White's `Unbreakable Line` gets harder as the hit gets deadlier** (DC = half the damage taken).
7. **White's `Guiding Signal` costs 1 Action + 1 Investiture** for an effect heroic/Agent's `Risky Behavior` delivers for **1 focus and no Action** — and it hands the GM a Complication face as often as it hands the party an Opportunity.
8. **White's plot-die production precedes its Opportunity sinks by three levels** (producers at depth 0/1/2, first sink at depth 3).
9. **Blue's `Redirect Momentum` moves a creature 5 feet** for a Reaction + 1 Investiture + a contested test at Tier 1 (2.5 ft at rank 1).
10. **Blue's `Pattern Recognition` (depth 1, L2) triggers on a Cognitive test the tree does not supply until depth 3 (L4)** — and it is not established that "test Blue" is a Cognitive test at all (§10).
11. **Blue's `Pattern Recognition` and `False Premise` both impose disadvantage on "their next test"** — fired on the same target in the same round, the second is worth zero.
12. **Blue's Key and `Calculated Patience` collide.** Draw Mana on a Slow turn grants advantage on your next Cognitive test; Calculated Patience grants advantage on your first test that turn. On the same roll, one of them is free of charge and the other is a talent slot.
13. **Blue's `Ghostly Walls` requires "a character you can influence"** — an undefined gate on the tree's only hard-control line (§10).
14. **Blue's `Phantom Barricade` barely scales:** wall HP `2[Die]` = 2d6 (7) at rank 2 → 2d8 (9) at rank 3. A 9-HP wall at level 10 is one attack.
15. **`Collective Resolve` and `Mending Aura` both carry authored-text divergences** already flagged in the dossier; **Mending Aura's is material** — the authored (winning) text costs **an Opportunity AND 1 Investiture**, the source prose costs Opportunity only. The source prose owes a fix.

---

## 9. The recommendation: should Blue and/or White get damage?

### The case FOR adding damage (stated as strongly as it deserves)

1. **The identity is already impure.** White *has* a damage talent — Retributive Guard, `[Tier][Die]` **spirit**, the second-best damage type in the game, at depth 1. "White deals no damage" was never the design. Adding a second is not a violation of a principle; it is an adjustment to an existing exception.
2. **Legibility is a real design requirement, not a player failure.** The player who prevents 18 damage watches nothing happen. The player who deals 9 sees a number. White's ~35-point Tier-2 swing is *invisible* — every component of it is either a heal spread across four sheets, damage that didn't happen, or a condition that got quietly removed. That is a genuine problem and it is not solved by telling the player the arithmetic.
3. **Blue's level 1–5 is indefensible on any reading.** Two of three entries do nothing on your turn; the third burns 2 of 3 Actions and half the pool for a 1-HP object. Whatever the right fix is, "leave it" is not it.

### The case AGAINST (which I find stronger)

1. **The arithmetic does not support it for White.** Tier 2: White ~35 points of swing/round vs Red's ~15–17 of damage. Tier 1: White ~7–8 vs Red's ~5–7. **Adding damage to White does not close a gap; it opens one in the other direction.**
2. **It would make the overlap problem worse, and overlap is what this review exists to find.** The functional-similarity census already reports **Black↔Red 0.920, Blue↔Red 0.869, White↔Red 0.810**. Every one of those numbers goes *up* if White and Blue get damage lines. Meanwhile **White↔Leader sits at rank 161 of 210 (0.269)** — the atlas's differentiation is currently coming *from* the colours that do different things.
3. **The leyline design guide's rule 7 is explicit** — *"Talents must not bleed across color lines… Blue manipulates probability; Red escalates momentum."* The colour wheel is the product.
4. **White has nowhere on-identity to put damage.** The obvious slot is the **Accord** specialty (authority made binding → punish the oath-breaker). But **deity/Order already owns exactly that mechanic** — its `Edict` deals spirit damage when a bound enemy takes a prohibited action — and **White is Order's gate colour**. Building it into White would deepen the White↔Order overlap while doing nothing about the finding that **White is gated by four deity trees (Order, Civilization, Fate, Sovereignty) and mechanically rewarded by none of them.**

### The recommendation

> **WHITE: no damage. Fix the Action problem, the Reaction pricing, and the plot-die loop.**
> **BLUE: fix the level-6 wall first. Then, and only if damage is still wanted, add exactly one talent — and make it the first *consumer* of disadvantage in the game.**

### WHITE — five concrete changes, none of them damage

**W1 — Rule on Draw Mana first, because it changes everything else.** Neither the White Key (*"When you Draw Mana, allies… regain health equal to your tier"*) nor **Beacon of Stability** (*"When you Draw Mana, spend 1 Investiture to remove one condition"*) carries a once-per-round limiter, and the primer's Draw Mana entry states no per-turn cap. If Draw Mana is repeatable, a Tier-2 White's three-Action turn is `Draw ×3` = **+6 Investiture, 6 HP to every ally, and three conditions stripped for 3 Investiture — net +3 Investiture.** That is an enormous turn and it may be an unintended stack. **Either clamp the Key and Beacon to once per round, or bless the stack and tell the player it is the play.** This is the single highest-value ruling in the whole White question, and until it is settled every other White number is provisional.

**W2 — Give White one depth-0, 1-Action, pre-emptive mitigation talent.** The Bulwark player needs something to *do* on turn one that they can point at. Proposed shape, 24 words, on-standard:

> *"Spend 1 Investiture. Until the start of your next turn, the first attack against each ally within Attunement Range deals [Die] less damage."*

At rank 2 that is ~3.5 off the first attack on each of three allies — **~10 damage prevented for 1 Action + 1 Investiture**, which beats Searing Bolt's 3.5 and is unmistakably White. It converts White's identity from *react to the hit* into *put the shield up*, which is the legible version of the same fantasy.

**W3 — Reprice Guiding Signal.** Either drop it to a Special (*"When an ally within Attunement Range tests, spend 1 Investiture — they raise the stakes"*), or replace the Plot Die payload with a flat `+[Die]` to the ally's result. A flat number is legible, cannot hand the GM a Complication, and stops the talent from being three times worse than heroic/Agent's `Risky Behavior`.

**W4 — Move an Opportunity spender to depth 1.** White manufactures Plot Dice from level 1 and cannot spend an Opportunity until level 4. Fix the ordering or the Coordination specialty is net-negative for its first three levels.

**W5 — Rewrite Devoted Conduit's trigger** to something White can cause: *"When an ally within Attunement Range takes damage while adjacent to another ally, reduce that damage by half [Tier][Die]."* Same effect, same identity (formation), and it actually fires.

**W6 (optional, if White must contribute to the party's damage number without holding a damage die):** make White multiply *ally* damage. Depth 2, Passive:

> *"Allies within Attunement Range who are adjacent to another ally deal +[tier] damage on their first attack each round."*

+1 × three allies at Tier 1, +2 × three at Tier 2 — free, permanent, countable at the table, and White never rolls damage. **Precedent exists inside the White-Blue family: deity/Order's `Concord` does exactly this for Covenant allies at +Presence.** This is my preferred answer to the legibility complaint, because it gives the player a number to point at without touching the colour wheel.

### BLUE — four changes, in priority order

**B1 — Move the lock earlier. This is the whole fix.** `Ghostly Walls` is Blue's real identity (the tree *denies the board*; the intent prose's "bending probability" is not what the talents do) and it is the tree's entire power budget, sitting at level 6 behind a five-talent chain. **Change its gate to Blue 2+ and shorten its duration from "until end of your next turn" to "until the start of your next turn"** — one enemy turn instead of two. A Tier-1 Blue then has a repeatable Action-cost lock from level 3–4, and the five-level dead zone closes. Pull **Absolute Stillness** in behind it at Blue 2+ as well, so the disadvantage-on-Physical / no-Reactions rider is a Tier-1 reward rather than a Tier-2 one.

**B2 — Fix the two broken numbers/triggers.** `Redirect Momentum`'s 5 ft should be `[Size] × tier`, a flat 10 ft, or — most elegantly — *"reduce its remaining movement to 0,"* which makes it a Tier-1 feeder for Absolute Stillness and turns two weak talents into one line. `Pattern Recognition` should re-trigger on *"when you succeed on any test against a character"* so it is not waiting on a talent two depths deeper.

**B3 — Give Blue the Plot Die. This is the largest intent-vs-text gap in the tree and the cheapest fix on this list.** The leyline design guide says, verbatim: *"Plot Die manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue expression."* **Blue has zero plot-die talents** — the census's `plot_die.prod` lists White ×3, Red ×1, Agent ×2, Leader ×1, Scholar ×1, Fate ×1, and no Blue at all. Meanwhile **heroic/Agent's `Sure Outcome`** (*turn any Complication into an Opportunity*) is the exact effect the guide reserves for Blue. A depth-2/3 Blue Special that lets you choose a Plot Die face is legible, agency-granting, thematically owned, and adds no damage. **It is the single change that would most make Blue feel like Blue.**

**B4 — If damage is still wanted, make it the first consumer of disadvantage in the game.** Across all 365 talents, disadvantage has **14 producers and ZERO consumers**, and Blue owns 5 of the 14 — its signature output currently has no partner anywhere in the ecosystem. Proposed shape, depth 2, Special, 1 Investiture:

> *"When a character fails a test that had disadvantage you imposed, it takes half [Tier][Die] keen damage."*

Half 1d6 ≈ 1.75 at Tier 1, half 2d8 = 4.5 at Tier 2. It is small, Deflect-*reduced* (so it never competes with Red's energy line or White's spirit), it fires only off the thing Blue already does, and it closes an ecosystem-wide resource hole rather than opening a new one.

*Second-safest Blue damage shape, if more is wanted:* make **Counterspell** deal feedback — *"the talent fails, and the target takes damage equal to the Investiture it spent."* Thematic (*"every talent has a flaw in its logic"*), self-limiting, and it only ever fires against casters, so it can never become Blue's main line.

### What "pays for itself" would look like — a falsifiable test

A no-damage tree pays for itself when its player answers **yes** to all three, at **every** level band:

1. **"On my turn I spent at least one Action on a talent from my own tree."**
   White: **NO** at L1–5 (only Guiding Signal, and it is mispriced). Blue: **NO** at L1, marginal L2–5.
2. **"What I did produced a number someone wrote down."**
   White: only the Draw Mana heal. Blue: **nothing until L6.**
3. **"If I hadn't been here this round, the round would have gone differently in a way somebody noticed."**
   White: **YES** from L2, emphatically **YES** from L6 (Shield Wall). Blue: only when its narrow triggers fire.

**White fails (1) and mostly (2). Blue fails (1), (2), and frequently (3) below level 6.** Neither failure is a damage failure. Every fix in W1–W6 and B1–B4 targets one of the three tests directly.

---

## 10. What I could not settle inside the fence, and what would settle it

1. **Is Draw Mana repeatable within a turn?** Load-bearing for every White number in this analysis, and for whether the Key + Beacon of Stability stack is a design or an exploit. **Settled by:** `module-src/scripts/engine/52-green-instinct.js` (`edhaDrawMana`) and the leyline-revision-guide §Key Mechanic. Outside the 365-talent fence but inside the repo.
2. **Is "test Blue" a Cognitive test?** Load-bearing twice: it decides whether the Blue Attunement Key does anything for a Blue character, and whether `Pattern Recognition` has an enabler before level 4. No talent text answers it. **Settled by:** the skill-to-attribute mapping in `data/leyline.json` or the cosmere-rpg system's skill table.
3. **What does `Ghostly Walls`' "a character you can influence" exclude?** It gates Blue's only hard-control line. If it excludes mindless, constructed or influence-immune adversaries, Blue's Tier-2 identity has a hole in it. **Settled by:** the Influence subsystem definition in the system rules, plus a ruling on whether it means *susceptible to Influence* or *within reach of an Influence attempt*.
4. **Does Deflect apply again to damage transferred by `Shared Burden`?** Decides whether White's Guardian Stance makes the redirect worth anything at all. **Settled by:** a table ruling, or the engine's damage-application order.
5. **Is `1d6` a lot?** Whether White's 3.5 spirit at Tier 1 or Blue's 7-HP wall is meaningful depends on adversary HP, Deflect and defenses, which the scope fence puts out of reach. **Settled by:** one bench run against `data/adversaries.json` at levels 2, 5 and 7 — explicitly out of scope here, and the only thing that would convert this analysis's ratios into verdicts.
6. **Does the once-per-turn same-weapon Strike restriction apply as I have assumed?** I inferred it from heroic/Warrior's `Swift Strikes` (*"make a second Strike with the same weapon"*) and heroic/Hunter's `Unrelenting Salvo`. If it does *not* exist, Warrior's per-round damage roughly doubles and the §7 gap widens sharply. **Settled by:** the cosmere-canon-reference §Standard Actions entry for Strike.

## Adversarial verification

**25 load-bearing claims checked: 10 confirmed, 7 corrected, 8 refuted.**

The analysis lands three genuinely new, checkable finds — the `Emotional Overload` classifier bug (Red has ONE Investiture regen, not two), the `earliest L` calculator's blindness to off-colour rank-3 gates, and Blue's zero plot-die talents against the guide's "Blue's capstone identity" — and its structural diagnosis (White's problem is one 1-Action talent in 25 and seven Reactions contesting one slot, not zero damage) survives intact. But its headline arithmetic, "White out-contributes Red at Tier 2 by roughly 2:1", is REFUTED on four independent grounds: the ~35-point White round needs 9-10 talents (level 9-10), not the level-6 build it is presented as; 12 of those 35 points depend on a Draw-Mana-repeatability ruling the analysis itself flags as unsettled; the 18 points of Shield Wall mitigation assume four enemy attacks per round on two adjacent allies, which is an out-of-scope adversary assumption; and the Red round omits a second Searing Bolt (Draw Mana +2 funds two 1-Investiture bolts indefinitely at Tier 2) and omits Momentum's Edge, which the brief explicitly handed over as Red's real ceiling. Worse, the analysis identifies the off-colour rank-3 earliest-L bug in §1 and then falls into it in §7: its centrepiece "level-2 Warrior deals ~12 damage" rests on Devastating Blow, whose prerequisite is `Athletics 3+` — earliest L6, not L2 — and it credits a level-2 character with three talents. The bug is also 20x wider than the analysis says: 41 talents atlas-wide are mis-levelled, 36 of them heroic, which overturns the brief's structural premise that heroic trees are fully reachable by L4-L5 and is directly load-bearing for the designer's question 2. Two exclusivity claims fail: Blue's Ghostly Walls + Absolute Stillness is NOT "the best control effect in the leyline atlas" (Black's Hollow Command denies ALL actions for a turn at depth 0 / L1), and damage redirection exists in FOUR talents, not three (deity/Life's Lifeline is missing). The recommendation "White: no damage, fix the Action problem" may still be right — the overlap, colour-wheel and White-vs-deity-Order arguments in §9 are independent of the broken arithmetic — but it is no longer supported by the numbers the analysis used to support it, and those numbers must be withdrawn.

### Claims

1. **CONFIRMED** — leyline/White has exactly one damage source (Retributive Guard); six talents contain the word 'damage', 1 source / 4 mitigation-or-move / 1 reference.
   - Evidence: grep 'TEXT:.*damage' leyline-White.md returns exactly 6 lines: Interposing Shield (reduce), Retributive Guard ('deal [Tier][Die] spirit damage to the attacker', ROLL FORMULA `(@tier)d(2 * @skills.white.rank + 2)` type=spirit), Devoted Conduit (reduce), Shared Burden (redirect), Shield Wall (reduce), Unbreakable Line (DC reference). Blue returns 0.
2. **CONFIRMED** — White's action types: 10 Passive / 6 Special / 7 Reaction / 1 one-Action (Guiding Signal) / 1 two-Action (Ordered Advance).
   - Evidence: Hand-counted against all 25 dossier entries; matches the census row exactly. Guiding Signal (1 Action, depth 0, L1) and Ordered Advance (2 Actions, depth 3, L4, Leadership 2+) are the only two Action-cost talents in the tree.
3. **CONFIRMED** — `Emotional Overload` (leyline/Red) is misclassified in resource-economy.json as an Investiture producer AND as an advantage producer; Red therefore has ONE bonus Investiture regen (Flashpoint), not two.
   - Evidence: Text: 'When a character within Attunement Range gains an advantage from any source, spend 1 Investiture. It gains a disadvantage on its next non-attack test.' It only spends Investiture and only reads advantage as a trigger. resource-economy.json investiture.prod lists {"leyline/Red": ["Flashpoint", "Emotional Overload"]} and advantage.prod lists it under leyline/Red as well. This is the third classifier bug the brief predicted; the analysis found it.
4. **CONFIRMED** — plot_die.prod lists leyline/White x3 (Concordant Presence, Guiding Signal, Unity of Purpose), Red x1, Agent x2, Leader x1, Scholar x1, Fate x1, and ZERO Blue — against the leyline guide's 'Plot Die manipulation is Blue's capstone identity'.
   - Evidence: resource-economy.json plot_die.prod is verbatim {"leyline/White": ["Concordant Presence","Guiding Signal","Unity of Purpose"], "leyline/Red": ["Reckless Momentum"], "heroic/Agent": ["Get 'Em Talking","Risky Behavior"], "heroic/Leader": ["Cutthroat Tactics"], "heroic/Scholar": ["Overcharge"], "deity/Fate": ["Thread of Inevitability"]}. No leyline/Blue key. Note the analysis did NOT flag that this contradicts the brief's own keyword line 'Plot Die 3 talents / 2 trees (leyline/Red and heroic/Agent ONLY)'.
5. **CORRECTED** — The dossier `earliest L` column is buggy for off-colour rank-3 gates: Blue's Baleful (Persuasion 3+) is listed L4 but is L6. 'Same error in heroic/Agent's Close the Case. This under-states Blue's back-loading by one talent and misstates several others across the atlas.'
   - Evidence: The bug is real and the mechanism is right (the primer's rank cap is 2 until L6 for ALL skills, not just the tree's colour). But 'several others' is a 20x understatement. A full sweep of all 21 dossiers finds 41 mis-levelled talents: heroic/Agent 7, heroic/Envoy 6, heroic/Hunter 6, heroic/Scholar 6, heroic/Warrior 6, heroic/Leader 5, leyline/Green 2, leyline/Black 1, leyline/Blue 1, leyline/Red 1.
   - Corrected: 41 of 365 talents carry an off-colour skill-rank-3 prerequisite while being listed below L6 — 36 of them in heroic paths. This overturns the brief's stated structural fact that 'heroic paths carry NO leyline-colour rank gate, so their whole tree is reachable by ~L4-L5': heroic trees are gated by ordinary skill ranks instead, and roughly a quarter of each heroic tree is L6+. Directly load-bearing for the designer's question 2 (heroic vs leyline parity at similar points along the tree).
6. **CORRECTED** — 'Blue is the most back-loaded tree in the leyline atlas: 8 of 25 talents (32%) are level-6+, against White's 4 of 25 (16%).'
   - Evidence: Counting 'earliest L6' entries and then applying the analysis's own rank-3 correction to EVERY tree, not just Blue: Blue 7 listed + Baleful (Persuasion 3+) = 8/25 (32%). Green 6 listed + Natural Recovery (Medicine 3+, listed L3) + Pack Sense (Survival 3+, listed L3) = 8/25 (32%). Red 5 + Feeding Frenzy (Intimidation 3+, listed L3) = 6/25 (24%). Black 4 + Extract Thought (Deception 3+, listed L3) = 5/25 (20%). White 4/25 (16%).
   - Corrected: Blue is TIED with Green as the most back-loaded leyline tree at 8 of 25 (32%). The analysis applied its own bug fix only to the tree it was arguing about, which is exactly the error the fix was meant to catch. Green's two hidden L6 talents (Natural Recovery, Pack Sense) are both depth-2 Specials the Green profile treats as core, so Green's back-loading is arguably worse in kind.
7. **REFUTED** — 'leyline/Blue has five Action-costing talents, and three of them (Ghostly Walls, plus the Living Image embedded Action, plus the rank-3 half of the Illusion chain) are behind a Blue 3+ / level-6 wall.'
   - Evidence: Blue's five Action-cost talents are Phantom Double (2A, depth 0, L1), Telepathic Network (2A, depth 1, L2), Phantom Barricade (1A, depth 1, L2), Read Intent (1A, depth 3, L4, Blue 2+), Ghostly Walls (1A, depth 3, L6, Blue 3+). Exactly ONE is behind the Blue 3+ wall. Living Image is typed 'Special', not an Action-cost talent, and 'the rank-3 half of the Illusion chain' is not a talent at all — it is the analysis padding a count.
   - Corrected: One of Blue's five Action-costing talents (Ghostly Walls) is behind the Blue 3+ / L6 wall. Blue has repeatable Action-cost plays from L2 (Phantom Barricade) — which the analysis itself says in §3 and then contradicts in §0.
8. **REFUTED** — 'Blue's first talent that makes a test against a character is Read Intent at depth 3 (L4)... At levels 2-3, Pattern Recognition is very likely inert.'
   - Evidence: Redirect Momentum (depth 1, earliest L2): 'test Blue vs. Athletics'. False Premise (depth 2, earliest L3): 'test Blue vs. their Cognitive defense'. Both precede Read Intent. Separately, Pattern Recognition's trigger is 'When you succeed on a Cognitive test against a character' — a category of test the character makes, and every character can make one with the standard actions Use a Skill and Gain Advantage, or by attempting to influence, with no talent at all (SYSTEM-PRIMER §Standard Actions).
   - Corrected: Blue makes tests against characters from depth 1 / L2 (Redirect Momentum) and against Cognitive defence from depth 2 / L3 (False Premise). Pattern Recognition is not inert; whether it is reliable turns only on the unsettled question of which skills are Cognitive, which the analysis correctly parks in §10.
9. **REFUTED** — Blue's Ghostly Walls + Absolute Stillness is 'a repeatable, 100%-uptime, single-target soft-Restrain plus reaction denial, and it is the best control effect in the leyline atlas.'
   - Evidence: leyline/Black, Hollow Command, depth 0, earliest L1, 2 Actions + 1 Investiture: 'test Deception vs. Spiritual... On a success, the target cannot take actions on its next turn.' That is total action denial. SYSTEM-PRIMER: 'Action denial (Stunned, Disoriented, Restrained) is the most valuable category in a 3-action economy.' Ghostly Walls denies movement and (with Absolute Stillness) Reactions, but the target can still take all its Actions. Also 'repeatable, 100%-uptime' overstates: Ghostly Walls requires a successful contested Blue vs. Cognitive test every round, and requires 'a character you can influence', an undefined gate the analysis flags elsewhere.
   - Corrected: Blue's lock is one of the leyline atlas's better control effects but is dominated by leyline/Black's Hollow Command, which denies a whole turn of Actions at depth 0 / level 1 for the same 1 Investiture. Blue's control is both LATER and WEAKER than Black's, which strengthens the analysis's Blue diagnosis while destroying its stated reason for it.
10. **REFUTED** — 'Damage redirection exists in exactly three places across all 365 talents: White's own Shared Burden, deity/Order's Shoulder the Oath, and deity/Power's Mantle of the Aspirant.'
   - Evidence: A fourth: deity/Life, Lifeline — 'Spend 2 Investiture and choose a creature in Attunement Range. For the scene, when that creature takes damage you may take up to half instead as Spirit damage, bypassing Deflect.' It is the ONE redirection that actually creates the state Devoted Conduit needs (an ALLY, other than the White character, taking damage intended for another creature), so it is the enabler the analysis's dead-text argument most needed to consider.
   - Corrected: Four talents move damage between characters: leyline/White Shared Burden, deity/Order Shoulder the Oath, deity/Power Mantle of the Aspirant, deity/Life Lifeline. Devoted Conduit's trigger is still rare and still uncausable by a White-only character, but 'dead text' is too strong.
11. **CONFIRMED** — 'Shared Burden reduces party damage by exactly zero — the ally takes half, you take half, party total unchanged.'
   - Evidence: Text: 'When an ally adjacent to you takes damage, spend 2 Investiture. If you do, take half that damage in their place.' The reading is corroborated by the house wording in deity/Order's Shoulder the Oath: 'you may take half that damage instead AND REDUCE THE REMAINING DAMAGE TO THAT ALLY by your ranks in White' — which shows the sibling design explicitly leaves the other half on the ally and has to buy the reduction separately. The analysis did not cite this corroboration; it should have, because 'in their place' read alone is ambiguous between a split and a full substitution.
12. **REFUTED** — 'On arithmetic, White out-contributes Red at Tier 2 by roughly 2:1' — a White Tier-2 round is worth ~35 points of swing (12 HP restored + ~18 mitigated + ~5 spirit + a condition) against Red's ~15-17 damage.
   - Evidence: Four independent failures. (a) NOT BUILDABLE AT L6. The round uses Shield Wall (depth 3), Mending Aura (depth 4), Beacon of Stability (depth 2), Retributive Guard (depth 1) and Guardian Stance (depth 0). Minimum legal chains: Guardian Stance + Retributive Guard + Shared Burden + Shield Wall = 4; Guiding Signal + Concordant Presence + Beacon = 3; Ordered Advance + Mending Aura = 2. Nine talents, i.e. level 9, compared against a level-6 Red. (b) 12 of the 35 points are 'Draw Mana x2', which depends on the Draw-Mana-repeatability ruling the analysis itself lists as unsettled in §10 item 1 and W1. (c) The 18 mitigation points assume four enemy attacks per round land on two allies adjacent to the White character — an adversary-count and adversary-behaviour assumption, explicitly OUT OF SCOPE by the primer's scope fence. (d) The Red round is understated: Searing Bolt is 1 Action + 1 Investiture with no once-per-round limiter, and at Tier 2 Draw Mana returns 2, so Draw + Bolt + Bolt is net-zero Investiture and sustains 2x(2d8 + Red modifier) = ~18+ energy indefinitely, plus Arc Flash. The analysis gave Red one bolt. It also omits Momentum's Edge entirely, which the brief handed it as Red's real ceiling.
   - Corrected: The 2:1 ratio must be withdrawn. Compared like-for-like at level 6 with six talents each, and with the Draw-Mana stack and the adversary assumption removed, a White round is roughly: 1 Draw Mana (+2 Investiture, 2 HP to each ally), two Actions with no White talent to spend them on, one Reaction (Retributive Guard, ~9 spirit on a success), plus Shield Wall's passive mitigation bounded by whatever the enemy actually aims at the adjacent allies. A Red round is Draw + Searing Bolt + Searing Bolt, ~18 energy plus Kindle, sustained forever. Whether White 'out-contributes' Red is not settled by this analysis, and mitigation is not fungible with damage — the brief names 'counting MITIGATION as damage dealt' as a known failure mode, and this is it.
13. **REFUTED** — §7's comparison: 'a level-2 Warrior's headline turn is roughly weapon + 9 + 4 — call it ~20 on a hit, ~12 expected, every round, forever, for zero resources', from Combat Training + Devastating Blow + Mighty.
   - Evidence: heroic-Warrior.md, Devastating Blow: '- prereq: Combat Training; Athletics 3+'. Athletics 3 is a rank-3 skill gate, so by the primer's own table it is unreachable before level 6 — the dossier's 'earliest L2' is the exact off-colour rank-3 bug the analysis identified in §1 and then walked straight into six sections later. Separately, the turn is credited to a level-2 character while naming three talents (Combat Training depth 0, Devastating Blow depth 1, Mighty depth 1 with prereq Stonestance — so Mighty needs Stonestance too, making it four).
   - Corrected: Devastating Blow is earliest L6. A level-2 Warrior holds two talents; the honest level-2 Warrior turn is a weapon Strike plus Mighty's +2 per action (Stonestance + Mighty), not 2d8+4. The §7 White-vs-Warrior table at level 2 does not stand. The same bug also moves Warrior's execute, Wit's End (Intimidation 3+), from L3 to L6.
14. **REFUTED** — 'White's economy is precision-tuned to the 1-Reaction-per-round hard cap. It cannot run dry, because it cannot legally spend faster than it draws.'
   - Evidence: White's Investiture sinks are 7 Reactions AND 6 Specials, and a Special rides an action you were already taking — it does not compete for the Reaction slot. At Tier 1 Draw Mana returns 1, while Beacon of Stability (Special, 1 Investiture, riding Draw Mana itself) plus any one Reaction is a 2-per-round burn against 1 income. Unbreakable Line alone costs 3 Investiture — three full Tier-1 rounds of drawing — for one use. Terms of Accord, Overwhelming Authority, Collective Resolve and Mending Aura are four further Special sinks.
   - Corrected: White's Reaction spending is capped at 1/round by the Reaction cap, which is elegant; but its six Specials sit outside that cap, so a White character running Beacon of Stability plus a Reaction is already in deficit at Tier 1, and Unbreakable Line is a three-round savings plan. The census's '15 costers / 0 regen' is not simply 'measuring the wrong thing'.
15. **CORRECTED** — 'White is trigger-reliable: its Reactions cannot fail to have a legal target in a real fight.'
   - Evidence: Three of the seven are conditional on more than 'an ally takes damage': Pillar of Order needs an ally to ROLL A COMPLICATION on a plot die (which requires a plot die to have been rolled at all); Counterpoint needs 'an enemy... successfully influences an ally', an influence subsystem event; Shared Conviction needs an ally who 'would fail a test' and costs 2 focus on top.
   - Corrected: Four of White's seven Reactions (Interposing Shield, Retributive Guard, Shared Burden, Voice of Authority) key on damage or hostile targeting and are near-certain to have a target. Three are conditional. The contrast with Blue's trigger-fragility survives, but at 4/7, not 7/7.
16. **CORRECTED** — 'Blue's Key and Calculated Patience collide... the second is worth literally zero. Blue's depth-0 Foresight pick is anti-synergistic with the free Key it comes with.'
   - Evidence: Blue Key: 'gain an advantage on your next Cognitive test.' Calculated Patience: 'When you take a slow turn, your first test that turn gains advantage.' They overlap only when (i) you took a Slow turn, (ii) you Drew Mana, and (iii) your next test is a Cognitive one. On a Slow turn where the first test is Physical or Spiritual, only Calculated Patience applies; on a Fast turn only the Key applies.
   - Corrected: Partial redundancy in one specific case, not a flat collision. Both are still weak, but the 'anti-synergistic' framing overstates it — and note Calculated Patience carries a Blue 2+ prerequisite, so it costs both of a level-1 character's skill ranks.
17. **CORRECTED** — Blue's level-1 turn 'is the emptiest level-1 turn in the 365-talent atlas.'
   - Evidence: Exclusivity claim, not checked against the other 20 trees. deity/Sovereignty deals zero damage on both evidence streams and BOTH its depth-0 entries (Censure, Exalt) are 1-Action talents — a full talent-driven level-1 turn with no damage at all. heroic/Scholar, the other zero-damage tree, has Field Medicine (1 Action, in-combat heal) and Strategize (Special) at depth 0. Blue's own depth-0 set includes Phantom Double (2 Actions) — a bad play, but a play — and Forewarned, which grants an additional Reaction when the prediction lands and is never priced anywhere in the analysis.
   - Corrected: Blue's level-1 turn is empty only if the player takes both depth-0 Passives. deity/Sovereignty is the counter-example the analysis needed and never cites: zero damage AND two depth-0 Action talents, which proves the analysis's own thesis — that zero-damage and zero-agency are independent problems — better than anything in the piece.
18. **CONFIRMED** — White's Interposing Shield uses `half [Die]` where Devoted Conduit and Shield Wall use `half [Tier][Die]` — mitigating 2.0 at Tier 2 against their 4.5, while costing a Reaction and 1 Investiture that they do not.
   - Evidence: Verbatim: Interposing Shield 'reduce that damage by half [Die]'; Devoted Conduit 'reduce that damage by half [Tier][Die]'; Shield Wall 'deal half [Tier][Die] less damage'. Means: floor(d6/2) = 1.5 and floor(d8/2) = 2.0; floor(1d6/2) = 1.5 and floor(2d8/2) ~ 4.25-4.5. The arithmetic checks out and the divergence looks like an authoring slip.
19. **CONFIRMED** — White's Unbreakable Line gets harder exactly as the hit gets more lethal (DC = 1/2 of the damage taken).
   - Evidence: Verbatim: 'spend 3 Investiture and test White with a DC equal to 1/2 of the damage taken. On a success, they drop to 1 health instead.'
20. **CORRECTED** — Guiding Signal is 'three-way worse' than heroic/Agent's Risky Behavior, which delivers the same effect for 1 focus and no Action.
   - Evidence: Risky Behavior (verbatim): 'Spend 1 focus to raise the stakes on YOUR test' — Special, self-only. Guiding Signal: 'designate a character within Attunement Range. The next ALLY who tests against it this round raises the stakes' — an other-directed effect. They are not the same effect, and an ally-facing grant is standardly priced above a self-buff in this system.
   - Corrected: Guiding Signal costs an Action and an Investiture where Agent's nearest analogue costs 1 focus and no Action, but the two are not the same talent: Risky Behavior is self-only. The pricing complaint survives in weakened form; the 'three-way worse' framing does not.
21. **CORRECTED** — 'White manufactures Plot Dice and has nothing to do with the Opportunity face, while eating the Complication face. The Coordination specialty is net-negative for its first three levels.'
   - Evidence: All three White plot-die talents make an ALLY raise the stakes (Guiding Signal: 'the next ally who tests against it'; Concordant Presence: 'the next ally testing that same skill'; Unity of Purpose: 'when two or more allies aid the same test'). The Opportunity and the Complication both land on the ALLY, not on the White character. resource-economy.json shows Opportunity consumed by 17 talents across 9 trees, so the ally very likely has a sink.
   - Corrected: White's plot-die output is other-directed: the ally who rolls owns both faces. The internal ordering complaint (White's own first Opportunity sink is Collective Resolve at depth 3 / L4) is real but much smaller than 'net-negative for its first three levels', which mis-attributes the Complication risk to the White player.
22. **CONFIRMED** — Blue's Pattern Recognition and False Premise both impose disadvantage on 'their next test' and self-cancel under the binary scalar; only Probability Cascade ('next two tests') extracts two units.
   - Evidence: Verbatim: Pattern Recognition 'their next test this round has disadvantage'; False Premise 'impose disadvantage on their next test'; Probability Cascade 'disadvantage on its next two tests'. SYSTEM-PRIMER: advantage/disadvantage is one tri-state scalar, boolean-OR'd per direction.
23. **CONFIRMED** — Disadvantage has 14 producers and ZERO consumers across all 365 talents, and Blue owns 5 of the 14.
   - Evidence: resource-economy.json disadvantage: producers 14, consumers 0, verdict PRODUCED, NEVER CONSUMED. Blue's five are Intercept, Absolute Stillness, Pattern Recognition, False Premise, Probability Cascade.
24. **REFUTED** — 'A level-6 Blue running the lock cannot also Counterspell in the same round.'
   - Evidence: At L6 the Investiture pool is ~6 (2 + max(AWA, PRE), plus the L3/L6 attribute points). Draw Mana returns 2 and Ghostly Walls costs 2, so the loop is net-zero against a standing pool of ~6, not against zero. Counterspell (2 focus + 1 Investiture) can be paid out of that standing pool for roughly six rounds before it empties.
   - Corrected: A level-6 Blue running Ghostly Walls every round is Investiture-neutral and can additionally Counterspell out of its ~6-point reserve for several rounds. The real constraint is the Action budget (Draw + Walls = 2 of 3) and the 1-Reaction cap, not Investiture.
25. **CONFIRMED** — leyline/White Mending Aura's authored override is material — the authored (winning) text costs an Opportunity AND 1 Investiture where the source prose costs Opportunity only.
   - Evidence: leyline-White.md carries both: source 'You may spend Opportunity to restore half [Tier][Die] health to each ally within [Size]'; authored override 'You may spend Opportunity and 1 Investiture to restore half [Tier][Die] health...'. The wiring line confirms consumes=1 inv.

### What the analysis missed

- THE EARLIEST-L BUG IS 41 TALENTS, NOT TWO — and 36 of them are heroic (Agent 7, Envoy 6, Hunter 6, Scholar 6, Warrior 6, Leader 5). The analysis found the bug class and then quantified it as costing Blue one talent. Fixing it overturns the brief's own structural premise that heroic trees are fully reachable by L4-L5, and it is the single most consequential repo-side finding available in this material. It is also directly load-bearing for the designer's question 2, which the analysis never engages.
- THE ANALYSIS FELL INTO ITS OWN BUG. Its §7 centrepiece is 'a level-2 Warrior', built on Devastating Blow, prereq `Athletics 3+` = L6. Warrior's execute Wit's End (`Intimidation 3+`) moves L3 -> L6 too. The comparison it calls 'the comparison that actually matters' does not exist at level 2.
- deity/SOVEREIGNTY IS NEVER MENTIONED. It is the third confirmed zero-damage tree, and it is the direct counter-example to the analysis's thesis: both its depth-0 entries (Censure, Exalt) are 1-Action talents, so it has a full talent-driven level-1 turn with no damage at all. That is the proof that zero-damage and zero-Action-content are independent variables — the analysis's own headline claim — sitting unused in the dossier.
- RED'S SECOND SEARING BOLT. Searing Bolt has no once-per-round limiter and costs 1 Action + 1 Investiture; at Tier 2, Draw Mana returns 2. The sustainable Red round is Draw + Bolt + Bolt, roughly double what the analysis credits, before Arc Flash, Kindle or Momentum's Edge. The brief explicitly handed over Momentum's Edge as Red's real ceiling and the analysis dropped it.
- WHITE IS THE TOLL-BOOTH COLOUR. The brief's deity-gate audit shows four deity trees (Order, Civilization, Fate, Sovereignty) charge for White rank and none tests it or sizes a damage die on it — Sovereignty demands White 3+, a six-skill-rank level-6 investment, and tests Black three times and White zero. For a review asking 'can White contribute?', that is a first-order answer and it appears in one subordinate clause of §9.
- WHITE APPEARS IN NEITHER advantage.prod NOR advantage.cons in resource-economy.json — the only leyline tree of which that is true, against a design guide that says 'White rewards coordinated group action'. Unexamined.
- FOREWARNED IS NEVER PRICED. 'If that character takes the declared action before your next turn, you gain 1 Reaction' — a free, always-on, depth-0 conditional extra Reaction, in a tree with five Reactions competing for one slot. The analysis dismisses it as 'does nothing on your turn' and never weighs it against heroic/Envoy's Foresight, which the Envoy profile calls the only unconditional extra Reaction in the game.
- THE BRIEF'S OWN PLOT-DIE COUNT IS WRONG AND WENT UNFLAGGED. The brief says 'Plot Die 3 talents / 2 trees (leyline/Red and heroic/Agent ONLY)'; resource-economy.json plot_die shows 9 producers across 6 trees including White x3. The analysis used the correct list without naming the contradiction, which is exactly the kind of census-vs-text discrepancy the remit asked it to surface.
- deity/Order's Shoulder the Oath is the wording that settles the Shared Burden ambiguity ('take half that damage instead AND reduce the remaining damage to that ally by your ranks in White'). The analysis asserted its reading of 'in their place' without the corroboration that makes it safe, and 'in their place' read alone is genuinely ambiguous between a split and a full substitution — a reading on which the finding inverts from 'net zero' to 'a 50% single-hit damage reduction'.

### Surviving findings, in priority order

1. THE STRUCTURAL DIAGNOSIS SURVIVES INTACT AND IS THE BEST THING IN THE ANALYSIS: leyline/White has exactly one 1-Action and one 2-Action talent in 25 (Guiding Signal L1, Ordered Advance L4), and seven Reactions competing for one slot per round. A White player's own turn is Draw Mana plus two Actions their tree gives them nothing to spend on. This is a turn-structure and agency problem, verified from the raw text and independent of every number the analysis got wrong. It is a better answer to the designer's framing than 'add damage'.
2. `Emotional Overload` is misclassified in resource-economy.json as an Investiture producer (and as an advantage producer). Correct bonus-regen census: Black 2 (both late and conditional), Red 1 (Flashpoint), White 0, Blue 0, Green 0. This is the third classifier bug the brief predicted; fix it in docs/analysis/talent-ecosystem/resource-economy.js.
3. The `earliest L` calculator applies the rank-3 -> L6 rule only to a tree's own colour skill, mis-levelling 41 talents atlas-wide, 36 of them heroic. Highest-priority repo fix in this material: it changes the answer to the designer's question 2 and it already corrupted this analysis's own centrepiece comparison.
4. Blue has zero plot-die talents against the leyline design guide's verbatim 'Plot Die manipulation is Blue's capstone identity', while leyline/White holds three raise-the-stakes talents and heroic/Agent holds the exact face-changing effect (Sure Outcome) the guide reserves for Blue. Cheapest high-value design fix on the list, and it adds no damage.
5. White's Interposing Shield uses `half [Die]` where its two siblings Devoted Conduit and Shield Wall use `half [Tier][Die]`. At Tier 2 the costed Reaction mitigates ~2.0 while the free Passives mitigate ~4.5. Probable authoring slip; a one-token fix.
6. White's Unbreakable Line has an inverted difficulty curve — DC equal to half the damage taken — so the death-save is hardest exactly when it matters most. Verified verbatim.
7. Blue's Pattern Recognition and False Premise both impose disadvantage on 'their next test' and are mutually worthless on the same target in the same round under the binary scalar; only Probability Cascade ('next two tests') extracts two units. Blue owns 5 of the game's 14 disadvantage producers against 0 consumers system-wide.
8. Blue's control identity (Ghostly Walls -> Absolute Stillness) is five talents of a six-talent budget at level 6 — but the correct diagnosis is 'late AND dominated', not 'the best control effect in the atlas, arriving late'. leyline/Black's Hollow Command denies a whole turn of Actions at depth 0 / level 1 for the same 1 Investiture. Any Blue fix should be framed against Black, not against damage.
9. White's Shared Burden is party-net-zero damage for 2 Investiture, the round's only Reaction, and a `Strength 3+` gate on a caster whose Investiture pool scales off Awareness/Presence. Corroborated by deity/Order's Shoulder the Oath wording.
10. White's Devoted Conduit triggers on 'an ally takes damage intended for another creature', a state produced by exactly four talents in the corpus (Shared Burden, Shoulder the Oath, Mantle of the Aspirant, deity/Life's Lifeline) and by none that a White-only character can point at an ally. Rare rather than dead, and worth re-triggering.
11. VERDICT ON THE LOAD-BEARING CONCLUSION AND THE OPPOSITE CASE: the analysis concludes 'White does not need damage; the arithmetic says it already out-contributes Red 2:1'. The opposite case is stronger on arithmetic — corrected for buildability (the round needs 9-10 talents), for the unsettled Draw Mana ruling (12 of 35 points), for the out-of-scope four-attacks assumption (18 of 35 points), and for Red's missing second Searing Bolt and Momentum's Edge, the ratio evens or inverts, and mitigation is not fungible with damage anyway. So the number must be withdrawn. The RECOMMENDATION may nevertheless survive, on the three grounds in §9 that never depended on it: adding damage raises the already-high White<->Red (0.810) and Blue<->Red (0.869) similarity that this review exists to reduce; the leyline guide's colour-boundary rule is explicit; and White's only on-identity damage slot (the oath-breaker punish) is already owned by deity/Order's Edict, whose gate colour is White. Recommend to the designer: keep the recommendation, discard the arithmetic that was offered for it, and re-derive the White question from the Action-structure finding and the toll-booth finding instead.
