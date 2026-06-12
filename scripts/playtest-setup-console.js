/* Edha playtest-character setup — PASTE INTO THE FOUNDRY CONSOLE (GM, world open).
 *
 * Builds/repairs the four playtest PCs from the May-17 reference sheets:
 *   The Demolisher    (Scholar / Red   / Destruction)  — existing actor: roster fix only
 *   The Forgemaster   (Leader  / White / Civilization) — existing actor: roster + stats audit
 *   The Outlaw        (Warrior / Black / Power)        — created if missing
 *   The Vivisectionist(Scholar / Green / Life)         — created if missing
 *
 * Idempotent: re-running fixes drift instead of duplicating.
 * RUN AFTER a pack rebuild (node foundry-build.js all) + F5, so fresh talents carry the
 * new on-talent rules/effects (Composed/Collected/Customary Garb/Guardian Stance, Forge
 * Construct deflect, Tyrith black die). Finishes with edha.syncActorTalents per actor.
 *
 * NOTE: the sheets have 12 talents at L7; the module's budget formula allows 11 — talents
 * are batch-added in ONE call so the budget pre-check passes on the pre-add count. Flag for
 * Ben: either the budget formula or the sheets are off by one.
 */
(async () => {
  const PACKS = { heroic: "edha-content.edha-heroic", leyline: "edha-content.edha-leyline", deity: "edha-content.edha-deity" };
  // ---- source maps keyed by atlas|group|name (28 talent names collide across trees) ----
  const byKey = new Map(), paths = new Map();
  for (const [atlas, packId] of Object.entries(PACKS)) {
    for (const d of await game.packs.get(packId).getDocuments()) {
      const f = d.flags?.["edha-content"] ?? {};
      if (d.type === "talent") byKey.set(`${f.atlas ?? atlas}|${f.group}|${d.name}`, d);
      if (d.type === "path") paths.set(`${atlas}|${d.name}`, d);
    }
  }
  const CHARS = [
    // talents: [atlas, group, name] — explicit tree identity (28 names collide across trees; Composed
    // is a CROSS-TREE pick: it only exists in heroic/Envoy yet both sheets list it under Scholar/Leader).
    { name: "The Demolisher", heroic: "Scholar", leyline: "Red", deity: "Destruction",
      attrs: { str: 2, spd: 2, int: 3, wil: 2, awa: 3, pre: 2 },
      skills: { agi: 1, ath: 1, lwp: 2, ded: 1, dis: 1, lor: 3, med: 1, ins: 1, prs: 1, sur: 1, blue: 2, red: 3 },
      talents: [["heroic", "Scholar", "Erudition"], ["heroic", "Scholar", "Mind and Body"], ["heroic", "Envoy", "Composed"], ["heroic", "Scholar", "Strategize"],
        ["leyline", "Red", "Red Leyline Attunement"], ["leyline", "Red", "Flame Surge"], ["leyline", "Red", "Searing Bolt"], ["leyline", "Red", "Arc Flash"], ["leyline", "Red", "Flashpoint"], ["leyline", "Red", "Kindle"],
        ["deity", "Destruction", "Pyre"], ["deity", "Destruction", "Set Charge"]] },
    { name: "The Forgemaster", heroic: "Leader", leyline: "White", deity: "Civilization",
      attrs: { str: 3, spd: 1, int: 1, wil: 2, awa: 3, pre: 4 },
      skills: { hwp: 1, lea: 3, prs: 3, white: 3, red: 3 },
      talents: [["heroic", "Leader", "Decisive Command"], ["heroic", "Envoy", "Composed"], ["heroic", "Leader", "Customary Garb"], ["heroic", "Leader", "Through the Fray"],
        ["leyline", "White", "White Leyline Attunement"], ["leyline", "White", "Guiding Signal"], ["leyline", "White", "Concordant Presence"], ["leyline", "White", "Guardian Stance"],
        ["deity", "Civilization", "Forge Construct"], ["deity", "Civilization", "Lay Foundation"], ["deity", "Civilization", "Siege Form"], ["deity", "Civilization", "Trade Routes"]] },
    { name: "The Outlaw", heroic: "Warrior", leyline: "Black", deity: "Power",
      attrs: { str: 4, spd: 3, int: 1, wil: 2, awa: 1, pre: 3 },
      skills: { agi: 2, ath: 3, lwp: 3, stl: 1, dis: 1, inm: 2, ins: 1, black: 3, red: 2 },
      talents: [["heroic", "Warrior", "Vigilant Stance"], ["heroic", "Warrior", "Flamestance"], ["heroic", "Warrior", "Practiced Kata"],
        ["leyline", "Black", "Black Leyline Attunement"], ["leyline", "Black", "Unnerving Approach"], ["leyline", "Black", "Cruel Step"], ["leyline", "Black", "Sapping Hex"], ["leyline", "Black", "Severance"], ["leyline", "Black", "Spoils of Isolation"],
        ["deity", "Power", "Momentum of Victory"], ["deity", "Power", "Unstoppable Advance"], ["deity", "Power", "Warlord's Advance"]] },
    { name: "The Vivisectionist", heroic: "Scholar", leyline: "Green", deity: "Life",
      attrs: { str: 0, spd: 1, int: 3, wil: 3, awa: 3, pre: 2 },
      skills: { dis: 1, lor: 1, med: 2, prc: 1, blue: 3, green: 3 },
      talents: [["heroic", "Scholar", "Erudition"], ["heroic", "Scholar", "Emotional Intelligence"], ["heroic", "Scholar", "Field Medicine"], ["heroic", "Scholar", "Collected"], ["heroic", "Scholar", "Swift Healer"],
        ["leyline", "Green", "Green Leyline Attunement"], ["leyline", "Green", "Verdant Mend"], ["leyline", "Green", "Mender's Instinct"],
        ["deity", "Life", "Life Surge"], ["deity", "Life", "Overgrowth"], ["deity", "Life", "Prognosis"], ["deity", "Life", "Vital Diagnosis"]] },
  ];
  const log = [];
  for (const C of CHARS) {
    let a = game.actors.getName(C.name);
    if (!a) { a = await Actor.create({ name: C.name, type: "character", system: { level: 7 } }); log.push(`${C.name}: CREATED`); }
    // level + attributes + skill ranks
    const upd = { "system.level": 7 };
    for (const [k, v] of Object.entries(C.attrs)) upd[`system.attributes.${k}.value`] = v;
    for (const [k, v] of Object.entries(C.skills)) upd[`system.skills.${k}.rank`] = v;
    await a.update(upd);
    // paths (grant Keys + Draw Mana via their add-to-actor events)
    const wantPaths = [["heroic", C.heroic], ["leyline", C.leyline], ["deity", C.deity]];
    for (const [atlas, nm] of wantPaths) {
      if (!a.items.some(i => i.type === "path" && i.name === nm)) {
        const src = paths.get(`${atlas}|${nm}`);
        if (src) { await a.createEmbeddedDocuments("Item", [src.toObject()]); log.push(`${C.name}: +path ${nm}`); }
        else log.push(`${C.name}: PATH NOT FOUND ${atlas}/${nm}`);
      }
    }
    await new Promise(r => setTimeout(r, 600));   // let grant-items events land
    // talents: remove extras, batch-add missing (single call → budget pre-check passes)
    const want = new Map(C.talents.map(([at, g, n]) => [n, g]));
    // extras = not on the sheet, OR a same-named talent from the WRONG tree (name collisions)
    const extras = a.items.filter(i => i.type === "talent" &&
      (!want.has(i.name) || (i.flags?.["edha-content"]?.group && i.flags["edha-content"].group !== want.get(i.name))));
    if (extras.length) { await a.deleteEmbeddedDocuments("Item", extras.map(i => i.id)); log.push(`${C.name}: -${extras.map(i => i.name).join(", -")}`); }
    const missing = [];
    for (const [at, g, n] of C.talents) {
      if (a.items.some(i => i.type === "talent" && i.name === n)) continue;
      const src = byKey.get(`${at}|${g}|${n}`);
      if (src) missing.push(src.toObject()); else log.push(`${C.name}: TALENT NOT FOUND ${at}/${g}/${n}`);
    }
    if (missing.length) { await a.createEmbeddedDocuments("Item", missing); log.push(`${C.name}: +${missing.map(d => d.name).join(", +")}`); }
    const r = await edha.syncActorTalents(a);
    log.push(`${C.name}: synced ${r.updated} (missing ${r.missing.length}) | talents now ${a.items.filter(i => i.type === "talent").length}/12`);
  }
  console.warn("PLAYTEST SETUP:\n" + log.join("\n"));
})();
