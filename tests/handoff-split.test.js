/* tests/handoff-split.test.js — pins scripts/handoff-split.js's templates against
 * scripts/lint-changelog.js's gate (TODO_REPO_HYGIENE item 102).
 *
 * WHY THIS EXISTS. Item 100 (PR #311) hand-edited every docs/handoff-changelog/2026-MM.md and
 * README.md to put exactly one blank line between the marker and the first delta heading, and
 * added a rule-sentence pair to each file's prose about it — but handoff-split.js's own
 * monthHeader()/readmeText() templates never learned either change. A re-run (the next delta
 * that lands in EDHA_FOUNDRY_HANDOFF.md by mistake, or a new month starting) would have silently
 * reverted item 100's fix. This suite runs the real split logic (`run()`, exported by
 * handoff-split.js) against a two-month FIXTURE handoff into a throwaway temp directory — never
 * this repo's real EDHA_FOUNDRY_HANDOFF.md or docs/handoff-changelog/ — and checks the output
 * both against lint-changelog.js's own exported `lint()` (so the fixture is proof the generator
 * and the gate agree) and against MONTH_RULE_SENTENCES / README_RULE_SENTENCES below, which are
 * hardcoded HERE rather than imported from scripts/lib/changelog-rules.js on purpose — importing
 * them would make the check circular (a mutation that drops a line from that module would drop
 * it from the expectation too, and the test would still pass).
 *
 * MUTATION PROOF (not committed — see the item-102 PR body for the pasted output): temporarily
 * reverting monthHeader()'s trailing blank line (`'\n\n'` -> `'\n'`) fails the "exactly one blank
 * line" test below; temporarily removing the "Adding a delta also means +1..." line from
 * MONTH_INSERT_RULE_LINES in scripts/lib/changelog-rules.js fails the "rule sentences verbatim"
 * test below. Both were exercised by hand and reverted before this file was committed.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { run, MARKER } = require(path.join(REPO, "scripts", "handoff-split.js"));
const { lint, checkMonthFile } = require(path.join(REPO, "scripts", "lint-changelog.js"));

// Hardcoded independently of scripts/lib/changelog-rules.js on purpose — importing the rule
// lines from the module under test would make the "rule sentences verbatim" checks below
// circular (a mutation that drops a line from that module would drop it from this expectation
// too, and the test would still pass). These are the two sentences item 100 (PR #311) added;
// keep them byte-identical to docs/handoff-changelog/2026-09.md and README.md.
const MONTH_RULE_SENTENCES = [
  "Insert it as heading, body, blank line",
  "Adding a delta also means +1 to this file's header count (and its date range)",
];
const README_RULE_SENTENCES = [
  "Insert it as heading, body, blank line — directly under the marker's",
  "also bumps the count and date range in the month file's header line AND in the table below",
];

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "edha-handoff-split-test-"));

// Two months of deltas (2026-09 x2, 2026-08 x1) above a `## Reference` line, in the same shape
// as the real EDHA_FOUNDRY_HANDOFF.md. Content is fixture-only — never written to any tracked
// file.
const FIXTURE_HANDOFF = [
  "# Fixture handoff",
  "",
  "Intro text kept above the first delta heading.",
  "",
  "## 2026-09-05z — Fixture delta three (TOOLING-only)",
  "",
  "Fixture delta body three.",
  "",
  "## 2026-09-01z — Fixture delta two (TOOLING-only)",
  "",
  "Fixture delta body two.",
  "",
  "## 2026-08-20z — Fixture delta one (TOOLING-only)",
  "",
  "Fixture delta body one.",
  "",
  "## Reference — table of contents",
  "",
  "Fixture reference body, kept in place.",
  "",
].join("\n");

function freshFixture(name) {
  const dir = fs.mkdtempSync(path.join(workDir, `${name}-`));
  const handoffPath = path.join(dir, "HANDOFF.md");
  const outDir = path.join(dir, "handoff-changelog");
  fs.writeFileSync(handoffPath, FIXTURE_HANDOFF);
  return { handoffPath, outDir };
}

/* ---- run() -> lint(): the fixture must pass the real gate --------------------------------- */

test("run(): splits a two-month fixture into month files + README that pass lint-changelog's gate", () => {
  const { handoffPath, outDir } = freshFixture("split");
  const result = run({ handoffPath, outDir });
  assert.strictEqual(result.movedCount, 3, "all three fixture deltas should have been moved");
  assert.deepStrictEqual([...result.months].sort(), ["2026-08", "2026-09"]);

  const { errors, fileCount } = lint(outDir);
  assert.deepStrictEqual(errors, [], "a freshly split fixture must pass the gate with zero errors");
  assert.strictEqual(fileCount, 2);
});

test("run(): re-running the split on its own (now-empty-of-deltas) output is idempotent", () => {
  const { handoffPath, outDir } = freshFixture("idempotent");
  run({ handoffPath, outDir });
  const before = {};
  for (const name of ["2026-09.md", "2026-08.md", "README.md"]) {
    before[name] = fs.readFileSync(path.join(outDir, name), "utf8");
  }
  // The handoff after the first run has no delta headings left above its Reference line — the
  // same shape a real "next run finds nothing new" no-op sees.
  run({ handoffPath, outDir });
  for (const [name, text] of Object.entries(before)) {
    assert.strictEqual(fs.readFileSync(path.join(outDir, name), "utf8"), text, `${name} must be unchanged on a no-op re-run`);
  }
  const { errors } = lint(outDir);
  assert.deepStrictEqual(errors, []);
});

/* ---- the specific item-100 shape: blank line + both rule-sentence pairs -------------------- */

test("run(): the month file has exactly one blank line between the marker and the first heading", () => {
  const { handoffPath, outDir } = freshFixture("blankline");
  run({ handoffPath, outDir });
  const text = fs.readFileSync(path.join(outDir, "2026-09.md"), "utf8");
  const markerAt = text.indexOf(MARKER);
  assert.ok(markerAt !== -1, "marker must be present");
  const after = text.slice(markerAt + MARKER.length);
  assert.strictEqual(after.slice(0, 3), "\n\n#", "exactly one blank line, then the first '#' of the next heading");
});

test("run(): month file bullet list carries the item-100 rule sentences verbatim", () => {
  const { handoffPath, outDir } = freshFixture("rules-month");
  run({ handoffPath, outDir });
  const text = fs.readFileSync(path.join(outDir, "2026-09.md"), "utf8");
  for (const sentence of MONTH_RULE_SENTENCES) {
    assert.ok(text.includes(sentence), `month file is missing rule sentence: ${JSON.stringify(sentence)}`);
  }
});

test("run(): README rule paragraph carries the item-100 rule sentences verbatim", () => {
  const { handoffPath, outDir } = freshFixture("rules-readme");
  run({ handoffPath, outDir });
  const text = fs.readFileSync(path.join(outDir, "README.md"), "utf8");
  for (const sentence of README_RULE_SENTENCES) {
    assert.ok(text.includes(sentence), `README is missing rule sentence: ${JSON.stringify(sentence)}`);
  }
});

/* ---- counts/date ranges are computed from the real headings, not carried over stale -------- */

test("run(): month header count/date-range and the README row are computed from the real headings", () => {
  const { handoffPath, outDir } = freshFixture("counts");
  run({ handoffPath, outDir });
  const sep = fs.readFileSync(path.join(outDir, "2026-09.md"), "utf8");
  assert.ok(/\(2 deltas, 2026-09-01 → 2026-09-05\)/.test(sep), "2026-09 header should report its 2 real deltas and date range");
  const aug = fs.readFileSync(path.join(outDir, "2026-08.md"), "utf8");
  assert.ok(/\(1 deltas, 2026-08-20 → 2026-08-20\)/.test(aug), "2026-08 header should report its 1 real delta");
  const readme = fs.readFileSync(path.join(outDir, "README.md"), "utf8");
  assert.ok(readme.includes("| [`2026-09.md`](2026-09.md) | 2 | 2026-09-01 → 2026-09-05 |"));
  assert.ok(readme.includes("| [`2026-08.md`](2026-08.md) | 1 | 2026-08-20 → 2026-08-20 |"));
});

/* ---- lint-changelog.js's refactored callable API (item 102 point 3) ----------------------- */

test("checkMonthFile(): callable directly against a directory + filename, returns {count, errors}", () => {
  const dir = fs.mkdtempSync(path.join(workDir, "checkfile-good-"));
  fs.writeFileSync(
    path.join(dir, "2026-09.md"),
    [
      "# header",
      "",
      "(1 deltas, 2026-09-01 → 2026-09-01)",
      "",
      MARKER,
      "",
      "## 2026-09-01 — Title",
      "",
      "Body.",
      "",
    ].join("\n")
  );
  const { count, errors } = checkMonthFile(dir, "2026-09.md");
  assert.strictEqual(count, 1);
  assert.deepStrictEqual(errors, []);
});

test("checkMonthFile(): reports the missing-blank-line structural error without throwing or exiting", () => {
  const dir = fs.mkdtempSync(path.join(workDir, "checkfile-bad-"));
  fs.writeFileSync(
    path.join(dir, "2026-09.md"),
    [
      "# header",
      "",
      "(1 deltas, 2026-09-01 → 2026-09-01)",
      "",
      MARKER,
      "## 2026-09-01 — Title", // no blank line before this heading
      "",
      "Body.",
      "",
    ].join("\n")
  );
  const { count, errors } = checkMonthFile(dir, "2026-09.md");
  assert.strictEqual(count, undefined);
  assert.strictEqual(errors.length, 1);
  assert.ok(errors[0].includes("no blank line between the marker"), errors[0]);
});

test("lint(): aggregates checkMonthFile() across every month file plus the README cross-check", () => {
  const { handoffPath, outDir } = freshFixture("lint-agg");
  run({ handoffPath, outDir });
  // Corrupt the README's count for 2026-08 to prove lint() catches a cross-file mismatch too.
  const readmePath = path.join(outDir, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  fs.writeFileSync(readmePath, readme.replace("| [`2026-08.md`](2026-08.md) | 1 |", "| [`2026-08.md`](2026-08.md) | 9 |"));
  const { errors } = lint(outDir);
  assert.strictEqual(errors.length, 1);
  assert.ok(errors[0].includes("index says 2026-08.md has 9 deltas, but 1"), errors[0]);
});
