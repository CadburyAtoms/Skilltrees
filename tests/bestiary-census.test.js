/* Pins for scripts/bestiary-census.js — the bestiary's measured ground truth (item 153, 2026-09-14).
 *
 * WHY THIS EXISTS. The census is the number every bestiary-redo decision is read against (R-101 (a)
 * lets adversary HP and damage be a yardstick), so (1) the pure helpers are pinned so a parser
 * regression cannot quietly move a band, and (2) the committed docs/analysis/bestiary/CENSUS.md
 * must equal a fresh render of the live data — the same sync discipline the dashboard and the canon
 * codex live under, because a stale ground truth is worse than none ("the list must not become
 * fiction", iron rule 2b's ratchet lesson). The fix is always one command, named in the message.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const REPO = path.resolve(__dirname, "..");
const c = require(path.join(REPO, "scripts", "bestiary-census.js"));

test("bestiary-census: parseDamage reads NdM+K, NdM, spaced forms, flat numbers, and rejects prose", () => {
  assert.deepStrictEqual(c.parseDamage("1d6+2").ev, 5.5);
  assert.deepStrictEqual(c.parseDamage("2d8").ev, 9);
  assert.deepStrictEqual(c.parseDamage("1d4 + 2").ev, 4.5);
  assert.deepStrictEqual(c.parseDamage("1d8-1").ev, 3.5);
  assert.deepStrictEqual(c.parseDamage("3").ev, 3);
  assert.strictEqual(c.parseDamage("half the damage dealt"), null);
  assert.strictEqual(c.parseDamage(null), null);
});

test("bestiary-census: stats() gives min/avg/max and an empty band for no numbers", () => {
  assert.deepStrictEqual(c.stats([6, 22, 14]), { n: 3, min: 6, avg: 14, max: 22 });
  assert.deepStrictEqual(c.stats([]), { n: 0, min: null, avg: null, max: null });
});

test("bestiary-census: statusIdsIn reads status keys, splits comma lists, and skips statusExpire / consumeSelfStatus", () => {
  const ids = c.statusIdsIn({ type: "x", statusId: "braced", statusExpire: "target", consumeSelfStatus: true,
    requireTargetStatus: "compelled,disoriented", nested: { whenTargetStatus: "Weakened" } });
  assert.deepStrictEqual(ids.sort(), ["braced", "compelled", "disoriented", "weakened"]);
});

const SYNTH = {
  _README: { purpose: "fixture" },
  "Pair Beast": { role: "rival", tier: 1, leylines: ["red", "blue"], defenses: { phy: 12, cog: 10, spi: 10 }, hp: 20,
    items: [{ name: "Bite", kind: "weapon", attack: 5, damage: "1d6+2", damageType: "keen" },
            { name: "Glare", text: "<p>When…</p>", events: [{ event: "edha-apply-watch", handler: { type: "edha-gm-cue", trigger: "hp-below" } }] },
            { name: "Lunge", events: [{ event: "use", handler: { type: "edha-only-here", statusId: "slowed" } }] }] },
  "Plain Minion": { role: "minion", tier: 1, defenses: { phy: 11, cog: 9, spi: 9 }, hp: 8, folder: "Fixture Bestiary", senses: 30, movement: 40,
    talents: ["White/Guiding Signal"], conditionImmunities: ["frightened"],
    items: [{ name: "Grab", text: "<p>On a hit…</p>", noHook: "a grab writes no damage" }] },
};

test("bestiary-census: the colour ledger halves a pair, counts unattuned blocks, and folders the legacy blocks apart", () => {
  const r = c.census(SYNTH, { pcHandlerTypes: new Set(["edha-gm-cue"]), customStatuses: new Set(["weakened"]) });
  assert.deepStrictEqual(r.ledger, { white: 0, blue: 0.5, black: 0, red: 0.5, green: 0 });
  assert.strictEqual(r.totals.unattuned, 1);
  assert.strictEqual(r.totals.legacy, 1, "a block without a folder counts as legacy (a mistake since R-130 — every block states one)");
  const withLegacyFolder = c.census({ ...SYNTH, "Old Construct": { ...SYNTH["Plain Minion"], folder: "Legacy — Playtest Dungeon" } }, {});
  assert.strictEqual(withLegacyFolder.totals.legacy, 2, "R-130 (a): a block in the Legacy folder is counted apart too");
  assert.ok(Object.keys(r.folders).some((f) => /no folder/.test(f)));
});

test("bestiary-census: senses and movement report stated vs derived, and the derivation default is the cosmere ladder's 5 ft", () => {
  const r = c.census(SYNTH, {});
  const pair = r.blocks.find((b) => b.name === "Pair Beast");
  const minion = r.blocks.find((b) => b.name === "Plain Minion");
  assert.deepStrictEqual([pair.sensesFt, pair.sensesStated, pair.walkFt, pair.walkStated], [5, false, c.DEFAULT_WALK_FT, false]);
  assert.deepStrictEqual([minion.sensesFt, minion.sensesStated, minion.walkFt, minion.walkStated], [30, true, 40, true]);
});

test("bestiary-census: wiring counts split cues / effects / native rolls / noHook, and sole consumers are adversary-only handler types", () => {
  const r = c.census(SYNTH, { pcHandlerTypes: new Set(["edha-gm-cue"]), customStatuses: new Set() });
  const pair = r.blocks.find((b) => b.name === "Pair Beast");
  assert.deepStrictEqual([pair.cues, pair.effects, pair.native, pair.noHook], [1, 1, 1, 0]);
  assert.deepStrictEqual([pair.attackMods, pair.bestHitEv, pair.damageTypes], [[5], 5.5, ["keen"]]);
  assert.deepStrictEqual(r.soleConsumers, [{ type: "edha-only-here", blocks: ["Pair Beast"] }]);
  assert.deepStrictEqual(r.totals.noHook, 1);
  assert.deepStrictEqual(r.statuses.map((s) => [s.id, s.kind]), [["frightened", "unknown"], ["slowed", "canon"]]);
  assert.strictEqual(r.bands.rival.hitEv.avg, 5.5);
  assert.strictEqual(r.totals.talents, 1);
});

test("bestiary-census: the live data has every block in a role band with a senses and a movement source", () => {
  const ctx = c.loadContext();
  const r = c.census(ctx.data, ctx);
  assert.ok(r.totals.blocks >= 52, `expected the 52 blocks of 2026-09-14 or more, got ${r.totals.blocks}`);
  for (const b of r.blocks) {
    assert.ok(["minion", "rival", "boss"].includes(b.role), `${b.name}: role ${b.role}`);
    assert.ok(Number.isFinite(b.sensesFt) && Number.isFinite(b.walkFt), `${b.name}: senses/movement`);
    assert.ok(Number.isFinite(b.hp), `${b.name}: hp`);
  }
  assert.deepStrictEqual(r.unparsedDamage, [], "every damage string parses — extend parseDamage if a new shape ships");
});

test("bestiary-census: docs/analysis/bestiary/CENSUS.md is in sync with the data (fix: node scripts/bestiary-census.js --write)", () => {
  const committed = fs.existsSync(c.REPORT_PATH) ? fs.readFileSync(c.REPORT_PATH, "utf8") : "";
  assert.strictEqual(committed, c.freshReport(),
    "docs/analysis/bestiary/CENSUS.md is stale against data/adversaries.json or data/authored/ — run `node scripts/bestiary-census.js --write` and commit the report with the data change");
});
