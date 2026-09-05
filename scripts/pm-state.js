#!/usr/bin/env node
/* scripts/pm-state.js — project docs/PM_BOARD.md into the JSON the mobile PM board reads.
 *
 * Added 2026-09-04 (PM session, Ben's request for a phone-sized view of the project). The board
 * stays the single source of truth (project-manager SKILL.md: "state lives in two files and
 * nowhere else"); this script is a READ-ONLY projection of it. The project-manager skill runs it
 * on every state change and pushes the output into the published artifact's `pm/state` document
 * (Artifact tool, `write_db`), so Ben's phone sees the queue, the trailing-window budget, the
 * running worker, and the run log without anyone republishing the page. The page itself lives at
 * docs/pm-board-mobile.html and is republished only when its markup changes.
 *
 *   node scripts/pm-state.js                          JSON to stdout
 *   node scripts/pm-state.js --out state.json         JSON to a file
 *   node scripts/pm-state.js --live live.json         merge a live overlay (pm / workers / usage —
 *                                                     see LIVE OVERLAY below) the board cannot
 *                                                     carry while a worker holds the checkout
 *   node scripts/pm-state.js --usage-json u.json      fold `pm-usage.py --last --json` output in
 *   node scripts/pm-state.js --inject docs/pm-board-mobile.html --out page.html
 *                                                     embed the state into the page's
 *                                                     <script id="pm-state"> slot (the at-rest
 *                                                     fallback the page renders before — or
 *                                                     without — the live document)
 *
 * WHAT IT PARSES (by `## ` section heading, then by table header — never by row position):
 *   Queue (in order)       → queue[]      # · Item · Lane · Model · Size · Deps · Status · PR
 *   Run log                → runLog[]     Date · Item · Model · Duration · Weighted usage · Outcome · PR
 *   Rulings                → rulings[]    Id · Question · Ruling   ("(waiting)" marks an open one)
 *   Inbox from Ben         → inbox[]      every paragraph / list item except the italic placeholder
 *   Foundry windows        → foundry      prose + a deploy-stale flag
 *   Budget model (prose)   → caps         "at most N dispatches per H-hour window, at most M of them
 *                                         Opus" / "between HH:MM and HH:MM <IANA zone>"
 *
 * TIME ZONES. Run-log timestamps are wall-clock America/New_York (the commits they describe carry
 * -0400; the board's quiet hours are stated in that zone). Every timestamp is emitted as an ISO
 * instant so the page can count the trailing window in the viewer's own clock. The conversion is
 * Intl-only (no dependency) and DST-aware via a one-step re-check.
 *
 * LIVE OVERLAY (--live). A JSON object; top-level keys `pm`, `workers`, `usage` replace the
 * defaults wholesale (no deep merge — the PM writes the whole picture each time):
 *   pm:      { status: "awake"|"waiting"|"stopped", note, waitingOn, nextWakeAt (ISO), session }
 *   workers: [{ item, title, model, size, lane, branch, startedAt (ISO), agent, phase, pr, note }]
 *   usage:   free-form; `lastSession` is what --usage-json fills.
 * Without an overlay, a queue row whose status is `running` is synthesised into a worker entry
 * (start time from the newest run-log row naming the same item), so the page is never blind.
 *
 * Uses scripts/lib/md.js's parseMd — the shared markdown engine (lint-refs pass `md-fn-def`
 * forbids a private copy). Pure functions are exported for tests/pm-state.test.js.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const { parseMd } = require("./lib/md.js");
const { REPO_ROOT } = require("./lib/paths.js");

const DEFAULT_TZ = "America/New_York";
const DEFAULT_CAPS = { dispatchesPerWindow: 2, opusPerWindow: 1, windowHours: 5, quietStart: "23:00", quietEnd: "07:00" };
const STATUS_VOCAB = ["queued", "briefed", "running", "in-review", "merged", "blocked", "bench-pending", "Ben-only"];
const WORKER_MODELS = new Set(["sonnet", "opus"]);

// ---- time -------------------------------------------------------------------

function tzOffsetMinutes(tz, date) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" })
    .formatToParts(date).find((p) => p.type === "timeZoneName");
  const m = part && part.value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3] || "0", 10));
}

/** Wall-clock "YYYY-MM-DD" + "HH:MM" in `tz` → ISO instant. DST-safe by re-checking the offset
 * at the first guess (the two disagree only inside a transition hour). */
function wallToIso(dateStr, hhmm, tz) {
  const d = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = (hhmm || "00:00").match(/^(\d{1,2}):(\d{2})$/);
  if (!d || !t) return null;
  const guess = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  let off = tzOffsetMinutes(tz, new Date(guess));
  let inst = guess - off * 60000;
  const off2 = tzOffsetMinutes(tz, new Date(inst));
  if (off2 !== off) inst = guess - off2 * 60000;
  return new Date(inst).toISOString();
}

// ---- markdown helpers -----------------------------------------------------------

const strip = (s) => String(s || "").replace(/\*\*/g, "").replace(/`/g, "").trim();
const dashOrNull = (s) => { const v = strip(s); return v === "" || v === "—" || v === "-" ? null : v; };

/** Split parseMd blocks into { heading → blocks[] } keyed by the h2 text (lowercased, no
 * trailing parenthetical). */
function sections(blocks) {
  const out = {};
  let cur = null;
  for (const b of blocks) {
    if (b.type === "h" && b.level <= 2) {
      cur = strip(b.text).replace(/\s*\(.*\)\s*$/, "").toLowerCase();
      out[cur] = out[cur] || [];
      continue;
    }
    if (cur) out[cur].push(b);
  }
  return out;
}

/** First table in a section whose header row contains every `need` cell (case-insensitive,
 * prefix match). Returns rows as objects keyed by the header cells. */
function tableRows(secBlocks, need) {
  for (const b of secBlocks || []) {
    if (b.type !== "table" || !b.rows.length) continue;
    const header = b.rows[0].map((c) => strip(c).toLowerCase());
    if (!need.every((n) => header.some((h) => h.startsWith(n.toLowerCase())))) continue;
    return b.rows.slice(1).map((cells) => {
      const o = {};
      header.forEach((h, i) => { o[h] = cells[i] === undefined ? "" : cells[i]; });
      return o;
    });
  }
  return [];
}

const col = (row, prefix) => {
  const k = Object.keys(row).find((h) => h.startsWith(prefix.toLowerCase()));
  return k === undefined ? "" : row[k];
};

const prNumber = (s) => { const m = strip(s).match(/#(\d+)/); return m ? +m[1] : null; };

// ---- section parsers -----------------------------------------------------------

function parseQueue(rows) {
  return rows.map((r) => {
    const itemCell = strip(col(r, "item"));
    const im = itemCell.match(/^(\d+[a-z]?)\s+(.*)$/);
    const statusCell = strip(col(r, "status"));
    const sm = statusCell.match(/^([A-Za-z-]+)(?:\((.*)\))?$/);
    const pos = dashOrNull(col(r, "#"));
    return {
      pos: pos === null ? null : +pos,
      item: im ? im[1] : itemCell,
      title: im ? im[2] : itemCell,
      lane: dashOrNull(col(r, "lane")),
      model: (dashOrNull(col(r, "model")) || "").toLowerCase() || null,
      size: dashOrNull(col(r, "size")),
      deps: dashOrNull(col(r, "deps")),
      status: sm ? sm[1] : statusCell,
      statusDetail: sm && sm[2] ? sm[2] : null,
      pr: prNumber(col(r, "pr")),
    };
  });
}

function parseRunLog(rows, tz) {
  return rows.map((r) => {
    const dateCell = strip(col(r, "date"));
    const dm = dateCell.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?/);
    const itemCell = strip(col(r, "item"));
    const num = itemCell.match(/#(\d+[a-z]?)/);
    const model = strip(col(r, "model")).toLowerCase() || null;
    const wCell = strip(col(r, "weighted"));
    const wm = wCell.match(/([\d.]+)\s*M/i);
    return {
      date: dm ? dm[1] : null,
      time: dm && dm[2] ? dm[2] : null,
      at: dm && dm[2] ? wallToIso(dm[1], dm[2], tz) : null,
      item: itemCell,
      itemNo: num ? num[1] : null,
      model,
      isDispatch: WORKER_MODELS.has(model),
      duration: dashOrNull(col(r, "duration")),
      weighted: dashOrNull(wCell),
      weightedM: wm ? parseFloat(wm[1]) : null,
      outcome: strip(col(r, "outcome")),
      pr: prNumber(col(r, "pr")),
    };
  });
}

function parseRulings(rows) {
  return rows.map((r) => {
    const ruling = strip(col(r, "ruling"));
    return { id: strip(col(r, "id")), question: strip(col(r, "question")), ruling, waiting: /\(waiting\)/i.test(ruling) };
  });
}

function parseInbox(secBlocks) {
  const out = [];
  for (const b of secBlocks || []) {
    if (b.type === "p") { const t = b.text.trim(); if (t && !/^_\(/.test(t)) out.push(strip(t)); }
    else if (b.type === "ul") for (const it of b.items) out.push(strip(it));
    else if (b.type === "ol") for (const it of b.items) out.push(strip(it.text));
    else if (b.type === "quote") out.push(strip(b.text));
  }
  return out;
}

function parseFoundry(secBlocks) {
  const text = (secBlocks || []).filter((b) => b.type === "p").map((b) => strip(b.text)).join("\n\n");
  const live = text.match(/live engine is the (\d{4}-\d{2}-\d{2}) version/);
  return {
    text,
    scheduled: !/^none scheduled/i.test(text),
    deployStale: /has not been deployed|is STALE|\bbehind\b/i.test(text),
    liveEngineVersion: live ? live[1] : null,
  };
}

function parseCaps(blocks) {
  const caps = { ...DEFAULT_CAPS, timeZone: DEFAULT_TZ };
  for (const b of blocks) {
    if (b.type !== "p") continue;
    const t = b.text;
    const m = t.match(/at most (\d+) dispatches per (\d+)-hour window, at most (\d+) of them Opus/i);
    if (m) { caps.dispatchesPerWindow = +m[1]; caps.windowHours = +m[2]; caps.opusPerWindow = +m[3]; }
    const q = t.match(/between (\d{1,2}:\d{2}) and (\d{1,2}:\d{2})(?: ([A-Za-z_]+\/[A-Za-z_]+))?/);
    if (q) { caps.quietStart = q[1].padStart(5, "0"); caps.quietEnd = q[2].padStart(5, "0"); if (q[3]) caps.timeZone = q[3]; }
  }
  return caps;
}

// ---- assembly -------------------------------------------------------------------

function gitFact(cmd) {
  try { return execSync(cmd, { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); }
  catch (e) { return null; }
}

/** Pure: board markdown → state object. `opts.now` (ISO) and `opts.git` are injectable for tests. */
function parseBoard(md, opts = {}) {
  const blocks = parseMd(md);
  const sec = sections(blocks);
  const caps = parseCaps(blocks);
  const tz = caps.timeZone;
  const queue = parseQueue(tableRows(sec["queue"], ["#", "item", "status"]));
  const runLog = parseRunLog(tableRows(sec["run log"], ["date", "item", "model"]), tz);
  const rulings = parseRulings(tableRows(sec["rulings"], ["id", "question", "ruling"]));
  const inbox = parseInbox(sec["inbox from ben"]);
  const foundry = parseFoundry(sec["foundry windows"]);

  const live = opts.live || {};
  let workers = Array.isArray(live.workers) ? live.workers : null;
  if (!workers) {
    workers = queue.filter((q) => q.status === "running").map((q) => {
      const row = [...runLog].reverse().find((r) => r.itemNo === q.item && r.isDispatch);
      return { item: q.item, title: q.title, model: q.model, size: q.size, lane: q.lane, branch: null,
        startedAt: row ? row.at : null, agent: null, phase: "working", pr: q.pr, note: "synthesised from the board's `running` row" };
    });
  }
  const pm = live.pm || { status: "unknown", note: null, waitingOn: null, nextWakeAt: null, session: null };
  const usage = live.usage || null;

  return {
    schema: 1,
    generatedAt: opts.now || new Date().toISOString(),
    source: {
      path: "docs/PM_BOARD.md",
      hash: crypto.createHash("sha1").update(md).digest("hex").slice(0, 10),
      commit: opts.git ? opts.git.commit : gitFact("git rev-parse --short HEAD"),
      branch: opts.git ? opts.git.branch : gitFact("git branch --show-current"),
      repo: "CadburyAtoms/Skilltrees",
    },
    timeZone: tz,
    caps,
    pm,
    workers,
    usage,
    queue,
    rulings,
    inbox,
    foundry,
    runLog,
    dispatches: runLog.filter((r) => r.isDispatch && r.at).map((r) => ({ at: r.at, model: r.model, item: r.itemNo, pr: r.pr })),
    statusVocab: STATUS_VOCAB,
  };
}

/** Embed `state` into the page's `script#pm-state` JSON slot. `<` is emitted as \u003c so no
 * "</script>" can ever end the slot early (still valid JSON). */
function injectState(html, state) {
  // The slot body is JSON with every "<" escaped, so it never contains a tag: matching `[^<]*` (not
  // a lazy `[\s\S]*?`) means a mention of the slot in the page's own comment can never start a
  // match that runs on to the real slot's close tag — which is exactly what blanked the first render.
  const re = /(<script id="pm-state" type="application\/json">)[^<]*(<\/script>)/;
  if (!re.test(html)) throw new Error('pm-state: page has no <script id="pm-state" type="application/json"> slot');
  const json = JSON.stringify(state).replace(/</g, "\\u003c");
  return html.replace(re, (_, open, close) => open + json + close);
}

// ---- CLI ---------------------------------------------------------------------------

function parseArgs(argv) {
  const a = { board: path.join(REPO_ROOT, "docs", "PM_BOARD.md"), live: null, usageJson: null, out: null, inject: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === "--board") { a.board = v; i++; }
    else if (k === "--live") { a.live = v; i++; }
    else if (k === "--usage-json") { a.usageJson = v; i++; }
    else if (k === "--out") { a.out = v; i++; }
    else if (k === "--inject") { a.inject = v; i++; }
    else if (k === "--help" || k === "-h") { a.help = true; }
    else throw new Error(`pm-state: unknown argument ${k}`);
  }
  return a;
}

function main(argv) {
  const a = parseArgs(argv);
  if (a.help) {
    process.stdout.write(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 26).join("\n") + "\n");
    return 0;
  }
  const md = fs.readFileSync(a.board, "utf8");
  const live = a.live ? JSON.parse(fs.readFileSync(a.live, "utf8")) : {};
  if (a.usageJson) {
    const u = JSON.parse(fs.readFileSync(a.usageJson, "utf8"));
    live.usage = Object.assign({}, live.usage || {}, { lastSession: u, measuredAt: new Date().toISOString() });
  }
  const state = parseBoard(md, { live });
  let out;
  if (a.inject) {
    out = injectState(fs.readFileSync(a.inject, "utf8"), state);
    if (!a.out) throw new Error("pm-state: --inject needs --out (never overwrite the tracked page with a snapshot)");
  } else {
    out = JSON.stringify(state, null, 2) + "\n";
  }
  if (a.out) { fs.writeFileSync(a.out, out); process.stderr.write(`pm-state: wrote ${a.out} (${state.queue.length} queue rows, ${state.runLog.length} run-log rows, ${state.workers.length} worker(s))\n`); }
  else process.stdout.write(out);
  return 0;
}

module.exports = { parseBoard, injectState, wallToIso, tzOffsetMinutes, parseQueue, parseRunLog, parseRulings, parseInbox, parseFoundry, parseCaps, STATUS_VOCAB };

if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { process.stderr.write(String(e.message || e) + "\n"); process.exit(1); }
}
