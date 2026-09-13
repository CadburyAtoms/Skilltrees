/* Draw Mana's recovered amount (R-126 (a), Ben, chat, 2026-09-13: "I like option a — equal to
 * highest color rank").
 *
 * From 2026-06-12 to 2026-09-13 `edhaDrawMana` recovered Investiture equal to the actor's TIER — one
 * per Action at levels 1–5. The balance review's yardstick 4 rested on it, and it turned out to be
 * an implementation default: the initial-atlas design text said only "restores Investiture", and no
 * ruling had ever set the number. R-126 (a) makes it the actor's highest attuned leyline rank, read
 * through `edhaColorRank` so an adversary with no build-written rank in a colour still resolves its
 * role rank (ruling 122's fallback), with a floor of 1.
 *
 * These pin the pure helper `edhaDrawManaYield(actor)`; the write and the chat line in
 * `edhaDrawMana` consume it. A NEGATIVE case pins that tier no longer enters the yield.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

const character = (skills, tier = 1) => ({ type: "character", system: { tier, skills } });

test("edhaDrawManaYield: a leyline character draws its colour rank (rank 2 at levels 1–5)", () => {
  assert.strictEqual(env.edhaDrawManaYield(character({ white: { rank: 2 } })), 2);
});

test("edhaDrawManaYield: the HIGHEST colour wins for a two-colour (deity) character", () => {
  assert.strictEqual(env.edhaDrawManaYield(character({ black: { rank: 2 }, green: { rank: 3 } })), 3);
  assert.strictEqual(env.edhaDrawManaYield(character({ blue: { rank: 3 }, red: { rank: 1 } })), 3);
});

test("edhaDrawManaYield: floor of 1 — no colour ranks still draws one", () => {
  assert.strictEqual(env.edhaDrawManaYield(character({})), 1);
  assert.strictEqual(env.edhaDrawManaYield(character({ white: { rank: 0 } })), 1);
  assert.strictEqual(env.edhaDrawManaYield({ type: "character", system: {} }), 1);
});

test("edhaDrawManaYield: the rank read clamps at 5 (edhaColorRank's cap)", () => {
  assert.strictEqual(env.edhaDrawManaYield(character({ red: { rank: 7 } })), 5);
});

test("edhaDrawManaYield: an adversary resolves its role rank through edhaColorRank's fallback", () => {
  assert.strictEqual(env.edhaDrawManaYield({ type: "adversary", system: { role: "boss", skills: {} } }), 3);
  assert.strictEqual(env.edhaDrawManaYield({ type: "adversary", system: { role: "rival", skills: {} } }), 2);
  assert.strictEqual(env.edhaDrawManaYield({ type: "adversary", system: { role: "minion", skills: {} } }), 1);
  // a build-written attuned rank still wins over the role fallback
  assert.strictEqual(env.edhaDrawManaYield({ type: "adversary", system: { role: "minion", skills: { black: { rank: 2 } } } }), 2);
});

test("NEGATIVE: tier no longer enters the yield — a tier-2 character with rank 1 draws 1, not 2", () => {
  assert.strictEqual(env.edhaDrawManaYield(character({ white: { rank: 1 } }, 2)), 1);
  assert.strictEqual(env.edhaDrawManaYield(character({ white: { rank: 3 } }, 1)), 3);
});
