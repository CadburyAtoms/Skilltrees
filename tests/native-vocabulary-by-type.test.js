/* tests/native-vocabulary-by-type.test.js — pins scripts/dump-native-vocabulary.js's
 * `systemSchemaFieldsByType` (TODO_REPO_HYGIENE item 182) against SYNTHETIC bundle text.
 *
 * WHY SYNTHETIC, NOT A REAL BUNDLE. This repo has no 3.1.0 (or even a second copy of the 2.1.0)
 * system bundle to test against — `dump-native-vocabulary.js` reads Ben's live Foundry install,
 * which CI and this sandbox do not have (see that file's own header). What CAN be pinned here,
 * and IS the point of this file, is the PARSING LOGIC itself: given text shaped the way the
 * compatibility doc (docs/analysis/cosmere-rpg-3.1.0-compatibility.md, blocker B1) says the real
 * bundle names its classes and mixins — `TalentItemDataModel extends
 * ResourcesItemMixin(LinkedSkillsMixin(BaseItemDataModel))`, `ActivatableItemMixin` /
 * `DamagingItemMixin` contributing `activation`/`damage` — does the resolver correctly union a
 * class's own fields with every mixin/base it names, and does it correctly NOT explode on a
 * missing base, a cycle, or a bundle that doesn't match the expected shape at all.
 *
 * `require("../scripts/dump-native-vocabulary.js")` is safe since item 182 wrapped this script's
 * install-reading CLI body in `main()`, gated behind `require.main === module` — requiring it
 * here only reaches the exported pure function, never touches the filesystem or calls
 * `process.exit`. */
"use strict";
const assert = require("assert");
const { systemSchemaFieldsByType } = require("../scripts/dump-native-vocabulary.js");

// Shaped like blocker B1's own description: a talent's fields split across itself and two
// mixins, chained through a base; an action gaining activation/damage via a DIFFERENT mixin
// pair, atop the SAME base — i.e. two sibling item types sharing one root, each with its own
// mixin-contributed fields, which is exactly the shape the real per-type check needs to tell
// apart (a talent must NOT inherit activation/damage from a base or mixin only ACTION uses).
const SYNTHETIC_BUNDLE = `
class BaseItemDataModel {
  static defineSchema() {
    return { id: new StringField(), type: new StringField(), description: new SchemaField() };
  }
}
function ResourcesItemMixin(Base) {
  return class extends Base {
    static defineSchema() {
      return { ...super.defineSchema(), resources: new SchemaField() };
    }
  };
}
function LinkedSkillsMixin(Base) {
  return class extends Base {
    static defineSchema() {
      return { ...super.defineSchema(), linkedSkills: new SchemaField() };
    }
  };
}
function ActivatableItemMixin(Base) {
  return class extends Base {
    static defineSchema() {
      return { ...super.defineSchema(), activation: new ActivationField() };
    }
  };
}
function DamagingItemMixin(Base) {
  return class extends Base {
    static defineSchema() {
      return { ...super.defineSchema(), damage: new DamageField() };
    }
  };
}
class TalentItemDataModel extends ResourcesItemMixin(LinkedSkillsMixin(BaseItemDataModel)) {
  static defineSchema() {
    return { ...super.defineSchema(), path: new StringField(), ancestry: new StringField(), power: new NumberField() };
  }
}
class ActionItemDataModel extends ActivatableItemMixin(DamagingItemMixin(BaseItemDataModel)) {
  static defineSchema() {
    return { ...super.defineSchema(), modality: new StringField() };
  }
}
class WeaponItemDataModel extends StrikingItemMixin(BaseItemDataModel) {
  static defineSchema() {
    return { ...super.defineSchema(), equipped: new BooleanField() };
  }
}
function StrikingItemMixin(Base) {
  return class extends Base {
    static defineSchema() {
      return { ...super.defineSchema(), strike: new SchemaField() };
    }
  };
}
class NoSchemaItemDataModel extends BaseItemDataModel {
}
`;

test("a talent's resolved fields include its own + every mixin/base it names, and exclude activation/damage", () => {
  const byType = systemSchemaFieldsByType(SYNTHETIC_BUNDLE);
  assert.ok(byType.talent, "expected a \"talent\" entry — TalentItemDataModel should resolve");
  const talent = new Set(byType.talent);
  for (const f of ["id", "type", "description", "resources", "linkedSkills", "path", "ancestry", "power"]) {
    assert.ok(talent.has(f), `talent should carry "${f}" (own field or from a named mixin/base)`);
  }
  for (const f of ["activation", "damage", "modality", "strike", "equipped"]) {
    assert.ok(!talent.has(f), `talent should NOT carry "${f}" — that belongs to a DIFFERENT type's mixin chain`);
  }
});

test("an action's resolved fields include activation/damage from its own mixins, not a sibling type's", () => {
  const byType = systemSchemaFieldsByType(SYNTHETIC_BUNDLE);
  assert.ok(byType.action, "expected an \"action\" entry");
  const action = new Set(byType.action);
  for (const f of ["id", "type", "description", "activation", "damage", "modality"]) {
    assert.ok(action.has(f), `action should carry "${f}"`);
  }
  for (const f of ["resources", "linkedSkills", "path", "ancestry", "power", "strike", "equipped"]) {
    assert.ok(!action.has(f), `action should NOT carry "${f}" — that belongs to talent or weapon's chain`);
  }
});

test("a weapon resolves through a single-mixin extends clause (no chained mixin call)", () => {
  const byType = systemSchemaFieldsByType(SYNTHETIC_BUNDLE);
  assert.ok(byType.weapon, "expected a \"weapon\" entry");
  const weapon = new Set(byType.weapon);
  for (const f of ["id", "type", "description", "strike", "equipped"]) {
    assert.ok(weapon.has(f), `weapon should carry "${f}"`);
  }
  assert.ok(!weapon.has("activation") && !weapon.has("damage"), "weapon should not pick up talent/action-only fields");
});

test("a class with no defineSchema of its own still resolves through its base", () => {
  const byType = systemSchemaFieldsByType(SYNTHETIC_BUNDLE);
  assert.ok(byType.noschema, "expected a \"noschema\" entry for NoSchemaItemDataModel");
  const noschema = new Set(byType.noschema);
  for (const f of ["id", "type", "description"]) {
    assert.ok(noschema.has(f), `noschema should inherit "${f}" from BaseItemDataModel`);
  }
});

test("every resolved type's fields are plain sorted, de-duplicated arrays", () => {
  const byType = systemSchemaFieldsByType(SYNTHETIC_BUNDLE);
  for (const [type, fields] of Object.entries(byType)) {
    assert.ok(Array.isArray(fields), `${type}: expected an array`);
    assert.deepStrictEqual(fields, [...new Set(fields)].sort(), `${type}: must be sorted and de-duplicated`);
  }
});

test("does not crash on a self-referencing (cyclic) mixin chain — returns partial fields, never throws", () => {
  const CYCLIC = `
    function AMixin(Base) {
      return class extends Base {
        static defineSchema() { return { ...super.defineSchema(), a: new StringField() }; }
      };
    }
    class CyclicItemDataModel extends AMixin(CyclicItemDataModel) {
      static defineSchema() { return { ...super.defineSchema(), b: new StringField() }; }
    }
  `;
  let byType;
  assert.doesNotThrow(() => { byType = systemSchemaFieldsByType(CYCLIC); });
  assert.ok(byType.cyclic, "expected a \"cyclic\" entry despite the self-reference");
  assert.ok(byType.cyclic.includes("b"), "the class's own field must still be present");
});

test("a bundle with no <Name>ItemDataModel classes at all returns an empty object, not a throw", () => {
  let byType;
  assert.doesNotThrow(() => { byType = systemSchemaFieldsByType("const x = 1; function f() { return {}; }"); });
  assert.deepStrictEqual(byType, {});
});

test("an identifier named in `extends` that resolves to nothing (a core foundry.mjs base) is silently skipped, not fatal", () => {
  const PARTIAL = `
    class OrphanItemDataModel extends SomeCoreFoundryClassThisRepoCannotRead {
      static defineSchema() { return { id: new StringField() }; }
    }
  `;
  const byType = systemSchemaFieldsByType(PARTIAL);
  assert.ok(byType.orphan, "expected an \"orphan\" entry");
  assert.deepStrictEqual(byType.orphan, ["id"]);
});
