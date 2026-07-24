# Skilltrees — the Edha talent-tree project

**Edha** is a homebrew talent-tree system for the [Cosmere RPG](https://cosmererpg.com/):
five *leyline* color trees, ten *deity* trees, and six *heroic* path trees, each a web of
talents with prerequisites, costs, and automated in-game effects. This repo is the single
source of truth for all of it — the game content and the tools that build it.
*(Unofficial fan content, not affiliated with Brotherwise Games or Dragonsteel.)*

## The two moving parts

| Part | Where it lives | What it is |
|---|---|---|
| **The Foundry module** (`edha-content`) | `module-src/` | A [Foundry VTT](https://foundryvtt.com/) module for the `cosmere-rpg` system (v13 / cosmere-rpg 2.0.x): four compendium packs plus `scripts/register-skills.js`, the single engine file that automates every talent at the table. |
| **The data pipeline** | `data/` + `scripts/` | The canonical JSON: tree structure and prose in `data/leyline.json` / `domain.json` / `cosmere.json`, per-talent authored overrides in `data/authored/`. `scripts/foundry-build.js` compiles it into the module's packs; `scripts/foundry-extract.js` pulls in-Foundry edits back into git. |

The flow, end to end: **edit** (in Foundry or in the JSON) → **extract/build** → **commit** →
**test at the table** → report results → fix → repeat.

> **History:** the repo originally also hosted a browser-side "Leyline Atlas" web app
> (`index.html` + `src/`, served via GitHub Pages) for exploring trees and editing structure.
> It was deprecated once everything moved into the Foundry module and removed on 2026-07-06 —
> it lives on in git history if ever needed.

## Running the checks

Everything is plain Node ≥ 20 and Python 3 — no dependencies to install. CI runs these on
every pull request; run them locally before committing:

```bash
node --check module-src/scripts/register-skills.js    # engine parses
node scripts/validate.js                              # data/*.json schema
node scripts/lint-refs.js                             # data <-> engine cross-reference lint
node tests/run.js                                     # engine unit tests
node scripts/build-dashboard.js --check               # generated docs match their sources
node scripts/build-canon-codex.js --check
node scripts/build-player-primer.js --check
python3 tests/audit_parser_test.py                    # audit-tool unit tests
python3 .claude/skills/leyline-tree-authoring/audit.py   # tree consistency audit (all trees)
```

Or run them all at once with `npm run gates` (see `package.json` for the individual
aliases). Optional one-time setup: `bash scripts/install-hooks.sh` installs a pre-commit
hook that runs the relevant checks automatically.

**Two CI gates are not in `npm run gates`**, because each needs a dependency a fresh clone
may not have. Run them yourself if you touched what they cover, or expect CI to catch it:

```bash
python3 -m pip install pillow && python3 scripts/map/lint_map.py   # map/gazetteer drift

npm install --no-save classic-level@2.0.0                          # compiled-pack validators
EDHA_DATA="$PWD/data" EDHA_MODROOT=/tmp/edha-packs node scripts/foundry-build.js all
EDHA_MODROOT=/tmp/edha-packs node scripts/validate-packs.js
EDHA_MODROOT=/tmp/edha-packs node scripts/validate-adversaries.js
```

## Where to read more

- **`EDHA_FOUNDRY_HANDOFF.md`** — the knowledge base: how the Foundry port works, the
  backlog, and the gotchas. Dated change deltas at the top, reference sections below.
- **`AUTHORING_WORKFLOW.md`** — the edit → extract → build → sync loop for changing talents.
- **`EDHA_TALENT_HANDBOOK.md`** — game-design reference: how to write a talent.
- **`EDHA_FOUNDRY_TEST_CHECKLIST.md`** — per-tree test worklists and current deploy state.
- **`scripts/README.md`** — what each pipeline script does and the pre-commit hook setup.
- **`TODO_REPO_HYGIENE.md`** — open repo cleanup tasks.
- **`CLAUDE.md`** — session context for AI-assisted development on this repo.
