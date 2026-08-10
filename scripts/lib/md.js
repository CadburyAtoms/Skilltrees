#!/usr/bin/env node
/* scripts/lib/md.js — shared markdown engine for the three HTML doc builders (build-dashboard.js,
 * build-canon-codex.js, build-player-primer.js).
 *
 * Added 2026-08-10 (hygiene campaign, wave 2A). Each builder carried its own esc()/inline()/
 * markdown-block engine, and they had drifted:
 *   1. esc() — the canon codex's copy was missing `"` escaping. That mattered twice: its output is
 *      injected into a double-quoted HTML attribute (the map marker's `data-place="..."`), AND this
 *      function is itself stringified into the page for the browser-side re-render (see the
 *      EMBEDDING CONSTRAINT below), so the hole shipped to the browser too.
 *   2. heading depth — one copy stopped at h3, the other went to h4.
 *   3. italic regex — one copy's `\*([^*]+)\*` (no \n exclusion) could span a newline and swallow
 *      a whole paragraph; the other already used the safe `[^*\n]` form.
 *   4. list continuation indent — one copy accepted any leading whitespace, the other required
 *      2+ spaces.
 *   5. ordered lists — one copy had no block type for them at all; `1. foo` just fell through as
 *      prose.
 * Fixed by unifying onto ONE engine instead of three. build-canon-codex.js's parseMd()/renderDoc()
 * pair was the superset (h1-h4, ordered lists, per-block `[l0,l1)` source ranges for its block
 * editor) and is the base for parseMd/renderBlocks here. esc() is build-player-primer.js's old
 * copy (String() coercion + all four of `& < > "`). inline() is a new superset (backtick + bold +
 * italic + ~~strike~~ + the ⚑ flag span + a composable linkify hook); every feature past code/bold
 * is OFF by default so a caller that never rendered a feature (dashboard has no italics; primer/
 * codex have no strike or flag) keeps not rendering it.
 *
 * EMBEDDING CONSTRAINT (build-canon-codex.js only): esc, slugifyAnchor, parseMd, makeLinkifier,
 * inline, renderBlocks are stringified via Function.prototype.toString() and dropped verbatim into
 * EDHA_CANON_CODEX.html's <script> tag (ENGINE_SRC), so the browser's post-edit re-render matches
 * the build-time render exactly. That means every one of those six:
 *   - is a plain `function name(...) { ... }` STATEMENT (arrow consts don't stringify with a name);
 *   - never closes over `require`, module-scope constants, or Node globals;
 *   - may call ANOTHER one of the six by its bare name — esc/inline/parseMd/makeLinkifier/
 *     renderBlocks all land in the same top-level <script> scope together in the real page, exactly
 *     like sibling `function` statements in any plain script — but must not reach for anything
 *     outside that group.
 * tests/md-roundtrip.test.js pins this by re-declaring the whole bundle via `new Function` (the
 * same shape ENGINE_SRC produces) and diffing its output against calling these functions directly.
 *
 * NOT here: build-player-primer.js's own local heading-slug helper. It uses a different algorithm
 * than slugifyAnchor below (simple lowercase+dash vs. slugifyAnchor's §-aware, 70-char-capped,
 * em/en-dash-eating version — they disagree on real headings, e.g. one collapses "54–59" to
 * "5459") and unifying them would change EDHA_PLAYER_PRIMER.html's heading ids, which is not one of
 * the drift fixes this consolidation ships. Two algorithms, kept apart on purpose.
 */
"use strict";

// ---------------------------------------------------------------------------
// esc — canonical copy is build-player-primer.js's old one: String() coercion (so a caller that
// hands it a non-string doesn't throw) + all four of & < > ".
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// slugifyAnchor — the canon codex's heading-anchor slug, moved here verbatim. Named to stay
// distinct from scripts/edha-pack-io.js's exported `slugify` (an unrelated NFKD filename/id
// slugifier used for authored-overlay filenames) and from build-player-primer.js's own local
// heading-slug helper — see the module header on why that one stays separate.
// ---------------------------------------------------------------------------
function slugifyAnchor(text) {
  return text.toLowerCase().replace(/[^\w\s§-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70);
}

// ---------------------------------------------------------------------------
// inline — superset of all three builders' old inline renderers: backtick code, **bold**, always
// on (every builder used both); *italic* (the [^*\n] safe form — drift fix 3), ~~strike~~, and the
// ⚑ flag span, each gated behind an opts flag so a builder that never rendered a feature keeps not
// rendering it. `linkify`, if given, runs LAST — matches the canon codex's old call shape, where
// linkify wrapped the already-inline-rendered HTML.
// ---------------------------------------------------------------------------
function inline(text, opts) {
  opts = opts || {};
  let h = esc(text);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  if (opts.italic) h = h.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  if (opts.strike) h = h.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  if (opts.flag) h = h.replace(/⚑/g, '<span class="flag">⚑</span>');
  if (opts.linkify) h = opts.linkify(h);
  return h;
}

// ---------------------------------------------------------------------------
// parseMd — markdown -> blocks. Canonical version is the canon codex's old parseMd(): the superset
// of the two block-engine copies (h1-h4 vs h1-h3 headings; ordered lists, which the old primer
// copy had no block type for at all — a bare `1. foo` just fell through as a prose paragraph).
// Every block keeps its source line range [l0, l1) — only the canon codex's block editor uses it,
// but it costs a caller that ignores it nothing.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// makeLinkifier — the canon codex's place-name auto-linker, moved here verbatim. Calls esc() (a
// sibling in the same embed group — see the module header) to escape the place name it drops into
// the anchor's data-place attribute.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// renderBlocks — blocks -> HTML. Canonical semantics are the canon codex's old renderDoc(); every
// feature that was codex-only (the block editor's data-l="l0:l1" attributes, the "#" permalink,
// place-linkify, the table wrapper div its search/edit CSS targets) is now an opt flag so
// build-player-primer.js's World tab — which never had any of those — keeps not rendering them.
//
// opts:
//   idPrefix — string prepended to every heading id (primer uses 'w-'; codex uses '').
//   dataL    — emit the block editor's data-l="l0:l1" source-range attribute (codex only).
//   hlink    — append the "#" permalink anchor after each heading (codex only).
//   tableWrap — wrap <table> in <div class="tblwrap">...</div> (codex only — its CSS scrolls that
//               wrapper horizontally; primer's old table had no wrapper).
//   linkify  — passed through to inline() as its own opts.linkify.
//   places   — place list for the codex's "which section mentions this place" index (anchorFor); a
//              caller with no places (primer) gets an inert no-op.
//   slugify  — REQUIRED: the heading-id slug function. Not defaulted to slugifyAnchor here on
//              purpose — see the module header on why primer needs a different one. Codex passes
//              slugifyAnchor explicitly; primer passes its own.
// ---------------------------------------------------------------------------
function renderBlocks(blocks, opts) {
  opts = opts || {};
  const idPrefix = opts.idPrefix || '';
  const dataL = !!opts.dataL;
  const hlink = !!opts.hlink;
  const tableWrap = !!opts.tableWrap;
  const linkify = opts.linkify || null;
  const places = opts.places || [];
  const slugFn = opts.slugify;
  const inlineOpts = { italic: true, linkify };

  const toc = [];
  const seen = new Map(); // slug → count, for uniqueness
  const out = [];
  const anchorFor = new Map(); // place name (lower) → id
  let curSlug = '';

  const noteMention = text => {
    const low = text.toLowerCase();
    for (const p of places) {
      const key = p.name.toLowerCase();
      if (!anchorFor.has(key) && curSlug && low.includes(key)) anchorFor.set(key, curSlug);
    }
  };
  const dl = b => dataL ? ' data-l="' + b.l0 + ':' + b.l1 + '"' : '';

  for (const b of blocks) {
    if (b.type === 'h') {
      let slug = slugFn(b.text) || 'section';
      const n = (seen.get(slug) || 0) + 1;
      seen.set(slug, n);
      if (n > 1) slug += '-' + n;
      curSlug = slug;
      const id = idPrefix + slug;
      if (b.level >= 2) toc.push({ level: b.level, text: b.text, slug: id });
      out.push('<h' + b.level + ' id="' + id + '"' + dl(b) + '>' + inline(b.text, inlineOpts) +
        (hlink ? '<a class="hlink" href="#' + id + '">#</a>' : '') + '</h' + b.level + '>');
      const low = b.text.toLowerCase();
      for (const p of places) {
        const key = p.name.toLowerCase();
        if (low.includes(key)) anchorFor.set(key, id);
      }
      continue;
    }
    if (b.type === 'hr') { out.push('<hr' + dl(b) + '>'); continue; }
    if (b.type === 'p') { noteMention(b.text); out.push('<p' + dl(b) + '>' + inline(b.text, inlineOpts) + '</p>'); continue; }
    if (b.type === 'quote') { noteMention(b.text); out.push('<blockquote' + dl(b) + '>' + inline(b.text, inlineOpts) + '</blockquote>'); continue; }
    if (b.type === 'ul') {
      noteMention(b.items.join(' '));
      out.push('<ul' + dl(b) + '>' + b.items.map(t => '<li>' + inline(t, inlineOpts) + '</li>').join('') + '</ul>');
      continue;
    }
    if (b.type === 'ol') {
      noteMention(b.items.map(x => x.text).join(' '));
      out.push('<ol' + dl(b) + '>' + b.items.map(x => '<li value="' + x.n + '">' + inline(x.text, inlineOpts) + '</li>').join('') + '</ol>');
      continue;
    }
    if (b.type === 'table') {
      noteMention(b.rows.flat().join(' '));
      const head = b.rows[0], body = b.rows.slice(1);
      const tableHtml = '<table><thead><tr>' +
        head.map(c => '<th>' + inline(c, inlineOpts) + '</th>').join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => '<td>' + inline(c, inlineOpts) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>';
      out.push(tableWrap ? '<div class="tblwrap"' + dl(b) + '>' + tableHtml + '</div>' : tableHtml);
      continue;
    }
  }
  return { article: out.join('\n'), toc, anchorFor };
}

module.exports = { esc, inline, parseMd, renderBlocks, makeLinkifier, slugifyAnchor };
