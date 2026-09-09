# EDHA — STANDING RULINGS

**Every open decision waiting on Ben, in one place.** Created 2026-07-27w by merging
`docs/BENCH_MARATHON_REPORT.md` §3 (33 items) with every pure ruling that had been sitting in
`EDHA_FOUNDRY_TEST_CHECKLIST.md` as if it were a test row.

**What belongs here vs. the checklist:**

- A row that asks Ben to **DECIDE** something — which behaviour is canon, what a number should be,
  which of two texts is right — is a **ruling** and lives here.
- A row that asks Ben to **LOOK** at something and report a perception — does this read right, does
  this feel right at the table — stays a **⚑** row in `EDHA_FOUNDRY_TEST_CHECKLIST.md`.
- A row that needs a live table but no human judgment is **🤖** in the checklist: the bench queue.

**How to answer:** reply with the numbers and your call — "R-7 (b), R-12 leave it, R-23 use 4×4" is
enough. Anything marked *Recommended* has a default the sessions would take if you say nothing;
anything marked **APPLIED** is already live in the code and needs a **veto** if you disagree.

**The phone card's question** (item 44, 2026-09-06): the "Needs you" view on the mobile board shows
each open ruling as one card whose question is the ruling's **heading** — unless the entry carries
an `Ask:` paragraph, which then wins. Use one when the heading describes a symptom or leans on
another ruling and so cannot stand alone: **one line, its own paragraph directly under the heading
paragraph**, `Ask: <the one-sentence question Ben answers, with (a)/(b) named when the entry has
them>`. Keep it to a single line — the parser reads paragraphs line by line.

**When a ruling is answered:** record the answer inline under its number, move it to §K (Settled),
and push the consequence — card text, `data/domain.json` prose, the engine, and any checklist row
that was waiting on it. A ruling is not done until the thing it decides has actually changed.

---

## A. Permissions & world settings

*(R-1 — should the PLAYER role keep ACTOR_CREATE — ANSWERED 2026-09-05, moved to §K.)*

*(R-2 — bench PCs get normal sight range — ANSWERED 2026-09-05, moved to §K.)*

*(R-3 — applyButtonsTo running on one GM while world-scope — ANSWERED 2026-09-06, moved to §K.)*

---

## B. Scope & width — what a rule should reach

*(R-4 — out-of-combat scope — SETTLED 2026-09-06, moved to §K.)*

*(R-74 — the Stalker's Fade gets an authored `costs:` line — ANSWERED 2026-09-06, moved to §K.)*

*(R-75 — H26 reaction family left ungated — ANSWERED 2026-09-06, moved to §K.)*

*(R-76 — H10's Investiture-drain branch has no consumer — ANSWERED 2026-09-06, moved to §K.)*

*(R-78 — the `edha-aoe-template` handler is retired — ANSWERED 2026-09-06, moved to §K.)*

*(R-77 — Investiture-max persist defers to the primary GM — ANSWERED 2026-09-06, moved to §K.)*

*(R-5 — does Fault Line's line spare allies — ANSWERED 2026-09-05, moved to §K.)*

*(R-6 — Fault Line's dangerous-terrain Region spares the caster only — ANSWERED 2026-09-06, moved to §K.)*

*(R-7 — Final Decree / Edict's Temp HP rider scope — ANSWERED 2026-09-05, moved to §K.)*

*(R-8 — bench-roster cross-talk — ANSWERED 2026-09-06, moved to §K.)*

**R-101. May a follow-up ecosystem pass read adversary numbers, to size the defensive talents against something?** You ruled the talent ecosystem review to **the 365 talents only** — adversaries, PC build ladders and system-native talents explicitly out — and that was the right call for the questions you asked. It bit in exactly one place. The review can say White's `Shield Wall` reduces damage by `half [Tier][Die]` = **1.75 at Tier 1**, and that `Guardian Stance` at depth 0 gives +1 Deflect, so White's mitigation is nearly flat across levels 1–5. What it cannot say is whether 1.75 is a lot, because that only means something against a number for how hard things actually hit — and those numbers live in `data/adversaries.json`. The same limit applies to every damage figure in the review: `1d6` at Tier 1 is a number without a target. *Recommended default: **(a) yes, narrowly** — a follow-up may read adversary damage and HP **as a yardstick only**, to size talent numbers, with no findings about adversary design and no changes to adversary data. That is the smallest extension that makes the defensive half of the review actionable.* (b) no, keep the fence; size the numbers at the table instead, from play. (c) yes, and let the same pass also review adversary talent lists, which is a much larger job. *(Talent ecosystem review, 2026-09-09.)*

Ask: The review can say `Shield Wall` prevents 1.75 damage but not whether that is a lot, because adversary numbers were out of scope — may a follow-up read adversary damage and HP purely as a yardstick (a), or keep the fence (b)?

---

## C. Mechanics — what a rule should do

*(R-9 — cannot-regain-HP vs heal-overflow Temp HP — ANSWERED 2026-09-06, moved to §K.)*

*(R-10 — cannot-regain-HP does not block drop-to-1 stabilization — ANSWERED 2026-09-06, moved to §K.)*

*(R-11 — refund on a fully-blocked heal — ANSWERED 2026-09-06, moved to §K.)*

*(R-12 — a raised creature clears its own Harvested Remain — ANSWERED 2026-09-06, moved to §K.)*

*(R-13 — a snare placed under a creature arms, does not spring — ANSWERED 2026-09-06, moved to §K.)*

*(R-14 — melee mutation riders follow each rider's own card wording on grazes — ANSWERED 2026-09-06, moved to §K.)*

*(R-15 — Coercive Pressure's next-test slot becomes a list, not one object — ANSWERED 2026-09-06, moved to §K.)*

*(R-16 — Wary reducing Whispered Doubt's extra loss — ANSWERED 2026-09-06, moved to §K.)*

*(R-17 — Puppeteer/Unnerving Approach keeps the click budget, refunds a declined offer — ANSWERED 2026-09-06, moved to §K.)*

*(R-18 — quarry advantage joins the next-test list instead of stomping — ANSWERED 2026-09-07, moved to §K.)*

*(R-19 — combat-timing talents granting to adversaries too — ANSWERED 2026-09-05, moved to §K.)*

*(R-20 — Pattern Recognition's disadvantage expiring at round change — ANSWERED 2026-09-06, moved to §K.)*

*(R-21 — Phantom Double's out-of-range refusal — ANSWERED 2026-09-06, moved to §K.)*

*(R-22 — build guard rejects any `min ≠ max` consume entry — ANSWERED 2026-09-06, moved to §K.)*

*(R-50 — ambush riders benefit on the FIRST strike, not the second — ANSWERED 2026-09-06, moved to §K.)*

*(R-51 — an illusory copy breaking is not "an ally dropped" — ANSWERED 2026-09-06, moved to §K.)*

*(R-69 — a cancelled picker stamps sceneOnce only after a successful pick — ANSWERED 2026-09-05, moved to §K.)*


*(R-70 — a two-resource activation dialog starts every cost row ticked — ANSWERED 2026-09-06, moved to §K.)*

*(R-72 — an involuntary drain is not a spend — ANSWERED 2026-09-06, moved to §K.)*

*(R-80 — both an advantage and a disadvantage next-test entry on one victim CANCEL (the roll stays as the player configured it) — DEFAULT (a) APPLIED 2026-09-06, item 49, PR #221; ANSWERED 2026-09-07, moved to §K.)*

---

*(R-81 — the three run-19 `bySize` blocks (Brandram's Shockwave Slam / Reckless Advance, Tussock-Sow's terrain square) carry an explicit `distanceFt` = the card's own number — DEFAULT (a) APPLIED 2026-09-06, item 67, PR #232, REBUILD owed to the next deploy; ANSWERED 2026-09-07, moved to §K.)*

---

*(R-82 — R-14's graze rule reaches `edha-damage-bonus` too — ANSWERED 2026-09-07, moved to §K.)*

*(R-83 — gate all three heal writers at their emitters — ANSWERED 2026-09-07, moved to §K.)*

*(R-84 — an offer that cannot be made refunds its Investiture, and the card names the money — DEFAULT (a) APPLIED 2026-09-06, fix pass 9; ANSWERED 2026-09-07, moved to §K.)*

---

*(R-85 — `expireEndOfRound` falls back to the BEARER's combat when the granter is not a combatant — DEFAULT (a) APPLIED 2026-09-06, fix pass 9; ANSWERED 2026-09-07, moved to §K.)*

---

*(R-88 — Volatile Strike drops the impact-only damage-type gate — ANSWERED 2026-09-07, moved to §K.)*

*(R-89 — the NO NAMEABLE HOOK marker moves into a `noHook` flag, off the prose — ANSWERED 2026-09-07, moved to §K.)*

*(R-90 — an adversary's edha-triggered-effect card whispers when there is no player owner — ANSWERED 2026-09-07, moved to §K.)*

*(R-91 — R-86 retires the R-62 seven-site audience-flip checklist row — ANSWERED 2026-09-07, moved to §K.)*

---

**R-95. `Momentum's Edge` reads a derived-field OBJECT, so it probably does nothing — and if it worked it would be ten times every other damage rider in the game.** leyline/Red's `Momentum's Edge` (depth 2, **level 3**, Passive, no cost, no resource) carries `bonusFormula: "@movement.walk.rate"`. That field is a **DerivedValueField object** (`{value, override, derived}`), not a number — the engine says so itself at `19-red-momentum-frenzy.js:224`, documenting the *same mistake shipping once before* on 2026-07-27, when a raw `Number()` on that field made every `edha-move {byHalfSpeed}` move 0 ft. That path was repaired with `edhaDerivedNum`; the damage-rider path was not, and goes through `Roll.replaceFormulaData`, which does `String(value)`. So the rider very likely contributes nothing, and may error the damage roll — **a 🤖 bench row settles which.** Separately, the design intent was clearly the movement rate (the engine's own field hint reads "Bonus = your Speed via `@movement.walk.rate`"), and walk rate is `20 + 5·SPD` = **30 at SPD 2**, 40 with Surefooted. Every other damage rider in the game is worth 1–4: `Mighty` `(1 + @tier)`, `Hexmark` `@tier`, `The Unmooring` `@attr.int`, `Kindle` `@skills.red.mod`, `Burning Drive` half a rank die, `Predatory Patience`/`Prognosis` `1d6`. **The wording is NOT ambiguous — that was this review's own error, and its verification pass caught it.** Every one of the eleven usages of "Speed" across all 365 talents means either a movement rate in feet or a tested skill: White's `Ordered Advance` "move half their Speed", Blue's `Absolute Stillness` "reduced to 0 Speed", Civilization's `Forge Construct` "Speed 25 ft", Destruction's `Walking Ruin` "Your Speed increases by 10 ft", and — decisively — **Red's own `Unstoppable`, "move up to half your Speed"**. The attributes used as flat damage adders in this corpus are Awareness, Intellect, Strength, Willpower and Presence; **Speed is never one of them.** So the card and the engine mean the same thing, and there is nothing to clarify. What is left is two separate problems that want two separate answers:

- **IMPLEMENTATION** — the reference does not resolve, so the talent probably does nothing today. Determinable, and a 🤖 bench row settles whether it errors or silently adds zero.
- **DESIGN** — if it resolved, a free depth-2 Passive would add +25 to +30 flat impact on every charge, roughly ten times every other rider in the game. Rewording cannot fix that; only the number can.

*Recommended default: **(a) fix the resolution AND retune the payload to `[Tier][Die]`*** — resolve the derived field through `edhaDerivedNum` so the talent works at all, and change the rider from the raw movement rate to `[Tier][Die]` extra impact. That keeps the charge fantasy ("Speed is the weapon. Distance is the wind-up" — the 20-ft trigger already encodes the distance), puts the payload in family with `Kindle` and `Predatory Patience`, and lets it scale with tier and rank like everything else instead of sitting flat.* (b) fix the resolution and retune to **half** your Speed (≈12–15) — still the biggest rider in the game but no longer an order of magnitude out, and it keeps the literal wording. (c) fix the resolution and leave the number: Red gets a standout free Passive, deliberately. Note Red currently has the **lowest capability budget of the five leyline trees (25)**, so (c) is not as unreasonable as the raw number looks — but it makes one talent Red's whole identity. *(Talent ecosystem review, 2026-09-09; `formula-audit.js` is the re-runnable check and finds no other unresolvable reference in all 365 talents.)*

Ask: `Momentum's Edge` is broken today and, if fixed as written, adds ~+30 flat damage — repair it and retune the payload to `[Tier][Die]` (a), retune to half your Speed (b), or repair it and keep the full number (c)?

---

**R-100. Advantage does not stack, 45 talents produce it, and 7 consume it — accept, or intervene?** cosmere-rpg 2.1.0 implements advantage as a tri-state: `configureModifiers()` sets `d20.number = 2` with `kh`, full stop. The Edha engine's own `edhaNextModFoldMode` confirms it, boolean-ORing every matching source into the one scalar the system can hold. **Disadvantage is the same scalar.** So a second advantage on the same roll is worth exactly zero, and 45 advantage-granting talents across 13 trees are far less additive than their count implies — in a real party, the second granter contributes nothing. Disadvantage is worse: 14 producers, 0 consumers. This is the mechanical reason Blue and Scholar "feel same-y": they collide in the most crowded and least-rewarded space in the game. *Recommended default: **(b) accept the cap and stop treating advantage as a design lever** — do not add advantage-granting talents, and when retuning any of the 45, prefer a flat bonus, a reroll, or the summing `formula` modifier (see R-98) over another instance of the binary flag. Cheap, needs no engine work, and does not touch live dice.* (a) build advantage consumers — talents that key off *having* one — which makes the 45 producers matter again but is real design work across many trees. (c) change the implementation so advantages stack; **this alters live dice maths on every roll in the game** and is not recommended. *(Talent ecosystem review, 2026-09-09; `resource-economy.js` + `advantage-ledger.md`.)*

Ask: Given advantage is binary and 45 talents grant it, do we stop using it as a lever and retune future talents toward flat bonuses and rerolls (b), or build talents that consume advantage so the producers matter (a)?

## D. Talent identity & tree shape

**R-96. Should Blue and/or White get damage? — the question that started the review.** The measured answer is **no for both, and the reason is not "no damage is fine" but "the hole is somewhere else"**. On the 15-axis capability budget (21 trees, each profiled and adversarially re-checked twice), within leyline **Blue scores 28 and White 27 against Red's 25** — the two no-damage trees are *broader* than the tree that does all the damage, so the no-damage identity is genuinely paid for. **And the thing they actually lack has a number, which arrived last and is the most defensible figure in the review. Counting only talents a player can spend an Action on (1/2/3 Actions — the things you CHOOSE to do on your own turn): leyline/White fields TWO in twenty-five.** `Guiding Signal` (1 Action, L1) and `Ordered Advance` (2 Actions, L4). That is the whole list; the other 23 are Passives, Specials, Free Actions and Reactions. Blue fields five, three of which are scene setup (`Phantom Double`, `Telepathic Network`, `Phantom Barricade`), leaving two repeatable plays that arrive at L4 and L6. For contrast: heroic/Warrior fields 13 of 25, and **every deity tree fields 5–8 out of NINE**. By atlas: leyline 18%, heroic 25%, deity 72%.

So what the two players are experiencing is not "I deal zero damage" — a Blue mage who `Counterspell`s an enemy's talent has plainly done something, and a White mage whose `Shield Wall` shaves damage off every attack on two adjacent allies contributes every round. It is *three Actions on a Slow turn and a twenty-five-talent tree that offers two things to spend them on.* "Damage" was standing in for four properties at once — an effect that is **self-initiated, always legal, always resolves, and produces a visible number**. Damage is the cheapest single purchase of all four; it is not the only one, and it brings a fifth thing nobody asked for, which is White and Blue becoming damage trees.

Worth noting the contrast that proves the diagnosis is about agency and not output: **deity/Sovereignty is 78% action-costing (7 of 9) and is still the worst tree in the game** (R-97) — because what its Actions buy is ±1 average damage. Agency and payload are separate failures, and a damage count cannot tell them apart.

*Recommended default: **(a) no new damage in either; buy the four properties directly instead** — give White one or two depth-0/1 talents it resolves on its own initiative, and pull one of Blue's three teeth below the rank-3 gate. All four independently-framed remediation passes — minimal-change, identity-first, systemic, and player-experience — reached this separately, and all four say no to damage for either tree.* (b) give White damage only — it has the seam already (`Retributive Guard` is its one damage talent and it is spirit). (c) give Blue damage only. (d) give both damage — cheapest to write, but it spends the clearest identity contrast in the leyline set, and the numbers say it is not what is missing. *(Talent ecosystem review, 2026-09-09; `agency-census.js` is the re-runnable check.)*

Ask: White has TWO talents in 25 it can spend an Action on and Blue has five — do we buy them on-turn plays and leave damage alone (a), or add damage to one or both anyway (b/c/d)?

**R-97. Sovereignty's signature resource was designed and never built, and the tree is the weakest in the system by a wide margin.** deity/Sovereignty scores **13** on the capability budget against 17–28 for the other nine deity trees — four below the next-lowest, less than half the top. It is the only tree in all 365 talents that deals no damage AND has no independent effect: all nine talents move a damage die one or two steps along `d4→d6→d8→d10→d12`, which is **±1 average damage per die**, so it is purely parasitic on someone else's attack. Its one strength on the matrix (debuff 4) is shared with Black and Blue, both of which also do everything else — it is the one tree where no "something it owns" can be named. On top of that, **both** intent sources promise a signature resource that does not exist: the path description says *"**Decree** — a declared law projected within a radius: allies inside are elevated, enemies inside are diminished"* and the deity guide says *"Decree zones (declared laws within a radius)"* with the loop *"diminish target → elevate ally → bring them into Decree"*. No Sovereignty talent creates a zone, radius or aura; all nine are single-target, and "Decree" survives only in the title `Decree of Ruin` and one flavour line. It also demands **White 3+** — a level-6, six-skill-rank investment — while testing Black three times and White zero times. *Recommended default: **(a) build the Decree zone** — it is the mechanic the tree was designed around, it converts Sovereignty from single-target rider to area controller in one stroke, it gives White something to test, and the engine already has the zone primitives (Fate's Ordained Ground, Civilization's Foundation). Biggest change, but it is the change the docs already specify.* (b) leave the mechanics and rewrite both intent sources so the tree is honestly "a single-target arbiter" — cheapest, but it ships the weakest tree in the game as-is. (c) raise the numbers without adding the zone — more steps, longer durations — which fixes the power and not the identity. *(Talent ecosystem review, 2026-09-09; Ben flagged Sovereignty himself as possibly worse than Blue. It is.)*

Ask: Sovereignty's promised "Decree" radius exists in no talent and the tree is the weakest in the game — build the Decree zone (a), rewrite the prose to match the single-target tree we actually have (b), or just raise its numbers (c)?

**R-98. Blue's five disadvantage talents largely do one talent's work.** Blue imposes disadvantage with five talents — `Pattern Recognition`, `Intercept`, `False Premise`, `Probability Cascade`, `Absolute Stillness` — the largest single-tree block in the game. But disadvantage is the same non-stacking binary scalar as advantage (R-100), so a Blue mage's second disadvantage in a round is worth zero, and the tree's power is far flatter than its talent count suggests. Only `Probability Cascade` escapes it, by spanning the target's next **two** tests rather than one. **The fix needs no new engine work:** `edha-next-test-mod` already carries a `formula` field whose dice/flat modifiers **SUM** (item 49 — "every matching entry appends its own term"), and it is used today by exactly one adversary ability (`Probability Net`'s −1d6) and by no talent. *Recommended default: **(a) convert Blue's deeper disadvantage talents to summing `formula` modifiers** (a −1d4 or −1d6 penalty that stacks) and leave the shallow ones as the binary flag, so the tree's depth buys something. Data edit on the authored rules; needs a pack rebuild; no engine change.* (b) re-aim them at different levers entirely — duration, forced rerolls, conditions — which is more design work but more distinctive. (c) leave it; the redundancy only bites a player who took all five. *(Talent ecosystem review, 2026-09-09.)*

Ask: Blue has five disadvantage talents and disadvantage does not stack — convert the deeper ones to the engine's existing summing `−1d6` modifier so depth buys something (a), re-aim them at other levers (b), or leave it (c)?

**R-99. Nine of ten deity trees charge for a colour they never test; five get nothing at all from it, and four of those five are White.** Every deity tree gates on two leyline colours at rank 2+ (rank 3+ on its deepest talents), which the deity guide presents as the system's designed cross-path synergy. Measured: only **Chaos** tests both its colours. Five trees never test their second colour *and* never use it to size a damage die, so the rank investment buys nothing but the gate itself — **Order (white 2+), Civilization (white 2+), Fate (white 2+), Knowledge (green 3+), Sovereignty (white 3+)**. White is gated by four deity trees and mechanically rewarded by none of them. The guide's own worked example is the one that fails hardest: of Sovereignty it says *"Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule"* — and Sovereignty tests Black three times and White zero. *Recommended default: **(a) make each deity tree test its second colour at least once**, on the talent whose theme fits (Sovereignty's `Exalt`/`Investiture of Authority` are the elevate half and should test White; Fate's `Ordained Ground` is the White half). Small, targeted, mostly card-text plus an `activation.skill` change; needs a pack rebuild.* (b) accept the gate as a pure cost and say so in the deity guide, retiring the colour-split rule. (c) drop the second colour to rank 1+ where it is never tested, which lowers the toll without new design. *(Talent ecosystem review, 2026-09-09; `deity-gate-audit.js` is the re-runnable check.)*

Ask: Five deity trees demand a colour at rank 2+ or 3+ and never test it (four of them White) — make each tree test its second colour at least once (a), accept the gate as a pure cost and retire the colour-split rule (b), or lower the untested gate to rank 1+ (c)?

**R-102. 41 of 365 talent slots are the same talent in another tree — intended, and is the triple-naming a bug?** `Hardy` appears in seven trees, `Mighty` in six, `Collected` in five, `Surefooted` and `Baleful` in three each, and five more in two each — 11% of the system. Shared generic talents are normal in the Cosmere RPG, and heroic trees carry the most (Agent, Envoy and Leader are each 24% shared filler). The measurement matters because it inflates every similarity score: Blue and Scholar's headline overlap is partly that they both contain `Collected`. One case looks like an outright mistake: **`Composed` (Blue, Black), `Focused Mind` (Leader) and `Clear Mind` (Scholar) are the same talent — "increase your maximum focus by your tier" — under three different names in five trees**, and Envoy's `Composed` additionally says "max **and current**" where the others say max only. *Recommended default: **(a) intended, keep the sharing, but unify the triple-name to one name and one wording** — three names for one effect is a card-text bug, not a design choice, and the max/current split should be settled one way. Card text + authored JSON; pack rebuild.* (b) also thin the heroic filler, since 24% of three trees being shared is a lot. (c) leave all of it. *(Talent ecosystem review, 2026-09-09; `shared-talents.js`.)*

Ask: `Composed`/`Focused Mind`/`Clear Mind` are one talent under three names across five trees, and one of them adds "and current focus" — unify the name and wording (a), or leave it (c)?

**R-103. heroic/Scholar is 40% downtime — the only substantially non-combat tree in the system.** Ten of Scholar's 25 talents do nothing once initiative is rolled (`Erudition`, `Efficient Engineer`, `Prized Acquisition`, `Deep Study`, `Fine Handiwork`, `Experimental Tinkering`, `Mind and Body`, `Deep Contemplation`, `Emotional Intelligence`, `Ongoing Care`), against 5 for Agent, 3 for Envoy and Leader, 2 for Warrior, and **zero for every leyline and deity tree**. Its capability budget is 24 against 30–32 for the rest of heroic. Empirically it is "a crafting-and-clinic path", not the strategist its name implies. This is a different problem from Blue's, and the two are **not** the same tree: read side by side they share exactly one talent (`Collected`) plus the near-identical `Composed`/`Clear Mind` pair, and both are generic filler three to five other trees also carry. *Recommended default: **(a) accept the identity — Scholar is the party's crafter and medic — but move two or three of the ten into the fight**, so a Scholar player has something to do every round without changing what the tree is. The most promising are the fabrial line, which already has a combat hook in `Overcharge`.* (b) leave it: a player who picks Scholar is choosing the out-of-combat path knowingly, and the one-pager should say so. (c) treat the 40% as the defect and rebuild the Artifabrian specialty as combat-facing. *(Talent ecosystem review, 2026-09-09; `combat-share.js`.)*

Ask: Scholar has ten talents that do nothing in a fight, far more than any other tree — move two or three of them into combat (a), accept it as the tree's identity and say so to players (b), or rebuild the crafting specialty (c)?

**R-104. Twenty of the twenty-one trees say something different from what they do — fix the prose or the talents?** Every tree was held against both its in-world path description and the design guide's claims for it. **Only deity/Death delivers what it says.** The other twenty are PARTIAL or DRIFTED, and the drift is usually coherent-but-different rather than under-delivery: Red's prose sells a ranged pyromancer and the tree is a melee charger; Fate's sells an oracle and the tree is battlefield engineering; Scholar's sells a strategist and the tree is a workshop and clinic; Blue's design guide gives it plot-die manipulation as "its capstone identity" and Blue has **zero** plot-die talents while heroic/Agent has six, including the exact effect the guide reserves for Blue. Red is the sharpest single case: the promise repeated in *both* intent sources — "every wound taken is fuel", "damage taken feeds future power" — is delivered by **zero** talents. *Recommended default: **(a) fix the prose, not the talents** — the talents mostly work and are already wired; the descriptions were written alongside them and never reconciled. One pass over `data/path-descriptions.json` and the two revision guides, tree by tree, saying what each tree actually is. Cheap, DOCS-ONLY, and it is what players actually read at session zero.* (b) fix the talents where the promise is better than the reality — specifically Red's "wounds are fuel" and Blue's plot die, both of which are good designs that were never built. (c) both, prose first. *(Talent ecosystem review, 2026-09-09.)*

Ask: Twenty of twenty-one trees do something different from what their description says — rewrite the descriptions to match the talents (a), build the missing promises (b), or prose first then the best of the missing promises (c)?

**R-105. Heroic damage is flat from level 1 to level 10; leyline damage doubles at level 6. Designed, or an accident?** Heroic damage talents carry fixed formulas: `Devastating Blow` is `(2 + max(@tier − 2, 0))d8`, which is **2d8 at level 2 and still 2d8 at level 10**; `Wit's End` is 4d6 at both tiers; `Fatal Thrust` is a flat `4d4` forever; `Deadly Trap` a flat `2d4`. Leyline and deity damage is `(@tier)d(2 × rank + 2)`, which goes `1d6` (3.5) at Tier 1 rank 2 to `2d8` (9) at Tier 2 rank 3 — **because level 6 raises the tier AND the rank cap in the same step**. **But WHEN each side gets its damage is the other half, and it points the opposite way to the sentence above.** All three of heroic's big damage talents are gated behind an **off-colour** `Skill 3+`, which is a level-6 gate: `Devastating Blow` needs `Athletics 3+`, `Wit's End` needs `Intimidation 3+`, `Fatal Thrust` needs `Perception 3+`. Leyline's damage is available at **level 1** — Black's `Withering Ray` is `2[Tier][Die]` = 2d6 = **7 vital** (ignoring Deflect) for one Action at level 1, and Red's `Searing Bolt` is 1d6. Before level 6 the strongest thing a heroic character can do is a weapon Strike plus `Mighty`'s +2. So: **leyline is ahead early, both sides spike together at level 6, and leyline pulls away after** as rank keeps climbing while heroic's dice do not. On availability the two atlases are at parity — every tree in both opens 68–80% of itself by level 5. The design guide's target, "Leyline mages are mortal. Comparable to Heroic path characters", is closest to true at level 6 and drifts either side of it. *Recommended default: **(b) give heroic damage a tier-2 step** so it does not go from level 6 to level 10 without growing while leyline doubles — the cleanest fix, and it leaves the level-1–5 window (where session one lives) untouched.* (c) accept and document the trade in the guides and the session-zero material. (a) move some of heroic's off-colour rank-3 gates down to rank 2, so heroic gets its damage before level 6 — this changes the early game, which is the window session one is actually in. *(Talent ecosystem review, 2026-09-09.)*

> ⚠️ **Correction, same day.** The first draft of this ruling said heroic is ahead at levels 1–5 and that "every heroic tree is 100% available by level 5". Both were wrong, from a bug in the review's own `derive-dossiers.js`: the rank-3 → level-6 rule was applied only to the five leyline colours, so **43 talents gated on an off-colour skill were mis-levelled, 37 of them heroic**. The review's verification pass caught it. The rank cap is universal — `validate-build.py`: "max skill rank 2 up to level 5, 3 from level 6" — for every skill. Fixed, everything re-derived, and the recommended default changed from (c) to (b) as a result.

Ask: Heroic's three big damage talents are all level-6 gated and then never grow, while leyline has damage from level 1 and doubles at 6 — give heroic a tier-2 step (b), accept and document the trade (c), or lower heroic's rank-3 gates so it gets damage earlier (a)?

---

*(R-23 — Volatile Strike rides any melee hit as a true rider — ANSWERED 2026-09-06, moved to §K.)*

*(R-24 — Red/Momentum branch root — ANSWERED 2026-09-06, moved to §K.)*

*(R-25 — Rallying Shout's reminder prints only for an ally at 0 HP or below — ANSWERED 2026-09-06, moved to §K.)*

*(R-57 — Pattern Recognition's round-expiry, kept — ANSWERED 2026-09-06, moved to §K.)*

---

## E. Cards, text & naming

*(R-26 — blank-note edha-push card text — ANSWERED 2026-09-06, moved to §K.)*

*(R-27 — Battle Fever — the card is canon over the engine — ANSWERED 2026-09-06, moved to §K.)*

*(R-28 — Withering Touch's duration ends at the END of your next turn — ANSWERED 2026-09-06, moved to §K.)*

*(R-29 — Combat Training's garbled source resolves to miss-to-graze, once per round — ANSWERED 2026-09-06, moved to §K.)*

*(R-30 — 2bR-17 spec vs rule (Counterpoint) — ANSWERED 2026-09-06, moved to §K.)*

*(R-31 — a PC's own Phantom Double token is labelled "(Illusion)" — ANSWERED 2026-09-06, moved to §K.)*

*(R-32 — Black Draw Mana's sweep card reports both swept and newly-affected counts — ANSWERED 2026-09-06, moved to §K.)*

*(R-33 — 2bI-3 card text vs behaviour (Coercive Pressure) — ANSWERED 2026-09-06, moved to §K.)*


*(R-71 — the system's item-damage card folds its formula at build time — ANSWERED 2026-09-06, moved to §K.)*

## F. Cosmetic & feel

*(R-34 — Walking Ruin's indicator — ANSWERED 2026-09-05, moved to §K.)*

*(R-35 — Unweaving's dispel card lists the omen marker as a dispellable button — ANSWERED 2026-09-06, moved to §K.)*

*(R-36 — Temp HP source relabelling only fires when the new grant is smaller — ANSWERED 2026-09-06, moved to §K.)*

*(R-37 — three small card-text nits, all fixed — ANSWERED 2026-09-06, moved to §K.)*

*(R-38 — Dread Presence's veto posts a whisper to the mover — ANSWERED 2026-09-06, moved to §K.)*

*(R-39 — roll dialog colour cue — ANSWERED 2026-09-06, moved to §K.)*

---

## G. Adversaries & bestiary

*(R-40 — the Gone-to-Weir Fen-Heart's footprint is 3×3 (Huge) — ANSWERED 2026-09-06, moved to §K.)*

*(R-46 — a "charge" carries full speed, 25 ft, explicit — ANSWERED 2026-09-06, moved to §K.)*

*(R-48 — the Cragdrake Adult's Explosive Leap — the card's 20 ft is canon — ANSWERED 2026-09-06, moved to §K.)*

*(R-49 — is a creature an obstacle for push collision damage — ANSWERED 2026-09-05, moved to §K.)*

*(R-47 — the NO NAMEABLE HOOK note stays off the player-facing card — ANSWERED 2026-09-06, moved to §K.)*

*(R-52 — the 5-ft ally-drops cue gets +2.5 ft adjacency slack — ANSWERED 2026-09-07, moved to §K.)*

*(R-53 — Dead status on a "goes still" cue — ANSWERED 2026-09-06, moved to §K.)*

---

## H. Map & character creation

*(R-41 — labelled vs label-free character-creation map — ANSWERED 2026-09-06, moved to §K.)*

*(R-42 — map polygon dead spots get the polygons fixed — ANSWERED 2026-09-06, moved to §K.)*

*(R-54 — the +1 max-health bonus is removed, HP = system — ANSWERED 2026-09-06, moved to §K.)*

*(R-55 — the sheet's three budget chips all read spent/total — ANSWERED 2026-09-06, moved to §K.)*

*(R-56 — the cosmere senses ladder for every actor type — ANSWERED 2026-09-07, moved to §K.)*

---

## I. ⚠️ APPLIED AS DEFAULT — veto if you disagree

These are **already live in the code**. They were taken as defaults rather than left to stall a fix.
If you disagree with any, say so and it gets reverted.

*(R-73 — a dispel widens to disable item-owned passives, not delete them — ANSWERED 2026-09-06, moved to §K.)*

*(R-43 — "tests Speed" means the ATTRIBUTE, live dice math — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-44 — The Pack's placement no longer requires amt > 0 — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-45 — Confident Command's per is Persuasion — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-58 — scene reset skips actors fighting in another EXISTING combat — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-59 — a failing chat-card button raises an error toast — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-60 — scene-reset sweeps cover one deduplicated population — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-61 — oncePerScene has one gate and one stamp per handler polarity — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-62 — "whisper the GM" has one helper with an explicit audience — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-63 — unknown token disposition fails CLOSED everywhere — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-64 — victim resolution uses the full 3-term chain everywhere — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-65 — every formula roll passes through edhaFoldDieMath — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-66 — one-shot card buttons persist their used state — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-67 — Chaos and Fate burst cards gained the whisper option — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-68 — the map toolchain's alpha threshold is now one constant, 128 — ANSWERED-by-acceptance 2026-09-06, moved to §K.)*

*(R-80 — both an advantage and a disadvantage next-test entry on one victim CANCEL (the roll stays as the player configured it) — DEFAULT (a) APPLIED 2026-09-06, item 49, PR #221; ANSWERED 2026-09-07, moved to §K.)*

*(R-81 — the three run-19 `bySize` blocks (Brandram's Shockwave Slam / Reckless Advance, Tussock-Sow's terrain square) carry an explicit `distanceFt` = the card's own number — DEFAULT (a) APPLIED 2026-09-06, item 67, PR #232, REBUILD owed to the next deploy; ANSWERED 2026-09-07, moved to §K.)*

*(R-84 — an offer that cannot be made refunds its Investiture, and the card names the money — DEFAULT (a) APPLIED 2026-09-06, fix pass 9; ANSWERED 2026-09-07, moved to §K.)*

*(R-85 — `expireEndOfRound` falls back to the BEARER's combat when the granter is not a combatant — DEFAULT (a) APPLIED 2026-09-06, fix pass 9; ANSWERED 2026-09-07, moved to §K.)*

---

## J. Flagged, but not questions

Recorded so they are not re-derived. No decision needed unless something here surprises you.

*(F-1 — Red rank-3 Attunement Range also measures 60 ft — SETTLED 2026-09-07, moved to §K.)*

*(F-2 — run 6's 2bX-5 PASS over a broken roll — SETTLED 2026-09-07, moved to §K.)*

---

## K. Settled

Split into `K.1`–`K.7` below purely to keep each dashboard chunk under its byte cap (item 96) — a mechanical size split in existing document order, not a thematic one.

### K.1 — R-4 … R-26


**R-4. THE BIG ONE: out-of-combat scope.** Every run of both marathons saw some face of this. Today,
out of combat: any focus **decrease** counts as a spend (including your own GM bookkeeping edits);
every rule-owner on the scene watches everything; an adversary's own ability cost is taxed by enemy
watches; per-round ledgers **never reset**; "Restrained until your next turn" never expires.
*Recommended: gate scene/turn-keyed watches on an ACTIVE combat containing the owner, and tag engine
bookkeeping writes so GM edits do not read as spends.* This one decision retires a family of
symptoms rather than one row. *(3B-A.)*
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "go with your recommendations"** — i.e.
> **apply the recommended default above, both halves of it**: (a) gate scene/turn-keyed watches on
> an ACTIVE combat containing the owner, and (b) tag engine bookkeeping writes so GM edits are not
> read as spends. Filed as **TODO_REPO_HYGIENE #28** (lane B, Opus — this changes live engine
> behaviour and must be bench-verified before it counts as settled).
> **Scope note recorded by the PM at answer time:** this is the widest live-behaviour change in the
> current backlog. It should land in the two halves above as separate PRs, each with its own
> regression pinned, because (a) and (b) fail differently — (a) can wrongly silence a legitimate
> out-of-combat rule, (b) can wrongly classify a real spend as bookkeeping. R-5..R-8 all overlap
> this; **do not fold them in** — they are separate rulings still open, and R-8 in particular is
> explicitly flagged as overlapping R-4.
> **28a landed in PR #188 (2026-09-06)** — half (a) only: scene/turn-keyed watches now gate on
> `edhaInActiveCombat(actor)` (an ACTIVE combat containing the owner), with `scope: "self"` watches
> and the wall-clock prompt debounces deliberately ungated. **R-4 stays HERE, not in §K**: it settles
> only when **28b** (tagging bookkeeping writes) has landed AND the bench has confirmed the live
> behaviour — see the 🤖 rows under `# BENCH — Engine-wide & cross-tree`.
> **28b landed in PR #189 (2026-09-06)** — half (b): the engine now stamps the **spend**
> (`options.edha.spend`, plus a pre-use expectation for the system's own activation deduction) and
> `edhaIsSpend` reads an unstamped decrease as a GM edit, at the focus-change watch and the Order
> Investiture watch. **R-4 settles when the bench confirms both halves** — the three 28b rows sit
> with 28a's under `## Out-of-combat scope — ruling R-4, both halves`; until then it stays HERE.
> **Bench run 34 (2026-09-06) confirmed FIVE of the eight rows and R-4 STAYS HERE.** Passing in both
> directions, each against a matched control: the per-round ledger (fires every time out of combat
> and writes no `trigRound`; once per round in combat, re-opening on the round tick), the timed-status
> expiry (`timedExpire` intent out of combat → stamped to a coordinate on the first turn change →
> deleted on schedule; direct coordinate when a combat is already running), the out-of-combat focus
> watch (silent out of combat, both watchers firing on the identical spend in combat), the two-combats
> row (with the tracker showing combat B at round 9, combat A's round-3 ledger stayed spent and a
> scene watcher in A did not fire on a real spend in B), and "a GM focus edit is NOT a spend" (typed
> **and** committed through the real Token HUD focus bar, both silent, with a real spend firing in the
> same round immediately afterwards so the silence cannot be the once-per-round budget). **Three rows
> remain**, narrowed on the checklist: the negative control's window half (c), the `costs:`-rule half
> of the real-spend row, and the Investiture/Edict face. Note for whoever closes it: the literal
> "adversary's own bespoke ability cost" has **no subject in shipped data** — `data/adversaries.json`
> contains zero `"costs"` keys — see **R-74**.
> **Bench run 35 (2026-09-06) confirmed the last THREE rows, so all eight faces of R-4 now pass:** the
> negative control's window half (c) — a window armed out of combat by the real Ordered Advance was still
> open when the next move consumed it; the `costs:`-rule half — a `costs: "foc:2, inv:1"` rule spent
> focus 4 → 1 (cost + Whispered Doubt's extra) and Investiture 3 → 2 with the watch card, while that
> actor's GM hand-edit in the same round was silent; and the Investiture/Edict face — two hand-edits
> silent, two wired spends prompted.
> **Closed by TODO_REPO_HYGIENE #28 (PRs #188 + #189), verified by bench runs 34 and 35. Moved here by the
> PM on 2026-09-06.** R-5..R-8 remain their own rulings (R-5 settled by #29; R-6 sharpened; R-7 settled;
> R-8 open), and the two adjacent questions the work raised are **R-72** (involuntary drain) and
> **R-74** (no adversary pays an engine-driven cost).

**R-1. Should the PLAYER role keep `ACTOR_CREATE`?**
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): YES — keep the permission.**
> Consequence, per this ruling's own text: the `summon-actor` **relay branch is dead code at Ben's
> table**, and the checklist's `GM summon relay` row can never pass as written → **retire that row**.
> The relay code itself is NOT being deleted on this answer (the ruling decided the permission, not
> the code's fate; another world could revoke it). Filed as **TODO_REPO_HYGIENE #27**. Moves to §K
> when that lands — a ruling is not settled until the thing it decides has changed.

It has it in your world, which makes the `summon-actor` **relay branch dead code at your table** —
run 13's player-cast Construct worked perfectly but never used the relay. This is the only thing
blocking the checklist's `GM summon relay` row, and that row can never pass as written until you
answer: revoke the permission and the relay becomes reachable (the row becomes 🤖), keep it and the
relay is dead code and the row should be retired. *(From marathon 3A-1; blocks a checklist row.)*
**Closed by TODO_REPO_HYGIENE #27 (PR #184).** Consequence applied: the checklist's `GM summon relay`
row (`EDHA_FOUNDRY_TEST_CHECKLIST.md`, Engine-wide section) is retired with a ✅ note recording why —
the PLAYER role keeps `ACTOR_CREATE` at Ben's table, so `edhaSummon`'s `summon-actor` relay branch is
unreachable and the row could never pass as written; bench run 13's player-cast Forge Construct is
the evidence it never needed the relay. The ~1689 "Still open" bulk-note mention of the row was
updated the same way. The relay code itself is untouched — a comment was added at its tree-section
header and at the `game.socket.emit("summon-actor", …)` call site (both in
`module-src/scripts/register-skills.js`) plus a note on the `SUMMONS` row in `ENGINE_INDEX.md`,
saying the branch is reachable only in a world that revokes `ACTOR_CREATE`, so a future reader does
not "clean it up". Comment-only: stripped-source equality holds (`scripts/lib/strip-comments.js`).

---

**R-5. Does Fault Line's line spare allies?** The card says "each character"; the engine catches
enemies only. The same question applies to **every `kind: line` zone**. *(3B-B.)*
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "no it does not"** — the line catches
> **every character in it, allies included**. The card ("each character") is canon and the engine is
> the side that drifts: `edhaFaultLine` builds its caught set with `edhaEnemyTokensInLine`, so allies
> are neither damaged nor asked for the save. Consequence: the `kind: line` caught set becomes every
> token in the line except the caster (damage, the Construct multiplier AND the save/prone rider,
> because the card draws no friend/foe line), for every `kind: line` rule, not Fault Line alone. This
> is live engine behaviour → lane B, bench-verified before it counts. Filed as **TODO_REPO_HYGIENE
> #29**. **R-6 (the Region catching bystanders) is NOT decided by this** — same shape, separate
> ruling, still open. Moves to §K when #29 lands.

**Closed by TODO_REPO_HYGIENE #29 (PR #185), 2026-09-06 — ENGINE-ONLY (F5).** Consequence
applied in the line-zone helper, so **every** `kind: line` rule inherits it rather than Fault Line
alone: `edhaEnemyTokensInLine` is gone and `edhaTokensInLine` returns every LIVE token in the
length×width line **except the caster** (excluded by token id *and* by actor identity, so it fails
closed when the caster's token cannot be resolved); disposition plays no part. Both riders read that
one binding — the damage with its Construct multiplier, then the `edhaFoeSkillVsColor`
save/`failStatus` — so an ally in the line is damaged AND rolls the save. `edhaFoeSkillVsColor`
needed no change: it is disposition-blind (it rolls whatever token list it is handed, and
`edhaRollOpposedSkill` reads only the target's own skill/attribute), so "foe" is its name, not its
contract; the `saveSkill` field's Foundry label lost its "Foe"/"per foe" wording to match.
**Consumers of the kind: one — Fault Line** (`data/authored/deity-destruction.json`,
`FaultLineZone000`); no other authored rule or adversary ability uses `"kind": "line"`, so nothing
else changes shape. Pinned in `tests/line-zone-caught-set.test.js` (ally / neutral / caster /
exact-set / fails-closed, plus a source check that both riders read the same `caught` binding);
mutation-verified — restoring the enemies-only filter fails 3 of the 6 cases. **Live behaviour is
confirmed by the 🤖 row in `EDHA_FOUNDRY_TEST_CHECKLIST.md` (Destruction section), not by this
entry.** **R-6 is untouched**: the dangerous-terrain Region this zone drops afterwards catches
whoever it caught before — that ruling is still open.

---

**R-7. Final Decree / Edict's Temp HP rider swept "17 ally(ies)"** — and Final Decree's "every enemy
in Attunement Range" has no encounter scoping at all, so on a shared map it decree-bound five of your
placed playtest adversaries alongside the bench targets. Is Attunement Range the intended scope, or
should it be the encounter? *(3B-B, corroborated by run 8's 2bV-9 sighting.)*
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "attunement range is correct."** The
> shipped scope stands; the "17 ally(ies)" count was the bench fixture's 15 always-armed PCs (that is
> **R-8**, still open), not a scoping defect. **No engine change.** Consequence is docs-only: retire
> or re-word any checklist row that frames the wide sweep as a defect, and move this ruling to §K.
> Filed with R-19 / R-34 / R-49 as **TODO_REPO_HYGIENE #30**.
**Closed by TODO_REPO_HYGIENE #30.** Consequence applied: `EDHA_FOUNDRY_TEST_CHECKLIST.md`'s
BENCH — Order section carried the only row that framed this as open (the 2bV-9 "WORLD-HYGIENE /
SCOPE SIGHTING … for the rulings batch" note) — reworded to record the scope as confirmed correct.
No other row referenced the scope as a defect.

---

**R-19. Should combat-timing talents grant to ADVERSARIES as well as PCs?** They do now — the
retired hooks were gated `type === "character"` and rule-driven dispatch does not need that gate, so
an adversary carrying a combat-timing talent gets its combat-start grant. Deliberate change; say if
you would rather it stayed PC-only. *(Checklist 2bE-9. The mechanical half stays a 🤖 row.)*
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "yes"** — adversaries get the grant too.
> Confirms the shipped behaviour; **no engine change**. Consequence is docs-only: drop the
> "say if you would rather it stayed PC-only" hedge wherever the checklist repeats it (2bE-9 was
> already retired on evidence) and move this ruling to §K. Filed in **TODO_REPO_HYGIENE #30**.
**Closed by TODO_REPO_HYGIENE #30.** Consequence applied: no live row in
`EDHA_FOUNDRY_TEST_CHECKLIST.md` still carried the "PC-only" hedge — 2bE-9's own row was already
retired to a one-line evidence note at bench run 23 (2026-07-28l) with no hedge text left to drop.
Nothing to touch there; this closes the open question only.

---

**R-34. Walking Ruin has no token indicator.** The toggle is tracked internally and nothing on the
token says the character is leaving ruin behind — unlike **every** other scene-arm in the project
(Cascade Armed, Crowned, `withernext`, `warlord`). Consistency call. *(3B-D + checklist Destruction
row.)*
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "needs a region left behind."** Read by
> the PM as: **no token status icon — the ruin the character leaves behind is the indicator.** The
> engine already does this: the trail rule (`edha-place-hazard {mode: trail}`) drops a dangerous-
> terrain **Region** with a player-visible Drawing into every square the armed character moves
> through (bench run 14 fired Combustion Chain off exactly such a patch). So the consequence is a
> bench **confirmation**, not a build: one 🤖 row — arm Walking Ruin, move three squares on a player
> client, and see three ruin patches render for the player, not GM-only. If that row fails, it is a
> visibility bug in the hazard Drawing, not a new indicator. Filed in **TODO_REPO_HYGIENE #30**.
> *(Ben: if you meant something else by "left behind" — e.g. a lasting Region at the spot where the
> toggle ENDS — say so and #30 gets a build half.)*
**Closed by TODO_REPO_HYGIENE #30.** Consequence applied: reworded the Destruction section's
"HAS NO OPEN BENCH ROWS" note in `EDHA_FOUNDRY_TEST_CHECKLIST.md` to record the ruling, and added
the single new 🤖 confirmation row it calls for (arm Walking Ruin, move three squares on a player
client, confirm three ruin-patch Drawings render player-visible, not GM-only).

---

**R-49. Is a CREATURE an "obstacle" for a push's collision damage, or only a wall?**
Sent here by fix pass B (2026-07-28b) rather than decided silently. `edha-push` stops the victim when
the destination is occupied by a body exactly as it stops them at a wall, and both set the same
`collided` flag — so a victim shoved into another creature and stopped short currently takes the
wall-collision die ("… and slams into an obstacle for N impact"). Shockwave Slam's own text says "a
collision with an obstacle", which does not say whether a body counts.
Fix pass B changed only the incoherent half — **a push that travelled 0 ft now deals no collision
damage at all**, because nothing can slam into anything without moving. That much is not a judgment
call. Whether a push that moves 2.5 ft and *then* hits a body should roll the die is.
*Recommended default: YES, a creature counts — being slammed into someone is a collision, it keeps
one rule for both cases, and it is the behaviour that has shipped all along.* The alternative (walls
only) is a one-word engine change: gate the collision roll on `blockedBy === "wall"`. Engine-only
either way — **no pack rebuild**, so this can be flipped whenever you decide.
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): "an actor is an obstacle."** Matches the
> recommended default and the behaviour that has shipped all along — **no engine change**, no card
> change (Shockwave Slam's "collision with an obstacle" now reads as including a body). Consequence is
> docs-only: move to §K. Filed in **TODO_REPO_HYGIENE #30**.
**Closed by TODO_REPO_HYGIENE #30.** Consequence applied: no live row in
`EDHA_FOUNDRY_TEST_CHECKLIST.md` still asked this question (the retired Shockwave Slam evidence rows
already document the shipped body-counts-as-obstacle behaviour); no engine or card change needed —
matches the recommended default and shipped behaviour.

---

**R-3. `applyButtonsTo` now runs on one GM**, so only that GM sees its notification — but the
setting is **world-scope**, so the effect is global. Confirm that is intended. *(3A-5.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) intended, close it.** The
> world-scope setting with one GM seeing the notification is the intended shape; no change.

---

**R-8. Roster cross-talk between the 15 always-armed bench PCs** — every bench PC watches every
event, which is not a table condition. Is this only a bench-fixture problem, or does it say something
about how broadly watches should be scoped? *(3B-B; overlaps R-4.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) bench artifact only, close it.**
> R-4's combat gate already removed the out-of-combat cross-talk; no further watch scoping. Bench
> setups keep rosters to the actors under test — recorded as a runbook note. This also settles
> R-72's "decide together with R-8" clause: R-72 (b) stands on its own.
> **PM-R17 (2026-09-07, `docs/PM_BOARD.md`) updates the guard this ruling cites:** the two PC
> actor documents (Tem parinaem, Soggy Bottom) may now be REFRESHED by the PM and by agents
> (`⟳ Sync Talents`), never hand-edited — R-8's roster-scoping answer is otherwise unchanged.

---

**R-9. Does "cannot regain HP" block heal-overflow → Temp HP?** Blocked today: a fully-cut heal
leaves no overflow to convert, so Bench — Life's `edha-overflow-thp` produced nothing on a
Withering-Touch-blocked target. Is Temp HP a *heal* (blocked, as now) or a *grant* (should bypass)?
A **direct** Temp HP grant already bypasses and was measured doing so — 7 THP landed with HP pinned
and later absorbed 4. **This also decides how checklist row 2bW-1's own example must be re-worded**,
because as written it asks for something the mechanics cannot produce. *(3A-7 + checklist 2bW-1.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) BLOCKED, as now.** Overflow exists
> only if a heal landed; a direct Temp HP grant keeps bypassing. No engine change. Consequence:
> checklist row 2bW-1's example is re-worded to ask for something the mechanics actually produce.

---

**R-11. A fully-blocked heal still spends the click's cost.** Refund, or keep the cost? *(3B-C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) KEEP the cost, no refund.** No
> change.

---

**R-16. Wary now reduces Whispered Doubt's extra focus loss, usually to zero.** Observed live: Wary
+ Discipline 1 → net extra **0**, with a "🛡️ Wary: involuntary focus loss reduced by 1" card. Wary's
own text says *involuntary focus loss*, so this reads correct — but it did not happen before the
migration, because the loss now goes through the shared involuntary-focus path. Keep it, or restore
the old unreduced loss? *(Checklist 2bI-6.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) KEEP it; Wary's card says
> involuntary focus loss and this is one.** No change. Consequence: retire checklist row 2bI-6 on
> run-evidence.

---

**R-20. Should Pattern Recognition's disadvantage expire at the ROUND change?** It does now: the card
always said "their next test **this round**", and the old flag waited for ever. Say if you would
rather it kept waiting. *(Checklist 2bJ-3. The mechanical half stays a 🤖 row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) YES, as the card says ("this
> round").** Current behaviour stands; the mechanical half stays 🤖 row 2bJ-3.

---

**R-21. Should Phantom Double's out-of-range refusal become a pre-cost veto?** Identical player
outcome, and it removes the refund race *by construction* rather than by sequencing — but it drifts
the rule's own text and needs a leyline rebuild. **Default taken: leave it** (the text promises a
refund). *(3A-8.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) LEAVE IT (refund stays, card
> stays).** No change.

---

**R-24. Red / Momentum — is Reckless Advance the intended branch root?** The graph half is verified
live: the compiled Red tree reads Reckless Advance {skill red 1, no talent prereq}, with Burning
Drive and Volatile Strike hanging off it and Unstoppable at {Reckless Momentum, red 3}. The 07-24 fix
trusted the **layout + connections** over the card text, which had said "Burning Drive". If you
intended Burning Drive to come first, say so and the edge flips instead. *(Checklist Red row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) YES, keep Reckless Advance as the
> root** (Burning Drive and Volatile Strike hang off it). No change; retire the Red checklist row's
> graph half.

---

**R-26. What should a blank-note `edha-push` card say?** The old talent-specific default is
definitively gone (nothing says "Shockwave Slam" any more), but a fresh push rule with `note: ""`
does not read "Push" either — it reads **the owning talent's name** ("💥 Vigilant Stance — … is pushed
3 ft."). That is arguably better than a literal "Push". Say which is canon and the card, the row and
the engine get aligned to it. *(Checklist 2bA-6. Its two secondary observations were re-driven at run
12 and are artifacts of a hand-authored probe, not engine behaviour — `bySize: true` overrides
`distanceFt`, which is what "3 ft for a 5 ft rule" was really seeing.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) the OWNING TALENT'S NAME is
> canon** ("💥 Vigilant Stance — X is pushed 3 ft."). Current engine behaviour stands; DOCS-ONLY —
> align checklist row 2bA-6's wording and the handler's schema hint to it.

---

### K.2 — R-30 … R-22

**R-30. 2bR-17 spec vs rule.** The checklist row says Counterpoint tests "vs the target's **Cognitive
defense**"; the rule is `vs: "prompt-dc"` (the GM types the influence DC). Arguably correct for a
counter to an influence test — but the row and the rule disagree and one must move. Run 14 confirmed
the rule works as authored once a DC is typed. *(3A-12.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) the RULE is right: `vs:
> "prompt-dc"`, the GM types the influence result; reword the checklist row.** DOCS-ONLY.

---

**R-33. 2bI-3's card text stays enemies-only** while the behaviour is wider. Align the text or narrow
the behaviour. *(3B-C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) CLOSE IT: card and rule now
> agree.** The authored rule is disposition: enemy, and since R-4/28a/28b the watch fires only on
> declared spends inside an active combat containing the owner; the "wider" behaviour was the
> pre-R-4 cross-talk. No change.

---

**R-39. Is the roll dialog's die-icon COLOUR cue enough?** The advantage control in the cosmere
dialog is the rendered **d20 icon itself** — a pre-seeded CSS class, i.e. a colour, with no label,
no checkbox and no form field (which is why a DOM read reports nothing, and why run 11's "the dialog
exposes no advantage control" reading was retracted). It **is** pre-selected and it **is** overridable
by clicking. The one real limitation is that the preview line always reads `1d20 + N` and then rolls
`2d20kh + N`, because `configureModifiers()` runs after the dialog resolves. **If the colour is not
readable enough at the table, the answer is more whispered advantage cards like the quarry one — NOT
an engine change.** The look-at-it half is a ⚑ checklist row; the "so what do we do about it" half is
this ruling. *(3A-14.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) ACCEPT the colour cue; close
> this.** No change. The "does it read at the table" half stays a ⚑ row for Ben's next play session.

---

**R-41. Which map should the character-creation picker show — labelled or label-free?**
`module-src/assets/thyrcross-map.jpg` (1118×1488, byte-identical to the deployed copy) **still
carries every nation letter (`A Kettavar` … `J Canticle`) and all 13 numbered city labels**: the
07-19s "label-free map" fix was **silently reverted twice**, by `db79969` and `b114f7e`, each of
which regenerated the jpg from `thyrcross-labeled.png` because `scripts/build-map-picker-asset.js`'s
docstring still told them to. *(The docstring is fixed; the asset was deliberately NOT regenerated,
because that is this ruling.)* **Two checklist rows contradict each other and one must be retired
either way:** *"Map v3: label-free"* wants no labels, while *"Map picker shows the redrawn map"* names
**"Goldenport wash running the whole west coast"** as its giveaway — and that wash exists **only** on
the political/labelled render. Aspect is fine either way (0.7513 == canvas aspect), so this is purely
a look call. *(3A-16.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) keep the LABELLED political
> map.** Consequence: retire the "Map v3: label-free" checklist row; keep "Map picker shows the
> redrawn map"; the jpg stays as served.

---

**R-53. Should a creature whose own cue says it "goes still instead of dying" still get the `Dead` status?**
Raised by bench run 19. The Briar-Gone Grove's 0-HP cue posts *"0 HP — it goes still instead of dying;
the blight stands."* — and the generic `updateActor` 0-HP branch then stamps the **`Dead`** status and
its skull overlay anyway, so the table sees a corpse marker under a card that just said it is not a
corpse. Both behaviours are individually correct; they just contradict each other on the canvas.
*Recommended default: leave the engine alone and treat the skull as "out of the fight" shorthand —
the cue is the authority and the GM reads it.* The alternative is a `noDeathStatus` dial on the
0-HP branch for blocks that explicitly do not die, which is one small generic field (ENGINE-ONLY) and
would also serve any future construct/blight. Not worth building on one block; worth building on three.
*(Checklist W29 §4 "Register cues", which PASSED — this is a polish question, not a defect.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) LEAVE IT; the skull means "out of
> the fight", the cue is the authority.** No change. Revisit the `noDeathStatus` dial when a third
> such block exists.

---

**R-57. Pattern Recognition's disadvantage now EXPIRES when the round turns — keep that, or let it
wait?** The card has always said "their next test **this round**"; the old flag waited for ever, and
the 2b conversion made the text true via `expireEndOfRound`. **The behaviour is verified working**
(bench run 23, both directions: with the stamped round current the victim rolled `2d20kl + 2` and the
card printed "🔮 Pattern Recognition — disadvantage on this test", flag consumed; with the round moved
on the same victim rolled a plain `1d20 + 2`, no card, flag left unconsumed). So this is purely your
call on intent: **(a)** keep the expiry, matching the card — *Recommended*, the text is unambiguous;
**(b)** restore the wait-for-ever behaviour and re-word the card to drop "this round". ⚠️ Note the
side effect either way: a stale un-expired mod is **left on the actor rather than cleared**, so under
(a) a victim can accumulate dead `nextTestMod` flags until something overwrites the single slot (the
same one-slot overwrite characterised in R-15). *(Checklist 2bJ-3, retired run 23.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) KEEP, settled by Ben's R-20 answer
> (same question).** Its stale-flag side effect is absorbed by R-15 (b)'s fix, shipping in **item
> 49**: the `nextTestMod` LIST prunes expired entries.
> **SHIPPED** in PR #221 (ENGINE-ONLY, bench-pending) — `tests/next-test-mod-list.test.js`; the
> stale-flag half is 🤖 checklist row **2bI-4c**.

---

**R-75. The `edha-test-react` (H26) reaction family is NOT combat-gated — is that right?** Observed at
bench run 34 as a card nobody came for: `Bench — White`'s **Shared Conviction** posted its offer on a
Deception test by `Bench — Black` while **White was in no combat at all**. That is not a 28a
regression — the handler carries no `scope` field, so it never reaches `edhaWatchCombatGate`, and
28a's "deliberately NOT gated" list in the handoff simply does not mention this family. The same is
true of `Pillar of Order` and `Voice of Authority`, which also fired unprompted during the run.
*Recommended: **leave it ungated, and say so in the docs.*** An ally about to fail a social or
exploration test is exactly the out-of-combat case R-4's negative control exists to protect, and
Shared Conviction's own text is not combat-flavoured. But it does mean a White PC standing anywhere
on the scene offers a reaction on **every** skill test any creature in Attunement Range rolls, which
at a busy table is chatty. If you want it quieter the fix is a field on the rule (an `inCombatOnly`
dial), not an engine gate — iron rule 2b. *(Bench run 34.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) leave it ungated, and document
> it.** DOCS-ONLY: the H26 family (Shared Conviction, Pillar of Order, Voice of Authority) is added
> to 28a's "deliberately NOT gated" list in `docs/handoff-changelog/2026-09.md` (item 28a's delta) and `ENGINE_INDEX.md`; no
> engine change.

---

**R-76. The engine's ONE spend-stamped resource write has no consumer either — H10's Investiture
drain does not exist on any talent.** Measured at bench run 35 while driving item 13's row, which
named "H10's `edha-focus` Investiture DRAIN (`op: drain`, `resource: inv`) — Reaper's Harvest is the
reference". A sweep of all three packs found **exactly one** `edha-focus` rule with `resource:
"inv"` in the whole game — Reaper's Harvest — and it is **`op: "gain"`**, which takes
`edhaBookkeepingTag`. **No shipped talent carries `op: "drain"` + `resource: "inv"`**, so the single
`edhaSpendTag` site that item 13 preserved (`register-skills.js` ~18139) is dead code on the table
today. The bench proved the branch works by staging the rule by hand, so this is not a defect —
it is the exact shape of **R-74** one layer up: an engine path with no consumer. *Recommended:
**author the drain onto a talent that should have it** — a Death/Morrath or Black drain that takes
Investiture rather than focus is the obvious home, and it would give both R-74's contrast and this
branch a real subject in one edit.* The alternative is to say so in the header and leave it: the
branch is one ternary and costs nothing to keep. ⚠️ This is an **authored-data** change (a `pack
rebuild + ⟳ Sync`), so it is not a bench decision. *(Bench run 35, from item 13's bench row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) leave the branch, note it in the
> header.** With R-72 (b) landing, the branch's stamp becomes bookkeeping, not spend. Ben's design
> note, verbatim: "make a note this is good juice for a future adversary stat block" — recorded as
> a design seed (see this item's PR report for where it landed). DOCS-ONLY; the engine header
> cross-reference itself is `module-src/` work and out of scope for a docs-only item — left for
> whoever next touches H10.
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — the H10 header note landed alongside
> R-72's tag flip; `tests/resource-writes.test.js` pins the branch's classification, and the branch
> is kept and declared unconsumed on purpose.

---

**R-79. Region traps on a GM-less table — do the three `RegionBehavior` bodies (Civ fortified
foundation, dangerous terrain, Fate snare) still spring when no GM is connected?** Filed from the
board (item 12 / PR #197): the region-trap behaviours execute on the walking player's own client
when no GM is online, rather than staying silent for lack of a GM to arbitrate them.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) KEEP** — the three `RegionBehavior`
> bodies keep springing on the walking player's own client when no GM is connected. DOCS-ONLY:
> recorded in `docs/handoff-changelog/2026-09.md` (item 28a's delta) deliberately-ungated list and in
> `ENGINE_INDEX.md`'s "the gate is TWO helpers" note as Ben's ruling.

---

**R-43. ⚠️ "A card that says 'tests Speed' means the ATTRIBUTE." — THIS CHANGES LIVE DICE MATH.**
**Concussive Yield** and **Inevitable Snare** now add the target's Speed where they previously added
nothing. The *implementation* is proven — run 11's 2bAD-1 rolled "Speed 29" with spd 10, and a bare
d20 cannot exceed 20 — but **the balance question is untouched and is worth one deliberate look.**
This is the item to read first if you read only one in this section. *(3B-E.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." R-43's live-dice-math change is confirmed. No further change; the 🤖
> re-test rows citing this ruling stay bench work.

**R-44. The Pack's placement no longer requires `amt > 0`.** With the marker hand-cleared and the
pointer surviving, The Pack posts **no** bonus card but **still places** its Insight. *(3B-E.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-45. Confident Command's `per` is Persuasion.** The same dead id `per` resolved differently in two
talents — Sharp Eye's `per` was **Perception** (`prc`) — which is exactly why the two could not be
swept together. *(3B-E.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-58. ⚠️ A scene reset now SKIPS any actor fighting in another combat — and "another combat" means
any that still EXISTS, started or not.** Fix pass F, after run 23 watched a bench combat's deletion
take `lists.covenants` off an actor in your live combat. The invariant applied is *"ending combat A
must not clear state on a combatant of a still-existing combat B"* — deliberately **not** "sweep only
combat A's own combatants", because the wide sweep is intended (Temp HP is meant to reach summons and
unlinked adversaries that never rolled initiative). **With one combat in play nothing changed at
all.** The judgment worth your veto is the *fail-safe direction*: an un-started leftover combat still
counts, so if a stale empty combat sits in your sidebar containing a PC, that PC stops getting scene
resets until you delete it. I chose that because a wrong skip leaves stale state you can clear, while
a wrong clear destroys a live encounter's data. Say the word and it becomes `started`-only.
*(Related to R-4 / R-7 / R-8 — this is the cross-COMBAT face of the scope family, not the
out-of-combat one, which is still open.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-59. ⚠️ A chat-card button that fails now raises an error toast**, where all 33 previously wrote
only to the console. This is what let Living Image's Pay button read as a silent no-op for four bench
runs. Bounded to the 33 *outer* click-handler catches — the ~270 inner defensive catches stay quiet.
**The feel question is yours:** if a toast at the table is more disruptive than a button that quietly
does nothing, say so and it goes back to console-only (or becomes GM-only). *(Fix pass F.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-60. ⚠️ Scene-reset sweeps now cover ONE population: directory actors ∪ canvas tokens,
deduplicated.** Before, the ten per-tree sweeps answered "who gets reset" five different ways —
Sovereignty reset canvas tokens ONLY (an off-scene character kept `dieStep` forever), Life swept
every directory actor including adversaries and summons, and only Chaos deduped an actor with a
token against its directory entry (the rest swept it twice). All ten now run through one
`edhaSceneReset` applier using the Chaos-pattern population; each tree's flag/status lists are
unchanged, and the R-58 cross-combat guard still applies per actor. The veto surface: if some
tree's narrower sweep was intentional, name it and that tree gets a scoped population.
*(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-61. `oncePerScene` now has ONE gate and ONE stamp — each handler type keeping its CURRENT
polarity.** The same field name meant four things (default-off, default-on, strict-true, plus a
rogue `detonateUsed.*` flag namespace with its own scene-clear). No live behavior changes: the
shared gate takes the polarity as an explicit per-type argument matching what each did before, and
`detonateUsed.*` merges into `sceneOnce.*` (the gate reads both keys, writes only `sceneOnce`).
One real fix rides along: `edha-decree` stamped its scene-once flag UNCONDITIONALLY while vetoing
conditionally — the stamp now matches its own veto. Whether all types should converge on one
polarity is a separate, untaken ruling. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-62. "Whisper the GM" now has one helper with an explicit audience.** Two spellings disagreed:
`getWhisperRecipients("GM")` reaches every GM including offline ones; the `u.active && u.isGM`
filter reaches online GMs only. Applied mapping: action-prompt cards (someone must click NOW) →
active GMs; record/audit cards → all GMs, so the log survives to a later login. If a specific card
lands on the wrong side of that line, name it. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-63. ⚠️ Unknown token disposition now fails CLOSED everywhere.** Twelve inline checks still
defaulted a missing disposition to FRIENDLY (`?? 1`) — the convention the ally-drop fix explicitly
retired after bench run 18 measured the cross-disposition bug — and one helper failed OPEN to
"enemy". All now use the Number.isFinite guard: no disposition, no effect. This can change live
behavior for tokens with genuinely unset disposition; if a talent should treat unknown as friendly,
that is one veto away. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-64. ⚠️ Victim resolution now uses the full 3-term chain everywhere:
`options.victim → options.target → the clicking user's current target`.** Six handler sites skipped
the middle term, so an event that carried `options.target` (but no `victim`) fell through to
whatever the CLICKING USER happened to have targeted — a different creature. This changes live
targeting on those six paths, in the direction of "the creature the event was actually about."
*(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-65. ⚠️ Every formula roll now passes through `edhaFoldDieMath`, via one `edhaRollFormula`
helper — THIS CHANGES LIVE DICE MATH on ~25 sites.** Only 4 of 29 roll sites folded computed dice;
the documented [Tier][Die] convention (`(@tier)d(2 * rank + 2)`) silently failed on the rest —
including a heal branch whose own damage twin, eight lines below it, folded correctly. Talents
whose formulas use no computed dice are unaffected. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-66. One-shot card buttons now persist their used state via `edhaMarkCardResolved`.** Fifteen
cards disabled their buttons in the DOM only — an F5 or a second client revived them (the exact
Flame Surge bug the helper was built for). Cleanse, reknit, counter-transfer, mutation, plot-grant,
designate and friends now stay spent on every client. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-67. Chaos and Fate burst cards gained the `whisper` option the other four tree-card helpers
already had.** Additive — nothing whispers that didn't before; it just becomes possible.
*(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-68. The map toolchain's "is this pixel painted" alpha threshold is now ONE constant, 128.**
`trace_regions` used 120 and `trace_nations` used 128 for the same question against the same
layers. Applied 128 — the explicitly named constant. If a re-trace ever shifts a boundary by a
pixel, this is why; 120 is one veto away. *(Hygiene campaign 2026-08-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): ACCEPTED — no veto.** "14 defaults
> let's just keep using." No further change.

**R-22. `edhaConsumeList` refunds `value.min`.** If a talent ever ships `min ≠ max`, the system's
consume dialog lets the player pay more and the refund would under-credit. No talent does today —
this is a "close the door before it matters" call. *(3A-6.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) close the door with a BUILD
> GUARD** — lint-refs (or validate.js) fails if any talent or adversary ability ships a consume
> entry with `min ≠ max`, so the under-refund can never happen silently; no engine change.
> TOOLING-only → **item 60**; mutation-verified (author a min≠max cost in a scratch copy → gate
> fails).
> **SHIPPED in PR #225 (TOOLING-only)** — traced the only two producers of a consume entry
> (`foundry-build.js`'s `parseCost()`, which always emits `min===max` for both generated-talent
> and adversary cost text; `data/authored/*.json`'s `activation.consume[].value`, the one place a
> talent's consume shape can carry an independently-set min/max) and scanned the real risk surface
> — `scripts/lib/consume-guard.js` (`checkConsumeEntries`) plus `scripts/lint-refs.js` pass 23,
> which feeds it every authored-overlay talent AND every adversary ability (re-derived from its
> text grammar rather than assumed safe). Floor pinned at 200+ entries scanned (measured: 235).
> Mutation-verified against real data (Black's Cruel Step, `min` 1 → `max` 6 → `lint-refs.js`
> fails naming it, restored → clean) and pinned in `tests/consume-guard.test.js` (5 cases). No
> engine change, nothing left to bench. **Moved to §K in the same PR (2026-09-06).**

### K.3 — R-80 … R-6

**R-80. Both an advantage AND a disadvantage next-test entry on one victim — do they cancel, or does disadvantage win?** With the next-test slot a LIST since item 49 (PR #221, 2026-09-06), a victim can carry both an advantage entry and a disadvantage entry for the same test — impossible under the old single slot. Item 49 folds them by boolean-OR per direction and, when both are present, writes NOTHING: the roll stays exactly as the player configured it (the standard table rule that they cancel; it never stomps a manual dialog choice). *Recommended default: **(a) they cancel** — **APPLIED** in #221.* (b) disadvantage wins — one line in `edhaNextModFoldMode`, pinned, so a veto is a one-line diff. *(Board table 2026-09-06; raised by item 49.)*
> **ANSWERED 2026-09-07 (Ben, dashboard) — marked done, no note = the applied default ACCEPTED,
> no veto.** No change to the shipped code (PR #221). **Moved here by the PM on 2026-09-07.**

**R-81. Three more `bySize` charge distances whose cards print the rank-3 number — the R-46 treatment on all of them?** R-46 / R-48 fixed two charge distances by replacing `bySize` with an explicit `distanceFt`. Item 57's worker found the same shape on three more run-19 blocks — the Brandram's Shockwave Slam (`bySize: true` beside a dead `distanceFt: 5`) and Reckless Advance, and the Tussock-Sow's terrain square — all `bySize` at rank 2 while their cards print rank-3 numbers. *Recommended default: **(a) yes, the R-46 treatment on all three** (explicit `distanceFt` = the card's own number, stated on the card) — **APPLIED** by item 67 (PR #232; REBUILD owed to the next deploy).* (b) fix the three cards to the rank-2 numbers instead. Ben's R-48 answer of 2026-09-06 ("a statted block should not scale") rests on the same principle. *(Board table 2026-09-06; raised by item 57.)*
> **ANSWERED 2026-09-07 (Ben, dashboard) — marked done, no note = the applied default ACCEPTED,
> no veto.** No change to the shipped code (PR #232; REBUILD still owed to the next deploy for the
> pack to carry it live). **Moved here by the PM on 2026-09-07.**

**R-84. An offer that CANNOT be made still charges its Investiture — refund that too?** Measured at
bench run 40 (2026-09-06) while driving item 51's R-17 rows. **Unnerving Approach** used against a
target with no living ally within 10 ft posts its `emptyNote` card — *"no living ally of your target
within 10 ft to push (it may already be Isolated)"* — and the SYSTEM has already taken the
Investiture (measured **2 → 1**, with no refund and no Decline button, because there is no offer to
decline). R-17 refunds a **declined** or **ignored** offer; it says nothing about an offer that never
existed. From the player's side the three cases are indistinguishable: the cost left, nothing
happened. *Recommended: **(a) refund it** — reuse `edhaOfferDecline`'s `edhaRefundCost` path on the
`emptyNote` branch whenever `edhaOfferRefundable` is true, i.e. the same gate R-17 already computes.*
(b) keep charging — "you spent the Investiture looking" is a defensible table rule, but then the card
should SAY the cost was spent. Either way the card needs to stop being silent about the money.
*(Bench run 40; from item 51 / R-17.)*
> **DEFAULT (a) APPLIED 2026-09-06 (fix pass 9, TODO 72, ENGINE-ONLY → F5).**
> The `emptyNote` branch now computes `edhaOfferRefundable(item, event)` — R-17's own gate,
> unchanged — and refunds through `edhaOfferDecline(null, item, …, {refund: true})`, so
> `edhaRefundCost` still has **exactly one caller** in the offer family (the pin that guards that
> invariant is unmoved). The card names the money either way. One deviation from the ruling's own
> wording, stated: the non-refundable line reads **"no cost was spent"**, not (b)'s *"the cost was
> spent"* — with R-17's gate, `refundable === false` on this branch means the offer came from a
> watch / success rule where the system charged **nothing** (that rule's `costs` land on the click,
> which never happens here), so "spent" would be false. Fixed for all three `source: "creatures"`
> rules carrying an `emptyNote`: Unnerving Approach (Black + its adversary twin), Anticipate (Blue),
> Terms of Accord (White). Four cases pinned in `tests/offer-decline-refund.test.js`; dropping the
> refund call fails the first. 🤖 re-test row on the checklist.
> **ANSWERED 2026-09-07 (Ben, dashboard) — marked done, no note = the applied default ACCEPTED,
> no veto.** No change to the shipped code. **Moved here by the PM on 2026-09-07.**

**R-85. `expireEndOfRound` stamps the GRANTER's combat — should it fall back to the BEARER's?**
Measured at bench run 40 while driving **2bI-4c**. `edha-next-test-mod` writes
`mod.round = edhaCombatRoundOf(owner)` (`register-skills.js` ~L21116), and the comment says "the
GRANTER's combat (edhaNextTestMatches reads the BEARER's — same combat at the table)". When the
granter is **not a combatant** the stamp is `round: null`, and a `null` stamp can never expire — so a
"this round" rider granted from outside the tracker sits on the victim for ever. Reproduced exactly:
Pattern Recognition cast by a `Bench — Blue` that was not in the combat wrote
`{source:"Pattern Recognition", round:null, …}`; adding Blue as a combatant and re-casting wrote
`round: 8` and the rider then expired on schedule. The row itself PASSES once both are in the
tracker, so this is a ruling, not a defect. *Recommended: **(a) fall back to the BEARER's combat when
the granter has none** — `edhaCombatRoundOf(owner) ?? edhaCombatRoundOf(target)`; a "this round"
rider then always means the round the victim is living in.* (b) leave it — out of combat there is no
round and an inert stamp is honest; the cost is that a mid-combat grant from a non-combatant NPC
never expires. *(Bench run 40; from item 49 / 2bI-4c.)*
> **DEFAULT (a) APPLIED 2026-09-06 (fix pass 9, TODO 72, ENGINE-ONLY → F5).**
> `mod.round = edhaCombatRoundOf(owner) ?? edhaCombatRoundOf(target)`, exactly as recommended. The
> in-combat case is untouched (the granter's round still wins, even when the bearer is in a
> different one — the fallback is a fallback); with BOTH sides out of combat the stamp is still
> `null`, which is (b)'s honest answer for the only case where it is actually honest. Five cases
> pinned in `tests/next-mod-round-fallback.test.js`, driving the shipped executor; removing the `??`
> fails the fallback case. 🤖 re-test row on the checklist.
> **ANSWERED 2026-09-07 (Ben, dashboard) — marked done, no note = the applied default ACCEPTED,
> no veto.** No change to the shipped code. **Moved here by the PM on 2026-09-07.**

**R-86. GM-less and two-GM tables are not a scenario worth engineering rulings for.** Raised on
Ben's dashboard 2026-09-07 against a cluster of checklist rows and rulings premised on either
scenario (bench run 42's 2bM-1, the one-applier dissipates re-test, Job 6a, R-77's two-GM
defense). Ben, verbatim: *"There will never be no GM connected. This isn't needed, and any similar
items aren't needed. There will always be a GM session as the Edha Module needs one to load."* and,
on the same card: *"In-play there will never be 2 GM clients. I'm marking this 'skip'."*
> **ANSWERED 2026-09-07 (Ben, dashboard) — settled directly, no code change.** Consequence:
> checklist rows premised on a GM-less table or two live GM clients are RETIRED, not run — bench
> run 42 retires **2bM-1**, the one-applier-dissipates re-test, and **Job 6a**. This does **not**
> touch the engine's primary-GM gate (R-77) or the GM-less region-trap behaviour (item 12 / PR
> #197's ruling) — those stay exactly as built: **the bench itself joins Ben's table as a second GM
> client** (`bench-run`'s whole method, `Bench` alongside `Gamemaster`), so both gates remain
> engineering necessities that protect a real in-session shape, not table rules being tested for
> their own sake. Filed direct to §K — no TODO item, no engine change, nothing to bench beyond the
> two checklist retirements above.

**R-87. The character-creation wizard's numbers stand — no veto.** Both VETO CHECK rows on Ben's
dashboard 2026-09-07 (12 attribute points at L1 / max 3 per attribute at L1, +1 at levels 3, 6, 9,
12, 15, 18; skills 5 + (L−1)×2 total ranks, max rank INT((L−1)/5)+2 — source:
`Character_Building_Rules.md`, the legacy spec) were skipped with no note.
> **ANSWERED 2026-09-07 (Ben, dashboard) — skipped both VETO CHECK rows = no veto, the wizard's
> spec stands as built.** No code change; the wizard's 🤖 enforcement rows keep testing exactly that
> spec. Filed direct to §K — nothing to change, nothing new to bench beyond the existing rows.

---

**R-2. Should `scripts/bench-setup-console.js` give bench PCs a normal sight range?**
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): YES — give them normal vision.**
> Matches the recommendation. Consequence: raise the bench PCs' 10 ft sight in
> `scripts/bench-setup-console.js`. Filed as **TODO_REPO_HYGIENE #26**. The **adversary** 10 ft is
> explicitly NOT touched — it stays a design dial and a ⚑ row, exactly as this ruling says.

They carry **10 ft**, which makes a player client render almost nothing — it already caused a
near-false-PASS at run 13. *Recommended: yes, give them normal vision.* Distinct from the adversary
10 ft, which is a deliberate design dial and stays a ⚑ checklist row ("Adversary sight range — does
10 ft feel wrong? Say a number"). *(3A-2.)*

---

**R-74. No adversary ability in the game pays an engine-driven cost — should one?** Measured at bench
run 34 while trying to drive R-4's last 28b row: **`data/adversaries.json` contains zero `"costs"`
keys** across all 52 blocks, so the sentence "an adversary's own bespoke ability cost goes through
`edhaSpendResource` and therefore counts as a spend" is true of the engine and true of nothing on the
table. Every adversary resource change today is either a GM hand-edit (now correctly *not* a spend,
per 28b) or nothing at all. Two consequences worth your call, and they point opposite ways.
*Recommended: **author one `costs:` line onto a single adversary ability** — the Stalker's `Fade` or
the Stonebound Captain's signature is the obvious candidate — so the wired-vs-typed contrast that 28b
is built on exists somewhere in the shipped bestiary, and the bench row has a subject.* The
alternative is to declare the half untestable-by-construction and close it, which is honest but
leaves an engine path with no consumer — the same shape as the `senses` field retired in 07-27v.
⚠️ This is a **REBUILD** either way (it is `data/adversaries.json`), so it is not a bench decision.
*(Bench run 34, from the R-4 28b row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) author one `costs:` line onto a
> single adversary ability.** Ben did not pick the subject; default to the Stalker's Fade unless a
> better fit turns up. `data/adversaries.json` (+ baked AEs if any) → adversaries pack **REBUILD**,
> Ben's deploy → **item 57**; lint pass 5 must stay green; then the 28b "adversary bespoke cost"
> bench row finally has a subject.
> **SHIPPED** in PR #226 (REBUILD, bench-pending) — the Stalker's **Fade**: a `use` → `edha-prompt-pick`
> {source: confirm, costs: "inv:1"} card spends the Investiture on the click (through `edhaSpendResource`),
> native `consume` removed so it is the only deduction; the damaged gm-cue stays as the reminder. Fit:
> Fade is a Reaction the GM decides to take, and a confirm card that charges on the click is exactly
> "spend only if you take it". 🤖 row under the R-4 28b section.

---

**R-78. The `edha-aoe-template` handler has NO consumer either — retire it, or give it one?**
Measured at bench run 38 while driving the "AoE burst auto-target" row. That row names **Flame
Surge** as its example, but Flame Surge carries an **`edha-burst`** rule, and `edha-burst` goes
through `edhaCastBurst` → `edhaBurstDetonate`, which **never targets anything** — it resolves damage
straight to the caught actors. The retarget the row is actually about (`edhaSetUserTargets(caught)`,
`register-skills.js` ~L10829) lives only in **`edhaPlaceAoe`**, which is reachable only from the
**`edha-aoe-template`** handler — and a sweep of `data/` finds **zero** `edha-aoe-template` rules
against **12** `edha-burst` rules (3 talents: Flame Surge, Sudden Growth, Mending Aura; the rest
adversary abilities). So a registered handler type is offered in Ben's Events-tab dropdown that
nothing in the game uses. The bench proved the branch works by staging the rule by hand (2 enemies
captured **and** targeted, an ally target released), so this is not a defect — it is the third
instance of the **R-74 / R-76** shape: an engine path with no consumer. *Recommended: **retire
`edha-aoe-template`*** — unlike R-74's and R-76's, this one is not a small missing dial but a
**second, parallel AoE model** that the click-to-place/Detonate pipeline replaced, and leaving both
registered invites an author to pick the dead one. The alternative is to keep it as the "capture and
target, GM applies by hand" variant and say so in the header. ⚠️ **ENGINE-ONLY either way** (no
authored data references it, so no pack rebuild). *(Bench run 38, from the AoE burst row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) RETIRE the handler.** Spec: remove
> `edha-aoe-template`'s registration + `edhaPlaceAoe`'s template branch (keep whatever
> `edhaCastBurst` / `edha-burst` share), lint-refs vocabulary + native-vocabulary snapshot untouched
> (it is an edha-* type), `ENGINE_INDEX.md` row struck with the date, name-keyed allowlist
> unaffected. ENGINE-ONLY, F5 → **item 48**; gates must stay green; retire the "AoE burst
> auto-target" row's remaining clause.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/aoe-template-retired.test.js:"R-78: edha-aoe-template is NOT a registered handler type, and edha-burst still is"

---

**R-77. Should the Investiture-max persist be behind the primary-GM gate, or stay owner-gated?**
Found at bench run 36 while driving item 12's two-GM row. `edhaDeriveInvestiture`'s persist branch
(`register-skills.js` ~17252) is a world write — `system.resources.inv.max.override` — and it is
**not** behind `edhaDefBuffGmGate()`. It gates on **`actor.isOwner`** plus a **per-client**
`_edhaInvPersisted` Set, so with two GM clients connected the writer is *whichever client prepares
the actor first*: the bench measured Ben's **non-primary** `Gamemaster` writing `override: 6` on
`Bench — Red` and the **primary** `Bench` writing `override: 5` on `Bench — Blue`, in the same
window. Both clients derive the same number (`2 + max(Awareness, Presence)`), so the harm today is a
redundant write, not a wrong value — but it is the one world-writing site item 12's consolidation
did not reach, and it is the family that produced the historic double-write bugs.
*Recommended: **keep the owner gate, and add the primary-GM gate only for the GM case*** — i.e.
persist if `edhaNoOtherActiveGM()` **or** the writer is a non-GM owner. That preserves the reason
the owner gate exists (a player-owned PC must be able to persist its own max on a table where no GM
is online, which is what `edhaDeriveInvestiture`'s 2026-06-11 gotcha comment is about) while making
two GM clients agree on one writer. The blunt alternative — `edhaDefBuffGmGate()` outright — is
simpler but silently stops persisting for player-owned PCs whenever the primary GM has not looked at
the actor. **ENGINE-ONLY either way** (no pack rebuild). *(Bench run 36, from item 12's bench row;
the re-test row is on the checklist under `# BENCH — Engine-wide & cross-tree`.)*

> **APPLIED as the recommended default 2026-09-06 (fix pass 6, ENGINE-ONLY) — pending Ben's veto.**
> `edhaDeriveInvestiture`'s persist branch now also requires `!game.user?.isGM ||
> edhaNoOtherActiveGM()`: a GM defers to the **primary** GM, a **non-GM owner still writes** (so a
> player-owned PC on a GM-less table keeps persisting its own max, which is the whole reason the owner
> gate exists). The blunt alternative — `edhaDefBuffGmGate()` outright — is **not** what shipped.
> Both directions are pinned in `tests/inv-persist-gm-gate.test.js` and mutation-verified: drop the
> new term and the second GM writes again; swap in the blunt gate and the GM-less player-owned PC
> stops persisting. **A veto is a one-line change** with a failing test on whichever side you pick,
> so say the word and it flips. The ruling stays OPEN until then.
>
> ⚠️ **Bench run 37 (2026-09-06) could NOT confirm the applied default at the table, and the
> reason is not the code.** The gate reads correctly from the primary client (`activeGM` = `Bench`,
> `isSelf` = true, so `mayPersist` = true there and false when the same expression is evaluated for a
> non-primary GM), but an airtight probe — a fresh character created carrying the CORRECT override so
> neither client's per-session Set was seeded, then made stale in one update — measured the single
> `inv.max.override` write originating on **Ben's non-primary `Gamemaster`**. The most probable
> cause, stated as an inference: **Ben's client has been connected since before the 03:47 engine push
> and fix pass 6 is ENGINE-ONLY**, so it is still running the pre-fix engine, which has no gate at
> all. **This does not change the recommended default and does not reopen the design question** — it
> only means the applied default is still unverified live. Re-test after Ben F5s his client.
>
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) keep the applied default** (GMs
> defer to the primary GM, a non-GM owner still writes). No change to the shipped code. Moves to §K
> once the live re-test passes after Ben reloads his Gamemaster client — the run-37 blocker was the
> stale client, not the code.
> **CONFIRMED 2026-09-07 (Ben, dashboard), verbatim: "that works. default."** No change to the
> shipped code or the ruling's status — same veto window, still moves to §K once the live re-test
> passes. Separately, on the bench's one-applier-dissipates re-test row (not this card), Ben noted
> two GM clients will never happen at his table in play — recorded as new **R-86** (§K); it does
> not change this ruling's applied default: the bench itself is a second GM client, so the gate
> stays an engineering necessity and the live re-test is still what is owed.

---

**R-6. Fault Line's dangerous-terrain Region catches bystanders scene-wide**, with no friend/foe
clause — it incidentally ticked your **Stitchmother** during run 11 (effects verified back to
snapshot state afterwards). Same shape as R-5 but on the Region rather than the line. *(3A-4.)*
> **Measured again 2026-09-06, bench run 33, and it is wider than "bystanders": the Region catches
> the CASTER.** The rectangle is laid with one end at the caster's own square, so on both casts the
> chat read *"🔥 **Bench — Destruction** takes 8 energy from dangerous terrain (Dangerous Terrain —
> Bench — Destruction)"* (10 on the second) — and the ally in the line took its own tick on top of
> the burst. So R-5's "only the caster is spared" does **not** carry over to the Region: right now
> **nobody** is spared, the caster included. Recommended default unchanged in shape, but the ruling
> should now say explicitly whether the caster's own square is dangerous terrain to them.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) spare the CASTER only, everyone
> else including allies is caught.** Matches R-5 / item 29 for the line, so both halves of the
> talent follow one rule. Spec: the dangerous-terrain Region (and its tick) exempts the actor that
> laid it — either lay the rectangle one square out from the caster or exempt the caster's token
> from the tick; Ben did not choose which. The ally-in-the-line burst + terrain double hit stays.
> ENGINE-ONLY, F5 → **item 48**; lane R then a 🤖 re-test of the run-33 Fault Line row with the
> caster unharmed.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/fault-line-caster-exempt.test.js:"R-6: the CASTER standing in their own Fault Line takes 0 — no damage, no card". Of the two exits Ben left open, this took EXEMPT-THE-CASTER and kept the rectangle on the damaged line; the delta says why.

---

### K.4 — R-10 … R-82

**R-10. Does "cannot regain HP" stop drop-to-1 stabilization?** Same family as R-9, different
consumer. *(3B-C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) NO, stabilizing at 1 is a floor
> against death, not regaining.** Spec: every drop-to-1 / stabilize consumer must bypass the no-heal
> condition (audit the family: whatever writes `hea.value = 1` on a 0-HP creature). ENGINE-ONLY,
> F5 → **item 47**; headless pin (a withered creature at 0 still stabilizes to 1; a plain heal on it
> still does nothing); 🤖 re-test row.
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/drop-to-one-family.test.js`. ⚠️ The
> audit found the family ALREADY bypassing, so no behaviour moved; what shipped is the ruling
> recorded at the site plus the guard that keeps it (the heal gate's call sites are pinned at 2,
> and `bypassHealCut: true`'s callers at 1).

---

**R-12. Should a raised creature clear its OWN Harvested Remain?** An adversary that had itself been
harvested was raised by spending a *different* Remain, and came back at 1 HP **still wearing the
`harvested` marker with its own ledger entry live** — a living creature that is also a Remain. The
card says nothing either way. *(3B-C + checklist Raise Dead row, Death section.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) YES: raising clears the creature's
> own `harvested` marker and its ledger entry.** Spec: the raise path (Death tree, Raise Dead / the
> remains ledger) removes the raised actor's own entry and marker in the same write. ENGINE-ONLY,
> F5 → **item 47**; headless pin on the ledger; re-test = the Death-section Raise Dead row (a raised
> adversary comes back at 1 HP with no marker and the ledger one entry shorter).
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/raise-clears-remain.test.js`, via
> the new generic `edhaLedgerDropCreature(uuid, key, status)`; it sweeps EVERY owner's ledger, not
> only the raiser's, because a marker is a property of the creature.

---

**R-13. A snare placed UNDER a creature insta-springs**, where the card says "enter or pass through".
*Recommended: arm, do not spring.* Narrowed by run 7: placement **adjacent** does not insta-spring,
only placement directly under a creature does. *(3B-C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) ARM, do not spring; it fires on the
> creature's next move.** Spec: the Fate snare `RegionBehavior` ignores tokens already inside at
> placement (arm-only), springs on enter / pass-through per the card. ENGINE-ONLY, F5 → **item 48**;
> pin; 🤖 re-test = place under a creature (no spring), creature moves (springs).
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/snare-arm-under.test.js:"R-13 behavior: placed UNDER a creature — the creation-time tokenEnter does NOT spring it"

---

**R-14. Melee mutation riders fire on a nat-1 graze application.** Intended? *(3B-C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (c) FOLLOW EACH RIDER'S OWN CARD** —
> "on a hit" = hit only, "when you deal damage" / "on a hit or graze" = grazes count. Spec: audit
> every melee mutation rider's card text and set a per-rule `onGraze` (or equivalent) so the rider's
> trigger matches its wording; iron rule 2b — the dial lives on the rule, the handler reads it.
> ENGINE + AUTHORED (rebuild + ↻ Sync if any rule changes) → **item 56**; headless pin per rider; 🤖
> re-test on a nat-1 graze for one hit-only rider and one damage rider.
> **SHIPPED** in PR #242 (REBUILD, bench-pending) — `edha-mutation.keenOnGraze` / `venomOnGraze`,
> `edha-regen-grant.vitalOnGraze`, read through the new Apply-click graze discriminator
> (`edhaApplyIsGraze`); Bone Spurs "melee attacks DEAL" → on, Venom Glands "melee HITS" → OFF (the one
> change), Apex Form "DEALS … on all attacks" → on. `tests/rider-graze-dial.test.js`; 🤖 2bW-18 / 2bW-19.

---

**R-15. Coercive Pressure no longer stacks with another next-test rider** (e.g. Probability Net) —
the second write overwrites the first, because the bespoke Cognitive-disadvantage flag that allowed
both is gone. Confirmed on the live actor: `flags.nextTestMod` is **one object**, so each bearer has
exactly one slot. Does losing cross-rider stacking matter at the table? *(Checklist 2bI-4.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session, verbatim: "that needs to be a list not
> one slot"): (b) the next-test slot becomes a LIST, not one object.** Spec: `flags.nextTestMod` →
> an array of `{source, kind, value, expiry}`; every writer appends, every reader applies all
> entries (disadvantage is boolean-OR, dice/flat mods sum), expiry per entry (see R-20/R-57:
> round-scoped entries expire at the round change), consumers clear only their own entry; migrate a
> legacy single object on read. ENGINE-ONLY, F5 → **item 49**; headless pin: Coercive Pressure +
> Probability Net on one target both apply and both clear independently; 🤖 re-test = checklist
> 2bI-4.
> **SHIPPED** in PR #221 (ENGINE-ONLY, bench-pending) — `tests/next-test-mod-list.test.js`

---

**R-17. Puppeteer / Unnerving Approach — the once-per-round budget now spends on CLICK, not on
card-post.** Declining an offer no longer burns the use (verified: an ignored picker did not block a
same-round re-use). **But each ignored USE still charges its Investiture** — only the round budget
waits for the click. Two questions: is the click-not-post budget intended, and should an ignored use
refund its Investiture? *(Checklist 2bJ-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) keep the click budget AND refund
> the Investiture when the offer is declined/ignored,** consistent with R-69 (cancelled picker
> refunds, no stamp). Spec: charge on the click that resolves the offer, or charge on post and
> refund on decline/timeout — reuse whichever the R-69 picker path already does. ENGINE-ONLY, F5 →
> **item 51**; headless pin; 🤖 re-test = checklist 2bJ-10 (declined offer: Investiture unchanged,
> round use still available).
> **SHIPPED** in PR #230 (ENGINE-ONLY, bench-pending) — `tests/offer-decline-refund.test.js`. R-69's mechanism
> (charge on post, `edhaRefundCost` on back-out) reused through one path, `edhaOfferDecline`.

---

**R-18. Should quarry advantage refuse to stomp an active DISADVANTAGE?** Attacking your quarry while
Weakened rolls at **advantage** today — the quarry site runs after Weakened's and overwrites it. That
is the house convention (pack advantage, the Opportunity adv-test and `edha-next-test-mod` all stomp;
only `edha-test-rider` has the opt-in `unlessDisadvantage` that Apex Predator uses). Left alone
deliberately rather than changed silently. *(Checklist Quarry row, Heroic.)*
> **ANSWERED 2026-09-07 (Ben, dashboard), verbatim: "it gets added to the list of advantages and
> disadvantages on the roll. I believe the player gets to assign advantages and the GM gets to
> assign disadvantages to the die participating in the roll, but double check the cosmere rpg
> canon rules."** Canon check (`.claude/skills/cosmere-canon-reference/SKILL.md` §"advantage /
> disadvantage", SR p.18): an advantage or disadvantage rolls an extra of one die type and keeps
> one, the player chooses the die for advantages and the GM for disadvantages, and they cancel
> each other one-for-one — Ben's memory is canon; no correction needed. Consequence: the quarry
> advantage site must stop stomping the slot and instead JOIN the next-test list (item 49's
> `flags.nextTestMod` list, whose fold already cancels an advantage against a disadvantage per
> R-80) → **TODO item 80**. Stays open here until item 80 ships and the bench confirms it.

---

**R-50. An ambushing strike never gets its OWN fooled-rider — the strike that marks them fooled is
the one strike that does not benefit.** Surfaced by bench run 18 and filed here by fix pass C
(2026-07-28d) rather than left in a run's prose. Verified in code, not inferred: the belief test is
kicked off from the `cosmere-rpg.useItem` hook as a **fire-and-forget** `void
edhaAmbushBeliefTest(...)`, while the `whenTargetFooled` damage rider is selected when the damage
formula is assembled — which for a `skill_test` talent the system does *before* the test resolves.
So the ledger write always lands after the number is fixed, and the +1d6 / +1d8 first appears on the
**second** strike. Run 18 saw it identically on Glare-Strike and Raking Grasp, and it matches the
card text ("its FIRST attack … marks them fooled" — marks, not benefits).
*Recommended default: **intended**, leave it.* It reads as a deliberate ambush rhythm — the seeming
buys you the opening, the payoff starts once they have committed to believing it — and the
alternative costs real machinery (the rider would have to be re-derived after the test, or the
belief test awaited inside the use hook, which risks the takeover class of bug). Say so if you want
the ambusher to benefit on the strike that fools them and it becomes an engine task.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session, after a full walkthrough): (b) the
> FIRST strike must benefit.** The "marks, not benefits" reading does not match the ten cards:
> Stillback "Its first attack from unbroken stillness is made from ambush"; Wrongwake "on a failure
> the attack comes from ambush"; The False Spring "Its first strike against each fooled target is
> made from the mirage"; Hazewyrm "The first time it strikes each creature per scene, that creature
> has tested Perception… the strike comes from the shimmer". Affected: every `edha-ambush-belief`
> carrier — Stillback, Wasting-Eater Stillback, Wrongwake, Wasting-Eater Wrongwake, Keelshadow, The
> False Spring, Hazewyrm Adult, Hazewyrm Elder, The Doubled, The Doubled Elder (the Mistheron's
> placed-copy seeming already tests at placement and is NOT affected). SPEC (avoid awaiting inside
> the useItem hook — the takeover bug class): in the `edha-damage-rider` `whenTargetFooled` check
> (~L974), when the current target has no ledger entry for this scene, run the belief test right
> there with the engine's synchronous dice evaluator (`edhaRollDiceSync` family), use the local
> result for the rider decision, then write the ledger + post the GM/player cards asynchronously
> exactly as `edhaAmbushBeliefTest` does today (factor the roll/DC/advantage bits into a shared pure
> helper so the two paths cannot drift); the `useItem` path stays as the fallback for a strike with
> no rider. ENGINE-ONLY, F5 → **item 53**; headless pins: first strike vs untested target rolls the
> test and applies the rider on a fail; second strike reads the ledger and rolls no second test;
> Mistheron path unchanged; 🤖 re-test on Stillback (Ambush Bite 1d10+3 +1d6 on the FIRST bite vs a
> fooled target).
> **SHIPPED** in PR #219 (ENGINE-ONLY, bench-pending) — `tests/ambush-first-strike.test.js`

---

**R-51. Does an illusory copy breaking count as "an ally dropped"?** Raised by fix pass C while
fixing the cross-disposition defect below it. The two are separate: the defect was that a tokenless
victim fired cue owners on *every* side, and that is fixed. What is left is a design question the
old bug was hiding — a phantom copy now resolves to the side of the creature it duplicates, so
breaking one cues **that side's** `ally-drops` owners ("an ally dropped: the Raider may immediately
Disengage and flee"). *Recommended default: **no — a phantom's break should not fire `ally-drops`
at all.*** It never had a life to lose, and its own side are precisely the people who know it was
never real; the fooled *enemies* are the ones who would react, and they are on the other side of
the filter. One-line engine change (skip the block when the victim carries the `phantomDouble`
flag), **engine-only, no pack rebuild** — left undone deliberately because it would silence a cue
you may want. *(From bench run 18 / fix pass C.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) NO: a phantom's break fires no
> ally-drops cue.** Spec: skip the ally-drops block when the victim carries the `phantomDouble`
> flag (the one-line change the ruling names). ENGINE-ONLY, F5 → **item 47**; headless pin (phantom
> break → no cue; real ally drop → cue); 🤖 re-test in the illusion section.
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/ally-drop-side.test.js`.

---

**R-69. Should a CANCELLED picker still burn the talent's once-per-scene use?** Today it does.
`edhaDecreeUse` calls `edhaStampSceneOnce(owner, item)` **before** it opens the prohibition picker,
so pressing **Cancel** refunds the Investiture correctly (verified on the live table, bench run 25 —
4 → 1 → 4, no card, no `decree` flag) but leaves `sceneOnce.<itemId> === true`: **Final Decree is
spent for the scene without ever having resolved.** The stamp is deliberately pre-cost — that is
R-61's "vetoed BEFORE cost" polarity, and it is what stops a player probing the picker to see the
enemy list and then backing out for free. So this is a real trade, not an oversight.
*Recommended default: **move the stamp to after a successful pick.*** A cancel that refunds the cost
but eats the scene's only use is the worst of both worlds at the table, and the information leak it
guards against is small — the picker shows allies you can already see. If you would rather keep the
anti-probing behaviour, the honest fix is the other direction: **don't refund on cancel either**, so
the cost and the use agree. Either way the two should not disagree. Engine-only, one line, no pack
rebuild. Applies to every `edhaDialogPick` caller that stamps before prompting.
*(From bench run 25, found while re-testing fix pass 1's picker-cancel row.)*
> **ANSWERED 2026-09-05 16:30 (Ben, in chat, the PM's batch): "Stamp only after a successful pick."**
> Cancel costs nothing and burns nothing; cost and use agree. The fix goes at the primitive — every
> `edhaDialogPick` caller that stamps `sceneOnce` before prompting moves the stamp to after the pick
> resolves — so it is one change, not one per talent. Engine-only, no pack rebuild. **Live engine
> behaviour → lane B**, bench-verified before it counts. Filed as **TODO_REPO_HYGIENE #36**; moves
> to §K when #36 lands.
> Shipped in PR #160 (2026-09-05); moves to §K after the bench pass.
> **VERIFIED GREEN, bench run 28 (2026-09-05).** All four legs on `Bench — Order`: cancel refunds
> 4 → 1 → 4 and leaves `sceneOnce` **undefined**; the talent is immediately re-usable in the same
> scene; a real pick posts the Decree card, writes the `decree` flag and stamps `sceneOnce`; and a
> third use is still refused pre-cost with the unchanged wording and unchanged Investiture (R-61
> polarity intact). Ready to move to §K.

---

**R-70. A two-resource activation only charges the FIRST resource unless the player ticks the second
box — should Edha do anything about it?** Not a bug, and not ours: bench run 28 read the dialog
instead of clicking through it and found the cause in **cosmere-rpg 2.1.0's own `index.js`**, comment
included — `// Only automatically check first option, or anything overridden.` →
`const shouldConsume = options.shouldConsume ?? i === 0;`. Both `consume` entries survive the build
and reach the dialog intact (verified on the compendium document and live: ticking both charges both,
inv 9 → 8 **and** foc 8 → 7). The consequence at the table is that a card reading **"Cost: 1
Investiture, 1 Focus"** — the Stitchmother's *Reknit Form*, and any tree talent with two costs —
is **under-charged by a default click**, silently, every time. `options.shouldConsume` is a single
boolean for ALL entries, so there is no per-item authoring field that would fix it; the only levers
are a system-level wrapper that pre-checks every row, or leaving it to the table.
*Recommended default: **leave it alone and note it in the handbook.*** Wrapping the system's own
dialog to change a default is exactly the kind of side-engine iron rule 2a exists to prevent, the
player can see both unticked boxes on screen, and a GM who misses it has under-charged by one
resource. If you would rather the dialog matched the card, the honest fix is one wrapper on
`showConsumeDialog` that passes `shouldConsume: true` — which then applies to **every** talent with
a second cost, including ones where the second cost is meant to be optional.
*(From bench run 28, settling the row bench run 27 filed.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) wrap the dialog so every cost row
> starts ticked.** Ben chose the wrapper knowing it applies to every talent with a second cost (rows
> stay untickable by the player). Spec: ONE wrapper on the system's `showConsumeDialog` passing
> `shouldConsume: true`; ENGINE-ONLY, F5 → **item 50**; declare it in the header as the one
> sanctioned system-dialog wrapper (iron rule 2a exception by Ben's ruling); pin a headless test on
> the option shape; bench re-test = Reknit Form charges inv AND foc on a default click.
> **SHIPPED** in PR #222 (ENGINE-ONLY, bench-pending) — `tests/consume-dialog-wrapper.test.js`
> (the pure option shape, the system's row map `[true, true]`, the installed patch, and a source
> scan that exactly ONE wrapper of the system dialog exists — a second one fails the suite).

---

**R-72. Is an INVOLUNTARY drain a "spend"?** Raised by item 28b: the Order Edict fires only on the
creature's own activations, and H10's Investiture-drain write (`register-skills.js` ~L18139, the
one `edhaSpendTag` site item 13 preserved) currently stamps a drain the same way as a voluntary
spend. *(Board table; raised by item 28b.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (b) NO, a drain is not a spend.** Spec:
> H10's write → `edhaBookkeepingTag`; `edhaDrainFocus` likewise carries a bookkeeping tag (28b's "a
> test fails if one ever appears" pin flips to its opposite). ENGINE-ONLY, F5 → **item 47**; re-pin
> tests; bench re-test = an Edict-bound creature drained by an enemy gets NO violation prompt, and
> its own wired spend still does. This also settles R-8's "decide together with R-8" clause — R-72
> (b) stands on its own.
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/resource-writes.test.js` +
> `tests/spend-tag.test.js`. THREE existing pins were FLIPPED to assert their opposite (they
> existed to stop a refactor answering this ruling by the back door). The `set-resource` relay
> half moved with the other two — split, the unowned drain would violate an Edict the owned one
> does not.

---

---

**R-82. Should R-14's "follow the card" graze rule reach the generic `edha-damage-bonus` rules too?** R-14 (c) now governs the Life mutation riders (Bone Spurs, Venom Glands, Apex Form) through per-rule graze dials (item 56, PR #242). Item 56's worker found that the generic `edha-damage-bonus` rules with `meleeOnly` (Warlord's Advance and kin — the armed-strike bonuses) ALSO fire on a graze application today. *Recommended default: **(a) yes** — the same per-rule `onGraze` dial on `edha-damage-bonus`, each card audited (the `graze` value is already available at that call site); a small S item once Ben nods. NOT applied yet.* (b) leave them — a bonus "on your attacks" reads as any application. *(Board table 2026-09-06; raised by item 56.)*
> **ANSWERED 2026-09-07 (Ben, dashboard) — marked done, no note = the recommended default
> accepted: (a) yes**, the same per-rule `onGraze` dial on `edha-damage-bonus`, each card audited
> → **TODO item 81**. **Not shipped yet** — stays open here until item 81 lands and the bench
> confirms it, then moves to §K.

Ask: Should the melee-only `edha-damage-bonus` rules (Warlord's Advance and kin) get the same per-rule `onGraze` dial the Life mutation riders have, so a bonus stops firing on a graze unless its card says otherwise (a), or keep firing on any application including a graze (b)?

---

---

### K.5 — R-83 … R-71

**R-83. Three `hea` writers bypass the heal-cut gate — gate them at their emitters?** `ENGINE_INDEX.md` says every `hea` write outside `applyDamage` must pass `edhaHealCutGate`, and three do NOT: `edha-regen`'s turn-end write, the decay lifesteal heal-back, and `edhaBurstDetonate`'s heal hits. Their cards are honest (fix pass 8 / item 68, PR #241, fixed the announcing), but the HP still lands on a withered creature — Mending Aura keeps healing a target that "cannot regain HP". Gating them changes live HP at the table; `edhaApplyBurstResults` must STAY ungated (Raise Dead's stabilising 1 HP rides it, R-10), so the gate belongs in each emitter. *Recommended default: **(a) gate all three at the emitter** (the mark's card is the promise), the family test's gate-call count raised from 2 with a declaration, one 🤖 row per writer → TODO item 70. **WAITING for Ben — not applied, because it moves HP.*** (b) leave them ungated and say so in `ENGINE_INDEX.md`. *(Board table 2026-09-06; raised by fix pass 8.)*
> **STILL WAITING 2026-09-07 (Ben, dashboard), verbatim: "I'm not sure what this means and will
> want the pm to give me good examples when we get here in chat."** Plain-language gloss, written
> for Ben: the three heal writers are (1) `edha-regen`'s turn-end heal (the adversary regen rule —
> The Garden Sow / Nexus-Fed — plus the talent-side `edha-regen-grant` family: Apex Form's vital
> regen, Mending Aura's turn heals), (2) the Lifeline-style `healFormula` heal-back die on
> `edha-redirect` (the Life talent that takes an ally's damage and rolls a heal-back), and (3)
> `edhaBurstDetonate`'s heal hits (any burst whose spec heals the tokens it catches). Today all
> three still add HP to a creature under a "cannot regain HP" mark (Withering Touch / the Black
> no-healing marks), while an ordinary heal on that creature is blocked. Concretely: an ally
> Withered by a Black talent, then hit by Mending Aura's turn-end regen tick, gains HP today even
> though the same ally targeted directly by a normal heal spell would not. **(a)** = those three
> obey the mark too, so a Withered creature never regains HP from any source. **(b)** = leave them
> as the deliberate exceptions and write that down in `ENGINE_INDEX.md`, so the mark's promise
> reads "no ordinary healing, but regen/lifesteal/burst-heal still reach you." Item 70 stays
> blocked on this call.
> **ANSWERED 2026-09-07 17:11 (Ben, dashboard), verbatim: "a"** — (a) gate all three writers at
> their emitters, so a creature that "cannot regain HP" stops gaining HP from `edha-regen`'s
> turn-end heal, the decay lifesteal heal-back, and `edhaBurstDetonate`'s heal hits too.
> **Item 70** (opus, engine-only) is now unblocked and applies it. **Not shipped yet** — stays open
> here until item 70 lands and the bench confirms it, then moves to §K.
> **SHIPPED** in PR #308 (ENGINE-ONLY → F5, bench-pending) — all three writers gated **at their
> emitters**: the `edha-regen` turn-end tick (`07-edha-owner-list.js`), the decay lifesteal heal-back
> (`45-death.js`) and `edhaBurstDetonate`'s per-target heal (`39-burst-execution-…js`). The gate's
> call count went **2 → 5** with one declared line per site in `tests/drop-to-one-family.test.js`,
> and `edhaApplyBurstResults` is asserted to stay UNGATED — Raise Dead's stabilising 1 HP rides it
> (R-10 (3)), which is why the burst gate lives in the emitter. Nine headless pins in
> `tests/heal-cut-emitters.test.js` (per writer: withered → 0 and the card names the mark, halved →
> half, unmarked → unchanged), each shown failing under a one-line reversion of its gate call; gates
> 11/11. Every card is built from the DELIVERED amount via `edhaHealLine`, so a blocked heal names
> the mark instead of printing a number. 🤖 re-tests are checklist rows **70-1 … 70-4**; this ruling
> stays here until the bench confirms them at the table, then moves to §K.

Ask: Should `edha-regen`'s turn-end heal, the decay lifesteal heal-back, and `edhaBurstDetonate`'s heal hits each pass `edhaHealCutGate` so a creature that "cannot regain HP" stops gaining HP from them (a), or stay ungated with that exception written into `ENGINE_INDEX.md` (b)?

---

---

**R-88. Volatile Strike rides any melee hit — but only one that deals IMPACT. Is that the rule you want?**
R-23 (a) shipped as `whenDealer: "any"` (item 58), and bench run 42 confirms it works: on the deployed
pack a **plain weapon hit that dealt impact** — a staged impact-damage sidesword on `Bench — Red`, not
a Volatile Strike cast — posted the offer *"⚡ Volatile Strike — 1 Investiture … spend 1 Investiture
(test Red vs Physical) to add half [Tier][Die] impact to the creature you hit."* But the same PC's
**ordinary keen sidesword hit offered nothing**, because the rule also carries
`whenDamageType: "impact"` — untouched by R-23, and not mentioned on the card, whose prose is the bare
*"When you hit with a melee attack, spend 1 Investiture …"*. So today the talent reads as a rider on
every melee hit and behaves as a rider on impact hits only, which for a Red PC with a keen weapon is
almost never. *Recommended default: **(a) drop the `whenDamageType` gate** — one field on the Events
tab, no engine change, and the card then tells the truth.* (b) keep the gate and say so on the card
("when you hit with a melee attack **for impact damage**") — also a data-only fix, but it makes the
talent weapon-dependent in a way nothing else in Red is. *(Bench run 42, 2026-09-07 — measured both
directions in one window; nothing is broken, the two halves just disagree.)*
> **ANSWERED 2026-09-07 17:11 (Ben, dashboard), verbatim: "a"** — (a) drop the `whenDamageType:
> "impact"` gate; the card is canon. **SHIPPED in item 92, PR #288** (`data/authored/leyline-red.json`,
> the one authored field plus the rule's own `description` string; parity-proved, exactly one
> document differed) — **REBUILD (leyline pack) + ⟳ Sync Talents still owed** to Ben's next deploy.
> 🤖 re-test is checklist row **92-1** (Red section): stays open here until the pack is rebuilt and
> the bench confirms the keen-hit case now offers, then moves to §K.

---

---

**R-89. The `NO NAMEABLE HOOK` marker does not survive a ProseMirror save. Where should it live?**
R-47's own ⚠️ clause asked this and bench run 42 answered the mechanism: feeding a marked description
through `ProseMirror.dom.parseString` → `serializeString` — the exact pair Foundry's editor uses when
you save — **drops the `<!-- NO NAMEABLE HOOK: … -->` comment entirely** (measured on Wrongwake's Drag
Under: the source ends with the marker, the round-trip ends at "no air, no speech."). Nothing is broken
today, because the marker lives in `data/adversaries.json` and only the world copy would lose it — but
the authoring loop is Foundry-edit → extract → build, so **the first time Ben edits one of these
descriptions in Foundry and it is extracted, the marker is silently gone and `lint-refs.js` pass 5
starts failing** on an ability that never changed. *Recommended default: **(a) move the declaration off
the description** into a dedicated field the editor cannot rewrite (a `flags.edha-content.noHook`
string, read by lint pass 5, rendered nowhere) — the marker stops being prose and starts being data.*
(b) leave it and add a note to `AUTHORING_WORKFLOW.md` telling Ben not to save those descriptions from
the editor. (c) teach the extract step to re-attach the marker from the repo copy when the incoming
text has lost it. *(Bench run 42, 2026-09-07 — R-47's other four clauses all passed and its row is
retired; this is the residue.)*
> **ANSWERED 2026-09-07 17:11 (Ben, dashboard), verbatim: "a"** — (a) move the declaration off the
> description into `flags.edha-content.noHook` (data, not prose), read by lint pass 5, rendered
> nowhere. **Item 93** (sonnet, adversaries REBUILD + ⟳ Sync Adversaries) applies it. **Not shipped
> yet** — stays open here until item 93 lands and the bench confirms it, then moves to §K.

---

---

**R-90. An adversary's `edha-triggered-effect` card is public. Should it whisper to the GMs?**
Bench run 43 re-drove Predator's Due on the current build: the heal is right (a fresh Cragdrake Alpha
went **30 → 33** on taking a character to 0), but the card posts with `whisper: []` — so the table sees
the boss's remaining-HP arithmetic *and* the GM instruction printed inside the same card
(*"…and 1 Focus on the kill (focus is a GM add)"*). Run 16 blamed `edhaWhisperIds()` returning empty;
that is wrong — the poster, `edhaRollCard`
(`module-src/scripts/engine/33-triggered-effect-resolution.js:143`), simply passes **no `whisper` key**,
and neither do its six sibling call sites. Public is correct for a PC healing themselves; it is the
adversary case that leaks. **17** adversary `edha-triggered-effect` rules ship, of which the three
`Predator's Due` blocks carry a literal GM instruction and the three `Afterburn` afflictions post
through the same poster. *Recommended default: **(a) whisper to `edhaWhisperIds(owner)` when the owner
has no player OWNER** — i.e. an adversary — and leave a player-owned actor's card public. One helper
call per poster, and it is exactly what `edhaPostCueCard` already does for adversary cues.* (b) whisper
only when the rule's own note contains a GM instruction — more surgical, but it makes the audience a
property of prose. (c) leave everything public and delete the GM instruction from the three card texts
instead — cheapest, but it also shows the players the boss's healing roll. *(Bench run 43, 2026-09-07;
implementation is `TODO_REPO_HYGIENE` item 88, which is blocked on this answer.)*
> **ANSWERED 2026-09-07 17:25 (Ben, phone inbox), verbatim (the row's own (a) text tapped): "(a)
> whisper to `edhaWhisperIds(owner)` when the owner has no player OWNER — i.e. an adversary — and
> leave a player-owned actor's card public. One helper call per poster, and it is exactly what
> `edhaPostCueCard` already does for adversary cues."** **Item 88** (opus, engine-only) applies it.
> **Not shipped yet** — stays open here until item 88 lands and the bench confirms it, then moves
> to §K.

---

---

**R-91. Does R-86 retire the R-62 audience row, or do you want to disconnect for one window?**
The checklist row **"VISIBLE — R-62 audience flips, seven sites"** asks, for each of seven card sites,
that a GM be **logged out** when the card fires and then log back in. Bench run 43 re-derived why that
cannot be staged: the world holds **exactly two GM users** — `Bench` (which by definition is connected
during a bench run) and `Gamemaster` (Ben, connected through runs 24–43) — and the other four users are
all role 1. So `edhaGmIds({activeOnly: true})` and `edhaGmIds()` return the same list no matter what the
bench does; there is no offline GM to act as a discriminator. **R-86** already says *"There will never
be no GM connected. This isn't needed, and any similar items aren't needed"*, and it retired **Job 6a**,
whose premise is the same. *Recommended default: **(a) retire the row under R-86** — the flips are
repo-side facts pinned by the code (`activeOnly` present or absent at each of the seven sites) and the
behaviour they change only matters in a state you have said will never occur.* (b) keep it and
disconnect `Gamemaster` for one deliberate window so a bench run can drive all seven sites in one pass —
about ten minutes of your time, once. (c) keep it open indefinitely. *(Bench run 43, 2026-09-07 — the
row is annotated with this derivation and stays 🤖 until you answer; a technical blocker never becomes
⚑.)*
> **ANSWERED 2026-09-07 17:25 (Ben, phone inbox), verbatim (the row's own (a) text tapped): "(a)
> retire the row under R-86 — the flips are repo-side facts pinned by the code (`activeOnly`
> present or absent at each of the seven sites) and the behaviour they change only matters in a
> state you have said will never occur."** **This item** (`TODO_REPO_HYGIENE` item 95) applies it:
> the checklist row **"VISIBLE — R-62 audience flips, seven sites"**
> (`EDHA_FOUNDRY_TEST_CHECKLIST.md`) is retired under R-86 with that reason; its ⛔ evidence trail
> stays intact.

---

**R-94. Do talent-tree prerequisites and rank requirements apply to adversaries?**
`scripts/validate-build.py --adversaries` (added 2026-09-09) checks each adversary's `talents`
list against the same requirement graph a PC's ladder must satisfy, and found one:
**Corvaine Line-Caller's `Ordered Advance`** is not reachable the way a PC would reach it — as a
`minion` its White is **rank 1** (`ROLE_LEYLINE_RANK` — minion 1 / rival 2 / boss 3), while the
talent wants `Leadership 2+` and a `connections` edge from `Beacon of Stability`, neither of which
that statblock has. Nothing in the repo enforces this: `scripts/validate.js` checks only that a
talent ref **resolves** (exists, unambiguous, group matches), never that it is *takeable*. So the
question is whether that silence is deliberate. *Recommended default: **(a) adversaries are exempt
— prereqs and rank gates are a PC-progression rule, not a statblock rule.** Ruling 40 already lets
an NPC run a tree talent "as written", and a GM needs to be able to build the monster the scene
wants without laddering it. Keep the report as information, never as an error.* (b) Enforce them,
and rewrite any statblock that violates them. (c) Enforce them only for `boss` roles.
> **ANSWERED 2026-09-09 (Ben, chat), verbatim: "Note that I'm fine with adversaries skipping
> around on talent trees and rank requirements."** Applied as (a). **No code change was needed** —
> nothing ever enforced them — but three places described the situation as a concern and now do
> not: `scripts/validate-build.py`'s adversary mode relabels these `off-tree` (was `??`) and states
> the licence in its output and docstring; `.claude/skills/build-forge/` Phase 5 says explicitly
> **do not "fix" an adversary to make its talents legal**; and the `CLAUDE.md` map row matches.
> The report is kept because it still answers a useful question — what a statblock actually costs
> the players — and because **role is the lever** (minion 1 / rival 2 / boss 3) if a GM ever does
> want a talent to sit inside its role's reach.

---

**R-93. When a card says "your &lt;Colour&gt;" but the engine pays RANK, which side is wrong?**
Bench-adjacent finding, 2026-09-09: four talents phrase a quantity as *"your &lt;Colour&gt;"*, and the
authored formulas behind them do not agree with each other. `Kindle` (Red · Conflagration) resolves
`@skills.red.mod` and `Bonds of Community` (Civilization) resolves `@skills.white.rank + @attr.wil` —
both of which **are** the skill modifier, so those two cards are already correct. But `Bear Witness`
and `Shoulder the Oath` (both Order) resolve `@skills.white.rank`, i.e. rank only, while their cards
say *"your White"*. Everywhere else in the data the convention is the unambiguous **"your ranks in
X"** (21+ talents: Field Medicine, Swift Healer, Practiced Oratory, Rallying Shout, …), so a bare
*"your &lt;Colour&gt;"* most naturally reads as the modifier — which is what a player would compute.
The divergence is invisible for a character whose attribute is 0 (Soggy Bottom's Willpower 0 makes
modifier and rank both equal his rank) and materially wrong for anyone else.
*Recommended default: **(a) reword the two cards, leave the engine alone** — the rank formula is the
designed behaviour and "temporary HP equal to your ranks in White" is the house convention.*
(b) Change the two formulas to `.mod` instead, making the cards right and the talents stronger.
(c) Leave both and treat "your &lt;Colour&gt;" as meaning rank throughout — rejected on sight, because
`Kindle` and `Bonds of Community` would then both be wrong in the other direction.
> **ANSWERED 2026-09-09 (Ben, chat), verbatim: "note the Bear Witness needs the talent reworded —
> the code is right. Temp HP = Ranks in White."** Applied as (a): `Bear Witness` and
> `Shoulder the Oath` reworded to **"your ranks in White"** in `data/domain.json` and
> `data/authored/deity-order.json` (value, chat and short forms). `Kindle` and
> `Bonds of Community` deliberately UNCHANGED — their formulas are the modifier, so their cards
> were already right; the extension to `Shoulder the Oath` (not named by Ben, but the same rule,
> the same formula, twice) is flagged in the delta for veto. **Text-only: pack rebuild + ⟳ Sync,
> no engine change.** Checklist rows under THE PACK-REBUILD LIST.

---

**R-92. A PC hits 0 HP and nothing happens. Should Edha add a generic "dropped" GM cue?**
Confirmed live in bench run 44 (2026-09-09): Tem was reduced to 0 HP on the Palewater Ford scene and
**no status, no prompt, no card, no token overlay** appeared — the only effect on him was the
`Determined` from Rousing Presence. This is not an Edha bug and not a system bug: **Cosmere RPG 2.1.0
ships the entire injury apparatus and deliberately does not automate it.** The system has an `injury`
item type, the duration table (Flesh Wound → Shallow → Vicious → Permanent → Death), an
`apply-injury-actor` event type, an "apply injury to character" chat button, and `actor.rollInjury()`
— but `unconscious` appears in `index.js` **only as a status definition, never applied by code**,
there is no `health <= 0` check anywhere in the bundle, and the injury roll is a manual **"Roll
Injury"** button bound to the Health resource on the character sheet. Metalworks made it GM-driven on
purpose. The question is whether *Edha* should notice the drop for you. It matters for session 1
specifically: §3's design note calls the ford *"a clean place to teach the injury rules without a
death"*, and at the table the GM currently has to spot the number themselves mid-fight.
*Recommended default: **(a) add a generic drop cue** — a GM-whispered card when any character's
health crosses to 0, naming them and offering the Roll Injury reminder. It composes existing
primitives (`edha-apply-watch` → `edha-gm-cue` is exactly the shape **Cover Their Retreat** already
uses for "an ally within 20 ft would drop"), so it is one small generic handler under iron rule 2a,
not a subsystem, and it changes no dice.* (b) Add the cue **and** auto-apply the `unconscious`
status — more automation, but it makes a ruling about a rule the system chose to leave to you, and
it would fight any table ruling that a PC stays up. (c) Leave it manual and matching the system's own
choice — one fewer card, and you watch the HP bars. *(Bench run 44, 2026-09-09 — filed rather than
patched because (a) vs (c) is a taste call about how much the engine should nag.)*

---

---

**R-23. Volatile Strike — whose hit should it ride?** Card and rule description both say "when you
hit with a melee attack" (a rider), but it is authored `skill_test` **with its own damage formula**,
so it derives item-specific and only ever offers itself on its own damage.
(a) `whenDealer: "any"` → a true rider on any melee impact hit, accepting that a standalone use also
self-offers; or (b) it is the Special Action you take *after* your weapon hits, in which case the
on-hit rule is the redundant half and should be `whenDealer: "self"` or removed.
**Settleable entirely from the Events tab — `whenDealer` is a field on the rule, no code change
either way.** Never benched. *(3A-3 + checklist Red row — the same question, recorded twice.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) a TRUE RIDER on any melee hit:
> `whenDealer: "any"`.** Authored rule field change in `data/authored/leyline-red.json`
> (settleable from the Events tab) → **REBUILD + ↻ Sync**, **item 58**; 🤖 re-test = the Red row (a
> sword hit offers Volatile Strike; standalone use self-offers harmlessly).
> **SHIPPED** in PR #227 (REBUILD, bench-pending) — `whenDealer: "any"` on rule `TKmyXVyFhGYWryKv`,
> `data/authored/leyline-red.json`.

---

**R-25. Rallying Shout's reminder now prints on an ally ABOVE 0 HP.** Deliberate change, re-confirmed
at run 11 on an ally at 32 HP. The number defect in the same line is fixed and table-verified
("recovery die + **3** health" at Leadership 3). Only the gate is yours: keep the always-print, or
restore the at-0-HP-only gate? *(3A-11 + checklist 2bM-6.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (c) print ONLY for an ally at 0 HP or
> carrying Unconscious** (the two cases the card names). ENGINE-ONLY, F5 → **item 47**; headless pin
> (ally at 32 HP: no card; ally at 0: card; ally Unconscious above 0: card); 🤖 re-test = 2bM-6.
> ⛔ **NOT SHIPPED in PR #215 (item 47) — it is not an engine-only change.** Since the 2b
> migration that reminder is an AUTHORED `edha-note` rule on Rousing Presence
> (`data/authored/heroic-envoy.json`, rule `RouseRallying000`, `whenOwnsTalent: "Rallying Shout"`),
> and `edha-note` carries no target-condition dial. Gating it needs EITHER a new generic field on
> `edha-note` PLUS an authored value on that rule (**REBUILD + ↻ Sync**), OR a name-keyed engine
> branch, which iron rule 2b forbids and the ratchet prevents. Shipping the dial alone would add an
> engine path with no consumer — R-74/R-76's own complaint. **Needs a rebuild-class item; the
> answer (c) stands unchanged.**
> **SHIPPED** in PR #239 (REBUILD, bench-pending) — item 63: `edha-note` gained the generic `whenTarget`
> field (blank | `downed` = target at 0 HP or Unconscious, pure gate `edhaNoteTargetGate`), and
> `RouseRallying000` carries `whenTarget: "downed"`. tests/note-target-gate.test.js pins the three cases
> plus the no-field case; heroic pack parity = 204 documents, 1 differs. 🤖 re-test = checklist 2bM-6b.

---

**R-27. Battle Fever — which side is canon, the card or the engine?** The card says "+1 to your next
test (max = Rank), **resets at start of your turn**"; the engine's rally bonus rides **every** test
until turn start (`rally {count, resetOn: turn}` — it never consumes on a test; observed +2[Rally] on
6+ consecutive rolls). The max=Rank cap works on both readings. *(Checklist Red spot-checks row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) THE CARD is canon**: the rally
> bonus is SPENT on the next test (max = Rank), and clears at the start of the owner's turn. Spec:
> the rally handler's `{count, resetOn: turn}` gains consume-on-test (the bonus applies once, to the
> next test, then the stack is cleared/decremented). ENGINE-ONLY, F5 → **item 52**; headless pin
> (three damage events → +3 on the next test, +0 on the one after; cap at Rank); 🤖 re-test = the
> Red spot-checks row.
> **SHIPPED** in PR #223 (ENGINE-ONLY, bench-pending) — `tests/rally-spent-on-test.test.js` (three hits
> → `0 + 3[Rally]` on the next test and +0 on the one after; four hits at Rank 3 spend as +3; an unspent
> stack still clears at the owner's turn start). The consume is a post-`<ctx>Roll` reader of the actor's
> own `rally` flag (`edhaRallyConsume`), not a roll option — a cancelled dialog cannot strand the stack.

---

**R-28. Withering Touch's duration — "start" or "end" of your next turn?** The engine
(`expireAfter {round: 2, turn: 0}`), **both** chat cards and the **measured** expiry all say **END**;
only the prose says *start*. *Recommended: fix the prose* (and the source in `data/domain.json`) —
do not leave three artifacts agreeing and one disagreeing. *(3A-15 + checklist 2bW-1.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) END; fix the PROSE.** Authored
> description + `data/domain.json` source prose say "end of your next turn"; engine and cards
> unchanged. DATA/TEXT → pack **REBUILD + ↻ Sync**, **item 58**; retire checklist 2bW-1's duration
> clause.
> **SHIPPED** in PR #227 (REBUILD, bench-pending) — `description` (value/chat/short) +
> `WitherNote000000.text` in `data/authored/deity-death.json`, and the source `description` in
> `data/domain.json`, all "end of your next turn".

---

**R-29. Combat Training's garbled source.** The cheatsheet sentence reads "turn one of its own
**grazes into a graze**". Rule whether that means **miss → graze** or **graze → hit**, and the text
gets fixed to match. Open since 2026-07-16. *(Checklist adversary-wiring row.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) MISS → GRAZE, once per round,
> without spending Focus** — the canon Combat Training wording. Spec: fix the cheatsheet sentence
> and the adversary block's description (its description is currently EMPTY in
> `data/adversaries.json` — write it); wire per lint pass 5. Adversaries pack **REBUILD** (Ben's
> deploy) → **item 57**. Retire the adversary-wiring checklist row on evidence.
> **SHIPPED** in PR #226 (REBUILD, bench-pending) — the Captain's text reads "Once per round, when one of the
> Captain's attacks misses, it can turn that miss into a graze without spending Focus." (note: the block's
> `text` was never actually empty — it carried the 07-16 ruling wording plus a visible marker; both
> rewritten). The garbled sentence lives only in the source PDF, which is not in the repo; the built
> description is now the canonical wording. Checklist row retired on the built-pack read-back.

---

**R-31. Should a PC's own Phantom Double token be labelled "(Illusion)"?** The plain name is
deliberate for The Seeming's veil, but no veil applies in the PC direction. *(3A-9.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) YES, label the PC's copy
> "(Illusion)"**; the Mistheron's veiled copy keeps its plain name. ENGINE-ONLY (the copy-token
> spawner, character owners only), F5 → **item 48**; 🤖 re-test in the Blue block.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/illusion-token-label.test.js:"R-31: a CHARACTER's copy — the token is labelled (Illusion)"

---

**R-32. Black Draw Mana's sweep card says "affected 5"** when all five were already Weakened —
intent vs. state. Which should the card report? *(3A-10.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) report BOTH: "swept N · newly
> Weakened M".** ENGINE-ONLY (the pulse runner's card text), F5 → **item 48**; headless pin on the
> string; 🤖 re-test = Black Draw Mana on five pre-Weakened targets reads swept 5 · newly 0.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/pulse-sweep-counts.test.js:"R-32: five ALREADY-Weakened enemies read 'swept 5 · newly Weakened 0'"

---

**R-71. The system's own item-damage card prints the UNFOLDED formula — leave it, or fold at build
time?** R-65 folds every roll that goes through `edhaRollFormula`, and every engine-rolled card
measured since reads plain dice (`2d8`, `2d8 + 2`, `1d6 + 2`). But a talent whose damage the
**cosmere system** rolls for itself — `item.system.damage.formula`, rolled by the system's `use()`
before any Edha rule sees it — never reaches that helper, so its card shows the raw parenthetical.
Measured on **Verdict**: the system card read `(2)d(2 * 3 + 2) + 5 = 10` while the same talent's
engine-rolled Edict payoff on the very next card read `2d8 + 2 = 7`. **The maths is right** —
Foundry's parser evaluates the parenthetical correctly, 10 and 7 are both valid — so this is a
DISPLAY gap, not a damage bug, and it is the same string bench run 24 saw on Exalt's card.
*Recommended default: **fold the authored `system.damage.formula` at BUILD time**, so every
system-rolled card reads `2d8` like every engine-rolled one.* The alternative is to accept the
parenthetical on those cards, which is defensible — it is honest about the scaling — but it makes
two cards from the same talent look like they use different maths. A build-time fold would need a
**pack rebuild**, and it changes what Ben sees on the sheet, so it is a judgment call rather than a
mechanical fix.
*(Filed by bench run 28, which moved it out of the checklist: the row asked Ben to DECIDE, not an
agent to TEST, so it was in the wrong file. Original measurement: bench run 25.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) fold `system.damage.formula` at
> BUILD time.** Spec: `foundry-build.js` folds the authored damage formula into plain dice for
> every talent the system rolls itself (same fold `edhaRollFormula` does at runtime per R-65).
> Packs **REBUILD** (Ben's deploy); TOOLING + DATA → **item 59**; pin with a build-report diff
> showing only formula strings changed; bench visual check = Verdict's system card reads `2d8 + 5`
> like its engine-rolled card.
> **SHIPPED** in PR #234 (REBUILD, bench-pending) — `scripts/lib/fold-die-math.js`
> (`foldDieMath`) wired into `foundry-build.js`, pinned against the engine's own `edhaFoldDieMath` in
> `tests/fold-die-math.test.js`. ⚠️ **Load-bearing limit found while shipping it, worth reading before
> the bench row above surprises anyone:** the fold can only resolve a `damage.formula` whose computed
> dice math is ALREADY fully numeric — it has no actor to substitute `@tier`/`@skills.<color>.rank`
> from at build time, so a genuinely rank/tier-scaled `[Tier][Die]` formula (Verdict's own
> `(@tier)d(2 * @skills.blue.rank + 2)` included) folds to ITSELF, unchanged, exactly like the
> engine's own copy before runtime substitution. Measured against every current `damageFormula` (51
> in `data/talent-rolls.json`) and every authored `damage.formula` overlay: **none are fully numeric
> today**, so a real build's folded-formula count is currently 0 — proven correct by mutation (a
> scratch-only synthetic flat formula DOES fold end-to-end; see the item-59 PR body / handoff delta
> for the isolated one-field diff). If Verdict's card still shows the parenthetical on the bench run,
> that is this limit, not a regression — the deeper fix (folding the SUBSTITUTED, actor-specific
> formula at roll time, mirroring what R-65 already does for engine-rolled cards) would need to hook
> the system's own damage-roll pipeline, which is a different, ENGINE-side change outside item 59's
> TOOLING + DATA scope. Left open here for Ben to decide whether that is worth a follow-up item.
> **SHIPPED (runtime half)** in PR #237 (ENGINE-ONLY, bench-pending) — `tests/runtime-formula-fold.test.js`. Item 69 folds the same field inside `edhaWrapRollDamage` at ROLL time, with the roller's data substituted first, so the tier/rank-scaled formulas the build-time fold could not touch now print plain dice on the system's own card (`2d8 + 5` at tier 2 / rank 3); riders join onto the folded base. The item-59 Verdict 🤖 row under `# BENCH — Order` is this item's re-test.

---

---

### K.6 — R-35 … R-54

**R-35. Should Unweaving's dispel card list the OMEN MARKER itself as a dispellable effect button?**
Today the card lists enabled effects; the Omen marker is not among them. *(3B-D + checklist Chaos
residuals row — that row's other half, the through-walls rendering, was CLOSED on run 13's
sense-through evidence with a negative control.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) YES.** Spec: the `edha-pick`
> `source:'effects'` menu (already being widened under R-73 (b)) also offers the target's Omen
> ledger entries as a "dispel Omen" button that clears the marker + ledger entry. ENGINE-ONLY, F5 →
> folded into **item 54** with R-73(b); headless pin; 🤖 re-test = Chaos residuals row.
> **SHIPPED** in PR #224 (ENGINE-ONLY, bench-pending) — `tests/dispel-widening.test.js`. The rule's new
> `ledgers` field defaults to `omens:omen`, so Unweaving needs no rebuild; the click clears the marker
> AND the ledger row, and a marker with no row still comes off.

---

**R-36. Temp HP source relabelling misattributes a surviving value.** When a smaller Temp HP grant
loses the keeps-higher comparison, the `source` is still relabelled to the loser — so an ally holding
6 from Final Decree ends up reading "Bear Witness", and a 99-THP ally ends up reading "Investiture of
Command". The number is right; the attribution lies. *(3B-D.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) FIX: relabel `source` only when
> the new grant WINS the keeps-higher comparison.** ENGINE-ONLY, F5 → **item 47**; headless pin (6
> from Final Decree survives a 4 from Bear Witness → source stays Final Decree).
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/temphp-source-label.test.js`. A tie
> is not a win: the incumbent keeps both its value and its label.

---

**R-37. Three small card-text nits, one decision:** Ordained eviction is never verbalized (the place
card says "(2/2)" but never says the oldest fizzled) · Inevitable Snare's grammar reads "the snares on
Snare #1 **is** inevitable" · Bulwark's THP attribution. Fix all three, or leave them? *(3B-D.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) FIX ALL THREE**: (1) Ordained
> eviction posts a line naming the fizzled oldest ground; (2) Inevitable Snare grammar ("the snares
> on Snare #1 is" → correct number); (3) Bulwark's THP attribution. (1) and (3) are engine card text
> (ENGINE-ONLY, F5); (2) is authored text if it lives on the card (REBUILD + ↻ Sync) or engine if it
> is a generated string — check which. → **item 48**.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/card-attribution-nits.test.js:"R-37(1): placing at the cap NAMES the oldest ground that fizzled" / "R-37(2): a POINT-bound entry names only the marker" / "R-37(3): the ordained turn-start card credits the Temp HP to the GUARD talent". (2) was ENGINE-generated after all, not authored — checked before editing, so all three shipped in one ENGINE-ONLY pass.

---

**R-38. Dread Presence's veto silently makes a Weakened target unmovable.** Three moves resolved with
no error and did nothing; the only evidence anywhere was `ui.notifications`. Working as designed —
but it reads identically to a broken range gate, which cost a run real time. Should a refused move
post something the player can see? *(3A-13.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) a refused move POSTS a whisper to
> the mover naming the talent that stopped it.** Spec: the `preUpdateToken` veto path posts one
> whispered card (mover's owners + GM) per refused move, throttled per token per round so a dragged
> path does not spam. ENGINE-ONLY, F5 → **item 48**; headless pin on the message; 🤖 re-test.
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/move-veto-announce.test.js:"R-38: a dragged path — two refusals in one round — posts ONE card; the next round posts another"

---

**R-40. The Gone-to-Weir Fen-Heart's token footprint — 3×3 or 4×4?** `size: "large"` is the schema
cap, so the footprint is set by hand at placement and the biography carries the note. Say which, and
it goes in the block's text. *(Checklist Lunavar row; its sheet-read half is now RETIRED — bench run
16 confirmed `creatureType: custom`, `size: large` and the bio note. Only the number is still open.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) 3×3 (Huge).** Put the number in
> the block's biography note (`data/adversaries.json`) and in the placement guidance; adversaries
> pack **REBUILD** → **item 57**.
> **SHIPPED** in PR #226 (REBUILD, bench-pending) — the biography's placement sentence now reads "set the
> token to **3×3** on placement" with the reach-15 / 30-ft measurements noted against that footprint.
> No token field can carry it: `size: "large"` is the schema cap (2×2), so the number is guidance, as ruled.

---

**R-46. How far should a "charge" carry? The Cragdrake Whelp Pack's Reckless Advance moves 3 ft.**
Raised by bench run 16 (2026-07-27x), which drove it and watched a charging whelp advance **half a
square**. The rule is `edha-move {bySize: true}` and the whelp is **small**, so `bySize` is behaving
exactly as configured — this is a design question, not a defect, and the card states no distance so
nothing is drifting. But "charge toward it, ignoring Reactions — whelps arrive all at once or not at
all" reads like a rush, and 3 ft is not a rush. *Recommended default: give it an explicit
`distanceFt` (its Speed, 25 ft, or half that) rather than `bySize`, and say so on the card.*
⚠️ **Distinct from the Explosive Leap case** in the same section — see **R-48**, which test-pass-fixes
sent back here on 2026-07-27y: it is the same `bySize` question, not a wiring bug.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) FULL SPEED, 25 ft, explicit
> `distanceFt`, stated on the card.** `data/adversaries.json`: `edha-move bySize` → `distanceFt: 25`
> on Reckless Advance + card text; check R-48 (Explosive Leap, same `bySize` question) for the same
> treatment if still open. Adversaries pack **REBUILD** → **item 57**; 🤖 re-test.
> **SHIPPED** in PR #226 (REBUILD, bench-pending) — `{bySize: false, distanceFt: 25}`, card text "charge up to
> 25 ft (its full Speed)". 🤖 row in the Whelp Pack section. R-48 got the same treatment (below).

---

**R-48. The Cragdrake Adult's Explosive Leap says "up to 20 ft" and moves 5. Which side is canon?**
Sent here by fix pass A (2026-07-27y) after root-causing it rather than fixing it — the run filed it
as card-vs-engine drift, and it is, but **neither side is wrong by itself**, so it is a ruling, not a
defect. `bySize: true` means *distance = `[Size]` by RED rank*, and `EDHA_SIZE_FT` is
`[–, 2.5, 5, 10, 15, 20]`. The Cragdrake Adult is a **rival** attuned to red, so its rank is **2** and
the leap is **5 ft** — the engine is doing exactly what the rule says. The card's flat "20 ft" is the
**rank-5** value, so the prose reads as a promise the block can never keep. Same shape as R-46, one
layer over: there the card states no distance, here it states the wrong one.
*Recommended default: the CARD is canon for an adversary — a statted block should not scale, so give
it `distanceFt: 20` and drop `bySize`.* The alternative (keep `bySize`, reword the card to "Leap
`[Size]` ft") is defensible but makes an adversary card read like a PC talent. Whichever way it goes,
authored data changes → **pack rebuild + ⟳ Sync**, which is why fix pass A left it alone: the
rebuild list is currently empty and this is not worth re-opening it on its own.

Ask: Is the CARD canon for a statted adversary block — keep the applied explicit `distanceFt` (the card's own number) on the Cragdrake Adult's Explosive Leap and the three run-19 blocks it turned out to share the shape with (a), or reword those cards to the rank-2 `[Size]` distances the engine was rolling (b)?

⚠️ **UPDATED 2026-07-28e by bench run 19 — this is no longer one block, it is a FAMILY of at least
four across two colours, and three of them state a wrong number on the card.** Measured live:
| block | ability | card says | engine did | rank |
|---|---|---|---|---|
| Cragdrake Adult | Explosive Leap | 20 ft | 5 ft | red 2 |
| **Brandram** | **Shockwave Slam** | **10 ft** | **5 ft** (measured 300 px) | red 2 |
| **Brandram** | **Reckless Advance** | **10 ft** | **5 ft** (from 32.5 ft away, unclipped) | red 2 |
| **Tussock-Sow** | Green Key terrain square | "~10-ft square" | **5 ft** | green 2 |
| *Briar-Gone Grove* | *Green Key terrain square* | *10 ft* | ***10 ft*** ✅ | *green **3*** |
The Grove row is the control that proves the mechanism rather than merely asserting it: **same code
path, rank 3, and the card's number comes out right.** So every rank-**2** rival lands exactly one step
down `EDHA_SIZE_FT` while its card carries the rank-3 figure. Note also that `bySize: true` makes an
authored `distanceFt` **dead** — Shockwave Slam ships `distanceFt: 5` *and* `bySize: true`, and the 5
is coincidence, not the source. **Deciding R-48 once now settles four blocks**, which is a much better
trade for a pack rebuild than the single-block version was. *(Bench run 19; checklist W29 §7, §8.)*
> **DEFAULT (a) APPLIED** in PR #226 (REBUILD, bench-pending; the PM's recorded default, item 57) — the
> **Cragdrake Adult's Explosive Leap** only: `{bySize: false, distanceFt: 20}`, the card's own "up to 20 ft".
> 🤖 row in the Cragdrake Adult section. **Still open for Ben's veto**, and the other three rows of the run-19
> family (Brandram Shockwave Slam / Reckless Advance, Tussock-Sow terrain square) are untouched — the brief
> scoped the default to the Adult; they want the same call in one pass.
> **R-81 default (a) APPLIED** in PR #232 (the three run-19 blocks, riding item 65's rebuild; item 67) —
> the **Brandram's Shockwave Slam** `{bySize: false, distanceFt: 10}` (the dead `distanceFt: 5` beside
> `bySize: true` replaced), the **Brandram's Reckless Advance** `{bySize: false, distanceFt: 10}`, the
> **Tussock-Sow's Sudden Growth** `{sizeByRank: false, sizeFt: 10}` (the terrain square's analogue of
> `bySize`) — each the card's own number, now bold on the card. The run-19 family is now closed on
> default (a) end to end; **still open for Ben's veto** ((b) = fix the cards to the rank-2 numbers
> instead). 🤖 three rows in the `34c` sub-block of the fleet-weapon bench section. Left alone: both
> Sudden Growths (Sow, Grove) still place within Attunement Range by rank (30 / 60 ft) while their cards
> say "within 10 ft" — the same family one field over, reported to the PM.

> **ANSWERED 2026-09-06 (a) — Ben, from the phone board at 21:14 ET, verbatim: *"the CARD is canon for an adversary — a statted block should not scale, so give it `distanceFt: 20` and drop `bySize`."*** Item 57 (PR #226) had already applied exactly that (`bySize: false`, `distanceFt: 20`, card text unchanged; REBUILD owed to the next deploy) — nothing further to change. The principle also underwrites R-81 (item 67) and R-46.
> **CONFIRMED 2026-09-07 (Ben, dashboard), verbatim: "Yeah it makes no sense for an adult drake to
> only jump 5 feet."** No change to the shipped code or the ruling's status — the 2026-09-06 answer
> and PR #226 stand.

---

**R-47. Should the `NO NAMEABLE HOOK:` engineering note be visible on the player-facing card?**
Bench run 16 drove Seize and Roll, Drag Under and Slip the Sound and all three posted their authoring
rationale to chat verbatim — e.g. "NO NAMEABLE HOOK: to-hit-only grab — a hit that deals no damage
makes no document write, so there is no engine hook; the GM rolls the attack and adjudicates the
grip." The wiring is correct and the rows passed; the question is presentational. *Recommended
default: keep the line in the item description (it is the rule-3 ledger and it must stay somewhere
visible in Foundry), but move it behind a GM-only note field or an HTML comment so the table sees
only the fiction.* Affects every adversary ability carrying the marker, not just these three.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) NO: keep it on the item but hide
> it from the table** (GM-only note field or an HTML comment inside the description). Applies to
> EVERY adversary ability carrying the marker; lint pass 5 must keep recognising the marker in its
> new home; build/data change → adversaries pack **REBUILD** → **item 57**.
> **SHIPPED** in PR #226 (REBUILD, bench-pending) — all **16** markers are now `<!-- NO NAMEABLE HOOK: … -->`
> HTML comments inside the ability's `text`/`rider` (Combat Training, Mutation Upgrade, Seize and Roll,
> Cannot Stop, Drag Under, Slip the Sound, The Passed Wasting, A Thousand Small Bodies ×2, The Old
> Agreement, Pay the Ledger, Guardian Stance, Apex Predator ×2, Pack Doctrine, The Tithe Takes the
> Failing). `lint-refs.js` pass 5 still reads the raw prose for the exemption AND now fails a VISIBLE
> marker — mutation-proved both ways. 🤖 row in the adversary-wiring section (includes a ProseMirror
> round-trip check: if the editor strips comments on save, the marker needs a GM-note field instead).
> **Moved by R-89 (a) → item 93** (2026-09-07): the HTML comment described above is gone — the
> declaration now lives in the `noHook` key (`flags.edha-content.noHook` on the built docs).

---

**R-52. A 5-ft `ally-drops` cue cannot reach an ally standing next to its owner. Slack, or edge-to-edge?**
Raised by bench run 19 (2026-07-28e), which measured it four ways rather than asserting it.
`edhaTokenGapFt` measures **centre-to-centre** and `edhaAllyDropEligible` applies **no slack**, so:

| owner | ally position | gap | card |
|---|---|---|---|
| Crownox Ring (**Large 2×2**) | orthogonally adjacent | **7.5 ft** | ❌ |
| Crownox Ring | overlapping the ring's own square | 0 ft | ✅ |
| The Reckoning (Medium) | orthogonally adjacent | 5.0 ft | ✅ |
| The Reckoning | **diagonally** adjacent | **7.07 ft** | ❌ |

A **Large** owner's 5-ft cue can therefore *never* reach a ring-mate beside it — only one standing
inside its footprint — and a Medium owner's misses every diagonal. Both cards promise the opposite:
*"an **adjacent** ox may spend 3 Focus"* and *"a pack-mate dropped **within 5 ft**"*. This is a
measurement convention, not a broken hook, which is why it is here and not in test-pass-fixes.
⚠️ **The engine already answers this question elsewhere and disagrees with itself:** the
`enemy-turn-start` sweep in the same file adds **`+ 2.5` half-square slack**, with the comment
*"half-square slack for adjacency reads"*. `ally-drops` has none.
*Recommended default: give `edhaAllyDropEligible` the same `+ 2.5` slack, which fixes the Medium
diagonal immediately and is a one-line ENGINE-ONLY change (no pack rebuild).* That still leaves the
Large owner at 7.5 ft, so if "adjacent to the ring" is meant to work, the fuller answer is to measure
**edge-to-edge** for sized tokens — a bigger change that would touch every `rangeFt` gate in the
engine, so it should be decided deliberately rather than slipped in. Blast radius today is the two
5-ft rules (Crownox Ring, The Reckoning); Roek's 20 ft is unaffected. *(Checklist W29 §2.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (c) BOTH** — (i) the +2.5 ft
> half-square slack in `edhaAllyDropEligible` NOW, one-line ENGINE-ONLY, matches the
> enemy-turn-start sweep → **item 47**; AND (ii) file edge-to-edge measurement for sized tokens as
> its own TODO item with a bench sweep of every `rangeFt` gate → **item 62**, because the Crownox
> Ring's "an adjacent ox" stays false under slack alone. Headless pin on the four measured cases; 🤖
> re-test = W29 §2 when both ship.
> **(i) SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/ally-drop-side.test.js`, via
> `EDHA_ADJACENCY_SLACK_FT` now read by BOTH adjacency gates. ⚠️ All four measured gaps reach,
> **including the 7.5 ft Large-owner case this ruling's prose predicted would still miss** — the
> boundary is inclusive, so 7.5 ≤ 5 + 2.5. (ii) edge-to-edge is untouched and remains item 62.
> **ANSWERED 2026-09-07 (Ben, dashboard), verbatim: "I'm fine with whatever fix you can find for
> this. I think increasing slack would work, or editing the cue."** The +2.5 ft slack that shipped
> as (i) IS that fix — all four measured gaps reach, including the Large-owner case. Item 62's
> edge-to-edge measurement narrows to a contingency: only pick it up if bench run 42's W29 §2
> re-test finds a gap the slack still misses. Item 62 stays open, narrowed, not closed.

---

**R-42. Map polygon dead spots — fix the polygon, or re-tag the dots?** Point-testing all 35 gazetteer
city dots against the 10 shipped nation polygons: **30 agree, 5 do not.** `city-04 [746,676]`,
`city-11 [484,1120]`, `city-14 [407,1324]` and `city-17 [595,916]` — all tagged `goldenport` — fall
**inside no polygon at all**, so clicking there selects nothing; and `city-31 [1244,1552]`, tagged
`corvaine`, resolves to **`thalendor`**. Controls pass (Aldercourt → corvaine, Heartholt →
thalendor), and `thyrcross-nations.json` is byte-identical to `thyrcross.map.json`'s polygons and to
the deployed copy, so this is **map truth, not a deploy gap**. **These are the same four `lint_map.py`
already WARNs about.** Either Goldenport's polygon is missing its coastal lobe, or those dots are
tagged to the wrong nation — both are edits to `source-materials/maps/thyrcross.map.json`, and only
you can say which is true. *(3A-17.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) FIX THE POLYGONS.** Goldenport
> gains its coastal/island lobes so city-04/11/14/17 fall inside it; Corvaine's edge moves to the
> river bank so city-31 (ruling 154 river port, "the border IS the river") resolves to corvaine.
> Edits to `source-materials/maps/thyrcross.map.json` + regenerated `thyrcross-nations.json`;
> `lint_map.py`'s four WARNs must go to zero. Map-data item, lane R → **item 61**; then the
> "Redrawn polygons hit the right nations" row re-tests.

---

**R-54. Is 11 max health at STR 0 correct for a level-1 PC — i.e. does `HP = system + 1` apply at
level 1?** The checklist's "+1 max health" row demands a fresh actor read **10/10 at STR 0**, and
bench run 21 proved that **can never happen**, for a reason that is design rather than a bug. The
07-19z fix it was written for genuinely worked — a brand-new ＋ Edha Character carries 20 items, 19
of them actions, and **zero transfer Active Effects**, so the AE that used to add the +1 is gone. But
the actor still derives max **11**: `_source…hea.max.bonus` is **0** while derived reads `bonus: 1`,
and **a plain cosmere character with no items and no effects at all reads exactly the same 11**. The
source is `edhaDeriveSheetStats` (engine ~L16178), which deliberately adds +1 to `hea.max.bonus` in
memory for every character — its own comment says *"The Edha reference sheets derive these
differently from the cosmere system… HP = system + 1."* So either **(a)** 11 is intended and the
row's number is simply stale (retire "10/10", write "10/11") — *Recommended*, since the derivation is
documented and deliberate — or **(b)** the +1 is not meant to apply at level 1, and the derivation
needs a level gate. ⚠️ Note this is **not** the same question as the two *defects* it sits next to:
the derived-stat preview showing Health 13 vs the sheet's 14, and the finish top-up leaving health
13/14, are both **bugs to fix either way** (the preview must model the derivation; the top-up must
re-read after it settles). Only the target number is a decision. *(Bench run 21.)*
> **2026-07-28i — both defects are FIXED and the question is unchanged, but one fact about it
> changed.** The 13/14 root cause turned out not to be timing at all: the system clamps every
> resource to its max at the end of `prepareSecondaryDerivedData`, *before* the module raises that
> max, so the +1 was **unreachable by any route** — 11/11 could never be displayed, healed to, or
> rested to. That is now repaired, so if you rule **(a)**, 11 will finally behave like a real 11
> instead of a number painted on the sheet. If you rule **(b)**, the repair becomes a no-op by
> construction. The engine now holds the number as a single constant, `EDHA_HP_BONUS`, read by both
> the sheet derivation and the wizard preview — so answering this is a one-line change that moves
> the sheet, the preview and the tests together. *(Marathon 3, fix pass E.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session, after reading the derivation map
> `docs/ACTOR_STAT_DERIVATION.md`): (c) REMOVE the +1.** This supersedes the earlier lean toward
> (b) and the request for a level gate — **no level gate anywhere**; the math stays a single
> constant. Spec: `EDHA_HP_BONUS = 1` → `0` (keep the constant and its comment block, but correct
> the comment "the cosmere system derives all three differently" to name only Movement and Senses —
> HP is identical to the system: `Character_Building_Rules.md` §HP and
> `Edha_Character_Builder.xlsx` (Character Builder!H22) both give `HP = 10 + STR` at L1, term-for-
> term the system's own advancement table); the clamp repair and `edhaCwDerivedPreview` read the
> constant, so they follow. Re-pin `tests/derived-stats.test.js` + `tests/engine-helpers.test.js`
> wherever they assert the +1. The June pregens that still store a manual `hea.max.bonus` keep it
> until `edha.migrateDerivations()` — left alone unless Ben says otherwise. ENGINE-ONLY, F5 →
> **item 47**; the checklist's "+1 max health" row rewrites as the re-test: a fresh actor at STR 0
> reads **10/10** after Finish, an existing PC at full health drops 11→10 on reload with nothing
> stored changing.
> **SHIPPED** in PR #215 (ENGINE-ONLY, bench-pending) — `tests/derived-stats.test.js`. Note
> `tests/engine-helpers.test.js` needed no change: it never asserted the +1.

---

### K.7 — R-55 … R-56

**R-55. The sheet's budget chips use two different meanings of "X / Y" — which is right?** On a
correctly-built L1 PC (12 attribute points spent, 5 skill ranks spent, 2 of 4 talents taken) the
header strip reads **"Talents 2 / 4"**, **"Attr pts 0 / 12"**, **"Skill rnks 0 / 5"**. Talents is
*spent* / total; the other two are *remaining* / total. The checklist's "Sheet budget bar says 5
skill ranks" row predicted **5/5**, so it was written expecting *spent*/total everywhere. **The fix
that row tests did work** — the denominator is the Edha budget **5**, not the system table's 4, and
it is never the old **-1/4** — so the row is retired on that evidence; this is only about which
numerator convention the three chips should share. *Recommended: make all three spent/total*, since
"Talents 2 / 4" is the one players read most and 0/12 next to a fully-spent sheet reads like an
error. *(Bench run 21.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) all three chips read SPENT /
> total.** Attr pts and Skill rnks flip to spent/total to match Talents. ENGINE-ONLY (sheet
> decorator), F5 → **item 48**; headless pin on the three strings for a built L1 PC (12/12, 5/5,
> 2/4).
> **SHIPPED** in PR #217 (ENGINE-ONLY, bench-pending) — tests/budget-chips.test.js:"R-55: a built L1 PC reads 12/12, 5/5 and 2/4 — spent over total, all three"

---

**R-73. A DISPEL cannot remove a passive that lives on a talent or a trait — it stays that way.**
Fix pass 5, 2026-09-06, while sweeping the `actor.effects` family that had hidden the Stalker's veil
defect. `edha-pick` `source: "effects"` — the Unravel-Everything shape — offers one delete button per
**enabled `actor.effects` entry**, so an ActiveEffect authored `transfer: true` on a talent or trait
never appears in the menu: a PC's `Hardy` / `Collected` / `Surefooted`, a Cinderhound's `Cinder Coat`,
the Frostbinder's permanent `braced` from `Predictive Ward`. **Default applied: leave the menu
narrow.** Deleting a yielded ITEM effect writes to the item, so one click would permanently strip the
passive from that creature's copy of the talent — a much worse failure than a dispel that cannot
reach it, and unrecoverable without a re-drag or a ⟳ Sync. **If you want those dispellable**, the fix
is *not* to widen the read on its own: it is to widen the read AND guard the delete so only
actor-level effects are removed, offering item-owned ones as a temporary **disable** instead. Say the
word and it gets built that way. *(Fix pass 5; no checklist row — this is a decision, not a test.)*
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): VETOED — widen the dispel the safe
> way (b), not the narrow applied default.** Spec exactly as this ruling's own "say the word"
> clause: `edha-pick` `source:'effects'` lists item-owned transferred effects too (Hardy, Collected,
> Surefooted, Cinder Coat, Predictive Ward's braced), offered as a temporary DISABLE (`disabled:
> true` on the effect, never delete); the delete path stays guarded to actor-level effects only.
> ENGINE-ONLY, F5 → **item 54** (folded with R-35); pin both branches headlessly; bench re-test =
> Unravel Everything can disable a target's Hardy and the talent copy survives intact. **Stays
> HERE** — open, pending ship — until item 54 lands and the bench confirms it; then it moves to §K.
> **SHIPPED** in PR #224 (ENGINE-ONLY, bench-pending) — `tests/dispel-widening.test.js`. Item-owned
> effects are offered as a DISABLE; the delete guard is on the DOCUMENT (`edhaEffectOwnerItem`,
> fail-closed), so a forged delete button cannot strip a talent's copy.

---

**F-1. Rank-3 Black Attunement Range measures 60 ft**, not the 30 ft several stagings assumed. Any
row whose expectation was built on 30 ft should be re-read.
> **SETTLED 2026-09-07 — Ben asked (dashboard): "All attunement ranges should be the same- what
> does Red rank-3 attunement range read?"** Answer from the engine: `EDHA_ATTUNE_FT = [0, 15, 30,
> 60, 90, 120]` (`module-src/scripts/engine/35-targeting-attunement-range-aoe-templates.js:24`) is
> indexed by color **RANK**, not by color, and is the same table for every color — Red rank-3 reads
> **60 ft**, exactly like Black. Nothing to change; the 30 ft assumed in old stagings was the
> stager's own error, not a rule difference between colors.

**F-2. Marathon 1 run 6's 2bX-5 PASS was recorded over a broken roll.** Its contest half is worth
re-reading now that attribute contests demonstrably work (R-43).
> **SETTLED 2026-09-07 (Ben, dashboard ✓ DONE on both of the day's pastes — the morning batch and 20:30): a flag, not a question, so there was nothing to answer; recorded and closed at item 96's review.** The 2bX-5 contest re-read, if anyone wants it, is a bench matter (a 🤖 row), not a ruling.

**R-56. Should adversaries use the Edha Senses Range table too, or keep the cosmere ladder?** Fix
pass E made PC sheets read the Edha table (`Character_Building_Rules.md` §Senses Range: AWA 0 → 10 ft,
1 → 15, 2–3 → 20, 4 → 25, 5+ → 30), because the wizard preview already promised it, the PC's own
token sight was already built off it, and the sheet was the only surface still showing the system's
ceil(AWA/2) ladder [5, 10, 20, 50, 100, ∞]. **Adversaries were deliberately left alone** — they are a
GM-facing surface, Ben is mid-session, and their tokens ship a flat **10 ft** default from the build
rather than either table, so widening the change would have altered combat vision for every creature
on the map to settle a PC bug. That leaves three different rules in play for three surfaces, which is
one too many. Options: **(a)** extend the Edha table to adversary sheets AND their token sight, so
one rule governs everything — *Recommended*, and it matches the 07-17c ruling that adversaries "use
the same vision rules as players unless bespoke"; **(b)** leave adversaries on the system ladder and
accept that a creature's Senses Range means something different from a PC's; **(c)** keep the flat
10 ft build default as the adversary rule and say so, retiring the AWA link for them entirely. A
block's explicit `senses` field stays the bespoke override under all three. Nothing is blocked on
this — it only decides how far the fix reaches. *(Marathon 3, fix pass E.)*

> **MEASURED 2026-07-28j (bench run 22) — it is worse than "three rules for three surfaces": the
> three surfaces disagree about the SAME creature, and one of the three moves when you press a
> button.** Read at whole-population scale, not on one token.
> - **World actors: 5 ft.** All **47** adversaries in the world are AWA 0 → `senses.range.value`
>   **5**, `visionMode "sense"`, and token sight **exactly equals** Senses Range — **0** mismatches.
> - **Pack: 10 ft.** All **52** pack adversaries ship `prototypeToken.sight.range` **10** against a
>   `senses.range.value` of **5** — **52 of 52** internally mismatched. So R-56's "flat 10 ft from
>   the build" is confirmed, and it is *only* on the token, never on the sheet.
> - **⚠️ And `⟳ Sync from Pack` PUSHES the 10.** Observed live: a placed token hand-broken to sight 0
>   came back at **10** after one sync while its actor's Senses Range stayed **5**. So a *synced*
>   token sees 10 and a *freshly created* one sees 5 — the same creature, two numbers, decided by
>   whether anyone clicked sync.
> - **Mechanism, so option (a) is a small change:** `edhaDeriveSheetStats` opens with
>   `if (actor?.type !== "character") return;` (~L16296) and **both** `preCreateActor` token-default
>   hooks do the same. The Edha table is character-only by one guard in three places, not by design
>   spread through the engine.
> - **⛔ The "bespoke `senses` override stays" clause has no instance under any option:** **0 of 52**
>   pack and **0 of 47** world adversaries carry a `senses.range` override or `useOverride`. If that
>   escape hatch is meant to be real, one block needs to author it so it can be tested.
>
> This also blocks a checklist row: `# Bench-results fixes` → "Adversary tokens see like PCs" asserts
> **AWA 0 → 10 ft**, which no live world adversary can satisfy, and its ⚑ sibling asks whether 10 ft
> *feels* wrong when 10 ft is not what is playing. Both wait on this ruling.
> **ANSWERED 2026-09-06 (Ben, phone, via the relay session): (a) ONE rule — adversary sheets AND
> token sight use the Edha AWA table.** Spec: drop the `type !== 'character'` guard for senses in
> `edhaDeriveSheetStats` and both `preCreateActor` token-default hooks (~3 places); the flat 10 ft
> pack token default goes (build emits sight = table(AWA), so pack sheet and token agree); author
> ONE adversary block with an explicit `senses` override so the bespoke escape hatch is testable
> (Ben did not pick which). ENGINE + BUILD/DATA → pack **REBUILD** (Ben's deploy) + a world bulk
> sync (now authorised) → **item 55**. Unblocks the "Adversary tokens see like PCs" row (AWA 0 → 10
> ft) and its ⚑ feel sibling.
> **SHIPPED** in PR #240 (REBUILD + world bulk sync, bench-pending) — guard gone at all three engine
> sites (+ the `ready` refresh sweep now resets adversaries too); the build's `advSensesRangeFt`
> replaces the flat 10; the override block is **Briar-Gone Grove, `senses: 30`** (a rooted
> grove-heart has no eyes and perceives through its own soil). Pins:
> tests/adversary-senses.test.js:"R-56: an adversary at AWA 0 derives 10 ft on the sheet (was the
> cosmere ladder's 5)" and siblings; scratch read-back: 52 pack adversaries, 1 changed (the Grove),
> 51 unchanged at 10. Ben: rebuild + deploy + press ⟳ Sync Adversaries from Pack.
> **REOPENED 2026-09-07 (Ben, dashboard), verbatim: "Honestly we should be using the cosmere
> ladder for everyone. If that's a huge issue or rebuild let me know before changing."** This
> reverses the direction R-56
> shipped 2026-09-06 (the Edha AWA table for everyone) back toward the SYSTEM's own ladder for
> everyone. **WAITING — nothing changed yet.** PM's scope, so Ben can decide before dispatch: the
> Edha AWA table (0→10, 1→15, 2–3→20, 4→25, 5+→30 ft) is written into `senses.range.derived` for
> every actor type by `edhaDeriveSheetStats` (ENGINE-ONLY to remove), the build stamps
> prototype-token sight from the same table via `advSensesRangeFt` in `scripts/foundry-build.js`
> (adversaries pack **REBUILD** to change), the character-creation wizard's preview promises the
> table, `scripts/bench-setup-console.js` gives bench PCs their sight (R-2), and the docs
> `Character_Building_Rules.md` §Senses Range + `docs/ACTOR_STAT_DERIVATION.md` + the tests
> pinning `edhaSensesRangeFtFromAwa` all carry it. The system ladder is `[5, 10, 20, 50, 100, ∞]`
> indexed by `ceil(AWA/2)`, so AWA 0 → 5 ft, 1–2 → 10 ft, 3–4 → 20 ft, 5 → 50 ft: stingier than the
> Edha table at AWA 0–2, wider at 5+. Size M (ENGINE + adversaries REBUILD + wizard + docs +
> tests) → **TODO item 83, lane H** — filed but held until Ben says go.
> **ANSWERED (final) 2026-09-07 21:51 (Ben, chat), verbatim: "Cosmere ladder for everyone."**
> This supersedes both earlier positions — the 2026-09-06 phone tap for **(a)** (extend the Edha AWA
> table to adversaries, shipped in PR #240) and, before that, fix pass E's move of PC sheets onto the
> Edha table at all. Ben's phone tap of 2026-09-07 17:25 re-affirmed (a); the chat answer six hours
> later is the later and explicit one and wins. **The answer is effectively option (d), which the
> menu never listed: the cosmere system's OWN ladder `[5, 10, 20, 50, 100, ∞]` indexed by
> `ceil(AWA/2)` for EVERY actor type** — AWA 0 → 5 ft, 1–2 → 10, 3–4 → 20, 5–6 → 50, 7–8 → 100,
> 9+ → ∞. The bespoke escape hatch is unchanged and still has exactly one instance:
> **Briar-Gone Grove, `senses: 30`**.
> **SHIPPED** in PR #313 (**ENGINE, F5** + adversaries **REBUILD** + ⟳ Sync Adversaries — item 83).
> The shape of the fix is what makes it small: the system's own
> `CommonActorDataModel.prepareSecondaryDerivedData` (cosmere-rpg 2.1.0 `index.js:8455-8457`,
> `SENSES_RANGES` / `awarenessToSensesRange` at `:8534-8538`) **already writes exactly this ladder
> into `senses.range.derived` for both actor models** — `CharacterActorDataModel` supers into it
> (`:17628`) and `AdversaryActorDataModel` (`:25877`) inherits it untouched. So the sheet half is
> the **removal** of `edhaDeriveSheetStats`'s Edha-table write, not a re-tabling: the engine now
> writes nothing at all to senses, and the system's number — which reads AWA as `value + bonus`,
> which the Edha copy never did — stands on every sheet. What did have to be re-tabled is the three
> surfaces the system does *not* derive: `edhaSensesRangeFtFromAwa` (the token-sight stamp and the
> `preCreateActor` / `updateActor` hooks), the build's `sensesRangeFtFromAwa` / `advSensesRangeFt`
> (prototype-token sight in the pack), and `scripts/bench-setup-console.js`'s R-2 bench-PC sight
> (AWA 2: **20 → 10 ft**). The wizard preview follows the same helper and renders the ladder's top
> rung as **∞** rather than `Number.MAX_SAFE_INTEGER` (the wizard's attribute cap above level 1 is
> 99, so AWA 9 is reachable there).
> **Measured:** the adversaries pack rebuild moves **51 of 52** prototype tokens from `sight.range`
> **10 → 5**; Briar-Gone Grove stays **30** on both sheet and token; a full leaf-level diff of the
> two scratch builds (18,879 leaves) shows **no other field difference** but build timestamps. Pack
> sheet/token parity — R-56 (a)'s invariant — holds **52/52**: 51 blocks carry no override and the
> system derives 5 for them, the Grove carries 30 on both.
> **What Ben's existing actors need:** an **F5 alone** fixes every SHEET (PC and adversary — the
> system re-derives on the next prepare, and the `ready` sweep re-renders open sheets). A token's
> stored `sight.range` is persisted data and does **not** move on F5: adversaries are re-stamped by
> the pack REBUILD + **⟳ Sync Adversaries from Pack**, and existing **PC** tokens need
> `edha.fixPcTokens()` from the GM console (or any AWA edit, which re-fires the `updateActor`
> watcher). Bench PCs are re-stamped by the next `bench-setup-console.js` run.
