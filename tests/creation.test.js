/* Unit tests for the character-creation wizard's pure helpers (07-18l — §9j #5).
 *
 * Pins: the creation-state snapshot (what the wizard's welcome checklist and budget counter
 * read), the level-1 restart wipe list (what "Start over" deletes — and what it must NOT),
 * and the Key-pick window (Keys above level 1 only while the wizard's per-actor window is open).
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

const item = (type, name, extra = {}) => ({ id: `id-${type}-${name}`.replace(/\s+/g, "-"), type, name, ...extra });
const pathItem = (t, name) => item("path", name, { system: { type: t } });

test("edhaCreationState: empty level-1 actor is incomplete with a budget of 4", () => {
  const s = env.edhaCreationState({ system: { level: 1 }, items: [] });
  assert.strictEqual(s.complete, false);
  assert.strictEqual(s.allowed, 4);
  assert.strictEqual(s.talents, 0);
  assert.strictEqual(s.level, 1);
  assert.strictEqual(s.culture, null);
  assert.strictEqual(s.heroic, null);
});

test("edhaCreationState: culture + heroic + leyline = complete; deity stays optional; talents counted", () => {
  const s = env.edhaCreationState({ system: { level: 1 }, items: [
    item("culture", "Kettavar"),
    pathItem("heroic", "Warrior"), pathItem("leyline", "Red"),
    item("talent", "Vigilant Stance"), item("talent", "Red Leyline Attunement"),
    item("action", "Draw Mana"), item("weapon", "Sidesword"),
  ] });
  assert.strictEqual(s.complete, true);
  assert.strictEqual(s.deity, null);
  assert.strictEqual(s.talents, 2);          // action/weapon items never count
  assert.strictEqual(s.heroic.name, "Warrior");
  assert.strictEqual(s.leyline.name, "Red");
});

test("edhaCreationState: level 6 budget is 10 (tier breakpoint)", () => {
  const s = env.edhaCreationState({ system: { level: 6 }, items: [] });
  assert.strictEqual(s.allowed, 10);
});

test("edhaCreationWipeIds: wipes talents, paths, culture, ancestry, and kit-stamped gear only", () => {
  const keepWeapon = item("weapon", "Heirloom Blade");
  const keepAction = item("action", "Draw Mana");   // leaves via the leyline path's own remove event
  const kitGear = item("equipment", "Backpack", { flags: { "edha-content": { kitItem: true } } });
  const ids = env.edhaCreationWipeIds([
    item("talent", "Vigilant Stance"), pathItem("heroic", "Warrior"),
    item("culture", "Kettavar"), item("ancestry", "Human"),
    kitGear, keepWeapon, keepAction,
  ]);
  assert.ok(ids.includes("id-talent-Vigilant-Stance"));
  assert.ok(ids.includes("id-path-Warrior"));
  assert.ok(ids.includes("id-culture-Kettavar"));
  assert.ok(ids.includes("id-ancestry-Human"));
  assert.ok(ids.includes(kitGear.id));
  assert.ok(!ids.includes(keepWeapon.id), "non-kit gear must survive a restart");
  assert.ok(!ids.includes(keepAction.id), "actions are not wiped directly");
});

test("edhaCreationWipeIds: falls back to _id and drops id-less entries", () => {
  const ids = env.edhaCreationWipeIds([{ _id: "abc", type: "talent", name: "X" }, { type: "path", name: "no-id" }]);
  // vm-realm arrays carry that realm's prototypes — JSON-normalize before structural comparison.
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ids)), ["abc"]);
});

test("edhaKeyPickAllowed: level 1 always; above level 1 only inside the wizard's per-actor window", () => {
  delete env.edhaCreatorWindow;
  assert.strictEqual(env.edhaKeyPickAllowed(1, "a1"), true);
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), false);
  env.edhaCreatorWindow = "a1";
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), true);
  assert.strictEqual(env.edhaKeyPickAllowed(3, "someone-else"), false, "the window is per-actor");
  delete env.edhaCreatorWindow;
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), false, "closing the wizard closes the window");
});
