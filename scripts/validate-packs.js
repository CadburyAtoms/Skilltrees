#!/usr/bin/env node
/* Validate the three edha talent packs (leyline/deity/heroic).
 *
 * Checks every tree node uuid, connection, path.talentTree link, path grant,
 * and folder parent resolves in-pack, and reports per-pack type counts plus
 * how many talents carry native events/effects.
 *
 * Reads via a temp copy of each pack (edha-pack-io.readPack), so it is safe to
 * run with Foundry OPEN. Run after every `foundry-build.js` — expect
 * "VALIDATION PASSED ✓" with 0 issues.
 *
 *   node validate-packs.js
 *
 * Honors EDHA_MODROOT (same as foundry-build.js).
 */
const { readPack } = require("./edha-pack-io.js");

const MODROOT = process.env.EDHA_MODROOT || "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content";
const PACKS = ["edha-leyline", "edha-deity", "edha-heroic"];
const uuidRe = /^Compendium\.edha-content\.([a-z-]+)\.Item\.(.+)$/;

(async () => {
  let issues = 0;
  for (const pack of PACKS) {
    const data = await readPack(`${MODROOT}/packs/${pack}`);
    if (!data) { console.log(`${pack}: PACK NOT FOUND ✗`); issues++; continue; }
    const { items, folders } = data;
    const byId = new Map(items.map(i => [i._id, i]));
    const folderIds = new Set(folders.map(f => f._id));
    const types = {}; for (const i of items) types[i.type] = (types[i.type] || 0) + 1;
    const resolve = uuid => { const m = uuidRe.exec(uuid || ""); return m && m[1] === pack && byId.has(m[2]); };

    let badNode = 0, badConn = 0, badTree = 0, badGrant = 0, badFolder = 0, badPathType = 0;
    let evTalents = 0, evRules = 0, fxTalents = 0, fxCount = 0;
    for (const it of items) {
      if (it.folder && !folderIds.has(it.folder)) badFolder++;
      if (it.type === "talent") {
        const n = Object.keys(it.system?.events || {}).length;
        if (n) { evTalents++; evRules += n; }
        const fx = (it.effects || []).length;
        if (fx) { fxTalents++; fxCount += fx; }
      }
      if (it.type === "talent_tree") {
        const nmap = it.system.nodes, nodeIds = new Set(Object.keys(nmap));
        for (const n of Object.values(nmap)) {
          if (!resolve(n.uuid)) { badNode++; if (badNode <= 3) console.log(`  [${pack}] BAD node uuid ${it.name}/${n.talentId} -> ${n.uuid}`); }
          for (const [cid, c] of Object.entries(n.connections || {})) if (!nodeIds.has(cid) || !n.prerequisites?.[c.prerequisiteId]) badConn++;
        }
      }
      if (it.type === "path") {
        if (!resolve(it.system.talentTree)) { badTree++; console.log(`  [${pack}] BAD path.talentTree ${it.name} -> ${it.system.talentTree}`); }
        if (!["leyline", "deity", "heroic"].includes(it.system.type)) badPathType++;
        for (const ev of Object.values(it.system.events || {})) {
          for (const g of (ev.handler?.items || [])) { const u = typeof g === "string" ? g : g.uuid; if (!resolve(u)) badGrant++; }
        }
      }
    }
    for (const f of folders) if (f.folder && !folderIds.has(f.folder)) badFolder++;
    const sum = badNode + badConn + badTree + badGrant + badFolder + badPathType;
    issues += sum;
    console.log(`${pack}: types=${JSON.stringify(types)} folders=${folders.length} | events=${evRules} rules on ${evTalents} talents, effects=${fxCount} on ${fxTalents} talents | badNode=${badNode} badConn=${badConn} badTree=${badTree} badGrant=${badGrant} badFolder=${badFolder} badPathType=${badPathType}`);
  }

  // edha-items (07-18 bench: the pack shipped DECLARED but EMPTY because the deploy script never
  // built the items scope — this check makes an empty/short items pack a hard deploy failure).
  try {
    const fs = require("fs");
    const path = require("path");
    const DATA = process.env.EDHA_DATA || path.join(__dirname, "..", "data");
    const want = JSON.parse(fs.readFileSync(path.join(DATA, "items.json"), "utf-8")).items.length;
    const data = await readPack(`${MODROOT}/packs/edha-items`);
    if (!data) { console.log(`edha-items: PACK NOT FOUND ✗ (run: node foundry-build.js items)`); issues++; }
    else {
      const bad = data.items.filter(i => !i.system?.description?.value || !i.system?.price).length;
      const short = data.items.length < want;
      if (short) console.log(`  [edha-items] pack has ${data.items.length} items but data/items.json defines ${want} — stale build`);
      if (bad) console.log(`  [edha-items] ${bad} item(s) missing description/price`);
      issues += (short ? 1 : 0) + bad;
      console.log(`edha-items: ${data.items.length}/${want} items, folders=${data.folders.length} | missingFields=${bad}`);
    }
  } catch (e) { console.log(`edha-items: check errored ✗ (${e.message})`); issues++; }

  console.log("\nVALIDATION", issues === 0 ? "PASSED ✓" : `had ${issues} ISSUES ✗`);
  if (issues) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
