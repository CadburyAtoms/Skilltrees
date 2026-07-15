# EDHA Skilltrees — Foundry VTT port (session context)

Port of the **Edha** homebrew talent-tree system (Cosmere RPG homebrew) into Foundry VTT as the
`edha-content` module: three talent atlases (leyline / deity / heroic) + a playtest-adversary pack,
with all runtime automation in a single engine file. **Ben** (the user) runs the Foundry table on
his Windows machine; Claude sessions do the repo-side engineering. Sessions here **cannot launch
Foundry** — anything needing a live table gets flagged ⚑ for Ben's next bench pass instead of being
silently assumed to work.

## Current phase (as of 2026-07-06)

All **15 trees are wired** (5 leyline colors + 10 deity trees) and the buildable engine backlog is
**built** (handoff §9a/§9b → resolved into §9g). The work now is the **test-pass → fix cycle**:
Ben plays a tree in Foundry, reports results — usually **freeform chat notes** — and a session
root-causes and fixes them. Also upcoming: playtest-1 and the §9f balance review.

> **If Ben's message contains test results, bug reports, or "X didn't work / showed the wrong
> text" notes → invoke the `test-pass-fixes` skill before touching anything.** For authoring or
> reviewing tree content, invoke `leyline-tree-authoring`. For planning/building/prepping a
> **campaign session** (scenes, encounters, run-sheets, travel legs), invoke `session-forge`;
> when Ben reports **what happened at the table** after play, invoke `session-debrief`. For
> writing, deepening, or fixing **world/lore canon** — a nation's culture, a god's rites, a
> cosmology mechanic, "the logic of X doesn't make sense," a `TODO_WORLDBUILDING` W-item —
> invoke `lore-forge`.

## The map — read these, don't re-derive

| Doc | What it is |
|---|---|
| `EDHA_FOUNDRY_HANDOFF.md` | THE knowledge base. Dated deltas newest-first at the top; core reference §1–§10 below them. §9 = canonical backlog; §10 = gotchas that each bit us at least once. |
| `EDHA_FOUNDRY_TEST_CHECKLIST.md` | Per-tree in-Foundry test worklists + the one-time **DEPLOY FIRST** section (what's merged but not yet live on Ben's machine — read it before believing any "wrong text/old behavior" bug). Agents edit THIS file; Ben tests from its generated twin `EDHA_FOUNDRY_TEST_SHEET.html` — after any checklist edit run `node scripts/build-test-sheet.js` and commit the sheet (CI + pre-commit enforce sync). |
| `.claude/skills/test-pass-fixes/` | The test-results → fix workflow, plus `CASE_STUDIES.md` — worked root-cause examples. |
| `.claude/skills/leyline-tree-authoring/` | The authoring/consistency standard, `audit.py` (the pre-commit gate), and `ENGINE_INDEX.md` (primitives map — read it **instead of** scanning the 11k-line engine). |
| `AUTHORING_WORKFLOW.md` | Ben's side of the loop: Foundry-edit → extract → build → ⟳ Sync ("the keys"). |
| `EDHA_TALENT_HANDBOOK.md` | Game-design source prose for the talents. |
| `EDHA_CAMPAIGN_CANON.md` | THE campaign-lore source of truth (pantheon, countries, plot, NPCs, open threads) — WorldAnvil is retired. `EDHA_LORE_CANON_DIFF.md` records how it diverged from the old baseline PDF. |
| `source-materials/maps/thyrcross.map.json` + `scripts/map/` | THE machine-readable world-map truth (scale, nation polygons, cities, sites, the Palewater channel) + its toolchain: extract layers from Ben's .procreate, measure distances/travel days, render labeled maps, `viewer.html` (Ben's click-to-coordinate tool), `lint_map.py` (docs-vs-gazetteer drift gate, in CI). Geometry questions = **query it, never eyeball the PNGs**. |
| `EDHA_CAMPAIGN_STATE.md` | THE play ledger — what has *happened* (player knowledge, thread status, NPC dispositions, clocks, session log), vs. canon's what is *true*. session-forge reads it first; session-debrief writes it after play. |
| `.claude/skills/session-forge/` | The build-a-session workflow (state → geography-first → premise stress-test → batched rulings → scenes/stats → clue ledger → close-out), plus `RUN_SHEET_TEMPLATE.md`, the session-1 `CASE_STUDY.md`, and `MAP_CHEATSHEET.md`. |
| `.claude/skills/session-debrief/` | Ben's post-play table notes → updated state doc, table rulings into canon §9, consequences + next-session seeds. The campaign-play counterpart of test-pass-fixes. |
| `.claude/skills/lore-forge/` | The author/audit-world-canon workflow (load load-bearing canon → derive every claim from a named ruling → logic-audit against the death model → batch design questions as a GATE and wait → write at the §5b depth standard → sweep dependents → close-out), plus `CASE_STUDY.md` (the famine layer-1 correction worked through). The worldbuilding counterpart of session-forge. |

## Where behavior lives

- **`module-src/scripts/register-skills.js`** — the ENTIRE runtime engine (single tracked copy,
  ~11k lines; mirrored to Ben's live module by `scripts/module-src-sync.js`). All name-based
  automation, every generic handler, one tree-section header per tree.
- **`data/authored/<atlas>-<tree>.json`** — the per-talent authored overlay (`description`,
  `activation`, `damage`, `events`, `effects`, `img` ONLY). Wins over the generator AND the
  side tables.
- **`data/leyline.json` / `domain.json` / `cosmere.json`** — structure (names, prereqs, layout)
  and the source prose. Card-text fixes usually need the authored file **and** the source prose
  updated together.
- **`data/talent-*.json`** side tables — MASKED bootstrap history. Never add an entry for an
  existing talent (it does nothing); never invent a new sidecar table.

## Iron rules

1. **Engine-only vs pack-rebuild.** Engine (`register-skills.js`) changes need NO rebuild (F5 /
   relaunch on Ben's machine). Authored `events` / `effects` / text / `img` changes need a **pack
   rebuild + ⟳ Sync**, which only Ben can run — say which one in the commit message AND the delta
   header. Prefer engine-only wiring when both would work.
2. **One engine, no side-engines.** New automation composes existing primitives — grep
   `ENGINE_INDEX.md` FIRST. A genuinely new mechanic adds ONE small generic handler/flag/event to
   the engine, never a bespoke per-tree subsystem.
3. **No silent manual cards; kill soft laziness.** Every talent is accounted for in an event note,
   a tree-section header, or the docs. Opposed-skill tests go through the contest core — never
   "trust the player rolled and won". "Manual" requires there to be NO nameable Foundry hook.
4. **Gates before every commit** (all must pass):
   ```bash
   node --check module-src/scripts/register-skills.js
   node scripts/validate.js
   node scripts/lint-refs.js        # data↔engine cross-reference lint (handler types, name literals)
   node tests/run.js                # engine pure-helper unit tests
   python3 tests/audit_parser_test.py
   python3 .claude/skills/leyline-tree-authoring/audit.py <color|deity-name>   # exit 0 required
   ```
   CI (`validate.yml`) runs all of these on every PR. `validate-packs.js` needs Ben's compiled
   packs — skip it locally and note the deferred rebuild. A fix whose root cause is in a pure
   engine helper ships WITH a pinned regression case in `tests/`.
5. **Docs are part of the change.** Every working session ends with: a dated delta at the TOP of
   `EDHA_FOUNDRY_HANDOFF.md`, checklist rows for everything Ben must re-test, ⚑ flags on anything
   you couldn't self-verify without Foundry, and new primitives added to `ENGINE_INDEX.md`.
6. **Commit hygiene.** Small themed commits (one per fixed item on multi-fix passes); state
   engine-only vs rebuild-needed; no model identifiers in commit text.

## How to think here (what made past sessions work)

These habits are the difference between a pass that impresses and a pass that patches. The worked
examples live in `.claude/skills/test-pass-fixes/CASE_STUDIES.md` — read them, they're short.

- **Root-cause before fixing.** A test report describes a *symptom* and often proposes a *false
  cause* ("the passive needs the active first" was really a tagged focus-write the watcher
  ignored). Trace the actual code path — hook → handler → write — before changing anything.
- **Ask "one bug or a family?"** Group reported symptoms by shared code path before fixing any of
  them. Three unrelated-looking Black reports (garbled formula, missing card, blank card) were ONE
  bug in formula substitution. The number of reports is not the number of bugs.
- **Check deploy state before believing a bug.** Ben's machine is often behind `main` (packs frozen
  at an old build; owned talents are stale snapshots until ⟳ Sync). A "wrong text / old behavior"
  report on something changed since the last deploy is a deployment gap until proven otherwise.
- **Drift has two directions.** Sometimes the card is right and the engine is wrong; sometimes the
  engine is right and the card lies (Withering Ray's Cost line). Never reflexively change code to
  match text — decide which side is canonical, then align text, engine, AND docs.
- **Primitives over point fixes.** Before writing a fix, ask: would ≥2 trees (or every future test
  pass) want this shape? If yes, build it generic, register it, wire the reported talent as the
  *first consumer*, and index it. The Opportunity menu started as a one-talent report.
- **Audit wider than the report.** Bugs cluster. Run the full description-vs-implementation audit
  of the whole tree before fixing the reported rows — the 07-05 Black pass found six drifted cards
  beyond what Ben reported.
- **Batch decisions for Ben — and the batch comes FIRST.** Collect every judgment call (design
  intent, feel, ambiguous report) into ONE menu of concrete proposals, each with a recommended
  default. Don't dribble questions, don't silently decide design questions, and don't stall
  mechanical fixes waiting on rulings. **For creative/lore/worldbuilding work the questions are
  a GATE walked in order, BY SECTION (lore-forge Phase 3, Ben 2026-07-14): one section's ideas
  at a time, invented content in full text one item at a time, Ben approves the batch, then
  move on — and approval precedes every commit. "⚑ provisional" text on a flagged question is
  the violation wearing a flag, not a workaround** (2026-07-13: backlog section A was written
  and PR'd before the menu; 2026-07-14: a monolithic everything-menu — "too detailed for a
  picker" — plus unapproved scaffolding commits; don't repeat either). Mechanical fixes with a
  determinable right answer proceed; invented world-content waits for the yes.
- **Re-litigate "manual" every pass.** The hook inventory grows. Dread Presence was "manual by
  nature" until a `preUpdateToken` veto enforced it. If you can *name the specific hook*, it's
  backlog, not manual.
