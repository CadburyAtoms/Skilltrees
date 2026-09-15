#!/usr/bin/env node
/* scripts/validate-adversary-model.js — the gate July never had (R-137, 2026-09-14/15).
 *
 * WHY THIS EXISTS. From July the build wrote every adversary attack as a Heavy / Light Weaponry test
 * with the block's whole attack bonus in `modifierFormula` and the whole damage bonus inside the
 * damage formula ("so PDF numbers hold at any skill rank"). That was right only while every block's
 * attributes were 0. R-128 (2026-09-14) let a block state attributes; PR #388 stated them on seven
 * blocks; and the cosmere system — which rolls an adversary exactly as it rolls a PC — added STR or
 * SPD to the d20 AND to the damage on top of the flat card numbers (a STR 2 Raider's +4 / 1d6+1
 * Shortsword rolled `1d20 + 2 + 4` and `1d6 + 1 + 2`, verified live 2026-09-15). R-128's menu had
 * said attack modifiers "would not move under any option". Nothing in the gates could have caught it.
 *
 * Ben's ruling (R-137, chat 2026-09-14): adversaries follow the same rules as the PCs — attributes,
 * skill ranks in relevant skills, talents off the trees. So a block that states `attributes` is ON
 * THE PC MODEL: attack = d20 + (attribute + rank) [+ an explicit `attackBonus`], damage = dice +
 * (attribute + rank), graze = the dice. This validator fails a migrated block whose stored numbers
 * would double-count that modifier, and counts the blocks still on the flat model (46 of 53 on
 * 2026-09-15; they migrate nation by nation, R-135). Pure checks live in `checkBlock` so
 * tests/adversary-model.test.js can pin them on fixtures; `main` runs them over the live data and
 * prints each migrated block's derived line so a reviewer can read the numbers off the gate.
 *
 *   node scripts/validate-adversary-model.js          # exit 1 on any error
 *
 * Honors EDHA_DATA (scripts/lib/paths.js) like the build and the other validators.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { DATA } = require("./lib/paths.js");
const parts = require("./foundry-build-parts.js");

const ATTACK_KEYS_OF_THE_PC_MODEL = ["attackSkill", "attackBonus"];
const KNOWN_SKILLS = new Set(Object.keys(parts.SKILL_ATTR));

/** Errors (strings) for one block. Empty = clean. `derived` collects the printable lines. */
function checkBlock(name, adv, derived = []) {
  const errors = [];
  const E = (item, msg) => errors.push(`${name}${item ? ` / ${item}` : ""}: ${msg}`);
  if (!adv || typeof adv !== "object") return errors;
  const items = Array.isArray(adv.items) ? adv.items : [];
  const onModel = parts.advOnPcModel(adv);

  if (!onModel) {
    // The flat model stays legal until the block migrates — but the PC model's keys need attributes.
    for (const it of items) {
      for (const k of ATTACK_KEYS_OF_THE_PC_MODEL) {
        if (it && it[k] !== undefined) E(it.name, `"${k}" is a PC-model key, and this block states no attributes — state \`attributes\` (and drop the flat \`attack\` / the flat in \`damage\`) to migrate it, or remove the key (R-137)`);
      }
    }
    return errors;
  }

  // R-139 (a): defenses derive on the PC model. A stated pair is allowed only as a restatement.
  const der = parts.advDefenses(adv);
  if (adv.defenses && typeof adv.defenses === "object") {
    const diff = ["phy", "cog", "spi"].filter((k) => Number(adv.defenses[k]) !== der[k]);
    if (diff.length) E(null, `stated defenses ${adv.defenses.phy}/${adv.defenses.cog}/${adv.defenses.spi} disagree with the derivation ${der.phy}/${der.cog}/${der.spi} (10 + STR+SPD / INT+WIL / AWA+PRE — R-139 (a)): choose attributes that derive the numbers you want, or omit \`defenses\``);
  }
  derived.push(`${name}: defenses derive ${der.phy}/${der.cog}/${der.spi}${adv.defenses ? " (restated)" : ""}`);

  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const isAttack = parts.advIsAttackItem(adv, it);
    if (typeof it.attack === "number" || (it.attack !== undefined && it.attack !== null)) {
      E(it.name, `flat attack +${it.attack} beside stated attributes — the system adds ${describeMod(adv, it)} on top of it at the table (R-137). On the PC model the attack is derived: state \`attackSkill\` (or leave a weapon to its range default), an \`attackBonus\` only for a bonus the block really states as a bonus, and write \`damage\` as the dice alone`);
    }
    if (it.attackBonus !== undefined && !Number.isInteger(Number(it.attackBonus))) E(it.name, `attackBonus ${JSON.stringify(it.attackBonus)} is not an integer`);
    if (it.attackSkill !== undefined && !KNOWN_SKILLS.has(String(it.attackSkill).toLowerCase())) E(it.name, `attackSkill "${it.attackSkill}" is not a core 3-letter skill id or a leyline colour`);
    if (it.attackBonus !== undefined && !isAttack) E(it.name, `attackBonus on an item that is not an attack — a weapon, or an action stating \`attackSkill\``);
    if (!isAttack) continue;
    if (it.skill !== undefined) E(it.name, `"skill" is the flat model's cosmetic override ("attributes are 0 so the flat attack carries the bonus"); on the PC model the test skill is \`attackSkill\``);
    const model = parts.advAttackModel(adv, it);
    if (!model) continue;
    if (!model.attribute) E(it.name, `attack skill "${model.skill}" maps to no attribute — the roll would have no modifier`);
    if (it.damage != null && !model.dice) E(it.name, `damage ${JSON.stringify(it.damage)} is not dice-only — the system appends the skill modifier (${describeMod(adv, it)}) at roll time, so a flat term double-counts it; write the dice alone and let the card print the derived total (R-137)`);
    if (it.graze != null && !parts.parseDiceOnly(it.graze)) E(it.name, `graze ${JSON.stringify(it.graze)} is not dice-only — a graze is the dice, never the modifier`);
    if (model.attribute && (model.dice || it.damage == null)) {
      derived.push(`${name} / ${it.name}: Attack ${parts.signed(model.attackTotal)} (= ${model.attribute.toUpperCase()} ${model.attrValue} + ${model.skill} rank ${model.rank}${model.bonus ? ` + bonus ${model.bonus}` : ""})` +
        (model.dice ? ` · Hit ${model.hitFormula} ${it.damageType || ""} (EV ${model.hitEv}) · Graze ${model.grazeFormula}` : " · to-hit only"));
    }
  }
  return errors;
}

function describeMod(adv, it) {
  const skill = parts.advAttackSkill(it) || (/\brange\b/i.test(it.range || "") ? "lwp" : "hwp");
  const attribute = parts.SKILL_ATTR[skill];
  const v = attribute ? parts.advAttributeValues(adv)[attribute] : 0;
  const rank = parts.advSkills(adv)[skill]?.rank ?? 0;
  return `${attribute ? attribute.toUpperCase() : "?"} ${v} + ${skill} rank ${rank} = ${v + rank}`;
}

/** The whole file: { errors, derived, counts: { pcModel, flatModel } }. */
function checkAll(data) {
  const errors = [], derived = [];
  let pcModel = 0, flatModel = 0;
  for (const [name, adv] of Object.entries(data)) {
    if (name.startsWith("_") || !adv || typeof adv !== "object") continue;
    if (parts.advOnPcModel(adv)) pcModel++; else flatModel++;
    errors.push(...checkBlock(name, adv, derived));
  }
  return { errors, derived, counts: { pcModel, flatModel } };
}

function main() {
  const file = path.join(DATA, "adversaries.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const { errors, derived, counts } = checkAll(data);
  console.log(`adversary-model: ${counts.pcModel} block${counts.pcModel === 1 ? "" : "s"} on the PC model (attributes + skill ranks, attack and damage derived — R-137), ${counts.flatModel} still on the flat model (migrate nation by nation, R-135).`);
  for (const d of derived) console.log(`  ${d}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`adversary-model: ${errors.length} error${errors.length === 1 ? "" : "s"} — a migrated block's stored numbers would double-count its skill modifier at the table.`);
    return 1;
  }
  console.log("adversary-model: ✓ 0 issues");
  return 0;
}

module.exports = { checkBlock, checkAll, describeMod };
if (require.main === module) {
  try { process.exit(main()); }
  catch (e) { console.error(`adversary-model: ${e.stack || e}`); process.exit(2); }
}
