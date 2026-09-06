/* REGRESSION — the initiator-only `pre*` stash vs. the single-activeGM applier (bench run 30,
 * 2026-09-05; fixed by fix pass 3).
 *
 * Walking Ruin's trail dropped no dangerous terrain at all when a PLAYER moved their own token.
 * The bench proved it with a matched control — same token, same armed flag, same activeGM, the same
 * three squares: a player-client move gave 0 Regions and 0 Drawings, an activeGM-client move gave
 * 3 of each.
 *
 * The cause is a CLIENT SPLIT, and it is verifiable in Foundry v13's own source
 * (`resources/app/client/data/client-backend.mjs`):
 *   • `Hooks.call("preUpdate<Type>", …)` fires only inside `#preUpdateDocumentArray`, reached from
 *     `_updateDocuments` — the path taken by the client that CALLS `doc.update()`. Every other
 *     client arrives via the socket response (`#onModifyDocument` → `#handleUpdateDocuments`),
 *     which fires `Hooks.callAll("update<Type>")` and no `pre*` hook whatsoever. A `pre*` hook is
 *     INITIATOR-ONLY.
 *   • `options`, by contrast, rides along: the pre-hook pass ends with `Object.assign(operation,
 *     options); // Hooks may have changed options`, `#buildRequest` puts that operation on the
 *     socket, and each receiving client destructures `options` back out of the response before
 *     calling the `update<Type>` hooks.
 *
 * The trail stashed its prior centre on the DOCUMENT (`tokenDoc._edhaPrevCenter`) and gated its
 * drop to the one activeGM applier — so for a player-driven move the stamp landed in the player's
 * memory and the only client permitted to drop read null and returned in silence. No error, no
 * card, nothing to notice.
 *
 * These cases model TWO CLIENTS honestly: two separate TokenDocument objects for the same token
 * (which is what "different clients" means), with the SAME `options` object handed from one to the
 * other — that object IS the socket. Every registered hook of each phase runs, so nothing here
 * depends on knowing which block owns the stamp. Restore the document stash and the first case
 * fails, which is how this file was verified.
 *
 * The last two cases are the FAMILY gate: no `pre*` hook may stash onto its document argument
 * again, and the prior-position stamp stays a single write read through one helper.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, withStubs, readEngineSource, codeOnly } = require("./harness.js");

const env = loadEngine();

const GRID = 100;
const FROM = { x: 500, y: 500 };            // top-left before the move
const TO = { x: 600, y: 500 };              // one square east
const VACATED_CENTRE = { x: 550, y: 550 };  // FROM + width*grid/2 — where the patch belongs

// Walking Ruin's own document: an `edha-place-hazard` rule in trail mode. Nothing here names a
// talent — the engine reads the rule, so a renamed twin would carry exactly this shape too.
function trailTalent() {
  return {
    name: "Walking Ruin",
    type: "talent",
    hasEvents: () => true,
    enabledEvents: [{
      handler: { type: "edha-place-hazard", mode: "trail", damageFormula: "(@tier)d8", damageType: "energy", color: "red" },
    }],
  };
}

function trailActor({ armed = true } = {}) {
  return mockActor({
    name: "Bench — Destruction", id: "destruction-1", type: "character",
    items: [trailTalent()], flags: armed ? { hazardTrail: true } : {},
  });
}

/* One client's copy of the token document. Two calls = two objects for the SAME token, which is
 * precisely the situation a document stash cannot survive. */
function tokenDocFor(actor, pos = FROM) {
  return {
    id: "token-1", uuid: "Scene.s1.Token.token-1", name: "Bench — Destruction",
    x: pos.x, y: pos.y, width: 1, height: 1, disposition: 1, actor,
    parent: { id: "s1", grid: { size: GRID, distance: 5 }, regions: [], drawings: [], tokens: [] },
  };
}

const PLAYER = { user: { isGM: false, id: "player-1" }, users: { activeGM: { isSelf: false } } };
const GM = { user: { isGM: true, id: "gm-1" }, users: { activeGM: { isSelf: true } } };

const hooksNamed = (name) => env.__hooks.on.filter((h) => h.name === name).map((h) => h.fn);

/* Run one token move across two clients and report every edhaDropHazard call the applying client
 * made. EVERY registered hook of each phase fires, exactly as it would in a browser.
 * `sameClient: true` collapses both onto ONE document object — the GM-moves-it-themselves control
 * the bench measured as passing. */
async function moveAcrossClients({ initiator, applier, actor, sameClient = false, changes } = {}) {
  const dropped = [];
  const change = changes ?? { _id: "token-1", x: TO.x, y: TO.y };
  const options = {};                                   // the object that crosses the socket

  // --- initiating client: every preUpdateToken hook runs here, and ONLY here.
  const initDoc = tokenDocFor(actor, FROM);
  let world = stageWorld(env, { ...initiator, actors: [], placeables: [] });
  try {
    for (const fn of hooksNamed("preUpdateToken")) fn(initDoc, change, options, initiator.user.id);
  } finally { world.undo(); }

  // --- applying client: a different object for the same token (unless sameClient), post-move.
  const applyDoc = sameClient ? initDoc : tokenDocFor(actor, FROM);
  if (change.x !== undefined) applyDoc.x = change.x;
  if (change.y !== undefined) applyDoc.y = change.y;
  world = stageWorld(env, { ...applier, actors: [], placeables: [] });
  try {
    await withStubs(env, { edhaDropHazard: (...args) => { dropped.push(args); } }, async () => {
      for (const fn of hooksNamed("updateToken")) fn(applyDoc, change, options, initiator.user.id);
    });
  } finally { world.undo(); }

  return { dropped, options };
}

test("a PLAYER-initiated move drops the trail patch on the activeGM — the bench run 30 FAIL", async () => {
  const { dropped, options } = await moveAcrossClients({ initiator: PLAYER, applier: GM, actor: trailActor() });
  assert.ok(options.edhaPrevPos, "the prior position must ride `options`, which IS broadcast — a document stash is not");
  assert.strictEqual(dropped.length, 1,
    "0 drops means the applier read a stash that never crossed the client boundary: that is the bug");
  const [, scene, shape] = dropped[0];
  assert.strictEqual(scene.id, "s1", "the patch belongs to the token's OWN scene, not whatever canvas is showing");
  assert.strictEqual(shape.type, "circle");
  assert.strictEqual(shape.x, VACATED_CENTRE.x, "the patch drops at the square the token LEFT, not the one it entered");
  assert.strictEqual(shape.y, VACATED_CENTRE.y);
  assert.strictEqual(shape.radius, GRID / 2);
});

test("the trail burns what the talent's OWN rule says (iron rule 2b — a rename changes nothing)", async () => {
  const { dropped } = await moveAcrossClients({ initiator: PLAYER, applier: GM, actor: trailActor() });
  const [, , , formula, type, color] = dropped[0];
  assert.strictEqual(formula, "(@tier)d8");
  assert.strictEqual(type, "energy");
  assert.strictEqual(color, "red");
});

test("CONTROL: the activeGM moving the token themselves still drops — the path that always worked", async () => {
  const { dropped } = await moveAcrossClients({ initiator: GM, applier: GM, actor: trailActor(), sameClient: true });
  assert.strictEqual(dropped.length, 1, "the fix must not cost the case the bench measured as passing");
});

test("NEGATIVE: an unarmed character leaves no trail, however they moved", async () => {
  const { dropped } = await moveAcrossClients({ initiator: PLAYER, applier: GM, actor: trailActor({ armed: false }) });
  assert.strictEqual(dropped.length, 0);
});

test("NEGATIVE: a non-move token update drops nothing (the stamp is the only 'was this a move?')", async () => {
  const { dropped, options } = await moveAcrossClients({
    initiator: PLAYER, applier: GM, actor: trailActor(), changes: { _id: "token-1", hidden: true },
  });
  assert.strictEqual(options.edhaPrevPos, undefined, "an elevation/visibility/name edit is not a step");
  assert.strictEqual(dropped.length, 0);
});

test("NEGATIVE: a second GM client stays silent — ONE applier, no per-client double-drop", async () => {
  const OTHER_GM = { user: { isGM: true, id: "gm-2" }, users: { activeGM: { isSelf: false } } };
  const { dropped } = await moveAcrossClients({ initiator: PLAYER, applier: OTHER_GM, actor: trailActor() });
  assert.strictEqual(dropped.length, 0);
});

test("FAMILY GATE: no pre* hook may stash engine state onto a document object again", () => {
  const code = codeOnly(readEngineSource());
  const stashes = code.match(/\b(?:tokenDoc|doc|actor|item|effect|combatant|region|scene|token|combat|message)\s*\._edha\w*\s*=[^=]/g) || [];
  assert.deepStrictEqual(stashes, [],
    "a `<document>._edhaSomething = …` stash is initiator-only and invisible to an activeGM-gated " +
    "applier — put it on `options`, which is broadcast with the update (the SHARED TOKEN-MOVE STAMP " +
    "block quotes Foundry's own client-backend source for why)");
  assert.ok(!/_edhaPrevCenter/.test(code), "the specific stash bench run 30 caught must stay gone");
});

test("FAMILY GATE: the prior-position stamp is written once and read through one helper", () => {
  const code = codeOnly(readEngineSource());
  const writes = code.match(/options\.edhaPrevPos\s*=/g) || [];
  assert.strictEqual(writes.length, 1,
    "two stamps is how the first one came to look private enough for a second author to bypass");
  const mentions = code.match(/edhaPrevPos/g) || [];
  assert.strictEqual(mentions.length, 2,
    "exactly the one write and the one read inside edhaPrevTokenPos — every consumer goes through " +
    "the helpers (edhaPrevTokenPos / edhaPrevTokenCenter), so 'was this a move?' has one answer");
});
