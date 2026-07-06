# scripts/

Utilities for the Skilltrees publish workflow.

## One-time setup

```bash
bash scripts/install-hooks.sh
```

Installs `scripts/pre-commit` as `.git/hooks/pre-commit`. From then on, any
commit that touches `data/*.json` is gated by `scripts/validate.js`. Bypass with
`git commit --no-verify` if you ever need to.

## Daily workflow

After ✓ Done Editing → Confirm save in the editor, three options to publish:

**A. In-browser push (best, zero terminal)** — Click ⌘ GitHub in the masthead,
paste a Personal Access Token with `Contents: Read and write` on this repo.
From then on, ✓ Done Editing → Confirm save commits and pushes automatically.

**B. One-line publish** — Either:

```bash
bash scripts/publish.sh "atlas edits"
```

or on Windows, double-click `scripts/publish.bat`. Validates, stages, commits,
pushes.

**C. Manual git** — Same as before:

```bash
git add data && git commit -m "atlas edits" && git push
```

The pre-commit hook will still validate before letting the commit through.

## Files

| File                     | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `validate.js`            | Node CLI that runs the same schema checks as the in-browser preview |
| `lint-refs.js`           | Data↔engine cross-reference lint: authored `edha-*` handler types/kinds/statusIds must have engine dispatch sites; engine talent-name literals must resolve to a talent (see `tests/` for the unit suites) |
| `publish.sh`             | Validate → add → commit → push                                      |
| `publish.bat`            | Windows wrapper that invokes `publish.sh` via Git Bash              |
| `pre-commit`             | The actual hook script. Copied into `.git/hooks/` by the installer  |
| `install-hooks.sh`       | Copies `pre-commit` into `.git/hooks/` and marks it executable      |

## Cache busting reminder

Whenever you edit a file under `src/`, bump the `?v=...` query string in
`index.html` so returning visitors don't run stale cached JS.
