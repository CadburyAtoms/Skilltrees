# Next bench session

> **⛔ STOP — there is no paste-ready next-run prompt right now, and there should not be one until
> Ben has deployed.** The 2026-07-26/27 bench marathon ran six bench runs and seven fix passes back
> to back. Four pack rebuilds' worth of fixes are sitting in the repo unable to reach the table, and
> **nine checklist rows are blocked behind them**. A run written today would re-fail rows whose
> fixes are already written.
>
> **Status 2026-07-27k:** a **run 10** was dispatched anyway, scoped to Heroic only, and it retired
> 12 more rows without touching anything blocked — **Heroic now has 0 runnable rows**. That confirms
> the stop above rather than contradicting it: every remaining Heroic row is either deploy-blocked,
> ⚑ yours, or waiting on a fix. **Step 2 below is now the single highest-value action in the whole
> bench backlog — it unblocks 8 Heroic rows on its own.** No run 11 prompt until then.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — the whole marathon in one doc:
per-section disposition, every defect found → fixed → re-tested with commit refs, the rulings batch,
Ben's deploy queue, the two-client list, and world hygiene.

## Ben's deploy queue (report §4 — the short form)

Foundry **CLOSED** for steps 2–5:

1. **Relaunch / F5** — the engine is already synced and hash-verified through 07-27j.
2. **`foundry-build heroic` + ⟳ Sync Talents** ⭐ the biggest unlock — seven dead-skill-key talents,
   including Flamestance, which has never worked.
3. **`foundry-build leyline` + ⟳ Sync Talents** — Mender's Instinct's card + range gate.
4. **`foundry-build deity` + ⟳ Sync Talents + RE-FORGE the Construct** — Fault Line's ×3, Surgical's text.
5. **`foundry-build adversaries` + ⟳ Sync Adversaries + re-drag the Fellstag + re-import BOTH bosses**
   — Herding Antlers, Flame Surge.

⚠️ **Also owed before any ranged row:** re-run `scripts/bench-setup-console.js` and confirm
`weapon.system.attack.type === "ranged"`. No bench PC had a ranged weapon until run 9 — the setup
script carried the same dead-field bug the engine did.

## When you write run 10

Open it with the **post-deploy re-test batch** (report §4, tail): the eight skill-key talents
(2bE-4, 2bJ-12, 2bO-7, 2bN-2, 2bB-4, 2bQ-4, 2bM-6, 2bZ-8) · Mender's card + range · Fault Line's
Constructs ×3 · Herding Antlers · Flame Surge (2bAB-1) · and the four **never-table-verified** pass-7
engine fixes (2bAD-1 attribute contests, 2bAD-2 the skill-contest non-regression, the CAE grant
race, Pack Hunting's double-dip). Every one of those rows is annotated in
`EDHA_FOUNDRY_TEST_CHECKLIST.md` with its own deploy prerequisite.

Then pick up the remaining worklist — **report §1's "what was NOT reached"**: the leyline leftovers,
the deity leftovers (2bY-7, 2bW-1, 2bV-2/6/8, 2bL-9/12), the adversary sections, Engine-wide's
2bAC-2 / GM-summon relay / Withering Ray, and **Heroic** (26 open, 20 runnable — benched for the
first time in run 9 and the largest single block left in bench scope).

**What is left of `# BENCH —` scope in total: 77 rows, 41 runnable, 8 blocked on the rebuilds.**
Everything else open in the checklist (the wizard, items, currency, the bestiaries, the
player-client window) is outside bench scope — see report §1's "Outside the bench scope".

The runbook (`docs/EDHA_BENCH_RUNBOOK.md`) carries the run-1 through run-9 operating lessons —
read it before driving anything. The load-bearing ones from this marathon: **verify a deploy by
HASH, never by counting markers**; snapshot **ids, flags AND effects** at start and never delete
what you can't prove you created; never resolve a token by name when duplicates exist.

## One standing rule this marathon reinforced

Four root causes contradicted the bench's own confident inference, and following the inference would
have shipped a wrong fix each time (report §7). **Verify the root cause in code — in the installed
cosmere system or Foundry source — before touching anything**, even when the bench report sounds
certain.
