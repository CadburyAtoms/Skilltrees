# Edha → Foundry VTT Port — Agent / Operator Handoff

**This file is the cold-start REFERENCE and nothing else** (since item 19b, 2026-09-06): the table
of contents, the ⚑/🤖 marker vocabulary, §1 what this is → §10 gotchas, §H history. The **dated
deltas** — one per working session — live in **`docs/handoff-changelog/2026-MM.md`** (one file per
month, newest first inside; `README.md` there is the index). A cold session reads this file in one
sitting and then only the deltas newer than its date. **A new delta goes at the TOP of the current
month's changelog file, never here** (iron rule 5). `scripts/handoff-split.js` is what moved them.

---

## Reference — table of contents (rewritten 2026-09-06, TODO_REPO_HYGIENE item 19a)

**This is the cold-start reference: everything below is TRUE TODAY** (verified against the engine,
`module.json`, the data files and the gates on 2026-09-06). It is deliberately short — one sitting.

| § | Section | Answers |
|---|---|---|
| ⚑/🤖 | **The two checklist markers** | which marker goes on a row, and why |
| 1 | **What this is** | the port, the current phase, which skill runs which loop |
| 2 | **Environment & paths** | Foundry / system versions, the repo, the live module, the bench users |
| 3 | **Build, gates, deploy** | engine-only vs rebuild, Ben's `.bat`, the gate list, how to prove deploy state |
| 4 | **The `edha.*` console API** | every key on the API literal, what was removed |
| 5 | **Data files** | the three atlases, the authored overlay's seven keys, adversaries, items, side tables |
| 6 | **Settings & world facts** | `applyButtonsTo`, currency, cultures, the two-GM table |
| 7 | **Behaviour: the native event system & iron rule 2b** | where behaviour lives, the registry, dispatch, relays, lint passes, ratchets |
| 8 | **Content state** | pack counts, the live world, the bench roster, rulings |
| 9 | **Engine backlog — CANONICAL** | the open engine items (machine-read by the dashboard's Engine tab) |
| 10 | **Gotchas** | every trap that bit at least once and is still true, one line each, dated |
| H | **History** | where the reversals are recorded (§7.0, §7.-1, §9a/§9b/§9g) |

**Where the dated deltas live.** Every working session ends with a dated delta (iron rule 5).
Since item 19b (2026-09-06) the deltas live in **`docs/handoff-changelog/2026-MM.md`** — one file
per month, newest month first, newest delta first inside each, moved there verbatim by
`scripts/handoff-split.js`; `docs/handoff-changelog/README.md` is the index (delta count and date
range per file), and `ARCHIVE-header-wall.md` beside it is the former `HANDOFF_ARCHIVE.md`. **A new
delta goes at the TOP of the current month's file**, directly under its marker line — never into
this file. A delta's original commit is found with `git log -S"<delta title>" -- EDHA_FOUNDRY_HANDOFF.md`
(`--follow` on a month file cannot reach it: the block left a file that still exists). A delta is
the record of *what changed and why*; this reference is the record of *what is true*. When they
disagree, the newer delta wins and this reference owes a fix.

---

## ⚑ vs 🤖 — the two checklist markers (READ THIS BEFORE FLAGGING ANY ROW; vocabulary split 2026-07-27w)

- **⚑ = Ben's judgment, and ONLY that.** Design, feel, balance, a ruling, or a perception only a
  human sitting at the table can have. If an agent could settle it by driving Foundry, it is **not** ⚑.
- **🤖 = needs a live Foundry table, and an agent can drive it.** This is the **bench queue** —
  `bench-run`'s work. Growing it is fine; it is the backlog that gets burned down.
- **No marker** = repo-side and settled, or provable without a table.

**⚑ used to expand to "Could not self-verify (no Foundry here)."** That was identical to "only Ben
can do this" right up until **2026-07-26**, when the `bench-run` skill gave agents their own Foundry
client. It has not been identical since, and nobody re-tagged. So: **"I could not verify this from
here" is no longer a reason to flag a row for Ben.** It is a reason to mark it **🤖** and queue it for
the next bench run. Flagging it ⚑ files agent work in a human's queue — which is how **182 of 240**
open rows came to carry ⚑ when only ~30 were genuinely Ben's, and how a five-run marathon skipped
~201 drivable rows because both bench skills read "⚑ rows stay ⚑ Ben's".

**A marker on a `##` header is a bug.** Six bestiary sections stamped ⚑ on the subsection heading and
every row beneath silently inherited it (105 of 108 in one section, 26 of 26 in another; the sections
that flagged per-row marked 6 of 16). A header describes its section — it must never classify its
rows. **Mark rows individually.**

**Standing decisions do not belong in the checklist at all.** A row that asks Ben to *decide*
something rather than *test* something goes in **`EDHA_RULINGS.md`**, numbered, with its recommended
default and the checklist id it came from. The checklist is for tests.

---

## 1. What this is

- **The port.** The **Edha** homebrew talent-tree system (a Cosmere RPG homebrew) as the Foundry VTT
  module **`edha-content`** (v0.2.0) on the community **cosmere-rpg** system: five compendium packs
  (leyline / deity / heroic talent atlases, adversaries, items) and ONE runtime engine file that
  provides generic rule handlers, GM relays, targeting, bursts, summons, ledgers, the character
  creator, loot caches and the sheet derivations.
- **Where behaviour lives (iron rule 2b).** On the talent document — `system.events` rules and
  `effects` ActiveEffects, visible and editable on the Events / Effects tabs in Foundry. The engine
  reads them; it does not branch on a talent's name (the name-keyed migration finished 2026-07-26,
  ratchet 221 → 0, and lint pass 7 forbids regrowth). Details in §7.
- **Current phase (2026-09-06).** All **15 trees + 6 heroic paths** are wired. The loop is
  **bench → fix**: an agent drives Ben's running Foundry (`bench-run`, run 40 today), FAIL rows go
  through `test-pass-fixes`, Ben deploys. Since **2026-09-04** the repo also runs as a PM-managed
  project: `docs/PM_BOARD.md` (scheduling state), `TODO_REPO_HYGIENE.md` (the items),
  `project-manager` (Fable-only PM loop), `work-item` (the worker contract: one item, one branch,
  one PR, never merges).
- **Which skill runs which loop.** Bench yourself → `bench-run` (`docs/EDHA_BENCH_RUNBOOK.md` is the
  full procedure; `bench-marathon` for several runs). Ben's test results → `test-pass-fixes`.
  Tree content → `leyline-tree-authoring` (engineering) / `leyline-revision-guide`,
  `deity-revision-guide`, `talent-balance`, `phrasing-verifier`, `cosmere-canon-reference` (design).
  Campaign → `session-forge` / `session-debrief`; lore → `lore-forge`; handouts → `handout-forge`;
  the repo project → `project-manager` / `work-item`. Read `CLAUDE.md`'s map table for the rest.
- **The docs that are load-bearing.** `CLAUDE.md` (iron rules 1–7); this reference;
  `EDHA_FOUNDRY_TEST_CHECKLIST.md` (bench rows + the **DEPLOY STATE** section, Ben's);
  `EDHA_RULINGS.md` (every open decision, numbered R-1…R-85, §I = applied-as-default awaiting veto);
  `.claude/skills/leyline-tree-authoring/ENGINE_INDEX.md` (the primitives map + a section map of
  all 54 engine banners — read it INSTEAD of scanning the engine); `docs/ACTOR_STAT_DERIVATION.md`
  (how every derived stat is computed — read before touching a formula).

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`; user data at
  `C:\Users\benhe\AppData\Local\FoundryVTT\`. Unminified core API: `resources/app/{client,common}/**/*.mjs`.
  Public icons: `resources/app/public/icons` (`icons/svg/chest.svg` exists on 13.351) — verify an
  icon with a WINDOWS path; an MSYS `/c/...` path makes `fs.existsSync` false for everything.
- **System `cosmere-rpg` 2.1.0 installed** (`…\FoundryVTT\Data\systems\cosmere-rpg\index.js`, minified;
  grep the SUFFIX of a templated name, e.g. `registerItemEventHandlerType`). `module.json` declares
  core `compatibility {minimum:13, verified:13}` and system `{minimum:2.0.0, verified:2.0.4}` — the
  verified figures lag the install and are harmless. **Cosmere Advanced Encounters 1.3.1** is
  installed (no API; its interface is the combatant flags `actionsAvailable`/`reactionsAvailable`,
  written by `edhaCaeGrant`); Automated Actions is not and will not be.
- **The repo: `C:\dev\Skilltrees`** (since 2026-09-05; the OneDrive checkout is RETIRED — if
  `git rev-parse --show-toplevel` resolves under OneDrive, stop). Parent instructions in
  `C:\dev\CLAUDE.md`. Worker worktrees live under `.claude/worktrees/`; a build inside one must pin
  `EDHA_DATA=$PWD/data` or it silently builds the main checkout's data.
- **The live module:** `C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content/`
  (`scripts/lib/paths.js` → `MODROOT`; env `EDHA_MODROOT` overrides, `EDHA_DATA` overrides the data
  dir). Contents: `module.json` (`socket: true`; `documentTypes.RegionBehavior` = `hazard`,
  `fate-snare`, `fortified`, `enemy-cost`), `scripts/register-skills.js` (the engine — a mirror of
  `module-src/scripts/register-skills.js`, kept in step by `scripts/module-src-sync.js pull|push|status`,
  which also keeps timestamped safety copies of every live file it replaces), `styles/edha.css`,
  `lang/en.json`, `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries,edha-items}` (LevelDB).
  Agent builds go to a SCRATCH root under `%TEMP%`, never here.
- **The engine:** `module-src/scripts/register-skills.js`, **21,792 lines** (`wc -l`, 2026-09-06),
  one `/* === */` section banner per tree and per engine family. **Since item 4 (2026-09-06,
  PM-R15) it is ASSEMBLED, not hand-edited:** the edit surface is `module-src/scripts/engine/NN-<slug>.js`
  (55 sources, one per banner, lexical order = file order; the section → file map is in
  `ENGINE_INDEX.md`). Edit the source, run `node scripts/engine-assemble.js`, commit BOTH; the
  `engine-assembly` gate fails when the tracked file is not their byte-exact concatenation
  (`node scripts/engine-split.js` pushes a stray direct edit back down). The assembled file is
  still the ONE deployed script (iron rule 2a), what `tests/harness.js` loads and what
  `lint-refs.js` reads.
- **The live table:** world `edha` at `localhost:30000`. Three users can be connected at once with
  no cookie displacement: **`Bench`** (passwordless GM — the agent), **`PlayerBench`** (passwordless
  PLAYER — the only way to reach non-owner / socket-relay halves, because `game.socket.emit` never
  echoes to its sender) and Ben's **`Gamemaster`**. `game.users.activeGM` resolves to **`Bench`**
  (its id sorts first), so a run must read it at setup and say what it found. The bench runs on the
  EXISTING **"Playtest Map"** scene (the whole scene is the bench's, PM-R13); the PC actor documents
  **"Tem parinaem"** and **"Soggy Bottom"** are refresh-only (`⟳ Sync Talents`), never hand-edited
  (PM-R17).
- **Repo scripts you will use:** `scripts/foundry-build.js` (generator), `foundry-extract.js`
  (Foundry edits → `data/authored/`), `validate-packs.js` / `validate-adversaries.js` (read via
  temp copy — safe with Foundry open), `inspect-pack.js <pack> "<Name>" | --group <Tree>`,
  `dump-native-vocabulary.js` (needs the install), `bench-setup-console.js` (the bench roster,
  pasted into the console), `deploy-to-foundry.bat` (Ben's), `gates.js`, `build-dashboard.js`,
  `pm-state.js`. `scripts/README.md` is the table of all of them (`check-scripts-readme.js` diffs it).

## 3. Build, gates, deploy — engine-only vs rebuild

**Deploy classes (say which in every commit subject AND delta header — iron rules 1 and 6):**

| Class | What changed | What Ben does |
|---|---|---|
| **ENGINE-ONLY, F5** | `register-skills.js`, `edha.css`, `lang/en.json` | `module-src-sync.js push` or the `.bat`, then F5 / relaunch. No rebuild, no ⟳ Sync. |
| **REBUILD + ⟳ Sync** | anything baked into a pack: `data/*.json`, `data/authored/*.json` (`events`, `effects`, text, `img`), tree layout, icons, adversary blocks, `items.json`, `cultures.json` | the `.bat` (Foundry CLOSED) → relaunch → **⟳ Sync Talents** on each played PC and **⟳ Sync Adversaries from Pack** — owned copies are frozen snapshots until synced |
| **RELAUNCH** | `module.json` (packs, `documentTypes`, `socket`) | a full world relaunch, not F5 |
| **TOOLING-only / DOCS-ONLY** | `scripts/`, `tests/`, docs | nothing |

- **Ben's `scripts/deploy-to-foundry.bat` — 8 steps:** (1) Foundry really closed; (2) clear
  OneDrive's read-only flag from every `.git` directory + `git worktree prune < nul`; (3)
  `git -c maintenance.auto=false -c gc.auto=0 pull --ff-only < nul` (`< nul` is what prevents git's
  "Should I try again? (y/n)" hang); (4) hand-edit check on the live engine (`module-src-sync status`
  — a live engine that drifted from the repo gets a safety copy, never silently overwritten); (5)
  install the engine; (6) install adversary art (`sync-art.js`); (7) rebuild ALL five packs; (8)
  `validate-packs.js` + `validate-adversaries.js`. Then inside Foundry: relaunch, ⟳ Sync Talents per
  PC, ⟳ Sync Adversaries (placed adversaries keep old abilities until synced; summoned creatures on a
  scene are frozen the same way). A `.bat` fix only protects the run AFTER the one that pulls it.
- **Building yourself:** `EDHA_DATA="$PWD/data" EDHA_MODROOT="$TEMP/edha-packs-<n>" node scripts/foundry-build.js [leyline|deity|heroic|adversaries|items|all]`
  — ONE scope argument (two scopes run the first only). Deterministic 16-char ids (`fid`); a
  malformed `data/authored/*.json` THROWS naming the file; baselines live at `${MODROOT}/.baselines`
  so a scratch build can only stamp its own scratch. Off-Foundry needs
  `npm install --no-save classic-level@2.0.0`. Packs are **not byte-stable** build-to-build
  (`_stats.createdTime/modifiedTime`) — prove parity on CONTENT: `edha-pack-io.readPack` +
  `stableStringify` with those two fields stripped. The pack writers refuse any document carrying
  an `edha-*` handler type the engine does not register (`scripts/lib/handler-type-guard.js`).
- **Gates — `node scripts/gates.js`** is the ONE list (item 20): `engine-check`, `engine-assembly`
  (item 4), `scripts-check`, `validate`, `lint-refs`, `unit-tests` (`tests/run.js`), `dashboard --check`,
  `canon-codex --check`, `player-primer --check`, `audit-parser-test`, `tree-audit` (`audit.py`) —
  eleven local; `--ci` adds `map-lint`
  (Pillow, installed just-in-time) and `pack-build-validate` (scratch build of every pack + both
  validators). It resolves Python itself (`python3` → `python` → `py -3`), runs EVERY gate, prints a
  PASS/FAIL table. **Never chain gates with `;` or pipe them through `tail`.** `--list`, `--only <id>`.
  The pre-commit hook is a 3-line shim that runs `scripts/pre-commit-body` (install:
  `bash scripts/install-hooks.sh`); it regenerates/checks the dashboard when any dashboard source
  changes (the checklist, this file, `TODO_*`, canon/state, `docs/PM_BOARD.md`, `EDHA_RULINGS.md`, …).
- **Tests:** `tests/run.js` runs every `tests/*.test.js` (966 cases at item 24; the count only
  rises). `tests/harness.js` loads the engine in a vm with a Foundry stub: `fireHook(env, name, …)`
  fires the real hook chain, `mockItem` puts rules on `system.events`, `captureChat` records cards,
  `loadHandlerRegistry()` evaluates the handler tables. **A fix whose root cause is a pure or
  hook-reachable helper ships WITH a pinned case** (iron rule 4). Tests that read engine source
  normalise CRLF first (`harness.readEngineSource()` / `scripts/lib/strip-comments.js`).
- **Generated docs** (CI + pre-commit enforce sync; each has `--check`): `build-dashboard.js` →
  `EDHA_DASHBOARD.html` (Ben's Bench / Engine / Repo / … tabs; also sharded for the phone board by
  `pm-state.js`), `build-canon-codex.js` → `EDHA_CANON_CODEX.html`, `build-player-primer.js`. All
  three LF-normalise their sources before hashing — a new generator must too.
- **Proving deploy state (never trust a report of "old behaviour"):** fetch the served
  `/modules/edha-content/scripts/register-skills.js` cache-busted, `replace(/\r\n/g,"\n")`, SHA-256,
  compare to `git show HEAD:module-src/scripts/register-skills.js` hashed the same way (the installed
  file is CRLF, so raw bytes hash differently). A client's loaded engine is checkable from outside:
  `Get-Process` gives every Foundry process's StartTime — compare to deploy time before recording a
  two-client blocker. The checklist's **DEPLOY STATE** section is Ben's; agents write findings in a
  delta. Since 07-27u the pack-rebuild list has been served by the `.bat` on each deploy; the
  REBUILD-class deltas of 2026-09-06 (items 55/56/57/58/59/63/65/67) are owed to Ben's next run.

## 4. The `edha.*` console / macro API

Exposed at `game.modules.get("edha-content").api` and `globalThis.edha` (the `const api = {…}`
literal in the engine's `ready` hook is the authority). Keys today:

- **Sync:** `syncNow(actor?)`, `syncActorTalents(actor)`, `syncAllCharacters()` — re-pull roll data +
  `events` + `effects` onto owned talents (replace-not-merge; matches by `atlas|group|name`, name
  fallback; idempotent — run twice after a pack write). `syncAdversary(actor)`,
  `syncAllAdversaries()` — re-pull world adversaries from the pack in place (keeps ids and tokens).
  ⚠ Both bulk syncs touch Ben's campaign actors — only under explicit authorisation.
- **Registry:** `EDHA_EVENT_TYPES` (15), `EDHA_HANDLER_TYPES` (87) — the registration tables (§7).
- **Content:** `createLootCache(name)` (GM; a flagged adversary-type actor in the "Loot Caches"
  folder with a chest token — players double-click within 5 ft to search), `summon(actor, talentName)`,
  `setTempHp(actor, n, src)` / `getTempHp(actor)`, `showRange(item|name)` (Attunement-Range ring),
  `drawMana(ITEM)` (takes the item, not the actor — called bare it returns silently),
  `grantDrawMana(actor?)`, `resetTriggers(actor?)`, `clearKindleLights()`, `refreshDefBuffs()`,
  `isIsolated(actor)`, `toggleStatus(actor, id, active)` (returns whether the write was PERMITTED, not
  whether anything changed), `darkVeilSweep()`, `allEffects(actor)` (`allApplicableEffects()` — the
  read that sees item-transferred markers), `raiseStakes(tokenOrActorOrName, skillId?, source?)`,
  `rally(...)`.
- **Character pipeline:** `creationWizard(actor)` / GM `newCharacter()` (welcome → country/culture →
  heroic path + Key + kit → leyline attunement → deity (skippable) → budget spend → purse + name;
  "Start over" is a level-1 reset that keeps the level), `grantStartingKit(actor, path)` (once-only via
  `flags["edha-content"].kitPath`; `{force:true}` re-grants), `skipBudget(true)` (required before
  adding a talent to a bench PC past the budget), `migrateDerivations()` (June pregens that STORE a
  manual `hea.max.bonus` — deliberately not run; see R-54 / `docs/ACTOR_STAT_DERIVATION.md`),
  `fixPcTokens()` (retrofits token sight/displayName — loops EVERY character actor, Ben's included;
  never on a bench), `fixSettings()` (forces `applyButtonsTo`).
- **Debug:** `debug(bool)` (reason logging in `edhaCanSee` and friends), `debugSave()` /
  `debugsave()` (downloads the 50k-line tracer buffer).
- **Removed:** `edha.aoe()` (2026-09-06, R-78 — `edha-burst` is the only AoE model),
  `edha.calculatedPatience()` (07-24y — the talent carries its own `whenSlowTurn` rider).
- Most helpers (`edhaWatchersOfRule`, `edhaSpeedFt`, `edhaMoveAllowanceFt`, …) are **module-scoped,
  not on `edha`** — console instructions naming them throw; drive the behaviour instead.

## 5. Data files (`data/`) — what is canonical and what is masked

- **The three atlases — structure + source prose:** `leyline.json` (**125** talents, 5 colours × 25),
  `domain.json` (**90**, 10 deity trees × 9), `cosmere.json` (**150** = 6 heroic paths × 25 — that IS
  the whole heroic set; the nine Knights Radiant ORDERS, 225 rows that no consumer read, were PARKED
  2026-09-05 in `source-materials/radiant-orders.json` — un-parking owes each a tree layout). One lowercase dialect since item 22: `name action cost
  prerequisites description flavor tags specialty path` (+ `deity domain colors` / `atlas layout`);
  `validate.js` rejects the retired capitalised keys by name. Every entry in a talent's
  `connections` becomes a **managed prerequisite** on the tree node — the graph must be a DAG rooted
  in prereq-free nodes (iron rule 7; gated in `validate.js` + `tests/pipeline.test.js`; prose and
  `connections` naming DIFFERENT parents silently ANDs them and is NOT gated).
- **The authored overlay — `data/authored/<atlas>-<tree>.json`** (21 files, 365 entries, ~400 rules):
  per-talent **SEVEN keys ONLY** — `docId`, `description`, `activation`, `damage`, `events`,
  `effects`, `img` (`TALENT_KEYS` in `scripts/lint-refs.js`, ≈line 50, is the authority). It WINS over the generator and the
  side tables. Matched by `docId`, then by name **inside the talent's own tree only** (item 18;
  twelve names live in 2–7 overlays); an empty `events: {}` / `[]` means "never authored" and no
  longer wipes generated rules (07-24b). Author it in Foundry → `foundry-extract.js`, or by hand →
  build. Workers never edit it without a ruling (content needs Ben's rebuild).
- **`adversaries.json`** — 52 statblocks (+ `_README`), their bespoke ability `events` (the same
  `edha-*` vocabulary; `[{event, handler, description?}]`, the build mints deterministic rule ids),
  attack items with `kind: "weapon"` (48 of the file's 61 attack items after 34a/34c; natural
  weapons carry `alwaysEquipped: true`; the rest stay actions by design — grabs, 2-action
  manoeuvres, bursts, Focus-costed bolts; `kind` is never written as `"action"`, so count items
  with `attack` and no `kind: weapon`), and the wiring standard: trigger-naming text carries events
  (a cue at minimum) or a `noHook` key giving the reason (item 93 / R-89 (a), 2026-09-07: data —
  `flags.edha-content.noHook` on the built docs — not a prose HTML comment, which Foundry's editor
  drops on save; lint pass 5 fails a `NO NAMEABLE HOOK` string left in text/rider). Senses derive
  from AWA for every actor (item 55); the one authored override is
  Briar-Gone Grove `senses: 30`. `adversary-effects.json` = the baked item ActiveEffects.
- **`items.json`** (102 items: 12 Edha-authored + 89 shipped-gear mirror re-priced in c/s/g + the
  Malcurr-Stamped Blade; the 30 `isMoney` sphere/gem entries are excluded) + **`cultures.json`**
  (10 nation cultures + 1 Human ancestry; flavour = `EDHA_PLAYER_PRIMER.md` §nations VERBATIM — a
  primer edit must sweep it) → the **`edha-items`** pack (113 docs). The ten culture ids are also a
  literal in the engine (`EDHA_CULTURES`, registered at `init`); lint pass 22 keeps the two in step.
- **Side tables `talent-*.json` — MASKED bootstrap history** (rolls, riders, thp, summons, triggers,
  targeting, hazards, effects, defense-buffs, state). `foundry-build.js` still emits them as rules, but
  every tree has an authored overlay that wins, so **a new entry for an existing talent does
  nothing**; never invent a new sidecar. Keep them as the schema reference for rule shapes.
  `talent-rolls.json` holds 51 `damageFormula` entries; `scripts/lib/fold-die-math.js` folds each
  final formula at build time (0 folded today — all are rank/tier-scaled with `@`-refs, which is
  correct) and `edhaWrapRollDamage` folds again at roll time (R-71).
- **Snapshots of the system (regenerate after a system upgrade; not in CI):**
  `native-vocabulary.json` — the cosmere system's OWN **12 handler types + 17 event types**, its
  handler target choices, `contentVocabulary` (skill / attribute / status / damage-type / defense
  ids), `systemSchemaTopLevelFields` (87), the DerivedValue leaves; `system-heroic-ids.json` (82
  heroic-path talent ids, entirely dormant today). **The engine's `edha-*` types are an ADDITION to
  the native ones, not the whole vocabulary** — authored rules may use either.
- **Ratchets and pins that live beside the data:** `scripts/name-keyed-allowlist.json` (`talents: []`
  — empty ON PURPOSE; lint pass 7 fails if a talent name appears in engine code), `scripts/engine-idiom-ratchet.json`
  (pass 20, §7), `tests/fixtures/handler-registry.snapshot.json` (the registry, byte-pinned).
- **Draw Mana riders, the Investiture formula (`2 + max(AWA, PRE)`), `EDHA_HP_BONUS`,
  `edhaWalkRateFtFromSpd`, `edhaSensesRangeFtFromAwa`** are hardcoded in the engine (small, fixed
  canon; the wizard preview and the sheet read the same functions).

## 6. Settings & world facts the engine relies on

- **`applyButtonsTo` = 4 (Prioritise Targeted)** — REQUIRED for the auto-target burst model; the
  module force-sets it at `ready` on the one applier (`edhaDefBuffGmGate()`), or `edha.fixSettings()`.
  Don't re-target between casting and clicking Apply.
- **`sheetScale`** — client setting (90–130 %, default 100) zooming sheet content; the system's
  sheet MAX_HEIGHT clamp is lifted to 4000 at first render.
- **Currency `edha` ("Edha Coin")** — gold(100) / silver(10) / copper(1), units `g`/`s`/`c`,
  registered idempotently at `init`/`setup` before the actor schema builds.
- **Cultures:** `CONFIG.COSMERE.cultures` holds 16 keys after `init` (the system's 6 + Edha's 10);
  the culture items' `cultural:<slug>` expertise is literal data, so the wizard works either way.
- **Statuses:** EDHA statuses register `condition: false` — none appear in the sheet's Conditions
  widget. `CONFIG.ActiveEffect.legacyTransferral` is `false` (item effects with `transfer: true`
  apply to the actor directly). Foundry matches a CONFIG status by its fixed `_id`.
- **Token defaults (`preCreateActor`):** a PC gets `displayName HOVER(30)` + cosmere `sense` sight
  at `edhaSensesRangeFtFromAwa(AWA)` (stamped at CREATION — a later AWA raise needs the
  `updateActor` sight watcher, which only fires when `system.attributes.awa` changes); an adversary
  gets the sight but NOT the hover name.
- **Two GMs are normal** (Bench + Gamemaster). Every hook that writes the world gates on
  `edhaDefBuffGmGate()` (= `isGM && edhaNoOtherActiveGM()`); the three GM-less region traps keep
  the bare `edhaNoOtherActiveGM()` on purpose (R-79). `game.user.can("ACTOR_CREATE")` is TRUE for
  the player role in this world, so the `summon-actor` relay's GM branch is unreachable (Ben's call).
- **Bench licence:** the whole Playtest Map scene; bench combats/walls/templates are yours to clean
  up; snapshot ids, flags AND EFFECTS before creating anything (bench-run hard rules 1–8).

## 7. Behaviour — the native event/effect system, iron rule 2b, and the engine's shape

**7.1 Where behaviour lives.** A talent's automation is its own `system.events` rules (Events tab)
and `effects` ActiveEffects (Effects tab); rolls sit on DETAILS (`system.activation` / `system.damage`).
The engine registers GENERIC handler types that read those rules. Two declared exits, both explicit
in the tree-section header of the engine: **ENGINE_OWNED** (multi-step dialogs, cross-actor state
machines, the contest queue, the creation wizard — the talent still carries a cue rule that at
minimum posts a card) and **MANUAL** (no nameable Foundry hook; re-litigated every pass). A talent
shipping an empty document with no declaration is a bug (87 declared on 07-26b; 0 undeclared).
The migration is DONE (07-24 → 07-26 pass AA): ratchet 221 → 0, all six marker ledgers migrated,
no name-keyed dispatch left; **lint pass 7 fails the build if any talent name appears in engine code**.
Corollary (R-74/R-76/R-78): an engine path with no consumer in the data is a named complaint.

**7.2 The registry (item 24, 2026-09-06).** `EDHA_EVENT_TYPES` (**15**) and `EDHA_HANDLER_TYPES`
(**87**) are two arrays in the engine, registered by ONE loop in `edhaRegisterNativeEventSystem()`
at **`init`** (`Hooks.once("init")`, before the system wires per-type hooks at its own `ready`),
byte-pinned by `tests/fixtures/handler-registry.snapshot.json`. **Adding a handler = adding a row**
(recipe in `ENGINE_INDEX.md`) and regenerating the snapshot deliberately. A handler needs only
`config.schema` (labelled DataFields — the rule dialog auto-renders, no `.hbs`) + `executor`; the
system binds `this` to the handler DataModel. The 12 native handlers + 17 native events (§5) are
the other half of the vocabulary; native handlers write self/owner state and there is no native
"current user target" — targeting is what `edha-*` handlers are for.

**7.3 Dispatch — the (event, handler) PAIR decides whether a rule is alive.** Of the 15 events,
three ride real system hooks (`edha-deal-damage` on `cosmere-rpg.damageRoll`, debounced 400 ms per
item because the hook fires twice per roll; `edha-on-defeat` and `edha-take-damage` on
`cosmere-rpg.applyDamage`), eight sit on `edha-content.noop-*` sentinel hooks that the engine fires
itself with `Hooks.callAll` (`edha-on-hit` — true hit only, `dealt > 0`; `edha-pre-use` — a real
dispatcher since 07-28b that hands the item to the system's `fireEvent`, so any handler type works
on it; `edha-combat-timing`, `edha-draw-mana`, `edha-ritual-paid`, `edha-opportunity`,
`edha-test-success`, `edha-test-fail`), and **four are config-only SHELVES**
(`edha-apply-watch`, `edha-pre-deal-damage`, `edha-pre-test`, `edha-watch-rule`) read by HANDLER
type — `edhaRuleOf(item, "<handlerType>")` / `edhaWatchersOfRule` ignore the `event` field entirely.
Read the rule's `event` before driving it; picking the wrong driver manufactures a dead-rule reading.
Lint pass 18 gates the decidable half. `preUseItem` takeover (return `false`) is THE pattern for a
talent that doesn't fit the single-target attack card: the engine then pays the cost itself
(`edhaConsumeCost`; `edhaRefundCost` is async — prefer a `preUseItem` veto to a refund race).

**7.4 Rule shape and the pack.** `{ id, description, event, handler: { type, …flat fields } }`;
the built pack keys `system.events` by rule id with the type at **`rule.handler.type`**. On a
document `system.events` is a **RecordCollection** — edit with `"system.events.<ruleId>.handler.<field>"`,
remove with `-=<ruleId>: null` (item updates MERGE), `toObject()` returns `{}` for it. **One
out-of-`choices` enum VALUE nukes the item's whole events map** (non-strict load falls back to `{}`);
lint pass 9b gates every choice-constrained field (137 today). Embedded ActiveEffects live as
separate `!items.effects!<itemId>.<effectId>` LevelDB keys — `writePack` splits, `readPack` reassembles.

**7.5 Handler families (all generic, all rule-keyed; per-field detail in `ENGINE_INDEX.md`):**
H1 `edha-def-test` (a DECIDER, not a roller — the talent must be `activation.type: "skill_test"`
with a matching skill); H3 `edha-owner-list` (the six marker ledgers at
`flags.edha-content.lists.{covenants,edicts,remains,snares,charges,ordained}` + `quarry`; ops
place/release/count/annotate/spend; every mutation through **`edhaOwnerListQueue(owner, key, task)`**
— re-read inside the task, never queue user interaction); H5/H11 combat timing + `edha-enter-stance`
(stance state is engine-generic); H6 `edha-prompt-pick` (`source: effects` = the dispel, reaching
item-owned passives as DISABLE and the Omen ledger; `costs:` = the one engine-driven cost); H8
`edha-watch` (kinds test / skill-roll / defeat / focus-change / token-move / damaged / die-step;
`scope: scene` watches gate on an active combat containing the owner — R-4); H9 `edha-die-step`;
H10 `edha-focus` (`resource: hea` announces the DELIVERED heal via `edhaHealLine`); H12 charges;
H13 `edha-test-rider`; H16/17 target-scoped formulas; H18 `edha-ritual-paid` + `edha-reserve-bank`;
H21 `edha-summon-effect`; H22 `edha-barrier` (real walls; cover stays a table read); H24
`edha-reveal`; H25 `edha-damage-react`; H26 `edha-test-react` (deliberately ungated, R-75); H27
`edha-damage-reduce`; plus `edha-burst` (THE AoE model — click-to-place + Detonate; `edha-aoe-template`
is retired), `edha-place-hazard` / `edha-zone` / `edha-zone-hazard` / `edha-zone-react` (Region
terrain; the hazard's owner is read ONLY via `edhaTerrainOwnerUuid`), `edha-triggered-effect`,
`edha-damage-rider` (+ `lightRadiusFt`), `edha-temp-hp`, `edha-summon` (`edhaDeleteActorWithTokens`
is the only correct teardown), `edha-defense-buff`, `edha-mutation` (`keenOnGraze`/`venomOnGraze`),
`edha-regen-grant` (`vitalOnGraze`), `edha-note` (`whenTarget: downed`), `edha-gm-cue` (once per
round per owner via `flags.edha-content.trigRound`), `edha-redirect`, `edha-cleanse`, `edha-ward`,
`edha-revive`, `edha-turn-dot`, `edha-illusion-copy/upkeep`, `edha-sense-reveal`, `edha-move-veto`,
`edha-hp-floor`, `edha-focus-guard`, `edha-counter-transfer`, `edha-marker-command`,
`edha-detonate-react`, `edha-reroll-react`, `edha-apply-status`, `edha-status-sweep`,
`edha-overflow-thp`, `edha-damage-convert`, `edha-multi-hit`, `edha-hp-threshold`, `edha-heal-cut`.

**7.6 Privileged writes, cards, relays.** GM-owned documents are written GM-side: the burst
Detonate and every player action relay through `game.socket.on("module.edha-content")` — ONE
action table `EDHA_SOCKET_ACTIONS` (`burst-apply`, `cae-flag`, `foundation-place`, `summon-actor`,
`create-item`, `toggle-status`, `apply-status-mark`, `set-flag`, `apply-timed-status`,
`set-resource`, `loot-take`, …), received on the primary GM. `game.socket.emit` has no ack:
after a relayed write, wait with **`edhaAwaitLocal(test, {timeoutMs, label})`** (polls local
documents, fails OPEN with a warn) before reading back. Chat-card buttons bind through ONE binder
table `EDHA_CARD_BUTTONS` on `renderChatMessageHTML` only, carry their payload in `data-edha-*`
attributes (a client-local map is empty on the other client), survive F5 via
`edhaMarkCardResolved`, and every click handler's outer catch is `edhaClickFailed(what, e)`. Chat
whispers to GMs use `edhaGmIds`. `pre*` document hooks run on the INITIATOR only — stash on
`options` (`edhaPrevTokenPos(options)`), never on the document.

**7.7 The canonical helpers you must not re-derive** (each has a lint-pass-20 ratchet or a pinned
test; `ENGINE_INDEX.md` has the rest): `edhaRollFormula` (every formula roll folds die math — R-65,
changed live dice), `edhaEvalSync` (v13 `evaluateSync` throws on dice), `edhaResourceWrite` /
`edhaSpendResource` / `edhaConsumeCost` (the ONLY resource writers; `edhaSpendTag` = a cost the
owner paid, `edhaBookkeepingTag` = everything else; `edhaIsSpend` is positive-only), `edhaHealCutGate`
+ `edhaHealLine` (the only place a heal number may be printed), `edhaUserTargetTokens()` (the one
`game.user.targets` reader), `edhaCasterToken`, `edhaSideSame` / `edhaSideHostile` / `edhaActorSide`
(an unresolvable side matches NEITHER — `!edhaSideSame` is not `edhaSideHostile`), `edhaAllEffects`
(`allApplicableEffects()`; `actor.effects` cannot see item-transferred markers), `edhaInActiveCombat`
/ `edhaCombatRoundOf` (never raw `game.combat` — it is the VIEWED combat), `edhaCombatEndGuard` +
`edhaStillFightingElsewhere` (every combat-end sweep), `edhaDerivedNum` (the one DerivedValueField
reader), `edhaNumOr` (an authored 0 is a value), `edhaFlagKey` (a computed key inside a flag value),
`edhaEffectStacks` (the AE schema is exactly `{isStackable, stacks}`), `edhaRegionShapes` +
`edhaGrowShapes`, `edhaSceneActors`, `edhaTimedStampPlan`, `edhaJoinRiderTerm` (a negative rider
joins as `- 1d6`), `edhaOfferDecline` (Decline-refund button + the ignored-offer sweep),
`edhaArticle` / `edhaSingularLabel` (never a literal "a ${name}"), `edhaRuleBearer` (talents AND
weapon-typed adversary attacks carry rules), the sceneOnce gate/stamp pair, `edhaSetUserTargets`
(v13 removed `User#updateTokenTargets`), `edhaCanSee` (LOS), `edhaComputeMove` + `edhaBlockedText`.
Iron-rule-2a exception granted by ruling (R-70, not a precedent): ONE wrapper on the system's
`showConsumeDialog` so every cost row opens ticked.

**7.8 `scripts/lint-refs.js` — the 23 passes** (fails the build; comments stripped before scanning):
1–2 authored files (the seven-key whitelist, every rule's handler type registered); 3 engine
name-literals resolve; 4 no raw talent-type gates (the unreachable-case family); 5 adversary
abilities carry events or a `noHook` key (item 93 / R-89 (a); a `NO NAMEABLE HOOK` string left in
text/rider is an error); 6 cue triggers are dispatchable; **7
the name-keyed ratchet**; 8 `execute-macro` budget; 9 handler FIELD names vs schema, 9b enum values
in `choices`; 10 no raw `CONFIG.COSMERE.*[id].label`; 11 `system.<field>` paths vs the real schemas;
12 dead skill/attribute/status/damage/defense ids (`inm`/`prc`/`prs`/`lea`, never `itm`/`per`/`ldr`);
13 authored values into closed system enums; 14 an `edha-def-test` item can roll its test; 15 a
world-writing hook never gates on raw `isGM`; 16 the Region flag vocabulary; 17 no `Number()` over a
DerivedValueField leaf; 18 sentinel events are fired / named / declared shelves; 19 no `currentTarget`
after an `await`; **20 the engine-idiom ratchet** (`scripts/engine-idiom-ratchet.json` — today
`userTargets 1, casterToken 1, rollFold 0, renderChatHook 2, setFlagEmit 2, sceneOnceRaw 3,
gmWhisper 0, primaryGmGate 1, resourceWrite 0, dispoFailOpen 11`; a reader helper floors at 1, a
writer at 0; never bump a count); 21 canonical homes (path literals etc.); 22 `EDHA_CULTURES` ↔
`cultures.json`; 23 no `consume` entry with `min ≠ max`.

**7.9 Derived stats** (`docs/ACTOR_STAT_DERIVATION.md` is the full walk): HP = system + `EDHA_HP_BONUS`
(+ the `Hardy — Max HP` ADD effect on its three copies), Speed = `edhaWalkRateFtFromSpd(SPD)`,
Senses = `edhaSensesRangeFtFromAwa(AWA)` for every actor type, Investiture max = `2 + max(AWA, PRE)`
(persisted on `actor.isOwner && (!isGM || edhaNoOtherActiveGM())`). **Never call a bare
`Actor#prepareData()`** — `reset()` is the recompute primitive (a bare prepare double-applies every
ADD-mode effect; source-asserted).

## 8. Current content state (2026-09-06)

- **Packs (5, built and validated, 0 issues):** `edha-leyline` (125 talents / 5 trees + the Draw
  Mana action), `edha-deity` (90 / 10), `edha-heroic` (150 / 6), `edha-adversaries` (**52 actors /
  336 embedded items**, 253 of them rules, all with `rule.handler.type`), `edha-items` (**113** docs:
  102 items + 10 cultures + 1 ancestry; loads with zero console errors since fix pass 5). 365
  talents, 21 trees, 325 tree edges, 28 talent names collide across trees (key A/B diffs on `docId`,
  never name). Build report at item 64: `events 36`, `folded-damage-formulas 0`.
- **The engine's own inventory:** 87 handler types / 15 events, 54 section banners, ~240 registered
  hooks (≈3 write-asserted in tests), 12 `edha-burst` rules in data and 0 `edha-aoe-template`, exactly
  one `edha-focus` rule with `resource: "inv"` (Reaper's Harvest, `op: gain`), six shipped
  `costs:`-carrying rules (all PC talents) + the Stalker's Fade (the one engine-driven adversary cost).
- **Ben's world `edha`:** 74 actors, 33 tokens on the Playtest Map, 2 scenes, 117 walls, 1 Region,
  42 macros, 0 combats (the stray `BerbNeuXp4iKduef` was deleted under PM-R13). The three level-1
  PCs in `Edha PCs` read 11/13/11 max HP after R-54. The June pregens (The Demolisher / Forgemaster /
  Outlaw / Vivisectionist, L7) and the playtest-1 dungeon journal are described in the 2026-06-10
  deltas; `playtest-setup-console.js` is DELETED — their provenance moved into
  `bench-setup-console.js`.
- **The bench roster** (`scripts/bench-setup-console.js`, idempotent, zero ⚠ lines expected):
  **16 `Bench — <tree>` PCs** (5 leyline × 25 talents, 10 deity × 9, Heroic × 62; each with a
  Sidesword + Shortbow; running it IS the roster's ⟳ Sync) + **7 target fixtures**, in `Edha Bench /
  Bench PCs | Bench Targets`; it repairs orphaned bench tokens (`orphans: N repaired, M replaced`) and
  leaves the four pre-existing non-bench orphans alone. PC prototype sight 20 ft (AWA 2). Judge its
  idempotency from the COUNTS, never the log buffer.
- **The checklist:** 20 `# BENCH —` sections (engine-wide, 5 leylines, 10 deities, heroic, plus the
  item-specific blocks); markdown tables are refused by the parser — every row is `- [ ]`. Count open
  rows with `grep -c '^- \[ \] 🤖'` (28 after run 32) — the two counting conventions differ.
- **Rulings:** `EDHA_RULINGS.md` R-1…R-85 in §A–§K; **§I = applied-as-default, veto if you disagree**
  (R-43 / R-63 / R-64 / R-65 change live dice or behaviour; R-48, R-81 the charge-family defaults);
  §K = settled. PM rulings PM-R1…PM-R15 live in `docs/PM_BOARD.md`.

## 9. Engine backlog — CANONICAL (consolidated 2026-07-03c; §9a/§9b BUILT 2026-07-04)

**This section is the single source of truth for the SHARED engine backlog** and is machine-read
by `scripts/build-dashboard.js` into the dashboard's Engine tab (checkbox rows under `### 9x.`
headings; `9g` is skipped as history). Per-tree "still to build / since built / truly manual" lists
stay in each `register-skills.js` tree-section header (audit.py reads them). Repo hygiene items live
in `TODO_REPO_HYGIENE.md`, judgment calls in `EDHA_RULINGS.md`, bench rows in the checklist — not
here. What remains below is non-buildable-from-here: blocked-on-system → bench-gated →
manual-by-design → post-playtest balance → the two gated initiatives.

### 9c. Blocked on the cosmere system / Foundry (tracked, not buildable now)
- [ ] **Test DCs aren't exposed** — Foundry skill tests carry no DC, so a failed NON-attack test can't be
  auto-detected. Forces the owner-click card on: **Sovereignty** Expose (non-attack tests), **Power**
  Crown of Thorns (tests the engine didn't itself resolve), **White/Coordination** Concordant/Shared
  "success" judgments. One shared blocker.
- [ ] **Items don't expose their target defense** — hit-detection can only read Physical (**Sovereignty**
  Expose / Balance / Edict-of-the-Fallen THP watchers); attacks vs Cog/Spi defenses don't auto-resolve.
- [ ] **No reach field** — **Civ** Colossus "reach 10 ft" is card-noted (no cosmere system support).
- [ ] **Structures/objects have no actor** — **Destruction** Fault Line "×3 vs structures" (Constructs ARE
  wired); any "damage a wall/object" clause. Needs object damage targets.

### 9d. Bench-gated (a fallback is already named; fires only if the bench pass fails)
- [ ] **Power — Mantle +1 injector** vs `configureModifiers`/dialog rebuilds → AE fallback if the appended
  NumericTerm is wiped.
- [ ] **Power — move-through watcher** waypointed-drag sampling (one straight segment per `updateToken`).
- [x] **Knowledge — the `insight` `effect.system.count` field name** — SETTLED 07-27h: the AE schema
  is exactly `{isStackable, stacks}`; the engine reads through `edhaEffectStacks`. Kept for the record.

### 9e. Manual-by-design (NOT backlog — declared in the tree headers; RE-RULED item-by-item by Ben 2026-07-16, the manual-inventory pass)
Forced volition ACTION choice (Absolute Authority / Hollow Command / Puppeteer / Incite / Edict
declarations beyond the three canonical prohibitions — Ben D10; **Kneel's MOVEMENT half was carved
out and ENFORCED 07-16c**); "willing" consent (owner-judged, D14); the one-turn-generous timed-status
convention; Speak with the Fallen's Q&A; Reserve SPENDING + Double Dip's HP-substitution (06-13b);
**No-AI-intent** (Fate Read the Threads / Order Lawkeeper's Eye — an NPC's intended action is not
data anywhere in Foundry, reconfirmed 07-16); Blue Foresight's cluster (Forewarned / Telepathic
Network / Probable Outcome). Also deliberately ungated: `edhaOrderPromptGate` / `edhaShatterPromptGate`
(wall-clock fallback), every `scope: "self"` watch, the H26 `edha-test-react` family (R-75), the
three GM-less region traps (R-79), Stonebound Captain Combat Training's exit (R-29), Fen-Heart 3×3
(R-40 — `size: "large"` is the schema cap). Calculated Patience LEFT this list 07-24y; Unweaving +
Void Sense LEFT it 07-16c — a worked example of why iron rule 3 says re-litigate manual every pass.

### 9i. Combat/encounter engine rework (OPENED 2026-07-16 — Ben's D12/13 ruling; GATED on a design session)
- [ ] **The "trusted action-economy" rework** — one initiative, not per-talent patches: Reaction-per-round
  and extra-attack/once-per-turn cadences currently trusted (Arsenal, Bonds, Trade Routes, Momentum,
  Risen Servant, Speak with the Fallen's +2 Inv repeat), plus the Aid / forced-action grant class
  (Fate Weave the Thread / Thread of Inevitability / Ordained, Order Covenant/Concord, Sovereignty's
  reaction-denial — prompt cards today, no hook forces another creature's action), and the §9j #1b CAE
  remainder. ⚑ Design questions first (what does the table want TRACKED vs trusted?), then one
  coherent build — do not wire these piecemeal in test passes.

### 9f. Post-playtest-1 balance review
- [ ] **Capture playtest-1 findings against the 2026-06-10b watchpoints** (Captain Deflect 4; Stitchmother
  net-DPS margin at 120 HP / dis 5; Flame Surge vs clustered minions; the 07-27j attribute-contest fix
  made foes' Speed tests add `@attr.spd`, so Concussive Yield / Inevitable Snare got harder).

### 9h. Equipment, money & items initiative (opened 2026-07-15 — directions picked by Ben)
Direction (07-15): currency = lore-forge pass first (W25); item source = system pack + a small
edha-items pack; adversaries = migrate attacks to real weapons; money = engine-tracked.
- [x] **Fleet weapon migration — DONE 2026-09-06:** 34a (PR #220: 11 attack items across the 13
  original statblocks are weapons, `edhaRuleBearer` on both rule loops, summon attacks build as
  weapons) + 34b (PR #233: `edha.createLootCache`, the double-click contents card, the `loot-take`
  GM relay with a synchronous claim) + 34c (item 65: 36 of the later 44 flipped, 8 stay actions).
  Bench rows 🤖 in `# BENCH — Fleet weapon migration, 34a` (+ 34b/34c sub-blocks).
- [x] **edha-items pack — DONE 07-18f/j:** `data/items.json` → the `edha-items` compendium (12
  Edha-authored items incl. the Malcurr-Stamped Blade + the 89-item shipped-gear mirror re-priced
  in c/s/g; 13 Roshar-flavoured entries in `_meta._review` for Ben to prune). Mundane gear no longer
  comes from `cosmere-rpg.items`.
- [x] **Engine currency primitive — BUILT 07-18e:** `EDHA_CURRENCY` + `edhaRegisterCurrency`, one
  currency `edha`, gold(100)/silver(10)/copper(1) (ruling 54). Bench rows in "Currency wiring".
- [ ] **Armor** (gate: bench). Adversary Deflect stays the number override (`source:"armor"`). PC-side:
  bench-check whether `cosmere-rpg.items` ships armor and whether equipping sets Deflect natively; if
  yes there is NOTHING to build, just checklist guidance.

### 9j. The player-facing pipeline → the character creator (RESCOPED 2026-07-18f — Ben; COMPLETE except #1b)
- [x] **0. Items + culture console dump script — BUILT 07-18f** (`scripts/items-dump-console.js`;
  Ben pasted it, output committed under `source-materials/`).
- [x] **1. Heroic talent copy-in — DONE 07-18f** (`cosmere-rpg.heroic-paths` ONLY as source; 102
  authored entries gained real activation blocks + 7 tier-scaling formulas; the system's shipped AEs
  are all inert and were skipped; Hardy / Surefooted added; stance state engine-generic since 07-18g).
  The 47-talent no-source heroic wiring backlog is worked test-pass style; names are in the engine's
  HEROIC PATHS header.
- [~] **1b. The CAE wiring tranche — DETERMINISTIC HALF BUILT 07-18j** via `edhaCaeGrant` + the
  `cae-flag` relay (the five use-grants, Through the Fray, Foresight + Sidestep combat-start grants,
  Tactical Ploy + Feinting Strike burns; honour-system chat fallback with no tracker). STILL OPEN —
  each needs a positional or cadence read the tracker does not carry: Combat Coordination's
  per-Strike free DC, Synchronized Assault / Turning Point multi-ally grants, Flame/Windstance
  conditional extra actions, Vigilant's cost discount, the cadence class (Combat Training graze /
  Swift Strikes / Unrelenting Salvo / Opportunist), Brace. Folded into §9i's design session.
- [x] **2. edha-items mirror — DONE 07-18j** (see §9h).
- [x] **3. Country-of-origin culture items — DONE 07-18k** (`data/cultures.json` → ten `culture`
  items + the Human ancestry; auto-grant `cultural:<nation>` + pick-2 origin expertise; rulings 60–61;
  registration at `init` proven through the consumer, fix pass 5).
- [x] **4. Heroic starting-kit wiring — BUILT 07-18j** (`edha.grantStartingKit`; proven once-only on
  the console path, bench run 32).
- [x] **5. Character-creation wizard — DONE 07-18l** (`edha.creationWizard` / `edha.newCharacter`;
  bench section "Character-creation wizard"; the map-picker asset still carries every label — which
  render to ship is ruling R-41/R-42, item 61).

### 9g. Resolved (history — the dashboard skips this heading)
Everything the engine backlog once listed and has since built is recorded in the dated deltas, not
here: the 07-04 pass (summon relay, `edhaAttackKind`, injuries, `edhaCanSee`, forced-move stamp,
Pyre spread, Shatter Focus prompt, target-bound `nextTestMod`, the Civ enemy-cost Region subclass),
the tree-by-tree wiring loop (Black 06-13 → Order 07-03b), the rule-2b migration (07-24 → 07-26),
the marathon fix passes (07-27, 07-28, 09-05, 09-06) and the PM items (`TODO_REPO_HYGIENE.md`,
each with its PR number). See **§H History** for the section-level reversals.

## 10. Gotchas — still true, one line each, dated (each one bit at least once)

**Foundry / cosmere-rpg API**
- **Registration happens at `init`**, before the system wires per-type hooks at its `ready`; a type registered later never subscribes (06-09; moved to `init` for the table-driven registry 09-06).
- **A handler type not registered is silently DROPPED by the DataModel**, exactly like a bad 16-char rule id — "wired" is a claim about a code path; type gates, flags and registrations each kill it silently (07-16b). The pack writers now refuse unregistered types (09-06).
- **One out-of-`choices` enum value wipes the whole `events` map** of that item on load; a blank string does not (09-05 fix pass 2; lint 9b).
- **`system.events` is a RecordCollection** — writing an array back is a no-op that reports success; `toObject()` gives `{}`; use dot paths and `-=<id>: null` (07-26m).
- **Embedded ActiveEffects live as separate `!items.effects!` LevelDB keys** — inline effect objects are silently dropped on load (06-09).
- **The AE schema is exactly `{isStackable, stacks}`** — `system.count` is deleted silently; never write an effect's `name` (`_preUpdate` re-derives it) (07-27h).
- **An item-embedded AE cannot be created WITH `statuses`** (`reading 'startsWith'`) — create, then `update({statuses})`; and an AE with exactly ONE status and no `_id` throws (06-10b, 07-27 run 24).
- **Foundry matches a CONFIG status by its fixed `_id`** — stage statuses with `toggleStatusEffect(id, {active:true})`, never `createEmbeddedDocuments`, or the sweep reads as broken (07-27 run 28).
- **`actor.effects` is not "the effects on this creature"** — item-transferred AEs surface only via `allApplicableEffects()`; `statuses.has(x)` true and `effects.find` undefined at once are both correct. Widen READS only; writing to a yielded item effect alters that creature's copy of the talent (09-06 fix pass 5).
- **Never assign a `DerivedValueField.value`** (getter) — use `.bonus` / `.override`+`useOverride`; read through `edhaDerivedNum` (06-09, 07-27y).
- **Read `system.deflect.value`, never `.derived`** (armour-only); read `movement.walk.rate.value`, never `.override` (the getter adds `.bonus`) — every speed AE double-counted once (07-27k, 07-28i).
- **Cosmere weapons have no `system.range`** — the discriminator is `system.attack.type` (bit the engine AND the bench script) (07-26l); creature type is `system.type = {id, custom}` (07-26n).
- **`AdvantageMode` is a string enum** (`"advantage"`), never `1`; an advantage write must also pre-seed `configureDialog`'s `data.skillTest.advantageMode` or a dialog roll overwrites it; the dialog's preview line never updates — the d20 icon is the control (07-27l).
- **`Item#use()` pushes an un-awaited absolute cost write onto `postRoll`** — any refund races it; `edhaRefundCost` is async; prefer a `preUseItem` veto (07-27q). `item.use()` blocks forever on `ItemConsumeDialog` from a script; the dialog auto-checks only the FIRST consume entry (R-70 now ticks all) (07-27 runs 24/28).
- **v13 `Roll#evaluateSync()` throws on any die term** — `edhaEvalSync` folds and rolls bare `NdM`; anything unfoldable (`2d20kh`) evaluates to 0 deliberately (07-26j).
- **`setFlag` MERGES and submits a dotted key nested one level down**; `mergeObject` expands dotted keys at every inserted object — a computed key inside a flag value goes through `edhaFlagKey`; delete a flag before rewriting to clear it; hooks reading `changes` must accept both shapes (07-24u, 07-27y).
- **`foundry.utils.deepClone` returns non-plain objects BY REFERENCE** and `region.update({shapes})` re-cleans through `toObject()` — mutating a cloned shape is a silent no-op; use `edhaRegionShapes` (09-05 fix pass 2).
- **v13 delivers `tokenEnter` to every token already inside a Region the instant it is created** — compute occupants BEFORE the Region exists (09-06 item 48).
- **A dragged path re-fires `preUpdateToken` once per waypoint** — throttle veto cards (item 48). **`pre*` hooks run on the initiator only**; `options` IS broadcast and must be JSON-serialisable (09-05 fix pass 3).
- **`tokDoc.update({x,y})` is dead for movement under v13 + cosmere 2.1.0** — use `tokDoc.move({x,y,action:"displace"}, {animate:false})` (or `walk` for collisions / Region triggers); with CAE live both silently no-op for a combatant with no movement left → `updateEmbeddedDocuments("Token", […], {teleport:true})` (07-26m, 07-27k).
- **`game.combat` is the client's VIEWED combat, not the scene's active one** — `Combat.create({active:false})` + `ui.combat.initialize({combat})` makes a bench combat without touching Ben's; build bench combats with `scene: null` (v13's `_onDeleteTokens` never cascades for a scene-bound combat) (07-26h, 07-27 runs 15/21/27).
- **`combat.update({turn})` backward fires no turn-start events; `nextTurn()` leaves `turn: null` under CAE**; turn-start watches split across `updateCombatant` (`flags.cosmere-rpg.activated`) and `combat.update({turn})` — try both (07-27 run 16, 07-27e/g).
- **`applyDamage` is the only honest way to deal damage from the console** — a raw `hea` edit fires defeat watches but not damage watches, and resource writes clamp to max, which masquerades as a spend (07-26m). **`edha-deal-damage` fires on the ROLL, hit or miss** — use `edha-on-hit` for on-hit effects (06-13b); `edhaDealerOf`'s fallback window is 15 s from the roll (07-27g).
- **Weapon `use()` is hard-vetoed by the action economy out of combat**; talent `use()` warns and proceeds (07-27r). A talent's own `activation.consume` still eats `item.use()` — blank it for a bench cast and restore (run 35).
- **Foundry's socket rate limiter** ("Exceeded maximum number of update-actor events") fails silently into rows (run 24). `game.socket.emit` does not echo to its sender and relay receivers are primary-GM-gated (run 39).
- **The cosmere sheet's `use-item` action needs a real `PointerEvent`**, not a synthetic `MouseEvent`; `RollConfigurationDialog`'s submit is `data-action="submit"` with no footer; the engine's roll window is an AppV1 `div.app.window-app` with no `<dialog>` (07-27e, run 35). DialogV2 boxes every callback result — `edhaUnboxDialogPick` (09-05 fix pass 1).
- **Every compendium drag creates ANOTHER world actor**; never resolve a token by NAME when duplicates can exist (07-17c, 07-27e). **Foundry never cascades actor → token** (it does cascade token → combatant) — `edhaDeleteActorWithTokens` (07-27q); deleting an actor from the SIDEBAR still orphans its token (07-27r, open).
- **Foundry still holds pack LevelDB handles at the SETUP screen** — fully quit before a rebuild if `writePack` hits EPERM (06-xx). `game.shutDown()` releases them most of the time.
- **Bind chat-card buttons on `renderChatMessageHTML` ONLY** (the deprecated `renderChatMessage` also fires in v13 → double damage) — now the one binder table (06-09, 08-10). Existence-check before `.delete()` — a caught rejection does not suppress the red toast (06-09).
- **`game.user.can("ACTOR_CREATE")` is true for players in this world** — the `summon-actor` GM branch is unreachable (07-27p).
- **A `render*` hook keeps raw `isGM`** (per-client UI); every WORLD-writing hook uses `edhaDefBuffGmGate()` — Ben's table has two GMs (07-27q, lint 15).
- **Talent prereqs live on the tree NODE** (managed prerequisite from `connections`), not the talent; renaming a talent means rewriting every `connections` entry that points to it (07-27h).
- **Hand-authored `[[damage N Type]]` enrichers need a capitalised DamageType key**; `@attr.<id>` is the roll shorthand, not `@attributes.x.value` (06-xx). **Custom skills must be `core:true`** or they hide behind Powers (06-xx).
- **CAE exposes no API** — its tracker is plain combatant flags (07-18h).

**Engine idioms (each now a helper or a gate — do not re-derive)**
- **A card that reports a ROLLED number while a gate scales the WRITE is the costliest drift** — the card is the only thing players read; announce the delivered value (09-06 item 68).
- **A literal grammar string reproduces itself at every future site** (`"a Envoy"`); an executor inside a handler config is unreachable from the harness — extract the string builder (item 48).
- **`edhaToggleStatus` returns whether the write was permitted, not whether anything changed** (R-32).
- **An existence check alone lets both socket relays through** — a claim must be a synchronous test-and-set before the first await (item 34b).
- **"Tag the bookkeeping writes" cannot work** — the writes complained about are the ones the engine never issues, so the ABSENCE of a tag is never evidence; stamp the SPEND (item 28b).
- **An idiom carrying two polarities never migrates on its own** (`?? 1` vs `?? 0`; `edhaDefBuffGmGate` vs `edhaNoOtherActiveGM`) — decompose, don't duplicate (items 10/12). Ratchet floors differ by shape: a reader floors at 1, a path-composing writer at 0 (items 13/14).
- **A failed lookup is not "no restriction"** (`x !== undefined &&` fails open) and **an authored 0 is falsy** (`x || default` reverts it — `edhaNumOr`) (07-28d, 07-28g).
- **A helper is only "already generic" if its BODY names no talent**; grep a talent's name in takeover/cancel Sets, not just dispatch branches — a name in a `preUseItem` Set that returns `false` means its `use` event never fires while its Events tab looks perfect (07-24q/s).
- **The readiness test is FOUR-legged:** executor, schema field, event, AND is that event reachable — an `activation.type: none` talent can never fire `use` (07-24v, 07-25).
- **H1 is a decider, not a roller**; `edhaTryResolveContest` matches a captured roll BY SKILL and a mismatch waits forever, silently (07-27j — killed Sharp Eye and six adversary abilities).
- **Never sweep statuses by id across `canvas.tokens.placeables`** — it deleted four pre-existing effects on Ben's campaign adversaries (07-27g). Snapshot whole effect OBJECTS.
- **A per-combat hook doing a world-wide write clobbers the other combat** — `edhaCombatEndGuard` on every combat-end sweep (07-28 fix pass F). A `timed: true` rule is not a timed STATUS (07-28g).
- **`ev.currentTarget` is null after an `await`** (lint 19); a click handler's outer catch is never "non-fatal" (07-28).
- **The talent-side of a ruling filed "ENGINE-ONLY" may not be** — since the migration, reminders like Rallying Shout's are AUTHORED rules, so gating them needs a generic field + an authored value (rebuild class), never a name-keyed branch (item 63).
- **Three pins were deliberately FLIPPED once R-72 was answered** (item 47) — do not "restore" them. **Every `hea` write outside `applyDamage` now passes `edhaHealCutGate`** — the last three (regen tick, decay lifesteal, burst heal) were gated at their EMITTERS on 2026-09-07 (R-83 (a), item 70), taking the gate's call count 2 → 5. **`edhaApplyBurstResults` stays ungated on purpose** — Raise Dead's stabilising 1 HP rides it (R-10 (3)), which is why the burst gate lives in the emitter.
- **Advantage / disadvantage next-test entries are a LIST** (`nextTestMod`, cap 12): booleans OR per direction, a cancelling pair writes nothing, dice sum; consumption by gid (item 49). Quarry advantage STOMPS an active disadvantage (house convention).
- **`edhaSummon`'s attacks are weapons; `edhaRuleBearer` gates both rule loops** — an adversary attack typed `action` carries no riders (item 34a).

**Build / tooling / git**
- **A generated-doc `--check` failure whose only diff is the `@stamp` is a CRLF bug**, not a stale file — all generators LF-normalise at the read; a new one must too (07-15c). **JS `.` does not match `\r`** — comment-stripping regexes silently read commented-out code as live on a CRLF checkout (07-28m).
- **A block comment containing the literal `*/` closes itself** — split the token; `node --check` catches it (09-05 item 23).
- **Pack parity is content parity** — `_stats` times differ every build; strip them (09-06 items 58/64). **A recorded docId seed may not reproduce** — re-derive `fid(...)` from a scratch build (item 58). **A build-time fold can only fold fully numeric dice** — 0 folded is correct, not a bug (item 59).
- **A first `.bat` run stopping with "N un-extracted Foundry edits" can be a phantom** from a scratch build re-stamping baselines (fixed 07-26c; the `no baseline for <pack>` warning IS the re-arm). ⚠ Never run the abort box's `foundry-extract.js` suggestion when the live packs are older than the repo — it overwrites `data/authored/`.
- **The two art extension lists must stay in lockstep** (`sync-art.js` `EXTS` and `advArt()`'s probe list, both `jpg jpeg webp png`); the deploy only sees art present WHEN IT RUNS — `art: 0 copied` with no IGNORED list means an empty folder (07-15c).
- **OneDrive marks every `.git` directory read-only and Git-for-Windows' `rmdir` then asks "Should I try again?"** — silently fatal in an agent shell; the `.bat`'s step 2 clears DIRECTORIES only (`attrib -R`) and feeds git `< nul`; `git worktree prune` never touches `.claude/worktrees/` checkouts — remove those with `rm -rf` (09-05). The repo left OneDrive 09-05, but a stale worktree can still trip it.
- **Line endings:** `.gitattributes` = `* text=auto eol=lf`, `*.bat text eol=crlf`; the installed engine is CRLF, so hash after normalising (09-05, PM-R9).
- **Iron rule 4:** never chain gates with `;` or pipe through `tail` — both mask the exit code and both have let a failing lint into a commit (07-18g/j). `python3` is an App Execution Alias stub on Ben's machine — call `python` (09-05).
- **`build-dashboard.js` refuses any markdown table line in the checklist** (invisible to the bench parser) (07-26d). **Anything the phone board shows must be merged to `main`** — a republish reads `main` (09-05 item 35).
- **A checklist "must NOT contain `<string>`" byte-check always means outside comments** — the SHA-256 against HEAD is what decides (07-28h/i). **A check that cannot fail proves nothing** — always report the denominator (07-27u).
- **Test-harness traps:** `void`-dispatched writes need `await sleep(0)` before asserting; vm-realm objects need the harness's `eq()`, never `deepStrictEqual` (09-05 item 5).
- **Worktree builds default to the MAIN checkout's data** — pin `EDHA_DATA` (09-05, memory).
- **An edit made straight into `register-skills.js` trips the `engine-assembly` gate** — edit `module-src/scripts/engine/NN-<slug>.js`, assemble, commit both; if the engine changed on `main` under your open branch, re-run `engine-split.js` on the new engine rather than hand-merging sources (09-06 item 4).

**Bench harness (driving Ben's Foundry through the browser pane)**
- **With the pane hidden, `document.hidden` is true and rAF never fires** — ResizeObserver / IntersectionObserver fire 0 times, an animated token move resolves unmoved, the vision polygon goes stale, `canvas.mousePosition` freezes at (0,0), the ChatLog renders nothing (hand-render `msg.renderHTML()` into `ol.chat-log`). Pump `canvas.app.ticker.update()` in a `setTimeout(…,0)` loop, use `animate:false`, force `canvas.perception.update(…)`. **Fronting the tab flips `document.hidden` and observers run** — re-read every row recorded BLOCKED on rendering (07-27e/o, runs 22/23/29/30, run 38).
- **A 0×0 tab never initialises the canvas** — `resize_window` and then a full reload, even on the first tab (run 35). A moved token's PREPARED `x/y` is stale while the ticker is parked — read `_source.x` (07-27o).
- **Persist the start snapshot to `sessionStorage` the moment it is taken** (a reload wipes page globals); snapshot whole effect OBJECTS, unlinked token-actor flags and `flags.edha-content.tempHp`; compare flags DEEP-equal and effects by a key-sorted canonical form (runs 24/25/32/37/39).
- **Dotted `-=` flag deletes leave empty parent objects; a whole-object `flags` write MERGES; a `{recursive:false}` resource restore does not round-trip** — re-issue as dotted leaf paths (runs 31/32).
- **Derive "pre-existing statuses" from the snapshot's `statuses` set**, never from its effects (Frostbinders carry `braced` with an empty effects array); never toggle a status outside the bench folders (run 30).
- **`createEmbeddedDocuments("Token", …)` returns docs OUT OF INPUT ORDER** — map name → id by name (run 27). `edha-gm-cue` cards are once per round per owner — step the round and read `trigRound` (run 27).
- **Validate a movement lane with the token's FOOTPRINT**, not a centre ray (run 28). `tokDoc.move()` throws a cosmetic `#panCanvas` TypeError when the token is controlled and the pane hidden — the write landed (07-27e).
- **The `edict` marker STATUS is load-bearing** — `edhaOwnerList` reconciles against it; without `toggleStatusEffect("edict")` the ledger reads empty (run 35). `Reaper's Harvest` is `multiOwner: false` and `edhaLedgerSpend` shifts the OLDEST entry (run 39).
- **A two-GM gate row cannot be verified while either GM client predates the deploy — but check process StartTime before declaring it blocked** (runs 37/39). A bench PC's Investiture max is 2 (clamps at 4 even with an override) (run 24).
- **`floor(1d6/2)` legitimately rolls 0** — one zero sample proves nothing (run 16). `edhaResolveKiller` uses `canvas.tokens.controlled`, not the damage dealer (run 16).
- **Serve `bench-setup-console.js` over a throwaway CORS static server** rather than pasting 22 KB; judge idempotency from the counts (runs 32/33). `edha.fixPcTokens()` and the bulk sync buttons rewrite Ben's actors — never from a bench (runs 16/31).
- **Whether Foundry's ProseMirror editor preserves an HTML comment when Ben SAVES a description is untested** (item 57 / R-47; a 🤖 row checks it).
- **A prototype sight write does not reach tokens already on the map** — the only syncer is the `updateActor` AWA watcher (runs 30/31).
- **DevTools `copy()` is undefined inside async contexts** — stash on `window._r`, then `copy(window._r)`; shell → clipboard quoting turns `\'` into `\\'` and a silent SyntaxError (06-10b).

## H. History — where the reversals are recorded

This reference used to carry three "historical, since reversed" bodies inline. They are gone from
here; the record is in the dated deltas (kept verbatim by item 19b) and in git history:
- **§7.0 — the 2026-06-09 re-refactor** ("every automated talent carries its behaviour ON the item";
  the two blockers solved: native damage-trigger dispatch fires once owned copies are synced, and
  pack ActiveEffects survive once `writePack` splits them). True when written for the trees that
  existed; recorded in the 2026-06-09 delta.
- **§7.-1 — the 2026-07-24 correction:** every tree wired after 06-09 (all ten deity trees, the
  heroic pass) went name-keyed — measured 80 on-document / 210 name-keyed / 75 nowhere — and
  `leyline-tree-authoring` had codified it. Recorded in the 07-24 deltas and
  `docs/archive/EDHA_EDITABILITY_AUDIT.md`; it produced iron rule 2b and lint pass 7.
- **The migration, 07-24 → 07-26 (passes A → AA, then AB/AC audits):** 221 → 0, ledgers to
  `flags.edha-content.lists.*`, H1–H27 built; Ben confirmed it live 07-26. The skill
  `talent-migration` (`SESSION_PLAN.md`, `LESSONS.md`) holds what each pass measured.
- **§9a shared primitives / §9b tree-local hooks — all built 2026-07-04** (the 07-04 delta); **§9g**
  is the pointer above. The old §8a (June pregens) and §8b (playtest-1 prep, adversary AEs on world
  actors, the dungeon journal, the router-forwarding fix) live in the 2026-06-10 / 06-10b deltas.
- **This reference's own rewrite:** 2026-09-06, TODO_REPO_HYGIENE item 19a (PR noted in the delta of
  that date); the mechanical move of the deltas is item 19b.
