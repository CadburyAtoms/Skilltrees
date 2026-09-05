# PM Board — the ongoing repo project (started 2026-09-04)

The scheduling state for the project that works `TODO_REPO_HYGIENE.md` items 4–25 (and whatever
gets added). **Substance lives in the TODO file; this board holds only order, ownership, status,
cost, and the decisions the PM is waiting on.** The operating procedure is
`.claude/skills/project-manager/` (PM) and `.claude/skills/work-item/` (workers). A fresh PM
session resumes from this file alone.

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
- **One PM session per day.** The app's scheduled task `edha-pm-daily` starts a fresh session at
  ~07:02 each morning; the previous one stops its loop before then. Ben opens whichever session is
  current from his chat history.
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

| Dispatch | First guess | Measured / revised |
|---|---:|---:|
| Sonnet, size S (edit + gates + report) | 0.3–0.6M | **1.3M measured** (item 15, 73 turns) |
| Sonnet, size M | 0.6–1.2M | **4.4M measured** (item 25, 181 turns) |
| Opus, size S | 0.8–1.5M | ~2–4M (revised) |
| Opus, size M | 1.5–3M | ~5–8M (revised) |
| Opus, size L (two PRs, parity proofs) | 3–5M | ~10M+ (revised; split the item instead) |
| PM review + merge per item | 0.2–0.4M | ~0.4M (item 25 review) |

**Caps (CONFIRMED by Ben 2026-09-04, Max 20x — ruling PM-R6):** at most 2 dispatches per 5-hour
window, at most 1 of them Opus; the PM wakes on worker completion, not on a timer, with a 30-minute fallback;
no dispatch between 23:00 and 07:00 America/New_York unless it is a cloud routine; hard stop the
moment Ben reports a usage warning. Reserve roughly a third of the weekly allowance for Ben's own
sessions.

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

New rulings go in this table with a `(waiting)` mark; the PM asks Ben in one batch, not one at a time.

## Queue (in order)

Status: `queued` · `briefed` · `running` · `in-review` · `merged` · `blocked(<ruling>)` · `bench-pending`

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 25 PM tooling (script + dashboard tab; skills landed in #131) | R | sonnet | M | — | merged | #132 |
| 2 | 15 Pre-commit shim + reinstall | R | sonnet | S | — | merged | #133 |
| 3 | 16 Build fails loudly on a broken overlay | R | sonnet | S | — | queued | |
| 4 | 17 Heroic ids into `data/` | R | sonnet | S | — | queued | |
| 5 | 20 One gate list, Windows-clean gates | R | sonnet | M | — | queued | |
| 6 | 21 Stale-doc sweep | R | sonnet | S | PM-R2 ✓ | queued | |
| 7 | 18 Overlay name-collision guard | R | opus | S | #16 | queued | |
| 8 | 19a Handoff reference rewrite | R | opus | L | PM-R1 ✓ | queued | |
| 9 | 19b Handoff changelog move + dashboard re-point | R | opus | M | 19a | queued | |
| 10 | 5 Hook-firing test driver | R | opus | L | — | queued | |
| 11 | 23 Banner the unbannered engine lines | R | opus | M | — | queued | |
| 12 | 24 Table-driven handler registry | B | opus | L | #23 | queued | |
| 13 | 11 Path-literal scripts onto `lib/paths.js` | R | sonnet | S | — | queued | |
| 14 | 13 `resourceWrite` sites onto `edhaSpendResource` | B | opus | M | — | queued | |
| 15 | 14 `userTargets` sites onto the reader | B | opus | S | — | queued | |
| 16 | 12 `edhaDefBuffGmGate` at the 20 sites | B | opus | M | — | queued | |
| 17 | 10 Disposition fail-open backlog (76 sites, batched) | B | opus | L | — | queued | |
| 18 | 22 Radiant rows + key dialects | R | opus | M | PM-R3 ✓ | queued | |
| 19 | 4 Engine split into concatenated sources | R | opus | L | #23, #24 | queued | |
| 20 | 9 Map fork consolidation | H | opus | M | bridge/MST rulings batch | blocked(rulings) | |
| — | 2 History purge · 3 LICENSE | H | Ben | — | — | Ben-only | |

## Foundry windows

None scheduled. **Deploy fact (2026-09-04):** `module-src-sync.js status` reports the live engine is
the 2026-07-28 version — the 2026-08-10 hygiene campaign (R-60..R-67, live dice math) has not been
deployed. Ben must run `scripts/deploy-to-foundry.bat` before any bench run is meaningful. Lane-B items merge to `main` but stay `bench-pending` until Ben opens a window;
the PM then dispatches one `bench-run` worker (Opus) for the accumulated 🤖 sections.

## Run log

| Date | Item | Model | Duration | Weighted usage | Outcome | PR |
|---|---|---|---|---:|---|---|
| 2026-09-04 | Review (Fable + 4× Opus survey) | fable/opus | ~45 min | 7.0M | Report published; items 15–25 filed | #130 |
| 2026-09-04 | Board + rulings + the two skills (PM, no worker) | fable | ~30 min | — | project-manager + work-item skills written; six rulings answered | #131 |
| 2026-09-04 18:41 | #25 PM tooling (script + Project tab) | sonnet | 15.5 min, 181 turns | 4.4M | merged after review; 4 trailers stripped; 2 out-of-scope finds → item 21 | #132 |
| 2026-09-04 19:02 | #15 Pre-commit shim + reinstall | sonnet | 7 min, 73 turns | 1.3M | merged after review; clean first pass, no trailers | #133 |
| 2026-09-04 19:45 | PM handoff | fable | — | — | loop stopped: window cap reached (2/2), quiet hours next; `edha-pm-daily` created, first run 2026-09-05 ~07:02; next dispatch is #16 (sonnet, S) | #134 |
| 2026-09-04 19:30 | Mobile PM board (Ben's request; PM built it, no worker) | fable | ~40 min | — | `scripts/pm-state.js` + `tests/pm-state.test.js` + `docs/pm-board-mobile.html`; artifact published, `pm/state` seeded; skill gained the push/inbox procedure. Resume check: no worker running, open PRs #103/#93 are unrelated July branches, window still 2/2 → no dispatch. **Not merged**: on branch `claude/mobile-project-dashboard-7kkbuk`, needs a PR + Ben's merge | branch |
