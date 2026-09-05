# Moving the repo off OneDrive — the brief (2026-09-05)

Written for Ben by the weekend PM session, after two workers and one deploy hit OneDrive on
2026-09-04/05. Substance for **TODO_REPO_HYGIENE.md item 32**; that item tracks it on the board.

## The short answer

**Yes, move it.** Every OneDrive-specific failure in the run log goes away the moment the working
tree and `.git` stop living under a synced folder, and nothing the repo needs *has* to stay in
OneDrive except two hand-drawn inputs, which have easy answers below. Do it as a **fresh clone**
into a short path, not a folder move. About 20 minutes of Ben's time plus one small repo-side PR
first.

## What OneDrive has actually cost so far (measured, not feared)

| When | What happened | Mechanism |
|---|---|---|
| 2026-09-04, twice | `deploy-to-foundry.bat` hung on git's console question *"Deletion of directory … failed. Should I try again? (y/n)"* — once on a stale July worktree record, once on an emptied `refs/remotes/origin/pm` folder. | OneDrive sets the **read-only attribute on every directory under `.git`** (Ben counted 308 of 308). Git for Windows clears read-only before deleting a *file* but not a *directory*, treats the refusal as "in use", and asks. In an agent shell there is no console, so the same failure is **silent** (`Permission denied`). PR #139 works around it (clear the flag on every `.git` directory at each deploy, feed git `< nul`). |
| 2026-09-05, PM session | A PM worktree could not be created at the session scratchpad path. | **MAX_PATH.** The OneDrive root is 74 characters; Claude Code derives the transcript/scratchpad folder name from the full cwd, so the scratchpad path alone is ~165 characters before a single repo file. This repo's longest tracked paths are 92 characters. The workaround was "put PM worktrees under `C:/tmp`". |
| 2026-09-05, PR #139's worker | Had to build its proof in `%TEMP%` instead of the scratchpad, for the same MAX_PATH reason. | Same. |
| 2026-09-05, PM-R8 | The new `fable-worker` agent definition was invisible to git. | Not OneDrive — `.gitignore` ignores `.claude/*` and only un-ignored `skills/`; `agents/` was added in #148. Listed here because it arrived in the same batch of "the agent couldn't see the file" reports. Fixed. |

Expected but **not yet observed** here, listed so nobody is surprised: OneDrive re-uploading the
~180 MB `.git` pack after every `gc`; a sync pass touching `.git/index` mid-commit; Files
On-Demand dehydrating a file git then reports as changed. A local SSD removes all three classes.

## The one folder that holds the repo

```
C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\
```

Everything git tracks (40 MB in the working tree) is inside it, and it is pushed to GitHub, so
**GitHub is already the backup for every tracked file**. Nothing tracked is lost by leaving
OneDrive. The things that live *outside* it and are unaffected: the live Foundry module
(`%LOCALAPPDATA%\FoundryVTT\Data\modules\edha-content`, deliberately never under OneDrive), the
cosmere-rpg system, and Foundry itself.

## Inventory of what is in that folder but NOT tracked — move it, leave it, or delete it

| Path (inside the repo folder) | What it is | Verdict |
|---|---|---|
| `.git\` | The history. ~180 MB packed, most of it the 18 MB Stormlight PDF and ~100 MB of superseded map-PNG revisions (item 2's purge would shrink it). Every directory carries OneDrive's read-only flag. | **Do not copy.** Clone fresh. Copying carries the read-only flags and any sync damage with it. |
| `source-materials\maps\Thycross.procreate` (+ any `.psd`) | Ben's Procreate world map, 230 MB+, gitignored. The iPad delivers it *through* OneDrive. | **Not bloat, but leave it in OneDrive.** `extract_procreate.py` takes the file path as its argument, so pass the OneDrive path when re-extracting. `paint_overlay.py`'s staleness check is silent when the file is absent — by design. |
| `source-materials\art\adversaries\` | Hand-drawn adversary art. **Tracked** (it is a build input), but the iPad drops new files into it *via OneDrive*. | The existing files clone with the repo. For **new** drops, see "The two iPad paths" below. |
| `node_modules\`, `package-lock.json` | `classic-level` for off-Foundry pack builds. | Leave. Reinstall on demand: `npm install --no-save classic-level@2.0.0`. |
| `.claude\worktrees\` | Four stale July worktrees + `focused-booth-7259bf` (Ben's #139 session) + `agent-a100f1efd45d7e319` (item 31's worker). | Leave. Once #139 and #150 are merged, every one of them is dead. |
| `.claude\settings.local.json`, `CLAUDE.local.md` (if present) | Per-machine permission allowlist and local notes; gitignored by `.claude/*` and `*.local.*`. | **Copy** if they exist — they are the only untracked files worth carrying. |
| `data\authored\.baselines\` | Orphan. The build guard's baseline moved to `<modroot>\.baselines` on 2026-07-26; nothing reads this one. | Delete. |
| `exports\`, `tmp\`, `scripts\build-log.txt`, `*.local.*`, `__pycache__\` | Scratch and caches. | Leave. |
| `screenshots\`, `src\` (empty) | Leftovers of the removed atlas app (item 21). | Delete. |
| Any leftover `*.pdf` / pasted `*.png` | Gitignored since 2026-07-06. | Leave. |

## The two iPad paths (the only real dependency on OneDrive)

1. **The map** (`Thycross.procreate`): already handled above — it stays in OneDrive and the
   extraction script is pointed at it by argument. No code change.
2. **Adversary art drops** (`source-materials\art\adversaries\`): today "save from the iPad into
   OneDrive → it is already in the repo folder → deploy installs it" (bench-proven 2026-07-15c).
   After the move the iPad export lands in OneDrive, not the repo. **Recommended default:** keep a
   OneDrive folder called `Edha art drop`, and move files from it into the repo folder before the
   deploy that installs them — one drag per drop, and the deploy already validates filenames.
   **Zero-friction alternative** if drops become frequent: a directory junction so that *just that
   subfolder* of the repo IS the OneDrive folder (`mklink /J "<repo>\source-materials\art\adversaries" "<OneDrive>\…\Edha art drop"`); git treats a junction as an ordinary directory, and the folder never empties, so the read-only-directory bug cannot bite it. Pick the default first.

## Repo-side changes that must land BEFORE the move (one worker PR, lane R)

These are the only places the repo knows its own OneDrive address. Left alone, the deploy script
would silently build packs from the **old** `data\` folder if it still existed, or fail if it did
not.

- `scripts/foundry-build.js:33` — `DATA` defaults to the absolute OneDrive literal. Use
  `require("./lib/paths").DATA` (repo-relative). This is **item 11** on the board; promote it.
- `scripts/run-playtest-build.bat:2` — `cd /d` to the OneDrive path. Change to `cd /d "%~dp0"`.
- Prose paths in `EDHA_TALENT_HANDBOOK.md` (~line 483), `TRIAGE_PLAYTEST_PC_MANUALS.md`
  (~line 62), and `EDHA_FOUNDRY_HANDOFF.md` §"Source (canonical)" (~line 10384): replace with
  "the repo root" / `scripts\` relative wording.
- **Optional, needs Ben's yes (it changes line endings in the working tree once):** add a
  `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`) and set `core.autocrlf=false` on
  the new clone. This retires the whole CRLF false-red family (07-15c sheet stamp, 07-28m
  comment-stripper tests, the bench's raw-bytes hash trap). Unrelated to OneDrive, but the fresh
  clone is the cheapest moment to do it.

## Ben's steps, in order

**0. Choose the destination.** Short, no spaces, on the SSD: `C:\dev\Skilltrees` (or
`D:\dev\Skilltrees`). Path length 74 → 17; the derived Claude Code project folder name goes from
73 characters to about 17, which is what fixes MAX_PATH for scratchpads and worktrees. The space
in "Claude Design" disappears too.

**1. Pick a clean moment.** No worker running, Foundry closed, and the three open PRs (#139,
#150, #151) merged — the PM does that part. In the OLD folder, `git status` must be clean and
`git push` up to date; anything uncommitted there is the one thing a fresh clone would lose.

**2. Let the path-literal PR merge first** (the section above). Then the deploy script works from
the new location on day one.

**3. Clone fresh** (Git Bash or a terminal):
```
git clone https://github.com/CadburyAtoms/Skilltrees.git C:\dev\Skilltrees
cd C:\dev\Skilltrees
git config core.longpaths true
bash scripts/install-hooks.sh
```
The pre-commit hook lives in `.git\hooks` and is never cloned — that last line reinstalls the
shim (item 15).

`.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`) has already landed on `main`
(Ben's yes, PM-R9, 2026-09-05) — the fresh clone needs only `git config core.autocrlf false`
alongside the commands above; the attributes file handles the LF/CRLF split itself.

**4. Copy the two optional local files** if they exist in the old folder:
`.claude\settings.local.json` and `CLAUDE.local.md`. Nothing else.

**5. Re-point the things that hold the old path:**
- The two scheduled tasks `edha-pm-daily` and `edha-pm-weeknight` in Claude Code — their working
  folder is the repo.
- Claude Code's per-project memory. Open ONE session in the new folder so its project folder
  exists, then copy
  `%USERPROFILE%\.claude\projects\C--Users-benhe-OneDrive-Documentos-Worldbuilding-Claude-Design-Skilltrees\memory\`
  into `%USERPROFILE%\.claude\projects\C--dev-Skilltrees\memory\` (the folder name is the cwd with
  every non-alphanumeric character replaced by `-`; check the exact new name in that directory).
  The agent-memory files the handoff cites (`edha-foundry-module-build.md`, `edha-aoe-bursts.md`)
  live there.
- `scripts\pm-usage.py` reads transcripts by the same derived name; the week's total on Monday
  will need `--project-dir` pointed at the old folder once, then never again.

**6. Verify** from the new folder: `node scripts\module-src-sync.js status` (6 in sync — the
module dir did not move), `node scripts\validate.js`, `node tests\run.js`, and, when the next
deploy is due anyway, `scripts\deploy-to-foundry.bat` with Foundry closed.

**7. Retire the old folder.** Rename it `Skilltrees-OLD-onedrive` for a week, then delete it —
after moving `Thycross.procreate` up one level (e.g. `Claude Design\maps\`) so the map source
stays in OneDrive without the dead repo around it.

**Sequencing with item 2 (the history purge):** the purge forces every clone to re-clone anyway,
so it is tempting to do both at once. Recommended: **move now, purge later on its own day.** The
move is 20 minutes and unblocks agents today; the purge rewrites `main` and needs zero open PRs.
A second clone costs two minutes.

## What changes for agents afterwards

- The read-only-directory hang and its silent agent-shell form cannot occur; #139's step 2 becomes
  a harmless no-op (keep it — it costs two seconds and guards a future OneDrive).
- Worktrees (`isolation: "worktree"`) work at the repo path; the "PM worktrees under `C:/tmp`"
  rule can be deleted.
- ~57 characters of MAX_PATH headroom at the root and ~105 in scratchpads.
- Git stops competing with a sync client for `.git`; no more 180 MB re-uploads after a `gc`.
