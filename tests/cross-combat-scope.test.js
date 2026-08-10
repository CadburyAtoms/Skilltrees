/* REGRESSION — ending ONE combat must not clear state on an actor fighting in ANOTHER
 * (bench run 23, 2026-07-28l → fix pass F). This one is about player DATA LOSS.
 *
 * WHAT WAS OBSERVED. Deleting a bench combat cleared `lists.covenants` off an Order actor that was
 * a combatant in a different, still-running combat. `deleteCombat` is a per-combat event, but ~20
 * of the engine's scene-reset sweeps ignored the combat they were handed and iterated the WORLD
 * (`game.actors`, `canvas.tokens.placeables`). With one combat in play that is correct; with two,
 * the end of one encounter silently deletes the other's live ledgers. The turn-cue sweep had the
 * same shape and stamped `trigRound` onto campaign actors from a bench combat's turn ticks
 * (runs 19/20).
 *
 * THE INVARIANT PINNED HERE — and note it is NOT "sweep only this combat's combatants". The wide
 * enumeration is deliberate and is itself pinned by tests/temphp-scene-reset.test.js (a token-only
 * NON-combatant must still be swept). What must hold is only:
 *
 *      ending combat A must not clear state on an actor that is a combatant in a
 *      different, still-existing combat B.
 *
 * so single-combat play is unchanged. Both directions are asserted in every case below: the actor
 * in the ENDED combat still clears (the positive control — a guard that skipped everyone would
 * pass a one-sided test), and the actor in the LIVE combat is untouched (the negative control).
 *
 * MUTATION-VERIFIED: deleting the `edhaStillFightingElsewhere` line from edhaClearOrderState fails
 * case 1's negative half, and emptying edhaCombatEndGuard's returned Set fails every negative half
 * while leaving every positive half green.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, sleep } = require("./harness.js");

function makeActor({ name, type = "character", flags = {} }) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type, flags });
  return Object.assign(a, {
    async toggleStatusEffect() {}, async deleteEmbeddedDocuments() {},
    getActiveTokens: () => [], getRollData: () => ({}),
  });
}
const combatOf = (id, actors) => ({ id, started: true, combatants: actors.map(a => ({ actorId: a.id, actor: a })), turns: [] });

/* Fire every registered deleteCombat hook for `ended`, with `others` still in game.combats. */
async function endCombat(env, { ended, others, actors, tokenActors = [] }) {
  const { undo } = stageWorld(env, {
    user: { isGM: true }, users: null,
    actors,
    placeables: tokenActors.map(a => ({ actor: a, document: {} })),
    scenes: Object.assign([], { current: null }),
    combats: Object.assign([...others], { active: others[0] ?? null }),
  });
  env.game.combat = others[0] ?? null;

  for (const h of env.__hooks.on.filter(x => x.name === "deleteCombat")) {
    try { await h.fn(ended, {}, "user"); } catch (e) { /* sibling sweeps may want richer stubs */ }
  }
  await sleep(0);   // flush the void-fired unsets
  undo();
}

test("Order covenants: the ended combat's actor clears, the LIVE combat's actor keeps its ledger", async () => {
  const env = loadEngine();
  const benched = makeActor({ name: "Bench — Order", flags: { lists: { covenants: [{ id: "c1" }] } } });
  const campaign = makeActor({ name: "Corvaine", flags: { lists: { covenants: [{ id: "c9" }] } } });
  const ended = combatOf("benchCombat", [benched]);
  const live = combatOf("bensCombat", [campaign]);

  await endCombat(env, { ended, others: [live], actors: [benched, campaign] });

  assert.strictEqual(benched.getFlag("edha-content", "lists.covenants"), undefined,
    "POSITIVE CONTROL: the ended combat's own actor must still be swept");
  assert.deepStrictEqual(campaign.getFlag("edha-content", "lists.covenants"), [{ id: "c9" }],
    "NEGATIVE CONTROL: an actor fighting in another live combat must keep its covenant ledger");
});

test("trigRound / sceneOnce: the same split (this is what landed keys on campaign actors)", async () => {
  const env = loadEngine();
  const benched = makeActor({ name: "Bench — Heroic", flags: { trigRound: { Foresight: 2 }, sceneOnce: { abc: true } } });
  const campaign = makeActor({ name: "Stonebound Captain", flags: { trigRound: { Foresight: 1 }, sceneOnce: { xyz: true } } });
  const ended = combatOf("benchCombat", [benched]);
  const live = combatOf("bensCombat", [campaign]);

  await endCombat(env, { ended, others: [live], actors: [benched, campaign] });

  assert.strictEqual(benched.getFlag("edha-content", "trigRound"), undefined, "POSITIVE: ended combat's actor clears trigRound");
  assert.strictEqual(benched.getFlag("edha-content", "sceneOnce"), undefined, "POSITIVE: ended combat's actor clears sceneOnce");
  assert.deepStrictEqual(campaign.getFlag("edha-content", "trigRound"), { Foresight: 1 }, "NEGATIVE: live combat's actor keeps trigRound");
  assert.deepStrictEqual(campaign.getFlag("edha-content", "sceneOnce"), { xyz: true }, "NEGATIVE: live combat's actor keeps sceneOnce");
});

test("tempHp: a NON-combatant is still swept — the wide enumeration must survive the guard", async () => {
  const env = loadEngine();
  const benched = makeActor({ name: "Bench — White", flags: { tempHp: { value: 2, source: "Bulwark" } } });
  const bystander = makeActor({ name: "Unlinked Token", type: "adversary", flags: { tempHp: { value: 15, source: "Favor" } } });
  const campaign = makeActor({ name: "Corvaine", flags: { tempHp: { value: 3, source: "Edict" } } });
  const ended = combatOf("benchCombat", [benched]);
  const live = combatOf("bensCombat", [campaign]);

  await endCombat(env, { ended, others: [live], actors: [benched, campaign], tokenActors: [bystander] });

  assert.strictEqual(benched.getFlag("edha-content", "tempHp"), undefined, "POSITIVE: the ended combat's actor clears");
  assert.strictEqual(bystander.getFlag("edha-content", "tempHp"), undefined,
    "POSITIVE: a token actor in NO combat still clears — narrowing to combat.combatants would break this");
  assert.deepStrictEqual(campaign.getFlag("edha-content", "tempHp"), { value: 3, source: "Edict" },
    "NEGATIVE: the live combat's actor keeps its Temp HP");
});

test("with NO other combat, the sweep is world-wide exactly as before", async () => {
  const env = loadEngine();
  const a = makeActor({ name: "PC A", flags: { lists: { covenants: [{ id: "c1" }] }, trigRound: { X: 1 }, tempHp: { value: 2 } } });
  const b = makeActor({ name: "PC B", flags: { lists: { covenants: [{ id: "c2" }] }, trigRound: { Y: 1 }, tempHp: { value: 4 } } });
  const ended = combatOf("theOnlyCombat", [a]);

  await endCombat(env, { ended, others: [], actors: [a, b] });

  for (const [who, act] of [["the combatant", a], ["the non-combatant", b]]) {
    assert.strictEqual(act.getFlag("edha-content", "lists.covenants"), undefined, `single-combat play unchanged for ${who} (covenants)`);
    assert.strictEqual(act.getFlag("edha-content", "trigRound"), undefined, `single-combat play unchanged for ${who} (trigRound)`);
    assert.strictEqual(act.getFlag("edha-content", "tempHp"), undefined, `single-combat play unchanged for ${who} (tempHp)`);
  }
});

test("edhaCombatEndGuard ignores the combat that just ended, and matches by id or uuid", () => {
  const env = loadEngine();
  const inEnded = makeActor({ name: "ended-side" });
  const inLive = makeActor({ name: "live-side" });
  const ended = combatOf("A", [inEnded]);
  env.game.combats = [ended, combatOf("B", [inLive])];

  const guard = env.edhaCombatEndGuard(ended);
  assert.strictEqual(env.edhaStillFightingElsewhere(inEnded, guard), false, "the ended combat is not 'elsewhere'");
  assert.strictEqual(env.edhaStillFightingElsewhere(inLive, guard), true, "a combatant of the other combat is");
  assert.strictEqual(env.edhaStillFightingElsewhere({ id: "nobody", uuid: "Actor.nobody" }, guard), false, "an uninvolved actor is not");
  assert.strictEqual(env.edhaStillFightingElsewhere(null, guard), false, "null actor is safe");

  env.game.combats = [];
  const empty = env.edhaCombatEndGuard(ended);
  assert.strictEqual(empty.size, 0, "no other combats → empty guard → world-wide sweep, as before");
  assert.strictEqual(env.edhaStillFightingElsewhere(inLive, empty), false, "an empty guard never skips");
});
