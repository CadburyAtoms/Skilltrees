# Next bench session

> **Run 14 is LEYLINE + DEITY LEFTOVERS — a solo GM run.** Run 13 emptied the player-client window,
> so you do **not** need `PlayerBench` and should **not** open a second tab. Join as `Bench`, work the
> `# BENCH —` tree sections, and stay there.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — the whole marathon in one doc:
per-section disposition, every defect found → fixed → re-tested with commit refs, the rulings batch,
and world hygiene.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — the run-1 through run-13 operating lessons. **Read the newest
two runs' lessons before driving anything**; they override older advice. Run 13's are the ones most
likely to bite even on a solo run:

- **Never read `combatant.initiative`** — it is an Advanced Encounters *derived getter* that throws
  when any combatant's actor is missing. Use `_source.initiative`.
- **One orphaned combatant wedges the whole tracker.** If combat setup starts failing for no reason,
  sweep `combat.combatants.filter(c => !c.actor)` first.
- **A "refunded" notification is not a refund** — assert the resource.
- **Bench PCs have a 10 ft `sense` vision range.** Harmless for a GM (you see everything), but do not
  be surprised by it if a row touches vision.

## State after run 13

- **10 rows retired, 1 FAIL, 2 new defects.** The player-client window is **closed** — the whole
  Illusion belief loop, both Playtest-2 rows, sense-through reveals, CAE use-grants and the
  sync-button row are gone from the checklist.
- **The engine is deployed and hash-verified** (`6c0cfe85…` == HEAD). Re-verify by hash on join anyway.
- **Nothing was deployed by run 13** — it was DOCS-ONLY, so the engine you join is still HEAD.

## ⛔ Still deploy-blocked — do NOT test, record blocked

**`foundry-build heroic` + ⟳ Sync Talents is owed** (Sharp Eye's `activation` → `skill_test`/`prc`).
Until Ben runs it with Foundry closed, **2bQ-4** and **2bD-7** are **BLOCKED-ON-DEPLOY**. A blocked row
is recorded blocked, never failed against a stale pack.

## 🔧 Open defects run 13 handed to test-pass-fixes — do NOT re-litigate, they are not yours to fix

Three items are already root-caused and written up; a bench run should not try to fix them, and
should not re-report them as new:

1. **`edhaRefundCost` races the system's consume write** (~L9595, **29 call sites**) — 2bAA-8's
   out-of-range refund is the reproducer.
2. **The dissipates card double-posts with two GMs connected** (~L9226 — guarded on `isGM`, needs
   `activeGM`).
3. **A deleted summon/phantom leaves its TOKEN behind** (contradicts the comment at ~L9235), and the
   leftover combatant wedges the AE tracker.

## Run 14 — the worklist

Leyline and deity leftovers. Ben's count going in: **White 1 · Blue 1 · Black 1 · Red runnable ·
Green 2 · Death 1 · Civilization 1**.

- **Green's six** — Spreading Roots **2bS-4** · Pack Hunter **2bS-6** · Scent the Weak **2bS-7** ·
  Resurgent Growth **2bS-12** · Natural Recovery **2bS-14** · Reknit Form **2bS-15**.
- **Probability Cascade** — parked in the Heroic section but it is a **Blue** talent; its chain needs
  an Opportunity plus 1 Investiture, which run 10 could not force. Decide early whether you can force
  an Opportunity at all — if not, record *why* rather than inventing a result.
- **Deity leftovers** — **2bW-1**, plus the Death and Civilization rows.
- **2bE-9's factual half** — an adversary carrying a combat-timing talent gets its combat-start
  grant. Drivable with an imported bench adversary; the ⚑ *design* question stays Ben's.

## Then, if runway remains

- **The adversary sections**, including the five restored abilities on fresh pack imports.

## What is NOT run 14's

- The two-PC stagings still in the player-client window (**2bR-10** Devoted Conduit needs a second
  White character; **2bL-7** Covenant's shared icon needs two Order PCs; **2bM-1** needs no GM
  connected). These need `PlayerBench` **and** deliberate path-granting — a dedicated run, not a
  tail-end.
- **2bAC-1** — a visual-legibility judgment, explicitly ⚑ Ben's.
- **The wizard as a player** — large; only start it if you can finish it.
