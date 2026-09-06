/* The Edha derived-stat family — sheet vs. wizard preview (bench run 21).
 *
 * Run 21 reported THREE drifts between the creation wizard's live preview panel and the finished
 * character sheet, and canon pointed a different way for each:
 *   • Move   — preview 30 ft, sheet 35 ft. Character_Building_Rules.md §Derived stats says
 *              "Movement = 20 + SPD·5", so the SHEET was right and the preview was re-implementing
 *              the cosmere system's ceil(SPD/2) ladder.
 *   • Senses — preview 10 ft, sheet 5 ft. The same doc's §Senses Range table says AWA 0 → 10 ft,
 *              so the PREVIEW was right: the engine had never applied the Edha table to the sheet
 *              at all, and the system's own ceil(AWA/2) ladder stood.
 *   • Health — preview 13, sheet 14. The +1 itself was the open ruling R-54, so these tests pinned
 *              the AGREEMENT, never the number.
 *
 * And the separately-reported "Finish leaves the actor at 13/14": the system clamps every resource
 * to its max at the end of prepareSecondaryDerivedData — before the engine's wrapper adds the +1 —
 * so a stored 14 was cut back to 13 on every prepare and the point was unreachable by ANY route.
 * The clamp repair hands back only what _source genuinely holds; the negatives below are the
 * load-bearing half, because a repair that invented health would be worse than the bug.
 *
 * ── R-54 ANSWERED 2026-09-06 (item 47): (c) REMOVE the +1, no level gate. `EDHA_HP_BONUS` is `0`,
 * so Edha max HP is now term-for-term the system's advancement table (10 + STR at L1). The health
 * cases below are RE-PINNED to that number, and the clamp repair — kept in the engine because it
 * is what makes a non-zero bonus reachable — is now INERT BY CONSTRUCTION (`after > before` can
 * never hold at 0). Its negatives are re-pinned as "the repair invents nothing", which is the half
 * that must keep holding whatever the constant is. The engine constant is a top-level `const`, so
 * it is in the vm's lexical record and NOT a property of the loaded context: these tests assert the
 * OBSERVABLE number, not the constant, which is the right level anyway.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

// The cosmere DerivedValueField (system index.js SCHEMA$w + initialize): a schema object whose
// `.value` getter is base + bonus, where base = useOverride ? override : derived.
function derived(d, { override = null, useOverride = false, bonus = 0 } = {}) {
  const o = { derived: d, override, useOverride, bonus };
  Object.defineProperty(o, "base", { get() { return this.useOverride ? this.override : this.derived; } });
  Object.defineProperty(o, "value", { get() { return this.base + this.bonus; } });
  return o;
}

/* A prepared character actor, with the system's own preparation already applied — including the
 * resource clamp that runs LAST in prepareSecondaryDerivedData, which is the whole mechanism
 * behind 13/14. `srcHea` is what the document actually stores; the prepared value is the clamp's
 * output against the max the SYSTEM derived (i.e. before the engine's bonus). */
function pc({ str = 0, spd = 0, awa = 0, srcHea = null, srcHeaBonus = 0, srcRateOverride = false, type = "character" } = {}) {
  const systemMaxHea = 10 + str;                       // advancement rule L1: health 10 + STR
  const storedHea = srcHea == null ? systemMaxHea : srcHea;
  const clamped = Math.max(0, Math.min(systemMaxHea + srcHeaBonus, storedHea));   // the system's clamp
  return {
    type,
    system: {
      attributes: { str: { value: str, bonus: 0 }, spd: { value: spd, bonus: 0 }, awa: { value: awa, bonus: 0 },
                    int: { value: 0, bonus: 0 }, wil: { value: 0, bonus: 0 }, pre: { value: 0, bonus: 0 } },
      resources: { hea: { value: clamped, max: derived(systemMaxHea, { bonus: srcHeaBonus }) } },
      movement: { walk: { rate: derived(20 + 5 * Math.min(Math.ceil(spd / 2), 5)) } },   // system ladder-ish placeholder
      senses: { range: derived([5, 10, 20, 50, 100, Number.MAX_SAFE_INTEGER][Math.min(Math.ceil(awa / 2), 5)]) },
      level: 1,
    },
    _source: {
      system: {
        resources: { hea: { value: storedHea, max: { bonus: srcHeaBonus } } },
        movement: { walk: { rate: { useOverride: srcRateOverride, override: 99 } } },
      },
    },
  };
}

// --- Move: the sheet was canon, the preview was the bug -----------------------
test("edhaWalkRateFtFromSpd is the canon 20 + 5xSPD, not the system's ceil(SPD/2) ladder", () => {
  assert.strictEqual(env.edhaWalkRateFtFromSpd(0), 20);
  assert.strictEqual(env.edhaWalkRateFtFromSpd(1), 25);
  assert.strictEqual(env.edhaWalkRateFtFromSpd(3), 35);   // the system's ladder says 30 here — the reported drift
  assert.strictEqual(env.edhaWalkRateFtFromSpd(6), 50);   // ladder says 80
  assert.strictEqual(env.edhaWalkRateFtFromSpd(undefined), 20);
});

test("edhaDeriveSheetStats overrides walk rate with 20 + 5xSPD", () => {
  const a = pc({ spd: 3 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.movement.walk.rate.override, 35);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, true);
});

test("NEGATIVE: a legacy pregen's own movement override is never stomped", () => {
  const a = pc({ spd: 3, srcRateOverride: true });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, false);   // untouched
  assert.strictEqual(a.system.movement.walk.rate.override, null);
});

// --- Senses: the preview was canon, the sheet was the bug ---------------------
test("edhaDeriveSheetStats writes the Edha AWA table into senses.range.derived", () => {
  for (const [awa, ft] of [[0, 10], [1, 15], [2, 20], [3, 20], [4, 25], [5, 30]]) {
    const a = pc({ awa });
    env.edhaDeriveSheetStats(a);
    assert.strictEqual(a.system.senses.range.derived, ft, `AWA ${awa}`);
  }
});

test("the AWA-0 case is the reported one: sheet read the system's 5 ft, canon is 10 ft", () => {
  const a = pc({ awa: 0 });
  assert.strictEqual(a.system.senses.range.derived, 5);    // what the system prepared
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.value, 10);     // what the sheet now shows
});

test("NEGATIVE: senses writes .derived only — a hand-configured override still wins", () => {
  const a = pc({ awa: 0 });
  a.system.senses.range.override = 60;
  a.system.senses.range.useOverride = true;
  a.system.senses.range.bonus = 5;
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.senses.range.derived, 10);   // still updated underneath
  assert.strictEqual(a.system.senses.range.value, 65);     // but the override + bonus decide
});

// --- Health: R-54 (c) — the +1 is GONE, and the clamp repair is inert at 0 ---
test("R-54: edhaDeriveSheetStats adds NOTHING to max health — Edha HP is the system's number", () => {
  const a = pc({ str: 3 });
  const before = a.system.resources.hea.max.value;
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.max.value - before, 0,
    "R-54 (c): EDHA_HP_BONUS is 0. Character_Building_Rules.md §HP and the character-builder sheet " +
    "both give HP = 10 + STR at L1, term-for-term the system's advancement table — Movement and " +
    "Senses are the two stats Edha derives differently, not HP. A non-zero delta here means the " +
    "constant crept back (or a level gate was added, which R-54 forbids).");
});

test("R-54: THE CHECKLIST ROW'S NUMBER — a fresh L1 actor at STR 0 reads 10, not 11", () => {
  const a = pc({ str: 0 });                                // brand-new + Edha Character, no picks
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.max.value, 10, "10/10 at STR 0 — the row's target");
  assert.strictEqual(a.system.resources.hea.value, 10);
});

test("R-54: the clamp repair is INERT at bonus 0 — a stored over-max value is not handed back", () => {
  // The historic 13/14: Finish wrote 14, the system clamp cut it to 13, and the repair handed the
  // point back once the module raised the max. At EDHA_HP_BONUS 0 the max never rises, so there is
  // no unreachable point to repair and _source's 14 stays out of reach — 13 of 13 is the max now.
  const a = pc({ str: 3, srcHea: 14 });
  assert.strictEqual(a.system.resources.hea.value, 13);
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.value, 13, "the repair invents nothing when the max did not move");
  assert.strictEqual(a.system.resources.hea.max.value, 13);
});

test("NEGATIVE: a genuinely wounded character is NOT topped up", () => {
  const a = pc({ str: 3, srcHea: 9 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.value, 9);     // health is never invented
  assert.strictEqual(a.system.resources.hea.max.value, 13);
});

test("NEGATIVE: a character sitting exactly at the system max is NOT bumped past it", () => {
  const a = pc({ str: 3, srcHea: 13 });                    // stores 13, was never clamped
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.value, 13);    // 13 of 13 is full health now
  assert.strictEqual(a.system.resources.hea.max.value, 13);
});

test("NEGATIVE: a stale over-max source value is never restored whole", () => {
  const a = pc({ str: 3, srcHea: 40 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.value, 13);
});

test("R-54: a legacy June pregen storing its own hea bonus KEEPS it (until migrateDerivations)", () => {
  // Ben's explicit carve-out: the block is skipped while `_source…hea.max.bonus` is non-zero, so a
  // pregen's hand-stored +1 survives R-54 and is stripped only by edha.migrateDerivations().
  const a = pc({ str: 3, srcHeaBonus: 1, srcHea: 14 });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.max.value, 14);   // its own +1, applied once
  assert.strictEqual(a.system.resources.hea.value, 14);
});

test("NEGATIVE: adversaries are untouched — no bonus, no speed override, no senses rewrite", () => {
  const a = pc({ str: 3, spd: 3, awa: 0, type: "adversary" });
  env.edhaDeriveSheetStats(a);
  assert.strictEqual(a.system.resources.hea.max.value, 13);
  assert.strictEqual(a.system.movement.walk.rate.useOverride, false);
  assert.strictEqual(a.system.senses.range.derived, 5);
});

// --- THE ROW THAT FAILED: preview and sheet must agree ----------------------
test("the wizard preview reports exactly what the finished sheet will read", () => {
  env.CONFIG.COSMERE.advancement = { rules: [{ level: 1, health: 10, healthIncludeStrength: true }] };
  const spread = { str: 3, spd: 3, int: 3, wil: 3, awa: 0, pre: 0 };   // run 21's actual spread
  const html = env.edhaCwDerivedPreview({ system: { level: 1 } }, spread);
  const num = (label) => {
    const m = new RegExp(`>${label}</em> <strong>([^<]+)</strong>`).exec(html);
    assert.ok(m, `preview has no ${label} cell`);
    return m[1];
  };

  const a = pc({ str: spread.str, spd: spread.spd, awa: spread.awa });
  env.edhaDeriveSheetStats(a);

  assert.strictEqual(Number(num("Health")), a.system.resources.hea.max.value, "Health: preview vs sheet");
  assert.strictEqual(num("Move"), `${a.system.movement.walk.rate.value} ft`, "Move: preview vs sheet");
  assert.strictEqual(num("Senses"), `${a.system.senses.range.value} ft`, "Senses: preview vs sheet");
});
