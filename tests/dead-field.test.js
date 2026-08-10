/* The DEAD-FIELD family (2026-07-27h) — the snapshot and the ledger of the three instances.
 *
 * THE FAMILY. Foundry's SchemaField DELETES keys a DataModel does not declare. So an engine write to
 * a nonexistent `system.<field>` resolves without error, stores nothing, and reads back undefined —
 * every gate reading it is silently false/0, and nothing anywhere reports a problem. Three shipped:
 *   · 07-26l  `edhaAttackKind` → `item.system.range`      (a weapon's is `system.attack.range`)
 *   · 07-26m  `edhaIsConstruct` → `actor.system.customType` (creature type is `system.type{id,custom}`)
 *   · 07-27g  the counter economy → `effect.system.count`  (the field is `system.stacks`)
 * A fourth was found by the gate itself the day it was built (bench-setup's weapon picker, same
 * `system.range` as the first).
 *
 * `scripts/lint-refs.js` pass 11 is the gate; it checks engine + build `system.*` paths against
 * `systemSchemaTopLevelFields` in data/native-vocabulary.json. THIS file guards the two things the
 * gate itself depends on, which no other test covers:
 *   1. The snapshot still carries the field list, still has the fields we know are real, and has NOT
 *      started including the three dead names (which would silently re-open the hole — an
 *      over-harvesting extractor is the one way pass 11 goes quiet without failing).
 *   2. The three fixed instances stay fixed in engine CODE, as a text ledger. Cheap, and it fires
 *      even if someone disables the lint pass.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { readEngineSource, codeOnly } = require("./harness.js");

const REPO = path.join(__dirname, "..");
const snapshot = JSON.parse(fs.readFileSync(path.join(REPO, "data", "native-vocabulary.json"), "utf8"));

/* Comment-stripped, LF-normalized engine text (tests/harness.js), so the ledger cases below mean
 * "in CODE" — the engine's own comments quote every one of these dead field names while
 * explaining the bugs. Strings survive stripping (a flat update path like "system.stacks" IS code). */
const code = codeOnly(readEngineSource());

test("native-vocabulary snapshot carries the document field list", () => {
  const f = snapshot.systemSchemaTopLevelFields;
  assert.ok(Array.isArray(f), "systemSchemaTopLevelFields must be an array — regenerate with node scripts/dump-native-vocabulary.js");
  assert.ok(f.length >= 50, `expected 50+ top-level schema fields, got ${f.length} — the extractor rotted`);
  assert.deepStrictEqual(f, [...new Set(f)].sort(), "must be sorted and unique (a stable diff is the point of a snapshot)");
});

test("the snapshot contains the fields the engine actually depends on", () => {
  const f = new Set(snapshot.systemSchemaTopLevelFields);
  for (const real of ["stacks", "isStackable", "attack", "type", "resources", "defenses", "deflect",
                      "attributes", "skills", "damage", "activation", "description", "events", "tier"]) {
    assert.ok(f.has(real), `"${real}" is a real cosmere field and must be in the snapshot — without it pass 11 false-fails`);
  }
});

test("the snapshot does NOT contain the three dead field names (an over-harvesting extractor)", () => {
  const f = new Set(snapshot.systemSchemaTopLevelFields);
  for (const dead of ["count", "customType", "range"]) {
    assert.ok(!f.has(dead), `"${dead}" is not a TOP-LEVEL field of any cosmere DataModel; if the ` +
      `snapshot lists it, the extractor is flattening nested keys and pass 11 has gone blind`);
  }
});

test("ledger: the three fixed dead-field instances stay fixed in engine CODE", () => {
  assert.ok(!/system\??\.\s*count\b/.test(code) && !code.includes('"system.count"'),
    "`system.count` is back — ActiveEffectDataModel has {isStackable, stacks} only (07-27g)");
  assert.ok(!/system\??\.customType\b/.test(code),
    "`system.customType` is back — creature type is `system.type` {id, custom} (07-26m)");
  assert.ok(!/system\??\.range\b/.test(code),
    "a top-level `system.range` is back — a weapon's range is `system.attack.range` (07-26l)");
  // The positive: the counter economy writes the real field, in both the update and the seed.
  assert.ok(code.includes('"system.stacks"'), "the counter write must target system.stacks");
  assert.ok(/isStackable:\s*true,\s*stacks:\s*1/.test(code), "the status seed must carry stacks, not count");
});
