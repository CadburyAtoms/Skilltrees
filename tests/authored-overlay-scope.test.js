/* tests/authored-overlay-scope.test.js — TODO_REPO_HYGIENE #18.
 *
 * THE BUG. `loadAuthoredIndex` built a single GLOBAL `byName` map across all 21
 * `data/authored/*.json` overlays, last file wins, and `foundry-build.js` consulted it whenever
 * the docId lookup missed:
 *
 *     const ovr = AUTHORED.byId[t.docId] || AUTHORED.byName[t.name];
 *
 * Twelve talent names live in 2-7 different overlay files (Hardy x7, Mighty x6, Collected x5,
 * Composed, Baleful, Surefooted, Shatter Focus, ...), so that fallback could hand a talent
 * ANOTHER TREE'S authored text, events and effects. And it was not dormant: a docId is
 * `fid("talent:<tree>:<name>")`, so it changes on every rename, and deity/Knowledge's
 * "The Final Study" resolves by name on today's data because its stored docId no longer matches
 * its current name. It landed on the right overlay only because no other tree happens to define
 * that name.
 *
 * THE FIX. The flat `byName` is gone. The index carries `byTree` — one name map per
 * "<atlas>/<group>" scope — and `authoredOverlayFor()` is the only lookup: docId first, then the
 * name, and ONLY within the talent's own tree. Cross-scope duplicates are listed once in the
 * build log (`formatAuthoredCollisions`); a name defined twice WITHIN one scope is a genuine
 * last-one-wins coin flip and gets its own loud warning.
 *
 * Fixtures (tests/fixtures/authored-collision/authored/):
 *   heroic-warrior.json      "Hardy"       -> marker heroic-warrior
 *   leyline-black.json       "Hardy"       -> marker leyline-black      (sorts LAST of the three)
 *                            "Twice Told"  -> marker leyline-black
 *   leyline-black-extra.json "Twice Told"  -> marker leyline-black-extra (same scope as above)
 *
 * The sort order matters: `leyline-black.json` is read last, so under the old global map every
 * unmatched "Hardy" in the repo resolved to the BLACK LEYLINE overlay — including a Warrior one.
 * That is exactly what case (a) below fails on if the flat fallback is ever restored.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const {
  loadAuthoredIndex, authoredOverlayFor, authoredScopeKey, formatAuthoredCollisions,
} = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));

const FIXTURE = path.join(__dirname, "fixtures", "authored-collision");
const load = () => loadAuthoredIndex(FIXTURE, { warn: () => {} });

// (a) the talent's OWN tree wins the name fallback — even though another overlay, read later,
//     defines the same name. This is the case the old global last-file-wins map got wrong.
test("authored overlay: a name fallback resolves inside the talent's own tree", () => {
  const idx = load();
  const ovr = authoredOverlayFor(idx, {
    docId: "stale-after-a-rename", name: "Hardy", atlas: "heroic", group: "Warrior",
  });
  assert.ok(ovr, "the Warrior tree's own Hardy overlay must still be found by name");
  assert.strictEqual(ovr.marker, "heroic-warrior",
    "the name fallback must return the talent's OWN tree's overlay, not the last file read");
});

// (b) a tree that does not define the name gets NOTHING — the fallback can never cross trees.
test("authored overlay: the name fallback never crosses into another tree", () => {
  const idx = load();
  assert.strictEqual(
    authoredOverlayFor(idx, { docId: "stale-after-a-rename", name: "Hardy", atlas: "deity", group: "Death" }),
    undefined,
    "deity/Death defines no Hardy overlay — it must get none, not another tree's"
  );
  // and the reverse direction of (a), so neither side is winning by accident
  assert.strictEqual(
    authoredOverlayFor(idx, { docId: "stale", name: "Hardy", atlas: "leyline", group: "Black" }).marker,
    "leyline-black");
  // a flat byName map is what caused this; it must not come back
  assert.strictEqual(idx.byName, undefined, "loadAuthoredIndex must not expose a global byName map");
});

// docId still outranks the name, and is not itself scoped: a docId is a hash of
// `talent:<tree>:<name>`, so it already carries the tree.
test("authored overlay: a matching docId still wins over the scoped name", () => {
  const idx = load();
  const ovr = authoredOverlayFor(idx, { docId: "fixHW01", name: "Hardy", atlas: "leyline", group: "Black" });
  assert.strictEqual(ovr.marker, "heroic-warrior", "an exact docId hit must win over the name lookup");
});

// (c) the collision is reported — both as data and as the one line the build prints.
test("authored overlay: cross-tree name collisions are reported", () => {
  const idx = load();
  assert.deepStrictEqual(idx.collisions, [{ name: "Hardy", scopes: ["heroic/warrior", "leyline/black"] }]);
  assert.strictEqual(
    formatAuthoredCollisions(idx.collisions),
    "  [authored] 1 talent name(s) appear in more than one overlay — the name fallback is scoped " +
    "to each talent's own atlas+group, so these cannot cross trees: Hardy ×2");
  assert.strictEqual(formatAuthoredCollisions([]), null, "no collisions must print no line");
});

// A name defined twice inside ONE scope is genuinely ambiguous — warn loudly, naming both files.
test("authored overlay: a name defined twice within one scope warns, naming both files", () => {
  const warnings = [];
  const idx = loadAuthoredIndex(FIXTURE, { warn: (m) => warnings.push(m) });
  assert.deepStrictEqual(idx.ambiguous, [{
    name: "Twice Told", scope: "leyline/black",
    files: ["leyline-black-extra.json", "leyline-black.json"],
  }]);
  assert.ok(warnings.some((w) => /AMBIGUOUS: "Twice Told".*leyline\/black.*last file wins/.test(w)),
    `expected an AMBIGUOUS warning naming both files, got: ${JSON.stringify(warnings)}`);
});

// The scope key is what makes "Black" (data/leyline.json) and "Black" (_meta.group) meet.
test("authored overlay: the scope key is case- and whitespace-insensitive", () => {
  assert.strictEqual(authoredScopeKey("Leyline", " Black "), authoredScopeKey("leyline", "black"));
});

// The real data must stay collision-free WITHIN any one tree, and the 12 known cross-tree
// duplicates must stay merely cross-tree (i.e. harmless). This is the live-data half of the pin.
test("authored overlay: no talent name is defined twice within one tree in data/authored", () => {
  const idx = loadAuthoredIndex(path.join(__dirname, "..", "data"), { warn: () => {} });
  assert.deepStrictEqual(idx.ambiguous, [], "an ambiguous name inside one tree is a silent coin flip");
  assert.ok(idx.collisions.length >= 1, "the known cross-tree duplicates should still be reported");
});
