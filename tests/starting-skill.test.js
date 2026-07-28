/* The heroic path's free starting skill rank (bench run 21: "the dialog never appears, for ANY
 * path, silently").
 *
 * The reported cause was a data gap — "all six heroic paths ship linkedSkills: []". It is not a
 * gap. In the cosmere system `linkedSkills` is the UNLOCKED-skill association (the sheet renders
 * `path.system.linkedSkills.filter(id => actor.system.skills[id].unlocked)`; `orphanedSkills` is
 * the non-core skills no path claims), so core heroic paths correctly ship []. The starting skill
 * is a different rule entirely: ONE FIXED skill, named on each path's own card, and the system
 * carries the table (STARTING_SKILLS) plus the macro that applies it.
 *
 * These pin the FALLBACK path — the card-text parse used when an install's system has no
 * startingPath macro — against the six real descriptions in data/path-descriptions.json, which is
 * the verbatim copy of the shipped heroic-paths pack. If that file is ever re-captured from a new
 * system release and the sentence changes shape, this fails loudly instead of the wizard silently
 * skipping the grant again.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const { loadEngine } = require("./harness.js");

const env = loadEngine();
const PATHS = require(path.join(__dirname, "..", "data", "path-descriptions.json")).heroic;

// The six-skill table the system holds in STARTING_SKILLS, restated here ONLY as the expectation
// the parse must reproduce. The engine deliberately holds no such map.
const EXPECTED = {
  Agent: ["Insight", "ins"], Envoy: ["Discipline", "dis"], Hunter: ["Perception", "prc"],
  Leader: ["Leadership", "lea"], Scholar: ["Lore", "lor"], Warrior: ["Athletics", "ath"],
};

test("data/path-descriptions.json still holds all six heroic paths", () => {
  assert.deepStrictEqual(Object.keys(PATHS).sort(), Object.keys(EXPECTED).sort());
});

test("edhaParseStartingSkill reads the starting skill off every real path card", () => {
  for (const [name, [label]] of Object.entries(EXPECTED)) {
    assert.strictEqual(env.edhaParseStartingSkill(PATHS[name]), label, `${name}'s card`);
  }
});

test("both shipped markup shapes parse — bare and double-<strong>", () => {
  // Warrior/Hunter/Agent: "<strong>Starting Skill: Athletics.</strong>"
  assert.strictEqual(env.edhaParseStartingSkill("<p><strong>Starting Skill: Athletics.</strong> If you choose…</p>"), "Athletics");
  // Envoy/Scholar/Leader: "<strong>Starting Skill:</strong> <strong>Discipline.</strong>"
  assert.strictEqual(env.edhaParseStartingSkill("<p><strong>Starting Skill:</strong> <strong>Discipline.</strong> If you…</p>"), "Discipline");
});

test("a two-word skill name survives the parse", () => {
  assert.strictEqual(env.edhaParseStartingSkill("<strong>Starting Skill: Heavy Weaponry.</strong> If you…"), "Heavy Weaponry");
});

test("NEGATIVE: a card with no starting-skill sentence yields null, never a guess", () => {
  assert.strictEqual(env.edhaParseStartingSkill("<p>Some path with no such line.</p>"), null);
  assert.strictEqual(env.edhaParseStartingSkill(""), null);
  assert.strictEqual(env.edhaParseStartingSkill(null), null);
  assert.strictEqual(env.edhaParseStartingSkill(undefined), null);
});

test("edhaSkillIdFromLabel resolves every parsed label to its CONFIG id", () => {
  env.CONFIG.COSMERE.skills = Object.fromEntries(
    Object.values(EXPECTED).map(([label, id]) => [id, { label, core: true }]));
  for (const [name, [label, id]] of Object.entries(EXPECTED)) {
    assert.strictEqual(env.edhaSkillIdFromLabel(env.edhaParseStartingSkill(PATHS[name])), id, `${name} -> ${id}`);
  }
});

test("edhaSkillIdFromLabel is case-insensitive and accepts a bare id", () => {
  env.CONFIG.COSMERE.skills = { ath: { label: "Athletics", core: true } };
  assert.strictEqual(env.edhaSkillIdFromLabel("athletics"), "ath");
  assert.strictEqual(env.edhaSkillIdFromLabel("ATH"), "ath");
});

test("NEGATIVE: an unknown label resolves to null — the wizard warns rather than ranking a guess", () => {
  env.CONFIG.COSMERE.skills = { ath: { label: "Athletics", core: true } };
  assert.strictEqual(env.edhaSkillIdFromLabel("Surgebinding"), null);
  assert.strictEqual(env.edhaSkillIdFromLabel(""), null);
  assert.strictEqual(env.edhaSkillIdFromLabel(null), null);
});
