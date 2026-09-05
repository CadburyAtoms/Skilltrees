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
> **2026-09-05 status: the history purge has effectively HAPPENED — as the 2026-07-28 restart.** Main's
> root commit is `aed1a76` (07-28); the PDF is unreachable from `main` and survives only through the
> **57 orphaned pre-restart branches** (plus the 2026-07-06 working-tree half, which is done).
> **Remaining: Ben deletes the 61 SAFE branches listed with evidence in `docs/BRANCH_CLEANUP.md`**
> (3 KEEP until items 33–35 re-land, 2 are his call), then a fresh clone (item 32) or
> `git fetch --prune && git gc --prune=now`; GitHub clears its server copy on its own GC.
> `scripts/purge-binaries-from-history.sh` is no longer needed for `main`.

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

## 3. [~] Add `package.json` + `LICENSE`; delete the root HTML snapshots
> **2026-07-06 status: mostly DONE** — `package.json` added (private, Node ≥ 20, gate
> script aliases incl. `npm run gates`), both `v-pre-*` snapshots deleted (nothing
> referenced them). **Remaining: LICENSE** — Ben deferred the choice ("decide later");
> revisit MIT vs MIT-code + CC BY-NC-SA-content when he's ready.

**Why:** No manifest means no declared Node version and no discoverable script
entry points; no license means "all rights reserved" by default — probably not intended
for a homebrew community project. ~~And `Leyline Atlas v-pre-tierdie.html` /
`Leyline Atlas v-pre-wireup.html` in the root are version-control-by-filename inside
version control; git history already remembers them.~~ *(Done 2026-07-06 — the two
`v-pre-*` snapshots went with the package.json pass; the remaining two root
`Leyline Atlas` HTML files went with the atlas-cleanup pass.)*

**What to do:**
- `package.json` with `"private": true`, `"engines": { "node": ">=20" }`, and scripts:
  `test` → `node tests/run.js`, `validate` → `node scripts/validate.js`,
  `lint` → `node scripts/lint-refs.js`, `audit` →
  `python3 .claude/skills/leyline-tree-authoring/audit.py`. No dependencies — the
  zero-dependency property is deliberate; the manifest just declares it.
- Ask Ben which license he wants (homebrew content vs code may differ — Cosmere RPG
  community-content licensing may constrain the choice; ⚑ his call, present options).

**Done when:** `npm test` / `npm run validate` work; a LICENSE exists.

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

## 6. [x] ~~Frontend build migration (Vite)~~ — OBSOLETE 2026-07-06: atlas deprecated & removed

Ben ruled the browser atlas deprecated — everything lives in the Foundry module now.
The atlas-cleanup pass removed the whole web app (`index.html`, `src/`, `.nojekyll`,
`docs/BUILD_FLOW.md`, the `publish.sh`/`publish.bat` Pages flow, the remaining root
`Leyline Atlas *.html` snapshots, and the atlas-only data files `edha-inline.txt` /
`edha-talents.json` / `glossary.json`). Nothing to migrate; everything is recoverable
from git history.

---

## 7. [x] Tame the `EDHA_FOUNDRY_HANDOFF.md` header wall — DONE 2026-07-06
> Header keeps the 3 newest entries + a one-line index; the 18 older entries moved
> verbatim to `HANDOFF_ARCHIVE.md`. Full delta *sections* below the header were left
> as-is — they're the canonical record; collapsing them further is optional polish.

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

---

## 8. [x] The 2026-08-10 hygiene campaign, waves 1-6 — canonical-home consolidation — DONE 2026-08-10

> A second repo review, separate from the 2026-07-06 backlog above: `scripts/` and
> `module-src/` had grown the same disease items 1-7 named for docs and tests — near-duplicate
> copies of the same idiom, each free to drift from the others. R-60..R-68 (`EDHA_RULINGS.md`)
> set the defaults; waves 1-6 landed them as six themed passes ending in this gate.

**What happened:** four real correctness fixes, seven idiom families collapsed into one
canonical implementation each, and two gates (a ratchet + a cross-reference lint pass) landed
to keep any of them from drifting back apart.

**Correctness fixes** (an actual bug, not just a duplicate — each verified byte-identical or
pinned with a regression case):
- `05a95a3` settle_gazetteer.py now writes the gazetteer via `maplib.save_gazetteer` — the raw
  `json.dump` used platform-default encoding + `ensure_ascii=True`, which would have re-encoded
  all 337 non-ASCII bytes in `thyrcross.map.json` to `\uXXXX` escapes on the next `--write` and
  buried the real diff.
- `96ca173` validate-adversaries.js now reads packs through `edha-pack-io.readPack` — its
  hand-rolled reader omitted `keyEncoding: "utf8"`, had no `existsSync` guard, and leaked its
  temp dir on a mid-iteration throw.
- `3de18e5` validate.js now imports the generator's `prereqGroups` — its own pre-fix copy split
  unconditionally on `" and "`, tearing "Mind and Body" apart and silently dropping the mangled
  group, so the iron-rule-7 walkability gate modeled FEWER requirement edges than Foundry
  actually evaluates. Six cases pinned in `tests/prereq-groups.test.js`.
- `0a0fe58` lint-refs.js now walks its authored/adversary data ONCE into shared indexes — six of
  the seven old per-pass walks did `catch { continue; }`, so a broken `data/authored/*.json`
  file was invisible to passes 6/8/9/12/13/14, which reported SUCCESS on a file they never read.

**Lib extractions** (idiom → one canonical implementation; a consumer that used to carry its own
copy now imports it):
- `scripts/lib/paths.js` — REPO_ROOT/DATA/MODROOT/ATLAS_PACK (`1b49350`, `foundry-extract.js`
  also gained the env override it had silently lacked).
- `scripts/lib/data.js` — `loadJson` + the atlas loader, moved out of foundry-build.js (`f8256b0`).
- `scripts/map/maplib.py` absorbed the duplicated geometry/tracing helpers (`2567d71`).
- `scripts/map/maprender.py` — the shared PIL label/font-rendering scaffold (`96c202a`).
- `scripts/lib/md.js` + `scripts/lib/build-doc.js` — one markdown engine, one --check/emit dance
  (`b9a3bf0`); the three doc builders + the native-vocab dump migrated onto it (`94a6a55`).
- `scripts/lib/strip-comments.js` — the comment-stripped-engine-text primitive, ONE
  implementation instead of five near-duplicates (`a0e60ff`).
- foundry-build.js's local `slugifyItem`/classic-level resolver collapsed onto edha-pack-io.js's
  exports — audited byte-identical against all 113 live item/culture/ancestry names (`b777cb5`).
- `tests/harness.js` gained the shared engine loaders + mock-actor factories; 7 source-reading
  tests then 19 more files migrated onto them (`14a7f44`, `6703684`).

**Engine passes with ratchet deltas** (R-60..R-68 applied on the live engine, ENGINE-ONLY,
needs F5 — not yet bench-verified, see the checklist):
- `546663d` lint-refs.js pass 20 — the engine-idiom ratchet, 9 idioms frozen at their measured
  counts (`scripts/engine-idiom-ratchet.json`).
- `55168dd` `edhaRollFormula` + `edhaSceneReset` — R-65 folds dice the same way everywhere,
  R-60 gives the once-per-scene sweep one population path.
- `fcb6865` targeting + cross-actor state unification — R-63 (disposition defaults now fail
  CLOSED via `edhaDisposHostile`/`edhaSameDisposition`, see pass 5.2 below), R-64 (victim chain).
- `9de2f38` cards, costs, and dialogs unified — R-61/R-62/R-66/R-67 applied.
- Wave 6 (this pass) adds `scripts/lint-refs.js` pass 21 — the CANONICAL HOMES lint, table-driven
  two-way enforcement (grow outside home/shrink → error; a home or shrink entry with 0 matches →
  error) over all of the above, so none of them can quietly regrow a second copy.

**Verified by:** `npm run gates` green (`node tests/run.js` — 520+ cases, `node
scripts/lint-refs.js` — 21 passes, `node scripts/validate.js`, `python scripts/map/lint_map.py`,
the dashboard/codex/primer `--check` builds), plus pass-21-specific mutation verification
(foreign-copy, shrink-delist, rot-alarm, and four false-positive spot-checks — see the wave-6
delta in `EDHA_FOUNDRY_HANDOFF.md`).

---

## 9. [ ] Consolidate region_overlay.py / world_settlement.py onto maplib's geometry helpers

**Why:** `scripts/map/region_overlay.py` and `scripts/map/world_settlement.py` compute the same
point/segment/polyline distances as `maplib.py`'s `seg_dist`/`polyline_dist`/`project_on_polyline`
family, under DIFFERENTLY-NAMED local functions (`poly_distance` and similar) — deliberately not
caught by lint-refs.js pass 21's `maplib-helper-def` entry (which gates the exact wave-3A names,
not this pre-existing, differently-named duplication). Same for the label/font-rendering idiom:
pass 21's `maprender-helper-def` entry shrink-lists both files (plus `render_player.py` and
`render_settlements.py`) for keeping their own `DRIVER_STYLE`/`text_outlined`/`boxed_label`/`font`
copies rather than importing `maprender.py`'s.

**What to do:**
- Rename/collapse `region_overlay.py`'s and `world_settlement.py`'s distance helpers onto
  `maplib.py`'s `seg_dist`/`polyline_dist`/`project_on_polyline`, verifying identical output
  first (same audit style as `b777cb5`'s slugify collapse).
- Migrate `region_overlay.py`, `world_settlement.py`, `render_player.py`, and
  `render_settlements.py` off their local `DRIVER_STYLE`/`text_outlined`/`boxed_label`/`font`
  copies onto `maprender.py`'s.
- Shrink `scripts/lint-refs.js` pass 21's `maplib-helper-def`/`maprender-helper-def` shrink lists
  to match (pass 21 will refuse a stale shrink entry with 0 matches, so this is enforced, not
  optional cleanup).

**Done when:** both files import rather than redefine, `python scripts/map/lint_map.py` and
`node scripts/lint-refs.js` stay green, and the two shrink lists are empty (or the entries note
why one file legitimately keeps a copy).

---

## 10. [ ] Migrate the disposition-default fail-open backlog onto the failed-closed helpers

**Why:** pass 5.2 (R-63, `fcb6865`) fixed the disposition-default fail-open idiom
(`disposition ?? 1` / `?? 0` — an unresolvable side silently reading as "everyone matches") in
the shared helpers (`edhaDisposHostile`, `edhaSameDisposition`) plus 16 named sites, but measured
76 more occurrences of the same idiom still in `register-skills.js`. `scripts/lint-refs.js` pass
20 now ratchets this backlog under the `dispoFailOpen` key (frozen 2026-08-10 at 76) so it can
only shrink from here — see `.claude/skills/leyline-tree-authoring/ENGINE_INDEX.md` "A FAILED
LOOKUP IS NOT NO RESTRICTION".

**What to do:**
- Work through the 76 sites `disposition\s*\?\?\s*[01]\b` matches in `register-skills.js`,
  replacing each with `edhaDisposHostile`/`edhaSameDisposition` or the equivalent inline
  `Number.isFinite` guard, per R-63's fail-CLOSED convention.
- Lower `scripts/engine-idiom-ratchet.json`'s `counts.dispoFailOpen` to match as sites migrate —
  the ratchet errors if the file isn't kept honest.
- Every flip is a live-behavior change for a genuinely tokenless/unset-disposition actor — flag
  each batch 🤖 on the checklist for bench re-verification, per R-63's note.

**Done when:** `counts.dispoFailOpen` reaches 0 (it stays in the ratchet file as a tombstone
after that, same as `rollFold`/`gmWhisper` today).

---

## 11. [x] Migrate the 6 remaining Foundry/repo path-literal scripts onto scripts/lib/paths.js — DONE 2026-09-05, PR #156

**Why:** `scripts/lib/paths.js` (added wave 1) is the canonical MODROOT/DATA constant, but six
consumers still carry their own hard-coded copy of the `FoundryVTT/Data/modules/edha-content` or
`Claude Design/[Ss]killtrees/data` literal: `scripts/foundry-build.js` (2 occurrences),
`scripts/inspect-pack.js`, `scripts/module-src-sync.js`, `scripts/sync-art.js`,
`scripts/validate-packs.js`, `scripts/validate-adversaries.js` (1 each) — lint-refs.js pass 21's
`foundry-path-literal` entry shrink-lists exactly these six so a NEW seventh copy still fails.

**What to do:**
- One file at a time: replace the local literal with `require("./lib/paths.js")`'s
  `MODROOT`/`DATA`, confirm behavior is unchanged (these are machine-local defaults, already
  overridable via `EDHA_MODROOT`/`EDHA_DATA`), and delist the file from pass 21's
  `foundry-path-literal` shrink array as it moves off.
- `deploy-to-foundry.bat` is out of scope (not `.js` — pass 21 doesn't scan it, and neither
  should this item).

**Done when:** the shrink list is empty and `node scripts/lint-refs.js` stays green.

---

## 12. [ ] Adopt edhaDefBuffGmGate at the 20 primaryGmGate sites (freeze-only today)

**Why:** `scripts/engine-idiom-ratchet.json`'s `primaryGmGate` key is frozen at 20 with 20 still
measured — unlike the other eight idiom keys, NONE of this one has migrated yet; it is a
freeze-only entry (nothing can regrow past 20, but nothing has shrunk either). The idiom is
`activeGM && !game.users.activeGM.isSelf` hand-deriving the primary-GM gate instead of calling
`edhaDefBuffGmGate()`.

**What to do:** work through the 20 sites, replacing the hand-derived check with
`edhaDefBuffGmGate()`, lowering `counts.primaryGmGate` as they migrate. This family is directly
related to pass 15's two-GM double-write gate (`EDHA_FOUNDRY_HANDOFF.md`'s "the two-GM family") —
prioritize any site that also performs a world write.

**Done when:** `counts.primaryGmGate` is below 20 and trending toward 0.

---

## 13. [ ] Migrate resourceWrite's remaining 12 sites onto edhaSpendResource/edhaConsumeCost

**Why:** `scripts/engine-idiom-ratchet.json`'s `resourceWrite` key started at 17, is down to 12 —
12 sites still write a `system.resources.<id>.value`/`.max` update path by hand instead of
calling `edhaSpendResource`/`edhaConsumeCost`.

**What to do:** work through the remaining 12 `["']system\.resources\.[a-z]{2,4}\.(value|max)["']`
sites in `register-skills.js`, lowering `counts.resourceWrite` as they migrate.

**Done when:** `counts.resourceWrite` reaches 0.

---

## 14. [ ] Migrate userTargets' remaining 10 sites onto the target-reader primitive

**Why:** `scripts/engine-idiom-ratchet.json`'s `userTargets` key started at 63, is down to 10 —
10 sites still read `game.user.targets` directly instead of going through the target-reader
primitive (`edhaEffectTargets` / the upcoming reader named in the ratchet's comment).

**What to do:** work through the remaining 10 `game\.user\??\.targets` sites in
`register-skills.js`, lowering `counts.userTargets` as they migrate.

**Done when:** `counts.userTargets` reaches 0.

---

<!-- Items 15–25 were added 2026-09-04 from the fresh-eyes repo review (artifact "Skilltrees Repo
     Review"). They are worked by the PM project — see docs/PM_BOARD.md for lane / model / order /
     status, and .claude/skills/project-manager/ for the operating loop. Substance lives HERE;
     scheduling state lives on the board. Each item's "PM:" line is the board's seed. -->

## 15. [x] Reinstall the pre-commit hook and make it a shim that cannot go stale (2026-09-04, PR #133)

**Why:** `.git/hooks/pre-commit` on Ben's machine is the 25-line first version (runs
`validate.js` only when `data/*.json` is staged). The tracked `scripts/pre-commit` is ~50 lines and
ALSO runs the dashboard `--check`, `lint-refs.js`, and `tests/run.js`. CLAUDE.md and
`scripts/README.md` both say the hook enforces those. It does not — CI has been the only net.
Found 2026-09-04 by diffing the two files.

**What to do:**
- Change `scripts/pre-commit` so the *installed* copy is a two-line shim:
  `exec "$(git rev-parse --show-toplevel)/scripts/pre-commit-body" "$@"` (or equivalent), and move
  the real logic into that body file. Then a future edit to the body is live without reinstalling.
- Re-run `bash scripts/install-hooks.sh` on this machine (a local worker can — it is a repo-local
  file, not a system setting). Verify with `diff scripts/pre-commit .git/hooks/pre-commit`.
- Fix the `python3` calls in the hook body to fall back to `python` (Windows has no `python3`).

**Done when:** the installed hook is the shim, a staged `register-skills.js` change triggers
lint + tests locally, and the docs' claim is true again.

**PM:** lane R (repo-only) · model sonnet · size S · deps none · verify: diff + a dry commit on a throwaway branch.

---

## 16. [x] `foundry-build.js` must not silently skip a malformed authored file (2026-09-05, PR #136)

**Why:** `scripts/foundry-build.js:119` reads each `data/authored/*.json` inside
`try { … } catch { continue; }`. A file that fails to parse is dropped without a message and the
build ships that whole tree from the generator + side tables — 25 talents with bootstrap text and no
automation. This is the exact swallow-and-continue pattern the 2026-08-10 campaign removed from six
`lint-refs.js` walks, still present in the one script that writes packs. `deploy-to-foundry.bat`
never runs `lint-refs.js`, so on Ben's machine nothing stands in front of it.

**What to do:** load the authored index through `loadJson` from `scripts/lib/data.js` (it throws)
and let the build fail loudly, naming the file. Add a pinned test (mutation-verified: a deliberately
broken authored fixture must fail the loader) — `tests/pipeline.test.js` is the natural home if the
loader can be exported from `foundry-build-parts.js`; otherwise a lint-refs pass-21 shrink entry.
Prove pack parity: all five packs byte-identical before/after on a clean tree.

**Done when:** a broken authored file fails `foundry-build.js` with the filename in the error, the
regression is pinned, and the pack build is byte-identical on good input.

**PM:** lane R · model sonnet · size S · deps none · verify: mutation test + pack parity (needs `classic-level`, `npm install --no-save classic-level@2.0.0`).

---

## 17. [x] Move `C:/tmp/heroic_ids.json` into `data/` as a tracked snapshot (2026-09-05, PR #137)

**Why:** `scripts/foundry-build.js:423` reads the cosmere-rpg system's heroic-path talent ids from a
hard-coded temp path with `catch { return {}; }`. The map resolves prose prerequisites that name a
SYSTEM talent (e.g. "Composed", "Seek Quarry") to `Compendium.cosmere-rpg.heroic-paths.Item.<id>`.
On CI and any other machine the map is empty, so those prerequisites silently degrade to narrative
clauses — the CI pack build is not building what Ben's machine builds.

**What to do:** commit the file as `data/system-heroic-ids.json` with a `_meta` block (system
version, dumped-on date, the console snippet that produced it — same shape as
`data/native-vocabulary.json`); read it from `DATA` via `loadJson`; keep an `EDHA_HEROIC_IDS` env
override for regeneration; fail loudly if it is missing. Note in AUTHORING_WORKFLOW.md's toolbox
that it needs re-dumping after a system upgrade.

**Done when:** the CI pack build resolves the same external prerequisites as the local build
(compare `report.narrative` counts before/after), and the temp-path read is gone.

**PM:** lane R · model sonnet · size S · deps none · verify: build report diff + `validate-packs.js`.

---

## 18. [ ] Guard the authored overlay's name-fallback against cross-tree collisions

**Why:** `foundry-build.js:122` builds `AUTHORED.byName` last-file-wins across all 21 overlays, and
`:577` uses it whenever the docId lookup misses. Twelve talent names appear in 2–7 authored files
(Hardy ×7, Mighty ×6, Collected ×5, Composed, Baleful, Surefooted, Shatter Focus, …). Today every
overlay carries a matching docId so the fallback is dormant, but a docId changes on rename
(`fid("talent:<tree>:<name>")`), and the first rename after an extract would silently apply
another tree's overlay to the renamed talent.

**What to do:** scope the fallback to the talent's own atlas+group (`_meta.group` is on every
authored file), and print a build warning listing any name that resolves ambiguously. Pin it:
a test that constructs two overlays sharing a name and asserts the right one is chosen and the
collision is reported. Prove pack parity on the current data (no overlay should change hands).

**Done when:** the fallback cannot cross trees, collisions are visible in the build log, and the
packs are byte-identical before/after.

**PM:** lane R · model opus · size S · deps #16 (same loader) · verify: pinned test + pack parity.

---

## 19. [ ] Split `EDHA_FOUNDRY_HANDOFF.md` into a current reference and a dated changelog

**Why:** 10,157 lines / 1 MB; 88 dated delta headers; the §1–§10 reference a cold session needs
begins at line 9,696 and is ~460 lines. ~95% of the file is log, with no table of contents, and
§7.0 / §9a–§9g are kept inline under "historical, since reversed" warnings. Every session that
follows "read top to bottom" pays for this first.

**What to do (shape needs Ben's OK before the cut — see docs/PM_BOARD.md rulings):**
- `EDHA_FOUNDRY_HANDOFF.md` becomes the REFERENCE: the two-markers section, §1–§10 rewritten to
  be true today (fold in what the deltas changed; retire §7.0 and §9a–§9g to the archive), a table
  of contents, and a pointer to the changelog. Target ≤ 800 lines.
- `docs/handoff-changelog/2026-MM.md` (one file per month, newest first inside) receives the dated
  deltas verbatim. `HANDOFF_ARCHIVE.md` folds into the same folder.
- `scripts/build-dashboard.js` reads handoff §9 (Engine tab) — re-point it and keep `--check`
  green. CLAUDE.md's map row and the delta rule (iron rule 5: "a dated delta at the TOP of the
  handoff") change to name the changelog.
- Keep the split reviewable: the reference rewrite is one PR; the mechanical move is another.

**Done when:** a new session can read the reference in one sitting, `git log --follow` still
finds every delta, and CI is green.

**PM:** lane R · model opus · size L (two PRs) · deps ruling PM-R1 · verify: dashboard `--check`, a cold-read by a Sonnet worker that answers ten questions from the reference alone.

---

## 20. [ ] One gate list, and gates that pass on Windows

**Why:** the gate list exists in five places (`package.json`, README, CLAUDE.md, `scripts/README.md`,
`validate.yml`) and they disagree: `npm run gates` omits `lint_map.py` and the pack build, each doc
carries its own prose explaining the gap, and the workflow's `paths:` filter is a sixth
hand-maintained list. Separately, every gate invokes `python3`, which is not on Ben's PATH, so
`npm run gates` always exits non-zero here even when every check passes.

**What to do:**
- Add `scripts/gates.js` (or a `gates:ci` npm script) that runs the ordered list, resolves the
  Python interpreter (`python3` → `python` → `py -3`), and prints one PASS/FAIL table. Make
  `validate.yml` call it, so CI and local runs share the list. Keep the optional-dependency gates
  (`lint_map`, pack build) behind a `--ci` flag that CI passes.
- Replace the five copies with one sentence each pointing at the runner.

**Done when:** `npm run gates` exits 0 on Ben's machine on a clean tree, CI uses the same runner,
and no doc carries its own gate list.

**PM:** lane R · model sonnet · size M · deps none · verify: run on this machine + a CI run on the PR.

---

## 21. [ ] Stale-doc sweep from the 2026-09-04 review

**Why:** each of these costs a session a wrong assumption.

**What to do:**
- `scripts/README.md`: document the 22 present-but-missing scripts (all of `lib/`, `map/` by
  pointer, `bench-setup-console.js`, `dump-native-vocabulary.js`, `check-2b-classification.js`,
  `author-rules.js`, `handler-schemas.js`, the three doc builders, `sync-art.js`,
  `deploy-to-foundry.bat`, the two ratchet JSONs, …) and drop `playtest-setup-console.js`
  (deleted 2026-08-10).
- CLAUDE.md: "11k-line engine" → the real number (state it as approximate and dated); the overlay
  field list is SEVEN keys (`docId` is on every entry — `lint-refs.js:50` is the authority).
- `TODO_REPO_HYGIENE.md` items 4 and 5: same 11k → 19.5k correction.
- `.claude/skills/talent-balance/SKILL.md`: remove the duplicated frontmatter block.
- `EDHA_EDITABILITY_AUDIT.md` (2,150 lines) says on line 4 to retire itself when the migration
  closes; it closed 2026-07-26. Move to `docs/archive/` with a pointer stub — **needs Ben's OK
  (ruling PM-R2)**.
- `Actor pages design review/` shipped 2026-07-12c; move to `docs/archive/` (or delete — history
  keeps it) — **ruling PM-R2**. `data/authored/.baselines/` is an orphan local dir (gitignored):
  add one line to AUTHORING_WORKFLOW.md saying it may be deleted.
- `.claude/worktrees/` holds four clean, stale worktrees; `git worktree prune` after Ben confirms
  none is live — **ruling PM-R2** (answered yes).
- Found by the item-25 worker (2026-09-04): `scripts/pre-commit`'s dashboard-source regex is
  missing `EDHA_RULINGS.md`, which `build-dashboard.js` already renders (the ⚖ Rulings tab); and
  the untracked empty `screenshots/` and `src/` directories at the root are leftovers of the
  removed atlas app — delete them locally, nothing tracks them.

**Done when:** every listed correction is in, and `scripts/README.md`'s table matches `ls scripts`.

**PM:** lane R · model sonnet · size S · deps ruling PM-R2 for the moves · verify: a script that diffs README rows against `git ls-files scripts`.

---

## 22. [ ] Structure data: park the unbuilt Radiant rows and normalise the three key dialects

**Why:** 225 of `data/cosmere.json`'s 375 rows are Radiant orders the build never reads (60% of
the file). The three structure files spell the same concept three ways (`name` / `Talent Name` /
`Name`, `flavor` / `Flavor Text` / absent) and `domain.json` mixes cases inside one row; the whole
reconciliation is `normRow` in `scripts/lib/data.js`, so `validate.js` cannot check real fields.

**What to do:**
- First check every consumer of the Radiant rows (`build-player-primer.js` reads the atlas JSONs —
  does the primer show the orders?). If nothing reads them, move them to
  `source-materials/radiant-orders.json`; if the primer does, leave them and record why here.
  **Ruling PM-R3.**
- Normalise keys to the lowercase leyline dialect in all three files, delete the aliases from
  `normRow`, tighten `validate.js` to the real field names. The docId hash uses the VALUE of the
  name, not the key, so ids do not move — prove it with a byte-identical pack build before/after.

**Done when:** one dialect, `normRow` is a pass-through or gone, and the packs are byte-identical.

**PM:** lane R · model opus · size M · deps ruling PM-R3 · verify: pack parity + `validate.js` + primer `--check`.

---

## 23. [ ] Banner the 3,700 unbannered engine lines (prep for #4)

**Why:** between the Red tree section (~6,599) and Destruction (~10,660), `register-skills.js`
carries defence buffs, the talent budget, sheet slots, the character-creation wizard, sheet QoL,
talent sync, adversary sync, temp HP, summons, injuries, triggered effects, targeting/AoE, and
bursts with no `/* === */` banner. A cold reader cannot find them from the section index, and the
#4 split has no seam names to use.

**What to do:** comment-only change — add a banner per subsystem in the house style, list the
primitives each owns, and add the sections to `ENGINE_INDEX.md`. Zero behaviour change: `node
--check`, lint pass 20/21 unchanged, `tests/run.js` green, and `git diff --stat` shows only
comment lines (verify with the comment stripper: `codeOnly(before) === codeOnly(after)`).

**Done when:** every top-level function sits under a banner and the index names every section.

**PM:** lane R · model opus · size M · deps none · verify: stripped-source equality + gates.

---

## 24. [ ] Table-driven handler registry (the first real cut of #4)

**Why:** `edhaRegisterNativeEventSystem` is 2,537 lines of 103 sequential
`registerItemEventType` / `registerItemEventHandlerType` calls. Because it is code, not data,
`scripts/handler-schemas.js` recovers each handler's field schema by parsing engine source text,
and lint pass 9 is only as good as that parser.

**What to do:** hoist the definitions into `EDHA_EVENT_TYPES` / `EDHA_HANDLER_TYPES` arrays (still
in the one engine file — iron rule 2a) and register them in one loop. Expose the arrays on the
`edha` API and make `handler-schemas.js` evaluate them through the test harness instead of
regex-parsing source. Behaviour must be identical: same registration order, same labels, same
schema fields — pin a test that snapshots (type → field names) before and after.

**Done when:** the loop is the only registration site, pass 9 reads the table, and the snapshot
test is green. **Then 🤖 bench:** a smoke pass that every handler type still appears in the
Events tab picker and one talent per handler family still fires.

**PM:** lane B (bench after) · model opus · size L · deps #23 · verify: snapshot test + a bench-run smoke section.

---

## 25. [x] PM project tooling: board, usage ledger, and the two skills (2026-09-04, #132)

**Why:** the ongoing-project model (2026-09-04) needs a place for scheduling state, a way to
measure what each worker dispatch cost, and a repeatable procedure for the PM and for workers.

**What to do:**
- `docs/PM_BOARD.md` — queue, lanes, run log, budget config (seeded 2026-09-04 by the PM).
- `scripts/pm-usage.py` — read the session transcripts under `~/.claude/projects/<repo>/` and
  print weighted usage per session and per subagent (weights: cache read 0.1×, cache write 2×,
  output 5×). The PM appends the number to the board's run log after every dispatch.
- `.claude/skills/project-manager/SKILL.md` — the PM loop (Fable only).
- `.claude/skills/work-item/SKILL.md` — the worker contract (Sonnet/Opus).
- Wire the board into the dashboard as its own tab (parser + `--check`).
- CLAUDE.md: a routing line — "continue the project" → `project-manager`.

**Done when:** a fresh PM session can resume from the board alone, and the dashboard shows it.

**PM:** lane R · model sonnet for the script + dashboard tab, PM writes the skills · size M · deps none.

---

## 26. [ ] Bench PCs get a normal sight range (ruling R-2)

**Why:** `scripts/bench-setup-console.js` builds the bench PCs with a **10 ft** sight range, so a
player client renders almost nothing — it already caused a near-false-PASS at bench run 13. Ben
answered **R-2 on 2026-09-05: yes, give them normal vision.**

**What to do:** raise the bench PCs' sight to a normal range in `scripts/bench-setup-console.js`.
**Do NOT touch the adversary 10 ft** — R-2 says explicitly that is a deliberate design dial and
stays a ⚑ row ("Adversary sight range — does 10 ft feel wrong? Say a number"). Add a 🤖 checklist
row to re-verify a player client renders the map at the next bench run.

**Done when:** bench PCs are created with normal vision, the adversary dial is provably untouched
(diff shows one changed value), and a 🤖 row exists for the next bench run.

**PM:** lane R (edit) with a 🤖 verification row · model sonnet · size S · deps R-2 ✓ · verify: diff + the 🤖 row.

---

## 27. [ ] Retire the `GM summon relay` checklist row (ruling R-1)

**Why:** Ben answered **R-1 on 2026-09-05: yes, the PLAYER role keeps `ACTOR_CREATE`.** By that
ruling's own terms the `summon-actor` **relay branch is dead code at Ben's table** — run 13's
player-cast Construct worked but never used the relay — and the checklist's `GM summon relay` row
**can never pass as written**.

**What to do:** retire that checklist row, recording *why* (the permission is kept by ruling, so the
relay is unreachable at this table) rather than deleting it silently. **Do not delete the relay
code**: R-1 decided the permission, not the code's fate, and a world that revokes `ACTOR_CREATE`
would need the branch. Instead document it in the engine's tree-section header / `ENGINE_INDEX.md`
as reachable only when `ACTOR_CREATE` is revoked, so a future reader does not "clean up" live code.

**Done when:** the row is retired with its reason, the relay branch is documented as conditionally
dead rather than removed, and R-1 moves to `EDHA_RULINGS.md` §K citing the PR.

**PM:** lane R · model sonnet · size S · deps R-1 ✓ · verify: doc diff; no engine behaviour change.

---

## 28. [ ] Out-of-combat scope: gate scene/turn watches, tag bookkeeping writes (ruling R-4 — THE BIG ONE)

**Why:** Ben answered **R-4 on 2026-09-05: "go with your recommendations"** — apply the recommended
default. Today, out of combat: any focus **decrease** counts as a spend (including Ben's own GM
bookkeeping edits); every rule-owner on the scene watches everything; an adversary's own ability cost
is taxed by enemy watches; per-round ledgers **never reset**; "Restrained until your next turn" never
expires. Every run of both bench marathons saw some face of this. It retires a *family* of symptoms.

**What to do — as TWO PRs, not one** (they fail differently and must be pinned separately):
- **28a** — gate scene/turn-keyed watches on an **ACTIVE combat containing the owner**. Risk to pin
  against: wrongly silencing a legitimate out-of-combat rule.
- **28b** — **tag engine bookkeeping writes** so a GM edit is not read as a spend. Risk to pin
  against: wrongly classifying a real spend as bookkeeping.

**Do NOT fold in R-5..R-8.** They are separate rulings, still open; R-8 is explicitly flagged as
overlapping R-4 and must stay its own decision.

**Done when:** both halves are merged with pinned regressions in `tests/`, the symptom family above
is re-tested at a bench run (🤖 rows, not ⚑), and R-4 moves to §K citing both PRs. **This is live
engine behaviour: it is not settled until the bench confirms it.**

**PM:** lane B · model opus · size L — **split into 28a and 28b before dispatch** · deps R-4 ✓ · verify: pinned regressions + a bench pass. ENGINE-ONLY (F5), no pack rebuild expected.


---

## 29. [ ] `kind: line` zones catch every character, allies included (ruling R-5)

**Why:** Ben answered **R-5 on 2026-09-05: "no it does not"** — Fault Line's line does NOT spare
allies. The card says "each character"; the engine drifts: `edhaFaultLine` (register-skills.js,
the `edha-zone` kind `"line"` branch) builds its caught set with `edhaEnemyTokensInLine`, so an ally
standing in the line is neither damaged nor asked for the save. Card-is-spec: the engine changes.

**What to do:** in the `kind: line` path, replace the enemies-only caught set with **every token in
the line except the caster** (allies, neutrals, foes), and run the whole rider set on that set —
the damage (with the Construct multiplier), AND the `edhaFoeSkillVsColor` save/`failStatus` rider,
because the card draws no friend/foe distinction. Do it in the line-zone helper, not per talent, so
**every** `kind: line` rule inherits it (check whether any rule other than Fault Line uses the kind;
report the list). Keep the dangerous-terrain Region drop exactly as is — **R-6 (the Region catching
bystanders scene-wide) is a separate, still-open ruling and must not be decided here.** Pin a
regression in `tests/` on the caught-set helper: a friendly token inside the line is in the set, the
caster is not. Add one 🤖 checklist row: an ally in the line takes the damage and rolls the save.

**Done when:** allies in a `kind: line` are hit and saved like foes, the caster is excluded, the
regression is pinned, the 🤖 row exists, and R-5 moves to `EDHA_RULINGS.md` §K citing the PR.
**Live engine behaviour: not settled until the bench confirms it.**

**PM:** lane B · model opus · size S · deps R-5 ✓ · verify: pinned regression + a bench pass. ENGINE-ONLY (F5), no pack rebuild.

---

## 30. [ ] Rulings close-out: R-7, R-19, R-34, R-49 confirmed as shipped (docs only)

**Why:** Ben answered four rulings on 2026-09-05 from the mobile board, and each one **confirms the
behaviour that already ships** — no engine change, no card change. The rulings doc's own rule is
that a ruling is settled only when its consequence has landed; for these four the consequence is
docs: retire the rows that framed the behaviour as a defect, and move the rulings to §K.

- **R-7** — Final Decree / Edict's Temp HP rider: "attunement range is correct." The "17 ally(ies)"
  sweep was the bench fixture's 15 always-armed PCs (that is R-8, still open), not a scoping bug.
- **R-19** — combat-timing talents grant to adversaries too: "yes." 2bE-9 was already retired on
  evidence; drop the "say if you would rather it stayed PC-only" hedge wherever the checklist or the
  handoff repeats it.
- **R-34** — Walking Ruin's indicator: "needs a region left behind." Read as: no token status icon;
  the ruin-patch Regions the trail rule already drops ARE the indicator. Consequence: one **🤖** row
  — arm Walking Ruin, move three squares on a player client, three ruin patches render for the
  player (not GM-only). A fail there is a Drawing-visibility bug, filed separately, not a new
  indicator.
- **R-49** — a creature is an obstacle for push collision damage: "an actor is an obstacle." Matches
  the recommended default and the shipped behaviour.

**What to do:** in `EDHA_RULINGS.md` move R-7, R-19, R-34, R-49 to §K (Settled) with their answers
and dates, keeping the inline ANSWERED blocks' substance; in `EDHA_FOUNDRY_TEST_CHECKLIST.md` retire
or re-word every row that treats these four behaviours as open defects or open questions (grep the
ruling ids and the talent names; record the ruling id on each retired row), and add the single 🤖
row for R-34; rebuild the dashboard. **Do not touch R-5, R-6, R-8** — R-5 is item 29, the other two
are open.

**Done when:** the four rulings are in §K, no checklist row still asks a question these answers
settle, the R-34 🤖 row exists, `node scripts/build-dashboard.js --check` is clean, and the PR body
lists every row touched with its ruling id.

**PM:** lane R · model sonnet · size S · deps R-7/R-19/R-34/R-49 ✓ · verify: doc diff listed row by row. DOCS-ONLY. **Cloud-lane eligible** (markdown + generated HTML only).


---

## 31. [x] Mobile board models the operating windows, not a single quiet range (PM-R7) (2026-09-05, PR #150)

**Why:** On 2026-09-05 Ben moved the PM to **nights and weekends** (board ruling PM-R7: windows
Mon–Thu 21:00→07:00 and Fri 21:00→Mon 07:00, America/New_York; weekday daytime is his). The phone
view cannot show that: `scripts/pm-state.js` `parseCaps` reads ONE daily quiet range from the board
("between HH:MM and HH:MM") and falls back to `23:00`–`07:00`; `docs/pm-board-mobile.html` computes
`isQuiet` / `nextQuietEnd` from that pair and prints "quiet hours until …" and "the daily session
picks up at <quietEnd>". Since the re-cut, every one of those lines is wrong for part of the week.

**What to do:** replace the quiet-range pair with an **operating-window model**: a list of weekly
windows `{ dow: [...], start: "HH:MM", end: "HH:MM" }` in the board's zone, parsed from a single
machine-readable line the PM keeps in the board's Budget section (define the line's shape in the
script's header comment and add that line to `docs/PM_BOARD.md` — the PM's prose must not be the
parser's input). `inWindow(now)` and `nextWindowOpen(now)` replace `isQuiet` / `nextQuietEnd`; the
meters say "PM window closed until Mon 21:00" / "window open until 07:00"; the handed-off line names
the next session's start. Keep `DEFAULT_CAPS` for the dispatch/Opus/hours numbers. Update
`tests/pm-state.test.js`: the caps assertion, plus cases for a weeknight, a weekday noon, a Saturday
noon, and the Fri 21:00 → Mon 07:00 continuity. The tracked page keeps its empty snapshot slot.

**Done when:** `node scripts/pm-state.js --out <tmp>` emits the window list and `inWindow` for the
current time; the page renders the new lines with no reference to "quiet hours"; the test covers the
four cases above; the PM republishes the page **to the existing artifact URL** after merge (the PM's
job, not the worker's — note it in the report).

**PM:** lane R · model sonnet · size S · deps PM-R7 · verify: test + `--out` snapshot pasted in the PR. TOOLING-only (the tracked HTML changes, so the PM republishes the artifact).

---

## 32. [ ] Move the repo off OneDrive onto the local SSD (Ben's move; one worker PR first)

**Why:** OneDrive sets the read-only attribute on every directory under `.git` (308 of 308 on
2026-09-05), which hung `deploy-to-foundry.bat` twice on git's "Should I try again? (y/n)" prompt
and fails *silently* in agent shells; and the 74-character OneDrive root pushes Claude Code's
derived scratchpad path to ~165 characters, so PM worktrees could not be created where the harness
puts them (MAX_PATH). Both classes disappear when the working tree and `.git` leave the synced
folder. Full inventory, verdicts, and Ben's steps: **`docs/REPO_MIGRATION_BRIEF.md`**.

**What to do (repo side, a worker — BEFORE Ben moves anything):**
- `scripts/foundry-build.js:33`: `DATA` defaults to the absolute OneDrive literal — use
  `require("./lib/paths").DATA` (this is item 11's first consumer; do that item, or at least this
  file, first).
- `scripts/run-playtest-build.bat:2`: `cd /d` to the OneDrive path → `cd /d "%~dp0"`.
- Prose paths in `EDHA_TALENT_HANDBOOK.md` (~483), `TRIAGE_PLAYTEST_PC_MANUALS.md` (~62),
  `EDHA_FOUNDRY_HANDOFF.md` §"Source (canonical)" (~10384) → repo-relative wording.
- ⚑ Optional, Ben's yes needed: `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`) +
  `core.autocrlf=false` on the new clone, retiring the CRLF false-red family.

**What to do (Ben, after that PR merges):** the numbered steps in the brief — fresh clone into a
short path (`C:\dev\Skilltrees`), reinstall the hook, copy the two optional local files, re-point
the two scheduled tasks and the project memory folder, keep `Thycross.procreate` in OneDrive and
decide the art-drop handling (default: a OneDrive drop folder, moved by hand before each deploy).

**Done when:** `git rev-parse --show-toplevel` on Ben's machine is outside OneDrive, the deploy
script builds from the new `data/`, `module-src-sync.js status` reports in sync, and the
"PM worktrees under `C:/tmp`" rule is deleted from the board.

Repo-side worker PR: #156 (2026-09-05). Ben's steps in `docs/REPO_MIGRATION_BRIEF.md`
remain.

**PM:** lane H (Ben) after one lane-R worker PR (sonnet, S) · deps #139 #150 #151 merged, item 11 · verify: the worker's PR runs `node scripts/foundry-build.js` with `EDHA_DATA` unset from a scratch clone at a non-OneDrive path and pastes the resolved DATA line.

---

## 33. [ ] Re-land the handout-forge skill and the session-zero one-pager from PR #93

**Why:** PR #93 (2026-07-16) never merged and is orphaned by the 2026-07-28 history restart (no merge
base with `main`); nothing of it exists on main — no `.claude/skills/handout-forge/`, no
`EDHA_CAMPAIGN_ONE_PAGER.html`. Ben wants it (2026-09-05).

**What to do:** from commit `fbc8e20` on `claude/handout-forge-skill` (read it; never merge the branch):
- `git checkout fbc8e20 -- .claude/skills/handout-forge/SKILL.md EDHA_CAMPAIGN_ONE_PAGER.html`.
- Add the CLAUDE.md map-table row and trigger sentence **fresh** — do not take the branch's CLAUDE.md
  diff (it predates 500+ commits of that file).
- Do **not** take its `EDHA_PLAYER_PRIMER.html` (main's is generated by `build-player-primer.js`) or its
  handoff delta; write a 2026-09 delta. The PDF stays untracked (`*.pdf` policy); the skill says how to
  regenerate it (`chrome --headless --print-to-pdf`).
- Check every path the skill cites still exists (data files, scripts); fix the citations, not the repo.

**Done when:** the skill directory and the one-pager are on main, CLAUDE.md names the skill, gates
green. Then PR #93 can be closed and its branch moves from KEEP to SAFE in `docs/BRANCH_CLEANUP.md`.

**PM:** lane R · model sonnet · size S · deps none · verify: files present + `node scripts/build-dashboard.js --check`.

---

## 34. [ ] Fleet weapon migration + loot caches (player-clickable chest and body search) — re-do PR #103 on current main

**Why:** PR #103 (2026-07-18) built both and Ben approved the design (2026-09-05: *"Foundry didn't have
a way to 'click on a treasure chest as a player and open it' — I liked our fixes"*), but the branch is
orphaned by the 07-28 restart and the engine has moved 500+ commits since. Its items-pack half landed
later in a larger form (07-18e/f: `edha-items`, currency, kits); the **weapon** and **loot** halves never
did — the engine has 0 hits for `createLootCache` / `loot-take` / `edhaRuleBearer`, adversaries carry 1
weapon-kind item against the PR's 11, and the handoff's §9 still lists "Fleet weapon migration" open.

**What to do** (design from #103; source commits on `claude/section-9h-adversary-items-1c563f`, tip
`f6a0435` — read them for the shape, re-implement against today's engine, never merge the branch):
- **34a — weapons (DATA + ENGINE, adversaries pack REBUILD):** the 11 attack items across the 13
  statblocks → `kind: "weapon"` (gear, plus natural weapons with `alwaysEquipped: true`); maneuvers,
  reactions and **Frost Lance stay actions** and **the Malcurr blade is a weapon** (Ben's 07-18 rulings);
  attack numbers preserved (same skill test + modifier). Add the `edhaRuleBearer` predicate (talents +
  any weapon) on both passive-rule harvest loops so weapons' riders survive (Spearing Beak's fooled
  rider, Bite's Kindle, Scalpel-Strike's +4) — pinned test. Summon attacks (Construct Slam, Siege
  Cannon) build as weapons. Confirm `edhaAttackKind` already reads `system.attack.type` on main.
- **34b — loot (ENGINE-only):** `edha.createLootCache(name)` mints a GM-stocked cache actor with a
  linked chest token; players **double-click** a cache token or a **defeated adversary within 5 ft** for a
  contents card; **Take** relays through a `loot-take` GM-single-writer socket action (the double-loot
  guard), moves the item for real, posts a public card; adversary sheets never open to players; bodies
  keep their `alwaysEquipped` natural weapons; pure helpers pinned. Verify the `icons/svg/chest.svg`
  path on this Foundry version (was ⚑ in #103).
- Each half is its own PR. 🤖 bench rows for both (#103 listed 9 + 7).

**Done when:** both halves merged, their bench rows retired at a table, and the handoff §9 "Fleet
weapon migration" line checked. Then PR #103 can be closed and its branch moves to SAFE.

**PM:** lane B · model opus (or `fable-worker` on a weekend) · size L, dispatched as 34a then 34b · deps a
Foundry window for the bench · verify: pinned tests + scratch pack build + `validate-adversaries.js` 0 issues.

---

## 35. [x] Re-land the dashboard-on-the-phone branch (Snapshot + Dashboard on the mobile board) (2026-09-05, PR #159)

**Why:** `claude/in-app-dashboard-snapshot-ecwudz` (3 commits, 2026-09-05, 743 lines) added the
Snapshot tiles and the Dashboard section to `docs/pm-board-mobile.html`, `mobileSnapshot()` to
`build-dashboard.js`, and `dash/index` + `dash/c<N>` sharding to `pm-state.js` — Ben's "a full project
snapshot on my phone". It was published to the artifact but **never merged**; on 2026-09-05 ~14:55 the
PM republished the page from main and the phone lost those sections. Today it conflicts with main in
five files (`pm-state.js` and its test after #150/#153, the board, the handoff, the dashboard).

**What to do:** merge the branch onto a fresh branch from main; keep #150's `caps.windows` model and
#153's "no item number → `item: null`" rule; keep its tests and the existing ones green; rebuild the
dashboard; write the delta. After merge **the PM** republishes the page (`pm-state.js --inject`) and
pushes `dash/*` + `pm/state` to the artifact. Then the branch moves from KEEP to SAFE.

**Done when:** main's `docs/pm-board-mobile.html` has `id="snapshot"` and `id="dash"`,
`scripts/pm-state.js` writes `dash/index`, `node tests/run.js` green, and the phone shows the Snapshot again.

**PM:** lane R · model opus (a conflict-heavy merge) · size M · deps none · verify: tests + a `--out`
snapshot showing the `dash` chunks. **First dispatch of the next session.**

**Done 2026-09-05, PR #159 (TOOLING-only).** Merged as a real merge (both parents), resolved against
`main` after #150 and #153: `caps.windows` / `inWindow` / `nextWindowOpen` and the `item: null` rule
both survive, and the branch's `dash/index` + `dash/c<N>` sharding, `mobileSnapshot()`, and the
page's `id="snapshot"` / `id="dash"` sections land on top of them. The branch's edits to
`docs/PM_BOARD.md`, `EDHA_FOUNDRY_HANDOFF.md`, and `EDHA_DASHBOARD.html` were **not** carried over.
`node tests/run.js` 570/0; `--dashboard-dir` emits index 51 086 B + c0..c3 (largest 204 661 B, under
the store's 256 KiB cap), 361 rows, stamp `@c2687c698b`; the tracked page keeps `{}` in both slots.
**Still owed by the PM, not by this item:** republish the page to the existing artifact URL
(`--inject`) and push `dash/index` + the chunks with one `write_db` batch. Until that runs the phone
still shows the pre-merge page. After it runs, `claude/in-app-dashboard-snapshot-ecwudz` moves
KEEP → SAFE.


---

## 36. [ ] Picker cancel must not burn the once-per-scene use (ruling R-69)

**Why:** Ben answered **R-69 on 2026-09-05: "stamp only after a successful pick."** Today
`edhaDecreeUse` calls `edhaStampSceneOnce(owner, item)` **before** it opens the prohibition picker,
so **Cancel** refunds the Investiture (bench run 25: 4 → 1 → 4, no card, no `decree` flag) but leaves
`sceneOnce.<itemId> === true` — Final Decree is spent for the scene without ever resolving. The
pre-cost stamp was R-61's "vetoed BEFORE cost" polarity guarding against probing the picker for free;
Ben chose the table-friendly side: a cancel costs nothing and burns nothing.

**What to do:** at the primitive, not per talent — find every `edhaDialogPick` caller (and any other
picker primitive) that stamps `sceneOnce` (or any once-per-X marker) before the pick resolves, and
move the stamp to after a successful pick; `null`/cancel leaves no stamp. Report the list of callers
touched. Pin a regression in `tests/` on the pure ordering helper if one exists, otherwise on the
stamp-after-pick path with a stubbed pick returning `null` (no stamp) vs a value (stamp). Add one
🤖 checklist row: Final Decree → Cancel → the talent is still usable this scene; Final Decree →
pick → `sceneOnce` stamped and a second use refused.

**Done when:** a cancelled pick leaves `sceneOnce` untouched everywhere, a successful pick still
stamps it, the regression is pinned, the 🤖 row exists, and R-69 moves to `EDHA_RULINGS.md` §K
citing the PR. **Live engine behaviour: not settled until the bench confirms it.**

**PM:** lane B · model opus · size S · deps R-69 ✓ · verify: pinned regression + a bench pass.
ENGINE-ONLY (F5), no pack rebuild. Fold into the next `test-pass-fixes` dispatch if bench run 27
produces one; otherwise a standalone S worker.

---

## 37. [ ] `bench-setup-console.js` must detect and repair ORPHAN tokens on the Playtest Map

**Why:** bench run 27 (2026-09-05) found three Playtest-Map tokens whose `actorId` resolves to no
actor — `Bench — Green`, `Bench — Heroic`, `Bench Target — Floater`. Driving one fails as "no token on
the scene", which reads exactly like an engine fault and costs a bench run its diagnosis time. The
setup script reports "16 PCs / 7 targets, zero ⚠" against that scene because it keys on names and
never checks that a token's actor exists; it can neither see nor repair an orphan.

**What to do:** in `scripts/bench-setup-console.js`, after the roster pass, walk the scene's tokens
whose names match the bench roster and check `token.actor` (or `game.actors.get(token.actorId)`);
for each orphan, print a ⚠ line naming it, then repair by re-pointing the token at the roster actor
of the same name when one exists (`token.update({actorId})`, unlinked tokens keep their delta) or
deleting and re-placing it at the same position when none does. Never touch a token whose name is
not on the bench roster (Ben's PCs "Tem parinaem" / "Soggy Bottom" stay hard-guarded). Report the
count in the summary line so a future run's "zero ⚠" means it.

**Done when:** running the setup script against the current Playtest Map prints the three orphans,
repairs them, and a second run prints zero; a 🤖 row in the checklist asks the next bench run to
confirm the three tokens drive. Pure harness — no engine, no pack, no talent change.

**PM:** lane B (needs the live scene to prove) · model sonnet · size S · deps none · verify: the
script's own before/after output pasted from the live table, and the 🤖 row. TOOLING-only.
