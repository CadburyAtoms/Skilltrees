#!/usr/bin/env node
/**
 * build-player-primer.js — the player-facing Edha primer (lore + talent atlases)
 *
 *   sources (these stay the truth — agents edit THOSE, never this HTML):
 *     EDHA_PLAYER_PRIMER.md                     → The World tab (GM-note block stripped)
 *     source-materials/maps/thyrcross-player.jpg → The Map tab (player-SAFE render:
 *                                                 scripts/map/render_player.py — never embed
 *                                                 thyrcross-labeled.png, it shows GM sites)
 *     data/leyline.json / domain.json / cosmere.json → tree structure + layout + connections
 *     data/authored/<atlas>-<tree>.json          → card text (description.value — the live
 *                                                 Foundry card wins, same precedence as the
 *                                                 module build)
 *     data/path-descriptions.json                → per-tree intros
 *     data/deity-resources.json                  → deity-tree resource callouts
 *
 * Player-safe by construction: everything shown is either EDHA_PLAYER_PRIMER.md (the
 * spoiler-checked handout) or talent card text players see in Foundry anyway.
 *
 * Deterministic: no timestamps; the stamp is a content hash so CI can diff.
 *
 * Usage:
 *   node scripts/build-player-primer.js           # (re)write EDHA_PLAYER_PRIMER.html
 *   node scripts/build-player-primer.js --check   # exit 1 if the committed HTML is stale
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'EDHA_PLAYER_PRIMER.html');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Markdown (the primer subset: h1-h3, tables, lists, blockquotes, hr, inline
// bold/italic/code) — same dialect the canon codex renders.
// ---------------------------------------------------------------------------

function inline(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function mdToHtml(md, { stripGmNote = true, headings = null } = {}) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let para = [];
  const flushPara = () => {
    if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; }
  };
  while (i < lines.length) {
    const line = lines[i];

    // blockquote (possibly the GM note — drop that one entirely)
    if (/^>/.test(line)) {
      flushPara();
      const quote = [];
      while (i < lines.length && /^>/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, '')); i++; }
      const text = quote.join(' ');
      if (!(stripGmNote && /GM note/i.test(text))) {
        out.push('<blockquote>' + inline(text) + '</blockquote>');
      }
      continue;
    }
    // table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].replace(/[^|\s:-]/g, ''))) {
      flushPara();
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      const head = rows[0];
      const body = rows.slice(2);
      out.push('<table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') +
        '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>');
      continue;
    }
    // list (items may wrap onto indented continuation lines)
    if (/^- /.test(line)) {
      flushPara();
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        let item = lines[i].slice(2);
        i++;
        while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^- /.test(lines[i])) {
          item += ' ' + lines[i].trim();
          i++;
        }
        items.push(item);
      }
      out.push('<ul>' + items.map((t) => '<li>' + inline(t) + '</li>').join('') + '</ul>');
      continue;
    }
    const h = line.match(/^(#{1,3}) (.*)/);
    if (h) {
      flushPara();
      const level = h[1].length;
      const text = h[2];
      const id = 'w-' + slugify(text);
      if (headings && level >= 2) headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">` + inline(text) + `</h${level}>`);
      i++;
      continue;
    }
    if (line.trim() === '---') { flushPara(); out.push('<hr>'); i++; continue; }
    if (line.trim() === '') { flushPara(); i++; continue; }
    para.push(line.trim());
    i++;
  }
  flushPara();
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Talent data → normalized trees
// ---------------------------------------------------------------------------

const ICON_GLYPHS = {
  'One Action': '◆', 'Two Actions': '◆◆', 'Three Actions': '◆◆◆',
  'Reaction': '↩', 'Free Action': '◇', 'Always Active': '∞', 'Special Action': '✦',
};

// Foundry HTML → primer HTML: icon-font spans become readable glyphs, and
// @UUID[Compendium...]{Label} document links (only meaningful inside Foundry)
// collapse to their plain label.
function cardHtml(html) {
  return html
    .replace(
      /<span class="cosmere-icon" data-tooltip="([^"]+)"[^>]*>[^<]*<\/span>/g,
      (m, tip) => `<span class="ic" title="${esc(tip)}">${ICON_GLYPHS[tip] || esc(tip)}</span>`
    )
    .replace(/@UUID\[[^\]]+\]\{([^}]+)\}/g, '<strong>$1</strong>');
}

function loadAuthored(file) {
  const j = JSON.parse(read('data/authored/' + file));
  return j.talents || {};
}

const LEY_COLORS = {
  White: '#e8e0c0', Blue: '#6ea8ff', Black: '#b48ae0', Red: '#ff7a6e', Green: '#7fd08a',
};
const GOLD = '#d8b76a';

function buildTrees() {
  const pathDesc = JSON.parse(read('data/path-descriptions.json'));
  const deityRes = JSON.parse(read('data/deity-resources.json'));
  const atlases = [];
  const missingAuthored = [];

  const norm = (t, tree, authored) => {
    const a = authored[t.name];
    if (!a || !a.description || !a.description.value) missingAuthored.push(tree.id + ':' + t.name);
    return {
      name: t.name,
      key: !!t.key,
      specialty: t.specialty,
      action: t.action,
      cost: t.cost,
      prereq: t.prereq,
      flavor: t.flavor || '',
      card: a && a.description && a.description.value ? cardHtml(a.description.value) : null,
      desc: t.desc,
      x: t.layout.x,
      y: t.layout.y,
      conn: (t.connections || []).slice(),
    };
  };

  // --- leyline ---
  {
    const src = JSON.parse(read('data/leyline.json'));
    const trees = [];
    for (const color of ['White', 'Blue', 'Black', 'Red', 'Green']) {
      const authored = loadAuthored('leyline-' + color.toLowerCase() + '.json');
      const tree = {
        id: 'ley-' + color.toLowerCase(),
        label: color,
        color: LEY_COLORS[color],
        color2: LEY_COLORS[color],
        intro: cardHtml(pathDesc.leyline[color.toLowerCase()] || ''),
        resources: [],
        talents: [],
      };
      tree.talents = src.filter((t) => t.path === color).map((t) => norm({
        name: t.name, key: t.specialty === 'Key', specialty: t.specialty, action: t.action,
        cost: t.cost, prereq: t.prerequisites, flavor: t.flavor, desc: t.description,
        layout: t.layout, connections: t.connections,
      }, tree, authored));
      trees.push(tree);
    }
    atlases.push({ id: 'leyline', label: 'Leylines', trees });
  }

  // --- deity ---
  {
    const src = JSON.parse(read('data/domain.json'));
    const trees = [];
    const deities = [];
    for (const t of src) if (!deities.includes(t.Deity)) deities.push(t.Deity);
    for (const deity of deities) {
      const rows = src.filter((t) => t.Deity === deity);
      const domain = rows[0].Domain;
      const colors = rows[0].Colors.split('/');
      const authored = loadAuthored('deity-' + rows[0].Tree.toLowerCase() + '.json');
      const tree = {
        id: 'dei-' + rows[0].Tree.toLowerCase(),
        label: deity,
        sub: domain,
        color: LEY_COLORS[colors[0]] || GOLD,
        color2: LEY_COLORS[colors[1]] || LEY_COLORS[colors[0]] || GOLD,
        colors,
        intro: cardHtml(pathDesc.deity[domain] || ''),
        resources: Object.entries(deityRes)
          .filter(([, r]) => r.tree === rows[0].Tree)
          .map(([name, r]) => ({ name, source: r.source, summary: r.summary })),
        talents: [],
      };
      tree.talents = rows.map((t) => norm({
        // entry talents: the `entry` tag where present (tagging is uneven across trees),
        // else "no prereq-talent connections" — the two tree roots
        name: t['Talent Name'],
        key: /(^|;\s*)entry(\s*;|$)/.test(t.tags || '') || !(t.connections || []).length,
        specialty: t.Domain, action: t['Action Type'], cost: t.Cost,
        prereq: t.Prerequisites || '—', flavor: t['Flavor Text'], desc: t.Description,
        layout: t.layout, connections: t.connections,
      }, tree, authored));
      trees.push(tree);
    }
    atlases.push({ id: 'deity', label: 'Deity Paths', trees });
  }

  // --- heroic (the six Edha heroic paths only — the Radiant rows in cosmere.json
  //     have no layout and are not part of the Edha atlases) ---
  {
    const src = JSON.parse(read('data/cosmere.json'));
    const trees = [];
    for (const p of ['Agent', 'Envoy', 'Hunter', 'Leader', 'Scholar', 'Warrior']) {
      const authored = loadAuthored('heroic-' + p.toLowerCase() + '.json');
      const tree = {
        id: 'her-' + p.toLowerCase(),
        label: p,
        color: GOLD,
        color2: GOLD,
        intro: cardHtml(pathDesc.heroic[p] || ''),
        resources: [],
        talents: [],
      };
      tree.talents = src.filter((t) => t.Path === p).map((t) => norm({
        name: t.Name, key: t.Specialty === 'Key', specialty: t.Specialty, action: t.Action,
        cost: t.Cost || '—', prereq: t.Prerequisites || '—', flavor: t.Flavor || '',
        desc: t.Description, layout: t.layout, connections: t.connections,
      }, tree, authored));
      trees.push(tree);
    }
    atlases.push({ id: 'heroic', label: 'Heroic Paths', trees });
  }

  return { atlases, missingAuthored };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function main() {
  const check = process.argv.includes('--check');

  const primerMd = read('EDHA_PLAYER_PRIMER.md');
  const headings = [];
  const worldHtml = mdToHtml(primerMd, { stripGmNote: true, headings });

  const mapJpg = fs.readFileSync(path.join(ROOT, 'source-materials/maps/thyrcross-player.jpg'));
  const mapUri = 'data:image/jpeg;base64,' + mapJpg.toString('base64');

  const { atlases, missingAuthored } = buildTrees();
  if (missingAuthored.length) {
    console.warn('WARN: no authored card for ' + missingAuthored.length + ' talents (falling back to source prose):');
    for (const m of missingAuthored) console.warn('  - ' + m);
  }
  const talentCount = atlases.reduce((n, a) => n + a.trees.reduce((m, t) => m + t.talents.length, 0), 0);

  const stamp = crypto.createHash('sha1')
    .update(primerMd).update(mapJpg).update(JSON.stringify(atlases))
    .digest('hex').slice(0, 10);

  const nav = headings.map((h) =>
    `<a class="lv${h.level}" href="#${h.id}">${inline(h.text)}</a>`).join('\n');

  const DATA = JSON.stringify(atlases).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Edha — Player's Primer</title>
<style>
:root{--bg:#141a2b;--panel:#1c2438;--panel2:#232d46;--line:#32405f;--txt:#dde4f2;--dim:#93a0bd;
--gold:#d8b76a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.55 "Segoe UI",system-ui,sans-serif}
code{background:#0e1322;border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:13px}
header{position:sticky;top:0;z-index:20;background:var(--panel);border-bottom:1px solid var(--line);padding:8px 16px}
header h1{margin:0 0 6px;font-size:18px;color:var(--gold)}
header .stamp{color:var(--dim);font-size:12px;margin-left:8px;font-weight:normal}
.tabs{display:flex;gap:4px;flex-wrap:wrap;align-items:center}
.tab{background:var(--panel2);border:1px solid var(--line);border-bottom:none;border-radius:8px 8px 0 0;
color:var(--dim);padding:6px 14px;font-size:13.5px;cursor:pointer}
.tab.on{background:var(--gold);border-color:var(--gold);color:#141a2b;font-weight:600}
.tabs input[type=search]{flex:1 1 200px;min-width:150px;background:#0e1322;border:1px solid var(--line);
border-radius:6px;color:var(--txt);padding:6px 10px;font-size:13px;margin-left:auto}
button{cursor:pointer;font:inherit}
.pane{display:none}.pane.on{display:block}
/* ---- world tab ---- */
.world{display:flex;align-items:flex-start;max-width:1200px;margin:0 auto}
.world nav{position:sticky;top:60px;width:265px;flex:0 0 265px;max-height:calc(100vh - 80px);
overflow:auto;padding:14px 6px 30px 12px;font-size:12.5px}
.world nav a{display:block;color:var(--dim);text-decoration:none;padding:4px 8px;border-radius:6px}
.world nav a.lv3{padding-left:22px;font-size:12px}
.world nav a:hover{background:var(--panel2);color:var(--txt)}
.doc{flex:1;min-width:0;padding:14px 26px 80px;max-width:840px}
.doc h1{color:var(--gold);font-size:26px;margin:18px 0 6px}
.doc h2{color:var(--gold);font-size:20px;margin:34px 0 8px;border-bottom:1px solid var(--line);padding-bottom:5px}
.doc h3{font-size:16.5px;margin:26px 0 6px;color:#efe3c2}
.doc blockquote{margin:10px 0;padding:8px 14px;background:var(--panel);border-left:3px solid var(--gold);
border-radius:0 8px 8px 0;color:var(--dim)}
.doc table{border-collapse:collapse;margin:12px 0;width:100%;font-size:13.5px}
.doc th,.doc td{border:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}
.doc th{background:var(--panel2);color:var(--gold)}
.doc tr:nth-child(even) td{background:var(--panel)}
.doc ul{padding-left:22px}
.doc li{margin:4px 0}
.doc hr{border:none;border-top:1px solid var(--line);margin:26px 0}
/* ---- map tab ---- */
.mapwrap{padding:12px;text-align:center}
.mapwrap .hint{color:var(--dim);font-size:12.5px;margin:4px 0 10px}
.mapscroll{overflow:auto;max-height:calc(100vh - 130px);border:1px solid var(--line);border-radius:10px;background:#0e1322}
.mapscroll img{max-width:100%;display:block;margin:0 auto;cursor:zoom-in}
.mapscroll.zoomed img{max-width:none;cursor:zoom-out}
/* ---- atlas tabs ---- */
.atlas{max-width:1400px;margin:0 auto;padding:10px 16px 60px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px}
.chip{background:var(--panel2);border:1px solid var(--line);border-radius:14px;color:var(--txt);
padding:4px 13px;font-size:13px;display:inline-flex;align-items:center;gap:7px}
.chip .pip{width:10px;height:10px;border-radius:50%;display:inline-block}
.chip.on{border-color:var(--gold);background:#2c3652;font-weight:600}
.chip small{color:var(--dim);font-weight:normal}
.treehead{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin-bottom:12px}
.treehead h2{margin:0 0 6px;font-size:19px}
.treehead .intro{color:var(--txt);font-size:13.5px;max-width:1000px}
.treehead .intro h3{color:var(--gold);font-size:14px;margin:12px 0 4px}
.treehead .intro p{margin:6px 0}
.res{margin-top:8px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-size:13px}
.res b{color:var(--gold)}
.atlasbody{display:flex;gap:14px;align-items:flex-start}
.treebox{flex:1;min-width:0;position:relative;background:var(--panel);border:1px solid var(--line);
border-radius:10px;overflow:hidden}
.treebox svg{position:absolute;inset:0;width:100%;height:100%}
.treebox svg line{stroke:#4a5a80;stroke-width:2;vector-effect:non-scaling-stroke}
.node{position:absolute;transform:translate(-50%,-50%);background:var(--panel2);
border:2px solid var(--nc,#888);border-radius:9px;padding:4px 9px;font-size:12px;line-height:1.25;
cursor:pointer;text-align:center;max-width:130px;box-shadow:0 2px 6px rgba(0,0,0,.45)}
.node:hover{background:#2c3652;z-index:5}
.node.sel{z-index:4}
.node.key{border-width:3px;font-weight:600;box-shadow:0 0 12px color-mix(in srgb,var(--nc) 45%,transparent)}
.node.sel{background:var(--nc);color:#10141f;font-weight:600}
.card{position:sticky;top:60px;width:390px;flex:0 0 390px;background:var(--panel);border:1px solid var(--line);
border-radius:10px;padding:14px 16px;max-height:calc(100vh - 80px);overflow:auto;font-size:13.5px}
.card .empty{color:var(--dim)}
.card h3{margin:0 0 2px;font-size:17px;color:var(--gold)}
.card .meta{color:var(--dim);font-size:12px;margin-bottom:8px}
.card .row{margin:3px 0}
.card .row b{color:var(--dim);font-weight:600;margin-right:6px}
.card .body{border-top:1px solid var(--line);margin-top:8px;padding-top:8px}
.card .body p{margin:7px 0}
.card em{color:#c7b9e8}
.ic{color:var(--gold);font-weight:700;letter-spacing:1px}
/* search results */
.results{max-width:900px;margin:0 auto;padding:12px 16px 60px}
.hit{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:8px 0;cursor:pointer}
.hit:hover{background:var(--panel2)}
.hit b{color:var(--gold)}
.hit .where{color:var(--dim);font-size:12px}
.hit .snip{font-size:13px;margin-top:3px}
@media (max-width:980px){
 .world nav{display:none}
 .atlasbody{flex-direction:column}
 .card{position:static;width:auto;flex:none;max-height:none}
 .treebox{flex:none;width:100%}
}
</style>
</head>
<body>
<header>
 <h1>Edha — Player's Primer <span class="stamp">build ${stamp} · ${talentCount} talents</span></h1>
 <div class="tabs">
  <button class="tab on" data-pane="world">The World</button>
  <button class="tab" data-pane="map">The Map</button>
  <button class="tab" data-pane="leyline">Leylines</button>
  <button class="tab" data-pane="deity">Deity Paths</button>
  <button class="tab" data-pane="heroic">Heroic Paths</button>
  <input id="q" type="search" placeholder="Search talents…">
 </div>
</header>

<div class="pane on" id="pane-world">
 <div class="world">
  <nav>
${nav}
  </nav>
  <div class="doc">
${worldHtml}
  </div>
 </div>
</div>

<div class="pane" id="pane-map">
 <div class="mapwrap">
  <div class="hint">Thyrcross — one continent, ten nations, ~4,000 km top to bottom. Click the map to zoom.</div>
  <div class="mapscroll" id="mapscroll"><img src="${mapUri}" alt="Map of Thyrcross"></div>
 </div>
</div>

<div class="pane" id="pane-leyline"><div class="atlas" id="atlas-leyline"></div></div>
<div class="pane" id="pane-deity"><div class="atlas" id="atlas-deity"></div></div>
<div class="pane" id="pane-heroic"><div class="atlas" id="atlas-heroic"></div></div>

<div class="pane" id="pane-search"><div class="results" id="results"></div></div>

<script>
const ATLASES = ${DATA};

const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

// ---- tabs ----
let lastPane = 'world';
function showPane(id) {
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + id));
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.pane === id));
  if (id !== 'search') lastPane = id;
}
$$('.tab').forEach(t => t.addEventListener('click', () => { $('#q').value = ''; showPane(t.dataset.pane); }));

// ---- map zoom ----
$('#mapscroll').addEventListener('click', () => $('#mapscroll').classList.toggle('zoomed'));

// ---- atlas rendering ----
const state = {};   // atlasId -> {treeId, sel}

function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

function fallbackCard(t) {
  let h = '';
  h += '<div class="row"><b>Activation</b>' + esc(t.action || '—') + '</div>';
  if (t.cost && t.cost !== '—') h += '<div class="row"><b>Cost</b>' + esc(t.cost) + '</div>';
  if (t.flavor) h += '<p><em>' + esc(t.flavor) + '</em></p>';
  h += '<p>' + esc(t.desc || '') + '</p>';
  return h;
}

function renderCard(atlas, tree, t) {
  const card = $('#card-' + atlas.id);
  if (!t) { card.innerHTML = '<div class="empty">Click a talent to read its card.</div>'; return; }
  card.innerHTML =
    '<h3>' + esc(t.name) + '</h3>' +
    '<div class="meta">' + esc(tree.label) + (tree.sub ? ' — ' + esc(tree.sub) : '') +
      ' · ' + esc(t.specialty) + '</div>' +
    '<div class="row"><b>Prerequisites</b>' + esc(t.prereq || '—') + '</div>' +
    '<div class="body">' + (t.card || fallbackCard(t)) + '</div>';
}

function renderTree(atlas, tree) {
  const box = $('#tree-' + atlas.id);
  const H = Math.max(520, Math.round(78 * (tree.talents.length > 12 ? 9 : 6)));
  box.style.height = H + 'px';
  const pos = {};
  for (const t of tree.talents) pos[t.name] = t;
  let svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none">';
  for (const t of tree.talents) for (const c of t.conn) {
    const p = pos[c];
    if (!p) continue;
    svg += '<line x1="' + (p.x * 100) + '" y1="' + (p.y * 100) + '" x2="' + (t.x * 100) + '" y2="' + (t.y * 100) + '"/>';
  }
  svg += '</svg>';
  let nodes = '';
  const selName = state[atlas.id].sel;
  for (const t of tree.talents) {
    nodes += '<div class="node' + (t.key ? ' key' : '') + (t.name === selName ? ' sel' : '') +
      '" data-name="' + esc(t.name) +
      '" style="left:' + (t.x * 100) + '%;top:' + (t.y * 100) + '%;--nc:' + tree.color + '">' +
      esc(t.name) + '</div>';
  }
  box.innerHTML = svg + nodes;
  $$('.node', box).forEach(n => n.addEventListener('click', () => selectTalent(atlas, tree, n.dataset.name)));
  renderCard(atlas, tree, tree.talents.find(t => t.name === state[atlas.id].sel) || null);
}

function selectTalent(atlas, tree, name) {
  state[atlas.id].sel = name;
  const box = $('#tree-' + atlas.id);
  $$('.node', box).forEach(n => n.classList.toggle('sel', n.dataset.name === name));
  renderCard(atlas, tree, tree.talents.find(t => t.name === name));
}

function renderAtlas(atlas) {
  const el = $('#atlas-' + atlas.id);
  const st = state[atlas.id];
  const tree = atlas.trees.find(t => t.id === st.treeId);
  let chips = '<div class="chips">';
  for (const t of atlas.trees) {
    chips += '<button class="chip' + (t.id === tree.id ? ' on' : '') + '" data-tree="' + t.id + '">' +
      '<span class="pip" style="background:' + t.color + '"></span>' +
      (t.color2 !== t.color ? '<span class="pip" style="background:' + t.color2 + ';margin-left:-9px"></span>' : '') +
      esc(t.label) + (t.sub ? ' <small>' + esc(t.sub) + '</small>' : '') + '</button>';
  }
  chips += '</div>';
  let head = '<div class="treehead"><h2 style="color:' + tree.color + '">' + esc(t2label(tree)) + '</h2>' +
    '<div class="intro">' + tree.intro + '</div>';
  for (const r of tree.resources) {
    head += '<div class="res"><b>' + esc(r.name) + '</b> — <i>' + esc(r.source) + '.</i> ' + esc(r.summary) + '</div>';
  }
  head += '</div>';
  el.innerHTML = chips + head +
    '<div class="atlasbody"><div class="treebox" id="tree-' + atlas.id + '"></div>' +
    '<div class="card" id="card-' + atlas.id + '"></div></div>';
  $$('.chip', el).forEach(c => c.addEventListener('click', () => {
    st.treeId = c.dataset.tree; st.sel = null; renderAtlas(atlas);
  }));
  renderTree(atlas, tree);
}

function t2label(tree) {
  return tree.label + (tree.sub ? ' — ' + tree.sub : '');
}

for (const atlas of ATLASES) {
  state[atlas.id] = { treeId: atlas.trees[0].id, sel: null };
  renderAtlas(atlas);
}

// ---- search ----
const INDEX = [];
for (const atlas of ATLASES) for (const tree of atlas.trees) for (const t of tree.talents) {
  INDEX.push({ atlas, tree, t, hay: (t.name + ' ' + t.specialty + ' ' + (t.desc || '')).toLowerCase() });
}
$('#q').addEventListener('input', () => {
  const q = $('#q').value.trim().toLowerCase();
  if (!q) { showPane(lastPane); return; }
  const hits = INDEX.filter(e => e.hay.includes(q)).slice(0, 60);
  const res = $('#results');
  res.innerHTML = hits.length
    ? hits.map((e, i) => '<div class="hit" data-i="' + i + '"><b>' + esc(e.t.name) + '</b>' +
        ' <span class="where">' + esc(e.atlas.label) + ' · ' + esc(t2label(e.tree)) + ' · ' + esc(e.t.specialty) + '</span>' +
        '<div class="snip">' + esc((e.t.desc || '').slice(0, 180)) + '</div></div>').join('')
    : '<p style="color:var(--dim)">No talents match “' + esc(q) + '”.</p>';
  $$('.hit', res).forEach(h => h.addEventListener('click', () => {
    const e = hits[+h.dataset.i];
    $('#q').value = '';
    state[e.atlas.id].treeId = e.tree.id;
    state[e.atlas.id].sel = e.t.name;
    renderAtlas(e.atlas);
    showPane(e.atlas.id);
  }));
  showPane('search');
});
</script>
</body>
</html>
`;

  if (check) {
    const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (existing !== html) {
      console.error('EDHA_PLAYER_PRIMER.html is stale — run: node scripts/build-player-primer.js');
      process.exit(1);
    }
    console.log('EDHA_PLAYER_PRIMER.html is up to date.');
    return;
  }
  fs.writeFileSync(OUT, html);
  console.log('wrote EDHA_PLAYER_PRIMER.html (' + Math.round(html.length / 1024) + ' KB, ' +
    talentCount + ' talents, build ' + stamp + ')');
}

main();
