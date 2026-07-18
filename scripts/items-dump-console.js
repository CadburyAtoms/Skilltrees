/* Edha ITEMS + CULTURE/ANCESTRY schema dump — PASTE INTO THE FOUNDRY CONSOLE (GM, world open). READ-ONLY.
 *
 * Purpose (2026-07-18 §9j rescope, Ben's ruling): edha-items becomes a full mirror-and-own pack —
 * copy the shipped `cosmere-rpg.items` gear ONCE (same pattern as the heroic-talent copy-in),
 * re-price everything in Edha copper/silver/gold, curate out the Roshar-isms, and add the Edha
 * items. And character creation swaps Ancestry for COUNTRY-OF-ORIGIN, which will ride the system's
 * native `culture` item type — so this also captures the culture/ancestry DataModel schemas and any
 * shipped culture/ancestry items, plus the expertise CONFIG a culture item grants from.
 * The 07-15 schema dump only carried 3 sample items and a name inventory — this is the full read.
 *
 * What it does (creates NOTHING):
 *   1. FULL docs of every weapon/armor/equipment/loot item in EVERY Item compendium (system,
 *      official content, and edha packs alike — pack label recorded so the copy-in can filter),
 *      plus world items.
 *   2. FULL docs of every `culture` and `ancestry` item found anywhere (usually another pack than
 *      the gear one).
 *   3. DataModel field lists for weapon / armor / equipment / loot / culture / ancestry.
 *   4. CONFIG.COSMERE expertise + skill structures (what a culture item can grant from).
 *
 * Output: downloads `edha-items-dump.json` AND copies it to the clipboard. Commit it to
 * `source-materials/edha-items-dump.json` (plain JSON — the no-binaries policy doesn't apply)
 * and tell the session it's there.
 */
(async () => {
  const GEAR_TYPES = ["weapon", "armor", "equipment", "loot"];
  const CHAR_TYPES = ["culture", "ancestry"];
  const out = {
    _meta: { system: game.system.id, systemVersion: game.system.version, foundry: game.version, generated: new Date().toISOString() },
    dataModels: {},        // type -> flattened field list
    gear: [],              // [{ pack, doc }] for every gear-type item, full objects
    characterItems: [],    // [{ pack, doc }] for every culture/ancestry item, full objects
    expertiseConfig: null, // CONFIG.COSMERE expertise-related structures
    skillsConfig: null,    // CONFIG.COSMERE.skills (id -> label/attribute) for culture grants
    counts: {},
  };

  // DataModel field lists.
  const flatten = (schema, prefix = "", acc = {}) => {
    for (const [k, f] of Object.entries(schema?.fields ?? {})) {
      const p = prefix ? `${prefix}.${k}` : k;
      acc[p] = f.constructor?.name ?? String(f);
      if (f.fields) flatten(f, p, acc);
      if (f.element?.fields) flatten(f.element, `${p}[]`, acc);
    }
    return acc;
  };
  for (const t of [...GEAR_TYPES, ...CHAR_TYPES]) {
    try {
      const model = CONFIG.Item.dataModels?.[t];
      out.dataModels[t] = model ? flatten(model.schema ?? model.defineSchema()) : `no ${t} dataModel`;
    } catch (e) { out.dataModels[t] = { _error: String(e) }; }
  }

  // Expertise + skills CONFIG (culture items grant from these).
  try {
    const C = CONFIG.COSMERE ?? {};
    const exp = {};
    for (const k of Object.keys(C)) if (/expertis/i.test(k)) exp[k] = C[k];
    out.expertiseConfig = exp;
    out.skillsConfig = Object.fromEntries(Object.entries(C.skills ?? {}).map(([id, s]) => [id, { label: s.label, attribute: s.attribute, core: !!s.core }]));
  } catch (e) { out.expertiseConfig = { _error: String(e) }; }

  // Every Item compendium + world items.
  const consider = (doc, packLabel) => {
    if (GEAR_TYPES.includes(doc?.type)) out.gear.push({ pack: packLabel, doc: doc.toObject() });
    else if (CHAR_TYPES.includes(doc?.type)) out.characterItems.push({ pack: packLabel, doc: doc.toObject() });
  };
  for (const pack of game.packs) {
    if (pack.documentName !== "Item") continue;
    let docs; try { docs = await pack.getDocuments(); } catch (e) { continue; }
    for (const d of docs) consider(d, pack.collection);
  }
  for (const d of game.items ?? []) consider(d, "world");

  out.counts = {
    gear: out.gear.length,
    gearByPack: out.gear.reduce((m, g) => ((m[g.pack] = (m[g.pack] || 0) + 1), m), {}),
    characterItems: out.characterItems.length,
    characterByPack: out.characterItems.reduce((m, g) => ((m[g.pack] = (m[g.pack] || 0) + 1), m), {}),
  };

  // Deliver.
  const json = JSON.stringify(out, null, 2);
  try { await game.clipboard?.copyPlainText?.(json); } catch (e) { /* clipboard optional */ }
  saveDataToFile(json, "text/json", "edha-items-dump.json");
  console.log(`Edha | items dump: ${(json.length / 1024).toFixed(0)} KB — gear ${out.counts.gear} (${JSON.stringify(out.counts.gearByPack)}), culture/ancestry ${out.counts.characterItems} (${JSON.stringify(out.counts.characterByPack)}).`);
  console.log("Edha | commit as source-materials/edha-items-dump.json and tell the next session it's there.");
})();
