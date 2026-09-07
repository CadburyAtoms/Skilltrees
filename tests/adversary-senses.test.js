/* ONE senses rule for PCs and adversaries alike — EDHA_RULINGS.md R-56 (a), TODO_REPO_HYGIENE #55.
 *
 * Before item 55 three surfaces disagreed about the SAME creature (bench run 22, measured at
 * whole-population scale): every world adversary's SHEET read the cosmere ladder's 5 ft at AWA 0
 * (`edhaDeriveSheetStats` opened with `if (actor?.type !== "character") return;`), every pack
 * adversary's prototype TOKEN carried a flat 10 ft the build hard-coded, and the sync pushed that
 * 10 onto placed tokens while the actor still said 5 — 52 of 52 internally mismatched. Ben ruled
 * (a): the Edha AWA table (0→10, 1→15, 2–3→20, 4→25, 5+→30) governs adversary sheets AND token
 * sight, exactly as it does PCs; a block's explicit `senses` stays the bespoke override.
 *
 * These cases pin the four things the item has to keep true:
 *   1. the build-time table (scripts/foundry-build-parts.js) equals the runtime one term-for-term;
 *   2. the sheet derivation reaches adversaries (AWA 0 → 10, not 5) and leaves PCs unchanged;
 *   3. the token-default hooks (preCreateActor / updateActor) reach every actor type;
 *   4. the one authored override block (Briar-Gone Grove, 30 ft) reads its explicit value on both
 *      surfaces — the escape hatch is testable because there is finally an instance of it.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { loadEngine, fireHook } = require("./harness.js");
const { sensesRangeFtFromAwa, advSensesRangeFt } = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));

const env = loadEngine();

// The cosmere DerivedValueField shape (as in derived-stats.test.js): value = base + bonus,
// base = useOverride ? override : derived.
function derived(d, { override = null, useOverride = false, bonus = 0 } = {}) {
  const o = { derived: d, override, useOverride, bonus };
  Object.defineProperty(o, "base", { get() { return this.useOverride ? this.override : this.derived; } });
  Object.defineProperty(o, "value", { get() { return this.base + this.bonus; } });
  return o;
}
const systemLadder = (awa) => [5, 10, 20, 50, 100, Number.MAX_SAFE_INTEGER][Math.min(Math.ceil(awa / 2), 5)];
function actor(type, { awa = 0, senses = null } = {}) {
  return {
    type,
    system: {
      attributes: { awa: { value: awa, bonus: 0 }, spd: { value: 0, bonus: 0 }, str: { value: 0, bonus: 0 } },
      resources: { hea: { value: 10, max: derived(10) } },
      movement: { walk: { rate: derived(25) } },
      senses: { range: senses == null ? derived(systemLadder(awa)) : derived(systemLadder(awa), { override: senses, useOverride: true }) },
    },
    _source: { system: { resources: { hea: { value: 10, max: { bonus: 0 } } }, movement: { walk: { rate: { useOverride: false } } } } },
  };
}

// --- 1. build-time table == runtime table --------------------------------------------------------
test("R-56: the build's sensesRangeFtFromAwa equals the engine's edhaSensesRangeFtFromAwa for AWA 0..7", () => {
  for (let awa = 0; awa <= 7; awa++) {
    assert.strictEqual(sensesRangeFtFromAwa(awa), env.edhaSensesRangeFtFromAwa(awa), `AWA ${awa}`);
  }
  assert.strictEqual(sensesRangeFtFromAwa(0), 10);   // the number the ruling names
});

test("advSensesRangeFt: no `senses` → the table at AWA 0 (10 ft); an explicit `senses` wins; 0/junk falls back", () => {
  assert.strictEqual(advSensesRangeFt({}), 10);
  assert.strictEqual(advSensesRangeFt({ senses: 30 }), 30);
  assert.strictEqual(advSensesRangeFt({ senses: 0 }), 10);
  assert.strictEqual(advSensesRangeFt({ senses: "x" }), 10);
});

// --- 2. the sheet derivation reaches adversaries -----------------------------------------------
test("R-56: an adversary at AWA 0 derives 10 ft on the sheet (was the cosmere ladder's 5)", () => {
  const a = actor("adversary", { awa: 0 });
  assert.strictEqual(a.system.senses.range.value, 5);      // what the system prepared
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.derived, 10);
  assert.strictEqual(a.system.senses.range.value, 10);     // what the sheet now shows
  // and the same number the build stamps on its prototype token
  assert.strictEqual(advSensesRangeFt({}), a.system.senses.range.value);
});

test("R-56: the adversary derivation is the same table as the PC one at every AWA", () => {
  for (let awa = 0; awa <= 6; awa++) {
    const adv = actor("adversary", { awa }), pc = actor("character", { awa });
    env.edhaDeriveSheetStats(adv); env.edhaDeriveSheetStats(pc);
    assert.strictEqual(adv.system.senses.range.derived, pc.system.senses.range.derived, `AWA ${awa}`);
  }
});

test("NEGATIVE: a character is unchanged by item 55 — AWA 0 still reads 10 ft, HP/Speed rules untouched", () => {
  const a = actor("character", { awa: 0 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.value, 10);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, true);   // the PC speed rule still applies
  assert.strictEqual(a.system.movement.walk.rate.override, 20);
});

test("NEGATIVE: the adversary derivation stops at senses — no speed override, no HP touch", () => {
  const a = actor("adversary", { awa: 0 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, false);
  assert.strictEqual(a.system.resources.hea.max.value, 10);
});

// --- 4. the override block ------------------------------------------------------------------------
test("R-56: an adversary carrying an explicit `senses` override (the build's shape) still reads it on the sheet", () => {
  const a = actor("adversary", { awa: 0, senses: 30 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.derived, 10);   // the table is written underneath…
  assert.strictEqual(a.system.senses.range.value, 30);     // …but the override decides
});

test("data: Briar-Gone Grove is the one authored `senses` override (30 ft) and the build reads it for its token", () => {
  const adv = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "adversaries.json"), "utf8"));
  const grove = adv["Briar-Gone Grove"];
  assert.ok(grove, "Briar-Gone Grove block exists");
  assert.strictEqual(grove.senses, 30);
  assert.strictEqual(advSensesRangeFt(grove), 30);
  const withOverride = Object.entries(adv).filter(([k, v]) => k !== "_README" && v && v.senses != null).map(([k]) => k);
  assert.deepStrictEqual(withOverride, ["Briar-Gone Grove"]);   // update this list when a second creature earns one
});

// --- 3. the token-default hooks reach every actor type ----------------------------------------
function creatingDoc(type, awa = 0) {
  const writes = [];
  return { doc: { type, system: { attributes: { awa: { value: awa } } }, updateSource: (u) => writes.push(u) }, writes };
}

test("R-56: preCreateActor stamps sight = table(AWA) on a NEW adversary too (10 ft at AWA 0), without the PC's displayName", async () => {
  const { doc, writes } = creatingDoc("adversary", 0);
  await fireHook(env, "preCreateActor", doc, {});
  const w = writes.find((u) => u.prototypeToken?.sight);
  assert.ok(w, "the token-default hook wrote a prototype token");
  // (JSON round-trip: the engine's object literal comes from the vm realm, so a strict deep-equal
  // sees a different Object prototype)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w.prototypeToken.sight)), { enabled: true, range: 10, visionMode: "sense", attenuation: 0.1 });
  assert.strictEqual(w.prototypeToken.displayName, undefined);   // adversaries do not get HOVER(30)
});

test("a NEW character still gets HOVER(30) + sight = table(AWA) (AWA 2 → 20 ft)", async () => {
  const { doc, writes } = creatingDoc("character", 2);
  await fireHook(env, "preCreateActor", doc, {});
  const w = writes.find((u) => u.prototypeToken?.sight);
  assert.strictEqual(w.prototypeToken.displayName, 30);
  assert.strictEqual(w.prototypeToken.sight.range, 20);
});

test("NEGATIVE: a pack-built / imported adversary that already carries a sight range is left alone", async () => {
  const { doc, writes } = creatingDoc("adversary", 0);
  await fireHook(env, "preCreateActor", doc, { prototypeToken: { sight: { range: 30 } } });
  assert.strictEqual(writes.filter((u) => u.prototypeToken?.sight).length, 0);
});

test("R-56: the AWA updateActor watcher pushes the table onto an adversary's prototype token", async () => {
  const updates = [];
  const a = { id: "adv1", type: "adversary", system: { attributes: { awa: { value: 4 } } }, update: async (u) => { updates.push(u); } };
  const saved = { user: env.game.user, users: env.game.users, scenes: env.game.scenes };
  env.game.user = { id: "gm-1", isGM: true };
  env.game.users = { activeGM: { id: "gm-1", isSelf: true } };
  env.game.scenes = [];
  try {
    await fireHook(env, "updateActor", a, { system: { attributes: { awa: { value: 4 } } } });
  } finally { Object.assign(env.game, saved); }
  assert.deepStrictEqual(JSON.parse(JSON.stringify(updates)), [{ "prototypeToken.sight.range": 25 }]);
});
