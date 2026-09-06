/* REGRESSION — the weapon picker's indefinite article ("a Agent" / "a Envoy").
 * (EDHA_FOUNDRY_TEST_CHECKLIST.md, bench run 38 🤖 defect row; TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * The creation wizard's weapon step introduces the curated list as "the arms a ${pathName} actually
 * carries", with the article written as a LITERAL. Four of the six heroic paths start with a
 * consonant and read fine; the other two do not, and bench run 38 read both off the live dialog:
 * *"the arms a Agent actually carries"* and *"the arms a Envoy actually carries"*.
 *
 * The fix is one helper, `edhaArticle`, because a literal article is a bug that reproduces itself
 * at every future interpolation site. English chooses by SOUND, so the helper is pinned on the
 * three classes that actually decide it — the plain vowel test, a written vowel SOUNDED as a
 * consonant ("a university", "a one-handed grip"), and a written consonant with a vowel SOUND
 * ("an hour", "an honest broker") — and on all six real path names, which are the live vocabulary
 * this shipped for.
 *
 * Mutation: return the literal "a" from edhaArticle and the first case fails on "an Agent".
 */
"use strict";
const assert = require("assert");
const { loadEngine, readEngineSource } = require("./harness.js");

test("the two reported paths take 'an', and the four that were fine still take 'a'", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaArticle("Agent"), "an");    // measured live at bench run 38
  assert.strictEqual(env.edhaArticle("Envoy"), "an");    // measured live at bench run 38
  assert.strictEqual(env.edhaArticle("Warrior"), "a");
  assert.strictEqual(env.edhaArticle("Hunter"), "a");
  assert.strictEqual(env.edhaArticle("Leader"), "a");
  assert.strictEqual(env.edhaArticle("Scholar"), "a");
});

test("sound, not spelling: a vowel LETTER with a consonant sound keeps 'a'", () => {
  const env = loadEngine();
  for (const w of ["university", "unicorn", "useful blade", "one-handed grip", "European"]) {
    assert.strictEqual(env.edhaArticle(w), "a", `"${w}" should take "a"`);
  }
});

test("sound, not spelling: a consonant LETTER with a vowel sound takes 'an'", () => {
  const env = loadEngine();
  for (const w of ["hour", "honest broker", "heir", "herb"]) {
    assert.strictEqual(env.edhaArticle(w), "an", `"${w}" should take "an"`);
  }
});

test("the degenerate inputs never throw and never emit a bare article by accident", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaArticle(""), "a");
  assert.strictEqual(env.edhaArticle(null), "a");
  assert.strictEqual(env.edhaArticle(undefined), "a");
  assert.strictEqual(env.edhaArticle("  Envoy  "), "an");   // the pathName is interpolated raw
});

test("the weapon-picker line is BUILT from the helper — no literal article left in it", () => {
  const src = readEngineSource();
  assert.ok(/the arms \$\{edhaArticle\(pathName\)\} \$\{escCw\(pathName\)\} actually carries/.test(src),
    "the weapon slot's intro line no longer routes through edhaArticle");
  assert.ok(!/the arms a \$\{escCw\(pathName\)\}/.test(src), "the literal 'a ${pathName}' survived");
});
