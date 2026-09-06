/* tests/consume-dialog-wrapper.test.js — item 50 / ruling R-70 (b): the ONE sanctioned wrapper on
 * the cosmere-rpg system's `CosmereItem#showConsumeDialog`.
 *
 * The system (2.1.0 `index.js`) maps every `activation.consume` entry to
 * `shouldConsume: options.shouldConsume ?? i === 0` — row 0 ticked, every later row unticked — and
 * `use()` calls `showConsumeDialog()` with no options, so a two-cost card (the Stitchmother's
 * Reknit Form: 1 Investiture, 1 Focus) was under-charged by a default click. Ben's R-70 (b): wrap
 * the dialog so every cost row starts ticked, knowing it applies to every talent with a second cost.
 *
 * Three pins:
 *   1. the PURE option shape the wrapper hands the system (`edhaPreTickConsumeOptions`);
 *   2. that shape run through a faithful copy of the system's 2.1.0 row mapping — a two-cost item
 *      opens with every row ticked, a single-cost item's row is unchanged in every field;
 *   3. a source scan: exactly ONE wrapper of the system dialog exists in the engine (the
 *      iron-rule-2a exception may not silently become two), and the header declares it.
 */
"use strict";
const assert = require("assert");
const { loadEngine, readEngineSource, codeOnly } = require("./harness.js");

/* The engine runs in a vm context, so its object literals carry that realm's Object.prototype and
 * deepStrictEqual (which compares prototypes) would reject a structurally identical value. Re-home
 * a plain object in this realm before comparing. */
const plain = (o) => ({ ...o });

/* Faithful copy of cosmere-rpg 2.1.0's `showConsumeDialog` row mapping (index.js ~L7305) — the
 * part that decides `shouldConsume` per row. Labels are irrelevant here and are left out. */
function systemRowMap(consume, options = {}) {
  return consume.map((c, i) => ({
    type: options.consumeType ?? c.type,
    resourceId: c.resource ?? "unknown",
    amount: c.value,
    shouldConsume: options.shouldConsume ?? i === 0,
  }));
}

const TWO_COST = [
  { type: "resource", resource: "inv", value: { min: 1, max: 1 } },
  { type: "resource", resource: "foc", value: { min: 1, max: 1 } },
];
const ONE_COST = [{ type: "resource", resource: "inv", value: { min: 1, max: 1 } }];

/* ---- 1. the pure option shape ------------------------------------------------------------ */

test("R-70: no options (the shape use() passes) -> { shouldConsume: true } and nothing else", () => {
  const env = loadEngine();
  assert.deepStrictEqual(plain(env.edhaPreTickConsumeOptions(undefined)), { shouldConsume: true });
  assert.deepStrictEqual(plain(env.edhaPreTickConsumeOptions({})), { shouldConsume: true });
});

test("R-70: every other option field passes through untouched; an explicit shouldConsume is kept", () => {
  const env = loadEngine();
  const input = { consumeType: "resource", extra: 7 };
  const out = env.edhaPreTickConsumeOptions(input);
  assert.deepStrictEqual(plain(out), { consumeType: "resource", extra: 7, shouldConsume: true });
  assert.deepStrictEqual(input, { consumeType: "resource", extra: 7 }, "input must not be mutated");
  assert.strictEqual(env.edhaPreTickConsumeOptions({ shouldConsume: false }).shouldConsume, false,
    "an explicit caller keeps what it asked for — only an ABSENT shouldConsume is defaulted");
});

/* ---- 2. through the system's row mapping ------------------------------------------------- */

test("R-70: two-cost item — system default ticks row 0 only; the wrapper's options tick EVERY row", () => {
  const env = loadEngine();
  const before = systemRowMap(TWO_COST).map((r) => r.shouldConsume);
  assert.deepStrictEqual(before, [true, false], "the defect: the system's own default");
  const after = systemRowMap(TWO_COST, env.edhaPreTickConsumeOptions()).map((r) => r.shouldConsume);
  assert.deepStrictEqual(after, [true, true]);
});

test("R-70: single-cost item — the wrapped row deep-equals the unwrapped row in every field", () => {
  const env = loadEngine();
  assert.deepStrictEqual(systemRowMap(ONE_COST, env.edhaPreTickConsumeOptions()), systemRowMap(ONE_COST));
});

test("R-70: the installed prototype patch hands the system's showConsumeDialog the pre-ticked options", async () => {
  const env = loadEngine();
  const seen = [];
  class CosmereItem { async showConsumeDialog(options = {}) { seen.push(options); return "rows"; } }
  env.CONFIG.Item = { documentClass: CosmereItem };
  env.globalThis.libWrapper = undefined;
  assert.strictEqual(env.edhaInstallConsumeDialogWrapper(), "patched");
  assert.strictEqual(env.edhaInstallConsumeDialogWrapper(), "already", "a second install must not stack");
  const item = new CosmereItem();
  assert.strictEqual(await item.showConsumeDialog(), "rows", "the system's return value passes back");
  assert.deepStrictEqual(seen.map(plain), [{ shouldConsume: true }]);
});

/* ---- 3. exactly one wrapper of the system dialog exists ---------------------------------- */

test("R-70: the engine wraps the system's showConsumeDialog in exactly ONE place, and the header declares it", () => {
  const code = codeOnly(readEngineSource());
  const assigns = code.match(/prototype\.showConsumeDialog\s*=/g) ?? [];
  const libWraps = code.match(/libWrapper\.register\(\s*"edha-content",\s*"CONFIG\.Item\.documentClass\.prototype\.showConsumeDialog"/g) ?? [];
  const installers = code.match(/function\s+edhaInstallConsumeDialogWrapper\s*\(/g) ?? [];
  assert.strictEqual(assigns.length, 1, "one prototype-patch assignment (the fallback path)");
  assert.strictEqual(libWraps.length, 1, "one libWrapper registration (the preferred path)");
  assert.strictEqual(installers.length, 1, "one installer function");
  // Every code mention of the system method lives inside that one installer.
  const start = code.indexOf("function edhaInstallConsumeDialogWrapper(");
  const end = code.indexOf("\n}\n", start) + 3;
  const inside = (code.slice(start, end).match(/showConsumeDialog/g) ?? []).length;
  const total = (code.match(/showConsumeDialog/g) ?? []).length;
  assert.strictEqual(total, inside, `showConsumeDialog is mentioned ${total - inside} time(s) outside the installer`);
  assert.ok(/THE ONE SANCTIONED SYSTEM-DIALOG WRAPPER/.test(readEngineSource()),
    "the file header must declare the iron-rule-2a exception (R-70 (b))");
});
