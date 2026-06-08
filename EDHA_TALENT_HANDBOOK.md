# Edha Talent System — Authoring Handbook

*How to create and edit Edha talents now that their behaviors live as native Foundry **Events** (`system.events`) and **Effects** (ActiveEffects) on each talent. Companion to `EDHA_FOUNDRY_HANDOFF.md` (operations) — this doc is the day-to-day "how do I build a talent" reference.*

Last updated: 2026-06-08 (post Event/Effect refactor).

---

## Contents

1. [What the refactor changed (review)](#1-what-the-refactor-changed-review)
2. [Mental model: where a talent's behavior lives](#2-mental-model-where-a-talents-behavior-lives)
3. [Two ways to edit — and which is the real one](#3-two-ways-to-edit--and-which-is-the-real-one)
4. [The talent sheet, tab by tab](#4-the-talent-sheet-tab-by-tab)
5. [The DETAILS tab — making a talent roll](#5-the-details-tab--making-a-talent-roll)
6. [The EVENTS tab — the heart of the system](#6-the-events-tab--the-heart-of-the-system)
   - [6a. The Event (trigger) dropdown — every option](#6a-the-event-trigger-dropdown--every-option)
   - [6b. The Handler (effect) dropdown — every option + its fields](#6b-the-handler-effect-dropdown--every-option--its-fields)
   - [6c. Tying an effect to the TALENT vs the ACTOR](#6c-tying-an-effect-to-the-talent-vs-the-actor)
   - [6d. Who the effect lands on (target resolution)](#6d-who-the-effect-lands-on-target-resolution)
7. [The EFFECTS tab — passive numeric buffs](#7-the-effects-tab--passive-numeric-buffs)
8. [The source tables (the durable authoring path)](#8-the-source-tables-the-durable-authoring-path)
9. [Recipes — copy/paste starting points](#9-recipes--copypaste-starting-points)
10. [Creating a brand-new talent from scratch](#10-creating-a-brand-new-talent-from-scratch)
11. [Build → sync → verify cycle](#11-build--sync--verify-cycle)
12. [Formula cookbook](#12-formula-cookbook)
13. [Gotchas & troubleshooting](#13-gotchas--troubleshooting)
14. [The `edha.*` console API](#14-the-edha-console-api)

---

## 1. What the refactor changed (review)

**Before:** every non-roll talent behavior (triggered effects, riders, Temp HP, summons, AoE, dangerous terrain) lived in a *parallel* system — global hooks in `register-skills.js` reading flat JSON tables. The talent's own **Events** and **Effects** tabs in Foundry were empty, so you couldn't see or edit a talent's behavior from its sheet.

**After (this refactor):** each behavior is emitted as a **native rule** on the talent itself:

- A triggered/active behavior → an entry in the talent's `system.events` map, shown on the **Events** tab. Each rule = a **trigger** ("when X happens") + a **handler** ("do Y"), both chosen from dropdowns, with an auto-rendered config form.
- A passive numeric buff → a native **ActiveEffect** in the talent's `effects`, shown on the **Effects** tab.
- The roll (skill test + damage) stays on the **DETAILS** tab as `system.activation` / `system.damage`.

To make this work, `register-skills.js` registers **custom event types** (`edha-deal-damage`, `edha-on-defeat`, `edha-pre-deal-damage`) and **custom handler types** (`edha-triggered-effect`, `edha-damage-rider`, `edha-aoe-template`, `edha-place-hazard`, `edha-temp-hp`, `edha-summon`) plus a **Region behavior** (`edha-content.hazard`, "dangerous terrain"). The generator `foundry-build.js` reads the behavior tables in `data/` and bakes each entry into the matching talent's `events`/`effects`.

**State:** all 21 trees rebuilt with native events; pilot trees (Red/Conflagration, Destruction incl. dangerous-terrain Region) verified live in Foundry v13.351. **One known bug:** ActiveEffects baked into the *compendium* item get stripped on pack load, so passive buffs (e.g. Walking Ruin +Speed) don't yet apply automatically — fix deferred to applying them at add/sync time. Everything on the Events tab works.

**The old global hooks still exist** but are guarded — they skip any talent that already carries a native `edha-*` rule, so nothing fires twice. They're a safety net for un-synced owned talents and will be deleted once every character is synced.

---

## 2. Mental model: where a talent's behavior lives

A talent is a Foundry **Item** of type `talent`. Its behavior is split across three surfaces:

| Surface | Foundry data | Sheet tab | What it's for |
|---|---|---|---|
| **The roll** | `system.activation`, `system.damage` | **DETAILS** | The d20 skill test and/or the damage/heal dice the talent rolls when you click it. |
| **Triggered / active behavior** | `system.events` (a map of rules) | **EVENTS** | "When *trigger*, do *effect*." Secondary damage, AoE, Temp HP, summons, dangerous terrain, granting items, etc. |
| **Passive numeric buff** | `effects` (ActiveEffects) | **EFFECTS** | Always-on stat changes while the talent is owned (+Speed, +Deflect, …). |

A single talent can use any combination: a roll on DETAILS, one or more rules on EVENTS, and one or more ActiveEffects on EFFECTS.

Everything is **keyed by the talent's exact name**. The generator looks up `Searing Bolt` in `talent-rolls.json`, `Arc Flash` in `talent-triggers.json`, etc. Spelling/case must match the talent's `name`.

---

## 3. Two ways to edit — and which is the real one

There are two places you *can* edit a talent. They are not equal.

### A) In Foundry, on the talent sheet (transient — for experimenting)
Open the talent → Events/Effects/Details tab → add/change a rule with the dropdowns and forms. This is great for **learning what a field does** and **prototyping**, and it takes effect immediately.

⚠️ **Any in-sheet edit is wiped the next time you run `node foundry-build.js`.** The generator rewrites the whole compendium from the source data. So hand-edits in Foundry are throwaway unless you also fold the change back into the source tables.

### B) In the source data, then rebuild (canonical — the source of truth)
Edit the JSON in `…/Skilltrees/data/` (the talent text files and the behavior tables), run the generator, and re-sync. **This is the real authoring path** — it's reproducible, validated, and survives rebuilds.

> **Rule of thumb:** prototype on the sheet to see what you want, then write the final version into the source tables and rebuild. The handbook teaches both: §4–§7 describe the sheet (so you understand the dropdowns); §8–§9 describe the source tables (so your work is durable).

---

## 4. The talent sheet, tab by tab

When you open a talent in Foundry you'll see (among others) these tabs:

- **Description** — the rules text players read. Generated from the talent's `description` field (+ an Activation/Cost header the generator prepends).
- **Details** — activation type, cost, skill test, damage. See §5.
- **Effects** — ActiveEffects (passive buffs). See §7.
- **Events** — the trigger→handler rules. See §6. *This is the tab the refactor populated.*

The **Events** tab shows a list of rules. Each row has a **description** (free text you write), a **trigger** (the Event dropdown), and a **handler** (the Handler dropdown). Click a rule to open its editor; the handler's config form **auto-renders from its schema** — no template needed, every field shows up with its label and hint.

---

## 5. The DETAILS tab — making a talent roll

The roll is controlled by two source fields in `talent-rolls.json` (keyed by talent name), which the generator turns into `system.activation` + `system.damage`.

| Field | Meaning | Maps to |
|---|---|---|
| `testSkill` | Skill id for a d20 test. Leyline color (`white`/`blue`/`black`/`red`/`green`) **or** a standard skill (`hwp`, `ath`, `prc`, …). | `activation.type = "skill_test"`, `activation.skill` |
| `testAttribute` | `"default"` (the skill's default attribute) or a specific attribute id. Only used with `testSkill`. | `activation.attribute` |
| `modifierFormula` | Optional flat/dice bonus added to the d20. | `activation.modifierFormula` |
| `damageFormula` | The damage/heal dice. See the [formula cookbook](#12-formula-cookbook). | `system.damage.formula` |
| `damageType` | `energy` \| `impact` \| `keen` \| `spirit` \| `vital` \| `heal` | `system.damage.type` |
| `grazeOverrideFormula` | Optional formula used on a graze / save-for-half. | `system.damage.grazeOverrideFormula` |

**Two roll shapes — this distinction matters:**

- **With `testSkill` → a skill test.** The talent rolls a d20 vs the target's three defenses, *and the engine automatically adds that skill's modifier (rank + attribute) to the damage*. Full hit = dice + skill mod; graze = dice only (flat mods are stripped on a graze, by cosmere default). Use this for attacks like Searing Bolt (`testSkill: "red"`).
- **Without `testSkill` → a damage-only roll.** No d20, no auto skill mod — just the raw dice. Use this for heals, AoE bursts, and secondary/triggered damage where there's no attack roll, e.g. Mending Aura (`damageType: "heal"`, no `testSkill`).

If a talent has **no** entry in `talent-rolls.json`, it's non-rolling: clicking it just posts its description and pays its cost (cost/activation come from the talent's `action`/`cost` text in the atlas file, parsed by the generator).

> **`heal` damage type:** rolls the restore amount; apply it with the chat card's **green heal button**, not the red damage buttons.

---

## 6. The EVENTS tab — the heart of the system

A **rule** answers two questions:

1. **When should it fire?** → the **Event** (trigger) dropdown.
2. **What should happen?** → the **Handler** (effect) dropdown, then fill its config fields.

In the source data each rule looks like this (the generator builds it for you):

```jsonc
{
  "id": "<stable id>",
  "description": "After you deal energy damage, may spend 1 Investiture to arc…",
  "event": "edha-deal-damage",          // ← the trigger
  "handler": {
    "type": "edha-triggered-effect",    // ← the effect
    "kind": "damage", "formula": "floor((@tier)d(2*@skills.red.rank+2)/2)",
    "damageType": "energy", "target": "prompt",
    "costResource": "inv", "costValue": 1, "costOptional": true,
    "oncePerRound": true
  }
}
```

In the sheet, `event` is the **Event** dropdown, `handler.type` is the **Handler** dropdown, and the rest of `handler.*` are the auto-rendered form fields.

### 6a. The Event (trigger) dropdown — every option

The dropdown lists the **system's built-in events** plus **our Edha-custom events**. Only a subset is useful for talents; the most-used ones are marked ★.

**Edha-custom (registered by `register-skills.js`):**

| Dropdown label | id | Fires when… | Scope |
|---|---|---|---|
| ★ Edha: After You Deal Damage | `edha-deal-damage` | *Any* of the owner's items rolls damage (hook `cosmere-rpg.damageRoll`). | **Actor** (see §6c) |
| ★ Edha: When You Defeat a Creature | `edha-on-defeat` | A creature you damaged drops to 0 HP (hook `cosmere-rpg.applyDamage`, victim HP ≤ 0; killer resolved). | **Actor** |
| Edha: Passive Damage Rider | `edha-pre-deal-damage` | *(Sentinel — never actually fires.)* It's a visible marker for damage riders; the bonus is applied by the rollDamage wrapper reading the rule. | Marker only |

**Built-in cosmere events (the useful ones for talents):**

| Dropdown label | id | Fires when… |
|---|---|---|
| ★ Used | `use` | This talent is used/rolled. **The everyday "on activation" trigger** — AoE, Temp HP, summon, dangerous terrain all hang off this. |
| Added to Actor | `add-to-actor` | This item is added to an actor. (Used by path items to grant their Key + Draw Mana.) |
| Removed from Actor | `remove-from-actor` | This item is removed. (Path items remove the Key on path removal.) |
| Actor Damaged | `apply-damage-actor` | Damage is applied to the owner. (A "when you take damage" trigger.) |
| Actor Gained Injury | `apply-injury-actor` | An injury is applied to the owner. |
| Actor Updated | `update-actor` | The owner actor is updated. |
| Actor Short/Long Rested | `short-rest-actor` / `long-rest-actor` | The owner rests. |
| Equipped / Unequipped | `equip` / `unequip` | Item equipped/unequipped (for gear; rarely relevant to talents). |
| Activated/Deactivated Modality | `mode-activate` / `mode-deactivate` | A modality item's mode toggles. |
| Created / Updated / Deleted | `create` / `update` / `delete` | Item lifecycle. |
| Goal Completed / Progressed | `goal-complete` / `goal-progress` | For Goal items only. |

> **Key idea:** `use` = "when I activate *this* talent." `edha-deal-damage` / `edha-on-defeat` / `apply-damage-actor` = "when *the character* does something (with any item)." That difference is exactly the talent-vs-actor tie — see §6c.

### 6b. The Handler (effect) dropdown — every option + its fields

The dropdown lists **our Edha handlers** plus the **system's built-in handlers**.

#### Edha custom handlers

**Edha: Triggered Effect** (`edha-triggered-effect`) — the workhorse. Deal damage / AoE / heal / Temp HP / affliction when the rule fires.

| Field | Type | Notes |
|---|---|---|
| Effect kind | `damage` \| `damage-aoe` \| `heal` \| `thp` \| `affliction` | What happens. `damage-aoe` hits everything within `radius` of the target/victim. `affliction` applies the **Afflicted** status + chats the ongoing amount. |
| Formula | text | Dice/amount, resolved against the **owner's** roll data. e.g. `floor((@tier)d(2*@skills.red.rank+2)/2)`. |
| Damage type | `energy`/`impact`/`keen`/`spirit`/`vital`/`heal` | For `heal`/`thp` use `heal`. |
| Target | `self` \| `victim` \| `near-victim` \| `prompt` | Who it lands on — see §6d. |
| AoE radius (ft) | number | Only for `damage-aoe` / `near-victim`. |
| Resource gained / amount | `inv`/`foc` + N | Optional: owner regains this when it fires (e.g. Predator's Due → +1 Investiture). |
| Cost resource / amount | `inv`/`foc`/`opportunity` + N | Optional cost to fire. |
| Optional cost (prompt) | bool | If on, the player gets a **chat-card "spend?" button** (not a blocking dialog) — so they can target the canvas first. |
| Once per round | bool | Caps it to one fire per combat round (`flags.edha-content.trigRound`). Unrestricted out of combat. |
| Note | text | Shown to players. |

**Edha: Damage Rider** (`edha-damage-rider`) — passively adds bonus damage to the owner's *matching* damage rolls (the rule is read by the rollDamage wrapper; pair it with the `edha-pre-deal-damage` marker event).

| Field | Notes |
|---|---|
| Applies to damage type(s) | `any` or a comma-list: `energy, impact, keen, spirit, vital`. |
| Bonus formula | Added to the damage, e.g. `@skills.red.mod` or `(1 + @tier)`. **Always-on while owned**; flat adds are stripped on a graze. Only use for genuinely unconditional "when you deal X damage" riders. |

**Edha: AoE Template** (`edha-aoe-template`) — on use, drops a `[Size]` burst and auto-targets the captured tokens so the talent's own damage/heal card applies to all with one Apply. Pair with the `use` event.

| Field | Notes |
|---|---|
| Size scales with leyline rank | If on, radius = `[2.5,5,10,15,20]` ft by the color's rank. |
| Fixed size (ft) | Used when not scaling by rank. |
| Affects | `enemies` \| `allies` \| `all` \| `none` (terrain: draws the circle, doesn't auto-target). |
| Color | Override for scaling/tint; usually auto-derived from the talent's formula. |

**Edha: Place Dangerous Terrain** (`edha-place-hazard`) — drops a scene-long Region (`edha-content.hazard`) that damages tokens on enter / start-of-turn. **GM-side** (creating Regions needs GM permission). Pair with `use`.

| Field | Notes |
|---|---|
| Size scales with leyline rank / Fixed size (ft) | Radius. |
| Damage formula | Resolved against the caster at placement and baked to literal dice. |
| Damage type | `energy`/`impact`/`keen`/`spirit`/`vital`. |
| Color | Size scaling / region tint. |

**Edha: Grant Temp HP** (`edha-temp-hp`) — roll a formula on use and set it as the target's Edha Temp HP (one source at a time; overwrites; spent before normal HP). Pair with `use`.

| Field | Notes |
|---|---|
| Temp HP formula | e.g. `(@tier)d(2*@skills.black.rank+2)+@attr.pre`. |
| Target | `targeted` (first target, else selected token) or `self`. |

**Edha: Summon** (`edha-summon`) — spawn an `adversary` token scaled to the caster on use. **GM-side.** Pair with `use`.

| Field | Notes |
|---|---|
| Summon name / Token image | Display + icon (icon must exist under Foundry data/system icons). |
| HP formula | Max HP, resolved against the caster. |
| Speed (ft) | Movement rate. |
| Defenses = caster − N | Each defense = caster's minus N. |
| Condition immunities | Comma list (only *native* cosmere statuses take effect; custom ones noted in bio). |
| Attack name / formula / type / range | Optional baked attack item (literal dice, since the summon has no skills). |
| Acts on caster's initiative | Adds it to combat on your turn. |

#### Built-in cosmere handlers (also in the dropdown)

These are the system's own — handy for non-combat talent wiring:

| Label | id | Use |
|---|---|---|
| Grant Items / Remove Items | `grant-items` / `remove-items` | Add/remove other items (talents, actions) when the rule fires. **This is how path items grant the Key talent + Draw Mana** on `add-to-actor`. |
| Grant / Remove Expertises | `grant-expertises` / `remove-expertises` | Weapon/armor/etc. expertises. |
| Modify / Set Attribute | `modify-attribute` / `set-attribute` | Change an attribute (or its bonus). |
| Modify / Set Skill Rank | `modify-skill-rank` / `set-skill-rank` | Change a skill rank. |
| Update Actor / Update Item | `update-actor` / `update-item` | Apply an arbitrary data change. |
| Use item | `use-item` | Trigger another item's use. |
| Execute Macro | `execute-macro` | **Escape hatch:** run any macro. In the macro, `event.item` = the talent, `event.item.actor` = the owner, `event.options` = the trigger payload. Use this for one-off logic no handler covers. |

### 6c. Tying an effect to the TALENT vs the ACTOR

This is the part that trips people up, so here it is plainly.

**Every rule physically lives on one talent** (in that talent's `system.events`). What varies is *whose action triggers it* — and that's decided by the **Event** you pick:

- **Tied to the talent (self-triggered):** pick **`use`** (or an item-lifecycle event). The rule fires **only when that exact talent is activated.** All the "on use" Edha handlers — AoE Template, Temp HP, Summon, Place Dangerous Terrain — work this way. The behavior belongs to the talent it's written on.

- **Tied to the actor (owner-triggered):** pick **`edha-deal-damage`** or **`edha-on-defeat`** (or a built-in actor event like `apply-damage-actor`). These events' transforms return the **owning actor**, so the system **fans the rule out across every item the actor owns** and fires it whenever *the character* does the triggering thing — with *any* weapon or talent, not just this one.

  *Worked example:* **Arc Flash** is a passive talent. Its rule uses `edha-deal-damage`. When the character rolls energy damage with **Searing Bolt** (a different talent), the engine checks all the character's items, finds Arc Flash's rule, sees the damage type matches `energy`, and fires it. Arc Flash never gets "used" directly — it reacts to the *actor* dealing damage. That's the actor-level tie.

So: **"when I press this button" → `use`. "whenever this character does X" → an Edha actor event.** Under the hood the difference is whether the event's `transform` returns the Item (this talent only) or the Actor (all the owner's items). You don't write that — it's baked into the event type — you just pick the right Event from the dropdown.

> In a handler executor, `event.item` is always the talent carrying the rule and `event.item.actor` is its owner. For actor-scoped events, `event.options` carries the payload — e.g. `event.options.roll` / `sourceItem` for deal-damage, `event.options.victim` for on-defeat.

### 6d. Who the effect lands on (target resolution)

Separate from *what fires* the rule is *who it affects*. For **Edha: Triggered Effect**, the **Target** field decides:

| Target | Lands on |
|---|---|
| `self` | The owner (e.g. Predator's Due heals you on a kill). |
| `victim` | The creature that triggered it (the thing you defeated / the damaged creature). |
| `near-victim` | Every token within `radius` ft of the victim (AoE around the kill). |
| `prompt` | Your **currently targeted** token(s), minus the primary victim. Use this for "arc to a 2nd creature you pick." Combine with `Optional cost (prompt)` so the player targets the canvas, then clicks the chat button. |

For the other handlers, the target is implied: **Temp HP** uses `targeted`/`self`; **Summon**/**Hazard** drop near/at the caster or target; **AoE Template** captures tokens inside the burst centered on your first target and auto-targets them for the card.

---

## 7. The EFFECTS tab — passive numeric buffs

For always-on stat changes (no trigger), use a native **ActiveEffect** instead of an event. Source: `talent-effects.json`, keyed by talent name.

```jsonc
"Walking Ruin": [{
  "label": "Walking Ruin — Speed",
  "icon": "icons/svg/upgrade.svg",
  "changes": [
    { "key": "system.movement.walk.rate.bonus", "mode": 2, "value": 10 }
  ],
  "description": "Destruction (Razkael). +10 ft Speed."
}]
```

- **`changes[]`** is the list of stat edits. Each is `{ key, mode, value }`.
- **`key`** is an actor data path. For derived numeric values, add via the `.bonus` subfield: `system.movement.walk.rate.bonus`, `system.defenses.phy.bonus`, etc.
- **`mode`** `2` = ADD (the default; what you'll use almost always). Other Foundry modes: 1 MULTIPLY, 4 OVERRIDE, 5 UPGRADE.
- `transfer: true` (set by the generator) = the effect applies to the owner while the talent is owned.

> ⚠️ **Known bug (deferred):** ActiveEffects baked into the *compendium* item are stripped on pack load, so a freshly-built passive buff like Walking Ruin's +Speed won't apply until the fix lands (create the AE on the owned talent at add/sync time instead of baking it). Until then, treat baked passive buffs as "tracked manually." Event-tab behaviors are **not** affected by this — only the Effects tab.

---

## 8. The source tables (the durable authoring path)

All in `…/Skilltrees/data/`, each keyed by **exact talent name**, each read by `foundry-build.js` and emitted as a native rule/effect. Each file has a `_README` with the full field list — read it before editing.

| File | Becomes | Emitted as |
|---|---|---|
| `talent-rolls.json` | Skill test + damage (DETAILS tab) | `system.activation` / `system.damage` |
| `talent-triggers.json` | Triggered effects | `edha-triggered-effect` on `edha-deal-damage` / `edha-on-defeat` |
| `talent-riders.json` | Passive damage riders | `edha-damage-rider` (marker event `edha-pre-deal-damage`) |
| `talent-targeting.json` | AoE bursts (+ range-ring preview, which needs no data) | `edha-aoe-template` on `use` |
| `talent-thp.json` | Temp HP grants | `edha-temp-hp` on `use` |
| `talent-summons.json` | Summon stat blocks | `edha-summon` on `use` |
| `talent-hazards.json` | Dangerous terrain | `edha-place-hazard` on `use` → `edha-content.hazard` Region |
| `talent-effects.json` | Passive numeric buffs (EFFECTS tab) | native ActiveEffect |

The talent's **text/identity** (name, action, cost, prerequisites, description, flavor, tags, layout, connections) lives in the atlas files: `leyline.json` (5 colors), `domain.json` (10 deities), `cosmere.json` (6 heroic paths). See §10.

> Draw Mana's color riders and the Investiture formula (`2 + max(AWA, PRE)`) are **hardcoded** in `register-skills.js` (small fixed canon), not in a table.

---

## 9. Recipes — copy/paste starting points

Each recipe = add the keyed entry to the named source file, then [rebuild + sync](#11-build--sync--verify-cycle). Replace the talent name and the color/formula to taste.

**A single-target attack** (d20 vs defenses, `[Tier][Die]` damage) — `talent-rolls.json`:
```jsonc
"Frost Lance": {
  "testSkill": "blue", "testAttribute": "default",
  "damageFormula": "(@tier)d(2 * @skills.blue.rank + 2)", "damageType": "keen"
}
```

**A heal** (no attack roll, raw dice) — `talent-rolls.json`:
```jsonc
"Verdant Mend": {
  "damageFormula": "(@tier)d(2 * @skills.green.rank + 2) + @attr.awa",
  "damageType": "heal"
}
```

**An "after you deal fire damage, arc to a 2nd target" trigger** — `talent-triggers.json`:
```jsonc
"Arc Flash": {
  "on": "deal-damage",
  "when": { "damageType": "energy" },
  "cost": { "resource": "inv", "value": 1, "optional": true },
  "oncePerRound": true,
  "effect": { "kind": "damage", "formula": "floor((@tier)d(2 * @skills.red.rank + 2) / 2)",
              "damageType": "energy", "target": "prompt" }
}
```

**An "on kill, AoE around the corpse" trigger** — `talent-triggers.json`:
```jsonc
"Chain Detonation": {
  "on": "kill", "when": {}, "oncePerRound": true,
  "effect": { "kind": "damage-aoe", "formula": "floor((@tier)d(2 * @skills.red.rank + 2) / 2)",
              "damageType": "energy", "target": "near-victim", "radius": 5 }
}
```

**An "on kill, heal yourself + regain Investiture"** — `talent-triggers.json`:
```jsonc
"Predator's Due": {
  "on": "kill", "when": {},
  "effect": { "kind": "heal", "formula": "(@tier)d(2 * @skills.black.rank + 2)",
              "target": "self", "resourceGain": { "resource": "inv", "value": 1 } }
}
```

**A passive damage rider** (always adds to your matching damage) — `talent-riders.json`:
```jsonc
"Kindle": { "appliesTo": "energy", "bonusFormula": "@skills.red.mod" }
```

**An AoE burst on use** (auto-targets enemies) — `talent-targeting.json`:
```jsonc
"Flame Surge": { "color": "red", "affects": "enemies",
                 "area": { "shape": "circle", "sizeByRank": true } }
```
(Also give it `damageFormula`/`damageType` in `talent-rolls.json` so the card has something to apply.)

**A Temp HP grant on use** — `talent-thp.json`:
```jsonc
"Death Ward": { "formula": "(@tier)d(2 * @skills.black.rank + 2) + @attr.pre", "target": "targeted" }
```

**Dangerous terrain on use** — `talent-hazards.json`:
```jsonc
"Set Charge": { "sizeFt": 10, "damageFormula": "(@tier)d(2 * @skills.red.rank + 2)",
                "damageType": "energy", "color": "red",
                "description": "Each creature within 10 ft takes [Tier][Die]; point becomes dangerous terrain." }
```

**A summon on use** — `talent-summons.json`:
```jsonc
"Risen Servant": {
  "name": "Risen Servant", "img": "icons/magic/death/undead-skeleton-worn-blue.webp",
  "hpFormula": "(@tier)d(2 * @skills.green.rank + 2)", "speed": 25, "defensePenalty": 3,
  "conditionImmunities": ["frightened", "compelled", "disoriented"],
  "attack": { "name": "Bone Strike", "damageFormula": "(@tier)d(2 * @skills.green.rank + 2)",
              "damageType": "keen", "range": "melee" },
  "actsAfterCaster": true
}
```

**A passive +Speed buff** — `talent-effects.json` *(see §7 known-bug caveat)*:
```jsonc
"Walking Ruin": [{ "label": "Walking Ruin — Speed", "icon": "icons/svg/upgrade.svg",
  "changes": [{ "key": "system.movement.walk.rate.bonus", "mode": 2, "value": 10 }] }]
```

---

## 10. Creating a brand-new talent from scratch

1. **Add the talent to its atlas file** (`leyline.json` / `domain.json` / `cosmere.json`). The generator normalizes these key shapes:

   | Concept | leyline.json | domain.json | cosmere.json (heroic) |
   |---|---|---|---|
   | Name | `name` | `Talent Name` | `Name` |
   | Action | `action` | `Action Type` | `Action` |
   | Cost | `cost` | `Cost` | *(none)* |
   | Prereqs | `prerequisites` | `Prerequisites` | *(none)* |
   | Description | `description` | `Description` | `Description` |
   | Flavor | `flavor` | `Flavor Text` | *(none)* |
   | Tags | `tags` | `Tags` | `Tags` |
   | Layout | `layout {x,y}` (0–1) | `layout {x,y}` | `layout {x,y}` |
   | Edges | *(prereqs)* | `connections[]` | *(prereqs)* |

   - **Action** accepts glyphs or words: `Passive`/`∞`, `Free Action`/`◇`, `Reaction`/`⟲`, `Special`/`★`, `1/2/3 Action(s)`. → sets the activation cost/icon.
   - **Cost** like `1 Investiture`, `2 Focus`, `Opportunity` → parsed into resource consumption; other text shows as cost text.
   - **Prerequisites**: `;`/`,`/`and` = AND, `or` = OR. Tokens are auto-classified: a talent **name** → a tree edge; a leyline color or standard skill + rank (`White 2+`) → a skill prereq; an attribute + value → attribute prereq; free text → a narrative ("connection") prereq.
   - **layout** `{x,y}` is normalized 0–1 and scaled to the tree's pixel grid.

2. **Connections (deity trees / explicit edges):** `domain.json` uses an explicit `connections[]` array = the visual parent edges. This is **separate from the prereq text and from the name** — so if you **rename** a talent, you must also fix every *other* talent's `connections` entry that points at the old name, or the edge goes stale (the build will flag/break). Leyline/heroic edges come from prereq talent-name tokens instead.

3. **Give it behavior (optional):** add entries to the behavior tables in §8 keyed by the new talent's exact name.

4. **Icon:** the generator auto-picks an icon by keyword/specialty (`scripts/talent-icons.js`). To force one, edit that file. **Every icon path must exist** under `…/public/icons` (verify with a Windows path) — a 404 = an invisible, unselectable tree node.

5. **Rebuild + validate + sync** (§11).

---

## 11. Build → sync → verify cycle

```powershell
# 1. Foundry MUST be closed (LevelDB lock). Check:
Get-Process | ? { $_.ProcessName -match 'foundry|electron' }
#    (Or from inside a running world, game.shutDown() returns to Setup and releases locks.)

# 2. Build (default = all; or one scope at a time — NOTE: a single scope arg only).
cd "C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\skilltrees\scripts"
node foundry-build.js all     # leyline | deity | heroic | adversaries | all

# 3. Validate (expect VALIDATION PASSED, 0 issues).
node C:\tmp\validate2.js

# 4. Relaunch Foundry. Then in a character, re-sync owned talents (they're snapshots):
#    budget-bar "⟳ Sync Talents" button, OR in console:
edha.syncNow()            // active character
edha.syncAllCharacters()  // everyone
```

**When do I rebuild vs just F5?**

- **Rebuild (Foundry closed)** — anything baked into the packs: talent text, roll data, **`system.events` rules**, **ActiveEffects**, tree layout, icons, path grants, adversary stat blocks, Draw Mana.
- **F5 (reload)** — runtime JS/JSON: `register-skills.js` logic (the registered event/handler types, the hazard Region behavior, helpers) and the copied `data/*.json` fallback tables. `module.json` changes (e.g. new documentTypes) need a full relaunch, not just F5.
- **Always re-sync** owned talents after a rebuild — embedded talents are frozen snapshots; sync now carries `events` + `effects` too.

**Required setting:** `applyButtonsTo = 4` (Prioritise Targeted) — the module force-sets it on load; or run `edha.fixSettings()`. Without it, the chat Apply buttons ignore your targets and only hit the selected token (breaks AoE).

---

## 12. Formula cookbook

Formulas resolve against the **owner's** roll data (for triggers/THP/hazard, the caster at fire/placement time).

| You want | Write |
|---|---|
| Character Tier (die **count**) | `@tier` |
| Leyline color rank (1–5) | `@skills.<color>.rank` (white/blue/black/red/green) |
| Leyline/skill **modifier** (rank + attr) | `@skills.<color>.mod` |
| **[Tier][Die]** (the core scaling die) | `(@tier)d(2 * @skills.<color>.rank + 2)` |
| Half [Tier][Die] | `floor((@tier)d(2 * @skills.<color>.rank + 2) / 2)` |
| Double [Tier][Die] | `(2 * @tier)d(2 * @skills.<color>.rank + 2)` |
| Add an attribute (value only) | `+ @attr.<id>` — ids: `str spd int wil awa pre` |
| Flat canonical dice (heroic) | `2d8`, `4d6`, etc. |

**Damage types:** `energy`, `impact`, `keen`, `spirit`, `vital`, `heal`. In hand-authored `[[damage N Type]]` enrichers in description text, the type must be **Capitalized** (`Energy`/`Impact`/`Keen`/`Spirit`/`Vital`/`Healing`) or it errors.

**Convention reminders:** leyline/deity talents scale with `[Tier][Die]` off a leyline color; deity tests use one of the path's two leyline colors; "+Attribute" adds are preserved with no auto color mod (damage-only). Heroic talents use **standard skills + flat canonical dice**, not `[Tier][Die]`.

---

## 13. Gotchas & troubleshooting

- **In-sheet edits vanish on rebuild.** The generator owns the packs. Fold changes into the source tables (§8) to keep them.
- **Behavior tables are keyed by exact talent name** — a typo or case mismatch silently drops the binding. Rename a talent → update its table keys too.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`). That's already done in `register-skills.js`; just know that's why F5 (not partial reload) is needed for runtime changes.
- **Handler config forms auto-render from the schema** — no `.hbs` needed. If you add a field to a handler's schema, it just appears in the editor.
- **ActiveEffects baked into the compendium are stripped on load** (§7) — passive buffs need the deferred add-at-sync fix; track them manually for now. Events tab is unaffected.
- **Hazard Regions and Summons are GM-side** — a player using such a talent gets a "GM-side" notice; the GM resolves the placement.
- **Embedded talents are snapshots** → always `⟳ Sync` after a rebuild or owned talents keep stale data (the classic "I clicked it and nothing rolled" — it's a pre-rebuild copy).
- **`connections` ≠ prereqs ≠ name.** Renaming a talent in `domain.json` requires rewriting every other talent's `connections` entry that points to it (§10).
- **For any player prompt that needs canvas targeting, use the chat-card button** (`costOptional`), never a blocking dialog — a modal freezes the canvas; a non-modal can hide behind the sheet.
- **`oncePerRound` is combat-scoped.** Out of combat it's unrestricted. To re-test in combat without advancing the round: `edha.resetTriggers()`.
- **Verify every icon path exists** (Windows path) — a 404 makes the tree node invisible/unselectable.
- **Foundry runs v13.351**; the cosmere-rpg system is v13-targeted. Some v14-only DOM behaviors misbehave — stick to v13.

---

## 14. The `edha.*` console API

Exposed as `game.modules.get("edha-content").api` and the global `edha`:

| Call | Does |
|---|---|
| `edha.syncNow(actor?)` | Re-pull roll data + native events/effects onto the (active) character's owned talents. |
| `edha.syncAllCharacters()` | Same, for every character. |
| `edha.grantDrawMana(actor?)` | Add Draw Mana to a character who took their leyline path before Draw Mana existed. |
| `edha.resetTriggers(actor?)` | Clear once-per-round locks (testing). |
| `edha.fixSettings()` | Force `applyButtonsTo` → Prioritise Targeted. |
| `edha.showRange(item\|name)` | Draw the Attunement-Range ring + count tokens in range. |
| `edha.aoe(item)` | Manually drop a talent's AoE burst. |
| `edha.summon(actor, name)` | Spawn a summon by talent name. |
| `edha.setTempHp(actor, n, src)` / `edha.getTempHp(actor)` | Read/write Edha Temp HP. |
| `edha.drawMana(item)` | Run the Draw Mana effect manually. |

---

*Questions this handbook doesn't answer are almost always covered in `EDHA_FOUNDRY_HANDOFF.md` (operations, current content state, open to-dos) or the per-file `_README` blocks in `data/`.*
