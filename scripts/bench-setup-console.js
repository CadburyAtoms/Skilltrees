/* Edha BENCH setup — PASTE INTO THE FOUNDRY CONSOLE (GM, world open). 2026-07-26.
 *
 * Builds/repairs the bench roster the restructured checklist's `# BENCH —` sections run on:
 *   16 PCs   — "Bench — <Tree>" for the 5 leyline colors + 10 deity paths (each owning its
 *              WHOLE tree, derived from the compendia at run time, so future authoring is
 *              picked up on re-run), plus "Bench — Heroic" carrying exactly the heroic
 *              talents the surviving bench rows name.
 *   fixtures — hostile target dummies (Isolated / Adjacent A+B / Floater / Undefended) and
 *              two friendly allies, with the skill ranks the `vs: skill` rows roll.
 *   tokens   — placed on the EXISTING "Playtest Map" scene (Ben's ruling 07-26: use the
 *              playtest map, don't create a bench scene). Placement is OFF by default:
 *              view the scene, pick a clear area, set ORIGIN to its top-left pixel and
 *              PLACE_TOKENS = true, then run. RESET_TOKENS re-places existing tokens.
 *
 * Idempotent: re-running repairs drift instead of duplicating; nothing outside the
 * "Edha Bench" folders is ever touched, and the only deletions are embedded items on bench
 * actors. ⚠️ PLAYER CHARACTERS "Tem parinaem" and "Soggy Bottom" are hard-guarded — the
 * script throws before ever writing to them (Ben's ruling 07-26).
 *
 * NOTES
 * - PCs are level 7 (the playtest norm the checklist's expected values were written against).
 *   A whole tree exceeds the level-7 talent budget: the batch add bypasses the pre-check by
 *   design and the sheet's over-budget bar is COSMETIC — not a bug.
 * - Leyline PCs rank 3 in their color; deity PCs rank 3 in ALL five colors (deity trees test
 *   with leyline colors, several with two — a defined Attunement Range everywhere beats
 *   guessing each tree's mix). Everyone gets a mundane-skill spread so contest rows roll.
 * - "Bench Target — Undefended" is ADVERSARY-typed with only a Physical defense written, for
 *   the fail-open rows (2bH-11/2bJ-5/2bF-6). ⚑ If the engine still reads a schema-default
 *   Cognitive/Spiritual value on it, import a pack adversary without those defenses instead.
 * - Weapons: the script tries to hand every PC one melee + one ranged weapon found in the
 *   world's Item compendia; if none exist it says so and you drag weapons on manually
 *   (the on-hit rows need real weapon attacks).
 */
(async () => {
  const PLACE_TOKENS = false;      // view the scene first, then set true with a clear ORIGIN
  const ORIGIN = { x: 200, y: 200 }; // top-left pixel of a clear area on the Playtest Map
  const RESET_TOKENS = false;
  const SCENE_NAME = "Playtest Map";
  const PROTECTED = ["tem parinaem", "soggy bottom"]; // player characters — never write to these
  if (game.world.id !== "edha") return console.error("BENCH SETUP: wrong world:", game.world.id);
  if (!game.user.isGM) return console.error("BENCH SETUP: needs a GM user.");
  const assertNotProtected = (name) => {
    if (PROTECTED.includes(name.toLowerCase())) throw new Error(`BENCH SETUP: refusing to touch player character "${name}"`);
  };
  const log = [];

  // ---- folders ---------------------------------------------------------------------------
  const ensureFolder = async (name, type, parent = null) => {
    let f = game.folders.find(x => x.type === type && x.name === name && (x.folder?.id ?? null) === parent);
    if (!f) { f = await Folder.create({ name, type, folder: parent }); log.push(`+folder ${type}/${name}`); }
    return f;
  };
  const root = await ensureFolder("Edha Bench", "Actor");
  const fPCs = await ensureFolder("Bench PCs", "Actor", root.id);
  const fTgt = await ensureFolder("Bench Targets", "Actor", root.id);
  const benchFolderIds = [root.id, fPCs.id, fTgt.id];
  const inBench = a => benchFolderIds.includes(a.folder?.id);

  // ---- source maps (28 talent names collide across trees — key by atlas|group|name) ------
  const PACKS = { heroic: "edha-content.edha-heroic", leyline: "edha-content.edha-leyline", deity: "edha-content.edha-deity" };
  const byKey = new Map(), byName = new Map(), byGroup = new Map(), paths = new Map();
  for (const [atlas, packId] of Object.entries(PACKS)) {
    const pack = game.packs.get(packId);
    if (!pack) return console.error(`BENCH SETUP: pack missing: ${packId}`);
    for (const d of await pack.getDocuments()) {
      const f = d.flags?.["edha-content"] ?? {};
      if (d.type === "talent") {
        byKey.set(`${f.atlas ?? atlas}|${f.group}|${d.name}`, d);
        if (!byName.has(d.name)) byName.set(d.name, []);
        byName.get(d.name).push(d);
        const gk = `${f.atlas ?? atlas}|${f.group}`;
        if (!byGroup.has(gk)) byGroup.set(gk, []);
        byGroup.get(gk).push(d);
      }
      if (d.type === "path") paths.set(`${atlas}|${d.name}`, d);
    }
  }

  // ---- weapons (one melee + one ranged, from any Item compendium) ------------------------
  let meleeW = null, rangedW = null;
  for (const pack of game.packs.filter(p => p.documentName === "Item")) {
    if (meleeW && rangedW) break;
    for (const d of await pack.getDocuments()) {
      if (d.type !== "weapon") continue;
      const rng = d.system?.range?.value ?? d.system?.range?.long ?? null;
      if (!meleeW && !rng) meleeW = d;
      else if (!rangedW && rng) rangedW = d;
      if (meleeW && rangedW) break;
    }
  }
  if (!meleeW) log.push("⚠ no melee weapon found in any compendium — drag one onto each PC by hand");

  // ---- the roster ------------------------------------------------------------------------
  const MUNDANE = { ath: 2, agi: 2, dis: 2, prc: 2, med: 1, lwp: 2, inm: 2, dec: 2, sur: 2, lea: 2, ins: 1, lor: 1, ded: 1, prs: 1 };
  const COLORS = ["white", "blue", "black", "red", "green"];
  const allColors3 = Object.fromEntries(COLORS.map(c => [c, 3]));
  const LEYLINE = ["White", "Blue", "Black", "Red", "Green"];
  const DEITY = ["Destruction", "Life", "Chaos", "Fate", "Sovereignty", "Death", "Civilization", "Power", "Knowledge", "Order"];
  const PCS = [
    ...LEYLINE.map(t => ({ name: `Bench — ${t}`, atlas: "leyline", tree: t, path: t, skills: { ...MUNDANE, [t.toLowerCase()]: 3 } })),
    ...DEITY.map(t => ({ name: `Bench — ${t}`, atlas: "deity", tree: t, path: t, skills: { ...MUNDANE, ...allColors3 } })),
    { name: "Bench — Heroic", atlas: "heroic", tree: null, path: null,
      skills: { ...MUNDANE, ath: 3, inm: 3, sur: 3, lea: 3, med: 2, lor: 2, prc: 2, dis: 2 },
      names: [
        // Warrior — stances + on-hit riders (2bB, 2bJ-12, on-hit spot)
        "Vigilant Stance", "Stonestance", "Vinestance", "Bloodstance", "Flamestance", "Ironstance",
        "Windstance", "Practiced Kata", "Feinting Strike", "Cheap Shot", "Startling Blow",
        "Shattering Blow", "Subtle Takedown", "Meteoric Leap", "Anatomical Insight",
        // Agent + Scholar — CAE / Opportunity / contests (2bC, 2bD, 2bE, 2bQ-5)
        // (a name that collides across heroic trees is written ["name", "Group"])
        "Fast Talker", "Quick Analysis", "Trickster's Hand", "Cautious Advance", "Backstep",
        ["High Society Contacts", "Agent"], "Underworld Contacts", "Risky Behavior", "Overwhelm with Details",
        "Turning Point", "Vital Diagnosis", "Field Medicine", "Resuscitation",
        // Leader — command dice + contests (2bN, 2bO, 2bD, 2bE-3)
        "Decisive Command", "Confident Command", "Demonstrative Command", "Shrewd Command",
        "Relentless March", "Authority", "Rumormonger", "Well Supplied", "Through the Fray",
        "Valiant Intervention", "Resolute Stand", "Set at Odds", "Grand Deception",
        "Synchronized Assault", "Combat Coordination", "Tactical Ploy",
        // Envoy — Rousing cluster + gates (2bM, 2bF-13/14, 2bE-4)
        "Foresight", "Rousing Presence", "Lessons in Patience", "Instill Confidence",
        "Devoted Presence", "Stalwart Presence", "Rallying Shout", "Steadfast Challenge",
        "Calm Appeal", "Galvanize",
        // Hunter — quarry loop (2bX-15/16/17, 2bZ-11, 2bO-5/7, 2bQ-4, 2bE-5)
        "Sidestep", "Seek Quarry", "Tagging Shot", "Cold Eyes", "Pack Hunting", "Sharp Eye",
        "Wary", "Resilient Hero",
      ] },
  ];

  const ensureActor = async (name, folderId, type = "character", extraSystem = {}) => {
    assertNotProtected(name);
    let a = game.actors.find(x => x.name === name && inBench(x));
    if (!a) {
      a = await Actor.create({ name, type, folder: folderId, system: { level: 7, ...extraSystem } });
      log.push(`${name}: CREATED`);
    }
    return a;
  };

  for (const C of PCS) {
    const a = await ensureActor(C.name, fPCs.id);
    const upd = { "system.level": 7 };
    for (const k of ["str", "spd", "int", "wil", "awa", "pre"]) upd[`system.attributes.${k}.value`] = 2;
    for (const [k, v] of Object.entries(C.skills)) upd[`system.skills.${k}.rank`] = v;
    await a.update(upd);
    if (C.path) {
      if (!a.items.some(i => i.type === "path" && i.name === C.path)) {
        const src = paths.get(`${C.atlas}|${C.path}`);
        if (src) { await a.createEmbeddedDocuments("Item", [src.toObject()]); log.push(`${C.name}: +path ${C.path}`); }
        else log.push(`${C.name}: ⚠ PATH NOT FOUND ${C.atlas}/${C.path}`);
      }
      await new Promise(r => setTimeout(r, 600)); // let the path's grant-items events land
    }
    // wanted talents: the whole tree (by group) or the explicit name list (heroic)
    let wantDocs = [];
    if (C.tree) wantDocs = byGroup.get(`${C.atlas}|${C.tree}`) ?? [];
    else for (const n of C.names) {
      const [nm, grp] = Array.isArray(n) ? n : [n, null];
      const cands = grp ? [byKey.get(`${C.atlas}|${grp}|${nm}`)].filter(Boolean) : (byName.get(nm) ?? []);
      if (cands.length === 1) wantDocs.push(cands[0]);
      else log.push(`${C.name}: ⚠ ${cands.length ? "AMBIGUOUS" : "NOT FOUND"} talent name: ${nm}${grp ? ` (${grp})` : ""}`);
    }
    const wantNames = new Set(wantDocs.map(d => d.name));
    // extras = wrong-tree strays among talents (name collisions), never the path/Draw Mana
    const extras = a.items.filter(i => i.type === "talent" && !wantNames.has(i.name));
    if (extras.length) { await a.deleteEmbeddedDocuments("Item", extras.map(i => i.id)); log.push(`${C.name}: -${extras.length} stray talents`); }
    const missing = wantDocs.filter(d => !a.items.some(i => i.type === "talent" && i.name === d.name)).map(d => d.toObject());
    try {
      globalThis.edha?.skipBudget?.(true);
      if (missing.length) { await a.createEmbeddedDocuments("Item", missing); log.push(`${C.name}: +${missing.length} talents`); }
    } finally { globalThis.edha?.skipBudget?.(false); }
    for (const w of [meleeW, rangedW]) {
      if (w && !a.items.some(i => i.type === "weapon" && i.name === w.name)) await a.createEmbeddedDocuments("Item", [w.toObject()]);
    }
    await new Promise(r => setTimeout(r, 400));
    const r = await edha.syncActorTalents(a);
    log.push(`${C.name}: synced ${r.updated} | talents ${a.items.filter(i => i.type === "talent").length}`);
  }

  // ---- target fixtures -------------------------------------------------------------------
  const TGT = [
    { name: "Bench Target — Isolated", disp: -1 },
    { name: "Bench Target — Adjacent A", disp: -1 },
    { name: "Bench Target — Adjacent B", disp: -1 },
    { name: "Bench Target — Floater", disp: -1 },
    { name: "Bench Ally — One", disp: 1 },
    { name: "Bench Ally — Two", disp: 1 },
  ];
  for (const T of TGT) {
    const a = await ensureActor(T.name, fTgt.id);
    const upd = { "system.level": 5 };
    for (const k of ["str", "spd", "int", "wil", "awa", "pre"]) upd[`system.attributes.${k}.value`] = 2;
    for (const [k, v] of Object.entries({ ath: 2, agi: 2, sur: 2, dis: 1, prc: 1 })) upd[`system.skills.${k}.rank`] = v;
    await a.update(upd);
    await a.update({ "prototypeToken.disposition": T.disp, "prototypeToken.actorLink": true, "prototypeToken.displayBars": 30 });
  }
  { // adversary-typed, Physical defense only — the fail-open dummy
    const a = await ensureActor("Bench Target — Undefended", fTgt.id, "adversary", {});
    await a.update({ "system.tier": 2, "system.defenses.phy.override": 12, "system.defenses.phy.useOverride": true,
                     "system.resources.hea.max.override": 30, "system.resources.hea.max.useOverride": true, "system.resources.hea.value": 30,
                     "prototypeToken.disposition": -1, "prototypeToken.actorLink": true });
  }

  // ---- tokens on the EXISTING playtest scene (never created, never activated) --------------
  const scene = game.scenes.find(s => s.name === SCENE_NAME) ?? game.scenes.find(s => /playtest/i.test(s.name));
  if (!scene) {
    console.warn(`BENCH SETUP: scene "${SCENE_NAME}" not found — tokens not placed.`);
  } else if (!PLACE_TOKENS) {
    log.push(`tokens NOT placed (PLACE_TOKENS=false) — view "${scene.name}", pick a clear area, set ORIGIN, re-run`);
  } else {
    // offsets from ORIGIN, grid-normalized: PCs in a column, dummies clustered to the right,
    // Isolated far out (30+ ft from everything).
    const g = scene.grid?.size ?? 100;
    const SPOTS = {};
    PCS.forEach((C, i) => { SPOTS[C.name] = [0, i]; });
    Object.assign(SPOTS, {
      "Bench Ally — One": [3, 6], "Bench Ally — Two": [3, 7],
      "Bench Target — Adjacent A": [7, 6], "Bench Target — Adjacent B": [8, 6],
      "Bench Target — Floater": [7, 9], "Bench Target — Undefended": [9, 9],
      "Bench Target — Isolated": [24, 1],
    });
    const toks = [];
    for (const [nm, [cx, cy]] of Object.entries(SPOTS)) {
      const a = game.actors.find(z => z.name === nm && inBench(z));
      if (!a) continue;
      const [x, y] = [ORIGIN.x + cx * g, ORIGIN.y + cy * g];
      const existing = scene.tokens.find(t => t.actorId === a.id);
      if (existing && !RESET_TOKENS) continue;
      if (existing) await existing.update({ x, y });
      else toks.push(await a.getTokenDocument({ x, y }));
    }
    if (toks.length) { await scene.createEmbeddedDocuments("Token", toks); log.push(`+${toks.length} tokens placed on "${scene.name}"`); }
  }

  console.warn("BENCH SETUP:\n" + log.join("\n"));
  console.warn(`BENCH SETUP DONE — ${PCS.length} PCs, ${TGT.length + 1} targets. Scene: "${scene?.name ?? "NONE"}" (view it, never activate/deactivate).`);
})();
