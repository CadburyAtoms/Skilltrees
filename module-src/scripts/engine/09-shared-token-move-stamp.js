/* ============================================================================================
 * SHARED TOKEN-MOVE STAMP (2026-09-05, fix pass 3 — hoisted here from inside the trample
 * announcer, where it read as that feature's private stash and a second author duly rolled their
 * own). ONE `preUpdateToken` position stamp; three consumers read it through the helpers below:
 * Walking Ruin's trail (`edha-place-hazard` mode "trail"), the H8 `token-move` announcer
 * (Unstoppable's trample), and Order's "moved from its space" violation watch.
 *
 * ⚠️ THE RULE THIS BLOCK EXISTS TO STATE — verified in Foundry v13 source, not inferred
 * (`resources/app/client/data/client-backend.mjs`):
 *   • `Hooks.call("preUpdate<Type>", doc, changes, options, userId)` is fired ONLY from
 *     `#preUpdateDocumentArray`, which runs inside `_updateDocuments` — i.e. on the client that
 *     CALLED `doc.update()`. Every other client reaches the update through the socket response
 *     (`#onModifyDocument` → `#handleUpdateDocuments`), which fires `Hooks.callAll("update<Type>")`
 *     and no `pre*` hook at all. **A `pre*` hook is INITIATOR-ONLY.**
 *   • `options` IS broadcast: the pre-hook pass ends with `Object.assign(operation, options); //
 *     Hooks may have changed options`, `#buildRequest` puts that whole operation on the socket, and
 *     every receiving client destructures `options` back out of the response before calling the
 *     `update<Type>` hooks. Values must therefore be JSON-serialisable — they cross a socket.
 *
 * So: **stash on `options`, never on the document.** A `tokenDoc._edhaSomething = …` stash lives in
 * the initiator's memory alone, and the moment its reader is gated to the single activeGM applier
 * the two halves land on DIFFERENT clients for every player-driven move — the applier reads null
 * and returns in silence, with no error anywhere. Walking Ruin's trail did exactly that from the
 * day it was written until bench run 30 caught it with a matched player-vs-GM control.
 * ============================================================================================ */
Hooks.on("preUpdateToken", (doc, changed, options) => {
  try {
    if (changed?.x === undefined && changed?.y === undefined) return;
    options.edhaPrevPos = { x: doc.x, y: doc.y };                     // TOP-LEFT, the document's own frame
  } catch (e) {}
});
// The prior TOP-LEFT corner of a moving token, or null when this update was not a move. Reading the
// stamp through a helper is what makes "was this a move?" one question with one answer — the trail
// used to ask it twice (its own doc stash AND an `"x" in changes` guard) and got two.
function edhaPrevTokenPos(options) {
  const p = options?.edhaPrevPos;
  return (p && Number.isFinite(p.x) && Number.isFinite(p.y)) ? { x: p.x, y: p.y } : null;
}
// The prior CENTRE of a moving token — the frame hazard Regions and Drawings are placed in. Same
// top-left → centre conversion edhaAnnounceTokenMove and edhaRecenterTerrain already do, off the
// token's OWN scene rather than `canvas` (a move on a scene nobody is looking at still counts; the
// old `tokenDoc.object?.center` read was null there too, a second client-locality bug in one line).
function edhaPrevTokenCenter(tokenDoc, options) {
  const p = edhaPrevTokenPos(options); if (!p) return null;
  const gs = (tokenDoc?.parent ?? canvas?.scene)?.grid?.size || 100;
  return { x: p.x + ((tokenDoc?.width ?? 1) * gs) / 2, y: p.y + ((tokenDoc?.height ?? 1) * gs) / 2 };
}

