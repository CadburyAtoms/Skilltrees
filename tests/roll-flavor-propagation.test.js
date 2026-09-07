/* THE DOUBLED RIDER FLAVOR, fixed at the message instead of at the render — fix pass 10 (TODO 78).
 *
 * Bench run 41 measured Ambush Bite's damage card reading
 *   `1d10 + 3 + (1d6[Ambush Bite])[Ambush Bite] + 0`
 * on the engine that already carried fix pass 9's display repair. That repair is correct on the
 * string; it just never sees this card. Two facts from the installed sources explain it:
 *
 *   1. A Roll keeps TWO formula strings. `roll._formula` is the string it was BUILT from — stored
 *      by `toJSON()` and rebuilt by `Roll.fromData`'s `new this(data.formula, …)`
 *      (client/dice/roll.mjs:40, :1055) — and core's own chat template prints THAT one
 *      (roll.mjs:892). `roll.formula` is a GETTER that recompiles from the terms on every read
 *      (roll.mjs:173 → `Roll.getFormula`, :563), and the cosmere damage card prints THAT one
 *      (`enrichDamage`: `partsNormal.push(rollNormal.formula)`).
 *   2. `ParentheticalTerm#_evaluateAsync` calls `roll.propagateFlavor(this.flavor)`, stamping the
 *      parenthetical's flavor onto every inner term that has none (parenthetical.mjs:105 →
 *      roll.mjs:496); its constructor then re-derives `this.term = roll.formula` whenever a roll is
 *      supplied (parenthetical.mjs:19) — which is exactly what `_fromData` does on the chat
 *      round-trip. So the two strings DIVERGE the first time the message is read back.
 *
 * Hence the split the bench saw: core's render (which fires `renderChatMessageHTML`) showed the
 * single-labelled `_formula`, so the display tidy correctly left it alone; the system's `getHTML`
 * then replaced `.message-content` with an `enrichDamage` build off the doubled getter, after the
 * hook, on a node the tidy had already walked. No render registration can win that race, so the
 * repair lands in `preCreateChatMessage` instead: strip the propagated copies from the serialized
 * roll, and the rehydrated `term` re-derives as the engine wrote it.
 *
 * `rederiveFormula` below is a faithful, deliberately small model of that rehydration — the two
 * getters above and nothing else — so these cases reproduce the EXACT bench-run-41 string from
 * serialized data and then show it clean. REVERSION: delete the strip loop in
 * `edhaUndoFlavorPropagation` (or the `preCreateChatMessage` registration) and cases 2, 3, 7 and 8
 * fail with the doubled string.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook } = require("./harness.js");

const env = loadEngine();

/* --- the rehydration model (client/dice/roll.mjs + terms/*.mjs, the getters named above) -------- */
function termFormula(t) {
  const flavor = t.options?.flavor;
  let expression;
  switch (t.class) {
    case "OperatorTerm":      expression = ` ${t.operator} `; break;                                  // operator.mjs:55
    case "NumericTerm":       expression = String(t.number); break;                                   // numeric.mjs:26
    case "Die":               expression = `${t.number}d${t.faces}${(t.modifiers ?? []).join("")}`; break;   // dice.mjs:156
    case "ParentheticalTerm": expression = `(${t.roll ? rederiveFormula(t.roll) : t.term})`; break;    // parenthetical.mjs:19, :72
    default: throw new Error(`unmodelled term class ${t.class}`);
  }
  return flavor ? `${expression}[${flavor}]` : expression;                                            // term.mjs:90
}
function rederiveFormula(rollData) {
  return rollData.terms.map(termFormula).join("");                                                    // roll.mjs:563
}

/* --- the fixture: Ambush Bite's damage roll AS SERIALIZED, post-evaluation ----------------------
 * `1d10 + 3 + (1d6)[Ambush Bite] + 0` — the base, the system's `+ @mod` (0 here), and the rider
 * `edhaRiderBonus` assembled as `(f)[name]`. The inner Die already carries the propagated flavor,
 * because evaluation (and only evaluation) put it there. */
function ambushBiteRoll() {
  const op = () => ({ class: "OperatorTerm", options: {}, evaluated: true, operator: "+" });
  return {
    class: "DamageRoll", options: { damageType: "impact", mod: 0 }, dice: [], evaluated: true, total: 9,
    formula: "1d10 + 3 + (1d6)[Ambush Bite] + 0",
    terms: [
      { class: "Die", options: {}, evaluated: true, number: 1, faces: 10, modifiers: [], results: [{ result: 3, active: true }] },
      op(),
      { class: "NumericTerm", options: {}, evaluated: true, number: 3 },
      op(),
      {
        class: "ParentheticalTerm", options: { flavor: "Ambush Bite" }, evaluated: true, term: "1d6",
        roll: {
          class: "Roll", options: {}, dice: [], evaluated: true, total: 3, formula: "1d6",
          terms: [{ class: "Die", options: { flavor: "Ambush Bite" }, evaluated: true, number: 1, faces: 6, modifiers: [], results: [{ result: 3, active: true }] }],
        },
      },
      op(),
      { class: "NumericTerm", options: {}, evaluated: true, number: 0 },
    ],
  };
}

/* The COMPOUND rider — propagateFlavor stamps the operator and the constant too. Kindle's
 * `(1 + @tier)` resolves to `(1 + 2)[Kindle]` and doubles on every inner term at once. */
function kindleRoll() {
  return {
    class: "DamageRoll", options: {}, dice: [], evaluated: true, total: 7, formula: "1d4 + (1 + 2)[Kindle]",
    terms: [
      { class: "Die", options: {}, evaluated: true, number: 1, faces: 4, modifiers: [], results: [{ result: 4, active: true }] },
      { class: "OperatorTerm", options: {}, evaluated: true, operator: "+" },
      {
        class: "ParentheticalTerm", options: { flavor: "Kindle" }, evaluated: true, term: "1 + 2",
        roll: {
          class: "Roll", options: {}, dice: [], evaluated: true, total: 3, formula: "1 + 2",
          terms: [
            { class: "NumericTerm", options: { flavor: "Kindle" }, evaluated: true, number: 1 },
            { class: "OperatorTerm", options: { flavor: "Kindle" }, evaluated: true, operator: "+" },
            { class: "NumericTerm", options: { flavor: "Kindle" }, evaluated: true, number: 2 },
          ],
        },
      },
    ],
  };
}

const DOUBLED = "1d10 + 3 + (1d6[Ambush Bite])[Ambush Bite] + 0";
const CLEAN = "1d10 + 3 + (1d6)[Ambush Bite] + 0";

/* 1 — the model reproduces the defect from serialized data (without this, nothing below means anything). */
test("the chat round-trip doubles the rider label — the exact bench-run-41 string", () => {
  assert.strictEqual(rederiveFormula(ambushBiteRoll()), DOUBLED);
});

/* 2 — and the repair removes it. */
test("edhaUndoFlavorPropagation makes the rehydrated formula single-labelled", () => {
  const data = ambushBiteRoll();
  assert.strictEqual(env.edhaUndoFlavorPropagation(data), true, "it reports the change it made");
  assert.strictEqual(rederiveFormula(data), CLEAN);
});

/* 3 — the two strings the two surfaces print now AGREE, which is the whole point: core's template
 * prints the stored `formula`, the cosmere damage card prints the recompiled one. */
test("the stored formula and the recompiled formula agree after the repair", () => {
  const data = ambushBiteRoll();
  env.edhaUndoFlavorPropagation(data);
  assert.strictEqual(data.formula, CLEAN, "the stored string is untouched — it was always correct");
  assert.strictEqual(rederiveFormula(data), data.formula);
});

/* 4 — display only. Nothing that decides a number is touched. */
test("the repair changes no total, die result, or term structure", () => {
  const before = ambushBiteRoll();
  const after = ambushBiteRoll();
  env.edhaUndoFlavorPropagation(after);
  assert.strictEqual(after.total, before.total);
  assert.strictEqual(after.terms.length, before.terms.length);
  assert.strictEqual(after.terms[4].class, "ParentheticalTerm", "the parentheses STAY in the roll — the graze clone drops them, a bare rider die would ride grazes");
  assert.strictEqual(after.terms[4].options.flavor, "Ambush Bite", "the label the engine wrote stays where it wrote it");
  assert.deepStrictEqual(after.terms[4].roll.terms[0].results, before.terms[4].roll.terms[0].results);
  assert.strictEqual(after.terms[4].roll.total, 3);
});

/* 5 — the compound family case: every propagated copy goes, in one pass. */
test("a compound rider loses the copy on every inner term", () => {
  const data = kindleRoll();
  // The operator's own expression is " + " and its flavor is appended AFTER it — so the doubled
  // compound reads " + [Kindle]", not " +[Kindle] ". That asymmetry is core's, and it is why the
  // repair strips `options.flavor` on the TERMS rather than pattern-matching the joined string.
  assert.strictEqual(rederiveFormula(data), "1d4 + (1[Kindle] + [Kindle]2[Kindle])[Kindle]", "the defect, compound shape");
  assert.strictEqual(env.edhaUndoFlavorPropagation(data), true);
  assert.strictEqual(rederiveFormula(data), "1d4 + (1 + 2)[Kindle]");
});

/* 6 — NEGATIVE CONTROLS. `propagateFlavor` uses `??=`, so a term that already had a flavor was
 * never a propagated copy; and an unflavored parenthetical propagates nothing at all. */
test("a differently-labelled inner term, and an unflavored parenthetical, are left alone", () => {
  const nested = ambushBiteRoll();
  nested.terms[4].roll.terms[0].options.flavor = "Prognosis";
  assert.strictEqual(env.edhaUndoFlavorPropagation(nested), false, "no propagated copy → no change");
  assert.strictEqual(rederiveFormula(nested), "1d10 + 3 + (1d6[Prognosis])[Ambush Bite] + 0");

  const bare = ambushBiteRoll();
  delete bare.terms[4].options.flavor;
  delete bare.terms[4].roll.terms[0].options.flavor;
  assert.strictEqual(env.edhaUndoFlavorPropagation(bare), false);
  assert.strictEqual(rederiveFormula(bare), "1d10 + 3 + (1d6) + 0");
});

/* --- the HOOK half: the repair is actually reached from the hook Foundry fires --------------- */
function mockMessage(rolls) {
  return {
    _source: { rolls: rolls.map((r) => JSON.stringify(r)) },
    updates: [],
    updateSource(change) { this.updates.push(change); Object.assign(this._source, change); return change; },
  };
}

/* 7 — the load-bearing wiring case. */
test("preCreateChatMessage rewrites the stored roll so every later render is clean", async () => {
  const doc = mockMessage([ambushBiteRoll()]);
  assert.strictEqual(rederiveFormula(JSON.parse(doc._source.rolls[0])), DOUBLED, "before: doubled");
  await fireHook(env, "preCreateChatMessage", doc, {}, {}, "user-1");
  assert.strictEqual(doc.updates.length, 1, "exactly one updateSource");
  assert.ok(Array.isArray(doc.updates[0].rolls), "the write is the rolls array");
  assert.strictEqual(typeof doc.updates[0].rolls[0], "string", "written back as a serialized JSON string, the shape the field stores");
  assert.strictEqual(rederiveFormula(JSON.parse(doc._source.rolls[0])), CLEAN, "after: single-labelled");
});

/* 8 — several rolls on one message: the clean ones are passed through by identity, not re-encoded. */
test("only the rolls that carry a propagated copy are rewritten", async () => {
  const plain = { class: "DamageRoll", options: {}, dice: [], evaluated: true, total: 4, formula: "1d8", terms: [{ class: "Die", options: {}, evaluated: true, number: 1, faces: 8, modifiers: [], results: [{ result: 4, active: true }] }] };
  const doc = mockMessage([plain, ambushBiteRoll()]);
  const plainBefore = doc._source.rolls[0];
  await fireHook(env, "preCreateChatMessage", doc, {}, {}, "user-1");
  assert.strictEqual(doc._source.rolls[0], plainBefore, "an untouched roll is the same string it came in as");
  assert.strictEqual(rederiveFormula(JSON.parse(doc._source.rolls[1])), CLEAN);
});

/* 9 — NEGATIVE CONTROLS on the hook: it must never write on a message it has nothing to fix. */
test("preCreateChatMessage writes nothing on a rollless or already-clean message", async () => {
  const none = { _source: {}, updates: [], updateSource(c) { this.updates.push(c); return c; } };
  await fireHook(env, "preCreateChatMessage", none, {}, {}, "user-1");
  assert.strictEqual(none.updates.length, 0, "no rolls → no write");

  const clean = mockMessage([ambushBiteRoll()]);
  await fireHook(env, "preCreateChatMessage", clean, {}, {}, "user-1");
  clean.updates.length = 0;
  await fireHook(env, "preCreateChatMessage", clean, {}, {}, "user-1");
  assert.strictEqual(clean.updates.length, 0, "IDEMPOTENT: a second pass over the repaired message writes nothing");
});

/* 10 — a malformed entry must not lose the message or the other rolls. */
test("an unparsable roll entry is passed through untouched", async () => {
  const doc = { _source: { rolls: ["{not json", JSON.stringify(ambushBiteRoll())] }, updates: [], updateSource(c) { this.updates.push(c); Object.assign(this._source, c); return c; } };
  await fireHook(env, "preCreateChatMessage", doc, {}, {}, "user-1");
  assert.strictEqual(doc._source.rolls[0], "{not json");
  assert.strictEqual(rederiveFormula(JSON.parse(doc._source.rolls[1])), CLEAN);
});
