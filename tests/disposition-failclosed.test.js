/* ENGINE PASS 5.2 (Job 5, R-63) — pins the Number.isFinite fail-closed convention on
 * edhaDisposHostile and edhaSameDisposition, mirroring edhaAllyDropEligible's existing model
 * (tests/ally-drop-side.test.js).
 *
 * Before this pass:
 *   - edhaDisposHostile: `!ot || !tt` -> TRUE (fail OPEN to "enemy"), and even with both tokens
 *     present `(ot.document?.disposition ?? 0) !== (tt.document?.disposition ?? 0)` defaulted an
 *     unresolvable side to NEUTRAL — one known side + one unknown compared unequal and read hostile.
 *   - edhaSameDisposition: `?? 1` on both sides defaulted an unresolvable side to FRIENDLY.
 * Both now fail CLOSED: unknown disposition on EITHER side -> not hostile / not same-side, matching
 * R-63 ("unknown disposition now fails CLOSED everywhere").
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const HOSTILE = -1, NEUTRAL = 0, FRIENDLY = 1;

// A minimal actor whose edhaCasterToken(actor) resolves to a token carrying `disposition`
// (or no token at all when `hasToken` is false — the "genuinely unset" case). Every mock token
// gets a distinct `.id` — edhaSameDisposition's self-exclusion (`ot.id === tok.id`) compares ids,
// and two tokens that both leave `.id` undefined would collide and look like "the same token".
let _tokId = 0;
function actorWithDisposition(disposition, { hasToken = true } = {}) {
  const actor = { name: `actor(${disposition})` };
  const tok = hasToken ? { id: `tok-${++_tokId}`, actor, document: { disposition } } : null;
  actor.getActiveTokens = () => (tok ? [tok] : []);
  return actor;
}

test("edhaDisposHostile: 0-vs-0 (both NEUTRAL, both known) is NOT hostile — 0 is a real, resolved side", () => {
  const env = loadEngine();
  const a = actorWithDisposition(NEUTRAL), b = actorWithDisposition(NEUTRAL);
  assert.strictEqual(env.edhaDisposHostile(a, b), false);
});

test("edhaDisposHostile: known-vs-known, different sides IS hostile", () => {
  const env = loadEngine();
  const a = actorWithDisposition(HOSTILE), b = actorWithDisposition(FRIENDLY);
  assert.strictEqual(env.edhaDisposHostile(a, b), true);
});

test("edhaDisposHostile: unknown-vs-unknown (neither has a token) fails CLOSED — not hostile", () => {
  const env = loadEngine();
  const a = actorWithDisposition(HOSTILE, { hasToken: false }), b = actorWithDisposition(FRIENDLY, { hasToken: false });
  assert.strictEqual(env.edhaDisposHostile(a, b), false,
    "was `!ot || !tt -> true` (fail OPEN); a genuinely tokenless actor no longer counts as hostile by default");
});

test("edhaDisposHostile: unknown-vs-known fails CLOSED on EITHER side — not hostile (was the `?? 0` bug: an unknown side compared unequal to a known non-zero side and read as hostile)", () => {
  const env = loadEngine();
  const known = actorWithDisposition(HOSTILE);
  const unknown = actorWithDisposition(HOSTILE, { hasToken: false });
  assert.strictEqual(env.edhaDisposHostile(known, unknown), false, "owner known, target unknown");
  assert.strictEqual(env.edhaDisposHostile(unknown, known), false, "owner unknown, target known");
});

test("edhaSameDisposition: 0-vs-0 (both NEUTRAL) IS the same side — 0 is a real side, not absence", () => {
  const env = loadEngine();
  const owner = actorWithDisposition(NEUTRAL);
  const otherTok = { id: "other-tok", actor: actorWithDisposition(NEUTRAL), document: { disposition: NEUTRAL } };
  assert.strictEqual(env.edhaSameDisposition(owner, otherTok), true);
});

test("edhaSameDisposition: unknown-vs-unknown fails CLOSED — not the same side (was `?? 1` on both sides -> FRIENDLY -> always 'same')", () => {
  const env = loadEngine();
  const owner = actorWithDisposition(HOSTILE, { hasToken: false });
  const otherTok = { id: "other-tok", actor: actorWithDisposition(FRIENDLY, { hasToken: false }), document: {} };   // no .disposition at all
  assert.strictEqual(env.edhaSameDisposition(owner, otherTok), false);
});

test("edhaSameDisposition: unknown-vs-known fails CLOSED — an owner with no token cannot be 'the same side' as anything", () => {
  const env = loadEngine();
  const owner = actorWithDisposition(HOSTILE, { hasToken: false });
  const otherTok = { id: "other-tok", actor: actorWithDisposition(HOSTILE), document: { disposition: HOSTILE } };
  assert.strictEqual(env.edhaSameDisposition(owner, otherTok), false);
});

test("edhaSameDisposition: the SAME token as the owner's own is never 'same disposition' (self-exclusion, unchanged by R-63)", () => {
  const env = loadEngine();
  const owner = actorWithDisposition(FRIENDLY);
  const ownTok = owner.getActiveTokens()[0];
  assert.strictEqual(env.edhaSameDisposition(owner, ownTok), false);
});

/* ---------------------------------------------------------------------------------------------
 * ITEM 10, BATCH 1 (2026-09-06) — the same convention, pushed off the two actor-level helpers and
 * onto the 63 inline sites that gate a world write, a damage/status application, a ledger stamp or
 * live dice math. The idiom carried TWO polarities (`?? 1` = default FRIENDLY, `?? 0` = default
 * NEUTRAL), and the token-move trample sweep used a DIFFERENT default on each end of ONE
 * comparison — so two unknowns read as OPPOSITE sides and it fired. edhaSideSame / edhaSideHostile
 * are the value-level pair those sites now call.
 * ------------------------------------------------------------------------------------------- */

const { readEngineSource, codeOnly, mockActor, stageWorld } = require("./harness.js");

// A canvas token whose document carries `disposition` — or, when `disposition` is omitted, carries
// no disposition at all (the genuinely tokenless/unset creature R-63 is about).
function placeable(id, disposition, x = 0, y = 0) {
  const actor = mockActor({ name: id, id });
  return { id, actor, center: { x, y }, document: disposition === undefined ? {} : { disposition } };
}

test("edhaSideSame / edhaSideHostile: two RESOLVED sides still compare exactly as before", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaSideSame(NEUTRAL, NEUTRAL), true);      // 0 is a real, resolved side
  assert.strictEqual(env.edhaSideSame(HOSTILE, FRIENDLY), false);
  assert.strictEqual(env.edhaSideHostile(HOSTILE, FRIENDLY), true);
  assert.strictEqual(env.edhaSideHostile(NEUTRAL, NEUTRAL), false);
});

test("edhaSideSame / edhaSideHostile: an unresolvable side matches NEITHER — `!edhaSideSame` is NOT `edhaSideHostile`", () => {
  const env = loadEngine();
  for (const unknown of [undefined, null, NaN, "hostile"]) {
    assert.strictEqual(env.edhaSideSame(unknown, FRIENDLY), false, `same(${String(unknown)}, 1)`);
    assert.strictEqual(env.edhaSideHostile(unknown, FRIENDLY), false, `hostile(${String(unknown)}, 1)`);
    assert.strictEqual(env.edhaSideSame(FRIENDLY, unknown), false, `same(1, ${String(unknown)})`);
    assert.strictEqual(env.edhaSideHostile(FRIENDLY, unknown), false, `hostile(1, ${String(unknown)})`);
  }
  assert.strictEqual(env.edhaSideSame(undefined, undefined), false);
  assert.strictEqual(env.edhaSideHostile(undefined, undefined), false);   // the trample sweep's bug: ?? 1 vs ?? 0 made two unknowns "opposite"
});

/* MIGRATED SITE 1 — edhaAdjacentAllies, the list H7 `edha-aura` creates and deletes ActiveEffects
 * from. Was `?? 1` on BOTH ends, so an adjacent token with no disposition joined the owner's aura. */
test("edhaAdjacentAllies (H7 edha-aura, a WORLD WRITE): an adjacent token with NO disposition is not an ally", () => {
  const env = loadEngine();
  const ownerTok = placeable("owner", FRIENDLY, 0, 0);
  const ally = placeable("ally", FRIENDLY, 50, 0);
  const unset = placeable("unset", undefined, 0, 50);        // on canvas, but its side will not resolve
  const staged = stageWorld(env, { placeables: [ownerTok, ally, unset] });
  try {
    assert.deepStrictEqual(env.edhaAdjacentAllies(ownerTok).map((t) => t.id), ["ally"]);
  } finally { staged.undo(); }
});

test("edhaAdjacentAllies: an OWNER token with no disposition has no allies at all (was: everyone, at ?? 1)", () => {
  const env = loadEngine();
  const ownerTok = placeable("owner", undefined, 0, 0);
  const staged = stageWorld(env, { placeables: [ownerTok, placeable("a", FRIENDLY, 50, 0), placeable("b", HOSTILE, 0, 50)] });
  try {
    assert.deepStrictEqual(env.edhaAdjacentAllies(ownerTok), []);
  } finally { staged.undo(); }
});

/* MIGRATED SITE 2 — edhaEnemyTokensInCircle, the burst/detonate capture that feeds applyDamage.
 * Was `edhaCasterToken(owner)?.document?.disposition ?? 1` + `?? 1` per candidate. */
test("edhaEnemyTokensInCircle (the burst capture → DAMAGE): a disposition-less victim in the blast is NOT matched", () => {
  const env = loadEngine();
  // The owner is HOSTILE on purpose: under the old `?? 1` the disposition-less victim defaulted to
  // FRIENDLY, compared unequal to -1, and was caught by the blast. Mutating this site back fails here.
  const ownerTok = placeable("owner", HOSTILE, 0, 0);
  ownerTok.actor.getActiveTokens = () => [ownerTok];
  const staged = stageWorld(env, { placeables: [ownerTok, placeable("foe", FRIENDLY, 20, 0), placeable("unset", undefined, 30, 0)] });
  try {
    assert.deepStrictEqual(env.edhaEnemyTokensInCircle(ownerTok.actor, 0, 0, 100).map((t) => t.id), ["foe"]);
  } finally { staged.undo(); }
});

test("edhaEnemyTokensInCircle: an owner with NO token and no prototype side catches nobody (was: the whole blast)", () => {
  const env = loadEngine();
  const owner = mockActor({ name: "Sideless", id: "sideless" });
  owner.getActiveTokens = () => [];
  const staged = stageWorld(env, { placeables: [placeable("foe", HOSTILE, 20, 0), placeable("pc", FRIENDLY, 30, 0)] });
  try {
    assert.deepStrictEqual(env.edhaEnemyTokensInCircle(owner, 0, 0, 100), []);
  } finally { staged.undo(); }
});

/* MIGRATED SITE 3 — edhaSovTargets, which sorts the user's targets into the ally payload and the
 * enemy payload. A creature whose side will not resolve belongs to NEITHER bucket. */
test("edhaSovTargets (ally vs enemy PAYLOAD split): an unset-disposition target lands in neither bucket", () => {
  const env = loadEngine();
  const ownerTok = placeable("owner", FRIENDLY, 0, 0);
  ownerTok.actor.getActiveTokens = () => [ownerTok];
  const ally = placeable("ally", FRIENDLY, 10, 0);
  const foe = placeable("foe", HOSTILE, 20, 0);
  const unset = placeable("unset", undefined, 30, 0);
  const staged = stageWorld(env, { user: { targets: new Set([ally, foe, unset]) }, placeables: [ownerTok, ally, foe, unset] });
  try {
    const { allies, enemies } = env.edhaSovTargets(ownerTok.actor);
    // [...x] re-homes the vm-realm array edhaUserTargetTokens built, so deepStrictEqual compares
    // values rather than prototypes (the other two sites filter the host-realm placeables array).
    assert.deepStrictEqual([...allies].map((t) => t.id), ["ally"]);
    assert.deepStrictEqual([...enemies].map((t) => t.id), ["foe"]);
  } finally { staged.undo(); }
});

/* The ratchet, pinned from inside the suite the way items 12/13/14 pinned theirs: the recorded
 * count must equal what the engine actually contains, and it must never have grown. */
test("engine-idiom-ratchet: dispoFailOpen is 11 after batch 1, and the file matches the engine", () => {
  const ratchet = require("../scripts/engine-idiom-ratchet.json");
  const actual = (codeOnly(readEngineSource()).match(/disposition\s*\?\?\s*[01]\b/g) || []).length;
  assert.strictEqual(actual, 11, `batch 1 left 11 batch-2 reads; the engine now has ${actual}`);
  assert.strictEqual(ratchet.counts.dispoFailOpen, actual, "engine-idiom-ratchet.json must not become fiction");
  assert.ok(ratchet.counts.dispoFailOpen < ratchet.originalCounts.dispoFailOpen, "the ratchet may only shrink");
});
