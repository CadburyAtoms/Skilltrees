#!/usr/bin/env node
/**
 * build-dashboard.js — the Edha All-in-One Dashboard
 *
 *   sources (MD/JSON stay the single sources of truth — agents edit THOSE, never this HTML):
 *     EDHA_FOUNDRY_TEST_CHECKLIST.md   → Bench tab (same rows/marks as the old bench sheet)
 *     EDHA_ADVERSARY_ART_WISHLIST.md   → Art tab
 *     source-materials/maps/thyrcross.map.json (painted flags) → Art tab
 *     TODO_WORLDBUILDING.md            → Worldbuilding tab
 *     EDHA_CAMPAIGN_CANON.md §8 + §10  → Worldbuilding tab
 *     EDHA_CAMPAIGN_STATE.md           → Worldbuilding tab (threads/clocks/next session)
 *     EDHA_FOUNDRY_HANDOFF.md §9       → Engine tab (checkbox-formatted 2026-07-18)
 *     TRIAGE_PLAYTEST_PC_MANUALS.md B/C → Engine tab
 *     FORCED_MOVEMENT_PILOT.md         → Engine tab (open verify items)
 *     TODO_REPO_HYGIENE.md             → Repo tab
 *     EDHA_RULINGS.md                  → ⚖ Rulings tab (the standing decisions doc)
 *   plus two computed tabs, both jump-link mirrors that hold no marks of their own:
 *     "⚑ For Ben"     — every open ⚑ item on EVERY tab, bench included.
 *     "🤖 Bench queue" — every open 🤖 item: the work a bench run can drive.
 *
 * THE TWO MARKERS (re-cut 2026-07-27w — see EDHA_FOUNDRY_HANDOFF.md "⚑ vs 🤖"):
 *   ⚑  = Ben's judgment only (design, feel, balance, a ruling).
 *   🤖 = needs a live Foundry table and an agent can drive it — the bench queue.
 * A row is classified by the marker on its OWN first line (`item.head`), never by one that
 * happens to appear in an indented continuation quoting past evidence. Classifying on the
 * merged text is how a `##` header's flag came to be inherited by 105 rows beneath it.
 *
 * Replaces build-test-sheet.js / EDHA_FOUNDRY_TEST_SHEET.html (2026-07-18). Bench rows keep
 * the SAME localStorage key and row-id scheme, so existing marks survive the rename.
 *
 * Marks: localStorage keyed by a hash of row text (regeneration keeps marks for unchanged
 * rows). Section-hide is sessionStorage (clears when the browser window closes).
 * Deterministic: no timestamps; the only stamps are content hashes, so CI can diff.
 *
 * Usage:
 *   node scripts/build-dashboard.js           # (re)write EDHA_DASHBOARD.html
 *   node scripts/build-dashboard.js --check   # exit 1 if the committed dashboard is stale
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'EDHA_DASHBOARD.html');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const hash10 = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

// ---------------------------------------------------------------------------
// Bench checklist parser (unchanged from build-test-sheet.js — bench row ids
// and marks must survive)
// ---------------------------------------------------------------------------

function parseChecklist(md) {
  const lines = md.split(/\r?\n/);
  const doc = { title: '', intro: [], sections: [] };
  let sec = null;
  let sub = null;
  let item = null;

  const newSection = (title) => {
    sec = { title, blocks: [] };
    sub = null;
    item = null;
    doc.sections.push(sec);
  };
  const container = () => (sub ? sub.blocks : sec.blocks);
  let prevBlank = true;
  const pushProse = (text) => {
    const blocks = container();
    const last = blocks[blocks.length - 1];
    if (last && last.type === 'prose' && !prevBlank) last.text += ' ' + text;
    else blocks.push({ type: 'prose', text });
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const h1 = line.match(/^# (.*)/);
    const h2 = line.match(/^##+ (.*)/);
    const box = line.match(/^- \[( |x|X)\] (.*)/);

    if (h1 && !doc.title) { doc.title = h1[1]; continue; }
    if (h1) { newSection(h1[1]); continue; }
    if (h2) {
      item = null;
      if (!sec) { newSection(h2[1]); continue; }
      sub = { type: 'sub', title: h2[1], blocks: [] };
      sec.blocks.push(sub);
      continue;
    }
    if (box) {
      if (!sec) newSection('(preamble)');
      // `head` is the row's OWN first line — the only place a ⚑/🤖 marker counts.
      item = { type: 'item', kind: 'bench', done: box[1].toLowerCase() === 'x', text: box[2], head: box[2] };
      container().push(item);
      continue;
    }
    if (line === '' || line === '---') { item = null; prevBlank = true; continue; }
    if (item && /^\s+\S/.test(raw)) { item.text += ' ' + line.trim(); continue; }
    item = null;
    const text = line.replace(/^>\s?/, '').trim();
    if (!text) { prevBlank = true; continue; }
    if (!sec) { doc.intro.push(text); prevBlank = false; continue; }
    pushProse(text);
    prevBlank = false;
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Generic tracker parser: sections on ## headings, col-0 checkboxes with
// indented continuations, blockquote update-logs attached to the item above.
// ---------------------------------------------------------------------------

function parseTracker(md, { itemKind = 'track' } = {}) {
  const lines = md.split('\n');
  const doc = { intro: [], sections: [] };
  let sec = null;
  let item = null;
  let prevBlank = true;

  const newSection = (title) => { sec = { title, blocks: [] }; doc.sections.push(sec); item = null; };
  const pushProse = (text) => {
    if (!sec) { doc.intro.push(text); return; }
    const last = sec.blocks[sec.blocks.length - 1];
    if (last && last.type === 'prose' && !prevBlank) last.text += ' ' + text;
    else sec.blocks.push({ type: 'prose', text });
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const h = line.match(/^##+ (.*)/);
    const box = line.match(/^- \[( |x|X|~)\] (.*)/);
    const trimmed = line.trim();

    if (line.startsWith('# ') && !line.startsWith('## ')) { prevBlank = true; continue; } // doc title
    if (h) { newSection(h[1]); prevBlank = true; continue; }
    if (box) {
      if (!sec) newSection('(items)');
      item = {
        type: 'item', kind: itemKind, text: box[2], head: box[2],
        done: box[1].toLowerCase() === 'x', partial: box[1] === '~', log: [],
      };
      sec.blocks.push(item);
      prevBlank = false;
      continue;
    }
    if (trimmed.startsWith('>')) {
      const t = trimmed.replace(/^>\s?/, '');
      if (item) item.log.push(t);
      else if (t) pushProse(t);
      prevBlank = false;
      continue;
    }
    if (line === '' || line === '---') { prevBlank = true; continue; }
    if (item && /^\s+\S/.test(raw)) { item.text += ' ' + trimmed; prevBlank = false; continue; }
    item = null;
    pushProse(trimmed);
    prevBlank = false;
  }
  return doc;
}

// ---------------------------------------------------------------------------
// EDHA_RULINGS.md: sections on ## headings; every paragraph opening `**R-n.` or
// `**F-n.` is one ruling. Ben answers them in the note box and Copy-for-Claude
// carries the answers back, which is the whole point of putting them here.
// ---------------------------------------------------------------------------

function parseRulings(md) {
  const lines = md.split('\n');
  const doc = { intro: [], sections: [] };
  let sec = null;
  let item = null;

  const newSection = (title) => { sec = { title, blocks: [] }; doc.sections.push(sec); item = null; };
  const pushProse = (text) => {
    if (!sec) { doc.intro.push(text); return; }
    sec.blocks.push({ type: 'prose', text });
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const h = line.match(/^##+ (.*)/);
    const start = line.match(/^\*\*([RF]-\d+\..*)$/);

    if (line.startsWith('# ') && !line.startsWith('## ')) { item = null; continue; }
    if (h) { newSection(h[1]); continue; }
    if (line === '' || line === '---') { item = null; continue; }
    if (start) {
      if (!sec) newSection('(rulings)');
      // Settled rulings live under "## K. Settled" and are records, not asks.
      const settled = /^K\./.test(sec.title);
      item = { type: 'item', kind: 'ruling', text: '**' + start[1], head: '**' + start[1], done: settled, log: [] };
      sec.blocks.push(item);
      continue;
    }
    if (item) { item.text += ' ' + line.trim(); continue; }
    if (line.trim()) pushProse(line.trim());
  }
  return doc;
}

// Repo hygiene: `## N. [x|~| ] Title` headings ARE the items; body → log.
function parseRepoHygiene(md) {
  const lines = md.split('\n');
  const sec = { title: 'Repo hygiene backlog (TODO_REPO_HYGIENE.md)', blocks: [] };
  let item = null;
  let intro = [];
  let sawFirst = false;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const h = line.match(/^## \d+\. (\[( |x|~)\])?\s*(.*)/);
    if (h) {
      sawFirst = true;
      const st = h[2] || ' ';
      item = {
        type: 'item', kind: 'track', text: line.replace(/^## /, '').replace(/\[( |x|~)\]\s*/, ''),
        done: st.toLowerCase() === 'x', partial: st === '~', log: [],
      };
      sec.blocks.push(item);
      continue;
    }
    if (line.startsWith('# ')) continue;
    if (!sawFirst) { if (line.trim() && line !== '---') intro.push(line.trim()); continue; }
    if (item && line.trim() && line !== '---') item.log.push(line.replace(/^>\s?/, '').trim());
  }
  if (intro.length) sec.blocks.unshift({ type: 'prose', text: intro.join(' ') });
  return sec;
}

// Art wishlist: `### Creature — files` entries become items; everything else prose.
function parseArtWishlist(md) {
  const lines = md.split('\n');
  const sections = [];
  let sec = { title: 'Conventions (EDHA_ADVERSARY_ART_WISHLIST.md)', blocks: [] };
  sections.push(sec);
  let item = null;
  let prevBlank = true;
  const pushProse = (text) => {
    const last = sec.blocks[sec.blocks.length - 1];
    if (last && last.type === 'prose' && !prevBlank) last.text += ' ' + text;
    else sec.blocks.push({ type: 'prose', text });
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.startsWith('# ')) continue;
    const h2 = line.match(/^## (.*)/);
    const h3 = line.match(/^### (.*)/);
    if (h2) { sec = { title: h2[1], blocks: [] }; sections.push(sec); item = null; prevBlank = true; continue; }
    if (h3) {
      item = { type: 'item', kind: 'track', text: '**' + h3[1] + '**', done: false, log: [] };
      sec.blocks.push(item);
      prevBlank = false;
      continue;
    }
    if (line === '' || line === '---') { prevBlank = true; if (line === '---') item = null; continue; }
    if (item) { item.text += ' ' + line.trim(); prevBlank = false; continue; }
    pushProse(line.trim());
    prevBlank = false;
  }
  return sections;
}

// Map paint backlog from thyrcross.map.json painted flags.
function mapPaintSection(mapJson) {
  const m = JSON.parse(mapJson);
  const blocks = [{
    type: 'prose',
    text: 'Sites/cities with `painted: false` in `thyrcross.map.json` — run `python scripts/map/paint_overlay.py` for the guide layer, paint in Procreate, then flip the flag.',
  }];
  for (const s of m.sites || []) {
    if (s.painted === false) {
      blocks.push({ type: 'item', kind: 'track', done: false, log: [], text: `**${s.name}** — unpainted map site (\`${s.id}\`)` });
    }
  }
  for (const c of m.cities || []) {
    if (c.painted === false) {
      const nm = c.name ? ` — ${c.name}` : '';
      blocks.push({ type: 'item', kind: 'track', done: false, log: [], text: `**City marker \`${c.id}\`**${nm} — unpainted` });
    }
  }
  return { title: 'Unpainted map sites (thyrcross.map.json)', blocks };
}

// Slice a top-level `## N. ...` section out of a big doc.
function sliceSection(md, startRe) {
  const start = md.search(startRe);
  if (start === -1) return '';
  const rest = md.slice(start);
  const next = rest.slice(2).search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next + 2);
}

// Numbered-list sections (canon §8, pilot verify list) → items.
function parseNumbered(sectionMd, kind = 'track') {
  const blocks = [];
  let item = null;
  let prevBlank = true;
  for (const raw of sectionMd.split('\n').slice(1)) {
    const line = raw.replace(/\s+$/, '');
    const num = line.match(/^(\d+)\. (.*)/);
    if (num) { item = { type: 'item', kind, done: false, log: [], text: `**${num[1]}.** ${num[2]}` }; blocks.push(item); prevBlank = false; continue; }
    if (line === '') { item = null; prevBlank = true; continue; }
    if (item && /^\s+\S/.test(raw)) { item.text += ' ' + line.trim(); continue; }
    item = null;
    const t = line.replace(/^>\s?/, '').trim();
    if (!t) { prevBlank = true; continue; }
    const last = blocks[blocks.length - 1];
    if (last && last.type === 'prose' && !prevBlank) last.text += ' ' + t;
    else blocks.push({ type: 'prose', text: t });
    prevBlank = false;
  }
  return blocks;
}

// Bulleted sections (canon §10, triage B/C) → items.
function parseBulleted(sectionMd, kind = 'track') {
  const blocks = [];
  let item = null;
  let prevBlank = true;
  for (const raw of sectionMd.split('\n').slice(1)) {
    const line = raw.replace(/\s+$/, '');
    const bul = line.match(/^- (.*)/);
    if (bul) { item = { type: 'item', kind, done: false, log: [], text: bul[1] }; blocks.push(item); prevBlank = false; continue; }
    if (line === '') { item = null; prevBlank = true; continue; }
    if (item && /^\s+\S/.test(raw)) { item.text += ' ' + line.trim(); continue; }
    item = null;
    const t = line.replace(/^>\s?/, '').trim();
    if (!t) { prevBlank = true; continue; }
    const last = blocks[blocks.length - 1];
    if (last && last.type === 'prose' && !prevBlank) last.text += ' ' + t;
    else blocks.push({ type: 'prose', text: t });
    prevBlank = false;
  }
  return blocks;
}

// Markdown tables (state doc threads/clocks) → info rows.
function parseTable(sectionMd) {
  const blocks = [];
  for (const line of sectionMd.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!cells.length || cells.every((c) => /^[-: ]*$/.test(c))) continue;
    if (blocks.length === 0) { blocks.push({ type: 'tableHead', cells }); continue; }
    blocks.push({ type: 'item', kind: 'info', done: false, log: [], text: cells.filter(Boolean).join(' · ') });
  }
  return blocks.filter((b) => b.type !== 'tableHead');
}

// ---------------------------------------------------------------------------
// HTML rendering
// ---------------------------------------------------------------------------

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s) {
  let h = esc(s);
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/⚑/g, '<span class="flag">⚑</span>');
  return h;
}

const plain = (s) => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');

function rowId(secTitle, subTitle, text) {
  return crypto
    .createHash('sha1')
    .update(secTitle + ' ' + (subTitle || '') + ' ' + text)
    .digest('hex')
    .slice(0, 12);
}

function rowLabel(text) {
  const b = text.match(/\*\*([^*]+)\*\*/);
  if (b) return b[1];
  const p = plain(text);
  return p.length > 70 ? p.slice(0, 67) + '…' : p;
}

function deployChips(sec) {
  const hay = [sec.title]
    .concat(sec.blocks.flatMap((b) => (b.type === 'prose' ? [b.text] : b.type === 'sub' ? b.blocks.filter((x) => x.type === 'prose').map((x) => x.text) : [])))
    .join(' ');
  const chips = [];
  if (/no pack rebuild|engine[- ]only|NO rebuild/i.test(hay)) chips.push(['engine-only', 'ok']);
  else if (/pack rebuil|foundry-build|deploy-to-foundry/i.test(hay)) chips.push(['pack rebuild', 'warn']);
  if (/⟳ Sync|Sync Talents/.test(hay)) chips.push(['⟳ Sync', 'warn']);
  if (/relaunch/i.test(hay)) chips.push(['relaunch', 'info']);
  else if (/\bF5\b/.test(hay)) chips.push(['F5', 'info']);
  if (/re-drag/i.test(hay)) chips.push(['re-drag', 'warn']);
  return chips;
}

function renderItem(tabKey, secTitle, subTitle, it, counter) {
  // Bench ids keep the historical (tab-less) recipe so pre-dashboard marks survive.
  const id = it.kind === 'bench' ? rowId(secTitle, subTitle, it.text) : rowId(tabKey + '|' + secTitle, subTitle, it.text);
  // Classify on the row's own first line only — a marker quoted in an indented continuation
  // (or inherited from a header) is evidence about the past, not a classification.
  const headText = it.head || it.text;
  const flags = (headText.match(/⚑/g) || []).length;
  const bots = (headText.match(/🤖/g) || []).length;
  const n = counter.n++;
  const label = rowLabel(it.text);
  const logHtml = it.log && it.log.length
    ? `<details class="log"><summary>update log</summary><div>${it.log.map((l) => inline(l)).join('<br>')}</div></details>`
    : '';
  let ctl;
  if (it.done) ctl = '<span class="donebadge" title="Recorded done in the source doc">✓ done</span>';
  else if (it.kind === 'bench')
    ctl = `<button class="st p" data-s="pass" title="Pass">✓</button><button class="st f" data-s="fail" title="Fail">✗</button><button class="st a" data-s="partial" title="Partial">◐</button><button class="st k" data-s="skip" title="Skip / can't test">–</button>`;
  else if (it.kind === 'track' || it.kind === 'ruling')
    ctl = (it.partial ? '<span class="partbadge" title="Recorded part-done in the source doc">◐</span>' : '') +
      `<button class="st p one" data-s="done" title="${it.kind === 'ruling' ? 'Mark decided — type the decision in the note box' : 'Mark done (local note until the source doc is updated)'}">✓</button>`;
  else ctl = '<span class="infodot" title="Status row — informational">·</span>';
  const ph = it.kind === 'ruling' ? 'your ruling…' : 'note for the agent…';
  const noteBox = it.done ? '' : `<input class="note" type="text" placeholder="${ph}" spellcheck="false">`;
  return `<div class="row k-${it.kind}${it.done ? ' done' : ''}" data-id="${id}" data-flags="${flags}" data-bots="${bots}" data-label="${esc(label)}" data-n="${n}" data-kind="${it.kind}">
<div class="ctl">${ctl}</div>
<div class="txt">${inline(it.text)}${logHtml}${noteBox}</div>
</div>`;
}

function renderBlocks(tabKey, secTitle, subTitle, blocks, counter) {
  let out = '';
  for (const b of blocks) {
    if (b.type === 'prose') out += `<div class="prose">${inline(b.text)}</div>`;
    else if (b.type === 'item') out += renderItem(tabKey, secTitle, subTitle, b, counter);
    else if (b.type === 'sub') out += `<h3>${inline(b.title)}</h3>` + renderBlocks(tabKey, secTitle, b.title, b.blocks, counter);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Assemble the tab model
// ---------------------------------------------------------------------------

function build() {
  const sources = {};
  const src = (rel) => {
    const text = read(rel);
    sources[rel] = hash10(text);
    return text;
  };

  const checklistMd = src('EDHA_FOUNDRY_TEST_CHECKLIST.md');
  const artMd = src('EDHA_ADVERSARY_ART_WISHLIST.md');
  const mapJson = src('source-materials/maps/thyrcross.map.json');
  const wbMd = src('TODO_WORLDBUILDING.md');
  const canonMd = src('EDHA_CAMPAIGN_CANON.md');
  const stateMd = src('EDHA_CAMPAIGN_STATE.md');
  const handoffMd = src('EDHA_FOUNDRY_HANDOFF.md');
  const triageMd = src('TRIAGE_PLAYTEST_PC_MANUALS.md');
  const pilotMd = src('FORCED_MOVEMENT_PILOT.md');
  const rulingsMd = src('EDHA_RULINGS.md');
  const hygieneMd = src('TODO_REPO_HYGIENE.md');

  // --- Bench (checklist), minus the DEPLOY STATE section which becomes the banner
  // GATE (2026-07-26d): the bench parser only turns "- [ ]" checkbox lines into bench items — a
  // markdown TABLE is swallowed as prose, so its rows render dead: no marks, no PASS/FAIL, and
  // invisible to Copy-for-Claude. All 28 rule-2b sections (~341 rows, passes A→AB) shipped as
  // tables and Ben found the Bench tab empty of them at the first migration deploy. `--check`
  // never caught it because in-sync HTML is not the same as PARSED rows. Refuse tables outright.
  {
    const tableLines = checklistMd.split(/\r?\n/)
      .map((l, i) => ({ l, n: i + 1 }))
      .filter(({ l }) => /^\s*\|.*\|\s*$/.test(l));
    if (tableLines.length) {
      throw new Error(
        `EDHA_FOUNDRY_TEST_CHECKLIST.md has ${tableLines.length} markdown-table line(s) ` +
        `(first at line ${tableLines[0].n}) — bench rows must be "- [ ] **label** — …" checkbox ` +
        `lines; a table renders as dead prose on the Bench tab (invisible to marks and ` +
        `Copy-for-Claude). Convert the rows, then rebuild.`);
    }
  }

  // GATE (2026-07-27w): a row's own first line may carry ⚑ OR 🤖, never both, and a `##` header
  // may carry neither. The markers are a classification — ⚑ is Ben's judgment, 🤖 is the bench
  // queue — and both mirrors read the first line, so a row naming the *other* marker in its own
  // prose lands in both lists and inflates whichever count someone is trusting. A marker on a
  // header is worse: it silently classified 105 of 108 rows in one bestiary section and 26 of 26
  // in another, which is what buried ~30 real Ben rows under 182 flagged ones. Say "the bench row
  // above" in prose instead of drawing the glyph.
  {
    const bad = [];
    checklistMd.split(/\r?\n/).forEach((l, i) => {
      const box = l.match(/^- \[[ xX]\] (.*)$/);
      if (box && /⚑/.test(box[1]) && /🤖/.test(box[1])) bad.push(`line ${i + 1}: row carries BOTH ⚑ and 🤖`);
      if (/^##+ /.test(l) && /[⚑🤖]/.test(l)) bad.push(`line ${i + 1}: '##' header carries a marker — mark the rows individually`);
    });
    if (bad.length) {
      throw new Error(
        `EDHA_FOUNDRY_TEST_CHECKLIST.md marker errors (${bad.length}):\n  ` + bad.join('\n  ') +
        `\n⚑ = Ben's judgment only. 🤖 = needs a table, agent-drivable. One per row, none on headers.` +
        `\nSee EDHA_FOUNDRY_HANDOFF.md "⚑ vs 🤖 — the two checklist markers".`);
    }
  }

  const checklist = parseChecklist(checklistMd);
  let deployBanner = null;
  const benchSections = checklist.sections.filter((s) => {
    if (/DEPLOY STATE/i.test(s.title)) { deployBanner = s; return false; }
    return true;
  });

  // --- Art
  const artSections = parseArtWishlist(artMd);
  artSections.push(mapPaintSection(mapJson));

  // --- Worldbuilding
  const wb = parseTracker(wbMd);
  const wbSections = wb.sections.map((s) => ({ title: 'W-items — ' + s.title, blocks: s.blocks }));
  if (wb.intro.length) wbSections.unshift({ title: 'How to work the W-item backlog (TODO_WORLDBUILDING.md)', blocks: [{ type: 'prose', text: wb.intro.join(' ') }] });
  const canon8 = sliceSection(canonMd, /^## 8\. Open Threads/m);
  if (canon8) wbSections.push({ title: 'Canon §8 — Open plot threads (deliberately undefined)', blocks: parseNumbered(canon8) });
  const canon10 = sliceSection(canonMd, /^## 10\. Provisional items awaiting Ben/m);
  if (canon10) wbSections.push({ title: 'Canon §10 — Provisional items awaiting Ben (⚑)', blocks: parseBulleted(canon10) });
  const threads = sliceSection(stateMd, /^## 3\. Threads/m);
  const clocks = sliceSection(stateMd, /^## 4\. Clocks/m);
  const nextSession = sliceSection(stateMd, /^## 7\. Next session/m);
  const stateBlocks = [];
  if (threads) stateBlocks.push({ type: 'prose', text: '**Threads** (state doc §3 — status mirrors canon §8):' }, ...parseTable(threads));
  if (clocks) stateBlocks.push({ type: 'prose', text: '**Clocks** (state doc §4):' }, ...parseTable(clocks));
  if (nextSession) {
    const paras = nextSession.split('\n').slice(1).join('\n').split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
    if (paras.length) {
      stateBlocks.push({ type: 'item', kind: 'track', done: false, log: [], text: paras[0] });
      for (const p of paras.slice(1)) stateBlocks.push({ type: 'prose', text: p });
    }
  }
  if (stateBlocks.length) wbSections.push({ title: 'Campaign state — threads, clocks, next session (EDHA_CAMPAIGN_STATE.md)', blocks: stateBlocks });

  // --- Engine
  const engineSections = [];
  const sec9 = sliceSection(handoffMd, /^## 9\. Engine backlog/m);
  if (sec9) {
    const subs = sec9.split(/\n### /).slice(1);
    const intro = sec9.split(/\n### /)[0].split('\n').slice(1).join(' ').replace(/\s+/g, ' ').trim();
    if (intro) engineSections.push({ title: 'Handoff §9 — engine backlog (canonical)', blocks: [{ type: 'prose', text: intro }] });
    for (const sub of subs) {
      const title = sub.split('\n')[0];
      if (/^9g\./.test(title)) continue; // resolved history — not outstanding
      const body = parseTracker('## x\n' + sub.split('\n').slice(1).join('\n'));
      const blocks = body.sections.length ? body.sections[0].blocks : [];
      if (body.intro.length) blocks.unshift({ type: 'prose', text: body.intro.join(' ') });
      engineSections.push({ title: '§' + title, blocks });
    }
  }
  const triageB = sliceSection(triageMd, /^## B — /m);
  if (triageB) engineSections.push({ title: 'PC-manuals triage — B: engine-needed (deferred)', blocks: parseBulleted(triageB) });
  const triageC = sliceSection(triageMd, /^## C — /m);
  if (triageC) engineSections.push({ title: 'PC-manuals triage — C: stays manual (workarounds)', blocks: parseBulleted(triageC, 'info') });
  const pilotOpen = sliceSection(pilotMd, /^## Open items to verify/m);
  if (pilotOpen) {
    engineSections.push({
      title: 'Forced-movement pilot — open verifies (FORCED_MOVEMENT_PILOT.md)',
      blocks: [{ type: 'prose', text: 'Red/Momentum forced-movement pilot — NOT yet playtested; verify in a real Foundry session.' }, ...parseNumbered(pilotOpen)],
    });
  }

  // --- Repo
  const repoSections = [parseRepoHygiene(hygieneMd)];

  const TABS = [
    { key: 'bench', label: 'Bench', sections: benchSections, srcNote: `EDHA_FOUNDRY_TEST_CHECKLIST.md @${sources['EDHA_FOUNDRY_TEST_CHECKLIST.md']}` },
    { key: 'art', label: 'Art', sections: artSections, srcNote: `EDHA_ADVERSARY_ART_WISHLIST.md @${sources['EDHA_ADVERSARY_ART_WISHLIST.md']} · thyrcross.map.json @${sources['source-materials/maps/thyrcross.map.json']}` },
    { key: 'world', label: 'Worldbuilding', sections: wbSections, srcNote: `TODO_WORLDBUILDING.md @${sources['TODO_WORLDBUILDING.md']} · canon @${sources['EDHA_CAMPAIGN_CANON.md']} · state @${sources['EDHA_CAMPAIGN_STATE.md']}` },
    { key: 'engine', label: 'Engine', sections: engineSections, srcNote: `EDHA_FOUNDRY_HANDOFF.md §9 @${sources['EDHA_FOUNDRY_HANDOFF.md']} · triage @${sources['TRIAGE_PLAYTEST_PC_MANUALS.md']} · pilot @${sources['FORCED_MOVEMENT_PILOT.md']}` },
    { key: 'repo', label: 'Repo', sections: repoSections, srcNote: `TODO_REPO_HYGIENE.md @${sources['TODO_REPO_HYGIENE.md']}` },
    { key: 'rulings', label: '⚖ Rulings', sections: parseRulings(rulingsMd).sections, srcNote: `EDHA_RULINGS.md @${sources['EDHA_RULINGS.md']}` },
  ];

  // --- The two computed mirrors. Both classify on the row's OWN first line (`head`).
  //
  // "⚑ For Ben" NO LONGER excludes the bench tab. It used to, on the reasoning that a bench ⚑
  // meant "bench-verify — a different animal". That was true only while ⚑ meant "could not
  // self-verify"; since 2026-07-27w ⚑ means Ben's judgment everywhere, so hiding the bench ones
  // hid most of his actual list. "🤖 Bench queue" is the counterpart: the drivable backlog, which
  // was invisible before and is what a marathon should be sized against.
  const collect = (pred) => {
    const out = [];
    for (const tab of TABS) {
      if (tab.key === 'rulings') continue; // rulings have their own tab, with their own text
      for (const sec of tab.sections) {
        for (const b of sec.blocks) {
          if (b.type === 'item' && !b.done && pred(b.head || b.text)) out.push({ tab, sec, item: b });
          if (b.type === 'sub') {
            for (const bb of b.blocks) {
              if (bb.type === 'item' && !bb.done && pred(bb.head || bb.text)) out.push({ tab, sec, sub: b, item: bb });
            }
          }
        }
      }
    }
    return out;
  };
  const forBen = collect((t) => /⚑/.test(t));
  const benchQueue = collect((t) => /🤖/.test(t));

  // --- Render
  const stampAll = hash10(Object.values(sources).join('|'));
  const counter = { n: 1 };
  let tabsBarHtml = '';
  let panesHtml = '';

  const renderPane = (tab, extraHtml) => {
    let nav = '';
    let sectionsHtml = '';
    tab.sections.forEach((sec, i) => {
      const secId = tab.key + '-sec' + i;
      const chips = tab.key === 'bench'
        ? deployChips(sec).map(([t, k]) => `<span class="chip ${k}">${esc(t)}</span>`).join('')
        : '';
      const open = tab.key === 'bench' ? i < 1 : true;
      nav += `<a href="#${secId}" data-sec="${secId}"><span class="navtitle">${inline(sec.title)}</span><span class="navcount" data-count="${secId}"></span></a>`;
      sectionsHtml += `<section id="${secId}" data-title="${esc(plain(sec.title))}"${open ? '' : ' class="closed"'}>
<h2><span class="tw">▾</span>${inline(sec.title)}<span class="hchips">${chips}</span><span class="seccount" data-count="${secId}"></span><button class="sechide" title="Hide this section for the rest of this browser session">hide</button><button class="secclear" title="Clear this section's marks">reset</button></h2>
<div class="body">${renderBlocks(tab.key, sec.title, null, sec.blocks, counter)}</div>
</section>`;
    });
    return `<div class="pane" data-tab="${tab.key}">
<main><nav>${nav}</nav><div class="content"><div class="srcnote">source: ${esc(tab.srcNote)}</div>${extraHtml || ''}${sectionsHtml}</div></main>
</div>`;
  };

  for (const tab of TABS) {
    tabsBarHtml += `<button class="tab" data-tab="${tab.key}">${tab.label}<span class="tabcount" data-tabcount="${tab.key}"></span></button>`;
    panesHtml += renderPane(tab, '');
  }

  // The two mirror panes (read-only jump links — they hold no marks and are skipped by gather())
  const renderMirror = (entries, note) => {
    let html = `<div class="srcnote">${note}</div>`;
    let curKey = '';
    for (const e of entries) {
      if (e.tab.key !== curKey) { if (curKey) html += '</div></section>'; curKey = e.tab.key; html += `<section><h2>${esc(plain(e.tab.label))}</h2><div class="body">`; }
      const id = e.item.kind === 'bench'
        ? rowId(e.sec.title, e.sub ? e.sub.title : null, e.item.text)
        : rowId(e.tab.key + '|' + e.sec.title, e.sub ? e.sub.title : null, e.item.text);
      html += `<div class="row k-ref" data-ref="${id}" data-reftab="${e.tab.key}">
<div class="ctl"><button class="goto" title="Jump to this item on its tab">go →</button></div>
<div class="txt"><span class="refsec">${inline(e.sec.title)}</span>${inline(e.item.text)}</div>
</div>`;
    }
    if (curKey) html += '</div></section>';
    return html;
  };

  const fbHtml = renderMirror(forBen,
    'computed: every open <b>⚑</b> item on every tab, bench included — a judgment only you can make ' +
    '(design, feel, balance). It is NOT "could not verify from here"; that is now 🤖, on the Bench queue tab. ' +
    'Standing <b>decisions</b> live on the ⚖ Rulings tab, not here.');
  tabsBarHtml += `<button class="tab" data-tab="forben"><span class="flag">⚑</span> For Ben<span class="tabcount" data-tabcount="forben">${forBen.length}</span></button>`;
  panesHtml += `<div class="pane" data-tab="forben"><main><div class="content wide">${fbHtml}</div></main></div>`;

  const bqHtml = renderMirror(benchQueue,
    'computed: every open <b>🤖</b> item — needs a live Foundry table, and an <i>agent</i> can drive it. ' +
    'This is the bench backlog a <code>bench-run</code> works through and a marathon is sized against. ' +
    'Ben does not have to touch anything on this tab.');
  tabsBarHtml += `<button class="tab" data-tab="benchqueue">🤖 Bench queue<span class="tabcount" data-tabcount="benchqueue">${benchQueue.length}</span></button>`;
  panesHtml += `<div class="pane" data-tab="benchqueue"><main><div class="content wide">${bqHtml}</div></main></div>`;

  // Deploy banner
  let bannerHtml = '';
  if (deployBanner) {
    const proseAll = deployBanner.blocks.filter((b) => b.type === 'prose').map((b) => b.text);
    const hot = proseAll.filter((t) => /MERGED BUT NOT YET DEPLOYED/i.test(t));
    bannerHtml = `<details class="deploy"><summary><strong>DEPLOY STATE</strong> — ${hot.length ? inline(hot.join(' ')) : 'expand for the current deploy state'}</summary>
<div>${proseAll.map((t) => `<div class="prose">${inline(t)}</div>`).join('')}</div></details>`;
  }

  const total = counter.n - 1;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Edha — All-in-One Dashboard</title>
<!-- GENERATED FILE — do not edit. Built by scripts/build-dashboard.js from the source docs
     listed on each tab (combined stamp @${stampAll}). Rebuild with: node scripts/build-dashboard.js -->
<style>
:root{--bg:#141a2b;--panel:#1c2438;--panel2:#232d46;--line:#32405f;--txt:#dde4f2;--dim:#93a0bd;
--gold:#d8b76a;--pass:#4fc57e;--fail:#e2606c;--part:#e0a84f;--skip:#7d8bab;--flag:#ffb454}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.5 "Segoe UI",system-ui,sans-serif}
code{background:#0e1322;border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:12.5px}
header{position:sticky;top:0;z-index:10;background:var(--panel);border-bottom:1px solid var(--line);padding:8px 16px}
header h1{margin:0 0 6px;font-size:17px;color:var(--gold)}
header .stamp{color:var(--dim);font-size:12px;margin-left:8px;font-weight:normal}
.tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.tab{background:var(--panel2);border:1px solid var(--line);border-bottom:none;border-radius:8px 8px 0 0;
color:var(--dim);padding:6px 14px;font-size:13px;cursor:pointer}
.tab.on{background:var(--gold);border-color:var(--gold);color:#141a2b;font-weight:600}
.tabcount{margin-left:6px;font-size:11px;opacity:.8}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.bar input[type=search]{flex:1 1 220px;min-width:160px;background:#0e1322;border:1px solid var(--line);
border-radius:6px;color:var(--txt);padding:6px 10px;font-size:13px}
button{cursor:pointer;font:inherit}
.fbtn,.act{background:var(--panel2);border:1px solid var(--line);border-radius:14px;color:var(--txt);
padding:4px 12px;font-size:12.5px}
.fbtn.on{background:var(--gold);border-color:var(--gold);color:#141a2b;font-weight:600}
.act{border-radius:6px}
.act.primary{background:var(--gold);border-color:var(--gold);color:#141a2b;font-weight:600}
.progress{height:5px;background:#0e1322;border-radius:3px;margin-top:8px;overflow:hidden;display:flex}
.progress i{display:block;height:100%}
.progress .ip{background:var(--pass)}.progress .if{background:var(--fail)}
.progress .ia{background:var(--part)}.progress .ik{background:var(--skip)}
.ptext{font-size:12px;color:var(--dim);margin-top:3px}
.deploy{margin-top:8px;background:#3a2f18;border:1px solid var(--part);border-radius:8px;padding:6px 12px;font-size:12.5px}
.deploy summary{cursor:pointer;color:var(--part)}
.deploy .prose{margin:8px 0}
.hiddenbar{display:none;padding:6px 0 0;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--dim)}
.hiddenchip{background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:2px 6px 2px 10px;
display:inline-flex;gap:6px;align-items:center}
.hiddenchip button{background:none;border:none;color:var(--dim);font-size:11px;cursor:pointer;padding:0}
.pane{display:none}
.pane.on{display:block}
main{display:flex;gap:0;align-items:flex-start}
nav{position:sticky;top:150px;width:290px;flex:0 0 290px;max-height:calc(100vh - 160px);
overflow:auto;padding:10px 6px 30px 10px;font-size:12px}
nav a{display:flex;justify-content:space-between;gap:6px;color:var(--dim);text-decoration:none;
padding:5px 8px;border-radius:6px;border-left:2px solid transparent}
nav a:hover{background:var(--panel);color:var(--txt)}
nav .navtitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
nav .navcount{color:var(--dim);flex:none}
.content{flex:1;min-width:0;padding:12px 18px 60vh 6px;max-width:980px}
.content.wide{padding-left:18px}
.srcnote{color:var(--dim);font-size:11.5px;margin:4px 0 10px}
section{background:var(--panel);border:1px solid var(--line);border-radius:10px;margin:0 0 14px}
section h2{margin:0;padding:10px 14px;font-size:14.5px;color:var(--gold);cursor:pointer;display:flex;
gap:8px;align-items:baseline;flex-wrap:wrap}
section h2 .tw{color:var(--dim);font-size:12px;transition:transform .1s}
section.closed h2 .tw{transform:rotate(-90deg)}
section.closed .body{display:none}
section .body{padding:2px 14px 12px;border-top:1px solid var(--line)}
.hchips{display:inline-flex;gap:5px;flex-wrap:wrap}
.chip{font-size:10.5px;padding:1px 8px;border-radius:9px;border:1px solid var(--line);color:var(--dim);white-space:nowrap}
.chip.warn{color:#141a2b;background:var(--part);border-color:var(--part);font-weight:600}
.chip.ok{color:#141a2b;background:var(--pass);border-color:var(--pass);font-weight:600}
.chip.info{color:var(--txt)}
.seccount{margin-left:auto;font-size:12px;color:var(--dim);font-weight:normal}
.secclear,.sechide{background:none;border:none;color:var(--dim);font-size:11px;text-decoration:underline dotted}
h3{font-size:13px;color:var(--dim);margin:16px 0 4px}
.prose{color:var(--dim);font-size:12.5px;background:#0e1322;border-left:3px solid var(--line);
border-radius:0 6px 6px 0;padding:7px 10px;margin:10px 0}
.flag{color:var(--flag);font-weight:700}
.row{display:flex;gap:10px;padding:8px 8px;border-radius:8px;margin:4px 0;background:var(--panel2);
border:1px solid transparent}
.row .ctl{flex:0 0 118px;display:flex;gap:4px;align-items:flex-start;padding-top:2px}
.row.k-track .ctl,.row.k-info .ctl,.row.k-ref .ctl{flex-basis:64px}
.row .st{width:26px;height:26px;border-radius:6px;border:1px solid var(--line);background:#0e1322;
color:var(--dim);font-size:13px;line-height:1}
.row .st.one{width:40px}
.row .st.on.p{background:var(--pass);border-color:var(--pass);color:#08130c}
.row .st.on.f{background:var(--fail);border-color:var(--fail);color:#1c0508}
.row .st.on.a{background:var(--part);border-color:var(--part);color:#1d1403}
.row .st.on.k{background:var(--skip);border-color:var(--skip);color:#10141d}
.row.s-pass,.row.s-done{border-color:var(--pass)}
.row.s-fail{border-color:var(--fail);background:#2c1e2b}
.row.s-partial{border-color:var(--part)}.row.s-skip{opacity:.65}
.row.done{opacity:.55}
.row.k-info{background:transparent;border:1px dashed var(--line)}
.infodot{color:var(--dim);font-size:18px;padding:0 10px}
.donebadge{font-size:11px;color:var(--pass);border:1px solid var(--pass);border-radius:9px;padding:1px 8px}
.partbadge{font-size:13px;color:var(--part);padding:2px 4px}
.row .txt{flex:1;min-width:0}
.note{display:block;width:100%;margin-top:6px;background:#0e1322;border:1px solid var(--line);
border-radius:6px;color:var(--txt);padding:4px 8px;font-size:12.5px}
.note:placeholder-shown:not(:focus){opacity:.35}
details.log{margin-top:5px;font-size:12px;color:var(--dim)}
details.log summary{cursor:pointer;text-decoration:underline dotted}
details.log>div{background:#0e1322;border-left:3px solid var(--line);border-radius:0 6px 6px 0;padding:6px 10px;margin-top:4px}
.row.k-ref .refsec{display:block;font-size:11px;color:var(--dim);margin-bottom:2px}
.goto{background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--gold);font-size:11.5px;padding:3px 8px}
.row.flash{outline:2px solid var(--gold)}
.row.hidden{display:none}
section.hidden,section.sechidden{display:none}
#toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--gold);
color:#141a2b;font-weight:600;padding:8px 18px;border-radius:8px;display:none;z-index:20}
@media (max-width:900px){nav{display:none}}
</style>
</head>
<body>
<header>
<h1>Edha — All-in-One Dashboard<span class="stamp">@${stampAll} · ${total} rows · marks save locally as you click</span></h1>
<div class="tabs">${tabsBarHtml}</div>
<div class="bar">
<input id="q" type="search" placeholder="search rows on this tab…">
<button class="fbtn on" data-f="all">All</button>
<button class="fbtn" data-f="open">Open</button>
<button class="fbtn" data-f="marked">Marked</button>
<button class="fbtn" data-f="fail">Fail/Partial</button>
<button class="fbtn" data-f="flag" title="Only rows needing YOUR judgment">⚑ Ben</button>
<button class="fbtn" data-f="bot" title="Only rows an agent can drive at a live table">🤖 bench queue</button>
<span style="flex:1"></span>
<button class="act primary" id="copyClaude" title="Copy every marked row (all tabs) as a report — paste straight into the Claude chat">Copy for Claude</button>
<button class="act" id="copyTsv" title="Copy marked rows as TSV — paste into Excel">Copy TSV</button>
<button class="act" id="toggleAll">Expand all</button>
<button class="act" id="clearAll">Clear all marks</button>
</div>
<div class="progress" id="pbar"></div>
<div class="ptext" id="ptext"></div>
${bannerHtml}
<div class="hiddenbar" id="hiddenBar"></div>
</header>
${panesHtml}
<div id="toast"></div>
<script>
'use strict';
const KEY='edha-test-sheet';
const STAMP='${stampAll}';
let store={};
try{store=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){store={}}
const save=()=>localStorage.setItem(KEY,JSON.stringify(store));
const rows=[...document.querySelectorAll('.row[data-id]')];
const S={pass:'✓ PASS',fail:'✗ FAIL',partial:'◐ PARTIAL',skip:'– SKIP',done:'✓ DONE'};

// --- tabs
const TABKEYS=[...document.querySelectorAll('.tab')].map(b=>b.dataset.tab);
// Computed mirror panes: jump links only. They hold no marks, so they are excluded from
// per-tab counts and from Copy-for-Claude.
const MIRRORS=['forben','benchqueue'];
let activeTab=localStorage.getItem('edha-dash-tab')||'bench';
if(!TABKEYS.includes(activeTab))activeTab='bench';
function setTab(k){
  activeTab=k;localStorage.setItem('edha-dash-tab',k);
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===k));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.dataset.tab===k));
  refresh();
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));

function applyRow(r){
  const d=store[r.dataset.id]||{};
  r.classList.remove('s-pass','s-fail','s-partial','s-skip','s-done');
  if(d.s)r.classList.add('s-'+d.s);
  r.querySelectorAll('.st').forEach(b=>b.classList.toggle('on',b.dataset.s===d.s));
  const n=r.querySelector('.note');
  if(n&&n.value!==(d.n||''))n.value=d.n||'';
}
rows.forEach(r=>{
  applyRow(r);
  r.querySelectorAll('.st').forEach(b=>b.addEventListener('click',()=>{
    const d=store[r.dataset.id]||(store[r.dataset.id]={});
    d.s=(d.s===b.dataset.s)?null:b.dataset.s;
    if(!d.s&&!d.n)delete store[r.dataset.id];
    save();applyRow(r);refresh();
  }));
  const n=r.querySelector('.note');
  if(n)n.addEventListener('input',()=>{
    const d=store[r.dataset.id]||(store[r.dataset.id]={});
    d.n=n.value;
    if(!d.n)delete d.n;
    if(!d.s&&!d.n)delete store[r.dataset.id];
    save();refresh(false);
  });
});

// --- For-Ben jump links
document.querySelectorAll('.row[data-ref]').forEach(r=>{
  r.querySelector('.goto').addEventListener('click',()=>{
    const target=document.querySelector('.row[data-id="'+r.dataset.ref+'"]');
    if(!target)return;
    filter='all';q.value='';
    document.querySelectorAll('.fbtn').forEach(x=>x.classList.toggle('on',x.dataset.f==='all'));
    setTab(r.dataset.reftab);
    const sec=target.closest('section');
    sec.classList.remove('closed');
    if(sec.classList.contains('sechidden')){sessionHidden.delete(sec.id);saveHidden();applySectionHidden();}
    refresh();
    target.scrollIntoView({block:'center'});
    target.classList.add('flash');
    setTimeout(()=>target.classList.remove('flash'),1600);
  });
});

// Sections hidden "for the duration of this browser window" — sessionStorage, not
// localStorage, so it clears on tab/window close rather than sticking forever like marks do.
const HKEY='edha-test-sheet-hidden';
let sessionHidden=new Set();
try{sessionHidden=new Set(JSON.parse(sessionStorage.getItem(HKEY)||'[]'))}catch(e){sessionHidden=new Set()}
const saveHidden=()=>sessionStorage.setItem(HKEY,JSON.stringify([...sessionHidden]));

function updateHiddenBar(){
  const bar=document.getElementById('hiddenBar');
  bar.innerHTML='';
  if(!sessionHidden.size){bar.style.display='none';return}
  bar.style.display='flex';
  const label=document.createElement('span');label.textContent='Hidden this session:';
  bar.appendChild(label);
  sessionHidden.forEach(id=>{
    const sec=document.getElementById(id);
    if(!sec){sessionHidden.delete(id);return}
    const chip=document.createElement('span');chip.className='hiddenchip';
    const t=document.createElement('span');t.textContent=sec.dataset.title;chip.appendChild(t);
    const x=document.createElement('button');x.textContent='✕ show';x.title='Show this section again';
    x.addEventListener('click',()=>{sessionHidden.delete(id);saveHidden();applySectionHidden();refresh()});
    chip.appendChild(x);
    bar.appendChild(chip);
  });
  const showAll=document.createElement('button');showAll.className='act';showAll.textContent='show all';
  showAll.addEventListener('click',()=>{sessionHidden.clear();saveHidden();applySectionHidden();refresh()});
  bar.appendChild(showAll);
}
function applySectionHidden(){
  document.querySelectorAll('section[id]').forEach(sec=>{
    sec.classList.toggle('sechidden',sessionHidden.has(sec.id));
  });
  updateHiddenBar();
}
document.querySelectorAll('.sechide').forEach(b=>b.addEventListener('click',e=>{
  e.stopPropagation();
  sessionHidden.add(b.closest('section').id);
  saveHidden();applySectionHidden();refresh();
}));

let filter='all';
document.querySelectorAll('.fbtn').forEach(b=>b.addEventListener('click',()=>{
  filter=b.dataset.f;
  document.querySelectorAll('.fbtn').forEach(x=>x.classList.toggle('on',x===b));
  refresh();
}));
const q=document.getElementById('q');
q.addEventListener('input',()=>refresh());

function visible(r){
  if(r.closest('section').classList.contains('sechidden'))return false;
  const d=store[r.dataset.id]||{};
  const done=r.classList.contains('done');
  if(filter==='open'&&(d.s||done))return false;
  if(filter==='marked'&&!d.s&&!d.n)return false;
  if(filter==='fail'&&d.s!=='fail'&&d.s!=='partial')return false;
  if(filter==='flag'&&r.dataset.flags==='0')return false;
  if(filter==='bot'&&r.dataset.bots==='0')return false;
  const needle=q.value.trim().toLowerCase();
  if(needle){
    const sec=r.closest('section').querySelector('h2');
    const secText=sec?sec.textContent.toLowerCase():'';
    if(!(r.textContent.toLowerCase().includes(needle)||secText.includes(needle)))return false;
  }
  return true;
}

function refresh(recount=true){
  const activePane=document.querySelector('.pane.on');
  let tot=0,c={pass:0,fail:0,partial:0,skip:0,done:0};
  document.querySelectorAll('.pane').forEach(pane=>{
    let paneTot=0,paneMarked=0;
    pane.querySelectorAll('section[id]').forEach(sec=>{
      let vis=0,secTot=0,secMarked=0;
      sec.querySelectorAll('.row[data-id]').forEach(r=>{
        const v=visible(r);
        r.classList.toggle('hidden',!v);
        if(v)vis++;
        if(!r.classList.contains('done')&&r.dataset.kind!=='info'){
          secTot++;paneTot++;
          const d=store[r.dataset.id]||{};
          if(d.s){secMarked++;paneMarked++;if(pane===activePane)c[d.s]++}
          if(pane===activePane)tot++;
        }
      });
      sec.classList.toggle('hidden',vis===0);
      const filtering=filter!=='all'||q.value.trim();
      if(filtering&&vis>0)sec.classList.remove('closed');
      const cc=document.querySelectorAll('[data-count='+sec.id+']');
      cc.forEach(el=>el.textContent=secTot?secMarked+'/'+secTot:'');
    });
    const tc=document.querySelector('[data-tabcount="'+pane.dataset.tab+'"]');
    if(tc&&!MIRRORS.includes(pane.dataset.tab))tc.textContent=paneTot?paneMarked+'/'+paneTot:'';
  });
  const marked=c.pass+c.fail+c.partial+c.skip+c.done;
  const pb=document.getElementById('pbar');
  pb.innerHTML=[['p',c.pass+c.done],['f',c.fail],['a',c.partial],['k',c.skip]].map(([k,v])=>
    '<i class="i'+k+'" style="width:'+(tot?100*v/tot:0)+'%"></i>').join('');
  document.getElementById('ptext').textContent=
    marked+' of '+tot+' rows marked on this tab — '+(c.pass+c.done)+' pass/done · '+c.fail+' fail · '+c.partial+' partial · '+c.skip+' skipped';
}

document.querySelectorAll('section h2').forEach(h=>h.addEventListener('click',e=>{
  if(e.target.closest('.secclear')||e.target.closest('.sechide'))return;
  h.parentElement.classList.toggle('closed');
}));
document.querySelectorAll('.secclear').forEach(b=>b.addEventListener('click',e=>{
  e.stopPropagation();
  const sec=b.closest('section');
  if(!confirm('Clear all marks in this section?'))return;
  sec.querySelectorAll('.row[data-id]').forEach(r=>delete store[r.dataset.id]);
  save();sec.querySelectorAll('.row[data-id]').forEach(applyRow);refresh();
}));
document.getElementById('toggleAll').addEventListener('click',e=>{
  const pane=document.querySelector('.pane.on');
  const anyClosed=[...pane.querySelectorAll('section')].some(s=>s.classList.contains('closed'));
  pane.querySelectorAll('section').forEach(s=>s.classList.toggle('closed',!anyClosed));
  e.target.textContent=anyClosed?'Collapse all':'Expand all';
});
document.getElementById('clearAll').addEventListener('click',()=>{
  if(!confirm('Clear EVERY mark and note on this dashboard (all tabs)?'))return;
  store={};save();rows.forEach(applyRow);refresh();
});

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.style.display='block';
  clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2200);
}
function gather(){
  const out=[];
  document.querySelectorAll('.pane').forEach(pane=>{
    if(MIRRORS.includes(pane.dataset.tab))return;
    const tabName=document.querySelector('.tab[data-tab="'+pane.dataset.tab+'"]').textContent.replace(/[0-9/]+$/,'').trim();
    pane.querySelectorAll('section[id]').forEach(sec=>{
      const secTitle=sec.dataset.title;
      sec.querySelectorAll('.row[data-id]:not(.done)').forEach(r=>{
        const d=store[r.dataset.id]||{};
        if(!d.s&&!d.n)return;
        let sub='';
        let el=r.previousElementSibling;
        while(el){if(el.tagName==='H3'){sub=el.textContent.trim();break}el=el.previousElementSibling}
        out.push({tab:tabName,sec:secTitle,sub,label:r.dataset.label,status:d.s||'(note only)',note:d.n||''});
      });
    });
  });
  return out;
}
function copy(text,msg){
  navigator.clipboard.writeText(text).then(()=>toast(msg),()=>{
    const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);
    ta.select();document.execCommand('copy');ta.remove();toast(msg);
  });
}
document.getElementById('copyClaude').addEventListener('click',()=>{
  const g=gather();
  if(!g.length)return toast('Nothing marked yet');
  let txt='EDHA dashboard results — from EDHA_DASHBOARD.html (@'+STAMP+')\\n';
  let curTab='',curSec='';let n=1;
  for(const r of g){
    if(r.tab!==curTab){curTab=r.tab;curSec='';txt+='\\n# '+r.tab+' tab\\n'}
    if(r.sec!==curSec){curSec=r.sec;txt+='\\n## '+r.sec+'\\n'}
    const st=S[r.status]||r.status.toUpperCase();
    txt+=n+'. '+st+' — '+(r.sub?r.sub+' / ':'')+r.label+(r.note?' — Ben: "'+r.note+'"':'')+'\\n';
    n++;
  }
  const open=document.getElementById('ptext').textContent;
  txt+='\\n('+open+')\\n';
  copy(txt,'Results copied — paste into the Claude chat');
});
document.getElementById('copyTsv').addEventListener('click',()=>{
  const g=gather();
  if(!g.length)return toast('Nothing marked yet');
  let txt='Tab\\tSection\\tSubsection\\tRow\\tStatus\\tNote\\n';
  for(const r of g)
    txt+=[r.tab,r.sec,r.sub,r.label,r.status,r.note].map(v=>String(v).replace(/[\\t\\n]/g,' ')).join('\\t')+'\\n';
  copy(txt,'TSV copied — paste into Excel');
});

setTab(activeTab);
applySectionHidden();
refresh();
</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
function main() {
  const html = build();
  const check = process.argv.includes('--check');
  if (check) {
    const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (existing.replace(/\r\n/g, '\n') !== html.replace(/\r\n/g, '\n')) {
      console.error(
        'STALE: EDHA_DASHBOARD.html does not match its source docs.\n' +
          'Run: node scripts/build-dashboard.js  (and commit the regenerated dashboard)'
      );
      process.exit(1);
    }
    console.log('dashboard up to date ✓');
    return;
  }
  fs.writeFileSync(OUT, html);
  const rowCount = (html.match(/class="row/g) || []).length;
  // Drift floor re-based after the 2026-07-18 checklist consolidation (691 → ~555 rows: passed/
  // superseded rows retired, setup boilerplate removed). Keep it below any legitimate cleanup
  // but high enough to catch a section-parser regression zeroing out whole tabs.
  if (rowCount < 400) {
    console.error(`SUSPICIOUS: only ${rowCount} rows parsed across the sources — parser drift?`);
    process.exit(1);
  }
  console.log(`Wrote ${path.basename(OUT)} (${rowCount} rows).`);
}

main();
