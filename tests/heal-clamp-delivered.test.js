/* A heal card must state what LANDED, including when the MAX-HP CLAMP is what ate it.
 *
 * item 68 (fix pass 8, bench run 39) established the contract: "a heal card is built from what
 * edhaCrossHeal RETURNED, never from the roll" — and fixed the heal-CUT half (a Withering mark
 * scaling the amount before the write). It missed the other half: `edhaHealActor` clamps at max
 * HP inside the write and `edhaCrossHeal` then returned the amount it had ASKED for, discarding
 * the clamped delta. So a sweep over allies already at full HP announced healing that never
 * happened.
 *
 * Measured twice in bench run 44 (2026-09-09, Palewater Ford): Soggy's White Leyline Attunement
 * printed "healed 3 of 3 ally(ies) for 3 HP" while Tem gained 1, Hannah gained 1, and Soggy —
 * at 11/11 — gained nothing.
 *
 * Six live call sites build their cards from this return value (`const got = await
 * edhaCrossHeal(...)`), so this one number is the whole blast radius.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor } = require("./harness.js");

const env = loadEngine();

function patient(value, max) {
  const a = mockActor({ system: { resources: { hea: { value, max: { value: max } } } } });
  a.isOwner = true;
  return a;
}

test("edhaHealActor returns the delta that landed, not the amount asked for", async () => {
  const a = patient(8, 11);
  assert.strictEqual(await env.edhaHealActor(a, 2), 2, "room for all of it");
});

test("edhaHealActor returns 0 for a target already at max — the run-44 case", async () => {
  const a = patient(11, 11);
  assert.strictEqual(await env.edhaHealActor(a, 1), 0);
});

test("edhaHealActor returns only the part that fit under max", async () => {
  const a = patient(10, 11);
  assert.strictEqual(await env.edhaHealActor(a, 5), 1, "1 HP of room, 5 offered");
});

test("edhaCrossHeal reports the DELIVERED amount through the clamp", async () => {
  assert.strictEqual(await env.edhaCrossHeal(patient(11, 11), 1), 0, "full target: nothing landed");
  assert.strictEqual(await env.edhaCrossHeal(patient(10, 11), 3), 1, "1 HP of room");
  assert.strictEqual(await env.edhaCrossHeal(patient(4, 11), 3), 3, "plenty of room");
});

test("the run-44 sweep now counts 2 healed for 2, not 3 for 3", async () => {
  // Tem 10/13, Hannah 6/11, Soggy 11/11 (the caster, at full) — tier-1 heal of 1 each.
  const subjects = [patient(10, 13), patient(6, 11), patient(11, 11)];
  let healedCount = 0, delivered = 0;
  for (const s of subjects) {
    const got = await env.edhaCrossHeal(s, 1);
    if (got > 0) { healedCount++; delivered += got; }
  }
  assert.strictEqual(healedCount, 2, "the full-HP caster must not be counted as healed");
  assert.strictEqual(delivered, 2, "and the total must be what landed");
});

test("edhaCrossHeal still returns 0 for a non-positive amount or a missing actor", async () => {
  assert.strictEqual(await env.edhaCrossHeal(patient(4, 11), 0), 0);
  assert.strictEqual(await env.edhaCrossHeal(null, 3), 0);
});
