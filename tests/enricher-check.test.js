/* Pinned cases for lint-refs PASS 24 — the enricher-tag syntax guard (item 194, R-149 (a),
 * 2026-09-16).
 *
 * WHY THIS EXISTS. `[[test skill=…]]` / `[[damage …]]` / `[[/roll …]]` enrichers turn a MANUAL
 * card's "roll it yourself" sentence into a clickable button — but nothing in Foundry's own
 * editor errors on a malformed one (a typo'd key, an unknown trigraph, a missing damage type, an
 * unclosed bracket): the literal tag text just sits there, unclicked. This pins BOTH halves of
 * the guard, the same way tests/consume-guard.test.js pins pass 23:
 *
 *   1. `checkEnricherTags` (scripts/lib/enricher-check.js) — the pure scan/decide function — over
 *      a set of good and bad tags, including the item's own three named failure modes
 *      (`[[test skil=…]]`, an unknown trigraph, an unclosed bracket) and the one FALSE-POSITIVE
 *      trap this pass has to dodge: Edha's own `[Tier][Die]` formula shorthand landing right
 *      after a stray "[" (e.g. "Afflicted [[Tier][Die] vital]", a REAL card in
 *      data/authored/leyline-black.json's "Dark Investiture") is two unrelated bracket
 *      conventions colliding, not a malformed enricher, and must not be flagged.
 *   2. The real `scripts/lint-refs.js` process, spawned against a fixture authored file (the
 *      fixture-writes-its-own-file-and-deletes-it discipline pass 23's test already uses), so the
 *      wiring from an authored description through pass 24 to a failing build is pinned end to
 *      end, not just the helper in isolation.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const { checkEnricherTags } = require(path.join(REPO, "scripts", "lib", "enricher-check.js"));

/* --- 1. the pure function, over fixtures -------------------------------------------------------- */

test("checkEnricherTags: well-formed test/damage/healing//roll tags all pass clean", () => {
  const good = [
    "[[test skill=ath]]",
    "[[test skill=ded defence=spi]]",
    "[[test skill=med dc=10]]",
    "[[test skill=lor dc=10+@tier]]",
    "[[damage 2d4 Impact]]",
    "[[damage formula=2d8 type=Vital]]",
    "[[damage 1d10+@attr.spd Keen]]",
    "[[healing 2d8]]",
    "[[damage 2d8 healing=true]]",
    "[[/roll 1d4]]",
  ];
  for (const tag of good) {
    const findings = checkEnricherTags(tag);
    assert.strictEqual(findings.length, 0, `expected "${tag}" to be clean, got: ${JSON.stringify(findings)}`);
  }
});

test("checkEnricherTags: a typo'd key (\"skil=\" for \"skill=\") is reported", () => {
  const findings = checkEnricherTags("<p>Test Deduction [[test skil=ded dc=10]] to learn something.</p>");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /needs skill=<trigraph>/);
});

test("checkEnricherTags: an unknown skill trigraph is reported", () => {
  const findings = checkEnricherTags("[[test skill=xyz]]");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /not a known skill trigraph/);
});

test("checkEnricherTags: an unknown defence trigraph is reported", () => {
  const findings = checkEnricherTags("[[test skill=ath defence=xyz]]");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /not a known defence trigraph/);
});

test("checkEnricherTags: an unclosed [[ ... ]] tag is reported and does not crash the scan", () => {
  const findings = checkEnricherTags("<p>Test Athletics [[test skill=ath vs. Cognitive.</p>");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /unclosed/);
});

test("checkEnricherTags: a damage tag missing its type is reported", () => {
  const findings = checkEnricherTags("[[damage 2d6]]");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /needs a damage type/);
});

test("checkEnricherTags: an unrecognized damage type is reported", () => {
  const findings = checkEnricherTags("[[damage 2d6 Fire]]");
  assert.strictEqual(findings.length, 1);
  assert.match(findings[0].error, /not a known damage type/);
});

test("checkEnricherTags: Edha's own [Tier][Die] formula shorthand never false-positives, even when it collides with a stray \"[\" into a literal \"[[\"", () => {
  // The real "Dark Investiture" card (data/authored/leyline-black.json): "becomes Afflicted
  // [[Tier][Die] vital]." — two unrelated bracket conventions landing next to each other, not an
  // enricher tag at all (no recognized tag name follows the "[[").
  const findings = checkEnricherTags("<p>the target takes [Tier][Die] vital damage and becomes Afflicted [[Tier][Die] vital].</p>");
  assert.strictEqual(findings.length, 0, `expected no findings, got: ${JSON.stringify(findings)}`);
});

test("checkEnricherTags: non-string / tagless input returns no findings and does not throw", () => {
  assert.deepStrictEqual(checkEnricherTags(undefined), []);
  assert.deepStrictEqual(checkEnricherTags(null), []);
  assert.deepStrictEqual(checkEnricherTags(""), []);
  assert.deepStrictEqual(checkEnricherTags("<p>Plain prose with no tags at all.</p>"), []);
});

/* --- 2. the real lint-refs.js process, against a fixture authored file ------------------------- */

const FIXTURE = path.join(REPO, "data/authored/_enricher-check-fixture.json");

function pass24ErrorsFor(talents) {
  fs.writeFileSync(
    FIXTURE,
    JSON.stringify({ _meta: { group: "Lint fixture (tests/enricher-check.test.js)" }, talents }, null, 2) + "\n"
  );
  try {
    const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
    return { code: r.status, lines: ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("pass 24")) };
  } finally {
    try { fs.unlinkSync(FIXTURE); } catch (e) {}
  }
}

test("lint-refs pass 24 PASSES a well-formed [[test]] tag (mutation baseline)", () => {
  const { code, lines } = pass24ErrorsFor({
    "Fixture Enricher Good": {
      description: { value: "<p>Test Deduction [[test skill=ded defence=spi]] to learn something.</p>" },
    },
  });
  assert.strictEqual(code, 0, `expected lint-refs to pass, got exit ${code} with pass-24 lines:\n  ${lines.join("\n  ")}`);
  assert.strictEqual(lines.length, 0, `expected no pass-24 findings, got:\n  ${lines.join("\n  ")}`);
});

test("lint-refs pass 24 FAILS a typo'd [[test skil=…]] tag and names the talent (the mutation)", () => {
  const { code, lines } = pass24ErrorsFor({
    "Fixture Enricher Good": {
      description: { value: "<p>Test Deduction [[test skill=ded defence=spi]] to learn something.</p>" },
    },
    "Fixture Enricher Bad": {
      description: { value: "<p>Test Deduction [[test skil=ded defence=spi]] to learn something.</p>" },
    },
  });
  assert.notStrictEqual(code, 0, "expected lint-refs to fail on a typo'd [[test skil=…]] tag");
  const hit = lines.find((l) => l.includes("Fixture Enricher Bad") && l.includes("needs skill=<trigraph>"));
  assert.ok(hit, `expected a pass-24 line naming "Fixture Enricher Bad", got:\n  ${lines.join("\n  ")}`);
  assert.ok(!lines.some((l) => l.includes("Fixture Enricher Good")), `the good entry must not be reported:\n  ${lines.join("\n  ")}`);
});

test("lint-refs pass 24 scans real repo data and clears the pinned floor (a guard that scans nothing is the failure mode)", () => {
  const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
  const rotted = ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("pass 24") && l.includes("the scan rotted"));
  assert.strictEqual(r.status, 0, `expected the real repo data to pass lint-refs clean, got exit ${r.status}`);
  assert.strictEqual(rotted.length, 0, `pass 24 reported an empty/rotted scan against real data:\n  ${rotted.join("\n  ")}`);
});
