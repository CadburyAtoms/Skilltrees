/* tests/pm-board-mobile.test.js — item 94: the mobile board must not re-render the whole page on
 * every store snapshot (Ben's "Sent ✓" marks vanishing, the page jumping to the top, rows he
 * answered elsewhere still showing as open).
 *
 * docs/pm-board-mobile.html's <script> is a single browser IIFE with no module boundary — it reads
 * document.getElementById/localStorage/window.claude at load time and calls connect() + render()
 * + setInterval(tick, ...) unconditionally at the bottom. Loading it whole would need a real DOM
 * (the render functions build HTML strings and updateElapsed()/click handlers then query back INTO
 * that HTML with querySelector), and this repo carries no DOM/HTML-parser dependency (jsdom is not
 * in package.json) — adding one wasn't authorized for this item. So, per the item's own fallback:
 *
 *   - The pure decision — sentStateFor/sentActsHtml, the thing that decides whether a needs-you
 *     card shows its buttons or a "Sent ✓"/"Recorded by PM ✓" mark — is extracted with a tiny
 *     source-slicer (extractFunctionSource/extractVarAssignSource, below) and executed for real via
 *     Node's vm module. This is a REAL execution of the actual shipped code, not a re-implementation
 *     of it — proof (ii).
 *   - The render-path claims (proofs i and iii — which snapshot triggers which render function, and
 *     whether tick() ever reassigns a panel's innerHTML) are pinned as source-shape assertions on
 *     the extracted function bodies: does markSent()'s body write `.innerHTML` anywhere, does
 *     tick()'s body call renderNeedsYou/renderDash, etc. This mirrors the repo's own existing
 *     idiom for "prove a code shape without executing the whole program" — tests/harness-source.test.js
 *     pins codeOnly()'s output and lint-refs.js pass 7 scans stripped source text for talent names;
 *     the same technique, applied here to a page instead of the engine.
 *
 * LIMITATION, stated plainly: these tests do not execute render()/tick()/connect() themselves (that
 * would need a DOM), so a bug in, say, how renderQueue() builds its HTML is out of this file's
 * reach. What they do pin, with certainty: the pm/state handler cannot call the full render() or
 * renderNeedsYou() (so a "Sent ✓" mark literally cannot be in the blast radius of a pm/state push),
 * tick() cannot reassign any panel's innerHTML, and the sent/recorded decision itself is
 * store-derived and produces the right markup for a real inbox snapshot.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PAGE_PATH = path.join(__dirname, "..", "docs", "pm-board-mobile.html");

function readPage() {
  return fs.readFileSync(PAGE_PATH, "utf8");
}

/** The page's one plain `<script>` (the two `type="application/json"` tags don't match — no
 * attributes on the real one). */
function readPageScript() {
  const html = readPage();
  const m = html.match(/<script>\n([\s\S]*)\n<\/script>\s*$/);
  assert.ok(m, "could not locate the page's plain <script> block");
  return m[1];
}

/** Balanced-brace slice of `function <name>(...) { ... }`, starting at the `function` keyword. */
function extractFunctionSource(src, name) {
  const re = new RegExp("function\\s+" + name + "\\s*\\(");
  const m = re.exec(src);
  assert.ok(m, "function not found in page script: " + name);
  const openBrace = src.indexOf("{", m.index);
  assert.ok(openBrace > m.index, "no body found for function " + name);
  let depth = 0, i = openBrace;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  assert.strictEqual(depth, 0, "unbalanced braces extracting function " + name);
  return src.slice(m.index, i);
}

/** Balanced-brace slice of `var <name> = function (...) { ... };` (esc, sendNote, etc. are
 * declared this way, not as `function name(...)`). */
function extractVarAssignSource(src, varName) {
  const marker = "var " + varName + " = ";
  const idx = src.indexOf(marker);
  assert.ok(idx >= 0, "var not found in page script: " + varName);
  const openBrace = src.indexOf("{", idx);
  let depth = 0, i = openBrace;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  if (src[i] === ";") i++;
  return src.slice(idx, i);
}

/** Runs the named pure helpers (and their own small dependency chain) in a fresh vm context and
 * hands back the live functions — a REAL execution of the shipped source, just without the DOM
 * parts of the file around it. */
function loadPureHelpers(script) {
  const parts = [
    extractVarAssignSource(script, "esc"),
    extractFunctionSource(script, "benOnlyPrefix"),
    extractFunctionSource(script, "sentStateFor"),
    extractFunctionSource(script, "sentActsHtml"),
  ].join("\n");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(parts + "\nthis.__out = { esc: esc, benOnlyPrefix: benOnlyPrefix, sentStateFor: sentStateFor, sentActsHtml: sentActsHtml };", sandbox);
  return sandbox.__out;
}

/* ---- proof (ii): an inbox snapshot carrying a note with a card's prefix — the card renders as
 * sent with no click. sentStateFor/sentActsHtml ARE the decision rulingCardHtml/benOnlyCardHtml
 * make (pinned separately below), so exercising them directly exercises the real mechanism. ------ */

const script = readPageScript();
const { benOnlyPrefix, sentStateFor, sentActsHtml } = loadPureHelpers(script);

test("sentStateFor: no matching inbox note → buttons (the card is untouched)", () => {
  const ask = "check the deploy note";
  const state = sentStateFor(benOnlyPrefix(ask), []);
  assert.strictEqual(state.state, "buttons");
  assert.strictEqual(sentActsHtml(state), null);
});

test("sentStateFor: a note whose text opens with the card's prefix (status new) → sent, no click needed", () => {
  const ask = "check the deploy note";
  const prefix = benOnlyPrefix(ask);
  const inboxDocs = [{ id: "n1", text: prefix + "done.", status: "new", createdAt: "2026-09-07T17:24:00Z" }];
  const state = sentStateFor(prefix, inboxDocs);
  assert.strictEqual(state.state, "sent");
  const html = sentActsHtml(state);
  assert.ok(html.includes("Sent"), "expected a Sent mark, got: " + html);
  assert.ok(!/data-done=/.test(html), "a sent card must not still carry its Done button");
});

test("sentStateFor: the same note marked seen by the PM, with an action line → recorded, shows the action", () => {
  const ask = "check the deploy note";
  const prefix = benOnlyPrefix(ask);
  const inboxDocs = [{ id: "n1", text: prefix + "done.", status: "seen", action: "Confirmed live engine matches main.", createdAt: "2026-09-07T17:24:00Z" }];
  const state = sentStateFor(prefix, inboxDocs);
  assert.strictEqual(state.state, "recorded");
  assert.strictEqual(state.action, "Confirmed live engine matches main.");
  const html = sentActsHtml(state);
  assert.ok(html.includes("Recorded by PM"), "expected a Recorded-by-PM mark, got: " + html);
  assert.ok(html.includes("Confirmed live engine matches main."), "the PM's action line must render");
});

test("sentStateFor: matches by PREFIX, not exact text — a longer sent note (e.g. a veto with reasons) still counts", () => {
  const prefix = "Re Rulings › Deploy › R-1. Ship it?: ";
  const inboxDocs = [{ id: "n1", text: prefix + "VETO — wait for the bench.", status: "new" }];
  assert.strictEqual(sentStateFor(prefix, inboxDocs).state, "sent");
});

test("sentStateFor: a note for a DIFFERENT card's prefix does not mark this one sent", () => {
  const inboxDocs = [{ id: "n1", text: benOnlyPrefix("unrelated ask") + "done.", status: "new" }];
  assert.strictEqual(sentStateFor(benOnlyPrefix("this ask"), inboxDocs).state, "buttons");
});

/* ---- proof (i): a pm/state snapshot after a sent mark — the mark survives, because pm/state can
 * never touch the needs-you cards (renderBoardPanels) or the DOM directly (markSent), and the
 * decision the cards DO make is store-derived (pinned above). ------------------------------------ */

test("connect(): the pm/state onSnapshot handler calls renderBoardPanels, never the full render() or renderNeedsYou", () => {
  const m = /db\.doc\("pm\/state"\)\.onSnapshot\(function \(snap\) \{[\s\S]*?\n {4}\}, function \(err\)/.exec(script);
  assert.ok(m, "could not find the pm/state onSnapshot registration");
  const body = m[0];
  assert.ok(/renderBoardPanels\(/.test(body), "pm/state must trigger renderBoardPanels");
  assert.ok(!/renderNeedsYou\(/.test(body), "pm/state must never touch the needs-you cards directly");
  assert.ok(!/renderDash\(|renderSnapshot\(/.test(body), "pm/state must never touch the dashboard panels directly");
  assert.ok(!/\brender\(\)/.test(body), "pm/state must never call the full render()");
});

test("render(): the full rebuild is called exactly once in the whole file — the bootstrap call, nowhere else", () => {
  const calls = script.match(/\brender\(\);/g) || [];
  assert.strictEqual(calls.length, 1, "render() must only ever run once, at page load — every snapshot handler needs its own targeted render");
});

test("renderBoardPanels(): its body never rebuilds the needs-you cards or the dashboard panels", () => {
  const body = extractFunctionSource(script, "renderBoardPanels");
  assert.ok(!/renderNeedsYou\(|renderDash\(|renderSnapshot\(/.test(body), "renderBoardPanels leaked into a needs-you/dashboard render: " + body);
});

test("markSent(): writes nothing into the DOM itself — it only re-renders off the store", () => {
  const body = extractFunctionSource(script, "markSent");
  assert.ok(!/\.innerHTML/.test(body), "markSent must not write a pill into the DOM directly (that's what vanished before)");
  assert.ok(/renderNeedsYou\(/.test(body), "markSent must trigger a store-derived re-render");
});

test("rulingCardHtml() and benOnlyCardHtml() both make the sent/recorded decision via the store, not ad hoc DOM state", () => {
  assert.ok(/sentActsHtml\(sentStateFor\(/.test(extractFunctionSource(script, "rulingCardHtml")));
  assert.ok(/sentActsHtml\(sentStateFor\(/.test(extractFunctionSource(script, "benOnlyCardHtml")));
});

/* ---- proof (iii): a tick — no panel's innerHTML is reassigned. ---------------------------------- */

test("tick(): calls only renderHeader + updateElapsed — no render* function that writes innerHTML", () => {
  const body = extractFunctionSource(script, "tick");
  assert.ok(!/\.innerHTML/.test(body), "tick()'s own body must not touch innerHTML: " + body);
  assert.ok(/renderHeader\(/.test(body) && /updateElapsed\(/.test(body), "tick must still refresh the clock and elapsed times");
  ["renderNeedsYou", "renderNow", "renderBudget", "renderQueue", "renderAsks", "renderLog", "renderFoot", "renderSnapshot", "renderDash", "render("].forEach((fn) => {
    assert.ok(!body.includes(fn + "("), "tick() must not call " + fn + "() — that rebuilds a panel's innerHTML");
  });
});

test("renderHeader(): textContent/className only — safe for tick() to call every 30s", () => {
  const body = extractFunctionSource(script, "renderHeader");
  assert.ok(!/\.innerHTML/.test(body), "renderHeader must not assign innerHTML: " + body);
});

test("updateElapsed(): textContent only — never innerHTML", () => {
  const body = extractFunctionSource(script, "updateElapsed");
  assert.ok(/\.textContent\s*=/.test(body), "updateElapsed should update textContent somewhere");
  assert.ok(!/\.innerHTML/.test(body), "updateElapsed must not assign innerHTML: " + body);
});

/* ---- item 94's other done-when bars: both snapshot slots stay {} in the committed file, and the
 * page still tolerates no store at all (the pre-existing !db branch). ---------------------------- */

test("both snapshot slots stay {} in the committed file — never a filled page", () => {
  const html = readPage();
  assert.ok(/<script id="pm-state" type="application\/json">\{\}<\/script>/.test(html), "pm-state slot must stay {}");
  assert.ok(/<script id="pm-dashboard" type="application\/json">\{\}<\/script>/.test(html), "pm-dashboard slot must stay {}");
});

test("connect(): the no-store branch is untouched — the page still renders offline", () => {
  assert.ok(/if \(!db\) \{ setInbox\(false,/.test(script), "the !db branch (no live store) must still be the first thing connect() checks");
});
