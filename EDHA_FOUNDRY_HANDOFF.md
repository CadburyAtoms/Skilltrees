# Edha → Foundry VTT Port — Agent / Operator Handoff

Self-contained cold-start doc. Read top to bottom. **§1–§6 = how it works + how YOU operate it solo. §7 = the native Event/Effect system — ⚠️ PARTIALLY IN FORCE: the 2026-06-09 "all behavior lives ON the talents" refactor was real, then silently reversed by every tree wired after it. Measured 2026-07-24, refreshed 07-25: **the ratchet list is down to 130 names** (221 at the start, −91 in seventeen passes). ⛑ **`needs` is a FOUR-leg question, not three** (07-25, §9p): executor / schema field / event / **and is that event reachable at all** — 33 of the 64 talents that "read ready" sit behind a `use`-cancelling takeover or an Always-Active activation, which no handler-demand column can see. ⛑ **`bucket 1` is now EMPTY and `bucket` is NOT a forecast** — it was assigned by asking whether a handler is *registered*, not whether the behaviour can be expressed (07-24v: 0 of 6 bucket-1 talents were convertible). The classification of those 150 is **audit §9k** as corrected by **§9n**, the conversion log is **§9n**, and the build order is **§9o — but read §9o's FIVE "what actually happened when this table was executed" blocks before trusting its per-step numbers.** §9a–§9g are superseded. **Blue, Black and Warrior are fully clear of rule-2b talents** (07-24s). **The first of the five marker LEDGERS (`covenants`) has migrated to `flags.edha-content.lists.covenants` (07-24u)** — one accessor repoint, 12 readers unchanged; `edicts` is next and is now cheaper, because `allowDuplicates` and `multiOwner` both shipped with it. Five talents sit on a **declared exit with an empty document** (Vigilant Stance, the three UPGRADE talents from pass F, and Siphoned Will from pass I) — each declared in its tree-section header, none of them an oversight; **✅ BOTH open questions were SETTLED 2026-07-24t and §9m now has NO open items: the empty tab is ACCEPTABLE (the test is editability, not which tab), so the six-talent Envoy cluster is unblocked; and H3 gets an `allowDuplicates` field, because the tree as documented is the SPEC — a handler's limitation is never a reason to narrow a talent.** READ §7.-1 BEFORE §7.0 — the two historic blockers really were solved, but the architecture claim is not current. §8 = current content state. §9 = open to-dos. §10 = gotchas.**

Backing detail (every session's notes) lives in agent memory `edha-foundry-module-build.md` + `edha-aoe-bursts.md`; this doc is the curated summary. Last update: **2026-07-25** (RULE-2b PASS Q —
**The "ready" column measured properly: it is 64, not 67, and 33 of them cannot hold a rule at all.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 131 → 130.** Checklist **2bQ-1…3**, all unrun. Full working in **audit §9p**.

**This was session 4 of the migration plan, budgeted as a measuring pass, and the measurement is the
deliverable.** Applying the 07-24v readiness test to every talent whose `needs` column read
satisfiable found **three structural blockers that no handler-demand column can ever see**:

**(1) A takeover cancels the event. 15 talents.** There are **19** `preUseItem` hooks in the engine
and **every one ends in a bare `return false`**. A talent whose name sits in one of the nine named
Sets can **never fire `use`** — so an authored `use` rule on it is silently inert while the Events
tab looks perfectly correct. Chaos (4 + Red's Shatter Focus), Fate (4), Order (3), Death (2), Power
(1). The engine documents this hazard above the Order set at L13862; the classification never read
it. **The atom is the takeover Set, not the talent** — dismantling one frees a whole tree, and that
is how these should be scheduled from here.

**(2) Always-Active. 11 talents.** `activation.type: none`, the pass-P finding recurring — no `use`
event exists to put a rule on. **(3) Dealer-side riders. 7 talents.** Behaviour rides the
`applyDamage` wrapper, not an on-use payload.

**And the 31 that survive all three are still not 31 conversions:** 48 of the 63 remaining carry more
than one name-keyed site. **Apex Form has five mechanics** and its row reads `needs: [H8]`, built.

**Two builds nobody had listed fell out of the sweep.** A generic **REVEAL** handler — Sharp Eye's
payload is a whispered card of the target's lowest attribute / lowest defence / which resources are
below half, and the engine's own comment at L4662 calls it *"what still needs a payload H1 cannot
supply"*; **Vital Diagnosis needs the identical thing**, and its *classified* mechanic has been on
its document all along, so that row was pointed at the wrong line. And an **exclude-skills field on
`edha-test-rider`** — its hint has claimed since 07-24j to be *"what Frenzied Tempo needs"*, but the
talent excludes leyline-colour skills and `black` **is** a Presence skill, so authoring the obvious
rule would **widen** it onto Black casts.

**Measured while in there: 41 handler types, 18 with stub executors** (all 18 have real readers — no
dead handlers). **H8 `edha-watch` is one of them**, correctly, because it is a *gate* — which means
**all 44 talents whose `needs` names H8 still need a separate real payload handler**, and `needs`
records H8 as if it were the whole answer. That is the single largest reason the column overstates.

**Delivered: 1 conversion — Reckless Momentum.** The pass-I shape again: `edha-next-test-mod`'s
`plotDie` field hint has named this talent since **07-24k** and nothing ever wired it. Behaviour
verified identical to the retired case. ⚑ **A pre-existing card-vs-engine drift is flagged, not
silently fixed** — the card says "when you succeed on a Physical test, spend Opportunity"; the engine
has never checked either or deducted anything. **Ben's ruling wanted (§9p).**

Previous update: **2026-07-24y** (RULE-2b PASS P —
**Three passives that could never hold a rule at all (×4), and one MANUAL exit that was never justified.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 135 → 131.** Checklist **2bP-1…12**, all unrun. ⚠️ **`edha.calculatedPatience()` is DELETED — remove any hotbar macro that calls it.**

**The theme is one problem, not three talents.** All five Leyline Attunement Keys and Calculated
Patience are **Always Active** (`activation.type: none`), so they can never fire a `use` event and
therefore could never carry a rule *at all* — their tabs weren't empty by neglect, they were empty
because nothing could be put in them. That is the third leg of the 07-24v readiness test
(executor / schema field / EVENT) failing, and it is why three separate "cheap 1b" forecasts kept
being wrong about them.

**(1) `edha-draw-mana` — the event an Always-Active Key can hold.** One new event dispatched from
the Draw Mana hook that already existed. Blue and Red converted as drop-ins on `edha-next-test-mod`;
the payload handler and every field it needed (including `attr`) had been ready for months with no
way to reach them. Red's "lose your Reaction" had no schema field to land in, so rather than drop the
text it rides alongside as an `edha-note` — still GM-tracked, but now editable in Foundry (2bP-4…6).
⚠️ White / Black / Green did **not** move and are not cheap: a disposition-filtered visible-range
heal, an Isolated + line-of-sight status sweep, and a terrain Region with a click-to-place picker are
each new capability. **Beacon of Stability is a total orphan of one line inside the White branch**,
and Thorn Field / Thorn Hedge of one inside Green — both now commented as such (2bP-7).

**(2) `whenSlowTurn`, and the hazard was real.** Calculated Patience is a direct mirror of the live
Burning Drive rule, but the mirror is not symmetric: `edhaIsFastTurn` returns false for **three**
different states (no combat, no combatant, genuinely slow) and gets away with it because it fails
CLOSED. The negation fails **OPEN** — `whenSlowTurn = !edhaIsFastTurn` would have granted advantage
on the first test of **every out-of-combat scene**, silently. So it ships a real predicate that
requires a live combatant. **2bP-2 is the row to actually try.**

**(3) The macro nobody should have accepted.** `edha.calculatedPatience()` existed because "there's
no fast/slow-turn hook" — and the pre-roll rider pipeline had been reading turnSpeed for
`whenFastTurn` the whole time. Iron rule 3 says re-litigate manual every pass; this is what that
found. The console API is gone (2bP-3).

**(4) Forge Construct was pointed at the wrong line, exactly as §9n predicted.** Its summon spec has
been authored data for months; what held it on the ratchet was a 10-line name-keyed sustain-ONE
gate. Now `sustainCap` + `replaceOldest` on its own rule. ⚠️ **It was never "two schema fields":** a
handler executor runs on `use`, i.e. *after* the cost is charged, while the gates it replaces refuse
**pre-cost** — so it needed a generic `preUseItem` veto too. And `replaceOldest` had **no ordering
data at all** (nothing stamped a creation time; the old lookup used `.find()`, correct only because
the cap happened to be 1). Risen Servant's cap moved the same way, but that talent **stays** on the
ratchet for its Remains ledger — H3 (2bP-8…11).

**Also fixed while in there:** summon identity was a NAME PREFIX, so renaming a summon silently broke
its cap and its riders. There is a `summonTalent` flag now, with a name fallback for creatures
summoned before it existed (2bP-9).

Previous update: **2026-07-24x** (RULE-2b PASS O —
**You ruled BUILD IT on both remaining questions, so three things that never worked now do.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 136 → 135.** Checklist **2bO-1…7**, all unrun. ✅ **§9m has NO open items again.**

**(1) Decisive Command's printed '20 ft' is now enforced, and Authority genuinely doubles it.** New `rangeFt` / `maxTargets` / `doubleIfOwns` fields — the last one doubles BOTH halves at once because that is literally what Authority's card says. The handler also had to learn to affect N creatures: it resolved exactly ONE target, which is why 'double the number of allies affected' had nowhere to land. ⚠️ Decisive Command will now REFUSE an ally beyond 20 ft (40 with Authority) — nothing spent, but it is a restriction the table did not have (2bO-1).

**(2) Pack Hunting's quarry gate exists.** It never did: the bonus landed on the ally's next roll of any kind against anything. `targetUuid` could not express it — that binds to YOUR current target, which for Pack Hunting is the ally, not the quarry. The quarry is resolved when you spend the focus, so re-marking later cannot silently retarget a live bonus (2bO-5).

**(3) Damage rolls are real.** `appliesTo` (test | damage | either) plus a consumption path inside the rollDamage wrapper, where the formula has to land before the roll is evaluated. Pack Hunting's card has promised 'attack or damage roll' against a d20-only pipeline for its whole life (2bO-7). ⚠️ The risk here is a LEAK onto shipped talents — every existing mod is implicitly test-only — so four pinned cases hold it both ways on both callers.

**This is the first pass to fix a card-vs-engine drift by building the card's promise instead of deleting it.** Worth noting as a precedent: the 07-12 Withering Ray call went the other way, and either can be right — but 'the card is aspirational' should be a decision, not a default.

Previous update: **2026-07-24w** (RULE-2b PASS N —
**Your rulings q12 + q14 built, and the whole Leader command-die atom came off with them (×6).**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 142 → 136.** Checklist **2bN-1…6**, all unrun. ⛑ **q13 + q15 are still open — I restated both precisely, since my first attempt wasn't.**

**(1) "Enforce the skill lists" needed a fix that was necessary anyway.** `edha-next-test-mod`'s `skill` was a SCALAR compare, so an authored "itm, lea, per" would have matched no skill id at all — the gate would have passed *everything*. Now a comma-list, pinned both directions. All four Command talents converted with it.

**(2) Determined now actually wears off — at end of COMBAT, as you ruled.** `expire: "combat"` on `edha-apply-status` plus a generic sweep keyed on the CREATURE, so any future rule can opt in. It sweeps actors, not canvas tokens — an ally who left the scene mid-fight still carries the status, which is why some markers have historically survived a scene change.

**(3) The command die needed a primitive nobody had costed.** Its size depends on HOW MANY of the three upgrades you own, and nothing in roll data exposes an owned-talent count — so no literal formula on any one document could say d4→d6→d8→d10. `@owned` is substituted with the count from an authored `ownedFrom` list.

**(4) AUTHORITY converted, and NOT because it works.** Deleting Decisive Command's hook removed Authority's only presence — its "doubled" range was computed into a warning string and then thrown away, and Decisive Command has no distance check at all. That would have left it with an empty document AND no engine code, which iron rule 2b calls a bug. It ships as a rider note that says MORE than the old string did. Whether it becomes enforced is q13.

**Two things to bench:** the three upgrades' dice now apply ONLY on their listed skills (Demonstrative's Athletics/Agility are the ones you've been self-waiving), and Determined vanishes when the encounter ends.

Previous update: **2026-07-24v** (RULE-2b PASS M —
**A REAL BUG in last pass's H3 code, the Envoy cluster + the single-target gate (×8), and the classification finally made honest: BUCKET 1 IS EMPTY.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 150 → 142.** Checklist **2bM-1…12**, all unrun. ⚑ **Four new questions for you — §9m q12–q15.**

**(1) A BUG I shipped on 07-24u, found by scouting rather than by testing — 2bM-1.** H3's `place`
committed the ledger and only *then* marked the creature. When no GM is online to mark a target the
player does not own, the mark path bails — but the ledger write has already happened, leaving an entry
whose creature carries no status, which `edhaOwnerList`'s reconcile-on-read then hides **for ever**.
Silent in three directions: the placement looks like a no-op, the cap never counts it, and junk
accumulates in the flag. For Covenant the symptom is a pact that forms with **no icon and no +1 AE** —
indistinguishable from "the talent is broken". Fixed by ordering: **the step that can refuse must run
before the step that commits.**

**(2) BUCKET 1 WAS FICTION.** You asked me to convert bucket 1 (6 talents) and then the 1b fields (39).
Five read-only scouts checked the columns against real call sites first, and **0 of the 6 were
convertible**. Bucket 1 is now **0**. Ten of the 39 "1b" talents are not field-level at all and moved
to bucket 2. Delivered: **8**, not 45 — and I'd rather say that than pad the number.

**(3) The mechanism behind eight passes of over-estimation is now a one-line test.** Every optimistic
`needs: []` came from checking whether a handler was **registered**. Name all three or it is not ready:
the **executor** (`edha-heal-cut` and `edha-overflow-thp` are registered with empty function bodies —
a config-only handler cannot be a payload), the **schema field** (`edha-combat-timing` has no slow-turn
moment), and the **event** (nothing fires "you paid ritual HP"; and a talent whose activation is
`none`, like all five Leyline Attunements, can never fire `use` at all).

**(4) One recorded "DELETE-ONLY" would have shipped a live bug.** Overgrowth's entry said its name
check was redundant belt-and-braces. It is the **only discriminator**: Life Surge carries the identical
`edha-overflow-thp` rule and grants no Deflect, so deleting the name starts stacking +1/+2/+3 Deflect
on every Life Surge heal, silently, across two trees.

**(5) Four of the six Envoy talents carry a REMINDER, not a mechanic — and did before this pass too.**
Only Rousing Presence's status and Lessons in Patience's focus ever executed; Instill Confidence,
Devoted Presence, Stalwart Presence and Rallying Shout were strings. Converting them is worth doing
(the text is now editable in Foundry instead of buried in the engine) but it moves a reminder, and the
ratchet cannot tell the difference — so I'm saying which is which rather than letting the count imply
more automation than exists.

**(6) `edha-apply-status` was putting an enemy-debuff ownership flag on your ALLIES.** It wrote
`markedBy.<status>` unconditionally, and the damage post-pass reads that to add a marker owner's bonus
damage. Now a `mark` field, off for buffs.

**Next, and the shape of the remaining work has changed:** it is no longer a few big handlers but a
long tail of small ones. Cheapest first — **H20** (a Draw Mana event; converts Blue + Red Attunement
immediately), **H15** (two `edha-summon` fields; the only thing holding Forge Construct), **H19**
(`whenSlowTurn`, one field), then **H17** (a target-scoped formula resolver, which finally closes the
Field Medicine gap open since pass D).

Previous update: **2026-07-24u** (RULE-2b PASS L —
**THE FIRST MARKER LEDGER MIGRATED. `covenants` now lives where a rule can reach it, and all 12 of its readers followed for free.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 152 → 150.** Checklist **2bL-1…14**, all unrun.

**(1) The repoint held exactly as scouted — the first premise in this doc to survive contact
unchanged.** `edhaGetCovenants` became `edhaOwnerList(owner, "covenants", "covenant")`, the two writes
became `edhaSetOwnerList`, and **all 12 readers followed with no change beyond the entry field names**
(`allyUuid`→`uuid`, `allyName`→`name`). The 07-24s finding was right in full: **do not build a
`listPath` field.** One accessor is not just cheaper than a schema field, it is *safer* — with one array
the "ledger in two places at once" failure that made pass H convert zero talents cannot occur at all,
rather than being managed. `unsetFlag` splits dotted keys itself, so the cleanup list needed only
`"lists.covenants"`. **This is now a worked pattern: `edicts` is next and materially cheaper.**

**(2) THE TRAP THE SCOUTING MISSED, and it would have shipped silently.** The raw `updateActor` hook is
what makes a *player's* covenant write reach the GM's +1-defenses sweep. Repointing it to
`getProperty(changes, "flags.edha-content.lists.covenants")` **breaks it** — `setFlag` submits
`{flags: {"edha-content": {"lists.covenants": …}}}`, a dotted key **nested one level down**, and
`DataModel#updateSource` only expands dot-notation found among the change object's **TOP-LEVEL** keys
(`common/abstract/data.mjs:447`). So the dotted key survives into the hook and the lookup reads
`undefined`. The old flat key had no dot, which is precisely why the pre-migration code worked and why
nothing warned. The hook now accepts both shapes. **Any hook inspecting `changes` for a flag written
via a dotted `setFlag` must check the dotted form** — and every H3 ledger is written that way.

**(3) A gate lied in the REASSURING direction, which is worse than one that breaks.** Three passes have
recorded "gates break as talents leave the engine". This one did not break — it **passed while being
wrong**. `lint-refs` pass 7 counted the status table's `label: "Covenant"` as name-keyed dispatch, so a
*fully converted* talent stayed on the ratchet and the count read 152 when the truth was 151. A
breakage gets fixed in ten minutes; a false positive that inflates the backlog is invisible and gets
inherited by every later pass as real work. Rule 2b's actual test is **"would a rename silently unwire
this?"** and for a display label it is no — the rule references the status *id*, which is authored data.
Fixed narrowly, and **measured before landing: exactly one name in the engine occurs solely as a
label.** The measurement is the transferable part; the temptation was to reason about it instead.

**(4) The generic path contained THREE silent narrowings, and your 07-24t ruling is what caught them.**
Bear Witness looked like a plain `kind: "thp"` payload. Shipping it as one would have been a balance
change dressed as a refactor: `edhaWriteTempHp` **replaces** where `edhaGrantTempHpCross` **keeps the
higher** (Temp HP never stacks — so it would have *reduced* an ally already holding more); only the
cross variant **relays through the GM** for creatures the client does not own, and every member of this
ledger is somebody else's creature; and a White rank of 0 was **silent** where the generic path would
post "gains 0 Temp HP" every round. None of the three is visible in the classification or the card
text. **The check that finds them: for every helper the old code called, ask why it called THAT one.**

**(5) Adding a moment to a shared trigger is a double-fire waiting to happen.** `round-start` on
`edha-combat-timing` is two lines — but round 1 *begins* at combat start, so without a filter
Foresight, Sidestep and Practiced Kata would each have fired **twice** on the first round of every
combat. No gate could catch that; only a bench pass would. `whenMoment` defaults to `combat-start`,
which is what makes the widening provably inert for all three. **Checklist 2bL-13 is the probe.**

**(6) The honest count is 2, and that is the atom being satisfied rather than a shortfall.** Shoulder
the Oath (an in-flight damage **redirect** between actors) and Concord (a **pre**-damage mutation of
the live damage list) are both the `damage-applied` payload gap §9o has ruled out of scope three times;
Final Decree is genuine bucket 3. All three are declared in the tree-section header with the exact
missing payload. **For a ledger pass the deliverable is the REPOINT, not the talent count** — every
reader now resolves one array, so the tree is coherent whether or not the other three ever convert.

**Next, and it is NOT the greedy order:** the **Envoy Rousing-Presence cluster** (unblocked by your
q10 ruling, untouched this pass), then **`edicts`** as ledger #2.

Previous update: **2026-07-24s** (RULE-2b PASS K —
**H12 built + the macro gate landed. Mostly a SCOUTING pass: three build premises checked before writing them, and two were wrong.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 154 → 152.** Checklist **2bK-1…5**, all unrun.

**(1) "Already generic" was wrong AGAIN, and the check that catches it is one grep.** §9o costed H12
as "a schema over `edhaResolveCharges`, which is already generic" — the same sentence it used for H6,
wrong the same way. The function's **signature** is generic; its **body** hard-codes two *other*
talents' payloads by name (`i.name === "Pinpoint Charge"`, `edhaOwnsTalent(owner, "Concussive
Yield")`). H12 therefore **wraps** those branches instead of retiring them: ratchet −2, not −4.
**A helper is only "already generic" if its BODY mentions no talent name.** Twice in two passes it
was the body and never the signature.

**(2) A conversion's first step can be deleting a name from a Set.** Both H12 consumers were members
of `EDHA_DESTRUCTION_TALENTS`, whose `preUseItem` takeover ends in a bare `return false`. Leave the
name in and the talent's `use` event **never fires** — so every rule on its document is silently
inert while the Events tab looks perfectly correct. That is rule 2b's own failure mode reintroduced
one layer up. **Grep a talent's name in takeover/cancel Sets, not just in dispatch branches**; burst
talents and the whole Destruction tree use this pattern.

**(3) THE LEDGER ESCAPE IS THE WRONG SHAPE — and the cheap fix is available only because nothing is
half-migrated yet.** This doc has carried "teach H3 to address an arbitrary legacy path" since pass H.
For Order's two ledgers the answer is far simpler: **repoint the accessor to a dotted flag key.**
`getFlag` resolves dotted keys through `getProperty` (verified in your install), so
`getFlag("edha-content", "lists.covenants")` moves the ledger to where H3 already reads, **all 12
readers follow for free**, and there is only ever ONE array — the "two places at once" hazard becomes
impossible by construction rather than managed by a field. Order, Fate and Destruction are **100%
engine-owned today**, so there is no live half-migration to preserve. That window closes the moment
one of them is half-converted.

**Convert `covenants` first** (ranked all five): the only ledger whose entry is a *pure field rename*
into H3's schema, whose cap and evict already match H3's defaults, and which owns **zero canvas
objects**. `edicts` second, but it needs a ruling first — see (5).

**(4) Five traps in the ledgers, each of which would have shipped silently.** Full detail in audit
§9o; the two that would have hurt most:
- **"The mark wins" is INERT for Snares, Ordained and Charges.** Those entries have no `uuid`, so
  H3's reconcile calls `fromUuidSync(null)`, gets null, and keeps the entry unconditionally. The
  safety net that let Chaos survive a half-migration **does not exist** for three of the five, and it
  fails silently.
- **`edhaListUnmark` clears a status unconditionally, but both Order markers are SHARED between
  owners.** Ship H3 as-is and one owner's eviction strips another owner's icon.

**(5) ⚑ ONE RULING I NEED, and it is a real design question, not a default.** H3's `place` refuses a
duplicate uuid — but the Order tree **deliberately allows repeat Edicts on the same target** (its own
engine header says so: "different prohibitions, each its own entry"). Converting Edict as-shipped
would silently delete a documented rule of the tree. Do you want (a) an `allowDuplicates` field on H3
so Order keeps repeat Edicts — my recommendation, it is the tree as written — or (b) one Edict per
target, which is a real balance change? **`edicts` cannot convert until you pick.** `covenants`,
which is the one I want to do next, is unaffected.

**(6) H13 (Kneel) is scoped too SMALL.** The two recorded widenings are right; there is a **third**
nobody listed. Mechanic (2), the movement veto, needs a payload that can write `markedBy.<status>`
with owner-relative expiry bound to the victim — `edha-apply-status` has no expiry and reads your
current targets, and `edha-triggered-effect`'s status path writes no mark at all. Also `markedBy`
stores `{actorId, talent}` and the veto needs a **token uuid** (actor→token is ambiguous for unlinked
tokens, which is exactly why the bespoke flag existed). Ship H13 as recorded and Kneel converts two
mechanics and silently loses the third.

**(7) The `execute-macro` gate is BUILT** (lint-refs pass 8), before any consumer exists, so nothing
is grandfathered. You left the size to me: **20 logical lines** (blanks and comments free) **and 1200
characters** — both, since either alone is trivially evaded. It also rejects UUID-referenced macros
(they live in the world, so no gate can parse them and no rebuild can carry them), bodies that do not
parse, and `Hooks.on` / `setTimeout` (a hook outlives the use that created it and re-registers every
run — a second engine at any length). Shipped with 9 pinned cases, every rule mutation-checked both
ways, because this repo has twice had gates that looked right and did nothing.

**(8) `EDHA_PLAYER_PRIMER` and the dashboard are current; CLAUDE.md's iron-rule-7 ⚑ was stale** — the
cycle/reachability check has been live in both `validate.js` and `tests/pipeline.test.js` for a while.
Verified by re-introducing a mutual pair and watching both fail, then corrected the note. What is
still genuinely ungated: prose and `connections` naming *different* parents, which silently ANDs them.


### 2026-07-24s — RULE-2b PASS J (H6; superseded as the newest delta, kept as history)

**(1) The engine could resolve and apply, but it could not ASK.** That is why 31 talents whose cards
say "choose one" or "you may" were engine code — the largest single demand column in the whole
classification. H6 closes it. Blue's entire Calculation card family, both Blue `useItem` switches,
Unnerving Approach's bespoke card and Puppeteer's turn-change sweep are all deleted.

**(2) §9o's reuse claim was HALF right, and the false half was the design.** It costed H6 three
times as "largely exposing a schema over functions that are already generic". True of the OFFER
shape — `edhaPostCoordReactionCard` branches on no talent name at all. **False of the PICK shape**:
`edhaPostCalcTestCard`, `edhaPostBeaconCard`, `edhaPostReknitCard`, `edhaPostLifeCleanseCard` and
`edhaPostMutationCard` each hard-code a *different* payload in their click handler, so there was no
one function to put a schema over. Built as pass H's move instead: one card+click pair whose click
**dispatches back** through `edhaDispatchTestResult`, making the payload the item's own
`edha-test-success` rules. H6 therefore owns no payload vocabulary — every existing payload handler
works on a pick unchanged. Seventh consecutive over-estimate, and the first that was wrong about the
SHAPE rather than the count.

**(3) Three trees emptied, which is worth more than the headline number.** Blue (5 bucket-2), Black
(2) and Warrior (1) now have **no rule-2b talents left**. A cleared tree retires a whole bench pass,
and three cleared at once because H6 happened to be the last blocker for trees rather than for
scattered talents.

**(4) Four of the ten had nothing to do with H6, and each one is a reusable finding.**
- **False Premise** left H6's demand column because a RULING did it: its engine branch had two
  paths, and your 07-24r fail-open decision (§9m q9) deleted the manual one. It converted as clean
  H1. *When a ruling lands, re-read the `needs` of everything it touches.*
- **Feinting Strike** had `needs: [H5, H10]` with both handlers built two passes earlier and still
  could not move. Nothing was missing: `edhaDispatchOnHit` **hand-listed the three payload types it
  knew**, so an `edha-focus` rule on `edha-on-hit` was silently inert. Six lines made it announce
  instead, and the talent converted for free — clearing Warrior. *If a talent's `needs` are all
  BUILT and it still cannot move, suspect the dispatcher before the primitives.*
- **Probability Cascade** was bucket 1 all along; **Overwhelming Authority** came along because it
  shares a card function with Subtle Suggestion.

**(5) `turn-start` was built WITH its consumer, not schema-only.** Puppeteer's payload is H6's own
offer card, so the kind and the talent landed together — the rule §9o states for the remaining watch
kinds, applied. It carries the combatant's **current focus** as the observed value, mirroring
`focus-change`, so "starts its turn at 0 focus" is a plain numeric gate. `damage-applied`,
`token-move` and `attack-declared` still wait on their payloads.

**(6) Two gates broke, and both breakages were findings.**
- **lint pass 5**, exactly where the handoff predicted. Two adversary abilities are name-verbatim
  copies of converted talents and were passing the gate by riding the PC talent's engine branch.
  Both are now wired on their own documents — and that fixed a latent wrongness: the Dirgehound's
  card prints a **flat 5 ft** push while the borrowed branch scaled `[Size]` off the owner's Black
  rank, a stat no adversary has.
- **`audit.py`** read `data/*.json` through the machine's locale codec, so the first authored emoji
  containing byte `0x8f` (a variation selector — Anticipate's 🛡️) crashed it on your box while CI,
  whose default is UTF-8, stayed green. Five call sites now name the codec. *Any gate that reads
  repo data must specify its encoding.*

**(7) One defect the schema invited, caught before it shipped.** Puppeteer's prompt IS a success
rule, and the click dispatches that event again — so the prompt re-posted for ever. The dispatcher
now filters `edha-prompt-pick` rules under `viaPick`, **filtered rather than skipped**, so
`rules.length` still answers "did this talent carry a payload", which is what makes Puppeteer's
table-run note post at all.

**(8) Behaviour changes, all benched.** Pattern Recognition's disadvantage now expires at end of
round, matching its own card (2bJ-3). Puppeteer and Unnerving Approach spend their once-per-round
budget on the CLICK, so an ignored card no longer burns the use (2bJ-10). `data/leyline.json`'s
Subtle Suggestion prose said "start of your next turn" while the authored card, the engine and its
White twin all said "end" — the source prose was the outlier and was aligned; primer regenerated.

**(9) What I deliberately did NOT do, and what unblocks it.** The **Envoy** cluster is ready:
Rousing Presence plus five talents that all say "When you use Rousing Presence…". Converting the
parent means shipping **five more empty Events tabs**, and whether a bare tab is acceptable is the
one question still open (§9m q10, four talents already waiting on it). Answer it at the bench and
the whole cluster lands next session. Two corrections found while measuring it: **Devoted Presence
removes all four of Prone/Slowed/Stunned/Surprised and is not a pick at all**, and **Rallying Shout
/ Galvanize are the Field Medicine payload gap again** (the TARGET's recovery die).


### 2026-07-24r — RULE-2b PASS I (superseded as the newest delta; kept as history)

**(1) Two new things H8 can watch: `defeat` and `focus-change`.** §9o's prediction held — a new watch
kind is *one schema value plus one `edhaDispatchWatchers(...)` call at a hook the engine already owns*.
The handler, the filters, the memoized index and the payload dispatch were untouched. Three small
generic additions came with them, each forced by a real talent rather than designed up front:
`payloadTarget` (a defeat or a focus change has ONE party, not two, so the payload binds to the actor
it happened to), `whenTotal`/`whenTotalValue` (a numeric gate on the observed value — two fields
because the bound that matters is **0**, so "unset" can never be spelled as a number), and `chain`.

**(2) `chain`, and why a blanket guard became a field.** Pass H made a watcher's own payload invisible
to the next watcher, so Crown's spirit damage could not cascade. `focus-change` broke that on day one:
Whispered Doubt's extra focus loss taking a creature to 0 is a REAL second event Predatory Insight must
see — the hand-rolled code knew it and re-ran the zero check by hand (a 07-05 test-pass fix). The
boolean became a depth counter capped at 2, plus an opt-in `chain` field, default off. Pass H's
behaviour is bit-identical and exactly one rule in the project opts in. **The first time a blanket
guard is wrong, make it a field, not an exception.**

**(3) H10 `edha-focus` — involuntary focus as a rule.** `edhaGainFocus` / `edhaDrainFocus` have been
generic since the Black tree shipped and had simply never had a handler, so every talent that moved
someone's focus did it from a name-keyed branch. The handler says who, which way and how much; the
helpers keep owning the Wary reduction, the max clamp, the GM relay and the zero announcement. Five
lines of executor, and it is what freed a pass-F deferral (below).

**(4) The atom was the WATCHER — a third kind of atom, after the ledger and the mechanic.** Black's
Whispered Doubt, Coercive Pressure and Predatory Insight were three loops **inside one function**,
sharing its preconditions, its once-per-round bookkeeping and its tagged-write discipline. Converting
one would have left the other two reading a function whose checks had moved. All three went together
and `edhaRunFocusWatch` is now a single announcement. **Before scheduling a talent, ask what FUNCTION
it lives in and who else lives there.** Sovereignty's `edhaSovRollWatch` (Expose + Edict of the Fallen
+ Balance) and the applyDamage post-pass are the same shape.

**(5) Three of the seven came from RE-READING, not from `--priority`.** Reactive Analysis is filed as
an H8 watcher and is not one — the trigger is a Reaction's trigger, i.e. volition, and the mechanic is
an on-use grant the engine already had; it needed **no handler at all**. Hollow Command + Siphoned Will
were a pass-F deferral whose tree header *named its blocker* (H10) — a deferral note that names its
blocker is a work item, and grepping the headers for them found this one. **`--priority` ranks BUILDS;
the work list comes from call sites and deferral notes.**

**(6) Where the forecast was wrong again, in the same direction.** §9o listed ~20 consumers across six
watch kinds. Two kinds were built and delivered 4; `defeat` gave 1 of its 3 (Reaper's Harvest is the
Remains ledger; Arsenal's subject is the Construct's victim, not the dropped creature). The other four
kinds were **not attempted**, and the reason is the reason to stop reading `needs` as a forecast:
every consumer of `damage-applied` and `turn-start` needs a PAYLOAD that does not exist — a pre-damage
veto, a second-hit-this-round counter, in-flight damage reduction, a scene tally, a heal-half-of-dealt
link. Building those kinds now would ship a schema with zero consumers. **The payload gaps are the
work.** Six consecutive passes have over-predicted; the pass beat the number anyway, by reading.

**(7) A pinned test caught a live bug before the bench did.** `whenTotal: at-most 0` was implemented
with `Number(ev.total)`, and `Number(null)` is `0` — so an event carrying no readable value would have
satisfied "reached 0 focus", firing a scene-wide passive on every unreadable observation. The pinned
case failed on first run and the ENGINE was fixed. It also forced a deliberate asymmetry into the
open: H1's defense read fails OPEN, `whenTotal` fails CLOSED, because the failure modes differ.

**(8) Deleted, and what each deletion was enforcing.** `cogDisadv` + its pre-roll/consume pair (→
`edha-next-test-mod`'s `attr` gate, which is what "Cognitive" always meant), the `advTest` writer (→
`expireEndOfRound`), `focusRound` (→ `once: round-per-target`, keyed on the rule's item rather than the
talent's name), `cascadeArmed` (→ the `cascadearmed` STATUS — pass H's flag-vs-status lesson), and
`_edhaCascadeBusy` (→ H8's own re-entrancy depth, which now protects every watcher instead of one).

**(9) Six deliberate behaviour changes, all on the checklist as RULINGS, not bugs.** Coercive Pressure's
card now says "enemy" (matching the 07-12 ruling the engine already followed) and its debuff no longer
stacks with another next-test rider; Whispered Doubt's extra loss now passes through **Wary**; Hollow
Command now enforces its printed Attunement Range pre-cost and fails OPEN on an unreadable Spiritual
defense (same trade as Extract Thought, 2bH-11 — **one ruling should cover both**); Reactive Analysis's
advantage now binds to the creature you targeted, as its card always said.

**(10) ✅ EVERY OPEN §9m QUESTION IS NOW SETTLED (Ben, 2026-07-24r: "go with defaults").** The whole
batch went to its recommended default, so nothing in the migration is blocked on a ruling any more:
**build H9** (and note it is on Expose's critical path — Expose gates on the die-step ledger, so no
number of watch kinds reaches it first); **build H3b as a `mode` on H3**, not a second handler, which
moots the "one tree" objection; **land the `execute-macro` size/syntax gate before its first
consumer**; **take the revised build order**; **one marker ledger per session**, and a session that
finishes early takes non-ledger work rather than starting a second; **Counterpoint's declined
prompt-DC is a FAIL** that prints "resolve at the table"; and **all six pass-I behaviour changes
stand**, with fail-open-on-an-unreadable-bar now H1's standing convention rather than a per-talent
question. ⚑ **One thing a default cannot settle**: whether the UPGRADE-TALENT talent's EMPTY Events
tab is acceptable or merely tolerable at the bench (four talents now take that exit — 2bF-5/14/16 and
2bI-9). That needs Ben in front of Foundry, and it decides whether the pattern keeps scaling.

**(1) H8 `edha-watch` — the observer.** The justification was verified, and it was also *named
wrongly*, which had hidden half its consumers. "No event system fans out to N observer ACTORS" is
true and is the smaller half: the system's dispatcher resolves ONE document and iterates that
actor's items, and `edhaDispatchTestResult` iterates **that ITEM's rules** — so a talent could not
see a **sibling talent's** event either. That same-actor case is *all three* of this pass's
conversions. `scope: self` and `scope: scene` are one handler because it is one sweep; only the
actor list differs. The sweep hoisted is `edhaDarkVeilSweep`'s idiom (tokens → talents → rules →
match handler.type), the one sweep in the engine that names no talent. Payloads ride H1's existing
`edha-test-success` / `edha-test-fail`, so there is no new payload vocabulary and no hand-listed
payload types. ⚑ `scope: scene` is built, filtered (disposition/range) and **unconsumed** — its
consumers are the Dread Presence / AE-sweep families.

**(2) Converted: Crown of Thorns, Absolute Authority (Power), Extract Thought (Black).**
`edha-test-fail` finally has a consumer — it shipped in pass D and dispatched to nothing for four
passes; Absolute Authority's consolation Weakened is what it was built for. **2bH-2 and 2bH-5 are
the rows that matter.**

**(3) The coupling dissolved from the FAR end — the move worth stealing.** Pass F deferred Crown +
Kneel + Absolute Authority as a unit because two converters called `edhaCrownPing`. Rather than
convert all three, the CALL SITES changed: a resolved test is now **announced**
(`edhaDispatchWatchers`), not routed to a named talent. All four firing sites — including the two in
Sovereignty and the one in still-engine-owned Kneel — now name nothing, and Crown reads the
announcement from its own document. **A coupling through a named call can be cut at the caller, and
then the callee converts alone.** Worth trying before batching N talents together.

**(4) Kneel stayed behind, for a NEW reason.** It is three mechanics and only the test is
expressible: the move-toward-or-nothing veto reads a bespoke `kneelBy` stamp **no rule can write**,
and the standing advantage needs `edha-test-rider` widened (comma-list statuses + a range gate).
Converting the test alone would ship a talent whose other two thirds silently stopped working. The
coupling check has a sibling: **count the talent's MECHANICS, not just its call sites.**

**(5) ⚠️ PHASE 1 CONVERTED ZERO — and the finding is bigger than the seven talents.** §9o listed
seven H3-shaped talents as "already satisfiable, build nothing". None converted, and none for the
known payload-gap reason:
  · **The H3 atom is a LEDGER, not a talent.** H3 stores at `flags.edha-content.lists.<key>`; Order's
    `covenants` (13 read sites), `edicts` (11), Fate's `fateSnares` (9) / `fateOrdained` (8) and
    Destruction's `charges` (15) live at LEGACY paths their un-migrated siblings read directly.
    Convert one writer and the ledger exists in two places at once. Chaos survived a half-migration
    only because it keeps no array and re-derives from the mark — **that does not generalise.** H3's
    17 remaining consumers are really ~5 tree-sized atoms that convert whole or not at all.
  · **H3 has no `annotate` op** (Sealed Edict, Inevitable Snare, Weave the Thread — plus Pinpoint
    Charge, already in the engine). The engine's own comments name the shape twice.
  · **Cascading Failure / The Unmooring are not ledger ops at all** — bulk detonations over a
    canvas-owning ledger, which §9n had already ruled out of H3's scope back in pass G.
  **Recommended next — corrected in-session, see §9o.** With H8 in the built set, "already
  satisfiable" jumps 11 → **31**, and reading all 31 says the next build is **widening H8's `watch`
  enum** (damage-applied, defeat, turn-start, token-move, focus-change, attack-declared — ~20
  talents, every hook already owned by the engine), NOT H6 or H3ann. H8 as shipped watches only
  `test` and `skill-roll`, which is why just ~3 of the 31 are convertible today.
  Order: **H8 watch-kinds** → H6 → H3ann (+ the legacy-flag-path escape) → H12 → H13 → the tail.

**(6) Two generic bits that are not H8 but came out of it.** A pre-cost **"already armed, nothing
spent"** veto keyed on *any* untimed `edha-self-status` rule (no name at all), replacing Crown's
bespoke guard; and a generic **`.edha-watch-manual`** button so a qualifying test the engine did NOT
resolve still reaches its watcher. Deleting that button would have been a regression wearing a
tidy-up — **when a name-keyed branch goes, ask what it was ENFORCING and re-provide that
generically.** Related: **scene-arming should be a STATUS, not a flag** — nothing lets a rule write
an arbitrary flag, so a flag keeps the arming engine-owned. Crown now arms the `crowned` status,
which also makes "am I armed?" visible on the token.

---

### 2026-07-24p (RULE-2b PASSES F + G —
**14 names off with no new handler, then H3 built and 3 more.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 191 → 174.** Checklist **2bF-1…17** and **2bG-1…8**, all unrun.

**(1) Pass F — eleven gated tests, zero new handlers.** Counterspell, Read Intent, Redirect
Momentum, Ghostly Walls (Blue) · Grasping Vines, Territorial Instinct, Drive the Prey (Green) ·
Incite (Red) · Double Dip (Black) · Steadfast Challenge (Envoy) · Valiant Intervention (Leader),
all onto `edha-def-test`. **H1's `vs: skill` mode — the engine rolling the foe — now has its
first three authored consumers ever.** `edha-test-fail` still has NONE; its cleanest consumer is
Absolute Authority, which is deferred (see 4). **2bF-3 is the row that matters.**

**(2) The UPGRADE TALENT — a second declared exit, and Ben's ruling.** Absolute Stillness, Calm
Appeal and Resolute Stand have no hook of their own; each existed only as an `edhaOwnsTalent`
branch **inside its parent's engine code**, so one mechanic pinned two talents to the ratchet.
Ben's call: keep the reminder, gate it on the document. The parent's success rule now carries the
rider with **`whenOwnsTalent`** — authored data on a tab he can edit, not an engine branch, the
same reasoning that already lets `edha-enter-stance` take a stance name. The trade is explicit:
**the upgrade's own document is empty, so editing its line means editing the parent's rule.**
Declared in both tree headers; checklist 2bF-5 / 2bF-14 / 2bF-16 ask whether that is acceptable
at the bench or merely tolerable.

**(3) `edha-note` — the primitive bucket 3 was missing all along.** Every declared exit owes its
talent a rule that at minimum posts a card, and until this pass **nothing could**: `edha-gm-cue`
has a config-only executor, whispers GMs, and fires only on its own trigger list. `edha-note` has
a body, so it works as a payload on any event. 17 bucket-3 talents were queued behind a handler
nobody had noticed was absent.

**(4) Four "ready" talents were not, and all four are coupling or shape.** Kneel and Absolute
Authority both call `edhaCrownPing` — converting either alone silently drops **Crown of Thorns**
to the manual button on its own card, so all three move together on H8. Hollow Command's success
pays **Siphoned Will**, whose only call site is inside it (H10). Extract Thought is the wrong
SHAPE: a passive watcher on *every* Deception roll, not an on-use test (H8). That is six coupling
corrections in four passes; the rule is now stable — **grep a candidate's call sites for another
talent's name, and check the hook's shape, before batching it.**

**(5) Incite was a genuine behaviour UPGRADE, not a like-for-like move.** Its engine case posted
"on a success vs the target's Spiritual…" and resolved nothing — it trusted the player to have won
an opposed test. It passed every gate for months because `audit.py`'s soft-laziness check only
looks at opposed *skill* tests and Incite is vs a defense. It now runs the test. ⚑ 2bF-11.

**(6) The gate had to learn the new wiring.** `audit.py` asked whether a talent's NAME appears
beside an `edhaQueueContest` call — which is the very name-keyed pattern 2b removes — so the
first `vs: skill` conversion FAILED a gate it satisfies better than before. Taught it the
document-driven form. **Every gate that detects wiring by inspecting the ENGINE will hit this.**

**(7) Pass G — H3 `edha-owner-list` built.** `op: place | release | count`, `capFormula`,
`evict: oldest | refuse`, marker status, pure core `edhaListPush` pinned and mutation-checked
four ways. §9o called it "a consolidation of six byte-identical hand-rolls"; it is not, and the
differences ARE the schema — Order/Fate fizzle the OLDEST (Ben R1) while Chaos REFUSES at the cap,
and averaging them would have silently changed two trees.

**(8) The conditional payload needed no new field.** `op: release` returns **false** when there
was nothing to release, and the H1 dispatcher already stops the remaining rules on a false. So
rule ORDER expresses "if it bears my Omen, also…": `[status] → [release] → [damage]`. Chaos's
Isolating Pressure/Ruin are the reference. **Reach for ordering before adding a gate field.**
⚑ 2bG-4 is the row that proves it.

**(9) A half-migrated tree needs the mark to outrank the ledger.** Chaos's three unconverted
talents still call `edhaRemoveOmen`, which knows nothing about H3's list, so `edhaOwnerList`
reconciles on READ and drops any entry whose creature no longer bears the status. Membership lives
on the mark, order lives in the list, and the mark wins — which also fixes the case no hand-rolled
list ever handled: a GM clearing a status by hand. ⚑ 2bG-6 is the only row that can catch this.

**(10) ⛔ §9o's per-step numbers do not survive contact — corrected in place.** "~13 with no build"
delivered 11 + 3 riders; "H3 clears Chaos and Knowledge outright" delivered **3**. Knowledge is not
H3 *at all*: Insight is a counted SINGLE BEARER, not a capped list, so all 9 of its bucket-2
talents want a new **H3b `edha-owner-counter`** — a fresh §9m question with the same shape as the
H9 one. Chaos's other three are H8 range sweeps and a proximity pick. **H8 is now unambiguously
next** (demand 54, +29), and the Crown-of-Thorns unit is the first thing to convert on it.

**(11) Three §9m questions settled by Ben this pass.** `execute-macro` is ALLOWED gated + size-
limited but is **not** the bucket-3 exit (a 200-line subsystem in a text field is a second engine
in a string) — ⚑ the size/syntax gate is not built yet, and should land before the first consumer
does. The 2bE-9 adversary widening STAYS. The upgrade-rider ruling is (2) above.
)
**PREVIOUS — 2026-07-24n** (RULE-2b PASS E —
**H5 + H11 BUILT, the combat-timing dispatcher wired, 11 talents converted.**
⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 202 → 191.** The heroic atlas is now largely off the engine.
**(1) The event that had no dispatcher.** `edha-combat-timing` has been registered since 07-18 with
**zero dispatch sites** — every combat-timed passive was a bespoke name-keyed `combatStart` hook
instead. Wiring it once unlocked THREE things: H5's passive grants (Foresight, Sidestep), H11
`edha-enter-stance` (Practiced Kata → Vigilant Stance, closing the pass-B gap), and anything
combat-timed later. **Search heuristic worth keeping: a registered type with zero dispatch sites is
a migration unlock hiding in plain sight.**
**(2) `edha-cae-grant`** — kind action/reaction/burn-reaction, `n`, `target: self|target`, `label`,
`whenDeflectBelow` (Sidestep's armour gate). Keeps the graceful no-tracker chat fallback. Retires
`EDHA_CAE_USE_GRANTS` + 3 bespoke hooks.
**(3) ⚠️ Tactical Ploy is the load-bearing one.** First talent whose H1 payload is real MECHANICS
rather than card text: an `edha-def-test` gate plus TWO sibling rules on `edha-test-success`
(`edha-next-test-mod` −1d4 + `edha-cae-grant` burn-reaction). Batch 1 proved the gate; this proves
the dispatch. **45 talents are queued behind that answer — checklist 2bE-7 matters more than
anything else outstanding.**
**(4) A deliberate widening, flagged.** The retired hooks were gated `a.type === "character"`;
rule-driven dispatch doesn't need that gate, so an adversary carrying an embedded twin now gets its
combat-start grant. Correct scope for a rule, but a real behaviour change — 2bE-9, reversible.
**(5) Vigilant Stance is off the ratchet with an EMPTY document, declared not overlooked.** Its
Dodge/Reactive-Strike discount is the CAE-NEXT *cost-discount* class, which no handler can express
yet; its text still reaches the table via the stance marker (which carries the talent's
description). Condition for fixing it is recorded in the heroic section header. First talent to
take a declared exit because its mechanic is **unbuildable** rather than engine-owned.
Remaining 191 split **7 / 43 / 124 / 17**.
**(6) BUILD PRIORITY, measured — audit §9o (supersedes §9k's order after the heroic atlas).**
Computed from the per-talent `needs` sets, asking *how many talents become **fully** satisfied*
rather than how many mention a handler. **~13 convert with NO new build.** Then **H8 +19, H6 +24,
H3 +29 → 92 of 124 (74%)**. The increments GROW because most bucket-2 talents need a **pair** of
handlers, so raw consumer counts (which §9c and §9k both used) systematically undersell the trio.
**Order from here: convert the ready ~13 → H3 → H6 → H8** — H3 first despite H8's bigger headline,
because H3 is a consolidation of six byte-identical hand-rolled list implementations while H8 is
the riskiest design (cross-actor sweeps + filters + the memoized index). H8 should land after two
handlers have been benched. Trees that go to zero on those three: Chaos, Knowledge, Life, Power,
Blue, Leader, Scholar.
Previous: **2026-07-24m** (RULE-2b PASS D —
**H1 `edha-def-test` IS BUILT**, + the first four conversions. ⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 206 → 202.** The first handler build of the migration; 45 bucket-2 talents were blocked
on this one shape.
**(1) What landed.** Handler `edha-def-test` (gates ONLY, never a payload) · events
`edha-test-success` / `edha-test-fail` (payload rules listen there) · pure helper
`edhaDefTestOutcome` · dispatcher `edhaDispatchTestResult`.
**(2) It WRAPS the contest core** (audit §9h's warning): `edhaQueueContest` already owns
roll-capture, TTL and skill-matching, so H1 only does the comparison in its callback.
**(3) The dispatcher knows NO payload handler type.** Every rule carries its own executor
(`rule.handler.execute`, the same call the system's `fireEvent` makes), so a payload can be any
handler — edha or native, now or later. Hand-listing them would have been the name-keyed mistake
one level up.
**(4) Deity will be player-rolled** (Ben's ruling): one roll path, no `roll:` field. Their
hand-rolled "nothing spent" guarantee becomes a **`preUseItem` veto** (`requireTarget` /
`rangeColor`) — returning false cancels before cost *without* swallowing the card or the roll.
**(5) Converted:** Synchronized Assault, Set at Odds, Grand Deception (Leader), Turning Point
(Scholar) — deliberately the four whose payload is table-run, so the GATE gets benched before
anything mechanical rides on it. **2bD-3 (mis-target → nothing spent) is the row to run.**
⚑ **Two H1 modes are UNPROVEN:** `vs: skill` (engine rolls the foe) has no consumer yet — first
will be Green/Drive the Prey — and `edha-test-fail` fires no payload yet (first: Absolute
Authority's consolation Weakened).
**(6) The lesson for the remaining 135.** Three more conversion-time corrections (Sharp Eye, Field
Medicine, Tactical Ploy) were all **payload-side**: H1 gates them fine, but their payloads have no
handler. **"needs H1" is necessary, not sufficient** — §9k's `needs` column only ever recorded the
GATE. Expect the same on the deity trees: the test is H1, the Omen/Remain/Insight payload is H3.
Remaining 202 split **7 / 43 / 135 / 17**.
Previous: **2026-07-24k** (RULE-2b PASS C —
THE "MODIFY MY OWN NEXT TEST" FAMILY. ⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 212 → 206.** Six talents across **Agent, Leader and Scholar**, all one shape: *on use,
write a next-test flag on myself*. Four banked `oppCredit`, one banked `plotDieNext`, one banked
`nextTestMod` — every flag already had an engine consumer, so the family collapses into
**`edha-next-test-mod`** with three added fields (`target: self|target`, `plotDie`, `opportunity`).
**No new handler type.** `EDHA_OPP_ADDERS` and two bespoke `useItem` hooks are deleted.
**(1) Converted:** High Society Contacts, Underworld Contacts, Risky Behavior (Agent), Rumormonger,
Well Supplied (Leader), Overwhelm with Details (Scholar).
**(2) The formula now resolves against the OWNER at use.** Overwhelm with Details banks
`@skills.lor.mod` as a *number*; an unresolved `@`-ref would reach a pipeline that can't evaluate it.
**(3) ⚠️ The regression risk is the DEFAULT, not the new talents.** Five shipped rules already use
`edha-next-test-mod`; `target` defaults to `target`, so they are unchanged — but **checklist 2bC-7
(Emotional Overload still hits the TARGET) is the row to run even if you skip the rest.** A wrong
default would silently redirect every one of them onto the caster.
**(4) This is §9k's "names that are PARAMETERS, not dispatch" paying out.** `EDHA_OPP_ADDERS` was a
four-name `Set` gating one flag write; it died as data. **13 of the 18 talents converted so far were
bucket 1b** — that is where the cheap wins are, not bucket 1.
**(5) Third coupling correction: Resuscitation is bucket 2, not 1b** — its name lives in engine code
only inside *Field Medicine*'s card string, so it waits for H1. Same class as Practiced Kata /
Vigilant Stance in pass B. **Rule of thumb now stated in §9n: a talent whose only call site sits
inside ANOTHER talent's code cannot be converted alone.** Remaining 206 split **7 / 43 / 139 / 17**.
Previous: **2026-07-24j** (RULE-2b PASS B —
THE SIX WARRIOR STANCES COME OFF THE ENGINE. ⚠️ **PACK REBUILD + ⟳ Sync REQUIRED.**)
**Ratchet 218 → 212.** Step 1 of §9k's revised order: the readiest tree, zero new handlers.
**(1) Both name-keyed stance tables are DELETED.** `EDHA_STANCE_CHANGES` → ONE ActiveEffect per
talent flagged `edha-content.stanceRider`, `transfer: false`: it sits on the talent's **Effects
tab** where Ben edits the numbers, never applies by itself, and `edhaStanceRiderChanges` copies it
onto the stance marker at enter. `EDHA_STANCE_SKILL_ADV` → an `edha-test-rider` rule on the
talent's **Events tab** using three new fields, `mode` / `whenSkill` / `whileStanceActive`. The
bespoke `edhaStanceAdvPreRoll` hook is retired into the ONE existing pre-roll rider pipeline.
Nothing in the stance section knows a talent name any more; new stances wire themselves.
**(2) `mode` also unblocks Red.** §9i deferred **Frenzied Tempo** as 1b because `edha-test-rider`
had no advantage/disadvantage field. It does now — Frenzied Tempo is a data-only change whenever
its tree comes up.
**(3) ⚠️ A LATENT BUG SURFACED — stance skill advantage never worked.** `edhaStanceAdvPreRoll` set
`roll.options.advantageMode = 1`; the system's enum is the **string** `"advantage"`, and a DIALOG
roll overwrites `roll.options` from `data.skillTest` unless `configureDialog` is wrapped too — it
wasn't. So Flamestance/Ironstance/Windstance advantage was almost certainly dead at the table.
Fixed on the way through; **checklist 2bB-4 is the first time it will ever be seen working.**
**(4) Two stale "INDICATOR ONLY / Mechanics manual" effects removed** (Flamestance, Vigilant
Stance) — obsolete since 07-18g made the stance marker the indicator, and false for the half now
wired. Deleted from `data/talent-effects.json` (their real source), not just the overlay.
**(5) Two corrections to §9k, found by converting rather than reading** — the §9i discipline
working as intended. **Practiced Kata** is bucket 2, not 1b: `edha-combat-timing` is an EVENT with
zero consumers, so entering a stance on a trigger needs a small new handler (**H11**). **Vigilant
Stance** is coupled to it — its name lives in engine code only inside Practiced Kata's lookup — so
neither leaves the ratchet yet. Remaining 212 split **7 / 50 / 138 / 17**.
**Gates:** all green, incl. 4 new pinned `edhaStanceRiderChanges` cases (68 tests), mutation-checked
both ways. `lint-refs` caught three 15-char rule ids before they could be silently dropped — the
16-char DocumentIdField gotcha, working.
⚑ **Unverified:** no session can launch Foundry. **2bB-3** (edit a stance's number on the Effects
tab and see the marker change) proves the migration premise for `effects` the way 2bA-7 does for
`events`; **2bB-4** is the bug fix. Both are the ones to run first.
Previous: **2026-07-24i** (THE 2b
CLASSIFICATION, RE-DERIVED AGAINST THE FULL VOCABULARY — **docs + one checker script only, nothing
to deploy. CONVERTED NOTHING, BUILT NO HANDLERS, as asked.**)
**The split is 9 / 56 / 136 / 17.** Authoritative section: audit **§9k**. Per-talent record:
**`EDHA_RULE_2B_CLASSIFICATION.json`** (218 names, each with its bucket, the handlers it needs, and
a one-line reason read off its call site). `node scripts/check-2b-classification.js` recomputes the
split from that map and fails if any summary disagrees with it — the 07-24f split was published as
prose nothing could reproduce, and it stood wrong for six days.
**(1) Method — both 07-24f mistakes fixed.** Classified against **43 handlers / 27 events** (not
31/10), and from **527 call sites + the full body of all 132 functions reached from a name-bearing
line** — never from the tree-section header ledgers. Extraction reuses lint-refs pass 7's own
comment stripper so a header can't read as dispatch. This is the correction §9i demanded after
Red's "8 of 9 convertible" turned out to be 3.
**(2) H8 (`edha-watch`) SURVIVES — and it is the LARGEST demand (47 talents), not the proposal most
at risk.** 07-24h feared the system's native events made it unnecessary. Verified in
`systems/cosmere-rpg/index.js`: when a native event fires, the dispatcher resolves it to **one
document** and iterates **`actor.items`** — the items of the actor it happened **to**.
`apply-damage-actor` means "*I* was damaged", never "an ally was damaged". **Native events are as
owner-scoped as native handlers are.** The edha events run through the same dispatcher. So
*neither* system fans out to N observers, and that — not "no handler fires on engine events" — is
why 47 talents hand-roll `edhaCharacterOwnersOf()` sweeps.
**(3) H4 (`edha-use-gate`) DOES NOT SURVIVE — don't build it.** Every "nothing spent" precondition
at the call sites is talent-specific; the reusable parts are already covered by the existing trigger
gates, H3, and H1. Killing a proposal the code doesn't need was the point of the pass.
**(4) Two NEW proposals 07-24f missed.** **H10 `edha-focus`** (8 talents / 5 trees) — `edhaGainFocus`
/ `edhaDrainFocus` have **no handler at all**, so every focus talent is name-keyed by necessity.
**H9 `edha-die-step`** (Sovereignty, 5) — see the question below.
**(5) THE ORDER INVERTS. The six heroic paths are the READIEST trees (43–73%); §9f put them
sixth.** Heroic behaviour is overwhelmingly **lookup-table rows** (`EDHA_HEROIC_DEFTESTS`,
`EDHA_CAE_USE_GRANTS`, `EDHA_STANCE_CHANGES`, `EDHA_OPP_ADDERS`, the Draw Mana kinds) whose values
are *already* handler config objects — the cheapest conversion that exists, and the redundant
`edhaOwnsTalent` re-check evaporates for free. Same for the prompt-card family
(`edhaPostCalcTestCard` & co.), which is **already generic** and takes the talent name as a mere
label. **Warrior + Agent + Scholar (21 talents) convert with ZERO new handlers.**
**(6) Bucket 1 fell 61 → 9, and that is honest, not pessimistic.** Bucket 1 means *zero* engine
change; almost nothing clears it, because the name-keyed code nearly always bundles the payload
with a range gate, a cap, or a target filter. The number that decides the plan is **B1+B1b = 65
(30%) cheap**, against a bucket 2 that funnels into 9 handlers.
**(7) One correction to 07-24h's headline.** Reckless Momentum's Plot Die is **1b, not 1**:
`getChangeValue` returns `change.value` as a **string** in OVERRIDE mode, so a native `update-actor`
lands a string where `edhaGrantPlotDie` writes `{skill, source}`. The die still injects (truthy,
unskill-gated) but the consume card loses its source label — one engine tolerance line fixes it.
**Revised estimate: 17–22 sessions** (down from 19–24 despite one more handler — bucket 3 shrank
26 → 17, H4 isn't built, and table rows convert fast). Still dominated by bench-pass latency.
⚑ **2bA-9 IS STILL UNRUN, and it constrains this.** No authored talent has ever used a native
handler type. **Every bucket-1/1b call that leans on a native type is provisional on it** — exactly
three: Reckless Momentum, Risky Behavior, Resilient Hero's rest-clear half. The other 62 cheap
talents ride edha handlers proven in production, so the split does not hinge on it.
❓ **Ben, three batched questions in audit §9m** — H9 for one tree (recommend: build), `execute-macro`
Inline as a bucket-3 escape hatch (recommend: forbid), and confirming the inverted order.
Previous: **2026-07-24h** (⚠️ THE 2b
CLASSIFICATION MISSED THE SYSTEM'S OWN EVENT VOCABULARY — **docs only, nothing to deploy; but it
puts the 07-24f numbers and part of the 8-handler plan in question.**)
**Ben pointed at the live Foundry install: "I swear you're missing key things that currently
function — like plot die." He was right.** The 07-24f classification enumerated handlers by
grepping `source: "edha-content"` in the engine — i.e. **only the module's own 31 handlers and 10
events**. cosmere-rpg v2.1.0 registers its own event system underneath. **True vocabulary: 43
handler types (31 edha + 12 native) and 27 events (10 edha + 17 native).**
**(1) Native handlers**: `grant-items` · `remove-items` · `modify-attribute` · `set-attribute` ·
`modify-skill-rank` · `set-skill-rank` · `grant-expertises` · `remove-expertises` · `use-item` ·
`update-item` · **`update-actor`** · **`execute-macro`**.
**Native events**: `create` · `update` · `delete` · `add-to-actor` · `remove-from-actor` · `equip` ·
`unequip` · `use` · **`mode-activate`** · **`mode-deactivate`** · `goal-complete` · `goal-progress` ·
**`update-actor`** · **`apply-damage-actor`** · **`apply-injury-actor`** · `short-rest-actor` ·
**`long-rest-actor`**.
**(2) Ben's example lands exactly on this.** `update-actor` (Target `parent`, free-form `Changes`)
can write any field or flag on the owner from a rule. **Reckless Momentum**'s Plot Die — which
07-24g called "no handler does that" — is a native `update-actor` writing
`flags.edha-content.plotDieNext`, consumed by the engine's EXISTING `edhaPlotDiePreRoll`.
Expressible now, no new handler.
**(3) The native events replace hand-rolled watchers**: `apply-damage-actor` = Breaking Point's
class; `update-actor` = the focus-watcher class; `long-rest-actor` = Resilient Hero; `mode-activate`
/`mode-deactivate` = the STANCE machine. **H8 (`edha-watch`, 18 talents) is the proposal most at
risk of being unnecessary** — its whole justification was "no handler fires on engine-detected
events", and that was false.
**(4) The limit that keeps the rest standing.** `update-actor`'s Target is `parent` or a fixed
`global` UUID — there is **no "current user target"**. Native handlers cover **self/owner state
writes**; edha-* handlers cover **targeting** (they read `game.user.targets`). That is the real
dividing line and 07-24f did not draw it at all.
**(5) STATUS: do not quote the 61/16/118/26 split.** Bucket 2 is overstated by an unknown amount.
Re-deriving means re-checking all 221 against 43 handlers instead of 31 — a session's work that
should happen BEFORE any handler is built, since it may delete whole proposals. Full detail:
audit **§9j**.
**(6) `execute-macro` supports `Inline`** — a rule can carry macro code on the document, i.e. a
document-resident escape hatch for bucket 3. Real design question (satisfies "editable in Foundry"
but puts unlinted code in a text field) — **Ben's call, not assumed.**
**(7) Two blockers closed by the same read.** **CAE's api is not "uncaptured" — there isn't one**:
v1.3.1 exposes no api object; the interface is the combatant flags `actionsAvailable` /
`reactionsAvailable`, which `edhaCaeGrant` already writes. §9j #1b can drop its "GATED on the api
capture" clause. And **there is no live-module drift** — Ben's `register-skills.js` is
byte-identical to repo `3438c0b` apart from line endings, so the pass A deploy is a clean
fast-forward.
⚑ **Unverified and it matters:** no authored talent has EVER used a native handler type. Checklist
row **2bA-9** is a zero-risk probe — read the handler/event dropdowns in any Events tab and report
what's listed. That one check decides how much of the 8-handler plan is needed at all.
Previous: **2026-07-24g** (RULE-2b PASS A —
RED: THE FIRST THREE TALENTS COME OFF THE ENGINE. ⚠️ **PACK REBUILD + ⟳ Sync REQUIRED** — this is
the first change that moves behaviour onto documents, so nothing takes effect until you rebuild.)
**Ratchet: 221 → 218.** `scripts/name-keyed-allowlist.json` shrank for the first time.
**(1) Converted — behaviour now lives on the talent, visible and editable on its Events tab.**
`Emotional Overload` → `edha-next-test-mod` (disadvantage, count 1). `Reckless Gambit` → TWO rules,
`edha-next-test-mod` (advantage) + `edha-apply-status` (exhausted). Both ride the SAME nextTestMod
pipeline the old `useItem` switch used, so table behaviour should be unchanged — the difference is
that the rules are now *visible*, editable, and survive a rename. `Shockwave Slam` was already
document-driven; its name survived only in a schema hint and a default, both now gone.
**(2) A latent bug the migration surfaced.** `edha-push`'s `note` field shipped
`initial: "Shockwave Slam"` — a talent-specific default on a GENERIC handler, so any new push rule
authored in Foundry came out labelled as a different talent. Every shipped consumer had silently
overridden it (verified: all four). Now blank; `edhaRunPush` falls back to "Push". No card text
changes anywhere.
**(3) The ratchet earned its keep on day one.** Removing `Shockwave Slam` from the allowlist made
lint pass 7 FAIL, correctly, on those two leftover string literals — a name I would otherwise have
called migrated while the engine still mentioned it. The gate found both.
**(4) ⚠️ A CORRECTION to the 07-24f classification.** §9e claimed Red was "89% data-ready, 8 of 9
with no new engine work". Reading every call site properly — which converting the tree forced —
only **3** were convertible. Of the 7 Red talents called bucket 1, 3 held. **Treat the headline
"61 expressible now" as an UPPER BOUND**; true bucket 1 is likely 30–40, the rest sliding to 1b/2.
The eight handler proposals are unchanged and that is the load-bearing part — this shifts which
talents wait on a handler, not how many handlers exist. Full table + what moved: audit **§9i**.
**(5) §7 q1 RESOLVED — YES** (Ben): every ENGINE-OWNED talent carries a cue rule that at minimum
posts a card, plus its `ENGINE_OWNED: <reason>` header line. ~26 rules, folded into the nearest
rebuild. An empty Events tab is indistinguishable from a broken talent, which is the symptom that
started the audit — the exit must never look like the bug.
**Deferred from Red, with reasons:** `Frenzied Tempo` (needs a `mode` field on `edha-test-rider` —
a hot pre-roll path, batched with the other 1b fields rather than scattered), `Red Leyline
Attunement`, `Reckless Momentum` (grants a Plot Die — no handler does that), `Shatter Focus`
(cross-actor focus drain + the Chaos omen half), `Incite` (takes the new cue rule), `Breaking Point`
(needs `edha-watch`/H8).
Previous: **2026-07-24f** (THE RULE-2b
CLASSIFICATION — **analysis only: one doc section. NO engine change, NO data change, NO pack
rebuild, nothing to deploy, nothing for Ben to re-test.**
All **221** names on the ratchet list classified against the engine's 31 registered handler types
and 10 event types — the number §6 of `EDHA_EDITABILITY_AUDIT.md` asked for before committing to
the migration. Full result, per-tree table and handler proposals: **`EDHA_EDITABILITY_AUDIT.md` §9**.
**The split: 61 expressible now · 16 need one schema field · 118 need a new generic handler · 26
genuinely ENGINE-OWNED.**
**(1) 118 is not 118 designs — it is 8.** The same eight shapes repeat across fifteen trees; 46 of
the 118 are a single shape (roll the talent's test, gate it on the target's defense or an
engine-rolled opposed skill). The proposed handlers, by consumer count: `edha-def-test` (46
talents / 15 trees), `edha-owner-list` (24/11), `edha-watch` (18/8), `edha-aura` (17/7),
`edha-zone` (15/6), `edha-prompt-pick` (15/9), `edha-cae-grant` (10/1), `edha-use-gate` (8/5).
**(2) Bucket 3 is NOT an exit from the ratchet.** Lint pass 7 scans for any tree-talent name as a
quoted literal in comment-stripped code, so an ENGINE-OWNED talent still fails the gate while its
name sits in a switch or lookup table. Those 26 must ALSO move to marker-rule dispatch — cheaper
than a full data expression, not free. CLAUDE.md 2b already said this ("an exit still keeps the
name out of engine code"); it is easy to read past, and it moves the estimate.
**(3) The audit's suggested first batch is the wrong one, and the measurement is why.** §6 nominates
Chaos / Fate / Sovereignty; they score 0%, 11%, 11% data-ready — the three LEAST ready trees.
Their "no partial state to reconcile" argument still holds, but every talent in them waits on a
handler that does not exist, so session 1 would ship nothing. **Red** is what §6 was reaching for:
9 name-keyed talents, 8 convertible with no new engine work, 0 bucket 3, one deploy. Proposed
order in §9f puts Red first as the pipeline pipe-cleaner, then Chaos immediately after H1 is built
— Chaos is still the best *showcase* for H1 (7 of its 8 talents are that one shape), just one step
later than §6 assumed.
**(4) The owner-scan inversion folds into the handlers — it is not a separate refactor.** (Corrected
same day, Ben's question; the first write-up called it the plan's highest risk.) 51 call sites over
38 names use `edhaOwnersOf("<talent name>")`, but `edhaDarkVeilSweep` (~L6885) already walks tokens
→ talents → `edhaEventRules` → `handler.type` with no name literal at all. Writing `edha-aura` /
`edha-watch` correctly IS the inversion. Residuals: one memoized index (Shield Wall / Devoted
Conduit run per damage application, ~L902/911) and a `scope` field to preserve the deliberate
per-consumer adversary widening (rulings 113/107). **And it removes a cost:** 113 of the name
literals are `edhaOwnsTalent(actor, "X")` gates, which evaporate for free — once behaviour is on
the document, the rule being present IS the ownership test.
**(5) Estimate: 19–24 sessions** (§9g). Two things move it more than anything else: whether every
ENGINE-OWNED talent needs a cue rule (audit §7 question 1, still unanswered — Ben's call), and
bench-pass latency, since no session can verify a converted talent and there are ~16 batches.
⚑ The handler designs in §9c are paper designs; `edha-def-test` should almost certainly WRAP the
existing contest queue (`edhaQueueContest`) rather than duplicate it — scrutinise that first.
Previous: **2026-07-24e** (THE 2b RATCHET GROWS TEETH + THE
DESIGN SKILLS COME INTO THE REPO — **repo-side only: lint, docs, skills. NO engine change, NO data
change, NO pack rebuild, nothing to deploy.**
**(1) `lint-refs.js` PASS 7 — iron rule 2b is now ENFORCED, not aspirational.** The 221 talent
names the engine mentioned in CODE on 2026-07-24 are frozen in NEW
`scripts/name-keyed-allowlist.json`, and the pass fails in BOTH directions: a talent name in
engine code that is **not** listed (the list may not grow) **and** a listed name that is no longer
in the engine (delete the line — the list must not become fiction). That second direction is the
one that makes it a real ratchet: every migration commit is now forced to shrink the list, and the
error names exactly which lines to delete. **Mutation-checked both ways** (a fabricated
`item.name === "Fatal Thrust"` fails; removing `"Reknit Form"` from the engine fails until its
line goes).
Two scoping decisions that took a wrong turn first and are worth recording: **comments are
stripped before scanning** — the engine's tree-section headers list talents by name ON PURPOSE
(that IS the iron-rule-3 ledger) and must not read as violations; and **adversary bespoke
abilities are OUT OF SCOPE** — the first run flagged six (Fire the Wrack, Herding Antlers, Suture
Cradle, The Seeming, Thorn Hedge, Vital Diagram) because `lint-refs` deliberately folds
`data/adversaries.json` item names into its talent universe for pass 3. Rule 2b governs the
talents Ben edits in the trees; an adversary ability is a different surface with its own wiring
standard (pass 5), where engine name-keyed automation is legitimate. Pass 7 now uses a
`treeTalentNames` snapshot taken BEFORE the adversary names join.
**(2) 221 vs 200** — a few talents carry document behaviour AND a name-keyed branch, and the list
counts NAMES IN CODE, which is what 2b actually forbids. Both numbers are right; they measure
different things.
**(3) THE FIVE GAME-DESIGN SKILLS ARE NOW IN THE REPO.** `leyline-revision-guide`,
`deity-revision-guide`, `talent-balance`, `phrasing-verifier`, `cosmere-canon-reference` lived
ONLY in Ben's user-level `~/.claude/skills/` — invisible to a fresh clone, to CI, and to
CLAUDE.md's map, while `source-materials/legacy-uploads/` held **stale copies of two of them whose
content had DIVERGED**. So the repo contained outdated duplicates of instructions whose live
versions it could not see. All five copied in; the two legacy copies now carry a SUPERSEDED banner
pointing at `.claude/skills/`, and `source-materials/README.md` says so too. CLAUDE.md's doc map
gains a row drawing the line that matters: **design question → these five; wiring question →
`leyline-tree-authoring`.**
**(4) CLAUDE.md "Where behavior lives"** no longer says "All name-based automation lives here" —
that sentence is how the backlog grew. It now names the 200 as the 2b backlog and points at the
gate.
Gates green (64 tests, validate 0/0, lint clean incl. the new pass 7, dashboard rebuilt).)
Prior: **2026-07-24d** (GENTLE PASSAGE LAID TO REST —
**DATA → `deploy-to-foundry.bat` + relaunch + ⟳ Sync**, one talent. Ben ruled: do the one-word
swap. `Risen Servant`'s Prerequisites "Bone Garden or **Gentle Passage**" →
"Bone Garden or **Speak with the Fallen**", matching its two drawn parents. Verified: A/B build
keyed on docId changes **exactly one document**, Death/Risen Servant; validate 0 errors 0 warnings.
**What Gentle Passage was**, since it is worth recording before the legacy file rots: the
pre-rewrite Morrath tree had TEN talents, and *Death's Threshold → Gentle Passage → Compost /
Natural Conclusion* was the Green-side **merciful-death** branch — Gentle Passage removed an Injury
and put a willing or unconscious creature into restful sleep, waking with [Die] + Awareness HP
(*"Rest now. The cycle will carry you."*). All four were cut when the tree was rebuilt around
Harvested Remains (Reaper's Harvest / Bone Garden / Risen Servant took their place); only the NAME
survived, stranded in a prereq string nobody swept. **Design note for whoever revisits Morrath: the
rewrite dropped Death's gentle half entirely** — nine talents, every one harvest/undeath. If that
thematic half is ever wanted back, this is where it lived.
**Sweep closed:** every remaining unresolved prereq token in the 21 shipped trees is now
*deliberate* narrative prose ("Patron in high society", "Access to a Shardblade", "Title granting
you command of 5+ people"), which the build correctly renders as `connection`-type prereqs
carrying their text. Radiant orders in `cosmere.json` still carry many, but `isLoadedByApp`
excludes them from the build — they ship nothing.
Gates green (64 tests, validate 0/0, dashboard + primer rebuilt).)
Prior: **2026-07-24c** (SILENTLY-DEAD PREREQUISITES —
**DATA + build change → `deploy-to-foundry.bat` + relaunch + ⟳ Sync.** Ben ruled on the two 24b
open items: Red's card change stands, and Razkael gets fixed. Fixing Razkael prompted a sweep of
EVERY prerequisite token that resolves to nothing, which turned up a whole family.
**(1) RAZKAEL, per Ben.** `Cascading Failure` "Pinpoint Charge or Walking Ruin" →
**"Pinpoint Charge or Concussive Yield"**; `Fault Line` "Concussive Yield or Combustion Chain" →
**"Walking Ruin or Combustion Chain"**. Both cards named a talent on the OPPOSITE side of the tree
from their drawn edges, so each node silently required more than its card said. `validate.js` now
reports **0 warnings**.
**(2) THE FAMILY BEHIND IT.** A prereq token that matches no talent, skill or attribute is
classified "narrative" and quietly dropped — the card reads fine and enforces nothing. Three more
shipped instances, one per failure mode, all now fixed: **Scholar/Know Your Moment**
("Mind and Body; Deduction 2+" — see 3), **Leader/Resolute Stand** ("Athletics **+1**", rank
written backwards, requirement dropped → "Athletics 1+"), **Warrior/Shattering Blow**
("Windstance**:** Perception 2+", a colon where a semicolon belongs, so BOTH halves were dropped →
"Windstance; Perception 2+"). Plus the cosmetic **Hunter/Animal Bond** "Animal compainion" typo,
which printed on the card. Radiant orders in `cosmere.json` carry many unresolved tokens too, but
`isLoadedByApp` excludes them from the build — out of scope, they ship nothing.
**(3) THE PARSER BUG, fixed in code not data.** `prereqGroups` split on the ENGLISH WORD "and",
so Scholar's talent **"Mind and Body"** was torn into "Mind" + "Body" — neither resolves, both
dropped, and Know Your Moment demanded only Deduction 2+. **Any talent whose name contains " and "
or " or " was unreferenceable as a prerequisite.** Fix: `prereqGroups` now takes an optional
name-resolver and tries a whole fragment as a talent name BEFORE splitting it further, at each
level; without a resolver its behaviour is byte-identical to before. Extracted to NEW
`scripts/foundry-build-parts.js` — `foundry-build.js` cannot be `require()`d (classic-level at
load + a top-level async IIFE), so anything worth unit-testing has to live in a module the
generator imports, never a copy that can drift.
**(4) VERIFICATION.** A/B build keyed on **docId** (NOT name — 28 names collide across trees, and
keying by name made the first diff report 26 phantom changes by comparing White/Hardy against
Black/Hardy; the collision gotcha bites tooling too, not just prereq resolution) shows **exactly 6
prerequisite changes and nothing else moved**. The parts-extraction is behaviourally identical to
the inline version (all three packs byte-compared with `_stats` build timestamps stripped).
`narrative` prereqs 13 → 9, `skillPrereqs` 243 → 245.
**(5) GATED.** `tests/pipeline.test.js` gains two cases: the parser (a name containing " and "
survives; no-resolver behaviour preserved; ordinary AND/OR splitting untouched) and a data check
that fails any shipped prereq using `+N` rank order or a `:` separator. 64 tests green.
**Still open for Ben:** `Gentle Passage` — now traced. It is a **ghost from the pre-rewrite Death
tree**, alive only in `source-materials/legacy-uploads/domain.json`, where Morrath had ten talents
and Death's Threshold / Gentle Passage / Compost / Natural Conclusion were the Green-side
"merciful death" branch. All four were cut when the tree was rewritten around Harvested Remains
(Reaper's Harvest / Bone Garden / Risen Servant replaced them), but the NAME was never swept out
of Risen Servant's prereq string. Awaiting Ben's replacement term; the drawn graph says
`Speak with the Fallen`.
Gates green (64 tests, validate 0 errors 0 warnings, dashboard + primer rebuilt).)
Prior: **2026-07-24b** (THE UNPLAYABLE-TREES FIX + IRON
RULE 2 SPLIT — **DATA + build-script change → `deploy-to-foundry.bat` + relaunch + ⟳ Sync.** Three
prerequisite CYCLES and one build-time behaviour-wipe, all shipped, all invisible to every gate.
**(1) THE SESSION-0 BLOCKER, root-caused.** A player could not pick a Green talent because
`Predator's Instinct` and `Pack Hunter` each listed the other in `connections` — and every
connection becomes a **managed talent prerequisite**, so neither could ever be taken and Green's
**entire 8-talent Instinct column** was dead. **Red carried the identical bug** (`Burning Drive` ↔
`Reckless Advance`, another 8 talents — the whole Momentum branch), unreported only because nobody
had played Red that deep. Both were live for the whole tracked history. Fixes came from the
LAYOUT, which is unambiguous: Green's `Pack Hunter` sits alone at y=0.2 and is skill-gated
("Green 1+"), so it is the branch root — its connection to its own child was simply wrong
(cleared). Red's `Reckless Advance` sits at y=0.2 with both children's connections already
pointing at it, so its *card* was the odd one out ("Burning Drive" → **"Red 1+"**). ⚑ Red's is the
one judgment call in the pass — geometry + connections (2 signals) beat prose (1) — checklist row
asks Ben to eyeball it.
**(2) A THIRD CYCLE, found by the new gate the moment it ran:** Death's `Risen Servant` ↔ `Speak
with the Fallen`. Missed by the hand audit because that scan grouped rows by `path` and
`domain.json` keys trees by `Deity`, so all ten deity trees silently fell out of it. Same inverted
prose (`Speak with the Fallen` demanded a talent drawn *below* it); fixed to `Reaper's Harvest`.
Not table-blocking — an OR-branch through Bone Garden kept everything reachable — but a real
contradiction. **All 21 built trees now verify fully walkable, 0 unreachable nodes.**
**(3) NEW GATE — `validateTreeGraph` in `validate.js` (iron rule 7).** Mirrors how
`foundry-build.js` derives prereqs (connections = ONE OR-group, each prose group = another, AND
across groups), then fails on a cycle (reporting the actual loop path) or any node unreachable
from a prereq-free root. Also warns when prose and `connections` name different parents and
neither implies the other — deliberately silent when the extra parent is an ancestor, since owning
the child implies owning it. The old `validateConnections` only ever checked that a connection
*name resolved*; it could not have caught any of this.
**(4) THE OVERLAY WIPE, fixed.** `applyAuthorable` wrote any authored key that was not
`null`/`undefined` — and `"events": {}` PASSES that test. Since `authorable()` stamps an empty
`events` on every talent that had no rules at extract time, those stale empty snapshots were
overwriting rules the generator had since learned to emit from the side tables. **10 talents
shipped with blank tabs because of it**: Guardian Stance, Thorn Field, Shoulder the Oath, Lay
Foundation, Death Ward, Necrotic Cascade, Set Charge, Fault Line, Warlord's Advance, Investiture
of Command. Fix = an empty object/array is treated as "never authored", never as "clear this".
**A/B build proves it: 10 recovered, 0 lost** — document-carrying talents 80 → 90.
**(5) `edha-pack-io.js` now resolves `classic-level` LAZILY.** It used to resolve at module load,
so the pure helpers could not be imported anywhere the native dep was missing — including CI's
`node tests/run.js`. That is precisely why the wipe had no regression case. Only `readPack` needs
it; it now resolves at first use.
**(6) NEW `tests/pipeline.test.js`** — 7 cases pinning the overlay semantics (empty never wipes,
populated still wins) and the tree graph (all trees walkable, no cycles, the three historic pairs
by name). **Mutation-checked**: reintroducing the old `!== null` test fails 1 case; reintroducing
Green's cycle fails 3 and produces both validate.js errors. 62 tests green.
**(7) IRON RULE 2 SPLIT into 2a/2b (Ben's decision this session).** The old rule forbade a *second
engine file* and said nothing about where behaviour LIVES — which is how 200 talents drifted onto
name-keyed dispatch without ever violating it. **2a** = one engine, no side-engines (unchanged
meaning; every existing "iron rule 2" citation means 2a). **2b** = behaviour belongs on the
talent, not on its name: `system.events`/`effects` so the Foundry tabs are real, with two DECLARED
exits (ENGINE-OWNED for genuinely inexpressible mechanics, MANUAL for no-hook) and a **ratchet
clause** — the 200 are a backlog whose count may only go DOWN. `leyline-tree-authoring/SKILL.md`,
which taught the opposite ("All *name-based* automation lives here"), now teaches 2b and explains
that "side-engine" never meant "code instead of data".
**(8) NEW `EDHA_EDITABILITY_AUDIT.md`** — scoped input doc for the migration: the terminology
table (hook vs engine vs name-keyed vs document-driven), the per-tree 90/200/75 split, how the
06-09 refactor came to be reversed, what is already fixed, and **the first job: classify all 200
into expressible-now / needs-a-new-generic-handler / genuinely-engine-owned and report the split
BEFORE converting anything.** Retire it into §9 when the migration closes.
**Open for Ben, not decided here:** Razkael's `Cascading Failure` / `Fault Line` cards name a
talent on the opposite side of the tree from their drawn edges (not blocking — everything is
takeable — so left alone; `validate.js` warns on both), and **`Gentle Passage`**, named in Risen
Servant's prose prereq, matches no talent in any atlas and is silently dropped by the build.
Gates green (62 tests, validate 0 errors / 2 warnings, dashboard rebuilt).)
Prior: **2026-07-24** (THE FALSE-RULES CORRECTION — docs
only, NO engine change, NO data change, nothing to deploy. A full-repo audit measured the shipped
packs against every statement the docs make as a hard rule; the statements that were **objectively
false** are now corrected in place, with the measurement that disproves them.
**(1) §7 / §8 — the 06-09 "behaviour lives ON the talents" refactor was silently reversed.**
Measured from a real all-scope build (365 talents): **80 on the document, 210 name-keyed in the
engine, 75 neither**; 222 of 338 distinct talent names are hardcoded string literals in
`register-skills.js` (549 occurrences). The refactor held for the trees that existed on 06-09;
every tree wired after it — all ten deity trees (06-17 → 07-03) and the heroic pass (07-18h) —
went name-keyed, and `leyline-tree-authoring/SKILL.md` then codified that as the standard. Two
docs have contradicted each other since, both stated as settled, with no gate on the axis. New
**§7.-1** carries the correction and the table; §7.0 is retained as historical record; the
cold-start header no longer claims DONE. This is the requirement behind Ben's "everything should
be editable inside Foundry" — a name-keyed talent shows **empty Events/Effects tabs**, editing
them does nothing, and renaming it silently unwires it.
**(2) §8 counts re-measured:** adversaries were listed as 9 actors/30 items, actual **52 actors /
336 embedded items**; edha-items (113 docs) was missing entirely; the "coverage grows tree-by-tree"
claim was the opposite of what happened.
**(3) NEW §8 entry — a live overlay bug, found and proven, not yet fixed:** `applyAuthorable`
writes any authored key that is not `null`/`undefined`, and most authored entries carry
`"events": {}`, which passes that test and **overwrites the generator's rules**. An A/B build
(overlay on vs. off) names the **10 talents** whose working side-table behaviour never reaches the
pack — Guardian Stance, Thorn Field, Shoulder the Oath, Lay Foundation, Death Ward, Necrotic
Cascade, Set Charge, Fault Line, Warlord's Advance, Investiture of Command.
**(4) `AUTHORING_WORKFLOW.md` — the extract guard's blind spot documented.** "Can't happen
silently" is true only for the six authorable fields: `fingerprint()` is computed from that
projection, so a **prerequisite** edited in Foundry does not change it, the build does not abort,
and the edit is overwritten without a word. Exactly the session-0 case.
**(5) NEW IRON RULE 7 — a tree must be walkable: acyclic graph, every talent reachable.** Two
mutual-connection cycles were live for the whole tracked history — Green's `Predator's Instinct` ↔
`Pack Hunter` and Red's `Burning Drive` ↔ `Reckless Advance` — taking **16 talents** (Green's
entire Instinct column, Red's entire Momentum branch) permanently out of play. A player hit the
Green one at session 0. **All six gates passed the whole time**: `validateConnections` checks only
that a connection name resolves inside its tree, never what the edges add up to. ⚑ The rule ships
UNGATED — the cycle/reachability check in `validate.js` is the open follow-up.
**(6) Iron rule 4 vs CI reconciled.** The rule listed 6 commands; CI runs 11. Added the three
generated-doc `--check` gates to the rule and to `npm run gates` (new `npm run docs`), and
documented the two CI-only gates (`lint_map.py` needs Pillow; the scratch pack build needs
`classic-level`) so a green local run stops implying a green CI. README's list matched to the same
set, with copy-paste commands for the two extras.
**(7) Stale pointers repaired:** "DEPLOY FIRST" → **DEPLOY STATE** (renamed 07-16d; was stale in
`CLAUDE.md`, `test-pass-fixes/SKILL.md`, `CASE_STUDIES.md`); `EDHA_FOUNDRY_TEST_SHEET.html` →
`EDHA_DASHBOARD.html` (deleted 07-18; was stale in the skill's frontmatter, Phase 0, and Phase 7);
the §10 CRLF gotcha re-pointed from the retired `build-test-sheet.js` to the three live generators,
with the forward-looking rule that any new generator must LF-normalize at the read. Historical
delta text was left alone — it correctly records what was true when written.
**(8) DEPLOY STATE flagged stale**, not rewritten: it was last advanced 07-18 while the newest
delta is 07-23c, and only Ben can advance it. It now carries a ⚑ banner saying a DEPLOY STATE
older than the newest delta is a question for Ben, not evidence — and `test-pass-fixes` Phase 1
says the same.
**Not touched, pending Ben's decision:** the Iron rule 2 rewrite (the rule forbids a *second
engine file* and has never said anything about behaviour *location*, which is why 210 talents
drifted without violating it) and the 210-talent migration. Gates green; dashboard rebuilt.)
Prior: **2026-07-23c** (PLAYER-PRIMER FULL LORE REFRESH — docs only, NO engine
change, nothing to deploy. All ten `EDHA_PLAYER_PRIMER.md` nation sections expanded from
one-paragraph digests to full player-safe lore (culture + geography + folk-bestiary +
character hooks), lifted from canon §5a–§5d nation-by-nation with a GM-boundary check on
every draft — the Fetch, sealed/missing gods, the Investiture drain, the Black Altar's
nature, Goldenport's Luck-cause, the Order nexus, Vorsk's coup, **Olvarra/the Lantern**, and
Ashkar's banished-god collapse all held out. NEW **ruling — no crisis timeline in player
text** (Ben): sparse "points of light" populations (r161a) can't date or globalize the
collapse, so the "~two years / everywhere / all at once" framing is scrubbed from every
player-facing doc and written into the primer's GM note (⚑ log in canon §9 next canon pass).
Firm water names only in the handout (Palewater, Lake Morrain, Lake Vespera, Kaelmere).
**PC-1 declared** — a Lunavar pool-priest who breached a moon-pool and surfaced with
knowledge they can't yet name (**GM: Olvarra** signalling through the jammed channel, rulings
64–66) — recorded in `EDHA_CAMPAIGN_STATE.md` §1 (truth) + §2 (KNOW/SUSPECT), thread #4
elevated to PC-1's spine, and Lunavar tailored with player-safe "reader who enters the water"
folklore that seeds the mystery without naming it. Player map re-rendered (`render_player.py`)
from the current base + newest gazetteer; primer + dashboard rebuilt; map lint 0 errors, all
sync gates green. Tributary painting pass still pending on the base PNG.) Prior: **2026-07-23b** (THE
CONTINENTAL HYDROLOGY PASS — **ruling 162**; docs/gazetteer/tooling only, NO engine
change, nothing to deploy. Ben's H1–H9 brief walked into a full continental water
layer: gazetteer now carries **15 `lakes[]`** (seed-grown shores; Lake Morrain +
Lake Vespera named, 13 ⚑), **11 `basins[]`** (geodesic partitions, divides
SCHEMATIC — two eastern marine outlets confirmed as drawn: the Palewater at city-22
+ the Great-Lake drain to the sea AT Aldercourt past city-13), and **28 waterway
entries/upserts**, every one flow-directed, mouth-anchored, `_basis`-noted
(canonical Palewater/western-tributary polylines byte-untouched). Painted trunks
traced (the Lake-Tree stem 721 km through Kenmere; the Aldercourt drain 633 km —
audit S8 closed, navigability still Q-C1's; Vorsk's west river to c11; Moonmere's
outlet; Raskeld's chain outflow; the Fenholt delta dashes), derived courses ship
`painted:false` on the NEW **hydro guide overlay** (`hydro_overlay.py` →
`hydro-overlay.png` + review composite) — headliners: Canticle's five ⚑ rainroads
w/ waterhole chains + 7 pan-rim springs (H8), Morrain's Thalendor forest feeder
(gate B default, Ben-authorized), the SW-lake drain + its F7 inflows, Vespera's
range feeders. NEW `trace_hydrology.py` (CONFIG-driven, report/--update);
**`lint_map.py` hydrology section** enforces the laws (mouth anchoring, ONE outlet
per lake, inflows, DAG termination, basin cross-refs; water-town resolution warns
as audit-S3 class until the refinement re-run — 242 currently). Method written into
region-forge SKILL.md as **Phase 3C**. Gate D verified: the 07-20 .procreate drop
changed nation washes only (commit b114f7e: Cities/Rivers pixel-identical) — the
rivers extract is current. **Three NEW forks ⚑ batched for Ben, defaults live: F1**
SW-lake drain = independent inlet mouth (alt: via Moonmere's lake); **F2** Ashkar
chain connectors = surface seasonal streams (alt: karst/underground); **F3** the
Ashhold tarn = closed pocket (alt: seasonal sink). **NEXT = the settlement
refinement** (audit S1–S9 + sections C/M/L/G/N/V/K/A/S walked by section — water
towns now have true rivers to snap to). Nothing for the Foundry bench.) Prior: **2026-07-23a** (TEN-NATION
SETTLEMENT AUDIT — docs only, NO engine change, nothing to deploy. Ten parallel
subagents audited the r161 layer nation-by-nation → NEW **`EDHA_SETTLEMENT_AUDIT.md`**
(findings + 63 gated questions with defaults; PROPOSALS ONLY, nothing canon until Ben
walks the sections). Systemic generator findings S1–S9 cleared as mechanical fixes for
the refinement run (headliners: polygon-seam phantom coasts — Canticle's 39-town strip,
Vorsk/Thalendor fake water towns; Goldenport's 4 ribbon cities in NO polygon = the four
old lint warnings; water towns never touching water by construction; undirectional fort
placement inverting five nations' threat maps; zero cross-border trade demand in the
road graphs; no resource layer under specialty towns). Every driver-mix dial survived
audit except Vorsk's (re-dial proposed 20/10/30/5/35); clean passes: the wild corridor,
the barge chain, Lunavar's rice artery, Vorsk's ore road. Ashkar + Sylvaneth walk
agendas prepared (Q-A1–8: derive-then-decimate survivor model ~55–60k; Q-S1–8: woven-
geography forks, no-population ruling, the Strand siting). **Thalendor's section is
ANSWERED** (T1 c33 = the Heartholt↔SW-lake hub, road to the lake; T2 watch-forts + the
method principle "a dot's driver is its purpose, not its terrain"; T3 the Black Altar
Crossing = an ancient BRIDGE to Canticle kept by traders-turned-bridge-keepers — Ben's
own canon; T4/T5 defaults) and **T6 pivoted the whole line: CONTINENTAL HYDROLOGY
derives before the settlement refinement.** Ben's H1–H9 topography answers are recorded
as the audit doc's hydrology brief — headliners: **Lake Morrain named** (Elmsworth's
lake, feeds the Palewater — a W30 item closed), the Lake-Tree→Great-Lake→ocean second
eastern system whose drain river IS the Malcurr/Corvaine north border, Vespera closed
(Issyk-Kul analogue), Canticle rim = Australian arid-coast hydrology, the two-source
weather model. Two open flags gate the hydrology session (the Aldercourt river
contradiction; the Morrain/Lake-Tree painted-vs-ruled divide). **NEXT SESSION = the
hydrology pass** (prompt handed to Ben; audit doc = its input; the settlement
refinement and question sections C/M/L/G/N/V/K/A/S queue behind it). Shape-tier render
landed (circle/square/triangle/diamond = pop bands); the reviewed world composite is
tracked at `source-materials/maps/world-settlement-final-composite.jpg` and the
audit-review composite (city ids, cited towns, Q-pins, derived roads) beside it.) Prior:
**2026-07-22k** (WORLD
SETTLEMENT + THE POPULATION RE-DERIVATION — **rulings 158–161**, docs/gazetteer/skills/
tooling only, NO engine change, NO pack change, nothing to deploy. The arc: region draft 4
(**158** — west-bank truth: the export predates the r153 narrowing, so the generator derives
the true channel from the drawn west bank and the in-frame counts from area÷density; ferry
px re-synced) → **159** derived-beats-prose made a GLOBAL method ruling → **160** the
six-nation settlement-dial batch (Ben-approved table; ashkar/sylvaneth deferred) + NEW
`world_settlement.py` ran the r157 pipeline continent-wide (~1,240 towns, region towns as
fixed seeds, junction bridges over minor water) → Ben's sum-check exposed the population
model, an audit subagent traced r26/27/85's land-budget method and found **80/km² =
ceiling-not-midpoint, livestock as a never-constraining residual, a cross-check that
cannot fail, 100% famine convertibility treating grass as bread** → **161**: method
RETIRED; lore-forge Phase 4b rebuilt (demand-side ledger with named livestock dials,
anchor bands, settlement-reconciliation + continental-saturation gates); **the saturation
ruling = frontier/points-of-light** (mapped layer ~complete, ~10% hamlets, ~0.7/km²);
populations re-derived BOTTOM-UP: **continent ~5.68M (was ~83M)** — Thalendor 729k,
Corvaine 1.61M, Goldenport 1.47M, Lunavar 649k, Malcurr 570k, Canticle 514k, Vorsk 121k,
Kettavar 27k; per-town pops rank-size 2–10k, ledgers close EXACTLY
(`meta.population_ledgers`, NEW `settle_gazetteer.py`); **the famine flip: Thalendor is
starving NOW** (~40% caloric deficit at the 42.5% yield; the Mage's alchemy is the dam) —
§6 table updated, everything else old-figure = superseded-pending-sweep = **W32**. Also:
gazetteer `market_towns` rebuilt (1,240 rows, driver+pop tagged), region+world overlays
tracked in source-materials/maps/ (the world overlay is NEW `render_settlements.py`'s
canon render — dot size = population tier, halo = nation's biggest town; re-run after
any gazetteer settlement change), ⚑ Ben: city totals for the six non-walked nations are
provisional; W30 naming queue now sits atop a much larger unnamed layer.) Prior:
**2026-07-22j** (REGION-FORGE
TRAVEL/SPACING DERIVATION — **ruling 157**, docs/gazetteer/skill only, NO engine change, NO
pack change, nothing to deploy. The region-forge skill's spacing and ordering are now
*derived*, not vibes: **(a)** gazetteer `meta.travel_modes_km_per_day` gains seven ADDITIVE
modes (foot_loaded 24, cart_ox 18, cart_horse 32, horse 50, courier 140, boat_local 20
up / 50 down — the ruled four and all played distances untouched); key physics: carts
extend LOAD, not range. **(b)** Market-town spacing law: **⅔ × the dominant
farm-to-market mode's day-rate** (one-day-return market rule; reproduces the 13th-c
English 6⅔-mile statute) — per-nation inputs in NEW gazetteer `meta.settlement_dials`
with **`draft_animal` as Ben's tunable dial** (Thalendor ox → ~16 km, Corvaine horse →
~21 km); cities keep the separate long-haul rhythm (~100–150 km trunk nodes). **(c)**
Driver placement order = descending exogeneity: **water → specialty → fort → shrine →
junction** (specialty is geography and feeds the road graph; shrines late because
remoteness is relative to what's already placed; junctions last by definition). All
prospective: the approved Palewater draft-2 is grandfathered — `region_overlay.py`'s old
order is seed-frozen under it, do NOT re-run Palewater with reordered code; the NEXT
region's config adopts the 157 order + derived spacing in place of the flat `min_d`
constants. SKILL.md Phases 2/4 updated.) Prior: **2026-07-22i** (PLAYER PRIMER HTML — new
send-to-players generated doc **`EDHA_PLAYER_PRIMER.html`** (dashboard-styled, one
self-contained ~1.6 MB file, opens from a double-click) built by NEW
`scripts/build-player-primer.js` from EDHA_PLAYER_PRIMER.md (the GM-note block is stripped
at build) + `data/leyline|domain|cosmere.json` + `data/authored/*` (card text = the live
Foundry `description.value`, same precedence as the module build; icon-font spans → readable
glyphs; @UUID links → plain labels) + `path-descriptions.json` + `deity-resources.json` +
NEW player-SAFE map render **`scripts/map/render_player.py`** →
`source-materials/maps/thyrcross-player.jpg` (nations + the 14 named public cities + an
explicit public-site allowlist: Heartholt, Arcanta, the Hush, Lake Vespera — GM sites
(Black Altar Crossing, Withervale, Palewater Ford, Elmsworth, the Ashhold) deliberately
absent; NEVER embed `thyrcross-labeled.png` in player docs, it shows every GM site). Tabs:
World / Map / Leylines / Deity Paths / Heroic Paths (the 6 Edha heroic paths only — the
Radiant rows in cosmere.json have no layout and are excluded), each tree a clickable node
diagram from layout+connections with a card panel + global talent search; deity trees mark
their two entry talents (entry tag OR no prereq connections — tagging is uneven across
trees). Deterministic (content-hash stamp); `validate.yml` gains
`build-player-primer.js --check`, so the primer HTML is sync-enforced like
dashboard/codex — after editing the primer md, talent data, authored cards, or the player
map, run `node scripts/build-player-primer.js` and commit the HTML. Docs/tooling only, NO
engine change, NO pack change, nothing to deploy. ⚑ Ben: give EDHA_PLAYER_PRIMER.html one
skim in a browser before sending it to players — a second pair of eyes on the spoiler line,
and if a new site becomes player-known later, add it to PUBLIC_SITES in render_player.py
and rebuild.) Prior: **2026-07-22h** (PALEWATER
REGION SETTLEMENT PASS — lore-forge → NEW SKILL `region-forge`, **rulings 150–156**,
docs/gazetteer/tooling only, NO engine change, NO pack change, nothing to deploy). Ben's
session-1 region canvas (1384², ~0.77 km/px, registered in the gazetteer under `region_maps`
with an anchor-glyph transform solved from his three painted glyphs) got its settlement
layer end to end: **the settlement-tier model** (150 — capital / city / market town /
village; region maps stop at market towns, villages only when plot-relevant; cities derive
from trade geometry, never capped by the Cities layer); **Thalendor 6 cities / ~200 towns +
Corvaine 9 cities / ~280 towns** (151–152, on the ruling-85 14.5M/18.0M; city-30..37
minted, city-15 = Elmsworth per the marker-named pattern); **the Palewater's true width**
(153 — ~250 m at Elmsworth to ~1.2 km at the Withervale reach; ALL maps draw over-width
deliberately, drawn width is cartography never geometry); **Fork A** (154 — the ferry-pair
cities at barge-day 5, the legal crossing that explains the raiders' ford; run-sheet §10.2
gains the day-5 town stop, Ben: *"needs some GAS"*); **the placement-driver taxonomy**
(155 — no dot without a driver: water/specialty/junction/fort/shrine, per-nation mixes,
tributaries rivers-first); and **the opus audit** (156 — Ben flagged the tributaries and
junction logic, the audit confirmed: 5/7 tributaries were BARBED (sourced downstream of
their mouths), junctions were roadside dots. Now: hydrology rules (source uphill, descend,
dendritic forks, lakes get inflows), junction towns at true crossings on a road graph
DERIVED from the settlements, mix preserved with shortfalls REPORTED — Corvaine runs 7
junctions short in-frame, a geographic signal, accepted; trib-T5 minted; SW lake drains SW
⚑). Gazetteer: +8 tributary waterways (mouths load-bearing, courses repaintable), +122
driver-tagged `market_towns`, `region_maps` registration, city-30/31/32 px synced to the
drawn art. NEW `scripts/map/region_overlay.py` (deterministic, seed 143). Overlay PNG +
review composite delivered to Ben for Procreate insertion. NEXT: Ben paints; then **W30**
(the ruling-118 naming walk: corridor slots, ferry pair, the two unnamed LAKES, T1–T5 /
C1–C3, city names — the world-canvas paint guide for city-30..37 rides that, since unnamed
cities don't join the backlog). ⚑ bench: none, nothing deployed.) Prior: **2026-07-22g** (KETTAVAR DIVE section 4 +
CLOSE — lore-forge, **W24 KETTAVAR COMPLETE (rulings 139–149), the tenth nation of ten —
W24 ITSELF CLOSES: every nation now has a land budget, a derived population, a full-depth
culture block, and an ecology slice.** Primer mirror approved and landed (the sea-facing
life, Maelstrand/Maelvik + the knowing god-names, open hand / remembering / "about enough,"
tideline + the last casting, **fetch folklore player-safe by design** — players get the
word from the world; stripped: tended granary, steered routes, scheduled-livestock horror,
Miravel's aggregate). **cultures.json Kettavar synced (data — rides the SAME pending pack
rebuild as the adversaries).** Sweep run: §3 Maelith + the granary-run sentence (rulings
141–142) + Maelstrand seat, §6 Miravel actuarial tell, §5c stale future-tenses → ruling
147, TODO W24 `[x]` + dive log closed, §10 collapsed to settled. Deploy stack for Ben,
unchanged from 22f: **ONE pack rebuild + relaunch + ⟳ Sync Adversaries** covers the Ashkar
five + Kettavar four + all pending culture items + the False Spring and Cragdrake parity
fixes; bench sections "Ashkar Mesas Bestiary" + "Kettavar Tundra Bestiary". Remaining
nation-scale worldbuilding: **only Sylvaneth's fae pass (W9 deep / W20)**.) Prior:
**2026-07-22f** (KETTAVAR DIVE Phase-4c —
lore-forge, W24. **DEPLOY: pack rebuild + relaunch + ⟳ Sync Adversaries** (rides the SAME
pending rebuild as Ashkar's five — one rebuild covers both). Gate closed (ruling 148, "looks
good"): four blocks in `data/adversaries.json`, folder *Kettavar Tundra Bestiary* — **The
Doubled** (rival Black/Blue; the Doubling `edha-ambush-belief` + `whenTargetFooled` Grasp
rider, Predatory Patience, damaged-cue Reaction), **The Doubled Elder** (boss tier-2 in the
tier-1 hp band; **The Seeming** full Phantom-Double loop name-verbatim + **Dread Presence**
veto at its true 60-ft boss range + seeming-break cue), **Cullwolf Pack** (minion ×4;
**Severance's first bestiary carriage** — PC vital-convert rule verbatim vs Isolated),
**The Cull-Alpha** (rival; Predator's Due on-defeat heal). All ruling-122 dice; wiring
authored against the closed dispatch table; **adversarial audit pre-gate found 3 defects,
all fixed** (Elder Dread Presence card said 30 ft where the engine computes 60 at boss rank
3; false "(engine name-keyed)" claims on Predatory Patience traits — the name is NOT keyed,
the carried rules do the work; rival cue note promised a re-fool the once-per-scene ambush
ledger can't deliver). **Kit finalized**: Absolute Stillness dropped (0-Speed punisher —
wrong mechanics for the concept; the Doubling carries the seeming). **Parity sweeps on
shipped blocks, Ben-blessed**: Cragdrake Alpha Dread Presence 30→60 card text (bench row
updated to verify the card post-rebuild) + PP wording sweep (Dirgehound/Cragdrake/Reeve-Owl,
cosmetic). Bench section **"Kettavar Tundra Bestiary"** (headline rows: the Severance
vital-convert, The Seeming loop on an adversary, the both-ledgers fooled-rider); art
wishlist +4 slugs. **Next: section 4** — primer mirror + cultures.json + dependent sweep;
the pass and W24 close with it.) Prior: **2026-07-22e** (KETTAVAR DIVE section 3b —
lore-forge, W24, **docs only, no rebuild**. The tundra roster approved → **rulings
146–147**. **146 is a standing rule change**: Ben clarified the Blue moratorium bars *NEW*
Blue lineages only — existing Blue creatures may be adapted/range-extended into new biomes
("the tundra not having any Blue is noticeable"); first instance = the keelshadow extended
into Kettavar's whaling grounds (ruling 97's block serves, no new block). **147 = the
roster** (§5c "The Kettavar tundra — the Unmaker's ground and the whiteout bestiary"):
ledger counted first (serve Black; White debt *named* to Sylvaneth/W20/W23 — ruling 36 bars
White herds here); **the fetches** (Black/Blue pair apex — the whiteout ambusher that wears
the shape of the familiar; kit Phantom Double + Absolute Stillness + Predatory Patience,
elder adds Dread Presence; **Ben took the fetch name**: the GM docs' "Fetch" label for the
§2 entity now has an in-world etymology — Kettavari folklore — while the entity stays
nameless in-world, §2 updated); **the cullwolves/the Tithe** (Severance + Predatory
Patience + Predator's Due; famine arc "the cull that cannot close" — the insulation's edge
drawn in wolf behavior); **the tarvar** (mundane herds; the wrongness is their *health* — a
statless walkable clue); swards + greatfish scenery. Deity inversion recorded: the only
nation whose attuned wildlife is getting STRONGER (fed faith — ruling 108's tell
backwards). Ledger ≈ +1.5 Black, +0.5 Blue. **Next: Phase-4c** — Doubled (rival) / Doubled
Elder (boss) / Cullwolf Pack (minion) / Cull-Alpha (rival), full blocks at the gate,
numbers are their own approval — then section 4.) Prior: **2026-07-22d** (KETTAVAR DIVE
section 3 —
lore-forge, W24, **docs/gazetteer only, no rebuild**. The culture batch approved whole →
**rulings 144–145**: §5b deepened at the reference depth — **the last casting** (ruling
142's rite as prose: the omens set the day, grief is *scheduled*, the days before are spent
well), **the open hand + the remembering** (obligation-wealth no murrain can catch; the
midwinter recitation the Unmaking Days read backwards), **the sea / the tideline / the
sowing** (no boat out without a casting; treeless Kettavar roofs in driftwood and
whalebone; tideline claims wait for the omens; the lee plots sown on the reading and
out-yielding the calendar for a century — ruling 141's tell hiding in plain sight), the
**quiet Vorsk border** (trade, not raids), new quirks (*"about enough"*; casting-sticks) —
and the names: **Maelstrand** = city-02 the capital (hall + sanctum + casting-ground),
**Maelvik** = city-01 the sea-town; both Mael- stems spent as the continent's only
**living-god fossils, said knowingly** ("you cannot keep what was never still"). Naming
row updated (demonym **Kettavari**; Oravel Longwinter / Kesva First-Ashore exemplars;
"who were you when…?"), one-scene alternate added (the scheduled feast with grief in it),
§5 row + §5a picks updated (**15 markers remain unnamed**), gazetteer cities named
(painted: false) + labeled map re-rendered + paint guide regenerated, lint clean. **Next:**
section 3b — the tundra ecology roster, **ledger count first** (the ruling-36 Black/Blue
debt), then Phase-4c and section 4.) Prior: **2026-07-22c** (KETTAVAR DIVE section 2 —
lore-forge, W24, **docs only, no rebuild**. The GM-truth forks approved as proposed →
**rulings 141–143**: the insulation mechanism is **the tended granary** (141 — layer 1
lands on the tundra like everywhere, but the herds are never standing on it: Kettavarans
cast omens before every move, so the omen channel is the API the Fetch manages its granary
through; the doctrine looks confirmed and the faith deepens — the insulation and the
harvest are the same act; Miravel gains the actuarial tell — no herd lost in living
memory; the murrain-rate absence is legible to any outsider who counts; **W15 data point
recorded** — a predator managing livestock, not a fed god shielding); the hospice answer
is **the last casting / ice-giving** (142 — the omens choose the day, the cold finishes,
§3a's no-kin-hand taboo holds; net ~0.5%/yr → ~8k stuck-dying, one household in twenty,
the continent's lightest load; the dead-drift question banked, ruling-115 pattern); and
the **marker roles** are set (143 — city-02 = the seat / casting-ground / worship-spike
peak, city-01 = the sealing-and-whaling sea-town; names wait on section 3's Mael- stems).
Canon §9 + §10 tracker + TODO W24 log and W15 evidence note updated. **Remaining, gated:**
section 3 (culture walk), 3b (ecology, ledger first), Phase-4c, section 4.) Prior:
**2026-07-22b** (KETTAVAR DIVE section 1 —
lore-forge, W24's **tenth and last nation**, **docs/gazetteer only, no rebuild**. Measured
(ruling 139): 479,615 km², **0.0% drawn fresh water** (the only such nation), and the
continent's **most maritime structure** — an E–W peninsula ~1,780 km long, ~68% of its
boundary open sea, 80% of land within 100 km of salt water; Vorsk's wall due south, Malcurr
at the east root, Goldenport's ribbon ports the sea-trade door. Ben's dials (ruling 140):
the **herd-and-coast model**, the first RANGE-first chain — usable range 65% at 1.0 LU/km²
→ ~312k LU of migratory herds (50% of diet at the 10%-conversion floor), the glacier
coast's sea larder (**35% — the FIFTH ruling-27 fish exception**), omen-timed lee plots
(15%, cleared 0.15%) → **~780k normal-times, the smallest nation by far**. Margin-invariant
finding, load-bearing: **the herd IS the granary** — no convertible buffer, so §5's
"Stable / insulated by design" rests on the ⚑ section-2 first fork (the Fetch's omens
steering the herds off murrain-ground: the granary being *tended*). Gazetteer
`land_budget` written; §5a ground-truth paragraph + §10 tracker added; TODO W24 updated.
**Remaining, gated:** section 2 (GM forks), section 3 (culture — the **Mael-** fossils,
the continent's only living-god fossils), 3b (ecology — the ruling-36 Black/Blue debt;
ledger count first), Phase-4c, section 4 (assembly + primer + sweep).) Prior:
**2026-07-22a** (ASHKAR
DIVE — lore-forge, **W24 ASHKAR COMPLETE (rulings 125–138), the ninth nation of ten**,
docs/gazetteer/data; **DEPLOY: pack rebuild + relaunch + ⟳ Sync Adversaries**, no engine
change). The collapsed SW state, dived end to end: **land** (ruling 125–126 — coastal,
hardest-aridity land, ~3.35M pre-collapse; the western tributary traced, closing the W28
queue); **GM truth** (127–133 — Ashkar **was Razkael's own Destruction country**; the
collapse mechanism is **the Wear**, a resident god's passive tax on made things, the
material inverse of Goldenport's Luck; terminal waterwork cascade ~30–40 y.a.; **~1.3M
remain**; the Clearing hospice; the one faction = **the Ashhold / Vekh**, keeping the
Sunderway pass toward Razkael); **culture** (134–135 — "the nation where nothing is built
to last": the Provisional, the Water-Peace, the Taking-in, the Flame kept as ash; Kaelmouth
/ Raskeld / Kaelgate spend the Rask-/Kael- fossils; **Kaelmere** = Ashkar's name for Lake
Vespera, ruling 136); **ecology** (137 — the hazewyrms/Veiled Red R/B apex = W18's mesa
dragon-half, the reckoning White pack, the slagbull; ledger-disciplined to serve Red+White);
**statblock gate** (138 — five *Ashkar Mesas Bestiary* blocks, ruling-122 dice, audit clean;
**Kindle's light clause made live** via `lightRadiusFt` and the shipped **False Spring**
parity-fixed for the same latent bug). Section-4 sweep: primer mirror, cultures.json flavor
(rides the rebuild), §5/§5a/§5b/§5c/§3/§8.2/§10 aligned, OPENING open-item closed, labeled
map re-rendered (Kaelmouth/Raskeld/Kaelgate/Ashhold site-mirrors) + paint guide. Deploy for
Ben: **pack rebuild + relaunch + ⟳ Sync Adversaries** (the 5 blocks + False Spring fix +
the Ashkar/Vorsk/Lunavar culture items); bench "Ashkar Mesas Bestiary"; art wishlist +5.
**Only Kettavar remains** (+ the Sylvaneth W9/W20 fae pass). Prior: **2026-07-20t** (VORSK
DIVE section 4 + CLOSE — lore-forge, **W24 VORSK COMPLETE (rulings 114–124), the eighth
nation of ten**. Primer mirror approved and landed (steadings / shares / the two towns /
the going-up, spoiler-checked); sweep run: §5 row corrected + capital + ~3.2M, §5a marker
picks (20 unnamed remain), §5b intro parenthetical, §6 +Berrek Karn / Isra extended
(ruling 117), §3 succession sentences, §8.2 armed-note, **cultures.json Vorsk flavor
synced (data — rides the SAME pending pack rebuild as the adversaries)**, labeled map
re-rendered (Kragmoot/Tirgard labels; lint clean). Deploy stack for Ben, unchanged from
20s: **engine F5 + pack rebuild + relaunch + ⟳ Sync Adversaries** (cultures item rides
it); bench "Vorsk Ranges Bestiary" + the re-diced W28/W29 rows. Banked: where Vorsk's
dead pool (ruling 115). ⚑: W18's Ashkar R/U half, Rask-/Kael- stems reserved for Ashkar,
art wishlist +4. Next dives: Kettavar or Ashkar.) Prior: **2026-07-20s** (VORSK
DIVE sections 3b + Phase-4c — lore-forge, W24. **DEPLOY: engine F5 AND pack rebuild +
relaunch + ⟳ Sync Adversaries.** Roster (ruling 121): the **cragdrakes** (W18's ranges half
lands — R/B pack; adults rival/wolf-sized with Searing Bolt, alpha the FIRST TIER-2 BOSS
with Flame Surge 2d8; **shelf fork YES — the going-up works because the drakes finish
quick**), the **bellwether** (first domesticated attuned lineage), cinderbrock ore-road
extension, shelf-silence scenery. **Rulings 122–123 — Ben's dice correction at the gate:
adversary leyline rank = ROLE rank (minion 1 / rival 2 / boss 3), tier = dice count only;
supersedes 107/113 tier-dice.** Engine: `edhaColorRank` role fallback, Shield Wall wallDie,
Pack Pressure rank routing (Sonnet audit found the latter; regression tests updated). Four
Vorsk blocks landed (folder *Vorsk Ranges Bestiary*) + the **retro sweep**: six older
formula fields re-diced (False Spring Kindle +3 / Afterburn d8, Dirgehound d6s, Reeve-Owl
d6, Brandram half-d6) + four card texts (Crownox ×2, Reeve-Owl SoS, Grove Thorn Field d8);
the affected W28/W29 bench rows updated IN PLACE and re-test at the new numbers. Bench
section "Vorsk Ranges Bestiary"; art wishlist +4 slugs (cragdrake ×3, bellwether). Next:
section 4 — primer mirror + dependent sweep + close-out.) Prior: **2026-07-20r** (VORSK
DIVE section 3 — lore-forge, W24, **docs only, no rebuild**. Five culture items walked one
at a time → **canon ruling 120 + the §5b Vorsk block at full depth**: the going-up; the
warband/share/moot (*takes the hall, never the shares*); Kragmoot/Tirgard + the ten
thousand fort-steadings (one gate, ~320 souls — ruling 114 in stone); the rekindling
(approved on the SECOND take — high halls downward, chaplains = proven commanders sworn out
of their bands, rank with no ceiling); seed-chest + gate-bench quirks, folds-and-hundreds
warband names (Berrek Karn of the Stonefold), naming + one-scene rows updated. Oath pair
dropped by Ben. Next: section 3b — the ecology roster, ledger count first.) Prior:
**2026-07-20q** (VORSK
DIVE section 2 follow-up — lore-forge, W24, **docs/gazetteer only, no rebuild**. Ben's
redirect ("Vorsk is Tyrith-coded; save the Razkael names for Ashkar") → **canon ruling
119**: god-fossil toponyms follow the nation's god-coding — Vorsk runs **Tir-/Tyr-** names
on an **ancient high-hall Tyrith faith that faded into the challenge-succession custom
itself** (ruling 53's "the god of the challenge-succession Vorsk already lives by" now
literal; the Iron Congregation is REKINDLING, not planting — chaplains cite the old names
as propaganda; the growth-rate tell intact, the feeding still explains the speed);
**city-12 = Tirgard** (gazetteer named; the chaplains restore the "Tyrgard" spelling on
church documents — the rekindling visible in orthography, a two-papers clue); the per-god
**stem table** landed in §5b connective tissue (Morrow!) with **Rask-/Kael- RESERVED for
Ashkar** (canon §10 inheritance noted). Next: section 3 — culture items one at a time,
starting with the going-up at full §5b depth.) Prior: **2026-07-20p** (VORSK
DIVE section 2 — lore-forge, W24, **docs/gazetteer/skills only, no rebuild**. Ben approved
the GM-truth forks as recommended → **canon rulings 115–118**: the **going-up** (the quiet
shelves — Vorsk answers the wasting by carrying the asking-dying above the winter line; the
cold is mechanical, no kin raises the hand; net hospice ~1%/yr → ~64k stuck-dying, one
household in ten; the Iron Congregation's SECOND wedge = preaching the blade as courage —
the coup's fingerprint on Vorsk is preaching past the old laws); **Kragmoot** (city-08, the
capital/high hall — gazetteer named); the gate-town city-12 name **redirected to Ben's new
god-fossil toponym rule** (ruling 118, the Athens pattern: region-level small towns pad
with deity-derived names worn smooth by speech; fossils = W12 sacred-geography data; dead
gods leave fossils like curses — §5b connective tissue + lore-forge + session-forge skills
updated; Razkael-derived candidates for city-12 presented, awaiting Ben's pick); the
**succession structure** (Warlord Berrek Karn, old-law; the church grows his replacement —
the groomed challenger IS Commander Isra Vael, C1 held loosely: Tyrith building his Vorsk
face on Razkael's unwitting resonant, §8.2 armed not foreclosed). §3/§6/§8 prose alignment
rides the section-4 sweep. Next: city-12's name + per-god stems, then section 3 culture
items one at a time.) Prior: **2026-07-20o** (VORSK
DIVE section 1 — lore-forge, W24, **docs/gazetteer only, no rebuild**. The eighth nation
dive opens (also the first ruling-109 Red-country pass — W18 dragons + the second
color-balance count queued behind it). Ben approved the land-budget dials as proposed →
**canon ruling 114 + the gazetteer `land_budget`**: the **valley-and-ledger model** —
measured 689,068 km² / 5.1% water / landlocked on the post-gap-fill partition (true painted
borders now incl. Thalendor + Corvaine; Goldenport's north-coast ports ~125–175 km from the
western border), cleared 5%, hardy grains 2.0M kcal/ha, herd 0.30 LU/person sheep-heavy
with half its feed off the high pastures (the transhumance term — feed, not food), Ledger
grain sized at 8% of human calories (~53k tons/yr, numbers under ruling 93) → **~3.2M
normal-times, the smallest measured population**, ~960k LU. Margin invariant resolved
structurally: **the buffer is one-shot** (hay/alp grass isn't human-edible — no convertible
cushion), deriving the permanent ritualized raiding; famine = murrain ON the buffer +
premium on the imported grain → rationing-tier, ruling 67's escalation clock with its
economics underneath. Hospice dial deferred to section 2's blade-mercy fork (ruling 9 +
§3a keeper taboo vs. the warrior honor culture — Ben's call, not arithmetic). Phase-2
audit of the existing §5b Vorsk block came back clean; two mechanical sweep catches queued
(§5 "expand north" → south; ore-road distance). Next: section 2 GM-truth forks (the blade,
the capital pick city-08/city-12 + names, the Warlord + the Iron Congregation, Isra Vael).)
Prior: **2026-07-20n** (MAP
GAP-FILL RE-REGISTRATION — data/assets only, **no engine change, no pack rebuild; picker
assets ride the already-pending deploy-bat push**. Ben repainted the nation layers to close
the inter-country gaps/overlaps the Vorsk lore pass flagged (dropped as `Thycross 1.procreate`,
renamed back to the canonical `source-materials/maps/Thycross.procreate`; Cities + Rivers
layers verified pixel-identical to the 07-19 extraction, so ONLY nation washes changed —
scale anchors + km_per_px 1.5817 stand). Coverage audit of his pass: **15 true border gaps
+ 104 overlap strips remain** (largest: Lunavar/Thalendor seam ~2,890 km²; full numbered
list in the session report + `coverage-fix-overlay.png` beside the map — import it into
Procreate as a guide layer, red = gap, blue = overlap), plus a SYSTEMATIC ~2–4 px coastal
fringe on every nation (wash stops short of the Land coastline; ~35k px continent-wide).
**New committed `scripts/map/trace_nations.py`** replaces the never-committed 07-19 ad-hoc
trace: it resolves fringe/gaps/overlaps into a WATERTIGHT partition (competitive BFS from
each nation's exclusively-painted pixels — encodes Ben's stated full-partition intent;
repainting the source always overrides), so re-traces stop caring about brush slack.
Gazetteer polygons + areas re-derived (areas now sum exactly to land: ±≤2.7%, Goldenport
+19k km² the biggest mover; **zero city/site nation flips**; 98 orphan px on unpainted
islets, warned). Regenerated: political/borders (now partition-true) + labeled renders,
viewer, paint-overlay, codex, dashboard, **wizard picker assets** (same two bench rows from
07-19ab still cover the test). Base `thyrcross.png`/`Thycross.jpg` RESTORED from git (Ben
had deleted them; still the 07-19 flatten — stale only in thin 0.3-alpha wash seams where
borders moved; ⚑ next Procreate drop should include a fresh flattened-JPG export to refresh
it). Gates: validate/lint-refs/tests/audit-parser/lint_map green (same 4 island-city
warnings = the standing multi-polygon backlog item). NOTE (merge with the W27–W29 passes,
which landed on main mid-session): the re-trace was RE-RUN on the post-W29 gazetteer, so
the W27/W28 waterway/land-budget/city additions and this partition coexist — verify below.).
Prior: **2026-07-20m** (W29 GATE CLOSED + ENGINE
OWNER-SCAN WIDENING — **W29 DONE end to end (rulings 108–113)**. Ben approved the eight
balance-pass blocks as presented (`data/adversaries.json`: Reeve-Owl, Crownox Ring ×3,
Rootling Swarm, Briar-Gone Grove — folder *Thalendor Heartwood Bestiary*; Tollbird Flock —
*Riverlands*; Surecat — *Corvaine River-Plains*; Brandram, Tussock-Sow — *Malcurr Lakes*)
with two menu rulings → **canon ruling 113**: (a) brandram **Momentum's Edge at +2d4** (the
PC card's +Speed stands for PCs; +40 on an adversary chassis not shipped); (b) **the engine
owner-scan widening** — `edhaCharacterOwnersOf` filtered `type === "character"`, so
name-scan passives never fired for adversary owners (unlinked compendium-dropped tokens are
in NO directory): **the W28 Dirgehound Dread Presence veto shipped dead**. New
`edhaOwnersOf` (characters + adversary owners from directory AND canvas, deduped) now
drives the Dread Presence veto, the Shield Wall/Devoted Conduit pre-pass (adversary dice at
rank ≡ TIER per ruling 107 — a crownox reduces by half 1d4, not the role-rank d6), and the
focus watcher (Whispered Doubt et al. — the Tollbird Flock is the first adversary
consumer); `edhaColorRank` gains the ruling-107 tier fallback at rank 0. Crownox Shield
Wall + flock Whispered Doubt cards flipped from GM-cue floors to engine-native (cues
removed — no double-application). **3 regression tests pinned (55 total); all gates
green.** DEPLOY: **engine F5 AND pack rebuild + relaunch + ⟳ Sync Adversaries** — bench
section "W29 Balance-Pass Bestiary" incl. the ⚑ Dirgehound Dread-Presence RE-TEST (the W28
headline row was untestable-dead before this). Art wishlist +8 slugs. ENGINE_INDEX updated
(edhaOwnersOf + rank fallback). TODO W29 [x]; second balance pass queued after the Red
countries. **Git note: the session's git auth (push + signing) was down most of this pass —
all W29 commits are local with signatures to be redone (`rebase --exec --reset-author`) and
pushed the moment auth recovers; if this delta is visible on GitHub, that repair already
happened.**) Prior: **2026-07-20l** (BESTIARY BALANCE PASS
section 4 — MALCURR, lore-forge, W29, **docs only, no rebuild (statblocks gated)**. Ben
approved the batch whole → **canon ruling 112 + §5c Malcurr-lakes block extended**: the
Kenmere Red/Green Gnothis spike populated — **the brandrams** (RED charge rival: Reckless
Advance / Momentum's Edge / Shockwave Slam / Unstoppable; spike-fed and famine-bold, "the
god's flocks fatten while ours fail"; counterplay = deny the run-up) and **the tussock-sow**
(GREEN — ruling 80's banked Mirewright reused, Gnothis's Green as craft — she wrights her
ground; kit = the banked "Closing Arena": Sudden Growth / Spreading Roots / Apex Predator /
Drive the Prey). Spike-age default ruled: **old spike, new surge** — the one THRIVING
wildlife on the continent (inverse faith-lever; banked clue: if the Warlock falls, the
brandrams gutter first). Malcurr = 7 entries; ledger +1 Red +1 Green. Remaining: section 5
(Lunavar no-change confirm + close-out) then the Phase-4c gate — EIGHT blocks (reeve-owl,
crownox ring, rootling swarm, briar-gone grove, tollbird flock, surecat, brandram,
tussock-sow), ONE pack rebuild.) Prior: **2026-07-20k** (BESTIARY BALANCE PASS
section 3 — CORVAINE, lore-forge, W29, **docs only, no rebuild (statblocks gated)**. Ben
approved the batch whole → **canon ruling 111 + §5c "The Corvaine river-plains"**: (a) the
**Tessavain/Order nexus is ruled into Corvaine** (Blue/White, §3 updated; leyline geometry
not worship — Corvaine stays godless; site ⚑ open, W12 note added, Aldercourt region a
candidate only); (b) the **surecats** (BLUE foresight rival, solo — strikes where the
quarry WILL be; "the surecats have gone unsure" = the control-case clue in foresight key;
range-maps ARE the nexus survey; kit Forewarned + Intercept / Probable Outcome / Redirect
Momentum — **Ben's own spent Blue-moratorium exception, logged, not precedent**); (c)
reuse: callthief range-extension north (patrol horn-calls sentence in the Canticle §5c
entry; existing Callthief block serves as-is) + tollbird flock kit scoped (Whispered Doubt
+ Sapping Hex, minion swarm, never tougher). Corvaine = 5 entries; ledger +1 Black +1 Blue
(the exception). **Git note: platform git auth (push + commit-signing) down mid-session —
sections are committed locally with signatures to be redone at pass end (rebase --exec
--reset-author + push once auth recovers); Ben ruled: finish the pass, fix git at the
end.** Next: section 4 Malcurr (the Red/Green Gnothis spike).) Prior: **2026-07-20j**
(BESTIARY BALANCE PASS
section 2 — THALENDOR, lore-forge, W29, **docs only, no rebuild (statblocks gated)**. Ben
approved the Thalendor batch whole → **canon ruling 110 + §5c "The Thalendor heartwood"**:
the **reeve-owls** (BLACK rival, solo — the Arbiter's bailiff that has always taken the
wasting, "cast down"; seal arc = cull-and-cannot-eat, writs-served kills, maddened owls
coming for the stuck-dying; kit Sapping Hex / Predatory Patience / Sovereign of Solitude /
Cruel Step) and the **crownoxen** (WHITE rival ×3 — the ring, station-keeping formation
defense, "the crown holds"; famine arc = rings held around nothing, rings butchered because
they won't break; kit Shield Wall / Guardian Stance / Retributive Guard / Unbreakable
Line). Both worship-fed deity attunement (ruling 108) with the faith-lever: heresy
districts' wildlife sickens first. Green statting scoped at last (W23): rootling swarm =
"the Snare", briar-gone grove = "the Closing Arena" at boss scale, grove-heart stays
ruling-40 terrain-scale. Thalendor = 3 colors; statted-ledger effect +1W +1B +2G, zero
Blue. All W29 statblocks land at ONE pass-end Phase-4c gate + ONE pack rebuild. Next:
section 3 Corvaine.) Prior: **2026-07-20i** (BESTIARY BALANCE PASS
section 1 — lore-forge, W29, **docs only, no rebuild**. Ben's frame approved → **canon
rulings 108–109 + §5c framework paragraph**: the **three-layer bestiary derivation** —
geography picks the animal, the ground picks the default colors, **deity attunement
balances the roster** (a god's pair manifests in fauna as a worship-fed concentration at
the god's touched ground — food, not faith; beasts still feed no god), and the derived
consequence is canon: deity-attuned lineages **weaken as a nation's faith falters** —
heresy shows in the wildlife first. The attunement-ledger moratorium is clarified
**Blue-only (Green fully allowed)**; continental Red waits for the Red-country passes
(a second balance pass is queued after them); exception: **Malcurr gets a Red/Green
Gnothis spike at Kenmere** (the Warlock's cult of personality; refines ruling 77 — no
ridge, a point-concentration). Pass scope (TODO W29): Thalendor stats its Green trio +
gains Black/White Verdannis creatures; Corvaine takes the callthief range-extension +
the tollbird flock block; Malcurr adds the spike creatures; Lunavar stands. Sections 2+
(creature concepts) gated on Ben one nation at a time; statblocks via the Phase-4c gate;
ONE pack rebuild at the end of the whole pass.) Prior: **2026-07-20h** (W28
STATBLOCK GATE CLOSED — **W28 DONE end to end (rulings 99–107), the seventh nation of ten.**
Ben approved the three Hush-basin blocks with ONE standing correction → **canon ruling 107 +
leyline-tree-authoring SKILL.md addendum: adversary leyline rank ≡ TIER** — [Die] =
1d(2·tier+2) (tier 1 → d4, never an arbitrary flat die), [Tier][Die] = (tier)d(2·tier+2),
"+modifier" = +tier. Applied: Afterburn → Afflicted[half 1d4], Predator's Due → 1d4, Kindle
regained its dropped +1-energy damage half (damage-rider rule added). **Data (PACK REBUILD +
⟳ Sync Adversaries needed, NO engine change):** three blocks in `data/adversaries.json`,
folder *Canticle Plains Bestiary* — Callthief (White rival ×2, the influence-duel kit:
Guiding Signal / Counterpoint / Overwhelming Authority VERBATIM name-keyed), The False
Spring (Red/Blue boss 48hp; Held Oasis `edha-ambush-belief` NO-advantage + whenTargetFooled
+1d6, Kindle +1 rider, Afterburn opportunity prompt, heat + withdrawal cues), Dirgehound
Pack (Black rival ×3; **the Dread Presence preUpdateToken veto's FIRST bestiary reuse** —
headline bench row — plus Unnerving Approach, Predatory Patience test-rider, Predator's Due
on-defeat). Bench section "Canticle Plains Bestiary" added (the ⚑ rows double as proof the
name-keyed engine paths reach adversary-owned items); art wishlist +3 slugs; imgs are
placeholder core icons. Gates green (validate 0 warnings, lint-refs passes 5+6, 52 engine
tests). Ben-side after deploy: bench pass + paint pass (Hush pan, Arcanta, Portavere;
optional stray-waterhole erase). Next W-items: Kettavar, Sylvaneth (W20), Ashkar — Kettavar's
slice is ruled Black/Blue ground, so mind ruling 106's mono-Blue moratorium when it comes.).
Prior: **2026-07-20g** (W28
CANTICLE SECTION 5 CONCEPTS — the ecology slice, lore-forge, **docs only, no rebuild yet
(statblocks still gated)**. Ben's ratio challenge reshaped the roster before approval: the
continental attunement ledger measured **Blue-heavy 2:1 in canon entries and ~half of all
statted blocks (White had ONE)** → **canon ruling 106** mints two STANDING process rules
(now in the lore-forge skill): (a) count the ledger before proposing any roster — never
lopsided; mono-Blue on moratorium until it recovers; (b) bespoke animal actions are
authored as KITS of named talents from the creature's own color tree (banked "the Snare"
precedent → the norm; do the talent-tree pass first). The slice (§5c "The Hush basin
bestiary"): ground = Red/Blue pan basin (ruling 35's Ashkar pair bleeding east across
Vespera) + White rim plains (ruling 36 south of the river) + Black Altar corner. Roster:
**callthieves** (WHITE rival — Guiding Signal/Counterpoint/Overwhelming Authority: the
influence-duel encounter), **the False Spring** (RED/BLUE apex — Holographic Illusion +
Living Image/Kindle/Afterburn: the held oasis), **dirgehounds** (BLACK pack — Dread
Presence/Unnerving Approach/Predatory Patience/Predator's Due: they attend the given
herds), **the given herds** (famine arc derived from rulings 24+9+call-line law; ruling-34
column, never tougher), **saltstriders** mundane, scenery/reuse named (salt-larks,
skeindeer crossings, tollbird corner, flash floods per ruling 40). NEXT TURN: the Phase-4c
statblock gate — blocks wired per the dispatch table, lint-refs pass 6 run BEFORE
presentation; Ben reviews defenses/stats/numbers separately from today's animal yes.).
Prior: **2026-07-20f** (W28
CANTICLE SECTION 4 — the culture batch + all names, lore-forge, **docs/gazetteer only, no
rebuild, nothing for the bench**. Approved with ONE amendment (capital = **Arcanta**, not
the proposed Cantoria) → **canon ruling 105**. Names: Arcanta (capital site), **Portavere**
(city-27 NAMED → painted:false, paint guide now carries its lettering + Arcanta + the Hush),
**the Hush** (the pan — law is performed-before-witnesses, the pan holds none: unwitnessed
ground), **Lake Vespera** (Canticle's name; Ashkar's is that pass's question), the
**rainroads** (wash beds = dry-season caravan roads). Culture into §5b at depth standard:
the **way-witness** (caravan-hired junior bard = the law's presence; killing one unmakes
the caravan's every bargain), the **call-lines** (herds owned by melody; disputes = sing
the herd in), the **First Pinch** + transcription-years **salt season** (ruling 99 made
practice); Prosperity bullet now carries the Treaty duet + salt; GM layer gains the
treaty seam line. Player primer Canticle entry rebuilt (way-witness replaces the
archive-courier slot) + Malcurr primer "biggest country" → second-biggest (ruling-85
sweep catch). Regens: paint-guide/viewer/codex/dashboard; lint_map 0 errors. W28 next:
**section 5 = the ecology slice** (~4–6 creatures; then the Phase-4c statblock gate).).
Prior: **2026-07-20e** (W28
CANTICLE SECTION 3 — both structural forks approved as recommended, lore-forge,
**docs/gazetteer only, no rebuild, nothing for the bench**. **Ruling 103 (F1c):** the
capital sits in the dry — Congress + Deep Stacks TOGETHER on the inner east rim, NEW
unpainted site `canticle-capital` (1884, 2319) (45 km inland, ~250 km south of city-27
which stays the sea-trade port; "the law lives where nothing rots" — ruling 99's archive
climate now load-bearing; paint guide regen'd, name ⚑ gated). **Ruling 104 (F2a): the
Treaty of the Mouth** — sung compact with Corvaine: they keep city-22 + the tolls,
Canticle holds perpetual free passage + the river arbitration seat, renewed as a joint
herald-and-Bard duet at each season's turning; GM seams deliberate (desperate crown vs
sung treaty; Solenne's institution judging a dispute Canticle is party to). Sweeps: canon
§5a + §9 (103–104), TODO W28, viewer/codex/dashboard/paint-guide regenerated, lint_map 0
errors. W28 next: **section 4 = the culture batch** (full-text items + all gated names),
then ecology.).
Prior: **2026-07-20d** (W28
CANTICLE SECTION 2 — the land-budget dials, lore-forge, **docs/gazetteer only, no rebuild,
nothing for the bench**. Ben approved the four dials as proposed → **canon ruling 102**:
cleared **6.5%** national (farmland only on the ~246k km² rim, farmed at ~40% — aridity is
the structural biggest-land-≠-biggest-people answer), kcal **2.5M** (the rim IS the watered
land; no dryland double-penalty), yield ×1.0 (no line/nexus forced), crop-fed LU 0.26 +
**`range_diet_frac` 0.20** (the THIRD scoped exception to ruling 27's set-aside after
Lunavar marsh 62 / Goldenport sea 90 — interior range herds feed a fifth of calories;
~10% grass conversion floors the range herd at ~1.28M LU) → **Canticle ≈ 8.0M** (rank:
Corvaine 18.0 > Thalendor 14.5 > Goldenport 13.2 > Lunavar 11.6 > Canticle 8.0 > Malcurr
7.8), famine cliff ~19.8% of normal yield — §1a's "Canticle absorbs layer 1" now DERIVED.
`land_budget` block written to the gazetteer (Canticle joins Thalendor/Corvaine/Lunavar/
Malcurr/Goldenport); canon §5 row + §5a ground-truth para + §5b geography line carry the
number; codex/dashboard/viewer regenerated; lint_map 0 errors. W28 next: **section 3 =
structural forks** (capital + Deep Stacks siting — candidate inner-rim pin (1884, 2319)
verified 45 km inland / ~250 km from city-27; the mouth arrangement with Corvaine), then
culture, then ecology.).
Prior: **2026-07-20c** (W28
CANTICLE SECTION 1 — the land analysis + the water fork, lore-forge, **docs/gazetteer only,
no rebuild, nothing for the bench**. Measured off Ben's layers: Canticle = **rim nation
around a dead heart** (water 1.8%, 61% of land >100 km from ANY water, worst point
(1610, 2480) at 397 km/725-km-to-fresh; habitable rim ~246k km² = 17%). Ben's batch (one
approval, chat): **the water fork went Option B → canon ruling 99, the Salt Heart** — an
endorheic seasonal salt pan at the dead heart (NEW site `salt-heart-pan` (1600, 2475),
`painted: false` → paint-guide regen'd; salt economy + dry-air archive climate approved in
concept for the culture section; the (1355, 2500) waterhole paint = stray, non-canon);
**west border lake = Ashkar's as drawn** (ruling 100; NEW site `west-border-lake`, painted;
Canticle holds the east shore); and **the Palewater mouth reach TRACED** (ruling 101,
supersedes 84's 2,803): full channel head→mouth **3,322 km**, mouth (1623, 1983) sits
**Corvaine-side** (city-22 north bank — the river-trade nation doesn't own the river's
mouth), upstream vertices byte-identical (Elmsworth→ford 1,008 / →Withervale 1,444 stand),
**Withervale→Black Altar re-anchored at the confluence fork: 1,082 km ≈ 10 days** (the old
1,178 was a projection onto the removed tributary tail; the BAC site note's stale 1,355
also fixed), Black Altar→mouth 807 km ≈ 7–8 days. A second **western border tributary**
(Thalendor/Canticle/Ashkar corner, joins at the fork (1356, 2154)) is real drawn paint,
left untraced — queued for those passes. Sweeps: canon §5a (scale para + new Canticle
ground-truth para) + §9 (rulings 99–101), opening §2 site row, session-1 script header,
TODO W28 (marker count corrected: ONE marker, city-27), viewer/codex/dashboard/paint-guide
regenerated, lint_map 0 errors. W28 next: **section 2 = land-budget dials** (rim cleared
fraction, dry staple + river strip, pastoral herd dial), then culture (names for pan/lake/
washes gated there), then ecology.).
Prior: **2026-07-20b** (W27
STATBLOCK GATE CLOSED — W27 DONE. Ben approved the four blocks with one change ("burning
terrain is just Pyre from Destruction — use that primitive; the north coast is Red/Blue
ground anyway") → **canon ruling 98** (north beaches = Red/Blue, Razkael's pair; cinderbrock
lineage stays mono-Red). **Engine (engine-only, F5): NEW generic `edha-regen` handler**
(turn-end engine-applied heal, clamped by pure `edhaRegenClamp` — never while down, never
past max — pinned in tests/, first consumer Nexus-Fed) **+ `EDHA_PYRE_SOURCES` alias list**
(the Pyre spread watcher now runs any listed hazard source; card labels itself by source —
"Fire the Wrack" spreads like Pyre, owner-scoped). **Data (PACK REBUILD + ⟳ Sync Adversaries
needed):** four blocks in `data/adversaries.json`, folder *Goldenport Coast Bestiary* —
Garden Sow (boss 62hp; Nexus-Fed edha-regen, Rooted Fury hp-below cue, Trampling on-hit cue,
Old Agreement NO-HOOK), Keelshadow (rival 30hp; Hull-Shadow ambush-belief + whenTargetFooled
+1d6 rider — the documented seeming-source pair; Sounding Dive damaged-cue), Cinderbrock
(rival 20hp; Fire the Wrack = Pyre's edha-place-hazard 1d6 red region + spread-by-alias;
Furnace Heart enemy-turn-start rangeFt 5; Den Fury hp-below), Cold-Fire Cinderbrock (14hp
wasting variant, ruling 34 honored). Bench section "Goldenport Coast Bestiary" added (incl.
the alias-must-not-cross-owners row); art wishlist batch 3 (4 slugs); img fields are
placeholder core icons until art lands. Gates all green (52 engine tests incl. the new regen
pins). W27 [x] — remaining Ben-side: deploy bat + rebuild + ⟳ Sync, bench pass, paint pass
(Goldenport lettering + Fenholt). Next W-items: W28 Canticle dive.).
Prior: **2026-07-20a** (W27
SECTION 3 — the ecology slice, lore-forge, docs only, **no rebuild yet** (statblocks still
gated). Roster approved, cinderbrock chosen over the flintram → **canon ruling 97**: §5c
gains **the Goldenport coast** bestiary — the Red spur made explicit (Vorsk's ruling-35
Red/Black ranges run Red down the hills to north Goldenport's coast, Black stays high →
mono-Red coast lineages; W18 dragons stay out of scale), **Garden Sow** (Blue/Green
pair-attuned apex ON the nexus; her first unhealed wound = ruling 88's countdown arriving
on screen), **keelshadow** (Blue rival on the clean grounds; "pay it off the ledger"),
**cinderbrock** (Red standard; wrack-fires at dawn, slag-tip colonies, the *cold fire*
wasting form — never tougher, ruling 34), + silverwakes / gannet-roads / dooryard harts /
thin catch as named scenery+hazard (no silent gaps). NEXT = the Phase-4c statblock gate:
Sow/keelshadow/cinderbrock blocks presented for Ben's numbers review; nothing committed to
data/adversaries.json until that yes (then pack rebuild + ⟳ Sync + bench rows). Codex +
dashboard regenerated; validate/lint_map green.).
Prior: **2026-07-19af** (W27
SECTION 2 — the carrier-coast forks, lore-forge, docs/gazetteer only, **no rebuild**. All five
proposals approved whole → **canon rulings 92–96**: capital = **city-24 "Goldenport"**
(geometry-picked ON the Westward line's coast run → pins the Life nexus + the drain front's
destination; gazetteer named, city backlog 27); **the Peace of the Ledger** (93 — a raiding
clan's ore is struck from the books, so Vorsk raids the hungry marsh instead of the rich
coast — retro-derives the rulings-67/68 raid-front); **fish-for-rice double bind** (94 — the
hostage towns buy the Port's clean deep-sea fish back at toll prices; "we sell the fen their
own supper"); **the unwritten + the First Page** (95 — refugees arrive in the Port's worst
punishment by accident of birth; wage-history as citizenship application); **the Quiet
Ledger** (96 — one counting-house's generations-long audit of the Luck, the in-world data
that lets players SEE the act-1 countdown bend). Sweeps: §5 row E, §5b Goldenport (two new
bullets + GM layer) / Vorsk (ledger-peace bullet) / Lunavar (sea-gate double bind), §10
city backlog, primer ×3 sections; codex + dashboard regenerated; lint_map 0 errors. W27
remaining: section 3 = ecology slice → Phase 4c statblock gate.).
Prior: **2026-07-19ae** (W27
GOLDENPORT DIVE, SECTION 1 — lore-forge, docs/gazetteer only, **no rebuild, no deploy
impact**. Ben's Luck-fork answer resolved section 1 whole → **canon rulings 88–91**: the
search RADIATES from the Black Altar = Morrath's own nexus (88 — geometry-checked: Root
Network ~1,195 km < failed Lunavar corridor ~1,309 < Goldenport nexus ~1,554, exactly the
observed drain order; every groves-went-silent clue now points back at the Altar); the Life
nexus carries a natural ×1.25-in-AoE bonus, NOT yet drained (89); the sea splits by blight
exposure — inshore corruptible, deep-sea clean, and only the Port's blue-water fleet reaches
the clean half (90, sea_diet_frac 0.25 = the second ruling-27 exception after Lunavar's
marsh); **Anaveth is NOT yet shunting** (91 — supersedes §3's present-tense valve; prosperity
is natural nexus+fishery; the shunt's onset = mid-act-1 event, Luck SURGES while the coast
dims = the first-god-contact road; Serene/Lysa re-derived as nexus-amplified, Lysa's
"unreliable hands" = the front's earliest whisper). Goldenport `land_budget` landed:
**pop ~13.2M** (Lunavar-method; cleared 20%, ×1.075, LU 0.26, cliff ~19% = deepest margin on
the continent). Sweeps: §1a layer-2, §3 Anaveth, §5 row E, §5b GM layer + carrier bullet,
§6 Serene, §8 Lysa, primer fishery line; TODO W27 section 1 closed (sections 2 carrier-forks
+ 3 ecology/statblocks next); codex + dashboard regenerated. lint_map 0 errors (4 known
island-city warns).).
Prior: **2026-07-19ad** (W26
STEP 2 — the redrawn-borders lore sweep, lore-forge, sections 1–2 approved and landed;
**touches `data/cultures.json` flavor → rides the PENDING pack rebuild** (checklist row
added), everything else docs/gazetteer. **Section 1 = ruling 86**: the audit caught that
ruling 82's swap saved Fenholt's nation but not its ROLE (its marker sits 44 km from
Goldenport, 338 km from Vorsk — a coast town wearing raid-front lore) → Fenholt reverted to
an **unpainted site at (686,1311)** on the NE marsh edge (⚑ Ben's viewer click; on the
paint-overlay guide, 7 unpainted again), city-06 unnamed again; re-measures folded in
(marsh depth ~1,060 km was ~1,620; Heartholt re-anchored on Ben's brush; Brandmere's
"~636 km from the river" survives at 638). Ruling 63's Westward line re-measured 307 km vs
ruled ~300 — no change. **Section 2 = ruling 87, the carrier coast**: Goldenport §5b gains
the harbor-town string + only-fleet-in-the-west + "a signature can baptize anything"
(approved flavor call: charter sanctity launders); Lunavar §5b Quirks gains the sea-gate
(rice sold across the line into Goldenport bottoms, cache-tokens stop at the border,
west-border towns as hostage); player-safe mirrors in the primer + BOTH culture items'
flavor. **Section 3 landed: W26 [x] (closed across the day's three passes), W27 (Goldenport
full dive — the Luck-as-yield fork, carrier-coast deepening) + W28 (Canticle full dive —
largest nation, chainless, margin-invariant fork expected) queued.** Lint/validate green
throughout.).
Prior: **2026-07-19ac** (REDRAW
RULINGS APPLIED — docs/data only, no deploy impact beyond ab's pending asset push. Ben answered
the ab rulings menu → **canon rulings 81–85**: Goldenport's full-west-coast intent confirmed
(81); the Fenholt/city-17 swap kept (82); city-19 + city-25 REMOVED — gazetteer now 27 cities,
the Cities layer's 29 glyphs = 27 + painted Heartholt + Withervale (83); river timings follow
the corrected re-measure (84 — the ab delta's 968 km figure was a TRUNCATED trace missing 240 km
of channel above Elmsworth; the corrected head-of-navigation trace gives Elmsworth→Withervale
**1,444 km ≈ 13 days**, ford re-pinned at 1,008 km ≈ day 9, Withervale→Black Altar 1,178 km,
full Palewater 2,803 km — so the built session-1 sheet keeps its shape and NO narrative days
are skipped after all; Ben's 9-day retcon premise is void, flagged in the session report); and
**all four land-budget chains re-derived on the new areas** (85, dials untouched: Thalendor
14.5M / Corvaine 18.0M / Lunavar 11.6M / Malcurr 7.8M — order unchanged, famine cliffs
scale-invariant; Malcurr's "largest nation" superlative flips to Canticle). Sweeps: canon §5/
§5a/§5b/§9 + opening + session-1 script + campaign state re-timed; `water_frac.py` REWRITTEN to
measure the committed Rivers-layer export (`thyrcross-rivers.png`, NEW file) — no colour
classifier, calibration = reproduce Thalendor's recorded land_budget value (passes at 14.7%);
viewer/codex/dashboard regenerated; lint_map 0 errors. W26 step 2 (Lunavar/Goldenport lore
sweep proper) is the remaining open item.).
Prior: **2026-07-19ab** (MAP
REDRAW RE-REGISTRATION — data/docs/assets, **no engine change; needs Ben's deploy bat for the
two picker assets, no pack rebuild**. Ben repainted `Thycross.procreate` (now at
`source-materials/maps/`, W26's fix writ large): **new 2236×2976 canvas** (old 2865×3399 —
hand-redrawn, best rigid fit lands at land-IoU 0.687, so NO old-canvas coordinate survives) and
**one layer per nation**, which retires the flood-fill tracing: nation masks now come straight
off Ben's layers (`trace_regions.py` legacy). Extractor learned **clipped canvas-edge tiles**
(newer Procreate saves store e.g. 188×256 edge tiles; old saves padded to 256²). Rebuilt from
the layers: all 10 polygons + pixel-count areas (headlines: Goldenport takes the WHOLE west
coast incl. NW islands +82%, Malcurr +30%, Vorsk +28%; km_per_px 1.5→**1.5817** re-anchored on
the same 4,000 km ruling), 29 city markers globally re-matched (Hungarian on the land-registration
transform + eyeball crops; 4 nation changes incl. the ⚑ Fenholt/city-17 identity swap; city-19
+ city-25 = ⚑ ghosts, no marker on the redraw), and **Ben PAINTED three sites** — Heartholt
capital-ring (885,1514), Withervale village-square (1220,1796), Black Altar standing stones
(1282,2157) — flipped `painted:true`, paint-overlay backlog down to 7. Palewater re-traced
(2,496 km; Elmsworth→Withervale **968 km ≈ 9 days** vs the played 12 — ⚑), ford re-pinned
proportionally (676 km ≈ played fraction), land_budget water_frac re-measured off the actual
Rivers layer (Corvaine 9.1%→2.0% — its wash now stops AT the channel; Malcurr 8.5%→14.6%).
Regenerated: base `thyrcross.png` (from Ben's flattened JPG, committed), political/borders/
cities/labeled renders, viewer, paint-overlay, **wizard picker assets** (thyrcross-nations.json
+ thyrcross-map.jpg — deploy bat, then bench-test the Where-are-you-from step), codex,
dashboard. Canon §5a re-pinned (coords lint-clean, redraw banner added); MAP_CHEATSHEET +
TODO W26 updated. **All area/population/travel-figure PROSE is still pre-redraw and gated on
the redraw rulings menu delivered in-session (Fenholt binding, ghosts, Goldenport coast,
12-vs-9-day retcon, ±20% area-driven population re-derivations = the §9f-adjacent Track A).**
Gates: validate/lint-refs/tests/audit-parser/lint_map all green; lint_map warns 4 island
cities outside mainland polygons (multi-polygon support = new backlog item).).
Prior: **2026-07-19aa** (BENCH
CLOSE-OUT — docs/data-meta only; the wizard bench (deltas 19p→19z, seven take-passes in one
sitting) is DONE. (1) **NEW HOT ITEM W26**: the gazetteer's Lunavar political boundaries are
WRONG (Ben, closing the bench) — Ben edits `thyrcross.map.json` himself; the full re-pass
checklist (lint_map + re-measures, the canon/primer/cultures sweep behind the lore-forge gate,
AND regenerating the wizard's map-picker polygons — they come FROM the gazetteer) is in
TODO_WORLDBUILDING §W26. (2) Skills updated to the session's standard: test-pass-fixes
CASE_STUDIES gained §9 (the sanitizer ate the markup — hash-verify deploys, ask what the
surface does to injected content, script-added DOM bypasses cleanHTML) and §10 (the
check-before-write race family — find the two granters, delete one; src:null = locally
created; pack docs never land raw). (3) `data/cultures.json` `_meta.frame` rewritten to the
CURRENT pick-2 truth (edha-pick-expertises, the wizard-wipes/raw-lingers split) — metadata
only, no pack impact. Deploy state unchanged: everything through 19z is engine+css+assets
(deploy bat / F5); the culture pick-2 rewire + blade plotItem flag still ride the pending pack
rebuild.).
Prior: **2026-07-19z** (TAKE-SEVEN —
engine + css, F5. **The 10/11 mystery CRACKED by Ben's "brand new actor" datum**: a fresh ＋
actor showed 10/11 BEFORE any picks — only the basic-action copies exist then, so a shipped
cosmere action carries a transfer (auto-applying) ActiveEffect touching max health. Action
copies now land with transfer-AEs stripped (kits own Edha onboarding; transfer:false use-AEs
kept), plus a repair sweep on wizard open that strips them from existing pack-named action
items (console logs the culprit — ⚑ Ben pastes its name to close the file on which action it
was). **Path training rank**: the heroic path's +1 skill rank is now GRANTED, not honor-system
— a post-pick dialog lists the path's OWN skills (linkedSkills read live from the cosmere
heroic-paths pack doc at runtime, no repo copy to drift), +1 rank applied, stamped on
`edha-content.pathRankSkill`, handed back by Start over / ↺ Change heroic (no stacking on
redo); unreadable list falls back to the by-hand note. Also: every wizard dialog carries an
`edha-cw` class (injected by edhaCreatorDialogs + set on the standalone pickers) and css caps
them to the viewport with an internal scroll (windows opened bottom-off-screen); the pick-2
dialog's prose is wrapped in ONE flex child so it can't overlap the checkbox.).
Prior: **2026-07-19y** (TAKE-SIX —
engine-only, F5. **Rulings (Ben, interactive):** the take-five ×2-weapons reading is VETOED
(one weapon, always) and the weapon slot is now PATH-CURATED — "pick your heroic path, that
informs what appears on the kit's weapon slot": per-kit `weapons` lists, Ben-approved (Agent
Knife/Sidesword/Staff · Envoy Sidesword/Knife/Staff · Hunter Shortspear/Longspear/Axe · Leader
Longsword/Longspear/Mace · Scholar Knife/Mace · Warrior = open ≤2g list); a kit list naming no
real pack weapon falls back to the open list with a console warn. Other fixes: the sheet
budget bar's "Skill rnks" now uses the Edha 5+(L−1)×2 (the system advancement table says 4 at
L1 — the bar read "-1/4" on a correct PC; the wizard's math already used 5); the derived-stat
preview panel is centered; and the 10/11 rest gap got a BELT — after longRest, the finish step
re-reads max.value a beat later and tops up hea/foc/inv (a max-health AE bonus can settle
after the rest reads max; the system's rest never touches Investiture). STILL OPEN ⚑⚑: WHO
adds +1 max health on a two-Key PC — only Hardy-shaped talents carry that AE in our data; the
checklist row has the appliedEffects one-liner that names the source.).
Prior: **2026-07-19x** (FULL-HEALTH
FINISH + COIN ROW V3 — engine + css, F5. (1) "Actors aren't created at full health": attributes
are assigned AFTER Actor.create, so max health/focus grow while current stays at creation
values. Ben's ruling: the wizard's Finish runs a silent **`actor.longRest({dialog:false})`**
(real system API) after the rename — full resources, no dialog. (2) Coin row v2 root-caused off
Ben's two screenshots: the editors were injected INSIDE the system's `.currency-list`, whose
CSS collapses inputs until hover/focus (compact-header widget) — numbers invisible at rest,
letters gone when focused, oversized total box. V3: the equipment tab hides the native widget
entirely and OUR row renders AFTER the component (🪙 copper-weighted total pill + three tinted
always-visible g/s/c editors; sheet re-render refreshes the total); the header strip keeps the
compact native chip with the corrected total. Gotcha for ENGINE_INDEX-minded readers: never
inject inputs into a system component whose CSS you haven't read — the component's own state
styling applies to your children.).
Prior: **2026-07-19w** (DERIVED-STAT
PREVIEW — engine-only, F5. Ben's take-five ask: the attributes page shows a live
sheet-preview panel (Health · Focus · Investiture* · Phys/Cog/Spi defenses · Move · Recovery ·
Senses) recomputed on every stepper click, so "magic-heavy → push AWA" reads immediately. New
`edhaCwDerivedPreview(actor, cur)` + an optional `preview` hook on `edhaCwStepperDialog`.
Accuracy: health replays CONFIG.COSMERE.advancement.rules (rule.health + STR where
healthIncludeStrength — read at runtime, so a system update stays truthful); movement
[20,25,30,40,60,80] and recovery [d4…d20] use the system's ceil(attr/2) ladder; defenses
10+pair; Focus 2+WIL; Senses via the pinned edhaSensesRangeFtFromAwa; Investiture 2+max(AWA,PRE)
footnoted as the attunement-gated Edha rule. Panel states "path/item bonuses land on top". ⚑
bench row: compare the panel's final numbers to the finished sheet — a mismatch = formula
drift, quote both.).
Prior: **2026-07-19v** (TAKE-FOUR
POLISH — engine + css, F5. (1) TWO KNIVES root-caused: the picker-granted weapon carried no
`kitItem` stamp, so Start over left it behind and the re-run's pick stacked a second — now
stamped (Start over / ↺ Change heroic wipe it with the kit). AND the Agent kit's own note says
"two knives from the weapon slot": new per-kit `weaponPicks` field (Agent = 2) grants the pick
at quantity ×2 — one row, qty 2. ⚑ flagged for veto: quantity-of-the-same-weapon is the
kit-note reading; if Ben wants knife+dagger mixes, say so. (2) The weapon list + expertise
picker rows now LOOK pickable (shared .edha-cw-picklist: bordered rows, hover, visible
gold-accent radio/checkbox, blue selected state). (3) Name field = bordered .edha-cw-input.
(4) Skill intro names the 4-free-+1-heroic split at L1 (the counter was already right — a
path-granted rank reads as spent). (5) Coin row = tinted denomination pills; the native
read-only total chip derived 0 (our seeded rows carry no DataModel conversion values) — the
render hook now writes the copper-weighted sum (g=100/s=10) with a tooltip. NOTED, not
changed: edha.css §E7 still hides the native culture/ancestry components ("Edha doesn't use
cultures" — STALE since the 07-18k culture items); the header chip swap covers Ben's report,
but unhiding the native culture box on the details tab is a one-line ruling away.).
Prior: **2026-07-19u** (EXPERTISE
STACKING ON REDO — engine-only, F5. Ben: "redoing character creation doesn't wipe expertise —
then makes you pick two more. Ending up with four." A design collision, not a new bug: the
"picked origin expertises linger by design" ruling (Roshar-mirror, from the prose-only era)
meets the NEW re-pick flow, whose picker refused to count owned entries and forced 2 fresh
picks. Both halves fixed: (1) `edha-pick-expertises` stamps what it grants on actor flag
`edha-content.originPicks`; **Start over and ↺ Change (country)** wipe exactly those keys
(`edhaCreatorWipeOriginPicks` — hand-added expertises always survive; confirm/card texts
updated). (2) The picker counts already-known entries toward the pick amount and only asks for
the DIFFERENCE (0 needed → no dialog, just a toast). RAW sheet deletion of a culture item keeps
the Roshar-mirror linger (documented on the revised Remove-behavior row). ⚑ bench: Start over →
re-pick same nation = clean 2, never 4.).
Prior: **2026-07-19t** (DOUBLE UNARMED
STRIKE — engine-only, F5. Ben's console paste closed it: both copies weapon-type, `src: null` =
locally created, not imported (toObject() copies always regenerate `_stats`, so compendiumSource
is null for EVERY event-granted item — a diagnostic worth remembering). Causal chain: the
shipped basic actions (cosmere-rpg.actions) carry their own add-to-actor grant-items events
delivering the unarmed WEAPON; edhaGrantBasicActions batch-created the actions, the events fired
concurrently, and the system grant-items name-dedup (check-before-write) raced itself — the
duplicate-Key race shape, one layer down. Fix: actor-lifecycle events (add-to-actor /
remove-from-actor) are stripped from basic-action copies (kits own Edha onboarding; use-time
rules kept), and the unarmed weapon is granted deliberately ONCE — matched by
`system.id === "unarmed"` (name-proof, never touches legitimate doubles like the Agent's two
Knives), with a self-heal: a wizard open on an actor carrying doubles deletes the extras
(toast) or grants the missing one. ⚑ bench: fresh actor = exactly one; old actor heals on
wizard open.).
Prior: **2026-07-19s** (BENCH TAKE-THREE
— map WORKS; this batch: engine (F5) + module-asset push + ONE data flag riding the next pack
rebuild. (1) **Label-free map**: the letters/city labels Ben rejected come from the render
toolchain's label overlay — the wizard asset is now a downscale of the raw `thyrcross.png` base
(no new art needed for function); the bespoke **Character Creator World Map** piece is filed on
the art wishlist (new "Non-adversary assets" section, filename contract
`source-materials/maps/creator-map.jpg`). (2) **Malcurr-Stamped Blade out of the weapon picker**:
new `plotItem: true` in data/items.json → build stamps `flags.edha-content.plotItem` → the
picker skips flagged gear (plot-clue items are never starter kit; rebuild-gated). (3) **Culture
in the ancestry slot**: the header renders `ancestryItem?.name ?? "Ancestry"` — with a culture
and no ancestry the placeholder now swaps to the culture's name (render-hook; Human still wins
when present). (4) **THE CURRENCY SHEET HALF SHIPPED** (bench 07-18 rows 9–11, re-flagged 07-19
"spheres and edha coin but no g/s/c"): the system's currency-list component is read-only totals
ONLY (currency-list.hbs) — per-denomination editing does not exist in the system. The engine now
hides the Roshar spheres chip on PC currency lists and injects an editable g/s/c row on the
equipment tab writing `system.currency.edha.denominations` (array shape confirmed by the items
dump — the dump finally paid this debt). (5) **Double Unarmed Strike UNRESOLVED** — nothing
repo-side grants a weapon-type Unarmed Strike (kit has no weapon, basic-actions grant is
action-type-only, weapons section filters `item.isWeapon()`); the system pack is LevelDB-locked
while Foundry runs, so the checklist carries a ⚑⚑ console one-liner for Ben — the two
`_stats.compendiumSource` values will name the granting paths. Polygon imperfection noted as
acceptable (polygons are map-JSON truth, not art).).
Prior: **2026-07-19r** (WIZARD-START
CONSOLE ERRORS — engine-only, F5. Ben's mid-bench console paste (`connectRelationship … reading
'uuid' of null` + server-backend `undefined id`): pack copies were landing on actors WITH their
source `system.relationships` intact — the system's createItem hook walks those entries and
writes contra-links back onto whatever the uuids resolve to (the COMPENDIUM source doc); the
server rejects that write and the relationship diff then crashes the system's own updateItem
hook (Object.values over a deletion diff → a null entry). First tripped by 19q's basic-actions
grant (the system's own action items carry links); the mirrored weapons/kit gear carry dump
relationships too — same family. Fix: **`edhaCleanPackCopy(doc)`** (strips
`system.relationships` + the cosmere meta.origin flag; DataModel refills clean) now wraps EVERY
wizard copy path — basic actions, weapon pick, kit grant, culture/path picks. §10-class gotcha:
NEVER land a raw `doc.toObject()` from a pack onto an actor in this system — always through
edhaCleanPackCopy. Harmless-to-data: the bad writes were server-rejected; actors made before
the fix carry poisoned action copies (recycle test actors rather than editing those items).
[EDHA-TEST] console lines in the same paste are Ben's own `edha.debug(true)` tracer, not
errors.).
Prior: **2026-07-19q** (WIZARD TAKE-TWO —
engine + css ONLY (deploy bat push / F5-level; NO pack rebuild in this batch — the 19p culture
pick-2 rebuild is still the pending one). Ben's second bench of the wizard, seven rows.
**THE BIG ONE — the missing map was a SANITIZER kill, not a deploy gap** (Ben's deploy-bat
hypothesis checked and disproven: live module hashes matched the repo byte-for-byte, assets
included): DialogV2 runs ALL string content through `foundry.utils.cleanHTML`, whose tag
allowlist (foundry.mjs ALLOWED_HTML_TAGS) includes img/div/select/input but **NOT `<svg>`** —
the polygon overlay was silently stripped, edhaCwWireMap found no svg node and bailed, the map
wrapper stayed display:none. Fix: the SVG is created programmatically in the render callback
(script-added DOM is never sanitized); missing-asset paths console.warn loudly. The DOM logic
was verified in a live browser harness against the sanitized markup (hover tip, click-to-select,
overlay pixel-aligned). **§10-class gotcha for every future dialog: no `<svg>` (or any
non-allowlisted tag) in DialogV2/chat content strings — inject via script post-render;
input/img/select survive with their functional attributes.**
Other roots: select text clipped = Foundry pins select height to --form-field-height (~26px) —
css height:auto/min-height; the Back-button dead-end (design-gap) = NEW **↺ Change slot**
machinery (`edhaCreatorChangeSlot`): un-picks one slot scoped by the `flags.edha-content.group`
talent stamp (+ kit gear & 5-silver rollback on heroic; native path remove-events still fire);
attribute rows got ACCURATE blurbs read off the real derivations (deriveMaxHealth adds STR per
level, Focus 2+WIL, willpowerToRecoveryDie, speedToMovementRate, senses-from-AWA, Investiture
2+max(AWA,PRE) Edha rule) + LIVE per-attribute skill lists from CONFIG.COSMERE.skills; the
skills page got Physical/Cognitive/Spiritual headers and a corrected intro (the old text claimed
magic skills unlock later — WRONG: Edha registers the five colors as CORE skills, always
rankable; deity paths add no skill); NEW **`edhaCreatorWeaponPick`** (kit weapon slot: edha-items
weapons ≤ 200 c via the registered conversion rates, price·damage·skill rows, grant-on-pick) on
fresh heroic picks AND the 🎒 backfill; NEW **`edhaGrantBasicActions`** (cosmere-rpg.actions
pack, by-name idempotent) on ＋ Edha Character AND every wizard open (backfills existing PCs).
Commit hygiene note: the 9400d41 map commit swept the whole engine diff (single-file session) —
this delta is the per-fix accounting. ⚑ all in-Foundry behavior needs the bench; checklist
wizard-v2 section updated in place.).
Prior: **2026-07-19p** (WIZARD V2 —
the 07-19 bench's wizard fail/partials root-caused + Ben's three rulings built. Deploy: engine +
css + NEW module assets ride the deploy bat's module push; the culture pick-2 rewire in
`data/cultures.json`-built packs rides the SAME pending **pack rebuild + ⟳ Sync** as 19l — one
deploy still covers everything.
**Rulings (Ben, 07-19, interactive):** country step = Thyrcross MAP PICKER (dropdown stays as
fallback); deity page = browse-the-tree read-only + a flavor-only "faith" note (no path, no
mechanics); attributes/skills = FULL assignment UI now; the 07-19 mystery box was the leyline
PATH's sheet. **Defaults applied for veto:** creation numbers from legacy
Character_Building_Rules.md — attrs 12 pts at L1 (+1 at 3/6/9/12/15/18, max 3/attr at L1),
skills 5+(L−1)×2 total ranks, max rank INT((L−1)/5)+2; note the same doc's TALENT formula is
known-stale vs the engine's ruled `L+3+floor((L−1)/5)`, so these numbers need Ben's confirm
(⚑ veto rows on the checklist).
**Bug root causes:** (1) DUPLICATE KEYS (the fail) — every path item natively grants its Key
via `pathEvents` grant-items; the wizard granted it AGAIN and its name-guard raced the async
native grant → both landed (Vigilant Stance ×2, Red Leyline Attunement ×2, budget eaten). Fix:
the wizard never grants Keys — verify-warn only. (2) ROSHARAN PICK-2 — the system's
`grant-expertises` executor with `pick:true` IGNORES the rule's own expertises list and opens
its registry-backed EditExpertisesDialog (CONFIG.COSMERE = Roshar lists); our authored
per-nation lists were never shown. Fix: new handler type **`edha-pick-expertises`** (entries
JSON on the rule, exact-N enforcement, owned-entry marking, chat record, chained dialogs for
Ashkar; wizard awaits the chain). (3) Z-ORDER — nothing keeps wizard dialogs fronted; the fresh
actor sheet (and, per Ben, the leyline PATH sheet — opener still ⚑ UNPINNED, nothing in system
or engine auto-renders it; watch for recurrence) rendered over them. Fix: **`edhaCreatorDialogs`**
guard (re-front over DocumentSheetV2 only, hold() hatch) + sheet render awaited before the
wizard. (4) UNBOUND TREES — the budget step opened the COMPENDIUM tree doc (no contextActor =
read-only); fix: open the actor's embedded path-item sheet with `{tab:"talents"}` (the same
surface Ben's "leyline box should open to the talent tree" ask wants — and the deity page's
read-only browse deliberately USES the unbound render). (5) RAW @UUID — previews injected
description.value unenriched; fix `edhaCwEnrich`. Plus: "Edha PCs" find-or-create folder on the
sidebar button, dark-theme select styling (the "hideous dropdown"), map-picker assets
(`build-map-picker-asset.js` + a 1200px jpg downscale; module-src-sync FILES grew — the
map-picker hover text is the map JSON's own `region` field, nothing invented).
**New primitives:** edha-pick-expertises, edhaCreatorDialogs, edhaCwStepperDialog (+ pinned
budget helpers), edhaCwWireMap/edhaCwMapData, edhaCwEnrich — all in ENGINE_INDEX §Character
creation v2. ⚑ every in-Foundry behavior is bench-unverified; the wizard section of the
checklist was rewritten (passed 07-19 rows retired).).
Prior: **2026-07-19o** (PLAYER-CLIENT
BENCH WINDOW — repo-side only (`git pull` + open the dashboard; nothing to deploy). Ben's GM
machine moved from Wi-Fi to wired ethernet mid-bench and the internet invite link broke: the
AT&T gateway's port-30000 mapping still pointed at the old wireless adapter's DHCP lease (the
gateway blocks editing a custom service "while it is being hosted" — the fix is deleting the
NAT/Gaming HOSTED-APPLICATION row and re-adding it against the wired device entry, not touching
the Custom Service). Port re-verified reachable from outside (canyouseeme.org) — green check is
real. With the LAN player's client logged in, the checklist got a **🎮 Player-client window**
section at the top: a prose-only pointer list (NO duplicate checkbox rows — single-source rule)
ordering the cannot-test-solo rows (illusion client-veil family first, then the Playtest-2
player-permission pair, sense-through, wizard-as-player, CAE relay, sync-button visibility, GM
summon relay, Unnerving push relay, Knowledge/Order multi-player rows last), and the two fully
player-dependent sections (**Playtest-2 fixes** + **W23 adversary pipeline** incl. the Illusion
belief loop) moved up WHOLE. Section titles and row text untouched — dashboard row ids hash
section+sub+text (build-dashboard.js `rowId`), so all saved marks survive; future reorders must
follow the same rule. Dashboard regenerated.).
Prior: **2026-07-19n** (ADVERSARY WIRING
AUDIT — the PR-115 review Ben asked for ("I don't think the adversaries will function"), and he
was right: the blocks were schema-valid and gates-green but **six event rules used trigger
vocabulary nothing dispatches** ("attack-hit" ×4, "attack-missed", apply-watch "on-hit") and the
**`whenTargetFooled` +1d6 riders could never fire** (they read the phantom-copy ledger only "The
Seeming" writes — the Wrongwake/Stillback seemings are traits that never cast one). Two of the
dead patterns had already shipped in the 07-19d fens bestiary (Stillback Seize-and-Roll,
Noonwing Stoop) and were the very patterns 19l copied. Fixes, Ben-approved defaults: (1) hit
cues rewired to event `edha-on-hit` (Antler Sweep, Worry the Failing, The Stoop); (2) to-hit-only
grabs + the miss reaction get honest `NO NAMEABLE HOOK` lines (no damage write / no miss hook
exists — Drag Under, Seize and Roll, Slip the Sound); (3) NEW ENGINE PRIMITIVE
**`edha-ambush-belief`** — the lightweight seeming: on the owner's first attack per target per
scene the target rolls Perception vs the owner's `dcFrom` defense (engine-rolled, iron rule 3;
`perceptionAdvantage` 2d20kh for the Frayed Seeming), result written to the owner's own
`ambushBelief` ledger, `edhaTargetFooled` extended to read it — Thrown Voice ×2 + Causeway +
Frayed seemings now actually power their riders (pure helpers `edhaAmbushLedgerFor`/
`edhaAmbushFooledIn`, pinned in tests/, 50 passing); (4) the Fellstag's renamed ruling-40
adaptations get ENGINE ALIASES instead of dead prose copies — `edhaOwnsThorn` (Thorn Field ∨
Thorn Hedge) bakes the region hazard, Herding Antlers runs Drive the Prey's contest path (cards
named by item.name), Sudden Wall carries Sudden Growth's `edha-burst` rule verbatim, and The
Waking Ground is ENGINE-NATIVE via the embedded Green Key's Draw Mana (new lint-verified
`ENGINE-NATIVE VIA <carrier>:` marker); (5) Sevenbrand hp-below cue got its explicit atFraction
0.5. **CI now catches the whole class: `lint-refs.js` pass 6** extracts the engine's real
`edhaCueRules` call sites and fails any apply-watch cue outside that vocabulary, fails gm-cue
rules on unsupported events, and fails `whenTargetFooled` riders with no seeming source on the
actor (verified: re-injecting "attack-hit" fails the gate). Pass 5 learned the ENGINE-NATIVE VIA
exemption (carrier must be a real engine literal). The three skills got guardrails so this can't
be authored again: leyline-tree-authoring §Adversary abilities now carries the CLOSED dispatch
table + the seeming-source and alias rules (the authoritative home), lore-forge Phase 4c and
session-forge's combat bullet hard-point at it ("author from the table, never by imitating
neighboring entries — the neighbor may be the bug"). ENGINE_INDEX updated (ambush-belief,
aliases, whenTargetFooled precondition). Deploy: engine changes are **engine-only (F5)**, but the
`data/adversaries.json` rewiring rides the SAME pending **pack rebuild + ⟳ Sync** as 19l —
one rebuild still covers everything; checklist rows for both bestiaries rewritten to the new
expected behaviors. ⚑ all in-Foundry behavior (belief cards, thorn hazard on fellstag draws,
contest path on Herding Antlers, no-double-damage on engine patches) needs the bench.).
Prior: **2026-07-19m** (MALCURR SECTION 4 + CLOSE-OUT —
docs + `data/cultures.json`; the culture-item flavor change rides the SAME pending **pack
rebuild + ⟳ Sync** as the five adversary blocks (2026-07-19l) — one rebuild covers the whole
pass. Section 4 assembled prose approved and committed: **§5b Malcurr rewritten at reference
depth** (the fourth reference-shape block — the Proof + the Proving ("the proof holds"),
the Lamp-tenders/still-houses with the registers and the Tolling-stories clock, the beached
fishers + the honest-light layering, Kenmere/the Proofhall, the Sevenbrand + the quiet
Builders, the full GM layer incl. the gone-cold islands and the grain terminus), primer
Malcurr rewritten player-safe (creature folklore included, GM truths withheld),
cultures.json Malcurr synced to the primer (ruling 60), naming-table row (given names +
Coldweld exemplar) and one-scene row (the wage-coin alternate). **MALCURR IS DONE — rulings
71–80, end to end in one session:** land budget ~6.4M (cold-upland model; lake-larder fork
resolved down), hospice dial 4%/yr, Brandmere + Kenmere, the cultural-attunement framework
(76, continent-wide, retro-applied; Lunavar retro pick 78), the culture batch (79), the
bestiary (80) with five statted adversaries incl. the first deity-tree embeds. Next nation
pass starts fresh per the one-nation-one-session rule; banked concepts in W23.).
Prior: **2026-07-19l** (MALCURR STATBLOCKS — data:
**pack rebuild + ⟳ Sync needed**. Five blocks passed the Phase-4c gate (Ben approved; one
wording fix — Worry the Failing's drag-under stated concrete) and are in
`data/adversaries.json`: **Wrongwake** (rival, Blue 2 — the Thrown Voice; reuses the
`whenTargetFooled` rider family), **Wasting-Eater Wrongwake** (weaker, keeps the Voice,
loses the Reaction; ruling-34 flesh rider as explicit NO NAMEABLE HOOK), **Wake-Eel Shoal**
(minion swarm, Black — the Attendance ring cue; drag-under on bloodied targets), **Fellstag**
(rival, Green 2, inv 4 — the Kit-2 adaptations as bespoke items + Herding Antlers; blight-gray
variant notes in the bio), **Sevenbrand Construct-Smith** (rival, Red/White, inv 4 — **the
first adversary embedding DEITY-TREE talents**: Civilization/Forge Construct + Tempered Edge +
Siege Form verbatim; the talent-summons path on an adversary caster is a flagged bench first).
Folders "Malcurr Lakes Bestiary" + "Malcurr — the Sevenbrand"; bench section + five art
briefs added. Gates green incl. lint-refs pass 5. NEXT: section 4 — assembled §5b prose +
primer + cultures.json, shown to Ben before commit.).
Prior: **2026-07-19k** (MALCURR DIVE SECTION 3b —
docs only, no rebuild. The lake bestiary approved (ruling 80 + the §5c "Malcurr lakes"
block): **wrongwakes** (the Thrown Voice — Blue rival apex; sound arrives from somewhere
else; the three Blue predators' three lies), **wake-eels** (the Attendant — the ring on the
surface; gathered permanent under the gone-cold islands), **hushwings** (the Quiet —
massed seeming smears sound; thickest over the sickest water; scenery by design),
**ferry-foxes** (the Procession — pace the still-house ferries; scenery-to-minion), and
**the fellstag** (the Walking Thicket — Ben's pick from a 3×3 Green-terrain menu: rival-tier
peat-moor stag, thickets rise where it treads, Kit-2 adaptations + Drive the Prey; the
no-living-trees requirement met). Lamp layering ruled: the wrongwakes and hushwings made
the lakes trust light over sound; the vigil made the lamp holy. BANKED for future
sessions (W23): tussock-sow, heathspinner, Green kits "the Snare" and "the Closing
Arena." NEXT: the Phase-4c statblock gate — five blocks (wrongwake + wasting-eater
variant, wake-eel shoal, fellstag, Sevenbrand construct-smith) presented for Ben's stats
review; then section 4 assembly.).
Prior: **2026-07-19j** (MALCURR DIVE SECTION 3 —
docs + gazetteer only, no rebuild. The culture batch approved whole (rulings 78–79):
**Lunavar's retro cultural attunement = Green/White** (ruling 78 — the worshipped domain's
own pair, the flock carrying Olvarra's colors unknowing; the Fate-tree player breadcrumb is
a deliberate feature; closes ruling 76's ⚑). Ruling 79's Malcurr batch: the **Proving**
("the proof holds"), **Kenmere** = city-07 the capital (gazetteer + labeled map; the
Warlock's Proofhall; funding trail border → Brandmere → Kenmere), Lamp-tenders deepened
(brands of years watched; "no one goes out in the dark"; the tender's own lamp), the
**still-house registers** as the page Morrath's keepers couldn't write (the Lesser
Tolling's administrative substrate, ruling 75; the raided-grain terminus), the beached
fishers (every light on the water is a tender's now), naming deepened (Kashen/Dorvek-class
given names; surname-sequences as résumé; the milk-name insult), the **Gnothis lived-faith
slice** (lesson-offering, "witness this," the click and its undatable loss — W11's Gnothis
slot substantially covered, §8.1 and the Duskhand seam untouched), quirks + the
wage-coin one-scene alternate. GATED next: section 3b — the Blue/Black lake bestiary.).
Prior: **2026-07-19i** (MALCURR DIVE SECTION 2 —
docs + gazetteer only, no rebuild. GM-truth forks approved (rulings 73–77): **Brandmere**
(city-09 named, gazetteer site + labeled map re-rendered) with **the Sevenbrand** war-coin
forge — ruling 57's deferred names closed, the PC reads-the-marks hook live; still-house
souls ruled **transit density** ("islands that have gone cold" — no second collector, no
new clock); the Lesser Tolling import = an early **guild-pressure** clock (masters who
can't die mean credentials that never free); and the big one — **the cultural-attunement
framework (ruling 76)**: nations carry a ground palette AND a cultural palette, invested
split by walk of life (devout → god's pair; land/water trades → ground), second color by
proximity/affinity — applied retroactively (Thalendor culturally Black/White on Green
ground; Corvaine White twice over; Vorsk/Kettavar already aligned; ⚑ Lunavar's retro pick
pending). **Malcurr: culture Red, ground Blue, Black by event** (ruling 77) — Red/Green
religious default, Red/White southern forge-towns incl. the quiet-Kethane construct-smiths
(Civilization tree as written — the Tyrith-manipulability GM seam), Red/Blue lakeside;
bestiary direction Blue/Black (migrations + stagnations); Lamp-tenders Warlock-chartered.
Supersedes ruling 39's "Malcurr Blue/Black" for invested; ruling 39's deity-tree tell
intact. GATED next: section 3 culture items + capital + naming + Lunavar retro proposal.).
Prior: **2026-07-19h** (MALCURR DIVE SECTION 1 —
docs + gazetteer only, no rebuild. The Malcurr full-depth pass opened per the
one-nation-one-session rule; section 1 (land-budget dials + terrain + hospice dial) approved
with recommended defaults and committed: **rulings 71–72** + the gazetteer `land_budget`.
Measured: 1,089,432 km² — the largest nation — 8.5% water (real drawn lakes), east coast,
borders Kettavar/Vorsk/Corvaine, 4 city markers. The cold-upland model: cleared 10%, hardy
grains at 2.0M kcal/ha, default herd composition → **~6.4M people, fourth most populous**.
The W24 lake-larder fork resolved DOWN (ruling 27's fish set-aside stands — thin glacial
fisheries; the lakes are the nation's ROADS; the fishery's closure-by-distrust is texture,
not a model term). Hospice dial ~4%/yr (ruling 72): ~510k stuck-dying, one household in
three; **Corvaine domesticated the burden, Malcurr industrialized it** — the derivation of
the Warlock's easy war-coin. Terrain-synthesis ⚑ settled (§10); §9's mangled ruling-68
header (a Lunavar-session edit artifact) repaired. GATED next: section 2 GM-truth forks,
then culture, bestiary, assembly.).
Prior: **2026-07-19g** (SESSION-REVIEW HYGIENE, docs
only, no rebuild — Ben asked for a skills+docs sweep of the Lunavar session. Forge-skill
additions (lore-forge): absence-is-not-evidence (derive implied geography before defaulting a
dial — the Westward-line correction), costly-customs-need-material-drivers (the noonwing
lesson), Phase-3 point 5 mine-Ben's-answers (the Moon-is-Olvarra answer pattern), Phase-4b
margin invariant (default dials pin humans at ~23.4% — approved hunger claims need composition
dials; staple/herd/uncounted-larder are the levers; Malcurr will hit the same fork), and
the-ecology-slice-is-part-of-the-nation-pass (~4–6 creatures, Ben: "more than two per entire
country"). session-forge: check the nation's §5c bestiary before inventing encounter
creatures. Gap fixes found by the sweep: §5b Vorsk/Lunavar border-blending paragraph was
stale vs rulings 67/70 (equilibrium-cracking + night-war clauses added); §10 gains the ⚑
jamming-start-date derived default (seal-era, flip freely); W11 notes Olvarra's lived-faith
slot is substantially covered by the Lunavar pass; W15 notes Lunavar as new evidence (a FED
god, still famine-status); W24 records per-nation inheritances (Malcurr's marsh-larder fork +
forge name, Goldenport's ruling-63 terminus + W12, Kettavar's Black/Blue ecology owe).).
Prior: **2026-07-19f** (NOONWING STATTED — Ben approved
the block at the statblock gate: rival, White rank 2, fly 80/soar, the Patterned Eye +
Thermal Rider traits (untouchable aloft → Stoop +7/2d8+2 prone-or-snatch → grounded window →
climb-out), Wingstorm takeoff cover, bloodied = climbs away. In `data/adversaries.json`
("Lunavar Fens Bestiary" — six blocks there now), bench row + art brief added. `inv` left to
the ruling-49 default for attuned blocks. Same pending **pack rebuild + ⟳ Sync** covers it.
This closes the Lunavar pass end to end: rulings 62–70, the culture at reference depth, the
land budget, Moonmere/Fenholt, six creatures, six statted adversaries, primer + culture item
synced. LUNAVAR IS DONE — next nation pass starts fresh per the one-nation-one-session rule.).
Prior: **2026-07-19e** (THE NOONWINGS — Ben's
nocturnality note answered: Lunavar's night calendar needed a driver besides doctrine, three
diurnal-apex concepts were proposed, Ben picked A. Ruling 70 + canon §5c block: a White
thermal-soaring raptor that reads WORKED PATTERN from kilometers up — it punishes *working*
by day (deriving "work happens in the Lantern's hours" literally), is grounded by night/rain/
fog (soaring needs convection), and is dodged by traveling broken + watching the stitchbirds
(a broken stitch means wings up). The layering is the ruling: the night calendar is OLDER
than the doctrine — the noonwings made Lunavar nocturnal, the Lantern made it holy. §5b
night-calendar bullet re-grounded; primer + `data/cultures.json` flavor synced (same pending
rebuild). Famine arc: the herd cull ate their larder — patrols longer, smaller patterns read
as prey, dawn/dusk margins thinning. Docs + the one data file; NO engine change. Noonwing
statblock (rival, White rank 2) presented at the statblock gate — NOT yet committed, awaiting
Ben's stats review per the 19c process rule.). Prior:
**2026-07-19d** (LUNAVAR FENS BESTIARY STATTED —
the first pass through the new statblock gate (2026-07-19c's process rule): Ben approved the
five blocks' stats/actions/defenses in review, and they're now in `data/adversaries.json` in
their own "Lunavar Fens Bestiary" folder — Drownlight Colony (pair-attuned blue+black minion,
no attack, the False Lantern lure), Reedling (minion swarm), Gone-to-Weir Fen-Heart (boss;
size "large"/creatureType "custom" — the repo enum has no huge/plant, it PLAYS huge at 3x3–4x4;
goes still at 0 HP instead of dying, near-zero gm-cue at atFraction 0.05 is a first), Stillback
(rival; Causeway Seeming + the mistheron's whenTargetFooled damage-rider verbatim), and
Wasting-Eater Stillback (weaker variant, no morale cue by design — NO NAMEABLE HOOK line).
**Pack rebuild + ⟳ Sync needed** (rides the same rebuild as 19c's culture item); five bench
rows added incl. the two-color-minion Key auto-embed check (ruling 49's first two-color case).
Art wishlist Batch 2 briefs written (drownlight-colony / reedling / gone-to-weir-fen-heart /
stillback / wasting-eater-stillback). Gates green — validate caught size/creatureType enum
limits, fixed in-block. NEXT OPEN ITEM from Ben, mid-review: Lunavar's nocturnality needs a
non-doctrinal driver — a diurnal active-hunting apex predator; 2–3 concepts to be proposed,
Ben picks one, it enters the bestiary through the same statblock gate.). Prior:
**2026-07-19c** (LUNAVAR WORLDBUILDING PASS —
the full lore-forge nation dive, rulings 62–69; docs + one data file, NO engine change. Pack
rebuild + ⟳ Sync needed ONLY for `data/cultures.json` (the Lunavar culture item's flavor
re-synced to the new primer text per ruling 60 — flavor-only, one bench row); everything else
is docs. The headlines: **the rice-and-marsh land budget** (ruling 62 — ~12.2M, third most
populous; the marsh larder closed by the plague-well persistence + ruling-34 transmission is
the mechanism under "thin marsh margins"); **the Westward Green line** (ruling 63 — Ben's
derivation, geometry-verified; Verdannis's drain is continent-wide, Lunavar's mark is the
failed paddy bonus; control case survives in kind); **the Moon is a facet of Olvarra**
(rulings 64–66 — thread §8.4 resolved to GM canon; worship of the DOMAIN feeds her, no
Lunavite knows, hard line; the Child's readings are her weak true signal; the Fetch jams the
pools with counterfeit omens; the seal-night grief reading is a second seal-dating archive
beside the keepers' rolls); **Moonmere + Fenholt named** (ruling 68 — city-23/city-06,
gazetteer + labeled map re-rendered, 26 markers left); **the marsh bestiary** (ruling 69 —
Black/Blue drownlights with the pair-attunement framework extension, White stitchbirds
scenery-only, Green fen-hearts/reedlings "gone to weir", the rival-tier stillback; mistheron
range extended). NEW PROCESS RULE baked into lore-forge Phase 4c + session-forge: after Ben
approves a bestiary, the next turn is the same bestiary as Foundry adversary blocks — **the
approval of the stat blocks is the gate, not the approval of the animal ideas**; the Lunavar
blocks are drafted and awaiting that review. NPCs: Ysel (the Child), Meriv the Eldest-Once.
W7 resolved; W24 Lunavar complete — §5b Lunavar is the third reference-shape block.). Prior:
**2026-07-19b** (MULTI-WIZARD KEY WINDOW — Ben on the 07-19 "accepted edge": benches run with MULTIPLE actors open, so the single-global clobber is a real bench hazard, not a never-happens. ENGINE-only → relaunch/F5. `edhaCreatorWindow` (one global id) → **`edhaCreatorWindows`** (a per-actor SET): each wizard adds its actor id on open and deletes it in its `finally`, so any number of wizards coexist and closing one locks only ITS actor's Keys. `edhaKeyPickAllowed` now checks membership with a duck-typed `.has` (NOT `instanceof Set` — the vm-realm unit tests inject a host-realm Set, and cross-realm instanceof would always be false; same class of trap as the test file's existing array-prototype note). Bonus guard the Set makes free: opening the SAME actor's wizard twice now no-ops with an "already open" toast instead of stacking two walkthroughs whose finally-blocks would fight over the window. Test updated to pin the multi-actor shape (two actors open → both pass, delete one → only its window closes); new ⚑ "Two wizards at once" bench row.). Prior: **2026-07-19** (WIZARD REVIEW FIXES — a full second-eyes review of PR #111 (the 18l wizard) BEFORE merge: every load-bearing claim re-verified against the build sources (Key flags `group`/`specialty` match the path-item names exactly, one Key per heroic path and leyline color, deity trees have NO Keys so the no-deity-Key behavior is correct, the heroic pack ships ONLY the six `EDHA_KITS` paths, culture removal strips only the cultural expertise, all gates + dashboard sync green) — the wizard merged clean, then FOUR review items landed as this follow-up. ENGINE + docs only → relaunch/F5; NO pack rebuild, NO ⟳ Sync. (1) CHECKLIST FALSE-FAIL FIX: the "Start over on a leveled PC" row said "budget 7 at L3" — `edhaAllowedTalents` is `L+3+floor((L-1)/5)` = **6** at L3; benching against 7 would have filed a phantom bug. (2) KIT BACKFILL (Ben-approved): the heroic "Already chosen" page now detects a heroic path with NO `kitPath` flag (an actor made pre-kit, or the path dragged by hand — the native flow never grants kits) and offers **🎒 Grant the kit**; granting re-shows the page ("again" loop) without the button, and the welcome checklist's heroic row says "kit NOT granted — the heroic page offers it". New ⚑ bench row. (3) The restart chat card only claims "kit gear + its 5 silver" when a kit was actually granted (`hadKit` read before the wipe). (4) The deity "Already chosen" wording no longer calls deity a level-1 pick — swap by deleting the path item, no Start-over needed. Noted-NOT-fixed (accepted edge): `edhaCreatorWindow` is a single global, so two wizards open at once on ONE client clobber each other's Key window — leveled-restart-only, realistically never at this table.). Prior: **2026-07-18l** (CHARACTER-CREATION WIZARD — §9j #5 DONE, and with it THE PLAYER-FACING PIPELINE (#0–#5) IS COMPLETE. Design-gated as ordered: the 8-question menu went to Ben FIRST and the build encodes his answers — both surfaces; a hand-holding MODAL wizard (partial/resumed characters use the native sheet: E6 slots + double-click-the-path tree — the wizard is the first-time walkthrough); Keys auto-granted (every heroic path and leyline tree has exactly ONE Key, verified); deity step visible but skippable ("usually earned in play — GM's call"); budget surfaced as a live counter + open-tree buttons with the EXISTING preCreateItem gate as the only enforcement (one-per-tree stays advisory text); NO Human-ancestry auto-grant (the ⚑ bench row decides whether the sheet demands one); NO nation actor-flag (the owned culture item IS the state — no dual truth); re-run = **Start over**, a LEVEL-1 RESET that keeps the actor's level so a leveled PC re-picks with the full allowed(L) budget. ENGINE + CSS only (`register-skills.js` + `edha.css`) → `deploy-to-foundry.bat` (or module-src sync) + relaunch/F5; NO pack rebuild, NO ⟳ Sync. The build composes existing primitives ONLY (iron rule 2): `edhaCreationWizard(actor)` (`edha.creationWizard`; GM `edha.newCharacter`) walks welcome-checklist → country (creates the culture item — ITS events fire the cultural grant + the ⚑ unbenched pick-2, so a pick-dialog failure reproduces identically in both bench sections, report once) → heroic path (path item + its Key + `edhaGrantStartingKit`) → leyline attunement (path item grants Draw Mana natively + Attunement Key) → deity (skippable) → budget spend (`edhaCreationState` live counter; open-tree buttons via `system.talentTree`) → purse + name (renders the culture card's Names / You-might-be text; renames actor + prototype token; summary chat card). Surfaces: GM "＋ Edha Character" in the Actors-sidebar footer (creates the actor — preCreateActor stamps PC token defaults — opens sheet + wizard) and an owner-visible sheet bar ("🧭 Character Creation" / "⟲ Redo Creation…"). Start over: `edhaCreationWipeIds` (pure, pinned) wipes talents/paths/culture/ancestry/`kitItem`-stamped gear + pulls the kit's 5 silver back, keeps level; the wizard's per-actor `edhaCreatorWindow` lets the budget gate re-accept Keys above L1 (`edhaKeyPickAllowed`, pure, pinned — budget itself still enforced); picked origin expertises linger by design (confirm + card say so). ONE pre-bench bug fixed en route: **the 07-18j `edhaGrantStartingKit` NEVER created its items** — it passed its docs ARRAY through `edhaCreateItemDocs`, which wraps its argument in another array (one-doc helper), so `createEmbeddedDocuments` got `[[…]]`; the ⚑ 07-18j bench row would have failed on first touch. Now a direct array create; each kit item stamped `flags.edha-content.kitItem` (restart wipe marker) and actor flag `kitPath` makes the grant once-only (`{force:true}` re-grants). NEW `tests/creation.test.js` pins edhaCreationState / edhaCreationWipeIds / edhaKeyPickAllowed. New "Character-creation wizard" bench section (7 rows — the wizard is UI, nothing is self-verifiable headless).). Prior: **2026-07-18k** (COUNTRY-OF-ORIGIN CULTURE ITEMS — §9j #3 DONE via the full lore-forge Phase-3 walk (frame → per-nation expertise lists → description blocks → assembled items, each section Ben-approved in order; rulings 60–61). DATA + BUILD → `deploy-to-foundry.bat` → relaunch; NO engine change; NO ⟳ Sync (no owned culture copies exist yet). NEW `data/cultures.json`: ten native `culture`-type items (one per nation incl. Ashkar-as-diaspora) + the trivial Human ancestry fallback, built by a new cultures/ancestry branch in foundry-build's items scope into edha-items (new Cultures + Ancestry folders; pack 102 → 113 docs). The frame: each item auto-grants `cultural:<nation>` (add-to-actor `grant-expertises`, remove strips ONLY the cultural expertise — mirrors the shipped Roshar cultures) plus a **pick-2** origin-expertise event using the handler's native `pick:true` mode — ⚑ THE ONE REAL RISK: no shipped item uses pick mode, UI unverified, bench first; if broken the items degrade gracefully to prose lists. Ashkar instead picks one other nation's cultural expertise + one road-life entry. 48 origin expertises across the ten lists, every entry derived from a named §5b custom and carrying its own "As a character with X expertise, you can…" line (SR register: free recall + tests others can't make, no numeric bonus). Item flavor is EDHA_PLAYER_PRIMER.md §nations VERBATIM — a primer edit must sweep `data/cultures.json` (noted in its `_meta`). Ruling 61: NO language subsystem — Thyrcross speaks a common tongue (primer gained the player-safe line; cants stay flavor). Icons: core-SVG placeholders (art-pass swap). New "Culture items" bench section (7 rows: folders appear, cultural grant, ⚑ pick dialog, Ashkar double pick, remove behavior, ⚑ does-the-sheet-demand-ancestry, icons). CI's pack-build step caught one follow-up: `validate-packs.js`'s edha-items guard demanded description+PRICE on every doc — culture/ancestry items rightly have no price; the guard now counts cultures.json docs in `want` and exempts the two origin types from the price check (verified against a scratch all-packs build: 113/113, 0 issues). NEXT in §9j: #5 the character-creation menu design questions — the last gate before the creator build.). Prior: **2026-07-18j** (THE ITEMS-DUMP TRANCHE — Ben's paste cashed in four queues at once: currency denominations SEEDED (the bench-9/10 "one uneditable field" was an unseeded array — even the system's own spheres ships `denominations:[]`; new characters seed gold→silver→copper at create, existing backfill at ready), the CAE BRIDGE (CAE v1.3.1 has NO api but its tracker is plain combatant flags → `edhaCaeGrant` pushes named "Edha: <talent>" action/reaction groups with a `cae-flag` GM relay; five use-grants + Through the Fray + Foresight/Sidestep combat-start + Tactical Ploy/Feinting reaction burns wired, honor-system fallback outside combat; the positional/cadence remainder itemized in §9j #1b), the ITEMS MIRROR (89 shipped items as rawSystem passthrough re-priced at 3 mk = 10 c — longsword 60 mk = 2 g anchor; 30 isMoney sphere/gem loot EXCLUDED, edha currency replaces Roshar money; 13 Roshar-flavored entries in `_meta._review` for Ben; pack 102 items, validators green), and the STARTING-KIT GRANT (`edha.grantStartingKit(actor, path)` — base + ruling-59 path packs + 5-silver purse; weapon slot stays the player's pick). Culture schemas confirmed simple (description + linkedSkills + events; 6 Roshar cultures + Human ancestry captured) — §9j #3's remaining gate is the CONTENT walk (per-nation expertise lists). New "Items-dump tranche" bench section (6 rows). Deploy: `deploy-to-foundry.bat` → relaunch. LESSON repeated and fixed in-flight: a gate chained after `;` instead of `&&` let one lint failure into a commit again — amended; the delta-18g rule stands, don't pipe or sequence past the gate that decides.). Prior: **2026-07-18i** (ORPHAN-TOKEN COMBAT GUARD — live fix for "combat isn't starting": a token whose world actor was deleted (the 07-17c duplicate-purge workflow leaves these) crashed Advanced Encounters' initiative getter (`actor.system` read, no null guard) during combat data-prep, killing the whole encounter. ENGINE-only `preCreateCombatant` veto: actor-less combatants are SKIPPED with a named toast instead — combat starts with everyone real. Immediate table unblock, no deploy: `canvas.scene.tokens.filter(t => !t.actor)` lists the orphans; delete them + any half-created encounter. One checklist row in the heroic section.). Prior: **2026-07-18h** (THE HEROIC WIRING PASS — all 133 heroic talents reviewed and classified WIRED / CAE-NEXT / MANUAL; quarry core, Rousing cluster, contest gates, command dice, stance riders, on-hit riders, Opportunity credits; Cosmere Advanced Encounters surfaced and gated; see the **2026-07-18h** delta immediately below). Prior: **2026-07-18g** (BENCH 07-18 FIXES — all 7 fails + 1 partial root-caused: deploy script never built the items pack, cross-tree prereq resolution, Clear Mind/Focused Mind AEs, speed-AE double-count, NEW stance state machine, PC token defaults; currency-sheet rows gated on the items dump; see the **2026-07-18g** delta immediately below). Prior: **2026-07-18f** (THE PLAYER-FACING PIPELINE — heroic copy-in DONE + edha-items scaffold + §9j rescoped; data + build + module.json → full relaunch + ⟳ Sync; see the **2026-07-18f** delta below). Prior: **2026-07-18e** (CURRENCY WIRING + §9j OPENED — engine-only → F5/relaunch; see the **2026-07-18e** delta below). Prior: **2026-07-18d** (W25 CURRENCY CANON — docs-only lore pass; see the **2026-07-18d** delta below). Prior: **2026-07-18c** (THE CHECKLIST CONSOLIDATION — Ben: "clean up the outdated items, consolidate into a refreshed list"; see the **2026-07-18c** delta below). Prior: **2026-07-18b** (ADVERSARY PACK SYNC — the per-deploy "re-drag every adversary" step is retired by a GM ⟳ Sync; see the **2026-07-18b** delta below). Prior: **2026-07-18** (the all-in-one dashboard — `EDHA_DASHBOARD.html` replaces the bench sheet; see the **2026-07-18** delta below). Prior: **2026-07-17c** (the bench-results pass — 9 fail/partial rows root-caused against the system source + Ben's world DB; deploy-to-foundry.bat + relaunch + re-drag all adversaries; see the bold **2026-07-17c** delta immediately below). Prior: **2026-07-16d** (DEPLOY-BLOCKER HOTFIX, build script only — NO engine/data/pack change, nothing to re-author. Ben's `deploy-to-foundry.bat` crashed at [4 of 5] on `ReferenceError: Cannot access 'events' before initialization` in `foundry-build.js` `advItemDoc`: the 16 adversary-events pass added a `const events = {}` block BELOW the `system` object that already referenced `events`, so the `const` TDZ threw the moment any adversary was built (leyline/deity/heroic packs had already written; adversaries never did). Fix = moved the `events` declaration ABOVE the `system` object — its deps (`activation`/`damage`/`descValue`/`spec`/`advName`) were all defined earlier, so a pure reorder. Verified: `node --check` + validate + lint-refs green, and a full `scope=adversaries` build into a scratch `EDHA_MODROOT` produced 13 adversaries / 55 embedded items with no error (live packs untouched). Fixing [4 of 5] then exposed a SECOND deploy blocker hiding behind it at **[5 of 5]** — `validate-adversaries.js` failed with **✗ 12 issues**, every one "talent embed is type \"trait\" — must be an action-typed twin". Root cause: the validator's regression guard (`validate-adversaries.js:78`) dates from 07-14m, when the ONLY `adversaryTalent`-flagged embeds were tree-talent twins (all action-typed), so it demanded `it.type === "action"`. The 16 pass added **bespoke trait/action abilities that are ALSO flagged `adversaryTalent`** (Combat Training, Cinder Coat, Pack Tactics, Veil, Glyph Pulse, Phase 2, Predictive Ward, Mutation Upgrade, …) — a bespoke *trait* renders fine on the sheet (the sheet renders trait/weapon/action) but tripped the too-strict guard. Same class as the TDZ: 16 updated the build, engine gates, and lint-refs but not this validator, because `validate-adversaries.js` only runs against Ben's compiled packs — skipped locally AND in CI, so it only fires at deploy step 5. Fix = the guard now rejects only a genuinely-invisible type (anything not in the rendered set `{trait, weapon, action}`), catching the real 07-14 failure mode (a stray `talent`-type embed) while admitting bespoke traits. Verified for real: built a scratch `scope=adversaries` pack and ran `validate-adversaries.js` against it (honors `EDHA_MODROOT`) — reproduced Ben's 12 failures on the old guard, **✓ 0 issues** + exit 0 on the new one. Ben re-ran `deploy-to-foundry.bat` (Foundry closed) — **all 5 steps passed**, deploy clean end to end. **Both fixes then GATED in CI so the class can't recur**: `validate.yml` gained a "Pack build + validate" step that builds every pack into a scratch `EDHA_MODROOT` (classic-level installed just-in-time via `npm install --no-save`, pinned to Foundry's `2.0.0` for pack-format parity) and runs `validate-packs.js` + `validate-adversaries.js` — the previously deploy-ONLY validators now run on every PR. This is the exact gap that let BOTH of today's bugs reach Ben's step 5: the whole `buildAdversaries` → `validate-adversaries.js` path needs compiled LevelDB packs, so it ran nowhere in CI. Verified locally: `foundry-build.js all` + both validators exit 0 on the fixed tree (and the old guard reproduced the 12 failures pre-fix). Finally, the checklist's stale **"DEPLOY FIRST"** section — still claiming the module was "frozen at the 06-16 Green build" — was rewritten as **"DEPLOY STATE"**: records module+packs current through 16c + the 16d fixes, states that PC tokens are LINKED (never re-dragged; only adversaries are unlinked snapshots) and PCs need no ⟳ Sync from the recent engine-only passes, and that the sole per-deploy manual step is the adversary re-drag. Test sheet regenerated. **Nothing else outstanding for the playtest to continue — re-drag the adversaries and play.**)

**2026-07-18h** (THE HEROIC WIRING PASS — Ben: "review and wire all heroic talents." ALL 133 unique heroic talents classified into THREE classes in the new HEROIC PATHS engine header (iron rule 3 — the ledger IS the no-silent-cards record): **WIRED** (engine name-based + authored events/effects), **CAE-NEXT** (action/reaction economy against **Cosmere Advanced Encounters** — Ben mid-pass: INSTALLED, zero prior repo references, per-combatant action/reaction tracker; Automated Actions is NOT installed and won't be, Draw Mana covers its ground better; every entry queued in §9j #1b with its hook class named [grant-action / grant-reaction / burn-reaction / cost-discount / cadence], GATED on the items dump's NEW CAE capture section — module api/settings/combatant flags, start a throwaway combat before pasting), and **MANUAL** (genuinely no hook, shrunk to: motivation-knowledge, identity beats, GM strength-reads, the crafting/fabrial cluster, the companion cluster, Shard gear, hit→graze). ENGINE (→ relaunch): the **quarry core** (Seek Quarry/Tagging Shot mark; attack advantage vs quarry; Cold Eyes defeat-rider; Pack Hunting ally bonus); the **Rousing Presence cluster** (Determined + owned riders: Lessons' +1 focus auto, Instill/Devoted/Stalwart/Rallying listed); **contest gates** via the new `EDHA_HEROIC_DEFTESTS` table (Steadfast Challenge → Disoriented + counted disadvantage, Valiant Intervention, Tactical Ploy → −1d4 stamp, Synchronized Assault success/fail cards, Set at Odds, Turning Point, Sharp Eye → whispered data reveal) + fixed-DC self-rolls (Grand Deception; **Field Medicine** DC 15 → recovery-die + Medicine heal with Resuscitation note — ⚑ recovery-die path guessed); the **command-die cluster** (`edhaCommandDie` scaling, upgrade self-add cards, Decisive Command carries Relentless March + Authority); **Resilient Hero** HP-floor veto; **Wary** (Surprised veto while focus > 0 + involuntary-drain reduction); **Feinting Strike** on-hit focus drain (`edhaDrainFocus`, Whispered-Doubt write pattern + zero-check); **Galvanize** recovery-die focus restore (⚑ same path guess); numeric **stance riders** baked into the stance marker (Stone/Vine/Bloodstance) + stance **skill advantage** (Flame→Intimidation, Iron→Insight, Wind→Agility) + **Practiced Kata** combatStart auto-enter; **Opportunity credits** (the four adder talents bank +1 Opportunity; the menu cashes it naming the source); Overwhelm with Details; Risky Behavior via raiseStakes. DATA (→ pack rebuild + ⟳ Sync): on-hit events — Cheap Shot (Stunned), Startling Blow (Surprised), Shattering Blow (5-ft push), Subtle Takedown/Anatomical Insight/Meteoric Leap (cues) — + Anatomical Insight's `edha-opportunity-option` menu entry. New 15-row "Heroic wiring pass" bench section. Gates green (41 tests; lint 150+ literals). The CAE surfacing is the pass's biggest find: a module the repo had NEVER heard of invalidated the whole "trusted action economy" bucket — the items dump now captures it, and §9j #1b is the wiring tranche it unblocks.)

**2026-07-18g** (BENCH 07-18 FIXES — Ben's first dashboard-driven results block (7 ✗ / 1 ◐ / 18 ✓), every row root-caused; ENGINE + DATA + BUILD + deploy script → `deploy-to-foundry.bat` (now builds the items pack) → relaunch → ⟳ Sync; re-drag heroic talents whose PREREQS are under test. Root causes, one line each: (1) **items pack empty+locked** = the DEPLOY SCRIPT never built it — bat [4/5] enumerated leyline/deity/heroic/adversaries only, the `items` scope from #105 never ran on Ben's machine, Foundry rendered the module.json-declared pack empty; bat gained the items build AND `validate-packs.js` now HARD-FAILS a missing/short/underfilled edha-items (an unbuilt declared pack can never pass step [5/5] again). (2) **"two prereqs with the same name, one unmet"** (blocked Devastating Blow + Hardy testing) = classifyToken resolved prose Prerequisites through the GLOBAL first-writer byName index while 28 names collide across trees — Warrior's "Combat Training" prereq pointed at the HUNTER copy; prose clauses now resolve TREE-LOCAL first (global fallback), verified scratch-build: 0 cross-tree prose prereqs remain pack-wide (the same-named edge+prose double LISTING remains, both now satisfiable together — ⚑ re-test row; a first-draft fix that SKIPPED pure-drawn prose groups was reverted after inspection showed the edge prereq lives on the tree NODE, not the talent doc — the skip would have stripped doc-level prereqs). (3) **Clear Mind dead** = a determinable passive the copy-in's sweep missed (it only checked the inert-marker list, not the 47 no-source list); whole-tree audit found the unreported sibling **Focused Mind** (Leader, identical text) — both wired with the Composed-shape AE (`foc.max.bonus +@tier`). (4) **Surefooted +20 not +10** = `edhaDeriveSheetStats` folded `rate.bonus` into the Speed override while the DerivedValueField getter adds `.bonus` ON TOP of the override — every speed AE double-counted (Walking Ruin latent too); override now excludes bonus, pinned regression test (41 green). (5) **"stances aren't wired at all"** = TRUE — the free system declares `modality:"stance"` but ships zero machinery (its own AEs are inert): NEW generic **stance state machine**, keyed on the FIELD (all 7 stances + future ones wire themselves): use = enter (marker AE, talent name/img, `edha-content.stanceOf`), other stances end first, use again = leave; `edhaActiveStance(actor)` exposes state; the per-stance riders stay §9j-named against this marker. (6) **Test-actor name hidden + short vision** (freeform note) = Foundry's blank prototype token on new characters: `preCreateActor` now sets displayName HOVER(30) + cosmere "sense" sight (attenuation 0.1, range = Senses Range from AWA); an updateActor watcher (single GM applier) keeps prototype+placed tokens in step with AWA; **`edha.fixPcTokens()`** retrofits existing PCs (run once for Test/Test Warrior). (7) **currency-sheet rows (✗9–11)** = BLOCKED-ON-SCHEMA, not registration: even the system's spheres ships `denominations:[]` on actors (one uneditable derived field is what an unseeded currency looks like) — the items dump now ALSO captures the character-actor DataModel + a sample PC's currency source; seeding + spheres handling wire next session from ground truth. Works-as-designed: the item-sheet "mk" default dropdown (mirror pass re-prices, §9j #2). Checklist: 07-18f/e sections rewritten → one "Bench 07-18 fixes re-test" section (10 rows incl. THE PASTE). Gates green (41 engine tests; scratch build + both pack validators exit 0). LESSON, tooling: piping gates through `| tail -1` masks their exit codes — one lint failure slipped into a commit mid-pass and was caught by re-running unpiped; don't pipe the gate that decides.)

**2026-07-18f** (THE PLAYER-FACING PIPELINE — heroic copy-in DONE + edha-items scaffold + items/culture dump script + §9j RESCOPED. DATA + BUILD + `module.json` → `deploy-to-foundry.bat` → **FULL relaunch** (new `edha-items` pack declared) → **⟳ Sync** (owned heroic talents pick up the copied automation); NO engine change this pass. Ben's rescope, answered and executed: (1) **the heroic "gap" explained and closed** — heroic talents ROLLED (side-table tests/damage/AEs) but `events:{}`/blank activation on ~all 150 (Decisive Command was the proof at playtest-2); the shipped pack is a one-time QUARRY, not a runtime dependency — after this pass it's dead to us. **Copy-in DONE**: source = `cosmere-rpg.heroic-paths` ONLY (own packs never a source; 9 edha-leyline name-collisions excluded); 102 authored entries across the 6 heroic files gained real activation blocks (31 structured Focus consumes, reaction/special costs) + 7 tier-scaling damage formulas (Devastating Blow `(2+max(@tier-2,0))d8` replaces the flat bootstrap). CAUGHT IN REVIEW: the system's shipped AEs are ALL INERT (empty `changes`) — the first transform draft replaced our WORKING side-table AEs (Composed's +@tier focus) with them and was reverted; final rule = ours win unless the system effect actually carries changes (16 inert markers skipped, 0 imported). Added the two determinable missing passives: **Hardy +@level max HP** (mirrors the benched leyline AE, same card text; 3 heroic copies) and **Surefooted +10 speed** (terrain-reduction half → §9j backlog). NEW build map `STANCE_TALENTS` sets `modality:"stance"` on the 7 stances (overlay schema untouched — no fingerprint churn). Zero cost-drift between imported costs and card text. The **47 no-source talents** (free-tier gaps) are now a NAMED wiring backlog in §9j. (2) **edha-items RESCOPED to mirror-and-own** (Ben: "build edha-items and pull over the shipped pack ones — same as the heroic talents"): scaffold BUILT — `data/items.json` (12 Edha items: the kit pieces the system lacks + 4 trade-token characterization items + the Malcurr-Stamped Blade clue weapon, all priced natively c/s/g via `price.denomination`), new foundry-build **`items` scope** → `edha-items` pack, module.json declaration (⇒ full relaunch), deliberately core-SVG icons (no 404-invisible art; art pass later). The shipped-gear mirror is GATED on **the items dump**: NEW `scripts/items-dump-console.js` (read-only paste) captures full gear docs + culture/ancestry DataModels + expertise CONFIG → ⚑ **BEN: paste once, commit as `source-materials/edha-items-dump.json`**. (3) **Ancestry is REPLACED by country-of-origin** (Ben): new §9j item — one native `culture`-type item per nation (type confirmed in itemTypes) carrying a per-nation expertise list + flavor + the primer's "who you might be"; expertise lists are gated invented content (derive from §5b, walk with Ben first); sits AHEAD of the creator. §9j rewritten as the ordered pipeline: dump → copy-in ✓ → items mirror → cultures → kit wiring → creator (design-gated). §9h edha-items bullet superseded in place. New bench section "Heroic copy-in + edha-items" (8 rows: pack appears, price display ⚑, real costs on Contingency/Steadfast Challenge, tier formula ⚑, Hardy HP, Surefooted speed, stance exclusivity ⚑, ⟳ Sync carry). Verified here: scope=items + scope=all scratch builds green, validate-packs + validate-adversaries exit 0, full gate suite + 40 engine tests green.)

**2026-07-18e** (CURRENCY WIRING + §9j OPENED — ENGINE-only (`register-skills.js`) → reaches Ben via `deploy-to-foundry.bat` (or module-src sync) + relaunch/F5; NO pack rebuild, NO data change, NO ⟳ Sync. Built the §9h **engine currency primitive** the same day its W25 gate cleared: new `EDHA_CURRENCY` + `edhaRegisterCurrency` (after the statuses block) registers ONE `edha` currency ("Edha Coin") — denominations **gold(100)/silver(10)/copper(base,1)**, units `g`/`s`/`c`, array-ordered **gold→silver→copper** so a sheet honoring array order reads big → normal → small (Ben's ruling-54 readability call; flavor names stroke/seal/charter never reach the sheet). Registration mirrors the leyline-skills idiom: the documented `game.system.api.registerCurrency` (schema dump 07-17c) when present + a direct `CONFIG.COSMERE.currencies` write in the system's own `spheres` shape, idempotent at load/init/setup (the actor DataModel derives its currency fields from the registered set, so registration precedes schema build), plus a ready-check console line. NEW BENCH SECTION "Currency wiring" (5 rows, engine-only deploy): currency renders on a PC sheet; ⚑ denomination display order (array vs re-sort); ⚑ spheres-row coexistence/hideability; ⚑ pre-existing-actor field backfill; icon renders (`icons/svg/chest.svg`). Item-level re-pricing (`price.currency:"edha"`) deliberately NOT wired — decided with the fleet weapon migration (§9h). **§9j OPENED (Ben's ask — heroic-path & character-creation initiative,** character creation imminent): (1) the heroic talent **copy-in** (UNBLOCKED by the committed 133/133 heroic dump; needs the pack-preference rule for the 87 duplicates, then rebuild + ⟳ Sync), (2) **heroic starting-kit wiring** (ruling-59 kits → per-path manifests + a GM grant flow `edha.grantStartingKit(actor, path)` composing `create-item`; purse write ⚑ needs the bench-verified currency field shape first), (3) **character-creation menu design** (DESIGN-GATED like §9i — questions first: guided flow vs checklist, where it lives, how much automates; only the kit-grant piece is buildable ahead of the design). Also swept the last "⚑ W25 — no currency canon yet" stragglers: session-forge SKILL.md + RUN_SHEET_TEMPLATE.md now denominate worth in c/s/g against the §5d anchors (descriptive food-pay kept where ruling 56 keeps it). ENGINE_INDEX gained the Currency section. Gates green incl. 40 engine tests; dashboard regenerated (new bench rows + §9j on the Engine tab). ⚑ everything bench-facing is in the new checklist section.)

**2026-07-18d** (W25 CURRENCY CANON — DOCS-ONLY lore pass (canon + primer + state + TODO + this doc), NO engine change, NO data change, NO pack change, nothing to deploy. The full lore-forge W25 walk, six sections approved by Ben in order per the Phase-3 gate: (1) **the monetary frame** — the Goldenport standard ("port coin"), ruling 54; (2) **per-nation money customs** for all ten nations (written money / performed rates / coin-as-credential / writs of arrears / vat-ration chits / warband shares / cache-tokens / obligation economy / exact measure / dead coin), ruling 55; (3) **famine pricing tracks the calorie deficit, not the famine label** (session-1's "payment is food" is Thalendor/Lunavar-local; Corvaine = credit crisis + firewood premium; "the year of cheap meat"), ruling 56; (4) **the traceable Malcurr war-coin** (funding-as-procurement; can't-be-anonymous by credential law; Malcurri PCs read forge-marks natively — Ben's add), ruling 57; (5) **denominations**: mechanical **copper/silver/gold 1:10:100** — Ben's ruling: players never convert flavor names in their heads; stroke/seal/charter + ribbon-edge are description/dialogue only; sheet must read **gold → silver → copper** big → small — plus price anchors + exchange quotes, rulings 54/58; (6) **starting wealth + heroic-path kits**, ruling 59 — 5 silver nation-flavored at equal value, the uniform ≤ 2-gold usable-weapon slot (self-balancing vs the lwp/hwp skill split — Ben's second-pass catch: a flat weapon grant made Warrior strictly best), and path packs keyed to each path's KEY TALENT (verified from `data/cosmere.json`: Opportunist / Rousing Presence / Seek Quarry / Decisive Command / Erudition / Vigilant Stance). Files: canon **§5d** (new) + **rulings 54–59**; primer "Money in Thyrcross" + "Starting wealth & kit" sections (player-safe mirrors, GM war-coin block + the Luck excluded); state doc §1a re-denominated c/s/g; TODO_WORLDBUILDING **W25 → [x]**; **§9h currency primitive: both gates cleared, now buildable** — denominations named, 3 ⚑ bench/wiring questions recorded on the item (sheet denomination ordering, spheres-row hiding, item re-pricing vs conversion line). Codex + dashboard regenerated. UNBLOCKED downstream: the §9h engine currency wiring, run-sheet loot ledgers' worth column, character-creation starting gear. Nothing for the bench until the currency wiring ships.)

**2026-07-18c** (THE CHECKLIST CONSOLIDATION — docs + dashboard only, NO engine change, NO data change, nothing to deploy. Ben, after merging the adversary sync: "clean up all of the items in the dashboard that are outdated — a lot are repeats of 'deploy and resync' or 'redrag and test' — consolidate into a refreshed list." The blocker was knowing WHICH old rows were actually done: the 07-17 bench's 44-row results block was pasted in chat, never committed — so this session RECOVERED IT VERBATIM from the prior session's transcript (`~/.claude/projects/.../61fb03ec….jsonl`; checklist stamp @7d2fa99d4b, 35 ✓ / 4 ✗ / 5 ◐) and consolidated against ground truth, not guesses. What changed in `EDHA_FOUNDRY_TEST_CHECKLIST.md` (1458 → 1127 lines; dashboard 691 → 555 rows, bench 544 → 436): (1) **every 07-17 ✓ row retired** — Decisive Command, the 4 bench-sheet rows, codex opens, sight model, Pack Tactics, Kneel veto, Break cues, schema dump (committed), armor check (system armor works natively — §9h answer recorded), currency glance (spheres → W25), adversary Draw Mana/numbering/folders/ranks, illusion-loop tokens + `.jpeg` art variant, sheetScale/hover/palette, forced-move stamp, Civ setup + Lay Foundation + Siege Form + the fortified-Region watch-item, Black-07-05 setup + Draw Mana isolation + Dread Presence + Withering Ray cost cell + both watch-items. (2) **every ✗/◐ row replaced by its 07-17c re-test row** (picker, Beak, senses, sense-through, Seeming hover/recast, Siege-Form gate, Shortsword, Mistheron sheet) — the old copies removed with pointers. (3) **whole sections deleted as fully resolved/superseded**: the 07-14p bench-sheet section (sheet replaced by the dashboard, all 4 rows passed), the 07-15 equipment section (all 4 rows resolved), Readable Dark 07-12c (aggregate row passed + a week of daily use), Pass-3 follow-ups 07-12b and Black pass-2 07-12 (every row duplicated in newer sections or passed — the unique Unnerving Approach push row MIGRATED into the Black 07-05 section). (4) **all per-section "## 0. Setup" blocks and deploy-instruction title prose removed** — DEPLOY STATE is now the single deploy-truth source; useful table-setup context became one prose line per section. (5) **cross-section duplicates merged** (Predatory Patience ×4 → 2 aspects, Cruel Step ×3 → 1, Sapping Hex, Coercive Pressure, Trade Routes, Sanguine readout, Predator's Due, Withering-Ray screenshot ×2 → 1; 07-16 + 07-16b merged into one "Adversary ability wiring" section; the codex rows proven by the real PR-#92 edit loop retired). (6) `build-dashboard.js`'s parser-drift floor re-based 600 → 400 (the guard tripped on the legitimate 691→555 shrink — the check is row-count-based and can't tell consolidation from parser rot; comment says why). ⚠ MARK-CARRYOVER CAVEAT for Ben: dashboard marks are keyed by section-title+row-text, and most sections were retitled — locally-saved marks from BEFORE this refresh won't re-attach (the 44 already-pasted results are exactly what got retired, so nothing reported is lost; if you hold UNPASTED marks, Copy-for-Claude before pulling). Verified: dashboard rebuilt + `--check` green, rendered in-browser (DEPLOY STATE banner, all tabs populate, 0 console errors). Row inventory now: 436 bench rows, every one a genuinely-untested behavior.)

**2026-07-18b** (ADVERSARY PACK SYNC — the per-deploy "RE-DRAG every adversary" step is RETIRED. ENGINE + CSS only (`register-skills.js` + `edha.css`) — reaches Ben via `deploy-to-foundry.bat` (or module-src sync) + relaunch; NO pack rebuild, NO data change, PC ⟳ Sync unaffected. Ben asked whether world adversaries could sync from the compendium like PCs, "given the names stay the same" — the answer is yes, and IN PLACE beats a re-drag. Two build facts make it clean: a dragged world actor is stamped `_stats.compendiumSource` pointing at its pack entry, and `foundry-build.js` mints DETERMINISTIC ids (sha1 `fid`s) for pack actors AND every embedded item, so that pointer and the item ids stay valid across rebuilds. NEW engine section (after the PC ⟳ Sync utility): **`edhaSyncAdversaryActor(actor)`** re-pulls a world adversary from the pack while KEEPING its actor id — placed scene tokens stay attached with their position/HP/combat state (unlinked-token damage lives in the token delta, untouched). Item pass: pack-built copies (edha-content-flagged, or colliding with a source item by id/name) are deleted and re-created from source WITH their pack ids (`keepId` — token-delta references keep resolving); hand-added items survive (pure decision **`edhaAdvSyncPlan`**, pinned ×2 in tests/). Actor pass: `system` + `prototypeToken` replaced WHOLESALE (`recursive:false, diff:false` — importFromJSON semantics minus name/folder/ownership; a merge would keep removed skills/overrides forever), `img` + `flags.edha-content` refreshed. Token pass: the prototype's token-level fields (texture/sight/disposition/bars/display/size) are PUSHED onto every placed token of the actor on every scene — so the 07-17c vision-model fix and future art drops land on standing tokens, which a re-drag never did (you'd re-place instead). **`edhaSyncAllAdversaries()`** (GM-only) runs it over every world adversary — including stale sidebar duplicates (the 07-17c "FIVE Corvaine Raiders" gotcha: ALL copies become current), SKIPPING any copy whose name differs from its resolved source (a rename = a customized variant; its own sheet button syncs it explicitly). Matching: compendiumSource → legacy `flags.core.sourceId` → exact name in the pack. UI: a "⟳ Sync from Pack" bar under the adversary sheet header (hook `renderAdversarySheet` — the class name is ground-truthed from Ben's 07-12 console evidence, ⚑ the injection point is not) + a **"⟳ Sync Adversaries from Pack"** button in the Actors-sidebar footer (`renderActorDirectory`) + console API `edha.syncAllAdversaries()` / `edha.syncAdversary(actor)`. KNOWN LIMITS (documented, not bugs): token-delta OVERRIDES persist (a field changed on a placed token mid-play keeps its override — sync between fights, not mid-combat), and the WORLD actor's HP resets to full like a fresh drag (placed tokens keep theirs). Docs swept: checklist DEPLOY STATE + a new ⚑ section, AUTHORING_WORKFLOW step 4, leyline-tree-authoring SKILL.md deploy fact, ENGINE_INDEX entry. 40 engine tests green (was 38). ⚑ everything bench-facing: both buttons render/work, an existing token picks up the `whenTargetFooled` + vision fixes without re-drag, renamed-copy skip, hand-added-item survival, HP/position preservation.)

**2026-07-18** (THE ALL-IN-ONE DASHBOARD — repo tooling + docs, NO engine change, NO data change, NO pack change; nothing to deploy in Foundry. Ben asked for the bench sheet to become the one-stop shop for every outstanding item across the repo. NEW `scripts/build-dashboard.js` → `EDHA_DASHBOARD.html` (repo root, double-click to open) **replaces** `scripts/build-test-sheet.js` + `EDHA_FOUNDRY_TEST_SHEET.html` (both deleted). Six tabs: **Bench** (the checklist, unchanged rows — SAME localStorage key + row-id recipe, so existing marks survive), **Art** (`EDHA_ADVERSARY_ART_WISHLIST.md` briefs + the `painted:false` sites/cities from `thyrcross.map.json`), **Worldbuilding** (`TODO_WORLDBUILDING.md` W-items with their update logs collapsed under a details toggle + canon §8 open threads + canon §10 ⚑ provisionals + the state doc's threads/clocks/next-session), **Engine** (handoff §9 — the open items in §9c/9d/9f/9h/9i were REFORMATTED to `- [ ]` checkboxes this pass so the parser reads them; §9e/§9g stay prose — + triage B/C + the forced-movement pilot's open verifies), **Repo** (`TODO_REPO_HYGIENE.md`), and **⚑ For Ben** (computed: every open non-bench ⚑ item with a jump-to-source link — bench ⚑ means "bench-verify" and stays on Bench). Global: the checklist's DEPLOY STATE section renders as an always-visible collapsible banner under the header; per-section session-hide (sessionStorage — clears when the browser window closes, built earlier the same day on the old sheet and ported); per-tab progress counts; one Copy-for-Claude button emitting all marked rows grouped by tab/section (bench rows keep the Phase-0 format). Non-bench rows get a single ✓ done toggle + note (local only — the source MD stays truth until an agent updates it); read-only status rows (threads/clocks, stays-manual talents) take notes but no toggle. Gates rewired: `validate.yml` step is now `build-dashboard.js --check` (paths widened to TODO_*/triage/pilot/dashboard), pre-commit checks the dashboard whenever ANY source doc is staged, scripts/README + CLAUDE.md + the checklist header re-pointed. Deterministic (per-source content stamps, LF-normalized reads — the three-times-earned 15d rule). ⚑ bench rows: open the dashboard in Ben's browser, confirm old bench marks survived, tab through Art/Worldbuilding/Engine/Repo/For-Ben, session-hide + jump links.)

**2026-07-17c** (BENCH-RESULTS PASS — Ben's first full sheet-driven results block (44 rows: 35 ✓ / 4 ✗ / 5 ◐), all nine fail/partial observations root-caused with GROUND TRUTH read off Ben's machine (Foundry closed): the system 2.1.0 SOURCE (cloned at Release 2.1.0), foundry.mjs 13.351, the live packs, the WORLD DB (actors + scene tokens + tonight's chat log), and the server error log. Deploy: **`deploy-to-foundry.bat` → relaunch → RE-DRAG every adversary; ⟳ Sync optional** (only Forge Construct's owned card text lags without it). The root causes, one line each — (1) **Single-target picker dead click** = Foundry v13 REMOVED `User#updateTokenTargets` (zero hits in foundry.mjs; the chat log shows the 03:02:05 picker card with no roll after it) → new REUSABLE `edhaSetUserTargets` on `Token#setTarget`, both consumers retrofitted (the AoE burst capture's try/caught call had been silently no-opping too). (2) **Spearing Beak's dead icon** = a FAMILY bug born with the system 2.1.0 upgrade: an engine-injected damage rider ("+ (1d6)[Spearing Beak]") makes the hit roll carry more dice than the graze clone built from `@damage.dice` (the clone strips non-dice terms), and `DamageRoll#replaceDieResults` copies results BY INDEX → `this.dice[1]` undefined → the TypeError rejects `use()` before any card, so the click looks dead; EVERY `edha-damage-rider` with a `bonusFormula` (Prognosis, Momentum's Edge, …) died this way — Bite survived only because Kindle's bonusFormula is empty; benches that passed riders predate the upgrade. Fix = a die-count guard patched onto the registered DamageRoll class (graze mirrors the BASE dice; the rider — a hit bonus — stays out of graze, also the correct rule). (3) **`whenTargetFooled` was being STRIPPED** — the 07-16 wiring authored it on the rule but never declared it in the `edha-damage-rider` handler schema (the same silent-drop class as an unregistered handler type, 07-16b): the world Mistherons hold the rule WITHOUT the gate, so the +1d6 would have applied to every hit → field registered; re-drag Mistherons to pick it back up. (4) **Seeming recast "didn't create a token"** — it DID (chat log: summon + sweep at 02:59:24 and 02:59:45); clear-on-recast deleted only the copy ACTOR, Foundry never cascades actor→token, so the stale token orphaned in place and the new copy stacked exactly on it → `edhaClearPhantomDoubles` is now TOKEN-first (the generic last-token summon cleanup deletes the actor, same shape as `edhaCivDismantleGM`), and the phantom deleteToken cascade's redundant `void a.delete()` (which raced that cleanup into the server's 22:29:04 "Actor does not exist" and couldn't catch its own rejection) is gone. (5) **Seeming copy showed no hover name** — `edhaSummon` never set `displayName` (→ NONE); all summons now default OWNER_HOVER and phantom copies inherit the DUPLICATED token's mode. (6) **Siege Cannon fired with Siege Form off** (design-gap in the 07-17 interim) → new REUSABLE mode gate: extra summon items may declare `requiresEffect:"<baked effect>"` (builder stamps `requiresSummonEffect`; generic preUseItem gate blocks with a toast, nothing spent), Siege Cannon = first consumer, plus a name shim so the gate is live on relaunch + re-summon without the deity rebuild/Sync. (7) **Adversary tokens "can't see beyond 10 ft unless lit" — Ben's ruling: same vision rules as players unless bespoke** → the 07-16c sight block lacked the system's PC shape: PC prototype tokens carry the cosmere `visionMode:"sense"` + attenuation 0.1 (verified in the world DB); the build now mirrors it, range stays Senses Range, a block's `senses` field remains the bespoke override. (8) **"Shortsword is under actions" = a STALE WORLD ACTOR** — Ben's world holds FIVE Corvaine Raider actors; only the newest drag has the weapon-type item (world-DB verified — NEW GOTCHA: every compendium drag creates ANOTHER world actor; old ones linger in the sidebar looking identical — open the newest or purge). The pipe-cleaner's guessed fields are also now dump-corrected: `system.type` is the weapon CATEGORY light_wpn/heavy_wpn (choices-validated — the old slug guess only survived via lenient-load fallback), range lives at `attack.range{value,long,unit}`, `damage.skill` set, `expertise` not `expert`. (9) **Sense-through reveals ✗ — CLARIFICATION REQUESTED**: the force-show half acts only on PLAYER clients (the GM renders everything already), so a solo-GM bench cannot exercise it — the re-test row now says to log a second client; if the FAIL was observed another way, Ben should say what he saw. ALSO: Ben's **heroic schema dump is committed** (`source-materials/edha-heroic-dump.json` — **133/133 found, 0 missing**, 87 duplicated across packs → the 07-17b copy-in session is unblocked and needs a pack-preference rule), the GM-lore-in-biography question is ANSWERED (adversaries ship `ownership.default 0` — players cannot open the sheet at all; but note Foundry's LIMITED permission shows exactly the biography, so GM-only lore in it is safe only while ownership stays 0), and the "spheres" currency rename is recorded under W25 (registerCurrency API confirmed by the dump; still lore-gated). 38 engine tests green; every fix ⚑ (no live table from here).)

**2026-07-17** (PLAYTEST-2 FIXES — Ben's four reports from the previous night's session, all four ROOT-CAUSED and fixed ENGINE-only (relaunch/F5; NO pack rebuild, NO ⟳ Sync). (1) **White Draw Mana "lack permission to edit actor"** — the ally-heal pulse called `edhaHealActor` (a direct `actor.update`), but a PLAYER doesn't own their allies' actors; routed through the existing `edhaCrossHeal` GM-relay (the same relay Black weaken already used — self stays a direct heal, always owned). (2) **Black Draw Mana leaked the GM-only "X behind a wall" sweep to the player** — a Foundry whisper is ALWAYS visible to its AUTHOR, and `edhaDrawMana` runs on the USING client, so the player who used it authored (and saw) the hidden/behind-a-wall counts the 07-12b ruling meant to withhold; new **`edhaPostGmCard`** primitive posts that card from the GM client (direct if we're the GM, else a new `gm-card` socket relay; no GM online → nothing posted). The public card was already clean and is unchanged. (3) **Decisive Command's d4 never appeared** — the heroic Leader talent was completely unwired (`events:{}`); wired name-based to grant the targeted ally `+1d4[Decisive Command]` on their next test via the `nextTestMod.formula` pipeline (Probability Net's −1d6 mechanism, inverted). (4) **Siege Cannon & Construct Slam don't target a token / test defense** — `type:action` skill_test items can't expose target defense (the native target+auto-test flow belongs to weapon-type items = the open 07-15 migration); **Ben ruled: defer to the weapon migration.** Interim shipped: the summon extra-item builder now builds a damage-bearing extra item as a skill_test attack (rolls a d20 Athletics to-hit + carries the melee/ranged `attackKind` flag) so Siege Cannon reaches parity with Slam instead of being a no-roll utility. 38 engine tests green. Full delta below; ⚑ two rows need a live table — the GM-card relay and the d4 injection.)

**2026-07-17b** (HEROIC-WIRING INITIATIVE OPENED — repo tooling + docs, NO engine/data/pack change, nothing to deploy. Ben: "wire the heroic talents — they should already be wired in the cosmere data." Investigation reframed the task: the repo's cosmere data (`data/cosmere.json`, all copies) is PROSE-ONLY (Path/Name/Action/Cost/Description/Tags — zero activation/damage/events), and the mechanical schema that DOES exist in the side tables (`talent-rolls.json` = 23 heroic skill_test/damage, `talent-effects.json` = 5 baked AEs) is ALREADY carried in the authored heroic files, NOT masked — verified per-talent (Feinting Strike rolls hwp, Devastating Blow deals 2d8, Composed carries its AE). So those talents already ROLL; what's universally missing is the edha-* EVENT automation (auto-apply effects/riders/triggers) — `events:{}` on all 150 — and that exists NOWHERE in the repo to copy. **Ben's ruling: copy it from the base cosmere-rpg SYSTEM** (the edha module reimplemented these Heroic-Path talents as self-contained copies and dropped the system's automation). Repo sessions can't read the system/official-content compendia (same blocker as the 07-15 weapon migration), so NEW `scripts/heroic-schema-dump-console.js` — a READ-ONLY GM-console dump that scans every compendium for the 130 heroic talents by name and captures each match's full object (activation/damage/effects/flags/whole system subtree) + the talent DataModel + a FOUND/MISSING/DUPLICATE coverage report (edha-homebrew talents with no base source fall out as MISSING → a from-scratch job). Ben runs it, commits the JSON to `source-materials/system-schemas/`, and the next session copies each talent's real schema into `data/authored/heroic-*.json`. NEXT: Ben runs the dump; then the copy-in + a pack rebuild.)

**2026-07-16c** (THE MANUAL-INVENTORY RE-LITIGATION — Ben challenged one "lighting is a table read" rationale, got the full declared-manual inventory (22 numbered items across data, skills, and every tree header), and ruled every line. Built this pass: **the sight model** (edhaCanSee darkness gate — daylight assumed seen, unlit targets seen only to the viewer's Senses Range; the rules text WAS saved, Character_Building_Rules.md §Senses Range, AWA 0→10ft … 5+→30ft; supersedes ruling R4's "GM-judged" clause; adversary tokens now ship sight.enabled with range = Senses Range so Foundry natively renders lit areas beyond it, new per-block `senses` field, ⚑ senses DataModel shape unverified); **the aggro ledger** (Ben's Pack Tactics puzzle: targeting is per-USER and the GM owns every adversary → each attacker TOKEN remembers its last attack target; `edha-pack-advantage` grants advantage off living packmates' entries, whispered card names the packmate); **dark-veil auto-toggle** (`edha-dark-veil`: Stalker Veil's LIGHT half auto-toggles on the illumination test; cover stays a table read; manual toggles never fought); **sense-through-obstruction reveals** (Void Sense's Omen-bearers + Reaper's Harvest remains render to owners' clients through walls/fog — the client-veil wrap gained a force-SHOW half; GM-hidden never revealed); **Kneel's movement ENFORCED** (Ben D11 — kneelBy stamp + preUpdateToken veto, only distance-closing moves pass; Absolute Authority's ACTION choice stays D10-manual); **all five E items built** (Unweaving pick-one dispel card — target.effects IS enumerable; Dense Tissue push-immunity via the new `edhaHostileMove` stamp threaded through every push path; Living Image one-click turn-start upkeep; Set Charge trigger arms — moves/damaged/enters watchers superseding the 06-16 "declared text" ruling, detonation stays the owner's click; Apex Form's mutations-doubled now genuinely ×2 in the math); the stale Overgrowth header line fixed. STAYS MANUAL by explicit ruling: intent-reveals (C), forced ACTION choice + willing consent (D10/D14), Blue Foresight's cluster (F), the prior G rulings. **§9i OPENED** — the combat/encounter engine rework (the whole trusted-action-economy class + Aid/forced-action grants, Ben D12/13; design session gated, never piecemeal). Deploy: `deploy-to-foundry.bat` + relaunch + **re-drag ALL adversaries**. 38 engine tests green. Full delta below.)

**2026-07-16b** (PER-BIRD SEEMINGS + THE PLAYTEST-9 WIRING PASS + THE STANDARD BAKED INTO THE SKILLS — Ben's three asks, same day as the morning pass. (1) **Per-token phantom ownership**: unlinked adversary tokens can share one world actor id (copy-pasted tokens always do), so the max-1 seeming slot was shared between two Mistherons — copies now carry `phantomCasterTok` and `edhaPhantomOwnedBy` (pure, pinned) keys clear-on-recast / `whenTargetFooled` / the seeming-break cue by CASTER TOKEN with actor-id fallback. (2) **The original 9 playtest adversaries got the full wiring pass** (menu-approved: `braced` + `diagrammed` statuses, turn-start cue over per-action spam): new primitives `edha-self-status` (Brace ×2), `edha-next-test-mod` + `nextTestMod.formula` (Probability Net −1d6 auto-injected, labeled), `edha-thorns` (Cinder Coat auto splash-back, chain-guarded), cue triggers `enemy-turn-start`/`turn-end` (Reactive Strike, Glyph Pulse), `statusExpire` on triggered-effects (Frost Lance timed Slowed), the Vital Diagram mark + Scalpel-Strike's `whenTargetStatus` +4, the name-keyed Suture Cradle watcher (Discipline vs DC 10+damage auto-rolled — contest core), Phase 2's hp-crossing cue, and Bite's Kindle light rider; superseded hand-toggle AEs removed. **ALSO FIXES A LATENT MORNING BUG: `edha-gm-cue` was never REGISTERED as a handler type — unregistered handler types are silently dropped by the DataModel, the same class as a bad 16-char rule id.** The only hand-run abilities left carry a written `NO NAMEABLE HOOK: <reason>` (Combat Training ⚑ garbled source sentence — Ben to rule, NOT silently fixed; Pack Tactics — NPC intent isn't data; Veil — cover is a table read; Mutation Upgrade — wants a whenSelfEffect rider condition someday). (3) **The standard is now enforced and taught**: `lint-refs.js` pass 5 FAILS any trigger-naming adversary ability with no events/engine-wiring/rationale (negative-tested); leyline-tree-authoring SKILL.md §"Adversary abilities", session-forge's stats bullet, test-pass-fixes Phase 2 + CASE_STUDIES §8 (the unreachable case), CLAUDE.md, AUTHORING_WORKFLOW, and the adversaries.json `_README` all carry it; the stale "Phase-3 trigger model" and "no duration-expiry engine" claims corrected. **Deploy: `deploy-to-foundry.bat` + relaunch + RE-DRAG every adversary (session-1 AND playtest); NO ⟳ Sync.** 37 engine tests green. Full delta below.)

**2026-07-16** (ADVERSARY ABILITY-TEXT → HOOKS PASS — Ben's "The Seeming doesn't work" report root-caused to the **unreachable-case family**: the 07-14o engine case existed but a raw `item.type !== "talent"` useItem gate bailed before the switch, AND bespoke `adv.items` abilities never carried the `adversaryTalent` flag that the flag-aware gates honor. Fixed at the shared cause — build now flags bespoke trait/action abilities, 27 raw talent-type gates retrofitted to `edhaIsTalent` (including the authored-rule iterators that were silently killing twins' copied damage-riders/on-hit rules on adversaries), and `lint-refs.js` pass 4 forbids the family recurring (deliberate strict sites carry `type-strict` markers). The whole-actor audit then wired the five OTHER text-only abilities Ben's report didn't name — Spearing Beak's +1d6-vs-fooled (new `whenTargetFooled` rider condition reading the belief ledger), and GM cue cards (new generic `edha-gm-cue`: damaged / hp-below / ally-drops / seeming-break / on-hit) for Fade, Break ×2, Cover Their Retreat, Press the Line's rider, and the three morale traits (Ben's ruling: text that names a hook gets a cue — a bare 'GM-run' label is no longer enough). Bespoke adversary abilities can now author native event rules (simplified `events` array; the build mints fid ids) — the porting gap that made "coding the leylines with agents harder than it needs to be" is closed at the schema level, with lint + validate coverage. ALSO SETTLED: every session-1 placeholder name confirmed (Roek, Ashmark, Joskin, Sorrel, Warden Selm) + statblock feel approved. **Deploy: `deploy-to-foundry.bat` + relaunch + RE-DRAG all session-1 actors and Mistherons; NO ⟳ Sync.** Full delta below; 36 engine tests green.)

**2026-07-15f** (FIRST CODEX-EDIT LOOP CLOSED + RULINGS 50–53 — docs + gazetteer only, NO engine change, NO pack change, nothing to deploy. The 15e editable-codex pipeline ran for real within hours of merging: Ben edited the §5 nations table in his browser, ⬆ committed with his PAT, and PR #92 appeared with the codex-sync gate correctly red — the designed wake-up signal, which Ben initially read as "all checks failed"; **it is the system working** (a codex-edits PR = Ben wrote canon without a session; the session regenerates and reviews). This session did the review: regenerated the codex (gate green), surfaced what each edit actually decided, and walked Ben through a 3-item menu + one full-text lore gate. Results: **ruling 50** — Thalendor's church = Verdannis, established (consolidates ruling 5's most-devout line; the conclave at Heartholt is its structure); **ruling 51** — the tenth nation's name **Ashkar is final** (gazetteer `name_provisional` cleared; labeled map + viewer re-rendered without the star); **ruling 52** — Ashkar's collapse cause CONFIRMED as Razkael's century-plus residence (ruling 35's ⚑ hypothesis promoted; swept §3, §5a, §5b, §8.2, §10); **ruling 53** — the one Ben's table edit couldn't mean two ways: **Vorsk has a real, established Tyrith church** (Ben picked "real church" over the leyline-shorthand reading when the §5b contradiction was surfaced). Full text approved before commit per the lore gate: "the Iron Congregation" — rooted in the last few years, **unnaturally fast (the GM tell it's being fed)**, command preached as theology, chaplains riding with raids; §5b's heading "prayer has none" superseded → "the new god preaches command"; §3 Tyrith, the §5 table, the differentiator table, and the player primer (player-safe cut + a chaplain "You might be") all updated together. Dead-Razkael texture (broken shrines, "Flame take it") deliberately untouched. Process note for future codex-edit reviews: Ben's browser edits can RESOLVE ⚑s and CREATE contradictions in the same diff — diff against §5b/§3 before regenerating, and the rulings-menu batch still applies even though the edit is already committed on the branch.)

**2026-07-15e** (CANON CODEX IS NOW EDITABLE — repo tooling + docs, NO engine change, NO data change, NO pack change; nothing to deploy, three new ⚑ bench rows. Ben asked for in-browser canon editing that persists to the MD and the repo, chose the full shape (file write + GitHub commit) from the design menu. `build-canon-codex.js` reworked: the six MD-engine functions (esc/slugify/parseMd/makeLinkifier/inline/renderDoc) are now declared once and **embedded into the page verbatim via Function.toString**, so the browser's post-edit re-render is byte-identical to the build render (verified: `rerender()` on unedited source === build HTML). `parseMd` blocks now carry source line ranges (`l0:l1` as a `data-l` attribute) — ✏ edit mode opens any block as its raw markdown in a textarea; save splices exactly those lines (verified: a heading edit diffs the MD by that one line and nothing else), re-renders article + TOC live, and supports empty=delete and save-+-add-below. Persistence, weakest to strongest: (1) **localStorage draft** on every save, with a restore/discard banner after reload (verified) and a stamp-mismatch warning if the codex was rebuilt under the draft; (2) **💾 File System Access write** to `EDHA_CAMPAIGN_CANON.md` — Ben picks the file once (handle remembered in IndexedDB), a pre-write disk read warns if someone else edited the canon since the codex was built; Chrome/Edge only, button stays disabled elsewhere; (3) **⬆ GitHub commit** via the Contents API to branch `codex-canon-edits` (created from main on demand) + auto-opened PR — fine-grained PAT (Contents+Pulls write) stored in his localStorage with a forget button; CI on that PR will correctly flag the codex HTML stale, which is the wake-up signal for the next session, not an error. The page still cannot run git or regenerate itself — sessions fold browser edits into rulings and regen (MAP_CHEATSHEET now instructs: treat a codex-edits PR as "Ben wrote canon without a session", delete the branch on merge, and `git status` the canon MD before assuming it untouched). A `beforeunload` guard protects dirty state. ⚑ Bench: edit round-trip + draft restore, 💾 into the real working-tree file, ⬆ commit+PR with a real PAT (all three have checklist rows). Not verifiable from a session: the file:// picker flow on Ben's own browser.)

**2026-07-15d** (MAP PAINT WORKFLOW + CANON CODEX — repo tooling + docs, NO engine change, NO data change, NO pack change; nothing to deploy, two ⚑ bench rows are browser/Procreate checks on Ben's machine. Ben asked for (a) a workflow that gets session-forged places onto his hand-drawn `Thycross.procreate`, and (b) a human-facing way to read the canon ("no easy way to find which city is Thalendor's capital by name" — it's **Heartholt**, and that lookup taking a grep was the point). Both shapes were design-approved by Ben before building. (1) **The paint loop**: NEW `scripts/map/paint_overlay.py` renders `source-materials/maps/paint-overlay.png` — a transparent PNG at exactly canvas size (gazetteer px ARE Procreate canvas px, so placements transfer 1:1) with a magenta crosshair + haloed label for every place flagged `painted: false`. Ben imports it into Procreate as a top guide layer, paints under the markers, deletes the layer, flags flip to true, re-extract refreshes the traced layers (the script warns when the `.procreate` stamp says extraction is stale; `--list` prints the backlog). Gazetteer sites now carry the flag (all 6 current sites unpainted — Heartholt, Elmsworth, Palewater Ford, Withervale, Black Altar Crossing, Aldercourt-the-naming-of-city-18); `lint_map.py` ERRORS on a site (or named city) missing the flag so session-forge can't forget it. (2) **The Atlas+Codex**: NEW `scripts/build-canon-codex.js` generates `EDHA_CANON_CODEX.html` (repo root, committed, double-click to open) from canon MD + gazetteer — pan/zoom Thyrcross map with every place clickable (capitals ★, unpainted 🖌), canon rendered with TOC + live search, cross-linked both ways (marker → canon section; place-name in the text → map fly-to). Deterministic with `--check`, wired into CI beside the bench-sheet gate; session-forge/lore-forge/session-debrief close-outs + MAP_CHEATSHEET now name both regens. (3) **BUG FIXED in passing — the bench-sheet `--check` was STILL CRLF-sensitive**: 15c fixed the stamp, but the whole-file staleness compare was byte-exact, so an autocrlf working copy (CRLF on disk) never matched the LF build output — every Windows-side `--check` failed on identical content; CI's LF checkout hid it. Compare is now LF-normalized. And then the SAME class bit a third time in the opposite direction: build-canon-codex.js shipped with a normalized *compare* but a stamp that hashed the raw source bytes, so the Windows-generated committed codex read permanently stale to CI's LF checkout — this branch's own CI caught it, fixed by LF-normalizing both sources at the read, verified by reproducing CI in a fresh `core.autocrlf=false` clone (both `--check` gates pass there). The rule, now three-times-earned: **any determinism stamp or staleness compare must LF-normalize EVERY input at the read** — normalizing one side (or the compare but not the stamp) just moves which platform sees the false STALE. (4) Verified: overlay composited over the base map and eyeballed (crosshairs sit ON the river/coast); codex exercised end-to-end in the embedded browser — marker click → ★ Heartholt info card → canon jump, TOC jump, search "Aldercourt" 6 hits with cycling — after fixing a real bug it caught: CSS `scroll-behavior: smooth` never progressed over the 371k-px document in the embedded pane (animation frames starved), so all jumps are now instant, which is better UX at that scale anyway. ⚑ Bench: open the codex in Ben's own browser (double-click, check the map pane + a search + a marker click), and the Procreate import of paint-overlay.png (does the guide layer land aligned on the canvas).)

**2026-07-15c** (ART FORMAT → `.jpg` IS THE DEFAULT, + a silent-failure bug closed. Rebuild-needed only in the sense the art itself needs one; NO engine change, NO data change. Ben's first real drop (`mistheron-portrait.jpg`) landed and exposed two things. (1) **`.webp` was the documented preference but Ben cannot export it** — Procreate's Share menu has no WebP. `.jpg` is now the documented default in BOTH `source-materials/art/adversaries/README.md` and `EDHA_ADVERSARY_ART_WISHLIST.md` (with the ~80%-quality / few-hundred-KB size note; his re-export came in at 431 KB vs the 4 MB PNG first attempt, which is why the size line now names a number). (2) **BUG, root cause found and fixed**: `sync-art.js` accepted `.jpeg` but `advArt()` in `foundry-build.js` probed only `["webp","png","jpg"]` — so a `.jpeg` (exactly what an export menu saying "JPEG" invites) would COPY into the module, print a success line in the deploy window, and then never be found by the build: art silently absent at the table with no error anywhere. This is the precise failure mode the reported-and-skipped design was built to prevent, reintroduced by an ext-list that drifted between the two scripts. Both lists are now `["jpg","jpeg","webp","png"]` — jpg first, so it WINS if two files share a slug — and `sync-art.js` carries a keep-in-sync comment naming the hazard. Verified: `.jpeg` fixture synced AND resolved through advArt (pre-fix it resolved to `null`), fixture removed; `mistheron-portrait.jpg` confirmed installed and resolving to `modules/edha-content/art/adversaries/mistheron-portrait.jpg`; node --check both scripts + validate + lint-refs + tests/run all pass. Note the ORIGINAL report — "the art didn't load" — was NOT this bug: the deploy simply ran at 07:43 and the file was saved at 07:59, so step 3 saw an empty folder (`0 copied, 0 already current`, no IGNORED list = it saw no files at all, which is how you tell that case from a bad filename). **BENCH-CONFIRMED same session (Ben, 2026-07-15c): the 15b art pipe-cleaner PASSED** — after `deploy-to-foundry.bat` + relaunch, the Mistheron's hand-drawn art is present **in the compendium and on the dragged token**. The whole path (iPad → OneDrive repo folder → sync at [3 of 5] → rebuild → Actor) is proven end to end with a real file; that checklist row is closed. ⚑ remaining: only the `.jpeg` variant is unseen in Foundry (verified repo-side; `.jpg` is the bench-proven default). (3) **SECOND BUG, found by this branch's own CI and fixed — `build-test-sheet.js` was CRLF-sensitive**: `build()` hashed the RAW checklist text for the header stamp, so with `core.autocrlf=true` (Ben's Windows working tree = CRLF) the same checklist stamped differently than in CI's LF checkout. Any sheet regenerated on Ben's machine was therefore permanently "stale" to the 14p `--check` gate — rows and row-hashes byte-identical, the stamp alone differing (`@4d13dc1454` local vs `@63d827895c` CI) — and any sheet a cloud session generated was "stale" to him. **The gate could never pass for a Windows-side checklist edit**, which matters because the bench sheet exists precisely for Ben to edit. The row parser already used `split(/\r?\n/)` and was fine; only the whole-file stamp saw the `\r`. Fixed at the read (`.replace(/\r\n/g, "\n")` before hashing/parsing) so the build is platform-independent, as the header's "Deterministic ... so CI can diff" claim always promised. Verified by reproducing CI locally — a fresh `core.autocrlf=false` clone regenerated the sheet, diff vs committed was 6 lines, ALL stamp; post-fix a CRLF and an LF checkout both produce `@63d827895c`, and this branch's CI went red→green on exactly that commit. **Gotcha for future Windows sessions: a `--check` failure whose only diff is the stamp is this class of bug, not a stale sheet — regenerating harder will not fix it.**)

**2026-07-15b** (ADVERSARY ART PIPELINE — repo tooling + docs, NO engine change, NO data change, NO pack-content change. Ben can now save hand-drawn art from the iPad into OneDrive; this makes the deploy install it. (1) **The art source of truth is now IN the repo**: NEW `source-materials/art/adversaries/` (+ its own README) — OneDrive-synced so the iPad save lands in it, git-tracked (gitignore exception, same reasoning as the 07-12g first-party maps one: it is a BUILD INPUT, not scratch), and it survives a module reinstall or a fresh clone. `screenshots/` was rejected as the home: that is the pasted-screenshot bucket the 07-06 no-binaries policy deliberately keeps OUT of git, so first-party art there could not be tracked without dragging third-party material in with it. (2) NEW **`scripts/sync-art.js`**: mirrors that folder into `<MODROOT>/art/adversaries/` — the dir `foundry-build.js` `advArt()` already probes, so the auto-detect contract is UNCHANGED (a by-hand drop into the module dir still works for a one-off). Size+mtime skip makes it idempotent; it validates every filename against `data/adversaries.json` slugs and **reports-and-skips** unknown ones (a typo-ed slug otherwise presents at the table as "the art silently did not take"). (3) **deploy-to-foundry.bat** is now 5 steps — art installs at [3 of 5], BEFORE the pack rebuild that reads it — and the success block gained the re-import note (adversaries already dragged into the world keep their old art). (4) **EDHA_ADVERSARY_ART_WISHLIST.md** re-pointed at the repo folder; the filename contract (`<slug>-portrait.*` / `<slug>-token.*`) and the four batch-1 briefs are unchanged. Note for the 07-15 equipment initiative: art is orthogonal to the weapon-item migration — it keys off the ACTOR name, so migrating attacks to weapon-type items does not touch it. Verified: sync-art smoke-tested both paths (good slug copies, rerun clean; `IMG_4821.png` and a typo-ed `misthron-token.webp` both reported, not copied), fixtures removed; node --check + validate + lint-refs + tests/run + audit_parser_test all pass. ⚑ Bench: nothing until Ben drops his first real file — the first deploy WITH art is the pipe-cleaner, and it has a checklist row.)

**Older-delta index (newest first — one line each; the full header-era text is preserved verbatim in `HANDOFF_ARCHIVE.md`, and most dates also have full delta sections later in this doc):**

- **2026-07-15** — EQUIPMENT, MONEY & ITEMS INITIATIVE OPENED (build + data; adversaries rebuild): no equipment/currency/item layer existed anywhere. Four direction picks — currency gets a full lore-forge pass FIRST (NEW W25, no placeholder coin names until it lands), items come from the system pack + a small edha-items pack, adversary attacks MIGRATE to real weapon-type items, money is engine-tracked. Foundry-side work gated on the SCHEMA DUMP (NEW `scripts/schema-dump-console.js` — the system source is unreachable from repo sessions). Shipped: ⚑⚑ the weapon pipe-cleaner (`kind:"weapon"` in `advItemDoc`, Corvaine Raider Shortsword only).
- **2026-07-14p** — BENCH SHEET (repo-side only, nothing to deploy): `scripts/build-test-sheet.js` generates `EDHA_FOUNDRY_TEST_SHEET.html` from the checklist (Pass/Fail/Partial/Skip + notes, localStorage keyed by row-text hash, Copy-results-for-Claude → Phase-0-ready worklist, deploy chips, filters/nav); sync enforced in CI + pre-commit (checklist edit without regenerated sheet fails); test-pass-fixes Phase 0/7 wired; headless-verified; ⚑ only bench ergonomics remain.
- **2026-07-14o** — PHANTOM DOUBLE / THE SEEMING REWORK (engine + blue authored/source + adversaries; pack rebuild PENDING `leyline` + `adversaries`): shared `edhaCastPhantomDouble` loop (copy adjacent, ally-targetable, 1 HP, max 1, dies on any hit), engine-rolled belief sweep (`edhaPhantomBeliefSweep`, Perception vs caster's COGNITIVE defense, per-observer flags + GM accounting card + re-test button), THE CLIENT VEIL (`Token#isVisible` wrap — fooled players render only the copy, seers only the real token, GM both; no document ever hidden), break on copy death/deletion, copy token wears the plain name; The Seeming → 1-Action item on the same loop; 34 tests green.
- **2026-07-14n** — W23 ROUND 2 (engine + build + canon): Guiding Signal designate-mark primitive (card text was canon, engine drifted), Ordered Advance movement-window card, preCreateToken renumbering (core counts by actorId), sweep-empty diagnostics, RULING 49 — adversaries run the full leyline economy (auto-embedded Keys + Draw Mana, PC inv derivation default 2).
- **2026-07-14m** — W23 PIPE-CLEANER FAILED → ACTION-TYPED-TWIN FALLBACK (build + engine + validator + tests): adversary sheet renders only trait/weapon/action sections (`item.type` filter) so talent-type embeds are invisible — twins are canonical now; `edhaIsTalent` predicate + 13 lookups retrofitted; validator hard-fails talent-typed embeds; deployed same-session.
- **2026-07-14l** — MORRATH WORSHIP PASS (docs-only): rulings 44–48 (sacred geography = field model; the Passing never gates; the Black Altar is a door; the dead-line palette sealed-vs-banished; keepers as death-registrars + the block index), canon §3a 'Lived faith' NEW with Morrath's full block, primer 'The quiet faith', session-1 Passing + shrine-roll clue, ⚑ Death-tree pronoun drift flagged; W11/W12/W13/W16 logs updated.
- **2026-07-14k** — CORVAINE DIVE COMPLETE (docs + gazetteer only): rulings 41–43 (the hospice dial ~3%/yr → ~850k stuck-dying, one household in four; the Lesser Tolling — dead-in-law SPREADS via shrine-adjacent parish bells; Aldercourt = city-18 + Child King Cassien II + the three-seat regency), §5b Corvaine finished (Lesser Tolling + plague-wells bullets, ruling-30 GM truth), gazetteer site + labeled map re-render + lint clean, primer wells/whisper update; TODO W24: Corvaine is the second reference-shape nation (seven remain). ⚑ still open: does the Warlock knowingly serve Tyrith.
- **2026-07-14j** — W23 ADVERSARY PIPELINE (data + build tooling, NO engine change): ruling 40 (adversaries run magic as-written for humans / adaptations for beasts; rank defaults minion 1 / rival 2 / boss 3), foundry-build adversary pipeline (folders, leylines, skills, verbatim talent embeds, art auto-detect + wishlist), first batch (Raider, Line-Caller, Roek, Mistheron), validate.js adversary pass, deploy-bat coverage; ⚑ pipe-cleaner bench section.
- **2026-07-14i** — SESSION-1 SCRIPT REVIEW + WHITE ECOLOGY (docs-only): rulings 36–39 (White → Corvaine plains + skeindeer, W21 closed; 'one magic'; the invested dial + adversary investiture tiers), ford fight reworked (Roek White-attuned, NEW Line-Caller minion, the pile-up), mistheron scene 3b + river beats added, adversaries-get-talents ruling, proposals-in-plain-chat process rule, W23 declared NOT optional.
- **2026-07-14h** — ECOLOGY PASS CLOSED + THE RED COUNTRIES (docs-only): W23 Thalendor/Corvaine roster approved & PARKED for a dedicated pack session (six blocks; art-wishlist + own-Actor-folder requirements recorded); NEW CANON ruling 35 — Vorsk's NW ranges = Red/Black (Tyrith's exact pair), Ashkar's SW mesas = Red/Blue (Razkael's banishment-home, ⚑ collapse hypothesis for Ashkar's ruin); ecology pass complete: rulings 31–35, canon §5c whole, the smell correction, W17/W19/W22 closed, W18 sited.
- **2026-07-14c** — THE TOLLING + SESSION CLOSE (docs-only, same branch; PR opened): item 1 approved verbatim → the dead-in-law rite written into §5b Corvaine (Quiet Wing, past-tense etiquette; regency-stands-on-the-fiction GM hook; primer unchanged — public truth is "the king died"). Corvaine resumes fresh from item 2; remaining queue + open ⚑s checklisted in TODO_WORLDBUILDING W24. NO engine/data/pack changes, nothing for the bench.
- **2026-07-14b** — LORE-FORGE PHASE 3 REWORKED + CORVAINE BATCH 1 (docs-only, same branch): design questions now walked with Ben **in order, by section**, full-text proposals one item at a time, approval precedes every commit (SKILL.md / CLAUDE.md / TODO aligned). Corvaine batch 1 committed: rulings 28–30 — **25% cleared → ~14.1M** (calorically whole under layer 1 → the raids are hospice-burden + treasury desperation), **the old king tolled dead-in-law** (the regency stands on the fiction), **Malcurr's coin = the mortal side of Tyrith's power-grab beginning** (thread-1 vagueness softened; Warlock-unknowing default ⚑). Gazetteer `land_budget` filled. Section-3 culture items pending one by one. NO engine/data/pack changes, nothing for the bench.
- **2026-07-14a** — CORVAINE DIVE: MEASURED + AUDITED, GATE PARKED (docs + map tooling, branch `claude/thalendor-eastern-neighbor-dive-9oyeuz`): 776,376 km² / **9.1% water** measured via new `scripts/map/water_frac.py` (Thalendor-calibrated); partial gazetteer `land_budget` (dials gated). Derived: a layer-1-only nation at 85% yield is **calorically whole** → the raids are care-burden + state finance, not starvation. All prose UNWRITTEN pending Ben's answers — **the menu (cleared fraction → population, why a child king, why Malcurr pays, plan-of-content) is parked in TODO_WORLDBUILDING W24.** NO engine/data/pack changes, nothing for the bench.
- **2026-07-13j** — RATIONS MATH CLOSED (docs-only, same branch): Ben — livestock is a fully-convertible buffer, so the human-available fraction is ~100% (killed the spurious "human-edible-grain fraction" dial). Humans stay fed until total production < 9.56T need = below **23.4% of normal yield**; at 42.5% now humans are whole, livestock craters ~75% (3.43M → ~0.85M units), mass death is the cliff ~19 yield-points below (matches ruling 19). Updated ruling 27 + gazetteer + §5b + lore-forge Phase 4b (anti-spin caution). §10 rations items resolved. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13i** — THALENDOR CALORIE BALANCE + FISH RULING (docs-only, same branch): ruling 27. Fish hit by Layer 1 (environmental canon) but calories ignored → fisheries flag resolves down, 13.1M stands. Calorie balance: 16.34M ha × 2.5M kcal/ha = 40.85T kcal/yr; humans 9.56T (23%); remainder → **~3.43M cattle-equiv livestock units**. Cross-check **corrected an error**: famine at 42.5% production (17.4T) still exceeds human need (9.56T) — the ~77% livestock/fodder buffer collapses first, so the "~5.5M fed / 7.5M gap" line is retracted; mass death is the cliff ahead. New dial: human-edible-grain fraction. Gazetteer calorie fields + lore-forge Phase 4b cross-check added. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13h** — FAMINE SEVERITY REFRAME + THALENDOR LAND BUDGET (docs-only, same branch): (1) severity reframed as a **deficit** — 57.5% shortfall vs ~15% = **≈3.8× deeper** (ruling 25, §1a, §5b updated; "half the yield" kept as the equivalent). (2) **Land-budget method, ruling 26** (populations derived from resources): Thalendor = 1,076,400 km² inside the border, ~12% water (measured), dials 15% cleared + Root Network 60%×1.25 → **~142,085 km² raw / ~163,400 effective** farmland; density **80/km² → ~13.1M** (famine feeds ~5.5M). ⚑ fisheries uncounted (farmland floor). Farmland pass folded into `lore-forge` (Phase 4b); one nation's full-depth pass = one session. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13g** — THALENDOR RULINGS + FAMINE NUMBERS (docs-only, same branch): ruling 25 sets the hard figures — 15% blight loss / 50% Thalendor drain sprout-fail / ~42.5% Thalendor yield (twice as deep as elsewhere) / vats overwhelmed; livestock + rationing deferred to a population-numbers pass. §5b Thalendor ratified; session/opening names confirmed (⚑ + name_provisional cleared); Harrow mercy-killing plot CUT (he keeps the Shepherd's rite — new Morrath folk-epithet registered) and "giving back" scene beat CUT; field imagery fixed to thin-drain + 15%-blight. Map PNG NOT regenerated (only nation-scoped provisional flags matter to render). NO engine/data/pack changes, nothing for the bench.
- **2026-07-13f** — FAMINE LAYER-1 MECHANISM FIX + LORE-FORGE SKILL (docs-only, branch `claude/famine-layering-review-igi97r`): §1a layer 1 recast from the model-contradicting "harvest never finishes / ripening is a small death" to **the blight that never clears** (ruling 24) — crop blight + livestock murrain are slow deaths that no longer finish, the arable base ratchets down, the agricultural face of the hospice-nation persistence (no new rule; bites by margin). Soil/return-leg cause considered and declined. Swept §5b Lunavar (calendar regrounded in doctrine + severity clause), primer, session-1 opening, TODO W19/W22; session-1 blight imagery was already correct. New **`lore-forge`** skill (the worldbuilding counterpart of session-forge: derive-from-a-ruling, logic-audit vs the death model, batch-as-a-GATE, §5b depth standard, dependent sweep) + `CASE_STUDY.md` (this famine fix worked through). NO engine/data/pack changes, nothing for the bench.
- **2026-07-13e** — CULTURE PASS + CHARACTER-CREATION PRIMER (docs-only, branch `claude/worldbuilding-character-creation-d01f35`): worldbuilding backlog **section A done** — canon **§5b** culture blocks for all ten nations + W10 connective tissue (naming conventions from NPC exemplars, the "giving back" death-libation as the shared continental custom, border blending, GM one-scene checklist), terrain per §5a ground truth (three TODO descriptors corrected; ⚠ W18 re-siting note). New player-safe **`EDHA_PLAYER_PRIMER.md`** for character creation, spoiler-checked vs the session-1 wall. Session-1 script aligned to the session-forge `RUN_SHEET_TEMPLATE.md` (new §8 player-facing text incl. Khor's notice handout, §9 briefs + Foundry hand-off, ⚑ batch → §10). New ⚑: Lunavar "Lantern" doctrine (provisional; thread §8.4 untouched), Malcurr upland-lakes synthesis, Lunavar naming, the optional Withervale libation beat. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13d** — SESSION-BUILDING SKILLS (docs-only, same branch): the session-1 build distilled into repeatable workflow. **`session-forge`** (11 phases; the hard rules each earned by a real failure: geography measured before fiction — the cart-ford/"it's a day" catches; premise stress-tested before writing — the Joskin test; every judgment call batched into ONE menu with recommended defaults; critical clues un-missable; merged-main sync check against parallel-session drift — the §9-numbering/Harrow collision) + **`session-debrief`** (freeform table notes → state; table rulings are canon the moment spoken and get §9 rows; contradictions between table and written canon are SURFACED, never silently patched; ⚑ names spoken aloud at the table become fixed). New **`EDHA_CAMPAIGN_STATE.md`**: the play ledger both skills pivot on (canon = what's TRUE, state = what's HAPPENED — know-vs-suspect tracking feeds the assembly-rule reveal; clocks table tracks the soul-pool/coup/drain/war). Support files: `RUN_SHEET_TEMPLATE.md` (the frozen session-1 shape incl. player-safe §8), `CASE_STUDY.md` (the six catches), `MAP_CHEATSHEET.md` (measure/locate/add-a-place/re-extract flows). CLAUDE.md trigger paragraph + map table updated. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13c** — MAP DATA PIPELINE (repo tooling + docs, same branch): built the between-maps infrastructure Ben asked for ("I hand-draw in Procreate; sessions need something easier to see and keep straight"). Principle: **PNGs for humans, JSON for sessions** — geometry questions get *queried, never eyeballed* (the 07-12h session's failures — the flip, the guessed placements, the letter-key collision, "it's a day" for a 430 km run — were all eyeballing). New **`source-materials/maps/thyrcross.map.json`** gazetteer (canvas+scale+.procreate staleness stamp, 10 nations with competitive-flood-fill-traced polygons + both letter keys, 29 cities polygon-assigned to nations, session sites, the Palewater channel as a 2,694 km skeleton-traced polyline, routes) + **`scripts/map/`**: `extract_procreate.py` (committed decoder — zero workflow change for Ben, saves to OneDrive as always), `trace_regions.py`, `trace_rivers.py`, `measure.py` (dist/route/locate + travel modes), `render.py` (labeled maps regenerate deterministically from data), `make_viewer.py` → **`viewer.html`** (Ben double-clicks, pans/zooms, clicks a spot, copies the exact "(x, y)" — ends descriptive coordinates), `lint_map.py` (in-canvas checks, anchor-in-own-polygon, doc-coordinate drift vs gazetteer — **added to CI** validate.yml, which also gained source-materials/maps + EDHA_*.md trigger paths; CLAUDE.md map table gained the row). **First measurement paid off immediately**: the drawn Palewater meanders ~2.1× straight-line — the committed session-1 sites weren't even ON the river (Elmsworth 290 km inland) and "5–6 days" was fiction. Ben ruled (canon §9 rulings 21–23 after the merge renumbering): **two weeks on the water** (sites snapped onto the channel: Elmsworth (1290,1470) head-of-navigation port beside drawn city-15, Ford (1422,1794) @935 channel-km ≈ day 8–9, Withervale (1480,1925) @1,339 km ≈ day 12, Black Altar snapped to (1449,2337) on the confluence), **barge_down 110 km/day** (current + night drift; supersedes 80), river named **the Palewater** ⚑, other speeds confirmed (30/40/30). Canon §5a (tooling pointer + scale block + Altar coords), opening doc §2, and the session script all retimed; `thyrcross-labeled.png` now regenerated FROM the gazetteer. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13b** — WORLDBUILDING BACKLOG (docs-only, branch `claude/worldbuilding-todos-7cuc09`): **`TODO_WORLDBUILDING.md`** created — 23 session-sized items across Ben's three fronts: per-nation culture blocks W1–W10 (rituals/quirks/differentiators, proposed canon §5b), lived faith W11–W16 (per-god rites as feeding mechanisms, sacred geography on nexuses, sensory prayer canon, ⚑ faith mechanics, ⚑ godless causality), leyline ecology W17–W23 (attunement framework; Ben's seeds: Red lizard "dragons", Green moving plants; ⚑ the Fae; Blue/White/Black fauna; broken-cycle ecology; W23 = downstream act-1 adversary-pack assembly). ⚑ rulings pre-batched as one menu. Canon §8 pointer added. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13** — BROKEN CYCLE + FETCH TIMELINE CANON (docs-only, branch `claude/deity-drama-mechanics-mayhz1`): canon doc **§1a** (new) + rulings 9–17 nail what the deity drama does on the ground. Death is mechanical (the **consent model**): steel/bleeding/beheading kill normally — game rules unchanged, zero engine implications — while the wasting (disease/starvation/age) kills agonizingly slowly now that Morrath's mercy no longer finishes it; plague nations reframed as **hospice nations** (the dying accumulate; epidemics can't burn out). Souls **return, not travel** — energy back to the leylines — so every post-seal death **sticks**, pooling at Black/Green nexuses: the Black Altar's destabilization IS a two-year soul-pool nearing first overflow (= the oneshot's "disturbances"; first breach = act-1 finale; undead mix revenants/zombies/skeletons/horrors as the act-2 clock and act-3 pull). God origin now canon: **a deity = two-leyline convergence + sustained worship** — ten pairs, ten gods, the pantheon is complete, so the Fetch's consumption of Maelith was the only way in. Its full engine: entered ~150y ago when Fate was blind (coup EXPLOITED not engineered — Olvarra's guilt intact), banished Razkael ~120y (grandma's-grandma folklore), farmed faith for a century, sealed Morrath ~2y ago, and is now winding Tyrith up so the war produces souls, topples Verdannis, and gets Power removed *by the heroes* → total Black control → reap the pools → **full Investiture monopolization**. Famine keeps two-layer causality (harvest-never-finishes everywhere + Green drain in Thalendor only; Lunavar = layer 1 alone). **Ashara is immortal by curse — unwoven** at the coup (no thread, no path back; Razkael decade = suicide pilgrimage; Sylvaneth exiled her for what she is). Remaining ⚑ (canon §10 + opening §4): perception defaults, Withervale priest mercy-harvest beat, Ashara's cure via restored Morrath, order-of-magnitude dates. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12i** — SESSION-1 RUN-SHEET + WORLD RULINGS (docs-only, same branch): **`EDHA_SESSION_1_SCRIPT.md`** — the runnable session 1 ("The Harvest That Won't Die"): read-aloud boxes, 7-NPC cast (Marshal Vareth Khor canon, the rest ⚑ placeholders), the Palewater fight statted on the `adversaries.json` schema (Sgt. Halden Roek rival + Corvaine Raider minions with break/mercy behavior, talk outs, the un-missable Malcurr-gear clue), Withervale's four wrong things, the clue ledger, per-color leyline tugs. Ben's script review surfaced four world holes, ruled via prompts (canon §9 rulings 18–20 after the 07-13 merge renumbering): (1) **"gate shut, knife works"** — Morrath's sealing jams only the *natural* transition (age/sickness/starvation/the rite); outright destruction still kills, but **nothing collects what leaves** → new canon §2 mechanics block, open thread 9 (the unharvested dead), and the script's if-a-player-mercy-kills-Joskin contingency (it *takes*, Harrow's rite half-lands, no punishment); (2) **the lingering dying stay rare for now** — ones-and-twos per village, mass-scale horror banked for the deep-famine/plague nations; (3) **map scale** — Thyrcross ≈ 4,000 km N–S → **1 px ≈ 1.5 km**, downriver ≈ 80 km/day (canon §5a): the session-1 convoy became a **barge flotilla on a ~430 km / 5–6-day run** (Ben's catch: the old cart-ford logistics made no sense — an intra-Thalendor delivery never crosses the border river; the river IS the delivery system); (4) the raid re-contexted as the **Palewater shallows boarding** — the *raiders'* ford, the only wadeable border crossing for fifty miles, barges poling single file through the kill-box. Opening doc §2 (site table, brief 1) updated to match. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12h** — MAP EXTRACTION + PLACEMENT GROUND-TRUTH (docs-only, branch `claude/edha-map-extraction`): extracted the political layer from Ben's `Thycross.procreate` on his PC (the earlier cloud sessions couldn't see his filesystem — this is the task `EDHA_MAP_EXTRACTION_TASK.md` set up, now deleted). Procreate `.lz4` tiles are Apple-chunked LZ4 (`bv41`/`bv4-`/`bv4$` magic, 64 KB blocks with a carried dictionary — plain `lz4.block` chokes, a tiny pure-Python decoder handles it); reassembled the **Country Borders / Cities / Political Map** layers to full-canvas 2865×3399 PNGs. They decoded **vertically flipped** (Procreate tile-row order); confirmed against `thyrcross.png` by landmass IoU (flipV 0.72 vs 0.55 orig) and un-flipped. Committed: `thyrcross-political.png` (fills), `thyrcross-borders.png` (dashed borders), `thyrcross-cities.png` (29 markers), `thyrcross-labeled.png` (composite w/ nation names + 4 session sites); `*.procreate`/`*.psd` gitignored (230 MB, stays in OneDrive). **Ben keyed the map's hand-drawn red A–J labels to nations**, which overturned most of the 07-12g §5a *guesses*: Malcurr NE (was NW), Vorsk NW (was SW), Lunavar mid-west (was SE), Goldenport west coast (was NE), Canticle SE (was east-central); Thalendor/Kettavar/Sylvaneth unchanged. Bonus: "Vorsk raids Lunavar **to the south**" is now literally correct (retired a ⚑). **A tenth nation** appeared — map region G (SW mesa) with no counterpart in canon or the legacy PDF (both had exactly nine); added as **⚑ Ashkar**, a *collapsed/anarchic state* (Ben's climate pick; name + collapse-cause still ⚑). Black Altar Crossing moved to the **Thalendor/Corvaine/Canticle** river-nexus (1400, 2280) — the old Goldenport tripoint broke once Goldenport landed on the far west coast. Canon §5 gained the 10th nation + a "map label ≠ old-PDF letter" warning; **§5a rewritten as ground truth** (was ⚑ guesses); §10 open-items refreshed; `EDHA_CAMPAIGN_OPENING.md` §2 sites re-anchored down the real border + §4 batch updated; 29 city markers grouped ⚑ per nation (unblocks city-scale maps once capitals are picked). NO engine/data/pack changes, nothing for the bench.
- **2026-07-12g** — CAMPAIGN OPENING + WORLD MAP (docs-only, branch `claude/campaign-opening-hook-178b2m`): the campaign's session-1 plan lives in **`EDHA_CAMPAIGN_OPENING.md`** — hook "The Harvest That Won't Die" (relief-convoy escort in Thalendor; the first clue is the broken death-cycle, not the hunger — origin/build-agnostic since players haven't picked), three road-level battle-map briefs Ben can draw now (⚑ Palewater Ford ambush, ⚑ Withervale famine village + silent Last Harvest shrine, Black Altar Crossing act-1 finale), and the famine → Anaveth → false-villain-Tyrith → three-witness-assembly → Fetch-reveal act ladder built on canon §2's assembly rule. Ben's **Thyrcross world map** committed to `source-materials/maps/thyrcross.png` (+ `thyrcross-labeled-proposal.png`; gitignore gained the invited `!`-exception — first-party asset, not the third-party material the 07-06 policy targets). Canon doc gained **§5a**: all nine nations mapped to the map's dashed-border regions from canon adjacency constraints — ALL placements ⚑ until Ben confirms (open: west-moor → Thalendor?, SW peninsula → Vorsk?, Vorsk→Lunavar raid axis reads east not south, Goldenport capital at the deep inlet, the three placeholder names, city placements for city-scale maps). NO engine/data/pack changes, nothing for the bench.
- **2026-07-12f** — CAMPAIGN CANON ESTABLISHED (docs-only, same branch): Ben answered all seven §6 rulings from the diff doc via question prompts (keep the infiltration antagonist but drop all Shard cosmology; Verdannis's search taps Green because he's searching FOR the broken cycle; Order-vs-Power = law vs. throne; the true Maelith was ALWAYS Black/Blue calculated madness — the Impostor's tell is direction, not order; Sylvaneth = the PDF's Fae utopia, Verdannis-devotion moves to Thalendor; gods gendered per the live tree text, ⚑ Maelith provisionally "it"). Biggest ruling: **WorldAnvil is retired** — **`EDHA_CAMPAIGN_CANON.md`** is now the single source of truth for all campaign lore (pantheon agendas, the 9 nations, NPCs, oneshot frame, open threads, rulings log); it supersedes the baseline PDF text AND the ten article exports (kept as historical artifacts). CLAUDE.md's map table gained the canon row. Follow-up rulings same day: Maelith is "it" (confirmed), and the antagonist's GM name is **"the Fetch"** (folklore: an exact supernatural double whose appearance is an omen of death — doubly apt given the Chaos tree's Omen resource); both applied throughout the canon doc, no ⚑ left on either. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12e** — LORE CANON DIFF (docs-only, branch `claude/edha-countries-plot-mmzg2m`): Ben's recovered **Campaign Baseline Canon v1.0** PDF (the original two-Shard brainstorm: Valor pantheon, Ambition-Splinter U3125 antagonist, countries lettered A–I) preserved (extracted text; PDF itself gitignored per the no-binaries policy) to `source-materials/legacy-uploads/Campaign_Baseline_Canon.txt` and diffed against current canon in **`EDHA_LORE_CANON_DIFF.md`**. Headlines: current project has NO Shard cosmology (Ben-confirmed; zero Valor/U3125/Splinter refs outside legacy-uploads); Verdannis is Sovereignty/"Crowned Arbiter" (was Nature/"Rootfather"), Tyrith Black/Red (was Blue/White), Maelith Black/Blue (was mono-Black); all ten WorldAnvil article exports are stale PDF-era snapshots; PDF countries A–I mapped one-to-one to Kettavar/Malcurr/Corvaine/Thalendor/Goldenport/Vorsk/Lunavar/Canticle/Sylvaneth. Seven batched lore rulings await Ben in the doc's §6. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12d** — PASS-3 fix batch (R1–R4 wired; 14 fixes; card persistence, collision, teleport, visibility gates)
- **2026-07-12c** — READABLE DARK actor-sheet pass (palette variable overrides; resize + sheetScale)
- **2026-07-12b** — PASS-3 triage + vision-test root causes (hidden tokens; pack-rebuild gap; debugSave)
- **2026-07-12** — BLACK pass-2 fixes (second in-Foundry Black run; movement talents wired)
- **2026-07-06** — KNOWLEDGE TRANSFER (root CLAUDE.md + the test-pass-fixes skill)
- **2026-07-05** — BLACK test-pass fixes (Ben's first full in-Foundry Black run)
- **2026-07-04** — ENGINE BACKLOG BUILT
- **2026-07-03c** — ENGINE BACKLOG CONSOLIDATED
- **2026-07-03b** — ORDER (Tessavain) deity tree wired
- **2026-07-03** — KNOWLEDGE (Gnothis) deity tree wired
- **2026-07-02c** — POWER (Tyrith) deity tree wired
- **2026-07-02b** — CIVILIZATION (Kethane) deity tree wired
- **2026-07-02** — DEATH (Morrath) deity tree wired
- **2026-07-01** — SOVEREIGNTY (Verdannis) deity tree wired
- **2026-06-17** — DESTRUCTION (Razkael) deity tree wired
- **2026-06-16c** — GREEN TREE COMPLETE
- **2026-06-14f** — BLUE / Foresight wired → BLUE TREE COMPLETE
- **2026-06-14e** — BLUE / Illusion wired
- **2026-06-14d** — BLUE / Calculation wired
- **2026-06-14c** — WHITE / Accord wired
- **2026-06-14b** — WHITE / Bulwark
- **2026-06-14** — WHITE / Coordination wired
- **2026-06-13c** — BLACK tree wired (Isolation + Ritual + Subjugation; 06-13b = the reusable tools)
- Earlier (already one-liners): 2026-06-13 (Weakened rework → ends at the creature's next turn + generic timed-status expiry), 2026-06-12 (pack-path schism fixed + workflow hardening), 2026-06-11b (V3 ENGINE PASS), 2026-06-11 (playtest-PC triage), 2026-06-10b (playtest-1 prep — §8b), 2026-06-09 (RE-REFACTOR: behavior on talents). [Superseded deltas collapsed to one-liners below.]


**NEXT SESSION (updated 2026-07-04): ALL 15 TREES ARE COMPLETE and the BUILDABLE ENGINE BACKLOG IS BUILT — 5 leyline colors + all 10 deity trees, plus the full §9a/§9b pass (07-04: 5 shared primitives + 6 tree-local hooks, all engine-only). The ONLY remaining work is manual, on the Foundry machine: (1) the ONE-TIME DEPLOY at the top of `EDHA_FOUNDRY_TEST_CHECKLIST.md` — nothing merged after the 06-16 Green build is live yet; the deploy block covers module-src-sync push (now includes the 07-04 module.json change — full relaunch already required) + `foundry-build leyline` + `foundry-build deity` + validate-packs + relaunch + ⟳ Sync in one pass; (2) the BENCH pass — work the checklist tree by tree, ⚑ rows first, INCLUDING the new "Engine backlog pass" section (its ⚑ rows carry the 07-04 unverifiables: the cosmere weapon `system.range` shape, the injury Item schema, Shatter prompt spam, and the Civ enemy-cost GO/NO-GO). What's left in §9 after 07-04 is exclusively: §9c blocked-on-system, §9d bench-gated fallbacks (fire only if the bench pass fails), §9e manual-by-design, §9f post-playtest balance — nothing buildable remains.**

> **Branch note (2026-06-14d):** Calculation + Illusion were built ON TOP of the open White PR #36 (`feat/white-leyline-foundry`), because they reuse White's `edhaApplyTimedStatus` / disorient card / `set-flag` relay and the Blue Composed AE that the White Bulwark rebuild baked into the leyline pack. When shipping Blue, branch off whatever `main` contains White (merge #36 first, or stack the PR on it).
> **PROCESS note (06-14e):** the first Illusion attempt was reverted because it shipped without sign-off and shortcut the summon talents (Barricade → a text note, Phantom Double → skipped). REWIRED after an explicit per-talent proposal Ben approved. Lesson reinforced: propose the full per-talent data model BEFORE coding, especially anything summon/placeable.

---

## 2026-07-17 DELTA — Playtest-2 fixes (White/Black Draw Mana + Decisive Command + summon attacks; ALL ENGINE-only → relaunch/F5, NO pack rebuild, NO ⟳ Sync)

Ben's four freeform reports from the prior night's session. All four fixed engine-only, one commit each.

### Rulings (Ben, 2026-07-17)
- **Summon attacks (Report 1): DEFER to the weapon migration.** The native "target a token + auto-test
  defense" flow only exists for weapon-type items; `type:action` skill_test items can't expose target
  defense (handoff §10 / "Items don't expose their target defense"). Rather than build a bespoke
  engine auto-verdict now, summon attacks wait for the 07-15 equipment initiative (weapon-item
  migration, gated on the schema dump). Interim only: bring Siege Cannon's die to parity with Slam.

### Bug root causes (the four reports)
- **White Draw Mana → "lack permission to edit actor"** (Report 2): the White rider healed each ally
  via `edhaHealActor`, a direct `actor.update`. A player owns neither their allies' actors nor
  (mostly) any other PC, so the update threw. This is the *exact* class the Black weaken already
  solved via a GM relay — White simply never got the same treatment. Fix: allies heal through
  `edhaCrossHeal` (owned → direct; unowned → GM burst-apply relay); self stays a direct `edhaHealActor`.
- **Black Draw Mana showed the GM-only "X behind a wall" card to the player** (Report 3): NOT the
  public card — that already omits wall/hidden counts (07-12b). The leak is the *GM sweep whisper*:
  `edhaDrawMana` runs on the USING client, and a Foundry whisper is always visible to its **author**,
  so a player who used Black Draw Mana authored the GM card and saw the very counts it says are "not
  shown to the player." Fix: post it from the GM (new `edhaPostGmCard`).
- **Decisive Command's d4 didn't reach the ally's next roll** (Report 4): the heroic Leader talent had
  `events:{}` — no wiring at all (heroic trees are largely unwired). It is a textbook `nextTestMod.formula`
  consumer (grant a labeled die to a target's next test), the same primitive Probability Net uses for
  its −1d6. Fix: a name-based `useItem` hook → `edhaSetNextTestMod(target, {formula:"1d4", source:"Decisive Command"})`.
- **Siege Cannon & Construct Slam don't target/test defense** (Report 1): shared root cause — the
  summon's baked attack items are hand-built `action` items whose skill_test rolls a die but never
  compares to a defense. Slam at least rolled that die; Siege Cannon was worse — a `type:utility` extra
  item with NO to-hit roll at all. Per the ruling, the deep fix is deferred; the interim makes the
  extra-item builder treat any damage-bearing extra item as an attack (skill_test to-hit + attackKind).

### New REUSABLE primitives
- **`edhaPostGmCard(actor, htmlContent)`** — post a GM-only whispered card that a non-GM must not
  author (the author always sees their own whisper). Creates it on the GM client: direct if we're the
  GM, else the new `gm-card` socket relay; no GM online → nothing posted. Any engine code running on
  the using client that needs to tell the GM something the player must not see can call it. First
  consumer: Black Draw Mana's hidden/behind-a-wall sweep. Indexed in `ENGINE_INDEX.md`.

### Known limits / couldn't self-verify (no Foundry session)
- ⚑ **The Black GM-card relay** — confirm that when a *player* uses Black Draw Mana with enemies
  behind walls/hidden, the "🕵️ full sweep for the GM" card appears ONLY on the GM's screen (not the
  player's), and still appears normally when the GM uses it directly.
- ⚑ **Decisive Command's d4** — confirm the ally's next d20 test shows `+1d4[Decisive Command]` in the
  breakdown and the "🔮 Decisive Command — 1d4 on this test" consume card fires once, then clears.
  Also confirm the cross-owner case (targeting another PC) applies via the GM relay.
- ⚑ **Siege Cannon parity** — re-summon the construct after relaunch; confirm Siege Cannon now rolls a
  d20 to-hit alongside its energy damage (like Slam). The auto-test-vs-defense remains a weapon-migration item.

---

## 2026-07-16c DELTA — The manual-inventory re-litigation (every declared-manual item ruled by Ben; ENGINE + build + data → `deploy-to-foundry.bat` + relaunch + **re-drag ALL adversaries**, NO ⟳ Sync)

### Rulings (Ben, 2026-07-16 — the full 22-item inventory, answered by letter)
- **A/B — vision class GETS WIRED.** Lighting is core Foundry ("lighting and vision is a core
  aspect"); the "table read" rationale was wrong for the light half. The sight RULE (saved:
  `Character_Building_Rules.md` §Senses Range): *in daylight, it is assumed you can see; if it is
  dark, you see to your Senses Range (derived from Awareness)* — supersedes ruling R4's
  "senses range only matters when vision is obscured (GM-judged)" clause. Token setup was
  half-right (senses range existed but as FULL vision) — fixed at the build.
- **A2 — Pack Tactics deserves a real fix**, not an intent excuse: targeting exists per-USER, the
  GM owns all adversaries, so packmates never "have a target" → the aggro-ledger design.
- **C stays manual** (intent reveals — reconfirmed). **D10/D14 stay manual** (forced ACTION
  choice, willing consent). **D11 Kneel movement: enforce it** (prompt + veto). **D12/13: flag
  for the combat/encounter engine rework** → NEW §9i, design-gated. **E15–19: build them all.**
  **F stays manual** (Blue Foresight cluster). **G: prior rulings stand.**
- **Combat Training reads miss→graze** (ruled at session close) — the garbled source-PDF sentence
  ("grazes into a graze") is settled; the card text now says misses-into-a-graze, ⚑ cleared.

### What was built (one commit per item)
- **The sight model** — `edhaPointIlluminated` (global light / darkness < 0.5 / active light
  polygons; fails open) + `edhaSensesRangeFt` (system value, AWA-table fallback, pinned) gate
  `edhaCanSee`: unlit target beyond the viewer's Senses Range = unseen (debug logs the reason).
  Every consumer (Black Attunement sweep, Lawkeeper's Eye, Packmate's Warning, belief sweeps)
  inherits it. Build: adversary prototype tokens ship `sight.enabled, range = Senses Range`
  (Foundry natively shows lit areas beyond sight.range — the rule with no module code); new
  per-block `senses` (ft) field; ⚑ the sheet-side senses DataModel shape is unverified.
- **The aggro ledger + `edha-pack-advantage`** — every damaging item roll records the attacker
  TOKEN's last target (post-roll, so an attack never counts itself; cleared at combat end);
  attacking a creature a living same-item packmate last attacked injects advantage with a
  whispered card. Cinderhound Pack Tactics = consumer #1.
- **`edha-dark-veil`** — marker AE auto-enables while the owner's token stands unlit, releases
  when lit, never fights a manual (cover) toggle. Stalker Veil = consumer #1.
- **Sense-through reveals** — the client-veil `Token#isVisible` wrap gained a force-SHOW half
  (`edhaSenseRevealShows`): Omen-bearers render to Void Sense owners, Harvested Remains to
  Reaper's Harvest owners, through walls/fog; GM-hidden is never revealed.
- **Kneel enforced** — success stamps `kneelBy` + whispers the target's owners the
  move-toward-or-stay prompt; a `preUpdateToken` veto blocks non-closing willing moves while
  Compelled (edhaForced bypasses; the stamp dies with the status).
- **E batch** — Unweaving posts a pick-one card of the target's enabled effects (GM clicks, it
  deletes, card resolves); Dense Tissue refuses every push (`edhaHostileMove` stamped through
  edhaRunPush/Unnerve → edhaApplyMove → edhaMoveTokenTo → the move-token relay, veto backstop);
  Living Image prompts upkeep at turn start with a Pay-1-Inv button; Set Charge's arm card binds
  moves/damaged/enters watchers to Detonate prompts (Manual stays a valid arm); Apex Form's
  "mutations doubled" is real math now (Bone Spurs keen, Venom amount, Dense Tissue deflect ×2,
  labeled on the cards).

### Doc corrections
- §9e rewritten to the post-ruling truth (Kneel's movement carved out; Unweaving/Void Sense no
  longer listed; each surviving manual cites Ben's letter). **§9i opened** for the trusted
  action-economy class — do not wire those piecemeal in test passes. Life's stale "Overgrowth
  +1 Deflect manual" header line fixed (wired since 07-12). Chaos/Death/Power/Red/Blue headers
  updated in place.

### Known limits / couldn't self-verify (no Foundry session)
- The daylight threshold (darkness < 0.5) and the global-light read are ⚑ feel dials — bench.
- The aggro ledger's "targeting" ≈ last-attacked; the GM's memory of intent still overrules.
- Kneel's veto is Euclidean center-distance ("toward" = any distance-closing move).
- Set Charge "enter" checks move ENDPOINTS (a sprint THROUGH the blast doesn't prompt —
  same known shape as the Power move-through watcher, §9d).
- Absolute Authority's chosen action stays carded (D10) — say the word if it should also
  freeze movement like Kneel.

## 2026-07-16b DELTA — Per-bird seemings + the playtest-9 wiring pass + the standard baked in (ENGINE + build + data + docs → `deploy-to-foundry.bat` + relaunch + **re-drag EVERY adversary**, NO ⟳ Sync)

### Rulings (Ben, 2026-07-16b — menu before wiring)
- **Per-bird seemings are required** ("or the whole schtick falls flat") — mechanical, no menu.
- **Two new visible statuses approved**: `braced` (Brace ×2 timed + Predictive Ward permanent)
  and `diagrammed` (the Vital Diagram mark; Scalpel-Strike's +4 rides it).
- **Reactive Strike cues at enemy TURN START in reach**, not per action (spam).
- ⚑ **Ruling still wanted:** Combat Training's source sentence is garbled ("turn one of its own
  grazes into a graze") — miss→graze or graze→hit? Deliberately NOT silently fixed
  (CASE_STUDIES §7); checklist row asks.

### Bug root causes
- **Two Mistherons shared the max-1 seeming slot** — phantom ownership was actor-id-keyed
  (`summoner` flag) and unlinked tokens share a world actor id (every copy-pasted token; each
  compendium DROP mints a fresh actor, so the bug bit exactly the copy-paste flow). Ownership is
  now token-keyed (`phantomCasterTok`; `edhaPhantomOwnedBy` pure + pinned) with actor-id fallback
  for tokenless casters and pre-fix copies; clear-on-recast, the fooled rider, and the
  seeming-break cue all resolve per bird.
- **LATENT MORNING BUG: `edha-gm-cue` was never registered** via `registerItemEventHandlerType` —
  the DataModel silently drops rules with unregistered handler types, exactly like a bad 16-char
  rule id. Every cue authored in the morning pass would have been INERT on Ben's next build.
  Registered now (with a load-bearing warning comment); the checklist's registration row is the
  canary. Lesson recorded in CASE_STUDIES §8: "wired" is a claim about a code PATH — type gates,
  flags, AND registrations can each kill it silently.

### The playtest-9 audit (every ability classified; wired or justified)
- **Wired auto**: Brace ×2 (`edha-self-status` → timed `braced`), Probability Net
  (`edha-next-test-mod`, −1d6 labeled on the roll), Cinder Coat (`edha-thorns`, chain-guarded,
  adjacency-gated), Bite's torch-light (the Kindle light rider), Frost Lance (on-hit Slowed,
  `statusExpire: target`), Vital Diagram (`edha-apply-status` → `diagrammed` mark) +
  Scalpel-Strike (+4 `whenTargetStatus` rider; deflect bypass stays GM — riders can't reach
  deflect math), Suture Cradle (name-keyed watcher: target-tracked, Discipline vs DC 10+damage
  auto-rolled per hit — contest core), Predictive Ward (permanent `braced` icon via the baked AE).
- **Wired as cues**: Glyph Pulse (`turn-end` every 2 rounds), Reactive Strike
  (`enemy-turn-start` in reach), Phase 2 (hp-crossing card with the full transformation
  checklist), Stalker Fade (on damaged — the MISS half has no hook: no damage is ever applied;
  the card says so), Devastating Blow's margin-Prone (on-hit reminder).
- **Justified manual** (each carries `NO NAMEABLE HOOK: <reason>` in its text — lint requires it):
  Combat Training (miss/graze/hit adjudication isn't module-visible; ⚑ garbled source),
  Pack Tactics (NPC targeting intent is not data — the forever-manual class), Veil (cover/light
  is a table read), Mutation Upgrade (wants a `whenSelfEffect` rider condition — named as the
  future primitive). Conscious-use utilities (Tactical Insight, Calc Strike, Plot Die Swap,
  Glimpse the Path, Anchor of Probability, Reknit Form) need no cue — the system's own use card
  IS the automation surface.
- **Superseded hand-toggle AEs removed** from adversary-effects.json: Brace ×2, Frost Lance's
  drag-template, Probability Net's, Vital Diagram's, Bite's light note (the engine does these
  now); Cinder Coat's + Suture Cradle's kept as visible markers with updated descriptions.

### New REUSABLE primitives (all indexed in ENGINE_INDEX)
`edha-self-status` · `edha-next-test-mod` + `nextTestMod.formula` (mode block now gated — a
formula-only mod no longer forces disadvantage) · `edha-thorns` + `edhaTokenGapFt` · cue triggers
`enemy-turn-start {rangeFt}` / `turn-end {everyNRounds}` (`edhaTurnCueSweep` on
`combatTurnChange`) · `statusExpire` on `edha-triggered-effect` · statuses `braced` (NOT in the
auto-stamp set, deliberately) + `diagrammed` · `edhaPhantomOwnedBy`/`edhaPhantomCopiesOf`
(token-keyed summon ownership — reuse for any per-token summon identity) · **lint-refs pass 5**
(trigger-naming ability with no wiring and no rationale = commit fails; negative-tested).

### The standard, baked in (Ben's ask #3)
leyline-tree-authoring SKILL.md §"Adversary abilities — the same standard, first time" (the
three-way rule + the traps); session-forge stats bullet (stats ship WIRED); test-pass-fixes
Phase 2 (whole-actor audits, reachability tracing) + CASE_STUDIES §8; CLAUDE.md "Where behavior
lives"; AUTHORING_WORKFLOW (Ben-side view + the stale no-expiry-engine claim corrected);
adversaries.json `_README` (`item_fields.events` + the "buckets" line retired).

### Known limits / couldn't self-verify (no Foundry session)
- Everything in the checklist's **"Playtest adversaries wired (2026-07-16b)"** section is ⚑ —
  especially the registration canary row (if cues are silent, check for
  DataModelValidationError on load FIRST).
- Probability Net drift, documented on the rule: the −1d6 rides until the target's next test
  whenever it comes, rather than lapsing at the end of their next turn (nextTestMod has no
  round-expiry) — flag if it matters at the table.
- Cover Their Retreat still fires as the drop lands (unchanged from the morning pass).
- `validate-packs.js` deferred as always — `deploy-to-foundry.bat` runs it Ben-side.

## 2026-07-16 DELTA — ADVERSARY ability-text → hooks pass (The Seeming unreachable-case family + GM cues + the fooled rider; ENGINE + build + data → `deploy-to-foundry.bat` + relaunch + **re-drag every session-1 actor and Mistheron**, NO ⟳ Sync)

### Rulings (Ben, 2026-07-16 — asked as one menu before any fix shipped)
- **All session-1 placeholder names CONFIRMED** as written — Roek, Ashmark, Joskin, Sorrel the
  tanner, Warden Selm — and **statblock feel approved** (bruising-not-lethal stays). Run-sheet
  §10 is down to the map-art item. (Docs-only commit.)
- **Scope: wire everything.** Not just the reported Seeming — all six text-only abilities the
  whole-actor audit surfaced get engine wiring this pass.
- **Morale traits get GM cue cards too** (Starving Not Fanatic / Not a Bandit / The Line Falls
  Apart): whispered reminders at the threshold crossing, zero player-facing change. Standing
  corollary to iron rule 3: **text that names a hook gets a cue — a bare 'GM-run' label is no
  longer enough.**

### Bug root causes (the reported row + what the audit found next to it)
- **The Seeming did nothing (Ben's report) — an unreachable engine case, two layers.** The
  07-14o `case "The Seeming"` was real but dead: (1) its `useItem` hook opened with a raw
  `item.type !== "talent"` gate, and the Mistheron's ability is an ACTION-typed item; (2) even a
  flag-aware gate would have bailed, because only verbatim tree-talent twins got
  `adversaryTalent: true` at build time — bespoke `adv.items` abilities carried no flag at all.
  NOT a deploy gap: reproduces on a fully current deploy. Contributing cause: ENGINE_INDEX
  claimed "use-hook automation works as-is" for adversaries — true only of gate-free hooks
  (Draw Mana, the White coordination hook); the claim is now corrected in place.
- **One family, ~27 sites.** The same raw gates sat on every illusion/foresight/black/white/…
  `useItem`/`preUseItem` hook AND on the authored-rule iterators (test-riders, damage-riders,
  light-spec, on-hit dispatch, opportunity options, rally, def-buffs, actor-rule-of, burst +
  single-target + Lay Foundation takeovers) — meaning even the twins' faithfully copied `events`
  were silently inert on adversaries. Fixed once at the predicate (`edhaIsTalent`), every
  consumer retrofitted, and `lint-refs.js` pass 4 now FAILS any new raw talent-type comparison
  without a `type-strict: <reason>` marker (budget / pack-scan / ⟳ Sync / char-sheet-injector
  are the six deliberate strict sites, each marked).
- **Five more text-only abilities on the same actors ("soft laziness", Ben's words —
  the audit ran before any fix):** Spearing Beak's "+1d6 against a character taken in by the
  seeming", Fade, Break (Raider + Line-Caller), Cover Their Retreat, Press the Line's
  allied-shot rider. Every one names a Foundry hook, so none qualified as manual. All wired
  (below). The three morale traits joined per the ruling.

### New REUSABLE primitives
- **`edha-gm-cue`** (generic handler; event `edha-apply-watch`, on-hit variant rides
  `edha-on-hit`): whispered GM reminder card when a nameable trigger crosses — `damaged`,
  `hp-below {atFraction}` (0 = the drop; pure crossing decision `edhaCueCrossed`, pinned),
  `ally-drops {rangeFt}` (same-side, 0 = whole scene), `seeming-break` (dispatched from the
  phantom restore path), `on-hit` (item-specific). `oncePerRound` default ON via the existing
  `trigRound` gate. Author the cost into the note ("Reaction, 1 Focus — …").
- **`whenTargetFooled`** on `edha-damage-rider`: bonus injects only when the current target is
  taken in by the roller's active seeming (`edhaTargetFooled` → pure `edhaTargetFooledIn`,
  pinned) — flavor-labeled on the roll like every rider since 07-05.
- **Bespoke adversary `events` passthrough**: adversaries.json items author a SIMPLIFIED
  `"events": [{event, handler, description?}]` array; the build mints deterministic 16-char
  `fid()` rule ids (hand-authored ids were the Cruel Step silent-drop class). validate.js checks
  the shape; lint-refs cross-checks adversary handler types/kinds/statusIds AND adds adversary
  ability names to the resolvable-name universe.
- **lint-refs pass 4** — the regression pin for the whole family: raw talent-type comparisons
  can no longer land unmarked.

### Known limits / couldn't self-verify (no Foundry session)
- Every row in the checklist's new **"Adversary abilities wired (2026-07-16)"** section is ⚑ —
  cards, veil interplay, and rider injection need the bench.
- **Two Mistherons share the max-1 seeming slot** (unlinked tokens share the actor id, and the
  summon `summoner` flag is actor-id-keyed): the second bird's cast replaces the first bird's
  copy. ⚑ checklist row asks whether it bites at the table; token-uuid-keyed summoner tracking
  is the fix if so (touches the shared summon engine — deliberately not destabilized blind).
- **Cover Their Retreat fires as the drop lands** (applyDamage post-pass), not pre-drop — the
  card says to roll the drop back if Roek reacts. A pre-apply veto is heavier; deferred until
  the bench says the retro-card feels wrong.
- `validate-packs.js` deferred as always (needs Ben's compiled packs) — the adversaries rebuild
  in the deploy line is what compiles all of this in.

## 2026-07-12f DELTA — PASS-3 UNIQUE FIXES (reconciled ONTO the parallel 07-12d/#68 batch; the 6 root causes #68 missed; ENGINE + data → `foundry-build leyline` + relaunch + ⟳ Sync)

**Reconciliation note (read first).** Two sessions worked pass-3 in parallel. The **07-12d/#68**
batch (already in `main`) closed ~13 of the queued items (single-target prompt, Flashpoint,
Coercive, White visible gates, Overgrowth, Guardian Stance `edhaGuardianStanceSweep`, Kindle,
engine-move collision `edhaTokenAtDest`, teleport, Trade Routes, card persistence
`edhaMarkCardResolved`, Lay Foundation combat-start, rider legibility). This delta adds ONLY the
six root causes #68 did **not** catch — verified absent from `main` before landing, and the
duplicated work was dropped (my earlier stacked branches #69/#71 are superseded and closed). Where
we both implemented the same thing, `main`'s (#68's) version was kept; my duplicate combat-start
sweep was removed during the graft.

### The 6 unique fixes (each confirmed still-broken in `main`)
- **Rule-id validation (Cruel Step + Sudden Growth) + lint guard.** `main` still had the 15-char
  `CruelStepMove01` / `SuddnGrwthBrst1` — invalid Foundry `DocumentIdField`s the system SILENTLY
  drops at load (console DataModelValidationError only), so both talents were inert. Renamed to
  16-char ids; `lint-refs.js` now rejects any authored rule id that isn't exactly 16 alnum (+ key↔id
  mismatch). **This is why Cruel Step "did nothing" across passes** — #68 never found it. DATA.
- **Predatory Patience context-case gate (`edhaTestCtxMatch`).** `main` still compares lowercase
  `appliesTo` against the system's CAPITALIZED roll context (`'Attack'`) raw, so the +[Die] rider
  matched NOTHING on every roll. Case-normalized helper + pinned tests. ENGINE.
- **Formula-bar normalizer (`edhaTidyFormula`).** The `2d20kh+6)` garble — display pass on every
  `.dice-formula` (spaces operators, drops unmatched closers). Root-caused to `Roll.getFormula`
  (no separators) + the roll dialog's unvalidated Temporary-Bonus splice. ENGINE + tests.
- **Region rework** (Pyre + Green terrain are Foundation-shaped SQUARES; GM square-by-square spread;
  player Extinguish; Green Draw Mana click-to-place within Attunement Range). `edhaSnapCellRect` /
  `edhaSquareVisual` / `edhaGrowTerrainSquareGM` / `edhaRemoveTerrain` + rect support in
  `edhaPointInRegion` / `edhaGrowTerrain`. #68's Lay Foundation combat-start sweep is kept (mine
  dropped). ENGINE.
- **Draw Mana Black player-safe card.** `main` still printed "Weakened N of M within 30ft" — leaks
  hidden-enemy counts (Ben ruling). Public card now counts only visible enemies; hidden/wall skips
  whisper to the GM. Plus `edha.debugsave` lowercase alias. ENGINE.
- **Readable Dark follow-up**: sheetScale 130% frame-scaling (content spilled the fixed frame),
  hover fill-lift, palette expanded to the whole dark theme. CSS + one render hook. Not in #68.

### Known limits / couldn't self-verify (no Foundry session) — ⚑
All rows in the checklist's "Pass-3 unique fixes" section. Highest risk: the region rework's
square-spread adjacency on Ben's grid, and that the graft didn't leave a latent double with #68's
overlapping handlers (swept for duplicate function defs + the one combat-start double, both clean).

---

## 2026-07-12d DELTA — PASS-3 FIX BATCH (rulings R1–R4 wired, 14 items closed, 3 deferred with reasons; ENGINE + data → `foundry-build leyline` + `foundry-build deity` + relaunch + ⟳ Sync)

The queued pass-3 worklist (07-12b delta), fixed. Authored data changed in `leyline-red.json`
(Flashpoint note), `leyline-white.json` (Guardian Stance manual AE removed; White Attunement +
Concordant Presence "you can see"), `deity-life.json` (Overgrowth note) and `data/leyline.json`
prose — so this batch NEEDS both pack rebuilds + ⟳ Sync.

### Fixes (one bullet per root cause; ⚑ = bench-verify, all of them — no Foundry here)
- **Single-target gate (R1, REUSABLE):** `EDHA_SINGLE_TARGET` (Withering Ray, Verdant Mend) — with
  >1 token targeted the use cancels BEFORE cost and a whispered picker card lists the targets; click
  one → retargets and re-uses. Explains Verdant Mend's mystery Trooper heal (stale target lock). ⚑
- **Engine-move collision (R2, REUSABLE):** `edhaTokenAtDest` + occupied-destination backstep inside
  `edhaComputeMove` — every engine slide/push (Cruel Step, Unnerving, Shockwave) now stops short of
  an occupied square; manual drags untouched per R2. (The stacked pass-2 Troopers were also Flame
  Surge's "3 targets, 2 visible".) ⚑
- **Card-state persistence (REUSABLE):** `edhaMarkCardResolved(messageId, label)` stamps resolution
  ON the message (GM relay for non-authors) and a render hook re-disables its buttons everywhere,
  forever. Wired: burst Detonate/Cancel (Flame Surge's "Detonating…" → "Detonated ✓", survives F5),
  Unnerving push, generic trigger cards, the new picker. Deliberately NOT wired: Trade Routes'
  Teleport (once-per-turn by design), Puppeteer cues. ⚑
- **Lay Foundation turn-one:** the buff watcher rides cosmere's activation FLAG CHANGES, and nobody's
  flag has changed yet at combat start → a `combatStart` sweep now runs `edhaFoundationTurnStart`
  for every combatant. ⚑
- **Trade Routes teleports for real:** v13 animates plain updates along a wall-constrained walk (the
  "stuck on a wall" report). Now `doc.move({action:"displace"})` — core's own unconstrained teleport
  action — with the arrival point CLICKED inside the destination Foundation (Ben's spec), occupancy-
  checked; the GM move-token relay honors teleport too. ⚑ (also: Dread-veto interplay on displace)
- **Flashpoint advantage ENFORCED:** generic `effect.nextTestMod` on trigger cards → the confirm
  click arms `edhaSetNextTestMod` (skill=red). The primitive existed since the Red Key; "manual
  reminder" no longer defensible. Authored note updated. ⚑
- **Kindle light at table pace:** the dealer-attribution breadcrumb window was 15s — the GM reads the
  card before clicking Apply, so the light never fired. Now 120s. ⚑
- **Rider legibility (REUSABLE, the 07-05 label family continued):** `edhaRiderParts` — every
  `edha-damage-rider` term is flavor-labeled `(formula)[Talent]` in rollDamage, and burst cards print
  the full breakdown ("= 9 (2d6) + 3 (red) + 2 (Kindle) → 14 energy") — Set Charge's opacity row. ⚑
  (flavor annotations inside the system's overrideFormula pipeline are bench-unverified)
- **Coercive Pressure:** adversaries-only (disposition gate vs the owner) — allies spending focus no
  longer hand out the debuff.
- **White Attunement:** visible-allies gate + per-reason skip accounting (exact mirror of Black);
  card text + `leyline.json` prose now say "allies you can see". ⚑
- **Concordant Presence:** `edhaCanSee` on BOTH the triggering ally and the grant recipients ("too
  strong otherwise" — it triggered through walls); card + prose updated. ⚑
- **Overgrowth +1 Deflect (stacks to 3) ENFORCED:** each Overgrowth heal steps one AE 1→2→3 on the
  healed creature (`system.deflect.bonus` — the same DerivedValueField `.bonus` the defense buffs
  use); clears at combat end (Kindle convention). Authored note updated. ⚑
- **Guardian Stance auto-toggle (ruling E re-litigated):** GM-side debounced adjacency sweep manages
  a +1 Deflect AE on the owner and every adjacent living ally as tokens move; the authored manual
  toggled-OFF AE is REMOVED (no double-stack). Ben's "Deflect shows Armor" was the deflect SOURCE
  config label — the AE key was always right. ⚑
- **Trigger cards tightened (Mender's Instinct row):** one-line header, and the "target the creature"
  instruction only renders when the effect actually reads user targets (Mender's heals its victim —
  the instruction was wrong there, not just wordy).

### Deferred, with reasons
- **`2d20kh+6)` fold garble** — not reproducible from the code (no engine path builds that string);
  the checklist row asks for a screenshot on recurrence.
- **Pyre / Green terrain / Foundations → square-Region rework** (expansion square-by-square, player
  extinguish, Foundations-as-Regions): placeable-design work — per the 06-14e PROCESS note it ships
  only after Ben approves a per-talent model. **Proposal for sign-off:** (1) Pyre + Green Attunement
  terrain + Foundations all become click-placed SQUARE Regions (Foundation-sized); (2) Pyre gains an
  owner's-turn "expand" card — GM clicks an adjacent square, the Region grows by exactly that square;
  (3) the Pyre card carries an owner-clickable "Extinguish" button; (4) Foundations migrate
  Drawing→Region with behaviors (tokenEnter/turnStart replace the point-in-drawing math; Trade
  Routes/Bastion/Bonds re-read from Regions). One dedicated session, bench-gated.
- **Red Attunement card format** — verified: the Red line uses the same Draw-Mana card format as
  every other color; re-flag with specifics if it still reads wrong at the bench.

### New REUSABLE primitives (indexed)
Single-target gate (`EDHA_SINGLE_TARGET` + picker card) · `edhaMarkCardResolved`/`edhaMessageIdOf`
(card persistence) · `edhaTokenAtDest` + occupied-backstep in `edhaComputeMove` · trigger-card
`effect.nextTestMod` · `edhaRiderParts` labeled riders · the Guardian adjacency-AE sweep pattern ·
`edhaMoveTokenTo(..., {teleport:true})` displace mode.

---

## 2026-07-12c DELTA — READABLE DARK actor-sheet pass (design handoff option 1b; ENGINE + css → sync + F5, NO pack rebuild)

Implemented Ben's actor-sheet readability handoff (`Actor pages design review/design_handoff_actor_sheet_readability/README.md` — committed with this delta; values there are FINAL, don't re-derive).
The cosmere dark sheet's palette comes from `--cosmere-color-*` variables on
`.cosmere-theme-default.theme-dark` (system `output.css` ~L5620) — the whole palette change is a
variable-override block in `styles/edha.css`, scoped to `.sheet.actor` (character + adversary),
covering both theme-class placements (body or sheet element). Mapping is 1:1: sheet `#1a2338`
(texture image off), accent `#cbb995`, base-1..5 lifted one step, text-main `#e8ebf3`, text-sub
`#dcdac8`, faded `#a89d82` (now AA). Type bumps: `app-actor-skill` 10→11.5px; edha budget bar +
⟳ Sync button 11→13.5px (+ spec colors); Reserve pill lifted (engine inline style). Engine side:
the system's CharacterSheet clamps resize at MAX_HEIGHT 900 — lifted to 4000 at first render
(width stays pinned at 800 by design; the layout is built for it), `.sheet-content{flex:1}` fills
the extra height, and a new client-scoped **sheetScale** setting (90–130%, default 100) zooms the
window content per user.

### Known limits / couldn't self-verify (no Foundry session) — ⚑ (all visual)
- ⚑ Full-sheet palette sweep vs the spec PNG (`option-1b-readable-dark.png`) — esp. hover states
  that lighten panel fills: if any hover was hardcoded vs the old `#0d172f`-era fills, it may now
  read flat (spec §Interactions names this risk; report, don't guess values).
- ⚑ Drag the sheet taller than 900px: content column fills (no letterboxing); tab bodies stretch.
- ⚑ sheetScale 110/130%: content zooms, no clipped chrome; module settings show the slider.
- ⚑ Adversary sheet inherits the palette (shares `.sheet.actor`) — confirm it looks right too.

---

## 2026-07-12b DELTA — PASS-3 TRIAGE + vision-test root causes (hidden tokens gated the Weaken; the pass-2 pack rebuild never landed; ENGINE-only → sync + F5 — but the pass-2 `foundry-build leyline` + ⟳ Sync is STILL OWED, see below)

Ben ran **pass 3** (Black re-test + White/Red/Green/Kethane/Anaveth/Razkael, results in the xlsx pass-3
columns) same-day after the pass-2 fixes, then a follow-up **vision-test bench** with a full boot-to-end
console log (`tests/test-evidence/7-12-2026/`). This delta closes the two loudest pass-3 Fails and ships
the diagnostics that found them; the REST of the pass-3 worklist is triaged and queued (next section).

### Rulings (Ben, 07-12, interactive)
- **R1 — single-target talents:** when >1 token is targeted, a CHAT-CARD PROMPT picks one of the
  selected targets (NOT a hard block — a stray selection can be off-screen/overlapped and invisible
  to a human). Reusable primitive, queued; Withering Ray + Verdant Mend are consumers #1/#2.
- **R2 — token stacking:** collision prevention applies to ENGINE moves only (no `preUpdateToken`
  veto on manual drags). Queued.
- **R3 — THP display:** the separate teal "4/4" THP pool next to HP is fine as-is.
- **R4 — senses range vs sight (rules alignment):** per Ben's rules text, normal conditions = assumed
  seen; senses RANGE only matters when vision is obscured (GM-judged). `edhaCanSee` already matches
  (walls + hidden only, never vision range/lighting) — now documented on the helper and in the index.

### Bug root causes (pass-3 Fail rows closed this session)
- **Black Attunement "no enemies Weakened at all" = GM-HIDDEN tokens, not code.** Bench probe
  (`console log for vision test`): both "valid" Troopers reported `hidden=true` — walls-only and
  current-config collision both false. `edhaCanSee` correctly treats hidden as unseen; the sweep
  silently skipped them and the card just said "Weakened 0". THE REAL DEFECT WAS SILENCE → the Draw
  Mana Black line now accounts for every enemy in range by skip reason ("Weakened 1 of 6 … — skipped
  3 with an ally adjacent, 2 hidden"). `edhaCanSee` also logs its reason under `edha.debug`.
- **Predatory Patience "broke entirely" = downstream of the above.** The rider requires the target to
  HAVE Weakened (`whenTargetStatus`); Draw Mana weakened nobody, so longsword AND Withering Ray lost
  the die. No rider bug found; ⚑ re-test after the pack rebuild (the attack-only rule is authored
  data and is NOT on Ben's owned snapshot yet). The garbled `2d20kh+6)` formula bar is a separate
  legibility-family bug, queued.
- **Cruel Step "doesn't do anything still" = the pass-2 pack rebuild never landed.** Bench-confirmed:
  the owned item has NO `CruelStepMove01` rule. `deploy-to-foundry.bat` step 2 installed the engine,
  but step 3 (`foundry-build`) evidently never completed — it aborts on purpose on un-extracted
  Foundry edits, and ⟳ Sync then re-copies the OLD pack snapshot. Ben re-runs the bat (Foundry
  CLOSED) and watches step 3; `foundry-extract` first if it aborts. Zero repo changes needed.
- **`edhaCanSee` hardened while under the microscope (engine):** Foundry v13's "sight" collision test
  also collides with darkness-source edges and the scene-border rectangle by default (verified in
  13.351 source). Neither is a wall — both now explicitly excluded (`edgeOptions: {darkness:false,
  innerBounds:false}`), protecting Lawkeeper's Eye + Packmate's Warning on darkness-heavy maps. ⚑
- **Both pass-3 console logs were 1000-line TAILS** — the browser retains only ~1000 console lines
  logged while DevTools is closed. Fixed at the engine: the tracer keeps a full-session buffer and
  **`edha.debugSave()`** downloads the whole log as a file (no DevTools needed).

### New REUSABLE primitives / conventions
- **`edha.debugSave()`** — full-session tracer log download (50k-line buffer, timestamped lines).
- **Sweep-transparency convention:** any sweep that filters candidates must say who it skipped and
  why, on the card. Draw Mana Black is the model; audit other sweeps when touched.

### Queued pass-3 worklist (triaged, rulings in hand — next fix session)
Single-target prompt primitive (R1) · engine-move collision (R2) · `2d20kh+6)` fold garble (+pinned
test) · Flame Surge card-state persistence (sweep ALL clickable cards) · Lay Foundation combat-START
def-buff pass · Trade Routes = real teleport (not a walk) · Flashpoint → `edhaSetNextTestMod` ·
Kindle token-light via the Pyre path · Coercive Pressure adversaries-only · Overgrowth +1 Deflect →
`edhaLifeDeflectReduce` stacks (manual declaration no longer holds) · White Attunement + Concordant
Presence visible-allies gate (same `edhaCanSee`) · Pyre/Green/Foundation region rework (square,
GM square-by-square expansion, player extinguish; Ben asks why Foundations aren't Regions — they
predate the Region primitives, migrating them IS the fix and also solves combat-start detection) ·
legibility sweep (Set Charge dice labels, Mender's Instinct card, Red Attunement format) · Guardian
Stance adjacency auto-toggle (investigate cosmere Deflect-vs-Armor AE key first).

### Known limits / couldn't self-verify (no Foundry session) — ⚑
- ⚑ Draw Mana skip-accounting card line (unhide the Troopers first; expect "Weakened 2 of N").
- ⚑ Predatory Patience weapon-attack + Withering Ray rider revival AFTER rebuild+Sync+re-Weaken.
- ⚑ `edhaCanSee` walls-only config on a map WITH darkness sources (none available at this bench).
- ⚑ `edha.debugSave()` download in Ben's Electron/browser client.

---

## 2026-07-12 DELTA — BLACK test-pass-2 fixes (movement talents wired, LoS ruling, legibility family; ENGINE + data → `foundry-build leyline` + relaunch + ⟳ Sync)

Ben's second full in-Foundry Black run (14 talents re-tested; results in `EDHA_FOUNDRY_TEST_RESULTS.xlsx`
"Talents" sheet, Pass-2 columns; evidence in `tests/test-evidence/7-12-2026/`). Six commits on
`claude/black-pass2-fixes`, one per root cause.

### Rulings (Ben, 2026-07-12 — batched, decided interactively)
- **R1 — Attunement LoS:** Black Attunement's Draw-Mana Weaken requires **line of sight** (edhaCanSee
  sight-wall ray; darkness GM-judged), and the card text says so ("enemies you can see"). Both text
  layers updated.
- **R2 — Predatory Patience scope:** the +[Die] rider is **attack-only** — opposed skill tests
  (Extract Thought's Deception) never qualify. Card was already canon; the rule was over-broad.
- **R3 — Isolation movement:** wire **both** Cruel Step and Unnerving Approach (existing primitives,
  no new machinery).
- **R4 — Double Dip visibility:** **new** `doubledipped` marker on the marked target; the positional
  Isolated icon **stays** (Sapping Hex / Cruel Step targeting still reads it).

### Bug root causes (one per family — the Fail/Partial/note rows they explain)
- **The "all enemies moved, stacked on the wall" Fail (Unnerving Approach) was NOT the engine.**
  The mid-move evidence screenshot shows every Trooper with its own 15-ft ruler moving in parallel —
  a **Foundry v13 multi-token drag** (every enemy token selected). The engine had NO Unnerving wiring
  at all (nothing to misfire), and its only mass-mover candidates (trample, push, teleport) provably
  don't move groups. Real finding: a **design gap** — both movement talents were still 06-13 "manual
  by nature" while their primitives (edhaRunMove/edhaApplyMove, built for Red) sat unused. Both are
  wired now; the Ritual-block header comment is rewritten (the case-studies §4 lesson, again).
- **Cruel Step's "Investiture spends, no movement"** — same root: the Inv spend was the native
  activation cost; no movement code existed. Now an authored `use` rule on `edha-move` (10 ft toward
  target) with the new **`requireTargetIsolated`** config gate (warn + no move when an ally is
  adjacent to the target).
- **Predatory Patience rode Deception** — the authored rider said `appliesTo:"any"`. Now `"attack"`;
  the matcher additionally treats "attack" as attack-context OR an item-context roll whose source
  item carries a damage formula (attack talents on the item path) — never a skill test.
- **Extract Thought's "mystery Opportunity"** — the first test's d20 was a **natural 20**, which
  generates an Opportunity by itself (no plot die involved; symmetric with nat-1 Complications).
  Works-as-designed (⚑ verify the nat-20 rule against the system source at the bench).
- **The legibility family (Predator's Due / Withering Ray / Predatory Insight / Sanguine Reservoir)**
  — one theme, four surfaces: the trigger path folded the roll BREAKDOWN but not the Roll's own
  formula bar (now folds at construction → "3d8" not "(3)d(2 * 3 + 2)"); the sheet cost cell painted
  the template "½[Die] HP" instead of resolving per-actor (now "½d8 HP"); no CSS existed for engine
  prompt cards (Foundry's nowrap buttons overflowed — shared `.edha-trigger-card button` rules now);
  the Reserve checkbox's flex label shattered its bare inline text nodes into separate flex items
  (now one `<span>`). Trigger cards also print **why** they fired (the rule's `note`, now
  table-facing on Predator's Due).

### New REUSABLE pieces
- **`requireTargetIsolated`** config gate on `edha-move` (any slide can now demand an Isolated target).
- **`.edha-trigger-card button` shared CSS** — every prompt card (Opportunity/Beacon/Unnerve/civ)
  wraps long labels instead of overflowing. New cards get it for free.
- **Trigger cards print the rule `note` as the "why"** — authors: write notes table-facing.
- **`doubledipped` registered status** (blood icon) — toggled with the Double Dip scene mark, cleared
  with it at scene end.
- **Tracer handler labels** — `edha.debug(true)` lines now read `name@L<line>` (registration call
  site), so a saved console log maps straight back to source.

### Known limits / couldn't self-verify (no Foundry session) ⚑
- ⚑ Cruel Step + Unnerving Approach wired blind: targeting flow, once-per-turn gate, push direction
  (directly away from YOUR TARGET, not from you), wall stop, and the GM relay for unowned tokens.
- ⚑ `appliesTo:"attack"`: confirm a weapon attack vs a Weakened target still gains the die (the
  attack-context name is unverified; the item-path fallback keys on `system.damage.formula`).
- ⚑ nat-20 ⇒ Opportunity claim (system source unchecked).
- ⚑ edhaCanSee fails OPEN — a missing sight backend never disables the Weaken; darkness GM-judged.
- Process (next pass): save the console log **once per tree** — DevTools kept only the last 1000
  lines, losing the 10:42–11:00 Isolation tests.
- Parked for Ben: the **Puppeteer combat-tracking** question (how edha should run combats — bigger
  than one tree) and the **Black naming review** (three "Predator*" talents confuse even the author)
  — both queued as next-session decision menus, not code.

## 2026-07-06d DELTA — ATLAS RETIRED: the browser-side Leyline Atlas removed from the tree (REPO-SIDE ONLY → engine untouched, no rebuild, nothing for the bench)

Ben ruled the original browser-side "Leyline Atlas" web app — the thing this repo was created
for — **deprecated**: everything lives in the Foundry module now. This pass swept the repo for
everything that existed only to serve it, proved the Foundry pipeline depends on none of it, and
removed it. All of it is recoverable from git history.

**The dependency sweep (why this is safe):**

- No file under `scripts/`, `module-src/`, `tests/`, or `.github/` reads `src/`, `index.html`, or
  any root `Leyline Atlas *.html` file. `scripts/validate.js` mentioned `src/validate.js` /
  `src/atlases.js` in COMMENTS only (comments reworded; the filter logic itself stays — it still
  correctly skips non-tree rows like the Radiant orders in `cosmere.json`).
- Per-file consumer map of `data/`: everything the build/engine reads
  (`leyline/domain/cosmere/adversaries/authored/talent-*/path-descriptions/adversary-effects`)
  is untouched. Three files had NO consumer outside the atlas: `glossary.json` (fetched by
  `src/glossary.js` for the hover-glossary), `edha-inline.txt` (a `window.__DATA__` browser
  bootstrap), and `edha-talents.json` (the same flat table as edha-inline, referenced nowhere).
  All three removed.
- ⚑ **`data/deity-resources.json` is also a zero-consumer orphan** (deity resource summaries —
  Harvested Remains etc.) but it is content-bearing and NOT atlas-specific, so it was KEPT.
  Ben: keep as reference, or fold into the handbook and delete.

**Removed:** `index.html`, `src/` (all 21 files), `.nojekyll` (Pages artifact), `Leyline Atlas -
standalone.html` (2 MB) + `Leyline Atlas - standalone-src.html` (the two `v-pre-*` snapshots were
already deleted by the same-day package.json pass), `docs/BUILD_FLOW.md` (the Vite migration plan
for the atlas — moot), `scripts/publish.sh` + `publish.bat` (the "live site rebuilds in ~30s"
Pages publish flow; ⚑ Ben — if you used `publish.bat` by habit, plain `git add data && git commit
&& git push` does the same thing and the pre-commit hook still validates), and the three
atlas-only data files above.

**Kept (unchanged):** `scripts/validate.js` (still the data gate), `pre-commit` / `install-hooks.sh`,
the whole build/extract toolchain, all engine-consumed `data/` files, and
`source-materials/` (owned by TODO item 2, Ben-coordinated).

**Doc/manifest realignment:** `README.md` (three moving parts → two, atlas history note, no
BUILD_FLOW link), `scripts/README.md` (rewritten around the Foundry pipeline; publish flow noted
as removed), `package.json` description ("web atlas" dropped), `TODO_REPO_HYGIENE.md` items 3
(snapshot half now fully done) + 6 (Vite — obsolete, checked off).

No engine, data-consumed, or pack changes → nothing to deploy, no checklist rows.

## 2026-07-06c DELTA — REPO REVIEW: hygiene backlog captured in `TODO_REPO_HYGIENE.md` (DOCS-ONLY → nothing to deploy)

A structure/tests/hygiene review of the whole repo. Verdict: gates, CI, commit discipline, and the
docs culture are strong; the gaps are onboarding + repo hygiene, not architecture. The seven
actionable items live in **`TODO_REPO_HYGIENE.md`** (repo root), each written as a self-contained
one-session task: (1) root README for humans — **DONE same session** (`README.md`: what the project
is, the three moving parts, the gate commands, doc index); (2) remove committed binaries — **tree
half DONE same session** (all PDFs incl. the copyrighted Stormlight ones + all screenshots deleted,
`.gitignore` guards added; the history purge stays ⚑ Ben-run via the new guarded
`scripts/purge-binaries-from-history.sh` — rewrites history + force-pushes main, fresh clone, no
open PRs); (3) package.json + LICENSE + snapshots — **mostly DONE same session** (`package.json`
with `npm run gates` + per-check aliases, Node ≥ 20, zero deps; both root `v-pre-*` HTML snapshots
deleted; LICENSE deferred — ⚑ Ben chose "decide later"); (4) split
the engine into concatenated per-section sources (ONE deployed file preserved); (5) extend `tests/`
into the hook layer (fireHook + stub docs, write-asserting cases); (6) the Vite migration
`docs/BUILD_FLOW.md` already specifies; (7) collapse this doc's own header "Prior:" wall — **DONE
same session**: the header keeps the 3 newest entries + a one-line older-delta index; the 18
older entries moved VERBATIM to `HANDOFF_ARCHIVE.md` (nothing summarized away; the full `## DELTA`
sections in this doc remain canonical). Still open: §9-style full-section collapsing below (the
sections are the canonical record, so that's optional polish, not debt). No engine, data, or pack
changes anywhere in this pass.

## 2026-07-06b DELTA — TEST INFRASTRUCTURE: unit tests + cross-reference lint + full-gate CI (REPO-SIDE ONLY → engine untouched, no rebuild, nothing for the bench)

Coverage analysis found the repo's correctness rested on four layers (engine `node --check`,
validate.js, audit.py, and Ben's in-Foundry passes) with two holes: **engine changes triggered no CI
at all** (the workflow only watched `data/**`), and the string joints between authored data and the
engine — handler types, kinds, statusIds, and the ~117 talent-name literals the engine compares
against — were checked in neither direction. This pass closes both, repo-side only.

- **`tests/` (NEW, zero dependencies)** — `node tests/run.js`. `harness.js` loads the ENTIRE
  11k-line engine headlessly in a Node `vm` context (Foundry globals stubbed for load time: Hooks
  recorder, `foundry.utils`, a Roll stub with `safeEval`/`replaceFormulaData`); helpers are
  top-level `function` declarations, so they land on the context and are callable directly — the
  one-engine file needed NO restructuring. `engine-helpers.test.js` (18 cases) pins the pure
  helpers behind past table bugs: `edhaFoldDieMath` + the [Tier][Die] substitute-then-fold pipeline
  (the 07-05 roll-label family regression), `edhaEvalSync`, `edhaEventRules`/`edhaRuleOf`,
  `edhaRiderMatches`, `edhaColorRank`, `edhaFtToPx`, `edhaBurstSpecFromCfg`, plus a load smoke test
  (engine registers its ~240 hooks without throwing). `audit_parser_test.py` (10 cases) pins the
  gate's own parsers — `opposed_skill` (incl. the Order "tests X vs. your Blue" shipped-risk shape
  and the defense/color exclusions) and `mentioned`'s longer-name masking (the "Edict" collision).
- **`scripts/lint-refs.js` (NEW)** — the data↔engine contract, machine-checked both ways: authored
  overlay key whitelist (description/activation/damage/events/effects/img + docId ONLY); every
  `edha-*` event name + handler `type`, every handler `kind`, every non-empty `statusId` in
  `data/authored/*.json` must appear in the engine (a typo'd type silently does nothing — the
  silent-manual-card failure mode); every engine talent-name literal (`.name ===`,
  `edhaOwnsTalent`, `edhaCharacterOwnersOf`) must resolve to a talent in data or the in-file
  allowlist (`Draw Mana` = system action, `Edha Summons` = the summon folder) — a rename in an
  extract can no longer silently orphan its automation. All four failure classes verified caught.
- **CI (`validate.yml`)** — now triggers on `module-src/**`, `scripts/**`, `tests/**`, and audit.py
  too, and runs the full gate stack: `node --check` (engine + every script), validate.js,
  lint-refs.js, both test suites, `audit.py` (all trees; deity WARNs are non-fatal). validate-packs
  / validate-adversaries stay bench-only (they need Ben's compiled packs). The pre-commit hook
  gained the same lint-refs + tests step when engine/authored files are staged (re-run
  `bash scripts/install-hooks.sh` to pick it up).
- **Process:** test-pass fixes whose root cause lives in a pure helper should ship WITH a pinned
  regression case in `tests/` — the roll-label family would have been one test away from never
  recurring.

## 2026-07-06 DELTA — KNOWLEDGE TRANSFER: session-context docs + the test-pass-fixes skill (DOCS-ONLY → nothing to deploy)

Future sessions run on a different model; this pass encodes the working method so it survives the
handover. No engine, data, or pack changes.

- **`CLAUDE.md` (repo root, NEW)** — auto-loaded session context: project map, current phase
  (test-pass → fix cycle), the iron rules, and the "how to think here" habits (root-cause before
  fixing, one-bug-or-a-family, deploy-state first, drift-has-two-directions, primitives over point
  fixes, audit wider than the report, batch rulings, re-litigate "manual"). It routes test-result
  sessions to the new skill.
- **`.claude/skills/test-pass-fixes/` (NEW)** — the results → fix workflow as an invocable skill:
  Phase 0 parse (freeform notes → numbered worklist; 28 cross-tree name collisions) → 1 deploy
  state → 2 whole-tree audit → 3 root-cause every row (with a cause taxonomy) → 4 batched rulings
  → 5 fixes via shared primitives → 6 gates → 7 delta/checklist/ENGINE_INDEX trail. Plus
  `CASE_STUDIES.md`: seven worked diagnoses from real passes (Predatory Insight's false
  correlation, the roll-label family, the Unnerving Approach stale pack, Dread Presence's manual
  overturn, the Opportunity-menu generalization, the on-hit retrofit, Withering Ray's lying Cost
  line), each as report → tempting-narrow-fix → actual cause → lesson.
- **`leyline-tree-authoring` skill** — cross-references the new skill; stale "5,400-line engine"
  counts refreshed to 11,000+ (here and in `ENGINE_INDEX.md`).

## 2026-07-05 DELTA — BLACK test-pass fixes (Isolation = 5 ft, Reserve spend, Opportunity menu, card labels; ENGINE + data change → pack rebuild deferred (`foundry-build leyline`) + ⟳ Sync)

Response to Ben's first full in-Foundry Black pass (EDHA_FOUNDRY_TEST_RESULTS.xlsx, 07-05). A full
description-vs-implementation audit ran first; the only text/engine drifts were the six cards fixed
below — the "Unnerving Approach shows the wrong text" Big Issue is a **stale pack**, not repo data (the
push text has been in every live source since the first capture; the movement-denial text belongs to
Dread Presence — rebuild + Sync and re-check).

### Rulings (Ben, 07-05 — all four batched decisions)
- **Isolated = no ally within 5 ft (adjacency incl. diagonals)** — text, engine (`edhaIsIsolated`, now
  Chebyshev via `edhaAdjacent` + an optional token param), and a NEW auto-synced `isolated` icon all
  agree. Positional markers carry `flags.edha-content.isoMarker` and never feed back into the check
  (Maelith's inflicted Isolated, no flag, still does).
- **Reserve spend** = a "Pay from Reserve" checkbox INJECTED into the system's Spend-Investiture dialog
  (`renderDialogV2`, id `*.consume`): checking it unchecks the system's Investiture row(s) — no refund
  race — and deducts Reserve. **Double Dip** = its own Black test auto-resolved vs the target's Cognitive
  (contest core); success sets scene-scoped `flags.edha-content.doubleDipBy.<ownerId>` on the target;
  `edhaRitualHpCost` then offers "pay from Reserve instead of HP" (NOT a health loss: no Blood Price, no
  re-banking; cleared on deleteCombat). Reserve readout moved from the budget bar to under the
  Investiture bar.
- **Extract Thought** = PASSIVE (activation → Always Active): a `cosmere-rpg.skillRoll` watcher
  auto-resolves the owner's Deception tests vs the synced target's Spiritual defense; success applies the
  new registered `noreactions` marker (owner-relative expiry). Unreadable defense → owner-judged card.
- **Opportunity-spend menu (SHARED PRIMITIVE, incl. canon footer)** — post-roll watcher on
  `roll.opportunitiesCount > 0` posts a menu card of the roller's `edha-opportunity-option` rules (a NEW
  native event `edha-opportunity` + handler type — fully editable on the talent), costs deducted on
  click, one spend per card, canon spends (Aid an Ally / Collect Yourself / Critically Hit / Influence
  the Narrative, SR p.9) as a text footer. First consumer: Predatory Insight (authored rule; its direct
  use stays as a fallback). The `advTest` flag is now round-stamped (`{skill, round, source}`) so "this
  round" really expires; legacy string flags still read.

### Bug root causes (the Fail/Partial rows)
- **Draw Mana weakened everyone (27.1)**: the Black rider had NO isolation gate — only a chat note
  telling the GM to skip. Now filters `edhaIsIsolated(actor, token)` per enemy token.
- **Predatory Insight passive needed the active first (23)**: false correlation. Real cause: Whispered
  Doubt's extra-loss write is tagged `edhaFocusWatch:true`, so the focus watcher ignored it — an enemy
  taken to 0 BY Whispered Doubt never fired the regain. The zero-check (`edhaPredInsightZeroGain`) now
  also runs after our own secondary write.
- **"1d(2x3+2)" in the test breakdown + no Inv card (5/7) + the Severance blank card (4.2)**: one family.
  `Roll.replaceFormulaData` substitutes @refs but computes nothing → new `edhaFoldDieMath` folds die
  math numerically AND every rider term now carries a flavor label (`1d8[Predatory Patience]`) — composite
  d20 parts are named for free, everywhere. The cosmere chat template ignores roll `flavor`, which is
  both why Predator's Due's card was an anonymous die and where the "blank card" came from (the 0-heal
  Investiture-regain roll): new `edhaRollCard` posts every trigger roll with a content label
  ("⚡ <talent> (owner) — what it did"), and 0-amount resource gains post a text card, no naked roll.
- **Hollow Command / Puppeteer / Extract Thought (27)**: Hollow Command now contest-resolves (Deception
  vs Spiritual) → the new registered `noactions` marker (target-relative expiry) + Siphoned Will pays
  automatically on success (the beloved confirm card remains only as the no-target fallback). Puppeteer:
  GM-side `combatTurnChange` cue — a 0-focus combatant in range starts its turn → whispered
  `edhaPostCoordReactionCard` (2 Focus + 1 Inv on click; action itself GM-run). Both markers are in
  `EDHA_TIMED_STATUSES`.
- **Dread Presence (4.1, was "manual by nature")**: now ENFORCED — a `preUpdateToken` veto blocks a
  Weakened creature in an owner's Attunement Range from moving measurably closer to any living ally;
  engine forced-movement paths set `options.edhaForcedMove` and bypass it.
- **Withering Ray cost column (13)**: consume entries can't carry dice, so the sheet render hook paints
  the HP price ("½[Die] HP" / "[Tier] HP") into the Actions-tab consume cell for any talent with an
  `edha-ritual-hp-cost` rule (display-only; the event still does the deducting).
- **Text drift fixed (audit)**: Dark Investiture (Model A immediate damage now stated), Withering Ray's
  Cost line (half [Tier][Die] → half [Die] — the engine was right), Whispered Doubt ("once per round per
  enemy"), Black Leyline Attunement + Sapping Hex (5 ft), Extract Thought + Predatory Insight (new
  mechanics). Both `data/authored/leyline-black.json` and `data/leyline.json`.

### New REUSABLE primitives
- The **Opportunity menu** (`edha-opportunity` event + `edha-opportunity-option` handler +
  `edhaOpportunityMenuWatch`) — later trees author one rule to join the menu.
- `edhaRollCard(owner, name, roll, text)` — labeled engine roll cards (use for ALL future trigger rolls).
- `edhaFoldDieMath(formula)` + flavor-labeled rider terms — clean, named d20 breakdown parts.
- The **Isolated marker sync** (`edhaSyncIsolatedMarkers`, debounced, GM-side, combat-scoped).
- `noactions` / `noreactions` registered marker statuses; `advTest` round-stamping.

### Known limits / couldn't self-verify (no Foundry session)
- `roll.opportunitiesCount` (system getter) as the menu trigger; the consume-dialog DOM injection; the
  Dread Presence veto's feel at the table (strict "closer to ANY ally" reading — ask if you want a
  bypass key); marker-sync flicker on long drags. All flagged ⚑ in the checklist section.

## 2026-07-04 DELTA — ENGINE BACKLOG BUILT (all 11 §9a/§9b items; ENGINE + module.json → NO pack rebuild; full relaunch at deploy)

Ben's directive: everything code-able gets built now, so the only remaining item is the manual
Foundry test. Per-item proposal signed off first (the 06-14e process rule), then **one commit per
item**, each gated on `node --check` + `validate.js` + full-tree `audit.py` exit 0. §9a and §9b are
now EMPTY (moved to §9g history); §9c/9d/9e/9f are untouched — blocked, bench-gated, manual, and
balance respectively. New checklist section: **"Engine backlog pass"** (top of the file, after the
deploy block) carries the bench rows including four ⚑ unverifiables.

### The 5 shared primitives (§9a)
- **GM summon relay** — `edhaSummon` split bake-from-create: the spec resolves ENTIRELY owner-side
  (HP rolled, formulas baked, ownership stamped), then `edhaSummonCreateGM` runs directly with
  ACTOR_CREATE or via the new `summon-actor` socket action (the burst-apply mirror). The GM half
  resolves the "Edha Summons" folder (players can't create folders). Consumers unchanged — all
  summons funnel through `edhaSummon`.
- **Melee discriminator `edhaAttackKind(item)`** — "melee" | "ranged" | null: an explicit
  `flags.edha-content.attackKind` stamp wins (edhaSummon bakes one on its attack action), else the
  weapon's `system.range` (⚑ shape unverified until bench), else null = today's owner-judged
  behavior. Gated: Life Bone Spurs/Venom Glands (stands-down card), Death Withering Touch (skips +
  STAYS ARMED), Power Warlord's Advance (stays armed) / Fury / Mantle spirit. Thrown/reach stays
  owner-judged BY DESIGN.
- **Injury tool `edhaAddInjury(target, {source, damageType})`** — a world/compendium RollTable named
  like "Injuries" wins (table content stays a GM design call); else the six-entry placeholder list
  keyed by damage type (Ben-approved default). Create = the new `create-item` relay (inverse of
  Reknit's delete-item); schema drift retries a bare create (⚑). Wired: Raise Dead "+1 injury"
  (card names it), Apex Form's end (the `apexForm` scene-clear in edhaClearLifeState).
- **LOS helper `edhaCanSee(viewer, target)`** — hidden target = unseen; else a sight-blocking-wall
  ray between centers. Deliberately NOT native `testVisibility` (user-relative — Lawkeeper's check
  runs on the ATTACKER's client about the OWNER's view; the wall ray is deterministic everywhere).
  Fails open; darkness stays GM-judged. Wired: Order Lawkeeper's Eye "while you can see it"
  (enforced), Green Packmate's Warning UPGRADED from truly-manual (a defender-keyed −2 NumericTerm
  on unseen attacks = the card's +2 defense; the Mantle-aura dialog caveat ⚑ applies).
- **Forced-move stamp** — `edhaMoveTokenTo` + the `move-token` relay stamp `options.edhaForced` on
  every engine-driven relocation; Order's move violation watcher SKIPS stamped moves (a push is not
  "taking the action") and still prompts on unstamped walks / GM hand-drags.

### The 6 tree-local hooks (§9b)
- **Destruction Pinpoint** — the detonation terrain centers on the primary target, tags
  `followTokenUuid` (a new `extraFlags` passthrough on edhaDropHazard), and an updateToken watcher
  recenters Region + paired visual while the target lives. ⚑ Region-onto-token may not fire
  tokenEnter; turn-start still hits.
- **Destruction Pyre** — end-of-owner-turn (the Bone-Garden `combat.previous` shape) whispers a FREE
  confirm card per Pyre zone; the button reuses the Spreading-Roots +5 ft grow (a `data-edha-free`/
  `data-edha-label` extension — Roots' −1 Inv path unchanged). "Flammable" stays GM-judged: the
  confirm IS the judgment. Pyre zones became findable via new `sourceItem`/`sourceOwnerUuid` stamps
  in edhaPlaceHazard. (NOTE: §9b listed this under "Red" by die color; Pyre is Destruction/Razkael.)
- **Chaos Shatter Focus auto-prompt** — the contest-watch Roll hooks whisper the owner the Reaction
  when a foe BEARING THEIR OMEN rolls a test (never auto-fires; native use pays the cost). Spam
  gates (the Ben-approved shape): Omen-bearers only + once per foe per turn + a Mute button
  (`shatterPromptOff`; a real use re-arms). ⚑ reassess spam live.
- **Power target-bound `nextTestMod`** — the flag gains `targetUuid`; injector + consumer fire only
  with that creature as the synced target. Warlord's Advance's survivor Presence advantage binds it
  ("vs that target" was trusted). Target-agnostic writers unchanged.
- **Life Vital Diagnosis** — Knowledge's whispered HP/conditions/defense snapshot
  (edhaGnosisRevealLines, built AFTER Life declared this manual) now posts on use for the synced
  target. UPGRADED from manual in the Life header.
- **Civ enemy-cost EXPERIMENT** (the one item 07-03c parked "after bench"; Ben approved the override
  on no-ship-on-failure terms) — subclasses the native ModifyMovementCostRegionBehaviorType; the
  owner's side gets no terrain effect, enemies fall through to the native ×2. Every failure mode
  degrades to Ben R3's shipped-blind cost: registration is try/caught + edhaCivFortifyGM only emits
  the type when registered, and the resolver name is double-covered (⚑ the bench GO/NO-GO: ruler ×2
  enemy / ×1 ally; on NO-GO delete the block and R3 stands).

### Found & fixed in the same pass
- **`fortified` was never declared in module.json documentTypes** (registered in code only; nothing
  after 06-16 has run live, so it was never caught) — Bastion's Region create would likely have
  failed validation at the bench. Declared now alongside the new `enemy-cost`; module.json changed →
  the full relaunch the deploy already requires.

---

## 2026-07-03c DELTA — ENGINE BACKLOG CONSOLIDATED (review/consolidation pass, NOT a wiring pass; docs + one engine one-liner → NO pack rebuild)

With all 15 trees complete, the backlog was scattered across three sources (handoff §9, the 15
`register-skills.js` section headers, the checklist Watch-items). This pass makes **§9 the single
canonical backlog**, verified item-by-item against the engine (not trusting the headers). Counts:
**11 REAL unbuilt items** (5 shared primitives + 6 tree-local hooks) after merging **5 duplicate
cross-tree families** into one entry each (GM summon relay, melee discriminator, injury tool, LOS
helper, forced-move stamp); **10 stale/superseded bullets KILLED** (listed in the PR body so nothing
disappears silently); **1 item reclassified** backlog→manual (no-AI-intent — no hook can ever exist);
plus 4 blocked-on-system and 3 bench-gated items tracked separately. §9 is now grouped **shared →
tree-local → blocked → bench-gated → manual-by-design → post-playtest balance**, with the resolved
bullets moved to §9g history.

**The one engine change** (a sweep-fix caught during verification, Ben-approved): the **Blue Key Draw
Mana rider** was still a manual "advantage on your next Cognitive test" note while the identical Red Key
clause was ENFORCED — now wired via `nextTestMod` (attr-gated int/wil, mirroring Red). ENGINE-ONLY
(name-based, F5/relaunch — NO pack rebuild). Each affected engine section header gained a one-line
pointer to §9 as canonical for shared items; the per-tree lists were NOT deleted (audit.py's silent-card
check + the "named, not dropped" convention are load-bearing). Full-tree `audit.py` stays exit 0 (no
tree regressed), `node --check`, `validate.js` all clean. The one-time DEPLOY + the bench pass remain
separate outstanding work (top of `EDHA_FOUNDRY_TEST_CHECKLIST.md`) — deliberately NOT folded into the
backlog.

---

## 2026-07-03b DELTA — ORDER (Tessavain, deity) tree wired (Edicts + Covenants; ENGINE + data change → pack rebuild deferred + ⟳ Sync) — **ALL 15 TREES COMPLETE**

Tenth deity tree with a delta (fifteenth and FINAL tree wired overall). Blue declares law (**Edicts**:
prohibition → consequence), White keeps faith (**Covenants**: pacts → protection). The signature
subsystem is the Edict/Covenant lifecycle — owner-flag lists on the Charge/Remains/Foundation worked
pattern (cap = tier, oldest fizzles) + two new registered marker statuses (`edict` blue padlock,
`covenant` white aura), everything cleared on deleteCombat. Composes existing machinery throughout:
`edhaConsumeCost`/refund takeovers, `edhaRollColorTest` + `edhaReadDefense(cog)` (Verdict — the
Kneel/Killing-Blow dispatch), `edhaFoeSkillVsColor` (both "tests Discipline vs. your Blue" courts;
`EDHA_SKILL_ATTR` gained `dis:"wil"`, verified against foundry-build.js's own SKILL_ATTR),
`edhaApplyBurstResults`/relays, `edhaApplyTimedStatus` (Disoriented owner-relative / Weakened
target-relative), `edhaGrantTempHpCross` + `edhaGrantAdvAttack`, the applyDamage pre/post-pass
(Concord's rider + Shoulder the Oath's Reaction card), the shared `edhaPrevPos` token stamp and a new
inv-value stamp (the `edhaHea` shape), the def-buff AE shape + a debounced proximity refresher (the
Civ construct-in-Foundation move-watcher shape), and `edhaTriggerAllowed`/`edhaCoordOPRAllowed`
once-per-round gates. **One new primitive**: the engine's FIRST start-of-ROUND consumer (a
round-boundary check on the existing combatStart/combatTurnChange hooks — everything prior was
start-of-YOUR-turn) for Bear Witness; extract-ready for future start-of-round cards. **No side-engine,
no new sidecar table.**

### The name collisions + the auditor fix (R10 — found exactly as predicted, then root-caused)
"Edict" ⊂ Sovereignty's "Edict of the Fallen" and "Concord" ⊂ White's "Concordant Presence" made
`audit.py`'s substring-based silent-card check FALSE-PASS both (100% unwired, absent from the FAIL
list). Verified AUDITOR-side only — every engine name match is exact (`EDHA_SOV_TALENTS`, the
Coordination watcher), nothing misfired at runtime — so the fix went into audit.py, NOT a rename
(unlike Knowledge's Apex Predator, "Edict"/"Concord" are load-bearing words in this tree's own card
text): longer-name masking + word-boundary matching. The same pass fixed a SECOND blind spot: the
soft-laziness regex couldn't see "tests Discipline **vs. your** Blue" (lowercase "your"), so Order's
Discipline courts were invisible to the gate; the pattern is now caught, contest sites additionally
include `edhaFoeSkillVsColor`/`edhaSpeedVsRedProne`/`edhaRollOpposedSkill` (so the already-wired
Bastion/Magnum/Concussive Yield/Inevitable Snare resolvers count), and the handful of doc/comment
shorthands that said bare "Edict" for Edict of the Fallen were expanded so the check can't false-pass
through them. Full-tree audit stays green (no new FAILs; order went FAIL/8-silent → WARN-only).

### Rulings (Ben, 07-03b — all proposals accepted: R0–R10)
- **R0 — die/range split:** BLUE = every Edict-side range + every [T][D] payload ("+ @attr.int" on
  Edict + Final Decree only); WHITE = every Covenant-side range + the flat "your White" (= rank)
  values; Final Decree's Witness THP die = [T][D on WHITE] (Covenant-side buff, the Sovereign's-Favor
  precedent). Concord's "your Presence" bakes off the OWNER.
- **R1 — the violation model:** declaring the violation is VOLITION (owner/GM "⚖ Violated" button);
  the engine WATCHES all three canonical prohibitions and PROMPTS — move (`edhaPrevPos`), Investiture
  spend (inv-value stamp — it IS detectable, checked before calling it manual), attack-the-chosen-ally
  (the Sovereignty roll-watch shape). Consequence fully engine once fired. Caps: oldest fizzles.
- **R2 — Covenant:** touch ENFORCED (≤5 ft at cast, refused pre-cost); the mutual +1 all defenses is
  a GM-side proximity-watched AE pair; the owner wears ONE +1 (pacts don't compound on one head), an
  ally of two Order PCs wears one per owner; "deliberately attacks" = detect + prompt + Break button.
- **R4 — Shoulder the Oath REDONE** (the Death R6/R7 / Civ R2 / Power R5/R6 process): the authored
  edha-temp-hp event was the documented partial ("apply your own + the damage redirect manually") —
  removed (deity-order.json events:{}, talent-thp.json SUPERSEDED); now the post-damage whispered
  Reaction card: owner takes floor(D/2) same-type (edhaRedirected:true), ally heals back
  min(D, half + White), BOTH gain White-rank THP; once/round (the Lifeline gate).
- **R5 — Lawkeeper's Eye:** the advantage clause is WIRED (defender-keyed pre-roll injector — the
  Bulwark-Ground shape inverted to grant; covers Decree-bound too); the intent-reveal clause reuses
  Fate's Read-the-Threads no-AI-intent-hook backlog declaration (GM-reveal line on the Edict card);
  "while you can see" owner-judged (no LOS primitive).
- **R6 — Sealed Edict** seals the most recent unsealed Edict (the Inevitable-Snare flag-the-last
  shape); its court is engine-rolled Discipline vs Blue, Weakened expire:"target".
- **R7 — Verdict** excludes the bound target from its 10 ft court ("each OTHER enemy"); the AoE
  damage is ONE shared roll (the Necrotic-Cascade convention).
- **R8 — Concord's rider** = first DAMAGING hit per round per ally (a clean miss leaves it armed),
  same type as the hit, enemies only, the owner excluded ("each Covenant ALLY").
- **R9 — Final Decree:** decree-bound enemies do NOT count against the Edict cap ("as if bound");
  Witnesses snapshot at cast; **R9.1** — "every active Edict immediately triggers" is read literally:
  each resolves individually (own roll, own target, own Sealed rider), all consumed; the 10 ft blast
  is ONE shared roll with the violator INCLUDED (the Magnum-Opus R7a precedent).
- Second-pass check (the Knowledge R9–R11 lesson) held: no dropped talents; the stacking matrix
  (shared icon vs per-owner lists, advantage non-compounding, resolver-consumes-first racing, THP
  keeps-higher, dead-target batch entries) is declared in the section header.

### Per-talent wiring (full detail = the Order section header in `register-skills.js`)
- **Edict** (1 Action, 1 Inv) — TAKEOVER: Blue-range target + prohibition picker → list + padlock +
  the Violated button; violation = ONE [T][D blue]+Int spirit + Disoriented (owner-relative), consumed.
- **Covenant** (1 Action, 1 Inv) — TAKEOVER: adjacent willing ally → list + aura + the proximity AE
  + the Break button; Aid-at-range carded manual.
- **Lawkeeper's Eye** (passive) — wired advantage injector vs your bound targets (allies included);
  intent-reveal = GM line (backlog: no AI-intent hook).
- **Sealed Edict** (Free, 1 Inv) — TAKEOVER: seal-the-last; violation adds the engine-rolled
  Discipline court (+[T][D blue] spirit + Weakened on a fail).
- **Bear Witness** (passive) — start-of-ROUND: covenanted allies in White range get THP = White rank.
- **Shoulder the Oath** (Reaction) — REDONE: the post-damage Reaction card (see R4).
- **Verdict** (2 Actions, 2 Inv) — TAKEOVER: Blue vs Cognitive; success = the shared violation
  resolver + the 10 ft Discipline court (one shared damage roll, Disoriented on fails).
- **Concord** (2 Actions, 2 Inv) — TAKEOVER: scene arm; ally first-hit-per-round +Presence dealer
  rider; Aid grants carded manual.
- **Final Decree** (3 Actions, 3 Inv, once/scene) — TAKEOVER: scene-wide decree snapshot; the button
  fires the three-step batch (Edicts → Witnesses → the 10 ft blast).

### New REUSABLE primitives
- **The start-of-ROUND consumer** (`edhaOrderRoundTick`'s round-boundary check) — any future "at the
  start of each round" card reuses this shape (nothing start-of-round existed before this pass).
- `dis` in `EDHA_SKILL_ATTR` — Discipline is now a first-class opposed-skill id for any tree.
- The hardened auditor (name masking + word boundaries + the "vs. your Color" pattern) protects every
  FUTURE tree from the two collision classes this pass hit.

### Known limits / couldn't self-verify (no Foundry session)
The `edict`/`covenant` status tints (the standing Death-tint caveat); the Covenant proximity sweep's
AE churn on long drags (250 ms debounce); `dis` resolving to a real rank+wil roll (flat-1d20 = wrong
id); the start-of-round boundary firing exactly once (combat start + round advance, never mid-round);
the Investiture watch prompting on GM hand-edits (by design — the owner judges). **See the Order
section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py` ALL trees exit 0 (order
WARN-only, was FAIL with 6 listed + 2 collision-hidden silents), `validate.js`, `node --check`.

---

## 2026-07-03 DELTA — KNOWLEDGE (Gnothis, deity) tree wired (the Insight economy; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Ninth deity tree with a delta (thirteenth wired overall). No signature subsystem beyond the tree's own
**Insight economy** — a resource (max 5, one bearer at a time) that most damage cards scale against
(roll ONE `[Tier][Die red]` unit × the Insight count). Composes existing machinery throughout:
`edhaReadDefense`/`edhaRollColorTest` (the Kneel/Sovereignty test-takeover dispatch), the applyDamage
pre/post-pass with `edhaDealerOf` (the Withering-Touch armed-strike shape), the SHARED live→0 HP stamp
(Death's preUpdateActor hook), the EXISTING generic `edha-marked-damage-trigger` dispatch (Prognosis is
the literal worked example — reused verbatim, not reinvented), `edhaTriggerAllowed`/`edhaMarkTriggerUsed`
(the generic once-per-round gate), `edhaAlliesInAttune`/`edhaAllyInAttune`/`edhaDeathInRange` (Attunement
Range checks), `edhaApplyBurstResults`/relays. **One new primitive**: the Insight economy itself (a
pointer-only owner flag naming the current bearer + the already-registered stackable `insight` status's
own count) — the tree's equivalent of Death's Remains list / Power's Fury tally. **No side-engine, no new
sidecar table** beyond one small addition to the existing `talent-state.json` generic-rule table.

### Rulings (Ben, 07-03 — all proposals accepted; three follow-ups after a second pass caught a dropped
### talent and three unaddressed stacking interactions)
- **R0 — die/range split** (the Sovereignty R2/Death R0/Civ R0/Power R0 precedent): GREEN backs EVERY
  "Attunement Range" check tree-wide; RED backs every `[Tier][Die]` damage payload.
- **R1 — Insight's source of truth:** the registered stackable `insight` status's `effect.system.count`
  is authoritative (set directly via `effect.update`, not incremental toggling) — ⚑ **the tree's top
  bench-verify item**: the field name is a best guess, could be `stacks`/`value`/`amount` instead; named
  fallback = swap the field once confirmed in Foundry's console. A pointer-only owner flag
  `flags.edha-content.gnothisBearer = targetUuid` names "my current bearer" (unavoidable bookkeeping —
  the single-bearer invariant is inherently owner-scoped). Placing Insight on a DIFFERENT creature clears
  the old bearer to 0 first (Studied Mark's literal text, applied tree-wide).
- **R2 — name collision:** the capstone "Apex Predator" collided with Green/Instinct's already-wired
  "Apex Predator" (`edhaOwnsTalent` bare-name match at the Green pre-roll injector). RENAMED to **"The
  Final Study"** (domain.json / talent-rolls.json / deity-knowledge.json) rather than gating on color —
  Green's card is untouched, no data churn on a live-shipped talent.
- **R4 — Death Mark's ally-burst die** bakes off the Gnothis OWNER's own Tier + Red rank (the Pack-Share
  "your Tier" precedent), not the acting ally's.
- **R6 — PC drops count** for the on-kill triggers: unlike Death/Civ/Power's kill-tally precedent (which
  exclude PC drops or gate on hostile disposition), Knowledge's on-kill clause is a resource TRANSFER, not
  a farming tally — any bearer (PC or NPC) dropping to 0 triggers it, no gate.
- **R9 — Hunter's Discipline + Death Mark** (both ownable — Death Mark's prereq is "Hunter's Discipline OR
  Killing Blow") both fire independently on the same on-kill event; the single-bearer rule means whichever
  transfer prompt is clicked LAST just wins — no compounding-prevention needed.
- **R10 — Pack Share + The Pack** stack additively when both armed (neither card says "instead of"; both
  cost their own action + Investiture to arm).
- **R11 — each talent's "first ally to hit places Insight"** is tracked as an independent once-per-round
  flag (matches how oncePerRound gates work elsewhere — per-ability, not shared).
- Caught in a second pass after an explicit "tread carefully, don't skip work" check: **The Pack** was
  initially dropped from the first proposal draft entirely — re-added before any code was written.

### Per-talent wiring (full detail = the Knowledge section header in `register-skills.js`)
- **Studied Mark** (1 Action, 1 Inv) — TAKEOVER: 2 Insight on a Green-range target (clears any prior
  bearer) + a whispered HP/conditions/Phys+Spirit-defense reveal card.
- **Predatory Strike** (1 Action, 1 Inv) — armed rider (Warlord's-Advance shape); PRE-pass adds
  `[T][D red] × max(Insight, 1)`; POST-pass places 1 Insight on the actual hit target.
- **Killing Blow** (1 Action, 2 Inv) — TAKEOVER: target = your own bearer (no re-targeting); Red vs
  Physical; success = `[T][D] × Insight` + clear all; failure = `[T][D] × 1` + remove 1.
- **The Final Study** (capstone, 3 Actions, 3 Inv, once/scene) — same test shape as Killing Blow; success
  also prompts allies in Green range for a free Strike (player-executed).
- **Accumulate** (passive) — start-of-turn tick (+1 Insight in range, capped 5, hand-written
  `combatTurnChange`) + a DATA-SIDE `edha-marked-damage-trigger` event (+1 Inv when the bearer takes
  damage from any source, once/round — reuses Prognosis's exact generic dispatch).
- **Pack Share** (1 Action, 1 Inv) — TAKEOVER arming a scene flag + a PUBLIC reveal card (allies'
  controllers need to see it too); hand-written ally dealer-rider (+Tier vital) + first-hit-per-round
  Insight placement.
- **Hunter's Discipline** (passive) — hand-written OWNER-only dealer-rider (+Tier vital on your own hit);
  on-kill: a whispered candidate prompt transfers `floor(slain Insight / 2)`.
- **The Pack** (1 Action, 2 Inv) — same shape as Pack Share, but the rider is dynamic (+ your live
  Insight count, not a flat Tier); its own independent once-per-round Insight trigger.
- **Death Mark** (passive) — on-kill: a whispered candidate prompt transfers the FULL slain Insight count,
  PLUS a PUBLIC per-ally burst prompt (each ally's own controller picks the enemy and clicks).

### New REUSABLE primitives
- **The Insight economy** (`edhaGnosisSetInsight`/`edhaGnosisAddInsight`/`edhaGnosisInsightOn`) — any
  future "stack a resource on one bearer at a time" mechanic reuses this shape.
- Confirmed (not new, but newly proven in practice): the generic `edha-marked-damage-trigger` dispatch
  correctly serves a SECOND deity tree's talent (Accumulate) with zero engine changes — the sidecar-table
  reuse story works as designed.

### Known limits / couldn't self-verify (no Foundry session)
The `effect.system.count` field name (top bench-verify item — see R1); the Predatory-Strike pre→post
handoff (`_edhaGnosisPredatoryHit`, 15 s) on a late GM Apply click (the standing Warlord's-Advance-shaped
limitation); whether the public (not whispered) Pack Share reveal / Death Mark burst cards read cleanly
at the table. **See the Knowledge section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean:
`audit.py knowledge` (WARN-only, was FAIL/8 silent + 1 false-pass on the Apex Predator collision),
`validate.js`, `node --check`.

---

## 2026-07-02c DELTA — POWER (Tyrith, deity) tree wired (dominate → kill → escalate; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Eighth deity tree with a delta (twelfth wired overall). No signature subsystem — the spine is (a) **Black control tests** as preUseItem takeovers rolling Black and gating on `edhaReadDefense(cog)` (the Sovereignty/Chaos dispatch, never trust-the-player) and (b) **Red kinetic riders** on the applyDamage wrapper pre/post-pass with `edhaDealerOf` (the Withering-Touch armed-strike + Tempered-Edge injection shapes). Both pre-standard wirings were audited against the card text and **REDONE** (the Death R6/R7 process): Warlord's Advance's authored `edha-on-defeat` rider was the documented kill-attribution HEURISTIC ("GM adjudicates… decline if the kill came from another talent") and Investiture of Command's authored `edha-temp-hp` event granted only the FIRST targeted ally — both removed from `deity-power.json` (authored `events:{}` overrides the sidecar rows; notes refreshed) and rebuilt to the card text. Composes existing machinery throughout: `edhaConsumeCost`/refund takeovers, `edhaApplyTimedStatus`, `edhaGrantTempHpCross`, `edhaGrantAdvAttack`, `edhaSetNextTestMod` (the Red-Key `attr` gate), `edhaApplyBurstResults`/relays, the timed-coordinate sweep, and the status-registration row (`compelled`/`frightened`). **No side-engine, no new sidecar table.** New section in `register-skills.js` right after Civilization.

### Rulings (Ben, 07-02c — all proposals accepted as defaults)
- **R0 — die/range colors:** BLACK = the control tests + ranges (Kneel, Absolute Authority), Crown of Thorns, Investiture of Command's [Die] + ally range, Mantle's aura/redirect range; RED = Warlord's Advance + Unstoppable Advance dice — **both authored formulas FIXED black→red** (the roll-data note already said "Red [Die]") → data change.
- **R1 —** Kneel's Compelled is **NOT core prone**: new registered `compelled` status (own id, the harvested/decaying precedent), timed until the start of your next turn; `frightened` registered as a GM-applied marker. The move-toward-or-nothing clause is forced volition (manual, carded).
- **R2 —** Kneel's advantage clause is a wired PASSIVE: pre-roll injector — synced target bears compelled/frightened/weakened + stands in Black range → advantage.
- **R3 —** Absolute Authority: target gate ENFORCED; success = the "you choose its action" card (forced volition, manual); failure → Weakened until the end of ITS next turn (auto).
- **R4 —** Crown of Thorns auto-pings every ENGINE-resolved Black/Red vs-Cognitive test — in-tree + the Sovereignty **Censure/Decree** sites (same PC can own both trees; Edict of the Fallen is vs Spiritual, excluded) — plus an owner-click ping button for unresolved tests (the Expose shape). Ping = Presence spirit via burst-apply (spirit bypasses deflect = "cannot be reduced").
- **R5 —** Investiture of Command REDONE as a takeover: up to 3 targeted allies in Black range, **ONE shared [T][D black] roll** (the Necrotic-Cascade convention) → THP + `advAttackNext` each; caster's tier spirit self-damage auto-applies.
- **R6 —** Warlord's Advance REDONE as the armed-strike rider: the [T][D red] joins the SAME damage application in the PRE-pass so the kill check includes it; kill → THP = tier + the 10 ft move prompt; survivor → Presence-test advantage (`nextTestMod` attr:pre; target binding card-noted).
- **R7 —** Warlord's Fury counts **hostile-disposition non-summon NPCs only** (no PC/ally farming — the Death-R2 spirit); below-half once per victim, +1 per kill, one blow can score both; cap tier×2 applied live.
- **R8 —** Unstoppable Advance gets the tree's ONE new handler: the GM-side **move-through watcher** (`preUpdateToken` position stamp → segment sampling vs enemy squares, once per enemy per activation, per-enemy rolls); the can't-be-Slowed/Immobilized/Prone clause is ENFORCED (a `createActiveEffect` deleter while armed).
- **R9a —** Mantle's ally "+1 to all tests" = the NEW **flat-bonus pre-roll injector** (+1 NumericTerm appended to the d20 roll, live ally-in-Black-range check) — ⚑ bench-verify vs dialog-roll rebuilds; AE fallback named backlog. **R9b —** the redirect = **watcher-plus-prompt** (the Expose/Bonds shape): damage on the mantled owner → whispered card, budget = min(tier, HP lost), per-click ally target + amount, applied with `edhaRedirected:true` (Devoted-Conduit honest) + the wearer heals back the same.

### Per-talent wiring (full detail = the Power section header in `register-skills.js`)
- **Kneel** (1 Action, 1 Inv) — takeover: Black vs Cognitive → `compelled` (timed, owner-relative); forced action carded manual; the advantage passive rides `pre{Attack|Item}Roll`.
- **Warlord's Advance** (1 Action, 1 Inv) — use arms `warlordNext`; next WEAPON hit: +[T][D red] in the pre-pass, kill/survivor outcomes in the post-pass (real attribution — heuristic gone).
- **Crown of Thorns** (2 Actions, 2 Inv) — scene arm + `edhaCrownPing` (auto at engine sites, click-button otherwise).
- **Absolute Authority** (2 Actions, 2 Inv) — takeover: enforced gate, Black vs Cognitive; success carded, failure auto-Weakens.
- **Momentum of Victory** (Free, 1 Inv + Opportunity TRUSTED) — card + `momentumNext` (+tier on the next weapon hit).
- **Unstoppable Advance** (1 Action, 1 Inv) — armed flag + move-through watcher + status shrug-off + end-of-next-turn sweep; trample kills feed Fury (burst-apply attribution).
- **Investiture of Command** (2 Actions, 2 Inv) — takeover: ≤3 allies, one shared roll, THP + attack advantage, tier spirit self-cost.
- **Warlord's Fury** (2 Actions, 2 Inv) — scene tally on the dealer post-pass; +min(tally, 2×tier) on melee weapon hits in the pre-pass.
- **Mantle of the Aspirant** (3 Actions, 3 Inv, once/scene) — takeover: +2-defense AE, +tier spirit melee rider, the ally +1 injector ⚑, the redirect prompt card.

### New REUSABLE primitives
- **The flat-bonus pre-roll injector** (Mantle) — the first "+N to tests" aura; any future flat-test-bonus talent reuses the term-append (or its AE fallback once benched).
- **The move-through watcher** (`preUpdateToken` position stamp + `edhaSegPointDist` segment sampling) — any future "damage enemies you move through/past" talent.
- **`compelled`/`frightened` status rows** — the control-mark vocabulary Knowledge/Order social cards can reuse.

### Known limits / couldn't self-verify (no Foundry session)
The Mantle +1 NumericTerm append vs `configureModifiers`/dialog rebuilds (THE watch-item — fallback named); one straight segment per `updateToken` for waypointed drags; the `_edhaWarlordHit` pre→post handoff on late GM Apply clicks (15 s); Compelled's owner-relative expiry via `edhaApplyTimedStatus` (not the auto-stamp set); Crown pings need a GM online for player wearers; melee-ness of weapon hits stays owner-judged (the standing applyDamage limitation). **See the Power section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py power` (WARN-only, was FAIL/5 silent), `validate.js`, `node --check`.

---

## 2026-07-02b DELTA — CIVILIZATION (Kethane, deity) tree wired (Foundations + the Combat Construct; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Seventh deity tree with a delta (eleventh wired overall) — and the first whose spine was **pre-standard wiring**: the 2026-06-12 Lay Foundation preUseItem takeover (gold 10 ft Drawings, tier sustain cap, begin-turn defense buff) and the authored Forge Construct `edha-summon` spec (incl. the baked Siege Form effect + Siege Cannon). Both were **audited against the actual card text and KEPT** (the Death R6/R7 process): the only redo was removing Lay Foundation's stale `edha-aoe-template` authored event, dead since the takeover (Ben R2). Everything else composes existing machinery: the applyDamage wrapper pre/post-pass with `edhaDealerOf` (Tempered Edge / Arsenal / Magnum Opus riders — the Green-Instinct injection shape), the SHARED live→0 HP stamp behind Death's defeat watcher (Bonds of Community, its own consumer), the Fate-Snare Region-event shape (Bastion's enter check), `edhaGrantTempHpCross` + the Green `advAttackNext` primitive (Bonds), `edhaMoveTokenTo` (Trade Routes' Teleport), `edhaConsumeCost`/refund + the Chaos/Death takeover dispatch, and the `civ-fortify`/`civ-link`/`civ-dismantle` relays. **No side-engine, no new sidecar table.** New section in `register-skills.js` right after Death.

### Rulings (Ben, 07-02)
- **R0 — die colors:** the color split across the two branches is MIXED (the Construct branch is all White, Bastion sits Red on the Foundation branch) → the ambiguous rider goes **Red**. Net: WHITE = Construct HP/Slam/Siege Cannon (as authored), Magnum's bonus HP, Lay Foundation range, Bonds THP (= `edhaWhiteMod`); RED = Bastion + Magnum splash dice and both save DCs, **Tempered Edge's rider**.
- **R1 — sustain ONE = replace:** using Forge Construct with a live Construct **dismantles it and reforges** (never refused).
- **R2 —** Lay Foundation's stale authored event **removed** (the only pack-data change).
- **R3 — Bastion difficult terrain:** native `modifyMovementCost` is disposition-blind → ship it blind; the GM compensates allied movement by hand; a disposition-filtered cost function is **named backlog**. (The enter-DAMAGE check IS disposition-gated — allies pass free.)
- **R4 —** Foundations laid while Bastion holds come up **fortified**.
- **R5 — Bonds of Community:** ally/PC drops **count** (any non-summon creature); THP = **White mod**.
- **R6 —** Trade Routes gets the engine **Teleport button** (once/turn trusted), not manual drag.
- **R7 —** Magnum's splash **includes the primary target**; the ally clause = the Foundation begin-turn buff **upgrades +1→+2 for the scene** (`civFoundationBonus`).
- **R8 —** the Siege Form baked spec stays **byte-identical**; the talent now gates/pays/toggles it.

### Per-talent wiring (full detail = the Civilization section header in `register-skills.js`)
- **Lay Foundation** (Free, 1 Inv) — the 06-12 takeover KEPT; stale event removed; buff value now reads the caster's `civFoundationBonus` (Magnum upgrade).
- **Forge Construct** (1 Action, 1 Inv) — authored summon KEPT; preUseItem adds the R1 replace gate (`civ-dismantle` relay).
- **Tempered Edge** (passive) — applyDamage PRE-pass on Construct Slam: +[T][D red] energy (synced vs the summoner) + the hit bumped by the target's deflect (the Pinpoint ignore-deflect fact); Siege Cannon excluded.
- **Siege Form** (2 Actions, 1 Inv) — takeover: gates (live Construct, not sieged), pays, toggles the baked effect ON; card button ends it (Free, toggle OFF).
- **Arsenal** (2 Actions, 2 Inv) — preUseItem gate (live Construct, once/scene), native cost; use arms `arsenalActive` + the indicator AE (cadence trusted); Construct kills whisper the 15 ft move + free-Strike chase prompt (POST-pass).
- **Bastion** (2 Actions, 2 Inv) — takeover: gates (≥1 Foundation), pays; each Foundation gains a fortified Region: native walk×2 (blind, R3) + the NEW `edha-content.fortified` enter check (tokenEnter/tokenMoveIn, 1 s debounce, enemy-only): baked [T][D red] impact + Agility vs your Red → Slowed, expiry stamped at the CURRENT turn coord ("until the start of its next turn"). The Construct inside wears +2 all defenses (updateToken sweep).
- **Trade Routes** (1 Action, 1 Inv) — takeover: gates (≥2 Foundations), two validated clicks, `civ-link` stamps the pair "⇄"; the card's Teleport button moves the clicking ally between linked squares (owner-direct or `move-token` relay); once/turn trusted.
- **Bonds of Community** (Reaction) — the shared live→0 stamp + a Civilization consumer: a non-summon drop inside your Foundation → whispered Reaction prompt; Apply grants every standing ally in your Foundations THP = White mod + `advAttackNext`. One/round trusted.
- **Magnum Opus** (3 Actions, 3 Inv, once/scene) — takeover: gates, pays; Colossus = +2×[T][D white] HP (value + max override), +2 all-defenses AE, reach 10 card-noted; hits splash the talent's [T][D red] energy to each enemy within 10 ft of the target (target included) + Agility vs Red → Prone (`edhaFoeSkillVsColor`); Foundation buff upgrades +1→+2.

### New REUSABLE primitives
- **`edhaFoeSkillVsColor`** — the generalized Destruction Speed-vs-Red-Prone helper (owner rolls the color DC once, the ENGINE rolls each foe's skill, onFail per failure). `edhaSpeedVsRedProne` is now a thin wrapper. **Reach for this on any "each foe tests X vs your color" talent.**
- **`edha-content.fortified` Region behavior** — disposition-gated enter-damage + save (the enter-side sibling of Death's `turnEndDamage`). Any future "wall/trap zone" talent reuses it.

### Known limits / couldn't self-verify (no Foundry session)
The new Region behavior's event firing + the 1 s enter debounce; the `agi` skill id in the opposed roll; Magnum's `hea.max.override` write on the summon; dealer attribution (15 s memory) for the riders; the Bastion Slowed current-coord expiry feel; difficult terrain stays disposition-BLIND (R3 — GM compensates allies). **See the Civilization section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py civilization` (WARN-only, was FAIL/4 silent), `validate.js`, `node --check`.

---

## 2026-07-02 DELTA — DEATH (Morrath, deity) tree wired (the Harvested Remains economy; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Sixth deity tree with a delta (tenth wired overall). The spine is the **Harvested Remains** economy — `flags.edha-content.remains`, an ORDERED corpse-ref list on the owner (the Destruction Charge-list pattern: cap = tier, oldest fizzles past cap, spend pops the oldest, unset reads as the scene-start freebie) — fed by ONE GM-side **live→0 defeat watcher** (a `preUpdateActor` HP stamp → `updateActor`, the focus-watcher shape) that Reaper's Harvest and Necrotic Cascade both ride. Everything else composes existing machinery: the applyDamage wrapper pre/post-pass (Death Ward, Withering Touch), the affliction-tick shape (Consuming Decay), the enforced Green-Territory `modifyMovementCost` Region + the Spreading-Roots end-of-turn check (Bone Garden), the shared `edhaSummon` engine (Risen Servant — spec as Ben authored it), the burst-apply/set-flag/toggle-status relays, and the Chaos/Sovereignty preUseItem-takeover dispatch. **No side-engine, no new data handler or sidecar table.** New section in `register-skills.js` right after Sovereignty.

### Rulings (Ben, 07-02)
- **R0 — Attunement colors:** each talent ranges off its own die color — Black for Withering Touch / Consuming Decay / Death Ward / Necrotic Cascade, Green for Bone Garden / Risen Servant and Reaper's Harvest's corpse radius.
- **R1 — corpse marker:** wanted an icon → new `harvested` status (skull, **green `tint` on the CONFIG.statusEffects entry** — the literal dead-overlay SVG can't be recolored in place). Remains upgraded from a bare counter to a corpse-ref list so spending clears the right icon.
- **R2 — PC drops to 0 do NOT count** (applied tree-wide: no harvest, no cascade).
- **R3 — Withering Touch's "cannot regain HP" blocks HEALS only; Temp HP still lands** (a buffer, not "regaining HP").
- **R4 — Decay marker:** own `decaying` status id (green-tinted poison icon) rather than recoloring `afflicted` — one shared id would collide with real Black afflictions on the same target.
- **R5 — Bone Garden damages EVERYONE** ending a turn inside (allies + owner included).
- **R6/R7 — "seems like old wiring — redo as intended":** Death Ward's on-use-THP event and Necrotic Cascade's killer-only always-on `edha-on-defeat` event were **removed from `deity-death.json`** and rebuilt to the card text (ward = drop-to-1 + THP at the near-death moment, unwilling gated on Black vs Spiritual; cascade = 1-Inv armed-for-the-scene, ANY drop in range, not just your kills).
- **R8 — Risen Servant spec confirmed as authored** (Athletics-vs-Physical to-hit scaled by tier; Frightened/Compelled aren't native → sheet-noted manual; one-attack-per-turn cadence trusted).

### Per-talent wiring (full detail = the Death section header in `register-skills.js`)
- **Withering Touch** (1 Inv) — use arms `witherNext`; the next WEAPON hit (applyDamage post-pass = a real hit) auto-deals the talent's [T][D black]+Wil vital + a **fraction-0 heal-cut** (the widened Necrotic Grasp primitive) until the start of your next turn.
- **Reaper's Harvest** (passive) — qualifying drop in Green range → +1 Inv + the corpse joins the Remains list (harvested icon). Sense-through-obstruction is narrative.
- **Consuming Decay** (2 Inv) — takeover ENFORCES the gate (Weakened or <half HP, Black range, one instance per character); a GM-side `combatTurnChange` tick re-rolls [T][D black] vital at the target's turn starts and heals the owner half; the `decaying` icon is the handle (remove it = decay ends).
- **Bone Garden** (1 Inv + 1 Remain) — takeover, click-to-place range-checked; a 10 ft square Region with NATIVE walk×2 + a `turnEndDamage` flag; end-of-turn [T][D green] keen to anyone inside.
- **Death Ward** (2 Inv) — takeover: willing ally free / unwilling rolls Black and gates on `edhaReadDefense(spi)`; `flags.deathWard` + an applyDamage POST-pass restore: first lethal drop lands on 1 HP + [T][D black]+Pre THP, ward ends; the defeat watcher skips warded creatures.
- **Necrotic Cascade** (1 Inv) — use arms `cascadeArmed` for the scene; ANY qualifying drop in Black range → one [T][D black] spirit roll to each enemy within 10 ft of the body; `_edhaCascadeBusy` keeps nested kills from chaining (nested drops still harvest).
- **Risen Servant** (1 Inv + 1 Remain) — the authored `edha-summon` event STAYS; engine adds pre-cost gates (no Remain / sustain cap = tier) + spends the Remain on use.
- **Raise Dead** (4 Inv, once/scene) — takeover: target at 0 HP (died-within-the-hour owner-judged), optional Remain confirm, 1 HP via the burst-apply heal relay, Disoriented (expire target), initiative moved onto the caster's; the +1 injury is a GM card.
- **Speak with the Fallen** (2 Inv via activation) — Remain-or-touching prompt + the 3-questions card; the Q&A + repeat cost are table-run.

### New REUSABLE primitives
- **`tint` passthrough in `edhaRegisterStatuses`** — any future colored status is one `EDHA_STATUSES` row.
- **Fraction-0 heal-cut** — `edhaHealCutFactor`/`edhaApplyHealCut` now accept 0 = "cannot regain HP" (Necrotic Grasp's 0.5 unchanged). **Reach for this on any future full heal-block.**
- **The live→0 defeat watcher** (`preUpdateActor` HP stamp + crossing guard) — cleaner than the overlay hook for "when a creature drops" talents; Power/Knowledge death-triggers should ride it.
- **`turnEndDamage` Region flag + the `bone-garden` socket action** — any future "damage at end of turn in a zone" talent.

### Known limits / couldn't self-verify (no Foundry session)
The status **tint** rendering on token icons is the one untested Foundry surface (fallback = distinct icon files, one-row change); Death Ward's 0→1 restore runs post-pass (brief overlay flicker possible); Withering Touch fires on any WEAPON hit (melee owner-judged); Risen Servant still needs actor-create permission (GM casts for players — carried backlog). **See the Death section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py death` (WARN-only, was FAIL/6 silent), `validate.js`, `node --check`.

---

## 2026-07-01 DELTA — SOVEREIGNTY (Verdannis, deity) tree wired (damage-die-step lifecycle; ENGINE + prose-only data change → pack rebuild deferred + ⟳ Sync)

Fifth deity tree (ninth overall counting Life/Chaos/Fate, which shipped 06-17/06-18 without deltas — their record is their `register-skills.js` section headers). The spine is a **damage-die step** system — Exalted (+steps) / Diminished (−steps) creatures have their damage dice moved along the **d4→d6→d8→d10→d12 ladder** — built entirely on existing machinery: the `CosmereItem#rollDamage` wrapper (a second `overrideFormula` rewrite next to the damage-rider one), the Omen/Isolated status+flag marked pattern, the timed-status expiry convention, `set-flag`/`toggle-status` relays, `edhaGrantTempHpCross`, and the Chaos preUseItem-takeover dispatch. **No side-engine, no new data handler.** New section in `register-skills.js` right after Fate.

### Rulings (Ben, 07-01)
- **R1 — "die size" = the DAMAGE die.** Tests are always d20 in this system; the cards' "die size for all tests" meant damage dice (min d4 / max d12 = the [Tier][Die] ladder). **The 7 die-step cards were re-worded** ("damage die size") in `deity-sovereignty.json` + `domain.json` + the `talent-rolls.json` notes → **data change → `foundry-build deity` on the Foundry machine + ⟳ Sync** (cloud session can't rebuild packs).
- **R2 — colors:** Black rank ranges the debuff side; White rank ranges the buff side, ally-facing checks, and Sovereign's Favor's [Tier][Die].
- **R3 — Expose** rides Censure + Decree of Ruin (not Edict of the Fallen — it has its own THP rider). **R4 —** Inv recovery is **uncapped**. **R5 —** ally-hits-enemy is **auto-detected** (GM-side watcher, attack total ≥ Physical defense). **R6 —** step entries **stack**; the d4/d12 face clamp is the only rail.

### Per-talent wiring (all actives = preUseItem takeovers; tests ROLL Black and gate on `edhaReadDefense` — never trust-the-player)
- **Censure** (1 Inv) — Black vs Cognitive → −1 step (all damage) until the start of your next turn (= end-of-owner-next-turn, the engine convention).
- **Decree of Ruin** (2 Inv) — Black vs Cognitive → scene-long −1 on success, timed −1 on failure; once/creature/scene (`sovDecreeBy` stamp, refused pre-cost).
- **Edict of the Fallen** (2 Inv) — Black vs Spiritual → scene-long **−2 on ATTACK damage** + failed-attack THP rider (allies in White range gain THP = Tier); failure → timed −1 all.
- **Exalt** (1 Inv) — willing targeted ally → +1 step, timed. **Sovereign's Favor** rides it: THP = [Tier][Die on White] via `edhaGrantTempHpCross` (keeps-higher = "does not stack" for free; literal Exalt only, not Investiture).
- **Investiture of Authority** (2 Inv) — scene-long +1 **replacing your Exalt entry**; once/ally/scene (`sovInvestBy`).
- **Sovereign's Balance** (2 Inv) — target one ally + one enemy → ±1 timed; the hit watcher extends both **one round, once, cast round only**.
- **Sovereignty** (3 Inv, capstone) — ally +2 / enemy −2 for the scene, once/scene (`sovereigntyUsed`); each detected hit posts the no-reactions card (denial GM-enforced — reactions aren't tracked, the Voice-of-Authority precedent).
- **Expose** (passive) — failed attack tests by a Censure/Decree-Diminished foe auto-recover 1 Inv + post the Reactive Strike prompt when the attack's target is your in-range ally; non-attack/unreadable tests → an owner-click "it failed" card (Foundry tests carry no DC).

### New REUSABLE primitive
- **`flags.edha-content.dieStep`** entry list + `exalted`/`diminished` statuses + `edhaSovStepFormula` (bake → step ladder dice → `overrideFormula`). **Reach for this on any future "damage die up/down" talent** (other deity trees have die-ish effects). Sweep on `combatTurnChange`; scene state cleared on `deleteCombat`.

### Known limits / couldn't self-verify (no Foundry session)
Engine-side damage that bypasses `rollDamage` (burst/hazard/triggered bakes) doesn't step; hit/fail detection reads the synced target's **Physical** defense only; off-ladder dice (d3/d20/d100) are deliberately untouched; the regex rewrite vs graze/rider formulas needs a bench pass. **See the Sovereignty section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py sovereignty` (WARN-only, was FAIL/8 silent), `validate.js`, `node --check`.

---

## 2026-06-17 DELTA — DESTRUCTION (Razkael, deity) tree wired — first DEITY tree (Charge lifecycle + dangerous terrain; ENGINE-mostly + small data change → ⟳ Sync)

First deity tree. The spine is a bespoke **Charge** system, built entirely on the existing **Red / hazard** machinery — **no side-engine** (reuses `edhaApplyBurstResults`/socket for damage, the `edha-content.hazard` Region + `edhaHazardVisual` for terrain, `edhaRollOpposedSkill` for the opposed Speed test, the Reserve-style owner flag for state). New section in `register-skills.js` right after the burst intercept.

### Rulings (Ben, 06-16)
- **Charge model:** Set Charge drops a click-to-placed marker template, tracked in `flags.edha-content.charges` (cap = tier; oldest fizzles past cap). Detonation resolves burst damage + drops terrain at each marker's REAL position via the card's **Detonate / Detonate-All** buttons (Free) or via **Cascading Failure / The Unmooring** (their Inv cost + bonuses).
- **Triggers** ("when target moves / takes damage / enters square") are **declared text fired by the Detonate action** — no auto-hook (CONTEST-EXEMPT: Set Charge).
- **Concussive Yield** is engine-rolled per foe (not a reminder card): Speed vs the owner's Red DC → core **Prone** on a fail. Same helper backs **Fault Line**'s inline knockdown.
- **Zone "merge"** (Cascading / Unmooring) = damage-bump + GM-merge note (no polygon union).

### Per-talent wiring
- **Set Charge** — preUseItem takeover (cancel default, pay 1 Inv, refund on cancel): click-to-place a marker, store the Charge, post the Detonate card.
- **Pinpoint Charge** (Free, 1 Inv) — flags the latest Charge ⊕; on detonation adds its [Tier][Die]+Int **keen** to the primary and **ignores that target's deflect** (hit bumped by `system.deflect.value`).
- **Cascading Failure** (2 Inv) — detonate all Charges; a foe caught in 2+ blasts takes an extra [Tier][Die]; merge bump when ≥2.
- **The Unmooring** (3 Inv, once/scene) — detonate all at 15 ft, +Int, **ignores deflect**, merge-bump all zones.
- **Concussive Yield** (passive) — rides every Charge detonation (Speed-vs-Red → Prone).
- **Fault Line** (2 Inv) — preUseItem takeover: a 60×5 ft **line** (rotated-rectangle hazard, replaces the pilot's radius approximation), [Tier][Die]+Str energy, Speed-vs-Red → Prone, **×3 vs Constructs** (`customType === "Construct"`).
- **Combustion Chain** (Reaction) — **auto-fires** off the defeat HP-sync (`updateActor`, hp ≤ 0): a foe that drops in your terrain ignites a fresh 10 ft zone on the body + offers the 5 ft spread.
- **Walking Ruin** — +10 ft Speed stays a transfer AE; "every space you move through becomes dangerous terrain" now drops a patch off `updateToken` while the talent is toggled on (scene-scoped).
- **Pyre** — unchanged (keeps its `edha-place-hazard` event); the turn-end "flammable spread" is backlog.

### Hooks/tools still to build (NOT silently dropped — see the section header in register-skills.js)
- Pinpoint "terrain moves with the target" — per-Region follow on `updateToken` (template: the Walking-Ruin move hook).
- Pyre "spreads to one flammable square each turn" — a `combatTurnChange` Region-grow (mirror Spreading Roots).
- Fault Line "triple damage to structures" — needs object/structure damage targets (Constructs already wired).

### Deploy
Set Charge + Fault Line lost their authored `events` (now name-based) → **data change → `foundry-build deity` + ⟳ Sync.** The rest is engine-only. `node --check` clean; `node scripts/validate.js` passes (`validate-packs.js` needs the Foundry LevelDB — deferred to the machine).

### LIVE-VERIFY (no Foundry session this pass): see the **Destruction** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify: the rectangle-Region rotation/anchor for Fault Line, the marker/Detonate round-trip + cap=tier fizzle, Concussive/Fault-Line prone math, the deflect-bump, Construct ×3 detection, the Combustion auto-fire condition, Walking Ruin per-move terrain volume.

## 2026-06-16c DELTA — GREEN / INSTINCT specialty wired → GREEN TREE COMPLETE (mostly name-based engine + a small pack rebuild → ⟳ Sync)

Green tree-by-tree finishes: **Instinct (8)** — the pack-tactics tree (advantage-granting, focus-fire, forced movement, a strike window). The COMPUTED talents (Pack Hunter, Scent the Weak, Coordinated Hunt, Pack Pressure) are **name-based** engine (live adjacency / lowest-HP / focus-fire / windowed bonuses have no data-rule representation — precedent: White Coordination + Black Subjugation). But **behavior that CAN live on the talent now does**: **Drive the Prey → Slowed** is a data-side `edha-triggered-effect` (event `use`, kind `status`, target `prompt` — a direct mirror of Sovereign of Solitude, editable in Foundry), and the three genuinely-manual talents (Predator's Instinct / Packmate's Warning / Natural Order) carry **toggled indicator AEs** (Flamestance convention) so they show + are editable on the sheet. So this pass DID touch data → `foundry-build leyline` + ⟳ Sync. **The whole Green tree (Territory + Restoration + Instinct) is now wired.**

### System facts (verified)
- **`slowed` is a native cosmere condition** (Drive the Prey applies it via the Territory `edhaApplyConditionToTarget` helper).
- The **applyDamage PRE-pass** already injects bonus instances (Vital Diagnosis pattern) — so Coordinated Hunt / Pack Pressure push their bonus into the SAME apply call (no second applyDamage → no recursion).

### New REUSABLE primitive
- **`advAttackNext`** flag + `edhaGrantAdvAttack(actor, source)` / pre-`{attack,item}`-roll inject + consume — "advantage on your next attack," the attack-roll mirror of `advTest`. Cross-actor grants relay via `set-flag`. **Reach for this on any "gain advantage on your next attack" talent.**
- **Focus-fire tracker** (`_edhaFocusFire`, GM-side `attack/itemRoll` watcher via the Territory `edhaTargetsOfRoller`) — records who attacked whom this round; reset on round change.

### Per-talent wiring
- **Pack Hunter** (active) — on use → you + each ally **adjacent to the targeted enemy** gain advantage on their next attack.
- **Scent the Weak** (active) — on use → names the **lowest-HP creature in Attunement Range** + grants you advantage on your next attack (once/round).
- **Drive the Prey** (active) — **data-side** `edha-triggered-effect` (event `use`, kind `status`, `slowed`, target `prompt`): on use the target is Slowed (owner-judged Green vs Survival; forced move + ally Reactive Strikes GM-narrated). Editable in Foundry.
- **Coordinated Hunt** (passive) — your hit on a victim that you + ≥1 ally attacked this round → **+min(#attackers, Green rank)** bonus damage (pre-pass).
- **Pack Pressure** (active) — on use → opens a **strike window** until the start of your next turn; your strikes deal **+[Tier][Die]** (pre-pass); the no-provoke move is GM-narrated.
- **Predator's Instinct / Packmate's Warning / Natural Order** — **manual** (no track/fear, unseen-attack, or scene-debuff hooks) → each carries a **toggled indicator AE** (sheet presence) + posts a reminder on use.

### Known limits
Coordinated Hunt + Pack Pressure auto-apply to the **owner's** strikes only (ally strikes GM-narrated); Pack Pressure's "+vs an adjacent-flanked target" is applied to all owner strikes in the window (slight over-application). Focus-fire + Pack Hunter ally-detection rely on synced `user.targets` / token adjacency on the GM client (same caveat as Pack Sense).

### LIVE-VERIFY (relaunch + **⟳ Sync** — the pack was rebuilt for Drive the Prey's status rule + the indicator AEs): see the Green / Instinct section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session): the advAttack dialog seeding, the focus-fire count at the table, the Pack Pressure window expiry, Drive the Prey's data-side Slowed firing on use.

---

## 2026-06-16b DELTA — GREEN / RESTORATION specialty wired (engine + a Hardy pack rebuild → ⟳ Sync)

Green tree-by-tree continues: **Restoration (8).** The tree's signature is **healing**, and its spine is a **"green-heal" trigger family** — three talents that fire "when you restore health with a Green talent."

### System facts (verified)
- The **`applyDamage` wrapper is the heal chokepoint** (heal instances pass through it; it already tracks `prevHp`/`healAmt`/dealing item for overflow-THP & heal-cut). Verdant Mend's clickable heal + any heal instance land here. **Mender's Instinct** heals via the trigger path (direct `hea.value` update), so it gets a second integration point.
- **`stunned` is a native condition** (joins afflicted/disoriented/weakened) → Natural Recovery's cleanse set is all real.
- **Injuries are first-class `injury` Items** with `system.type` ∈ {flesh_wound, shallow_injury, vicious_injury, permanent_injury, death} → Reknit Form can ENFORCE removal (delete the item), 2 Inv temporary / 3 Inv permanent.

### Rulings (Ben, 06-16b — carried from the Territory pass)
Auto where possible; resource-spend talents stay opt-in cards; enforce the rules text. Reknit Form → enforce (delete the injury Item) rather than leave manual.

### New REUSABLE engine
- **`edhaGreenHealRiders(healer, target, amount, prevHp)`** — the on-green-heal dispatcher, called from BOTH heal chokepoints (applyDamage post-pass when `edhaTalentColor(dealer.item)==="green"`, and the `edha-triggered-effect` heal branch when the firing talent is green). **Reach for this for any "when you heal" rider.**
- **`edhaGrantTempHpCross` / `edhaDeleteItemCross`** — cross-actor THP grant (reuses the `set-flag` relay; keeps the higher THP, no stacking) + injury-item delete (new `delete-item` socket action). Both do-if-owner-else-relay.

### Per-talent wiring
- **Verdant Mend** — already a clickable [Tier][Die]+Green-mod heal; now the primary green-heal **trigger source**.
- **Mender's Instinct** — already `edha-hp-threshold`; now also fires the green-heal riders.
- **Collected** — already a +2 Cog/Spi AE (passive). Unchanged.
- **Hardy** — **data-side AE** `system.resources.hea.max.bonus += @level` (clone of Black/White; `_id` HardyMaxHPGreen1 — closes the 06-13b carry-over). Pack-rebuilt + inspect-verified.
- **Resurgent Growth** — heal an **ally** → queue regrowth; at the **start of your next turn** (`combatTurnChange` + `combat.combatant`), heal them **tier + Green mod** if still in Attunement Range (then clear).
- **Vital Surge** — green-heal to a target that **was below half HP** → whispered card → spend 1 Inv → THP = **½[Tier][Die]**.
- **Natural Recovery** — green-heal → whispered card listing the target's removable conditions (Afflicted/Disoriented/Stunned/Weakened) → click → cleanse one (Opportunity trusted).
- **Reknit Form** — on use → whispered card listing the target's **injury Items** → click → delete it + spend **2 Inv** (temporary) / **3 Inv** (permanent).

### Deploy
- **Engine:** `module-src-sync.js push`. **Pack rebuild:** `foundry-build.js leyline` (Hardy AE) — Foundry CLOSED; `validate-packs.js` **PASSED ✓** (leyline effects 8→9). **To load:** relaunch + **⟳ Sync Talents** (Hardy changed the pack).

### Known limits / couldn't self-verify (no Foundry session)
Heals that bypass `applyDamage` AND the trigger path won't fire riders (the Restoration heals don't); Verdant Mend's heal carrying `dealer.item` (overflow-THP relies on the same, so it should — `_edhaLastDealer` is the fallback); the `set-flag` THP relay + `delete-item` injury relay for cross-actor targets; Resurgent Growth resolving on the owner's turn start + the range re-check; Hardy current-HP top-up is manual. **See the Green / Restoration section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-16 DELTA — GREEN / TERRITORY specialty wired (engine-mostly + small pack rebuild for Apex Predator / Thorn Field / Sudden Growth)

Green tree-by-tree begins with **Territory (8)**. The tree's spine is **"your difficult terrain,"** which until now had **no mechanical effect** (Green Draw Mana only drew a cosmetic circle; the only "terrain" Region type was the damage-only `edha-content.hazard`). This pass makes difficult terrain a **real, enforced, owner-tagged Region** and builds the membership engine the rest of the tree reads.

### System facts (verified)
- **Foundry v13 ships a native `modifyMovementCost` RegionBehavior** (`client/data/region-behaviors/increase-movement-cost.mjs`): `system.difficulties.{walk,…}` = per-action cost multiplier (1 normal … 5; **2 = difficult terrain**, engine-enforced on the token movement pathing). This is THE difficult-terrain primitive.
- **`restrained` and `immobilized` are native cosmere conditions** (system `index.js`) → toggle the icon; immobilized already rides the `EDHA_TIMED_STATUSES` auto-expiry.
- Region docs are **GM-write-only** → player paths (Green Draw Mana, Spreading Roots click) relay to the GM via new socket actions.

### Rulings (Ben, 06-16)
A = difficult terrain must have a **real Region effect on the map** AND a **player-visible indicator** (model it like the other enforced-movement mechanics, not GM narration). B = **Thorn Field rides on terrain created by players that have Thorn Field** (true passive, not a self-cast). C = **auto whenever possible.** D = conditions apply **automatically on success.** E = enforce the descriptive rules text, rewrite data as needed.

### New REUSABLE engine
- **`edhaCreateGreenTerrain(owner, scene, x, y, sizeFt)`** (GM-side) — the single green-terrain factory: one Region with native `modifyMovementCost` (walk ×2) + `flags.edha-content.terrain = {ownerUuid, color:"green"}` + a paired player-visible **Drawing** (green 🌿, via the existing `edhaHazardVisual`). If the owner has **Thorn Field**, it ALSO bakes an `edha-content.hazard` behavior (`floor([Tier][Die]/2)` keen on enter / turn-start). `edhaDropGreenTerrain` is the player→GM relay (`green-terrain` socket action). The burst-terrain path (`edhaApplyBurstResults`) now routes `color:"green"` here; red/other dangerous terrain stays the damage Region but is now **owner-tagged** too.
- **Membership helpers** — `edhaOwnedTerrainRegions(owner)` / `edhaPointInRegion` / `edhaTokenInOwnedTerrain(tok, owner)` / `edhaEnemiesInOwnedTerrain(owner)` (circle-distance tests). **`edhaGreenMod(actor)`** = native `@skills.green.mod`. **Reach for these on any "in your terrain" effect.**
- **`grow-terrain`** socket action + `edhaGrowTerrain` — expand a Region's circle radius (and its paired drawing) GM-side.

### Per-talent wiring
- **Green Leyline Attunement (Key)** — Draw Mana now drops a **real** enforced difficult-terrain Region (was a cosmetic circle).
- **Grasping Vines** — on use (name-based) → auto-apply native **Restrained** to your target (maintain = chat reminder; Foundry has no upkeep hook).
- **Territorial Instinct** — on use (Reaction) → auto-apply native **Immobilized** (timed, auto-expires) to your target. No Disengage hook → the opposed Green-vs-Survival test is owner-rolled; using the talent = applying on success.
- **Thorn Field** — **reworked to a true passive** (talent now `events:{}`/no damage): the keen hazard is baked onto terrain by `edhaCreateGreenTerrain` whenever a Thorn-Field owner creates it.
- **Spreading Roots** — `combatTurnChange`: the creature whose turn just ended, if standing in your terrain → whispered card → spend 1 Inv → **expand the Region** [Size] (once/owner/round).
- **Pack Sense** — `attackRoll`/`itemRoll` watcher (GM-gated): an **ally** attacks a target standing in your terrain → whispered card → spend 1 Inv → **+Green mod** to their result (target read from synced user targets).
- **Sudden Growth** — data-side `edha-burst {terrain, color:green, affects:none}` event → click-to-place a [Size] difficult-terrain Region (routes through the green factory).
- **Apex Predator** — **data-fix** (authored block was a stray Red attack — `skill:red` + red vital damage; cleared to a passive) + engine pre-roll: while **≥3 enemies stand in your terrain**, advantage on your **Physical (str/spd)** tests (won't stomp an active disadvantage).
- **Primal Awareness** — left manual (no Surprise/outdoors/track hooks to enforce).

### Deploy
- **Engine:** `module-src-sync.js push` → live module. **Pack rebuild:** `foundry-build.js leyline` (Apex Predator data-fix + Sudden Growth event + Thorn Field event-removal) — Foundry was CLOSED; `validate-packs.js` **PASSED ✓** (leyline events 21/19, effects 8/8, 0 bad). Baseline re-armed by the build.
- **To load:** full **relaunch** (engine changed) + **⟳ Sync Talents** (leyline pack rebuilt).

### Known limits / couldn't self-verify (no Foundry session)
Native `modifyMovementCost` actually doubling movement at the table; Drawing visibility to players; `region.shapes` circle membership math; Pack Sense target-detection via `user.targets` cross-client; Spreading Roots `combat.previous.turn` token resolution; Apex Predator advantage seeding through the dialog; immobilized "this turn" lands one turn long under the next-turn expiry convention. **See the Green / Territory section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-15 DELTA — CONTESTED-ROLL RESOLUTION: kill the "soft laziness" (ENGINE-ONLY; F5/relaunch — NO rebuild)

Ben's directive: wherever a contest CAN be computed, the engine must resolve it — no more "compare your Blue test yourself / GM adjudicates" reminder cards. New reusable contest core + per-talent rewires, all engine-only via `module-src-sync.js push`.

### New REUSABLE tool — contest core (`register-skills.js`, right after `edhaKeptD20Nat`)
- **`edhaQueueContest(owner, color, onResolve)`** — a talent's `useItem` queues a contest (capturing `game.user.targets` at use time); a roll-watcher (`edhaContestWatch` on skill/attack/itemRoll) captures the talent's **own d20 test**; `edhaTryResolveContest` ties them and runs `onResolve({ total, nat })`. **Order-independent**: matches whether `useItem` fires before or after the roll, and tolerates a slow roll **dialog** (roll-after window = `EDHA_CONTEST_TTL` 120 s; roll-before window = `EDHA_CONTEST_BACK` 8 s). Cancelling the roll dialog = no roll = no apply.
- **`edhaReadDefense(actor, key)`** — `system.defenses.<cog|spi|phy>.value`. **`edhaRollOpposedSkill(target, skillId, attrId?)`** — auto-rolls a target's own skill (rank + linked attr; `ath`→`str`) for opposed contests. **`edhaPromptDC(title, hint)`** — DialogV2 (Dialog fallback) number prompt for tests with no static DC; returns a number, or `undefined` = "judge it". **`edhaRewriteOrRelay(actor, oldTotal, newTotal, note)`** — rewrites an already-rendered roll card's total (GM-direct, or a new **`rewrite-roll`** socket relay to the GM), falling back to a reported number.

### Per-talent (was → now)
- **False Premise / Counterspell / Read Intent / Ghostly Walls** (Blue, `skill_test`) — auto-compare **Blue vs the target's Cognitive defense**; on ≥ they auto-apply (disadvantage / "talent fails" / GM-reveal prompt / Immobilize + Absolute-Stillness Weakened) and post the verdict; on a miss, "no effect". No target/defense → the old manual card as a fallback.
- **Redirect Momentum** (Blue, opposed) — auto-rolls the **mover's Athletics** (rank + Str) vs your Blue total; posts the decided outcome (reduce/push [Size]; GM positions the token).
- **Counterpoint** (White, `skill_test`) — queues the White test, **prompts for the DC** (the enemy's influence result); on ≥ auto-spends 1 Inv + negates + Disorients. Split off Overwhelming Authority (a flat no-test apply).
- **Shared Conviction / Concordant Presence** (no static DC) — the reaction/grant card click now **prompts for the DC** and resolves: Shared Conviction reports whether the +White-mod boost turns the failure into a success; Concordant grants the Plot Die only if the first ally met the DC. "No DC — judge it" falls back to the old behavior.
- **Voice of Authority / Bound by Word** — now **rewrite the original roll card** to the disadvantaged / swapped total (GM-direct or relayed), instead of "GM applies the lower/higher".

### Notes for Ben
- **DC prompts** appear on the GM's client when resolving Counterpoint / Shared Conviction / Concordant — enter the difficulty (or "No DC — judge it"). This is the agreed cost of Foundry tests carrying no built-in DC.
- **Roll-card rewrite** is best-effort: it works directly when you're the GM (the single-test-actor pass), relays to the GM otherwise, and degrades to a posted number if the original message can't be found.
- Untouched (genuinely no roll to capture): Pattern Recognition / Probability Cascade / Anticipate / Intercept / Subtle Suggestion stay flag-appliers (they cost Inv, they don't roll a contest).

### LIVE-VERIFY: the updated contest items across the White (Coordination/Accord) + Blue (Calculation/Illusion/Foresight) sections of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — engine-only, NO ⟳ Sync / rebuild.** `node --check` clean + validators pass; in-Foundry verification is Ben's single-pass test-actor run this evening.

---

## 2026-06-14f DELTA — BLUE / FORESIGHT specialty wired → BLUE TREE COMPLETE (ENGINE-ONLY off `useItem`; NO rebuild)

Blue tree-by-tree finishes: **Foresight (8) done → the BLUE tree is fully wired (Calculation + Foresight + Illusion).** A prediction/initiative tree, so most of it is genuinely MANUAL (hidden declarations, fast/slow-turn choices, telepathy — no Foundry hooks). The automatable half **REUSES** the Calculation `nextTestMod` flag + the reminder-card pattern — **no new primitives, no data change, no pack rebuild.** Per-talent specs were proposed to Ben and signed off first.

### Per-talent
- **Intercept** (Reaction, 1 Inv) → on use → card → **disadvantage on the designated creature's next test** (`nextTestMod` disadvantage, count 1; "designated via Forewarned" owner-judged). Cost paid by the activation.
- **Reactive Analysis** (Special, 1 Inv) → on use → **advantage on YOUR next test** (`nextTestMod` advantage on self; "against them" owner-judged).
- **Read Intent** (1 Action, 1 Inv, `skill_test`) → rolls Blue + pays cost natively → reminder card (Blue vs the target's **Cognitive defense**; on a success the **GM reveals the creature's intended action**).
- **Collected** (passive) → **already done** (data-side `+2 Cog / +2 Spi` defenses AE; ⟳ Sync a stale owned copy).
- **Forewarned / Telepathic Network / Probable Outcome** → **MANUAL** (hidden "declare a character + action" + untracked "gain 1 Reaction"; scene-long telepathy + "share expertise"; changing your fast/slow choice — none have hooks).
- **Calculated Patience** (passive) → ~~MANUAL + a console toggle~~ **SUPERSEDED 2026-07-24y**: it is an `edha-test-rider` on its own document (`whenSlowTurn` + `firstTestThisTurn` + `mode: advantage`) and fires by itself. **`edha.calculatedPatience()` is deleted.** The manual exit was justified by "there's no fast/slow-turn hook", which was never true — the pre-roll rider already read turnSpeed for `whenFastTurn`.

### Notes for Ben
- **Telepathic Network** is left as a narrative use-note (per your "default"); **Anticipate** (Calculation) still approximates "your Telepathic Network" as in-range Blue allies rather than a tracked membership — flag me if you want a literal network roster later.
- No GM-online dependency here (everything fires off the owner's own `useItem` / the API).

### LIVE-VERIFY: the **Blue / Foresight** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (Collected's AE is already in the pack from the White rebuild; nothing else is data-side). Couldn't self-verify (no Foundry session): the `nextTestMod` advantage/disadvantage application, the `edha.calculatedPatience` toggle, the Read Intent Cog-defense readout.

---

## 2026-06-14d DELTA — BLUE / CALCULATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Blue tree-by-tree begins: **Calculation (8) done.** The tree's signature is **cognitive control** — imposing or granting (dis)advantage on a creature's **next test**, plus Disorient. Every talent's cost is consumed by its own activation, and each one fires off `cosmere-rpg.useItem` **on the owner's own client** (where they hold their target) → so there's **NO GM-gating** (no "GM must be online" limit like the watcher-based trees) and **NO pack rebuild** (talents stay `events:{}`; deployed via `module-src-sync.js push`, F5/relaunch only). One new reusable primitive; the rest is reuse.

### New REUSABLE tool
- **Counted next-test (dis)advantage flag** — `flags.edha-content.nextTestMod = { mode:"advantage"|"disadvantage", count, skill:<id>|null, source }`. `edhaNextTest{PreRoll,Consume}` mirror the Black `advTest` / `cogDisadv` flags: pre-roll sets `roll.options.advantageMode` + `configureModifiers()` (and wraps `configureDialog`), the post-roll hook **decrements `count`** and clears at 0. `skill:null` = ANY test (skill/attack/item); a non-null skill gates to that skill id. `edhaSetNextTestMod(target, mod)` writes locally or relays via the existing **`set-flag`** action (so a player can debuff a GM-owned enemy). **Reach for this for any "give X (dis)advantage on its next N tests" talent.**
- **`edhaPostCalcTestCard` / `edhaCalcTestClick`** — a whispered card that applies the flag to a chosen creature (button-per-candidate, or a "target then click" fallback). `edhaPostCounterspellCard` — a reminder card showing the target's Cognitive defense (`system.defenses.cog.value`).

### Per-talent wiring (all on `useItem`)
- **Subtle Suggestion** — REUSES the Accord **disorient card** (`edhaPostDisorientCard`): on use, target → Disoriented with owner-relative expiry.
- **Pattern Recognition** — on use (pays 1 Inv), card → disadvantage on the target's **next test** (`nextTestMod` count 1).
- **Probability Cascade** — on use (Opportunity + 1 Inv; Opportunity is GM-trusted), card → disadvantage on the target's **next two tests** (count 2).
- **False Premise** (`skill_test`) — on use it **rolls Blue** + pays 1 Inv; the card shows the target's Cog defense and, on a judged success, applies disadvantage to their next test.
- **Anticipate** — on use (1 Inv), card lists **you + in-range (Blue) allies** → **advantage** on the chosen character's next test ("resistance test").
- **Counterspell** (`skill_test`) — on use it **rolls Blue** + pays 2 Foc + 1 Inv; a reminder card shows the activating creature's Cog defense (on a success the activated talent fails — GM-narrated).
- **Composed** — already done (data-side `+@tier` max-focus AE; the Blue copy already carries it, baked into the leyline pack by the White Bulwark rebuild).
- **Baleful** — **manual** (passive: "resist your influence costs +tier focus" — no Foundry hook for resisting influence).

### System facts used
- `cosmere-rpg.useItem` fires for **`skill_test`** activations too (confirmed in the 06-14c Accord pass), so Counterspell / False Premise post their cards on use AND roll Blue + pay cost natively — the engine only adds the apply/reminder step.
- The standing rulings cover the rest: "influence / success / objective" are owner-judged via a card button (Foundry tests have no DC); Disoriented auto-expires via the timed-status pass.

### Known limits / notes for Ben
- **`nextTestMod` with `skill:null` consumes the literal NEXT test** of any kind the target rolls (it can't tell which test was "meant"); like the Black `advTest`, it has **no round-expiry** (Pattern Recognition's "this round" qualifier isn't enforced — the flag persists until a test consumes it).
- **Subtle Suggestion text says "until the START of your next turn"** but the engine reuses the established Disoriented expiry = **END of your next turn** (the timed-status pass is turn-granular and can't express "start"); a one-turn over-extension. NOT changed — flagged per the no-balance-pass rule.
- A creature could in principle hold both a legacy `advTest`/`cogDisadv` flag and `nextTestMod`; whichever hook runs last wins the `advantageMode` write (negligible overlap — different trees/dispositions).

### LIVE-VERIFY (F5/relaunch — no Sync; nothing on the talents changed): see the **Blue / Calculation** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): `useItem` firing for the skill_test talents, the `nextTestMod` pre/consume + countdown across roll types, the `set-flag` relay onto a GM-owned enemy, the Disorient expiry window.

---

## 2026-06-14e DELTA — BLUE / ILLUSION specialty wired (ENGINE-ONLY off `useItem`; real summoned tokens via `edhaSummon`; NO pack rebuild)

Blue tree-by-tree continues: **Illusion (8) done.** A mostly **narrative** tree; the automatable half spawns **REAL friendly tokens** through the shared `edhaSummon` engine. **Per-talent specs + rulings were proposed to Ben and signed off BEFORE coding** (the first attempt was reverted for shipping without sign-off — see the PROCESS note up top). Engine-only/name-based off `cosmere-rpg.useItem`; **no data/authored change, no pack rebuild.**

### `edhaSummon` extended (reusable)
- **`spec.tokenSizeFt`** → sets the summon's prototype-token width/height (grid squares = `round(sizeFt / scene grid distance)`). Used by Holographic Illusion ([Size]-footprint token).
- **`spec.extraFlags`** → merged into the summon's `flags.edha-content` (Phantom Double sets `phantomDouble:true`).
- `defensePenalty: 99` is the idiom for **"no defenses"** (`max(0, casterDef − 99) = 0`).

### Per-talent (all on `useItem`)
- **Phantom Barricade** (1 Action, 1 Inv) → `edhaSummon` a friendly object: **HP `2d(2·@skills.blue.rank+2)`** (= 2[Die]), **speed 0, no attack, no defenses**, sustain-multiple. Cover + movement-block = the token's physical presence (GM positions); lasts until HP 0 / scene end.
- **Phantom Double** (2 Actions, 2 Inv) → drops the caster's existing illusion (**max 1**, `edhaClearPhantomDoubles`) then `edhaSummon` a copy of **you or the targeted ally** — token art via `edhaTokenArt(dup)`, **HP 1**, speed 0, no defenses, flagged `phantomDouble`. **Any hit drops it to 0 → the updateActor HP-watch deletes the illusion** ("attacks pass through harmlessly, ending it"). The Perception-vs-Blue-defense test + the "advantage vs those who failed" are **MANUAL/GM** (per a use-note), per Ben.
- **Holographic Illusion** (Free, 1 Inv) → `edhaSummon` a no-stats token (HP 1, speed 0, no attack) **sized to [Size]** via `tokenSizeFt`. Static; GM moves/edits it.
- **Living Image** (Special) → a use-note marking illusions mobile/interactive; the **1 Inv/round upkeep is GM-tracked** (narrative).
- **Ghostly Walls** (1 Action, 2 Inv, `skill_test`) → rolls Blue + pays cost natively; card → on a judged success, **Immobilize** the target (movement 0) until the **end of YOUR next turn** (owner-relative via `edhaApplyTimedStatus(expire:"owner")` — unlike Sovereign of Solitude's target-relative immobilize).
- **Absolute Stillness** (passive) → rider on Ghostly Walls: if owned, the target ALSO becomes **Weakened** (= "disadvantage on Physical tests"). "Cannot take Reactions" stays GM-tracked.
- **Redirect Momentum** (Reaction, 1 Inv, `skill_test`) → rolls Blue + pays cost natively; **reminder card** (Blue vs the mover's Athletics; reduce remaining move by **[Size]** or push **[Size] ft** — GM applies; Foundry has no "remaining movement").
- **Phantom Step** (passive, type `none`) → no `useItem` fires → **manual** (an ally may move +[Size] ft without provoking Reactions).

### Known limits / notes for Ben
- Summons need **ACTOR_CREATE** perm (GM, or a player the GM has granted it) — same as every other summon.
- `edhaSummon` drops the token **next to the caster** (no click-to-place), so the GM repositions the barricade/double/illusion. Movement reduction / push / cover / illusion fiction are GM-narrated.
- Phantom Double copies the chosen creature's **token art + name**, not its stats — it's a 1-HP prop; the "treat as real" + conditional advantage are GM-run.

### LIVE-VERIFY: the **Blue / Illusion** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (nothing on the talents changed). Couldn't self-verify (no Foundry session): the summon HP/size/art, the Phantom-Double delete-on-hit, the Ghostly Walls owner-relative immobilize + Absolute Stillness Weakened rider.

---

## 2026-06-14c DELTA — WHITE / ACCORD specialty wired (engine-only EXCEPT Unyielding Accord drag-AE = pack rebuild) → WHITE TREE COMPLETE

White tree-by-tree finishes: **Accord (8) done → the WHITE tree is fully wired (Coordination + Bulwark + Accord).** Accord is the most narrative tree — "influence", verbal accords, and "objective tests" have no Foundry events — so it leans on owner-judged cards + native conditions.

### System facts (verified)
- **`determined` and `disoriented` are native cosmere conditions** (`condition:true`, real icons — index.js ~L348/356) → toggle the icon with `toggleStatusEffect`; the mechanical rules are GM-applied (same as the §8b adversary Slowed/Afflicted templates).
- **`cosmere-rpg.useItem` fires for EVERY activation type** incl. `skill_test` (the hook is pushed to `postRoll` unconditionally — index.js ~L7206), so Counterpoint (skill_test) is caught by the use-hook.

### Rulings (Ben, 06-14c)
A = **build owner-relative auto-expiry** for Disoriented (ends at the end of the OWNER's next turn); B = Bound-by-Word **card**; C = Unyielding Accord **manual** (ships a drag-AE); D = Counterpoint/Overwhelming **cards** apply Disoriented; E = Voice of Authority is a **card** (reactions aren't tracked in combat) that re-rolls the enemy attack as disadvantage.

### Per-talent
- **Collective Resolve** — on use → toggle **Determined** on in-range allies.
- **Counterpoint / Overwhelming Authority** — on use → whispered card → apply **Disoriented** to the target (owner-judged success), with **owner-relative expiry**.
- **Voice of Authority** — `attackRoll`/`itemRoll` watcher: an enemy in range makes a hostile action → whispered card → spend 1 Inv → **re-roll the attack as disadvantage** (roll a 2nd d20, keep the lower, report `origTotal − origNat + keptNat`; GM applies the lower). Once/round/owner.
- **Terms of Accord** — on use → card to forge an accord with an in-range character; stores the owner's **White modifier** (rank + WIL) + whether the owner has Bound by Word, in `flags.edha-content.accord` on the partner (cross-actor via `set-flag` relay). The +1 to objective tests is GM-narrated.
- **Bound by Word** — `skillRoll` watcher on an accord partner with `accord.boundByWord` → whispered card → adopt the accord-maker's White modifier (`d20Nat + ownerWhiteMod`) in place of their own (owner-judged "objective test"; once/round/skill).
- **Disciplined Mind** — manual (no "resist influence" event).
- **Unyielding Accord** — data-side **transfer:false drag-template AE** `+1 Cog/Spi` (drag onto in-range allies adjacent to another ally; remove when they don't qualify). Pack-rebuilt + inspect-verified.

### New engine bits (reusable)
- **`edhaApplyTimedStatus(target, statusId, {owner, expire})`** + relay action **`apply-timed-status`** — toggle a status AND stamp an **owner-relative** `expireAfter` on its effect (the timed-status expiry pass already deletes any effect with `expireAfter`, so no need to add it to `EDHA_TIMED_STATUSES`). Reuse for any "status until the end of YOUR next turn."
- **`edhaWhiteMod(actor)`** = `@skills.white.rank + @attr.wil`.
- Accord cards (disorient / forge / voice-reroll / bound) — all `data-*` payloads, whispered, GM-gated watchers.

### LIVE-VERIFY: the Accord section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (the leyline pack was rebuilt for the Unyielding Accord AE). Couldn't self-verify: Disoriented owner-relative expiry timing, the Voice re-roll math at the table, the `apply-timed-status` relay, accord-flag persistence + the Bound-by-Word swap.

---

## 2026-06-14b DELTA — WHITE / BULWARK specialty wired (engine-only EXCEPT Hardy = pack rebuild + ⟳ Sync)

White tree-by-tree continues: **Bulwark (8) done.** A damage-mitigation / redirection / retaliation tree built almost entirely on the **`applyDamage` wrapper** (`edhaWrapApplyDamage`) — the same pre-pass/post-pass engine as Severance, heal-cut, and Mender's Instinct. NAME-BASED (talents stay `events:{}`) EXCEPT **Hardy**, which is a data-side ActiveEffect (so this pass DID rebuild the leyline pack — relaunch + **⟳ Sync**).

### Model (Ben's rulings, all defaults)
- **A — optional reactions use the Mender's-Instinct model:** the system applies damage synchronously, so an optional (player-choice + cost) reaction can't pre-empt it. Interposing Shield / Shared Burden / Unbreakable Line therefore post a **whispered post-damage card** that heals-back / redirects / revives. Net HP is identical; the hit briefly lands then is restored. **Passives** (Shield Wall, Devoted Conduit) have no choice → they truly **pre-reduce** in the wrapper pre-pass.
- **C1 — Devoted Conduit** ("damage intended for another creature") fires **only on REDIRECTED damage** (Shared Burden's "in their place" hit, tagged `options.edhaRedirected`) — the auto-detectable case.
- **D — tests are owner-judged:** Retributive Guard ("White vs Spiritual") and Unbreakable Line ("White DC = ½ damage") cards ACT on click; the player rolls the test and clicks only on success (mirrors Coordination 1c).
- **E — Guardian Stance stays a manual toggled-OFF +1 Deflect AE** (already baked; the adjacent ally's copy is tracked by hand). No engine.

### Per-talent
- **Hardy** — data-side AE `system.resources.hea.max.bonus += @level` (clone of Black; `_id` WhiteHardyMaxHP1). **Pack-rebuilt + inspect-verified.** (Green Hardy still lacks it — next carry-over.)
- **Shield Wall** (passive) — pre-pass: victim **adjacent** to a Shield Wall owner who has **≥2 adjacent allies** → −floor([Tier][Die]/2). (Chebyshev ≤1 square = adjacency.)
- **Devoted Conduit** (passive) — pre-pass: on REDIRECTED damage to an in-Attunement-Range ally → −floor([Tier][Die]/2).
- **Interposing Shield** (reaction, 1 Inv) — ally within 10 ft takes damage → card heals back **floor([Die]/2)** + "move 10 ft".
- **Shared Burden** (reaction, 2 Inv) — adjacent ally takes D → card heals them **floor(D/2)** and deals that to the owner as `vital` (tagged `edhaRedirected` → Devoted Conduit can reduce it; guarded against cascade).
- **Retributive Guard** (reaction, 1 Inv) — adjacent ally hit by an enemy in your Range → card deals **[Tier][Die] spirit** to the attacker.
- **Unbreakable Line** (special, 3 Inv, 1/round) — adjacent ally drops to 0 → card sets them to **1 HP** (DC = ceil(½ damage) shown).
- **Guardian Stance** — manual (baked toggled-OFF +1 Deflect AE).

### New engine bits (reusable)
- **applyDamage pre-reduce** (`edhaReduceInstances`) + **adjacency helpers** (`edhaAdjacent` Chebyshev, `edhaAdjacentAllies`).
- **Bulwark reaction cards** (`edhaBulwarkReactions` post-pass, GM-gated/whispered; `edhaPostBulwarkCard` + `edhaBulwarkClick`) with actions heal-ally / redirect / retaliate / revive — payload in `data-*` attributes (cross-client safe, per the 06-14 §10 gotcha).
- **`edhaCrossHeal` / `edhaCrossDamage`** — do-if-owner-else-relay (burst-apply) helpers; reuse for any cross-actor heal/damage from a card.
- `options.edhaRedirected` damage tag — "damage taken in another's place" (drives Devoted Conduit + cascade guard).

### LIVE-VERIFY: see the Bulwark section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (Hardy changed the pack). Couldn't self-verify (no Foundry session): adjacency math at the table, the redirect re-entry + Devoted Conduit reduction, evaluateSync dice in the pre-pass, the GM-posted/owner-clicked card relay for cross-actor heals.

---

## 2026-06-14 DELTA — WHITE / COORDINATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

White tree-by-tree begins: **Coordination (8) done.** The tree's signature is the **Plot Die** ("raise the stakes") + ally-support — a mechanic family the Black tree never touched. Like Subjugation, it's a **NAME-BASED** engine block (`register-skills.js`, deployed via `module-src-sync.js push`; talents stay `events:{}`; NO `foundry-build`, NO ⟳ Sync — F5/relaunch only). The one data-side piece (Mending Aura's `edha-burst`) was authored earlier.

**Key system finding (verified in `cosmere-rpg` index.js):** the Plot Die injects EXACTLY like advantage — `D20Roll.hasPlotDie` reads `options.plotDie` (~L3780); `configureModifiers()` pushes the `PlotDie` term when set, idempotently (~L4017); the dialog seeds its checkbox from `data.raiseStakes` (~L3691); and the `skillRoll`/`attackRoll`/`itemRoll` hooks fire with an **already-evaluated** roll (~L5317→5321), so `roll.complicationsCount` / `opportunitiesCount` / `total` are readable post-roll.

### New REUSABLE tools
- **Plot-die grant primitive** — `flags.edha-content.plotDieNext = { skill:<id>|null, source }`. `edhaPlotDie{PreRoll,Consume}` mirror the `advTest` flag: set `roll.options.plotDie=true` + `configureModifiers()` (fast-forward) and wrap `configureDialog` to set `data.raiseStakes=true` (dialog). Skill-gated grants wait for the matching test. **Reach for this on any "raise the stakes / grant a Plot Die" talent.**
- **`edha.raiseStakes(tokenOrActorOrName, skillId?, source?)`** — console/macro API to grant the Plot Die manually (Unity of Purpose, or any GM call). Cross-actor writes relay via a new socket action **`set-flag`** (set any `edha-content` flag on a remote actor; a player rarely owns another PC).
- **Plot-grant card** (`edhaPostPlotGrantCard`) — lists in-range allies as buttons; click → `edhaGrantPlotDie` onto the chosen ally. Drives Guiding Signal + Concordant Presence (ruling 3 = chat-card recipient pick).
- **Coordination watcher** (`edhaCoordWatch`, post-roll `*Roll` hooks, **GM-gated**, cards **whispered to the owner**) — inspects each completed **ally-in-range** test (same-disposition token within the owner's White Attunement Range) and surfaces the matching card. Reuses a `coordRound` once/round store + `edhaWhisperIds`.
- **Coordination reaction card** (`edhaPostCoordReactionCard`) — whispered "you may react" card; click deducts the owner's OWN cost(s) (array of `{resource,value}`) + posts the result. Once/round/owner/talent gate (approximates the 1-reaction economy).
- **In-range ally helpers** — `edhaAttuneFtColor` / `edhaAlliesInAttune` / `edhaAllyInAttune` (color-parametric; the Black `edhaWithinAttune` was black-hardcoded).

### Per-talent wiring
- **Mending Aura** — already done (`edha-burst` heal, `floor([Tier][Die]/2)`).
- **Guiding Signal** (active) — `useItem` → grant card (cost paid by the activation; card is free).
- **Concordant Presence** (passive) — watcher posts a same-skill grant card (once/skill/round), owner clicks the recipient only if the triggering ally **succeeded** (ruling 1c — Foundry has no DC).
- **Beacon of Stability** — extends the White Draw Mana rider (`edhaDrawMana`): a cleanse card removes one condition from an in-range ally for 1 Inv.
- **Shared Conviction** (reaction) — watcher posts on a **plausible failure** (Complication or kept d20 ≤ 10); click spends 2 Foc + 1 Inv, adds the owner's White modifier (**rank + WIL**, ruling 2) to the ally's total.
- **Pillar of Order** (reaction) — watcher posts on an ally **Complication**; click spends 1 Inv → "Complication negated (blank face)" note (ruling 4 = tracked note, not a die re-render).
- **Unity of Purpose** — MANUAL (aid is untracked) → `edha.raiseStakes`.
- **Ordered Advance** — cost wired by activation; `useItem` posts a round note (no-provoke movement is GM-narrated; no opportunity-attack hook exists).

### Rulings applied (Ben, 2026-06-14)
1c = owner-judged "success"; 2 = White mod is rank + attribute (WIL); 3 = chat-card recipient pick; 4 = Pillar negation is a chat note; 5 = a granted Plot Die can roll its own Complication (intended — and Pillar can then negate it).

### Known limits
GM-gated watcher → the Concordant/Shared/Pillar cards only post when a **GM is online** (Guiding Signal / Beacon / `edha.raiseStakes` work from the owner's client regardless). "Would fail" / "succeeded" are owner-judged. Reaction economy is per-talent (global 1/round stays GM-tracked). **Hardy (White copy) still lacks the +level max-HP effect** — carry-over from Black; do in the White/Bulwark pass.

### LIVE-VERIFY (F5/relaunch — no Sync, nothing on the talents changed): see the White section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): Plot-Die dialog pre-check, `complicationsCount` read, the `set-flag` relay, the whisper routing.

---

## 2026-06-13c DELTA — BLACK / SUBJUGATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Black tree-by-tree continues: **Subjugation (8) done.** Mostly focus-economy + control; the automatable half is a **NAME-BASED** engine block (like Blood Price / Sanguine Reservoir — fixed-canon passives, so the engine keys off the talent NAME, no per-talent rule; the talents stay `events:{}`). **Engine-only — pushed via `module-src-sync.js`; NO `foundry-build` (packs untouched).** Name-based engine passives now: Blood Price, Sanguine Reservoir, Whispered Doubt, Coercive Pressure, Predatory Insight, Siphoned Will.

- **Focus watcher** (`preUpdateActor`→`updateActor`, GM-side): a creature whose `foc` DROPS drives **Whispered Doubt** (enemy in your Attunement Range loses 1 more focus, once/round/enemy), **Coercive Pressure** (creature in range → disadvantage on its next Cognitive test, once/round/creature), **Predatory Insight** (you regain 1 focus when any creature hits 0). preUpdate stashes old→new in `options.edhaFoc`; `_edhaInFocusWatch` + `options.edhaFocusWatch` guard the follow-up writes.
- **Cog-disadvantage flag** (`flags.edha-content.cogDisadv`) — mirror of Weakened for int/wil tests; set by Coercive Pressure, consumed on the next cog test (pre/consume on `pre*Roll`/`*Roll`).
- **Next-test advantage flag** (`flags.edha-content.advTest = "<skillId>"`) — Predatory Insight active half (on use → `advTest:"dec"` → advantage on next Deception); consumed on the matching test. Generic (reusable for any "advantage on next <skill>").
- **Siphoned Will** — Hollow Command has NO success hook, so its `cosmere-rpg.useItem` posts a one-click **focus-confirm chat-card** (regain focus = tier) when the owner also has Siphoned Will (reuses `edhaPostTriggerCard`).
- **Composed** already done (ActiveEffect `+@tier` max focus).
- **Manual by nature (no Foundry enforcement):** Hollow Command/Puppeteer action-denial + forced actions, Extract Thought reaction-denial — rolls/costs are wired; the control is GM-narrated.
- **Isolation positioning — stays manual (no "moved adjacent" / willing-movement hook):** Cruel Step (10 ft toward an Isolated target, no Reactive Strike), Unnerving Approach (push an enemy's ally [Size] ft to strand it), Dread Presence (Weakened creatures can't close on allies) — Investiture costs are wired by activation; the displacement + Isolated check are table rulings (same GM-narrated convention as Ordered Advance / Redirect Momentum, pre-Momentum pilot).

**Known limits:** the focus watcher is GM-gated → it fires off GM-initiated focus changes (enemies spending / hitting 0 — the intended case); PLAYER-initiated PC focus changes don't trigger reactions (fine — Whispered Doubt is enemy-only, and it avoids self-debuffing allies via Coercive Pressure). Only bites creatures that actually spend `foc`. "Advantage this round" (Predatory Insight) has no round-expiry — the flag persists until the next Deception test consumes it. Relies on `options.edhaFoc` surviving to the GM's `updateActor` on the same client (true for GM-initiated changes).

**LIVE-VERIFY (F5/relaunch — no Sync needed, nothing changed on the talents):** GM spends an enemy's focus near a Whispered-Doubt PC → enemy loses 1 extra; near a Coercive-Pressure PC → its next int/wil test rolls disadvantage; drop any creature to 0 focus → Predatory-Insight owners gain 1; use Predatory Insight → next Deception rolls advantage; use Hollow Command while owning Siphoned Will → focus-confirm card.

---

## 2026-06-13b DELTA — BLACK TREE: ISOLATION + RITUAL SPECIALTIES COMPLETE + NEW ENGINE TOOLS (built + pack-verified via inspect-pack; relaunch + ⟳ Sync to load)

Tree-by-tree review reached the **Black** tree. **Isolation (8) and Ritual (8) specialties fully wired** in `data/authored/leyline-black.json` + `module-src/scripts/register-skills.js`; deployed via `node scripts/module-src-sync.js push`, rebuilt with `node scripts/foundry-build.js leyline`, spot-checked with `inspect-pack.js`. **The new tools below are reusable — reach for them on later trees.**

### New EVENTS
- **`edha-on-hit`** — fires when YOUR attack actually **APPLIES** damage (a real hit), dispatched by the `applyDamage` wrapper (`edhaDispatchOnHit`, `_edhaInTrigger`-guarded). Pair it with an `edha-triggered-effect`. **Owner-wide** for passive talents; **item-specific** for attack talents that carry `system.damage.formula` (only fires on THAT talent's own hit). **Use this — NOT `edha-deal-damage` — for any "on hit" effect** (deal-damage fires on every attack ROLL incl. misses; see the new §10 gotcha).
- **`edha-pre-test`** — sentinel for `edha-test-rider`, read by the pre-roll injector.

### New HANDLERS
- **`edha-test-rider`** — passively adds a bonus to a skill/attack **TEST**. The system can't buff a test from a passive, so we inject via its native "Temporary Bonus" field: resolve the formula and append the term to the d20 roll in `pre{Skill|Attack|Item}Roll` (works fast-forward AND dialog; no double-count). Fields: `appliesTo` (any/attack/skill/item), `bonusFormula`, `whenTargetStatus`, `whenTargetIsolated`. (Predatory Patience: +[Die] vs Weakened.)
- **`edha-ritual-hp-cost`** (event `use`) — the HP-cost **keystone**: caster loses HP = `formula` (rolled, so dice like half-[Die] work), flags Blood Price advantage, and banks Reserve if they own Sanguine Reservoir. (Withering Ray, Dark Investiture.)
- **`edha-heal-cut`** (sentinel `edha-apply-watch`) — on a matching-`color` attack hit, halve the target's healing until the **end of YOUR (owner's) next turn**. Fields: `color`, `fraction`. (Necrotic Grasp.)
- **`edha-triggered-effect` gained `whenTargetStatus`** — gate a trigger on the victim's status (checked in the executor and in the on-hit dispatch), mirroring the damage-rider's field. (Predatory Patience Inv-regain only vs Weakened.)

### New ENGINES / mechanics
- **Affliction damage engine** — the system has the `afflicted` icon but ZERO per-turn damage. Now `kind:affliction` triggered-effects STORE the rolled amount on the victim (`flags.edha-content.afflictions`) and **auto-deal it at the start of the carrier's turn** (`combatStart`/`combatTurnChange`, GM-gated, re-entrancy-guarded); cleared when the Afflicted condition is removed (`deleteActiveEffect`). (Dark Investiture — **Model A**: the hit deals an immediate [Tier][Die] tick AND sets up the ongoing affliction; one tick more than the strict text, the only way to auto-gate on success.)
- **Timed-status expiry generalized** — `EDHA_TIMED_STATUSES = {weakened, immobilized}` (was weakened-only). Immobilized (Sovereign of Solitude) now auto-expires end of its next turn. The same expiry pass also honors **owner-relative** coordinates (heal-cut stamps the OWNER's next-turn coord) — one engine, no duplicate.
- **Reserve** — flag-based pseudo-resource (`flags.edha-content.reserve`, cap = ranks in Black), mirrors the Temp HP infra; budget-bar readout `Reserve X / cap`. Banking is automatic (keystone). **Spending** Reserve (as Investiture / Double Dip's HP-substitution) is a tracked-manual ruling (Scope A).
- **Blood Price advantage** — ritual-HP-cost sets `flags.edha-content.bloodPriceAdv`; the next **Black** test rolls with advantage then clears it (`pre*Roll` sets, `*Roll` consumes; Black test = `roll.data.skill.id === "black"`). Mirror of the Weakened disadvantage pattern.

### Content deltas
- **Isolation:** Sapping Hex + Predatory Patience (Inv-regain) **retrofitted `edha-deal-damage` → `edha-on-hit`** (they were firing on missed rolls). Predatory Patience also got the test-rider; Sovereign of Solitude got immobilize-on-success. Spoils/Severance unchanged. Sapping Hex text/notes now say "becomes Weakened" (unified duration; stale "REMOVE MANUALLY" note gone — closes the 06-13 PENDING).
- **Ritual:** Hardy (ActiveEffect `+@level` max HP), Dark Investiture (HP cost + auto-affliction), Necrotic Grasp (heal-cut), Withering Ray (HP cost; attack+damage already correct), Blood Price + Sanguine Reservoir (keystone-driven, no per-talent rule), Double Dip (skill-test only; Reserve-spend manual), Predator's Due (already done).
- **NOTE — Hardy appears in White & Green trees too** (same talent/text); only the BLACK copy got the max-HP effect. Sync the others when those trees come up (or ask Ben).

### LIVE-VERIFY (relaunch + ⟳ Sync first)
Predatory Patience +[Die] only vs Weakened + Inv on a real hit; Sapping Hex/Predatory Patience DON'T fire on a miss; Dark Investiture afflicts + auto-ticks at the target's turn start (remove the icon to stop); Necrotic Grasp halves a hit creature's healing; Blood Price → advantage on the next Black test; Reserve readout grows as you pay ritual HP; Sovereign immobilizes on a hit. Couldn't self-verify: the half-[Die] cost formula resolving, affliction tick timing, heal-cut halving, Blood-Price advantage detection.

---

## 2026-06-13 DELTA — WEAKENED REWORKED TO A FIXED DURATION + GENERIC TIMED-STATUS EXPIRY (engine-only; F5 to load)

**Ruling (Ben): Weakened no longer self-consumes on the first physical test — it gives DISADVANTAGE on EVERY physical (str/spd) test while it lasts and ALWAYS falls off at the END of the affected creature's next turn.** The 06-11c consume-on-first-test model was too weak: it could vanish before the Black tree's Weakened payoffs (Spoils of Isolation / Sovereign of Solitude / Predatory Patience) got their turn.

- **Engine (`register-skills.js`, runtime-JS only — F5, packs untouched):** removed `edhaWeakenedPostRoll` + its `cosmere-rpg.{skill|attack|item}Roll` hook (the consume). Kept the pre-roll disadvantage hook — it now fires on every str/spd test, since the status persists.
- **New generic timed-status expiry pass:** an effect carrying `flags.edha-content.expireAfter = {round, turn}` is removed once the combat pointer advances PAST that coordinate (i.e. at the END of that turn), with a chat note. Runs on `combatStart` / `combatTurnChange` + a `ready` restore, GM-gated to one GM (same pattern as the def-buff refresh). **This is the turn-based expiry engine §9 said didn't exist — now it does, scoped to Weakened.** Reusable: any future timed effect (e.g. Pyre/hazard durations) can set the same `expireAfter` flag.
- **Stamping (`createActiveEffect`, GM-side):** Weakened stamps its NEXT-turn coordinate on apply — applied *before* the creature acts this round (turn index > current turn) → end of its turn THIS round; applied on/after its turn (incl. its own turn) → end of its turn NEXT round. Any apply path is covered (Sapping Hex, Black Draw Mana, manual toggle, `edha.toggleStatus`). Out of combat it isn't stamped on apply; the pass lazily stamps it once combat is running, then it expires normally.
- **LIVE-VERIFY (F5, no rebuild):** in combat, apply Weakened → confirm disadvantage on multiple str/spd tests (not just the first) and NO disadvantage on a Lore test → confirm it auto-clears at the END of the creature's next turn (chat note) → confirm Spoils of Isolation / Sovereign of Solitude / Predatory Patience still see it Weakened on the Outlaw's turn.
- ~~PENDING: Sapping Hex's "(REMOVE MANUALLY)" note~~ **DONE 2026-06-13b** (fixed + rebuilt in the Black pass).

---

## 2026-06-12 DELTA — PACK-PATH SCHISM FIXED + WORKFLOW HARDENING (disk-verified; in-Foundry verify = the standing 06-11b checklist)

**The 06-11b `packs/v3/` split had silently broken the whole round-trip** and poisoned a commit; all repaired this session:

- **What was broken:** module.json pointed Foundry at `packs/v3/` but extract/build/guard/validators all still targeted `packs/` → the guard protected nothing, builds wrote where Foundry never looked, "validation passed" validated dead packs, and the 06-12 full extract (commit 8456a97) captured **stale pre-v3 content** into `data/authored/` (zero v3 rules — the "25 un-extracted edits" it reported were the v3 diffs seen backwards). Because the authored overlay wins over generator + side-files, the next rebuild would have stripped the v3 automation from ~25 talents.
- **Fix:** consolidated to **`packs/` as the one true path** (copied v3 content over the stale dirs, reverted module.json; `packs/v3/` is dead — delete on sight). Re-extracted all 365 talents from the real packs (v3 rules confirmed present in `data/authored/`), rebuilt all 4 packs (counts match v3: events:36, effects:14, rollable:89, overlays:365), validators passed, and v3 rules spot-checked in the WRITTEN packs (Life Surge overflow-thp, Vital Diagnosis apply-status, Severance convert, Spoils sweep).
- **Effect projection extended (`edha-pack-io.js`):** ActiveEffect **`duration` / `statuses` / `type` now round-trip** (normalized so Foundry-stamped defaults fingerprint identically to absent fields). Timed/ongoing effects and condition icons survive extract — required for the tree-by-tree effects work.
- **Tools moved into the repo** (`scripts/`): `validate-packs.js` (replaces `C:\tmp\validate2.js`; now also counts events/effects and reads via temp-copy = safe with Foundry open), `validate-adversaries.js` (also checks baked effect keys), `inspect-pack.js` (CLI: `node inspect-pack.js edha-deity "Life Surge"` or `--group Red` — prints a talent's rules/effects as Foundry loads them). `run-playtest-build.bat` updated. The `C:\tmp` copies are obsolete.
- **Module runtime is now in git:** `module-src/` mirrors `register-skills.js` + `module.json` + `styles/edha.css` + `lang/en.json` via **`node scripts/module-src-sync.js [pull|push]`**. AppData has no other backup — **run a pull + commit after every engine edit.**
- **AUTHORING RULE (supersedes §9's "author side-file entries"):** all 21 trees are authored overlays now, and overlays MASK side-file entries for existing talents. Author per-talent behavior **in Foundry → extract**, or **hand-edit `data/authored/<atlas>-<tree>.json` → build**. Side-files = bootstrap history; new mechanic PATTERNS = new handler types in register-skills.js.

**NOTE: the installed system is cosmere-rpg v2.1.0** (older text below may say 2.0.4 — the system updated; v2.1.0's native event dispatch is verified working).

---

## 2026-06-11c DELTA — WEAKENED MECHANIC ⚠ SUPERSEDED by 06-13

Original model: disadvantage on the next str/spd test, then consumed. Replaced by a fixed end-of-next-turn duration (06-13). Still current: the pre-roll disadvantage on str/spd tests (`cosmere-rpg.pre{Skill|Attack|Item}Roll` → seed `advantageMode`, wrap `configureDialog`; actor via `edhaD20RollActor`). The post-roll consume was removed. Full history in agent memory.

---

## 2026-06-11b DELTA — V3 ENGINE PASS (built + pack-validated; ⚠ NOT LIVE-VERIFIED — run the checklist below before playtest)

Goal: clear the deferred backlog — the §9 engine to-dos and the triage doc's B-bucket ("trigger-v2 / engine-needed"). Everything below is authored, built into the packs, and verified at the LevelDB level (rules present, effects keyed correctly, `node --check` clean on both scripts); **nothing has run inside Foundry yet**.

### Engine (register-skills.js, now ~2384 lines, v0.2.0)
- **Custom statuses registered:** `weakened` (condition:true), `diagnosed` (mark), `insight` (STACKABLE, Gnothis counter). Added to BOTH `CONFIG.COSMERE.statuses` and `CONFIG.statusEffects` at module init (the system maps statuses→statusEffects in its OWN init, which runs first). Bonus: **Black Draw Mana now auto-applies Weakened** (its `CONFIG.COSMERE.statuses.weakened` check finally finds one). Icons: downgrade/eye/book.svg (core `icons/svg/` set — verify they render; a 404 = blank status icon).
- **New event types:** `edha-take-damage` (real: hook `cosmere-rpg.applyDamage`, document = VICTIM; `TRIG_EVENT` maps `take-damage` now — Prognosis-style watchers no longer emit nothing), `edha-apply-watch` (sentinel for rules read by the applyDamage engine).
- **New handler types:** `edha-apply-status` (mark a target + record owner in `flags.edha-content.markedBy.<status>`; optional party bonus damage), `edha-status-sweep` (damage all [status] creatures in range, THP = total), `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit` (all sentinels read by engine glue).
- **applyDamage wrapper overhauled** (pre-pass mutates instances BEFORE apply, post-pass reacts after): Severance vital conversion vs Isolated victims; Vital-Diagnosis +Tier vital bonus instance on ANY damage vs the marked creature; heal-overflow→Temp HP; Prognosis 1-Inv-per-round when the Diagnosed creature takes damage; Mender's Instinct chat-card prompt when an ally character crosses to ≤ half HP. **Isolated is computed live** (no ally token within 10 ft) — `edha.isIsolated(actor)` to test.
- **Riders** gained `whenTargetCondition` / `whenTargetStatus` filters (checks YOUR CURRENT TARGET — target before rolling). **Triggered effects** gained `whenTargetIsolated` + kind `status` (apply a status; GM-relayed via new socket actions `toggle-status` / `apply-status-mark`). Trigger heals can now target the VICTIM (`target:"victim"`), with a burst-relay fallback when the healer lacks perms.
- **Summons** can carry baked toggled-off ActiveEffects + extra baked abilities (`bakedEffectsJson`/`extraItemsJson` on the rule): Forge Construct now bakes **Siege Form** (Speed 0 via override, deflect 3) + a **Siege Cannon** ranged attack resolved vs the caster at summon time.
- **Edha derivations** (characters only): HP = system + 1 (skipped while the actor's SOURCE still carries a manual `hea.max.bonus` — the pregens), Speed = 20 + 5×SPD + effect bonuses (skipped while the source carries its own movement override). **Run `edha.migrateDerivations()` once as GM** to strip the pregens' per-actor hacks so the derivations take over. Investiture source-override clamp gotcha now self-heals: the derivation PERSISTS `inv.max.{override,useOverride}` to the actor source once per session.
- **⟳ Sync flake hardened:** retries `pack.getDocuments()` vs `pack.index` up to 5× with backoff, warns if still short.
- **API additions:** `edha.migrateDerivations()`, `edha.isIsolated(actor)`, `edha.toggleStatus(actor, statusId, active)`.

### Generator + tables
- `foundry-build.js`: emits the above from **`data/talent-state.json` (NEW)** — kinds: mark / sweep / convert / marked-watch / hp-threshold / multi-hit / overflow-thp; riders + triggers gained the new filter passthroughs; `talent-effects.json` entries may now set `transfer:false` (apply-to-target template) + `statuses:[...]` (token icon).
- **`data/adversary-effects.json` (NEW):** the 17 §8b hand-built world-actor effects, extracted VERBATIM from the live world (Stitchmother Phase 2 / Vital Diagram, Frost Lance Slowed, Brace ×2, trackers, etc.) and baked into the edha-adversaries pack as `!actors.items.effects!<actor>.<item>.<effect>` sub-keys (same split as talent packs; key shape verified against the system's companions pack). **Pack re-imports now keep the adversary automation.**
- Entries authored (B-bucket cleared): Vital Diagnosis (mark, +Tier vital), Prognosis (marked-watch + conditional heal rider), Severance (convert), **Sapping Hex** (deal-damage trigger, Isolated filter → Weakened), **Spoils of Isolation** (sweep; its old flat-roll entry REMOVED to prevent double-apply — rollable count 90→89), Mender's Instinct (hp-threshold), Flashpoint (multi-hit, red), Life Surge + Overgrowth (overflow-thp; the heroic plant 'Overgrowth' twins get the inert rule too — harmless). Forge Construct summon spec gained Siege Form/Cannon.

### Build & packs — ⚠ the `packs/v3/` split here is SUPERSEDED by 06-12 (consolidated back to `packs/`; v3 dirs are dead). Build counts at the time: talents:365 events:36 effects:14 rollable:89; adversaries 9/30 + 17 baked effects; all pack-level spot-checks OK.

### LIVE-VERIFY CHECKLIST (next session / before playtest)
1. **Full relaunch** (module.json changed — F5 is not enough). Confirm the module loads (console: "native event system registered" with the v3 handler list) and all 4 compendia populate from `packs/v3/`.
2. **⟳ Sync** all characters (rerun if short). 3. **`edha.migrateDerivations()`** once as GM → check HP max and Speed on all 4 PCs match the sheets (HP system+1, Speed 20+5×SPD; Walking Ruin still +10 on the Demolisher).
4. Token HUD shows Weakened/Diagnosed/Insight icons (404 icon = swap `EDHA_STATUSES` icon paths). Black Draw Mana auto-applies Weakened in range.
5. **Outlaw:** hit an Isolated dummy → Weakened auto-applies (Sapping Hex) + damage applies as VITAL (Severance chat note); Spoils of Isolation vs ≥1 Weakened enemy → per-target vital + THP = total.
6. **Vivisectionist:** Vital Diagnosis (target first!) → Diagnosed icon + chat; any damage vs the marked creature gains +2 vital; Prognosis recovers 1 Inv (once/round); Verdant Mend vs a conditioned target heals +[Tier][Die] (rider — target BEFORE rolling); Life Surge past max → overflow Temp HP; ally to half HP → Mender's prompt heals the ALLY.
7. **Demolisher:** Flame Surge capturing 2+ → Flashpoint prompt (regain 1 Inv button). Arc Flash regression.
8. **Forgemaster:** Forge Construct summon carries the toggled-off Siege Form effect + Siege Cannon item.
9. **Adversaries:** import a fresh Stitchmother from the pack → Phase 2 / Vital Diagram effects present (re-import no longer loses them).
- Known manual bits: most status DURATIONS still have no expiry engine — remove by hand (EXCEPTION: Weakened now auto-expires at the end of the creature's next turn via the generic timed-status pass — see the 06-13 delta); Sapping Hex fires on the damage ROLL (not a confirmed hit) vs your current target; Lay Foundation persistent friendly zone still missing (region-buff engine); Crown of Thorns still manual (no "which defense was tested" hook).

### New gotchas (operator)
- **Cowork-sandbox mounts serve STALE copies of host-edited files** (new content truncated to the old byte length!) and **cannot delete** module files (EPERM on unlink). Hence: build to NEW dirs (`packs/v3/`), syntax-check by reconstructing head+tail, never trust `wc`/`node --check` through the mount on a file edited host-side this session.
- Item updates that worked: creating files + overwriting bash-written files through the mount is fine; LevelDB pack WRITES to fresh dirs are fine.

---

## 2026-06-11 DELTA — playtest-PC manual-talent triage pass-1 (built, synced, live-verified; world is playtest-ready)

Full triage + per-talent design notes: `TRIAGE_PLAYTEST_PC_MANUALS.md` (next to this doc). Summary:

- **5 new table entries authored + built (deity, heroic; leyline untouched) + ⟳ Synced + live-verified:**
  - **Warlord's Advance** (talent-triggers, `on:kill` → THP `@tier` self) — the `{resource:"inv", value:0, optional:true}` trick WORKS: a 0-cost confirm chat-card button posts on any presumed kill; click only if the kill came from this attack. Verified end-to-end (Trooper kill → button → THP {value:2, source:"Warlord's Advance"}).
  - **Swift Healer** (talent-riders, `appliesTo:"heal"`, `@skills.med.rank`) — verified: Verdant Mend rolled `(2)d(2*3+2) + 6 + 2`.
  - **Vigilant Stance / Flamestance** (talent-effects) — toggled-off indicator AEs (changes:[]; sheet toggle only, no token icon — `statuses` is hardcoded `[]` in the build). Mechanics manual.
  - **Lay Foundation** (talent-targeting, plain aoe-template, sizeFt:5) — works but the template is TRANSIENT (the aoe handler deletes it after capture/targeting). Net value = cost consumption + use card; the persistent Foundation zone still needs a manual drawing. Pull the entry if it annoys.
- **Triage verdicts:** most §8a "Manual" talents are blocked on Phase-3/engine work, not table entries — Severance + Spoils-THP (conditional-vs-state / damage-fed THP), Sapping Hex (custom Weakened status), Prognosis (`edha-take-damage` event — CONFIRMED a take-damage table entry emits NOTHING today, triggerRule returns null), Life Surge/Overgrowth overflow-THP, Vital Diagnosis marker (needs `transfer:false` passthrough in talentEffects — bundle with the §8b adversary-effects bake). Forgemaster's kit is mostly narrative → stays manual.
- **NEW GOTCHA — Investiture source-override clamp:** the system's own prepare clamps `inv.value` against `max.value` BEFORE the module's Investiture derivation applies its runtime override — an actor whose SOURCE lacks `inv.max.{override, useOverride:true}` gets its current Inv clamped to 0 every prepare (src value survives untouched; the sheet just shows 0). The Demolisher had the source override (why it never showed the bug); Outlaw/Vivisectionist/Forgemaster didn't. FIXED by persisting source overrides (5/5/6 = canon 2+max(AWA,PRE)). If a future PC shows inv 0 after a reload, this is why. Consider doing the same persistence inside `edhaDeriveInvestiture` (actor.update once, instead of per-prepare in-memory override).
- **World prep done (2026-06-11):** player ownership + character assignment set — **Amertron→Outlaw, Laustarr→Demolisher, Spidercam→Forgemaster; Vivisectionist = GM-run spare** (NOT Forgemaster as §8b guessed). Outlaw token placed by the party (was missing — only 3 PCs had tokens). All 4 PCs at full Investiture. combats=0, templates=0, Playtest Map active, game paused. Test artifacts cleaned (Trooper HP restored, test THP cleared, temp tokens deleted); a few test chat cards from this session remain in the log (harmless — delete by hand if wanted).
- Build counts now: deity events 11 / effects 1; heroic events 7 / effects 8. `VALIDATION PASSED ✓`, 0 issues. `scripts/run-playtest-build.bat` exists for one-click deity+heroic+validate (writes `scripts/build-log.txt`).

---

## 1. What this is

Port the **Edha** homebrew talent/skilltree system (Cosmere RPG homebrew) into **Foundry VTT** as a content module **`edha-content`**, built on the community **cosmere-rpg** system. Three talent atlases (leyline / deity / heroic) + a playtest-adversary pack, plus runtime automation (rolls, triggers, Temp HP, summons, targeting, Draw Mana, Investiture derivation).

As of 2026-06-09 talent behaviors are hosted **natively and exclusively** on each talent — `system.events` rules + `effects` ActiveEffects — visible and editable on the talent's Events/Effects tabs (see §7). There is NO parallel runtime behavior store; `register-skills.js` is a thin generic engine that reads the on-talent rules.

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`. User data at `C:\Users\benhe\AppData\Local\FoundryVTT\`.
- **System:** `cosmere-rpg` v2.0.4 at `…\FoundryVTT\Data\systems\cosmere-rpg\index.js` (minified ~28.7k lines; grep it for facts — hooks/handlers use templated strings, so grep the SUFFIX e.g. `damageRoll`, `registerItemEventHandlerType`). Unminified core Foundry API lives in `C:\Program Files\Foundry Virtual Tabletop\resources\app\{client,common}\**\*.mjs` (grep here for Region/ActiveEffect/document APIs).
- **Public icons:** `C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons` — **verify icon existence with a WINDOWS path** (`C:/Program Files/...`); an MSYS `/c/...` path makes node `fs.existsSync` return false for everything. A 404 icon = invisible/unselectable tree node.
- **Our module:** `…\FoundryVTT\Data\modules\edha-content\` — `module.json` (now declares the `RegionBehavior.hazard` documentType), `scripts/register-skills.js` (the runtime; hand-edited here), `styles/edha.css`, `lang/en.json`, `data/*.json` (runtime tables, copied at build), `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries}` (LevelDB).
- **Source (canonical):** `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\` — `data/leyline.json` (125), `data/domain.json` (90 deity), `data/cosmere.json` (375; only 6 heroic paths ×25 = 150 in scope), `data/adversaries.json` (9), + the behaviour tables (see §5). `scripts/foundry-build.js` (generator) + `scripts/talent-icons.js`.
- **Validators/inspectors (in `Skilltrees/scripts/` since 2026-06-12; the old `C:\tmp` copies are obsolete):** `validate-packs.js` (talent packs), `validate-adversaries.js` (adversary pack incl. baked effect keys), `inspect-pack.js <pack> "<Name>"` / `--group <Tree>` (print a talent's emitted events/effects). All read via temp-copy → **safe with Foundry open**.

## 3. Build / validate / when to rebuild vs F5

- **Build:** `cd "…/Skilltrees/scripts" && node foundry-build.js [leyline|deity|heroic|adversaries|all]` (default all). **NOTE: single scope arg only** (`leyline deity` runs leyline ONLY; run twice or use `all`). Deterministic 16-char ids (`fid`). Rewrites the LevelDB packs (effects as `!items.effects!` sub-keys), writes tree-background SVGs, bakes per-talent `system.events` + `effects`, and **deletes any stale runtime-table copies from `modules/edha-content/data/`** (tables are generator inputs only). Portable: `EDHA_DATA`/`EDHA_MODROOT` env overrides + classic-level fallback (`npm i classic-level` + NODE_PATH off-machine).
- **Validate:** `node validate-packs.js` (expect `VALIDATION PASSED ✓`, 0 issues); `node validate-adversaries.js` after adversary builds.
- **FOUNDRY MUST BE CLOSED to rebuild** (LevelDB lock). Check: PowerShell `Get-Process | ? {$_.ProcessName -match 'foundry|electron'}`. From inside a running world, `game.shutDown()` returns to Setup and **releases the pack locks** (no full quit needed) — but re-launching the world hits the GM join-password gate.
- **Rebuild needed** for anything baked into the packs: talent text/roll-data (DETAILS), **native `system.events` rules + `effects` ActiveEffects**, tree layout, icons, path events/grants, adversary stat blocks, the Draw Mana item.
- **F5 (reload) re-runs init/setup/ready** → reloads `register-skills.js` (the registered event/handler types, the `edha-content.hazard` Region behavior, all runtime helpers + JSON-table fallback). `module.json` changes (e.g. documentTypes) need a full world relaunch, not just F5.
- **Embedded-talent SNAPSHOT gotcha:** talents already on an actor are frozen copies. After a pack rebuild, re-sync owned talents: budget-bar **⟳ Sync Talents** button or `edha.syncNow()`. Sync now also carries `system.events` + `effects`.

## 4. The `edha.*` console/macro API (operate it solo)

Exposed at `game.modules.get("edha-content").api` and global `edha`:
- `edha.syncNow(actor?)` / `syncAllCharacters()` — re-pull roll data + native events/effects onto owned talents after a rebuild.
- `edha.grantDrawMana(actor?)` — add Draw Mana to a character who added their leyline path before Draw Mana existed (or just re-add the leyline path).
- `edha.resetTriggers(actor?)` — clear once-per-round trigger locks (testing).
- `edha.fixSettings()` — force `applyButtonsTo` → Prioritise Targeted.
- `edha.showRange(item|name)` — draw the Attunement-Range ring.
- `edha.aoe(item)` / `edha.summon(actor,name)` / `edha.setTempHp(actor,n,src)` / `edha.getTempHp(actor)`.
- `edha.clearKindleLights()` — restore tokens' pre-Kindle lighting (also auto on `deleteCombat`). `edha.refreshDefBuffs()` — re-sync Know-Your-Moment-style defense buffs to the current combat turn (e.g. after a mid-combat reload).
- `edha.raiseStakes(tokenOrActorOrName, skillId?, source?)` — grant a Plot Die (White / Coordination). *(`edha.calculatedPatience()` was REMOVED 2026-07-24y — the talent carries its own `whenSlowTurn` rider now.)*

## 5. Behaviour tables (generator INPUTS ONLY; in `Skilltrees/data/`; NEVER read at runtime)

These tables are **generator INPUTS only** (2026-06-09): `foundry-build.js` emits each entry as a native `system.events` rule (or an `effects` ActiveEffect) on its talent. They are **NOT copied to the module and NOT fetched at runtime** — the build deletes any stale `modules/edha-content/data/talent-*.json` copies. The runtime reads behaviour exclusively from each talent's own rules/effects.

**⚠ MASKED SINCE 2026-06-12:** all 21 trees now have authored overlays (`data/authored/`), which **win over these tables** — a new table entry for an existing talent does nothing. Author per-talent behavior in Foundry (→ extract) or by hand-editing `data/authored/<atlas>-<tree>.json` (→ build). The tables below are kept as bootstrap history + schema reference for the rule shapes the engine understands.

- `talent-rolls.json` — per-talent Skill Test + Damage (→ baked into `system.activation`/`system.damage`, the DETAILS tab; native + editable). 90 rollable.
- `talent-riders.json` — passive damage riders (Kindle, Mighty) → `edha-damage-rider` rule (incl. **`lightRadiusFt`** for Kindle's "damaged creatures shed light"); applied by the `rollDamage` wrapper / `applyDamage` wrapper, which READ the native rule.
- `talent-thp.json` — Temp HP grants → `edha-temp-hp` rule on `use`.
- `talent-summons.json` — summon stat blocks → `edha-summon` rule on `use`.
- `talent-triggers.json` — triggered effects → `edha-triggered-effect` rule on `edha-deal-damage` / `edha-on-defeat`, incl. the **`whenDamageType`** filter (e.g. Arc Flash = energy-only). Dispatched NATIVELY by the system's event engine (no take-damage entries currently exist; add an `edha-take-damage` event type when one does).
- `talent-targeting.json` — **point-burst config**: a `burst:{}` block is emitted as an `edha-burst` rule (event `edha-pre-use`) carrying size/range/save/heal/terrain — the preUseItem engine READS that rule (supersedes the `edha-aoe-template` rule for those talents). Range preview (⊙ button) needs NO data (color derived at runtime).
- `talent-hazards.json` **(new)** — dangerous terrain (Set Charge, Pyre, Fault Line) → `edha-place-hazard` rule on `use` → drops a scene-scoped Region with the `edha-content.hazard` behaviour.
- `talent-effects.json` — passive numeric buffs (Walking Ruin +Speed) → native ActiveEffects baked into the pack (key e.g. `system.movement.walk.rate.bonus`, mode ADD). **The old strip-on-load issue is FIXED** (effects are written as separate `!items.effects!` LevelDB keys — see §7).
- `talent-defense-buffs.json` — defense bonus for a combat-timing window (Know Your Moment) → an **`edha-defense-buff` rule ON the talent** (event `edha-combat-timing`; amount/defenses/window/label editable on the Events tab). The engine's core combat hooks read that rule and toggle the matching actor ActiveEffect. Pattern for any "+N defense/stat for a window" talent.
- `talent-state.json` **(v3)** — state mechanics, one entry or ARRAY per talent. Kinds: `mark` (apply status + record owner + party bonus dmg — Vital Diagnosis), `sweep` (damage all [status] in range, THP=total — Spoils of Isolation), `convert` (damage type vs Isolated — Severance), `marked-watch` (resource regen when your marked creature takes damage — Prognosis), `hp-threshold` (ally-at-half prompt — Mender's Instinct), `multi-hit` (2+-capture prompt — Flashpoint), `overflow-thp` (heal overflow → THP — Life Surge/Overgrowth).
- `adversary-effects.json` **(v3)** — adversary item ActiveEffects (advName → itemName → [effects]), baked into the edha-adversaries pack so re-imports keep the §8b automation.
- Draw Mana riders + Investiture formula + HP/Speed sheet derivations are **hardcoded** in register-skills.js (small, fixed canon).

## 6. Settings the user must have

- **`applyButtonsTo` = 4 (Prioritise Targeted).** REQUIRED for the auto-target AoE model — at the default 0 (SelectedOnly) the chat Apply buttons ignore targets and only hit the selected token. The module force-sets it on load (GM); also Configure Settings → cosmere-rpg → "Apply damage/healing to" → Prioritise Targeted, or `edha.fixSettings()`. When clicking Apply, don't re-target between casting and applying.

---

## 7. THE NATIVE EVENT/EFFECT SYSTEM — ⚠️ PARTIALLY IN FORCE (see §7.-1 before reading §7.0)

### §7.-1 — 2026-07-24 CORRECTION: the 06-09 refactor was silently reversed (READ FIRST)

**§7.0 below describes the architecture as it stood on 2026-06-09. It has NOT held.** Measured
against a real build of the current tree (2026-07-24, all three atlases, 365 talents):

| Where a talent's behaviour actually lives | Talents | Share |
|---|---|---|
| **On the document** — `system.events` / `effects`, visible + editable on the Foundry tabs | **80** | 22% |
| **In the engine, keyed on the talent's NAME** — empty document, `item.name === "X"` dispatch | **210** | 58% |
| **Nowhere** — empty document, no engine wiring | **75** | 21% |

222 of the 338 distinct talent names appear as hardcoded string literals in
`register-skills.js` (549 occurrences). So §7.0's "**no name-keyed dispatch**" is false today.

**What happened, and why nothing caught it:** the 06-09 refactor was real and complete for the
trees that existed then. Every tree wired *after* it — all ten deity trees (06-17 → 07-03) and the
heroic pass (07-18h) — was wired name-keyed, and
`.claude/skills/leyline-tree-authoring/SKILL.md` then codified that as the standard ("All
*name-based* automation … lives here"). Two documents in this repo have contradicted each other
ever since, both stated as settled, and no gate tests the axis either way.

**Consequences that reach the table** (this is the requirement the drift broke — talents were
supposed to be editable in Foundry):
- A talent whose behaviour is name-keyed shows **empty Events and Effects tabs**. Editing them
  changes nothing; the engine is not reading them.
- **Renaming a talent silently unwires it.** The dispatch is bound to the string, not the document.
- The card text and the behaviour are two separate artifacts kept in agreement only by hand.

**Status:** unresolved by design decision, not by oversight. Iron rule 2 as written forbids a
*second engine file* — it has never said anything about behaviour location, which is why 210
talents drifted without violating any rule. The rule rewrite and the migration are a dedicated
workstream; until it lands, treat §7.0 as **historical record of a target state**, not as a
description of the current engine.

### §7.0 — 2026-06-09 RE-REFACTOR (historical; true when written, since reversed — see §7.-1)

**Every automated talent now carries its behavior ON the item**: `system.events` rules (Events tab, fully editable via the auto-rendered rule dialog) + `effects` ActiveEffects (Effects tab) + the roll on DETAILS. `register-skills.js` is a thin generic engine: it registers event/handler types, generic executors, and engine glue (burst targeting UI, GM socket relay, combat-turn timing, rollDamage/applyDamage wrappers) that READ the on-talent rules. **The legacy runtime behavior store is DELETED** — no table loaders, no side-file fetches, no name-keyed dispatch; `modules/edha-content/data/` ships no talent tables.

**Definition-of-done loop VERIFIED LIVE**: unlocked the heroic pack, opened Know Your Moment's Events tab in the UI, edited Bonus amount 2→3 in the rule dialog, ⟳ Sync, started combat → actor showed +3 (phy 14→17); reverted to 2 the same way. No code/side-file edits.

**Blocker 1 RESOLVED — native damage-trigger dispatch WORKS (cosmere-rpg v2.1.0).** The 2026-06-08b "edha-deal-damage / edha-on-defeat never fire" finding was caused by **stale owned snapshots**: the talents on the test actor carried ZERO native rules (never re-synced after the events migration), so there was nothing for the engine to fire. After `⟳ Sync`, Arc Flash's own on-talent rule fires natively off `cosmere-rpg.damageRoll` — watched live. Two engine details discovered:
- the system fires the `damageRoll` hook **TWICE per rollDamage (main roll + graze roll)** → the `edha-deal-damage` event type has a 400 ms per-item **debounce in its `condition`** so one logical hit dispatches once;
- the energy-only filter (formerly `when.damageType` in the side-file) is now a **`whenDamageType` field on the rule** (editable; the executor checks it against the triggering roll's damage type).
The old runtime workaround (legacy dispatcher reading talent-triggers.json, no-op native executor) is **REMOVED**; the native `edha-triggered-effect` executor is the real implementation (optional-cost rules post the chat-card button; unconditional rules fire immediately; `edha-on-defeat` passes the victim via `event.options.victim`).

**Blocker 2 RESOLVED — on-talent ActiveEffects survive the compendium.** Root cause (the `_stats` theory was wrong): **Foundry LevelDB packs store embedded ActiveEffects as SEPARATE `!items.effects!<itemId>.<effectId>` keys, with the parent item's `effects` field holding only ID strings** (verified against the system's own heroic-paths pack). The old build baked full effect objects inline in the item doc, which Foundry silently ignores on load. `writePack()` now does the split (and `edha-pack-io.js#readPack` reassembles them for fingerprints/extract). Verified live: Walking Ruin loads from the pack with `effects.size=1`, shows "Walking Ruin — Speed" on its Effects tab, and applies on a character (Speed 30→40; `CONFIG.ActiveEffect.legacyTransferral=false` means transfer:true item effects apply to the actor directly).

**Point-targeted bursts — now rule-driven.** The burst CONFIG lives in an **`edha-burst` rule on the talent** (event `edha-pre-use`, a sentinel type: never dispatched; the engine reads it). Fields (all editable on the Events tab): sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain. Engine glue unchanged: `cosmere-rpg.preUseItem` takeover (returning `false` cancels the default `use()`) → consume cost → range ring + **click-to-place** template (`edhaPickPoint` reads `canvas.mousePosition`, grid-snapped) → chat **Detonate** button captures everyone inside, auto-rolls saves for half, applies (GM-direct or socket relay), drops terrain. Damage formula+type still read from the talent's own `system.damage`; owned riders (Kindle) still added. Verified live on Flame Surge (cast → ring 60 ft → place 10 ft burst → Detonate resolves). **`preUseItem` takeover remains THE pattern for any talent that doesn't fit the single-target attack card.**

**Player-accessible writes via a GM SOCKET RELAY (unchanged).** applyDamage on GM-owned enemies + Region terrain + token light + actor effects all need GM perms. The burst Detonate resolves rolls on the clicking client then relays the privileged writes to the **primary active GM** (`game.socket.on("module.edha-content")`, gated `game.users.activeGM.isSelf`, applier `edhaApplyBurstResults`). Required **`"socket": true` in module.json → a world RELAUNCH**, not just F5. **LESSON: any mechanic that writes to GM-owned docs must run GM-side; for player actions, relay through this socket.**

**Kindle light & defense buffs — now rule-driven:**
- **Kindle light** — config is the **`lightRadiusFt` field on Kindle's own `edha-damage-rider` rule** (0 = none). The `applyDamage` wrapper reads owned rider rules to decide light; source attribution unchanged (explicit `options.edhaSource` from bursts → `originatingItem` → recent damage-roll breadcrumb → killer-candidate heuristic); clears on `deleteCombat` / `edha.clearKindleLights()`. Verified live (token light dim=5/bright=2.5).
- **Defense buffs / Know Your Moment** — the **`edha-defense-buff` rule on the talent** (event `edha-combat-timing`, a sentinel) holds amount/defenses/window/label/img. Engine: defenses are `DerivedValueField` (`value = base + bonus`) → toggled ActiveEffect on `system.defenses.*.bonus`; the cosmere system has NO turn hooks → Foundry **core** combat hooks (`combatStart`/`combatTurnChange`/`deleteCombat`) call `edhaRefreshDefBuffs`, which recomputes every combatant from initiative order and reads the rule from owned talents. Verified live (14→16 before turn, removed on turn; +3 after the UI edit).

**⟳ Sync rewritten (2026-06-09) — replace-not-merge + identity matching:**
- Item updates MERGE `system.events`, so stale rules lingered forever; sync now emits a **`-=<ruleId>: null` deletion** for every existing rule the pack source no longer carries, and **prunes stale embedded effects** (delete-by-id after update). Owned talents end up EXACTLY mirroring their pack source (rules + effects).
- **28 talent names collide across trees** (365 talents → 337 unique names), so name-only matching is ambiguous; sync matches by **`atlas|group|name`** (from `flags.edha-content`) with plain-name fallback.
- **Caveat:** calling sync within ~seconds of a pack write (editing a pack item, lock/unlock) can update fewer talents than expected (`pack.getDocuments()` returns a partial set mid-reindex; a retry guard exists but isn't bulletproof). Sync is idempotent — **run it again**; verify with the rule-id checker if paranoid.

**Robustness checklist (every one of these bit us — apply everywhere):** gate GM-side writes to ONE GM (`activeGM.isSelf`); make handlers **idempotent** (claim/delete state at the top before any `await`); **existence-check before `.delete()` and `.catch()` the async** (a caught promise does NOT suppress Foundry's red "X does not exist!" toast); bind chat buttons on **`renderChatMessageHTML` ONLY** (the deprecated `renderChatMessage` ALSO fires in v13 → double-bind → double-fire/double-damage); **never assign a `DerivedValueField.value`** (getter-only → TypeError; use `.bonus`/`.override`).

**LESSON — read the schema before building.** Confirming `value=base+bonus` (defenses), `DamageType.Healing="heal"`, `canvas.mousePosition` (a live world-coord PIXI.Point), and that the combat hooks exist — all up front — avoided guesswork each time. Grep the system/core source first.

**Verified live 2026-06-09 (all from on-talent rules/effects, legacy store deleted):** Arc Flash (native dispatch off Searing Bolt, energy filter, one card, graze-debounced), Kindle (+Red-mod rider in the damage formula AND 5 ft token light), Walking Ruin (+10 ft Speed AE survives pack load, visible on Effects tab, applies on add), Know Your Moment (+2 → UI-edited +3 → reverted; round-until-turn toggling), Flame Surge (rule-driven burst: cost, 60 ft ring, click-place, Detonate), Death Ward (use→edha-temp-hp rule present), ⟳ Sync exact-mirror verification across all 4 characters (37/37 talents, 0 mismatches).

**Prior 2026-06-08b playtest (engine glue still identical):** Pyre (attack + terrain), Set Charge, Mending Aura, Thorn Field, socket relay, Temp HP absorption, summons.

---

### Architecture reference (registrations & key findings — current as of 2026-06-09)

Talent behaviors run through the cosmere-rpg event engine, hosted on the talent (`system.events`, Events tab); passive buffs are native ActiveEffects (Effects tab); rolls stay on DETAILS. The generator emits these from the §5 tables; ⟳ Sync mirrors them onto owned talents. 24 talents currently carry rules (coverage grows by adding table entries + rebuild — §9).

### Registered in `register-skills.js` at `setup` (`edhaRegisterNativeEventSystem()`)
- **Custom EVENT types** (`cosmereRPG.api.registerItemEventType`):
  - `edha-deal-damage` — hook `cosmere-rpg.damageRoll`; `condition` = 400 ms per-item debounce (the hook fires twice per roll: main + graze) + src.actor check; `transform:(roll,src)=>({document: src?.actor ?? src, options:{roll, sourceItem:src}})`. Returning the **actor** fans the rule out across ALL the owner's items, so e.g. Arc Flash's rule fires when Searing Bolt rolls. **VERIFIED FIRING on v2.1.0** (the 06-08b "doesn't fire" was unsynced snapshot talents).
  - `edha-on-defeat` — hook `cosmere-rpg.applyDamage`; `condition`: dealt > 0, victim HP ≤ 0, not re-entrant from a trigger; `transform` resolves the presumed **killer** (controlled token / current combatant / `user.character`) → `{document: killer, options:{victim}}`. (Chain Detonation, Necrotic Cascade, Predator's Due.)
  - `edha-pre-deal-damage` — sentinel (never fired); marker for damage riders, applied by the `rollDamage` wrapper reading the `edha-damage-rider` rule.
  - `edha-pre-use` — sentinel; marker for `edha-burst` rules, read by the `preUseItem` takeover.
  - `edha-combat-timing` — sentinel; marker for `edha-defense-buff` rules, read by the core combat hooks.
- **Custom HANDLER types** (`registerItemEventHandlerType`): `edha-triggered-effect` (**whenDamageType**, kind=damage|damage-aoe|heal|thp|affliction, formula, damageType, target, radius, resourceGain, cost+optional, oncePerRound, note — REAL executor: optional-cost → chat-card button, else immediate fire), `edha-damage-rider` (appliesTo, bonusFormula, **lightRadiusFt**), `edha-burst` (sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain — config-only), `edha-defense-buff` (amount, defenses, window, label, img — config-only), `edha-aoe-template` (sizeByRank/sizeFt, affects, color), `edha-place-hazard` (sizeByRank/sizeFt, damageFormula, damageType, color), `edha-temp-hp` (formula, target), `edha-summon` (statblock fields). Executors REUSE the shared helpers (edhaFireTrigger/edhaRunTriggerEffect/edhaPlaceAoe/edhaWriteTempHp/edhaSummon/edhaPlaceHazard). `edha.summon(actor, talentName)` now reads the talent's own edha-summon rule.
- **Region behaviour** `edha-content.hazard` (`foundry.data.regionBehaviors.RegionBehaviorType`), declared in `module.json` `documentTypes.RegionBehavior.hazard` and registered into `CONFIG.RegionBehavior.dataModels`/`typeLabels`. Subscribes to `tokenEnter` + `tokenTurnStart` and auto-applies its baked damage to the entering token's actor (GM-side). This is the "dangerous terrain" ongoing effect.
- **Added since 2026-06-09 (this list is not exhaustive — the live registry is the `console.log` at the end of `edhaRegisterNativeEventSystem()`):** v3 (06-11b) — events `edha-take-damage`, `edha-apply-watch`; handlers `edha-apply-status`, `edha-status-sweep`, `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit`. 06-13b — event `edha-on-hit` (true hit; dispatched by the applyDamage wrapper) + `edha-pre-test`; handlers `edha-test-rider`, `edha-ritual-hp-cost`, `edha-heal-cut`; `whenTargetStatus` on `edha-triggered-effect`; plus the affliction-damage, Reserve, Blood-Price-advantage, and `{weakened,immobilized}` timed-expiry engines. **Full per-tool detail = the 06-13b delta at the top.**

### Key findings (verified in the core/system source — don't re-derive)
- **Handler config UI auto-renders — NO `.hbs` needed.** `configRenderer` is null when no `render`/`template` is given (index.js ~L12507); the rule editor then runs `{{#if shouldAutoPopulateConfigFields}}{{formGroup}}` per schema field (`templates/item/dialog/edit-event-rule.hbs`). So a handler just needs `config.schema` (labelled DataFields) + `executor`.
- **Registration MUST be at `setup`.** The system wires `Hooks.on(hook,…)` for each event type once, at its own `ready` (index.js ~L11975), reading `CONFIG.COSMERE.items.events.types`. Register custom types BEFORE that or their hooks never subscribe.
- **Dispatch fan-out** (index.js ~L11987): the fired hook's `transform` returns a `document`; if it's an **Actor**, the engine evaluates event rules on EVERY item the actor owns; if an Item, just that item. `host` defaults to `"source"` (runs on the triggering client); `"gm"`/`"owner"` also exist.
- **Roll source:** `damageRoll()`/`preDamageRoll` fire `(roll, config.data.source, config)` and `config.data.source` is the rolling **Item** (index.js ~L7484).
- **Talents support events:** `TalentItemDataModel` mixes in `EventsItemMixin()` (index.js ~L26970); `action`/`trait` items too. Rule shape mirrors the proven `pathEvents()` in foundry-build.js: `{ id, description, event, handler:{ type, …flatConfigFields } }`.

### Coexistence — OVER (2026-06-09)
All legacy dispatchers, table loaders, and `edhaIsMigrated` guards are **deleted** from register-skills.js. The shared helpers remain only as implementations the native executors call. All four world characters were re-synced and verified to exactly mirror their pack sources.

### Build (now portable)
`foundry-build.js` + `edha-pack-io.js` resolve classic-level from Foundry's bundle OR plain `require("classic-level")` (NODE_PATH supported), and honor `EDHA_DATA` / `EDHA_MODROOT` env overrides — so the build can run off-machine against mounted folders. `_stats.systemVersion` stamps 2.1.0. The unextracted-edits guard tolerates an unreadable pack (warns + skips instead of crashing). Latest full build: talents:365, events:24, effects:1.

### RESOLVED (2026-06-09) — ActiveEffects formerly stripped on compendium load
Root cause: Foundry LevelDB packs store embedded effects as separate `!items.effects!<itemId>.<effectId>` keys with ID-string references on the parent item; inline effect objects are silently ignored on load. `writePack()` now performs that split and `readPack()` reassembles. Walking Ruin's +Speed is live from the pack (Effects tab + applies on actors).

---

## 8. Current content state

- **5 packs built & validated (0 issues)** — counts re-measured from a real all-scope build 2026-07-24: edha-leyline (125 talents/5 trees/5 paths + Draw Mana action), edha-deity (90/10/10), edha-heroic (150/6/6), edha-adversaries (**52 actors / 336 embedded items**, of which 59 are tree-talent embeds), edha-items (113 docs). 365 talents, 325 edges, 242 skill prereqs, 89 rollable.
- **Native Event/Effect system PARTIAL — see §7.-1 (corrected 2026-07-24):** behavior is NOT read exclusively from `system.events` + `effects`. Measured: **80 talents carry behaviour on the document, 210 are name-keyed in `register-skills.js`, 75 have neither.** The old claim here ("coverage grows tree-by-tree, counts climb each pass") was the opposite of what happened — every tree wired after 2026-06-09 went name-keyed, so document coverage *fell* as content grew. Generator-side counts at build time are events 37 / effects 14 before the authored overlay is applied. Run `node scripts/inspect-pack.js <pack> --group <Tree>` for the current state of any tree.
- **⚠️ KNOWN BUG (2026-07-24, unfixed at time of writing): the authored overlay destroys generated behaviour on 10 talents.** `applyAuthorable` writes any authored key that is not `null`/`undefined`, and most authored entries carry `"events": {}` — an empty object, which passes that test and overwrites the generator's rules. Proven by an A/B build (overlay on vs. off): White/Guardian Stance, Green/Thorn Field, Order/Shoulder the Oath, Civilization/Lay Foundation, Death/Death Ward, Death/Necrotic Cascade, Destruction/Set Charge, Destruction/Fault Line, Power/Warlord's Advance, Power/Investiture of Command. Each has working side-table behaviour that never reaches the pack.
- **Roll data: 90 rollable.** Deity convention: color-keyed `[Tier][Die] = (@tier)d(2*@skills.<color>.rank+2)`, Option-B `+ @attr.<id>` preserved; heals = `heal` type. Skill ids: …/`lea` (Leadership)/`prc` (Perception)/… (NOT lead/per).
- **Triggers** (talent-triggers.json → native edha-triggered-effect): Arc Flash, Afterburn, Chain Detonation, Necrotic Cascade, Predator's Due. Optional-cost prompts use a **chat-card button** (not a dialog). Once-per-round (combat) via `flags.edha-content.trigRound`.
- **Temp HP, Summons, Targeting (range ring + AoE), Dangerous Terrain (Region), Draw Mana** (one universal `action`, granted via every leyline path), **Investiture derivation = `2 + max(AWA, PRE)`** (canon; character actors), **defeated-skull overlay tied to HP**, **always-on adversary health bars**.
- **Chaos resource renamed Fracture → Omen** (domain.json; flavor line kept; "Spreading Fracture"→"Spreading Omen").

### 8a. Playtest PCs (built 2026-06-10 from the May-17 reference sheets; `scripts/playtest-setup-console.js` is the idempotent rebuilder)

All four are L7/T2, 12/12 talents, stats sheet-matched (HP/inv/movement; focus = sheet + Tier where Composed applies — the sheets don't compute talent effects):
- **The Demolisher** (Scholar/Red/Razkael) — THE MODEL. Roster corrected: −Know Your Moment (not on sheet), +Composed (a CROSS-TREE pick — Composed only exists in heroic/Envoy), +Set Charge. Verified: native Arc Flash trigger, Kindle rider+light, rule-driven bursts, Pyre hazard.
- **The Forgemaster** (Leader/White/Kethane) — Composed (+2 foc) + Customary Garb (+2 PHY/SPI → 16/19) live; Guardian Stance +1 Deflect baked toggled-OFF (conditional); Draw Mana granted (was missing); **Forge Construct** verified: HP [Tier][d8-white]+4, deflect 1 (new summon-rule field), defenses = caster−2 incl. Garb. Manual: Lay Foundation/Siege Form/Trade Routes/Through the Fray/Guiding Signal/Concordant Presence.
- **The Outlaw** (Warrior/Black/Tyrith) — created. Tyrith rolls fixed red→**black** d8 (sheet's die). Black Draw Mana fires (Weakened = manual note). Manual: stances, Isolated-state mechanics (Sapping Hex/Severance), Spoils THP, Warlord's on-kill THP.
- **The Vivisectionist** (Scholar/Green/Anaveth) — created. Collected (+2 COG/SPI → 18/17) live; heal rolls verified (Verdant Mend [Tier][d8-green]+mod); Green Draw Mana terrain. Manual: Diagnosed-state mechanics (Prognosis/Vital Diagnosis), Life Surge overflow-THP, Field Medicine resolution.

### 8b. Playtest-1 prep (2026-06-10b) — adversary automation, balance pass, world setup

**Adversary action automation — lives on the WORLD actors, NOT the pack.** All 18 placed adversaries (Edha Adversaries folder; duplicates are separate actor docs — every copy was updated) got hand-created ActiveEffects on their items via console, following the PC-talent conventions (`Item — Thing` naming, transfer:true, conditional = baked toggled-off):

- **Mechanical:** Stitchmother **Phase 2 — Transformed** (toggled-off; `hea.max.bonus +20`, `attributes.str/spd.bonus +1`; heal-to-90 / +2 Vital / 2d6 regen stay manual per the description, verified 140→160 max while at 140). **Vital Diagram — Marked** apply-template implements the Deflect bypass on the victim (`deflect.useOverride=true` + `deflect.override=0`, OVERRIDE mode; +4 Vital stays manual; verified apply/restore on a PC).
- **Apply-to-target templates** (transfer:false, drag from the item onto the target's sheet): Frost Lance→**Slowed** (`statuses:["slowed"]`, 1 round), Venom Slam→**Afflicted** (`statuses:["afflicted"]`), Suture Cradle→Cradled, Bite→sheds-light, Probability Net (−1d6 next test), Calc Strike (+3 one test).
- **Trackers** (no engine key exists for advantage/disadvantage — token-icon reminders only): Brace (Captain 2-dis / Troopers 1-dis, 1-round duration), Glimpse the Path, Fade/Veil concealment (Stalkers), Bone Spurs / Venom Glands (Thralls, toggled-off), always-on icons for Predictive Ward + Cinder Coat.
- **NOT in source/pack:** `adversaries.json` and the edha-adversaries pack were untouched — re-importing actors from the pack loses all of the above. To make permanent, port these into generator inputs (adversary analogue of talent-effects.json) + rebuild.

**Balance pass (PC damage die = 2d8 — T2, leyline rank 3 across all four PCs):**
- Flame Surge does **NOT** one-shot Troopers (avg 9 − Deflect 1 into 14 HP; ~5% outright kill per failed save; saves are Athletics +0 vs Red +5, so most fail). No minion HP changes made.
- **FIXED: The Outlaw had NO weapon items at all** (Vivisectionist none either) — Warlord's Advance / Momentum of Victory were dead. Added **Longsword** (1d8 keen, equipped, + `weapon:longsword` expertise entry) and **Staff** (1d6 impact, equipped) from `cosmere-rpg.items`.
- Adversary defensive skills were all +0 → set ranks: **Stitchmother dis 5** (Suture Cradle concentration DC 10+dmg now holds ~55% vs a typical hit), **Troopers dis 2** (rout DC 13), **Captain ath 2**.
- **Stitchmother HP 140→120** (`hea.max.override`; Phase-2 below-70 trigger and heal-to-90 unchanged) — keeps the boss in the 4–6-round band vs party net DPS.
- **Playtest-1 watchpoints:** Captain Deflect 4 vs the party's small dice (deliberate — Ben wants him to be "a real test"; if it slogs, drop to 3). Boss net-DPS margin with the Discipline buff.

**World/session setup:** Playtest Map **activated** (was the default splash scene — players would have landed there). PC Investiture topped up. Stale test combat + 2 stray Demolisher tokens removed. **JournalEntry "Playtest Dungeon — Room Guide"** created (6 pages: read-aloud blockquote + adversary visual descriptors + terrain + run notes per room), built from the May Dungeon Reference PDF with deltas: **Living Lock CUT** (Room 1 vault door opens via Crafting/Lore DC 16 or Athletics DC 18 only), **Room 4 rewritten to match the map** (poison lake centerpiece + BOTH Frostbinders sniping from the balcony, Stalkers on the shore; suggested lake ruling: 2d6 Vital/round immersed, Athletics DC 14 out), **Room 6 = 3 Thralls** (map count, not the sheet's 2). Player users **Amertron / Laustarr / Spidercam** created with passwords; internet invite verified working (AT&T BGW NAT/Gaming forward TCP 30000 → gotcha: the gateway bound the rule to a STALE duplicate device entry for the same hostname; re-pointing at the live 192.168.1.247 entry fixed it). Remaining manual step if not yet done: per-PC **Ownership → Owner** + User Configuration character assignment (3 users / 4 PCs — Forgemaster is the natural GM-run spare).

**Console-operator notes (this session):**
- Creating an item-embedded ActiveEffect **with `statuses` in the create call throws** `Cannot read properties of null (reading 'startsWith')` (cosmere-rpg v2.1.0 / Foundry v13.351). Workaround: create without `statuses`, then `effect.update({statuses:[...]})`.
- DevTools `copy()` is **undefined inside async/promise contexts** — stash results on `window._r`, then `copy(window._r)` as a second synchronous command.
- Beware shell→clipboard quoting: escaped `\'` inside single-quoted JS arrived as `\\'` and produced a silent SyntaxError (script no-ops, stale `window._r` masks it). Prefer double-quoted JS strings with plain apostrophes.

## 9. Engine backlog — CANONICAL (consolidated 2026-07-03c; §9a/§9b BUILT 2026-07-04)

**This section is the single source of truth for the engine backlog.** The tree-by-tree wiring loop is
DONE (all 15 trees) AND the buildable backlog is BUILT (07-04: all 5 shared primitives + all 6
tree-local hooks — see the 07-04 delta and §9g). The per-tree "Hooks/tools still to build" / "since
built" / "Truly manual" lists in each `register-skills.js` section header stay — they are load-bearing
(audit.py's silent-card check reads ENGINE + DOCS mentions, and the "named, not dropped" convention
documents each tree in place) — but for anything SHARED across trees, THIS is the canonical entry.
What remains below is exclusively non-buildable-from-here: **blocked-on-system → bench-gated →
manual-by-design → post-playtest balance**. (Deploy + the bench pass are separate outstanding work —
see the top of `EDHA_FOUNDRY_TEST_CHECKLIST.md`, incl. the new "Engine backlog pass" bench section.)

### 9a. Shared primitives — **EMPTY (all 5 built 2026-07-04 → §9g)**

### 9b. Tree-local hooks — **EMPTY (all 6 built 2026-07-04 → §9g)**
(The one standing note kept from the old 9b: Green Territory / Bone Garden difficult terrain is
all-comers BY DESIGN, verified against the card text — do NOT "fix" it with the Civ enemy-cost type.)

### 9c. Blocked on the cosmere system / Foundry (tracked, not buildable now)
- [ ] **Test DCs aren't exposed** — Foundry skill tests carry no DC, so a failed NON-attack test can't be
  auto-detected. Forces the owner-click card on: **Sovereignty** Expose (non-attack tests), **Power**
  Crown of Thorns (tests the engine didn't itself resolve), **White/Coordination** Concordant/Shared
  "success" judgments. One shared blocker.
- [ ] **Items don't expose their target defense** — hit-detection can only read Physical (**Sovereignty**
  Expose / Balance / Edict-of-the-Fallen THP watchers); attacks vs Cog/Spi defenses don't auto-resolve.
- [ ] **No reach field** — **Civ** Colossus "reach 10 ft" is card-noted (no cosmere system support).
- [ ] **Structures/objects have no actor** — **Destruction** Fault Line "×3 vs structures" (Constructs ARE
  wired); any "damage a wall/object" clause. Needs object damage targets.

### 9d. Bench-gated (a fallback is already named; fires only if the bench pass fails)
- [ ] **Power — Mantle +1 injector** vs `configureModifiers`/dialog rebuilds → AE fallback if the appended
  NumericTerm is wiped.
- [ ] **Power — move-through watcher** waypointed-drag sampling (one straight segment per `updateToken`).
- [ ] **Knowledge — the `insight` `effect.system.count` field name** (best-guess; one-line swap if the real
  schema field is `stacks`/`value`/`amount`).

### 9e. Manual-by-design (NOT backlog — declared in the tree headers; RE-RULED item-by-item by Ben 2026-07-16, the manual-inventory pass)
Forced volition ACTION choice (Absolute Authority / Hollow Command / Puppeteer / Incite / Edict
declarations beyond the three canonical prohibitions — Ben D10: stays manual; **Kneel's MOVEMENT
half was carved out and ENFORCED 07-16c**, Ben D11); "willing" consent (owner-judged — Ben D14:
stays); the one-turn-generous timed-status convention; Speak with the Fallen's Q&A;
**Reserve SPENDING + Double Dip's HP-substitution** (Scope-A, 06-13b). **No-AI-intent** (Fate Read
the Threads / Order Lawkeeper's Eye intent-reveal) — reconfirmed by Ben 2026-07-16 (C): an NPC's
intended action is not data anywhere in Foundry. Blue Foresight's cluster (Forewarned / Telepathic
Network / Probable Outcome) — reconfirmed manual (Ben F). **Calculated Patience LEFT this list
2026-07-24y**: it was here because "there's no fast/slow-turn hook", and the pre-roll rider pipeline
had been reading turnSpeed for `whenFastTurn` all along — a worked example of why iron rule 3 says to
re-litigate manual every pass rather than inheriting the list. The previously-listed
Unweaving dispel + Void Sense see-through-walls are NO LONGER here — wired 07-16c (Ben E15/B5).
Action grants + trusted costs moved to §9i (Ben D12/13: flagged for the rework, not manual-forever).

### 9i. Combat/encounter engine rework (OPENED 2026-07-16 — Ben's D12/13 ruling; GATED on a design session)
- [ ] **The "trusted action-economy" rework** — one initiative, not per-talent patches: Reaction-per-round
  and extra-attack/once-per-turn cadences currently trusted (Arsenal, Bonds, Trade Routes, Momentum,
  Risen Servant, Speak with the Fallen's +2 Inv repeat), plus the Aid / forced-action grant class
  (Fate Weave the Thread / Thread of Inevitability / Ordained, Order Covenant/Concord, Sovereignty's
  reaction-denial — prompt cards today, no hook forces another creature's action). Ben: "flag it for
  the combat/encounter engine rework that's needed." ⚑ Design questions first (what does the table want
  TRACKED vs trusted?), then one coherent build — do not wire these piecemeal in test passes.

### 9f. Post-playtest-1 balance review
- [ ] **Capture playtest-1 findings against the §8b watchpoints** (Captain Deflect 4; Stitchmother
  net-DPS margin at 120 HP / dis 5; Flame Surge vs clustered minions).

### 9h. Equipment, money & items initiative (opened 2026-07-15 — directions picked by Ben; everything here is GATED, nothing buildable blind)

Ben's 2026-07-15 report: sessions and Foundry tools have **no equipment, currency, or item layer**
(adversary "weapons" are hand-shaped actions; armor/currency untouched everywhere). Direction
picks (same date): currency = **full lore-forge pass first** (W25); item source = **system pack +
small edha-items pack**; adversaries = **migrate attacks to real weapons**; money tracking =
**engine-tracked**. The session-tooling half shipped same-day (template/skills/state §1a); what
remains is Foundry-side and gated on TWO unblockers: **(1) the schema dump** —
`scripts/schema-dump-console.js`, Ben pastes into the console once, commits the output to
`source-materials/system-schemas/` (the system source is unreachable from repo sessions: proxy
blocks the public GitHub repo, add_repo is same-owner-only) — and **(2) the W25 currency canon**.

- [ ] **Fleet weapon migration** (gate: schema dump). ⚑⚑ pipe-cleaner shipped 07-15: `kind:"weapon"`
  in advItemDoc (action-shaped activation kept byte-identical — same skill_test + modifierFormula
  so PDF numbers hold; best-guess weapon fields strip harmlessly if wrong) + Corvaine Raider's
  Shortsword ONLY. After the dump verifies the DataModel: correct the field set, migrate the
  remaining attack items across all 13 statblocks (Trooper Strike → Roek's Issued Blade), decide
  per-item what stays an action (Devastating Blow/Press the Line are maneuvers, not gear).
- [~] **edha-items pack — DIRECTION SUPERSEDED 2026-07-18f (Ben: mirror-and-own, same pattern
  as the heroic copy-in), scaffold BUILT.** `data/items.json` → `edha-items` Item compendium
  (new foundry-build `items` scope + module.json pack declaration → full relaunch). Landed:
  the 12 Edha-authored items (missing kit pieces, trade tokens, the **Malcurr-Stamped Blade**
  clue weapon), priced natively in c/s/g. REMAINING (gate: the items dump —
  `scripts/items-dump-console.js`, Ben pastes + commits `source-materials/edha-items-dump.json`):
  copy the full shipped `cosmere-rpg.items` gear in, re-priced in c/s/g and curated (drop the
  Roshar-isms). The old "mundane gear keeps coming from cosmere-rpg.items" rule dies when the
  mirror lands. See §9j for the pipeline this sits in.
- [x] **Engine currency primitive — BUILT 2026-07-18e (engine-only → F5/relaunch, no rebuild).**
  `EDHA_CURRENCY` + `edhaRegisterCurrency` in `register-skills.js` (after the statuses block):
  ONE registered currency `edha` ("Edha Coin"), denominations **gold(100)/silver(10)/copper
  (base, 1)** with `g`/`s`/`c` units, array-ordered gold→silver→copper for Ben's
  big → normal → small sheet readability (ruling 54). Documented `game.system.api
  .registerCurrency` + direct `CONFIG.COSMERE.currencies` write, idempotent at load/init/setup
  (the actor DataModel derives currency fields from the registered set), ready-check log line.
  ⚑ bench rows in the checklist ("Currency wiring" section): sheet denomination ordering,
  spheres-row coexistence, pre-existing-actor backfill, icon renders. Still OPEN downstream
  (not this item): re-pricing mundane `cosmere-rpg.items` (longsword "60 mk") in c/s/g at the
  item level vs publishing a conversion line — decide with the fleet weapon migration above.
- [ ] **Armor** (gate: bench). Adversary Deflect stays the number override (already modeled —
  `source:"armor"`). PC-side: bench-check whether `cosmere-rpg.items` ships armor and whether
  equipping sets Deflect natively; if yes there is NOTHING to build, just checklist guidance.

### 9j. The player-facing pipeline → the character creator (RESCOPED 2026-07-18f — Ben; everything below is ordered, and everything is AHEAD of the creator)

Ben's frame: get ALL player-facing things ready — the creator needs the starting-kit wiring and
the heroic dedupe, ancestry is replaced by country-of-origin, and gear becomes ours. Order:

- [x] **0. Items + culture console dump script — BUILT 2026-07-18f**
  (`scripts/items-dump-console.js`, read-only paste). ⚑ **BEN: paste it once (GM, world open)
  and commit the download as `source-materials/edha-items-dump.json`** — it captures the full
  shipped gear docs, the culture/ancestry DataModel schemas + any shipped examples, and the
  expertise CONFIG. Gates items #2 and cultures #3.
- [x] **1. Heroic talent copy-in — DONE 2026-07-18f (data + build → pack rebuild + ⟳ Sync).**
  Source rule (Ben-confirmed): `cosmere-rpg.heroic-paths` ONLY — our own packs are never a
  source; the 9 leyline name-collisions excluded. 102 authored entries gained the system's real
  activation blocks (31 structured Focus consumes) + 7 tier-scaling damage formulas. The
  system's shipped AEs are ALL inert (empty changes) — skipped; our real side-table AEs kept.
  Added the two determinable passives: **Hardy** +@level max HP (mirrors the benched leyline
  AE) and **Surefooted** +10 speed. `STANCE_TALENTS` build map sets `modality:"stance"` on the
  7 stances. **The 47-talent no-source wiring backlog** (free-tier gaps — reimplemented from
  the Handbook, no automation anywhere to copy; they still roll via authored skill tests; wire
  edha-events over time, test-pass style — **Clear Mind + Focused Mind LEFT this list 07-18g**,
  wired with Composed-shape focus AEs; the STANCE STATE (enter/leave/exclusive) is engine-generic
  as of 07-18g, so the stance entries below owe only their RIDERS): Animal Bond, Baleful, Bloodstance, Clear Mind,
  Close the Case, Cutthroat Tactics, Deadly Trap, Deep Study, Efficient Engineer, Erudition,
  Experienced Trapper, Experimental Tinkering, Feral Connection, Fine Handiwork, Focused Mind,
  Foresight, Gather Evidence, Get 'Em Talking, Grand Deception, Guiding Oration, Hunter's
  Edge, Instill Confidence, Inventive Design, Lessons in Patience, Mercurial Façade, Meteoric
  Leap, Overcharge, Overwhelm with Details, Pack Hunting, Practical Demonstration, Precise
  Parry, Prized Acquisition, Protective Bond, Quick Analysis, Rallying Shout, Rumormonger,
  Set at Odds, Shard Training, Shattering Blow, Shrewd Command, Sleuth's Instincts, Sound
  Advice, Stonestance, Tactical Ploy, Watchful Eye, Well Supplied, Windstance. Plus the
  known event-class gaps on copied talents: Mighty (per-action-spent damage rider), Withering
  Retort (reaction deflect bump), Know Your Moment (round-window defenses), Surefooted's
  terrain-damage-reduction half.
- [~] **1b. The CAE wiring tranche — DETERMINISTIC HALF BUILT 07-18j** (the dump captured CAE
  v1.3.1: NO api, but the tracker is plain combatant flags — named groups). WIRED via
  `edhaCaeGrant` + the `cae-flag` GM relay: the five use-grants (Fast Talker/Quick Analysis/
  Trickster's Hand/Cautious Advance/Backstep), Through the Fray's ally reaction, Foresight +
  Sidestep combat-start grants, Tactical Ploy + Feinting Strike reaction burns — all with
  honor-system chat fallback when no combat/tracker. STILL OPEN (each needs a positional or
  cadence read the tracker doesn't carry): Combat Coordination's per-Strike free DC,
  Synchronized Assault/Turning Point multi-ally grants (GM clicks the tracker — cards name
  counts), Flame/Windstance conditional extra actions, Vigilant's cost discount, the cadence
  class (Combat Training graze / Swift Strikes / Unrelenting Salvo / Opportunist), Brace.
  (original gate text follows) (gate: the #0 paste's NEW CAE capture — Ben 07-18:
  **Cosmere Advanced Encounters is installed**, per-combatant action/reaction tracker; Automated
  Actions is NOT and won't be, Draw Mana covers its ground). The heroic header's CAE-NEXT class,
  by hook: [grant-action] Fast Talker/Quick Analysis/Trickster's Hand, Practical Demonstration/
  Sage Counsel/Sound Advice, Backstep, Combat Coordination, Synchronized Assault + Turning
  Point's grants, Flame/Windstance extra actions, Cautious Advance; [grant-reaction] Foresight,
  Sidestep, Through the Fray; [burn-reaction] Tactical Ploy/Feinting Strike's reaction-loss,
  Resolute Stand; [cost-discount] Vigilant Stance, Stonestance's attack tax; [cadence] Combat
  Training's free graze, Swift Strikes, Unrelenting Salvo, Opportunist's once-per-round. Also
  re-litigate Brace (Defensive Position/Formation Drills) against what CAE exposes.
- [x] **2. edha-items mirror — DONE 07-18j** (89 shipped items as rawSystem passthrough,
  re-priced at 3 mk = 10 c; the 30 isMoney sphere/gem loot EXCLUDED — edha currency replaces
  Roshar money; 13 Roshar-flavored entries in `data/items.json` `_meta._review` for Ben to
  prune/re-flavor; pack now 102 items). The old "gate: the #0 paste" is cleared. Copy the shipped gear into
  `data/items.json` re-priced in c/s/g, curate out Roshar-isms, decide per-item what Edha
  keeps. The scaffold + Edha-authored items are BUILT (see §9h) — this is the fill.
- [x] **3. Country-of-origin culture items — DONE 07-18k** (the full lore-forge Phase-3 walk,
  four sections approved in order; rulings 60–61). `data/cultures.json` (NEW authored source)
  → ten native `culture`-type items + the trivial Human ancestry in edha-items
  (Cultures/Ancestry folders; build branch in the items scope). Frame: auto-grant
  `cultural:<nation>` + **pick 2** from the per-nation origin list via the native
  `grant-expertises` pick mode (⚑ the pick UI is UNVERIFIED in Foundry — no shipped item uses
  `pick:true`; if broken the items degrade to prose lists); Ashkar picks one other nation's
  cultural expertise + 1 road-life entry; removal strips only the cultural expertise (mirrors
  shipped cultures); flavor = primer §nations VERBATIM (a primer edit must sweep
  `data/cultures.json` — noted in its `_meta`); no language subsystem (common tongue, ruling
  61). 48 origin expertises, each derived from a named §5b custom, each carrying "As a
  character with X expertise…" mechanical text in the SR register. Bench section "Culture
  items". Deploy: `deploy-to-foundry.bat` → relaunch; no engine change; no ⟳ Sync (no owned
  copies exist yet). Icons are core-SVG placeholders (art-pass swap later).
- [x] **4. Heroic starting-kit wiring — BUILT 07-18j** (`edha.grantStartingKit(actor, path)`:
  common base + ruling-59 path packs from the edha-items compendium via the create-item relay +
  the 5-silver purse into the seeded denominations; weapon slot stays the player's ≤ 2-gold
  usable pick; ⚑ bench row). Original text: (gate: #2 — kits grant OUR items). Per-path kit
  manifests (ruling 59 / the primer text) + a GM grant flow (`edha.grantStartingKit(actor,
  path)` + a button) adding kit items, the 5-silver purse (⚑ currency field shape benches
  first), and the trade token. Compose with `create-item`; no bespoke subsystem.
- [x] **5. Character-creation menu — DONE 07-18l** (design menu walked FIRST — 8 questions,
  Ben's answers baked into the build; ENGINE + CSS only → relaunch/F5, no rebuild, no ⟳ Sync).
  `edhaCreationWizard` (`edha.creationWizard` / GM `edha.newCharacter`): welcome → country →
  heroic path (Key + kit auto) → leyline attunement (Key auto) → deity (skippable) → budget
  spend (live counter, existing gate enforces) → purse + name. Two surfaces (GM sidebar
  "＋ Edha Character" + owner sheet bar); re-run = **Start over**, a level-1 reset that keeps
  the actor's level (`edhaKeyPickAllowed` wizard window re-permits the two Keys). Rode along:
  the 07-18j kit grant NEVER created its items (docs-array double-wrap through the one-doc
  relay) — fixed + made once-only (`kitItem`/`kitPath` flags). Bench section "Character-creation
  wizard" (7 rows). THE PLAYER-FACING PIPELINE (#0–#5) IS COMPLETE — what remains player-side
  is bench passes + the §9j #1b CAE remainder. Original text: (DESIGN-GATED — questions first,
  then one coherent build). Scope: country pick (#3 culture item) → path pick → key talent +
  kit grant (#4) → leyline/deity attunement → talent-budget spend (`L+3+floor((L-1)/5)`, §9g)
  → purse form + naming (primer). Built LAST, on top of #1–#4.

### 9g. Resolved (history — detail in deltas/§7)
**The 07-04 engine-backlog pass (all of old §9a + §9b, one commit each — detail in the 07-04 delta):**
GM summon relay (`summon-actor`; spec baked owner-side); melee discriminator (`edhaAttackKind` — stamp
→ weapon `system.range` → null=owner-judged; gates Bone Spurs/Venom Glands/Withering Touch/Warlord's
Advance/Fury/Mantle); injury tool (`edhaAddInjury` + `create-item` relay; world "Injuries" RollTable >
placeholder list; Raise Dead + Apex Form wired); LOS helper (`edhaCanSee` — hidden + sight-wall ray;
Lawkeeper enforced, Packmate's Warning upgraded from manual); forced-move stamp (`options.edhaForced`;
Order move watcher skips engine pushes); Pinpoint terrain-follow (`followTokenUuid` recenter watcher);
Pyre turn-end spread (free grow-confirm card; Destruction, not Red — die-color mislabel in old 9b);
Shatter Focus auto-prompt (Omen-bearers only + per-foe-per-turn gate + Mute/re-arm); target-bound
`nextTestMod` (`targetUuid`; Warlord's survivor advantage bound); Vital Diagnosis reveal (Studied-Mark
snapshot on use); Civ enemy-cost EXPERIMENT (native-subclass, no-ship-on-failure — bench GO/NO-GO) +
the latent `fortified` module.json declaration fix.
Prior: tree-by-tree wiring loop (all 15 trees, Black 06-13 → Order 07-03b); **Blue Key Draw Mana rider** (was a
manual note → ENFORCED via `nextTestMod`, attr-gated int/wil, 07-03c); AoE/burst coverage
(`edha-burst`); Set Charge place→detonate split (06-17); the `expireAfter` timed-status convention
(disoriented/restrained/compelled/weakened/slowed, tree-wide); **Hardy** +@level max-HP AE on all three
copies (Black/White/Green); Crown of Thorns "which defense was tested" (superseded 07-02c by
`edhaCrownPing` at every engine-resolved site + the click button); Gnothis/Insight economy (07-03);
**Lay Foundation persistent friendly zone** (superseded — the 06-12 takeover + the begin-turn defense-buff
AE IS the card; the transient template entry was removed 07-02b); Momentum's Edge / Coordinated Hunt /
Fault Line ray template (all wired, not manual); compendium-effect strip; char re-sync + legacy-hook
deletion; sync-flake hardening; `edha-take-damage`; adversary-effects→generator; PC pregens ×4 (§8a);
Weakened/Diagnosed/Insight statuses; sheet derivations (HP+1 / Speed 20+5×SPD via
`edha.migrateDerivations()`); talent-budget formula ruling (`L+3+floor((L-1)/5)`=11 at L7; pregens via
`edha.skipBudget`).

## 10. Gotchas

- **Adversary art: the two extension lists must stay in lockstep** (07-15c). `sync-art.js`'s `EXTS` and `advArt()`'s probe list in `foundry-build.js` are both `["jpg","jpeg","webp","png"]`. If `sync-art` accepts an extension the build does not probe, the file COPIES, the deploy prints a SUCCESS line, and the art then silently never appears — no error anywhere. That is how `.jpeg` was broken from the pipeline's first commit. `.jpg` is the default (Procreate has no WebP export); order is precedence in `advArt()` only, so `.jpg` wins on a slug collision.
- **The deploy only sees art files present WHEN IT RUNS** (07-15c). `art: 0 copied, 0 already current` with **no IGNORED list** = it saw an empty folder (deployed too early / OneDrive still syncing). A *misnamed* file instead prints an explicit "These files were NOT installed" block. Different message, different cause — read which one you got before debugging filenames.
- **A generated-doc `--check` failure whose ONLY diff is the `@stamp` is a CRLF bug, not a stale file** (07-15c; re-pointed 07-24). All three generators (`build-dashboard.js`, `build-canon-codex.js`, `build-player-primer.js`) normalize their sources to LF before hashing — the rule was earned on the retired `build-test-sheet.js`, where they did not: Windows (CRLF working tree) and CI (LF) stamped the same checklist differently, so every Windows-side regen failed the gate with rows byte-identical. Regenerating harder never fixes that class — check whether the row hashes match first. **Any new generator must LF-normalize at the read**, or it reintroduces this.
- Custom skills must be `core:true` or they hide behind Powers.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`), or their hooks never subscribe.
- **Handler config forms AUTO-RENDER from the schema** — no `.hbs` template needed (only for fancy widgets).
- **Embedded ActiveEffects in LevelDB packs live as separate `!items.effects!<itemId>.<effectId>` keys** with ID-string refs on the parent — inline effect objects are silently dropped on load. `writePack` handles the split (FIXED 2026-06-09).
- **Dangerous-terrain Region creation is GM-side** — a player using a hazard talent gets a "GM-side" warning (same as summons). For player-initiated bursts, the Detonate relays the writes to the GM via socket (§7.0).
- **Native damage-triggered events DO fire on v2.1.0** — but ONLY on talents whose owned copies carry the rules (⟳ Sync after every rebuild!). The `damageRoll` hook fires TWICE per roll (main + graze) → the `edha-deal-damage` condition debounces 400 ms per item.
- **`edha-deal-damage` fires on the attack ROLL, not a hit** (06-13b) — cosmere rolls damage on EVERY attack, hit or miss (the GM applies on a hit). For "on hit" effects use **`edha-on-hit`**, which the `applyDamage` wrapper dispatches only when `damage.dealt > 0`. Sapping Hex + Predatory Patience were retrofitted off deal-damage for exactly this (they were weakening / refunding Investiture on whiffs).
- **Item updates MERGE `system.events`** — to remove a rule you must send `-=<ruleId>: null`; sync does this automatically. Plain re-pushing the new events object leaves stale rules in place.
- **Foundry still holds pack LevelDB handles at the SETUP screen** (post-shutdown compaction) — `game.shutDown()` is NOT always enough to rebuild; fully quit Foundry if `writePack` hits EPERM/EACCES on a pack file.
- **Bind chat-card buttons on `renderChatMessageHTML` ONLY** — the deprecated `renderChatMessage` also fires in v13, so binding both double-fires the handler (caused double-damage + double-delete). Make button handlers idempotent too.
- **Cross-client chat-card buttons must carry their payload in `data-*` attributes — NOT a client-local map** (06-14). The existing trigger/burst cards stash the spec in a JS object (`EDHA_TRIG_PENDING` etc.) keyed by a per-button id; that only works because they're posted AND clicked on the SAME client. The Coordination watcher posts cards **GM-side** but the **owner's player** clicks them → a client-local map is empty there → the click silently no-ops. Fix: embed everything the click needs in `data-edha-*` attributes (`encodeURIComponent` for names/HTML/JSON), which travel with the chat HTML to every client. Applies to ANY card posted on one client and acted on by another.
- **Existence-check a template/doc before `.delete()`** (`scene.templates.get(id)` / `doc.parent?.templates?.get(doc.id)`) — a caught promise rejection does NOT suppress Foundry's red "X does not exist!" toast.
- **Never assign a `DerivedValueField.value`** (HP/defenses/deflect/movement/inv max) — it's a getter (`value = base + bonus`); a direct set throws "only a getter". Use `.bonus` (ADD, AE-friendly) or `.override`+`.useOverride`.
- Verify every icon path exists (Windows path) — 404 = invisible node.
- Rebuild only with Foundry closed (or `game.shutDown()` to Setup); relaunch to load packs + `module.json` changes; F5 for runtime JS/JSON.
- The `connections` array (not prose prereqs) drives drawn tree edges — and is SEPARATE from a talent's Name/prereqs, so renaming a talent requires rewriting every other talent's `connections` entry that points to it.
- Embedded talents are snapshots → ⟳ Sync after a rebuild (Sync now carries events/effects).
- `applyButtonsTo` must be a targeting mode (4) for AoE Apply to hit all targets.
- For any player-decision prompt that needs canvas targeting, use a CHAT-CARD BUTTON, not a dialog (modal blocks the canvas; non-modal can hide behind sheets).
- Hand-authored `[[damage N Type]]` enrichers need a capitalized DamageType key (Energy/Impact/Keen/Spirit/Vital/Healing).
- `@attr.<id>` (wil/pre/int/str/awa/spd) is the attribute shorthand in roll formulas (value only), NOT `@attributes.x.value`.
- **Item-embedded ActiveEffects cannot be created WITH `statuses`** (`Cannot read properties of null (reading 'startsWith')`, cosmere v2.1.0/Foundry v13.351) — create the effect first, then `update({statuses:[...]})`.
