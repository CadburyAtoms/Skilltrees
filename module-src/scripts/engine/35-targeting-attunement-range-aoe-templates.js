/* ============================================================================================
 * TARGETING: ATTUNEMENT RANGE + AoE TEMPLATES — the leyline reach model and its on-canvas
 * preview. ATTUNEMENT RANGE is the Edha house rule that a caster's reach comes from their COLOUR
 * RANK, not from the talent: EDHA_ATTUNE_FT indexes feet by rank (0/15/30/60/90/120), so every
 * range check and every ring drawn anywhere in the file resolves through edhaColorRank here.
 * A talent's own colour is read from its atlas/group (edhaTalentColor) rather than stored twice.
 * The rendering is Foundry core MeasuredTemplates plus a transient circle; nothing here is
 * bespoke geometry.
 * Owns — the model: EDHA_ATTUNE_FT · EDHA_LEY_COLORS · EDHA_COLOR_HEX · EDHA_RANGE_RING_HEX ·
 *   edhaTalentColor · edhaColorRank · edhaCasterToken.
 * Owns — the canvas: edhaDrawCircle · edhaTokensInCircle · edhaShowRange (edhaPlaceAoe retired, R-78), the
 *   sheet's range-preview control, and edhaNextTokenName + its preCreateToken de-duplicator.
 * ============================================================================================ */

/* --- Targeting: Attunement Range preview + AoE templates (Foundry core MeasuredTemplates) ----
 * The cosmere system has NO range/area support, so this is built on Foundry core. Range scales off
 * the talent's leyline COLOR rank (derived at runtime from the talent's damage formula / activation
 * skill / path — no per-talent data needed). [Size] AoE talents are listed in data/talent-targeting.json.
 *   • Attunement Range PREVIEW: a per-talent ⊙ button (injected into Actions-tab rows) draws a range
 *     ring centered on your token and reports how many tokens are in range. Manual: preview, then target.
 *   • AoE: using a listed area talent drops a [Size] circle on your target and AUTO-TARGETS the captured
 *     tokens, so the talent's own damage/heal card applies to all of them with one Apply click.
 */
const EDHA_ATTUNE_FT = [0, 15, 30, 60, 90, 120];     // Attunement Range by color rank (index = rank)
const EDHA_SIZE_FT   = [0, 2.5, 5, 10, 15, 20];      // [Size] by color rank
const EDHA_LEY_COLORS = ["white", "blue", "black", "red", "green"];
const EDHA_COLOR_HEX = { white: "#cfd8dc", blue: "#3a7bd5", black: "#7b2fb5", red: "#d23b2e", green: "#3a9d4a" };
const EDHA_RANGE_RING_HEX = "#bfe3ff";   // Attunement Range boundary — distinct from any leyline color

// Resolve the leyline color that scales a talent's range/size.
function edhaTalentColor(item) {
  const f = item?.system?.damage?.formula || "";
  for (const c of EDHA_LEY_COLORS) if (f.includes(`@skills.${c}.`)) return c;
  const sk = item?.system?.activation?.skill;
  if (EDHA_LEY_COLORS.includes(sk)) return sk;
  for (const r of edhaEventRules(item)) { const c = r?.handler?.color; if (EDHA_LEY_COLORS.includes(c)) return c; }   // color set on the talent's own rule
  const p = item?.system?.path;
  if (EDHA_LEY_COLORS.includes(p)) return p;
  return null;
}
function edhaColorRank(actor, color) {
  const r = Math.max(0, Math.min(5, Number(actor?.system?.skills?.[color]?.rank) || 0));
  if (r > 0) return r;
  // Ruling 122 fallback (2026-07-20, supersedes ruling 107's tier read): an ADVERSARY with no rank
  // in the color reads its ROLE rank — minion 1 / rival 2 / boss 3, the same ruling-40 map the
  // build writes for attuned colors — so off-leyline embedded talents roll the same dice as the
  // block's own colors. (Attuned colors carry build-written ranks and never reach this.)
  if (actor?.type === "adversary") {
    const ROLE_RANK = { minion: 1, rival: 2, boss: 3 };
    return ROLE_RANK[actor?.system?.role] || 1;
  }
  return 0;
}
function edhaCasterToken(actor) { return actor?.getActiveTokens?.()[0] ?? (canvas?.tokens?.controlled ?? []).find(t => t.actor === actor) ?? null; }

// Token renumbering: core appendNumber counts scene tokens BY WORLD actorId — and every
// compendium→canvas drop creates a fresh world actor (client tokens.mjs _onDropActorData), so
// repeated drops all land as "(1)". When a numbered name collides with an existing scene token,
// re-number by NAME pattern instead. Pure resolver — pinned in tests/.
function edhaNextTokenName(proposed, existingNames) {
  const m = /^(.*) \((\d+)\)$/.exec(proposed); if (!m) return null;     // only names core already numbered
  const esc = m[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pat = new RegExp(`^${esc} \\((\\d+)\\)$`);
  const used = new Set();
  for (const n of existingNames) { const mm = pat.exec(n); if (mm) used.add(Number(mm[1])); }
  if (!used.has(Number(m[2]))) return null;                            // no collision — core numbered it fine
  let i = 1; while (used.has(i)) i++;
  return `${m[1]} (${i})`;
}
Hooks.on("preCreateToken", (doc, data) => {
  try {
    const scene = doc.parent; if (!scene || !data?.name) return;
    const fixed = edhaNextTokenName(data.name, scene.tokens.map(t => t.name));
    if (fixed) doc.updateSource({ name: fixed });
  } catch (e) { console.error("Edha Content | token renumber failed", e); }
});

async function edhaDrawCircle(cx, cy, ft, hex, ttlMs = 12000) {
  const scene = canvas?.scene; if (!scene) return null;
  try {
    const [doc] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: cx, y: cy, distance: ft, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, flags: { "edha-content": { ephemeral: ttlMs > 0 } },
    }]);
    if (doc && ttlMs > 0) setTimeout(() => { try { if (doc.parent?.templates?.get(doc.id)) doc.delete()?.catch(() => {}); } catch (e) {} }, ttlMs);  // only delete if it still exists (no "does not exist" toast)
    return doc;
  } catch (e) { console.error("Edha Content | template draw failed (player template perms?)", e); return null; }
}
function edhaTokensInCircle(cx, cy, ft, excludeId) {
  const scene = canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (!t.actor || t.id === excludeId) return false;
    return edhaMeasureFt(t.center?.x ?? 0, t.center?.y ?? 0, cx, cy) <= ft;   // ruler, not hypot (2026-09-09)
  });
}

// Manual range preview: draw the Attunement Range ring + report in-range token count.
async function edhaShowRange(item) {
  try {
    if (typeof item === "string") {
      const a = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
      item = a?.items?.find(i => edhaIsTalent(i) && i.name === item);
    }
    const actor = item?.actor; if (!actor) { ui.notifications?.warn("Edha: no talent/actor for range preview."); return; }
    const color = edhaTalentColor(item);
    if (!color) { ui.notifications?.warn(`Edha: ${item.name} has no leyline color to scale range from.`); return; }
    const rank = edhaColorRank(actor, color);
    const ft = EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1];
    const tok = edhaCasterToken(actor);
    if (!tok) { ui.notifications?.warn("Edha: select/drop your token to preview range."); return; }
    await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_COLOR_HEX[color]);
    const n = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id).length;
    ui.notifications?.info(`${item.name}: Attunement Range ${ft} ft (${color} rank ${rank}) — ${n} token(s) in range. Ring clears in 12s.`);
  } catch (e) { console.error("Edha Content | showRange failed", e); }
}

/* `edhaPlaceAoe` + the `edha-aoe-template` handler RETIRED 2026-09-06 (R-78, Ben (a); item 48).
 * It was a SECOND, parallel AoE model — drop a circle on your current target, auto-target what it
 * caught, and leave the GM to press Apply — that the click-to-place / Detonate pipeline
 * (`edha-burst` → edhaCastBurst → edhaBurstDetonate, which resolves damage itself) replaced. A
 * sweep of `data/` at bench run 38 found ZERO `edha-aoe-template` rules against 12 `edha-burst`
 * ones, so the only thing the registration still did was offer a dead choice in Ben's Events-tab
 * dropdown next to the live one. The branch WORKED (the bench staged a rule by hand and proved
 * it); it simply had no consumer, which is the R-74 / R-76 shape.
 * Nothing else moved: `edhaSetUserTargets` keeps its other caller (edhaPickTargetClick),
 * `edhaCheckMultiHit` keeps edhaBurstDetonate's, and `edhaDrawCircle` / `edhaTokensInCircle` /
 * EDHA_SIZE_FT are shared with the burst path. `data/native-vocabulary.json` and lint-refs'
 * vocabulary are untouched by design — `edha-aoe-template` was an edha-* type, so the engine's own
 * registrations (which lint pass 9 parses) are the whole record of it. */
// Inject a ⊙ range-preview button into each color-scaled talent row in the Actions tab.
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const rs = edhaSheetRoot(app, element); if (!rs) return;
    const { root, actor } = rs;
    root.querySelectorAll(".item[data-item-id]").forEach(row => {
      if (row.querySelector(".edha-range-btn")) return;
      const item = actor.items.get(row.dataset.itemId);
      if (!item || item.type !== "talent" || !edhaTalentColor(item)) return;   // type-strict: character-sheet injector (adversary sheet ≠ this app)
      const btn = document.createElement("a");
      btn.className = "edha-range-btn";
      btn.title = `Preview Attunement Range for ${item.name}`;
      btn.style.cssText = "margin-right:4px;cursor:pointer;opacity:.85;";
      btn.innerHTML = '<i class="fa-regular fa-circle-dot"></i>';
      btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); void edhaShowRange(item); });
      (row.querySelector(".controls, .item-controls, .action-controls") || row).prepend(btn);
    });
  } catch (e) { console.error("Edha Content | range-button injection failed", e); }
});

