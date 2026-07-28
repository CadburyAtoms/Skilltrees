# Next bench session

> **Marathon 2 is complete** (2026-07-27/28) — 5 bench runs, 3 fix passes, 18 commits, 41 rows
> retired on evidence. **There is no `⛔ STOP` this time.** The engine is fully deployed and
> hash-verified; one small rebuild is owed and almost nothing is blocked behind it.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — per-section disposition, every
defect found → fixed → re-tested with commit refs, the 31-item rulings batch, the deploy queue, the
two-client list, and world hygiene.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → run-15 operating lessons, and it now names
**`PlayerBench`** for two-client work.

## Ben's queue — short

1. **Press F5.** ⭐ Ten seconds. Your client is running pre-`f7ff7b3` code, which is the only reason
   the dissipates card and the ignite sweep still double. Proven in run 14 (your client honoured the
   *older* `activeGM` guard), re-confirmed in run 15 by attributing every card and Region by `userId`.
2. ~~**`foundry-build heroic` + ⟳ Sync Talents**~~ — ✅ **DONE 2026-07-27u.** All five packs were
   rebuilt with Foundry closed and Sharp Eye's fix was verified in the built artifact. **2bQ-4 and
   2bD-7 are unblocked** and need a bench drive. *(⟳ Sync Talents on any PC you'll play, and ⟳ Sync
   Adversaries from Pack, are still yours at next launch — the script cannot do either.)*

Everything else this marathon produced was engine-only and is already live. Marathon 1's
four-rebuild backlog is gone.

## What is actually left in `# BENCH —` scope

**47 open rows — but 33 are ⚑ yours by nature and 2 are blocked on the rebuild above, leaving 12
agent-runnable.** The bench corpus is close to exhausted; the remaining value is now in the **rulings**,
not in more runs.

| Where | Runnable | Note |
|---|---|---|
| Red · Green | 2 + 2 | 3 more Green rows need a turn boundary / an Opportunity — see below |
| Engine-wide | 3 | 2bA-6, 2bM-1, the GM summon relay (gated on ruling 3A-1) |
| Death · Civilization | 1 + 1 | Civilization's is bookkeeping |
| Heroic | 3 | ✅ both rebuild-blocked rows are **UNBLOCKED** by the 07-27u heroic build |

### ⚠️ CORRECTION 2026-07-27v — there is NO canvas-picker tooling gap

This section used to say **"Green 2bS-4 / 2bS-12 / 2bS-14 cannot be driven from the browser pane …
a canvas burst-center picker"**. **That is wrong, and this marathon's own evidence refutes it:**
**2bAA-7** was retired on a **click-placed** cast — *"click-placed in range −1 Inv; out of range created
nothing and refunded; does not join initiative"* — a driven canvas click-placement **with** its
out-of-range refusal. The picker is drivable. Run 15 hit a **runway** limit, not a capability limit.

What those three rows actually need: **2bS-4** is `edha-zone-react {turn-end-in-zone}` (a character must
*end its turn* in Green's terrain) · **2bS-12** ticks at the start of the owner's NEXT turn · **2bS-14**
costs an **Opportunity**. Turn boundaries **are** drivable — `combat.update({turn})`, proven by 2bL-10
across rounds 1 and 2 — so only the Opportunity is genuinely awkward to force.

Two more stale blockers were struck in the checklist the same day, for the same reason: **"the console
can't drive a turn boundary"** (refuted above; it had parked 2bAA-6 and 2bJ-3) and **"needs a second
client"** (true only for *rendering* checks — run 13 drove the raise, sweep and break, and run 14 drove
2bAA-8 **solo**; it had parked 2bAA-9).

## If you run again, open with

**2bW-1 (Withering Touch)** — the marathon's only PARTIAL. The rider fires and turn-boundary expiry
passes; Temp HP lands via a direct grant but **not** via the row's named `edha-overflow-thp`, because a
fraction-0 cut leaves no overflow to convert. **It is blocked on ruling 3A-7** (does "cannot regain HP"
block a Temp HP *grant*?) — get the ruling first or the row cannot be scored. It also carries
card-vs-prose drift (3A-15: engine, cards and measured behaviour all say *end* of your next turn; only
the prose says *start*).

Then the tails in the table above.

## Standing lessons this marathon paid for

- **Verify the root cause in code before touching anything.** Six confident claims were wrong on
  inspection this marathon — two would have produced a **false PASS**. Report §7 lists all six.
- **Verify a deploy by HASH, never by counting markers.** Also: `grep -c` counts **lines**, not
  occurrences — a marker legitimately "expected 6×" can show as 4.
- **A re-test without its negative control is not a re-test.** Cheap Shot not riding a weapon hit, an
  in-range cast still charging 2, and another owner's zone staying silent each caught a distinct class
  of over-firing fix.
- **Check your own harness before reporting a defect.** Run 14's "DC ?" SUCCESS was its own click
  through an empty prompt; run 15's `combatantGone: false` was the runbook's own staging instruction
  producing a scene-bound combat that can never cascade (v13's `Combat._onDeleteTokens` compares a
  Scene *document* to a scene *id string*).
- **A duplicate card with two GMs is not automatically a fix failure** — attribute it by `userId`, and
  check whether the other client is simply on an older engine.
- Bench PCs carry a **10 ft sight range** — it skews anything visibility-shaped.
- A token's **prepared** position reads stale while the pane's ticker is parked; read `_source`.
- `edhaWatchersOfRule` is **module-scoped, not global**, and filtering `item.type === "talent"`
  **under-counts every adversary** (their abilities are `trait`/`action` items).
