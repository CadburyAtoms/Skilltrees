# Repo Hygiene TODOs — from the 2026-07-06 repo review

Each item below is a self-contained task, sized for one session. Work them in any order,
but #1–#3 are the cheapest wins and #2 has a legal angle — do it first if the repo is
(or will become) public. Check items off here as they land, and note the PR.

---

## 1. [x] Write a root `README.md` for humans — DONE 2026-07-06 (same session as this file)

**Why:** There is no onboarding path for anyone who isn't Ben or a Claude session.
A stranger landing on GitHub sees `index.html` and four mystery HTML files.
`CLAUDE.md` already contains the right content but addresses AI sessions, not people.

**What to do:**
- ~10–30 lines at repo root: what the project is (Edha homebrew talent trees for
  Cosmere RPG), the three moving parts (GitHub Pages atlas app in `src/` + `index.html`;
  the Foundry VTT module in `module-src/`; the data pipeline in `data/` + `scripts/`),
  and how to run the gate commands (copy the list from CLAUDE.md §Iron rules 4).
- Link out to `EDHA_FOUNDRY_HANDOFF.md`, `AUTHORING_WORKFLOW.md`, `docs/BUILD_FLOW.md`
  for depth. Do NOT duplicate their content.

**Done when:** a newcomer can say what the repo is and run the test gates without
opening CLAUDE.md.

---

## 2. [~] Remove committed binaries — especially the copyrighted Stormlight PDF
> **2026-07-06 status: working-tree half DONE** — all PDFs + PNGs under
> `source-materials/legacy-uploads/` deleted, `.gitignore` blocks recurrence, and
> `scripts/purge-binaries-from-history.sh` is ready. **Remaining: the history purge**
> — run that script from a fresh clone on Ben's machine when no PRs are open
> (it rewrites history and force-pushes `main`; every clone must re-clone after).

**Why:** `source-materials/legacy-uploads/` is ~35 MB of xlsx/PDF/PNG bootstrap
history. It includes `SL015_Stormlight_StarterRules_Digital.pdf` (18 MB) and
`SL020_Stormlight+Character+Sheet.pdf` — **commercial, copyrighted material**. That is
a legal problem for a public repo, independent of size. The xlsx/txt/md files there are
MASKED bootstrap history (see CLAUDE.md) — their *content* already lives in `data/`.

**What to do:**
- Delete the two Stormlight PDFs, the Edha character-sheet PDFs, and the
  `pasted-*.png` screenshots from the working tree; keep the small `.txt`/`.md`/`.json`
  legacy files if `source-materials/README.md` says they're still referenced.
- ⚑ **Purging them from git history requires `git filter-repo` + a force-push of
  `main` — coordinate with Ben before doing this** (his clone and any open branches
  must be re-cloned/rebased afterwards). A session can prep the exact commands and
  flag the run for Ben.
- Add `*.pdf` and `source-materials/**/*.png` to `.gitignore` so they can't come back.

**Done when:** no copyrighted PDFs in the tree (and ideally not in history), and
`.gitignore` blocks recurrence.

---

## 3. [ ] Add `package.json` + `LICENSE`; delete the root HTML snapshots

**Why:** No manifest means no declared Node version and no discoverable script
entry points; no license means "all rights reserved" by default — probably not intended
for a homebrew community project. And `Leyline Atlas v-pre-tierdie.html` /
`Leyline Atlas v-pre-wireup.html` in the root are version-control-by-filename inside
version control; git history already remembers them.

**What to do:**
- `package.json` with `"private": true`, `"engines": { "node": ">=20" }`, and scripts:
  `test` → `node tests/run.js`, `validate` → `node scripts/validate.js`,
  `lint` → `node scripts/lint-refs.js`, `audit` →
  `python3 .claude/skills/leyline-tree-authoring/audit.py`. No dependencies — the
  zero-dependency property is deliberate; the manifest just declares it.
- Ask Ben which license he wants (homebrew content vs code may differ — Cosmere RPG
  community-content licensing may constrain the choice; ⚑ his call, present options).
- Delete `Leyline Atlas v-pre-tierdie.html` and `Leyline Atlas v-pre-wireup.html`.
  Verify nothing links to them first (`grep -rl "v-pre-" --include="*.html" --include="*.md" .`).

**Done when:** `npm test` / `npm run validate` work; a LICENSE exists; the two
snapshot files are gone.

---

## 4. [ ] Split the 11k-line engine into concatenated sections (keep ONE deployed file)

**Why:** `module-src/scripts/register-skills.js` is the ceiling on maintainability.
The single-file property matters for deployment (module-src-sync mirrors one file to
Ben's live module) — but the *source* doesn't have to be one file.

**What to do:**
- Split into per-section source files (core primitives, one file per tree section —
  the `═══` tree-section headers already mark the seams), concatenated by a trivial
  build step (a ~20-line Node script, order-preserving, no bundler) into the exact
  current `register-skills.js`.
- The concatenated output stays the tracked/deployed artifact OR becomes a build
  product — decide with Ben; the former is safer for his F5-reload workflow.
- Gates must still pass byte-identical: `node --check`, `node tests/run.js`
  (the vm harness loads the whole file), `node scripts/lint-refs.js`.
- Update `ENGINE_INDEX.md`, CLAUDE.md "Where behavior lives", and the sync script.

**Done when:** sources are per-section, the assembled engine is byte-stable, all
gates green, docs updated. This is the largest item — do it alone in its own session.

---

## 5. [ ] Extend tests into the hook layer (fake actor/item → assert the write)

**Why:** `tests/engine-helpers.test.js` covers ~8 pure helpers of an 11k-line engine.
The ~240 registered hooks — the actual game logic — are only smoke-tested ("loads
without throwing"); real verification is Ben playing in Foundry. The vm harness
(`tests/harness.js`) already exists; the missing piece is *firing* recorded hooks
against stub documents.

**What to do:**
- Add a `fireHook(name, ...args)` helper to `tests/harness.js` that invokes the
  recorded registrations, plus minimal stub Actor/Item/ChatMessage factories
  (flags store, `update()` recorder, `getFlag`/`setFlag`).
- Start with the highest-traffic paths: `cosmere-rpg.preUseItem` /
  `cosmere-rpg.useItem` dispatch, the applyDamage pre/post rider pass, and one
  status-expiry case — assert the flag/status/update *writes*, not internals.
- Keep the house rule: every future test-pass fix with a pure/hook-reachable root
  cause ships WITH a pinned regression case here.

**Done when:** at least 3 hook-driven behaviors have write-asserting tests running
in `node tests/run.js` and CI.

---

## 6. [ ] Frontend build migration (Vite) — per `docs/BUILD_FLOW.md`

**Why:** The atlas app loads React + Babel from unpkg and compiles JSX in the
browser, with hand-bumped `?v=` cache-busting strings in `index.html`. The fix is
already specified in `docs/BUILD_FLOW.md`; it's been sitting unactioned.

**What to do:** follow `docs/BUILD_FLOW.md` steps 1–6 (Vite + React, `src/main.jsx`
entry, hashed assets, publish `dist/` to GitHub Pages). Decide with Ben whether the
in-browser ⌘ GitHub push flow (`src/github-push.js`) and editor mode must survive
the migration — they're the riskiest parts. ⚑ Requires testing the deployed Pages
site, which a repo session can't fully verify.

**Done when:** no CDN Babel, no manual `?v=` bumps, Pages serves hashed assets, and
the editor/push workflow still works (Ben-verified).

---

## 7. [ ] Tame the `EDHA_FOUNDRY_HANDOFF.md` header wall

**Why:** The handoff's header paragraph is a single unbroken multi-thousand-word
"Prior: … Prior: …" chain — write-optimized for appending, hostile to reading. The
doc's own policy says superseded deltas collapse to one-liners; the policy just needs
applying to the header itself.

**What to do:**
- Keep the 2–3 most recent "Prior:" entries in the header; collapse every older one
  to a one-line dated bullet in a "Superseded delta index" list (or move to a
  `HANDOFF_ARCHIVE.md`). Lose NO information — link/point, don't delete.
- Do the same audit for full delta *sections* below: any delta fully superseded by a
  later one gets the one-liner treatment the doc already promises.

**Done when:** the header fits on one screen and every collapsed delta is reachable
via the index.
