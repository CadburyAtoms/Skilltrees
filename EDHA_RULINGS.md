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

*(R-113 — may a bench run call `edha.syncAllAdversaries()`, and should the bulk button gain a scope guard — ANSWERED 2026-09-13, moved to §K.)*

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

*(R-101 — a follow-up pass may read adversary numbers as a yardstick only — ANSWERED 2026-09-13, moved to §K.)*

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

*(R-95 — Momentum's Edge cannot resolve its rider; retune to [Tier][Die] — ANSWERED 2026-09-13, moved to §K.)*

---

*(R-100 — advantage redundancy is three collisions; retune Final Decree, note the pairings — ANSWERED 2026-09-13, moved to §K.)*

*(R-107 — Temp HP writers unify on keep-the-higher — ANSWERED 2026-09-13, moved to §K.)*

*(R-126 — Draw Mana yields your highest attuned colour rank, not your tier — ANSWERED 2026-09-13, moved to §K.)*

## D. Talent identity & tree shape

*(R-96 — Blue and White get no damage; the minimal-change set lands — ANSWERED 2026-09-13, moved to §K.)*

*(R-97 — Sovereignty's Decree zone gets built — ANSWERED 2026-09-13, moved to §K.)*

*(R-98 — Pattern Recognition / False Premise collide; re-aim False Premise — ANSWERED 2026-09-13, moved to §K.)*

*(R-99 — the three weakest deity gate colours get a real job — ANSWERED 2026-09-13, moved to §K.)*

*(R-102 — Composed / Focused Mind / Clear Mind unify to one name and wording — ANSWERED 2026-09-13, moved to §K.)*

*(R-103 — Scholar's downtime — answered by the Artifabrian → Ley-surveyor swap — ANSWERED 2026-09-13, moved to §K.)*

*(R-104 — twenty trees drift from their prose; fix the prose — ANSWERED 2026-09-13, moved to §K.)*

*(R-105 — heroic flat vs leyline doubling — accept and document — ANSWERED 2026-09-13, moved to §K.)*

*(R-106 — no area damage in ten trees — no change; the consequence was withdrawn — ANSWERED 2026-09-13, moved to §K.)*

*(R-108 — deity Specials — restate the target, convert nothing yet — ANSWERED 2026-09-13, moved to §K.)*

*(R-109 — tier caps stay; Trade Routes repaired — ANSWERED 2026-09-13, moved to §K.)*

*(R-111 — Withering Ray stays; documented as the leyline ceiling — ANSWERED 2026-09-13, moved to §K.)*

---

*(R-23 — Volatile Strike rides any melee hit as a true rider — ANSWERED 2026-09-06, moved to §K.)*

*(R-24 — Red/Momentum branch root — ANSWERED 2026-09-06, moved to §K.)*

*(R-25 — Rallying Shout's reminder prints only for an ally at 0 HP or below — ANSWERED 2026-09-06, moved to §K.)*

*(R-57 — Pattern Recognition's round-expiry, kept — ANSWERED 2026-09-06, moved to §K.)*

---

*(R-120 — Knowledge's Insight multiplier — one die plus Tier per Insight on the repeatable strike; the cash-outs keep the multiplier — ANSWERED 2026-09-13, moved to §K.)*

*(R-121 — Power and Destruction gain one Investiture-income clause each — ANSWERED 2026-09-13, moved to §K.)*

*(R-122 — Chaos's Omen cap becomes tier + 1; Isolating Pressure places an Omen — ANSWERED 2026-09-13, moved to §K.)*

*(R-123 — Ghostly Walls → Blue 2+, Adaptive Mutation → Green 2+ — ANSWERED 2026-09-13, moved to §K.)*

*(R-124 — the Construct's whole-attack Deflect bypass stays; documented as Civilization's ceiling — ANSWERED 2026-09-13, moved to §K.)*

*(R-125 — Frightened → Disoriented on Kneel and Absolute Authority — ANSWERED 2026-09-13, moved to §K.)*

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

*(R-110 — two advantages — keep the cards, add the cancel line — ANSWERED 2026-09-13, moved to §K.)*

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

*(R-112 — The Reckoning's focus pool raised 2 → 3 — ANSWERED 2026-09-13, moved to §K.)*

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

*(R-92 — the generic "dropped" GM cue — was filed here on 2026-09-09 while still OPEN; moved to §L on 2026-09-13 so the phone can show it.)*

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

### K.8 — R-95 … R-111 (the talent ecosystem review, answered 2026-09-13)

All seventeen answered in one sitting from the rulings ballot (artifact `091f9b4e…`) after the independent critique (`docs/analysis/talent-ecosystem/CRITIQUE.md`) changed three defaults; R-103 was settled by the specialty swap (PR #329) and R-106's premise was withdrawn by Ben. The work each answer implies is TODO_REPO_HYGIENE items 104–115.

### K.8a — R-95 … R-100

**R-95. `Momentum's Edge` reads a derived-field OBJECT, so it probably does nothing — and if it worked it would be ten times every other damage rider in the game.** leyline/Red's `Momentum's Edge` (depth 2, **level 3**, Passive, no cost, no resource) carries `bonusFormula: "@movement.walk.rate"`. That field is a **DerivedValueField object** (`{value, override, derived}`), not a number — the engine says so itself at `19-red-momentum-frenzy.js:224`, documenting the *same mistake shipping once before* on 2026-07-27, when a raw `Number()` on that field made every `edha-move {byHalfSpeed}` move 0 ft. That path was repaired with `edhaDerivedNum`; the damage-rider path was not, and goes through `Roll.replaceFormulaData`, which does `String(value)`. So the rider very likely contributes nothing, and may error the damage roll — **a 🤖 bench row settles which.** Separately, the design intent was clearly the movement rate (the engine's own field hint reads "Bonus = your Speed via `@movement.walk.rate`"), and walk rate is `20 + 5·SPD` = **30 at SPD 2**, 40 with Surefooted. Every other damage rider in the game is worth 1–4: `Mighty` `(1 + @tier)`, `Hexmark` `@tier`, `The Unmooring` `@attr.int`, `Kindle` `@skills.red.mod`, `Burning Drive` half a rank die, `Predatory Patience`/`Prognosis` `1d6`. **The wording is NOT ambiguous — that was this review's own error, and its verification pass caught it.** Every one of the eleven usages of "Speed" across all 365 talents means either a movement rate in feet or a tested skill: White's `Ordered Advance` "move half their Speed", Blue's `Absolute Stillness` "reduced to 0 Speed", Civilization's `Forge Construct` "Speed 25 ft", Destruction's `Walking Ruin` "Your Speed increases by 10 ft", and — decisively — **Red's own `Unstoppable`, "move up to half your Speed"**. The attributes used as flat damage adders in this corpus are Awareness, Intellect, Strength, Willpower and Presence; **Speed is never one of them.** So the card and the engine mean the same thing, and there is nothing to clarify. What is left is two separate problems that want two separate answers:

- **IMPLEMENTATION** — the reference does not resolve, so the talent probably does nothing today. Determinable, and a 🤖 bench row settles whether it errors or silently adds zero.
- **DESIGN** — if it resolved, a free depth-2 Passive would add +25 to +30 flat impact on every charge, roughly ten times every other rider in the game. Rewording cannot fix that; only the number can.

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). Two corrections from an independent re-derivation; the default is unchanged. (1) The walk rate is a table, not `20 + 5·SPD`: cosmere-rpg's `MOVEMENT_RATES = [20, 25, 30, 40, 60, 80]` indexed by `ceil(SPD / 2)` (`index.js:8539–8542`), so SPD 2 is **25** and SPD 3–4 is 30 — same order of magnitude, same design problem. (2) The implementation half is stronger than "probably nothing": Foundry 13's `Roll.replaceFormulaData` turns an Object value into a rune-wrapped JSON string, the rider path (`03-where-an-effect-lives.js:198–211`) hands that on as the resolved term, and the Strike's damage formula then cannot parse — so the **whole Strike's damage roll fails** whenever the 20 ft trigger is met (ECO-2 case 1), not just the rider. The bench row stays, to see how the system surfaces it.

*Recommended default: **(a) fix the resolution AND retune the payload to `[Tier][Die]`*** — resolve the derived field through `edhaDerivedNum` so the talent works at all, and change the rider from the raw movement rate to `[Tier][Die]` extra impact. That keeps the charge fantasy ("Speed is the weapon. Distance is the wind-up" — the 20-ft trigger already encodes the distance), puts the payload in family with `Kindle` and `Predatory Patience`, and lets it scale with tier and rank like everything else instead of sitting flat.* (b) fix the resolution and retune to **half** your Speed (≈12–15) — still the biggest rider in the game but no longer an order of magnitude out, and it keeps the literal wording. (c) fix the resolution and leave the number: Red gets a standout free Passive, deliberately. Note Red currently has the **lowest capability budget of the five leyline trees (25)**, so (c) is not as unreasonable as the raw number looks — but it makes one talent Red's whole identity. *(Talent ecosystem review, 2026-09-09; `formula-audit.js` is the re-runnable check and finds no other unresolvable reference in all 365 talents.)*

Ask: `Momentum's Edge` is broken today and, if fixed as written, adds ~+30 flat damage — repair it and retune the payload to `[Tier][Die]` (a), retune to half your Speed (b), or repair it and keep the full number (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) fix the resolution AND retune the payload to `[Tier][Die]`.** → **item 104**.

**R-96. Should Blue and/or White get damage? — the question that started the review, and the review's single consolidated position on it.** The measured answer is **no for both, and the reason is not "no damage is fine" but "the hole is somewhere else"**. On the 15-axis capability budget (21 trees, each profiled and adversarially re-checked twice), within leyline **Blue scores 28 and White 27 against Red's 25** — the two no-damage trees are *broader* than the tree that does all the damage, so the no-damage identity is genuinely paid for. **And the thing they actually lack has a number, which arrived last and is the most defensible figure in the review. Counting only talents a player can spend an Action on (1/2/3 Actions — the things you CHOOSE to do on your own turn): leyline/White fields TWO in twenty-five.** `Guiding Signal` (1 Action, L1) and `Ordered Advance` (2 Actions, L4). That is the whole list; the other 23 are Passives, Specials, Free Actions and Reactions. Blue fields five, three of which are scene setup (`Phantom Double`, `Telepathic Network`, `Phantom Barricade`), leaving two repeatable plays that arrive at L4 and L6. For contrast: heroic/Warrior fields 13 of 25, and **every deity tree fields 5–8 out of NINE**. By atlas: leyline 18%, heroic 25%, deity 72%.

So what the two players are experiencing is not "I deal zero damage" — a Blue mage who `Counterspell`s an enemy's talent has plainly done something, and a White mage whose `Shield Wall` shaves damage off every attack on two adjacent allies contributes every round. It is *three Actions on a Slow turn and a twenty-five-talent tree that offers two things to spend them on.* "Damage" was standing in for four properties at once — an effect that is **self-initiated, always legal, always resolves, and produces a visible number**. Damage is the cheapest single purchase of all four; it is not the only one, and it brings a fifth thing nobody asked for, which is White and Blue becoming damage trees.

Worth noting the contrast that proves the diagnosis is about agency and not output: **deity/Sovereignty is 78% action-costing (7 of 9) and is still the worst tree in the game** (R-97) — because what its Actions buy is ±1 average damage. Agency and payload are separate failures, and a damage count cannot tell them apart.

**The consolidated position — one option set, adopted.** Four independently framed remediation passes (run `wf_0b59b6ca-5bc`, preserved as `docs/analysis/talent-ecosystem/crosscut/options-*.json`) all say **no damage as the fix**, and agree on almost nothing else:
- **Minimal change** — *Blue:* re-parent `Read Intent` (1 Action, 1 Investiture, test Blue vs. Cognitive) from depth 3 to depth 1 under `Forewarned`, and add it as an OR parent of `Pattern Recognition`, so a level-2 Blue mage has a repeatable loop: `Read Intent` on their turn, `Pattern Recognition` off its success. *White:* retype `Interposing Shield` from Reaction to Special, cut `Shared Burden` from 2 Investiture to 1, retype `Ordered Advance` from 2 Actions to 1. No new talent, no effect text changed, no engine.
- **Identity-first** — White collapses its three same-trigger Reactions and gains a formation zone and an Opportunity sink; Blue's disadvantage block becomes a stacking numeric penalty.
- **Systemic** — a CI-gated action-type budget (a Reaction cap and an Action floor) that drives a retyping pass on White, Blue and Black; the summing roll-modifier channel wired with a cap; bonus Investiture regeneration for White, Blue and Green.
- **Player-experience** — new talents: a depth-0 White Bind (a mortal-scale Edict), a Tier-1 Blue lockdown, one regeneration Passive each; Blue's disadvantage block on the summing channel; and, ranked last on purpose, a costed White damage option — `Retributive Guard`'s spirit line as a Special riding White's own Strike.

**This ruling adopts the minimal-change set**, for four reasons:
1. **It is the smallest thing that acts on the measured defect** — a graph edit and three retypes or reprices, so it can land inside the level-2–5 window the campaign is in and be undone as cheaply.
2. **It is the only set that keeps Blue off the summing channel.** The other three all route Blue's disadvantage through it, and the objection to that channel survived review: it is proven on no player talent, and uncapped additive penalties are the ecosystem's largest identified balance risk (problem ledger #14 — the same objection that narrowed R-98).
3. **Blue's half is the sharpest single lever in the review.** `Read Intent` is Blue's only self-initiated, repeatable test against an enemy defence, and it sits four levels behind the three talents (`Pattern Recognition`, `Subtle Suggestion`, `Baleful`) that need exactly that event.
4. **It forecloses nothing.** Every larger set stays available, and the player-experience set names the measurement that would justify reaching for it.

**What it does not do, stated plainly.** White's count of Action-costing talents stays at 2 of 25: `Ordered Advance` becomes affordable in the same turn as Draw Mana, which is the actual complaint, but no new Action play is added. The defence advocate's case that this is fine — White's Draw Mana turn heals the party, so it has no dead refuel round — did not survive review (problem ledger #1). So the escalation is part of the position: if a bench pass after the minimal set still has the White player reporting turns that do not register, add the player-experience set's depth-0 White Bind; only if that also fails, its costed damage option. The summing channel stays out until a bench check shows it applies to player talents, and then only with a cap.

> ⚠️ **Consolidated 2026-09-12.** The first version of this ruling recommended *"one or two depth-0/1 talents"* for White and pulling one of Blue's teeth below the rank-3 gate, and said the four option sets *"reached this separately"*. They reached **no damage** separately and disagree on the mechanism. This version adopts one set, says why, and keeps the others as the escalation path; the README's "What a White + Blue party lacks" section is the party-level census it rests on.

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). **The conclusion stands; three parts of the evidence do not.** (1) "Two in twenty-five" counts standalone Actions only. The leyline guide defines a Special as a play that rides an action you were already taking (`leyline-revision-guide/SKILL.md:28`), so a Special riding your own Draw Mana or influence test is chosen on your turn. Counting every self-initiated play, White fields **7 of 25** — `Guiding Signal`, `Ordered Advance`, `Beacon of Stability`, `Overwhelming Authority`, `Terms of Accord`, and the Opportunity-gated `Collective Resolve` and `Mending Aura` — still last, but one behind Black's 8 rather than eleven behind Warrior's 13. The honest shape is two standalone plays, three riders, two plot-die-gated; and White's Draw Mana, which heals every visible ally for Tier, is excluded by both counts. (2) Reason 2 is false: the summing `edha-next-test-mod` formula channel is carried by **seven player talents** today (`Pack Hunting`; `Confident`, `Decisive`, `Demonstrative` and `Shrewd Command`; `Tactical Ploy` at −1d4; `Overwhelm with Details`), not "no player talent". Reasons 1, 3 and 4 carry the adoption on their own. (3) The `Read Intent` loop lands at **level 3** (Forewarned L1 → Read Intent L2 → Pattern Recognition L3), not level 2. The re-parent was mutated into `data/leyline.json` and passes `validate.js` and all 1085 tests; Blue rolls Intellect, so a `Read Intent` success satisfies `Pattern Recognition`'s Cognitive trigger. Retyping `Interposing Shield` is engine-safe — `edha-damage-react` rules fire without the engine reading the activation type — but the engine also posts *every* matching White reaction card on one hit today, so the one-Reaction rule is played by hand. The matrix sentence ("Blue 28 and White 27 against Red 25") is at the rubric's noise floor: a blind rescore gives 28 / 26 / 27.

*Recommended default: **(a) no damage for either; land the minimal-change set, and escalate only on bench evidence** — Blue: `Read Intent` to depth 1 as an OR parent of `Pattern Recognition`; White: `Interposing Shield` to a Special, `Shared Burden` to 1 Investiture, `Ordered Advance` to 1 Action. Data edits + pack rebuild. It changes `connections`, so `validate.js` and `tests/pipeline.test.js` must re-pass and `Read Intent`'s prose must name its new parent (iron rule 7). Bench before shipping: that `Pattern Recognition` fires off a `Read Intent` success, that `Interposing Shield`'s Special rides a trigger the engine fires (if not, leave it a Reaction), and that exactly one White mitigation fires per hit.* (b) new talents for both trees now — the identity-first or player-experience set. (c) give White damage only, in the player-experience set's costed shape. (d) give both damage — cheapest to write, but it spends the clearest identity contrast in the leyline set, and the numbers say it is not what is missing. *(Talent ecosystem review, 2026-09-09; consolidated 2026-09-12; `agency-census.js` is the re-runnable check.)*

Ask: All four option sets say no damage for Blue or White — land the minimal-change set (Read Intent to depth 1; Interposing Shield, Shared Burden and Ordered Advance retyped or repriced) and escalate only on bench evidence (a), add new talents for both now (b), give White damage only (c), or damage for both (d)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) no damage for either; land the minimal-change set (Read Intent to depth 1 as an OR parent of Pattern Recognition; Interposing Shield a Special; Shared Burden 1 Investiture; Ordered Advance 1 Action) and escalate only on bench evidence.** → **item 105**.

**R-97. Sovereignty's signature resource was designed and never built, and the tree is the weakest in the system by a wide margin.** deity/Sovereignty scores **13** on the capability budget against 17–28 for the other nine deity trees — four below the next-lowest, less than half the top. It is the only tree in all 365 talents that deals no damage AND has no independent effect: all nine talents move a damage die one or two steps along `d4→d6→d8→d10→d12`, which is **±1 average damage per die**, so it is purely parasitic on someone else's attack. Its one strength on the matrix (debuff 4) is shared with Black and Blue, both of which also do everything else — it is the one tree where no "something it owns" can be named. On top of that, **both** intent sources promise a signature resource that does not exist: the path description says *"**Decree** — a declared law projected within a radius: allies inside are elevated, enemies inside are diminished"* and the deity guide says *"Decree zones (declared laws within a radius)"* with the loop *"diminish target → elevate ally → bring them into Decree"*. No Sovereignty talent creates a zone, radius or aura; all nine are single-target, and "Decree" survives only in the title `Decree of Ruin` and one flavour line. It also demands **White 3+** — a level-6, six-skill-rank investment — while testing Black three times and White zero times. > ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). Rescored blind from the talent text: **13 again**, last by four, per talent as well as in total. Two wordings corrected: "no independent effect" is too strong — `Sovereign's Favor` grants `[Tier][Die]` temp HP on every `Exalt` with no roll (3.5 at Tier 1, 9 at Tier 2), which the problem ledger's own dropped item 9 had noted; and the d4→d12 clamp caps a two-step shift at ±2 per die, the whole ladder at 4. Default (a) stands **with a constraint**: `Lay Foundation` and `Ordained Ground` are already the same designate-a-square Free Action, so a Decree built as a third square repeats the corpus's worst duplication — build it as a radius that moves with the arbiter, or a zone that steps dice rather than granting flat defence.

*Recommended default: **(a) build the Decree zone** — it is the mechanic the tree was designed around, it converts Sovereignty from single-target rider to area controller in one stroke, it gives White something to test, and the engine already has the zone primitives (Fate's Ordained Ground, Civilization's Foundation). Biggest change, but it is the change the docs already specify.* (b) leave the mechanics and rewrite both intent sources so the tree is honestly "a single-target arbiter" — cheapest, but it ships the weakest tree in the game as-is. (c) raise the numbers without adding the zone — more steps, longer durations — which fixes the power and not the identity. *(Talent ecosystem review, 2026-09-09; Ben flagged Sovereignty himself as possibly worse than Blue. It is.)*

Ask: Sovereignty's promised "Decree" radius exists in no talent and the tree is the weakest in the game — build the Decree zone (a), rewrite the prose to match the single-target tree we actually have (b), or just raise its numbers (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) build the Decree zone — as a radius that moves with the arbiter, not a third designate-a-square (the critique's constraint).** → **item 106**.

**R-98. Two of Blue's disadvantage talents compete for the same roll: `Pattern Recognition` and `False Premise`.** Blue imposes disadvantage with five talents — the largest single-tree block in the game — and disadvantage is one binary scalar (R-100), so a second disadvantage **on the same roll** is worth nothing. But the binary rule bites only when two sources land on one roll, and Blue's five mostly do not:
- `Pattern Recognition` (Special, L2) — after you succeed on a Cognitive test against a character, *"their next test this round has disadvantage"*.
- `False Premise` (Reaction, L3) — when a character succeeds on a Cognitive test, *"impose disadvantage on their next test"*.
- `Intercept` (Reaction, L2) — disadvantage on *"that action"*, the one you declared with Forewarned.
- `Probability Cascade` (Special, L4) — disadvantage on a creature's *"next two tests"*.
- `Absolute Stillness` (Passive, L6) — a standing disadvantage on Physical tests for a creature you have reduced to 0 Speed.

**Only `Pattern Recognition` and `False Premise` both write "their next test"**, so on one target in one round the second is worthless — and a player who owns both has paid two Investiture for one disadvantage. `Probability Cascade` overlaps either on its first test but still pays on its second; `Intercept` keys off a declared action; `Absolute Stillness` is a state, not a next-test grant. None of those three collapses into the pair.

> ⚠️ **Correction, 2026-09-12.** The first draft of this ruling was titled "Blue's five disadvantage talents largely do one talent's work" and recommended converting the deeper ones to the summing `formula` channel. The review's problem ledger (run `wf_0b59b6ca-5bc`, `droppedAsArtefact[7]`) showed that over-applies the primer: the binary rule is about a second source on the SAME roll, and Blue's five fire on different targets at different times. The same ledger carries a **surviving** objection to the summing conversion (`problemLedger` #14): the channel is used today by one adversary ability and no talent, so it is unproven on player talents, and uncapped additive penalties are the ecosystem's largest identified balance risk. The ruling is narrowed to the one real collision and its default changed from (b)-shaped conversion to (a).

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). The collision is real and both rules are verified (`edha-next-test-mod {target: victim, mode: disadvantage}` on each, folded to one by `edhaNextModFoldMode`). The reason given for keeping the pair off the summing channel is not: that channel is carried by **seven player talents** today, including a summing penalty (`Tactical Ploy`, −1d4), so it is proven on player cards. What survives of the objection is the design preference against uncapped additive penalties. (a) is still the smaller change; (b) is more available than the text says.

*Recommended default: **(a) re-aim `False Premise`'s payload** so it no longer writes the same next-test disadvantage `Pattern Recognition` already writes — the systemic option set independently proposes retyping `False Premise` for the same reason, and because it is one of Blue's five Reactions competing for a single Reaction slot, re-aiming it eases that too. Card text + authored rule; pack rebuild; no engine change.* (b) move the pair to the summing `formula` channel — only after a bench check that the channel applies to player talents, and only with a cap on the total. (c) leave both: the collision needs a player who owns both talents and fires both at one target in one round, and a player learns to split them. *(Talent ecosystem review, 2026-09-09; narrowed 2026-09-12.)*

Ask: Only `Pattern Recognition` and `False Premise` actually collide — both give the same target disadvantage on its next test — so do we re-aim False Premise's payload (a), move the pair to the summing channel behind a bench check and a cap (b), or leave it (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) re-aim `False Premise`'s payload.** → **item 107**.

**R-99. Nine of ten deity trees never roll one of their gate colours — but only one gate buys nothing at all: Fate's White.** Every deity tree gates on two leyline colours at rank 2+ (rank 3+ on its deepest talents), which the deity guide presents as the system's designed cross-path synergy. A gate colour can pay back that rank three ways, all visible in `data/authored/deity-*.json`: it is **rolled** (`skill`), it **sizes a roll** (`@skills.<colour>.rank` in a damage, heal or temp-HP formula), or it sets **reach** (`rangeColor`, `color`, `allyRange` and similar — that colour's Attunement Range). Counted on all three channels (`deity-gate-audit.js`):
- **Toll booth — no talent reads the colour:** Fate's White (2+).
- **Near-dead — exactly one talent reads it:** Destruction's Blue (2+, `Pinpoint Charge`); Life's Blue (3+, `Surgical Precision`).
- **Thin — never rolled, read by two or three talents:** Civilization's Red, Death's Green, Order's White, Power's Red, Sovereignty's White.
- **Only Chaos rolls both of its colours.** 11 of the 20 gate colours are never rolled.

The guide's own worked example still fails: of Sovereignty it says *"Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule"* — and Sovereignty rolls Black on three talents and White on none. That half belongs to **R-97**, whose Decree zone would give White its elevate test.

> ⚠️ **Correction, 2026-09-12.** The first draft of this ruling was titled "Nine of ten deity trees charge for a colour they never test; five get nothing at all from it, and four of those five are White", and said White is "mechanically rewarded by none" of the four trees it gates. The script behind it read only the rolled skill and each talent's own `damage.formula`. The review's problem ledger (`droppedAsArtefact[3]`) re-counted with the reach channel included and found one pure toll booth; `deity-gate-audit.js` now counts all three channels and agrees. Civilization's White sizes its Construct and Foundation dice across four talents, Knowledge's Green sets the reach of seven talents, and Order's White sizes four formulas. The "nine of ten never roll one colour" half stands; the "five get nothing, four of them White" half is withdrawn, and the default is narrowed from all ten trees to three gates.

*Recommended default: **(a) give the three weakest gates a real job** — one talent in Fate that rolls White, sizes off White rank, or uses White's reach (`Ordained Ground` is the natural White half of the tree), and a second Blue-reading talent in each of Destruction and Life. Leave the five thin gates alone: each already pays back through dice or reach. Card text + authored rule; pack rebuild.* (b) lower Fate's White gate to rank 1+ instead of adding a use, so the toll is small rather than removed. (c) accept the gates as priced and retire the colour-split rule from the deity guide. *(Talent ecosystem review, 2026-09-09; corrected 2026-09-12; `deity-gate-audit.js`.)*

Ask: Only Fate's White gate buys nothing at all, and Destruction's and Life's Blue each reach a single talent — give those three gates a real job (a), lower Fate's White gate to rank 1+ (b), or accept the gates and retire the guide's colour-split rule (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) give Fate's White, Destruction's Blue and Life's Blue gates a real job; leave the five thin gates alone.** → **item 108**.

**R-100. Advantage does not stack — but the redundancy is three specific collisions, not an ecosystem problem.** cosmere-rpg 2.1.0 implements advantage as a tri-state: `configureModifiers()` sets `d20.number = 2` with `kh`, full stop, and the Edha engine's own `edhaNextModFoldMode` boolean-ORs every matching source into the one scalar the system can hold. **Disadvantage is the same scalar.** So a second advantage **on the same roll** is worth exactly zero. Counted by hand — `advantage-classify.js` classifies all 48 talents that name advantage and fails if one is left out — **36 talents across 13 trees grant an advantage, 7 consume or deny one, and 5 more grant the Gain Advantage *action* rather than an advantage.** Of the 36, **9 are attack-specific and 19 can land on an attack roll at all**; the other 17 sit on social, Perception, stealth, Insight or Intimidation tests that never meet an attack. And because a PC holds one leyline plus one heroic path, or one deity tree, the collisions a player can actually build are few:
- **Green + Hunter** — `Pack Hunter` and `Scent the Weak` with `Seek Quarry` and `Exploit Weakness`, all on one attacker's roll against one target.
- **Inside Order** — `Final Decree`'s Witness advantage is redundant against its own tree's `Lawkeeper's Eye`, which already gives you and your allies advantage on attacks against a bound target.
- **Order + Power, across two characters** — an Order ally's `Lawkeeper's Eye` voids the Power character's `Kneel` rider on the same attack. The engine's own header already says so: *"Lawkeeper + Kneel advantage don't compound (advantage is binary)"* (`49-order.js:154`).

Where a free grant exists, a player simply does not buy the paid one — so the cost of this redundancy is **a talent slot, not a resource**.

> ⚠️ **Correction, 2026-09-12.** The first draft of this ruling said *"45 advantage-granting talents across 13 trees … in a real party, the second granter contributes nothing"*, counted 14 disadvantage producers with no consumers, and called advantage the mechanical reason Blue and Scholar feel same-y. The review's problem ledger (`droppedAsArtefact[4]`) put the producer count at 36, only about 15 of them reaching an attack roll, and located the redundancy in specific pairings. The hand count confirms 36 and puts the attack-capable figure at 9–19, depending on how generic a "next test" you accept. The 45 had swept in five action-enablers, four consumers or deniers and one Shardplate-gated clause outside the scope fence, and missed `Anticipate` and `Bonds of Community`. The disadvantage count came from the same flawed regex and is withdrawn. Blue and Scholar do not collide here: Scholar has one advantage producer, and it never reaches an attack. A pairing "inside Power" is withdrawn too — `Kneel` grants *you* advantage and `Investiture of Command` grants *your allies* advantage, so they never meet on one roll.

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). Implementation confirmed at source (`cosmere-rpg/index.js:4015–4032`, `:3786`, `:1932–1940`). One caveat the ruling should carry: the printed rule (SR p.18, `cosmere-canon-reference`) cancels advantages and disadvantages **one-for-one**, so two advantages against one disadvantage is one advantage at the table — a case the engine's fold (`adv && dis → null`, `15-blue-calculation.js:241`) cannot represent. None of the three collisions named here involves a disadvantage, so the finding stands; R-110 turns on this.

*Recommended default: **(a) retune `Final Decree`'s redundant Witness clause, and write the two cross-path collisions into the design guides as an authoring note** — the one collision a single character builds inside one tree is the one worth a data change; the cross-path pairings are build choices a player can decline. Card text + authored rule for `Final Decree`, pack rebuild; the guide note is docs-only.* (b) the authoring note only, no talent change. (c) the first draft's blanket policy — stop adding advantage granters anywhere — which the corrected count does not justify. (d) change the implementation so advantages stack; **this alters live dice maths on every roll in the game** and is not recommended. *(Talent ecosystem review, 2026-09-09; corrected 2026-09-12; `advantage-classify.js`.)*

Ask: Advantage redundancy turns out to be three specific collisions rather than an ecosystem problem — retune Final Decree's redundant Witness clause and note the two cross-path pairings in the guides (a), note them only (b), or keep the first draft's stop-adding-advantage policy (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) retune `Final Decree`'s redundant Witness clause and write the two cross-path collisions into the design guides.** → **item 109**.

### K.8b — R-101 … R-106

**R-101. May a follow-up ecosystem pass read adversary numbers, to size the defensive talents against something?** You ruled the talent ecosystem review to **the 365 talents only** — adversaries, PC build ladders and system-native talents explicitly out — and that was the right call for the questions you asked. It bit in exactly one place. The review can say White's `Shield Wall` reduces damage by `half [Tier][Die]` = **1.75 at Tier 1**, and that `Guardian Stance` at depth 0 gives +1 Deflect, so White's mitigation is nearly flat across levels 1–5. What it cannot say is whether 1.75 is a lot, because that only means something against a number for how hard things actually hit — and those numbers live in `data/adversaries.json`. The same limit applies to every damage figure in the review: `1d6` at Tier 1 is a number without a target. *Recommended default: **(a) yes, narrowly** — a follow-up may read adversary damage and HP **as a yardstick only**, to size talent numbers, with no findings about adversary design and no changes to adversary data. That is the smallest extension that makes the defensive half of the review actionable.* (b) no, keep the fence; size the numbers at the table instead, from play. (c) yes, and let the same pass also review adversary talent lists, which is a much larger job. *(Talent ecosystem review, 2026-09-09.)*

Ask: The review can say `Shield Wall` prevents 1.75 damage but not whether that is a lot, because adversary numbers were out of scope — may a follow-up read adversary damage and HP purely as a yardstick (a), or keep the fence (b)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) yes, narrowly — adversary damage and HP as a scale, no findings about adversary design, no adversary changes.**.

**R-102. 41 of 365 talent slots are the same talent in another tree — intended, and is the triple-naming a bug?** `Hardy` appears in seven trees, `Mighty` in six, `Collected` in five, `Surefooted` and `Baleful` in three each, and five more in two each — 11% of the system. Shared generic talents are normal in the Cosmere RPG, and heroic trees carry the most (Agent, Envoy and Leader are each 24% shared filler). The measurement matters because it inflates every similarity score: Blue and Scholar's headline overlap is partly that they both contain `Collected`. One case looks like an outright mistake: **`Composed` (Blue, Black), `Focused Mind` (Leader) and `Clear Mind` (Scholar) are the same talent — "increase your maximum focus by your tier" — under three different names in five trees**, and Envoy's `Composed` additionally says "max **and current**" where the others say max only. *Recommended default: **(a) intended, keep the sharing, but unify the triple-name to one name and one wording** — three names for one effect is a card-text bug, not a design choice, and the max/current split should be settled one way. Card text + authored JSON; pack rebuild.* (b) also thin the heroic filler, since 24% of three trees being shared is a lot. (c) leave all of it. *(Talent ecosystem review, 2026-09-09; `shared-talents.js`.)*

Ask: `Composed`/`Focused Mind`/`Clear Mind` are one talent under three names across five trees, and one of them adds "and current focus" — unify the name and wording (a), or leave it (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) keep the sharing; unify the triple name to one name and one wording, and settle the max/current split one way.** → **item 110**.

**R-103. heroic/Scholar is 40% downtime — the only substantially non-combat tree in the system.** Ten of Scholar's 25 talents do nothing once initiative is rolled (`Erudition`, `Efficient Engineer`, `Prized Acquisition`, `Deep Study`, `Fine Handiwork`, `Experimental Tinkering`, `Mind and Body`, `Deep Contemplation`, `Emotional Intelligence`, `Ongoing Care`), against 5 for Agent, 3 for Envoy and Leader, 2 for Warrior, and **zero for every leyline and deity tree**. Its capability budget is 24 against 30–32 for the rest of heroic. Empirically it is "a crafting-and-clinic path", not the strategist its name implies. This is a different problem from Blue's, and the two are **not** the same tree: read side by side they share exactly one talent (`Collected`) plus the near-identical `Composed`/`Clear Mind` pair, and both are generic filler three to five other trees also carry. *Recommended default: **(a) accept the identity — Scholar is the party's crafter and medic — but move two or three of the ten into the fight**, so a Scholar player has something to do every round without changing what the tree is. The most promising are the fabrial line, which already has a combat hook in `Overcharge`.* (b) leave it: a player who picks Scholar is choosing the out-of-combat path knowingly, and the one-pager should say so. (c) treat the 40% as the defect and rebuild the Artifabrian specialty as combat-facing. *(Talent ecosystem review, 2026-09-09; `combat-share.js`.)*

Ask: Scholar has ten talents that do nothing in a fight, far more than any other tree — move two or three of them into combat (a), accept it as the tree's identity and say so to players (b), or rebuild the crafting specialty (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a), delivered by replacing the Artifabrian specialty with Ley-surveyor rather than editing cards — **DONE, PR #329** (ten idle Scholar talents became five).**

**R-104. Twenty of the twenty-one trees say something different from what they do — fix the prose or the talents?** Every tree was held against both its in-world path description and the design guide's claims for it. **Only deity/Death delivers what it says.** The other twenty are PARTIAL or DRIFTED, and the drift is usually coherent-but-different rather than under-delivery: Red's prose sells a ranged pyromancer and the tree is a melee charger; Fate's sells an oracle and the tree is battlefield engineering; Scholar's sells a strategist and the tree is a workshop and clinic; Blue's design guide gives it plot-die manipulation as "its capstone identity" and Blue has **zero** plot-die talents while heroic/Agent has six, including the exact effect the guide reserves for Blue. Red is the sharpest single case: the promise repeated in *both* intent sources — "every wound taken is fuel", "damage taken feeds future power" — is delivered by **zero** talents. *Recommended default: **(a) fix the prose, not the talents** — the talents mostly work and are already wired; the descriptions were written alongside them and never reconciled. One pass over `data/path-descriptions.json` and the two revision guides, tree by tree, saying what each tree actually is. Cheap, DOCS-ONLY, and it is what players actually read at session zero.* (b) fix the talents where the promise is better than the reality — specifically Red's "wounds are fuel" and Blue's plot die, both of which are good designs that were never built. (c) both, prose first. *(Talent ecosystem review, 2026-09-09.)*

Ask: Twenty of twenty-one trees do something different from what their description says — rewrite the descriptions to match the talents (a), build the missing promises (b), or prose first then the best of the missing promises (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) fix the prose, not the talents — one pass over `data/path-descriptions.json` (including the verbatim Roshar heroic text) and the two revision guides.** → **item 111**.

**R-105. Heroic damage is flat from level 1 to level 10; leyline damage doubles at level 6. Designed, or an accident?** Heroic damage talents carry fixed formulas: `Devastating Blow` is `(2 + max(@tier − 2, 0))d8`, which is **2d8 at level 2 and still 2d8 at level 10**; `Wit's End` is 4d6 at both tiers; `Fatal Thrust` is a flat `4d4` forever; `Deadly Trap` a flat `2d4`. Leyline and deity damage is `(@tier)d(2 × rank + 2)`, which goes `1d6` (3.5) at Tier 1 rank 2 to `2d8` (9) at Tier 2 rank 3 — **because level 6 raises the tier AND the rank cap in the same step**. **But WHEN each side gets its damage is the other half, and it points the opposite way to the sentence above.** All three of heroic's big damage talents are gated behind an **off-colour** `Skill 3+`, which is a level-6 gate: `Devastating Blow` needs `Athletics 3+`, `Wit's End` needs `Intimidation 3+`, `Fatal Thrust` needs `Perception 3+`. Leyline's damage is available at **level 1** — Black's `Withering Ray` is `2[Tier][Die]` = 2d6 = **7 vital** (ignoring Deflect) for one Action at level 1, and Red's `Searing Bolt` is 1d6. Before level 6 the strongest thing a heroic character can do is a weapon Strike plus `Mighty`'s +2. So: **leyline is ahead early, both sides spike together at level 6, and leyline pulls away after** as rank keeps climbing while heroic's dice do not. On availability the two atlases are at parity — every tree in both opens 68–80% of itself by level 5. The design guide's target, "Leyline mages are mortal. Comparable to Heroic path characters", is closest to true at level 6 and drifts either side of it. > ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). **"Leyline is ahead early" is withdrawn.** The comparison dropped the weapon's own die and the system's `+ mod` on every hit (`cosmere-rpg/index.js:6845–6848`; `mod` = skill rank + attribute), which a Strike and `Withering Ray` both receive. Per Action at levels 1–5 (mod 4, a d6–d8 weapon): a Strike with `Mighty` ≈ 9.5–10.5, free and unlimited; `Withering Ray` ≈ 11 at ~1.5 HP a cast; `Searing Bolt` ≈ 7.5 for 1 Investiture. Black is at parity with a heroic Strike turn and Red is behind it; `Withering Ray`'s real edge is ignoring Deflect — a type edge, not a size edge. At level 6 Black does pull ahead per Action (≈ 23 for one Action against `Devastating Blow`'s ≈ 22.5 for two, `Mighty` included), and "heroic dice are flat across tiers 1–2" is true of the formulas — but `Mighty` and the weapon die grow, which is the growth channel the first default would have doubled (the defence advocate's fixRisks 5). **Default changed from (b) to (c).**

*Recommended default: **(c) accept and document the trade** in the guides and the session-zero material — per Action before level 6 the two atlases are at parity once the Strike's own die and the system's `+ mod` are counted, and a tier step on heroic riders would double-dip a growth channel heroic already has.* (b) give heroic damage a tier-2 step so it does not go from level 6 to level 10 without growing while leyline doubles — the first draft's default; it double-dips. (a) move some of heroic's off-colour rank-3 gates down to rank 2, so heroic gets its damage before level 6 — this changes the early game, which is the window session one is actually in. *(Talent ecosystem review, 2026-09-09; default changed 2026-09-12 by the critique.)*

> ⚠️ **Correction, same day.** The first draft of this ruling said heroic is ahead at levels 1–5 and that "every heroic tree is 100% available by level 5". Both were wrong, from a bug in the review's own `derive-dossiers.js`: the rank-3 → level-6 rule was applied only to the five leyline colours, so **43 talents gated on an off-colour skill were mis-levelled, 37 of them heroic**. The review's verification pass caught it. The rank cap is universal — `validate-build.py`: "max skill rank 2 up to level 5, 3 from level 6" — for every skill. Fixed, everything re-derived, and the recommended default changed from (c) to (b) as a result.

Ask: Heroic's three big damage talents are level-6 gated and their dice never grow, while leyline dice double at 6 — but per Action before level 6 the two atlases are at parity once the Strike's die and modifier are counted: accept and document the trade (c), give heroic a tier-2 step (b), or lower heroic's rank-3 gates so it gets damage earlier (a)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (c) accept and document the trade in the guides and the session-zero material (the critique's per-Action parity arithmetic beside it).** → **item 112**.

**R-106. Ten of twenty-one trees can never damage two enemies with one play — White, Blue and five of the six heroic paths among them.** Read from the text of all 365 talents: leyline Blue and White, heroic Agent, Envoy, Hunter, Leader and Scholar, and deity Fate, Life and Sovereignty have no talent that damages more than one enemy at any level, and heroic/Warrior's one is `Meteoric Leap`, at level 6 behind `Athletics 3+`. Of the other ten trees, most wait on a kill, a death, a Foundation, a capstone or the tier cap (R-109); before level 6 only three have a repeatable group play — Destruction's `Set Charge` (L1), Red's `Flame Surge` (L2) and Green's `Thorn Field` (L3). Black's one area talent is inverted: `Spoils of Isolation` hits Weakened characters, and both of Black's Weakened sources need the target to stand apart from its allies. **For a party of White, Blue and heroic paths, nobody can answer four enemies before level 6**, so this is an encounter-design constraint as much as a talent question — and whether groups should be everyone's job or a specialist's depends on how often adversaries come in packs, which this review was fenced from reading (R-101). *(README finding 6; problem ledger rank 2, run `wf_0b59b6ca-5bc`.)*

> **The count.** The ledger headlined *fourteen* trees and its own list named twelve at zero. A full-text read adds `Thorn Field` (Green) and `Death Mark` (Knowledge), which take those two trees off the zero list, and `Bone Garden` (Death) and `Bastion` (Civilization), in trees already counted. No advocate defended the gap.

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). The ten-tree zero list is confirmed by a full-text read and the party conclusion stands. The sub-claim "only three repeatable group plays before level 6" undercounts: Destruction's `Fault Line` (L3), `Pyre` (L1) and `Cascading Failure` (L3), Death's `Bone Garden` (L2), Civilization's `Bastion` (L3) and Power's `Unstoppable Advance` (L2) are also repeatable below level 6 — seven or eight, not three. None is in a tree this party holds, so the ask is unchanged.

> ⚠️ **Ben, 2026-09-13 — the premise is wrong, and the critique missed it.** A Slow turn is three Actions, and a Strike or a one-Action talent takes one target each — so any character can point three Actions at three different enemies from level 1. "Nobody can answer four enemies" and "the fight becomes a queue" are withdrawn: the group answer is splitting the turn, not an area talent. What survives is narrower and not a constraint: ten trees have no *area* effect, so their damage never scales past one target per Action, and the efficiency gap only shows against packs larger than a turn can split. No encounter-design rule follows from it.

*Recommended default: **(a) build this party's encounters around it now, and decide the talents once a pass can count enemies per encounter** — fewer, tougher enemies for a White + Blue + heroic table, written into the session plan; then, if R-101 allows the follow-up, size any talent change against real encounter rosters. Costs nothing and needs no rebuild.* (b) give White and Blue one multi-enemy answer each before level 6, in their own idiom and not as damage, so it stands with R-96 — the player-experience option set suggests a White formation effect that penalises enemies adjacent to two or more of your allies, and a Blue illusion that makes every enemy in an area test or lose track of a chosen target — and rebuild `Spoils of Isolation` so it works on a clump. Card text + authored rules; pack rebuild. (c) (b), plus one heroic group play below level 6. *(Talent ecosystem review, filed 2026-09-12.)*

Ask: No White, Blue or heroic character can damage two enemies with one play before level 6 — build this party's encounters around fewer, tougher enemies until a pass can count enemies per encounter (a), give White and Blue a non-damage group answer now (b), or add a heroic one as well (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): no change — the premise was wrong (a Slow turn splits three Actions across three targets from level 1); the count stands as an efficiency note only.**.

### K.8c — R-107 … R-111

**R-107. Temp HP has two writers that disagree: `Life Surge`, `Overgrowth` and `Spoils of Isolation` replace a pool even with a smaller one, while every other grant keeps the higher.** The engine writes Temp HP two ways, and they give opposite answers when the creature already holds some:
- **Keeps the higher** — `edhaGrantTempHpCross` (`51-green-restoration.js:93`): `wins = inc > held`, and a tie keeps the incumbent. `Bear Witness`, `Investiture of Command`, `Sovereign's Favor` and the cross-actor grants in the deity tree sections all route here. It is the writer R-36 fixed (PR #215, retired on evidence at bench run 39), and its reason is written beside the 07-24 migration that adopted it: writing over a partner's pool *"would silently nerf a partner already holding more from another source"* (`33-triggered-effect-resolution.js:211`).
- **Overwrites** — `edhaWriteTempHp` (`28-temporary-hp.js:31`) sets the flag unconditionally. Three talents reach it: `Life Surge` and `Overgrowth` through heal overflow (`03-where-an-effect-lives.js:882`, their `edha-overflow-thp` rule), and `Spoils of Isolation`, which writes its damage total onto the caster (`53-native-event-system.js:3071`). The generic single-target `thp` effect and a non-victim `edha-temp-hp` rule overwrite too — the first is commented *"replace-not-keep. Unchanged on purpose"* (`33-triggered-effect-resolution.js:236`), i.e. kept as it was, not chosen.

So an ally holding 6 from `Final Decree` who is healed 3 past full by `Life Surge` ends up holding 3 — a shield that shrinks because someone helped. The engine header states both rules seven lines apart (`28-temporary-hp.js:6`, *"a larger grant replaces a smaller one"*; `:13`, *"a new grant OVERWRITES the old, even if smaller"*), and `Sovereign's Favor`'s card says *"This talent's temporary HP does not stack"*, which reads as though other Temp HP might. **The ledger's objection survives and shapes the ask:** unify the writers before anyone trusts a Temp HP figure summed over rounds — including this review's own `Bear Witness` and Sovereignty arithmetic. *(README finding 7; problem ledger rank 7, run `wf_0b59b6ca-5bc`.)*

*Recommended default: **(a) keep the higher, everywhere** — route the three overwriting talents through `edhaGrantTempHpCross`, correct line 13 of the header, and pin the `Life Surge` case in `tests/`. It is what every cross-actor grant, R-36's shipped fix and `Sovereign's Favor`'s card already assume; the other path survives only because nobody changed it. ENGINE-ONLY, F5; no rebuild. Checklist row `ECO-1` observes which writer wins on a live table first.* (b) overwrite everywhere, as the header's "house rules" line says — simplest to explain, but it reverses R-36's shipped fix and makes an ally's help shrink a shield. (c) leave the two writers as they are. *(Talent ecosystem review, filed 2026-09-12.)*

Ask: `Life Surge`, `Overgrowth` and `Spoils of Isolation` replace a creature's Temp HP even with a smaller amount while every other grant keeps the higher — unify on keep-the-higher (a), unify on overwrite (b), or leave both writers (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) keep the higher, everywhere — route the three overwriting talents through `edhaGrantTempHpCross`, fix the header, pin the Life Surge case.** → **item 113**.

**R-108. The deity atlas has no Special-action talents — zero in ninety, against its own guide's 15–20% target.** Sixty-five of the ninety deity talents cost one or more Actions; the rest are 13 Passives, 7 Free Actions and 5 Reactions, and not one is a Special (`activation.cost.type` across `data/authored/deity-*.json`). The deity guide's action-type table asks for ~15–20% Specials alongside ~10–15% Free Actions. The leyline atlas was given the same kind of target and hit it: its guide still records *"The current leyline trees have 0% Specials and 14% 3-Action costs — both need fixing"*, and today leyline runs 27 Specials in 125 (22%). **The defence advocate's objection survives:** converting deity Actions into Specials makes deity trees more action-efficient, which widens the deity-vs-leyline gap the primer says to watch — so any conversion should follow leyline's agency work (R-96), not precede it. *(README finding 8; problem ledger rank 8, run `wf_0b59b6ca-5bc`.)*

> **The narrow fix on the table does not survive a data check.** The identity option set proposed retyping only the deity talents that "already ride another action", under the guide's Principle 10 (a rider applied during another talent's placement is a Free Action): `Sovereign's Favor`, `Sealed Edict`, `Withering Touch`, `Tempered Edge`, `Prognosis`, `Void Sense`. In the data four of those are already Passives, `Sealed Edict` is already a Free Action, and `Withering Touch` is its own attack (*"Spend 1 Investiture and make a melee weapon attack"*), not a rider. No talent on the list is an Action that Principle 10 would change, so a riders-only conversion changes nothing.

*Recommended default: **(a) restate the deity target and convert nothing yet** — the atlas was never authored toward a Special share, the only narrow conversion proposed changes no talent, and a broad one is exactly what the surviving objection warns against. Edit the deity guide's action-type table, and revisit with a leyline comparison once R-96's work has landed. DOCS-ONLY.* (b) convert one or two standalone deity Actions per tree into Specials now — meets the target and widens the gap. (c) leave the guide's target as an aspiration and change nothing. *(Talent ecosystem review, filed 2026-09-12.)*

Ask: No deity talent is a Special against the guide's 15–20% target, and the one narrow conversion proposed changes nothing on inspection — restate the target and convert nothing yet (a), convert one or two deity Actions per tree now (b), or leave the target as an aspiration (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) restate the deity target and convert nothing yet; revisit after the leyline agency work.** → **item 112**.

**R-109. Six deity trees cap their signature resource at "up to your tier" — one, for all of levels 1–5 — and Civilization's `Trade Routes` cannot be cast before level 6.** The caps, in the cards: Chaos *"up to tier Omens active simultaneously"*, Order *"up to your tier Edicts"* and *"up to your tier active Covenants"*, Civilization *"up to your tier Foundations"*, Destruction *"up to your tier Charges"*, Fate *"up to your tier Ordained Ground squares"* and *"up to your tier unsprung Snares"*, Death *"up to your tier Risen Servants"*. Tier is 1 until level 6, so for the whole span this campaign is in:
- `Trade Routes` (depth 1, level 2) reads *"choose two of your active Foundations"* — **uncastable** until level 6.
- Chaos's `Cascade Collapse` and `Unravel Everything` detonate "all your Omens", which is one, and `Spreading Omen` is dominated by its own entry.
- Destruction's `Cascading Failure` ("when two or more Charges detonate") has no second Charge; Order's `Lawkeeper's Eye` and `Final Decree` run off a single Edict.

Civilization's `Forge Construct` is the outlier the other way — *"You may sustain one active Construct"*, a flat 1 that never scales, alone among the ten sustain clauses. **The defence survives:** the cap is part of what makes level 6 a step change, and Knowledge — whose Insight cap is a flat 5 — is already the strongest damage tree in the game, which says lifting a cap is where the power is. *(README finding 9; problem ledger rank 12, run `wf_0b59b6ca-5bc`.)*

*Recommended default: **(a) keep the tier cap and repair only `Trade Routes`** so a level-2 talent works with the one Foundation a level-2 character can hold — an uncastable talent is indefensible on any reading, the cap itself has a defence that survived, and the dominated talents come alive at level 6 as designed. In the same pass, write `Forge Construct`'s flat 1 into its card as deliberate or put it on the ladder. Card text + authored rule; pack rebuild.* (b) raise all eight caps to "1 + your tier" (2 at Tier 1, 3 at Tier 2), as the identity option set proposes — unblocks everything above and makes every one of the six trees stronger at levels 1–5, widening the deity-vs-leyline gap. (c) leave the caps and date `Trade Routes` honestly to level 6. *(Talent ecosystem review, filed 2026-09-12.)*

Ask: `Trade Routes` needs two Foundations but the tier cap allows one until level 6 — repair just that talent and keep the cap (a), raise all six trees' caps to 1 + tier (b), or leave the caps and date Trade Routes to level 6 (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (a) keep the tier cap and repair only `Trade Routes`; write `Forge Construct`'s flat 1 into its card as deliberate.** → **item 114**.

**R-110. `Fatal Thrust` promises "two advantages" and `Defensive Position` "two disadvantages" — the binary rules deliver one, and each card is the talent's whole implementation.** heroic/Hunter's `Fatal Thrust` (level 6): *"Add 4d4 damage, and gain two advantages if the weapon is Discreet."* heroic/Warrior's `Defensive Position` (level 2): *"The Brace action adds two disadvantages to attacks against you, instead of one, and allies can Brace behind your shield."* Advantage and disadvantage are one binary state (R-100), so the second grant is worth nothing. Neither talent carries an event or an effect: both are declared MANUAL in the heroic tree-section header — `Fatal Thrust`'s *"4d4/advantage riders read off the card"* (`16-heroic-paths.js:46`), `Defensive Position` as *"the GM's dis/advantage bookkeeping"* (`:91`). So the line repeated through the review's analyses, that the engine folds the extra grant away, is wrong: no code touches either, the table reads the card, and the card says something false. `Defensive Position`'s last clause is real and worth more than it looks — canon Brace needs cover, so *"allies can Brace behind your shield"* lets them Brace without it. **The objection to the summing remedy survives:** converting either to a summing `edha-next-test-mod` modifier would put a primitive that one adversary ability and no talent uses today onto player cards, and uncapped additive bonuses are the ecosystem's largest identified balance risk — the same objection that narrowed R-98. *(README finding 10; problem ledger rank 14, run `wf_0b59b6ca-5bc`.)*

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). **"The second is worth nothing" is withdrawn.** Both talents are MANUAL (`16-heroic-paths.js:46–48`, `:91–92`), so the table plays the *printed* rule, not the engine's fold — and SR p.18 cancels advantages and disadvantages **one-for-one**. A character with two advantages who is handed a disadvantage still rolls with advantage; a character with one does not. "Two advantages" is insurance against a disadvantage, a real and common case (`Defensive Position` against an attacker who has advantage from Prone or a stance). The card does not say something false; it says something the engine cannot represent, and the engine is not involved. The objection to the summing remedy — "one adversary ability and no talent" — is the same false premise as R-96 and R-98: seven player talents use that channel. **Default changed:** rewording to one advantage would delete the insurance value.

*Recommended default: **(d) keep both cards as written and add one line to each — "advantages and disadvantages cancel one-for-one; roll with whatever remains" — plus a guide note that the engine folds two-against-one to nothing and these two talents are played by hand.** Card text; pack rebuild; no engine change.* (a) reword both cards to one advantage — the first draft's default; it deletes the value the printed rule gives. (b) keep "two" and give each second grant a different, real payload. (c) move both to the summing channel, with the cap R-98 (b) describes. *(Talent ecosystem review, filed 2026-09-12; default changed the same day by the critique.)*

Ask: `Fatal Thrust` and `Defensive Position` promise a second advantage or disadvantage, which the printed rule honours as one-for-one insurance and the engine cannot represent — keep the cards and add the cancel-one-for-one line (d), reword both to one (a), give each second grant a real payload (b), or move them to the summing channel with a cap (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (d) keep both cards as written and add the line "advantages and disadvantages cancel one-for-one; roll with whatever remains", plus the guide note on the engine's fold.** → **item 112**.

**R-111. `Withering Ray` is the only doubled-tier damage formula in the game — 2d6 vital at level 1, paid in health instead of Investiture, with nothing limiting it to once a turn.** Of all 43 damage formulas exactly one doubles the tier: `Withering Ray`, `(2 * @tier)d(2 * @skills.black.rank + 2)` — **2d6 (avg 7) at Tier 1 with Black 2, 4d8 (avg 18) at Tier 2 with Black 3**. Depth 0, level 1, 1 Action, a ranged Black attack against Spiritual, **vital** damage that ignores Deflect. The cost is *"Lose half [Die] health"* — about 1.5 HP a cast at Tier 1 and 2 at Tier 2 — and no Investiture. Its wired rules are that HP cost (`edha-ritual-hp-cost`) and a single-target gate, so three Actions buy three casts: about 21 vital in a level-1 turn if all three hit, for roughly 4.5 HP. Red's `Searing Bolt`, the other depth-0 leyline damage talent, is 1 Action + 1 Investiture for `[Tier][Die]` energy that Deflect reduces; the only other doubled-tier formula is a heal (Life's `Surgical Precision`). R-105's "leyline is ahead early" rests mostly on this talent. **The defence survives:** the leyline guide says Black's costs *"favor HP loss"* and that *"Black pays in blood and willpower"*, and the HP cost is a real throttle. *(README finding 11; problem ledger rank 17, run `wf_0b59b6ca-5bc`.)*

> ⚠️ **Critique, 2026-09-12** (`docs/analysis/talent-ecosystem/CRITIQUE.md`). Arithmetic verified (2d6 / 4d8; the HP cost rule `floor(1d(2·rank+2) / 2)` averages 1.5 / 2.0; `oncePerTurn` already exists in the engine, so (a) is an authoring change). **The framing is not.** A three-cast turn is not an outlier: every character can Strike three times, and with the `+ mod` R-105 omitted the two turns are the same size — `Withering Ray` ×3 ≈ 33 vital versus Spiritual for ~4.5 HP of a ~12 HP level-1 pool; Strike ×3 with `Mighty` ≈ 31 versus Physical, minus Deflect three times, free. Black's turn is bigger only by what Deflect would have taken, and costs about a third of the caster's health. **Default changed from (a) to (b):** once per turn would put Black's signature line below a heroic Strike turn, at an HP cost.

*Recommended default: **(b) keep it exactly as it is, and write it into the guides as the leyline damage ceiling** every comparison is measured against — with the per-Action arithmetic beside it, so the next reviewer does not compare its dice to a Strike's rider alone. DOCS-ONLY.* (a) keep the doubled dice and the health cost, and add once per turn — the first draft's default; it would put Black below a Strike turn. Card text + authored rule; pack rebuild. (c) halve it to `[Tier][Die]` and keep it free of Investiture. *(Talent ecosystem review, filed 2026-09-12; default changed the same day by the critique.)*

Ask: `Withering Ray` is the game's only doubled-tier damage, paid in health, and a three-cast turn is the same size as three Strikes with `Mighty` — keep it as the documented leyline ceiling (b), add once per turn (a), or halve its dice (c)?
> **ANSWERED 2026-09-13 (Ben, chat, from the ballot artifact + the critique): (b) keep it exactly as it is and write it into the guides as the leyline damage ceiling, with the per-Action arithmetic.** → **item 112**.

### K.9 — R-112 (a lone late answer, filed from bench run 45)

**R-112. `The Reckoning` cannot pay for its own signature ability — raise the pool, or lower the cost?** Item 89 gave both Unbreakable Line blocks a real `use → edha-def-test` rule, and bench run 45 drove it on fresh pack imports of each. The **Crownox Ring** works: 3 Focus consumed, a White roll config, the contest core's DC prompt, a SUCCESS/FAIL card. **The Reckoning does not** — its Unbreakable Line consumes **3 Focus** while its own `resources.foc.max.override` is **2**, so the cost can never be paid and `item.use()` does nothing at all. Raising the pool to 5 in-world made the identical take work and consumed exactly 3, so nothing else is wrong with the wiring. Item 89 copied the Crownox cost onto a block whose stat line cannot carry it — and the two blocks' cue text disagrees about whether there is a cost at all: the Ring's says *"an adjacent ox may **spend 3 Focus**: test White vs. DC = half the damage"*, the Reckoning's says only *"the lead may test White (DC = half the damage) via the contest core"*. Both are rivals; the Ring is a three-token wall, the Reckoning an Ashkar pack lead. *(Bench run 45; TODO item 119 carries whichever answer.)*

*Recommended default: **(a) raise The Reckoning's focus pool to 3** — it keeps the two blocks' shared ability identical, keeps the 3-Focus price that makes "hold a pack-mate at 1 HP" cost something, and a pack lead with 3 Focus is unremarkable beside the Ring's 3.* (b) drop the consume on The Reckoning to 0 and reword its card to say so — cheapest, but then the same ability costs 3 on one block and nothing on the other. (c) lower it to 2 on The Reckoning and say "spend 2 Focus" on its card — preserves a price and fits the pool, at the cost of the two blocks diverging by one.

Ask: The Reckoning's Unbreakable Line costs 3 Focus against a 2-Focus pool — raise the pool to 3 (a), make it free (b), or drop the cost to 2 (c)?
> **ANSWERED 2026-09-13 (Ben, phone board, 14:10 ET): "(a) raise The Reckoning's focus pool to 3 — it keeps the two blocks' shared ability identical, keeps the 3-Focus price that makes 'hold a pack-mate at 1 HP' cost something, and a pack lead with 3 Focus is unremarkable beside the Ring's 3."** → `data/adversaries.json`'s `foc` 2 → 3, and the Reckoning's `edha-gm-cue` note re-worded to name the same 3-Focus cost the Ring's already names. → **item 119** (DATA half; the ENGINE half — the shortfall announcer — was PR #337).

### K.10 — R-113 (a lone late answer, filed from bench run 46)

**R-113. May a bench run ever call `edha.syncAllAdversaries()` — and should the bulk button gain a scope guard, or stay yours alone?** Bench run 46's brief listed `⟳ Sync Adversaries from Pack` as a step-zero refresh after the 14:41 adversaries rebuild. The run **declined it** and recorded why: `edhaSyncAllAdversaries` is an unfiltered `game.actors` loop that replaces `system` **wholesale** on every world adversary (42 of them at the time) and then walks **every scene** pushing prototype token fields onto every token of each. Your world had a **live, started combat** on **"Playtest Map (Copy)"** — a scene outside the bench's licence, which covers "Playtest Map" only — with Ishee, Tem parinaem, Soggy Bottom and a Cinderhound at 6/14 mid-fight. Nothing was lost (the run's rows used fresh pack imports, and neither `The Reckoning` nor `Crownox Ring` exists as a world actor, so the sync was a no-op for the blocks it was asked for), but the next run will be briefed the same way unless this is settled. This is the same shape as run 45's `edha.fixPcTokens()` finding, one document up. **TODO item 123** carries whichever answer.

*Recommended default: **(a) add `{folder, actorIds, scenes, dryRun}` to the bulk path, default to a dry run when it is called from the console API, and refuse (or loudly name) any candidate token that belongs to a started combat.** Your sheet button and your own bulk button keep behaving exactly as they do now.* (b) leave the engine alone and make it a rule that a bench run never calls a world-wide `edha.*` mutator. (c) both: ship (a) *and* keep the runbook rule, so the guard is a backstop rather than a licence.

Ask: Should `edha.syncAllAdversaries()` gain a scope/dry-run guard so agents can call it safely (a), or stay a button only you press, with bench runs forbidden from calling it (b)?
> **ANSWERED 2026-09-13 (Ben, chat, ~15:45 ET), verbatim: "R-113 - agents need to be able to sync adversaries for bench runs."** — filed as option (a). `edhaSyncAllAdversaries` gains `{folder, actorIds, scenes, dryRun, allowStartedCombat}`: `dryRun` defaults to true for a bare `edha.syncAllAdversaries()`; Ben's sheet button and his "⟳ Sync Adversaries from Pack" bulk button both pass `dryRun:false` explicitly and are unchanged; any candidate token in a STARTED combat on an in-scope scene refuses the whole call unless `allowStartedCombat:true`. **The narrower question — whether "Playtest Map (Copy)" is the bench's scene too — was NOT answered; it stays Ben's scene by default, and the bench runbook keeps the bench off it.** → **item 123** (ENGINE-ONLY, F5).

*(Bench run 46, 2026-09-13.)*

---


### K.11 — R-120 … R-125 (the balance review, answered 2026-09-13)

Filed from `docs/analysis/talent-ecosystem/BALANCE-REVIEW.md` (PR #349) and answered by Ben in one line the same day — chat, verbatim: *"I've read it and agree with recommended changes."* Every recommended default is therefore the answer; the work is TODO items 130 … 135. Ben's one reservation — whether Draw Mana was ever meant to yield one Investiture per Action at tier 1 — is filed as **R-126** (§C), and item 131 (R-121) is sized after it.

**R-120. deity/Knowledge's `Predatory Strike` multiplies `[Tier][Die]` by the Insight count — twice the leyline damage ceiling from level 2, sustained. Reshape the repeatable strike, cap the stack, or accept it as the deity ceiling?** `Predatory Strike` (entry, level 1, 1 Action, 1 Investiture) is a weapon attack plus *"bonus Vital damage equal to [Tier][Die] per Insight on the target (minimum 1)"*, and it then adds an Insight. `Studied Mark` places two, `Accumulate` adds one at the start of every turn for free and refunds an Investiture once a round when the quarry is hurt, each hit adds one, the cap is five — so from the second turn of any fight the quarry carries five and every Predatory Strike is weapon + mod + **5[Tier][Die]** vital: about **26 per Action at levels 2–5 and 55 at level 7**, ignoring Deflect, with the second cast each round paid back by `Accumulate`. A sustained turn (draw + two strikes) is **52 / 54 / 111** at levels 1 / 5 / 7 against the leyline ceiling turn (three `Withering Ray`s, paid in health) at 33 / 36 / 72, a `Saltstance` Warrior at 34 / 37 / 46, and the next deity (Civilization, Construct plus the disciple's Strikes) at 39 / 42 / 67. The two talents written as the payoff, `Killing Blow` and `The Final Study`, spend the whole stack for one hit of the same size and are never worth pressing — the tell that the multiplier landed on the wrong card. *Recommended default: **(b) `Predatory Strike` deals one `[Tier][Die]` plus your Tier per Insight** (level 7: 9 + 10 = 19 bonus per hit — the size of `Withering Ray`, still the top deity single-target line; sustained turn 34 / 36 / 59), while `Killing Blow` and `The Final Study` keep `[Tier][Die]` per Insight so the cash-out becomes the burst it was written to be. DATA + the authored formula, REBUILD deity.* (a) cap Insight at 3 everywhere (38 / 40 / 75 — still above the ceiling at level 7; DATA, REBUILD deity). (c) accept it as the documented deity damage ceiling, the way R-111 documented `Withering Ray`, and write it into the deity guide (DOCS-ONLY). *(Balance review, 2026-09-13.)*

Ask: Knowledge's repeatable strike multiplies dice by Insight and doubles the leyline ceiling from level 2 — flatten the per-Insight bonus to Tier and keep the multiplier on the cash-outs (b), cap Insight at 3 (a), or accept and document it as the deity ceiling (c)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (b), the recommended default.** → **item 130**.
> **Second read, 2026-09-14 — Ben questioned the finding's validity:** *"This is taking every talent in the Knowledge tree, right? The highest possible amount of Insight? … What's the damage curve per-talent-taken?"* **Answer: one talent.** `Predatory Strike` alone adds an Insight on every hit, so it reaches the cap of five by turn 2–3 with no other pick; with Draw Mana at rank (R-126) a Draw plus two strikes is sustainable from level 1 — **52 a turn at tier 1 and 111 at tier 2 from the first pick**, against Black's first pick (Withering Ray) at 33 / 72 paid in health, Warrior's second pick (Mighty) at 31 / 40, Civilization's fourth pick (Arsenal) at 39 / 67. The per-talent curve is `docs/analysis/talent-ecosystem/balance-per-talent.js` and `BALANCE-REVIEW.md` §2 finding 1. Under (b) the first pick lands at 34 / 59 — parity with Black — and the cash-outs keep the multiplier as the reward for deeper investment. **Item 130 waited for Ben's re-read — and shipped: 2026-09-14 (Ben, chat): "Let's do the B reshape for Knowledge, then. I agree."** `Predatory Strike`'s rider is now `((@tier)d(2 · rank + 2)) + @tier × max(count, 1)` and its card says "equal to [Tier][Die] plus your Tier per Insight"; `Killing Blow` and `The Final Study` keep `[Tier][Die] × Insight` (PR #366, DATA — REBUILD deity). The decoy item-level `damage` formulas stay for now with their chat note (removal needs a build check the session did not have room for).

**R-121. Five deity trees refund Investiture without spending an Action and five do not; Power and Destruction are the two that pay per activation and get nothing back. Give them an income clause, or accept the pool as their price?** At tier 1 Draw Mana buys one Investiture for one Action, so once the starting pool (~4) is spent — two or three rounds in — every "1 Action, 1 Investiture" talent is a two-Action play. Chaos (`Void Sense`), Life (`Prognosis`), Knowledge (`Accumulate`), Sovereignty (`Expose`) and Death (`Reaper's Harvest`) each carry a passive refund that fires without an Action — close to a fourth Action every round from turn three. Order, Civilization, Fate, Power and Destruction carry none; of those, Order, Civilization and Fate mostly *install* scene-long things and so front-load their spend, but **Power is 100% Action-costed with no Passive at all** (`Kneel` + `Absolute Authority` is three Investiture, most of the level-1 pool, once a fight) and **Destruction detonates one Charge per Investiture** with nothing persisting but the terrain. *Recommended default: **(a) one income clause each, on an existing card, in the tree's own idiom** — `Warlord's Advance`: "If this attack reduces the target to 0 HP, you gain temporary HP equal to your tier, **recover 1 Investiture**, and may move up to 10 ft as a Free Action"; `Concussive Yield` (Passive): "… **Once per round, when a Charge you set detonates and hits two or more characters, recover 1 Investiture.**" (the exact shape of Red's `Flashpoint`). DATA — one authored rule on each card, no new primitive (the Investiture-recovery handler already serves five trees), REBUILD deity.* (b) accept — the two are burst trees and the pool is the price; document it in the deity guide (DOCS-ONLY). (c) a system-level rule instead (Draw Mana refunds on a kill, or the tier-1 draw yields two) — wider than the problem and it moves every leyline colour too (ENGINE + DOCS). *(Balance review, 2026-09-13.)*

Ask: Power and Destruction are the only deity trees that pay per activation with no refund — add one income clause each on an existing card (a), accept the pool as their price (b), or change Draw Mana for everyone (c)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (a), the recommended default.** → **item 131**.

**R-122. deity/Chaos caps active Omens at `tier`, so it is a single-target tree until level 6 — and its Black entry spends Omens it cannot make. Raise the cap to tier + 1 and let the Black entry place one?** Every Omen placement reads *"You may have up to tier Omens active simultaneously; placements beyond this cap are lost"* (or "subject to your Omen cap"). Tier is 1 until level 6, so `Spreading Omen` (depth 1, level 2 — "an Omen on the target and one additional enemy") places one, `Cascade Collapse` ("remove all your Omens … each enemy whose Omen is removed …") hits one, and the capstone's "every enemy in Attunement Range up to your cap" is one. The tree's whole multi-target identity — spread, collapse, unravel — is a tier-2 unlock; at tier 1 Chaos is the weakest damage deity per Investiture (Entropy Strike then Isolating Ruin on the one Omen: about 16 for three Investiture and three Actions). Separately, the Black lane (`Isolating Pressure`, `Unweaving`, `Isolating Ruin`) only *consumes* Omens, so a disciple who enters through the Black entry plays the weaker half of every card until they buy the Blue entry too. *Recommended default: **(a) both** — the cap becomes **tier + 1** (two at tier 1, three at tier 2; one number in the authored `capFormula`), and `Isolating Pressure` gains "If the target bears no Omen, place one" on its success clause so the Black entry can start the engine. DATA, REBUILD deity.* (b) only `Spreading Omen`'s second Omen ignores the cap (DATA, REBUILD deity; the Black-lane fault stays). (c) accept — Chaos is a tier-2 tree; say so in the guide (DOCS-ONLY). *(Balance review, 2026-09-13.)*

Ask: Chaos's Omen cap equals tier, so its multi-target identity does not exist before level 6 and its Black entry cannot make what it spends — raise the cap to tier + 1 and let Isolating Pressure place an Omen (a), exempt only Spreading Omen's second Omen (b), or accept Chaos as a tier-2 tree (c)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (a), the recommended default.** → **item 132**.
> **Confirmed 2026-09-14 (Ben, chat): "I agree with the update to omens, make them 1+tier."**
> **PR #369 (2026-09-13)** — the cap half ships: `capFormula` → `@tier + 1` on all four Omen-placing rules (`EntropyStrikeOme`, both `Spreading Omen` place rules, `UnravelFill00000`) and Entropy Strike's card text. `Isolating Pressure`'s "place on an unmarked target" half does NOT ship: H3 `edha-owner-list` has no way for a `place` rule to fire exactly when a same-activation `release` rule finds nothing — ordered after `release`, its `false`-halt skips the placement; ordered before it, `release` immediately finds and shatters the entry `place` just added. Filed as an open question rather than an engine change or a guess; see the PR.

**R-123. Two signature talents sit behind the level-6 wall: Blue's freeze (`Ghostly Walls`, Blue 3+) and Life's mutation (`Adaptive Mutation`, Green 3+). Move each down one rank?** Eight of Blue's twenty-five talents are Blue 3+ (level 6), and they are the three things the prose now sells as Blue's height — the counterspell, the freeze (`Ghostly Walls`, with `Absolute Stillness` behind it) and the moving image — so before level 6 Blue is a disadvantage engine with a barricade and a double, and (yardstick 5 of the review) an Action spent on one binary disadvantage buys about a fifth of one enemy attack. Life's signature resource, Mutation, is `Adaptive Mutation` at Green 3+, which the deity guide's own first principle ("fantasy on the first talent — from both entries") forbids; the prose now honestly calls mutation "the deep end". *Recommended default: **(a) both** — `Ghostly Walls` to Blue 2+ (the freeze becomes a depth-3, level-4 play; `Absolute Stillness` stays 3+ behind it and `Counterspell` stays 3+ — a talent-negation at level 3 would be too much), and `Adaptive Mutation` to Green 2+ (Life's fantasy on the entry's own lane by level 2). DATA (`data/leyline.json`, `data/domain.json` prerequisites + the authored copies), REBUILD leyline + deity.* (b) Blue only. (c) Life only. (d) accept both walls (DOCS-ONLY: the guides already say the trees complete late). *(Balance review, 2026-09-13.)*

Ask: Blue's freeze and Life's mutation are both level-6 gated and both are the identity the prose sells — move Ghostly Walls to Blue 2+ and Adaptive Mutation to Green 2+ (a), Blue only (b), Life only (c), or keep the walls (d)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (a), the recommended default.** → **item 133**.
> **Re-read 2026-09-14 (Ben, chat): "Level six wall doesn't read to me like a ruling needed. I changed two items to ungate them from level six."** — the decision was his to make directly; the repo carries it (`Ghostly Walls` → Blue 2+, `Adaptive Mutation` → Green 2+, PR #360) so a rebuild cannot undo an in-Foundry edit — tonight's deploy rebuilt the packs from the repo at 20:03 ET, and any compendium edit made before that was overwritten (pre-rebuild backup kept). → **item 133 done**.

**R-124. deity/Civilization's `Tempered Edge` makes the Construct's whole melee attack ignore Deflect — by design, the verifier found — and with `Arsenal` the Construct is a second character at tier 2. Accept and document, narrow the bypass, or throttle the second attack?** `Forge Construct` (one Action, one Investiture, level 1) plus `Tempered Edge` (free Passive: "Your Combat Construct's melee attacks deal an additional [Tier][Die] energy damage and ignore deflect") and `Arsenal` (two attacks a turn) give the disciple an attacker on its own initiative doing **14 damage a round at levels 3–5 and 36 at level 7, free after about four Investiture of setup**, with the disciple's own three Actions untouched (67 a turn at level 7 with plain Strikes) — the second-highest sustained line in the game and the highest that costs nothing per round. The independent verifier read the implementation: the rider carries `addTargetDeflect: true`, the engine adds the target's Deflect back as an extra instance so the hit lands as if Deflect were 0, and the engine's own hint names Tempered Edge as the intended user — so the whole-attack bypass is deliberate, not a loose sentence. It is also small: against typical Deflect it is worth a few points a round of the 36; the size comes from the second attack and the extra die. Deity power is Radiant-tier by design and the Construct also absorbs attacks. *Recommended default: **(b) accept as written and document it** — the deity guide's Civilization entry says the Construct's melee attack bypasses Deflect and that the two-attack Construct is the tree's damage ceiling, the way R-111 documented `Withering Ray` for leyline. DOCS-ONLY.* (a) narrow the bypass to the energy die — the rider's die would need a Deflect-ignoring damage type (the system subtracts Deflect once from the summed instances, so a per-die bypass is a retype, not a scope flag) and `addTargetDeflect` comes off: DATA + one authored field, REBUILD deity, and the card text changes. (c) `Arsenal`'s second attack only on the round after a kill — a bigger change than the evidence asks for (DATA, REBUILD deity). *(Balance review, 2026-09-13; revised after verification.)*

Ask: Tempered Edge's whole-attack Deflect bypass is deliberate and the two-attack Construct is the second-highest sustained line in the game — accept and document it as Civilization's ceiling (b), narrow the bypass to the energy die (a), or throttle Arsenal (c)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (b), the recommended default.** → **item 134**.
> **OVERRIDDEN 2026-09-14 (Ben, chat): "Construct doesn't need to ignore deflect. That can be cut."** — `Tempered Edge` loses "and ignore deflect" on the card and `addTargetDeflect` on its authored rider; the Construct's melee attack is turned by armor like everyone else's (DATA, REBUILD deity, PR #360). → **item 134 done** (rewritten from "document" to "cut").

**R-125. deity/Power's two entries read the Frightened condition; no talent or adversary applies it, and the engine registers it as a GM-applied marker nobody has documented. Replace the word, document the marker, or build a source?** `Kneel` ("You have an advantage on attack tests against any Compelled, **Frightened**, or Weakened character in Attunement Range") and `Absolute Authority` ("choose a Compelled, **Frightened**, or Weakened character") both read Frightened. The verifier swept all 365 talents, every authored overlay and `data/adversaries.json`: three mentions (the two reads plus `Risen Servant`'s immunity), zero applications, and no adversary ability inflicts it. The engine's status registry carries the intent: *"Power (Tyrith) — GM-applied marker (nothing auto-inflicts it yet)"* — so at a table where the GM applies fear by hand the clause is live, but nothing tells a player or a GM that. *Recommended default: **(a) replace Frightened with Disoriented in both** — a condition Chaos, Order, Red, White, Blue, Envoy and Leader all apply, which hands the one deity tree without an income (R-121) a little cross-path synergy for free. DATA (two card texts + the two authored condition lists), REBUILD deity.* (b) keep it as the GM-applied marker it was built as, and say so — one sentence on each card ("Frightened is applied by the GM") and one in the deity guide; DATA text, REBUILD deity. (c) keep the reads and build a Frightened source later (no change now). *(Balance review, 2026-09-13; revised after verification.)*

Ask: Kneel and Absolute Authority read Frightened, which nothing applies and which the engine treats as a GM-applied marker — swap it for Disoriented (a), document it as GM-applied (b), or leave it as a hook (c)?
> **ANSWERED 2026-09-13 (Ben, chat): "I've read it and agree with recommended changes." — filed as option (a), the recommended default.** → **item 135**.
> **Confirmed 2026-09-14 (Ben, chat): "Power changing to Disoriented is fine."**
> **PR #370 (2026-09-13)** — both cards and both status-list gates (`requireTargetStatus` / `whenTargetStatus`) moved from Frightened to Disoriented; the engine's `frightened` registry comment updated to say no talent reads it now (comment only, no code change). `Risen Servant`'s immunity list left alone (BR-1). Item 135 done.


### K.12 — R-126 (Draw Mana's yield, answered 2026-09-13)

**R-126. Draw Mana recovers Investiture equal to your Tier — one per Action at levels 1–5 — and that amount was never a design decision. What should a Draw yield?** What is live: `edhaDrawMana` (`module-src/scripts/engine/52-green-instinct.js`) writes `inv.value + tier`, clamped to the pool, and posts *"Draws Mana — recover N Investiture"*; the Draw Mana action item the build ships (`scripts/foundry-build.js` `drawManaItemDoc`) reads *"Recover Investiture equal to your Tier, and trigger your leyline color's Attunement rider"*; adversaries embed the same item and share the economy (ruling 49). So it **does** scale — with **tier**: 1 at levels 1–5, 2 at 6–10, 3 above — never with rank or level inside a tier. Where it came from: the engine's own header calls the sentence "Canon", but the design texts never set an amount — the initial atlas's `constants.js` and `Character_Building_Rules.md` (May 2026, `source-materials/legacy-uploads/`) say only *"1 Action; restores Investiture and triggers your color's Attunement rider"* and *"Restored by Draw Mana"*, and the leyline guide's Key Mechanic still says only "restores Investiture". The tier amount first appears with the build pipeline (2026-06-08) and the engine (2026-06-12), as an implementation default, and no ruling has ever touched it. Why it matters now: the balance review's yardstick 4 rests on it (once the ~4-point pool is spent, a "1 Action, 1 Investiture" talent is a two-Action play at tier 1, so an income passive is close to a fourth Action), and R-121's income clauses for Power and Destruction were sized against that tax. Ben (chat, 2026-09-13): *"Does it scale? The reviewer acts like it's 1 action:1 investiture but that was not my intent."* *Recommended default: **(a) recover Investiture equal to your rank in your highest attuned leyline colour** (2 at levels 1–5 for anyone who took a colour at character creation, 3 from level 6) — it scales with the investment that already gates the trees, keeps the level-6 step, and halves the tier-1 tax (a 1-Investiture talent becomes a 1.5-Action play in steady state; the whole starting pool refills in two draws). Adversaries read their colour rank from their role (minion 1 / rival 2 / boss 3), so a minion still draws 1. ENGINE-ONLY for the number (one expression in `edhaDrawMana` plus its card line — F5), and DATA for the Draw Mana item's text (REBUILD leyline, and the adversaries pack, which embeds the item). Then: re-size item 130 (R-121) — with a 2-point draw Power and Destruction may not need the clause — and restate yardstick 4 and `balance-turns.js`'s draw constant.* (b) tier + 1 (2 / 3 / 4) — the same tier-1 relief with a flatter top; ENGINE-ONLY + card text. (c) a full refill — one Action restores the pool to max; Investiture becomes a per-turn budget rather than a resource, the five income passives lose most of their value, and every Action-costed deity turn gets much stronger; ENGINE-ONLY + card text, and the review's deity findings need re-running. (d) keep tier as built and write it into the guides as the deliberate economy (DOCS-ONLY). *(Balance review follow-up, 2026-09-13.)*

Ask: Draw Mana yields Tier per Action today (one at levels 1–5), an implementation default that was never ruled on — make it your highest colour rank (a), tier + 1 (b), a full refill (c), or keep tier and document it (d)?
> **ANSWERED 2026-09-13 (Ben, chat), verbatim: "I like option a- equal to highest color rank."** — filed as (a). `edhaDrawManaYield` (highest of the five colour ranks via `edhaColorRank`, floor 1) replaces the tier read in `edhaDrawMana`; the Draw Mana card says "equal to your highest leyline rank"; the leyline guide, primer, handbook, handoff, balance review and `balance-turns.js` restated. ENGINE-ONLY for the number (F5) + REBUILD leyline and adversaries for the card. → **item 136** (done in the same PR); **item 131 closed as unnecessary** — with a two-point draw Power and Destruction sustain from level 1 without an income clause.

## L. Waiting — six design proposals for the queued TODO items (2026-09-13)

Filed together (item 127) so Ben gets one batch of concrete proposals instead of six separate
asks — each ruling below carries a recommended default, the alternatives, and the deploy class of
every option, the same standard the K.8 ecosystem-review batch used.

**R-114. Mantle of the Aspirant's redirect-unwind heal writes `hea` outside the heal-cut gate, declared nowhere — gate it at its emitter, or declare it the exception?** Item 70 (PR #308) gated R-83's three writers and swept for more: the Power tree's `Mantle of the Aspirant` redirect-unwind heals the WEARER back the amount an ally shouldered (`edhaResourceWrite(owner, "hea", ...)` at `47-power.js:306`) without ever calling `edhaHealCutGate`/`edhaCrossHeal`, and it is named in none of the declared lists — not R-10's four floors, not R-83's three, not `ENGINE_INDEX.md`'s five-call-site census pinned by `tests/drop-to-one-family.test.js`. It is arguably a reversal of a transfer (the wearer ends where it stood before shouldering — R-10's "a floor / an undo is not regaining" shape) rather than a heal from nothing, which is why item 101 filed it as a ruling instead of a fix. (Renumbered from item 101's original heading, which named a phantom "R-92" — R-92 already names a different, unrelated, already-filed ruling: the 0-HP "dropped" GM cue.)

*Recommended default: **(a) gate it at the emitter, exactly as item 70 did the other three** — route the redirect-unwind write through `edhaCrossHeal(owner, amt, {})` (the standard, non-bypass door) instead of the raw `edhaResourceWrite`, so a wearer who "cannot regain HP" stops regaining it from their own redirect; the family census grows 5 → 6 declared call sites, pinned by a reversion-sensitive case in `tests/drop-to-one-family.test.js` naming the sixth site by hand. ENGINE-ONLY (F5): one write-site swap plus the pinned test, no data or pack touch.* (b) declare it the exception instead — one paragraph in `ENGINE_INDEX.md`'s heal-cut rule naming the site and the R-10 "undo, not regain" reasoning, plus a negative-slice line in the family test so the census names it ON PURPOSE rather than by omission; no engine write changes. DOCS-ONLY: the `ENGINE_INDEX.md` paragraph and one test line, nothing else moves.

Ask: Mantle of the Aspirant's redirect-unwind heal bypasses the heal-cut gate — gate it at the emitter like R-83's three writers (a), or declare it the exception because it undoes a transfer rather than granting one (b)?

*(TODO item 101, from item 70's report, 2026-09-08; unblocks item 101 only.)*

**R-115. `False Premise`'s payload duplicates `Pattern Recognition`'s next-test disadvantage — what should it do instead?** Both talents write the identical rule shape — `edha-next-test-mod {target: "victim", mode: "disadvantage", count: 1}` — the moment a character succeeds a Cognitive test against (`Pattern Recognition`) or within Attunement Range of (`False Premise`) the Blue character, so a Blue character who owns both gets one disadvantage for two talent slots' worth of Investiture (R-98 (a), the talent ecosystem review). `Pattern Recognition` (Special, 1 Investiture, depth 1) is the cheaper, already-published slot; `False Premise` (Reaction, 1 Investiture, depth 2, prereq Persuasion 2+) is the one Ben chose to re-aim.

*Recommended default: **(a) the target cannot take Reactions until the start of its next turn** — replace `False Premise`'s success clause with the engine's existing `noreactions` timed status (`EDHA_TIMED_STATUSES`, `ENGINE_INDEX.md` "Statuses"; applied the same way other talents already apply a timed status), so the two talents no longer write the same rule and the new one denies a different resource (action economy, not a to-hit roll). Full card text: "When a character within Attunement Range succeeds on a Cognitive test, spend 1 Investiture and test Blue vs. their Cognitive defense. On a success, that character cannot take Reactions until the start of its next turn." DATA-only (authored rule swap + card text), REBUILD leyline.* (b) the target loses 1 Focus (minimum 0) instead — a resource drain rather than a status, but the engine has no generic "drain a foe's Focus" door today (every existing Focus write is the OWNER paying their own cost), so this needs a small new generic handler too: DATA + ENGINE-ONLY (F5), REBUILD leyline. (c) narrow the existing disadvantage to the target's next ATTACK test only — cheapest, one field, but it still collides with `Pattern Recognition` on the one roll that matters most (an attack), so it does not actually answer what Ben asked for; not recommended.

Ask: False Premise's payload duplicates Pattern Recognition's disadvantage — replace it with a Reaction-denial (a), a Focus drain (b), or a narrower disadvantage scope that still partly collides (c)?

*(TODO item 107, from R-98 (a), the talent ecosystem review, 2026-09-09/13; unblocks item 107 only.)*

**R-116. `Final Decree`'s Witness advantage is dead weight against Order's own `Lawkeeper's Eye` — what should the Witness clause grant instead?** `Lawkeeper's Eye`'s rule already reads `includeDecree: true` (`data/authored/deity-order.json`) — you and your allies already have advantage against ANY creature bound by your active Decree, which is exactly the violator `Final Decree` names. So `Final Decree`'s own Witness clause — "every Witness gains [Tier][Die] temporary HP and an advantage on its next attack test," the advantage grant hardcoded in `edhaDecreeResolve`, not a config dial — never adds anything for a character who also owns `Lawkeeper's Eye`, and a character who does not is unlikely to be the one naming Edicts and Decrees in the first place (R-100 (a): "Inside Order" is one of three named advantage collisions, the other two cross-path: Green + Hunter, and Order + Power).

*Recommended default: **(a) replace the advantage grant with a free Reactive Strike against the violator** — "every Witness gains [Tier][Die] temporary HP and may immediately make a Reactive Strike against the violator" reuses the same free-reaction primitive `Expose` (Sovereignty) and `Weave the Thread`/`Foreknown Strike` (Fate) already grant elsewhere in the deity atlas, so no new primitive is invented; it needs a small `edhaDecreeResolve` edit (the dead advantage branch is removed, the existing reactive-strike offer helper is called instead). ENGINE-ONLY (F5) + DATA (card text, REBUILD deity).* (b) leave `edhaDecreeResolve` untouched and just raise the Witness THP formula instead (already a config dial, `witnessThpFormula`) — e.g. add a flat `+ @tier` — cheapest and purely DATA (REBUILD deity, no engine touch), but the dead advantage-grant branch stays in the engine doing nothing, so the redundancy survives in code rather than in the card. (c) every Witness recovers 1 Investiture instead of the advantage — similar engine cost to (a) (also not a config dial today), reads as "the ambush pays for itself" rather than "everyone reacts."

Both cross-path collisions R-100 named stay documented rather than changed: **Green + Hunter** (`Pack Hunter`/`Scent the Weak` with `Seek Quarry`/`Exploit Weakness`, all on one attacker's roll) and **Order + Power, across two characters** (an Order ally's `Lawkeeper's Eye` voids a Power character's `Kneel` rider on the same attack — the engine's own header already says so, `49-order.js:154`) get one authoring note each in `leyline-revision-guide/SKILL.md` and `deity-revision-guide/SKILL.md` naming the pairing as a build choice a player can decline, not a data change. DOCS-ONLY.

Ask: Final Decree's Witness advantage duplicates Lawkeeper's Eye — replace it with a free Reactive Strike against the violator (a), a bigger Witness temp-HP number with the dead advantage branch left in the engine (b), or an Investiture refund (c)?

*(TODO item 109, from R-100 (a), the talent ecosystem review, 2026-09-09/13; unblocks item 109 only.)*

**R-117. `Trade Routes` needs two Foundations that the tier cap never allows before level 6 — how should it be reworded, and is Forge Construct's cap already right?** `Trade Routes`' own executor (`edha-zone {kind: "link"}`, `data/authored/deity-civilization.json`) refuses before cost with fewer than two Foundations, and `Lay Foundation`'s cap is `capFormula: "@tier"` — tier is 1 until level 6, so a Civilization character can never have two Foundations to link for the whole current level range (R-109 (a): keep the cap, fix the talent). Separately, `Forge Construct`'s card and rule already read a flat cap — `data/domain.json`'s prose says "You may sustain **one** active Construct" and the authored rule's `sustainCap` is `"1"` — so the "confirm this is deliberate" half of item 114 is already true today; nothing needs to change there.

*Recommended default: **(a) link a Foundation to a point, not to a second Foundation** — "Spend 1 Investiture and choose one of your active Foundations and a point you can see within Attunement Range. For the scene, they are linked: an ally standing in the Foundation, or within 5 ft of the linked point, may teleport to the other as a Free Action once per turn." This is castable with the ONE Foundation a level-2 Civilization character actually has. It needs a small engine change, not pure data as item 114 first assumed: `edhaZoneLink` today pairs two existing zone-ledger entries, so it needs a second mode that captures a raw canvas point as the other end of the same link-ledger entry. ENGINE-ONLY (F5), small — composes the existing `edha-zone`/`link` executor per iron rule 2a — plus DATA (card text + rule config, REBUILD deity).* (b) link the Foundation to yourself instead of a picked point — "the Foundation is linked to you; an ally standing in it may teleport to your side" — removes the point-capture UI (the caster's own token position is already tracked), a slightly smaller engine ask than (a) but still ENGINE-ONLY (F5) + DATA (REBUILD deity), and reads as a narrower, more defensive-support version of the talent. (c) raise the Foundation cap system-wide to `1 + tier` so the card's existing text becomes castable unchanged — rejected: this is exactly the option R-109 (a) already closed off ("keep the cap, fix the talent"), and it touches five other trees' caps to fix one Civilization talent.

Ask: Trade Routes needs a reworked payload that works from one Foundation — link a Foundation to a point in Attunement Range (a), link it to yourself (b), or raise every tree's Foundation-style cap instead, which R-109 already rejected (c)?

*(TODO item 114, from R-109 (a), the talent ecosystem review, 2026-09-09/13; unblocks item 114 only.)*

**R-118. Three deity gate colours buy nothing — Fate's White, Destruction's Blue (one talent), Life's Blue (one talent) — what should each read?** `deity-gate-audit.js`'s three channels (rolled / sizes / reach) count Fate's White at zero talents of nine — the only true toll booth in the atlas — and Destruction's Blue and Life's Blue at exactly one talent each: `Pinpoint Charge`'s keen-damage die (`(@tier)d(2 * @skills.blue.rank + 2) + @attr.int`) and `Surgical Precision`'s rolled Blue-vs-Physical test, respectively (`docs/analysis/talent-ecosystem/README.md`'s gate table; confirmed in `data/authored/deity-destruction.json`/`deity-life.json`). Ben chose (a): give each a real job rather than lower a gate or retire the colour-split rule (R-99 (a)).

*Recommended default: **(a) one small sizing change per tree, all DATA-only (REBUILD deity), no new engine primitive** — Fate's `Bulwark Ground` already has a configurable `thpFormula` dial (today a bare `@tier`); point it at `@skills.white.rank` instead, and reword "temporary HP equal to your tier" to "equal to your White rank." Destruction's `Cascading Failure` already has its own overlap-bonus formula (today `@skills.red.rank`, the "additional [Tier][Die] energy damage" clause that fires when two or more Charges detonate together); resize that ONE clause on `@skills.blue.rank` instead, leaving every other Destruction formula on Red untouched. Life's `Vital Diagnosis` already has a configurable `bonusDamageFormula` (today a bare `@tier`); point it at `@skills.blue.rank` instead, and reword "equal to your Tier" to "equal to your Blue rank" — fitting, since Vital Diagnosis is the tree's own Blue/Green gate talent.* (b) lower each gate's rank requirement instead (e.g. Fate's White to 1+) — cheaper to write, but it accepts that the colour buys nothing rather than giving it a job, which is not what Ben chose. (c) fix Fate's true zero only and leave Destruction's and Life's one-talent gates alone — smaller scope, but item 108 named all three.

Ask: Fate's White, Destruction's Blue and Life's Blue each need a real job — one sizing change per tree as proposed (a), a lower rank requirement instead (b), or fix Fate's zero only and leave Destruction/Life's one-talent gates alone (c)?

*(TODO item 108, from R-99 (a), the talent ecosystem review, 2026-09-09/13; unblocks item 108 only.)*

**R-119. Sovereignty's promised "Decree" — a radius that elevates allies and diminishes enemies — exists in no talent; what should it be, and what does it need from the engine?** Both intent sources promise it (the path description: *"Decree — a declared law projected within a radius: allies inside are elevated, enemies inside are diminished"*; the deity guide: *"Decree zones (declared laws within a radius)"*), and Sovereignty scores 13 on the capability budget, last by four, largely because every one of its nine talents is a single-target die-size shift (R-97). Ben chose (a): build the zone, constrained to a radius that MOVES WITH THE ARBITER rather than a third placed square — `Lay Foundation` and `Ordained Ground` already own the designate-a-square shape. `ENGINE_INDEX.md` has no existing primitive that does this: `edha-zone` (H2/2bV) places a MARKER SQUARE at a fixed map point, not a moving radius; `edha-aura` (H7) already travels with its owner but only ever applies ONE amount to the owner plus adjacent allies, with no enemy-side branch; `edha-test-aura` is likewise owner-only, ally-side, a flat all-tests bonus. The one piece that already exists and fits is **H9 `edha-die-step`** — the SAME primitive that already implements `Exalt` (ally die-step up), `Censure`/`Decree of Ruin` (enemy die-step down) and `Sovereign's Balance`/the capstone (`target: "pair"`: one ally up, one enemy down, `allySteps`/`enemySteps`) — it just has no radius/multi-target mode today, only single-target and `pair`.

*Recommended default: **(a) retrofit `Decree of Ruin` into the radius version, reusing H9's existing `allySteps`/`enemySteps` split** — full text: "Spend 2 Investiture and declare Decree for the scene: a 15 ft radius centred on you moves with you. At the start of each creature's turn, if it is within the radius: a willing ally's damage die size increases by one step (maximum d12) until the start of its next turn; an enemy's damage die size decreases by one step (minimum d4) until the start of its next turn. Once per scene." Same prereq (Black 3+; Censure); the roll-free apply matches `Sovereign's Balance`/the capstone's own precedent, neither of which tests before applying its ally/enemy pair. This needs H9 to grow a third `target` mode alongside `victim`/`ally`/`enemy`/`pair` — `target: "radius"` plus a `radiusFt` field — that, on the same turn-start cadence `Bulwark Ground`/`Ordained Ground` already use, finds every living creature within `radiusFt` of the OWNER and writes or refreshes an `allySteps`/`enemySteps` ledger entry for it, expiring the entry the moment a creature leaves the radius (the one genuinely new piece of logic — the ledger shape and the roll-watch consumption side are unchanged). Moderate ENGINE build (one small generic H9 mode, iron rule 2a, not a new primitive family) + DATA (the Decree of Ruin card, REBUILD deity) + the deity-revision-guide worked example R-97's own Done-when clause asks for (DOCS).* (b) retrofit the CAPSTONE (`Sovereignty`) instead, leaving `Decree of Ruin` untouched — its 3-Action/once-per-scene budget absorbs a scene-long AoE more comfortably than a mid-tier talent's, at the cost of losing the literal name "Decree" on the talent that becomes the zone. (c) leave Sovereignty single-target and only rewrite the prose to match — foreclosed: R-97 (a) already rejected this in favour of building the zone.

Ask: Sovereignty's Decree zone needs a moving radius and H9 (edha-die-step) needs a radius mode to carry it — retrofit Decree of Ruin into that radius version (a), retrofit the capstone instead (b), or drop the zone and only fix the prose, which R-97 already rejected (c)?

*(TODO item 106, from R-97 (a), the talent ecosystem review, 2026-09-09/13; unblocks item 106 only.)*

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

Ask: Should Edha notice a character dropping to 0 HP for you — a GM-whispered drop cue with the Roll Injury reminder (a), the cue plus auto-applied `unconscious` (b), or leave it manual like the system does (c)?

*(Ask line added 2026-09-13 by the PM: the ruling had a default but no Ask line, so `parseOpenRulings()` never showed it on the phone — it has been WAITING since 2026-09-09.)*

*(Bench run 44, 2026-09-09; relocated from §K on 2026-09-13 — it had never been answered; unblocks nothing queued, but session 1 wants it.)*
