# How every stat on an Edha character is calculated

Written 2026-09-06 for ruling **R-54** ("is 11 max health at STR 0 intended?"), at Ben's request:
*"return an instruction set/flowchart that shows how each stat is calculated on the actors."*
Everything below was read from source, not from memory: the cosmere-rpg system at **release-2.1.0**
(`src/system/documents/actor.ts`, `src/system/data/actor/{common,character}.ts`,
`src/system/utils/advancement.ts`, `src/system/config.ts`), the engine
(`module-src/scripts/register-skills.js`, the `THE EDHA DERIVED-STAT RULES` block ~L17289 and
`edhaDeriveSheetStats` ~L17314), and the two canon sources the engine itself cites:
`source-materials/legacy-uploads/Character_Building_Rules.md` §Derived stats and
`source-materials/legacy-uploads/Edha_Character_Builder.xlsx` (the Builder Reference sheet).

## 1. The answer to R-54 in one paragraph

**Canon says a level-1 character has 10 + STR health. So does the system. Health is not a stat
Edha derives differently: `EDHA_HP_BONUS = 0` in the engine
(`module-src/scripts/engine/52-green-instinct.js`), since R-54 answered (c) "remove the +1"
(2026-09-06). The constant used to be `1`, inherited from a per-actor hack on the four June
playtest PCs — the dated history is in §4.** `Character_Building_Rules.md` §HP: "L1 = 10 + STR".
The Builder Reference workbook, cell H22 of *Character Builder*:
`=10+STR+(L-1)*5+IF(L>=6,STR-1,0)+IF(L>=11,STR-2,0)+IF(L>=16,STR-3,0)`,
which is 10 + STR at level 1 and 39 + 2·STR at level 7. cosmere-rpg 2.1.0's advancement table
(`config.ts` ~L485): level 1 `health: 10, healthIncludeStrength: true`, levels 2–5 `health: 5`,
level 6 `health: 4` + STR, level 11 `3` + STR, level 16 `2` + STR — **the same table, term for term.**
The engine comment that says "the cosmere system derives all three differently" is true for
Movement and false for HP. (Senses has since gone back to the system too — R-56's
2026-09-07 reversal, §3b; **Movement is the only stat Edha still derives differently.**) The
level-gate alternative considered in §5 would have applied a bonus only above level 1, which
matches nothing in canon either. One constant; the sheet, the wizard preview, and the pinned tests
move together by design.

## 2. The pipeline — what runs, in what order, on every data prepare

Foundry re-runs this whole chain every time an actor's data is prepared (on load, after any update,
after an effect toggles). Nothing in it is stored except what is marked *stored*.

```mermaid
flowchart TD
  S["STORED sheet data (_source)<br/>attributes · level · resources · overrides · items · effects"]
  S --> B["Foundry prepareData"]
  B --> C["prepareBaseData"]
  C --> D["prepareEmbeddedDocuments<br/>items prepared; effects NOT applied yet (system's own choice)"]
  D --> E["system prepareDerivedData<br/>tier · max skill rank · currency totals"]
  E --> F["applyActiveEffects<br/>talent/trait effects ADD to .bonus fields<br/>e.g. Hardy: hea.max.bonus += level"]
  F --> G["prepareSecondaryDerivedData<br/>recovery die · HEALTH MAX = advancement table (10+STR at L1)<br/>focus max = 2+WIL · senses/lift/carry/movement ladders<br/>defenses = 10 + attribute pair · skill mods · deflect"]
  G --> H["CLAMP: every resource's current value ≤ its max"]
  H --> I["EDHA WRAPPER (libWrapper on prepareDerivedData)"]
  I --> J["edhaDeriveInvestiture<br/>inv.max = 2 + max(AWA, PRE) written as an override,<br/>persisted to the sheet once per session (R-77 gate)"]
  I --> K["edhaDeriveSheetStats<br/>hea.max.bonus += EDHA_HP_BONUS (0 since R-54), in memory only<br/>then the clamp repair · walk rate override = 20 + 5·SPD<br/>senses: NOTHING — the system's ladder above stands (R-56, item 83)"]
  K --> V["Everything reads .value = (override if useOverride, else derived) + bonus"]
  J --> V
```

Two facts about this chain explain most past bugs:

- **The system applies Active Effects inside `prepareDerivedData`, after the base derivation,** so
  an effect can read derived numbers. Side effect: a bare second `prepareData()` re-adds every
  ADD-mode effect (bench run 36's 64 ↔ 57 max-HP flip). `reset()` is the restore.
- **The system clamps current resources to their max BEFORE the Edha wrapper runs.** So a max the
  wrapper raises afterwards is a point the clamp already removed. That is why the +1 was
  unreachable for a month (13/14 forever) until fix pass E re-ran the clamp from `_source`.
  Since R-54 (c) removed the +1 (2026-09-06, `EDHA_HP_BONUS = 0`), that repair is now a no-op by
  construction.

**Every derived number is a `DerivedValueField`:** `{derived, override, useOverride, bonus}` with a
getter-only `.value = (useOverride ? override : derived) + bonus`. The engine reads these only
through `edhaDerivedNum()`. "Value" is never stored; `derived` is recomputed every prepare;
`override`/`useOverride`/`bonus` are stored on the sheet — and effects add to `bonus` in memory.

## 3. Every stat, side by side

Attribute values below are the sheet's `value` (assigned points). Where the system reads
`value + bonus` it is written as such; note that health, focus, and defenses read the bare value
on purpose (system comment: "Should only be the value, not include the bonus").

| Stat | Edha canon (rules doc + builder workbook) | cosmere-rpg 2.1.0 | Edha engine layer | Talent/trait effects on it (count in `data/`) |
|---|---|---|---|---|
| **Attributes** STR SPD INT WIL AWA PRE | assigned points (12 at L1, +1 at L3, L6, …) | stored `value`; effects add `bonus` | none | `str.bonus` 1, `spd.bonus` 1 (Stitchmother Phase 2) |
| **Max Health** | L1 **10 + STR**; L2–5 +5; L6 4 + STR; L7–10 +5; L11 3 + STR; L12–15 +5; L16 2 + STR; L17–20 +5 (= 39 + 2·STR at L7) | **identical**: `deriveMaxHealth` sums the advancement rules into `hea.max.derived` | `+ EDHA_HP_BONUS` to `hea.max.bonus` in memory every prepare — **0 since R-54 (c), 2026-09-06** (was `1`; kept as a constant so a future change is one line), skipped while the sheet stores a manual bonus; then the clamp repair | `hea.max.bonus` 8 (Hardy ×3 colours: +level; Stitchmother +20; Unbreakable Line; …) |
| **Current Health** | — | clamped to max at the end of secondary derivation, before the Edha wrapper adds `EDHA_HP_BONUS` (0 since R-54) | clamp repair hands back the stored point (a no-op now that the bonus is 0) | — |
| **Max Focus** | 2 + WIL | 2 + WIL (value) | none | `foc.max.bonus` 6 (Composed +2, …) |
| **Max Investiture** | 2 + max(AWA, PRE), only if attuned | **not derived for characters** — a manual field | `edhaDeriveInvestiture`: override = 2 + max(AWA, PRE); current clamped; override persisted to the sheet once per session, non-primary GMs defer (R-77) | none |
| **Defenses** PHY / COG / SPI | 10 + STR+SPD / 10 + INT+WIL / 10 + AWA+PRE | **identical** (attribute values) + `bonus` | read-only (`edhaReadDefense`); `edha-defense-buff` applies scene/turn buffs as effects | `defenses.*.bonus`: phy 6, cog 10, spi 12 (Customary Garb, Collected, …) |
| **Movement** (walk) | 20 + 5·SPD ft | ladder `[20,25,30,40,60,80][ceil((SPD+bonus)/2)]` | **override = 20 + 5·SPD** (SPD value), unless the sheet already carries its own override; effect bonuses add on top via the getter | `walk.rate.bonus` 5 (Surefooted +10, Walking Ruin, …), `walk.rate.override` 1 (Siege Form 0) |
| **Senses range** | Edha canon named AWA 0→10, 1→15, 2–3→20, 4→25, 5–6→30 ft — **superseded, see §3b** | ladder `[5,10,20,50,100,∞][ceil((AWA+bonus)/2)]` | **NONE since item 83 (R-56 final, 2026-09-07).** The engine writes nothing to `senses.range`; the system's own value stands for every actor type. A hand-set override still wins (an adversary block's `senses` is written as exactly that) and bonus still adds, because both sit above `.derived`. The token's sight range is stamped from a copy of the *same* ladder (`edhaSensesRangeFtFromAwa` for new/edited actors, `advSensesRangeFt` in the build for the pack) | none |
| **Recovery die** | WIL 0–1 d4, 2–3 d6, 4–5 d8, 6–7 d10 | `[d4,d6,d8,d10,d12,d20][ceil((WIL+bonus)/2)]` — same to WIL 6; **WIL 7+ gives d12 where canon says d10** | none (wizard preview mirrors the system ladder) | none |
| **Lift / Carry** | not in canon | `[100,200,500,1000,5000,10000]` / `[50,100,250,500,2500,5000]` by ceil((STR+bonus)/2) lb | none | none |
| **Deflect** | — | max(natural, best equipped armour) | none | Guardian Stance +1 Deflect (toggled effect) |
| **Skill modifier** | rank + attribute | rank + (value + bonus) | none | — |
| **Skill-rank budget** | 5 + (L−1)·2 | advancement table (4 at L1) | wizard and sheet budget bar use the Edha number | — |
| **Tier / max skill rank** | table: T1 L1–5 (max 2), T2 L6–10 (3), … | same table | none | — |

Net for a fresh level-1 character with every attribute 0 (as of item 83): **Health 10** (R-54
removed the +1 — engine, canon and system now agree), Focus 2, Investiture 2, defenses 10/10/10,
Move 20 ft (the one stat Edha still overrides), **Senses 5 ft** (the system's own ladder — see §3b),
Recovery d4.

### 3a. Adversaries (item 55, R-56 (a), 2026-09-06 — then item 83, below)

Adversary actors run the same `prepareDerivedData` wrapper. **Since item 83 none of the Edha layer
applies to them at all**: `edhaDeriveSheetStats` returns at `actor.type !== "character"` before it
does anything, because the senses write that used to sit above that guard is gone. HP and Speed were
always PC-only (adversary blocks carry explicit `hp` / `movement` overrides from the build instead).
Adversary blocks have no attributes (all 0), so the system's ladder gives **5 ft** — the same number
the build stamps on the pack's prototype token via `advSensesRangeFt(adv)`, so sheet and token agree
(**52/52** at the item-83 rebuild); a block's `senses` field is the bespoke override on both
(Briar-Gone Grove, 30 ft). The ready-time refresh sweep still resets every actor, not just
characters — that scope was widened at item 55 and kept, but it is now only a re-render, since
nothing in the Edha layer writes an adversary's senses.

### 3b. The Senses Range reversal — the whole history in one place (R-56)

This number moved three times, so read the sequence before changing it again:

| When | Rule on the sheet | Rule on the token | Why |
|---|---|---|---|
| before 07-28i | the system's ladder (nothing wrote it) | the Edha table (PCs); a **flat 10** (pack adversaries) | the sheet was the only surface still on the system's number — bench run 21 reported it as a preview/sheet drift |
| 07-28i (fix pass E) | **Edha table**, characters only | unchanged | `Character_Building_Rules.md` §Senses Range was read as canon, so the sheet was moved to it |
| item 55 / R-56 **(a)**, 2026-09-06 (PR #240) | **Edha table**, every actor type | Edha table everywhere (the flat 10 removed) | one rule for PCs and adversaries — bench run 22 had measured three surfaces disagreeing about the same creature (47/47 world, 52/52 pack) |
| **item 83 / R-56 FINAL, 2026-09-07** | **the system's ladder**, every actor type — *and the engine writes nothing* | the system's ladder everywhere | Ben, verbatim: *"Cosmere ladder for everyone."* |

The final shape is worth stating precisely, because it is not symmetrical with the others: the
system's `CommonActorDataModel.prepareSecondaryDerivedData` (cosmere-rpg 2.1.0 `index.js:8455-8457`;
`SENSES_RANGES = [5,10,20,50,100,Number.MAX_SAFE_INTEGER]` and `awarenessToSensesRange` at
`:8534-8538`) **already writes this ladder for both actor models** — `CharacterActorDataModel`
supers into it (`:17628`), `AdversaryActorDataModel` (`:25877`) inherits it. So the sheet half of
item 83 was a **deletion**, not a re-tabling, and the system's reading of AWA as `value + bonus`
(which the Edha copy never had) comes back with it. The engine keeps one copy of the ladder,
`edhaSensesRangeFtFromAwa`, purely for the two surfaces the system does not derive — the token-sight
stamp (`edhaPcSightShape` → `preCreateActor` / `updateActor` / `edha.fixPcTokens()`) and the
creation wizard's preview — and the build keeps a third, `sensesRangeFtFromAwa` in
`scripts/foundry-build-parts.js`, for the pack's prototype tokens.
`tests/adversary-senses.test.js` pins the build copy against the engine copy term-for-term at
AWA 0–10 so they cannot drift apart again.

⚠️ **Sheets and tokens deploy differently.** The sheet number is derived every prepare, so an
**F5 alone** moves every existing actor, PC and adversary. A token's `sight.range` is *stored*, so
it does not: pack adversaries are re-stamped by the REBUILD + ⟳ Sync Adversaries, and existing PC
tokens need `edha.fixPcTokens()` (or any AWA edit, which re-fires the `updateActor` watcher).

## 4. Where the +1 came from — the history, dated

1. **2026-05-17** — Ben's reference sheets for the four playtest PCs (level 7).
2. **2026-06-10** — the pregens are built in Foundry "stats sheet-matched (HP/inv/movement)"
   (handoff §8a). To match the sheets' health each actor was given a **hand-set
   `hea.max.bonus: 1`** on its own sheet. *The May-17 sheets are not in the repo, so why they were
   one point above the formula cannot be checked here.*
3. **2026-06-11b** — the V3 engine pass generalizes the per-actor hack into a rule for every
   character: "HP = system + 1", applied in memory, with `edha.migrateDerivations()` to strip the
   stored per-actor bonuses so nothing double-applies.
4. **2026-07-19z** — the creation wizard shows a fresh actor at 10/11 before any pick. The +1 is
   blamed on a phantom transfer effect riding a basic action; transfer effects are stripped from
   action copies. That was not the cause (run 21 later measured zero transfer effects), but the
   strip was harmless.
5. **2026-07-28i** (fix pass E, bench run 21) — root cause found: the engine's own +1, plus the
   clamp-ordering bug that made the extra point unreachable (13/14). Clamp repaired; the constant
   is named `EDHA_HP_BONUS` and shared by sheet, wizard preview and tests; **R-54 filed** asking
   whether 11 is intended.
6. **2026-09-06** (this trace) — both canon sources and the system agree on 10 + STR at level 1.
   The +1 has no source other than step 2.

## 5. What a "level gate" is, and the three options that were on the table

A **level gate** is a condition on the level: `if (actor.system.level > 1) bonus += 1`, so a bonus
would apply from level 2 up while a level-1 character would still read 10. It is a hack on a
hack — canon has no such bonus at level 2 either.

| Option | Engine change | Level-1 STR-0 health | Matches canon? | Side effects |
|---|---|---|---|---|
| (a) keep 11 | none | 11 | no | the "+1 max health" checklist row would have been rewritten to expect 11 |
| (b) level gate | add the condition | 10 (11+ from L2) | no | two formulas to explain; preview and tests would have carried the gate too |
| **(c) remove the +1 — chosen (R-54 (c), 2026-09-06)** | `EDHA_HP_BONUS = 0` (one constant) | **10** | **yes**, and equals the system | every character's max dropped by 1 on the next prepare; a character at full health was clamped by 1; nothing stored changed; the clamp repair became a no-op; the June pregens that still store a manual bonus keep it until `edha.migrateDerivations()` runs; the checklist row's original "10/10" target became reachable; the engine comment "derives all three differently" was corrected to two |

Ben picked **(c)** on 2026-09-06 (R-54): the two neighbouring **bugs** stayed bugs regardless (the
wizard's derived-stat preview must promise what the sheet will show, and the finish step's top-up
must re-read after the derivation settles) — both were fixed independently of this ruling.

## 6. Where to look (for the next agent)

- Engine — **edit the per-section sources under `module-src/scripts/engine/`, never the assembled
  `register-skills.js`** (item 4; run `node scripts/engine-assemble.js` and commit both). Line
  numbers below are in the assembled file as of 2026-09-07 and drift — grep the name:
  `EDHA_HP_BONUS` / `edhaWalkRateFtFromSpd` (~L18622) and `edhaDeriveSheetStats` (~L18640) +
  `edhaDeriveInvestiture` and the wrapper install in `Hooks.once("ready")` just below it, all in
  `engine/52-green-instinct.js`; `EDHA_SENSES_RANGES_FT` / `edhaSensesRangeFtFromAwa` (~L11246) and
  `edhaAwaForSenses` (~L11254) in `engine/32-senses-light-visibility.js`; `edhaCwSensesCell`
  (~L9456) and `edhaCwDerivedPreview` (~L9478) in `engine/24-the-character-creation-wizard.js`;
  `edhaReadDefense`, `edhaDerivedNum`.
- Build-side copy of the senses ladder (the pack's prototype-token sight): `sensesRangeFtFromAwa`
  and `advSensesRangeFt` in `scripts/foundry-build-parts.js`.
- System (read-only clone, release-2.1.0): `src/system/documents/actor.ts` `prepareDerivedData`
  (~L292: super → `applyActiveEffects` → `prepareSecondaryDerivedData`);
  `src/system/data/actor/common.ts` `prepareSecondaryDerivedData` (~L685) and the four ladders
  beneath it; `src/system/data/actor/character.ts` (~L93, health/focus/recovery);
  `src/system/utils/advancement.ts` `deriveMaxHealth`; `src/system/config.ts` `advancement.rules`.
- Canon: `source-materials/legacy-uploads/Character_Building_Rules.md` §Derived stats, §HP,
  §Recovery Die, §Senses Range; `Edha_Character_Builder.xlsx` → *Character Builder*!H22 and
  *Reference*!G4:H24.
- Tests pinning the shared helpers: `tests/` (grep `EDHA_HP_BONUS`, `edhaSensesRangeFtFromAwa`).
