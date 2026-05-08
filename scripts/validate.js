#!/usr/bin/env node
/* scripts/validate.js — CLI validation for data/*.json.
 *
 * Used by:
 *   - scripts/publish.sh (pre-commit gate)
 *   - .github/workflows/validate.yml (server-side gate)
 *   - scripts/install-hooks.sh (installs as .git/hooks/pre-commit)
 *
 * Mirrors the rules in src/validate.js so the in-browser preview, the local
 * pre-commit, and the GitHub Action all enforce the same schema.
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

// Mirror the in-app filters in src/atlases.js: rows that don't pass these
// won't be loaded into the live atlas (e.g. Radiant orders in cosmere.json),
// so we don't enforce structure on them.
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
  let leyline, cosmere, domain;
  try {
    leyline = loadJson('data/leyline.json');
    cosmere = loadJson('data/cosmere.json');
    domain  = loadJson('data/domain.json');
  } catch (e) {
    console.error('✗ ' + e.message);
    process.exit(1);
  }
  validateOneFile(leyline, 'data/leyline.json', 'leyline', errors, warnings);
  validateOneFile(cosmere, 'data/cosmere.json', 'heroic',  errors, warnings);
  validateOneFile(domain,  'data/domain.json',  'deity',   errors, warnings);

  for (const w of warnings) {
    console.warn(`! ${w.file}${w.idx >= 0 ? ` row ${w.idx}` : ''}${w.name ? ` (${w.name})` : ''}: ${w.msg}`);
  }
  if (errors.length === 0) {
    console.log(`✓ Validated 3 files. ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.`);
    process.exit(0);
  }
  for (const e of errors) {
    console.error(`✗ ${e.file}${e.idx >= 0 ? ` row ${e.idx}` : ''}${e.name ? ` (${e.name})` : ''}: ${e.msg}`);
  }
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}.`);
  process.exit(1);
}

main();
