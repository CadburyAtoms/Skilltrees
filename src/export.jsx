/* Character exporter.

   Two outputs from one panel, both operating on the current character:
     - Print Sheet  — opens a self-contained HTML window, parchment-light,
                      ready for browser Print → Save as PDF.
     - Download JSON — schema-versioned, self-contained snapshot. Includes
                       both the raw character state AND a `resolved` block
                       with full talent rows looked up at export time, so
                       the file is useful outside the app.

   No new dependencies. The print sheet inlines its own CSS to render correctly
   in a popup with no access to styles.css.
*/

(function () {
  const { useState, useMemo } = React;

  const SCHEMA_VERSION = 1;
  const KIND = 'leyline-atlas-character';

  /* --------------------------- Resolver --------------------------- */

  function findTalentByTid(atlases, tid) {
    if (!tid) return null;
    for (const aid of Object.keys(atlases)) {
      for (const tree of atlases[aid].trees) {
        for (const t of tree.talents) if (t.tid === tid) return t;
      }
    }
    return null;
  }

  function resolveCharacter(character, atlases) {
    const Char = window.Character;
    const derived = Char.derive(character, atlases);
    const grants = Char.autoGrantedSkills(character, atlases);

    // Talents grouped by atlas → tree, in atlas order.
    const ATLAS_ORDER = ['heroic', 'leyline', 'deity'];
    const ATLAS_LABEL = { heroic: 'Heroic', leyline: 'Leyline', deity: 'Deity' };

    const learnedTalents = [...character.learnedTids]
      .map(tid => findTalentByTid(atlases, tid))
      .filter(Boolean);

    const groups = {};
    for (const t of learnedTalents) {
      const aid = t.atlas;
      const treeId = `${aid}/${t.group}`;
      if (!groups[aid]) groups[aid] = {};
      if (!groups[aid][treeId]) {
        groups[aid][treeId] = {
          treeId,
          atlas: aid,
          group: t.group,
          domain: t.domain,
          displayName: t.atlas === 'deity' ? (t.domain || t.group) : t.group,
          color: t.color,
          talents: [],
        };
      }
      groups[aid][treeId].talents.push({
        tid: t.tid,
        name: t.name,
        action: t.action || '',
        cost: t.cost || '',
        prereqs: t.prereqs || '',
        description: t.description || '',
        flavor: t.flavor || '',
        tags: t.tags || '',
        isKey: !!t.isKey,
        learnedAt: character.learnedAt[t.tid] | 0,
      });
    }
    // Sort: Keys first, then by learn level, then name
    for (const aid of Object.keys(groups)) {
      for (const tid of Object.keys(groups[aid])) {
        groups[aid][tid].talents.sort((a, b) => {
          if (a.isKey !== b.isKey) return a.isKey ? -1 : 1;
          if (a.learnedAt !== b.learnedAt) return a.learnedAt - b.learnedAt;
          return a.name.localeCompare(b.name);
        });
      }
    }
    const atlasBlocks = ATLAS_ORDER
      .filter(a => groups[a])
      .map(a => ({
        atlas: a,
        atlasLabel: ATLAS_LABEL[a],
        trees: Object.values(groups[a]).sort((x, y) => x.group.localeCompare(y.group)),
      }));

    // Path resolution
    const lk = findTalentByTid(atlases, character.paths.leylineKeyTid);
    const hk = findTalentByTid(atlases, character.paths.heroicKeyTid);

    return {
      identity: {
        name: character.name || 'Untitled',
        level: character.level | 0,
        notes: character.notes || '',
      },
      paths: {
        leylineKey: lk ? { tid: lk.tid, group: lk.group, name: lk.name } : null,
        heroicKey:  hk ? { tid: hk.tid, group: hk.group, name: hk.name } : null,
        deityDomain: character.paths.deitySkill || null,
      },
      attributes: { ...character.attributes },
      skills: { ...character.skills },
      autoGrants: grants,
      expertises: character.expertises.slice(),
      narrativeFlags: character.narrativeFlags.slice(),
      derived,
      atlasBlocks,
      talentCount: learnedTalents.length,
    };
  }

  /* --------------------------- JSON download --------------------------- */

  function downloadCharacterJSON(character, atlases) {
    const resolved = resolveCharacter(character, atlases);
    const payload = {
      kind: KIND,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      character: window.Character ? {
        ...character,
        learnedTids: [...character.learnedTids],
      } : null,
      resolved,
    };
    const slug = (resolved.identity.name || 'character')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'character';
    const filename = `${slug}-L${resolved.identity.level}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return filename;
  }

  /* --------------------------- Print sheet --------------------------- */

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Build the printable HTML doc. All CSS is inlined.
  function buildPrintHTML(resolved) {
    const r = resolved;
    const css = `
      @page { size: letter; margin: 0.55in 0.6in; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0; padding: 0;
        font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
        color: #2c2418;
        background: #faf3df;
        font-size: 11.5pt;
        line-height: 1.42;
      }
      body { padding: 16pt 18pt; }
      h1, h2, h3, h4 { font-family: 'IM Fell English SC', 'Cormorant Garamond', serif; font-weight: 600; margin: 0; color: #2c2418; }
      h1 { font-size: 26pt; letter-spacing: 0.02em; }
      h2 {
        font-size: 13pt; letter-spacing: 0.14em; text-transform: uppercase;
        color: #6e2a25; border-bottom: 1px solid #c9b48e;
        padding-bottom: 3pt; margin: 14pt 0 7pt;
      }
      h3 { font-size: 12pt; color: #4a3a2a; margin-top: 8pt; }
      h4 { font-size: 10.5pt; letter-spacing: 0.08em; text-transform: uppercase; color: #6e2a25; margin: 0 0 3pt; }
      .rubric { color: #8a3a1f; }
      .muted  { color: #7a6750; }
      .small-caps { font-variant: small-caps; letter-spacing: 0.06em; }
      .micro  { font-size: 9.5pt; }
      .row    { display: flex; flex-wrap: wrap; gap: 14pt; }
      .col    { flex: 1 1 0; min-width: 0; }
      hr { border: none; border-top: 1px solid #c9b48e; margin: 8pt 0; }

      header.identity {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 16pt; padding-bottom: 8pt; border-bottom: 2px solid #6e2a25;
      }
      header.identity .who { display: flex; align-items: baseline; gap: 12pt; }
      header.identity .level {
        font-family: 'IM Fell English SC', serif; color: #6e2a25;
        font-size: 12pt; letter-spacing: 0.14em; text-transform: uppercase;
      }
      header.identity .paths {
        font-family: 'IM Fell English SC', serif; color: #4a3a2a;
        font-size: 9.5pt; letter-spacing: 0.12em; text-transform: uppercase;
        text-align: right;
      }
      header.identity .paths div + div { margin-top: 1pt; }

      .stat-grid {
        display: grid; grid-template-columns: repeat(5, 1fr); gap: 6pt;
        margin-top: 4pt;
      }
      .stat-card {
        border: 1px solid #c9b48e; border-radius: 3pt; padding: 5pt 7pt;
        background: rgba(255,255,255,0.4);
      }
      .stat-card .label {
        font-variant: small-caps; letter-spacing: 0.10em; font-size: 8.5pt;
        color: #7a6750;
      }
      .stat-card .value {
        font-family: 'IM Fell English SC', serif; font-size: 16pt;
        color: #2c2418; line-height: 1.0; margin-top: 1pt;
      }

      .skill-row {
        display: grid; align-items: baseline;
        grid-template-columns: 1fr 28pt 26pt 30pt;
        padding: 1.5pt 0; border-bottom: 1px dotted #d8c9a3;
      }
      .skill-row .name { font-size: 11pt; }
      .skill-row .attr { text-align: right; font-size: 9pt; color: #7a6750; }
      .skill-row .val  {
        text-align: right; font-family: 'IM Fell English SC', serif; color: #6e2a25; font-size: 12pt;
      }
      .skill-row .mod {
        text-align: right; font-family: 'IM Fell English SC', serif; color: #2c2418;
        font-size: 12pt; font-weight: 600;
      }
      .skill-row.granted .name::after {
        content: " ★"; color: #7a6750; font-size: 9pt;
        font-variant: small-caps; letter-spacing: 0.06em;
      }
      .skill-row.head {
        border-bottom: 1px solid #c9b48e; padding-bottom: 2pt;
        font-variant: small-caps; letter-spacing: 0.08em;
        font-size: 8.5pt; color: #7a6750;
      }
      .skill-row.head .val,
      .skill-row.head .mod {
        font-weight: 400; font-family: inherit; font-size: 8.5pt; color: #7a6750;
      }

      .attr-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 4pt 8pt; margin-top: 4pt;
      }
      .attr-cell {
        border: 1px solid #c9b48e; border-radius: 3pt;
        padding: 4pt 6pt; background: rgba(255,255,255,0.4);
        display: flex; align-items: baseline; justify-content: space-between; gap: 6pt;
      }
      .attr-cell .lbl {
        font-variant: small-caps; letter-spacing: 0.10em; font-size: 9pt; color: #7a6750;
      }
      .attr-cell .val {
        font-family: 'IM Fell English SC', serif; font-size: 15pt;
        color: #6e2a25; line-height: 1.0;
      }

      .pill-list { display: flex; flex-wrap: wrap; gap: 4pt; }
      .pill {
        border: 1px solid #c9b48e; border-radius: 99px;
        padding: 1.5pt 7pt; font-size: 9.5pt; background: rgba(255,255,255,0.4);
      }

      .talent {
        break-inside: avoid; page-break-inside: avoid;
        border: 1px solid #c9b48e; border-radius: 4pt; padding: 6pt 8pt;
        margin-bottom: 5pt; background: rgba(255,255,255,0.45);
      }
      .talent.key { border-color: #6e2a25; border-width: 1.5pt; }
      .talent .head {
        display: flex; align-items: baseline; justify-content: space-between; gap: 8pt;
        margin-bottom: 2pt;
      }
      .talent .name {
        font-family: 'IM Fell English SC', serif; font-size: 11pt;
        color: #2c2418; letter-spacing: 0.04em;
      }
      .talent .name .key-mark { color: #6e2a25; font-size: 9pt; margin-right: 4pt; letter-spacing: 0.14em; }
      .talent .meta {
        font-size: 8.5pt; color: #7a6750; font-variant: small-caps; letter-spacing: 0.08em;
        white-space: nowrap;
      }
      .talent .line {
        font-size: 9.5pt; color: #4a3a2a; margin-bottom: 1.5pt;
      }
      .talent .line .lbl {
        font-variant: small-caps; letter-spacing: 0.10em; color: #7a6750; margin-right: 4pt;
      }
      .talent .desc { font-size: 10.5pt; color: #2c2418; line-height: 1.42; }
      .talent .desc.flavor { font-style: italic; color: #6c5a3f; margin-top: 3pt; font-size: 9.5pt; }

      .tree-block { margin-top: 8pt; break-inside: avoid; }
      .tree-block > h3 {
        display: flex; align-items: baseline; justify-content: space-between;
        border-bottom: 1px dashed #c9b48e; padding-bottom: 2pt; margin-bottom: 4pt;
      }
      .tree-block > h3 .group { font-family: 'IM Fell English SC', serif; }
      .tree-block > h3 .count { font-size: 9pt; color: #7a6750; font-variant: small-caps; letter-spacing: 0.10em; }

      footer.print-foot {
        margin-top: 18pt; padding-top: 4pt; border-top: 1px solid #c9b48e;
        font-size: 8.5pt; color: #7a6750; font-variant: small-caps; letter-spacing: 0.10em;
        display: flex; justify-content: space-between;
      }

      @media print {
        html, body { background: white; }
        .no-print { display: none !important; }
      }
      .toolbar {
        position: fixed; top: 8pt; right: 12pt;
        display: flex; gap: 6pt; z-index: 999;
      }
      .toolbar button {
        font-family: 'IM Fell English SC', serif; font-size: 11pt;
        padding: 4pt 10pt; border: 1px solid #6e2a25; background: #faf3df;
        color: #6e2a25; cursor: pointer; letter-spacing: 0.08em; border-radius: 2pt;
      }
      .toolbar button.primary { background: #6e2a25; color: #faf3df; }
      .toolbar button:hover { filter: brightness(1.05); }
    `;

    // Stat cards
    const d = r.derived;
    const statCards = [
      ['HP', d.hp],
      ['Focus', d.focus],
      ['Investiture', d.investiture],
      ['Tier', d.levelRow.tier],
      ['Movement', `${d.movement} ft`],
      ['Senses', `${d.sensesRange} ft`],
      ['Phys Def',  d.defenses.physical],
      ['Cog Def',   d.defenses.cognitive],
      ['Spir Def',  d.defenses.spiritual],
      ['Recovery',  d.recoveryDie],
    ];

    // Attributes — compact 3x2 grid mirroring the build-sidebar layout.
    const attrCells = ['STR','SPD','INT','WIL','AWA','PRE'].map(k =>
      `<div class="attr-cell"><span class="lbl">${k}</span><span class="val">${r.attributes[k]|0}</span></div>`
    ).join('');

    // Skills: union of ranked skills and Key auto-grants (a skill granted only
    // by a Key with base=0 is NOT in r.skills because setSkill(name,0) deletes
    // the key — so we must also iterate r.autoGrants).
    const Char = window.Character;
    const grants = r.autoGrants || {};
    const skillNames = Array.from(new Set([...Object.keys(r.skills), ...Object.keys(grants)])).sort();
    const skillRowsList = skillNames.map(name => {
      const base = r.skills[name] | 0;
      const granted = grants[name] | 0;
      const eff = base + granted;
      if (eff === 0) return null;
      const attr = Char.skillAttr(name) || '';
      const attrVal = attr ? (r.attributes[attr] | 0) : 0;
      const mod = attrVal + eff;
      const modStr = (mod >= 0 ? '+' : '') + mod;
      return `<div class="skill-row${granted ? ' granted' : ''}">
        <span class="name">${escapeHTML(name)}</span>
        <span class="attr">${attr || '—'}</span>
        <span class="val">${eff}</span>
        <span class="mod">${modStr}</span>
      </div>`;
    }).filter(Boolean);
    const rankedCount = skillRowsList.length;
    const skillHeader = `<div class="skill-row head">
      <span>Skill</span><span class="attr">Attr</span><span class="val">Rank</span><span class="mod">Mod</span>
    </div>`;
    const skillRows = skillRowsList.join('');

    // Atlas blocks
    const atlasHTML = r.atlasBlocks.map(block => {
      const trees = block.trees.map(tree => {
        const talentsHTML = tree.talents.map(t => {
          const metaParts = [];
          if (t.action) metaParts.push(t.action);
          if (t.cost) metaParts.push(t.cost);
          metaParts.push(`L${t.learnedAt || '?'}`);
          return `<div class="talent${t.isKey ? ' key' : ''}">
            <div class="head">
              <div class="name">${t.isKey ? '<span class="key-mark">KEY</span>' : ''}${escapeHTML(t.name)}</div>
              <div class="meta">${escapeHTML(metaParts.join(' · '))}</div>
            </div>
            ${t.prereqs ? `<div class="line"><span class="lbl">Prereq</span>${escapeHTML(t.prereqs)}</div>` : ''}
            ${t.tags ? `<div class="line"><span class="lbl">Tags</span>${escapeHTML(t.tags)}</div>` : ''}
            ${t.description ? `<div class="desc">${escapeHTML(t.description)}</div>` : ''}
            ${t.flavor ? `<div class="desc flavor">${escapeHTML(t.flavor)}</div>` : ''}
          </div>`;
        }).join('');
        return `<div class="tree-block">
          <h3><span class="group">${escapeHTML(tree.displayName || tree.group)}</span><span class="count">${tree.talents.length} talent${tree.talents.length === 1 ? '' : 's'}</span></h3>
          ${talentsHTML}
        </div>`;
      }).join('');
      return `<section><h2>${escapeHTML(block.atlasLabel)}</h2>${trees}</section>`;
    }).join('');

    const expertises = (r.expertises || []).filter(Boolean);
    const flags = (r.narrativeFlags || []).filter(Boolean);

    const pathBits = [];
    if (r.paths.heroicKey)  pathBits.push(`Heroic · ${escapeHTML(r.paths.heroicKey.group)}`);
    if (r.paths.leylineKey) pathBits.push(`Leyline · ${escapeHTML(r.paths.leylineKey.group)}`);
    if (r.paths.deityDomain) pathBits.push(`Deity · ${escapeHTML(r.paths.deityDomain)}`);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(r.identity.name)} — Character Sheet</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IM+Fell+English+SC&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="primary" onclick="window.print()">Save as PDF</button>
    <button onclick="window.close()">Close</button>
  </div>

  <header class="identity">
    <div class="who">
      <h1>${escapeHTML(r.identity.name)}</h1>
      <div class="level">Level ${r.identity.level | 0}</div>
    </div>
    <div class="paths">${pathBits.map(b => `<div>${b}</div>`).join('') || '<div class="muted">— no paths chosen —</div>'}</div>
  </header>

  <div class="stat-grid">
    ${statCards.map(([l,v]) => `<div class="stat-card"><div class="label">${l}</div><div class="value">${escapeHTML(String(v))}</div></div>`).join('')}
  </div>

  <div class="row" style="margin-top:10pt;">
    <div class="col">
      <h2>Attributes</h2>
      <div class="attr-grid">${attrCells}</div>
    </div>
    <div class="col" style="flex: 2;">
      <h2>Skills <span class="muted micro">${rankedCount} ranked · ★ = auto-grant from Key</span></h2>
      ${rankedCount ? skillHeader + skillRows : '<div class="muted micro">No skills ranked.</div>'}
    </div>
  </div>

  ${expertises.length ? `<section>
    <h2>Expertises</h2>
    <div class="pill-list">${expertises.map(e => `<span class="pill">${escapeHTML(e)}</span>`).join('')}</div>
  </section>` : ''}

  ${flags.length ? `<section>
    <h2>Narrative Flags</h2>
    <div class="pill-list">${flags.map(f => `<span class="pill">${escapeHTML(f)}</span>`).join('')}</div>
  </section>` : ''}

  <h2>Talents <span class="muted micro">${r.talentCount} learned</span></h2>
  ${atlasHTML || '<div class="muted micro">No talents learned.</div>'}

  ${r.identity.notes ? `<section><h2>Notes</h2><div class="desc" style="white-space:pre-wrap;">${escapeHTML(r.identity.notes)}</div></section>` : ''}

  <footer class="print-foot">
    <span>Skilltrees · The Atlas — Cosmere RPG</span>
    <span>Exported ${new Date().toLocaleDateString()}</span>
  </footer>
</body>
</html>`;
  }

  function openPrintSheet(character, atlases) {
    const resolved = resolveCharacter(character, atlases);
    const html = buildPrintHTML(resolved);
    const w = window.open('', '_blank', 'width=820,height=1060');
    if (!w) { alert('Popup blocked. Allow popups to open the print sheet.'); return false; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    return true;
  }

  /* --------------------------- Panel UI --------------------------- */

  function ExportPanel({ atlases, onClose }) {
    const [character, setCharacter] = useState(window.Character.get());
    React.useEffect(() => window.Character.subscribe(setCharacter), []);
    const [status, setStatus] = useState(null);

    const resolved = useMemo(() => resolveCharacter(character, atlases), [character, atlases]);

    function doPrint() {
      const ok = openPrintSheet(character, atlases);
      if (ok) setStatus({ kind: 'ok', msg: 'Print sheet opened in a new window.' });
    }
    function doDownload() {
      const filename = downloadCharacterJSON(character, atlases);
      setStatus({ kind: 'ok', msg: `Downloaded ${filename}.` });
    }
    function doCopyPayload() {
      const payload = {
        kind: KIND, schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        character: { ...character, learnedTids: [...character.learnedTids] },
        resolved,
      };
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
        .then(() => setStatus({ kind: 'ok', msg: 'Character payload copied to clipboard.' }))
        .catch(e => setStatus({ kind: 'err', msg: 'Copy failed: ' + (e.message || e) }));
    }

    const issues = resolved.derived.validations || [];
    const errs = issues.filter(i => i.severity === 'error');
    const warns = issues.filter(i => i.severity === 'warn');
    const budget = resolved.derived.budget;

    return (
      <div className="promote-overlay" onClick={onClose}>
        <div className="promote-panel parchment" onClick={e => e.stopPropagation()}>
          <header className="promote-head">
            <div>
              <h2 className="rubric">Export Character</h2>
              <div className="muted small-caps">{resolved.identity.name} · L{resolved.identity.level} · {resolved.talentCount} talents</div>
            </div>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </header>

          <p className="promote-intro">
            Export the active character — the one shown in the Builder — as a printable
            sheet or a portable JSON snapshot.
          </p>

          <div className="promote-body">
            <section className="promote-section">
              <h3 className="rubric">Snapshot</h3>
              <ul className="export-snap">
                <li>
                  <span className="muted small-caps">Paths</span>
                  <div>
                    {resolved.paths.heroicKey  ? <span>Heroic · <b>{resolved.paths.heroicKey.group}</b> </span> : <span className="muted">Heroic — none </span>}
                    · {resolved.paths.leylineKey ? <span>Leyline · <b>{resolved.paths.leylineKey.group}</b> </span> : <span className="muted">Leyline — none </span>}
                    {resolved.paths.deityDomain ? <span>· Deity · <b>{resolved.paths.deityDomain}</b></span> : null}
                  </div>
                </li>
                <li>
                  <span className="muted small-caps">Stats</span>
                  <div>
                    HP <b>{resolved.derived.hp}</b> · Focus <b>{resolved.derived.focus}</b> · Investiture <b>{resolved.derived.investiture}</b> ·
                    Defenses <b>{resolved.derived.defenses.physical}/{resolved.derived.defenses.cognitive}/{resolved.derived.defenses.spiritual}</b>
                  </div>
                </li>
                <li>
                  <span className="muted small-caps">Talent budget</span>
                  <div>
                    {budget.spent} spent / {budget.totalAvailable} available
                    {budget.over && <span className="rubric"> · over budget</span>}
                  </div>
                </li>
              </ul>
              {(errs.length > 0 || warns.length > 0) && (
                <div className="export-issues">
                  {errs.map((i, n) => <div key={'e'+n} className="rubric">⚠ {i.text}</div>)}
                  {warns.map((i, n) => <div key={'w'+n} className="muted">{i.text}</div>)}
                </div>
              )}
            </section>

            <section className="promote-section">
              <h3 className="rubric">Output</h3>
              <div className="export-actions">
                <button className="btn btn-primary" onClick={doPrint}>
                  Print Sheet <span className="muted small-caps" style={{marginLeft: 8}}>opens new window</span>
                </button>
                <button className="btn" onClick={doDownload}>
                  Download <code>.json</code>
                </button>
                <button className="btn btn-ghost" onClick={doCopyPayload}>
                  Copy payload
                </button>
              </div>
              <div className="muted small" style={{marginTop: 10}}>
                Print sheet uses the browser's native dialog → "Save as PDF". Allow popups
                from this page if the window doesn't open. JSON export is self-contained:
                it includes both the raw character state and the full resolved talent rows.
              </div>
            </section>
          </div>

          {status && (
            <div className={'promote-status ' + (status.kind === 'err' ? 'err' : 'ok')}>
              {status.msg}
            </div>
          )}
        </div>
      </div>
    );
  }

  window.ExportPanel = ExportPanel;
  window.exportCharacterJSON = downloadCharacterJSON;
  window.openCharacterPrintSheet = openPrintSheet;
})();
