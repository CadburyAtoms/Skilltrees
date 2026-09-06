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

*(R-1 — should the PLAYER role keep ACTOR_CREATE — ANSWERED 2026-09-05, moved to §K.)*

**R-2. Should `scripts/bench-setup-console.js` give bench PCs a normal sight range?**
> **ANSWERED 2026-09-05 (Ben, via the mobile board inbox): YES — give them normal vision.**
> Matches the recommendation. Consequence: raise the bench PCs' 10 ft sight in
> `scripts/bench-setup-console.js`. Filed as **TODO_REPO_HYGIENE #26**. The **adversary** 10 ft is
> explicitly NOT touched — it stays a design dial and a ⚑ row, exactly as this ruling says.

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
> **28a landed in PR #TBD (2026-09-06)** — half (a) only: scene/turn-keyed watches now gate on
> `edhaInActiveCombat(actor)` (an ACTIVE combat containing the owner), with `scope: "self"` watches
> and the wall-clock prompt debounces deliberately ungated. **R-4 stays HERE, not in §K**: it settles
> only when **28b** (tagging bookkeeping writes) has landed AND the bench has confirmed the live
> behaviour — see the 🤖 rows under `# BENCH — Engine-wide & cross-tree`.


*(R-5 — does Fault Line's line spare allies — ANSWERED 2026-09-05, moved to §K.)*

**R-6. Fault Line's dangerous-terrain Region catches bystanders scene-wide**, with no friend/foe
clause — it incidentally ticked your **Stitchmother** during run 11 (effects verified back to
snapshot state afterwards). Same shape as R-5 but on the Region rather than the line. *(3A-4.)*

*(R-7 — Final Decree / Edict's Temp HP rider scope — ANSWERED 2026-09-05, moved to §K.)*

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

*(R-19 — combat-timing talents granting to adversaries too — ANSWERED 2026-09-05, moved to §K.)*

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

---

## F. Cosmetic & feel

*(R-34 — Walking Ruin's indicator — ANSWERED 2026-09-05, moved to §K.)*

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

*(R-49 — is a creature an obstacle for push collision damage — ANSWERED 2026-09-05, moved to §K.)*

**R-47. Should the `NO NAMEABLE HOOK:` engineering note be visible on the player-facing card?**
Bench run 16 drove Seize and Roll, Drag Under and Slip the Sound and all three posted their authoring
rationale to chat verbatim — e.g. "NO NAMEABLE HOOK: to-hit-only grab — a hit that deals no damage
makes no document write, so there is no engine hook; the GM rolls the attack and adjudicates the
grip." The wiring is correct and the rows passed; the question is presentational. *Recommended
default: keep the line in the item description (it is the rule-3 ledger and it must stay somewhere
visible in Foundry), but move it behind a GM-only note field or an HTML comment so the table sees
only the fiction.* Affects every adversary ability carrying the marker, not just these three.

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

**R-59. ⚠️ A chat-card button that fails now raises an error toast**, where all 33 previously wrote
only to the console. This is what let Living Image's Pay button read as a silent no-op for four bench
runs. Bounded to the 33 *outer* click-handler catches — the ~270 inner defensive catches stay quiet.
**The feel question is yours:** if a toast at the table is more disruptive than a button that quietly
does nothing, say so and it goes back to console-only (or becomes GM-only). *(Fix pass F.)*

**R-60. ⚠️ Scene-reset sweeps now cover ONE population: directory actors ∪ canvas tokens,
deduplicated.** Before, the ten per-tree sweeps answered "who gets reset" five different ways —
Sovereignty reset canvas tokens ONLY (an off-scene character kept `dieStep` forever), Life swept
every directory actor including adversaries and summons, and only Chaos deduped an actor with a
token against its directory entry (the rest swept it twice). All ten now run through one
`edhaSceneReset` applier using the Chaos-pattern population; each tree's flag/status lists are
unchanged, and the R-58 cross-combat guard still applies per actor. The veto surface: if some
tree's narrower sweep was intentional, name it and that tree gets a scoped population.
*(Hygiene campaign 2026-08-10.)*

**R-61. `oncePerScene` now has ONE gate and ONE stamp — each handler type keeping its CURRENT
polarity.** The same field name meant four things (default-off, default-on, strict-true, plus a
rogue `detonateUsed.*` flag namespace with its own scene-clear). No live behavior changes: the
shared gate takes the polarity as an explicit per-type argument matching what each did before, and
`detonateUsed.*` merges into `sceneOnce.*` (the gate reads both keys, writes only `sceneOnce`).
One real fix rides along: `edha-decree` stamped its scene-once flag UNCONDITIONALLY while vetoing
conditionally — the stamp now matches its own veto. Whether all types should converge on one
polarity is a separate, untaken ruling. *(Hygiene campaign 2026-08-10.)*

**R-62. "Whisper the GM" now has one helper with an explicit audience.** Two spellings disagreed:
`getWhisperRecipients("GM")` reaches every GM including offline ones; the `u.active && u.isGM`
filter reaches online GMs only. Applied mapping: action-prompt cards (someone must click NOW) →
active GMs; record/audit cards → all GMs, so the log survives to a later login. If a specific card
lands on the wrong side of that line, name it. *(Hygiene campaign 2026-08-10.)*

**R-63. ⚠️ Unknown token disposition now fails CLOSED everywhere.** Twelve inline checks still
defaulted a missing disposition to FRIENDLY (`?? 1`) — the convention the ally-drop fix explicitly
retired after bench run 18 measured the cross-disposition bug — and one helper failed OPEN to
"enemy". All now use the Number.isFinite guard: no disposition, no effect. This can change live
behavior for tokens with genuinely unset disposition; if a talent should treat unknown as friendly,
that is one veto away. *(Hygiene campaign 2026-08-10.)*

**R-64. ⚠️ Victim resolution now uses the full 3-term chain everywhere:
`options.victim → options.target → the clicking user's current target`.** Six handler sites skipped
the middle term, so an event that carried `options.target` (but no `victim`) fell through to
whatever the CLICKING USER happened to have targeted — a different creature. This changes live
targeting on those six paths, in the direction of "the creature the event was actually about."
*(Hygiene campaign 2026-08-10.)*

**R-65. ⚠️ Every formula roll now passes through `edhaFoldDieMath`, via one `edhaRollFormula`
helper — THIS CHANGES LIVE DICE MATH on ~25 sites.** Only 4 of 29 roll sites folded computed dice;
the documented [Tier][Die] convention (`(@tier)d(2 * rank + 2)`) silently failed on the rest —
including a heal branch whose own damage twin, eight lines below it, folded correctly. Talents
whose formulas use no computed dice are unaffected. *(Hygiene campaign 2026-08-10.)*

**R-66. One-shot card buttons now persist their used state via `edhaMarkCardResolved`.** Fifteen
cards disabled their buttons in the DOM only — an F5 or a second client revived them (the exact
Flame Surge bug the helper was built for). Cleanse, reknit, counter-transfer, mutation, plot-grant,
designate and friends now stay spent on every client. *(Hygiene campaign 2026-08-10.)*

**R-67. Chaos and Fate burst cards gained the `whisper` option the other four tree-card helpers
already had.** Additive — nothing whispers that didn't before; it just becomes possible.
*(Hygiene campaign 2026-08-10.)*

**R-68. The map toolchain's "is this pixel painted" alpha threshold is now ONE constant, 128.**
`trace_regions` used 120 and `trace_nations` used 128 for the same question against the same
layers. Applied 128 — the explicitly named constant. If a re-trace ever shifts a boundary by a
pixel, this is why; 120 is one veto away. *(Hygiene campaign 2026-08-10.)*

---

## J. Flagged, but not questions

Recorded so they are not re-derived. No decision needed unless something here surprises you.

**F-1. Rank-3 Black Attunement Range measures 60 ft**, not the 30 ft several stagings assumed. Any
row whose expectation was built on 30 ft should be re-read.

**F-2. Marathon 1 run 6's 2bX-5 PASS was recorded over a broken roll.** Its contest half is worth
re-reading now that attribute contests demonstrably work (R-43).

---

## K. Settled

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
