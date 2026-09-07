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

## 4. [ ] Split the ~19.7k-line engine (2026-09-05) into concatenated sections (keep ONE deployed file)

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

## 13. [x] Migrate resourceWrite's remaining 12 sites onto the canonical resource writers (2026-09-06, PR #PRNUM)

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

## 43. [ ] Phone board "Needs you" view — collapse the dashboard to what Ben must act on

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

## 44. [ ] `Ask:` lines on open rulings whose heading isn't a self-contained question

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

## 55. [ ] One senses rule for PCs and adversaries alike (R-56)

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

---

## 56. [ ] Melee mutation riders follow their own card's graze wording (R-14)

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

## 59. [ ] Fold `system.damage.formula` into plain dice at build time (R-71)

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

## 61. [ ] Fix Goldenport / Corvaine map polygons so four cities resolve to the right nation (R-42)

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

---

## 63. [ ] Rallying Shout's reminder prints only for a downed ally — a target-condition dial on `edha-note` (R-25)

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

## 64. [ ] `foundry-build.js` still mints `edha-aoe-template` rules — a type the engine retired (R-78)

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

## 65. [ ] 34c — the 44 later-bestiary attack items still `kind: action` (the rest of the fleet weapon migration)

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
scratch build + validator. REBUILD + ⟳ Sync (Ben's deploy). Found by item 34a. Dispatched 19:52
carrying item 67 in the same PR.

---

## 67. [ ] The R-48 family: three more run-19 charge distances still `bySize` at rank 2 against rank-3 cards (R-81)

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
carries its card's distance). Rides item 65's adversaries rebuild.

**Done when:** the three rules carry an explicit distance matching their cards, the build diff
names only them, the rows exist. REBUILD + ⟳ Sync (Ben's deploy).

**PM:** lane R · model `fable-worker` (medium) · size S · deps 57 ✓ (#226), R-81 default · verify:
build read-back diff + validator. REBUILD. Found by item 57. Riding item 65's PR (dispatched 19:52).
