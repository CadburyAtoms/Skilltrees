#!/usr/bin/env node
/**
 * handoff-split.js — move the dated deltas out of EDHA_FOUNDRY_HANDOFF.md into
 * docs/handoff-changelog/2026-MM.md, VERBATIM (TODO_REPO_HYGIENE item 19b, ruling PM-R1).
 *
 * What it does, every run (idempotent — a run with no deltas in the handoff is a no-op):
 *   1. Finds the `## Reference — table of contents` line in the handoff. Everything from that
 *      line to EOF is the reference and is kept where it is.
 *   2. Every block ABOVE it that starts with a `## 2026-MM-DD…` heading (a block runs to the next
 *      such heading, or to the reference line) is a dated delta. Each block is bucketed by its
 *      YYYY-MM into docs/handoff-changelog/<YYYY-MM>.md, newest first inside the file, byte for
 *      byte — the script never edits a delta. A month file that already exists keeps its deltas;
 *      the moved blocks are PREPENDED (they are newer) unless a block with the same heading is
 *      already there.
 *   3. Rewrites the handoff as <everything before the first delta heading> + <the reference>.
 *      The text before the first heading (title + pointer paragraph) is hand-maintained; the
 *      script does not touch it.
 *   4. Regenerates every month file's short header and docs/handoff-changelog/README.md (the
 *      index: one line per month file with its delta count and date range).
 *
 * Proof (printed every run): SHA-256 of the delta text removed from the handoff, and SHA-256 of
 * the concatenation of the month files' delta bodies (headers excluded) in the same order — on
 * the first run these are equal by construction; the heading counts are printed beside them.
 *
 *   node scripts/handoff-split.js            move + rewrite + print the proof
 *   node scripts/handoff-split.js --dry-run  print the proof, write nothing
 *   node scripts/handoff-split.js --hash     hash the month files as they stand (no handoff read)
 *
 * Why a month file's header says `git log -S"<title>" -- EDHA_FOUNDRY_HANDOFF.md`: the deltas
 * left a file that still exists, so `git log --follow` on the month file cannot reach their
 * original commits; a pickaxe search for the heading text on the old path can.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const HANDOFF = path.join(ROOT, 'EDHA_FOUNDRY_HANDOFF.md');
const OUT_DIR = path.join(ROOT, 'docs', 'handoff-changelog');
const REFERENCE_RE = /^## Reference — table of contents/m;
const DELTA_RE = /^## (2026-\d\d)-\d\d/;
const MARKER = '<!-- handoff-split: dated deltas begin below this line, verbatim, newest first -->';

const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

/** Split text into { pre, blocks } where blocks start at each delta heading. */
function splitBlocks(text) {
  const lines = text.split('\n');
  const starts = [];
  lines.forEach((l, i) => { if (DELTA_RE.test(l)) starts.push(i); });
  if (!starts.length) return { pre: text, blocks: [] };
  const pre = lines.slice(0, starts[0]).join('\n') + (starts[0] ? '\n' : '');
  const blocks = starts.map((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : lines.length;
    const body = lines.slice(s, end).join('\n') + (end < lines.length ? '\n' : '');
    return { heading: lines[s], month: lines[s].match(DELTA_RE)[1], body };
  });
  return { pre, blocks };
}

function readMonthFile(file) {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8');
  const at = text.indexOf(MARKER + '\n');
  const bodyText = at === -1 ? text : text.slice(at + MARKER.length + 1);
  return splitBlocks(bodyText).blocks;
}

function dateRange(blocks) {
  const dates = blocks.map((b) => b.heading.match(/^## (2026-\d\d-\d\d)/)[1]).sort();
  return { first: dates[0], last: dates[dates.length - 1] };
}

function monthHeader(month, blocks) {
  const { first, last } = dateRange(blocks);
  return [
    `# EDHA handoff changelog — ${month}`,
    '',
    `The dated session deltas of ${month} (${blocks.length} deltas, ${first} → ${last}), newest first,`,
    'moved VERBATIM out of `EDHA_FOUNDRY_HANDOFF.md` by `scripts/handoff-split.js` (TODO_REPO_HYGIENE',
    'item 19b, ruling PM-R1). Nothing below the marker line is edited, summarised, or re-ordered.',
    '',
    '- **What is true today** lives in the reference, `EDHA_FOUNDRY_HANDOFF.md` (root of the repo).',
    '  A delta is the record of *what changed and why*; when the two disagree the newer delta wins',
    '  and the reference owes a fix.',
    '- **A new delta goes at the TOP of the current month\'s file**, directly under the marker line',
    '  (iron rule 5). Do not add one to the handoff itself.',
    '- **Finding a delta\'s original commit:** `git log --follow` on this file cannot reach it — the',
    '  deltas left a file that still exists, and follow only tracks renames. Use the pickaxe on the',
    '  old path instead: `git log -S"<delta title>" -- EDHA_FOUNDRY_HANDOFF.md` (the first commit',
    '  listed, oldest, is where the delta was written). The index is `README.md` beside this file.',
    '',
    MARKER,
  ].join('\n') + '\n';
}

function readmeText(monthMap, archiveNote) {
  const months = [...monthMap.keys()].sort().reverse();
  const rows = months.map((m) => {
    const b = monthMap.get(m);
    const { first, last } = dateRange(b);
    return `| [\`${m}.md\`](${m}.md) | ${b.length} | ${first} → ${last} |`;
  });
  return [
    '# EDHA handoff changelog — index',
    '',
    'The dated session deltas that used to sit at the top of `EDHA_FOUNDRY_HANDOFF.md`, one file per',
    'month, newest month first, newest delta first inside each file. Moved verbatim by',
    '`scripts/handoff-split.js` (TODO_REPO_HYGIENE item 19b, ruling PM-R1); this index is regenerated',
    'by the same script — do not hand-edit the table.',
    '',
    '**Rule (iron rule 5):** a new delta goes at the TOP of the current month\'s file, directly under',
    'its marker line — never into `EDHA_FOUNDRY_HANDOFF.md`, which is now the cold-start REFERENCE',
    'alone (what is true today). A delta\'s original commit: `git log -S"<delta title>" --',
    'EDHA_FOUNDRY_HANDOFF.md` (`--follow` cannot track a block that left a file that still exists).',
    '',
    '| File | Deltas | Date range |',
    '|---|---|---|',
    ...rows,
    '',
    archiveNote,
    '',
  ].join('\n');
}

const ARCHIVE_NOTE =
  'Also here: [`ARCHIVE-header-wall.md`](ARCHIVE-header-wall.md) — the former `HANDOFF_ARCHIVE.md`, the ' +
  '2026-06-13 → 2026-07-15 one-paragraph "Prior:" summaries that were moved out of the handoff\'s header ' +
  'wall on 2026-07-06 (item 7). They are condensed duplicates of full deltas in `2026-06.md` / `2026-07.md`, ' +
  'not deltas themselves, so they stay in their own file rather than being bucketed by month.';

function main() {
  const args = new Set(process.argv.slice(2));
  const dry = args.has('--dry-run');
  const hashOnly = args.has('--hash');

  // Existing month files (re-run / --hash case).
  const monthMap = new Map();
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      const m = f.match(/^(2026-\d\d)\.md$/);
      if (m) monthMap.set(m[1], readMonthFile(path.join(OUT_DIR, f)));
    }
  }

  let removed = '';
  let movedCount = 0;
  let newHandoff = null;
  if (!hashOnly) {
    const handoff = fs.readFileSync(HANDOFF, 'utf8');
    const refAt = handoff.search(REFERENCE_RE);
    if (refAt === -1) throw new Error('EDHA_FOUNDRY_HANDOFF.md has no `## Reference — table of contents` line');
    const above = handoff.slice(0, refAt);
    const reference = handoff.slice(refAt);
    const { pre, blocks } = splitBlocks(above);
    removed = blocks.map((b) => b.body).join('');
    movedCount = blocks.length;
    // Bucket, newest first; prepend to any existing month file, skipping duplicate headings.
    const incoming = new Map();
    for (const b of blocks) {
      if (!incoming.has(b.month)) incoming.set(b.month, []);
      incoming.get(b.month).push(b);
    }
    for (const [m, list] of incoming) {
      const existing = monthMap.get(m) || [];
      const have = new Set(existing.map((b) => b.heading));
      const fresh = list.filter((b) => !have.has(b.heading));
      monthMap.set(m, fresh.concat(existing));
    }
    newHandoff = pre + reference;
  }

  const months = [...monthMap.keys()].sort().reverse();
  const bodies = months.map((m) => monthMap.get(m).map((b) => b.body).join('')).join('');
  const total = months.reduce((n, m) => n + monthMap.get(m).length, 0);

  if (!hashOnly && !dry) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const m of months) {
      const blocks = monthMap.get(m);
      fs.writeFileSync(path.join(OUT_DIR, `${m}.md`), monthHeader(m, blocks) + blocks.map((b) => b.body).join(''));
    }
    fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readmeText(monthMap, ARCHIVE_NOTE));
    fs.writeFileSync(HANDOFF, newHandoff);
  }

  if (!hashOnly) {
    console.log(`removed from handoff : ${movedCount} delta headings, ${removed.length} chars`);
    console.log(`sha256(removed)      : ${sha(removed)}`);
  }
  console.log(`month files          : ${months.map((m) => `${m} (${monthMap.get(m).length})`).join(', ') || 'none'}`);
  console.log(`delta headings total : ${total}`);
  console.log(`sha256(month bodies) : ${sha(bodies)}`);
  if (!hashOnly && newHandoff !== null) {
    console.log(`handoff after        : ${newHandoff.split('\n').length - 1} lines${dry ? ' (dry run — nothing written)' : ''}`);
  }
}

main();
