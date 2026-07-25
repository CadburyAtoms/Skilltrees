---
name: test-pass-fixes
description: Triage and fix EDHA in-Foundry test results in the Skilltrees repo. Use whenever Ben reports playtest or test-pass outcomes — freeform chat notes, "X didn't work / fired twice / showed the wrong text", a pasted "EDHA bench results" block (from EDHA_DASHBOARD.html's Copy-for-Claude button), an xlsx results sheet, or marked-up EDHA_FOUNDRY_TEST_CHECKLIST.md rows — for any tree or engine behavior. Drives the full loop; parse reports → establish deploy state → audit the whole tree → root-cause (never symptom-patch) → batch rulings → fix via shared engine primitives → gates → delta/checklist/index docs. Read CASE_STUDIES.md (this folder) before diagnosing anything.
---

# Test-pass fixes — from Ben's results to a shipped, documented pass

This skill encodes the workflow that produced the 07-05 Black test-pass fixes (PR #56) — the
reference for what a good pass looks like. The failure mode it guards against: **fixing each
reported symptom where it was observed**, one narrow patch per report, deciding design questions
silently, and leaving no trail. Every phase below exists because skipping it shipped a real bug.

**Read `CASE_STUDIES.md` in this folder first** — seven short worked examples of the reasoning
this skill demands. `.claude/skills/leyline-tree-authoring/` remains the authoring/consistency
standard and `ENGINE_INDEX.md` (there) the engine map; this skill drives the *loop*, that one
sets the *bar*.

The phases run in order. Phases 0–3 are read-only — **do not write a fix, or even decide on one,
until Phase 3 has a written root cause for every row.**

---

## Phase 0 — Parse the report into a worklist

Input is usually **freeform chat notes** (sometimes an xlsx, checked-off checklist rows, or a
pasted **"EDHA bench results"** block — same treatment). The bench-results block comes from the
**Copy for Claude** button on `EDHA_DASHBOARD.html` (Bench tab — the human-facing view of the
checklist, see Phase 7; it replaced the retired `EDHA_FOUNDRY_TEST_SHEET.html` on 2026-07-18):
rows arrive pre-labeled `PASS / FAIL / PARTIAL / SKIP` with Ben's note
quoted and the source section named, and the `@<hash>` stamp in its first line tells you exactly
which checklist revision Ben was testing from (match it against `git log` — a stale stamp is
deploy-state evidence for Phase 1). Ben's quoted notes are still *symptoms*, not causes.
Normalize into a numbered worklist, one row per observation:

```
N. <Tree> / <Talent or subsystem> — EXPECTED (from the card/checklist) vs OBSERVED (Ben's words, verbatim)
```

- **Resolve talent names carefully.** 28 talent names collide across trees (365 talents → 337
  unique). Resolve by tree context; match Ben's nicknames/shorthand against `data/authored/` names
  and the tree's checklist section. If a note could mean two different talents or two different
  behaviors, it becomes a **clarification row** for the Phase-4 rulings menu — don't guess, and
  don't stall on it either.
- **Nothing is too small for a row.** Offhand remarks ("also the label looked weird", "felt slow")
  are rows. The 07-05 "blank card" aside turned out to share a root cause with two Fail rows.
- **Passes and partials are data too.** A Partial tells you which half of a mechanic fired —
  that's a diagnostic clue, not a lower-priority Fail.
- Cross-reference the tree's checklist section (`EDHA_FOUNDRY_TEST_CHECKLIST.md`) and
  `python3 .claude/skills/leyline-tree-authoring/audit.py <tree> --checklist` to see what Ben was
  *supposed* to be testing — unmentioned ⚑ rows are open questions to carry forward, not passes.

## Phase 1 — Establish deploy state before believing any bug

Ben's machine lags `main`. Packs may be frozen at an old build; owned talents are **snapshots**
until ⟳ Sync; the engine mirror may predate recent merges. So, before diagnosing:

1. Read the **DEPLOY STATE** section at the top of `EDHA_FOUNDRY_TEST_CHECKLIST.md` (called
   "DEPLOY FIRST" before 2026-07-16d) and the recent handoff delta headers — anything marked
   "pack rebuild deferred" or "NO pack rebuild" tells you what was live when Ben tested.
   **Check the section's own date against `git log` first.** Only Ben can advance it, so it goes
   stale silently: on 2026-07-24 it was dated 07-18 and claimed currency through PR #97 while
   `main` was at PR #126. A DEPLOY STATE older than the newest handoff delta is not evidence —
   it is a question for Ben.
2. For every "wrong text / old behavior / thing I thought we fixed" row, check `git log` for that
   talent/engine area: **if the repo already has the fix and it postdates the last deploy, the row
   is a stale pack/snapshot, not a repo bug.** Say so in the delta and move on (worked example:
   Unnerving Approach, CASE_STUDIES §3).
3. If notes don't say whether Ben rebuilt/synced before testing, add it as a clarification row —
   but diagnose the rest assuming the checklist's deploy state.

## Phase 2 — Audit wider than the report

Reported bugs cluster; unreported drift hides next to them. Before fixing the reported rows, run
the **full description-vs-implementation audit of the whole tree**:

- Read every card in `data/authored/<atlas>-<tree>.json` against the tree's section in
  `module-src/scripts/register-skills.js` (start from the section header comment — it enumerates
  what's wired) and against any authored `events`/`effects` on the cards themselves.
- **When the report is about an adversary**, the "whole tree" is the whole ACTOR (and its folder-
  mates): read every `data/adversaries.json` ability's text/rider against its `events` rules and
  any engine name-wiring, per the standard in `leyline-tree-authoring` SKILL.md §"Adversary
  abilities". Reachability counts as wiring only if you traced it (CASE_STUDIES §8 — The Seeming's
  case existed and was dead: type gates, missing flags, unregistered handler types all kill a
  "wired" path silently).
- Run the gate: `python3 .claude/skills/leyline-tree-authoring/audit.py <tree>`.
- Every drift found — text says X, engine does Y, in either direction — joins the worklist as a
  new row, whether or not Ben noticed it. (07-05: six drifted cards beyond the reports.)

## Phase 3 — Root-cause every row (the heart of the pass)

For each row, **write down the causal chain before proposing any change**: which hook fired →
which handler/rule ran → which write produced what Ben saw. Read the actual code path; never
reason from the report alone.

Discipline:

- **The report's causal story is a hypothesis, not a finding.** Ben reports correlations
  ("the passive only works after the active") — verify against the code before accepting
  (CASE_STUDIES §1: the real cause was a tagged focus-write the watcher ignored).
- **Group before fixing.** Sort rows by the code path they touch. Multiple symptoms on one path =
  probably ONE bug (CASE_STUDIES §2: three reports, one formula-substitution cause). Fix counts
  follow root-cause counts, not report counts.
- **Check the trigger's semantics, not just its presence.** A hook that "works" can mean the wrong
  thing — `edha-deal-damage` fires on the attack ROLL (even a miss); "on hit" needs `edha-on-hit`
  (CASE_STUDIES §6). The handoff §10 gotchas list is exactly this kind of trap — reread it.
- **Decide which side is canonical.** Card text and engine can disagree in either direction
  (CASE_STUDIES §7: the engine was right, the Cost line lied). Pick canon (usually the ruling or
  the handbook), then align *all three layers*: authored JSON + source prose, engine, docs.
- **Re-litigate "manual by nature".** If a row touches a talent previously declared manual, ask:
  can I *name the specific hook* now? If yes it's buildable (CASE_STUDIES §4: Dread Presence's
  `preUpdateToken` veto). The "name the hook" test from the authoring skill is the arbiter.

Label every row with one of: **stale-deploy** · **text-drift** (say which side is canon) ·
**engine-bug** · **wrong-trigger-semantics** · **design-gap** (mechanic missing entirely) ·
**ruling-needed** · **works-as-designed** (explain why the observation is correct behavior).

## Phase 4 — Batch the rulings

Rows labeled ruling-needed, plus every clarification row, go to Ben as **ONE decision menu**:
concrete options, a recommended default per question, consequences stated in game-table terms.
Use `AskUserQuestion` when the session is interactive; when it isn't, apply the recommended
defaults, proceed, and open the delta with a **"Rulings (Ben, <date>)"** section that states each
default taken so Ben can veto asynchronously.

Never stall the mechanical fixes on the rulings — sequence the work so stale-deploy/text-drift/
engine-bug rows land while rulings are pending.

## Phase 5 — Fix: primitives over point fixes

For each root cause, in this order:

1. **Grep `ENGINE_INDEX.md` first** — the primitive you need may already exist. Reuse beats
   rebuild, always (the cardinal rule).
2. **Apply the generalization test:** would ≥2 trees, or every future pass, plausibly want this
   shape? Signals: the mechanic is core-rules (Opportunity, Reactions, injuries), the same pattern
   appears in another tree's "still to build" header, or the fix is a labeled/formatted version of
   something every trigger does (roll cards, formula folding). If yes → build it **generic**
   (`edha<Verb><Noun>`), register it properly, wire the reported talent as the *first consumer*,
   and record it in `ENGINE_INDEX.md` + the delta's "New REUSABLE primitives" section
   (CASE_STUDIES §5: the Opportunity menu began as a one-talent report).
3. **Fix in the right layer.** text-drift → `data/authored/<file>` AND the source prose
   (`data/leyline.json` / `domain.json`) together; engine-bug / wrong-trigger-semantics →
   `register-skills.js`; design-gap → primitive + rule/wiring. Prefer engine-only (no pack
   rebuild) when both routes work; if authored data changed, the pass needs a rebuild — track it.
4. **Retrofit sibling consumers.** If the root cause is a shared path (a trigger's semantics, a
   formula helper), fix every consumer, not just the reported one — grep the engine for the
   pattern before closing the row.
5. **One commit per fixed item** (the 07-04 rule), each passing the Phase-6 gates. Small themed
   commits; no model identifiers in commit text.

## Phase 6 — Gates (every commit)

```bash
node --check module-src/scripts/register-skills.js
node scripts/validate.js
python3 .claude/skills/leyline-tree-authoring/audit.py <tree>     # exit 0; run for EVERY touched tree
```

`validate-packs.js` needs Ben's compiled LevelDB packs — skip locally, note the deferred rebuild.
If a fix spans trees (a shared primitive), run `audit.py` for every tree whose talents it touches.

## Phase 7 — Leave the trail

The pass isn't done when the code is: the docs ARE the knowledge transfer to the next session.

1. **Dated delta at the TOP of `EDHA_FOUNDRY_HANDOFF.md`**, matching the established format:
   ```
   ## <YYYY-MM-DD> DELTA — <TREE> test-pass fixes (<headline items>; ENGINE-only → F5 | ENGINE + data → pack rebuild deferred (`foundry-build <atlas>`) + ⟳ Sync)
   ### Rulings (Ben, <date> — [batched decisions taken / defaults applied])
   ### Bug root causes (the Fail/Partial rows)      ← one bullet per ROOT CAUSE, naming the rows it explains
   ### New REUSABLE primitives                       ← what later trees/passes can call
   ### Known limits / couldn't self-verify (no Foundry session)   ← every ⚑
   ```
   The "Bug root causes" section is the load-bearing one — write *causes*, not *changes* (the
   07-05 delta is the model).
2. **Checklist:** add/refresh the tree's re-test rows in `EDHA_FOUNDRY_TEST_CHECKLIST.md` for every
   fix, ⚑-flagging each row the engine can't guarantee (DOM injections, dialog interactions,
   at-the-table feel, anything you couldn't self-verify). State the deploy requirement at the
   section top (rebuild? sync? relaunch? F5?).
   **Then regenerate the dashboard:** `node scripts/build-dashboard.js` and commit the updated
   `EDHA_DASHBOARD.html` in the same commit — CI and the pre-commit hook fail on a stale
   dashboard (`--check`). The MD is the only thing you edit; the HTML is generated, never
   hand-touched. (This replaced `build-test-sheet.js` / `EDHA_FOUNDRY_TEST_SHEET.html`, both
   deleted 2026-07-18.)
   Write rows knowing how they surface there: the row's **first bold run is its label** in Ben's
   copied results (bold the talent name first), section-title/prose keywords ("pack rebuild",
   "⟳ Sync", "relaunch", "F5", "engine-only") become the section's deploy chips, and **rewording a
   row resets Ben's saved mark for it** — so reword when the test changed (a re-test is wanted) and
   leave text alone when it didn't.
3. **`ENGINE_INDEX.md`:** every new primitive/helper/event/handler, with its signature and one
   line on when to reach for it.
4. **Backlog hygiene:** if a fix resolved a §9 backlog item, move it to §9g; if diagnosis exposed
   a new blocked-on-system limit, add it to §9c/§9d with the specific blocker named.
5. Push to the designated branch. If Ben asked for a PR, the body mirrors the delta's structure.

---

## Quick self-check before pushing

- [ ] Every worklist row has a written root cause and a category label — including the ones that
      turned out to be stale-deploy or works-as-designed.
- [ ] No fix landed at the point of the symptom without the causal chain traced to its source.
- [ ] Families were fixed once, at the shared cause, with sibling consumers retrofitted.
- [ ] Anything that passed the generalization test shipped as a registered, indexed primitive.
- [ ] Card text, source prose, engine, and docs agree for every touched talent.
- [ ] Rulings were batched with defaults, not dribbled or silently decided.
- [ ] Delta + checklist + ENGINE_INDEX updated; ⚑ on everything unverifiable from here.
- [ ] Bench sheet regenerated (`node scripts/build-test-sheet.js`) and committed with the
      checklist edit — `--check` green.
- [ ] Each commit states engine-only vs pack-rebuild-needed; gates green on all of them.
