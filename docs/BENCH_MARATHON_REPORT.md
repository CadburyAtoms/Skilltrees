# Bench marathon 2 — report (2026-07-27/28)

**5 bench runs (11–15) · 3 fix passes · 18 commits · 41 rows retired on evidence · 8 defects found,
7 fixed, 7 re-tested at the table · 3 new build gates · engine tests 298 → 325.**

Marathon 1 ended blocked: four pack rebuilds' worth of fixes were stranded in the repo and
`BENCH_NEXT_RUN.md` carried a hard `⛔ STOP`. Ben cleared it by running `deploy-to-foundry.bat` and
creating a passwordless player user, **`PlayerBench`**. This marathon opened by finishing the deploy
*inside* Foundry — the steps the `.bat` cannot do — and closed the player-client window, which had
been unbenchable in every solo pass since the project began.

> **Predecessor:** marathon 1's report is at `e490ba1:docs/BENCH_MARATHON_REPORT.md`. Its rulings
> batch was never answered and is **carried forward in full** in §3B — it was not lost in this
> rewrite.

---

## 1. Per-section disposition

Bench scope: **68 open → 47 open**. Of those 47, **33 are ⚑ (yours by nature)** and **2 are
BLOCKED-ON-DEPLOY**, leaving **12 genuinely agent-runnable rows** in the whole `# BENCH —` corpus.
Whole checklist: **324 → 294**.

| Section | Start | End | ⚑ now | Runnable now |
|---|---|---|---|---|
| Engine-wide & cross-tree | 16 | 11 | 8 | 3 |
| White (leyline) | 4 | 3 | 3 | 0 |
| Blue (leyline) | 5 | 3 | 3 | 0 |
| Black (leyline) | 5 | 4 | 4 | 0 |
| Red (leyline) | 4 | 4 | 2 | 2 |
| Green (leyline) | 4 | 4 | 2 | 2 |
| Destruction (Razkael) | 2 | 1 | 1 | 0 |
| Chaos (Maelith) | 1 | 1 | 1 | 0 |
| Death (Morrath) | 2 | 2 | 1 | 1 |
| Civilization (Kethane) | 2 | 2 | 1 | 1 |
| Knowledge (Gnothis) | 1 | 1 | 1 | 0 |
| Order (Tessavain) | 5 | 1 | 1 | 0 |
| Heroic paths | 17 | 10 | 5 | 3 (2 blocked) |
| Life · Fate · Sovereignty · Power | 0 | 0 | 0 | 0 |

**Why 41 retired but only 21 net off bench scope.** Run 13's 10 retirements were *player-client*
rows living in other sections (formally outside `# BENCH —`), and the fix passes **added** re-test
rows, probe rows and ruling rows as they went. Both numbers are real; neither alone is the honest
one.

**Order went 5 → 1** and **Heroic 17 → 10**. Five deity trees now stand fully retired (Life, Fate,
Sovereignty, Power, plus Order down to a single ⚑).

### NOT REACHED — your remaining worklist

Declared by the runs themselves, not inferred:

- **Green 2bS-4 / 2bS-12 / 2bS-14** — NOT REACHED. ⚠️ **CORRECTED 2026-07-27v: this was written as
  "a genuine tooling limit" and that is WRONG.** The canvas picker **can** be driven from the browser
  pane, and this marathon's own evidence says so: **2bAA-7** was retired on a **click-placed** cast
  (`click-placed in range −1 Inv; out of range created nothing and refunded; does not join
  initiative`) — a driven canvas click-placement *with* its out-of-range refusal. Run 15 hit a
  **runway** limit (time/budget), not a capability one. What these three rows actually need is a
  **turn boundary or an Opportunity**: 2bS-4 is `edha-zone-react {turn-end-in-zone}` (a character must
  *end its turn* in Green's terrain), 2bS-12's tick lands at the start of the owner's NEXT turn, and
  2bS-14 costs an **Opportunity**. Turn boundaries are drivable (`combat.update({turn})`, proven by
  2bL-10 across rounds 1 and 2); forcing an Opportunity on demand is the one genuinely hard part.
- **2bW-1 (Withering Touch)** — PARTIAL, see §2.
- Engine-wide 2bA-6, 2bM-1, the GM summon relay · Red L403/L404 · Green L438/L440 ·
  Civilization 2bV-15 (bookkeeping) · Heroic L1152/L1177/L1201.
- **2bQ-4 and 2bD-7** — were BLOCKED-ON-DEPLOY, not failed (§4). ✅ **UNBLOCKED 2026-07-27u** — Ben ran
  the heroic build and the fix is confirmed in the built pack. They need a bench drive now.

### Outside bench scope (untouched, for planning)

The wizard v2 (38), adversary ability wiring (27), the seven bestiaries (~116, nearly all ⚑),
culture items, currency, items-dump. ~247 rows. Not attempted; not in the numbers above.

---

## 2. Every defect: found → fixed → re-tested

### Carried from marathon 1 — finally closed

**Shockwave Slam (Red 2bA-5)** · found M1 run 1, **never root-caused across an entire marathon** ·
fixed `041e350` (ENGINE-ONLY) · **re-tested run 12, both controls**.

*Verified root cause:* `edhaDispatchOnHit` derived "does this rider fire only on its own hit?" from
`!!system.damage.formula` — a field about the **number printed on the card**, not about who authored
the hit. Shockwave Slam quotes a *collision* value, so it was misclassed as an attack talent and
`dealer.item !== tal` skipped it on every weapon hit. That is why direct use worked and the surface
looked dead.

*Divergence:* the original report blamed the push machinery. The push machinery was always fine.

*Fix shape:* the gate could not simply be removed — run 9 had proved Cheap Shot is its legitimate
consumer. Replaced with a per-rule `whenDealer` ("self"/"any") registered on both handler schemas, so
it is **editable on the Events tab** (rule 2b), falling back to a derivation. Pinned in
`tests/on-hit-dealer.test.js`, mutation-verified both directions.

*Table evidence:* weapon hit → target pushed 10 ft, `_source.x` 9300 → 8700, directly away.
**Negative control held: Cheap Shot still does NOT ride a weapon hit** (`stunned: false`), but does
on its own damage roll, same victim, same round. Dark Investiture unchanged.

*Family:* **two**, not one. Volatile Strike is the second member and is a **ruling**, not a bug (§3A).

### Found run 11 → fixed pass A

**Sharp Eye (2bQ-4)** · `5e65589` (**DATA — needs the heroic rebuild**) · ⏳ **not yet re-tested**.

*Verified root cause, proven rather than inferred:* the system computes
`rollRequired = activation.type === "skill_test" || hasDamage`. Sharp Eye was `utility` with
`damage.formula: null`, so it took the else-branch — posted the card, fired `useItem`, and **rolled
nothing**; H1's `edhaQueueContest` entry waited for a d20 that never came and expired at TTL.

*Divergence:* the dead `prc` skill key was real and had already been fixed — but it was **not the
whole cause**, which is why the row still failed after the rebuild that was supposed to fix it.

*Family:* one talent in authored data, but **the second instance of the defect shape** — 07-26j found
the identical failure in six adversary abilities and fixed it in `advItemDoc`, which never touched the
talent surface. Hence the gate below. **2bD-7 is blocked behind this.**

### Found run 13 (player-client) → fixed pass B

**The refund race (2bAA-8)** · `3f25f9f` (ENGINE-ONLY) · **re-tested run 14, both controls**.

*Symptom:* Phantom Double's out-of-range refusal left Investiture wrong **in both directions** —
4 → 2 and 3 → 4.

*Verified root cause — structural, not incidental.* Three lines of cosmere-rpg 2.1.0 `Item#use()`:
the cost deduction is pushed onto `postRoll` as an **un-awaited absolute** `actor.update(...)`
computed up front; the last `postRoll` entry is `Hooks.callAll(HOOKS.USE_ITEM, …)`; and
`postRoll.forEach(a => a())` runs the whole list in **one synchronous tick**. The refund's re-read is
therefore stale *by construction*, and which write lands second decides the sign of the error.

*Divergence:* the bench's mechanism was right; what it lacked was that **there is no resource API to
defer to** — every resource write in the system is a raw absolute `actor.update`, and
`modifyTokenAttribute`'s `isDelta` resolves to an absolute from a client-side read. So neither "use a
delta write" nor "use the system's API" was available. The fix is an **ordering** one: a generic
`preUseItem` hook snapshots pre-cost values into `EDHA_PRE_COST_RES`, and `edhaAwaitCostCharged`
waits for the charge to land before crediting.

*Family:* **29 call sites, ~8 actually racing** — this one plus the no-scene/no-token guards and
ledger-cap refusals refuse in the same tick; the other ~21 sit behind a canvas click or template
create and were correct only by that round-trip's accident. Fixed once, at the helper.

*🔬 The strongest confirmation of the marathon:* `tests/refund-race.test.js` is mutation-verified —
with the ordering removed it reproduces **2 and 4**, the bench's exact measured numbers.

*Table evidence:* out-of-range 4 → **4** and 3 → **3**. **Negative control held: an in-range cast
still charges 4 → 2 and creates the copy** — the refund did not over-fire into making every cast free.

---

**The doubled card** · `f7ff7b3` (ENGINE-ONLY) · **re-tested runs 14–15**.

*Cause:* guarded on `isGM`, not `activeGM`, so every connected GM ran it. Run 13 isolated it cleanly —
the recast **break** card *is* `activeGM`-guarded and posted exactly once under identical conditions.

*Scope was wrong — **six sites, not one**,* found by auditing all 198 hook registrations. Worst: the
`edha-zone-react {defeat-in-zone}` ignite sweep, where every GM posted the card **and dropped its own
duplicate hazard Region**. Also the summon last-token cleanup (double `actor.delete()` — the
"Actor does not exist" race the file already documents from 07-17), both barrier wall-clear doors, and
the `applyButtonsTo` world setting. The three remaining raw-`isGM` hooks are `render*` and are
**correctly** per-client.

*⚠️ Its re-test is confounded and that is not a defect.* Ben's own client is running **pre-`f7ff7b3`**
code. Run 14 proved this from the same event rather than assuming it: the recast break card, guarded
by the *older untouched* check, posted exactly **once** — so his client computes `activeGM === Bench`
and honours it; on the new engine the same designation would have suppressed his duplicate. Run 15
re-confirmed by attributing every Region and card by `userId`: **`Bench` posted exactly one at every
site.** **This retires on Ben's next F5.**

---

**The orphaned token** · `39b333f` + `d0c6ced` (ENGINE-ONLY) · **re-tested runs 14–15**.

*Verified in Foundry v13 source:* neither the client `Actor` class nor
`dist/database/documents/actor.mjs` has any dependent-token delete, so **actor → token never
cascades**; `TokenDocument._onDeleteOperation` **does** cascade token → combatant, and nothing
cascades actor → combatant — precisely the tracker-wedging tail.

*Family: three broken sites*, not one — the illusion dissipates branch (reported), the barrier
destroyed branch one screen below it, and the scene-end barrier sweep on `deleteCombat`. The
summon-dismiss paths were already correct. Extracted `edhaDeleteActorWithTokens`; five consumers share
it.

*Attempt 2 (`d0c6ced`) closed a scope miss, not a logic error:* the helper covered five **engine**
call sites but was **not a `deleteActor` hook**, so a GM hand-deleting from the sidebar — exactly what
the row's verb describes — was uncovered. Added the hook + `edhaSweepOrphanedTokens(actorId)`.
**Mint scope is exact, not heuristic:** `Actor.create` appears twice in the whole engine, only
`edhaSummonCreateGM` mints NPCs, and it always stamps `flags.edha-content.summon = true`.

*Table evidence (run 15):* actor deleted → token gone, combatant gone, tracker not wedged. **Three
negatives held** — token-delete still deletes the actor exactly once; a pack-imported adversary **and**
a character-type actor each kept their tokens, zero `deleteToken` events. The cascade provably cannot
reach a PC.

### Found run 14 → fixed pass C

**The hazard-Region flag vocabulary split** · `b4841d6` (ENGINE-ONLY) · **re-tested run 15**.

*Verified root cause:* the engine had grown **two spellings for "who owns this dangerous terrain."*
`edhaPlaceHazardRegionGM`, the burst path and green terrain stamp nested `terrain: {ownerUuid, color}`;
`edhaPlaceHazard` — the handler behind **Pyre**, Walking Ruin's trail rule and Fire the Wrack — stamped
a **flat** `sourceOwnerUuid`. `edhaOwnedTerrainRegions`, the spine behind `edhaTokenInOwnedTerrain`
(which gates the **entire** `defeat-in-zone` sweep), `edhaEnemiesInOwnedTerrain` and Pack Sense, reads
only the nested one. **Nothing failed loudly — the gate simply never opened**, so
**Combustion Chain could never fire off a Pyre zone**: the canonical Destruction pairing.

*Two reported defects were one.* "The ignite site never fired at all" **is this bug** (the site is
`edhaTokenInOwnedTerrain`; the victim fell in a Pyre zone) — and it is **not a regression from fix
pass B's gate change**: `edhaDefBuffGmGate()` demonstrably returned true, since the same site doubled
on the Walking Ruin control. A first sighting of a defect that predates it.

*Fix:* converged on the nested shape; `edhaTerrainOwnerUuid()` is now the only function that knows the
flag. The legacy flat key survives as a **read** arm placed in the spine (not the spread watcher), so
any stranded live Region is understood by every consumer at once — the live world could not be read to
confirm (Foundry running, LevelDB locked) and run 14 reports 1 Region in the world.

*Family matrix:* **6 placers, 9 readers, one crossed pairing.** Snare and fortified namespaces are
self-consistent. Noted-not-fixed: `edhaFateCreateSnareRegionGM` writes a flat `owner` flag nothing
reads — a **dead write**, not a crossed one.

*Table evidence:* Pyre zone → foe to 0 HP inside it → 🔥 card, a fresh 10 ft hazard Region on the body,
and the spread button. **Load-bearing negative held: another owner's zone produced 0 cards and 0
Regions** — converging the vocabularies did *not* make everyone's zones everyone's. Outside every zone:
0 cards, 0 Regions, while an unrelated Reaper's Harvest card fired off the same `updateActor`, proving
the event chain ran and the silence was the talent's gate.

### Found run 14 → investigated pass C → **closed, no fix, and that is the right outcome**

**"The adversary I just dragged in does nothing."**

Run 14 reported the cause as *"`edhaDropRuleIndex()` is dead code — the rule index never invalidates."*
**That diagnosis was wrong**, and was refuted before any code was touched: it is registered on **eight**
hooks and has been since `dcd51a7` (2026-07-24). It merely *greps* as dead because the registration is
a `for` loop on the next line. (`908df28` adds an inline comment so nobody re-misdiagnoses it.)

Fix pass C then re-derived the symptom from scratch and **ruled out every candidate** — notably killing
the `createToken`-batch staleness theory from Foundry v13 source: `Hooks.callAll("createToken", …)`
fires *after* `doc._onCreate(…)`, and `CanvasDocumentMixin#_onCreate` adds the placeable synchronously
inside it, so the placeable **is** in `canvas.tokens.placeables` when any listener runs. It shipped
**no fix** and left a probe row instead.

**Run 15 ran the probe. The symptom did not reproduce.** Raw numbers, before F5 → after F5 → after a
fresh post-F5 import: `edha-move-veto` watchers **2 → 2 → 3** (contents identical across the F5);
`canvas.tokens.placeables.length` 53 → 53 → 54; `scene.tokens.size` 53 → 53 → 54; `game.actors.size`
89 → 89 → 90. An adversary imported **mid-session** vetoed a weakened mover immediately with no
reload, isolated by a both-parked control.

**Conclusion: the original report was situational, not a standing defect.** No code was changed on a
guess. If it recurs at the table, capture the same four numbers before reloading.

### Still open

**2bW-1 (Withering Touch) — PARTIAL, row stays.** Run 14's blocker is gone (in combat, weapon `use()`
raises no action veto). Rider fired, block landed, **turn-boundary expiry passes**. Temp HP *does* land
on a fully blocked target via a direct grant, but **not** via the row's named `edha-overflow-thp`,
because a fraction-0 cut leaves no overflow to convert. That is a **ruling** (§3A-14), not obviously a
bug. Also surfaced **card-vs-prose drift**: prose says "start of your next turn"; engine, both cards
and measured behaviour all say **end** (§3A-15).

### Three gates built (this is the durable output)

- **`lint-refs` pass 14** (`f82a5d1`) — *a gated test must be able to ROLL it.* Covers **both**
  surfaces (talents and `advItemDoc`), because Sharp Eye was the second instance of a shape fixed once
  on only one surface. Mutation-verified against six shapes, including a `utility`+damage-formula decoy
  that a first draft wrongly admitted.
- **`lint-refs` pass 15** (`0b46ec6`) — *a hook that writes the world may not be gated on a raw
  `isGM`.* Chosen over a refund-race lint with stated reasoning: the two-GM family has bitten **four
  times across two marathons** and regrows after each sweep, whereas "no absolute read-modify-write
  against a system-owned resource" would today be a 14-entry allowlist encoding little.
- **`lint-refs` pass 16** (`b4841d6`) — *a hazard Region must declare `terrain.ownerUuid` and may not
  write a flat `*OwnerUuid` beside it.* Explicitly chosen over the more obvious "every written flag
  needs a reader", which **would not have caught this bug** — the flat key *did* have a reader.

Plus pinned regressions: `tests/on-hit-dealer.test.js`, `tests/refund-race.test.js`,
`tests/orphan-token.test.js`, `tests/terrain-ownership.test.js`. **298 → 325 tests.**

---

## 3. THE RULINGS BATCH — moved to `EDHA_RULINGS.md`

**This section is now a pointer, not a list.** On 2026-07-27w its 33 items were merged with every
pure ruling that had been sitting in `EDHA_FOUNDRY_TEST_CHECKLIST.md` as if it were a test row, and
the result is **`EDHA_RULINGS.md`** in the repo root — **45 numbered rulings** grouped by theme, each
carrying its recommended default and the marathon item or checklist row id it came from.

Read it there. A duplicate here would drift the moment one is answered, and the whole point of the
new doc is that there is exactly one place to answer them.

**The three still worth reading first** (they were §3B-E, now `EDHA_RULINGS.md` §I): items already
**APPLIED as defaults** and needing a veto if you disagree — above all **R-43, "a card that says
‘tests Speed’ means the attribute"**, which **changes live dice math** on Concussive Yield and
Inevitable Snare. The implementation is table-proven; the balance question is not.

Cross-reference for anything that cites the old numbering: §3A-1… and §3B-A… ids are preserved
inside each ruling entry, so `3A-7` is findable as the provenance note on **R-9**.

---

## 4. YOUR DEPLOY QUEUE — short, and mostly free

**1. Press F5.** ⭐ *Ten seconds, retires rows.* Your client is running pre-`f7ff7b3` code, which is
the only reason the dissipates card and the ignite sweep still double. Proven, not assumed (§2). All
engine work this marathon is already synced and hash-verified — you need no sync, just a refresh.

**2. ~~`foundry-build heroic` + ⟳ Sync Talents~~** — ✅ **DONE 2026-07-27u.** Ben closed Foundry and ran
all five packs; Sharp Eye's `activation.type: "skill_test"` / `activation.skill: "prc"` was read back
**out of the rebuilt pack**, with both rules intact. **2bQ-4 and 2bD-7 are unblocked and need a bench
drive, not a deploy.** The pack-rebuild list is empty for the first time in the project's tracked
history. *(Still yours whenever you next launch: **⟳ Sync Talents** on any PC you will play, and — the
adversary pack was rebuilt too — **⟳ Sync Adversaries from Pack** or a re-drag of placed copies.)*

So the queue is down to **item 1 — press F5.** Marathon 1's four-rebuild backlog is gone.

---

## 5. Two-client ⚑ list — **substantially shorter now**

**The player-client window is CLOSED** (run 13, 10 rows). `PlayerBench` works and — contrary to the
standing warning — **there was no cookie displacement**: `Bench`, `Gamemaster` and `PlayerBench` were
all connected simultaneously. That caution is now recorded as a caution, not an expectation, and
`bench-run/SKILL.md` + `EDHA_BENCH_RUNBOOK.md` §6 have been corrected to name PlayerBench.

Usefully, run 13 also separated the list honestly: **7 rows genuinely required the second client**
(the client veil in both directions, the break's veil-drop, White Draw Mana's permission path, Black
Draw Mana's GM-only sweep, sense-through reveals, CAE use-grants) and **3 turned out provable solo** —
so the "needs two clients" label was over-applied.

**Remaining two-client work:** the wizard-as-player walkthrough (large; not started), and anything
gated on ruling 3A-1 (PLAYER `ACTOR_CREATE`).

---

## 6. World hygiene — clean, and verified rather than asserted

**Zero drift across all five runs.** Every run snapshotted **ids, flags AND effects** at start and
diffed at the end. Final state: 87 actors, 52 tokens, 117 walls, 1 Region, 0 templates, 0 drawings,
Ben's combat untouched and still the only combat, "Playtest Map (Copy)" untouched, bench folders
emptied.

- **The world-wide adversary sync you authorized** (run 11): **46 synced, 0 skipped**, all 87 actors
  snapshotted with full effect objects first, **post-sync effect drift NONE**.
- **Repaired during runs, not left:** run 13's Black Draw Mana pulse applied Weakened to 4 of your
  placed adversaries (the talent behaving as written) — all removed, with pre-existing statuses on
  Stitchmother and two already-Weakened tokens **preserved**. Run 15 found and repaired three residues
  (a victim's `dead`+`markedBy`, three PCs' HP and `bpHits`, `Bench — White`'s `coordRound.red`).
- **Cleaned up:** marathon 1's orphan `Combat Construct` (actorless, untestable) deleted in run 11.
- **Ownership** granted to PlayerBench on 16 bench PCs only, fully restored — no PlayerBench entry
  remains anywhere.
- **Outstanding, harmless:** ~700+ bench chat messages, safe to flush at your convenience.

---

## 7. Notes on method — the thing that actually made this marathon work

**Six confident claims were wrong and were caught before they shipped.** That is the headline number,
not the fix count.

⚠️ **A SEVENTH was wrong and was NOT caught before it shipped — it is in this report.** §1 and
`BENCH_NEXT_RUN.md` both told you Green 2bS-4 / 2bS-12 / 2bS-14 "cannot be driven from the browser pane
— a genuine tooling limit". **It is not a tooling limit.** The refutation was sitting in this same
marathon's own row list: **2bAA-7** retired on a **click-placed** cast with an out-of-range refusal, so
the canvas picker demonstrably can be driven. What those rows need is a turn boundary or an Opportunity.
**Corrected in both docs 2026-07-27v.** The lesson generalises: *"I could not do it this run"* and
*"it cannot be done"* are different claims, and the second one needs its own evidence — the same
mistake shape as run 11's "the dialog exposes no advantage control at all" (item 1 below).

1. Run 11: "the cosmere dialog exposes no advantage control at all" — **wrong**;
   `RollConfigurationDialog` binds `mousedown` on the d20 icon (left = advantage, right =
   disadvantage), a pre-seed renders as a CSS class, and `onSubmit` honours a hand override. Only the
   *preview line* is blind. Caught by reading system source; a checklist row was nearly rewritten to
   describe a limitation that does not exist.
2. Run 11: 2bC-8's prescription "add a Probability Net owner to `bench-setup-console.js`" — **wrong**;
   Probability Net is an **adversary ability**, not a talent. Run 12 imported the Wrenchmaster instead,
   retired the row, and made **no repo change**.
3. Run 13: `isVisible` false on all 54 non-owned tokens read as the illusion veil — it was the bench
   PCs' **10 ft sight range**. Recording it would have been a **false PASS**.
4. Run 13: a `0 vs 502` initiative reading came from Advanced Encounters' **derived getter**, not
   storage.
5. Run 14: a Counterpoint drive printed "DC ?" and still returned SUCCESS — **its own harness** clicking
   through an empty prompt.
6. Run 14: "`edhaDropRuleIndex()` is dead code" — **wrong**; registered on eight hooks. The symptom was
   then re-derived from scratch, every candidate ruled out, **no fix shipped**, and run 15's probe found
   **the symptom does not reproduce**.

Two further harness traps were found and recorded: `edhaWatchersOfRule` is module-scoped (the
prescribed console line throws), and filtering `item.type === "talent"` **under-counts every adversary**
(their abilities are `trait`/`action` items). And run 15 found the runbook's own combat-staging
instruction produces a scene-bound combat that **can never cascade**, because v13's
`Combat._onDeleteTokens` compares a Scene *document* to a scene *id string*.

**The standing rules that earned their keep:** verify the root cause in code before touching anything ·
verify a deploy by **hash**, never by counting markers · a re-test without its **negative control** is
not a re-test (Cheap Shot, the in-range charge, and the other-owner's-zone negative each caught a class
of over-firing fix) · and **only claim what your own logs support**.
