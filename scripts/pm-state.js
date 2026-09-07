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
 *                                                     without — the live document) AND the whole
 *                                                     dashboard into its <script id="pm-dashboard">
 *                                                     slot
 *   node scripts/pm-state.js --dashboard-dir dir      write the DASHBOARD documents (see below):
 *                                                     dir/index.json + dir/c0.json … + manifest.json
 *
 * THE DASHBOARD (added 2026-09-05 — Ben: "a full project snapshot on my phone"). The page's
 * Dashboard section is EDHA_DASHBOARD.html's content — every tab, section, and row, the ⚑/🤖
 * mirrors, the DEPLOY STATE banner — built from the SAME tab model (build-dashboard.js's
 * buildModel() → mobileSnapshot()), so the phone shows exactly the desktop's rows under the same
 * ids. The artifact store rejects a document over 256 KiB and the snapshot is ~600 KB, so it is
 * SHARDED: `dash/index` (everything but the row blocks: tabs, sections with counts, the mirrors,
 * the deploy banner, ~50 KB) plus `dash/c0`, `dash/c1`, … each holding whole sections packed to
 * DASH_CHUNK_BYTES. The page subscribes to the index and fetches the chunks it names; a chunk whose
 * `stamp` is not the index's is ignored, so a shrinking chunk count leaves harmless orphans.
 * `manifest.json` carries the `writes` array for one Artifact write_db batch. Push these whenever a
 * source doc changed (any merge) — the stamp says whether they did.
 *
 * WHAT IT PARSES (by `## ` section heading, then by table header — never by row position):
 *   Queue (in order)       → queue[]      # · Item · Lane · Model · Size · Deps · Status · PR
 *   Run log                → runLog[]     Date · Item · Model · Duration · Weighted usage · Outcome · PR
 *   Rulings                → rulings[]    Id · Question · Ruling   ("(waiting)" marks an open one)
 *   Inbox from Ben         → inbox[]      every paragraph / list item except the italic placeholder
 *   Foundry windows        → foundry      prose + a deploy-stale flag
 *   Budget model (prose)   → caps         "at most N dispatches per H-hour window, at most M of them
 *                                         Opus" / the operating-windows line (see below)
 *
 * OPERATING WINDOWS (added 2026-09-05, item 31, board ruling PM-R7 — replaces the old single daily
 * "quiet hours" range, which could not model a nights-and-weekends schedule: a weeknight closes and
 * reopens the SAME day, but the weekend is one continuous open span from Friday night through Monday
 * morning, not a repeating 24h wrap). `caps.windows` is DATA parsed from ONE machine-readable line in
 * the board's Budget section — never a code constant, because Ben may change the hours — of the shape:
 *
 *   **Windows (machine-readable[, ...]):** <entry>[; <entry>...] [<IANA zone>]
 *   entry := <Dow>[-<Dow>] <HH:MM>-<HH:MM>              (no end day named → wraps to the next
 *                                                         calendar day iff end <= start, else same day)
 *          | <Dow> <HH:MM>-<Dow> <HH:MM>                (end day named explicitly → spans forward to
 *                                                         that day, e.g. "Fri 21:00-Mon 07:00")
 *
 * parses into `caps.windows: [{ dow: ["Mon","Tue",...], start: "HH:MM", end: "HH:MM", spanDays }]`
 * (`spanDays` = calendar days from the start day to the day `end` falls on; computed by the parser,
 * never authored). `inWindow(now, windows, tz)` and `nextWindowOpen(now, windows, tz)` are the pure
 * helpers (exported for tests/pm-state.test.js and used by the mobile page's own copy) that replace
 * the old `isQuiet`/`nextQuietEnd`.
 *
 * TIME ZONES. Run-log timestamps are wall-clock America/New_York (the commits they describe carry
 * -0400; the board's operating windows are stated in that zone). Every timestamp is emitted as an
 * ISO instant so the page can count the trailing window in the viewer's own clock. The conversion is
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
const dashboard = require("./build-dashboard.js");

const DEFAULT_TZ = "America/New_York";
const DEFAULT_CAPS = { dispatchesPerWindow: 2, opusPerWindow: 1, windowHours: 5 };
// Fallback only — used if the board's machine-readable windows line is missing or fails to parse.
// Matches board ruling PM-R7 (2026-09-05): weeknights wrap to the next day, the weekend is one
// continuous 3-day span (Fri start -> Mon end).
const DEFAULT_WINDOWS = [
  { dow: ["Mon", "Tue", "Wed", "Thu"], start: "21:00", end: "07:00", spanDays: 1 },
  { dow: ["Fri"], start: "21:00", end: "07:00", spanDays: 3 },
];
const STATUS_VOCAB = ["queued", "briefed", "running", "in-review", "merged", "blocked", "bench-pending", "Ben-only"];
const WORKER_MODELS = new Set(["sonnet", "opus"]);
const DOW_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Whole sections are packed into chunk documents up to this many bytes — well under the store's
// 256 KiB document cap, with room for the JSON envelope.
const DASH_CHUNK_BYTES = 200 * 1024;
const DASH_COLLECTION = "dash";

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
      // A row whose cell carries no item number (a campaign row like "Weekend bench marathon — …")
      // has NO id: emitting the whole cell as `item` made the page render a 900-character
      // monospace `#id` that could not wrap (2026-09-05, Ben's screenshot).
      item: im ? im[1] : null,
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

/** The board's "Waiting on Ben" line -> one ask per bullet (item 43, 2026-09-06 — the "Needs you"
 * view's Ben-only cards). Today it is inline prose inside the top status blockquote: "**Waiting on
 * Ben now:** (1) ...; (2) ...; (3) ...". This item's own spec asks the PM to keep that line "one
 * bullet per ask" going forward — a `- ask` list right after the label — which this parses
 * directly; until the board is edited that way, a top-level `;` split (a semicolon nested inside a
 * parenthetical aside does not count — only a "(<digits>)" marker ever opens on a digit, so it can
 * always be told apart from an ordinary aside like "(seven items bench-pending)") recovers each
 * numbered ask and drops its "(n)" marker. Scans the RAW lines rather than `parseMd`'s blocks:
 * the label lives inside the top blockquote, before any `## ` heading `sections()` keys on, and
 * `parseMd` collapses a blockquote's own paragraph breaks into one blob, erasing the very boundary
 * this needs. Returns [] if the board carries no such line yet — the page just shows no Ben-only
 * cards until the PM adopts the convention. */
function parseBenOnly(md) {
  const LABEL_RE = /\*\*Waiting on Ben\b[^*]*:\*\*/i;
  const lines = md.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => LABEL_RE.test(l));
  if (startIdx === -1) return [];
  const labelMatch = lines[startIdx].match(LABEL_RE);
  const collected = [lines[startIdx].slice(labelMatch.index + labelMatch[0].length)];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*$/.test(l) || /^>\s*$/.test(l) || /^#{1,6}\s/.test(l)) break; // paragraph/section boundary
    collected.push(l.replace(/^>\s?/, ""));
  }
  const bulletLines = collected.filter((l) => /^\s*[-*]\s+/.test(l));
  if (bulletLines.length) return bulletLines.map((l) => strip(l.replace(/^\s*[-*]\s+/, ""))).filter(Boolean);

  const joined = collected.join(" ").replace(/\s+/g, " ").trim();
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of joined) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  parts.push(cur);
  return parts.map((s) => strip(s.replace(/^\s*\(\d+\)\s*/, ""))).filter(Boolean);
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

/** "Mon" / "mon" / "MON" -> "Mon" (DOW_ORDER's own casing); "" for anything unrecognised. */
function normDow(s) {
  const t = String(s || "");
  return t.length >= 3 ? t[0].toUpperCase() + t.slice(1, 3).toLowerCase() : "";
}
const dowIdx = (name) => DOW_ORDER.indexOf(normDow(name));
const toMinutes = (hhmm) => { const p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); };
const pad4 = (hhmm) => { const p = hhmm.split(":"); return p[0].padStart(2, "0") + ":" + p[1]; };

/** Inclusive day range, forward from `a` to `b` (wraps past Sat to Sun) — "Mon-Thu" -> the four
 * weekdays; a single day ("Fri", a===b) -> just that one. */
function expandDowRange(a, b) {
  const out = [];
  let i = a;
  for (;;) { out.push(DOW_ORDER[i]); if (i === b) break; i = (i + 1) % 7; }
  return out;
}

const WINDOW_ENTRY_RE = /^([A-Za-z]{3})(?:-([A-Za-z]{3}))?\s+(\d{1,2}:\d{2})\s*-\s*(?:([A-Za-z]{3})\s+)?(\d{1,2}:\d{2})$/;

/** One "<Dow>[-<Dow>] HH:MM-HH:MM" or "<Dow> HH:MM-<Dow> HH:MM" entry -> `{ dow, start, end,
 * spanDays }`, or null if it doesn't parse. `spanDays` is derived, never authored: an explicit end
 * day is the forward day-distance from the start day (1-7); no end day means the standard
 * midnight-wrap convention (next day iff end <= start, else same day). */
function parseWindowEntry(spec) {
  const m = String(spec || "").trim().match(WINDOW_ENTRY_RE);
  if (!m) return null;
  const [, d1, d2, start, endDowRaw, end] = m;
  const startIdx = dowIdx(d1);
  if (startIdx === -1) return null;
  let dow;
  if (d2) {
    const endIdx = dowIdx(d2);
    if (endIdx === -1) return null;
    dow = expandDowRange(startIdx, endIdx);
  } else {
    dow = [DOW_ORDER[startIdx]];
  }
  let spanDays;
  if (endDowRaw) {
    const endDowIdx = dowIdx(endDowRaw);
    if (endDowIdx === -1) return null;
    spanDays = ((endDowIdx - startIdx) % 7 + 7) % 7;
    if (spanDays === 0) spanDays = 7;
  } else {
    spanDays = toMinutes(end) <= toMinutes(start) ? 1 : 0;
  }
  return { dow, start: pad4(start), end: pad4(end), spanDays };
}

/** The windows line's value (everything after the label) -> `{ windows, timeZone }`. A trailing
 * `Area/City` token is the zone; everything before it splits on ";" into entries. */
function parseWindowsSpec(raw) {
  let text = String(raw || "").trim();
  let timeZone = null;
  const tzm = text.match(/([A-Za-z_]+\/[A-Za-z_]+)\s*$/);
  if (tzm) { timeZone = tzm[1]; text = text.slice(0, tzm.index).trim(); }
  const windows = text.split(";").map(parseWindowEntry).filter(Boolean);
  return { windows, timeZone };
}

function parseCaps(blocks) {
  const caps = { ...DEFAULT_CAPS, timeZone: DEFAULT_TZ, windows: DEFAULT_WINDOWS };
  for (const b of blocks) {
    if (b.type !== "p") continue;
    const t = b.text;
    const m = t.match(/at most (\d+) dispatches per (\d+)-hour window, at most (\d+) of them Opus/i);
    if (m) { caps.dispatchesPerWindow = +m[1]; caps.windowHours = +m[2]; caps.opusPerWindow = +m[3]; }
    const w = t.match(/Windows\s*\(machine-readable[^)]*\)\s*:\*{0,2}\s*(.+)/i);
    if (w) {
      const parsed = parseWindowsSpec(w[1]);
      if (parsed.windows.length) caps.windows = parsed.windows;
      if (parsed.timeZone) caps.timeZone = parsed.timeZone;
    }
  }
  return caps;
}

// ---- operating windows (inWindow / nextWindowOpen; item 31, replaces isQuiet/nextQuietEnd) ------

const pad2 = (n) => (n < 10 ? "0" + n : String(n));
const ymdStr = (ymd) => `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;
function addDaysYmd(ymd, n) {
  const dt = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d) + n * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}
function localYmd(ms, tz) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const o = {}; f.formatToParts(new Date(ms)).forEach((p) => { o[p.type] = p.value; });
  return { y: +o.year, m: +o.month, d: +o.day };
}
function dowOfYmd(ymd, tz) {
  // Noon, not midnight — clear of any DST transition that lands exactly at 00:00.
  const noon = wallToIso(ymdStr(ymd), "12:00", tz);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(noon));
  return DOW_ORDER.indexOf(wd);
}

/** Every window occurrence whose START day falls within `[today-daysBack, today+daysFwd]`
 * (calendar days, in `tz`), as `{ start, end }` epoch-ms pairs. */
function windowOccurrences(nowMs, windows, tz, daysBack, daysFwd) {
  const today = localYmd(nowMs, tz);
  const out = [];
  for (let off = -daysBack; off <= daysFwd; off++) {
    const cand = addDaysYmd(today, off);
    const wd = DOW_ORDER[dowOfYmd(cand, tz)];
    for (const entry of windows) {
      if (entry.dow.indexOf(wd) === -1) continue;
      const start = Date.parse(wallToIso(ymdStr(cand), entry.start, tz));
      const end = Date.parse(wallToIso(ymdStr(addDaysYmd(cand, entry.spanDays)), entry.end, tz));
      out.push({ start, end });
    }
  }
  return out;
}

/** Pure: is `now` (epoch ms or ISO/parseable string) inside an operating window? `{ open,
 * changeAt }` — `changeAt` is the ISO instant the open window closes, else null (closed; use
 * `nextWindowOpen` for when it reopens). Looks back 7 days so a window with a multi-day span
 * (the Fri->Mon weekend) that started earlier this week is still found. */
function inWindow(now, windows, tz) {
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  const active = windowOccurrences(nowMs, windows, tz, 7, 0).filter((o) => o.start <= nowMs && nowMs < o.end);
  if (!active.length) return { open: false, changeAt: null };
  return { open: true, changeAt: new Date(Math.max(...active.map((o) => o.end))).toISOString() };
}

/** Pure: ISO instant of the next window that opens strictly after `now` (every entry recurs at
 * least weekly, so 8 days forward always finds one). */
function nextWindowOpen(now, windows, tz) {
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  const future = windowOccurrences(nowMs, windows, tz, 0, 8).map((o) => o.start).filter((s) => s > nowMs);
  return future.length ? new Date(Math.min(...future)).toISOString() : null;
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
  const benOnly = parseBenOnly(md);

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

  const now = opts.now || new Date().toISOString();
  const win = inWindow(now, caps.windows, tz);
  const windowStatus = { open: win.open, changeAt: win.changeAt, nextOpenAt: win.open ? null : nextWindowOpen(now, caps.windows, tz) };

  return {
    schema: 1,
    generatedAt: now,
    source: {
      path: "docs/PM_BOARD.md",
      hash: crypto.createHash("sha1").update(md).digest("hex").slice(0, 10),
      commit: opts.git ? opts.git.commit : gitFact("git rev-parse --short HEAD"),
      branch: opts.git ? opts.git.branch : gitFact("git branch --show-current"),
      repo: "CadburyAtoms/Skilltrees",
    },
    timeZone: tz,
    caps,
    windowStatus,
    pm,
    workers,
    usage,
    queue,
    rulings,
    benOnly,
    inbox,
    foundry,
    runLog,
    dispatches: runLog.filter((r) => r.isDispatch && r.at).map((r) => ({ at: r.at, model: r.model, item: r.itemNo, pr: r.pr })),
    statusVocab: STATUS_VOCAB,
  };
}

// ---- the dashboard shards ---------------------------------------------------------

const byteLen = (o) => Buffer.byteLength(JSON.stringify(o));

/** Pure: mobile snapshot → { index, chunks: {id: doc} }. Whole sections are packed greedily, in
 * tab order, into chunk documents under `opts.maxBytes` (default DASH_CHUNK_BYTES); a single
 * section larger than that is an error rather than an oversized document the store would reject.
 * The index is the snapshot minus the row blocks, each section pointing at its chunk. Chunk ids
 * are `c0`, `c1`, … so a re-push overwrites in place. `opts.now` stamps `generatedAt`. */
function shardDashboard(snap, opts = {}) {
  const maxBytes = opts.maxBytes || DASH_CHUNK_BYTES;
  const chunks = {};
  let cur = null, curId = null, curBytes = 0, n = 0;
  const openChunk = () => {
    curId = "c" + n++;
    cur = { schema: snap.schema, stamp: snap.stamp, sections: {} };
    curBytes = byteLen(cur);
    chunks[curId] = cur;
  };
  const index = {
    schema: snap.schema, stamp: snap.stamp, generatedAt: opts.now || new Date().toISOString(),
    sources: snap.sources, counts: snap.counts, deploy: snap.deploy, forBen: snap.forBen, benchQueue: snap.benchQueue,
    // openRulings rides in the index (small, item 43's "Needs you" cards) rather than a chunk, so
    // the page can render them above the fold before it has fetched anything else.
    openRulings: snap.openRulings || [],
    tabs: [], chunks: [],
  };
  for (const tab of snap.tabs) {
    const t = { key: tab.key, label: tab.label, srcNote: tab.srcNote, sections: [] };
    for (const sec of tab.sections) {
      const body = { blocks: sec.blocks };
      const bytes = byteLen(body) + byteLen(sec.id) + 2;
      if (bytes + byteLen({ schema: 1, stamp: snap.stamp, sections: {} }) > maxBytes) {
        throw new Error(`pm-state: dashboard section ${sec.id} (${bytes} bytes) alone exceeds the ${maxBytes}-byte chunk cap`);
      }
      if (!cur || curBytes + bytes > maxBytes) openChunk();
      cur.sections[sec.id] = body;
      curBytes += bytes;
      t.sections.push({ id: sec.id, title: sec.title, chips: sec.chips, counts: sec.counts, chunk: curId });
    }
    index.tabs.push(t);
  }
  index.chunks = Object.keys(chunks).map((id) => ({ id, bytes: byteLen(chunks[id]), sections: Object.keys(chunks[id].sections).length }));
  return { index, chunks };
}

/** The dashboard shards for the current working tree: build-dashboard.js's model → snapshot →
 * shards. Runs the same source-doc gates the HTML build does (a checklist table, a marker on a
 * header) and throws the same way. */
function buildDashboardShards(opts = {}) {
  return shardDashboard(dashboard.mobileSnapshot(dashboard.buildModel()), opts);
}

// ---- the page's JSON slots ------------------------------------------------------------

/** Embed `obj` into the page's `<script id="<id>" type="application/json">` slot. `<` is emitted
 * as \u003c so no "</script>" can ever end the slot early (still valid JSON). */
function injectSlot(html, id, obj) {
  // The slot body is JSON with every "<" escaped, so it never contains a tag: matching `[^<]*` (not
  // a lazy `[\s\S]*?`) means a mention of the slot in the page's own comment can never start a
  // match that runs on to the real slot's close tag — which is exactly what blanked the first render.
  const re = new RegExp('(<script id="' + id + '" type="application\\/json">)[^<]*(<\\/script>)');
  if (!re.test(html)) throw new Error(`pm-state: page has no <script id="${id}" type="application/json"> slot`);
  const json = JSON.stringify(obj).replace(/</g, "\\u003c");
  return html.replace(re, (_, open, close) => open + json + close);
}

/** The board state into `script#pm-state` (kept under its original name for the tests). */
function injectState(html, state) { return injectSlot(html, "pm-state", state); }

/** Both slots: the board state and the dashboard shards (`{ index, chunks }` — the same documents
 * the page would read from the store, so the at-rest fallback and the live path share one
 * assembly step). */
function injectPage(html, state, shards) {
  return injectSlot(injectState(html, state), "pm-dashboard", { index: shards.index, chunks: shards.chunks });
}

// ---- CLI ---------------------------------------------------------------------------

function parseArgs(argv) {
  const a = { board: path.join(REPO_ROOT, "docs", "PM_BOARD.md"), live: null, usageJson: null, out: null, inject: null, dashboardDir: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === "--board") { a.board = v; i++; }
    else if (k === "--live") { a.live = v; i++; }
    else if (k === "--usage-json") { a.usageJson = v; i++; }
    else if (k === "--out") { a.out = v; i++; }
    else if (k === "--inject") { a.inject = v; i++; }
    else if (k === "--dashboard-dir") { a.dashboardDir = v; i++; }
    else if (k === "--help" || k === "-h") { a.help = true; }
    else throw new Error(`pm-state: unknown argument ${k}`);
  }
  return a;
}

/** Write the shards as one JSON file per document plus manifest.json — the `writes` array in it
 * is the Artifact tool's write_db batch, verbatim. */
function writeDashboardDir(dir, shards) {
  fs.mkdirSync(dir, { recursive: true });
  const docs = [{ doc_id: "index", body: shards.index }].concat(Object.keys(shards.chunks).map((id) => ({ doc_id: id, body: shards.chunks[id] })));
  const writes = docs.map((d) => {
    const file = path.join(dir, d.doc_id + ".json");
    fs.writeFileSync(file, JSON.stringify(d.body));
    return { op: "set", collection: DASH_COLLECTION, doc_id: d.doc_id, file_path: file };
  });
  const manifest = { collection: DASH_COLLECTION, stamp: shards.index.stamp, generatedAt: shards.index.generatedAt, chunks: shards.index.chunks, writes };
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

function main(argv) {
  const a = parseArgs(argv);
  if (a.help) {
    // Lines 2..38 of this file: the usage synopsis plus the DASHBOARD block that explains
    // --dashboard-dir. Keep the end in step with the header if either block grows.
    process.stdout.write(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 38).join("\n") + "\n");
    return 0;
  }
  const md = fs.readFileSync(a.board, "utf8");
  const live = a.live ? JSON.parse(fs.readFileSync(a.live, "utf8")) : {};
  if (a.usageJson) {
    const u = JSON.parse(fs.readFileSync(a.usageJson, "utf8"));
    live.usage = Object.assign({}, live.usage || {}, { lastSession: u, measuredAt: new Date().toISOString() });
  }
  const state = parseBoard(md, { live });
  let shards = null;
  if (a.inject || a.dashboardDir) shards = buildDashboardShards({ now: state.generatedAt });
  if (a.dashboardDir) {
    const m = writeDashboardDir(a.dashboardDir, shards);
    process.stderr.write(`pm-state: wrote ${m.writes.length} dashboard document(s) to ${a.dashboardDir} (stamp @${m.stamp}, ${shards.index.counts.rows} rows: ` +
      m.chunks.map((c) => `${c.id} ${Math.round(c.bytes / 1024)}K`).join(", ") + `)\n`);
    if (!a.out && !a.inject) return 0;
  }
  let out;
  if (a.inject) {
    out = injectPage(fs.readFileSync(a.inject, "utf8"), state, shards);
    if (!a.out) throw new Error("pm-state: --inject needs --out (never overwrite the tracked page with a snapshot)");
  } else {
    out = JSON.stringify(state, null, 2) + "\n";
  }
  if (a.out) { fs.writeFileSync(a.out, out); process.stderr.write(`pm-state: wrote ${a.out} (${state.queue.length} queue rows, ${state.runLog.length} run-log rows, ${state.workers.length} worker(s), window ${state.windowStatus.open ? "open" : "closed"}${shards ? `, dashboard @${shards.index.stamp}` : ""})\n`); }
  else process.stdout.write(out);
  return 0;
}

module.exports = {
  parseBoard, injectState, injectSlot, injectPage, shardDashboard, buildDashboardShards, writeDashboardDir,
  wallToIso, tzOffsetMinutes, parseQueue, parseRunLog, parseRulings, parseInbox, parseBenOnly,
  parseFoundry, parseCaps, parseWindowEntry, parseWindowsSpec, inWindow, nextWindowOpen, DEFAULT_WINDOWS,
  STATUS_VOCAB, DASH_CHUNK_BYTES, DASH_COLLECTION,
};

if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { process.stderr.write(String(e.message || e) + "\n"); process.exit(1); }
}
