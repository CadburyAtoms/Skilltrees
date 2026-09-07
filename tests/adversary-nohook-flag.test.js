/* Pinned mutation cases for lint-refs PASS 5's `noHook` exemption (item 93 / R-89 (a), 2026-09-07).
 *
 * WHY THIS EXISTS. R-89: Foundry's editor drops an HTML comment on save (ProseMirror
 * parseString/serializeString — measured on Wrongwake's Drag Under, bench run 42), so the
 * `<!-- NO NAMEABLE HOOK: <reason> -->` marker that used to live in an ability's `text`/`rider`
 * could silently vanish the first time Ben edited that description in Foundry, and pass 5 would
 * start failing an ability that never changed. The fix moves the declaration into a `noHook`
 * key (data, rendered nowhere, immune to the editor round-trip) — this file pins pass 5's new
 * behavior around that move, the way macro-gate.test.js / handler-schemas.test.js pin their own
 * passes: run the REAL `scripts/lint-refs.js` as a subprocess and assert on its output.
 *
 * `data/adversaries.json` is ONE hardcoded file (unlike the authored talent overlays, which are
 * every `.json` under a directory), so there is no separate-fixture-file trick available here —
 * pass 5 reads this exact path with no env override. So these mutations write the REAL file
 * in place and restore its EXACT original bytes in a `finally` block (byte-compared after
 * restore, same safety property the fixture-based tests rely on: a hard kill mid-test leaves the
 * file mutated, which the ordinary gates then fail LOUDLY on — the safe direction, never silent).
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const ADV = path.join(REPO, "data", "adversaries.json");

function runLintRefs() {
  const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

// Mutates data/adversaries.json for the duration of `fn`, then restores the ORIGINAL bytes
// exactly — even if `fn` throws — and verifies the restore landed.
function withAdvMutation(mutate, fn) {
  const original = fs.readFileSync(ADV, "utf8");
  const mutated = mutate(original);
  assert.notStrictEqual(mutated, original, "mutation helper made no change — its target string was not found in data/adversaries.json (has the ability's text moved?)");
  fs.writeFileSync(ADV, mutated);
  try {
    return fn();
  } finally {
    fs.writeFileSync(ADV, original);
    assert.strictEqual(fs.readFileSync(ADV, "utf8"), original, "data/adversaries.json was not restored byte-for-byte after the mutation test");
  }
}

/* --- (iii) baseline: the shipped data passes pass 5 clean, and has exactly 16 noHook abilities -- */
test("pass 5 baseline: the shipped data/adversaries.json passes lint-refs clean", () => {
  const { status, out } = runLintRefs();
  assert.strictEqual(status, 0, `expected lint-refs to pass on shipped data, got exit ${status}:\n${out}`);
});

test("data/adversaries.json: 0 HTML comments left, 17 noHook keys (16 abilities + the schema doc)", () => {
  const src = fs.readFileSync(ADV, "utf8");
  assert.strictEqual((src.match(/<!--/g) || []).length, 0, "an HTML comment survived the item 93 migration");
  assert.strictEqual((src.match(/"noHook"/g) || []).length, 17, "expected 16 ability noHook keys + 1 schema doc key");
});

/* --- (i) a prose marker regresses (e.g. re-typed by hand, or a bad merge) → the NEW message ----- */
test("pass 5 FAILS a NO NAMEABLE HOOK string reintroduced into text/rider, naming the noHook fix", () => {
  withAdvMutation(
    (src) => {
      const needle = `"text": "<p>Once per round, when one of the Captain's attacks <strong>misses</strong>, it can turn that miss into a <strong>graze</strong> without spending Focus.</p>",`;
      const replacement = `"text": "<p>Once per round, when one of the Captain's attacks <strong>misses</strong>, it can turn that miss into a <strong>graze</strong> without spending Focus.</p><!-- NO NAMEABLE HOOK: reintroduced by tests/adversary-nohook-flag.test.js -->",`;
      assert.ok(src.includes(needle), "Combat Training's text field moved — update this fixture's needle");
      assert.strictEqual((src.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, "Combat Training's text needle is no longer unique");
      return src.replace(needle, replacement);
    },
    () => {
      const { status, out } = runLintRefs();
      assert.notStrictEqual(status, 0, "expected lint-refs to fail with a NO NAMEABLE HOOK string back in prose");
      const line = out.split("\n").find((l) => l.includes("Combat Training") && l.includes("NO NAMEABLE HOOK"));
      assert.ok(line, `expected a Combat Training / NO NAMEABLE HOOK error line, got:\n${out}`);
      assert.ok(line.includes("noHook"), `expected the new message to name the noHook flag as the fix:\n${line}`);
      assert.ok(line.includes("data, not prose"), `expected the new message's framing (data, not prose):\n${line}`);
    }
  );
});

/* --- (ii) noHook removed from a trigger-naming ability → the ORIGINAL "wire it or justify it" --- */
test('pass 5 FAILS a trigger-naming ability with noHook removed, with the ORIGINAL "wire it or justify it" message', () => {
  withAdvMutation(
    (src) => {
      const needle = `"rider": "On a hit it grips and drags the target 10 ft toward deep water (DC 14 Athletics to break the grip). While gripping, it may roll: the gripped target takes 1d8 impact.",
        "noHook": "NO NAMEABLE HOOK: to-hit-only grab — a hit that deals no damage makes no document write, so there is no engine hook; the GM rolls the attack and adjudicates the grip."`;
      const replacement = `"rider": "On a hit it grips and drags the target 10 ft toward deep water (DC 14 Athletics to break the grip). While gripping, it may roll: the gripped target takes 1d8 impact."`;
      assert.ok(src.includes(needle), "Seize and Roll's rider+noHook fields moved — update this fixture's needle");
      return src.replace(needle, replacement);
    },
    () => {
      const { status, out } = runLintRefs();
      assert.notStrictEqual(status, 0, "expected lint-refs to fail with noHook removed from a trigger-naming ability");
      const line = out.split("\n").find((l) => l.includes("Seize and Roll") && l.includes("wire it or justify it"));
      assert.ok(line, `expected a Seize and Roll "wire it or justify it" error line, got:\n${out}`);
      assert.ok(line.includes("Ben 07-16"), `expected the ORIGINAL message's attribution to survive unchanged:\n${line}`);
    }
  );
});

/* --- the ENGINE-NATIVE VIA branch is untouched by this change ----------------------------------- */
test("pass 5 still accepts ENGINE-NATIVE VIA when the named carrier resolves (unchanged by item 93)", () => {
  const src = fs.readFileSync(ADV, "utf8");
  assert.ok(/ENGINE-NATIVE VIA/.test(src), "no shipped ability exercises the ENGINE-NATIVE VIA branch any more — find a replacement fixture before trusting this test");
  const { status, out } = runLintRefs();
  assert.strictEqual(status, 0, `expected the shipped ENGINE-NATIVE VIA ability(ies) to still pass, got exit ${status}:\n${out}`);
});
