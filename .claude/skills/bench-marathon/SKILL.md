---
name: bench-marathon
description: ORCHESTRATE a multi-run EDHA bench marathon — dispatch bench-run and test-pass-fixes subagents in sequence, deploy the engine between them, keep a defect ledger, and curate one final report for Ben. Use when the task is to run the bench "to completion", "autonomously", "until the checklist is exhausted", across several trees or sections, or any request that implies more than one bench run plus the fixes between them. For a SINGLE run, invoke bench-run directly instead.
---

# Bench-marathon — orchestrating the fix→deploy→bench loop

You are the **orchestrator**. You do not drive Foundry and you do not write fixes. You dispatch
subagents, verify their work actually landed, deploy between phases, keep the ledger, and write the
one document Ben reads at the end.

Read `docs/BENCH_MARATHON_REPORT.md` if it exists — the 2026-07-26/27 marathon (six bench runs,
seven fix passes, 46 commits) is the worked example this skill is distilled from.

## Before starting — verify, then say so

1. Foundry answers at `http://localhost:30000` (open the browser pane at it).
2. The **edha** world is open and `Bench` is **selectable** on `/join` (passwordless). If Bench is
   greyed out, a previous session never logged out — **stop and tell Ben**, do not force it.
3. `git status` clean, and you know which branch you're on.

If any fail, stop and report. Do not start a marathon you cannot finish.

## The loop — strictly sequential

There is **ONE Bench slot and one repo**. Never run two phases at once; never run two subagents
concurrently. Each phase completes and is verified before the next starts.

### 1. FIX PASS — dispatch a `test-pass-fixes` subagent

Give it the newest run's fail batch **by pointing at the dated handoff delta**, not by re-describing
the defects. Tell it to *verify* each root cause in code, not re-derive it. Always include:

- Engine-only preferred (iron rule 1). Data/pack fixes: implement + commit + mark
  **BLOCKED-ON-DEPLOY**, and **never build packs while Foundry is running** — scratch-`EDHA_MODROOT`
  builds for validation only. It must never run `module-src-sync.js` or `deploy-to-foundry.bat`;
  deploying is yours.
- Gates individually before every commit. `python`, never `python3`. No `;`-chaining. **Never pipe a
  gate through `tail`** — it masks the exit code, and three sessions slipped on this.
- Small themed commits, one per defect. No model identifiers, no `Co-Authored-By`.
- Dated delta + checklist rows + DEPLOY STATE + ENGINE_INDEX + dashboard rebuild.
- Design questions are never decided silently — new judgment calls come back in a
  "FOR THE RULINGS BATCH" list.
- Push at the end. No PR.

**Second attempts are different.** If a fix already failed once at the bench, say so in the prompt,
call it **attempt 2 of a maximum 2**, and tell the agent that if it cannot land a root-cause fix with
high confidence it must **queue the defect for Ben with its analysis rather than ship a guess**.
After two failed attempts, stop fixing it and carry it in the report.

### 2. DEPLOY — yours alone, and always the same three steps

```bash
node scripts/module-src-sync.js status
```

- **`= in sync`** — nothing to deploy; skip to step 3.
- **`~ STALE`** — expected after a fix pass; push.
- **`! HAND-EDITED`** — Ben edited the live engine. **Do not push.** Pull it into the repo, commit
  it, then continue.

Then push and **verify by hash** — never assume the copy landed:

```bash
node scripts/module-src-sync.js push
```

```bash
git hash-object "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content/scripts/register-skills.js"
```

Compare against `git rev-parse HEAD:module-src/scripts/register-skills.js`. Equal = deployed. Tell
the next bench run the deploy is verified **and** have it re-verify by hash on its own join —
counting marker occurrences is not a deploy check, and a prompt carrying remembered counts went
stale within one run.

### 3. BENCH RUN — dispatch a `bench-run` subagent

Point it at `docs/BENCH_NEXT_RUN.md` (each run rewrites that file for the next one) and add:

- The browser pane's state and tabId; if it cannot reach the pane, **stop and report** — no workarounds.
- Which deploys are live (hash-verified) and which halves are still BLOCKED-ON-DEPLOY. A blocked row
  is recorded blocked, **never failed against a stale pack**.
- **Re-test the rows the fix pass just restored, FIRST.** A fix that still fails goes back to step 1
  with quoted evidence — no mid-run diagnosis, no mid-run fixing.
- The standing rules (below) verbatim.
- **Log out at the end without fail** — the next subagent cannot join otherwise. Include this even
  when telling it to abort early.
- One commit per run; rewrite `BENCH_NEXT_RUN.md` for the run after.

### 4. ORCHESTRATE — verify, then decide

**Never trust a subagent summary without the commit.** Every run:

```bash
git log --oneline -3
```

plus `git status --short` (must be clean) and `git rev-parse HEAD origin/<branch>` (must match).
Read the delta for anything the summary glossed. Then update the ledger and pick the next phase.

When a report contains a claim its own evidence cannot support, **push back**. In the worked
marathon a run claimed it had cleaned up an orphan token; asked how it knew, it found its snapshot
had only captured ids and **retracted the claim**, and the retraction had to be chased into two
documents that had already repeated it.

## Sizing runs — the mistake to avoid

**Size the run to the section, not the section to the run.** The worked marathon scheduled Heroic —
133 talents, ~298 rows, larger than all ten deity trees' bench rows combined — as one quarter of a
single "final sweep" run. It got 16 rows. Two deity trees per run was right; Heroic needs **several
dedicated runs of its own**, split by path.

Before scheduling, count the rows:

```bash
grep -c "^- \[ \]" EDHA_FOUNDRY_TEST_CHECKLIST.md
```

Per section, then split the count by marker — **and read the markers correctly, because getting this
wrong cost a whole marathon**:

- **🤖 = the bench queue. These ARE yours.** Count them; they are the work you are scheduling.
- **⚑ = Ben's judgment** (design, feel, balance, a ruling). Subtract them — not yours to run.
- **No marker** = repo-side and settled. Not a bench row.

Until 2026-07-27w ⚑ meant "could not self-verify (no Foundry here)" and this skill said "⚑ rows are
Ben's by nature", which was true only before `bench-run` existed. **A five-run marathon skipped ~201
agent-drivable rows on that sentence.** If a section reads as almost entirely ⚑, that is a re-tagging
bug, not a light section — say so instead of scheduling around it.

If the plan Ben gave you is undersized for what is actually open, **say so and adjust** — "adjust
freely based on what's actually open" is standing permission, and not using it is how a section gets
skipped while looking scheduled.

## The standing rules — pass these to EVERY bench subagent, verbatim

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene (combats stay INACTIVE via `ui.combat.initialize({combat})`). Create only in the
  Edha Bench folders. Leave Ben's campaign combat alone.
- **Snapshot ids, flags AND EFFECTS at start**, and never delete anything the snapshot doesn't prove
  you created. A run that snapshotted only ids and flags deleted four pre-existing effects off
  campaign adversaries and could only restore two.
- **Never resolve a token by NAME when duplicates exist** — use the id or `actorId`.
- Cleanup is an id-diff against the run's **own** start snapshot. The roster tokens stay placed.
- Design/feel/balance questions are **never decided silently** — they accumulate into ONE batch,
  and the standing decisions doc is `EDHA_RULINGS.md`.
- **⚑ = leave it; 🤖 = that is your queue.** ⚑ is Ben's judgment only — feel, design, balance, a
  ruling. 🤖 means "needs a table, an agent can drive it", and that is exactly what you are.
  Multi-client rows are **🤖, not ⚑** — `PlayerBench` exists. A row you could not reach stays 🤖 or is
  recorded BLOCKED with its blocker named; **never re-file it as ⚑**.
- **Only claim what your own logs support; label inferences as inferences.**

## The ledger — keep it in the scratchpad, not the repo

One markdown file, updated after every phase. It is the raw material for the report:

- **Defect tracker**: id · symptom · run found · fix status (commit) · re-test verdict. Track fix
  *attempts* so the max-2 rule is enforceable.
- **Rulings batch**: every design/feel question, numbered, with the recommended default and which run
  saw it. Merge duplicates as they recur — the same scope question surfaced in all six runs.
- **Deploy queue**: every BLOCKED-ON-DEPLOY item as it lands.
- **World hygiene**: anything touched outside the bench folders, repaired or not.
- **Phase log**: one line per phase with the commit.

## The report — what Ben actually reviews

`docs/BENCH_MARATHON_REPORT.md`, and then repoint `docs/BENCH_NEXT_RUN.md` at it. Six sections:

1. **Per-section disposition** — retired / open / of-which-🤖 (still the bench's) / of-which-⚑
   (Ben's) / blocked, with row counts. Say plainly how much of "open" is Ben's by nature; a raw open
   count overstates *his* remaining work by a lot, and a raw ⚑ count overstates it further if the
   re-tagging has drifted. Include an honest **NOT REACHED** list — that is a deliverable, not a
   failure, and those rows stay 🤖.
2. **Every defect: found → fixed → re-tested**, with commit refs, grouped by the run that found it.
   State the **verified** root cause, and where it **diverged from the bench's inference**.
3. **The rulings batch — APPEND IT TO `EDHA_RULINGS.md`, do not re-list it in the report.** That
   file is the single standing decisions doc (repo root); the report links to it. Each new ruling
   gets the next number, its recommended default, and the run or checklist row it came from.
   Anything applied-as-default is flagged for veto — especially anything that changes live dice math.
   A ruling duplicated into the report drifts the moment Ben answers it.
4. **The deploy queue in order**, with what each rebuild unlocks and what to re-test after.
5. **The two-client list** — these are **🤖**, not ⚑: `PlayerBench` makes them drivable. Separately
   list rows that are genuinely **BLOCKED**, each with its named blocker.
6. **World hygiene**, including anything left unrepaired.

Then: rebuild the dashboard, run every gate individually, push, and close with a one-screen
**MARATHON COMPLETE** (or **STOPPED AT X, WHY**) summary in chat.

## Hard stops — finish docs for completed work, commit, push, report

- Foundry unreachable, or the Bench slot held by a session that never logged out.
- The same gate failing twice for unrelated reasons.
- Anything that would require touching non-bench documents to proceed.
- A subagent terminating mid-phase (API limit, crash). **Check what actually landed before
  re-dispatching** — in the worked marathon a fix pass died after all five fix commits but before its
  docs commit, and the right move was to finish the docs inline, not re-run the fixes.

## What made the worked marathon work

- **Verify the root cause in code before touching anything.** Four root causes contradicted the
  bench's own confident inference, and following the inference would have shipped a wrong fix each
  time. Both second attempts landed only because the second pass went back to the installed cosmere
  system and Foundry source instead of iterating on the first guess.
- **Ask "one bug or a family?"** Two sightings of raw i18n keys were nine sites. One dead field was
  three bugs across three files.
- **Build the gate, not just the fix.** Three lint passes came out of that marathon and are worth
  more than any individual fix in it.
