/* tests/effect-transfer-lookup.test.js — the ITEM-TRANSFERRED EFFECT family (fix pass 5, 2026-09-06).
 *
 * Bench run 33 root-caused, with a matched control, the reason the Stalker's `Veil` has never
 * auto-toggled on any map: `edhaDarkVeilSweep` resolved the marker out of `actor.effects`, but the
 * `Veil` AE is authored `transfer: true` on the `Veil` TRAIT, so it lives on the item and Foundry
 * surfaces it only through `Actor#allApplicableEffects()`. `actor.effects` was empty, `eff` was
 * `undefined`, and the sweep `continue`d — silently, forever.
 *
 * What is pinned here, and why each case exists:
 *   1. the DEFECT, both directions — the item-transferred marker raises, and the actor-level one
 *      (bench run 33's hand-made control) still does, so the fix widened rather than moved;
 *   2. the fix is `allApplicableEffects()` and NOT the `appliedEffects` getter the report also
 *      suggested — `appliedEffects` filters on `effect.active`, and every marker in this family is
 *      stored DISABLED, so it would have been exactly as blind;
 *   3. the sweep is IDEMPOTENT — the run-33 "six further triggers produced nothing" observation is
 *      what a SUCCEEDED sweep is supposed to look like, so a future reader does not chase it;
 *   4. the release half and the never-fight-a-GM-toggle half both survive the widening;
 *   5. the CLASSIFICATION — the mutating, flag-keyed reads (counters, buffs, markers) were left on
 *      `actor.effects` deliberately, because `update()`/`delete()` on a yielded ITEM effect writes
 *      to the item. A source ratchet keeps a later pass from widening them by reflex.
 */
"use strict";
const assert = require("assert");
const {
  loadEngine, mockActor, mockItem, mockEffect, stageWorld, withStubs, captureChat, codeOnly, readEngineSource, eq,
} = require("./harness.js");

const env = loadEngine();

/* ---------- staging -------------------------------------------------------------------------- */

// A Stalker-shaped adversary: the `Veil` TRAIT carries both the rule and (transfer:true) the marker.
function stalker({ transferred = true, disabled = true, autoVeil = undefined } = {}) {
  const marker = mockEffect({
    name: "Veil — Concealed (cover/low light)", id: "veil-ae", disabled,
    transfer: transferred, ...(autoVeil === undefined ? {} : { flags: { autoVeil } }),
  });
  const trait = mockItem({
    name: "Veil", type: "trait", flags: { adversaryTalent: true },
    events: [{ handler: { type: "edha-dark-veil", effectName: "Veil" } }],
    effects: transferred ? [marker] : [],
  });
  const actor = mockActor({
    name: "Stalker", id: "stalker-1", type: "adversary",
    items: [trait], effects: transferred ? [] : [marker],
  });
  trait.actor = actor;
  marker.parent = transferred ? trait : actor;
  const token = { id: "tok-stalker", name: "Stalker (1)", actor, center: { x: 500, y: 500 }, document: { disposition: -1 } };
  return { actor, trait, marker, token };
}

// darknessLevel 1 + globalLight off + no light sources = edhaPointIlluminated -> false (unlit).
function lighting(env, { unlit }) {
  const darkness = unlit ? 1 : 0;
  env.canvas = env.canvas || {};
  env.canvas.scene = { environment: { darknessLevel: darkness, globalLight: { enabled: !unlit } } };
  env.canvas.environment = { darknessLevel: darkness };
  env.canvas.effects = { lightSources: [] };
}

function gmWorld(env, placeables) {
  const users = Object.assign([{ id: "gm1", isGM: true, active: true }], { activeGM: { isSelf: true } });
  users.filter = Array.prototype.filter;
  return stageWorld(env, { user: { id: "gm1", isGM: true }, users, placeables, actors: [] });
}

/* ---------- 1. the defect, both directions ---------------------------------------------------- */

async function itemTransferredMarkerRaises() {
  const { marker, token } = stalker({ transferred: true });
  const world = gmWorld(env, [token]);
  lighting(env, { unlit: true });
  const cards = await withStubs(env, {}, async () => {
    const c = captureChat(env);
    await env.edhaDarkVeilSweep();
    return c;
  });
  world.undo();

  assert.strictEqual(marker.disabled, false,
    "the item-transferred Veil marker must be ENABLED by the sweep — this is the run-33 defect: " +
    "actor.effects is empty for a transfer:true trait AE, so the lookup must go through allApplicableEffects()");
  assert.strictEqual(marker.getFlag("edha-content", "autoVeil"), true,
    "the engine must stamp autoVeil so it only ever stands DOWN what it raised");
  assert.ok(cards.some((c) => /stands in darkness/.test(c.content)),
    "the record card must post (bench run 33's matched control saw exactly this card from the actor-level copy)");
}

async function actorLevelMarkerStillRaises() {
  const { marker, token } = stalker({ transferred: false });
  const world = gmWorld(env, [token]);
  lighting(env, { unlit: true });
  await env.edhaDarkVeilSweep();
  world.undo();
  assert.strictEqual(marker.disabled, false,
    "the ACTOR-level marker (run 33's hand-made control) must still raise — the fix WIDENS the lookup, it does not move it");
}

/* ---------- 2. why not `appliedEffects` ------------------------------------------------------- */

async function appliedEffectsWouldStillBeBlind() {
  const { actor, marker } = stalker({ transferred: true });
  assert.deepStrictEqual(actor.appliedEffects, [],
    "a DISABLED marker is not in appliedEffects (active = !disabled && !isSuppressed) — which is why " +
    "the fix uses allApplicableEffects(), not the appliedEffects getter the report also offered");
  eq(env.edhaAllEffects(actor).map((e) => e.id), [marker.id]);   // cross-realm: eq(), never deepStrictEqual
}

function allEffectsShapeAndFallback() {
  const onActor = mockEffect({ name: "Engine buff", id: "a1" });
  const transferred = mockEffect({ name: "Trait buff", id: "i1", transfer: true });
  const notTransferred = mockEffect({ name: "Drag-to-target template", id: "i2", transfer: false });
  const item = mockItem({ name: "Trait", type: "trait", effects: [transferred, notTransferred] });
  const a = mockActor({ name: "A", items: [item], effects: [onActor] });
  // actor effects first, then ONLY transfer:true item effects — Foundry v13's order and filter.
  eq(env.edhaAllEffects(a).map((e) => e.id), ["a1", "i1"]);

  // A thin document (or a foreign shell) with no generator must still answer, not throw.
  const thin = { effects: [onActor] };
  eq(env.edhaAllEffects(thin).map((e) => e.id), ["a1"]);   // no generator → falls back to actor.effects
  eq(env.edhaAllEffects(null), []);                        // a missing actor is [], never a throw
  eq(env.edhaAllEffects({}), []);                          // an actor with neither collection is []
}

/* ---------- 3. the run-33 "second symptom": a succeeded sweep is a NO-OP ----------------------- */

async function sweepIsIdempotentAfterASuccess() {
  const { marker, token } = stalker({ transferred: true });
  const world = gmWorld(env, [token]);
  lighting(env, { unlit: true });
  const cards = captureChat(env);
  await env.edhaDarkVeilSweep();
  const afterFirst = marker.updates.length;
  assert.strictEqual(cards.length, 1, "one card on the raise");
  for (let i = 0; i < 6; i++) await env.edhaDarkVeilSweep();   // run 33's six further triggers
  world.undo();

  assert.strictEqual(marker.updates.length, afterFirst,
    "no further write: once the marker is up and the square is still unlit, BOTH branches are false");
  assert.strictEqual(cards.length, 1,
    "and no further card. Bench run 33's 'six further triggers produced nothing' is what a SUCCEEDED " +
    "sweep looks like — the engine leaves no once-per-scene stamp, no token/actor flag and no timer " +
    "state that could suppress a later trigger. Do not go looking for one.");
  assert.strictEqual(marker.disabled, false, "and the marker is still up");
}

/* ---------- 4. the release half, and never fighting a GM's own toggle -------------------------- */

async function releasesOnlyWhatItRaised() {
  const { marker, token } = stalker({ transferred: true, disabled: false, autoVeil: true });
  const world = gmWorld(env, [token]);
  lighting(env, { unlit: false });
  await env.edhaDarkVeilSweep();
  world.undo();
  assert.strictEqual(marker.disabled, true, "re-lit: an ENGINE-raised item-transferred marker stands down");
  assert.strictEqual(marker.getFlag("edha-content", "autoVeil"), false, "and the stamp is cleared to false, never removed");
}

async function neverFightsAManualToggle() {
  const { marker, token } = stalker({ transferred: true, disabled: false });   // no autoVeil stamp = a GM turned it on
  const world = gmWorld(env, [token]);
  lighting(env, { unlit: false });
  await env.edhaDarkVeilSweep();
  world.undo();
  assert.strictEqual(marker.disabled, false,
    "a marker the GM toggled on by hand (no autoVeil flag) is left alone in light — cover stays a table read");
  assert.strictEqual(marker.updates.length, 0, "and nothing is written to it at all");
}

/* ---------- 5. the isolated scan — the same shape, closed while latent ------------------------- */

function isolatedSeesATraitTransferredStatus() {
  const inflicted = mockEffect({ name: "Isolated (trait)", id: "iso-trait", statusId: "isolated", transfer: true });
  const trait = mockItem({ name: "Some Trait", type: "trait", flags: { adversaryTalent: true }, effects: [inflicted] });
  const a = mockActor({ name: "Carrier", id: "carrier", items: [trait], effects: [], statuses: ["isolated"] });
  assert.strictEqual(env.edhaIsIsolated(a, null), true,
    "`actor.statuses` is rebuilt from allApplicableEffects(), so a trait-transferred `isolated` reads as " +
    "ON the creature; edhaIsIsolated must agree instead of falling through to the positional test");

  // The engine's OWN positional marker must still never feed back (the flag guard is unchanged).
  const marker = mockEffect({ name: "Isolated", id: "iso-marker", statusId: "isolated", flags: { isoMarker: true } });
  const b = mockActor({ name: "Marked", id: "marked", items: [], effects: [marker], statuses: ["isolated"] });
  const world = stageWorld(env, { placeables: [] });
  const positional = env.edhaIsIsolated(b, null);
  world.undo();
  assert.notStrictEqual(positional, true,
    "an isoMarker-flagged effect is display-only and must not be read back as INFLICTED isolation");
}

/* ---------- 6. the classification ratchet ----------------------------------------------------- */

function onlyTheAuthorableReadsWereWidened() {
  const src = codeOnly(readEngineSource());

  const body = (name) => {
    const i = src.indexOf(`function ${name}(`);
    assert.ok(i >= 0, `${name} not found in the engine`);
    const j = src.indexOf("\nfunction ", i + 1);
    return src.slice(i, j < 0 ? undefined : j);
  };

  assert.ok(/edhaAllEffects\(a\)\.find\(/.test(body("edhaDarkVeilSweep")),
    "edhaDarkVeilSweep must resolve its marker through edhaAllEffects — the run-33 defect");
  assert.ok(/edhaAllEffects\(actor\)/.test(body("edhaIsIsolated")),
    "edhaIsIsolated's INFLICTED scan must go through edhaAllEffects");

  // The mutating, flag-keyed reads stay narrow ON PURPOSE: update()/delete() on a yielded ITEM
  // effect writes to the item, permanently altering that creature's copy of the talent or trait.
  for (const fn of ["edhaCounterApplyGM", "edhaApplyDefBuff", "edhaFateApplyOrdainedBuff", "edhaOvergrowthDeflectStack"]) {
    assert.ok(!/edhaAllEffects\(/.test(body(fn)),
      `${fn} must NOT use edhaAllEffects: it finds/updates/deletes an effect the ENGINE created on the ` +
      `actor (a flags.edha-content.* buff or counter), which can never be item-transferred — widening it ` +
      `would let the engine write to an ITEM. See the 2026-09-06 FIX PASS 5 delta's verdict table.`);
  }

  const sites = (src.match(/edhaAllEffects\(/g) || []).length;
  assert.strictEqual(sites, 4,
    `edhaAllEffects has ${sites} occurrence(s) (1 definition + 3 call sites: the veil sweep, edhaIsIsolated, ` +
    `the isolated marker sync). If you added a site, first prove the effect it seeks could be AUTHORED ON AN ` +
    `ITEM — if the engine created it on the actor, widening is a new bug — then raise this number and record ` +
    `the site in the handoff delta's verdict table.`);
}

/* ---------- runner ---------------------------------------------------------------------------- */

test("the item-transferred Veil marker raises (the run-33 defect)", itemTransferredMarkerRaises);
test("the actor-level marker still raises (run 33's matched control)", actorLevelMarkerStillRaises);
test("appliedEffects would have been just as blind; edhaAllEffects is not", appliedEffectsWouldStillBeBlind);
test("edhaAllEffects: actor effects, then transfer:true item effects, with a safe fallback", allEffectsShapeAndFallback);
test("after a success the sweep is a NO-OP — the run-33 'second symptom' explained", sweepIsIdempotentAfterASuccess);
test("re-lit: the engine stands down only what it raised", releasesOnlyWhatItRaised);
test("a GM's manual marker toggle is never fought", neverFightsAManualToggle);
test("edhaIsIsolated sees a trait-transferred `isolated`, but never its own marker", isolatedSeesATraitTransferredStatus);
test("only the AUTHORABLE reads were widened (classification ratchet)", onlyTheAuthorableReadsWereWidened);
