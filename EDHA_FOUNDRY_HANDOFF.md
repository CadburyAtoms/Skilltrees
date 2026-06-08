# Edha → Foundry VTT Port — Agent / Operator Handoff

Self-contained cold-start doc. Read top to bottom. **§1–§6 = how it works + how YOU operate it solo. §7 = the native Event/Effect system (DONE — pilot verified live + bulk data migration of all 21 trees). §8 = current content state. §9 = open to-dos. §10 = gotchas.**

Backing detail (every session's notes) lives in agent memory `edha-foundry-module-build.md`; this doc is the curated summary. Last full update: 2026-06-08 (Event-System refactor: pilot Red Conflagration + Destruction verified live in Foundry; bulk data migration of all 21 trees built + validated).

---

## 1. What this is

Port the **Edha** homebrew talent/skilltree system (Cosmere RPG homebrew) into **Foundry VTT** as a content module **`edha-content`**, built on the community **cosmere-rpg** system. Three talent atlases (leyline / deity / heroic) + a playtest-adversary pack, plus runtime automation (rolls, triggers, Temp HP, summons, targeting, Draw Mana, Investiture derivation).

As of 2026-06-08 talent behaviors are hosted **natively** on each talent — `system.events` rules + `effects` ActiveEffects — so they are visible and editable on the talent's Events/Effects tabs (see §7), not only in the parallel runtime.

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`. User data at `C:\Users\benhe\AppData\Local\FoundryVTT\`.
- **System:** `cosmere-rpg` v2.0.4 at `…\FoundryVTT\Data\systems\cosmere-rpg\index.js` (minified ~28.7k lines; grep it for facts — hooks/handlers use templated strings, so grep the SUFFIX e.g. `damageRoll`, `registerItemEventHandlerType`). Unminified core Foundry API lives in `C:\Program Files\Foundry Virtual Tabletop\resources\app\{client,common}\**\*.mjs` (grep here for Region/ActiveEffect/document APIs).
- **Public icons:** `C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons` — **verify icon existence with a WINDOWS path** (`C:/Program Files/...`); an MSYS `/c/...` path makes node `fs.existsSync` return false for everything. A 404 icon = invisible/unselectable tree node.
- **Our module:** `…\FoundryVTT\Data\modules\edha-content\` — `module.json` (now declares the `RegionBehavior.hazard` documentType), `scripts/register-skills.js` (the runtime; hand-edited here), `styles/edha.css`, `lang/en.json`, `data/*.json` (runtime tables, copied at build), `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries}` (LevelDB).
- **Source (canonical):** `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\` — `data/leyline.json` (125), `data/domain.json` (90 deity), `data/cosmere.json` (375; only 6 heroic paths ×25 = 150 in scope), `data/adversaries.json` (9), + the behaviour tables (see §5). `scripts/foundry-build.js` (generator) + `scripts/talent-icons.js`.
- **Validators:** `C:\tmp\validate2.js` (talent packs), `C:\tmp\validate_adv.js` (adversaries). `C:\tmp\inspect-edha.js` = ad-hoc read of a pack's emitted events/effects (Foundry must be closed; LevelDB lock).

## 3. Build / validate / when to rebuild vs F5

- **Build:** `cd "…/Skilltrees/scripts" && node foundry-build.js [leyline|deity|heroic|adversaries|all]` (default all). **NOTE: single scope arg only** (`leyline deity` runs leyline ONLY; run twice or use `all`). Deterministic 16-char ids (`fid`). Rewrites the LevelDB packs, writes tree-background SVGs, bakes per-talent `system.events` + `effects`, and **copies the runtime tables into `modules/edha-content/data/`**.
- **Validate:** `node C:\tmp\validate2.js` (expect `VALIDATION PASSED ✓`, 0 issues).
- **FOUNDRY MUST BE CLOSED to rebuild** (LevelDB lock). Check: PowerShell `Get-Process | ? {$_.ProcessName -match 'foundry|electron'}`. From inside a running world, `game.shutDown()` returns to Setup and **releases the pack locks** (no full quit needed) — but re-launching the world hits the GM join-password gate.
- **Rebuild needed** for anything baked into the packs: talent text/roll-data (DETAILS), **native `system.events` rules + `effects` ActiveEffects**, tree layout, icons, path events/grants, adversary stat blocks, the Draw Mana item.
- **F5 (reload) re-runs init/setup/ready** → reloads `register-skills.js` (the registered event/handler types, the `edha-content.hazard` Region behavior, all runtime helpers + JSON-table fallback). `module.json` changes (e.g. documentTypes) need a full world relaunch, not just F5.
- **Embedded-talent SNAPSHOT gotcha:** talents already on an actor are frozen copies. After a pack rebuild, re-sync owned talents: budget-bar **⟳ Sync Talents** button or `edha.syncNow()`. Sync now also carries `system.events` + `effects`.

## 4. The `edha.*` console/macro API (operate it solo)

Exposed at `game.modules.get("edha-content").api` and global `edha`:
- `edha.syncNow(actor?)` / `syncAllCharacters()` — re-pull roll data + native events/effects onto owned talents after a rebuild.
- `edha.grantDrawMana(actor?)` — add Draw Mana to a character who added their leyline path before Draw Mana existed (or just re-add the leyline path).
- `edha.resetTriggers(actor?)` — clear once-per-round trigger locks (testing).
- `edha.fixSettings()` — force `applyButtonsTo` → Prioritise Targeted.
- `edha.showRange(item|name)` — draw the Attunement-Range ring.
- `edha.aoe(item)` / `edha.summon(actor,name)` / `edha.setTempHp(actor,n,src)` / `edha.getTempHp(actor)`.

## 5. Behaviour tables (now generator INPUTS; in `Skilltrees/data/`, copied to module at build)

These tables are now **generator INPUTS**: `foundry-build.js` emits each entry as a native `system.events` rule (or an `effects` ActiveEffect) on its talent. They are STILL copied to the module and fetched at `ready` as a **legacy fallback** that only fires for talents NOT yet carrying native rules (the coexistence guard, see §7).

- `talent-rolls.json` — per-talent Skill Test + Damage (→ baked into `system.activation`/`system.damage`, the DETAILS tab; native + editable). 90 rollable.
- `talent-riders.json` — passive damage riders (Kindle, Mighty) → `edha-damage-rider` rule; applied by the `rollDamage` wrapper, which READS the native rule.
- `talent-thp.json` — Temp HP grants → `edha-temp-hp` rule on `use`.
- `talent-summons.json` — summon stat blocks → `edha-summon` rule on `use`.
- `talent-triggers.json` — triggered effects → `edha-triggered-effect` rule on `edha-deal-damage` / `edha-on-defeat` (take-damage stays legacy for now).
- `talent-targeting.json` — AoE template entries → `edha-aoe-template` rule on `use`. Range preview needs NO data (color derived at runtime).
- `talent-hazards.json` **(new)** — dangerous terrain (Set Charge, Pyre, Fault Line) → `edha-place-hazard` rule on `use` → drops a scene-scoped Region with the `edha-content.hazard` behaviour.
- `talent-effects.json` **(new)** — passive numeric buffs (Walking Ruin +Speed) → native ActiveEffects (key e.g. `system.movement.walk.rate.bonus`, mode ADD). NOTE: baked compendium effects are currently stripped on load — see §7 known issue.
- Draw Mana riders + Investiture formula are **hardcoded** in register-skills.js (small, fixed canon).

## 6. Settings the user must have

- **`applyButtonsTo` = 4 (Prioritise Targeted).** REQUIRED for the auto-target AoE model — at the default 0 (SelectedOnly) the chat Apply buttons ignore targets and only hit the selected token. The module force-sets it on load (GM); also Configure Settings → cosmere-rpg → "Apply damage/healing to" → Prioritise Targeted, or `edha.fixSettings()`. When clicking Apply, don't re-target between casting and applying.

---

## 7. ✅ THE NATIVE EVENT/EFFECT SYSTEM (built + verified live, 2026-06-08)

The refactor in the previous §7 is DONE. Talent behaviors now run through the cosmere-rpg event engine, hosted on each talent (`system.events`) and shown/edited on the **Events** tab; passive buffs are native ActiveEffects on the **Effects** tab; the roll stays on **DETAILS**. The generator emits these from the §5 tables.

### Registered in `register-skills.js` at `setup` (`edhaRegisterNativeEventSystem()`)
- **Custom EVENT types** (`cosmereRPG.api.registerItemEventType`):
  - `edha-deal-damage` — hook `cosmere-rpg.damageRoll`; `transform:(roll,src)=>({document: src?.actor ?? src, options:{roll, sourceItem:src}})`. Returning the **actor** fans the rule out across ALL the owner's items, so e.g. Arc Flash's rule fires when Searing Bolt rolls. (Arc Flash, Afterburn.)
  - `edha-on-defeat` — hook `cosmere-rpg.applyDamage`; `condition`: victim HP ≤ 0; `transform` resolves the presumed **killer** (controlled token / current combatant / `user.character`) → `{document: killer, options:{victim}}`. (Chain Detonation.)
  - `edha-pre-deal-damage` — sentinel hook (never fired); a visible marker rule for damage riders, which are actually applied by the `rollDamage` wrapper reading the native `edha-damage-rider` rule (pre-eval roll mutation is fragile, so we kept the wrapper).
- **Custom HANDLER types** (`registerItemEventHandlerType`): `edha-triggered-effect` (kind=damage|damage-aoe|heal|thp|affliction, formula, damageType, target, radius, resourceGain, cost, oncePerRound), `edha-damage-rider` (appliesTo, bonusFormula), `edha-aoe-template` (sizeByRank/sizeFt, affects, color), `edha-place-hazard` (sizeByRank/sizeFt, damageFormula, damageType, color), `edha-temp-hp` (formula, target), `edha-summon` (statblock fields). Executors REUSE the existing helpers (edhaFireTrigger/edhaRunTriggerEffect/edhaPlaceAoe/edhaWriteTempHp/edhaSummon/edhaPlaceHazard).
- **Region behaviour** `edha-content.hazard` (`foundry.data.regionBehaviors.RegionBehaviorType`), declared in `module.json` `documentTypes.RegionBehavior.hazard` and registered into `CONFIG.RegionBehavior.dataModels`/`typeLabels`. Subscribes to `tokenEnter` + `tokenTurnStart` and auto-applies its baked damage to the entering token's actor (GM-side). This is the "dangerous terrain" ongoing effect.

### Key findings (verified in the core/system source — don't re-derive)
- **Handler config UI auto-renders — NO `.hbs` needed.** `configRenderer` is null when no `render`/`template` is given (index.js ~L12507); the rule editor then runs `{{#if shouldAutoPopulateConfigFields}}{{formGroup}}` per schema field (`templates/item/dialog/edit-event-rule.hbs`). So a handler just needs `config.schema` (labelled DataFields) + `executor`.
- **Registration MUST be at `setup`.** The system wires `Hooks.on(hook,…)` for each event type once, at its own `ready` (index.js ~L11975), reading `CONFIG.COSMERE.items.events.types`. Register custom types BEFORE that or their hooks never subscribe.
- **Dispatch fan-out** (index.js ~L11987): the fired hook's `transform` returns a `document`; if it's an **Actor**, the engine evaluates event rules on EVERY item the actor owns; if an Item, just that item. `host` defaults to `"source"` (runs on the triggering client); `"gm"`/`"owner"` also exist.
- **Roll source:** `damageRoll()`/`preDamageRoll` fire `(roll, config.data.source, config)` and `config.data.source` is the rolling **Item** (index.js ~L7484).
- **Talents support events:** `TalentItemDataModel` mixes in `EventsItemMixin()` (index.js ~L26970); `action`/`trait` items too. Rule shape mirrors the proven `pathEvents()` in foundry-build.js: `{ id, description, event, handler:{ type, …flatConfigFields } }`.

### Coexistence (during transition)
Legacy global hooks in register-skills.js are KEPT but guarded by `edhaIsMigrated(item)` (true once a talent carries any `edha-*` rule) — they skip migrated talents, so a behaviour fires exactly once. This is a safety net for owned snapshot talents not yet re-synced. Delete the legacy dispatchers (keeping the shared helpers) once every character is synced (§9).

### Verified live (Foundry v13.351, 2026-06-08)
- All registrations present (3 event types, 6 handler types, `edha-content.hazard`).
- **Arc Flash** Events tab renders its rule + the edit dialog **auto-renders the full editable form** (no template). **Set Charge** loads `use=>edha-place-hazard`. **Mending Aura** (non-pilot White) loads `use=>edha-aoe-template` → bulk migration confirmed across trees.
- All 21 trees rebuilt (`node foundry-build.js all`; events:23, effects:1) + `VALIDATION PASSED ✓`.

### KNOWN ISSUE — ActiveEffects stripped on compendium load
Walking Ruin's +Speed ActiveEffect is dropped on compendium load (`item._source.effects` = []), even though the effect data is valid (clones/constructs fine in memory; the bad-`_stats` theory was wrong — removing `_stats` did not fix it). Root cause is compendium-load-specific (likely a cosmere/Foundry pack-load pass). **Fix (deferred):** stop baking effects into the compendium item; instead create the ActiveEffect on the OWNED talent at add-to-actor / Sync time via `createEmbeddedDocuments` (the runtime path works), sourcing from `talent-effects.json`. Until then, passive buffs like +Speed are tracked manually.

---

## 8. Current content state

- **4 packs built & validated (0 issues):** edha-leyline (125t/5tree/5path + Draw Mana action), edha-deity (90/10/10), edha-heroic (150/6/6), edha-adversaries (9 actors/30 items). 325 edges.
- **Native Event/Effect migration LIVE (2026-06-08):** all 21 trees rebuilt with per-talent `system.events` (events:23 across leyline/deity/heroic) + `effects` (effects:1). Pilot Red Conflagration + Destruction (incl. dangerous-terrain Region) verified live; the AE on compendium is the one open issue (§7).
- **Roll data: 90 rollable.** Deity convention: color-keyed `[Tier][Die] = (@tier)d(2*@skills.<color>.rank+2)`, Option-B `+ @attr.<id>` preserved; heals = `heal` type. Skill ids: …/`lea` (Leadership)/`prc` (Perception)/… (NOT lead/per).
- **Triggers** (talent-triggers.json → native edha-triggered-effect): Arc Flash, Afterburn, Chain Detonation, Necrotic Cascade, Predator's Due. Optional-cost prompts use a **chat-card button** (not a dialog). Once-per-round (combat) via `flags.edha-content.trigRound`.
- **Temp HP, Summons, Targeting (range ring + AoE), Dangerous Terrain (Region), Draw Mana** (one universal `action`, granted via every leyline path), **Investiture derivation = `2 + max(AWA, PRE)`** (canon; character actors), **defeated-skull overlay tied to HP**, **always-on adversary health bars**.
- **Chaos resource renamed Fracture → Omen** (domain.json; flavor line kept; "Spreading Fracture"→"Spreading Omen").

## 9. Open to-dos

- **Fix the ActiveEffect-on-compendium strip (§7):** apply passive ActiveEffects (Walking Ruin +Speed, future +Deflect/defenses/die-size) at add-to-actor / `⟳ Sync` time via `createEmbeddedDocuments`, sourced from `talent-effects.json`, instead of baking them into the compendium item. Then re-verify on a character.
- **Re-sync existing characters** (`⟳ Sync Talents` / `edha.syncAllCharacters()`) so owned snapshot talents pick up the native events/effects.
- **Delete the guarded legacy hooks** once all characters are synced — remove the `useItem` THP/summon/AoE/DrawMana dispatchers, the `applyDamage` kill/take-damage dispatcher, the deal-damage dispatch in the rollDamage wrapper, and the table loaders — but KEEP the shared helpers the native executors reuse.
- **Broaden behaviour coverage:** author the remaining `talent-*.json` entries for talents that still have no rule (the tables are pass-1 scope); the generator already emits any entry on any tree.
- **#16 AoE/terrain interactive placement:** drag-to-place (Foundry MeasuredTemplate/Region preview workflow) for `edha-aoe-template` / `edha-place-hazard`, instead of auto-centering on the target. Set Charge place→declare→detonate flow and Pyre on-hit timing are currently approximated as place-on-use.
- **Phase-3 trigger v2:** hit-multiple (Flashpoint), conditional-vs-state (Severance, Crown of Thorns), Insight on-kill transfer (Knowledge), conditional-THP riders.
- **Stays manual:** movement/positioning/ally-count triggers (Momentum's Edge, Coordinated Hunt), narrative-violation triggers (Edict/Snare/Bastion), adversary bucket-C (Glyph Pulse, Stitchmother Phase 2), Fault Line ray template.
- **PC pregens (4) + scene maps** — confirm scope for a table-ready playtest.

## 10. Gotchas

- Custom skills must be `core:true` or they hide behind Powers.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`), or their hooks never subscribe.
- **Handler config forms AUTO-RENDER from the schema** — no `.hbs` template needed (only for fancy widgets).
- **ActiveEffects baked into compendium talent items are STRIPPED on load** (cosmere/v13) — apply them at add/Sync time instead (§7).
- **Dangerous-terrain Region creation is GM-side** — a player using a hazard talent gets a "GM-side" warning (same as summons).
- Verify every icon path exists (Windows path) — 404 = invisible node.
- Rebuild only with Foundry closed (or `game.shutDown()` to Setup); relaunch to load packs + `module.json` changes; F5 for runtime JS/JSON.
- The `connections` array (not prose prereqs) drives drawn tree edges — and is SEPARATE from a talent's Name/prereqs, so renaming a talent requires rewriting every other talent's `connections` entry that points to it.
- Embedded talents are snapshots → ⟳ Sync after a rebuild (Sync now carries events/effects).
- `applyButtonsTo` must be a targeting mode (4) for AoE Apply to hit all targets.
- For any player-decision prompt that needs canvas targeting, use a CHAT-CARD BUTTON, not a dialog (modal blocks the canvas; non-modal can hide behind sheets).
- Hand-authored `[[damage N Type]]` enrichers need a capitalized DamageType key (Energy/Impact/Keen/Spirit/Vital/Healing).
- `@attr.<id>` (wil/pre/int/str/awa/spd) is the attribute shorthand in roll formulas (value only), NOT `@attributes.x.value`.
