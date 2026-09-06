/* REGRESSION — R-36: Temp HP keeps the higher VALUE, so it must keep that value's NAME too.
 * (EDHA_RULINGS.md R-36, answered 2026-09-06 (a); TODO_REPO_HYGIENE #47, fix pass 7a.)
 *
 * `edhaGrantTempHpCross` is the keeps-higher granter every THP surface routes through (Bulwark,
 * Bear Witness, Final Decree, Death Ward, Investiture of Command, the Bonds-of-Community rally
 * zone, the Vital Surge offer button…). It computed `final = max(held, incoming)` and then wrote
 * `{ value: final, source: <the INCOMING source> }` unconditionally — so a grant that LOST the
 * comparison still relabelled the survivor. Measured at 3B-D: an ally holding 6 from Final Decree
 * read "Bear Witness" after a 4 landed, and a 99-THP ally read "Investiture of Command".
 *
 * That is worse than a wrong number: the number was right, and the attribution — which is what a
 * player reads to know whose grant it is and when it expires — lied.
 *
 * BOTH DIRECTIONS, every case. A fix that simply never relabelled would pass a one-sided
 * "the survivor keeps its name" suite while freezing the first grant's label forever, so each
 * block pairs the loser that must NOT relabel with the winner that MUST.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, eq } = require("./harness.js");

/* An actor that OWNS itself (the direct `edhaWriteTempHp` branch) and exposes the stored flag. */
function thpActor(name, tempHp = null) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, flags: tempHp ? { tempHp } : {} });
  a.isOwner = true;
  return a;
}
const held = (a) => a.getFlag("edha-content", "tempHp") ?? null;

test("R-36: a LOSING grant changes neither the value nor the source", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally", { value: 6, source: "Final Decree" });

  await env.edhaGrantTempHpCross(ally, 4, "Bear Witness");

  eq(held(ally), { value: 6, source: "Final Decree" });   // the reported case, verbatim
});

test("R-36: the 99-THP case — a big survivor is not relabelled by a small grant", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally", { value: 99, source: "Sovereign's Favor" });

  await env.edhaGrantTempHpCross(ally, 2, "Investiture of Command");

  eq(held(ally), { value: 99, source: "Sovereign's Favor" });
});

test("R-36 THE OTHER DIRECTION: a WINNING grant replaces the value AND relabels", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally", { value: 6, source: "Final Decree" });

  await env.edhaGrantTempHpCross(ally, 7, "Bear Witness");

  eq(held(ally), { value: 7, source: "Bear Witness" });
});

test("R-36: a TIE is not a win — the incumbent keeps its name", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally", { value: 5, source: "Final Decree" });

  await env.edhaGrantTempHpCross(ally, 5, "Bear Witness");

  eq(held(ally), { value: 5, source: "Final Decree" });
});

test("R-36: the FIRST grant on a creature with no Temp HP always labels itself", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally");

  await env.edhaGrantTempHpCross(ally, 3, "Bulwark Ground");

  eq(held(ally), { value: 3, source: "Bulwark Ground" });
});

test("R-36: a 0-value grant on an empty creature writes nothing (edhaWriteTempHp unsets at <= 0)", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally");

  await env.edhaGrantTempHpCross(ally, 0, "Bear Witness");

  assert.strictEqual(held(ally), null, "no phantom 0-THP grant, and no phantom label");
});

/* The RELAY half. A player rarely owns the ally they are granting to, so the unowned branch goes
 * through edhaSetEdhaFlag's socket emit — and it carries its own copy of the payload, which is how
 * a fix applied to only one branch would ship half-done. */
test("R-36: the unowned RELAY payload carries the same kept value AND the same kept source", async () => {
  const env = loadEngine();
  const ally = thpActor("Ally", { value: 6, source: "Final Decree" });
  ally.isOwner = false;

  const emitted = [];
  const undo = stageWorld(env, { user: { isGM: false, id: "p1" }, users: { activeGM: { isSelf: false } } }).undo;
  const priorSocket = env.game.socket;
  env.game.socket = { on() {}, emit: (ch, data) => emitted.push({ ch, data }) };
  try {
    await env.edhaGrantTempHpCross(ally, 4, "Bear Witness");
    assert.strictEqual(emitted.length, 1, "the unowned branch relays");
    eq(emitted[0].data.payload.value, { value: 6, source: "Final Decree" });

    await env.edhaGrantTempHpCross(ally, 8, "Bear Witness");
    eq(emitted[1].data.payload.value, { value: 8, source: "Bear Witness" });   // …and still relabels on a win
  } finally { env.game.socket = priorSocket; undo(); }
});
