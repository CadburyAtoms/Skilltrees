/* edhaDialogPick — the `??` that ate every Cancel (bench run 24, 2026-09-05).
 *
 * `DialogV2#_onSubmit` is, verbatim from foundry.mjs (v13, line ~57254):
 *
 *     const result = (await button?.callback?.(event, target, this)) ?? button?.action;
 *
 * so a button callback that resolves `null` or `undefined` is REPLACED by the button's own
 * `action` string, which is always truthy. `edhaDialogPick`'s documented contract is the exact
 * opposite ("a button with no `parse` resolves to `null`"), and every caller guards with a bare
 * `if (!picked)` / `if (!proh)`. Measured live: Final Decree → prohibition picker → Cancel spent 3
 * Investiture, refunded nothing, and armed the Decree with `proh === "cancel"` ("…must not
 * **undefined**").
 *
 * THE STUB BELOW IS THE POINT. It reproduces `_onSubmit`'s `??` line and `wait`'s
 * `rejectClose:false` close path verbatim, so these cases FAIL against the pre-fix engine and pass
 * only because the callback result is boxed in `{edhaPick: …}` — an object is never nullish, so
 * the `??` can never fire. A stub that just returned the callback's value would pass either way
 * and pin nothing.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor } = require("./harness.js");

/* A form/root stand-in: `parse(root)` only ever calls `.querySelector`. */
function formStub(values = {}) {
  return { querySelector: (sel) => (sel in values ? values[sel] : null) };
}

/* Faithful DialogV2 stand-in. `press` is the action of the button clicked, or the sentinel
 * "__dismiss__" for closing the window. Both paths mirror foundry.mjs exactly:
 *   _onSubmit: const result = (await button?.callback?.(event, target, this)) ?? button?.action;
 *   wait:      dialog.addEventListener("close", … resolve(result ?? null)) when rejectClose is false
 */
function fakeDialogV2(press, form = formStub()) {
  return class DialogV2Stub {
    static async wait({ buttons = [], rejectClose = false, close } = {}) {
      if (press === "__dismiss__") {
        const result = close instanceof Function ? close({}, null) : undefined;
        if (rejectClose) throw new Error("Dialog was dismissed without pressing a button.");
        return result ?? null;
      }
      const button = buttons.find((b) => b.action === press);
      return (await button?.callback?.({}, { form }, null)) ?? button?.action;   // ← the verbatim `??`
    }
  };
}

function withDV2(env, press, form) {
  env.foundry.applications.api.DialogV2 = fakeDialogV2(press, form);
  return env;
}

test("edhaUnboxDialogPick: a box's payload survives verbatim, including null and undefined", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaUnboxDialogPick({ edhaPick: null }), null, "a parse-less Cancel must stay null");
  assert.strictEqual(env.edhaUnboxDialogPick({ edhaPick: undefined }), undefined, "'No DC — judge it' must stay undefined");
  assert.strictEqual(env.edhaUnboxDialogPick({ edhaPick: 0 }), 0, "DC 0 is a real answer, not a falsy no-op");
  assert.deepStrictEqual(env.edhaUnboxDialogPick({ edhaPick: ["a", "b"] }), ["a", "b"]);
});

test("edhaUnboxDialogPick: anything that is NOT a box means 'no choice was made' → undefined", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaUnboxDialogPick(null), undefined, "DialogV2.wait resolves null on a dismissal (rejectClose:false)");
  assert.strictEqual(env.edhaUnboxDialogPick(undefined), undefined);
  assert.strictEqual(env.edhaUnboxDialogPick("cancel"), undefined, "a raw action string is never a valid answer");
  assert.strictEqual(env.edhaUnboxDialogPick({}), undefined, "an object without the key is not a box");
});

test("edhaDialogPick: a parse-less Cancel resolves null, NOT its action string (run 24's defect)", async () => {
  const env = withDV2(loadEngine(), "cancel");
  const picked = await env.edhaDialogPick({
    title: "t", content: "c",
    buttons: [{ action: "ok", label: "Declare", default: true, parse: () => ({ kind: "move" }) },
              { action: "cancel", label: "Cancel" }],
  });
  assert.strictEqual(picked, null, "Cancel must be null — 'cancel' is what armed the Decree and printed 'must not undefined'");
  assert.ok(!picked, "every caller's guard is a bare if (!picked)");
});

test("edhaDialogPick: a parse returning undefined stays undefined (edhaPromptDC's 'No DC — judge it')", async () => {
  const env = withDV2(loadEngine(), "judge");
  const dc = await env.edhaPromptDC("t", "hint");
  assert.strictEqual(dc, undefined, "'judge' the action string must never reach the caller");
  assert.strictEqual(typeof dc === "number", false);
});

test("edhaDialogPick: a parse returning null stays null (edhaPromptDC's blank-DC Resolve)", async () => {
  const env = withDV2(loadEngine(), "ok", formStub({ "[name=edhaDC]": { value: "" } }));
  const dc = await env.edhaPromptDC("t", "hint");
  assert.strictEqual(dc, null, "a blank DC is null — 'ok' is a truthy string that is not a DC");
});

test("edhaDialogPick: a real parsed value is returned untouched (the ok path is unaffected)", async () => {
  const env = withDV2(loadEngine(), "ok", formStub({ "[name=edhaDC]": { value: "14" } }));
  assert.strictEqual(await env.edhaPromptDC("t", "hint"), 14);
});

test("edhaDialogPick: dismissing the window resolves undefined (wait's rejectClose:false → null)", async () => {
  const env = withDV2(loadEngine(), "__dismiss__");
  const picked = await env.edhaDialogPick({ title: "t", content: "c", buttons: [{ action: "cancel", label: "Cancel" }] });
  assert.strictEqual(picked, undefined, "a dismissal is undefined, matching the AppV1 path's close handler");
});

test("edhaPickProhibition: Cancel returns falsy, so edhaDecreeUse's `if (!proh)` refund fires", async () => {
  const env = withDV2(loadEngine(), "cancel");
  const owner = mockActor({ name: "Bench — Blue" });
  const proh = await env.edhaPickProhibition(owner, "Final Decree — name ONE prohibited action");
  assert.ok(!proh, "a truthy 'cancel' here is exactly what spent 3 Investiture with no refund");
  assert.strictEqual(proh, null);
});

test("the Weave link picker's Cancel: 'cancel'[0]/[1] are two DIFFERENT truthy strings", async () => {
  /* The Weave guard is `!picked || !picked[0] || !picked[1] || picked[0] === picked[1]`. With the
   * pre-fix action string, picked = "cancel" → "c" and "a" — both truthy, and different — so the
   * cancel sailed THROUGH the guard, linked nothing, kept the cost, and posted a success card.
   * This case pins the guard's input, which is the half edhaDialogPick owns. */
  const env = withDV2(loadEngine(), "cancel");
  const picked = await env.edhaDialogPick({
    title: "link", content: "c",
    buttons: [{ action: "ok", label: "Link", default: true, parse: () => ["a", "b"] },
              { action: "cancel", label: "Cancel" }],
  });
  assert.strictEqual(picked, null);
  assert.ok(!picked || !picked[0] || !picked[1] || picked[0] === picked[1], "the Weave cancel branch must be reachable");
});

test("edhaDialogPick: the AppV1 fallback path still resolves null for a parse-less button", async () => {
  const env = loadEngine();
  env.foundry.applications.api.DialogV2 = undefined;
  env.Dialog = class DialogStub {
    constructor(cfg) { this.cfg = cfg; }
    render() { this.cfg.buttons.cancel.callback([formStub()]); return this; }
  };
  const picked = await env.edhaDialogPick({
    title: "t", content: "c",
    buttons: [{ action: "ok", label: "OK", default: true, parse: () => 1 }, { action: "cancel", label: "Cancel" }],
  });
  assert.strictEqual(picked, null, "the legacy path was always correct — the fix must not change it");
});
