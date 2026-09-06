/* REGRESSION — R-13: a Fate snare laid UNDER a creature ARMS; it does not spring.
 * (EDHA_RULINGS.md R-13, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * The card says "the first enemy to ENTER OR PASS THROUGH it". Standing somewhere is neither — but
 * v13 delivers `tokenEnter` to a Region for every token already inside it the instant the Region
 * is created, and at the behavior that event is indistinguishable from a creature walking in. So
 * laying the trap on an occupied square detonated it on the spot, against the talent's own words.
 * Bench run 7 narrowed it exactly: placement ADJACENT never insta-sprang; only placement directly
 * under a creature did — which is the signature of the creation-time enter, not of the movement
 * path.
 *
 * The fix is a grandfathered set computed BEFORE the Region exists (`edhaFateOccupantsOfSquare`,
 * stamped on the behavior as `armedOver`). Those tokens are ignored on the enter events; their
 * next MOVE is the pass-through that springs it — which is why `tokenMoveOut` / `tokenMoveWithin`
 * joined the subscription. Nobody else's behaviour changes: a creature that walks in still springs
 * it on enter/move-in and is never sprung by a move event.
 *
 * Mutation: return `true` unconditionally from edhaSnareArmedSpringDecision and the first behavior
 * case fails — the snare springs at placement.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, eq, readEngineSource } = require("./harness.js");

const UNDER = "Scene.s1.Token.under";
const WALKER = "Scene.s1.Token.walker";

/* --- the decision, pure ------------------------------------------------------------------------ */

test("R-13: a token standing there at placement is ignored on ENTER, and springs on its next MOVE", () => {
  const env = loadEngine();
  const armed = [UNDER];
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenEnter", UNDER, armed), false, "placement is not an entry");
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveIn", UNDER, armed), false, "…nor is the twin event");
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveOut", UNDER, armed), true, "walking off IS the pass-through");
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveWithin", UNDER, armed), true, "so is shifting within the square");
});

test("R-13: everyone else is unchanged — enter springs, a move event never does", () => {
  const env = loadEngine();
  const armed = [UNDER];
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenEnter", WALKER, armed), true);
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveIn", WALKER, armed), true);
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveOut", WALKER, armed), false);
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenMoveWithin", WALKER, armed), false);
  // An EMPTY square (nobody grandfathered) behaves exactly as it always did.
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenEnter", WALKER, []), true);
  assert.strictEqual(env.edhaSnareArmedSpringDecision("tokenEnter", WALKER, undefined), true);
});

/* --- the occupant scan ------------------------------------------------------------------------- */

test("R-13: the placement scan finds the token ON the square and nobody adjacent", () => {
  const env = loadEngine();
  const td = (uuid, x, y) => ({ uuid, actor: {}, object: { center: { x, y } } });
  const scene = { id: "s1", grid: { size: 100, distance: 5 }, tokens: [
    td(UNDER, 500, 500),                  // dead centre of the 5 ft square at (500,500)
    td("Scene.s1.Token.adj", 600, 500),   // the NEXT square over — bench run 7's control
    td("Scene.s1.Token.far", 900, 900),
  ] };
  eq(env.edhaFateOccupantsOfSquare(scene, 500, 500), [UNDER]);   // eq(): a value built inside the vm carries that realm's prototypes
  // A token with no actor (a decoration, a light source token) is not a creature and never arms.
  const noActor = { id: "s1", grid: { size: 100, distance: 5 }, tokens: [{ uuid: "Scene.s1.Token.x", object: { center: { x: 500, y: 500 } } }] };
  eq(env.edhaFateOccupantsOfSquare(noActor, 500, 500), []);
});

/* --- the shipped RegionBehavior ---------------------------------------------------------------- */

/* Registers the real behavior classes and drives `_handleRegionEvent` the way the canvas would —
 * the same shape gm-gate.test.js uses for the three Region traps. */
function snareBehavior(env, armedOver) {
  env.edhaRegisterNativeEventSystem();
  const Snare = env.CONFIG?.RegionBehavior?.dataModels?.["edha-content.fate-snare"];
  assert.ok(Snare, "the fate-snare RegionBehavior registered");
  const b = new Snare();
  b.ownerUuid = "Actor.fate";
  b.snareId = "snare1";
  b.armedOver = armedOver;
  return b;
}

async function run(env, behavior, eventName, tokenUuid) {
  /* The snare lives on the owner's REAL ledger flag: edhaGetSnares is a const arrow the sandbox
   * does not expose, so seeding the document is both the only way in and the honest one. */
  const owner = mockActor({ name: "Bench — Fate", id: "fate", flags: { lists: { snares: [{ id: "snare1", talent: "Snare", x: 500, y: 500 }] } } });
  const foe = mockActor({ name: "Foe", id: "foe", type: "npc", system: { resources: { hea: { value: 10 } } } });
  const sprung = [];
  const world = stageWorld(env, { actors: [owner, foe], placeables: [], users: Object.assign([], { activeGM: { isSelf: true } }), user: { isGM: true, id: "gm1" } });
  const prior = { resolve: env.edhaResolveActorRef, same: env.edhaSameDisposition, spring: env.edhaFateSpringSnare, tok: env.edhaCasterToken };
  env.edhaResolveActorRef = async () => owner;
  env.edhaSameDisposition = () => false;              // the walker is an ENEMY of the owner
  env.edhaCasterToken = () => null;
  env.edhaFateSpringSnare = async (_o, s) => { sprung.push(s.id); };
  try {
    await behavior._handleRegionEvent({ name: eventName, data: { token: { actor: foe, uuid: tokenUuid } } });
    return sprung;
  } finally { Object.assign(env, { edhaResolveActorRef: prior.resolve, edhaSameDisposition: prior.same, edhaFateSpringSnare: prior.spring, edhaCasterToken: prior.tok }); world.undo(); }
}

test("R-13 behavior: placed UNDER a creature — the creation-time tokenEnter does NOT spring it", async () => {
  const env = loadEngine();
  const b = snareBehavior(env, [UNDER]);
  eq(await run(env, b, "tokenEnter", UNDER), []);   // the snare sprang at placement if this fails
});

test("R-13 behavior: …and that same creature MOVING springs it", async () => {
  const env = loadEngine();
  const b = snareBehavior(env, [UNDER]);
  eq(await run(env, b, "tokenMoveOut", UNDER), ["snare1"]);
});

test("R-13 behavior: a creature that WALKS IN still springs it on enter, as it always did", async () => {
  const env = loadEngine();
  const b = snareBehavior(env, [UNDER]);
  eq(await run(env, b, "tokenEnter", WALKER), ["snare1"]);
  eq(await run(env, b, "tokenMoveIn", WALKER), ["snare1"]);   // and on the pass-through twin
});

test("R-13 behavior: the subscription carries all four events, or the armed creature could never trip it", () => {
  /* defineSchema() cannot run headlessly (the harness's foundry.data.fields is bare), so the
   * subscription is read off the source — the same shape the other schema gates use. */
  const src = readEngineSource();
  // Sliced to the CLASS: three Region behaviours declare an events field and two of them are
  // legitimately still {tokenEnter, tokenMoveIn}, so an unanchored match reads the wrong one.
  const cls = src.slice(src.indexOf("class EdhaFateSnareRegionBehavior"));
  const decl = /events: this\._createEventsField\(\{ events: \[([^\]]*)\], initial: \[([^\]]*)\] \}\)/.exec(cls);
  assert.ok(decl, "the fate-snare behavior's events field moved — re-pin it");
  const wanted = '"tokenEnter", "tokenMoveIn", "tokenMoveOut", "tokenMoveWithin"';
  assert.strictEqual(decl[1], wanted, "an armed creature's move event must reach the behavior");
  assert.strictEqual(decl[2], wanted, "\u2026and be on by default, not merely available");
});
