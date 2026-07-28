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

**When a ruling is answered:** record the answer inline under its number, move it to §K (Settled),
and push the consequence — card text, `data/domain.json` prose, the engine, and any checklist row
that was waiting on it. A ruling is not done until the thing it decides has actually changed.

---

## A. Permissions & world settings

**R-1. Should the PLAYER role keep `ACTOR_CREATE`?**
It has it in your world, which makes the `summon-actor` **relay branch dead code at your table** —
run 13's player-cast Construct worked perfectly but never used the relay. This is the only thing
blocking the checklist's `GM summon relay` row, and that row can never pass as written until you
answer: revoke the permission and the relay becomes reachable (the row becomes 🤖), keep it and the
relay is dead code and the row should be retired. *(From marathon 3A-1; blocks a checklist row.)*

**R-2. Should `scripts/bench-setup-console.js` give bench PCs a normal sight range?**
They carry **10 ft**, which makes a player client render almost nothing — it already caused a
near-false-PASS at run 13. *Recommended: yes, give them normal vision.* Distinct from the adversary
10 ft, which is a deliberate design dial and stays a ⚑ checklist row ("Adversary sight range — does
10 ft feel wrong? Say a number"). *(3A-2.)*

**R-3. `applyButtonsTo` now runs on one GM**, so only that GM sees its notification — but the
setting is **world-scope**, so the effect is global. Confirm that is intended. *(3A-5.)*

---

## B. Scope & width — what a rule should reach

**R-4. THE BIG ONE: out-of-combat scope.** Every run of both marathons saw some face of this. Today,
out of combat: any focus **decrease** counts as a spend (including your own GM bookkeeping edits);
every rule-owner on the scene watches everything; an adversary's own ability cost is taxed by enemy
watches; per-round ledgers **never reset**; "Restrained until your next turn" never expires.
*Recommended: gate scene/turn-keyed watches on an ACTIVE combat containing the owner, and tag engine
bookkeeping writes so GM edits do not read as spends.* This one decision retires a family of
symptoms rather than one row. *(3B-A.)*

**R-5. Does Fault Line's line spare allies?** The card says "each character"; the engine catches
enemies only. The same question applies to **every `kind: line` zone**. *(3B-B.)*

**R-6. Fault Line's dangerous-terrain Region catches bystanders scene-wide**, with no friend/foe
clause — it incidentally ticked your **Stitchmother** during run 11 (effects verified back to
snapshot state afterwards). Same shape as R-5 but on the Region rather than the line. *(3A-4.)*

**R-7. Final Decree / Edict's Temp HP rider swept "17 ally(ies)"** — and Final Decree's "every enemy
in Attunement Range" has no encounter scoping at all, so on a shared map it decree-bound five of your
placed playtest adversaries alongside the bench targets. Is Attunement Range the intended scope, or
should it be the encounter? *(3B-B, corroborated by run 8's 2bV-9 sighting.)*

**R-8. Roster cross-talk between the 15 always-armed bench PCs** — every bench PC watches every
event, which is not a table condition. Is this only a bench-fixture problem, or does it say something
about how broadly watches should be scoped? *(3B-B; overlaps R-4.)*

---

## C. Mechanics — what a rule should do

**R-9. Does "cannot regain HP" block heal-overflow → Temp HP?** Blocked today: a fully-cut heal
leaves no overflow to convert, so Bench — Life's `edha-overflow-thp` produced nothing on a
Withering-Touch-blocked target. Is Temp HP a *heal* (blocked, as now) or a *grant* (should bypass)?
A **direct** Temp HP grant already bypasses and was measured doing so — 7 THP landed with HP pinned
and later absorbed 4. **This also decides how checklist row 2bW-1's own example must be re-worded**,
because as written it asks for something the mechanics cannot produce. *(3A-7 + checklist 2bW-1.)*

**R-10. Does "cannot regain HP" stop drop-to-1 stabilization?** Same family as R-9, different
consumer. *(3B-C.)*

**R-11. A fully-blocked heal still spends the click's cost.** Refund, or keep the cost? *(3B-C.)*

**R-12. Should a raised creature clear its OWN Harvested Remain?** An adversary that had itself been
harvested was raised by spending a *different* Remain, and came back at 1 HP **still wearing the
`harvested` marker with its own ledger entry live** — a living creature that is also a Remain. The
card says nothing either way. *(3B-C + checklist Raise Dead row, Death section.)*

**R-13. A snare placed UNDER a creature insta-springs**, where the card says "enter or pass through".
*Recommended: arm, do not spring.* Narrowed by run 7: placement **adjacent** does not insta-spring,
only placement directly under a creature does. *(3B-C.)*

**R-14. Melee mutation riders fire on a nat-1 graze application.** Intended? *(3B-C.)*

**R-15. Coercive Pressure no longer stacks with another next-test rider** (e.g. Probability Net) —
the second write overwrites the first, because the bespoke Cognitive-disadvantage flag that allowed
both is gone. Confirmed on the live actor: `flags.nextTestMod` is **one object**, so each bearer has
exactly one slot. Does losing cross-rider stacking matter at the table? *(Checklist 2bI-4.)*

**R-16. Wary now reduces Whispered Doubt's extra focus loss, usually to zero.** Observed live: Wary
+ Discipline 1 → net extra **0**, with a "🛡️ Wary: involuntary focus loss reduced by 1" card. Wary's
own text says *involuntary focus loss*, so this reads correct — but it did not happen before the
migration, because the loss now goes through the shared involuntary-focus path. Keep it, or restore
the old unreduced loss? *(Checklist 2bI-6.)*

**R-17. Puppeteer / Unnerving Approach — the once-per-round budget now spends on CLICK, not on
card-post.** Declining an offer no longer burns the use (verified: an ignored picker did not block a
same-round re-use). **But each ignored USE still charges its Investiture** — only the round budget
waits for the click. Two questions: is the click-not-post budget intended, and should an ignored use
refund its Investiture? *(Checklist 2bJ-10.)*

**R-18. Should quarry advantage refuse to stomp an active DISADVANTAGE?** Attacking your quarry while
Weakened rolls at **advantage** today — the quarry site runs after Weakened's and overwrites it. That
is the house convention (pack advantage, the Opportunity adv-test and `edha-next-test-mod` all stomp;
only `edha-test-rider` has the opt-in `unlessDisadvantage` that Apex Predator uses). Left alone
deliberately rather than changed silently. *(Checklist Quarry row, Heroic.)*

**R-19. Should combat-timing talents grant to ADVERSARIES as well as PCs?** They do now — the
retired hooks were gated `type === "character"` and rule-driven dispatch does not need that gate, so
an adversary carrying a combat-timing talent gets its combat-start grant. Deliberate change; say if
you would rather it stayed PC-only. *(Checklist 2bE-9. The mechanical half stays a 🤖 row.)*

**R-20. Should Pattern Recognition's disadvantage expire at the ROUND change?** It does now: the card
always said "their next test **this round**", and the old flag waited for ever. Say if you would
rather it kept waiting. *(Checklist 2bJ-3. The mechanical half stays a 🤖 row.)*

**R-21. Should Phantom Double's out-of-range refusal become a pre-cost veto?** Identical player
outcome, and it removes the refund race *by construction* rather than by sequencing — but it drifts
the rule's own text and needs a leyline rebuild. **Default taken: leave it** (the text promises a
refund). *(3A-8.)*

**R-22. `edhaConsumeList` refunds `value.min`.** If a talent ever ships `min ≠ max`, the system's
consume dialog lets the player pay more and the refund would under-credit. No talent does today —
this is a "close the door before it matters" call. *(3A-6.)*

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

---

## D. Talent identity & tree shape

**R-23. Volatile Strike — whose hit should it ride?** Card and rule description both say "when you
hit with a melee attack" (a rider), but it is authored `skill_test` **with its own damage formula**,
so it derives item-specific and only ever offers itself on its own damage.
(a) `whenDealer: "any"` → a true rider on any melee impact hit, accepting that a standalone use also
self-offers; or (b) it is the Special Action you take *after* your weapon hits, in which case the
on-hit rule is the redundant half and should be `whenDealer: "self"` or removed.
**Settleable entirely from the Events tab — `whenDealer` is a field on the rule, no code change
either way.** Never benched. *(3A-3 + checklist Red row — the same question, recorded twice.)*

**R-24. Red / Momentum — is Reckless Advance the intended branch root?** The graph half is verified
live: the compiled Red tree reads Reckless Advance {skill red 1, no talent prereq}, with Burning
Drive and Volatile Strike hanging off it and Unstoppable at {Reckless Momentum, red 3}. The 07-24 fix
trusted the **layout + connections** over the card text, which had said "Burning Drive". If you
intended Burning Drive to come first, say so and the edge flips instead. *(Checklist Red row.)*

**R-25. Rallying Shout's reminder now prints on an ally ABOVE 0 HP.** Deliberate change, re-confirmed
at run 11 on an ally at 32 HP. The number defect in the same line is fixed and table-verified
("recovery die + **3** health" at Leadership 3). Only the gate is yours: keep the always-print, or
restore the at-0-HP-only gate? *(3A-11 + checklist 2bM-6.)*

---

## E. Cards, text & naming

**R-26. What should a blank-note `edha-push` card say?** The old talent-specific default is
definitively gone (nothing says "Shockwave Slam" any more), but a fresh push rule with `note: ""`
does not read "Push" either — it reads **the owning talent's name** ("💥 Vigilant Stance — … is pushed
3 ft."). That is arguably better than a literal "Push". Say which is canon and the card, the row and
the engine get aligned to it. *(Checklist 2bA-6. Its two secondary observations were re-driven at run
12 and are artifacts of a hand-authored probe, not engine behaviour — `bySize: true` overrides
`distanceFt`, which is what "3 ft for a 5 ft rule" was really seeing.)*

**R-27. Battle Fever — which side is canon, the card or the engine?** The card says "+1 to your next
test (max = Rank), **resets at start of your turn**"; the engine's rally bonus rides **every** test
until turn start (`rally {count, resetOn: turn}` — it never consumes on a test; observed +2[Rally] on
6+ consecutive rolls). The max=Rank cap works on both readings. *(Checklist Red spot-checks row.)*

**R-28. Withering Touch's duration — "start" or "end" of your next turn?** The engine
(`expireAfter {round: 2, turn: 0}`), **both** chat cards and the **measured** expiry all say **END**;
only the prose says *start*. *Recommended: fix the prose* (and the source in `data/domain.json`) —
do not leave three artifacts agreeing and one disagreeing. *(3A-15 + checklist 2bW-1.)*

**R-29. Combat Training's garbled source.** The cheatsheet sentence reads "turn one of its own
**grazes into a graze**". Rule whether that means **miss → graze** or **graze → hit**, and the text
gets fixed to match. Open since 2026-07-16. *(Checklist adversary-wiring row.)*

**R-30. 2bR-17 spec vs rule.** The checklist row says Counterpoint tests "vs the target's **Cognitive
defense**"; the rule is `vs: "prompt-dc"` (the GM types the influence DC). Arguably correct for a
counter to an influence test — but the row and the rule disagree and one must move. Run 14 confirmed
the rule works as authored once a DC is typed. *(3A-12.)*

**R-31. Should a PC's own Phantom Double token be labelled "(Illusion)"?** The plain name is
deliberate for The Seeming's veil, but no veil applies in the PC direction. *(3A-9.)*

**R-32. Black Draw Mana's sweep card says "affected 5"** when all five were already Weakened —
intent vs. state. Which should the card report? *(3A-10.)*

**R-33. 2bI-3's card text stays enemies-only** while the behaviour is wider. Align the text or narrow
the behaviour. *(3B-C.)*

---

## F. Cosmetic & feel

**R-34. Walking Ruin has no token indicator.** The toggle is tracked internally and nothing on the
token says the character is leaving ruin behind — unlike **every** other scene-arm in the project
(Cascade Armed, Crowned, `withernext`, `warlord`). Consistency call. *(3B-D + checklist Destruction
row.)*

**R-35. Should Unweaving's dispel card list the OMEN MARKER itself as a dispellable effect button?**
Today the card lists enabled effects; the Omen marker is not among them. *(3B-D + checklist Chaos
residuals row — that row's other half, the through-walls rendering, was CLOSED on run 13's
sense-through evidence with a negative control.)*

**R-36. Temp HP source relabelling misattributes a surviving value.** When a smaller Temp HP grant
loses the keeps-higher comparison, the `source` is still relabelled to the loser — so an ally holding
6 from Final Decree ends up reading "Bear Witness", and a 99-THP ally ends up reading "Investiture of
Command". The number is right; the attribution lies. *(3B-D.)*

**R-37. Three small card-text nits, one decision:** Ordained eviction is never verbalized (the place
card says "(2/2)" but never says the oldest fizzled) · Inevitable Snare's grammar reads "the snares on
Snare #1 **is** inevitable" · Bulwark's THP attribution. Fix all three, or leave them? *(3B-D.)*

**R-38. Dread Presence's veto silently makes a Weakened target unmovable.** Three moves resolved with
no error and did nothing; the only evidence anywhere was `ui.notifications`. Working as designed —
but it reads identically to a broken range gate, which cost a run real time. Should a refused move
post something the player can see? *(3A-13.)*

**R-39. Is the roll dialog's die-icon COLOUR cue enough?** The advantage control in the cosmere
dialog is the rendered **d20 icon itself** — a pre-seeded CSS class, i.e. a colour, with no label,
no checkbox and no form field (which is why a DOM read reports nothing, and why run 11's "the dialog
exposes no advantage control" reading was retracted). It **is** pre-selected and it **is** overridable
by clicking. The one real limitation is that the preview line always reads `1d20 + N` and then rolls
`2d20kh + N`, because `configureModifiers()` runs after the dialog resolves. **If the colour is not
readable enough at the table, the answer is more whispered advantage cards like the quarry one — NOT
an engine change.** The look-at-it half is a ⚑ checklist row; the "so what do we do about it" half is
this ruling. *(3A-14.)*

---

## G. Adversaries & bestiary

**R-40. The Gone-to-Weir Fen-Heart's token footprint — 3×3 or 4×4?** `size: "large"` is the schema
cap, so the footprint is set by hand at placement and the biography carries the note. Say which, and
it goes in the block's text. *(Checklist Lunavar row; its sheet-read half is now RETIRED — bench run
16 confirmed `creatureType: custom`, `size: large` and the bio note. Only the number is still open.)*

**R-46. How far should a "charge" carry? The Cragdrake Whelp Pack's Reckless Advance moves 3 ft.**
Raised by bench run 16 (2026-07-27x), which drove it and watched a charging whelp advance **half a
square**. The rule is `edha-move {bySize: true}` and the whelp is **small**, so `bySize` is behaving
exactly as configured — this is a design question, not a defect, and the card states no distance so
nothing is drifting. But "charge toward it, ignoring Reactions — whelps arrive all at once or not at
all" reads like a rush, and 3 ft is not a rush. *Recommended default: give it an explicit
`distanceFt` (its Speed, 25 ft, or half that) rather than `bySize`, and say so on the card.*
⚠️ **Distinct from the Explosive Leap case** in the same section — see **R-48**, which test-pass-fixes
sent back here on 2026-07-27y: it is the same `bySize` question, not a wiring bug.

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

**R-47. Should the `NO NAMEABLE HOOK:` engineering note be visible on the player-facing card?**
Bench run 16 drove Seize and Roll, Drag Under and Slip the Sound and all three posted their authoring
rationale to chat verbatim — e.g. "NO NAMEABLE HOOK: to-hit-only grab — a hit that deals no damage
makes no document write, so there is no engine hook; the GM rolls the attack and adjudicates the
grip." The wiring is correct and the rows passed; the question is presentational. *Recommended
default: keep the line in the item description (it is the rule-3 ledger and it must stay somewhere
visible in Foundry), but move it behind a GM-only note field or an HTML comment so the table sees
only the fiction.* Affects every adversary ability carrying the marker, not just these three.

---

## H. Map & character creation

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

---

## I. ⚠️ APPLIED AS DEFAULT — veto if you disagree

These are **already live in the code**. They were taken as defaults rather than left to stall a fix.
If you disagree with any, say so and it gets reverted.

**R-43. ⚠️ "A card that says 'tests Speed' means the ATTRIBUTE." — THIS CHANGES LIVE DICE MATH.**
**Concussive Yield** and **Inevitable Snare** now add the target's Speed where they previously added
nothing. The *implementation* is proven — run 11's 2bAD-1 rolled "Speed 29" with spd 10, and a bare
d20 cannot exceed 20 — but **the balance question is untouched and is worth one deliberate look.**
This is the item to read first if you read only one in this section. *(3B-E.)*

**R-44. The Pack's placement no longer requires `amt > 0`.** With the marker hand-cleared and the
pointer surviving, The Pack posts **no** bonus card but **still places** its Insight. *(3B-E.)*

**R-45. Confident Command's `per` is Persuasion.** The same dead id `per` resolved differently in two
talents — Sharp Eye's `per` was **Perception** (`prc`) — which is exactly why the two could not be
swept together. *(3B-E.)*

---

## J. Flagged, but not questions

Recorded so they are not re-derived. No decision needed unless something here surprises you.

**F-1. Rank-3 Black Attunement Range measures 60 ft**, not the 30 ft several stagings assumed. Any
row whose expectation was built on 30 ft should be re-read.

**F-2. Marathon 1 run 6's 2bX-5 PASS was recorded over a broken roll.** Its contest half is worth
re-reading now that attribute contests demonstrably work (R-43).

---

## K. Settled

*(Empty. As rulings are answered, move them here with the answer and the commit that applied it —
so the next session can see what was decided and what it changed, not just that it was decided.)*
