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
  delete env.edhaCreatorWindows;
  assert.strictEqual(env.edhaKeyPickAllowed(1, "a1"), true);
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), false);
  // A host-realm Set on purpose — the engine's check is duck-typed (.has), not instanceof.
  env.edhaCreatorWindows = new Set(["a1", "a2"]);
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), true);
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a2"), true, "several wizards may be open at once (bench passes)");
  assert.strictEqual(env.edhaKeyPickAllowed(3, "someone-else"), false, "the window is per-actor");
  env.edhaCreatorWindows.delete("a1");
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a1"), false, "closing one wizard closes only ITS window");
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a2"), true, "the other actor's window survives");
  delete env.edhaCreatorWindows;
  assert.strictEqual(env.edhaKeyPickAllowed(3, "a2"), false);
});

test("edhaCwAttrBudget / edhaCwSkillBudget / edhaCwMaxSkillRank follow Character_Building_Rules", () => {
  // Attribute points: 12 at L1, +1 at each of 3/6/9/12/15/18.
  assert.strictEqual(env.edhaCwAttrBudget(1), 12);
  assert.strictEqual(env.edhaCwAttrBudget(3), 13);
  assert.strictEqual(env.edhaCwAttrBudget(6), 14);
  assert.strictEqual(env.edhaCwAttrBudget(20), 18);
  // Skill ranks: 5 + (L-1)*2.
  assert.strictEqual(env.edhaCwSkillBudget(1), 5);
  assert.strictEqual(env.edhaCwSkillBudget(3), 9);
  assert.strictEqual(env.edhaCwSkillBudget(10), 23);
  // Max skill rank: INT((L-1)/5) + 2.
  assert.strictEqual(env.edhaCwMaxSkillRank(1), 2);
  assert.strictEqual(env.edhaCwMaxSkillRank(5), 2);
  assert.strictEqual(env.edhaCwMaxSkillRank(6), 3);
  assert.strictEqual(env.edhaCwMaxSkillRank(20), 5);
  // Degenerate levels clamp to 1.
  assert.strictEqual(env.edhaCwAttrBudget(0), 12);
  assert.strictEqual(env.edhaCwSkillBudget(0), 5);
});

/* --- Grow-after-positioning (bench run 21: the country page hung 125 px off the bottom) --------
 * ApplicationV2#_updatePosition clamps `top` into [0, viewportH − height] ONCE, at render. The
 * "Where are you from?" page ships its map block `display:none` and reveals it only after
 * assets/thyrcross-nations.json resolves, so Foundry centred a 426 px dialog at (900−426)/2 = 237
 * and never looked again once the 42vh map took it to 788: 237 + 788 = 1025 in a 900 px viewport.
 * These pin the decision the ResizeObserver in edhaCreatorDialogs makes — including when it must
 * do NOTHING, which is the half that keeps it from thrashing or fighting the user. */
test("edhaDialogNeedsReposition: the reported country-page case", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(237, 788, 900), true);   // 1025 > 900
});

test("edhaDialogNeedsReposition: the same page BEFORE the map lands is left alone", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(237, 426, 900), false);  // 663 fits
});

test("NEGATIVE: pages that already fit are never moved (run 21 measured these two)", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(177, 546, 900), false);  // heroic  177 -> 723
  assert.strictEqual(env.edhaDialogNeedsReposition(142, 616, 900), false);  // attrs   142 -> 758
});

test("NEGATIVE: a dialog already flush at the top is not re-clamped, however tall", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(0, 1200, 900), false);   // nothing to gain
  assert.strictEqual(env.edhaDialogNeedsReposition(-4, 1200, 900), false);
});

test("NEGATIVE: a degenerate measurement is never acted on", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(237, 0, 900), false);
  assert.strictEqual(env.edhaDialogNeedsReposition(237, 788, 0), false);
  assert.strictEqual(env.edhaDialogNeedsReposition(undefined, undefined, undefined), false);
});

test("the exact boundary — bottom flush with the viewport is NOT an overflow", () => {
  assert.strictEqual(env.edhaDialogNeedsReposition(112, 788, 900), false);  // 900 === 900
  assert.strictEqual(env.edhaDialogNeedsReposition(113, 788, 900), true);   // 901 > 900
});
