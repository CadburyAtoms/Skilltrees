/* REGRESSION — one banked use rode BOTH rolls (bench run 9, 2026-07-27i defect 3).
 *
 * Pack Hunting's card offers its bonus on "your ally's attack OR damage roll"; 2bO-7's spec is
 * "either, whichever comes first — NOT both". The bench saw a single banked use ride the attack
 * (`1d20 + 4 + 3[Pack Hunting]`, with its own card) AND the damage (`1d6 + 3 + 4`).
 *
 * The `appliesTo` gate was NOT the bug — run 3 verified Predatory Patience honouring it, and Pack
 * Hunting's rule declares `appliesTo: "either"` correctly. The bug is that the pipeline has two
 * independent consumers of one document flag, and the d20 half APPLIES at `pre<Ctx>Roll` while
 * consuming only at `<ctx>Roll`. A weapon Strike rolls damage inside that window, so the damage
 * wrapper reads a flag that is applied-but-not-yet-spent. Neither consumer awaits its unset, and
 * the damage wrapper is synchronous (it must build overrideFormula before the roll), so no promise
 * queue can fix it — hence an in-memory claim, the shape `_edhaLastRoll.used` already uses.
 *
 * The guard is deliberately CROSS-PATH ONLY. `edhaNextTestMatches` already keeps a `test` mod off
 * the damage path and a `damage` mod off d20 rolls, so only `either` can be seen twice — and the
 * data's one `count: 2` mod (Blue's Probability Cascade) is `test`-only and must keep applying to
 * two separate tests. That case is pinned below precisely because it is what a careless guard
 * would break.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();
const claim = (gid, path, ts = Date.now()) => ({ gid, path, ts });
const packHunting = { source: "Pack Hunting", formula: "3", count: 1, appliesTo: "either", gid: "GID-PACK-1" };

test("edhaNextModPathOk: with no claim, either path may take an `either` mod", () => {
  assert.strictEqual(env.edhaNextModPathOk(null, packHunting, "test"), true);
  assert.strictEqual(env.edhaNextModPathOk(null, packHunting, "damage"), true);
});

test("REGRESSION: once the d20 half takes it, the damage half may NOT (and vice versa)", () => {
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-PACK-1", "test"), packHunting, "damage"), false,
    "the attack roll took it — the damage roll must not double-dip");
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-PACK-1", "damage"), packHunting, "test"), false,
    "the damage roll took it — the attack roll must not double-dip");
});

test("the same path re-entering is still allowed (never removes a bonus today's behaviour grants)", () => {
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-PACK-1", "test"), packHunting, "test"), true);
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-PACK-1", "damage"), packHunting, "damage"), true);
});

test("a DIFFERENT banked use is never blocked by the previous claim", () => {
  const second = { ...packHunting, gid: "GID-PACK-2" };
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-PACK-1", "test"), second, "damage"), true);
});

test("the claim expires, so a cancelled roll cannot strand the next one", () => {
  const stale = claim("GID-PACK-1", "test", Date.now() - 60_000);
  assert.strictEqual(env.edhaNextModPathOk(stale, packHunting, "damage"), true);
});

test("a `test`-only mod is NEVER guarded — Probability Cascade's count 2 must keep working", () => {
  const cascade = { source: "Probability Cascade", mode: "disadvantage", count: 2, appliesTo: "test", gid: "GID-CASCADE" };
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-CASCADE", "test"), cascade, "test"), true);
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-CASCADE", "test"), cascade, "damage"), true);
  // and the implicit default (no appliesTo at all) is `test` too — every pre-07-24x consumer
  const legacy = { source: "Anticipate", mode: "advantage", count: 1 };
  assert.strictEqual(env.edhaNextModPathOk(claim(env.edhaNextModGid(legacy), "test"), legacy, "damage"), true);
});

test("a `damage`-only mod is not guarded either (single path by construction)", () => {
  const dmgOnly = { source: "Some Rider", formula: "2", count: 1, appliesTo: "damage", gid: "GID-DMG" };
  assert.strictEqual(env.edhaNextModPathOk(claim("GID-DMG", "damage"), dmgOnly, "test"), true);
});

test("edhaNextModGid: a gid-less legacy mod still gets a stable identity", () => {
  const legacy = { source: "Pack Hunting", formula: "3", count: 1, appliesTo: "either" };
  assert.strictEqual(env.edhaNextModGid(legacy), env.edhaNextModGid({ ...legacy }), "stable across reads");
  assert.notStrictEqual(env.edhaNextModGid(legacy), env.edhaNextModGid({ ...legacy, formula: "4" }), "different bank, different id");
});

test("edhaNextModClaimOk: the live end-to-end guard on one actor", () => {
  const actor = { id: "ally-1" };
  assert.strictEqual(env.edhaNextModClaimOk(actor, packHunting, "test"), true, "attack takes it");
  assert.strictEqual(env.edhaNextModClaimOk(actor, packHunting, "damage"), false, "damage is refused — the bench symptom");
  // a fresh grant clears the claim
  const fresh = { ...packHunting, gid: "GID-PACK-9" };
  assert.strictEqual(env.edhaNextModClaimOk(actor, fresh, "damage"), true, "the next banked use is free to ride damage");
  assert.strictEqual(env.edhaNextModClaimOk(actor, fresh, "test"), false, "…and then the attack half is refused");
});

test("edhaNextModClaimOk never records a claim for a single-path mod", () => {
  const actor = { id: "ally-2" };
  const cascade = { source: "Probability Cascade", mode: "disadvantage", count: 2, appliesTo: "test", gid: "GID-C2" };
  assert.strictEqual(env.edhaNextModClaimOk(actor, cascade, "test"), true);
  assert.strictEqual(env.edhaNextModClaimOk(actor, cascade, "test"), true, "second test still applies");
  assert.strictEqual(env.edhaNextModClaimOk(actor, cascade, "test"), true);
});
