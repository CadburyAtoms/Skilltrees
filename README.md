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

Everything is plain Node ≥ 20 and Python 3 — no dependencies to install for the local set.
`scripts/gates.js` is the one authoritative gate list (CI and local runs share it); run
`node scripts/gates.js` before committing, or `node scripts/gates.js --list` to see the ordered
list without running anything. It also resolves whichever of `python3` / `python` / `py -3`
actually works, so it runs the same way regardless of which one is on your PATH.

`node scripts/gates.js --ci` (what CI runs) additionally runs the two gates that need an
optional dependency a fresh clone may not have — the map/gazetteer lint (Pillow) and the
compiled-pack build + validators (`classic-level`) — both installed just-in-time inside the gate.

Or use the npm aliases: `npm run gates` / `npm run gates:ci` (see `package.json`). Optional
one-time setup: `bash scripts/install-hooks.sh` installs a pre-commit hook that runs the
relevant checks automatically.

## Where to read more

- **`EDHA_FOUNDRY_HANDOFF.md`** — the knowledge base: how the Foundry port works, the
  backlog, and the gotchas. Dated change deltas at the top, reference sections below.
- **`AUTHORING_WORKFLOW.md`** — the edit → extract → build → sync loop for changing talents.
- **`EDHA_TALENT_HANDBOOK.md`** — game-design reference: how to write a talent.
- **`EDHA_FOUNDRY_TEST_CHECKLIST.md`** — per-tree test worklists and current deploy state.
- **`scripts/README.md`** — what each pipeline script does and the pre-commit hook setup.
- **`TODO_REPO_HYGIENE.md`** — open repo cleanup tasks.
- **`CLAUDE.md`** — session context for AI-assisted development on this repo.
