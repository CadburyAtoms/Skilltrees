# Skilltrees — the Edha talent-tree project

**Edha** is a homebrew talent-tree system for the [Cosmere RPG](https://cosmererpg.com/):
five *leyline* color trees, ten *deity* trees, and six *heroic* path trees, each a web of
talents with prerequisites, costs, and automated in-game effects. This repo is the single
source of truth for all of it — the game content, the tools that build it, and two ways to
play with it. *(Unofficial fan content, not affiliated with Brotherwise Games or Dragonsteel.)*

## The three moving parts

| Part | Where it lives | What it is |
|---|---|---|
| **The Atlas** (web app) | `index.html` + `src/` | A browser app for exploring the trees and building characters — served with GitHub Pages, no build step. Also the in-browser editor for tree structure. |
| **The Foundry module** (`edha-content`) | `module-src/` | A [Foundry VTT](https://foundryvtt.com/) module for the `cosmere-rpg` system (v13 / cosmere-rpg 2.0.x): four compendium packs plus `scripts/register-skills.js`, the single engine file that automates every talent at the table. |
| **The data pipeline** | `data/` + `scripts/` | The canonical JSON: tree structure and prose in `data/leyline.json` / `domain.json` / `cosmere.json`, per-talent authored overrides in `data/authored/`. `scripts/foundry-build.js` compiles it into the module's packs; `scripts/foundry-extract.js` pulls in-Foundry edits back into git. |

The flow, end to end: **edit** (in Foundry or in the JSON) → **extract/build** → **commit** →
**test at the table** → report results → fix → repeat.

## Running the checks

Everything is plain Node ≥ 20 and Python 3 — no dependencies to install. CI runs these on
every pull request; run them locally before committing:

```bash
node --check module-src/scripts/register-skills.js    # engine parses
node scripts/validate.js                              # data/*.json schema
node scripts/lint-refs.js                             # data <-> engine cross-reference lint
node tests/run.js                                     # engine unit tests
python3 tests/audit_parser_test.py                    # audit-tool unit tests
python3 .claude/skills/leyline-tree-authoring/audit.py   # tree consistency audit (all trees)
```

Optional one-time setup: `bash scripts/install-hooks.sh` installs a pre-commit hook that
runs the relevant checks automatically.

## Where to read more

- **`EDHA_FOUNDRY_HANDOFF.md`** — the knowledge base: how the Foundry port works, the
  backlog, and the gotchas. Dated change deltas at the top, reference sections below.
- **`AUTHORING_WORKFLOW.md`** — the edit → extract → build → sync loop for changing talents.
- **`EDHA_TALENT_HANDBOOK.md`** — game-design reference: how to write a talent.
- **`EDHA_FOUNDRY_TEST_CHECKLIST.md`** — per-tree test worklists and current deploy state.
- **`docs/BUILD_FLOW.md`** — proposed build tooling migration for the web app.
- **`scripts/README.md`** — the publish workflow and what each script does.
- **`TODO_REPO_HYGIENE.md`** — open repo cleanup tasks.
- **`CLAUDE.md`** — session context for AI-assisted development on this repo.
