# PM Board — the ongoing repo project (started 2026-09-04)

The scheduling state for the project that works `TODO_REPO_HYGIENE.md` items 4–25 (and whatever
gets added). **Substance lives in the TODO file; this board holds only order, ownership, status,
cost, and the decisions the PM is waiting on.** The operating procedure is
`.claude/skills/project-manager/` (PM) and `.claude/skills/work-item/` (workers). A fresh PM
session resumes from this file alone.

> **PM session of record: the session Ben opened at 09:13 on 2026-09-05 (Saturday).** Ben moved
> control there in chat. The `edha-pm-daily` session that started at 07:02 the same day cannot be
> messaged (scheduled-task sessions are unattended), so this line is its stop signal: **if you are
> that session and you wake, stop your loop now, dispatch nothing, write nothing.** A future session
> deletes or rewrites this line on its own first wake.

## Operating rules (the short form — the skill carries the long form)

- **One PM, and it is Fable.** The PM plans, writes briefs, dispatches, reviews, gates, merges,
  and keeps this board. **The PM does not write fixes itself** beyond one-line corrections found
  in review.
- **Workers are Sonnet or Opus, never Fable.** Sonnet for mechanical, doc, config, and
  well-specified script work. Opus for anything that changes engine or build semantics, needs a
  byte-parity proof, or designs a test driver. The model is fixed per item on the queue below.
- **One worker at a time by default.** Two in parallel only when both are docs-only and touch
  disjoint files.
- **Branch per item, PR per item, CI must be green, PM merges.** Workers never push to `main`.
  Branch name `pm/<item>-<slug>`. Commit messages follow iron rule 6 (engine-only vs rebuild
  stated; no model identifiers).
- **Workers do not:** edit `data/authored/*`, run `deploy-to-foundry.bat`, touch the live
  module, run the bench, or delete files outside their brief. Anything that needs Foundry is a
  **lane B** item and waits for a Foundry window.
- **Every merged item** gets: the TODO item checked `[x]` with the PR, a run-log row here, and a
  dated delta in the handoff (or the changelog, after item 19).
- **The PM runs on nights and weekends only** (Ben, 2026-09-05: *"run on nights and weekends, and
  save compute during the week for my actual work products like Caseware and audit workpaper
  templating"*). Operating windows, America/New_York: **Mon–Thu 21:00 → 07:00 next day**, and
  **Fri 21:00 → Mon 07:00** continuously. **Mon–Fri 07:00–21:00 is Ben's** — no PM session runs,
  nothing is dispatched (cloud lane included), no wakeups. The only PM activity allowed in Ben's
  hours is answering a chat message Ben himself sends. Two scheduled tasks start the sessions:
  `edha-pm-weeknight` (21:00 Mon–Fri) and `edha-pm-daily` (07:00 Sat and Sun); every session
  stops its loop before the next 07:00. **A task that fires late** (the app was closed at 21:00 and
  opened during Ben's hours) checks the clock first and exits without touching anything.
- **One PM session at a time.** Ben opens whichever session is current from his chat history; a
  new session verifies it is alone (the "session of record" line at the top of this file is how a
  session that cannot be messaged is told to stand down).
- **Stop and ask Ben** when: a ruling below is unanswered and the next item depends on it; a
  worker reports a behaviour change it did not expect; gates fail for a reason outside the brief;
  or the usage cap for the window is reached.

## How Ben and the PM talk (agreed 2026-09-04)

- **Chat is the control channel.** Anything Ben types wins over the loop: "pause", "stop",
  "skip 20", "do 19 next", "Foundry is up", "I got a usage warning". Rulings are asked in chat,
  batched, with the question UI.
- **This board is the status channel.** The PM re-reads it every wake, so Ben's edits to this
  file are picked up; marks on the generated dashboard are NOT (they live in the browser).
- **The inbox below is the async channel.** Ben writes free text; the PM clears it into rulings,
  queue changes, or notes on its next wake and says so in chat.
- **Push notifications only when the PM is blocked on Ben** — a ruling, the usage cap, a Foundry
  window, a worker failure it cannot resolve. A merge gets one line in chat, never a push.
- **Only Ben can:** open a Foundry window, run `scripts/deploy-to-foundry.bat`, answer a ruling.

## Inbox from Ben

_(Write anything here — a priority change, a question, "Foundry is up tonight 8–10". The PM
reads it every wake, acts, and clears it.)_

## Mobile board (added 2026-09-04)

**https://claude.ai/code/artifact/a24a597c-4516-425b-9eb2-a30f1ece03f0** — the phone view of this
file: PM state and any running worker (elapsed clock), the trailing-window budget meters and when
the next slot opens, weighted usage per run, the queue, what waits on Ben, the run log, and an
**inbox** Ben can type into from his phone (the PM reads it every wake, exactly like the section
above, and marks each note seen). It is a *projection*: `scripts/pm-state.js` reads this board and
the PM pushes the result into the artifact's `pm/state` document on every state change; the page
source is `docs/pm-board-mobile.html`. If the phone and this file disagree, this file is right.

## Lanes

| Lane | Meaning | When it can run |
|---|---|---|
| **R** | Repo-only. Provable by the gates, no Foundry needed. | Any time the PM session is awake |
| **B** | Needs a live Foundry table after merge (a 🤖 bench section). | Only in a Foundry window Ben has opened, via `bench-run` |
| **H** | Needs a human decision or action first. | After Ben answers the ruling |

## Budget model

Measured on 2026-09-04 (this session, weighted units: cache read ×0.1, cache write ×2, output ×5):

| Unit | Weighted cost | Notes |
|---|---:|---|
| The full fresh-eyes review (PM + 4 Opus survey agents) | ~7.0M | 53% of it was the four Opus agents |
| One Opus survey agent, 35–72 turns | 0.8–1.1M | read-only, no edits |
| PM thinking + writing, per turn | ~17k | 105 turns ≈ 1.7M |
| PM file/shell operations, whole review | ~1.1M | |

Dispatch estimates — **recalibrated after the first measured worker (2026-09-04, item 25):** a
Sonnet size-M worker cost **4.4M over 181 turns**, four times the first guess. A worker's cost is
turns × context: every turn re-reads its own growing context, so long explorations and whole-file
reads are what cost, not the model. The work-item skill now tells workers to read bounded ranges
only and finish in 40–80 turns; re-measure after the next two dispatches.

**Second calibration (2026-09-05, item 16):** two size-S Sonnet workers now differ by 2.4× — item 15
cost 1.3M over 73 turns, item 16 cost **3.1M over 171 turns**. The difference is not the edit (item
16's code change is ~30 lines) but the **proof**: a pack-parity proof means installing
`classic-level`, extracting the pre-fix script, and running two full five-pack builds. So **size is
the wrong predictor — the proof is.** When queueing, read the item's `verify:` line: `parity`
roughly doubles a dispatch. Items 17 and 18 both demand parity-class proofs; budget them as M.

| Dispatch | First guess | Measured / revised |
|---|---:|---:|
| Sonnet, size S (edit + gates + report) | 0.3–0.6M | **1.3M** (item 15, 73 turns) / **3.1M** (item 16, 171 turns) |
| Sonnet, size M | 0.6–1.2M | **4.4M measured** (item 25, 181 turns) |
| Opus, size S | 0.8–1.5M | ~2–4M (revised) |
| Opus, size M | 1.5–3M | ~5–8M (revised) |
| Opus, size L (two PRs, parity proofs) | 3–5M | ~10M+ (revised; split the item instead) |
| PM review + merge per item | 0.2–0.4M | ~0.4M (item 25 review) |

**Caps (CONFIRMED by Ben 2026-09-04, Max 20x — ruling PM-R6; windows re-cut 2026-09-05 — PM-R7):**
at most 2 dispatches per 5-hour window, at most 1 of them Opus (trailing window); the PM wakes on worker
completion, not on a timer, with a 30-minute fallback; hard stop the moment Ben reports a usage
warning. **The old quiet hours (23:00–07:00) are gone — nights are now PM time.** In their place:
- **Windows:** dispatch only inside the operating windows above (weeknights 21:00–07:00, the whole
  weekend Fri 21:00 → Mon 07:00). Cloud routines obey the same windows.
- **Per-shift ceilings (PM-R7, amended by Ben 2026-09-05 10:40 — "bump up the threshold for # of
  agents you can send in a period on the weekend"; numbers are the PM's default, Ben may set
  others):** a weeknight shift (21:00→07:00) dispatches **at most 2** under the normal 2-per-5h cap.
  **On the weekend (Fri 21:00 → Mon 07:00) the trailing-5h cap is 4 dispatches, at most 2 Opus,**
  and a weekend day-shift (07:00→07:00) dispatches **at most 8, at most 4 Opus**. The bench loop is
  sequential by nature (one Bench slot, one repo), so the weekend cap exists to keep the
  bench → fix → deploy → re-bench chain moving, not to run workers in parallel. Weekly maximum 24.
- **Monday 07:00 handoff line reports the week's PM total** from `python scripts/pm-usage.py` so
  Ben can compare it with his weekly meter and re-cut the ceilings.
- ⚠️ **The mobile board's meters still model the OLD quiet hours** (`scripts/pm-state.js` parses one
  daily quiet range and falls back to 23:00–07:00). Until **TODO #31** lands, read the schedule
  from this file, not from the phone's "quiet hours" line.

## Rulings

Answered by Ben on 2026-09-04 (all six, as recommended). Kept here so a worker can quote them.

| Id | Question | Ruling |
|---|---|---|
| **PM-R1** | Handoff split shape | **Yes.** Reference stays at `EDHA_FOUNDRY_HANDOFF.md` (≤800 lines, with TOC); dated deltas move verbatim to `docs/handoff-changelog/2026-MM.md`; `HANDOFF_ARCHIVE.md` folds in. |
| **PM-R2** | Archive moves | **Yes.** `EDHA_EDITABILITY_AUDIT.md` and `Actor pages design review/` → `docs/archive/` with pointer stubs; prune the four clean stale worktrees under `.claude/worktrees/`. |
| **PM-R3** | Radiant-order rows | **Park them** in `source-materials/` if no consumer reads them (the worker checks the primer first). |
| **PM-R4** | Branch policy | **PR per item; the PM merges after green CI.** Workers never push to `main`. |
| **PM-R5** | Cloud lane | **Yes, docs-only items**, one nightly Sonnet routine, PR output, PM reviews next wake. |
| **PM-R6** | Usage tier and caps | **Max 20x; the caps above stand.** |
| **PM-R7** | Nights-and-weekends schedule (Ben's instruction 2026-09-05, amended 10:40: raise the weekend threshold) | **Instruction recorded; the exact cut is a PM default awaiting veto:** windows Mon–Thu 21:00→07:00 and Fri 21:00→Mon 07:00; weekday daytime is Ben's; weeknight ceiling 2 under the 2-per-5h cap; **weekend: 4 per trailing 5h (≤2 Opus), 8 per day-shift (≤4 Opus)**. Ben: say a different hour or number and it changes. |

New rulings go in this table with a `(waiting)` mark; the PM asks Ben in one batch, not one at a time.

**PM-D1 — deploy class is what Ben must DO, not what an item feared** (PM's call, 2026-09-05,
item 17; not a Ben ruling — recorded so workers stop asking). Item 17 expected REBUILD; the
measured build-report diff showed every pack byte-identical on all four machine/scenario
combinations, so it shipped **TOOLING-only** and the worker asked whether to label it REBUILD "on
principle". The label answers one question — *does Ben have to rebuild packs and ⟳ Sync?* — and
the answer was no. Label from the measurement, never from the item's prediction; if the two
disagree, that disagreement is a finding and belongs in the delta (it did). A latent behaviour
that *could* change content later is a note, not a deploy class.

## Queue (in order)

Status: `queued` · `briefed` · `running` · `in-review` · `merged` · `blocked(<ruling>)` · `bench-pending`

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 25 PM tooling (script + dashboard tab; skills landed in #131) | R | sonnet | M | — | merged | #132 |
| 2 | 15 Pre-commit shim + reinstall | R | sonnet | S | — | merged | #133 |
| 3 | 16 Build fails loudly on a broken overlay | R | sonnet | S | — | merged | #136 |
| 4 | 17 Heroic ids into `data/` | R | sonnet | S | — | merged | #137 |
| 5 | **Bench run 1 of the weekend marathon** — hygiene campaign 2026-08-10 (34 🤖) + Engine-wide (4 🤖); the 106-row queue is sized per the bench-marathon skill: run 2 = leyline scatter (11) + Heroic part 1, then Heroic in dedicated runs | B | opus | L | Foundry window ✓ (opened 09-05 09:13) | running | |
| 6 | 26 Bench PCs get normal vision (R-2) | R | sonnet | S | R-2 ✓ | queued | |
| 7 | 27 Retire the `GM summon relay` row (R-1) | R | sonnet | S | R-1 ✓ | queued | |
| 8 | **30** Rulings close-out R-7/R-19/R-34/R-49 (docs only, cloud-eligible) | R | sonnet | S | R-7/19/34/49 ✓ | queued | |
| 9 | **31** Mobile board models operating windows, not quiet hours (`pm-state.js` + page + test) | R | sonnet | S | PM-R7 | queued | |
| 10 | 20 One gate list, Windows-clean gates | R | sonnet | M | — | queued | |
| 11 | 21 Stale-doc sweep (⚠️ `.claude/worktrees/focused-booth-7259bf` is LIVE as of 09-05 — Ben's deploy-script fix session; not one of the four stale ones) | R | sonnet | S | PM-R2 ✓ | queued | |
| 12 | 18 Overlay name-collision guard | R | opus | S | #16 | queued | |
| 13 | 19a Handoff reference rewrite | R | opus | L | PM-R1 ✓ | queued | |
| 14 | 19b Handoff changelog move + dashboard re-point | R | opus | M | 19a | queued | |
| 15 | 5 Hook-firing test driver | R | opus | L | — | queued | |
| 16 | 23 Banner the unbannered engine lines | R | opus | M | — | queued | |
| 17 | 24 Table-driven handler registry | B | opus | L | #23 | queued | |
| 18 | 11 Path-literal scripts onto `lib/paths.js` | R | sonnet | S | — | queued | |
| 19 | 13 `resourceWrite` sites onto `edhaSpendResource` | B | opus | M | — | queued | |
| 20 | 14 `userTargets` sites onto the reader | B | opus | S | — | queued | |
| 21 | 12 `edhaDefBuffGmGate` at the 20 sites | B | opus | M | — | queued | |
| 22 | 10 Disposition fail-open backlog (76 sites, batched) | B | opus | L | — | queued | |
| 23 | **29** `kind: line` zones catch allies too (R-5) | B | opus | S | R-5 ✓ | queued | |
| 24 | **28a** Out-of-combat scope: gate watches on an ACTIVE combat (R-4) | B | opus | M | R-4 ✓ | queued | |
| 25 | **28b** Out-of-combat scope: tag bookkeeping writes (R-4) | B | opus | M | R-4 ✓, 28a | queued | |
| 26 | 22 Radiant rows + key dialects | R | opus | M | PM-R3 ✓ | queued | |
| 27 | 4 Engine split into concatenated sources | R | opus | L | #23, #24 | queued | |
| 28 | 9 Map fork consolidation | H | opus | M | bridge/MST rulings batch | blocked(rulings) | |
| — | 2 History purge · 3 LICENSE | H | Ben | — | — | Ben-only | |

## Foundry windows

**OPEN — Saturday 2026-09-05 from 09:13** (Ben: "foundry has been updated and is open"). **Deploy
fact (2026-09-05 09:13):** `module-src-sync.js status` → 6 in sync, 0 stale, 0 hand-edited. The
2026-08-10 hygiene campaign (R-60..R-67, live dice math) is now LIVE at the table for the first
time — its `# BENCH — hygiene campaign 2026-08-10` section (checklist line ~3328) is the first thing
the bench should run. The checklist carries **106 🤖 rows** in total. The dispatch itself waits for
the 12:05 slot (two dispatches already in the trailing five hours) and for Foundry still being up
then — **superseded 10:40: Ben raised the weekend cap and asked for bench progress while he is away;
the first bench run was dispatched at once.** The weekend runs as a **bench marathon** (the
`bench-marathon` skill's loop, orchestrated by the PM): bench-run → fails to one `test-pass-fixes`
worker → PM deploys engine-only fixes with `module-src-sync.js push` and verifies by hash → next
bench run re-tests the restored rows first. Pack-rebuild fixes stay BLOCKED-ON-DEPLOY for Ben.
Lane-B items merge to `main` but stay `bench-pending` until a window; the PM then dispatches
one `bench-run` worker (Opus) for the accumulated 🤖 sections, and fails go to one
`test-pass-fixes` worker.

_(Previous fact, for the record: on 2026-09-04 the live engine was the 2026-07-28 version and
`deploy-to-foundry.bat` had not been run; Ben ran it on 09-05 — it hung on git's worktree-prune
prompt on the way, which he is fixing in his own session in the `focused-booth-7259bf` worktree.)_

## Run log

| Date | Item | Model | Duration | Weighted usage | Outcome | PR |
|---|---|---|---|---:|---|---|
| 2026-09-04 | Review (Fable + 4× Opus survey) | fable/opus | ~45 min | 7.0M | Report published; items 15–25 filed | #130 |
| 2026-09-04 | Board + rulings + the two skills (PM, no worker) | fable | ~30 min | — | project-manager + work-item skills written; six rulings answered | #131 |
| 2026-09-04 18:41 | #25 PM tooling (script + Project tab) | sonnet | 15.5 min, 181 turns | 4.4M | merged after review; 4 trailers stripped; 2 out-of-scope finds → item 21 | #132 |
| 2026-09-04 19:02 | #15 Pre-commit shim + reinstall | sonnet | 7 min, 73 turns | 1.3M | merged after review; clean first pass, no trailers | #133 |
| 2026-09-04 19:45 | PM handoff | fable | — | — | loop stopped: window cap reached (2/2), quiet hours next; `edha-pm-daily` created, first run 2026-09-05 ~07:02; next dispatch is #16 (sonnet, S) | #134 |
| 2026-09-04 19:30 | Mobile PM board (Ben's request; PM built it, no worker) | fable | ~40 min | — | `scripts/pm-state.js` + `tests/pm-state.test.js` + `docs/pm-board-mobile.html`; artifact published, `pm/state` seeded; skill gained the push/inbox procedure. **Merged 2026-09-05** as PR #135 (`main` at `ac170d0`) — the earlier "Not merged / needs Ben" note in this row was corrected by the 09-05 session | #135 |
| 2026-09-05 07:05 | #16 Build fails loudly on a broken overlay | sonnet | 10.9 min, 171 turns | 3.1M | merged after review; clean first pass, no trailers, no bounce. PM re-verified the mutation itself (reintroducing `catch { continue; }` → "Missing expected exception"), re-ran all 8 gates locally green, CI green in 28s | #136 |
| 2026-09-05 08:35 | Phone inbox: R-1, R-2, R-4 answered (PM bookkeeping, no worker) | fable | ~20 min | — | Ben answered three standing rulings from the mobile board. Recorded inline in `EDHA_RULINGS.md` (NOT moved to §K — the doc's own rule is that a ruling is settled only once the thing it decides has changed); filed the consequences as TODO items **26** (R-2 bench vision), **27** (R-1 retire the summon-relay row), **28a/28b** (R-4 out-of-combat scope, split before dispatch). R-4 is lane B and cannot be called done without a bench pass | #138 |
| 2026-09-05 07:30 | #17 Heroic ids into `data/` | sonnet | 11.6 min, 174 turns | 3.3M | merged after review, no bounce. **The item's premise did not survive measurement**: the map is fully dormant, so shipping content is unchanged everywhere — see PM-D1 for the deploy-class call. PM re-derived the collision count through `buildTrees()` (79/82 confirmed) and found the worker's 3 "non-colliding" names are punctuation variants (`Erudition*`, U+2019 apostrophe, hyphen) of talents that DO exist → all 82 are dormant; PM corrected that paragraph in the delta itself rather than spending a bounce. Snapshot has punctuation drift vs `data/` — noted for any re-dump | #137 |
| 2026-09-05 09:13 | New PM session of record (Ben's chat); phone inbox: R-5, R-7, R-19, R-34, R-49 answered; schedule re-cut to nights and weekends (PM bookkeeping, no worker) | fable | ~35 min | — | Ben confirmed both things the board waited on: the engine is deployed (sync status 6/6) and Foundry is open. Five rulings recorded inline in `EDHA_RULINGS.md`; consequences filed as TODO **29** (R-5, lane B: line zones hit allies) and **30** (docs close-out of the four confirmations; R-34 read as "the trail Regions are the indicator" — flagged for Ben's correction). **PM-R7**: operating windows moved to weeknights 21:00–07:00 + weekends, weekday daytime is Ben's; scheduled tasks re-cut (`edha-pm-daily` → Sat/Sun 07:00, new `edha-pm-weeknight` → Mon–Fri 21:00, both with a late-fire clock guard). The 07:02 daily session could not be messaged (unattended); the board's top line tells it to stand down. Trailing-5h cap is full until 12:05 → next dispatch then: the bench run if Foundry is still up, else item 26 | (this PR) |
| 2026-09-05 10:45 | Bench run 1 (hygiene campaign + engine-wide, 38 🤖 rows) — `bench-run` | opus | (running) | — | dispatched at 10:45 after Ben's 10:40 message ("It's the weekend… bump up the threshold… make progress on the bench tests while I'm away"); weekend cap raised to 4/5h (PM-R7 amendment); trailing-5h count at dispatch 3 of 4 | |
