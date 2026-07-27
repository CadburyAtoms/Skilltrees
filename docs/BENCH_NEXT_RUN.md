# Next bench session

> ✅ **The deploy block is GONE.** Ben ran all four owed pack builds plus the engine sync, and
> **bench run 11 (2026-07-27m) verified every one of them in-world** — the served engine hashed
> identical to `HEAD`, all five packs read their fixes, and **12 rows retired on live evidence**.
> The old `⛔ STOP` banner that stood here is deleted: it was written when nine rows were stranded
> behind rebuilds, and none of them are stranded now.

## Read this first

**→ [`docs/BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md)** — the whole marathon in one doc:
per-section disposition, every defect found → fixed → re-tested with commit refs, the rulings batch,
and world hygiene.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — the run-1 through run-11 operating lessons. **Read the newest
two runs' lessons before driving anything**; they override older advice.

## State after run 11

- **Nothing is BLOCKED-ON-DEPLOY.** A row that fails now is a real failure.
- **Heroic is finished except one FAIL and the ⚑/roster leftovers** — see below.
- The bench roster is healthy: 16 PCs, zero ⚠ from `bench-setup-console.js`, and every PC now
  carries a **real ranged weapon** (`weapon.system.attack.type === "ranged"`, Shortbow 80 ft) as
  well as a melee Sidesword.

## Run 12 — the two jobs, in this order

### 1. Sharp Eye's real fix (a `test-pass-fixes` job, not a bench job)

**2bQ-4 is the one row that did not come back after the rebuild**, and the dead skill key was only
half the story. The `prc` fix is live on the pack *and* the owned item, and Sharp Eye is still a
total silent no-op — no roll, no card, no notification, nothing spent.

**Root cause:** its `activation` is `{type: "utility", cost: {value: null, type: "spe"}}` with **no
`activation.skill`**, so the system never rolls a test and H1's `edha-def-test` rule has nothing to
resolve. Family audit: of the **37** authored talents carrying `edha-def-test`, **35** are
`activation.type: "skill_test"`; the only two that are not are Sharp Eye (genuinely broken) and
Chaos's **Unravel Everything** (`vs: "none"`, which needs no roll and is likely fine — confirm, do
not assume).

**The fix is one talent** in `data/authored/heroic-hunter.json`: `activation.type` → `skill_test`,
`activation.skill` → `prc`, matching Sharp Eye's own card text ("test Perception vs. Cognitive").
Then `foundry-build heroic` + ⟳ Sync Talents. **2bD-7 unblocks with it.**

⚠️ One honesty caveat to carry forward: run 11's in-world mutation probe (temporarily flipping the
owned item's activation to prove the mechanism) was **refused by a permission gate**, so the null
result is measured but the mechanism is a strong inference. Re-derive it in the installed cosmere
system before shipping the change — this marathon has had four cases where a confident bench
inference was wrong.

### 2. Engine-wide, then the leyline/deity leftovers

**Heroic has no runnable rows left**, so run 12's bench half should take **Engine-wide** first and
then the tree leftovers:

- **Engine-wide:** `2bAC-2` (short dialogs unharmed) · the **GM summon relay** · **Withering Ray** ·
  `2bA-6`'s ⚑ push-default ruling (needs Ben, not a bench pass) · `2bT-19` · `2bE-9`.
- **Green leftovers** (the row now stays *only* for these six): Spreading Roots (2bS-4) · Pack
  Hunter (2bS-6) · Scent the Weak (2bS-7) · Resurgent Growth (2bS-12) · Natural Recovery (2bS-14) ·
  Reknit Form (2bS-15).
- **Deity leftovers:** 2bW-1 · 2bV-2/6/8 · 2bL-9/12.
- **Blue:** **Probability Cascade** is parked in the Heroic section but is a Blue talent — run it in
  a Blue pass. Its chain needs an Opportunity plus 1 Investiture, which run 10 could not force.
- **Adversary sections**, including the five restored abilities on fresh pack imports.
- **Roster gap, not a test:** `2bC-8` (Probability Net) is owned by **no** bench actor. Granting it
  in `scripts/bench-setup-console.js` is a one-line repo change that makes the row runnable.

## Run 13 — the player-client window (unchanged)

`PlayerBench` exists as a second passwordless player user. The checklist's
`🎮 Player-client window` section is the batch to burn down while a player client is up — do those
rows **together** rather than one per run. Two cautions from the runbook: a second session may
displace the Bench cookie session (verify Bench is still joined after the player joins), and
**both** clients must be logged out at the end.

## Standing lessons run 11 added

- **The roll dialog's preview line does not reflect advantage.** Both a skill-test dialog under
  Flamestance and an attack dialog against a marked quarry previewed a plain `1d20 + N` and then
  rolled `2d20kh + N` on submit. The cosmere dialog exposes **no advantage control at all** — so a
  row asking for advantage to be "pre-selected and overridable by hand" is unsatisfiable as written.
  Judge advantage by the **resulting roll**, never by the dialog preview.
- **Attributes clamp at 10 and skill ranks clamp at 5.** A probe that sets `rank: 12` silently
  becomes 5. Read the value back before computing an expected range, or a decisive-looking control
  proves nothing.
- **"Cannot consume, not enough of resource" is a legitimate pre-cost veto that lives only in
  notifications.** Several talents quietly did nothing mid-run purely because the bench PC's focus
  had run to 0. Top resources up between rows and check notifications before recording any FAIL.
- **Fault Line's dangerous-terrain Region catches bystanders scene-wide**, including Ben's placed
  campaign tokens. Clean the Region afterwards — it is not in the start snapshot, so the id-diff
  will catch it, but the incidental damage to campaign actors will not undo itself.
