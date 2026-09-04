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
| `build-dashboard.js`       | Checklist + TODO docs + art wishlist + handoff §9 + campaign canon/state + map paint flags + `docs/PM_BOARD.md` → `EDHA_DASHBOARD.html`, the tabbed all-in-one dashboard Ben works from (Bench/Art/Worldbuilding/Engine/Repo/⚖ Rulings/Project/⚑ For Ben; `--check` = CI/pre-commit drift gate). Replaced `build-test-sheet.js` 2026-07-18 — bench marks carry over. |
| `pm-usage.py`              | Zero-dependency weighted usage ledger for the PM workflow: reads `~/.claude/projects/<repo>/` session transcripts (+ subagent transcripts) and prints weighted totals (`--session <id>`, `--last`, `--json`). Run with `python`, not `python3`. |
| `talent-icons.js`          | Icon assignment helper                                              |
| `module-src-sync.js`       | Mirror the live module runtime ↔ `module-src/` in this repo         |
| `playtest-setup-console.js`| Paste-into-Foundry console setup for playtest characters            |
| `schema-dump-console.js`   | Paste-into-Foundry console dump of the system's item/currency schemas (read-only) → commit to `source-materials/system-schemas/`; unblocks the §9h equipment work |
| `run-playtest-build.bat`   | One-click deity+heroic build + validate → `scripts/build-log.txt`   |
| `pre-commit`               | The actual hook script. Copied into `.git/hooks/` by the installer  |
| `install-hooks.sh`         | Copies `pre-commit` into `.git/hooks/` and marks it executable      |

> The old GitHub Pages atlas publish flow (`publish.sh` / `publish.bat`) was removed
> 2026-07-06 along with the browser atlas app; commit `data/` with normal git (the
> pre-commit hook still validates).
