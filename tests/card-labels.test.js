/* REGRESSION — raw i18n KEYS reaching chat cards (bench run 1 → run 7; fixed 2026-07-27f).
 *
 * `CONFIG.COSMERE.skills[id].label` and `.statuses[id].label` hold raw i18n KEYS
 * ("COSMERE.Actor.Skill.Agility", "COSMERE.Status.Disoriented"), NOT display text. EDHA's own
 * statuses (EDHA_STATUSES) carry plain ENGLISH, so every card that named an Edha status read fine
 * and every card that named a NATIVE skill or status printed the key. That asymmetry is why this
 * survived seven bench runs looking like a per-talent typo: run 1 logged
 * `COSMERE.Status.Disoriented` in an `edha-apply-status` card, run 7 logged
 * `COSMERE.Actor.Skill.Agility` in the Magnum Opus splash save — nine live sites, one gap.
 *
 * Two workarounds had grown around the gap rather than closing it, and both are pinned here as
 * "must no longer be necessary": a hardcoded `label: "Agility"` in Bastion's save call (the one
 * card run 7 saw print correctly) and authored `saveLabel`/`skillLabel` English on two Destruction
 * rules. The fix localizes inside `edhaFoeSkillVsColor`, so an unauthored label is now correct.
 *
 * `edhaLocalizeLabel`'s key-shaped guard is the belt: even a future site that hands a raw key to
 * the helper gets the readable fallback instead of the run-1 symptom. lint-refs pass 10 is the
 * braces — it fails the build on a raw `*.label` read anywhere in the engine.
 */
"use strict";
const assert = require("assert");
const { loadEngine, RollStub, captureChat } = require("./harness.js");

/* The real cosmere-rpg 2.1.0 shape: config labels are KEYS, and the i18n table resolves them.
 * (Values taken from source-materials/edha-items-dump.json + the bench's observed card text.) */
function withCosmereI18n(env) {
  env.CONFIG.COSMERE.skills = {
    agi: { label: "COSMERE.Actor.Skill.Agility" },
    spd: { label: "COSMERE.Actor.Skill.Speed" },
    dis: { label: "COSMERE.Actor.Skill.Discipline" },
    prc: { label: "COSMERE.Actor.Skill.Perception" },
    red: { label: "Red" },                                  // a leyline skill the module registers itself
  };
  env.CONFIG.COSMERE.attributes = { wil: { label: "COSMERE.Actor.Attribute.Willpower" } };
  env.CONFIG.COSMERE.statuses = {
    disoriented: { label: "COSMERE.Status.Disoriented", condition: true },
    prone: { label: "COSMERE.Status.Prone", condition: true },
    slowed: { label: "COSMERE.Status.Slowed", condition: true },
    weakened: { label: "Weakened", condition: true },        // an EDHA status, copied in at init
  };
  const TABLE = {
    "COSMERE.Actor.Skill.Agility": "Agility",
    "COSMERE.Actor.Skill.Speed": "Speed",
    "COSMERE.Actor.Skill.Discipline": "Discipline",
    "COSMERE.Actor.Skill.Perception": "Perception",
    "COSMERE.Actor.Attribute.Willpower": "Willpower",
    "COSMERE.Status.Disoriented": "Disoriented",
    "COSMERE.Status.Prone": "Prone",
    "COSMERE.Status.Slowed": "Slowed",
  };
  env.game.i18n = { localize: (k) => TABLE[k] ?? k, format: (k) => k };
  return env;
}

test("edhaSkillLabel: a NATIVE skill id localizes — the run-7 Magnum Opus splash label", () => {
  const env = withCosmereI18n(loadEngine());
  assert.strictEqual(env.edhaSkillLabel("agi"), "Agility");
  assert.strictEqual(env.edhaSkillLabel("spd"), "Speed");
  assert.strictEqual(env.edhaSkillLabel("dis"), "Discipline");
  // The pre-fix expression, for contrast: the raw config read IS the key that reached the card.
  assert.strictEqual(env.CONFIG.COSMERE.skills.agi.label, "COSMERE.Actor.Skill.Agility");
});

test("edhaConditionLabel: a NATIVE status localizes — bench run 1's apply-status card", () => {
  const env = withCosmereI18n(loadEngine());
  assert.strictEqual(env.edhaConditionLabel("disoriented"), "Disoriented");
  assert.strictEqual(env.edhaConditionLabel("prone"), "Prone");
  assert.strictEqual(env.edhaConditionLabel("slowed"), "Slowed");
});

test("edhaConditionLabel: EDHA's own statuses still read as before (why this hid for seven runs)", () => {
  const env = withCosmereI18n(loadEngine());
  // Plain-English labels pass straight through — these cards were always correct.
  assert.strictEqual(env.edhaConditionLabel("weakened"), "Weakened");
  assert.strictEqual(env.edhaConditionLabel("harvested"), "Harvested Remain");
  assert.strictEqual(env.edhaConditionLabel("crowned"), "Crowned (Crown of Thorns armed)");
});

test("edhaLocalizeLabel: a localize MISS never ships the key — the guard that makes it un-repeatable", () => {
  const env = loadEngine();
  env.game.i18n = { localize: (k) => k };                   // no translations loaded at all
  assert.strictEqual(env.edhaLocalizeLabel("COSMERE.Status.Disoriented", "disoriented"), "disoriented");
  assert.strictEqual(env.edhaLocalizeLabel("COSMERE.Actor.Skill.Agility", "AGI"), "AGI");
  // Real display text is never mistaken for a key, including multi-word and parenthesised labels.
  assert.strictEqual(env.edhaLocalizeLabel("Agility", "AGI"), "Agility");
  assert.strictEqual(env.edhaLocalizeLabel("Harvested Remain", "harvested"), "Harvested Remain");
  assert.strictEqual(env.edhaLocalizeLabel("Crowned (Crown of Thorns armed)", "crowned"), "Crowned (Crown of Thorns armed)");
  // Blank raw falls back rather than printing an empty label.
  assert.strictEqual(env.edhaLocalizeLabel("", "AGI"), "AGI");
  assert.strictEqual(env.edhaLocalizeLabel(null, "prone"), "prone");
});

test("edhaSkillLabel: an UNKNOWN id reads as a skill code, not lowercase noise or a key", () => {
  const env = withCosmereI18n(loadEngine());
  assert.strictEqual(env.edhaSkillLabel("zzz"), "ZZZ");     // the old inline default, preserved
  assert.strictEqual(env.edhaSkillLabel(""), "");
  assert.strictEqual(env.edhaSkillLabel(null), "");
  assert.strictEqual(env.edhaSkillLabel("  agi  "), "Agility");
  // An ATTRIBUTE id resolves too (the attribute table is the second lookup).
  assert.strictEqual(env.edhaSkillLabel("wil"), "Willpower");
  // A leyline skill the module registered itself is already English.
  assert.strictEqual(env.edhaSkillLabel("red"), "Red");
});

test("edhaConditionLabel: an unknown status falls back to the bare id, never to a key", () => {
  const env = withCosmereI18n(loadEngine());
  assert.strictEqual(env.edhaConditionLabel("notastatus"), "notastatus");
  assert.strictEqual(env.edhaConditionLabel(""), "");
  // CONFIG.statusEffects is the third lookup (a status registered only there).
  env.CONFIG.statusEffects = [{ id: "dead", name: "Dead" }];
  assert.strictEqual(env.edhaConditionLabel("dead"), "Dead");
});

/* The END-TO-END pin: the CARD TEXT, which is the thing the bench actually reads. The harness's
 * default (arithmetic-only) RollStub refuses "1d20 + @skills.red.mod", and edhaFoeSkillVsColor
 * swallows the throw — so this case supplies a deterministic dice-capable Roll via
 * RollStub({total}): d20 fixed at 11, plus any resolved @refs.
 *
 * ⚠ STRICTNESS FIX: this test used to hand-roll its own Roll class whose `replaceFormulaData` was
 * a no-op (`return f`) — it got away with that because its `evaluateSync` did its OWN @-ref
 * substitution inline, bypassing `replaceFormulaData` entirely. Swapping in the harness's
 * RollStub restores the REAL `replaceFormulaData` for that static path; the `total` function below
 * still does the deterministic d20-fixed-at-11 arithmetic the assertions were written against, so
 * no assertion needed to change — confirmed by the case staying green with the real substitution
 * live underneath it. */
test("the save-card helper localizes its own skill id — no caller needs to pass a label", () => {
  const env = withCosmereI18n(loadEngine());
  const posted = captureChat(env);
  env.Roll = RollStub({
    total: (roll) => {
      const subst = roll.formula.replace(/@([a-zA-Z0-9_.]+)/g, (m, p) =>
        String(p.split(".").reduce((v, k) => (v == null ? undefined : v[k]), roll.data) ?? 0));
      return subst.replace(/\b1?d20\b/g, "11").split("+").reduce((a, b) => a + (Number(b.trim()) || 0), 0);
    },
  });
  const foe = { id: "t1", name: "Bench Dummy", actor: { name: "Bench Dummy", getRollData: () => ({ skills: { agi: { rank: 2 } }, attr: { spd: 1 } }) } };
  const owner = { name: "Tem", getRollData: () => ({ skills: { red: { mod: 3 } } }) };
  return env.edhaFoeSkillVsColor(owner, [foe], { skill: "agi", color: "red", sourceName: "Magnum Opus" }).then(() => {
    assert.strictEqual(posted.length, 1, "the save card posts");
    const html = posted[0].content;
    assert.ok(html.includes("Agility"), `card should name the skill in display text: ${html}`);
    assert.ok(!html.includes("COSMERE."), `card must not carry a raw i18n key: ${html}`);
    assert.ok(!/\bagi\b/.test(html), `card must not carry the bare skill id either: ${html}`);
    // Bastion's hardcoded `label: "Agility"` is now redundant — the default produces the same text.
    assert.ok(html.includes("vs your Red"), `card should name the colour: ${html}`);
  });
});
