#!/usr/bin/env node
/* Inspect talents in a built pack: prints each talent's native event rules
 * (system.events) and ActiveEffects exactly as Foundry will load them.
 * The go-to spot-check during tree-by-tree authoring.
 *
 *   node inspect-pack.js <pack> <talent name> [more names...]
 *   node inspect-pack.js edha-deity "Life Surge" "Vital Diagnosis"
 *   node inspect-pack.js edha-leyline --group Red        (every talent in a tree)
 *   node inspect-pack.js                                  (default regression set)
 *
 * Reads via a temp copy (edha-pack-io.readPack) — safe with Foundry OPEN.
 * Honors EDHA_MODROOT.
 */
const { readPack } = require("./edha-pack-io.js");
const { MODROOT } = require("./lib/paths.js");
const DEFAULT_WANT = {
  "edha-leyline": ["Arc Flash", "Kindle", "Flame Surge", "Afterburn", "Chain Detonation", "Searing Bolt"],
  "edha-deity": ["Set Charge", "Pyre", "Fault Line", "Walking Ruin", "Life Surge", "Vital Diagnosis"],
};

function show(pack, t) {
  const evs = t.system?.events || {};
  const group = t.flags?.["edha-content"]?.group;
  console.log(`\n## ${pack} :: ${t.name}${group ? ` (${group})` : ""}`);
  console.log(`   activation: ${t.system?.activation?.type ?? "-"}${t.system?.damage?.formula ? ` | damage: ${t.system.damage.formula} ${t.system.damage.type}` : ""}`);
  console.log(`   events: ${Object.keys(evs).length}, effects: ${(t.effects || []).length}`);
  for (const r of Object.values(evs)) console.log(`     - [${r.event}] -> ${r.handler?.type}  | ${JSON.stringify(Object.fromEntries(Object.entries(r.handler || {}).filter(([k]) => k !== "type")))}`);
  for (const ae of (t.effects || [])) console.log(`     * effect "${ae.name}" disabled=${!!ae.disabled} transfer=${ae.transfer !== false} statuses=${JSON.stringify(ae.statuses || [])} duration=${JSON.stringify(ae.duration || {})} changes=${JSON.stringify(ae.changes)}`);
}

(async () => {
  const [, , packArg, ...rest] = process.argv;
  const want = packArg ? { [packArg]: rest } : DEFAULT_WANT;
  for (const [pack, names] of Object.entries(want)) {
    const data = await readPack(`${MODROOT}/packs/${pack}`);
    if (!data) { console.log(`${pack}: PACK NOT FOUND`); continue; }
    const talents = data.items.filter(i => i.type === "talent");
    const gi = names.indexOf("--group");
    if (gi !== -1) {
      const group = names[gi + 1];
      for (const t of talents.filter(t => (t.flags?.["edha-content"]?.group || "").toLowerCase() === String(group).toLowerCase())) show(pack, t);
      continue;
    }
    if (!names.length) { for (const t of talents) show(pack, t); continue; }
    for (const n of names) {
      const matches = talents.filter(t => t.name === n);
      if (!matches.length) { console.log(`\n## ${pack} :: ${n}  — NOT FOUND`); continue; }
      for (const t of matches) show(pack, t);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
