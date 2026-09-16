# The Metalworks codebase and ours — the 3.1.0 break list re-verified, how they build, what to borrow

Written 2026-09-16 by the PM session of record, on Ben's ask: *"review the 2.1.0 to 3.1.0 migration
information … how compatible our codebase is, how the Metalworks team approaches problem-solving in
their codebase compared to ours, and how you can use their code to improve ours."* DOCS-ONLY;
nothing here changes the engine, the data or Ben's Foundry. The companion document is
[`talent-comparison-mistborn-radiant.md`](talent-comparison-mistborn-radiant.md) (the game-design
comparison); the document this one re-verifies is
[`cosmere-rpg-3.1.0-compatibility.md`](cosmere-rpg-3.1.0-compatibility.md) (item 177, PR #403).

**Reading the references.** `2.1.0:` and `3.1.0:` mean `src/system/<path>` in the tagged source
archives; a bare `NN-name.js:line` is `module-src/scripts/engine/`; other Edha paths are
repo-relative at `main` = `2b5d13e`. `MB:` is the installed *Cosmere RPG – Mistborn Handbook*
module, version 1.0.0, read from a copy of its packs and its `index.js`, never written to.

## Contents

- [Provenance](#provenance)
- [(a) The break list, re-verified](#a-the-break-list-re-verified)
- [(b) How the Metalworks team builds, against how we build](#b-how-the-metalworks-team-builds-against-how-we-build)
- [(c) What to borrow, and what not to](#c-what-to-borrow-and-what-not-to)
- [(d) What changes for items 183 – 187](#d-what-changes-for-items-183--187)
- [Appendix A — anatomy of a Metalworks content module](#appendix-a--anatomy-of-a-metalworks-content-module)
- [Appendix B — the two codebases in numbers](#appendix-b--the-two-codebases-in-numbers)

## Provenance

| What | Value |
|---|---|
| Installed system | `Data/systems/cosmere-rpg/system.json` → **2.1.0** (unchanged since item 177) |
| Source read | the `release-2.1.0` and `release-3.1.0` source archives item 177 left in `%TEMP%\edha-cosmere-src\` (47,106 TypeScript lines in 321 files → 60,172 in 405) |
| Releases since item 177 | none — `gh release list` on 2026-09-16 still shows **3.1.0 (2026-09-03) as Latest**; 3.1.1 is a pre-release of 2026-09-09. The target does not move |
| Installed modules | `edha-content` 0.2.0; `cosmere-advanced-encounters` 1.3.1 (by *posadist-revolution*, verified for cosmere-rpg 2.0.5); **`cosmere-rpg-mistborn-handbook` 1.0.0** — new since item 177, Ben bought it; its manifest declares `cosmere-rpg` **verified 3.0.2** |
| Mistborn module read | its 12 packs copied to scratch and read with `classic-level` (the LevelDB `LOCK` files refused the copy and are not needed); its `index.js` (816 lines) read in full. Its text is licensed content and none of it is committed — only counts and shapes appear here |
| Edha side | `main` 2b5d13e. Every count below was re-derived by a fresh script, not copied from item 177 |

## (a) The break list, re-verified

**Method.** Every blocker (B1 – B5), the two feature-breaks the migration plan turns on (F4, F6), the
migration's failure semantics, and every Edha-side count that sizes a break were re-read at the cited
lines or re-derived from the data by an independent script. The adversary figures were re-counted from
a scratch build of the adversary pack (`EDHA_MODROOT` in scratch, read back with `classic-level`).

### The verdict

**The break list holds. Every claim I re-read is true at the cited lines, every count re-derives, and
nothing in the six months of Metalworks releases has moved since.** Two figures need updating because
the repo moved after the check, one site was missed, and the installed Mistborn module adds a corpus
and two footnotes. None of it changes the migration plan's shape, order or size.

| # | Claim (item 177) | Re-read at | Verdict |
|---|---|---|---|
| B1 | `TalentItemDataModel` drops the Activatable and Damaging mixins; `activation` and `damage` exist only on `action` items; no data model has `migrateData` | 3.1.0 `data/item/talent.ts:88-91` (Resources, Modality, Events, LinkedSkills, Relationships — no Activatable, no Damaging); `data/item/action/index.ts:29-36` (`activation`, `damage`, `skillTest`); `grep migrateData src/system/data` → nothing | **holds** |
| B1 count | 246 of 365 atlas talents are non-passive | recount with the authored overlay applied: 365 talents, 119 passive (`∞`/`Passive`), **246 non-passive** | **holds** |
| B2 | `use()` returns null unless `isAction()`; both use hooks receive the action; `root` walks to the talent; `actor` resolves through the parent chain | `documents/item.ts:1253` (`if (!this.isAction()) return null;`), `:1280-1292` (`HOOKS.PRE_USE_ITEM, this`), `:406-408` (`root`), `:159-165` (`actor`) | **holds** |
| B2 sites | 24 `preUseItem` registrations | `grep 'Hooks.on("cosmere-rpg.preUseItem"' module-src/scripts/engine/` → **24** | **holds** |
| B2 sites | `useItem`: three talent-level sites plus two actor-level | there are **six** registrations. The sixth, `52-green-instinct.js:130`, is the Fellstag's *Herding Antlers* — an adversary `action` item, so actor-level and unaffected, like Draw Mana. Not an inert site; just unlisted | **holds, list +1** |
| B3 | native `use` fires only on actions; `use-action` re-targets the root; the migration rewrites `use` → `use-action` on non-action world items | `hooks/item-event-system/events.ts:139-150`; `utils/migration/migrations/2.1-3.0.ts:262-267` | **holds** |
| B3 count | 189 authored `use` rules; 32 adversary `use` rules stay on actions | overlay grep **189**; `data/adversaries.json` **32** | **holds** |
| B4 | the 3.x activation is `{type, cost, consumption[], flavor}`; skill, attribute, modifierFormula, plotDie, opportunity, complication move to `skillTest` | `data/item/action/fields/activation/index.ts:19-79`; `…/fields/skill-test.ts:11-49` | **holds** |
| B4 count | 78 adversary actions, 53 with a cost, 13 with a skill | scratch build of `edha-adversaries` at HEAD: **189 action items, 98 with a cost, 25 with a skill** (54 adversaries, 352 embedded items). The bestiary redo — PRs #386 – #390, merged after the check — added blocks and the 67 tree-talent twins the build now mints as actions | **holds; larger** |
| B5 | weapons become `strike {die, damageType, skill, skillLocked, skillTestBonus, damageBonus}`; the migration keeps dice only | `data/item/mixins/striking.ts:3-55`; `2.1-3.0.ts:218-229` and `:479-492` (`/(\d+)(d\d+)/`) | **holds** |
| B5 count | 50 adversary weapons, 36 on the flat model | scratch build: **50 / 36** | **holds** |
| F4 | the system defines `diminished` (and `depleted`) with `condition: true` | `config.ts:125-130, 139-144` | **holds** |
| F6 | `use()` reads `modality` on the **action**; the migration never copies it | `documents/item.ts:1423-1434`; `grep modality 2.1-3.0.ts` → nothing. **And the system's own content agrees**: `src/packs/heroic-paths/warrior/duelist/talents/flamestance.json` carries `modality: "stance"` on the talent **and** on its embedded action, which is exactly the shape PR 4 (item 185) was told to emit | **holds, corroborated** |
| B.1 | the migration is one-way and the new version is recorded even when a step fails | `utils/migration/index.ts:85-111` (catch → notify → log → `return`); `hooks/welcome.ts:89-97` (`setSystemSetting(INTERNAL_LATEST_VERSION)` runs after `await migrate(...)` regardless) | **holds** |
| overlay | 354 `activation` keys and 427 `formula` keys across `data/authored/*.json` | grep **354 / 427** | **holds** |
| C6 | 17 events + 12 handlers → 27 + 14 | not re-run (the vocabulary dump needs the install); the event list at `events.ts` and the handler directory (16 files, 14 registered) agree with Appendix D | **consistent** |

### What the check did not have

- **N1 — a 3.x content corpus is now on this machine.** The Mistborn Handbook module's packs are the
  first real, shipped, 3.x-shaped talent set we can read: 206 talents (168 metallic-arts, 38
  metalborn-path), 67 `power` items, 37 `talent_tree` items, 51 goals. **106 of the 168 metallic-arts
  talents carry one embedded action; the 62 with no action are the passives** — the passive/no-action
  rule PR 4 assumes is how the publisher's own content behaves. Every consumption row on those actions
  carries the *ancestor-Actor* `matchDocument` step item 177 prescribed from the migration code, so
  that prescription is now corroborated by two hundred real documents, not two. Feruchemy's Tap actions
  consume `{type: "item_resource", resource: "charges"}` — the item-resource model, in the wild.
  **PR 4 should diff its target-3 output against this distribution, not against two hand-picked JSON
  files** (§d).
- **N2 — the Mistborn module requires 3.0.2.** Ben's world is on 2.1.0. If the module is active there
  today, its 3.x documents load with `activation`, `damage`, `__embedded` and `resources` silently
  dropped by the 2.1.0 data models — harmless, but every Mistborn action will look empty, which is
  not a bug in the module. It should be **disabled until the upgrade**, and it belongs in the Route A
  copy (§d of item 177) so the smoke bench sees a second module on 3.1.0. Filed as X2 below.
- **N3 — C2 widens by one skill and stays cosmetic.** The Mistborn module registers **two** Invested
  skills, `all` (Allomancy, Willpower) and `fer` (Feruchemy, Intellect) — `MB: index.js:23-37` — through
  `cosmereRPG.api.registerSkill`. The sheet shows a non-core skill whenever its config does not set
  `hiddenUntilAcquired` or the rank is at least 1 (`applications/actor/components/skills-group.ts:106`),
  and the system's own `all` entry sets no such flag (`config.ts:491-495`). So an Edha character on
  3.1.0 shows Allomancy, and with the module active also Feruchemy. `unlocked` is derived from owning a
  `power` item with that skill (`data/actor/common.ts:633-642`) and is what talent `linkedSkills` and
  the power-die scalar read; it does not hide the row. The hide PR 3 already plans is the right fix and
  should hide every non-core skill the actor has no power for, not a named one.
- **N4 — Edha's colours are a raw CONFIG write, not a registration.** `01-shared-core.js:134-139`
  writes `COSMERE.skills[key] = {…, core: true}` and pushes the key into the attribute's skill list by
  hand. The API `registerSkill` (3.1.0 `api/actor.ts:16-58`) does the same two writes and adds
  conflict handling (`RegistrationHelper`: source, priority, hash). Unchanged at 3.1.0 — the write
  still works — but it is the seam borrow B4 below uses.
- **X2 — the Mistborn module's activation state in the live world is unknown** (an agent cannot read
  world settings without the client; the bench can, at `game.modules.get("cosmere-rpg-mistborn-handbook").active`).
  🤖 row filed in the checklist.

### What this means for the question "how compatible are we"

Exactly what item 177 said, restated with the new corpus behind it: **on 3.1.0 as shipped, every
Edha talent is a card with nothing to click, until PRs 2 and 4 (items 183 and 185) land together;
everything else — the dice, the damage application, the event-system registration Edha's 102 types
ride on, the actor fields, the sheets' classes, the hooks by name — is untouched.** The system did not
change its philosophy between 2.1.0 and 3.1.0; it moved one concept (the activation) one level down
(onto an embedded action) and gave weapons a typed strike. The migration plan in item 177 §c is the
right shape and the right order, and PR 1 (item 182) is already merged. The Mistborn module being
3.x-only is a second reason to finish it, on the timetable R-144 set: build on the side, swap after
session one.

## (b) How the Metalworks team builds, against how we build

The two teams are solving the same problem — mount a talent system onto Foundry's document model —
and made almost opposite choices at every layer below the rules. Neither set is wrong; the table says
what each buys and what it costs, so §c can say what is worth taking.

| Layer | Metalworks (`cosmere-rpg` 3.1.0) | Edha (`edha-content` at `main`) | What the difference buys them, and costs us |
|---|---|---|---|
| **Language, build** | TypeScript, strict; Rollup bundles `src/index.ts` → `build/`; ESLint + Prettier on commit (husky + lint-staged); conventional commits (commitlint); `npm run link` symlinks the build into a Foundry install | plain JavaScript; one deployed engine assembled byte-for-byte from 55 sources (`engine-assemble.js`, gate `engine-assembly`); no bundler, no types; `gates.js` runs 13 local gates + 2 CI-only in fixed order | Their types catch a renamed system field at compile time; our lint pass 11 catches it against a vocabulary snapshot. They pay a build step Ben never sees; we pay 2–3 shipped dead-field bugs before the gate existed (ENGINE_INDEX ⛑ family) |
| **Data model** | Foundry `TypeDataModel`s with **17 item mixins** (`activatable` now only on actions, `striking`, `resources`, `events`, `modality`, `linked-skills`, `talents-provider`, …); every field carries an i18n `label` and `hint`; `DerivedValueField` = `{derived, override, useOverride, bonus, value}` | a module cannot add fields to the system's schemas, so Edha state lives in **flags** and the authored overlay's **seven keys**; derived numbers read through `edhaDerivedNum`, which handles the same `{derived, override, bonus}` shape | Their schema is the contract; our contract is the snapshot in `data/native-vocabulary.json` plus the ⛑ families. Same shape at the bottom (`DerivedValueField` is what `edhaDerivedNum` decodes) |
| **Versioning, migration** | versioned migration steps (`0.2→0.3`, `0.3→1.0`, `2.1→3.0`) run once at `ready`, event system disabled, world documents only, compendia by explicit call; `INTERNAL_LATEST_VERSION` setting | packs are **rebuilt**, never migrated (`foundry-build.js` writes LevelDB directly with `classic-level`); owned copies refreshed by ⟳ Sync by `system.id`; `SYSVER` stamped per build | Ours is simpler and reversible (rebuild + resync); theirs handles worlds they do not own. For the upgrade, ours wins: PR 4 + ⟳ Sync replaces every Edha document, and the system's one-way migration only has to survive |
| **Extension surface** | a **public registration API** — `registerSkill`, `registerPathType`, `registerPowerType`, `registerActionType`, `registerEquipmentType`, `registerWeapon/Armor/Trait`, `registerCulture`, `registerAncestry`, `registerCurrency`, `registerItemResource`, `registerRollData`, `registerTheme`, `registerItemEventType`, `registerItemEventHandlerType`, **`registerActionListSection` / `registerTalentListSection`** and their dynamic-section generators — every one through `RegistrationHelper` (source, priority, MD5 hash: same data = warn, lower priority = refuse, higher = override with a log) | Edha uses the event-type and handler-type registrations (one table, one loop — item 24), `registerPathType`, `registerCulture`, `registerCurrency`; colours are a CONFIG write (N4); **sheet UI is injected by DOM selector on render hooks** (`25-sheet-qol.js`, `23-sheet-path-slots…`, `35-…aoe-templates.js:131-150`, `27-adversary-pack-sync.js:292-344`) | The sheet-section API is the one seam we use the hard way. F5 (item 177) is the bill: every Actions-tab injector keyed on `data-item-id` breaks when the row becomes an action. §c B1 |
| **Where behaviour lives** | almost entirely in **prose**. The Mistborn set: 206 talents, **23 event rules in total** (grant-items 10, remove-items 7, update-actor 6 — all on the five key talents), 6 ActiveEffects; 7 damage formulas; 3 skill tests. What the system automates is the *frame*: cost consumption (with `min`/`max`/`actual` and a choice of *where* to consume from), the attack + damage roll, the power die scalar, ongoing effects as ActiveEffects toggled by three macros (`MB: index.js:529-689`), enrichers that make `[[test skill=all]]` and `[[damage 1d4 impact]]` clickable inside the card | **adjudication is automated.** 365 talents carry **415 rules** (1.14 per talent) over **102 `edha-*` types** — contests (`edha-def-test` ×40), triggered effects (×47), watches (×13), prompts, zones, summons, ledgers, the GM relay; 192 `Hooks.on` registrations; iron rule 2b makes every rule visible on the Events tab | This is the deepest difference and it is a *choice*, not a gap. They ship a rulebook that rolls its own dice; we ship a referee. The cost of ours is the 21.8k-line engine, the rule-3 ledger, and a bench. The cost of theirs is that a Coinshot's player reads the card and applies "Enhanced [Strength +2]" by hand |
| **Event system** | the same core Edha rides (`hooks/item-event-system/index.ts`): hook → grouped event types → `fireEvent` over the item's rules, ordered, cancellable. 3.1.0 adds an **execution-host policy** (`Source` / `Owner` / `GM`, `:240-284`), **infinite-loop guards** (depth 10, 1,000 events per 200 ms, `:286-325`), a **Combat-document dispatch** (`:170-198`), and `matchDocument` steps (`utils/match-document.ts`: self, sibling, ancestor, descendant, parent, child, global, equipped-*) | 102 types on the same dispatcher, transforms picking their one document (e.g. `edha-on-defeat` redirects victim → killer); owner sweeps hand-rolled (`edhaOwnersOf`, `edhaWatchersOfRule`); the GM socket relay for privileged writes | They gained `host` = GM (the relay's job, for rules the system owns) and round-start/-end events (the `combatTurnChange` sweeps' job — 21 sites). Neither solves "the player's current target": `matchDocument` walks the *ownership* graph, never `game.user.targets`. The edha-* carve-out for targeting stands, verbatim |
| **Content pipeline** | **548 JSON source files** under `src/packs/`, one document per file with `_folder.json` markers, compiled by `@foundryvtt/foundryvtt-cli`'s `compilePack`; talent trees are `talent_tree` items whose nodes carry prerequisites of nine types (talent managed / attribute / skill / connection / level / ancestry / culture / goal / power) | `data/*.json` (structure + prose) + `data/authored/*.json` (seven keys) → `foundry-build.js` (1,416 lines) mints ids, rules, trees and folders and writes LevelDB itself; **our tree nodes emit the same prerequisite shapes** (`foundry-build.js:548-567`: managed talent edges, unmanaged skill / attribute / connection) | Same document model on both sides — verified by reading their compiled packs and ours. Their pipeline is generic and dumb; ours is a generator that knows the game. Nothing to change; PR 4 keeps the generator and changes what it emits |
| **Testing** | **Playwright end-to-end against a real Foundry in Docker** (`the-metalworks/docker-world-seed`, private; the Foundry licence is a CI secret) — 5 spec files, fixtures that create and delete items and actors, ARIA snapshots of sheets; `@ethaks/fvtt-quench` available. No unit layer worth the name | **133 node tests** through `tests/harness.js` (the engine evaluated in a `vm` context with Foundry stubbed at load time; mock actors and effects), snapshot pins on the handler registry, mutation-verified gates; the **agent bench** (`bench-run`) as the end-to-end layer, on Ben's live table | Their E2E runs on every PR without a human; ours needs Ben's Foundry up. Their unit coverage of rules is near zero; ours pins every helper. §c B7 says why not to copy their CI (licence, Docker, and the bench already exists) and what to take instead |
| **Rules as data** | enrichers in card text (`docs/Enrichers.md`): `[[lookup @…]]`, `[[test skill=… dc=…]]`, `[[damage 1d4 impact]]`, `[[/roll]]`; release and patch notes shipped in-system and shown on upgrade | cards are posted by the engine; the description is prose; talents with no nameable hook are MANUAL by rule 3 | An enricher is the cheapest way to make a MANUAL talent clickable without wiring it. §c B5 |
| **i18n** | 1,179 leaf keys in `lang/en.json`; every schema label is a key | 7 lines; English strings live in the engine | Irrelevant for a one-table homebrew; noted for completeness |
| **Settings** | 15 `game.settings` (automation toggles, sheet defaults, chat buttons, theme, units) | engine dials are constants (`EDHA_DODGE_PAY_ON_ARM`, R-145; R-43's dice math; the omen-branch dial) | Our dials are editable by an agent and a rebuild; theirs by the GM in Foundry. Iron rule "editable from inside Foundry" points one way. §c B3 |
| **Docs, process** | `CONTRIBUTING.md`, `docs/Data-Formats.md`, `docs/Enrichers.md`, milestone-bound issues, small PRs, release/pre-release workflows. **Brotherwise's no-AI policy: they accept no AI-assisted contribution** | `CLAUDE.md` + handoff + changelog + ENGINE_INDEX + 13 skills; the PM board; rulings as data | We cannot send anything upstream. Everything in §c is downstream use of MIT-licensed code and of published API surface |

**The one-sentence version.** Metalworks built a typed, registered, migrated *platform* whose content
is mostly prose with a rolled frame; Edha built a generated, snapshot-guarded *referee* whose content
is mostly rules with a prose card. The platform's seams — registration, sections, resources,
enrichers, settings, round events — are exactly the places where our referee is doing by hand what
their platform offers, and those are the borrows.

## (c) What to borrow, and what not to

Each row says what it is, why it pays, where it lands (an existing migration PR or a new item), its
size, and whether Ben decides it (a ruling, filed in `EDHA_RULINGS.md` §L on 2026-09-16 as
R-146 … R-150) or the PM does. Nothing here deploys before the R-144 swap unless marked 2.1.0-safe.

| # | Borrow | Why it pays | Lands in | Size | Decision |
|---|---|---|---|---|---|
| **B1** | **Sheet sections through the API, not DOM injection.** Register the ⊙ range button, the ritual HP-cost cell, the path-slot budget readout and the adversary-sync controls as `registerActionListSection` / `registerTalentListSection` static or dynamic sections (3.1.0 `api/sheet.ts`), keyed by the section id, not by an Actions-tab row's `data-item-id` | Closes **F5** at the root instead of remapping rows; survives the next sheet redesign; the system already sorts, filters and labels sections | item 184 (PR 3) — replaces its "map action rows to their root" step | M | **R-146** (it changes what Ben sees on the sheet; recommended default: yes, at 3.x) |
| **B2** | **Item resources for the counted per-talent resources.** Omen, Quarry, Harvested Remain, Ordained Ground, Snare, Edict, Charge, Bounty — today ledgers and flags behind `edha-owner-list` — become `system.resources.uses` / `charges` on the talent (`registerItemResource`, 3.1.0 `api/item.ts:46`), spent by ordinary `consumption` rows (`type: "item_resource"`), exactly as a Feruchemist's metalmind charges are | The sheet shows the count natively; the consume dialog handles min/max/optional spend; ⟳ Sync refreshes it; three fewer engine-owned ledgers. Cross-actor lists (marks on enemies) stay `edha-owner-list` | new item, after PR 6 (the resource fields exist only at 3.x) | L | **R-147** (a data-model change on ten deity trees; recommended default: pilot on one tree) |
| **B3** | **Engine dials as module settings.** `game.settings.register("edha-content", …)` for every constant a ruling has ever toggled — `EDHA_DODGE_PAY_ON_ARM` (R-145), the R-43 dice math, the omen-branch dial — read at use time, defaulting to today's values | Iron rule: *"The user must be able to edit everything from inside Foundry."* A veto today is an engine edit and a deploy; it should be a checkbox | new item, **2.1.0-safe** (ENGINE, F5) | S | **R-148** (governance: a dial in Settings can be flipped mid-session by any GM; recommended default: yes, world-scope, GM-only) |
| **B4** | **Register colours through `registerSkill`.** Replace the raw `COSMERE.skills[key] = …` write (N4) with the API call at 3.x, with `source: "edha-content"` | The `RegistrationHelper` logs a collision instead of silently overwriting; the attribute push is the API's job | item 184 (PR 3), one hunk | XS | PM |
| **B5** | **Enrichers on MANUAL and paid-by-hand cards.** The phrasing standard gains a convention: a talent whose roll the engine does not own writes `[[test skill=black dc=…]]` or `[[damage (@tier)d6 vital]]` in its description so the card carries a clickable roll | Turns rule 3's MANUAL exit from "roll it yourself" into one click, with zero wiring and zero engine code; identical on 2.1.0 and 3.1.0 (`hooks/enrichers.ts` exists at both tags) | new item, **2.1.0-safe** (DATA — REBUILD + ⟳ Sync); `phrasing-verifier` learns the tag | S | **R-149** (a card-text convention; recommended default: yes, for the MANUAL set first) |
| **B6** | **Round events instead of turn sweeps, after the flip.** `combat-round-start` / `-end` (3.1.0 `events.ts:179-215`) and the `combatRoundStart` / `combatRoundEnd` hooks replace the per-round resets among the 21 `combatTurnChange` registrations; talents that reset per round carry a native round rule instead of `edha-combat-timing` where the payload allows | Fewer sweeps, and a rule a player can read on the Events tab instead of an engine constant | new item, after PR 6 (the events do not exist at 2.1.0) | M | PM |
| **B7** | **Playwright against a Docker Foundry in CI — no.** It needs Ben's licence as a CI secret, a private world-seed image, and one Foundry instance per run; the bench already drives a real table and CI's pack build already catches the build breaks | — | — | — | declined, recorded here so nobody proposes it again without answering the licence point |
| **B8** | **TypeScript and a bundler — no.** The one-file assembled engine is iron rule 2a on purpose, the harness evaluates the plain file, and the system publishes no `.d.ts` for modules to compile against. **Take the cheap half:** `// @ts-check` + JSDoc on the two registry tables (`EDHA_EVENT_TYPES`, `EDHA_HANDLER_TYPES`) so a wrong config field is a squiggle | — | optional, any time | XS | PM |
| **B9** | **The Mistborn packs as PR 4's fixture corpus.** Shape-only fixtures (names and text stripped) generated from the installed module: talent with one action, passive with none, consumption with the ancestor-Actor step, `item_resource` charges, `skill_test` + `@scalar` damage, `modality` on both talent and action | Item 177 pinned PR 4 to two system JSON files; 206 shipped documents are a better oracle, and they include shapes (`item_resource`, `power` prerequisites) those two lack | item 185 (PR 4) | S | PM |
| **B10** | **Colours as `power` items — noted, not proposed.** The system models a metal as a `power` (a non-core skill + a talent tree + a `@scalar.power.<id>.die` that runs d4 → d12 by rank), and Edha's `[Tier][Die]` = `(@tier)d(2*rank+2)` is *tier copies of the very same die*. Re-basing the five colours on `power` items would let the system own the die table and the `unlocked` gate, and would make `(@tier)@scalar.power.white.die` the formula. It is also a rewrite of 15 trees' data and the creation wizard | — | see the talent-comparison document, §D-4 | XL | **R-150** (recommended default: no, revisit after playtest-1 — the design gain is small and the churn is total) |

Two things that looked like borrows and are not:

- **`matchDocument` in Edha's handlers.** It resolves documents by *ownership* (ancestor, sibling,
  equipped item). Edha's handlers resolve by *targeting* and by *ledger*. The one overlap — a rule that
  names a sibling talent — is served by `edhaRuleOf` already. Skip.
- **The migration framework.** We rebuild; they migrate. Copying their `Migration` shape would give
  Edha a second way to change documents that the pack build already covers. Skip.

## (d) What changes for items 183 – 187

- **Item 183 (PR 2)** — unchanged. Add the sixth `useItem` site to its inventory (actor-level, no
  change needed, but the list should be complete).
- **Item 184 (PR 3)** — **B1 replaces its F5 step**: build the injectors as registered sections instead
  of remapping action rows to their root talents. **B4** lands here as a one-hunk change. The
  "Allomancy hide decision" is now "hide every non-core skill the actor has no power for" (N3).
- **Item 185 (PR 4)** — **B9**: the fixture diff runs against a shape corpus derived from the Mistborn
  packs (generated by a script from an install; never committed as text). The prescriptions it was
  given — one action per non-passive, none per passive, the ancestor-Actor consumption step, `modality`
  on both documents — are each corroborated by the shipped corpus (N1, F6).
- **Item 186 (PR 5)** — unchanged.
- **Item 187 (PR 6, the flip)** — C2's hide covers `fer` as well as `all` when the Mistborn module is
  active; the Route A copy (item 177 §d) should have the Mistborn module enabled so the smoke bench
  sees it (X2); B6 and B2 are filed as follow-ups that can only start after this PR.
- **Item 177 (the live-test plan)** — add to step 3 of Route A: also copy `modules\cosmere-rpg-mistborn-handbook`.

## Appendix A — anatomy of a Metalworks content module

The Mistborn Handbook module is the closest thing to `edha-content` that its own authors ship, and it
is instructive because of how little code it needs. `MB: index.js` (816 lines, minified but readable):

| Lines | What it does | Edha's equivalent |
|---|---|---|
| 1-22 | module id / compendium-key bookkeeping | `module.json` `packFolders` |
| 23-37 | `registerSkill` ×2 (`all`/Willpower, `fer`/Intellect) | the CONFIG write for five colours (N4) |
| 38-44, 807-811 | `registerPowerType` ("metallic-art") | — (Edha has no power type; see B10) |
| 45-96, 783-795 | a currency builder → `registerCurrency` (boxings) | `registerCurrency` (Edha's coin) |
| 97-196 | `registerCulture` ×15, `registerAncestry` ×3, each pointing at a compendium reference | `registerCulture` ×10 (cultures.json) |
| 197-203, 812-815 | `registerPathType` ("metalborn") | `registerPathType` ×2 (leyline, deity) |
| 204-213 | `registerActionType` ("metallic-arts") | — |
| 214-459 | weapons ×34, weapon traits ×2, armor ×8, armor trait ×1, equipment type ×1 (metalmind) | `data/items.json` → `edha-items` |
| 460-467 | `registerActionListSection` (a sheet section) | DOM injection (F5) |
| 468-513 | three fonts, a theme | `styles/edha.css` |
| 514-525 | `registerRollData`: `scalar.modules.metallicarts.die` = `2 * tier + 4` for adversaries | the adversary attack model (R-137) |
| 529-689 | **the only behaviour**: three macros that switch an ActiveEffect on with `duration.rounds` = skill rank (burn / tap / store), plus per-metal value tweaks | `edha-self-status`, timed statuses, stances |
| 702-771 | starting-path macros: set/unset the starting skill rank | the creation wizard (`24-…`) |
| 772-782 | one render hook (journal header styling) and `init` | 192 `Hooks.on` |

No `preUseItem`. No contest. No targeting. Every rule that needs a judgment is a sentence on the card
and a player who reads it. That is the design decision the talent-comparison document measures.

## Appendix B — the two codebases in numbers

| Measure | Metalworks 3.1.0 | Edha `main` |
|---|---|---|
| Runtime source | 60,172 TS lines, 405 files | 21,792 JS lines, 55 sources → 1 assembled file |
| Build tooling | Rollup, TypeScript, SCSS, foundryvtt-cli | 37 scripts (node + python), `classic-level` |
| Tests | 5 Playwright specs + fixtures (E2E, Docker) | 133 node tests + 15 gates + the agent bench |
| Event types / handlers | 27 / 14 native | +102 `edha-*` on the same registry |
| Talent content shipped | 150 heroic + 225 Radiant (Stormlight) · 206 metallic + 135 heroic (Mistborn) | 365 (125 leyline, 90 deity, 150 heroic) |
| Rules on those talents | 23 on 206 (Mistborn) | 415 on 365 |
| i18n keys | 1,179 | 7 lines |
| Registration API calls (content) | 17 kinds | 5 kinds used |
| Public docs | CONTRIBUTING, Data-Formats, Enrichers, release notes | CLAUDE.md, handoff, changelog, ENGINE_INDEX, 13 skills |
