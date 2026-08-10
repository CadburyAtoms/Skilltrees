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

## 11. [ ] Migrate the 6 remaining Foundry/repo path-literal scripts onto scripts/lib/paths.js

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
