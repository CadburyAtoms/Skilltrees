/* REGRESSION — Spreading Roots expanded nothing: `deepClone(region.shapes)` hands back the LIVE
 * DataModels (bench run 26, 2026-09-05; fixed 2026-09-05).
 *
 * The symptom: Spreading Roots' offer, once-per-round budget, 1-Investiture charge and "the terrain
 * expands 10 ft" card all worked, the player-visible Drawing grew from 600×600 @ 2400,5100 to
 * 1200×1200 @ 2100,4800 — and the Region's `shapes` and `_source.shapes` both stayed 600×600. The
 * table saw a 20 ft patch of difficult terrain; the engine went on enforcing 10 ft.
 *
 * The mechanism, read off Foundry's own source rather than inferred:
 *   1. `region.shapes` is an array of shape DataModel instances (RectangleShapeData / CircleShapeData).
 *   2. `foundry.utils.deepClone` (common/utils/helpers.mjs `_deepClone`) returns any object whose
 *      constructor is not `Object` BY REFERENCE — "Unsupported advanced objects … return original"
 *      unless `{strict: true}`. So the "clone" was a new array of the SAME live models.
 *   3. Mutating `r0.x` / `r0.width` writes the model's initialized accessor, not its `_source`.
 *   4. `region.update({shapes})` cleans the incoming value through `EmbeddedDataField._cast`, which
 *      does `value = value.toObject()` — i.e. `deepClone(this._source)`. The mutations are dropped
 *      on the way in, the diff is empty, and the update is a silent no-op.
 *   5. The very next lines write the Drawing with explicit numbers read off the MUTATED live model,
 *      which is why the visual and the mechanics disagreed instead of both failing.
 *
 * It was a FAMILY, not a talent: the circle branch of the same function and `edhaRecenterTerrain`
 * (Pinpoint Charge's "the terrain moves with the target") carried the identical latent bug, and
 * `edhaGrowTerrainSquareGM` only escaped because it PUSHES a plain object, so the array length
 * changes and the diff is never empty. All three now read their shapes through `edhaRegionShapes`.
 *
 * These cases pin the two pure halves plus a source scan, because the bug is invisible in behaviour
 * from Node: a stub Region would happily accept the mutated models. The scan is what stops a future
 * `deepClone(region.shapes)` from landing again.
 */
"use strict";
const assert = require("assert");
const { loadEngine, readEngineSource, codeOnly } = require("./harness.js");

const env = loadEngine();

/* A shape DataModel stand-in: the persisted values live on `_source`, the initialized accessors are
 * separate writable own properties, and `toObject()` returns a clone of the SOURCE — exactly the
 * three facts that made the old code a no-op. `constructor !== Object` is the property that makes
 * Foundry's deepClone hand this back by reference, so the stub is a real class. */
class ShapeModelStub {
  constructor(source) {
    this._source = { ...source };
    Object.assign(this, source);           // initialized accessors, decoupled from _source
  }
  toObject() { return { ...this._source }; }
}
function fakeRegion(sources) {
  const models = sources.map(s => new ShapeModelStub(s));
  return {
    id: "region-1",
    shapes: models,
    toObject() { return { shapes: models.map(m => m.toObject()) }; },
  };
}

const RECT = { type: "rectangle", x: 2400, y: 5100, width: 600, height: 600, rotation: 0, hole: false };

test("edhaRegionShapes returns SOURCE objects, not the live shape models", () => {
  const region = fakeRegion([RECT]);
  const shapes = env.edhaRegionShapes(region);
  assert.strictEqual(shapes.length, 1);
  assert.notStrictEqual(shapes[0], region.shapes[0],
    "handing back the live DataModel is the bug itself — region.update() would re-read its _source");
  assert.strictEqual(Object.getPrototypeOf(shapes[0]), Object.prototype,
    "the shape handed to region.update() must be a plain object, or EmbeddedDataField._cast " +
    "toObject()s it and throws the edits away");
  assert.deepStrictEqual(shapes[0], RECT);
});

test("mutating what edhaRegionShapes returned leaves the live models untouched (the no-op it replaces)", () => {
  const region = fakeRegion([RECT]);
  const shapes = env.edhaRegionShapes(region);
  shapes[0].width = 1200;
  assert.strictEqual(region.shapes[0].width, 600, "the live model must not be edited in place");
  assert.strictEqual(region.shapes[0]._source.width, 600);
});

/* Foundry's real deepClone, transcribed from common/utils/helpers.mjs `_deepClone` (v13.351). The
 * harness's shared stub is a JSON round-trip, which does NOT reproduce the one behaviour this whole
 * regression turns on — a class instance is returned BY REFERENCE — so the negative control uses the
 * platform's own semantics instead of the stub. */
function foundryDeepClone(original, strict = false) {
  if ((typeof original !== "object") || (original === null)) return original;
  if (original instanceof Array) return original.map(o => foundryDeepClone(o, strict));
  if (original instanceof Date) return new Date(original);
  if (original.constructor && (original.constructor !== Object)) {
    if (strict) throw new Error("deepClone cannot clone advanced objects");
    return original;                       // ← the line that made the old code a no-op
  }
  const clone = {};
  for (const k of Object.keys(original)) clone[k] = foundryDeepClone(original[k], strict);
  return clone;
}

test("NEGATIVE control: the old deepClone path returns the live model, so its edits never reach _source", () => {
  const region = fakeRegion([RECT]);
  const old = foundryDeepClone(region.shapes);                  // exactly what the engine used to do
  assert.strictEqual(old[0], region.shapes[0],
    "Foundry's deepClone returns a non-plain object by reference; if that ever stops being true, " +
    "re-derive this regression from common/utils/helpers.mjs rather than deleting it");
  old[0].width += 600;
  assert.strictEqual(region.shapes[0]._source.width, 600,
    "the mutation lands on the accessor only — region.update({shapes}) re-reads _source via " +
    "EmbeddedDataField._cast → toObject() and diffs to nothing");
});

test("edhaGrowShapes grows a square SYMMETRICALLY — the exact geometry bench run 26 measured", () => {
  const shapes = [{ ...RECT }];
  const grown = env.edhaGrowShapes(shapes, 600);                // 10 ft on a 300px / 5 ft grid
  assert.strictEqual(grown.kind, "rectangle");
  assert.deepStrictEqual(
    { x: shapes[0].x, y: shapes[0].y, width: shapes[0].width, height: shapes[0].height },
    { x: 2100, y: 4800, width: 1200, height: 1200 },
    "the Drawing grew to 1200×1200 @ 2100,4800 while the Region stayed 600×600 @ 2400,5100 — " +
    "this is the geometry the Region must now reach too");
  assert.strictEqual(grown.shape, shapes[0], "the caller syncs the Drawing off the shape that grew");
});

test("edhaGrowShapes grows a circle's radius, and prefers a solid circle over a rectangle", () => {
  const shapes = [{ type: "circle", x: 500, y: 500, radius: 150, hole: false }, { ...RECT }];
  const grown = env.edhaGrowShapes(shapes, 600);
  assert.strictEqual(grown.kind, "circle");
  assert.strictEqual(shapes[0].radius, 750);
  assert.strictEqual(shapes[1].width, 600, "the rectangle must be left alone when a circle grew");
});

test("edhaGrowShapes ignores HOLE shapes and reports nothing to write when there is no solid shape", () => {
  assert.strictEqual(env.edhaGrowShapes([{ type: "rectangle", x: 0, y: 0, width: 10, height: 10, hole: true }], 600), null);
  assert.strictEqual(env.edhaGrowShapes([], 600), null);
  assert.strictEqual(env.edhaGrowShapes(undefined, 600), null);
});

test("SOURCE SCAN: no engine writer may deepClone a `.shapes` array again", () => {
  const code = codeOnly(readEngineSource());
  const hits = [...code.matchAll(/deepClone\s*\(\s*[A-Za-z_$][\w$.?]*\.shapes\b/g)].map(m => m[0]);
  assert.deepStrictEqual(hits, [],
    "deepClone returns shape DataModels by reference, so the mutation never reaches _source and " +
    "region.update() silently writes nothing. Read shapes with edhaRegionShapes(region) instead.");
});

test("SOURCE SCAN: every region.update({shapes}) site sources its array from edhaRegionShapes", () => {
  const code = codeOnly(readEngineSource());
  const writers = [...code.matchAll(/region\.update\(\s*\{\s*shapes\s*\}/g)];
  assert.ok(writers.length >= 3,
    `expected the three shape writers (grow / recenter / square-spread), found ${writers.length} — ` +
    "if a site was renamed, re-point this scan rather than deleting it");
  for (const w of writers) {
    // The `const shapes = …` that feeds this update is the nearest one above it.
    const before = code.slice(0, w.index);
    const decl = before.lastIndexOf("const shapes =");
    assert.notStrictEqual(decl, -1, "a region.update({shapes}) with no local shapes array?");
    const line = code.slice(decl, code.indexOf("\n", decl));
    assert.ok(/edhaRegionShapes\(/.test(line),
      `a region.update({shapes}) is fed by \`${line.trim()}\` — every shape write must go through ` +
      "edhaRegionShapes(region), or it is the bench-run-26 silent no-op again");
  }
});
