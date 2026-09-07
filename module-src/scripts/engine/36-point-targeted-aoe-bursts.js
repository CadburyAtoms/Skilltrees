/* ============================================================================================
 * POINT-TARGETED AoE BURSTS — placement. The last four banners in this cross-tree run are all
 * one feature, split by concern: this (pick a point), the synchronous formula evaluator below
 * it, the refund race, and burst execution + the GM socket relay.
 * The note that follows is the design rationale — why a burst is intercepted at `preUseItem`
 * instead of riding the system's own single-target flow. Read it before changing the interception
 * point; the "you had to target an actor and only that actor took damage" complaint traces
 * directly to the model it replaced.
 * Owns: EDHA_BURST_PENDING (the in-flight burst ledger, keyed by pending id) · edhaPickPoint
 *   (drag-free click-to-place on the #board canvas, capture phase, so it fires over tokens
 *   without the Templates layer being active).
 * ============================================================================================ */

/* --- Point-targeted AoE bursts ----------------------------------------------------------------
 * The old AoE centred the circle on a TARGETED TOKEN (game.user.targets[0]) and fired on the `use`
 * event, which the system queues in postRoll — i.e. AFTER the single-target card was already posted.
 * Net result: you had to target an actor (couldn't pick a square) and only that one actor took damage
 * unless you then clicked Apply with "Prioritise Targeted" on. Both complaints traced to that design.
 *
 * New model: talents flagged with a `burst` spec in talent-targeting.json are intercepted at
 * `preUseItem` (returning false cancels the default single-target flow entirely — no card, no auto
 * damage). We consume the cost, drop a [Size] circle template at the caster, and the player DRAGS it to
 * any point in Attunement Range (true point targeting), then clicks Detonate: every creature under it is
 * captured and takes the talent's [Tier][Die] — enemies for damage, allies for heals — with an auto
 * Athletics-vs-colour save for half where the talent calls for one. Terrain talents also drop a
 * scene-long dangerous-terrain Region at the point. Runtime-only; no pack rebuild.
 */
const EDHA_BURST_PENDING = {};

// Click-to-place a point on the canvas (drag-free): resolves a grid-snapped world {x,y}, or null on
// cancel. Reads canvas.mousePosition (continuously updated to world coords) on a capture-phase pointer
// down on the #board canvas, so it fires even over tokens without needing the Templates layer active.
function edhaPickPoint(promptText) {
  return new Promise((resolve) => {
    const view = document.getElementById("board");
    if (!view || !canvas?.ready) { resolve(null); return; }
    ui.notifications?.info(promptText || "Click a point on the map (right-click to cancel).");
    let done = false;
    const finish = (pt) => {
      if (done) return; done = true;
      try { view.removeEventListener("pointerdown", onDown, true); } catch (e) {}
      try { view.removeEventListener("contextmenu", onCtx, true); } catch (e) {}
      try { window.removeEventListener("keydown", onKey, true); } catch (e) {}
      resolve(pt);
    };
    const snap = (p) => {
      try { const s = canvas.grid.getSnappedPoint({ x: p.x, y: p.y }, { mode: CONST.GRID_SNAPPING_MODES?.CENTER ?? 1, resolution: 1 }); return Number.isFinite(s?.x) ? s : p; }
      catch (e) { return p; }
    };
    const onDown = (ev) => {
      if (ev.button === 2) return;                 // right-click handled by contextmenu (cancel)
      if (ev.button !== 0) return;                 // left-click only
      const mp = canvas.mousePosition;             // PIXI.Point in world coords, kept current by the canvas
      if (!mp || !Number.isFinite(mp.x)) { finish(null); return; }
      finish(snap({ x: mp.x, y: mp.y }));
    };
    const onCtx = (ev) => { try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {} finish(null); };
    const onKey = (ev) => { if (ev.key === "Escape") finish(null); };
    view.addEventListener("pointerdown", onDown, true);
    view.addEventListener("contextmenu", onCtx, true);
    window.addEventListener("keydown", onKey, true);
  });
}

