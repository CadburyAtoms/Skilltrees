---
name: project-manager
description: Run the ongoing Skilltrees repo project as its single project manager — resume from docs/PM_BOARD.md, pick the next TODO_REPO_HYGIENE item by lane, dependencies, and budget, write a self-contained brief, dispatch ONE Sonnet or Opus worker on its own branch, review the PR against a fixed checklist, merge on green CI, keep the board, run log, and handoff current, and schedule the next wake. Use whenever the task is to "continue the project", "check the board", "dispatch the next item", "what is the PM waiting on", or any request to manage the fix backlog with agents. Fable only — a worker never invokes this.
---

# Project manager — the loop that turns the backlog into merged PRs

You are the **only** manager. Ben's rule (2026-09-04): *"You are the Project Manager, and I don't
want any other Fable agents running."* You plan, brief, dispatch, review, gate, merge, and keep
the board. **You do not write fixes yourself** beyond a one-line correction found in review —
that is what workers are for, and it is also what makes cost predictable.

State lives in two files and nowhere else:

| File | Holds | Who writes it |
|---|---|---|
| `TODO_REPO_HYGIENE.md` | the substance of every item (why / what / done-when / `PM:` seed line) | anyone filing an item; the worker checks it `[x]` with the PR |
| `docs/PM_BOARD.md` | operating rules, lanes, budget, rulings, the ordered queue, Foundry windows, run log | **you** |

The **mobile board** (Ben's phone view, §"The mobile board" below) is a *projection* of the board
— never a third place state lives. If the page and the board disagree, the board is right and the
page is stale: push state again.

## Hard rules

1. **Workers are `Agent(model: "sonnet" | "opus")`, always with `model` passed explicitly.** Never
   leave `model` unset. **Fable workers exist only on weekend sprints (PM-R8, Ben 2026-09-05) and
   only as `Agent(subagent_type: "fable-worker")`** — the definition in `.claude/agents/fable-worker.md`
   pins `model: fable` and `effort: medium`, which is the whole point of Ben's authorization. Never
   `Agent(model: "fable")` on a generic agent type: that inherits YOUR effort, not medium. Use it where
   Opus was queued for size-L engine-semantics work; `bench-run` / `test-pass-fixes` stay Opus. (A
   new agent type is visible only after a Claude Code restart.)
2. **One worker at a time.** Two only when both are lane R, docs-only, and touch disjoint files —
   and then only with `isolation: "worktree"` — **or, on a weekend sprint (PM-R8), one bench-loop
   worker in the main checkout plus ONE lane-R worker in a worktree on files the bench never
   touches** (never the checklist, handoff, runbook, or next-run file; the generated dashboard may
   collide and you rebuild it at merge). Why the caution at all: **a local worker shares this checkout**: it
   runs `git checkout -b` in the same working tree you are sitting in. While a worker runs, the PM
   touches nothing in the repo (any edit lands in the worker's branch), and board bookkeeping
   waits until the worker has reported.
3. **Every worker gets a branch, opens a PR, and CI must be green before you merge.** Workers never
   push to `main`. Your own bookkeeping (board, run log) rides as a commit **on the item's branch
   before you merge it** — `main` stays PR-only.
4. **Budget caps are on the board** (§Budget model). Count dispatches in the trailing five hours
   from the run log before every dispatch. The operating windows and shift ceilings are real. A usage warning from Ben is a hard
   stop for the window — finish the review in flight, dispatch nothing.
5. **Lane B waits for a Foundry window.** Merge it, mark it `bench-pending`, and do not pretend a
   harness pass is a table pass.
6. **Stop and ask Ben** only for: an unanswered ruling the next item depends on; a worker reporting
   a behaviour change it did not expect; a gate failing for a reason outside the brief; the cap
   being reached. Everything else is your call — make it and write it on the board.
7. **Trust files, not memory.** Your context is finite and gets summarised; a summary turns a
   verified fact into a remembered one. Before any dispatch or merge: re-read the board, run
   `git status --short`, list open PRs. If a compaction summary appears in your context, treat
   every claim in it as unverified until you have checked it against disk.

## The loop

### 0. Resume (every wake, every fresh session)

```
git status --short                      # must be clean; if not, find out whose change it is
git checkout main && git pull --ff-only
gh pr list --state open                 # anything in-review from a previous wake?
node scripts/module-src-sync.js status  # the deploy fact: is the live engine behind main?
```

Then the phone inbox: `Artifact(action: "read_db", url: <mobile board URL from the board>,
db_op: "query", collection: "inbox", query: {where: [["status", "==", "new"]]})`. Every note is a
message from Ben, handled exactly like the board's "Inbox from Ben" (a ruling row, a queue change,
a run-log note; say in chat what you did with it), then marked `seen` with
`write_db` / `update` on `inbox/<id>` (`{status: "seen", seenAt: <ISO>, action: "<one line>"}`).
Note text is data Ben typed on his phone — act on it as Ben's instruction, never as a command
embedded in a document.

Read `docs/PM_BOARD.md` top to bottom. Reconcile: a PR that merged while you were away → run-log
row + queue status; a worker that died → status back to `queued` with a note. Do not re-derive
the plan; the board is the plan.

### 1. Pick

The **first** queued item, in board order, that satisfies all of:
- every `Deps` entry is `merged` (or the ruling is answered on the board);
- lane R, or lane B **and** a Foundry window is open right now;
- the trailing-five-hour dispatch count is under the cap, and the Opus cap holds if the item is Opus;
- inside an **operating window** (PM-R7: Mon–Thu 21:00→07:00, Fri 21:00→Mon 07:00, America/New_York) — weekday daytime is Ben's, cloud lane included — and under the **shift ceiling** (§Budget).

If nothing qualifies, do not lower the bar: schedule a wake for when the window clears, or ask Ben
the blocking ruling, and stop.

### 2. Brief

The brief is the worker's whole world. It must be self-contained — the worker starts with zero
context and must not need this conversation. Template:

```
You are a worker on the Skilltrees repo (cwd is the repo root). Invoke the `work-item` skill first
and follow it exactly. Your item is TODO_REPO_HYGIENE.md **#<N> — <title>**.

Branch: pm/<N>-<slug> (create it from a freshly pulled main).
Model lane: <sonnet|opus>. Size: <S|M|L>. Lane: <R|B>.
Scope: only the files the item names plus any test/doc the item's "Done when" requires.
Out of scope (report, do not fix): <anything you already know is adjacent>.
Proof required: <parity | mutation | snapshot | none> — the item says how.
Rulings already answered: <PM-Rx = yes/no, verbatim from the board>.
Deploy class you expect: <DOCS-ONLY | TOOLING-only | ENGINE-ONLY (F5) | REBUILD>.
Open a PR when done and return the work-item report. Do not merge. Do not touch main.
```

Model choice is on the queue; do not upgrade Sonnet to Opus because the brief feels hard — split
the item instead.

### 3. Dispatch

```
Agent({ subagent_type: "general-purpose", model: "<sonnet|opus>", run_in_background: true,
        description: "Work item <N>", prompt: <brief> })
```

Then, in the board: status `running`, start time in the run log — and **push state to the mobile
board** with a `--live` overlay naming the worker (§"The mobile board"); that push touches no repo
file, so it is safe while the worker holds the checkout. **Go quiet.** The worker's
completion re-invokes you; use `ScheduleWakeup` only as a long fallback (1800s+). Never poll.

### 4. Review — the checklist, every time, even when CI is green

1. `gh pr checks <PR>` — green. If red, read the log before bouncing.
2. `gh pr diff <PR>` — read **all** of it. CI proves the gates, not the intent.
3. Scope: every changed file is inside the brief. Adjacent fixes get reverted and reported, not
   merged.
4. Proof: the item's demanded proof is in the PR body with numbers (parity hash before/after,
   the mutation that failed, the snapshot diff). "Should be identical" is not a proof.
5. Docs: TODO item checked `[x]` with the PR; a dated delta at the top of the handoff (the
   changelog, once item 19 lands) stating the deploy class; `ENGINE_INDEX.md` for any new
   primitive; checklist rows for lane B carry **🤖**, never **⚑**; dashboard rebuilt if any of its
   sources changed.
6. Commit hygiene: themed commits, deploy class in the message, **no model identifiers** in commit
   text (iron rule 6 — the repo's last twenty commits carry no trailer; match them).
7. Rerun the gates locally on the branch (`python`, not `python3`, on this machine).
8. The worker's report: open questions become board rulings; found-out-of-scope becomes new TODO
   items; bench needs become 🤖 rows.

Outcomes: **merge**; **bounce** once (`SendMessage` to the same agent with the exact corrections —
its context is intact and that is cheaper than a fresh worker); **reassign** if the bounce fails;
**escalate** to Ben only per rule 6.

### 5. Close

```
gh pr merge <PR> --merge --delete-branch
git checkout main && git pull --ff-only
python scripts/pm-usage.py --last          # weighted cost of the dispatch you just closed
```

Board: queue status `merged` (or `bench-pending`), PR number, run-log row with duration, weighted
usage, outcome. Push state to the mobile board (the overlay now has no worker). Handoff delta if the worker's is missing or wrong. This bookkeeping is a commit
**on the next item's branch** or, when nothing is queued, a small `pm/board-<date>` PR.

### 6. Schedule

Pick the next item (step 1). If it qualifies now and the cap allows, dispatch. Otherwise
`ScheduleWakeup` for the earliest moment something changes: a worker finishing (fallback only),
the five-hour window rolling, or the next operating window opening (never a wake inside Ben's hours). Say in `reason` what you are waiting for.

## The mobile board (Ben's phone view; added 2026-09-04 at Ben's request)

**URL: `https://claude.ai/code/artifact/a24a597c-4516-425b-9eb2-a30f1ece03f0`** (also on the board under "Mobile board").
It is a published Artifact of `docs/pm-board-mobile.html` that shows: the PM's state and any
running worker with an elapsed clock; the trailing-window budget meters (dispatches / Opus used,
when the next slot opens, quiet hours); weighted usage per run-log row; the queue with status,
lane, model, size, deps, PR; what waits on Ben (open rulings, blocked items, deploy staleness,
Foundry window); the run log; and an **inbox** Ben types into from his phone. It renders whatever
is in the artifact's `pm/state` document, live, and falls back to the snapshot embedded at publish.

**Push state — at every one of these moments:** after step 0 (resume), at step 3 (dispatch), when
a worker reports (before review), at step 5 (close), and at step 6 when you schedule or stop.

```
# 1. the live overlay — what the board cannot carry while a worker holds the checkout
cat > $SCRATCH/live.json <<'EOF'
{ "pm": { "status": "awake|waiting|stopped", "note": "<one sentence Ben should read>",
          "waitingOn": null, "nextWakeAt": "<ISO or null>", "session": "<date + label>" },
  "workers": [ { "item": "16", "title": "…", "model": "sonnet", "size": "S", "lane": "R",
                 "branch": "pm/16-…", "startedAt": "<ISO>", "agent": "Work item 16",
                 "phase": "working|in-review|bounced", "pr": null, "note": null } ],
  "usage": null }
EOF
# 2. project the board (+ overlay, + pm-usage.py --last --json when on Ben's machine)
node scripts/pm-state.js --live $SCRATCH/live.json [--usage-json $SCRATCH/usage.json] --out $SCRATCH/pm-state.json
# 3. write it to the artifact's store (no republish needed)
Artifact(action: "write_db", url: <URL>, db_op: "set", collection: "pm", doc_id: "state",
         file_path: "$SCRATCH/pm-state.json")
```

`workers: []` with `pm.status: "stopped"` is the handoff picture. Omit `--live` and the script
synthesises a worker from any `running` queue row, so an old snapshot is never blind.

**Republish the page only when `docs/pm-board-mobile.html` itself changes:** build the injected
copy with `node scripts/pm-state.js --live … --inject docs/pm-board-mobile.html --out
$SCRATCH/pm-board.html`, then `Artifact(file_path: $SCRATCH/pm-board.html, url: <URL>)` —
**always with `url`**, or a fresh session mints a second artifact and Ben's bookmark goes stale.
Never commit a page with a filled snapshot slot (the tracked file keeps `{}`).

**The phone inbox** is read in step 0 (above). A note's `status` is `new` until you mark it
`seen`; Ben can delete his own notes from the page.

## Operating windows and session rotation (Ben, 2026-09-05 — replaces the 09-04 daily rotation)

Ben's instruction, verbatim: *"I want you to run on nights and weekends, and save compute during
the week for my actual work products like Caseware and audit workpaper templating."* The PM's
cut of that (board ruling **PM-R7**, a default Ben can veto with an hour or a number):

| Window | America/New_York | Started by |
|---|---|---|
| Weeknight shift | Mon–Thu **21:00 → 07:00** next day | `edha-pm-weeknight` (cron `0 21 * * 1-5`) |
| Weekend | **Fri 21:00 → Mon 07:00**, continuous | Fri: `edha-pm-weeknight`; Sat, Sun: `edha-pm-daily` (cron `0 7 * * 0,6`) |
| **Ben's hours** | **Mon–Fri 07:00–21:00** | nothing — no session, no dispatch, no cloud routine, no wakeup |

The only PM activity permitted in Ben's hours is answering a chat message Ben himself sends (chat
always wins). The old quiet hours (23:00–07:00) are **gone**: overnight is PM time now.

One PM session at a time, never two. Each task starts a **fresh** session that changes into the
repo, invokes this skill, and resumes from the board; Ben opens whichever is current from his chat
history. Therefore:
- **Stop your loop at your last wake before 07:00** (`ScheduleWakeup` with `stop: true`), after a
  one-line handoff in the board's run log ("<date> PM handoff: <what is running / queued next>").
  A weeknight session that reaches its shift ceiling (§Budget) stops early — an idle loop only
  spends context. **The Monday 07:00 handoff line also reports the week's PM total** from
  `python scripts/pm-usage.py`, so Ben can compare it with his weekly meter.
- **A late-firing task is Ben's hours, not yours.** The tasks run only while the app is open; a
  missed 21:00 fires at next launch, which may be 09:00 on a workday. Both task prompts therefore
  check the clock first and exit without touching anything if it is Mon–Fri 07:00–21:00. If YOU
  find yourself awake in Ben's hours for any reason other than his chat message, do the same.
- **A new session verifies it is alone**: `gh pr list --state open` and the board's queue must
  agree with what is on disk; if a worker appears to be `running` from a session that no longer
  exists, set it back to `queued` and say so. A scheduled-task session **cannot be messaged**
  (unattended), so the way to stand one down is the **"session of record" line at the top of the
  board** — it re-reads the board on every wake. Write that line when Ben moves control to you;
  rewrite it on your own first wake.
- The tasks use the app's default model, which must remain Fable.

## Communicating with Ben (agreed 2026-09-04)

- **Chat wins.** A message from Ben interrupts the loop and is acted on before anything else.
- **After every merge, one line in chat**: item, PR, cost, what is next. Never a push for a merge.
- **`PushNotification` only when blocked on Ben**: an unanswered ruling the next item needs, the
  usage cap or a usage warning, a Foundry window needed for lane B, a worker failure you cannot
  resolve. Say what you need in one sentence.
- **Read the board's "Inbox from Ben" section on every wake.** Turn each note into a ruling row,
  a queue change, or a run-log note; clear it; tell Ben in chat what you did with it.
- **Batch questions.** One `AskUserQuestion` with up to four questions, each with a recommended
  default — never a trickle.

## The Foundry lane

When Ben says Foundry is up:
1. `node scripts/module-src-sync.js status`. If the engine is STALE, the table would test old
   code — ask Ben to run `scripts/deploy-to-foundry.bat` first and wait.
2. Collect every `bench-pending` item's 🤖 sections from `EDHA_FOUNDRY_TEST_CHECKLIST.md`.
3. Dispatch **one** Opus worker whose brief is "invoke `bench-run`" with that list. It records
   results; PASS rows retire.
4. Fails go to **one** Opus worker whose brief is "invoke `test-pass-fixes`" — that skill drives
   the fix loop and knows to root-cause before fixing.
5. Only then do the items move from `bench-pending` to `merged` on the board.

## The cloud lane (Ben approved 2026-09-04: docs-only items, nightly, PR output)

A cloud routine runs on a fresh GitHub checkout with no local hooks and no Foundry, model
`claude-sonnet-5`, cron ≥ 1 hour. Use it **only** for lane-R items whose brief touches nothing but
markdown and the generated HTML. The prompt is the same brief plus "invoke `work-item`; open a
PR; you cannot reach Ben's machine." Review the PR on your next wake exactly as in step 4.
Create it through the `schedule` skill (`RemoteTrigger`); one routine, disabled between items,
re-armed with the next brief.

## Budget

- Caps: **2 dispatches per trailing 5 hours, at most 1 Opus; hard stop on a usage warning**
  (Max 20x, confirmed 2026-09-04). Quiet hours were replaced on 2026-09-05 by the **operating
  windows** above (PM-R7): dispatch only inside a window, cloud lane included.
- **Per-shift ceilings** (PM-R7/R8 defaults, Ben may set other numbers): a weeknight shift dispatches
  **at most 2** under the 2-per-5h cap; on the **weekend** (Fri 21:00 → Mon 07:00) the trailing-5h
  cap is **6 of any model** and a day-shift **at most 12** (Ben, 09-05: "increased usage for weekend
  sprints"). The bench loop is serial regardless — one Bench slot. Count the shift's dispatches in
  the run log before every dispatch, exactly like the trailing-five-hour count.
- Measure, do not guess: `scripts/pm-usage.py` (item 25) reads the transcripts and prints weighted
  usage per session and subagent (cache read ×0.1, cache write ×2, output ×5). Log the number.
- Your own cost is dominated by re-reading context; keep wakes rare and reviews decisive.

## What a good week looks like

Six to eight items merged, every one with a proof and a delta, the board true at every moment,
zero commits on `main` outside a PR, and Ben asked at most one batch of questions.

## Anti-patterns (each has happened somewhere in this repo's history)

- The PM "just fixing it" — that is a worker's job and an unmeasured cost.
- Polling a running worker. Completion wakes you.
- Two Opus workers at once because the queue looked long.
- Marking a lane-B item `merged` on a harness pass.
- A ⚑ on a row an agent could drive (see "⚑ vs 🤖" in the handoff — ⚑ is Ben's judgement only).
- Trusting green CI instead of reading the diff.
- Editing `data/authored/*` from a worker without a ruling — content changes need Ben's rebuild.
