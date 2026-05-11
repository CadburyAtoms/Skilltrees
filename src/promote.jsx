/* PromotePanel — merges localStorage talent/layout/connection edits into source JSON.

   What it does:
     - Scans localStorage for keys: skilltrees:talents:*, skilltrees:layout:*, skilltrees:conns:*
     - Loads current data/{leyline,cosmere,domain}.json
     - Produces three merged JSON arrays with:
         · field edits (name, action, cost, prereqs, description, flavor, tags) applied
         · talent renames applied (name field updated; downstream tids regenerate on next load)
         · layout positions baked in as `layout: { x, y }` per row
         · connections baked in as `connections: [prereqName, ...]` per row
     - Migrates character.learnedTids when a rename changes the resulting tid
     - Offers two outputs: download 3 files OR copy a single payload to the clipboard
     - Optional cleanup: wipes the matching skilltrees:talents/layout/conns keys after promote

   Public API: window.PromotePanel (React component, props: { atlases, onClose })
*/

(function () {
  const { useState, useEffect, useMemo } = React;

  const TALENT_PREFIX = 'skilltrees:talents:';
  const LAYOUT_PREFIX = 'skilltrees:layout:';
  const CONNS_PREFIX  = 'skilltrees:conns:';
  const CHAR_KEY      = 'skilltrees:character:default';

  const EDITABLE_FIELDS = ['name', 'action', 'cost', 'prereqs', 'description', 'flavor', 'tags'];
  // Source JSONs use various key cases. We map our in-memory edit field -> a list of
  // candidate source keys (in priority order — first one that already exists in the row
  // wins; if none exist, we use the first as the new key).
  const FIELD_TO_SOURCE_KEYS = {
    name:        ['name', 'Talent Name', 'Name'],
    action:      ['action', 'Action Type', 'Action'],
    cost:        ['cost', 'Cost'],
    prereqs:     ['prerequisites', 'Prerequisites'],
    description: ['description', 'Description'],
    flavor:      ['flavor', 'Flavor Text', 'Flavor'],
    tags:        ['tags', 'Tags'],
  };

  function writeFieldToRow(row, field, value) {
    const candidates = FIELD_TO_SOURCE_KEYS[field] || [field];
    // Prefer an existing key — overwrite the same one so the file format stays consistent.
    for (const k of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, k)) { row[k] = value; return; }
    }
    // No existing key — write to the canonical first one.
    row[candidates[0]] = value;
  }

  // Atlases whose descriptions are user-authored and should be auto-phrased.
  // 'heroic' is source-material in the original skill; we leave it alone.
  const PHRASE_AUTOFIX_ATLASES = new Set(['leyline', 'deity']);

  // Phrasing auto-fix — port of the phrasing-verifier skill (Rules 2 & 3).
  // Returns { fixed, rules: [string,...] } so the panel can show what changed.
  function autoFixDescription(desc) {
    if (!desc || typeof desc !== 'string') return { fixed: desc, rules: [] };
    let s = desc;
    const rules = [];
    const apply = (pattern, repl, label) => {
      const before = s;
      s = s.replace(pattern, repl);
      if (s !== before && !rules.includes(label)) rules.push(label);
    };

    // --- Capitalization (Rule 2) ---
    apply(/\bFocus\b(?!ed)/g, 'focus', 'lowercase: focus');
    apply(/(?<=\. )focus/g, 'Focus', 'sentence-start: Focus');
    apply(/^focus/, 'Focus', 'sentence-start: Focus');

    apply(/(?<!\[)\bTier\b(?!\])/g, 'tier', 'lowercase: tier');
    apply(/(?<=\. )tier/g, 'Tier', 'sentence-start: Tier');
    apply(/^tier/, 'Tier', 'sentence-start: Tier');

    apply(/(?<!Gain )\bAdvantage\b/g, 'advantage', 'lowercase: advantage');
    apply(/\bDisadvantage\b/g, 'disadvantage', 'lowercase: disadvantage');
    apply(/\bDefenses\b(?! Against)/g, 'defenses', 'lowercase: defenses');

    for (const dtype of ['Energy','Impact','Keen','Vital','Spirit']) {
      apply(new RegExp(`\\b${dtype}\\b(?= damage)`, 'g'), dtype.toLowerCase(), `lowercase damage: ${dtype.toLowerCase()}`);
    }
    apply(/\bHealth\b(?! equal| to)/g, 'health', 'lowercase: health');

    // --- Phrasing (Rule 3) ---
    apply(/\bgain [Aa]dvantage\b/g, 'gain an advantage', 'phrasing: gain an advantage');
    apply(/costs?\s+(\d+)\s+focus/g, 'spend $1 focus', 'phrasing: spend X focus');
    apply(/during this scene/gi, 'for the scene', 'phrasing: for the scene');
    apply(/for the duration of the scene/gi, 'for the scene', 'phrasing: for the scene');
    apply(/until the end of the scene/gi, 'for the scene', 'phrasing: for the scene');
    apply(/\bsuffers?\s+/gi, 'takes ', 'phrasing: take damage');
    apply(/^takes /, 'Takes ', 'sentence-start: Takes');
    apply(/\btakes? disadvantage\b/gi, 'has disadvantage', 'phrasing: has disadvantage');

    return { fixed: s, rules };
  }

  // Heuristic flags for items needing manual review (not auto-fixed).
  function flagDescription(desc) {
    if (!desc) return [];
    const flags = [];
    // Rule 1: bare "You" + verb (not "You can"/"You may"/"You have"/"You are")
    if (/^You (?!can\b|may\b|have\b|are\b|gain\b|spend\b|take\b|test\b|roll\b|draw\b|use\b)/i.test(desc.trim())) {
      flags.push('rule 1: bare "You" — consider imperative');
    }
    // Rule 4: rough heuristic for flavor in description
    if (/(whisper|stormlight glows|like a|as if|the air|silence falls|the sky)/i.test(desc)) {
      flags.push('rule 4: possible flavor in description');
    }
    // Rule 7: test structure
    if (/test \w+ (?:to |on )/i.test(desc) && !/test \w+ (?:vs\.|against)/i.test(desc)) {
      flags.push('rule 7: non-standard test phrasing');
    }
    // Rule 10: bracket notation spaces
    if (/\[Tier\]\s+\[Die\]|\[Die\]\s+\[Tier\]/.test(desc)) {
      flags.push('rule 10: spaced bracket notation');
    }
    return flags;
  }

  function readJSON(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  function scanLocalStorage() {
    const talents = {}; const layouts = {}; const conns = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(TALENT_PREFIX)) talents[k.slice(TALENT_PREFIX.length)] = readJSON(k) || {};
      else if (k.startsWith(LAYOUT_PREFIX)) layouts[k.slice(LAYOUT_PREFIX.length)] = readJSON(k) || {};
      else if (k.startsWith(CONNS_PREFIX))  conns[k.slice(CONNS_PREFIX.length)]   = readJSON(k);
    }
    return { talents, layouts, conns };
  }

  // Group source rows by treeId. Must match exactly the in-memory tree.id built in atlases.js:
  //   leyline -> `leyline/${Color}`        (Color is capitalized: White/Blue/Black/Red/Green)
  //   heroic  -> `heroic/${Path}`          (Path is capitalized: Agent/Envoy/...)
  //   deity   -> `deity/${Deity}`          (Deity name as-stored in source)
  function rowTreeId(row) {
    if (row.atlas === 'leyline') {
      const c = row.path || row.Color || '';
      // Normalize capitalization to match HEROIC_PATHS-style (first letter upper).
      const norm = c ? c[0].toUpperCase() + c.slice(1).toLowerCase() : '';
      return `leyline/${norm}`;
    }
    if (row.atlas === 'heroic') {
      const p = row.Path || row.path || '';
      const norm = p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '';
      return `heroic/${norm}`;
    }
    if (row.atlas === 'deity') return `deity/${row.Deity || row.deity || ''}`;
    return null;
  }

  // Pull the source row's talent name out (handles both 'name' and 'Talent Name').
  function rowName(row) {
    return row.name || row['Talent Name'] || row.Name || '';
  }

  // Compute the merged source array for one atlas, plus a per-tree report.
  function mergeAtlasSource(sourceRows, talentEdits, layouts, conns, atlasIdInMemory, atlases, phrasingLog) {
    const trees = atlases[atlasIdInMemory]?.trees || [];
    const treeById = Object.fromEntries(trees.map(t => [t.id, t]));

    const out = sourceRows.map(row => {
      const treeId = rowTreeId(row);
      const tree = treeById[treeId];
      const origName = rowName(row);
      const edits = (talentEdits[treeId] || {})[origName] || {};

      // Apply field edits.
      const merged = { ...row };
      let appliedAny = false;
      for (const f of EDITABLE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(edits, f)) {
          writeFieldToRow(merged, f, edits[f]);
          appliedAny = true;
        }
      }
      if (appliedAny) {
        console.log(`[promote] applied edits to ${treeId} / ${origName}:`, edits);
      }

      // Phrasing auto-fix on description (custom atlases only).
      if (PHRASE_AUTOFIX_ATLASES.has(merged.atlas) && merged.description) {
        const { fixed, rules } = autoFixDescription(merged.description);
        const flags = flagDescription(fixed);
        if (fixed !== merged.description || flags.length) {
          if (phrasingLog) phrasingLog.push({
            atlas: merged.atlas,
            treeId,
            name: merged.name || origName,
            before: merged.description,
            after: fixed,
            rules,
            flags,
            changed: fixed !== merged.description,
          });
          merged.description = fixed;
        }
      }

      // Bake layout (use post-rename name when mapping back).
      // Layout overrides are keyed by talent name (current/displayed name).
      const finalName = merged.name || merged['Talent Name'] || origName;
      const layoutMap = layouts[treeId] || {};
      // Layout was saved by current name in-memory; that's the same as origName before rename
      // (because renames only land in talentEdits.name, not in layout key). Try both.
      const layoutEntry = layoutMap[origName] || layoutMap[finalName];
      if (layoutEntry && typeof layoutEntry.x === 'number') {
        merged.layout = { x: +layoutEntry.x.toFixed(4), y: +layoutEntry.y.toFixed(4) };
      }

      // Bake connections for this row: gather prereq names where this row is the target.
      // conns[treeId] is an array of [srcIdx, tgtIdx] referencing tree.talents (in-memory order).
      // Always write the resolved list (including []) when a conn override exists for the
      // tree — otherwise removing the only incoming edge leaves the stale baked array on disk.
      if (tree && conns[treeId] && Array.isArray(conns[treeId])) {
        const myIdx = tree.talents.findIndex(t => t.name === origName || t.name === finalName);
        if (myIdx >= 0) {
          const prereqNames = [];
          for (const [s, t] of conns[treeId]) {
            if (t === myIdx) {
              const src = tree.talents[s];
              if (src) prereqNames.push(src.name);
            }
          }
          merged.connections = prereqNames;
        }
      }

      return merged;
    });

    // Append brand-new talents (keys starting with "__new__" in talentEdits[treeId]).
    // These never matched an existing source row, so we synthesize new rows here.
    for (const tree of trees) {
      const tEdits = talentEdits[tree.id] || {};
      for (const [key, val] of Object.entries(tEdits)) {
        if (!key.startsWith('__new__')) continue;
        const row = {};
        if (atlasIdInMemory === 'heroic') {
          row.Path = tree.group;
          row.Specialty = val.specialty || val.columnId || (tree.specialties && tree.specialties[0]) || '';
          row.Name = val.name || 'New Talent';
          row.Action = val.action || 'Passive';
          row.Cost = val.cost || '—';
          row.Prerequisites = val.prereqs || '';
          row.Description = val.description || '';
          row.Tags = val.tags || '';
        } else if (atlasIdInMemory === 'leyline') {
          row.Color = tree.group;
          row.Tree = val.specialty || val.columnId || (tree.specialties && tree.specialties[0]) || '';
          row['Talent Name'] = val.name || 'New Talent';
          row['Action Type'] = val.action || 'Passive';
          row.Cost = val.cost || '—';
          row.Prerequisites = val.prereqs || '';
          row.Description = val.description || '';
          row.Flavor = val.flavor || '';
          row.Tags = val.tags || '';
        } else if (atlasIdInMemory === 'deity') {
          row.Deity = tree.group;
          row.Domain = tree.deitySkill || '';
          row.Tree = val.specialty || val.columnId || '';
          row['Talent Name'] = val.name || 'New Talent';
          row['Action Type'] = val.action || 'Passive';
          row.Cost = val.cost || '—';
          row.Prerequisites = val.prereqs || '';
          row.Description = val.description || '';
          row.Flavor = val.flavor || '';
          row.Tags = val.tags || '';
        }
        // Stamp atlas so rowTreeId() can match this row on subsequent merges —
        // without it, future saves can't relocate the row and the merge loses it.
        row.atlas = atlasIdInMemory;
        // Bake layout if present (layouts keyed by talent name).
        const layoutMap = layouts[tree.id] || {};
        const layoutEntry = layoutMap[val.name || 'New Talent'];
        if (layoutEntry && typeof layoutEntry.x === 'number') {
          row.layout = { x: +layoutEntry.x.toFixed(4), y: +layoutEntry.y.toFixed(4) };
        }
        out.push(row);
        console.log(`[promote] appended new talent to ${tree.id}:`, row);
      }
    }

    return out;
  }

  // Build a flat report of everything pending.
  function buildReport(atlases, scan) {
    const report = { trees: [], renames: [], layoutTrees: [], connTrees: [] };
    for (const aid of Object.keys(atlases)) {
      for (const tree of atlases[aid].trees) {
        const tEdits = scan.talents[tree.id];
        const lEdits = scan.layouts[tree.id];
        const cEdits = scan.conns[tree.id];

        const fields = []; const renames = [];
        if (tEdits) {
          for (const origName of Object.keys(tEdits)) {
            const patch = tEdits[origName] || {};
            const changed = Object.keys(patch).filter(k => EDITABLE_FIELDS.includes(k));
            if (!changed.length) continue;
            const isRename = !!(patch.name && patch.name !== origName);
            const entry = { origName, fields: changed, patch };
            fields.push(entry);
            if (isRename) {
              const t = tree.talents.find(x => x.name === origName);
              const oldTid = t ? t.tid : null;
              const newTid = oldTid && oldTid.endsWith(origName.toLowerCase().replace(/\s+/g, '_'))
                ? oldTid.replace(/[^/]+$/, patch.name.toLowerCase().replace(/\s+/g, '_'))
                : null;
              renames.push({ treeId: tree.id, treeLabel: tree.fullName || tree.name, oldName: origName, newName: patch.name, oldTid, newTid });
            }
          }
        }
        if (fields.length || lEdits || cEdits != null) {
          report.trees.push({
            treeId: tree.id, atlas: aid, label: tree.fullName || tree.name,
            fields, hasLayout: !!lEdits, hasConns: cEdits != null,
            layoutCount: lEdits ? Object.keys(lEdits).length : 0,
            connCount: cEdits ? cEdits.length : 0,
          });
        }
        if (lEdits) report.layoutTrees.push(tree.id);
        if (cEdits != null) report.connTrees.push(tree.id);
        for (const r of renames) report.renames.push(r);
      }
    }
    return report;
  }

  async function fetchSources() {
    // Cache-bust: without ?ts=, the browser serves cached data/*.json from
    // page load and the merge clobbers any rows added between then and now —
    // notably brand-new talents the previous save just appended.
    const ts = Date.now();
    const [leyline, cosmere, domain] = await Promise.all([
      fetch('data/leyline.json?ts=' + ts).then(r => r.json()),
      fetch('data/cosmere.json?ts=' + ts).then(r => r.json()),
      fetch('data/domain.json?ts=' + ts).then(r => r.json()),
    ]);
    return { leyline, cosmere, domain };
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function migrateLearnedTidsForRenames(renames) {
    if (!renames.length) return 0;
    try {
      const raw = localStorage.getItem(CHAR_KEY);
      if (!raw) return 0;
      const c = JSON.parse(raw);
      if (!Array.isArray(c.learnedTids)) return 0;
      let migrated = 0;
      const set = new Set(c.learnedTids);
      for (const r of renames) {
        if (r.oldTid && r.newTid && set.has(r.oldTid)) {
          set.delete(r.oldTid); set.add(r.newTid);
          if (c.learnedAt && c.learnedAt[r.oldTid] != null) {
            c.learnedAt[r.newTid] = c.learnedAt[r.oldTid];
            delete c.learnedAt[r.oldTid];
          }
          migrated++;
        }
      }
      c.learnedTids = [...set];
      localStorage.setItem(CHAR_KEY, JSON.stringify(c));
      return migrated;
    } catch { return 0; }
  }

  function clearPromotedKeys(report) {
    const seen = new Set();
    for (const t of report.trees) seen.add(t.treeId);
    for (const id of report.layoutTrees) seen.add(id);
    for (const id of report.connTrees) seen.add(id);
    for (const id of seen) {
      localStorage.removeItem(TALENT_PREFIX + id);
      localStorage.removeItem(LAYOUT_PREFIX + id);
      localStorage.removeItem(CONNS_PREFIX + id);
    }
  }

  function PromotePanel({ atlases, onClose }) {
    const [scan, setScan] = useState(() => scanLocalStorage());
    const [merged, setMerged] = useState(null);   // { leyline, cosmere, domain }
    const [phrasing, setPhrasing] = useState([]); // [{ name, before, after, rules, flags, changed }]
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [phrasingOpen, setPhrasingOpen] = useState(false);
    const [clearAfter, setClearAfter] = useState(true);

    const report = useMemo(() => buildReport(atlases, scan), [atlases, scan]);

    function rescan() { setScan(scanLocalStorage()); setMerged(null); setPhrasing([]); setStatus(null); }

    async function buildMerged() {
      setBusy(true); setStatus(null);
      try {
        const sources = await fetchSources();
        const log = [];
        const out = {
          leyline: mergeAtlasSource(sources.leyline, scan.talents, scan.layouts, scan.conns, 'leyline', atlases, log),
          cosmere: mergeAtlasSource(sources.cosmere, scan.talents, scan.layouts, scan.conns, 'heroic',  atlases, log),
          domain:  mergeAtlasSource(sources.domain,  scan.talents, scan.layouts, scan.conns, 'deity',   atlases, log),
        };
        setMerged(out);
        setPhrasing(log);
        const fixCount = log.filter(e => e.changed).length;
        const flagCount = log.filter(e => e.flags.length).length;
        setStatus({ kind: 'ok', msg: `Merged. Phrasing: ${fixCount} fixed, ${flagCount} flagged.` });
        return out;
      } catch (e) {
        setStatus({ kind: 'err', msg: 'Merge failed: ' + (e.message || e) });
      } finally { setBusy(false); }
    }

    async function downloadAll() {
      const m = merged || (await buildMerged());
      if (!m) return;
      downloadJSON('leyline.json', m.leyline);
      downloadJSON('cosmere.json', m.cosmere);
      downloadJSON('domain.json',  m.domain);
      finalizeAfterPromote();
    }

    async function copyPayload() {
      try {
        const m = merged || (await buildMerged());
        if (!m) return;
        const payload = {
          kind: 'leyline-atlas-promote',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          files: { 'data/leyline.json': m.leyline, 'data/cosmere.json': m.cosmere, 'data/domain.json': m.domain },
          renames: report.renames,
          phrasing: phrasing,
        };
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setStatus({ kind: 'ok', msg: 'Payload copied to clipboard. Paste it back into chat to commit.' });
        finalizeAfterPromote();
      } catch (e) {
        setStatus({ kind: 'err', msg: 'Copy failed: ' + (e.message || e) });
      }
    }

    function finalizeAfterPromote() {
      const migrated = migrateLearnedTidsForRenames(report.renames);
      if (clearAfter) clearPromotedKeys(report);
      setStatus(s => ({
        kind: 'ok',
        msg: (s?.msg || '') + ` · ${report.renames.length} rename(s)${migrated ? `, migrated ${migrated} allocation(s)` : ''}${clearAfter ? ', cleared patches' : ''}.`
      }));
      // Don't rescan immediately; user may want to inspect the report. They can hit Refresh.
    }

    const nothingPending = !report.trees.length && !report.renames.length;

    return (
      <div className="promote-overlay" onClick={onClose}>
        <div className="parchment promote-panel" onClick={e => e.stopPropagation()}>
          <div className="promote-head">
            <div>
              <div className="small-caps muted">Maintenance</div>
              <h2 className="rubric">Promote Edits to Source</h2>
            </div>
            <button className="btn btn-ghost" onClick={onClose} title="Close">✕</button>
          </div>

          <p className="promote-blurb muted">
            Bakes pending talent edits, layout positions, and connection overrides from this browser
            into the canonical <code>data/*.json</code> files. Renames regenerate talent ids on next load;
            character allocations are migrated automatically.
          </p>

          {nothingPending ? (
            <div className="promote-empty muted">No pending edits in this browser.</div>
          ) : (
            <>
              <section className="promote-section">
                <div className="promote-section-head">
                  <h3 className="rubric">Trees with edits ({report.trees.length})</h3>
                  <button className="btn btn-ghost btn-tiny" onClick={rescan}>Rescan</button>
                </div>
                <ul className="promote-tree-list">
                  {report.trees.map(t => {
                    const open = !!expanded[t.treeId];
                    return (
                      <li key={t.treeId} className="promote-tree-row">
                        <button className="promote-tree-toggle" onClick={() => setExpanded(e => ({ ...e, [t.treeId]: !open }))}>
                          <span className="promote-caret">{open ? '▾' : '▸'}</span>
                          <span className="rubric">{t.label}</span>
                          <span className="muted small-caps">
                            {t.fields.length} talent{t.fields.length === 1 ? '' : 's'}
                            {t.hasLayout ? ` · ${t.layoutCount} layout` : ''}
                            {t.hasConns ? ` · ${t.connCount} edges` : ''}
                          </span>
                        </button>
                        {open && (
                          <ul className="promote-field-list">
                            {t.fields.map(f => {
                              const isRename = !!(f.patch.name && f.patch.name !== f.origName);
                              return (
                                <li key={f.origName}>
                                  <span className="rubric">{isRename ? `${f.origName} → ${f.patch.name}` : f.origName}</span>
                                  <span className="muted small-caps"> · {f.fields.join(', ')}</span>
                                </li>
                              );
                            })}
                            {t.hasLayout && <li className="muted small-caps">Layout overrides will be baked into <code>layout: {`{x,y}`}</code> on each row.</li>}
                            {t.hasConns && <li className="muted small-caps">Edge overrides will be baked into <code>connections: [prereqName...]</code> on each row.</li>}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>

              {report.renames.length > 0 && (
                <section className="promote-section">
                  <h3 className="rubric">Renames ({report.renames.length})</h3>
                  <ul className="promote-rename-list">
                    {report.renames.map((r, i) => (
                      <li key={i}>
                        <span className="muted small-caps">{r.treeLabel}</span>
                        <div><span className="rubric">{r.oldName}</span> <span className="muted">→</span> <span className="rubric">{r.newName}</span></div>
                        <div className="muted small-caps">
                          regenerates tid · migrates character allocations
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {phrasing.length > 0 && (
                <section className="promote-section">
                  <div className="promote-section-head">
                    <h3 className="rubric">
                      Phrasing ({phrasing.filter(e => e.changed).length} fixed
                      {phrasing.filter(e => e.flags.length).length > 0 && `, ${phrasing.filter(e => e.flags.length).length} flagged`})
                    </h3>
                    <button className="btn btn-ghost btn-tiny" onClick={() => setPhrasingOpen(o => !o)}>
                      {phrasingOpen ? 'Hide' : 'Show details'}
                    </button>
                  </div>
                  {phrasingOpen && (
                    <ul className="promote-rename-list">
                      {phrasing.map((p, i) => (
                        <li key={i}>
                          <span className="muted small-caps">{p.atlas} · {p.treeId}</span>
                          <div className="rubric">{p.name}</div>
                          {p.changed && (
                            <>
                              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}><b>before:</b> {p.before}</div>
                              <div style={{ fontSize: 12, marginTop: 2 }}><b>after:</b> {p.after}</div>
                              <div className="muted small-caps" style={{ marginTop: 4 }}>{p.rules.join(' · ')}</div>
                            </>
                          )}
                          {p.flags.length > 0 && (
                            <div className="muted small-caps" style={{ marginTop: 4 }}>⚠ {p.flags.join(' · ')}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <section className="promote-actions">
                <label className="promote-clear-toggle">
                  <input type="checkbox" checked={clearAfter} onChange={e => setClearAfter(e.target.checked)} />
                  <span>Clear localStorage patches after promote</span>
                </label>
                <div className="promote-buttons">
                  <button className="btn" disabled={busy} onClick={buildMerged}>
                    {busy ? 'Merging…' : merged ? '✓ Re-merge' : 'Preview merge'}
                  </button>
                  <button className="btn" disabled={busy} onClick={downloadAll}>
                    ⇩ Download 3 files
                  </button>
                  <button className="btn" disabled={busy} onClick={copyPayload}>
                    ⧉ Copy payload
                  </button>
                </div>
                {status && (
                  <div className={'promote-status ' + (status.kind === 'err' ? 'err' : 'ok')}>{status.msg}</div>
                )}
              </section>
            </>
          )}

          <div className="promote-foot muted small-caps">
            Storage keys touched: <code>skilltrees:talents:*</code> · <code>skilltrees:layout:*</code> · <code>skilltrees:conns:*</code>
            {report.renames.length > 0 && <> · <code>skilltrees:character:default</code></>}
          </div>
        </div>
      </div>
    );
  }

  window.PromotePanel = PromotePanel;

  // ---- Programmatic API (used by App.jsx auto-save on Done Editing) ----
  // Returns { merged, report, phrasing, renames }, performing no IO of its own.
  async function mergeFromLocalStorage(atlases) {
    const scan = scanLocalStorage();
    const report = buildReport(atlases, scan);
    const sources = await fetchSources();
    const phrasing = [];
    const merged = {
      leyline: mergeAtlasSource(sources.leyline, scan.talents, scan.layouts, scan.conns, 'leyline', atlases, phrasing),
      cosmere: mergeAtlasSource(sources.cosmere, scan.talents, scan.layouts, scan.conns, 'heroic',  atlases, phrasing),
      domain:  mergeAtlasSource(sources.domain,  scan.talents, scan.layouts, scan.conns, 'deity',   atlases, phrasing),
    };
    return { merged, report, phrasing, renames: report.renames };
  }

  function clearAllPatchesAndMigrate(report) {
    const migrated = migrateLearnedTidsForRenames(report.renames);
    clearPromotedKeys(report);
    return migrated;
  }

  function hasPendingEdits() {
    const scan = scanLocalStorage();
    return Object.keys(scan.talents).length > 0
        || Object.keys(scan.layouts).length > 0
        || Object.keys(scan.conns).length > 0;
  }

  window.Promote = {
    mergeFromLocalStorage,
    clearAllPatchesAndMigrate,
    hasPendingEdits,
  };
})();
