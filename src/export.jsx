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
  // Redesigned as a one-stop reference sheet for new players.
  function buildPrintHTML(resolved) {
    const r = resolved;
    const Char = window.Character;
    const css = `
      @page { size: letter; margin: 0.5in 0.55in; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0; padding: 0;
        font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
        color: #2c2418;
        background: #faf3df;
        font-size: 10.5pt;
        line-height: 1.38;
      }
      body { padding: 14pt 16pt; }
      h1, h2, h3, h4 { font-family: 'IM Fell English SC', 'Cormorant Garamond', serif; font-weight: 600; margin: 0; color: #2c2418; }
      h1 { font-size: 22pt; letter-spacing: 0.02em; }
      h2 {
        font-size: 11pt; letter-spacing: 0.14em; text-transform: uppercase;
        color: #6e2a25; border-bottom: 1px solid #c9b48e;
        padding-bottom: 2pt; margin: 10pt 0 5pt;
      }
      h3 { font-size: 10.5pt; color: #4a3a2a; margin-top: 6pt; }
      .rubric { color: #8a3a1f; }
      .muted  { color: #7a6750; }
      .small-caps { font-variant: small-caps; letter-spacing: 0.06em; }
      .micro  { font-size: 8.5pt; }
      .row    { display: flex; flex-wrap: wrap; gap: 10pt; }
      .col    { flex: 1 1 0; min-width: 0; }
      hr { border: none; border-top: 1px solid #c9b48e; margin: 6pt 0; }

      header.identity {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12pt; padding-bottom: 6pt; border-bottom: 2px solid #6e2a25;
      }
      header.identity .who { display: flex; align-items: baseline; gap: 10pt; }
      header.identity .level {
        font-family: 'IM Fell English SC', serif; color: #6e2a25;
        font-size: 11pt; letter-spacing: 0.14em; text-transform: uppercase;
      }
      header.identity .paths {
        font-family: 'IM Fell English SC', serif; color: #4a3a2a;
        font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase;
        text-align: right;
      }

      .stats-block {
        margin-top: 8pt; padding: 6pt 8pt;
        border: 1px solid #c9b48e; border-radius: 3pt;
        background: rgba(255,255,255,0.4);
      }
      .resources-line {
        display: flex; flex-wrap: wrap; gap: 4pt 14pt; font-size: 10pt;
        justify-content: center;
        margin-bottom: 6pt; padding-bottom: 6pt; border-bottom: 1px dotted #d8c9a3;
      }
      .resources-line .stat { white-space: nowrap; }
      .resources-line .stat .lbl { font-variant: small-caps; color: #7a6750; letter-spacing: 0.08em; margin-right: 3pt; }
      .resources-line .stat .val { font-family: 'IM Fell English SC', serif; color: #6e2a25; font-size: 11pt; }
      .attr-def-row {
        display: flex; justify-content: center; gap: 8pt;
      }
      .attr-def-group {
        display: flex; align-items: center; gap: 0;
        border: 1.5px solid #c9b48e; border-radius: 4pt;
        overflow: hidden; background: rgba(255,255,255,0.3);
      }
      .attr-def-group .attr-cell {
        text-align: center; padding: 3pt 8pt; min-width: 48pt;
      }
      .attr-def-group .attr-cell .lbl {
        font-variant: small-caps; font-size: 7.5pt; color: #7a6750; letter-spacing: 0.10em;
      }
      .attr-def-group .attr-cell .val {
        font-family: 'IM Fell English SC', serif; font-size: 13pt; color: #2c2418;
      }
      .attr-def-group .def-cell {
        text-align: center; padding: 4pt 10pt;
        background: rgba(110,42,37,0.08);
        border-left: 1.5px solid #c9b48e; border-right: 1.5px solid #c9b48e;
      }
      .attr-def-group .def-cell .lbl {
        font-variant: small-caps; font-size: 7pt; color: #6e2a25; letter-spacing: 0.10em;
      }
      .attr-def-group .def-cell .val {
        font-family: 'IM Fell English SC', serif; font-size: 18pt; color: #6e2a25; line-height: 1.0;
      }

      .skills-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 2pt 18pt;
        margin-top: 4pt;
      }
      .skill-group-head {
        font-variant: small-caps; letter-spacing: 0.12em; font-size: 8.5pt;
        color: #6e2a25; border-bottom: 1px solid #c9b48e;
        padding: 4pt 0 1pt; margin-top: 4pt;
        grid-column: span 1;
      }
      .skill-entry {
        display: grid; grid-template-columns: 1fr 22pt 28pt; align-items: baseline;
        padding: 1pt 0; border-bottom: 1px dotted #e8dcc4; font-size: 9.5pt;
      }
      .skill-entry .sk-name { }
      .skill-entry .sk-name .granted { color: #6e2a25; font-size: 8pt; }
      .skill-entry .sk-rnk { text-align: center; color: #7a6750; font-size: 9pt; }
      .skill-entry .sk-mod { text-align: right; font-family: 'IM Fell English SC', serif; color: #6e2a25; font-size: 10pt; }
      .scaling-note {
        margin-top: 6pt; font-size: 10pt; color: #2c2418;
        border: 2px solid #4a6a33; border-radius: 3pt; padding: 5pt 8pt;
        background: rgba(74,106,51,0.08);
        font-family: 'IM Fell English SC', serif;
        letter-spacing: 0.03em;
      }
      .scaling-note b { color: #4a6a33; }

      .actions-section {
        background: rgba(110,42,37,0.04); border: 1px solid #d8c9a3;
        border-radius: 3pt; padding: 4pt 8pt 6pt; margin-top: 4pt;
      }
      .actions-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 2pt 14pt;
      }
      .action-group-head {
        font-family: 'IM Fell English SC', serif; font-weight: 700;
        letter-spacing: 0.10em; font-size: 9.5pt;
        color: #6e2a25; border-bottom: 1.5px solid #c9b48e;
        padding: 3pt 0 2pt; margin-top: 5pt;
        grid-column: 1 / -1;
      }
      .action-entry { padding: 1.5pt 0; font-size: 9.5pt; break-inside: avoid; }
      .action-entry .act-name {
        font-family: 'IM Fell English SC', serif; font-size: 9.5pt;
        color: #2c2418; letter-spacing: 0.03em;
      }
      .action-entry .act-cost { color: #7a6750; font-size: 8.5pt; }
      .action-entry .act-desc { color: #4a3a2a; font-size: 9pt; margin-left: 2pt; }

      .opp-box {
        margin-top: 6pt; padding: 5pt 8pt;
        border: 1px solid #c9b48e; border-radius: 3pt;
        background: rgba(255,255,255,0.35); font-size: 9.5pt;
      }
      .opp-box .opp-head { font-variant: small-caps; color: #6e2a25; letter-spacing: 0.10em; font-size: 9pt; margin-bottom: 2pt; }
      .opp-box .opp-item { padding: 1pt 0; }
      .opp-box .opp-item .opp-name { font-family: 'IM Fell English SC', serif; }

      .pill-list { display: flex; flex-wrap: wrap; gap: 3pt; }
      .pill {
        border: 1px solid #c9b48e; border-radius: 99px;
        padding: 1pt 6pt; font-size: 9pt; background: rgba(255,255,255,0.4);
      }

      .talent {
        break-inside: avoid; page-break-inside: avoid;
        margin-bottom: 4pt;
      }
      .talent .head {
        display: flex; align-items: baseline; gap: 6pt;
        padding: 2pt 6pt;
        border-radius: 2pt;
      }
      .talent .name {
        font-family: 'IM Fell English SC', serif; font-size: 10pt;
        letter-spacing: 0.03em;
      }
      .talent .name .key-mark { font-size: 8pt; margin-right: 3pt; letter-spacing: 0.12em; opacity: 0.85; }
      .talent .meta {
        font-size: 9.5pt; font-variant: small-caps; letter-spacing: 0.08em;
        white-space: nowrap; opacity: 0.9;
      }
      .talent .desc { font-size: 9.5pt; color: #2c2418; line-height: 1.36; margin-top: 2pt; padding-left: 6pt; }

      .path-block { margin-top: 8pt; break-inside: avoid; }
      .path-block > h3 {
        font-family: 'IM Fell English SC', serif; font-size: 10pt;
        letter-spacing: 0.10em; text-transform: uppercase;
        padding: 3pt 6pt; border-radius: 2pt; margin-bottom: 4pt;
      }

      footer.print-foot {
        margin-top: 12pt; padding-top: 3pt; border-top: 1px solid #c9b48e;
        font-size: 8pt; color: #7a6750; font-variant: small-caps; letter-spacing: 0.10em;
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
        font-family: 'IM Fell English SC', serif; font-size: 10pt;
        padding: 4pt 10pt; border: 1px solid #6e2a25; background: #faf3df;
        color: #6e2a25; cursor: pointer; letter-spacing: 0.08em; border-radius: 2pt;
      }
      .toolbar button.primary { background: #6e2a25; color: #faf3df; }
      .toolbar button:hover { filter: brightness(1.05); }
    `;

    const d = r.derived;
    const grants = r.autoGrants || {};

    // Path color palette (bar background + readable text color)
    const PATH_COLORS = {
      white:   { bg: '#c9a35c', ink: '#fff8df' },
      blue:    { bg: '#3d6c92', ink: '#e8f0f7' },
      black:   { bg: '#2d2723', ink: '#e8e0d6' },
      red:     { bg: '#a33a22', ink: '#fce8e0' },
      green:   { bg: '#4a6a33', ink: '#eef3e6' },
      agent:   { bg: '#6e3a82', ink: '#f0e4f5' },
      envoy:   { bg: '#c47026', ink: '#fef0df' },
      hunter:  { bg: '#2f7575', ink: '#e2f2f2' },
      leader:  { bg: '#a8456b', ink: '#fce8ef' },
      scholar: { bg: '#3a3a72', ink: '#e4e4f0' },
      warrior: { bg: '#8a5a2b', ink: '#f5ead8' },
    };
    function pathColor(colorKey) { return PATH_COLORS[colorKey] || { bg: '#6e2a25', ink: '#faf3df' }; }

    // Leyline scaling lookup
    const RANK_DIE = ['—','d4','d6','d8','d10','d12'];
    const RANK_SIZE = ['—','2.5 ft','5 ft','10 ft','15 ft','20 ft'];
    const RANK_RANGE = ['—','15 ft','30 ft','60 ft','90 ft','120 ft'];
    const leylineKey = r.paths.leylineKey;
    const leylineRank = leylineKey ? ((r.skills[leylineKey.group] || 0) + (grants[leylineKey.group] || 0)) : 0;

    // Path bits for header
    const pathBits = [];
    if (r.paths.heroicKey)  pathBits.push(`Heroic &middot; ${escapeHTML(r.paths.heroicKey.group)}`);
    if (r.paths.leylineKey) pathBits.push(`Leyline &middot; ${escapeHTML(r.paths.leylineKey.group)}`);
    if (r.paths.deityDomain) pathBits.push(`Deity &middot; ${escapeHTML(r.paths.deityDomain)}`);

    // Skills grouped by realm
    const PHYSICAL_SKILLS = ['Agility','Athletics','Heavy Weaponry','Light Weaponry','Stealth','Thievery'];
    const COGNITIVE_SKILLS = ['Crafting','Deduction','Discipline','Intimidation','Lore','Medicine'];
    const SPIRITUAL_SKILLS = ['Deception','Insight','Leadership','Perception','Persuasion','Survival'];
    const LEYLINE_SKILLS = ['White','Blue','Black','Red','Green'];

    function skillRow(name) {
      const baseRank = r.skills[name] || 0;
      const grant = grants[name] || 0;
      const effectiveRank = baseRank + grant;
      const attr = Char.skillAttr(name) || '';
      const attrVal = attr ? (r.attributes[attr] || 0) : 0;
      const mod = attrVal + effectiveRank;
      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
      const grantMark = grant > 0 ? ' <span class="granted">◆</span>' : '';
      return `<div class="skill-entry">
        <span class="sk-name">${escapeHTML(name)}${grantMark}</span>
        <span class="sk-rnk">${effectiveRank}</span>
        <span class="sk-mod">${modStr}</span>
      </div>`;
    }

    function skillGroupHTML(label, skills) {
      return `<div class="skill-group-head">${label}</div>` + skills.map(s => skillRow(s)).join('');
    }

    // Actions reference data
    const actionsData = {
      actions: [
        ['Strike', '▶', 'Attack with a weapon (melee or ranged).'],
        ['Move', '▶', 'Move up to your movement rate.'],
        ['Interact', '▶', 'Draw/stow a weapon, open a door, pick up an item.'],
        ['Gain Advantage', '▶', 'Test a skill vs. defense; gain an advantage on your next test against that target using a different skill.'],
        ['Grapple', '▶', 'Test Athletics vs. Physical to Restrain the target.'],
        ['Shove', '▶', 'Test Athletics vs. Physical to push 5 ft or knock Prone.'],
        ['Disengage', '▶', 'Move 5 ft without triggering Reactive Strike.'],
        ['Brace', '▶', 'Take cover within 5 ft; attacks against you have disadvantage while you remain.'],
        ['Use a Skill', '▶', 'Perform any non-combat skill test.'],
        ['Ready', '▶', 'Prepare an action with a trigger condition (costs that action + yours).'],
      ],
      twoActions: [
        ['Recover', '▶▶', 'Roll recovery die; split result between HP and focus.'],
      ],
      free: [
        ['Drop', '◇', 'Release a held item.'],
        ['Banter', '◇', 'Speak briefly (a sentence or two).'],
      ],
      reactions: [
        ['Reactive Strike', '⟲', '1 focus. Attack an enemy leaving your reach.'],
        ['Dodge', '⟲', '1 focus. Add disadvantage to one attack against you (not area/multi-target).'],
        ['Aid', '⟲', '1 focus. Grant an ally advantage on a test.'],
        ['Avoid Danger', '⟲', 'Attempt to dodge a triggered hazard.'],
      ],
      setting: [
        ['Draw Mana', '▶', 'Restore 1 Investiture. Trigger your Leyline Key\'s Attunement rider (see Key talent below).'],
      ],
    };

    function actionEntries(arr) {
      return arr.map(([name, cost, desc]) =>
        `<div class="action-entry"><span class="act-name">${escapeHTML(name)}</span> <span class="act-cost">${cost}</span> <span class="act-desc">${escapeHTML(desc)}</span></div>`
      ).join('');
    }

    // Talent blocks grouped by path, with colored bars
    const atlasHTML = r.atlasBlocks.map(block => {
      return block.trees.map(tree => {
        const pathLabel = `${block.atlasLabel} · ${tree.group}`;
        const clr = pathColor(tree.color);
        const talentsHTML = tree.talents.map(t => {
          const metaParts = [];
          if (t.action) metaParts.push(t.action);
          if (t.cost && t.cost !== '—') metaParts.push(t.cost);
          return `<div class="talent">
            <div class="head" style="background:${clr.bg};color:${clr.ink};">
              <div class="name" style="color:${clr.ink};">${t.isKey ? '<span class="key-mark">KEY</span>' : ''}${escapeHTML(t.name)}</div>
              <div class="meta" style="color:${clr.ink};">${escapeHTML(metaParts.join(' · '))}</div>
            </div>
            ${t.description ? `<div class="desc">${escapeHTML(t.description)}</div>` : ''}
          </div>`;
        }).join('');
        return `<div class="path-block">
          <h3 style="background:${clr.bg};color:${clr.ink};">${escapeHTML(pathLabel)}</h3>
          ${talentsHTML}
        </div>`;
      }).join('');
    }).join('');

    const expertises = (r.expertises || []).filter(Boolean);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(r.identity.name)} — Reference Sheet</title>
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
      <div class="level">Level ${r.identity.level | 0} &middot; Tier ${d.levelRow.tier}</div>
    </div>
    <div class="paths">${pathBits.map(b => `<div>${b}</div>`).join('') || '<div class="muted">&mdash; no paths chosen &mdash;</div>'}</div>
  </header>

  <div class="stats-block">
    <div class="resources-line">
      <span class="stat"><span class="lbl">HP</span><span class="val">${d.hp}</span></span>
      <span class="stat"><span class="lbl">Focus</span><span class="val">${d.focus}</span></span>
      <span class="stat"><span class="lbl">Investiture</span><span class="val">${d.investiture}</span></span>
      <span class="stat"><span class="lbl">Movement</span><span class="val">${d.movement} ft</span></span>
      <span class="stat"><span class="lbl">Recovery Die</span><span class="val">${d.recoveryDie}</span></span>
      <span class="stat"><span class="lbl">Senses</span><span class="val">${d.sensesRange} ft</span></span>
    </div>
    <div class="attr-def-row">
      <div class="attr-def-group">
        <div class="attr-cell"><div class="lbl">STR</div><div class="val">${r.attributes.STR|0}</div></div>
        <div class="def-cell"><div class="lbl">Physical</div><div class="val">${d.defenses.physical}</div></div>
        <div class="attr-cell"><div class="lbl">SPD</div><div class="val">${r.attributes.SPD|0}</div></div>
      </div>
      <div class="attr-def-group">
        <div class="attr-cell"><div class="lbl">INT</div><div class="val">${r.attributes.INT|0}</div></div>
        <div class="def-cell"><div class="lbl">Cognitive</div><div class="val">${d.defenses.cognitive}</div></div>
        <div class="attr-cell"><div class="lbl">WIL</div><div class="val">${r.attributes.WIL|0}</div></div>
      </div>
      <div class="attr-def-group">
        <div class="attr-cell"><div class="lbl">AWA</div><div class="val">${r.attributes.AWA|0}</div></div>
        <div class="def-cell"><div class="lbl">Spiritual</div><div class="val">${d.defenses.spiritual}</div></div>
        <div class="attr-cell"><div class="lbl">PRE</div><div class="val">${r.attributes.PRE|0}</div></div>
      </div>
    </div>
  </div>

  <h2>Skills <span class="muted micro" style="font-family:Cormorant Garamond,Georgia,serif;">&#9670; = +1 rank from Key</span></h2>
  <div class="skills-grid">
    <div>
      ${skillGroupHTML('Physical', PHYSICAL_SKILLS)}
      ${skillGroupHTML('Spiritual', SPIRITUAL_SKILLS)}
    </div>
    <div>
      ${skillGroupHTML('Cognitive', COGNITIVE_SKILLS)}
      ${skillGroupHTML('Leyline', LEYLINE_SKILLS)}
    </div>
  </div>
  ${leylineRank > 0 ? (() => {
    const lClr = pathColor(leylineKey.group.toLowerCase());
    return `<div class="scaling-note" style="border-color:${lClr.bg};background:${lClr.bg}10;">
    <b style="color:${lClr.bg};">${escapeHTML(leylineKey.group)}</b> rank ${leylineRank} &mdash;
    Die <b>${RANK_DIE[leylineRank] || '—'}</b> &middot;
    Size <b>${RANK_SIZE[leylineRank] || '—'}</b> &middot;
    Attunement Range <b>${RANK_RANGE[leylineRank] || '—'}</b>
  </div>`;
  })() : ''}

  <h2>Actions</h2>
  <div class="actions-section">
  <div class="actions-grid">
    <div>
      <div class="action-group-head">Actions (▶)</div>
      ${actionEntries(actionsData.actions)}
      <div class="action-group-head">2 Actions (▶▶)</div>
      ${actionEntries(actionsData.twoActions)}
    </div>
    <div>
      <div class="action-group-head">Free Actions (◇)</div>
      ${actionEntries(actionsData.free)}
      <div class="action-group-head">Reactions (⟲) &mdash; 1 per round</div>
      ${actionEntries(actionsData.reactions)}
      <div class="action-group-head">Setting Actions</div>
      ${actionEntries(actionsData.setting)}
    </div>
  </div>
  <div class="opp-box">
    <div class="opp-head">Opportunity Spends</div>
    <div class="opp-item"><span class="opp-name">Aid an Ally</span> &mdash; grant an ally within range an advantage</div>
    <div class="opp-item"><span class="opp-name">Collect Yourself</span> &mdash; recover 2 focus</div>
    <div class="opp-item"><span class="opp-name">Critically Hit</span> &mdash; deal max damage on this attack</div>
    <div class="opp-item"><span class="opp-name">Influence the Narrative</span> &mdash; add a story detail (GM approval)</div>
  </div>
  </div>

  ${expertises.length ? `<h2>Expertises</h2>
  <div class="pill-list">${expertises.map(e => `<span class="pill">${escapeHTML(e)}</span>`).join('')}</div>` : ''}

  <h2>Talents <span class="muted micro">${r.talentCount} learned</span></h2>
  ${atlasHTML || '<div class="muted micro">No talents learned.</div>'}

  <footer class="print-foot">
    <span>Skilltrees &middot; The Atlas &mdash; Edha RPG</span>
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
