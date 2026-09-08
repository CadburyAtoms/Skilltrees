/* ONE senses rule for PCs and adversaries alike — and since 2026-09-07 that rule is the COSMERE
 * SYSTEM'S OWN LADDER. EDHA_RULINGS.md R-56 (final answer), TODO_REPO_HYGIENE #83.
 *
 * The history this file has now been through twice, because the reversal only makes sense against it:
 *   • before item 55 — three surfaces disagreed about the SAME creature (bench run 22, measured at
 *     whole-population scale): every world adversary's SHEET read the cosmere ladder's 5 ft at AWA 0
 *     (`edhaDeriveSheetStats` opened with `if (actor?.type !== "character") return;`), every pack
 *     adversary's prototype TOKEN carried a flat 10 ft the build hard-coded, and the sync pushed that
 *     10 onto placed tokens while the actor still said 5 — 52 of 52 internally mismatched;
 *   • item 55 / R-56 (a) (2026-09-06, PR #240) — the EDHA AWA table (0→10, 1→15, 2–3→20, 4→25,
 *     5+→30) was extended to adversary sheets AND token sight, so all three surfaces read 10 at AWA 0;
 *   • item 83 / R-56 FINAL (2026-09-07, Ben verbatim: "Cosmere ladder for everyone") — REVERSED.
 *     The system's `[5, 10, 20, 50, 100, ∞][ceil(AWA/2)]` governs every actor type, so AWA 0 is
 *     **5 ft** on both surfaces. The engine's sheet write is GONE rather than re-tabled: the system's
 *     `CommonActorDataModel.prepareSecondaryDerivedData` (cosmere-rpg 2.1.0 index.js:8455-8457),
 *     reached by CharacterActorDataModel (:17628 supers into it) and AdversaryActorDataModel (:25877)
 *     alike, already writes exactly that number — so the fix is an ABSENCE, and these cases pin the
 *     absence. A block's explicit `senses` stays the bespoke override throughout.
 *
 * These cases pin the four things the reversal has to keep true:
 *   1. the build-time ladder (scripts/foundry-build-parts.js) equals the runtime one term-for-term;
 *   2. the sheet derivation LEAVES the system's number alone — for adversaries and PCs both;
 *   3. the token-default hooks (preCreateActor / updateActor) stamp the ladder for every actor type;
 *   4. the one authored override block (Briar-Gone Grove, 30 ft) reads its explicit value on both
 *      surfaces — the escape hatch survives the reversal, which is the clause the ruling names.
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
// The system's own ladder, written out longhand here on purpose: this file must not read the
// number it is checking out of the code under test.
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

// --- 1. build-time ladder == runtime ladder ------------------------------------------------------
test("R-56 (item 83): the build's sensesRangeFtFromAwa equals the engine's edhaSensesRangeFtFromAwa for AWA 0..10", () => {
  for (let awa = 0; awa <= 10; awa++) {
    assert.strictEqual(sensesRangeFtFromAwa(awa), env.edhaSensesRangeFtFromAwa(awa), `AWA ${awa}`);
    assert.strictEqual(sensesRangeFtFromAwa(awa), systemLadder(awa), `AWA ${awa} vs the system's ladder`);
  }
  assert.strictEqual(sensesRangeFtFromAwa(0), 5);   // the number the final ruling names
});

test("advSensesRangeFt: no `senses` → the ladder at AWA 0 (5 ft); an explicit `senses` wins; 0/junk falls back", () => {
  assert.strictEqual(advSensesRangeFt({}), 5);
  assert.strictEqual(advSensesRangeFt({ senses: 30 }), 30);
  assert.strictEqual(advSensesRangeFt({ senses: 0 }), 5);
  assert.strictEqual(advSensesRangeFt({ senses: "x" }), 5);
});

// --- 2. the sheet derivation leaves the system's number alone ------------------------------------
test("R-56 (item 83): an adversary at AWA 0 keeps the system's 5 ft on the sheet — the engine writes nothing", () => {
  const a = actor("adversary", { awa: 0 });
  assert.strictEqual(a.system.senses.range.value, 5);      // what the system prepared
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.derived, 5);    // …and what survives (was 10 under R-56 (a))
  assert.strictEqual(a.system.senses.range.value, 5);
  // and the same number the build stamps on its prototype token
  assert.strictEqual(advSensesRangeFt({}), a.system.senses.range.value);
});

test("R-56 (item 83): PCs and adversaries read the SAME number at every AWA, and it is the system's", () => {
  for (let awa = 0; awa <= 10; awa++) {
    const adv = actor("adversary", { awa }), pc = actor("character", { awa });
    env.edhaDeriveSheetStats(adv); env.edhaDeriveSheetStats(pc);
    assert.strictEqual(adv.system.senses.range.derived, pc.system.senses.range.derived, `AWA ${awa}`);
    assert.strictEqual(adv.system.senses.range.derived, systemLadder(awa), `AWA ${awa} is the system's rung`);
  }
});

test("NEGATIVE: a character's OTHER Edha derivations are untouched by the reversal", () => {
  const a = actor("character", { awa: 0 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.value, 5);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, true);   // the PC speed rule still applies
  assert.strictEqual(a.system.movement.walk.rate.override, 20);
});

test("NEGATIVE: the adversary path still gets no speed override and no HP touch", () => {
  const a = actor("adversary", { awa: 0 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, false);
  assert.strictEqual(a.system.resources.hea.max.value, 10);
});

// --- 4. the override block ------------------------------------------------------------------------
test("R-56 (item 83): an adversary carrying an explicit `senses` override (the build's shape) still reads it on the sheet", () => {
  const a = actor("adversary", { awa: 0, senses: 30 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.derived, 5);    // the system's ladder underneath…
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
function creatingDoc(type, awa = 0, bonus = 0) {
  const writes = [];
  return { doc: { type, system: { attributes: { awa: { value: awa, bonus } } }, updateSource: (u) => writes.push(u) }, writes };
}

test("R-56 (item 83): preCreateActor stamps sight = ladder(AWA) on a NEW adversary too (5 ft at AWA 0), without the PC's displayName", async () => {
  const { doc, writes } = creatingDoc("adversary", 0);
  await fireHook(env, "preCreateActor", doc, {});
  const w = writes.find((u) => u.prototypeToken?.sight);
  assert.ok(w, "the token-default hook wrote a prototype token");
  // (JSON round-trip: the engine's object literal comes from the vm realm, so a strict deep-equal
  // sees a different Object prototype)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w.prototypeToken.sight)), { enabled: true, range: 5, visionMode: "sense", attenuation: 0.1 });
  assert.strictEqual(w.prototypeToken.displayName, undefined);   // adversaries do not get HOVER(30)
});

test("a NEW character still gets HOVER(30) + sight = ladder(AWA) (AWA 2 → 10 ft)", async () => {
  const { doc, writes } = creatingDoc("character", 2);
  await fireHook(env, "preCreateActor", doc, {});
  const w = writes.find((u) => u.prototypeToken?.sight);
  assert.strictEqual(w.prototypeToken.displayName, 30);
  assert.strictEqual(w.prototypeToken.sight.range, 10);
});

test("R-56 (item 83): the token stamp reads AWA value + bonus, so it cannot fall behind the sheet", async () => {
  const { doc, writes } = creatingDoc("character", 2, 2);   // an AE adding +2 AWA → ladder(4) = 20
  await fireHook(env, "preCreateActor", doc, {});
  const w = writes.find((u) => u.prototypeToken?.sight);
  assert.strictEqual(w.prototypeToken.sight.range, 20);
});

test("NEGATIVE: a pack-built / imported adversary that already carries a sight range is left alone", async () => {
  const { doc, writes } = creatingDoc("adversary", 0);
  await fireHook(env, "preCreateActor", doc, { prototypeToken: { sight: { range: 30 } } });
  assert.strictEqual(writes.filter((u) => u.prototypeToken?.sight).length, 0);
});

test("R-56 (item 83): the AWA updateActor watcher pushes the ladder onto an adversary's prototype token", async () => {
  const updates = [];
  const a = { id: "adv1", type: "adversary", system: { attributes: { awa: { value: 4, bonus: 0 } } }, update: async (u) => { updates.push(u); } };
  const saved = { user: env.game.user, users: env.game.users, scenes: env.game.scenes };
  env.game.user = { id: "gm-1", isGM: true };
  env.game.users = { activeGM: { id: "gm-1", isSelf: true } };
  env.game.scenes = [];
  try {
    await fireHook(env, "updateActor", a, { system: { attributes: { awa: { value: 4 } } } });
  } finally { Object.assign(env.game, saved); }
  assert.deepStrictEqual(JSON.parse(JSON.stringify(updates)), [{ "prototypeToken.sight.range": 20 }]);   // was 25 under the Edha table
});
