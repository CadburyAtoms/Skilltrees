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
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { parseBoard, injectState, wallToIso, inWindow, nextWindowOpen, parseWindowEntry, STATUS_VOCAB } = require(path.join(REPO, "scripts", "pm-state.js"));

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
  assert.deepStrictEqual(s.inbox, ["Foundry is up tonight 8–10.", "skip 20, do 19a next"], "placeholder ignored, prose + list kept");
  assert.strictEqual(s.foundry.scheduled, false);
  assert.strictEqual(s.foundry.deployStale, true);
  assert.strictEqual(s.foundry.liveEngineVersion, "2026-07-28");
  assert.strictEqual(s.source.hash.length, 10);
  assert.strictEqual(s.source.commit, "abc1234");
  assert.strictEqual(s.generatedAt, NOW);
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
