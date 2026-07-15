#!/usr/bin/env node
/**
 * build-canon-codex.js — EDHA_CAMPAIGN_CANON.md + thyrcross.map.json → EDHA_CANON_CODEX.html
 *
 * The Atlas+Codex: Ben's human-facing window onto the canon. Left pane is the Thyrcross
 * map (pan/zoom, political overlay, every gazetteer place as a clickable marker — capitals
 * starred); right pane is the canon doc rendered with a TOC and live text search. The two
 * panes are cross-linked: click a marker → jump to the canon section that covers it; click
 * a place-name in the canon text → the map flies there. "Which city is Thalendor's
 * capital?" is now: type capital in search, or click Thalendor on the map.
 *
 * The canon MD stays the single source of truth (agents write it); this page is generated.
 * Map images load as relative <img> tags (file:// allows), so open by double-clicking —
 * no server needed. The gazetteer is inlined at build time.
 *
 * Deterministic: no timestamps — the only stamp is a hash of the sources, so CI can diff.
 *
 * Usage:
 *   node scripts/build-canon-codex.js           # (re)write EDHA_CANON_CODEX.html
 *   node scripts/build-canon-codex.js --check   # exit 1 if the committed codex is stale
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC_MD = path.join(ROOT, 'EDHA_CAMPAIGN_CANON.md');
const SRC_GAZ = path.join(ROOT, 'source-materials', 'maps', 'thyrcross.map.json');
const OUT = path.join(ROOT, 'EDHA_CANON_CODEX.html');

// ---------------------------------------------------------------------------
// Markdown → blocks (the subset the canon doc actually uses: h1–h4, tables,
// flat - / 1. lists, > blockquotes, ---, prose paragraphs w/ hard-wrap reflow)
// ---------------------------------------------------------------------------

function parseMd(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  const peek = () => lines[i];

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) { i++; continue; }

    const h = line.match(/^(#{1,4}) (.*)$/);
    if (h) { blocks.push({ type: 'h', level: h[1].length, text: h[2] }); i++; continue; }

    if (/^---+\s*$/.test(line)) { blocks.push({ type: 'hr' }); i++; continue; }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(peek())) {
        const cells = peek().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!/^[-:\s|]+$/.test(peek().replace(/\|/g, ''))) rows.push(cells);
        i++;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }

    const bq = line.match(/^> ?(.*)$/);
    if (bq) {
      const parts = [bq[1]];
      i++;
      while (i < lines.length && /^> ?/.test(peek())) { parts.push(peek().replace(/^> ?/, '')); i++; }
      blocks.push({ type: 'quote', text: parts.join(' ') });
      continue;
    }

    const li = line.match(/^- (.*)$/);
    if (li) {
      const items = [];
      while (i < lines.length) {
        const m = peek().match(/^- (.*)$/);
        if (m) { items.push(m[1]); i++; }
        else if (/^ {2,}\S/.test(peek()) && items.length) { items[items.length - 1] += ' ' + peek().trim(); i++; }
        else break;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    const ol = line.match(/^(\d+)\. (.*)$/);
    if (ol) {
      const items = [];
      while (i < lines.length) {
        const m = peek().match(/^(\d+)\. (.*)$/);
        if (m) { items.push({ n: +m[1], text: m[2] }); i++; }
        else if (/^ {2,}\S/.test(peek()) && items.length) { items[items.length - 1].text += ' ' + peek().trim(); i++; }
        else break;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // prose paragraph — reflow hard-wrapped lines until a blank or a block starter
    const parts = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(peek()) &&
           !/^(#{1,4} |---+\s*$|\||- |\d+\. |> )/.test(peek())) {
      parts.push(peek().trim());
      i++;
    }
    blocks.push({ type: 'p', text: parts.join(' ') });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Inline rendering: escape → `code` / **bold** / *italic* → place-name links
// ---------------------------------------------------------------------------

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildPlaceIndex(gaz) {
  // name (lowercased) → { kind, id, px, label } for everything clickable on the map
  const places = [];
  for (const n of gaz.nations) {
    places.push({ kind: 'nation', id: n.id, name: n.name, px: n.anchor_px });
  }
  for (const s of gaz.sites) {
    places.push({ kind: 'site', id: s.id, name: s.name || s.id, px: s.px });
  }
  for (const c of gaz.cities) {
    if (c.name && !places.some(p => p.name.toLowerCase() === c.name.toLowerCase())) {
      places.push({ kind: 'city', id: c.id, name: c.name, px: c.px });
    }
  }
  return places;
}

function makeLinkifier(places) {
  // longest names first so "Palewater Ford" wins over any shorter overlap
  const sorted = [...places].sort((a, b) => b.name.length - a.name.length);
  const re = new RegExp(
    '\\b(' + sorted.map(p => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'g');
  const byLower = new Map(sorted.map(p => [p.name.toLowerCase(), p]));
  return html =>
    // operate on text between tags only, so attribute values never get linkified
    html.split(/(<[^>]+>)/).map(seg => {
      if (seg.startsWith('<')) return seg;
      return seg.replace(re, m => {
        const p = byLower.get(m.toLowerCase());
        return `<a class="pl" data-px="${p.px[0]},${p.px[1]}" data-place="${esc(p.name)}">${m}</a>`;
      });
    }).join('');
}

function inline(text, linkify) {
  let h = esc(text);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  return linkify ? linkify(h) : h;
}

// ---------------------------------------------------------------------------
// Blocks → article HTML + TOC + place→anchor map
// ---------------------------------------------------------------------------

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s§-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70);
}

function renderDoc(blocks, places, linkify) {
  const toc = [];
  const seen = new Map(); // slug → count, for uniqueness
  const out = [];
  // heading anchor per place: prefer a heading that NAMES the place, else the
  // first section whose body mentions it (walked in doc order below)
  const anchorFor = new Map(); // place name (lower) → slug
  let curSlug = '';

  const noteMention = text => {
    const low = text.toLowerCase();
    for (const p of places) {
      const key = p.name.toLowerCase();
      if (!anchorFor.has(key) && curSlug && low.includes(key)) anchorFor.set(key, curSlug);
    }
  };

  for (const b of blocks) {
    if (b.type === 'h') {
      let slug = slugify(b.text) || 'section';
      const n = (seen.get(slug) || 0) + 1;
      seen.set(slug, n);
      if (n > 1) slug += '-' + n;
      curSlug = slug;
      if (b.level >= 2) toc.push({ level: b.level, text: b.text, slug });
      out.push(`<h${b.level} id="${slug}">${inline(b.text, linkify)}<a class="hlink" href="#${slug}">#</a></h${b.level}>`);
      // a heading that literally names a place is that place's canonical anchor
      const low = b.text.toLowerCase();
      for (const p of places) {
        const key = p.name.toLowerCase();
        if (low.includes(key)) anchorFor.set(key, slug);
      }
      continue;
    }
    if (b.type === 'hr') { out.push('<hr>'); continue; }
    if (b.type === 'p') { noteMention(b.text); out.push(`<p>${inline(b.text, linkify)}</p>`); continue; }
    if (b.type === 'quote') { noteMention(b.text); out.push(`<blockquote>${inline(b.text, linkify)}</blockquote>`); continue; }
    if (b.type === 'ul') {
      noteMention(b.items.join(' '));
      out.push('<ul>' + b.items.map(t => `<li>${inline(t, linkify)}</li>`).join('') + '</ul>');
      continue;
    }
    if (b.type === 'ol') {
      noteMention(b.items.map(x => x.text).join(' '));
      out.push('<ol>' + b.items.map(x => `<li value="${x.n}">${inline(x.text, linkify)}</li>`).join('') + '</ol>');
      continue;
    }
    if (b.type === 'table') {
      noteMention(b.rows.flat().join(' '));
      const [head, ...body] = b.rows;
      out.push('<div class="tblwrap"><table><thead><tr>' +
        head.map(c => `<th>${inline(c, linkify)}</th>`).join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => `<td>${inline(c, linkify)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }
  }
  return { article: out.join('\n'), toc, anchorFor };
}

// ---------------------------------------------------------------------------
// Page template
// ---------------------------------------------------------------------------

function buildPage() {
  // LF-normalize at the read so the stamp is platform-independent: an autocrlf
  // working tree (CRLF) and CI's LF checkout must hash identically (the 15c/15d
  // bench-sheet lesson — a --check failing on the stamp alone is line endings)
  const md = fs.readFileSync(SRC_MD, 'utf8').replace(/\r\n/g, '\n');
  const gazText = fs.readFileSync(SRC_GAZ, 'utf8').replace(/\r\n/g, '\n');
  const gaz = JSON.parse(gazText);
  const stamp = crypto.createHash('sha256')
    .update(md).update(gazText).digest('hex').slice(0, 12);

  const places = buildPlaceIndex(gaz);
  const linkify = makeLinkifier(places);
  const blocks = parseMd(md);
  const { article, toc, anchorFor } = renderDoc(blocks, places, linkify);

  // marker payload for the map pane
  const markers = places.map(p => {
    const site = p.kind === 'site' ? gaz.sites.find(s => s.id === p.id) : null;
    const city = p.kind === 'city' ? gaz.cities.find(c => c.id === p.id) : null;
    const note = (site && site.note) || '';
    return {
      kind: p.kind, id: p.id, name: p.name, px: p.px,
      capital: /\bcapital\b/i.test(note),
      painted: site ? site.painted !== false : (city ? city.painted !== false : true),
      note,
      anchor: anchorFor.get(p.name.toLowerCase()) || '',
      letter: p.kind === 'nation' ? gaz.nations.find(n => n.id === p.id).map_letter : '',
    };
  });
  const cityDots = gaz.cities.filter(c => !c.name).map(c => ({ id: c.id, px: c.px, nation: c.nation }));

  const tocHtml = toc.map(t =>
    `<a class="t${t.level}" href="#${t.slug}">${esc(t.text)}</a>`).join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Edha Canon Codex — Thyrcross Atlas</title>
<style>
 :root{--bg:#10131c;--panel:#151a26;--line:#2a3350;--ink:#dde;--dim:#9aa3c0;--gold:#ffd24d;--link:#7fd7ff;--mark:#ff3b8d}
 html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,Segoe UI,sans-serif;overflow:hidden}
 #top{position:fixed;top:0;left:0;right:0;height:46px;z-index:20;background:#151a26ee;border-bottom:1px solid var(--line);
      display:flex;gap:14px;align-items:center;padding:0 14px}
 #top b{color:var(--gold);white-space:nowrap}
 #search{flex:0 1 340px;background:#0d1018;color:var(--ink);border:1px solid var(--line);border-radius:5px;padding:5px 10px}
 #hits{color:var(--dim);font-size:13px;min-width:90px}
 button{background:#2a3350;color:var(--ink);border:1px solid #3d4a75;border-radius:4px;padding:3px 10px;cursor:pointer}
 #stamp{margin-left:auto;color:#566;font-size:11px;font-family:ui-monospace,Consolas,monospace}
 #wrap{position:absolute;inset:46px 0 0 0;display:flex}
 /* ------- map pane ------- */
 #mapPane{flex:0 0 44%;min-width:280px;position:relative;border-right:1px solid var(--line);overflow:hidden;cursor:grab;background:#0a0d14}
 #mapPane.collapsed{display:none}
 #world{position:absolute;transform-origin:0 0}
 #world img{position:absolute;top:0;left:0;display:block;pointer-events:none}
 .mk{position:absolute;transform:translate(-50%,-50%);cursor:pointer;white-space:nowrap;z-index:5}
 .mk .dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#e61e1e;border:2px solid #fff;box-shadow:0 0 5px #000}
 .mk.city .dot{width:9px;height:9px;background:#aab;border:1px solid #333}
 .mk.nation .dot{display:none}
 .mk .lb{position:absolute;left:12px;top:-26px;background:#000c;color:#ffb3c8;padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px}
 .mk.nation .lb{position:static;background:#000c;color:var(--gold);font-size:15px;padding:3px 10px}
 .mk.capital .lb::before{content:"★ ";color:var(--gold)}
 .mk.unpainted .lb::after{content:" 🖌";font-size:11px}
 #info{position:absolute;left:10px;bottom:10px;max-width:430px;z-index:8;background:#151a26f2;border:1px solid var(--line);
       border-radius:8px;padding:12px 14px;display:none;font-size:13px}
 #info h3{margin:0 0 4px;color:var(--gold);font-size:15px}
 #info .k{color:var(--dim)}
 #info a{color:var(--link);cursor:pointer}
 #mapHud{position:absolute;top:8px;left:10px;z-index:8;display:flex;gap:10px;align-items:center;background:#151a26cc;
         border:1px solid var(--line);border-radius:6px;padding:4px 10px;font-size:12px}
 #mapHud label{cursor:pointer;user-select:none}
 /* ------- doc pane ------- */
 #docPane{flex:1;display:flex;min-width:0}
 #toc{flex:0 0 250px;overflow-y:auto;border-right:1px solid var(--line);padding:12px 8px;background:var(--panel);font-size:12.5px}
 #toc a{display:block;color:var(--dim);text-decoration:none;padding:2px 6px;border-radius:4px;line-height:1.35}
 #toc a:hover{color:var(--ink);background:#232b42}
 #toc .t2{margin-top:7px;color:var(--ink);font-weight:600}
 #toc .t3{padding-left:16px}
 #toc .t4{padding-left:30px}
 #doc{flex:1;overflow-y:auto;padding:18px 34px 60vh;min-width:0}
 #doc h1{color:var(--gold);font-size:26px;border-bottom:1px solid var(--line);padding-bottom:6px}
 #doc h2{color:var(--gold);font-size:21px;margin-top:38px;border-bottom:1px solid var(--line);padding-bottom:4px}
 #doc h3{font-size:17px;margin-top:30px;color:#ffe9a8}
 #doc h4{font-size:15.5px;margin-top:24px;color:#ffe9a8}
 .hlink{visibility:hidden;margin-left:8px;color:var(--dim);text-decoration:none;font-weight:400}
 h1:hover .hlink,h2:hover .hlink,h3:hover .hlink,h4:hover .hlink{visibility:visible}
 #doc blockquote{border-left:3px solid #3d4a75;margin:12px 0;padding:4px 14px;color:var(--dim);font-style:italic}
 #doc code{background:#232b42;border-radius:3px;padding:1px 5px;font-size:13px}
 .tblwrap{overflow-x:auto;margin:12px 0}
 #doc table{border-collapse:collapse;font-size:13.5px}
 #doc th,#doc td{border:1px solid var(--line);padding:5px 9px;text-align:left;vertical-align:top}
 #doc th{background:#1c2336;color:var(--gold)}
 #doc tr:nth-child(even){background:#131826}
 a.pl{color:var(--link);text-decoration:none;border-bottom:1px dotted #3d6a85;cursor:pointer}
 a.pl:hover{border-bottom-style:solid}
 mark{background:var(--mark);color:#fff;border-radius:2px;padding:0 1px}
 mark.cur{outline:2px solid #fff}
</style></head><body>
<div id="top">
 <b>Edha Canon Codex</b>
 <button id="mapToggle" title="show/hide the map pane">🗺 map</button>
 <input id="search" type="search" placeholder="search the canon…  (Enter = next hit)">
 <span id="hits"></span>
 <span id="stamp">src ${stamp}</span>
</div>
<div id="wrap">
 <div id="mapPane">
  <div id="world">
   <img id="base" src="source-materials/maps/thyrcross.png">
   <img id="pol" src="source-materials/maps/thyrcross-political.png" style="opacity:.35">
  </div>
  <div id="mapHud">
   <label><input type="checkbox" id="tg-pol" checked> political</label>
   <label><input type="checkbox" id="tg-cit" checked> city dots</label>
   <span id="cursor" style="font-family:ui-monospace,Consolas,monospace"></span>
  </div>
  <div id="info"></div>
 </div>
 <div id="docPane">
  <nav id="toc">${tocHtml}</nav>
  <main id="doc">${article}</main>
 </div>
</div>
<script>
const MARKERS = ${JSON.stringify(markers)};
const CITY_DOTS = ${JSON.stringify(cityDots)};
const CANVAS = ${JSON.stringify(gaz.meta.canvas_px)};
const KPP = ${gaz.meta.km_per_px};

// ---- map pane: pan/zoom + markers -----------------------------------------
const pane = document.getElementById('mapPane'), world = document.getElementById('world');
const info = document.getElementById('info'), cursor = document.getElementById('cursor');
let scale = 0.22, ox = 10, oy = 10, panning = false, px0, py0, moved = 0;
const apply = () => world.style.transform = \`translate(\${ox}px,\${oy}px) scale(\${scale})\`;

function markerEl(m){
  const el = document.createElement('div');
  el.className = 'mk ' + m.kind + (m.capital ? ' capital' : '') + (!m.painted ? ' unpainted' : '');
  el.style.left = m.px[0] + 'px'; el.style.top = m.px[1] + 'px';
  el.innerHTML = '<span class="dot"></span><span class="lb">' +
    (m.kind === 'nation' ? m.letter + '&nbsp; ' : '') + m.name + '</span>';
  el.addEventListener('click', e => { e.stopPropagation(); showInfo(m); });
  return el;
}
function fitMarkerScale(){
  // labels/dots keep constant screen size: inverse-scale each marker
  for (const el of world.querySelectorAll('.mk')) el.style.transform =
    \`translate(-50%,-50%) scale(\${Math.min(6, 1/scale)})\`;
}
for (const m of MARKERS) world.appendChild(markerEl(m));
for (const c of CITY_DOTS){
  const el = document.createElement('div');
  el.className = 'mk city dotonly'; el.dataset.cid = c.id;
  el.style.left = c.px[0] + 'px'; el.style.top = c.px[1] + 'px';
  el.innerHTML = '<span class="dot" title="' + c.id + '"></span>';
  el.addEventListener('click', e => { e.stopPropagation(); showInfo({ kind:'city', id:c.id, name:c.id + ' (unnamed)', px:c.px, note:'One of the 29 drawn city markers — not yet named in canon.', anchor:'', painted:true }); });
  world.appendChild(el);
}
apply(); fitMarkerScale();

function showInfo(m){
  const km = (m.px[0]*KPP).toFixed(0) + ', ' + (m.px[1]*KPP).toFixed(0) + ' km';
  info.innerHTML = '<h3>' + (m.capital ? '★ ' : '') + m.name + '</h3>' +
    '<div class="k">' + m.kind + ' · px(' + m.px[0] + ', ' + m.px[1] + ') · ' + km +
    (m.painted === false ? ' · <b style="color:#ff8ab0">not yet on Ben\\'s painted map</b>' : '') + '</div>' +
    (m.note ? '<p>' + m.note + '</p>' : '') +
    (m.anchor ? '<a onclick="jumpTo(\\'' + m.anchor + '\\')">→ canon section</a>' : '');
  info.style.display = 'block';
}
window.jumpTo = slug => {
  const el = document.getElementById(slug);
  // instant, not smooth: jumps span 100k+ px and smooth animation can starve
  if (el) el.scrollIntoView({ block: 'start' });
};
window.flyTo = (x, y, name) => {
  const r = pane.getBoundingClientRect();
  scale = Math.max(scale, 0.55);
  ox = r.width/2 - x*scale; oy = r.height/2 - y*scale;
  apply(); fitMarkerScale();
  const m = MARKERS.find(mm => mm.name.toLowerCase() === (name||'').toLowerCase());
  if (m) showInfo(m);
};
pane.addEventListener('mousedown', e => { panning = true; moved = 0; px0 = e.clientX; py0 = e.clientY; pane.style.cursor = 'grabbing'; });
window.addEventListener('mouseup', () => { panning = false; pane.style.cursor = 'grab'; });
window.addEventListener('mousemove', e => {
  if (panning){ ox += e.clientX - px0; oy += e.clientY - py0; moved += Math.abs(e.clientX-px0)+Math.abs(e.clientY-py0); px0 = e.clientX; py0 = e.clientY; apply(); }
  const r = pane.getBoundingClientRect();
  const x = (e.clientX - r.left - ox)/scale, y = (e.clientY - r.top - oy)/scale;
  if (x>=0 && y>=0 && x<=CANVAS[0] && y<=CANVAS[1]) cursor.textContent = '(' + Math.round(x) + ', ' + Math.round(y) + ')';
});
pane.addEventListener('wheel', e => {
  e.preventDefault();
  const r = pane.getBoundingClientRect();
  const mx = (e.clientX - r.left - ox)/scale, my = (e.clientY - r.top - oy)/scale;
  scale = Math.min(4, Math.max(0.06, scale * (e.deltaY < 0 ? 1.15 : 1/1.15)));
  ox = e.clientX - r.left - mx*scale; oy = e.clientY - r.top - my*scale;
  apply(); fitMarkerScale();
}, { passive:false });
pane.addEventListener('click', () => info.style.display = 'none');
document.getElementById('tg-pol').onchange = e => document.getElementById('pol').style.display = e.target.checked ? '' : 'none';
document.getElementById('tg-cit').onchange = e => {
  for (const el of world.querySelectorAll('.dotonly')) el.style.display = e.target.checked ? '' : 'none';
};
document.getElementById('mapToggle').onclick = () => pane.classList.toggle('collapsed');

// place-name links in the canon text fly the map
document.getElementById('doc').addEventListener('click', e => {
  const a = e.target.closest('a.pl');
  if (!a) return;
  const [x, y] = a.dataset.px.split(',').map(Number);
  pane.classList.remove('collapsed');
  flyTo(x, y, a.dataset.place);
});

// ---- search ----------------------------------------------------------------
const doc = document.getElementById('doc'), hits = document.getElementById('hits');
const searchBox = document.getElementById('search');
let marks = [], cur = -1;
function clearMarks(){
  for (const m of marks){ const t = document.createTextNode(m.textContent); m.replaceWith(t); }
  doc.normalize(); marks = []; cur = -1;
}
function runSearch(q){
  clearMarks();
  if (!q || q.length < 2){ hits.textContent = ''; return; }
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const targets = [];
  const ql = q.toLowerCase();
  let node;
  while ((node = walker.nextNode())){
    const low = node.textContent.toLowerCase();
    if (low.includes(ql)) targets.push(node);
  }
  for (const t of targets){
    const frag = document.createDocumentFragment();
    let rest = t.textContent;
    let idx;
    while ((idx = rest.toLowerCase().indexOf(ql)) !== -1){
      frag.appendChild(document.createTextNode(rest.slice(0, idx)));
      const mk = document.createElement('mark');
      mk.textContent = rest.slice(idx, idx + q.length);
      frag.appendChild(mk); marks.push(mk);
      rest = rest.slice(idx + q.length);
    }
    frag.appendChild(document.createTextNode(rest));
    t.replaceWith(frag);
  }
  hits.textContent = marks.length ? marks.length + ' hit(s)' : 'no hits';
  if (marks.length) next();
}
function next(dir = 1){
  if (!marks.length) return;
  if (cur >= 0) marks[cur].classList.remove('cur');
  cur = (cur + dir + marks.length) % marks.length;
  marks[cur].classList.add('cur');
  marks[cur].scrollIntoView({ block: 'center' });
  hits.textContent = (cur + 1) + ' / ' + marks.length;
}
let deb;
searchBox.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(() => runSearch(searchBox.value), 250); });
searchBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') next(e.shiftKey ? -1 : 1);
  if (e.key === 'Escape'){ searchBox.value = ''; runSearch(''); }
});
</script></body></html>
`;
}

// ---------------------------------------------------------------------------

function main() {
  const html = buildPage();
  if (process.argv.includes('--check')) {
    const committed = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (committed.replace(/\r\n/g, '\n') !== html.replace(/\r\n/g, '\n')) {
      console.error('EDHA_CANON_CODEX.html is stale — run: node scripts/build-canon-codex.js');
      process.exit(1);
    }
    console.log('codex in sync');
    return;
  }
  fs.writeFileSync(OUT, html);
  console.log(`codex -> ${OUT}  (open by double-clicking; regenerate after canon/gazetteer edits)`);
}

main();
