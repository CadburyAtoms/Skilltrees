/* REGRESSION — R-78: `edha-aoe-template` is RETIRED; `edha-burst` is the only AoE model.
 * (EDHA_RULINGS.md R-78, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * Two AoE models were registered side by side. The live one is `edha-burst` → edhaCastBurst →
 * edhaBurstDetonate, which resolves damage itself. The dead one was `edha-aoe-template` →
 * edhaPlaceAoe, which dropped a circle on the current target, auto-targeted what it caught, and
 * left the GM to press Apply. Bench run 38 measured the split: ZERO `edha-aoe-template` rules in
 * `data/` against 12 `edha-burst` ones (3 talents + adversary abilities). So the registration's
 * only remaining effect was to offer a dead choice in Ben's Events-tab dropdown, one row above the
 * live one — the R-74 / R-76 shape.
 *
 * What this pins is the RETIREMENT, in the two places a reader could get it wrong:
 *   • the type is gone from the engine's registrations (which is what the Events tab enumerates
 *     and what lint-refs pass 9 parses), and
 *   • `edha-burst` is untouched — the failure mode of "retire the AoE handler" done carelessly is
 *     retiring the wrong one, or both.
 * Plus the two halves of the surface: no `edhaPlaceAoe` in the file, and no `edha.aoe()` on the
 * console API (leaving that alias behind would have been a load-time ReferenceError, not a
 * cosmetic leftover). The shared helpers the burst path also uses are asserted STILL PRESENT, so a
 * future over-eager deletion of "the AoE code" fails here rather than at Ben's table.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const { readEngineSource, codeOnly, loadEngine } = require("./harness.js");
const { parseHandlerSchemas } = require(path.join(__dirname, "..", "scripts", "handler-schemas.js"));

const SRC = readEngineSource();

test("R-78: edha-aoe-template is NOT a registered handler type, and edha-burst still is", () => {
  const schemas = parseHandlerSchemas(SRC);
  assert.ok(!schemas.has("edha-aoe-template"),
    "edha-aoe-template is still registered — the Events-tab dropdown still offers the dead model");
  assert.ok(schemas.has("edha-burst"),
    "edha-burst must survive the retirement — it is the AoE model everything in data/ uses");
});

test("R-78: edhaPlaceAoe is gone from the engine, code and console API alike", () => {
  const code = codeOnly(SRC);   // comments are the retirement NOTE — they name it on purpose
  assert.ok(!/function edhaPlaceAoe\b/.test(code), "edhaPlaceAoe's definition survived");
  assert.ok(!/edhaPlaceAoe/.test(code), "a live reference to edhaPlaceAoe survived (a load-time ReferenceError)");
  const env = loadEngine();
  assert.strictEqual(typeof env.edhaPlaceAoe, "undefined", "the function is still defined at runtime");
});

test("R-78: the helpers the BURST path shares are untouched", () => {
  const env = loadEngine();
  // Each of these was called by edhaPlaceAoe too — deleting them with it would break edha-burst.
  for (const fn of ["edhaSetUserTargets", "edhaCheckMultiHit", "edhaDrawCircle", "edhaTokensInCircle", "edhaCastBurst"]) {
    assert.strictEqual(typeof env[fn], "function", `${fn} was removed with the retired handler`);
  }
});

test("R-78: no authored rule anywhere in data/ references the retired type", () => {
  // The premise of the retirement, re-measured rather than trusted: if a rule ever appears, the
  // handler must come back (or that rule must move to edha-burst) — this is the alarm for that.
  const fs = require("fs");
  const DATA = path.join(__dirname, "..", "data");
  const hits = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith(".json")) continue;
      if (e.name === "native-vocabulary.json") continue;   // the SYSTEM's own vocabulary, not ours
      if (fs.readFileSync(p, "utf8").includes("edha-aoe-template")) hits.push(path.relative(DATA, p));
    }
  };
  walk(DATA);
  assert.deepStrictEqual(hits, [], `shipped data still carries edha-aoe-template rules: ${hits.join(", ")}`);
});
