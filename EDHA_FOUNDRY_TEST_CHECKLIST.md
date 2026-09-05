# Edha — Foundry Test Checklist (Leylines: Black · White · Blue · Red · Green — Deity: Destruction · Life · Chaos · Fate · Sovereignty · Death · Civilization · Power · Knowledge · Order — ALL 15 TREES)

In-Foundry verification for every wiring pass to date. Engine detail lives in
`EDHA_FOUNDRY_HANDOFF.md` and the per-tree PR bodies. For any tree you can also generate a fresh
per-talent worklist with
`python .claude/skills/leyline-tree-authoring/audit.py <color|deity-name> --checklist`.

**Restructured 2026-07-26 (Ben's ask, after the migration deploy):** the 22 pre-migration
per-tree sections (343 rows written against the deleted name-keyed engine) and 38 superseded
rows are retired (paper trail: the 2026-07-26f handoff delta + git history), and the 29 rule-2b
pass sections are reorganized into per-TREE `# BENCH —` sections, each mapped to a pre-built
bench actor (`scripts/bench-setup-console.js`). Rows keep their historical 2b ids in the bold
label; each section's preamble names its priority rows; spot-check rows carry the collapsed
like-for-like coverage and name their source ids.

**Ben: don't read this file at the bench — open `EDHA_DASHBOARD.html` in a browser instead
(Bench tab).** Same content as a clickable sheet: Pass/Fail/Partial/Skip per row, a note box,
filters, progress counts, and a **Copy for Claude** button that produces the paste-back report.
Marks save locally in the browser and survive pulls — but the 07-26 restructure re-keyed most
rows, so pre-restructure marks are orphaned (see DEPLOY STATE).

This MD stays the agents' source of truth: agents edit here, then regenerate the dashboard with
`node scripts/build-dashboard.js` (CI fails if the two drift). Mark `[x]` here only for rows
retired for good; live testing happens on the dashboard.

## THE TWO MARKERS (re-cut 2026-07-27w — read this before flagging anything)

**⚑ — Ben's, and only Ben's.** A judgment a human at the table has to make: design, feel, balance,
or a ruling. A bench run leaves these alone.

**🤖 — needs a live Foundry table, and an agent can drive it. This is the bench queue.** It is
`bench-run`'s work, not Ben's, and it is the list a marathon burns down.

**No marker — repo-side and settled, or provable without a table.** A record, not a task.

**⚑ used to mean "could not self-verify (no Foundry here)"**, which was the same thing as "only Ben
can do this" until **2026-07-26**, when the `bench-run` skill gave agents their own Foundry client.
Nobody re-tagged, so 182 of 240 open rows carried ⚑ while only about 30 were genuinely Ben's, and a
five-run marathon skipped ~201 drivable rows on that reading. **"I could not get to it" is a 🤖, never
a ⚑.** A row an agent could not run is recorded **BLOCKED with its blocker named** and stays 🤖.

**A marker belongs on a ROW, never on a `##` header.** Six bestiary sections stamped ⚑ on the heading
and every row beneath silently inherited it (105 of 108 in one, 26 of 26 in another). Those header
markers were removed 2026-07-27w and every row in them is now marked individually.

**A row that asks Ben to DECIDE rather than TEST does not belong here at all** — it goes in
**`EDHA_RULINGS.md`**, numbered, with its recommended default and the checklist id it came from.
This file is for tests.

---

# ⚑ DEPLOY STATE (confirmed by Ben 2026-07-26 — the migration deploy is LIVE)

**What is live on Ben's machine (2026-07-26):** the full rule-2b migration (passes A→AB — all
221 talents on their own documents, ratchet 0), the pre-deploy audit fixes, and the 2bAC
Edit-Event-Rule dialog CSS fix. Evidence: Ben ran the deploy, benched day 1, and confirmed —
"I can confirm it appears the migration worked" (2026-07-26). The checklist was restructured
the same day (991 → 568 open rows; delta 2026-07-26f): the 22 legacy per-tree sections
tested the DELETED name-keyed engine and are retired; the 29 rule-2b pass sections are
reorganized into the per-tree `# BENCH —` sections below, each mapped to a bench actor from
`scripts/bench-setup-console.js`.

⚑ **Three switches Ben has not explicitly confirmed:** (1) PC "⟳ Sync Talents" after the
deploy, (2) the "⟳ Sync Adversaries from Pack" click, (3) re-dragging the 2bAB adversaries
(placed copies are frozen snapshots). Rows touching adversary rewires (2bR-17, 2bS-3, 2bZ-10,
2bAA-9, 2bJ-13/14, and the whole 2bAB block) are not trustworthy until (2)/(3) — if one fails,
confirm the sync state before reporting a bug.

⚠️ **Standing warnings:** the console macro `edha.calculatedPatience()` was retired by pass P —
a hotbar macro calling it will throw (2bP-3 tests the replacement). PC tokens are linked and
never need replacing; PCs need no ⟳ Sync unless a section says a specific pack-baked talent
changed.

📏 **HOW TO WRITE (AND READ) A BYTE-CHECK — the convention, stated once because 07-28g broke it.**
A `must NOT contain <string>` clause **always means "outside comments"**, and it must SAY so: a
fix routinely quotes the buggy code it replaced in its own explanatory docblock, so a literal
"anywhere" reading fails a *correct* deploy. That is not hypothetical — 07-28g named three
forbidden strings, two of which the shipped fix quotes at L334/L2017/L3458, and it cost bench
run 21 and a fix pass one wrong turn each before the hash settled it. Most clauses here already
said "outside comments" (lines ~124, ~147, ~190); 07-28g's was the lapse, now corrected.
**The SHA-256 of the served `register-skills.js` against `HEAD:module-src/scripts/register-skills.js`
(both CRLF-normalised) is what DECIDES.** Marker counts and string checks are corroboration; when
one disagrees with the hash, believe the hash and go find the string's line numbers.

**Marks caveat (07-26 restructure):** dashboard marks are keyed by section title + row text, so
the restructure orphaned pre-restructure marks. If day-1 marks were never pasted back, recover
them from the pre-restructure dashboard in git history before trusting the new sheet.

**✅ The 07-26l ENGINE half is LIVE (bench run 4, 2026-07-26m).** All six engine fixes were
re-tested at the table and PASSED — Whispered Doubt's drain card (canary), Puppeteer's `{name}`,
Cruel Step's straddle (plus the ⚑ near-parallel residual), Mender's ally + on-scene gates, the
heal-cut family gate, `edhaAttackKind`'s ranged stand-downs, and Tempered Edge read by NET.
Evidence per row in the 07-26m delta.

**✅ The 07-26n ENGINE half is LIVE (bench run 5, 2026-07-27a).** The fresh Bench join's served
`register-skills.js` carries `edhaOwnerListQueue`, the new `edhaIsConstruct` (`system.type` read)
and the `spec.creatureType` summon mint — and the Remains-race re-test confirmed the queue works
at the table (counts serialize, entries survive; the residual dispatch loss is a NEW defect, see
the Death section).

**✅ The 07-27b ENGINE half is LIVE (bench run 6, 2026-07-27c).** The fresh Bench join's served
`register-skills.js` carries `edhaWatchEntryLevel`, `_edhaLifeClearBusy`, `chainBounded` AND
`edhaOwnerListQueue` (byte-checked), and three of the five fixes re-tested PASS at the table
(triple-drop harvest, Adaptive Mutation's gate, Apex Form's one injury with BOTH GM clients
connected). Two re-tests STILL FAIL on the new engine — Surgical Precision (sheet fail-open +
stale-capture off-by-one) and the Chaos sweep's ledger/off-canvas halves — see their rows; both
are the next test-pass-fixes input, NOT deploy gaps. The Surgical data half stays COSMETIC only
(rule description + an explicit `def: "phy"` the engine already defaults) — it rides the
already-owed deity rebuild.

**✅ The 07-27d ENGINE half is LIVE (bench run 7, 2026-07-27e).** The fresh Bench join byte-checked
the served `register-skills.js`: `edhaSnareSpringGate` (3×), `edhaCleanseArmMode` (3×),
`_edhaCleansePending` (5×), plus `_edhaLastRoll` and the `tempHp joined 07-27d` sweep comment —
and **all FIVE re-tests PASSED at the table** (snare spring once on every one of five paths;
Surgical Precision quoting its own d20 on both paths + the cancelled-dialog case; the Chaos sweep's
ledger unset with ZERO named warns; the Weave picker as a real `<dialog>`; all three `tempHp` flags
swept). Evidence per row in the 07-27e delta. No pack rebuild was in that batch.

**✅ The 07-27f ENGINE half is LIVE (bench run 8, 2026-07-27g).** Verified the strongest way yet:
the served blob was fetched cache-busted, normalised to LF and **SHA-256'd against the repo file —
`9a5b2d4e6a23eeec25241cef3e1236ae8bfa2bf9c91c02ba7111f412014a4bc9` on both sides**, i.e. the live
engine is byte-identical to `main`. Marker counts matched exactly too (`edhaSummonSourceTalent` 4,
`edhaSkillLabel` 5, `edhaLocalizeLabel` 4, `edhaSnareSpringGate` 3, `edhaCleanseArmMode` 3,
`_edhaCleansePending` 5, `edhaWatchEntryLevel` 4, `_edhaLifeClearBusy` 4, `chainBounded` 8,
`edhaOwnerListQueue` 17). ⚠️ The run-8 prompt's "expect 3 / ~8" hint counts were WRONG — trust the
repo/live comparison, not a remembered number. **Both 07-27f fixes re-tested PASS** — the whole
Construct-consuming family against a NORMALLY forged, `summonTalent`-stamped Construct, and all seven
named raw-i18n card sites. Evidence per row in the 07-27g delta.

**⏳ The 07-27h fix is ENGINE-ONLY and needs a plain relaunch / F5 (no rebuild, no ⟳ Sync).** It moves
the whole counter economy off `system.count` — a field `ActiveEffectDataModel` does not have, so every
Insight read was 0 — onto **`system.stacks`**, plus the `placeCounter`/`placeList` gate no longer
requiring a non-zero bonus. **Byte-check after the sync:** the served `register-skills.js` must contain
`edhaEffectStacks` (2×), `"system.stacks"` (2×) and `stacks: 1` in the status registration, and must
contain **no** `system.count` outside comments. ⚠️ **Legacy Insight effects on live tokens read as 1**
(the system's own `stacks ?? 1` default), not as whatever the old card claimed — clear any leftover
Insight marker before re-testing 2bT-1/3/4/6/7/8/10.

**⏳ The 07-27h bench-script fix is NOT in the module** — `scripts/bench-setup-console.js` picked the
roster's weapons off a dead `system.range`, so `rangedW` was never assigned and **no bench PC has ever
had a ranged weapon**. Re-run the setup script (or drag a bow onto Bench — Heroic / Bench — Fate by
hand) before any rangedOnly row.

**⏳ The 07-27j ENGINE half needs a plain relaunch / F5 (no rebuild).** Three engine fixes from the
run-9 batch: the CAE grant path is serialised through `edhaOwnerListQueue` (two combat-start grants
both reach the tracker), the next-test pipeline gained a cross-path claim so one banked `either` use
cannot ride both the attack AND the damage roll, and `edhaRollOpposedSkill` learned that an
ATTRIBUTE id is a real contest id (a "tests Speed" card was rolling a bare d20). **Byte-check after
the sync:** the served `register-skills.js` must contain `edhaContestAttrFor`, `edhaNextModClaimOk`
and `edhaOwnerListQueue(c, key` (the CAE call site).

**⏳ The 07-27l fix is ENGINE-ONLY and needs ⟳ sync the module + F5 (no rebuild, no ⟳ Sync Talents).**
One site: `edhaQuarryAdvPreRoll` wrote the **number `1`** into `roll.options.advantageMode`, where the
cosmere `AdvantageMode` is a **string** enum — so `configureModifiers()` left a plain `1d20` and
quarry auto-advantage has never once applied. It also skipped the `configureDialog` wrapper, which
would have dropped even the correct value on any non-fast-forward roll. **Byte-check after the sync:**
the served `register-skills.js` must contain `_edhaQuarryAdv` (2×) and must contain **no**
`advantageMode = 1` anywhere outside comments. Un-blocks the quarry advantage row and **2bX-17**.

**⏳ NEW 2026-07-27n — the fix-pass-A ENGINE half needs ⟳ sync the module + F5 (no rebuild, no ⟳ Sync
Talents).** One fix: `edhaDispatchOnHit` decided "does this rider fire only on the talent's own hit?"
from `!!system.damage.formula` alone, which read **Shockwave Slam's COLLISION formula** as "this is my
own attack" and killed its weapon-hit trigger surface (2bA-5, open since bench run 1). The decision is
now `edhaOnHitIsItemSpecific`, taken per RULE: an explicit `whenDealer` wins, else it derives damage
formula **AND** `activation.type: "skill_test"`. **Byte-check after the sync:** the served
`register-skills.js` must contain `edhaOnHitIsItemSpecific` (2×) and `whenDealer` (3×), and must NOT
contain the old bare line `const itemSpecific = !!tal.system?.damage?.formula;`.

**⏳ NEW 2026-07-27q — the fix-pass-B ENGINE half needs ⟳ sync the module + F5 (no rebuild, no ⟳ Sync
Talents).** Three fixes, all engine-only. (1) **The cost refund raced the charge**: `use()` issues the
cost deduction as an un-awaited ABSOLUTE `actor.update` and fires the `useItem` hook that dispatches
our `use` events in the SAME tick, so `edhaRefundCost` read the pre-consume number and wrote a second
absolute value — whichever landed last won, which is why one talent failed in both directions.
`preUseItem` now snapshots the pre-cost values and the refund waits for the charge to land before it
re-reads and credits (29 call sites, ~8 of them inside the race window). (2) **Six world-writing hooks
were gated on a raw `isGM`**, so every connected GM ran them — the doubled dissipates card, a
duplicated ignite Region, a double `actor.delete()`, both barrier wall-clear doors and the
`applyButtonsTo` setting all move onto `edhaDefBuffGmGate()`. (3) **Actor deletes are TOKEN-FIRST**
via the new `edhaDeleteActorWithTokens` — Foundry never cascades actor→token, and the orphan's
leftover combatant wedges Advanced Encounters. **Byte-check after the sync:** the served
`register-skills.js` must contain `edhaAwaitCostCharged` (2×), `EDHA_PRE_COST_RES` (6×) and
`edhaDeleteActorWithTokens` (7×), and must NOT contain the line
`if (!game.user?.isGM || actor.type === "character") return;` **outside comments** (see 07-28g's
corrected clause below — "anywhere" has already failed a correct deploy once). Un-blocks **2bAA-8**'s refund
half and the three run-13 re-test rows in the player-client window section.

**⏳ NEW 2026-07-27s — the fix-pass-C ENGINE half needs ⟳ sync the module + F5 (no rebuild, no ⟳ Sync
Talents).** Two fixes, both engine-only; **nothing here rides the owed heroic build**. (1) **The two
hazard-Region placers spoke two flag vocabularies.** `edhaPlaceHazard` (the `edha-place-hazard`
handler behind **Pyre**, Walking Ruin's trail rule and Fire the Wrack) stamped a flat
`sourceOwnerUuid`, while `edhaOwnedTerrainRegions` — the membership spine behind
`edhaTokenInOwnedTerrain` (which gates the **whole** `edha-zone-react {defeat-in-zone}` ignite
sweep), `edhaEnemiesInOwnedTerrain` and Pack Sense — reads `terrain.ownerUuid`. Every Region that
handler placed was invisible to the spine, so **Combustion Chain could never fire off a Pyre zone**.
All placers now write the one nested shape and `edhaTerrainOwnerUuid` is the only reader of the flag.
(2) **A GM hand-deleting a summon's ACTOR from the sidebar** went through none of the five engine
teardown sites, so the token (and its combatant, which wedges Advanced Encounters) was orphaned; a
`deleteActor` hook scoped to engine-minted actors (`flags.edha-content.summon === true`) now sweeps
them. **Byte-check after the sync:** the served `register-skills.js` must contain
`edhaTerrainOwnerUuid` (**4×** — corrected 07-27u; the original "3×" was miscounted) and
`edhaSweepOrphanedTokens` (2×), and must contain **exactly one** `sourceOwnerUuid` outside comments
(the legacy read arm — a second one means the write came back).
✅ **All three byte-checks VERIFIED on the live module 2026-07-27u** (4 / 2 / exactly 1).
⚠️ **A Pyre / Fire-the-Wrack zone already standing on a scene when you sync is understood by the
legacy read arm, so it is not stranded** — but re-place it if you want the canonical flag on it.

**✅ 2026-07-27u — THE FIFTH BUILD IS DONE. Foundry was closed and all five packs were rebuilt.**
Sharp Eye's `activation` is `skill_test` / `prc` (it was `utility` with no skill, so the system rolled
nothing and H1 had nothing to resolve). **Verified by reading the REBUILT pack**, not inferred:
`activation.type: "skill_test"`, `activation.skill: "prc"`, both rules intact
(`SharpEyeGate0000` = `edha-def-test`, `SharpEyeReveal00` = `edha-reveal`).
**2bQ-4 and 2bD-7 are UNBLOCKED and now need a bench drive, not a deploy.**

**⏳ NEW 2026-07-27y — the marathon-3 fix-pass-A ENGINE half needs ⟳ sync the module + F5 (no
rebuild, no ⟳ Sync Talents). The pack-rebuild list stays EMPTY — nothing in this pass touches
authored data.** Three defects from bench run 16, all engine-only. (1) **The object-as-scalar
family, THREE sites not two** — cosmere exposes a dozen derived stats as DerivedValueField OBJECTS,
so `Number(x) || 0` silently yields 0: `edhaSpeedFt` (`movement.walk.rate` → every
`edha-move {byHalfSpeed}` moved **0 ft**), `edhaAmbushBeliefTest` and — the site run 16's own sweep
declared absent — `edhaPhantomBeliefSweep` (both `skills.<id>.mod` → every belief test rolled
**`1d20 + 0`**). All four object-aware readers now go through one helper, `edhaDerivedNum`.
(2) **The ambush-belief ledger was keyed by a DOTTED token uuid**, and `mergeObject` expands dotted
keys inside a flag VALUE, so the flat read never resolved — the `whenTargetFooled` rider never fired
and the once-per-scene guard never held. Keys now go through `edhaFlagKey` at the ledger boundary
(the `trigRound` once-per-round ledger too). (3) **Two `hp-below` cues on one item shared a
once-per-round slot** — `edhaPostCueCard`'s key now carries `atFraction`/`rangeFt`/`everyNRounds`.
**Byte-check after the sync** (raw counts against the served file, comments included, verified in the
repo at commit time): `register-skills.js` must contain `edhaDerivedNum` (**8×**),
`edhaFlagKey` (**9×**), `edhaAmbushMark` (2×), `edhaAmbushTested` (2×) and `edhaCueKey` (2×), and must
NOT contain `Number(foundry.utils.getProperty(actor, "system.movement.walk.rate"))` anywhere.
Un-blocks the Stillback / Wrongwake ambush-belief rows, the Fen-Heart near-zero cue, and the
half-Speed half of Unstoppable (the `edhaIsFastTurn` / `game.combat` blocker on the full Unstoppable
drive is UNCHANGED — that stays blocked while Ben's campaign combat is active).

**⏳ NEW 2026-07-28d — the marathon-3 fix-pass-C ENGINE half needs ⟳ sync the module + F5 (no
rebuild, no ⟳ Sync Talents).** ONE fix, from bench run 18: `ally-drops` GM cues fired **across the
disposition line** whenever the dropped creature had no token on canvas at sweep time (a phantom
double whose token the break handler just removed, an actor parked in the sidebar, an actor whose
token is on another scene). The side was resolved from the canvas and then gated
`disp !== undefined && …`, so an unresolvable side **skipped the same-side filter entirely** — and
the same victim skipped the **range** filter too, so a 5-ft cue fired from anywhere on the map. Both
now fail CLOSED, with `prototypeToken.disposition` as the fallback so a phantom copy still resolves
to the side of the thing it copies. **Byte-check after the sync:** the served `register-skills.js`
must contain `edhaActorSide` (**2×**) and `edhaAllyDropEligible` (**3×**), and must NOT contain
`disp !== undefined && (t.document?.disposition ?? null) !== disp` **outside comments**. Re-test row is in
`# BENCH — Engine-wide & cross-tree` → "Engine-wide fixes still unbenched"; it wants **four cells**,
two of them positive. **The pack-rebuild list stays EMPTY.**

**⏳ NEW 2026-07-28g — the fix-pass-D ENGINE half needs ⟟ sync the module + F5 (no rebuild, no ⟳ Sync
Talents).** Three engine-only fixes from bench run 20; **the pack-rebuild list stays EMPTY, and
nothing in this batch wants a data change.** (1) **An authored `0` was falsy**, so `|| <default>`
reverted it — Reknit Form's zeroed cost charged 2, and (not in the report) **four static illusions**
(Holographic Illusion, Phantom Double, The Seeming ×2) were each given a **25 ft walk speed** by
`Number(spec.speed) || 25`. (2) **A canvas+directory actor scan deduped by object identity**, so an
unlinked token's synthetic actor and its directory twin both fired — Suture Cradle rolled Discipline
twice. (3) **An authored `timed: true` never expired when the ability was used out of combat** — the
stamp is guarded on a running combat and the catch-up pass keyed on a status allowlist that
deliberately excludes `braced`, `tagged`, `unstoppable`, `compelled` and `disoriented`.
**Byte-check after the sync:** the served `register-skills.js` must contain `edhaNumOr` (**5×**),
`edhaSceneActors` (**5×**) and `edhaTimedStampPlan` (**2×**), and must NOT contain
`Number(ds.edhaCost) || 2`, `Number(spec.speed) || 25` or `holders.includes(tok.actor)`
**outside comments** — ⚠️ **corrected 2026-07-28i**: two of those three ARE present (L334, L2017,
L3458), quoted in the shipped fix's own explanatory docblocks, so the original "anywhere" wording
fails a CORRECT deploy and cost run 21 and a fix pass one wrong turn each. **The SHA-256 against
`HEAD:module-src/scripts/register-skills.js` is the check that decides**; a "must NOT contain"
line is a hint, and every one of them means *outside comments*.
Re-test rows: the Stitchmother/Trooper block in `# Adversary ability wiring` (Braced expiry — four
cells; Suture Cradle — three, one of them the three-Raiders control; Reknit — two; static illusions —
two). ⚠️ **`braced` must still NOT be in `EDHA_TIMED_STATUSES`** — the Predictive Ward control
depends on it.

**⏳ NEW 2026-07-28i — the fix-pass-E ENGINE half needs ⟳ sync the module + F5 (no rebuild, no
⟳ Sync Talents).** Four engine-only fixes from bench run 21's wizard sweep; **the pack-rebuild list
stays EMPTY — and item 2 is why it stays empty.** (1) **The wizard preview and the sheet each owned
their own copy of three derivations**, so they drifted in BOTH directions at once: Move (the sheet's
canon 20+5×SPD vs. the preview re-implementing the system's ladder) and Senses (the preview's canon
AWA table vs. a sheet the engine had never derived at all). One shared source of truth now; the +1
max health is untouched and stays R-54's call. (2) **The Edha +1 max health was UNREACHABLE** — the
system clamps every resource to its max before the module's wrapper raises that max, so a stored 14
was cut to 13 on every prepare; Finish's 13/14 was only the visible half. (3) **Path training read
`linkedSkills`, which is the wrong field** — it means the skills a path UNLOCKS, so `[]` is correct
data and **no data change was needed**; the free rank is ONE fixed skill named on each path's card,
and the wizard now calls the system's own `startingPath` macro. (4) **The country page kept a `top`
measured before its map loaded** — the map block is `display:none` until its JSON resolves, so
Foundry centred a 426 px dialog and never re-clamped once it grew to 788. A ResizeObserver now
re-clamps any wizard dialog that grows.
**Byte-check after the sync:** the served `register-skills.js` must contain `edhaWalkRateFtFromSpd`
(**5×**), `EDHA_HP_BONUS` (**7×**), `edhaParseStartingSkill` (**2×**), `edhaSkillIdFromLabel`
(**3×**) and `edhaDialogNeedsReposition` (**2×**), and must NOT contain `RATES[idx(cur.spd)]`
anywhere at all (zero occurrences, comments included) nor `linkedSkills` **outside comments**
(the four surviving mentions are all in one docblock at ~L7491–7495 explaining why the field was
the wrong one — read the byte-check convention in DEPLOY STATE above; the hash is what decides).
Re-test rows: four in `# Character-creation wizard v2`, every one carrying its paired negative —
Derived-stat preview v2 · Finish tops up to a REACHABLE max · Path training v2 · Wizard fits the
screen v2.

**⏳ NEW 2026-07-28m — the fix-pass-F ENGINE half needs ⟳ sync the module + F5 (no rebuild, no
⟳ Sync Talents).** Three engine-only fixes from bench run 23; **the pack-rebuild list stays EMPTY —
seven fix passes running.** (1) **Living Image's Pay button read `ev.currentTarget` AFTER an
`await`.** `currentTarget` is set only while an event is being dispatched, and an await ends
dispatch, so the browser had already nulled it — a guaranteed TypeError that the handler's catch
swallowed, which is why it read as a silent no-op for four runs. **The family was swept, and it is
genuinely ONE bug:** 35 occurrences on 34 lines across 33 click handlers, 33 of them capturing
synchronously and correct. (2) **A failed chat-card button now raises an error toast** instead of
writing only to the console — see R-59, the feel call is yours. (3) **Ending one combat wiped
ledgers off actors in ANOTHER** — 20 of 24 `deleteCombat` sweeps ignored the combat they were handed
and swept the world, which is how a bench combat's deletion took `lists.covenants` off an actor in
your live combat, and how `trigRound` keys reached Corvaine and Stonebound. **With one combat in play
nothing changed** (see R-58).
**Byte-check after the sync:** the served `register-skills.js` must contain `edhaCombatEndGuard`
(**21×**), `edhaStillFightingElsewhere` (**30×**) and `edhaClickFailed` (**34×**), and must NOT
contain `ev.currentTarget.dataset.item` anywhere at all (zero occurrences, comments included).
The SHA-256 against `HEAD:module-src/scripts/register-skills.js` is what decides.
Re-test rows: three in `## Re-test after the fix pass F fixes` below.

⚠️ **2026-07-28g — Sovereign of Solitude is a SYNC question, not an authoring gap.** Run 20 read
`rules = 0` and filed it as an empty item; the repo carries **four** rules on it, authored 07-26,
and the 07-27u deploy rebuilt the adversaries pack clean. Before anyone re-opens the rebuild list
over it, click **⟳ Sync Adversaries from Pack** (or re-drag the Reeve-Owl) and re-read — placed
copies are frozen snapshots. Its 2bAB-9 row now asks for the pack count AND the placed count.

⚠️ **You still owe ⟳ Sync Talents on any character you will PLAY** — an owned talent is a frozen
snapshot until you click it. The 16 bench PCs sync themselves (`bench-setup-console.js` calls
`edha.syncActorTalents`), so a bench run does not need it; your own PCs do.

Also verified on the rebuilt artifact, as the whole-pack version of lint pass 14's question:
**365 talents scanned across the three talent packs; 37 carry an `edha-def-test` rule; 0 of those
cannot roll a test.** (The 37 matches fix pass A's independent family audit. A first attempt at this
check read `rule.type` instead of `rule.handler.type` and returned a vacuous "0 of 0" — the built
shape keys `system.events` by rule id and puts the type on `handler`.)

---

## THE PACK-REBUILD LIST — run these in this order, Foundry CLOSED

**✅ All FOUR builds carried into bench run 11 are DONE and VERIFIED LIVE (2026-07-27m).** Ben ran
them; the run then read all five packs directly and confirmed each fix in place — Flamestance
`whenSkill: "inm"`, Sharp Eye `skill: "prc"`, Set at Odds / Synchronized Assault `skill: "lea"`,
Confident Command's three skills, Feinting Strike's `@skills.inm.rank`, Rallying Shout's
`@skills.lea.rank`, Mender's one-liner note + `rangeColor: "green"`, Forge Construct's
`creatureType: "Construct"`, Fellstag's Herding Antlers (2 events + `skill: "green"`) and both
bosses' Flame Surge `2d8 energy`. The 07-27h build cleanup rode along. **Nothing from that list is
still owed.**

**✅ NOTHING IS OWED. The list is empty for the first time in this project's tracked history.**

The fifth build (`foundry-build heroic`, for Sharp Eye's `activation`) ran **2026-07-27u** with
Foundry closed, as part of a full seven-step deploy: `git pull --ff-only` (already current) →
`module-src-sync status` (6 in sync, 0 hand-edited) → `push` (0 copied, engine already deployed) →
`sync-art` → **all five packs rebuilt** (leyline 136 items · deity 110 · heroic 162 ·
adversaries 52 actors / 336 embedded items · items 113) → `validate-packs` **PASSED**
(badNode/badConn/badTree/badGrant/badFolder/badPathType all 0) → `validate-adversaries` **✓ 0 issues**.

⚠️ **The two in-Foundry steps the script cannot do are still yours** when you next launch:
**⟳ Sync Talents** on any PC you will play, and — because the adversary pack was rebuilt —
**⟳ Sync Adversaries from Pack** (or re-drag placed copies; placed adversaries are frozen snapshots).

---

# BENCH — Engine-wide & cross-tree (run these FIRST — the migration premise)

Any bench actor works here; **Bench — Red** is the reference. No pack rebuild pending for this
section — but the two **2bAD** rows added 2026-07-27j need the **engine-only relaunch / F5** first
(see DEPLOY STATE); everything else is live on the current deploy. **If 2bA-7 fails, stop the whole
bench and report it** — every converted talent rides the same premise. The dialog rows (2bAC) were
the day-1 bench report, already fixed.

## The premise (stop if these fail)

**Bench run 1 (2026-07-26g): the five premise rows PASSED on the live table and are retired** —
2bA-7 (count 1→2 → two disadvantaged tests), 2bB-3 (deflect 1→2 → marker +2), 2bC-6 (opportunity
tick → Plot Die + menu), 2bP-12 (three tabs populated; sustain 2 → two Constructs), 2bA-9 (natives
ARE in both dropdowns — Reckless Momentum / Risky Behavior / Resilient Hero stay bucket 1b).
Evidence per row in the delta. **2bAC-2 retired on measured evidence at bench run 12 (2026-07-27o)** —
the small-handler case is structurally intact (see the delta); the one 2bAC row left below is a
visual-legibility judgment — still ⚑ Ben.

- [ ] ⚑ **2bAC-1 (judgment half) — do the labels read as PHRASES?** — with that same dialog open: does every label read as a phrase in 2 lines or fewer, or are some still jargon that needs re-wording? A measurement cannot answer this; you have to read them. *(Split 2026-07-27w — the geometry half is the bench row above.)*

## Migration machinery (cross-tree behaviour)

> **✅ Bench run 9 (2026-07-27i) retired seven Engine-wide rows on evidence** — **2bB-8** (neither
> Flamestance nor Vigilant Stance carries any Effect at all; the old greyed "(Active) — INDICATOR ONLY /
> Mechanics manual" effect is gone from both) · **2bE-8** (Fast Talker out of combat posted "⚡ Fast
> Talker: you gain 2 actions — Fast Talker (Spiritual tests) **(no tracker in this scene —
> honour-system)**", a plain note with no error) · **2bP-6** (Blue and Red each posted the Draw Mana
> summary card **plus** a separate Key card — "🎲 Blue Leyline Attunement: your next test — at
> advantage"; Red added its Reaction-loss card as a third) · **2bP-7** (all three unchanged: White
> "healed 8 of 10 ally(ies) 2 HP within 60 ft (visible) — skipped 2 behind a wall" **plus** the Beacon
> of Stability cleanse card; Black "Weakened on 0 of 0 enemies you can see within 60 ft" plus the
> GM-only "🕵️ full sweep for the GM: 7 enemies in range … (not shown to the player)"; Green prompted
> "Click where the 10 ft difficult-terrain square grows … Attunement Range 60 ft", placed on the click,
> and **Thorn Field still baked its hazard** — "🔥 Bench Ally — Two takes 5 keen from dangerous terrain
> (Thorn Field — Bench — Green)") · **2bQ-6** (Studied Mark's snapshot still **withholds Cognitive** —
> "defenses — Physical 14 , Spiritual 14" — with the wording unshifted; contrast Pack Share's, which
> prints all three) · **2bL-13** (combat start granted Foresight **once**, Sidestep **once**, and
> Practiced Kata entered Vigilant Stance **once** — no double grant) · **the 10 recovered talents**
> (all ten read a non-empty Events tab live: Guardian Stance 1+1 AE, Thorn Field 1, Shoulder the Oath 1,
> Lay Foundation 1, Death Ward 2, Necrotic Cascade 4, Set Charge 1, Fault Line 1, Warlord's Advance 3,
> Investiture of Command 3. ⚠️ The row's "(2 rules)" for Set Charge is stale — `deity-destruction.json`
> authors exactly one, `SetChargeZone000`, so 1 is correct).

*(**2bA-6 — the `edha-push` blank-note default** — moved to `EDHA_RULINGS.md` **R-26** on 2026-07-27w.
Every mechanical half is settled: the old talent-specific default is definitively gone, and run 12
re-drove the two secondary observations from an authored talent and proved both were artifacts of the
hand-authored probe (`bySize: true` overrides `distanceFt`, which is what "3 ft for a 5 ft rule" was
really seeing; the push direction was correct on both axes). What is left is one choice — should a
blank note read "Push", or the owning talent's name?)*

- [ ] ⚑ **2bM-1 — ⚠️⚠️ H3 ordering (any ledger)** — as a PLAYER, with **no GM connected**, use **Covenant** on an ally you don't own → It refuses with "a GM must be online… nothing placed" and **no half-formed pact is left behind**. Before the fix the entry was written anyway and then hidden for ever. If a GM is always online at your table, skip — this cannot bite you.
      ⛔ **BLOCKER (2026-07-27w): needs ZERO GM clients connected, and the bench joins as a GM.** So it is not simply a Ben row — it is **conditionally agent-drivable**: in a window where your own Gamemaster client is CLOSED and the agent joins only as `PlayerBench`, a bench run can drive it. Until such a window is arranged it stays ⚑.
*(**2bL-14** — Bear Witness mid-combat reload — and **2bE-9** — adversary widening — both RETIRED on evidence
2026-07-28l, bench run 23. Evidence in the delta.)*

## Engine-wide fixes still unbenched (pre-migration survivors)

**Bench run 4 (2026-07-26m): the melee-discriminator row is RETIRED** — `edhaAttackKind` now reads
`system.attack.type`: a weapon set to `"ranged"` skipped Warlord's Advance's rider AND left the arm
armed; blanking the field (schema re-initialises to `"melee"`) fired "+4 impact strike" and consumed
it; Withering Touch's ranged half behaved identically. Evidence in the 07-26m delta.

- [ ] ⚑ **GM summon relay** — as a PLAYER without actor-create: Phantom Barricade / Risen Servant /
      Forge Construct produce a real token via the GM client; you can move it and use its attack;
      `actsAfterCaster` puts it on the caster's initiative. No GM online → the old warn.
      *(2026-07-27p bench run 13 — **PARTIAL, and the blocker is a world setting, not the code.**
      Forge Construct cast by `PlayerBench` produced a real Combat Construct: player-owned, moved by
      the player (`_source.x` 5400→5700), and **Construct Slam rolled a real Athletics skill test +
      damage from the player's own client**. It was added to the combat tracker. But the two clauses
      the row is actually about are BOTH unverifiable here: (a) the `summon-actor` relay branch is
      **unreachable** — `game.user.can("ACTOR_CREATE")` is **true** for the PLAYER role in this world,
      so `edhaSummon` took the direct `edhaSummonCreateGM` path on the player's own client; the relay
      needs the permission revoked, which is a world-settings change a bench run must not make.
      (b) `actsAfterCaster`'s initiative copy **cannot be read**: with Advanced Encounters active NO
      combatant stores a raw initiative — `_source.initiative` is `undefined` for every combatant
      including the caster, and the visible numbers come from AE's derived getter. ⚑ Ben: decide
      whether PLAYER should keep ACTOR_CREATE at all — if it keeps it, the relay is dead code at
      your table and this row can never run as written.)*
      ⛔ **BLOCKER (2026-07-27w): gated on a RULING, not on effort** — `EDHA_RULINGS.md` R-1
      ("should the PLAYER role keep `ACTOR_CREATE`?"). Answer that and the row either becomes 🤖
      (permission revoked → the relay branch is reachable and a bench run can drive it) or gets
      retired outright (permission kept → the relay is dead code at this table). A bench run must
      not change world settings to force it.
*(**Injury tool** — RETIRED IN FULL on evidence 2026-07-28l, bench run 23. Raise Dead passed at run 4
(2bW-9), Apex Form at run 6 (2bW-13), and run 23 drove the last clause — the world-RollTable
precedence — as a positive/negative pair. ⚠️ **One correction worth keeping: the "placeholder list" is
already unreachable on Ben's install.** `edhaFindInjuryTable` matches `/injur/i`, and the
`cosmere-rpg.tables` pack ships **"Injury Effects"** and **"Injury Duration"**, so the pack table wins
long before the built-in fallback. The row's real question — does a WORLD table outrank that — is
answered yes, because world tables are searched first. Evidence in the delta.)*
*(**Formula bar** and **Flame Surge / burst cards** — BOTH RETIRED on evidence 2026-09-05, bench run 26.
**Formula bar**: Bench — Red's advantage roll (armed by Flashpoint, no Temporary Bonus typed — the field
read `value=""`) rendered `.dice-formula` as exactly `"2d20kh + 5"` in the chat DOM, and the Roll's own
`formula` was `2d20kh + 5` — spaced, no stray ")". ⚠️ One cosmetic observation kept, NOT a fail: the roll
DIALOG's own `.roll-config .formula` preview span reads the BASE `1d20 + 5` while the die control is
already classed `advantage`; it read `1d20 + 5` at `none` too, so the span appears never to reflect the
adv/dis state. That is the system's own widget, and a synthetic click could not toggle it to prove the
contrast — recorded as an observation for Ben's eye, not filed as a defect.
**Flame Surge / burst cards**: Detonate stamped the card "Detonated ✓" with **both** buttons `disabled`
and `flags.edha-content.cardResolved = {label:"Detonated ✓"}`; a second cast Cancelled read
"Cancelled — refunded ✓" with Investiture refunded 3 → 1 → 3 and the template cleaned up; and a **real F5**
(full page reload, re-joined as Bench) brought all three stamped cards back still disabled with their
labels intact — Detonate, Cancel, and Flashpoint's "Flashpoint fired ✓". Re-clicking is impossible.)*

*(**Engine-move collision** — RETIRED on evidence 2026-09-05, bench run 24. The engine half was already
proven at run 9; the last clause was the manual-drag half, and a hand drag ends in exactly one write — a
`TokenDocument` x/y update. Driven: `Bench Target — Adjacent B` updated onto `Bench Target — Adjacent A`'s
square landed at (3000, 4500) on top of it — **tokens still stack on a manual move**, which is the intended
behaviour (the engine executor is not in that path). ⚠️ The pointer-drag GESTURE is not reproducible in a
hidden pane (run 23: PIXI pointer state is frozen); that a drag issues this same update is read from Foundry,
not measured here.)*

*(**`ally-drops` side filter — the tokenless victim** — RETIRED on evidence 2026-07-28e, bench run 19,
**all four cells, driven eight times** (4× a deterministic tokenless drop + 4× a real phantom-double
break, because the mechanism is a hook race and the old symptom was intermittent). The decisive shape:
ONE tokenless drop exercises all three filters at once, each acting as the others' control — a
disposition-−2 tokenless victim with three owners whose once-per-round gate was **verified open before
and after every drive**. Every drive: **exactly one card**, from the same-side un-ranged owner
("⏰ Break … (Bench Adv — Victim Tokenless dropped.)"); the **cross-side −1 owner silent with its gate
still open**; the **same-side 20-ft Roek silent with its gate still open** — and Roek's rule proven
ALIVE by a control that fired it at 5 ft, then silent again at 35 ft, so the range filter genuinely
*measures* rather than merely null-checking. ③ re-measured 0 cross-side cards with the token present.
⚠️ **Harness note worth keeping:** Ben's three Corvaine owners were **already gate-closed** (`trigRound`
stored round 1 == `game.combat.round` 1), so their silence is **over-determined** and proves nothing on
its own — run 19 therefore used bench-imported owners whose gate it controlled. Their `trigRound` was
byte-identical before and after regardless.)*

## Structural (tree graphs + prereqs, from the 07-24 fixes)

*(**Nothing else lost its rules** — RETIRED on evidence 2026-07-27v, bench run 12: both spot-check
talents were read live off the OWNED items — Withering Ray carries its two `use` rules
(`edha-ritual-hp-cost`, `edha-single-target`) and Arc Flash its one `edha-deal-damage` triggered
effect, matching the authored files; Withering Ray also RAN end-to-end that run. A live document read
is the stronger form of "tabs unchanged".)*

---

# BENCH — White (leyline)

Run on **Bench — White** (ally dummies in range; a hostile pair adjacent for the Bulwark
reactions). No pack rebuild pending. Priority: 2bR-18 (premise), then 2bR-7
(the pass's only deliberate drifts).

**Bench run 2 (2026-07-26i): 13 White rows PASSED on the live table and are retired** — 2bR-18,
2bR-7, 2bR-11, 2bR-12, 2bR-15, 2bR-16, 2bQ-10, 2bR-2, 2bR-13, 2bR-14, 2bJ-2, 2bJ-13, 2bR-8, 2bQ-9.
Evidence per row in the 07-26i delta. The rows below stayed open — all four survivors share ONE
root cause except 2bR-17.

> **✅ Bench run 3 (2026-07-26k): the 07-26j dice fix is CONFIRMED LIVE on the table.** Shield Wall
> (5 then 3 reduction, fresh dice each trigger, stands down below 2 adjacent allies), Interposing
> Shield (offer with a real number, click spends 1 Inv, retro-reduction lands, "up to 10 ft" move)
> and Retributive Guard (offer on attacked-adjacent-ally, 8 spirit dealt on the White test,
> fall/hazard damage offers NOTHING) all passed and are retired — evidence in the 07-26k delta.
> All 7 restored rules in the other five trees were benched the same run and printed real numbers.

*(**Devoted Conduit (2bR-10)** — RETIRED on evidence 2026-09-05, bench run 26, as a **positive/negative
pair**, using a second White PC staged for the purpose (`Bench — White II`, a full duplicate of Bench — White
in the bench folder, deleted at cleanup). ✅ POSITIVE: Bench Ally — Two took 20 impact adjacent to White II;
White II's Shared Burden offer (`data-edha-owner = Actor.kvmRPRG17KaMOg4L`, amount 7) was clicked, and the
engine posted "🛡️ **Bench — White II's damage reduced by 2 — Devoted Conduit (Bench — White)**" — the owner
reduced the SECOND White's redirect, on a card naming Devoted Conduit, with 2 inside the 1–8 =
`floor(2d8/2)` band. ✅ NEGATIVE (the "never reduces the redirect the owner took themselves" clause):
Bench — Blue was damaged adjacent to Bench — White, White took the redirect **itself**, and the only
reduction card was "Devoted Conduit (**Bench — White II**)" — White's own Devoted Conduit did not fire on
White's own redirect.)*
*(**Burst-only: the 13 damage riders that lost their bonus inside an AoE** — RETIRED on evidence
2026-09-05, bench run 26. The shared code path is `edhaBurstDetonate` → `edhaRiderParts(item, actor)`, and it
was driven **twice on real bursts**: Bench — Red's Flame Surge printed "= 15 (2d8) + 5 (red) + **5 (Kindle)**
→ 25 energy", and — the decisive one — a FRESH pack import of **Hazewyrm Elder**, which is one of the 13 named
and is the only one of them that owns an AoE, cast its OWN Flame Surge and printed
"= 9 (2d8) + 3 (red) + **3 (Kindle)** → 15 energy". Both riders are `edha-damage-rider` on
`edha-pre-deal-damage` — exactly the shape the row is about.
⚠️ **Why the other twelve cannot be driven as written, read off `data/adversaries.json` (labelled: this half
is a data read, not a measurement).** "The owner deals damage through an AoE" is structurally impossible for
eleven of them — Mistheron · Stillback · Wasting-Eater Stillback · Wrongwake · Wasting-Eater Wrongwake ·
Keelshadow · The False Spring · Brandram · Hazewyrm Adult · The Doubled · The Doubled Elder own **no
`edha-burst` talent at all**; being *caught in* someone else's burst never consults their riders. And Life's
**Prognosis** is `appliesTo: "heal"`, while the only heal-burst in the data is White's Mending Aura and no
actor owns both — so it cannot be staged either. Mistheron's rider was separately proven ALIVE this run on an
ordinary hit: Spearing Beak rolled `1d8 + 2 + (1d6[Spearing Beak])[Spearing Beak]` = 10 against a fooled
target.)*
- [ ] 🤖 **The other five restored adversary abilities (same 07-26j fix) — NARROWED 2026-09-05, bench run 26: THREE PASS, ONE IS A FAIL WITH A DATA ROOT CAUSE.** ✅ **Rootling Swarm / Grasping Vines** rolled `1d20 + 1` = 10 and printed "Grasping Vines: **10 vs Bench — Green's PHY 14 — FAIL**". ✅ **Rootling Swarm / Territorial Instinct** rolled `1d20 + 1` = 15, printed "**15 vs Bench — Green's SUR 12 — SUCCESS**" and applied **Immobilized** (asserted on the document). ✅ **Tussock-Sow / Drive the Prey** rolled `1d20 + 2` = 21, printed "**21 vs Bench — Green's SUR 12 — SUCCESS**" and applied **Slowed**. All three on FRESH pack imports into the bench folder. ❌ **Reeve-Owl / Sovereign of Solitude — the roll half passes, the contest half is DEAD, and the cause is the BUILT PACK, not the engine.** It rolled its named skill (`1d20 + 2` = 6, black) — the 07-26j `activation.skill` fix is live — but posted **no `N vs <DEF> M` card and applied nothing**, because the pack item's `system.events` is `{}`. Read off the compendium document itself (not the imported copy): `edha-content.edha-adversaries` → Reeve-Owl → Sovereign of Solitude has **0 rules**, while `data/adversaries.json` authors **4** (`edha-gm-cue`, `edha-def-test` black vs Spiritual, `edha-triggered-effect` Immobilized, `edha-triggered-effect` vital on success). **This is NOT a stale pack**: every sibling item on the SAME actor built its rules correctly (The Bailiff's Eye 1, Sapping Hex 1, Predatory Patience 2, Cruel Step 1, The Verdict Is Not Appetite 1, Black Leyline Attunement 1), and all of Rootling Swarm / Tussock-Sow / Mistheron / The Doubled Elder / Briar-Gone Grove match their authored counts item-for-item. Exactly one item loses its four rules in the build. → **test-pass-fixes** (build/validation, not engine). This row stays 🤖 only to re-run Sovereign of Solitude once that is fixed.

---

# BENCH — Blue (leyline)

Run on **Bench — Blue** (enemy dummies in Blue Attunement Range; one with a written Cognitive
defense, one without). No pack rebuild pending. Priority: 2bJ-1 (first prompt-pick ever
— if it fails, every prompt row dies with it), 2bF-3 (first `vs: skill`),
2bAA-10 (the walls), and 2bP-2 (the silent-free-buff trap).

**Bench run 2 (2026-07-26i): 13 Blue rows PASSED on the live table and are retired** — 2bJ-1
(the first prompt-pick click in the project WORKS), 2bF-3 (the first `vs: skill`), 2bAA-10 (the
walls), 2bP-1, 2bP-2 (the trap row), 2bP-3, 2bP-4, 2bJ-5, 2bF-2, 2bF-4, 2bF-5, 2bF-6, 2bI-12,
2bAA-7, and the Blue spot-check row. Evidence per row in the 07-26i delta.

*(**2bAA-6 — Living Image** — RETIRED IN FULL on evidence 2026-09-05, bench run 26. The run-23 hard FAIL
(the Pay button charging nothing, `edhaUpkeepInvClick` reading `ev.currentTarget` after an `await`) is
**FIXED AND CONFIRMED LIVE** — the engine now captures `const btn = ev.currentTarget, ds = btn.dataset;`
before the first await. Driven end to end on a real illusion: Blue cast Holographic Illusion (a real summon
actor, HP 1), a bench combat's turn start whispered "🎭 **Living Image** (Bench — Blue) — turn start with 1
illusion(s) up … **1 Investiture per COMPLEX illusion**" with a live **Pay 1 Investiture** button, and the
click charged **3 → 2** and posted "🎭 Living Image: Bench — Blue pays 1 Investiture of upkeep (2 left)."
with **no console error**. The document-drives-it clause was re-proven the same run: editing
`system.events.LivingUpkeep0000.handler.costPer` 1 → **2** changed the next prompt to "2 Investiture per
COMPLEX illusion", relabelled the button "**Pay 2 Investiture**", and the click charged **4 → 2**
("pays 2 Investiture of upkeep"). `costPer` restored to 1.)*

*(**2bJ-3 — Pattern Recognition** — RETIRED on evidence 2026-07-28l, bench run 23, as a paired
positive/negative. ⚠️ **The behaviour-change question the row asks is Ben's and is now in
`EDHA_RULINGS.md` R-57** — should it keep waiting instead of expiring? Evidence in the delta.)*
*(**2bAA-9 — The Seeming (Mistheron AND The Doubled Elder)** — RETIRED IN FULL on evidence 2026-09-05,
bench run 26, on FRESH pack imports of both adversaries. **Mistheron**: use raised a real copy
("Mistheron summons Mistheron (Illusion) — HP 1"), the belief sweep ran over three onlookers
("🌫️ **The Seeming** — belief vs DC 14 … Bench — Red: Perception 11 vs 14 · Bench — Green: 10 vs 14 · sees
through: Bench Ally — Two: 20 vs 14" → "2 taken in, 1 see through it"), and the ledger on the copy stores
`phantomSource: "The Seeming"`. The break: 5 keen to the copy posted "🌫️ **The Seeming**: the illusion of …
is struck and dissipates" + "the illusion breaks — the real one stands plainly seen", and the copy's token
was deleted. **The Doubled Elder**: identical, its own copy and its own belief sweep (Green fooled 12 vs 14,
Red saw through 21 vs 14), same break wording. **Every card names "The Seeming" — "Phantom Double" appears
nowhere.** The fooled-target riders both found the belief ledger: **Spearing Beak** rolled
`1d8 + 2 + (1d6[Spearing Beak])[Spearing Beak]` = 10 against fooled Bench — Red, and **Raking Grasp** rolled
`1d10 + 4 + (1d8[Raking Grasp])[Raking Grasp]` = 15.)*

---


# BENCH — Black (leyline)

Run on **Bench — Black** (enemies in Black Attunement Range, one Isolated, one with allies
within 10 ft, one at 0 focus). No pack rebuild pending.

*(**2bI-9 Siphoned Will** — RETIRED on evidence 2026-07-27v. Mechanics verified at bench run 3: on
Hollow Command's success, "🧠 Siphoned Will: Bench — Black regains 2 focus" (tier 2). Its empty-tab
design question was **SETTLED by Ben on 2026-07-24t** — the empty tab is ACCEPTABLE, because the test
is editability, not which tab (handoff §9m, now with no open items). Nothing was left open.)*

**Bench run 3 (2026-07-26k): 20 Black rows PASSED on the live table and are retired** — 2bI-2,
2bI-3, 2bI-5 (the chain flag WORKS — the extra loss emptying the target credited Predatory
Insight), 2bI-7, 2bI-8 + 2bH-11 (retired as PROVEN-UNREACHABLE fail-open, runbook Known limits),
2bH-9, 2bH-10, 2bB-10, 2bJ-7 (push direction verified: away from the TARGET), 2bJ-9, 2bJ-14,
2bZ-1, 2bZ-2, 2bZ-3, 2bZ-4, 2bZ-12 (rank-3 Black Attunement Range measured at 60 ft), 2bM-8,
2bM-10, 2bF-12. Evidence per row in the 07-26k delta. The rows below stayed open — two FAILs
(→ test-pass-fixes) and the ⚑ ruling rows, each with a dated note.

**✅ BLACK HAS NO OPEN BENCH ROWS (2026-07-27w).** Its two FAILs retired at run 4, and its three
surviving rows were pure rulings with nothing left to test — 2bI-4 (cross-rider stacking),
2bI-6 (Whispered Doubt vs Wary) and 2bJ-10 (the click-not-post budget). They are now
**`EDHA_RULINGS.md` R-15, R-16 and R-17**. Nothing was closed; the questions moved.

**Bench run 4 (2026-07-26m): the three 07-26l re-tests all PASSED and are retired** — 2bI-1
(Whispered Doubt's loss card: "🧠 Whispered Doubt: Bench Target — Adjacent A loses 1 focus"; Red's
Shatter Focus announces off the same helper), 2bJ-8 (Puppeteer's offer names the creature, no
literal braces), and the Cruel Step straddle spot-check (the x=5156 straddle slid the FULL 10 ft,
and the ⚑ near-parallel residual also completed — `testCollision` from the collinear origin reads
false while a genuine crossing ray reads true). Evidence in the 07-26m delta.

---

# BENCH — Red (leyline)

Run on **Bench — Red** (an enemy dummy in Red Attunement Range that can take damage twice in a
round). No pack rebuild pending — this is the PILOT tree: it holds the migration's first three
talents (2bA) and its rows ran end-to-end in **bench run 1 (2026-07-26g)**: 12 rows retired on
evidence (2bQ-1/2/3, 2bA-1/2/3/4, 2bF-11, 2bY-11, 2bY-13, 2bY-14, 2bP-5 — 2bQ-1 retired as
SUPERSEDED: the "(On Use)" spec predates the 07-25 Opportunity redesign that 2bQ-3 verified; a
bare use arms nothing, by design). **What remains below is ONE row: Flashpoint.** Red's three other
survivors were pure rulings and moved to `EDHA_RULINGS.md` on 2026-07-27w — **R-23** (Volatile
Strike: whose hit should it ride), **R-24** (is Reckless Advance the intended Momentum root — the
graph half is verified live) and **R-27** (Battle Fever: the card says "resets at start of your
turn", the engine rides every test until turn start — which side is canon). Arc Flash, the other
half of the spot-check row, PASSED at run 1 and retired with it.

*(**Flashpoint** — RETIRED on evidence 2026-09-05, bench run 26. One Flame Surge detonation caught
**2** enemies (Bench Target — Adjacent A and B, 12 energy each after their Athletics saves) and fired the
`edha-multi-hit` prompt. Clicking "Fire Flashpoint": Investiture **2 → 3** ("⚡ Flashpoint — Bench — Red
regains 1 Investiture") **and** `flags.edha-content.nextTestMod = {mode:"advantage", skill:"red", count:1,
source:"Flashpoint"}` written to the actor. The very next Red test opened with its die control already
classed `advantage` — nothing clicked — and rolled **`2d20kh + 5`** = 21, after which the `nextTestMod`
flag was consumed. Pre-selected AND enforced. The card also stamps "Flashpoint fired ✓" and disables.)*

---

# BENCH — Green (leyline)

Run on **Bench — Green** (your terrain placed; an enemy pack with adjacent allies; a wounded
ally). No pack rebuild pending.

**Bench run 3 (2026-07-26k): 14 Green rows PASSED on the live table and are retired** — 2bS-17
(THE premise: edited Pack Pressure's `amountFormula` on the document to a flat 5, the very next
strike printed "+5 keen strike", formula restored), 2bS-16 (Overgrowth stepped "+1 Deflect" as a
named AE, Life Surge's heal left it untouched — the `deflectStackMax` field discriminates; both
talents' shared overflow-THP rule also fired), 2bS-2 (hazard tick "3 keen … (Thorn Field —
Bench — Green)" on enter), 2bS-5 (1 enemy → plain, 2 → plain, 3 → `2d20kh`, Weakened → `2d20kl`
not stomped), 2bS-8 (the restored dice: "+10 keen strike" = 2d8, window card = the editable
note), 2bS-9 (in-combat: solo silent, co-attacked round "+2 keen (2 hunters)"), 2bS-10 (hidden
attacker on an ally rolled `1d20 + 2 - 2[Packmate's Warning (+2 defense)]`; Green-as-target
unmodified), 2bF-7/2bF-8/2bF-9 (Restrained-no-expiry / engine-rolled Survival → Immobilized /
Survival → Slowed), 2bR-4 (offer card on the ally's in-terrain attack, silent on a plain test),
2bM-9 (picker + nothing spent; the pick healed 17 = 2d8+5 applied), 2bT-20 (both rider paths
unchanged), and **Green / Instinct is takeable** (compiled tree: Pack Hunter = root with no
talent prereq, Predator's Instinct and Scent the Weak hang off it, column walks to Natural
Order — the session-0 mutual pair is dead). Evidence per row in the 07-26k delta.

- [ ] 🤖 **2bS-11 — Natural Order — RE-NARROWED 2026-09-05, bench run 26: only the VEIL half is left, and it is BLOCKED with the blocker named.** ✅ The use half passed again (2 Inv spent 4 → 2, `clearsight` status + `condclearsight00` effect written to Bench — Green, scene card posted). ✅ **The combat-end clear PASSES**: deleting the bench combat removed `clearsight` from Bench — Green while leaving its unrelated Immobilized/Slowed alone. ⛔ **BLOCKER for the veil half — the Playtest Map can never make a token `unlit`.** `edhaDarkVeilSweep` only raises or suppresses a marker when `edhaPointIlluminated(tok.center)` is FALSE, and the Playtest Map has `environment.darknessLevel === 0` with `environment.globalLight.enabled === true`, so **every square on it is lit**. Driving this needs either a change to Ben's scene config (out of bounds for a bench run) or a bench-created scene. **The fixture is otherwise ready and identified**: the `edha-dark-veil` adversary is the **Stalker** (`effectName: "Veil"`, `edha-content.edha-adversaries` id `l924euoyx3pYFk2T`) — import it fresh, put it on an unlit square within 60 ft of an armed Green, and the positive/negative pair is one flow.
*(**2bS-1 — Green Leyline Attunement** — RETIRED IN FULL on evidence 2026-09-05, bench run 26. ✅ **The
out-of-range refusal, the half that was never driven**: with rank-3 Green Attunement Range = 60 ft, a pick at
**67.5 ft** was refused — "Edha: that point is beyond Attunement Range (60 ft) — terrain not placed." plus the
card "🌿 Green Leyline Attunement (Bench — Green): terrain NOT placed (out of range)" — and **no Region was
created**. ✅ **The ring reads**: screenshotted with the picker live at scene scale 0.12 — a single pale
circle outline centred on the caster's token, clearly separable from the map, with the prompt
"Click where the 10 ft difficult-terrain square grows … Attunement Range 60 ft" above it. No escalation
needed. ✅ Placement re-proven in the same minute: an in-range pick created
`Bench — Green — Difficult Terrain` (rectangle 600×600 px = 10 ft) with `Thorn Field rides it`, and the ring
template cleaned itself up. ⚠️ **Harness note, NOT an engine double-fire**: an earlier attempt produced TWO
identical refusals from ONE click. Cause was mine — a `javascript_tool` call that TIMED OUT kept running in
the page and fired Draw Mana a second time, arming a second `edhaPickPoint` listener on `#board`. A clean
single run produced exactly one prompt and one refusal.)*
- [ ] 🤖 **Spreading Roots (2bS-4) — RE-TEST the terrain growth after the 2026-09-05 shape-write fix (ENGINE-ONLY — ⟳ Sync + F5, no pack rebuild).** Run 26's fail: the offer, the 1-Investiture charge and the "the terrain expands 10 ft" card all worked, the **Drawing** grew to `1200×1200 @ 2100,4800` and the **Region** stayed `600×600 @ 2400,5100`, so the table saw 20 ft and the engine enforced 10 ft. Root cause (verified against Foundry's own source, and it is NOT quite what run 26 wrote): `foundry.utils.deepClone` returns a shape **DataModel by reference**, so `deepClone(region.shapes)` handed back the LIVE models and `region.update({shapes})` re-read `_source` through `EmbeddedDataField._cast → toObject()` and diffed to nothing. All three shape writers now read through `edhaRegionShapes(region)`. **Drive it**: stage a creature ending its turn in Green's difficult terrain, click Expand, then assert on the DOCUMENT that `region._source.shapes[0]` is `1200×1200 @ 2100,4800` — the Region, not just the Drawing — and that a second expand takes it to `1800×1800 @ 1800,4500`.
- [ ] 🤖 **Pinpoint Charge terrain-follow — the SAME fix's second consumer, never tested (ENGINE-ONLY — ⟳ Sync + F5).** `edhaRecenterTerrain` carried the identical latent no-op: the hazard Drawing followed the surviving target while the Region stayed where it was placed. Put a `followTokenUuid` hazard (Pinpoint Charge) on a living target, move the token, and assert `region._source.shapes[0].x/.y` recentred on the token — plus the negative: a target at 0 HP must leave the Region behind.

*(**Natural Recovery (2bS-14)** and **Resurgent Growth (2bS-12)** — RETIRED on evidence 2026-09-05,
bench run 26, out of the old "Green spot-checks" row. Natural Recovery: run 10's "needs an Opportunity,
cannot be forced" blocker is STALE — the Opportunity cost is honour-system (`costNote`), so a plain Green
heal is the whole trigger; Verdant Mend into a Weakened ally offered **exactly one button, for the one
condition the target actually had**, and the click removed Weakened from the document. Resurgent Growth:
the same heal wrote `flags.edha-content.regrowth`, and Green's next turn start paid "regains **7** health"
(HP 32 → 39, 7 = `@tier 2 + green mod 5`) and consumed the queue flag.)*

*(**2bS-3 — Briar-Gone Grove** — RETIRED on evidence 2026-09-05, bench run 26, on a FRESH pack import.
The Grove (role `boss`, tier 1) drew Mana and placed its own patch; the Region it created carries the
`edha-content.hazard` behavior with the **baked** `damageFormula: "floor((1d8) / 2)"`, keen, `sourceName:
"Thorn Field — Briar-Gone Grove"` — the **boss → d8** die family, `@colorRank` resolving to the role rank
(ruling 122) and `@tier` to 1. **Control in the same scene**: Bench — Green's own patch baked
`floor((2d8) / 2)` — same die, different count — so the substitution is genuinely evaluated, not a constant.
And it TICKS: a token crossing both patches took "🔥 … 4 keen from dangerous terrain (Thorn Field —
Bench — Green)" and "🔥 … **3 keen** from dangerous terrain (**Thorn Field — Briar-Gone Grove**)".)*

---

# BENCH — Destruction (Razkael, deity)

Run on **Bench — Destruction** (open ground; enemy dummies to catch blasts; one Construct-type
if you can). ⚠️ 2bY-7's Constructs ×3 re-test needs the 07-26n deploys: engine sync + F5 AND
`foundry-build deity` + ⟳ Sync Talents + a fresh re-forge (see DEPLOY STATE). The other rows
need no pack rebuild.

**Bench run 4 (2026-07-26m): 14 Destruction rows PASSED on the live table and are retired** —
2bY-1 (in-range place → red 10 ft template + Charges card + arm card; both refusal paths refunded),
2bY-2 (cap = tier, oldest evicted), 2bY-3 (all three arms bound and each fired ONE whispered
Detonate prompt), **2bY-4** (Set Charge's document formula edited to a flat `6` → the detonate
rolled `6`, terrain dropped, charge consumed), 2bY-5 (pre-cost refusal + ⊕ flag + Pinpoint's own
edited formula printing "+9 keen … ignores deflect"), **2bY-6** (`failStatus` edited prone →
**slowed** on the Events tab and the next detonate applied Slowed), 2bY-8 (toggle on/off, trail
patches while on, zero after off, +10 ft Speed AE), 2bY-9 (armed card + the auto ignite/spread
firing unprompted), 2bY-10 (Pyre stamped `spreads: true`, end-of-turn spread card), **2bK-1 +
2bK-2** (2 charges detonated at once, and the multi-catch listed "+5 energy (caught in 2 blasts)"
separately), 2bK-3 (15 ft + Intellect on the first use; the second the same scene refused with
nothing spent), 2bK-4 (both capstones refused pre-cost on an empty ledger), 2bK-5 (both riders rode
one detonate), and **Razkael prereqs** (compiled tree: Cascading Failure = ONE group {Pinpoint
Charge, Concussive Yield}, Fault Line = ONE group {Combustion Chain, Walking Ruin} — the system
evaluates a multi-talent group with `.some()`, so either parent alone suffices; prose in
`data/domain.json` matches). Evidence per row in the 07-26m delta. ⚑ the drawn-tree eyeball for
the prereq row is still Ben's.

**✅ DESTRUCTION HAS NO OPEN BENCH ROWS (2026-07-27w).** Its last survivor — Walking Ruin having no
token indicator, unlike every other scene-arm in the project — was a consistency call with nothing
to test, and is now **`EDHA_RULINGS.md` R-34**.


---

# BENCH — Life (Anaveth, deity)

Run on **Bench — Life** (a willing ally dummy to mutate; a wounded ally). No pack rebuild
pending. The Life/Death premise row lives in the Death section (2bW-17).

**Bench run 5 (2026-07-27a): 2 Life rows PASSED in full and are retired** — **2bW-14** (tick
"regenerates 3 HP" = tier+1; 2 vital → "🥀 Primal Regeneration on Bench Ally — Two ends — it took
Vital/Spirit damage", `lifeRegen` cleared, no tick on the next boundary; re-granted on the
Dense-Tissue-mutated ally the tick rolled "regenerates 5 HP" = 2d8+1) · **2bW-16** (bond card;
whispered offer "took 6 keen. Take up to 3 of it as spirit" with the number input capped at half
POST-deflect; "0" declined free and a same-round re-offer appeared; a real 3 posted "takes 3 spirit
in Bench Ally — Two's place; Bench Ally — Two heals 8" = 3 + 2d8; third same-round damage → no
offer; next round re-armed). The chooser/riders of 2bW-12 and clauses 1–4 of 2bW-13 are
retired-in-place inside the rows below. Evidence per row in the 07-27a delta.

**Bench run 6 (2026-07-27c): 2bW-12 and 2bW-13 re-tested and RETIRED** — 2bW-12: second use on a
mutated ally refused pre-cost ("already carries Bone Spurs — one adaptation per creature per
scene. Nothing spent", no chooser, Inv untouched); the stale-chooser belt drove the REAL case
(two live choosers on an unmutated ally, pick on one, click the other) → "the earlier pick
stands" card, buttons flip to "already adapted", flag kind unchanged — and a clicked chooser
self-disables to "✓ applied"; combat delete cleared the flag and a fresh use re-offered the
chooser. Still not driven: Dense Tissue's forced-movement refusal. · 2bW-13: with BOTH GM
clients connected (Bench + Ben's Gamemaster), combat delete minted exactly ONE "Apex Form ends —
takes an injury: Slowed…" card and ONE injury item; apexForm/lifeRegen swept clean; no other
scene reset doubled anything all run. ⚑ still in the rulings batch: melee mutation riders fire
on a nat-1 graze application.

> **✅ 2bW-15 — Surgical Precision — RETIRED on evidence (bench run 7, 2026-07-27e).** All four
> sub-cases passed on the live 07-27d engine at PHY 45 / phy 1: two back-to-back CONSOLE uses quoted
> **their own** d20s ("— 6 vs … PHY 45: graze" under `1d20+5=6`, then "— 24 …" under `1d20+5=24` —
> the one-behind is gone); the SHEET path quoted "— 9 …" under its own `1d20+5=9` with **no**
> fail-open cleanse; phy 1 gave the three-button cleanse card and the click posted "removed Weakened
> from Bench Ally — Two"; and a CANCELLED roll dialog produced **zero** cards, with the next use
> deciding on its own fresh d20 (8). The Surgical data half stays COSMETIC-only on the owed deity
> rebuild.

---

# BENCH — Chaos (Maelith, deity)

Run on **Bench — Chaos** (enemy dummies inside and outside Blue Attunement Range; one
Isolated). No pack rebuild pending.

**Bench run 5 (2026-07-27a): the WHOLE section — all 15 rows — PASSED on the live table and is
retired** — **2bG-4** (success 23 vs PHY 14 on a no-Omen target → "is Isolated", HP untouched,
**no damage card at all** — the H3 conditional short-circuit holds) · **2bG-6** (Entropy placed to
cap, Cascade Collapse cleared A, Entropy then placed on B at "(2/2)" — the freed slot reconciled
correctly) · 2bG-1 (THREE rules on the tab; success 23→"bears your Omen (1/2)" + "11 spirit …
2d8"; the player rolls the Blue test) · 2bG-2 (at cap, SUCCESS 17: "no Omen placed on Bench
Target — Adjacent B — you are at your cap of 2", damage still landed, both older Omens kept) ·
2bG-3 ("Omen is spent (1/2 left)" + "7 vital … 2d8 + 2" + Isolated) · 2bG-5 (with: TWO instances
6+12 vital, "a second instance rides this"; without: ONE, 11 vital) · 2bG-7 (covered by
2bU-1/3/4 — all three now carry document rules from pass 2bU and ran clean) · 2bG-8 + 2bU-5
(refund card on bearer damage; same-round re-damage silent; out-of-Blue-range damage silent — the
NEW range gate enforced; back in range next round the card fired again, Inv clamped at max) ·
2bU-1 (no target → "target the creature first (nothing spent)"; spread marked A "(1/2)" AND
nearest-unmarked B "(2/2)" auto-picked past the farther A-candidate; at cap "no Omen placed …
cap of 2"; lone target → "(1/2)" + "no additional enemy within 10 ft to mark") · 2bU-2 (dispel
card with one button per enabled effect, click posted "Bench Test Buff unravels from …" and
deleted the AE; Omen shattered → Disoriented; no-Omen use → dispel card only, no Disorient) ·
2bU-3 (ONE Blue roll sweeping per-bearer vs ITS OWN Cognitive — "affected" branch took omen +
2d8 spirit + Disoriented; the out-of-Blue-range bearer untouched, kept its Omen; empty ledger →
cost spent + "no creatures on the ledger"; a later sweep cleared TWO bearers off one roll with
serialized counts "(1/2)"→"(0/2)" — free corroboration of the 07-26n H3 write queue) · 2bU-4
(cap-full fill posted the honest "no enemy in range to mark (2/2)"; detonation hit the
out-of-range Isolated bearer scene-wide for "16 vital … 2 * (2d8)" with NO Disorient while the
non-Isolated bearer took "11 spirit … 2d8 + 2" + Disoriented; all Omens cleared; a second use on
an empty ledger filled nearest-first — Undefended + B picked over the farther A) · **2bY-12 +
2bU-6** (no-target and unmarked-target both refused PRE-COST with "nothing spent" warns; marked:
"Omen removed … rerolled the d20 18→ 14 — test drops to 18", and the reroll-higher branch
"reroll d20 = 6 ≥ kept 5 — the original test stands"; the stale ledger entry left via the
mark-wins reconcile — the next place read "(1/2)"; auto-prompt whispered with the kept total;
Mute silenced a bearer's roll; a real use re-armed the prompt). Evidence per row in the 07-27a
delta.

> **✅ Chaos residual (c) — the scene sweep — RETIRED on evidence (bench run 7, 2026-07-27e).** Run
> 6's exact staging re-run on the live 07-27d engine (a real Spreading Omen place on the canvas
> bearer + a hand-staged OFF-CANVAS directory bearer + an inflicted Isolated with `markedBy`):
> combat delete left `lists.omens` **UNSET** on the owner, the off-canvas bearer lost `omen` and
> `markedBy.omen` while keeping its unrelated `restrained` / `markedBy.harvested` (correctly
> untouched), the canvas bearer and the Isolated victim came out clean — and a FRESH place then read
> **"(1/2)"**, proving the ledger really emptied. **Zero `Chaos sweep:` console.warn lines**, so the
> guarded-per-await rewrite has no residual culprit.

**✅ CHAOS HAS NO OPEN BENCH ROWS (2026-07-27w).** All 15 rows passed at run 5; residual (c) retired
at run 7; residual (a) — the through-walls rendering of Omen-bearers — closed at run 13 on
sense-through evidence **with a negative control** (an identically-obscured UNMARKED token stayed
invisible on the same client); residual (b)'s per-bearer gate has been exercised repeatedly and the
resister branch is dice luck, not doubt. What was left was one question with nothing to test —
should Unweaving's dispel card list the **Omen marker itself** as a dispellable button — and it is
now **`EDHA_RULINGS.md` R-35**.


---

# BENCH — Fate (Olvarra, deity)

Run on **Bench — Fate** (open ground for squares + snares; an enemy walker). No pack rebuild
pending.

**Bench run 6 (2026-07-27c): 15 Fate rows PASSED on the live table and are retired** — **2bX-14 +
2bAA-5 (the priority scene reset)**: combat delete with 2 squares + 2 snares + a hexmark + the
ordained AE + sceneOnce live cleared BOTH ledger keys, all templates, the snare Regions, the
ordained-buff AE, the markedBy key, and re-armed sceneOnce; nothing doubled with two GM clients
connected (the 07-27b one-applier family held) · 2bX-1 (in-range white 5-ft template + "set
(1/2)" card WITH the Bulwark THP line; out-of-Attunement-range click AND right-click cancel both
refunded — "canceled — cost refunded", nothing placed; the pick prompt names "Attunement Range
60 ft") · 2bAA-1 (cap 2 = tier, third place evicted the OLDEST — its template vanished; ledger
lives at `lists.ordained`; ⚑ cosmetic: the place card says "(2/2)" but never verbalizes the
fizzle) · 2bX-2 (green template + trigger Region per snare; third place evicted oldest — template
AND Region both gone by id/count; entries snapshot the formula) · 2bX-3 (springs on walk-INTO and
walk-THROUGH; document formula edited to flat `7` then re-placed → the spring rolled exactly `7`;
Restrained applied; consumed; card titled by the placing talent; formula restored) · 2bX-4 (empty
ledger → "no snares left to mark inevitable — nothing spent" pre-cost; with one → entry flagged
`inevitable: true` + card — ⚑ cosmetic grammar "the snares on Snare #1 is inevitable") · 2bX-5
(spring rolled base 9 + `5` — Inevitable Snare's OWN formula edited to flat 5 — for 14 keen, +
engine-rolled "SPD 3 vs your green 11 — Disoriented") · 2bX-6 (offer card on every spring; mark
click → markedBy.hexmark + card; +2 keen rider card on damage within 10 ft of a square — net 0
through deflect 2; silent beyond 10 ft) · 2bX-7 + 2bAA-3 (turn-start on an ordained square → +1
phy/cog/spi AE + tempHp {2, source Bulwark Ground} + the Aid-at-30-ft clause on the card; an
advantage attack vs that ally posted the Bulwark card and rolled a SINGLE 1d20 — neutralized; a
disadvantage attack passed through as 2d20kl with no card) · 2bX-10 + 2bAA-4 (whispered foresight
card, one Move button per marker; ordained slide moved the template; snare slide moved template
AND Region and the moved Region sprang on entry at the NEW square) · 2bX-12 (declare card;
resolve sprang EVERY unsprung snare + the rally card; second use refused pre-cost "once per
scene — nothing spent") · 2bX-13 (system charged every use; both cancel paths refunded; all
pre-cost refusals spent nothing — one exception logged in the 2bX-8 FAIL row). Evidence per row
in the 07-27c delta.

> **✅ Bench run 7 (2026-07-27e): FIVE more Fate rows RETIRED on evidence** — the snare spring
> double-fire (all five paths post ONCE: walk-INTO → 1 card / 1 roll / 1 Hexmark offer with damage
> applied once, walk-THROUGH → same, **two snares in one walk path → each sprang exactly once** (2
> cards, 2 rolls, 2 offers), Foreknown click → 1, Thread resolve over two snares → 2 springs + 1
> rally card; every snare consumed its ledger entry, template and Region) · `tempHp` scene reset (a
> PC, an adversary victim and an off-canvas actor all lost the flag on ONE combat delete, and 6
> vital then hit HP for exactly 6) · **2bX-8 + 2bAA-2** (the picker is now a real `<dialog>` titled
> "Weave the Thread — link two squares", ZERO AppV1 windows on screen; Link wrote `linked: true` on
> both entries + the link card; closing the picker refunded in full — 2→4 Inv with "Weave the Thread
> canceled — cost refunded"; the <2-squares case refuses **pre-cost** with "needs two active Ordained
> Ground squares. Nothing spent." and never opens a consume dialog) · **2bX-9** (a spring 10 ft from
> a linked square posted "🪢 Weave the Thread: an ally standing on either linked square may make a
> free Reactive Strike…", a spring 35–45 ft away posted none) · **2bX-11** (the previously
> "unobservable" own-formula rider IS observable — an enemy standing **adjacent** (5 ft) to the
> square is found by the spring's 5-ft nearest-enemy scan, so the Foreknown click rolled
> `(2)d(2*3+2)+2 + ((2)d(2*3+2)) = 20` and dealt it; placement adjacent does NOT insta-spring, only
> placement *under* a creature does — which narrows the rulings question, it does not remove it).
> ⚑ Still a ruling (unchanged): should placement under a creature ARM instead of spring?
>
> ⚑ **Harness note, not a defect:** the picker's explicit **Cancel button** could not be exercised —
> a synthetic activation of a DialogV2 submit button falls through to the `default` (`ok`) button.
> The close/X path proven above takes the identical `!picked` branch in `edhaZoneLinkMarkers`, so the
> refund branch itself is verified; only the literal Cancel-button click is a Ben row.

---

# BENCH — Sovereignty (Verdannis, deity)

Run on **Bench — Sovereignty** (an ally + enemy pair targeted together). No pack rebuild
pending.

**Bench run 6 (2026-07-27c): the WHOLE section — all 8 rows — PASSED on the live table and is
retired** — **2bT-16 (the priority pair conversion)**: ally+enemy targeted together → "ally +1 /
enemy −1 until the start of your next turn" with BOTH `dieStep` entries sharing a `pairId` and
`onPairHit: extend-once` (pure entry data); the ally's damage rolled a STEPPED d8 (d6 base); the
hit posted "both effects extend one additional round" and both entries moved expire round 2→3
with `extended: true`; a second hit extended nothing · 2bT-11 (no-target → "target the creature
first (nothing spent)"; Isolated → "outside your Attunement Range (black) — nothing spent"; a
FAILED test (11 vs COG 14) kept the cost spent and minted nothing; SUCCESS 22 vs COG 14 →
`diminished` status + −1 entry, and the victim's actual damage roll stepped **1d6 → 1d4**) ·
2bT-12 (FAIL 13 vs 14 → −1 entry expiring next-turn; SUCCESS 23 vs 14 on a second creature → −1
entry with `expire: "scene"`; the second use on the SAME creature refused pre-cost "already used
on … this scene" — and the latch held even though that first use had FAILED, per spec's "either
way") · 2bT-13 (FAIL → −1 all timed; SUCCESS → −2 `scope: attack` scene entry carrying
`failThpFormula: @tier` + `failThpRange: white` IN the ledger entry; the victim's attack damage
rolled 1d4 — d6 −2 floored at d4, so a d6 base cannot distinguish −1 from −2, flag for a
d10-weapon spot-check; a nat-1 attack auto-posted "failed an attack test — 17 ally(ies) in range
gain 2 temporary HP" and wrote the tempHp flags; the non-attack-damage-untouched clause not
driven — the victim has no non-attack damage vehicle) · 2bT-14 (Exalt → +1 next-turn entry +
card; Sovereign's Favor's `die-step` watch rolled (2)d8 white → tempHp {8, source Sovereign's
Favor}; a second Exalt rolled 15 and KEPT THE HIGHER — 15 replaced 8, no stacking) · 2bT-15
(Investiture of Authority REPLACED both exalt entries with the single `investiture` scene entry
— "replaces any existing Exalt" card; Favor did NOT fire on it — tempHp untouched; the second
Investiture on that ally refused pre-cost) · 2bT-17 (±2 scene entries, shared pairId,
`onPairHit: no-reactions`; the ally's damage rolled 1d10 = d6 + 2 steps; TWO hits → TWO "cannot
take reactions until the start of its next turn (GM-enforced)" cards; second use refused
pre-cost "Sovereignty was already used this scene — nothing spent") · 2bT-18 (the Censured
creature's failed attack (3 vs PHY 14) → "recovers 1 Investiture" AUTO (3→4) + "may make a
Reactive Strike" card for the White-range ally; its non-attack skill test → whispered owner-click
"If it FAILED, click to recover 1 Investiture" card, click recovered 1; the Edict-only victim's
failed attack fired NOTHING — whenKeys censure,decree respected). Evidence per row in the 07-27c
delta. ⚑ carried to the open rows: the tempHp scene-reset residual (see BENCH — Fate) was
confirmed here on a second tree's sweep.

---

# BENCH — Death (Morrath, deity)

Run on **Bench — Death** (hostile NPC dummies in Green range to harvest; a warded ally). No
pack rebuild pending; the 07-26n queue fix AND the 07-27b `chainBounded` dispatch fix are both
confirmed live at the table (runs 5–6).

⚠️ **Staging note (bench run 4):** Reaper's Harvest only harvests **adversary**-typed victims. The
standard `Bench Target — *` fixtures are `character`-typed and are silently skipped — that is the
"a PC drop harvests nothing" branch, not a bug. Import or clone an adversary-typed victim for every
harvest row.

**Bench run 4 (2026-07-26m): 17 Death rows PASSED on the live table and are retired** — **2bW-17
(the premise)**: Death Ward's `thpFormula` edited on the Events tab to a flat `3`, and the very next
lethal-drop rescue rolled `3` and printed "gains 3 Temp HP" · 2bW-1's heal-block re-test (a Mender's
hp-threshold click on a blocked target posted "🩸 … cannot regain HP (Withering Touch)" and HP did
not move) · 2bW-2's ranged half (arm survived, no rider) · 2bW-3 (in-range harvest, plus all three
negatives: out of range, a summon, a `character`-typed victim — and the CASCADE nested kill DOES
harvest via `chain`) · 2bW-4 (BOTH halves — an unset flag gave the scene-start freebie, an explicit
`[]` refused) · 2bW-5 (both pre-cost refusals, the `decaying` icon, and the turn-start tick "takes
12 vital … regains 6 HP") · 2bW-6 (all four, including an ALLY ending its turn inside taking
"🦴 … 6 keen", and the cancel refunding while the Remain stayed) · 2bW-7 (willing → no test, ward
lands) · 2bW-8 (unwilling → "24 vs … SPI 14 — SUCCESS", and the 1-HP lethal-drop rescue that did
NOT harvest) · 2bW-9 (not-at-0 refusal, the full valid raise with its auto-created injury item, and
the sceneOnce refusal with nothing spent) · 2bW-10 / 2bP-11 (no-Remain refusals) · **2bP-10** (cap
named at 2 servants, Remain survived) · 2bW-11 (all three branches) · **2bI-10** (13 spirit to both
enemies within 10 ft, the ally beside the body untouched) · 2bI-11 (re-use refused, PC and summon
drops produced nothing, combat delete cleared the marker) · and **both graph rows** (compiled tree:
Speak with the Fallen hangs off Reaper's Harvest beside Bone Garden; Risen Servant = OR{Bone Garden,
Speak with the Fallen}, takeable from either alone). Evidence per row in the 07-26m delta.

**Bench run 6 (2026-07-27c): the simultaneous cascade-drop harvest re-test PASSED and is
RETIRED** — exact staging (Necrotic Cascade armed via `cascadearmed` status, adversary trigger
dropped by 5 vital, TWO 1-HP adversary victims inside 10 ft, cap 2): ONE cascade tick ("13
spirit to Bench Victim — V1, Bench Victim — V2 · 2d8"), THREE ✨ recover cards, ledger counts
"(1/2)" → "(2/2)" → "(2/2). The oldest (Bench Victim — V1) fades — you sustain at most 2",
ledger ended holding the two newest, and the cascade did NOT re-detonate off the nested kills.
The `chainBounded` clamp holds at the table.

**✅ DEATH HAS NO OPEN BENCH ROWS (2026-07-27w).** Its two survivors were both questions with nothing
left to drive. **2bW-1 (Withering Touch)** ran every mechanical half at run 15 — arm ✅, delivery ✅
(+8 vital strike off a real Sidesword hit in combat), the No-Healing block landing ✅, turn-boundary
expiry ✅, and Temp HP landing on a fully blocked target ✅ (7 THP with HP pinned, later absorbing 4)
— leaving two decisions, now **`EDHA_RULINGS.md` R-9** (is heal-overflow → Temp HP a heal or a
grant; this also decides how the row's own example must be re-worded) and **R-28** ("start" vs "end"
of your next turn; engine, both cards and measured behaviour all say *end*, only the prose says
*start*). **Raise Dead / Remain** — should raising a creature clear its own `harvested` marker and
ledger entry — is **R-12**.

---

# BENCH — Civilization (Kethane, deity)

Run on **Bench — Civilization** (room for Foundations; a Construct summoned). No pack rebuild pending
for the ENGINE rows; the deity-pack rebuild is still owed for the Construct `creatureType` mint (see
DEPLOY STATE — **but see the note below: Civ's own Construct predicate does not read it**).

**Bench run 8 (2026-07-27g): the ENTIRE Construct-consuming family PASSED against a NORMALLY forged,
`summonTalent`-stamped Construct and is retired — the 07-27f lookup fix is confirmed at the table.**
The Construct was forged with `Forge Construct` and read
`{summon: true, summoner: …, summonTalent: "Forge Construct", summonedAt: …}` — the exact shape that
killed run 7 — and none of the three refused. **2bV-13 Siege Form**: card "🏰 Siege Form: Siege Form is
active on Combat Construct (Bench — Civilization) for the scene…", baked AE flipped `disabled: false`,
Speed 25→**0**, deflect 1→**3**; the "End Siege Form (Free Action)" button reverted all three (card
"🏰 … ends Siege Form (Free Action)"); both refusals held with Investiture unchanged at 4 —
"Edha: Siege Form is already active. Nothing spent." and "Edha: Siege Cannon (Siege Form only) needs
Siege Form active — toggle it on first. Nothing spent." · **2bV-14 Arsenal**: granted its OWN
Effects-tab AE "Arsenal (2 attacks/turn)" onto the Construct with
`summonGranted: "AVQfEKddptmPKABB"`, spent exactly its 2 Inv (4→2), re-arm refused
"Edha: Arsenal is already active this scene. Nothing spent." — and its `onKillNote` chase later fired
unprompted ("⚙️ Arsenal: … reduces Bench Target — Adjacent A to 0 HP — you may immediately command it
to move up to 15 ft and make a free Strike…") · **2bV-15 Magnum Opus**: `2 * ((2)d(2 * 3 + 2)) = 14`
took the Construct 14→**28** HP (max too), +2 to all three defenses 12→**14**, added
"Colossus (Magnum Opus)" with three `+2` bonus changes, wrote `civFoundationBonus: 2` and said so
("Allies in your Foundations now gain +2 to all defenses at their turn start (upgraded for the
scene)"), stamped `sceneOnce` and refused a repeat ("was already used this scene. Nothing spent.");
the 10 ft splash then dealt **14 energy to the target AND the second enemy** ("within 10 ft of Bench
Target — Adjacent A" — target INCLUDED per Ben R7a) while the two enemies at 15 ft were correctly
spared · **the FORGING side did NOT regress**: Forge Construct at cap 1, with the *stamped* Construct
alive, posted "Edha: Bench — Civilization's Combat Construct (Bench — Civilization) dismissed —
resummoning (cap 1)", deleted the old actor + token and minted a fresh stamped one (2bP-8/2bP-9's
shape, now proven on a stamped Construct rather than run 7's un-stamped fallback).
⚠️ One cosmetic console error at the dismiss-and-replace: `Actor "iiu9UrHCC86xlXr6" does not exist!`
(the deleted Construct's id) — a post-deletion re-resolve; no cause attributed, nothing user-visible.

**Bench run 8 (2026-07-27g): the raw-i18n family is DEAD — all seven named card sites read plain
English and the authored-override negative holds.** (a) Magnum Opus splash save: "🗿 Magnum Opus —
**Agility** vs your Red: Bench Target — Adjacent A: Agility 6 vs your Red 17 — Prone …" ·
(b) the Colossus AE description on the transformed Construct: "…who roll **Agility** vs the summoner's
red or gain **Prone** (engine-rolled)" · (c) Bastion's fortified-entry save: "⛨ Bastion — **Agility**
vs your Red: Bench Target — Adjacent A: Agility 21 vs your Red 14 — keeps pace" (and exactly ONE entry
card + ONE save card, re-corroborating the v13 double-event closure) · (d) an `edha-apply-status` card
on a NATIVE status, via Red's Reckless Gambit: "🎯 Reckless Gambit: Bench Target — Floater is
**Exhausted** (by Bench — Red)" — `CONFIG.COSMERE.statuses.exhausted.label` is the raw key
`COSMERE.Status.Exhausted`, so this is the run-1 bug's own shape, now clean · (e) Order's sweep:
"⚖️ Verdict — **Discipline** vs your Blue: Bench Target — Adjacent B: Discipline 13 vs your Blue 17 —
fails" and the Sealed rider "⚖️ Sealed Edict — **Discipline** vs your Blue: … Discipline 5 vs your
Blue 15 — breaks" · (f) Phantom Double's GM accounting card: "🌫️ Phantom Double — belief vs DC 16:
Fooled …: Bench Target — Adjacent A: **Perception** 12 vs 16 …" — the two player-whisper shapes
interpolate the *same* `sklab` const (engine lines 5715/5716/5724 all read the one computed at 5693),
so they are covered by the same fix; that extension is an **inference from the shared variable**, not
a driven card, because the bench fixtures have no player owner · (g) the negative: Fault Line's
"💥 Fault Line — **Speed** vs your Red: Bench Target — Floater: Speed 20 vs your Red 14 — stays up",
so the authored `saveLabel: "Speed"` still wins. No `COSMERE.*` string appeared in any card this run.

**Bench run 7 (2026-07-27e): the Foundation family + the summon-lifecycle rows PASSED and are
retired** — **2bV-16** (an adversary-typed victim dropped to 0 inside a Foundation whispered
"🛡️ Bonds of Community — … drops to 0 HP inside your Foundation. Reaction (one per round — trusted):
each standing ally in any of your Foundations gains **5** Temp HP and advantage on its next attack
test." — 5 = White rank 3 + WIL 2; the click posted "Bench Ally — One gains 5 Temp HP and advantage
on their next attack test" and wrote `tempHp {value: 5, source: "Bonds of Community"}` +
`advAttackNext`; **a MANUAL HP edit to 0 produced ZERO cards** — the documented drift confirmed as
designed; **a SUMMON dropped to 0 inside a Foundation produced ZERO prompts**) · **2bV-10**
(right-click cancel → "Lay Foundation cancelled — Investiture refunded", nothing placed; a valid
click drew the gold `#e8c060` 600×600 px = 10 ft square named "Foundation"; a combatant flipping
`flags.cosmere-rpg.activated` inside it got "🧱 … begins their turn in a Foundation — +2 to all
defenses" with the AE's three `+2` changes and defenses 14→16 — **the Magnum Opus upgrade path proven
live**, `civFoundationBonus: 2`; a third Foundation past the tier-2 cap posted "🧱 …'s oldest
Foundation crumbles (sustain cap 2)" and the oldest drawing AND its fortified Region both went) ·
**2bV-11** (zero Foundations → "needs at least one active Foundation. Nothing spent." pre-cost, no
consume dialog; valid → the fortify card, `bastionActive: true`, a `… — Fortified Foundation` Region
carrying BOTH `edha-content.enemy-cost` and `edha-content.fortified` behaviors, drawing recoloured
red to "⛨ Foundation (fortified)"; the Construct walking in gained `Bastion (+2 defenses)` 12→14 and
LOST it when its Foundation crumbled; an enemy walking in got **exactly ONE** "⛨ … enters …'s
fortified Foundation — takes 9 impact" (`(2)d(2*3+2)=9`) and **exactly ONE** save card **named
Bastion** — "⛨ Bastion — Agility vs your Red: … Agility 3 vs your Red 14 — Slowed" — independent
corroboration that the v13 double-event surface is closed here too; a Foundation laid while Bastion
held came up fortified immediately, Ben R4) · **2bV-12** (one Foundation → "needs two active
Foundations. Nothing spent." pre-cost; two → both drawings read "⛨ Foundation (fortified) ⇄" sharing
one `link` id; an ally standing in one clicked Teleport, picked an arrival point and moved
(6000,11100)→(7200,11400) with "🛤️ … steps through the trade route…"; **all three cancel paths
refunded in full** — cancel at the FIRST pick, a pick OUTSIDE any Foundation ("that point is not
inside one of your Foundations. Refunded."), and cancel at the SECOND pick) · **2bP-8 + 2bP-9 in one
action** (a Construct with its `summonTalent` flag REMOVED — the genuine pre-deploy shape — was found
by the **name fallback**: "Edha: …'s Combat Construct (…) dismissed — resummoning (cap 1)"; the old
actor and token were deleted and a fresh Construct + token appeared).

⚠️ **The run-1 orphan `Combat Construct` token can NEVER satisfy 2bP-9** — its `actorId`
(`bYsKFlS4joFWz08Y`) points at a **deleted actor** (`token.actor` is null; no directory Construct
exists), and every summon lookup goes through `game.actors`. It is a dangling token reference, not
an un-flagged Construct. It stayed exactly where it was at (7500, 4800) through a full replacement
cycle. Ben's to delete whenever convenient.

*(**2bV-15 Tempered Edge** — RETIRED on evidence 2026-07-27v. Its own text already read "nothing is
open on this row any more"; the trailing "only the FAIL row above blocks the family" was stale — that
FAIL (the Construct-consuming family) was retired at bench run 8. Evidence: bench run 7 measured it by
NET against a deflect-2 target — Construct Slam base `(2)d(2*3+2)+2 = 17`, rider card "🐺 Tempered Edge
(Bench — Civilization): **+11 energy** and the hit ignores Bench Target — Floater's deflect", **net
applied 28** = 17 + 11 with the deflect fully compensated; and the load-bearing **negative** held —
Siege Cannon's `(2)d(2*3+2)+2+2 = 10` energy applied for exactly **8** = base − deflect with **no**
Tempered Edge card, `whenDealerItem: "Construct Slam"` excluding it correctly.)*

ℹ️ **The owed deity-pack `creatureType` mint does NOT gate any Civ row.** A freshly forged Construct
still reads `system.type = {"id":"humanoid"}` (run 7 confirmed the live pack rule carries no
`creatureType` field while `data/authored/deity-civilization.json` does) — but Civilization's
predicate is `edhaCivIsConstruct`, which tests the `summon` flag + the name prefix, not `system.type`.
The only reader of the `system.type`-based `edhaIsConstruct` is Fault Line's `constructMult`
(Destruction, already benched).

- [ ] ⚑ **Civ enemy-cost — GO, KEEP the experiment (bench run 7, 2026-07-27e — resolver-level evidence)** — the custom type DID register (`CONFIG.RegionBehavior.dataModels["edha-content.enemy-cost"]` → `EdhaEnemyCostRegionBehavior`, a true subclass of the native `ModifyMovementCostRegionBehaviorType`), and the native base's **only** resolver is `_getTerrainEffects` (`Object.getOwnPropertyNames` on the base prototype gives exactly `prepareBaseData`, `_onUpdate`, `_getTerrainEffects`) — which the subclass overrides. Called on the real behavior with the real tokens: the **ALLY** (disposition 1 = `ownerDisposition`) returns `[]` → ×1; the **ENEMY** (disposition −1) returns `[{"name":"difficulty","difficulty":2}]` → ×2. Identical for token documents and placeables. The second guessed name `getTerrainEffects` does not exist on the base and is dead code that can be deleted. **Ben's remaining half is the ruler UI itself** (a canvas-feel read a hidden-pane session cannot take) — but the underlying cost resolution is proven disposition-filtered, so the experiment should be KEPT.

---

# BENCH — Power (Tyrith, deity)

Run on **Bench — Power** (a Weakened enemy in Black range; a melee-hit victim). No pack
rebuild pending.

**✅ Bench run 7 (2026-07-27e): the ENTIRE Power section ran and 17 rows are RETIRED on evidence.**
Nothing in Power failed. Row by row:

- **2bH-1** — three rules on the Events tab; a target that is NOT compelled/frightened/weakened
  refuses **pre-cost**: "Edha: Bench Target — Floater must be compelled / frightened / weakened for
  Absolute Authority — nothing spent." No consume dialog, no card, no roll, net spend 0.
- **2bH-2 — the first `edha-test-fail` payload in the project FIRES.** Driven twice; the second run
  gated on **Frightened only** so the payload was unambiguous: `1d20+5=20` vs a forced COG 40 →
  "Absolute Authority: 20 vs … COG 40 — FAIL." then "Absolute Authority — Bench Target — Floater is
  **Weakened**." and the status appeared (`["frightened","weakened"]`). The whole fail branch is live.
- **2bH-3** — success (`18` vs COG 3) posted only the 👑 note card ("you choose the target's action on
  its next turn — it cannot be forced to directly harm itself. Forced volition, GM-run.") and applied
  **no** status.
- **2bH-4** — `crowned` status + the "Crowned (Crown of Thorns armed)" effect + the scene-arm card
  carrying the "Crown ping (target the character first)" button.
- **2bH-5 — H8's cross-talent reaction WORKS, on success AND on failure, from two sources.** Crowned
  + Absolute Authority SUCCESS → a SECOND card "⚡ Crown of Thorns (Bench — Power) — **2** spirit to
  Bench Target — Floater" (Presence 2), 2 HP dealt; the same talent FAILING → the same second card
  and 2 spirit; **Kneel** as a second, differently-routed source → identical card. ⚑ **Partial
  coverage:** Sovereignty's **Censure / Decree of Ruin** as sources 3 and 4 were NOT driven (a
  cross-tree PC swap this run did not have budget for) — Ben's or a later run's.
- **2bH-6 / 2bU-14** — Kneel's announcement path still pings Crown (above), and on **combat delete
  `Crowned` clears** — along with the whole Power scene-arm family: all four statuses
  (`crowned`/`fury`/`unstoppable`/`mantled`) gone, all five effects gone, defenses 16→14,
  `bonusTally` cleared, `sceneOnce` re-armed, `tempHp` unset.
- **2bH-7** — re-use while Crowned: "Edha: Crown of Thorns is already active — nothing spent." net 0.
- **2bH-8** — the manual "Crown ping" button applied 2 spirit (Presence) to the targeted creature.
- **2bU-7** — no target → "target the creature first (nothing spent)"; a target 83 ft away →
  "outside your Attunement Range (black) — nothing spent" — both pre-cost, net 0. Valid: YOU rolled
  Black (`1d20+5=20`) → "🎯 Kneel: … is Compelled (by Bench — Power). Next action: move toward the
  compeller or do nothing — movement ENFORCED", `markedBy.compelled` naming Kneel. **The move veto
  works in both directions:** a walk AWAY was refused in place with "…is Compelled (Kneel) — it may
  only move toward Bench — Power, or stay put", a walk TOWARD passed silently. And the auto-advantage
  fired: an attack on the Frightened target in Black range rolled **`2d20kh + 4`**.
- **2bU-8** — an enemy-only target set refused pre-cost ("target up to 3 valid creature(s) in your
  Attunement Range (black) first. Nothing spent."). Valid with three allies: **ONE shared roll**
  `2d8 = 4` granting all three 4 Temp HP, the advantage card naming all three (`advAttackNext` on
  each), and tier spirit to self (42→40). **Keeps-higher confirmed** — an ally pre-loaded with 99
  Temp HP stayed at **99**, never stacked down. ⚑ cosmetic: the no-op keep still relabels that ally's
  `tempHp.source` to "Investiture of Command".
- **2bU-9's last open half** — the re-use-while-armed refusal for Warlord's Advance: "Edha: Warlord's
  Advance is already active — nothing spent." net 0. Row fully closed.
- **2bU-10** — arm card + `momentum`; re-use while armed refused pre-cost; the next weapon hit posted
  "🐺 Momentum of Victory (Bench — Power): **+2 impact strike**" (= tier) and **consumed** the arm.
- **2bU-11** — arm + `fury`; re-arm refused pre-cost. Dropping a hostile adversary below half
  whispered "🗡️ Warlord's Fury: the tally rises — now 1", the kill added "🐺 … **+1 keen strike**"
  (min(tally, 2×tier)) then "the tally rises — now 2" (`{belowHalf: [1], kills: 1}`). **The negative
  holds:** a friendly ALLY dropping to 0 left the tally byte-identical.
- **2bU-12** — arm + `unstoppable`; re-use while active refused pre-cost. Slowed applied → "🏃
  Unstoppable Advance: … cannot be slowed — the condition is shrugged off" and the status did not
  stick. A `walk` through two enemy squares produced **exactly two** impact cards, one per enemy with
  its own roll (3 and 14) — **no double-fire on a movement path** — and a second pass over the same
  two enemies produced **zero** further impacts (once per enemy per activation).
- **2bU-13** — the +2-all-defenses AE (14→16) with its three `+2` changes, the note card, `mantled`,
  and a repeat refused pre-cost ("was already used this scene"). Melee hit → "🐺 Mantle of the
  Aspirant: **+2 spirit strike**". **The ⚑ standing ally-injector caveat is CLOSED:** an ally's
  Athletics roll in Black range read **`1d20 + 4 + 1[Mantle of the Aspirant] = 13`** — injected and
  labelled, surviving the dialog rebuild. Taking 10 damage posted the whispered redirect card with
  the right budget: "You may redirect up to **2** of it to one or more willing allies…" + the button.
- **2bU-16** — clearing the Compelled status also cleared `markedBy` (the mark dies with the status),
  and the away move that had been vetoed then went through freely with no warning.

⚑ **Extends the standing out-of-combat scope characterization (07-26k; run 6 added Restrained):**
2bH-2's Weakened landed with `duration.type: "none"` and **no** timed marker, so "until the end of
ITS next turn" does not expire out of combat. Same family as the existing note — recorded, not
re-derived, and not a new bug.

---

# BENCH — Knowledge (Gnothis, deity)

Run on **Bench — Knowledge** (an enemy bearer in Green range; an ally attacker). No pack
rebuild pending. **Bench run 8 (2026-07-27g) drove every row in this section**; five retired outright,
the rest were all blocked behind ONE engine defect — **fixed 2026-07-27h, ENGINE-ONLY (relaunch / F5,
no rebuild, no ⟳ Sync)**. The six rows below are the run-9 re-test batch.

⚠️ **Before the first row: clear every leftover `Insight` marker** on the bench targets. Effects written
by the pre-fix engine stored nothing, so the system's own `stacks ?? 1` default makes them read as **1**
— which is the honest reading of that document, but not the number any old card claimed. Start from no
marker so the counts you read are the ones this engine wrote.

**RETIRED on evidence, bench run 8 (2026-07-27g).** **2bT-2** (Studied Mark transfer: marking
Adjacent A moved everything off Floater — Floater's `Insight` icon and its `markedBy.insight` stamp
both gone, A gained icon + stamp, and the owner pointer moved to
`counters.insight = "Actor.axH7sFmbZqJqv2YV"`) · **2bT-4** (The Final Study: the once-per-scene refusal
held with nothing spent — "Edha: The Final Study was already used this scene — nothing spent.",
Investiture unchanged at 4; the SUCCESS card ended with the free-Strike roster naming fifteen allies in
Green range — "each ally in Attunement Range may immediately make a free Strike … : Bench — Red,
Bench — Green, … Combat Construct (Bench — Civilization)" — with White/Blue/Black correctly outside the
range and excluded) · **2bT-5's two remaining halves** (re-use while armed → "Edha: Predatory Strike is
already active — nothing spent.", Investiture unchanged; and the **`weaponOnly` negative PASSES** — with
`predprimed` live, Killing Blow's own `2d8` vital hit did NOT consume the icon and posted no Predatory
Strike rider, then the next *weapon* hit did) · **2bT-9** (Pack Share: arm gave the
`Pack Sight (allies share your mark)` icon plus a PUBLIC snapshot carrying **all three** defenses
("Physical 14, Cognitive 14, Spiritual 14" — contrast Studied Mark's, which omits Cognitive); re-arm
refused "already active — nothing spent."; an ALLY's weapon hit posted "🐺 Pack Share
(Bench — Knowledge): **+2 vital** on Bench — Heroic's hit" (+Tier) and the first such hit that round
placed "1 Insight on Bench Target — Floater"; **your own hits get nothing from it** — a self weapon hit
posted only Hunter's Discipline's +2) · **2bU-15** (Predatory Strike regression: the armed weapon hit
consumed `predprimed`, added "🐺 Predatory Strike (Bench — Knowledge): **+9 vital strike**"
(×max(Insight,1)) and placed "1 Insight placed on Bench Target — Adjacent A (now 1)").

> **✅ Bench run 9 (2026-07-27i): the 07-27h counter fix is CONFIRMED LIVE and the whole re-test batch
> PASSED — the gate row and all six re-opened rows are retired.** Served-engine SHA-256 matched repo
> HEAD exactly (`5f78e01d…3987c7e`, 1429834 LF bytes), so this ran against the deployed fix.
> **Gate row:** Studied Mark placed → effect named `Insight [2]`, `system.stacks` **2**, `effect.system`
> keys exactly `["isStackable","stacks"]` — **no `count` key**; the system's own cycle write took it to
> `Insight [3]` and the engine read 3 (proved by Killing Blow's ×3); cycling down gave `Insight [1]`
> then removed the status entirely. ⚠️ **One correction to the row's method: `insight` is registered
> `condition: false`, so it never appears in the sheet's Conditions widget** — the literal "sheet →
> Conditions → cycle" path does not exist for any Edha status (all ten read `condition: false`). The
> run drove the widget handler's exact writes instead (`effect.update({system:{stacks:n}})`, and
> `toggleStatusEffect` at 0), which the engine comment already claims is the same operation.
> **2bT-1** (card "bears 2 Insight", effect `Insight [2]`, stored 2 — all three agree; transfer moved
> everything to the new bearer and left the old with no marker, pointer and `markedBy` both moved) ·
> **2bT-3** (the two branches finally DIFFER: success rolled `(2d8) * 3` = 18 and cleared bearer +
> pointer; failure rolled a bare `2d8` = 13 and printed "-1 Insight … (**now 2**)", not "now 0") ·
> **2bT-6** (4-Insight bearer killed → "place **2** Insight" = floor(4/2), with the Green-range
> candidate list; and the true-negative holds — at 1 Insight **no Hunter's Discipline card at all**
> while Death Mark still offered 1) · **2bT-7** (3-Insight bearer → Death Mark offered the full **3**
> beside the ally-burst card; R9 last-click-wins verified in BOTH orders — HD(2)→DM(4) ended at
> `Insight [4]`, DM(3)→HD(1) ended at `Insight [1]`, each card reading back the true stored value) ·
> **2bT-8** (ticked 2→3→4→5 with every card printing the true number and the effect renaming; the
> sixth tick at cap posted **nothing at all**; then `capFormula` edited 5→7 on the Events tab and the
> next ticks climbed to 6 then 7 — the cap is the RULE's) · **2bT-10** (R10: The Pack `+3` from
> `@counter` and Pack Share `+2` posted as two separate additive cards; R11: each placed its own 1
> Insight independently — "now 4" / "now 5" — the same-round second hit repeated both bonuses and
> placed nothing, a new round re-armed both; and the 07-27h ruling default holds — with the marker
> hand-cleared and the pointer surviving, The Pack posted **no** bonus card but **still placed**).
> ⚠️ Operating note confirmed: Accumulate ticks on the **owner's** turn start via `combat.update({turn})`.
*(**The 07-27g root cause row** — RETIRED 2026-07-27v. It was a record, not a test ("this row is
history"), and its re-tests all passed at bench run 9: Studied Mark placed → effect named `Insight [2]`,
`system.stacks` **2**, `effect.system` keys exactly `["isStackable","stacks"]` with **no `count` key**;
2bT-1/3/6/7/8/10 all green off it. The root-cause narrative survives in the 2026-07-27h handoff delta
and in `tests/` — it is not lost by deleting the row. Kept below, unchecked-out, for one more read:)*

> **The 07-27g root cause, for the record** — **proven by mutation:** `edhaCounterOn` reads `Number(eff?.system?.count)` and `edhaCounterApplyGM` writes `{"system.count": count}` (engine ~13543–13562, both carrying the comment "⚑ system.count — bench-verify"). The cosmere `ActiveEffectDataModel` schema has **exactly two** fields — `isStackable` and `stacks` — so the write is silently dropped by DataModel validation (`effect.update({"system.count": 2})` **resolves with no error** and reads back `system: {isStackable: true}`), and every read is `Number(undefined) || 0` = **0**. **The right field is `system.stacks`** (`NumberField`, nullable): writing 2 persists AND renames the effect to `Insight [2]`, which is exactly the "shows count 2" display the old ⚑ asked for. Verified both directions on the live bearer. **Observable blast radius, measured this run:** Studied Mark's card says "bears **2** Insight" while the stored count is 0 (line 16769 returns the clamped *intended* value without reading back — the card is truthful about intent and lies about state) · Killing Blow prints "-1 Insight on … (now **0**)" on a failure that should leave 1, and "all **0** Insight removed" on a success, and its ×count multiplier degrades to ×1 on **both** branches so success and failure are indistinguishable in damage · The Final Study prints "all **0** Insight removed" · Hunter's Discipline's on-kill floor(count/2) transfer card and Death Mark's FULL-count transfer card are **both suppressed** by the `if (amt > 0)` gate (engine ~13746) · Accumulate can never reach its cap-5 clamp · The Pack's `+@counter` bonus is always 0, and because the placement queue is gated on `amt > 0 || require === "armed-self-status"` (engine ~1214) The Pack's own once-per-round placement (R11) never queues either. Also affects **any `@counter` substitution in any tree** (engine line 1184). **FIXED 2026-07-27h** at the three sites (`edhaCounterOn` → the new `edhaEffectStacks`, both `edhaCounterApplyGM` writes, and the `edhaRegisterStatuses` seed), plus the `placeCounter`/`placeList` queue no longer gated on `amt > 0`; 268 tests green including a case that a legacy `system.count` document must NOT read as its count. This row is history — the re-tests are the rows above and below it.

---

# BENCH — Order (Tessavain, deity)

Run on **Bench — Order** (a willing adjacent ally; an Edict-able enemy in Blue range; ideally a
second Order PC for the shared-icon row). No pack rebuild pending. **Bench run 8 (2026-07-27g) ran this
section end to end: seventeen rows retired on evidence, nothing in Order failed.**

**RETIRED on evidence, bench run 8 (2026-07-27g) — the ledger is intact and the migration's premise is
proven.** **2bL-1** (the pact FORMS: Bench Ally — Two gained the `Covenant` icon *and* the
"Covenant (Bench — Order)" AE, the card named them "(1/2)" with a **"Break the Covenant"** button, and
the H3 ledger held `{uuid: "Actor.LzEB1ChIfqqgYIrJ", name: "Bench Ally — Two", talent: "Covenant"}`) ·
**2bL-2 — the row that mattered, and it PASSES both halves**: Concord was not refused and listed the
ally **by name** ("… Bound: **Bench Ally — Two**."), and Final Decree's card named them as
"Witnesses: **Bench Ally — Two**." Neither reader said "no Covenants" — the ledger has NOT split ·
**2bV-17** (the 07-24u key-vs-marker reconcile fix's first bench, all three parts: moving the ally out
of White range removed the +1 AE from **BOTH** (defenses 15/15/15 → 14/14/14 on caster and ally), moving
back restored it on **BOTH**, the `Covenant` marker itself correctly persisting through both; and
partner-damages-partner still posts the break watch — "🤝 Covenant watch: Bench — Order damaged Bench
Ally — Two — if that was a DELIBERATE attack, the Covenant ends (owner-judged; incidental/area damage
may not count)" with its button) · **2bV-18 — the point of the migration** (edited Covenant's
`system.events.CovenantPact0000.handler.capFormula` from `@tier` to `1` on the Events tab; the very
next pact's card changed to "(**1/1**). The oldest (…) fades — you sustain at most **1**." The document
drives it. Restored to `@tier` afterwards.) · **2bL-3** (all four pre-cost refusals, Investiture 4→4
every time: no target "target the creature first (nothing spent)"; an enemy "Bench Target — Adjacent A
is not an ally — nothing spent."; 2+ squares away "Covenant requires touch — move adjacent to Bench
Ally — Two first. Nothing spent."; already-covenanted "Bench Ally — One already bears your Covenant —
nothing spent.") · **2bL-4** (both parties wear "Covenant (Bench — Order)" with three
`system.defenses.*.bonus +1` changes, 14→**15** on all three defenses each, in range only) ·
**2bL-5 — the pass's whole premise** (edited the Effects-tab AE "Covenant - while in range" from +1 to
+2, re-formed the pact, and the applied effect granted **+2** — Bench Ally — Two 14→**16** on all three.
Restored to +1 afterwards.) · **2bL-6 including its ⚑ half** (at cap 2 a third pact evicted the oldest —
"The oldest (Bench Ally — One) fades — you sustain at most 2", ally's icon gone; and with the cap edited
to 1 while holding 2, the next pact dropped **BOTH** and cleared **both** icons — "The oldest
(**Bench — Heroic, Bench Ally — Two**) fades" — so the multi-drop fix is real) · **2bL-8** (BOTH break
buttons: "Break the Covenant" → "📋 Covenant: Bench — Order's bond with Bench Ally — Two ends (1 left)",
icon + AE cleared on both, ledger shrunk; and "It was deliberate" → "… ends (0 left)", ledger empty) ·
**2bL-10** (Bear Witness fires at the start of **every** round, not once per combat — rounds 1 and 2 both
posted "⚡ Bear Witness — Bench — Knowledge, Bench Ally — Two gain **3** Temp HP. (your White)", White
rank 3, both covenanted allies on ONE card) · **2bL-11** (Temp HP **keeps the higher**: the ally already
held 6 Temp HP from Final Decree, Bear Witness offered 3, and the value stayed **6** — it did not go
down. ⚠️ Cosmetic: the `source` was relabelled to "Bear Witness" while the value stayed 6, so the
surviving 6 is now mis-attributed on the flag) · **2bV-1** (the prohibition picker is a real
**DialogV2** — window title "Edict — declare ONE prohibited action", radios `move`/`attack`/`invest`/
`other` plus an ally `<select>` — confirming the 07-27d AppV1→DialogV2 conversion live for the second
window; the place card carried the prohibition, the tier cap "(1/2)", Sealed Edict's notarize hint,
Lawkeeper's Eye's reveal line, and the ⚖ Violated button) · **2bV-3** (⚖ Violated → "⚖️ Edict violated
(declared violation) — Bench Target — Adjacent A broke ' move from its space ': **14 spirit +
Disoriented** until the start of Bench — Order's next turn. The Edict is consumed." A second click
produced no duplicate payload and no card — ⚠️ but the button had already flipped to "⚖ resolved", so
whether the documented "already gone" notice fires could not be confirmed) · **2bV-4** (no unsealed
Edict → refused pre-cost "no Edict-Bound left to mark sealed — nothing spent."; sealing named the
newest; on violation the violator ALSO tested engine-rolled — "⚖️ Sealed Edict — Discipline vs your
Blue: … Discipline 5 vs your Blue 15 — breaks" → "takes an additional **6** spirit and is **Weakened**
until the end of its next turn", total 20 applied and both statuses landed) · **2bV-5** (not on the
ledger → refused pre-cost "is not on your edicts for Verdict — nothing spent."; the FAILURE branch spent
the cost and denied the court ("10 vs … COG 14 — FAIL"); the SUCCESS branch ("22 vs … COG 14 — SUCCESS")
resolved the Edict *and* ran the court — "the court turns on the accomplices (1 within 10 ft): **one
shared roll**, 10 spirit to each who fails Discipline vs your Blue" then "Bench Target — Adjacent B:
Discipline 13 vs your Blue 17 — fails — 10 spirit + Disoriented") · **2bV-7** (whispered Reaction card
with the right arithmetic — the ally took 8, the card offered "take **4** of it yourself (same type),
Bench Ally — Two heals back **7**, and BOTH of you gain **3** Temp HP. (Once per round.)" =
floor(8/2), min(8, 4+White), White rank; the click resolved exactly that (Order 42→38, ally 24→31, both
`tempHp {value: 3, source: "Shoulder the Oath"}`), and a second damage event the same round prompted
nothing) · **2bV-9** (repeat use → "Final Decree is once per scene. Nothing spent."; the valid cast
decree-bound every enemy in Blue range with the `edict` icon and stood the covenanted ally as Witness;
resolving with the violator targeted gave **ONE** shared Temp-HP roll ("Bench Ally — Two gain **11**
Temp HP + advantage on their next attack test", flags `tempHp` + `advAttackNext` both written) and
**ONE** shared spirit roll to each enemy within 10 ft **violator included** ("Bench Target — Adjacent A,
Bench Target — Adjacent B, Bench Target — Undefended take **9** spirit", all three HP-verified), then
"The Decree is spent.").

⚠️ **WORLD-HYGIENE / SCOPE SIGHTING from 2bV-9 — for the rulings batch, not a bug report.** Final
Decree's "every enemy in Attunement Range" has **no encounter scoping**, so on a shared map it binds
every hostile token in range — this run it decree-bound five of Ben's placed playtest adversaries
(Frostbinder, Stitchmother, three Mutated Thralls) alongside the four bench targets, writing the
`Edict-Bound` status to them. Same family as the standing out-of-combat scope characterization (07-26k).
The run cleared what it applied.
*(**2bL-7 — Covenant — the SHARED icon** — RETIRED on evidence 2026-09-05, bench run 26, as a
**positive/negative pair**, by staging TWO extra Order PCs deliberately (`Bench — Order II` and
`Bench — Order III`, full duplicates in the bench folder with their `edha-content` flags cleared, both
deleted at cleanup — **Ben's own `Bench — Order` and its pre-existing pact were left alone**). Both
covenanted the SAME ally (Bench Ally — Two, adjacency gate honoured: an earlier attempt at range was refused
with "Covenant requires touch … Nothing spent"). The ally then carried the shared `covenant` status
(`condcovenant0000`) plus one per-owner proximity AE each. ✅ **POSITIVE**: Order II clicked
"Break the Covenant" — its ledger emptied, its own "Covenant (Bench — Order II)" AE went, the card read
"Bench — Order II's bond with Bench Ally — Two ends", and **the ally KEPT the `covenant` status**, because
Order III's pact was still live. That is `multiOwner`. ✅ **NEGATIVE**: Order III then broke its pact and the
`covenant` status went away. Nothing about a second player's marker was stripped silently.)*

---

# BENCH — Heroic paths

Run on **Bench — Heroic** (it carries exactly the talents these rows name, across all six
paths).

> ✅ **THE HEROIC PACK IS REBUILT AND THE BLOCK IS CLEARED (bench run 11, 2026-07-27m).** The engine
> was hash-verified identical to `HEAD` (`3c69f7d2…`, 1 439 212 normalised bytes) and all five packs
> read their fixes live before anything was driven. **Seven of the eight dead-skill-key rows PASSED
> and are retired** — 2bJ-12 · 2bB-4 · 2bN-2 · 2bM-6's number · the Contest-gate spot (Set at Odds +
> Synchronized Assault) · the Warrior stances spot · plus the quarry advantage row and 2bX-17.
>
> ⛔ **Sharp Eye is the ONE that did not come back, and its cause is NOT the skill key.** See 2bQ-4:
> the `prc` fix is live on both the pack and the owned item, and the talent is still a total silent
> no-op, because its `activation.type` is `utility` with no `activation.skill`, so the system never
> rolls a test for its `edha-def-test` rule to resolve. **2bD-7 stays open behind it.**
>
> ⏳ **FIXED 2026-07-27n, and this section is deploy-blocked ONE more time.** The activation is now
> `skill_test` / `prc`, verified in system source rather than inferred, so **2bQ-4 and 2bD-7 both need
> a SECOND `foundry-build heroic` + ⟳ Sync Talents** before they can be driven. Nothing else in this
> section is blocked.
>
> What is left in this section: those **2 deploy-blocked rows** (2bQ-4 + 2bD-7 — ✅ both **UNBLOCKED**
> by the 07-27u heroic build; they need a bench drive) · **1 ⚑ DESIGN CALL THAT IS YOURS** (the four
> dead prereqs) · **1 out-of-scope row parked here** (Probability Cascade is a **Blue** talent).
>
> **Two Heroic rows left for `EDHA_RULINGS.md` on 2026-07-27w**, both pure decisions: **R-18** (should
> quarry advantage refuse to stomp an active disadvantage? today it stomps, which is the house
> convention) and **R-25** (Rallying Shout's reminder now prints on an ally above 0 HP — keep the
> always-print or restore the old gate? its number defect is fixed and table-verified). The roll-dialog
> row stays here as ⚑, because its remaining half is a *look* — is the die icon's colour readable — and
> the "so what do we do" half is **R-39**.
>
> *(**2bC-1 · 2bF-14 · 2bF-16 — all three RETIRED on evidence 2026-07-27v.** Each had passed both of its
> factual halves and was being held open by an **empty-Events-tab design question that Ben already
> settled on 2026-07-24t** — the empty tab is ACCEPTABLE, because the test is editability, not which
> tab (handoff §9m: no open items). **2bF-14** — with Calm Appeal owned, a Steadfast Challenge success
> printed "🕊️ Steadfast Challenge: **Calm Appeal** — spend 1 focus to pacify the target; resisting costs
> it +**2** focus" at Discipline rank 2; **with the talent deleted**, a success ("24 vs SPI 14") landed
> Disoriented and the disadvantage but **no** 🕊️ line — a positive and its negative in the same run
> (bench run 10). **2bF-16** — its line printed on Valiant Intervention's success (bench run 9).
> **2bC-1** is the inverse question and answers itself: the rule is THERE and it works — exactly
> `HiSocOppAdder001` / `edha-next-test-mod` / target `self` / `opportunity: true`; using it banked
> `oppCredit {source: "High Society Contacts"}` and the next test printed "🎲 Opportunity! …(+1 granted
> by High Society Contacts…)" and cleared it (bench run 10). "Is a rule being there what you want" is
> answered by **iron rule 2b** — behaviour belongs on the talent — not by a bench run.)*
>
> ✅ **2bC-8 IS RETIRED, AND IT WAS NEVER A ROSTER GAP — bench run 12 (2026-07-27o).** The standing note
> here said it needed `scripts/bench-setup-console.js` to grant Probability Net to a bench PC. That fix
> could never have worked: **Probability Net is an ADVERSARY ability**, on the Wrenchmaster in
> `data/adversaries.json` — it is not a talent and is in no talent pack, so the setup script's
> name lists cannot reach it. The right drive was the standing one for any adversary surface: import it
> **fresh from the pack** into the bench folder. Evidence in the delta. *(General lesson: before calling
> a row a roster gap, check whether the thing is a talent at all.)*

> **✅ Bench run 9 (2026-07-27i) drove this section for the first time — fourteen rows retired on
> evidence.** **2bE-7 — the priority row, and the H1 payload dispatch WORKS**: success ("23 vs COG 14 —
> SUCCESS") wrote **both** payloads — "🎲 Tactical Ploy: … next test — taking **-1d4**" (flag
> `nextTestMod {source: "Tactical Ploy", formula: "-1d4"}`) **and** "⚡ … loses one Reaction (on the
> tracker)" with the CAE group asserted on the document (`remaining: 1→0, used: 0→1`); the failure
> branch ("6 vs COG 40 — FAIL") landed **neither** · **2bE-3** (the ALLY's tracker gained
> "Edha: Through the Fray (Disengage / Gain Advantage)" while the caster's was untouched — `target:
> target` proven) · **2bD-3** ("Edha: Set at Odds — target the creature first (nothing spent)", focus
> 4→4, Investiture 4→4) · **2bO-1** (55 ft refused pre-cost — "target a creature within 40 ft (nothing
> spent)", the 40 being Authority's doubling, which Heroic owns; 15 ft worked, "next test — taking
> `1d(4 + 2 * 3)`" = the d10 of 2bN-1) · **2bO-5 both halves** (a NON-quarry attack rolled plain
> `1d20 + 4` / `1d6 + 4` with no card and the bonus **stayed banked**; the quarry attack spent it) ·
> **2bX-15** (no target refused pre-cost; the mark gave the `Quarry` icon + "(1/1)"; a second mark
> printed "The oldest (Bench Target — Adjacent A) fades — you sustain at most 1" and the old icon and
> ledger entry were gone) · **2bX-16 — untestable for eight runs, now PASSED end to end** (see the
> ranged-weapon note below): armed → `Tagging Shot (next ranged hit)` on the owner; a **melee**
> Sidesword hit stood the rule down and the arm **SURVIVED**; the **Shortbow** hit consumed the arm and
> placed "🎯 Tagging Shot: Bench Target — Adjacent A bears your Quarry (1/1)" with the ledger entry
> naming Tagging Shot · **2bQ-5** (target became **Diagnosed** and the whisper reported "HP 32/33;
> conditions: …; defenses — Physical 14 , Cognitive 14 , Spiritual 14") · **2bF-15** ("next test — **at
> disadvantage**" with no click, flag written, on an 18 vs SPI 14; Resolute Stand's upsell line printed
> on the success, which is 2bF-16's factual half) · **2bZ-5** (the recovery-die **roll posts** — `1d6`,
> and `system.recovery.die.derived` reads `"d6"`, so the ⚑ recovery-die read path is now verified —
> plus "regains 2 focus") · **2bZ-6** (FAIL branch "6 vs DC 15 — FAIL" still spent the focus; SUCCESS
> branch "22 vs DC 15 — SUCCESS" → "heals N". ⚠️ **A suspected number defect here was RETRACTED after
> measurement**: the card prints the roll TOTAL, not the die, and the substituted formula reads
> `1d6 + 2` with the caster's Medicine 2 and `1d6 + 5` with Medicine 5 while the patient's stayed 0 —
> so `@target.recoveryDie + @skills.med.rank` resolves against the right actors and the talent is
> correct) · **2bZ-7** (with Resuscitation owned, "⚕️ Field Medicine: **Resuscitation**: you may instead
> spend 3 focus…" printed on the success) · **2bZ-9 — the first authored NATIVE rule, end to end**
> (drop 1 held at **5** = `max(1, @skills.ath.mod)`; drop 2 went down to 0; a **long rest** fired the
> native `update-actor` rule and cleared the spend; drop 3 **held again**. ⚠️ Worth knowing: the native
> rule stores the **string** `"false"`, not a boolean — it works because the floor check coerces, but a
> future change to plain truthiness would silently re-break it) · **2bA-8** (Shattering Blow's own note
> came through and the push landed — see the collision control below) · **2bM-2** (ally became
> **Determined** and the card named them; Lessons in Patience's +1 focus fired alongside; the three
> reminder lines printed, which is 2bM-5, and Rallying Shout's line printed on an ally **above 0 HP**,
> which is 2bM-6's factual half).
>
> **A COLLISION CONTROL WORTH KEEPING** (this also settles the ⚑ engine-move-collision row's engine
> half): Shattering Blow pushed Adjacent A **0 ft** when Adjacent B occupied the destination square,
> and **5 ft** (4500 → 4800) when the lane was clear — same talent, same round, negative and positive.
> Tokens never stacked. Manual drags remain Ben's ⚑ half.
>
> ⚠️ **Design sighting for the rulings batch, not a bug report:** Shattering Blow (a Warrior melee
> talent) also fired its 5 ft push on a **Shortbow** hit — its rule carries `whenDamageType: "any"` and
> no melee gate, unlike Warlord's Advance's `meleeOnly`. Now visible for the first time because the
> roster finally has a real ranged weapon.
>
> **✅ Bench run 10 (2026-07-27k) — the dedicated Heroic run. Twelve rows retired; ZERO runnable rows
> remain on the current deploy.** Engine hash-verified identical to `HEAD` before driving anything, so
> the four 07-27j engine fixes were live. **2bE-4 — the CAE write-race fix is table-verified**: a combat
> start with Foresight AND Sidestep owned wrote **all three** groups (`base`, `Edha: Foresight`,
> `Edha: Sidestep (Dodge only)`), and two Through the Fray uses in one tick wrote **two** groups — run 9
> got two cards and one group · **2bO-7 — the double-dip is fixed**: one banked use, ally Strike on the
> quarry → attack `1d20 + 4 + 3[Pack Hunting]`, damage `1d6 + 4` **clean**, exactly **one** card, flag
> consumed · **2bE-5** (Chain armour, `deflect.value` 2 → **only** Foresight reached the tracker,
> Sidestep granted nothing; Foresight is the positive control in the same combat start) · **2bF-13**
> ("24 vs SPI 14 — SUCCESS" → target **Disoriented** asserted on the document AND `nextTestMod
> {mode: disadvantage}` written, no click) · **2bZ-8 all three halves** (Shatter Focus drain absorbed —
> "🛡️ Wary: involuntary focus loss reduced by **2**", focus 4→4 at Discipline 2; Surprised **vetoed**
> with "Edha: Wary — Bench — Heroic can't be Surprised while they have focus" and no effect added;
> editing `reduceFormula` to `1` on the Events tab made the next card read "reduced by **1**") ·
> **2bZ-7's negative** (Resuscitation deleted → a Field Medicine SUCCESS "19 vs DC 15" healed 4 with
> **no** ⚕️ upsell line) · **2bC-7** (Emotional Overload wrote the disadvantage onto the **TARGET**;
> the caster's own flag stayed null) · **2bN-3's last half** (an ally's token deleted mid-fight, then
> combat ended → its Determined **cleared**, while Bench — Heroic's *pre-existing* Determined survived) ·
> **2bZ-11 — Cold Eyes end to end** (adversary-type quarry dropped 30→0: "👁️ your quarry is down",
> ledger `{"quarry":[]}`, Quarry icon gone, "🧠 Cold Eyes: regains 1 focus", focus 2→3) ·
> **CAE cluster spot** (Fast Talker 2 · Quick Analysis 2 · Trickster's Hand 2 · Cautious Advance 2 ·
> Backstep 1 — **four Edha groups coexisting on one combatant**, more evidence for the race fix ·
> Practiced Kata auto-entered Vigilant Stance at all three combat starts · stances replaced each other
> with "(Stonestance ended)" · High Society Contacts / Underworld / Rumormonger / Well Supplied each
> banked `oppCredit` and the credit **redeemed** on the next test) · **Envoy cluster spot** (card label
> "Determined" + status · Lessons in Patience +1 focus, ally 0→1 · all four reminder lines · no stray
> mark · Galvanize rolled the patient's `1d6 = 5` and clamped honestly to "regains 4 focus") ·
> **Orphan-token combat guard** (the run-1 orphan `Combat Construct`, resolved **by id**, was refused
> with the exact named toast — "has no actor behind it (deleted world actor?) — skipped from combat" —
> and combat stayed started).
>
> **A WIDER AUDIT WORTH KEEPING:** every skill key referenced by all 62 Heroic talents was checked
> against `CONFIG.COSMERE.skills`. Exactly **9 dead-key sites across 7 talents** — precisely the set
> 07-27j already fixed (Flamestance, Feinting Strike ×2, Confident Command ×2, Set at Odds,
> Synchronized Assault, Rousing Presence's Rallying Shout line, Sharp Eye). **No new ones**, and `lor`
> (Overwhelm with Details) is valid. The heroic rebuild closes the whole family at once.
>
> ⚠️ **A SUSPECTED DEFECT RETRACTED AFTER MEASUREMENT (the run-9 discipline, again).** Stonestance
> first read as a silent no-op because `system.deflect.**derived**` stayed 0 with the stance active.
> It is **not** a defect: `system.deflect.**value**` goes 0 → **1**, and 10 impact damage cost 10 HP
> without the stance and **9** with it. `derived` is the armour-only sub-field and never folds in
> `bonus`; the engine reads `.value` (`edhaDeflectOf`). **Read `system.deflect.value`, never `.derived`.**

- [ ] ⚑ **The roll dialog DOES have an advantage control — run 11's reading corrected, 2026-07-27n (no
      engine change, read this before chasing it)** — bench run 11 retired the quarry advantage row on
      good evidence (`2d20kh + 4` + the 🎯 card on **both** the fast-forward and dialog paths) but
      concluded that "the cosmere dialog exposes **no advantage control at all**", which made the row's
      old "pre-selected / overridable by hand" wording look unsatisfiable. **That conclusion is wrong**,
      verified in `RollConfigurationDialog` (`systems/cosmere-rpg/index.js` ~L3531-3700): the control is
      the rendered **d20 die icon itself** — `_onRender` binds `mousedown` on it and `onClickConfigureDie`
      cycles the mode (**left**-click toward advantage, **right**-click toward disadvantage). It has no
      label, no checkbox and no form field, which is exactly why a DOM read reports nothing. A pre-seed
      from the engine **is** pre-selected (`_onRender` adds the mode as a **CSS class**, i.e. a colour,
      on the die) and it **is** overridable (`onSubmit` returns whatever the clicks left behind). **The
      one real limitation is the preview line**: it is built once in the dialog's constructor, and
      `configureModifiers()` (the `1d20` → `2d20kh` rewrite) runs only after the dialog resolves, so the
      preview always reads `1d20 + N` and then rolls `2d20kh + N`. Correct behaviour, invisible preview.
      **What to check at the table (feel, not pass/fail):** open the attack dialog against a marked
      quarry and look at the die icon's **colour** — is that cue readable enough for you? If not, the
      answer is more whispered advantage cards like the quarry one, **not** an engine change.
*(**2bD-7 — regression: the untouched rows** — RETIRED on evidence 2026-07-28l, bench run 23. It had hung on **Sharp Eye alone** since 07-27k, the other three (Tactical Ploy, Valiant Intervention, Steadfast Challenge) having cleared at runs 9 and 10. Sharp Eye now works — see 2bQ-4 — so all four of the untouched rows behave. Evidence in the delta.)*
      ⛔ **RESIDUE, stated exactly — narrowed 2026-07-27v: 3 OF 4 ARE CLOSED AND ONLY SHARP EYE IS
      LEFT.** ✅ Tactical Ploy (2bE-7, both branches, bench run 9) · ✅ Valiant Intervention (2bF-15,
      run 9) · ✅ Steadfast Challenge (2bF-13's success branch, run 10 — the run-9 FAIL-only reading is
      superseded). **Do not re-drive those three.** The single remaining action on this row is: use
      **Sharp Eye** on a targeted creature and confirm it now rolls — it is no longer deploy-blocked
      (07-27u), so a silent no-op here would be a NEW finding, not the old one. Score this row off
      2bQ-4's result.
*(**Probability Cascade (Blue) — the count-2 half of the 2bO-7 guard** — RETIRED on evidence 2026-09-05,
bench run 26. Run 10's blocker ("needs an Opportunity plus 1 Investiture, cannot be forced") is **stale**:
the Opportunity is honour-system in the prompt text, and the only real cost is the 1 Investiture the
activation consumes. Blue used it (Inv 4 → 3), the `edha-prompt-pick` card offered
"🔮 Probability Cascade — … give this creature disadvantage on its next two tests", and the click wrote
`nextTestMod = {count: 2, mode: "disadvantage", source: "Probability Cascade"}` to Bench Ally — Two.
**Three consecutive skill tests on that actor, in one pass**: ① die control pre-classed `disadvantage`,
rolled `2d20kl + 4` = 14, `count` decremented **2 → 1**; ② still `disadvantage`, `2d20kl + 4` = 12, flag
consumed; ③ **negative control** — die `none`, `1d20 + 4` = 16. So `edhaNextModClaimOk` stays inert for
multi-use test-only mods: the count-2 mod applied to two SEPARATE tests and then expired.)*
*(**2bQ-4 — Sharp Eye** — RETIRED on evidence 2026-07-28l, bench run 23, after two deploy-blocked re-tests and two root causes (the dead `per` skill key, then the `utility` activation). The 07-27n activation fix is live on the owned item — `activation.type: "skill_test"`, `activation.skill: "prc"`, both rules intact — and **both branches drove end to end**. Evidence in the delta.)*
> **✅ On-hit riders — RETIRED on evidence 2026-07-27i.** One Sidesword hit fired the whole set:
> **Startling Blow** → "Bench Target — Adjacent A is **Surprised**" (status asserted on the actor) ·
> **Shattering Blow** → its 5 ft push card, with its own note (2bA-8) · **Subtle Takedown**,
> **Meteoric Leap**, **Anatomical Insight** → their ⏰ GM cue cards, each naming the victim ·
> **Feinting Strike** → fired (its number is broken; see 2bJ-12). **Cheap Shot** did NOT fire on the
> Sidesword hit but **DID** apply **Stunned** on its own attack — see the 2bA-5 note below.
> **Anatomical Insight's Opportunity option also PASSES**: Cheap Shot's unarmed roll (`1d20 + 2 + 1dp`)
> produced an Opportunity and the menu offered "Anatomical Insight: Target becomes Exhausted
> [− half your Medicine ranks]" alongside the four canon spends.
>
> ⚠️ **A REAL CONSTRAINT ON FIXING 2bA-5 (Shockwave Slam), found here.** Cheap Shot is the ONLY on-hit
> talent on Bench — Heroic carrying its own `system.damage.formula` (`@scalar.damage.unarmed`), and it
> is the ONLY on-hit rider that did not fire on a weapon hit — every other one (all `damage.formula:
> null`) fired. That is exactly `edhaDispatchOnHit`'s `itemSpecific = !!tal.system.damage.formula`
> gate, the mechanism 2bA-5 blames. **But for Cheap Shot the gate is CORRECT** — it is an unarmed-strike
> talent and its Stunned should ride its own hit, which it does. So the gate has at least one
> legitimate consumer and **must not simply be removed**; Shockwave Slam's problem is that its authored
> `damage.formula` is a *collision* formula being misread as "this talent has its own attack". Fix the
> discrimination, not the gate. → carry into **test-pass-fixes** with 2bA-5.
- [ ] ⚑ **Four silently-dead prereqs now bite (2026-07-24b)** — **Know Your Moment** (Scholar) lists
      **Mind and Body** as a talent prereq (it was being dropped entirely); **Resolute Stand**
      (Leader) requires **Athletics 1+**; **Shattering Blow** (Warrior) requires **Windstance**
      AND **Perception 2+** (both were dropped); **Animal Bond** (Hunter) spells "companion".
      ⚑ These now ENFORCE where they previously did nothing — if a PC already owns one of these
      talents without the prereq, the sheet may flag it. Expected, not a bug.
      *(2026-07-27k: an agent CANNOT settle this one. Prerequisites live on the tree node, not on
      the talent item — `item.system.prerequisites` reads `null` on an owned Resolute Stand and
      Shattering Blow, which is correct, not evidence. The observable is the sheet's own prereq
      warning on a PC who already owns the talent, and that is a look-at-the-sheet call. Yours.)*
      ✅ **ANSWERED 2026-07-28l, bench run 23 — and the answer is that THERE IS NOTHING TO LOOK AT.
      Ben: this row can be retired; left standing only because ⚑ is your marker.**
      **(a) All four prereqs are real in the built pack** (read off `edha-heroic`): **Know Your
      Moment** → talent `Mind and Body` (managed) + skill `ded` rank 2 · **Resolute Stand** → talent
      `Hardy` (managed) + skill `ath` rank 1 · **Shattering Blow** → talent `Windstance` (managed) +
      skill `prc` rank 2 · **Animal Bond** → a `connection`-type prereq rank 1. None is dropped.
      **(b) The unmet case occurs naturally on the bench**: `Bench — Heroic` **owns** Resolute Stand
      (`actor.hasTalent("resolute-stand") === true`) while `actor.hasTalentPreRequisites(...)` returns
      **false** — it has Athletics 3 but does **not** own Hardy. Control in the same read:
      `leader-hardy` returns `prereqsMet: true`, so the evaluator genuinely discriminates.
      **(c) The sheet cannot flag it, and this is settled from the system's own source, not from a
      look.** The character sheet has no talents tab and the string "prereq" appears nowhere in its
      rendered HTML; prerequisites are rendered only by `TalentTreeItemSheet`, whose tree view is a
      PIXI **`<canvas>`** with no per-talent DOM node. Its two node getters are the whole vocabulary:
      `isTalentObtained` checks ownership only, and **`isTalentAvailable` short-circuits —
      `if (actor.hasTalent(this.data.talentId)) return false;` runs BEFORE prerequisites are ever
      consulted**. `_draw()` has no third branch. So an owned-but-unmet talent renders exactly like
      any other owned talent: **there is no warning state to see**, and "the sheet may flag it" is
      answered **no**.
      ⚠️ Also measured: `available:false` on an obtained node proves nothing about prereqs — every
      obtained node reads false. Do not read that field as a prereq signal.

---


# 🎮 Player-client window (2026-07-19 — a second client is logged in; run these FIRST)

The wired-GM + LAN-player networking is verified (invite links green; the internet port checked
reachable from outside on 07-19). While the second client is up, burn down the rows that CANNOT
be tested solo — they have sat unbenchable at the bottom of every solo pass. **Deploy first** if
you haven't since the 07-19 pull: Foundry closed → `deploy-to-foundry.bat` → relaunch → one
**⟳ Sync Adversaries from Pack** click (covers the 07-17c / 07-18b / 07-19 batches in one go —
see DEPLOY STATE above).

> ## ✅ Bench run 13 (2026-07-27p) burned this window down with `PlayerBench` + `Bench` up together.
> **Retired on evidence:** the whole *Illusion belief loop* (6 rows, incl. both ⚑⚑ client-veil rows),
> the whole *Playtest-2 fixes* pair, *Sense-through reveals*, *CAE use-grants*, and the *sync-button*
> bulk row. **Still open:** *GM summon relay* (PARTIAL — blocked by a world PERMISSION, see its row),
> **2bAA-8**'s refund half (FAIL → test-pass-fixes), and the heavy two-PC stagings below.
> **Pointer 8 (Unnerving Approach push relay) was STALE and is deleted** — its home section
> *Black — 07-05 test-pass fixes* no longer exists; the surviving Unnerving Approach rows are the ⚑
> canvas-precision *Engine-move collision* row, **2bJ-10** (already verified 07-26k), and the
> dirgehound ADVERSARY row — none of them is a player-client row.
>
> **The two-client procedure is now written down** — `docs/EDHA_BENCH_RUNBOOK.md` §6 and the
> `bench-run` skill both name `PlayerBench` and carry the two-tab recipe. **The Bench cookie session
> was NOT displaced** by the player joining (all three users active simultaneously).

What is genuinely LEFT for a two-client window — all of it needs deliberate staging that run 13
judged too heavy to rush:

1. **2bR-10 — Devoted Conduit** (*White*) — needs a **second White character**; the bench roster has
   one. Staging means granting the whole White path to another actor.

2. **2bL-7 — Covenant's SHARED icon** (*Order*) — needs **two Order PCs** covenanting the same ally,
   then one breaking.

3. **2bM-1 — H3 ordering** — as a PLAYER with **no GM connected**. Note its own escape hatch: with a
   GM always online it cannot bite.

4. **The wizard as a player** — the "⚑ Player client" row in *Character-creation wizard
   (2026-07-18l)*: run the full walkthrough from the player's own sheet; watch for permission
   errors anywhere. Large — only start it if you can finish it.

5. If time allows: the multi-player visibility rows in *Knowledge (Gnothis)* §5–§6 (Pack
   Share's public reveal + Death Mark's ally-burst clicks from the ally's own client) and the
   *Order (Tessavain)* two-client Covenant rows — heavier setup, save for last.

Bonus while you're in a bestiary combat anyway: the Stillback/Wrongwake **ambush-belief** rows
(both bestiary sections below) have a player-side half — the fooled target's own truth card
should land on the player's screen, not just the GM whisper.

Cross-actor relay watch-items scattered through the tree sections (White Coordination §3, Life
§5, Chaos §3…) need no dedicated tests — they self-verify while running the rows above; note
anything that errors in the row's note box.

## Re-test after the fix pass F fixes (2026-07-28m — three fixed; ⟳ sync the module + F5 first, NO rebuild, NO ⟳ Sync Talents)

- [ ] 🤖 **Living Image's Pay button — RE-TEST after fix pass F (07-28m; engine-only → ⟳ sync + F5)** — with `Bench — Blue` holding a live COMPLEX illusion, start Blue's turn so the upkeep prompt whispers, then press the button.
      **POSITIVE:** Investiture drops by the prompted amount (4 → 3 at `costPer` 1) **and** the card "🎭 **Living Image**: … pays 1 Investiture (3 left)" posts. Run 23 measured 4→4 and 3→3 with no card, for every user, on every click.
      **POSITIVE 2 (the document still drives it):** edit `costPer` 1 → 2 on the Events tab; the next prompt must say "**2 Investiture** per COMPLEX illusion", the button must read "**Pay 2 Investiture**", **and pressing it must now charge 2** (4 → 2). Run 23 proved the first two and only the charge was broken — so a re-test that stops at the label proves nothing.
      **NEGATIVE (load-bearing):** with Investiture at **0**, press it — you must get the warn toast "Edha: … has no Investiture left to pay upkeep", **no** charge, and **no** payment card. That branch sits after the same dataset read, so a fix that only papered over the throw would take this path down with it.
      *(Root cause: `ev.currentTarget` is set ONLY during event dispatch, and an `await` ends dispatch — the browser had nulled it before L6245 re-read `.dataset.item`, throwing TypeError on every click while the outer catch swallowed it. Now captured before the first await. Family swept: 35 occurrences on 34 lines across 33 handlers, and it really was ONE bug. Gated by `lint-refs` pass 19 and pinned in `tests/current-target-after-await.test.js`.)*

- [ ] 🤖 **A failed chat-card button now SAYS so (07-28m; engine-only → ⟳ sync + F5)** — this is the diagnostic that would have caught the row above in run 20 instead of run 23.
      **POSITIVE:** break one deliberately — in the console, `game.actors.getName("Bench — Blue").sheet` aside, simplest is to post an upkeep prompt and then DELETE the talent it points at before clicking Pay. You must get a red toast reading "Edha: illusion upkeep failed — …", not silence.
      **NEGATIVE (load-bearing):** a button that works must produce **NO** toast at all. Press a healthy Pay button (the row above) and confirm only the payment card appears — if routine operation toasts, the change is worse than the bug it fixes and R-59 should be vetoed.
      *(All 33 outer click-handler catches now route through `edhaClickFailed`; the ~270 inner defensive catches are deliberately untouched and stay silent.)*

- [ ] 🤖 **Two combats at once: ending one must not loot the other — RE-TEST after fix pass F (07-28m; engine-only → ⟳ sync + F5)** — the data-loss row. Needs TWO combats live simultaneously.
      **SETUP:** put `Bench — Order` in combat A and give it a covenant (so `flags.edha-content.lists.covenants` is non-empty); put a *different* actor in combat B and give it one too. Start both.
      **POSITIVE (the sweep still works):** delete combat A → **A's** actor loses its covenant ledger, its `edict`/`covenant`/`concord` statuses and its `trigRound` stamp, exactly as before.
      **NEGATIVE (load-bearing, and the whole point):** **B's** actor keeps ALL of it — ledger, statuses, `trigRound`. Run 23 watched B's `lists.covenants` vanish when A was deleted.
      **NEGATIVE 2 (single-combat play is unchanged):** with only ONE combat in the world, deleting it must still clear state on actors who were **never in it** — put a bystander on the scene with Temp HP from Bulwark, delete the lone combat, and its Temp HP must go. A fix that narrowed the sweep to combatants would fail this, and that is the tempting wrong fix.
      **NEGATIVE 3 (turn cues):** while both combats run, advance a turn in combat A — no reaction cue card may be whispered to anyone whose only combat is B, and no `trigRound` key may appear on them. That is how runs 19/20 stamped Corvaine and Stonebound.
      *(Root cause: `deleteCombat`/`combatTurnChange` are per-combat events, but 20 of the 24 sweeps ignored the combat argument and iterated `game.actors` / `canvas.tokens.placeables`. New primitives `edhaCombatEndGuard` + `edhaStillFightingElsewhere`, threaded through 21 sweeps. See R-58 for the one judgment call — an un-started leftover combat still counts as "live". Pinned in `tests/cross-combat-scope.test.js`, every case asserting both directions.)*

## Re-test after the run-13 fixes (2026-07-27q — all three fixed; ⟳ sync + F5 first, no rebuild)

- [ ] ⚑ **One-applier: the dissipates card, RE-TEST (07-27q)** — with **two GM clients** live, break any 1-HP illusion copy (HP→0).
      ⛔ **BLOCKER (2026-07-27w): Ben must press F5 on his Gamemaster client first.** Everything mechanical on this row PASSES; the only open question is whether the doubling survives a reload, and the duplicate is provably his un-reloaded client (see the evidence below). After the F5 this becomes a 🤖 row — re-tag it then rather than leaving it in Ben's queue for ever.
      **POSITIVE:** the "🌫️ …is struck and dissipates" card posts **exactly ONCE**. Run 13 got two, 1 ms apart, authored by `Bench` and by `Gamemaster`.
      **NEGATIVE (load-bearing):** the same hook must not go silent. In the same session, take a **non-PC** to 0 HP → the DEFEATED skull overlay still appears, and healing it above 0 removes it again. That branch shares the guard that was changed, so a gate that is too tight kills the skull as well as the duplicate card.
      *(2026-07-27q: fixed. Foundry hooks fire on every client, so `if (!game.user?.isGM)` means once
      per connected GM; six world-writing hooks moved onto `edhaDefBuffGmGate()`, and **`lint-refs`
      pass 15** now fails the build on a new one.)*
      ⛔ **BLOCKED-ON-CLIENT-RELOAD — bench run 14 (2026-07-27r). NOT a fix failure; do NOT send to
      test-pass-fixes.** Driven with `Bench` + `Gamemaster` both connected, against a hash-verified
      HEAD engine (`232dde36…`). The card still posted **twice** — "🌫️ Phantom Double: the illusion
      of Bench — Black (Illusion) (Bench — Blue) is struck and dissipates.", authored by `Bench` and
      by `Gamemaster`, same millisecond. **But the duplicate is Ben's un-reloaded client, and that is
      provable from the same event:** in the SAME teardown the recast break card — guarded by the
      OLDER, untouched `game.user !== game.users?.activeGM` check — posted exactly **ONCE**, from
      `Bench`. Ben's client therefore computes `activeGM === Bench` and honours an activeGM guard; had
      it been running the new engine, `edhaDefBuffGmGate()` (which reads the same designation) would
      have suppressed its dissipates card too. Independently corroborated twice more: the Walking Ruin
      trail drop (activeGM-gated **before** this fix) produced exactly ONE Region, while every
      **newly**-gated site doubled. **My client posted exactly one card at every site.** The fix
      cannot be judged until Ben F5s his Gamemaster client; re-run then.
      ✅ **NEGATIVE CONTROL PASSES** — `Bench Target — Undefended` (adversary) taken to 0 HP gained the
      DEFEATED skull (`statuses: ["dead"]`, effect "Dead"), and healing it back to 30 removed it. The
      shared guard is not too tight.
      🔗 **MERGED IN 2026-07-27v — the "two sites the bench never saw" row folds into this one, because
      both of its mechanical halves now PASS and only the SAME doubling verdict is left.**
      **(b) Barrier teardown ✅ PASSES MECHANICALLY** (bench run 14): Phantom Barricade click-placed for
      1 Inv (4→3) as a 6-HP actor + token + **4 walls** boxing (2400,9300); HP→0 removed the actor, the
      token AND all four walls (scene back to its 117 baseline). Re-placed, then **ending the encounter**
      removed actor, token and all four walls too.
      **(a) Ignite ✅ PASSES** (bench run 15, after fix pass C): a foe dropped to 0 HP inside a Pyre zone
      produced "🔥 **Combustion Chain**: … a 10 ft zone ignites on the body", a fresh 10 ft hazard Region
      **centred on the body**, and the Spread button — **ONE of each on my client**, attributed by the
      `createRegion` hook's `userId`. Its two negatives held: outside every zone → 0 cards / 0 Regions
      (with an unrelated card still firing off the same `updateActor`, proving the chain ran), and a
      **second owner's** zone → 0 cards / 0 Regions.
      ⛔ **So all three sites — dissipates, barrier, ignite — are mechanically proven, and this row now
      asks exactly ONE question: does each still post TWICE once Ben's Gamemaster client has been
      F5'd?** Nothing here needs a fix pass; it needs a refresh.
      *(Historic detail on why the ignite site was dead — the flag-vocabulary split — is preserved
      below; it was fixed in `b4841d6` and gated by `lint-refs` pass 16.)*
      ❌ **(a) IGNITE, as first found at bench run 14 — A NEW DEFECT, and it was NOT the doubling.** The ignite never fired at all off **Pyre**, the canonical pairing. Root cause is a **flag-vocabulary split between the two hazard-Region placers**: `edhaPlaceHazard` (~L16173, the `edha-place-hazard` handler behind Pyre / Walking Ruin's trail-rule / Fire the Wrack) stamps `flags.edha-content.{sourceItem, sourceOwnerUuid, spreads}` and **no `terrain` object**, while `edhaOwnedTerrainRegions` (~L14970) — the reader behind `edhaTokenInOwnedTerrain`, which gates the whole `defeat-in-zone` sweep, and behind `edhaEnemiesInOwnedTerrain` — filters on `flags.edha-content.terrain.ownerUuid`. A Pyre zone is therefore invisible to Combustion Chain forever. **Proved by a matched control, not by inference:** a victim dropped to 0 HP standing in a Pyre zone (which was actively ticking it for 12 energy, so it WAS inside) produced **0 cards and 0 Regions**; the same victim, same talent, same owner, dropped inside a **Walking Ruin trail** patch — placed by the *other* helper (`edhaDropHazard`, which does write `terrain.ownerUuid`) — fired immediately. The other three writers (`edhaPlaceHazardRegionGM` ~L10184, the burst path ~L9863, green terrain ~L14952) all use the `terrain.ownerUuid` shape, so `edhaPlaceHazard` is the lone outlier.
      ⚠️ Once it fires, it DOES double under two GMs (2 cards — `Bench` + `Gamemaster` — and **2** hazard Regions), but that is the un-reloaded-client artifact again; re-judge with (a) fixed and Ben's client reloaded.
      *(2026-07-27s: (a)'s root cause is FIXED (`b4841d6`). **Its re-test row was retired on evidence at
      bench run 15** — the pointer that used to say "see the Combustion Chain row directly below" is
      stale and struck 2026-07-27v. This row is now only about the DOUBLING, and it cannot be judged
      until Ben F5s the Gamemaster client.)*

*(**PROBE — "the adversary I just dragged in does nothing"** — CLOSED 2026-07-27v on its own recorded
verdict, "recommend closing this row unless the table symptom recurs". Bench run 15 measured it on a
hash-verified HEAD engine with `Bench` + `Gamemaster` connected and **the symptom did not reproduce in
either half**, read as *before F5 → after F5 → after a FRESH post-F5 import*:
      · `edha-move-veto` watchers: **2 → 2 → 3**
      · watcher contents: `Bench — Black / Dread Presence` + `Bench Adv — Dirgehound Pack / Dread Presence`
      → **identical** → plus `Bench Adv — Cragdrake Alpha / Dread Presence`
      · `canvas.tokens.placeables.length`: 53 → 53 → 54
      · `canvas.scene.tokens.size`: 53 → 53 → 54
      · `game.scenes.viewed.tokens.size`: 53 → 53 → 54
      · `game.actors.size`: 89 → 89 → 90
      **Behaviour matched the counts, with isolation and a negative control both times.** A Dirgehound
      Pack imported MID-SESSION vetoed a weakened mover **immediately, with no reload** — the PC owner
      (`Bench — Black`) parked 100 ft away so the imported adversary was the only possible source, and a
      **both-parked control moved freely with no toast**. After the F5, a freshly imported Cragdrake
      Alpha vetoed identically, with its own both-parked control. Placeables never diverged from
      `scene.tokens.size` at any sample. **If the symptom recurs at the table it is situational, and it
      needs the reporter's exact sequence — not another index audit.**)*

⚠️ **Two traps kept from that probe, because they fake an "the index is empty" finding for anyone:**
(1) **`edhaWatchersOfRule` is NOT a global** — it is module-scoped, so a console call throws
`ReferenceError` (`typeof edhaWatchersOfRule === "undefined"`). Re-implement it in the console, or
export it. (2) **A naive re-implementation under-counts adversaries.** Filtering `item.type ===
"talent"` misses every adversary ability: they are **`trait`/`action`** items carrying
`flags.edha-content.adversaryTalent === true`, and the engine's `edhaIsTalent` accepts *both*. Run 15's
first transcription used the naive filter, returned **1** watcher, and made a fresh import look absent
from the index — it had been there the whole time.

---

# W23 adversary pipeline (2026-07-14 — the two Line-Caller flows still unbenched)

07-17 bench already passed Draw Mana on adversaries, token numbering, folders, and the
role-default skill ranks; the Mistheron sheet row passed except Spearing Beak (its 07-17c row).

✅ **RETIRED WHOLE at bench run 20 (2026-07-28f).** Both Line-Caller flows passed end-to-end on a
fresh `Bench Adv —` import; evidence per row in the 07-28f delta. This section is now empty.

## Illusion belief loop — ✅ RETIRED WHOLE at bench run 13 (2026-07-27p, two clients)

All six rows passed with `PlayerBench` logged in beside `Bench`; evidence per row in the 07-27p
delta. The **client veil is proven in all three directions on three machines** (fooled client hides
the original, seer's client hides the copy, GM renders both). Two NEW defects surfaced while running
them — the doubled dissipates card and the orphaned token — and they live in the delta, not here.

---

# Playtest-2 fixes — ✅ RETIRED WHOLE at bench run 13 (2026-07-27p)

Both remaining rows were the pair a solo-GM bench could not see, and both passed **as the player**:
White Draw Mana healed an ally `PlayerBench` had *no* ownership of with zero permission errors, and
Black Draw Mana's GM sweep card never rendered on the player's screen (public card 5, GM card 8).

---

# Lunavar Fens Bestiary (2026-07-19d — data: pack rebuild + ⟳ Sync; five blocks, ruling 69 + the statblock gate)

Five new adversaries in their own **"Lunavar Fens Bestiary"** Actor folder (Drownlight Colony ·
Reedling · Gone-to-Weir Fen-Heart · Stillback · Wasting-Eater Stillback). Wiring reuses the
proven mistheron patterns (engine-rolled seemings, `edha-damage-rider whenTargetFooled`,
`edha-gm-cue` thresholds) — if a cue misfires here it likely misfires on the Mistheron too;
report once.

*(**Folder + drag** · **Frayed Seeming advantage** · **Seize and Roll: no cue** · **Fen-Heart token
scale** · **Leyline pair on a minion** · **Noonwing** — all six RETIRED on evidence 2026-07-27x, bench
run 16, on FRESH pack imports. See that run's handoff delta for the quoted evidence. ⚠️ **Frayed
Seeming advantage** was only HALF-earned there (`2d20kh + 0`); its missing half was re-earned in bench
run 17 — `2d20kh + 4`, total **24**, arithmetically impossible with `+ 0`.)*

*(**Stillback ambush belief + rider** · **Stillback / Wrongwake two-cause RE-TESTs** · **Phantom
Double / The Seeming belief roll** · **Cues fire** · **Fen-Heart near-zero cue RE-TEST** — all RETIRED
on evidence 2026-07-28, bench run 17, on FRESH pack imports against a hash-verified engine. Belief
rolls now carry the target's real Perception (`1d20 + 4` vs a mod-4 PC, `1d20 + 0` vs a genuine
mod-0 fixture); the ledger key is dot-free and one-per-token; the `whenTargetFooled` rider fires; the
once-per-scene guard holds; and one 60-damage application posted BOTH `hp-below` cards under two
distinct keys `…hp-below:0_5:0:1` and `…hp-below:0_05:0:1`. See that run's handoff delta.)*

---

# Malcurr Lakes Bestiary + the Sevenbrand (2026-07-19 — data: pack rebuild + ⟳ Sync; five blocks, ruling 80 + the statblock gate)

Four beasts in a **"Malcurr Lakes Bestiary"** Actor folder (Wrongwake · Wasting-Eater
Wrongwake · Wake-Eel Shoal · Fellstag) plus the **Sevenbrand Construct-Smith** in
**"Malcurr — the Sevenbrand"**. Wiring reuses the proven Lunavar patterns (engine-rolled
seemings, `edha-damage-rider whenTargetFooled`, `edha-gm-cue`); the smith is the first
adversary embedding **deity-tree** talents (Civilization/Forge Construct + Tempered Edge +
Siege Form, as written).

*(**Folders + drag** · **Drag Under / Slip the Sound: no cue** · **Smith deity-tree embeds** —
RETIRED on evidence 2026-07-27x, bench run 16, on FRESH pack imports. See that run's handoff delta.)*

*(**Wrongwake ambush belief + rider** and its **07-27y RE-TEST** — RETIRED on evidence 2026-07-28,
bench run 17: Breach Strike vs a fooled target rolled `1d10 + 2 + (1d6)[Breach Strike] + 0`, the
second use posted **no** new belief card, and the Wasting-Eater Wrongwake (flat) read `1d20 + 4` —
never `2d20kh`. See that run's handoff delta.)*

*(**Fellstag green engine / Sudden Wall** · **Fellstag hand-placed maze thicket** · **Wake-eel
drag-under cue** · **Smith bloodied cue** — RETIRED on evidence 2026-07-27x, bench run 16. Sudden Wall
was click-placed for real (the burst-center pick IS drivable); the maze-thicket row got its
no-double-damage answer with a matching HP delta. See that run's handoff delta.)*

---

# Character-creation wizard v2 (2026-07-19p — the 07-19 bench fixes + Ben's three rulings: engine + css + module assets + data/build: `deploy-to-foundry.bat` → relaunch; the culture pick-2 change rides the SAME pack rebuild as the bestiaries)

The 07-19 bench's wizard fail/partials, root-caused and rebuilt (delta 2026-07-19p): duplicate
Key grants killed, z-order guard, Edha PCs folder, enriched previews, actor-bound trees, OUR
pick-2 dialog (the native one offered Rosharan lists), the Thyrcross map picker, deity
browse + faith note, and full attribute/skill assignment pages. Rows Ben passed on 07-19
(sheet bar, start-over, kit backfill, two-wizards, budget gate) are retired — paper trail in
the delta + git.

*(The **07-19q weapon slot picker** row is retired 2026-07-27v as STALE — its list clause
("every edha-items weapon of 2 gold or less") is now true only for the Warrior. **Superseded by
Weapon slot v3 — path-curated**, below, which absorbed its still-live "Take it / Choose later" clause
so nothing was dropped.)*
- [ ] 🤖 **Map v3: label-free (07-19s)** — the picker map no longer shows city labels or the
      lettered nation ids (the asset is now a downscale of the raw base painting; the render
      toolchain's label overlay is what carried the letters). Hover tooltips still name each
      nation. The bespoke **Character Creator World Map** piece is filed on the Art tab —
      swapping it in later touches nothing but the image.
      ⛔ **THIS ROW CANNOT PASS TODAY — see the defect row below; it needs a RULING first.**
- [ ] ❌ **DEFECT (found by the 2026-07-27v checklist audit, never benched): the label-free map asset
      was SILENTLY REVERTED, twice** — `module-src/assets/thyrcross-map.jpg` (1118×1488, byte-identical
      to the deployed copy) still carries **every nation letter** (`A Kettavar` … `J Canticle`) and
      **all 13 numbered city labels**. Verified by extracting and viewing the committed file, not by
      reading a log. **Timeline from `git log --follow`:** `dac7b90` original → **`c1b219c` "Bench
      take-three: label-free map"** (genuinely label-free) → **`db79969` "Thycross redraw
      re-registration"** and **`b114f7e` "Map gap-fill re-registration"**, both of which regenerated the
      jpg **from `thyrcross-labeled.png` again** and restored every label. **Root cause:**
      `scripts/build-map-picker-asset.js`'s docstring still declared the image half to be "a downscaled
      copy of thyrcross-labeled.png" — never updated by the 07-19s fix — so two later re-registration
      passes followed the docs straight back into the bug. *(The docstring was corrected 2026-07-27v;
      the ASSET was deliberately NOT regenerated, because which render is wanted is the ruling below.)*
      ⏸️ **GATED ON `EDHA_RULINGS.md` R-41 — two rows in this file contradict each other and one must
      be retired:** **"Map v3: label-free"** (above) wants no labels, while **"Map picker shows the
      redrawn map"** (further down) names *"Goldenport wash running the whole west coast"* as its
      giveaway — and that wash exists **only on the political/labeled render**, which is what is
      shipped. Once R-41 is answered: regenerate (or don't) and retire the losing row. Nothing here
      needs a Foundry table.
      ℹ️ **The aspect half is fine either way and needs no test:** 1118/1488 = **0.7513**, identical to
      the canvas aspect 2236/2976, so "not stretched or letterboxed" holds for both renders.
*(**Derived-stat preview v2** — RETIRED on evidence 2026-07-28j, bench run 22, positive AND all three
negative controls. Panel at STR3/SPD3/INT3/WIL3/AWA0/PRE0 read **Health 14 · Move 35 ft · Senses 10 ft**
and the finished sheet read the same three; the six controls agreed cell for cell (Focus 5 · Phys 16 ·
Cog 16 · Spi 10 · Investiture 2 · Recovery d8). Second spread SPD 0 / AWA 4: panel **Move 20 ft ·
Senses 25 ft**, sheet identical — not the system's 20/20. A hand-set Senses override of 60 survived an
F5 (`{derived:10, override:60, useOverride:true}`) and the token's sight followed it to 60. The engine
now writes `system.senses.range.derived` at all, which it never did — token sight tracked Senses across
AWA 0→10, 2→20, 4→25, 5→30. ⚠️ Read the DerivedValueField's **`.value`**, never `.override`/`.derived`:
Move is written into `override` with `useOverride:true` and the getter adds `.bonus` on top.)*
*(The **07-19v weapon slot v2** row is retired 2026-07-27v as STALE — its ×2-quantity clause is
**explicitly reverted** (the engine grants one weapon, never ×2). Its two still-live halves — the rows
LOOK pickable, and the picked weapon is kitItem-stamped so Start over / ↺ Change remove it with the kit
— were **moved into Weapon slot v3**, below, rather than dropped.)*
- [ ] ⚑ **Coin row v3 (07-19x — v2's numbers were invisible until clicked)** — v2 injected the
      editors INSIDE the system's currency-list, whose CSS collapses inputs until hover (it's a
      compact header widget) — hence letters-only at rest, numbers-only when clicked, and the
      oversized total box. Now: the equipment tab hides the native widget entirely and renders
      OUR row after it — 🪙 total pill (copper-weighted, tooltip) + three tinted g/s/c pills
      with always-visible numbers. The header strip keeps the compact native chip with the
      corrected total. Verdict on the look still wanted.
*(**Finish tops up to a REACHABLE max** — RETIRED on evidence 2026-07-28j, bench run 22, positive AND
all three negative controls including the load-bearing one. Finish on a fresh PC left **14/14 · 5/5 ·
2/2** with **no rest dialog**, and a second Finish later in the same run left **14/14 · 5/5 · 6/6** —
the 13/14 is gone. **NEG 1 (load-bearing):** taken to **9/14** and given a real F5, it came back
**9/14**, not healed — `_source` 9. **NEG 2:** taken to **13/14** and F5'd, it came back **13/14**, not
14 — the case a naive fill-to-max fix gets wrong. **NEG 3:** Focus 3/5 and Investiture 1/2 survived the
same reload unchanged. An in-memory `prepareData()` probe over 9 / 13 / 14 / 1 also round-tripped every
value untouched. ⚑ Only the player-client half of the positive is unrun — it was proven twice GM-side.)*
- [ ] 🤖 **+1 max health SOLVED-pending-confirm (07-19z)** — a BRAND-NEW ＋ actor showed 10/11
      before any picks, and at that moment only the basic-action copies exist: a shipped
      action carries an auto-applying (transfer) Active Effect touching max health. Action
      copies now land with transfer-AEs STRIPPED (kits own Edha onboarding; use-time AEs
      stay), and opening the wizard on an existing PC strips them from its action items
      (console logs what it removed). Confirm: fresh actor = 10/10 at STR 0, and the repair
      log names the culprit action — paste its name for the delta.
      - ⚠️ **2026-07-28h (bench run 21) — THE FIX WORKED; THIS ROW'S TARGET NUMBER IS WRONG, and
        it is now `EDHA_RULINGS.md` R-54.** The transfer-AE half is decisively fixed: a brand-new
        ＋ Edha Character carries **20 items, 19 of them actions, ZERO transfer AEs**
        (`itemsWithAnyEffect: []`), no duplicate names, and a **clean console**. There is therefore
        **no repair log and no culprit action to name** — nothing is left to repair.
        But the actor still reads **max 11 at STR 0**, and the culprit is not an AE:
        `_source…hea.max.bonus` is **0**, while derived reads
        `{derived:10, override:null, useOverride:false, bonus:1}`. **A plain system character
        created with zero items and zero effects reads exactly the same 11** — because
        `edhaDeriveSheetStats` (engine ~L16178) deliberately adds **+1 max HP to every character**
        ("The Edha reference sheets derive these differently… HP = system + 1"). So "10/10 at
        STR 0" asks the engine to undo its own documented design rule and **can never pass as
        written**. R-54 decides whether 11 is intended (retire this row's number) or the +1 should
        not apply at level 1.
      - ℹ️ **2026-07-28i — the +1 is now REACHABLE, which is a separate bug fixed, not an answer to
        R-54.** Until this deploy the system's resource clamp ran before the module raised the max,
        so **11/11 could never be displayed at all** — the actor sat at 10/11 forever no matter
        what healed it. That is fixed (see "Finish tops up to a REACHABLE max"). The NUMBER is
        still R-54's call and `EDHA_HP_BONUS` in the engine is deliberately one constant in one
        place, so answering R-54 is a one-line change that moves the sheet, the wizard preview and
        the tests together.
*(**Path training v2** — RETIRED on evidence 2026-07-28j, bench run 22, positive AND both positive
controls AND all three negative controls. **Positive:** picking Warrior opened **no dialog**, posted
"🎓 B22 Warrior's Warrior training: **+1 Athletics** (rank 1)", left `ath` as the only non-zero rank,
made the skills page read **"Spent: 1 of 5"**, and stamped `flags.cosmere-rpg.isStartingPath = true` on
the Warrior item. **POS 2:** Scholar on the same actor trained **+1 Lore** with Athletics at 0 — the
table is read per-path, not hard-coded. **NEG 1:** ↺ Change returned Athletics to **0** (and Lore to 0
on the Scholar cycle); re-picking Warrior gave **1**, not 2. **NEG 2:** with Athletics hand-set to 1
first, Warrior made it **2**, and ↺ Change returned it to **1**, not 0. **NEG 3:** re-opening the wizard
on a PC that already had a starting path added no second rank — ℹ️ it shows a page banner
"✅ Already chosen: Warrior" rather than the info toast the row predicted; same substance, different
surface.)*
- [ ] 🤖 **Wizard fits the screen v2 — the country page is re-clamped after its map lands (fixed
      2026-07-28i; ⟳ sync + F5)** — run 21 measured **"Where are you from?"** at top **237**,
      height **788**, bottom **1025** in a 1400×900 viewport: **125 px off the bottom**, while
      every other page fitted. It read as a CSS gap (`.window-content` at `overflow-y: visible`,
      `max-height: none`) but **no CSS changed and none needed to** — the scroll container is
      `.dialog-content`, already capped at 76vh by rule L, and that cap is exactly why the box is
      788 and not taller. The **stale `top`** was the bug: the map block ships `display:none` and
      is revealed only after `thyrcross-nations.json` resolves, so Foundry centred a **426** px
      dialog at (900−426)/2 = **237** and never looked again. A ResizeObserver now re-clamps any
      wizard dialog that grows after it was positioned.
      **THE POSITIVE:** open the country page on a short window (**make the browser ~900 px tall**
      — this does not reproduce on a tall screen) and confirm the whole dialog is on-screen:
      its bottom edge is at or above the viewport bottom, the **Choose ▶** button is reachable
      without scrolling the page, and the map is still visible and still clickable through to a
      nation after the reposition.
      **NEGATIVE CONTROL 1 — pages that already fitted must NOT jump:** heroic and attributes
      opened at top 177 and 142 (i.e. centred). They must still open centred, NOT shoved down to
      a clamp. A fix that repositions everything is the wrong fix.
      **NEGATIVE CONTROL 2 — the wizard must not fight you:** drag the country page to a legal
      position and let go; it must STAY there. Re-clamping on drag would make the window
      un-movable.
      **NEGATIVE CONTROL 3 — the page still scrolls:** with the map showing, the country page's
      inner content must still scroll (long nation prose reachable) rather than the dialog simply
      being made taller.
      - ⛔ **2026-07-28j (bench run 22) — BLOCKED ON THE HARNESS, and the blocker is structural:
        the agent bench can NEVER verify a ResizeObserver fix.** The browser pane runs
        `document.hidden === true` / `visibilityState "hidden"`, and a hidden page runs no
        rendering steps: a `requestAnimationFrame` loop delivered **0 frames in 2.7 s**, and a
        `ResizeObserver` **and** an `IntersectionObserver` newly attached to a live element each
        fired **0 times** — including their spec-mandated initial observation. Measured, not
        inferred. So the row's symptom reproduces exactly (top **237**, height **788**, bottom
        **1025** in a 1400×900 viewport, **125 px** over, **Choose ▶** off-screen at bottom 1012)
        but that is indistinguishable from an un-fired observer and **is not evidence against the
        fix**. What run 22 CAN prove, and did: (a) the **mechanism is correct** — calling
        `app.setPosition({})` by hand on that exact dialog moved it **237 → 112**, bottom **exactly
        900**, i.e. the fix's chosen repair produces precisely the wanted result; (b) `setPosition`
        re-clamps `top` into `[0, vh−height]` on every call, so `edhaDialogNeedsReposition`'s
        premise holds; (c) the **render-callback contract the fix depends on is sound** —
        `DialogV2.wait` passes the **DialogV2 instance** (verified against
        `client/applications/api/dialog.mjs` L389–392 and by probe: `element` is the
        `HTMLDialogElement`, `instanceof HTMLElement` true, `setPosition` a function), so
        `watch(dlg)` does attach; (d) **NEG 1 holds** — heroic opened at top **169** (h 563) and
        attributes at top **142** (h 617), both centred and fitting, neither shoved to a clamp.
        **The row stays 🤖 with the blocker named** (a technical blocker is not a judgment call, so
        it is not re-filed as ⚑) — but note that this blocker is **structural and permanent for the
        agent bench**, not a this-run shortage, so whether it should become a ⚑ is a marker
        decision for Ben rather than one a run should take on its own. What settles it is one look
        at a ~900 px-tall VISIBLE browser.
- [ ] 🤖 **Weapon slot v3 — path-curated (07-19y, Ben-approved lists) — THE ONE WEAPON-PICKER ROW
      (absorbed 07-19q + 07-19v, 2026-07-27v)** — ONE weapon, never ×2 (the take-five ×2 reading is
      reverted), and the list is the path's own arms: Agent = Knife/Sidesword/Staff · Envoy =
      Sidesword/Knife/Staff · Hunter = Shortspear/Longspear/Axe (its kit already carries Shortbow +
      Knife) · Leader = Longsword/Longspear/Mace (kit has Sidesword) · Scholar = Knife/Mace (kit has
      Staff) · Warrior = the full ≤2g list. Confirm each path's picker shows exactly its list. The
      picker opens after the kit lands (fresh heroic pick OR the 🎒 backfill): **Take it** grants the
      picked weapon, **Choose later** grants nothing. ⚑ The rows should LOOK pickable (bordered rows,
      hover glow, visible radio, blue selected state), and the picked weapon is **kitItem-stamped**, so
      **Start over / ↺ Change heroic remove it with the kit** (the second Knife on Test Agent-Blue was
      the un-stamped survivor of a pre-fix restart — prune that one by hand).
      - ✅ **2026-07-28h (bench run 21) — TWO of the six lists verified, and every mechanical
        clause passes. The row now stays ONLY for the four unverified path lists.**
        · **Warrior = the full ≤2g list** — exactly 10 options, Staff 3c · Knife 25c · Shield 35c
        · Shortspear 35c · Longspear 5s · Axe 65c · Mace 65c · Hammer 13s · Sidesword 13s ·
        Longsword 2g, each with its skill named. · **Scholar = Knife/Mace** — exactly those two,
        nothing else (driven from the player client).
        · **ONE weapon, never ×2**: the picked Longsword landed at **`quantity: 1`**.
        · **kitItem-stamped**: the picked weapon carries `flags.edha-content.kitItem = true`,
        alongside the 9 other kit items (10 stamped in total), so Start over / ↺ Change will take
        it with the kit. · **Take it / Choose later** both present and labelled.
        ⛔ **Still unverified: Agent · Envoy · Hunter · Leader.**
- [ ] ⚑ **Preview panel centered (07-19y)** — the derived-stat box on the attributes page is
      centered ("90% of the way to clean design" — say what the last 10% needs).
- [ ] ⚑ **Attributes page — VETO CHECK (Ben)** — are **12 points at L1 / max 3 per attribute at
      L1 / +1 at levels 3, 6, 9, 12, 15, 18** still canon? They come from the legacy
      `Character_Building_Rules.md`. Confirm, or say the real numbers — the wizard enforces
      whatever this answer is. *(Split 2026-07-27w; the enforcement half is the 🤖 row above.)*
- [ ] ⚑ **Skills page — VETO CHECK (Ben)** — are **5 + (L−1)×2 total ranks** and **max rank
      INT((L−1)/5)+2** still canon? Same legacy source as the attributes numbers; confirm or give
      the real ones. *(Split 2026-07-27w; the enforcement half is the 🤖 row above.)*

- [ ] 🤖 **Map picker shows the redrawn map** — after deploy: the Where-are-you-from step shows
      the new map art (Goldenport wash running the whole west coast is the giveaway) and the
      map is not stretched or letterboxed (the asset aspect changed with the new canvas).
      ⛔ **CONTRADICTS "Map v3: label-free" — one of the two must be retired; see the defect row
      in the wizard section above. The aspect clause is already answered (0.7513 == canvas aspect).**
- [ ] 🤖 **Redrawn polygons hit the right nations** — click near the touchy borders: the
      Goldenport coastal strip (formerly Kettavar/Lunavar), the Vorsk/Lunavar mountain line,
      Malcurr's lake country, the Thalendor/Corvaine river line. Hover names must match the
      wash colors; Sylvaneth island still clickable.
      - ✅ **2026-07-28h (bench run 21) — all TEN polygons resolve to their own nation, and the
        picker plumbing is sound.** Clicking each polygon in turn drove the dropdown to ten
        DISTINCT nations: poly 0→Sylvaneth (**the island is clickable**), 1→Kettavar, 2→Vorsk,
        3→Malcurr, 4→Lunavar, 5→Thalendor, 6→Goldenport, 7→Ashkar, 8→Canticle, 9→Corvaine. Hover
        (`pointerenter`) gives name + region — "Goldenport / west coast (inlets = Life-nexus trade
        arteries)", "Malcurr / northeast lake country (tree-of-lakes waterways)" — with a gold
        highlight, and `pointerleave` hides the tip. The SVG overlay is pixel-aligned with the
        image (both 558,326 284×378; viewBox `0 0 2236 2976`), and the culture card + map
        highlight both follow the select.
      ⏸️ **The row STAYS only for the border/dead-spot half, which is `EDHA_RULINGS.md` R-42** —
        the four Goldenport-tagged dots inside no polygon and the Corvaine dot resolving to
        Thalendor are the defect row below, not a new finding. Centroid hit-testing cannot settle
        a border question; that needs R-42 answered first.
- [ ] ❌ **DEFECT (measured by the 2026-07-27v checklist audit, never benched): five map-picker DEAD
      SPOTS / mis-hits, and four of them are holes in the partition** — `module-src/assets/
      thyrcross-nations.json` is byte-identical to `thyrcross.map.json`'s polygons and to the deployed
      copy, so this is a data defect, not a deploy gap. **Point-testing all 35 gazetteer city dots
      against the 10 shipped polygons: 30 agree, 5 do not.**
      · **city-04 `[746,676]`** · **city-11 `[484,1120]`** · **city-14 `[407,1324]`** ·
      **city-17 `[595,916]`** — all four tagged `goldenport`, all four fall **inside no polygon at
      all** → clicking there selects **nothing** (the dropdown fallback is the only way in).
      · **city-31 `[1244,1552]`** — tagged `corvaine`, resolves to **`thalendor`** (wrong nation).
      **Controls pass:** Aldercourt → corvaine, Heartholt → thalendor. **These are the same four
      `lint_map.py` already WARNs about**, so the gate saw them and nobody acted.
      ⏸️ **GATED ON `EDHA_RULINGS.md` R-42 — is this a polygon fix or a gazetteer fix?** Either the
      Goldenport polygon is missing its coastal lobe (redraw/extend it), or those four dots are tagged
      to the wrong nation (retag them). Both are edits to `source-materials/maps/thyrcross.map.json`
      and both re-run `build-map-picker-asset.js`; the choice is map truth, not a mechanical one.
      Nothing here needs a Foundry table.

---

# Culture items (2026-07-18k — data + build: `deploy-to-foundry.bat` → relaunch; NO engine change, NO ⟳ Sync — no owned culture copies exist yet)

Country-of-origin culture items (§9j #3): ten native culture-type items + the Human ancestry
fallback in edha-items (Cultures / Ancestry folders). Each auto-grants the nation's cultural
expertise and offers a pick-2 origin list; Ashkar picks a second culture + one road-life entry.

*(**Folders + docs appear** — RETIRED on evidence 2026-07-27v: the 07-27u items build reports
**113 items**, and the shipped data carries **10 cultures + the Human ancestry** with the full
document set (primer flavor / Names / You might be / the expertise block) rendering on the
spot-opened Malcurr.)*

*(**ALL THREE remaining culture rows RETIRED on evidence 2026-07-28j, bench run 22** — driven on the
raw-drag path and cross-checked against the wizard path in the same run.
**Cultural expertise grant:** dropping the pack's **Corvaine** culture onto `Bench — White` put
`cultural:corvaine` on the sheet immediately.
**Pick-2 on a raw drag:** the drag fired our **`edha-pick-expertises`** dialog ("Choose 2 expertises"),
offering the **five Corvaine-specific options** — Court Etiquette · Requisition Law · Plague-Ward
Practice · River-Craft · Bell & Burial Custom — **not** the system's Rosharan registries. The wizard's
country page fired the identical five in the identical order on the same run, so **the raw-drag path
does NOT behave differently** and the row asked to report only if it did. Picking two granted
`utility:plague-ward-practice` + `utility:river-craft`.
**Remove behavior, both halves:** deleting the culture item RAW removed **only** `cultural:corvaine`
and **left both picked origin expertises** in place (the Roshar-mirror). The WIZARD's **↺ Change** on the
country page wiped the cultural expertise **and** both origin expertises (`[]` after), so the 07-19
linger-and-stack-to-FOUR is dead. A hand-set skill rank was separately confirmed untouched by the same
machinery.)*
*(**§9j's "is the ancestry slot mandatory?" — ANSWERED NO, 2026-07-27v, and the row is retired.** The
sheet's else-branch renders a neutral **"Add Ancestry" drop target** — no warning, no validation, no
gap — so a culture-only PC is a legal sheet. Its second half is settled from the shipped data too: the
Human ancestry carries **name + img + description only**, with **no events and no effects** —
flavor-only, exactly as the row predicted.)*

*(**Icons render** — RETIRED 2026-07-27v: all 11 imgs resolve to real files on disk, and the set is
exactly the one the row named — frozen · light · castle · oak · coins · mountain · circle · sound ·
angel · ruins · mystery-man. The §10 "a 404 icon renders INVISIBLE" gotcha does not bite.)*

*(**The three culture-flavor rows are RETIRED on evidence 2026-07-27v** — the quoted closing lines were
read back at their verified indices in the shipped culture documents. **Lunavar**: the
rice-country/Moonmere/grief-night text with **five** name exemplars (Selka, Meriv, Naul, Ysel, Sorne),
closing on the sea-gate line "…the Once-Children price that exchange as carefully as any fast-day".
**Malcurr**: the Kenmere/Proving/lamp-country text with **six** given names (Kashen, Dorvek, Salla,
Ostrek, Merin, Veska) and the beached-fisher you-might-be. **Goldenport**: closes on the carrier-coast
paragraph, "…a signature can baptize anything". All three are flavor-only, so the stale-snapshot caveat
on existing owned copies stands and costs nothing.)*

---

# Items-dump tranche (2026-07-18j — engine + data + build: `deploy-to-foundry.bat` → relaunch; ⟳ Sync not needed for these rows)

The paste paid off: currency rows seeded, the CAE bridge live, 89 shipped items mirrored into
edha-items (re-priced c/s/g; Roshar money loot excluded), and the starting-kit grant flow.

*(**Currency rows render and edit** — RETIRED on evidence 2026-07-28j, bench run 22. A brand-new
＋ Edha Character was seeded with all three rows in **gold → silver → copper** order
(`denominations: [gold 0, silver 5, copper 0]` after its kit). Typed amounts stick and persist: 2 g /
7 s / 3 c written through the sheet's own inputs landed in **`_source`** as `[gold 2, silver 7,
copper 3]`, and the total pill recomputed to **🪙273 c** (2×100 + 7×10 + 3 — correctly copper-weighted).
The unseeded spheres block shows **no dead row**: the native `.currency-list` is present but collapsed
to **height 0**, and a whole-sheet scan found **zero** text nodes containing "sphere". ⚠️ One harness
note, not a defect: firing all three `change` events in a single tick makes the three whole-array writes
race and only the last survives — a user typing one field at a time is unaffected, which is how it was
re-driven.)*

*(**The mirror** — RETIRED on evidence 2026-07-28j, bench run 22. The row's "102 items in 4 folders" is
stale the same way its retired sibling's "13 items" was: the pack now holds **113** — 82 equipment ·
14 weapon · 10 culture · 6 armor · 1 ancestry. Spot-checks all pass and every price is `currency:
"edha"`, never Roshar: **Sidesword** = **13 silver** (`denomination.primary "silver"`, baseValue 130 c)
with damage `1d6 keen`, skill `lwp`, `attack.type "melee"` and traits `quickdraw` (active) + `offhand`
intact; **Lantern (sphere)** = **65 copper**; **Breastplate** = **4 gold** (baseValue 400). Only **two**
Roshar-flavored names survive by name — Bottle (crem), Lantern (sphere) — and the row calls pruning
those optional.)*
      *(CAE use-grants retired at bench run 13, 2026-07-27p — all three clauses, driven **as
      `PlayerBench`**: Cautious Advance added `{max:2, name:"Edha: Cautious Advance (Brace / Gain
      Advantage)"}` to the caster's `actionsAvailableGroups`; Through the Fray added
      `{max:1, name:"Edha: Through the Fray (…)"}` to the **targeted ally's** `reactionsAvailable`,
      not the caster's; zero permission errors, so the combatant-flag write relayed through the GM.)*
*(**CAE combat-start grants** — RETIRED on evidence 2026-07-27v. It is a **duplicate of 2bE-4 / 2bE-5**,
both retired at bench run 10 against a hash-verified HEAD engine. **2bE-4:** a combat start with
Foresight AND Sidestep owned wrote **all three** groups on the combatant (`base`, `Edha: Foresight`,
`Edha: Sidestep (Dodge only)`). **2bE-5, the negative:** with Chain armour on (`deflect.value` 2)
**only** Foresight reached the tracker and Sidestep granted **nothing** — Foresight being the positive
control inside the same combat start, which is what makes the deflect gate provable rather than
assumed.)*

- [ ] 🤖 **CAE burns** — Tactical Ploy success / Feinting Strike hit decrements the target's
      tracked reaction (card says "burned on the tracker"); with no combat running, everything
      falls back to the honor-system chat wording.
- [ ] 🤖 **Starting kit grant** — `edha.grantStartingKit(actor, "Hunter")` (GM console): the
      common base + the Hunter pack + 7 rations land on the actor, the purse shows +5 silver,
      and the card lists anything missing. Try one more path. (07-18l: the as-shipped 07-18j
      version never created the items — a docs-array double-wrap, fixed pre-bench; the grant is
      also once-only now. Covered again by the Character-creation section's walkthrough row.)
      - ✅ **NARROWED 2026-07-28j (bench run 22) — the grant itself is proven on TWO paths, via the
        wizard rather than the console.** Warrior granted **9 items + 5 silver** and Scholar **10
        items + 5 silver**, each with the card naming the count and the weapon-slot follow-up, and
        the purse moving in step (0 → 5). Once-only also holds: re-entering the wizard on a PC that
        already had its kit added nothing. ⛔ **What remains is only the row's literal ask** — the
        **console API** `edha.grantStartingKit(actor, "Hunter")` on the **Hunter** path, and its
        "lists anything missing" clause. Not reached at run 22.

- [ ] 🤖 **Kindle — NARROWED 2026-07-27v to the token-light half only** — ✅ **the label half is
      proven**: the Kindle die/mod is labeled in the damage breakdown, observed live as "+ **3
      (Kindle)**" inside Hazewyrm Elder's Flame Surge total at bench run 11. ⛔ **Unrun:** deal energy
      damage, wait ~30s reading the card, then Apply → the target token now **sheds the flame light**.
      *(Related but NOT the same claim: `lightRadiusFt: 5` is present on the shipped Kindle rules —
      that settles the FIELD, not "a bitten creature's token starts glowing", which is what this row
      and the bestiary's "Bite sheds light" row actually ask.)*

---

# Bench 07-18 fixes re-test (2026-07-18g — engine + data + build: `deploy-to-foundry.bat` (now builds the items pack too) → relaunch → **⟳ Sync**; re-drag any heroic talent whose PREREQS you're testing — prereq fields are structural and may not Sync)

The 07-18 bench's 7 fails / 1 partial, root-caused and fixed: the deploy script never built the
items pack; prose prereqs resolved to OTHER trees' same-named copies; Clear Mind (+ unreported
sibling Focused Mind) missing their focus AEs; the speed derivation double-counting every speed
AE; stances having no machinery at all (new engine state machine); PC token defaults (Ben's
freeform note). Passed rows from 07-18f (real costs, tier formula, Sync carry, adversary sync,
dashboard) are retired. The currency-sheet fails (denominations/spheres) are GATED on the items
dump — see the paste row below.

*(**The Edha Items pack has its 13 items** — retired 2026-07-27v as STALE: the pack went 13 → 102 →
**113**, and the 07-27u build logged "items 113" with `validate-packs` PASSED. The row's number can
never be true again. **Superseded by "The mirror"** below, which is the live items-pack row.)*

*(**⚑ Item price display** — retired 2026-07-27v as STALE: its stated purpose was to be "ground truth
for the mirror pass (§9j #2)", and the mirror pass **shipped 07-18j**. It duplicates **"The mirror"**
below, which already asks for the Sidesword price spot-check in s/g.)*

*(**ALL SEVEN remaining rows in this block RETIRED on evidence 2026-07-28j, bench run 22.**
**Devastating Blow / one Combat Training:** settled on the shipped data — the Warrior tree's
Devastating Blow node carries exactly **one** talent prerequisite, and it resolves to
`Compendium.edha-content.edha-heroic.Item.M94PjyNgvjnSgHNu`, the **warrior** Combat Training, not the
hunter copy `L0bmdmjQXHvO7wn4`. It does **not** list twice: one prerequisite entry, one connection
pointing at it (its only other prereq is a non-talent `skill: ath rank 3`).
**Hardy:** on a level-7 PC, adding it moved max health **45 → 52** — exactly **+1 per level** — via
`system.resources.hea.max.bonus += @level`.
**Clear Mind / Focused Mind:** both carry the Composed-shape AE `system.resources.foc.max.bonus +=
@tier`; at tier 2, max focus went **5 → 7 → 9** as each was added.
**Surefooted:** **20 → 30** on add (exactly **+10**, not +20) and back to **20** on remove. ⚠️ Read
`movement.walk.rate.**value**` — the engine writes the Edha rate into `override` and the
DerivedValueField getter adds `.bonus` on top, so reading `override` alone reports a false **+0**.
**Stances — the last unrun clause:** using the **active** Vigilant Stance again **left** it — the
"Vigilant Stance" effect disappeared and no stance remained (the pre-existing "Determined" was
untouched).
**New PC token defaults:** a fresh ＋ Edha Character landed with `displayName 30` (HOVER — the name
reads to everyone), `sight.enabled true`, `visionMode "sense"`, `attenuation 0.1`, and range = Senses
Range.
**Raising AWA extends sight:** the whole table moved in lockstep across the actor, the **prototype**
token and a **placed** token — AWA 0 → **10**, 2 → **20**, 4 → **25**, 5 → **30** ft, on the GM client.
A hand-set Senses override of 60 also carried through to the token's sight.)*
*(**⚑ THE PASTE** — RETIRED 2026-07-27v: **its deliverable is in the repo.**
`source-materials/edha-items-dump.json` was committed at `ed67fe9` and was already **consumed by the
07-18j pass** (the currency DataModel it captured is what the g/s/c editor was built against). There is
nothing left to run — the task was "produce the dump", and the dump exists.)*

---

# Currency wiring (2026-07-18e — benched 07-18; the SHEET half SHIPPED 2026-07-19s: engine-only, F5)

The long-gated half is wired (Ben re-flagged it at the 07-19 bench: "spheres and edha coin but
no g/s/c delineation"). Root: the system's currency-list component renders ONE read-only total
per currency (currency-list.hbs) — per-denomination editing doesn't exist in the system at all.
The engine now hides the Roshar spheres chip on every character currency list and injects a
gold/silver/copper editor on the equipment tab, writing the seeded
`system.currency.edha.denominations` array (shape confirmed by the items dump).

*(**ALL THREE currency rows RETIRED on evidence 2026-07-28j, bench run 22.**
**Spheres row hidden:** a whole-sheet DOM scan of a PC found **zero** text nodes containing "sphere",
on the header strip and the equipment tab alike; the system's native `.currency-list` is still in the
DOM but computed to **height 0** (not shown), so there is no dead row. Adversaries were untouched —
nothing in this run wrote to an adversary's currency.
**g/s/c editor:** the equipment tab renders three `input[type=number]` pills — `.ec-gold` / `.ec-silver`
/ `.ec-copper`, each **56×26**, `readOnly false`, `disabled false` — with the read-only total pill
beside them. Typed values write through and persist: 2 g / 7 s / 3 c reached **`_source`** intact, and
the total pill read **🪙273 c**, the correct copper-weighted roll-up.
**Purse flows move the silver box:** all three flows observed on one PC in one session — **kit grant
+5 s** (0 → 5, twice: Warrior and Scholar), **↺ Change on heroic −5 s** (5 → 0), and **Start over −5 s**
(7 → 2). Start over took exactly the kit's 5 silver and left the hand-typed **gold 2** and **copper 3**
alone.)*

---

# Adversary pack sync (2026-07-18b — engine + CSS only: `deploy-to-foundry.bat` (or module-src sync) + relaunch, NO pack rebuild. From this deploy on, "re-drag every adversary" = one button)

World adversaries now sync from the compendium like PCs do — better, actually: the sync keeps the
world actor's id, so placed tokens stay attached with their position/HP, and it pushes the
prototype's token fields (vision/disposition/bars/art) onto tokens already on scenes, which a
re-drag never fixed. Matching is by drag-stamp (`_stats.compendiumSource`) or exact name — both
stable because the build's pack ids are deterministic. Renamed world copies are treated as
customized variants: the bulk pass skips them; their own sheet button syncs them explicitly.

      *(Bulk-button row retired at bench run 13, 2026-07-27p: GM footer showed **⟳ Sync Adversaries
      from Pack** + **＋ Edha Character** (positive control), the player's Actors sidebar footer held
      neither — only Foundry's own "Create Actor". The PC-sheet **⟳ Sync Talents** button IS
      player-facing by design and works on an owned actor.)*
- [ ] 🤖 **Bulk sync replaces the 07-17c re-drag** — after deploying 07-17c + this together, do
      NOT re-drag; click the button once. Then confirm a Mistheron placed BEFORE the deploy rolls
      Spearing Beak's +1d6 only vs fooled targets (the 07-17c `whenTargetFooled` fix) — proof the
      new item rules landed on an existing token.
      - ✅ **NARROWED 2026-07-28j (bench run 22) — the `whenTargetFooled` half is PROVEN, both
        directions, on one actor in one sitting.** Against a **fooled** observer the damage rolled
        `1d8 + 2 + (1d6[Spearing Beak])[Spearing Beak] + 0 = 11`; against a target with **no seeming
        up** the same item rolled `1d8 + 2 + 0 = 6` — the rider is present only when belief is.
        ⛔ **What remains is the BULK-BUTTON clause only** — a bulk sync was **not authorised** for
        run 22, so "click the button once instead of re-dragging" is unrun. Blocker named, row
        stays 🤖.
- [ ] 🤖 **Renamed copies skipped** — rename a world copy (e.g. "Roek Alpha") → bulk sync skips it
      and the console lists it under `skipped`; its own sheet button still syncs it.
      - ✅ **NARROWED 2026-07-28j (bench run 22) — the second half is PROVEN.** A renamed,
        drag-stamped copy (`Bench Adv — Mistheron`, `_stats.compendiumSource` pointing at the pack
        Mistheron) **did** sync from its own sheet button: *"Edha: Bench Adv — Mistheron synced from
        the pack (7 items, 1 placed token)."* ⚠️ And the guard is real: **before** that stamp existed
        the same button refused with *"Edha: Bench Adv — Mistheron — no pack source (name not in
        edha-adversaries)."* — so a copy that is BOTH renamed and unstamped has no sync route at all.
        ⛔ **What remains is the bulk-skip clause** (the console `skipped` list), unrun because a bulk
        sync was not authorised. Blocker named, row stays 🤖.

*(**Sheet button · Placed-token push · State preserved · Hand-added items survive · Stale duplicates
healed — ALL FIVE RETIRED on evidence 2026-07-28j, bench run 22**, driven as four assertions over a
single `⟳ Sync from Pack` click on a bench copy, each the others' control.
**Sheet button:** `button.edha-sync-btn` labelled **"⟳ Sync from Pack"** sits on the world adversary's
sheet; clicking it toasted **"synced from the pack (7 items, 1 placed token)"** — both counts named —
and the sheet re-rendered.
**Placed-token push:** that token had been hand-broken to `sight.range 0` / `visionMode "basic"`
beforehand; after the sync, and **without being re-placed**, it read `range 10`, `visionMode "sense"`,
`attenuation 0.1` — the 07-17c vision model pushed onto a token already on the scene.
**State preserved:** in the same click the token kept **HP 3** and **position (600, 1200)** while the
WORLD actor reset **7 → 20/20**, full, like a fresh drag.
**Hand-added items survive:** a genuinely hand-made item (`B22 Hand Trinket`, `_stats.compendiumSource`
**null**) survived — 8 items before, 8 after — while the 7 pack-built items were replaced around it.
⚠️ **A "hand-added" item CLONED from a compendium is not hand-added** as far as the sync is concerned:
a renamed clone of the pack Sidesword carries a `compendiumSource` stamp and **was** removed. That first
result read as a FAIL until it was re-driven with an unstamped item; the behaviour is correct.
**Stale duplicates healed (the READ):** ℹ️ the world holds **FOUR** "Corvaine Raider" actors, not the
five this row and its sibling below both assert. All four are current and identical: Shortsword present
as `type: "weapon"`, `attack.type "melee"`, skill `hwp`, damage `1d6+2 keen`.)*

---

# The all-in-one dashboard (2026-07-18 — repo-side only: `git pull`, then open `EDHA_DASHBOARD.html` in any browser; nothing to deploy in Foundry)

Replaces `EDHA_FOUNDRY_TEST_SHEET.html`. The Bench tab is the old sheet unchanged; marks carry over.

*(**⚑ Old bench marks survived** — retired 2026-07-27v as STALE and **unsatisfiable**:
`EDHA_FOUNDRY_TEST_SHEET.html` was **deleted in the same PR that added the dashboard** (`21501cd`,
"The Edha All-in-One Dashboard (replaces the bench sheet) (#100)"). There is no old sheet left to have
held marks, so the row can never be driven. The live marks caveat that matters is the 07-26 restructure
one, recorded in DEPLOY STATE at the top of this file.)*

*(**All four dashboard rows — Tabs populate · Session-hide · For-Ben jump links · Copy for Claude —
RETIRED on evidence 2026-07-27v**, driven in a real browser against the generated
`EDHA_DASHBOARD.html` on `:8123`. **Tabs populate:** every tab rendered its source content.
**Session-hide:** "hide" on a section header hid it, `#hiddenBar` listed it with **✕ show** and
**show all**, and both restored it — the key is **sessionStorage**, so closing the window really does
reset it. **For-Ben jump links:** "go →" switched tab, scrolled `0 → 9452`, and applied the `flash`
class to the source row. **Copy for Claude:** the payload came out grouped by **tab AND section**, with
the typed notes carried through.*
*⚠️ **Evidence caveat, preserved deliberately:** these were driven by dispatching real `MouseEvent`s at
the registered handlers, **not pixel clicks** — the pane was not compositing, so there are no
screenshots. That tests the logic and the resulting DOM/CSS, **not** whether a control is physically
reachable under a stray overlay.)*

---

# Bench-results fixes (2026-07-17c — all 9 fail/partial rows from the 07-17 results block; **`deploy-to-foundry.bat`** (engine + adversaries + deity rebuild) → relaunch → **"⟳ Sync Adversaries from Pack"**; PC ⟳ Sync optional — only Forge Construct's owned card TEXT lags without it)

All ⚑ (none self-verifiable without a live table). Root causes in the 07-17c handoff delta — the
short version: a removed v13 core API, a system-2.1.0 graze-clone crash that killed every
damage-rider, a schema field the DataModel was stripping, orphaned illusion tokens, a missing
displayName, a missing mode gate, the PC visionMode, and one stale world actor.

- [ ] 🤖 **Single-target picker resolves** — target 2+ tokens, use Withering Ray: the picker card
      appears, nothing is spent; click a name → that token becomes your ONLY target, the card
      marks ✓, and the talent rolls once against it. (Verdant Mend same.)
*(**Spearing Beak rolls from the icon** — RETIRED on evidence 2026-07-28j, bench run 22, **both
directions on a freshly-imported Mistheron**. **ONE** chat message carried **both** rolls: the test
`1d20 + 0 + 5 = 17` (Heavy Weaponry at the row's **+5**) and the damage `1d8 + 2 + 0 = 6` — no dead
click, no second card. Against a **believer** in its seeming (a bench PC the belief sweep had just
listed as Fooled) the damage formula became `1d8 + 2 + (1d6[Spearing Beak])[Spearing Beak] + 0 = 11` —
the rider present **and labelled**. Against a target with **no seeming up**, no `+1d6` at all. That is
the 07-17c `whenTargetFooled` fix proven in both directions with each drive the other's control.)*
*(**⚑ Damage-rider family regression** — RETIRED on evidence 2026-07-27v. The row asks for **one** other
rider talent; **three** have now rolled with a labeled bonus and no dead click, on three separate runs
and three different damage types: **"+5 keen strike"** (Pack Pressure, bench run 3 — and that one was
the premise test, its `amountFormula` edited on the document to a flat 5) · **"+2 impact strike"**
consuming its arm (Momentum of Victory, bench run 7) · **"+8 vital strike"** (Withering Touch off a real
Sidesword hit in combat, bench run 15). The graze-clone guard covers the family.)*
- [ ] 🤖 **AoE burst auto-target** — place any burst (e.g. Flame Surge): the caught tokens end up
      actually TARGETED (this retarget had been silently no-opping on v13).
*(**Seeming recast replaces the token · Seeming copy hover-name — BOTH RETIRED on evidence
2026-07-28j, bench run 22.** First cast created **exactly one** copy token (`Mistheron (3)`) and ran the
belief sweep — *"6 onlooker(s) tested — 3 taken in, 3 see through it"*. Recasting while that copy still
stood posted *"the illusion breaks — the real one stands plainly seen"*, the **old copy token id was
gone from the scene**, **exactly ONE** new copy token appeared, and the **sweep re-ran with a different
result** (*"6 onlooker(s) tested — 2 taken in, 4 see through it"*) — so it is a genuine re-run, not a
cached verdict. No invisible stacking: a scene scan afterwards found one copy token, the caster, and no
orphan. **Hover-name:** the copy token carries `displayName 20` = **OWNER_HOVER**, which is what the row
itself specifies and what every built adversary token uses; as GM (an owner) the name shows on hover.
⚠️ The engine **auto-renamed** the caster's own token to `Mistheron (2)` beside a pre-existing
`Mistheron (1)` — resolve these by id, never by name.)*
*(**⚑ Siege Cannon gated on Siege Form** — RETIRED on evidence 2026-07-27v, **both directions, against
a normally forged `summonTalent`-stamped Construct**. **OFF** (bench run 8): the use was refused
**pre-cost** — "Edha: Siege Cannon (Siege Form only) needs Siege Form active — toggle it on first.
Nothing spent." — with **Investiture unchanged at 4**, no consume dialog, no roll. **ON** (bench run 7):
the Cannon rolled `(2)d(2*3+2)+2+2 = 10` energy and applied exactly **8** through a deflect-2 target.)*
- [ ] 🤖 **Adversary tokens see like PCs (mechanical half)** — select a synced (or re-dragged)
      adversary token and read its vision config: `visionMode` is the cosmere **"sense"** mode,
      the range is its Senses Range (adversary AWA 0 → 10 ft), and a block carrying a bespoke
      `senses` value still wins over the default. This is a document read, not a look.
      *(Split 2026-07-27w.)*
      - ⚠️ **2026-07-28j (bench run 22) — TWO clauses PASS, the third's NUMBER IS WRONG, and the
        fourth has no instance to test. Read at whole-population scale, not on one token.**
        ✅ Across **all 47** world adversaries: `visionMode` is **"sense"** for every one, and token
        sight range **exactly equals** `system.senses.range.value` for every one — **zero**
        mismatches. Those two clauses are settled.
        ❌ **"adversary AWA 0 → 10 ft" is not what the world holds: it is 5 ft.** Every world
        adversary is AWA 0 → Senses **5**. The cause is not a bug in the sync — it is that
        `edhaDeriveSheetStats` opens with `if (actor?.type !== "character") return;` (~L16296) and
        **both** `preCreateActor` token-default hooks do the same, so the Edha AWA table
        (`edhaSensesRangeFtFromAwa`, 0 → 10) is **character-only** and adversaries fall through to
        the cosmere system's own derivation, which gives 5.
        ⚠️ **And the PACK disagrees with the WORLD**: all **52** pack adversaries ship
        `prototypeToken.sight.range` **10** against a `senses.range.value` of **5** (52/52
        mismatched), and the sync PUSHES that 10 — the placed-token row above watched a token come
        back at **10** after a sync while its actor's Senses Range stayed **5**. So a synced token
        sees 10 and a world actor reads 5. Pack 10 · world 5 · sync pushes 10.
        ⛔ **"a bespoke `senses` value still wins" is UNRUNNABLE as written** — **0 of 52** pack and
        **0 of 47** world adversaries carry any `senses.range` override or `useOverride`, so there
        is no such block to test. It needs one authored first.
        **Row stays 🤖** pending a decision on which number is canon — see the ⚑ design row directly
        below, whose premise ("10 ft is intended") is the pack's value, not the live one.
- [ ] ⚑ **Adversary sight range — does 10 ft feel wrong? Say a number.** — with those tokens on a
      real map: adversary AWA 0 → **10 ft** is intended, but it is a **design dial**, not a bug.
      If it plays badly, give the number you want instead. *(Split 2026-07-27w; the config read is
      the 🤖 row above. Related: rulings menu — bench PCs carry the same 10 ft and it nearly caused
      a false PASS.)*
*(**Shortsword on the CURRENT Raider** — RETIRED on evidence 2026-07-28j, bench run 22, together with
"Stale duplicates healed" above (same actors, one pass, as the row asked). ℹ️ **There are FOUR Corvaine
Raider actors in the world, not five** — both rows say five; the count is stale. All four read
identically and correctly: a **Shortsword** present as `type: "weapon"` (so it sits in the WEAPONS
section, not gear), `attack.type "melee"`, skill **`hwp`** (Heavy Weaponry), damage **`1d6+2 keen`** —
ids `WvRRebvUo8TPBBgL`, `XzJI5GsPinxIuzG9`, `rNfn6FIF0jLwoPfH`, `vsAEITDO9m0jPkRS`, all in
`Edha Adversaries`. That a same-shaped Mistheron weapon rolls from its icon was demonstrated separately
in this run by Spearing Beak. The sync half and the GM-lore/ownership half were already settled.)*
      *(Sense-through reveals retired at bench run 13, 2026-07-27p: `PlayerBench` owning
      Bench — Chaos (Void Sense, `edha-sense-reveal` status `omen`) rendered an Omen-marked target
      it could not otherwise see, while an identically-obscured UNMARKED control stayed invisible —
      the mark was the only difference.)*

---

# Map paint workflow + canon codex (2026-07-15d — repo-side only: `git pull`; nothing to deploy in Foundry)

The codex itself is proven in real use (07-17 bench passed "opens & reads"; the edit → ⬆ commit
loop shipped a real canon PR, #92). What's left: the lookup UX, the direct file-save path, and
the Procreate paint loop.

*(**⚑ The capital lookup works** and **⚑ Place-links fly the map** — **both RETIRED on evidence
2026-07-27v**, driven in a real browser against the generated `EDHA_CANON_CODEX.html`. **Capital
lookup:** typing "capital" produced **60 marks** that cycled with Enter; clicking **Heartholt** gave the
Thalendor's-capital info card whose "→ canon section" jumped to **§5a**, and **Aldercourt** jumped to
**§5**. **Place-links:** clicking a dotted place-name in the canon text flew the map pane (the CSS
transform was read at the destination) and raised its info card, quoted.*
*⚠️ **Same evidence caveat as the dashboard rows:** these were driven by dispatching real `MouseEvent`s
at the registered handlers, **not pixel clicks** — no screenshots. That tests the logic and the
resulting DOM/CSS, **not** physical reachability under a stray overlay.)*

- [ ] ⚑ **Paint overlay imports aligned — REWRITTEN 2026-07-27v against the real numbers; every figure
      in the previous version was wrong** (it said 2865×3399 and 6 crosshairs, and it listed Heartholt
      and Withervale as still to paint when both are already flagged `painted: true`).
      **Step 0, do this first:** run `python scripts/map/paint_overlay.py`. The committed
      `source-materials/maps/paint-overlay.png` **is stale** — it predates the last gazetteer edit and
      regenerates to a different file. Then send the PNG to the iPad and import it into
      `Thycross.procreate` as a top layer (Insert a file — it is exactly canvas-sized, **2236×2976**).
      **Expect 19 magenta crosshairs, not 6**: **13 unpainted SITES** (Elmsworth · Palewater Ford ·
      Aldercourt · Moonmere · Fenholt · Brandmere · Kenmere · the Hush · Arcanta · the Ashhold ·
      Kaelmouth · Raskeld · Kaelgate) plus **6 already-drawn city dots that need a NAME** (Maelvik ·
      Maelstrand · Kragmoot · Tirgard · Goldenport · Portavere — each labelled "(name for existing
      dot city-NN)"). **Already painted, and correctly absent from the overlay: Heartholt · Withervale ·
      Black Altar Crossing · Lake Vespera.** Check the 19 sit where the labeled map says those places
      are. Paint at leisure; report back so the `painted` flags flip. If a placement doesn't work on the
      canvas, paint it where it SHOULD be, click that spot in `viewer.html`, and include the "(x, y)" in
      the report — your brush overrules the gazetteer, and the session re-measures whatever routes the
      move changes.
- [ ] ⚑ **💾 writes the real file** — with an edit pending, 💾 save file → pick
      `EDHA_CAMPAIGN_CANON.md` (repo root; Chrome/Edge only — the button stays dead in
      Firefox): your change is in the MD (`git diff` shows it). Second save shouldn't re-ask
      for the file.
      ⛔ **BLOCKER (2026-07-27w): genuinely not agent-drivable.** `showSaveFilePicker` needs a real
      user gesture **and** an OS file dialog, is Chrome/Edge-only, and the write lands inside the
      repo. No bench harness can supply any of the three. ⚑ by nature, not by tagging.
- [ ] ⚑ **Ergonomics verdict** — both tools freeform: pane split, label sizes, search feel,
      editing feel, anything that makes lookup slower than grepping the MD is a bug here.

---

# Adversary ability wiring (2026-07-16 + 16b — session-1 actors and the playtest 9; not yet benched)

07-17 bench already passed The Seeming's core loop, Break cues, and the Fade damage-cue; the
hover-name / recast / Spearing Beak fails have their 07-17c re-test rows. What's left: the
session-1 cues nobody triggered, the per-bird fix, and the whole playtest-9 wiring. Every
hand-run ability carries a written no-hook rationale (Combat Training, Pack Tactics, Veil,
Mutation Upgrade); superseded hand-toggle AEs were removed — the engine does those now.

- [ ] 🤖 **Cover Their Retreat** — drop a Raider within 20 ft of Roek: his card offers the
      shove-behind-cover roll-back. Drop one beyond 20 ft: no card.
- [ ] 🤖 **Press the Line rider** — on a HIT: the allied-Raider-reaction-shot card; on a miss or
      graze-to-zero: nothing.
- [ ] 🤖 **Morale cues** — Roek crossing 1/3 HP (Not a Bandit), the Line-Caller dropping (The
      Line Falls Apart), a Mistheron bloodied (Starving, Not Fanatic): one whispered card each,
      at the crossing only (no re-fire while it stays below).
- [ ] 🤖 **Per-bird seemings (fixed 07-16b)** — TWO Mistherons on scene (copy-paste the token so
      they share a world actor — the worst case): each bird raises its OWN seeming; the second
      cast must NOT clear the first bird's copy; each bird re-casting replaces only its own;
      Spearing Beak's +1d6 keys to the attacking bird's copy, not its partner's.
- [ ] 🤖 **Braced expiry — RE-TEST after fix pass D (07-28g; engine-only → ⟟ sync + F5). FOUR cells,
      and the point is that two of them must DIFFER** — run 20 found Brace immortal, but its stated
      cause (`braced` missing from `EDHA_TIMED_STATUSES`) was wrong; the real hole was that
      `edhaApplyTimedStatus` only stamps an expiry when a combat is already RUNNING, and the
      catch-up pass ignored anything off that allowlist. So drive the out-of-combat order
      deliberately. **(a) THE BUG'S OWN CASE:** with NO combat, use a Trooper's **Brace** → the
      shield icon lands and the effect now carries `flags.edha-content.timedExpire`. THEN start a
      combat with the Trooper in it and step turns: at the first turn change the flag becomes
      `expireAfter`, and by the end of the Trooper's next turn the icon is GONE with a
      "💢 … ends (end of its turn)" card. **(b) POSITIVE CONTROL:** use Brace INSIDE a running
      combat → `expireAfter` is stamped immediately (no `timedExpire` at all) and it still expires
      on schedule. **(c) NEGATIVE CONTROL, the one that matters:** the Frostbinder's token must
      STILL wear `braced` permanently — step at least four rounds; Predictive Ward carries no
      `timedExpire` and must never acquire an `expireAfter`. **(d) SECOND NEGATIVE CONTROL:** a
      `slowed` in the same combat must expire exactly as before (the allowlist path is untouched).
      Report all four; (a) and (c) reading the same is the failure the old row could not detect.
      - ✅ **2026-07-28h (bench run 21) — (a), (c) and (d) ALL PASS and (a) ≠ (c). (b) is
        BLOCKED.** Staged one bench combat holding my own unlinked Trooper + Frostbinder tokens
        and Bench — Heroic, created `active:false` and stepped with `combat.update({round,turn})`
        so Ben's combat was never touched.
        · **(a) THE BUG'S OWN CASE — PASSES.** Brace used with the Trooper in no running combat
        stamped **no** `expireAfter` and instead recorded the intent
        `timedExpire {expire:"owner", ownerUuid:…}`. At the first turn change the catch-up pass
        consumed it — intent **null**, `expireAfter {round:1, turn:2}` (the Trooper's own index,
        owner-relative) — and at (2,0) the icon was **GONE** with
        "💢 Braced (attacks at disadvantage) on Trooper ends (end of its turn)."
        · **(c) NEGATIVE CONTROL — PASSES, and reads DIFFERENTLY from (a).** The Frostbinder's
        Predictive Ward `braced` (a transfer AE that never went through `edhaApplyTimedStatus`)
        survived **5 rounds / 14 turn-changes** with `expireAfter` **null** and `timedExpire`
        **null** throughout — it never acquired a stamp.
        · **(d) SECOND NEGATIVE CONTROL — PASSES.** A hand-toggled `slowed` on the same
        Frostbinder stamped `{round:1, turn:1}` off the allowlist path and expired on schedule at
        (1,2): "💢 Slowed on Frostbinder ends (end of its turn)." Allowlist path untouched.
        · **Confirmed on the engine as the row requires: `braced` is NOT in
        `EDHA_TIMED_STATUSES`** (L608 = weakened, immobilized, slowed, noactions, noreactions).
      - ⛔ **(b) BLOCKED — blocker named; row stays 🤖.** (b) wants Brace used INSIDE a running
        combat so the stamp lands immediately. `edhaApplyTimedStatus` reads **`game.combat`**,
        which resolves to the scene's **ACTIVE** combat — Ben's `BerbNeuXp4iKduef`. Reaching that
        branch needs the Brace user to be a combatant in **Ben's** combat, and the bench may
        neither add a token to it nor activate a combat of its own (both are standing rules). A
        bench combat created `active:false` cannot satisfy it: `game.combat` still returned
        `BerbNeuXp4iKduef` throughout. Needs Ben, or a rule change.
- [ ] 🤖 **Cinder Coat splash-back** — melee-hit a Cinderhound: the attacker automatically takes
      1d4 Energy (card names the hound). A ranged hit from across the room must NOT splash.
- [ ] 🤖 **Bite sheds light** — a bitten creature's token starts glowing (the Kindle light rider).
- [ ] 🤖 **Stalker Fade cue** — damage a Stalker: the graze-or-miss reminder card (once/round).
- [ ] 🤖 **Devastating Blow cue** — on ITS hit: the margin-Prone reminder; on other attacks: none.

*(**Ruling wanted: Combat Training's garbled source** — moved to `EDHA_RULINGS.md` **R-29** on
2026-07-27w. The cheatsheet sentence reads "turn one of its own **grazes into a graze**"; whether
that means miss → graze or graze → hit is a decision, not a test, and it has sat in a test list
since 2026-07-16.)*

## The 2bAB pre-deploy audit rewires (2026-07-26 — 15 dead adversary copies of tree talents, wired)

The pre-deploy audit found 15 bespoke adversary abilities sharing a tree talent's name that had
been riding the deleted engine name-keys — dead, their texts still claiming engine wiring. Each
now carries its tree twin's rule on its own item; nothing below has ever run in Foundry.
**Re-drag each adversary from the pack first** (placed copies are frozen snapshots).

*(2bAB-2 and 2bAB-3 — Crownox Ring Shield Wall + Retributive Guard — PASSED in bench run 3
(2026-07-26k) on a FRESH pack import, three unlinked ring tokens: the half-1d6 pre-reduction
applied by itself and was named in chat ("reduced by 1 — Shield Wall", calc "5 - 1"), and the
retaliate PROMPT posted by itself from the damage — one per adjacent ring-mate — with the click
running White vs Spiritual through the contest core and dealing "3 spirit" on the success.
Retired; evidence in the 07-26k delta.)*
- [ ] 🤖 **2bAB-8 — Stitchmother — Adaptive Mutation + Reknit Form** — target a thrall, use Mutation; then use Reknit Form → Mutation posts the two-graft chooser (+2 keen / 2-vital venom, no third option) and the bonuses ride the thrall's Slam. Reknit posts the injury picker; the buttons charge NOTHING extra (her card's flat 1 Inv + 1 Focus already paid).
      - ✅ **2026-07-28f (bench run 20) — the Adaptive Mutation HALF PASSES in full.** Chooser card
        offered **exactly two** grafts (Bone Spurs / Venom Glands — **no third option**); picking
        Bone Spurs wrote `mutation {kind:"boneSpurs", keen:2}` and the bonus **rode the thrall's
        Slam**: damage `1d6+3 = 7` **+2 keen = 9**, card "🦴 Bone Spurs (Life): +2 keen on the
        strike", victim 47 → 38 at Deflect 0.
      - ⚠️ **The Reknit Form half FAILED (run 20) and is FIXED in 07-28g — see the dedicated
        re-test row below.**
- [ ] 🤖 **2bAB-9 — Reeve-Owl — Sovereign of Solitude — READ THE PACK BEFORE CONCLUDING ANYTHING
      (revised 07-28g; NO code or data change)** — run 20 reported `rules = 0, effects = 0` and
      called it an authoring gap. **The repo disagrees and was checked line by line:**
      `data/adversaries.json` carries **four** rules on this item (`edha-apply-watch`→`edha-gm-cue`,
      `use`→`edha-def-test` black-vs-spi, `use`→`edha-triggered-effect` Immobilize,
      `edha-test-success`→`edha-triggered-effect` 1d6 vital), every event and handler type
      registered; they were authored 07-26, the file has not changed since, and the **07-27u deploy
      rebuilt the adversaries pack** with `validate-adversaries` clean. **Nothing was authored this
      pass — deliberately, to keep the pack-rebuild list EMPTY.** So: **(a)** read the item straight
      out of the COMPENDIUM (`game.packs.get("edha-content.edha-adversaries")` → Reeve-Owl → its
      `Sovereign of Solitude` → count `system.events`) and **(b)** read the same count off a
      **placed/imported** copy on the canvas, and report BOTH numbers. Pack 4 + placed 0 = a stale
      placed copy → **⟟ Sync Adversaries from Pack** or re-drag, then retest the mechanic. Pack 0 =
      a genuine build/deploy gap, and only then is a rebuild owed. **(c)** Once a copy shows 4,
      run the original test: target the moving Weakened creature, use it → Immobilized lands, Black
      vs Spiritual auto-resolves, a success rolls 1d6 vital.

## Still unbenched from the manual re-litigation (2026-07-16c)

*(**⚑ Senses field on the sheet** — retired 2026-07-27v as **UNRUNNABLE: there is no test subject.**
Measured across the whole shipped bestiary — **0 of 52 adversary blocks carry a `senses` value.** The
builder supports the field; nothing uses it. The row asks to observe "an adversary block with an
explicit `senses` value", and no such block exists. **If this question matters, the action is to AUTHOR
one** — put an explicit `senses` on a block, rebuild, and open its sheet — not to re-open this row.)*

- [ ] 🤖 **Veil auto-toggle (Stalker)** — Stalker standing in darkness: the Veil marker enables
      itself + a GM whisper; walk it into light: the marker releases. Toggle it ON manually in
      light (cover): the engine leaves it alone.

---

# Goldenport Coast Bestiary (W27, rulings 97–98 — statted 2026-07-20)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v.** Everything this
section wanted is live: the adversaries pack was rebuilt on **2026-07-27u** (52 actors / 336 embedded
items, `validate-adversaries` ✓ 0 issues) and the **world-wide adversary sync ran at bench run 11 —
46 synced, 0 skipped, zero effect drift**. Folder: *Goldenport Coast Bestiary* (4 blocks). *(Placed
copies you dragged out before 07-27u are still frozen snapshots — re-drag or ⟳ Sync those, as always.)*

## 1. The Garden Sow (boss — Nexus-Fed is the edha-regen handler's FIRST consumer)
*(**The Old Agreement** — RETIRED on evidence 2026-07-27v: the shipped block carries **`rules = 0`,
`effects = 0`** on this ability, with the `NO NAMEABLE HOOK` rationale in its own text ("NPC
intent/targeting isn't data — the Pack Tactics class; the GM plays the agreement"). There is nothing
that *could* try to automate it, so the row's question is answered by the artifact.)*

*(**Nexus-Fed** · **Rooted Fury cue** · **Trampling Charge on-hit cue** — RETIRED on evidence
2026-07-28, bench run 17, on a FRESH pack import. Nexus-Fed: ending the Sow's turn in a bench combat
took her **28 → 33** and whispered "⏰ Nexus-Fed … regains 5 HP. (+5 HP applied, end of turn.)"; at
**full** HP the same turn-end wrote nothing and posted nothing, and at **0** HP it did not regen —
both negatives driven, not inferred. Rooted Fury: 62 → 30 posted "Trampling Charge now costs 1 Action
for the rest of the scene" once, and a second hit while below posted nothing. Trampling Charge:
"… the target is knocked Prone. (hit Bench Target — Undefended.)", and a 0-damage application (the
miss case) posted nothing.)*

## 2. Keelshadow (rival — ambush-belief + fooled rider)

*(**Hull-Shadow belief test** · **Breach and Drag rider** · **Sounding Dive cue** · **Drag cue** —
RETIRED on evidence 2026-07-28, bench run 17. Hull-Shadow rolled `2d20kh + 0` vs its Cognitive **12**
against genuine mod-0 fixtures (advantage present, mod correct), marked a failure fooled, and posted
**no** second belief card on the next attack against the same target. The rider fired only vs the
fooled: `1d8 + 4 + (1d6)[Breach and Drag] + 0` against a fooled target vs `1d8 + 4 + 0` against two
that saw through it. Drag cue: "… dragged in/under (**DC 13 Athletics** to catch hold). (hit …)",
whispered, and silent on the second hit that round. Sounding Dive: "… it dives: untargetable from the
surface …" on the first damage, silent on the second that round. ⚠️ **Row-wording correction:** the
rider's flavor label is the **carrying item's** name (`[Breach and Drag]`), not the seeming's.)*

## 3. Cinderbrock (rival — Fire the Wrack IS Pyre by alias)
*(**Fire the Wrack places the region** — ✅ **RETIRED on evidence 2026-07-28c, bench run 18** — the
run-17 FAIL below is fixed and re-driven; see the dispatcher row's evidence directly beneath. Kept for
its root-cause history only.)*

*(2026-07-28 bench run 17 — **FAIL, root-caused; engine-only fix, no rebuild.** Nothing is
      placed: five drives on a FRESH import created **0** Regions, posted no card and logged no
      error, with the caster's token controlled, no target set, Bench holding `isActiveGM`, the rule
      `disabled: false` and its executor present. **Cause:** the rule sits on the **`edha-pre-use`**
      event, and `edha-pre-use` appears **exactly once in the entire 15k-line engine** — its own
      `registerItemEventType`, whose hook is the sentinel `edha-content.noop-pre-use` that nothing
      fires. The only `preUseItem` takeover glue that exists is burst-specific
      (`const h = edhaRuleOf(item, "edha-burst"); if (!h) return;`), so an `edha-place-hazard` rule
      on that event is **unreachable** and `edhaPlaceHazard` never runs. **Matched control, measured
      the same session:** the Destruction PC's Walking Ruin carries the same `edha-place-hazard`
      handler on the **`use`** event and fired instantly ("🏚️ Walking Ruin active — spaces you move
      through become dangerous terrain"). **Blast radius = 1 ability:** a sweep of `data/` finds 9
      rules on `edha-pre-use`, 8 of them `edha-burst` (which work), and this is the only
      `edha-place-hazard` one; both PC place-hazard rules in `deity-destruction.json` use `use`.
      ⚠️ **Row-wording correction:** `edhaPlaceHazard` does **not** click-place — it centres on
      `game.user.targets[0]`, else the caster's own token. There is no pick to drive.)*
      *(2026-07-28b fix pass B — **FIXED ENGINE-ONLY, ⟳ sync + F5, NO pack rebuild.** The run's
      proposed data fix (`edha-pre-use` → `use`) was declined: it would re-open the pack-rebuild
      list, which is EMPTY for the first time in the project's tracked history, and would leave the
      trap armed for the next author. Instead the sentinel hook is now **fired** from the real
      `preUseItem`, so the system's own `fireEvent` dispatches **every** handler type on
      `edha-pre-use`. Not a takeover — it does not return `false`, so the Action cost and card stay
      the system's job. `edha-burst` rules are skipped, so the 8 shipped burst rules are untouched.)*
*(**Fire the Wrack — the pre-use dispatcher** — RETIRED on evidence 2026-07-28c, bench run 18, **all
three controls, with Ben's `Gamemaster` connected throughout**.
**POSITIVE:** one use placed **exactly one** Region — `Fire the Wrack — Dangerous Terrain`, a 10-ft
rectangle on the caster (no target set), behavior `edha-content.hazard`, flags
`{hazard, scope: "scene", sourceItem: "Fire the Wrack", terrain: {ownerUuid, color: "red"}, spreads: true}` —
and the Cinderbrock immediately took "🔥 … **5 energy** from dangerous terrain", so the zone is live.
**NOT A TAKEOVER:** the system's own item card posted alongside it (`cosmere-rpg.message.type = "action"`,
rendering the `action1` icon and "Activation: One Action"), so the cost and card stayed the system's job.
**NEGATIVE 1 (bursts unchanged):** Flame Surge fired **exactly once** — one range ring + one 10-ft
template flagged `burst: "Flame Surge"`, one Detonate card, one resolution ("💥 Flame Surge hit: = 5 (2d8)
+ 5 (red) + 5 (Kindle) → 15 energy"), damage applied once per target (30→17 and 32→27 against Deflect 2),
both templates cleaned up, cost consumed once. No doubled resolution, no second card.
**NEGATIVE 2 (no double-place):** with two GM clients connected, the one use produced **one** Region and
the one burst produced **one** template pair.
⚠️ Harness note for future runs: `edhaCastBurst` **consumes the cost and then blocks on `edhaPickPoint`**,
which waits for a `pointerdown` on `#board`. With the pane hidden that reads exactly like "the talent
silently ate my Investiture and did nothing". Drive it by pinning `canvas.mousePosition` and dispatching
the event; **Escape cancels and refunds**.)*
- [ ] 🤖 **Pyre spread card BY ALIAS** — at the end of the CINDERBROCK's turn with a patch on the
      scene: the whispered spread card fires, labeled **Fire the Wrack** (not "Pyre"), with
      working Spread + Extinguish buttons. A PC Destruction player's own Pyre zones must still
      spread separately (alias must not cross owners — sourceOwnerUuid check).
      *(2026-07-28 bench run 17 — **BLOCKED downstream of the row above, row stays 🤖.** The spread
      watcher keys on a Region stamped `spreads` by the placer, and the Cinderbrock cannot place one
      at all while `edha-pre-use` has no dispatcher. Re-drive this the moment that fix lands.)*
      *(2026-07-28c bench run 18 — ✅ **UNBLOCKED, and the precondition is now confirmed present, but the
      row itself is NOT RUN — it stays 🤖.** The placed Region carries `spreads: true` **and** the
      `terrain.ownerUuid` stamp, which is exactly what the end-of-turn spread watcher and the
      cross-owner check read, so nothing structural stands in the way any more. What run 18 did **not**
      do is step a combat to the end of the **Cinderbrock's own** turn with a patch live and read the
      card, nor stage the PC-Pyre-alongside control — so no claim is made about the spread card or its
      buttons. Cheapest next drive: add the Cinderbrock to a bench combat, step forward to end its
      turn, and check the card is labelled **Fire the Wrack**, not "Pyre".)*

## 4. Cold-Fire Cinderbrock (the wasting variant)

*(**Loadout sanity** — RETIRED on evidence 2026-07-27v, read out of the shipped block: its item list is
**exactly** Ember Bite (**atk +4, 1d6+1 energy**) + Furnace Heart (its `edha-gm-cue` at `rangeFt: 5`) —
**no Fire the Wrack, no Den Fury** — and **hp 14**. Every number and every absence the row asks for
checks out. Whether it "reads sad, not undying" is prose, and its biography carries that read
explicitly.)*

- [ ] ⚑ **Cold-Fire Cinderbrock — does it read PITIABLE, or just weaker?** — the whole point of
      the wasting variant is that a 14-HP stripped Cinderbrock (no Fire the Wrack, no Den Fury)
      should land as **sad**, not as a nerfed statblock. Run it once and say which it was; if it
      only reads weaker, the fix is prose and encounter framing, not numbers. *(Split out
      2026-07-27w when its mechanical half — the loadout read — retired above and took the
      flavor question with it.)*

# Canticle Plains Bestiary (W28, rulings 106–107 — statted 2026-07-20)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v** (adversaries rebuilt
07-27u; world-wide sync 46/0 at bench run 11, zero effect drift). Folder: *Canticle Plains Bestiary*
(3 blocks).

⚠️ **PREAMBLE REWRITTEN 2026-07-27v — the old one described an engine that no longer exists.** It said
these blocks "double as the proof that the **name-keyed engine paths** reach adversary-owned items".
There are no name-keyed engine paths: the **rule-2b migration completed 2026-07-26** and
`scripts/name-keyed-allowlist.json` now reads `talents: []`. These blocks are still the first to carry
PC talents by **verbatim name** on an adversary at scale (Stitchmother precedent), but the name is now
just a name — **every one of the five carries its OWN rules on its own item**, verified in the built
pack: Guiding Signal → `edha-designate` · Counterpoint → `edha-def-test` + `edha-triggered-effect` ·
Overwhelming Authority → `edha-prompt-pick` + `edha-triggered-effect` · Unnerving Approach →
`edha-prompt-pick` + `edha-push` + `edha-note` · Dread Presence → `edha-move-veto`. **So the question
these rows answer is "does this item's own rule fire?", not "does a name reach an adversary?" — and
every "(name-keyed)" label in this section and in W29 is struck as false.**

## 1. Callthief (rival ×2 — the influence-duel kit)

*(**Overwhelming Authority** — RETIRED on evidence 2026-07-28c, bench run 18, on a **FRESH pack
import** as `Bench Adv — Callthief`: the use posted its own prompt card — "🗣️ **Overwhelming
Authority** — if the Callthief successfully influenced this character or beast, spend 1 Focus to also
leave it Disoriented until the end of the Callthief's next turn. [Disorient]" — and clicking it
printed "**Overwhelming Authority — Bench Target — Adjacent A is Disoriented** (Disoriented until the
end of the Callthief's next turn)", asserted on the document as **both** an effect and a status. The
1 Focus was charged through the system's own Consume Resource confirm.)*

*(**Take the Answerer on-hit cue** — RETIRED on evidence 2026-07-28c, bench run 18, with its own
negative: applying the damage with an explicit dealer posted "⏰ **Take the Answerer** (Bench Adv —
Callthief): If the target is Disoriented, add **+1d4 keen** to the damage — the answerer taken
mid-stumble. *(hit Bench Target — Adjacent A.)*" **CONTROL — the use alone, with nothing dealt**,
posted only the system attack card and **no cue card**, which is the row's "no card on a miss" half.)*

*(**Counterpoint** — RETIRED on evidence 2026-07-27v, bench run 14, on a **FRESH pack import** as
`Bench Adv — Callthief`: it rolled the Callthief's **Deception** and printed "Counterpoint: **48 vs
Bench Target — Undefended's DC 25 — SUCCESS**", negated the influence and left the target
**Disoriented**, asserted on the document as both effect and status. ⚠️ Recorded with the run's own
correction: a **first** drive printed "DC ?" and still returned SUCCESS — that was the **harness**
clicking through the `vs: "prompt-dc"` dialog with an empty field, not the engine. Typing a DC gave the
correct card. Note also that the rule is `prompt-dc`, not "vs Cognitive defense" — which is rulings
item 3A-12, still open.)*

*(**Guiding Signal** — retired 2026-07-27v as STALE: **superseded by 2bAB-4**, which drives the same
ability across **The Reckoning, Bellwether AND Callthief** on the current wiring. Keep 2bAB-4; this row
tested the same thing on one block with an obsolete rationale.)*

*(**Loadout sanity** — RETIRED on evidence 2026-07-27v, read out of the shipped block: **count 2** ·
Take the Answerer **atk +6, 1d8+2 keen** · **Deception 4**. Every number the row asks for matches.)*

## 2. The False Spring (boss — Held Oasis ambush-belief + fooled rider)
*(**Held Oasis belief test** — RETIRED on evidence 2026-07-28c, bench run 18: driven at **five fresh
targets**, one engine roll each — "🌫️ **The Held Oasis** — Bench Target — Undefended: **Perception 12
vs 12 → sees through it**". The roll formula was captured by a read-only `Roll#evaluate` patch and
reads **`1d20 + <mod>`, never `2d20kh`** — the NO-advantage half, settled from the formula rather than
the total. DC is the False Spring's own **cog 12**. **A SECOND attack on an already-tested target
rolled only the attack die** (`1d20 + 0 + 7`), posted no belief card, and left the ledger entry
byte-identical — the once-per-scene gate.)*

*(**Glare-Strike fooled rider** — RETIRED on evidence 2026-07-28c, bench run 18, as a matched pair on
one actor: vs a **fooled** target the damage formula read `1d10 + 3 + **(1d6)[Glare-Strike]** + (3)[Kindle] + 0`;
vs a target that had tested and **seen through it**, the same attack read `1d10 + 3 + (3)[Kindle] + 0` —
no rider. Flavor-labeled, as the row asks.)*

*(**Kindle** — RETIRED on evidence 2026-07-28c, bench run 18, **both halves on one hit**. The +3 rider
is in every energy damage formula as `**(3)[Kindle]**` (boss role rank). The previously-unrun half is
now run: after the hit the bitten creature's **token document really carries light** —
`{dim: 5, bright: 2.5, color: "#ff7a1a", animation: {type: "flame"}}` — i.e. it starts glowing, which
is what `lightRadiusFt: 5` claimed. Cleared afterwards with `edha.clearKindleLights()`.)*

*(**Afterburn opportunity prompt** — RETIRED on evidence 2026-07-28c, bench run 18: the prompt card
posts after the energy hit ("Opportunity is trusted (no auto-deduct)"), and with the creature targeted,
clicking **Fire Afterburn** printed "⚡ **Afterburn** (Bench Adv — The False Spring) — Bench Target —
Undefended is **Afflicted [2 energy]** — auto-deals at the start of its turns until the condition is
removed", rolled as **`floor(1d8 / 2)`** (ruling 122 re-dice). Afflicted asserted on the document. No
resource was auto-deducted anywhere — Opportunity stays trusted.)*

*(**Heat of the Flats cue** — RETIRED on evidence 2026-07-28c, bench run 18, in a bench combat built
`scene: null` and stepped **forward**: when the friendly Bench — Black's turn started adjacent to the
False Spring, it posted "⏰ **Heat of the Flats** (Bench Adv — The False Spring): This character loses
1 focus (open glare; shade or full cover negates — table read). *(Bench — Black's turn starts in
range.)*" ⚠️ Note for future runs: the cue is `enemy-turn-start`, so the mover must be on the **opposite
disposition** — a same-side token starting its turn correctly fires nothing.)*
- [ ] ⚑ **Heat of the Flats — when does SHADE negate the glare?** — the cue has no shade
      clause and no hook could give it one; it is a table read. Say what counts as shade
      (a wall? any cover? only a roofed square?) so the card can carry the answer.
      *(Split 2026-07-27w.)*
*(**Gone Into the Shimmer cue** — RETIRED on evidence 2026-07-28c, bench run 18, **with its no-re-fire
control**: the first crossing of 24 (48 → 22) posted "⏰ **Gone Into the Shimmer** (Bench Adv — The
False Spring): It drops the mirage and disengages into the heat-haze — end of the fight, start of the
walk home." Healing back to 48 and crossing **again** posted **nothing**, and the ledger key
`cue:Gone Into the Shimmer:hp-below:0_5:0:1` explains why.)*

## 3. Dirgehound Pack (rival ×3 — the Dread Presence veto's first bestiary reuse)
*(**Dread Presence VETO on an adversary owner** — retired 2026-07-27v as STALE: it is the **W28 headline
row that W29 §0 explicitly re-tests** ("RE-TEST of the W28 headline row" — it was DEAD before the
ruling-113 owner-scan widening, because the scan skipped adversary owners AND unlinked token copies).
**Keep W29 §0's row**, which is the same test on the current engine.)*

*(**Unnerving Approach** — RETIRED on evidence 2026-07-28c, bench run 18, **and it is the third member
of the `edha-push` blast radius**: the use offered its own `edha-prompt-pick` list of creatures allied
to the target within 10 ft, and picking one posted "💥 **Unnerving Approach** — Bench Target —
Undefended is **pushed 5 ft directly away from Bench Target — Adjacent A**" with a **real −300 px**
`_source` displacement (one full square at 60 px/ft), immediately followed by its `edha-note`:
"😨 **Unnerving Approach**: if no ally remains adjacent, the target is **Isolated** (the marker re-syncs
on the move)." The push→Isolated path fires exactly as it does for a PC.)*

*(**Predatory Patience test rider** — RETIRED on evidence 2026-07-28c, bench run 18, as a matched pair:
un-Weakened target → `1d20 + 0 + 5`; the same target Weakened → `1d20 + 0 + 5 + **1d6[Predatory
Patience]**` — the rank-2 rival die (ruling 122). The **on-hit half** fired too: "⏰ **Predatory
Patience** (Bench Adv — Dirgehound Pack): If the target is Weakened: the dirgehound regains 1 Focus
(GM adds — adversary focus has no auto-write). *(hit …)*")*

*(**Predator's Due on-defeat** — RETIRED on evidence 2026-07-28c, bench run 18, with the killer's token
**CONTROLLED** first (run-16 lesson — `edhaResolveKiller` reads `canvas.tokens.controlled`, not the
dealer): dropping a victim to 0 posted "⚡ **Predator's Due** (Bench Adv — Dirgehound Pack) — Bench Adv —
Dirgehound Pack **regains 1 health**. *(… +1d6 health … and 1 Focus on the kill (focus is a GM add).)*"
and the heal was **engine-applied** (HP 5 → 6), not just narrated.)*

*(**Worry the Straggler on-hit cue** — RETIRED on evidence 2026-07-28c, bench run 18: "⏰ **Worry the
Straggler** (Bench Adv — Dirgehound Pack): If the target is Isolated or Weakened, add **+1d4 keen** —
the pack takes the cut-out one. *(hit Bench Target — Floater.)*")*

*(**Loadout sanity (numbers)** — RETIRED on evidence 2026-07-28c, bench run 18, read off a fresh pack
import: **role rival · count 3 · hp 14** (`max.override = 14`). Both numbers the row asks for match.)*
- [ ] ⚑ **Dirgehounds — pack or mob?** — play them once: do 3 × 14 HP dirgehounds read as a
      **pack that cuts one target out of the group**, or as an undifferentiated swarm? If they
      play as a mob, say so and the count/HP split gets re-cut. *(Split 2026-07-27w.)*

---

# W29 Balance-Pass Bestiary (rulings 108–113 — statted 2026-07-20)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v.** The ruling-113
owner-scan widening is live in the deployed engine (hash-verified identical to `HEAD` on every bench run
since 11), the adversaries pack was rebuilt **07-27u**, and the **world-wide sync ran at bench run 11 —
46 synced, 0 skipped, zero effect drift**. Folders: *Thalendor Heartwood Bestiary* (4 blocks),
*Riverlands Bestiary* (+1), *Corvaine River-Plains Bestiary* (1), *Malcurr Lakes Bestiary* (+2).

📊 **Bench run 19 (2026-07-28e) swept this section: 24 🤖 in, 21 retired on evidence, 3 left, zero
NOT REACHED.** 10 imports → **2.1 retired per import**. The 3 that remain are **two findings, not
three**: the `ally-drops` 5-ft reach + missing `use` rule (§2), and one shared `bySize`/rank-scaling
distance gap behind both §7 rows (with a third consumer noted in §8). The 2 ⚑ rows are Ben's and were
left untouched. No "(name-keyed)" label was left standing anywhere in this section — the only two
mentions are inside already-struck retired parentheticals that record the label as false.

## 0. Engine — the owner-scan widening (ruling 113; fixes a shipped W28 bug)

*(**Dread Presence veto from the Dirgehound Pack** — RETIRED on evidence 2026-07-28e, bench run 19,
with a matched control. Owner in range (5 ft): the Weakened mover's willing `update({x,y})` toward a
living same-disposition ally was **vetoed outright** — position **completely unchanged** — with the
engine's message: *"Dread Presence: Bench Target — Adjacent A is Weakened and cannot willingly move
closer to Stalker. (Engine-forced movement bypasses this.)"* Matched control, the **identical** move
with the only in-range owner parked **115 ft** away (and the sole other `edha-move-veto` owner on the
scene, `Bench — Black`, at 107 ft): the token **moved** and **zero notifications** fired. The veto
resolves an ADVERSARY owner on an UNLINKED token copy, which is exactly what the ruling-113 widening
added. ⚠️ Note for future drivers: the control's token landed 31 px short of the requested square —
that is v13's **wall-constrained walk** on a plain `update({x,y})` (run 18's lesson), not a partial
veto; the assertion that matters is "did it move at all".)*

*(**Shield Wall engine pre-reduction from a crownox** — RETIRED on evidence 2026-07-27v, bench run 3,
on a **FRESH pack import** with three unlinked ring tokens: the half-die pre-reduction **applied by
itself** and was named in chat — "reduced by **1**", calc "5 - 1". ⚠️ **Evidence caveat, kept honest:**
the "reduced by 1" observation **alone does not separate rival d6 from d4** — a 1 is possible on both.
What settles the die is the **pack + rank read**: the Crownox is a rival, ruling 122 makes adversary
dice the ROLE rank, and role rank 2 gives `2*2+2 = 6` → **d6**. Both halves are required; neither is
sufficient. This also retires the Vorsk §0 "Shield Wall reduction at rival d6" row, which asked the
same question.)*

*(**Whispered Doubt focus-tax from the tollbird flock** — retired 2026-07-27v as STALE: **superseded by
2bAB-5**, which drives exactly this ability on the Tollbird Flock against the current wiring — "an enemy
of the flock spends focus within its Black range → it loses 1 MORE focus, announced, once per round per
enemy — the watch is on the item now". Keep 2bAB-5.)*

## 1. Reeve-Owl (Black rival — the judgment kit)

*(**ALL FOUR Reeve-Owl rows RETIRED on evidence 2026-07-28e, bench run 19** — one import, four rows.
⚠️ The staging that makes these runnable: the owl was placed at disposition **−2** so that it does not
itself count as the victim's same-disposition adjacent and silently void every Isolated-gated row
(`edhaIsIsolated`); the harness asserted `isolated: true` on the victim and `false` on the control pair
before driving anything.
· **Sapping Hex on-hit** — Isolated victim: *"Sapping Hex — Bench Target — Isolated is Weakened."* plus
the `Weakened` effect on the actor; non-Isolated control: *"Sapping Hex — no Isolated target to affect"*
and **no effect**. Both halves. (The status is genuinely **timed** — it later expired by itself:
*"💢 Weakened on Bench Target — Isolated ends (end of its turn)."*)
· **Predatory Patience rider + cue** — proven by FORMULA, not by total: Weakened target →
`1d20 + 0 + 6 + 1d6[Predatory Patience]`; non-Weakened control → `1d20 + 0 + 6`. The whispered cue also
posted: *"⏰ Predatory Patience …: the reeve-owl regains 1 Focus (GM adds …)"*.
· **Cruel Step executor** — Isolated target: owl moved (2800,3950) → (2800,4550) = 600 px = **exactly
10 ft** toward it. Non-Isolated target: **0 px moved** and an explicit refusal —
*"🚫 Cruel Step — Bench Target — Adjacent A is not Isolated (a living ally is adjacent): no move."*
The "no Reactions" clause is narrative (no opportunity-attack automation exists to observe).
· **Cues** — *"⏰ The Bailiff's Eye …: its respondent is the most wounded …"* fired at a hostile
mover's turn-start (mover −1 vs owner −2, gap 15 ft ≤ 60 ft), and the bloodied card
*"⏰ The Verdict Is Not Appetite …: Bloodied — a sound reeve-owl breaks off and rises."* on 26 → 12.)*
*(**Sovereign of Solitude use** — retired 2026-07-27v as STALE: **superseded by 2bAB-9**, the Reeve-Owl
row that drives the same ability on the current wiring — "Immobilized lands, Black vs Spiritual
auto-resolves, and a success rolls 1d6 vital — the cue's 'use the item to auto-resolve' promise is true
for the first time". Keep 2bAB-9.)*


## 2. Crownox Ring (White rival ×3 — the wall)
- [ ] 🤖 **Unbreakable Line ally-drops cue — NOW COVERS BOTH BLOCKS (2026-07-27v)** — a ring-mate would
      drop → whispered 3-Focus card; the White test resolves through the contest core on use.
      ⚠️ **This row is the ONLY Unbreakable Line coverage in the file.** The Ashkar §4 duplicate (The
      Reckoning, "when a pack-mate drops within 5 ft … test White DC ½ damage to hold at 1") was
      retired into this one — **the ability has never been benched on either block**, so do not read the
      merge as evidence. Drive it on the Crownox and, if the wording differs, on The Reckoning too.
      *(It was NOT among the seven restored 07-26j rules that printed real numbers at bench run 3.)*
      **2026-07-28e, bench run 19 — PARTIAL, row stays. Both blocks driven; two separate findings.**
      ✅ The cue itself FIRES on **both** blocks, wordings differ as the row anticipated —
      Crownox: *"⏰ Unbreakable Line (Bench Adv — Crownox Ring): … an adjacent ox may spend 3 Focus:
      test White vs. DC = …"*; Reckoning: *"⏰ Unbreakable Line (Bench Adv — The Reckoning): A pack-mate
      dropped within 5 ft: the lead may test White (DC = half the damage) via the contest core …
      (Bench Adv — Victim Tokened dropped, **within 5 ft**.)"*
      ❌ **(a) The 5-ft reach cannot reach an adjacent ally.** `edhaTokenGapFt` is **centre-to-centre**
      and `edhaAllyDropEligible` applies **no slack**. Measured, four positions:
      (i) Crownox Ring (**Large 2×2**), ally orthogonally adjacent → gap **7.5 ft** → ❌ no card;
      (ii) Crownox Ring, ally overlapping the ring's own square → gap 0 ft → ✅ fires;
      (iii) The Reckoning (Medium), ally orthogonally adjacent → gap 5.0 ft → ✅ fires;
      (iv) The Reckoning, ally **diagonally** adjacent → gap **7.07 ft** → ❌ no card.
      So a Large owner's 5-ft `ally-drops` can **never** reach a ring-mate standing beside it, and a
      Medium owner's misses every diagonal — while both cards' prose says "an adjacent ox" / "a
      pack-mate dropped within 5 ft". Note the engine's own `enemy-turn-start` sweep adds **`+ 2.5`
      half-square slack "for adjacency reads"** and `ally-drops` has none. Blast radius: the two 5-ft
      rules (Crownox Ring, The Reckoning); Roek's 20 ft is unaffected. **Whether the fix is slack or
      edge-to-edge measurement is a design call — see `EDHA_RULINGS.md`.**
      ❌ **(b) "the White test resolves through the contest core on use" is UNIMPLEMENTED on both
      blocks.** Behaviour-tested, not merely read: using the item on either block posted an **empty
      chat card** (`content: ""`) with the owner as speaker — no test, no contest core, no roll.
      Both blocks' `Unbreakable Line` carries **only** the `edha-apply-watch` → `edha-gm-cue` rule;
      there is no `use` rule at all.

*(**Retributive Guard** — RETIRED on evidence 2026-07-27v, bench run 3, on a **FRESH pack import** with
three unlinked ring tokens (this is **2bAB-3**): the retaliate **prompt posted by itself from the
damage**, one per adjacent ring-mate; the click ran **White vs Spiritual through the contest core** and
dealt "**3 spirit**" — of which 2 were absorbed by the attacker's Warlord Temp HP, a clean cross-talent
interaction that also proves the damage really landed.)*

*(**Ring behavior rows (the two wired clauses)** — RETIRED on evidence 2026-07-28e, bench run 19.
**Guardian Stance** carries an explicit **`NO NAMEABLE HOOK:`** declaration in its own description —
*"a static adjacency read with no trigger — the tree twin's aura rides the PC stance machinery, which
this trait does not enter; copying its rule would look live and never fire. While an ox stands adjacent
to a ring-mate, both have +1 Deflect (GM-run static …)"* — which is iron rule 3's MANUAL exit declared
ON the document, and matches the row's "(sheet note)" exactly; the listed Deflect reads **1** via
`system.deflect.value` (override 1, `useOverride` true — read `.value`, never `.derived`). **Bloodied
ring-TIGHTENS cue fired**: *"⏰ Stations Kept (Bench Adv — Crownox Ring): Bloodied — the ring tightens
around the calves; it does not scatter and does not pursue."* on 26 → 13 (line 13). Incidentally
re-confirmed **Retributive Guard** (2bAB-3) posting its retaliate prompt by itself from the damage.)*
- [ ] ⚑ **Crownox — where does a ring stop being a ring?** — an ox pulled 10+ ft "loses the wall
      kit", but nothing enforces or measures that and no hook exists for it. Say the rule you
      actually want at the table (a distance? a broken adjacency chain? GM eyeball?) and it can
      go in the card text. *(Split 2026-07-27w.)*

## 3. Rootling Swarm (Green minion ×3 — "the Snare")

*(**Grasping Vines** and **Territorial Instinct** — both retired 2026-07-27v as STALE: **superseded by
2bAB-6**, which drives the pair on the current wiring — "Vines: Green vs Physical auto-resolves →
Restrained on a success. Instinct: Green vs Survival through the contest core → Immobilized; the
turn-start cue still posts as the floor." Keep 2bAB-6.)*

*(**Bloodied scatter cue** — RETIRED on evidence 2026-07-28e, bench run 19:
*"⏰ The Heart's Runners (Bench Adv — Rootling Swarm): Bloodied — the rootlings scatter into the soil."*
⚠️ The first drive read as a dead hook and was **the harness, not the engine**: the swarm has
**Deflect 1**, so a 6-impact hit landed 5 and left it at 7/12 — one short of the line-6 crossing.
Re-driven at 9 raw (12 → 4) it fired. Compute the crossing **after** deflect.)*

## 4. Briar-Gone Grove (Green boss — "the Closing Arena")

*(**ALL FIVE Briar-Gone Grove rows RETIRED on evidence 2026-07-28e, bench run 19** — one import,
five rows, the block the run brief expected to cost the most.
· **The Briar Rises** — *"🌿 Green Leyline Attunement (Bench Adv — Briar-Gone Grove): **10 ft**
difficult-terrain square placed (**Thorn Field rides it**)."* A real Region was created carrying
`behaviors: [modifyMovementCost, edha-content.hazard]`, `flags.edha-content.hazard: true` and
`terrain.ownerUuid` → the grove's token actor.
· **Thorn Field** — BOTH halves. The engine-placed patch damaged automatically and repeatedly:
*"🔥 Bench Target — Isolated takes 3 keen from dangerous terrain (Thorn Field — …)"*, HP deltas
**3 / 1 / 1** across three sampled turn-starts (sampled deliberately — `floor(1d8/2)` can legitimately
roll 0). Formula captured live: **`floor(((1)d(2 * 3 + 2)) / 2)`** = half 1d8, showing the ruling-122
[Tier][Die] substitution (count = tier 1, die = 2×green rank 3 + 2 = 8). The hand-placed-maze cue also
posts as the floor: *"⏰ Thorn Field …: half 1d8 keen to any character entering or starting a turn in
HAND-PLACED briar (engine-placed patches apply it automatically)"*.
· **Sudden Growth burst** — *"💥 Sudden Growth — **10 ft burst (Attunement Range 60 ft)**. Burst placed
— click Detonate …"* → Detonate → *"💥 Sudden Growth :(dangerous terrain placed)"*, hazard Region created.
· **Spreading Roots cue** — *"⏰ Spreading Roots …: If this character starts its turn in the briar:
Spreading Roots (1 Focus) — the briar spreads 10 ft …"* fired on each hostile turn-start.
· **Register cues** — **both** cues of the SAME item posted from ONE 60 → 0 write:
*"⏰ The Madness Slackens …: Bloodied — it stops targeting downed characters."* and
*"⏰ The Madness Slackens …: 0 HP — it goes still instead of dying; the blight stands."*, leaving
`trigRound` holding **two distinct keys** (`…hp-below:0:0:1` and `…hp-below:0_5:0:1`). That is a live
re-confirmation of the 07-27y `edhaCueKey` fix on one of the only two items in the data that can show
it — before that fix the lower threshold was permanently eaten by the bloodied cue.
⚠️ **Surfaced for a ruling, not a bug:** the grove still receives the generic **`Dead`** status at 0 HP
while its own cue says it "goes still instead of dying". See `EDHA_RULINGS.md`.)*

## 5. Tollbird Flock (Black minion swarm)

*(**Sapping Hex on-hit** — RETIRED on evidence 2026-07-28e, bench run 19: the flock (staged at
disposition −2 so it does not void the victim's isolation) hit an asserted-Isolated character and the
engine applied the status — *"Sapping Hex — Bench Target — Isolated is Weakened."* plus the `Weakened`
effect on the actor.)*
- [ ] ⚑ **Swarm bookkeeping** — half damage from single-target Strikes, scatters on AoE
      (GM-run; NO NAMEABLE HOOK per the Wake-Eel precedent) — sanity-read at the table.
*(**Bloodied re-settle cue** — RETIRED on evidence 2026-07-28e, bench run 19:
*"⏰ It Re-Gathers on the Rooflines (Bench Adv — Tollbird Flock): Bloodied — the flock breaks and
re-settles on the rooflines, out of reach."* on 14 → 7.)*

## 6. Surecat (Blue rival — the foresight duel; Ben's logged Blue exception)

*(**Forewarned turn-end cue** — retired 2026-07-27v as STALE: it **overlaps 2bAB-10**, which drives
Intercept "with the Forewarned creature targeted" and explicitly re-asserts "the turn-end cue still
posts". Keep 2bAB-10; this row asked the same thing from the other end.)*

*(**Redirect Momentum use** — RETIRED on evidence 2026-07-27v, bench run 14, on a **FRESH pack
import** (this is **2bF-17**): "Redirect Momentum: **18 vs Bench Target — Undefended's ATH 7 —
SUCCESS**" — it rolled Blue, rolled the TARGET's Athletics, and printed the same `Blue N vs ATH M`
shape as the PC talent 2bF-3, plus its documented "no payload rule — resolve at the table" half.
The "(name-keyed engine path)" label was false and is struck.)*

*(**Pounce rider cue** and **Bloodied leave cue** — BOTH RETIRED on evidence 2026-07-28e, bench run 19.
Pounce: whispered to both GMs (`whisper: 2`) on the hit — *"⏰ The Pounce Already Taken (Bench Adv —
Surecat): If the target took the Forewarned-declared action this round: add +1d4 keen — it was already
there when they arrived."* Bloodied: *"⏰ Gone Unsure (Bench Adv — Surecat): Bloodied — it leaves. A
predator of certainties does not gamble."* on 26 → 13.)*

## 7. Brandram (Red rival — the charge)
*(**Momentum's Edge rider** — RETIRED on evidence 2026-07-28e, bench run 19, with a matched control.
A bench combat was stepped **forward** onto Brandram's turn (which is what stamps `_edhaTurnStartPos`
— the hook is `combatTurnChange` on ANY combat, so this is drivable despite Ben's campaign combat
being the active one), Brandram was then displaced **exactly 1200 px = 20 ft** toward the target, and
the Ram damage formula came out **`1d10 + 3 + (2d4)[Momentum's Edge] + 0`** — the ruling-113 +2d4,
labelled. Control: re-stamped at rest, 0 px moved → **`1d10 + 3 + 0`**, no rider. First ADVERSARY
consumer of `whenMovedTowardFt`, working.)*

- [ ] 🤖 **Shockwave Slam push** — melee hit pushes up to 10 ft; collision deals half 1d4
      impact (the real edha-push rule).
      **2026-07-28e, bench run 19 — FAIL on the distance, row stays. Two corrections to the row
      itself, and the cause is shared with the Reckless Advance row below.**
      ✅ The push FIRES: *"💥 Shockwave Slam — Bench Adv — Victim Tokened is pushed **5 ft**."*,
      measured 300 px = 5 ft.
      ❌ **The card promises 10 ft and the engine delivers 5.** Card text (read live off the deployed
      item): *"the target is pushed up to **10 ft**; collision with an obstacle deals half 1d6 impact
      (half [Tier][Die]: count = tier 1, die = rival rank 2, ruling 122)"*. The rule is
      `{bySize: true, distanceFt: 5, collisionFormula: "floor(1d6 / 2)"}` — and **`bySize: true` makes
      `distanceFt` dead**: `edha-push` resolves `EDHA_SIZE_FT[edhaColorRank(owner, "red")]`, and
      Brandram's **red rank is 2** → `EDHA_SIZE_FT[2]` = **5 ft**. The card was written against
      rank-3 numbers; ruling 122 gives adversaries the **role** rank, which for a rival is 2.
      📝 **The row's own "half 1d4" is WRONG and is corrected here** — card AND rule both say
      **`floor(1d6 / 2)`**, they agree; only the row was stale.
      ⚠️ The collision die could **not** be observed and that is geometry, not a defect: with a
      one-square (5 ft) push, travel-then-collide is impossible — the next square is either free
      (full 5 ft, no collision) or occupied (**"pushed 0 ft (stopped by Bench Target — Floater)"**,
      and the engine correctly rolls no die on a push that never travelled). Same all-or-nothing
      construction run 17 mis-filed as a bug.
- [ ] 🤖 **Reckless Advance / Unstoppable executors** — use → 10-ft no-Reaction charge;
      Fast-turn damage → free half-Speed move (once/turn).
      **2026-07-28e, bench run 19 — PARTIAL + BLOCKED, row stays 🤖.**
      ✅❌ **Reckless Advance runs, at the same wrong distance as Shockwave Slam above — ONE root
      cause, two rows.** Driven from 32.5 ft away (so there was ample room and it was not clipped):
      *"💨 Reckless Advance — Bench Adv — Brandram moves **5 ft** toward Bench Adv — Victim Tokened,
      ignoring Reactions."*, measured 300 px. Its card says *"charge **10 ft** toward it"*; its rule
      is `{bySize: true, distanceFt: 0}` → `EDHA_SIZE_FT[red rank 2]` = 5 ft.
      🔒 **Unstoppable is BLOCKED — blocker named, row stays 🤖 (a technical blocker never becomes ⚑).**
      Its rule is `whenFastTurn: true`, and `edhaIsFastTurn` → `edhaCombatantOf` reads **`game.combat`**
      — the ACTIVE combat. Confirmed empirically this run: `game.combat.id === "BerbNeuXp4iKduef"`
      (Ben's campaign combat) and Brandram is **not** one of its combatants, so no `turnSpeed` flag on
      a bench combat can ever make it fast. Unchanged from run 16's finding.
      ⚠️ **A third consumer of the same rank-scaling gap, for whoever fixes it:** the Tussock-Sow
      (green rank 2) placed a **5 ft** difficult-terrain square where its card says "~10-ft square",
      while the Briar-Gone Grove (green rank **3**) placed **10 ft** from the same code path. The
      pattern is consistent: `[Size]`-scaled adversary card text was written with rank-3 figures, and
      every rank-2 rival lands one step down the `EDHA_SIZE_FT` table. Decide once, fix the family.

*(**Bloodied withdraw cue** — RETIRED on evidence 2026-07-28e, bench run 19:
*"⏰ Deny It the Run-Up (Bench Adv — Brandram): Bloodied — it withdraws uphill; it has proved what it
came to prove."* on 32 → 14 (20 impact − Deflect 2 = 18 dealt, crossing line 16).)*

## 8. Tussock-Sow (Green rival — "the Closing Arena", mobile)
*(**The Wrighting** and **Sudden Growth burst / Spreading Roots cue** — BOTH RETIRED on evidence
2026-07-28e, bench run 19.
· **The Wrighting** — *"Bench Adv — Tussock-Sow Draws Mana — recover 1 Investiture."* then the embedded
Green Key fired: *"🌿 Green Leyline Attunement (Bench Adv — Tussock-Sow): 5 ft difficult-terrain square
placed."*, creating a real Region with `modifyMovementCost` and `flags.edha-content.terrain`
{`color: "green"`, `ownerUuid` → the sow's token actor}.
· **Sudden Growth burst** — *"💥 Sudden Growth — 5 ft burst (Attunement Range 30 ft). Burst placed —
click Detonate …"* → Detonate → *"💥 Sudden Growth :(dangerous terrain placed)"*.
· **Spreading Roots cue** — *"⏰ Spreading Roots (Bench Adv — Tussock-Sow): If this character starts its
turn in the mire: Spreading Roots (1 Focus) — the mire churns 10 ft toward them …"* at a hostile
turn-start.
⚠️ The **5 ft** figures here (green rank 2) against the card's "~10-ft square" are the same rank-scaling
gap logged on the §7 Reckless Advance row — the Grove at green rank 3 placed 10 ft from the same path.
Not re-filed separately; fix the family.)*

*(**Drive the Prey use** — retired 2026-07-27v as STALE: **superseded by 2bAB-7**, which drives it on
the Tussock-Sow against the current wiring — "Green vs Survival through the contest core; Slowed on a
success; the move-away stays GM-narrated per the card note". The "(name-keyed engine path)" label was
false. Keep 2bAB-7.)*

*(**Bloodied stand-ground cue** — RETIRED on evidence 2026-07-28e, bench run 19:
*"⏰ It Is Construction, Not War (Bench Adv — Tussock-Sow): Bloodied — she plants herself at the wallow;
the fight ends where her ground begins. (Blight-gray variant does not break off.)"* on 34 → 15
(20 impact − Deflect 1 = 19 dealt, crossing line 17).)*


# Vorsk Ranges Bestiary (rulings 121–122 — statted 2026-07-20; the Vorsk dive Phase-4c gate)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v.** The ruling-122 engine
work (`edhaColorRank` role-rank fallback + Shield Wall wallDie + Pack Pressure rank routing) is live and
hash-verified; the adversaries pack was rebuilt **07-27u**; the **world-wide sync ran at bench run 11 —
46 synced, 0 skipped, zero effect drift**. Folder: *Vorsk Ranges Bestiary* (4 blocks). The ruling-122
re-dice also touched SIX older blocks (False Spring, Dirgehound, Reeve-Owl, Brandram, Crownox,
Briar-Gone Grove) — their W28/W29 rows above are updated in place and re-test at the new numbers.

## 0. Engine — the role-rank fallback (ruling 122)

*(**Shield Wall reduction at rival d6** — RETIRED on evidence 2026-07-27v, together with the W29 §0 row
it re-runs. Table half (bench run 3, fresh import): the pre-reduction applied by itself and chat named
it — "reduced by **1**", calc "5 - 1". ⚠️ **That observation alone does NOT separate d6 from d4** — a 1
rolls on both. The **pack + rank read** is what settles it: the Crownox is a **rival**, ruling 122 makes
adversary dice the ROLE rank, and role rank 2 evaluates `2*2+2 = 6` → **d6**, never d4. Both halves
together, neither alone.)*

## 1. Cragdrake Whelp Pack (minion ×4)

*(**Reckless Advance use** — RETIRED on evidence 2026-07-27x, bench run 16: the token actually moved
(5400,9000 → 5400,9150) and the card read "💨 Reckless Advance — … moves 3 ft toward Bench Target —
Isolated, **ignoring Reactions**".)*

## 2. Cragdrake Adult (rival ×2, wolf-sized)

*(**Searing Bolt** · **Predatory Patience rider + cue** · **Explosive Leap use** — all three RETIRED
on evidence 2026-07-27x, bench run 16. Predatory Patience carries a real negative control: the same
target rolled `1d20 + 0 + 6` while NOT Weakened, and `1d20 + 0 + 7 + 1d6[Predatory Patience]` once
Weakened. See that run's handoff delta.)*

> ⚠️ **New defect found in passing (2026-07-27x, bench run 16) — Explosive Leap moves the wrong
> distance.** The row's own two clauses both pass, so it is retired, but the ability's card says
> "**Leap up to 20 ft** without provoking Reactions" while its rule is `edha-move {bySize: true}`,
> which on a **medium** creature allowed and moved exactly **5 ft** (3300,9000 → 3300,9300). The
> engine and the card disagree by 15 ft; `distanceFt: 20` is the dial that matches the prose. Feeds
> test-pass-fixes. *(Reckless Advance's prose states no distance, so it is not the same drift —
> though a "charge" that moves 3 ft is a design question, logged to `EDHA_RULINGS.md`.)*

## 3. Cragdrake Alpha (boss, tier 2)

*(**Dread Presence veto** — RETIRED on evidence 2026-07-27v, bench run 14 (**2bZ-10**), attributed
individually with a clean negative: only 3 owners existed on the scene and Bench — Black sat at 90 ft,
outside its 60, so there was no confound. **Cragdrake Alpha isolated at 12 ft** (the Elder parked 115 ft
away) → the move was **blocked**, toast "Dread Presence: Bench Target — Undefended is Weakened and cannot
willingly move closer to Bench Adv — Surecat." **CONTROL — both owners parked >100 ft** → the identical
move **succeeded** (x 9300→9600) with **no toast**, so the range gate is real and it vetoes off its own
rule. The card-text half is confirmed too: the shipped block reads "**within 60 ft** (Attunement Range at
boss rank 3 — parity fix, Kettavar 4c audit)".)*

*(**Flame Surge (the breath)** — RETIRED on evidence 2026-07-27v, bench run 11, on a **freshly imported**
boss after the adversaries rebuild: "= **13 (2d8)** + 3 (red) → **16 energy**", **halved to 8** on both
saves, with HP deltas matching exactly. For contrast, the pre-rebuild reading was "= 0 (0) + 3 (red) → 3"
— the ability had `events` but no `damage` block, which is the defect this retirement closes.)*

- [ ] 🤖 **Predator's Due on-defeat** — reducing a character to 0: +2d8 health
      engine-applied + whispered Focus card.
      *(2026-07-27x bench run 16 — **PARTIAL: the heal is right, the card is PUBLIC not whispered.**
      ✅ Engine-applied heal confirmed: Alpha 30 → **38** on reducing a character to 0, card
      "⚡ Predator's Due (Bench Adv — Cragdrake Alpha) — … regains **8** health … **2d8 4 4 8**",
      with the ruling-122 note ("count = tier 2, die = boss rank 3"). ⛔ The message posted with an
      EMPTY whisper list (`whisper: []` → public), so a boss's kill-heal and its "1 Focus on the
      kill (focus is a GM add)" instruction are visible to every connected client. Likely
      `edhaWhisperIds()` returning empty for an ownerless adversary; worth checking whether other
      adversary `edha-triggered-effect` cards leak the same way. ⚠️ **Harness note for the re-test:**
      `edhaResolveKiller` resolves the killer from `canvas.tokens.controlled` — NOT from the damage
      dealer — so the Alpha's token must be CONTROLLED when the victim drops or the row reads as a
      dead talent (it did, once, before staging was corrected).)*
- [ ] 🤖 **Unstoppable** — damage on a Fast turn → half-Speed engine move, once per turn.
      *(2026-07-27x bench run 16 — **BLOCKED at the table, but a blocking DEFECT is already proven
      by measurement.** ⛔ Blocker: `edhaIsFastTurn` → `edhaCombatantOf` reads **`game.combat`**, the
      ACTIVE combat. A bench combat cannot be made active without deactivating **Ben's live campaign
      combat** (`BerbNeuXp4iKduef`, round 1), which the bench safety rules forbid. Measured: the
      Alpha sat in the bench combat with `turnSpeed: "fast"`, yet the `edhaIsFastTurn` expression
      evaluated against live state returned **false**, so `whenFastTurn` returned before any move —
      no card, token unmoved. Row stays 🤖 (technical blocker, not a judgment call). ⛔ **Defect
      that would fail this row anyway, provable without a Fast turn:** `edhaSpeedFt` does
      `Number(getProperty(actor, "system.movement.walk.rate"))`, but `walk.rate` is an OBJECT
      `{bonus, derived: 20, override: 40, useOverride: true}` → `NaN || 0` → **0**. So
      `edhaMoveAllowanceFt {byHalfSpeed}` returns `floor(0/2)` = **0 ft** — Unstoppable can only ever
      move zero. Effective speed should read **40**. Pack-wide blast radius **3**: Cragdrake Alpha,
      The Slagbull and Brandram, all on an item named "Unstoppable". Same object-as-scalar family as
      the ambush-belief Perception mod (Lunavar §Stillback); an engine sweep found these two sites
      and no others.)* ⚠️ **That last sentence was wrong** — an independent sweep on 07-27y found a
      **third** site (the Phantom Double belief loop), and lint-refs pass 17 now gates the family.
      *(2026-07-28 bench run 17 — **the `edhaSpeedFt` half is FIXED and PROVEN; the Fast-turn blocker
      is UNCHANGED, so this row stays 🤖.** With the bench copy's own `whenFastTurn` temporarily set
      false (a declared fixture edit on an imported `Bench Adv —` actor, isolating the two failures
      the way this row's sibling asked for), the Slagbull's Unstoppable posted "💨 **Unstoppable** —
      … moves **20 ft** toward …, ignoring Reactions" and the token really moved **1200 px = 20 ft**
      at 60 px/ft. `walk.rate` reads `{derived: 20, override: 40, useOverride: true}` → Speed **40**,
      half **20**. Negative control: the same rule at `{byHalfSpeed: false, distanceFt: 10}` moved
      exactly **600 px = 10 ft**. The `oncePerTurn` guard also held — a second trigger in the same
      turn-seq produced no move until the flag was cleared. ⚠️ The row's console instruction cannot
      be followed as written: **`edhaSpeedFt` / `edhaMoveAllowanceFt` are module-scoped and are NOT
      on `globalThis.edha`** (run 15's `edhaWatchersOfRule` lesson again) — drive the behaviour
      instead.)*

*(**Bloodied cue** — RETIRED on evidence 2026-07-27x, bench run 16: crossing half (56 → 23) posted
"⏰ Culls, Never Duels (Bench Adv — Cragdrake Alpha): Bloodied — the pack disengages and circles for
the high ground; **drakes cull, they don't duel**", whispered to the GMs.)*

## 4. Bellwether (encounter piece)

*(**Guiding Signal / Ordered Advance** — retired 2026-07-27v as STALE, on two counts. **Guiding Signal
is superseded by 2bAB-4**, which drives it on The Reckoning, **Bellwether** and Callthief; **Ordered
Advance** is covered by the W23 pipeline's own "⚑⚑ Ordered Advance movement card (14n)" row. And the
row's premise — "**no dice automation expected** (support piece by design)" — **is now false**: Guiding
Signal carries an `edha-designate` rule on its own item, so a use is supposed to resolve something.
The placeholder-icon half is tracked in `EDHA_ADVERSARY_ART_WISHLIST.md` (Bellwether has an entry), so
nothing is lost.)*

# Ashkar Mesas Bestiary (rulings 137–138 — statted 2026-07-22; the Ashkar dive Phase-4c gate)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v** (adversaries rebuilt
07-27u; world-wide sync 46/0 at bench run 11, zero effect drift). Folder: *Ashkar Mesas Bestiary*
(5 blocks). The gate also **parity-fixed the shipped False Spring** (Kindle `lightRadiusFt: 5` — the
light/concealment clause was inert); its Canticle-plains row above re-tests the light strip. All dice by
ruling 122 (leyline rank = role rank).

## 1. Hazewyrm Whelp Pack (minion ×3, Red/Blue)

*(**Scalding Bite + Kindle** — RETIRED on evidence 2026-07-28, bench run 17, on a FRESH pack import,
**both halves**. The +1 energy rider rolled `1d4 + 1 + (1)[Kindle] + 0 = 3`, flavor-labeled. The
newly-live `lightRadiusFt: 5` half fired too: the **victim's** token light went `{dim: 0, bright: 0}`
→ **`{dim: 5, bright: 2.5}`**. ⚠️ Harness note for anyone re-driving it — the light lands on the
CREATURE THAT TOOK THE DAMAGE and only at `applyDamage` time, not on the attacker and not at roll
time; checking the attacker's token reads a false negative.)*

## 2. Hazewyrm Adult (rival, Red/Blue)

*(**The Held Haze ambush-belief** · **Bite fooled-rider** · **Searing Bolt** · **Afterburn** —
RETIRED on evidence 2026-07-28, bench run 17. Belief: "🌫️ The Held Haze — …: Perception **1** vs
**11** → taken in", speaker **Bench Adv — Hazewyrm Adult**, ledger written under one dot-free key —
the DC is the Adult's own cog 11. Rider: `1d8 + 2 + (1d6)[Bite] + 0` vs the fooled target,
`1d8 + 2 + 0` vs one that saw through it. Searing Bolt reads "Attack **+6**; Range **60 ft.**;
… **1d6 Energy**" with `activation: skill_test / lwp / modifierFormula "6"`, and rolled `1d6` on a
drive. Afterburn posted its Opportunity prompt off the energy damage — "spend an Opportunity to leave
the target Afflicted **[half 1d6 energy]** ongoing — heatstroke. Opportunity trusted" — and the rule
reads `floor(1d6 / 2)`, `costResource: opportunity`, `costOptional: true`. ⚠️ **Attribute belief cards
by `speaker`** — the Adult's and the Elder's Held Haze both fire in a shared window and are otherwise
indistinguishable in a chat tail.)*

## 3. Hazewyrm Elder (boss, tier 2, Red/Blue)
*(**Flame Surge (the breath)** — RETIRED on evidence 2026-07-27v, bench run 11, on a **freshly imported**
Hazewyrm Elder after the adversaries rebuild: "= **4 (2d8)** + 3 (red) + **3 (Kindle)** → **10 energy**",
**halved to 5**, HP deltas matching exactly. Note the Kindle rider rode the same total, which is the
label half of the Kindle row.)*

*(**The Held Haze + Rend fooled-rider** · **Searing Bolt + Kindle** · **Afterburn** — RETIRED on
evidence 2026-07-28, bench run 17. Belief vs the Elder's cog **13**: "Perception 15 vs 13 → sees
through it" and "Perception 5 vs 13 → taken in", speaker **Bench Adv — Hazewyrm Elder**. Rend:
`1d10 + 4 + (1d8)[Rend] + 0` vs the fooled target, `1d10 + 4 + 0` vs the one that saw through —
**+1d8**, correct for boss rank 3. Searing Bolt + Kindle: `2d8 + (3)[Kindle] + 0 = 7` on an
attack of `1d20 + 0 + 8 = 28` (matching the block's "Attack +8"), and the light/concealment strip is
the same measured `{dim: 5, bright: 2.5}` write as the Whelp's. Afterburn: "… Afflicted **[half 2d8
energy]** ongoing", rule `floor(2d8 / 2)`. ⚠️ Searing Bolt costs **1 Focus** — a Focus-empty adversary
rolls nothing and reads exactly like a dead ability; top the resource up before calling FAIL.)*


## 4. The Reckoning (rival White pack ×3)

*(**Guiding Signal / Ordered Advance** — retired 2026-07-27v as STALE, same as the Bellwether copy:
Guiding Signal is **superseded by 2bAB-4** (which names The Reckoning explicitly), Ordered Advance is
covered by the W23 pipeline row, and the "**no dice automation expected**" premise **is false** —
Guiding Signal carries `edha-designate` on its own item.)*

*(**Unbreakable Line ally-drops cue** — retired 2026-07-27v as a **duplicate** of the **W29 §2 Crownox
Ring** row, which is kept as the single Unbreakable Line row and annotated to cover this block's wording
("test White DC ½ damage to hold at 1"). ⚠️ **The ability is still UNBENCHED on both blocks** — the
merge removed a duplicate, not a doubt.)*

*(**Pack Doctrine** — RETIRED on evidence 2026-07-27v: the shipped block carries **`rules = 0`,
`effects = 0`** on it, with its own `NO NAMEABLE HOOK` rationale ("which prey the pack cuts from the
line is NPC intent and targeting, not module data"). Nothing exists that could automate it.)*

## 5. The Slagbull (rival Red bruiser)
*(**Shockwave Slam** — ✅ **RETIRED on evidence 2026-07-28c, bench run 18.** Both halves the row asks
for are proven in the re-test row below: the push moves **5 ft** on a clear lane (300 px measured), and
the **wall collision really rolls half 1d6 impact** (4 samples: 1, 2, 1, 3). The run-17 FAIL kept below
for its root-cause history — it was NEGATIVE 1, not a broken push.)*

*(2026-07-28 bench run 17 — **FAIL: the push fires and moves the victim ZERO feet.** On a
      fresh import, an impact hit from the Slagbull posted "💥 Shockwave Slam — push [Size] ft on a
      melee impact hit; wall collision half 1d6 … — Bench Target — Undefended **is pushed 0 ft**",
      and the victim's token did not move (`_source` 2700,9900 → 2700,9900). So the trigger, the
      damage-type gate and the victim resolution are all correct — only the displacement is lost.
      **Ruled out, measured not assumed:** the push lane was clear of walls
      (`polygonBackends.move.testCollision` false for both a 10-ft and a 20-ft ray from the victim's
      centre) and no token occupied the destination square. **`maxFt` is not zero either** — the same
      `bySize: true` dial on the same actor drove Reckless Advance a correct **5 ft** minutes later
      (Slagbull red rank **2**, `EDHA_SIZE_FT[2] = 5`), so the size lookup resolves. The loss is
      inside `edhaRunPush`'s `edhaApplyMove(vtok, aim, maxFt, {gapPx: 0, hostile: true})` — the one
      call shape that differs from the working `edha-move` path. The **wall-collision half 1d6** is
      untested and unreachable until the push moves at all.)*
      *(2026-07-28b fix pass B — **NOT A REGRESSION; the push code is byte-identical to run 12's.**
      Diffed `038ebf9..2bc33ef`: `edhaRunPush`, `edhaApplyMove`, `edhaComputeMove`, `edhaTokenAtDest`,
      `edhaPxPerFt`, `edhaColorRank`, `edhaCasterToken` all unchanged. What differed is the NUMBER —
      run 12 pushed **10 ft = two** grid squares, this row pushes **5 ft = exactly one**, and
      `edhaTokenAtDest` is a bounding-box overlap, so a one-square push has no intermediate stop: it
      travels the full square or returns to the origin. **0 ft can therefore be CORRECT** (a body in
      the way, nowhere to go); the defect was that the card never said which. ⚠️ **Note for the
      re-drive: "the destination square was unoccupied" is not the check the engine makes** — the
      overlap box uses the mover's own width, so a Large attacker or an off-grid neighbour counts
      where a bare square check would not.)*
*(**Shockwave Slam — the push now says WHY it stopped** — ✅ **RETIRED on evidence 2026-07-28c, bench
run 18: all four branches driven on one fresh import, and they settle run 17's report as
NOT-A-DEFECT.** Grid 300 px / 5 ft = **60 px/ft**; the Slagbull is a **2×2** token, so its centre is
(x+300, y+300) — the victim was parked due east of that centre so the push direction was pure +x.
**POSITIVE (clear lane):** "💥 Shockwave Slam … — Bench Target — Undefended **is pushed 5 ft**." —
`_source` moved **exactly 300 px**, one full square, and the card carried **no parenthetical**.
**NEGATIVE 1 (a body):** with a token on the destination square — "… **is pushed 0 ft (stopped by Bench
Target — Adjacent A)**", 0 px moved, and the victim's HP fell by **exactly 4** (6 impact − 2 Deflect),
i.e. **no collision damage** was dealt. A push that never travelled did not slam.
**NEGATIVE 2 (a wall):** a bench wall 180 px into the lane, **4 samples**: every one read "… **is pushed
3 ft (stopped by a wall)** and slams into an obstacle for N impact", partial distance 180 px, collision
rolls **1, 2, 1, 3** — all inside `floor(1d6 / 2)`'s 0–3 range. The wall was deleted afterwards
(scene back to its original 117).
**NEGATIVE 3 (no direction):** victim stacked on the Slagbull's centre — "💥 Shockwave Slam … — Bench
Target — Undefended **is in the same space as Bench Adv — The Slagbull, so "directly away" has no
direction: nothing moves.** *(Separate the tokens and re-apply.)*" It refuses out loud; no silent 0.
**So run 17 hit NEGATIVE 1** — the overlap box uses the mover's own width, and 0 ft was the correct
answer all along; only the card was mute. **Blast radius confirmed: 6 `edha-push` rules across the
data, and all three that push exactly one square are now proven to move** — this row, Unnerving
Approach (Dirgehound Pack, W28 §3, a real −300 px), and Shattering Blow (already retired at bench
run 12 with its own 0-ft/5-ft matched pair, which is the same geometry).)*
- [ ] 🤖 **Unstoppable** — damage on a Fast turn → half-Speed engine move, once per turn.
      *(2026-07-28 bench run 17 — **BLOCKED, blocker unchanged, row stays 🤖.** `edhaIsFastTurn`
      reads `game.combat` (the ACTIVE combat), and making a bench combat active would deactivate
      Ben's live campaign combat — forbidden. The **half-Speed half is separately PROVEN** on this
      very actor: see the Cragdrake §3 half-Speed note — 20 ft card and 1200 px of real movement.)*

*(**Reckless Advance use** — RETIRED on evidence 2026-07-28, bench run 17: targeting the Hazewyrm
Elder 55 ft down a wall-free lane and using it posted "💨 **Reckless Advance** — Bench Adv — The
Slagbull moves **5 ft** toward Bench Adv — Hazewyrm Elder, **ignoring Reactions**" and the token
really moved 300 px = 5 ft. The 5 is arithmetically right, not a fallback: `bySize` reads
`EDHA_SIZE_FT[edhaColorRank(owner,"red")]` and the Slagbull's red rank is **2** → `EDHA_SIZE_FT[2]`
= **5 ft**.)*
- [ ] ⚑ **ART BACKLOG, not a test** — placeholder icons on all five Ashkar blocks. Tracked in `EDHA_ADVERSARY_ART_WISHLIST.md`; there is nothing here to bench, and no bench run can retire it. It stays listed only so the art debt stays visible. *(Re-labelled 2026-07-27w.)*

# Kettavar Tundra Bestiary (rulings 147–148 — statted 2026-07-22; the Kettavar dive Phase-4c gate)

✅ **NO DEPLOY IS OWED — the "Deploy needed first" block is struck 2026-07-27v** (adversaries rebuilt
07-27u; world-wide sync 46/0 at bench run 11, zero effect drift). Folder: *Kettavar Tundra Bestiary*
(4 blocks). The gate also **parity-fixed shipped card text** (Cragdrake Alpha Dread Presence 30→60 ft
— now confirmed in the shipped block; Dirgehound/Reeve-Owl/Cragdrake Predatory Patience wording sweep,
no behavior change, no re-test). All dice by ruling 122 (leyline rank = role rank).

## 1. The Doubled (rival, Black/Blue, solitary)
*(**The Doubling ambush-belief** — RETIRED on evidence 2026-07-28c, bench run 18: "🌫️ **The Doubling** —
Bench Target — Isolated: **Perception 6 vs 13 → taken in** (whenTargetFooled riders apply)". Formula
captured read-only: **`1d20 + 3`**, no advantage; DC is The Doubled's own **cog 13**.)*

*(**Raking Grasp fooled-rider** — RETIRED on evidence 2026-07-28c, bench run 18, both halves present:
vs a target already in the Doubling ledger the damage read `1d8 + 2 + **(1d6)[Raking Grasp]** + 0`;
against a target **not yet** in the ledger at damage-build time it read `1d8 + 2 + 0`. Not orphaned —
the rider genuinely reads the ledger the sibling rule writes.)*

*(**Predatory Patience** — RETIRED on evidence 2026-07-28c, bench run 18: control `1d20 + 0 + 6`,
Weakened `1d20 + 0 + 6 + **1d6[Predatory Patience]**`, plus the on-hit card "⏰ Predatory Patience
(Bench Adv — The Doubled): If the target is Weakened: it regains 1 Focus (GM adds …). *(hit …)*")*

*(**Walk Out of the White** — RETIRED on evidence 2026-07-28c, bench run 18: damaging it posted
"⏰ **Walk Out of the White** (Bench Adv — The Doubled): Reaction, 1 Focus — it moves 10 ft unseen into
the white.")*

## 2. The Doubled Elder (boss, tier 2 in the tier-1 hp band, Black/Blue)
*(**The Seeming (full loop, name verbatim)** — RETIRED on evidence 2026-07-28c, bench run 18, every
stage observed: the use created a copy token **beside** the elder (2400,2700 vs its 2100,2700) with
**hp 1** (`max.override = 1`), defenses 0/0/0, flagged `phantomDouble / phantomOf / phantomDC 14 /
phantomSkill prc / phantomSource "The Seeming"`; the per-enemy sweep rolled a real `1d20 + mod` for
each and printed the two-column card — "**8 onlooker(s) tested — 4 taken in, 4 see through it**" —
naming the client veil explicitly ("their client shows only the copy" / "only the original") with a
**Re-test new viewers** button; and striking the copy posted "🌫️ The Seeming: the illusion … is struck
and dissipates" + "the illusion breaks — the real one stands plainly seen", removing the token. Cards
name **The Seeming**, not "Phantom Double".)*

*(**Raking Grasp fooled-rider (+1d8, EITHER ledger)** — RETIRED on evidence 2026-07-28c, bench run 18,
**proven separately in each direction** rather than assumed from one: (a) **Doubling ledger only** —
Bench — Black, already marked fooled, took `1d10 + 4 + **(1d8)[Raking Grasp]** + 0`; (b) **Seeming
ledger only** — Bench — Knowledge, fooled by a **live** copy's sweep and *not* in the Doubling ledger at
damage-build time, also took `1d10 + 4 + **(1d8)[Raking Grasp]** + 0`; (c) **neither** — Bench — Blue
took `1d10 + 4 + 0`. ⚠️ Worth knowing: the phantom half is read off the **live copy**
(`edhaPhantomCopiesOf(caster)[0]`), so once the copy is broken that ledger is correctly gone — test the
Seeming half **before** breaking it.)*
*(**Dread Presence veto** — RETIRED on evidence 2026-07-27v, bench run 14 (**2bZ-10**), driven as its
own isolated case rather than assumed from the Alpha's: **the Doubled Elder isolated at 25 ft** with the
Cragdrake Alpha parked 105 ft away → the move was **blocked** with the same toast. **CONTROL — both
owners parked >100 ft** → the identical move **succeeded** (x 9300→9600) with **no toast**. Each copy
vetoes off its own rule, and the range gate is real. Card text reads 60 ft, authored right.)*

*(**Predatory Patience** — RETIRED on evidence 2026-07-28c, bench run 18: control `1d20 + 0 + 8`,
Weakened `1d20 + 0 + 8 + **1d8[Predatory Patience]**` — the **boss rank-3 die**, correctly one step up
from The Doubled's 1d6 and the Cullwolf's 1d4 — plus the on-hit Focus cue.)*

*(**Walk Out of the White (BOTH triggers)** — RETIRED on evidence 2026-07-28c, bench run 18, each fired
from its own rule: **seeming-break** → "⏰ Walk Out of the White …: **its seeming broke**; it may move
10 ft unseen, then raise The Seeming again once unseen"; **damaged** → "⏰ Walk Out of the White …: it
moves 10 ft unseen; once unseen it may raise The Seeming again (a fresh belief sweep — the Doubling's
once-per-scene ledger does NOT reset)." Two distinct notes, so the two rules are separately live.)*

*(**Never a Corpse bloodied cue** — RETIRED on evidence 2026-07-28c, bench run 18: crossing half of 50
posted "⏰ **Never a Corpse** (Bench Adv — The Doubled Elder): Bloodied — it abandons the fight and the
shape; it does not return this scene.")*

## 3. Cullwolf Pack (minion ×4, Black)
*(**Severance vital-convert** — RETIRED on evidence 2026-07-28c, bench run 18, **the headline test,
settled numerically rather than by card text**. Against a **Deflect 2** victim with a fixed 6 keen
applied by the wolf: **Isolated** → "🗡️ **Severance**: … is Isolated — **keen damage becomes vital**"
and the victim lost **6** — the Deflect was genuinely bypassed; **not Isolated** (a living same-side
ally moved adjacent) → **no Severance card** and the victim lost **4** (6 − 2 Deflect), i.e. it stayed
keen. ⚠️ Staging note: `edhaIsIsolated` counts **same-disposition living adjacents**, so the biting
wolf must be on the **opposite** disposition to the victim or the victim can never read as Isolated.)*

*(**Predatory Patience** — RETIRED on evidence 2026-07-28c, bench run 18: control `1d20 + 0 + 5`,
Weakened `1d20 + 0 + 5 + **1d4[Predatory Patience]**` — the **minion rank-1 die**, exactly as the row
specifies — plus the on-hit Focus cue.)*
*(**The Tithe Takes the Failing** — RETIRED on evidence 2026-07-27v: the shipped block carries
**`rules = 0`, `effects = 0`** on it, with its own `NO NAMEABLE HOOK` rationale. Nothing exists that
could automate it, which is exactly what the row asked.)*

## 4. The Cull-Alpha (rival, Black)
*(**Severance vital-convert** — RETIRED on evidence 2026-07-28c, bench run 18, driven as its **own**
case on a fresh Cull-Alpha import rather than assumed from the pack's: "🗡️ **Severance**: Bench Target —
Undefended is Isolated — keen damage becomes vital", and the Deflect-2 victim lost the **full 6**.)*

*(**Predator's Due on-defeat** — RETIRED on evidence 2026-07-28c, bench run 18, with the Alpha's token
**CONTROLLED** first: "⚡ **Predator's Due** (Bench Adv — The Cull-Alpha) — Bench Adv — The Cull-Alpha
**regains 4 health**" off `1d6`, engine-applied (HP 8 → 12), plus the whispered 1-Focus GM-add note.)*

*(**Waits for the Failing bloodied cue** — RETIRED on evidence 2026-07-28c, bench run 18: crossing half
of 18 posted "⏰ **Waits for the Failing** (Bench Adv — The Cull-Alpha): Bloodied — the alpha withdraws
the pack to watching distance; they shadow, they do not press.")*
- [ ] ⚑ **ART BACKLOG, not a test** — placeholder icons on all four Kettavar blocks (silhouette / wolf-shadow reuse). Tracked in `EDHA_ADVERSARY_ART_WISHLIST.md`; nothing to bench. *(Re-labelled 2026-07-27w.)*

---

# BENCH — hygiene campaign 2026-08-10 (engine consolidation, pass 5.1)

Engine-only, no pack rebuild pending. Two consolidations, both changing LIVE behavior on purpose
(both are applied-as-default rulings — `EDHA_RULINGS.md` §I — vetoable but ALREADY the shipped
default, so these rows verify the new behavior, not a proposal): **R-60** collapses ten per-tree
`deleteCombat` scene-reset sweeps onto one `edhaSceneReset` applier and ONE population (directory ∪
canvas tokens, deduped); **R-65** folds computed die math on every formula roll via one
`edhaRollFormula` helper. Any bench actor works for the roll-formula rows; the scene-reset rows need
a token you can remove from the canvas (or simply not place) to test the off-scene half.

## R-60 — scene-reset population (one per family with an observably different population)

> **Bench run 24 (2026-09-05): seven of the eight rows RETIRED on evidence** — Sovereignty (the flagship;
> a real `Exalt` wrote `dieStep`+`exalted`, the token was then removed from the canvas, and ending a combat
> cleared both), Death, Fate (incl. the un-attributable-prop clause, driven as a positive/negative pair),
> Order, Power (driven on an off-canvas **adversary**-typed bearer, the exact gap the row names), Knowledge,
> and the Charges/Chaos/Civ dedup check (one `updateActor` per key, one `deleteActiveEffect` per status,
> zero Edha console warnings). Evidence in the 2026-09-05 delta. **Life FAILED** — see its row.
>
> **Bench run 25 (2026-09-05): R-60 is now CLOSED.** Life's re-entry guard and the run-24 world-wide-write
> defect were both fixed in fix pass 1 and both re-tested green on the live table — two combats deleted in
> the same tick produced exactly ONE apex card and ONE injury, and one combat end wrote to only the
> **3 actors carrying state** out of 74, with `Tem parinaem` and `Soggy Bottom` taking zero writes and no
> actor gaining an empty `lists {}` / `markedBy {}`. Both rows are retired; evidence in the run-25 delta.

## R-65 — folded roll formulas (one per affected roll family; representative talent per family)

- [ ] 🤖 **Set Charge / Pinpoint Charge (Destruction) — Detonate's heal AND damage branches now fold
      identically.** This is the smoking-gun pair: before this pass, a Detonate configured to HEAL
      (`b.heal`) did not fold computed die math while the DAMAGE branch eight lines below it did.
      Place a Charge with a [Tier][Die]-shaped formula, Detonate it against both an ally-heal
      configuration and an enemy-damage configuration, and confirm BOTH roll a real die (not a
      formula string like "(2)d(2 * 3 + 2)" reaching the chat card unrolled/zeroed). The DC-save
      branch (Concussive Yield-style saves) rides the same helper — confirm its `1d20 + @skills.…`
      formula still resolves normally (no dice in its die-count, so folding is a no-op there). *(R-65.)*
      ✅ **DAMAGE branch and the DC-save branch PROVEN, bench run 25 (2026-09-05)** — a real Set Charge placed
      on the Playtest Map (formula `(@tier)d(2 * @skills.red.rank + 2)`), detonated with the card's own **Detonate
      ALL** button: `2d8` → **8**, applied as “8 energy” to both caught enemies — plain dice notation, nothing
      unrolled or zeroed. The DC-save branch rode the same detonation: **Concussive Yield** rolled `1d20 + 5` → **14**
      and resolved normally (no dice in its die-count, so the fold is a no-op there, exactly as this row predicts).
      ⛔ **Still open:** the ALLY-HEAL configuration (`b.heal`) — no heal-configured Detonate was staged this run.
- [ ] 🤖 **Magnum Opus (Civilization) — the Construct's transform HP bonus AND splash damage both
      fold.** Trigger Magnum Opus's transform (hpBonusFormula) and its splash-radius damage against
      multiple enemies; confirm both use real dice. *(R-65.)*
- [ ] 🤖 **Pack Share (Knowledge) — each ally's shared-strike die folds.** Trigger Pack Share (or the
      same burst-click family) so at least one ally clicks their damage button; confirm the rolled
      amount is a real die result, not the formula string. *(R-65.)*
- [ ] 🤖 **Venom Glands (adversary bespoke ability) — the poison-damage roll folds.** An adversary
      ability, not a talent — flagged separately per the adversary-wiring standard. Trigger an attack
      that inflicts venom; confirm the damage amount is a real rolled die. *(R-65.)*

- [ ] 🤖 **NEW (run 25) — the SYSTEM's own item-damage card still prints the UNFOLDED formula.** R-65
      folds every roll that goes through `edhaRollFormula`, and every engine roll measured this run did
      show plain dice (`2d8`, `2d8 + 2`, `1d6 + 2`). But a talent whose damage the **cosmere system**
      rolls for itself — `item.system.damage.formula`, rolled by the system's `use()` before any Edha
      rule sees it — never reaches that helper, so its card shows the raw parenthetical. Measured on
      **Verdict**: the system card read `(2)d(2 * 3 + 2) + 5 = 10` while the same talent's engine-rolled
      Edict payoff on the very next card read `2d8 + 2 = 7`. **The maths is right** (Foundry's parser
      evaluates the parenthetical correctly — 10 and 7 are both valid), so this is a DISPLAY gap, not a
      damage bug, and it is the same string run 24 saw on Exalt's card. Decide whether R-65's fold should
      also be applied to the authored `system.damage.formula` at build time (which would make every
      system-rolled card read `2d8`), or whether the parenthetical is acceptable on those cards.
      → `test-pass-fixes` (low severity, cosmetic). *(R-65.)*

## pass 5.2 (2026-08-10, engine consolidation — target/actor readers, R-63, R-64, GM-relay writer)

Engine-only, no pack rebuild pending. Four consolidations: **R-64** fixes the 3-term victim-resolve
chain (six-plus handler bodies had dropped the `options.target` middle term); **R-63** makes
`edhaDisposHostile`/`edhaSameDisposition` and 16 inline same-side/enemies-in-range sites fail CLOSED
on an unresolvable disposition instead of guessing FRIENDLY/NEUTRAL; `edhaSetActorFlagCross` (a
literal twin of `edhaSetEdhaFlag`) is deleted and 8 inline isOwner/socket splits are unified onto
`edhaSetEdhaFlag`/the new `edhaWriteStatusMark`, 4 of which used to drop a write SILENTLY (no
warning) with no GM online; `edhaCasterToken`/`edhaActorRulesOf`/`edhaResolveActorRef` absorbed the
remaining hand-rolled target-token, rule-sweep, and uuid-resolve duplication (repo-side only — no
observable behavior change, not rows below).

- [ ] 🤖 **R-64 — Edha: Gain/Drain Focus, Edha: Reveal, and Edha: Next-Test-Mod's `victim` mode all
      resolve against the event's actual target, not a stale selection.** Pick a representative
      talent per handler (Siphoned Will / Galvanize-style `edha-focus {target: victim}`; Sharp
      Eye-style `edha-reveal {target: victim}`; Coercive Pressure-style `edha-next-test-mod
      {target: victim}`); fire each from a payload that carries `options.target` while your canvas
      selection points at someone else; confirm the effect lands on the payload's creature.
      ✅ **TWO of the three handlers PROVEN, bench run 25 (2026-09-05).** `edha-focus`: **Feinting Strike**
      (`op: drain, target: victim`) fired from an `edha-on-hit` payload against `Bench Target — Adjacent A` while the
      canvas selection pointed at **Adjacent B** — A lost 3 focus (4→1), B stayed at 4; **Whispered Doubt** landed on
      A the same way. `edha-next-test-mod`: **Coercive Pressure**'s focus-change watch stamped
      `nextTestMod {source: "Coercive Pressure", mode: "disadvantage"}` on **A** (the payload's creature) with the
      selection on **B**, which got nothing — card: “Bench Target — Adjacent A's next test — at disadvantage”.
      ⛔ **Still open: `edha-reveal`.** Sharp Eye is the only `edha-reveal {target: victim}` rule and its H1 def-test
      resolves its own target AFTER the roll, so on this harness the payload's target and the canvas selection cannot
      be made to diverge (driven anyway: both read `Adjacent B` consistently, which proves nothing either way).
- [ ] 🤖 **R-64 — the `edha-cae-grant`/`edha-owner-list` (H3 annotate/near-victim) `victim` picks
      agree with the payload, not the clicking user's canvas selection.** Same shape as above, for
      Through the Fray-style CAE grants and any H3 list rule using `target: victim` — including
      Order's covenant/edict-annotate placements and the multi-target Investiture-of-Command-style
      `to: targets` sweep, which reads the SAME fixed `edhaUserTargetActor()` reader as everywhere
      else and should behave identically to before (regression-only, no chain to verify there).
      ✅ **`edha-cae-grant` half PROVEN, bench run 25 (2026-09-05)** — **Feinting Strike**'s
      `edha-cae-grant {kind: burn-reaction, target: victim}` fired from the same `edha-on-hit` payload and burned the
      reaction of the **hit** creature: “⚡ Feinting Strike: Bench Target — Adjacent A loses one Reaction”, with the
      canvas selection on Adjacent B throughout.
      ⛔ **Still open:** an H3 `edha-owner-list {target: victim}` placement. Every such rule shipped today (Chaos ×7,
      Death ×1) sits on `edha-test-success` behind an H1 def-test, which hits the same harness limit as Sharp Eye
      above. Note the row's own text rates the `to: targets` sweep regression-only, with no chain to verify.
- [ ] 🤖 **R-63 — a token with genuinely UNSET disposition is no longer treated as an enemy by
      default.** Create/borrow a token whose `disposition` cannot resolve (a bare unlinked prototype
      with no explicit disposition, if your test scene has one — otherwise this is a repo-side
      pin only, see `tests/disposition-failclosed.test.js`) and confirm a hostile-only effect
      (Consuming Decay's `edhaDisposHostile`-gated enemy check, or any `edha-owner-list
      {requireDisposition: "enemy"}` prompt-mode placement) now REFUSES against it instead of
      treating it as hostile.
- [ ] 🤖 **R-63 — same-side checks (auras, Reroll Reaction's "enemies only", the Fate snare's
      "enemies only spring it", the zone-guard's "protects the owner's ally") still fire correctly
      for ordinary tokens with a normal disposition — this is a regression check on the 12 migrated
      same-side sites and the 4 enemies-in-range filters.** Pick 2–3 of: an aura talent
      (`edha-buff-aura`-family with `affects: allies`/`enemies`), Reroll Reaction against a marked
      foe, a Fate snare stepped on by an ally vs. an enemy, Reveal Facts / Investiture-of-Command's
      enemies-in-range button. Confirm normal-disposition behavior is unchanged.
- [ ] 🤖 **Job 6a — 4 flag/status writes that used to fail SILENTLY with no GM online now warn the
      player instead.** With no GM connected (or `game.users.activeGM` unset), as a non-owning
      player: (1) unmark a ledger entry via `edhaListUnmark`'s consumer (any H3 list release/evict
      on a creature you don't own), (2) `edhaRemoveMark`'s reroll-reaction removal, (3) an
      `edha-die-step {oncePerTarget: true}` talent's per-target stamp (e.g. a Sovereignty die-step
      rule with the once-per-target box checked), (4) a `edha-apply-status`/`edha-owner-list` timed
      mark (`expire: owner-turn`/`target-turn`, e.g. Kneel's Compelled) applied to a creature you
      don't own. Confirm each now shows "Edha: a GM must be online…" instead of quietly doing
      nothing. Also confirm the OTHER 3 unified sites (`edhaSetNextTestMod`, `edhaSovSetSteps`,
      `edhaGrantAdvAttack`, `edhaGrantTempHpCross`) still warn as before (they already did — this is
      a wording-consolidation regression check, not a behavior flip).
- [ ] 🤖 **Job 6b — `edhaWriteStatusMark`'s GM-relay consolidation is a regression check, not a new
      capability.** Place a marker via the list-kind placement path (H3's `target: list-members`
      shape), the enemies-in-range fill (`target: enemies-range`), and a plain victim mark, each
      relayed to a GM (non-owner marking a creature they don't own) — confirm the status toggles and
      `markedBy.<status>` lands identically to before. NOTE: the audit that requested this pass
      described a `combatExpire` field being dropped from two of these three sites' socket payloads;
      root-causing found no such field on the `edha-owner-list` handler schema at all (checked
      `data/*.json` + the schema registration) — there was nothing to drop. If a talent DOES need an
      H3-placed mark to expire at end of combat, that is a missing FEATURE (no authored field exists
      yet), not a bug this pass fixed — file it as a new ruling if wanted, don't expect a card that
      changes.

## pass 5.3 (2026-08-10, engine consolidation — cards, costs, dialogs; R-61, R-62, R-66, R-67)

Engine-only, no pack rebuild pending. Eight consolidations over `EDHA_CARD_BUTTONS` (button
binding), `edhaMarkCardResolved` (R-66 persistence), `edhaPostChoiceCard`/`edhaTreeCard` (card
posters), `edhaGmIds` (R-62 whisper audience), `edhaSpendResource`/`edhaGainResource` (resource
writes), `edhaSceneOnceUsed`/`edhaStampSceneOnce` (R-61 oncePerScene), `edhaDialogPick` (pickers),
and `edhaSheetRoot`/`edhaPostCleanseCard` (sheet injectors + Life/Restoration cleanse cards). Most
rows below are regression checks (repo-side unified, no live behavior change); the ones flagged
VISIBLE are the actual behavior flips this pass made on purpose.

- [ ] 🤖 **VISIBLE — R-59 outer catch now covers eleven chat-card buttons that had NONE before:
      burst-btn, burst-cancel, charge-btn, charge-all, combustion (Ignite-spread), shatter-mute, and
      the four Fate buttons (mark-offer, reposition, spring-snare, thread-resolve).** Force one to
      fail (e.g. click a burst-detonate button after deleting the pending burst's server-side entry,
      or click a Fate spring-snare button with the snare already gone) and confirm an error TOAST
      appears (`ui.notifications.error`), not just a console line. Before this pass these eleven had
      no outer catch at all — a rejected promise from the click failed completely silently.
      ⚠️ **NEGATIVE half only, bench run 25 (2026-09-05)** — the **charge-all** button was clicked in anger (a real
      Set Charge → “Detonate ALL”) and behaved correctly with **NO** toast of any kind, only its own detonation card.
      That settles this row's load-bearing negative (“routine operation must not toast”) for one of the eleven.
      ⛔ **Still open:** the POSITIVE — no button was deliberately broken this run, and the other ten were not clicked.
- [ ] 🤖 **R-66 — eleven more one-shot cards now stay spent across an F5 / a second client.** Pick
      3–4 of: Plot Grant (White), Designate (White), Beacon/cleanse (White), a Charge's arm-trigger
      card (Destruction), Mutation adaptation (Green), Life Cleanse, Counter-Transfer (Knowledge),
      terrain Extinguish (Green/Destruction), Natural Recovery (Restoration), Reknit Form (Life/
      injury removal), Vital Surge's Temp-HP offer. Click the button, then hard-refresh (F5) or open
      the same world on a second client — confirm the button stays disabled/relabeled instead of
      reviving (the exact Flame Surge bug R-66 exists for).
- [ ] 🤖 **VISIBLE — Beacon's cleanse confirmation message now prints costs in the majority "N + N"
      form, not "−N, −N".** Trigger a Beacon cleanse that spends a listed cost (e.g. Investiture);
      confirm the confirmation card reads "(2 Investiture)" rather than "(−2 Investiture)". Purely a
      text-format change — the resource still spends the same amount.
- [ ] 🤖 **VISIBLE — R-62 audience flips, seven sites.** Read carefully — FOUR flip toward wider
      (active-only → all GMs, so a GM who was offline when it fired can still find it after logging
      back in): the scene-cue trigger note (`edhaPostCueCard`, any `edha-note`/trigger-card
      talent), the ambush-belief Perception result note (Phantom Double/illusion family), the
      illusion belief-sweep card (including its "Re-test viewers" button), and the Kindle Lights
      auto-veil ON/SUPPRESSED status notes. ONE flips toward narrower (all GMs → active-only, so a
      GM who logs in hours later doesn't see a stale dead button): the Pyre/Ignite-spread
      Spread-or-Extinguish confirm card. TWO stay unchanged as a regression check: `edhaPostGmCard`
      (Black Draw Mana's hidden-info card) and its `gm-card` socket-relay twin — both were and stay
      all-GMs. For each: with a GM logged OUT, trigger the card from a player client, then log the
      GM back in and confirm whether the card is there (record cards) or correctly absent (the Pyre
      action card, which should NOT be waiting for a GM who missed the live moment).
- [ ] 🤖 **R-61 — regression check: every other oncePerScene gate (H1 def-test, self-status arm,
      revive, marker-command spring-all, summon-effect transform, the die-step family, the
      detonate-list family) still refuses a repeat use with its OWN unchanged polarity.** Pick 2–3
      talents across different polarities (e.g. a def-test talent with default-off `oncePerScene`,
      a revive/decree-style default-on talent, a marker-command strict-`true` talent) and confirm
      first use succeeds, second use in the same scene is refused with the same wording as before.
      ✅ **One polarity done, bench run 24 (2026-09-05)** — the default-on case (`edha-decree`, Final
      Decree, authored `oncePerScene: true`): first use went through, second use in the same scene was
      refused with *"Edha: Final Decree is once per scene. Nothing spent."* and Investiture was unchanged
      (4 → 4). ⛔ **Still open:** a default-off talent and a strict-`true` marker-command talent.
- [ ] 🤖 **R-61 — a scene mid-flight when this shipped keeps working (the legacy `detonateUsed` read
      fallback).** Not independently testable without a stale flag already on an actor from before
      this deploy — informational only; the gate now reads `sceneOnce.<id>` OR `detonateUsed.<id>`,
      so an actor that already has ONLY the legacy flag set (from before this pass) still gates
      correctly instead of getting a free extra use. If you have a save/actor from before 2026-08-10
      with a Cascading Failure / The Unmooring already detonated this scene, confirm it still refuses
      a second detonate.
- [ ] 🤖 **Regression check — resource spend/gain amounts are unchanged across the ~18 migrated
      sites.** Pick 2–3 representative spends (a Coordination reaction card's listed cost, Reknit
      Form's Investiture cost, the Opportunity menu's spend) and 2–3 gains (a marked-damage-trigger
      recovery, a sense-reveal recovery, Sovereignty's Inv-recovery-on-foe-fail) — confirm the
      resource ends at the same value it always did, including an actor starting at EXACTLY 0 of the
      resource (falsy-zero case: a 0-Investiture actor's next gain should add normally, not read as
      broken).
- [ ] 🤖 **Regression check — Life Cleanse and Natural Recovery's offer cards/confirmations are
      byte-identical to before.** Trigger a Life Cleanse (🩺, no cost note) and a Natural Recovery
      offer (🍃, "spend an Opportunity" or the talent's own cost note) — confirm the emoji, prompt
      wording, and confirmation message text on EACH match what they always said (Life still shows
      no parenthetical cost note; Restoration still shows its cost note in parentheses).
