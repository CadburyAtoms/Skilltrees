/* item 170 (fix pass 13, 2026-09-15) — a status rule's PRINTED note must not contradict its own formula.
 *
 * Bench run 49a (GATE-3, which passed): Vital Diagnosis's use card read, verbatim, "… Trooper is Diagnosed
 * (by Bench — Life) — damage against it gains +3 vital (auto-applied). Life (Anaveth). … You and allies
 * dealing damage to it deal +Tier vital - auto-applied …". The first sentence is edhaStatusApplyCard's tail,
 * computed from `bonusDamageFormula: "@skills.blue.rank"`; everything after it is the rule's authored
 * `note`, printed into chat beside it. Item 108 moved the formula and the card text to the Blue rank and
 * left the note (and the rule's description) on "tier", so one chat message contradicted itself — the same
 * class as item 148's stale cue text. Two siblings carried the same stale word where only the Events tab
 * shows it: Vital Diagnosis's reveal rule ("its +@tier vital rider") and Bulwark Ground's zone-guard rule
 * ("Temp HP = tier"), and the engine's schema hint for `bonusDamageFormula` offered "@tier" as its example.
 *
 * The pin reads every authored `edha-apply-status` rule that prints a bonus: a note or description may say
 * "Tier" only when the formula reads `@tier`. Reversion: put "+Tier vital" back in
 * data/authored/deity-life.json's Diagnosed rule and the case fails naming the rule.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { readEngineSource, codeOnly } = require("./harness.js");

const AUTHORED = path.join(__dirname, "..", "data", "authored");

test("item 170: an edha-apply-status rule's note and description never say Tier unless its bonus formula reads @tier", () => {
  const offenders = [];
  let checked = 0;
  for (const f of fs.readdirSync(AUTHORED).filter((x) => x.endsWith(".json"))) {
    const talents = JSON.parse(fs.readFileSync(path.join(AUTHORED, f), "utf8")).talents || {};
    for (const [name, t] of Object.entries(talents)) {
      for (const [rid, r] of Object.entries(t.events || {})) {
        const h = r.handler || {};
        if (h.type !== "edha-apply-status" || !h.bonusDamageFormula) continue;
        checked++;
        if (/@tier/.test(h.bonusDamageFormula)) continue;
        for (const [field, text] of [["note", h.note], ["description", r.description]]) {
          if (/\btier\b/i.test(String(text || ""))) offenders.push(`${f} ${name} ${rid}.${field} says "tier" but the formula is ${h.bonusDamageFormula}`);
        }
      }
    }
  }
  assert.ok(checked >= 1, "expected at least one authored edha-apply-status rule with a bonus formula (Vital Diagnosis)");
  assert.deepStrictEqual(offenders, [], offenders.join("; "));
});

test("item 170: Bulwark Ground's zone-guard rule and the engine's bonusDamageFormula hint no longer say tier for a rank read", () => {
  const fate = JSON.parse(fs.readFileSync(path.join(AUTHORED, "deity-fate.json"), "utf8")).talents["Bulwark Ground"];
  const rule = fate.events.BulwarkGuard0000;
  assert.strictEqual(rule.handler.thpFormula, "@skills.white.rank");
  assert.ok(!/Temp HP = tier/.test(rule.description), `Bulwark Ground's rule description still says "Temp HP = tier"`);
  const code = codeOnly(readEngineSource());
  assert.ok(!/hint: "Vital Diagnosis: @tier/.test(code), "the bonusDamageFormula schema hint still offers @tier as Vital Diagnosis's example");
});
