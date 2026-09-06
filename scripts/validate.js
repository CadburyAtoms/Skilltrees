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

// The ONE key dialect (TODO_REPO_HYGIENE #22, 2026-09-05). data/leyline.json, data/domain.json
// and data/cosmere.json all speak lowercase now, so this file can finally check REAL field names
// instead of a chain of `row.X || row.Y || row['Z']` alias reads that made every field optional
// in three spellings. LEGACY_KEYS is the ratchet that keeps it that way: the retired capitalized
// spellings are rejected BY NAME, so a hand-edit or a stale extract that re-introduces one fails
// here naming the key and its replacement, instead of silently producing a nameless row.
const LEGACY_KEYS = {
  'Talent Name': 'name',
  'Name': 'name',
  'Action Type': 'action',
  'Action': 'action',
  'Cost': 'cost',
  'Prerequisites': 'prerequisites',
  'Description': 'description',
  'Flavor Text': 'flavor',
  'Flavor': 'flavor',
  'Tags': 'tags',
  'Specialty': 'specialty',
  'Tree': 'specialty',
  'Path': 'path',
  'Color': 'path',
  'Deity': 'deity',
  'Domain': 'domain',
  'Colors': 'colors',
};

function rowName(row) {
  return row.name || '';
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

// ---------- tree-graph integrity (CLAUDE.md iron rule 7, added 2026-07-24) ----------
// validateConnections above checks only that a connection NAME resolves inside its tree. It has
// never checked what the edges ADD UP TO — which is how two mutual-connection cycles sat on `main`
// for the whole tracked history (Green: Predator's Instinct <-> Pack Hunter; Red: Burning Drive
// <-> Reckless Advance), taking 16 talents permanently out of play while all six gates passed.
// A player hit the Green one at session 0.
//
// The requirement model MIRRORS foundry-build.js exactly, because that is what Foundry evaluates:
//   - every `connections` entry becomes ONE managed talent prereq whose `talents` map holds every
//     parent -> satisfied by owning ANY one of them (OR within the group);
//   - each prose prerequisite GROUP (split on ; and ,, then on " and " / " or ") contributes its
//     own prereq -> AND across groups, OR within a group.
// So a node is takeable iff EVERY group has at least one takeable member. A node with no groups
// is a root. Anything never reachable from a root is dead content, whether or not it sits on a cycle.
//
// `prereqGroups` is IMPORTED from foundry-build-parts.js, not redefined here. It used to be a
// local copy that split unconditionally on /\s+and\s+/ — the separators are English words that
// also occur INSIDE talent names, so Scholar's "Mind and Body" tore into "Mind" + "Body", neither
// of which resolves, and `g.filter(local)` below silently DROPS a group where nothing resolves —
// so this gate modeled FEWER requirement edges than Foundry actually evaluates (found 2026-08-10,
// live on "Know Your Moment"'s "Mind and Body; Deduction 2+" prereq). Sharing the one function
// with the generator (which passes it the same `isName` resolver below) means the two can never
// drift apart again.
const { prereqGroups } = require("./foundry-build-parts.js");

function validateTreeGraph(rows, atlas, file, errors, warnings, treeKeyOf, globalNames) {
  const byTree = {};
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    if (!isLoadedByApp(row, atlas)) continue;
    const key = treeKeyOf(row);
    if (!key || !rowName(row)) continue;
    (byTree[key] = byTree[key] || []).push(row);
  }

  for (const [tree, treeRows] of Object.entries(byTree)) {
    const byName = {};
    for (const r of treeRows) byName[rowName(r).toLowerCase()] = r;
    const local = (n) => byName[String(n).trim().toLowerCase()];
    // Resolver handed to prereqGroups, mirroring foundry-build.js's `isTreeName` (build ~line 513)
    // EXACTLY: tree-local name first, then the atlas-wide index — every talent name across all
    // three atlas files, not just this tree or this file — same precedence classifyToken uses.
    // `globalNames` is the Map buildTalentGroups() already builds for validateAdversaries, reused
    // here because it IS that same atlas-wide name universe.
    const isName = (x) => !!local(x) || globalNames.has(String(x).trim().toLowerCase());

    // requirement groups per talent, in build order (connections first, then prose)
    const req = {}, connOf = {}, proseOf = {};
    for (const r of treeRows) {
      const name = rowName(r);
      const groups = [];
      const conn = (Array.isArray(r.connections) ? r.connections : [])
        .filter(local).map(n => rowName(local(n)));
      if (conn.length) groups.push(conn);
      const prose = [];
      for (const g of prereqGroups(r.prerequisites, isName)) {
        const talents = g.filter(local).map(t => rowName(local(t)));
        if (talents.length) { groups.push(talents); prose.push(...talents); }
      }
      req[name] = groups; connOf[name] = conn; proseOf[name] = prose;
    }

    // --- cycles: DFS over the union of all requirement edges, reporting the actual loop path
    const WHITE = 0, GREY = 1, BLACK = 2;
    const state = {}, seen = new Set();
    const walk = (name, stack) => {
      if (state[name] === GREY) {
        const loop = stack.slice(stack.indexOf(name)).concat(name);
        const sig = [...loop].sort().join('|');
        if (!seen.has(sig)) {
          seen.add(sig);
          errors.push({ file, idx: -1, name, msg:
            `${tree}: prerequisite CYCLE — ${loop.join(' -> ')}. Every \`connections\` entry is a ` +
            `REQUIREMENT, so none of these talents can ever be taken. Check for a mutual pair ` +
            `(A connects to B while B connects to A) or an inverted edge (the card's prose points ` +
            `one way, \`connections\` the other). Iron rule 7.` });
        }
        return;
      }
      if (state[name] === BLACK) return;
      state[name] = GREY; stack.push(name);
      for (const g of req[name] || []) for (const p of g) walk(p, stack);
      stack.pop(); state[name] = BLACK;
    };
    for (const r of treeRows) walk(rowName(r), []);

    // --- reachability: fixpoint from the prereq-free roots
    const ok = {};
    for (const r of treeRows) if (!req[rowName(r)].length) ok[rowName(r)] = true;
    for (let changed = true; changed; ) {
      changed = false;
      for (const r of treeRows) {
        const n = rowName(r);
        if (ok[n]) continue;
        if (req[n].every(g => g.some(p => ok[p]))) { ok[n] = true; changed = true; }
      }
    }
    const dead = treeRows.map(rowName).filter(n => !ok[n]);
    if (dead.length) {
      errors.push({ file, idx: -1, name: dead[0], msg:
        `${tree}: ${dead.length} talent(s) UNREACHABLE — no path from any prereq-free root: ` +
        `${dead.join(', ')}. Iron rule 7 (a tree must be walkable).` });
    }

    // --- prose vs connections naming DIFFERENT parents: silently ANDs them (non-fatal).
    // Only flagged when BOTH name talents — prose that names only a skill rank is the norm,
    // because the drawn tree edge is deliberately not repeated on the card.
    for (const r of treeRows) {
      const n = rowName(r);
      const c = connOf[n], p = proseOf[n];
      if (!c.length || !p.length) continue;
      const cs = [...new Set(c)].sort().join('|'), ps = [...new Set(p)].sort().join('|');
      if (cs === ps) continue;
      // Harmless when the extra parent is an ANCESTOR of the other — owning one implies the other.
      const ancestors = (start) => {
        const out = new Set(), q = [start];
        while (q.length) for (const g of req[q.pop()] || []) for (const x of g) if (!out.has(x)) { out.add(x); q.push(x); }
        return out;
      };
      const implied = p.every(x => c.includes(x) || c.some(y => ancestors(y).has(x)))
                   || c.every(x => p.includes(x) || p.some(y => ancestors(y).has(x)));
      if (implied) continue;
      warnings.push({ file, idx: -1, name: n, msg:
        `${tree}: prose prereq [${ps}] and \`connections\` [${cs}] name different talents, and ` +
        `neither implies the other — the node will require BOTH. Intended, or an authoring slip?` });
    }
  }
}

function buildTreeNameSets(rows, atlas) {
  const sets = {};
  for (const r of rows) {
    let key;
    if (atlas === 'leyline' || atlas === 'heroic') {
      const p = r.path;
      key = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null;
    } else if (atlas === 'deity') {
      key = r.deity || null;
    }
    if (!key) continue;
    if (!sets[key]) sets[key] = new Set();
    const n = rowName(r);
    if (n) sets[key].add(n.toLowerCase());
  }
  return sets;
}

// Rows outside the known trees are not consumed by the build pipeline, so we don't enforce
// structure on them. (These filters date from the retired browser atlas, which skipped the same
// rows.) As of 2026-09-05 (#22) EVERY row in all three files passes this: the nine Knights
// Radiant orders that used to fail it — 225 of cosmere.json's 375 rows, never built, never
// checked — are parked in source-materials/radiant-orders.json. The guard stays because it is
// what makes "unchecked rows" impossible to add back by accident: a row on an unknown path is
// skipped here and skipped by buildTrees(), and the two must agree.
function isLoadedByApp(row, atlas) {
  if (atlas === 'leyline') {
    const c = row.path;
    return !!(c && LEYLINE_COLORS.has(c[0].toUpperCase() + c.slice(1).toLowerCase()));
  }
  if (atlas === 'heroic') {
    const p = row.path;
    return !!(p && HEROIC_PATHS.has(p[0].toUpperCase() + p.slice(1).toLowerCase()));
  }
  if (atlas === 'deity') return !!row.deity;
  return false;
}

function validateOneFile(rows, file, atlas, errors, warnings, globalNames) {
  if (!Array.isArray(rows)) {
    errors.push({ file, idx: -1, msg: 'top-level value is not an array' });
    return;
  }
  const treeSets = buildTreeNameSets(rows, atlas);
  const treeKeyOf = (row) => {
    if (atlas === 'leyline' || atlas === 'heroic') { const p = row.path; return p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null; }
    if (atlas === 'deity')   { return row.deity || null; }
    return null;
  };
  validateTreeGraph(rows, atlas, file, errors, warnings, treeKeyOf, globalNames);
  rows.forEach((row, idx) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errors.push({ file, idx, msg: 'row is not an object' });
      return;
    }
    // The dialect ratchet — checked on EVERY row, before isLoadedByApp, because a row wearing
    // the retired keys is exactly the row isLoadedByApp would silently skip (no lowercase
    // `path`/`deity` ⇒ not "loaded", ⇒ never checked at all). That silence is the failure mode
    // this replaces.
    for (const k of Object.keys(row)) {
      if (Object.prototype.hasOwnProperty.call(LEGACY_KEYS, k)) {
        errors.push({ file, idx, name: rowName(row), msg:
          `key "${k}" is the retired capitalized dialect — use "${LEGACY_KEYS[k]}" (one lowercase dialect since #22, 2026-09-05)` });
      }
    }
    if (!isLoadedByApp(row, atlas)) return;

    const name = rowName(row);
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push({ file, idx, msg: 'row has no name (expected a non-empty "name")' });
    }
    if (row.atlas && !['leyline', 'heroic', 'deity'].includes(row.atlas)) {
      errors.push({ file, idx, name, msg: `atlas field is "${row.atlas}", expected one of leyline/heroic/deity` });
    }
    validateLayout(row, idx, file, errors);
    const treeKey = treeKeyOf(row);
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
  for (const r of leyline) { const c = r.path; const g = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : null; if (g && LEYLINE_COLORS.has(g)) add(r, g); }
  for (const r of domain) if (r.deity) add(r, r.domain);
  for (const r of cosmere) { const p = r.path; const g = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null; if (g && HEROIC_PATHS.has(g)) add(r, g); }
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
      if (it.alwaysEquipped !== undefined && (it.kind !== 'weapon' || typeof it.alwaysEquipped !== 'boolean')) E(`item "${it.name}": alwaysEquipped is a boolean for kind "weapon" only (natural weapons — item 34a)`);
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
  let leyline, cosmere, domain, adversaries;
  try {
    leyline = loadJson('data/leyline.json');
    cosmere = loadJson('data/cosmere.json');
    domain  = loadJson('data/domain.json');
    adversaries = loadJson('data/adversaries.json');
  } catch (e) {
    console.error('✗ ' + e.message);
    process.exit(1);
  }
  // Built ONCE, atlas-wide (every talent name across all three files): the same name universe
  // foundry-build.js's pass-1 `index.byName` resolves prereq fragments against (see the `isName`
  // resolver in validateTreeGraph) and that validateAdversaries already resolved `talents` refs
  // against — one Map, two consumers, so the two can't quietly diverge on what "resolves" means.
  const globalNames = buildTalentGroups(leyline, domain, cosmere);
  validateOneFile(leyline, 'data/leyline.json', 'leyline', errors, warnings, globalNames);
  validateOneFile(cosmere, 'data/cosmere.json', 'heroic',  errors, warnings, globalNames);
  validateOneFile(domain,  'data/domain.json',  'deity',   errors, warnings, globalNames);
  validateAdversaries(adversaries, globalNames, errors, warnings);

  for (const w of warnings) {
    console.warn(`! ${w.file}${w.idx >= 0 ? ` row ${w.idx}` : ''}${w.name ? ` (${w.name})` : ''}: ${w.msg}`);
  }
  if (errors.length === 0) {
    console.log(`✓ Validated 4 files. ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.`);
    process.exit(0);
  }
  for (const e of errors) {
    console.error(`✗ ${e.file}${e.idx >= 0 ? ` row ${e.idx}` : ''}${e.name ? ` (${e.name})` : ''}: ${e.msg}`);
  }
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}.`);
  process.exit(1);
}

// Run as a CLI (the pre-commit hook and validate.yml both invoke it that way), but stay
// require()-able so tests can drive a single check against synthetic rows instead of having to
// mutate the real data/ files. Before 2026-09-05 this line was a bare `main()`, which called
// process.exit at load time and made the file untestable — tests/prereq-groups.test.js says so
// in its own comment, and worked around it by re-testing prereqGroups against live data.
if (require.main === module) main();

module.exports = { LEGACY_KEYS, rowName, isLoadedByApp, buildTalentGroups, validateOneFile };
