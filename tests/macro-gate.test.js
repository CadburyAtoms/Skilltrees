/* Pinned cases for lint-refs PASS 8 — the `execute-macro` budget (added 2026-07-24s).
 *
 * WHY THIS EXISTS. Ben overruled a flat ban on `execute-macro` on the grounds that a macro STRING is
 * testable in a way a "the table resolves this by hand" card never is. That argument is only true if
 * something actually tests it, and this project has already been bitten twice by gates that looked
 * right and did nothing: audit.py's soft-laziness check went blind as talents left the engine, and
 * audit.py read data through the machine's locale codec so it crashed only on Ben's box. So the gate
 * ships with proof that each rule fires — and, just as important, that the three LEGAL shapes stay
 * clean. A gate that rejects everything is as useless as one that rejects nothing.
 *
 * TWO lint runs, not one per case: the whole violating set goes in together, which also proves the
 * pass reports every violation in a run rather than bailing at the first. The fixture writes its OWN
 * authored file and deletes it in a finally block; it never mutates tracked data. If a hard kill
 * leaves `_macro-gate-fixture.json` behind, the ordinary gates fail loudly on it — the safe
 * direction.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const FIXTURE = path.join(REPO, "data/authored/_macro-gate-fixture.json");

// Run the linter once with a set of fixture talents in place. Returns only the lines mentioning
// execute-macro, so unrelated repo errors can never make a case pass or fail by accident.
function macroErrorsFor(cases) {
  const talents = {};
  for (const [name, handler] of Object.entries(cases)) {
    talents[name] = { events: { MacroGateProbe0: {
      id: "MacroGateProbe0", description: "temporary lint fixture", event: "use",
      handler: { type: "execute-macro", ...handler },
    } } };
  }
  fs.writeFileSync(FIXTURE, JSON.stringify({ _meta: { group: "Lint fixture (tests/macro-gate.test.js)" }, talents }, null, 2) + "\n");
  try {
    const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
    return ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("execute-macro"));
  } finally {
    try { fs.unlinkSync(FIXTURE); } catch (e) {}
  }
}

/* --- the three LEGAL shapes: mutation-checked the other way ----------------------------------
 * FIELD SHAPE (corrected 2026-07-26): the system's real schema is `inline` (boolean) + `macro:
 * { type, command }` + `uuid` — camelCase. The first version of these fixtures used the
 * PascalCase i18n LABEL keys (`Inline` as the source string), which no DataModel would ever
 * populate, so the gate they pinned was aimed at fields that don't exist. */
const inlineScript = (command) => ({ inline: true, macro: { type: "script", command } });
const LEGAL = {
  // A small inline macro is the whole point of the ruling — it must survive.
  "Fixture Small": inlineScript("const a = actor;\nif (!a) return;\nawait a.update({});"),
  // A Foundry macro body runs as an ASYNC function body, so top-level await is legal there and must
  // not be reported as a syntax error here.
  "Fixture Await": inlineScript("await actor.update({});"),
  // Guard clauses and comments make code more readable; a limit that punished them would push
  // authors toward dense one-liners, which is the opposite of what the limit is for.
  "Fixture Comments": inlineScript(Array.from({ length: 40 }, () => "// just a comment").join("\n") + "\nconst a = 1;"),
};

let legalErrs = null;
test("macro gate accepts every legal shape (small · top-level await · comments are free)", () => {
  legalErrs = macroErrorsFor(LEGAL);
  assert.strictEqual(legalErrs.length, 0, `expected no execute-macro errors, got:\n  ${legalErrs.join("\n  ")}`);
});

/* --- what it must reject -------------------------------------------------------------------- */
const ILLEGAL = {
  // A UUID macro lives in the WORLD: this gate cannot parse it, a review cannot diff it, and a pack
  // rebuild cannot carry it — so the behaviour is no more visible than the engine branch it replaced.
  "Fixture Uuid": { inline: false, uuid: "Macro.abcdef1234567890" },
  // A chat macro as a rule payload is a card pretending to be automation.
  "Fixture Chat": { inline: true, macro: { type: "chat", command: "the table resolves this" } },
  "Fixture Empty": inlineScript("   "),
  "Fixture Chars": inlineScript("const x = 1; // " + "y".repeat(1300)),
  "Fixture Lines": inlineScript(Array.from({ length: 25 }, (_, i) => `const v${i} = ${i};`).join("\n")),
  // The check that makes a macro defensible at all: a parse error means the rule is dead at the
  // table and nothing else would ever say so.
  "Fixture Parse": inlineScript("const a = ;"),
  // Size is the wrong thing to worry about on its own. A hook outlives the use that created it and
  // re-registers on every execution, with nothing to remove it — a second engine, at any length.
  "Fixture Hook": inlineScript('Hooks.on("updateActor", () => {});'),
  "Fixture Timer": inlineScript("setTimeout(() => {}, 100);"),
};

let illegalErrs = null;
test("macro gate reports EVERY violation in one run, not just the first", () => {
  illegalErrs = macroErrorsFor(ILLEGAL);
  assert.ok(illegalErrs.length >= Object.keys(ILLEGAL).length,
    `expected at least ${Object.keys(ILLEGAL).length} execute-macro errors, got ${illegalErrs.length}:\n  ${illegalErrs.join("\n  ")}`);
});

for (const [label, name, expect] of [
  ["a macro referenced by UUID", "Fixture Uuid", "must be INLINE"],
  ["a chat-type macro", "Fixture Chat", 'macro.type "chat"'],
  ["an empty body", "Fixture Empty", "empty macro.command"],
  ["over the character budget", "Fixture Chars", "chars (max 1200)"],
  ["over the logical-line budget", "Fixture Lines", "logical lines (max 20"],
  ["a body that does not parse", "Fixture Parse", "does not parse"],
  ["registering a Foundry hook", "Fixture Hook", "registers a Foundry hook"],
  ["scheduling a timer", "Fixture Timer", "schedules a timer"],
]) {
  test(`macro gate rejects: ${label}`, () => {
    assert.ok(illegalErrs, "the batch run did not complete");
    const line = illegalErrs.find((l) => l.includes(name));
    assert.ok(line, `no error mentioned ${name}`);
    assert.ok(line.includes(expect), `expected "${expect}" in:\n  ${line}`);
  });
}
