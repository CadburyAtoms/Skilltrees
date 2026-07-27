# Next bench session

> **The planned marathon is DONE — run 14 was its last scheduled run.** What follows is not a
> fifteenth lap; it is the honest remainder, and most of it is **blocked on Ben**, not on agent time.
> Read the two ⛔ sections first: if neither has been actioned, a new bench run has very little it can
> legitimately close.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — the whole marathon in one doc.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → run-14 operating lessons. **Read run 13's and run 14's
before driving anything.** Run 14's are the ones most likely to cost you a row:

- **A duplicate card with two GMs is not automatically a fix failure** — fingerprint the other
  client's build by firing one OLD-gated and one NEW-gated site in the same session.
- **`edhaDropRuleIndex()` is never called, so the rule index never invalidates.** Import adversaries
  **first, then reload the page**, then test. Persist your snapshot through the reload via
  `sessionStorage`.
- **Weapon `use()` is hard-vetoed by the action economy out of combat** (no roll, no card, no
  damage); talent `use()` only warns. On-hit rows need a live combat.
- **Long token moves need `{teleport: true}`** and out-of-bounds parks fail silently — assert the
  landed `_source` coordinates. `sceneX/sceneY` are 1900/3050, not 0/0.
- **Engine pickers post as chat-card buttons too**, not only dialogs — and an empty prompt field
  will hand you a false SUCCESS.

## ⛔ BLOCKED ON BEN (1) — F5 his Gamemaster client

Run 14 could not return a verdict on fix pass B's one-applier half. Every newly-gated site still
double-posted, **but Ben's client is provably running pre-`f7ff7b3` code** (proof in the 07-27r
delta: an older activeGM-gated card posted exactly once in the same event). **Nothing here needs
re-fixing.** Once Ben reloads, these re-run in minutes and should retire immediately:

- the **dissipates card** re-test (its DEFEATED-skull negative already PASSES),
- the **ignite** card/Region count — *after* defect (1) below is fixed, since it never fires off Pyre,
- the **barrier** card count — its whole mechanical half already PASSES.

## ⛔ BLOCKED ON BEN (2) — the owed `foundry-build heroic` + ⟳ Sync

Still owed since run 10 (Sharp Eye's `activation` → `skill_test`/`prc`). **2bQ-4** and **2bD-7**
remain **BLOCKED-ON-DEPLOY**. A blocked row is recorded blocked, never failed against a stale pack.

## 🔧 Open defects handed to test-pass-fixes — do NOT re-litigate or re-report

1. **The hazard-Region flag vocabulary is split** — `edhaPlaceHazard` (~L16173) writes
   `sourceOwnerUuid`; `edhaOwnedTerrainRegions` (~L14970) reads `terrain.ownerUuid`. **Combustion
   Chain can never fire off a Pyre zone.** Matched control in the 07-27r delta.
2. **`edhaDropRuleIndex()` is dead code** (~L1939) — the rule index never invalidates, so anything
   added mid-session gets no automation until F5.
3. **The sidebar actor-delete still orphans its token + combatant** and wedges the AE tracker.
   `edhaDeleteActorWithTokens` is a helper on five *engine* call sites, not a `deleteActor` hook —
   every engine teardown path is now correct (both verified live), but the hand-delete is uncovered.
   Needs a design call: add the hook, or re-word the row to the paths it covers.

## What a next run could actually close

Small, and mostly turn-boundary staging. **Do not start one of these without a bench combat** —
that is the single blocker they share.

- **Green's last three:** Spreading Roots **2bS-4** (needs a character *ending its turn* in Green's
  difficult terrain) · Resurgent Growth **2bS-12** (tick lands at the start of your next turn) ·
  Natural Recovery **2bS-14** (costs an **Opportunity** — run 10 could not force one either; decide
  early whether you can, and if not record *why* rather than inventing a result).
- **Death 2bW-1** — the arm half is verified (`withernext` + card). The delivery half needs Bench —
  Death **in combat with actions**, then both remaining halves run together: Temp HP still landing on
  a blocked target (Bench — Life's `edha-overflow-thp` is the cleanest source) and the turn-start
  expiry.
- **Blue 2bAA-6 / 2bJ-3** — both need a real round change; same combat-staging blocker.
- **Blue 2bAA-9 (The Seeming)** — the card-naming half ("The Seeming", not "Phantom Double") is
  drivable solo on fresh imports of Mistheron and The Doubled Elder.
- **Engine-wide 2bE-9's factual half** — an imported adversary carrying a combat-timing talent gets
  its combat-start grant. Same bench combat closes it.
- **2bS-3** — the Briar-Gone Grove's Thorn Field keen rider baking into its engine-placed patches.

## What is NOT a next run's

- **2bR-10** (Devoted Conduit, needs a second White character), **2bL-7** (Covenant's shared icon,
  two Order PCs), **2bM-1** (needs NO GM connected) — these need `PlayerBench` **and** deliberate
  path-granting: a dedicated two-client run, not a tail-end.
- **2bAC-1** (visual legibility), **2bA-6**'s blank-note default, **Volatile Strike**'s `whenDealer`
  ruling, Battle Fever's card-vs-engine drift, **2bI-4 / 2bI-6 / 2bI-9 / 2bJ-10**, the Civ ruler UI —
  all ⚑ **Ben's judgment**, already measured, waiting only on a decision.
- **The wizard as a player** — large; only start it if you can finish it.
- **2bV-15 (Tempered Edge)** reads "nothing is open on this row any more" and its blocking FAIL is
  gone. It is a **bookkeeping delete for Ben to confirm**, not a run.
