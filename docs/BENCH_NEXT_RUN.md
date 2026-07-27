# Next bench session

> **Run 13 is THE PLAYER-CLIENT WINDOW.** Ben added a second passwordless player user, `PlayerBench`,
> precisely for the rows that are unprovable from one client. Those rows have now sat at the bottom of
> **twelve** solo passes. Run 13 exists to burn the batch down **together**, in one window, with two
> clients up — not one row per run.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — the whole marathon in one doc:
per-section disposition, every defect found → fixed → re-tested with commit refs, the rulings batch,
and world hygiene.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — the run-1 through run-12 operating lessons. **Read the newest two
runs' lessons before driving anything**; they override older advice. Run 12's are the ones that will
bite you first: read `_source` before calling an engine move dead, `displace` is *not* a forced move,
a walker must click each button once, and `ui.combat.initialize` may not take on the first call.

## State after run 12

- **Nothing failed in run 12.** Ten rows retired on evidence and fix pass A's Shockwave Slam
  restoration was verified in **both** directions (the push fires off a weapon hit; Cheap Shot still
  does not ride one, yet still Stuns on its own).
- **Engine-wide, Heroic and Order are exhausted of solo-runnable rows.** What is left in them is
  ⚑ Ben's judgment, the two deploy-blocked Sharp Eye rows, or player-client rows.
- **The engine is deployed and hash-verified** (`6c0cfe85…`). Re-verify by hash on join anyway.

## ⛔ Still deploy-blocked — do NOT test, record blocked

**`foundry-build heroic` + ⟳ Sync Talents is owed** (Sharp Eye's `activation` → `skill_test`/`prc`).
Until Ben runs it with Foundry closed, **2bQ-4** and **2bD-7** are **BLOCKED-ON-DEPLOY**. A blocked row
is recorded blocked, never failed against a stale pack.

## Run 13 — the two-client window

Join **`Bench` (GM) first**, health-check and snapshot, then open a **second browser-pane tab**
(`tabs_create` → `navigate`) and join as **`PlayerBench`**. Drive each tab by its own `tabId`.

Two cautions, both learned the hard way:
- The second session **may displace the Bench cookie session**. Verify Bench is still joined after
  PlayerBench joins; if it isn't, that row stays ⚑ rather than being fought.
- **Log out BOTH clients at the end.** A held player slot blocks the next run exactly like a held
  Bench slot.

### The batch to burn down while the player client is up

1. **`🎮 Player-client window`** — the checklist's own section. This is the batch; do it as a batch.
2. **The GM summon relay** (Engine-wide) — its verb is literally "as a PLAYER without actor-create":
   Phantom Barricade / Risen Servant / Forge Construct must produce a real token **via the GM client**,
   movable, its attack usable, and `actsAfterCaster` must put it on the caster's initiative. Run 12
   deliberately did not fake this from the GM side.
3. **2bM-1 — H3 ordering** — as a PLAYER, use **Covenant** on an ally you don't own. Note the row's own
   escape hatch: with a GM always online it cannot bite, so if you cannot stage a GM-less moment, record
   *why* rather than inventing a result.
4. **2bL-7 — Covenant's SHARED icon** — needs **two Order PCs** covenanting the same ally, then one
   breaking. Staging a second Order actor is a deliberate setup step, not a side effect; if you stage
   it, say so.
5. **Genuine player-perspective rows** the runbook names: the illusion belief loop, Covenant's shared
   icon across two owners, Devoted Conduit's two-White staging.

## Run 14 — what is left after that

- **Leyline leftovers**: Green's six (Spreading Roots 2bS-4 · Pack Hunter 2bS-6 · Scent the Weak 2bS-7 ·
  Resurgent Growth 2bS-12 · Natural Recovery 2bS-14 · Reknit Form 2bS-15), and **Probability Cascade**,
  which is parked in the Heroic section but is a **Blue** talent — its chain needs an Opportunity plus
  1 Investiture, which run 10 could not force.
- **Deity leftovers**: 2bW-1.
- **The adversary sections**, including the five restored abilities on fresh pack imports.
- **2bE-9's factual half** (an adversary carrying a combat-timing talent gets its combat-start grant) —
  the ⚑ *design* question stays Ben's, but the fact is drivable with an imported bench adversary.

## Standing lessons run 12 added

- **A negative control is worth nothing until the positive fires in the same round.** 2bV-2's
  forced-slide half had been UNPROVEN since run 8 purely because the once-per-round gate could not be
  separated from the mechanism. Ordering the two probes inside one fresh round settled it in one pass.
- **`ui.notifications` holds the whole truth for pre-cost refusals AND for movement vetoes.** Three of
  run 12's results (Concord's two refusals, Dread Presence's veto) exist nowhere else — no card, no
  error, no console line.
- **When a row's prescribed fix looks like a repo change, sanity-check the premise.** 2bC-8's standing
  "grant it in `bench-setup-console.js`" could never have worked, because Probability Net is an
  adversary ability, not a talent.
