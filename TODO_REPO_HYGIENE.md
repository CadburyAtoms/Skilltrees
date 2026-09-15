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

## 2. [x] Remove committed binaries — especially the copyrighted Stormlight PDF — DONE 2026-09-13: the PM deleted 117 remote branches on Ben's word ("I'll let you handle since main is caught up"); `docs/BRANCH_CLEANUP.md` carries the record; only the two YOUR-CALL branches remain
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

## 3. [x] Add `package.json` + `LICENSE`; delete the root HTML snapshots — DONE 2026-09-13, PR #343
> **2026-07-06 status: mostly DONE** — `package.json` added (private, Node ≥ 20, gate
> script aliases incl. `npm run gates`), both `v-pre-*` snapshots deleted (nothing
> referenced them). **Remaining: LICENSE** — Ben deferred the choice ("decide later");
> revisit MIT vs MIT-code + CC BY-NC-SA-content when he's ready.
>
> **2026-09-13: LICENSE landed.** Ben's call in chat ("whatever won't get me in trouble
> and is most widely applicable") read as dual-license: MIT for code, CC BY-NC-SA 4.0 for
> content, plus an unofficial-fan-content notice. `LICENSE` added at repo root with the
> code/content split spelled out by directory; `package.json` gained
> `"license": "MIT AND CC-BY-NC-SA-4.0"`; `README.md` got a License section.

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

## 4. [x] Split the ~19.7k-line engine (2026-09-05) into concatenated sections (keep ONE deployed file) — DONE 2026-09-06, PR #247

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

**PM:** lane R · model fable-worker · size L · deps #23 (banners, #179) + #24 (table registry, #244) · verify: three equal SHA-256s + a mutation of one source failing `--check`.

**DONE (2026-09-06, #247 — TOOLING-only; the deployed file did not change by one byte).** Ruling
**PM-R15** applied as the default: the assembled `module-src/scripts/register-skills.js` STAYS the
tracked and deployed artifact; the per-section sources are the EDIT surface. `scripts/engine-split.js`
(re-runnable) cuts the engine at every column-0 `/* ===` banner into `module-src/scripts/engine/NN-<slug>.js`
— **55 files**, each an exact byte range, lexical order = assembly order; the head docblock is file 00,
the largest is `53-native-event-system.js` at **3,067 lines** (one banner, one file — no invented
seam). `scripts/engine-assemble.js` concatenates them (CRLF→LF only, the engine is tracked LF) and
`--check` names the first differing line + its source file. Gate **`engine-assembly`** sits right after
`engine-check` in `gates.js`; the pre-commit body runs it when the engine or `engine/` is staged.
Proof: sha256 `acac2589…` for the tracked engine before the split, the re-assembled engine, and
`origin/main:module-src/scripts/register-skills.js`; a one-line mutation of `41-life.js` failed the
gate at engine line 13186 (`source 41-life.js:5`), re-assembly green. `module-src-sync.js` still
mirrors only the assembled file (its `FILES` list; checked). Docs: `ENGINE_INDEX.md` header rule +
section → file map, CLAUDE.md "Where behavior lives" + rule 2a, the three engine-editing skills,
`scripts/README.md`.

---

## 5. [x] Extend tests into the hook layer (fake actor/item → assert the write) — DONE 2026-09-05, PR #182

**Why:** `tests/engine-helpers.test.js` covers ~8 pure helpers of a ~19.7k-line engine (2026-09-05).
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

**Shipped 2026-09-05.** `tests/harness.js` gained `fireHook(env, name, ...args)` — every recorded
`Hooks.on`/`Hooks.once` registration for that hook, in true registration order (a single monotonic
`seq` now spans both lists, because Foundry keeps them in ONE ordered array), awaited, results
returned, throws propagated, `once` consumed — plus `mockItem` (rules on `system.events`, so the
stub is the shape Foundry produces), an `update()` recorder on `mockActor`/`mockItem` that records
AND applies, and `whisper` on `captureChat`. It replaces four hand-rolled loops with four different
and silent semantics (`tests/harness.js`'s header names them); `pre-hook-client-split.test.js` is
refactored onto it. The three behaviours, +34 cases, suite 608 → 642:

1. **`cosmere-rpg.preUseItem`** — the document-driven single-target gate (`tests/hook-single-target-gate.test.js`):
   the pre-cost veto, the whispered picker card, and the retarget write the click performs.
2. **`cosmere-rpg.preApplyDamage`** — Temp HP absorption (`tests/hook-apply-damage-pre.test.js`):
   the by-reference `damage.calculated` reduction, the `tempHp` flag (unset, not zeroed), the card.
3. **`combatTurnChange`** — the timed-status expiry pass (`tests/hook-timed-status-expiry.test.js`):
   the delete write, the target-/owner-relative catch-up stamp, and the one-applier GM gate.

Each proven by a one-line engine mutation that fails the assertion and passes on revert. **Not
done: the other ~237 hooks** — the next-highest-traffic uncovered paths are the `cosmere-rpg.useItem`
arms and the applyDamage POST pass (`edhaWrapApplyDamage` is a method wrap, not a hook, so it needs
a wrapper harness rather than `fireHook`). The house rule now lives in
`.claude/skills/test-pass-fixes/SKILL.md` §"Ship a pinned regression — and how to fire a hook in a test".

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

## 10. [x] Migrate the disposition-default fail-open backlog onto the failed-closed helpers — DONE 2026-09-06, batch 1 PR #200, batch 2 PR #263

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

**BATCH 1 DONE (PR #200, 2026-09-06): 63 occurrences migrated, 11 left for batch 2, 0 stay.**
`counts.dispoFailOpen` **74 → 11**. Batch 1 was scoped to every site whose filter decides who
*receives* something — damage, a heal, a status, an ActiveEffect, a ledger/flag stamp, a movement
veto, a token displacement, a posted cue that writes `trigRound`, or live dice math (31 sites,
63 occurrences). Three findings the entry could not know:

- **The idiom carried TWO polarities** (item 12's lesson again): `?? 1` defaults an unresolvable
  side to FRIENDLY, `?? 0` to NEUTRAL. The **token-move trample sweep** used a *different default on
  each end of one comparison*, so two unknowns read as OPPOSITE sides and it fired; the
  **`edha-hp-threshold` reaction** carried the comment "allies only; unknown fails closed" over a
  `?? 0` pair that read two unknowns as the SAME side.
- **The helpers R-63 shipped did not fit most sites.** `edhaDisposHostile`/`edhaSameDisposition` take
  *actors* and re-resolve a token the caller already holds. The migration added the value-level pair
  **`edhaSideSame` / `edhaSideHostile`** (PURE, indexed, pinned) carrying the identical convention,
  and the corollary that had already re-widened two sites: **`!edhaSideSame` is NOT
  `edhaSideHostile`** — the splash and burst filters both read `!same` as "enemy".
- **A baked side is a stored fail-open.** The civ-fortify / Foundation payloads froze
  `edhaCasterToken(o)?.document?.disposition ?? 1` into a Region behavior. They now bake
  `edhaActorSide`, and `edhaCivFortifyGM` refuses to build a Region whose owner side did not resolve.

**BATCH 2 — the 11 left, all reads whose only consumer is a card's wording or a picker list a human
then confirms:** `edhaPickCandidates` (3), `edhaSweepEmptyNote` (2), the movement-window card (2),
`edhaPickProhibition`'s dialog `<select>` (2), the `edha-cleanse` beacon list (2). A human gate
stands between each of these and any effect, which is the line batch 1 was drawn on. **Nothing was
classified "legitimately defaulted"** — the two payload-bake sites that looked like the "caster's own
token" exemption are exactly the shape `ENGINE_INDEX.md` says to replace with `edhaActorSide`, so
they migrated. Batch 2 can therefore still reach **0**.

**BATCH 2 DONE (PR #263, 2026-09-06): the 11 migrated, `counts.dispoFailOpen` 11 → 0 — a TOMBSTONE
now, like `rollFold` / `gmWhisper`.** Per site: `edhaPickCandidates` hands RAW sides to
`edhaPickAccepts` (`edhaActorSide` for the owner, the anchor's token document read directly), and the
four side branches of `edhaPickAccepts` now call `edhaSideSame` / `edhaSideHostile` — an unresolvable
side is offered under neither `ally` nor `enemy` (nor the anchor pair) but still under `any`;
`edhaSweepEmptyNote` counts candidates with the same pair, never names an unresolvable token as the
nearest, and tells an owner whose own side did not resolve so; the movement-window card lists allies by
`edhaSideSame` and says why when the mover has no side; `edhaPickProhibition`'s `<select>` uses
`edhaActorSide` + `edhaSideSame`; the `edha-cleanse` beacon list uses `edhaSideSame`. Six headless pins
(one per family plus the hostile-owner polarity) in `tests/disposition-failclosed.test.js`; reverting
three families to `?? 1` fails the pins AND lint pass 20. Corollary re-checked across the engine: no
migrated site reads `!edhaSideSame` as "enemy" — but **`47-power.js` (`edha-aura`-style `affects`
sweep, ~L419) still does** (`want === "enemies" && same` → continue, so an unresolvable side passes the
enemies filter); it goes through `edhaSameDisposition`, was outside the 11, and is reported, not fixed.

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

## 12. [x] Adopt edhaDefBuffGmGate at the 20 primaryGmGate sites (2026-09-06, PR #197)

**Why:** `scripts/engine-idiom-ratchet.json`'s `primaryGmGate` key is frozen at 20 with 20 still
measured — unlike the other eight idiom keys, NONE of this one has migrated yet; it is a
freeze-only entry (nothing can regrow past 20, but nothing has shrunk either). The idiom is
`activeGM && !game.users.activeGM.isSelf` hand-deriving the primary-GM gate instead of calling
`edhaDefBuffGmGate()`.

**What to do:** work through the 20 sites, replacing the hand-derived check with
`edhaDefBuffGmGate()`, lowering `counts.primaryGmGate` as they migrate. This family is directly
related to pass 15's two-GM double-write gate (`EDHA_FOUNDRY_HANDOFF.md`'s "the two-GM family") —
prioritize any site that also performs a world write.

**Done when:** `counts.primaryGmGate` is below 20 and trending toward 0. ✅ **Done: 20 → 1, which is
the FLOOR** (the same shape `userTargets` has — the last occurrence is the canonical helper's own
body, and a helper cannot call itself). All 19 hand-derived copies migrated, and **all 19 write to
the world**, so the whole set is pass 15's two-GM family.

**The correction (PM-D1): "replace the hand-derived check with `edhaDefBuffGmGate()`" was right for
16 of the 19 and wrong for 3** — and that is why this key had never shrunk. The idiom was carrying
**two polarities**:

- **`edhaDefBuffGmGate()` = "am I the single applier?"** — `isGM &&` the primitive below. False on
  any non-GM client, *including when no GM is connected at all*: nothing happens rather than the
  wrong client writing. 16 sites wanted exactly this and were byte-equivalent to it (two of them
  spelled the `isGM` half as its own `if (!game.user?.isGM) return;` line above the check).
- **`edhaNoOtherActiveGM()` = "has no OTHER GM client claimed this?"** — the primitive. True on the
  primary GM, **true when no GM is online**, false on a second GM and on any player while a GM is
  online. Three sites want this, all three `RegionBehavior._handleRegionEvent` bodies, and they want
  it *deliberately*: a region trap has to keep springing on the walking player's own client in a
  GM-less session, and bolting the `isGM` half on would silence it. That is a live-behaviour change
  and a ruling, not hygiene — so it was **not** done here.

The gate is therefore **decomposed, not duplicated**: `edhaDefBuffGmGate()` is now literally
`!!game.user?.isGM && edhaNoOtherActiveGM()`, which is what takes the count to 1 rather than 2.

| Site (line, pre-migration) | What it writes | Verdict |
|---|---|---|
| 326 — `ready` currency-denomination backfill | `actor.update` on every character | → `edhaDefBuffGmGate()` |
| 1909 — `edhaDispatchCombatTiming` | dispatches every combat-timing rule | → `edhaDefBuffGmGate()` |
| 6935 — `edha-illusion-upkeep` turn sweep | whispered upkeep card | → `edhaDefBuffGmGate()` |
| 7041 — barrier socket relay | Wall create/delete | → `edhaDefBuffGmGate()` (split form) |
| 10119 — `edhaDarkVeilSweep` | effect apply/remove | → `edhaDefBuffGmGate()` |
| 11483 — the main `EDHA_SOCKET_ACTIONS` relay | every relayed player write | → `edhaDefBuffGmGate()` (split form) |
| 11842 — charge trigger `updateToken` watcher | owner-list write + card | → `edhaDefBuffGmGate()` |
| 11863 — `edhaChargeDamagedCheck` | owner-list write + card | → `edhaDefBuffGmGate()` |
| 12052 — hazard-trail drop on move | Region create | → `edhaDefBuffGmGate()` |
| 12073 — Pinpoint terrain follow | Region update | → `edhaDefBuffGmGate()` |
| 12175 — `place-hazard-region` relay | Region create | → `edhaDefBuffGmGate()` |
| 13941 — the defeat watcher (live→0) | the `defeat` announcement + writes | → `edhaDefBuffGmGate()` |
| 14648 — Civilization socket relay | fortify / link / dismantle writes | → `edhaDefBuffGmGate()` |
| 15413 — counter-transfer defeat watcher | prompts + burst apply | → `edhaDefBuffGmGate()` |
| 17364 — PC sight resync on Awareness | `actor.update` + scene token updates | → `edhaDefBuffGmGate()` |
| 17516 — `deleteRegion` paired-Drawing cleanup | Drawing delete | → `edhaDefBuffGmGate()` |
| 14400 — Civ fortified-foundation region event | damage + card | **stays on the primitive** — must still fire on a GM-less table |
| 17590 — dangerous-terrain region event | damage + card | **stays on the primitive** — same reason |
| 17623 — Fate-snare region event | springs the snare | **stays on the primitive** — same reason |
| 7576 — `edhaDefBuffGmGate`'s own body | — | now composes `edhaNoOtherActiveGM()`; the primitive's body is the ratchet's floor |

Pinned in `tests/gm-gate.test.js` (6 cases, 720 → 726) across the four client shapes a two-GM table
produces. 🤖 row added under `# BENCH — Engine-wide & cross-tree`: two GM clients, one write.

**Left open (not this item's call):** whether the three region behaviours *should* also require
`isGM`, i.e. whether a GM-less table should still spring a trap from the player's own client. Today
it does; changing that is a ruling.

---

## 13. [x] Migrate resourceWrite's remaining 12 sites onto the canonical resource writers (2026-09-06, PR #194)

**Why:** `scripts/engine-idiom-ratchet.json`'s `resourceWrite` key started at 17, is down to 12 —
12 sites still write a `system.resources.<id>.value`/`.max` update path by hand instead of
calling `edhaSpendResource`/`edhaConsumeCost`.

**What to do:** work through the remaining 12 `["']system\.resources\.[a-z]{2,4}\.(value|max)["']`
sites in `register-skills.js`, lowering `counts.resourceWrite` as they migrate.

**Done when:** `counts.resourceWrite` reaches 0. ✅ **Done: 12 → 0.** But the *destination* in the
title was wrong, and correcting it (PM-D1) is the finding: **not one of the twelve was a spend.**
Every cost deduction in the engine already ran through `edhaSpendResource`/`edhaConsumeCost` — the
survivors were gains, heals, restores, a lifesteal, a revive-to-1, a Colossus max-HP override and
one drain whose classification is an open ruling, each with its own max math, its own
failure handling (a socket relay, a bare `return`) or a multi-path update. That is exactly why they
were still hand-rolled: **there was no canonical writer for a resource write that is not a plain
clamped spend/gain.**

**So this pass built one: `edhaResourceWrite(actor, resource, changes, options)`** — it owns the
path (built from the resource id, so no quoted literal survives anywhere in the engine) and takes
the **#28b classification as an argument**. That is what makes the item a correctness item and not
hygiene: since #28b landed the day before, an update's `options` are where a write says what KIND of
write it is, and a hand-rolled `actor.update({…})` with no options says nothing at all. `changes` is
keyed relative to the resource (`{ value: n }`, or `{ "max.override": n, "max.useOverride": true,
value: n }`); the writer deliberately does **not** clamp and does **not** catch, so every site kept
its own and the migration is a pure refactor plus the tag.

| # | Site | Verdict |
|---|---|---|
| 1 | the `edha-regen` turn-end sweep (heal) | **bookkeeping** — declared non-spend |
| 2 | `edhaGainFocus` | **bookkeeping** — keeps `edhaFocusWatch`; a gain never reaches the predicate |
| 3 | `edhaDrainFocus` | **path only — options UNTOUCHED.** An involuntary drain is **R-72, open**; a tag here would answer it by the back door |
| 4 | the `heal` effect branch (relay-on-failure) | **bookkeeping** — its socket relay stays at the site |
| 5 | `edhaApplyBurstResults`' heal hit | **bookkeeping** |
| 6 | the decay tick's lifesteal-back | **bookkeeping** |
| 7 | `edhaDeathWardCheck`'s drop-to-1 | **bookkeeping** — a restore, not a spend |
| 8 | `edhaCivTransformSummon` (Colossus `max.override` + `max.useOverride` + `value`) | **bookkeeping** — a transform/override; the multi-path shape is why `changes` is a map |
| 9 | the Devoted Conduit redirect unwind | **bookkeeping** |
| 10 | `edhaHealActor` | **bookkeeping** |
| 11 | `edhaDrawMana`'s Investiture recovery | **bookkeeping** |
| 12 | H10 `edha-focus`'s Investiture branch | **SPEND on the drain** (`edhaSpendTag`, exactly as #28b left it) / bookkeeping on the gain |

**Proof.** Pure refactor plus the tag, so the mutation-sensitive pin is the ratchet plus the one
stamped site: re-inlining the raw `who.update({"system.resources.inv.value": next})` at site 12
fails `lint-refs.js` pass 20 (`grew from 0 to 1`) **and** two cases of the new
`tests/resource-writes.test.js` (the H10 stamp case and the ratchet case); restoring makes all three
green. That file also pins the writer's contract (path composition, options passed through
unchanged so a spend stamp survives, no clamp, no catch), the bookkeeping declaration on two
migrated sites, and — the case worth keeping — that `edhaDrainFocus` still writes with
`{ edhaFocusWatch: true }` and **nothing else**, so R-72 cannot be answered in a refactor.
**720 passed, 0 failed** (+8). ENGINE-ONLY (F5) — no pack rebuild.

**Ratchet note.** 0 is genuinely reachable here (where `userTargets` floors at 1) because pass 20's
regex counts a **quoted literal** key and every canonical writer composes its path from a variable.
A count of 1 means someone hand-rolled a literal resource path again.

---

## 14. [x] Migrate userTargets' remaining 10 sites onto the target-reader primitive (2026-09-06, PR #193)

**Why:** `scripts/engine-idiom-ratchet.json`'s `userTargets` key started at 63, is down to 10 —
10 sites still read `game.user.targets` directly instead of going through the target-reader
primitive (`edhaEffectTargets` / the upcoming reader named in the ratchet's comment).

**What to do:** work through the remaining 10 `game\.user\??\.targets` sites in
`register-skills.js`, lowering `counts.userTargets` as they migrate.

**Done when:** ~~`counts.userTargets` reaches 0.~~ **Corrected on measurement (PM-D1):
`counts.userTargets` reaches 1.** The idiom's canonical helper is a *reader*, and a reader cannot
read through itself — the last occurrence is the reader's own one-line body, which is the point of
the migration rather than a violation of it. 1 is the floor; 2 means someone hand-rolled the read
again. ✅ **Done: 10 → 1, nine of nine call sites migrated, none left direct.**

**What the ten actually were.** All ten (and all 53 retired before them) turned out to be the same
two shapes — the FIRST target, which R-64 already had a reader for, and the WHOLE list, which had
none. So this pass built the plural sibling **`edhaUserTargetTokens()`** (a fresh `Array` snapshot;
`[]`, never `undefined`, with no targets or no `game.user`) next to `edhaUserTargetToken()`, and
`edhaUserTargetToken` now delegates to it. Two standing exemptions in `ENGINE_INDEX.md` were
predictions that measurement overturned and are deleted there: that the survivors were
"genuine ALL-targets reads that have no first-target shape to migrate to", and that sites inside
`edhaEffectTargets` "may still read `game.user?.targets` directly".

| # | Site | Verdict |
|---|---|---|
| 1 | `edhaUserTargetTokens()` — the reader's own body | **stays** — the reader cannot read through itself; this is the ratchet's floor of 1 |
| 2 | `edhaUserTargetToken()` | migrated (now `edhaUserTargetTokens()[0] ?? null`) |
| 3 | `edhaEffectTargets` — the `"prompt"` branch | migrated (the "canonical consumer" exemption was unnecessary) |
| 4 | `edhaSovTargets` — the ally/enemy split | migrated |
| 5 | `edhaSetUserTargets` — the clear-all branch (releases every current target) | migrated |
| 6 | The single-target `preUseItem` gate (`edha-single-target`) | migrated |
| 7 | `edhaFindMarkGrant` — is the marked token among my targets | migrated |
| 8 | `edhaRedirectClick` — find a willing in-range ally | migrated |
| 9 | The pre-use range guard (`rangeFt` "nothing spent" veto) | migrated |
| 10 | The adv-attack `to: "targets"` fan-out + the next-test-mod multi-target fan-out | migrated (both) |

**Proof:** pure refactor — `edhaUserTargetTokens()` is character-for-character what each site
inlined, so no behavioural test can tell the versions apart. The mutation-sensitive pin is the
ratchet itself: re-inlining the direct read in `edhaSovTargets` fails `lint-refs.js` pass 20
(`grew from 1 to 2`) **and** the last case in `tests/user-targets-reader.test.js`; restoring makes
both green. That file also snapshot-pins the reader's contract and two migrated sites
(`edhaSovTargets`, `edhaSetUserTargets`) so a future edit to the reader goes red rather than
silent. ENGINE-ONLY (F5) — no pack rebuild.

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

## 18. [x] Guard the authored overlay's name-fallback against cross-tree collisions (2026-09-05, PR #170)

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

**Done:** the flat `byName` is gone; `loadAuthoredIndex` returns `byTree` (one name map per
`"<atlas>/<group>"`) and `authoredOverlayFor()` is the only lookup — docId first, then the name
**inside the talent's own tree only**. Cross-scope duplicates get one build-log line; a name
defined twice *within* one scope gets a loud `AMBIGUOUS` warning. Pack parity held exactly (all
five packs + backgrounds content-identical, `authored-overlays:365` unchanged), so no overlay
changed hands. **Finding:** the fallback was NOT dormant — deity/Knowledge's "The Final Study" is
the one entry of 365 whose stored docId (`WKWGvUtfrlOZVc0B`) matches no current tree+name seed, so
it already resolves by name; it was safe only because no other tree defines that name. The build
now names any such talent every run (`authored overlays matched by name (stale docId …)`). Fixing
the docId itself is a `data/authored/` edit and needs Ben's re-extract + rebuild — not done here.

---

## 19. [x] Split `EDHA_FOUNDRY_HANDOFF.md` into a current reference and a dated changelog (2026-09-06, PRs #249 + #251)

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
**19a shipped in PR #249** (2026-09-06, DOCS-ONLY): the reference rewrite — 671 lines at the bottom of the handoff under `## Reference — table of contents`, §9 anchor and its 40 Engine-tab rows byte-preserved, the header wall replaced by a pointer. **19b (the delta move + `HANDOFF_ARCHIVE.md` fold + `build-dashboard.js` re-point) remains** — the box stays open until it lands.
**19b shipped in PR #251** (2026-09-06, DOCS-ONLY + TOOLING): the mechanical move — `scripts/handoff-split.js` moved all 142 dated deltas VERBATIM into `docs/handoff-changelog/2026-{06,07,08,09}.md` (18 / 42 / 1 / 81, newest first; SHA-256 of the removed text = SHA-256 of the month bodies, `8ae508b8…`), `HANDOFF_ARCHIVE.md` became `docs/handoff-changelog/ARCHIVE-header-wall.md` (its entries are header-wall summaries, not deltas, so it was moved whole), the handoff is the reference alone (691 lines, TOC first), every writer instruction re-pointed (CLAUDE.md iron rule 5 + map rows, work-item / project-manager / test-pass-fixes / talent-migration / lore-forge / session-forge / session-debrief / handout-forge / bench-run + runbook, `audit.py`'s docs read), the dashboard's Engine tab unchanged at 40 rows. "Done when" caveat: `git log --follow` on a month file cannot reach a delta's original commit (the block left a file that still exists); `git log -S"<delta title>" -- EDHA_FOUNDRY_HANDOFF.md` does, and every header says so.

---

## 20. [x] One gate list, and gates that pass on Windows (2026-09-05, PR #167)

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

## 21. [x] Stale-doc sweep from the 2026-09-04 review (2026-09-05, PR #174)

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

**Done:** every listed correction is in. `scripts/README.md` documents all 22 previously-missing
scripts and drops `playtest-setup-console.js`; `scripts/check-scripts-readme.js` (new) diffs it
against `git ls-files scripts` and passes clean. CLAUDE.md's and these two items' "11k-line engine"
corrected to the measured **~19.7k lines (2026-09-05, `wc -l`)**; the overlay field list corrected
to the real seven keys. `talent-balance/SKILL.md`'s duplicated frontmatter removed.
`EDHA_EDITABILITY_AUDIT.md` and `Actor pages design review/` moved to `docs/archive/` (ruling
PM-R2) with pointer stubs; every live reference to both old paths re-pointed (CLAUDE.md,
`ENGINE_INDEX.md`, `talent-migration/{LESSONS,SKILL}.md`, `EDHA_RULE_2B_CLASSIFICATION.json`,
`lint-refs.js`, `dump-native-vocabulary.js`, `name-keyed-allowlist.json`,
`EDHA_FOUNDRY_HANDOFF.md`'s two live pointers) — left alone as historical narration, not broken
pointers: this doc's own line above, `EDHA_FOUNDRY_HANDOFF.md`'s "(8) NEW" delta announcement, and
`HANDOFF_ARCHIVE.md`'s frozen 2026-07-14h cascade. `pre-commit-body`'s dashboard regex gained
`EDHA_RULINGS.md` (`docs/PM_BOARD.md` was already there from item 25). `AUTHORING_WORKFLOW.md`
got the `.baselines/` one-liner.
**Moot before this session started** (the 2026-09-05 fresh-clone move to `C:\dev\Skilltrees` left
none of these behind): the four stale worktrees under `.claude/worktrees/` (a fresh clone has
none — confirmed with `ls`; any `agent-*` dir there today is a different, live worker, untouched),
and the untracked `screenshots/`, `src/`, and `data/authored/.baselines/` leftovers (confirmed
absent with `ls`, so nothing to delete).
**Found out of scope, not fixed:** `data/native-vocabulary.json:8` still names the old
`EDHA_EDITABILITY_AUDIT.md` path (this worker's scope excluded `data/`); `docs/PM_BOARD.md`'s own
PM-R2 ruling row names both old paths (that's the ruling text itself, and `docs/PM_BOARD.md` is
PM-owned).

---

## 22. [x] Structure data: park the unbuilt Radiant rows and normalise the three key dialects

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

**Done 2026-09-05 — PR #175 (DATA-only; packs byte-identical, so no rebuild and no ⟳ Sync are
owed).**

*The consumer question (ruling PM-R3): the Radiant rows had **NO consumer**.* Grepped every reader
of `data/cosmere.json` and of any Radiant-order field before deciding — `scripts/lib/data.js`
`buildTrees()` (`cos.filter(t => t.path === path_)` over `HEROIC_PATHS`), `scripts/build-player-primer.js`
(`src.filter(t => t.Path === p)` over the same six — so **the primer does not show the orders**),
`scripts/validate.js` (`isLoadedByApp()` and `buildTalentGroups()` both gate on `HEROIC_PATHS`, so the
rows were never schema-checked and never joined the global name universe), `scripts/foundry-build.js`
(consumes `buildTrees()` only), `scripts/lint-refs.js` (added their names to `talentNames`, nothing
more), `tests/pipeline.test.js` (explicitly `continue`s on a non-heroic tree), `tests/prereq-groups.test.js`
(pins one *Scholar* row); `build-canon-codex.js`, `build-dashboard.js` and the `audit.py` files read no
atlas data at all. Cross-checked: no Radiant-only talent name appears as an engine string literal, on
`scripts/name-keyed-allowlist.json`, in `data/authored/*`, or in `data/adversaries.json` (the one
apparent hit, `Overgrowth`, is a **deity** talent and resolves via `domain.json`). Confirmed from the
other side by `build-player-primer.js --check` and `build-canon-codex.js --check` both reporting
**up to date** after the change. So: 225 rows → `source-materials/radiant-orders.json` (`_note` /
`_unpark` header; 0 of 225 carry `layout` or `connections`, so un-parking still owes each order a tree
layout — iron rule 7), and `data/cosmere.json` is 150 rows.

*The dialect:* one lowercase dialect across all three files (`Tree` → `specialty`), renamed
line-anchored so every value and the formatting survived byte-for-byte. `normRow`'s getter `G` and
every alias deleted, `getField` unexported; `validate.js` reads real field names and **rejects each
retired key by name**, on every row *before* `isLoadedByApp` (the old order is why a wrong-dialect row
was skipped rather than caught). Pinned in `tests/atlas-dialect.test.js` (8 cases). Proof: all six pack
content-hashes identical before/after (`origin/main` tree+data vs. this branch, scratch `EDHA_MODROOT`s);
mutation — re-introducing `"Talent Name"` makes `validate.js` exit 1 naming the key and its replacement;
`gates.js --ci` 12/12 PASS, `600 passed, 0 failed`. Also found and fixed: `pipeline.test.js`'s Death-cycle
pin read `.Prerequisites`, which after the rename would have been `undefined` and passed **vacuously**.

---

## 23. [x] Banner the 3,700 unbannered engine lines (prep for #4) (2026-09-05, #179)

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

**DONE (2026-09-05, #179).** 21 banners added — 20 across the cross-tree run (defence buffs ·
consume-dialog title · talent budget · sheet path slots · the creation wizard · sheet QoL · talent
sync · adversary sync · temp HP · summons · injuries · trigger gating & cost · senses/light/
visibility · triggered-effect resolution · the single-target gate · targeting & AoE · point-targeted
bursts · synchronous formula evaluation · the refund race · burst execution + the GM socket relay)
plus one for the SHARED CORE, the file's *other* unbannered stretch (lines 1–1487, which the head
docblock describes as skill registration only and never names as shared). Banner count 31 → 52.
The run also carries a seam marker at its head saying the Red tree section ends there — the ~3,700
lines had been sitting under Red's banner by accident of append order. `ENGINE_INDEX.md` gains a
**section map** listing all 52 banners in file order, with the primitives each of the 20 new ones
owns. Proof: `codeOnly(before) === codeOnly(after)` byte-identical via the repo's own
`scripts/lib/strip-comments.js` (sha256 `3ae1ed71…`, 13,373 code lines both sides, +353 comment
lines); `lint-refs.js` output identical (`477 talent names, 11 engine name-literals`), which is
passes 20/21 unchanged; `gates.js` 10/10 PASS. Comment-only — the file changes, behaviour does not.

---

## 24. [x] Table-driven handler registry (the first real cut of #4) (2026-09-06, PR #244)

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

## 26. [x] Bench PCs get a normal sight range (ruling R-2) (2026-09-05, PR #173)

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

## 27. [x] Retire the `GM summon relay` checklist row (ruling R-1) (2026-09-06, PR #184)

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

## 28. [x] Out-of-combat scope: gate scene/turn watches, tag bookkeeping writes (ruling R-4 — THE BIG ONE) (2026-09-06, PRs #188 + #189 — **bench-pending**)

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

**28a DONE 2026-09-06 (PR #188) — ENGINE-ONLY (F5), no pack rebuild. The item stays OPEN: 28b is not
built and the bench has not confirmed.** Root cause was one read repeated across the engine —
`game.combat` is the **client's VIEWED combat**, not the owner's and not necessarily an active one,
so every `game.combat?.round ?? 0` froze per-round ledgers at round 0 out of combat and
`game.combat?.started` being false left `edhaApplyTimedStatus` unable to stamp an expiry (the
immortal "Restrained until your next turn"). New generic gate **`edhaInActiveCombat(actor)`** → the
started/active combat this creature is a combatant of, or null — scans `game.combats`, matches
generously (token id / actor id / combatant actor uuid), and **fails toward "in combat"** because a
wrong NO silences a live talent, which is this half's named risk. Two thin readers
(`edhaCombatRoundOf`, `edhaTurnSeqOf`, both `null` and never `0`) and one scene-scope watch gate
(`edhaWatchCombatGate`) ride it. **Adopted at ~30 sites**; the full adopted-vs-deliberately-ungated
tables are in the 2026-09-06 handoff delta. The line is drawn at **`scope`**: `scope: "self"` watches
are **never** gated (a self-watch on your own roll is a legitimate out-of-combat rule), `scope:
"scene"` needs an active combat containing the watcher, and an authored `outOfCombat: true` opts out.
Also deliberately ungated: the two wall-clock prompt debounces, `edhaRoundWindowValid`'s
out-of-combat window, the GM current-combatant fallbacks, and `edhaCaeCombatant` (a lookup whose
empty answer would silence a grant). Pinned in **`tests/combat-gate.test.js`** — 17 cases, every one
asserting BOTH directions; mutation-verified three ways (over-gating fails 2, the `game.combat`
revert fails 5, the round/stamp revert fails 2). 670 passed, `node scripts/gates.js` PASS.
**28b (tagging bookkeeping writes) is untouched** — no focus-spend classification was changed — and
**R-4 stays open** until 28b lands and the bench confirms. Five 🤖 rows queued under
`# BENCH — Engine-wide & cross-tree`, including an explicit negative control.

**28b DONE 2026-09-06 (PR #189) — ENGINE-ONLY (F5), no pack rebuild. The item is checked, but
`bench-pending`: R-4 stays open in `EDHA_RULINGS.md` until a bench run confirms BOTH halves live.**
Root cause was one missing distinction: **a resource DECREASE is not a SPEND.** `updateActor` saw
focus go down and dispatched `focus-change` regardless of cause, so Ben typing an adversary's focus
down on the sheet taxed it through Whispered Doubt, handed out Coercive Pressure's disadvantage, and
tripped an Order Edict's "activate Investiture" prompt. **The direction was the real decision, and
it is the POSITIVE one: the engine stamps the SPEND, and an unstamped decrease is not one.** Tagging
the *bookkeeping* instead — the ruling's own phrasing — cannot work, because the writes R-4 complains
about are exactly the ones the engine never issues (a GM sheet edit, a token-bar drag, a third-party
macro): there is no write to tag, so the absence of a tag can never be evidence. Two positive
signals cover the whole surface: **`options.edha.spend`** (via `edhaSpendTag()`, in `options` so it
is broadcast to every client — `edhaSpendResource`, `edhaConsumeCost`, the `set-resource` socket
relay, H10's Investiture drain), and a **pre-use expectation** for the cosmere-rpg system's OWN
activation deduction, which runs from a `postRoll` action with a plain `actor.update()` and no
options at all (verified against `systems/cosmere-rpg/index.js` at 2.1.0) — `cosmere-rpg.preUseItem`
records what the use will cost via `edhaConsumeList`, and any matching decrease inside 30 s counts.
Every uncertainty leans toward **"yes, a spend"** (amount-agnostic, non-consuming, throws → YES),
because this half's named risk is the mirror of 28a's: **wrongly classifying a real spend as
bookkeeping**. **`edhaIsSpend(actor, resource, options, old, new)` is adopted at exactly two sites** —
the `updateActor` focus-change watch and the Order Investiture watch — and a test fails if a third
appears; the health→0 defeat watchers are deliberately NOT spend sites (a GM zeroing HP is a
legitimate kill). Pinned in **`tests/spend-tag.test.js`** — 18 cases, both directions each;
mutation-verified both ways (dropping the tag fails 3, inverting the predicate fails 6). 688 passed,
`node scripts/gates.js` PASS; neither ratchet moved. Three 🤖 rows added beside 28a's, including the
"a real spend still taxes" row that is this half's negative control.


---

## 29. [x] `kind: line` zones catch every character, allies included (ruling R-5) (2026-09-06, PR #185)

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

**DONE 2026-09-06 (PR #185) — ENGINE-ONLY (F5), no pack rebuild.** `edhaEnemyTokensInLine` is
replaced by **`edhaTokensInLine`**: every LIVE token in the length×width line **except the caster**
(excluded by token id *and* by actor identity, so it fails closed when the caster's token cannot be
resolved), disposition ignored. Done in the line-zone helper, so every `kind: line` rule inherits
it; both riders read the one `caught` binding, so an ally is damaged (Construct multiplier included)
**and** rolls the `edhaFoeSkillVsColor` save that applies `failStatus`. That helper needed no change
— it is disposition-blind, "foe" is only its name; the `saveSkill` field's Foundry label dropped its
"Foe"/"per foe" wording to stop contradicting the ruling. **Consumers of `"kind": "line"`: exactly
one — Fault Line (`data/authored/deity-destruction.json`, rule `FaultLineZone000`)**; no other
authored rule and no adversary ability uses the kind. Pinned in `tests/line-zone-caught-set.test.js`
(6 cases), mutation-verified: restoring the enemies-only filter fails 3 of them (651 passed, 3
failed). **R-6 untouched** — the dangerous-terrain Region's scope is a separate open ruling. Live
behaviour still needs the 🤖 Destruction row in `EDHA_FOUNDRY_TEST_CHECKLIST.md`.

---

## 30. [x] Rulings close-out: R-7, R-19, R-34, R-49 confirmed as shipped (docs only) (2026-09-05, PR #172)

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

## 32. [x] (2026-09-05, PR #156) Move the repo off OneDrive onto the local SSD (Ben's move; one worker PR first)

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

## 33. [x] Re-land the handout-forge skill and the session-zero one-pager from PR #93 (2026-09-05, PR #164)

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

## 34. [x] Fleet weapon migration + loot caches (player-clickable chest and body search) — re-do PR #103 on current main (2026-09-06, PRs #220 + #233)

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
34a shipped in PR #220 (2026-09-06, REBUILD + ⟳ Sync): 11 items weapon-type, `edhaRuleBearer` on both rule
loops (mutation-verified), summon attacks as weapons, parity table 336/11/0, 9 🤖 rows.
**34b shipped in PR #233 (2026-09-06, ENGINE-ONLY, F5):** `edha.createLootCache` (chest icon verified on
v13.351), the `Token#_onClickLeft2` reader (cache token / defeated adversary within 5 ft; sheets never open
to players), the `loot-take` socket action with the `edhaLootClaim` double-loot guard (the two-relay race
pinned on the real handler), bodies keep `alwaysEquipped` weapons; 11 headless cases, 8 mutations, 7 🤖 rows.
Both halves merged → **item checked**; the bench rows retire at a table (lane B); then PR #103 closes and
its branch moves to SAFE.
Follow-up scope for the PM: the 39 bestiary blocks statted after 07-18 carry 44 attack items still `action`.

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

## 36. [x] Picker cancel must not burn the once-per-scene use (ruling R-69) (2026-09-05, PR #160 — **live behaviour bench-pending**)

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

**DONE 2026-09-05, PR #160 (ENGINE-ONLY).** Stamp moved below the picker's refund guard; pinned
behaviourally + generically in `tests/picker-cancel-stamp.test.js`. Detail: the handoff delta.
⏳ **Bench-pending** (🤖 row under `# BENCH — Sovereignty`); R-69 → §K after it passes.

**PM:** lane B · model opus · size S · deps R-69 ✓ · verify: pinned regression + a bench pass.
ENGINE-ONLY (F5), no pack rebuild. Fold into the next `test-pass-fixes` dispatch if bench run 27
produces one; otherwise a standalone S worker.

---

## 37. [x] `bench-setup-console.js` must detect and repair ORPHAN tokens on the Playtest Map (2026-09-05, PR #171)

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

**DONE 2026-09-05, PR #171 (TOOLING-only).** `benchOrphanPlan` added and wired; pinned in
`tests/bench-orphans.test.js` (7 cases + mutation on the protected-name guard). Detail: the
handoff delta. ⏳ **Bench-pending** (🤖 row under `# BENCH — Engine-wide & cross-tree`) — the
repo-side worker cannot join Foundry, so the live before/after on the three named orphans is
bench run 30's job.

---

## 38. [x] The TODO doc is one dashboard section and the pm-state stress cap fails on any new item (2026-09-05, PR #162)

**Why:** Item 36's worker measured it: `scripts/build-dashboard.js`'s `parseRepoHygiene()` folded
every `## N.` item in this file into ONE dashboard section, `repo-sec0`, which serialised to
**65 443 bytes**. `tests/pm-state.test.js`'s "the shards stay under the chunk cap" test sharded the
real dashboard snapshot against a **fixed 64 KiB (65 536 byte) stress cap** — an accident of that
one section's size at the time the test was written, not a deliberate ceiling. Item 36's worker had
~93 bytes of headroom inside it; item 36 and 37's own entries used it up, so `shardDashboard` threw
`alone exceeds` and **every new TODO item failed `tests/run.js`** — including this very entry,
until the fix landed.

**What to do:** in `parseRepoHygiene()`, emit one section per `## N.` item (title = the item's own
heading text, `done`/`partial` preserved on the block) plus a leading intro-prose section for the
text above item 1, instead of one section for the whole doc. Confirm every downstream consumer
(`renderPane`, `mobileSnapshot()`, the `tab.key + '-sec' + i` id scheme, the `forBen`/`benchQueue`
mirrors) still works — they were already generic over `tab.sections` arrays. Re-pin the stress
test off the largest REAL section (assert it stays under a sane ceiling, stress-shard at ~1.5× it)
instead of the magic 64 KiB constant, so the pass measures the sharder's behaviour under a tight
cap rather than accidentally capping Ben's docs. Keep the `alone exceeds` throw-on-oversize
assertion.

**Done when:** a ~1.5 KB addition to this file builds and passes `node tests/run.js` cleanly;
`node scripts/build-dashboard.js`'s row count is unchanged; the stress test's cap is derived from
real data, not a fixed number that happens to be close to one section's size.

**PM:** lane R · sonnet · S · deps none · verify: mutation (append ~1.5 KB, show `alone exceeds`
pre-fix, show it pass post-fix, on both a scratch mutation and the real doc). TOOLING-only, no
engine, no pack rebuild.

**Done 2026-09-05, PR #162 (TOOLING-only).** `parseRepoHygiene()` now returns one section per item
(121 sections total, up from 84); real-doc largest section dropped from 65 443 B (`repo-sec0`) to
28 491 B (now the `world` tab's demographics section). Stress test re-pinned at 1.5× the largest
real section (~42.7 KiB, 17 chunks) with an added `< 64 KiB` regression assertion on the largest
section; `DASH_CHUNK_BYTES` sharding unchanged at 4 chunks. Mutation-verified: pre-fix, a ~1.3 KB
scratch addition failed `tests/run.js` 577/1 with `alone exceeds`; post-fix, the identical addition
passed 578/0. `build-dashboard.js` row count unchanged at 438 either way. Row ids on the Repo tab
changed (expected — each item is now its own section); every other tab's ids are untouched.

---

## 39. [x] `audit.py <tree>`'s NO FILE message does not list the valid keys, and the gate docs do not name the deity keys (2026-09-05, PR #166)

> **Premise corrected by the PM, 2026-09-05 21:20 (measured, not read):** on `main` today
> `python .claude/skills/leyline-tree-authoring/audit.py verdannis` prints `verdannis: NO FILE` and
> exits **1** — the `NO FILE` branch sets `any_fail` and the script has not changed since 07-25. The
> "exit 0" in the original report was almost certainly a masked exit code (a `|`-piped or `;`-chained
> gate — iron rule 4's own warning). What remains is the usability half below, plus a pinned case in
> `tests/audit_parser_test.py` so the exit code can never regress silently. Size stays S.

**Why:** `python .claude/skills/leyline-tree-authoring/audit.py verdannis` prints `verdannis: NO
FILE` and exits **0** — the deity's data key is `sovereignty`, not the deity's proper name
`verdannis`, so a misspelt or wrong-key gate invocation passes silently instead of failing the
commit. `CLAUDE.md`'s iron rule 4 and the `work-item` skill both tell a session to run
`audit.py <color|deity-name>`, but neither doc lists the actual deity KEYS the script expects, so
a session has no way to know `verdannis` is wrong without already having read the script's own
data.

**What to do:** in `audit.py`, make a `NO FILE` result for an unknown tree name exit non-zero and
print the list of valid keys in the same message (so the failure is self-diagnosing). Add the
deity KEYS (not just the proper names) to the gate command lists in `CLAUDE.md` (iron rule 4) and
in `.claude/skills/work-item/SKILL.md`'s gate list, so `audit.py <key>` is copy-pasteable without
guessing.

**Done when:** `python .claude/skills/leyline-tree-authoring/audit.py verdannis` (or any other
misspelt/nonexistent name) exits non-zero and lists the valid keys; the deity KEYS appear in the
gate command lists in `CLAUDE.md` and the `work-item` skill.

**PM:** lane R · sonnet · S · deps none · verify: mutation (run the misspelt name before and after,
show the exit code change from 0 to non-zero). TOOLING-only, no engine, no pack rebuild.

---

## 40. [x] `bench-setup-console.js` builds `Bench — Life` without a `Mutation` item, so the Venom Glands / R-65 row cannot be driven (CLOSED 2026-09-05 without a change — premise failed measurement, bench run 29 / PR #168)

> **Closed by the PM, 2026-09-05 22:45.** Bench run 29 drove the row: the talent is named
> **`Adaptive Mutation`**, `Bench — Life` has always carried it, and the click wrote a real rolled
> `mutation.venom = 4`. Run 28's "no `Mutation` item" was a name mismatch, not a roster gap; the
> Venom Glands row is retired. Nothing to build. Item 37 (orphan tokens) stands on its own.

**Why:** bench run 28 (2026-09-05) traced the checklist's "Venom Glands (adversary bespoke
ability) — the poison-damage roll folds" row and found there is no adversary roll to fold at all:
the rolled formula is the Life tree's `Mutation` adaptation. The row was corrected in place, but
it still cannot be driven because the bench roster's `Bench — Life` actor carries no `Mutation`
item. The roster script's per-tree grant list is the gap, not the engine.

**What to do:** in `scripts/bench-setup-console.js`, add `Mutation` (and any adaptation the Life
tree's authored file names as a roll source) to the `Bench — Life` grant list, keep the roster
idempotent (a second run reports 0 created), and leave a 🤖 row under the R-65 section asking the
next bench run to drive Venom Glands from that item. Dispatch together with item 37 — same file,
same lane, one bench run proves both.

**Done when:** the setup script's summary shows `Bench — Life` holding `Mutation`, a second run is a
no-op, and the R-65 Venom Glands row retires on a later bench run's evidence. Pure harness — no
engine, no pack, no talent change.

**PM:** lane B (the live roster proves it) · model sonnet · size S · deps none (pair with 37) ·
verify: the script's before/after summary from the live table, plus the 🤖 row. TOOLING-only.

---

## 41. [x] "The Final Study" (deity/Knowledge) carries a stale authored docId — the one overlay that resolves by name — DONE 2026-09-06, folded into item 58, PR #227

**Why:** item 18's worker (PR #170, 2026-09-05) measured every one of the 365 authored overlay
entries against `fid("talent:<tree>:<name>")` and found exactly one orphaned docId:
`data/authored/deity-knowledge.json`'s **The Final Study** stores `WKWGvUtfrlOZVc0B` while the
current seed hashes to `MQvIkCSK7fIHjnZE` — the talent was renamed after its last extract. It
lands on the right overlay today only because no other tree defines that name; the build now
prints it every run under "authored overlays matched by name (stale docId — re-extract to re-key)".

**What to do:** re-key it. Either Ben re-extracts `deity-knowledge.json` from Foundry (the
AUTHORING_WORKFLOW loop, which re-keys every entry), or a worker rewrites the ONE `docId` value to
the current seed with a pack-parity proof (the overlay content does not change, so the packs are
byte-identical either way). It is an authored-file edit, so it needs Ben's OK either way.

**Done when:** `node scripts/foundry-build.js all` prints zero "matched by name" lines and the
packs hash identical before/after.

**PM:** lane H (Ben's re-extract) or R with Ben's OK (one docId value) · model sonnet · size S ·
deps Ben's OK · verify: the build's name-match count 1 → 0 + pack parity. DATA-only, no rebuild.

**Ben's OK 2026-09-06 — folded into item 58.**

**Correction (item 58, 2026-09-06):** the seed stated above, `MQvIkCSK7fIHjnZE`, does not
reproduce — re-derived by hand, from a live scratch build's assigned item `_id`, and by rebuilding
item 18's own commit (`4500f95`) with its own `data.js`/`domain.json` snapshot, all three agree on
**`yrIgDwup7iBdPq07`** (`fid("talent:deity/Gnothis:The Final Study")`). That is the value shipped.

---

## 42. [ ] The `updateActor` AWA → prototype-token sight re-sync may not fire for console-created actors

**Why:** item 26's worker (PR #173, 2026-09-05) traced the bench PCs' 10 ft sight to
`register-skills.js` ~16502–16521: `preCreateActor` stamps `prototypeToken.sight.range` from AWA
at creation (AWA 0 → 10 ft), and the `updateActor` watcher that should re-stamp it when AWA
changes did not take effect for actors the bench script creates and then updates from the GM
console — the roster script now sets the value directly. This is a code-reading inference, not a
table measurement, and bench run 30 added a related finding: **already-placed scene tokens keep
their own stale `sight.range`** (a 🤖 row under `# 🎮 Player-client window`). If the watcher is
really guarded out, Ben's own PCs would also keep a stale prototype sight after an AWA change.

**What to do:** on the bench, create an actor from the console, raise AWA, and read
`prototypeToken.sight.range` before and after; then do the same from the sheet as a player. If the
watcher does not fire in either path, root-cause it (the `activeGM` guard is the first suspect) and
fix it at the watcher, with a pinned test; if it does fire, record that the bench script's direct
set is the whole fix and close this item.

**Done when:** the watcher's behaviour is measured on the table and either fixed with a test or
recorded as working; the stale-token 🤖 row is retired on evidence.

**PM:** lane B · model opus · size S · deps none · verify: the table measurement + a pinned test if
fixed. ENGINE-ONLY if a fix is needed.

---

## 43. [x] Phone board "Needs you" view — collapse the dashboard to what Ben must act on (2026-09-06, PR #236)

**Why:** Ben, phone chat 2026-09-06 (~09:20 ET, relayed by skilltrees-f4): "I've noticed I'm not
working on rulings because for each I need to scroll through the phone dashboard, find one I can
parse, scroll back up to the pm inbox, and write a ruling. If we can clean up the phone dashboard
to 'only things Ben needs to see or we need from him' that might help." As of 2026-09-06 every
ruling in `EDHA_RULINGS.md` is answered (item 45), so this view now serves FUTURE rulings and
Ben-only actions, not a backlog.

**What to do:** Rework `docs/pm-board-mobile.html` to open on a "Needs you" view: one status line
(PM awake/stopped, what is running, blocked-on-Ben yes/no) plus cards, nothing else above the
fold.
- One card per open ruling and per board `(waiting)` ruling: bold heading = the question; the
  *Recommended…*/APPLIED sentence = the default (regex-extract from `EDHA_RULINGS.md`, else "no
  default stated"); a "blocks N checklist rows / TODO items" badge (count citations, so blocking
  rulings sort first); full text behind a details expander. Two controls: **[Go with the
  default]** writes the inbox note `Re Rulings › <section> › R-n. <question>: default` in one
  tap; **[Other…]** is an inline text box submitting the same prefix + Ben's text. No scrolling to
  a composer.
- Ben-only actions as cards with a **[Done]** button posting an inbox note, sourced from a new
  `benOnly` list in `pm/state` that the PM fills from the board's "Waiting on Ben" line (keep that
  line one bullet per ask).
- ⚑ rows: count + link only. The rows, queue, budget, run log, and full dashboard move under a
  collapsed "More" toggle (state in `localStorage`).
- §I APPLIED rulings render as "applied — veto?" cards with **[Keep]** / **[Veto…]** (moot once
  item 45 moves §I to §K, but keep the affordance for the next batch of defaults).
- Addendum from the same-day stall post-mortem: show a STALE-HEARTBEAT banner when `pm/state`'s
  `generatedAt` is older than 60 minutes while the PM claims to be awake — a scheduled-task
  session sat on one permission dialog for six hours on 2026-09-06 while the phone still read
  "alive".
- Files: `docs/pm-board-mobile.html`, `scripts/build-dashboard.js` (`parseRulings` +
  `mobileSnapshot` index), `scripts/pm-state.js`, `tests/pm-state.test.js` (pin the parser on
  R-41/R-42/R-54). Worktree-safe: no engine, no data changes.

**Done when:** any open ruling can be answered in two taps from the top of the page; the
dashboard index carries `{id, section, ask, default, applied, blocks}` per open ruling;
`tests/pm-state.test.js` pins the parser on R-41/R-42/R-54; dashboard regenerated; page
republished at its existing URL.

**PM:** lane R · model sonnet · size M · deps none · verify: `tests/pm-state.test.js` +
`node scripts/gates.js` + dashboard rebuild. DOCS/TOOLING (no engine, no data).

---

## 44. [x] `Ask:` lines on open rulings whose heading isn't a self-contained question (2026-09-06, PR #258)

> **DONE 2026-09-06.** Item 43's parser had no `Ask:` fallback at all — the card's question was
> the heading, full stop — so the format was settled HERE: an `Ask:` paragraph (one line, its own
> paragraph directly under the heading paragraph, `(a)/(b)` named when the entry has them) now
> wins over the heading in `parseOpenRulings()` (`scripts/build-dashboard.js`, `RULING_ASK_RE`);
> the convention is written into the rulings doc's intro. Audit of the 8 open rulings (R-18, R-48,
> R-80 … R-85): 4 got an `Ask:` line (R-48 — the heading names one block, the ask now covers the
> run-19 family; R-81 — leaned on R-46; R-82 — leaned on R-14; R-83 — "three `hea` writers"
> unnamed), 4 already had a self-contained question heading (R-18, R-80, R-84, R-85). Proof: the
> regenerated dashboard index yields a `?`-terminated question on all 8; `tests/pm-state.test.js`
> pins the fixture (`Ask:` wins, no `Ask:` → heading) and the real file (R-81's ask names (a)/(b),
> every open ask ends in `?`); reverting the parser fails both. The tracked `docs/pm-state.json`
> was NOT regenerated (openRulings rides in the dashboard index, not the board state).

**Why:** Phase 2 of item 43's same 2026-09-06 note: some ruling headings in `EDHA_RULINGS.md`
describe a symptom rather than posing a question a "Needs you" card can present standalone.

**What to do:** Audit every open ruling heading; where it isn't already a self-contained
question, add a one-sentence `Ask:` line beneath it that is one. Coordinate the exact
heading/`Ask:` fallback with item 43's card template (43 lands first).

**Done when:** every ruling section either has a self-contained question heading or an explicit
`Ask:` line; item 43's mobile view renders a real question on every card.

**PM:** lane R · model sonnet · size S · deps 43 · verify: read-through of `EDHA_RULINGS.md` open
sections + dashboard rebuild. DOCS-ONLY.

---

## 45. [x] Rulings close-out 2026-09-06 — record every phone answer (2026-09-06, PR #213)

**Why:** Ben answered every open ruling on the morning of 2026-09-06 through the phone inbox (66
relayed notes, `tmp/pm/inbox-2026-09-06/inbox/*.json`); those answers need to land in
`EDHA_RULINGS.md` and the docs each ruling touches before the fix-pass items (47–62) can cite them
as settled.

**What to do:**
- `EDHA_RULINGS.md`: every answered ruling that produces no code change moves straight to §K;
  every ruling that spawns a fix item is marked ANSWERED inline naming its TODO item number, then
  moves to §K once that item ships. §I's 14 accepted defaults (R-43…R-68 per the note) move to §K
  as ANSWERED-by-acceptance (R-73 stays in §I — Ben vetoed its default; see item 54). Add an R-72
  entry (involuntary drain is not a spend, answered (b) — it lived only on the board table).
  Give the GM-less region-traps ruling (item 12 / PR #197 table) its own new R-number, answered
  (a) KEEP. Record R-78 (retire `edha-aoe-template`) as ANSWERED (a).
- Checklist citation housekeeping (no new row content — just reflecting the answers) for rows
  citing R-9/16/24/26/30/33/39/41.
- 28a's "deliberately NOT gated" list + `ENGINE_INDEX.md`'s "the gate is TWO helpers" note: add
  R-75 (the H26 reaction family — Shared Conviction, Pillar of Order, Voice of Authority — is
  deliberately ungated) and the GM-less traps ruling.
- `.claude/skills/bench-run/` hard rule 4 + `docs/EDHA_BENCH_RUNBOOK.md`: widen the Playtest Map
  scene licence to the whole scene (Ben: "the entire scene is for your use at this point"); the
  two PC actor documents (Tem parinaem, Soggy Bottom) keep their hard guard as actor-directory
  documents — only their tokens on that scene fall under the new licence.
- R-76's design seed, verbatim: "make a note this is good juice for a future adversary stat
  block" (an adversary whose signature ability drains a PC's Investiture) — record it in the
  bestiary/adversary design notes, cross-referenced from the H10 engine header.
- A doc-map line for `docs/ACTOR_STAT_DERIVATION.md` (merged from
  `claude/sunday-pm-session-sync-d0pzsm` commit 79cf9b1) added wherever the handoff's doc map
  lives.
- A dated delta at the top of `EDHA_FOUNDRY_HANDOFF.md` covering this close-out AND item 46's
  filing (the two items share one delta, written by this item's worker).

**Done when:** `EDHA_RULINGS.md` has zero rulings left answered-but-unrecorded from the
2026-09-06 batch; §I holds only R-73 pending item 54; the new R-number for GM-less traps exists;
the handoff delta is written; dashboard rebuilt.

**PM:** lane R · model sonnet · size M · deps none (runs in parallel with item 46) · verify:
manual diff of `EDHA_RULINGS.md` sections + dashboard rebuild. DOCS-ONLY.

---

## 46. [x] File TODO items 43–62 from the 2026-09-06 rulings (2026-09-06, PR #212)

**Why:** Ben answered every open ruling on the morning of 2026-09-06 (66 phone-relayed notes); the
PM triaged them into a numbered backlog (items 43–62) but the entries didn't exist in
`TODO_REPO_HYGIENE.md` yet.

**What to do:** File items 43–45 and 47–62 in house format (this item's PR does the filing; the
parallel item-45 worker records the rulings themselves in `EDHA_RULINGS.md` and writes the shared
handoff delta).

**Done when:** `TODO_REPO_HYGIENE.md` has 62 numbered items, all with Why/What to do/Done
when/PM fields; dashboard rebuilt; gates green.

**PM:** lane R · model sonnet · size S · deps none · verify:
`grep -c '^## [0-9]' TODO_REPO_HYGIENE.md` = 62 + `node scripts/gates.js`. DOCS-ONLY.

---

## 47. [x] Fix pass 7a — heal / status / resource family (R-10, R-12, R-36, R-51, R-52(c)(i), R-72, R-76, R-54 — 2026-09-06, PR #215; **R-25 NOT shipped, see below**)

**Why:** Nine 2026-09-06 rulings land on the same family of small engine writers (drop-to-1,
Harvested Remain, ally-drop cues, Temp HP labelling, Investiture bookkeeping, HP derivation).
Ben's answers:
- R-10 (b): stabilizing at 1 is a floor against death, not regaining — every drop-to-1 writer
  must bypass the "cannot regain HP" condition.
- R-12 (a): raising clears the raised creature's OWN `harvested` marker + ledger entry.
- R-25 (c): Rallying Shout's reminder prints only for an ally at 0 HP or carrying Unconscious.
- R-36 (a): Temp HP `source` relabels only when the new grant WINS the keeps-higher comparison.
- R-51 (a): a phantomDouble's break fires no ally-drops cue.
- R-52 (c)(i): the +2.5 ft half-square slack in `edhaAllyDropEligible` (edge-to-edge measurement
  is item 62).
- R-72 (b): an involuntary drain is not a "spend" — H10's Investiture-drain write (~L18139) and
  `edhaDrainFocus` carry `edhaBookkeepingTag` instead; item 28b's "a test fails if one ever
  appears" pin flips to its opposite; plus R-76 (b)'s header comment (leave the unconsumed
  spend-stamped branch, note it as a future adversary's signature ability).
- R-54 (c): "go with removing the +1" — `EDHA_HP_BONUS = 1` → `0` (~L17300; keep the constant,
  fix its comment: the system derives Movement and Senses differently from Edha, not HP — HP is
  identical; no level gate).

**What to do:** ENGINE-ONLY (F5). For each ruling, make the fix at its named site, add a headless
pin, and re-pin `tests/derived-stats.test.js` + `tests/engine-helpers.test.js` wherever they
assert the old +1. Rewrite the checklist row ~L2229 ("+1 max health SOLVED-pending-confirm") as
the R-54 re-test: fresh PC actor at STR 0 reads 10/10 after Finish; an existing PC at full health
drops 11→10 on reload with nothing stored changing; mark 🤖. June pregens storing a manual
`hea.max.bonus` keep it until `edha.migrateDerivations()` runs — leave them.

**Done when:** all nine pins pass; `tests/derived-stats.test.js` / `tests/engine-helpers.test.js`
assert 0, not +1; the R-54 checklist row is rewritten and marked 🤖; each ruling recorded
ANSWERED/shipped in `EDHA_RULINGS.md` §K.

**PM:** lane B · model opus · size M · deps 45, 46 · verify: 9 headless pins + re-pinned
derived-stats/engine-helpers tests. ENGINE-ONLY (F5).

**RESULT (2026-09-06, PR #215 — seven of eight shipped):** R-10, R-12, R-36, R-51, R-52(c)(i),
R-72+R-76 and R-54 all landed, one themed commit each, every one proven by mutation. Three findings
the PM should carry forward:
- ⛔ **R-25 (c) is NOT an engine-only change and did not ship.** Rallying Shout's reminder is an
  AUTHORED `edha-note` rule on Rousing Presence (`data/authored/heroic-envoy.json`, rule
  `RouseRallying000`), and `edha-note` has no target-condition dial. Gating it needs a new generic
  field **plus** an authored value (REBUILD + ↻ Sync), or a name-keyed branch that iron rule 2b
  forbids. Needs its own rebuild-class item; the ruling's answer stands.
- ⚠️ **R-10 needed no behaviour change.** The audit found all four drop-to-1 writers already
  bypassing the heal cut; what shipped is the ruling recorded at the site plus the guard (the heal
  gate's call sites are pinned at 2, `bypassHealCut`'s callers at 1) so the family cannot drift apart.
- ⚠️ **R-52's own prose was slightly wrong.** With the +2.5 slack the boundary is inclusive, so the
  7.5-ft Large-owner case the ruling predicted would *still* miss now reaches. Item 62 (edge-to-edge)
  is still worth doing for larger tokens, but its motivating example is no longer failing.
- `tests/engine-helpers.test.js` needed no change: only `tests/derived-stats.test.js` asserted the +1.

---

## 48. [x] Fix pass 7b — cards, labels, zones (R-31, R-32, R-37, R-38, R-55, R-78, R-13, R-6, weapon-picker article — 2026-09-06, PR #217; all nine shipped)

**Why:** Eight more 2026-09-06 rulings plus one bench-run-38 defect (PR #207, merged 0ff8d14) land
on card text, labels, and zone behavior. Ben's answers:
- R-31 (a): a PC's own Phantom Double token is labelled "(Illusion)"; the Mistheron's copy keeps
  its plain name.
- R-32 (a): Black Draw Mana's sweep card reads "swept N · newly Weakened M".
- R-37 (a): fix all three nits — Ordained eviction names the fizzled oldest ground; Inevitable
  Snare's grammar (check whether the string is authored or generated before editing); Bulwark's
  THP attribution.
- R-38 (a): a Dread-Presence-refused move posts one whispered card to the mover's owners + GM,
  throttled per token per round.
- R-55 (a): the sheet's three budget chips all read SPENT / total (12/12, 5/5, 2/4 for a built L1
  PC).
- R-78 (a): retire `edha-aoe-template` — it has zero consumers in shipped data.
- R-13 (a): a Fate snare placed under a creature ARMS only; it springs on enter/pass-through, not
  at placement.
- R-6 (b): Fault Line's dangerous-terrain Region exempts the caster only; lay the rectangle one
  square out or exempt the caster's token from the tick, whichever keeps the footprint honest.
- Bench run 38's weapon picker reads "a Agent" / "a Envoy" instead of "an".

**What to do:** ENGINE-ONLY (F5) for all nine. R-37's Inevitable Snare fix is authored text (not
engine) if the string lives on the card — if so, report it out of scope for this item rather than
editing `data/authored/*`. R-78: remove `edha-aoe-template`'s registration + `edhaPlaceAoe`'s
template branch (keep what `edhaCastBurst`/`edha-burst` share); strike its `ENGINE_INDEX.md` row
with the date; leave lint vocabulary, native-vocabulary snapshot, and the name-keyed allowlist
untouched; retire the "AoE burst auto-target" checklist row's remaining clause. Pin each behavior
headlessly; add a 🤖 checklist row per ruling.

**Done when:** all nine pins pass; gates stay green after `edha-aoe-template`'s removal; each
ruling recorded ANSWERED/shipped in `EDHA_RULINGS.md` §K.

**PM:** lane B · model opus · size M · deps 45, 46 · verify: 9 headless pins + green gates
post-retirement. ENGINE-ONLY (F5).

**RESULT (2026-09-06, PR #217 — ENGINE-ONLY, F5; bench-pending):** all nine shipped, one themed
commit each, 51 headless cases across nine new `tests/` files, and eleven one-line reversions each
proved to fail its own pin. All ten local gates PASS. Four findings for the PM:

1. **R-37(2) was ENGINE-generated, not authored** — the ruling asked to check before editing, and
   the answer is that the string is built in the `edha-owner-list` annotate executor
   (`register-skills.js`), not in `data/authored/deity-fate.json`. So all three nits shipped in one
   ENGINE-ONLY pass and no rebuild-class item is needed. Fate's own authored `events` were not
   touched.
2. **`scripts/foundry-build.js`'s `aoeRule()` is a live generator for the handler R-78 just
   retired** — out of this item's scope and NOT fixed. It fires for any talent with
   `TALENT_TARGETING[...].area` and no `.burst`, which today is only **Lay Foundation**, whose
   authored overlay supplies an `edha-zone` rule that REPLACES the generated events. That is why
   `data/` sweeps find zero and why the CI pack build stays green. But delete Lay Foundation's
   authored `events` and the next build mints a rule nothing can execute. Worth a small
   TOOLING-only item.
3. **R-6's HOW was a real choice and it is recorded.** Ben left "lay the rectangle one square out"
   and "exempt the caster's token" open; this took the exemption, because the rectangle IS the line
   that was just damaged and shifting it would make the terrain and the burst disagree about the
   same ground. The dial is generic and blank everywhere but Fault Line. If Ben prefers the shifted
   rectangle at the bench, it is a one-line change to `edhaFaultLine` plus a re-pin.
4. **R-32's card string.** The ruling's ANSWERED block quotes the spec as `"swept N · newly Weakened
   M"` and its 🤖 line paraphrases it as "swept 5 · newly 0". The shipped card follows the quoted
   spec and carries the condition label: **"swept 5 · newly Weakened 0"**. Say the word if the
   shorter form was meant.

The name-keyed allowlist is unchanged (still empty) — lint-refs pass 7 passes, and R-78's removal
neither grew nor shrank it. `data/native-vocabulary.json` and lint-refs' vocabulary were left alone
by design, as the ruling specified.

---

## 49. [x] Next-test modifier slot becomes a list (R-15, R-57, R-20) — DONE 2026-09-06, PR #221

**Why:** Ben, verbatim: "that needs to be a list not one slot." Coercive Pressure no longer stacks
with another next-test rider because `flags.nextTestMod` is a single object the second writer
overwrites. R-20 confirms Pattern Recognition's disadvantage should expire at the round change
(current behavior stands); R-57's stale-flag side effect is absorbed by the list's per-entry
expiry.

**What to do:** ENGINE-ONLY (F5). Change `flags.nextTestMod` from one object to an array of
`{source, kind, value, expiry}`. Every writer appends its own entry instead of overwriting; every
reader applies all entries (disadvantage is boolean-OR across entries, dice/flat modifiers sum).
Round-scoped entries expire at the round change (R-20); each consumer clears only its own entry on
use. Migrate a legacy single-object value on read so old saves don't break.

**Done when:** a headless pin shows Coercive Pressure and Probability Net applied to the same
target both take effect and each clears independently without disturbing the other; checklist row
2bI-4 marked 🤖.

**PM:** lane B · model opus · size S · deps none · verify: the two-rider headless pin.
ENGINE-ONLY (F5).

---

## 50. [x] One sanctioned wrapper on the system's cost-consume dialog (R-70) — done 2026-09-06, PR #222 (ENGINE-ONLY, F5; bench-pending)

**Why:** A two-resource activation only charges the FIRST resource unless the player manually
ticks the second box in the system's `showConsumeDialog`. Ben (b): "wrap the dialog so every cost
row starts ticked," accepting this applies to every talent with a second cost.

**What to do:** ENGINE-ONLY (F5). Add ONE wrapper around the cosmere-rpg system's
`showConsumeDialog` that passes `shouldConsume: true` for every cost row before the dialog opens.
Declare it in the engine header as the one sanctioned system-dialog wrapper — an explicit
iron-rule-2a exception by Ben's ruling, not a precedent to copy elsewhere. Pin the option shape
headlessly.

**Done when:** the headless pin shows every cost row pre-ticked; 🤖 checklist row = Reknit Form
charges both Investiture and Focus on a default click.

**PM:** lane B · model opus · size S · deps none · verify: headless pin on the dialog options
object. ENGINE-ONLY (F5).

---

## 51. [x] Puppeteer / Unnerving Approach refund Investiture on a declined offer (R-17) (2026-09-06, PR #230 — **live behaviour bench-pending**)

**Why:** The once-per-round click budget is consistent, but a declined/ignored offer still
charges Investiture. Ben (a): keep the click budget AND refund the Investiture when the offer is
declined or ignored — consistent with R-69 (a cancelled picker already refunds with no stamp).

**What to do:** ENGINE-ONLY (F5). Reuse whichever path R-69's cancelled-picker refund already
uses (charge on the resolving click and don't charge until resolution, or charge on post and
refund on decline/timeout — match R-69's existing mechanism rather than inventing a second one).
Pin headlessly.

**Done when:** a headless pin shows a declined/ignored offer leaves Investiture unchanged while
the round's use is still available; checklist row 2bJ-10 marked 🤖.

**DONE 2026-09-06, PR #230 (ENGINE-ONLY, F5).** R-69's mechanism reused (charge on post, `edhaRefundCost`
on back-out) through ONE path, `edhaOfferDecline`: a Decline button on system-charged offers, a
round-change sweep for ignored ones, the accept click refusing a resolved card. Puppeteer's offer
(watch-posted, costs on the click) is not refundable by construction. Pinned in
`tests/offer-decline-refund.test.js` (four pins, four mutations). ⏳ **Bench-pending** — 🤖 2bJ-10 /
2bJ-10b / 2bJ-10c under `# BENCH — Black`. Detail: the handoff delta.

**PM:** lane B · model opus · size S · deps none · verify: headless pin. ENGINE-ONLY (F5).

---

## 52. [x] Battle Fever's rally stack is spent on the next test, once (R-27) — DONE 2026-09-06, PR #223

**Why:** Ben (a): the card is canon — "gain +1 to your next test" per stack reads as the WHOLE
stack applied to ONE test, then cleared, capped at Rank, also clearing at the start of the owner's
turn.

**What to do:** ENGINE-ONLY (F5). The rally handler's `{count, resetOn: turn}` gains
consume-on-test: the stack (capped at Rank) applies once to the next qualifying test, then is
cleared/decremented to zero rather than persisting.

**Done when:** a headless pin shows three stacked damage events grant +3 to the next test and +0
to the one after; the Red spot-checks checklist row marked 🤖.

**PM:** lane B · model opus · size S · deps none · verify: headless pin (three events → +3 then
+0). ENGINE-ONLY (F5).

---

## 53. [x] Ambush-belief riders must benefit their OWN first strike (R-50) — done 2026-09-06, PR #219 (ENGINE-ONLY, F5; bench-pending)

**Why:** Ben (b), after a full card-by-card walkthrough: the "marks, not benefits" reading
doesn't match the ten carriers' text (Stillback, Wrongwake, The False Spring, Hazewyrm, etc. all
say the FIRST strike comes from ambush/the mirage/the shimmer). The first strike must roll and
apply its own belief test, not just set up the second.

**What to do:** ENGINE-ONLY (F5). In `edha-damage-rider`'s `whenTargetFooled` check (~L974), when
the current target has no ledger entry for this scene, run the belief test synchronously right
there using the engine's `edhaRollDiceSync` family; use the local result to decide the rider on
this strike; then write the ledger and post the GM/player cards asynchronously exactly as
`edhaAmbushBeliefTest` does today. Factor the roll/DC/advantage logic into one shared pure helper
so the sync and async paths cannot drift. The existing `useItem` path stays as fallback for a
strike carrying no rider. Do NOT await inside the `useItem` hook (the known takeover-bug class).
Affected carriers: Stillback ×2, Wrongwake ×2, Keelshadow, The False Spring, Hazewyrm
Adult/Elder, The Doubled ×2 — ten total; the Mistheron's placed-copy seeming already tests at
placement and is unaffected.

**Done when:** headless pins show a first strike against an untested target rolls the test and
applies the rider on a fail; a second strike reads the existing ledger entry and rolls no second
test; the Mistheron path is unchanged; 🤖 checklist row = Stillback's Ambush Bite.

**PM:** lane B · model opus · size M · deps none · verify: 3 headless pins (first-strike roll,
second-strike ledger read, Mistheron unaffected). ENGINE-ONLY (F5).

---

## 54. [x] Widen dispel to item-owned transferred effects and Omen ledger entries (R-73, R-35) — done 2026-09-06, PR #224 (ENGINE-ONLY, F5; bench-pending)

**Why:** A dispel currently cannot remove a passive living on a talent or trait. Ben vetoed the
narrow §I default and specified the safe widening (b): the `edha-pick` menu should offer
item-owned transferred effects as a temporary DISABLE, never a delete. R-35 (a) folds in: the same
widened menu should also offer the target's Omen ledger entries as a "dispel Omen" button.

**What to do:** ENGINE-ONLY (F5). In the `edha-pick source: "effects"` menu, also list item-owned
transferred effects (Hardy, Collected, Surefooted, Cinder Coat, Predictive Ward's braced, etc.),
offered as `disabled: true` on the effect — never delete; the existing delete path stays guarded
to actor-level effects only. Separately, add the target's Omen ledger entries to the same menu as
a "dispel Omen" button that clears the marker and its ledger entry. Pin both branches headlessly.

**Done when:** headless pins cover (1) disabling an item-owned effect leaves the source item's
copy intact, and (2) dispelling an Omen entry clears both the marker and the ledger row; 🤖 rows =
Unravel Everything disabling a target's Hardy with the talent copy intact, and the Chaos residuals
row.

**PM:** lane B · model opus · size S · deps none · verify: 2 headless pins. ENGINE-ONLY (F5).

---

## 55. [x] One senses rule for PCs and adversaries alike (R-56) — DONE 2026-09-06, PR #240 (REBUILD + world bulk sync, bench-pending)

**Why:** Ben (a): adversary sheets AND token sight should use the same Edha AWA table as PCs, not
the flat 10 ft pack-token default or the raw cosmere ladder. This unblocks the "Adversary tokens
see like PCs" checklist row (AWA 0 → 10 ft) and its ⚑ feel sibling.

**What to do:** ENGINE + BUILD/DATA. Drop the `type !== 'character'` guard for senses in
`edhaDeriveSheetStats` and both `preCreateActor` token-default hooks (about three call sites); the
build should emit `sight = table(AWA)` for adversaries too, so the flat 10 ft pack-token default
goes away and the pack sheet and token agree. Author ONE adversary block with an explicit `senses`
override so the bespoke escape hatch stays testable — pick the subject and say why in the PR.

**Done when:** the guard is gone at all three sites; the chosen adversary's explicit override
still reads correctly; packs rebuild clean.

**PM:** lane B · model opus · size M · deps none · verify: pack rebuild (Ben's deploy) + a world
bulk sync (authorised by this ruling). REBUILD + world bulk sync.

**Shipped 2026-09-06 (PR #240):** the guard is gone at `edhaDeriveSheetStats` (senses now run
for every actor type; HP/Speed stay PC-only below a later guard), the `preCreateActor` token-default
hook (adversaries get sight = table(AWA) too, without the PC's HOVER displayName), and the AWA
`updateActor` watcher; the `ready` refresh sweep resets every actor, not just characters, so a world
adversary prepared before the wrapper installs shows the new number at load. The build reads
`advSensesRangeFt(adv)` (`scripts/foundry-build-parts.js`, table pinned equal to the engine's
`edhaSensesRangeFtFromAwa` for AWA 0..7) instead of a flat 10. The override block is **Briar-Gone
Grove, `senses: 30`** — a rooted grove-heart has no eyes and perceives through its own soil, so its
reach is the arena. Proof: seven one-line reversions each fail a pin in
`tests/adversary-senses.test.js` / `derived-stats` / `prepare-refresh-reset`; scratch pack read-back
before→after: 52 adversaries, **1 changed (the Grove: token 10→30, sheet override 30), 51 unchanged
at 10** — the pack number was already 10 at AWA 0, so what the rebuild changes is the Grove and what
the ENGINE changes is every world adversary's SHEET (5→10); the bulk sync then pushes token 10 onto
placed tokens that agree with their actor for the first time.

---

## 56. [x] Melee mutation riders follow their own card's graze wording (R-14) — DONE 2026-09-06, PR #242 (ENGINE F5 + deity pack REBUILD + ⟳ Sync; Venom Glands is the one behaviour change — hit only; Bone Spurs and Apex vital stay on for grazes, now explicitly)

**Why:** Ben (c): "follow each rider's own card" — "on a hit" riders should fire on a hit only;
"when you deal damage" / "on a hit or graze" riders should also fire on a graze. Today all riders
share one trigger regardless of wording.

**What to do:** ENGINE + AUTHORED. Audit every melee mutation rider's card text and set a
per-rule `onGraze` dial (or equivalent) that the handler reads — iron rule 2b: the dial lives on
the rule, not a name-keyed branch in the handler. Rebuild + Sync only for rules whose authored
data actually changes.

**Done when:** a headless pin per rider shows a nat-1 graze applying only to `onGraze: true`
riders; 🤖 row = a nat-1 graze test against one hit-only rider (no effect) and one damage rider
(applies).

**PM:** lane B · model opus · size M · deps none · verify: per-rider headless pins (at least one
hit-only, one damage rider). REBUILD + ⟳ Sync if any authored rule changes; the engine change
itself is F5.

---

## 57. [x] Adversary data batch: Combat Training, Fen-Heart size, charge distances, hidden hook markers, one bespoke cost (R-29, R-40, R-46, R-47, R-74) — DONE 2026-09-06, PR #226 (REBUILD; R-48 default (a) applied to the Cragdrake Adult, still open for Ben's veto)

**Why:** Five adversary-data rulings land on the same file and rebuild:
- R-29 (a): Combat Training (Stonebound Captain) is MISS → GRAZE once per round, no Focus cost —
  the canon wording; its ability description is currently empty.
- R-40 (a): the Gone-to-Weir Fen-Heart is 3×3 (Huge).
- R-46 (a): Cragdrake Whelp Pack's Reckless Advance carries full-speed `distanceFt: 25`, stated on
  the card; apply the same fix to R-48 (Explosive Leap) if still open.
- R-47 (a): every `NO NAMEABLE HOOK:` engineering marker must be hidden from the player-facing
  card (a GM-only note field or an HTML comment), everywhere it appears.
- R-74 (a): author one `costs:` line onto a single adversary ability — default to the Stalker's
  Fade unless a better fit turns up.

**What to do:** Edit `data/adversaries.json` (+ baked AEs if any). Write Combat Training's empty
description and fix the cheatsheet sentence; wire it per lint pass 5. Add the Fen-Heart's 3×3 note
to its biography + placement guidance. Set `distanceFt: 25` on Reckless Advance's `edha-move
bySize` config and its card text (and Explosive Leap's, if open). Move every `NO NAMEABLE HOOK:`
marker to a GM-only/hidden location while lint pass 5 still recognizes it. Add the `costs:` line
to the chosen ability. Rebuild the adversaries pack.

**Done when:** lint pass 5 stays green; the adversary-wiring checklist row for Combat Training
retires on evidence; all five items reflected in the rebuilt pack.

**PM:** lane R · model sonnet · size M · deps none · verify: lint pass 5 green + pack rebuild.
REBUILD (Ben's deploy).

---

## 58. [x] Talent data batch: Volatile Strike rider scope, Withering Touch duration prose, The Final Study re-key (R-23, R-28, TODO 41) — DONE 2026-09-06, PR #227

**Why:** Three small authored-data fixes, all Ben-approved on 2026-09-06:
- R-23 (a): Volatile Strike should be a true rider on ANY melee hit (`whenDealer: "any"`), not
  scoped to a specific dealer.
- R-28 (a): Withering Touch lasts to the END of your next turn (engine already correct — only the
  prose is wrong).
- TODO 41 (Ben's OK 2026-09-06, folded in here): re-key The Final Study's stale docId in
  `data/authored/deity-knowledge.json` to the current seed.

**What to do:** `data/authored/leyline-red.json` — set Volatile Strike's rider field to
`whenDealer: "any"`. `data/authored/deity-death.json`'s Withering Touch entry + `data/domain.json`'s
source prose — both say "end of your next turn"; engine and cards unchanged.
`data/authored/deity-knowledge.json` — rewrite The Final Study's `docId` to the current seed.
Rebuild + Sync.

**Done when:** `node scripts/foundry-build.js all` prints zero "matched by name" lines and packs
hash identical before/after for the re-key; 🤖 row = the Red row (a sword hit offers Volatile
Strike; standalone use self-offers harmlessly); checklist row 2bW-1's duration clause retires.

**PM:** lane R · model sonnet · size S · deps none · verify: build's name-match count 1 → 0 + pack
parity for the re-key. REBUILD + ⟳ Sync.

---

## 59. [x] Fold `system.damage.formula` into plain dice at build time (R-71) — DONE 2026-09-06, PR #234

**Why:** The system's own item-damage card prints the unfolded authored formula string instead of
resolved dice. Ben (a): fold it at BUILD time, the same fold `edhaRollFormula` already does at
runtime (R-65).

**What to do:** TOOLING + DATA. In `foundry-build.js`, fold `system.damage.formula` into plain
dice for every talent the system rolls itself, at build time.

**Done when:** a build-report diff shows only formula strings changed (no other build output
moved); bench visual check = Verdict's system card reads its resolved dice (e.g. `2d8 + 5`) like
its engine-rolled card.

**PM:** lane R · model sonnet · size S · deps none · verify: build-report diff (formula-only).
REBUILD (Ben's deploy).

---

## 60. [x] Build guard: reject any `min ≠ max` consume entry (R-22) — done 2026-09-06, PR #225 (TOOLING-only)

**Why:** `edhaConsumeList` refunds `value.min`, so a talent or adversary ability whose cost entry
has `min ≠ max` can silently under-refund. Ben (a): close the door with a build guard rather than
an engine change.

**What to do:** TOOLING-only. Add a check to `lint-refs.js` (or `validate.js`) that fails the
build if any talent or adversary ability ships a `consume` entry with `min ≠ max`.

**Done when:** mutation-verified — authoring a `min ≠ max` cost in a scratch copy of the data
makes the gate fail; no engine change.

**PM:** lane R · model sonnet · size S · deps none · verify: mutation test (scratch min≠max cost
→ gate fails). TOOLING-only.

---

## 61. [x] Fix Goldenport / Corvaine map polygons so four cities resolve to the right nation (R-42) — done 2026-09-06, PR #256 (DATA + MODULE ASSET: sync push / deploy .bat, no pack rebuild; bench run 41 re-tests the picker row)

**Why:** `lint_map.py` reports four WARNs: city-04/11/14/17 fall outside Goldenport's polygon, and
city-31 doesn't resolve to Corvaine even though ruling 154 says the border there IS the river.
Ben (a): fix the polygons, not the city tags.

**What to do:** Edit `source-materials/maps/thyrcross.map.json` — give Goldenport its
coastal/island lobes so city-04/11/14/17 fall inside it; move Corvaine's edge to the river bank so
city-31 resolves to Corvaine. Regenerate `thyrcross-nations.json`.

**Done when:** `lint_map.py`'s four WARNs go to zero; the "Redrawn polygons hit the right nations"
checklist row re-tests (🤖).

**PM:** lane R · model sonnet or opus · size S · deps none · verify: `lint_map.py` WARN count
4 → 0. Map-data (part of `gates.js --ci`).

---

## 62. [ ] Edge-to-edge range measurement for sized tokens (R-52 (c)(ii))

**Why:** R-52's slack fix (item 47) only patches the ally-drop cue's 5 ft gate; Ben also asked for
edge-to-edge measurement as its own item, because the Crownox Ring's "an adjacent ox" stays false
under slack alone for a Large+ token.

**What to do:** ENGINE-ONLY. Change range measurement to edge-to-edge for sized tokens, and sweep
every `rangeFt` gate in the engine for the same assumption (not just the ally-drop cue item 47
touches).

**Done when:** headless pins cover the four measured cases from the ruling (including the Crownox
Ring's adjacency check); 🤖 row = checklist W29 §2.

**PM:** lane B · model opus · size M · deps 47 · verify: 4 headless pins on the measured cases.
ENGINE-ONLY (F5). **Reframe before dispatch (item 47, 2026-09-06):** the ruling's own example — the
Crownox Ring's adjacent ox at 7.5 ft — already passes under the inclusive half-square slack, so the
motivating failure is gone; what is left is a Huge owner's "adjacent" and the `rangeFt` sweep. Let
item 47's W29 §2 bench row measure first.

**Narrowed 2026-09-07 (item 79, R-52's dashboard confirmation):** Ben, verbatim, *"I'm fine with
whatever fix you can find for this. I think increasing slack would work, or editing the cue."* The
+2.5 ft slack (item 47) IS that fix and is already shipped. This item stays open, but only as a
contingency: dispatch it ONLY if bench run 42's W29 §2 measurement row finds a gap the shipped
slack still misses. Not closed.

---

## 63. [x] Rallying Shout's reminder prints only for a downed ally — a target-condition dial on `edha-note` (R-25 — 2026-09-06, PR #239; REBUILD heroic + ⟳ Sync, bench-pending)

**Done 2026-09-06:** `edha-note` gained ONE generic field, `whenTarget` (blank | `downed`), read by the
pure gate `edhaNoteTargetGate(whenTarget, target)` on the R-64 victim chain; `RouseRallying000` carries
`whenTarget: "downed"`. Pinned in `tests/note-target-gate.test.js` (32 HP → no card; 0 HP → card;
Unconscious above 0 → card; no field → card as before; each failing under a one-line reversion). Pack
parity: 204 heroic documents, exactly 1 differs (Rousing Presence, that rule's `whenTarget` + description).
Bench re-test = checklist **2bM-6b** (🤖).

**Why:** Ben answered R-25 (c) on 2026-09-06: print ONLY for an ally at 0 HP or carrying
Unconscious, the two cases the card names. Item 47 (PR #215) stopped this one instead of shipping
it: since the iron-rule-2b migration the reminder is an authored `edha-note` rule on **Rousing
Presence** (`data/authored/heroic-envoy.json`, rule `RouseRallying000`), and `edha-note` has no
target-condition field. Gating it needs a generic dial on the handler PLUS the authored value on
that rule — a name-keyed branch is what rule 2b forbids, and a dial with no consumer is exactly the
R-74 / R-76 complaint. So it is a REBUILD-class item, not engine-only.

**What to do:** add ONE generic field to `edha-note` (e.g. `whenTarget: "downed"` — target at 0 HP
or carrying Unconscious; absent = today's unconditional behaviour) read by the handler; set it on
`RouseRallying000` in `data/authored/heroic-envoy.json`; `ENGINE_INDEX.md` gains the field; a
headless pin (ally at 32 HP → no card; at 0 → card; Unconscious above 0 → card; a rule WITHOUT the
field → card as before); the checklist's 2bM-6 row becomes the 🤖 re-test.

**Done when:** the pin passes and fails under a one-line reversion; the authored rule carries the
field; packs rebuild clean; 2bM-6 is 🤖 with the three cases.

**PM:** lane B · model opus · size S · deps 46 · verify: mutation pin + pack build. ENGINE + AUTHORED
→ REBUILD + ⟳ Sync (Ben's deploy). Found by item 47.

---

## 64. [x] `foundry-build.js` still mints `edha-aoe-template` rules — a type the engine retired (R-78) — DONE 2026-09-06, PR #238 (TOOLING-only; packs content-hash identical)

**Why:** item 48 (PR #217, 2026-09-06) retired the `edha-aoe-template` handler on Ben's R-78 (a) —
zero consumers in shipped data. But `scripts/foundry-build.js`'s `aoeRule()` still GENERATES an
`edha-aoe-template` rule for any talent with `TALENT_TARGETING[…].area` and no `.burst`. Today that is
only **Lay Foundation**, whose authored overlay supplies an `edha-zone` rule that REPLACES the
generated events — which is why the `data/` sweeps find zero and the CI pack build stays green.
Delete that authored `events` block and the next build mints a rule nothing can execute.

**What to do:** retire `aoeRule()` (or route the `.area`-without-`.burst` case to an `edha-burst`
rule, if any talent should still get one — check `TALENT_TARGETING` for every `.area` entry and
say which); pin it with a build-report diff showing the six packs byte-identical before/after
(the only generated rule it could have emitted is masked by the overlay today); a lint or build
guard that fails if the build ever emits a rule type the engine does not register (the engine's
own `registerItemEventHandlerType` calls are the record — `lint-refs.js` pass 9 already parses
them, so this may be one assertion added there).

**Done when:** `grep -c aoeRule scripts/foundry-build.js` = 0 (or the routed form is tested);
packs byte-identical; the unregistered-type guard fails under a mutation that re-adds the
generator.

**PM:** lane R · model sonnet · size S · deps 48 ✓ · verify: build-report parity + the guard's
mutation. TOOLING-only (no rebuild — the packs do not change). Found by item 48.

---

## 65. [x] 34c — the 44 later-bestiary attack items still `kind: action` (the rest of the fleet weapon migration) — DONE 2026-09-06, PR #232 (REBUILD; bench-pending)

**Why:** item 34a (PR #220, 2026-09-06) migrated the 11 attack items across the 13 ORIGINAL
statblocks to `kind: "weapon"` and put `edhaRuleBearer` on both actor-wide rule loops. Its worker
measured the rest: the **39 bestiary statblocks statted after 07-18** (Reedling → The Cull-Alpha)
carry **44 attack items still `kind: action`** — same model, same proof shape, not touched because
34a's brief scoped it to the 11-of-13 table. Until they migrate, those blocks' attacks skip the
system's native target + test-defense flow that 34a gave the originals, and any rider authored on
them is harvested only because it sits on an action-typed item the loops still read.

**What to do:** the 34a recipe over the 44: `kind: "weapon"` (natural weapons `alwaysEquipped:
true`; maneuvers, reactions and any Frost-Lance-shaped ability stay actions — apply Ben's 07-18
rulings by analogy and list every judgment call in the PR body), attack numbers preserved (same
skill test + modifier), parity over the embedded docs with `_stats` stripped (N changed, 0 missing,
0 roll differences — the 34a comparison script is the shape: `tmp/parity-34a.js` was gitignored,
so re-derive it), lint pass 5 green, `validate-adversaries.js` 0 issues on a scratch build with
`EDHA_DATA` pinned to the worktree. Extend 34a's `# BENCH — Fleet weapon migration` section with
🤖 rows for the new blocks' weapon-borne riders (if any) and one render/roll-parity row.

**Done when:** `grep -c '"kind": "action"' data/adversaries.json` counts no attack items (every
remaining `action` is a maneuver / reaction / utility, listed by name in the PR); parity table in
the PR; packs rebuild + validate clean; the bench rows exist.

**PM:** lane B · model `fable-worker` (medium) · size M · deps 34a ✓ (#220) · verify: parity table +
scratch build + validator. REBUILD + ⟳ Sync (Ben's deploy). Found by item 34a. **Landed:** 36 of
the 44 flipped (35 natural weapons `alwaysEquipped`, the Construct-Smith's Forge-Hammer as registry
`hammer`); the 8 that stay actions by 34a's analogy are the to-hit-only grabs (Seize and Roll, Drag
Under), the 2-action maneuvers (The Stoop, Trampling Charge), the burst attack (Wingstorm) and the
three Focus-costed Searing Bolts (Frost Lance's shape). Note: `kind` is never written as `"action"`
in the data (it is the default), so the grep in "Done when" is 0 both before and after — the real
count is items with `attack` and no `kind: weapon`, 44 → 8. Parity: 336 embedded docs, 39 changed
(36 + item 67's 3), 0 missing, 0 roll differences; validator 0 issues; 11 🤖 rows.

---

## 66. [x] A negative next-test rider on the DAMAGE path is joined as `base + -1d6` — 2026-09-06, PR #229

**Why:** item 49 (PR #221) made `edhaWrapRollDamage` fold the taken next-test riders onto
the damage formula with a raw `${f} + ${m.formula}` reduce, so a rider whose formula starts
with a minus (Probability Net's `-1d6` as an `either` rider) built `2d6 + -1d6`, which
Foundry's parser dislikes. The d20 path (`edhaNextTestPreRoll`) already turned a leading
minus into an explicit subtraction with the source label (`0 - 1d6[label]`). Item 49 found
this and left it as pre-existing.

**What to do:** ONE pure formula-join helper (leading minus → explicit subtraction, source
label kept) that BOTH paths call; positive riders must build a byte-identical formula to
before. Nothing else changes. Iron rule 2b: no name-keyed branch; the allowlist may only shrink.

**Done when:** headless pins — (1) a negative damage rider joins as `base - 1d6[label]`
(fails under a one-line reversion to the raw concat); (2) a positive rider's built formula
is byte-identical to the pre-change string; (3) the d20 path still produces its existing
strings for `-1d6` and `+1d6`; (4) a source scan pins exactly one join helper and that both
paths call it. One 🤖 checklist row beside 2bI-4 plus a positive-rider negative control.

**PM:** lane B · model fable-worker · size S · deps 49 ✓ · verify: mutation. ENGINE-ONLY (F5).
Found by item 49. **Landed:** `edhaJoinRiderTerm` (SHARED CORE, beside `edhaTidyFormula`);
`tests/negative-rider-join.test.js` (7 pins); checklist 2bI-4d / 2bI-4e.

---

## 67. [x] The R-48 family: three more run-19 charge distances still `bySize` at rank 2 against rank-3 cards (R-81) — DONE 2026-09-06, PR #232 (rode item 65's rebuild; default (a) applied, open for Ben's veto)

**Why:** R-46 (a) and R-48's applied default replaced `bySize` with an explicit `distanceFt` on the
Cragdrake Whelp Pack's Reckless Advance (25 ft) and the Cragdrake Adult's Explosive Leap (20 ft)
in item 57 (PR #226, 2026-09-06). Its worker found the same shape, untouched per its brief, on
three more blocks from the run-19 table: the **Brandram's Shockwave Slam** (`bySize: true` beside
a dead `distanceFt: 5`), the **Brandram's Reckless Advance**, and the **Tussock-Sow's terrain
square** — all `bySize` at role rank 2 while their cards print the rank-3 numbers, so the engine
moves less than the card promises. Board ruling **R-81** holds the choice; the PM's default is (a).

**What to do (default (a)):** for each of the three, `bySize: false` + `distanceFt` = the card's
own number, the card text stating it (the R-46 shape, `data/adversaries.json`); (b) would instead
fix the three cards to the rank-2 numbers — do (b) only if Ben says so on the board before
dispatch. Scratch build with `EDHA_DATA` pinned to the worktree, `validate-adversaries.js` 0
issues, a LevelDB read-back diff naming exactly the three abilities; three 🤖 rows (each charge
carries its card's distance). May ride item 65's adversaries rebuild if that dispatches first.

**Done when:** the three rules carry an explicit distance matching their cards, the build diff
names only them, the rows exist. REBUILD + ⟳ Sync (Ben's deploy).

**PM:** lane R · model `fable-worker` (medium) · size S · deps 57 ✓ (#226), R-81 default · verify:
build read-back diff + validator. REBUILD. Found by item 57. **Landed (a):** Shockwave Slam
`{bySize: false, distanceFt: 10}` (edha-push), Reckless Advance `{bySize: false, distanceFt: 10}`
(edha-move), Sudden Growth `{sizeByRank: false, sizeFt: 10}` (edha-burst — the terrain square's
analogue of `bySize`); each card now bolds its number. The read-back diff names exactly these three
docs beyond item 65's 36. Left alone, reported: the Sow's and the Grove's Sudden Growth still place
within Attunement Range by rank (30 / 60 ft) while both cards say "within 10 ft".

---

## 68. [x] Fix pass 8 — an `edha-focus` `resource: hea` rule announces the UNGATED heal amount — DONE 2026-09-06 (ENGINE-ONLY, F5)

**Why:** bench run 39 (PR #228, 2026-09-06), driving R-10's family through a real Withering Touch
mark, found that an `edha-focus` rule with `resource: hea` writes the GATED amount correctly (HP
4 → 4, the No-Healing gate card printed) and then announces the UNGATED one: *"⚕️ Field
Medicine: B39 Victim heals **5**."* when it healed 0. The HP is right; the card lies. Blast radius
is every `edha-focus` `hea` rule — **Field Medicine** is the shipped one — and the Healing-Halved
case misreports the same way (announces the full amount, delivers half). A card is what the table
reads to decide what happened, so this is the same class as R-36's mislabelled Temp HP.

**What to do:** in the `edha-focus` executor's `hea` branch (grep `type: "edha-focus"` and its
`resource === "hea"` arm in `module-src/scripts/register-skills.js`), announce what
`edhaHealCutGate` actually delivered — the returned amount, not `n`; when the gate delivered 0,
say so ("healing blocked — <mark>") rather than printing a number. Audit the neighbouring
announcers (the `inv` / `foc` arms, `edhaCrossHeal`'s card) for the same shape. Headless pins:
gated to 0 → the card names 0 / blocked; halved → the halved number; ungated → unchanged text;
each shown failing under a one-line reversion. 🤖 re-test = bench 39's defect row (Field Medicine
through a Withering mark reads the delivered number).

**Done when:** the pins pass and fail under reversion; the 🤖 row exists; the delta names the
card text change. ENGINE-ONLY (F5).

**Done 2026-09-06 (ENGINE-ONLY, F5):** the root cause was the CONTRACT, not the talent —
`edhaCrossHeal` gates its write and **returned nothing**, so all **seven** heal announcers built
their sentence from the only number they had (the roll) and every one of them misreports a blocked
heal *and* a halved one. `edhaCrossHeal` now returns the delivered amount (owned and relayed legs
alike; the drop-to-1 bypass still reports its full amount, and **no new `edhaHealCutGate` call
site** — R-10's family count of 2 stands), and **`edhaHealLine(who, requested, delivered, phrase)`**
is the one place that decides whether a number may be printed: `phrase()` only ever sees a number
that landed, and a zeroed heal names the mark instead. Wired at H10's `hea` arm, Interposing Shield,
Shared Burden, the triggered-effect heal, the Life regen tick, the regrowth tick and Lifeline; the
pulse sweep now counts who was **healed** and totals what **landed**. The audit the item asked for
found the same drift one arm over — `inv` announced the rolled `n` against a clamped write, now the
delta (`foc` was already honest, and is the precedent). Pins in
`tests/heal-announce-delivered.test.js` drive the **shipped** executor (native event system
registered against a recording api stub) and reproduce bench 39's take exactly; both mutations fail
(card from `n` → 3 cases; bare `return` → 7 cases). Four 🤖 re-test rows filed.
**Found in passing, NOT fixed:** three heal paths still write `hea` without the gate
(`edha-regen`, the decay lifesteal, `edhaBurstDetonate`'s hits) — their cards are honest, but
closing the gap changes live HP and needs an R-10-adjacent ruling plus a declared third gate call.
See the handoff delta.

**PM:** lane B · model opus (`test-pass-fixes`) · size S · deps bench 39 ✓ · verify: mutation pins.
ENGINE-ONLY (F5). Found by bench run 39. Dispatched 20:15 in a worktree.

---

## 69. [x] R-71's real fix — fold a talent's damage formula at ROLL time when the system rolls it (the build cannot) (2026-09-06, PR #237)

**Why:** item 59 (PR #234, 2026-09-06) built R-71 (a) exactly as ruled — fold `system.damage.formula`
into plain dice at build time — and proved it is a **no-op on every current formula**: all 51
`data/talent-rolls.json` entries and every authored overlay are rank / tier-scaled
(`(@tier)d(2 * @skills.blue.rank + 2)` and kin), which cannot fold without an actor to substitute
`@tier` / `@skills.<color>.rank`. Real-data parity showed 0 formula diffs; only a synthetic flat
formula folds. So the thing Ben actually asked for — *Verdict's system card reads `2d8 + 5` like
its engine-rolled card* — still does not happen: the cosmere-rpg system rolls a talent's own
damage straight off the field and prints the raw parenthetical. The fold has to happen at ROLL
time, with the actor in hand.

**What to do:** in the engine's existing wrap of the system's damage roll (`edhaWrapRollDamage` —
it already rewrites `overrideFormula` for next-test riders, item 49 / 66), substitute the actor's
roll data into `system.damage.formula` (`Roll.replaceFormulaData(formula, actor.getRollData(),
{ missing: "0" })`) and fold it with `edhaFoldDieMath` before the system builds its roll, so the
chat card prints plain dice; keep item 49's rider join on top of the folded base. Iron rule 2a:
no second wrapper — extend the one that exists. Headless pins: a rank-scaled formula on a rank-2
actor folds to plain dice on the wrapped roll; a plain formula is byte-identical; a rider still
joins onto the folded base; each shown failing under a one-line reversion. 🤖 = the item-59
Verdict row (its system card reads `2d8 + 5`).

**Done when:** the pins pass and fail under reversion; the Verdict row is the re-test; R-71's
SHIPPED note says which half lives where (build guard = item 59, runtime fold = this item).
ENGINE-ONLY (F5).

**PM:** lane B · model `fable-worker` (medium) · size S · deps 59 ✓ (#234) · verify: mutation
pins. ENGINE-ONLY (F5). Found by item 59.

---

## 70. [x] Three `hea` writers still bypass the heal-cut gate — a withered creature is healed by Mending Aura (R-83) (2026-09-08, PR #308)

**Why:** fix pass 8 (item 68, PR #241, 2026-09-06) audited every heal announcer and found the
same drift one layer down: `ENGINE_INDEX.md` says every `hea` write outside `applyDamage` must pass
`edhaHealCutGate`, and **three do not** — `edha-regen`'s turn-end write, the decay lifesteal
heal-back, and `edhaBurstDetonate`'s heal hits. Item 68 left them (their CARDS are honest, and the
item was about announcing), but the HP still lands: a creature carrying a No-Healing mark is
healed by Mending Aura and by regen, against the card's promise. Closing the gap **changes live HP
at the table**, so it is board ruling **R-83** (waiting) before any dispatch.

**What to do (on R-83 (a)):** gate each of the three at its EMITTER, never in
`edhaApplyBurstResults` (Raise Dead's stabilising 1 HP rides that path — R-10's family, which
must stay ungated); `tests/drop-to-one-family.test.js` counts the gate's call sites (2 today) —
raise the count with a one-line declaration per new site; headless pins per writer (withered
target → 0 lands and the card names the mark; halved → half; unmarked unchanged), each shown
failing under a one-line reversion; three 🤖 rows (Mending Aura, regen tick, lifesteal heal-back
on a withered target). On R-83 (b): no engine change — `ENGINE_INDEX`'s rule is reworded to list
the three as deliberately ungated, and this item closes as docs.

**Done when:** the ruling is answered; on (a) the pins pass and fail under reversion, the family
count is declared, the rows exist; on (b) the index says so. ENGINE-ONLY (F5).

**PM:** lane B · model `fable-worker` (medium) · size S · deps **R-83** · verify: mutation pins +
the family count. ENGINE-ONLY (F5). Found by fix pass 8.

**Note 2026-09-07 (item 79):** R-83 is still WAITING — Ben asked for good examples before deciding
(*"I'm not sure what this means and will want the pm to give me good examples when we get here in
chat"*); the examples were given in chat and recorded in the ruling
(`EDHA_RULINGS.md`). Still blocked on Ben's (a)/(b) call.

**DONE 2026-09-08 (PR #308, ENGINE-ONLY → F5).** R-83 answered **(a)** (Ben, dashboard 2026-09-07
17:11, verbatim *"a"*). All three gate at their EMITTERS — the `edha-regen` turn-end tick
(`07-edha-owner-list.js`), the decay lifesteal heal-back (`45-death.js`), `edhaBurstDetonate`'s
per-target heal (`39-burst-execution-the-gm-socket-relay.js`) — and each card is built from what the
gate DELIVERED via `edhaHealLine`, so a blocked heal names the mark instead of printing a number.
`edhaApplyBurstResults` stays ungated and `tests/drop-to-one-family.test.js` now asserts that too
(R-10 (3), Raise Dead's stabilising 1 HP); its gate-call count went **2 → 5** with one declared line
per site. Nine headless pins in `tests/heal-cut-emitters.test.js` (per writer: withered → 0 + the
card names the mark, halved → half, unmarked → unchanged), each shown failing under a one-line
reversion of its gate call; gates 11/11. Bench rows **70-1 … 70-4** are the live confirmation, and
R-83 stays open in `EDHA_RULINGS.md` until they pass.

---

## 71. [x] Registry leftovers from item 24 — a README row, an executor-less handler, six unused types, a stale console line, a loosened test slice (2026-09-06, PR #257)

**Why:** item 24 (PR #244, 2026-09-06) turned the 102 `api.register*Type` calls into two tables
and, in passing, found five small things it was told not to fix:
- `scripts/lib/fold-die-math.js` (item 59) has no `scripts/README.md` row — `check-scripts-readme.js`
  reports it on `main` (it is not a gate).
- `edha-illusion-upkeep` registers with NO executor (config-only). If the system ever executed it,
  `Handler.execute` would throw; the registry test tolerates "absent". Either give it a no-op
  executor that says so, or document why it is only ever read elsewhere.
- Six registered handler types have no authored talent user: `edha-pick-expertises`, `edha-regen`,
  `edha-ambush-belief`, `edha-pack-advantage`, `edha-dark-veil`, `edha-thorns`. Iron rule 2b's
  corollary applies (an engine path with no consumer is a named complaint — R-74 / R-76 / R-78):
  each is a generator-emitted type (say which generator), a rule-in-waiting, or dead.
- The registration `console.log` still lists the retired `aoe-template` (item 48 / R-78).
- `tests/note-target-gate.test.js` slices to the next `api.registerItemEventHandlerType(` marker;
  that marker no longer follows a row, so it falls back to its 8000-char window (still passes,
  less precise) — slice on the next table row instead.

**What to do:** one small PR: the README row; the console line; the test slice; a one-line
disposition per unused type (generator / waiting / dead, with the grep that proves it) and for the
executor question, written into `ENGINE_INDEX.md`. Deleting a type is a behaviour change and needs
a ruling — file it, do not delete.

**Done when:** `node scripts/check-scripts-readme.js` is clean, the console line matches the table,
the test slices on a table row, and the six types + the executor each carry a one-line disposition
in `ENGINE_INDEX.md`. ENGINE-ONLY (F5) for the console line; the rest is TOOLING / DOCS.

**PM:** lane R · model sonnet · size S · deps #24 ✓ · verify: `check-scripts-readme.js` clean + the
test still fails under its own mutation. Found by item 24.

---

## 72. [x] Fix pass 9 — bench run 40's defects: the prompt-pick `once` budget never bites, Ambush Bite's double flavor, R-85 and R-84 as defaults *(done 2026-09-06, PR #253 — ENGINE-ONLY, F5)*

**Why:** bench run 40 (2026-09-06, PR #245) drove every engine-only merge of the evening on the
hash-verified `0ea0741a…` deploy and retired 27 rows, but root-caused one real defect and one
cosmetic, and measured two behaviours that needed a ruling:
- ❌ **An `edha-prompt-pick` `once` budget NEVER bites.** `edhaPromptPickClick` marks with
  `edhaCoordOPRMark(owner, item.uuid, "_pick")`, which writes `setFlag("edha-content", "coordRound",
  {[item.uuid]: {_pick: round}})` — Foundry EXPANDS dotted keys, so the document stores
  `coordRound.Actor.<id>.Item.<id>._pick` while `edhaCoordOPRAllowed` reads the flat key and always
  gets `undefined`. Measured: three Unnerving Approach picks in one round with the round's mark
  present. Blast radius: every `edha-prompt-pick` rule carrying `once`; the other `edhaCoordOPR*`
  callers pass dot-free names / ids, which is why it hid. Fix in the primitive (key-safe both sides).
- ❌ **Cosmetic:** Ambush Bite's damage rider prints its flavor twice —
  `1d10 + 3 + (1d6[Ambush Bite])[Ambush Bite] + 0`. Math right, formula bar wrong.
- **R-85 (applied default, vetoable):** `expireEndOfRound` stamps `edhaCombatRoundOf(owner)`; a
  granter who is not a combatant writes `round: null`, which never expires. Fall back to the
  BEARER's combat.
- **R-84 (applied default, vetoable):** Unnerving Approach's `emptyNote` branch (no valid ally in
  range) still charges its Investiture with no refund and no Decline. Refund through the gate R-17
  already computes (`edhaOfferRefundable`), and say so on the card.

**Done when:** each fix carries a headless pin shown failing under a one-line reversion; the two
bench 🤖 rows say "fixed in fix pass 9, re-test"; R-84 / R-85 rows re-test at bench 41; every
`edhaCoordOPR*` caller and every `once` prompt-pick rule audited. ENGINE-ONLY (F5).

**PM:** lane B · model opus (`test-pass-fixes`) · size M · deps #245 (the report) · verify: the
pins + bench run 41. Dispatched 2026-09-06 21:35. ⚠️ The bench filed its rulings as R-82 / R-83;
those numbers were already taken (item 56's graze dial; the heal-cut gate) — renumbered R-84 / R-85
in #245 before merge.

**DONE 2026-09-06, PR #253 (ENGINE-ONLY → F5).** All four, 87 lines of engine source across four
split sources; **no new primitive** — each fix reuses one the engine already had. (1) `coordRound`
was the **third** dotted-flag-key ledger and the one `ENGINE_INDEX`'s own section had not swept, so
both sides now escape through the existing `edhaFlagKey`, plus a one-time `getProperty` fallback for
documents stamped in the expanded shape; blast radius was exactly three `once: "round"` rules
(Unnerving Approach, its twin, Puppeteer). (2) The double flavor is **Foundry's**, not ours —
`ParentheticalTerm` propagates its flavor inward on evaluation and re-derives `term = roll.formula`
on the chat round-trip — and the parentheses must STAY (the graze clone keeps only dice/operator/pool
terms, so a bare rider die would ride grazes), so `edhaTidyFormula` collapses the duplicate in the
display layer; family-wide across every `edha-damage-rider`. (3) R-85 and (4) R-84 applied as their
recommended defaults, with R-84's non-refundable card line reading "no cost was spent" rather than
the ruling's "the cost was spent" (with R-17's gate, not-refundable means nothing was charged).
12 pins, each shown failing under its own one-line reversion; 11 gates PASS; four 🤖 re-test rows
for bench run 41; two vetoes outstanding in `EDHA_RULINGS.md`.

---

## 73. [x] Docs sweep — CLAUDE.md and ENGINE_INDEX still describe the pre-migration engine — DONE 2026-09-06, PR #252

**Why:** the item-19a cold reader (2026-09-06, PR #249) answered every question from the new
reference and then flagged that the repo's front door contradicts it, and item 4's worker found one
more stale count:
- `CLAUDE.md` "Where behavior lives" still says the engine carries **"200 talents' worth of
  name-keyed automation — that is the iron-rule-2b backlog"**, and iron rule 2b's ratchet clause
  presents the 2026-07-24 counts (90 / 200 / 75, the 221-name allowlist) as a live backlog. The
  migration closed 2026-07-26; `scripts/name-keyed-allowlist.json` is `talents: []`; lint pass 7 now
  forbids any talent name in engine code. One paragraph to retire, one clause to reword as history.
- `CLAUDE.md` map rows: `EDHA_RULINGS.md` "45 numbered rulings" (85 today); `ENGINE_INDEX.md`
  "the ~19.7k-line engine (2026-09-05)" (21,792 lines, and edited as 55 sources since item 4).
- `ENGINE_INDEX.md` "Dispatch" still lists a pre-migration "`useItem` name-based" idiom (Green
  Grasping Vines / Territorial Instinct); its section map says "52 banners" (54 since the two 09-06
  shared-core banners).

**What to do:** one small DOCS-ONLY PR; every replaced number stated with the command that produced
it (`wc -l`, `grep -c '^\*\*R-' EDHA_RULINGS.md`, `grep -c '^/\* ===' …`); the reference (§1/§7 of the
handoff) is the source of truth for the prose. Do not touch the reference itself.

**Done when:** a cold reader finds no sentence in CLAUDE.md or ENGINE_INDEX that the reference
contradicts; the three counts match their commands; `node scripts/gates.js` green.

**PM:** lane R · model sonnet · size S · deps #19 (both halves) · verify: the commands beside the
numbers + a grep for "200 talents" / "45 numbered" / "19.7k" returning nothing. Found by items 19a and 4.

---

## 74. [x] `foundry-build.js items` (single scope) crashes on a temporal-dead-zone `let` — DONE 2026-09-06, PR #260 (TOOLING-only; `adversaries` alone was broken the same way and is fixed by the same hoist)

**Why:** item 71's worker (2026-09-06, PR #257) ran a scratch build one scope at a time and found
`node scripts/foundry-build.js items` dies with `ReferenceError: Cannot access 'REGISTERED_HANDLER_TYPES'
before initialization` at `scripts/foundry-build.js:950` — the `let` at ~948 sits BELOW the items
writer's call at ~848, so the single-scope path reads it before it exists. `all` (the deploy `.bat`
and the `--ci` gate) runs the scopes in an order that initialises it first, so CI never sees it;
a single-scope rebuild (the documented way to rebuild one pack) is broken. Pre-existing since item
64 introduced the guard.

**What to do:** hoist the declaration above every writer (or compute it once at module load);
pin a headless case that runs the items writer alone (or `--dry-run items`) and shows the crash
under reversion; check every other scope alone (`leyline`, `deity`, `heroic`, `adversaries`).

**Done when:** every single scope builds into a scratch `EDHA_MODROOT`; the pin fails under
reversion; `node scripts/gates.js` green. TOOLING-only.

**PM:** lane R · model fable-worker · size S · deps none · verify: five single-scope scratch
builds + the pin. Found by item 71.

---

## 75. [x] Nine registered handler rows still ship NO executor — give each the same no-op — DONE 2026-09-06 (ENGINE-ONLY, F5; PR #261)

**Why:** item 71 (PR #257) gave `edha-illusion-upkeep` an explicit no-op executor and changed the
registry pin from "a function or absent" to a NAMED set, `EXECUTOR_LESS_CONFIG_ONLY` in
`tests/handler-registry.test.js` — which is how it found eight more: `edha-zone-hazard`,
`edha-zone-guard`, `edha-snare-react`, `edha-damage-bonus`, `edha-counter-transfer`,
`edha-die-step-react`, `edha-unseen-ward`, `edha-suppress-veil`, `edha-heal-react`. All are
config-only riders read by engine sweeps (`edhaActorRuleOf` / `edhaWatchersOfRule`), never
dispatched — but a rule a user places on an event the system DOES dispatch (`use`,
`add-to-actor`, …) would throw in `Handler.execute`.

**What to do:** the same no-op executor with the same comment shape ("config-only — read by
<sweep>") on each of the nine, in `module-src/scripts/engine/53-native-event-system.js` (edit the
source, `node scripts/engine-assemble.js`, commit both); shrink `EXECUTOR_LESS_CONFIG_ONLY` to
empty (the pin then forbids any new executor-less row); the registry snapshot must not move
(it records no executors); state the reader for each in `ENGINE_INDEX.md`.

**Done when:** `EXECUTOR_LESS_CONFIG_ONLY` is empty and the pin is "every handler has a function";
snapshot unchanged; gates green. ENGINE-ONLY (F5).

**PM:** lane R · model fable-worker · size S · deps #71 ✓ · verify: the pin + an unchanged
snapshot. Found by item 71.

**DONE 2026-09-06:** all nine rows carry `executor: async function () {}` with a comment naming
their reader(s) (every row has one — none was dead; the list is in `ENGINE_INDEX.md` →
"Executor-less rows"); `EXECUTOR_LESS_CONFIG_ONLY` is `new Set([])` and the pin reads "every
handler has a function executor"; mutation (drop edha-heal-react's no-op) → 983 passed, 1 failed
naming the row; `handler-registry.snapshot.json` unchanged (empty diff); 984 → 984 tests.

---

## 76. [x] The phone card's DEFAULT is empty for bold-inline defaults, and R-80 / R-81 say "(§I)" but live in §C (2026-09-06, PR #262)

> **DONE 2026-09-06.** Root cause of the empty default: `RULING_DEFAULT_RE`'s `[^*]+` capture
> stopped at the first `*` of the inner `**(a) …**`, and because that WAS a match the "no default
> stated" fallback never fired — every bold-inline default rendered as `""`. The capture now reads
> through inner `**…**` pairs and strips the markers. `applied` was decided by SECTION alone, so an
> entry marked **APPLIED** in §C (R-48, R-80, R-81, R-84, R-85 — §I holds only a stub for each,
> which `RULING_STUB_RE` skips) rendered as a plain default-ask card; a bold upper-case `APPLIED`
> span in the body now marks the entry applied wherever it lives (`RULING_APPLIED_MARK_RE`; the
> rulings doc's own intro already says "anything marked **APPLIED** is already live … needs a
> veto"). R-80 / R-81 got the bold mark, "(stub in §I)" wording, and one-line §I stubs in the R-84 /
> R-85 shape. Proof: all 8 open rulings carry a non-empty default; R-48 / R-80 / R-81 / R-84 / R-85
> `applied: true`, R-18 / R-82 / R-83 `false`; `tests/pm-state.test.js` pins both forms on a
> fixture and the real file — the old regex fails with `R-80: default is empty … ""`, dropping the
> mark check fails `R-80 carries a bold APPLIED note in §C`. `docs/pm-state.json` untouched
> (openRulings rides in the dashboard index, not the board state).

**Why:** item 44's worker (2026-09-06, PR #258) found `RULING_DEFAULT_RE` in
`scripts/build-dashboard.js` yields an EMPTY default whenever the ruling writes its default as
`*Recommended default: **(a) …**` (the bold-inline form R-80 … R-85 all use), so their "Needs
you" cards show no default and the "no default stated" fallback never fires. Separately, the
R-80 and R-81 entries (added by the PM 2026-09-06) say "(§I)" in their text but sit in §C, so the
page renders them as ordinary default-ask cards (`applied: false`) rather than "applied — veto?"
cards; §I itself lists them only as stubs.

**What to do:** one regex fix (read through the inner `**…**`), pinned on the bold-inline form
and the plain form; then either move R-80 / R-81's applied notes into §I proper (the way R-84 /
R-85 carry both a §C entry and a §I stub) or drop the "(§I)" from their text — read how
`parseOpenRulings` decides `applied` before choosing.

**Done when:** every open ruling's card carries a non-empty default (state the eight); R-80 /
R-81 render as applied-veto cards; `node scripts/build-dashboard.js --check` green. TOOLING +
DOCS-ONLY.

**PM:** lane R · model fable-worker · size S · deps #44 · verify: the pins + the eight defaults
quoted from `pm-state.js --dashboard-dir`. Found by item 44.

---

## 77. [x] Power's ally/enemy filter reads `!edhaSameDisposition` as "enemy" — the batch-1 corollary at a site outside the ratchet — DONE 2026-09-06, PR #267

**DONE (2026-09-06, PR #267):** the Power site plus FIVE more the sweep found — every actor-level
side read whose result was negated or used as `if (same) skip` for an enemies-only branch:
`edhaTestAuraApply` (47-power), `edhaVeilSuppressed` (32-senses), `edhaTestReactWatch`'s
`rollerIs: "enemy"` (12-contest), `edhaChaosShatterPrompt` (42-chaos), the fate-snare region
spring (53-native), and the MIRROR image — `edha-def-test`'s `skipIfAlly` willing bypass read
`!edhaDisposHostile` as "ally" and skipped the test for an unresolved target. Each branch now names
the predicate it means; `tests/side-read-polarity.test.js` drives all five functions with the real
helpers and fails under reversion (the snare site is pinned in `tests/snare-arm-under.test.js`).
The seven positive-form call sites are correct as is (table in the PR). ENGINE-ONLY (F5).

**Why:** item 10 batch 2 (2026-09-06, PR #263) closed the `dispoFailOpen` ratchet at 0 and, on
the audit, found one more site the ratchet never counted because it goes through the ACTOR-level
helper: `module-src/scripts/engine/47-power.js` ~L419–420 —
`const same = edhaSameDisposition(owner, tok); … if (want === "enemies" && same) continue;` —
reads `!same` as "enemy", so a token whose side did not resolve passes the `enemies` filter.
That is exactly the corollary batch 1 named (`!edhaSideSame` is NOT `edhaSideHostile`), at a site
that gates who a Power talent reaches.

**What to do:** name the predicate the branch means (`edhaDisposHostile` for `enemies`,
`edhaSameDisposition` for `allies`); grep every `edhaSameDisposition(` / `edhaDisposHostile(`
call whose result is negated and check each the same way; pin the Power site headless (an
unset-disposition token is omitted from `enemies`, shown included under reversion); 🤖 row.
Edit the source, `node scripts/engine-assemble.js`, commit both.

**Done when:** no negated actor-level side read stands for the opposite predicate; the pin fails
under reversion; gates green. ENGINE-ONLY (F5).

**PM:** lane B · model fable-worker · size S · deps #10 ✓ · verify: the pin + the grep table.
Found by item 10 batch 2.

---

## 78. [x] Fix pass 10 — Ambush Bite's doubled rider label survives fix pass 9 because the tidy runs before the card re-renders — DONE 2026-09-06, PR #269

**Why:** bench run 41 (2026-09-06, PR #265) drove fix pass 9's four rows on the hash-verified
`f2fb3e2d…` engine: three passed, and the Ambush Bite formula bar STILL read
`1d10 + 3 + (1d6[Ambush Bite])[Ambush Bite] + 0`. Root cause named by the bench: fix pass 9's
repair in `edhaTidyFormula` is correct on the string, but it runs in the engine's
`renderChatMessageHTML` handler, which fires (twice) on a DETACHED element at a moment when the
string is not yet doubled; the cosmere damage card re-renders its damage section asynchronously
~1.5 s later on the connected element, with no further pass. The discriminator: an engine-rolled
bare-roll message where the tidy DID land in the DOM. Another `renderChatMessageHTML`
registration will not fix it.

**What to do:** root-cause against the installed system (the damage card's second render) and
fix at the right layer — tidy the stored roll at message creation, or hook the system's own
re-render — never a second render registration; keep the parentheses in the ROLL (the graze clone
keeps only dice/operator/pool terms). Pin on the path fixed; keep fix pass 9's pins green. Audit
the whole `edha-damage-rider` family (Prognosis printed an unfolded parenthetical too).

**Done when:** the pin fails under reversion; bench run 42 reads
~~`1d10 + 3 + 1d6[Ambush Bite]`~~ **`1d10 + 3 + (1d6)[Ambush Bite] + 0`** off the card's own
`.dice-formula` node 2 s after the card lands. ENGINE-ONLY (F5).
⚠️ **The expected string above was CORRECTED by the fix pass (PR #269), and the checklist row
carries the corrected one.** The unparenthesised form is unreachable while the parentheses stay in
the ROLL — which this item requires, and rightly: the system's graze clone keeps only
DiceTerm/OperatorTerm/PoolTerm, so a bare rider die would ride grazes. Fix pass 9 wrote that
expectation believing its display-layer tidy would drop the parentheses; the tidy never reaches this
card (see the delta). The trailing `+ 0` is the system's own `+ ${rollData.mod}`. **Bench 42 must
not fail the row for the parentheses.**

**PM:** lane B · model opus (`test-pass-fixes`) · size S · deps #265 (the report) · verify: the
pin + bench run 42. Dispatched 2026-09-06 23:21. Found by bench run 41.

---

## 79. [x] Rulings close-out 2026-09-07: Ben's dashboard marks recorded, four items filed (2026-09-07, PR #273)

**Why:** Ben marked a batch of open rulings and one art entry done through the dashboard's note
boxes and DONE marks on the morning of 2026-09-07 (pasted into the PM chat at ~10:10 ET, source of
truth). Those marks need to land in `EDHA_RULINGS.md` and `EDHA_ADVERSARY_ART_WISHLIST.md`
verbatim, four of the answers spawn new fix items, one ruling (R-56) got REOPENED against its own
2026-09-06 answer and needs to wait rather than ship, and two brand-new rulings (R-86, R-87) were
settled directly on the dashboard with no code change owed.

**What to do:**
- `EDHA_RULINGS.md`: R-18 ANSWERED (Ben confirms the house convention, canon-checked against
  `.claude/skills/cosmere-canon-reference/SKILL.md` §"advantage / disadvantage" — an advantage
  rolls extra and the player picks the die, a disadvantage rolls extra and the GM picks, they
  cancel 1-for-1) — consequence filed as item 80; R-52 gets Ben's confirming note narrowing item
  62 (the shipped +2.5 ft slack IS the fix, edge-to-edge is a contingency on bench run 42, not a
  standing requirement); R-56 REOPENED verbatim (Ben now wants the cosmere ladder for every actor
  type, reversing the 2026-09-06 answer) — scoped and filed as item 83, WAITING for Ben's go, no
  code touched; R-82 ANSWERED (default (a) accepted, no veto) — filed as item 81; R-80, R-81, R-84,
  R-85 ANSWERED (applied defaults accepted, no veto) and moved to §K per the doc's own convention;
  R-77 and R-48 get their 2026-09-06 answers reconfirmed verbatim, no status change; F-1 gets a
  SETTLED note answering Ben's rank-3-attunement question by citing the engine constant directly;
  new R-86 (GM-less / two-GM scenarios are not needed at Ben's table — retires bench run 42's
  2bM-1, the one-applier dissipates re-test, and Job 6a; the engine's primary-GM gate and GM-less
  region-trap behaviour stay, because the bench itself is the second GM client) and new R-87 (the
  character-creation wizard's numbers stand, no veto) filed direct to §K. `CLAUDE.md`'s
  `EDHA_RULINGS.md` map row count corrected via `grep -c '^\*\*R-[0-9]' EDHA_RULINGS.md`.
- `TODO_REPO_HYGIENE.md`: file items 80 (R-18's next-test-list fix), 81 (R-82's `onGraze` dial on
  `edha-damage-bonus`), 82 (the bestiary statting standard gains an explicit senses/movement line
  per block, Ben's own ask), 83 (R-56's reversal, WAITING on Ben's go). Item 62 gets a dated note
  narrowing it per R-52's confirmation. Item 70 gets a one-line note that R-83 is still WAITING,
  examples given in chat.
- `EDHA_ADVERSARY_ART_WISHLIST.md`: mark the Mistheron entry (Batch 1) done with the date, in
  whatever form `parseArtWishlist` (`scripts/build-dashboard.js`) actually detects — root-caused:
  the function had **no done-detection at all**, so every entry rendered perpetually open
  regardless of doc content; added a `**DONE …**` bold-marker convention mirroring the existing
  `RULING_APPLIED_MARK_RE` pattern, TOOLING + DOCS-ONLY.
- A dated delta at the top of `docs/handoff-changelog/2026-09.md` covering this close-out: what was
  recorded, the four items filed, R-86/R-87, the Mistheron art mark, and that bench run 42 carries
  the checklist retirements R-86 names.

**Done when:** `EDHA_RULINGS.md` has zero rulings left answered-but-unrecorded from the 2026-09-07
dashboard batch; the rulings tab shows R-18, R-82, F-1, R-80, R-81, R-84, R-85 as settled/answered
and R-56 as reopened-and-waiting; the Art tab shows the Mistheron row done; `CLAUDE.md`'s ruling
count line matches `grep -c`; dashboard rebuilt; gates green.

**PM:** lane R · model sonnet · size S · deps none · verify: manual diff of `EDHA_RULINGS.md`
sections + `node scripts/build-dashboard.js` (Rulings/Art tab counts) + `node scripts/gates.js`.
DOCS-ONLY (one small TOOLING addition to `parseArtWishlist`'s done-detection, necessary for the
Art tab proof this item itself demands).

---

## 80. [ ] Quarry advantage joins the next-test list instead of stomping the slot (R-18)

**Why:** R-18 answered 2026-09-07: attacking your quarry while under an active disadvantage
(Weakened, say) should follow the standard advantage/disadvantage cancellation rule (SR p.18,
`.claude/skills/cosmere-canon-reference/SKILL.md` §"advantage / disadvantage" — canon-checked by
the PM against Ben's memory of the rule, which matched exactly), not silently overwrite the
disadvantage the way the quarry site does today.

**What to do:** ENGINE-ONLY (F5). The Heroic quarry-advantage site currently writes/overwrites a
single slot; change it to `edhaListPush` onto `flags.nextTestMod` — item 49's writer path — so it
joins the list instead of stomping it. Item 49's existing fold already cancels an advantage entry
against a disadvantage entry one-for-one per R-80 (moved to §K, same item 79 close-out), so no new
fold logic is needed, only the write site. Pin both orders (quarry-advantage-then-disadvantage,
disadvantage-then-quarry-advantage) — both must cancel, neither must stomp.

**Done when:** the two order-pins pass and fail under a one-line reversion to the old overwrite;
one 🤖 checklist row (Quarry, Heroic) re-tests it at the table; R-18 moves to §K once shipped and
bench-confirmed.

**PM:** lane B · model opus · size S · deps R-18 ✓ (item 79) · verify: mutation (reverting to the
stomp fails the pin). ENGINE-ONLY (F5).

---

## 81. [ ] A per-rule `onGraze` dial on `edha-damage-bonus` (R-82)

**Why:** R-82 answered 2026-09-07 (default (a) accepted, no veto): the melee-only
`edha-damage-bonus` rules (Warlord's Advance and kin — the armed-strike bonuses) fire on a graze
application today, the same drift R-14(c) already closed on the Life mutation riders (Bone Spurs,
Venom Glands, Apex Form) with a per-rule graze dial (item 56, PR #242).

**What to do:** give `edha-damage-bonus` the same per-rule `onGraze` dial the Life riders have (the
`graze` value is already available at the call site per R-82's own text). Audit every authored
`edha-damage-bonus` card (Warlord's Advance and kin) and set the value the card's own wording
implies. An authored value change means a pack REBUILD — list every changed card in the PR and let
the PM decide the deploy class rather than assuming DOCS-ONLY or ENGINE-ONLY.

**Done when:** the dial exists and is pinned (on/off, mutation-verified); every audited card's
`onGraze` value is stated in the PR with the card text it was read from; one 🤖 checklist row per
changed card; R-82 moves to §K once shipped and bench-confirmed.

**PM:** lane B · model opus · size S · deps R-82 ✓ (item 79), item 56 ✓ · verify: mutation + the
per-card audit table. ENGINE + likely REBUILD (PM decides from the PR's card list).

---

## 82. [x] Bestiary statting standard gains an explicit senses + movement line per block — SHELVED 2026-09-13 into item 121, then CLOSED 2026-09-14 as absorbed: the line is `bestiary-forge/STANDARD.md` §2 and R-128 (a) turned the value batch into per-nation `attributes` (item 160 built the support)

**Why:** Ben, 2026-09-07 (dashboard), verbatim: *"We should update the bestiary lore-forge skill
to have it create appropriate stats for each adversary. Then the actor tokens for the adversaries
will inhereit the correct sight range, speed, etc."* Today a statted block's senses/movement is
whatever the derivation default gives it unless the block authors an explicit override, and R-56's
history (fix pass E → bench run 22 → PR #240 → now REOPENED by item 79's close-out) shows how much
drift that default can carry across sheet/token/build when nobody has to state the number.

**What to do:** find where the bestiary statting standard lives — the `lore-forge` /
`session-forge` skills' block-statting steps, and `leyline-tree-authoring` SKILL.md §"Adversary
abilities" — and add an explicit senses + movement line to the standard: every new block states
its Senses Range and Speed on the card, sourced from whichever default table is current at time of
authoring (see item 83) or from a stated bespoke reason. Add a lint pass: a block with neither an
explicit `senses`/movement field nor an AWA-derivable default fails the build. Then, SEPARATELY,
the values for the existing 52 pack blocks are invented content (the world's placed copies follow on ⟳ Sync) (a value has to be
chosen per block) — batch them for Ben as ONE approval per the lore-approval gate before any data
edit, and ship as an adversaries REBUILD once approved.

**Done when:** the statting standard names the senses/movement line explicitly; the lint pass
exists and is mutation-verified (a block missing both fails the build); the 52-block value batch
is written and sent to Ben as one approval menu (not applied before he says yes).

**PM re-scope 2026-09-08 01:1x (after item 83, PR #313):** the default a block gets WITHOUT an explicit
`senses` line is now the cosmere system's own ladder — `[5, 10, 20, 50, 100, ∞][ceil(AWA/2)]`, so 5 ft at
AWA 0, 10 at 1–2, 20 at 3–4 — not the Edha table's 10 ft this item was drafted against (R-56 final,
Ben 2026-09-07 21:51: *"Cosmere ladder for everyone."*). The per-block line this item adds is the
bespoke override ABOVE that default (Briar-Gone Grove's `senses: 30` is the one shipped instance;
the build writes it as `useOverride`), and the approval batch's proposed values should be read
against the ladder: a block only needs a line where its creature should see differently from what
its AWA already gives it. Dep item 83 is cleared; the gate is Ben's batch.

**PM:** lane H (Ben's approval batch is the gate) · model sonnet · size M · deps item 83 (which
default the explicit value overrides — R-56's ladder or the Edha table).

**2026-09-14 — absorbed by item 121's standard, then CLOSED the same night.** The senses + movement line this item asked for is `.claude/skills/bestiary-forge/STANDARD.md` §2. R-128 was answered (a) at 23:21 ET: blocks gain `attributes`, the build derives the token's Senses Range from AWA (item 160), and the 52-value batch this item would have sent Ben is replaced by per-nation re-derivations behind the statblock gate (R-135, item 156). Ben's gloss on what Senses Range means (the obscured-sense radius; lit areas visible beyond it) is in the schema note and the standard. Nothing further is asked of Ben.

---

## 83. [x] R-56 reversal — the cosmere senses ladder for every actor type (2026-09-07, PR #313)
<!-- DONE 2026-09-07 (PR #313) — Ben's final answer shipped: the system's
     `[5,10,20,50,100,∞][ceil((AWA value+bonus)/2)]` for EVERY actor type. The sheet half is a
     DELETION — `CommonActorDataModel.prepareSecondaryDerivedData` (cosmere-rpg 2.1.0
     index.js:8455-8457) already writes that ladder for both actor models, so
     `edhaDeriveSheetStats`'s Edha-table write was removed rather than re-tabled, and the
     system's `value + bonus` reading of AWA comes back with it. Re-tabled: the engine's
     `edhaSensesRangeFtFromAwa` (+ new `edhaAwaForSenses`) for the token stamp, the build's
     `sensesRangeFtFromAwa`/`advSensesRangeFt`, the wizard preview (new `edhaCwSensesCell`
     renders the top rung as ∞), and bench-setup-console.js's R-2 PC sight (20 → 10 at AWA 2).
     Pack: 51 of 52 tokens 10 → 5, the Grove 30/30 unchanged, 0 other field diffs across 18,879
     leaves; sheet/token parity 52/52. Mutation-pinned (ladder revert → 6 fails; sheet write
     restored → 9 fails). ENGINE (F5) + adversaries REBUILD + ⟳ Sync Adversaries. Bench rows
     83-1 … 83-6; 83-2/83-3 BLOCKED-ON-DEPLOY. R-56 moved to EDHA_RULINGS.md §K.7 — the doc now
     has NO open ruling, which tests/pm-state.test.js pins. Item 82's default is now 5 ft. -->

**Why:** R-56 was answered 2026-09-06 (Edha AWA table for adversaries too, shipped PR #240) and
REOPENED 2026-09-07 by item 79's close-out: Ben, verbatim, *"Honestly we should be using the
cosmere ladder for everyone. If that's a huge issue or rebuild let me know before changing."* This
reverses direction — the SYSTEM's own ladder for every actor type, not the Edha table.

**What to do — WAITING, do not dispatch until Ben says go; this note is the "let me know" the
ruling asked for.** Scope, sized honestly because it touches five surfaces: (1) `edhaDeriveSheetStats`
writes the Edha AWA table (0→10, 1→15, 2–3→20, 4→25, 5+→30 ft) into `senses.range.derived` for
every actor type — ENGINE-ONLY to swap for the system ladder; (2) `scripts/foundry-build.js`'s
`advSensesRangeFt` stamps prototype-token sight from the same Edha table — adversaries pack
**REBUILD** to change; (3) the character-creation wizard's preview promises the Edha table; (4)
`scripts/bench-setup-console.js` gives bench PCs their sight off the Edha table (R-2); (5) docs —
`Character_Building_Rules.md` §Senses Range, `docs/ACTOR_STAT_DERIVATION.md`, and the tests pinning
`edhaSensesRangeFtFromAwa` all carry the Edha numbers. The system ladder is `[5, 10, 20, 50, 100,
∞]` indexed by `ceil(AWA/2)` — AWA 0 → 5 ft, 1–2 → 10 ft, 3–4 → 20 ft, 5 → 50 ft: stingier than the
Edha table at AWA 0–2, wider at 5+, so this is a real behavior change at the table, not a
relabeling. Once Ben says go: swap the constant/table at all five sites, re-pin every test that
asserts the Edha numbers, adversaries REBUILD + ⟳ Sync, wizard preview updated, docs corrected.

**Done when:** Ben has explicitly said go (recorded in `EDHA_RULINGS.md` under R-56); all five
surfaces read the system ladder; every re-pinned test passes; adversaries REBUILD shipped and
bench-confirmed.

**PM:** lane H · model opus · size M · deps Ben's go on R-56 (item 79's REOPENED note). Item 82
depends on this item's outcome (which default the explicit per-block override sits against).

**PM GO 2026-09-07 21:51 ET — Ben, chat, verbatim: *"Cosmere ladder for everyone."*** (his phone tap of 17:25
said (a) keep; the chat answer is the later and explicit one and wins.) Record it under R-56 in
`EDHA_RULINGS.md` as **ANSWERED — the system ladder for every actor type** with that text and move R-56
to §K per item 96's convention (it is the last open ruling on the desktop tab). Deploy class: ENGINE
(F5, pushed by the PM) + adversaries **REBUILD** + ⟳ Sync Adversaries (Ben's next bat run) — the
wizard preview, `bench-setup-console.js`, docs and tests are repo-side. Dispatch after 00:00 ET (PM-R16).

---

## 84. [x] Weapon-borne `edha-on-hit` rules never dispatch — `edhaRulesForEvent` still gates on `edhaIsTalent`
<!-- DONE 2026-09-07 (PR #276) — predicate swapped to `edhaRuleBearer`; mutation-pinned in
     tests/engine-helpers.test.js (1019/2 fail → 1021/0 pass). ENGINE-ONLY, F5. The other three
     callers (combat-timing, draw-mana, ritual-paid) are widened by the same swap and pinned; the
     `preUseItem` veto keeps `edhaIsTalent` on purpose. 🤖 34c cue half queued for bench run 43. -->


**Why:** measured at **bench run 42 (2026-09-07)**, on the hash-verified `609c7e45…` engine with the
34a/34c pack rebuild live. `edhaRulesForEvent` (`module-src/scripts/engine/04-black-ritual.js:206`)
filters an actor's items with `if (!edhaIsTalent(item)) continue;`, and `edhaIsTalent`
(`engine/31-trigger-gating-cost.js:37`) accepts only `type === "talent"` or the
`flags.edha-content.adversaryTalent` flag — **weapons are excluded on purpose**; `edhaRuleBearer`
exists precisely to say "talents + weapons". Item 34a widened the two actor-wide harvest loops
(`edhaActorRuleOf` / `edhaActorRulesOf`) to `edhaRuleBearer` and left this one behind, so **every
`edha-on-hit` rule the weapon migration moved onto a weapon document is silently inert.**
Bench evidence: Surecat's `The Pounce Already Taken` posted no cue on four applied hits (out of
combat, and on its own turn inside a started combat). **Proven by mutation:** setting
`adversaryTalent = true` on that same weapon — the only field that changes `edhaIsTalent`'s verdict —
made the identical take post *"⏰ The Pounce Already Taken (B42 Surecat): … (hit Bench Target —
Adjacent A.)"*. **Positive control in the same session:** Brandram's Shockwave Slam
(`edha-on-hit → edha-push`, on a **trait**) fired every time.

**Blast radius, counted across all five packs: 6 shipped rules**, all `edha-on-hit → edha-gm-cue` on
weapon-type items — Wake-Eel Shoal / *Worry the Failing*, Dirgehound Pack / *Worry the Straggler*,
Callthief / *Take the Answerer*, Surecat / *The Pounce Already Taken*, Fellstag / *Antler Sweep*,
Keelshadow / *Breach and Drag*. The 13 `edha-pre-deal-damage → edha-damage-rider` weapon rules are
**unaffected** (four measured firing at run 42) because riders go through the already-widened loops.

**What to do:** swap the predicate in `edhaRulesForEvent` to `edhaRuleBearer` — the same widening
item 34a applied next door — and audit its other three callers while you are there (`edha-draw-mana`,
the combat-timing sweep, the rider dispatch): a weapon can now carry any of those, and dropping them
silently is the identical bug. ENGINE-ONLY (F5, no rebuild). Ship with a pinned regression case in
`tests/` that fails on `edhaIsTalent` and passes on `edhaRuleBearer` — assert that a weapon-borne
`edha-on-hit` rule reaches the dispatcher.

**Done when:** the predicate is swapped and mutation-verified (reverting it fails the new test); the
other callers carry a one-line verdict each in the delta; `node scripts/gates.js` green; and the
checklist's **34c weapon-borne riders survive** row's cue half is queued for the next bench run (its
rider half is already retired, and the row's note names Surecat's cue as the take).

**PM:** lane E · model sonnet · size S · deps none (engine-only — the authored data is already right).

---

## 85. [x] The phone board's "Needs you" card cannot resurface a REOPENED ruling; plus the Art tab's stray-`*` bold garble (2026-09-07, PR #277)

**Why:** `parseOpenRulings` in `scripts/build-dashboard.js` decided a ruling was CLOSED by scanning
its whole body for any `**ANSWERED …**` / `**VETOED …**` / `**SETTLED …**` bold marker, anywhere in
the text. R-56 was ANSWERED 2026-09-06 and shipped, then **REOPENED 2026-09-07** (a later `>
**REOPENED 2026-09-07 (Ben, dashboard), verbatim: …**` block, WAITING on Ben) — and because the
older ANSWERED marker was still present earlier in the body, the ruling kept reading as closed, so
it never reached the phone's "Needs you" cards or the `openRulings` list in the dash index. Ben is
waiting to be asked about it and the phone cannot ask him. Separately, the Art tab's
`### Creature — \`name-portrait.*\` / \`name-token.*\`` headings carry a literal `*` inside backtick
code spans; when the entry's prose later uses `**bold**`, the shared markdown renderer's bold pass
mis-paired that stray asterisk with the real bold markers, garbling the Corvaine Raider and
Mistheron entries.

**What to do:**
- `parseOpenRulings()` (`scripts/build-dashboard.js`): make the LAST status marker in a ruling's
  body win, in document order — a `**REOPENED …**` marker after an ANSWERED/VETOED/SETTLED marker
  reopens the ruling, and a later ANSWERED/VETOED/SETTLED after THAT closes it again. Every other
  ruling's open/closed status is unaffected (measured against the real `EDHA_RULINGS.md`: the
  open-ruling id list goes from `["R-83","R-88","R-89"]` before the fix to
  `["R-56","R-83","R-88","R-89"]` after — R-56 is the only addition). R-56 carries no `Ask:` line,
  so its self-contained heading question stays the ask per item 44's fallback convention
  (`EDHA_RULINGS.md` is out of scope for this item — reported, not edited).
- `scripts/lib/md.js`'s shared `inline()`: protect backtick code-span content from the
  `**bold**`/`*italic*`/`~~strike~~` passes (extract to a placeholder before those regexes run,
  restore after), so a literal `*` inside a code span can never pair across the span with an
  unrelated bold/italic marker elsewhere in the same string.
- Pin both fixes with tests (real-doc + synthetic-fixture for the rulings fix; one synthetic case
  for the code-span fix) and confirm the Art tab renders the two affected entries clean in the
  rebuilt `EDHA_DASHBOARD.html`.

**Done when:** the pinned tests pass and fail under reversion (mutation-verified); the before/after
open-ruling id lists differ only by R-56; the Corvaine Raider and Mistheron Art tab entries render
without a stray `**`/`*`; `node scripts/gates.js` green; dashboard rebuilt and committed.

**PM:** lane R · model sonnet · size S · deps none · verify: `node -e` before/after against the real
`EDHA_RULINGS.md` + the rebuilt `EDHA_DASHBOARD.html`'s Art tab + `node scripts/gates.js`.
TOOLING-only (both fixes live in the dashboard build tooling; no engine or pack change, nothing owed
to Foundry).

---

## 86. [x] `edhaListPlaceNotes` harvests `placeNote` behind `edhaIsTalent` and would drop a weapon-borne placeNote (item 84's bug, one loop over) (2026-09-07, PR #283)

**Why:** item 84's report (PR #276, 2026-09-07) swapped `edhaRulesForEvent`'s gate from
`edhaIsTalent` (talents only, weapons excluded on purpose) to `edhaRuleBearer` (talents + weapons),
because the item-34a weapon migration moved adversary attacks onto weapon documents and every
rule-harvest loop must see them. Item 84's own caller audit found one more harvest loop still on
the old gate: `edhaListPlaceNotes` (`module-src/scripts/engine/07-edha-owner-list.js:230`) loops
every item on a ledger owner, skips anything `!edhaIsTalent`, then reads `h.placeNote` off each
remaining item's event rules to build the ⚖ Violated/PLACE card's sibling-advertised hint text
(Sealed Edict's "you may notarize it", Lawkeeper's GM-reveal line). It is the identical shape to
the bug item 84 fixed — a full harvest-and-collect loop over `owner.items`, not a single-item
hook gate — so a weapon carrying a `placeNote` rider would be silently dropped from the card the
same way Surecat's `edha-on-hit` cue was. It also noted `edhaCovBuffTemplate`
(`engine/49-order.js:374`) gates on `edhaIsTalent` while scanning ActiveEffects, not event rules —
a different surface, not this bug.

**What to do:** swap the predicate in `edhaListPlaceNotes` to `edhaRuleBearer` — the same widening
item 84 applied next door. Then sweep every remaining `edhaIsTalent(` call across
`module-src/scripts/engine/*.js` and give each a one-line verdict in the delta: **rule harvest
(fixed)** for any other full loop-and-collect shape found; **talent-use automation (correct as
is — the `preUseItem`/`useItem` veto family and its kin exclude weapons on purpose)** for the
single-item hook gates (item 84 already widened the four rule-harvest dispatchers reading
`edhaRulesForEvent`, `edhaActorRuleOf`, and `edhaActorRulesOf` — those are not the target here);
or **other surface (left alone, why)** for name-resolution lookups, the creation wizard's
talent-only picks, and `edhaCovBuffTemplate`'s ActiveEffect scan. Fix only the rule-harvest ones.
ENGINE-ONLY (F5, no rebuild). Ship with a pinned regression case in `tests/` that fails on
`edhaIsTalent` and passes on `edhaRuleBearer` — assert that a weapon-borne `placeNote` rule
reaches the harvest.

**Done when:** the predicate is swapped and mutation-verified (reverting it fails the new test);
the sweep's verdicts are recorded in the delta; `node scripts/gates.js` green. There are 0 shipped
weapon-borne `placeNote` rules, so the pin is the whole proof — no checklist row (nothing to
re-test at the bench).

**PM:** lane B · model sonnet · size S · deps item 84 (same predicate, same widening) · verify:
mutation-revert the predicate and show the pin fail, then restore and show it pass; both runner
output lines in the PR. ENGINE-ONLY (F5) — the authored data is already right.

---

## 87. [x] The phone card's DEFAULT is empty for rulings written in the bare `*Recommended*, …` style (`RULING_DEFAULT_RE` captures only the colon form) (2026-09-07, PR #279)

**Why:** item 85's report (2026-09-07) found `RULING_DEFAULT_RE` in `scripts/build-dashboard.js`
captures only the italic `*Recommended default: …*` / `*Recommended: …*` colon form, so a ruling
whose recommendation is written in the bare style — `*Recommended*, and it matches …` or
`(a) … — *Recommended*, …` (R-56 is the live example: "**(a)** extend the Edha table to adversary
sheets AND their token sight, so one rule governs everything — *Recommended*, and it matches the
07-17c ruling …") — renders `default: "no default stated"` on the phone's Needs-you card, even
though a recommendation exists. Three rulings use the bare style in `EDHA_RULINGS.md` (around lines
879, 936 and 1432); of those, only R-56 (line 936) is currently open — R-54 and R-57 are both
ANSWERED/SHIPPED and so never reach the "Needs you" card, meaning R-56 is the only default that
actually changes.

**What to do:** widen the default extraction so the bare style yields a real default — the natural
reading is "the option sentence that carries the `*Recommended*` marker", i.e. the `(x) …` clause
the marker is attached to, trimmed to one sentence, bold/italic markers stripped like the existing
path does. Keep every currently-captured default byte-identical (measure all open rulings' `default`
before and after with `node -e` against the real `EDHA_RULINGS.md` and state both lists in the PR;
the only changes allowed are rulings that read "no default stated" before). `EDHA_RULINGS.md` itself
is out of scope for this item — if a doc normalisation of the bare style to the colon form would be
the cleaner long-term fix, say so in the PR's open questions instead of editing the doc.

**Done when:** the pins pass and fail under reversion (mutation-verified); the before/after default
lists differ only where "no default stated" became a real sentence; `node scripts/gates.js` green;
dashboard rebuilt and committed.

**PM:** lane R · model sonnet · size S · deps none · verify: `node -e` before/after against the real
`EDHA_RULINGS.md` + `node scripts/pm-state.js --dashboard-dir` showing R-56's default +
`node scripts/gates.js`. TOOLING-only (dashboard build tooling only; no engine or pack change,
nothing owed to Foundry). Found by item 85's worker.

---

## 88. [ ] Every `edha-triggered-effect` card is PUBLIC by construction — an adversary's kill-heal and its GM-only instruction leak to the table

**Why:** measured at **bench run 43 (2026-09-07)** on the hash-verified `0a677dade62f…` engine, and
re-measured against run 16's guess, which was wrong. A fresh `B43 Cragdrake Alpha` (controlled, so
`edhaResolveKiller` could resolve it) took the `character`-typed `Bench Target — Floater` from 40 HP to
0. The heal is correct — Alpha **30 → 33** — but the card posted with **`whisper: []`**, i.e. publicly:

> ⚡ **Predator's Due** (B43 Cragdrake Alpha) — B43 Cragdrake Alpha regains **3** health. *(Predator's
> Due: +2d8 health ([Tier][Die]: count = tier 2, die = boss rank 3, ruling 122) and 1 Focus on the kill
> (focus is a GM add).)* 2d8 2 1 3 3

So the players see the boss's remaining-HP arithmetic **and** a GM bookkeeping instruction addressed to
Ben. Run 16 filed this as *"likely `edhaWhisperIds()` returning empty for an ownerless adversary"*.
**That is not the cause:** `edhaWhisperIds` (`engine/11-white-coordination.js:150`) returns active GMs
plus active owners and would have returned `[Bench, Gamemaster]`. The real cause is one line up the
stack — **`edhaRollCard` (`engine/33-triggered-effect-resolution.js:143`) calls
`ChatMessage.create({speaker, rolls, sound, content})` with no `whisper` key at all**, and so do all
**seven** of its call sites in that file plus the non-rolled `ChatMessage.create` fallbacks beside them.
Public is right for a PC's own heal or Temp HP; it is wrong for an adversary.

**Blast radius, counted in the deployed adversaries pack: 17 adversary `edha-triggered-effect` rules.**
The three that carry a literal GM instruction in the card text are the `Predator's Due` blocks —
**Cragdrake Alpha**, **The Cull-Alpha**, **Dirgehound Pack**; the three `Afterburn` afflictions
(**The False Spring**, **Hazewyrm Elder**, **Hazewyrm Adult**) post through the same public
`edhaRollCard`. Player-owned actors are unaffected either way.

**What to do:** this needs **R-90** answered first — it is a design call about audience, not a bug with
one obvious fix. The recommended default there is *whisper `edhaRollCard`'s message (and its
non-rolled siblings) to `edhaWhisperIds(owner)` whenever the owner has no player OWNER — i.e. an
adversary — and leave a player-owned actor's card public*, which is one helper call at each poster and
matches what `edhaPostCueCard` already does for adversary cues. ENGINE-ONLY (F5, no rebuild). Ship a
pinned regression case in `tests/` that asserts the whisper list is non-empty for an ownerless
adversary owner and empty for a player-owned one.

**Done when:** R-90 is answered and implemented that way; the pin fails on the current code and passes
after; `node scripts/gates.js` green; and the checklist's **Predator's Due on-defeat** row is queued for
the next bench run (its heal half is already proven; only the audience is open).

**PM:** lane E · model sonnet · size S · deps R-90.

---

## 89. [x] `Unbreakable Line` ships no `use` rule on either block — the White DC test its own card promises does nothing (2026-09-07, PR #285)

**Why:** behaviour-tested at **bench run 19**, root-confirmed against the DEPLOYED pack at **bench run
43 (2026-09-07)**. Both blocks' `Unbreakable Line` — **Crownox Ring** and **The Reckoning** — carry
exactly **one** rule, `edha-apply-watch → edha-gm-cue {rangeFt: 5}`. There is no `use` rule at all, so
using the item posts an **empty chat card** (`content: ""`) with the owner as speaker: no test, no
contest core, no roll. The cue half works and is retired (run 19; R-52 (c)(i)'s half-square slack
measured at run 39) — the ability's *own* clause, *"the lead may test White (DC = half the damage) via
the contest core"*, has never existed.

**A second inconsistency in the same read, for the same fix:** `The Reckoning`'s
`system.activation.type` is **`"none"`** while `Crownox Ring`'s is **`utility`**, for the same named
ability — so on one of the two blocks the item cannot even be clicked to start the test by hand. The
descriptions differ too (`Activation: * (3 Focus)` vs `Activation: 8`), which is where the drift
started.

**What to do:** author the missing rule on both blocks — the shape is the existing contest-core
`edha-def-test` used by every other "test X vs DC" adversary ability, with the DC coming from the drop
amount the cue already reports — and align the two `activation` blocks. This is **authored data**
(`data/adversaries.json` + the authored overlay), so it is **REBUILD + ⟳ Sync Adversaries**, not
engine-only. Cross-check the wording against `EDHA_RULINGS.md` R-52 before writing the DC.

**Done when:** both blocks carry the `use` rule; using the item on either posts a real contest-core
test instead of an empty card; the two `activation.type` values agree; `node scripts/gates.js` green
(including `lint-refs.js` pass 5); and the checklist's **Unbreakable Line ally-drops cue** row's (b)
half is queued for the next bench run with a REBUILD note.

**PM:** lane D · model sonnet · size S · deps none.

---

## 90. [x] Retire the five harness-only checklist rows (I10b2-1..4 and 77-1's unset-side clause): no sideless token can exist on this build (2026-09-07, PR #282)

**Why:** bench runs 38, 42 and 43 each independently re-derived the same fact on Ben's build
(Foundry core 13.351, cosmere-rpg 2.1.0): creating a token with `disposition: null`, or updating
one to `null` / `undefined` / `NaN`, reads back **−1 (HOSTILE)** — so a "sideless" token cannot be
staged, and an actor with no token is in no range sweep either (it discriminates nothing, so it is
not a usable fallback probe). The five checklist rows that ask a bench run to *observe* the
fail-closed handling of a sideless creature therefore describe an observable that cannot occur
live, on this build, ever. The behaviour they were meant to protect is not unverified — it is
**pinned in the harness**: `tests/disposition-failclosed.test.js` holds 23 cases covering
`edhaDisposHostile`, `edhaSameDisposition`, `edhaSideSame`/`edhaSideHostile`, `edhaAdjacentAllies`,
`edhaEnemyTokensInCircle`, `edhaSovTargets`, `edhaPickCandidates`, `edhaSweepEmptyNote`, the
movement-window card, `edhaPickProhibition`, and the cleanse beacon list — i.e. every one of the
five rows' underlying sites, at the pure-function level a bench run cannot get under. The PM
(2026-09-07) accepted bench run 43's recommendation, offered in `docs/BENCH_NEXT_RUN.md` §3, to
retire the five as harness-only rather than have a fourth bench run re-derive the same blocker.

**What to do:** in `EDHA_FOUNDRY_TEST_CHECKLIST.md`, retire **I10b2-1**, **I10b2-2**, **I10b2-3**,
**I10b2-4** (flip each `- [ ]` to `- [x]`) and **77-1** (a single bare-bullet row whose aura-halves
already PASSED live at bench run 42 — the unset-side clause was its only open part, so the whole
row retires). Each gets one appended line naming the harness proof and the case count, keeping the
row's existing ⛔ evidence trail intact. In `docs/BENCH_NEXT_RUN.md`, mark done the one paragraph
in §3 that recommends this retirement (one line, do not rewrite the file). Rebuild the dashboard.

**Done when:** all five rows carry the retirement note; the dashboard's Bench open 🤖 count drops
by exactly the number of *checkbox* rows retired (77-1 is a bare bullet with no `- [ ]`, so the
parser was never counting it — `scripts/build-dashboard.js`'s bench parser only turns `- [ ]` lines
into rows, per its own 2026-07-26d gate comment; retiring it is a documentation fix, not a count
change); `node scripts/gates.js` green.

**PM:** lane R · model sonnet · size S · deps none · verify: `grep` the five rows for the
retirement note + `node scripts/build-dashboard.js` (Bench tab count) + `node scripts/gates.js`.
DOCS-ONLY.

---

## 91. [x] Rulings close-out 2026-09-07 evening — R-83 / R-88 / R-89 answered, four ⚑ wizard-v2 rows PASS (Ben's second dashboard paste) (2026-09-07, PR #289)

**Why:** Ben went through `EDHA_DASHBOARD.html` again on the afternoon of 2026-09-07 (after the
17:03 deploy) and pasted the Copy-for-Claude block into the PM chat at 17:11 (stamp `@0acf0a482c`).
Three rulings that were WAITING got a one-letter answer, four ⚑ rows on the Bench tab got a PASS
mark, and forty-odd rulings rows got a "done" tick on answers already recorded by item 79. Item 79
is the worked example of this shape — same files, same evidence standard.

**The new answers, verbatim (record each ANSWERED line with Ben's text and the item that applies it):**
- **R-83 → "a"** — gate the three ungated `hea` writers at their emitters → applied by **item 70**
  (Opus, engine-only; the PM dispatches it after midnight under PM-R16).
- **R-88 → "a"** — drop Volatile Strike's `whenDamageType: "impact"` gate → applied by **item 92**.
- **R-89 → "a"** — the `NO NAMEABLE HOOK` declaration moves off the description into data
  (`flags.edha-content.noHook`) → applied by **item 93**.
- **R-56** — Ben's text is unchanged from item 79's record (*"Honestly we should be using the cosmere
  ladder for everyone. If that's a huge issue or rebuild let me know before changing."*): still
  **WAITING on his go** for item 83; do not mark it answered.
- R-77 (*"that works. default."*), R-48 and R-52 carry Ben's notes already (item 79) — verify each
  is present, add nothing that duplicates.

**The four Bench-tab PASS marks (⚑ rows in the "Character-creation wizard v2 (2026-07-19p …)"
section, checklist ~L2719–2830):** Coin row v3 (Ben: *"looks good to me!"*), Weapon picker — does
the list LOOK pickable?, Preview panel centered (07-19y), and the map-picker DEAD SPOTS defect row
(the 2026-07-27v audit's five dead spots — R-42's polygons were fixed by item 61, PR #262, so this
PASS is Ben's confirmation at the table). Retire each row on Ben's evidence (`[x]`, dated, quoting
him where he wrote something), exactly as item 79 retired its 13 rows.

**What to do:** `EDHA_RULINGS.md` (the three ANSWERED lines, each pointing at its item; the WAITING
count in the doc header and CLAUDE.md's rulings row if either states a number), the four checklist
rows, then `node scripts/build-dashboard.js`. If a test pins the number of open (WAITING) rulings or
open ⚑ rows (item 79's worker hit an over-tight pin), re-pin it to the new count with the reason in
the commit. Do NOT touch `data/`, the engine, or the board — the PM keeps the board; items 92 / 93
apply the data answers on their own branches.

**Done when:** R-83, R-88, R-89 read ANSWERED (a) with Ben's verbatim text and their item numbers;
the four rows are retired with evidence; the dashboard's Rulings tab shows three fewer WAITING and
the Bench tab four fewer open ⚑; `node scripts/gates.js` green. DOCS-ONLY — nothing owed to Foundry.

**PM:** lane R · model sonnet · size S · deps none · verify: `grep -c WAITING EDHA_RULINGS.md` before
/ after + `node scripts/build-dashboard.js` counts + `node scripts/gates.js`. DOCS-ONLY.

---

## 92. [x] R-88 (a) — Volatile Strike drops its `whenDamageType: "impact"` gate so the rider fires on ANY melee hit, as its card says (2026-09-07, PR #288)

**Why:** bench run 42 (2026-09-07, PR #274) measured both directions on the deployed pack: a plain
weapon hit that dealt **impact** posted the *"⚡ Volatile Strike — 1 Investiture …"* offer, and the
same PC's ordinary **keen** sidesword hit posted nothing. The rule on the talent
(`data/authored/leyline-red.json`, the `"Volatile Strike"` block ~L1173, its `edha-on-hit` rule with
`type: "edha-triggered-effect"`) carries R-23 (a)'s `whenDealer: "any"` (item 58) **and** a
`whenDamageType: "impact"` that R-23 never touched and the card never mentions — the card's prose is
the bare *"When you hit with a melee attack, spend 1 Investiture …"*. For a Red PC with a keen weapon
the rider almost never fires. **Ben answered R-88 with "a" (dashboard, 2026-09-07 17:11):** drop the
gate; the card is canon.

**What to do:** remove the `whenDamageType` key from that one rule and fix the rule's own
`description` string in the same block (it reads *"On a melee (impact) hit …"* — make it *"On a
melee hit …"*). Check `data/leyline.json`'s Volatile Strike prose already says "melee attack" with
no damage-type clause (it should; change nothing there unless it contradicts the card). Authored
`events` changed → **REBUILD (leyline pack) + ⟳ Sync Talents** for Ben's Red PCs. This is the ONE
authored-data change the ruling licenses — touch no other talent.

**Proof (parity):** build the leyline pack before and after into scratch (`EDHA_MODROOT`), diff the
embedded docs: exactly ONE document differs (Volatile Strike), and the diff is that key plus the
description string — state the count in the PR. Check `tests/on-hit-dealer.test.js` — its `VOLATILE`
fixture carries `whenDamageType: "impact"` to exercise `edhaOnHitIsItemSpecific`, which is a test
fixture, not the authored data; leave it unless it asserts against the authored file.

**Done when:** the key is gone, the description string matches, parity shows one doc changed, a
🤖 row in the checklist's Red section says *"on the rebuilt pack, an ordinary keen melee hit by a
Volatile Strike owner posts the offer (bench 42's negative case, flipped)"* with a REBUILD note,
a dated delta at the top of `docs/handoff-changelog/2026-09.md` stating **REBUILD + ⟳ Sync
Talents**, dashboard rebuilt, `node scripts/gates.js` green. Do not edit `EDHA_RULINGS.md` — item 91
records the answer.

**PM:** lane B · model sonnet · size S · deps R-88 ✓ (Ben "a") · verify: pack parity (one doc) +
`node scripts/gates.js`. REBUILD + ⟳ Sync Talents.

---

## 93. [x] R-89 (a) — the `NO NAMEABLE HOOK` declaration moves off the description into data (`noHook` → `flags.edha-content.noHook`), read by lint pass 5 (2026-09-07, PR #291)

**Why:** bench run 42 (2026-09-07, PR #274) measured that Foundry's editor drops the
`<!-- NO NAMEABLE HOOK: … -->` HTML comment on save (`ProseMirror.dom.parseString` →
`serializeString`, the exact pair the sheet uses — Wrongwake's Drag Under lost its marker on the
round-trip). Nothing is broken today because the marker lives in `data/adversaries.json`, but the
first time an edited description comes back from Foundry the marker is silently gone and
`scripts/lint-refs.js` pass 5 (~L340–372) fails on an ability that never changed. **Ben answered
R-89 with "a" (dashboard, 2026-09-07 17:11):** the declaration stops being prose and becomes data.

**What to do:**
1. `data/adversaries.json` — 17 abilities carry the comment in `text` (or `rider`). Each gets a
   sibling key **`noHook: "<the reason, verbatim from the comment>"`** and the comment is removed
   from the prose. Document the key in the file's header schema comment (~L45, beside `events`).
2. `scripts/foundry-build.js` — the adversary embedded-item doc writes
   `flags["edha-content"].noHook` when the key is present (the flag is data the editor never
   rewrites; it renders nowhere).
3. `scripts/lint-refs.js` pass 5 — `it.noHook` (non-empty string) is the exemption; a
   `NO NAMEABLE HOOK` string anywhere in the prose (comment or visible) is now an ERROR that names
   the fix ("move it to `noHook`"), so the old form cannot creep back. Keep the `ENGINE-NATIVE VIA`
   branch as is. `scripts/validate.js` / `validate-adversaries.js` type-check the key (string,
   non-empty) and the L66 note in `validate-adversaries.js` names the key.
4. Extract: check whether any extract path (`scripts/foundry-extract.js`, `AUTHORING_WORKFLOW.md`'s
   adversary loop) round-trips adversary descriptions; if one does, it must carry the flag back to
   `noHook`; if none does, say so in the PR (one sentence) — that is a finding, not a task.
5. Docs sweep: every place that tells an author to write the comment — CLAUDE.md "Where behavior
   lives" (`data/adversaries.json` line), `.claude/skills/leyline-tree-authoring/SKILL.md`
   §"Adversary abilities", `EDHA_RULINGS.md` R-47's ⚠️ clause (a one-line "moved by R-89 (a) → item
   93" — do not rewrite R-47), and anything `grep -rl "NO NAMEABLE HOOK" --include=*.md` finds that
   instructs rather than records history.

**Proof (parity + mutation):** build the adversaries pack before and after into scratch; diff the
embedded docs: exactly the 17 marked abilities differ, each by the comment leaving the description
and the flag arriving — 0 other diffs, 0 roll differences; state the count. Mutation, pinned in
`tests/` the way pass 7's allowlist is pinned: (i) a prose marker fails pass 5 with the new
message; (ii) removing `noHook` from a trigger-naming ability fails with the original message;
(iii) the shipped data passes.

**Done when:** 0 comments left in `data/adversaries.json`, 17 `noHook` keys, the flag on the
built docs, both mutations pinned, the docs sweep done, a 🤖 row (*"open a marked ability's
description in the Foundry editor, save, re-extract: the flag survives and lint stays green"*),
a dated delta stating **adversaries REBUILD + ⟳ Sync Adversaries** (descriptions change even though
the rendered card does not), dashboard rebuilt, `node scripts/gates.js` green. Do not edit
`EDHA_RULINGS.md`'s R-89 entry — item 91 records the answer.

**PM:** lane B · model sonnet · size M · deps R-89 ✓ (Ben "a") · verify: pack parity (17 docs,
only the comment + flag) + the two lint mutations + `node scripts/gates.js`. REBUILD + ⟳ Sync
Adversaries.

---

## 94. [x] The mobile board re-renders the whole page on every store snapshot — Ben's "Sent ✓" marks vanish, the page jumps to the top, and rows he answered elsewhere still show as open (2026-09-07, PR #294)

**Why:** Ben, chat 2026-09-07 17:3x, verbatim: *"It doesn't seem to save my inputs in the artifact —
that is, every few seconds the page refreshes, jumps to the top of the page, and all of my 'marked
sent' items are how they were before. I know you still get my notes because I see you work on them —
but the dashboard is painful to use. Additionally, it shows on my phone the items that I answered
from the PC browser dashboard around 1700 — might be the same issue, might not be."* The notes DO
land (seven arrived 17:23–17:25 and the PM acted on every one); the failure is the page's own
rendering. Read `docs/pm-board-mobile.html` ~L1036–1100 (`connect()`) and the render functions it
calls before touching anything — the mechanism as the PM read it, to be VERIFIED not assumed:

- `db.doc("pm/state").onSnapshot` → `render()` rebuilds EVERY panel by `innerHTML` (now-panel,
  meters, rows, asks, loglist, **nycards**, …). The PM pushes `pm/state` at every state change
  (three pushes between 17:19 and 17:22 alone), so while Ben was answering, the whole page was
  rebuilt under his thumb.
- `markSent()` (~L923) writes the "Sent ✓" pill INTO THE DOM ONLY (`acts.innerHTML = pill`). It
  lives in no store and no variable, so the next `renderNeedsYou()` erases it and the card shows
  its buttons again — and **`tick()` (~L1012, `setInterval(tick, 30000)`) calls `renderNeedsYou`
  every 30 seconds unconditionally** (verified by the PM 17:35). That alone is Ben's "every few
  seconds"; the `pm/state` and `dash/index` snapshots add to it.
- `db.collection("inbox")…onSnapshot` fires on every note Ben sends and on every `seen` update
  the PM writes (seven at once at 17:30) → `renderNotes()`; check whether anything else re-renders
  on that path.
- `dash/index` snapshot → `renderNeedsYou` + `loadDash` → `renderDash()` replaces `dsections`
  (hundreds of KB of rows) → on a phone that is the scroll jump.
- The PC-dashboard marks are a DIFFERENT thing: `EDHA_DASHBOARD.html`'s marks live in the PC
  browser's `localStorage` and reach the repo only through the Copy-for-Claude paste → a worker
  retiring the rows → the PM's next dash push. Until that lands, the phone correctly shows the
  repo's state (still open). Say so in the page's "Needs you" hint rather than pretending otherwise.

**What to do (the fix, in order of value):**
1. **"Sent" derives from the store, never from the DOM.** Keep the inbox's last 30 docs in memory
   (the subscription already delivers them); in `renderNeedsYou()` a card whose reply prefix
   (`rulingReplyPrefix(r)` / the "Re Waiting on Ben › …" prefix) matches an inbox note's text
   renders as `Sent ✓` (status `new`) or `Recorded by PM ✓` (status `seen`, showing the PM's
   `action` line) instead of its buttons — so a re-render, a reload, or another device all agree.
   `markSent()` then just triggers that render.
2. **Targeted re-renders.** `pm/state` re-renders the board panels only; `dash/index` re-renders
   the dashboard panels only; the inbox re-renders notes + the needs-you marks. No path rebuilds a
   panel whose data did not change. Where a big panel must be rebuilt, preserve `window.scrollY`
   (or the focused card's `getBoundingClientRect().top`) across the swap.
3. **The 30-second `tick`** updates clocks and elapsed times by `textContent` on the elements that
   carry them — never a full `render()`. Verify what it does today first.
4. The "Needs you" hint gains one sentence: rows marked on the desktop dashboard reach this page
   only after the PM's next push (paste the Copy-for-Claude block into chat to get them retired).

**Proof:** a headless check in `tests/` that loads the page's script with a fake `window.claude.use("db")`
(the shape the page already tolerates — see the `!db` branch), drives (i) a `pm/state` snapshot after
a `markSent` and asserts the pill survives, (ii) an inbox snapshot carrying a note with a card's prefix
and asserts that card renders as sent without any click, (iii) a `tick` and asserts no panel's
`innerHTML` was reassigned. If the page's script cannot be loaded headlessly without a refactor,
extract the pure decision (`sentStateFor(card, inboxDocs)`) into a function the test can call and
say so. Then the PM republishes the page (`Artifact` with `url`) — the worker cannot; the PR body
must say "needs republish".

**Done when:** the three proofs pass; `docs/pm-board-mobile.html` keeps `{}` in both snapshot slots
(never commit a filled page); `node scripts/pm-state.js --live … --inject docs/pm-board-mobile.html
--out tmp/pm/pm-board.html` still produces a page that renders offline (open it in the in-app
browser and screenshot the Needs-you section); `node scripts/gates.js` green. TOOLING-only —
nothing owed to Foundry; the PM republishes the artifact after merge.

**PM:** lane R · model sonnet · size M · deps none · verify: the three headless proofs + the injected
page rendering + `node scripts/gates.js`. TOOLING-only (+ PM republish).

---

## 95. [x] Rulings close-out 2026-09-07 evening, part 2 — R-90 (a) and R-91 (a) from the phone inbox; retire the R-62 audience row (2026-09-07, PR #292)

**Why:** Ben answered two more rulings from the phone at 17:25 ET, after item 91 had already been
dispatched (and this repo's PM cannot message a running worker), so they get their own small
close-out of the same shape. Verbatim (mobile-board inbox, the row's own (a) text tapped):
- **R-90 → (a)** *"whisper to `edhaWhisperIds(owner)` when the owner has no player OWNER — i.e. an
  adversary — and leave a player-owned actor's card public."* → applied by **item 88** (Opus,
  engine-only; the PM dispatches it after midnight under PM-R16).
- **R-91 → (a)** *"retire the row under R-86 — the flips are repo-side facts pinned by the code
  (`activeOnly` present or absent at each of the seven sites) and the behaviour they change only
  matters in a state you have said will never occur."* → the checklist row **"VISIBLE — R-62
  audience flips, seven sites"** (`EDHA_FOUNDRY_TEST_CHECKLIST.md` ~L4948, 🤖) is retired under
  R-86 with that reason and the date; its ⛔ evidence trail stays.

**What to do:** the two ANSWERED lines in `EDHA_RULINGS.md` (R-90 ~L502, R-91 ~L522 — each with
Ben's verbatim text, the date/channel "2026-09-07 17:25, phone inbox", and the item or row it
applies to), the one row retirement, `node scripts/build-dashboard.js`, any open-count pin re-pinned
with the reason. **Wait for item 91 (PR from `pm/91-rulings-closeout-0907-evening`) to be on `main`
first** — same files; branch from the `main` that has it. Do NOT touch `data/`, the engine, or the
board.

**Done when:** R-90 and R-91 read ANSWERED (a); the R-62 row is retired with the R-86 reason; the
dashboard's Bench open-🤖 count drops by one and the Rulings WAITING count by two; `node
scripts/gates.js` green. DOCS-ONLY.

**PM:** lane R · model sonnet · size S · deps item 91 merged · verify: `grep -c WAITING
EDHA_RULINGS.md` before/after + the dashboard counts + `node scripts/gates.js`. DOCS-ONLY.

## 96. [x] Rulings §K sweep — 47 answered rulings still sit in §A–§J, so the desktop Rulings tab lists them as open and Ben asks "Why is this still here?" (R-47); move them to §K under the doc's own rule and make the dashboard mark a closed body done (2026-09-07, PR #300)

**Why:** Ben's third dashboard paste of 2026-09-07 (20:30 ET, `@4944221a06`) marked 43 rulings
✓ DONE and left one note, on R-47: *"Why is this still here?"* Every one of those rulings — and
R-83 / R-88 / R-89 / R-90 / R-91, which he did not re-mark — is already ANSWERED, SETTLED, or
SHIPPED inline: `parseOpenRulings()` in `scripts/build-dashboard.js` (the phone's "Needs you"
logic, which reads the body's last ANSWERED / VETOED / SETTLED / REOPENED marker) finds exactly
ONE open ruling, **R-56**. But the desktop dashboard's ⚖ Rulings tab is built by `parseRulings()`,
which marks a ruling `done` only when it lives under `## K. Settled` — and the close-out items
(79, 91, 95) recorded Ben's answers inline under each number without moving the entry. The doc's
own header says what should have happened: *"When a ruling is answered: record the answer inline
under its number, move it to §K (Settled)."* So 48 entries sit in §A–§J today, 47 of them with
closed bodies (per the parser — A: R-2 · B: R-4 R-74 R-78 R-77 R-6 · C: R-10 R-12 R-13 R-14 R-15
R-17 R-18 R-50 R-51 R-69 R-70 R-72 R-82 R-83 R-88 R-89 R-90 R-91 · D: R-23 R-25 · E: R-27 R-28
R-29 R-31 R-32 R-71 · F: R-35 R-36 R-37 R-38 · G: R-40 R-46 R-48 R-47 R-52 · H: R-42 R-54 R-55 ·
I: R-73 · J: F-1 F-2), and the tab shows all 48 as open rows. R-4 is the odd one: its full text is
already in §K and §B still carries a `**R-4.` heading paragraph pointing there, which the parser
counts as a ruling, not a stub.

**What to do:** (1) In `EDHA_RULINGS.md`, move each closed-body entry's text **verbatim** (heading
paragraph + every prose paragraph up to the next ruling / stub / heading — the same body
`parseOpenRulings()` reads) out of its themed section into `## K. Settled`, keeping §K's existing
grouping convention (read §K first; add a short sub-heading per source section only if §K already
uses them), and leave the doc's one-line stub behind in the themed section — the R-1 / R-3 shape:
`*(R-n — <short title> — ANSWERED <date>, moved to §K.)*` (`RULING_STUB_RE` skips stubs). R-4's §B
heading becomes a stub (its text is already in §K — do not duplicate it). §I's R-73 becomes a stub
in §I. **R-56 stays where it is** — it is the one open ruling. Change no ruling's wording, dates,
options, or answers. (2) In `scripts/build-dashboard.js`, make `parseRulings()` mark a ruling
`done` when `rulingBodyIsClosed()` is true for its body — not only when it lives in §K — so a future
inline answer never shows as open on the desktop tab again; keep §K's items done as today. Pin it
in the dashboard tests with a mutation: a fixture with an ANSWERED body outside §K renders done, and
the real-doc pin that expects `parseOpenRulings` = [R-56] stays. (3) `node scripts/build-dashboard.js`;
confirm `parseOpenRulings(md)` still returns exactly R-56 and the Rulings tab's not-done count goes
48 → 1. Do NOT touch `data/`, the engine, the checklist, or the board.

**Done when:** every §A–§J entry except R-56 is a stub; §K holds the moved texts verbatim (sha256 of
the concatenated moved bodies before = after, both hashes in the PR body); `parseOpenRulings` =
[R-56]; the desktop Rulings tab shows 1 open row; the mutation pin fails without the parser change;
`node scripts/gates.js` green. DOCS + TOOLING-only — no deploy.

**PM:** lane R · model sonnet · size M · deps — (branch from the `main` that has this item) · verify:
the parser counts before/after, the hash proof, the mutation, gates. Filed 2026-09-07 20:4x from
Ben's third dashboard paste (43 ✓ DONE ticks + the R-47 note).

## 97. [x] PM-R17 — Ben's two PCs may be REFRESHED by agents (⟳ Sync Talents / sync-from-pack), never edited: rewrite the "UNTOUCHABLE" hard rule everywhere it is stated (2026-09-07, PR #304)

**Why:** Ben, chat 2026-09-07 21:51 ET, verbatim: *"I'm rewriting the previous rule regarding Tem
parinaem and Soggy Bottom — they get refreshes from you and agents but no edits to stats, items, or
text."* Until now bench-run hard rule 1 said the two player-character actor documents are
UNTOUCHABLE (never written to, never targeted by an effect that writes to them), which is why every
post-deploy `⟳ Sync Talents` click on them was left as something only Ben could do (the bench synced
its 16 bench PCs and stopped). The new rule splits the guard in two: **a REFRESH — the PC sheet's
`⟳ Sync Talents` button, or any equivalent pull-from-pack of their owned talent copies — is now
allowed for the PM and for agents; a hand EDIT of their stats, items, or text is still forbidden**,
and their tokens on the Playtest Map stay under the PM-R13 scene licence exactly as before.

**What to do:** rewrite the rule at every place it is stated, quoting Ben's sentence once (in the
bench-run skill) and pointing to PM-R17 elsewhere: `.claude/skills/bench-run/SKILL.md` hard rule 1
(and the "keep their hard guard unchanged" clause in hard rule 4), `.claude/skills/bench-marathon/SKILL.md`
~L138, `docs/EDHA_BENCH_RUNBOOK.md` ~L23 and ~L106 (and add one short recipe: how a run refreshes the
two PCs — open each sheet, click `⟳ Sync Talents`, record the toast; never the roster script's write
paths), `EDHA_FOUNDRY_HANDOFF.md` ~L141, the CLAUDE.md map row for the bench (~L45, "hard-guarded" →
"refresh-only"), and the header comment of `scripts/bench-setup-console.js` (~L17; the `PROTECTED`
list at ~L86 STAYS — it guards the script's own writes, which are edits, not refreshes; do not change
the script's behaviour or `tests/bench-orphans.test.js`). Leave historical text alone (changelog
deltas, retired checklist evidence, TODO items 1289/1557 context). Add the ruling to `EDHA_RULINGS.md`
§K as a settled record if the doc keeps PM rulings there (check R-8's entry, which cites the guard,
and add one line pointing at PM-R17); otherwise the board's rulings table is the record. Then
`node scripts/build-dashboard.js` if any dashboard source changed.

**Done when:** `grep -rn -i "untouchable" .claude docs EDHA_FOUNDRY_HANDOFF.md CLAUDE.md scripts/bench-setup-console.js`
finds no statement of the old absolute rule about the two PCs (historical/evidence text excepted and
listed in the PR); every rewritten statement says refresh-yes / edit-no and cites PM-R17; the runbook
carries the refresh recipe; `node scripts/gates.js` green. DOCS-ONLY (no script behaviour change).

**PM:** lane R · model sonnet · size S · deps — · verify: the grep above before/after + gates.
Filed 2026-09-07 21:5x from Ben's chat ruling. The first refresh under the new rule is bench run 44's
step zero (both PCs' `⟳ Sync Talents` after the 20:28 leyline REBUILD).

## 98. [x] Phone-inbox close-out 2026-09-07 21:53 — retire the Ashkar art-backlog row on Ben's word, and rewrite the stale "Session 1 is ready pending Ben's ⚑ batch" line in the campaign state (2026-09-07, PR #305)

**Why:** two notes from Ben's phone board (inbox, 2026-09-07 21:53–21:54 ET), verbatim:
- On the Bench row `ART BACKLOG, not a test` under `# Ashkar Mesas Bestiary (rulings 137–138 …)`
  (`EDHA_FOUNDRY_TEST_CHECKLIST.md` ~L4579): *"This can be marked complete. We will revisit the art
  and session building loop later."*
- On the Worldbuilding row for `EDHA_CAMPAIGN_STATE.md` ~L95 (*"Session 1 is ready pending Ben's ⚑
  batch"*): *"What else is needed from me here? is an updated session forge needed?"* The PM's answer
  (chat, 22:0x): that paragraph is stale — of its four blockers, the **W23 adversary tooling round is
  DONE** (the bestiary folders shipped in July and were bench-tested through September) and the
  **capitals are DONE** (5 capital-tagged of 35 cities in `source-materials/maps/thyrcross.map.json`);
  the **battle-map art** (Palewater shallows, Withervale) is Ben's whenever he gets to it; and the
  **day-5 ferry-pair town stop** (ruling 154, *"needs some GAS"*, run-sheet §10.2) still needs a
  session-forge pass. Because the run-sheet predates the July–September engine, bestiary, and rulings
  work, a **session-forge refresh sitting with Ben precedes play** — it is interactive (his ruling
  gates), not an overnight item — and is **deferred on his 21:53 note**.

**What to do:** (1) the Ashkar row → `[x]` with a dated retirement note quoting Ben verbatim (phone
inbox, 2026-09-07 21:53 ET); leave the Kettavar `ART BACKLOG` row (~L4674) open — Ben named only
Ashkar — but mention it in the delta. Do not touch `EDHA_ADVERSARY_ART_WISHLIST.md` (the art debt
stays tracked there). (2) Rewrite the `EDHA_CAMPAIGN_STATE.md` ~L95–99 paragraph to today's truth
in the same voice: what is done (W23 round, capitals — cite the map count), what is Ben's (the two
battle maps' art), what is open (the ferry-pair stop → session-forge), and the dated note that a
session-forge refresh with Ben precedes session 1 and is deferred per his 2026-09-07 21:53 note
(verbatim). Keep the two settled/resolved parentheticals that follow it. (3) `node
scripts/build-dashboard.js` (both files are dashboard sources); `node scripts/build-canon-codex.js`
if the codex reads the state doc (run its `--check` to find out). DOCS-ONLY.

**Done when:** the Ashkar row is `[x]` with the quote; the state paragraph reads true today and
carries the deferral note; the dashboard's ⚑ For-Ben count drops by one; `node scripts/gates.js`
green. DOCS-ONLY.

**PM:** lane R · model sonnet · size S · deps — (branch from the `main` that has this item; item 97
runs in parallel on other files — expect the usual changelog-top / dashboard merge at review) ·
verify: the ⚑ count before/after + gates. Filed 2026-09-07 22:0x from the phone inbox.

## 99. [x] `pm-state.js` projects the WHOLE run log into `pm/state` — the phone document hit the store's 256 KiB cap on 2026-09-08 00:04 and the push failed (2026-09-08, PR #309)

**Why:** the mobile board's live document `pm/state` is written with `Artifact write_db` from
`docs/pm-state.json`, and the store caps one document at **256 KiB** (the same cap the dashboard
chunks are sharded under — `--dashboard-dir` already respects it). `scripts/pm-state.js` projects
the board's run log in full (`runLog[]`, 212 rows = 154 KB of the 259 KB JSON tonight; the queue is
another 83 KB), so at 00:04 ET on 2026-09-08 the push was refused — *"db write failed
(invalid-argument): the server could not accept the request as shaped"* — and the phone froze on the
22:21 ET state. Every run-log row makes it worse; the 22:21 push had ~3 KB of headroom.

**What to do:** in `scripts/pm-state.js`, cap what is PROJECTED, not what is parsed: `runLog` carries
the most recent **N = 60** rows (newest last, as today) plus `runLogTotal` (the full count) and
`runLogFrom` (the date of the oldest projected row); `dispatches` (the budget math) and any
per-item lookups (`[...runLog].reverse().find(...)` at ~L458) keep reading the FULL parsed log, so
trailing-window counts and "last dispatch of item N" never truncate. Add `--runlog-rows <n>` to
`parseArgs` for the PM to override (0 = all). `docs/pm-board-mobile.html`: if the run-log panel has
a header, show "last N of M" from those two fields; no other page change. Pin it in
`tests/pm-state.test.js`: a synthetic board with 400 run-log rows projects `runLog.length === 60`,
`runLogTotal === 400`, `dispatches` counted from all 400, and the serialized state stays under
262,144 bytes; plus the real `docs/PM_BOARD.md` projection under the cap (state the byte count).
Mutation: the cap removed → the length assertion fails. Regenerate `docs/pm-state.json` with the
new default and commit it (the tracked file is what the phone shows — Ben's 2026-09-06 instruction).
TOOLING-only; the page republish (if the panel header changed) is the PM's.

**Done when:** `node scripts/pm-state.js --live docs/pm-live.json --out docs/pm-state.json` writes a
file whose JSON is under 200 KB with today's board; the pins pass and fail under the mutation; the
full-log invariants (`dispatches`, per-item last-dispatch) are asserted; `node scripts/gates.js`
green. TOOLING-only.

**PM:** lane R · model sonnet · size S · deps — (branch from the `main` that has this item; item 70
runs in parallel on engine files — expect the changelog-top / dashboard / TODO merge at review) ·
verify: the byte count before/after + the mutation + gates. Filed 2026-09-08 00:1x by the PM after
the failed push.

## 100. [x] Changelog hygiene gate — two workers tonight REPLACED the top delta heading instead of inserting above it, and the changelog README index has drifted (2026-09-08, PR #311)

**Why:** twice on 2026-09-07/08 a worker's new delta went in by *replacing* the first `## ` heading
under the marker line instead of inserting above it — bench 44a (PR #298, displaced item 94's
heading) and item 99 (PR #309, displaced item 98's) — leaving the previous delta's body headless
until the PM restored it at review. Both briefs said "insert above the current top heading — never
replace it", so wording does not fix it; the file's shape invites it: the marker line is
immediately followed by the first heading with no blank line between, so an edit anchored on
"marker + first heading" swallows the heading. Separately, `docs/handoff-changelog/README.md`'s
index says 2026-09.md holds 94 deltas ending 2026-09-06, the month file's own header says 97, and
the real heading count is higher still (item 70's and item 99's workers both reported it; nothing
gates it).

**What to do:** (1) Put exactly one blank line between the marker line and the first heading in
every month file and say so in the marker line's neighbouring prose and in
`.claude/skills/work-item/SKILL.md` + the changelog `README.md`: "insert your delta as: heading,
body, blank line — directly under the marker's blank line; the heading that was first stays
untouched". (2) A gate, `scripts/lint-changelog.js`, wired into `scripts/gates.js` (and CI runs
gates): for each `docs/handoff-changelog/2026-MM.md`, (a) the marker line exists once and is
followed by one blank line then a `## YYYY-MM-DD — ` heading; (b) every `## ` heading below the
marker matches `^## \d{4}-\d{2}-\d{2} — .+`; (c) the `## ` count equals the count the README index
row states for that file, and the month file's own header count matches too — so a replaced heading
(count +0 while the index says +1) and a forgotten index (+1 vs +0) both fail. Fix the README
index and the month headers to today's true counts in the same PR (state them). Mutation: delete a
heading → the gate fails naming the file; bump the README count without a delta → fails. (3) Keep
the gate fast (it reads five files).

**Done when:** the gate is in `node scripts/gates.js --list`; the README index and every month
header carry the true counts; the blank-line rule is written where workers read it; both mutations
shown failing. TOOLING-only.

**PM:** lane R · model sonnet · size S · deps — · verify: the two mutations + gates. Filed
2026-09-08 00:3x after the second displaced heading of the night.

## 101. [ ] R-114 (a) — Mantle of the Aspirant's redirect-unwind heal (`47-power.js` ~L306) is a `hea` writer outside the heal-cut gate, declared nowhere: gate it at the emitter (ENGINE-ONLY, F5) (2026-09-13)

**Why:** item 70 (PR #308) gated R-83's three writers and swept for more: the Power tree's Mantle
of the Aspirant "redirect unwind" heals the WEARER back the amount an ally shouldered, writing `hea`
without `edhaHealCutGate`, and it is named in none of the declared lists (R-10's four floors, R-83's
three, `ENGINE_INDEX.md`'s census — now five call sites, pinned by `tests/drop-to-one-family.test.js`).
It is arguably a reversal of a transfer (the wearer ends where it stood before shouldering — R-10's
"a floor / an undo is not regaining" shape) rather than a heal from nothing, which is why it was
filed as ruling **R-114** (board rulings table) rather than fixed. (Filed as R-114, not R-92 — R-92
already names a different, unrelated ruling: the 0-HP "dropped" GM cue, also answered 2026-09-13 —
item 144.)

**What to do:** R-114 (a), answered 2026-09-13 from the phone board: gate it at the emitter exactly
as item 70 did the other three — route the redirect-unwind write through `edhaCrossHeal(owner, amt, {})`
instead of the raw `edhaResourceWrite`; the family census grows 5 → 6 declared call sites, pinned by
a reversion-sensitive case in `tests/drop-to-one-family.test.js` naming the sixth site by hand; one
🤖 row. `46-civilization.js` ~L474 (Colossus raising `max.override` and `value` together) was listed
by the same sweep as a max-HP grant, not a heal — no action.

**Done when:** the gate ships with its pin (withered → 0 and the card names the mark; unmarked
unchanged) shown failing under reversion; the family census names the sixth site.

**PM:** lane B · model opus · size S · deps R-114 ✓ (a, phone 2026-09-13) · verify: the census + the
pin. Filed 2026-09-08 00:3x from item 70's report; renumbered R-92 → R-114 by item 127 (2026-09-13;
R-92 already named a different ruling).

## 102. [x] `scripts/handoff-split.js` regenerates the month headers and the README from its own template — a re-run would drop item 100's blank line, rule sentences, and true counts (2026-09-08, PR #315)

**Why:** item 100 (PR #311, 2026-09-08) put exactly one blank line between each month file's
marker line and its first delta heading, wrote the "insert as heading, body, blank line; bump the
month header count and the README row" rule into each month file's prose and into
`docs/handoff-changelog/README.md`, and set the counts to the real heading totals — all gated by
the new `scripts/lint-changelog.js`. The worker checked `scripts/handoff-split.js` and reported,
not fixed: its `monthHeader()` / `readMonthFile()` (~L60–84) and its README template know nothing
about any of that — a re-run (the next time a delta lands in `EDHA_FOUNDRY_HANDOFF.md` by mistake,
or when a new month starts) would strip the blank line and the rule sentences and rewrite the
counts from its own tally, and the gate would fail on the result.

**What to do:** make the split script's templates emit the blank line and both rule sentences
verbatim (single source: export the sentences from `lint-changelog.js` or a tiny shared module so
the gate and the generator cannot disagree); compute each month's count and date range from the
real headings when it regenerates a header or the README table; refactor `lint-changelog.js` so
its per-file check is callable (`checkMonthFile` / a `lint(dir)` returning errors) and pin: a
fixture handoff run through the split yields month files + README that pass the gate's check;
then the idempotence proof on the real repo — `node scripts/handoff-split.js` → `git status
--short` empty and `node scripts/lint-changelog.js` green — stated in the PR. Do not change any
delta text (verbatim history).

**Done when:** the fixture pin exists and fails if either template drops the blank line or a rule
sentence (mutation); the real-repo re-run is idempotent and the gate stays green; `node
scripts/gates.js` green. TOOLING-only.

**PM:** lane R · model sonnet · size S · deps — · verify: the mutation + the idempotence diff +
gates. Found by item 100; filed 2026-09-08 00:5x.

## 103. [x] `docs/ACTOR_STAT_DERIVATION.md` §1 and its §3 Max-Health row still describe the `+1` that R-54 removed (`EDHA_HP_BONUS` is 0) (2026-09-08, PR #316)

**Why:** item 83's worker (PR #313, 2026-09-08) corrected the senses rows of
`docs/ACTOR_STAT_DERIVATION.md` (§3 / §3a / the mermaid / §6 and a new §3b history table) and
reported, not fixed, that §1's overview and the §3 Max-Health row still say a level-1 PC gets the
Edha `+1` max-HP bonus — R-54 answered (c) "remove the +1" on 2026-09-06 and `EDHA_HP_BONUS` has been
`0` in `module-src/scripts/engine/52-green-instinct.js` since. The doc is the reference CLAUDE.md
tells sessions to read BEFORE touching any derived-stat formula, so a stale +1 there is a trap.

**What to do:** rewrite §1's max-health sentence(s) and the §3 Max-Health row to today's truth —
the system's per-level accumulation plus `EDHA_HP_BONUS` (0 since R-54 (c), 2026-09-06; the
constant stays so a future change is one line), with the R-54 history in one clause — and sweep
the rest of the file for any other `+1` / "11 at STR 0" claim (R-54's own question); leave §3b
(item 83's history table) alone. Cite the engine constant by file. DOCS-ONLY.

**Done when:** `grep -n "+1\|11 max\|+ 1" docs/ACTOR_STAT_DERIVATION.md` shows no live claim of the
bonus (history mentions dated and past-tense are fine, listed in the PR); `node scripts/gates.js`
green (the doc is not a dashboard source — say so if `--check` disagrees).

**PM:** lane R · model sonnet · size S · deps — · verify: the grep before/after. Found by item 83;
filed 2026-09-08 01:1x.

## 104. [x] R-95 (a) — `Momentum's Edge`: retune the rider to `[Tier][Die]` so it resolves at all (DATA + card text, REBUILD leyline) (2026-09-13) — DONE 2026-09-13, PR #337 (fix pass 11)

**Why:** the rider is `bonusFormula: "@movement.walk.rate"`, a DerivedValueField object; Foundry 13's `replaceFormulaData` renders it as rune-wrapped JSON and the Strike's damage roll fails whenever the 20 ft trigger is met (CRITIQUE.md §R-95; ECO-2 predicts case 1). Ben chose (a): fix the resolution and retune the payload to `[Tier][Die]`.

**MEASURED LIVE, bench run 45 (2026-09-13) — ECO-2, case (1) confirmed in full.** `Bench — Red` stamped at turn start and displaced exactly 20 ft toward a hostile dummy, then an impact Strike (Shockwave Slam): the roll threw `Unresolved StringTerm ᚖ{"derived":25,"override":30,"useOverride":true,"bonus":0}ᚖ requested for evaluation` and **posted no card at all** — the whole damage roll is lost, not just the rider, and it is lost **silently** (no chat card, no `ui.notifications`; the rejection only surfaces if you await the promise). Control at 0 ft moved, same target and talent: `floor(2d8 / 2) + ((1 + 2))[Mighty] = 6`, normal card, no rider term. Whatever the fix does, the pin should cover "a rider formula that resolves to an object must not eat the Strike".

**What to do:** in `data/authored/leyline-red.json` change the rider's `bonusFormula` to `(@tier)d(2 * @skills.red.rank + 2)` (the resolution bug disappears with the reference); card text in `data/leyline.json` → "bonus impact damage equal to [Tier][Die]"; keep `whenMovedTowardFt: 20`. Re-point ECO-2 at the new expectation (a `(1)d6`-shaped term on the bar). No engine change.

**Done when:** the formula and card agree, `formula-audit.js` still finds no unresolvable reference, ECO-2 is rewritten, pack rebuilt by Ben.

**PM:** lane R · model sonnet · size S · deps — · verify: formula-audit + the bench row. Filed 2026-09-13 from R-95.

## 105. [x] (2026-09-13, PR #336) R-96 (a) — the minimal-change set for Blue and White: Read Intent to depth 1, Interposing Shield a Special, Shared Burden 1 Investiture, Ordered Advance 1 Action (DATA, REBUILD leyline) (2026-09-13)

**Why:** the ecosystem review's consolidated position, adopted by Ben. The re-parent is proven safe (mutated into `data/leyline.json`: validate + 1085 tests pass; Read Intent depth 1 / L2). Retyping Interposing Shield is engine-safe (the damage-react dispatcher never reads activation type).

**What to do:** `data/leyline.json`: Read Intent `connections: ["Forewarned"]`; Pattern Recognition `connections: ["Calculated Patience", "Read Intent"]`; Interposing Shield `action` → Special; Shared Burden cost → 1 Investiture; Ordered Advance → 1 Action. Mirror in `data/authored/leyline-white.json` (activation cost type `spe`; consume 1; Shared Burden's rule `costValue: 1`; Ordered Advance activation value 1). Bench rows: Pattern Recognition after a Read Intent success; the Special still fires its card; one White mitigation per hit (note the engine posts every matching card — the one-Reaction rule is table-run).

**Done when:** validate + tests green, three 🤖 rows filed, pack rebuilt by Ben.

**PM:** lane R · model sonnet · size S · deps — · verify: validate + the mutation is the shipped data. Filed 2026-09-13 from R-96.

## 106. [ ] R-97 (a) — Sovereignty's Decree zone, as a radius that moves with the arbiter (ENGINE H9 radius mode + DATA, REBUILD deity) (2026-09-13)

> **Card text APPROVED 2026-09-14 09:23 ET (Ben, phone board): "Go with your card text for the Sovereignty items."** — R-119's proposed `Decree of Ruin` text ships as written; nothing on this item waits on Ben. One Opus dispatch: the H9 `target: "radius"` mode + the retrofitted card (REBUILD deity) + the deity guide's worked example.

**Why:** both intent sources promise Decree; no talent creates a zone; Sovereignty scores 13, last by four. Ben chose (a) on R-97. The critique's constraint: `Lay Foundation` and `Ordained Ground` are already the same designate-a-square, so Decree must be a moving radius centred on the arbiter, not a third square. R-119 (a), answered 2026-09-13 from the phone board, names the mechanism: retrofit `Decree of Ruin` onto a new radius mode of H9 (`edha-die-step`) — not the `edha-aura` primitive this item originally pointed at.

**What to do:** build H9's new `target: "radius"` mode (`radiusFt` field, the same turn-start cadence `Bulwark Ground`/`Ordained Ground` use, `allySteps`/`enemySteps` ledger per R-119's full text in `EDHA_RULINGS.md` §K.13) and retrofit `Decree of Ruin` onto it — the mechanism is approved, so the engine build may proceed without a further design pass. **The CARD TEXT is not yet clear to ship**: Ben said in chat on 2026-09-13 that this item waits on his own design text for the card — the phone tap accepted the mechanism, not final wording — so hold `Decree of Ruin`'s player-facing text for his design text or his explicit yes on R-119's proposed text before the data/rebuild half ships.

**Done when:** the H9 radius mode ships with its pin and Sovereignty rolls White somewhere (the guide's own worked example); `Decree of Ruin`'s card text ships only after Ben's design text or his yes on the proposed text.

**PM:** lane B · model opus · size L · deps R-119 ✓ (a, phone 2026-09-13) · verify: the H9 pin, then the bench; card text APPROVED (Ben, phone 2026-09-14 09:23). Filed 2026-09-13 from R-97; design proposal filed as R-119 by item 127 (2026-09-13); mechanism approved via phone board same day, card text approved via phone board 2026-09-14 09:23 — nothing waits on Ben.

## 107. [x] (2026-09-14, PR #374) R-98 (a) — re-aim `False Premise`'s payload so it no longer duplicates Pattern Recognition's next-test disadvantage (DATA, REBUILD leyline) (2026-09-13) — DONE 2026-09-14: `False Premise`'s card text (`data/leyline.json` + `data/authored/leyline-blue.json`) now reads R-115 (a)'s approved text, and its `FalsePremMod0000` rule swapped from `edha-next-test-mod` to the engine's existing `noreactions` timed status (`statusExpire: "target"`, same shape as Hollow Command's `noactions`); `Pattern Recognition` untouched. Pack parity (scratch `edha-leyline`): of 136 leyline-pack documents, exactly one — `False Premise` — differs, zero roll-formula drift anywhere. Pack rebuild + ⟳ Sync Talents is Ben's. 🤖 row FP-1.

**Why:** both rules write `edha-next-test-mod {victim, disadvantage}` and fold to one. Ben chose (a).

**What to do:** R-115 (a), answered 2026-09-13 from the phone board, gives the replacement directly — swap `False Premise`'s success clause for the engine's existing `noreactions` timed status (`EDHA_TIMED_STATUSES`) instead of the duplicate disadvantage; full approved card text in `EDHA_RULINGS.md` §K.13. Ship the authored rule swap + card text.

**Done when:** the approved text ships; the pair no longer collide; one 🤖 row.

**PM:** lane B · model sonnet · size S · deps R-115 ✓ (a, phone 2026-09-13) · verify: the two rules differ. Filed 2026-09-13 from R-98; design proposal filed as R-115 by item 127 (2026-09-13).

## 108. [x] (2026-09-14, PR #375) R-99 (a) — Fate's White, Destruction's Blue and Life's Blue gates get a real job (DATA, REBUILD deity) (2026-09-13) — DONE 2026-09-14: Fate's `Bulwark Ground` `thpFormula`, Destruction's `Cascading Failure` `doubleCaughtFormula` (the overlap-bonus clause only — every other Destruction formula stays on Red), and Life's `Vital Diagnosis` `bonusDamageFormula` now read `@skills.white.rank` / `@skills.blue.rank` / `@skills.blue.rank` instead of the bare `@tier`; card text updated in `data/domain.json` + the authored copies for the two talents that name a rank (Cascading Failure's card never did). `deity-gate-audit.js`: Fate/white 0 → 1 talent, Destruction/blue 1 → 2, Life/blue 1 → 2. Pack parity (scratch `edha-deity`): exactly 3 of 110 documents differ, each in one formula field (+ description copies where the card names a rank), zero other formula diffs anywhere. Pack rebuild + ⟳ Sync Talents is Ben's. 🤖 rows GATE-1/2/3.

**Why:** `deity-gate-audit.js`: Fate's White is read by no talent; Destruction's Blue and Life's Blue by one each. Ben chose (a): a roll, a sized formula, or reach for each; leave the five thin gates alone.

**What to do:** R-118 (a), answered 2026-09-13 from the phone board, gives the three sizing changes directly, all DATA-only: point Fate's `Bulwark Ground` `thpFormula` at `@skills.white.rank`; resize Destruction's `Cascading Failure` overlap-bonus clause onto `@skills.blue.rank`; point Life's `Vital Diagnosis` `bonusDamageFormula` at `@skills.blue.rank` — each with its reworded card line (full text `EDHA_RULINGS.md` §K.13). Ship the three authored formula changes + card text.

**Done when:** each of the three gate colours is read by one more talent than before (R-118 (a)'s scope: one sizing dial per tree — Fate's White 0 → 1, Destruction's Blue 1 → 2, Life's Blue 1 → 2 in `deity-gate-audit.js`); the three cards say the rank; validate + tests green; rows filed; pack rebuilt. _(Reworded 2026-09-14 at PM review: the earlier wording asked Fate's White for "≥ 2 talents or rolled", which one dial cannot reach from zero — the ruling's own scope is what Ben approved.)_

**PM:** lane B · model sonnet · size M · deps R-118 ✓ (a, phone 2026-09-13) · verify: `deity-gate-audit.js`. Filed 2026-09-13 from R-99; design proposal filed as R-118 by item 127 (2026-09-13).

## 109. [ ] R-100 (a) — retune `Final Decree`'s redundant Witness clause; note the two cross-path advantage collisions in the guides (ENGINE-ONLY, F5 + DATA, REBUILD deity) (2026-09-13)

**Why:** Final Decree's Witness advantage is redundant against Order's own Lawkeeper's Eye; Green + Hunter and Order + Power are the two cross-path collisions. Ben chose (a).

**What to do:** R-116 (a), answered 2026-09-13 from the phone board: replace the hardcoded advantage grant in `edhaDecreeResolve` with a free Reactive Strike offer against the violator, reusing the same free-reaction primitive `Expose`/`Weave the Thread`/`Foreknown Strike` already grant (no new primitive); card text updated to match (full text `EDHA_RULINGS.md` §K.13). Plus one authoring note in both revision guides naming the two cross-path collisions (Green + Hunter; Order + Power) — documented, not changed.

**Done when:** card + engine edit shipped; guides carry the note.

**PM:** lane B · model opus · size S · deps R-116 ✓ (a, phone 2026-09-13) · verify: advantage-classify + the engine edit. Filed 2026-09-13 from R-100; design proposal filed as R-116 by item 127 (2026-09-13); model raised sonnet → opus 2026-09-13 — R-116 (a) needs an `edhaDecreeResolve` edit, not pure data.

## 110. [ ] R-102 (a) — `Composed` / `Focused Mind` / `Clear Mind` become one name and one wording across five trees; settle "max and current" (DATA, REBUILD all three packs) (2026-09-13)

**Why:** one talent under three names; Envoy's copy adds "and current". Ben chose (a).

**What to do:** pick the name (Composed is the majority), one wording, one answer on max-vs-current (recommend max only — the AE shape); rename in `data/cosmere.json` / `leyline.json`, the authored overlays (docIds change with the name — check every `connections` and prose prereq that names the old ones; iron rule 7), the bench roster if it lists one.

**Done when:** one name in the data; validate + lint green; prereqs still resolve.

**PM:** lane R · model sonnet · size M · deps — · verify: shared-talents.js shows one name. Filed 2026-09-13 from R-102.

## 111. [x] (2026-09-13, PR #349) R-104 (a) — the prose pass: path descriptions and both revision guides say what each tree actually is (DOCS + DATA text, REBUILD for the description field) (2026-09-13) — DONE 2026-09-13, PR #349 (Ben approved every draft opening in `TREE-INTENT.md` in one pass; all 21 descriptions, both guides’ PART 4, primer regenerated; checklist rows 111-1 / 111-2 prove the rebuilt packs carry it)

**Why:** twenty of twenty-one trees are PARTIAL or DRIFTED against their prose; the heroic path descriptions are still verbatim Roshar ("Roshar is a world riven by conflict", "Available in the Stormlight Handbook"). Ben chose (a).

**What to do:** tree by tree, rewrite `data/path-descriptions.json` from **`docs/analysis/talent-ecosystem/TREE-INTENT.md`** (the readable per-tree intent read of 2026-09-13 — every tree's *what the talents do / how it plays / specialties as built / where the prose is wrong / draft opening*; it supersedes the raw `profiles/`, three of which are stale against the cards), Edha-generic, no nation-specific hooks; then the guides' identity sections. Batch by atlas for Ben's yes (lore approval gate) — the file's closing section gives the order (heroic → leyline → deity) and lists what the prose must NOT promise until items 106 / 108 land.

**Done when:** every description names the tree the talents deliver; the six heroic descriptions carry no Roshar.

**PM:** lane B · model sonnet · size L · deps approval per batch · verify: read-through. Filed 2026-09-13 from R-104.

## 112. [x] (2026-09-13, PR #334) R-105 (c) + R-108 (a) + R-110 (d) + R-111 (b) — the guides record the four decisions; two cards gain the cancel line (DOCS + two cards, REBUILD heroic) (2026-09-13)

**Why:** four answers that are documentation plus one line on two cards: the heroic-vs-leyline tier trade is accepted (with the critique's per-Action parity arithmetic); the deity Special target is restated and nothing converted yet; `Fatal Thrust` and `Defensive Position` keep "two" and gain "advantages and disadvantages cancel one-for-one; roll with whatever remains", plus a guide note that the engine folds two-against-one to nothing and these two are played by hand; `Withering Ray` stays and is written into the guides as the leyline damage ceiling.

**What to do:** `.claude/skills/leyline-revision-guide/SKILL.md` and `deity-revision-guide/SKILL.md` sections; the session-zero material for the tier trade; the two heroic cards in `data/cosmere.json` + the authored overlays' descriptions.

**Done when:** the four decisions are findable in the guides; the two cards carry the line.

**PM:** lane R · model sonnet · size S · deps — · verify: read-through + lint. Filed 2026-09-13 from R-105/R-108/R-110/R-111.

## 113. [ ] R-107 (a) — Temp HP unifies on keep-the-higher: route Life Surge, Overgrowth and Spoils of Isolation through `edhaGrantTempHpCross`; fix the header; pin the Life Surge case (ENGINE-ONLY, F5) (2026-09-13)

**Why:** two writers disagree (`28-temporary-hp.js:6` vs `:13`); heal overflow (`03-where-an-effect-lives.js:882`) and `thpFromTotal` (`53-native-event-system.js:3071`) overwrite a larger pool. Ben chose (a).

**What to do:** the two call sites → `edhaGrantTempHpCross`; the single-target `thp` effect path (`33:237`) and the non-victim `edha-temp-hp` path (`53:61`) likewise; header line 13 rewritten; a test in `tests/` (held 6, overflow 3 → still 6); ECO-1 re-pointed to expect the pool to survive.

**Done when:** every Temp HP write keeps the higher; the pin fails under reversion.

**PM:** lane B · model opus · size S · deps — · verify: the pin + ECO-1. Filed 2026-09-13 from R-107.

## 114. [ ] R-109 (a) — repair `Trade Routes` so it works with one Foundation; write `Forge Construct`'s flat 1 into its card (ENGINE-ONLY, F5 + DATA, REBUILD deity) (2026-09-13)

**Why:** `Trade Routes` reads "choose two of your active Foundations" while the tier cap allows one until level 6 — uncastable for the whole current level range. Ben chose (a): keep the cap, fix the talent.

**What to do:** R-117 (a), answered 2026-09-13 from the phone board: reword `Trade Routes` to link one active Foundation to a point in Attunement Range (full card text `EDHA_RULINGS.md` §K.13); `edhaZoneLink` gains a second mode that captures a raw canvas point as the other end of the link-ledger entry (today it only pairs two existing zone-ledger entries). `Forge Construct`'s "one active Construct" cap is confirmed deliberate — no action there.

**Done when:** a level-2 Civilization character can cast `Trade Routes`; the engine mode + text ship.

**PM:** lane B · model opus · size S · deps R-117 ✓ (a, phone 2026-09-13) · verify: read-through + the engine pin. Filed 2026-09-13 from R-109; design proposal filed as R-117 by item 127 (2026-09-13); model raised sonnet → opus 2026-09-13 — R-117 (a) needs a new `edhaZoneLink` mode, not pure data.

## 115. [ ] Handoff §9k — the four generic primitives that make the Leybreaker / Ley-surveyor cue cards live (ENGINE-ONLY, F5) (2026-09-13)

**Why:** PR #329 shipped fourteen talents; nine of their clauses post cue cards because no primitive covers them: a Draw Mana / activation watch, an Attunement-rank marker, a Draw Mana marker, and `whileStanceActive` on `edha-damage-rider`. Each is one small generic handler (iron rule 2a).

**What to do:** build the four in that order, each with a pin and a 🤖 row, then switch the affected talents' cue rules to the real handlers (data change → rebuild).

**Done when:** HS-3, HS-6, HS-10's cue cards are replaced by engine effects; §9k rows ticked.

**PM:** lane B · model opus · size M · deps — · verify: the pins + the HS rows. Filed 2026-09-13 from the specialty swap.

## 116. [x] (2026-09-13, PR #331) The phone board becomes three tabs (Overview · Bench rows · Needs Ben); the deploy banner and the full dashboard mirror stop swallowing the page (TOOLING + PM republish) (2026-09-13)

**Why:** Ben (chat, 2026-09-13): *"the 'deployed' section is gigantic and taking up the whole artifact. Really the artifact just needs a tab for bench rows, a tab for 'needs Ben' and an overview of the project tab."* `mobileSnapshot()` shipped EVERY prose block of the checklist's `# ⚑ DEPLOY STATE` section (27 blocks, ~24 KB of history) as `deploy.prose`, and the page mirrored the whole desktop dashboard (every tab, section and row — six ~200 KB chunk documents, a 1.47 MB injected page) under a "More" toggle nobody could read on a phone.

**What to do:** `mobileSnapshot()` projects the deploy section to ONE bounded line (`{ title, line, owed[≤3] }`, never the prose) and puts each mirror ref's row text and each open ruling's card text on the index; `pm-state.js` writes `dash/index` alone (no chunks, cap-checked); the page is rebuilt as three tabs — Overview (PM state + worker clock, snapshot tiles, the deploy line, budget window, queue, run-log tail), Bench rows (the 🤖 queue grouped by section with deploy chips), Needs Ben (ruling cards, asks, every ⚑ row, the inbox) — keeping item 94's Sent ✓ / Recorded by PM ✓ behaviour. Pin the deploy bound and the index shape in `tests/`.

**Done when:** the injected page and `dash/index` are a fraction of their former size (numbers in the PR), three phone-viewport screenshots show the tabs, the PM skill's mobile-board section matches the one-document contract, gates green.

**PM:** lane R · model fable (Ben authorized, chat 2026-09-13) · size M · deps — · verify: the screenshots + the size numbers, then REPUBLISH the artifact (`--inject` → `Artifact(url)`) and push the new `dash/index`. Filed 2026-09-13 by the worker (the PM had no PR to file it on).

## 117. [x] (2026-09-13, PR #333) `parseBenOnly` reads "Waiting on Ben" text from the REPLACED session-of-record lines, so the phone's "Yours to do" cards resurrect answered asks (TOOLING + test pin) (2026-09-13)

**Why:** Reviewing item 116's Needs Ben screenshot on 2026-09-13, the two "Yours to do" cards were R-56 (answered 09-07; item 83 merged #313) and "ONE deploy-to-foundry.bat run tomorrow for items 92 + 93" (Ben ran it 09-07 21:52) — both from the 09-07 19:56 session line that the board keeps only as _(The line this replaces, for the record:)_ history. `scripts/pm-state.js parseBenOnly()` scans the whole session-of-record blockquote, so every superseded line's **Waiting on Ben:** text is projected as a live ask with a Done button, while the current line says "Waiting on Ben: nothing."

**What to do:** scope `parseBenOnly()` (and any sibling that reads "Waiting on Ben" / "Still owed by Ben" / "Ben owes") to the FIRST session-of-record paragraph only — the text before the first `_(The line this replaces` marker; pin it with a fixture carrying a current line with no asks and a replaced line with two, expecting `[]`, and the reversion shown failing; regenerate `docs/pm-state.json`.

**Done when:** the pin passes and fails on the reversion; `node scripts/pm-state.js` on the real board yields zero Ben-only asks while the current line says nothing is waiting; the PM pushes `pm/state`.

**PM:** lane R · model sonnet · size S · deps 116 ✓ · verify: the pin + a real-board run. Filed 2026-09-13 by the PM at item 116's review.
## 118. [x] Four Leybreaker / Ley-surveyor cue cards print the talent name twice (DATA, REBUILD heroic + ⟳ Sync) (2026-09-13) — DONE 2026-09-13, PR #337 (fix pass 11)

**Why:** `edha-note` already prefixes its card with the icon and the talent's name, so a rule whose own `text` also opens with `<strong><name></strong>:` renders it twice. Measured live at bench run 45: *"📍 **Mark the Ground**: **Mark the Ground**: for the scene…"*. A sweep of every `handler.text` in `data/authored/` found **exactly four**, all from PR #329 — `Stillstance` and `Saltstance` (`heroic-warrior.json`), `Mark the Ground` and `Steady the Line` (`heroic-scholar.json`). The other 37 note/cue rules in the repo are clean, so this is a new regression, not the house style.

**What to do:** strip the leading `<strong><name></strong>: ` from those four `handler.text` values. Nothing else changes — the cards are otherwise correct and were verified firing (HS-10).

**Done when:** the sweep reports 0; a rebuilt heroic pack's four cards read *"🧂 **Saltstance**: your Strikes deal…"* once.

**PM:** lane B · model sonnet · size XS · deps — · verify: the sweep + one bench read. Filed 2026-09-13 from bench run 45.

## 119. [x] `The Reckoning`'s Unbreakable Line costs 3 Focus against a pool that maxes at 2 — and a failed consume is a silent no-op (DATA + ENGINE) (2026-09-13) — **ENGINE half DONE 2026-09-13, PR #337** (fix pass 11: the refusal is now announced by name, in a toast and in the console, by `edhaCostShortfalls`/`edhaShortfallText` + a `preUseItem` announcer that never vetoes; `edhaConsumeCost` retrofitted onto the same sentence). **DATA half DONE 2026-09-13, PR #339** (R-112 (a): `data/adversaries.json`'s `foc` 2 → 3, Unbreakable Line's cue text aligned across both blocks — REBUILD adversaries + ⟳ Sync Adversaries owed). Item 119 is fully closed.

**Why:** bench run 45 drove item 89's new `use → edha-def-test` rule on both Unbreakable Line blocks. It works on the Crownox Ring (focus max 3). On `The Reckoning` the ability consumes **3 Focus** while its `resources.foc.max.override` is **2**, so it can never be paid — and `item.use()` then produces **nothing at all**: no chat card, no `ui.notifications` warning, no console line. The first take read exactly like a dead ability; raising the pool to 5 made the identical take work and consumed exactly 3. Item 89 copied the Crownox cost onto a block whose stat line cannot pay it, and the Reckoning's own cue text never promises a focus cost ("the lead may test White (DC = half the damage)").

**What to do:** the cost/pool half is a design call — filed as **R-112** (default (a): raise The Reckoning's focus pool to 3, keeping the two blocks' shared ability identical); apply Ben's answer to `data/adversaries.json` and align the cue text, which currently promises a cost on the Ring and none on the Reckoning. The silent half needs no ruling: make a failed `consume` visible — `edhaConsumeCost` should post a `ui.notifications.warn` naming the resource and the shortfall, so a GM never sees a button do nothing.

**Done when:** both blocks can actually pay their own ability; a deliberately underfunded use prints a warning instead of silence; a bench row re-drives The Reckoning without hand-editing its pool.

**PM:** lane B · model sonnet · size S · deps — · verify: a bench re-drive of the Reckoning row. Filed 2026-09-13 from bench run 45.

## 120. [x] A gated `edha-regen` cue card still prints its static "regains N HP" note beside "no healing lands" (ENGINE-ONLY, F5) (2026-09-13) — DONE 2026-09-13, PR #337 (fix pass 11)

**Why:** item 70 gated the regen tick at its emitter and item 68's contract says a heal card is built from what was DELIVERED. The `edha-regen` sweep honours that in its parenthetical but not in its body: it posts the rule's `note` in preference to the composed `line` (`h.note || line`), so a rule that carries its own `note` wins and the card reads *"⏰ Nexus-Fed (B45 Garden Sow): **Nexus-Fed — the Sow regains 5 HP.** (no HP applied — B45 Garden Sow cannot regain HP (Withering Touch) — no healing lands.)"* — measured live at bench run 45. The GM reads "regains 5 HP" first. 70-1's Apex Form card composes from `line` and is correct, which is why only the adversary side shows it.

**What to do:** in `module-src/scripts/engine/07-edha-owner-list.js`'s `edha-regen` sweep, prefer the gate's `line` over the rule's static `note` when the delivered amount is less than the rolled one (or suppress the static note entirely on a gated tick). Pin it in `tests/`.

**Done when:** a withered Nexus-Fed tick's card carries no un-gated number; the ungated tick's card is unchanged.

**PM:** lane B · model sonnet · size XS · deps — · verify: the pin + a bench re-drive of 70-2. Filed 2026-09-13 from bench run 45.

## 121. [~] Bestiary redo (Ben, 2026-09-13) — SCOPED 2026-09-14 with Ben; the standard, the census and the rulings menu LANDED; **all eight rulings ANSWERED (a) the same night** — R-130 / R-133 / R-128's build support landed (157, 159, 160); the pass runs 155 → 156 → 158

**Why:** Ben (chat, 2026-09-13): *"The bestiary 'how does this feel' items can all be shelved. We are going to redo the bestiary later."* Five ⚑ feel rows in `EDHA_FOUNDRY_TEST_CHECKLIST.md` (Cold-Fire Cinderbrock's PITIABLE read, Heat of the Flats' SHADE negation, Dirgehounds pack-or-mob, Crownox ring-integrity, Tollbird swarm bookkeeping) were shelved by item 119's PR rather than answered, because the bestiary itself is getting a broader pass, not a row-by-row fix.

**Scoping (Ben + a Fable session, 2026-09-14 — Ben: *"This looks good. Continue."*):** the redo runs in three parts, in this order — (1) a **standards-and-tooling pass** (no skill owned the numbers: item 82 opened with "find where the bestiary statting standard lives" and the answer was nowhere; four skills each held one layer), (2) a **numbers pass against THIS party** (Blue / White / Green, two Scholars and an Envoy, no fighter — measured first, retuned only on bench evidence, since session 1 is unplayed and no table evidence exists), then (3) a **content pass nation by nation** behind the statblock gate. The talent ecosystem review's method — measured ground truth in scripts, then rulings with recommended defaults — is the model; R-101 (a) is the licence to read adversary numbers as a yardstick.

**What landed 2026-09-14 (the scoping session's branch):** the `bestiary-forge` skill (item 154: SKILL.md the loop, STANDARD.md with every line RULED / MEASURED / PENDING, DESIGN_SEEDS.md the backlog R-76 asked for, TURN_LEDGER.md the yardstick recording template); the census (item 153: `scripts/bestiary-census.js` → `docs/analysis/bestiary/CENSUS.md`, sync-tested); pointers from lore-forge 4c, session-forge, tree-authoring, ENGINE_INDEX, CLAUDE.md and the handoff, with three stale lines fixed (the "pending" retro sweep that ran 07-20; two ENGINE_INDEX lines still reading TIER for role rank; the data `_README`'s cheatsheet purpose line and its 10-ft senses note); rulings **R-128 … R-135** in `EDHA_RULINGS.md` §G.1 with board rows for the phone.

**What to do next (the sub-items):** **155** the yardstick fights (🤖 — needs no ruling; runs first per R-135 (a)); **156** the nation-by-nation data pass (unblocked: R-128, R-129, R-134, R-135 all answered (a) 2026-09-14; waits only for 155's ledgers); **157** the legacy nine — DONE 2026-09-14 (R-130 (a)); **158** invested-human adversaries (R-131 (a): rides each nation pass, lore gate first); **159** the three shelved card rules — DONE 2026-09-14 (R-133 (a)); **160** the build's `attributes` support — DONE 2026-09-14 (R-128 (a)). R-132 (a) is recorded as canon ruling 164 (DOCS-ONLY). Item 82 is closed as absorbed: its standard line is STANDARD.md §2 and R-128 (a) made its value batch an attributes pass per nation.

**Done when:** every sub-item is done or explicitly parked by Ben; the five shelved feel rows are retired on card text (R-133's three) or re-opened after session play (the two feel rows); the census is green against the final data and its bands are inside R-134's targets or say why not.

**PM:** lane H · model per sub-item · size L as a programme · deps NONE open (R-128 … R-135 answered 2026-09-14) · PR #386 carries items 153 + 154; PR #387 carries 157, 159, 160 and owes an adversaries REBUILD + ⟳ Sync.


## 122. [x] (2026-09-13, PR #340) The agent-run deploy cycle becomes ONE gated script with guardrails, verification and tests (TOOLING + DOCS) (2026-09-13) — script + guards + tests shipped; the PM's first LIVE `--yes` run (🤖 row, `EDHA_FOUNDRY_TEST_CHECKLIST.md`) is the outstanding verify step

**Why:** Ben, chat 2026-09-13, verbatim: *"I'm confirming that there's no way for you to close Foundry, run the deploy.bat, reopen Foundry, and log in to the GM bench profile? … I would love if you could handle that for me."* The PM ran that cycle by hand at 14:41 ET as an ad-hoc shell chain (`docs/PM_BOARD.md` run log) reproducing `scripts/deploy-to-foundry.bat` steps 1–8 with its `pause` prompts skipped, plus a graceful close beforehand and a relaunch + verification afterward — and it worked. Ben's follow-up: *"I'm confirming that this means the full bench loop doesn't need me anymore? Can we test and write a few gates and guardrails that are needed (if that's not already been done)."* An ad-hoc shell chain typed once by an agent is not a repeatable, testable tool — it has no guards, no backups, and nothing pins its behaviour.

**What to do:** `scripts/deploy-cycle.js` (node; PowerShell only for process control) with `--dry-run` (prints every step + every guard's verdict, changes nothing) and `--yes` (runs it), plus `--force-bench` / `--exe` / `--wait-seconds`. Pre-flight guards as named pure functions in `scripts/lib/deploy-guards.js`: on `main`, clean, not behind `origin/main` after the pull; `module-src-sync.js status` not hand-edited (exit 2 refuses); no PM worker holding the table (`docs/pm-live.json`, overridable by `--force-bench`); the five pack dirs exist; `Config/options.json` names a world; the Foundry exe exists. Timestamped backups under `tmp/deploy-backups/` before anything is overwritten, with a printed restore command. The eight bat steps, fail-fast, logged to `tmp/deploy-logs/`. Post-flight verification: pack stamps newer than the run's start, served engine sha256 == HEAD's (CRLF-normalised), `/` → `/join` names the world. A dated DEPLOY STATE record line, printed and appended to the checklist. Tests pin every guard/verifier against fixtures plus a `--dry-run` smoke test (no process control in CI — the live run is the PM's own 🤖 row).

**Done when:** every guard/verifier is proven refusing on its fixture and passing on the clean one; `--dry-run` prints the full plan and changes nothing; all gates pass; the docs list (runbook, CLAUDE.md, project-manager + bench-run skills, scripts/README.md, checklist, changelog) are updated.

**PM:** lane R · model sonnet · size M · deps — · verify: the PM's first live `--yes` run (🤖 row). Filed 2026-09-13 from Ben's chat request.

## 123. [x] `edha.syncAllAdversaries()` is not bench-safe: it rewrites every world adversary and pushes prototype token fields onto EVERY scene, including a live combat (ENGINE, F5) — DONE 2026-09-13, PR #345 (R-113 (a): scope/dry-run/started-combat-refusal guard, ENGINE-ONLY F5)

**Why:** bench run 46 (2026-09-13) was briefed to run `⟳ Sync Adversaries from Pack` as a step-zero refresh after the 14:41 adversaries rebuild, and **declined after reading the source** — the call run 45 learned to make before any world-wide `edha.*` helper. `edhaSyncAllAdversaries` (`module-src/scripts/engine/27-adversary-pack-sync.js:84`) is an unfiltered `game.actors.filter(a => a.type === "adversary")` loop, and for each match `edhaSyncAdversaryActor` replaces `system` **wholesale** (`{recursive: false, diff: false}`) and then walks **`for (const scene of game.scenes)`** pushing the prototype's `texture / sight / disposition / displayName / displayBars / bar1 / bar2 / width / height` onto every token of that actor on every scene. At that moment the world held **42 world adversaries** and a **live, started combat** (`r4j178xQ2X77c1eQ`, 7 combatants, round 1 turn 3) on a scene the bench has no licence for — **"Playtest Map (Copy)"**, which is not the licensed "Playtest Map" — including a Cinderhound sitting at 6/14 HP mid-fight, beside Ishee, Tem parinaem and Soggy Bottom. Unlinked-token HP lives in the delta and would have survived; the token-level display/vision/size fields and all 42 base `system` blocks would not. This is exactly the `edha.fixPcTokens()` shape run 45 filed, one document up: a helper written as *Ben's* post-deploy button, with no scope filter, no dry-run, and no way for a caller to say "only these". **Nothing was lost this run** — the bench's rows used fresh pack imports, which read the pack directly, and neither `The Reckoning` nor `Crownox Ring` exists as a world actor at all, so the sync would have been a no-op for the very blocks it was requested for.

**What to do:** give the bulk path a scope and a preview, and stop briefing agents to call the unscoped one. Suggested shape, pending **R-113**: `edhaSyncAllAdversaries({ folder, actorIds, scenes, dryRun })` — default `dryRun` when called from the console API, printing the actor list and the per-scene token counts it *would* write before it writes them; a `scenes` filter so a caller can refresh the bench scene without touching a scene holding someone else's combat; and a refusal (or at minimum a named warning) when any candidate token belongs to a **started** combat. Keep Ben's sheet button and his all-in bulk button behaving exactly as they do today — this is about what an *agent* can call, not about changing his workflow.

**Done when:** the scoped call is pinned in `tests/` (a fixture proving the filter excludes a non-listed scene and that a started combat is refused/announced), the unscoped behaviour is unchanged for Ben's buttons, and `docs/EDHA_BENCH_RUNBOOK.md` + `.claude/skills/bench-run/SKILL.md` carry the rule that a bench run never calls a world-wide `edha.*` mutator without reading it for an unfiltered `game.actors` / `game.scenes` loop first.

**PM:** lane R · model sonnet · size S · deps **R-113** (does the bulk button gain the guard, or does the rule stay "Ben's hands only"?). Filed 2026-09-13 from bench run 46.

## 124. [x] (2026-09-13, PR #352) A fully-blocked `edha-regen` cue card prints the same sentence twice (ENGINE-ONLY, F5)

**Why:** bench run 46 (2026-09-13) retired item 120's three Nexus-Fed rows on evidence — the gated tick correctly drops its static note, and the unmarked control correctly keeps it — but the fully-blocked card now reads the composed sentence **twice**: *"⏰ Nexus-Fed (B46 Garden Sow): B46 Garden Sow cannot regain HP (Withering Touch) — no healing lands. **(no HP applied — B46 Garden Sow cannot regain HP (Withering Touch) — no healing lands.)**"*. The cause is the two halves of the call site meeting (`module-src/scripts/engine/07-edha-owner-list.js:462`): `edhaDeliveredNote` returns `line` as the note whenever `got < asked`, and the very next line hands `edhaPostCueCard` a suffix built from the **same** `line` — ` <em>(no HP applied — ${line}.)</em>`. The halved case does not duplicate, because its suffix is the `+N HP applied` clause instead. Cosmetic only: HP, gating and the "no number at all" contract are all correct, which is why the rows retired rather than failed.

**What to do:** make the blocked suffix stop repeating the sentence the note already carries — the parenthetical only needs to say that nothing landed (e.g. ` <em>(no HP applied.)</em>`) when the note IS the delivered line, while an un-gated tick keeps ` <em>(+N HP applied, end of turn.)</em>` unchanged. Check the other `edhaDeliveredNote` call sites for the same pairing before fixing just this one.

**Done when:** the blocked card names the mark once; `tests/gated-note.test.js` gains a case pinning that the note and the suffix never repeat the same sentence; the unmarked and halved cards are byte-identical to what bench 46 recorded.

**PM:** lane R · model sonnet · size S · deps —. Filed 2026-09-13 from bench run 46.

## 125. [x] (2026-09-13, PR #358) `deploy-cycle.js`'s no-bench-worker guard reads only the checkout's tracked overlay, which lags the PM's board branch — it must also read `git worktree list` and local `pm/bench-*` branches (TOOLING + test pin) (2026-09-13)

**Why:** at item 122's review the PM dry-ran the script twice. From the main checkout (board branch, live `docs/pm-live.json`) it refused naming bench-46. From a worktree it PASSED the same guard while bench 46 was mid-run — that checkout's `docs/pm-live.json` was `main`'s, and `main` only carries the overlay as of the last merged board PR. The guard is therefore only as fresh as the checkout it runs from, and a PM that has not yet landed its board PR (the normal state mid-shift) could close Foundry under a live bench.

**What to do:** `checkNoBenchWorker` gains a second, checkout-independent signal: the output of `git worktree list --porcelain` (any worktree on a `pm/bench-*` branch) and `git branch --list 'pm/bench-*'` unmerged into `origin/main`; either one refuses exactly like a lane-B worker on the overlay, with the same `--force-bench` override. Keep it PURE — the orchestrator gathers the two lists, the guard decides — and pin both signals in `tests/deploy-cycle.test.js` (a worktree line → refuse; a merged branch → pass).

**Done when:** the pin passes and fails on the reversion; a dry run from a fresh worktree while a `pm/bench-*` worktree exists refuses.

**PM:** lane R · model sonnet · size XS · deps 122 ✓ · verify: the pin + a dry run. Filed 2026-09-13 by the PM at item 122's review.

## 126. [ ] `scripts/README.md` misses three tracked scripts — `build-levelup-guides.py`, `levelup-guides-prose.json`, `validate-build.py` (DOCS-ONLY) (2026-09-13)

**Why:** item 122's worker ran `node scripts/check-scripts-readme.js` and it reported the drift; the three files landed with build-forge (2026-09-09) without README rows. The verifier is a gate candidate that is not wired (item 21), so nothing failed.

**What to do:** add the three rows in the table's shape (one line each: what it is, who runs it); consider wiring `check-scripts-readme.js` into `scripts/gates.js` so the drift cannot recur — if you do, the gate count in the work-item skill and the board's gate references bump too.

**Done when:** `node scripts/check-scripts-readme.js` reports clean; the gate decision is recorded either way.

**PM:** lane R · model sonnet · size XS · deps — · verify: the verifier's output. Filed 2026-09-13 by the PM from item 122's report.

## 127. [x] (2026-09-13, PR #347) Design proposals for items 101 / 106 / 107 / 108 / 109 / 114 filed as rulings R-114 … R-119 (DOCS-ONLY) (2026-09-13)

**Why:** items 101, 106, 107, 108, 109 and 114 each named a design proposal as their blocking
dependency rather than a concrete question Ben could answer from his phone — item 101's heading
even cited a phantom "R-92" (R-92 already names a different, unrelated, already-open ruling: the
0-HP "dropped" GM cue). Filing each as a full WAITING ruling — concrete options, the deploy class
of every option, a recommended default — lets Ben answer all six from the mobile board in one
sitting instead of six separate design conversations.

**What to do:** `EDHA_RULINGS.md` §L gets R-114 … R-119, one per queued item, each with a
recommended default, the deploy class of every option, and an `Ask:` line; item 101's heading and
PM deps line move off the phantom "R-92" onto R-114; items 106/107/108/109/114's PM deps lines
move from "design gate"/"design yes" onto their new ruling ids (R-119/R-115/R-118/R-116/R-117);
`CLAUDE.md`'s rulings-doc row updates its count and "no gaps" span from 113 to 119 and records the
six new open rulings; `tests/pm-state.test.js`'s `ECOSYSTEM_RULINGS` pin lists the six new WAITING
ids so the open-rulings shape contract still passes; a dated delta and the dashboard rebuild close
it out. DOCS-ONLY — no data, engine or card change; every proposal is a PROPOSAL awaiting Ben's yes
(lore-forge Phase 3: approval precedes every content commit).

**Done when:** `grep -c '^\*\*R-[0-9]' EDHA_RULINGS.md` reads 119; all six new rulings parse as
open with an `ask` ending in `?` and a `default` (verified via `parseOpenRulings`); `node
scripts/gates.js` green.

**PM:** lane R · model sonnet · size S · deps — · verify: the parse check + gates. Filed 2026-09-13
by the PM as the design-proposal batch items 101/106/107/108/109/114 were waiting on.

## 128. [x] (2026-09-13, PR #362) The bench may CREATE its own scenes for test runs (Ben, 2026-09-13) — write the licence into the bench skill and runbook, and give the roster script a standing Bench Arena (DOCS + TOOLING) (2026-09-13)

**Why:** Ben, phone board 2026-09-13 16:13 ET, on R-113: *"a. I also need to give permission to create new scenes specifically for future test bench runs."* Today the bench's licence is the existing "Playtest Map" (PM-R13, widened 2026-09-06) and it stays off every other scene — bench run 46 found Ben's live combat on "Playtest Map (Copy)" and rightly refused to touch it. A bench-owned scene removes the collision for good: the bench creates and uses its own, and Ben's scenes are never in scope.

**What to do:** `.claude/skills/bench-run/SKILL.md` hard rules 3 / 4 and `docs/EDHA_BENCH_RUNBOOK.md`: a bench run may create scenes named `Bench — <purpose>` (e.g. a standing `Bench Arena`), VIEW them, place its tokens there, and delete what it created; it still never activates or deactivates a scene (that yanks every client) and never touches a scene it did not create except the licensed "Playtest Map". `scripts/bench-setup-console.js`: an optional step that creates (or finds) the standing `Bench Arena` scene from a small fixed spec (grid, dimensions, a plain background) and places the roster there instead of on the Playtest Map when `USE_ARENA = true`; idempotent (re-run finds, never duplicates); the snapshot/cleanup convention records the scene id. The scoped adversary sync (item 123) then targets the arena's scene id. One 🤖 row: create the arena, place the roster, run one row, clean up — with the Playtest Map and every Ben scene byte-identical before/after.

**Done when:** the skill + runbook carry the licence with Ben's words; the roster script creates the arena idempotently (a headless pin on the pure spec/plan if any); the 🤖 row is filed.

**PM:** lane B · model sonnet · size S · deps — · verify: the pin + the row. Filed 2026-09-13 by the PM from the phone inbox (PM-R19).

## 129. [x] (2026-09-13, PR #355) `deploy-cycle.js` backs up the packs BEFORE closing Foundry, so the first live run died on the LevelDB `LOCK` file (EBUSY) — back up after the close, skip lock files, and pin the step order (TOOLING + test pin) (2026-09-13) — script + guards + tests shipped; the PM's next live `--yes` run (🤖 row, `EDHA_FOUNDRY_TEST_CHECKLIST.md`) is the outstanding verify step

**Why:** the first live `node scripts/deploy-cycle.js --yes` (PM, 2026-09-13 19:41 ET, every guard PASS) threw `EBUSY: resource busy or locked, copyfile '…\\packs\\edha-leyline\\LOCK'` inside `backupPacks()` (`scripts/deploy-cycle.js:232`), which `main()` calls BEFORE step 1 (close Foundry). A running Foundry holds each pack's LevelDB `LOCK`; the copy cannot read it. The failure was SAFE — nothing had been written, Foundry stayed up — but the run did no work, and the stack trace was raw rather than the script's own "step N failed + restore command" message.

**What to do:** (1) move `backupPacks()` to AFTER the close step succeeds (the packs are only readable then) and before any write; (2) make `copyDirRecursive` skip `LOCK` (and any file that throws EBUSY, logging it) — a LevelDB backup does not need the lock file; (3) wrap the backup in the same fail-fast handling as the steps so a failure prints the step name and, since nothing was written yet, says so instead of a stack trace; (4) pin the order with a pure "plan" or a smoke test that asserts the close step precedes the backup in the step list, and a unit test that `copyDirRecursive` skips `LOCK`. Then re-run `--dry-run`; the PM does the next `--yes`.

**Done when:** the pins pass and fail on the reversion; `--dry-run` lists "backup" after "close"; the PM's next live run gets past the backup.

**PM:** lane R · model sonnet · size XS · deps 122 ✓ · verify: the pins + the PM's next live run (the item-122 🤖 row stays open until then). Filed 2026-09-13 by the PM from the first live run.

## 137. [x] (2026-09-13, PR #358) `deploy-cycle.js`'s post-flight verification races Foundry's boot (TOOLING + test pin) (2026-09-13)

**Why:** another session's live run on 2026-09-13 ~20:05 ET (its worktree `docs/deploy-record-2026-09-14`, DEPLOY STATE note) ran all eight steps green from a worktree on `main`, but its post-flight fetch raced Foundry's boot — served engine `24d74c96…` == HEAD and `/` → `/join` both had to be verified by hand two minutes later. The relaunch step's poll only waits for `/` to answer 302; Foundry answers that redirect before the world and module files are fully served, so the immediate post-flight fetch of `/modules/edha-content/scripts/register-skills.js` (and possibly `/join`'s title check) can fail or return a partial body.

**What to do:** `postFlightVerify` retries the engine fetch and the `/join` title check with a bounded backoff until `--wait-seconds` (default 90) elapses — a fetch that errors, times out, returns a non-200, or a body whose sha does not match HEAD's is a *retry*, not a FAIL, until the deadline; only then FAIL with the last observed status/sha. Pure decision `shouldRetryVerify({status, body, expectedSha, elapsed, deadline})` in the guards module, pinned: a 404 at 5 s → retry; a wrong sha at 10 s → retry; the right sha → pass; a wrong sha at the deadline → fail. Say in the runbook's agent-run-deploy section that the verification waits up to `--wait-seconds`.

**Done when:** the pins pass and fail on the reversion; `--dry-run` still lists every step and names the `--wait-seconds` bound on the post-flight description.

**PM:** lane R · model sonnet · size XS · deps 122 ✓ · verify: the pins + the PM's next live run. Filed 2026-09-13 by the PM from the other session's 20:05 deploy record.

## 130. [x] (2026-09-14, PR #366) R-120 (b) — `Predatory Strike` deals one `[Tier][Die]` plus Tier per Insight; `Killing Blow` and `The Final Study` keep the multiplier (DATA + authored formula, REBUILD deity) (2026-09-13) — DONE 2026-09-14 after Ben's re-read of the per-talent curve ("Let's do the B reshape for Knowledge, then. I agree."). The rider formula and all card copies reshaped; the cash-outs untouched. **Left open in this item: the decoy item-level `damage` formulas on the three cards** (a double-count surface the verifier flagged) — they still carry their chat note; removing them needs a build + validate-packs check. 🤖 row KM-1.

> **Held 2026-09-14 pending Ben's re-read.** Ben questioned the finding ("taking every talent in the Knowledge tree, right? … what's the damage curve per-talent-taken?"). The answer is in `docs/analysis/talent-ecosystem/balance-per-talent.js` / `BALANCE-REVIEW.md` §2: the line needs ONE pick (Predatory Strike alone reaches five Insight by turn 2–3) — 52 a turn at tier 1 from the first pick, against Black's 33 and Warrior's 31 — and (b) brings the first pick to 34 / 59. Ship only after Ben confirms on that table.

**Why:** the balance review's largest outlier — the repeatable strike multiplies its die by the Insight count (one roll × count, `data/authored/deity-knowledge.json` `amountFormula: "((@tier)d(2 * @colorRank + 2)) * max(@counter, 1)"`), about 26 vital per Action at levels 2–5 and 55 at level 7, twice the leyline ceiling and twice the next deity, sustainably. Ben chose (b).

**What to do:** `Predatory Strike`'s `edha-damage-bonus` `amountFormula` → `((@tier)d(2 * @colorRank + 2)) + @tier * max(@counter, 1)`; card text (`data/domain.json` + the authored description) → "deal bonus Vital damage equal to [Tier][Die] plus your Tier per Insight on the target"; `Killing Blow` / `The Final Study` unchanged in effect. Remove the decoy item-level `damage.formula` (and `grazeOverrideFormula`) on all three cards, or keep them only if the rider cannot roll without one — the verifier flagged them as a double-count surface (`BALANCE-REVIEW.md` §7). Re-run `balance-turns.js`'s Knowledge lines (expected 34 / 36 / 59 sustained). 🤖 row: a 5-Insight strike at level 7 adds 2d8 + 10, not 2d8 × 5.

**Done when:** the formula and both card texts ship; validate + tests green; the row filed; pack rebuilt by Ben.

**PM:** lane B · model sonnet · size S · deps — · verify: the authored formula + a mutation run of `balance-turns.js`. Filed 2026-09-13 from R-120.

## 131. [x] (2026-09-13, closed as unnecessary — its own Done-when) R-121 (a) — Power and Destruction gain one Investiture-income clause each (`Warlord's Advance` on a kill, `Concussive Yield` on a multi-hit) — sized after R-126 (DATA, REBUILD deity) (2026-09-13)

> **Closed 2026-09-13 with the R-126 arithmetic recorded, PR #353.** R-126 (a) makes Draw Mana yield the highest attuned colour rank — 2 at levels 1–5, 3 from 6. Power's Draw + `Kneel` (1) + `Warlord's Advance` (1) and Destruction's Draw + two Charges (2) are sustainable every turn from level 1 with no income clause; the reason the review gave for the clause ("pay per activation with nothing back, the pool runs dry") no longer holds. No rule shipped. Reopen if Ben wants the clauses as a pure buff.

**Why:** five deity trees carry a passive Investiture refund and five do not; Power (100% Action-costed, no Passive) and Destruction (one Investiture per Charge) are the two that pay per activation with nothing back. Ben chose (a) — and asked, the same day, whether Draw Mana was ever meant to yield one per Action at tier 1 (**R-126**). Size this after R-126: with a two-point draw the clause may be unnecessary.

**What to do:** once R-126 is answered — `Warlord's Advance`: "…you gain temporary HP equal to your tier, **recover 1 Investiture**, and may move up to 10 ft as a Free Action"; `Concussive Yield`: "…**Once per round, when a Charge you set detonates and hits two or more characters, recover 1 Investiture.**" Both as one authored rule on the existing card using the Investiture-recovery handler the five income passives already use (`edha-focus {op: gain, resource: inv}` or the marked-damage trigger shape). If R-126 lands on (a)/(b)/(c), re-check the need with `balance-turns.js` before shipping; if it makes the clause redundant, close this item with that note.

**Done when:** either both rules ship with card text and 🤖 rows, or the item is closed as unnecessary with the R-126 arithmetic recorded.

**PM:** lane B · model sonnet · size S · deps R-126 · verify: validate + read-through. Filed 2026-09-13 from R-121.

## 132. [x] (2026-09-13, PR #369) R-122 (a) — Chaos's Omen cap becomes tier + 1 (DATA, REBUILD deity) (2026-09-13) — DONE for the cap half; the `Isolating Pressure` placement half is split out as **item 142** (engine primitive needed). PR #369 (2026-09-13): the four `capFormula` → `@tier + 1` changes and Entropy Strike's card text SHIPPED (🤖 rows OM-1/OM-2). `Isolating Pressure`'s new place rule is OPEN — H3 `edha-owner-list` cannot express "place only when a same-activation `release` found nothing" without an engine change (see `EDHA_RULINGS.md` §K.11 and the PR's Open questions).

**Why:** every Omen placement is capped at `@tier` with `evict: "refuse"`, so at levels 1–5 Chaos holds ONE Omen — `Spreading Omen`, `Cascade Collapse` and the capstone are single-target until level 6 — and the Black lane only consumes Omens it cannot make. Ben chose (a).

**What to do:** `data/authored/deity-chaos.json`: `capFormula: "@tier"` → `"@tier + 1"` on `EntropyStrikeOme`, both `Spreading Omen` place rules, and `UnravelFill00000`; card text on `Entropy Strike` ("up to tier + 1 Omens"). `Isolating Pressure`: add a place rule on success that fires only when the target bears no Omen (same list, same cap), and the card gains "If the target bears no Omen, place one." 🤖 rows: two Omens held at tier 1; Cascade Collapse hits both; Isolating Pressure on an unmarked target places one and does not also remove it.

**Done when:** the four caps and the new rule ship; validate + tests green; rows filed; pack rebuilt by Ben.

**PM:** lane B · model sonnet · size S · deps — · verify: validate + the rows. Filed 2026-09-13 from R-122.

## 133. [x] (2026-09-14, PR #360) R-123 — `Ghostly Walls` → Blue 2+ and `Adaptive Mutation` → Green 2+ (DATA, REBUILD leyline + deity) (2026-09-13) — DONE 2026-09-14: Ben ungated both himself ("Level six wall doesn't read to me like a ruling needed. I changed two items"); the repo now carries the decision so a rebuild cannot undo it. 🤖 rows GW-1 / AM-1.

**Why:** Blue's freeze (with `Absolute Stillness` behind it) and Life's signature mutation both sit behind a rank-3 gate — level 6 — and both are the identity their descriptions now sell; the deity guide's first principle forbids the Life one outright. Ben chose (a).

**What to do:** `data/leyline.json` Ghostly Walls `prerequisites: "Blue 3+"` → `"Blue 2+"` (Absolute Stillness stays "Ghostly Walls; Blue 3+"; Counterspell stays 3+); `data/domain.json` Adaptive Mutation `"Green 3+; Life Surge"` → `"Green 2+; Life Surge"`; mirror both in the authored overlays' description headers if the prereq is printed there. Run `scripts/validate-build.py` on the nine level-up ladders (`docs/levelup-builds.json`) — a Blue or Life ladder may now legally take the talent earlier, which is the point, not a defect. 🤖 row: a level-4 Blue character can take Ghostly Walls; a level-2 Life disciple can take Adaptive Mutation.

**Done when:** both prereqs ship; validate + tests + validate-build green; row filed; packs rebuilt by Ben.

**PM:** lane B · model sonnet · size S · deps — · verify: validate-build over the ladders. Filed 2026-09-13 from R-123.

## 134. [x] (2026-09-14, PR #360) R-124 OVERRIDDEN — `Tempered Edge`'s Deflect bypass is CUT: the card loses "and ignore deflect", the authored rider loses `addTargetDeflect` (DATA, REBUILD deity) (2026-09-13) — DONE 2026-09-14 on Ben's word ("Construct doesn't need to ignore deflect. That can be cut."). The engine's `addTargetDeflect` hint still names Tempered Edge as its example consumer (comment only); no engine change. 🤖 row TE-1.

**Why:** the review's first reading was that `Tempered Edge`'s "ignore deflect" might be a loose sentence; the verifier found `addTargetDeflect: true` on the rider with an engine hint naming Tempered Edge — deliberate. Ben chose (b): accept and document, the way R-111 documented `Withering Ray`.

**What to do:** `.claude/skills/deity-revision-guide/SKILL.md` PART 4 Civilization entry: one paragraph — the Construct's melee attack (base + energy rider) lands as if Deflect were 0 by design; Siege Cannon excluded; with `Arsenal` the Construct is ~14 a round at levels 3–5 and ~36 at level 7 for nothing, and that is the tree's ceiling to measure new Civilization talents against. Cross-reference `BALANCE-REVIEW.md` finding 7.

**Done when:** the paragraph is findable in the guide.

**PM:** lane R · model sonnet · size XS · deps — · verify: read-through. Filed 2026-09-13 from R-124.

## 135. [x] (2026-09-13, PR #370) R-125 (a) — `Kneel` and `Absolute Authority` read Disoriented instead of Frightened (DATA, REBUILD deity) (2026-09-13) — DONE 2026-09-13: both card texts and both status-list gates (`requireTargetStatus` / `whenTargetStatus`) moved from Frightened to Disoriented, along with the two talents' description copies and rule-description annotations; the engine's `frightened` registry comment now says no talent reads it (comment only — `stripComments` shows zero code difference). `Risen Servant`'s immunity list is untouched (checklist row BR-1's question). Pack parity: of 110 deity-pack documents, exactly these two differ, zero roll-formula drift. Pack rebuild is Ben's. 🤖 row PW-1.

**Why:** nothing in the game applies Frightened (three mentions in 365 talents, all reads or immunities; no adversary ability; the engine registers it only as a GM-applied marker nobody documented). Ben chose (a): Disoriented, which seven trees apply, giving the one deity tree without an income a little cross-path synergy.

**What to do:** `data/domain.json` both card texts ("Compelled, Disoriented, or Weakened"); `data/authored/deity-power.json` `requireTargetStatus: "compelled,frightened,weakened"` → `"compelled,disoriented,weakened"` and the same on `whenTargetStatus`; leave `Risen Servant`'s immunity list alone (BR-1 checks whether the custom ids bind); update the engine registry comment on `frightened` in `01-shared-core.js` to say no talent reads it now (comment only). 🤖 row: Kneel's advantage fires against a Disoriented target; Absolute Authority accepts a Disoriented target.

**Done when:** both cards and both status lists ship; validate + tests green; row filed; pack rebuilt by Ben.

**PM:** lane B · model sonnet · size XS · deps — · verify: validate + the row. Filed 2026-09-13 from R-125.

## 136. [x] (2026-09-13, PR #353) R-126 (a) — Draw Mana recovers Investiture equal to your highest attuned colour rank, not your tier (ENGINE-ONLY for the number, F5; the card text needs REBUILD leyline + adversaries) (2026-09-13)

**Why:** `edhaDrawMana` recovered `tier` Investiture per Action (one at levels 1–5) from 2026-06-12, and the shipped card said "equal to your Tier" — an implementation default no ruling had set (the initial-atlas design text said only "restores Investiture"). Ben, asked whether it scaled: *"that was not my intent … I like option a- equal to highest color rank."*

**What was done:** `edhaDrawManaYield(actor)` (52-green-instinct.js) — the highest of the five colour ranks via `edhaColorRank` (an adversary's role rank counts), floor 1 — replaces the tier read in the write and the chat line; `foundry-build.js` `drawManaItemDoc` says "equal to your highest leyline rank"; `tests/draw-mana-yield.test.js` pins the helper including a NEGATIVE tier case; ENGINE_INDEX, the leyline guide's Key Mechanic, SYSTEM-PRIMER, the handbook, the handoff reference, BALANCE-REVIEW.md (yardstick 4 restated) and `balance-turns.js` (draw 2 / 2 / 3) updated; item 131 closed as unnecessary. Rows DM-1 / DM-2 in the checklist.

**Done when:** DM-1 (engine, F5) and DM-2 (card, after REBUILD) pass on the bench.

**PM:** lane B · model — (done by the interactive session) · size S · deps — · verify: the test + the two rows. Filed and closed 2026-09-13 from R-126.

## 138. [x] (2026-09-13, PR #364) `deploy-cycle.js`'s overlay bench check matches the WORD "bench" anywhere in a worker's title, so a non-bench worker whose title mentions the bench guard refuses the deploy (TOOLING + test pin) (2026-09-13)

**Why:** `isBenchWorker` (item 122, `scripts/lib/deploy-guards.js`) treats `lane === "B"` OR the substring `bench` in item / title / agent / branch as a bench signal. The 125 + 137 worker's own overlay entry — *"deploy-cycle.js: bench guard reads worktrees…"* — tripped it, and the PM's 20:44 dry run refused with `bench signal(s) held: 125+137` although that worker never touched Foundry. The worker that built item 125 flagged it in its report.

**What to do:** the overlay signal is `lane === "B"` OR an `item` / `branch` that STARTS with `bench` / `pm/bench-` (the real shapes: `bench-45`, `pm/bench-46`); never the title or agent text. Pin: a lane-R worker titled "bench guard reads worktrees" passes; `item: "bench-47"` refuses; `lane: "B"` refuses.

**Done when:** the pin passes and fails on the reversion; the PM's dry run with a non-bench worker on the overlay passes the guard.

**PM:** lane R · model sonnet · size XS · deps 125 ✓ · verify: the pin + a dry run. Filed 2026-09-13 by the PM from the refused dry run.

**What was done:** `isBenchWorker` now only checks `lane === "B"` or an `item`/`branch` STARTING WITH `bench-` / `pm/bench-` (`BENCH_WORKER_ID_RE`); `title` and `agent` are no longer read at all. Six pins in `tests/deploy-cycle.test.js` cover the brief's exact cases (a lane-R worker titled "…bench guard reads worktrees…" now passes; `item: "bench-47"` and `branch: "pm/bench-48"` refuse; an `agent` field naming bench is also not a signal) — all shown failing on the pre-fix reversion (`git stash` back to the old `isBenchWorker`) and passing again after restore.

## 139. [x] (2026-09-13, PR #364) `deploy-cycle.js`'s post-flight `/join` check compares the world ID against the page's TITLE, so it refuses a good deploy (TOOLING + test pin) (2026-09-13)

**Why:** the PM's first live `deploy-cycle.js --yes` run (2026-09-13 20:46 ET, `main` @ `d832ac4`, run id `2026-09-14T00-46-31`) passed all nine steps and both earlier post-flight checks (`stamps-newer-than-start`, `engine-matches-head` on `24d74c96`), then refused: `join-redirect — refused — /join does not name world "edha"`. `deploy-cycle.js` (~L688 pre-fix) passed `optionsJson.world` — the world ID, `edha` — into `checkJoinRedirect` as `worldTitle`, but the `/join` page's `<title>` is the world's TITLE from `<dataPath>/Data/worlds/edha/world.json` (`"title": "Edha"`), and the comparison was case-sensitive besides. Because the refusal kept the run from writing its DEPLOY STATE line, the PM recorded that deploy by hand.

**What to do:** resolve the expected title from `<dataPath>/Data/worlds/<id>/world.json` (`FOUNDRY_USERDATA` in `scripts/lib/paths.js`, same resolution item 122 used for `Config/options.json`) and compare case-insensitively, with the id itself as a fallback when `world.json` is unreadable — a pure `expectedWorldTitle({ worldId, worldJson })` plus a case-insensitive `checkJoinRedirect`, both in `scripts/lib/deploy-guards.js`. `--dry-run` should print the resolved title in the `world-configured` verdict. Pins: id `edha` + world.json title `Edha` → expects "Edha"; a body containing `<title>Edha</title>` passes for id `edha`; no `world.json` → falls back to the id, case-insensitive; the pre-fix behaviour (id vs title, case-sensitive) shown failing on the reversion.

**Done when:** the pins pass and fail on the reversion; `--dry-run` still lists every step and prints the resolved `/join` title.

**PM:** lane R · model sonnet · size XS · deps 122 ✓ · verify: the pins + the PM's next live run. Filed 2026-09-13 by the PM from its own 20:46 deploy run (same PR as item 138).

**What was done:** `expectedWorldTitle({ worldId, worldJson })` resolves `world.json`'s `title` field, falling back to the id when the file is missing/unreadable or its `title` is not a non-blank string; `deploy-cycle.js` reads `<FOUNDRY_USERDATA>/Data/worlds/<id>/world.json` once (`readWorldJson`) and reuses the resolved title for both the pre-flight `world-configured` verdict (now prints `join title expected: "…"`) and the post-flight `/join` check — no more re-deriving it from `optionsJson.world`. `checkJoinRedirect` compares `joinBody` against `worldTitle` case-insensitively. Ten pins in `tests/deploy-cycle.test.js` cover the resolution, the fallback, the case-insensitive match, and the exact PM-run shape (id `edha`, title `Edha`) — shown failing on the pre-fix reversion and passing again after restore.

## 140. [x] (2026-09-14, PR #378) The agent deploy cycle rebuilds the packs with no extract step, and the build's un-extracted-edits guard is blind to tree-node edits — an in-Foundry prerequisite edit made between a ⟳ Sync and a deploy is overwritten without a word (TOOLING + DOCS) (2026-09-13)

**Why:** on 2026-09-14 (UTC; the evening of 09-13 ET) Ben ungated `Ghostly Walls` and `Adaptive Mutation` in Foundry; the 20:03 ET agent-run deploy rebuilt the packs from the repo and overwrote both edits (PR #360 then carried the two prerequisites into `data/`; the pre-rebuild backup under `%TEMP%\edha-deploy-backups` kept the originals). The #360 session asked the PM to file the gap as structural, and it is: `scripts/deploy-cycle.js` (item 122) runs `foundry-build.js <scope>` at step 7 with no `foundry-extract.js` before it, so the only protection is the build's own fingerprint guard (`AUTHORING_WORKFLOW.md` §"The guard") — and that guard's documented blind spot is exactly this case: the fingerprint covers the six authorable fields (`img`, `description`, `activation`, `damage`, `events`, `effects`) and nothing else, so a prerequisite, node-graph, folder or name edit in Foundry changes no fingerprint, the build reports no un-extracted edits, and the deploy proceeds. The guard also fires at step 7 — after the close (step 1) and the engine push (step 5) — so even a caught edit leaves Foundry closed and the engine already pushed before anyone learns of it.

**What to do:** two halves, both provable headless. (a) Decide, from `scripts/edha-pack-io.js`'s projection and the tree documents the build writes, whether the fingerprint can cover what a GM can edit on a pack document beyond the six fields — at minimum a talent-tree node's prerequisites and connections, the folder and the name — so `foundry-build.js` ABORTS on those too, naming the field and saying (as `AUTHORING_WORKFLOW.md` already does) that structure changes go in the source JSON; if some of it cannot be fingerprinted, say exactly what stays blind. (b) `deploy-cycle.js` gains a PRE-FLIGHT guard that runs that same comparison read-only against the live packs (Foundry may stay open — the extract path reads a copy) and REFUSES before step 1 when any pack carries un-extracted edits, printing the talents and the `node scripts/foundry-extract.js <tree>` command; `--dry-run` prints the verdict; the build's existing `--force` (surfaced as a deploy-cycle flag) is the explicit override. Pure decision helpers in `scripts/lib/deploy-guards.js`, pinned by mutation against a fixture; the runbook's agent-run-deploy section and the workflow doc's blind-spot note updated to whatever blind spot remains. Never add a step that silently extracts INTO the repo during a deploy — an extract is Ben's authoring and gets committed on its own.

**Done when:** a prerequisite edited on a pack document makes the cycle refuse in pre-flight (fixture-proven, the reversion shown failing), the dry run prints it, and the docs name the remaining blind spot.

**PM:** lane R · model sonnet · size M · deps 122 ✓ · verify: mutation pin + a `--dry-run` printout. Filed 2026-09-13 by the PM from the #360 session's "for the PM to file" note.

**What was done:** `scripts/edha-pack-io.js` gains `structuralOf`/`snapshotDoc`/`diffUnextractedEdits` — the shared, pure comparison (talent name/folder + a talent-tree node's prerequisites/connections, alongside the original six-field content fingerprint) that BOTH call sites now run verbatim. `foundry-build.js`'s own guard ABORTS on a structural edit too, naming the talent and field and pointing at the source JSON (there is no extract-side fix for structure); its post-write baseline refresh and `foundry-extract.js`'s `writeBaseline` both snapshot `talent_tree` docs now, not just talents, and a pre-item-140 (plain-string) baseline entry degrades gracefully (content check still runs; structural half stays un-armed until the next build/extract, never a false ABORT). `scripts/deploy-cycle.js` gains a PRE-FLIGHT guard, `un-extracted-edits` (`scripts/lib/deploy-guards.js`'s pure `checkUnextractedEdits`), that reads each atlas pack's live docs read-only (`edha-pack-io.js`'s `readPack` — a temp copy, safe with Foundry open) against `.baselines/<pack>.json` before step 1 and refuses on the identical diff; `--dry-run` prints its verdict; `--force-build` overrides it and is threaded into step 7 so the build itself does not then re-refuse. Pinned in `tests/deploy-cycle.test.js`: 13 new cases covering both directions (an untouched fixture pack passes; a mutated prerequisite/connection/name/folder each refuses, naming the field) plus the pre-item-140-baseline graceful-degradation case and the verdict wrapper (content vs. structural remedy text, `--force-build` override) — the reversion (a content-only, talents-only diff, i.e. the pre-140 shape) was run and shown failing exactly the 4 new structural cases, then restored. `node scripts/deploy-cycle.js --dry-run` against the live packs (read-only) printed `PASS un-extracted-edits — no un-extracted Foundry edits in any pack's baseline`. Remaining blind spot, documented in `AUTHORING_WORKFLOW.md`'s guard note: a structural ABORT still has no automatic fix (structure changes go in the source JSON, full stop — extract does not and will not round-trip it); node `position`/`size`, `sort`, the `path` item, and the tree's `viewBounds`/`background` stay unfingerprinted on purpose (GM-tunable layout, never what a talent needs or unlocks); the adversaries/items packs have no baseline concept at all. TOOLING-only — nothing to deploy.

## 141. [x] (2026-09-14, PR #379) The three Knowledge cards still carry a clickable item-level `damage.formula` beside their Insight riders — the verifier's double-count surface that item 130 left with a note (DATA + build check, REBUILD deity) (2026-09-13) — DONE 2026-09-14, PR #379 (all three `damage` blocks blanked to `{formula: null, type: null}`, matching the shape every other Knowledge talent without a rollable formula already uses; pack parity: exactly THREE documents differ, all three in `system.damage` only [Predatory Strike also its cue text + rider description, item 148]; zero other formula diffs anywhere in the pack; validate-packs.js green; row KM-2 filed)

**Why:** `data/authored/deity-knowledge.json` gives `Predatory Strike` (`Ijbc9inhfqtIA0Nm`), `Killing Blow` (`4jDo4hPak4j0KdSH`) and `The Final Study` (`yrIgDwup7iBdPq07`) an item-level `damage.formula` of `(@tier)d(2 * @skills.red.rank + 2)` vital (the two cash-outs also a `grazeOverrideFormula`), while the damage they actually deal is applied by their own rules (`PredStrikeRider0`; `KillingBlowHit00` / `KillingBlowFDmg0`; `FinalStudyHit000` / `FinalStudyFDmg00`). The balance review's verifier (`docs/analysis/talent-ecosystem/BALANCE-REVIEW.md` §7) flagged the item-level formula as a double-count surface: the system's own damage button on the card rolls it on top of what the rule applies. Item 130 (PR #366) reshaped Predatory Strike's rider and left the three decoys in place with their chat note, because removing them needed a build + `validate-packs` check that session had no room for.

**What to do:** read how each rule resolves (`edha-damage-bonus` rides the weapon attack; the cash-outs deal their damage from the `Hit` / `FDmg` rules) and confirm none of the three needs the item-level formula to roll; then blank or remove the `damage` block (`formula`, `grazeOverrideFormula`, `type`) on all three authored entries and drop the chat note that explained it — if the cosmere system's sheet or activation demands a formula on a talent that rolls, keep the minimum and say why on the item. Build the deity pack into a scratch `EDHA_MODROOT` under `$TEMP` (never the live module; `EDHA_DATA` pinned to the worktree), run `validate-packs.js`, and read the pack back: exactly three documents differ, in `system.damage` only. One 🤖 row: on Bench — Knowledge the card's damage button no longer offers a second roll, and the rider's bonus still lands on the hit (KM-1's numbers).

**Done when:** the decoys are gone (or the required minimum is documented on the item), validate-packs green on the rebuilt deity pack, parity stated with the three docIds, the row filed.

**PM:** lane B · model sonnet · size S · deps 130 ✓ (#366) · verify: scratch build + validate-packs + read-back parity. Filed 2026-09-13 by the PM from item 130's "left open" note.

## 142. [x] (2026-09-14, PR #383) R-122 (a)'s second half — `Isolating Pressure` places an Omen on an unmarked target: ONE generic dial on H3 `edha-owner-list` so a `place` rule can fire when a same-activation `release` found nothing (ENGINE-ONLY primitive + DATA, REBUILD deity) (2026-09-13) — DONE 2026-09-14, PR #383 (the dial is `onMissing: "halt" | "continue"`, default unchanged, honoured by list and counter mode; plus `whenTargetStatus` / `unlessTargetStatus` on H3, the pair `edha-triggered-effect` already had. Both gates — and `edha-triggered-effect`'s existing ones — read `edhaTargetStatusesAt`, the ENTRY SNAPSHOT the test-result dispatcher takes before the batch's first rule (`options.targetStatusesAtEntry = {uuid, statuses}`, used only for the creature it was taken from, live read otherwise); that is what makes the two branches mutually exclusive whatever order they sit in, and it was audited inert for all four pre-existing gate consumers. Isolating Pressure now carries release `onMissing: continue` → damage `whenTargetStatus: omen` → place `unlessTargetStatus: omen`/`@tier + 1`/`evict: refuse`, card + all three copies gain "If the target bears no Omen, place one."; registered in the handler table, `ENGINE_INDEX.md` and `lint-refs` pass 9b. Six pins in `tests/omen-branch-dial.test.js`; three reversions shown failing; pack parity 118/123 byte-identical with only Isolating Pressure and the four release caps differing. Rows OM-3/OM-4 filed)

**Why:** item 132 (PR #369) shipped the cap half of R-122 (a) and stopped on this half, correctly: `edhaDispatchTestResult` (`module-src/scripts/engine/04-black-ritual.js` ~L389–408) breaks its rule loop on the first `false` return, and Isolating Pressure's shatter idiom is a `release` rule (`53-native-event-system.js` ~L1279–1290; returns `false` when the target bears no Omen) followed by a `damage` rule that rides the halt. A `place` rule ordered after `release` is skipped by that halt in exactly the case it must fire; ordered before it, `release` finds and shatters the entry `place` just added. H3 has no field letting one rule react to a sibling's pre-mutation finding, so the talent cannot carry the behaviour on its own document today (iron rule 2b), and the worker filed the gap instead of inventing a field or touching the engine.

**What to do:** add ONE generic dial, never a name-keyed branch — the shape the 132 worker proposed: a non-halting `release` (for example `onMissing: "continue"` on `edha-owner-list` `op: release`, default unchanged = halt) plus status gating on the sibling rules the way `edha-triggered-effect` already reads `whenTargetStatus` / `unlessTargetStatus` (`place` gated `unlessTargetStatus: omen`, `damage` gated `whenTargetStatus: omen`) — both evaluated against the target's status BEFORE the activation mutates it, which is the part to design (snapshot the target's ledger at dispatch entry, or evaluate every gate before any rule runs). Register the field in the handler table (item 24's registry — schema + label), the `ENGINE_INDEX.md` H3 row, and `lint-refs` pass 9b's closed enum if the dial is enumerated. Data: Isolating Pressure gains the `place` rule (same list, the `@tier + 1` cap, `evict: refuse`) and the card sentence "If the target bears no Omen, place one." in `data/domain.json` and the authored copies; read the card for whether the spirit damage still lands on an unmarked target (today it rides the shatter) and pin what the card says. Pins: a headless case per ordering (unmarked target → placed and not removed; marked target → shattered as before), the dial's reversion shown failing. 🤖 row: Isolating Pressure on an unmarked target places one Omen and does not also remove it; on a marked target it shatters as before.

**Done when:** the dial is generic and registered, the talent's own rules express the behaviour, both cases pinned headless, pack parity names exactly Isolating Pressure, the row filed.

**PM:** lane B · model opus · size S · deps R-122 ✓ · 132 ✓ (#369) · verify: headless pins (mutation both ways) + pack parity. Filed 2026-09-13 by the PM from item 132's report; the ruling is answered — this is the engineering, not a new question for Ben.

## 143. [x] (2026-09-14, PR #383) `edhaClearPowerState`'s scene-reset list in `47-power.js` still clears `frightened` — a status no talent reads or applies since item 135 (ENGINE-ONLY, F5; fold into item 142's Opus dispatch) (2026-09-13) — DONE 2026-09-14, PR #383 (dropped, the registry's own reading: Frightened is a GM-applied marker no talent reads or applies, and the one way it is set today is a GM toggling it by hand — Power ending combat has no business silently undoing that. `compelled` stays because Kneel still applies it, and the five arming markers plus `crowned` are untouched. Reasoning written into the code beside the list, the Power note in `ENGINE_INDEX.md`, a pin that reads the reset list, and the reversion — putting `frightened` back — shown failing)

**Why:** item 135 (PR #370) moved Kneel's and Absolute Authority's reads from Frightened to Disoriented and left the `frightened` registry entry as a GM-applied marker with its comment updated. Its worker found, and correctly left alone (the brief allowed one comment as the only engine change), that the Power scene-reset `statuses` array in `edhaClearPowerState` (`module-src/scripts/engine/47-power.js` ~L446) still lists `"frightened"` among the statuses cleared when Power-flavoured combat ends. Harmless today — clearing a status nobody applies is a no-op — but it is the last engine line that treats Frightened as Power's own condition, and a GM who toggles the marker by hand would have Power's reset silently clear it.

**What to do:** decide from the registry comment which way is honest — drop `"frightened"` from the reset list (the marker is GM-applied, so a Power reset should not clear a GM's own toggle; the likely answer) or keep it and say so in the section header — one line either way; re-assemble the engine (`node scripts/engine-assemble.js`, commit both files); a pin in the existing Power reset test or a new headless case that reads the reset list; the `ENGINE_INDEX.md` Power note. Do it inside item 142's Opus dispatch (both are post-balance engine touch-ups on deity trees) unless 142 is delayed.

**Done when:** the reset list matches the registry's statement, pinned; the engine re-assembled; the delta names the deploy class (ENGINE-ONLY, F5).

**PM:** lane R · model opus · size XS · deps 135 ✓ (#370) · verify: the pin + `engine-assemble.js --check`. Filed 2026-09-13 by the PM from item 135's found-out-of-scope note.

## 144. [ ] R-92 (a) — a generic 0-HP drop cue: GM-whispered, names the character, offers the Roll Injury reminder (ENGINE-ONLY, F5) (2026-09-13)

**Why:** R-92 asked whether Edha should notice a character dropping to 0 HP for the GM — leave it manual like the system does (c), whisper a cue (a), or whisper the cue and auto-apply `unconscious` (b). Ben answered (a) from the phone board, 2026-09-13 21:59 ET: a GM-whispered card only, no dice or status change.

**What to do:** compose `edha-apply-watch` → `edha-gm-cue` — the same shape `Cover Their Retreat` already uses for "an ally within 20 ft would drop" — into one small generic handler (iron rule 2a) that fires when any character's health crosses to 0, naming the character and offering the Roll Injury reminder in the card. One small generic handler, not a subsystem; no dice change. Pin it headless; file one 🤖 checklist row.

**Done when:** the cue fires and names the dropped character with the Roll Injury reminder, pinned headless; `ENGINE_INDEX.md` gains the row; one 🤖 row filed in the checklist.

**PM:** lane B · model opus · size S · deps R-92 ✓ (a, phone 2026-09-13) · verify: the headless pin. Filed 2026-09-13 by the PM from R-92 (a), answered via phone board.

## 145. [x] (2026-09-13, PR #372) Rulings close-out 2026-09-13 late: R-92 and R-114 … R-119 answered (a) from the phone board; record them, move them to §K, unblock items 101 / 106 / 107 / 108 / 109 / 114; file item 144 (DOCS-ONLY) (2026-09-13) — DONE 2026-09-13, PR #372 (all seven rulings answered inline and moved verbatim to §K.13, hash-matched before/after; `parseOpenRulings()` → `[]`, re-pinned in `tests/pm-state.test.js`; items 101/106/107/108/109/114 unblocked; item 144 filed; all gates green)

**Why:** Ben answered all seven open design-proposal rulings — R-92 (the 0-HP drop cue) and R-114 … R-119 (item 127's six queued-TODO proposals) — from his phone board at 21:57–21:59 ET on 2026-09-13, each tapping the card's own (a) text; the PM saved the seven notes verbatim to `tmp/pm/inbox-2026-09-13/notes.json` (gitignored). `EDHA_RULINGS.md` §L still showed them open and items 101/106/107/108/109/114 were gated on rulings that were actually settled.

**What to do:** in `EDHA_RULINGS.md`, give each of the seven an inline `ANSWERED (a) — Ben, phone board` line and move the seven blocks verbatim into a new `### K.13` at the end of `## K. Settled`, leaving one-line stubs behind in `## L. Waiting`; re-pin `tests/pm-state.test.js`'s `ECOSYSTEM_RULINGS` fixture (previously the seven open ids) to the empty set the real doc now has; update items 101/106/107/108/109/114's heading wording and `deps` lines to `✓ (a, phone 2026-09-13)`, raising 109 and 114 from sonnet to opus (their answers each need a small engine edit); note on 106 that the H9 engine mode may proceed but `Decree of Ruin`'s card text still waits on Ben's own design text; file item 144 (R-92's drop cue); rewrite `CLAUDE.md`'s rulings-doc row (the open set is now empty; ruling span corrected to R-126); a changelog delta; rebuild the dashboard.

**Done when:** `EDHA_RULINGS.md` has zero open rulings in §L (`parseOpenRulings()` → `[]`); the seven moved bodies hash-match before/after the move; items 101/106/107/108/109/114 read `✓` deps; item 144 exists; `node scripts/gates.js` is all green.

**PM:** lane R · model sonnet · size M · deps — · verify: `parseOpenRulings()` → `[]`, the hash proof, gates. Filed 2026-09-13 by the PM from the phone board's seven answers.

## 146. [x] (2026-09-14, PR #380) ⟳ Sync Talents refreshes only `talent` items, so every owned `path` card and every owned `Draw Mana` action in the world is frozen at drag-time — item 111's whole deliverable never reaches a sheet (ENGINE-ONLY, F5) (2026-09-14)

**Why:** measured at **bench run 47 (2026-09-14)** on the hash-verified `902ddadb…` engine. `edha.syncNow(Bench — Black)` reported *"Edha: synced 25 talent(s) on Bench — Black."* with `missing: []` while the actor's owned `Black` **path** item stayed at its old 1154-char description against the rebuilt pack's 1857-char text. Root cause, two lines in `module-src/scripts/engine/26-talent-sync.js`: `edhaSyncActorTalents` line 58 `if (item.type !== "talent") continue;` skips every non-talent owned item, and `edhaBuildSourceMap` line 39 `if (d.type !== "talent") continue;` never indexes a `path` or `action` source in the first place — so a path card can never be matched even if the filter were relaxed on one side only. **Blast radius counted live: 24 of 24 owned path items in the world are stale, 0 current**, including all three real PCs (Tem parinaem: Scholar / Green / Knowledge; Soggy Bottom: Scholar / White / Fate; Ishee: Envoy / Blue / Chaos) — so the Ben-approved path prose from PR #349 (item 111 / R-104 (a)) is invisible on every character sheet in the world and no button in Foundry can fix it. **The same filter freezes `action` items: 18 of 18 owned `Draw Mana` copies still read "recover Investiture equal to your Tier"** (R-126's old text); the 13 on adversaries are recoverable through the adversary pack sync, the 5 on PCs are not. This is the defect behind checklist row **111-2** (FAIL) and the caveat on **DM-2**.

**What to do:** widen the sync to the item types whose cards a rebuild changes — `path` and `action` alongside `talent` — on BOTH sides (`edhaBuildSourceMap` must index them; `edhaSyncActorTalents` must let them through). Matching for a path has no `group`, so key it `atlas|name` with the existing name fallback; keep the rename guard (a renamed item must still be left alone rather than overwritten with the wrong card). Keep the existing wholesale-replace semantics for `system.events` / `effects` (the `-=` deletions), and keep `system.relationships` untouched — the path Parent link is what drives the Actions grouping. Decide and state whether the toast keeps saying "talent(s)" or counts the wider set. Pin the new matching headless in `tests/`; the live half is a 🤖 row.

**Done when:** ⟳ Sync Talents on a PC owning a stale path brings its description to the pack's text; `edhaBuildSourceMap` indexes all 21 path docs and the leyline `Draw Mana` action; a renamed owned item is still skipped; a headless pin covers both the match and the rename guard; checklist row 111-2 is re-filed 🤖 for the next bench; `node scripts/gates.js` all green.

**PM:** lane B · model sonnet · size M · deps — · verify: the headless pin plus a bench re-drive of 111-2. Filed 2026-09-14 by bench run 47. — **DONE 2026-09-14, fix pass 12, PR #380** (`EDHA_SYNC_TYPES` = `talent` + `path` + `action` gates both sides; `edhaSrcKey` carries the document TYPE in the exact key AND the name fallback — load-bearing, the deity pack ships a `path` and a `talent` both named *Sovereignty*; the update writes `system.activation`/`damage`/`description` only where the source declares them, since a `path` DataModel has neither of the first two; an adversary-flagged embedded `action` is skipped so the adversary pack sync stays its one owner; the toast counts the wider set with a per-type breakdown, `edhaSyncTypeLabel`; rename guard and `system.relationships` untouched. Pinned: `tests/sync-item-types.test.js`, 11 cases — reverting either type filter fails 5 each, dropping `type` from the key fails the Sovereignty case. Live re-drive: checklist rows 111-2 and the new SYNC-1, both 🤖.)

## 147. [x] (2026-09-14, PR #380) The adversary sync's `scenes` scope leaks — an `updateActor` sight hook re-stamps `sight.range` on tokens of the synced actor on EVERY scene, defeating R-113's scene filter (ENGINE-ONLY, F5) (2026-09-14)

**Why:** measured at **bench run 47 (2026-09-14)**, isolated and reproduced across a tight before/after window with nothing else running. `edha.syncAllAdversaries({folder: "Bench Targets", scenes: [<Playtest Map id>], dryRun: false})` — a call whose `scenes` list names exactly one scene — changed a token on a **different** scene: `Briar-Gone Grove`'s token on the Bench Arena had `sight.range` rewritten **30 → 5**, with no line in the returned report and no notification. `edhaSyncAdversaryActor`'s own token loop honours the filter correctly (`if (sceneFilter && !sceneFilter.has(scene.id)) continue;`); the write comes from downstream. Root cause proven: the `updateActor` hook in `module-src/scripts/engine/52-green-instinct.js` fires whenever `changes.system.attributes.awa !== undefined`, and `edhaSyncAdversaryActor` replaces `system` **wholesale** (`actor.update({…system…}, {recursive: false, diff: false})`), so that key is present on every sync; the hook then walks **`for (const sc of game.scenes ?? [])`** completely unfiltered and stamps `sight.range` on every token of that actor. That is the same unfiltered-`game.scenes` shape `edha.fixPcTokens()` was caught with at bench run 45, and it directly contradicts R-113's contract — "a scene left out of `scenes` is never touched, no matter what it holds" — including a scene holding someone else's started combat.

**What to do:** stop the sync path from tripping the sight hook, or teach the hook the caller's scope. Cheapest correct shape: have `edhaSyncAdversaryActor` pass an options marker on its actor update (e.g. `edhaSyncScenes: sceneFilterSet`) and have the sight hook read it — restricting its scene walk to those ids, and skipping entirely when the marker says "no scenes". Also consider suppressing it outright for the sync (the prototype's sight is already being stamped by the sync's own filtered loop, so the hook's work is redundant there). Whatever the shape, the hook's unfiltered `game.scenes` loop should not survive as-is. Pin the decision as a pure helper in `tests/` and re-file the bench row.

**Done when:** a scoped `edha.syncAllAdversaries({scenes: [X], dryRun: false})` leaves every token on every scene other than X byte-identical (including `sight`), proven headless and re-driven live; checklist row **123-1** re-tested and retired; `ENGINE_INDEX.md` updated if a new marker is introduced; all gates green.

**PM:** lane B · model opus · size M · deps — · verify: the headless pin plus a bench re-drive of 123-1. Filed 2026-09-14 by bench run 47. — **DONE 2026-09-14, fix pass 12, PR #380** (new pure `edhaUpdateSceneScope(options)` reads an `options.edhaSceneScope` marker — absent = no claim, a list = those scenes only, EMPTY = none at all, i.e. "the caller already wrote what you would". `edhaSyncAdversaryActor` stamps `edhaSceneScope: []` on its wholesale replace and the sight hook stands down **completely**, prototype write included; its `game.scenes` walk is scoped for any other caller. Standing down outright rather than narrowing is deliberate and is a second defect the report did not name: Briar-Gone Grove is the ONLY block in `adversaries.json` with a bespoke `senses` (30 ft), `advSensesRangeFt` honours it and `edhaPcSightShape`'s AWA ladder does not — so a scene filter alone would have kept the 30 → 5 corruption and merely confined it to the in-scope scene. **Sibling sweep:** this is the only `updateActor` hook in the engine that writes tokens across `game.scenes`; the other eleven bail on an `options.edhaHea`/`edhaFoc` pre-hook stamp the sync never sets or act locally, and `edhaSyncIsolatedMarkers` — the other actor-update reader a wholesale replace wakes — is bounded to `canvas.tokens.placeables` and gated on a live combat. Pinned: `tests/sync-scene-scope.test.js`, 16 cases, the leak itself at the HOOK layer through the real registered chain; ignoring the marker fails 3. Live re-drive: checklist row 123-1, 🤖.)

## 148. [x] (2026-09-14, PR #379) `Predatory Strike`'s cue card still says "[Tier][Die] Vital per Insight" — the pre-item-130 multiplicative phrasing, contradicting its own card and the shipped formula (DATA, REBUILD deity) (2026-09-14) — DONE 2026-09-14, PR #379 (`PredStrikeNote00`'s cue text now reads "[Tier][Die] plus your Tier per Insight", matching the description, "don't also roll by hand" kept intact; swept and fixed `PredStrikeRider0`'s own stale "× max(...)" rule description too; `data/domain.json`'s source prose already agreed; row KM-3 filed)

**Why:** measured at **bench run 47 (2026-09-14)**. Item 130 / R-120 (b) reshaped Predatory Strike from dice × Insight to one die plus Tier per Insight: the description now reads *"deal bonus Vital damage equal to [Tier][Die] plus your Tier per Insight on the target (minimum 1)"* and the rule's `amountFormula` is `((@tier)d(2 * @colorRank + 2)) + @tier * max(@counter, 1)` — both correct, and the live rider was measured at +20 / +18 / +25 on three takes at 5 Insight (tier 2, Red 3), which `2d8 × 5` could not produce. But the talent's `edha-note` rule — the card the player actually reads when they use it — still says *"make a melee or ranged weapon attack — the next hit auto-adds **[Tier][Die] Vital per Insight** on the target (min 1), then places 1 Insight on it."* That reads as the multiplicative version item 130 removed, so the cue card and the talent card now disagree about the same number.

**What to do:** in `data/authored/deity-knowledge.json`, rewrite the `edha-note` text on Predatory Strike to match the description's wording — "[Tier][Die] plus your Tier per Insight" — leaving the rest of the note (the "don't also roll the card's damage by hand" instruction) intact. Sweep the other Knowledge notes for the same stale phrasing while you are in there, and check the source prose in `data/domain.json` agrees. No engine change.

**Done when:** the Predatory Strike cue card's wording matches its description, the deity pack rebuilds clean, and one 🤖 row is filed to read the card once at the table.

**PM:** lane R · model sonnet · size S · deps — · verify: pack parity on the one talent, a 🤖 row. Filed 2026-09-14 by bench run 47.

## 149. [ ] `edha-apply-status` announces a status that immunity refused — `Kneel` posted "Risen Servant is Compelled" while the immunity blocked it (ENGINE-ONLY, F5) (2026-09-14)

> **The card half SHIPPED 2026-09-14 (fix pass 12, PR #380).** **The second half is defined by R-127 (a), answered 2026-09-14 09:20 ET (Ben, phone board): immunity is a PRE-COST gate, not a refund** — at the activation gate, beside the existing `requireTargetStatus` check, refuse the activation before any cost when EVERY status the talent would apply is one the target is immune to (`edhaConditionImmune`, fix pass 12's helper), posting the same "nothing spent" card the existing gates use; a payload that is only partly immune still fires and pays, and the honest card says which part landed. ENGINE-ONLY (F5): one generic predicate (the statuses a rule would apply are read from the talent's own rules, never from its name), a headless pin per branch (all-immune → refused before cost, pool unchanged; partly immune → fires, pays, the split card; not immune → unchanged), the reversion shown failing, one 🤖 row. Opus S.

**Why:** measured at **bench run 47 (2026-09-14)** while driving checklist row BR-1. A Risen Servant summoned by `Bench — Death` correctly carries `system.immunities.condition` `{compelled: true, disoriented: true, frightened: true}`, and `Bench — Power`'s `Kneel` rolled 25 vs COG 11 SUCCESS. The status was **refused** — `ui.notifications` said *"Risen Servant (Bench — Death) is immune to Compelled"* and the actor's `statuses` stayed `[]` — but the talent's own success card posted anyway, verbatim: *"🎯 **Kneel** : Risen Servant (Bench — Death) is Compelled (by Bench — Power). Next action: move toward the compeller or do nothing — movement ENFORCED (only distance-closing moves pass)."* A GM reading the chat log would rule the servant Compelled. This is the same class of defect as item 120 / item 124 on the healing side, where `edhaDeliveredNote` was introduced precisely so a card cannot claim delivery that did not happen — the status writer has no equivalent.

**What to do:** make `edha-apply-status` (and the shared status-write body it calls) report what actually landed: check the target's condition immunity BEFORE composing the card, and when the status is refused post the refusal instead of the claim — naming the immunity, in the same voice as the healing cards. Keep the cost/test semantics unchanged unless **R-127** says otherwise (see below); this item is about the card only. Prefer a small pure helper on the model of `edhaDeliveredNote`, pinned in `tests/`, so every future status writer inherits it.

**Done when:** applying a status a target is immune to posts a card that says so and never claims the condition; the helper is pinned headless; a 🤖 row re-drives the Kneel-vs-Risen-Servant case.

**PM:** lane B · model opus · size S · deps R-127 ✓ (a, phone 2026-09-14 — a PRE-COST gate, not a refund) · fix pass 12 ✓ (the card half) · verify: the headless pin plus a bench re-drive. Filed 2026-09-14 by bench run 47.

**CARD HALF DONE 2026-09-14, fix pass 12, PR #380 — the item stays OPEN on the refund half (R-127, still waiting on Ben).** Four new helpers in `12-contested-roll-resolution.js` beside `edhaConditionLabel`, the status-side twin of the `edhaDeliveredNote` family: `edhaConditionImmune` (pure — reads `system.immunities.condition` exactly as the cosmere Actor's own `toggleStatusEffect` override does), `edhaStatusRefused` (the same check at a WRITE site, plus the warning — the system raises its own on whichever client performs the write, so a relayed refusal was invisible to the player who asked), and the two pure composers `edhaStatusApplyCard` / `edhaStatusSplitNote`. `edhaApplyStatusMark` consults immunity **before** either write path, so a refusal also costs no phantom `markedBy.<status>` flag for the damage post-pass to find, and the refusal card drops the bonus-damage clause and the rule's authored note along with the claim. **Sibling sweep — two more announcers had the same lie and were retrofitted onto the same primitives:** the `edha-triggered-effect` status branch listed every TARGET as carrying the status (now split landed/refused; an all-landed card is byte-identical to before), and `edhaFoeSkillVsColor`'s save card printed its `failText` — a condition NAME for three callers — unconditionally (it now reads the `onFail` callback's return value; `false` → *"(immune — nothing applied)"*, anything else unchanged). The three shared writers `edhaWriteStatusMark` / `edhaApplyTimedStatus` / `edhaToggleStatus` (apply direction only) return **`false`** for a refused status instead of reporting success. **The COST is untouched, deliberately.** Pinned: `tests/status-immunity-card.test.js`, 18 cases — the executor is driven end to end, and disabling its immunity branch reproduces bench 47's card verbatim. Live re-drive: the new 🤖 row **IMM-1**.

## 150. [x] (2026-09-14, PR #383) Chaos's Omen `release` rules still carry `capFormula: "@tier"` while the `place` rules use `@tier + 1`, so the release cards print the wrong denominator (DATA, REBUILD deity) (2026-09-14) — DONE 2026-09-14, PR #383 (the field was ABSENT, not set to `@tier` — Foundry's DataModel was supplying the schema's `@tier` initial, which is why a grep for the old value found nothing to change. The sweep found FIVE release carriers, not the two the report named: `CascadeRel000000`, `IsolPressureShat`, `IsolRuinShatter0`, `UnravelRel000000`, `UnweaveRel000000`, all now stating `@tier + 1` outright; every `place` rule in the tree already did. A tree-wide pin now fails on any Omen rule that omits it — it refused a half-applied sweep at the pre-commit hook, which is why this rode item 142's data commit. Mechanics unaffected: a release never enforced the cap. Row OM-5 filed)

**Why:** measured at **bench run 47 (2026-09-14)**. The Omen cap was raised to `@tier + 1` on the placement side (checklist rows OM-1/OM-2, both passing): Entropy Strike and Spreading Omen both carry `capFormula: "@tier + 1"` and their cards correctly read *"bears your Omen (1/3)"*, *"(2/3)"*, *"(3/3)"* and *"no Omen placed … you are at your cap of 3"* on a tier-2 caster. But `Cascade Collapse`'s `edha-owner-list` **release** rule and `Isolating Pressure`'s still carry `capFormula: "@tier"`, so the same run's release cards printed *"Bench Target — Undefended's Omen is spent (**2/2** left)"* and *"Cullwolf Pack's Omen is spent (**1/2** left)"* — a denominator of 2 against a live cap of 3. The mechanic is unaffected (a release does not enforce the cap); only the printed number lies, and it lies in the direction that makes a player think they have fewer Omens available than they do.

**What to do:** in `data/authored/deity-chaos.json`, set `capFormula` to `@tier + 1` on both `release`-op `edha-owner-list` rules (Cascade Collapse, Isolating Pressure) so every Omen card in the tree quotes one cap. Sweep the rest of the tree for any other Omen rule still on `@tier`. No engine change. (Item 142 also touches Isolating Pressure's rules — sequence the two so neither clobbers the other.)

**Done when:** every Omen card in the Chaos tree prints the same denominator as the placement cards; the deity pack rebuilds clean; one 🤖 row re-reads a release card at the table.

**PM:** lane R · model sonnet · size S · deps — (coordinate with item 142) · verify: pack parity on the two talents, a 🤖 row. Filed 2026-09-14 by bench run 47.

## 151. [x] (2026-09-14, PR #380) The documented scoped-adversary-sync incantation `{folder: "Edha Bench"}` matches ZERO actors — four documents print a recipe that silently does nothing (DOCS + small ENGINE ergonomics) (2026-09-14)

**Why:** measured at **bench run 47 (2026-09-14)**. `edha.syncAllAdversaries({folder: "Edha Bench", scenes: [<scene id>]})` returns `{actors: [], sceneTokens: {}}` — no actors, no tokens, no warning. `edhaSyncAllAdversaries`'s filter is `candidates.filter(a => a.folder?.id === folder || a.folder?.name === folder)`: an exact, non-recursive match on the actor's OWN folder. **No actor sits directly in "Edha Bench"** — the bench roster lives in its two child folders, `Bench PCs` (18 actors) and `Bench Targets` (7). So the exact command printed in `EDHA_FOUNDRY_TEST_CHECKLIST.md` rows 123-1 and 128-1, in `docs/EDHA_BENCH_RUNBOOK.md`'s "Bench-created scenes" section, and in the `bench-run` skill's hard rule 9 is a no-op that reads like a success. A bench run following it exactly would report "scoped sync done" having synced nothing.

**What to do:** pick one of two fixes and apply it everywhere. (a) **Docs only:** change all four call sites to `folder: "Bench Targets"` (the folder that actually holds the bench's adversaries), and say why. (b) **Engine + docs:** make the `folder` option match a folder OR any of its descendants (`folder.ancestors` walk), which makes `"Edha Bench"` mean what every document already assumes, then leave the docs as they are and pin the recursive match in `tests/engine-helpers.test.js`. (b) is the smaller long-term surprise and is one small predicate; either way, add a warning when a `folder`/`actorIds` filter resolves to zero candidates so a silent no-op can never read as a success again.

**Done when:** the incantation in all four documents actually syncs the bench roster; a zero-candidate scoped call warns instead of returning silently; if (b), the recursive match is pinned headless; all gates green.

**PM:** lane B · model sonnet · size S · deps — (fold into item 147 if one worker takes both) · verify: the headless pin or a doc-consistency grep, plus a bench re-drive. Filed 2026-09-14 by bench run 47. — **DONE 2026-09-14, fix pass 12, PR #380, folded into item 147's commit.** Option **(b)**, as the item recommends: new pure `edhaFolderChainMatches(chain, folder)` / `edhaActorFolderChain(actor)` match a folder **or any of its descendants** (`Folder#ancestors`), so `{folder: "Edha Bench"}` means what every document already assumed; a `folder`/`actorIds` filter resolving to **zero candidates now warns** (console + `ui.notifications`) naming the filter, so a silent no-op can never read as a success again. All four documents corrected and kept as `"Edha Bench"`: `docs/EDHA_BENCH_RUNBOOK.md` (the Bench-created-scenes step, the R-113 lesson, and its run-47 lesson rewritten as FIXED), `.claude/skills/bench-run/SKILL.md` hard rule 9, and checklist rows 123-1 and 128-1. Pinned: `tests/sync-scene-scope.test.js` — restoring the exact, non-recursive predicate fails the descendant case. New 🤖 row **INC-1** drives the incantation live.

## 152. [x] (2026-09-14, PR #382) `deploy-cycle.js`'s no-bench-worker guard reads a SQUASH-merged `pm/bench-*` branch as a live bench (its tip is outside `main`'s ancestry), and `gh pr merge --squash --delete-branch` left the remote branch in place — the 01:12 deploy refused on `origin/pm/bench-47` after bench 47 had merged (TOOLING + DOCS) (2026-09-14)

**Why:** item 125's guard counts a `pm/bench-*` branch, local or remote, as a live bench unless it is merged into `origin/main` by ancestry. Bench PRs are squash-merged whenever their commits carry model trailers (bench 45, bench 47 — iron rule 6), which leaves the branch tip outside `main`'s ancestry; and on 2026-09-14 `gh pr merge 376 --squash --delete-branch` deleted the local branch but NOT the remote one, so the first deploy after the bench (01:12 ET) refused on `origin/pm/bench-47` until the PM deleted the branch by hand (`git push origin --delete pm/bench-47`) and re-ran. The guard was right by its rule and wrong in fact; a PM that did not know the cause would have reached for `--force-bench`, which is Ben's call.

**What to do:** teach the guard that a bench branch whose PR is MERGED (any merge method) is not a live bench — read `gh pr list --state merged --head <branch> --json number` (or the GitHub API) from the guard, falling back to today's ancestry test when offline — as a pure decision in `scripts/lib/deploy-guards.js` pinned against a fixture (a squash-merged branch with a merged PR → PASS; a branch with an open PR → REFUSE; a branch with no PR and unmerged → REFUSE; the reversion shown failing), and print the reason it decided ("merged as PR #N (squash)"). And make the PM's merge recipe explicit where the PM reads it (`.claude/skills/project-manager/SKILL.md` step 5 and the runbook's agent-run-deploy section): after ANY squash merge, confirm the remote branch is gone (`git ls-remote --heads origin <branch>`) and delete it if it is not — `--delete-branch` is not proof.

**Done when:** the fixture pins pass with the reversion failing; `--dry-run` names a merged squash branch as merged; the two docs carry the recipe.

**PM:** lane R · model sonnet · size XS · deps 125 ✓ · verify: the pins + a `--dry-run` printout. Filed 2026-09-14 by the PM from the 01:12 deploy refusal.

## 153. [x] (2026-09-14, PR #386) Bestiary census — `scripts/bestiary-census.js` → `docs/analysis/bestiary/CENSUS.md`, the 52 blocks measured as one report (TOOLING + DOCS, no rebuild)

**Why:** the bestiary redo (item 121) has to measure before it redesigns, and R-101 (a) lets adversary HP and damage be read as a yardstick — but nothing printed the bestiary as a whole. The lore-forge roster rule counts the colour ledger by hand; the "automation" share was never split into cues vs effects; nobody had listed which blocks inherit the 5-ft sight default or which engine primitives only an adversary consumes.

**What landed:** the script (deterministic — sha1 stamps, no dates), `--write` / `--check` / `--json`; the report (roster, role bands min–avg–max, colour ledger with pairs ½, every block on one row with senses/movement stated-vs-derived, wiring shapes, sole-consumer handler types, status ids canon / edha-custom / unknown, damage types); `tests/bestiary-census.test.js` pins the parser and fails while the committed report is stale (the dashboard's sync discipline). Found on the first run: 51 of 52 blocks see 5 ft; 74 of 185 rules are GM cues; 41 of 52 carry skill ranks doing an attribute's work; 5 handler types have only adversary consumers; the legacy nine are 9 of the 10 unattuned blocks.

**Done when:** DONE — gates 12/12; the census test is in the suite.

**PM:** lane B · model — (done by the scoping session) · size M.

## 154. [x] (2026-09-14, PR #386) `bestiary-forge` skill — the adversary surface's one owner: SKILL.md + STANDARD.md + DESIGN_SEEDS.md + TURN_LEDGER.md, pointers from the four layer-skills, three stale lines fixed (DOCS + a schema note, no rebuild)

**Why:** item 82's first sentence — *"find where the bestiary statting standard lives"* — had the answer nowhere. Concepts lived in lore-forge 4b/4c, wiring in leyline-tree-authoring §"Adversary abilities", encounters in session-forge, talent lists in build-forge Phase 5; the numbers were set block by block against the old cheatsheet; two of those sections carried lines eight weeks stale.

**What landed:** the skill (loop, standard with RULED / MEASURED / PENDING on every line, the design-seed ledger R-76's close-out said did not exist, the yardstick recording template); pointer paragraphs in lore-forge 4c, session-forge, tree-authoring, ENGINE_INDEX, CLAUDE.md (map row + routing sentence) and the handoff; fixes — the "⚑ pending retro sweep" (ran 07-20, canon ruling 123), two ENGINE_INDEX lines reading TIER for role rank (ruling 122), the renamed-adaptation paragraph re-cut post-2b, the data `_README`'s purpose line and 10-ft senses note (item 83 made it 5).

**Done when:** DONE — the skill is listed by the harness; gates 12/12.

**PM:** lane H · model — (done by the scoping session) · size M.

## 155. [x] (2026-09-14, PR #388) Bestiary yardstick fights — three bench fights on copies of the actual PCs, recorded on the turn ledger (🤖, DOCS-ONLY; the census's played half)

**Why:** the census counts per hit; R-134's targets need per turn — Actions spent, hits against the party's real defenses, the graze floor — and the ecosystem critique named the turn ledger as *"the one follow-up measurement that would most change a decision."* Bench run 44 already did this once for the ford (18 to the party, 7 to the raiders; no ranged attack, grazes flooring damage) and it changed the run-sheet. R-135 (a) runs this set BEFORE the first nation pass.

**What to do:** `bench-run` drives the three rows in `EDHA_FOUNDRY_TEST_CHECKLIST.md` § "Bestiary yardstick fights" (YARD-1 Rootling Swarm ×3, YARD-2 Mistheron ×2, YARD-3 Briar-Gone Grove) against copies of the three PCs on a licensed scene, numbers as on the cards, grazes charged, world restored; records each on `.claude/skills/bestiary-forge/TURN_LEDGER.md`'s shape into `docs/analysis/bestiary/YARDSTICK-<date>.md`; anything structural goes to `test-pass-fixes` as a report.

**Done when:** three ledgers committed; the share of Actions a sheet fills, damage in/out per round over the party HP pool, and enemies per round are stated per fight; R-134's ask carries the measured numbers beside its defaults. — **DONE 2026-09-14 (bench run 48):** the three fights are in `docs/analysis/bestiary/YARDSTICK-2026-09-14.md` on the ledger shape (per-round damage in/out over the pools, every PC Action coded T/D/N, enemies per round, the set read against R-134's targets); R-134's measured numbers sit in the standard's §3 beside its defaults; four structural defects filed as items 161–164; one ruling, R-136.

**PM:** lane B · model opus (`bench-run`) · size M · deps a live Foundry with the current packs; no ruling.

## 156. [ ] Bestiary data pass, nation by nation — act-1 nations first, each behind the statblock gate (DATA, adversaries REBUILD + ⟳ Sync per nation)

**Why:** the redo's content step (item 121 part 3). Every block gets the standard's fields (`movement` stated; `senses` or attributes per R-128), its cues labelled and converted per R-129, its numbers read against R-134's targets, in the order R-135 fixes; new creatures come from canon §5c's clusters through the lore gate.

**What to do:** per nation — `bestiary-forge` Phases 1–6: census before, blocks in full to Ben, census diff after, one 🤖 row per changed block, the yardstick ledger consulted for the retune. Start with Corvaine + the Riverlands (session 1's blocks), then Thalendor (session 2's grove), then Malcurr.

**Done when:** every bestiary folder has had its pass; the census's §4 shows no `(d)` senses on a creature that should see, every rule's description carries its cue-or-effect label, and the bands sit inside R-134's targets or say why not.

**Progress — 2026-09-14, Corvaine + the Riverlands DONE (PR #388), Ben's yes at the statblock gate ("Yes on all six numbers and the Line-Warden concept, commit it"):** Corvaine Raider / Line-Caller HP 10, Deflect 1, 1d6+1; Roek HP 24; Mistheron's beak 1d6+2; Tollbird Flock and Surecat unchanged in number; all six state `attributes` with every old skill total carried by an attribute and Investiture stated; twenty-four rule descriptions labelled (twelve cues, twelve effects, zero conversions — every cue names a table decision); the census reads a stated AWA; the Corvaine Well-Warden landed (item 158's Corvaine slot). Next nation: **Thalendor** (session 2's grove — the Rootling Swarm and the Briar-Gone Grove carry YARD-1 / YARD-3 evidence: a rootling took 2–3 Actions to drop, the grove's terrain and its own Thorn Field are items 162 / 164), then Malcurr.

**Progress — 2026-09-15, the attack-model rerun (item 166) and the Thalendor pass, Ben's yes at the gate page ("you have my permission to continue with everything as presented and defaults on all rulings"):** the seven Corvaine + Riverlands blocks re-statted on the PC attack model (R-137 — one skill modifier on test and damage: Raider and Line-Caller +2 for 1d6+2, Roek +3 for 1d8+3, Mistheron +2 for 1d6+2, Tollbird an Agility +2 for 1d4+2, Surecat an Agility +3 for 1d8+3, Well-Warden +1 for 1d6+1) with their defenses derived (R-139 (a)); **Thalendor DONE** — Rootling Swarm HP 6 / Deflect 0 / +2 for 1d6+2 with STR 1 SPD 2 AWA 1, Briar-Gone Grove's Bough +4 for 1d8+4 on STR 3 (the d8 graze), Crownox Ring +3 for 1d8+3, Reeve-Owl an Agility +3 for 1d8+3 with its Focus regain an effect and Apex Predator on the Green talent's rule; every rule labelled per R-129; the Preacher of the Lowered Crown (item 158). The census reads 12 blocks on the PC model and 42 still flat — item 167 carries the rest. Next: Malcurr.

**PM:** lane H · model opus per nation (sonnet for a mechanical-only nation) · size L · deps R-128, R-129, R-134, R-135 — all answered (a) 2026-09-14; item 155's ledgers first (R-135 (a)).

## 157. [x] (2026-09-14, PR #387) The nine legacy playtest-dungeon blocks — per R-130 (a): the `Legacy — Playtest Dungeon` folder (DATA, adversaries REBUILD + ⟳ Sync owed)

**Why:** Trooper … Mutated Thrall are the 6-room test dungeon the data file began as, not Thyrcross fauna; they carry no folder, six are the only users of `data/adversary-effects.json`, and three are sole consumers of engine primitives (census §6). R-130 decides their fate.

**What to do:** (a) a `Legacy — Playtest Dungeon` folder (the default: a `folder` field on nine blocks, the census re-run); (b) delete after re-pinning `edha-pack-advantage`, `edha-thorns`, `edha-dark-veil` on a fixture; (c) reskin through the lore gate.

**Done when:** the option Ben picks is applied; `_README`'s purpose line matches; census green. — **DONE 2026-09-14 (R-130 (a), answered 23:22 ET):** the nine carry the folder; `foundry-build.js` creates the old top-level fallback only when a block lands in it (none does — the scratch build prints 14 folders, `Legacy — Playtest Dungeon` among them and no `Playtest Adversaries`); the census counts them apart by folder name (a synthetic case pins it); schema notes updated; gates 14/14 with `--ci`.

**PM:** lane B · model — (done by the close-out session) · size S · deps R-130 ✓.

## 158. [ ] Invested-human adversaries — per R-131 (DATA, adversaries REBUILD; lore gate first)

**Why:** W29 named invested humans the mechanical-balance lever and two of 52 blocks carry tree talents; the party (Blue / White / Green) will otherwise never see Red, Black or the deity trees it does not hold.

**What to do:** per R-131's answer — concepts from canon §5b's named factions at the lore gate, kits of as-written talents (`python scripts/validate-build.py --adversaries` for the cost print), blocks through the statblock gate, one per nation pass if (a).

**Done when:** the humans Ben approved are in their nations' folders with 🤖 rows; the census's "tree talents on blocks" line reflects them.

**Progress — 2026-09-14, Corvaine's slot filled (PR #388, canon ruling 165):** the **Corvaine Well-Warden** (rival, Black — the riverlands' ground colour and a tree the party lacks; kit Dread Presence / Hollow Command / Coercive Pressure as written) approved at the lore gate and statted at the statblock gate in one yes; row 156-7; the census reads 8 talents on 3 blocks. Thalendor's and Malcurr's humans ride their nation passes.

**Progress — 2026-09-15, Thalendor's slot filled (canon ruling 166):** the **Preacher of the Lowered Crown** (rival, **White-attuned** — Ben, 2026-09-15: "The Corvaine human enemy was black, so this one should be white" — Sovereignty-aligned with White 2 and Black 2 for the tree's gate; kit Censure / Decree of Ruin / Expose as written, Decree off-tree by Black 3 under R-94's licence) approved at the lore gate and statted at the statblock gate in one yes, on the PC attack model (Pilgrim's Staff SPD 1 + Light Weaponry 1 = +2 for 1d6+2; defenses derive 11 / 13 / 14); row 156-22; the census reads 11 talents on 4 blocks. Malcurr's slot is next.

**PM:** lane H · model opus · size L · deps R-131 answered (a) 2026-09-14; rides item 156's nation passes, lore gate first.

## 159. [x] (2026-09-14, PR #387) The three shelved bestiary rows that are card rules — Crownox ring adjacency, Heat of the Flats' shade, swarm bookkeeping — per R-133 (a) (DATA card text, adversaries REBUILD + ⟳ Sync owed)

**Why:** five feel rows were shelved on 2026-09-13; three of them ask for a written rule, not a perception, and can be answered without play. R-133 carries the proposed texts.

**What to do:** put the answered rules on the three cards (Crownox Ring, Heat of the Flats' carrier block, the swarm blocks under the Wake-Eel precedent), keep the `noHook` reasons where no hook exists, retire the three checklist rows on the text landing, leave the two feel rows (Cinderbrock PITIABLE, Dirgehounds pack-or-mob) shelved until a session plays them.

**Done when:** the three cards carry the rules verbatim; lint passes 5/6 green; census green; the three rows retired with the ruling cited. — **DONE 2026-09-14 (R-133 (a), answered 23:22 ET):** (i) Crownox Ring / The Ring carries the adjacency rule (within 5 ft of another ring ox, R-52's slack); (ii) The False Spring / Heat of the Flats carries the shade clause on the card and on the whispered cue; (iii) the swarm rule on Tollbird Flock and Wake-Eel Shoal stands as written with its `noHook` — no change. The three checklist rows retired; a 🤖 row checks the two card texts after ⟳ Sync; the two feel rows stay shelved until play.

**PM:** lane B · model — (done by the close-out session) · size S · deps R-133 ✓.

## 160. [x] (2026-09-14, PR #387) Adversary blocks may state `attributes` — the build derives the token's Senses Range from AWA and the pool from max(AWA, PRE) (R-128 (a); TOOLING, pack byte-identical until a block states them)

**Why:** R-128 (a), answered 2026-09-14 23:21 ET with Ben's gloss (*"Senses range of 20 feet means it can sense things 20 feet away with its primary sense obscured. That is- in dim light. In a normally lit room it should see as far as the light goes."*). Every block had attributes 0, so 51 of 52 saw 5 ft in the dark and 41 of 52 carried skill ranks doing an attribute's work.

**What landed:** `scripts/foundry-build-parts.js` — `ATTRIBUTE_IDS`, `advAttributeValues`, `advAttributes` (only the stated keys, `{value}` each, null when none), `advInvDefault` (2 + max(AWA, PRE) for an attuned block), and `advSensesRangeFt` reading the ladder at the block's AWA with the explicit `senses` override still winning; `scripts/foundry-build.js` writes `sys.attributes` when stated and derives the pool through the helper; `tests/adversary-attributes.test.js` pins the parity shape (no key → nothing written, 5 ft, inv 2) and the derivations; the schema note documents the key and the gloss.

**Done when:** DONE — gates 14/14 with `--ci`. The values are item 156's per-nation work (R-135 (a)), never a bulk batch.

**PM:** lane B · model — (done by the close-out session) · size S.

## 161. [x] (2026-09-15, PR #398) Dead adversaries keep whispering their enemy-turn-start cues — `edhaTurnCueSweep` never checks that the cue's owner is alive (ENGINE-ONLY, F5)

**Why:** bench run 48 (YARD-1): Rootling Swarm (2) dropped to 0 (system status `dead`) in round 1 and still posted "⏰ Territorial Instinct … (Bench Copy — Ishee's turn starts in range.)" at round 2's first hostile turn start, beside the two living rootlings; its Disoriented expiry also announced at its next turn change. Root cause read in source: `module-src/scripts/engine/07-edha-owner-list.js` `edhaTurnCueSweep` (the enemy-turn-start loop over `canvas.tokens.placeables`) filters on hostility and `edhaStillFightingElsewhere` only — no `hp <= 0` / `dead` / `combatant.defeated` check.

**What to do:** skip owners at 0 HP or carrying `dead` (and a combatant marked `defeated`) in the enemy-turn-start loop and the turn-end / regen branch, through one pure eligibility helper pinned in `tests/` (dead owner → no cue; living owner → cue; removing the check fails the test by mutation). Check whether `edhaGmCueDamageSweep`'s hp-below path needs the same gate.

**Done when:** a dead rootling posts nothing at a hostile's turn start; gates green; ENGINE_INDEX §"GM cue cards" carries one sentence.

**PM:** lane B · model sonnet · size S · deps none. Report: bench run 48, `docs/analysis/bestiary/YARDSTICK-2026-09-14.md`.

## 162. [x] (2026-09-15, PR #398) Green terrain's Thorn Field hazard damages its own creator — the region behaviour is built without `exemptActorUuid` (ENGINE-ONLY, F5)

**Why:** bench run 48 (YARD-3): the Briar-Gone Grove's Draw Mana square landed under its own 2×2 token and the card read "Briar-Gone Grove takes 1 keen from dangerous terrain (Thorn Field — Briar-Gone Grove)"; at its next turn start it took 3 keen from the same square. The `edha-content.hazard` behaviour has an `exemptActorUuid` field that `_handleRegionEvent` honours (`53-native-event-system.js`, R-6) and Destruction's placer passes it (`40-destruction.js` `edhaPlaceHazardRegionGM`) — `50-green-territory.js` builds the Thorn Field behaviour with `{damageFormula, damageType, sourceName}` only. The card says "any character entering or starting their turn inside it"; the grove is not a character and the briar is its own body.

**What to do:** pass `exemptActorUuid: owner.uuid` where `50-green-territory.js` builds the hazard behaviour (and the Green branch of the burst path in `39-burst-execution-the-gm-socket-relay.js` if it does not already take that route); pin it (owner inside its own zone → no tick; a hostile inside → tick). Decide in the same change whether the hazard should skip DOWNED characters — bench run 48 saw two PCs at 0 HP "take" 2 and 1 keen from Sudden Growth's detonation — a ruling if Ben wants it, otherwise leave.

**Done when:** a grove starting its turn in its own briar takes nothing; gates green; the ENGINE_INDEX line on Green terrain notes the exemption.

**PM:** lane B · model sonnet · size S · deps none. Report: bench run 48.

## 163. [x] (2026-09-15, PR #398) Pack Hunter's banked advantage has no target gate, counts a downed ally, and missed an ally beside a Large token (ENGINE-ONLY, F5)

**Why:** bench run 48. (a) The card says "2 hunter(s) gain advantage on their next attack against Rootling Swarm (2)"; the flag it writes is `advAttackNext` (`52-green-instinct.js`), consumed by the next attack roll against ANY target — Ishee's banked advantage vs the dead root2 rolled 2d20kh on her Staff vs root1. The talent text says "against it". (b) With Soggy at 0 HP adjacent to root3, Pack Hunter counted "2 hunter(s)". (c) With Ishee adjacent to the grove's 2×2 token (centre gap 7.5 ft) it counted "1 hunter(s)" — the ally-adjacency read fails against a Large token (the medium-token case counted 2). Handler: `edha-adv-attack` `pack` mode in `53-native-event-system.js`.

**What to do:** stamp the target token's uuid on `advAttackNext` and have `edhaAdvAttackPreRoll` honour it (consume only when the roll's user target matches; keep the targetless form for rules that bank a plain advantage); exclude allies at 0 HP from the pack count; read ally adjacency through the edge-aware helper the ally-drops cue uses (R-52 slack against the token EDGE, not the centre) so a Large target counts adjacent mediums. Pin all three.

**Done when:** the three cases above behave as the card says; gates green; ENGINE_INDEX's `advAttackNext` line names the gate.

**PM:** lane B · model sonnet · size S · deps none. Report: bench run 48.

## 164. [x] (2026-09-15, PR #398) The Green 10 ft terrain square lands one cell off the click (ENGINE-ONLY, F5; verify the snap rule before fixing)

**Why:** bench run 48 (YARD-3): the Draw Mana prompt "Click where the 10 ft difficult-terrain square grows" was answered with a real mouse click at world (1348, 1100) — the grid vertex between two PC tokens — and the region landed at rect (1400, 1100) 200×200, cells 14–15 × 11–12: one cell right and half a cell down of the click, under no PC. `edhaSnapCellRect(scene, cx, cy, 2)` (`50-green-territory.js`) anchors an even-sized square from a point the picker snapped to a cell CENTER (`edhaPickPoint`, `GRID_SNAPPING_MODES.CENTER`); a 2-cell square cannot be centred on a cell centre and the vertex case chose the wrong corner. Sudden Growth's burst from a click at (1348, 1000) landed at (1300, 1100) — also not centred. PLAUSIBLE: two observations, no headless proof yet.

**What to do:** read `edhaSnapCellRect` and the picker's snap mode; decide the rule (an even square centred on the nearest VERTEX, an odd square on the nearest cell centre), pin it headless (a click at a vertex covers the four cells around it), and re-drive the placement once on the bench. The feel of template placement stays Ben's (⚑); the cell arithmetic is not.

**Done when:** a click between two adjacent tokens covers both; gates green.

**PM:** lane B · model sonnet · size S · deps none. Report: bench run 48.

## 165. [x] (2026-09-15, PR #392) The bench roster script's PROTECTED list does not name Ishee — Hannah's actor is guarded by a placeholder name that no longer exists (TOOLING, no deploy)

**Why:** `scripts/bench-setup-console.js` refuses writes to `["tem parinaem", "soggy bottom", "temp name hannah character"]`, the names the campaign state doc used when the guard was written. In the world on 2026-09-14 the third player's actor is named **`Ishee`** (`Edha PCs` folder, Envoy · Blue · Chaos, level 1); the placeholder name resolves to nothing. Bench run 48 found it while copying the three PCs for the yardstick fights — the copies were made by hand, so nothing was touched, but any roster or orphan-repair pass that trusts the list would not treat Ishee as protected (PM-R17 covers her like the other two: refresh only, never edit).

**What to do:** add `"ishee"` to `PROTECTED` (keep the placeholder too — a rename back must not unguard her), and make the guard also protect every actor in the `Edha PCs` folder by folder id so the next rename cannot reopen the gap; pin the folder rule in `tests/bench-setup-console.test.js` if that harness exists, else in the script's own pure helper. Update `EDHA_CAMPAIGN_STATE.md` §1's PC-1 heading only if Ben confirms "Ishee" is the settled name (it is marked ⚑ placeholder there).

**Done when:** `bench-setup-console.js` throws on any write aimed at Ishee by name or by folder; gates green.

**PM:** lane B · model sonnet · size S · deps none. Report: bench run 48.

## 166. [x] (2026-09-15, PR #390) A stated Strength or Speed added to an adversary's attack AND its damage on top of the flat card numbers — the PR-#388 blocks rolled +6 for 1d6+3 where the card read +4 for 1d6+1 (R-137: the PC attack model and its gate; R-139 (a): derived defenses — TOOLING + DATA, adversaries REBUILD + ⟳ Sync)

**Why:** from July the build wrote every adversary attack as a Heavy / Light Weaponry test with the block's whole attack bonus in `modifierFormula` and the whole damage inside the formula ("so PDF numbers hold at any skill rank") — right only while every block's attributes were 0. The cosmere system rolls an adversary's item exactly as a PC's (skill rank + attribute on the d20, the same modifier appended to the damage), so once R-128 (a) let blocks state attributes and PR #388 stated them on seven, those seven rolled STR / SPD on top of both numbers — verified live 2026-09-15 on fresh imports (Corvaine Raider Shortsword `1d20 + 2 + 4` and `1d6 + 1 + 2`; the attribute-less Cinderhound control `1d20 + 0 + 4`). R-128's menu had said attack modifiers "would not move under any option"; nothing in the gates could see it.

**What was done (Ben's ruling R-137, 2026-09-14 — adversaries follow the same rules as the PCs — and R-138 … R-140 answered "defaults on all rulings" 2026-09-15):** the PC attack model in `scripts/foundry-build-parts.js` (`advAttackModel`: a block that states `attributes` derives attack and damage from attribute + rank, its card prints the derived total, its damage is dice-only, a to-hit-only grab states `attackSkill`); the `adversary-model` gate (`scripts/validate-adversary-model.js`, wired into `scripts/gates.js`) that fails a flat attack or a flat inside the damage on a migrated block and counts the flat-model population, pinned by `tests/adversary-model.test.js` (STR 2 + a flat +4 must fail); R-139 (a) — a PC-model block's defenses derive (the build writes no override, the gate refuses a stated pair that disagrees, `validate-adversaries.js` expects none in the pack); the census derives `(pc)` attacks and defenses and counts both populations; the eleven migrated blocks re-statted (the seven of PR #388 with their approved attributes, HP, Deflect, Focus and Investiture; the four Thalendor blocks) and the Preacher of the Lowered Crown (item 158); the schema notes, STANDARD.md §2–§3, the engine index and the two build comments no longer say attributes are 0. Flat-model blocks build byte-identically (scratch-build diff: 42 identical); the 46 → 42 that remain are item 167.

**Done when:** DONE — `node scripts/gates.js --ci` green on the branch; the census reads 12 on the PC model / 42 flat; the gate on main's data at 2cd2f23 fails exactly the seven PR-#388 blocks.

**PM:** lane H · model fable (the rerun) · size L · deps R-137 … R-140 — all answered.

## 167. [ ] Migrate the 42 flat-model adversary blocks onto the PC attack model, nation by nation (DATA, adversaries REBUILD + ⟳ Sync per nation)

**Why:** item 166 built the model and the gate; 42 of 54 blocks still state a flat `attack` and a flat inside their damage with attributes at 0 — right at the table only because those attributes are 0, and one stated attribute away from the defect item 166 fixed. R-135 (a) says values land nation by nation behind the statblock gate, never as a bulk batch.

**What to do:** in each remaining nation pass of item 156 (Malcurr next, then the rest in canon order, then the nine legacy dungeon blocks): state `attributes` (R-128) and the weapon-skill ranks; convert every attack to dice-only damage with the skill derived by range or stated as `attackSkill`; omit `defenses` and choose attributes that derive the numbers the block needs (R-139 (a)); read each line as expected damage per attack against R-134's rows (R-140 (a)); label every rule (R-129); present the blocks in full at the statblock gate; `node scripts/bestiary-census.js --write` and diff. `node scripts/validate-adversary-model.js` prints the derived line for every migrated block and counts the rest.

**Done when:** the census's §1 "Attack model" row reads 0 still on the flat model and the gate prints a derived line for every block.

**PM:** lane H · model opus per nation · size L · deps item 166 (landed); rides item 156's remaining nation passes.

## 168. [x] (2026-09-15, PR #398) ⟳ Sync Talents reports the cosmere system's own basic actions as "not found in packs" — every real PC's toast says "— 19 not found" on a clean sync (ENGINE-ONLY, F5) (2026-09-15)

**Why:** measured at **bench run 49a (2026-09-15)** doing the PM-R17 refresh. The sheet's own ⟳ Sync Talents button on each of the three players' actors posted *"Edha: synced 8 item(s) on Tem parinaem (4 talents, 3 paths, 1 action) — 19 not found in packs (see console)."* — identical counts on Soggy Bottom and Ishee — and the console listed the same nineteen every time: `Dodge, Common Actions Pack, Gain Advantage, Avoid Danger, Basic Actions Pack, Use A Skill, Drop, Strike, Grapple, Ready, Brace, Aid, Reactive Strike, Move, Recover, Banter, Interact, Shove, Disengage`. Those are the cosmere system's native basic actions (read live on Tem parinaem's `Dodge`: `type: "action"`, no `flags` scope at all, no `_stats.compendiumSource`), not Edha pack items. Root cause in `module-src/scripts/engine/26-talent-sync.js`: item 146 widened `EDHA_SYNC_TYPES` to `["talent", "path", "action"]` (line 31) so Draw Mana would refresh, and `edhaSyncActorTalents` (lines 92–102) now treats EVERY owned `action` as a candidate — the only exclusion is an adversary-flagged embed (line 100) — so each native action misses both source keys in `edhaSrcFor` and lands in `missing`, which the toast prints (line 167). Nothing is written to them (they are skipped, not updated), so this is noise, not damage — but it is the exact noise that hides a real miss: a renamed or pack-deleted talent now reads as one more line under nineteen. The bench PCs never showed it (the roster script's actors own only Draw Mana), which is why fix pass 12's pins and bench run 47 did not see it.

**What to do:** make an owned `action` a sync candidate only when it came from an Edha pack — `item.flags?.["edha-content"]` present (the owned Draw Mana carries `{core: true, drawMana: true}`) — and silently skip an unflagged native action: not counted missing, not updated. Before landing, read every `action` document in the three atlas packs and confirm each carries an `edha-content` flag (if one does not, key the gate on a pack-source match instead and say why). Talents and paths keep today's behaviour (a flagless talent is still reported missing). Pin it in `tests/sync-item-types.test.js`: a native flagless `Dodge` is neither updated nor listed missing; an Edha Draw Mana still syncs; a renamed Edha talent is still reported missing; show the reversion failing.

**Done when:** a ⟳ Sync Talents click on a character owning the system's basic actions reports no "not found" for them; the pin is green; one 🤖 row re-drives the sync on a bench character carrying the nineteen native actions (a toast with no "not found" suffix).

**PM:** lane B · model sonnet · size S · deps none. Filed 2026-09-15 by bench run 49a.

## 169. [ ] Seven more talents still carry an item-level `damage.formula` beside the engine rule that deals their damage — the system rolls a decoy with Apply buttons on every use, pass or fail (item 141's defect in Red, Chaos and Power) (DATA, REBUILD leyline + deity + ⟳ Sync Talents) (2026-09-15)

**Why:** measured at **bench run 49a (2026-09-15)** while driving OM-3 … OM-5. A `skill_test` talent with a `system.damage.formula` makes the cosmere system roll that formula as a real `DamageRoll` in its own use message, and the card carries the system's **Apply Damage (1 / ½ / 2 / 1) and Reduce Focus buttons** — while the engine's `edha-triggered-effect` damage rule applies the talent's actual damage separately. Live: `Entropy Strike`'s system message rolled `2d8 + 5` = 12 on a FAIL (10 vs COG 11, no damage due at all) and 12 / 14 / 11 beside the engine's own *"⚡ Entropy Strike (Bench — Chaos) — 10 / 8 / 9 spirit"*; `Isolating Pressure` rolled `DamageRoll 2d8 + 2 + 5` (vital) = 10 and 17 on two FAILs, 9 on the placement-branch SUCCESS (where the card says no damage is dealt), and 12 on the shatter take where the engine applied its own 6. The trailing `+ 5` is the skill modifier the system appends to damage (the R-137 finding), so the decoy is not even the card's number. A GM who clicks the system card's Apply button deals the damage twice, at the wrong total. Item 141 fixed exactly this on the three Knowledge cash-outs and scoped itself to them; a read-only scan of the built packs (all three atlases, `system.damage.formula` non-null AND an `edha-triggered-effect {kind: damage}` rule) finds **five `skill_test` talents** — Red's `Volatile Strike`; Chaos's `Isolating Pressure`, `Isolating Ruin`, `Cascade Collapse`, `Entropy Strike` — and **two `utility` talents** whose cards would offer the system's damage button — Power's `Unstoppable Advance`, Chaos's `Unravel Everything`. (52 talents carry a formula in all; the rest either have no engine damage rule or read the formula on purpose — e.g. `Set Charge`'s blast and `Hexmark`/`Inevitable Snare` read their own `system.damage.formula` — and are NOT in scope. **Adjacent, and not fixable the same way:** `Set Charge`'s own use message rolled its blast formula at PLACEMENT — `2d8` = 10 and 11 on two placements at bench run 49a — although nothing is damaged until detonation; its formula cannot simply be blanked because `edhaSetChargeMarker` copies `item.system.damage.formula` into the ledger entry, so the fix there is to move the blast formula into the `edha-zone` rule and read it from the rule. Say which way it went in the PR. **And the scan's criterion under-counts:** it matched only `edha-triggered-effect {kind: damage}` rules, but `Cascading Failure` (Destruction, `utility`) deals its damage through `edha-detonate-list`, which rolls each Charge's stored formula and its own `doubleCaughtFormula` — never the item's — and its use message still rolled the item formula (`2d4` = 7 at bench run 49a, beside the detonation card's own `2d4 / 2d4 / 2d8`). Widen the sweep to every engine damage handler that does not read `item.system.damage.formula`, and add any talent it finds to this item.)

**What to do:** item 141's recipe per talent: read the rule that deals the damage and confirm it does not read `item.system.damage.formula` (a rule whose formula field is blank and falls back to the item's — as `edha-ward` does — needs the formula moved INTO the rule first); then blank the `damage` block (`{formula: null, type: null}`, `grazeOverrideFormula` too) in `data/authored/leyline-red.json`, `deity-chaos.json`, `deity-power.json`, with the source prose untouched. Scratch-build leyline + deity into `$TEMP` (`EDHA_DATA` pinned to the worktree), `validate-packs.js` green, read the packs back: only those documents differ, in `system.damage` only. Consider a lint that fails a talent carrying both a formula and a triggered damage rule unless the rule reads it.

**Done when:** none of the seven posts a system damage roll or damage button on use; their engine damage still lands; parity stated; one 🤖 row per tree (Entropy Strike's card has no Apply buttons and its ⚡ damage still lands; Volatile Strike the same).

**PM:** lane B · model sonnet · size S · deps none (item 141 is the precedent). Filed 2026-09-15 by bench run 49a.

**Progress (2026-09-15, PR #396, open — bounced back for a narrower re-scope):** the worker's first
pass blanked all thirteen (the seven named + Cascading Failure + five more the same sweep found:
Necrotic Cascade, The Unmooring, Withering Touch, Momentum of Victory, Warlord's Advance) and
proved pack parity — but pack parity only diffs the LevelDB document, and PM review found two
RUNTIME side effects a document diff cannot show. Three of the thirteen blanked cleanly and stay
blanked in #396: **Momentum of Victory, Warlord's Advance, Withering Touch** (verified: `utility`
activation, so no d20 test of their own to reclassify; their `edha-damage-bonus` rider carries its
own required `amountFormula` and never reads `item.system.damage`; Warlord's Advance/Withering
Touch also declare an explicit `color` on that same rule, and Momentum of Victory's colour was
never formula-derived to begin with — a bare `@tier`). The other ten are held, restored
byte-identical to `main`, pending a ruling:
- **Attack context (5 talents — Volatile Strike, Cascade Collapse, Entropy Strike, Isolating
  Pressure, Isolating Ruin):** all `skill_test`. The cosmere system rolls a `skill_test` item's own
  test through `rollAttack` (context `Attack`) only when the item carries a damage formula, else
  through `roll()` (context `Item`). `edhaTestCtxMatch`
  (`module-src/scripts/engine/01-shared-core.js:541`) lets an `appliesTo: "attack"` test rider ride
  an `Item`-context roll only when the source still carries a damage formula — blank it and that
  door closes. `edhaAggroRecord` / `edhaPackAdvantageApply`
  (`01-shared-core.js:781`/`790`) check `system.damage.formula` directly and no-op without it, so a
  blanked skill_test talent's own roll stops recording aggro and stops being eligible for pack
  advantage.
- **Colour (5 talents — Unravel Everything, Unstoppable Advance, Cascading Failure, The Unmooring,
  Necrotic Cascade):** `edhaTalentColor` (`35-targeting-attunement-range-aoe-templates.js:31`)
  reads the damage formula FIRST, then `activation.skill`, then a rule's own `color` field, then
  `item.system.path`. All five are `utility` (no `activation.skill`) with no `color` field on any
  of their rules (`edha-triggered-effect`/`edha-detonate-list` don't have one), so blanking drops
  them to the `system.path` fallback — measured (not theorized): this does NOT resolve to null, it
  resolves to a DIFFERENT, usually WRONG colour, because a deity tree's `system.path` is
  `tree.color || slugify(group)` and several deity trees carry a `tree.color` unrelated to a given
  talent's true leyline identity (Destruction's own `tree.color` is `blue` while its red-formula
  talents are red; Power's is `black` while its red-formula talents are red). Measured before →
  after: Unravel Everything blue → black, Unstoppable Advance red → black, Cascading Failure /
  The Unmooring red → blue, Necrotic Cascade black → black (unchanged VALUE, but via the same
  fragile coincidence — Death's `tree.color` happens to equal its true colour today; nothing pins
  that). Consumers: the Attunement Range ⊙ preview button
  (`35-...js:105`/`138`, injected only when `edhaTalentColor` returns non-null) and Necrotic
  Grasp's heal-cut colour gate (`03-where-an-effect-lives.js:909`).

**A design question for Ben, via the PM:** should `edhaTalentColor`'s fallback chain gain a
generic per-rule `color` dial (the same shape Warlord's Advance/Withering Touch already declare on
their `edha-damage-bonus` rule) as the REQUIRED companion whenever a talent's colour was formula-
derived and the formula is blanked — or should the `system.path` fallback be removed/fixed for
deity talents instead, since it is not actually a reliable colour source? Either answer unblocks
restoring the other ten talents' data fix; this item stays open until it lands. Not filed as a
numbered ruling or a new TODO item per the PM's review — recorded here for the next session.

**Item 141 cross-check (report only, not touched):** of the three Knowledge talents PR #379
already blanked, `Killing Blow` and `The Final Study` are BOTH `skill_test` (`activation.skill:
"red"`) and so carry the SAME attack-context exposure already live on `main` — their own test roll
has resolved through `roll()`/`Item` context, not `rollAttack()`/`Attack`, since #379 merged;
nothing has audited whether any `appliesTo: "attack"` rider or the aggro/pack-advantage ledger
ever needed to ride either talent's own roll. Their colour is unaffected (`activation.skill: "red"`
is EDHA_LEY_COLORS-valid, so `edhaTalentColor` resolves via the 2nd tier regardless of the
formula). `Predatory Strike` is `utility` with an explicit `color: "red"` on its `edha-damage-bonus`
rider (`PredStrikeRider0`) — the same protective shape as Warlord's Advance/Withering Touch — so
it has neither side effect.

**Bench run 50 (2026-09-15):** the narrowed fix is live and benched — rows 169-PWR (Momentum of Victory,
Warlord's Advance) and 169-DTH (Withering Touch) retired on evidence: no roll and no Apply buttons on their arm
messages, and their riders still land (+2 impact; +7 impact with the survivor rider; +10 vital with the healing cut).
The item stays open for the ten held talents, which wait on R-142.

## 170. [x] (2026-09-15, PR #398) Vital Diagnosis's Diagnosed card still tells the table "+Tier vital" right after the engine says "+3" — item 108 moved the bonus to the Blue rank but left the rule's printed note, and two sibling rule texts, on "tier" (DATA, REBUILD deity + ⟳ Sync Talents; one ENGINE-ONLY hint string) (2026-09-15)

**Why:** measured at **bench run 49a (2026-09-15)** driving GATE-3 (which passed — the bonus IS the Blue rank, +3 at tier 2, from the owner and from an ally). The use card on `Bench — Life` read, verbatim: *"🎯 Vital Diagnosis : Trooper is Diagnosed (by Bench — Life) — damage against it gains +3 vital (auto-applied). Life (Anaveth). 1 Action, 1 Inv: target a creature, it becomes Diagnosed for the scene (token icon; remove manually at scene end). You and allies dealing damage to it deal +Tier vital - auto-applied to every damage application against it. Exact HP/conditions/defenses knowledge stays narrative."* The first sentence is `edhaStatusApplyCard`'s tail computed from `bonusDamageFormula: "@skills.blue.rank"`; everything after it is the rule's authored `note`, which `data/authored/deity-life.json` rule `NiiElTqWzyata6Pu` still writes with "+Tier vital" (its `description` says the same). The card text and the formula were changed by item 108; the note printed into chat beside them was not, so the chat log contradicts itself in one message — the same class as item 148 (Predatory Strike's stale cue text). Siblings found reading the same item's rules: Bulwark Ground's `BulwarkGuard0000` description still says "Temp HP = tier" (editor-facing, not printed), and the engine schema hint on `edha-apply-status.bonusDamageFormula` in `module-src/scripts/engine/53-native-event-system.js` (~line 1991) still offers "Vital Diagnosis: @tier" as its worked example.

**What to do:** rewrite `NiiElTqWzyata6Pu`'s `note` and `description` to say the bonus is the owner's Blue rank; fix `BulwarkGuard0000`'s description to "Temp HP = your White rank"; change the schema hint's example to `@skills.blue.rank` (engine-assembled source + `node scripts/engine-assemble.js`). Grep the rest of item 108's three talents (`Bulwark Ground`, `Cascading Failure`, `Vital Diagnosis`) for any other surviving "tier" in text a card or the Events tab shows. Scratch-build deity, `validate-packs.js`, parity (only those rule strings differ).

**Done when:** the Diagnosed card's note agrees with its own "+N vital" tail; one 🤖 row re-reads the card after REBUILD + ⟳ Sync.

**PM:** lane B · model sonnet · size XS · deps none. Filed 2026-09-15 by bench run 49a.

## 171. [x] (2026-09-15, PR #398) The `noreactions` status is still labelled "No Reactions (Extract Thought)", so Blue's False Premise card now reads "Adjacent A is No Reactions (Extract Thought)" — a Black talent's name on a Blue talent's status (ENGINE-ONLY, F5) (2026-09-15)

**Why:** measured at **bench run 49a (2026-09-15)** driving FP-1 (which passed): False Premise's success card read, verbatim, *"False Premise — Bench Target — Adjacent A is No Reactions (Extract Thought) ."* The label comes from the status registry in `module-src/scripts/engine/01-shared-core.js` (~line 202): `noreactions: { label: "No Reactions (Extract Thought)", … }`, written 07-05 when Black's Extract Thought was the only applier, with a comment that it "expires end of the OWNER's next turn". Item 107 / R-115 (a) (PR #374) made Blue's `False Premise` a second applier, stamping the TARGET's turn instead (`statusExpire: target`, measured `expireAfter {round 2, turn 0}` = the target's own next turn). The same label shows on the token's status tooltip and the effect's name, so the table sees a Black talent named on every False Premise.

**What to do:** relabel it to the condition alone ("No Reactions"); check its sibling `noactions` for the same "(<talent>)" suffix and treat it the same way; rewrite the registry comment to name both appliers and both expiry references; grep `tests/` for a pinned label string and update it. Engine source + `node scripts/engine-assemble.js`.

**Done when:** a False Premise success card reads "… is No Reactions."; one 🤖 row re-reads it on Bench — Blue.

**PM:** lane B · model sonnet · size XS · deps none. Filed 2026-09-15 by bench run 49a.

## 172. [ ] A triggered effect's resource-gain card prints the rule's declared gain even when the pool is already full — "Reeve-Owl regains 1 Focus" posts at 3 / 3 Focus (ENGINE-ONLY, F5) (2026-09-15)

**Why:** measured at **bench run 49b (2026-09-15)** driving 156-13, which passed on the numbers. The Reeve-Owl's Predatory Patience `edha-on-hit` rule (`edha-triggered-effect {kind: heal, formula: "0", resourceGainResource: foc, resourceGainValue: 1}`), fired by a Stoop of Office hit applied with `originatingItem`: against a Weakened creature at Focus 1 the pool went 1 → 2 and the card read *"⚡ Predatory Patience — Reeve-Owl regains 1 Focus . (On a successful attack against a Weakened creature, the reeve-owl regains 1 Focus.)"*; at Focus 3 / 3 the pool stayed 3 and **the same card posted, word for word**. Root cause in `module-src/scripts/engine/33-triggered-effect-resolution.js`: the heal branch builds `gainNote` from the RULE's declared value (line 163, `${eff.resourceGain.value} ${EDHA_RES_LABEL[…]}`), calls `edhaGainResource(owner, r.resource, r.value)` and discards the outcome (lines 182–185), then prints `${owner.name} regains <strong>${gainNote}</strong>` (line 200). `edhaGainResource` (`06-edha-prompt-pick.js` lines 216–224) clamps to the max but returns nothing, so the caller cannot know what landed. Same family as items 68 and 120 — a card says what the gate DELIVERED — and the heal half of this very branch already follows it through `edhaHealLine`; the resource half does not. **A second site, same run:** the Briar-Gone Grove's Draw Mana at Investiture 2 / 2 posted *"Briar-Gone Grove Draws Mana — recover 3 Investiture (highest leyline rank)."* while the pool stayed 2 → 2; `edhaDrawMana` (`52-green-instinct.js` lines 290–293) writes `Math.min(max, value + gain)` and then prints `recover ${gain}` from `edhaDrawManaYield`, not the difference it wrote (the Well-Warden's draw the same hour, 1 → 3 on "recover 2", was honest only because it had room).

**What to do:** make `edhaGainResource` return the amount actually gained (0 at max, on a non-positive request, or on a caught perms failure — read its other callers first and confirm none relies on `undefined`); build the gain clause from that return, and drop it (or print "already at full <resource>") when it is 0. Do the same in `edhaDrawMana`: print the Investiture actually recovered (`next − cur`), and say "already at full Investiture" when it is 0. Grep for any other card that prints a declared gain beside a clamped write. Pin it in `tests/`: below max → "regains 1 Focus"; at max → no "regains 1" claim; a Draw Mana at a full pool → no "recover N" claim; the reversion fails the pins. Engine source + `node scripts/engine-assemble.js`.

**Done when:** a Predatory Patience hit on a Weakened creature at a full Focus pool posts no gain claim, one below it still says "regains 1 Focus", and a Draw Mana at a full Investiture pool says so instead of "recover N"; one 🤖 row re-drives the owl at 3 / 3 and the Grove's Draw Mana at 2 / 2.

**PM:** lane B · model sonnet · size XS · deps none. Filed 2026-09-15 by bench run 49b.

## 173. [ ] An on-hit status rule gated on an Isolated target posts "Sapping Hex — no Isolated target to affect (target a token, then re-fire)." publicly on every hit against a creature that is not Isolated (ENGINE-ONLY, F5) (2026-09-15)

**Why:** measured at **bench run 49b (2026-09-15)** driving 156-13 and 156-5. All three Reeve-Owl Stoop of Office hits the run applied with `originatingItem` — two on a Weakened fixture with an ally adjacent, one on a bench PC with an ally adjacent — posted a public card *"Sapping Hex — no Isolated target to affect (target a token, then re-fire)."* beside the real Predatory Patience result. The Tollbird Flock's Sapping Hex against an Isolated PC carded correctly (*"Sapping Hex — Bench — Chaos is Weakened ."*). Root cause in `module-src/scripts/engine/33-triggered-effect-resolution.js`: line 246 resolves the targets, line 247 filters them through `edhaIsIsolated` for `spec.whenTargetIsolated`, and line 252 posts that message whenever the filtered list is empty. The message was written for a trigger card fired by hand with nothing targeted. From `edhaDispatchOnHit` (`04-black-ritual.js`, line 94 on, `ctx = { victim: target }` at line 131) the victim is always supplied, so an empty list there means "the creature hit is not Isolated" — the rule working — and "target a token, then re-fire" is wrong advice at the table. Every `edha-on-hit` status rule carrying `whenTargetIsolated` does it: the Reeve-Owl's and the Tollbird Flock's Sapping Hex, and any other copy of that rule shape.

**What to do:** when the context supplied a victim and the state filter removed it, return without a card (at most a GM-whispered "… is not Isolated — no effect", if the table wants the audit trail); keep today's message for the path where no target resolved at all. Pin both branches in `tests/`.

**Done when:** a Reeve-Owl hit on a creature that is not Isolated posts no Sapping Hex card, an Isolated hit still posts "… is Weakened", and a hand-fired card with nothing targeted still asks for a target; one 🤖 row re-drives both hits.

**PM:** lane B · model sonnet · size XS · deps none. Filed 2026-09-15 by bench run 49b.

## 174. [ ] Killing Blow and The Final Study have rolled their own tests as Item, not Attack, since PR #379 blanked their damage formulas — attack-scoped test riders, aggro and pack advantage skip them (awaits R-142) (2026-09-15)

**Why:** found by the PM's review of item 169 (PR #396, 2026-09-15). The cosmere system rolls a `skill_test` item through its attack path (d20 context `Attack`) only when the item carries a damage formula, and through `roll()` (context `Item`) otherwise. `edhaTestCtxMatch` (`module-src/scripts/engine/01-shared-core.js:541`) lets an `appliesTo: "attack"` test rider ride an `Item`-context roll only when the source still carries a formula, and `edhaAggroRecord` / `edhaPackAdvantageApply` (`01-shared-core.js:781` / `790`) return early without one. PR #379 (item 141) blanked `system.damage` on both talents — both `skill_test`, `activation.skill: "red"` — so since the 2026-09-14 deploy their own tests no longer count as attacks. Their colour is unaffected (it resolves through `activation.skill`). `Predatory Strike`, the third #379 talent, is `utility` with an explicit `color` on its own rule, so it has neither side effect.

**What to do:** R-142's answer decides the shape. Under (a), restore both formulas and set the new field that suppresses the system's own damage roll; under (b), nothing to restore once attack context comes from the activation; under (c), restore both formulas. Then one 🤖 row: an attack-scoped test rider (a Weakened target's die, for example) rides Killing Blow's own test.

**Done when:** both talents' own tests count as attacks again, or R-142 rules that they should not; pinned headless wherever the decision is pure.

**PM:** lane B · model sonnet (or opus if R-142 (b) makes it an engine change) · size S · deps R-142. Filed 2026-09-15 by the PM from the item 169 review.

## 175. [ ] `42-chaos.js`'s header comment still says the Chaos talents keep `events: {}` and read `item.system.damage.formula` — stale since the 07-24p migration (comment-only; no behaviour change) (2026-09-15)

**Why:** reported by item 169's worker (PR #396, 2026-09-15). The 07-24p migration gave the Chaos talents real `events` rules that state their own formulas, and no Chaos rule reads the item's formula, so the header now misdirects anyone deciding whether a Chaos talent's formula can be blanked — the exact question R-142 asks.

**What to do:** rewrite the header in `module-src/scripts/engine/42-chaos.js` to name the rule shapes the Chaos talents actually carry and say that their damage rules state their own formulas; run `node scripts/engine-assemble.js`. The assembled engine may differ only in that comment.

**Done when:** the header matches the authored data; gates green.

**PM:** lane R · model sonnet · size XS · deps none. Filed 2026-09-15 by the PM from the item 169 review.

## 176. [ ] A `near-victim` damage splash that catches nobody still rolls its damage and posts "6 energy to (no target — target a token, then re-fire)." publicly — Chain Detonation fired on a rootling's death with no creature within 5 ft (ENGINE-ONLY, F5) (2026-09-15)

**Why:** measured at **bench run 50 (2026-09-15)** while staging CUE-161, which passed. In a started combat on Bench Arena whose current combatant was Bench — Red, a Rootling Swarm token dropped to 0 HP from an `applyDamage` carrying no dealer, and Bench — Red posted, publicly: *"⚡ Chain Detonation (Bench — Red) — 6 energy to (no target — target a token, then re-fire). floor(2d8 / 2) 7 5 12 6"*. Nothing was damaged. Two things put it there, and only the second is the defect. (1) `edhaResolveKiller` (`module-src/scripts/engine/53-native-event-system.js` lines 16–21) resolved the killer through its documented fallback — no controlled token and no user character, so `game.combat.combatant` — and Red's `edha-on-defeat` rule `F2rEuF123sLktyG6` fired for Bench — Red (runbook, run 16: the killer is the selected token, the user's character or the current combatant, never the dealer; that heuristic is not this item). (2) That rule is `edha-triggered-effect {kind: damage-aoe, target: near-victim, radius: 5, nearAffects: all}`. `edhaEffectTargets`' `near-victim` case (`module-src/scripts/engine/33-triggered-effect-resolution.js` line 63) skips the owner, and the only other token was the second rootling 10 ft from the body, so the splash list came back empty — and the damage / damage-aoe branch posts its card anyway (line 289), printing the rolled amount and the prompt-target fallback `"(no target — target a token, then re-fire)"`. That advice is wrong for an automatic dispatch that supplied its own victim: there is no token to target and nothing to re-fire, and a rolled number for nobody reads like damage that landed somewhere. Same family as item 173 (a supplied target list emptied by a filter, and the card blames the user), but a different branch: item 173's own fix keeps today's message wherever "no target resolved at all", which is exactly this path. Consumers of the shape in `data/authored/`: Red's `Chain Detonation` (`edha-on-defeat`, radius 5, all) and Death's `Necrotic Cascade` detonation (`NecroCascDeton00`, `edha-test-success` off its `defeat` watch, radius 10, enemies); no adversary rule carries it.

**What to do:** in the damage / damage-aoe branch of `edhaRunTriggerEffect`, when `eff.target === "near-victim"` and the splash resolved nobody, post no damage card and print no rolled amount (at most a GM-whispered "no creature within N ft of <victim> — nothing to splash"); keep the "(no target — target a token, then re-fire)" wording for `prompt` targets only. Land it with item 173 (same message, same file) so the two paths share one rule. Pin it in `tests/`: an empty near-victim splash posts no public damage card; a near-victim splash with a creature in radius still posts "N energy to <name>" and applies it; a prompt-target damage rule with nothing targeted still asks for a target; show the reversion failing. Engine source + `node scripts/engine-assemble.js`.

**Done when:** a Chain Detonation kill with no creature within 5 ft of the body posts no damage card, one with a creature in radius still damages and names it; one 🤖 row re-drives both.

**PM:** lane B · model sonnet · size XS · deps none (pairs with item 173). Filed 2026-09-15 by bench run 50.
