/* Item 56 / R-14 (Ben, 2026-09-06: "follow each rider's own card") — the melee mutation riders'
 * per-rule GRAZE dial.
 *
 * The three riders that ride a buffed creature's own applyDamage — Bone Spurs (+keen, pre-pass),
 * Venom Glands (Afflicted, post-pass) and Apex Form's +vital (pre-pass) — used to fire on every
 * application, the graze half of a damage card included, because the system hands
 * `actor.applyDamage(instances, { originatingItem })` a plain number with no hit/graze marker.
 * Now: (1) `edhaApplyIsGraze` reads an explicit `options.edhaGraze` or the breadcrumb the
 * `onClickApplyButton` wrap stamps for the lifetime of a card click; (2) each rider's rule carries
 * its own dial (`keenOnGraze` / `venomOnGraze` on edha-mutation, `vitalOnGraze` on edha-regen-grant),
 * baked onto the flag as `mutation.onGraze` / `apexForm.vitalOnGraze`; (3) the readers stand down
 * on a graze ONLY for an explicit `false` — a flag without the field behaves exactly as before.
 *
 * Every case below was shown failing under a one-line reversion (see the PR body): drop the
 * `graze && m.onGraze === false` gate and the hit-only cases fail; drop the `=== false` and the
 * no-field cases fail; drop the breadcrumb and the click case fails.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, captureChat, withStubs } = require("./harness.js");

const MELEE = { type: "weapon", name: "Bench Sword", system: { attack: { type: "melee" } } };

function dealer(flags) { return mockActor({ name: "Bench — Life", flags }); }
const hitList = () => [{ amount: 6, type: "keen" }];
const has = (cards, text) => cards.some((c) => c.content.includes(text));

/* ---- Bone Spurs — "melee attacks DEAL additional Keen" → onGraze: true (fires on both) ------ */

test("Bone Spurs with onGraze: true adds its keen on a graze AND on a hit", () => {
  const env = loadEngine();
  const cards = captureChat(env);
  for (const graze of [true, false]) {
    const list = hitList();
    env.edhaLifeOutgoingBonus(dealer({ mutation: { kind: "boneSpurs", keen: 2, onGraze: true } }), list, MELEE, graze);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(list)).at(-1), { amount: 2, type: "keen" }, `graze=${graze}: the +keen instance lands`);
  }
  assert.ok(has(cards, "+2 keen on the strike"), "the rider card posts");
});

/* ---- A hit-only rider (onGraze: false) — the R-14 "on a hit" wording --------------------------- */

test("a hit-only Bone Spurs (onGraze: false) does NOT fire on a graze and DOES on a hit", () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const grazeList = hitList();
  env.edhaLifeOutgoingBonus(dealer({ mutation: { kind: "boneSpurs", keen: 2, onGraze: false } }), grazeList, MELEE, true);
  assert.strictEqual(grazeList.length, 1, "graze: no +keen instance");
  assert.ok(has(cards, "graze — the rider fires on a hit only"), "graze: the stand-down note posts");
  const hitList2 = hitList();
  env.edhaLifeOutgoingBonus(dealer({ mutation: { kind: "boneSpurs", keen: 2, onGraze: false } }), hitList2, MELEE, false);
  assert.strictEqual(hitList2.length, 2, "hit: the +keen instance lands");
});

/* ---- A flag WITHOUT the field — today's behaviour, untouched ---------------------------------- */

test("a mutation flag without onGraze (pre-dial scene, or an unset rule) still fires on a graze", () => {
  const env = loadEngine();
  captureChat(env);
  const list = hitList();
  env.edhaLifeOutgoingBonus(dealer({ mutation: { kind: "boneSpurs", keen: 2 } }), list, MELEE, true);
  assert.strictEqual(list.length, 2, "absent field = fires on a graze, exactly as before item 56");
});

/* ---- Venom Glands — "melee HITS inflict Afflicted" → onGraze: false (what the authored rule ships) */

async function venom(env, flags, graze) {
  const cards = captureChat(env);
  const calls = [];
  const victim = mockActor({ name: "Bench Target" });
  await withStubs(env, {
    edhaToggleStatus: async (a, s, on) => { calls.push(["status", s, on]); },
    edhaAddAffliction: async (a, amt, type, src) => { calls.push(["afflict", amt, type, src]); },
  }, () => env.edhaLifeVenomOnHit(dealer(flags), victim, MELEE, graze));
  return { cards, calls };
}

test("Venom Glands with onGraze: false does NOT envenom on a graze", async () => {
  const env = loadEngine();
  const { cards, calls } = await venom(env, { mutation: { kind: "venomGlands", venom: 3, onGraze: false } }, true);
  assert.deepStrictEqual(calls, [], "no Afflicted, no affliction entry");
  assert.ok(has(cards, "graze — the venom needs a melee hit"), "the stand-down note posts");
});

test("...and DOES envenom on a hit", async () => {
  const env = loadEngine();
  const { calls } = await venom(env, { mutation: { kind: "venomGlands", venom: 3, onGraze: false } }, false);
  assert.deepStrictEqual(calls, [["status", "afflicted", true], ["afflict", 3, "vital", "Venom Glands"]]);
});

test("a Venom flag without the field envenoms on a graze (unchanged)", async () => {
  const env = loadEngine();
  const { calls } = await venom(env, { mutation: { kind: "venomGlands", venom: 3 } }, true);
  assert.strictEqual(calls.length, 2, "absent field = fires on a graze, as before");
});

/* ---- Apex Form's +vital — "DEALS additional Vital damage on all attacks" → vitalOnGraze: true ---- */

test("Apex +vital: vitalOnGraze true (or absent) fires on a graze; an explicit false stands down", () => {
  const env = loadEngine();
  captureChat(env);
  for (const [flag, expectLen] of [[{ vital: 2, vitalOnGraze: true }, 2], [{ vital: 2 }, 2], [{ vital: 2, vitalOnGraze: false }, 1]]) {
    const list = hitList();
    env.edhaLifeOutgoingBonus(dealer({ apexForm: flag }), list, MELEE, true);
    assert.strictEqual(list.length, expectLen, `apexForm=${JSON.stringify(flag)} on a graze`);
  }
});

/* ---- The discriminator: explicit option, else the Apply-click breadcrumb ---------------------- */

test("edhaApplyIsGraze: options.edhaGraze wins; otherwise the card-click breadcrumb; otherwise a hit", async () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaApplyIsGraze({ edhaGraze: true }), true);
  assert.strictEqual(env.edhaApplyIsGraze({ edhaGraze: false }), false);
  assert.strictEqual(env.edhaApplyIsGraze({}), false, "no click in flight = a hit (today's default)");
  // A graze-toggled card's Apply click: the breadcrumb is live for exactly the click's lifetime.
  let seenDuring = null;
  const msg = { useGraze: true };
  await env.edhaWrapApplyClick.call(msg, async () => { seenDuring = env.edhaApplyIsGraze({ originatingItem: null }); }, {}, null);
  assert.strictEqual(seenDuring, true, "inside the click of a graze-toggled card, applyDamage reads graze");
  assert.strictEqual(env.edhaApplyIsGraze({}), false, "cleared once the click resolves");
  let seenHit = null;
  await env.edhaWrapApplyClick.call({ useGraze: false }, async () => { seenHit = env.edhaApplyIsGraze({}); }, {}, null);
  assert.strictEqual(seenHit, false, "a hit-toggled card reads as a hit");
});

/* ---- The chooser bakes the rule's dial onto the flag (absent field = no key written) ---------- */

test("the adaptation chooser carries each rider's dial into the card's buttons", () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = dealer({});
  env.edhaPostMutationCard(owner, owner, "Adaptive Mutation", { keenFormula: "@tier", venomFormula: "1", deflectAmount: 2, keenOnGraze: true, venomOnGraze: false });
  const html = cards[0].content;
  assert.ok(/data-edha-kind="boneSpurs"[^>]*data-edha-ongraze="1"/.test(html), "Bone Spurs: grazes count");
  assert.ok(/data-edha-kind="venomGlands"[^>]*data-edha-ongraze="0"/.test(html), "Venom Glands: hit only");
});
