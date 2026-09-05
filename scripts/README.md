# scripts/

Utilities for the Edha Foundry data pipeline. The per-tool reference (what to run when,
Foundry open/closed, etc.) is the toolbox table in `AUTHORING_WORKFLOW.md`.

## One-time setup

```bash
bash scripts/install-hooks.sh
```

Installs `scripts/pre-commit` (a thin shim) as `.git/hooks/pre-commit`. The shim execs
`scripts/pre-commit-body`, so an edit to the body is live on your very next commit — you only
need to re-run this if the shim itself changes. From then on, any commit that touches
`data/*.json` is gated by `scripts/validate.js`, and commits touching the engine, authored data,
or tests also run `lint-refs.js` + the unit suites. Bypass with `git commit --no-verify` if you
ever need to.

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
| `build-dashboard.js`       | Checklist + TODO docs + art wishlist + handoff §9 + campaign canon/state + map paint flags + `docs/PM_BOARD.md` → `EDHA_DASHBOARD.html`, the tabbed all-in-one dashboard Ben works from (Bench/Art/Worldbuilding/Engine/Repo/⚖ Rulings/Project/⚑ For Ben; `--check` = CI/pre-commit drift gate). Replaced `build-test-sheet.js` 2026-07-18 — bench marks carry over. Also a module since 2026-09-05: `buildModel()` / `renderHtml()` / `mobileSnapshot()` — the same tab model as JSON for the mobile PM board's Dashboard section (`pm-state.js` consumes it; the parity with the HTML's row ids is pinned in `tests/pm-state.test.js`). |
| `pm-usage.py`              | Zero-dependency weighted usage ledger for the PM workflow: reads `~/.claude/projects/<repo>/` session transcripts (+ subagent transcripts) and prints weighted totals (`--session <id>`, `--last`, `--json`). Run with `python`, not `python3`. |
| `pm-state.js`              | Projects `docs/PM_BOARD.md` (+ an optional `--live` overlay and `pm-usage.py --json` output) into the JSON the mobile PM board reads; `--dashboard-dir dir` writes the sharded dashboard documents (`dash/index` + `dash/c0…`, each under the store's 256 KiB cap, with a `manifest.json` carrying the write_db batch) so the phone shows every EDHA_DASHBOARD.html row too; `--inject docs/pm-board-mobile.html --out …` embeds both into the page for publishing. The board stays the source of truth; see project-manager SKILL.md §"The mobile board". |
| `talent-icons.js`          | Icon assignment helper                                              |
| `module-src-sync.js`       | Mirror the live module runtime ↔ `module-src/` in this repo         |
| `playtest-setup-console.js`| Paste-into-Foundry console setup for playtest characters            |
| `schema-dump-console.js`   | Paste-into-Foundry console dump of the system's item/currency schemas (read-only) → commit to `source-materials/system-schemas/`; unblocks the §9h equipment work |
| `run-playtest-build.bat`   | One-click deity+heroic build + validate → `scripts/build-log.txt`   |
| `pre-commit`               | Thin shim copied into `.git/hooks/` by the installer — execs `pre-commit-body` (data validate, dashboard `--check`, lint-refs + engine tests) so edits to the body are live without reinstalling |
| `install-hooks.sh`         | Copies `pre-commit` into `.git/hooks/` and marks it executable      |

> The old GitHub Pages atlas publish flow (`publish.sh` / `publish.bat`) was removed
> 2026-07-06 along with the browser atlas app; commit `data/` with normal git (the
> pre-commit hook still validates).
