/* HOOK-LAYER COVERAGE — `cosmere-rpg.preUseItem` dispatch (TODO item 5, behaviour 1 of 3).
 *
 * The suite covers ~8 pure helpers of a ~19.7k-line engine; the ~240 registered hooks — the actual
 * game logic — were only smoke-tested ("the engine loads without throwing"). These cases drive the
 * REAL registered chain through `fireHook`, with stub documents, and assert what the hook WRITES.
 *
 * The behaviour under test is the single-target gate (Ben ruling R1, 07-12; moved onto the talent's
 * own `edha-single-target` rule 07-24v). It is the right first hook to pin for three reasons:
 *   • it is document-driven — nothing in the engine names the talent, so this file proves iron
 *     rule 2b holds for it: rename the talent and the gate still fires, delete the rule and it
 *     stops. Both directions are cases below.
 *   • its veto is PRE-COST (`return false` from `preUseItem` cancels before the system charges),
 *     which is the "nothing spent" guarantee the whole deity-takeover retirement rests on.
 *   • its second half performs a real write — `edhaSetUserTargets`, the ONE writer of
 *     `game.user.targets` — so the card the veto posts is verifiable end to end: click a button,
 *     assert the retarget, assert the talent re-used.
 *
 * The whole registered `cosmere-rpg.preUseItem` chain runs (21+ handlers), not just the gate: a
 * verdict is `results.includes(false)`, which is also how a later handler double-vetoing, throwing,
 * or writing on an item that is none of its business would show up here.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockItem, stageWorld, withStubs, captureChat, eq } = require("./harness.js");

const env = loadEngine();
const USER_ID = "user-1";

/* A placeable token that records every `setTarget` call. Foundry v13 removed
 * `User#updateTokenTargets`, so `Token#setTarget(on, {releaseOthers})` IS the retarget API and the
 * argument shape is the assertion — `releaseOthers: true` on the FIRST token is what drops the
 * previous target set. */
function mockToken(id, name, actor, disposition = -1) {
  const tok = {
    id, name, actor,
    document: { id, disposition, uuid: `Scene.s1.Token.${id}` },
    calls: [],
    setTarget(on, opts = {}) { tok.calls.push({ on: !!on, releaseOthers: opts.releaseOthers }); },
  };
  return tok;
}

function gateTalent({ actor, name = "Withering Ray", note, rule = true } = {}) {
  return mockItem({
    name, id: "talent-1", uuid: "Actor.caster.Item.talent-1", actor,
    events: rule ? [{ handler: { type: "edha-single-target", ...(note ? { note } : {}) } }] : [],
    system: { activation: { type: "skill_test" } },
  });
}

/* One use of a talent with `targets` currently targeted. Returns the whole chain's verdicts plus
 * every card the chain posted. Nothing here knows which registration owns the gate. */
async function useWithTargets(item, targets, { isGM = false } = {}) {
  const cards = captureChat(env);
  const world = stageWorld(env, {
    user: { id: USER_ID, isGM, targets: new Set(targets), character: null },
    users: { activeGM: { isSelf: isGM } },
    actors: [], placeables: targets,
  });
  try {
    const results = await fireHook(env, "cosmere-rpg.preUseItem", item);
    return { vetoed: results.includes(false), cards, results };
  } finally { world.undo(); }
}

/* ---- 1. The veto: two targets on a single-target talent ------------------------------------- */

test("two targets on an `edha-single-target` talent VETO the use pre-cost", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { vetoed } = await useWithTargets(item, [t1, t2]);
  assert.strictEqual(vetoed, true,
    "`false` from preUseItem is the ONLY pre-cost refusal — a later cancel has already charged");
  assert.deepStrictEqual(t1.calls, [], "the gate must not retarget on its own; the player picks");
  assert.deepStrictEqual(t2.calls, []);
});

test("the veto posts ONE picker card, whispered to the using client only", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster, note: "Pick the one you meant." });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { cards } = await useWithTargets(item, [t1, t2]);
  assert.strictEqual(cards.length, 1, "exactly one card — a second means two handlers claimed this item");
  const card = cards[0];
  // `eq`, not deepStrictEqual: the whisper array is built inside the vm realm.
  eq(card.whisper, [USER_ID]);   // R1 is a prompt to the person who mis-targeted — a public card
                                 // would name their mistake to the whole table.
  assert.strictEqual(card.owner, "Bench — Black", "spoken by the caster, not the target");
  assert.ok(/single-target/.test(card.content) && /<strong>2<\/strong>/.test(card.content),
    "the card must say how many are targeted — an off-screen extra target is the usual cause");
  assert.ok(card.content.includes("Pick the one you meant."), "the rule's own `note` rides the card");
});

test("the picker card carries one button per target, each addressed by TOKEN id and item uuid", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { cards } = await useWithTargets(item, [t1, t2]);
  const btns = [...cards[0].content.matchAll(/data-edha-item="([^"]+)" data-edha-token="([^"]+)">([^<]*)</g)]
    .map((m) => ({ item: m[1], token: m[2], label: m[3] }));
  assert.deepStrictEqual(btns, [
    { item: "Actor.caster.Item.talent-1", token: "tok-a", label: "Husk A" },
    { item: "Actor.caster.Item.talent-1", token: "tok-b", label: "Husk B" },
  ], "the button addresses the TOKEN (two tokens can share one actor), and re-finds the talent by uuid");
});

/* ---- 2. The write: clicking a button retargets and re-uses ---------------------------------- */

test("clicking a picker button WRITES the target set to that one token and re-uses the talent", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const world = stageWorld(env, { user: { id: USER_ID, isGM: false, targets: new Set([t1, t2]) }, placeables: [t1, t2] });
  try {
    await withStubs(env, {
      fromUuid: async (uuid) => (uuid === item.uuid ? item : null),
      canvas: { ...env.canvas, tokens: { placeables: [t1, t2], get: (id) => [t1, t2].find((t) => t.id === id) ?? null } },
    }, () => env.edhaPickTargetClick({
      preventDefault() {},
      currentTarget: { dataset: { edhaItem: item.uuid, edhaToken: "tok-b" } },
    }));
  } finally { world.undo(); }

  assert.deepStrictEqual(t2.calls, [{ on: true, releaseOthers: true }],
    "the picked token is targeted with releaseOthers:true — that single call IS what drops the other target");
  assert.deepStrictEqual(t1.calls, [],
    "the unpicked token is never touched; releasing it is releaseOthers' job, not a second write");
  assert.strictEqual(item.uses.length, 1,
    "the click re-uses the talent — the veto refunded nothing because nothing was ever spent");
});

test("a picker click whose token has left the scene writes nothing and re-uses nothing", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const warned = [];
  const world = stageWorld(env, { user: { id: USER_ID, isGM: false, targets: new Set() }, placeables: [] });
  try {
    await withStubs(env, {
      fromUuid: async () => item,
      canvas: { ...env.canvas, tokens: { placeables: [], get: () => null } },
      ui: { notifications: { warn: (m) => warned.push(m), info() {}, error() {} } },
    }, () => env.edhaPickTargetClick({
      preventDefault() {},
      currentTarget: { dataset: { edhaItem: item.uuid, edhaToken: "gone" } },
    }));
  } finally { world.undo(); }
  assert.strictEqual(item.uses.length, 0, "a stale card must not fire the talent at whatever is targeted now");
  assert.strictEqual(warned.length, 1, "the player is told to retarget rather than left with a dead button");
});

/* ---- 3. It is the RULE, not the name (iron rule 2b) ----------------------------------------- */

test("the same talent with the rule DELETED is not gated, however many targets", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster, rule: false });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { vetoed, cards } = await useWithTargets(item, [t1, t2]);
  assert.strictEqual(vetoed, false, "with no `edha-single-target` rule there is nothing to gate");
  assert.strictEqual(cards.length, 0);
});

test("RENAMING the talent changes nothing — the gate reads the document, never the name", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster, name: "Ray, Withering (Ben's rename)" });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { vetoed, cards } = await useWithTargets(item, [t1, t2]);
  assert.strictEqual(vetoed, true, "a rename that unwires a talent is exactly what iron rule 2b forbids");
  assert.ok(cards[0].content.includes("Ray, Withering (Ben&#x27;s rename)") || cards[0].content.includes("Ray, Withering"),
    "the card names whatever the talent is called now");
});

test("a non-talent item carrying the rule is ignored (edhaIsTalent is the type gate)", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  item.type = "weapon";
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));
  const t2 = mockToken("tok-b", "Husk B", mockActor({ name: "Husk B", id: "husk-b" }));

  const { vetoed, cards } = await useWithTargets(item, [t1, t2]);
  assert.strictEqual(vetoed, false, "a Strike with two targets is a legitimate multi-attack, not a mis-target");
  assert.strictEqual(cards.length, 0);
});

/* ---- 4. Controls: one target, and none ------------------------------------------------------ */

test("ONE target passes the gate untouched — the ordinary case must stay free", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const t1 = mockToken("tok-a", "Husk A", mockActor({ name: "Husk A", id: "husk-a" }));

  const { vetoed, cards } = await useWithTargets(item, [t1]);
  assert.strictEqual(vetoed, false);
  assert.strictEqual(cards.length, 0, "no card on the happy path — a prompt every use is noise");
  assert.deepStrictEqual(t1.calls, [], "one target is already the answer; retargeting it would be a no-op write");
});

test("ZERO targets is NOT this gate's veto (H1's `requireTarget` owns that refusal)", async () => {
  const caster = mockActor({ name: "Bench — Black", id: "caster" });
  const item = gateTalent({ actor: caster });
  const { cards } = await useWithTargets(item, []);
  assert.strictEqual(cards.length, 0,
    "with nothing targeted there is nothing to list — a picker card with no buttons is a dead end");
});
