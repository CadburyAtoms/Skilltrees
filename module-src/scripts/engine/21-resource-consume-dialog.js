/* ============================================================================================
 * RESOURCE-CONSUME DIALOG (backlog J + items 50, 119) — three things, all about the system's own
 * consume path.
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
 * (3) SAY SO WHEN THE COST CANNOT BE PAID — item 119, bench run 45. An underfunded use is a
 *     no-op the GM cannot tell from a dead button. The system DOES refuse it
 *     (`use()` → "Cannot consume, not enough of resource", 2.1.0 index.js ~L7120) but that toast
 *     names neither the item, the actor, the resource nor the amount, leaves no console line and
 *     no chat record, and is gone in seconds — which is why bench run 45 read The Reckoning's
 *     Unbreakable Line (3 Focus against a pool that maxes at 2) as a dead ability. So the engine
 *     announces the shortfall in its own words, on `preUseItem`, BEFORE the system's generic
 *     refusal, and writes the same sentence to the console. It **never vetoes** — the system
 *     stays the thing that decides; this only makes its decision legible.
 * Owns: edhaSetConsumeTitle + the renderItemConsumeDialog / renderDialogV2 registrations;
 *       edhaPreTickConsumeOptions (PURE — pinned) · edhaInstallConsumeDialogWrapper + its ready hook;
 *       edhaCostShortfalls + edhaShortfallText (PURE — pinned) + the preUseItem announcer.
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

/* --- item 119: the refusal, in words -----------------------------------------------------------
 * PURE (pinned in tests/consume-shortfall.test.js): which rows of an `edhaConsumeList` the
 * balances cannot cover. `balances` is a plain { resource: currentValue } map so the decision is
 * testable without a document — the caller reads the actor once and hands the numbers over.
 * A row that IS affordable never appears; `short` is always > 0 in the result. */
function edhaCostShortfalls(list, balances) {
  return (Array.isArray(list) ? list : []).map((c) => {
    const need = Math.max(0, Math.floor(Number(c?.amount) || 0));
    const have = Math.max(0, Math.floor(Number(balances?.[c?.resource]) || 0));
    return { resource: c?.resource, need, have, short: need - have };
  }).filter((s) => s.resource && s.short > 0);
}
/* PURE (pinned): the ONE sentence both refusal points speak — this announcer and `edhaConsumeCost`
 * (the burst/takeover charger, which refuses for real rather than predicting the system's refusal).
 * It names the actor, the item, the resource, what is needed, what is there and the gap, because
 * every one of those was missing from the toast that let a dead ability read as dead. Returns ""
 * when nothing is short, so a caller can use it as its own gate. Callers add their own tail. */
function edhaShortfallText(actorName, itemName, shortfalls) {
  const parts = (Array.isArray(shortfalls) ? shortfalls : []).filter((s) => s && s.short > 0)
    .map((s) => `${s.short} ${EDHA_RES_LABEL[s.resource] || s.resource} short (needs ${s.need}, has ${s.have})`);
  if (!parts.length) return "";
  return `Edha: ${actorName || "this creature"} cannot pay for ${itemName || "this"} — ${parts.join("; ")}.`;
}
/* Registered here rather than beside the cost-ledger hook in the prompt/pick section: this one
 * announces, it does not record, and it must never influence the vote. It returns undefined on
 * every path — Foundry stops a hook chain on `false`, and a use refused HERE would be one more
 * silent no-op, which is the bug. Fires before the consume dialog, so on a multi-cost item whose
 * short row the GM then unticks the sentence is a prediction that did not come true; the tail says
 * so rather than claiming the use failed. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    const list = edhaConsumeList(item); if (!list.length) return;
    const balances = {};
    for (const c of list) balances[c.resource] = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
    const text = edhaShortfallText(actor.name, item.name, edhaCostShortfalls(list, balances));
    if (!text) return;
    console.warn(`Edha Content | ${text} (the system will refuse the use unless that cost is unticked)`);
    ui.notifications?.warn(`${text} The use is refused unless you untick that cost.`);
  } catch (e) { /* never block a use */ }
});

