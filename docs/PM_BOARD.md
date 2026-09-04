# PM Board — the ongoing repo project (started 2026-09-04)

The scheduling state for the project that works `TODO_REPO_HYGIENE.md` items 4–25 (and whatever
gets added). **Substance lives in the TODO file; this board holds only order, ownership, status,
cost, and the decisions the PM is waiting on.** The operating procedure is
`.claude/skills/project-manager/` (PM) and `.claude/skills/work-item/` (workers) — once item 25
lands. A fresh PM session resumes from this file alone.

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
- **Stop and ask Ben** when: a ruling below is unanswered and the next item depends on it; a
  worker reports a behaviour change it did not expect; gates fail for a reason outside the brief;
  or the usage cap for the window is reached.

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

Working estimates for dispatches (to be replaced by measured rows in the run log):

| Dispatch | Estimate |
|---|---:|
| Sonnet, size S (edit + gates + report) | 0.3–0.6M |
| Sonnet, size M | 0.6–1.2M |
| Opus, size S | 0.8–1.5M |
| Opus, size M | 1.5–3M |
| Opus, size L (two PRs, parity proofs) | 3–5M |
| PM review + merge per item | 0.2–0.4M |

**Caps (PROPOSED — waiting on ruling PM-R6):** at most 2 dispatches per 5-hour window, at most
1 of them Opus; the PM wakes on worker completion, not on a timer, with a 30-minute fallback;
no dispatch between 23:00 and 07:00 America/New_York unless it is a cloud routine; hard stop the
moment Ben reports a usage warning. Reserve roughly a third of the weekly allowance for Ben's own
sessions.

## Rulings the PM is waiting on

| Id | Question | Recommended default | Blocks |
|---|---|---|---|
| **PM-R1** | Handoff split shape: reference stays at `EDHA_FOUNDRY_HANDOFF.md` (≤800 lines, with TOC); dated deltas move verbatim to `docs/handoff-changelog/2026-MM.md`; `HANDOFF_ARCHIVE.md` folds in. | Yes as stated | #19 |
| **PM-R2** | Archive moves: `EDHA_EDITABILITY_AUDIT.md` and `Actor pages design review/` to `docs/archive/` with pointer stubs; prune the four clean stale worktrees under `.claude/worktrees/`. | Yes to all three | #21 (partly) |
| **PM-R3** | The 225 Radiant-order rows in `data/cosmere.json`: park in `source-materials/` if no consumer reads them. | Park them | #22 |
| **PM-R4** | Branch policy: PR per item, PM merges after green CI (vs. direct to `main`). | PR per item | every dispatch |
| **PM-R5** | Cloud lane: allow scheduled cloud routines (Sonnet, fresh GitHub checkout, PR output) for lane-R docs work overnight, so progress does not depend on the app being open. | Yes, docs-only items, one routine, nightly | optional |
| **PM-R6** | Usage tier and caps: which plan, and are the proposed caps right. | The caps above | every dispatch |

## Queue (in order)

Status: `queued` · `briefed` · `running` · `in-review` · `merged` · `blocked(<ruling>)` · `bench-pending`

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 25 PM tooling (script + dashboard tab; PM writes skills) | R | sonnet | M | — | queued | |
| 2 | 15 Pre-commit shim + reinstall | R | sonnet | S | — | queued | |
| 3 | 16 Build fails loudly on a broken overlay | R | sonnet | S | — | queued | |
| 4 | 17 Heroic ids into `data/` | R | sonnet | S | — | queued | |
| 5 | 20 One gate list, Windows-clean gates | R | sonnet | M | — | queued | |
| 6 | 21 Stale-doc sweep | R | sonnet | S | PM-R2 for the moves | queued | |
| 7 | 18 Overlay name-collision guard | R | opus | S | #16 | queued | |
| 8 | 19a Handoff reference rewrite | R | opus | L | PM-R1 | blocked(PM-R1) | |
| 9 | 19b Handoff changelog move + dashboard re-point | R | opus | M | 19a | blocked(PM-R1) | |
| 10 | 5 Hook-firing test driver | R | opus | L | — | queued | |
| 11 | 23 Banner the unbannered engine lines | R | opus | M | — | queued | |
| 12 | 24 Table-driven handler registry | B | opus | L | #23 | queued | |
| 13 | 11 Path-literal scripts onto `lib/paths.js` | R | sonnet | S | — | queued | |
| 14 | 13 `resourceWrite` sites onto `edhaSpendResource` | B | opus | M | — | queued | |
| 15 | 14 `userTargets` sites onto the reader | B | opus | S | — | queued | |
| 16 | 12 `edhaDefBuffGmGate` at the 20 sites | B | opus | M | — | queued | |
| 17 | 10 Disposition fail-open backlog (76 sites, batched) | B | opus | L | — | queued | |
| 18 | 22 Radiant rows + key dialects | R | opus | M | PM-R3 | blocked(PM-R3) | |
| 19 | 4 Engine split into concatenated sources | R | opus | L | #23, #24 | queued | |
| 20 | 9 Map fork consolidation | H | opus | M | bridge/MST rulings batch | blocked(rulings) | |
| — | 2 History purge · 3 LICENSE | H | Ben | — | — | Ben-only | |

## Foundry windows

None scheduled. Lane-B items merge to `main` but stay `bench-pending` until Ben opens a window;
the PM then dispatches one `bench-run` worker (Opus) for the accumulated 🤖 sections.

## Run log

| Date | Item | Model | Duration | Weighted usage | Outcome | PR |
|---|---|---|---|---:|---|---|
| 2026-09-04 | Review (Fable + 4× Opus survey) | fable/opus | ~45 min | 7.0M | Report published; items 15–25 filed | — |
