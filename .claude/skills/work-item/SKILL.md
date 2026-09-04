---
name: work-item
description: The worker contract for one PM-dispatched TODO_REPO_HYGIENE item in the Skilltrees repo — read the item and the board's rules, work on the assigned branch only, prove what the item demands (pack parity, mutation, snapshot), run every gate with the Windows-safe interpreter, write the docs the change obliges, open a PR, and return a fixed-shape report. Invoke whenever a brief says "your item is TODO_REPO_HYGIENE.md #N" or asks you to work an item from docs/PM_BOARD.md. Sonnet or Opus workers; never merge, never touch main.
---

# Work-item — one item, one branch, one PR, one report

You were dispatched by the project manager with a brief that names your item number, branch,
lane, size, and required proof. The brief is your scope. **The item's text in
`TODO_REPO_HYGIENE.md` is your specification** — its "What to do" is the plan and its "Done when"
is the acceptance test. You do not decide what else to fix; you report it.

## 0. Read before touching anything

1. Your item in `TODO_REPO_HYGIENE.md` (`## <N>.`) — all of it, including the `PM:` line.
2. `docs/PM_BOARD.md` → "Operating rules" and the ruling your item depends on, if any.
3. `CLAUDE.md` → "Iron rules" 1, 2a, 4, 5, 6, and "How to think here". Root-cause before fixing.
   Primitives over point fixes. Never chain gates with `;` or pipe them through `tail`.
4. If the item touches the engine: `.claude/skills/leyline-tree-authoring/ENGINE_INDEX.md`
   (grep it; do not scan the 19k-line engine). If it touches a ratchet:
   `.claude/skills/talent-migration/LESSONS.md`.
5. `git status --short` must be empty. If it is not, stop and say so in your report.

## 1. Branch

```
git checkout main && git pull --ff-only
git checkout -b <branch from the brief>
```

Any pack build goes to a **scratch** module root — never Ben's live one:

```
EDHA_DATA="$PWD/data" EDHA_MODROOT="$TEMP/edha-packs-<N>" node scripts/foundry-build.js all
```

(`classic-level` is needed off-Foundry: `npm install --no-save classic-level@2.0.0`.)

## 2. Forbidden — no exceptions, no matter what you find

- Editing `data/authored/*.json` (content needs Ben's rebuild + a ruling).
- Touching the live module under `AppData/Local/FoundryVTT`, running `deploy-to-foundry.bat`,
  `module-src-sync.js push`, or anything that needs Foundry (the bench is a different worker).
- Deleting or moving files the item does not name.
- Editing `docs/PM_BOARD.md` — the PM owns it. Put board-worthy facts in your report instead.
- Pushing to `main`, merging, or force-pushing anything.
- Passing your own work to another agent. You are the worker.

Found something adjacent and wrong? One line in the report under "Found out of scope". Do not fix
it, even when it is a one-liner — the PM files it and it gets its own proof.

## 3. Work

- **Root cause first.** Reproduce the defect the item describes before changing code (a failing
  command, a wrong build report count, a test that should fail and does not).
- **Smallest change that meets "Done when".** No drive-by refactors, no renames the item did not
  ask for, no new dependencies.
- **Proofs are evidence, not adjectives.** The item names one of:
  - *parity* — build the affected packs into a scratch root before and after, hash every pack
    directory (`find <dir> -type f -exec sha256sum {} +` sorted), and paste both hashes;
  - *mutation* — temporarily re-introduce the defect (or break the fixture) and paste the failing
    gate/test line, then restore;
  - *snapshot* — pin the before-shape in a test, make the change, show the test still passes;
  - *stripped-source equality* — for comment-only changes, `codeOnly(before) === codeOnly(after)`
    via `scripts/lib/strip-comments.js`.
- A fix whose root cause is a pure helper ships **with** a pinned regression in `tests/`.

## 4. Gates — all of them, one per line, on this machine

```
node --check module-src/scripts/register-skills.js
node scripts/validate.js
node scripts/lint-refs.js
node tests/run.js
node scripts/build-dashboard.js --check
node scripts/build-canon-codex.js --check
node scripts/build-player-primer.js --check
python tests/audit_parser_test.py
python .claude/skills/leyline-tree-authoring/audit.py
```

`python3` is not on Ben's PATH — use `python`. If you touched `source-materials/maps/**`, also
`python scripts/map/lint_map.py`. If you touched the build or the data, also the scratch pack build
plus `validate-packs.js` and `validate-adversaries.js` with `EDHA_MODROOT` pointed at the scratch
root. Paste the last line of each gate into the report. A red gate you cannot explain from your own
change is a stop-and-report, not a thing to fix.

## 5. Docs the change obliges (iron rule 5)

- Check your item `[x]` in `TODO_REPO_HYGIENE.md` with the date and the PR number (you know the
  number after `gh pr create`; amend the commit).
- A dated delta at the **top** of `EDHA_FOUNDRY_HANDOFF.md` (or `docs/handoff-changelog/` once
  item 19 has landed): `## 2026-MM-DD — <what changed> (<DOCS-ONLY | TOOLING-only | ENGINE-ONLY, F5 | REBUILD + ⟳ Sync>)`,
  five to fifteen lines, what and why, what was proven, what is 🤖 for the bench.
- New engine primitive → a row in `ENGINE_INDEX.md`.
- Lane B → rows in `EDHA_FOUNDRY_TEST_CHECKLIST.md` marked **🤖** (an agent can drive them).
  **⚑ is Ben's judgement only** — never put it on something a bench run can settle, and never on a
  `##` header.
- Any change to a dashboard source doc (the TODO file, the checklist, the handoff, …) →
  `node scripts/build-dashboard.js` and commit `EDHA_DASHBOARD.html` in the same PR.

## 6. Commit and PR

- Small themed commits. Subject states the deploy class: `(DOCS-ONLY)`, `(TOOLING-only)`,
  `(ENGINE-ONLY, F5)`, or `(REBUILD)`. **No model identifiers anywhere in commit text.**
- `git push -u origin <branch>` then `gh pr create --base main` with body sections
  **What / Proof / Gates / Docs / Open questions**. Do not merge. Do not request review from
  anyone; the PM finds the PR.

## 7. Report — your final message, in exactly this shape

```
ITEM: #<N> — <title>
BRANCH / PR: <branch> — <PR url>
DEPLOY CLASS: <DOCS-ONLY | TOOLING-only | ENGINE-ONLY (F5) | REBUILD + Sync>
FILES CHANGED: <list>
WHAT CHANGED: <three lines max>
ROOT CAUSE (if a defect): <one line, with file:line>
PROOF: <the hashes / the failing mutation line / the snapshot result — numbers, not adjectives>
GATES: <one line per gate: name → last output line>
DOCS: <TODO checked · delta written · index/checklist rows · dashboard rebuilt>
BENCH ROWS ADDED: <ids, or none>
FOUND OUT OF SCOPE: <one line each, or none>
OPEN QUESTIONS FOR THE PM: <or none>
RISK: <low | medium | high> — <why, one line>
```

If you could not finish: same shape, `PR: none`, and a **BLOCKED:** line saying exactly what
stopped you and what you tried. A partial branch pushed with a clear report is worth more than a
silent stop.
