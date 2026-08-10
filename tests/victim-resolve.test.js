/* ENGINE PASS 5.2 (Job 1) — pins the two target readers (edhaUserTargetToken / edhaUserTargetActor)
 * and the R-64 3-term victim chain (edhaResolveVictim) that now back ~64 formerly hand-rolled
 * `Array.from(game.user?.targets ?? [])[0]` sites.
 *
 * R-64 (EDHA_RULINGS.md): `options.victim -> options.target -> the clicking user's current target`.
 * Six-plus sites skipped the middle term, so an event carrying `options.target` (but no `victim`)
 * fell through straight to whatever the CLICKING user had targeted — a different creature than the
 * one the event was actually about. These cases pin the middle term specifically: a bare two-term
 * chain (victim ?? current-target) passes even on the broken code whenever `options.target` and the
 * user's current target happen to agree, so every case below makes them DISAGREE.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld } = require("./harness.js");

function tok(actor) { return { actor, document: {} }; }

test("edhaUserTargetToken: first targeted token, or null with nothing targeted", () => {
  const env = loadEngine();
  const a = { name: "A" }, b = { name: "B" };
  const ta = tok(a), tb = tok(b);
  let undo = stageWorld(env, { user: { targets: [ta, tb] } }).undo;
  try {
    assert.strictEqual(env.edhaUserTargetToken(), ta, "the FIRST targeted token, not the last");
  } finally { undo(); }
  undo = stageWorld(env, { user: { targets: [] } }).undo;
  try { assert.strictEqual(env.edhaUserTargetToken(), null); } finally { undo(); }
  undo = stageWorld(env, { user: null }).undo;
  try { assert.strictEqual(env.edhaUserTargetToken(), null, "no game.user at all"); } finally { undo(); }
});

test("edhaUserTargetActor: the first target's .actor, or null", () => {
  const env = loadEngine();
  const a = { name: "A" };
  let undo = stageWorld(env, { user: { targets: [tok(a)] } }).undo;
  try { assert.strictEqual(env.edhaUserTargetActor(), a); } finally { undo(); }
  undo = stageWorld(env, { user: { targets: [] } }).undo;
  try { assert.strictEqual(env.edhaUserTargetActor(), null); } finally { undo(); }
});

/* -------------------------------------------------------------------------------------------- */
/* edhaResolveVictim — the full 3-term chain                                                     */
/* -------------------------------------------------------------------------------------------- */

test("edhaResolveVictim: options.victim wins over everything else", () => {
  const env = loadEngine();
  const victim = { name: "Victim" }, target = { name: "Target" }, clicked = { name: "Clicked" };
  const undo = stageWorld(env, { user: { targets: [tok(clicked)] } }).undo;
  try {
    const event = { options: { victim, target } };
    assert.strictEqual(env.edhaResolveVictim(event), victim);
  } finally { undo(); }
});

test("edhaResolveVictim: THE MIDDLE TERM — options.target wins when options.victim is absent, even though the clicking user has a DIFFERENT creature targeted", () => {
  const env = loadEngine();
  const target = { name: "Target" }, clicked = { name: "Clicked (wrong creature)" };
  const undo = stageWorld(env, { user: { targets: [tok(clicked)] } }).undo;
  try {
    const event = { options: { target } };   // no `victim` key at all
    assert.strictEqual(env.edhaResolveVictim(event), target,
      "this is the R-64 bug: the broken 2-term chain (victim ?? current-target) would have returned `clicked` here");
  } finally { undo(); }
});

test("edhaResolveVictim: falls through to the clicking user's current target when neither options field is set", () => {
  const env = loadEngine();
  const clicked = { name: "Clicked" };
  const undo = stageWorld(env, { user: { targets: [tok(clicked)] } }).undo;
  try {
    assert.strictEqual(env.edhaResolveVictim({ options: {} }), clicked);
    assert.strictEqual(env.edhaResolveVictim({}), clicked, "a bare event with no .options at all");
    assert.strictEqual(env.edhaResolveVictim(undefined), clicked, "no event argument at all");
  } finally { undo(); }
});

test("edhaResolveVictim: null options.victim / options.target are skipped, not treated as a resolved (but empty) hand-off", () => {
  const env = loadEngine();
  const clicked = { name: "Clicked" };
  const undo = stageWorld(env, { user: { targets: [tok(clicked)] } }).undo;
  try {
    assert.strictEqual(env.edhaResolveVictim({ options: { victim: null, target: null } }), clicked);
  } finally { undo(); }
});

test("edhaResolveVictim: with nothing resolvable anywhere, the optional `owner` fallback is used, then null", () => {
  const env = loadEngine();
  const owner = { name: "Owner (the ?? actor / ?? owner tail some call sites used to carry)" };
  const undo = stageWorld(env, { user: { targets: [] } }).undo;
  try {
    assert.strictEqual(env.edhaResolveVictim({ options: {} }, { owner }), owner,
      "a call site that used to end `?? owner` passes it as the options bag, not folded into the chain itself");
    assert.strictEqual(env.edhaResolveVictim({ options: {} }), null, "no owner passed at all -> null, never a guess");
  } finally { undo(); }
});
