# cosmere-rpg 2.1.0 → 3.1.0 — compatibility check (TODO item 177)

Static analysis, 2026-09-15 (DOCS-ONLY). **Nothing was installed, launched or changed** on Ben's
Foundry, and no engine or data file changed. Every claim cites the system's TypeScript source at the
two release tags and Edha's code at `origin/main` 65712cb. The live test this cannot replace is
planned in §(d).

**Reading the references.** `2.1.0:` and `3.1.0:` mean `src/system/<path>` in the tagged source
archive; a bare `NN-name.js:line` is `module-src/scripts/engine/`; other Edha paths are
repo-relative.

## Contents

- [Provenance](#provenance)
- [(a) Summary](#a-summary)
- [(b) Break list](#b-break-list)
- [(c) Migration plan](#c-migration-plan)
- [(d) Live-test plan](#d-live-test-plan)
- [(e) What 3.1.0 means for items 178–181](#e-what-310-means-for-items-178181)
- [Appendix A — release notes 2.1.0 → 3.1.1-pre](#appendix-a--release-notes-210--311-pre)
- [Appendix B — Embedded Actions in depth](#appendix-b--embedded-actions-in-depth)
- [Appendix C — touchpoint inventory](#appendix-c--touchpoint-inventory)
- [Appendix D — the 3.1.0 native vocabulary](#appendix-d--the-310-native-vocabulary)

## Provenance

| What | Value |
|---|---|
| Installed system | `Data/systems/cosmere-rpg/system.json` → **2.1.0**, compatibility 13.346 / 13.351 (read only) |
| Downloaded | `cosmere-rpg-release-3.1.0.zip` via `gh release download release-3.1.0 -R the-metalworks/cosmere-rpg`, into `%TEMP%\edha-cosmere-3.1.0\` only (item 177 names the download; Ben's go, 2026-09-15) |
| Zip size | **69,276,436 bytes** (the release also ships `system.json`, 5,941 bytes) |
| Zip sha256 | **`bdad787b1c282147c7b01ae6fc0c4e6048b4b739c2a2ebf9c74491347c0c2bc8`** |
| Unpacked `system.json` | version **3.1.0**, compatibility minimum 13.346 / verified 13.351 — the same pair as 2.1.0, so Foundry 13.351 satisfies it |
| Source read | GitHub source archives of tags `release-2.1.0` and `release-3.1.0`; the 3.1.1 pre-release compared by `gh api repos/the-metalworks/cosmere-rpg/compare/release-3.1.0...prerelease-3.1.1` |
| Changelog | There is **no `CHANGELOG.md`** at either tag. The notes ship as `src/release-notes.md` + `src/patch-notes.md` and match the GitHub release bodies (Appendix A) |

## (a) Summary

**3.1.0 breaks Edha at the root.** Release 3.0.0 replaced item Activations with **Embedded
Actions**: `activation` and `damage` leave talents, weapons, traits, powers, equipment and armor and
now live only on `action` items stored *inside* those items. `CosmereItem#use`, `#roll` and
`#rollAttack` run only on an action. The hooks the engine listens to — `preUseItem`, `useItem`, and
every roll hook's `source` — now hand the engine that embedded action, not the talent whose `events`
carry Edha's rules. And the native `use` event fires only for actions, so a talent's `use` rules go
quiet.

What did **not** change: every hook *name* Edha uses, the dice classes (`D20Roll`, `DamageRoll`,
`PlotDie` are byte-identical), `CosmereActor#applyDamage` and its two hooks, `getApplyTargets`, the
event/handler registration API that carries every `edha-*` type, rule storage and dispatch
(`enabledEvents`, `fireEvent`), the actor fields Edha reads, the sheet classes, and the
`CONFIG.COSMERE` keys and API functions the engine calls.

| Severity | Count | IDs |
|---|---|---|
| **blocker** | **5** | B1–B5 |
| **breaks a feature** | **9** | F1–F9 |
| **cosmetic** | **6** | C1–C6 |
| none — touchpoint unchanged | 21 | Appendix C |
| outside Edha's code, unverified | 1 | X1 |

**Top five risks.**

1. **Every PC talent is unusable until two things ship together.** The pack builder must emit an
   embedded action per non-passive talent (B1), *and* the engine must resolve the action a hook hands
   it back to the talent that carries the rules (B2). Either alone leaves the tree dead.
2. **The world migration runs by itself, once, and is one-way.** The first time a GM opens the world
   on 3.x the system rewrites every owned item and event rule (Appendix B.1). It records the new
   version even when a step fails (3.1.0 `hooks/welcome.ts:89-97`), so a failed migration is never
   retried. It never touches compendia — Edha's five packs stay 2.x-shaped. Only a restore undoes it.
3. **Adversary numbers change without an error.** A migrated weapon keeps its dice and silently loses
   its flat damage bonus and its attack bonus (B5: 36 flat-model adversary weapons). A compendium
   adversary action loses its cost and its skill (B4: 78 actions, 53 with a cost).
4. **Every gate stays green through all of it.** Lint pass 11's field union still contains
   `activation` and `damage`, because actions still declare them (F8), and no test loads a 3.x data
   model. CI cannot see this upgrade break; only a bench on a copy can.
5. **Silent drift after the upgrade.** ⟳ Sync Talents never refreshes the embedded actions the
   migration creates (F2). Edha's `diminished` status is shadowed by the system's new condition of
   the same id (F4). And the third-party `cosmere-advanced-encounters` module in Ben's world has no
   3.x release (X1).

**Effort.** About **9 worker sessions**: six themed PRs (sizes in §c) plus one fix pass after the bench
on the copy. On top of that, two agent bench runs on the copy, and about an hour of Ben's time across
two windows — making the copy with his license entry, and later the live upgrade with ⟳ Sync. At the
current PM pace that is two to three nights.

**Recommended live-test route: a separate Foundry data path** (§d, Route A). Ben enters his license
there himself. The live data path stays on 2.1.0 until the fix PRs pass the bench on the copy. The final
live upgrade is then a backed-up in-place upgrade with Ben present (Route B).

## (b) Break list

Each row names the touchpoint, what 2.1.0 does, what 3.1.0 does, and Edha's call sites. The
severities are blocker, breaks a feature, cosmetic or none; the fix classes are ENGINE, DATA-REBUILD
and TOOLING. The sizes run XS (under an hour), S (half a worker session), M (one session) and L (two).

### Blockers

| ID | Touchpoint | 2.1.0 | 3.1.0 | Edha call sites | Severity | Fix | Size |
|---|---|---|---|---|---|---|---|
| **B1** | Talent data model: `system.activation`, `system.damage` | `TalentItemDataModel` mixes in `ActivatableItemMixin` + `DamagingItemMixin` (2.1.0 `data/item/talent.ts`, mixin list lines 85–86) | Both mixins removed; `ResourcesItemMixin` + `LinkedSkillsMixin` added (3.1.0 `data/item/talent.ts:88, 91`). Activation and damage exist only on `action` items (3.1.0 `data/item/action/index.ts:29-36`), stored inside the talent as `system.__embedded.items[]` (3.1.0 `documents/system-embedded-collections/constants.ts:1`; the system's own compendium talent `src/packs/heroic-paths/agent/spy/talents/subtle-takedown.json`). No 3.1.0 data model has a `migrateData`, so an old-shape field is **dropped** at load, not converted | `scripts/foundry-build.js:148-170` (`rollData`), `:579-603` (the talent doc writes `activation`, `damage`), `:611-617` (the authored overlay wins: 354 `activation` and 427 `formula` keys across `data/authored/*.json`); 246 of the 365 atlas talents are non-passive | **blocker** — a talent built by today's pipeline loads with no action: nothing to click on the tree, and every new pick or level-up arrives unusable. The system's world migration never touches compendia | DATA-REBUILD | L |
| **B2** | The item `preUseItem` / `useItem` pass | `CosmereItem#use` fires both with the talent itself (2.1.0 `documents/item.ts:875-878, 907, 1065`) | `use()` returns null unless `isAction()` (3.1.0 `documents/item.ts:1253`). Both hooks fire with the **embedded action** (`:1280-1292`, `:1464-1478`). Its `actor` still resolves through the parent chain (`_Item#actor`, `:159-165`) and its `root` is the talent (`:406-408`) | `edhaIsTalent` (`31-trigger-gating-cost.js:37-39`) is false for an action, and `edhaEventRules` (`03-where-an-effect-lives.js:135-138`) reads the action's empty `events`. So these 24 `preUseItem` sites go inert: `04-black-ritual.js:276`; `05-edha-watch.js:501, 527, 611, 634, 659, 712, 743, 762, 775, 803, 820, 864, 883`; `06-edha-prompt-pick.js:186`; `21-resource-consume-dialog.js:121`; `29-summons.js:362`; `34-single-target-gate-defeat-tracking.js:22`; `38-cost-refund-on-cancel.js:44`; `39-burst-execution-the-gm-socket-relay.js:390` (the `edha-pre-use` dispatcher, which re-fires `edha-content.noop-pre-use` with the action at `:394`) and `:399` (burst takeover); `41-life.js:304`; `42-chaos.js:175`; `44-sovereignty.js:281`. So do the three talent `useItem` sites `07-edha-owner-list.js:543`, `15-blue-calculation.js:525`, `16-heroic-paths.js:307`. Unaffected, because they are actor-level actions: `07-edha-owner-list.js:671` and `52-green-instinct.js:325` (Draw Mana) | **blocker** — every pre-cost veto, the single-target gate, the cost-shortfall announcer, the stance toggle and the burst takeover stop, with no error; a burst talent falls through to the system's single-target roll | ENGINE (one resolver, dual-mode) | M |
| **B3** | The native `use` event on a talent | `use` fires on any item that has an activation (2.1.0 `hooks/item-event-system/events.ts:58-62`) | `use` fires **only on actions** (3.1.0 `events.ts:139-143`). A talent's rules need the new `use-action`, which re-targets the root item (`:144-150`). The world migration rewrites `use` → `use-action` on world non-action items (3.1.0 `utils/migration/migrations/2.1-3.0.ts:262-267`), on world documents only (`hooks/welcome.ts:57-99`). Compendia need a manual `cosmereRPG.utils.invokeMigration(from, to, packIds)` (`utils/migration/index.ts:134-164`, exposed by `utils/global.ts:10-14`) | 189 authored `"event": "use"` rules in `data/authored/*.json`, all on talents, plus the generator's `talentEvents()` output (`scripts/foundry-build.js:575`). Engine readers of the literal: `05-edha-watch.js:614`, `44-sovereignty.js:302`. The 32 adversary `use` rules sit on `action` items and keep firing | **blocker** — on a compendium-built or re-synced talent, every H1 `edha-def-test` contest, triggered effect and note that runs on use never fires, so the `edha-test-success` / `-fail` chains behind them are dead | DATA-REBUILD (translate at build; rewrite the data at the flip) + ENGINE (2 readers) | M |
| **B4** | Action item shape: adversary actions, talent twins, Draw Mana, runtime summons | `activation {type, cost, consume[], flavor, skill, attribute, modifierFormula, plotDie, opportunity, complication, uses}` (2.1.0 `data/item/mixins/activatable.ts`, `ACTIVATION_SCHEMA`) | `activation {type, cost, consumption[], flavor}` (3.1.0 `data/item/action/fields/activation/index.ts:19-79`). Each consumption row adds `matchDocument` (`…/activation/consumption/schema.ts:64-121`). `skill`, `attribute`, `modifierFormula`, `plotDie`, `opportunity` and `complication` move to `skillTest` (`…/fields/skill-test.ts:11-49`). `uses` moves to `resources.uses` (`documents/item.ts:1395`). `damage.skill` / `damage.attribute` default to `"default"` (`…/fields/damage.ts:10-36`) | `scripts/foundry-build.js:1015-1148` (`advItemDoc`: 78 adversary actions, 53 with a cost, 13 with a skill or attack), `:1267` (Draw Mana), `:1366` (talent twins: 11 named references plus each attuned block's Leyline Keys); at runtime, `29-summons.js:144-184` (summon attacks written with `activation.skill` / `attribute`) | **blocker** — a compendium adversary action charges no cost and rolls "Custom Skill" +0, and a summon attacks with no skill. World actors are converted by the migration (`2.1-3.0.ts:323-334, 336-457`); compendia are not | DATA-REBUILD + ENGINE (summons) | M |
| **B5** | Weapons | `activation` (`skill_test`) + `damage {formula, type, skill}` + `attack` (2.1.0 `data/item/weapon.ts` mixins) | `activation` and `damage` are replaced by `strike {die {size, count}, damageType, skill, skillLocked, skillTestBonus, damageBonus}` (3.1.0 `data/item/mixins/striking.ts:3-55`; `data/item/weapon.ts:115` has `ActivatableItemMixin` commented out, `:130` adds `StrikingItemMixin()`), and a Strike action is generated at runtime (`documents/item.ts:205-209`). The migration keeps only the dice — `damageFormulaToDieSizeAndCount` matches `(\d+)(d\d+)` (`2.1-3.0.ts:218-229, 479-492`) — and sets no `skillTestBonus` or `damageBonus` | `scripts/foundry-build.js:818-819` (edha-items weapons); `advItemDoc`'s weapon branch, `:1139-1146`: 50 adversary weapons, 36 of them on the flat attack model, whose to-hit is `modifierFormula` and whose damage carries a flat `+N` | **blocker** — a compendium weapon rolls the default strike (1d4 keen, Light Weaponry). A migrated world weapon keeps its dice but loses its `+N` damage and its attack bonus, silently | DATA-REBUILD + ⟳ Sync Adversaries | M |

### Breaks a feature

| ID | Touchpoint | 2.1.0 | 3.1.0 | Edha call sites | Severity | Fix | Size |
|---|---|---|---|---|---|---|---|
| **F1** | Engine reads of a talent's **own** `system.activation` / `system.damage` | The talent carries both | The talent carries neither; they sit on `talent.defaultAction` (3.1.0 `documents/item.ts:459-461`) | `04-black-ritual.js:88` (`edhaOnHitIsItemSpecific`); `35-targeting-attunement-range-aoe-templates.js:32-34` (`edhaTalentColor`); `37-synchronous-formula-dice-evaluation.js:128-132` (`edhaConsumeList`, where `consume` becomes `consumption`); `07-edha-owner-list.js:546`; `41-life.js:413, 415`; `44-sovereignty.js:87`. Also the rule executors that read the host talent's formula: `39-burst-execution-the-gm-socket-relay.js:89-90`, `40-destruction.js:232, 370-374, 468-491`, `43-fate.js:212, 287`, `46-civilization.js:143-144, 189-190`, `49-order.js:305-307, 327-329, 741-748`, `52-green-instinct.js:439-440`, `53-native-event-system.js:1719, 1750-1752, 2195-2202`, `54-edha-card-buttons.js:127` | **breaks a feature** — each read falls back silently: to an engine default die, a wrong colour (the ⊙ range and Necrotic Grasp's heal-cut gate), an empty cost list, or the wrong on-hit scope. The *rolling-item* reads stay correct — `01-shared-core.js:734, 789, 798` and `03-where-an-effect-lives.js:164, 227-268` read the roll's source, which is the action and carries `damage` (3.1.0 `documents/item.ts:1905, 1943`) | ENGINE (one accessor, dual-mode) | M |
| **F2** | ⟳ Sync Talents | Copies `system.activation` / `system.damage` from the pack source onto owned talents (`26-talent-sync.js:141-151`) | The source talent has neither key, so nothing is written. The owned talent's embedded action — created by the migration, `2.1-3.0.ts:231-247` — is never refreshed | `26-talent-sync.js:134-156` | **breaks a feature** — owned talents keep migration-time costs, skills and damage forever; a card fix reaches the description but never the roll | ENGINE | M |
| **F3** | The engine calling `item.use()` on a talent | Runs the talent (2.1.0 `documents/item.ts:875`) | Returns null (3.1.0 `:1253`) | `34-single-target-gate-defeat-tracking.js:52` (the single-target re-pick button) | **breaks a feature** — the pick card retargets and then does nothing | ENGINE (`defaultAction.use()`) | XS |
| **F4** | Edha's `diminished` status id | Not a system id | The system now defines `diminished` (and `depleted`) with `condition: true` (3.1.0 `config.ts:125-130, 139-144`), and `edhaRegisterStatuses` skips an id the system already has (`01-shared-core.js:233-234`) | `01-shared-core.js:191` (Sovereignty's Diminished, `condition: false`); `44-sovereignty.js:63, 272` | **breaks a feature** — Sovereignty's step-down mark takes the system's label and icon and becomes a CONDITION, so `edhaHasCondition` (`03-where-an-effect-lives.js:152-156`) turns true for it and condition-gated riders and cleanses change | ENGINE (rename the id; the card prose can keep "Diminished") | S |
| **F5** | Sheet injectors keyed on an Actions-tab row's `data-item-id` | Actions-tab rows are the actor's own items | Actions-tab rows are actions (3.1.0 `templates/actors/components/actions-list-entry.hbs:3`); a talent's action id is not in `actor.items`. Talents moved to a new Talents tab (`templates/actors/character/components/talents-list.hbs:35`) | `35-targeting-attunement-range-aoe-templates.js:131-150` (⊙ range button); `25-sheet-qol.js:203-208` (ritual HP-cost cell) | **breaks a feature** — the ⊙ button and the HP-cost label disappear from the Actions tab (the ⊙ may reappear on the Talents tab) | ENGINE | S |
| **F6** | Stance talents (`modality`) | The talent's `system.modality` drives mode activation inside `use()` | `use()` reads `modality` on the **action** (3.1.0 `documents/item.ts:1423-1434`), and the migration does not copy `modality` onto the new action (`2.1-3.0.ts:336-457`) | `scripts/foundry-build.js:597` (`modality: "stance"`); `15-blue-calculation.js:525-528` | **breaks a feature** — neither the system's mode nor Edha's stance toggle happens | DATA-REBUILD (put `modality` on the action) + B2's resolver | S |
| **F7** | The Foundry → overlay extract round-trip | Reads `description`, `activation`, `damage`, `events` off the talent (`scripts/edha-pack-io.js:33, 99`) | Cost, skill and damage live on the embedded action | `scripts/edha-pack-io.js:33, 99` (used by `scripts/foundry-extract.js`) | **breaks a feature** — Ben's in-Foundry edit to a cost, skill or damage (on the talent's Actions tab, in 3.x) no longer extracts | TOOLING | M |
| **F8** | Lint pass 11 (dead `system.*` fields) against a 3.1.0 snapshot | The union of every top-level field | Still a union, and `activation` / `damage` stay in it because actions still declare them: 87 → 103 fields, 0 removed (Appendix D) | `scripts/dump-native-vocabulary.js:143-184`; `scripts/lint-refs.js:752-810` | **breaks a feature** (a gate) — pass 11 cannot see B1 or F1: a talent-level `system.activation` read passes as "not obviously dead", so CI stays green | TOOLING (per-item-type field sets) | M |
| **F9** | Tooling that reads the 2.x action shape | `activation.type`, `.skill`, `.consume` | Moved (B4) | `scripts/lint-refs.js:1104-1131` (`checkRollable`), `:2087-2108` (consume guard); `scripts/validate-adversaries.js:59-65`; `scripts/inspect-pack.js:25`; 17 test files touch `activation` or the consume dialog (Appendix C, row 26) | **breaks a feature** — lint stays right while the overlay keeps its 2.x keys; the two pack readers read compiled packs, so they misreport as soon as the build emits the 3.x shape | TOOLING | S |

### Cosmetic

| ID | Touchpoint | 2.1.0 | 3.1.0 | Edha call sites | Severity | Fix | Size |
|---|---|---|---|---|---|---|---|
| **C1** | The consume-dialog pre-tick wrapper | Wraps `CosmereItem#showConsumeDialog`, which ticks row 0 only (2.1.0 `documents/item.ts:1178, 1188`) | Method removed; `use()` calls `ItemConsumeDialog.show(this)` (3.1.0 `:1303`), which opens **every** row ticked (`applications/item/dialogs/item-consume.ts:88`) | `21-resource-consume-dialog.js:70-90`; `tests/consume-dialog-wrapper.test.js` | **cosmetic** — logs "showConsumeDialog not found"; R-70 (b)'s behaviour is now native | ENGINE (retire the wrapper and its test) | XS |
| **C2** | Mistborn content in `CONFIG.COSMERE` | — | A new non-core skill `all` (Allomancy, Willpower — 3.1.0 `config.ts:491-495`; bundle `Skill["Allomancy"] = "all"`) and the statuses `depleted`, `diminished` | The creation wizard's live skill lists (`24-the-character-creation-wizard.js:477, 813, 844`); the sheet's non-core skill group (3.1.0 `applications/actor/components/skills-group.ts:67-68`) | **cosmetic** — Edha characters show an Allomancy skill, and two Mistborn conditions appear in the token HUD | ENGINE (optional hide) | XS |
| **C3** | `module.json` system relationship | `compatibility {minimum: "2.0.0", verified: "2.0.4"}` | 3.1.0 is past `verified` (there is no `maximum`, so the module still loads) | `module-src/module.json:28` | **cosmetic** — an "unverified" badge; note it is already stale against 2.1.0 today | TOOLING | XS |
| **C4** | Pack `_stats.systemVersion` | `SYSVER = "2.1.0"` | No 3.1.0 data model migrates by version (no `migrateData` at either tag), so only the stamp is wrong | `scripts/foundry-build.js:43, 921` | **cosmetic** | TOOLING | XS |
| **C5** | Wizard weapon list | Reads `d.system.activation.skill` on weapons | Weapons carry `strike.skill` | `24-the-character-creation-wizard.js:385` | **cosmetic** — a blank skill name on the gear list | ENGINE | XS |
| **C6** | `data/native-vocabulary.json` and the counts quoted in docs | 17 events, 12 handlers | 27 events, 14 handlers (Appendix D) | `data/native-vocabulary.json`; `CLAUDE.md` "Where behavior lives" ("12 handlers + 17 events"); the snapshot's own `_README` | **cosmetic** until regenerated — and regeneration must **wait for the live upgrade**: a 3.1.0 snapshot on a 2.1.0 table would let an author write `use-action` | TOOLING | XS |

### Outside Edha's code

| ID | Touchpoint | Finding | Severity |
|---|---|---|---|
| **X1** | `cosmere-advanced-encounters` 1.3.1, installed in Ben's `Data/modules` | Verified for cosmere-rpg 2.0.5; its last release is 2026-03-25 and there is no 3.x release. Its bundle reads `system.activation` 7 times and hooks `cosmere-rpg.preUseItem` / `useItem` | **unknown** — smoke it on the copy (§d, S12); if it throws, disable it in the copy's world and tell Ben before the live upgrade |

## (c) Migration plan

**Principles.** (1) The **engine** changes are written **dual-mode**. A resolver that treats an item as
an embedded action only when `item.isAction?.()` and its parent is an Item is a no-op on 2.1.0, where
items cannot embed items. So those PRs land on `main` early as F5-only deploys. (2) The **builder**
switches shape behind a target flag (`EDHA_SYSTEM_TARGET`, default `2`), so nothing merged breaks the
2.1.0 table. (3) **The flip** — default target 3, the vocabulary regenerated — lands in the live-upgrade
window and nowhere else.

| # | PR (theme) | Breaks closed | Class and deploy | Proof | Size |
|---|---|---|---|---|---|
| 1 | **Per-type schema harvest.** `dump-native-vocabulary.js` also records top-level field sets per item type (talent, action, weapon, trait, …), and lint pass 11 checks a `system.<field>` read against the type the call site holds where it can tell. The snapshot stays at 2.1.0 | F8 | TOOLING — nothing to deploy | A mutation: a `talent.system.strike` read fails pass 11 against a fixture 3.x snapshot | M |
| 2 | **The use-subject resolver and the action accessor**, dual-mode. `edhaUseSubject(item)` (action → root talent) at the 24 `preUseItem` and 3 talent `useItem` sites and in the `edha-content.noop-pre-use` dispatch. `edhaActionOf(item)` for every talent-level `activation` / `damage` read, including `consume` ↔ `consumption`. `defaultAction.use()` at 34:52. `use` or `use-action` at 05:614 and 44:302. Harness stubs for `isAction`, `parent`, `root`, `actions` and `defaultAction`, with pinned tests | B2, F1, F3, C5, B3's readers | ENGINE — F5, with no behaviour change on 2.1.0 | The existing suite passes unchanged (2.1.0 path); new 3.x-stub tests fail when the resolver is removed | L |
| 3 | **Sync, summons, statuses, sheet.** ⟳ Sync Talents and ⟳ Sync Adversaries create, update or delete embedded actions by `system.id`; summons write 3.x actions; Edha's `diminished` id is renamed; the ⊙ and HP-cost injectors map action rows to their root; the Allomancy hide decision is made; the consume wrapper stays a guarded no-op | F2, B4 (summons), F4, F5, C2 | ENGINE — F5 | Pinned tests per helper; the id rename proven by a grep gate that fails on `"diminished"` in `01-shared-core.js` / `44-sovereignty.js` | M |
| 4 | **The builder behind `EDHA_SYSTEM_TARGET=3`.** Embedded actions for non-passive talents (Appendix B.3 shape, translated exactly as the system's own `migrateActionData` maps); 3.x shapes for adversary actions, talent twins, Draw Mana and weapons (`strike`, with `skillTestBonus` and `damageBonus` carrying the flat model); `use` → `use-action` on non-action docs; `modality` on the action; `SYSVER` per target; a validator that every non-passive talent carries exactly one embedded action and no talent carries top-level `activation` / `damage` | B1, B3 (data half), B4, B5, F6, C4 | DATA-REBUILD — nothing deploys while the default is 2 | Target-2 scratch builds hash **identical** before and after; target 3 checked by the new validator and by a fixture diff against the system's own compendium JSON (`subtle-takedown.json`, `fatal-thrust.json`) | L |
| 5 | **Extract round-trip and the old-shape readers.** `edha-pack-io.js` maps an embedded action back to the overlay's `activation` / `damage` and `use-action` back to `use`; `lint-refs.js` 1104-1131 / 2087-2108, `validate-adversaries.js:59-65` and `inspect-pack.js:25` read either shape | F7, F9 | TOOLING — nothing to deploy | A round-trip test: build target 3 → extract → the overlay is byte-identical | M |
| — | *Bench on the copy (§d, Route A), then one fix pass for whatever it finds* | — | — | — | (M) |
| 6 | **The flip**, merged in the live-upgrade window. Default target 3; `data/native-vocabulary.json` regenerated at 3.1.0; the authored `use` → `use-action` rewrite (one scripted commit, 189 rules); `module.json` relationship → 3.1.0; the vocabulary counts in `CLAUDE.md` and the handoff; the consume wrapper and its test retired | C6, C3, C1, B3 (data) | TOOLING + DATA + DOCS — **REBUILD + ⟳ Sync Talents + ⟳ Sync Adversaries** | `node scripts/gates.js --ci` green at target 3; then the Route B bench run | M |

**Two engineering choices the PM should settle before PR 4** (recommended defaults in bold):

- **Keep the overlay's seven keys and translate in the builder**, or add an `actions` key. Keeping them
  holds lint-refs' whitelist, CLAUDE.md's seven-key rule and all 354 `activation` / 427 `formula`
  keys still, and Edha has one action per talent today.
- `use` → `use-action`: **translate at build until the flip, then rewrite the data once**, so the
  JSON matches what the Events tab shows — or translate forever.

**Dispatch order.** 1 → 2 → 3 → 4 → 5 → the copy bench → the fix pass → 6 → the live upgrade.
PRs 1–5 never change what Ben's 2.1.0 table does.

## (d) Live-test plan

### Recommendation: Route A, a separate Foundry data path

- **Isolation.** Systems are installed per data path, so a copied *world* in the live data path would
  still run whatever system that path has. Only a second data path lets 3.1.0 and 2.1.0 exist at once.
- **The table stays up.** Five blockers mean a live world on 3.1.0 is unplayable from the moment it
  migrates until PRs 2–4 ship. Route A keeps Ben's table on 2.1.0 for the whole fix cycle.
- **Repeatable.** The migration is one-way and not retried after a failure. On the copy, a bad run
  costs a re-copy, not a restore.

Route A needs **Ben's own license entry** on the new data path. The agent never sees or handles it.

### Route A — the steps Ben takes himself

1. **Close Foundry** completely — the app, not just the world.
2. **Make a folder outside OneDrive**, for example `C:\FoundryTest\edha-3.1.0\`.
3. **Copy, keeping the folder names**, from `%LOCALAPPDATA%\FoundryVTT\Data\` into
   `C:\FoundryTest\edha-3.1.0\Data\`:
   - `worlds\edha` (18 MB);
   - `modules\edha-content` and `modules\cosmere-advanced-encounters` (4.8 MB together);
   - `assets` (13 MB).

   **Do not copy** `systems\`, and do not copy anything from `%LOCALAPPDATA%\FoundryVTT\Config\`. The
   test instance makes its own `Config`, and that is where its license goes.
4. **Start the test instance** from PowerShell with its own data path and port:

   ```powershell
   & "C:\Program Files\Foundry Virtual Tabletop\Foundry Virtual Tabletop.exe" --dataPath="C:\FoundryTest\edha-3.1.0" --port=30001
   ```

5. **Enter your license key and accept the EULA** when Foundry asks. A fresh data path always asks.
6. **Check isolation.** Setup → Configuration → **User Data Path** must read
   `C:\FoundryTest\edha-3.1.0`. If it shows `%LOCALAPPDATA%\FoundryVTT`, stop: close Foundry and tell
   the PM. The flag did not take, and the copy is not isolated.
7. **Install 3.1.0.** Setup → Game Systems → Install System → Manifest URL:
   `https://github.com/the-metalworks/cosmere-rpg/releases/download/release-3.1.0/system.json` →
   Install. Check that the list reads *Cosmere Roleplaying Game 3.1.0*.
   Without a second download, you can instead extract the zip this check already verified,
   `%TEMP%\edha-cosmere-3.1.0\cosmere-rpg-release-3.1.0.zip` (sha256 `bdad787b…c2bc8`), into
   `C:\FoundryTest\edha-3.1.0\Data\systems\cosmere-rpg\`.
8. **Check the modules.** Setup → Add-on Modules lists Edha Content and Cosmere Advanced Encounters. An
   "unverified" badge is expected (C3, X1).
9. **Launch world `edha` as your GM user and let it migrate.** The system shows its 3.x release notes
   and migrates the world. Press **F12 → Console** and wait for `2.1 -> 3.0: Succeeded` and
   `Successfully migrated data! Refreshing sidebar...` (3.1.0 `utils/migration/index.ts:85-93, 121`)
   before clicking anything. **If a red error appears, copy the console and stop.** A failed migration
   is not retried (`hooks/welcome.ts:89-97`); the copy can be re-made from step 2.
10. **Tell the PM "the 3.1.0 copy is up on 30001"**, and leave it running. An agent bench run joins
    as `Bench` at `http://localhost:30001/join` and drives the smoke rows below. **While the copy
    runs, nobody runs `scripts/deploy-cycle.js`, `module-src-sync.js push` or
    `deploy-to-foundry.bat`**: all three write the **live** module.
11. **When done, close the test instance.** The live install is untouched: start Foundry normally, with
    no flags, and it opens 2.1.0. Delete `C:\FoundryTest\edha-3.1.0` whenever you like.

### The smoke bench on the copy (🤖)

These become checklist rows once the copy exists; none are filed now. Each row says what to do and
what this analysis predicts, so a result that differs from the prediction is itself a finding.

| Row | Drive | Predicted on the copy |
|---|---|---|
| S1 | Use a `skill_test` + damage talent from a PC's Actions tab | The attack and damage card posts; Edha's pre-use gates stay silent (B2) |
| S2 | Apply that damage from the system card to a target | Applies; Edha's on-hit riders fire (Appendix C, row 5) |
| S3 | An `edha-def-test` talent owned by a copy PC | The contest resolves — the migration rewrote that talent's `use` to `use-action` — but its pre-cost veto is skipped (B2) |
| S4 | ⟳ Sync Talents on a copy PC | Completes; the owned talent's action is unchanged (F2) |
| S5 | Take a new talent from a tree | It arrives with no action and cannot be used (B1) |
| S6 | Roll with an Opportunity | The Opportunity menu posts (roll hooks unchanged) |
| S7 | A PC's weapon Strike | Rolls its dice (the migration kept them) |
| S8 | Place a flat-model adversary from the Edha compendium; use a weapon and a costed action | The weapon rolls 1d4 keen Light Weaponry (B5); the action charges nothing and rolls with no skill (B4) |
| S9 | A stance talent | No mode is set (F6) |
| S10 | Draw Mana | Works (an actor-level action) |
| S11 | A Sovereignty step-down (Diminished) | Shows the system's icon and label, and counts as a condition (F4) |
| S12 | Cosmere Advanced Encounters: start a combat, act, end a turn | Unknown (X1) |
| S13 *(optional, informational)* | In the console: `await cosmereRPG.utils.invokeMigration("2.1.0", "3.1.0", ["edha-content.edha-leyline"])` | Shows how far the system's own migration gets on an Edha pack (the rebuild replaces the packs anyway) |

### Route B — back up and upgrade the live data path (for the final upgrade only)

1. Close Foundry.
2. Copy `%LOCALAPPDATA%\FoundryVTT\Data\worlds\edha`, `Data\systems\cosmere-rpg` and
   `Data\modules\edha-content` into a dated folder outside OneDrive.
3. Setup → Game Systems → update cosmere-rpg to 3.1.0.
4. Launch `edha` as GM and watch the migration, as in Route A step 9.
5. An agent deploys the flipped build (PR 6) with `scripts/deploy-cycle.js`; Ben clicks ⟳ Sync Talents
   and ⟳ Sync Adversaries; an agent bench run follows.

**Rollback** is closing Foundry and restoring **all three** folders. The world alone would leave a
3.x-migrated system missing; the system alone would leave a migrated world 2.1.0 cannot read.

**Why not Route B for the test.** It takes the table down for the whole fix cycle. The migration it
triggers is one-way and not retried after a failure. And a partial restore leaves a mixed state that is
harder to diagnose than a fresh copy.

## (e) What 3.1.0 means for items 178–181

The break list changes **where** this work hooks in, not whether it can be built. Build 178–181
**after PR 2**, dual-mode, and it is written once — not written on 2.1.0 and rewritten after the flip.

### Item 178 — R-142 (a), a rule field that suppresses the system's own damage roll

- **Where the roll comes from.** On 3.1.0 it belongs to the talent's embedded action. `use()` takes the
  attack path when the action has a skill test and a formula (3.1.0 `documents/item.ts:1484-1498`),
  and `rollAttack` calls `rollDamage` (`:1208-1216`).
- **Build on the wrapper Edha already owns**, `CosmereItem#rollDamage` (`03-where-an-effect-lives.js:272-289`).
  When the talent's rule carries the field, return **`[]`, not `null`**. `rollAttack` returns the result
  inside its tuple (`:1243`) and `use()` spreads `attackResult[1]` into the message (`:1502-1505`), so
  `null` throws. `[]` posts the d20 with no damage and no Apply buttons.
- **Read the field off the root talent.** That is `this.root` (`:406-408`) through PR 2's accessor; on
  2.1.0, `this` is already the talent.
- **What it keeps — R-142 (a)'s whole point, and it holds on 3.1.0.** The formula stays on the action, so:
  - the d20 context stays `Attack` (`isAttack` → `context: 'Attack'`, `:1904`);
  - the `config.data.source.system.damage.formula` checks (`01-shared-core.js:734, 789, 798`) still
    read true;
  - `edhaTalentColor` keeps its formula (via F1's accessor).
- **No native alternative.** `preDamageRoll` is `Hooks.callAll` and cannot cancel
  (`dice/index.ts:207`), and `use()`'s options have no skip-damage flag.

### Items 179–181 — R-143 (a), the engine applies attack damage itself

The 3.1.0 surface to build on:

| Need | 3.1.0 API | Evidence |
|---|---|---|
| **Hit or miss** | `cosmere-rpg.attackRoll(roll, source, config)` — unchanged. `roll.total`, and `roll.opportunitiesCount` / `complicationsCount` on an unchanged `D20Roll`; `config.data.source` is the action, `.root` the talent, `.actor` the attacker | 3.1.0 `constants/hooks.ts:73`; `dice/index.ts`; `documents/item.ts:1904-1905` |
| **Damage and the graze** | `cosmere-rpg.damageRoll` (unchanged) and `roll.graze`, a roll built from the damage dice only — SR p.35's "damage rolled on the damage dice (no skill modifier added)" | `documents/item.ts:977-996` |
| **The recorded target** | `use()` writes `flags["cosmere-rpg"].message.targets` (`getTargetDescriptors()`) and `message.item` as the **action's UUID** (2.1.0 stored an id); read it back with `fromUuid`, or through the message's own item lookup | `documents/item.ts:1454-1461`; `documents/chat-message.ts:63-67` |
| **Apply** | `CosmereActor#applyDamage(instances, { originatingItem })` — unchanged. Pass the action as `originatingItem` so the system's own Pierce rule works for weapon strikes; `edhaWrapApplyDamage` fires exactly as it does for a click | `documents/actor.ts:884, 908-915` |
| **Undo** | `applyDamage` already posts a DAMAGE_TAKEN card with `taken {health, damageTaken, damageDeflect, damageIgnore, damageImmune, target, undo: true}`, and the system renders its own Undo Damage / Undo Healing button for it. Item 179's Undo can be the system's — **provided the engine leaves `chatMessage` on**, which most engine applications turn off today (e.g. `33-triggered-effect-resolution.js:287`) | `documents/actor.ts:1008`; `documents/chat-message.ts:612-647` |
| **No double application** | `onClickApplyButton` returns early when `onInteraction` is false, and `onInteraction` is `Hooks.call("cosmere-rpg.chatMessageInteract", message, event)` — a cancellable hook a module can answer to stop a second apply on an attack the engine already resolved | `documents/chat-message.ts:1000-1008, 1158-1165`; `constants/hooks.ts:61` |
| **The plot-die choice before damage** | The damage is already rolled inside `rollAttack` by the time the card appears, so "choose before damage" means **hold the application** until the Opportunity / Complication card is answered. Critically Hit then changes the rolled `DamageRoll` before `applyDamage`. `preAttackRollConfiguration` / `attackRollConfiguration` fire only when the attack dialog opens, so they cannot gate fast-forwarded rolls | `documents/item.ts:1097-1104, 1187-1191, 1195-1216` |
| **The reaction window for PC targets** | No system reaction API at 3.1.0; the engine's own whisper card + GM relay remains the tool. **New and useful:** `cosmere-rpg.combatRoundStart` / `combatRoundEnd`, and the native events `combat-round-start` / `-end` / `-previous`, give a once-per-round reset for Combat Training's free graze or any per-round reaction budget | `documents/combat.ts:20-46`; `hooks/item-event-system/events.ts:179-215` |
| **Dodge stays pre-roll** | `cosmere-rpg.preAttackRoll`, unchanged — the channel Edha's advantage injectors already use, string-enum advantage mode and all | `01-shared-core.js:513-516` |

## Appendix A — release notes 2.1.0 → 3.1.1-pre

Module-facing changes only.

- **3.0.0** (2026-07-30)
  - **Embedded Actions** replace activations on every activatable item → B1–B5, Appendix B.
  - Item resources (`uses`, `charges`, the new `ammo`; a `registerItemResource` API), and resource
    consumption with a choice of *where* to consume from → B4.
  - Weapon Strike automation and the Loaded trait → B5.
  - A **Talents tab** on the character sheet; the Actions tab no longer shows passive talents or other
    non-action entries → F5.
  - Powers can provide talents, and Power prerequisites (no Edha use).
  - The latest conditions → C2, F4 (`depleted`, `diminished`).
  - Migration for existing worlds → Appendix B.1.
  - **New combat event triggers** → Appendix D.
  - Starter Rules converted to Embedded Actions.
  - Fixes: the maximum skill rank 5 → 40 (the sheet still shows 5); damage rolls for skill-test actions
    with configured damage; Recover rolls Healing damage.
- **3.0.1** (2026-07-30)
  - The `Adversary Action` action type rolls Athletics when its skill is "Default"
    (3.1.0 `…/fields/skill-test.ts:74-76`) — relevant to adversary actions built with skill `default`.
  - Expandable effect descriptions; the adversary sheet's add buttons; starter-rules strikes keep
    their modifiers.
- **3.0.2** (2026-08-18)
  - **Roll bonus fields on a weapon's skill and damage** (`strike.skillTestBonus`,
    `strike.damageBonus`) — the home for the flat-model adversary weapon numbers → B5.
  - Fixes: a manually set attribute used the wrong modifier; skill tests ignored effects that modify
    their bonus; damage rolls failed to resolve a "default" attribute or skill. The migration writes
    "default", so 3.0.2 is the real floor.
- **3.1.0** (2026-09-03)
  - Mistborn Starter Rules content (the Allomancy skill `all`, the Misting path, new packs) → C2.
  - Adversary health ranges (`resources.hea.useRange` / `range`).
  - The "pick" dialog auto-selects its first option — this affects `grant-items` pick prompts.
  - Fix: weapon traits such as Pierce now work when applying damage (`originatingItem.isStrikeAction`,
    3.1.0 `documents/actor.ts:908-915`).
  - An automated test framework in the system's repo.
- **3.1.1 pre-release** (2026-09-09): two commits ahead of 3.1.0 — a Mistborn starter-rules test fix and
  a release-notes update; 17 files, nothing module-facing. **Target 3.1.0.** Re-check if 3.1.1 ships
  stable before the live upgrade.

As the 2026-09-15 research pass found, no release 2.1.0 → 3.1.1 adds auto-applied damage, graze
handling, plot-die prompts or reactions. The source agrees: the damage card still applies only on a
click (3.1.0 `documents/chat-message.ts:1000-1048`).

## Appendix B — Embedded Actions in depth

### B.1 What the system's migration does

- **When it runs.** At `ready`, for a GM, when the world's recorded `latestVersion` is older than the
  system (3.1.0 `hooks/welcome.ts:57-99`). It runs `migrate("2.1", "3.1")`, which executes the
  `2.1 → 3.0` step with the system's event system disabled (`utils/migration/index.ts:48-131`, disable
  at `:51`). The new version is recorded **whether or not** the step succeeded (`welcome.ts:93-97`;
  a failure logs and returns, `index.ts:94-111`).
- **World items** (sidebar) **and owned items on world actors** (`2.1-3.0.ts:133-191`):
  - An `action` → `migrateAction` rewrites its system into the 3.x shape (`:323-334`).
  - An `armor`, `equipment`, `power`, `talent`, `trait` or `weapon` (`:33-40`) → `migrateActivatableItem`
    (`:193-252`):
    - `activation.uses` becomes `system.resources.uses` or `.charges` (`:200-216`);
    - a weapon gets `system.strike {die, damageType, skill}` from its damage formula, dice only
      (`:218-229`, `:479-492`);
    - anything else, if it has no actions yet and its activation type is not `none` (`:231`, `:342`),
      gets **one** embedded action:
      - named after the item, with `id` = `system.id` or a slug of the name (`:344-352`);
      - `activation {type, cost, flavor, consumption}`, each old `consume` row gaining a
        `matchDocument` that finds the ancestor Actor (`:358-384`);
      - `uses` → an item-resource consumption on the parent (`:385-409`);
      - `skillTest` for `skill_test` (`:413-424`) and `damage` copied (`:426-437`).
    - **Not copied:** `modality` (F6), `events` (they stay on the parent), `effects`.
  - Every item with `events` → `migrateEventsItem` (`:254-321`): `use` → `use-action` on non-action
    items, and `use-item` handlers → `matchDocument` steps.
- **Compendium items are untouched** unless someone calls
  `cosmereRPG.utils.invokeMigration(from, to, [packIds])` (`utils/migration/index.ts:134-164`), which
  unlocks each pack, migrates it and relocks it. Edha's five packs (`edha-content.edha-leyline`,
  `edha-deity`, `edha-heroic`, `edha-adversaries`, `edha-items`) stay 2.x-shaped, and a rebuild would
  overwrite them anyway.
- **Owned items on actors** — Ben's three PCs and every placed adversary — migrate as world items. It is
  one-way; only a restore undoes it.
- **Edha's hooks during the migration.** The migration creates `action` items under owned talents
  (`2.1-3.0.ts:236-247`). Edha's `preCreateItem` budget veto is type-strict to `talent`
  (`22-talent-budget.js:46-50`) and its `createItem` hook is path-only (`25-sheet-qol.js:256-262`), so
  nothing in Edha vetoes or reacts to it.

### B.2 A `skill_test` talent with a damage formula, on 3.1.0

- **Built by today's pipeline, opened from the compendium.** It loads with no `activation`, no
  `damage` and no actions. The Talents tab lists it; the Actions tab has nothing to click (B1).
- **Owned, after the world migration.** It has one embedded action named after the talent. Clicking
  that action runs `action.use()`:
  1. `preUseItem(action)`, then the consumption dialog, with every row ticked;
  2. `hasSkillTest && hasDamage`, so **`rollAttack()`** (3.1.0 `documents/item.ts:1484-1498`);
  3. `roll({isAttack: true})`, so the d20 context is **`Attack`** (`:1904`);
  4. `rollDamage()`, whose `damageRoll` hooks carry `source` = the action;
  5. **one chat message** carrying the d20 and the damage rolls with Apply buttons (`:1551-1556`);
  6. `useItem(action)`, and the talent's `use-action` rules fire (`events.ts:144-150`).

  So yes — it still rolls through the attack path and posts the damage card. What does not happen is
  Edha's `preUseItem` / `useItem` glue (B2), and any `use` rule the migration did not rewrite (B3).
- **A `skill_test` with no formula** takes `roll()`, context `Item` (`:1527-1548`) — the same split as
  2.1.0, so R-142's attack-context note still holds.
- **A damage-only talent** (`utility` + a formula) takes `rollDamage()` alone (`:1516-1525`).

### B.3 What the overlay and the builder must emit (target 3)

The talent:

- `system` **without** `activation` or `damage`;
- `system.__embedded.items: [actionDoc]` for each non-passive talent (`activation.type !== "none"`);
- `events` kept on the talent, with `use` → `use-action`;
- `modality` kept on the talent **and** copied onto the action (F6).

`actionDoc`, mirroring the system's own compendium JSON (`heroic-paths/agent/spy/talents/subtle-takedown.json`,
`heroic-paths/hunter/assassin/talents/fatal-thrust.json`):

```json
{
  "_id": "<16 chars>", "name": "<talent name>", "type": "action", "img": "<talent img>",
  "system": {
    "id": "<talent slug>", "type": "basic", "description": { "value": "", "chat": "", "short": "" },
    "activation": {
      "type": "skill_test", "cost": { "value": 1, "type": "act" }, "flavor": "",
      "consumption": [ { "type": "resource", "resource": "inv", "value": { "min": 1, "max": 1, "actual": 1 },
        "matchDocument": { "steps": [ { "target": "ancestor", "matchBy": "document-type",
                                        "documentType": "Actor", "matchMode": "first" } ] } } ]
    },
    "skillTest": { "skill": "blue", "attribute": "default", "modifierFormula": null,
                   "plotDie": false, "opportunity": null, "complication": null },
    "damage": { "formula": "(@tier)d8", "grazeOverrideFormula": null, "type": "energy",
                "skill": "default", "attribute": "default" },
    "resources": { "uses": null, "charges": null, "ammo": null },
    "modality": null, "events": {}, "relationships": {}
  },
  "effects": [], "folder": null, "sort": 0, "ownership": { "default": 0 }, "flags": {},
  "_stats": { "systemId": "cosmere-rpg", "systemVersion": "3.1.0" }, "items": []
}
```

The consumption `matchDocument` must be the migration's **ancestor-Actor** step
(`2.1-3.0.ts:370-381`), not the field's default `{target: "parent"}`
(`…/consumption/schema.ts:81-90`). For an action inside a talent inside an actor, the parent is the
*talent*.

The rest of the build:

- **Overlay** (the recommended default): keep the seven keys. The builder translates `activation` +
  `damage` into the embedded action with the same field mapping as `migrateActionData`
  (`2.1-3.0.ts:336-457`), pinned by a fixture test.
- **Adversary `action` items:** the same action shape at the actor level.
- **Weapons:** `strike {die {size, count}, damageType, skill, skillLocked, skillTestBonus, damageBonus}`
  + `attack` + `traits`, and no `activation` / `damage`. A flat-model weapon's to-hit goes in
  `skillTestBonus` and its `+N` in `damageBonus`.
- **Traits:** passive traits need nothing (no adversary trait has a cost today).
- **Every doc:** `_stats.systemVersion: "3.1.0"`.

### B.4 Do `system.events` rules survive?

**Yes.** `EventsItemMixin` is unchanged apart from formatting (3.1.0 `data/item/mixins/events.ts`), the
talent keeps it, and actions gain it (`data/item/action/index.ts:61`). Rule storage, `enabledEvents`
(2.1.0 `documents/item.ts:363` → 3.1.0 `:663`) and `fireEvent` (3.1.0
`hooks/item-event-system/index.ts:327-351`) are unchanged, and `edha-*` handler classes come out of
an identical `constructHandlerClass` (`utils/item/event-system.ts:23`).

What changes is **when** rules fire. `use` rules on a talent go quiet (B3). `edha-*` event types fire
as before, because their hooks and transforms are Edha's own. An Actor-document dispatch now also walks
embedded actions (`index.ts:139`), but those carry no Edha rules. A Combat-document dispatch is new
(`:170-198`).

### B.5 How the use and roll hooks changed

- **Names:** identical at both tags (`constants/hooks.ts`). 3.1.0 adds `combatRoundStart` /
  `combatRoundEnd` (`:19-20`).
- **`preUseItem(item, options)` / `useItem(item, options)`:** `item` is now the **action**, and
  `useItem`'s options add `consumeResponse` (3.1.0 `documents/item.ts:1312`). Returning false from
  `preUseItem` still cancels (`:1280-1292`).
- **Roll hooks `(roll, source, config)`:** unchanged arguments. `source` / `config.data.source` is the
  action (`:1905, 1943`); its `.actor` walks the parent chain (`:159-165`) and its `.root` is the talent
  (`:406-408`).
- **`damageRoll`'s `config.source`** is the item's **name** (`:937`), at both tags.

## Appendix C — touchpoint inventory

Every Edha touchpoint on the system, with its status at 3.1.0: **unchanged**, **renamed**,
**re-shaped** or **removed**. "none" means no break.

| # | Touchpoint | Status at 3.1.0 | 2.1.0 → 3.1.0 evidence | Edha call sites | Break |
|---|---|---|---|---|---|
| 1 | Hooks `cosmere-rpg.preUseItem` / `useItem` | unchanged name; **re-shaped** payload (the action) | `documents/item.ts:907, 1065` → `:1280-1292, 1464-1478` | Appendix B.5; B2's site list | B2 |
| 2 | Roll hooks `pre{Skill,Attack,Item}Roll`, `{skill,attack,item}Roll` | unchanged; `source` is the action, whose `.actor` resolves | `constants/hooks.ts` (3.1.0 `:64-73`); `dice/index.ts` identical; `documents/item.ts:1904-1905` | `01-shared-core.js:515, 775, 819, 820`; `05-edha-watch.js:494`; `08-black-subjugation.js:168-169`; `10-opportunity-spend-menu.js:57`; `11-white-coordination.js:62-63`; `12-contested-roll-resolution.js:52, 333`; `14-white-accord.js:139`; `15-blue-calculation.js:296-297`; `16-heroic-paths.js:179`; `19-red-momentum-frenzy.js:68, 364`; `41-life.js:444`; `42-chaos.js:231`; `43-fate.js:577`; `44-sovereignty.js:236`; `47-power.js:436`; `49-order.js:508, 668`; `52-green-instinct.js:77-78, 111, 188` — all via `edhaD20RollActor` (`01-shared-core.js:485-494`) | none |
| 3 | `cosmere-rpg.preDamageRoll` / `damageRoll` | unchanged; `source` is the action, which carries `damage` | `dice/index.ts:207, 220` at both tags; 3.1.0 `documents/item.ts:1943` | `41-life.js:402`; `53-native-event-system.js:338-354` (`edha-deal-damage`) | none (`41-life.js:413, 415` → F1) |
| 4 | `cosmere-rpg.preApplyDamage` / `applyDamage` | unchanged | 2.1.0 `documents/actor.ts:853, 872` → 3.1.0 `:966, 985` | `28-temporary-hp.js:48`; `19-red-momentum-frenzy.js:398`; `53-native-event-system.js:356-379` | none |
| 5 | `CosmereActor#applyDamage(instances, options)` | unchanged signature; `options.originatingItem` is now the action, whose `.actor` resolves | 2.1.0 `documents/actor.ts:775` → 3.1.0 `:884, 908-915`; `documents/chat-message.ts:1040` | the wrapper `03-where-an-effect-lives.js:1003-1013`; dealer reads `:336, 493-494`; direct calls `07-edha-owner-list.js:662, 733`, `13-white-bulwark.js:134, 251`, `33-triggered-effect-resolution.js:287`, `39-burst-execution-the-gm-socket-relay.js:180`, `45-death.js:118, 177`, `46-civilization.js:293`, `47-power.js:299`, `53-native-event-system.js:171` | none |
| 6 | `CosmereItem#rollDamage` | unchanged signature; **re-shaped** gate (needs `damage` on the item) | 2.1.0 `documents/item.ts:507` → 3.1.0 `:882-885`; the graze clone and `replaceDieResults` unchanged (`:977-996`; `dice/damage-roll.ts` identical) | the wrapper `03-where-an-effect-lives.js:217-289`; graze guard `:300-314` | none (B1 aside) |
| 7 | `CosmereItem#rollAttack` | **re-shaped** (action-only; reads `skillTest`) | 2.1.0 `:641-644` → 3.1.0 `:1017-1021, 1040-1066` | no direct call | B1, B4 |
| 8 | `CosmereItem#roll` | **re-shaped** (action-only; reads `skillTest`) | 2.1.0 `:424-427` → 3.1.0 `:793-796` | no direct call | B1, B4 |
| 9 | `CosmereItem#use` | **re-shaped** (action-only) | 2.1.0 `:875-878` → 3.1.0 `:1250-1253` | `34-single-target-gate-defeat-tracking.js:52` | B2, F3 |
| 10 | `CosmereItem#showConsumeDialog` | **removed** (`ItemConsumeDialog.show`) | 2.1.0 `:1178` → 3.1.0 `:1303` | `21-resource-consume-dialog.js:70-90` | C1 |
| 11 | `CosmereItem#hasActivation()` | **removed** (`isAction()`, `isActivatable`, `hasUsableActions`) | 2.1.0 `:223` → 3.1.0 `:250, 425-453` | no call | none |
| 12 | `getApplyTargets` | unchanged | 2.1.0 `utils/generic.ts:246` → 3.1.0 `:247` | none today (R-143) | none |
| 13 | `D20Roll`, `DamageRoll`, `PlotDie` | unchanged (files identical) | `dice/d20-roll.ts`, `dice/damage-roll.ts`, `dice/plot-die.ts` | `03-where-an-effect-lives.js:301-314` (`CONFIG.Dice.rolls`); `11-white-coordination.js:26-27` (plot-die inject) | none |
| 14 | `roll.opportunitiesCount` / `complicationsCount` | unchanged | `dice/d20-roll.ts` identical | `10-opportunity-spend-menu.js:27`; `12-contested-roll-resolution.js:285` | none |
| 15 | `registerItemEventType` / `registerItemEventHandlerType` | unchanged; event types gain an optional `host` (default `Source`) | 3.1.0 `api/item.ts:526-594, 596`; `constructHandlerClass` identical (`utils/item/event-system.ts:23`) | `53-native-event-system.js:296-305` | none |
| 16 | Rule dispatch (`enabledEvents`, `fireEvent`) | unchanged semantics; an Actor dispatch walks `allItems` | 2.1.0 `documents/item.ts:363` → 3.1.0 `:663`; `hooks/item-event-system/index.ts:139, 327-351` | `03-where-an-effect-lives.js:135-138` | none |
| 17 | The native `use` event | **re-shaped** (action-only; `use-action` added) | 2.1.0 `events.ts:58-62` → 3.1.0 `:139-150` | 189 authored rules; `05-edha-watch.js:614`; `44-sovereignty.js:302` | B3 |
| 18 | The native `use-item` handler | **re-shaped** (`target`, `uuid`, `matchMode`, `matchAll` → `matchDocument`; uses `defaultAction`) | 3.1.0 `handlers/use-item.ts:15-55, 71-82` | 0 authored uses (`data/authored/*.json`, `data/adversaries.json`) | none |
| 19 | Other native types Edha authors: `update-actor` (1 rule), `long-rest-actor` (1 rule) | unchanged | Appendix D | `data/authored/*.json` | none |
| 20 | `CONFIG.COSMERE` keys read: `statuses`, `skills`, `attributes`, `attributeGroups`, `advancement.rules`, `paths.types`, `currencies`, `cultures`, `creatureTypes` | unchanged (all present) | 3.1.0 `config.ts`: creatureTypes 76, statuses 106, attributeGroups 291, attributes 312, skills 379, advancement 498, paths 681, currencies 944, cultures 1174 | `01-shared-core.js:151-159, 227-238, 258-290, 335-385`; `03-where-an-effect-lives.js:154`; `12-contested-roll-resolution.js:155-162, 359, 467`; `23-sheet-path-slots-the-budget-readout.js:79`; `24-the-character-creation-wizard.js:381, 477, 734, 813-861`; `29-summons.js:91`; `40-destruction.js:57, 134`; `41-life.js:352` | none (the new ids → C2, F4) |
| 21 | API: `registerPathType`, `registerCulture`, `registerCurrency` | unchanged; `registerCurrency` moved from `api/general.ts` to `api/currency.ts` with an identical body, still re-exported | 3.1.0 `api/index.ts:17` | `01-shared-core.js:151, 286, 385` | none |
| 22 | Actor fields: `resources.<id>.{value, max, bonus}`, `skills`, `attributes`, `defenses`, `deflect`, `senses`, `movement` | unchanged (health adds `useRange` / `range`; skill rank max 5 → 40); `DerivedValueField` leaves unchanged | 3.1.0 `data/actor/common.ts` diff (no `senses`, `movement`, `deflect` or `defenses` hunks); Appendix D | everywhere, via `edhaDerivedNum` | none |
| 23 | Sheet render hooks and the DOM Edha injects into | unchanged classes (`CharacterSheet`, `AdversarySheet`, `ItemConsumeDialog`); every selector still present in the 3.1.0 templates | 3.1.0 `applications/actor/character-sheet.ts:17`, `adversary-sheet.ts:18`, `applications/item/dialogs/item-consume.ts:23` | `21-resource-consume-dialog.js:40-55`; `23-sheet-path-slots-the-budget-readout.js:36-45`; `24-the-character-creation-wizard.js:1018-1052`; `25-sheet-qol.js:23-234`; `27-adversary-pack-sync.js:292-344`; `35-targeting-attunement-range-aoe-templates.js:131-150` | none (row lookups → F5) |
| 24 | `renderChatMessageHTML` card buttons | unchanged (a Foundry core hook) | — | `54-edha-card-buttons.js:142, 155` | none |
| 25 | Combat documents | unchanged; round hooks added | 3.1.0 `documents/combat.ts:20-46` | `19-red-momentum-frenzy.js:18`; `52-green-instinct.js:350-507` | none |
| 26 | The pack document shape written by `scripts/foundry-build.js`; tests pinned to the 2.x shape | **re-shaped** | Appendix B.3 | `scripts/foundry-build.js` (B1, B4, B5, F6, C4). `scripts/foundry-build-parts.js` writes numbers only (no `activation`, `damage` or `events` keys). Tests touching `activation` or the consume dialog: `ambush-first-strike`, `cleanse-decision`, `consume-dialog-wrapper`, `consume-guard`, `consume-shortfall`, `dead-field`, `deploy-cycle`, `hook-single-target-gate`, `offer-decline-refund`, `omen-branch-dial`, `on-hit-dealer`, `refund-race`, `relay-readback-race`, `resource-writes`, `spend-tag`, `sync-item-types`, and `harness.js` | B1, B4, B5, F6, F9 |
| 27 | `data/native-vocabulary.json` and `scripts/dump-native-vocabulary.js` | the snapshot goes stale; the extraction runs unchanged at 3.1.0 with 0 rot alarms | Appendix D | — | C6 (the tool: none) |
| 28 | The world migration vs Edha's item hooks | no interaction | Appendix B.1 | `22-talent-budget.js:46-50`; `25-sheet-qol.js:256-262` | none |
| 29 | Foundry core compatibility | unchanged (13.346 / 13.351) | both `system.json` files | — | none |

## Appendix D — the 3.1.0 native vocabulary

**Method.**

- A scratch copy of `scripts/dump-native-vocabulary.js` ran with its extraction logic verbatim; only
  its output path was redirected to `%TEMP%`, and its rot alarms were made soft so one run reports
  every alarm.
- **Control:** run against Ben's installed 2.1.0, read only. It reproduced the tracked
  `data/native-vocabulary.json` with **0 differences** in every section — events, handlers,
  `schemaFields`, target choices, the field union, derived leaves, content ids.
- **3.1.0:** run against the unpacked zip through `EDHA_FOUNDRY_DATA`, with **0 rot alarms**
  (schema sites harvested 74 → 82).
- **The tracked snapshot is unchanged.** It regenerates at the flip (PR 6), not before.

**The diff, 2.1.0 → 3.1.0.**

| Section | Change |
|---|---|
| events | **17 → 27.** Added: `add-child-action` ("Action Added"), `add-to-item` ("Added to Item"), `combat-encounter-end` ("Combat Ended"), `combat-encounter-start` ("Combat Started"), `combat-round-end` ("Combat Round Ended"), `combat-round-previous` ("Combat Round Previous"), `combat-round-start` ("Combat Round Started"), `remove-child-action` ("Action Removed"), `remove-from-item` ("Removed from Item"), `use-action` ("Action Used"). **Removed: none** — `use` stays, but fires for actions only |
| handlers | **12 → 14.** Added: `add-actions` {`allowDuplicates`, `matchDocument`, `notify`, `uuids`}, `remove-actions` {`matchDocument`, `notify`, `uuids`} |
| `use-item` schemaFields | − `matchAll`, `matchMode`, `target`, `uuid`; + `matchDocument` (labelKeys − `Target`) |
| handlerTargetChoices | + `equipped-item`, `equipped-equipment` |
| updateActorTargetChoices | unchanged (`parent`, `global`) |
| systemSchemaTopLevelFields | **87 → 103.** Added: `advantageMode`, `allowDuplicates`, `alwaysEquippable`, `consumption`, `cost`, `equippableEnabled`, `fastForward`, `flavor`, `matchDocument`, `notify`, `plotDie`, `skillTest`, `strike`, `temporaryDamageModifiers`, `temporaryModifiers`, `uuids`. **Removed: none** — the reason pass 11 cannot see B1 (F8) |
| systemDerivedValueLeaves | unchanged (12) |
| contentVocabulary.skills | + `all` (Allomancy — a real system skill, not an over-harvest: bundle `Skill["Allomancy"] = "all"`) |
| contentVocabulary.statuses | + `depleted`, `diminished` (F4) |
| attributes, attributeGroups, damageTypes, resources | unchanged |
