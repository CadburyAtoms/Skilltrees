/* ============================================================================================
 * SHEET QoL — three independent character-sheet decorators plus the budget rows, grouped here
 * because they all hang off renderCharacterSheet (via edhaSheetRoot) and none of them is a game
 * mechanic. Purely presentational: nothing in this section writes a rule, a status, or damage.
 *   • Culture in the ancestry slot + the g/s/c coin editor (2026-07-19s) — the Ledger Standard
 *     currency from the SHARED CORE, made editable where a player expects to find it.
 *   • Readable-Dark (2026-07-12c design handoff, engine side) — the CSS injected at `init`.
 *   • The budget rows — the spent/granted readout for the talent budget enforced far above.
 *   • A createItem watcher that refreshes the readout when a talent lands on the sheet.
 * Owns: edhaBudgetRow + four renderCharacterSheet decorators, one `init` (stylesheet) and the
 *   createItem refresh.
 * ============================================================================================ */

/* --- Sheet QoL: culture in the ancestry slot + the g/s/c coin editor (2026-07-19s) --------------
 * 1. The header's ancestry line renders `ancestryItem?.name ?? "Ancestry"` — an Edha PC usually
 *    has a CULTURE and no ancestry, so the header read as a bare placeholder (bench 07-19).
 *    When there's a culture and no ancestry, the line shows the culture's name instead.
 * 2. The system's currency-list component is READ-ONLY totals (currency-list.hbs) — the long-
 *    gated "one uneditable field / no denominations / spheres still shows" fix (bench 07-18
 *    rows 9–11, unblocked by the items dump's DataModel capture): the Roshar "spheres" chip is
 *    hidden on every list, and the equipment tab's list gains three editable gold/silver/copper
 *    inputs writing system.currency.edha.denominations. */
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const rs = edhaSheetRoot(app, element); if (!rs) return;
    const { root, actor } = rs;
    // 1 — culture name where the "Ancestry" placeholder sat.
    if (!actor.items.some(i => i.type === "ancestry")) {
      const cult = actor.items.find(i => i.type === "culture");
      const chip = root.querySelector(".sheet-header span.ancestry, span.ancestry");
      if (cult && chip) { chip.textContent = cult.name; chip.setAttribute("data-tooltip", "Culture — the ancestry slot is optional (drag Human from Edha Items if wanted)"); }
    }
    // 2 — coins.
    const UNIT = { gold: "g", silver: "s", copper: "c" };
    const RATE = { gold: 100, silver: 10, copper: 1 };
    const dens = actor._source?.system?.currency?.edha?.denominations ?? [];
    const copperTotal = dens.reduce((s, d) => s + (Number(d?.amount) || 0) * (RATE[d?.id] ?? 0), 0);
    for (const list of root.querySelectorAll(".currency-list")) {
      // The native widget COLLAPSES its input until hover/focus (it's a compact header
      // component) — injecting inside it made the numbers invisible and the labels vanish on
      // click (bench 07-19 pics). On the equipment tab the whole native list is hidden and OUR
      // row (total pill + always-visible g/s/c editors) renders AFTER it; the header keeps the
      // compact native chip, with its lying derived-0 total overwritten by the real copper sum.
      const isEquip = !!list.closest('[data-tab="equipment"]');
      list.querySelectorAll(".currency").forEach(c => {
        const tip = (c.getAttribute("data-tooltip") || "").toLowerCase();
        if (tip.includes("sphere") || isEquip) { c.style.display = "none"; return; }   // spheres never; equipment tab = our row instead
        const inp0 = c.querySelector("input[name=currency]");
        if (inp0) { inp0.value = String(copperTotal); c.setAttribute("data-tooltip", "Total in copper (g=100, s=10)"); }
      });
      if (!isEquip) continue;
      if (list.nextElementSibling?.classList?.contains("edha-coin-row")) continue;   // idempotent re-render
      const row = document.createElement("div");
      row.className = "edha-coin-row";
      const totalEl = document.createElement("span");
      totalEl.className = "edha-coin ec-total";
      totalEl.setAttribute("data-tooltip", "Total in copper (g=100, s=10)");
      totalEl.innerHTML = `<span class="ec-tag">🪙</span><span class="ec-val">${copperTotal} c</span>`;
      row.appendChild(totalEl);
      for (const id of ["gold", "silver", "copper"]) {
        const d = dens.find(x => x.id === id);
        const lab = document.createElement("label");
        lab.className = `edha-coin ec-${id}`;
        lab.setAttribute("data-tooltip", id[0].toUpperCase() + id.slice(1));
        const tag = document.createElement("span");
        tag.className = "ec-tag";
        tag.textContent = UNIT[id];
        const inp = document.createElement("input");
        inp.type = "number"; inp.min = "0"; inp.step = "1"; inp.value = String(Number(d?.amount) || 0);
        inp.addEventListener("change", async () => {
          try {
            const cur = foundry.utils.deepClone(actor._source?.system?.currency?.edha?.denominations ?? []);
            let e = cur.find(x => x.id === id);
            if (!e) { e = { id, amount: 0 }; cur.push(e); }
            e.amount = Math.max(0, Math.floor(Number(inp.value) || 0));
            await actor.update({ "system.currency.edha.denominations": cur });   // the sheet re-renders → the total pill refreshes
          } catch (e2) { console.warn("Edha | coin write failed", e2); }
        });
        lab.append(tag, inp);
        row.appendChild(lab);
      }
      list.after(row);
    }
  } catch (e) { console.error("Edha Content | sheet QoL (culture chip / coins) failed", e); }
});

/* --- Readable-Dark sheet QoL (2026-07-12c design handoff, engine side) --------------------------
 * The palette itself is pure CSS (styles/edha.css). Two behaviors need the engine:
 *  1. Height clamp relax — the system's CharacterSheet clamps resize to MAX_HEIGHT 900 (and pins
 *     width via MIN=MAX 800; width stays pinned — the two-column layout is designed for it). We lift
 *     MAX_HEIGHT on the real class at first render so the window drags taller; the edha.css
 *     `.sheet-content { flex:1 }` rule makes the content column fill the extra height.
 *  2. Optional per-user sheet scale (90–130%, default 100) — CSS zoom on the window content, for
 *     players who want everything bigger independent of the palette. Client-scoped setting.
 */
Hooks.once("init", () => {
  try {
    game.settings.register("edha-content", "sheetScale", {
      name: "Actor sheet scale (%)",
      hint: "Uniform zoom on the character sheet content, per user. 100 = default size.",
      scope: "client", config: true, type: Number,
      range: { min: 90, max: 130, step: 5 }, default: 100,
      onChange: () => { try { for (const app of foundry.applications.instances.values()) if (app?.actor?.type === "character") app.render(); } catch (e) {} },
    });
  } catch (e) { console.error("Edha Content | sheetScale setting registration failed", e); }
});
Hooks.on("renderCharacterSheet", (app) => {
  try {
    const cls = app?.constructor;
    const k = (Number(game.settings.get("edha-content", "sheetScale")) || 100) / 100;
    // CSS zoom shrinks the LOGICAL viewport: at 130% the pinned 800-px frame leaves ~615 logical px
    // and the sheet spills out the bottom (Ben's 07-12 "Outlaw sheet scale 130" capture). Scale the
    // system's frame pins (class statics read in _onPosition) by k so the zoomed content keeps its
    // designed 800-px logical layout, and resize the window whenever the applied scale changes.
    if (cls) {
      if (Number.isFinite(cls.MIN_WIDTH)) cls.MIN_WIDTH = Math.round(800 * k);
      if (Number.isFinite(cls.MAX_WIDTH)) cls.MAX_WIDTH = Math.round(800 * k);
      if (Number.isFinite(cls.MIN_HEIGHT)) cls.MIN_HEIGHT = Math.round(728 * k);
      if (Number.isFinite(cls.MAX_HEIGHT) && cls.MAX_HEIGHT < 4000) cls.MAX_HEIGHT = 4000;   // was 900
    }
    const wc = app?.element?.querySelector?.(".window-content");
    if (wc) wc.style.zoom = k === 1 ? "" : String(k);
    const prev = app._edhaSheetScale || 1;
    if (prev !== k) {
      app._edhaSheetScale = k;
      const h = Math.round((app.position?.height || 728) / prev * k);
      app.setPosition({ width: Math.round(800 * k), height: Math.min(h, Math.round((window.innerHeight || 1200) * 0.95)) });
    }
  } catch (e) { /* cosmetic only — never block the sheet render */ }
});

/* R-55 (Ben 2026-09-06 (a)): all three chips read SPENT / total. They used to read REMAINING /
 * total — except that Talents' numerator is the SAME either way on the sheet everyone looked at
 * (2 of 4 taken → 2 remaining), so the strip silently mixed two conventions: a correctly built L1
 * PC showed "Talents 2 / 4" beside "Attr pts 0 / 12", and a 0 next to a fully-spent sheet reads
 * like an error rather than a finished budget. Now 2 / 4, 12 / 12, 5 / 5.
 * The CLASSES stay keyed on what is LEFT — "full" means nothing remains, "over" means overspent —
 * because that is what they colour, and it is unaffected by which number is printed. */
function edhaBudgetRow(label, spent, granted) {
  const rem = granted - spent;
  const cls = rem < 0 ? " edha-budget-over" : rem === 0 ? " edha-budget-full" : "";
  return `<div class="edha-budget-row${cls}"><span class="edha-budget-label">${label}</span><span class="edha-budget-value">${spent} / ${granted}</span></div>`;
}

Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const rs = edhaSheetRoot(app, element); if (!rs) return;
    const { root, actor } = rs;
    root.querySelector(".edha-budget-panel")?.remove();
    const b = edhaGetBudget(actor);
    const thp = edhaGetTempHp(actor);
    const reserve = edhaGetReserve(actor), reserveCap = edhaReserveCap(actor);
    const panel = document.createElement("div");
    panel.className = "edha-budget-panel";
    panel.title = "Budget spent (spent / total) — Talents | Attribute points | Skill ranks";
    panel.innerHTML =
      (thp ? `<div class="edha-budget-row edha-thp" title="Temporary HP (${thp.source || "—"}) — absorbed before normal HP; cannot be healed, only replaced"><span class="edha-budget-label">Temp HP</span><span class="edha-budget-value">${thp.value}</span></div>` : "") +
      edhaBudgetRow("Talents",    b.talentSpent, b.talentGranted) +
      edhaBudgetRow("Attr pts",   b.attrSpent,   b.attrGranted)   +
      edhaBudgetRow("Skill rnks", b.skillSpent,  b.skillGranted);
    // G: one-click "Sync Talents" — re-pull roll data from the packs onto this actor's talents
    // (fixes stale snapshots after a content rebuild). Lives in the budget bar so it's always visible.
    const syncBtn = document.createElement("button");
    syncBtn.type = "button";
    syncBtn.className = "edha-sync-btn";
    syncBtn.title = "Re-sync this character's Edha talents from the compendium packs (fixes stale rolls after a content rebuild).";
    syncBtn.textContent = "⟳ Sync Talents";
    syncBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      Promise.resolve(edhaSyncNow(actor)).then((r) => { if (r) app.render(false); });
    });
    panel.appendChild(syncBtn);
    // Insert as a slim bar between the sheet header and the main content — always visible.
    const sheetHeader = root.querySelector(".sheet-header");
    if (sheetHeader) sheetHeader.after(panel);
    else root.querySelector(".sheet-content")?.before(panel);

    // Reserve readout beside the resource bars (Ben 07-05: it used to sit in the budget bar next to
    // talent/skill/attr points; it belongs with Investiture/Focus/Health). Spending happens through the
    // "Pay from Reserve" option in the Spend-Investiture dialog / the ritual-HP Double Dip prompt.
    root.querySelector(".edha-reserve-bar")?.remove();
    if (reserveCap > 0 && edhaActorRuleOf(actor, "edha-reserve-bank")) {   // rule-keyed (2bZ)
      const invRes = root.querySelector(".resource.inv");
      if (invRes) {
        const rbar = document.createElement("div");
        rbar.className = "edha-reserve-bar";
        rbar.title = "Reserve (Sanguine Reservoir) — banked from ritual HP paid (cap = ranks in Black). Spend it in place of Investiture via the Spend-Investiture dialog, or in place of ritual HP vs a Double-Dipped target.";
        // Readable Dark (07-12 design handoff): pill lifted from near-black red to the spec values.
        rbar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:2px 8px;margin:2px 0;border:1px solid rgba(160,80,80,0.6);border-radius:4px;background:rgba(122,47,47,0.28);color:#d8cfb6;font-size:0.9em;";
        rbar.innerHTML = `<span style="opacity:.9">🩸 Reserve</span><span><strong>${reserve}</strong> / ${reserveCap}</span>`;
        invRes.after(rbar);
      }
    }

    // Ritual HP costs in the Actions tab's cost column (Ben 07-05: Withering Ray's HP price was only in
    // the description). Display-only — the deduction itself stays on the talent's edha-ritual-hp-cost
    // event; consume entries can't carry a die formula, so this paints the label into the consume cell.
    try {
      for (const row of root.querySelectorAll(".item[data-item-id]")) {
        const it = actor.items.get(row.dataset.itemId);
        const hpRule = it && edhaIsTalent(it) ? edhaRuleOf(it, "edha-ritual-hp-cost") : null;
        if (!hpRule) continue;
        const cell = row.querySelector(".detail.wide");
        if (!cell || cell.querySelector(".edha-hp-cost")) continue;
        const f = String(hpRule.formula || "");
        // Resolve against THIS actor so the cell shows the real price (Ben 07-12: "[DIE] is not
        // calculated to be the actor's black die") — "½d8 HP" / "2 HP", not the template.
        let label = /floor\(\(1d/.test(f) ? "½[Die] HP" : f === "@tier" ? "[Tier] HP" : "HP";
        try {
          const folded = edhaFoldDieMath(Roll.replaceFormulaData(f, actor.getRollData(), { missing: "0" }));
          const half = folded.match(/^floor\(\((\d*d\d+)\)\s*\/\s*2\)$/);
          if (half) label = `½${half[1]} HP`;
          else if (/^\d+(\.\d+)?$/.test(folded)) label = `${Math.floor(Number(folded))} HP`;
          else if (/^\d*d\d+$/.test(folded)) label = `${folded} HP`;
        } catch (e) { /* keep the template label */ }
        const span = document.createElement("span");
        span.className = "edha-hp-cost";
        span.title = hpRule.note || "This talent costs health on use (auto-deducted).";
        span.style.cssText = "color:#c66;white-space:nowrap;";
        const existing = cell.textContent?.trim();
        span.textContent = (existing && existing !== "—" ? " + " : "") + label;
        if (!existing || existing === "—") { const dash = cell.querySelector("span"); if (dash && dash.textContent.trim() === "—") dash.remove(); }
        cell.appendChild(span);
      }
    } catch (e) { console.error("Edha Content | HP-cost column paint failed", e); }

    // K: overlay a cyan Temp HP bar on the green Health bar (clipped to the bar shape by .inner's mask).
    const healthInner = root.querySelector(".resource.hea .bar .container .inner") || root.querySelector(".resource.hea .inner");
    if (healthInner) {
      healthInner.querySelector(".edha-thp-bar")?.remove();
      if (thp) {
        const heaMax = actor.system?.resources?.hea?.max;
        const maxHp = (heaMax && typeof heaMax === "object" ? heaMax.value : heaMax) || 0;
        if (maxHp > 0) {
          const pct = Math.min(100, (thp.value / maxHp) * 100);
          const tbar = document.createElement("div");
          tbar.className = "edha-thp-bar";
          tbar.style.width = pct + "%";
          tbar.title = `Temp HP: ${thp.value} (absorbed before normal HP)`;
          healthInner.appendChild(tbar);
        }
      }
    }
  } catch (e) {
    console.error("Edha Content | budget panel failed", e);
  }
});

/* When an Edha path is added to a character, open its tree (the path sheet's Talents tab) so the
 * player can immediately pick a talent. The Key talent is granted separately by the path's own
 * add-to-actor event. Only the user who created it opens the window. */
Hooks.on("createItem", (item, options, userId) => {
  try {
    if (game.user?.id !== userId) return;
    if (item?.type !== "path" || item.parent?.type !== "character") return;
    if (!["heroic", "leyline", "deity"].includes(item.system?.type)) return;
    setTimeout(() => { try { item.sheet?.render(true); } catch (e) { /* sheet may be gone */ } }, 150);
  } catch (e) {
    console.error("Edha Content | open-tree-on-drop failed", e);
  }
});

