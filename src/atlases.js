/* Dataset normalizer — Pass 1 restructure
   Each "tree" now holds the Key + all specialties for one color/path on a single canvas.

   Tree shape:
     { id, atlas, color, group, groupLabel, name, fullName,
       talents[], columns[]  }
   Talent shape (normalized):
     { tid, name, action, cost, prereqs, description, flavor, tags,
       atlas, color, group, tree (= specialty/legacy), specialty,
       isKey: boolean,
       columnId: string  (which specialty column it belongs to; "key" for the Key talent)
     }

   `columns` is an ordered array describing the column layout for the tree:
     [{ id, label, talentIdxs: [int,...] }]
   The Key talent has its own slot (id "key") rendered above the columns.
*/

const HEROIC_PATHS  = ['Agent', 'Envoy', 'Hunter', 'Leader', 'Scholar', 'Warrior'];

const HEROIC_COLOR  = {
  Agent: 'agent', Envoy: 'envoy', Hunter: 'hunter',
  Leader: 'leader', Scholar: 'scholar', Warrior: 'warrior',
};

// Heroic key auto-grants this skill rank
const HEROIC_KEY_SKILL = {
  Agent: 'Insight', Envoy: 'Discipline', Hunter: 'Perception',
  Leader: 'Leadership', Scholar: 'Lore', Warrior: 'Athletics',
};

const LEYLINE_COLORS = ['White','Blue','Black','Red','Green'];

function deityColor(colorsStr) {
  if (!colorsStr) return 'white';
  const c = colorsStr.split(/[\/,]/)[0].trim().toLowerCase();
  if (['white','blue','black','red','green'].includes(c)) return c;
  return 'white';
}

function makeTid(atlas, group, talentName) {
  return `${atlas}/${group}/${talentName}`.toLowerCase().replace(/\s+/g, '_');
}

function normalizeTalent(raw, atlas, extra = {}) {
  const name = raw['Talent Name'] || raw.Name || raw.name;
  return {
    tid: makeTid(atlas, extra.group || '', name),
    name,
    action:      raw['Action Type'] || raw.Action || raw.action || '',
    cost:        raw.Cost || raw.cost || '—',
    prereqs:     raw.Prerequisites || raw.prerequisites || '',
    description: raw.Description || raw.description || '',
    flavor:      raw['Flavor Text'] || raw.flavor || '',
    tags:        raw.Tags || raw.tags || '',
    // Promoted-to-source fields (optional). Read by layout.js when present.
    layout:      raw.layout && typeof raw.layout.x === 'number' ? { x: raw.layout.x, y: raw.layout.y } : null,
    connections: Array.isArray(raw.connections) ? raw.connections.slice() : null,
    atlas,
    isKey: false,
    ...extra,
  };
}

/* ---------- Leyline (one tree per color) ---------- */
function normalizeLeyline(leyline) {
  const trees = [];
  for (const color of LEYLINE_COLORS) {
    // Support both old format (t.Color) and new format (t.path, lowercase color)
    const colorRows = leyline.filter(t => (t.path || t.Color) === color);

    // Key detection: new format marks the Key explicitly with specialty === 'Key';
    // old format fallback: Attunement tree row with no prerequisites.
    let keyRow = colorRows.find(r => r.specialty === 'Key');
    if (!keyRow) {
      keyRow = colorRows.find(r => r.Tree === 'Attunement' && (!r.Prerequisites || /^\s*[-—]\s*$/.test(r.Prerequisites)));
    }
    if (!keyRow) keyRow = colorRows[0];

    // Build columns dynamically from the distinct specialty values in the data (excluding 'Key')
    const specialties = [...new Set(
      colorRows
        .filter(r => (r.specialty || r.Tree) !== 'Key' && r !== keyRow)
        .map(r => r.specialty || r.Tree)
        .filter(Boolean)
    )];
    const columns = specialties.map(spec => ({ id: spec, label: spec, talentIdxs: [] }));

    const talents = [];

    // Add Key first
    if (keyRow) {
      talents.push(normalizeTalent(keyRow, 'leyline', {
        color: color.toLowerCase(),
        group: color,
        tree: 'Key',
        specialty: 'Key',
        columnId: 'key',
        isKey: true,
      }));
    }

    // Add each specialty's talents into its column
    for (const spec of specialties) {
      const specRows = colorRows.filter(r => (r.specialty || r.Tree) === spec && r !== keyRow);
      const col = columns.find(c => c.id === spec);
      for (const r of specRows) {
        const t = normalizeTalent(r, 'leyline', {
          color: color.toLowerCase(),
          group: color,
          tree: spec,
          specialty: spec,
          columnId: spec,
        });
        talents.push(t);
        col.talentIdxs.push(talents.length - 1);
      }
    }

    trees.push({
      id: `leyline/${color}`,
      atlas: 'leyline',
      color: color.toLowerCase(),
      group: color,
      groupLabel: `${color} Leyline`,
      name: color,
      fullName: `${color} Leyline`,
      keyTalentIdx: keyRow ? 0 : -1,
      talents,
      columns,
      specialties,
    });
  }
  return trees;
}

/* ---------- Heroic (one tree per path) ---------- */
function normalizeHeroic(cosmere) {
  const trees = [];
  const byPath = {};
  for (const r of cosmere) {
    const rPath = r.Path || r.path;
    if (!HEROIC_PATHS.includes(rPath)) continue;
    (byPath[rPath] = byPath[rPath] || []).push(r);
  }
  for (const path of HEROIC_PATHS) {
    const rows = byPath[path] || [];
    const keyRow = rows.find(r => (r.Specialty || r.specialty) === 'Key');
    const specialties = [...new Set(rows.filter(r => (r.Specialty || r.specialty) !== 'Key').map(r => r.Specialty || r.specialty))];

    const talents = [];
    const columns = specialties.map(s => ({ id: s, label: s, talentIdxs: [] }));

    if (keyRow) {
      talents.push(normalizeTalent(keyRow, 'heroic', {
        color: HEROIC_COLOR[path] || 'white',
        group: path,
        tree: 'Key',
        specialty: 'Key',
        columnId: 'key',
        isKey: true,
        keySkill: HEROIC_KEY_SKILL[path],
      }));
    }
    for (const spec of specialties) {
      const col = columns.find(c => c.id === spec);
      const specRows = rows.filter(r => (r.Specialty || r.specialty) === spec);
      for (const r of specRows) {
        const t = normalizeTalent(r, 'heroic', {
          color: HEROIC_COLOR[path] || 'white',
          group: path,
          tree: spec,
          specialty: spec,
          columnId: spec,
        });
        talents.push(t);
        col.talentIdxs.push(talents.length - 1);
      }
    }

    trees.push({
      id: `heroic/${path}`,
      atlas: 'heroic',
      color: HEROIC_COLOR[path] || 'white',
      group: path,
      groupLabel: `${path} Path`,
      name: path,
      fullName: `${path} Path`,
      keyTalentIdx: keyRow ? 0 : -1,
      keySkill: HEROIC_KEY_SKILL[path],
      talents,
      columns,
      specialties,
    });
  }
  return trees;
}

/* ---------- Deity (single tree per deity) ---------- */
function normalizeDeity(domain) {
  const trees = [];
  const byDeity = {};
  for (const r of domain) {
    (byDeity[r.Deity] = byDeity[r.Deity] || []).push(r);
  }
  for (const deity of Object.keys(byDeity).sort()) {
    const rows = byDeity[deity];
    const domainName = rows[0].Domain;
    const colorsStr = rows[0].Colors;
    const color = deityColor(colorsStr);
    // Some deities may have multiple "Tree" labels; flatten into one tree, use Tree as columnId.
    // Deity trees have no Key talent — every row is a regular talent in its specialty column.
    const treeNames = [...new Set(rows.map(r => r.Tree))].filter(tn => tn && tn.toLowerCase() !== 'key');

    const talents = [];
    const columns = treeNames.map(tn => ({ id: tn, label: tn, talentIdxs: [] }));
    if (columns.length === 0) columns.push({ id: domainName || 'Domain', label: domainName || 'Domain', talentIdxs: [] });

    for (const r of rows) {
      const rawTree = r.Tree && r.Tree.toLowerCase() !== 'key' ? r.Tree : columns[0].id;
      const col = columns.find(c => c.id === rawTree) || columns[0];
      const t = normalizeTalent(r, 'deity', {
        color,
        group: deity,
        domain: domainName,
        colorsStr,
        tree: col.id,
        specialty: col.id,
        columnId: col.id,
      });
      talents.push(t);
      col.talentIdxs.push(talents.length - 1);
    }

    trees.push({
      id: `deity/${deity}`,
      atlas: 'deity',
      color,
      colorsStr,
      group: deity,
      groupLabel: `${deity} · ${domainName}`,
      domain: domainName,
      name: deity,
      fullName: `${deity} (${domainName})`,
      keyTalentIdx: -1,
      deitySkill: domainName,
      talents,
      columns,
      specialties: treeNames,
    });
  }
  return trees;
}

function buildAtlases({ leyline, cosmere, domain }) {
  const leylineTrees = normalizeLeyline(leyline);
  const heroicTrees  = normalizeHeroic(cosmere);
  const deityTrees   = normalizeDeity(domain);
  return {
    leyline: { id: 'leyline', name: 'Leyline', subtitle: 'Mortal arcana — five colors of the ley',             trees: leylineTrees },
    heroic:  { id: 'heroic',  name: 'Heroic',  subtitle: 'Skilled practitioners — six paths of mundane mastery', trees: heroicTrees },
    deity:   { id: 'deity',   name: 'Deity',   subtitle: 'Divine dominion — ten deities, thirty domains',        trees: deityTrees },
  };
}

window.Atlases = {
  buildAtlases,
  HEROIC_PATHS,
  HEROIC_COLOR,
  HEROIC_KEY_SKILL,
  LEYLINE_COLORS,
  makeTid,
};
