/* ============================================================================================
 * COST REFUND ON CANCEL (the refund race) — a burst charges its cost at `preUseItem` and must
 * give it back if the player cancels the placement. That refund is a CREDIT against a resource
 * the cosmere system also writes ABSOLUTELY, and the two writes were racing: the refund landed
 * first and the system's absolute write then overwrote it, so a cancelled burst silently kept
 * the cost. Found by bench run 13 (2bAA-8), fixed 07-27q. The note below re-derives the ordering
 * from system 2.1.0's `Item#use()` rather than from the report — keep it that way.
 * The fix is to WAIT for the system's charge to land (edhaAwaitCostCharged polls the resource
 * against a pre-use snapshot) and only then credit. EDHA_PRE_COST_RES is that snapshot.
 * Owns: EDHA_PRE_COST_RES · edhaAwaitCostCharged · edhaRefundCost + the preUseItem snapshot.
 * ============================================================================================ */

/* --- The refund race (bench run 13 / 2bAA-8, fixed 07-27q) ---------------------------------------
 * A refund is a CREDIT against a resource the cosmere system also writes ABSOLUTELY, and the two
 * writes were racing. Re-derived from system 2.1.0's `Item#use()`, not from the report:
 *
 *   • `use()` collects the cost deduction into its `postRoll` list as `void options.actor.update({
 *     system: { resources: { <r>: { value: currentAmount - actual } } } })` — an ABSOLUTE value,
 *     computed up front and issued UN-AWAITED;
 *   • the LAST postRoll entry is `Hooks.callAll(HOOKS.USE_ITEM, …)`, and `postRoll.forEach(a => a())`
 *     runs the whole list in ONE synchronous tick. The `use` item-event's execution host defaults to
 *     `"source"`, so our executor runs on that same client, a few microtasks later — long before the
 *     charge's socket round-trip returns.
 *
 * So a refund that read `system.resources.<r>.value` right away read the PRE-consume number and
 * wrote `cur + amount` — a second ABSOLUTE write, racing the first. Whichever landed second won,
 * which is exactly why bench run 13 measured the SAME talent failing in both directions (max inv 4,
 * cost 2: from 4 it ended at 2 — the charge landed last and ate the refund; from 3 it ended at 4 —
 * the refund landed last and wrote the pre-consume 3 + 2, clamped to the max).
 *
 * There is no atomic delta to reach for: the system exposes no resource API at all (every write in
 * index.js is a raw absolute `actor.update`, and `modifyTokenAttribute`'s `isDelta` resolves to an
 * absolute from a client-side read — the same shape). So the fix is ORDERING: never compute a refund
 * from a same-tick read. `preUseItem` runs before ANY consumption, so the snapshot below is the one
 * reliable "what did they hold before they paid" reading; the refund waits for the charge to LAND
 * against it, then re-reads and credits. 29 call sites share this helper; ~8 of them refuse in the
 * same tick as the use (this one, the no-scene/no-token guards, the ledger-cap refusals) and were
 * all racing. The rest sit behind a canvas click or a template create and were correct only by the
 * accident of that round-trip.
 *
 * Also covers the TAKEOVER paths, where `edhaConsumeCost` is the charger rather than the system:
 * that write is un-awaited too, and the snapshot is taken before it either way. */
const EDHA_PRE_COST_RES = new Map();   // item.uuid -> { t, res: { <resource>: value-before-paying } }
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    const list = edhaConsumeList(item); if (!list.length) return;
    const res = {};
    for (const c of list) res[c.resource] = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
    EDHA_PRE_COST_RES.set(item.uuid, { t: Date.now(), res });
    if (EDHA_PRE_COST_RES.size > 64) for (const [k, v] of EDHA_PRE_COST_RES) if (Date.now() - v.t > 300000) EDHA_PRE_COST_RES.delete(k);
  } catch (e) { /* bookkeeping only — never block a use, and never return false from here */ }
});
/* Resolve once every charged resource has moved off its pre-cost reading (i.e. the charge landed),
 * false on timeout. A timeout means nothing was actually charged — `use({shouldConsume: true})`
 * skips consumption entirely in system 2.1.0 — and refunding then would MINT resource. */
async function edhaAwaitCostCharged(actor, list, base, ms = 1500, step = 20) {
  const landed = () => list.every(c => (Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0) !== base[c.resource]);
  if (landed()) return true;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await new Promise(r => setTimeout(r, step));
    if (landed()) return true;
  }
  return false;
}
async function edhaRefundCost(item) {
  try {
    const actor = item?.actor; if (!actor) return;
    const list = edhaConsumeList(item); if (!list.length) return;
    /* Only WAIT while the charge could still be in flight. A refund minutes later (a chat-card
     * cancel) must not stall on a value that has legitimately drifted back to its pre-cost reading. */
    const snap = EDHA_PRE_COST_RES.get(item?.uuid);
    if (snap && (Date.now() - snap.t) < 5000 && !(await edhaAwaitCostCharged(actor, list, snap.res))) return;
    const updates = {};
    for (const c of list) {
      const res = foundry.utils.getProperty(actor, `system.resources.${c.resource}`);
      const cur = Number(res?.value) || 0, max = Number(res?.max?.value ?? res?.max);
      updates[`system.resources.${c.resource}.value`] = Number.isFinite(max) ? Math.min(max, cur + c.amount) : cur + c.amount;
    }
    if (Object.keys(updates).length) await actor.update(updates);
  } catch (e) { /* non-fatal */ }
}

