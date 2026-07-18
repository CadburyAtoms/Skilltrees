#!/usr/bin/env node
/* scripts/validate.js — CLI validation for data/*.json.
 *
 * Used by:
 *   - .github/workflows/validate.yml (server-side gate)
 *   - scripts/install-hooks.sh (installs as .git/hooks/pre-commit)
 *
 * Exit code 0 on success, 1 on any validation error.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const LEYLINE_COLORS = new Set(['White', 'Blue', 'Black', 'Red', 'Green']);
const HEROIC_PATHS   = new Set(['Agent', 'Envoy', 'Hunter', 'Leader', 'Scholar', 'Warrior']);

function rowName(row) {
  return row.name || row['Talent Name'] || row.Name || '';
}
function inUnit(n) { return typeof n === 'number' && isFinite(n) && n >= -0.2 && n <= 1.2; }

function validateLayout(row, idx, file, errors) {
  if (!Object.prototype.hasOwnProperty.call(row, 'layout')) return;
  const L = row.layout;
  if (!L || typeof L !== 'object') {
    errors.push({ file, idx, name: rowName(row), msg: 'layout must be an object {x, y}' });
    return;
  }
  if (!inUnit(L.x) || !inUnit(L.y)) {
    errors.push({ file, idx, name: rowName(row), msg: `layout coords out of range: x=${L.x} y=${L.y}` });
  }
}

function validateConnections(row, idx, file, errors, warnings, treeNameSet) {
  if (!Object.prototype.hasOwnProperty.call(row, 'connections')) return;
  const c = row.connections;
  if (!Array.isArray(c)) {
    errors.push({ file, idx, name: rowName(row), msg: 'connections must be an array of strings' });
    return;
  }
  for (const n of c) {
    if (typeof n !== 'string' || !n.trim()) {
      errors.push({ file, idx, name: rowName(row), msg: `connection entry not a non-empty string: ${JSON.stringify(n)}` });
      continue;
    }
    if (treeNameSet && !treeNameSet.has(n.toLowerCase())) {
      warnings.push({ file, idx, name: rowName(row), msg: `connection "${n}" does not resolve to a talent in the same tree` });
    }
  }
}

function buildTreeNameSets(rows, atlas) {
  const sets = {};
  for (const r of rows) {
    let key;
    if (atlas === 'leyline') {
      const c = r.path || r.Color;
      key = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : null;
    } else if (atlas === 'heroic') {
      const p = r.Path || r.path;
      key = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null;
    } else if (atlas === 'deity') {
      key = r.Deity || r.deity || null;
    }
    if (!key) continue;
    if (!sets[key]) sets[key] = new Set();
    const n = rowName(r);
    if (n) sets[key].add(n.toLowerCase());
  }
  return sets;
}

// Rows outside the known trees (e.g. Radiant orders in cosmere.json) are not
// consumed by the build pipeline, so we don't enforce structure on them.
// (These filters date from the retired browser atlas, which skipped the same rows.)
function isLoadedByApp(row, atlas) {
  if (atlas === 'leyline') {
    const c = row.path || row.Color;
    return !!(c && LEYLINE_COLORS.has(c[0].toUpperCase() + c.slice(1).toLowerCase()));
  }
  if (atlas === 'heroic') {
    const p = row.Path || row.path;
    return !!(p && HEROIC_PATHS.has(p[0].toUpperCase() + p.slice(1).toLowerCase()));
  }
  if (atlas === 'deity') return !!(row.Deity || row.deity);
  return false;
}

function validateOneFile(rows, file, atlas, errors, warnings) {
  if (!Array.isArray(rows)) {
    errors.push({ file, idx: -1, msg: 'top-level value is not an array' });
    return;
  }
  const treeSets = buildTreeNameSets(rows, atlas);
  rows.forEach((row, idx) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errors.push({ file, idx, msg: 'row is not an object' });
      return;
    }
    if (!isLoadedByApp(row, atlas)) return;

    const name = rowName(row);
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push({ file, idx, msg: 'row has no name (expected name / Name / "Talent Name")' });
    }
    if (row.atlas && !['leyline', 'heroic', 'deity'].includes(row.atlas)) {
      errors.push({ file, idx, name, msg: `atlas field is "${row.atlas}", expected one of leyline/heroic/deity` });
    }
    validateLayout(row, idx, file, errors);
    let treeKey = null;
    if (atlas === 'leyline') { const c = row.path || row.Color; treeKey = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : null; }
    else if (atlas === 'heroic') { const p = row.Path || row.path; treeKey = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null; }
    else if (atlas === 'deity') { treeKey = row.Deity || row.deity || null; }
    const set = treeKey ? treeSets[treeKey] : null;
    validateConnections(row, idx, file, errors, warnings, set);
  });
}

// ---------- adversaries.json (W23 pipeline) ----------
// Mirrors the checks foundry-build.js enforces at build time (Ben's machine) so a bad entry —
// especially a talent ref that won't resolve — fails HERE in CI, not at the bench.
const ADV_ROLES  = new Set(['minion', 'rival', 'boss']);
const ADV_SIZES  = new Set(['small', 'medium', 'large']);
const ADV_CTYPES = new Set(['humanoid', 'animal', 'custom']);
const ADV_DMG    = new Set(['energy', 'impact', 'keen', 'spirit', 'vital', 'heal']);
const ADV_COSTS  = new Set(['Passive', '1 Action', '2 Actions', '3 Actions', 'Free Action', 'Reaction', 'Special', 'Action', '∞', '◇', '★', '⟲']);
const LEYLINE_IDS = new Set(['white', 'blue', 'black', 'red', 'green']);
const CORE_SKILL_IDS = new Set(['agi', 'ath', 'hwp', 'lwp', 'stl', 'thv', 'cra', 'ded', 'dis', 'inm', 'lor', 'med', 'dec', 'ins', 'lea', 'prc', 'prs', 'sur']);

// name(lowercase) -> Set of build "group" labels (leyline Color / deity DOMAIN / heroic Path) —
// the same universe foundry-build.js resolves `talents` refs against.
function buildTalentGroups(leyline, domain, cosmere) {
  const map = new Map();
  const add = (row, group) => {
    const n = rowName(row);
    if (!n || !group) return;
    const k = n.toLowerCase();
    if (!map.has(k)) map.set(k, new Set());
    map.get(k).add(group);
  };
  for (const r of leyline) { const c = r.path || r.Color; const g = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : null; if (g && LEYLINE_COLORS.has(g)) add(r, g); }
  for (const r of domain) if (r.Deity || r.deity) add(r, r.Domain || r.domain);
  for (const r of cosmere) { const p = r.Path || r.path; const g = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null; if (g && HEROIC_PATHS.has(g)) add(r, g); }
  return map;
}

function validateAdversaries(adv, talentGroups, errors, warnings) {
  const file = 'data/adversaries.json';
  if (!adv || typeof adv !== 'object' || Array.isArray(adv)) {
    errors.push({ file, idx: -1, msg: 'top-level value is not an object' });
    return;
  }
  for (const [name, a] of Object.entries(adv)) {
    if (name.startsWith('_')) continue;
    const E = msg => errors.push({ file, idx: -1, name, msg });
    const W = msg => warnings.push({ file, idx: -1, name, msg });
    if (!a || typeof a !== 'object') { E('entry is not an object'); continue; }
    if (a.role && !ADV_ROLES.has(a.role)) E(`role "${a.role}" not minion/rival/boss`);
    if (a.size && !ADV_SIZES.has(a.size)) E(`size "${a.size}" not small/medium/large`);
    if (a.creatureType && !ADV_CTYPES.has(a.creatureType)) E(`creatureType "${a.creatureType}" not humanoid/animal/custom`);
    // foundry-build.js reads these unconditionally — a missing one crashes the build on Ben's machine.
    if (!a.defenses || typeof a.defenses !== 'object' || [a.defenses.phy, a.defenses.cog, a.defenses.spi].some(v => typeof v !== 'number')) E('defenses must be { phy, cog, spi } numbers');
    if (typeof a.hp !== 'number') E('hp must be a number');
    if (a.folder !== undefined && (typeof a.folder !== 'string' || !a.folder.trim())) E('folder must be a non-empty string');
    if (a.senses !== undefined && (typeof a.senses !== 'number' || a.senses <= 0)) E('senses must be a positive number (ft)');
    for (const c of a.leylines || []) if (!LEYLINE_IDS.has(String(c).toLowerCase())) E(`leylines entry "${c}" is not a leyline color`);
    for (const [id, rank] of Object.entries(a.skills || {})) {
      if (!CORE_SKILL_IDS.has(id) && !LEYLINE_IDS.has(id)) E(`skills id "${id}" is not a core 3-letter id or leyline color (unknown ids silently never match a system skill)`);
      if (typeof rank !== 'number' || rank < 0 || rank > 5) E(`skills.${id} rank ${JSON.stringify(rank)} not a number 0–5`);
    }
    for (const ref of a.talents || []) {
      if (typeof ref !== 'string' || !ref.trim()) { E(`talents entry ${JSON.stringify(ref)} not a non-empty string`); continue; }
      const m = /^(.+?)\/(.+)$/.exec(ref.trim());
      const talentName = (m ? m[2] : ref).trim().toLowerCase();
      const groups = talentGroups.get(talentName);
      if (!groups) { E(`talent ref "${ref}" resolves to no talent in leyline/domain/cosmere data`); continue; }
      if (m) {
        const want = m[1].trim().toLowerCase();
        if (![...groups].some(g => String(g).toLowerCase() === want)) E(`talent ref "${ref}": group "${m[1]}" doesn't match (${[...groups].join(', ')})`);
      } else if (groups.size > 1) {
        E(`talent ref "${ref}" is ambiguous (${[...groups].join(', ')}) — qualify as "Group/Talent Name"`);
      }
    }
    (a.items || []).forEach((it, i) => {
      if (!it || typeof it !== 'object' || typeof it.name !== 'string' || !it.name.trim()) { E(`items[${i}] has no name`); return; }
      if (it.cost && !ADV_COSTS.has(it.cost)) W(`item "${it.name}": cost "${it.cost}" not a known activation (falls back to Special)`);
      if (it.attack !== undefined && typeof it.attack !== 'number') E(`item "${it.name}": attack must be a number`);
      if (it.damageType && !ADV_DMG.has(it.damageType)) E(`item "${it.name}": damageType "${it.damageType}" invalid`);
      if (it.kind && !['action', 'trait', 'weapon'].includes(it.kind)) E(`item "${it.name}": kind "${it.kind}" not action/trait/weapon`);
      if (it.kind === 'weapon' && it.attack === undefined) W(`item "${it.name}": kind weapon without an attack bonus — renders in the weapon section but has no roll`);
      if (it.weaponId !== undefined && it.kind !== 'weapon') E(`item "${it.name}": weaponId only applies to kind "weapon"`);
      if (it.alwaysEquipped !== undefined && (typeof it.alwaysEquipped !== 'boolean' || it.kind !== 'weapon')) E(`item "${it.name}": alwaysEquipped must be a boolean on a kind "weapon" item (natural weapons)`);
      // Native event rules on bespoke abilities (07-16): simplified array form — the BUILD mints
      // the 16-char rule ids, so authored entries carry event + handler only.
      if (it.events !== undefined) {
        if (!Array.isArray(it.events)) { E(`item "${it.name}": events must be an ARRAY of {event, handler} (the build mints ids — don't author the map form)`); }
        else it.events.forEach((ev, j) => {
          if (!ev || typeof ev !== 'object') { E(`item "${it.name}" events[${j}]: not an object`); return; }
          if (typeof ev.event !== 'string' || !ev.event.trim()) E(`item "${it.name}" events[${j}]: missing "event"`);
          if (!ev.handler || typeof ev.handler !== 'object' || typeof ev.handler.type !== 'string') E(`item "${it.name}" events[${j}]: handler must be an object with a string "type"`);
          if (ev.id !== undefined) E(`item "${it.name}" events[${j}]: don't author rule ids — the build mints deterministic 16-char ids`);
        });
      }
    });
  }
}

// ---------- items.json (edha-items pack, §9h) ----------
// Edha-unique compendium objects. Price fields are FORBIDDEN until the W25 currency canon lands
// (the no-placeholder-coin-names rule); the build ships the schema default (0 / "none").
const EDHA_ITEM_TYPES = new Set(['weapon', 'equipment', 'loot']);
const WPN_SKILLS = new Set(['lwp', 'hwp']);
const WPN_CATS = new Set(['light_wpn', 'heavy_wpn']);
function validateItems(src, errors, warnings) {
  const file = 'data/items.json';
  if (!src || typeof src !== 'object' || !Array.isArray(src.items)) {
    errors.push({ file, idx: -1, msg: 'must be an object with an "items" array' });
    return;
  }
  src.items.forEach((it, i) => {
    const E = msg => errors.push({ file, idx: i, name: it && it.name, msg });
    if (!it || typeof it !== 'object' || typeof it.name !== 'string' || !it.name.trim()) { E('missing name'); return; }
    if (!EDHA_ITEM_TYPES.has(it.type)) E(`type "${it.type}" not weapon/equipment/loot`);
    if (typeof it.description !== 'string' || !it.description.trim()) E('missing description (HTML)');
    if (it.price !== undefined) E('price fields are gated on the W25 currency canon — remove until it lands');
    if (it.type === 'weapon') {
      if (it.skill !== undefined && !WPN_SKILLS.has(it.skill)) E(`skill "${it.skill}" not lwp/hwp`);
      if (it.category !== undefined && !WPN_CATS.has(it.category)) E(`category "${it.category}" not light_wpn/heavy_wpn`);
      if (typeof it.damage !== 'string' || !it.damage.trim()) E('weapon needs a damage formula (PC-shaped, e.g. "1d6")');
      if (it.damageType && !ADV_DMG.has(it.damageType)) E(`damageType "${it.damageType}" invalid`);
      if (/\bd\d+\s*\+\s*\d/.test(it.damage || '')) warnings.push({ file, idx: i, name: it.name, msg: `damage "${it.damage}" looks adversary-shaped (flat +N) — PC weapons get the wielder's mod from the system` });
    }
  });
}

function loadJson(rel) {
  const p = path.join(REPO_ROOT, rel);
  let raw;
  try { raw = fs.readFileSync(p, 'utf8'); }
  catch (e) { throw new Error(`Could not read ${rel}: ${e.message}`); }
  try { return JSON.parse(raw); }
  catch (e) { throw new Error(`Invalid JSON in ${rel}: ${e.message}`); }
}

function main() {
  const errors = [];
  const warnings = [];
  let leyline, cosmere, domain, adversaries, items;
  try {
    leyline = loadJson('data/leyline.json');
    cosmere = loadJson('data/cosmere.json');
    domain  = loadJson('data/domain.json');
    adversaries = loadJson('data/adversaries.json');
    items = loadJson('data/items.json');
  } catch (e) {
    console.error('✗ ' + e.message);
    process.exit(1);
  }
  validateOneFile(leyline, 'data/leyline.json', 'leyline', errors, warnings);
  validateOneFile(cosmere, 'data/cosmere.json', 'heroic',  errors, warnings);
  validateOneFile(domain,  'data/domain.json',  'deity',   errors, warnings);
  validateAdversaries(adversaries, buildTalentGroups(leyline, domain, cosmere), errors, warnings);
  validateItems(items, errors, warnings);

  for (const w of warnings) {
    console.warn(`! ${w.file}${w.idx >= 0 ? ` row ${w.idx}` : ''}${w.name ? ` (${w.name})` : ''}: ${w.msg}`);
  }
  if (errors.length === 0) {
    console.log(`✓ Validated 5 files. ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.`);
    process.exit(0);
  }
  for (const e of errors) {
    console.error(`✗ ${e.file}${e.idx >= 0 ? ` row ${e.idx}` : ''}${e.name ? ` (${e.name})` : ''}: ${e.msg}`);
  }
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}.`);
  process.exit(1);
}

main();
