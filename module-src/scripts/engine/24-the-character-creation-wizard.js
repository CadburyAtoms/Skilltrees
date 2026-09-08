/* ============================================================================================
 * THE CHARACTER-CREATION WIZARD (2026-07-18l, §9j #5; UI answered by Ben's 07-19 bench ruling)
 * — the biggest single subsystem between the Red and Destruction banners (~1,000 lines): a
 * step-through DialogV2 chain that builds a playable Edha character from an empty actor.
 * Steps, in order: welcome → culture (with the Thyrcross MAP PICKER) → heroic path → leyline
 * path → deity path → weapon → attributes → skills → talent budget → name.
 *
 * ENGINE-OWNED by declaration (iron rule 2b): a multi-step dialog with cross-document writes is
 * one of the rule's two named exits — it cannot be expressed as rules on a talent document.
 *
 * Two things a cold reader needs before editing:
 *   • Every pick is REVERSIBLE. Re-running a step must first undo the previous pick, or the
 *     actor silently accumulates duplicates — that is what edhaCreationWipeIds,
 *     edhaCreatorWipeOriginPicks, edhaCreatorWipePathRank and edhaCreationRestart exist for.
 *     Add a new step and you owe it a wipe.
 *   • Pack documents are COPIED, never linked — edhaCleanPackCopy strips the source ids so the
 *     owned item is a real snapshot the player can edit (and that ⟳ Sync can later refresh).
 *
 * Owns — packs/utility: EDHA_CREATOR_PACKS · escCw · edhaCwEnrich · edhaCleanPackCopy ·
 *   edhaCreatorPackDocs · edhaCreatorDialogs · edhaDialogNeedsReposition.
 * Owns — map picker: edhaCwMapData · edhaCwWireMap.
 * Owns — origin expertises: edhaPickExpertisesDialog · edhaAwaitExpertisePicks.
 * Owns — state + undo: edhaCreationState · edhaCreationWipeIds · edhaCreatorWipeOriginPicks ·
 *   edhaCreationRestart · edhaCreatorWipePathRank.
 * Owns — picks: EDHA_CREATOR_PICKS · edhaCreatorApplyPick · edhaCreatorChangeSlot ·
 *   edhaCreatorWeaponPick · edhaGrantBasicActions · edhaParseStartingSkill · edhaSkillIdFromLabel ·
 *   edhaCreatorPathRank.
 * Owns — attribute/skill steppers: EDHA_CW_ATTRS · EDHA_CW_ATTR_STAT · edhaCwAttrBudget ·
 *   edhaCwSkillBudget · edhaCwMaxSkillRank · edhaCwAttrInfo · edhaCwDerivedPreview ·
 *   edhaCwStepperDialog.
 * Owns — the steps and the entry points: edhaCreatorWelcomeStep · edhaCreatorPickStep ·
 *   edhaCreatorAttrStep · edhaCreatorSkillStep · edhaCreatorBudgetStep · edhaCreatorNameStep ·
 *   edhaCreationWizard · edhaCreatorNewCharacter, plus the renderActorDirectory button and the
 *   renderCharacterSheet launcher.
 * ============================================================================================ */

/* --- Character-creation wizard (2026-07-18l — §9j #5; design menu answered by Ben 07-18) --------
 * The guided FIRST-CHARACTER walkthrough: welcome → country → heroic path (Key + kit auto) →
 * leyline attunement (Key auto) → deity (optional, "usually earned in play") → talent-budget
 * spend (counter + open-tree buttons; the preCreateItem gate stays the enforcement) → purse +
 * name. It composes what exists and adds NO new grant machinery: culture items fire their own
 * add-to-actor events (cultural expertise + the ⚑ pick-2 dialog), path items grant Draw Mana
 * natively, edhaGrantStartingKit does the kit, edhaAllowedTalents/edhaCountTalents do the math.
 * Partial characters resume via the NATIVE sheet (E6 slots + double-click tree) — the wizard's
 * re-entry offer is START OVER: a level-1 reset (talents, paths, culture/ancestry, kit-stamped
 * gear + the kit's 5 silver) that keeps the actor's level, so a leveled PC re-picks everything
 * with the full allowed(L) budget (Keys re-permitted via edhaKeyPickAllowed's wizard window).
 * Ben's design answers: both surfaces (GM sidebar "＋ Edha Character" + a sheet bar); modal
 * wizard; Keys auto-granted; deity skippable; budget advisory (one-per-tree stays text); NO
 * Human-ancestry auto-grant (bench decides); no nation flag (the owned culture item IS the state).
 */
const EDHA_CREATOR_PACKS = { culture: "edha-content.edha-items", heroic: "edha-content.edha-heroic", leyline: "edha-content.edha-leyline", deity: "edha-content.edha-deity" };
const escCw = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* --- Thyrcross map picker (culture step, 2026-07-19 — Ben's bench ruling) ----------------------
 * The "Where are you from?" step shows the labeled world map: hover a nation = name + its map
 * `region` line (all data-derived from thyrcross.map.json via build-map-picker-asset.js), click =
 * selects it (drives the dropdown, which stays as the fallback + keyboard path). Assets ship in
 * the module (assets/thyrcross-map.jpg + thyrcross-nations.json, module-src-sync FILES) — if
 * they're missing (pre-asset deploy) the map block simply never shows. */
async function edhaCwMapData() {
  if (globalThis._edhaCwMapData !== undefined) return globalThis._edhaCwMapData;
  try {
    const r = await fetch("modules/edha-content/assets/thyrcross-nations.json");
    globalThis._edhaCwMapData = r.ok ? await r.json() : null;
  } catch (e) { globalThis._edhaCwMapData = null; }
  return globalThis._edhaCwMapData;
}
function edhaCwWireMap(rootEl, sel, nameToId) {
  const wrap = rootEl?.querySelector?.(".edha-cw-map");
  const holder = rootEl?.querySelector?.(".edha-cw-map-holder");
  const img = rootEl?.querySelector?.(".edha-cw-map-img");
  const tip = rootEl?.querySelector?.(".edha-cw-map-tip");
  if (!wrap || !holder || !img || !tip) { console.warn("Edha Content | map picker: wrapper markup missing from the dialog (sanitizer change?)"); return; }
  const SVGNS = "http://www.w3.org/2000/svg";
  // The overlay SVG must be created HERE, post-render: DialogV2's cleanHTML strips <svg> from
  // string content (bench take-two root cause). DOM added by script is never sanitized.
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("class", "edha-cw-map-svg");
  svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1";
  holder.appendChild(svg);
  void (async () => {
    const data = await edhaCwMapData();
    if (!data?.nations?.length) { console.warn("Edha Content | map picker: assets/thyrcross-nations.json missing or empty — dropdown fallback only. Re-run deploy (module-src-sync push)."); return; }
    img.addEventListener("error", () => { wrap.style.display = "none"; console.warn("Edha Content | map picker: assets/thyrcross-map.jpg failed to load — dropdown fallback only."); }, { once: true });
    svg.setAttribute("viewBox", `0 0 ${data.canvas_px[0]} ${data.canvas_px[1]}`);
    svg.setAttribute("preserveAspectRatio", "none");
    const clear = (p) => { p.classList.remove("sel"); p.setAttribute("stroke", "transparent"); p.setAttribute("fill", "transparent"); };
    const mark = (p, hover) => { p.setAttribute("stroke", hover ? "#ffd66b" : "#7fd0ff"); p.setAttribute("fill", hover ? "rgba(255,214,107,.12)" : "rgba(127,208,255,.16)"); };
    const byId = new Map();
    for (const n of data.nations) {
      const poly = document.createElementNS(SVGNS, "polygon");
      poly.setAttribute("points", n.polygon.map(pt => pt.join(",")).join(" "));
      clear(poly);
      poly.setAttribute("stroke-width", "6");
      const optId = nameToId.get(n.name) ?? null;
      poly.style.cursor = optId ? "pointer" : "default";
      if (optId) byId.set(optId, poly);
      poly.addEventListener("pointerenter", () => {
        if (!poly.classList.contains("sel")) mark(poly, true);
        tip.innerHTML = `<strong>${escCw(n.name)}</strong>${n.region ? `<br>${escCw(n.region)}` : ""}`;
        tip.style.display = "block";
      });
      poly.addEventListener("pointerleave", () => { if (!poly.classList.contains("sel")) clear(poly); tip.style.display = "none"; });
      if (optId) poly.addEventListener("click", () => { if (sel) { sel.value = optId; sel.dispatchEvent(new Event("change")); } });
      svg.appendChild(poly);
    }
    // Selection highlight follows the SELECT (map clicks route through it, so both paths agree).
    const sync = () => { for (const [id, p] of byId) { if (id === sel?.value) { p.classList.add("sel"); mark(p, false); } else clear(p); } };
    sel?.addEventListener("change", sync);
    sync();
    wrap.style.display = "";
  })();
}

/* --- Origin-expertise picker (edha-pick-expertises, 2026-07-19) --------------------------------
 * The native grant-expertises pick:true dialog IGNORES the rule's own expertises list — it offers
 * the system's registered (Rosharan) registries instead (bench 07-19, root cause in the system's
 * executor). This is the Edha pick mode: the dialog lists exactly the entries authored on the
 * rule (data/cultures.json pickGroups), enforces the pick count, marks already-owned entries, and
 * writes the same actor expertise shape the native handler writes. Multiple picks on one item
 * (Ashkar) chain through globalThis.edhaExpertisePickChain — one dialog at a time — and the
 * wizard's culture step awaits the chain so the picks read as wizard pages. */
async function edhaPickExpertisesDialog(actor, entries, amount, title, sourceName) {
  const DV2 = foundry.applications?.api?.DialogV2;
  if (!DV2) return null;
  const owned = new Set(Object.keys(actor?._source?.system?.expertises ?? {}));
  const ownedInList = entries.filter(e => owned.has(`${e.type}:${e.id}`)).length;
  const need = Math.max(1, Number(amount) || 1);
  // Already-known entries COUNT toward the pick (bench 07-19: a re-run forced two NEW picks on
  // top of the surviving old ones — four total). Zero new picks needed = no dialog at all.
  const needNew = Math.max(0, need - ownedInList);
  if (!needNew) { ui.notifications?.info(`Edha: ${actor?.name ?? "the character"} already knows ${ownedInList} of ${escCw(sourceName ?? "this list")}'s origins — no new picks needed.`); return null; }
  const rows = entries.map((e, i) => {
    const has = owned.has(`${e.type}:${e.id}`);
    // ONE flex child besides the checkbox — loose siblings made the prose overlap the box (07-19).
    return `<label>
      <input type="checkbox" name="edhaExp" value="${i}" ${has ? "checked disabled" : ""}>
      <span style="flex:1"><strong>${escCw(e.label)}</strong> <em style="opacity:.75">(${escCw(e.type)})</em>${has ? " — already known (counts)" : ""}
      ${e.text ? `<span style="display:block;font-size:.92em;opacity:.85">${escCw(e.text)}</span>` : ""}</span>
    </label>`;
  }).join("");
  const content = `<p><strong>${escCw(sourceName ?? "")}</strong> — choose <strong>${needNew}</strong>${ownedInList ? ` more (${ownedInList} of this list already known — they count toward the ${need})` : ""}:</p><div class="edha-cw-picklist" style="max-height:340px;overflow:auto">${rows}</div>`;
  for (;;) {
    const res = await DV2.wait({
      window: { title: title || `Choose ${needNew} expertise${needNew === 1 ? "" : "s"}` }, content, rejectClose: false, position: { width: 480 }, classes: ["edha-cw"],
      buttons: [{ action: "ok", label: "Confirm ✔", default: true,
        callback: (ev, btn) => Array.from(btn.form?.querySelectorAll?.("input[name=edhaExp]:checked:not(:disabled)") ?? []).map(c => Number(c.value)) }],
    });
    if (!Array.isArray(res)) return null;   // closed — the options stay readable on the culture card; add by hand
    const picked = res.map(i => entries[i]).filter(Boolean);
    if (picked.length === needNew) return picked;
    ui.notifications?.warn(`Edha: pick exactly ${needNew} (you picked ${picked.length}).`);
  }
}
// Wait out every pending origin pick (used by the wizard's culture step). The executor may not
// have STARTED yet when the culture item's create resolves — poll briefly for the chain to appear.
async function edhaAwaitExpertisePicks(timeoutMs = 2000) {
  const t0 = Date.now();
  while (!globalThis.edhaExpertisePickChain && Date.now() - t0 < timeoutMs) await new Promise(r => setTimeout(r, 100));
  let chain;
  while ((chain = globalThis.edhaExpertisePickChain)) {
    try { await chain; } catch (e) { /* a cancelled pick is fine */ }
    if (globalThis.edhaExpertisePickChain === chain) globalThis.edhaExpertisePickChain = null;
  }
}

// Enrich pack description HTML before injecting it into wizard previews (bench 07-19: raw
// @UUID[Compendium…] text showed on the heroic page — the copied-in system prose is full of
// content links that only render through enrichHTML).
async function edhaCwEnrich(html) {
  try {
    const TE = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
    return await TE.enrichHTML(String(html ?? ""), { async: true });
  } catch (e) { return String(html ?? ""); }
}

// Wizard dialogs kept above document sheets (bench 07-19: the wizard opened BEHIND the fresh
// actor sheet, and the leyline path's sheet landed on top of the deity page). Wraps DV2.wait /
// DV2.confirm so the current step re-fronts itself whenever a DOCUMENT sheet renders over it —
// and ONLY document sheets: dialogs and pickers (the pick-2 expertise dialog) must stay on top.
// hold() suspends the guard for deliberate opens (open-tree buttons, content-link clicks).
// Pure: does a dialog box hang off the bottom of the viewport in a way repositioning can fix?
// ApplicationV2#_updatePosition clamps `top` into [0, viewportH − height] ONCE, at render — so a
// dialog that GROWS afterwards keeps a top offset computed for a shorter box. `top <= 0` means it
// is already flush and taller than the viewport: nothing to gain, and re-setting would thrash.
function edhaDialogNeedsReposition(topPx, heightPx, viewportH) {
  const top = Number(topPx) || 0, h = Number(heightPx) || 0, vh = Number(viewportH) || 0;
  return top > 0 && vh > 0 && h > 0 && (top + h) > vh;
}

/* Wizard dialogs: keep-on-top guard + the grow-after-positioning fix (07-28, bench run 21).
 * The "Where are you from?" page opened 237 → 1025 in a 1400×900 viewport — 125 px past the
 * bottom — while every other page fitted. The height caps in edha.css were NOT at fault and the
 * content DOES scroll (.dialog-content is capped at 76vh); the stale TOP is the bug. The map block
 * ships `display:none` and is revealed only after assets/thyrcross-nations.json resolves, so
 * Foundry measured a 426 px dialog, centred it at (900−426)/2 = 237, and never looked again once
 * the 42vh map pushed it to 788. Every arithmetic step reproduces the reported numbers exactly.
 * The stepper pages have the same shape (their preview panel is filled in the render callback),
 * so the fix is generic rather than a hook in the map wiring: one ResizeObserver per wizard dialog
 * re-clamps `top` whenever the box grows. Width, left and size are never touched, a dialog that
 * already fits is never moved, and dragging changes position rather than size so the observer
 * stays quiet. */
function edhaCreatorDialogs(DV2) {
  let cur = null, hold = false, ro = null;
  const watch = (dlg) => {
    try {
      ro?.disconnect?.(); ro = null;
      const el = dlg?.element instanceof HTMLElement ? dlg.element : null;
      if (!el || typeof ResizeObserver !== "function") return;
      ro = new ResizeObserver(() => {
        try {
          const r = el.getBoundingClientRect();
          if (edhaDialogNeedsReposition(r.top, r.height, window.innerHeight)) dlg.setPosition?.({});
        } catch (e) { /* best-effort */ }
      });
      ro.observe(el);
    } catch (e) { /* best-effort */ }
  };
  const hookId = Hooks.on("renderApplicationV2", (app) => {
    try {
      if (hold || !cur || app === cur) return;
      const DS = foundry.applications?.api?.DocumentSheetV2;
      if (!DS || !(app instanceof DS)) return;
      setTimeout(() => { try { if (!hold && cur) cur.bringToFront?.(); } catch (e) { /* closed mid-step */ } }, 60);
    } catch (e) { /* guard is best-effort */ }
  });
  const wrap = (fnName) => (opts = {}) => {
    cur = null;
    opts.classes = ["edha-cw", ...(opts.classes ?? [])];   // css hook: viewport-capped height (07-19: the wizard opened with its bottom off-screen)
    const r0 = opts.render;
    opts.render = (ev, dlg) => {
      cur = dlg ?? null; hold = false;
      try { r0?.(ev, dlg); } catch (e) { /* step render is best-effort */ }
      watch(dlg);   // re-clamp `top` if this page grows after Foundry positioned it
    };
    return DV2[fnName](opts);
  };
  return { wait: wrap("wait"), confirm: wrap("confirm"), hold: () => { hold = true; },
           off: () => { try { ro?.disconnect?.(); } catch (e) {} ro = null; Hooks.off("renderApplicationV2", hookId); } };
}

// Pure: creation-state snapshot (works on a plain {system:{level}, items:[]} actor — pinned in tests).
function edhaCreationState(actor) {
  const items = Array.from(actor?.items ?? []);
  const path = (t) => items.find(i => i.type === "path" && i.system?.type === t) ?? null;
  const heroic = path("heroic"), leyline = path("leyline"), deity = path("deity");
  const culture = items.find(i => i.type === "culture") ?? null;
  const talents = items.filter(i => i.type === "talent").length;   // type-strict: PC budget (twins never count)
  return { culture, heroic, leyline, deity, talents, allowed: edhaAllowedTalents(actor),
           level: Math.max(1, Number(actor?.system?.level) || 1), complete: !!(culture && heroic && leyline) };
}
// Pure: what a level-1 restart deletes — talents, paths, culture/ancestry, kit-stamped gear.
// Draw Mana leaves via the leyline path's own remove-from-actor event; picked ORIGIN expertises
// linger by design (mirrors the shipped cultures — prune by hand when the nation changes).
function edhaCreationWipeIds(items) {
  const wipeTypes = new Set(["talent", "path", "culture", "ancestry"]);
  return Array.from(items ?? [])
    .filter(i => wipeTypes.has(i.type) || i.flags?.["edha-content"]?.kitItem === true)
    .map(i => i.id ?? i._id).filter(Boolean);
}
// Wipe the wizard-picked origin expertises (stamped by edha-pick-expertises) — hand-added
// expertises are untouched. 07-19 fix: lingering picks + the forced re-pick stacked to four.
async function edhaCreatorWipeOriginPicks(actor) {
  const keys = actor.getFlag?.("edha-content", "originPicks") ?? [];
  if (!keys.length) return 0;
  const owned = new Set(Object.keys(actor._source?.system?.expertises ?? {}));
  const del = keys.filter(k => owned.has(k));
  if (del.length) await actor.update({ system: { expertises: Object.fromEntries(del.map(k => [`-=${k}`, null])) } });
  try { await actor.unsetFlag("edha-content", "originPicks"); } catch (e) { /* flag clear is best-effort */ }
  return del.length;
}

async function edhaCreationRestart(actor) {
  const hadKit = !!actor.getFlag?.("edha-content", "kitPath");   // read BEFORE the wipe — the card reports what actually rolled back
  const ids = edhaCreationWipeIds(actor.items);
  if (ids.length) await actor.deleteEmbeddedDocuments("Item", ids);
  const wipedPicks = await edhaCreatorWipeOriginPicks(actor).catch(() => 0);
  await edhaCreatorWipePathRank(actor);   // the heroic training rank goes back with everything else
  try {
    if (hadKit) {
      const den = foundry.utils.deepClone(actor._source?.system?.currency?.edha?.denominations ?? []);
      const silver = den.find(x => x.id === "silver");
      if (silver) { silver.amount = Math.max(0, (Number(silver.amount) || 0) - 5); await actor.update({ "system.currency.edha.denominations": den }); }
      await actor.unsetFlag("edha-content", "kitPath");
    }
  } catch (e) { console.warn("Edha | restart purse rollback failed", e); }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>⟲ <strong>${escCw(actor.name)}</strong> restarted character creation: level-1 picks cleared (talents, paths, culture${hadKit ? ", kit gear + its 5 silver" : ""}${wipedPicks ? `, ${wipedPicks} picked origin expertise${wipedPicks === 1 ? "" : "s"}` : ""}), level ${Math.max(1, Number(actor.system?.level) || 1)} kept. Hand-added expertises stay.</p>` });
}

async function edhaCreatorPackDocs(kind) {
  const packId = EDHA_CREATOR_PACKS[kind];
  const pack = game.packs?.get(packId);
  if (!pack) { ui.notifications?.warn(`Edha: compendium "${packId}" is missing — deploy/rebuild first.`); return null; }
  return await pack.getDocuments();
}
// The kit for a picked heroic path; the culture/path items' own events do the rest — the path's
// pathEvents grant-items rule delivers the Key (and Draw Mana on leylines). The wizard must NOT
// grant the Key itself: doing so raced the native async grant and doubled it (bench 07-19 —
// Vigilant Stance ×2 / Red Leyline Attunement ×2, eating the talent budget).
async function edhaCreatorApplyPick(actor, kind, doc, docs) {
  await actor.createEmbeddedDocuments("Item", [edhaCleanPackCopy(doc)]);   // culture/path add-to-actor events fire natively
  if (kind === "heroic" || kind === "leyline") {
    const key = docs.find(d => edhaIsTalent(d) && d.flags?.["edha-content"]?.specialty === "Key" && d.flags?.["edha-content"]?.group === doc.name);
    if (!key) ui.notifications?.warn(`Edha: no Key talent found for ${doc.name} — take it from the tree by hand.`);
    else setTimeout(() => {
      if (!actor.items.some(i => edhaIsTalent(i) && i.name === key.name))
        ui.notifications?.warn(`Edha: ${key.name} didn't arrive with the path — take it from the tree (the wizard's Key window is open).`);
    }, 1200);   // verify-only: the path's own grant is async (pack fromUuid) — never re-grant here
  }
  if (kind === "heroic" && EDHA_KITS[doc.name]) await edhaGrantStartingKit(actor, doc.name);
}

const EDHA_CREATOR_PICKS = {
  culture: { title: "Where are you from?", intro: "Pick your country of origin. The card grants your nation's <strong>cultural expertise</strong> and asks you to pick <strong>two origin expertises</strong> from its list (Ashkar picks differently — the card explains)." },
  heroic:  { title: "Your heroic path", intro: "Pick your heroic path. Its <strong>Key talent</strong>, its <strong>free starting skill rank</strong> (the one your path names) and its <strong>starting kit</strong> (with the 5-silver purse) are granted automatically. The weapon slot stays YOUR pick: any weapon ≤ 2 gold you can actually use." },
  leyline: { title: "Your leyline attunement", intro: "Pick the leyline you attune to. The color's <strong>Attunement Key</strong> and the universal <strong>Draw Mana</strong> action are granted automatically." },
  deity:   { title: "A deity path? (optional)", intro: "Deity attunement is <em>usually earned in play</em> — GM's call. <strong>Browse the trees</strong> to see where your character might one day build, and <strong>note a faith</strong> if they're religious (pure flavor — no talents, no commitment). Skip unless your table starts attuned.", skippable: true },
};
// In-wizard slot change (bench take-two: "why is there a back button if it doesn't work?" — the
// already-chosen page dead-ended into Start over). Un-picks ONE slot: the item itself, plus (for
// paths) every owned talent flagged to that tree (`flags.edha-content.group` — Keys included) and
// (for heroic) the kit gear + its 5 silver. The path item's own remove-from-actor events also
// fire (Key + Draw Mana removal — overlap is a no-op). Picked origin expertises linger on a
// culture change, mirroring Start over.
async function edhaCreatorChangeSlot(actor, kind) {
  const state = edhaCreationState(actor);
  const it = state[kind];
  if (!it) return;
  const ids = new Set([it.id]);
  if (kind !== "culture") for (const t of actor.items) {
    if (edhaIsTalent(t) && t.flags?.["edha-content"]?.group === it.name) ids.add(t.id);
  }
  const hadKit = kind === "heroic" && !!actor.getFlag?.("edha-content", "kitPath");
  if (hadKit) for (const g of actor.items) { if (g.flags?.["edha-content"]?.kitItem === true) ids.add(g.id); }
  await actor.deleteEmbeddedDocuments("Item", [...ids].filter(Boolean));
  if (kind === "culture") await edhaCreatorWipeOriginPicks(actor).catch(() => 0);   // 07-19: else the re-pick stacks to four
  if (kind === "heroic") await edhaCreatorWipePathRank(actor);                       // hand the training rank back too
  if (hadKit) {
    try {
      const den = foundry.utils.deepClone(actor._source?.system?.currency?.edha?.denominations ?? []);
      const silver = den.find(x => x.id === "silver");
      if (silver) { silver.amount = Math.max(0, (Number(silver.amount) || 0) - 5); await actor.update({ "system.currency.edha.denominations": den }); }
      await actor.unsetFlag("edha-content", "kitPath");
    } catch (e) { console.warn("Edha | slot-change purse rollback failed", e); }
  }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>↺ <strong>${escCw(actor.name)}</strong> un-picks <strong>${escCw(it.name)}</strong>${ids.size > 1 ? ` (with ${ids.size - 1} linked item${ids.size === 2 ? "" : "s"}${hadKit ? ", kit gear + its 5 silver" : ""})` : ""} to choose again.</p>` });
}

// Pack copies must NOT carry their source's relationship links (2026-07-19r, Ben's console
// paste): the system's createItem hook walks system.relationships on anything landing on an
// actor and writes contra-links back onto whatever the entries' uuids resolve to — the
// COMPENDIUM source doc. The server rejects that write (undefined id in the world collection)
// and the follow-up relationship diff crashes the system's own updateItem hook (Object.values
// over a deletion diff → null.uuid). Deleting the key lets the DataModel refill its clean
// initial value; the meta.origin flag rides along with it.
function edhaCleanPackCopy(doc) {
  const obj = doc.toObject();
  if (obj.system && "relationships" in obj.system) delete obj.system.relationships;
  if (obj.flags?.["cosmere-rpg"]?.meta?.origin) delete obj.flags["cosmere-rpg"].meta.origin;
  return obj;
}

// The kit's weapon slot (bench take-two: "there's no dialogue for weapon picking"): every kit
// leaves the weapon to the player — any weapon ≤ 2 gold they can actually use. This lists the
// edha-items weapons at or under 200 c (g=100 c, s=10 c — the registered conversion rates) with
// price/damage/skill so the "can use" call stays visible, and grants the chosen one.
async function edhaCreatorWeaponPick(actor, DV2, pathName) {
  try {
    const pack = game.packs?.get(EDHA_CREATOR_PACKS.culture);   // edha-content.edha-items holds the gear too
    const docs = (await pack?.getDocuments()) ?? [];
    const toC = (p) => (Number(p?.value) || 0) * ({ gold: 100, silver: 10, copper: 1 }[p?.denomination?.primary] ?? 1);
    const weapons = docs.filter(d => d.type === "weapon" && toC(d.system?.price) > 0 && toC(d.system?.price) <= 200
        && d.flags?.["edha-content"]?.plotItem !== true)   // plot-clue gear never offers itself as starter kit (Ben 07-19: the Malcurr-Stamped Blade)
      .sort((a, b) => toC(a.system?.price) - toC(b.system?.price) || a.name.localeCompare(b.name));
    if (!weapons.length) return;
    const allowed = EDHA_KITS[pathName]?.weapons ?? null;   // path-curated slot (Ben 07-19); null = Warrior's open "weapon of choice"
    const offered = allowed ? weapons.filter(d => allowed.includes(d.name)) : weapons;
    if (allowed && !offered.length) { console.warn(`Edha Content | weapon slot: none of ${pathName}'s listed weapons exist in the pack — offering the open list.`); }
    const listShown = offered.length ? offered : weapons;
    const skillName = (id) => { try { return game.i18n.localize(CONFIG.COSMERE?.skills?.[id]?.label ?? id); } catch (e) { return id; } };
    const priceTxt = (d) => { const p = d.system?.price; return p?.value ? `${p.value} ${({ gold: "g", silver: "s", copper: "c" })[p.denomination?.primary] ?? ""}` : "—"; };
    const rows = listShown.map(d => `<label>
        <input type="radio" name="edhaWpn" value="${d.id}">
        <span><strong>${escCw(d.name)}</strong> — ${escCw(priceTxt(d))}${d.system?.damage?.formula ? ` · ${escCw(d.system.damage.formula)} ${escCw(d.system.damage.type ?? "")}` : ""} · ${escCw(skillName(d.system?.activation?.skill ?? ""))}</span>
      </label>`).join("");
    const res = await DV2.wait({
      window: { title: "Character Creation — the kit's weapon slot" }, rejectClose: false, position: { width: 520 },
      content: `<p>Your kit's <strong>weapon slot</strong>: ${allowed ? `the arms ${edhaArticle(pathName)} ${escCw(pathName)} actually carries` : "any weapon of <strong>2 gold or less</strong> you can actually use"} — pick <strong>one</strong> (each one's skill is listed). Choose now, or later from the Edha Items compendium.</p><div class="edha-cw-picklist" style="max-height:340px;overflow:auto">${rows}</div>`,
      buttons: [
        { action: "skip", label: "Choose later" },
        { action: "take", label: "Take it ▶", default: true, callback: (ev, btn) => btn.form?.querySelector?.("input[name=edhaWpn]:checked")?.value ?? null },
      ],
    });
    if (!res || res === "skip") return;
    const doc = listShown.find(w => w.id === res);
    if (doc) {
      const o = edhaCleanPackCopy(doc);
      // kitItem stamp: the weapon FILLS the kit's slot, so Start over / ↺ Change heroic wipe it
      // like the rest of the kit (bench 07-19: a restart-surviving pick stacked two knives).
      foundry.utils.setProperty(o, "flags.edha-content.kitItem", true);
      await actor.createEmbeddedDocuments("Item", [o]);
      ui.notifications?.info(`Edha: ${doc.name} added to ${actor.name}.`);
    }
  } catch (e) { console.warn("Edha Content | weapon pick failed", e); }
}

// The system's basic actions (Strike, etc. — pack cosmere-rpg.actions) don't land on new actors
// by themselves; every wizard-touched PC gets the missing ones (by name, idempotent). Bench
// take-two ask.
async function edhaGrantBasicActions(actor) {
  try {
    const pack = game.packs?.get("cosmere-rpg.actions");
    if (!pack) { console.warn("Edha Content | cosmere-rpg.actions pack missing — basic actions not granted."); return 0; }
    const docs = await pack.getDocuments();
    const have = new Set(actor.items.map(i => i.name));
    const packNames = new Set(docs.filter(d => d.type === "action").map(d => d.name));
    const toAdd = docs.filter(d => d.type === "action" && !have.has(d.name)).map(d => {
      const o = edhaCleanPackCopy(d);
      // Bench take-3 (Unarmed Strike ×2, src null): the shipped actions carry their own
      // add-to-actor grant-items events that deliver GEAR — a batch create fires them
      // concurrently and the system's name-dedup races itself. Kits own Edha onboarding:
      // strip actor-lifecycle events, keep use-time rules; the unarmed weapon is granted
      // deliberately below instead.
      for (const [id, ev] of Object.entries(o.system?.events ?? {})) {
        if (ev?.event === "add-to-actor" || ev?.event === "remove-from-actor") delete o.system.events[id];
      }
      // Bench take-7 (a BRAND-NEW actor with STR 0 shows 10/11 max health — only the action
      // copies exist at that point): auto-applying (transfer) Active Effects on shipped
      // actions passively modify the actor. Kits own Edha onboarding — strip them; AEs the
      // action applies on USE (transfer:false) stay.
      o.effects = (o.effects ?? []).filter(e => e?.transfer === false);
      return o;
    });
    if (toAdd.length) await actor.createEmbeddedDocuments("Item", toAdd);
    // Repair sweep: action copies granted BEFORE the strip still carry the transfer AEs —
    // remove them from this actor's pack-named action items (test actors self-heal on open).
    try {
      for (const it of actor.items) {
        if (it.type !== "action" || !packNames.has(it.name)) continue;
        const dead = (it.effects ?? []).filter(e => e.transfer !== false).map(e => e.id);
        if (dead.length) { await it.deleteEmbeddedDocuments("ActiveEffect", dead); console.log(`Edha Content | stripped ${dead.length} passive effect(s) from ${it.name} on ${actor.name}`); }
      }
    } catch (e) { console.warn("Edha Content | action-effect repair sweep failed", e); }
    // Exactly ONE unarmed strike, matched by system.id (name-proof; never touches real gear
    // like the Agent's two Knives): heal existing doubles, then grant if absent.
    const unarmed = actor.items.filter(i => i.type === "weapon" && i.system?.id === "unarmed");
    if (unarmed.length > 1) {
      await actor.deleteEmbeddedDocuments("Item", unarmed.slice(1).map(i => i.id));
      ui.notifications?.info(`Edha: removed ${unarmed.length - 1} duplicate Unarmed Strike from ${actor.name}.`);
    } else if (!unarmed.length) {
      for (const packId of ["cosmere-rpg.items", "cosmere-rpg.actions"]) {
        const p2 = game.packs?.get(packId);
        const d2 = (await p2?.getDocuments())?.find(d => d.type === "weapon" && d.system?.id === "unarmed");
        if (d2) { await actor.createEmbeddedDocuments("Item", [edhaCleanPackCopy(d2)]); break; }
      }
    }
    return toAdd.length;
  } catch (e) { console.warn("Edha Content | basic-actions grant failed", e); return 0; }
}

// Pure: the starting skill named on a heroic path's own card. Every path's description ends
// "Starting Skill: <X>. If you choose <Path> as your starting path, gain a free skill rank in
// <X>." — in TWO markup shapes ("<strong>Starting Skill: Athletics.</strong>" and
// "<strong>Starting Skill:</strong> <strong>Discipline.</strong>"), so strip tags first. Returns
// the skill's LABEL; edhaSkillIdFromLabel turns it into an id. Pinned in tests/ against all six.
function edhaParseStartingSkill(html) {
  const text = String(html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
  const m = /Starting Skill:\s*([A-Za-z][A-Za-z ]*?)\s*\./.exec(text);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}
// Resolve a skill LABEL ("Athletics", "Heavy Weaponry") to its CONFIG id ("ath", "hwp"). Matches
// the id itself too, so a card that names an id still resolves.
function edhaSkillIdFromLabel(label) {
  const want = String(label ?? "").trim().toLowerCase();
  if (!want) return null;
  for (const [id, cfg] of Object.entries(CONFIG.COSMERE?.skills ?? {})) {
    if (id.toLowerCase() === want) return id;
    let lbl = cfg?.label ?? id;
    try { lbl = game.i18n.localize(lbl); } catch (e) { /* raw key stands */ }
    if (String(lbl).trim().toLowerCase() === want) return id;
  }
  return null;
}

// Path training (Ben 07-19: the skills page "lets you place all five — one should be automatic"):
// the heroic path grants a free +1 rank in ONE FIXED skill — Warrior/Athletics, Hunter/Perception,
// Scholar/Lore, Agent/Insight, Envoy/Discipline, Leader/Leadership. Stamped on
// edha-content.pathRankSkill so Start over / ↺ Change heroic hand the rank back (no stacking).
//
// ⚠️ 2026-07-28, bench run 21. This used to read `system.linkedSkills` off the pack doc and offer
// a PICK from it; the dialog never appeared for any path, silently, and the run filed it as an
// authoring gap ("all six heroic paths ship linkedSkills: []"). It is NOT a gap and no data change
// was needed. In the cosmere system `linkedSkills` means the skills a path UNLOCKS: the character
// sheet renders `path.system.linkedSkills.filter(id => actor.system.skills[id].unlocked)`, and
// `Actor#orphanedSkills` is the non-core skills no path claims. Core heroic paths unlock no
// non-core skills, so [] is exactly what they must ship — and a populated list would have offered
// surge skills, not training. There was never a choice to offer, either: the rule on every path's
// own card names ONE skill.
//
// The system already implements this rule, table and all (STARTING_SKILLS +
// cosmereRPG.utils.macros.startingPath.set/unset, which also stamps flags.cosmere-rpg
// .isStartingPath). Call it instead of re-keying the table here — iron rule 2a, compose what
// exists — and learn which skill moved by DIFFING ranks, so no path→skill mapping lives in this
// engine at all. The card-text parse is the fallback for an install whose system lacks the macro.
async function edhaCreatorPathRank(actor, pathName) {
  try {
    if (actor.getFlag?.("edha-content", "pathRankSkill")) return;   // once per heroic pick
    const items = Array.from(actor.items ?? []);
    const path = items.find(i => i.type === "path" && i.system?.type === "heroic" && i.name === pathName)
              ?? edhaCreationState(actor).heroic;
    if (!path) { ui.notifications?.warn(`Edha: ${pathName} isn't on the actor yet — add its +1 starting rank by hand on the skills page.`); return; }
    // A path the actor already carries as its STARTING path owns the free rank; never grant twice.
    const claimed = items.find(i => i.type === "path" && i.getFlag?.("cosmere-rpg", "isStartingPath") === true);
    if (claimed && claimed.id !== path.id) {
      ui.notifications?.info(`Edha: ${claimed.name} is already ${actor.name}'s starting path — the free skill rank stays with it.`);
      return;
    }
    const label = (id) => { try { return game.i18n.localize(CONFIG.COSMERE?.skills?.[id]?.label ?? id); } catch (e) { return id; } };
    const rankOf = (id) => Number(actor.system?.skills?.[id]?.rank) || 0;
    const before = Object.fromEntries(Object.keys(actor.system?.skills ?? {}).map(id => [id, rankOf(id)]));
    let skillId = null;
    const macro = globalThis.cosmereRPG?.utils?.macros?.startingPath;
    if (typeof macro?.set === "function") {
      try {
        await macro.set(path, { notify: false });
        skillId = Object.keys(before).find(id => rankOf(id) > before[id]) ?? null;
      } catch (e) { console.warn("Edha Content | the system's startingPath.set failed — falling back to the card text", e); }
    }
    if (!skillId) {   // fallback: the sentence on the path's own card
      skillId = edhaSkillIdFromLabel(edhaParseStartingSkill(path.system?.description?.value));
      if (skillId) await actor.update({ [`system.skills.${skillId}.rank`]: rankOf(skillId) + 1 });
    }
    if (!skillId) { ui.notifications?.warn(`Edha: couldn't read ${pathName}'s starting skill — add its +1 rank by hand on the skills page.`); return; }
    await actor.setFlag?.("edha-content", "pathRankSkill", skillId);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎓 <strong>${escCw(actor.name)}</strong>'s ${escCw(pathName)} training: +1 ${escCw(label(skillId))} (rank ${rankOf(skillId)}).</p>` });
  } catch (e) { console.warn("Edha Content | path-rank grant failed", e); }
}
async function edhaCreatorWipePathRank(actor) {
  try {
    const id = actor.getFlag?.("edha-content", "pathRankSkill");
    if (!id) return;
    const cur = Number(actor.system?.skills?.[id]?.rank) || 0;
    if (cur > 0) await actor.update({ [`system.skills.${id}.rank`]: cur - 1 });
    await actor.unsetFlag("edha-content", "pathRankSkill");
  } catch (e) { console.warn("Edha Content | path-rank wipe failed", e); }
}

async function edhaCreatorPickStep(actor, DV2, kind) {
  const cfg = EDHA_CREATOR_PICKS[kind];
  const state = edhaCreationState(actor);
  if (state[kind]) {
    // Kit backfill (07-19): a heroic path picked OUTSIDE the wizard (native sheet, or an actor
    // made before the kit existed) never got its kit — offer it here instead of moving on silently.
    const kitDue = kind === "heroic" && EDHA_KITS[state.heroic.name] && !actor.getFlag?.("edha-content", "kitPath");
    const r = await DV2.wait({ window: { title: `Character Creation — ${cfg.title}` }, rejectClose: false, position: { width: 560 },
      content: `<p>✅ Already chosen: <strong>${escCw(state[kind].name)}</strong>. Changed your mind? <em>↺ Change</em> un-picks it right here.</p>${kitDue ? `<p>🎒 This character never received the <strong>${escCw(state.heroic.name)} starting kit</strong> (made pre-kit, or the path was picked by hand) — grant it now?</p>` : ""}`,
      buttons: [
        { action: "back", label: "◀ Back" },
        { action: "change", label: "↺ Change…" },
        ...(kitDue ? [{ action: "kit", label: "🎒 Grant the kit" }] : []),
        { action: "next", label: "Next ▶", default: true },
      ] });
    if (r === "kit") { await edhaGrantStartingKit(actor, state.heroic.name); await edhaCreatorWeaponPick(actor, DV2, state.heroic.name); return "again"; }
    if (r === "change") {
      const consequences = {
        culture: "the culture item leaves (its cultural expertise with it) and the origin expertises the wizard's picker granted are wiped — hand-added expertises stay",
        heroic: "the path, its Key, every talent taken from its tree, and the kit gear leave (the kit's 5 silver comes back off the purse)",
        leyline: "the path, its Attunement Key, Draw Mana, and every talent taken from its trees leave",
        deity: "the path, its Key, and every talent taken from its trees leave",
      };
      const ok = await DV2.confirm({ window: { title: `Change ${cfg.title}?` }, rejectClose: false,
        content: `<p>Un-pick <strong>${escCw(state[kind].name)}</strong>? Here's what happens: ${consequences[kind]}. Then this page re-opens for a fresh pick.</p>` });
      if (!ok) return "again";
      await edhaCreatorChangeSlot(actor, kind);
      return "again";
    }
    return r === "back" ? "back" : (r === "next" ? "next" : "close");
  }
  const docs = await edhaCreatorPackDocs(kind);
  if (!docs) return "close";
  const wantType = kind === "culture" ? "culture" : "path";
  const opts = docs.filter(d => d.type === wantType).sort((x, y) => x.name.localeCompare(y.name));
  if (!opts.length) { ui.notifications?.warn(`Edha: no ${wantType} entries in ${EDHA_CREATOR_PACKS[kind]} — deploy/rebuild first.`); return "close"; }
  const byId = new Map(opts.map(d => [d.id, d]));
  const enriched = new Map(await Promise.all(opts.map(async d => [d.id, await edhaCwEnrich(d.system?.description?.value)])));
  const isCulture = kind === "culture";
  const isDeity = kind === "deity";
  const faithNow = isDeity ? (actor.getFlag?.("edha-content", "faith") ?? null) : null;
  const deityHtml = isDeity ? `
    <p class="edha-cw-deity-extra" style="margin:6px 0">
      <button type="button" class="edha-cw-browse">🌿 Browse the tree (read-only)</button>
      <button type="button" class="edha-cw-faith">☀ Note as faith — no mechanics</button>
      <span class="edha-cw-faith-now" style="margin-left:6px;opacity:.85">${faithNow ? `Faith: <strong>${escCw(faithNow)}</strong>` : ""}</span>
    </p>` : "";
  // NO <svg> in this string: DialogV2 runs string content through foundry.utils.cleanHTML, whose
  // tag allowlist has img/div/select but NOT svg (bench take-two: "no country map at all" — the
  // overlay was silently stripped). edhaCwWireMap builds the SVG programmatically post-render.
  const mapHtml = isCulture ? `
    <div class="edha-cw-map" style="position:relative;display:none;margin-bottom:6px;text-align:center">
      <div class="edha-cw-map-holder" style="position:relative;display:inline-block;line-height:0">
        <img class="edha-cw-map-img" src="modules/edha-content/assets/thyrcross-map.jpg" alt="Thyrcross" style="height:42vh;width:auto;display:block;border-radius:4px">
        <div class="edha-cw-map-tip" style="position:absolute;left:6px;top:6px;display:none;pointer-events:none;background:rgba(0,0,0,.78);color:#fff;padding:3px 9px;border-radius:3px;font-size:.95em;line-height:1.35;text-align:left;z-index:2"></div>
      </div>
    </div>` : "";
  const content = `<p>${cfg.intro}</p>${mapHtml}
    <select name="edhaPick" class="edha-cw-select" style="width:100%">${opts.map((d, i) => `<option value="${d.id}"${i === 0 ? " selected" : ""}>${escCw(d.name)}</option>`).join("")}</select>${deityHtml}
    <div class="edha-cw-preview" style="max-height:${isCulture ? 220 : 340}px;overflow:auto;border:1px solid rgba(255,255,255,.18);border-radius:3px;padding:6px;margin-top:6px">${enriched.get(opts[0].id) ?? ""}</div>`;
  const buttons = [
    { action: "back", label: "◀ Back" },
    ...(cfg.skippable ? [{ action: "skip", label: "Skip for now" }] : []),
    { action: "pick", label: "Choose ▶", default: true, callback: (ev, btn) => btn.form?.elements?.edhaPick?.value ?? null },
  ];
  const res = await DV2.wait({
    window: { title: `Character Creation — ${cfg.title}` }, content, rejectClose: false, position: { width: isCulture ? 660 : 560 },
    render: (ev, dlg) => { try {
      const rootEl = dlg?.element instanceof HTMLElement ? dlg.element : (dlg instanceof HTMLElement ? dlg : (dlg?.[0] ?? null));
      const sel = rootEl?.querySelector?.("[name=edhaPick]");
      const pv = rootEl?.querySelector?.(".edha-cw-preview");
      if (sel && pv) sel.addEventListener("change", () => { pv.innerHTML = enriched.get(sel.value) ?? ""; });
      // A clicked content link opens that document's sheet — the reader meant to see it, so
      // suspend the keep-on-top guard for this step.
      if (pv) pv.addEventListener("click", (e2) => { if (e2.target?.closest?.("a.content-link, a.inline-roll")) DV2.hold?.(); });
      if (isCulture && sel) edhaCwWireMap(rootEl, sel, new Map(opts.map(d => [d.name, d.id])));
      if (isDeity && sel) {
        // Browse = the COMPENDIUM path sheet on its talents tab — unbound to any actor, so the
        // tree renders read-only: exactly the "see where you might build" surface (Ben 07-19).
        rootEl?.querySelector?.(".edha-cw-browse")?.addEventListener("click", () => {
          const doc = byId.get(sel.value);
          if (!doc?.sheet) return;
          DV2.hold?.();
          void doc.sheet.render({ force: true, tab: "talents" });
        });
        rootEl?.querySelector?.(".edha-cw-faith")?.addEventListener("click", async () => {
          const doc = byId.get(sel.value);
          if (!doc) return;
          await actor.setFlag?.("edha-content", "faith", doc.name);
          const span = rootEl?.querySelector?.(".edha-cw-faith-now");
          if (span) span.innerHTML = `Faith: <strong>${escCw(doc.name)}</strong>`;
          ui.notifications?.info(`Edha: ${actor.name} keeps faith with ${doc.name} (flavor only — no talents granted).`);
        });
      }
    } catch (e) { /* preview is best-effort */ } },
    buttons,
  });
  if (res === "back") return "back";
  if (res === "skip") return "next";
  const doc = byId.get(res);
  if (!doc) return "close";   // closed, or an id that no longer resolves
  await edhaCreatorApplyPick(actor, kind, doc, docs);
  if (kind === "culture") await edhaAwaitExpertisePicks();   // the origin picks read as part of this page (Ashkar chains two)
  if (kind === "heroic") {
    await edhaCreatorPathRank(actor, doc.name);                                 // the path's automatic +1 starting skill rank
    if (EDHA_KITS[doc.name]) await edhaCreatorWeaponPick(actor, DV2, doc.name); // the kit's weapon slot
  }
  return "next";
}

async function edhaCreatorWelcomeStep(actor, DV2) {
  // Basic-actions backfill: silent + idempotent, so pre-existing PCs pick them up on any wizard
  // visit, not just fresh creations.
  const added = await edhaGrantBasicActions(actor);
  if (added) ui.notifications?.info(`Edha: added ${added} basic action${added === 1 ? "" : "s"} to ${actor.name}.`);
  const s = edhaCreationState(actor);
  const kitPath = actor.getFlag?.("edha-content", "kitPath") ?? null;
  const li = (done, label) => `<li style="list-style:none">${done ? "✅" : "⬜"} ${label}</li>`;
  const content = `
    <p><strong>Welcome to Edha.</strong> This walkthrough builds your character start to finish:
    where you're from, your heroic path (with its starting kit), your leyline attunement, and the
    talents your level grants. Close it any time — everything picked so far stays on the sheet,
    and the sheet can do every step by hand (the path slots + the trees).</p>
    <ul style="margin:4px 0;padding:0 0 0 4px">
      ${li(!!s.culture, `Country of origin${s.culture ? ` — ${escCw(s.culture.name)}` : ""}`)}
      ${li(!!s.heroic, `Heroic path${s.heroic ? ` — ${escCw(s.heroic.name)}` : ""}${kitPath ? " (kit granted)" : (s.heroic && EDHA_KITS[s.heroic.name] ? " (kit NOT granted — the heroic page offers it)" : "")}`)}
      ${li(!!s.leyline, `Leyline attunement${s.leyline ? ` — ${escCw(s.leyline.name)}` : ""}`)}
      ${li(!!s.deity, `Deity path (optional)${s.deity ? ` — ${escCw(s.deity.name)}` : (actor.getFlag?.("edha-content", "faith") ? ` — faith: ${escCw(actor.getFlag("edha-content", "faith"))} (flavor)` : "")}`)}
      ${li(s.talents >= s.allowed, `Talents — ${s.talents} of ${s.allowed} for level ${s.level}`)}
    </ul>`;
  const buttons = [{ action: "begin", label: s.complete ? "Walk through ▶" : "Begin ▶", default: true }];
  if (s.culture || s.heroic || s.leyline || s.talents > 0) buttons.unshift({ action: "restart", label: "⟲ Start over…" });
  const r = await DV2.wait({ window: { title: `Character Creation — ${actor.name}` }, content, rejectClose: false, position: { width: 560 }, buttons });
  if (r === "restart") {
    const ok = await DV2.confirm({ window: { title: "Start over?" }, rejectClose: false,
      content: `<p>This clears the level-1 picks from <strong>${escCw(actor.name)}</strong>: ALL talents, paths, culture/ancestry items, still-held starting-kit gear (the kit's 5 silver comes back off the purse), and the origin expertises the wizard's picker granted. Level ${s.level} is kept — you re-pick with the full budget. Hand-added expertises stay.</p><p>Start over?</p>` });
    if (!ok) return "again";
    await edhaCreationRestart(actor);
    return "next";
  }
  return r === "begin" ? "next" : "close";
}

/* --- Attribute & skill assignment steps (2026-07-19 — Ben's bench ruling: full UI) -------------
 * Creation numbers from Character_Building_Rules.md (legacy source — delta flags them for veto):
 * attributes 12 points at L1, +1 at levels 3/6/9/12/15/18, max 3 per attribute AT level 1;
 * skills 5 + (L−1)×2 total ranks, max rank = INT((L−1)/5) + 2. The editors write the native
 * fields (system.attributes.<id>.value / system.skills.<id>.rank) — the sheet stays the hand
 * surface; these pages are the guided path. Both count CURRENT values, so auto-granted ranks
 * spend from the same budget and a hand-built PC opens with its spend visible. */
const EDHA_CW_ATTRS = ["str", "spd", "int", "wil", "awa", "pre"];
function edhaCwAttrBudget(level) { return 12 + [3, 6, 9, 12, 15, 18].filter(x => x <= (Number(level) || 1)).length; }
function edhaCwSkillBudget(level) { return 5 + (Math.max(1, Number(level) || 1) - 1) * 2; }
function edhaCwMaxSkillRank(level) { return Math.floor((Math.max(1, Number(level) || 1) - 1) / 5) + 2; }

// The Senses cell. The ladder's top rung is Number.MAX_SAFE_INTEGER (the system's own ∞ — see
// `SENSES_RANGES`, cosmere-rpg index.js:8534), reachable at AWA 9, and the attribute cap above
// level 1 is 99 — so the preview MUST render it as ∞ rather than "9007199254740991 ft". The
// system's sheet does the same via its `isNumMaxSafeInt` Handlebars helper (index.js:13644).
function edhaCwSensesCell(awa) {
  const ft = edhaSensesRangeFtFromAwa(awa);
  return ft === Number.MAX_SAFE_INTEGER ? "∞" : `${ft} ft`;
}

// Live derived-stat preview for the attributes page (Ben 07-19: "show what the character's
// health, focus, investiture, and defenses WILL be at the current distribution"). Its contract is
// the SHEET, not the rulebook — every number must be what the finished sheet will read, so the
// three stats Edha derives differently from the system come from the shared helpers
// (EDHA_HP_BONUS / edhaWalkRateFtFromSpd / edhaSensesRangeFtFromAwa), never re-implemented here.
// Bench run 21 caught all three drifting at once when they were: Health missed the then-+1, Move
// used the SYSTEM's ceil(SPD/2) ladder against the sheet's 20+5×SPD, and Senses was the only one the
// preview had right. (R-54 has since set EDHA_HP_BONUS to 0, so the Health cell now equals the
// system's advancement sum — read from the constant, never re-inlined, so the two stay agreed.
// R-56's 2026-09-07 reversal — item 83 — has since made Senses the SYSTEM's ladder too: the cell
// still reads the shared helper, but that helper is now the system's `[5,10,20,50,100,∞]` by
// ceil(AWA/2), so the preview promises exactly what the system will derive onto the sheet.
// MOVEMENT is now the only cell here that is an Edha rule rather than a system one.)
// The rest mirror the system: health sums the advancement rules (rule.health +
// STR where healthIncludeStrength — read from CONFIG at runtime); Focus 2+WIL; defenses 10+pair;
// recovery is the system's ceil(WIL/2) die ladder; Investiture 2+max(AWA,PRE) is the Edha rule
// (attunement-gated, footnoted).
function edhaCwDerivedPreview(actor, cur) {
  const level = Math.max(1, Number(actor.system?.level) || 1);
  let hp = 0;
  try {
    const rules = CONFIG.COSMERE?.advancement?.rules ?? [];
    for (let i = 0; i < level; i++) {
      const r = rules[Math.min(i, Math.max(0, rules.length - 1))] ?? {};
      hp += (Number(r.health) || 0) + (r.healthIncludeStrength ? cur.str : 0);
    }
    hp += EDHA_HP_BONUS;   // the sheet's own derivation adds it; the preview promises the sheet
  } catch (e) { hp = 0; }
  const DICE = ["d4", "d6", "d8", "d10", "d12", "d20"];
  const idx = (v) => Math.min(Math.ceil((Number(v) || 0) / 2), 5);
  const cell = (label, val) => `<span style="white-space:nowrap"><em style="opacity:.7">${label}</em> <strong>${val}</strong></span>`;
  return `<div class="edha-cw-stats-box" style="display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;text-align:center;padding:5px 8px;border:1px solid rgba(127,208,255,.35);border-radius:4px;margin:4px auto">
    ${cell("Health", hp)} ${cell("Focus", 2 + cur.wil)} ${cell("Investiture", `${2 + Math.max(cur.awa, cur.pre)}*`)}
    ${cell("Phys def", 10 + cur.str + cur.spd)} ${cell("Cog def", 10 + cur.int + cur.wil)} ${cell("Spi def", 10 + cur.awa + cur.pre)}
    ${cell("Move", `${edhaWalkRateFtFromSpd(cur.spd)} ft`)} ${cell("Recovery", DICE[idx(cur.wil)])} ${cell("Senses", edhaCwSensesCell(cur.awa))}
    <span style="flex-basis:100%;font-size:.85em;opacity:.65;text-align:center">Live at this spread — path/item bonuses land on top. *Investiture needs a leyline attunement.</span>
  </div>`;
}

// Shared −/value/+ editor dialog: rows = [{key, label, note, info}] or {header} section titles;
// get/set via cur, cap per row. `info` renders as a small explainer under the label (bench
// take-two: "what does each one do? … write a blurb for each"); `preview(cur)` renders a live
// panel above the rows, refreshed on every click (take-five: the derived-stat preview).
async function edhaCwStepperDialog(DV2, { title, intro, rows, cur, budget, capFor, preview }) {
  const statRows = rows.filter(r => !r.header);
  const rowHtml = (r) => r.header
    ? `<h4 style="margin:8px 0 2px 0;border-bottom:1px solid rgba(255,255,255,.25)">${escCw(r.header)}</h4>`
    : `<div class="edha-cw-stat" data-key="${escCw(r.key)}" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0">
      <span style="flex:1">${escCw(r.label)}${r.note ? ` <em style="opacity:.65">(${escCw(r.note)})</em>` : ""}${r.info ? `<span style="display:block;font-size:.85em;opacity:.72;line-height:1.3">${escCw(r.info)}</span>` : ""}</span>
      <button type="button" class="edha-cw-dec" style="width:26px">−</button>
      <strong class="edha-cw-val" style="width:22px;text-align:center"></strong>
      <button type="button" class="edha-cw-inc" style="width:26px">+</button>
    </div>`;
  const content = `<p>${intro}</p><p class="edha-cw-count"></p><div class="edha-cw-stats"></div><div style="max-height:42vh;overflow:auto">${rows.map(rowHtml).join("")}</div>`;
  return DV2.wait({
    window: { title }, content, rejectClose: false, position: { width: 470 },
    render: (ev, dlg) => { try {
      const rootEl = dlg?.element instanceof HTMLElement ? dlg.element : (dlg instanceof HTMLElement ? dlg : (dlg?.[0] ?? null));
      if (!rootEl) return;
      const count = rootEl.querySelector(".edha-cw-count");
      const statsEl = rootEl.querySelector(".edha-cw-stats");
      const upd = () => {
        const spent = statRows.reduce((s, r) => s + (Number(cur[r.key]) || 0), 0);
        if (count) count.innerHTML = `Spent: <strong>${spent} of ${budget}</strong>${spent > budget ? " — over budget (GM call)" : ""}`;
        if (preview && statsEl) { try { statsEl.innerHTML = preview(cur); } catch (e) { /* preview is best-effort */ } }
        rootEl.querySelectorAll(".edha-cw-stat").forEach(rw => {
          const k = rw.dataset.key;
          rw.querySelector(".edha-cw-val").textContent = cur[k];
          rw.querySelector(".edha-cw-dec").disabled = cur[k] <= 0;
          rw.querySelector(".edha-cw-inc").disabled = spent >= budget || cur[k] >= capFor(k);
        });
      };
      rootEl.querySelectorAll(".edha-cw-stat").forEach(rw => {
        const k = rw.dataset.key;
        rw.querySelector(".edha-cw-dec").addEventListener("click", () => { cur[k] = Math.max(0, cur[k] - 1); upd(); });
        rw.querySelector(".edha-cw-inc").addEventListener("click", () => { cur[k] += 1; upd(); });
      });
      upd();
    } catch (e) { /* editor is best-effort */ } },
    buttons: [{ action: "back", label: "◀ Back" }, { action: "next", label: "Next ▶", default: true }],
  });
}

// What each attribute actually feeds, read off the real wiring (bench take-two: "write a blurb
// for each — make it accurate"): defenses are the system's 10+pair formulas; max Health adds STR
// on level gains (deriveMaxHealth); Focus max = 2+WIL and the Recovery die steps with WIL (both
// system-derived); movement rate derives from SPD (edhaWalkRateFtFromSpd — the EDHA 20+5×SPD
// formula, which replaces the system's ladder on the sheet); Senses Range derives from AWA on the
// SYSTEM's own ladder (edhaSensesRangeFtFromAwa, R-56 reversed at item 83 — the engine no longer
// overrides the sheet's number at all); Investiture 2 + max(AWA, PRE) is the Edha rule. The
// skill list per attribute is built LIVE from CONFIG.COSMERE.skills, so it stays accurate.
const EDHA_CW_ATTR_STAT = {
  str: "Physical defense (10+STR+SPD) · max Health (each level's gain adds STR) · carry/lift capacity",
  spd: "Physical defense (10+STR+SPD) · movement speed",
  int: "Cognitive defense (10+INT+WIL)",
  wil: "Cognitive defense (10+INT+WIL) · max Focus (2+WIL) · Recovery die (steps up with WIL)",
  awa: "Spiritual defense (10+AWA+PRE) · Senses Range (token sight) · Investiture (2 + higher of AWA/PRE)",
  pre: "Spiritual defense (10+AWA+PRE) · Investiture (2 + higher of AWA/PRE)",
};
function edhaCwAttrInfo(a) {
  const skills = Object.entries(CONFIG.COSMERE?.skills ?? {})
    .filter(([, s]) => s?.attribute === a)
    .map(([id, s]) => { try { return game.i18n.localize(s.label ?? id); } catch (e) { return id; } });
  return `${EDHA_CW_ATTR_STAT[a] ?? ""}. Skills: ${skills.join(", ") || "—"}.`;
}

async function edhaCreatorAttrStep(actor, DV2) {
  const level = Math.max(1, Number(actor.system?.level) || 1);
  const budget = edhaCwAttrBudget(level);
  const cap = level === 1 ? 3 : 99;
  const cur = {};
  for (const a of EDHA_CW_ATTRS) cur[a] = Math.max(0, Number(actor.system?.attributes?.[a]?.value) || 0);
  const label = (a) => { try { return game.i18n.localize(CONFIG.COSMERE?.attributes?.[a]?.label ?? a); } catch (e) { return a; } };
  const res = await edhaCwStepperDialog(DV2, {
    title: "Character Creation — attributes",
    intro: `Assign your <strong>attribute points</strong>: ${budget} at level ${level}${level === 1 ? " (max 3 in any one attribute at level 1)" : ""}. Path and item bonuses land on top of what you set here.`,
    rows: EDHA_CW_ATTRS.map(a => ({ key: a, label: label(a), info: edhaCwAttrInfo(a) })), cur, budget, capFor: () => cap,
    preview: (c) => edhaCwDerivedPreview(actor, c),
  });
  if (res === "back") return "back";
  if (res !== "next") return "close";
  const patch = {};
  for (const a of EDHA_CW_ATTRS) if (cur[a] !== (Number(actor.system?.attributes?.[a]?.value) || 0)) patch[`system.attributes.${a}.value`] = cur[a];
  if (Object.keys(patch).length) await actor.update(patch);
  return "next";
}

async function edhaCreatorSkillStep(actor, DV2) {
  const level = Math.max(1, Number(actor.system?.level) || 1);
  const budget = edhaCwSkillBudget(level);
  const maxRank = edhaCwMaxSkillRank(level);
  const cfgSkills = CONFIG.COSMERE?.skills ?? {};
  const label = (id) => { try { return game.i18n.localize(cfgSkills[id]?.label ?? id); } catch (e) { return id; } };
  const ids = Object.keys(cfgSkills)
    .filter(id => cfgSkills[id]?.core || actor.system?.skills?.[id]?.unlocked === true)   // Edha registers the 5 leyline colors CORE (always rankable) — they're just here
    .sort((x, y) => label(x).localeCompare(label(y)));
  const cur = {};
  for (const id of ids) cur[id] = Math.max(0, Number(actor.system?.skills?.[id]?.rank) || 0);
  // Grouped Physical / Cognitive / Spiritual, mirroring the sheet's layout (bench take-two).
  const groupDefs = [
    { key: "phy", fallback: "Physical", attrs: ["str", "spd"] },
    { key: "cog", fallback: "Cognitive", attrs: ["int", "wil"] },
    { key: "spi", fallback: "Spiritual", attrs: ["awa", "pre"] },
  ];
  const rows = [];
  const used = new Set();
  for (const g of groupDefs) {
    let title = g.fallback;
    try { title = game.i18n.localize(CONFIG.COSMERE?.attributeGroups?.[g.key]?.label ?? g.fallback); } catch (e) { /* fallback stands */ }
    const members = ids.filter(id => g.attrs.includes(cfgSkills[id]?.attribute));
    if (!members.length) continue;
    rows.push({ header: title });
    for (const id of members) { rows.push({ key: id, label: label(id), note: cfgSkills[id]?.attribute ?? "" }); used.add(id); }
  }
  const leftovers = ids.filter(id => !used.has(id));
  if (leftovers.length) { rows.push({ header: "Other" }); for (const id of leftovers) rows.push({ key: id, label: label(id), note: cfgSkills[id]?.attribute ?? "" }); }
  const res = await edhaCwStepperDialog(DV2, {
    title: "Character Creation — skill ranks",
    intro: `Assign your <strong>skill ranks</strong>: ${budget} total at level ${level}${level === 1 ? " (that's 4 free + 1 your heroic path accounts for — a rank the path already granted shows as spent)" : ""}, max rank <strong>${maxRank}</strong> per skill, one shared pool. The five leyline colors are ordinary rankable skills (listed under their attribute); deity paths add NO skill — deity talents test with leyline colors.`,
    rows, cur, budget, capFor: () => maxRank,
  });
  if (res === "back") return "back";
  if (res !== "next") return "close";
  const patch = {};
  for (const id of ids) if (cur[id] !== (Number(actor.system?.skills?.[id]?.rank) || 0)) patch[`system.skills.${id}.rank`] = cur[id];
  if (Object.keys(patch).length) await actor.update(patch);
  return "next";
}

async function edhaCreatorBudgetStep(actor, DV2) {
  const s = edhaCreationState(actor);
  const trees = [s.heroic, s.leyline, s.deity].filter(Boolean);
  const line = () => { const st = edhaCreationState(actor); return `Talents: <strong>${st.talents} of ${st.allowed}</strong> (level ${st.level})`; };
  const content = `
    <p>Spend the rest of your talent budget — at level 1 that's <strong>one more talent in each of
    your two trees</strong> (the two Keys already count). The sheet enforces the cap; WHICH nodes
    you take is yours.</p>
    <p class="edha-cw-count">${line()}</p>
    <p>${trees.map(p => `<button type="button" class="edha-cw-open" data-item-id="${p.id}">Open the ${escCw(p.name)} tree</button>`).join(" ")}</p>
    <p class="notes">Click a node in the tree to take it — this window updates as you pick.</p>`;
  let hookC = null, hookD = null;
  const res = await DV2.wait({
    window: { title: "Character Creation — spend your talents" }, content, rejectClose: false, position: { width: 560 },
    render: (ev, dlg) => { try {
      const rootEl = dlg?.element instanceof HTMLElement ? dlg.element : (dlg instanceof HTMLElement ? dlg : (dlg?.[0] ?? null));
      if (!rootEl) return;
      rootEl.querySelectorAll(".edha-cw-open").forEach(b => b.addEventListener("click", () => {
        // Open the ACTOR'S OWN path item sheet on its talents tab — that tree view is bound to
        // the actor and clickable. The compendium tree doc (the old target) renders UNBOUND:
        // "there's nothing here for me to select" (bench 07-19).
        const p = actor.items.get(b.dataset.itemId);
        if (!p?.sheet) { ui.notifications?.warn("Edha: path not found on the actor — open it from the sheet's paths tab."); return; }
        DV2.hold?.();   // deliberate open — never yank the wizard back over the tree
        if (p.sheet.rendered) { try { p.sheet.changeTab?.("talents", "primary"); } catch (e) { /* older sheet */ } p.sheet.bringToFront?.(); }
        else void p.sheet.render({ force: true, tab: "talents" });
      }));
      const node = rootEl.querySelector(".edha-cw-count");
      const upd = (item) => { if (item?.parent === actor && node?.isConnected) node.innerHTML = line(); };
      hookC = Hooks.on("createItem", upd); hookD = Hooks.on("deleteItem", upd);
    } catch (e) { /* live counter is best-effort */ } },
    buttons: [{ action: "back", label: "◀ Back" }, { action: "next", label: "Next ▶", default: true }],
  });
  if (hookC) Hooks.off("createItem", hookC);
  if (hookD) Hooks.off("deleteItem", hookD);
  if (res === "back") return "back";
  if (res !== "next") return "close";
  const st = edhaCreationState(actor);
  if (st.talents < st.allowed) {
    const left = st.allowed - st.talents;
    const go = await DV2.confirm({ window: { title: "Talents left to pick" }, rejectClose: false,
      content: `<p>You still have <strong>${left}</strong> talent pick${left === 1 ? "" : "s"} available. You can take them any time from the trees — continue to naming?</p>` });
    if (!go) return "again";
  }
  return "next";
}

async function edhaCreatorNameStep(actor, DV2) {
  const s = edhaCreationState(actor);
  const cultureHtml = s.culture?.system?.description?.value
    ? `<div class="edha-cw-preview" style="max-height:260px;overflow:auto;border:1px solid rgba(255,255,255,.18);border-radius:3px;padding:6px;margin-top:6px">${await edhaCwEnrich(s.culture.system.description.value)}</div>`
    : `<p class="notes">No culture item yet — naming customs live on the culture cards.</p>`;
  const r = await DV2.wait({
    window: { title: "Character Creation — purse & name" }, rejectClose: false, position: { width: 560 },
    content: `<p>Last step. Your starting purse (<strong>5 silver</strong>) came with the kit — the
      primer's nation pages say what FORM your people carry money in. Pick your name; your nation's
      naming customs are on the card below (the <em>Names</em> and <em>You might be</em> lines).</p>
      <p><label>Name: <input type="text" name="edhaName" class="edha-cw-input" value="${escCw(actor.name)}"></label></p>
      ${cultureHtml}`,
    buttons: [
      { action: "back", label: "◀ Back" },
      { action: "finish", label: "Finish ✔", default: true, callback: (ev, btn) => btn.form?.elements?.edhaName?.value ?? "" },
    ],
  });
  if (r === "back") return "back";
  if (r === null || r === undefined) return "close";
  const name = String(r || "").trim();
  if (name && name !== actor.name) await actor.update({ name, "prototypeToken.name": name });
  // Finish = a silent long rest (Ben 07-19): attributes were assigned AFTER creation, so max
  // health/focus grew while current stayed at the creation values — rest tops everything up.
  try { await actor.longRest?.({ dialog: false }); } catch (e) { console.warn("Edha Content | finish-step long rest failed", e); }
  // Belt (bench: 10/11 after the rest — a max-health AE bonus can settle AFTER longRest reads
  // max.value): re-read the maxes a beat later and top up whatever lags. Also fills
  // Investiture, which the system's long rest doesn't touch.
  try {
    await new Promise(res => setTimeout(res, 200));
    const patch = {};
    for (const key of ["hea", "foc", "inv"]) {
      const r2 = actor.system?.resources?.[key];
      const max = Number(r2?.max?.value);
      if (r2 && Number.isFinite(max) && Number(r2.value) !== max) patch[`system.resources.${key}.value`] = max;
    }
    if (Object.keys(patch).length) await actor.update(patch);
  } catch (e) { console.warn("Edha Content | finish-step top-up failed", e); }
  const done = edhaCreationState(actor);
  const faith = !done.deity ? (actor.getFlag?.("edha-content", "faith") ?? null) : null;
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧭 <strong>${escCw(actor.name)}</strong> is made: ${done.culture ? escCw(done.culture.name) : "no nation"} · ${done.heroic ? escCw(done.heroic.name) : "no heroic path"} · ${done.leyline ? `${escCw(done.leyline.name)} attuned` : "unattuned"}${done.deity ? ` · ${escCw(done.deity.name)}` : (faith ? ` · faith: ${escCw(faith)} (unattuned)` : "")} · ${done.talents}/${done.allowed} talents (level ${done.level}).${done.talents < done.allowed ? " Talent picks remain — take them from the trees." : ""}</p>` });
  return "done";
}

async function edhaCreationWizard(actorArg) {
  const actor = edhaResolveActorArg(actorArg);
  if (!actor || actor.type !== "character") { ui.notifications?.warn("Edha: the creation wizard needs a character actor (select a token or pass one)."); return; }
  if (!actor.isOwner) { ui.notifications?.warn(`Edha: you don't own ${actor.name}.`); return; }
  const DV2 = foundry.applications?.api?.DialogV2;
  if (!DV2) { ui.notifications?.warn("Edha: DialogV2 unavailable — Foundry too old for the wizard."); return; }
  const steps = [
    edhaCreatorWelcomeStep,
    (a, d) => edhaCreatorPickStep(a, d, "culture"),
    (a, d) => edhaCreatorPickStep(a, d, "heroic"),
    (a, d) => edhaCreatorPickStep(a, d, "leyline"),
    (a, d) => edhaCreatorPickStep(a, d, "deity"),
    edhaCreatorAttrStep,
    edhaCreatorSkillStep,
    edhaCreatorBudgetStep,
    edhaCreatorNameStep,
  ];
  const wins = (globalThis.edhaCreatorWindows ??= new Set());   // per-actor Key windows (07-19b: several may be open at once)
  if (wins.has(actor.id)) { ui.notifications?.info(`Edha: a creation wizard is already open for ${actor.name}.`); return; }
  wins.add(actor.id);
  const DV2w = edhaCreatorDialogs(DV2);   // keep-on-top guard (07-19 z-order fixes)
  try {
    let i = 0;
    while (i >= 0 && i < steps.length) {
      const r = await steps[i](actor, DV2w);
      if (r === "back") i = Math.max(0, i - 1);
      else if (r === "next") i += 1;
      else if (r === "again") continue;
      else break;   // "close" | "done"
    }
  } catch (e) { console.error("Edha Content | creation wizard failed", e); }
  finally { globalThis.edhaCreatorWindows?.delete?.(actor.id); DV2w.off(); }
}
async function edhaCreatorNewCharacter() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: GM only — players run the wizard from their own sheet."); return null; }
  // Land every wizard-made PC in ONE sidebar folder (bench 07-19: Ben expects "Edha PCs").
  let folder = game.folders?.find(f => f.type === "Actor" && f.name === "Edha PCs") ?? null;
  if (!folder) folder = await Folder.create({ name: "Edha PCs", type: "Actor" }).catch(() => null);
  const actor = await Actor.create({ name: "New Character", type: "character", folder: folder?.id ?? null });   // preCreateActor stamps the PC token defaults
  if (!actor) return null;
  await edhaGrantBasicActions(actor);   // Strike & co. from cosmere-rpg.actions (welcome step re-checks for player-made actors)
  try { await actor.sheet?.render(true); } catch (e) { /* sheet render is cosmetic here */ }   // finish BEFORE the wizard so the wizard stacks above (07-19: it opened behind)
  await edhaCreationWizard(actor);
  return actor;
}
// GM: "＋ Edha Character" in the Actors sidebar footer (below the adversary bulk-sync button).
Hooks.on("renderActorDirectory", (app, element) => {
  try {
    if (!game.user?.isGM) return;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    if (!root || root.querySelector(".edha-new-char-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn edha-new-char-btn";
    btn.textContent = "＋ Edha Character";
    btn.title = "Create a new character actor and walk it through Edha character creation (country → path + kit → attunement → talents → name).";
    btn.addEventListener("click", (ev) => { ev.preventDefault(); void edhaCreatorNewCharacter(); });
    (root.querySelector(".directory-footer") ?? root).append(btn);
  } catch (e) { console.error("Edha Content | new-character button failed", e); }
});
// Players/GM: a wizard bar under the PC sheet header (same ghost-button spec as the adversary bar).
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const rs = edhaSheetRoot(app, element); if (!rs || !rs.actor.isOwner) return;
    const { root, actor } = rs;
    root.querySelectorAll(".edha-creator-bar").forEach(n => n.remove());   // idempotent re-render
    const s = edhaCreationState(actor);
    const bar = document.createElement("div");
    bar.className = "edha-creator-bar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn";
    btn.textContent = s.complete ? "⟲ Redo Creation…" : "🧭 Character Creation";
    btn.title = s.complete
      ? "Re-run the creation walkthrough (its first page offers a level-1 start-over)."
      : "Guided character creation: country → heroic path + kit → leyline attunement → talents → name.";
    btn.addEventListener("click", () => void edhaCreationWizard(actor));
    bar.append(btn);
    const sheetHeader = root.querySelector(".sheet-header");
    if (sheetHeader) sheetHeader.after(bar);
    else (root.querySelector(".sheet-content") ?? root).prepend(bar);
  } catch (e) { console.error("Edha Content | creation-wizard button failed", e); }
});

