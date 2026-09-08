/* tests/pm-state.test.js — pins scripts/pm-state.js, the docs/PM_BOARD.md → mobile-board JSON
 * projection (added 2026-09-04).
 *
 * WHY. The page on Ben's phone renders whatever this script emits; a silently mis-parsed column
 * (a status read from the wrong cell, a run-log time shifted by a zone) would show him a wrong
 * queue or a wrong budget window with no gate noticing — the board itself would still be true.
 * Two things are pinned against a FIXTURE board (so a board edit cannot move the test) and two
 * against the REAL board (so the real file must keep parsing):
 *   - column-by-header parsing of the queue / run log / rulings / inbox, including the
 *     `blocked(<ruling>)` status split and the italic inbox placeholder being ignored;
 *   - wall-clock America/New_York run-log times → ISO instants, both sides of the DST switch;
 *   - a `running` queue row synthesises a worker entry when no --live overlay is given, and a
 *     --live overlay replaces it wholesale;
 *   - --inject fills the page slot and can never emit a literal "</script>" inside it.
 * And, since 2026-09-05 (the dashboard on the phone), three more against the REAL sources:
 *   - the mobile snapshot's rows ARE the desktop's rows — every `data-id` in the committed
 *     EDHA_DASHBOARD.html is a snapshot row id and vice versa, the two mirrors match `data-ref`
 *     for `data-ref`, and the stamps agree — so the phone can never show a row the desktop lacks;
 *   - the shards never exceed the chunk cap and cover every section exactly once;
 *   - --inject fills BOTH slots (board state + dashboard) and the page can assemble the second.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { parseBoard, injectState, injectPage, shardDashboard, wallToIso, inWindow, nextWindowOpen,
  parseWindowEntry, parseBenOnly, STATUS_VOCAB, DASH_CHUNK_BYTES, DEFAULT_RUNLOG_ROWS } = require(path.join(REPO, "scripts", "pm-state.js"));
const dashboard = require(path.join(REPO, "scripts", "build-dashboard.js"));

const FIXTURE = `# PM Board — fixture

## Inbox from Ben

_(Write anything here — the PM reads it every wake.)_

Foundry is up tonight 8–10.

- skip 20, do 19a next

## Budget model

**Caps (CONFIRMED):** at most 3 dispatches per 4-hour window, at most 1 of them Opus; the PM wakes on
completion.

**Windows (machine-readable):** Mon-Thu 22:00-06:30; Fri 22:00-Mon 06:30 America/New_York

## Rulings

| Id | Question | Ruling |
|---|---|---|
| **PM-R1** | Handoff split shape | **Yes.** Reference stays. |
| **PM-R7** | Bridge naming | (waiting) — recommended default: keep the old name. |

## Queue (in order)

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 25 PM tooling (script + dashboard tab) | R | sonnet | M | — | merged | #132 |
| 2 | 16 Build fails loudly on a broken overlay | R | sonnet | S | — | running | |
| 3 | 19a Handoff reference rewrite | R | opus | L | PM-R1 ✓ | queued | |
| 4 | 9 Map fork consolidation | H | opus | M | bridge rulings | blocked(rulings) | |
| — | 2 History purge · 3 LICENSE | H | Ben | — | — | Ben-only | |

## Waiting on Ben

**Waiting on Ben:**
- a Foundry window for the bench
- a reload of the Gamemaster client

## Foundry windows

None scheduled. **Deploy fact:** the live engine is the 2026-07-28 version — the campaign has not been deployed.

## Run log

| Date | Item | Model | Duration | Weighted usage | Outcome | PR |
|---|---|---|---|---:|---|---|
| 2026-09-04 | Review (Fable + 4× Opus survey) | fable/opus | ~45 min | 7.0M | Report published | #130 |
| 2026-09-04 18:41 | #25 PM tooling | sonnet | 15.5 min, 181 turns | 4.4M | merged after review | #132 |
| 2026-09-04 19:40 | #16 Build fails loudly | sonnet | — | — | dispatched | |
| 2026-01-15 09:05 | #99 winter fixture | opus | 3 min | 0.2M | merged | #1 |
`;

const NOW = "2026-09-04T23:50:00.000Z";
const GIT = { commit: "abc1234", branch: "main" };

test("pm-state: queue rows parse by header, status splits its parenthetical", () => {
  const s = parseBoard(FIXTURE, { now: NOW, git: GIT });
  assert.strictEqual(s.queue.length, 5);
  assert.deepStrictEqual(s.queue[0], { pos: 1, item: "25", title: "PM tooling (script + dashboard tab)", lane: "R", model: "sonnet", size: "M", deps: null, status: "merged", statusDetail: null, pr: 132 });
  assert.strictEqual(s.queue[2].item, "19a");
  assert.strictEqual(s.queue[2].deps, "PM-R1 ✓");
  assert.strictEqual(s.queue[3].status, "blocked");
  assert.strictEqual(s.queue[3].statusDetail, "rulings");
  assert.strictEqual(s.queue[4].pos, null);
  assert.strictEqual(s.queue[4].status, "Ben-only");
  for (const q of s.queue) assert.ok(STATUS_VOCAB.includes(q.status), `unknown status ${q.status}`);
});

test("pm-state: a queue row with no item number has item null and keeps the whole cell as its title", () => {
  // Ben's 2026-09-05 screenshot: the marathon row (no TODO number) came out as a 900-character
  // monospace #id that could not wrap, widening AND lengthening the phone board.
  const fixture = FIXTURE.replace("| 3 | 19a Handoff reference rewrite |", "| 3 | **Weekend bench marathon** — run 1 done, `# Adversary ability wiring` next |");
  const s = parseBoard(fixture, { now: NOW, git: GIT });
  assert.strictEqual(s.queue[2].item, null);
  assert.strictEqual(s.queue[2].title, "Weekend bench marathon — run 1 done, # Adversary ability wiring next");
  assert.strictEqual(s.queue[1].item, "16");                    // numbered rows are untouched
});

test("pm-state: caps, rulings, inbox, foundry come from their own sections", () => {
  const s = parseBoard(FIXTURE, { now: NOW, git: GIT });
  assert.deepStrictEqual(s.caps, {
    dispatchesPerWindow: 3, opusPerWindow: 1, windowHours: 4, timeZone: "America/New_York",
    windows: [
      { dow: ["Mon", "Tue", "Wed", "Thu"], start: "22:00", end: "06:30", spanDays: 1 },
      { dow: ["Fri"], start: "22:00", end: "06:30", spanDays: 3 },
    ],
  });
  assert.deepStrictEqual(s.rulings.map((r) => [r.id, r.waiting]), [["PM-R1", false], ["PM-R7", true]]);
  assert.deepStrictEqual(s.benOnly, ["a Foundry window for the bench", "a reload of the Gamemaster client"], "one bullet per ask, under the 'Waiting on Ben' label");
  assert.deepStrictEqual(s.inbox, ["Foundry is up tonight 8–10.", "skip 20, do 19a next"], "placeholder ignored, prose + list kept");
  assert.strictEqual(s.foundry.scheduled, false);
  assert.strictEqual(s.foundry.deployStale, true);
  assert.strictEqual(s.foundry.liveEngineVersion, "2026-07-28");
  assert.strictEqual(s.source.hash.length, 10);
  assert.strictEqual(s.source.commit, "abc1234");
  assert.strictEqual(s.generatedAt, NOW);
});

// Item 43: today's board still writes "Waiting on Ben" as inline numbered prose inside the top
// status blockquote, not yet as one bullet per ask. parseBenOnly falls back to a top-level `;`
// split so the "Needs you" view is not blind until the PM adopts the bulleted convention — a
// semicolon inside a parenthetical aside (nested parens, never opening on a digit) must not count.
const BEN_ONLY_PROSE = `# Board

> True state: everything is fine. **Waiting on Ben now:** (1) do the thing (with a nested aside);
> (2) another ask; (3) final ask, still going.
>
> Unrelated next paragraph, not part of the ask list.

## Queue (in order)

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 1 filler | R | sonnet | S | — | queued | |
`;

test("pm-state: parseBenOnly falls back to a top-level ';' split on today's inline numbered prose", () => {
  assert.deepStrictEqual(parseBenOnly(BEN_ONLY_PROSE), [
    "do the thing (with a nested aside)",
    "another ask",
    "final ask, still going.",
  ]);
  assert.deepStrictEqual(parseBenOnly("# Board\n\nNo such line here.\n"), [], "no label, no asks");
});

test("pm-state: the real board's 'Waiting on Ben' line parses without throwing", () => {
  const md = fs.readFileSync(path.join(REPO, "docs", "PM_BOARD.md"), "utf8");
  const asks = parseBenOnly(md);
  assert.ok(Array.isArray(asks));
});

test("pm-state: a window entry with an explicit end day computes spanDays as the forward day-distance", () => {
  assert.deepStrictEqual(parseWindowEntry("Mon-Thu 21:00-07:00"), { dow: ["Mon", "Tue", "Wed", "Thu"], start: "21:00", end: "07:00", spanDays: 1 });
  assert.deepStrictEqual(parseWindowEntry("Fri 21:00-Mon 07:00"), { dow: ["Fri"], start: "21:00", end: "07:00", spanDays: 3 }, "Fri->Sat->Sun->Mon is 3 calendar days");
  assert.strictEqual(parseWindowEntry("garbage"), null);
});

// PM-R7 (2026-09-05): Mon-Thu 21:00->07:00 next day; Fri 21:00->Mon 07:00 continuous. 2026-09-04 is
// a Friday, 2026-09-05 a Saturday, 2026-09-07 a Monday — dates the run log already uses.
const PM_R7_WINDOWS = [
  { dow: ["Mon", "Tue", "Wed", "Thu"], start: "21:00", end: "07:00", spanDays: 1 },
  { dow: ["Fri"], start: "21:00", end: "07:00", spanDays: 3 },
];
const TZ = "America/New_York";

test("pm-state: inWindow/nextWindowOpen model the PM-R7 operating windows, not a single quiet range", () => {
  // A weeknight (Tue 23:00 EDT) is open, closing at Wed 07:00.
  let w = inWindow("2026-09-09T03:00:00.000Z", PM_R7_WINDOWS, TZ);
  assert.deepStrictEqual(w, { open: true, changeAt: "2026-09-09T11:00:00.000Z" });

  // A weekday noon (Tue 12:00 EDT) is closed — weekday daytime is Ben's — and reopens that same
  // evening at 21:00, not "tomorrow".
  w = inWindow("2026-09-08T16:00:00.000Z", PM_R7_WINDOWS, TZ);
  assert.deepStrictEqual(w, { open: false, changeAt: null });
  assert.strictEqual(nextWindowOpen("2026-09-08T16:00:00.000Z", PM_R7_WINDOWS, TZ), "2026-09-09T01:00:00.000Z");

  // A Saturday noon (EDT) is open — the weekend has no daytime closure, unlike a weeknight.
  w = inWindow("2026-09-05T16:00:00.000Z", PM_R7_WINDOWS, TZ);
  assert.strictEqual(w.open, true);
  assert.strictEqual(w.changeAt, "2026-09-07T11:00:00.000Z", "closes Monday 07:00, not Saturday 07:00");
});

test("pm-state: the Fri 21:00 -> Mon 07:00 weekend window is one continuous span, not three daily wraps", () => {
  const MON_0700 = "2026-09-07T11:00:00.000Z"; // Monday 07:00 EDT — the one instant the whole span closes at
  const checkpoints = [
    "2026-09-05T02:00:00.000Z", // Fri 22:00 EDT (just after the Friday-night start)
    "2026-09-06T04:00:00.000Z", // Sat 00:00 EDT (midnight — must NOT have closed at Sat 07:00)
    "2026-09-06T16:00:00.000Z", // Sat noon EDT
    "2026-09-07T03:00:00.000Z", // Sun 23:00 EDT
    "2026-09-07T10:59:00.000Z", // Mon 06:59 EDT — the last minute it is still open
  ];
  for (const t of checkpoints) {
    const w = inWindow(t, PM_R7_WINDOWS, TZ);
    assert.strictEqual(w.open, true, `${t} should be inside the continuous weekend window`);
    assert.strictEqual(w.changeAt, MON_0700, `${t} should agree the span closes at Monday 07:00, not a daily wrap`);
  }
  // One minute later the window has closed, and the next one is that same evening at 21:00 (the
  // Monday-night entry), not a second helping of the weekend.
  const closed = inWindow("2026-09-07T11:01:00.000Z", PM_R7_WINDOWS, TZ);
  assert.deepStrictEqual(closed, { open: false, changeAt: null });
  assert.strictEqual(nextWindowOpen("2026-09-07T11:01:00.000Z", PM_R7_WINDOWS, TZ), "2026-09-08T01:00:00.000Z");
});

test("pm-state: run-log wall-clock times are America/New_York on both sides of DST", () => {
  assert.strictEqual(wallToIso("2026-09-04", "18:41", "America/New_York"), "2026-09-04T22:41:00.000Z", "EDT is UTC-4");
  assert.strictEqual(wallToIso("2026-01-15", "09:05", "America/New_York"), "2026-01-15T14:05:00.000Z", "EST is UTC-5");
  assert.strictEqual(wallToIso("2026-09-04", null, "America/New_York"), "2026-09-04T04:00:00.000Z", "date-only = local midnight");
  assert.strictEqual(wallToIso("garbage", "18:41", "America/New_York"), null);
  const s = parseBoard(FIXTURE, { now: NOW, git: GIT });
  assert.strictEqual(s.runLog[0].at, null, "a date-only row has no instant and is not a dispatch");
  assert.strictEqual(s.runLog[0].isDispatch, false, "fable/opus survey is PM work, not a worker dispatch");
  assert.strictEqual(s.runLog[0].weightedM, 7);
  assert.strictEqual(s.runLog[1].at, "2026-09-04T22:41:00.000Z");
  assert.deepStrictEqual(s.dispatches.map((d) => [d.item, d.model]), [["25", "sonnet"], ["16", "sonnet"], ["99", "opus"]]);
});

test("pm-state: a running queue row synthesises a worker; a --live overlay replaces it", () => {
  const s = parseBoard(FIXTURE, { now: NOW, git: GIT });
  assert.strictEqual(s.workers.length, 1);
  assert.strictEqual(s.workers[0].item, "16");
  assert.strictEqual(s.workers[0].model, "sonnet");
  assert.strictEqual(s.workers[0].startedAt, "2026-09-04T23:40:00.000Z", "start time from the newest run-log row naming the item");
  assert.strictEqual(s.pm.status, "unknown");

  const live = { pm: { status: "awake", note: "reviewing #135" }, workers: [{ item: "16", model: "sonnet", branch: "pm/16-overlay", startedAt: "2026-09-04T23:41:00.000Z", phase: "in-review", pr: 135 }], usage: { lastSession: { turns: 12 } } };
  const t = parseBoard(FIXTURE, { now: NOW, git: GIT, live });
  assert.deepStrictEqual(t.workers, live.workers);
  assert.strictEqual(t.pm.status, "awake");
  assert.strictEqual(t.usage.lastSession.turns, 12);
});

test("pm-state: --inject fills the page slot and never emits a raw </script>", () => {
  const page = '<title>x</title>\n<script id="pm-state" type="application/json">{}</script>\n<script>go()</script>';
  const state = { note: "evil </script><script>alert(1)</script>", n: 1 };
  const out = injectState(page, state);
  const m = out.match(/<script id="pm-state" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(m, "slot survives");
  assert.ok(!m[1].includes("</script>"), "no literal close tag inside the slot");
  assert.deepStrictEqual(JSON.parse(m[1]), state, "still valid JSON that round-trips");
  assert.ok(out.endsWith("<script>go()</script>"), "the rest of the page is untouched");
  assert.throws(() => injectState("<title>no slot</title>", state), /no <script id="pm-state"/);
  // Regression: the page's own comment names the slot tag. A lazy match starting there swallowed
  // the whole <style> and markup down to the real slot and shipped a blank page (2026-09-04).
  const withComment = '<!-- the <script id="pm-state" type="application/json"> slot holds the snapshot -->\n<style>.a{}</style>\n<div>x</div>\n<script id="pm-state" type="application/json">{}</script>';
  const out2 = injectState(withComment, state);
  assert.ok(out2.includes("<style>.a{}</style>") && out2.includes("<div>x</div>"), "markup between the comment and the slot survives");
  assert.ok(out2.includes('<!-- the <script id="pm-state" type="application/json"> slot holds the snapshot -->'), "the comment itself is untouched");
  assert.deepStrictEqual(JSON.parse(out2.match(/<script id="pm-state" type="application\/json">([^<]*)<\/script>/)[1]), state);
});

test("pm-state: the real board parses and every status is in the vocabulary", () => {
  const md = fs.readFileSync(path.join(REPO, "docs", "PM_BOARD.md"), "utf8");
  const s = parseBoard(md, { now: NOW, git: GIT });
  assert.ok(s.queue.length >= 10, `queue has ${s.queue.length} rows`);
  for (const q of s.queue) assert.ok(STATUS_VOCAB.includes(q.status), `real board: unknown status "${q.status}" on item ${q.item}`);
  assert.ok(s.runLog.length >= 3);
  assert.ok(s.rulings.length >= 6);
  assert.strictEqual(s.caps.timeZone, "America/New_York");
  assert.ok(fs.existsSync(path.join(REPO, "docs", "pm-board-mobile.html")), "the page the state is injected into is tracked");
});

// ---- the dashboard on the phone (2026-09-05) ----

let SNAP = null;
const snapshot = () => (SNAP = SNAP || dashboard.mobileSnapshot(dashboard.buildModel()));
const walkItems = (blocks, fn) => { for (const b of blocks) { if (b.type === "item") fn(b); else if (b.type === "sub") walkItems(b.blocks, fn); } };

test("pm-state: the mobile snapshot's rows are exactly the committed dashboard's rows, same ids, same stamp", () => {
  const snap = snapshot();
  const html = fs.readFileSync(path.join(REPO, "EDHA_DASHBOARD.html"), "utf8");
  const htmlIds = new Set([...html.matchAll(/class="row k-[a-z]+(?: done)?" data-id="([0-9a-f]{12})"/g)].map((m) => m[1]));
  const snapIds = [];
  let counted = 0;
  for (const tab of snap.tabs) for (const sec of tab.sections) walkItems(sec.blocks, (it) => { snapIds.push(it.id); counted++; });
  assert.strictEqual(counted, snap.counts.rows, "counts.rows is the number of items");
  assert.strictEqual(new Set(snapIds).size, snapIds.length, "row ids are unique");
  assert.deepStrictEqual([...new Set(snapIds)].sort(), [...htmlIds].sort(), "snapshot row ids == desktop data-ids");
  const stamp = html.match(/combined stamp @([0-9a-f]{10})/);
  assert.ok(stamp && stamp[1] === snap.stamp, `stamp ${snap.stamp} matches the HTML's ${stamp && stamp[1]}`);
  // The two mirrors: same refs, same order, as the HTML's jump links.
  const refs = [...html.matchAll(/data-ref="([0-9a-f]{12})" data-reftab="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual(snap.forBen.concat(snap.benchQueue).map((r) => r.id), refs, "⚑ then 🤖 mirror refs match the HTML");
  assert.strictEqual(snap.counts.forBen, snap.forBen.length);
  assert.strictEqual(snap.counts.benchQueue, snap.benchQueue.length);
  const tabcount = (k) => +html.match(new RegExp(`data-tabcount="${k}">(\\d+)<`))[1];
  assert.strictEqual(tabcount("forben"), snap.counts.forBen);
  assert.strictEqual(tabcount("benchqueue"), snap.counts.benchQueue);
  // Every ref resolves to a row that is open and carries the marker on its own first line.
  const byId = new Map();
  for (const tab of snap.tabs) for (const sec of tab.sections) walkItems(sec.blocks, (it) => byId.set(it.id, it));
  for (const r of snap.forBen) { const it = byId.get(r.id); assert.ok(it && !it.done && it.flags > 0, `forBen ref ${r.id} is an open ⚑ row`); }
  for (const r of snap.benchQueue) { const it = byId.get(r.id); assert.ok(it && !it.done && it.bots > 0, `benchQueue ref ${r.id} is an open 🤖 row`); }
  assert.deepStrictEqual(snap.tabs.map((t) => t.key), ["bench", "art", "world", "engine", "repo", "rulings"], "desktop tab order, Project excluded (the page is the board)");
  assert.ok(snap.deploy && snap.deploy.prose.length > 0, "the DEPLOY STATE banner rides along");
});

// ---- item 43: the "Needs you" view's open-ruling cards (2026-09-06) ----

test("build-dashboard: parseOpenRulings marks R-56 open and R-18/R-41/R-42/R-48/R-54/R-80/R-81/R-82/R-83/R-84/R-85/R-88/R-89/R-90/R-91 ANSWERED-closed, against the real EDHA_RULINGS.md", () => {
  // item 95 (2026-09-07 evening close-out, part 2): Ben's phone-inbox tap (17:25 ET) answered R-90
  // and R-91 with their own (a) text. R-90 -> item 88 (opus, engine-only) applies it, but nothing
  // has shipped yet, so it reads ANSWERED-but-not-applied and gets a closing marker in place —
  // same shape item 91 used for R-83/R-88/R-89. R-91 -> retired the R-62 checklist row under R-86,
  // applied directly by this same item (no engine change to wait on). Both now carry a closing
  // ANSWERED marker and drop out of parseOpenRulings, moving from the OPEN illustrations to the
  // closed list. R-56 was the third WAITING ruling item 91 had used alongside them; with R-90/R-91
  // closed it becomes the SOLE open illustration: it has no `Ask:` line, so its heading is the
  // fallback question (item 44) and its bare *Recommended* default (item 87) are what the
  // assertions below read. R-56 itself is untouched by this item and stays WAITING on purpose
  // (Ben's phone tap conflicts with his morning note, so the PM has asked him in chat).
  const md = fs.readFileSync(path.join(REPO, "EDHA_RULINGS.md"), "utf8");
  const open = dashboard.parseOpenRulings(md);
  const ids = open.map((r) => r.id);
  // item 85: R-56 was ANSWERED 2026-09-06 and shipped, then Ben REOPENED it 2026-09-07 against its
  // own answer (item 79's close-out). The REOPENED marker comes AFTER the ANSWERED one in document
  // order, so it must win and the ruling must read as open again — this is the item's whole point.
  // item 91 confirmed R-56 is UNCHANGED by the evening paste (Ben's text is the same "let me know
  // before changing"); item 95 confirms it again — it must stay open, not get marked answered.
  assert.ok(ids.includes("R-56"), "R-56 was REOPENED 2026-09-07 after its own 2026-09-06 ANSWERED marker and must show as open again (last-marker-wins); item 95 leaves it WAITING on purpose");
  for (const closed of ["R-18", "R-41", "R-42", "R-48", "R-54", "R-80", "R-81", "R-82", "R-83", "R-84", "R-85", "R-88", "R-89", "R-90", "R-91"]) {
    assert.ok(!ids.includes(closed), `${closed} is ANSWERED/moved-to-§K and must not show up as an open ruling`);
  }
  assert.strictEqual(open.length, 1, "R-56 is now the sole open ruling in the real doc (item 95 closed R-90 and R-91)");
  // R-56 has no `Ask:` line — its heading is already a self-contained question, so item 44's
  // fallback (heading stays the ask) applies, exactly like R-18/R-80/R-84/R-85 before it closed.
  const r56 = open.find((r) => r.id === "R-56");
  assert.strictEqual(r56.section, "H. Map & character creation");
  assert.strictEqual(r56.applied, false);
  assert.strictEqual(r56.ask, "Should adversaries use the Edha Senses Range table too, or keep the cosmere ladder?", "R-56 has no Ask: line, so the self-contained heading question is the ask (item 44's fallback)");
  // item 87: R-56's own recommendation uses the BARE `*Recommended*` style (no colon) attached to
  // its `**(a)**` option, not the `*Recommended default: …*` colon form — RULING_DEFAULT_RE never
  // matched it, so the card used to read "no default stated" even though a recommendation exists.
  assert.strictEqual(r56.default, "(a) extend the Edha table to adversary sheets AND their token sight, so one rule governs everything — Recommended, and it matches the 07-17c ruling that adversaries \"use the same vision rules as players unless bespoke\"", "item 87: the bare *Recommended* style now yields the (a) option clause instead of \"no default stated\"");
  for (const r of open) assert.strictEqual(typeof r.blocks, "number", `${r.id}.blocks is not a number in the raw parse (mobileSnapshot fills it in)`);
  // item 76: every open ruling's card carries a real default (the bold-inline form used to capture ""),
  // read through the inner **…** pairs and stripped of the markers.
  for (const r of open) assert.ok(r.default.length > 0 && !/\*\*/.test(r.default), `${r.id}: default is empty or still carries bold markers — "${r.default}"`);
  // Every open ruling yields a real question: either a heading ending in "?" or an Ask: line (which must too).
  for (const r of open) assert.ok(/\?$/.test(r.ask), `${r.id}: ask is not a question — "${r.ask}"`);
});

// item 96: the desktop Rulings tab's `done` flag used to require living under §K — an inline
// ANSWERED/VETOED/SETTLED answer left in its themed section (the doc's OWN convention when a
// worker hasn't yet moved the text) rendered as an open row forever, which is how 47 already-
// answered rulings sat in §A–§J reading as open on the desktop tab (R-47: "why is this still
// here?"). parseRulings() now also marks `done: true` when rulingBodyIsClosed() reads the
// assembled body (heading + following prose, same span parseOpenRulings() reads) as closed,
// regardless of section — this fixture pins BOTH directions plus the pre-existing §K-regardless-
// of-body behavior, all against the SAME body-assembly walk so this can never drift from
// parseOpenRulings()'s idea of "closed".
const DONE_FIXTURE = `## B. Scope

**R-300. Answered outside §K must read done.** Some prose about the rule.
> **ANSWERED 2026-09-06: yes, ship it.**

**R-301. Unanswered must stay NOT done.** Some prose with no ANSWERED/VETOED/SETTLED/REOPENED
marker anywhere in this body.

## K. Settled

**R-302. Anything already living in §K stays done regardless of its own body.** No closing marker
in this body either — §K alone must still mark it done, unchanged from before item 96.
`;

test("build-dashboard: parseRulings — done is true when rulingBodyIsClosed() reads the body closed, not only inside §K (item 96)", () => {
  const doc = dashboard.parseRulings(DONE_FIXTURE);
  const byId = {};
  for (const sec of doc.sections) {
    for (const b of sec.blocks) {
      if (b.type === "item" && b.kind === "ruling") {
        const m = b.text.match(/^\*\*([RF]-\d+)\./);
        byId[m[1]] = b;
      }
    }
  }
  assert.strictEqual(byId["R-300"].done, true, "an ANSWERED body outside §K must render done: true");
  assert.strictEqual(byId["R-301"].done, false, "an unanswered body must render done: false");
  assert.strictEqual(byId["R-302"].done, true, "§K items stay done regardless of their own body — unchanged");
});

const RULINGS_FIXTURE = `## B. Scope

**R-100. Stub-duplicate check: does the retired stub avoid re-opening?** -> **SETTLED, moved to §K.**

**R-101. The widget wobbles.** Some prose about the widget.
*Recommended default: yes, make it spin.* More trailing prose.

Ask: Should the widget spin (a), or stay still (b)?

*(R-102 — already answered elsewhere — ANSWERED 2026-09-06, moved to §K.)*

**R-105. Should the lever lock?** Context prose. *Recommended default: **(a) yes, lock it** — cheap
to undo; NOT applied yet.* (b) leave it loose. *(Board table.)*

**R-106. Should the dial click?** Context prose. *Recommended default: **(a) yes** — **APPLIED** in
#999 (stub in §I).* (b) silent.

*(R-107 — a stub for a ruling whose entry is elsewhere — DEFAULT (a) APPLIED 2026-09-06.)*

**R-108. Should the gadget beep?** Context prose with no recommendation of any kind stated anywhere
in this body. *(Board table.)*

**R-109. Should the widget replace the gizmo?** Context prose. Options: **(a)** replace it entirely,
so the old gizmo retires — *Recommended*, and it keeps the API simple; **(b)** keep both side by
side. *(Board table.)*

## I. Applied defaults

These are already live in the code.

**R-103. Should the gizmo glow?** Shipped as the default.
**Default applied: make it glow green.** Veto if you disagree.

**R-104. Something already answered.** Explanation here.
> **ANSWERED 2026-09-06: yes.**

## K. Settled

**R-100. Stub-duplicate check: does the retired stub avoid re-opening?** Full text and an actual
answer.
> **ANSWERED 2026-09-06: yes, it does.**
`;

test("build-dashboard: parseOpenRulings — a §B stub pointing at §K does not re-open, §I gets applied:true with its own default sentence, §K is skipped outright", () => {
  const open = dashboard.parseOpenRulings(RULINGS_FIXTURE);
  assert.deepStrictEqual(open.map((r) => r.id).sort(), ["R-101", "R-103", "R-105", "R-106", "R-108", "R-109"]);
  const r101 = open.find((r) => r.id === "R-101");
  assert.strictEqual(r101.default, "yes, make it spin.");
  assert.strictEqual(r101.ask, "Should the widget spin (a), or stay still (b)?", "an Ask: paragraph replaces a symptom heading (item 44)");
  assert.strictEqual(open.find((r) => r.id === "R-103").ask, "Should the gizmo glow?", "no Ask: line → the heading stays the ask");
  assert.strictEqual(r101.applied, false);
  const r103 = open.find((r) => r.id === "R-103");
  assert.strictEqual(r103.applied, true);
  assert.strictEqual(r103.default, "make it glow green.");
  // item 76: the bold-inline form `*Recommended default: **(a) …** …*` — the capture reads through the
  // inner bold (the old `[^*]+` stopped at its first `*` and yielded ""), the markers are stripped, and
  // only an UPPER-CASE bold APPLIED marks the entry applied outside §I ("NOT applied yet" does not).
  const r105 = open.find((r) => r.id === "R-105");
  assert.strictEqual(r105.default, "(a) yes, lock it — cheap to undo; NOT applied yet.");
  assert.strictEqual(r105.applied, false);
  const r106 = open.find((r) => r.id === "R-106");
  assert.strictEqual(r106.default, "(a) yes — APPLIED in #999 (stub in §I).");
  assert.strictEqual(r106.applied, true, "a bold **APPLIED** note in §B marks the entry applied");
  // item 87: a ruling with no `*Recommended…*` marker of any kind still falls back to the plain
  // "no default stated" text — the bare-style fallback must not fire on a body it cannot anchor to.
  const r108 = open.find((r) => r.id === "R-108");
  assert.strictEqual(r108.default, "no default stated");
  // item 87: the BARE `*Recommended*` style (no colon), attached to a lettered option instead of
  // leading its own sentence — RULING_DEFAULT_RE never matches this shape (no colon), so the
  // default is the `(x) …` option clause the marker is attached to, read through to the next
  // option's label, markers stripped the same way the colon-form path strips them.
  const r109 = open.find((r) => r.id === "R-109");
  assert.strictEqual(r109.default, "(a) replace it entirely, so the old gizmo retires — Recommended, and it keeps the API simple");
});

// item 85: a ruling's OPEN/CLOSED status is decided by its LAST status marker in document order,
// not by "does the body carry any closing marker at all" — R-56 was ANSWERED then REOPENED
// against its own answer, and the old "any marker anywhere" rule read the older ANSWERED and
// reported it closed. R-200/R-201 below pin both directions of the reversal; R-202 pins the
// unrelated no-marker case stays open exactly as before.
const REOPEN_FIXTURE = `## C. Mechanics — what a rule should do

**R-200. Should the answered-then-reopened case count as open again?** Context prose about the rule.
> **ANSWERED 2026-09-06: yes, shipped as described.**
> **REOPENED 2026-09-07 (Ben): actually, revisit this — I want the opposite.**

**R-201. Should the reopened-then-reanswered case count as closed again?** Context prose about the rule.
> **REOPENED 2026-09-06 (Ben): revisit this one.**
> **ANSWERED 2026-09-07: settled again, for real this time.**

**R-202. Should a ruling with no status marker at all stay open?** Context prose, no ANSWERED, VETOED, SETTLED, or REOPENED marker anywhere in this body.
`;

test("build-dashboard: parseOpenRulings — REOPENED is last-marker-wins: ANSWERED-then-REOPENED opens, REOPENED-then-ANSWERED re-closes, no marker stays open", () => {
  const open = dashboard.parseOpenRulings(REOPEN_FIXTURE);
  const ids = open.map((r) => r.id);
  assert.ok(ids.includes("R-200"), "R-200: the REOPENED marker comes after ANSWERED, so it must win and the ruling must read open");
  assert.ok(!ids.includes("R-201"), "R-201: the ANSWERED marker comes after REOPENED, so it must win and the ruling must read closed again");
  assert.ok(ids.includes("R-202"), "R-202: no status marker at all is the pre-existing open case and must be unaffected");
});

test("build-dashboard: countCitations counts citing rows (not raw text occurrences) and never confuses a migration code like 2bR-18 with ruling R-18", () => {
  const tabs = [{ key: "bench", sections: [{ blocks: [
    { type: "item", text: "2bR-18 migration pass note", log: [] },
    { type: "item", text: "the roll", log: ["**R-18** left alone", "same row, second mention of R-18"] },
    { type: "prose", text: "unrelated commentary about R-18 elsewhere in the section" },
  ] }] }];
  assert.strictEqual(dashboard.countCitations("R-18", tabs, ["bench"]), 2, "one item row (its log counts once, however many times it mentions R-18) + one prose block");
  assert.strictEqual(dashboard.countCitations("R-18", tabs, ["repo"]), 0, "a tab outside tabKeys is not searched");
});

test("pm-state: the mobile snapshot's openRulings carries {id, section, ask, default, applied, blocks} and rides in the dash index (no chunk fetch needed)", () => {
  const snap = snapshot();
  assert.ok(Array.isArray(snap.openRulings) && snap.openRulings.length >= 1, "R-56 at least, after item 95's 2026-09-07 evening close-out, part 2 (R-90/R-91 answered and closed)");
  for (const r of snap.openRulings) {
    assert.deepStrictEqual(Object.keys(r).sort(), ["applied", "ask", "blocks", "default", "id", "section"]);
    assert.strictEqual(typeof r.blocks, "number");
  }
  const shards = shardDashboard(snap, { now: NOW });
  assert.deepStrictEqual(shards.index.openRulings, snap.openRulings, "openRulings rides in the index, not a chunk");
});

test("pm-state: the shards stay under the chunk cap and cover every section exactly once", () => {
  const snap = snapshot();
  const B = (o) => Buffer.byteLength(JSON.stringify(o));
  // The stress cap used to be a fixed 64 KiB — which is a real-world size ONLY by coincidence: on
  // 2026-09-05 the repo tab was ONE section holding the whole TODO doc (65 443 bytes), so this same
  // "stress" pass was silently pinning that section 93 bytes under its own ceiling. A 1.2 KB TODO
  // addition then failed `tests/run.js` with `alone exceeds`, and every future addition would too.
  // The fix (item 38) split the repo tab into one section per `## N.` item, so no single section
  // should organically approach a chunk cap again — assert that, then derive the stress cap from
  // whatever the largest REAL section actually is. This makes the pass a stress test of the
  // SHARDER's behaviour under a tight cap (does it still shard correctly, still throw correctly),
  // not a size limit on how much Ben is allowed to write in one TODO item or bench section.
  const sectionBytes = [];
  for (const tab of snap.tabs) for (const sec of tab.sections) sectionBytes.push(B({ blocks: sec.blocks }) + B(sec.id) + 2);
  const largest = Math.max(...sectionBytes);
  assert.ok(largest < 64 * 1024, `largest section is ${largest} bytes — a single section should stay well under a 64 KiB chunk cap`);
  const stressCap = Math.ceil(largest * 1.5);
  for (const maxBytes of [DASH_CHUNK_BYTES, stressCap]) {
    const { index, chunks } = shardDashboard(snap, { maxBytes, now: NOW });
    assert.ok(B(index) < 256 * 1024, "index under the store's document cap");
    const seen = new Map();
    for (const id of Object.keys(chunks)) {
      assert.ok(B(chunks[id]) <= maxBytes, `${id} is ${B(chunks[id])} bytes, cap ${maxBytes}`);
      assert.strictEqual(chunks[id].stamp, snap.stamp);
      for (const secId of Object.keys(chunks[id].sections)) { assert.ok(!seen.has(secId), `${secId} appears twice`); seen.set(secId, id); }
    }
    for (const tab of index.tabs) for (const sec of tab.sections) {
      assert.strictEqual(seen.get(sec.id), sec.chunk, `${sec.id} points at the chunk that holds it`);
      assert.ok(!("blocks" in sec), "the index carries no row blocks");
      seen.delete(sec.id);
    }
    assert.strictEqual(seen.size, 0, "no chunk section is outside the index");
    assert.deepStrictEqual(index.chunks.map((c) => c.id), Object.keys(chunks));
    assert.strictEqual(index.generatedAt, NOW);
    assert.strictEqual(index.stamp, snap.stamp);
  }
  assert.ok(Object.keys(shardDashboard(snap, { maxBytes: stressCap }).chunks).length > Object.keys(shardDashboard(snap, { maxBytes: DASH_CHUNK_BYTES }).chunks).length, "a smaller cap means more chunks");
  assert.throws(() => shardDashboard(snap, { maxBytes: 2048 }), /alone exceeds/, "a section bigger than the cap is an error, not an oversized document");
});

test("pm-state: --inject fills both slots and the page can assemble the dashboard from the second", () => {
  const page = fs.readFileSync(path.join(REPO, "docs", "pm-board-mobile.html"), "utf8");
  assert.ok(/<script id="pm-state" type="application\/json">\{\}<\/script>/.test(page), "tracked page keeps an empty state slot");
  assert.ok(/<script id="pm-dashboard" type="application\/json">\{\}<\/script>/.test(page), "tracked page keeps an empty dashboard slot");
  const state = parseBoard(FIXTURE, { now: NOW, git: GIT });
  const shards = shardDashboard(snapshot(), { now: NOW });
  const out = injectPage(page, state, shards);
  const slot = (id) => JSON.parse(out.match(new RegExp(`<script id="${id}" type="application\\/json">([^<]*)<\\/script>`))[1]);
  assert.strictEqual(slot("pm-state").queue.length, 5);
  const d = slot("pm-dashboard");
  assert.deepStrictEqual(Object.keys(d).sort(), ["chunks", "index"]);
  assert.strictEqual(d.index.stamp, snapshot().stamp);
  for (const c of d.index.chunks) assert.ok(d.chunks[c.id] && d.chunks[c.id].stamp === d.index.stamp, `chunk ${c.id} present under the index's stamp`);
  assert.ok(!out.includes("</script><script>alert"), "nothing in the sources can close the slot early");
  assert.ok(out.length > page.length + 500000, "the whole dashboard rides in the page");
});

// ---- item 99: runLog is a PROJECTION (2026-09-08) --------------------------------------------
// The run log alone hit 154 KB of a 259 KB `pm/state` document and the store's 256 KiB cap
// refused the push (00:04 ET, 2026-09-08). A 400-row synthetic board stress-tests the cap the
// same way the dashboard shard test above stress-tests DASH_CHUNK_BYTES: derive the expected
// numbers from the SAME source rows the markdown table is built from, not from hand-counted
// literals, so the pin does not silently drift if the generator changes.
const BIG_RUNLOG_ROWS = Array.from({ length: 400 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 0, 1) + i * 86400000).toISOString().slice(0, 10);
  // Item "1" appears exactly once, at row 5 — deep in the part the 60-row cap drops (the
  // projection keeps only the newest 60 of 400, i.e. indices 340-399) — so any per-item lookup
  // that reads the CAPPED array instead of the full one will fail to find it.
  const item = i === 5 ? "1" : String((i % 20) + 2);
  const model = i === 5 ? "sonnet" : i % 3 === 0 ? "opus" : i % 3 === 1 ? "sonnet" : "fable";
  return { date, item, model };
});
const BIG_BOARD = `# PM Board — item 99 stress fixture

## Queue (in order)

| # | Item | Lane | Model | Size | Deps | Status | PR |
|---:|---|:-:|:-:|:-:|---|---|---|
| 1 | 1 Test item still running | R | sonnet | S | — | running | |

## Run log

| Date | Item | Model | Duration | Weighted usage | Outcome | PR |
|---|---|---|---|---:|---|---|
${BIG_RUNLOG_ROWS.map((r) => `| ${r.date} 10:00 | #${r.item} synthetic row | ${r.model} | 5 min | 0.1M | ok | |`).join("\n")}
`;

test("pm-state: runLog projects the newest 60 of 400 rows; runLogTotal/runLogFrom describe the full log; dispatches and per-item lookups read the FULL log", () => {
  const s = parseBoard(BIG_BOARD, { now: NOW, git: GIT });
  assert.strictEqual(DEFAULT_RUNLOG_ROWS, 60, "the default this test pins against");
  assert.strictEqual(s.runLog.length, 60, "projected run log caps at the default 60 rows");
  assert.strictEqual(s.runLogTotal, 400, "the full parsed count ships alongside the cap");
  assert.strictEqual(s.runLogFrom, BIG_RUNLOG_ROWS[340].date, "runLogFrom is the oldest row still in the projection (row 400-60)");
  assert.strictEqual(s.runLog[0].date, BIG_RUNLOG_ROWS[340].date, "oldest kept row");
  assert.strictEqual(s.runLog[59].date, BIG_RUNLOG_ROWS[399].date, "newest row stays last, as today");

  const expectedDispatches = BIG_RUNLOG_ROWS.filter((r) => r.model === "sonnet" || r.model === "opus").length;
  assert.strictEqual(s.dispatches.length, expectedDispatches, "dispatches is counted from all 400 rows, not the capped 60");
  assert.ok(expectedDispatches > s.runLog.length, "sanity: the full-log dispatch count exceeds the whole capped projection");

  // The `running` queue row for item 1 must resolve its start time from row 5 — outside the
  // last-60 window — proving the workers synthesis (`[...runLog].reverse().find(...)`) still
  // reads the FULL parsed log, not the capped one.
  assert.strictEqual(s.workers.length, 1);
  assert.strictEqual(s.workers[0].item, "1");
  assert.strictEqual(s.workers[0].startedAt, wallToIso(BIG_RUNLOG_ROWS[5].date, "10:00", "America/New_York"), "worker start time resolved past the 60-row cap");

  const bytes = Buffer.byteLength(JSON.stringify(s));
  assert.ok(bytes < 262144, `serialized state is ${bytes} bytes, must stay under the store's 256 KiB document cap`);
});

test("pm-state: --runlog-rows overrides the default cap (0 = all)", () => {
  const all = parseBoard(BIG_BOARD, { now: NOW, git: GIT, runlogRows: 0 });
  assert.strictEqual(all.runLog.length, 400, "0 means no cap");
  assert.strictEqual(all.runLogTotal, 400);
  const ten = parseBoard(BIG_BOARD, { now: NOW, git: GIT, runlogRows: 10 });
  assert.strictEqual(ten.runLog.length, 10);
  assert.strictEqual(ten.runLogTotal, 400, "runLogTotal is unaffected by the override");
  assert.strictEqual(ten.dispatches.length, BIG_RUNLOG_ROWS.filter((r) => r.model === "sonnet" || r.model === "opus").length, "dispatches still full even under a tighter override");
});

test("pm-state: the real board's projected state stays under the store's 256 KiB document cap", () => {
  const md = fs.readFileSync(path.join(REPO, "docs", "PM_BOARD.md"), "utf8");
  const s = parseBoard(md, { now: NOW, git: GIT });
  const bytes = Buffer.byteLength(JSON.stringify(s));
  assert.ok(bytes < 262144, `real board projects to ${bytes} bytes`);
});
