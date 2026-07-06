# scripts/

Utilities for the Edha Foundry data pipeline. The per-tool reference (what to run when,
Foundry open/closed, etc.) is the toolbox table in `AUTHORING_WORKFLOW.md`.

## One-time setup

```bash
bash scripts/install-hooks.sh
```

Installs `scripts/pre-commit` as `.git/hooks/pre-commit`. From then on, any commit that
touches `data/*.json` is gated by `scripts/validate.js`, and commits touching the engine,
authored data, or tests also run `lint-refs.js` + the unit suites. Bypass with
`git commit --no-verify` if you ever need to.

## Files

| File                       | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `foundry-build.js`         | Compile `data/` → the module's compendium packs (Foundry CLOSED)    |
| `foundry-extract.js`       | Pull in-Foundry talent edits back into `data/authored/`             |
| `edha-pack-io.js`          | Shared pack read/write + authored-field projection                  |
| `validate.js`              | Schema checks for `data/leyline.json` / `domain.json` / `cosmere.json` |
| `validate-packs.js`        | Post-build pack check (needs the compiled packs — bench only)       |
| `validate-adversaries.js`  | Same for the adversary pack incl. baked effect keys                 |
| `lint-refs.js`             | Data↔engine cross-reference lint: authored `edha-*` handler types/kinds/statusIds must have engine dispatch sites; engine talent-name literals must resolve to a talent (see `tests/` for the unit suites) |
| `inspect-pack.js`          | Print a talent's rules/effects exactly as Foundry loads them        |
| `talent-icons.js`          | Icon assignment helper                                              |
| `module-src-sync.js`       | Mirror the live module runtime ↔ `module-src/` in this repo         |
| `playtest-setup-console.js`| Paste-into-Foundry console setup for playtest characters            |
| `run-playtest-build.bat`   | One-click deity+heroic build + validate → `scripts/build-log.txt`   |
| `pre-commit`               | The actual hook script. Copied into `.git/hooks/` by the installer  |
| `install-hooks.sh`         | Copies `pre-commit` into `.git/hooks/` and marks it executable      |

> The old GitHub Pages atlas publish flow (`publish.sh` / `publish.bat`) was removed
> 2026-07-06 along with the browser atlas app; commit `data/` with normal git (the
> pre-commit hook still validates).
