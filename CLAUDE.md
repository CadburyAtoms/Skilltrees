# EDHA Skilltrees — Foundry VTT port (session context)

Port of the **Edha** homebrew talent-tree system (Cosmere RPG homebrew) into Foundry VTT as the
`edha-content` module: three talent atlases (leyline / deity / heroic) + a playtest-adversary pack,
with all runtime automation in a single engine file. **Ben** (the user) runs the Foundry table on
his Windows machine; Claude sessions do the repo-side engineering. Sessions here **cannot launch
Foundry** — but since 2026-07-26 they can **join one Ben already has running** (`bench-run`). So
anything needing a live table gets marked **🤖** for the next agent bench run instead of being
silently assumed to work; **⚑ is reserved for Ben's judgment alone** (see iron rule 5).

## Current phase (as of 2026-07-06)

All **15 trees are wired** (5 leyline colors + 10 deity trees) and the buildable engine backlog is
**built** (handoff §9a/§9b → resolved into §9g). The work now is the **test-pass → fix cycle**:
Ben plays a tree in Foundry, reports results — usually **freeform chat notes** — and a session
root-causes and fixes them. Also upcoming: playtest-1 and the §9f balance review.

> **If the task is to RUN the bench yourself — join Ben's running Foundry, execute `# BENCH —`
> checklist rows, record results — invoke `bench-run`** (added 07-26; the browser-driven
> agent bench). **If Ben's message contains test results, bug reports, or "X didn't work /
> showed the wrong text" notes → invoke the `test-pass-fixes` skill before touching
> anything.** For **continuing the
> iron-rule-2b migration** — converting talents off name-keyed dispatch, shrinking the ratchet,
> building an H-numbered handler, migrating a marker ledger → invoke **`talent-migration`**; it
> carries the workflow, the remaining scope broken into sessions, and what sixteen passes measured,
> so a session does not need a long brief. For authoring or
> reviewing tree content, invoke `leyline-tree-authoring`. For planning/building/prepping a
> **campaign session** (scenes, encounters, run-sheets, travel legs), invoke `session-forge`;
> when Ben reports **what happened at the table** after play, invoke `session-debrief`. For
> writing, deepening, or fixing **world/lore canon** — a nation's culture, a god's rites, a
> cosmology mechanic, "the logic of X doesn't make sense," a `TODO_WORLDBUILDING` W-item —
> invoke `lore-forge`. For a **player-facing handout** — a session-zero sheet, a primer
> redesign, a reference card, "give the players something," "make it one page" — invoke
> `handout-forge`. **For the ongoing repo project (since 2026-09-04) — "continue the
> project", "check the board", "dispatch the next item" — invoke `project-manager`**; it resumes
> from `docs/PM_BOARD.md`. Fable runs it; the workers it dispatches invoke `work-item`.

## The map — read these, don't re-derive

| Doc | What it is |
|---|---|
| `EDHA_FOUNDRY_HANDOFF.md` | THE knowledge base. Dated deltas newest-first at the top; core reference §1–§10 below them. §9 = canonical backlog; §10 = gotchas that each bit us at least once. |
| `EDHA_FOUNDRY_TEST_CHECKLIST.md` | Per-tree in-Foundry test worklists + the **DEPLOY STATE** section (renamed from "DEPLOY FIRST" on 2026-07-16d — what's merged but not yet live on Ben's machine; read it before believing any "wrong text/old behavior" bug, and check its date against `git log` because only Ben can advance it). Agents edit THIS file; Ben tests from the generated `EDHA_DASHBOARD.html` (Bench tab) — after editing the checklist OR any dashboard source doc (TODO_*, art wishlist, campaign canon/state, handoff, triage, pilot, map JSON) run `node scripts/build-dashboard.js` and commit the dashboard (CI + pre-commit enforce sync). |
| `.claude/skills/bench-run/` + `docs/EDHA_BENCH_RUNBOOK.md` | **The agent-driven bench** (2026-07-26): a session joins Ben's running Foundry at `localhost:30000` as the passwordless GM user `Bench`, builds the bench roster with `scripts/bench-setup-console.js` (tokens on the EXISTING "Playtest Map"; PCs "Tem parinaem"/"Soggy Bottom" hard-guarded), runs the `# BENCH —` checklist sections itself, and records results (PASS rows retire on evidence; fails feed test-pass-fixes; **🤖 rows are the bench's queue, ⚑ rows are Ben's judgment and are left alone**). The SKILL is the operating loop; the runbook is the full procedure. |
| `EDHA_RULINGS.md` | **THE standing decisions doc** (added 2026-07-27w). Every open question waiting on Ben — 45 numbered rulings grouped by theme, each with its recommended default and the marathon item / checklist row it came from. It exists because rulings were being filed as *test rows*, so a decision that takes Ben ten seconds sat in a bench queue for weeks. **A new judgment call goes HERE, not into the checklist**; a checklist row that asks Ben to *decide* rather than *test* is in the wrong file. `docs/BENCH_MARATHON_REPORT.md` §3 is now a pointer to it. §I is the APPLIED-as-default list that needs a veto, and **R-43 changes live dice math**. |
| `.claude/skills/test-pass-fixes/` | The test-results → fix workflow, plus `CASE_STUDIES.md` — worked root-cause examples. |
| `.claude/skills/talent-migration/` | **THE iron-rule-2b migration skill** (added 07-24y, after sixteen passes had spread the knowledge across §9n/§9o and ever-longer session briefs). `SKILL.md` = the pass workflow (atom → scout → build → author → gates → ratchet → docs); `SESSION_PLAN.md` = the remaining 131 partitioned into sessions, with what is next; `LESSONS.md` = what each pass measured, including why the classification's `needs` column over-estimates. Read it INSTEAD of writing a long brief. |
| `.claude/skills/leyline-tree-authoring/` | The authoring/consistency standard, `audit.py` (the pre-commit gate), and `ENGINE_INDEX.md` (primitives map — read it **instead of** scanning the 11k-line engine). |
| `AUTHORING_WORKFLOW.md` | Ben's side of the loop: Foundry-edit → extract → build → ⟳ Sync ("the keys"). |
| `EDHA_TALENT_HANDBOOK.md` | Game-design source prose for the talents. |
| `EDHA_CAMPAIGN_CANON.md` | THE campaign-lore source of truth (pantheon, countries, plot, NPCs, open threads) — WorldAnvil is retired. `EDHA_LORE_CANON_DIFF.md` records how it diverged from the old baseline PDF. Ben READS it via `EDHA_CANON_CODEX.html` (generated map+doc browser — after editing canon or the gazetteer run `node scripts/build-canon-codex.js`; CI enforces sync). |
| `source-materials/maps/thyrcross.map.json` + `scripts/map/` | THE machine-readable world-map truth (scale, nation polygons, cities, sites, the Palewater channel) + its toolchain: extract layers from Ben's .procreate, measure distances/travel days, render labeled maps, `viewer.html` (Ben's click-to-coordinate tool), `paint_overlay.py` (guide layer for painting new sites into Ben's .procreate — sites carry `painted` flags), `lint_map.py` (docs-vs-gazetteer drift gate, in CI). Geometry questions = **query it, never eyeball the PNGs**. |
| `EDHA_CAMPAIGN_STATE.md` | THE play ledger — what has *happened* (player knowledge, thread status, NPC dispositions, clocks, session log), vs. canon's what is *true*. session-forge reads it first; session-debrief writes it after play. |
| `.claude/skills/session-forge/` | The build-a-session workflow (state → geography-first → premise stress-test → batched rulings → scenes/stats → clue ledger → close-out), plus `RUN_SHEET_TEMPLATE.md`, the session-1 `CASE_STUDY.md`, and `MAP_CHEATSHEET.md`. |
| `.claude/skills/session-debrief/` | Ben's post-play table notes → updated state doc, table rulings into canon §9, consequences + next-session seeds. The campaign-play counterpart of test-pass-fixes. |
| `.claude/skills/handout-forge/` | The player-handout workflow (frame audience + the reader's deliverable → query live talent data for every mechanic/flavor claim, never write mechanics from memory → house design plan → HTML built with Write/Edit only → Chrome-headless render → verify EVERY page's last element survived → deliver + iterate on Ben's design bar). The worked example is `EDHA_CAMPAIGN_ONE_PAGER.html` (the session-zero one-pager; its PDF stays untracked per the `*.pdf` policy — the skill says how to regenerate it). Re-landed 2026-09-05 (item 33) from the orphaned `claude/handout-forge-skill` branch (PR #93, closed). |
| `docs/PM_BOARD.md` + `.claude/skills/project-manager/` + `.claude/skills/work-item/` | **The ongoing repo project** (started 2026-09-04 from the fresh-eyes review). The board is the scheduling state — queue, lanes, budget caps, rulings, run log; substance stays in `TODO_REPO_HYGIENE.md`. `project-manager` is the PM loop (Fable only: brief → dispatch one Sonnet/Opus worker → review checklist → merge on green CI → board). `work-item` is the worker contract (branch per item, proofs, gates, docs, PR, fixed-shape report; never merges). Ben's phone view is the **mobile board** artifact (`docs/pm-board-mobile.html`, fed by `scripts/pm-state.js`; URL on the board) — a projection of the board, never a third source of state. |
| `.claude/skills/lore-forge/` | The author/audit-world-canon workflow (load load-bearing canon → derive every claim from a named ruling → logic-audit against the death model → batch design questions as a GATE and wait → write at the §5b depth standard → sweep dependents → close-out), plus `CASE_STUDY.md` (the famine layer-1 correction worked through). The worldbuilding counterpart of session-forge. |
| **Game-design skills** (added to the repo 2026-07-24 — they lived only in Ben's user-level `~/.claude/skills/` and so were invisible to a fresh clone and to CI) | `leyline-revision-guide` + `deity-revision-guide` — the DESIGN standards for the two tree families (color/deity identity, action-type mix, cost curves); `talent-balance` — is this talent balanced/well-named; `phrasing-verifier` — Stormlight-canon phrasing conventions for card text; `cosmere-canon-reference` — the lookup file for canon terms, conditions, skills, capitalization. Distinct from `leyline-tree-authoring`, which is the ENGINEERING standard (wiring, events-vs-effects, audit.py). Design question → these. Wiring question → that. |

## Where behavior lives

- **`module-src/scripts/register-skills.js`** — the ENTIRE runtime engine (single tracked copy,
  ~15k lines; mirrored to Ben's live module by `scripts/module-src-sync.js`). Every generic
  handler, one tree-section header per tree. ⚠️ Also, today, **200 talents' worth of name-keyed
  automation** — that is the iron-rule-2b backlog, not the pattern to copy (this line used to read
  "all name-based automation lives here", which is how the backlog grew). New behaviour goes on
  the talent; `lint-refs.js` pass 7 now enforces that the name-keyed list only shrinks.
- **`data/authored/<atlas>-<tree>.json`** — the per-talent authored overlay (`description`,
  `activation`, `damage`, `events`, `effects`, `img` ONLY). Wins over the generator AND the
  side tables.
- **`data/leyline.json` / `domain.json` / `cosmere.json`** — structure (names, prereqs, layout)
  and the source prose. Card-text fixes usually need the authored file **and** the source prose
  updated together.
- **`data/adversaries.json`** (+ `adversary-effects.json` baked AEs) — adversary blocks AND their
  bespoke ability `events` rules (same edha-* vocabulary as talents; build mints rule ids). The
  wiring standard: trigger-naming text carries events (cue at minimum) or an explicit
  `NO NAMEABLE HOOK: <reason>` — `lint-refs.js` pass 5 enforces; see leyline-tree-authoring
  SKILL.md §"Adversary abilities".
- **`data/talent-*.json`** side tables — MASKED bootstrap history. Never add an entry for an
  existing talent (it does nothing); never invent a new sidecar table.
- **`data/native-vocabulary.json`** — the **cosmere-rpg system's OWN** event/handler types (12
  handlers + 17 events at system 2.1.0), snapshotted from Ben's Foundry install by
  `scripts/dump-native-vocabulary.js`. ⚠️ **The engine's `edha-*` types are an ADDITION to these,
  not the whole vocabulary** — authored rules may use either. Enumerating only `register-skills.js`
  under-counts by 12 handlers and 17 events, which on 2026-07-24 nearly caused a handler to be built
  for events the system already fires (`EDHA_EDITABILITY_AUDIT.md` §9j). **Native handlers write
  self/owner state; there is no native "current user target"** — targeting is what edha-* handlers
  are for. Regenerate after a system upgrade; not in CI (needs the install).

## Iron rules

1. **Engine-only vs pack-rebuild.** Engine (`register-skills.js`) changes need NO rebuild (F5 /
   relaunch on Ben's machine). Authored `events` / `effects` / text / `img` changes need a **pack
   rebuild + ⟳ Sync**, which only Ben can run — say which one in the commit message AND the delta
   header. Prefer engine-only wiring when both would work.
2. **Two rules, because "engine" was doing two jobs** (split 2026-07-24 — the old single rule
   forbade a *second engine file* and said nothing about where behaviour *lives*, which is how 210
   talents drifted off their documents without ever violating it. Existing "iron rule 2" citations
   mean **2a**.)

   **2a. One engine, no side-engines.** All runtime code lives in
   `module-src/scripts/register-skills.js`. New automation composes existing primitives — grep
   `ENGINE_INDEX.md` FIRST. A genuinely new mechanic adds ONE small generic handler/flag/event
   type, never a bespoke per-tree subsystem and never a second script.

   **2b. Behaviour belongs on the talent, not on its name.** A talent's automation ships in its
   own `system.events` / `effects`, so it is **visible and editable on the Events and Effects tabs
   in Foundry** — that is the whole point, and it is a requirement, not a preference. The engine
   provides *generic* handler types that read those rules; it must not branch on a talent's name
   to decide what to do.

   `item.name === "X"` and `edhaOwnsTalent(actor, "X")` are the smell. They bind behaviour to a
   string, so **a rename silently unwires the talent and an edit in Foundry does nothing** — the
   tab is empty because there is nothing on the document to show. Hooks are NOT the problem: a
   document-driven talent uses the same hooks and the same engine file. The difference is only
   what the hook consults once it fires.

   Two declared exits, both explicit:
   - **ENGINE-OWNED** — the mechanic genuinely cannot be a rule: multi-step dialogs, cross-actor
     state machines, targeting overlays, the contest queue, the creation wizard. Declare it — the
     talent still carries an `events` cue rule that at minimum posts a card, plus an
     `ENGINE_OWNED: <reason>` line in the tree-section header.
   - **MANUAL** — no nameable Foundry hook at all. Rule 3's existing bar, unchanged, including
     "re-litigate manual every pass".

   A talent that ships an empty document with **no** declaration is a bug, not a style choice.

   **Ratchet clause — read this before calling anything a violation.** 2b binds every talent
   that is **new or touched** from 2026-07-24. Measured that day: 90 of 365 talents carry
   behaviour on the document, 200 are name-keyed, 75 have neither. Those are a tracked backlog,
   not an instant violation — but **the count may only go down**, and that is now ENFORCED:
   `scripts/lint-refs.js` **pass 7** freezes the **221 talent names the engine mentioned in code**
   on 2026-07-24 into `scripts/name-keyed-allowlist.json` and fails the build if
   - a talent name appears in engine code and is **not** on the list (the list may not grow), or
   - a listed name is **no longer** in the engine (delete the line — the list must not become
     fiction).

   (221 names vs 200 talents: a few talents carry document behaviour *and* a name-keyed branch,
   and the list counts names in code, which is what rule 2b actually forbids. Comments are
   stripped before scanning — the engine's tree-section headers list talents by name on purpose,
   and that IS the rule-3 ledger.) Adversary bespoke abilities are **out of scope**: they are a
   different surface with their own wiring standard (lint pass 5), and engine name-keyed
   automation against one is legitimate there.

   The migration's FIRST job is to classify all 200 into expressible-now /
   needs-a-new-generic-handler / genuinely-engine-owned and report the split — that number decides
   whether this is one session or five. See `EDHA_EDITABILITY_AUDIT.md`.
3. **No silent manual cards; kill soft laziness.** Every talent is accounted for in an event note,
   a tree-section header, or the docs. Opposed-skill tests go through the contest core — never
   "trust the player rolled and won". "Manual" requires there to be NO nameable Foundry hook.
4. **Gates before every commit** — `npm run gates` runs the whole set; all must pass:
   ```bash
   node --check module-src/scripts/register-skills.js   # + every scripts/*.js and tests/*.js in CI
   node scripts/validate.js         # data/*.json schema + adversary refs (NOT the tree graph — see rule 7)
   node scripts/lint-refs.js        # data↔engine cross-reference lint (handler types, name literals)
   node tests/run.js                # engine pure-helper unit tests
   node scripts/build-dashboard.js --check     # generated docs must match their sources
   node scripts/build-canon-codex.js --check
   node scripts/build-player-primer.js --check
   python3 tests/audit_parser_test.py
   python3 .claude/skills/leyline-tree-authoring/audit.py <key>   # exit 0 required; key = data-file stem
   # (not the deity's proper name): black|blue|green|red|white, or chaos|civilization|death|destruction|fate|knowledge|life|order|power|sovereignty
   ```
   **CI (`validate.yml`) runs two more that `npm run gates` does not**, because both need
   something a clone may lack — match them before assuming a green local run means green CI:
   - `python3 scripts/map/lint_map.py` — needs Pillow (`python3 -m pip install pillow`); CI
     installs it just-in-time. Runs on any `source-materials/maps/**` or gazetteer change.
   - **Pack build + validate** — builds every pack into a scratch `EDHA_MODROOT` and runs
     `validate-packs.js` + `validate-adversaries.js` against the compiled LevelDB. Needs
     `classic-level`; CI installs it pinned to Foundry's 2.0.0. This step exists because both
     validators were deploy-only until 07-16d, which is how two build-breaking bugs reached
     Ben's `deploy-to-foundry.bat` step 5 — do not treat it as optional.

   A fix whose root cause is in a pure engine helper ships WITH a pinned regression case in
   `tests/`. **Never chain gates with `;` or pipe them through `tail`** — both mask the exit code
   that decides, and both have already let a failing lint into a commit (07-18g, 07-18j).
5. **Docs are part of the change.** Every working session ends with: a dated delta at the TOP of
   `EDHA_FOUNDRY_HANDOFF.md`, checklist rows for everything that must be re-tested, **the right
   marker on every new row**, and new primitives added to `ENGINE_INDEX.md`.

   **There are TWO markers and they are not interchangeable** (split 2026-07-27w; the old wording
   was "⚑ flags on anything you couldn't self-verify without Foundry", and that single sentence is
   what filled Ben's queue with agent work — 182 of 240 open rows carried ⚑ when ~30 were his):
   - **⚑ = Ben's judgment ONLY** — design, feel, balance, a ruling, a perception only a human
     sitting at the table can have.
   - **🤖 = needs a live Foundry table, and an agent can drive it** — the bench queue, i.e.
     `bench-run`'s work, not Ben's.
   - **Neither**, if the row is repo-side and settled or provable without a table.

   Agents have had a Foundry client since **2026-07-26** (the `bench-run` skill), so **"I could not
   verify this from here" is no longer a reason to flag a row for Ben** — it is a 🤖. And **a marker
   on a `##` header is a bug**: it silently classifies every row beneath it (six bestiary sections
   did exactly that). Mark rows individually. Full vocabulary: `EDHA_FOUNDRY_HANDOFF.md`
   "⚑ vs 🤖 — the two checklist markers".
6. **Commit hygiene.** Small themed commits (one per fixed item on multi-fix passes); state
   engine-only vs rebuild-needed; no model identifiers in commit text.
7. **A tree must be walkable: the node graph is acyclic, and every talent is reachable.**
   (Added 2026-07-24 — the rule that did not exist when it was needed.) Every entry in a talent's
   `connections` array becomes a **managed talent prerequisite** on the tree node, so connections
   are *requirements*, not decoration, and the graph they form must be a DAG rooted in
   prereq-free nodes. Two authoring mistakes are fatal and both shipped:
   - **A mutual pair** — A connects to B while B connects to A. Neither can ever be taken.
   - **An inverted edge** — the card's prose prereq points one way, `connections` points the
     other. The node then demands the talent that demands it.

   Both were live on `main` for the whole tracked history: Green's `Predator's Instinct` ↔
   `Pack Hunter` and Red's `Burning Drive` ↔ `Reckless Advance`, taking **16 talents** (Green's
   entire Instinct column, Red's entire Momentum branch) permanently out of play. A player hit
   the Green one at session 0. **All six gates passed the whole time** — `validate.js`'s
   `validateConnections` checks only that a connection *name resolves inside the tree*, never
   what the edges add up to. Also check the third, non-fatal case: **prose and `connections`
   naming different parents**, which silently ANDs them (Green's `Scent the Weak` and
   `Coordinated Hunt`).

   ✅ **THIS RULE IS NOW GATED, IN TWO PLACES** (the ⚑ "currently UNGATED — hand-verify the graph"
   note here was stale; corrected 2026-07-24s after checking).
   - `scripts/validate.js` — a DFS over the union of all requirement edges that reports the actual
     loop path, plus a fixpoint reachability sweep from the prereq-free roots. `validateConnections`
     still only checks that a name *resolves*; the graph check is separate and sits beside it.
   - `tests/pipeline.test.js` — the same two checks pinned against the real data files, plus a
     regression case holding the three historic cycles (Green / Red / Death) fixed.

   Verified by mutation rather than by reading: re-introducing a mutual pair in `data/leyline.json`
   fails **both** `validate.js` (naming the loop) and `tests/run.js`. A green gate run now does mean
   the tree is walkable — but note what is still NOT checked: the third, non-fatal case above
   (**prose and `connections` naming different parents**, which silently ANDs them) has no gate, so
   read the prose against `connections` whenever you touch either.

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
