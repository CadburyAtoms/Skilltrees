/* REGRESSION — an authored **0** was silently reverted to the code's default by `x || <number>`
 * (found bench run 20, 2026-07-28f; root-caused and swept 2026-07-28g, fix pass D).
 *
 * THE REPORTED INSTANCE. The Stitchmother's Reknit Form authors `costTemporary: 0` /
 * `costPermanent: 0` (her card's flat 1 Inv + 1 Focus is already paid at use). The menu card
 * RENDERED the zeroes correctly — `edhaPostReknitCard` tests `h?.costTemporary == null`, the right
 * idiom — and then `edhaReknitClick` read
 *     const cost = Number(ds.edhaCost) || 2;
 * so the click charged **2 Investiture** (measured 10 → 8) under a button reading "−0 Investiture".
 * Display and behaviour disagreed because one used `== null` and the other used `||`.
 *
 * THE FAMILY. 413 `|| <number>` sites in the engine; 168 with a non-zero default; ~31 of those read
 * an AUTHORED or dataset value. Four are bugs, and the discriminator is provenance, not shape:
 *   · `Number(ds.edhaCost) || 2`        — `edha-remove-injury` costs, `initial: 2/3`. LIVE (1 rule).
 *   · `Number(spec.speed) || 25`        — `edha-summon` / `edha-illusion-copy` speed. LIVE (4 rules:
 *     Holographic Illusion, Phantom Double, and The Seeming's two copies — every one of them a
 *     STATIC illusion, "its image stands a pace from its body", each given a 25 ft walk).
 *   · `Number(hc.handler.fraction) || 0.5` — `edha-heal-cut`. Latent, but `edhaHealCutInfo` has an
 *     explicit `fraction === 0` branch ("cannot regain HP") the writer could never reach.
 *   · `Number(s.amount) || 2`           — `edha-defense-buff`, whose OWN scene-window branch reads
 *     the same field as `|| 0; if (!amt) return`. Latent; the two branches contradicted each other.
 * Everything else is a runtime Foundry lookup (grid size, tier, level, a hypot magnitude — 0 there
 * is a failed read), a value already clamped by `Math.max(1, …)`, or a field whose 0 is normalised
 * at the WRITER with an explicit `> 0 ? :` (the charge ledger, the combustion dataset,
 * `edha-detonate-list.radiusFt` — the model of how to do it).
 *
 * These cases pin the **0** specifically. A case using a non-zero cost passes on the broken code.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { loadEngine } = require("./harness.js");

const REPO = path.join(__dirname, "..");

/* ---- 1. the primitive ------------------------------------------------------------------------ */

test("edhaNumOr keeps an authored 0 and falls back only on absent/blank/non-numeric", () => {
  const env = loadEngine();
  const f = env.edhaNumOr;
  assert.strictEqual(f(0, 2), 0, "an authored 0 must survive — this is the whole bug");
  assert.strictEqual(f("0", 2), 0, "a dataset attribute is a STRING; \"0\" must survive too");
  assert.strictEqual(f(0.0, 25), 0);
  assert.strictEqual(f(-1, 1), -1, "a legitimate negative must survive (edha-die-step enemySteps)");
  assert.strictEqual(f(0.5, 2), 0.5);
  assert.strictEqual(f(undefined, 2), 2, "absent → the default");
  assert.strictEqual(f(null, 2), 2);
  assert.strictEqual(f("", 2), 2, "a blank data attribute is absent, not zero");
  assert.strictEqual(f("abc", 2), 2, "non-numeric → the default");
  assert.strictEqual(f(NaN, 2), 2);
  assert.strictEqual(f(Infinity, 2), 2, "Number.isFinite, not just !isNaN");
});

/* ---- 2. Reknit Form: the reported instance, end to end --------------------------------------- */

function makeInjuryActor(name, { inv = 10 } = {}) {
  const updates = [], deleted = [];
  return {
    name, id: name, uuid: `Actor.${name}`, isOwner: true,
    system: { resources: { inv: { value: inv, max: 12 } } },
    items: Object.assign([], { get: (id) => ({ id, name: "Broken Arm" }) }),
    async update(u) { updates.push(u); this.system.resources.inv.value = u["system.resources.inv.value"]; },
    async deleteEmbeddedDocuments(_t, ids) { deleted.push(...ids); },
    __updates: updates, __deleted: deleted,
  };
}

async function clickReknit(env, costAttr) {
  const owner = makeInjuryActor("Stitchmother");
  const target = makeInjuryActor("Bench — Green", { inv: 4 });
  env.fromUuid = async (uuid) => (uuid === owner.uuid ? owner : uuid === target.uuid ? target : null);
  const cards = [];
  env.ChatMessage = { create: (m) => cards.push(m), getSpeaker: () => ({}) };
  const btn = {
    dataset: { edhaOwner: owner.uuid, edhaTarget: target.uuid, edhaInjury: "inj1", edhaCost: costAttr, edhaLabel: "Reknit%20Form" },
    closest: () => null, textContent: "",
  };
  await env.edhaReknitClick({ preventDefault() {}, currentTarget: btn });
  return { owner, target, cards };
}

test("Reknit Form with an authored cost of 0 charges NOTHING (the bug: it charged 2)", async () => {
  const env = loadEngine();
  const { owner, cards } = await clickReknit(env, "0");
  assert.strictEqual(owner.system.resources.inv.value, 10,
    "inv must be untouched at cost 0 — the broken engine measured 10 → 8");
  assert.ok(/−0 Investiture/.test(cards.map(c => c.content).join("")),
    "the result card must report the same 0 the button rendered");
});

test("POSITIVE CONTROL — a real cost of 2 still charges 2", async () => {
  const env = loadEngine();
  const { owner, cards } = await clickReknit(env, "2");
  assert.strictEqual(owner.system.resources.inv.value, 8, "10 − 2 = 8");
  assert.ok(/−2 Investiture/.test(cards.map(c => c.content).join("")));
});

test("NEGATIVE CONTROL — a MISSING cost attribute still falls back to 2", async () => {
  const env = loadEngine();
  const { owner } = await clickReknit(env, undefined);
  assert.strictEqual(owner.system.resources.inv.value, 8,
    "absent is not zero: the documented default must still apply");
});

/* ---- 3. the shipped rules that author 0, read through the primitive --------------------------- */

test("every shipped rule that authors a 0 resolves to 0, not to the code default", () => {
  const env = loadEngine();
  const files = ["data/authored/leyline-blue.json", "data/adversaries.json", "data/authored/leyline-green.json"];
  const zeros = { speed: [], cost: [] };
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    const h = o.handler;
    if (h && typeof h === "object") {
      if ((h.type === "edha-summon" || h.type === "edha-illusion-copy") && h.speed === 0) zeros.speed.push(h);
      if (h.type === "edha-remove-injury" && (h.costTemporary === 0 || h.costPermanent === 0)) zeros.cost.push(h);
    }
    Object.values(o).forEach(walk);
  };
  for (const f of files) walk(JSON.parse(fs.readFileSync(path.join(REPO, f), "utf8")));

  assert.strictEqual(zeros.speed.length, 4,
    "expected 4 static illusions authoring speed 0 (Holographic Illusion, Phantom Double, The Seeming ×2) — " +
    "if this changed, re-read the family write-up before adjusting the number");
  for (const h of zeros.speed) {
    assert.strictEqual(env.edhaNumOr(h.speed, 25), 0, "a static illusion must be IMMOBILE, not 25 ft");
  }
  assert.ok(zeros.cost.length >= 1, "Reknit Form still authors a zero cost");
  for (const h of zeros.cost) {
    assert.strictEqual(env.edhaNumOr(h.costTemporary, 2), 0);
    assert.strictEqual(env.edhaNumOr(h.costPermanent, 3), 0);
  }
});

/* ---- 4. edha-defense-buff: the two branches of ONE handler must agree ------------------------- */

function defBuffActor(amount) {
  const created = [];
  const rule = { event: "use", handler: { type: "edha-defense-buff", window: "round-until-turn", amount, defenses: ["phy"], label: "Guard" } };
  const talent = { name: "Guard Stance", type: "talent", hasEvents: () => true, enabledEvents: [rule] };
  return {
    name: "Guard", id: "guard", type: "character", items: [talent],
    effects: Object.assign([], { find: Array.prototype.find }),
    async createEmbeddedDocuments(_t, docs) { created.push(...docs); },
    getFlag: () => undefined, __created: created,
  };
}

test("edha-defense-buff amount 0 grants NOTHING (it granted +2), and 2 still grants +2", async () => {
  const env = loadEngine();
  env.CONST = { ACTIVE_EFFECT_MODES: { ADD: 2 } };
  const zero = defBuffActor(0);
  await env.edhaApplyDefBuff(zero);
  assert.strictEqual(zero.__created.length, 0,
    "amount 0 must create no effect — the scene-window branch of this same handler already bails on 0");

  const two = defBuffActor(2);                       // POSITIVE CONTROL
  await env.edhaApplyDefBuff(two);
  assert.strictEqual(two.__created.length, 1, "the ordinary case must still arm");
  assert.strictEqual(two.__created[0].changes[0].value, "2");
});

/* ---- 5. text ledger: the two sites whose enclosing function needs a live Foundry --------------- */

test("LEDGER — the swept sites keep the 0-safe read in engine code", () => {
  const src = fs.readFileSync(path.join(REPO, "module-src", "scripts", "register-skills.js"), "utf8");
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const dead of [
    "Number(ds.edhaCost) || 2",
    "Number(spec.speed) || 25",
    "Number(hc.handler.fraction) || 0.5",
    "Number(s.amount) || 2",
  ]) {
    assert.ok(!code.includes(dead), `regression: \`${dead}\` is back — an authored 0 is falsy`);
  }
  assert.ok(code.includes("edhaNumOr(spec.speed, 25)"), "the summon speed read must go through edhaNumOr");
  assert.ok(code.includes("edhaNumOr(hc.handler.fraction, 0.5)"), "the heal-cut fraction read must go through edhaNumOr");
});
