# PM Board — the ongoing repo project (started 2026-09-04)

The scheduling state for the project that works `TODO_REPO_HYGIENE.md` items 4–25 (and whatever
gets added). **Substance lives in the TODO file; this board holds only order, ownership, status,
cost, and the decisions the PM is waiting on.** The operating procedure is
`.claude/skills/project-manager/` (PM) and `.claude/skills/work-item/` (workers). A fresh PM
session resumes from this file alone.

> **PM session of record: the desktop session Ben opened at ~16:10 on 2026-09-05 (Saturday)** — Ben:
> *"okay back on the desktop at home… start working on what you can."* It unblocked Ben's deploy
> (the worktree-prune prompt again, from the pre-#139 script — see the 16:10 run-log row), verified
> the deploy by hash at 16:20, and dispatched **bench run 4 (16:23) + item 32 with 11 folded in
> (16:38, worktree)** under PM-R8. Any other session — including the 07:02 `edha-pm-daily` one, which
> cannot be messaged — must stop on waking: dispatch nothing, write nothing. The next session rewrites
> this line on its first wake. Bench run 4 = run 27 came back **0 FAIL** (14 retired) — no fix pass;
> #155/#156/#157 merged by 17:05. **Item 35 dispatched 17:12** (worktree). **Next: item 36 at the 17:57
> slot (main checkout), PM engine-only deploy when it merges, then bench run 5 at ~18:55** (46 🤖 rows
> remain: hygiene 19, wizard 9, bestiaries 15). Tonight's day-shift ceiling is **16** (PM-R10).

## Operating rules (the short form — the skill carries the long form)

- **One PM, and it is Fable.** The PM plans, writes briefs, dispatches, reviews, gates, merges,
  and keeps this board. **The PM does not write fixes itself** beyond one-line corrections found
  in review.
- **Workers are Sonnet or Opus by default.** Sonnet for mechanical, doc, config, and
  well-specified script work. Opus for anything that changes engine or build semantics, needs a
  byte-parity proof, or designs a test driver. The model is fixed per item on the queue below.
  **Weekend sprints (PM-R8, Ben 2026-09-05 13:44): Fable subagents are authorized, at MEDIUM
  effort only**, dispatched solely through the `fable-worker` agent definition
  (`.claude/agents/fable-worker.md`, mirrored at `~/.claude/agents/`), whose frontmatter pins
  `model: fable` / `effort: medium`. Never `Agent(model: "fable")` on a generic agent — that
  inherits the PM's effort. Use Fable where Opus was queued for size-L engine-semantics work;
  bench-run and test-pass-fixes stay Opus. A new agent type is visible only after a Claude Code
  restart, so the session that created the file (09-05) cannot use it; the next one can.
- **One worker at a time by default.** Two in parallel only when both are docs-only and touch
  disjoint files. **Weekend sprints (PM-R8 "increased usage"):** up to TWO concurrent workers —
  the bench-loop worker in the main checkout plus ONE lane-R worker with `isolation: "worktree"`
  on files the bench does not touch (not the checklist, handoff, runbook, or next-run file; the
  generated dashboard may collide and the PM rebuilds it at merge). The bench loop itself stays
  strictly serial: one Bench slot.
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

**Windows (machine-readable, PM-R7 — parsed by `scripts/pm-state.js`; edit this line, not the prose
above, to change the schedule):** Mon-Thu 21:00-07:00; Fri 21:00-Mon 07:00 America/New_York

- **Windows:** dispatch only inside the operating windows above (weeknights 21:00–07:00, the whole
  weekend Fri 21:00 → Mon 07:00). Cloud routines obey the same windows.
- **Per-shift ceilings (PM-R7, amended by Ben 2026-09-05 10:40 — "bump up the threshold for # of
  agents you can send in a period on the weekend"; numbers are the PM's default, Ben may set
  others):** a weeknight shift (21:00→07:00) dispatches **at most 2** under the normal 2-per-5h cap.
  **On the weekend (Fri 21:00 → Mon 07:00) the trailing-5h cap is 6 dispatches of any model,**
  and a weekend day-shift (07:00→07:00) dispatches **at most 12** (raised from 4 / 8 at 13:50 on
  Ben's "increased usage for weekend sprints", PM-R8; the numbers are the PM's default). (The ≤2-Opus sub-cap written at
  10:45 was dropped at 11:55: every bench-loop worker is Opus by the skills' own design, so the
  sub-cap would have idled the table for four hours after two dispatches — the exact stall Ben
  objected to. Serialization, not model mix, is what bounds the weekend's spend.) The bench loop is
  sequential by nature (one Bench slot, one repo), so the weekend cap exists to keep the
  bench → fix → deploy → re-bench chain moving, not to run workers in parallel. Weekly maximum 24.
- **Monday 07:00 handoff line reports the week's PM total** from `python scripts/pm-usage.py` so
  Ben can compare it with his weekly meter and re-cut the ceilings.

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
| **PM-R7** | Nights-and-weekends schedule (Ben's instruction 2026-09-05, amended 10:40: raise the weekend threshold) | **Instruction recorded; the exact cut is a PM default awaiting veto:** windows Mon–Thu 21:00→07:00 and Fri 21:00→Mon 07:00; weekday daytime is Ben's; weeknight ceiling 2 under the 2-per-5h cap; **weekend: 4 per trailing 5h of any model, 8 per day-shift** (Opus sub-cap dropped 11:55 — the bench loop is all-Opus and serial). Ben: say a different hour or number and it changes. |

| **PM-R8** | Weekend sprints: Fable subagents + increased usage (Ben, 2026-09-05 13:44: "I'm authorizing Fable agents and increased usage for weekend sprints. Fable subagents are limited in effort to medium.") | **Recorded.** Fable workers only via `fable-worker` (model fable, effort medium), weekend windows only; weekend caps 6 per trailing 5h / 12 per day-shift; one parallel lane-R worktree worker allowed beside the bench loop. Numbers are PM defaults — Ben may set others. |
| **R-69** (in `EDHA_RULINGS.md`) | Should a CANCELLED picker still burn the talent's once-per-scene use? Found by bench run 25: Final Decree → Cancel refunds the Investiture but leaves `sceneOnce` stamped, so the scene's only use is spent without resolving. | **Answered 2026-09-05 16:30 (chat): stamp only after a successful pick.** Recorded inline in `EDHA_RULINGS.md`; filed as **TODO #36** (lane B, opus, S — fold into the next fix pass). |
| **PM-R9** | Item 32's optional line-ending piece: add `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`) in the same PR and `core.autocrlf=false` on Ben's fresh clone? | **Yes (Ben, 2026-09-05 16:30, chat).** In the item 32 PR; the worker renormalises only if ≤ 10 files change, else reports. |
| **PM-R10** | Tonight's weekend day-shift ceiling (12 would leave one slot after bench run 4 + item 32) | **Raised to 16 for the 2026-09-05 day-shift (Ben, 16:30, chat).** Trailing-5h cap of 6 unchanged; the 12 default stands for other days unless Ben says otherwise. Also ruled: **close PRs #93 and #103 now** (items 33/34 re-do them; branches stay KEEP) — done 16:35. |

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
| 5 | **Weekend bench marathon** — runs 24/25/26 done (32 rows retired, fix passes 1–2 merged; per-tree bench block exhausted). #151 deployed by Ben 16:15 (hash-verified 16:20: 6 in sync). **Run 27 (16:23–17:02): 14 PASS retired, 0 FAIL, 1 BLOCKED (veil needs a dark scene), 1 new 🤖 (two-`consume` activation charged only Investiture)** → merged #157. Run 21's Braced-(b) blocker disproved (`game.combat` is the VIEWED combat). **Next: bench run 5** — the 46 open 🤖 rows (hygiene remainder 19, creation wizard 9, bestiaries 15, player-client 4, pack-sync 4, items 3) after item 36 is deployed | B | opus | L | Foundry window ✓ | bench-pending | #142 #143 #145 #147 #151 #157 |
| 6 | **35** Re-land the dashboard-on-the-phone branch (`claude/in-app-dashboard-snapshot-ecwudz`, 3 commits, 5-file conflict with today's `pm-state.js`) — the phone lost its Snapshot/Dashboard on 09-05 14:55; dispatched 17:12 in a worktree, branch `pm/35-phone-snapshot-dashboard` | R | opus | M | — | running | |
| 7 | **33** Re-land handout-forge skill + session-zero one-pager from PR #93 (`fbc8e20`) | R | sonnet | S | — | queued | |
| 8 | 26 Bench PCs get normal vision (R-2) | R | sonnet | S | R-2 ✓ | queued | |
| 9 | 27 Retire the `GM summon relay` row (R-1) | R | sonnet | S | R-1 ✓ | queued | |
| 10 | **30** Rulings close-out R-7/R-19/R-34/R-49 (docs only, cloud-eligible) | R | sonnet | S | R-7/19/34/49 ✓ | queued | |
| 11 | **31** Mobile board models operating windows, not quiet hours (`pm-state.js` + page + test) — in a worktree, parallel to fix pass 2 under PM-R8 | R | sonnet | S | PM-R7 | merged | #150 |
| 12 | 20 One gate list, Windows-clean gates | R | sonnet | M | — | queued | |
| 13 | 21 Stale-doc sweep (⚠️ `.claude/worktrees/focused-booth-7259bf` is LIVE as of 09-05 — Ben's deploy-script fix session; not one of the four stale ones) | R | sonnet | S | PM-R2 ✓ | queued | |
| 14 | 18 Overlay name-collision guard | R | opus | S | #16 | queued | |
| 15 | 19a Handoff reference rewrite | R | opus | L | PM-R1 ✓ | queued | |
| 16 | 19b Handoff changelog move + dashboard re-point | R | opus | M | 19a | queued | |
| 17 | 5 Hook-firing test driver | R | opus | L | — | queued | |
| 18 | 23 Banner the unbannered engine lines | R | opus | M | — | queued | |
| 19 | 24 Table-driven handler registry | B | opus | L | #23 | queued | |
| 20 | 11 Path-literal scripts onto `lib/paths.js` — **folded into item 32's PR** (row 32) | R | sonnet | S | — | merged | #156 |
| 21 | 13 `resourceWrite` sites onto `edhaSpendResource` | B | opus | M | — | queued | |
| 22 | 14 `userTargets` sites onto the reader | B | opus | S | — | queued | |
| 23 | 12 `edhaDefBuffGmGate` at the 20 sites | B | opus | M | — | queued | |
| 24 | 10 Disposition fail-open backlog (76 sites, batched) | B | opus | L | — | queued | |
| 25 | **29** `kind: line` zones catch allies too (R-5) | B | opus | S | R-5 ✓ | queued | |
| 26 | **28a** Out-of-combat scope: gate watches on an ACTIVE combat (R-4) | B | opus | M | R-4 ✓ | queued | |
| 27 | **28b** Out-of-combat scope: tag bookkeeping writes (R-4) | B | opus | M | R-4 ✓, 28a | queued | |
| 28 | **36** Picker cancel must not burn the once-per-scene use (R-69) — fold into the next fix pass | B | opus | S | R-69 ✓ | queued | |
| 29 | **34** Fleet weapon migration (34a, REBUILD) + loot caches: player-clickable chest + body search (34b) — re-do PR #103 on current main | B | opus / fable-worker | L | Foundry window for the bench | queued | |
| 30 | 22 Radiant rows + key dialects | R | opus | M | PM-R3 ✓ | queued | |
| 31 | 4 Engine split into concatenated sources | R | opus | L | #23, #24 | queued | |
| 32 | 9 Map fork consolidation | H | opus | M | bridge/MST rulings batch | blocked(rulings) | |
| 33 | **32** Move the repo off OneDrive (`docs/REPO_MIGRATION_BRIEF.md`) — one lane-R worker PR first (path literals: `foundry-build.js` DATA, `run-playtest-build.bat`, three prose paths, item 11 folded in, `.gitattributes` per PM-R9) — dispatched 16:38 in a worktree, branch `pm/32-onedrive-path-literals`, then Ben's fresh clone (lane H) | R | sonnet | S | #139 #150 #151 ✓ · fold item 11 in | merged(repo side; Ben's fresh clone is the lane-H half) | #156 |
| — | 2 History purge → **delete the 61 SAFE branches** (`docs/BRANCH_CLEANUP.md`, Ben's hands only) · 3 LICENSE | H | Ben | — | — | Ben-only | |

## Foundry windows

**✅ DEPLOYED (2026-09-05 ~16:15, Ben, `deploy-to-foundry.bat`, Foundry closed): #151's engine half and the Reeve-Owl data fix are LIVE.** PM verification 16:20: `module-src-sync.js status` → **6 in sync, 0 stale, 0 hand-edited**; repo engine blob `a59b0c41…` at `main` = `7b4bcc8`; Foundry relaunched, `localhost:30000` answers. The run was the **live confirmation of #139's step 2** in the sense that it completed, but note how it got there: Ben's checkout was still pre-#139 when he double-clicked, so the OLD 7-step script ran and hung on the same worktree-prune `(y/n)` prompt (this time a half-removed `.git/worktrees/hw` record from a ~13:58 worker). The PM removed the record, had Ben close the window rather than answer `y` (the pull would have rewritten the running script under `cmd`, which resumes by byte offset), pulled `main` in the checkout, and Ben re-ran the new 8-step script clean. **Lesson for the runbook: a deploy-script fix only protects the run AFTER the one that pulls it — when the script itself changes, pull first, then run.** Bench run 4 verifies the served hash before driving anything.

**OPEN — Saturday 2026-09-05 from 09:13** (Ben: "foundry has been updated and is open"). **Deploy
fact (2026-09-05 11:50, PM push after fix pass 1):** `module-src-sync.js push` → 1 copied; live and repo
`register-skills.js` both hash `9575fba2…`; status 6 in sync. _(09:13 fact: 6 in sync at `9027cd17…`.)_ The
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
| 2026-09-05 10:52 | Bench run 1 = bench run 24 (hygiene campaign + engine-wide, 37 🤖 in scope) — `bench-run` | opus | 39 min, 275 turns | 7.4M | merged after review; one commit trailer stripped by the PM. Deploy hash-verified by the worker. 14 rows touched: **10 PASS retired, 2 FAIL** (Apex Form double-fire; `edhaDialogPick` Cancel returns its action string), **1 new defect** filed as a 🤖 row (R-60 sweep writes ~40 keys to every actor, tripped the socket limiter), 23 not reached (all left 🤖). World restored to snapshot: 0 diffs, Bench logged out. Worker corrected the PM's sizing (Heroic = 1 🤖, not 54). Dispatched at 10:52 after Ben's 10:40 message; weekend cap raised (PM-R7 amendment) | #142 |
| 2026-09-05 11:33 | Fix pass 1 — run 24's three defects — `test-pass-fixes` | opus | 18.5 min, 161 turns | 3.4M | merged after review, no bounce, no trailers. All three root causes verified in source; `edhaDialogPick` fixed once at the primitive (a `{edhaPick}` box that survives DialogV2's `?? action`), `edhaSceneReset` gained a per-actor claim across combats and an `edhaFlagKeyPresent` gate; 3 pinned tests (550 total, mutation-verified); 3 🤖 re-test rows; ENGINE_INDEX updated. Worker corrected the bench's blast radius (edhaPromptDC's two buttons were not live defects; the Weave cancel was worse than reported). **ENGINE-ONLY — deployed by the PM at 11:50 via `module-src-sync.js push`, hash-verified equal** | #143 |
| 2026-09-05 11:55 | PM lesson (no worker) | fable | — | — | #142 was merged before CI had finished on its amended (trailer-stripped) commit: `gh pr checks --watch` returned the OLD run's green. Content was byte-identical and the main run went green, but the rule is now explicit: **after any force-push, wait for the run on the NEW sha** (`gh run list --branch <b>` shows it). Also: PM session cost so far 6.7M / 214 turns — most of it the two long-report reviews | |
| 2026-09-05 12:08 | Bench run 2 = bench run 25 (re-test fix pass 1, then hygiene part 2) — `bench-run` | opus | 45 min, 396 turns | 10.6M | merged after review, no bounce, no trailers. Deploy hash-verified (installed AND served, after CRLF normalisation — a raw-bytes hash reads a good deploy as bad on Windows; runbook lesson). **All three fix-pass-1 rows PASS** with negatives (one card/one injury; Cancel refunds 4→1→4 with no flag; 4 of 74 actors written, none of Ben's PCs). 11 retired incl. both remaining R-60 rows (**R-60 closed**), R-64, four R-65 families; 4 partial with the open half written on the row; 2 BLOCKED (need zero GM clients — Ben's Gamemaster client was connected). 0 FAIL → no fix pass this cycle. New low-severity 🤖 row (system's own damage card prints the unfolded formula; maths correct). **New ruling R-69** for Ben. World restored: 3 pre-existing Covenant effects the sweep ate were recreated with original ids; final id-diff clean; roster idempotency 0 ⚠ / 0 created; Bench logged out | #145 |
| 2026-09-05 12:57 | Bench run 3 = bench run 26 (engine-wide 2 + leyline scatter 12 + hygiene remainder) — `bench-run` | opus | 52 min, 358 turns | 9.5M | merged after review, no bounce, no trailers. Deploy hash-verified (installed + served-normalised). 11 PASS retired (both engine-wide rows, Flashpoint, Living Image, The Seeming, three Green rows, Devoted Conduit, White burst riders, Covenant icon, Probability Cascade); **1 FAIL** Spreading Roots — `edhaGrowTerrain` deep-clones DataModel shape instances so `region.update` diffs to nothing while the Drawing grows (measured by re-running the path live); **1 data anomaly** Reeve-Owl / Sovereign of Solitude builds with `system.events === {}` against four authored rules, stale pack ruled out by six correct siblings; 2 PARTIAL; veil half BLOCKED (Playtest Map has darkness 0 + global light — needs a bench-created scene). Green's stale "needs an Opportunity" blocker struck. **Per-tree `# BENCH —` block exhausted.** World restored: 3 Covenant effects recreated with original ids, final diff empty; roster 0 ⚠; logged out | #147 |
| 2026-09-05 13:44 | Ben: "I'm authorizing Fable agents and increased usage for weekend sprints. Fable subagents are limited in effort to medium." → **PM-R8** (PM bookkeeping, no worker) | fable | — | — | `fable-worker` agent definition written (user-level, mirrored into the repo); board + skill amended; weekend caps 6/5h, 12/day; one parallel lane-R worktree worker allowed. The Fable agent type is visible only after a restart — this session keeps dispatching Opus/Sonnet | (this PR) |
| 2026-09-05 14:00 | **PM handoff** (Ben: "Stop after this turn and I'll continue the project manager weekend sprint in a new session") | fable | session ~4h50m, 9.7M weighted so far | — | Loop stopped. **IN FLIGHT at 14:00, both dispatched ~13:55 under PM-R8:** (a) **fix pass 2** — Opus, `test-pass-fixes`, branch `pm/fix-pass-2-run26` (not yet pushed at 13:57; the worker holds the MAIN checkout); (b) **item 31** — Sonnet, `work-item`, in worktree `.claude/worktrees/agent-a100f1efd45d7e319`, branch `pm/31-mobile-board-windows`. **Next session:** `gh pr list` — if their PRs exist, review per the checklist (rebuild `EDHA_DASHBOARD.html` at merge, both touch it); if a branch never appeared, the worker died with the old session → set the row back to `queued` and re-dispatch. Fix pass 2's engine-only half needs the PM's `module-src-sync.js push` + hash verify before bench run 4; its Reeve-Owl half is probably **REBUILD** (Ben's `deploy-to-foundry.bat`) → its row stays BLOCKED-ON-DEPLOY. **Bench run 4** = `# Adversary ability wiring` (12 🤖) per `docs/BENCH_NEXT_RUN.md`; per-tree block is exhausted. After item 31 merges, republish the mobile page to the existing artifact URL. Trailing-5h dispatches at 14:00: 10:52, 11:33, 12:08, 12:57, 13:55, 13:56 = **6 of 6** → next slot 15:52; day-shift 9 of 12. **`fable-worker` became visible in the 09:13 session WITHOUT a restart** (the earlier "restart needed" note was wrong) — usable now. Waiting on Ben, not blocking: **R-69**. Foundry still up at 13:57; Bench logged out by run 26. PM-side lesson: a PM worktree must live at a SHORT path (`C:/tmp/…`) — the scratchpad path + this repo's long filenames exceed MAX_PATH | (this PR) |
| 2026-09-05 14:30 | **New PM session of record — status wake** (Ben: status report first, then the queue; cloud session) | fable | ~40 min | — (cloud; no transcripts for `pm-usage.py`) | Both 13:55 workers **survived the 14:00 handoff** and opened their PRs at 14:13 (#150) and 14:20 (#151) — a stopped PM loop does not kill background workers. #151 CI green + mergeable (the worker merged main and rebuilt the dashboard itself); #150 conflicts on `EDHA_DASHBOARD.html` only, and GitHub runs no `pull_request` workflow on a conflicting PR, hence 0 check runs; #139 (Ben's deploy-script fix, CI green 13:25) conflicts on the handoff + dashboard. Phone inbox: the PM-R8 note marked seen (already recorded). Wrote `docs/REPO_MIGRATION_BRIEF.md` + TODO **32** (OneDrive → SSD) at Ben's request; the phone board still shows the 14:00 handoff picture until the next push. Trailing-5h cap 6 of 6 until 15:52; day-shift 9 of 12 | (this branch) |
| 2026-09-05 14:44 | Fix pass 2 (#151) — review + merge (PM, cloud) | fable | — | — | merged after review; diff read with the generated dashboard excluded (engine 72 lines: one source reader `edhaRegionShapes` behind all three Region shape writers; data: one enum value; lint pass 9b derives every closed `choices()` set from the engine — 88 handler types, 137 fields; 13 pinned tests, 563 total). The worker had already merged main and rebuilt the dashboard itself; no trailers, no bounce. **DEPLOY OWED to Ben** (engine + adversaries REBUILD) — a cloud PM cannot push the engine | #151 |
| 2026-09-05 14:52 | Item 31 (#150) — merge (PM, cloud) | fable | — | — | merged after review. The PR sat with 0 check runs because GitHub runs no `pull_request` workflow on a conflicting PR; the PM merged main in a worktree, regenerated the dashboard, CI green in 28 s on the new head. Stale "OLD quiet hours" board note retired, TODO 31 checked, mobile page republished to the existing artifact | #150 |
| 2026-09-05 14:56 | Ben's deploy-script fix (#139) — merge (PM, cloud) | fable | — | — | merged after CI green. Needed TWO main merges: the first resolved the handoff (#139's delta placed in date order beneath run 24) and the dashboard; #150 landing in between re-conflicted the dashboard → second merge, rebuild, CI. Live evidence for the "generated dashboard collides on every parallel PR" finding. Ben's next deploy is the live confirmation of step 2 | #139 |
| 2026-09-05 15:00 | **PM handoff** (Ben: "let me know when there is no agents or work going on… I'll start another real PM session at my PC") | fable | ~30 min PM work | — (cloud) | Loop stopped. **Nothing running**: no worker dispatched this session, no wakeup scheduled, no routine armed, all three PRs merged, all worktrees removed. Open PRs left: **#103 and #93** (July, untouched since 07-28 — Ben's call: close or rebase). **Deploy owed**: #151 → `deploy-to-foundry.bat` with Foundry closed. **Next local session**: verify the deploy by hash, bench run 4 (`# Adversary ability wiring`, 12 🤖) plus the three #151 re-tests, then item 32's path-literal PR (lane R, sonnet, S) as the first repo dispatch. Trailing-5h dispatches at 15:00: 10:52, 11:33, 12:08, 12:57, 13:55, 13:56 = 6 of 6 until 15:52; day-shift 9 of 12 | (this PR) |
| 2026-09-05 15:35 | Branch audit + items 33/34/35 (Ben: "add both as fresh to-dos", "make me a list of branches that can be deleted") — PM, cloud, no worker | fable | ~25 min | — (cloud) | **66 remote branches classified from git, not memory** → `docs/BRANCH_CLEANUP.md` (+ phone copy): 61 SAFE, 2 Ben's call, 3 KEEP. Main's history was **restarted 2026-07-28** (root `aed1a76`); 57 branches are orphaned by it and are what keeps the Stormlight PDF alive — item 2 rewritten accordingly. **Found while auditing:** `claude/in-app-dashboard-snapshot-ecwudz` (the Snapshot/Dashboard-on-the-phone work, 743 lines) was never merged and the PM's 14:55 page republish from main dropped those sections from Ben's phone → **item 35, first dispatch next session**. Items 33 (handout-forge from #93) and 34 (fleet weapons + loot caches from #103) filed at Ben's request; both source branches are KEEP until they land | (this PR) |
| 2026-09-05 16:10 | **New PM session of record — desktop** (Ben: "back on the desktop… I tried running the deploy to foundry.bat and it failed, again. do the fix… start working on what you can"). Deploy unblock + resume (PM, no worker) | fable | ~30 min | — | The deploy hung on git's worktree-prune `(y/n)` prompt — the pre-#139 script, because the bat pulls #139 *during* the run it cannot benefit from. Root cause on disk: `.git/worktrees/hw` half-removed (no `gitdir`/`HEAD`, empty `logs`/`refs`) by some ~13:58 process; maintenance's `worktree prune` hit the OneDrive lock on `logs`. PM removed the record, told Ben to close the window (not `y`: `cmd` resumes a rewritten batch file by byte offset), pulled `main` → `7b4bcc8`, pre-ran `module-src-sync.js status` (stale, not hand-edited), Ben re-ran → clean. Resume: tree clean, no open PM PRs, phone inbox empty, `#93`/`#103` still open from July | — |
| 2026-09-05 16:23 | Bench run 4 = bench run 27 (`# Adversary ability wiring` 13 🤖 + the three #151 re-tests) — `bench-run` | opus | 39 min, 301 turns | 6.9M | merged 17:05 after review; one `Co-Authored-By` trailer stripped by the PM (iron rule 6). Served hash verified = `a59b0c41…`. **14 PASS retired** (all three #151 re-tests incl. Reeve-Owl's 4 rules on a fresh import; the whole adversary-wiring block incl. Braced (b), which run 21 had wrongly BLOCKED — `game.combat` is the client's VIEWED combat), **0 FAIL**, 1 BLOCKED (Stalker veil: Playtest Map has darkness 0 + global light), 1 new 🤖 (Reknit Form's two-`consume` activation charged Inv, not Focus — not diagnosed). Harness finding: three Playtest-Map tokens are orphans (`actorId` resolves to nothing) → TODO **37**. World restore id-diff empty; residue: bench actors at full HP, Bench — White's temp HP gone, Bench — Green 2 Inv down | #157 |
| 2026-09-05 16:30 | Rulings batch (chat, 4 questions, all answered as recommended) — PM bookkeeping, no worker | fable | — | — | **R-69** = stamp after a successful pick → TODO **36**; **PM-R9** `.gitattributes` yes, in the item 32 PR; **PM-R10** tonight's day-shift ceiling 16; **close #93 and #103 now** → closed 16:35 with pointers to items 33/34 | (this PR) |
| 2026-09-05 16:38 | Items **32 + 11** (path literals onto `lib/paths.js`, `run-playtest-build.bat` relative, three prose paths, `.gitattributes`) — `work-item` | sonnet | 18.4 min, 263 turns | 5.0M | Dispatched in a worktree (PM-R8's one parallel lane-R slot) on branch `pm/32-onedrive-path-literals`; proof = scratch clone at `%TEMP%\edha-32-clone` printing the resolved DATA + pass-21 mutation → **merged 16:59** after review, no bounce, no trailers. Six scripts onto `lib/paths.js` (pass 21 shrink array empty, mutation-verified), `run-playtest-build.bat` → `%~dp0`, three prose paths, `.gitattributes` (renormalize touched exactly one file, the deity-revision-guide SKILL.md, CRLF→LF content-identical). Proof: the scratch clone printed its own `data` dir and built `edha-leyline` (136 items) into a scratch modroot. Cost confirms the calibration: a parity-class proof made an S+S item cost like an M. **Item 11 closed; item 32 is now Ben's (fresh clone, `core.autocrlf=false`).** PM note: `git worktree remove` on the worker's worktree failed with `Permission denied` on the dir AND its `.git/worktrees` record — the same read-only-directory mechanism as the deploy hang, leaving exactly the half-removed shape (`ORIG_HEAD`, `logs`, `refs`) `hw` had at 13:58; `rm -rf` + `git worktree prune` cleared it | #156 |
| 2026-09-05 16:55 | Board PR (session of record, deploy fact, rulings R-69/PM-R9/PM-R10, TODO 36) — PM, no worker | fable | — | — | merged after CI green on the trailer-stripped sha (the PM's own commit had carried a `Co-Authored-By` trailer; iron rule 6 wins over the harness default — stripped, force-pushed, waited for the NEW sha's run). Merge order #155 → #156 → #157, regenerating the dashboard at each step and keeping both handoff deltas newest-first at #157 | #155 |
| 2026-09-05 17:12 | Item **35** (re-land Snapshot + Dashboard on the mobile board over #150/#153) — `work-item` | opus | running | — | Dispatched in a worktree, branch `pm/35-phone-snapshot-dashboard`; tooling only from the old branch, board/handoff/dashboard NOT carried over, fresh delta; proof = tests naming the four seams + `--out` dash chunks + an `item: null` mutation. Trailing-5h at dispatch: 12:57, 13:55, 13:56, 16:23, 16:38 + this = 6 of 6 until 17:57; day-shift 12 of 16. PM session cost so far 5.5M / 195 turns | |
