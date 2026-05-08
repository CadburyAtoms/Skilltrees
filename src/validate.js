/* validate.js — schema/sanity checks for merged data/*.json before write.

   Catches malformed saves before they hit disk. The same rules run in:
     - in-browser (this file, called from App.jsx autoSave before Persist.saveAtlasJSON)
     - scripts/validate.js (CLI, called from pre-commit hook)
     - GitHub Action (.github/workflows/validate.yml)

   Public API:
     window.Validate = {
       validateMerged({leyline, cosmere, domain})
         -> { ok: bool, errors: [{file, idx, name?, msg}], warnings: [...] }
     };

   What it checks:
     - rows are objects with a non-empty name field
       (any of: name / Name / 'Talent Name')
     - layout, when present, is { x: number in [0,1], y: number in [0,1] }
     - connections, when present, is an array of strings, each resolving
       to another talent in the same tree (warning if not — could be a
       cross-tree prereq, which is an unusual but legal case)
     - atlas, when present, is one of leyline / heroic / deity
     - leyline rows have a `path` in {White,Blue,Black,Red,Green}
     - cosmere rows have a `Path` in {Agent,Envoy,Hunter,Leader,Scholar,Warrior}
     - domain rows have a non-empty `Deity`
*/

(function () {
  const LEYLINE_COLORS = new Set(['White','Blue','Black','Red','Green']);
  const HEROIC_PATHS   = new Set(['Agent','Envoy','Hunter','Leader','Scholar','Warrior']);

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
        warnings.push({ file, idx, name: rowName(row), msg: `connection "${n}" does not resolve to a talent in the same tree (could be a cross-tree prereq, OK if intentional)` });
      }
    }
  }

  function buildTreeNameSets(rows, atlas) {
    // Group rows into trees the same way atlases.js does, so we can verify
    // connection names resolve within a tree.
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

  // Decide whether the in-app atlas builder will actually load this row.
  // Mirrors the filters in src/atlases.js — rows that don't pass these are
  // dead data in the file (e.g. cosmere.json rows for Radiant orders) and we
  // don't validate their structure.
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
      // Skip rows the app silently drops (e.g. Radiant orders in cosmere.json
      // when atlases.js HEROIC_PATHS only lists the 6 Heroic paths).
      if (!isLoadedByApp(row, atlas)) return;

      const name = rowName(row);
      if (!name || typeof name !== 'string' || !name.trim()) {
        errors.push({ file, idx, msg: 'row has no name (expected name / Name / "Talent Name")' });
      }
      // atlas field, if present, must be valid
      if (row.atlas && !['leyline', 'heroic', 'deity'].includes(row.atlas)) {
        errors.push({ file, idx, name, msg: `atlas field is "${row.atlas}", expected one of leyline/heroic/deity` });
      }
      validateLayout(row, idx, file, errors);
      // Determine the tree's name set for connection lookup.
      let treeKey = null;
      if (atlas === 'leyline') { const c = row.path || row.Color; treeKey = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : null; }
      else if (atlas === 'heroic') { const p = row.Path || row.path; treeKey = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : null; }
      else if (atlas === 'deity') { treeKey = row.Deity || row.deity || null; }
      const set = treeKey ? treeSets[treeKey] : null;
      validateConnections(row, idx, file, errors, warnings, set);
    });
  }

  function validateMerged({ leyline, cosmere, domain }) {
    const errors = [];
    const warnings = [];
    validateOneFile(leyline, 'data/leyline.json', 'leyline', errors, warnings);
    validateOneFile(cosmere, 'data/cosmere.json', 'heroic',  errors, warnings);
    validateOneFile(domain,  'data/domain.json',  'deity',   errors, warnings);
    return { ok: errors.length === 0, errors, warnings };
  }

  // Expose to browser
  if (typeof window !== 'undefined') {
    window.Validate = { validateMerged };
  }
  // Expose to Node (for scripts/validate.js) — guarded so the browser load is silent.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateMerged };
  }
})();
