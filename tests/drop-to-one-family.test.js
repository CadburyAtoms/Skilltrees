/* REGRESSION — R-10: "cannot regain HP" does NOT stop stabilization.
 * (EDHA_RULINGS.md R-10, answered 2026-09-06 (b); TODO_REPO_HYGIENE #47, fix pass 7a.)
 *
 * Withering Touch's mark writes a `healCut` effect with `fraction: 0` — "this creature cannot regain
 * HP" — and `edhaHealCutGate` is the one place every rule-driven heal passes through to honour it.
 * The DROP-TO-1 writers deliberately do not pass through it, and the engine header said so while
 * calling the question "a design ruling, queued for Ben". Ben answered (b): **stabilizing at 1 is a
 * floor against death, not regaining.** So the bypass is now the ruling rather than a pending
 * decision, and this file is what stops it drifting.
 *
 * WHY A FAMILY FILE AND NOT ONE CASE. There are four writers and they make the same promise
 * ("instead of dropping, you hold at N") by four different mechanisms — a bypassing cross-heal, a
 * direct resource write, a relayed burst heal, and a preUpdate veto that rewrites the change before
 * it lands. Nothing structural keeps them in step: three of them would look perfectly normal routed
 * through the heal gate, and the day one of them is, "cannot regain HP" quietly becomes "cannot be
 * saved" for that talent only — a different card, discoverable only at a table, on a death.
 *
 * BOTH DIRECTIONS, EVERY CASE. Each block pairs the stabilization that must still land on a
 * withered creature with the plain heal on the SAME creature that must still do nothing; a fix that
 * simply removed the heal gate would pass a one-sided suite while un-fixing bench run 3 defect 5.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockEffect, mockItem, stageWorld, withStubs, fireHook, captureChat,
        readEngineSource, codeOnly, eq } = require("./harness.js");

/* A creature carrying Withering Touch's `fraction: 0` mark — the "cannot regain HP" case. `hp` is
 * its current health; 0 is the state every drop-to-1 writer acts on. */
function withered(name, hp = 0, { max = 8, owner = true } = {}) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "npc",
    system: { resources: { hea: { value: hp, max: { value: max } } } },
    effects: [mockEffect({ name: "Withering Touch", flags: { healCut: { fraction: 0, byName: "Withering Touch" } } })] });
  a.isOwner = owner;
  return a;
}
const hp = (a) => a.system.resources.hea.value;

/* The lone-GM staging every cross-actor write in this family needs. */
function asGm(env) {
  return stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } } }).undo;
}

/* ---- 0. the premise: the mark is real and the gate honours it ---------------------------------- */

test("R-10 premise: a fraction-0 healCut mark is read, and a plain heal on the marked creature is 0", () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Victim", 0);
  eq(env.edhaHealCutInfo(v), { fraction: 0, byName: "Withering Touch" });
  assert.strictEqual(env.edhaHealCutGate(v, 10), 0, "cannot regain HP means the amount is cut to 0");
});

/* ---- 1. Unbreakable Line — edhaCrossHeal's bypassHealCut ---------------------------------------- */

test("R-10 (1): the bypassing cross-heal stabilizes a WITHERED creature at 0 HP to 1", async () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Victim", 0);
  const undo = asGm(env);
  try {
    await env.edhaCrossHeal(v, 1, { bypassHealCut: true });
    assert.strictEqual(hp(v), 1, "the floor against death lands, mark or no mark");
  } finally { undo(); }
});

test("R-10 (1) THE OTHER DIRECTION: the SAME helper without the bypass still heals nothing", async () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Victim", 0);
  const undo = asGm(env);
  try {
    await env.edhaCrossHeal(v, 6);
    assert.strictEqual(hp(v), 0, "a plain heal on a withered creature is still blocked (bench run 3 defect 5)");
  } finally { undo(); }
});

/* ---- 2. Death Ward — the applyDamage post-pass -------------------------------------------------- */

test("R-10 (2): Death Ward's post-pass writes 1 HP to a withered creature it just saved", async () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Warded Victim", 0);
  await v.setFlag("edha-content", "deathWard", { ownerName: "Reaper", sourceName: "Death Ward", formula: "0" });
  const undo = asGm(env);
  try {
    await env.edhaDeathWardCheck(v, 5);                   // prevHp 5 → the lethal drop
    assert.strictEqual(hp(v), 1, "the ward's whole promise is 1 HP instead of 0");
    assert.strictEqual(v.getFlag("edha-content", "deathWard"), undefined, "…and the ward is spent");
  } finally { undo(); }
});

test("R-10 (2) NEGATIVE: the ward does not fire on a non-lethal hit, withered or not", async () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Warded Victim", 3);
  await v.setFlag("edha-content", "deathWard", { ownerName: "Reaper", sourceName: "Death Ward", formula: "0" });
  const undo = asGm(env);
  try {
    await env.edhaDeathWardCheck(v, 5);                   // 5 → 3, still standing
    assert.strictEqual(hp(v), 3, "unchanged");
    assert.ok(v.getFlag("edha-content", "deathWard"), "and the ward is NOT spent");
  } finally { undo(); }
});

/* ---- 3. Raise Dead — the relayed burst heal ----------------------------------------------------- */

test("R-10 (3): the burst-apply revive hit lands its 1 HP on a withered corpse", async () => {
  const env = loadEngine();
  captureChat(env);
  const v = withered("Raised", 0);
  const undo = asGm(env);
  try {
    await withStubs(env, { fromUuid: async () => v }, async () => {
      await env.edhaApplyBurstResults({ hits: [{ actorUuid: v.uuid, amount: 1, heal: true }] });
    });
    assert.strictEqual(hp(v), 1, "Raise Dead returns it to life; the mark is not a veto on being alive");
  } finally { undo(); }
});

/* ---- 4. the edha-hp-floor veto ------------------------------------------------------------------ */

test("R-10 (4): the HP-floor veto still holds a withered PC above 0", async () => {
  const env = loadEngine();
  captureChat(env);
  const a = withered("Resilient PC", 4, { max: 12 });
  a.type = "character";
  a.getRollData = () => ({ skills: { ath: { mod: 3 } } });
  a.items = [mockItem({ name: "Resilient Hero", actor: a,
    events: [{ event: "use", handler: { type: "edha-hp-floor", floorFormula: "max(1, @skills.ath.mod)" } }] })];

  const change = { system: { resources: { hea: { value: 0 } } } };
  await fireHook(env, "preUpdateActor", a, change);

  assert.strictEqual(change.system.resources.hea.value, 3,
    "the veto rewrites the incoming change to the floor BEFORE it lands — it never was a heal, and " +
    "a refactor routing it through one would gate it by accident");
  assert.strictEqual(a.getFlag("edha-content", "resilientSpent"), true, "…and it is spent once");
});

test("R-10 (4) NEGATIVE: the floor is once, and a drop to a positive value is left alone", async () => {
  const env = loadEngine();
  captureChat(env);
  const a = withered("Resilient PC", 4, { max: 12 });
  a.type = "character";
  a.getRollData = () => ({ skills: { ath: { mod: 3 } } });
  a.items = [mockItem({ name: "Resilient Hero", actor: a,
    events: [{ event: "use", handler: { type: "edha-hp-floor", floorFormula: "max(1, @skills.ath.mod)" } }] })];

  const survivable = { system: { resources: { hea: { value: 2 } } } };
  await fireHook(env, "preUpdateActor", a, survivable);
  assert.strictEqual(survivable.system.resources.hea.value, 2, "not a drop to 0 — nothing to veto");

  await fireHook(env, "preUpdateActor", a, { system: { resources: { hea: { value: 0 } } } });   // spends it
  const second = { system: { resources: { hea: { value: 0 } } } };
  await fireHook(env, "preUpdateActor", a, second);
  assert.strictEqual(second.system.resources.hea.value, 0, "spent until a long rest — the second drop kills");
});

/* ---- 5. THE FAMILY PIN — none of the four acquired the gate ------------------------------------- */

test("R-10: the heal gate is consulted at exactly the two REAL-heal sites, and by no drop-to-1 writer", () => {
  // The mutation-sensitive case. `edhaHealCutGate` belongs on paths that HEAL: edhaCrossHeal's
  // non-bypass branch and the effect-heal branch of the triggered-effect runner. A third call is
  // either a new heal path (fine — say so here) or one of the four drop-to-1 writers acquiring it,
  // which is R-10 being reversed by accident.
  const code = codeOnly(readEngineSource());
  const calls = code.match(/(?<!function )\bedhaHealCutGate\(/g) || [];
  assert.strictEqual(calls.length, 2,
    `expected edhaCrossHeal's gated branch + the effect-heal branch, found ${calls.length}. ` +
    "R-10 (b): a drop-to-1 / stabilize writer must NEVER route through the heal gate — stabilizing " +
    "at 1 is a floor against death, not regaining.");

  // Each writer, by its own shape, still writes the 1 unconditionally.
  assert.ok(/edhaCrossHeal\(victim, Math\.max\(1, 1 - cur\), \{ bypassHealCut: true \}\)/.test(code),
    "(1) Unbreakable Line's revive button still bypasses");
  assert.ok(/edhaResourceWrite\(target, "hea", \{ value: 1 \}/.test(code),
    "(2) Death Ward's post-pass still writes the 1 directly");
  assert.ok(/hits: \[\{ actorUuid: target\.uuid, amount: 1, heal: true \}\]/.test(code),
    "(3) Raise Dead still relays a plain 1-HP heal hit");
  assert.ok(/setProperty\(changes, "system\.resources\.hea\.value", mod\)/.test(code),
    "(4) the HP-floor veto still rewrites the change rather than healing");

  // And the bypass exists for this family ONLY: one flag, one true caller.
  const bypassTrue = code.match(/bypassHealCut: true/g) || [];
  assert.strictEqual(bypassTrue.length, 1,
    "bypassHealCut is the drop-to-1 escape hatch, not a way to push a heal past the mark. A second " +
    "caller needs a ruling, not a commit.");
});
