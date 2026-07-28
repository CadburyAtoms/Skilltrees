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
`if (!game.user?.isGM || actor.type === "character") return;` anywhere. Un-blocks **2bAA-8**'s refund
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

- [ ] 🤖 **2bAC-1 (mechanical half) — Edit Event Rule geometry** — open any converted talent → Events → edit its Triggered Effect rule → the window is ~660px wide, each control sits beside its label, the hint sits UNDER the pair in smaller type, the form scrolls inside the window, and Update is reachable at the bottom. *(Split from the row below 2026-07-27w. Bench run 12 already measured 660×447 with labels and controls on the same row — this is the six-property re-read, not a fresh question.)*
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
- [ ] 🤖 **2bL-14 — Bear Witness — mid-combat reload** — in round 3+, refresh Foundry (F5) → Nobody gains a fresh round of Temp HP just for reloading.
- [ ] 🤖 **2bE-9 — adversary widening** — put an adversary carrying a combat-timing talent into a fight → It now gets its combat-start grant. **Deliberate change** — the retired hooks were gated `type === "character"`; rule-driven dispatch doesn't need that gate. Tell me if you'd rather it stayed PC-only.

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
- [ ] 🤖 **Injury tool** — Raise Dead: the card names the auto-added injury and it appears on the
      target's sheet (schema drift falls back to a bare-named Item — report if fields are missing).
      Apex Form: ending the scene (delete combat) adds the injury + card. Create a world RollTable
      named "Injuries" and confirm it takes precedence over the placeholder list.
      ✅ **TWO OF THE THREE CLAUSES ARE PROVEN — narrowed 2026-07-27v.** **Raise Dead** passed at bench
      run 4 as **2bW-9** (the full valid raise produced its auto-created injury Item on the target).
      **Apex Form** passed at bench run 6 as **2bW-13**, under the hardest condition available — with
      **both** GM clients connected, one combat delete minted exactly **ONE** "Apex Form ends — takes an
      injury: Slowed…" card and **ONE** injury item. ⛔ **All that remains is the third clause**: create
      a world RollTable named "Injuries" and confirm it takes precedence over the engine's placeholder
      list. Nothing else on this row is open.
- [ ] 🤖 **Formula bar** — any advantage roll reads "2d20kh + 6" (spaced, no stray ")"). If garbling
      recurs, note whether the roll dialog's Temporary Bonus field had anything typed in it.
      *(2026-07-27o, bench run 12: the FACTUAL half is clean and the garble did not reproduce —
      Withering Ray rolled at advantage read exactly `2d20kh + 5 + 1d8[Predatory Patience]`, spaced,
      no stray ")". The dedicated Withering Ray row is retired; this one stays only for the
      look-at-it-yourself half.)*
      ⛔ **Narrowed 2026-07-27v: NOTHING MECHANICAL IS OPEN HERE.** The chat-formula half is closed on
      the quoted string above. What is left is exactly one thing — **look at a formula bar yourself and
      say whether it reads right** — plus the standing instruction to note the roll dialog's Temporary
      Bonus field if the garble ever recurs.
- [ ] 🤖 **Engine-move collision** — Unnerving Approach push (and Cruel Step slide) toward an occupied
      square: the moved token stops in the last free square, never stacking. Manual drags still stack
      (intended — R2 engine-only).
      ✅ **THE ENGINE HALF IS PROVEN — narrowed 2026-07-27v (bench run 9, 2026-07-27i).** Shattering
      Blow pushed Adjacent A **0 ft** when Adjacent B occupied the destination square and **5 ft**
      (4500 → 4800) when the lane was clear — same talent, same round, a negative and a positive
      against each other. **Tokens never stacked.** ⛔ **Only the manual-drag half remains**, and it is
      a canvas act: drag a token by hand onto an occupied square and confirm it still stacks (intended
      — the engine executor is not in that path).
- [ ] 🤖 **Flame Surge / burst cards** — Detonate: button reads "Detonated ✓" and stays disabled after
      F5 / re-login; re-clicking is impossible. Cancel reads "Cancelled — refunded ✓". Old cards from
      before this fix still reset on refresh (only messages stamped from now on persist).

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

- [ ] 🤖 **Devoted Conduit (2bR-10)** — have a SECOND White character redirect damage onto an ally in your Attunement Range (Shared Burden's redirect is the trigger) → you reduce that redirected damage by **half [Tier][Die] (1–8)**, on a card naming Devoted Conduit. It deliberately never reduces the redirect the owner took **themselves** — the card reads "when an ally… takes damage intended for another creature", so it needs two White characters to observe. The other four White spot-checks (Pillar of Order · Concordant Presence · Voice of Authority · Collective Resolve) passed 07-26i and are retired. *(2026-07-26k: the shared evaluator is proven — its three sibling rules on the same call site all rolled real numbers this run; only the two-White staging remains, and the bench roster has one White PC → Ben or a two-client run.)*
- [ ] 🤖 **Burst-only: the 13 damage riders that lost their bonus inside an AoE** — `edha-damage-rider` was fine on ordinary hits but went through the broken evaluator on the **`edha-burst` detonate** path, so these lost their rider **only when the damage came from a burst**: Life's **Prognosis**, and the bite/strike riders on Mistheron · Stillback · Wasting-Eater Stillback · Wrongwake · Wasting-Eater Wrongwake · Keelshadow · The False Spring · Brandram · Hazewyrm Adult · Hazewyrm Elder · The Doubled · The Doubled Elder. Needs the owner to deal damage through an AoE specifically — awkward to stage — which makes it a heavy bench row, not a Ben row.
- [ ] 🤖 **The other five restored adversary abilities (same 07-26j fix)** — run each once on a FRESH pack import: **Reeve-Owl** Sovereign of Solitude (black) · **Rootling Swarm** Grasping Vines + Territorial Instinct (green) · **Tussock-Sow** Drive the Prey (green). Each must now ROLL its named skill and print a `N vs <DEF> M — SUCCESS/FAIL` card instead of silently charging its cost. (Surecat's Redirect Momentum is 2bF-17 in the Blue section.) *(2026-07-26k: rebuild confirmed live — all five read `skill_test` with their skills on a fresh pack read. ⚠️ The Fellstag's **Herding Antlers** was MISSED by the same fix — see the Green spot-check row.)*

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

- [ ] 🤖 **2bAA-6 — Living Image** — open it → **Events tab**; then start your turn with an illusion up → TWO rules where the tab was empty: `edha-illusion-upkeep` (config) + `edha-note` (use). The turn-start prompt still whispers with a one-click pay. **Edit `costPer` to 2 and the button must then charge 2** — that is the whole point of the conversion.
      *(2026-07-26i: NOT RUN — "the turn-start upkeep needs a live combat turn change, which the
      cosmere activation model does not expose from the console".* ⚠️ **THAT BLOCKER IS STALE and is
      struck, 2026-07-27v** — a turn boundary IS drivable: bench run 9's own method was
      `combat.update({turn})` (recorded on the Knowledge section's Accumulate note), and **2bL-10 drove
      rounds 1 and 2** to prove Bear Witness fires every round. This row is agent-runnable; it was
      parked on a limit that does not exist.*)
- [ ] 🤖 **2bJ-3 — Pattern Recognition (Blue) ⚠️** — use it on a target, accept, then have them roll a test **this round**; separately, accept and let the **round change** before they roll → Disadvantage on the test this round. After the round changes it **no longer applies**. **BEHAVIOUR CHANGE:** the card always said "their next test **this round**" and the old flag waited for ever. Tell me if you'd rather it kept waiting.
      *(2026-07-26i: NOT RUN — needs a real round change; see 2bAA-6.* ⚠️ **Struck 2026-07-27v for the
      same reason: a round change IS drivable** — `combat.update({turn})` / `combat.update({round})`,
      demonstrated by 2bL-10's two rounds. Agent-runnable.*)
- [ ] 🤖 **2bAA-9 — The Seeming — Mistheron AND The Doubled Elder** — use it on each; break the copy → Each adversary ability now carries its OWN `use` rule (⟳ Sync Adversaries / re-drag first). Both must still raise the copy and run the belief sweep, and **the cards must name "The Seeming", not "Phantom Double"**. Spearing Beak's / the Grasp's fooled-target rider must still find the belief ledger.
      *(2026-07-26i: NOT RUN — same second-client need as 2bAA-8.* ⚠️ **THAT NOTE IS STALE and is
      struck, 2026-07-27v: 2bAA-8 was driven SOLO at bench run 14** — the second-client label was
      over-applied, as marathon 2's report §5 records for three separate rows.*)
      ✅ **THE RAISE AND THE BELIEF SWEEP ARE PROVEN — narrowed 2026-07-27v.** Bench run 13 drove the
      Cognitive-14 raise and the four-PC Perception belief sweep end to end (the whole Illusion belief
      loop retired that run, client veil proven in all three directions). ⛔ **What is left is
      specifically the ADVERSARY copies of this ability** — Mistheron and The Doubled Elder, each on a
      FRESH pack import — the "cards name **The Seeming**, not Phantom Double" wording, and the
      fooled-target rider (Spearing Beak / Raking Grasp) finding the belief ledger.

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

- [ ] 🤖 **Flashpoint** — Red burst hits 2+: click the prompt → +1 Investiture AND your next Red test
      rolls with advantage automatically (pre-selected/fast-forwarded).

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

- [ ] 🤖 **2bS-11 — Natural Order — NARROWED 2026-07-26k** — the use half PASSED: 2 Inv spent, the **"Clearsight (veils suppressed nearby)"** marker landed with the explanatory card. Still open: the veil half — a veiled enemy standing in **darkness** in range keeps its auto dark-veil marker DOWN (needs scene darkness + a veil-capable adversary — staging left for a run that owns the darkness question, or Ben), and the combat-end clear.
- [ ] 🤖 **2bS-1 — Green Leyline Attunement — NARROWED 2026-07-26k** — placement PASSED (click-to-place placed the 10 ft difficult-terrain Region, "Thorn Field rides it"), and the ⚠️ cosmetic drift is confirmed (its own card; the Draw Mana summary prints no Green line). Still open: the out-of-range refusal (not driven this run), plus the range ring + snap feel — screenshot the placement overlay and say whether the ring reads; escalate to ⛑ only if a screenshot cannot settle it.
- [ ] 🤖 **Green spot-checks (like-for-like) — Mender's ENGINE halves PASSED 2026-07-26m; the DATA halves are BLOCKED-ON-DEPLOY** — bench run 4 retired (1) the ally gate (a HOSTILE fixture taken 32 → 12 HP drew NO offer) and (2) the scene scope (with Green's own copy temporarily removed, The Vivisectionist — owner, no token on the scene — stayed SILENT; its silence was the test). (3) the heal-block passed under 2bW-1. **Still BLOCKED-ON-DEPLOY:** run 4 read the live pack and confirmed the authored green fix has NOT shipped — the rule's `note` is still 228 chars and `rangeColor` is still `""`, so the card prints the long description and an out-of-Attunement ally (~70 ft) still draws an offer. After `foundry-build leyline` + ⟳ Sync Talents, re-check for the engine's tight "<ally> dropped to N/M HP" line and the range refusal. Green's own `oncePerRound` held in run 3 — don't re-prove it. **Herding Antlers on the Fellstag (2bF-10): BLOCKED-ON-DEPLOY, confirmed still dead 2026-07-26m** — a FRESH pack read of the Fellstag shows Herding Antlers with **0 events** and no `activation.skill`; the live pack predates commit `8917cbb`. Re-test only after `foundry-build adversaries` + ⟳ Sync Adversaries + a FRESH re-drag: target a character, use → Green vs Survival through the contest core; success → Slowed + the move-away note. **Still unrun**: Spreading Roots (2bS-4) · Pack Hunter (2bS-6) · Scent the Weak (2bS-7, though its advantage was seen arming incidentally) · Resurgent Growth (2bS-12, seen ticking incidentally in run 4 — "Resurgent Growth: Bench Ally — One regains 7 health" at a round boundary) · Natural Recovery (2bS-14) · Reknit Form (2bS-15). ✅ **BOTH BLOCKED HALVES NOW PASS — bench run 11, 2026-07-27m, on the rebuilt leyline + adversaries packs.** (a) **Mender's card text**: the live rule reads `note: ""` (was 228 chars) and `rangeColor: "green"`, and an ally taken 32 → 12 HP at **15 ft** drew the engine's tight one-liner — "⚡ Mender's Instinct — 1 Investiture · Bench Ally — Two dropped to **12/33 HP** — you may react to heal them." (b) **The green range gate is REAL, with a clean positive/negative pair in the same minute**: an ally at **85 ft** taken through the identical 20-impact `applyDamage` (32 → 12) drew **NO offer at all**, while the 15 ft ally did. (c) **Herding Antlers on a FRESHLY IMPORTED Fellstag PASSES (2bF-10)** — the pack now reads 2 events + `activation.skill: "green"`, and a use on a character rolled `1d20 + 2 = 22` and posted "Herding Antlers: 22 vs Bench Ally — One's **SUR 19** — SUCCESS", applied **Slowed** (asserted on the document) and printed the move-away note. ⛔ ~~The row STAYS only for the six still-unrun Green talents~~ — **THREE of the six PASSED at bench run 14 (2026-07-27r) and are retired**: **Pack Hunter (2bS-6)** — staged Green(9000)/enemy(9300)/ally(9600) all adjacent, use charged 1 Inv (4→3) and posted "🐾 Pack Hunter (Bench — Green): **2 hunter(s)** gain advantage on their next attack against Bench Target — Undefended", with `advAttackNext: "Pack Hunter"` written to **both** the caster and the ally (the card's "you both" half, asserted on two documents) · **Scent the Weak (2bS-7)** — free, posted "🩸 Scent the Weak (Bench — Green): lowest HP in range = **Cragdrake Whelp Pack (1) (6 HP)**. Advantage on your first attack against it this round" and armed `coordRound {"Scent the Weak": {_adv: 1}}`; note it correctly named one of *Ben's* placed tokens rather than my 8-HP fixture — it really does scan Attunement Range for the true minimum · **Reknit Form (2bS-15)** — **both halves**: with no injury on the target it refused pre-cost ("Edha: Bench — Life has no removable injuries.") with Investiture **unchanged at 4**; with a `flesh_wound` injury present it posted the picker card "🩹 Reknit Form — remove an injury from Bench — Life (2 Inv temporary · 3 Inv permanent)" and the click removed the injury item from the ally and charged exactly **4 → 2**.
⛔ **The row now STAYS only for the THREE that need a live combat turn / an Opportunity**: **Spreading Roots (2bS-4)** (`edha-zone-react {turn-end-in-zone}` — needs a character *ending its turn* in Green's difficult terrain) · **Resurgent Growth (2bS-12)** (`edha-heal-react` — the tick lands at the start of your NEXT turn) · **Natural Recovery (2bS-14)** (costs an **Opportunity**, which run 10 could not force either). All three are turn-boundary/Opportunity staging, not talent doubt.
- [ ] 🤖 **2bS-3 — Briar-Gone Grove (adversary) — NARROWED 2026-07-26k** — the Grove's Thorn Field (boss → d8) keen rider baking into its engine-placed patches is still to bench. *(The Fellstag half PASSED and is retired: a FRESH pack import's Draw Mana placed its own 5 ft square, "Thorn Hedge rides it", and the hazard tick dealt "2 keen … (Thorn Hedge — Bench Adv — Fellstag)" — rival d6 family, its own zone-hazard rule.)*

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
- [ ] 🤖 **2bL-7 — Covenant — the SHARED icon (needs two Order PCs)** — have two Order characters both covenant the **same** ally, then have one of them break/fizzle theirs → The ally **keeps** the Covenant icon, because the other pact is still live. Getting this wrong strips the second player's marker silently — it is why the rule carries `multiOwner`. **Still open after run 8**: the bench has one Order PC and staging a second would mean granting the whole Order path to another actor mid-run; left for Ben's two-client bench or a run that stages a second Order actor deliberately.

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
- [ ] 🤖 **2bD-7 — regression: the untouched rows — FAIL 2026-07-27i (2 of 4 are dead)** — **Sharp Eye**, **Tactical Ploy**, **Steadfast Challenge**, **Valiant Intervention** → All four still work exactly as before — they stay on the old `EDHA_HEROIC_DEFTESTS` path this pass. If any broke, the table edit went wrong. **Run 9:** Tactical Ploy ✅ (2bE-7, both branches) and Valiant Intervention ✅ (2bF-15). Steadfast Challenge rolled and resolved but only a FAIL was observed (2bF-13, below). **Sharp Eye is a silent no-op** — see 2bQ-4. Its cause is the dead-skill-key family below, not the table edit. **2026-07-27k: THREE OF FOUR ARE NOW CLEARED** — Steadfast Challenge's success branch passed (2bF-13, retired), joining Tactical Ploy and Valiant Intervention. ⛔ **This row now hangs on Sharp Eye alone, which is BLOCKED-ON-DEPLOY** (`foundry-build heroic` + ⟳ Sync Talents); a fresh console read on 07-27k confirms the live pack still carries `skill: "per"`. **2026-07-27m (bench run 11): still hangs on Sharp Eye alone, and it is no longer a deploy gap** — the heroic pack IS rebuilt and Sharp Eye still does nothing. Its cause is now root-caused as an `activation` defect, not the skill key; see 2bQ-4. The other three remain cleared. ⏳ **2026-07-27n: the activation fix is IN and this row is BLOCKED-ON-DEPLOY behind it** — it needs a **second** `foundry-build heroic` + ⟳ Sync Talents. Re-check Sharp Eye only; the other three are settled. ✅ **UNBLOCKED 2026-07-27u — that second heroic build is DONE.** Re-check Sharp Eye only.
      ⛔ **RESIDUE, stated exactly — narrowed 2026-07-27v: 3 OF 4 ARE CLOSED AND ONLY SHARP EYE IS
      LEFT.** ✅ Tactical Ploy (2bE-7, both branches, bench run 9) · ✅ Valiant Intervention (2bF-15,
      run 9) · ✅ Steadfast Challenge (2bF-13's success branch, run 10 — the run-9 FAIL-only reading is
      superseded). **Do not re-drive those three.** The single remaining action on this row is: use
      **Sharp Eye** on a targeted creature and confirm it now rolls — it is no longer deploy-blocked
      (07-27u), so a silent no-op here would be a NEW finding, not the old one. Score this row off
      2bQ-4's result.
- [ ] 🤖 **Probability Cascade (Blue) — the count-2 half of the 2bO-7 guard, NOT RUN 2026-07-27k** — `edhaNextModClaimOk` (the Pack Hunting double-dip guard) must stay inert for multi-use test-only mods: Probability Cascade is `count: 2`, `appliesTo: "test"` and must still apply to **two separate tests**. Run 10 verified the guard is inert for **count-1** test-only mods (Demonstrative / Shrewd / Overwhelm with Details / Decisive Command all applied normally on skill tests) but could not drive Probability Cascade itself — its chain needs an Opportunity plus 1 Investiture, which cannot be forced on demand. **This is a Blue row, not Heroic** — run it in a Blue pass.
- [ ] 🤖 **2bQ-4 — Sharp Eye — FAIL 2026-07-27i: a total silent no-op** — target a creature and use it → You roll **Perception**; the card says SUCCESS or FAIL against their Cognitive defense. **On a success only**, a second whispered card lists *lowest attribute · lowest defense · below half*. **Run 9:** used twice on a valid target — **no roll, no card, no notification, and nothing spent** (focus 4→4, Investiture 4→4). The document is not empty: it carries `SharpEyeGate0000` (`edha-def-test`) and `SharpEyeReveal00` (`edha-reveal`, on `edha-test-success`). **Cause:** the gate's **`skill: "per"`** is a dead key — the cosmere Perception skill is **`prc`**, and `per` appears nowhere in `CONFIG.COSMERE.skills`, so no roll can ever fire and the success event never arrives. Same shape as run 2's "cost charged and nothing happened" lesson, here without even the charge. ✅ **FIXED 2026-07-27j — BLOCKED-ON-DEPLOY: needs `foundry-build heroic` + ⟳ Sync Talents.** The gate is now `prc`. **Re-test after the rebuild:** target a creature, use it → a Perception roll and a SUCCESS/FAIL card, and on a success the whispered fact list. ⛔ **STILL A TOTAL SILENT NO-OP AFTER THE REBUILD — bench run 11, 2026-07-27m. The dead key was real but it was NOT the whole cause.** The `prc` fix is live on BOTH the pack and the owned item (`SharpEyeGate0000`, `edha-def-test`, `skill: "prc"`), and a use on a correctly targeted creature still produced **no roll, no card, no notification and nothing spent** (focus 4→4) — twice, with the target asserted in `game.user.targets`. **ROOT CAUSE, now CONFIRMED IN SYSTEM SOURCE (2026-07-27n) rather than inferred:** Sharp Eye's `activation` was `{type: "utility", cost: {value: null, type: "spe"}}` with **no `activation.skill`**, and the system's own `use()` decides `rollRequired = activation.type === "skill_test" || hasDamage` (`systems/cosmere-rpg/index.js` ~L7188). With `utility` and `damage.formula: null` it took the else-branch: it posted the plain action card, fired `useItem` (so the `use` event and H1's executor really did run), and rolled **nothing**. H1 is a DECIDER, not a roller — it queued a contest and the entry simply expired after `EDHA_CONTEST_TTL`, with no error and no warning. ✅ **FIXED 2026-07-27n — BLOCKED-ON-DEPLOY: needs `foundry-build heroic` + ⟳ Sync Talents.** `activation.type` → `skill_test`, `activation.skill` → `prc`; the Special Action cost is unchanged, so the card text is untouched. Verified by reading the talent back out of a scratch-`EDHA_MODROOT` heroic build. **RE-TEST after the rebuild:** target a creature and use it → a **Perception** roll fires, a card reads "Sharp Eye: `<total>` vs `<name>`'s COG `<n>` — SUCCESS/FAIL", and on a success a second whispered card lists *lowest attribute · lowest defense · below half* with the "Pick ONE" note. **Family audit re-run independently: 37 authored rules carry `edha-def-test`, 35 are already `skill_test`;** the only other exception is Chaos's **Unravel Everything**, which is legitimately exempt (`targetList` + `vs: "none"` returns before the contest is ever queued). Zero skill mismatches across the other 35 and across all 7 adversary abilities. **This shape has now shipped twice** — six adversary abilities in 07-26j, this one on the talent surface — so **`lint-refs` pass 14** gates both surfaces from here (mutation-verified against this exact defect). ✅ **UNBLOCKED 2026-07-27u — the heroic rebuild is DONE and the fix is confirmed IN THE BUILT PACK** (`activation.type: "skill_test"`, `activation.skill: "prc"`, both rules intact). This row is no longer deploy-blocked; it needs a bench drive. **Drive it as written above** — target a creature, use it, expect a Perception roll, a SUCCESS/FAIL card vs COG, and on a success the whispered fact list.
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
The two ⚑⚑ Line-Caller flows below are the pipeline's remaining unknowns.

- [ ] 🤖 **Guiding Signal designate flow (14n)** — the Line-Caller uses it (inv 2→1): the card
      lists the **PC tokens** within 15 ft (opposing side); clicking one posts the designation
      note; a RAIDER who **targets that PC** and tests gets "Raise the Stakes" auto-injected and
      the mark clears (one grant). An empty card must SAY WHY (no token on scene / nearest
      candidate + distance) — never a bare "no allies in range".
- [ ] 🤖 **Ordered Advance movement card (14n)** — use it (2 Actions, inv −1; the arm note posts),
      then MOVE the Line-Caller: a card lists the allies within 10 ft of where it stopped with
      each one's half-Speed (Raider 12.5 ft); moving with nobody near posts the "no allies within
      10 ft" accounting line instead. Next round (or combat end) the window is dead — moving
      posts nothing.

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

- [ ] 🤖 **Sidebar button v2** — ＋ Edha Character files the new actor into an **"Edha PCs"**
      folder (auto-created on first use), opens its sheet, and the wizard opens **ON TOP** of
      the sheet (was: behind it).
- [ ] 🤖 **Wizard stays on top** — while any wizard page is open, document sheets rendering
      (actor sheet re-renders, the leyline path sheet — 07-19's mystery box) never bury the
      wizard; pick DIALOGS still land above it; "Open the tree" / "Browse the tree" /
      content-link clicks are exempt and stay in front of the wizard. ⚑ if a path sheet still
      pops up UNASKED mid-flow, note the exact window title — the opener is still unpinned.
- [ ] 🤖 **Map picker (fixed 07-19q — the svg was sanitizer-stripped)** — take-two's "no map at
      all" was DialogV2's cleanHTML eating the `<svg>` overlay (its tag allowlist has img/div
      but not svg); the deploy itself was verified clean (live hashes = repo). The overlay is
      now built AFTER sanitization and the logic is browser-harness-verified. In Foundry:
      hover a nation = name + region tip; click = selects it (the dropdown below follows and
      stays as the fallback); the culture card updates; all ten nations clickable. If the map
      is STILL absent, the console now says exactly why (asset-fetch / img-load warnings) —
      paste that line.
- [ ] 🤖 **↺ Change a pick in-wizard (07-19q)** — every "Already chosen" page (country / heroic /
      leyline / deity) carries **↺ Change…**: the confirm names exactly what leaves (the path +
      its Key + that tree's talents; heroic also pulls the kit gear + its 5 silver back;
      culture leaves picked origin expertises behind by design), then the page re-opens for a
      fresh pick. Back from any later page → Change → re-pick → continue, NO restart needed.
*(The **07-19q weapon slot picker** row is retired 2026-07-27v as STALE — its list clause
("every edha-items weapon of 2 gold or less") is now true only for the Warrior. **Superseded by
Weapon slot v3 — path-curated**, below, which absorbed its still-live "Take it / Choose later" clause
so nothing was dropped.)*
- [ ] 🤖 **Basic actions auto-grant (07-19q; console errors fixed 07-19r)** — a ＋ Edha Character
      actor (and ANY actor the wizard is opened on) gains the system's basic actions
      (cosmere-rpg.actions pack) it was missing — by name, once; re-opening the wizard
      duplicates nothing. The wizard-start red console errors from Ben's 07-19 paste
      (`connectRelationship … null uuid` + the server `undefined id`) were the copies carrying
      their PACK relationship links — every wizard pack-copy path now strips them
      (`edhaCleanPackCopy`). Confirm a fresh ＋ Edha Character produces a CLEAN console.
      ⚑ actors made BEFORE this fix carry poisoned action copies — expect the same errors if
      you delete/edit those items; recycle the test actor instead (the errors never corrupted
      data — the bad writes were server-rejected).
- [ ] 🤖 **Attribute blurbs (07-19q)** — each attribute row now explains what it feeds (defenses;
      STR: Health-per-level + carry; SPD: movement; WIL: Focus + Recovery die; AWA: Senses
      Range; AWA/PRE: Investiture) plus its LIVE skill list (leyline colors under their
      attribute). Sanity-read at the table — if a claim contradicts the sheet, quote the line.
- [ ] 🤖 **Skills grouped like the sheet (07-19q)** — Physical / Cognitive / Spiritual headers;
      the intro no longer claims magic skills unlock later (the five colors are always-rankable
      core skills — Edha registers them so; deity paths add NO skill).
- [ ] 🤖 **Select text un-clipped (07-19q)** — the wizard dropdowns show their full text inside
      the box (was: pinned to Foundry's 26px form-field height).
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
- [ ] 🤖 **Malcurr-Stamped Blade OUT of the weapon picker (07-19s) — ✅ UNBLOCKED 2026-07-27v; the
      "needs the next pack rebuild" note is struck** — the 07-27u items build shipped
      `flags["edha-content"].plotItem: true` on the blade (the only item so flagged) and the picker
      filters `plotItem !== true`. **Drive it now:** open any path's weapon picker → the
      Malcurr-Stamped Blade is **absent**, while it is still present in the compendium for the table.
- [ ] 🤖 **Culture in the ancestry slot (07-19s)** — a PC with a culture and no ancestry shows the
      CULTURE's name in the header line that used to read "Ancestry" (tooltip explains the slot
      stays optional). Dragging Human on shows "Human" again, as before.
- [ ] 🤖 **Derived-stat preview on the attributes page (07-19w)** — a live panel above the
      steppers shows Health · Focus · Investiture* · the three defenses · Move · Recovery die ·
      Senses, recomputed on every +/− click ("push STR = more health and phys def", live).
      Every number mirrors the real derivation (health sums the system's advancement rules with
      STR; movement/recovery use the ceil(attr/2) ladders; *Investiture footnoted as
      attunement-gated). VERIFY against the finished sheet: finish the wizard, compare the
      panel's last numbers to the sheet's actual values — any mismatch is a formula-drift
      report (quote both numbers).
*(The **07-19v weapon slot v2** row is retired 2026-07-27v as STALE — its ×2-quantity clause is
**explicitly reverted** (the engine grants one weapon, never ×2). Its two still-live halves — the rows
LOOK pickable, and the picked weapon is kitItem-stamped so Start over / ↺ Change remove it with the kit
— were **moved into Weapon slot v3**, below, rather than dropped.)*
- [ ] 🤖 **Name field looks fillable (07-19v)** — the purse-and-name page's Name box renders as a
      bordered input, same spec as the dropdowns.
- [ ] 🤖 **Skill budget wording (07-19v)** — the L1 intro now reads "5 total (4 free + 1 your
      heroic path accounts for — a path-granted rank shows as spent)".
- [ ] ⚑ **Coin row v3 (07-19x — v2's numbers were invisible until clicked)** — v2 injected the
      editors INSIDE the system's currency-list, whose CSS collapses inputs until hover (it's a
      compact header widget) — hence letters-only at rest, numbers-only when clicked, and the
      oversized total box. Now: the equipment tab hides the native widget entirely and renders
      OUR row after it — 🪙 total pill (copper-weighted, tooltip) + three tinted g/s/c pills
      with always-visible numbers. The header strip keeps the compact native chip with the
      corrected total. Verdict on the look still wanted.
- [ ] 🤖 **Finish = long rest + top-up (07-19x, belted 07-19y)** — Finishing the wizard runs a
      silent `longRest`, then re-reads the maxes a beat later and tops up anything that lagged
      (bench: 10/11 — a max-health AE bonus can settle after the rest reads max), Investiture
      included (the system's rest doesn't touch it). Confirm the finished PC reads FULL on all
      three bars with no rest dialog.
- [ ] 🤖 **+1 max health SOLVED-pending-confirm (07-19z)** — a BRAND-NEW ＋ actor showed 10/11
      before any picks, and at that moment only the basic-action copies exist: a shipped
      action carries an auto-applying (transfer) Active Effect touching max health. Action
      copies now land with transfer-AEs STRIPPED (kits own Edha onboarding; use-time AEs
      stay), and opening the wizard on an existing PC strips them from its action items
      (console logs what it removed). Confirm: fresh actor = 10/10 at STR 0, and the repair
      log names the culprit action — paste its name for the delta.
- [ ] 🤖 **Path training rank (07-19z)** — after picking a heroic path, a "path training"
      dialog grants +1 rank in one of the PATH'S skills (list read live from the cosmere
      heroic-paths pack's linkedSkills). The skills page then shows 1 of 5 spent — the
      "+1 from your heroic path" is finally automatic, not honor-system. Start over and
      ↺ Change heroic hand the rank back (no stacking on redo). If the dialog says the list
      isn't readable, say so — the fallback is the old by-hand rank.
- [ ] 🤖 **Wizard fits the screen (07-19z)** — every wizard window opens fully on-screen; tall
      pages scroll inside the dialog instead of clipping past the bottom.
- [ ] 🤖 **Expertise rows un-overlapped (07-19z)** — the pick-2 dialog's prose sits beside the
      checkbox, never over it.
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
- [ ] ⚑ **Preview panel centered (07-19y)** — the derived-stat box on the attributes page is
      centered ("90% of the way to clean design" — say what the last 10% needs).
- [ ] 🤖 **Sheet budget bar says 5 skill ranks (07-19y)** — the header's "Skill rnks" chip now
      uses the Edha budget (5 at L1, +2/level) instead of the system table's 4 — a
      correctly-built L1 PC reads 5/5, not -1/4.
- [ ] 🤖 **No expertise stacking on redo (07-19u)** — Start over (or ↺ Change on the country
      page) wipes the origin expertises the picker granted (stamped at pick time; hand-added
      ones survive) — re-picking the same nation then asks for a clean 2. AND the picker now
      counts already-known entries toward the pick: re-adding a culture whose origins you
      somehow still know asks only for the difference (0 needed = no dialog, just a toast).
      Was: linger + forced re-pick = four expertises.
- [ ] 🤖 **ONE Unarmed Strike (07-19t — root-caused off Ben's console paste)** — both copies
      were weapon-type with `src: null` = locally CREATED: the shipped basic actions carry
      their own add-to-actor grant-items events that deliver the unarmed WEAPON, and the batch
      create fired them concurrently — the system's name-dedup raced itself (the duplicate-Key
      race, one layer down). Now: actor-lifecycle events are stripped from the action copies,
      and the weapon is granted deliberately once (matched by `system.id === "unarmed"`, so
      real doubles like the Agent's two Knives are never touched). Re-test: a fresh ＋ Edha
      Character has exactly ONE Unarmed Strike; re-opening the wizard on the OLD actor heals
      its double automatically (toast) and grants one if missing.
- [ ] 🤖 **THE PICK-2 v2 — our dialog now** — after Choose on a country: the pick dialog lists
      that nation's OWN origin entries with their prose (NOT the Rosharan registry list),
      enforces exactly 2, already-known entries show checked+disabled, and a chat card records
      the picks. **Ashkar chains two dialogs** (one other nation's cultural expertise, then one
      road-life entry). Cancelling mid-pick leaves the options readable on the culture card
      (add by hand). The wizard waits for the picks before showing the heroic page.
- [ ] 🤖 **Keys granted ONCE** — heroic and leyline pages grant path + Key (+ kit on heroic) with
      NO duplicates (07-19 fail: Vigilant Stance ×2 / Red Leyline Attunement ×2 ate the
      budget — the wizard no longer grants Keys at all; the path item's own event does). A PC
      carrying the old duplicates: Start over clears them.
- [ ] 🤖 **@UUID links render** — the heroic page's description shows real clickable content links
      (was raw `@UUID[Compendium…]` text); clicking one opens that sheet in front and the
      wizard doesn't fight it.
- [ ] 🤖 **Deity page v2** — 🌿 **Browse the tree** opens the deity's tree read-only (talents tab,
      unbound — no picks possible); ☀ **Note as faith** stamps a flavor-only flag that shows on
      the welcome checklist and the finish card ("faith: X (unattuned)"); Choose still grants
      the path for tables that start attuned; Skip stays default.
- [ ] 🤖 **Attributes page (mechanical half)** — six steppers, live "Spent X of 12" counter (L1;
      max 3 per attribute at L1), + disabled at cap/budget, Next writes the values onto the
      sheet. *(Split 2026-07-27w — this half only asks whether the page enforces and writes the
      numbers it currently claims, whatever those numbers turn out to be.)*
- [ ] ⚑ **Attributes page — VETO CHECK (Ben)** — are **12 points at L1 / max 3 per attribute at
      L1 / +1 at levels 3, 6, 9, 12, 15, 18** still canon? They come from the legacy
      `Character_Building_Rules.md`. Confirm, or say the real numbers — the wizard enforces
      whatever this answer is. *(Split 2026-07-27w; the enforcement half is the 🤖 row above.)*
- [ ] 🤖 **Skills page (mechanical half)** — core skills grouped by attribute + this PC's unlocked
      magic skills, one shared pool: "Spent X of 5" at L1, max rank 2, writes ranks on Next. A
      leveled Start-over PC shows the bigger budget and its already-granted ranks as spent.
      *(Split 2026-07-27w — enforcement and writes only.)*
- [ ] ⚑ **Skills page — VETO CHECK (Ben)** — are **5 + (L−1)×2 total ranks** and **max rank
      INT((L−1)/5)+2** still canon? Same legacy source as the attributes numbers; confirm or give
      the real ones. *(Split 2026-07-27w; the enforcement half is the 🤖 row above.)*
- [ ] 🤖 **Budget page trees v2** — "Open the X tree" opens the ACTOR'S tree (path sheet, talents
      tab) with nodes actually selectable (was: the compendium tree, nothing clickable), and
      the wizard stays behind it while you pick.
- [ ] 🤖 **Kit idempotency re-test** — now testable without the duplicate-Key noise:
      `edha.grantStartingKit(actor, "Hunter")` twice — second call info-toasts, grants nothing;
      `{force: true}` re-grants.
- [ ] 🤖 **Player client v2** — a player runs the FULL new walkthrough (map pick, pick-2
      dialogs, attribute/skill writes, faith note) from their own sheet: all writes are
      owner-side — confirm no permission errors.

- [ ] 🤖 **Map picker shows the redrawn map** — after deploy: the Where-are-you-from step shows
      the new map art (Goldenport wash running the whole west coast is the giveaway) and the
      map is not stretched or letterboxed (the asset aspect changed with the new canvas).
      ⛔ **CONTRADICTS "Map v3: label-free" — one of the two must be retired; see the defect row
      in the wizard section above. The aspect clause is already answered (0.7513 == canvas aspect).**
- [ ] 🤖 **Redrawn polygons hit the right nations** — click near the touchy borders: the
      Goldenport coastal strip (formerly Kettavar/Lunavar), the Vorsk/Lunavar mountain line,
      Malcurr's lake country, the Thalendor/Corvaine river line. Hover names must match the
      wash colors; Sylvaneth island still clickable.
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

- [ ] 🤖 **Cultural expertise grant** — drag a culture (say Corvaine) onto a test PC: the
      **Corvaine** cultural expertise appears in the sheet's expertise list.
- [ ] 🤖 **Pick-2 on a raw drag (07-19p rewire — needs the same rebuild)** — 07-19 bench
      ANSWERED the old row: the native `pick:true` dialog offers the system's ROSHARAN
      registries and ignores our lists entirely, so the pick events now use our
      `edha-pick-expertises` handler. Dragging a culture straight onto a PC (no wizard) fires
      the same per-nation dialog as the wizard's country page — including Ashkar's chained
      double pick. Report here only if the raw-drag path behaves differently from the wizard
      path (Character-creation v2 section).
- [ ] 🤖 **Remove behavior (revised 07-19u)** — deleting the culture item RAW from the sheet still
      removes only the cultural expertise (Roshar-mirror). But the WIZARD's Start over and
      ↺ Change now also wipe the origin expertises the picker granted (they're stamped on an
      actor flag at pick time; hand-added expertises always stay) — Ben's 07-19 report: the old
      linger + a forced re-pick stacked to FOUR.
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

- [ ] 🤖 **Currency rows render and edit** — on relaunch every character gets Gold/Silver/Copper
      rows seeded (console logs the count); enter amounts, reload, they persist. ⚑ confirm the
      row ORDER reads gold → silver → copper (we control the array order now) and note whether
      the unseeded spheres block still shows a dead row (that's the last spheres question).
- [ ] 🤖 **The mirror** — Edha Items now holds 102 items in 4 folders; spot-check Sidesword
      (price reads in s/g, damage/traits intact) and one equipment piece. `_meta._review` in
      `data/items.json` lists 13 Roshar-flavored entries (crem, sphere lantern, infused gem…) —
      prune or re-flavor at your leisure; deleting the entry re-prices nothing else.
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

- [ ] 🤖 **Devastating Blow is takeable with one Combat Training** — re-drag Devastating Blow (or
      test on the tree): its prereq now points at the WARRIOR tree's Combat Training. ⚑ the
      same-named prereq may still LIST twice (tree edge + prose) — both should read satisfied
      together; report if one still shows unmet.
- [ ] 🤖 **Hardy grants max HP** — now testable (was blocked by the prereq bug): +1 max health per
      level on add, exactly like the benched leyline copies.
- [ ] 🤖 **Clear Mind / Focused Mind raise max focus** — both now carry the Composed-shape AE:
      max focus +tier on add (current focus tops up on rest — nudge manually, as with Composed).
- [ ] 🤖 **Surefooted grants exactly +10 speed** — was +20: the derivation double-counted every
      speed AE. Verify +10 on add, base on remove. (Walking Ruin had the same latent double —
      if a Green PC has it, spot-check its number too.)
      ✅ **THE WALKING RUIN CLAUSE IS PROVEN — narrowed 2026-07-27v.** Bench run 4's **2bY-8** toggled
      Walking Ruin on/off and read a **+10 ft Speed AE** (trail patches while on, zero after off), so
      the latent double is dead on that talent. ⛔ **What remains is Surefooted's own number**: add it
      to a PC → **+10**, remove it → base.
- [ ] 🤖 **Stances toggle and exclude — NARROWED 2026-07-27v** — ✅ **enter, swap and the toast are all
      proven** (bench run 10's CAE cluster spot: Practiced Kata auto-entered Vigilant Stance at all
      three combat starts, and stances **replaced each other** with the toast naming what ended —
      "(Stonestance ended)"). ⛔ **The one unrun clause is the third**: use the **active** stance again
      → it **leaves** it (no stance active, marker gone). Try Vigilant Stance ↔ Flamestance on the
      Warrior. *(The stances' mechanical riders — Vigilant's cost discount, Flamestance's Intimidation
      advantage — are NOT yet wired; the marker is the state they'll key off, §9j.)*
- [ ] 🤖 **New PC token defaults** — create a fresh test character: its token name shows on hover
      to everyone, and its vision range matches Senses Range (AWA 0 → 10 ft … 5+ → 30 ft) in
      the cosmere "sense" mode. ⚑ Then run `edha.fixPcTokens()` in the console (GM) once — it
      retrofits Test / Test Warrior and their placed tokens the same way.
- [ ] 🤖 **Raising AWA extends sight** — bump a test PC's AWA: prototype AND placed tokens' vision
      range follows (GM client applies it).
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

- [ ] 🤖 **Spheres row hidden** — no spheres chip anywhere on a PC sheet (header strip or
      equipment tab); adversaries untouched.
- [ ] 🤖 **g/s/c editor** — the equipment tab's currency area shows three editable g/s/c
      inputs; typed amounts persist across F5/relaunch; the read-only "edha coin" total keeps
      showing the system's derived roll-up beside them.
- [ ] 🤖 **Purse flows move the silver box** — kit grant (+5 s), Start over (−5 s), and the new
      ↺ Change on heroic (−5 s) all visibly move the SILVER input.

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
- [ ] 🤖 **Sheet button** — open a world adversary's sheet: a "⟳ Sync from Pack" bar sits under
      the header; clicking it toasts the item/token counts and the sheet re-renders current.
- [ ] 🤖 **Placed-token push** — a token placed BEFORE the deploy shows the 07-17c vision model
      (visionMode "sense", attenuation 0.1) after sync, without being re-placed.
- [ ] 🤖 **State preserved** — damage a placed adversary token, sync: it keeps its HP and position;
      the WORLD actor (sidebar copy) resets to full like a fresh drag.
- [ ] 🤖 **Renamed copies skipped** — rename a world copy (e.g. "Roek Alpha") → bulk sync skips it
      and the console lists it under `skipped`; its own sheet button still syncs it.
- [ ] 🤖 **Hand-added items survive** — add an item by hand to a world adversary, sync: the item
      is still there (pack-built items were replaced around it).
- [ ] 🤖 **Stale duplicates healed — NARROWED 2026-07-27v** — ✅ **the sync half is proven**: the
      **world-wide** adversary sync Ben authorized ran at bench run 11 — **46 synced, 0 skipped**, with
      all 87 actors snapshotted (ids, flags **and** full effect objects) beforehand and **post-sync
      effect drift NONE**. So "one bulk sync brings every world copy current" is established at scale.
      ⛔ **What remains is only the READ**: open the old duplicate Corvaine Raider actors in the sidebar
      (the 07-17c gotcha) and confirm **all five** now show the weapon-type Shortsword. Same residue as
      the "Shortsword on the CURRENT Raider" row below — do them together.

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
- [ ] 🤖 **Spearing Beak rolls from the icon** — on a SYNCED (or re-dragged) Mistheron, click the Beak's icon:
      one card with the d20 Heavy Weaponry test (+5) AND the 1d8+2 keen damage + graze line.
      Against a believer in its seeming the damage shows `+1d6[Spearing Beak]`; against anyone
      else (or with no seeming up) there is NO +1d6.
*(**⚑ Damage-rider family regression** — RETIRED on evidence 2026-07-27v. The row asks for **one** other
rider talent; **three** have now rolled with a labeled bonus and no dead click, on three separate runs
and three different damage types: **"+5 keen strike"** (Pack Pressure, bench run 3 — and that one was
the premise test, its `amountFormula` edited on the document to a flat 5) · **"+2 impact strike"**
consuming its arm (Momentum of Victory, bench run 7) · **"+8 vital strike"** (Withering Touch off a real
Sidesword hit in combat, bench run 15). The graze-clone guard covers the family.)*
- [ ] 🤖 **AoE burst auto-target** — place any burst (e.g. Flame Surge): the caught tokens end up
      actually TARGETED (this retarget had been silently no-opping on v13).
- [ ] 🤖 **Seeming recast replaces the token** — cast The Seeming, then recast while the copy still
      stands: the OLD copy token disappears, exactly ONE new copy token appears (they used to
      stack invisibly on the same square), and the believer sweep re-runs.
- [ ] 🤖 **Seeming copy hover-name** — hover the copy token as GM: the name shows (owner-hover,
      the same behavior as every built adversary token).
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
- [ ] ⚑ **Adversary sight range — does 10 ft feel wrong? Say a number.** — with those tokens on a
      real map: adversary AWA 0 → **10 ft** is intended, but it is a **design dial**, not a bug.
      If it plays badly, give the number you want instead. *(Split 2026-07-27w; the config read is
      the 🤖 row above. Related: rulings menu — bench PCs carry the same 10 ft and it nearly caused
      a false PASS.)*
- [ ] 🤖 **Shortsword on the CURRENT Raider — NARROWED 2026-07-27v** — ✅ **the sync half is proven and
      the ownership half was already ANSWERED**: bench run 11's world-wide sync ran **46 synced, 0
      skipped, zero effect drift** across all 87 snapshotted actors, so "after the bulk sync ALL of them
      are current" is established; and GM-lore visibility is settled — with ownership "None" players
      cannot open the sheet at all, so the biography stays GM-only unless you grant Limited (which shows
      exactly the biography). ⛔ **What remains is the five-Raider READ**: open each of the five
      "Corvaine Raider" actors in the sidebar and confirm the Shortsword sits in the **WEAPONS** section
      (heavy weapon, melee) and rolls from its icon. Pair this with "Stale duplicates healed" above —
      same five actors, one pass.
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
- [ ] 🤖 **Braced status** — use a Trooper's (or the Captain's) **Brace**: the shield icon lands
      on ITS token and auto-expires after its next turn. The Frostbinder's token wears the icon
      PERMANENTLY (Predictive Ward) and it must NOT expire with combat turns.
- [ ] 🤖 **Probability Net** — target a PC, use it: that PC's next test shows `-1d6[Probability
      Net]` in the roll breakdown and the mod is consumed (their following test is clean).
- [ ] 🤖 **Cinder Coat splash-back** — melee-hit a Cinderhound: the attacker automatically takes
      1d4 Energy (card names the hound). A ranged hit from across the room must NOT splash.
- [ ] 🤖 **Bite sheds light** — a bitten creature's token starts glowing (the Kindle light rider).
- [ ] 🤖 **Frost Lance Slowed** — on a hit the victim gains Slowed automatically, expiring at the
      end of the VICTIM's next turn.
- [ ] 🤖 **Vital Diagram → Scalpel-Strike** — target a PC, use Vital Diagram: the red mark icon
      lands. Scalpel-Strike vs the marked PC shows `+4[Scalpel-Strike]` in the damage; vs an
      unmarked PC it doesn't.
- [ ] 🤖 **Suture Cradle** — TARGET a creature, use the cradle (heal rolls); every time that
      creature is then hit, the Stitchmother's Discipline auto-rolls vs DC 10+damage with a
      keep/ends card. Cradle another creature: the flag moves.
- [ ] 🤖 **Phase 2 cue** — drop the Stitchmother below 70: ONE whispered ⏰ card with the full
      transformation checklist, once.
- [ ] 🤖 **Turn cues** — Glyph Pulse: end of the Living Lock's turn on round 2/4/…: the adjacency
      card; odd rounds quiet. Reactive Strike: an enemy starting its turn within reach of the
      Captain: one whispered card (not one per action).
- [ ] 🤖 **Stalker Fade cue** — damage a Stalker: the graze-or-miss reminder card (once/round).
- [ ] 🤖 **Devastating Blow cue** — on ITS hit: the margin-Prone reminder; on other attacks: none.
- [ ] 🤖 **edha-gm-cue registration held** — console shows no DataModelValidationError for any
      adversary item on world load (the 07-16 morning build shipped cue rules with the handler
      type unregistered — this deploy carries the registration; if cues are silent, THIS is the
      first thing to check).

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
- [ ] 🤖 **2bAB-4 — Guiding Signal — The Reckoning, Bellwether AND Callthief** — use it on each → The designate marker lands (White Attunement Range at role rank) and the raise-the-stakes note posts — the use used to resolve nothing.
- [ ] 🤖 **2bAB-5 — Whispered Doubt — Tollbird Flock** — an enemy of the flock spends focus within its Black range → It loses 1 MORE focus, announced, once per round per enemy — the watch is on the item now.
- [ ] 🤖 **2bAB-6 — Rootling Swarm — Grasping Vines + Territorial Instinct** — use each on a targeted character → Vines: Green vs Physical auto-resolves → Restrained on a success. Instinct: Green vs Survival through the contest core → Immobilized; the turn-start cue still posts as the floor.
- [ ] 🤖 **2bAB-7 — Tussock-Sow — Drive the Prey** — use it on a targeted character → Green vs Survival through the contest core; Slowed on a success; the move-away stays GM-narrated per the card note.
- [ ] 🤖 **2bAB-8 — Stitchmother — Adaptive Mutation + Reknit Form** — target a thrall, use Mutation; then use Reknit Form → Mutation posts the two-graft chooser (+2 keen / 2-vital venom, no third option) and the bonuses ride the thrall's Slam. Reknit posts the injury picker; the buttons charge NOTHING extra (her card's flat 1 Inv + 1 Focus already paid).
- [ ] 🤖 **2bAB-9 — Reeve-Owl — Sovereign of Solitude** — target the moving Weakened creature, use it → Immobilized lands, Black vs Spiritual auto-resolves, and a success rolls 1d6 vital — the cue's "use the item to auto-resolve" promise is true for the first time.
- [ ] 🤖 **2bAB-10 — Surecat — Intercept** — use it with the Forewarned creature targeted → The confirm card posts; confirming puts disadvantage on that creature's next test. The turn-end cue still posts.

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
- [ ] 🤖 **Fire the Wrack places the region** — using the action click-places a 10-ft RED burning
      Region; entering it / starting a turn in it auto-deals 1d6 energy (system damage card, no
      GM math).
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
- [ ] 🤖 **Pyre spread card BY ALIAS** — at the end of the CINDERBROCK's turn with a patch on the
      scene: the whispered spread card fires, labeled **Fire the Wrack** (not "Pyre"), with
      working Spread + Extinguish buttons. A PC Destruction player's own Pyre zones must still
      spread separately (alias must not cross owners — sourceOwnerUuid check).
      *(2026-07-28 bench run 17 — **BLOCKED downstream of the row above, row stays 🤖.** The spread
      watcher keys on a Region stamped `spreads` by the placer, and the Cinderbrock cannot place one
      at all while `edha-pre-use` has no dispatcher. Re-drive this the moment that fix lands.)*

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
- [ ] 🤖 **Overwhelming Authority** **— a 30-second re-drive, kept deliberately (2026-07-27v)** —
      after the callthief succeeds on an influence test: the target is marked **Disoriented** by the
      ability's own `edha-prompt-pick` + `edha-triggered-effect` rules. *(Its PC twin **2bJ-13** retired
      at bench run 2, but that retirement is a **bare line with no card quoted**, so this adversary copy
      is not actually evidenced anywhere. Drive it once on a FRESH pack import and quote the card.)*
- [ ] 🤖 **Take the Answerer on-hit cue** — damage lands → whispered GM card with the
      "+1d4 if Disoriented" note (no card on a miss).

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
- [ ] 🤖 **Held Oasis belief test** — its FIRST attack against each target: engine rolls
      Perception vs Cognitive 12 (NO advantage — its mirage is good, unlike Hull-Shadow's);
      failure marks them fooled; no re-roll on the second attack.
- [ ] 🤖 **Glare-Strike fooled rider** — vs a fooled target the energy damage gets +1d6
      (flavor-labeled); unfooled, it doesn't.
- [ ] 🤖 **Kindle (+3 energy rider, ruling 122 re-dice)** — every energy hit adds +3 (boss role rank as Red
      modifier) via the damage-rider rule; the shed-light/lose-concealment half rides the **same rule's
      own `lightRadiusFt: 5` field** (the "name-keyed engine path" wording is struck 2026-07-27v — there
      is no such path) — verify both fire on one hit. *(The field's PRESENCE is confirmed in the shipped
      data; what is unrun is whether a bitten creature's token actually starts glowing.)*
- [ ] 🤖 **Afterburn opportunity prompt** — after an energy hit, targeting the creature and
      accepting the prompt applies Afflicted [half 1d8 energy — ruling 122 re-dice]; Opportunity is TRUSTED (no
      auto-deduct anywhere).
- [ ] 🤖 **Heat of the Flats cue** — hostile starts its turn within 10 ft → the whispered
      1-focus card fires. *(Split 2026-07-27w — the cue itself is drivable; the shade question
      is the ⚑ row below.)*
- [ ] ⚑ **Heat of the Flats — when does SHADE negate the glare?** — the cue has no shade
      clause and no hook could give it one; it is a table read. Say what counts as shade
      (a wall? any cover? only a roofed square?) so the card can carry the answer.
      *(Split 2026-07-27w.)*
- [ ] 🤖 **Gone Into the Shimmer cue** — first drop below 24 HP (half of 48): whispered
      withdrawal card, no re-fire.

## 3. Dirgehound Pack (rival ×3 — the Dread Presence veto's first bestiary reuse)
*(**Dread Presence VETO on an adversary owner** — retired 2026-07-27v as STALE: it is the **W28 headline
row that W29 §0 explicitly re-tests** ("RE-TEST of the W28 headline row" — it was DEAD before the
ruling-113 owner-scan widening, because the scan skipped adversary owners AND unlinked token copies).
**Keep W29 §0's row**, which is the same test on the current engine.)*

- [ ] 🤖 **Unnerving Approach** — on moving adjacent, the push→Isolated path fires as it does for a PC.
      *(It carries its own `edha-prompt-pick` + `edha-push` + `edha-note` rules — the "(name-keyed)"
      label is struck 2026-07-27v.)*
- [ ] 🤖 **Predatory Patience test rider** — attack vs a Weakened target (target first):
      +1d6 injected on the d20 test (ruling 122 re-dice); no rider vs un-Weakened.
- [ ] 🤖 **Predator's Due on-defeat** — a dirgehound kill: +1d6 health engine-applied to it (ruling 122 re-dice)
      + whispered card for the 1 Focus (GM adds — adversary focus has no auto-write).
- [ ] 🤖 **Worry the Straggler on-hit cue** — damage lands → whispered "+1d4 if Isolated/
      Weakened" card.
- [ ] 🤖 **Loadout sanity (numbers)** — read the shipped block: **count 3, hp 14 each**.
      *(Split 2026-07-27w — a data read, the same one that retired the other Loadout-sanity rows.)*
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

## 0. Engine — the owner-scan widening (ruling 113; fixes a shipped W28 bug)
- [ ] 🤖 **Dread Presence veto from the Dirgehound Pack** — RE-TEST of the W28 headline row:
      it was DEAD before this fix (the scan skipped adversary owners AND unlinked token
      copies). A Weakened character within 30 ft of a placed dirgehound tries to move
      closer to an ally → the preUpdateToken veto blocks with the engine's message.
      *(This row now also carries the Canticle §3 W28 original, retired into it 2026-07-27v.)*

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
- [ ] 🤖 **Sapping Hex on-hit** — Stoop hits an Isolated character → Weakened applied by
      the engine (timed status; nothing on a non-Isolated hit).
- [ ] 🤖 **Predatory Patience rider + cue** — attack a Weakened target: +1d6 on the test (ruling 122 re-dice);
      on the hit, whispered 1-Focus-regain card.
*(**Sovereign of Solitude use** — retired 2026-07-27v as STALE: **superseded by 2bAB-9**, the Reeve-Owl
row that drives the same ability on the current wiring — "Immobilized lands, Black vs Spiritual
auto-resolves, and a success rolls 1d6 vital — the cue's 'use the item to auto-resolve' promise is true
for the first time". Keep 2bAB-9.)*

- [ ] 🤖 **Cruel Step executor** — use with an Isolated target: 10-ft glide, no Reactions;
      refuses without an Isolated target.
- [ ] 🤖 **Cues** — Bailiff's Eye reminder at hostile turn-start; bloodied break-off card.

## 2. Crownox Ring (White rival ×3 — the wall)
- [ ] 🤖 **Unbreakable Line ally-drops cue — NOW COVERS BOTH BLOCKS (2026-07-27v)** — a ring-mate would
      drop → whispered 3-Focus card; the White test resolves through the contest core on use.
      ⚠️ **This row is the ONLY Unbreakable Line coverage in the file.** The Ashkar §4 duplicate (The
      Reckoning, "when a pack-mate drops within 5 ft … test White DC ½ damage to hold at 1") was
      retired into this one — **the ability has never been benched on either block**, so do not read the
      merge as evidence. Drive it on the Crownox and, if the wording differs, on The Reckoning too.
      *(It was NOT among the seven restored 07-26j rules that printed real numbers at bench run 3.)*

*(**Retributive Guard** — RETIRED on evidence 2026-07-27v, bench run 3, on a **FRESH pack import** with
three unlinked ring tokens (this is **2bAB-3**): the retaliate **prompt posted by itself from the
damage**, one per adjacent ring-mate; the click ran **White vs Spiritual through the contest core** and
dealt "**3 spirit**" — of which 2 were absorbed by the attacker's Warlord Temp HP, a clean cross-talent
interaction that also proves the damage really landed.)*

- [ ] 🤖 **Ring behavior rows (the two wired clauses)** — Guardian Stance gives +1 Deflect while
      adjacent (sheet note), and going bloodied fires the ring-TIGHTENS cue.
      *(Split 2026-07-27w.)*
- [ ] ⚑ **Crownox — where does a ring stop being a ring?** — an ox pulled 10+ ft "loses the wall
      kit", but nothing enforces or measures that and no hook exists for it. Say the rule you
      actually want at the table (a distance? a broken adjacency chain? GM eyeball?) and it can
      go in the card text. *(Split 2026-07-27w.)*

## 3. Rootling Swarm (Green minion ×3 — "the Snare")

*(**Grasping Vines** and **Territorial Instinct** — both retired 2026-07-27v as STALE: **superseded by
2bAB-6**, which drives the pair on the current wiring — "Vines: Green vs Physical auto-resolves →
Restrained on a success. Instinct: Green vs Survival through the contest core → Immobilized; the
turn-start cue still posts as the floor." Keep 2bAB-6.)*

- [ ] 🤖 **Bloodied scatter cue**.

## 4. Briar-Gone Grove (Green boss — "the Closing Arena")
- [ ] 🤖 **The Briar Rises** — Draw Mana click-places a briar square (embedded Green Key).
- [ ] 🤖 **Thorn Field** — engine-placed patches deal half 1d8 keen via the region hazard (ruling 122 re-dice)
      automatically; hand-placed maze gets the turn-start cue instead.
- [ ] 🤖 **Sudden Growth burst** — use → click-place difficult terrain near a sensed
      character (the real edha-burst rule).
- [ ] 🤖 **Spreading Roots cue** — character starts its turn in briar → whispered 1-Focus
      spread card.
- [ ] 🤖 **Register cues** — bloodied: stops targeting downed; 0 HP: goes still, not dead.

## 5. Tollbird Flock (Black minion swarm)
- [ ] 🤖 **Sapping Hex on-hit** — mob hits an Isolated character → Weakened (engine).
- [ ] ⚑ **Swarm bookkeeping** — half damage from single-target Strikes, scatters on AoE
      (GM-run; NO NAMEABLE HOOK per the Wake-Eel precedent) — sanity-read at the table.
- [ ] 🤖 **Bloodied re-settle cue**.

## 6. Surecat (Blue rival — the foresight duel; Ben's logged Blue exception)

*(**Forewarned turn-end cue** — retired 2026-07-27v as STALE: it **overlaps 2bAB-10**, which drives
Intercept "with the Forewarned creature targeted" and explicitly re-asserts "the turn-end cue still
posts". Keep 2bAB-10; this row asked the same thing from the other end.)*

*(**Redirect Momentum use** — RETIRED on evidence 2026-07-27v, bench run 14, on a **FRESH pack
import** (this is **2bF-17**): "Redirect Momentum: **18 vs Bench Target — Undefended's ATH 7 —
SUCCESS**" — it rolled Blue, rolled the TARGET's Athletics, and printed the same `Blue N vs ATH M`
shape as the PC talent 2bF-3, plus its documented "no payload rule — resolve at the table" half.
The "(name-keyed engine path)" label was false and is struck.)*

- [ ] 🤖 **Pounce rider cue** — on-hit whispered "+1d4 if they did the declared thing".
- [ ] 🤖 **Bloodied leave cue**.

## 7. Brandram (Red rival — the charge)
- [ ] 🤖 **Momentum's Edge rider** — Ram after moving ≥20 ft toward the target this turn:
      +2d4 impact, engine-measured via the turn-start position stamp (first ADVERSARY
      consumer of whenMovedTowardFt). No rider on a standing hit. (Rate is Ben-ruled +2d4,
      ruling 113 — the PC card's +Speed stands for PCs.)
- [ ] 🤖 **Shockwave Slam push** — melee hit pushes up to 10 ft; collision deals half 1d4
      impact (the real edha-push rule).
- [ ] 🤖 **Reckless Advance / Unstoppable executors** — use → 10-ft no-Reaction charge;
      Fast-turn damage → free half-Speed move (once/turn).
- [ ] 🤖 **Bloodied withdraw cue**.

## 8. Tussock-Sow (Green rival — "the Closing Arena", mobile)
- [ ] 🤖 **The Wrighting** — Draw Mana click-places churned mire (embedded Green Key).
- [ ] 🤖 **Sudden Growth burst / Spreading Roots cue** — as the grove's rows, in mire key.
*(**Drive the Prey use** — retired 2026-07-27v as STALE: **superseded by 2bAB-7**, which drives it on
the Tussock-Sow against the current wiring — "Green vs Survival through the contest core; Slowed on a
success; the move-away stays GM-narrated per the card note". The "(name-keyed engine path)" label was
false. Keep 2bAB-7.)*

- [ ] 🤖 **Bloodied stand-ground cue**.


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
- [ ] 🤖 **Shockwave Slam** — on a melee impact hit, target pushed [Size] ft; a wall collision
      deals half 1d6 impact (edha-push).
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
- [ ] 🤖 **The Doubling ambush-belief** — first strike per target: engine-rolled Perception vs
      cog 13; on a fail the target is "fooled".
- [ ] 🤖 **Raking Grasp fooled-rider** — vs a fooled target the Grasp adds +1d6 (reads the
      Doubling ledger; both halves present, not orphaned).
- [ ] 🤖 **Predatory Patience** — +1d6 test-rider vs a Weakened target (target first) + on-hit
      whispered Focus card.
- [ ] 🤖 **Walk Out of the White** — damaged → whispered Reaction card (1 Focus, 10 ft unseen).

## 2. The Doubled Elder (boss, tier 2 in the tier-1 hp band, Black/Blue)
- [ ] 🤖 **The Seeming (full loop, name verbatim)** — 1 Action: copy token beside the elder,
      1 hp, per-enemy engine-rolled belief sweep, client veil; breaking it fires the
      seeming-break cue.
- [ ] 🤖 **Raking Grasp fooled-rider** — +1d8 vs a target fooled by EITHER the Doubling ledger
      or the Seeming (edhaTargetFooled reads both).
*(**Dread Presence veto** — RETIRED on evidence 2026-07-27v, bench run 14 (**2bZ-10**), driven as its
own isolated case rather than assumed from the Alpha's: **the Doubled Elder isolated at 25 ft** with the
Cragdrake Alpha parked 105 ft away → the move was **blocked** with the same toast. **CONTROL — both
owners parked >100 ft** → the identical move **succeeded** (x 9300→9600) with **no toast**. Each copy
vetoes off its own rule, and the range gate is real. Card text reads 60 ft, authored right.)*

- [ ] 🤖 **Predatory Patience** — +1d8 vs Weakened + Focus cue.
- [ ] 🤖 **Walk Out of the White** — fires on BOTH damaged and seeming-break triggers.
- [ ] 🤖 **Never a Corpse bloodied cue** — at half HP: whispered withdrawal card.

## 3. Cullwolf Pack (minion ×4, Black)
- [ ] 🤖 **Severance vital-convert** — THE headline test (first bestiary Severance): a bite
      against an **Isolated** character (no ally within 5 ft) applies **vital** damage
      (bypasses default Deflect); vs a non-Isolated target it stays keen.
- [ ] 🤖 **Predatory Patience** — +1d4 test-rider vs Weakened (minion rank-1 die) + Focus cue.
*(**The Tithe Takes the Failing** — RETIRED on evidence 2026-07-27v: the shipped block carries
**`rules = 0`, `effects = 0`** on it, with its own `NO NAMEABLE HOOK` rationale. Nothing exists that
could automate it, which is exactly what the row asked.)*

## 4. The Cull-Alpha (rival, Black)
- [ ] 🤖 **Severance vital-convert** — as the pack's, at rival numbers.
- [ ] 🤖 **Predator's Due on-defeat** — reducing a character to 0: +1d6 health engine-applied
      + whispered Focus card.
- [ ] 🤖 **Waits for the Failing bloodied cue** — at half HP: whispered withdraw-and-watch card.
- [ ] ⚑ **ART BACKLOG, not a test** — placeholder icons on all four Kettavar blocks (silhouette / wolf-shadow reuse). Tracked in `EDHA_ADVERSARY_ART_WISHLIST.md`; nothing to bench. *(Re-labelled 2026-07-27w.)*
