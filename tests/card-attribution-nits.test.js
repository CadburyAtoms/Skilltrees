/* REGRESSION — R-37: three card-text nits, one ruling, "fix all three".
 * (EDHA_RULINGS.md R-37, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * All three are the same defect wearing three costumes: a card that reports a NUMBER or a NAME
 * without saying whose it is, so the player reads a true sentence about the wrong thing.
 *
 *   (1) ORDAINED EVICTION. At the cap the oldest marker fizzles — and the only evidence was the
 *       "(2/2)" count staying put, which reads like nothing happened. Ben places a third square,
 *       sees 2/2 again, and has no way to learn which one he just spent.
 *   (2) INEVITABLE SNARE'S GRAMMAR. "the snares on Snare #1 **is** inevitable" — a plural ledger
 *       key ("snares") agreeing with a singular verb, wrapped around an "on <creature>" clause a
 *       POINT-bound marker has no creature for. Engine-generated, not authored: the string is
 *       built in the `edha-owner-list` annotate executor, so this is ENGINE-ONLY (checked before
 *       editing, per the ruling's own instruction).
 *   (3) BULWARK'S THP ATTRIBUTION. The Ordained turn-start card's headline is the ORDAINED-placing
 *       talent, and it appended a bare ", Temp HP 2" — so the Temp HP was credited to the wrong
 *       document. The grant comes from the owner's `edha-zone-guard` rule, and R-36 (fix pass 7a)
 *       already made edhaGrantTempHpCross store THAT talent as the THP source; the card was the
 *       last surface still lying about it. The PLACEMENT card had named it correctly all along,
 *       which is what makes this a drift and not a design choice.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, captureChat, sleep } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

/* --- (1) the Ordained eviction line ----------------------------------------------------------- */

/* Drives the REAL placement flow (edhaFatePlaceCore) with the picker and the canvas stubbed, so
 * the eviction, the ledger commit and the card are the shipped ones. The owner starts at the cap
 * with two squares already down; the third pushes the oldest out. */
async function placeOrdained(env, { cap = 2, existing = [] } = {}) {
  const owner = mockActor({ name: "Bench — Fate", id: "fate", flags: { lists: { ordained: existing } } });
  owner.getRollData = () => ({ tier: 2 });
  const item = mockItem({ name: "Ordained Ground", actor: owner });
  const cards = [];
  const world = stageWorld(env, { actors: [owner], placeables: [] });
  const prior = { pick: env.edhaPickPoint, cap: env.edhaListCap, card: env.edhaTreeCard, tok: env.edhaCasterToken, circle: env.edhaDrawCircle, scene: env.canvas.scene };
  env.edhaPickPoint = async () => ({ x: 500, y: 500 });
  env.edhaListCap = () => cap;
  env.edhaTreeCard = (_owner, _rolls, html) => { cards.push(html); };
  env.edhaCasterToken = () => null;                 // no token: skips the range ring AND the range gate
  env.edhaDrawCircle = async () => null;
  env.canvas.scene = {
    id: "scene1", grid: { size: 100, distance: 5 },
    templates: { get: () => null },
    async createEmbeddedDocuments() { return [{ id: "tpl1" }]; },
  };
  try {
    await env.edhaFatePlaceCore(item, { color: "white", capFormula: "@tier", evict: "oldest" }, "ordained");
    return { owner, cards };
  } finally {
    Object.assign(env, { edhaPickPoint: prior.pick, edhaListCap: prior.cap, edhaTreeCard: prior.card, edhaCasterToken: prior.tok, edhaDrawCircle: prior.circle });
    env.canvas.scene = prior.scene;
    world.undo();
  }
}

test("R-37(1): placing at the cap NAMES the oldest ground that fizzled", async () => {
  const env = loadEngine();
  const { cards } = await placeOrdained(env, {
    cap: 2,
    existing: [
      { id: "o1", sceneId: "scene1", talent: "Ordained Ground", x: 100, y: 100 },
      { id: "o2", sceneId: "scene1", talent: "Weave the Thread", x: 200, y: 200 },
    ],
  });
  assert.strictEqual(cards.length, 1, "one placement card");
  const said = text(cards[0]);
  assert.ok(/\(2\/2\)/.test(said), `the count is still there: ${said}`);
  assert.ok(said.includes("The oldest — Ordained Ground — fizzles to make room."),
    `the fizzled ground is not named: ${said}`);
});

test("R-37(1): BELOW the cap, nothing fizzles and the card says nothing about it", async () => {
  const env = loadEngine();
  const { cards } = await placeOrdained(env, { cap: 3, existing: [{ id: "o1", sceneId: "scene1", talent: "Ordained Ground", x: 100, y: 100 }] });
  const said = text(cards[0]);
  assert.ok(/\(2\/3\)/.test(said), said);
  assert.ok(!/fizzle/.test(said), `an eviction was announced with nothing evicted: ${said}`);
});

/* --- (2) Inevitable Snare's number agreement --------------------------------------------------- */

test("R-37(2): a POINT-bound entry names only the marker — no plural key, no phantom creature", () => {
  const env = loadEngine();
  const said = env.edhaAnnotateSentence("Snare #1", "snares", "inevitable", "", false);
  assert.strictEqual(text(said), "Snare #1 is now inevitable.");
  // The exact defect, spelled out so a regression is unmistakable in the diff:
  assert.ok(!text(said).includes("the snares on Snare #1 is"), "the reported sentence is back");
});

test("R-37(2): a CREATURE-bound entry keeps its possessive reading, with the label SINGULAR", () => {
  const env = loadEngine();
  const withProh = env.edhaAnnotateSentence("Roek", "Edict", "sealed", "Do not draw steel", true);
  assert.strictEqual(text(withProh), 'the Edict on Roek ("Do not draw steel") is now sealed.');
  // …and a PLURAL ledger key on the creature-bound branch is singularized rather than shipped raw.
  assert.strictEqual(text(env.edhaAnnotateSentence("Roek", "edicts", "sealed", "", true)), "the edict on Roek is now sealed.");
});

test("R-37(2): edhaSingularLabel handles the ledger keys in play and leaves singulars alone", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaSingularLabel("snares"), "snare");
  assert.strictEqual(env.edhaSingularLabel("charges"), "charge");
  assert.strictEqual(env.edhaSingularLabel("remains"), "remain");
  // The case that must never be mangled: a configured label that is already singular.
  assert.strictEqual(env.edhaSingularLabel("Edict"), "Edict");
  assert.strictEqual(env.edhaSingularLabel("Harvested Remain"), "Harvested Remain");
  assert.strictEqual(env.edhaSingularLabel("Covenant"), "Covenant");
  assert.strictEqual(env.edhaSingularLabel(""), "");
});

/* --- (3) Bulwark's THP attribution ------------------------------------------------------------- */

test("R-37(3): the ordained turn-start card credits the Temp HP to the GUARD talent, not the square", async () => {
  const env = loadEngine();
  const owner = mockActor({
    name: "Bench — Fate", id: "fate",
    flags: { lists: { ordained: [{ id: "o1", sceneId: "scene1", talent: "Ordained Ground", x: 500, y: 500 }] } },
  });
  owner.getRollData = () => ({ tier: 2 });
  const ally = mockActor({ name: "Soggy Bottom", id: "ally" });
  ally.isOwner = true;
  ally.effects = [];
  ally.createEmbeddedDocuments = async () => [];
  ally.deleteEmbeddedDocuments = async () => [];

  const cards = captureChat(env);
  const world = stageWorld(env, { actors: [owner], placeables: [] });
  const prior = { rule: env.edhaActorRuleOf, tok: env.edhaCasterToken, thp: env.edhaGrantTempHpCross, ev: env.edhaEvalSync, sq: env.edhaSameSquare, scene: env.canvas.scene, CONST: env.CONST };
  const granted = [];
  env.canvas.scene = { id: "scene1", grid: { size: 100, distance: 5 } };
  env.CONST = { ACTIVE_EFFECT_MODES: { ADD: 2 } };       // the +1-all-defenses AE the same pass applies
  env.edhaActorRuleOf = (_a, type) => (type === "edha-zone-guard"
    ? { item: { name: "Bulwark Ground" }, handler: { thpFormula: "@tier" } } : null);
  env.edhaCasterToken = () => null;                     // no owner token → the side check is skipped
  env.edhaEvalSync = () => 2;
  env.edhaSameSquare = () => true;                      // the ally is standing on the square
  env.edhaGrantTempHpCross = async (a, n, src) => { granted.push({ to: a.name, n, src }); };
  try {
    await env.edhaFateTurnStart({
      started: true,
      combatant: { token: { actor: ally, disposition: 1, x: 480, y: 480, width: 1, height: 1, object: { center: { x: 500, y: 500 } } } },
    });
    await sleep(0);
  } finally {
    Object.assign(env, { edhaActorRuleOf: prior.rule, edhaCasterToken: prior.tok, edhaGrantTempHpCross: prior.thp, edhaEvalSync: prior.ev, edhaSameSquare: prior.sq, CONST: prior.CONST });
    env.canvas.scene = prior.scene;
    world.undo();
  }

  // The GRANT was already attributed correctly (R-36, fix pass 7a) — it is the CARD that lied.
  assert.deepStrictEqual(granted, [{ to: "Soggy Bottom", n: 2, src: "Bulwark Ground" }]);
  assert.strictEqual(cards.length, 1, "one turn-start card");
  const said = text(cards[0].content);
  assert.ok(said.includes("Temp HP 2 (Bulwark Ground)"), `the Temp HP is unattributed: ${said}`);
  // The headline is still the ORDAINED talent — this fix adds an attribution, it does not move one.
  assert.ok(said.startsWith("✦ Ordained Ground (Bench — Fate)"), said);
});
