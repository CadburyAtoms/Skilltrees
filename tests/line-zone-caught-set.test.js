/* R-5 / TODO_REPO_HYGIENE #29 — the `edha-zone {kind: line}` caught set catches EVERY character
 * standing in the line, allies and neutrals included; only the caster is spared.
 *
 * Ben answered R-5 on 2026-09-05 ("no it does not" — the line does NOT spare allies). Fault Line's
 * card says "each character"; the engine built its caught set with `edhaEnemyTokensInLine`, which
 * dropped every same-disposition token, so an ally standing in the line was neither damaged nor
 * asked for the save. Card-is-spec: the helper is now `edhaTokensInLine` and the whole rider set —
 * the damage with its Construct multiplier AND the `edhaFoeSkillVsColor` save / `failStatus` — runs
 * on that one widened set.
 *
 * MUTATION-VERIFIED (2026-09-06): restoring the enemies-only filter
 * (`(t.document?.disposition ?? 1) === disp`) in `edhaTokensInLine` fails three of these cases —
 * the ALLY case, the exact-caught-set case, and the fails-closed caster case — 651 passed,
 * 3 failed. (The NEUTRAL case still passes under the mutation: disposition 0 ≠ the caster's 1, so
 * the old filter caught neutrals already. It is pinned because the ruling names neutrals, not
 * because the old code dropped them.)
 *
 * NOT pinned here on purpose: who the dangerous-terrain Region dropped afterwards catches — that is
 * R-6, a separate ruling still open, and this pass must not decide it.
 */
"use strict";
const assert = require("assert");
const { loadEngine, readEngineSource, codeOnly } = require("./harness.js");

const HOSTILE = -1, NEUTRAL = 0, FRIENDLY = 1;

/* Grid: 100 px per 5 ft square, so a 60 ft × 5 ft line from (100,100) running toward +x covers
 * x ∈ [50, 1300] (length 1200 px, plus the half-width overhang the helper allows at both ends)
 * and y ∈ [50, 150] (half-width 50 px off the centreline). */
const GRID = { size: 100, distance: 5 };
const CASTER_X = 100, CASTER_Y = 100, AIM_X = 900, AIM_Y = 100, LENGTH_FT = 60, WIDTH_FT = 5;

function tok(id, x, y, disposition, { hp = 10 } = {}) {
  const actor = { name: id, uuid: `Actor.${id}`, system: { resources: { hea: { value: hp } } } };
  return { id, name: id, actor, document: { disposition }, center: { x, y } };
}

/* The caster's own token, plus one of every kind of bystander the ruling names. */
function stageLine(env) {
  const caster = tok("caster", CASTER_X, CASTER_Y, FRIENDLY);
  const ally = tok("ally", 300, 100, FRIENDLY);                 // dead centre of the line
  const foe = tok("foe", 500, 100, HOSTILE);
  const neutral = tok("neutral", 700, 120, NEUTRAL);            // 20 px off the centreline — inside
  const downedAlly = tok("downed-ally", 400, 100, FRIENDLY, { hp: 0 });
  const allyOffLine = tok("ally-off-line", 600, 400, FRIENDLY); // 300 px off the centreline
  const allyBehind = tok("ally-behind", -300, 100, FRIENDLY);   // behind the caster, not in the line
  const owner = caster.actor;
  owner.getActiveTokens = () => [caster];
  env.canvas.scene = { grid: GRID };
  env.canvas.tokens = { placeables: [caster, ally, foe, neutral, downedAlly, allyOffLine, allyBehind] };
  return { owner, caster, ally, foe, neutral, downedAlly, allyOffLine, allyBehind };
}

const caughtIds = (env, owner) =>
  env.edhaTokensInLine(owner, CASTER_X, CASTER_Y, AIM_X, AIM_Y, LENGTH_FT, WIDTH_FT)
    .map((t) => t.id).sort();

test("R-5: an ALLY standing in the line is caught (was silently spared by the enemies-only filter)", () => {
  const env = loadEngine();
  const { owner } = stageLine(env);
  assert.ok(caughtIds(env, owner).includes("ally"),
    "a same-disposition token inside the line must be in the caught set — the card says 'each character'");
});

test("R-5: a NEUTRAL standing in the line is caught too — the set is disposition-blind", () => {
  const env = loadEngine();
  const { owner } = stageLine(env);
  assert.ok(caughtIds(env, owner).includes("neutral"));
});

test("R-5: the CASTER is never in their own line", () => {
  const env = loadEngine();
  const { owner } = stageLine(env);
  assert.ok(!caughtIds(env, owner).includes("caster"),
    "the caster is the one exclusion the card states");
});

test("R-5: the caught set is exactly ally + foe + neutral — downed, off-line and behind-the-caster tokens stay out", () => {
  const env = loadEngine();
  const { owner } = stageLine(env);
  assert.deepStrictEqual(caughtIds(env, owner), ["ally", "foe", "neutral"]);
});

/* The caster fallback: an owner whose token cannot be resolved (no active token, nothing controlled)
 * must still not catch itself — the exclusion falls back to actor identity rather than failing open. */
test("R-5: caster exclusion fails CLOSED when the caster token cannot be resolved (actor identity)", () => {
  const env = loadEngine();
  const st = stageLine(env);
  st.owner.getActiveTokens = () => [];
  env.canvas.tokens.controlled = [];
  assert.deepStrictEqual(caughtIds(env, st.owner), ["ally", "foe", "neutral"]);
});

/* The point of R-5 is not just "who is caught" but "the WHOLE rider set runs on them". Both riders
 * must read the same `caught` binding — a fix that widened only the damage half would leave allies
 * damaged but never asked for the save, which is the drift the ruling closes. */
test("R-5: edhaFaultLine feeds the SAME caught set to the damage map and to the save rider", () => {
  const src = codeOnly(readEngineSource());
  const body = src.slice(src.indexOf("async function edhaFaultLine("));
  const fn = body.slice(0, body.indexOf("\n}\n") + 3);
  assert.ok(/const caught = edhaTokensInLine\(owner, cx, cy, pt\.x, pt\.y, lengthFt, widthFt\)/.test(fn),
    "the kind:line caught set must come from edhaTokensInLine (every character but the caster)");
  assert.ok(!/edhaEnemyTokensInLine/.test(src),
    "the enemies-only line helper must be gone from the engine, not merely unused");
  assert.ok(/caught\.map\(t => \(\{ actorUuid/.test(fn), "the damage hits must be built from `caught`");
  assert.ok(/edhaFoeSkillVsColor\(owner, caught,/.test(fn), "the save rider must run on `caught` too");
});
