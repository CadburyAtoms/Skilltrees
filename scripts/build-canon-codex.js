#!/usr/bin/env node
/**
 * build-canon-codex.js — EDHA_CAMPAIGN_CANON.md + thyrcross.map.json → EDHA_CANON_CODEX.html
 *
 * The Atlas+Codex: Ben's human-facing window onto the canon. Left pane is the Thyrcross
 * map (pan/zoom, political overlay, every gazetteer place as a clickable marker — capitals
 * starred); right pane is the canon doc rendered with a TOC and live text search. The two
 * panes are cross-linked: click a marker → jump to the canon section that covers it; click
 * a place-name in the canon text → the map flies there.
 *
 * EDITABLE (Ben, 2026-07-15): ✏ edit mode opens any block as its raw markdown; saves
 * re-render in place (the md engine below is embedded into the page verbatim, so browser
 * renders match build renders). Edits persist three ways, weakest to strongest:
 *   - localStorage draft (automatic, survives closing the tab);
 *   - 💾 write EDHA_CAMPAIGN_CANON.md in the working tree (File System Access API —
 *     Chrome/Edge; pick the file once, the handle is remembered);
 *   - ⬆ commit to GitHub (Contents API, branch `codex-canon-edits`, auto-opens a PR) —
 *     needs a PAT with repo contents+pulls scope, stored in the browser's localStorage.
 * The page can NOT run git or regenerate itself: after edits land in the MD, the next
 * session (or `node scripts/build-canon-codex.js`) regenerates — CI flags the stale codex
 * on the PR, which is the honest signal, not an error.
 *
 * The canon MD stays the single source of truth; this page is generated. Map images load
 * as relative <img> tags (file:// allows), so open by double-clicking — no server needed.
 *
 * Deterministic: no timestamps — the only stamp is a hash of the LF-normalized sources.
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
// The MD engine. Everything between the ENGINE markers is ALSO embedded into
// the page verbatim (via Function.prototype.toString), so the browser re-render
// after an edit is pixel-identical to the build-time render. Keep these six
// functions dependency-free (no fs/require/node globals) and declared as plain
// `function` statements — arrow consts don't stringify with their names.
// ---------------------------------------------------------------------------

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s§-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70);
}

// Markdown → blocks (the subset the canon doc actually uses: h1–h4, tables,
// flat - / 1. lists, > blockquotes, ---, prose paragraphs w/ hard-wrap reflow).
// Every block records its source line range [l0, l1) so the editor can splice.
function parseMd(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  const peek = () => lines[i];

  while (i < lines.length) {
    const line = lines[i];
    const l0 = i;

    if (/^\s*$/.test(line)) { i++; continue; }

    const h = line.match(/^(#{1,4}) (.*)$/);
    if (h) { i++; blocks.push({ type: 'h', level: h[1].length, text: h[2], l0, l1: i }); continue; }

    if (/^---+\s*$/.test(line)) { i++; blocks.push({ type: 'hr', l0, l1: i }); continue; }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(peek())) {
        const cells = peek().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!/^[-:\s|]+$/.test(peek().replace(/\|/g, ''))) rows.push(cells);
        i++;
      }
      blocks.push({ type: 'table', rows, l0, l1: i });
      continue;
    }

    const bq = line.match(/^> ?(.*)$/);
    if (bq) {
      const parts = [bq[1]];
      i++;
      while (i < lines.length && /^> ?/.test(peek())) { parts.push(peek().replace(/^> ?/, '')); i++; }
      blocks.push({ type: 'quote', text: parts.join(' '), l0, l1: i });
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
      blocks.push({ type: 'ul', items, l0, l1: i });
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
      blocks.push({ type: 'ol', items, l0, l1: i });
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
    blocks.push({ type: 'p', text: parts.join(' '), l0, l1: i });
  }
  return blocks;
}

function makeLinkifier(places) {
  // longest names first so "Palewater Ford" wins over any shorter overlap
  const sorted = places.slice().sort((a, b) => b.name.length - a.name.length);
  const re = new RegExp(
    '\\b(' + sorted.map(p => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'g');
  const byLower = new Map(sorted.map(p => [p.name.toLowerCase(), p]));
  return function (html) {
    // operate on text between tags only, so attribute values never get linkified
    return html.split(/(<[^>]+>)/).map(seg => {
      if (seg.startsWith('<')) return seg;
      return seg.replace(re, m => {
        const p = byLower.get(m.toLowerCase());
        return '<a class="pl" data-px="' + p.px[0] + ',' + p.px[1] + '" data-place="' +
          esc(p.name) + '">' + m + '</a>';
      });
    }).join('');
  };
}

// Inline rendering: escape → `code` / **bold** / *italic* → place-name links
function inline(text, linkify) {
  let h = esc(text);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  return linkify ? linkify(h) : h;
}

// Blocks → article HTML + TOC + place→anchor map. Every top-level element
// carries data-l="l0:l1" (source line range) for the block editor.
function renderDoc(blocks, places, linkify) {
  const toc = [];
  const seen = new Map(); // slug → count, for uniqueness
  const out = [];
  const anchorFor = new Map(); // place name (lower) → slug
  let curSlug = '';

  const noteMention = text => {
    const low = text.toLowerCase();
    for (const p of places) {
      const key = p.name.toLowerCase();
      if (!anchorFor.has(key) && curSlug && low.includes(key)) anchorFor.set(key, curSlug);
    }
  };
  const dl = b => ' data-l="' + b.l0 + ':' + b.l1 + '"';

  for (const b of blocks) {
    if (b.type === 'h') {
      let slug = slugify(b.text) || 'section';
      const n = (seen.get(slug) || 0) + 1;
      seen.set(slug, n);
      if (n > 1) slug += '-' + n;
      curSlug = slug;
      if (b.level >= 2) toc.push({ level: b.level, text: b.text, slug });
      out.push('<h' + b.level + ' id="' + slug + '"' + dl(b) + '>' + inline(b.text, linkify) +
        '<a class="hlink" href="#' + slug + '">#</a></h' + b.level + '>');
      const low = b.text.toLowerCase();
      for (const p of places) {
        const key = p.name.toLowerCase();
        if (low.includes(key)) anchorFor.set(key, slug);
      }
      continue;
    }
    if (b.type === 'hr') { out.push('<hr' + dl(b) + '>'); continue; }
    if (b.type === 'p') { noteMention(b.text); out.push('<p' + dl(b) + '>' + inline(b.text, linkify) + '</p>'); continue; }
    if (b.type === 'quote') { noteMention(b.text); out.push('<blockquote' + dl(b) + '>' + inline(b.text, linkify) + '</blockquote>'); continue; }
    if (b.type === 'ul') {
      noteMention(b.items.join(' '));
      out.push('<ul' + dl(b) + '>' + b.items.map(t => '<li>' + inline(t, linkify) + '</li>').join('') + '</ul>');
      continue;
    }
    if (b.type === 'ol') {
      noteMention(b.items.map(x => x.text).join(' '));
      out.push('<ol' + dl(b) + '>' + b.items.map(x => '<li value="' + x.n + '">' + inline(x.text, linkify) + '</li>').join('') + '</ol>');
      continue;
    }
    if (b.type === 'table') {
      noteMention(b.rows.flat().join(' '));
      const head = b.rows[0], body = b.rows.slice(1);
      out.push('<div class="tblwrap"' + dl(b) + '><table><thead><tr>' +
        head.map(c => '<th>' + inline(c, linkify) + '</th>').join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => '<td>' + inline(c, linkify) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }
  }
  return { article: out.join('\n'), toc, anchorFor };
}

// ---------------------------------------------------------------------------
// Build-side helpers (NOT embedded)
// ---------------------------------------------------------------------------

function buildPlaceIndex(gaz) {
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

const ENGINE_SRC = [esc, slugify, parseMd, makeLinkifier, inline, renderDoc]
  .map(f => f.toString()).join('\n\n');

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
 :root{--bg:#10131c;--panel:#151a26;--line:#2a3350;--ink:#dde;--dim:#9aa3c0;--gold:#ffd24d;--link:#7fd7ff;--mark:#ff3b8d;--edit:#7dd87d}
 html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,Segoe UI,sans-serif;overflow:hidden}
 #top{position:fixed;top:0;left:0;right:0;height:46px;z-index:20;background:#151a26ee;border-bottom:1px solid var(--line);
      display:flex;gap:10px;align-items:center;padding:0 14px}
 #top b{color:var(--gold);white-space:nowrap}
 #search{flex:0 1 300px;background:#0d1018;color:var(--ink);border:1px solid var(--line);border-radius:5px;padding:5px 10px}
 #hits{color:var(--dim);font-size:13px;min-width:70px}
 button{background:#2a3350;color:var(--ink);border:1px solid #3d4a75;border-radius:4px;padding:3px 10px;cursor:pointer}
 button:disabled{opacity:.4;cursor:default}
 button.on{background:#274427;border-color:var(--edit);color:var(--edit)}
 #dirty{display:none;color:#ffb066;font-size:12.5px;white-space:nowrap}
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
 /* ------- edit mode ------- */
 body.editing #doc [data-l]{cursor:pointer;border-radius:4px}
 body.editing #doc [data-l]:hover{outline:2px dashed #3f6b3f;outline-offset:4px}
 .edbox{margin:10px 0;border:1px solid var(--edit);border-radius:6px;background:#0d160d;padding:8px}
 .edbox textarea{width:100%;box-sizing:border-box;min-height:80px;background:#0a0f16;color:var(--ink);
                 border:1px solid var(--line);border-radius:4px;padding:8px;font:13px/1.5 ui-monospace,Consolas,monospace;resize:vertical}
 .edbox .row{display:flex;gap:8px;margin-top:6px;align-items:center}
 .edbox .hint{color:var(--dim);font-size:11.5px;margin-left:auto}
 #banner{display:none;position:fixed;top:46px;left:0;right:0;z-index:19;background:#3a2b12;border-bottom:1px solid #7a5a20;
         color:#ffd9a0;padding:7px 14px;font-size:13px}
 #banner button{margin-left:10px}
 dialog{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:8px;max-width:520px;font-size:13.5px}
 dialog::backdrop{background:#000a}
 dialog input,dialog textarea{width:100%;box-sizing:border-box;background:#0d1018;color:var(--ink);border:1px solid var(--line);
        border-radius:4px;padding:6px;margin:4px 0 10px;font-size:13px}
 dialog .row{display:flex;gap:8px;justify-content:flex-end}
</style></head><body>
<div id="top">
 <b>Edha Canon Codex</b>
 <button id="mapToggle" title="show/hide the map pane">🗺</button>
 <button id="editToggle" title="edit mode — click any block to edit its markdown">✏ edit</button>
 <button id="saveFile" title="write EDHA_CAMPAIGN_CANON.md on disk (Chrome/Edge)" disabled>💾 save file</button>
 <button id="ghCommit" title="commit the MD to GitHub (branch codex-canon-edits + PR)" disabled>⬆ commit</button>
 <span id="dirty">● unsaved canon edits</span>
 <input id="search" type="search" placeholder="search the canon…  (Enter = next hit)">
 <span id="hits"></span>
 <span id="stamp">src ${stamp}</span>
</div>
<div id="banner"><span id="bannerText"></span><button id="bannerRestore">restore</button><button id="bannerDiscard">discard</button></div>
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
<dialog id="commitDlg">
 <h3 style="margin-top:0">Commit canon edits to GitHub</h3>
 <p style="color:var(--dim)">Commits <code>EDHA_CAMPAIGN_CANON.md</code> to branch <code>codex-canon-edits</code> on
 CadburyAtoms/Skilltrees and opens a PR (if none). The codex HTML will read stale on that PR until a session
 regenerates it — expected, not an error.</p>
 <label>Commit message</label>
 <input id="commitMsg" value="Canon edits from the codex (in-browser)">
 <label>GitHub token <span style="color:var(--dim)">(fine-grained: Contents+Pull requests write; stored only in this browser)</span></label>
 <input id="commitTok" type="password" placeholder="github_pat_…">
 <div class="row"><button id="commitForget">forget token</button><span style="flex:1"></span>
   <button id="commitCancel">cancel</button><button id="commitGo" class="on">commit</button></div>
 <p id="commitStatus" style="color:var(--dim)"></p>
</dialog>
<script>
${ENGINE_SRC}

const MARKERS = ${JSON.stringify(markers)};
const CITY_DOTS = ${JSON.stringify(cityDots)};
const PLACES = ${JSON.stringify(places)};
const CANVAS = ${JSON.stringify(gaz.meta.canvas_px)};
const KPP = ${gaz.meta.km_per_px};
const SRC_MD_TEXT = ${JSON.stringify(md)};
const STAMP = ${JSON.stringify(stamp)};
const GH = { owner: 'CadburyAtoms', repo: 'Skilltrees', branch: 'codex-canon-edits', path: 'EDHA_CAMPAIGN_CANON.md' };
const LS_DRAFT = 'edha-codex-draft', LS_TOKEN = 'edha-codex-pat';

// ---- canon state -----------------------------------------------------------
let mdLines = SRC_MD_TEXT.split('\\n');
let dirty = false;           // md differs from what THIS page was built from
let lastWritten = null;      // last text handed to disk/GitHub
const mdText = () => mdLines.join('\\n');

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

// ---- doc pane: delegated clicks (place-links; block editor in edit mode) ---
const doc = document.getElementById('doc'), tocEl = document.getElementById('toc');
let editMode = false;

doc.addEventListener('click', e => {
  if (editMode){
    if (e.target.closest('.edbox')) return;         // clicks inside an open editor
    const a = e.target.closest('a');
    if (a) e.preventDefault();                       // no jumps/fly-tos while editing
    const block = e.target.closest('#doc [data-l]');
    if (block) openEditor(block);
    return;
  }
  const a = e.target.closest('a.pl');
  if (!a) return;
  const [x, y] = a.dataset.px.split(',').map(Number);
  pane.classList.remove('collapsed');
  flyTo(x, y, a.dataset.place);
});

// ---- rendering (same engine as the build) ----------------------------------
function rerender(){
  clearMarks();
  const linkify = makeLinkifier(PLACES);
  const r = renderDoc(parseMd(mdText()), PLACES, linkify);
  doc.innerHTML = r.article;
  tocEl.innerHTML = r.toc.map(t =>
    '<a class="t' + t.level + '" href="#' + t.slug + '">' + esc(t.text) + '</a>').join('\\n');
}

// ---- block editor -----------------------------------------------------------
function openEditor(block){
  if (doc.querySelector('.edbox')) return;          // one at a time
  const [l0, l1] = block.dataset.l.split(':').map(Number);
  const box = document.createElement('div');
  box.className = 'edbox';
  box.innerHTML = '<textarea spellcheck="false"></textarea>' +
    '<div class="row"><button class="ed-save on">save</button><button class="ed-cancel">cancel</button>' +
    '<button class="ed-add" title="save, then start a new block after this one">save + add below</button>' +
    '<span class="hint">raw markdown · empty = delete block</span></div>';
  const ta = box.querySelector('textarea');
  ta.value = mdLines.slice(l0, l1).join('\\n');
  ta.style.height = Math.min(420, 40 + ta.value.split('\\n').length * 20) + 'px';
  block.style.display = 'none';
  block.after(box);
  ta.focus();

  const commit = addAfter => {
    const text = ta.value.replace(/\\s+$/, '');
    const repl = text === '' ? [] : text.split('\\n');
    mdLines.splice(l0, l1 - l0, ...repl);
    let caretLine = null;
    if (addAfter){
      const at = l0 + repl.length;
      mdLines.splice(at, 0, '', 'New text…');
      caretLine = at + 1;
    }
    markDirty();
    rerender();
    if (caretLine !== null){
      const nb = doc.querySelector('[data-l^="' + caretLine + ':"]');
      if (nb){ nb.scrollIntoView({ block: 'center' }); openEditor(nb); }
    }
  };
  box.querySelector('.ed-save').onclick = () => commit(false);
  box.querySelector('.ed-add').onclick = () => commit(true);
  box.querySelector('.ed-cancel').onclick = () => { box.remove(); block.style.display = ''; };
}

document.getElementById('editToggle').onclick = function(){
  editMode = !editMode;
  this.classList.toggle('on', editMode);
  document.body.classList.toggle('editing', editMode);
};

// ---- dirty state + localStorage draft ---------------------------------------
const dirtyEl = document.getElementById('dirty');
const saveBtn = document.getElementById('saveFile'), commitBtn = document.getElementById('ghCommit');
function markDirty(){
  dirty = true;
  dirtyEl.style.display = 'inline';
  saveBtn.disabled = !window.showOpenFilePicker;
  commitBtn.disabled = false;
  try { localStorage.setItem(LS_DRAFT, JSON.stringify({ stamp: STAMP, md: mdText(), ts: Date.now() })); } catch(e){}
}
function markClean(kind){
  dirtyEl.style.display = 'none';
  dirtyEl.textContent = '● unsaved canon edits';
  try { localStorage.removeItem(LS_DRAFT); } catch(e){}
  document.getElementById('stamp').textContent = 'src ' + STAMP + ' · edited, saved to ' + kind + ' — regen pending';
}
(function restoreDraft(){
  let d = null;
  try { d = JSON.parse(localStorage.getItem(LS_DRAFT)); } catch(e){}
  if (!d || d.md === SRC_MD_TEXT) return;
  const banner = document.getElementById('banner');
  document.getElementById('bannerText').textContent =
    'Unsaved canon edits from ' + new Date(d.ts).toLocaleString() +
    (d.stamp !== STAMP ? ' (NOTE: the codex was rebuilt since — restore carefully)' : '') + ':';
  banner.style.display = 'block';
  document.getElementById('bannerRestore').onclick = () => {
    mdLines = d.md.split('\\n'); markDirty(); rerender(); banner.style.display = 'none';
  };
  document.getElementById('bannerDiscard').onclick = () => {
    try { localStorage.removeItem(LS_DRAFT); } catch(e){}
    banner.style.display = 'none';
  };
})();

// ---- 💾 write the MD on disk (File System Access API) -----------------------
const idb = {
  db: null,
  open(){ return new Promise((res, rej) => {
    const rq = indexedDB.open('edha-codex', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  });},
  async get(k){ this.db = this.db || await this.open();
    return new Promise((res, rej) => { const t = this.db.transaction('kv').objectStore('kv').get(k);
      t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); });},
  async set(k, v){ this.db = this.db || await this.open();
    return new Promise((res, rej) => { const t = this.db.transaction('kv', 'readwrite').objectStore('kv').put(v, k);
      t.onsuccess = () => res(); t.onerror = () => rej(t.error); });},
};
async function getMdHandle(){
  let h = await idb.get('mdHandle').catch(() => null);
  if (h && (await h.requestPermission({ mode: 'readwrite' })) === 'granted') return h;
  [h] = await showOpenFilePicker({ types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }] });
  if (h.name !== GH.path && !confirm('You picked "' + h.name + '", expected ' + GH.path + ' — write anyway?')) throw new Error('cancelled');
  await idb.set('mdHandle', h).catch(() => {});
  return h;
}
saveBtn.onclick = async () => {
  try {
    const h = await getMdHandle();
    const onDisk = (await (await h.getFile()).text()).replace(/\\r\\n/g, '\\n');
    if (onDisk !== SRC_MD_TEXT && onDisk !== lastWritten &&
        !confirm('The file on disk differs from what this codex was built from (someone edited the canon since). Overwrite with your version?')) return;
    const w = await h.createWritable();
    await w.write(mdText() + (mdText().endsWith('\\n') ? '' : '\\n'));
    await w.close();
    lastWritten = mdText();
    markClean('disk');
  } catch (e) {
    if (e && e.name !== 'AbortError') alert('Save failed: ' + (e.message || e));
  }
};

// ---- ⬆ commit to GitHub (Contents API, branch + auto-PR) --------------------
function b64utf8(s){
  const u = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(bin);
}
const dlg = document.getElementById('commitDlg');
commitBtn.onclick = () => {
  document.getElementById('commitTok').value = localStorage.getItem(LS_TOKEN) || '';
  document.getElementById('commitStatus').textContent = '';
  dlg.showModal();
};
document.getElementById('commitCancel').onclick = () => dlg.close();
document.getElementById('commitForget').onclick = () => {
  localStorage.removeItem(LS_TOKEN); document.getElementById('commitTok').value = '';
  document.getElementById('commitStatus').textContent = 'token forgotten';
};
document.getElementById('commitGo').onclick = async () => {
  const st = document.getElementById('commitStatus');
  const tok = document.getElementById('commitTok').value.trim();
  if (!tok){ st.textContent = 'a token is required'; return; }
  localStorage.setItem(LS_TOKEN, tok);
  const H = { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json' };
  const API = 'https://api.github.com/repos/' + GH.owner + '/' + GH.repo;
  const j = async (r) => { const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status + ' ' + (d.message || r.statusText)); return d; };
  try {
    st.textContent = 'checking branch…';
    const refR = await fetch(API + '/git/ref/heads/' + GH.branch, { headers: H });
    if (refR.status === 404){
      st.textContent = 'creating branch from main…';
      const main = await j(await fetch(API + '/git/ref/heads/main', { headers: H }));
      await j(await fetch(API + '/git/refs', { method: 'POST', headers: H,
        body: JSON.stringify({ ref: 'refs/heads/' + GH.branch, sha: main.object.sha }) }));
    } else await j(refR);
    st.textContent = 'reading current file…';
    const cur = await j(await fetch(API + '/contents/' + GH.path + '?ref=' + GH.branch, { headers: H }));
    st.textContent = 'committing…';
    await j(await fetch(API + '/contents/' + GH.path, { method: 'PUT', headers: H,
      body: JSON.stringify({ message: document.getElementById('commitMsg').value || 'Canon edits from the codex',
        content: b64utf8(mdText() + (mdText().endsWith('\\n') ? '' : '\\n')), sha: cur.sha, branch: GH.branch }) }));
    st.textContent = 'opening PR…';
    const prR = await fetch(API + '/pulls', { method: 'POST', headers: H,
      body: JSON.stringify({ title: 'Canon edits from the codex (in-browser)', head: GH.branch, base: 'main',
        body: 'Ben edited the canon in EDHA_CANON_CODEX.html. Needs: codex regen (node scripts/build-canon-codex.js), review of edits into rulings if any are world-truth, and the usual gates.' }) });
    let prUrl = '';
    if (prR.ok) prUrl = (await prR.json()).html_url;
    else { // 422 = a PR for this branch already exists — find it
      const list = await j(await fetch(API + '/pulls?head=' + GH.owner + ':' + GH.branch, { headers: H }));
      if (list[0]) prUrl = list[0].html_url;
    }
    lastWritten = mdText();
    markClean('GitHub (' + GH.branch + ')');
    st.innerHTML = 'committed ✓ ' + (prUrl ? '— <a href="' + prUrl + '" target="_blank" style="color:var(--link)">open PR</a>' : '');
  } catch (e) {
    st.textContent = 'failed: ' + e.message;
  }
};

// ---- search ----------------------------------------------------------------
const hits = document.getElementById('hits');
const searchBox = document.getElementById('search');
let marks = [], cur = -1;
function clearMarks(){
  for (const m of marks){ if (m.isConnected){ const t = document.createTextNode(m.textContent); m.replaceWith(t); } }
  doc.normalize(); marks = []; cur = -1; hits.textContent = '';
}
function runSearch(q){
  clearMarks();
  if (!q || q.length < 2){ return; }
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const targets = [];
  const ql = q.toLowerCase();
  let node;
  while ((node = walker.nextNode())){
    if (node.parentElement.closest('.edbox')) continue;
    if (node.textContent.toLowerCase().includes(ql)) targets.push(node);
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
window.addEventListener('beforeunload', e => { if (dirty) e.preventDefault(); });
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
