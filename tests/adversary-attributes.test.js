/* R-128 (a) (2026-09-14): adversary blocks may state `attributes`, and the build derives from them —
 * the prototype token's Senses Range from AWA (the same ladder the system writes on the sheet) and the
 * attuned block's default Investiture pool from max(AWA, PRE). Pinned through the pure helpers in
 * scripts/foundry-build-parts.js (foundry-build.js has no exports and runs the build on require).
 *
 * The parity property that matters most: a block that states NO attributes builds exactly as it did
 * before R-128 — no `attributes` key written, senses at ladder(0) = 5 ft, inv 2 for an attuned block.
 * The 52 blocks of 2026-09-14 all state none, so the adversaries pack is byte-identical until a
 * nation pass re-derives them (R-135).
 */
"use strict";
const assert = require("assert");
const path = require("path");
const parts = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));

test("R-128: a block with no `attributes` writes none, sees 5 ft, and an attuned one defaults to inv 2 — the pre-R-128 shape, byte for byte", () => {
  assert.strictEqual(parts.advAttributes({ role: "rival" }), null);
  assert.strictEqual(parts.advAttributes({ attributes: {} }), null, "an empty object states nothing");
  assert.strictEqual(parts.advSensesRangeFt({ role: "rival" }), 5);
  assert.strictEqual(parts.advInvDefault({ leylines: ["red"] }), 2);
  assert.strictEqual(parts.advInvDefault({}), 0, "an unattuned block has no pool");
});

test("R-128: stated attributes write only the stated keys, as {value}, and read as six numbers", () => {
  assert.deepStrictEqual(parts.advAttributes({ attributes: { awa: 3, str: 1 } }), { str: { value: 1 }, awa: { value: 3 } });
  assert.deepStrictEqual(parts.advAttributeValues({ attributes: { awa: 3, str: 1 } }), { str: 1, spd: 0, int: 0, wil: 0, awa: 3, pre: 0 });
  assert.deepStrictEqual(parts.advAttributes({ attributes: { awa: "2" } }), { awa: { value: 2 } }, "a numeric string coerces");
  assert.deepStrictEqual(parts.advAttributes({ attributes: { awa: "junk" } }), { awa: { value: 0 } }, "junk reads as 0, never NaN");
});

test("R-128: the token's Senses Range follows AWA on the system ladder, and an explicit `senses` still wins over it", () => {
  assert.strictEqual(parts.advSensesRangeFt({ attributes: { awa: 1 } }), 10);
  assert.strictEqual(parts.advSensesRangeFt({ attributes: { awa: 3 } }), 20);
  assert.strictEqual(parts.advSensesRangeFt({ attributes: { awa: 6 } }), 50);
  assert.strictEqual(parts.advSensesRangeFt({ attributes: { awa: 3 }, senses: 30 }), 30, "the fiction override beats the ladder");
  assert.strictEqual(parts.advSensesRangeFt({ attributes: { awa: 3 } }), parts.sensesRangeFtFromAwa(3), "one ladder, not a second copy");
});

test("R-128: the attuned block's default Investiture pool is 2 + max(AWA, PRE), the PC derivation", () => {
  assert.strictEqual(parts.advInvDefault({ leylines: ["white"], attributes: { awa: 1, pre: 3 } }), 5);
  assert.strictEqual(parts.advInvDefault({ leylines: ["white"], attributes: { awa: 2 } }), 4);
  assert.strictEqual(parts.advInvDefault({ attributes: { awa: 4, pre: 4 } }), 0, "no leylines, no pool, whatever the attributes");
});
