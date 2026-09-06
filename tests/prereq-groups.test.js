/* tests/prereq-groups.test.js — regression cases for scripts/validate.js's prereqGroups wiring.
 *
 * validate.js used to carry its OWN local `prereqGroups`, split unconditionally on /\s+and\s+/,
 * while scripts/foundry-build-parts.js's `prereqGroups` (the one the generator actually runs) took
 * an optional `isName` resolver and tried each fragment as a whole talent name FIRST — because the
 * separators ("and"/"or") are English words that also occur INSIDE talent names (Scholar's "Mind
 * and Body"). The local copy tore that name into "Mind" + "Body", neither of which resolves, and
 * validateTreeGraph's `g.filter(local)` then silently DROPPED the mangled group — so the iron-rule-7
 * walkability gate modeled FEWER requirement edges than Foundry actually evaluates, while its own
 * header comment claimed the model "MIRRORS foundry-build.js exactly" (found 2026-08-10, live on
 * "Know Your Moment"'s "Mind and Body; Deduction 2+" prereq in data/cosmere.json).
 *
 * validate.js now imports the ONE prereqGroups from foundry-build-parts.js and wires it the same
 * `isName` resolver foundry-build.js does (tree-local name, then the atlas-wide name index) — these
 * tests pin that function directly, plus one integration pin against the real live-data regression.
 */
"use strict";
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");

const { prereqGroups } = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));

// ---------------------------------------------------------------------------
// 1. Pin: a talent name containing " and " survives when the resolver knows it.
// ---------------------------------------------------------------------------
test("prereqGroups: 'Mind and Body; Deduction 2+' with a resolver -> the name survives whole", () => {
  const isName = (x) => String(x).trim() === "Mind and Body";
  assert.deepStrictEqual(
    prereqGroups("Mind and Body; Deduction 2+", isName),
    [["Mind and Body"], ["Deduction 2+"]]
  );
});

// ---------------------------------------------------------------------------
// 2. Pin: the SAME input with no resolver reproduces the old (broken) pure-string split —
//    this is the exact bug validate.js's local copy shipped, kept as a caller-compat pin.
// ---------------------------------------------------------------------------
test("prereqGroups: 'Mind and Body; Deduction 2+' with NO resolver -> torn apart (old behavior)", () => {
  assert.deepStrictEqual(
    prereqGroups("Mind and Body; Deduction 2+"),
    [["Mind"], ["Body"], ["Deduction 2+"]]
  );
});

// ---------------------------------------------------------------------------
// 3. Pin: empty / dash markers -> no groups (a root talent).
// ---------------------------------------------------------------------------
test("prereqGroups: empty markers ('', '—', '-') all yield no groups", () => {
  assert.deepStrictEqual(prereqGroups(""), []);
  assert.deepStrictEqual(prereqGroups("—"), []);
  assert.deepStrictEqual(prereqGroups("-"), []);
});

// ---------------------------------------------------------------------------
// 4. Pin: ordinary and/or splitting, no resolver — AND across groups, OR within a group.
// ---------------------------------------------------------------------------
test("prereqGroups: 'A and B; C or D' with no resolver -> AND across, OR within", () => {
  assert.deepStrictEqual(
    prereqGroups("A and B; C or D"),
    [["A"], ["B"], ["C", "D"]]
  );
});

// ---------------------------------------------------------------------------
// 5. Pin: a talent NAME containing " or " also survives whole when the resolver knows it —
//    the header's "Any talent whose name contains ' and ' / ' or ' was unreferenceable" covers
//    both separators, but only " and " had a live-data instance; this pins the " or " half
//    symmetrically against a synthetic name of the same shape.
// ---------------------------------------------------------------------------
test("prereqGroups: an ' or '-containing NAME survives whole with a resolver, splits without one", () => {
  const isName = (x) => String(x).trim() === "Fight or Flight";
  assert.deepStrictEqual(
    prereqGroups("Fight or Flight; Green 2+", isName),
    [["Fight or Flight"], ["Green 2+"]]
  );
  // Without the resolver, the same string tears the name into an OR-group of two nonsense
  // fragments — exactly the failure mode the header warns about.
  assert.deepStrictEqual(
    prereqGroups("Fight or Flight; Green 2+"),
    [["Fight", "Flight"], ["Green 2+"]]
  );
});

// ---------------------------------------------------------------------------
// 6. INTEGRATION pin: the real live-data regression. validate.js itself can't be require()d —
//    it runs main() (which calls process.exit) at load time — so this pins prereqGroups directly
//    against the real data/cosmere.json row, with a resolver built from that atlas's own talent
//    names (the same universe validate.js's `isName` resolver falls back to via buildTalentGroups).
// ---------------------------------------------------------------------------
test("INTEGRATION: data/cosmere.json's 'Mind and Body; Deduction 2+' prereq survives with an atlas-name resolver", () => {
  const REPO = path.join(__dirname, "..");
  const raw = fs.readFileSync(path.join(REPO, "data", "cosmere.json"), "utf8").replace(/\r\n/g, "\n");
  const rows = JSON.parse(raw);

  const atlasNames = new Set(
    rows.map(r => (r.name || "").trim().toLowerCase()).filter(Boolean)
  );
  const isName = (x) => atlasNames.has(String(x).trim().toLowerCase());

  const row = rows.find(r => (r.prerequisites || "") === "Mind and Body; Deduction 2+");
  assert.ok(row, "expected data/cosmere.json to still contain the 'Mind and Body; Deduction 2+' prereq row");
  assert.strictEqual(row.name, "Know Your Moment");

  const groups = prereqGroups(row.prerequisites, isName);
  assert.deepStrictEqual(groups, [["Mind and Body"], ["Deduction 2+"]],
    "'Mind and Body' must survive as one group, not be torn into ['Mind'] + ['Body']");
});
