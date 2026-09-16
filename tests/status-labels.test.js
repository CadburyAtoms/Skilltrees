/* item 171 (fix pass 13, 2026-09-15) — a CONDITION's label names the condition, never a talent.
 *
 * Bench run 49a read Blue's False Premise success card verbatim: "False Premise — Bench Target —
 * Adjacent A is No Reactions (Extract Thought) ." The label comes from the status registry
 * (`EDHA_STATUSES`, module-src/scripts/engine/01-shared-core.js), written 07-05 when Black's Extract
 * Thought was the only `noreactions` applier. Item 107 / R-115 (a) made False Premise a second
 * applier, and from then on every False Premise card, the token's status tooltip and the effect's
 * name all named a Black talent. `noactions` carried the same "(Hollow Command)" suffix.
 *
 * The cases read the three places a label reaches the table — `CONFIG.COSMERE.statuses`, the
 * `CONFIG.statusEffects` entry the token HUD and `toggleStatusEffect` use, and `edhaConditionLabel`,
 * the one door an id takes into card text — and then guard the class: no `condition: true` status
 * may name a tree talent, because a condition is exactly the kind of status a second talent can apply.
 *
 * Reversion: put "No Reactions (Extract Thought)" back in the registry and both cases fail, the
 * second one naming the talent.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { loadEngine } = require("./harness.js");

function registered() {
  const env = loadEngine();
  env.CONFIG.COSMERE = { statuses: {} };
  env.CONFIG.statusEffects = [];
  assert.strictEqual(env.edhaRegisterStatuses("test"), true, "the status registry did not register");
  return env;
}

test("item 171: noreactions / noactions are labelled by the condition alone (registry, token HUD entry, card label)", () => {
  const env = registered();
  for (const [id, label] of [["noreactions", "No Reactions"], ["noactions", "Cannot Act"]]) {
    assert.strictEqual(env.CONFIG.COSMERE.statuses[id].label, label, `CONFIG.COSMERE.statuses.${id}.label`);
    const fx = env.CONFIG.statusEffects.find((s) => s.id === id);
    assert.ok(fx, `${id} is missing from CONFIG.statusEffects`);
    assert.strictEqual(fx.name, label, `the token HUD / effect name for ${id}`);
    assert.strictEqual(env.edhaConditionLabel(id), label, `the card label for ${id}`);
  }
});

test("item 205: no Edha status label collides with a published condition name", () => {
  // item 205 (2026-09-16): Edha's status `diminished` (Sovereignty's damage-die step-down) was
  // labelled "Diminished" — a PUBLISHED condition (Mistborn Handbook Ch. 9 -> Conditions:
  // Diminished [attribute -X]). Renamed to `lessened` / "Lessened Die". This case guards the
  // whole class: none of the fifteen published conditions (`.claude/skills/
  // cosmere-canon-reference/SKILL.md` §Conditions) may ever be an Edha status's exact label.
  // Reversion: relabel `lessened` back to "Diminished" in EDHA_STATUSES and this case fails,
  // naming the collision.
  const env = registered();
  const PUBLISHED_CONDITIONS = new Set([
    "Afflicted", "Depleted", "Determined", "Diminished", "Disoriented", "Enhanced", "Exhausted",
    "Focused", "Immobilized", "Prone", "Restrained", "Slowed", "Stunned", "Surprised", "Unconscious",
  ]);
  const offenders = [];
  for (const [id, st] of Object.entries(env.CONFIG.COSMERE.statuses)) {
    if (PUBLISHED_CONDITIONS.has(String(st.label))) offenders.push(`${id}: label "${st.label}" is a published condition name`);
  }
  assert.deepStrictEqual(offenders, [], offenders.join("; "));
});

test("item 171: no CONDITION label names a tree talent", () => {
  const env = registered();
  const dir = path.join(__dirname, "..", "data", "authored");
  const names = new Set();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const n of Object.keys(j.talents || {})) names.add(n);
  }
  assert.ok(names.size > 100, `expected the authored talent roster, read ${names.size} names`);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const offenders = [];
  for (const fx of env.CONFIG.statusEffects) {
    const st = env.CONFIG.COSMERE.statuses[fx.id];
    if (!st || !st.condition) continue;
    for (const n of names) {
      if (new RegExp(`(^|[^A-Za-z])${esc(n)}([^A-Za-z]|$)`).test(String(st.label))) offenders.push(`${fx.id}: "${st.label}" names the talent "${n}"`);
    }
  }
  assert.deepStrictEqual(offenders, [], offenders.join("; "));
});
