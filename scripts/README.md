# scripts/

Utilities for the Edha Foundry data pipeline. The per-tool reference (what to run when,
Foundry open/closed, etc.) is the toolbox table in `AUTHORING_WORKFLOW.md`. To run every gate
these tools are checked by (schema, lint, tests, docs-in-sync, audits), see `gates.js` below —
`node scripts/gates.js --list` prints the ordered list.

This table is checked against `git ls-files scripts` by `node scripts/check-scripts-readme.js`
(item 21) — every tracked file under `scripts/` (except this README and anything under `map/`,
which gets one folder row) must have a row here, and every row must name a file that still
exists. Run it after adding, removing, or renaming a script.

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
| `foundry-build-parts.js`   | Pure, dependency-free pieces of the generator, `require()`-able from tests — `foundry-build.js` itself can't be (it resolves `classic-level` at load and runs its whole build in a top-level async IIFE) |
| `foundry-extract.js`       | Pull in-Foundry talent edits back into `data/authored/`             |
| `edha-pack-io.js`          | Shared pack read/write + authored-field projection, used by both `foundry-build.js` and `foundry-extract.js` |
| `author-rules.js`          | Splice authored `events`/`effects` onto talents safely (Foundry DocumentIdField length/charset, no accidental overwrite) — the rule-2b migration's authoring tool |
| `handler-schemas.js`       | Parses the engine's registered handler-config field schemas, so authoring tools can catch a field Foundry's DataModel would otherwise silently drop |
| `gates.js`                 | The ONE gate list (item 20): runs every gate in order, resolves `python3`/`python`/`py -3` itself, never stops on the first failure. `node scripts/gates.js --list` prints the list; `--ci` adds the two gates needing an optional dependency (Pillow, `classic-level`); `--only <id>[,<id>]` runs just those (used by `npm run test` / `npm run audit`). Backs `npm run gates` / `gates:ci` and the CI `validate.yml` job. |
| `validate.js`              | Schema checks for `data/leyline.json` / `domain.json` / `cosmere.json`, plus the tree-graph acyclic/reachability check (iron rule 7) |
| `validate-packs.js`        | Post-build pack check (needs the compiled packs — bench only)       |
| `validate-adversaries.js`  | Same for the adversary pack incl. baked effect keys                 |
| `lint-refs.js`             | Data↔engine cross-reference lint: authored `edha-*` handler types/kinds/statusIds must have engine dispatch sites; engine talent-name literals must resolve to a talent and stay within the rule-2b ratchet (see `tests/` for the unit suites) |
| `check-2b-classification.js` | Keeps `EDHA_RULE_2B_CLASSIFICATION.json` honest: its per-talent entries must agree with the ratchet list it describes and its own summary counts |
| `inspect-pack.js`          | Print a talent's rules/effects exactly as Foundry loads them        |
| `check-scripts-readme.js`  | Diffs this table against `git ls-files scripts` and exits 1 on drift (item 21's verifier; not wired into `gates.js` — see the item's PM note) |
| `build-dashboard.js`       | Checklist + TODO docs + art wishlist + handoff §9 + campaign canon/state + map paint flags + `docs/PM_BOARD.md` → `EDHA_DASHBOARD.html`, the tabbed all-in-one dashboard Ben works from (Bench/Art/Worldbuilding/Engine/Repo/⚖ Rulings/Project/⚑ For Ben; `--check` = CI/pre-commit drift gate). Replaced `build-test-sheet.js` 2026-07-18 — bench marks carry over. Also a module since 2026-09-05: `buildModel()` / `renderHtml()` / `mobileSnapshot()` — the same tab model as JSON for the mobile PM board's Dashboard section (`pm-state.js` consumes it; the parity with the HTML's row ids is pinned in `tests/pm-state.test.js`). |
| `build-canon-codex.js`     | `EDHA_CAMPAIGN_CANON.md` + `source-materials/maps/thyrcross.map.json` → `EDHA_CANON_CODEX.html`, Ben's pan/zoom map + canon browser (`--check` = CI/pre-commit drift gate) |
| `build-player-primer.js`   | Player-facing Edha primer (lore + talent atlases) → `EDHA_PLAYER_PRIMER.html` (`--check` = CI/pre-commit drift gate) |
| `build-map-picker-asset.js`| Generates the creation wizard's "Where are you from?" map-picker data asset from the Thyrcross gazetteer |
| `dump-native-vocabulary.js`| Paste-into-Foundry console snapshot of the cosmere-rpg system's OWN event/handler vocabulary (12 handlers + 17 events) → `data/native-vocabulary.json`; the edha-* engine types are an ADDITION to this, not the whole vocabulary |
| `sync-art.js`              | Mirror Ben's hand-drawn adversary art from `source-materials/art/adversaries/` into the live module's `art/adversaries/` |
| `pm-usage.py`              | Zero-dependency weighted usage ledger for the PM workflow: reads `~/.claude/projects/<repo>/` session transcripts (+ subagent transcripts) and prints weighted totals (`--session <id>`, `--last`, `--json`). Run with `python`, not `python3`. |
| `pm-state.js`              | Projects `docs/PM_BOARD.md` (+ an optional `--live` overlay and `pm-usage.py --json` output) into the JSON the mobile PM board reads; `--dashboard-dir dir` writes the sharded dashboard documents (`dash/index` + `dash/c0…`, each under the store's 256 KiB cap, with a `manifest.json` carrying the write_db batch) so the phone shows every EDHA_DASHBOARD.html row too; `--inject docs/pm-board-mobile.html --out …` embeds both into the page for publishing. The board stays the source of truth; see project-manager SKILL.md §"The mobile board". |
| `talent-icons.js`          | Icon assignment helper                                              |
| `module-src-sync.js`       | Mirror the hand-edited live module runtime ↔ `module-src/` in this repo (push/pull) |
| `bench-setup-console.js`   | Paste-into-Foundry console setup/repair for the 16-PC bench roster ("Bench — <Tree>" per leyline color + deity path, plus "Bench — Heroic") the `# BENCH —` checklist sections run on |
| `schema-dump-console.js`   | Paste-into-Foundry console dump of the system's item/currency schemas (read-only) → commit to `source-materials/system-schemas/`; unblocks the §9h equipment work |
| `items-dump-console.js`    | Paste-into-Foundry console dump of item/culture/ancestry schemas (read-only, 2026-07-18 §9j) → `source-materials/system-schemas/`; the full read that supersedes `heroic-schema-dump-console.js`'s narrower one |
| `heroic-schema-dump-console.js` | ⚠ SUPERSEDED (2026-08-10) by `items-dump-console.js` — kept only for provenance of the schemas already committed from it |
| `deploy-to-foundry.bat`    | Ben's one-click deploy: build all packs + validate + copy into the live module (Foundry must be closed) |
| `run-playtest-build.bat`   | One-click deity+heroic build + validate → `scripts/build-log.txt`   |
| `pre-commit`               | Thin shim copied into `.git/hooks/` by the installer — execs `pre-commit-body` (data validate, dashboard `--check`, lint-refs + engine tests) so edits to the body are live without reinstalling |
| `pre-commit-body`          | The actual pre-commit hook logic the shim execs; includes the dashboard-source-doc list (item 21) |
| `install-hooks.sh`         | Copies `pre-commit` into `.git/hooks/` and marks it executable      |
| `purge-binaries-from-history.sh` | ⚠ DESTRUCTIVE, one-off: rewrites ALL git history to purge deleted PDFs/PNGs (TODO_REPO_HYGIENE item 2 step 2) and force-pushes `main` — read the file's own warning before ever running it |
| `engine-idiom-ratchet.json`| Frozen ratchet (2026-08-10) of hand-rolled engine idioms that duplicate canonical helpers already elsewhere in the engine; shrink-only |
| `name-keyed-allowlist.json`| The iron-rule-2b ratchet: the talent names the engine mentioned in code as of 2026-07-24; shrink-only, enforced by `lint-refs.js` pass 7 |
| `lib/paths.js`             | Shared location constants (DATA/MODROOT/ATLAS_PACK, env-overridable) for the build/lint/validate scripts |
| `lib/data.js`              | Shared data-loading primitives (`loadJson`, `normRow`, …) for the build/lint/validate scripts |
| `lib/md.js`                | Shared markdown engine for the three HTML doc builders (`build-dashboard.js` / `build-canon-codex.js` / `build-player-primer.js`) |
| `lib/build-doc.js`         | Shared `--check`/write/exit skeleton for the generated-doc builders (the same four as above plus `dump-native-vocabulary.js`) |
| `lib/strip-comments.js`    | The comment-stripped-engine-text primitive (`stripComments`/`codeOnly`), used by `lint-refs.js` and stripped-source-equality proofs |
| `lib/handler-type-guard.js`| `checkHandlerTypes` — the item-64 build guard: both pack writers in `foundry-build.js` refuse any document whose `system.events` carries an `edha-*` handler type the engine never registers (`parseHandlerSchemas` is the record); catches GENERATED rules that lint-refs pass 9 cannot see because they never appear in `data/`. Pinned in `tests/handler-type-guard.test.js` |
| `lib/consume-guard.js`     | `checkConsumeEntries` — the R-22 build guard (item 60): fails on any `consume` entry with `value.min !== value.max`, since `edhaConsumeList` only ever refunds `min`. Called by `lint-refs.js` pass 23; pinned in `tests/consume-guard.test.js` |
| `map/`                     | World-map toolchain (extract layers from Ben's `.procreate`, measure distances/travel days, render labeled maps, trace nations/rivers/hydrology, settle the gazetteer, `lint_map.py` the CI docs-vs-gazetteer drift gate) against `source-materials/maps/thyrcross.map.json` — see CLAUDE.md's map row for the full picture; one row here rather than one per file |

> The old GitHub Pages atlas publish flow (`publish.sh` / `publish.bat`) was removed
> 2026-07-06 along with the browser atlas app; commit `data/` with normal git (the
> pre-commit hook still validates).
