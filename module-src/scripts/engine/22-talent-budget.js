/* ============================================================================================
 * TALENT BUDGET (Edha house rules) — the level-up restriction: how many talents a character of
 * level N may own, and when a KEY talent (a path's second entry) may be picked. Enforced as a
 * VETO on `preCreateItem`, so it stops the drag at the sheet rather than reporting it after the
 * fact; the readout panel that shows the player their remaining points lives in the sheet-slots
 * section below (edhaGetBudget / edhaBudgetRow), which reads the same helpers.
 * Owns: edhaIsKeyTalent · edhaAllowedTalents · edhaKeyPickAllowed · edhaCountTalents + the
 *   preCreateItem veto.
 * ============================================================================================ */

/* --- Talent budget (level-up restriction) — Edha house rules ---------------------------------
 * The cosmere system does NOT enforce a talent limit: clicking an available tree node adds the
 * talent on prereqs alone (no level/budget check). We enforce an Edha-specific budget, derived
 * from the Stormlight starter-rules "Character Advancement" table (with the per-tier "ancestry
 * bonus talent" repurposed as a general leyline/deity/heroic talent, since Edha drops ancestry):
 *
 *   • Level 1 (character creation): 4 talents — 2 Key talents (one Heroic + one Leyline path) plus
 *     one talent per tree. KEYS COUNT toward the total, and may ONLY be taken at level 1.
 *   • Each level after 1: +1 talent, PLUS a bonus talent at every tier breakpoint (levels 6/11/16/21).
 *
 *   Closed form:  allowed(L) = L + 3 + floor((L-1)/5)
 *     L1=4  L2=5  L5=8 | L6=10  L10=14 | L11=16  L15=20 | L16=22  L20=26 | L21=28
 *
 * Tune the formula / Key rule here. (L21 RAW gives "+1 skill OR +1 talent"; we grant the talent.)
 */
function edhaIsKeyTalent(item) {
  try { if (item?.getFlag?.("edha-content", "specialty") === "Key") return true; } catch (e) { /* temp doc */ }
  return item?.flags?.["edha-content"]?.specialty === "Key";
}
function edhaAllowedTalents(actor) {
  const L = Math.max(1, Number(actor?.system?.level) || 1);
  return L + 3 + Math.floor((L - 1) / 5);
}
// Keys are level-1-only — EXCEPT while the creation wizard's per-actor window is open (a
// level-1 restart on a leveled PC re-picks its two Keys at the current level; budget still
// applies). edhaCreatorWindows is a SET of actor ids so multiple wizards can be open at once
// (07-19b — bench passes run several actors side by side); the .has is duck-typed, not
// instanceof, so the vm-realm unit tests can inject a host Set. Pure — pinned in tests.
function edhaKeyPickAllowed(level, actorId) {
  return level <= 1 || globalThis.edhaCreatorWindows?.has?.(actorId) === true;
}
function edhaCountTalents(actor) {
  // Every talent counts toward the total budget, Keys included (the 4-at-L1 figure includes 2 Keys).
  return actor.items.filter(i => i.type === "talent").length;   // type-strict: twins never count (PC budget)
}
Hooks.on("preCreateItem", (item) => {
  try {
    if (globalThis.edhaSkipBudget === true) return true; // GM bypass for bulk imports/pregens: edha.skipBudget(true) … (false)
    if (item.type !== "talent") return true;            // type-strict: only talents have a budget
    const actor = item.parent;
    if (!actor || actor.type !== "character") return true; // only on character actors
    const level = Math.max(1, Number(actor.system?.level) || 1);
    // Key talents may only be taken at level 1 (character creation) — or through the creation
    // wizard's restart window (edhaKeyPickAllowed); never otherwise.
    if (edhaIsKeyTalent(item) && !edhaKeyPickAllowed(level, actor.id)) {
      ui.notifications?.warn("Key talents can only be taken at level 1 (character creation).");
      return false;
    }
    const allowed = edhaAllowedTalents(actor);
    const current = edhaCountTalents(actor);
    if (current >= allowed) {
      ui.notifications?.warn(
        `Talent limit reached: a level ${level} character may have ${allowed} talent${allowed === 1 ? "" : "s"} (already has ${current}). Raise the character's level to take more.`
      );
      return false; // cancel creation — blocks tree-click AND drag-drop
    }
  } catch (e) {
    console.error("Edha Content | talent budget check failed", e);
  }
  return true;
});

