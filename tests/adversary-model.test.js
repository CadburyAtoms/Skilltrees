/* R-137 (Ben, 2026-09-14): adversaries roll like PCs. Pins for the PC attack model in
 * scripts/foundry-build-parts.js and the gate in scripts/validate-adversary-model.js.
 *
 * WHY THESE FIXTURES. The defect this gate exists for shipped on PR #388 (2026-09-14): seven blocks
 * stated attributes (R-128) while keeping the flat `attack: N` / "1d6+N" numbers of the July model,
 * and the system — which rolls an adversary's item exactly as a PC's (skill rank + attribute on the
 * d20, the same modifier appended to the damage) — added STR/SPD on top of both. Verified live
 * 2026-09-15 on a fresh import: the STR 2 Corvaine Raider's +4 / 1d6+1 Shortsword rolled
 * `1d20 + 2 + 4` and `1d6 + 1 + 2`. The first case below IS that block, and it must fail; a
 * one-line reversion of the validator (dropping the flat-attack check) is what these pins refuse.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const parts = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));
const v = require(path.join(__dirname, "..", "scripts", "validate-adversary-model.js"));

const RAIDER_AS_SHIPPED = { role: "minion", tier: 1, attributes: { str: 2, spd: 1, int: 1, wil: 1, awa: 1, pre: 0 }, defenses: { phy: 12, cog: 11, spi: 11 }, hp: 10,
  items: [{ name: "Shortsword", kind: "weapon", attack: 4, range: "Reach 5 ft.", damage: "1d6+1", damageType: "keen" }] };

test("R-137: a block with STR 2 and a flat +4 attack FAILS the model gate (the PR #388 shape, verified live as 1d20 + 2 + 4)", () => {
  const errors = v.checkBlock("Raider", { ...RAIDER_AS_SHIPPED, defenses: undefined });
  assert.ok(errors.some((e) => /flat attack \+4 beside stated attributes/.test(e)), `expected the flat-attack error, got:\n${errors.join("\n")}`);
  assert.ok(errors.some((e) => /STR 2 \+ hwp rank 0 = 2/.test(e)), "the error names the modifier the table adds");
  assert.ok(errors.some((e) => /damage "1d6\+1" is not dice-only/.test(e)), "the flat inside the damage is a second error");
});

test("R-139 (a): on the PC model the defenses derive — a stated pair is accepted only when it restates the derivation", () => {
  const base = { role: "minion", tier: 1, attributes: { str: 2, spd: 1, int: 1, wil: 1, awa: 1, pre: 0 }, hp: 10, items: [] };
  assert.deepStrictEqual(parts.advDefenses(base), { phy: 13, cog: 12, spi: 11 });
  assert.deepStrictEqual(v.checkBlock("X", base), [], "omitted defenses derive");
  assert.deepStrictEqual(v.checkBlock("X", { ...base, defenses: { phy: 13, cog: 12, spi: 11 } }), [], "a restated pair equal to the derivation passes");
  const off = v.checkBlock("X", { ...base, defenses: { phy: 12, cog: 11, spi: 11 } });
  assert.ok(off.some((e) => /stated defenses 12\/11\/11 disagree with the derivation 13\/12\/11/.test(e)), off.join("\n"));
  assert.deepStrictEqual(parts.advDefenses({ role: "rival" }), { phy: 10, cog: 10, spi: 10 }, "no attributes → the 10 floor (a flat block's stated overrides are what the build writes there)");
});

test("R-137: the same block on the PC model derives attack, hit and graze from attribute + rank and passes", () => {
  const raider = { ...RAIDER_AS_SHIPPED, defenses: { phy: 13, cog: 12, spi: 11 }, skills: { hwp: 1 }, items: [{ name: "Shortsword", kind: "weapon", range: "Reach 5 ft.", damage: "1d6", damageType: "keen" }] };
  const derived = [];
  assert.deepStrictEqual(v.checkBlock("Raider", raider, derived), []);
  const m = parts.advAttackModel(raider, raider.items[0]);
  assert.deepStrictEqual([m.skill, m.attribute, m.attrValue, m.rank, m.bonus, m.mod, m.attackTotal], ["hwp", "str", 2, 1, 0, 3, 3]);
  assert.deepStrictEqual([m.hitFormula, m.hitEv, m.grazeFormula], ["1d6+3", 6.5, "1d6"]);
  assert.strictEqual(derived.length, 2, "one defenses line, one attack line");
  assert.ok(/defenses derive 13\/12\/11 \(restated\)/.test(derived[0]), derived[0]);
  assert.ok(/Attack \+3 \(= STR 2 \+ hwp rank 1\) · Hit 1d6\+3 keen \(EV 6\.5\) · Graze 1d6/.test(derived[1]), derived[1]);
});

test("R-137: a block that states NO attributes keeps the flat model — a numeric attack passes, and the model keys are refused there", () => {
  const flat = { role: "minion", tier: 1, defenses: { phy: 12, cog: 11, spi: 12 }, hp: 14, items: [{ name: "Bite", kind: "weapon", attack: 4, range: "Reach 5 ft.", damage: "1d6+2", damageType: "energy" }] };
  assert.deepStrictEqual(v.checkBlock("Cinderhound", flat), []);
  assert.strictEqual(parts.advOnPcModel(flat), false);
  assert.strictEqual(parts.advAttackModel(flat, flat.items[0]), null, "no derivation on the flat model");
  assert.strictEqual(parts.advIsAttackItem(flat, flat.items[0]), true, "the flat attack is still an attack");
  const wrongKeys = { ...flat, items: [{ ...flat.items[0], attackSkill: "hwp" }] };
  assert.ok(v.checkBlock("Cinderhound", wrongKeys).some((e) => /"attackSkill" is a PC-model key/.test(e)));
});

test("R-137: on the PC model a flat term in an attack's damage, a `skill` override, or a bad attackSkill each fail", () => {
  const base = { role: "rival", tier: 1, attributes: { str: 1 }, defenses: { phy: 11, cog: 10, spi: 10 }, hp: 20 };   // restates the derivation
  const flatDamage = { ...base, items: [{ name: "Club", kind: "weapon", damage: "1d6+1", damageType: "impact" }] };
  assert.ok(v.checkBlock("X", flatDamage).some((e) => /not dice-only/.test(e)));
  const skillOverride = { ...base, items: [{ name: "Club", kind: "weapon", skill: "lwp", damage: "1d6", damageType: "impact" }] };
  assert.ok(v.checkBlock("X", skillOverride).some((e) => /flat model's cosmetic override/.test(e)));
  const badSkill = { ...base, items: [{ name: "Glare", attackSkill: "xyz", damage: "1d4", damageType: "spirit" }] };
  assert.ok(v.checkBlock("X", badSkill).some((e) => /not a core 3-letter skill id/.test(e)));
  const bonusOnNonAttack = { ...base, items: [{ name: "Shout", attackBonus: 1, text: "<p>Loud.</p>" }] };
  assert.ok(v.checkBlock("X", bonusOnNonAttack).some((e) => /attackBonus on an item that is not an attack/.test(e)));
});

test("R-137: an action-shaped attack states attackSkill; a to-hit-only grab has no dice; an attackBonus reaches the d20 only", () => {
  const adv = { role: "rival", tier: 1, attributes: { str: 2, spd: 2 }, skills: { hwp: 1 }, hp: 20,
    items: [{ name: "Press the Line", cost: "2 Actions", attackSkill: "hwp", range: "Reach 5 ft.", damage: "1d8", damageType: "keen" },
            { name: "Snatch and Wade", cost: "2 Actions", attackSkill: "hwp", range: "Reach 5 ft.", rider: "It grips." },
            { name: "Lucky Blade", kind: "weapon", attackBonus: 1, range: "Reach 5 ft.", damage: "1d8", damageType: "keen" },
            { name: "Not an attack", text: "<p>Passive.</p>" }] };
  assert.deepStrictEqual(v.checkBlock("Roek", adv), []);
  const [press, grab, lucky, plain] = adv.items;
  assert.strictEqual(parts.advIsAttackItem(adv, plain), false);
  assert.deepStrictEqual([parts.advAttackModel(adv, press).attackTotal, parts.advAttackModel(adv, press).hitFormula], [3, "1d8+3"]);
  const g = parts.advAttackModel(adv, grab);
  assert.deepStrictEqual([g.attackTotal, g.dice, g.hitFormula, g.grazeFormula], [3, null, null, null]);
  const l = parts.advAttackModel(adv, lucky);
  assert.deepStrictEqual([l.bonus, l.mod, l.attackTotal, l.hitFormula], [1, 3, 4, "1d8+3"], "the bonus is on the d20, never in the damage");
});

test("R-137: a weapon's skill defaults by range (ranged → lwp/SPD, melee → hwp/STR), and a colour attack rolls the role rank (canon ruling 122)", () => {
  const adv = { role: "rival", tier: 1, leylines: ["black"], attributes: { str: 1, spd: 2, pre: 2 }, defenses: { phy: 13, cog: 10, spi: 12 }, hp: 20,   // 13/10/12 restates the derivation
    items: [{ name: "Crossbow", kind: "weapon", range: "Range 60 ft.", damage: "1d6", damageType: "keen" },
            { name: "Sword", kind: "weapon", range: "Reach 5 ft.", damage: "1d6", damageType: "keen" },
            { name: "Withering Word", attackSkill: "black", range: "Range 30 ft.", damage: "1d6", damageType: "vital" }] };
  assert.deepStrictEqual(v.checkBlock("X", adv), []);
  const [bow, sword, word] = adv.items.map((it) => parts.advAttackModel(adv, it));
  assert.deepStrictEqual([bow.skill, bow.attribute, bow.attackTotal], ["lwp", "spd", 2]);
  assert.deepStrictEqual([sword.skill, sword.attribute, sword.attackTotal], ["hwp", "str", 1]);
  assert.deepStrictEqual([word.skill, word.attribute, word.rank, word.attackTotal, word.hitFormula], ["black", "pre", 2, 4, "1d6+4"]);
  assert.deepStrictEqual(parts.parseDiceOnly("1d6+1"), null);
  assert.deepStrictEqual(parts.parseDiceOnly(" 2d8 ").text, "2d8");
  assert.deepStrictEqual([parts.signed(4), parts.signed(0), parts.signed(-1)], ["+4", "+0", "−1"]);
});

test("R-137: the live data/adversaries.json passes the model gate (every migrated block derives cleanly; the flat blocks are counted, not failed)", () => {
  const fs = require("fs");
  const { DATA } = require(path.join(__dirname, "..", "scripts", "lib", "paths.js"));
  const data = JSON.parse(fs.readFileSync(path.join(DATA, "adversaries.json"), "utf8"));
  const { errors, counts } = v.checkAll(data);
  assert.deepStrictEqual(errors, [], "a migrated block double-counts its skill modifier — see scripts/validate-adversary-model.js");
  assert.ok(counts.pcModel + counts.flatModel >= 53, `expected the 53 blocks of 2026-09-15 or more, got ${counts.pcModel + counts.flatModel}`);
  assert.ok(counts.pcModel >= 1, "the Corvaine + Riverlands pass migrated at least the seven PR #388 blocks");
});
