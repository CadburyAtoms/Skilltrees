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
const { parseBoard, injectState, injectPage, shardDashboard, wallToIso, STATUS_VOCAB, DASH_CHUNK_BYTES } = require(path.join(REPO, "scripts", "pm-state.js"));
const dashboard = require(path.join(REPO, "scripts", "build-dashboard.js"));

const FIXTURE = `# PM Board — fixture

## Inbox from Ben

_(Write anything here — the PM reads it every wake.)_

Foundry is up tonight 8–10.

- skip 20, do 19a next

## Budget model

**Caps (CONFIRMED):** at most 3 dispatches per 4-hour window, at most 1 of them Opus; the PM wakes on
completion; no dispatch between 22:00 and 06:30 America/New_York unless it is a cloud routine.

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

test("pm-state: caps, rulings, inbox, foundry come from their own sections", () => {
  const s = parseBoard(FIXTURE, { now: NOW, git: GIT });
  assert.deepStrictEqual(s.caps, { dispatchesPerWindow: 3, opusPerWindow: 1, windowHours: 4, quietStart: "22:00", quietEnd: "06:30", timeZone: "America/New_York" });
  assert.deepStrictEqual(s.rulings.map((r) => [r.id, r.waiting]), [["PM-R1", false], ["PM-R7", true]]);
  assert.deepStrictEqual(s.inbox, ["Foundry is up tonight 8–10.", "skip 20, do 19a next"], "placeholder ignored, prose + list kept");
  assert.strictEqual(s.foundry.scheduled, false);
  assert.strictEqual(s.foundry.deployStale, true);
  assert.strictEqual(s.foundry.liveEngineVersion, "2026-07-28");
  assert.strictEqual(s.source.hash.length, 10);
  assert.strictEqual(s.source.commit, "abc1234");
  assert.strictEqual(s.generatedAt, NOW);
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

test("pm-state: the shards stay under the chunk cap and cover every section exactly once", () => {
  const snap = snapshot();
  const B = (o) => Buffer.byteLength(JSON.stringify(o));
  for (const maxBytes of [DASH_CHUNK_BYTES, 64 * 1024]) {
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
  assert.ok(Object.keys(shardDashboard(snap, { maxBytes: 64 * 1024 }).chunks).length > Object.keys(shardDashboard(snap, { maxBytes: DASH_CHUNK_BYTES }).chunks).length, "a smaller cap means more chunks");
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
