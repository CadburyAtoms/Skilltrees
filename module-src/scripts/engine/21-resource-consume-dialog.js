/* ============================================================================================
 * RESOURCE-CONSUME DIALOG (backlog J + item 50) — two things, both about the system's own
 * consume prompt.
 * (1) TITLE — cosmetic. The prompt opens titled "Consume Resource" with no clue WHICH item asked,
 *     which on a talent-dense sheet is a coin flip. One helper rewrites the header from the item
 *     on the app; two hooks reach it, because the dialog renders under `renderItemConsumeDialog`
 *     on some paths and as a bare `renderDialogV2` (carrying an `item` key) on others.
 * (2) PRE-TICK EVERY COST ROW — R-70 (b), the ONE sanctioned system-dialog wrapper (see the file
 *     header). `CosmereItem#use()` calls `this.showConsumeDialog()` with NO options, and the
 *     system maps each `activation.consume` entry to `shouldConsume: options.shouldConsume ?? i === 0`
 *     (2.1.0 `index.js`, comment: "Only automatically check first option"), so a second cost row
 *     opens unticked and a default click under-charges. Wrapping `showConsumeDialog` itself is the
 *     narrowest seam that exists: the option mapping happens INSIDE it, `preUseItem` fires before
 *     `use()` and cannot reach those options, and a DOM tick at `renderItemConsumeDialog` would
 *     bind to the template's checkbox ids instead of the option shape. `??` is kept, so an
 *     explicit caller (`showConsumeDialog({shouldConsume: false})`) still gets what it asked for.
 * Owns: edhaSetConsumeTitle + the renderItemConsumeDialog / renderDialogV2 registrations;
 *       edhaPreTickConsumeOptions (PURE — pinned) · edhaInstallConsumeDialogWrapper + its ready hook.
 * ============================================================================================ */

/* --- J: name the resource-consume popup --------------------------------------------------------
 * When you use a talent that has a cost (e.g. Searing Bolt → "Spend 1 Investiture"), the system
 * shows ItemConsumeDialog. The cost lives on the talent ITSELF (system.activation.consume), so the
 * popup is that talent's own cost — NOT a rider or another talent. But the system never passes a
 * title to the dialog, so it reads the generic "Consume Resource" with no clue which talent it is
 * for. When two talents both cost 1 Investiture (e.g. Searing Bolt and Arc Flash) that's ambiguous.
 * We patch the dialog's window title to the talent name. (ItemConsumeDialog stores `this.item`;
 * ApplicationV2 fires `render<ClassName>`, so `renderItemConsumeDialog` is reliable.)
 */
function edhaSetConsumeTitle(app, element) {
  try {
    const item = app?.item;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    if (!item || !root) return;
    const titleEl = root.querySelector(".window-title")
      || root.closest?.(".application, .window-app")?.querySelector(".window-title");
    if (titleEl) titleEl.textContent = `${item.name} — Consume Resource`;
  } catch (e) {
    console.error("Edha Content | consume-dialog title patch failed", e);
  }
}
// Primary (most-derived class) + a defensive fallback on the DialogV2 base, in case the bundler
// renames the subclass. Both are idempotent (they just set text).
Hooks.on("renderItemConsumeDialog", edhaSetConsumeTitle);
Hooks.on("renderDialogV2", (app, element) => { if ("item" in (app ?? {})) edhaSetConsumeTitle(app, element); });

/* --- item 50 / R-70 (b): every cost row opens ticked -------------------------------------------
 * PURE: the options object the wrapper hands the system's showConsumeDialog. Every other field
 * passes through untouched; only an ABSENT `shouldConsume` becomes `true` (the system's `??`
 * then ticks every row instead of row 0 only). A single-cost item is unchanged in effect — its
 * only row was already row 0. */
function edhaPreTickConsumeOptions(options) {
  const o = (options && typeof options === "object") ? options : {};
  return { ...o, shouldConsume: o.shouldConsume ?? true };
}

/* Install the one wrapper. Same shape as the rollDamage wrapper: libWrapper when present
 * (update-resilient), else a prototype patch. Idempotent per class (a `ready` re-fire on a
 * hot-reloaded client must not stack two wrappers). Returns what it did, for the headless pin. */
function edhaInstallConsumeDialogWrapper() {
  const ItemCls = CONFIG.Item?.documentClass;
  if (!ItemCls?.prototype?.showConsumeDialog) {
    console.warn("Edha Content | CosmereItem#showConsumeDialog not found — consume rows keep the system default.");
    return "missing";
  }
  if (ItemCls.prototype.showConsumeDialog._edhaPreTick) return "already";
  if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
    libWrapper.register("edha-content", "CONFIG.Item.documentClass.prototype.showConsumeDialog",
      function (wrapped, options) { return wrapped(edhaPreTickConsumeOptions(options)); }, "WRAPPER");
    console.log("Edha Content | consume-dialog pre-tick wired via libWrapper (R-70).");
    return "libWrapper";
  }
  const orig = ItemCls.prototype.showConsumeDialog;
  const patched = function (options) { return orig.call(this, edhaPreTickConsumeOptions(options)); };
  patched._edhaPreTick = true;
  ItemCls.prototype.showConsumeDialog = patched;
  console.log("Edha Content | consume-dialog pre-tick wired via prototype patch (R-70).");
  return "patched";
}
Hooks.once("ready", () => { try { edhaInstallConsumeDialogWrapper(); } catch (e) { console.error("Edha Content | consume-dialog wrapper failed", e); } });

