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
 *   - dash/index is ONE store document under the cap, every mirror ref carrying its row (item 116);
 *   - --inject fills BOTH slots (board state + dashboard index) and the deploy block is bounded.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { parseBoard, injectState, injectPage, dashIndex, wallToIso, inWindow, nextWindowOpen,
  parseWindowEntry, parseBenOnly, STATUS_VOCAB, DASH_INDEX_BYTES, DEFAULT_RUNLOG_ROWS } = require(path.join(REPO, "scripts", "pm-state.js"));
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

const BEN_ONLY_CURRENT_NOTHING = "# Board\n\n> Current session note, nothing pending tonight. **Waiting on Ben: nothing.**\n>\n> _(The line this replaces, for the record:)_ Old session note, still carrying open asks. **Waiting on Ben:** **R-1** - a stale ruling, asked twice, unanswered; and ONE stale bat run still owed.\n\n## Queue (in order)\n\n| # | Item | Lane | Model | Size | Deps | Status | PR |\n|---:|---|:-:|:-:|:-:|---|---|---|\n| 1 | 1 filler | R | sonnet | S | - | queued | |\n";

const BEN_ONLY_CURRENT_ONE_ASK = "# Board\n\n> Current session note. **Waiting on Ben:** a single fresh ask, still open.\n>\n> _(The line this replaces, for the record:)_ Old session note, still carrying open asks. **Waiting on Ben:** **R-1** - a stale ruling, asked twice, unanswered; and ONE stale bat run still owed.\n\n## Queue (in order)\n\n| # | Item | Lane | Model | Size | Deps | Status | PR |\n|---:|---|:-:|:-:|:-:|---|---|---|\n| 1 | 1 filler | R | sonnet | S | - | queued | |\n";

test("pm-state: parseBenOnly scopes to the CURRENT session line only, before the first 'replaces' marker", () => {
  assert.deepStrictEqual(parseBenOnly(BEN_ONLY_CURRENT_NOTHING), [],
    "current line says nothing is waiting; the replaced line's two stale asks must not surface");
  assert.deepStrictEqual(parseBenOnly(BEN_ONLY_CURRENT_ONE_ASK), ["a single fresh ask, still open."],
    "current line's own ask surfaces; the replaced line's two stale asks are out of scope");
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
  assert.ok(snap.deploy && snap.deploy.line, "the DEPLOY STATE line rides along");
});

// ---- item 116 (2026-09-13): the deploy state is ONE bounded line, never the section's prose ----
// Ben: "the 'deployed' section is gigantic and taking up the whole artifact." The checklist's
// `# ⚑ DEPLOY STATE` section was shipped whole (27 prose blocks, ~24 KB on 2026-09-13) as
// `deploy.prose`; now only its title line and the first sentence of what it says is owed ride.
test("build-dashboard: the projected deploy block is bounded — a title line and at most 3 owed sentences, never the section's prose", () => {
  const d = snapshot().deploy;
  assert.ok(d, "the real checklist has a DEPLOY STATE section");
  assert.deepStrictEqual(Object.keys(d).sort(), ["line", "owed", "title"], "no `prose`/`hot` — the section's body never ships");
  assert.ok(d.line.length > 0 && d.line.length <= 200, `line is ${d.line.length} chars`);
  assert.ok(!/DEPLOY STATE/.test(d.line), "the label is stripped from the line");
  assert.ok(Array.isArray(d.owed) && d.owed.length <= 3, `owed has ${d.owed.length} entries`);
  for (const o of d.owed) assert.ok(o.length <= 200 && !/\*\*/.test(o), `owed entry bounded and plain: ${o}`);
  assert.ok(Buffer.byteLength(JSON.stringify(d)) < 1024, "the whole deploy block is under 1 KB");
  // Synthetic: a section drowning in history still projects to the same bounded shape.
  const sec = {
    title: "⚑ DEPLOY STATE (confirmed 2026-01-01 — LIVE)",
    blocks: [{ type: "prose", text: "**What is live:** " + "x".repeat(3000) }]
      .concat(Array.from({ length: 30 }, (_, i) => ({ type: "prose", text: `⛔ **A PACK REBUILD IS OWED (round ${i}).** ` + "y".repeat(500) + ". More history." })))
      .concat([{ type: "prose", text: "MERGED BUT NOT YET DEPLOYED: item 999 — " + "z".repeat(400) }]),
  };
  const big = dashboard.deployLine(sec);
  assert.strictEqual(big.line, "confirmed 2026-01-01 — LIVE");
  assert.strictEqual(big.owed.length, 3);
  assert.strictEqual(big.owed[0], "⛔ A PACK REBUILD IS OWED (round 0).", "first sentence only");
  assert.ok(Buffer.byteLength(JSON.stringify(big)) < 1024, "31 blocks of history still fit in under 1 KB");
});

// ---- item 43: the "Needs you" view's open-ruling cards (2026-09-06) ----

test("build-dashboard: parseOpenRulings finds exactly the pinned open set in the real EDHA_RULINGS.md (R-127, opened by bench run 47)", () => {
  // item 83 (2026-09-07 21:51 ET): Ben answered R-56 in chat, verbatim "Cosmere ladder for
  // everyone", reversing his own 2026-09-06 (a). R-56 was the SOLE open ruling left in the doc
  // (item 95 had closed R-90 and R-91), so with its ANSWERED (final) marker recorded and the entry
  // moved to §K.7 behind a §H stub, **the real doc now has none.** That is the state this pins:
  // the phone's "Needs you" view is legitimately empty, not broken.
  //
  // The parser behaviours this test used to demonstrate ON R-56 are all fixture-pinned below and
  // lose nothing by its closing: item 44's heading-as-ask fallback (R-103), item 87's bare
  // `*Recommended*` style (R-109) and its no-marker fallback (R-108), item 76's bold-inline default
  // (R-105/R-106), and item 85's last-marker-wins REOPENED rule (its own fixture test). What only
  // the real doc can check is the closed list and the count — so that is all that is left here.
  // ⚠️ When Ben opens the next ruling this length assertion moves; do not delete it, and do not
  // re-point the illustrations at whatever that ruling turns out to be.
  //
  // 2026-09-09, talent ecosystem review: eleven rulings opened at once (R-95 … R-105), the largest
  // batch the doc has taken. The length assertion moves from 0 to 11 exactly as the note above
  // said it would, and the three shape loops below — which have been vacuous since item 83 — go
  // LIVE for the first time: every one of the eleven must parse an `ask` that ends in a question
  // mark and a `default` with the bold markers stripped. That is the point of keeping them.
  //
  // 2026-09-12: six more (R-106 … R-111) filed from the same review's problem ledger, so the list
  // grows to seventeen and the same three shape loops hold every one of them to that contract.
  // 2026-09-13: all seventeen answered by Ben in one sitting and moved to §K.8 (the work is TODO
  // items 104–115), so the open set is EMPTY again and the three shape loops go vacuous until the
  // next ruling is filed. The seventeen join the closed list below so a regression that re-opens
  // one is named.
  // 2026-09-13, bench run 45: R-112 filed (The Reckoning cannot pay for its own Unbreakable Line —
  // raise the pool, make it free, or drop the cost), so the set was one again and the three shape
  // loops were live on it. Answered the same day (Ben, phone board, 14:10 ET: (a) raise the pool to
  // 3) and moved to §K.9 — the open set is EMPTY again. R-112 joins the closed list below.
  // 2026-09-13, bench run 46: R-113 filed (may a bench run call `edha.syncAllAdversaries()`, and
  // should the bulk button gain a scope guard — it carries TODO item 123), so the set was one
  // again and the three shape loops below went live on it.
  // 2026-09-13, item 123: Ben answered R-113 in chat, verbatim "R-113 - agents need to be able to
  // sync adversaries for bench runs" (option (a)), moved to §K.10 — the open set is EMPTY again.
  // R-113 joins the closed list below so a regression that re-opens it is named.
  // 2026-09-13, item 127: six design-proposal rulings filed for the queued TODO items — R-114
  // (item 101, the redirect-unwind heal — renumbered off item 101's phantom "R-92"), R-115 (item
  // 107, False Premise's payload), R-116 (item 109, Final Decree's Witness clause), R-117 (item
  // 114, Trade Routes), R-118 (item 108, the three thin deity gates), R-119 (item 106, Sovereignty's
  // Decree zone) — filed in EDHA_RULINGS.md §L, all WAITING on Ben. The open set is exactly these
  // six until he answers.
  // 2026-09-13, balance review (after the item-111 prose pass): six filed at once in §D —
  // R-120 (Knowledge's Insight multiplier), R-121 (deity Investiture income for Power and
  // Destruction), R-122 (Chaos's Omen cap), R-123 (Blue's freeze and Life's mutation behind the
  // level-6 wall), R-124 (Tempered Edge's Deflect scope), R-125 (Power's dead Frightened reads).
  // 2026-09-13, 21:57–21:59 ET, late: Ben answered all seven of the above from the mobile board's
  // phone — R-92 and R-114 … R-119 — each by tapping the card's own (a) text (item 145's
  // `tmp/pm/inbox-2026-09-13/notes.json`). All seven now carry an inline ANSWERED (a) marker and
  // moved verbatim to §K.13. §L keeps its heading with seven one-line stubs and no open body.
  // The pinned set below is whatever the real doc holds open on the day this was last re-pinned —
  // today that is the EMPTY SET. The seven join the closed list so a regression that re-opens any
  // one of them (a stray `**REOPENED …**` with no matching pin update) is named by this test.
  // 2026-09-14, bench run 47: ONE new ruling opened — R-127 (a talent that pays its cost and passes
  // its test against a target immune to the condition it was buying: gate before cost, charge as
  // now, refund, or leave it to the table). Filed from the BR-1 row; the card half of the same
  // finding is a plain bug and is TODO item 149, not part of the ruling. The length assertion moves
  // from 0 to 1 exactly as the note above said it would.
  // 2026-09-14, the bestiary redo's scoping session (item 121, Ben: "This looks good. Continue."):
  // EIGHT rulings filed at once in §G.1 — R-128 (attributes vs overrides on blocks), R-129 (which
  // GM cues become effects), R-130 (the nine legacy dungeon blocks), R-131 (invested-human
  // adversaries), R-132 (the colour ledger and the mono-Blue moratorium), R-133 (three shelved
  // feel rows that are really card rules), R-134 (per-role numeric targets against this party),
  // R-135 (the order of the nation-by-nation pass). All WAITING on Ben; each carries a recommended
  // default and an Ask line, as the shape contract below requires. The open set is exactly these
  // eight until he answers; the length assertion moves 0 → 8.
  // 2026-09-14, 23:19–23:23 ET: Ben answered all eight from the phone board (seven by tapping the
  // card's (a) text, R-128 by (a) plus a gloss on Senses Range); the close-out moved them to §K.15
  // and R-127 to §K.14. The open set is EMPTY again; the eight join the closed list below.
  // 2026-09-14, bench run 48 (the yardstick set, item 155): ONE new ruling opened in §L — R-136
  // (a fooled PC's contest talent resolved against the Mistheron's phantom copy at defenses 0/0/0:
  // as designed with card text, inherited defenses, or a pre-cost refusal). Filed from the YARD-2
  // ledger; the length assertion moves 0 → 1.
  // 2026-09-14, later the same evening: Ben answered R-136 (a) in chat ("Default for R 136 as
  // well") with the statblock-gate yes; the body moved to §K.16 and the open set is EMPTY again.
  // R-136 joins the closed list below; the length assertion moves 1 → 0.
  // 2026-09-15, the attack-model rerun (item 166): FOUR rulings filed already answered — R-137 (Ben's
  // 2026-09-14 ruling that adversaries follow the same rules as the PCs, written in the §K.16 shape
  // with a §G stub), and R-138 … R-140 (the per-round line, which derived stats bind on the PC model,
  // how R-134's rows read under one modifier), filed on the gate page and answered "defaults on all
  // rulings" in chat the same day. All four sit in §K.17 with stubs in §G and §L; the open set stays
  // EMPTY and the four join the closed list below.
  // 2026-09-15, bench run 49a: ONE ruling opened in §L — R-141 (False Premise's Reaction denial
  // clears at the END of the target's next turn under the engine's timed-status convention, while its
  // R-115 (a) card says the start; R-28 (a) is the precedent its default follows). Filed from checklist
  // row FP-1; the length assertion moves 0 → 1.
  // 2026-09-15, later the same day (fix pass 13): Ben answered R-141 (a) in chat — "R-141, yeah fix the
  // card text." — so the engine's END-of-next-turn convention stands and False Premise's card text moved.
  // The body moved to §K.18 with a §L stub; the open set is EMPTY again and R-141 joins the closed list
  // below. The length assertion moves 1 → 0.
  // 2026-09-15, at fix pass 13's merge: the PM files R-142 in §L — the decoy damage rolls on ten talents
  // plus Killing Blow and The Final Study (keep the formulas and suppress the system's roll, re-key attack
  // context and colour off the formula, or leave the decoys), from the review of item 169 (PR #396). The
  // length assertion moves 0 → 1.
  // 2026-09-15, later the same afternoon: the PM files R-143 in §L at Ben's request in chat — should the
  // engine apply attack damage itself (auto-apply a clear hit and prompt only for grazes and plot-die
  // choices, a one-click confirm, or today's card). The length assertion moves 1 → 2.
  const ECOSYSTEM_RULINGS = ["R-142", "R-143"];
  const md = fs.readFileSync(path.join(REPO, "EDHA_RULINGS.md"), "utf8");
  const open = dashboard.parseOpenRulings(md);
  const ids = open.map((r) => r.id);
  for (const closed of ["R-18", "R-41", "R-42", "R-48", "R-54", "R-56", "R-80", "R-81", "R-82", "R-83", "R-84", "R-85", "R-88", "R-89", "R-90", "R-91",
      "R-95", "R-96", "R-97", "R-98", "R-99", "R-100", "R-101", "R-102", "R-103", "R-104", "R-105", "R-106", "R-107", "R-108", "R-109", "R-110", "R-111", "R-112", "R-113",
      "R-92", "R-114", "R-115", "R-116", "R-117", "R-118", "R-119", "R-127",
      "R-128", "R-129", "R-130", "R-131", "R-132", "R-133", "R-134", "R-135", "R-136",
      "R-137", "R-138", "R-139", "R-140", "R-141"]) {
    assert.ok(!ids.includes(closed), `${closed} is ANSWERED/moved-to-§K and must not show up as an open ruling`);
  }
  assert.deepStrictEqual(ids.slice().sort(), ECOSYSTEM_RULINGS.slice().sort(),
    `the open rulings are exactly the pinned set (re-pinned 2026-09-13 late, after the phone-board close-out) — got [${ids.join(", ")}]`);
  assert.strictEqual(open.length, ECOSYSTEM_RULINGS.length,
    `${ECOSYSTEM_RULINGS.length} rulings are open in the real doc — got ${open.length}: [${ids.join(", ")}]`);
  // The shape contract, live since 2026-09-09: every open ruling must parse an ask and a default.
  for (const r of open) assert.strictEqual(typeof r.blocks, "number", `${r.id}.blocks is not a number in the raw parse (mobileSnapshot fills it in)`);
  for (const r of open) assert.ok(r.default.length > 0 && !/\*\*/.test(r.default), `${r.id}: default is empty or still carries bold markers — "${r.default}"`);
  for (const r of open) assert.ok(/\?$/.test(r.ask), `${r.id}: ask is not a question — "${r.ask}"`);
});

test("build-dashboard: R-56's §H stub does not re-open it, and its §K.7 entry carries the final answer", () => {
  // item 83's own docs half, pinned against the real doc: the one-line stub left behind in §H must
  // match item 96's RULING_STUB_RE shape (so the desktop tab does not count it as a live ruling),
  // and the moved entry must carry the ANSWERED (final) marker with Ben's words — otherwise the
  // reversal is recorded nowhere a cold session would find it.
  const md = fs.readFileSync(path.join(REPO, "EDHA_RULINGS.md"), "utf8");
  assert.ok(/^\*\(R-56 — .*ANSWERED 2026-09-07, moved to §K\.\)\*$/m.test(md), "§H keeps a one-line R-56 stub in item 96's shape");
  assert.strictEqual((md.match(/^\*\*R-56\./gm) || []).length, 1, "exactly one R-56 entry body, and it lives in §K");
  const kIdx = md.indexOf("## K. Settled");
  assert.ok(md.indexOf("**R-56.") > kIdx, "the R-56 body sits below the §K heading");
  assert.ok(md.includes('**ANSWERED (final) 2026-09-07 21:51 (Ben, chat), verbatim: "Cosmere ladder for everyone."**'),
    "R-56 records Ben's final answer verbatim");
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

test("pm-state: the mobile snapshot's openRulings carries {id, section, ask, default, applied, blocks, text} and rides in the dash index (no chunk fetch needed)", () => {
  const snap = snapshot();
  // item 83 closed R-56, the last open ruling, so this is legitimately EMPTY today — the shape
  // contract below is what matters and stays live for the next ruling Ben opens.
  assert.ok(Array.isArray(snap.openRulings), "openRulings is always an array, empty or not");
  for (const r of snap.openRulings) {
    assert.deepStrictEqual(Object.keys(r).sort(), ["applied", "ask", "blocks", "default", "id", "section", "text"]);
    assert.strictEqual(typeof r.blocks, "number");
    assert.ok(r.text === null || r.text.startsWith("**" + r.id + "."), "text is the ruling's own card (item 116 — the phone's full-text expander reads it from the index)");
  }
  const index = dashIndex(snap, { now: NOW });
  assert.deepStrictEqual(index.openRulings, snap.openRulings, "openRulings rides in the index");
});

test("pm-state: dash/index is ONE document under the store cap — no chunks, no row blocks, every mirror ref carries its row and resolves its section", () => {
  const snap = snapshot();
  const B = (o) => Buffer.byteLength(JSON.stringify(o));
  const index = dashIndex(snap, { now: NOW });
  assert.ok(B(index) < DASH_INDEX_BYTES, `index is ${B(index)} bytes — under the store's 256 KiB document cap`);
  assert.ok(B(index) < 128 * 1024, `index is ${B(index)} bytes — item 116 sized it at ~50 KB; a doubling is a regression to look at`);
  assert.ok(!("chunks" in index), "item 116: the row chunks are gone — the page reads only the index");
  const secIds = new Set();
  for (const tab of index.tabs) for (const sec of tab.sections) {
    assert.ok(!("blocks" in sec) && !("chunk" in sec), "the index carries no row blocks and points at no chunk");
    secIds.add(sec.id);
  }
  const refs = index.forBen.concat(index.benchQueue);
  assert.ok(refs.length > 0, "the real docs have mirror rows");
  for (const r of refs) {
    assert.ok(secIds.has(r.secId), `${r.id}: its section ${r.secId} is in the index (title + chips + counts)`);
    assert.strictEqual(typeof r.text, "string", `${r.id} carries its row text`);
    assert.strictEqual(typeof r.label, "string");
    assert.strictEqual(typeof r.secTitle, "string");
    assert.strictEqual(r.done, false, "a mirror ref is an open row");
  }
  // Only the sections a mirror names ride — the other ~200 titles are weight the phone never reads.
  const referenced = new Set(refs.map((r) => r.secId));
  assert.deepStrictEqual([...secIds].sort(), [...referenced].sort(), "index.tabs[].sections == the sections the mirrors point at");
  assert.deepStrictEqual(index.openRulings, snap.openRulings);
  assert.strictEqual(index.generatedAt, NOW);
  assert.strictEqual(index.stamp, snap.stamp);
  assert.throws(() => dashIndex(snap, { maxBytes: 2048 }), /over the 2048-byte document cap/, "an over-cap index is an error, not an oversized push");
});

test("pm-state: --inject fills both slots; the dashboard slot is {index} alone and the injected page is a fraction of the old one", () => {
  const page = fs.readFileSync(path.join(REPO, "docs", "pm-board-mobile.html"), "utf8");
  assert.ok(/<script id="pm-state" type="application\/json">\{\}<\/script>/.test(page), "tracked page keeps an empty state slot");
  assert.ok(/<script id="pm-dashboard" type="application\/json">\{\}<\/script>/.test(page), "tracked page keeps an empty dashboard slot");
  const state = parseBoard(FIXTURE, { now: NOW, git: GIT });
  const index = dashIndex(snapshot(), { now: NOW });
  const out = injectPage(page, state, index);
  const slot = (id) => JSON.parse(out.match(new RegExp(`<script id="${id}" type="application\\/json">([^<]*)<\\/script>`))[1]);
  assert.strictEqual(slot("pm-state").queue.length, 5);
  const d = slot("pm-dashboard");
  assert.deepStrictEqual(Object.keys(d), ["index"]);
  assert.strictEqual(d.index.stamp, snapshot().stamp);
  assert.strictEqual(d.index.benchQueue.length, snapshot().counts.benchQueue);
  assert.ok(!out.includes("</script><script>alert"), "nothing in the sources can close the slot early");
  // Before item 116 the injected page carried the whole dashboard (~1.47 MB on 2026-09-13); now
  // it is the page plus one index (~290 KB). Pin the order of magnitude, not the exact byte.
  assert.ok(out.length < page.length + 256 * 1024, `injected page is ${out.length} bytes — page + at most one store-cap document`);
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
