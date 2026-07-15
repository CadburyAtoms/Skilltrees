#!/usr/bin/env node
/* Validate the edha-adversaries Actor pack: stat-block overrides, embedded
 * item keys (`!actors.items!<actorId>.<itemId>`), baked item effects
 * (`!actors.items.effects!…`), and folder links. Prints each adversary's
 * stat line + items so deviations are eyeballable.
 *
 * Reads via a temp copy, so safe with Foundry OPEN. Run after
 * `foundry-build.js adversaries` — expect "✓ 0 issues".
 *
 *   node validate-adversaries.js
 *
 * Honors EDHA_MODROOT (same as foundry-build.js).
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
function requireClassicLevel() {
  const candidates = [
    "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
    "classic-level",
  ];
  for (const c of candidates) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error("classic-level not found");
}
const { ClassicLevel } = requireClassicLevel();

const MODROOT = process.env.EDHA_MODROOT || "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content";
const dir = `${MODROOT}/packs/edha-adversaries`;

(async () => {
  // Copy to a temp dir (skip LOCK) so we can read while Foundry holds the lock.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "edha-adv-"));
  for (const f of fs.readdirSync(dir)) {
    if (f === "LOCK") continue;
    const src = path.join(dir, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(tmp, f));
  }
  const db = new ClassicLevel(tmp, { valueEncoding: "json" });
  await db.open();
  const actors = {}, items = {}, effects = {}, folders = {};
  for await (const [k, v] of db.iterator()) {
    if (k.startsWith("!actors!")) actors[v._id] = v;
    else if (k.startsWith("!actors.items.effects!")) effects[k] = v;
    else if (k.startsWith("!actors.items!")) items[k] = v;
    else if (k.startsWith("!folders!")) folders[v._id] = v;
  }
  await db.close();
  fs.rmSync(tmp, { recursive: true, force: true });

  let issues = 0;
  const fail = m => { console.log("  ✗", m); issues++; };
  console.log(`Folders: ${Object.keys(folders).length} (${Object.values(folders).map(f => `${f.name}[${f.type}]`).join(", ")})`);
  console.log(`Actors: ${Object.keys(actors).length} | Embedded item keys: ${Object.keys(items).length} | Baked effect keys: ${Object.keys(effects).length}\n`);

  for (const a of Object.values(actors)) {
    const s = a.system;
    const skl = s.skills ? ` Skills ${Object.entries(s.skills).map(([k, v]) => `${k}:${v.rank}`).join(",")}` : "";
    console.log(`${a.name} [${s.role}/${s.type.id}${s.type.custom ? `:${s.type.custom}` : ""}/T${s.tier}/${s.size}] HP ${s.resources.hea.max.override} P/C/S ${s.defenses.phy.override}/${s.defenses.cog.override}/${s.defenses.spi.override} Def ${s.deflect?.override ?? "-"} Foc ${s.resources.foc.max.override} Inv ${s.resources.inv.max.override}${s.movement ? ` Move ${s.movement.walk.rate.override}` : ""}${skl} → ${(folders[a.folder] || {}).name}`);
    if (a.type !== "adversary") fail(`${a.name}: type ${a.type}`);
    if (!a.folder || !folders[a.folder]) fail(`${a.name}: bad folder`);
    if (s.defenses.phy.useOverride !== true) fail(`${a.name}: phy not useOverride`);
    if (!Array.isArray(a.items)) fail(`${a.name}: items not array`);
    for (const id of a.items) {
      if (typeof id !== "string") { fail(`${a.name}: items entry not string`); continue; }
      if (!items[`!actors.items!${a._id}.${id}`]) fail(`${a.name}: missing embedded item key ${id}`);
    }
    const myItems = a.items.map(id => items[`!actors.items!${a._id}.${id}`]).filter(Boolean);
    for (const it of myItems) {
      const act = it.system.activation || {};   // ⚑ a weapon-type embed may lose the activation mixin on load (schema unverified — the pipe-cleaner check)
      const dmg = it.system.damage;
      const isTalentEmbed = it.flags?.["edha-content"]?.adversaryTalent === true;
      const tag = isTalentEmbed ? "TALENT" : it.type === "trait" ? "trait" : it.type === "weapon" ? `weapon:${it.system.type ?? it.system.weaponId ?? "?"}` : act.type;   // TALENT = tree embed (W23, action-typed twin)
      // Weapon pipe-cleaner (2026-07-15): a kind:"weapon" item that loads with NO activation.skill/
      // modifierFormula lost the Activatable mixin fields — report it so the bench sees WHY the roll broke.
      if (it.type === "weapon" && (!act.skill || !act.modifierFormula)) console.log(`    (⚑ weapon "${it.name}": activation.skill/modifierFormula missing after load — the DataModel stripped the action-shaped roll; see the schema dump)`);
      // Regression guard: the adversary sheet only renders trait/weapon/action sections, so a
      // talent-TYPED embed is invisible on the sheet (the 07-14 pipe-cleaner failure). Twins must be actions.
      if (isTalentEmbed && it.type !== "action") fail(`${a.name}/${it.name}: talent embed is type "${it.type}" — must be an action-typed twin (sheet won't render talent items)`);
      if (isTalentEmbed && !Object.keys(it.system.events || {}).length && !(it.effects || []).length) console.log(`    (note: ${it.name} embed carries no events/effects — name-based engine automation only)`);
      const dtxt = dmg && dmg.formula ? ` dmg=${dmg.formula} ${dmg.type}` : "";
      const mod = act.modifierFormula ? ` +${act.modifierFormula}` : "";
      // effects[] on an embedded item must be ID strings with matching baked effect keys
      let fxNote = "";
      if (Array.isArray(it.effects) && it.effects.length) {
        fxNote = ` fx=${it.effects.length}`;
        for (const eid of it.effects) {
          if (typeof eid !== "string") { fail(`${a.name}/${it.name}: inline effect object (must be ID string + baked key)`); continue; }
          if (!effects[`!actors.items.effects!${a._id}.${it._id}.${eid}`]) fail(`${a.name}/${it.name}: missing baked effect key ${eid}`);
        }
      }
      console.log(`    - ${it.name} [${tag}]${mod}${dtxt}${act.skill ? ` skill=${act.skill}` : ""}${fxNote}`);
      if (it.type === "action" && it.system.type !== "basic") fail(`${a.name}/${it.name}: action system.type ${it.system.type}`);
    }
  }
  console.log(`\n${issues === 0 ? "✓ 0 issues" : `✗ ${issues} issues`}`);
  if (issues) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
