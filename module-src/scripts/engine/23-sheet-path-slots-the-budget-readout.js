/* ============================================================================================
 * SHEET PATH SLOTS + THE BUDGET READOUT (backlog E6 / J2) — the character sheet's Edha header:
 * the "Heroic Path" / "Leyline Path" / "Deity Path" pick slots and the "remaining points" panel
 * that makes the budget rules above legible while the player spends them.
 * ⚠️ edhaSheetRoot is the SHARED renderCharacterSheet entry point (ENGINE PASS 5.3, Job 8) —
 * five sheet decorators in this file hang off it (here, the creation-wizard launcher, culture +
 * coins, Readable-Dark, and the budget rows). Never re-derive the root element inline; a second
 * spelling is how the decorators drifted apart before Job 8 collapsed them.
 * Owns: EDHA_PATH_SLOTS · edhaSheetRoot · edhaGetBudget + this section's renderCharacterSheet
 *   decorator. (edhaBudgetRow and its own decorator sit in the sheet-QoL section below.)
 * ============================================================================================ */

/* --- E6: "Heroic Path" / "Leyline Path" pick slots on the character sheet --------------------
 * Inject two labeled empty slots into the lineage area for whichever path type the character is
 * missing. Clicking a slot opens the matching Edha compendium so the player can drag the path onto
 * the sheet. (CharacterSheet is an ApplicationV2; its render hook fires for the whole class chain,
 * so `renderCharacterSheet(app, element)` is reliable; `element` is the root HTMLElement.)
 */
const EDHA_PATH_SLOTS = [
  { type: "heroic",  pack: "edha-content.edha-heroic",  label: "Heroic Path" },
  { type: "leyline", pack: "edha-content.edha-leyline", label: "Leyline Path" },
  { type: "deity",   pack: "edha-content.edha-deity",   label: "Deity Path — Optional" },
];
/* --- edhaSheetRoot(app, element) (ENGINE PASS 5.3, Job 8) — the shared renderCharacterSheet
 * preamble: resolve the root HTMLElement (v13's element vs a stale array-like) and the actor, and
 * gate to actor.type === "character" — a character-sheet injector fired verbatim on an adversary
 * (the shared base class both render hooks share) would read the wrong document shape. Returns
 * `{root, actor}`, or `null` when the guard fails; callers needing MORE than this (an ownership
 * check, say) test the extra condition themselves right after. */
function edhaSheetRoot(app, element) {
  const root = element instanceof HTMLElement ? element : (element?.[0] || null);
  const actor = app?.actor;
  if (!root || !actor || actor.type !== "character") return null;
  return { root, actor };
}
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const rs = edhaSheetRoot(app, element); if (!rs) return;
    const { root, actor } = rs;
    const lineage = root.querySelector(".lineage");
    if (!lineage) return;
    // Idempotent: drop any slots from a previous render pass.
    lineage.querySelectorAll(".edha-path-slot").forEach(n => n.remove());
    const paths = actor.items.filter(i => i.type === "path");
    const anchor = lineage.querySelector("app-character-paths-list");
    let insertAfter = anchor;
    for (const slot of EDHA_PATH_SLOTS) {
      if (paths.some(p => p.system?.type === slot.type)) continue; // already has this path type
      const div = document.createElement("div");
      div.className = "path drop-area edha-path-slot";
      div.dataset.edhaPack = slot.pack;
      div.innerHTML = `<span>${slot.label}</span>`;
      div.addEventListener("click", () => {
        const pack = game.packs?.get(slot.pack);
        if (pack) pack.render(true);
        else ui.notifications?.warn(`Edha Content | compendium "${slot.pack}" not found.`);
      });
      if (insertAfter && insertAfter.parentNode === lineage) insertAfter.after(div);
      else lineage.appendChild(div);
      insertAfter = div; // keep heroic above leyline
    }
  } catch (e) {
    console.error("Edha Content | path-slot injection failed", e);
  }
});

/* --- J2: Budget readout ("remaining points") panel in the sheet header --------------------
 * Shows how many talent points, attribute points, and skill ranks remain for the actor's level.
 * Injected into .level-details in the sheet header — always visible regardless of active tab.
 *
 * Advancement rules (CONFIG.COSMERE.advancement.rules[]):
 *   Each entry has { level, attributePoints?, skillRanks, … }.
 *   We sum the fields for all rules whose .level <= actor's level to get cumulative grants.
 *   Attributes: initial=0, so actor.system.attributes[k].value IS the points spent.
 *   Skills:     initial=0, so actor.system.skills[k].rank IS the ranks spent.
 */
function edhaGetBudget(actor) {
  const level = Math.max(1, Number(actor.system?.level) || 1);
  const rules = CONFIG.COSMERE?.advancement?.rules ?? [];
  let attrGranted = 0;
  for (const rule of rules) {
    if ((rule.level ?? 0) <= level) attrGranted += rule.attributePoints ?? 0;
  }
  // Skill ranks: the EDHA budget (5 + (L−1)×2 — 4 free + 1 from the heroic path at L1), not the
  // system table's 4/level-1 (Ben 07-19: the bar read "-1/4" on a correctly-built PC).
  const skillGranted = edhaCwSkillBudget(level);
  const ATTR_KEYS = ["str", "spd", "int", "wil", "awa", "pre"];
  const attrSpent  = ATTR_KEYS.reduce((s, k) => s + (actor.system?.attributes?.[k]?.value ?? 0), 0);
  const skillSpent = Object.values(actor.system?.skills ?? {}).reduce((s, sk) => s + (sk.rank ?? 0), 0);
  return { attrGranted, attrSpent, skillGranted, skillSpent,
           talentGranted: edhaAllowedTalents(actor), talentSpent: edhaCountTalents(actor) };
}

