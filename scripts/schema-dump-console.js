/* Edha system-schema dump — PASTE INTO THE FOUNDRY CONSOLE (GM, world open). READ-ONLY.
 *
 * Purpose (2026-07-15 equipment/items initiative): repo sessions cannot see the cosmere-rpg
 * system source (it lives only on this machine, minified), so this script captures the ground
 * truth the next session needs to build the equipment layer without guessing:
 *
 *   1. Item DataModel shapes — weapon / armor / equipment / loot (whichever exist): declared
 *      schema fields AND the default system object of a fresh in-memory probe doc.
 *   2. Currency support — CONFIG.COSMERE.currencies (full), any register-currency API on
 *      game.system.api, and the currency subtree of a probe character actor.
 *   3. Real documents — full JSON of one weapon (prefers Longsword), one armor, and one
 *      loot/equipment doc from the system's `cosmere-rpg.items` compendium.
 *   4. Registries — CONFIG.COSMERE keys, weapon/armor id registries, weapon traits.
 *
 * Creates NOTHING in the world (probe docs are memory-only). Output: downloads
 * `edha-schema-dump.json` AND copies it to the clipboard. Commit it to
 * `source-materials/system-schemas/cosmere-rpg-<version>-dump.json` (plain JSON — the
 * no-binaries policy doesn't apply) and the next session works from it.
 */
(async () => {
  const out = { _meta: { system: game.system.id, systemVersion: game.system.version, foundry: game.version, generated: new Date().toISOString() } };
  const grab = (label, fn) => { try { out[label] = fn(); } catch (e) { out[label] = { _error: String(e) }; } };

  // ---- 1. Item DataModel shapes ------------------------------------------------------------
  const flattenSchema = (schema, prefix = "", acc = {}) => {
    for (const [k, f] of Object.entries(schema.fields ?? {})) {
      const p = prefix ? `${prefix}.${k}` : k;
      acc[p] = f.constructor?.name ?? String(f);
      if (f.fields) flattenSchema(f, p, acc);                      // SchemaField
      if (f.element?.fields) flattenSchema(f.element, `${p}[]`, acc); // ArrayField of SchemaField
    }
    return acc;
  };
  grab("itemTypes", () => Object.keys(CONFIG.Item.dataModels ?? {}));
  out.itemSchemas = {};
  for (const t of ["weapon", "armor", "equipment", "loot"]) {
    try {
      const model = CONFIG.Item.dataModels?.[t];
      if (!model) { out.itemSchemas[t] = null; continue; }
      const probe = new Item.implementation({ name: `_edha_probe_${t}`, type: t });
      out.itemSchemas[t] = { fields: flattenSchema(model.schema ?? model.defineSchema()), defaults: probe.toObject().system };
    } catch (e) { out.itemSchemas[t] = { _error: String(e) }; }
  }

  // ---- 2. Currency -------------------------------------------------------------------------
  grab("currencies", () => foundry.utils.deepClone(CONFIG.COSMERE?.currencies ?? null));
  grab("apiKeys", () => Object.keys(game.system.api ?? {}));
  grab("currencyApi", () => Object.keys(game.system.api ?? {}).filter(k => /currenc|money|denom/i.test(k)));
  grab("actorCurrencyDefaults", () => {
    const probe = new Actor.implementation({ name: "_edha_probe_pc", type: "character" });
    const sys = probe.toObject().system;
    return Object.fromEntries(Object.entries(sys).filter(([k]) => /currenc|money|wealth/i.test(k)));
  });

  // ---- 3. Real docs from the system items pack ----------------------------------------------
  const packId = ["cosmere-rpg.items", ...game.packs.keys()].find(id => id.startsWith("cosmere-rpg.") && /item/i.test(id) && game.packs.get(id));
  out.itemsPackId = packId ?? null;
  if (packId) {
    const docs = await game.packs.get(packId).getDocuments();
    out.itemsPackInventory = docs.map(d => `${d.type}: ${d.name}`).sort();
    const pick = (fn, label) => { const d = docs.find(fn); out[label] = d ? d.toObject() : null; };
    pick(d => d.type === "weapon" && d.name === "Longsword", "sampleWeapon");
    if (!out.sampleWeapon) pick(d => d.type === "weapon", "sampleWeapon");
    pick(d => d.type === "armor", "sampleArmor");
    pick(d => d.type === "loot" || d.type === "equipment", "sampleLootOrEquipment");
  }

  // ---- 4. Registries -----------------------------------------------------------------------
  grab("cosmereConfigKeys", () => Object.keys(CONFIG.COSMERE ?? {}));
  grab("weaponRegistry", () => foundry.utils.deepClone(CONFIG.COSMERE?.weapons ?? null));
  grab("armorRegistry", () => foundry.utils.deepClone(CONFIG.COSMERE?.armors ?? CONFIG.COSMERE?.armor ?? null));
  grab("weaponTraits", () => foundry.utils.deepClone(CONFIG.COSMERE?.traits?.weaponTraits ?? CONFIG.COSMERE?.weaponTraits ?? null));

  // ---- deliver -------------------------------------------------------------------------------
  const json = JSON.stringify(out, null, 2);
  try { await game.clipboard?.copyPlainText?.(json); } catch (e) { /* clipboard optional */ }
  saveDataToFile(json, "text/json", `edha-schema-dump.json`);
  console.log(`Edha | schema dump: ${(json.length / 1024).toFixed(0)} KB — downloaded edha-schema-dump.json + copied to clipboard.`);
  console.log("Edha | commit as source-materials/system-schemas/cosmere-rpg-" + game.system.version + "-dump.json");
})();
