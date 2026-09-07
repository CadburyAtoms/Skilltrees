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
test("engine-idiom-ratchet: dispoFailOpen is 0 after batch 2 (a tombstone), and the file matches the engine", () => {
  const ratchet = require("../scripts/engine-idiom-ratchet.json");
  const actual = (codeOnly(readEngineSource()).match(/disposition\s*\?\?\s*[01]\b/g) || []).length;
  assert.strictEqual(actual, 0, `batch 2 took the idiom to 0; the engine now has ${actual} — call edhaSideSame / edhaSideHostile / edhaActorSide instead`);
  assert.strictEqual(ratchet.counts.dispoFailOpen, actual, "engine-idiom-ratchet.json must not become fiction");
  assert.ok(ratchet.counts.dispoFailOpen < ratchet.originalCounts.dispoFailOpen, "the ratchet may only shrink");
});

/* ---------------------------------------------------------------------------------------------
 * ITEM 10, BATCH 2 (2026-09-06) — the last 11 occurrences, all READS whose only consumer is a
 * card's wording or a picker list a human then confirms: edhaPickCandidates (3, via
 * edhaPickAccepts), edhaSweepEmptyNote (2), the movement-window card (2), edhaPickProhibition's
 * <select> (2), the edha-cleanse beacon list (2). The convention is the same one batch 1 pushed
 * onto the world-writing sites: a side that did not resolve is OMITTED from a filtered list, and
 * where the OWNER's own side did not resolve the card says so instead of guessing FRIENDLY.
 * Every test here fails under a reversion to `?? 1` (the unset token re-enters the list).
 * ------------------------------------------------------------------------------------------- */

const { withStubs, captureChat, fireHook, loadHandlerRegistry } = require("./harness.js");

// A canvas token whose actor resolves back to it (edhaCasterToken → getActiveTokens).
function ownerPlaceable(id, disposition, x = 0, y = 0) {
  const tok = placeable(id, disposition, x, y);
  tok.actor.getActiveTokens = () => [tok];
  return tok;
}

/* SITE 1 — edhaPickCandidates (H6 edha-prompt-pick's offer list). Was `?? 1` on the owner, the
 * anchor AND every candidate, so a disposition-less token was offered as an ALLY of a friendly
 * owner and as an ENEMY of a hostile one. */
test("edhaPickCandidates (H6 offer list): a token with NO disposition is offered under neither `ally` nor `enemy`, still under `any`", () => {
  const env = loadEngine();
  const ownerTok = ownerPlaceable("owner", FRIENDLY, 0, 0);
  const ally = placeable("ally", FRIENDLY, 50, 0);      // 2.5 ft
  const foe = placeable("foe", HOSTILE, 0, 50);
  const unset = placeable("unset", undefined, 50, 50);
  const staged = stageWorld(env, { placeables: [ownerTok, ally, foe, unset] });
  try {
    const ids = (h) => [...env.edhaPickCandidates(ownerTok.actor, { rangeFt: 10, includeSelf: false, ...h }, ownerTok.actor)].map((t) => t.id);   // [...x] re-homes the vm-realm array
    assert.deepStrictEqual(ids({ disposition: "ally" }), ["ally"], "ally: was [ally, unset] at ?? 1");
    assert.deepStrictEqual(ids({ disposition: "enemy" }), ["foe"]);
    assert.deepStrictEqual(ids({ disposition: "any" }).sort(), ["ally", "foe", "unset"], "`any` is not a side filter — the unset token still qualifies");
    assert.deepStrictEqual(ids({ disposition: "anchor-ally" }), ["ally"]);
    assert.deepStrictEqual(ids({ disposition: "anchor-enemy" }), ["foe"]);
  } finally { staged.undo(); }
});

test("edhaPickCandidates: a HOSTILE owner no longer sees a disposition-less token as an `enemy` (the ?? 1 polarity: unknown read FRIENDLY, compared unequal to -1)", () => {
  const env = loadEngine();
  const ownerTok = ownerPlaceable("owner", HOSTILE, 0, 0);
  const staged = stageWorld(env, { placeables: [ownerTok, placeable("pc", FRIENDLY, 50, 0), placeable("unset", undefined, 0, 50)] });
  try {
    assert.deepStrictEqual([...env.edhaPickCandidates(ownerTok.actor, { rangeFt: 10, includeSelf: false, disposition: "enemy" }, ownerTok.actor)].map((t) => t.id), ["pc"]);
  } finally { staged.undo(); }
});

/* SITE 2 — edhaSweepEmptyNote (the "why was the sweep empty?" card note). Was `?? 1` on the owner
 * AND on every scene token, so a disposition-less token counted as a candidate, could be named as
 * "nearest", and an owner with no side counted every friendly token as its own side. */
test("edhaSweepEmptyNote: a disposition-less token is neither a same-side nor an opposing candidate, and is never named as the nearest", () => {
  const env = loadEngine();
  const ownerTok = ownerPlaceable("owner", FRIENDLY, 0, 0);
  const unset = placeable("Unset", undefined, 200, 0);    // 10 ft — the NEAREST at ?? 1
  const ally = placeable("Ally", FRIENDLY, 400, 0);       // 20 ft
  const foe = placeable("Foe", HOSTILE, 600, 0);          // 30 ft
  const staged = stageWorld(env, { placeables: [ownerTok, unset, ally, foe] });
  try {
    const same = env.edhaSweepEmptyNote(ownerTok.actor, 5, true);
    assert.match(same, /nearest \(Ally\) is 20 ft away; 1 candidate on the scene/, `same-side note was: ${same}`);
    const opp = env.edhaSweepEmptyNote(ownerTok.actor, 5, false);
    assert.match(opp, /nearest \(Foe\) is 30 ft away; 1 candidate on the scene/, `opposing note was: ${opp}`);
    assert.ok(!/Unset/.test(same) && !/Unset/.test(opp), "the unset token must not be named on either note");
  } finally { staged.undo(); }
});

test("edhaSweepEmptyNote: an OWNER whose token side did not resolve is told so (was: every friendly token counted as an ally)", () => {
  const env = loadEngine();
  const ownerTok = ownerPlaceable("owner", undefined, 0, 0);
  const staged = stageWorld(env, { placeables: [ownerTok, placeable("Ally", FRIENDLY, 400, 0)] });
  try {
    const note = env.edhaSweepEmptyNote(ownerTok.actor, 5, true);
    assert.match(note, /no disposition set/, `note was: ${note}`);
    assert.ok(!/Ally/.test(note));
  } finally { staged.undo(); }
});

/* SITE 3 — the movement-window card (the updateToken watcher). Was `doc.disposition ?? 1` on the
 * mover and `?? 1` per scene token. */
test("movement-window card: a disposition-less token is left off the allies list; a mover with no side lists nobody and says why", async () => {
  const env = loadEngine();
  const mover = ownerPlaceable("mover", FRIENDLY, 0, 0);
  mover.actor.flags["edha-content"].moveWindow = { round: null, combatId: null, rangeFt: 10, source: "Ordered Advance", note: "" };
  const moverDoc = { id: "mover", actor: mover.actor, x: 0, y: 0, width: 1, height: 1, disposition: FRIENDLY, parent: null };
  const ally = placeable("Ally", FRIENDLY, 100, 0);       // 5 ft
  const unset = placeable("Unset", undefined, 0, 100);
  const staged = stageWorld(env, { user: { id: "u1" }, placeables: [mover, ally, unset] });
  const cards = captureChat(env);
  try {
    await fireHook(env, "updateToken", moverDoc, { x: 0 }, {}, "u1");
    assert.strictEqual(cards.length, 1);
    assert.match(cards[0].content, /<strong>Ally<\/strong>/);
    assert.ok(!/Unset/.test(cards[0].content), `unset token listed: ${cards[0].content}`);

    moverDoc.disposition = undefined;   // the mover's own side does not resolve
    await fireHook(env, "updateToken", moverDoc, { x: 0 }, {}, "u1");
    assert.strictEqual(cards.length, 2);
    assert.match(cards[1].content, /no allies were within 10 ft .* no disposition set/, `card was: ${cards[1].content}`);
  } finally { staged.undo(); }
});

/* SITE 4 — edhaPickProhibition's "attack a chosen ally" <select> (Edict). Was `?? 1` on the owner
 * and on every scene token. The dialog is stubbed; only the option list it is handed is checked. */
test("edhaPickProhibition: a disposition-less token is not offered in the ally <select>; an owner with no side gets '(no allied tokens)'", async () => {
  const env = loadEngine();
  const ownerTok = ownerPlaceable("owner", FRIENDLY, 0, 0);
  const ally = placeable("Ally", FRIENDLY, 100, 0); ally.name = "Ally";
  const unset = placeable("Unset", undefined, 200, 0); unset.name = "Unset";
  const contents = [];
  const staged = stageWorld(env, { placeables: [ownerTok, ally, unset] });
  try {
    await withStubs(env, { edhaDialogPick: async ({ content }) => { contents.push(content); return undefined; } }, async () => {
      await env.edhaPickProhibition(ownerTok.actor, "Edict");
      assert.match(contents[0], /<option value="Actor\.Ally">Ally<\/option>/);
      assert.ok(!/Unset/.test(contents[0]), `unset token offered: ${contents[0]}`);
      const sideless = mockActor({ name: "Sideless", id: "sideless" });   // no token, no prototypeToken → edhaActorSide null
      await env.edhaPickProhibition(sideless, "Edict");
      assert.match(contents[1], /\(no allied tokens\)/);
    });
  } finally { staged.undo(); }
});

/* SITE 5 — the edha-cleanse beacon list (Beacon of Purity's card). Was `?? 1` on the owner's token
 * and per token in the circle. */
test("edha-cleanse beacon list: a disposition-less ally in range is omitted from the card's token list", async () => {
  const { env, handlers } = loadHandlerRegistry();
  const cleanse = handlers.find((h) => h.type === "edha-cleanse");
  assert.ok(cleanse, "edha-cleanse handler registered");
  const ownerTok = ownerPlaceable("owner", FRIENDLY, 0, 0);
  const ally = placeable("ally", FRIENDLY, 100, 0);
  const unset = placeable("unset", undefined, 0, 100);
  const foe = placeable("foe", HOSTILE, 100, 100);
  const posted = [];
  const staged = stageWorld(env, { placeables: [ownerTok, ally, unset, foe] });
  try {
    await withStubs(env, { edhaPostBeaconCard: (owner, name, allyTokens) => { posted.push(allyTokens.map((t) => t.id)); } }, async () => {
      await cleanse.executor.call({ trigger: "use", rangeColor: "white", visibleOnly: false, costs: "", prompt: "" }, { item: { name: "Beacon", actor: ownerTok.actor } });
      assert.deepStrictEqual(posted, [["ally"]], "was [ally, unset] at ?? 1");
    });
  } finally { staged.undo(); }
});
