# Edha → Foundry VTT Port — Agent / Operator Handoff

Self-contained cold-start doc. Read top to bottom. **§1–§6 = how it works + how YOU operate it solo. §7 = the native Event/Effect system (DONE — 2026-06-09: ALL behavior lives ON the talents; runtime is a thin generic engine; both historic blockers solved + live-verified). §8 = current content state. §9 = open to-dos. §10 = gotchas.**

Backing detail (every session's notes) lives in agent memory `edha-foundry-module-build.md` + `edha-aoe-bursts.md`; this doc is the curated summary. Last update: **2026-06-13** (Weakened reworked → ends at the end of the creature's next turn; generic timed-status expiry engine — see its delta). Prior: 2026-06-12 (pack-path schism fixed + workflow hardening), 2026-06-11c (Weakened mechanic — NOW SUPERSEDED), 2026-06-11b (V3 ENGINE PASS — state mechanics, custom statuses, derivations, adversary-effects bake; built + pack-validated, **NOT yet live-verified** — see the 06-11b delta block below), 2026-06-11 (playtest-PC manual-talent triage pass-1 + `TRIAGE_PLAYTEST_PC_MANUALS.md`), 2026-06-10b (playtest-1 prep — §8b), 2026-06-09 (RE-REFACTOR: behavior re-homed onto talents; both historic blockers fixed), 2026-06-08b (Demolisher playtest), 2026-06-08 (Event-System refactor).

**NEXT SESSION: live-verify the v3 pass (checklist in the 06-11b delta below — relaunch, ⟳ Sync, `edha.migrateDerivations()`, per-PC spot checks) AND the 06-13 Weakened rework (F5; in combat → disadvantage on every str/spd test → auto-clears at the end of the creature's next turn), then begin the tree-by-tree review (per-talent events/ongoing effects; author via the authored overlay or in Foundry — NOT the side-file tables, see the 06-12 delta).**

---

## 2026-06-13 DELTA — WEAKENED REWORKED TO A FIXED DURATION + GENERIC TIMED-STATUS EXPIRY (engine-only; F5 to load; NOT yet live-verified)

**Ruling (Ben): Weakened no longer self-consumes on the first physical test — it gives DISADVANTAGE on EVERY physical (str/spd) test while it lasts and ALWAYS falls off at the END of the affected creature's next turn.** The 06-11c consume-on-first-test model was too weak: it could vanish before the Black tree's Weakened payoffs (Spoils of Isolation / Sovereign of Solitude / Predatory Patience) got their turn.

- **Engine (`register-skills.js`, runtime-JS only — F5, packs untouched):** removed `edhaWeakenedPostRoll` + its `cosmere-rpg.{skill|attack|item}Roll` hook (the consume). Kept the pre-roll disadvantage hook — it now fires on every str/spd test, since the status persists.
- **New generic timed-status expiry pass:** an effect carrying `flags.edha-content.expireAfter = {round, turn}` is removed once the combat pointer advances PAST that coordinate (i.e. at the END of that turn), with a chat note. Runs on `combatStart` / `combatTurnChange` + a `ready` restore, GM-gated to one GM (same pattern as the def-buff refresh). **This is the turn-based expiry engine §9 said didn't exist — now it does, scoped to Weakened.** Reusable: any future timed effect (e.g. Pyre/hazard durations) can set the same `expireAfter` flag.
- **Stamping (`createActiveEffect`, GM-side):** Weakened stamps its NEXT-turn coordinate on apply — applied *before* the creature acts this round (turn index > current turn) → end of its turn THIS round; applied on/after its turn (incl. its own turn) → end of its turn NEXT round. Any apply path is covered (Sapping Hex, Black Draw Mana, manual toggle, `edha.toggleStatus`). Out of combat it isn't stamped on apply; the pass lazily stamps it once combat is running, then it expires normally.
- **LIVE-VERIFY (F5, no rebuild):** in combat, apply Weakened → confirm disadvantage on multiple str/spd tests (not just the first) and NO disadvantage on a Lore test → confirm it auto-clears at the END of the creature's next turn (chat note) → confirm Spoils of Isolation / Sovereign of Solitude / Predatory Patience still see it Weakened on the Outlaw's turn.
- **PENDING (do at the Black rebuild):** Sapping Hex's authored rule note still reads *"(REMOVE MANUALLY - no duration engine)"* in `data/authored/leyline-black.json` — now false. Update it and rebuild `leyline` (or just batch it into the Black tree-by-tree pass) so the in-Foundry rule text matches.

---

## 2026-06-12 DELTA — PACK-PATH SCHISM FIXED + WORKFLOW HARDENING (disk-verified; in-Foundry verify = the standing 06-11b checklist)

**The 06-11b `packs/v3/` split had silently broken the whole round-trip** and poisoned a commit; all repaired this session:

- **What was broken:** module.json pointed Foundry at `packs/v3/` but extract/build/guard/validators all still targeted `packs/` → the guard protected nothing, builds wrote where Foundry never looked, "validation passed" validated dead packs, and the 06-12 full extract (commit 8456a97) captured **stale pre-v3 content** into `data/authored/` (zero v3 rules — the "25 un-extracted edits" it reported were the v3 diffs seen backwards). Because the authored overlay wins over generator + side-files, the next rebuild would have stripped the v3 automation from ~25 talents.
- **Fix:** consolidated to **`packs/` as the one true path** (copied v3 content over the stale dirs, reverted module.json; `packs/v3/` is dead — delete on sight). Re-extracted all 365 talents from the real packs (v3 rules confirmed present in `data/authored/`), rebuilt all 4 packs (counts match v3: events:36, effects:14, rollable:89, overlays:365), validators passed, and v3 rules spot-checked in the WRITTEN packs (Life Surge overflow-thp, Vital Diagnosis apply-status, Severance convert, Spoils sweep).
- **Effect projection extended (`edha-pack-io.js`):** ActiveEffect **`duration` / `statuses` / `type` now round-trip** (normalized so Foundry-stamped defaults fingerprint identically to absent fields). Timed/ongoing effects and condition icons survive extract — required for the tree-by-tree effects work.
- **Tools moved into the repo** (`scripts/`): `validate-packs.js` (replaces `C:\tmp\validate2.js`; now also counts events/effects and reads via temp-copy = safe with Foundry open), `validate-adversaries.js` (also checks baked effect keys), `inspect-pack.js` (CLI: `node inspect-pack.js edha-deity "Life Surge"` or `--group Red` — prints a talent's rules/effects as Foundry loads them). `run-playtest-build.bat` updated. The `C:\tmp` copies are obsolete.
- **Module runtime is now in git:** `module-src/` mirrors `register-skills.js` + `module.json` + `styles/edha.css` + `lang/en.json` via **`node scripts/module-src-sync.js [pull|push]`**. AppData has no other backup — **run a pull + commit after every engine edit.**
- **AUTHORING RULE (supersedes §9's "author side-file entries"):** all 21 trees are authored overlays now, and overlays MASK side-file entries for existing talents. Author per-talent behavior **in Foundry → extract**, or **hand-edit `data/authored/<atlas>-<tree>.json` → build**. Side-files = bootstrap history; new mechanic PATTERNS = new handler types in register-skills.js.

**NOTE: the installed system is cosmere-rpg v2.1.0** (older text below may say 2.0.4 — the system updated; v2.1.0's native event dispatch is verified working).

---

## 2026-06-11c DELTA — WEAKENED MECHANIC (⚠ SUPERSEDED 2026-06-13: the consume-on-next-physical-test model below was replaced by a fixed end-of-next-turn duration — see the 06-13 delta. Historical record; the pre-roll disadvantage details still apply.)

**Ruling (Ben): Weakened = disadvantage on the creature's next physical test (str/spd attribute), then the condition ends.** Implemented in `register-skills.js` (block right after the status registration, ~L105): hooks `cosmere-rpg.pre{Skill|Attack|Item}Roll` + post equivalents (the system's d20Roll pipeline, index.js ~L5266).
- **Pre-roll:** if the rolling actor has `weakened` and the test attribute is str/spd → `roll.options.advantageMode = "disadvantage"` + `configureModifiers()` (fast-forward path), AND the instance's `configureDialog` is wrapped to seed `data.skillTest.advantageMode = "disadvantage"` (the dialog otherwise re-derives from None and OVERWRITES options — ~L3577/3903). Dialog opens with disadvantage pre-selected; GM can toggle it off (override).
- **Post-roll:** removes Weakened via `edhaToggleStatus` (GM socket relay if the roller doesn't own the actor) + chat note. Dialog-cancel returns before the post hook → no consumption on a cancelled roll.
- Actor resolution: item/attack rolls via `config.data.source.actor`; plain skill tests via `messageData.speaker` (`edhaD20RollActor`).
- **Runtime JS only — F5 suffices** (no rebuild/relaunch; packs untouched). ⚠ Stale-mount gotcha hit again: mounted copy of register-skills.js truncates to the old byte length — full-file `node --check` through the mount is meaningless; the new block was syntax-checked standalone (OK).
- **Live-verify:** apply Weakened to a token → roll Athletics (or any str/spd test) → dialog shows disadvantage (2d20kl) → after the roll the icon clears + chat note. A cognitive/spiritual test (e.g. Lore) must NOT consume it. Sapping Hex / Black Draw Mana → auto-applied Weakened now carries the real effect.

---

## 2026-06-11b DELTA — V3 ENGINE PASS (built + pack-validated; ⚠ NOT LIVE-VERIFIED — run the checklist below before playtest)

Goal: clear the deferred backlog — the §9 engine to-dos and the triage doc's B-bucket ("trigger-v2 / engine-needed"). Everything below is authored, built into the packs, and verified at the LevelDB level (rules present, effects keyed correctly, `node --check` clean on both scripts); **nothing has run inside Foundry yet**.

### Engine (register-skills.js, now ~2384 lines, v0.2.0)
- **Custom statuses registered:** `weakened` (condition:true), `diagnosed` (mark), `insight` (STACKABLE, Gnothis counter). Added to BOTH `CONFIG.COSMERE.statuses` and `CONFIG.statusEffects` at module init (the system maps statuses→statusEffects in its OWN init, which runs first). Bonus: **Black Draw Mana now auto-applies Weakened** (its `CONFIG.COSMERE.statuses.weakened` check finally finds one). Icons: downgrade/eye/book.svg (core `icons/svg/` set — verify they render; a 404 = blank status icon).
- **New event types:** `edha-take-damage` (real: hook `cosmere-rpg.applyDamage`, document = VICTIM; `TRIG_EVENT` maps `take-damage` now — Prognosis-style watchers no longer emit nothing), `edha-apply-watch` (sentinel for rules read by the applyDamage engine).
- **New handler types:** `edha-apply-status` (mark a target + record owner in `flags.edha-content.markedBy.<status>`; optional party bonus damage), `edha-status-sweep` (damage all [status] creatures in range, THP = total), `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit` (all sentinels read by engine glue).
- **applyDamage wrapper overhauled** (pre-pass mutates instances BEFORE apply, post-pass reacts after): Severance vital conversion vs Isolated victims; Vital-Diagnosis +Tier vital bonus instance on ANY damage vs the marked creature; heal-overflow→Temp HP; Prognosis 1-Inv-per-round when the Diagnosed creature takes damage; Mender's Instinct chat-card prompt when an ally character crosses to ≤ half HP. **Isolated is computed live** (no ally token within 10 ft) — `edha.isIsolated(actor)` to test.
- **Riders** gained `whenTargetCondition` / `whenTargetStatus` filters (checks YOUR CURRENT TARGET — target before rolling). **Triggered effects** gained `whenTargetIsolated` + kind `status` (apply a status; GM-relayed via new socket actions `toggle-status` / `apply-status-mark`). Trigger heals can now target the VICTIM (`target:"victim"`), with a burst-relay fallback when the healer lacks perms.
- **Summons** can carry baked toggled-off ActiveEffects + extra baked abilities (`bakedEffectsJson`/`extraItemsJson` on the rule): Forge Construct now bakes **Siege Form** (Speed 0 via override, deflect 3) + a **Siege Cannon** ranged attack resolved vs the caster at summon time.
- **Edha derivations** (characters only): HP = system + 1 (skipped while the actor's SOURCE still carries a manual `hea.max.bonus` — the pregens), Speed = 20 + 5×SPD + effect bonuses (skipped while the source carries its own movement override). **Run `edha.migrateDerivations()` once as GM** to strip the pregens' per-actor hacks so the derivations take over. Investiture source-override clamp gotcha now self-heals: the derivation PERSISTS `inv.max.{override,useOverride}` to the actor source once per session.
- **⟳ Sync flake hardened:** retries `pack.getDocuments()` vs `pack.index` up to 5× with backoff, warns if still short.
- **API additions:** `edha.migrateDerivations()`, `edha.isIsolated(actor)`, `edha.toggleStatus(actor, statusId, active)`.

### Generator + tables
- `foundry-build.js`: emits the above from **`data/talent-state.json` (NEW)** — kinds: mark / sweep / convert / marked-watch / hp-threshold / multi-hit / overflow-thp; riders + triggers gained the new filter passthroughs; `talent-effects.json` entries may now set `transfer:false` (apply-to-target template) + `statuses:[...]` (token icon).
- **`data/adversary-effects.json` (NEW):** the 17 §8b hand-built world-actor effects, extracted VERBATIM from the live world (Stitchmother Phase 2 / Vital Diagram, Frost Lance Slowed, Brace ×2, trackers, etc.) and baked into the edha-adversaries pack as `!actors.items.effects!<actor>.<item>.<effect>` sub-keys (same split as talent packs; key shape verified against the system's companions pack). **Pack re-imports now keep the adversary automation.**
- Entries authored (B-bucket cleared): Vital Diagnosis (mark, +Tier vital), Prognosis (marked-watch + conditional heal rider), Severance (convert), **Sapping Hex** (deal-damage trigger, Isolated filter → Weakened), **Spoils of Isolation** (sweep; its old flat-roll entry REMOVED to prevent double-apply — rollable count 90→89), Mender's Instinct (hp-threshold), Flashpoint (multi-hit, red), Life Surge + Overgrowth (overflow-thp; the heroic plant 'Overgrowth' twins get the inert rule too — harmless). Forge Construct summon spec gained Siege Form/Cannon.

### Build & packs — ⚠ PACKS MOVED TO `packs/v3/` (**SUPERSEDED 2026-06-12: consolidated back to `packs/` — see the 06-12 delta. Historical record below.**)
Build ran clean (sandbox build with `EDHA_DATA`/`EDHA_MODROOT`): talents:365 trees:21 paths:21 edges:325 rollable:89 **events:36** (was 24) **effects:14**; adversaries 9/30 + 17 baked effects. Pack-level validation: all 10 new-rule spot-checks OK, adversary effect keys + ID-string refs OK, Phase-2 changes byte-exact.
- The build environment could CREATE but not DELETE files in the module dir → packs were written to **`packs/v3/edha-*`** and **module.json repointed** (pack IDs unchanged: `edha-content.edha-leyline` etc.; version 0.1.0→0.2.0). The old `packs/edha-*` dirs are now DEAD — delete them by hand whenever. Future local builds: either point foundry-build.js back at `packs/` (and revert module.json) or keep the v3 paths — pick one and update the other side to match.
- Guard note: baselines for deity/heroic failed to LOAD in the sandbox (warned + skipped); leyline guard ran. Baselines were refreshed for all three by the build.

### LIVE-VERIFY CHECKLIST (next session / before playtest)
1. **Full relaunch** (module.json changed — F5 is not enough). Confirm the module loads (console: "native event system registered" with the v3 handler list) and all 4 compendia populate from `packs/v3/`.
2. **⟳ Sync** all characters (rerun if short). 3. **`edha.migrateDerivations()`** once as GM → check HP max and Speed on all 4 PCs match the sheets (HP system+1, Speed 20+5×SPD; Walking Ruin still +10 on the Demolisher).
4. Token HUD shows Weakened/Diagnosed/Insight icons (404 icon = swap `EDHA_STATUSES` icon paths). Black Draw Mana auto-applies Weakened in range.
5. **Outlaw:** hit an Isolated dummy → Weakened auto-applies (Sapping Hex) + damage applies as VITAL (Severance chat note); Spoils of Isolation vs ≥1 Weakened enemy → per-target vital + THP = total.
6. **Vivisectionist:** Vital Diagnosis (target first!) → Diagnosed icon + chat; any damage vs the marked creature gains +2 vital; Prognosis recovers 1 Inv (once/round); Verdant Mend vs a conditioned target heals +[Tier][Die] (rider — target BEFORE rolling); Life Surge past max → overflow Temp HP; ally to half HP → Mender's prompt heals the ALLY.
7. **Demolisher:** Flame Surge capturing 2+ → Flashpoint prompt (regain 1 Inv button). Arc Flash regression.
8. **Forgemaster:** Forge Construct summon carries the toggled-off Siege Form effect + Siege Cannon item.
9. **Adversaries:** import a fresh Stitchmother from the pack → Phase 2 / Vital Diagram effects present (re-import no longer loses them).
- Known manual bits: most status DURATIONS still have no expiry engine — remove by hand (EXCEPTION: Weakened now auto-expires at the end of the creature's next turn via the generic timed-status pass — see the 06-13 delta); Sapping Hex fires on the damage ROLL (not a confirmed hit) vs your current target; Lay Foundation persistent friendly zone still missing (region-buff engine); Crown of Thorns still manual (no "which defense was tested" hook).

### New gotchas (operator)
- **Cowork-sandbox mounts serve STALE copies of host-edited files** (new content truncated to the old byte length!) and **cannot delete** module files (EPERM on unlink). Hence: build to NEW dirs (`packs/v3/`), syntax-check by reconstructing head+tail, never trust `wc`/`node --check` through the mount on a file edited host-side this session.
- Item updates that worked: creating files + overwriting bash-written files through the mount is fine; LevelDB pack WRITES to fresh dirs are fine.

---

## 2026-06-11 DELTA — playtest-PC manual-talent triage pass-1 (built, synced, live-verified; world is playtest-ready)

Full triage + per-talent design notes: `TRIAGE_PLAYTEST_PC_MANUALS.md` (next to this doc). Summary:

- **5 new table entries authored + built (deity, heroic; leyline untouched) + ⟳ Synced + live-verified:**
  - **Warlord's Advance** (talent-triggers, `on:kill` → THP `@tier` self) — the `{resource:"inv", value:0, optional:true}` trick WORKS: a 0-cost confirm chat-card button posts on any presumed kill; click only if the kill came from this attack. Verified end-to-end (Trooper kill → button → THP {value:2, source:"Warlord's Advance"}).
  - **Swift Healer** (talent-riders, `appliesTo:"heal"`, `@skills.med.rank`) — verified: Verdant Mend rolled `(2)d(2*3+2) + 6 + 2`.
  - **Vigilant Stance / Flamestance** (talent-effects) — toggled-off indicator AEs (changes:[]; sheet toggle only, no token icon — `statuses` is hardcoded `[]` in the build). Mechanics manual.
  - **Lay Foundation** (talent-targeting, plain aoe-template, sizeFt:5) — works but the template is TRANSIENT (the aoe handler deletes it after capture/targeting). Net value = cost consumption + use card; the persistent Foundation zone still needs a manual drawing. Pull the entry if it annoys.
- **Triage verdicts:** most §8a "Manual" talents are blocked on Phase-3/engine work, not table entries — Severance + Spoils-THP (conditional-vs-state / damage-fed THP), Sapping Hex (custom Weakened status), Prognosis (`edha-take-damage` event — CONFIRMED a take-damage table entry emits NOTHING today, triggerRule returns null), Life Surge/Overgrowth overflow-THP, Vital Diagnosis marker (needs `transfer:false` passthrough in talentEffects — bundle with the §8b adversary-effects bake). Forgemaster's kit is mostly narrative → stays manual.
- **NEW GOTCHA — Investiture source-override clamp:** the system's own prepare clamps `inv.value` against `max.value` BEFORE the module's Investiture derivation applies its runtime override — an actor whose SOURCE lacks `inv.max.{override, useOverride:true}` gets its current Inv clamped to 0 every prepare (src value survives untouched; the sheet just shows 0). The Demolisher had the source override (why it never showed the bug); Outlaw/Vivisectionist/Forgemaster didn't. FIXED by persisting source overrides (5/5/6 = canon 2+max(AWA,PRE)). If a future PC shows inv 0 after a reload, this is why. Consider doing the same persistence inside `edhaDeriveInvestiture` (actor.update once, instead of per-prepare in-memory override).
- **World prep done (2026-06-11):** player ownership + character assignment set — **Amertron→Outlaw, Laustarr→Demolisher, Spidercam→Forgemaster; Vivisectionist = GM-run spare** (NOT Forgemaster as §8b guessed). Outlaw token placed by the party (was missing — only 3 PCs had tokens). All 4 PCs at full Investiture. combats=0, templates=0, Playtest Map active, game paused. Test artifacts cleaned (Trooper HP restored, test THP cleared, temp tokens deleted); a few test chat cards from this session remain in the log (harmless — delete by hand if wanted).
- Build counts now: deity events 11 / effects 1; heroic events 7 / effects 8. `VALIDATION PASSED ✓`, 0 issues. `scripts/run-playtest-build.bat` exists for one-click deity+heroic+validate (writes `scripts/build-log.txt`).

---

## 1. What this is

Port the **Edha** homebrew talent/skilltree system (Cosmere RPG homebrew) into **Foundry VTT** as a content module **`edha-content`**, built on the community **cosmere-rpg** system. Three talent atlases (leyline / deity / heroic) + a playtest-adversary pack, plus runtime automation (rolls, triggers, Temp HP, summons, targeting, Draw Mana, Investiture derivation).

As of 2026-06-09 talent behaviors are hosted **natively and exclusively** on each talent — `system.events` rules + `effects` ActiveEffects — visible and editable on the talent's Events/Effects tabs (see §7). There is NO parallel runtime behavior store; `register-skills.js` is a thin generic engine that reads the on-talent rules.

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`. User data at `C:\Users\benhe\AppData\Local\FoundryVTT\`.
- **System:** `cosmere-rpg` v2.0.4 at `…\FoundryVTT\Data\systems\cosmere-rpg\index.js` (minified ~28.7k lines; grep it for facts — hooks/handlers use templated strings, so grep the SUFFIX e.g. `damageRoll`, `registerItemEventHandlerType`). Unminified core Foundry API lives in `C:\Program Files\Foundry Virtual Tabletop\resources\app\{client,common}\**\*.mjs` (grep here for Region/ActiveEffect/document APIs).
- **Public icons:** `C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons` — **verify icon existence with a WINDOWS path** (`C:/Program Files/...`); an MSYS `/c/...` path makes node `fs.existsSync` return false for everything. A 404 icon = invisible/unselectable tree node.
- **Our module:** `…\FoundryVTT\Data\modules\edha-content\` — `module.json` (now declares the `RegionBehavior.hazard` documentType), `scripts/register-skills.js` (the runtime; hand-edited here), `styles/edha.css`, `lang/en.json`, `data/*.json` (runtime tables, copied at build), `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries}` (LevelDB).
- **Source (canonical):** `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\` — `data/leyline.json` (125), `data/domain.json` (90 deity), `data/cosmere.json` (375; only 6 heroic paths ×25 = 150 in scope), `data/adversaries.json` (9), + the behaviour tables (see §5). `scripts/foundry-build.js` (generator) + `scripts/talent-icons.js`.
- **Validators/inspectors (in `Skilltrees/scripts/` since 2026-06-12; the old `C:\tmp` copies are obsolete):** `validate-packs.js` (talent packs), `validate-adversaries.js` (adversary pack incl. baked effect keys), `inspect-pack.js <pack> "<Name>"` / `--group <Tree>` (print a talent's emitted events/effects). All read via temp-copy → **safe with Foundry open**.

## 3. Build / validate / when to rebuild vs F5

- **Build:** `cd "…/Skilltrees/scripts" && node foundry-build.js [leyline|deity|heroic|adversaries|all]` (default all). **NOTE: single scope arg only** (`leyline deity` runs leyline ONLY; run twice or use `all`). Deterministic 16-char ids (`fid`). Rewrites the LevelDB packs (effects as `!items.effects!` sub-keys), writes tree-background SVGs, bakes per-talent `system.events` + `effects`, and **deletes any stale runtime-table copies from `modules/edha-content/data/`** (tables are generator inputs only). Portable: `EDHA_DATA`/`EDHA_MODROOT` env overrides + classic-level fallback (`npm i classic-level` + NODE_PATH off-machine).
- **Validate:** `node validate-packs.js` (expect `VALIDATION PASSED ✓`, 0 issues); `node validate-adversaries.js` after adversary builds.
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
- `edha.clearKindleLights()` — restore tokens' pre-Kindle lighting (also auto on `deleteCombat`). `edha.refreshDefBuffs()` — re-sync Know-Your-Moment-style defense buffs to the current combat turn (e.g. after a mid-combat reload).

## 5. Behaviour tables (generator INPUTS ONLY; in `Skilltrees/data/`; NEVER read at runtime)

These tables are **generator INPUTS only** (2026-06-09): `foundry-build.js` emits each entry as a native `system.events` rule (or an `effects` ActiveEffect) on its talent. They are **NOT copied to the module and NOT fetched at runtime** — the build deletes any stale `modules/edha-content/data/talent-*.json` copies. The runtime reads behaviour exclusively from each talent's own rules/effects.

**⚠ MASKED SINCE 2026-06-12:** all 21 trees now have authored overlays (`data/authored/`), which **win over these tables** — a new table entry for an existing talent does nothing. Author per-talent behavior in Foundry (→ extract) or by hand-editing `data/authored/<atlas>-<tree>.json` (→ build). The tables below are kept as bootstrap history + schema reference for the rule shapes the engine understands.

- `talent-rolls.json` — per-talent Skill Test + Damage (→ baked into `system.activation`/`system.damage`, the DETAILS tab; native + editable). 90 rollable.
- `talent-riders.json` — passive damage riders (Kindle, Mighty) → `edha-damage-rider` rule (incl. **`lightRadiusFt`** for Kindle's "damaged creatures shed light"); applied by the `rollDamage` wrapper / `applyDamage` wrapper, which READ the native rule.
- `talent-thp.json` — Temp HP grants → `edha-temp-hp` rule on `use`.
- `talent-summons.json` — summon stat blocks → `edha-summon` rule on `use`.
- `talent-triggers.json` — triggered effects → `edha-triggered-effect` rule on `edha-deal-damage` / `edha-on-defeat`, incl. the **`whenDamageType`** filter (e.g. Arc Flash = energy-only). Dispatched NATIVELY by the system's event engine (no take-damage entries currently exist; add an `edha-take-damage` event type when one does).
- `talent-targeting.json` — **point-burst config**: a `burst:{}` block is emitted as an `edha-burst` rule (event `edha-pre-use`) carrying size/range/save/heal/terrain — the preUseItem engine READS that rule (supersedes the `edha-aoe-template` rule for those talents). Range preview (⊙ button) needs NO data (color derived at runtime).
- `talent-hazards.json` **(new)** — dangerous terrain (Set Charge, Pyre, Fault Line) → `edha-place-hazard` rule on `use` → drops a scene-scoped Region with the `edha-content.hazard` behaviour.
- `talent-effects.json` — passive numeric buffs (Walking Ruin +Speed) → native ActiveEffects baked into the pack (key e.g. `system.movement.walk.rate.bonus`, mode ADD). **The old strip-on-load issue is FIXED** (effects are written as separate `!items.effects!` LevelDB keys — see §7).
- `talent-defense-buffs.json` — defense bonus for a combat-timing window (Know Your Moment) → an **`edha-defense-buff` rule ON the talent** (event `edha-combat-timing`; amount/defenses/window/label editable on the Events tab). The engine's core combat hooks read that rule and toggle the matching actor ActiveEffect. Pattern for any "+N defense/stat for a window" talent.
- `talent-state.json` **(v3)** — state mechanics, one entry or ARRAY per talent. Kinds: `mark` (apply status + record owner + party bonus dmg — Vital Diagnosis), `sweep` (damage all [status] in range, THP=total — Spoils of Isolation), `convert` (damage type vs Isolated — Severance), `marked-watch` (resource regen when your marked creature takes damage — Prognosis), `hp-threshold` (ally-at-half prompt — Mender's Instinct), `multi-hit` (2+-capture prompt — Flashpoint), `overflow-thp` (heal overflow → THP — Life Surge/Overgrowth).
- `adversary-effects.json` **(v3)** — adversary item ActiveEffects (advName → itemName → [effects]), baked into the edha-adversaries pack so re-imports keep the §8b automation.
- Draw Mana riders + Investiture formula + HP/Speed sheet derivations are **hardcoded** in register-skills.js (small, fixed canon).

## 6. Settings the user must have

- **`applyButtonsTo` = 4 (Prioritise Targeted).** REQUIRED for the auto-target AoE model — at the default 0 (SelectedOnly) the chat Apply buttons ignore targets and only hit the selected token. The module force-sets it on load (GM); also Configure Settings → cosmere-rpg → "Apply damage/healing to" → Prioritise Targeted, or `edha.fixSettings()`. When clicking Apply, don't re-target between casting and applying.

---

## 7. THE NATIVE EVENT/EFFECT SYSTEM — ✅ 2026-06-09: BEHAVIOR LIVES ON THE TALENTS (re-refactor complete)

### §7.0 — 2026-06-09 RE-REFACTOR (READ FIRST; supersedes the 2026-06-08b corrections below)

**Every automated talent now carries its behavior ON the item**: `system.events` rules (Events tab, fully editable via the auto-rendered rule dialog) + `effects` ActiveEffects (Effects tab) + the roll on DETAILS. `register-skills.js` is a thin generic engine: it registers event/handler types, generic executors, and engine glue (burst targeting UI, GM socket relay, combat-turn timing, rollDamage/applyDamage wrappers) that READ the on-talent rules. **The legacy runtime behavior store is DELETED** — no table loaders, no side-file fetches, no name-keyed dispatch; `modules/edha-content/data/` ships no talent tables.

**Definition-of-done loop VERIFIED LIVE**: unlocked the heroic pack, opened Know Your Moment's Events tab in the UI, edited Bonus amount 2→3 in the rule dialog, ⟳ Sync, started combat → actor showed +3 (phy 14→17); reverted to 2 the same way. No code/side-file edits.

**Blocker 1 RESOLVED — native damage-trigger dispatch WORKS (cosmere-rpg v2.1.0).** The 2026-06-08b "edha-deal-damage / edha-on-defeat never fire" finding was caused by **stale owned snapshots**: the talents on the test actor carried ZERO native rules (never re-synced after the events migration), so there was nothing for the engine to fire. After `⟳ Sync`, Arc Flash's own on-talent rule fires natively off `cosmere-rpg.damageRoll` — watched live. Two engine details discovered:
- the system fires the `damageRoll` hook **TWICE per rollDamage (main roll + graze roll)** → the `edha-deal-damage` event type has a 400 ms per-item **debounce in its `condition`** so one logical hit dispatches once;
- the energy-only filter (formerly `when.damageType` in the side-file) is now a **`whenDamageType` field on the rule** (editable; the executor checks it against the triggering roll's damage type).
The old runtime workaround (legacy dispatcher reading talent-triggers.json, no-op native executor) is **REMOVED**; the native `edha-triggered-effect` executor is the real implementation (optional-cost rules post the chat-card button; unconditional rules fire immediately; `edha-on-defeat` passes the victim via `event.options.victim`).

**Blocker 2 RESOLVED — on-talent ActiveEffects survive the compendium.** Root cause (the `_stats` theory was wrong): **Foundry LevelDB packs store embedded ActiveEffects as SEPARATE `!items.effects!<itemId>.<effectId>` keys, with the parent item's `effects` field holding only ID strings** (verified against the system's own heroic-paths pack). The old build baked full effect objects inline in the item doc, which Foundry silently ignores on load. `writePack()` now does the split (and `edha-pack-io.js#readPack` reassembles them for fingerprints/extract). Verified live: Walking Ruin loads from the pack with `effects.size=1`, shows "Walking Ruin — Speed" on its Effects tab, and applies on a character (Speed 30→40; `CONFIG.ActiveEffect.legacyTransferral=false` means transfer:true item effects apply to the actor directly).

**Point-targeted bursts — now rule-driven.** The burst CONFIG lives in an **`edha-burst` rule on the talent** (event `edha-pre-use`, a sentinel type: never dispatched; the engine reads it). Fields (all editable on the Events tab): sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain. Engine glue unchanged: `cosmere-rpg.preUseItem` takeover (returning `false` cancels the default `use()`) → consume cost → range ring + **click-to-place** template (`edhaPickPoint` reads `canvas.mousePosition`, grid-snapped) → chat **Detonate** button captures everyone inside, auto-rolls saves for half, applies (GM-direct or socket relay), drops terrain. Damage formula+type still read from the talent's own `system.damage`; owned riders (Kindle) still added. Verified live on Flame Surge (cast → ring 60 ft → place 10 ft burst → Detonate resolves). **`preUseItem` takeover remains THE pattern for any talent that doesn't fit the single-target attack card.**

**Player-accessible writes via a GM SOCKET RELAY (unchanged).** applyDamage on GM-owned enemies + Region terrain + token light + actor effects all need GM perms. The burst Detonate resolves rolls on the clicking client then relays the privileged writes to the **primary active GM** (`game.socket.on("module.edha-content")`, gated `game.users.activeGM.isSelf`, applier `edhaApplyBurstResults`). Required **`"socket": true` in module.json → a world RELAUNCH**, not just F5. **LESSON: any mechanic that writes to GM-owned docs must run GM-side; for player actions, relay through this socket.**

**Kindle light & defense buffs — now rule-driven:**
- **Kindle light** — config is the **`lightRadiusFt` field on Kindle's own `edha-damage-rider` rule** (0 = none). The `applyDamage` wrapper reads owned rider rules to decide light; source attribution unchanged (explicit `options.edhaSource` from bursts → `originatingItem` → recent damage-roll breadcrumb → killer-candidate heuristic); clears on `deleteCombat` / `edha.clearKindleLights()`. Verified live (token light dim=5/bright=2.5).
- **Defense buffs / Know Your Moment** — the **`edha-defense-buff` rule on the talent** (event `edha-combat-timing`, a sentinel) holds amount/defenses/window/label/img. Engine: defenses are `DerivedValueField` (`value = base + bonus`) → toggled ActiveEffect on `system.defenses.*.bonus`; the cosmere system has NO turn hooks → Foundry **core** combat hooks (`combatStart`/`combatTurnChange`/`deleteCombat`) call `edhaRefreshDefBuffs`, which recomputes every combatant from initiative order and reads the rule from owned talents. Verified live (14→16 before turn, removed on turn; +3 after the UI edit).

**⟳ Sync rewritten (2026-06-09) — replace-not-merge + identity matching:**
- Item updates MERGE `system.events`, so stale rules lingered forever; sync now emits a **`-=<ruleId>: null` deletion** for every existing rule the pack source no longer carries, and **prunes stale embedded effects** (delete-by-id after update). Owned talents end up EXACTLY mirroring their pack source (rules + effects).
- **28 talent names collide across trees** (365 talents → 337 unique names), so name-only matching is ambiguous; sync matches by **`atlas|group|name`** (from `flags.edha-content`) with plain-name fallback.
- **Caveat:** calling sync within ~seconds of a pack write (editing a pack item, lock/unlock) can update fewer talents than expected (`pack.getDocuments()` returns a partial set mid-reindex; a retry guard exists but isn't bulletproof). Sync is idempotent — **run it again**; verify with the rule-id checker if paranoid.

**Robustness checklist (every one of these bit us — apply everywhere):** gate GM-side writes to ONE GM (`activeGM.isSelf`); make handlers **idempotent** (claim/delete state at the top before any `await`); **existence-check before `.delete()` and `.catch()` the async** (a caught promise does NOT suppress Foundry's red "X does not exist!" toast); bind chat buttons on **`renderChatMessageHTML` ONLY** (the deprecated `renderChatMessage` ALSO fires in v13 → double-bind → double-fire/double-damage); **never assign a `DerivedValueField.value`** (getter-only → TypeError; use `.bonus`/`.override`).

**LESSON — read the schema before building.** Confirming `value=base+bonus` (defenses), `DamageType.Healing="heal"`, `canvas.mousePosition` (a live world-coord PIXI.Point), and that the combat hooks exist — all up front — avoided guesswork each time. Grep the system/core source first.

**Verified live 2026-06-09 (all from on-talent rules/effects, legacy store deleted):** Arc Flash (native dispatch off Searing Bolt, energy filter, one card, graze-debounced), Kindle (+Red-mod rider in the damage formula AND 5 ft token light), Walking Ruin (+10 ft Speed AE survives pack load, visible on Effects tab, applies on add), Know Your Moment (+2 → UI-edited +3 → reverted; round-until-turn toggling), Flame Surge (rule-driven burst: cost, 60 ft ring, click-place, Detonate), Death Ward (use→edha-temp-hp rule present), ⟳ Sync exact-mirror verification across all 4 characters (37/37 talents, 0 mismatches).

**Prior 2026-06-08b playtest (engine glue still identical):** Pyre (attack + terrain), Set Charge, Mending Aura, Thorn Field, socket relay, Temp HP absorption, summons.

---

### Architecture reference (registrations & key findings — current as of 2026-06-09)

Talent behaviors run through the cosmere-rpg event engine, hosted on the talent (`system.events`, Events tab); passive buffs are native ActiveEffects (Effects tab); rolls stay on DETAILS. The generator emits these from the §5 tables; ⟳ Sync mirrors them onto owned talents. 24 talents currently carry rules (coverage grows by adding table entries + rebuild — §9).

### Registered in `register-skills.js` at `setup` (`edhaRegisterNativeEventSystem()`)
- **Custom EVENT types** (`cosmereRPG.api.registerItemEventType`):
  - `edha-deal-damage` — hook `cosmere-rpg.damageRoll`; `condition` = 400 ms per-item debounce (the hook fires twice per roll: main + graze) + src.actor check; `transform:(roll,src)=>({document: src?.actor ?? src, options:{roll, sourceItem:src}})`. Returning the **actor** fans the rule out across ALL the owner's items, so e.g. Arc Flash's rule fires when Searing Bolt rolls. **VERIFIED FIRING on v2.1.0** (the 06-08b "doesn't fire" was unsynced snapshot talents).
  - `edha-on-defeat` — hook `cosmere-rpg.applyDamage`; `condition`: dealt > 0, victim HP ≤ 0, not re-entrant from a trigger; `transform` resolves the presumed **killer** (controlled token / current combatant / `user.character`) → `{document: killer, options:{victim}}`. (Chain Detonation, Necrotic Cascade, Predator's Due.)
  - `edha-pre-deal-damage` — sentinel (never fired); marker for damage riders, applied by the `rollDamage` wrapper reading the `edha-damage-rider` rule.
  - `edha-pre-use` — sentinel; marker for `edha-burst` rules, read by the `preUseItem` takeover.
  - `edha-combat-timing` — sentinel; marker for `edha-defense-buff` rules, read by the core combat hooks.
- **Custom HANDLER types** (`registerItemEventHandlerType`): `edha-triggered-effect` (**whenDamageType**, kind=damage|damage-aoe|heal|thp|affliction, formula, damageType, target, radius, resourceGain, cost+optional, oncePerRound, note — REAL executor: optional-cost → chat-card button, else immediate fire), `edha-damage-rider` (appliesTo, bonusFormula, **lightRadiusFt**), `edha-burst` (sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain — config-only), `edha-defense-buff` (amount, defenses, window, label, img — config-only), `edha-aoe-template` (sizeByRank/sizeFt, affects, color), `edha-place-hazard` (sizeByRank/sizeFt, damageFormula, damageType, color), `edha-temp-hp` (formula, target), `edha-summon` (statblock fields). Executors REUSE the shared helpers (edhaFireTrigger/edhaRunTriggerEffect/edhaPlaceAoe/edhaWriteTempHp/edhaSummon/edhaPlaceHazard). `edha.summon(actor, talentName)` now reads the talent's own edha-summon rule.
- **Region behaviour** `edha-content.hazard` (`foundry.data.regionBehaviors.RegionBehaviorType`), declared in `module.json` `documentTypes.RegionBehavior.hazard` and registered into `CONFIG.RegionBehavior.dataModels`/`typeLabels`. Subscribes to `tokenEnter` + `tokenTurnStart` and auto-applies its baked damage to the entering token's actor (GM-side). This is the "dangerous terrain" ongoing effect.

### Key findings (verified in the core/system source — don't re-derive)
- **Handler config UI auto-renders — NO `.hbs` needed.** `configRenderer` is null when no `render`/`template` is given (index.js ~L12507); the rule editor then runs `{{#if shouldAutoPopulateConfigFields}}{{formGroup}}` per schema field (`templates/item/dialog/edit-event-rule.hbs`). So a handler just needs `config.schema` (labelled DataFields) + `executor`.
- **Registration MUST be at `setup`.** The system wires `Hooks.on(hook,…)` for each event type once, at its own `ready` (index.js ~L11975), reading `CONFIG.COSMERE.items.events.types`. Register custom types BEFORE that or their hooks never subscribe.
- **Dispatch fan-out** (index.js ~L11987): the fired hook's `transform` returns a `document`; if it's an **Actor**, the engine evaluates event rules on EVERY item the actor owns; if an Item, just that item. `host` defaults to `"source"` (runs on the triggering client); `"gm"`/`"owner"` also exist.
- **Roll source:** `damageRoll()`/`preDamageRoll` fire `(roll, config.data.source, config)` and `config.data.source` is the rolling **Item** (index.js ~L7484).
- **Talents support events:** `TalentItemDataModel` mixes in `EventsItemMixin()` (index.js ~L26970); `action`/`trait` items too. Rule shape mirrors the proven `pathEvents()` in foundry-build.js: `{ id, description, event, handler:{ type, …flatConfigFields } }`.

### Coexistence — OVER (2026-06-09)
All legacy dispatchers, table loaders, and `edhaIsMigrated` guards are **deleted** from register-skills.js. The shared helpers remain only as implementations the native executors call. All four world characters were re-synced and verified to exactly mirror their pack sources.

### Build (now portable)
`foundry-build.js` + `edha-pack-io.js` resolve classic-level from Foundry's bundle OR plain `require("classic-level")` (NODE_PATH supported), and honor `EDHA_DATA` / `EDHA_MODROOT` env overrides — so the build can run off-machine against mounted folders. `_stats.systemVersion` stamps 2.1.0. The unextracted-edits guard tolerates an unreadable pack (warns + skips instead of crashing). Latest full build: talents:365, events:24, effects:1.

### RESOLVED (2026-06-09) — ActiveEffects formerly stripped on compendium load
Root cause: Foundry LevelDB packs store embedded effects as separate `!items.effects!<itemId>.<effectId>` keys with ID-string references on the parent item; inline effect objects are silently ignored on load. `writePack()` now performs that split and `readPack()` reassembles. Walking Ruin's +Speed is live from the pack (Effects tab + applies on actors).

---

## 8. Current content state

- **4 packs built & validated (0 issues):** edha-leyline (125t/5tree/5path + Draw Mana action), edha-deity (90/10/10), edha-heroic (150/6/6), edha-adversaries (9 actors/30 items). 325 edges.
- **Native Event/Effect system COMPLETE (2026-06-09):** all 21 trees rebuilt with per-talent `system.events` (24 talents carry rules) + `effects` (1: Walking Ruin — now SURVIVES pack load). Behavior is read exclusively from the talents; register-skills.js is engine-only. All 4 world characters synced + verified (37/37 exact mirror).
- **Roll data: 90 rollable.** Deity convention: color-keyed `[Tier][Die] = (@tier)d(2*@skills.<color>.rank+2)`, Option-B `+ @attr.<id>` preserved; heals = `heal` type. Skill ids: …/`lea` (Leadership)/`prc` (Perception)/… (NOT lead/per).
- **Triggers** (talent-triggers.json → native edha-triggered-effect): Arc Flash, Afterburn, Chain Detonation, Necrotic Cascade, Predator's Due. Optional-cost prompts use a **chat-card button** (not a dialog). Once-per-round (combat) via `flags.edha-content.trigRound`.
- **Temp HP, Summons, Targeting (range ring + AoE), Dangerous Terrain (Region), Draw Mana** (one universal `action`, granted via every leyline path), **Investiture derivation = `2 + max(AWA, PRE)`** (canon; character actors), **defeated-skull overlay tied to HP**, **always-on adversary health bars**.
- **Chaos resource renamed Fracture → Omen** (domain.json; flavor line kept; "Spreading Fracture"→"Spreading Omen").

### 8a. Playtest PCs (built 2026-06-10 from the May-17 reference sheets; `scripts/playtest-setup-console.js` is the idempotent rebuilder)

All four are L7/T2, 12/12 talents, stats sheet-matched (HP/inv/movement; focus = sheet + Tier where Composed applies — the sheets don't compute talent effects):
- **The Demolisher** (Scholar/Red/Razkael) — THE MODEL. Roster corrected: −Know Your Moment (not on sheet), +Composed (a CROSS-TREE pick — Composed only exists in heroic/Envoy), +Set Charge. Verified: native Arc Flash trigger, Kindle rider+light, rule-driven bursts, Pyre hazard.
- **The Forgemaster** (Leader/White/Kethane) — Composed (+2 foc) + Customary Garb (+2 PHY/SPI → 16/19) live; Guardian Stance +1 Deflect baked toggled-OFF (conditional); Draw Mana granted (was missing); **Forge Construct** verified: HP [Tier][d8-white]+4, deflect 1 (new summon-rule field), defenses = caster−2 incl. Garb. Manual: Lay Foundation/Siege Form/Trade Routes/Through the Fray/Guiding Signal/Concordant Presence.
- **The Outlaw** (Warrior/Black/Tyrith) — created. Tyrith rolls fixed red→**black** d8 (sheet's die). Black Draw Mana fires (Weakened = manual note). Manual: stances, Isolated-state mechanics (Sapping Hex/Severance), Spoils THP, Warlord's on-kill THP.
- **The Vivisectionist** (Scholar/Green/Anaveth) — created. Collected (+2 COG/SPI → 18/17) live; heal rolls verified (Verdant Mend [Tier][d8-green]+mod); Green Draw Mana terrain. Manual: Diagnosed-state mechanics (Prognosis/Vital Diagnosis), Life Surge overflow-THP, Field Medicine resolution.

### 8b. Playtest-1 prep (2026-06-10b) — adversary automation, balance pass, world setup

**Adversary action automation — lives on the WORLD actors, NOT the pack.** All 18 placed adversaries (Edha Adversaries folder; duplicates are separate actor docs — every copy was updated) got hand-created ActiveEffects on their items via console, following the PC-talent conventions (`Item — Thing` naming, transfer:true, conditional = baked toggled-off):

- **Mechanical:** Stitchmother **Phase 2 — Transformed** (toggled-off; `hea.max.bonus +20`, `attributes.str/spd.bonus +1`; heal-to-90 / +2 Vital / 2d6 regen stay manual per the description, verified 140→160 max while at 140). **Vital Diagram — Marked** apply-template implements the Deflect bypass on the victim (`deflect.useOverride=true` + `deflect.override=0`, OVERRIDE mode; +4 Vital stays manual; verified apply/restore on a PC).
- **Apply-to-target templates** (transfer:false, drag from the item onto the target's sheet): Frost Lance→**Slowed** (`statuses:["slowed"]`, 1 round), Venom Slam→**Afflicted** (`statuses:["afflicted"]`), Suture Cradle→Cradled, Bite→sheds-light, Probability Net (−1d6 next test), Calc Strike (+3 one test).
- **Trackers** (no engine key exists for advantage/disadvantage — token-icon reminders only): Brace (Captain 2-dis / Troopers 1-dis, 1-round duration), Glimpse the Path, Fade/Veil concealment (Stalkers), Bone Spurs / Venom Glands (Thralls, toggled-off), always-on icons for Predictive Ward + Cinder Coat.
- **NOT in source/pack:** `adversaries.json` and the edha-adversaries pack were untouched — re-importing actors from the pack loses all of the above. To make permanent, port these into generator inputs (adversary analogue of talent-effects.json) + rebuild.

**Balance pass (PC damage die = 2d8 — T2, leyline rank 3 across all four PCs):**
- Flame Surge does **NOT** one-shot Troopers (avg 9 − Deflect 1 into 14 HP; ~5% outright kill per failed save; saves are Athletics +0 vs Red +5, so most fail). No minion HP changes made.
- **FIXED: The Outlaw had NO weapon items at all** (Vivisectionist none either) — Warlord's Advance / Momentum of Victory were dead. Added **Longsword** (1d8 keen, equipped, + `weapon:longsword` expertise entry) and **Staff** (1d6 impact, equipped) from `cosmere-rpg.items`.
- Adversary defensive skills were all +0 → set ranks: **Stitchmother dis 5** (Suture Cradle concentration DC 10+dmg now holds ~55% vs a typical hit), **Troopers dis 2** (rout DC 13), **Captain ath 2**.
- **Stitchmother HP 140→120** (`hea.max.override`; Phase-2 below-70 trigger and heal-to-90 unchanged) — keeps the boss in the 4–6-round band vs party net DPS.
- **Playtest-1 watchpoints:** Captain Deflect 4 vs the party's small dice (deliberate — Ben wants him to be "a real test"; if it slogs, drop to 3). Boss net-DPS margin with the Discipline buff.

**World/session setup:** Playtest Map **activated** (was the default splash scene — players would have landed there). PC Investiture topped up. Stale test combat + 2 stray Demolisher tokens removed. **JournalEntry "Playtest Dungeon — Room Guide"** created (6 pages: read-aloud blockquote + adversary visual descriptors + terrain + run notes per room), built from the May Dungeon Reference PDF with deltas: **Living Lock CUT** (Room 1 vault door opens via Crafting/Lore DC 16 or Athletics DC 18 only), **Room 4 rewritten to match the map** (poison lake centerpiece + BOTH Frostbinders sniping from the balcony, Stalkers on the shore; suggested lake ruling: 2d6 Vital/round immersed, Athletics DC 14 out), **Room 6 = 3 Thralls** (map count, not the sheet's 2). Player users **Amertron / Laustarr / Spidercam** created with passwords; internet invite verified working (AT&T BGW NAT/Gaming forward TCP 30000 → gotcha: the gateway bound the rule to a STALE duplicate device entry for the same hostname; re-pointing at the live 192.168.1.247 entry fixed it). Remaining manual step if not yet done: per-PC **Ownership → Owner** + User Configuration character assignment (3 users / 4 PCs — Forgemaster is the natural GM-run spare).

**Console-operator notes (this session):**
- Creating an item-embedded ActiveEffect **with `statuses` in the create call throws** `Cannot read properties of null (reading 'startsWith')` (cosmere-rpg v2.1.0 / Foundry v13.351). Workaround: create without `statuses`, then `effect.update({statuses:[...]})`.
- DevTools `copy()` is **undefined inside async/promise contexts** — stash results on `window._r`, then `copy(window._r)` as a second synchronous command.
- Beware shell→clipboard quoting: escaped `\'` inside single-quoted JS arrived as `\\'` and produced a silent SyntaxError (script no-ops, stale `window._r` masks it). Prefer double-quoted JS strings with plain apostrophes.

## 9. Open to-dos

- ~~Fix the ActiveEffect-on-compendium strip~~ **DONE 2026-06-09** (effects as `!items.effects!` sub-keys; §7).
- ~~Re-sync existing characters~~ / ~~Delete the guarded legacy hooks~~ **DONE 2026-06-09** (all 4 characters synced + verified; legacy dispatchers/loaders deleted).
- **NEXT SESSION — live-verify the 06-11b v3 pass** (checklist in the delta), then **broaden coverage tree-by-tree** (36 of 365 talents carry rules). Loop per tree: review each talent → author its events/effects **in Foundry (Events/Effects tabs)** or by **hand-editing `data/authored/<atlas>-<tree>.json`** (NOT the side-file tables — masked since 06-12, see §5) → if Foundry-edited: `node foundry-extract.js <Tree>` → `node foundry-build.js <atlas>` (Foundry closed) → `node validate-packs.js` → spot-check `node inspect-pack.js <pack> "<Name>"` → commit `data/authored/` → relaunch → `⟳ Sync` → live-verify. NOTE: 28 talent names collide across trees — sync matches `atlas|group|name`; `AUTHORED.byName` is also cross-tree ambiguous for those 28, but extract stores `docId` per entry and `byId` wins, so collisions only matter for brand-new hand-added entries (include the right docId).
- ~~Sync flake hardening~~ **DONE 2026-06-11b** (retry loop vs pack.index, ×5 with backoff).
- ~~`edha-take-damage` event type~~ **DONE 2026-06-11b** (real event, document = victim; `TRIG_EVENT["take-damage"]` maps). Prognosis itself runs via the marked-damage watcher instead (the rule owner ≠ the victim).
- ~~Adversary world-actor effects → generator~~ **DONE 2026-06-11b** (`adversary-effects.json`, baked; re-imports keep them).
- **#16 AoE/terrain interactive placement — DONE for bursts (rule-driven; §7.0):** Flame Surge/Set Charge/Mending Aura/Thorn Field are click-to-place + Detonate via their on-talent `edha-burst` rules. Remaining: Pyre's terrain still drops on the struck target via its `edha-place-hazard` `use` rule (fine as-is); Set Charge's place→declare→detonate timing is still approximated (use = detonate); add `burst` blocks to other area talents as they come up (rebuild + sync only).
- **Phase-3 trigger v2 — mostly DONE 2026-06-11b:** ~~hit-multiple (Flashpoint)~~, ~~conditional-vs-state (Severance)~~, ~~conditional-THP (Spoils, overflow)~~ all live as v3 rules. Remaining: **Crown of Thorns** (needs a "which defense was the test against" hook — none exists), **Insight on-kill transfer / Gnothis rules** (the stackable `insight` status IS registered + the marked-damage watcher generalizes to it, but no Gnothis table entries are authored yet — no Gnothis PC in playtest 1), **status DURATIONS** (~~no expiry engine~~ — a generic turn-based expiry pass now EXISTS, 06-13: effects flagged `flags.edha-content.expireAfter={round,turn}` auto-clear on the combat hooks. Weakened uses it: disadvantage on str/spd tests, ends at the END of the creature's next turn. Extend the same flag to Diagnosed / other timed statuses as needed).
- **Lay Foundation persistent friendly zone** — still missing (needs a region-BUFF behaviour, the friendly twin of `edha-content.hazard`; the transient template entry from pass-1 remains).
- **Stays manual:** movement/positioning/ally-count triggers (Momentum's Edge, Coordinated Hunt), narrative-violation triggers (Edict/Snare/Bastion), adversary bucket-C (Glyph Pulse — Living Lock CUT from the dungeon), Fault Line ray template, Crown of Thorns (above).
- **Post-playtest-1 balance review:** capture session findings against the §8b watchpoints (Captain Deflect 4; Stitchmother net-DPS margin at 120 HP / dis 5; Flame Surge vs clustered minions).
- ~~PC pregens (4)~~ **DONE 2026-06-10** — all four playtest PCs built/repaired from the May-17 reference sheets and live-verified (see §8a). Scene maps still open.
- ~~"Weakened" is not a native status~~ **DONE 2026-06-11b** — `weakened` / `diagnosed` / `insight` (stackable) registered as Edha statuses; Black Draw Mana + Sapping Hex now auto-apply Weakened.
- **Budget discrepancy — RESOLVED 2026-06-11 (Ben's ruling): the FORMULA stands** (`L+3+floor((L-1)/5)` → 11 at L7); the 12-talent pregens stay installed via the GM bypass (`edha.skipBudget`). No code change.
- ~~Sheet derivations~~ **DONE 2026-06-11b** — HP = system+1 and Speed = 20+5×SPD are now Edha derivations (characters); run `edha.migrateDerivations()` once to strip the pregens' per-actor overrides (derivations skip actors whose SOURCE still carries them, so nothing double-applies before the migration).

## 10. Gotchas

- Custom skills must be `core:true` or they hide behind Powers.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`), or their hooks never subscribe.
- **Handler config forms AUTO-RENDER from the schema** — no `.hbs` template needed (only for fancy widgets).
- **Embedded ActiveEffects in LevelDB packs live as separate `!items.effects!<itemId>.<effectId>` keys** with ID-string refs on the parent — inline effect objects are silently dropped on load. `writePack` handles the split (FIXED 2026-06-09).
- **Dangerous-terrain Region creation is GM-side** — a player using a hazard talent gets a "GM-side" warning (same as summons). For player-initiated bursts, the Detonate relays the writes to the GM via socket (§7.0).
- **Native damage-triggered events DO fire on v2.1.0** — but ONLY on talents whose owned copies carry the rules (⟳ Sync after every rebuild!). The `damageRoll` hook fires TWICE per roll (main + graze) → the `edha-deal-damage` condition debounces 400 ms per item.
- **Item updates MERGE `system.events`** — to remove a rule you must send `-=<ruleId>: null`; sync does this automatically. Plain re-pushing the new events object leaves stale rules in place.
- **Foundry still holds pack LevelDB handles at the SETUP screen** (post-shutdown compaction) — `game.shutDown()` is NOT always enough to rebuild; fully quit Foundry if `writePack` hits EPERM/EACCES on a pack file.
- **Bind chat-card buttons on `renderChatMessageHTML` ONLY** — the deprecated `renderChatMessage` also fires in v13, so binding both double-fires the handler (caused double-damage + double-delete). Make button handlers idempotent too.
- **Existence-check a template/doc before `.delete()`** (`scene.templates.get(id)` / `doc.parent?.templates?.get(doc.id)`) — a caught promise rejection does NOT suppress Foundry's red "X does not exist!" toast.
- **Never assign a `DerivedValueField.value`** (HP/defenses/deflect/movement/inv max) — it's a getter (`value = base + bonus`); a direct set throws "only a getter". Use `.bonus` (ADD, AE-friendly) or `.override`+`.useOverride`.
- Verify every icon path exists (Windows path) — 404 = invisible node.
- Rebuild only with Foundry closed (or `game.shutDown()` to Setup); relaunch to load packs + `module.json` changes; F5 for runtime JS/JSON.
- The `connections` array (not prose prereqs) drives drawn tree edges — and is SEPARATE from a talent's Name/prereqs, so renaming a talent requires rewriting every other talent's `connections` entry that points to it.
- Embedded talents are snapshots → ⟳ Sync after a rebuild (Sync now carries events/effects).
- `applyButtonsTo` must be a targeting mode (4) for AoE Apply to hit all targets.
- For any player-decision prompt that needs canvas targeting, use a CHAT-CARD BUTTON, not a dialog (modal blocks the canvas; non-modal can hide behind sheets).
- Hand-authored `[[damage N Type]]` enrichers need a capitalized DamageType key (Energy/Impact/Keen/Spirit/Vital/Healing).
- `@attr.<id>` (wil/pre/int/str/awa/spd) is the attribute shorthand in roll formulas (value only), NOT `@attributes.x.value`.
- **Item-embedded ActiveEffects cannot be created WITH `statuses`** (`Cannot read properties of null (reading 'startsWith')`, cosmere v2.1.0/Foundry v13.351) — create the effect first, then `update({statuses:[...]})`.
