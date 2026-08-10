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
