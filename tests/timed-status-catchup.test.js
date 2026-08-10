/* REGRESSION — a rule that authors `timed: true` produced an IMMORTAL status whenever it was used
 * outside a running combat (reported as "Brace never expires", bench run 20 2026-07-28f;
 * root-caused differently and fixed 2026-07-28g, fix pass D).
 *
 * ⚠️ THE REPORT'S MECHANISM WAS WRONG, and following it would have shipped the wrong fix. The run
 * concluded "`EDHA_TIMED_STATUSES` omits `braced`, so no `expireAfter` is ever stamped". But
 * `edhaApplyTimedStatus` — which is what `edha-self-status {timed: true}` actually calls — stamps
 * EXPLICITLY and never consults that Set. The real hole is the guard around that stamp:
 *     if (expire && game.combat?.started) { … edhaCombatantTurnIndex(…) … }
 * No started combat (or a creature not in THAT combat) → the status lands with NO coordinate. The
 * turn-change catch-up pass then had to rescue it, and THAT pass keyed on `EDHA_TIMED_STATUSES` —
 * which `braced` is deliberately not in, because the Frostbinder's Predictive Ward is a PERMANENT
 * `braced`. So the status was never stamped and never caught up: immortal. Brace before initiative
 * is the ordinary table case.
 *
 * IT IS A FAMILY, NOT ONE STATUS. Auditing the whole allowlist against what authored rules actually
 * mark timed: SEVEN shipped rules across FIVE status ids ride the explicit stamp alone —
 * `braced` (×2), `tagged`, `unstoppable`, `compelled`, `disoriented`. Adding them to
 * EDHA_TIMED_STATUSES would be a category error: that Set means "auto-expire HOWEVER applied,
 * including a GM hand-toggling the icon", and each of these five also has a legitimate untimed life.
 *
 * THE FIX keys on what the RULE ASKED FOR: when the applier cannot stamp, it records a
 * `timedExpire` intent on the effect, and the catch-up pass honours the intent. Predictive Ward is
 * safe BY CONSTRUCTION, not by coincidence — it is a `transfer: true` AE on the item, it never goes
 * through `edhaApplyTimedStatus`, so it carries no intent. The last two cases pin that directly.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockEffect, captureChat } = require("./harness.js");

/* ⚠ STRICTNESS FIX: the original local getFlag here was FLAT (`this.flags[scope]?.[key]`), not
 * dotted-path. None of this file's keys ("expireAfter", "timedExpire") contain a dot, so
 * mockEffect's dotted getFlag/setFlag/unsetFlag are behavior-identical for every case below —
 * confirmed by the full suite staying green after the swap. */
function makeEffect(name, statusId, flags = {}) {
  return mockEffect({ name, id: `eff-${statusId}`, statusId, flags });
}

function makeActor(name, effects = [], { isToken = false, id = name } = {}) {
  const list = effects.slice();
  const actor = mockActor({ name, id, uuid: `Actor.${id}`, effects: list });
  actor.isToken = isToken;
  actor.isOwner = true;
  actor.token = isToken ? { id: `tok-${id}` } : null;
  Object.assign(actor.effects, { get: (eid) => list.find(e => e.id === eid) });
  actor.toggleStatusEffect = async (statusId) => {
    if (!list.some(e => e.statuses.has(statusId))) list.push(makeEffect(statusId, statusId));
    return true;
  };
  return actor;
}

function makeCombat(actors, { round = 1, turn = 0, started = true } = {}) {
  return { started, round, turn, turns: actors.map(a => ({ actor: a, actorId: a.id, tokenId: a.token?.id ?? null })) };
}

/* ---- 1. the pure decision ---------------------------------------------------------------------- */

test("edhaTimedStampPlan: intent wins, allowlist is the fallback, neither means LEAVE IT ALONE", () => {
  const env = loadEngine();
  const f = env.edhaTimedStampPlan;

  const fromIntent = f({ expire: "owner", ownerUuid: "Actor.Trooper" }, false);
  assert.strictEqual(fromIntent.expire, "owner");
  assert.strictEqual(fromIntent.ownerUuid, "Actor.Trooper");
  assert.strictEqual(fromIntent.fromIntent, true, "an intent must be consumed after it is honoured");

  const fromList = f(undefined, true);
  assert.strictEqual(fromList.expire, "target", "an allowlisted status expires on the CARRIER's turn");
  assert.strictEqual(fromList.fromIntent, false);

  assert.strictEqual(f(undefined, false), null,
    "no intent + not allowlisted = Predictive Ward. Never stamp it.");
  assert.strictEqual(f(null, false), null);
});

/* ---- 2. the applier records intent when it cannot stamp ---------------------------------------- */

test("Brace used OUT of combat records the intent instead of silently doing nothing", async () => {
  const env = loadEngine();
  const trooper = makeActor("Trooper");
  env.game.combat = null;                                  // no combat: initiative not rolled yet

  await env.edhaApplyTimedStatus(trooper, "braced", { owner: trooper, expire: "owner" });

  const eff = trooper.effects.find(e => e.statuses.has("braced"));
  assert.ok(eff, "the status must still land");
  assert.strictEqual(eff.getFlag("edha-content", "expireAfter"), undefined, "no combat = no coordinate yet");
  const intent = eff.getFlag("edha-content", "timedExpire");
  assert.ok(intent, "the rule's `timed: true` must be recorded — without this the status is immortal");
  assert.strictEqual(intent.expire, "owner");
  assert.strictEqual(intent.ownerUuid, "Actor.Trooper");
});

test("POSITIVE CONTROL — Brace used INSIDE combat still stamps directly, with no intent left over", async () => {
  const env = loadEngine();
  const trooper = makeActor("Trooper");
  env.game.combat = makeCombat([makeActor("Other"), trooper], { round: 2, turn: 1 });

  await env.edhaApplyTimedStatus(trooper, "braced", { owner: trooper, expire: "owner" });

  const eff = trooper.effects.find(e => e.statuses.has("braced"));
  assert.deepStrictEqual({ ...eff.getFlag("edha-content", "expireAfter") }, { round: 3, turn: 1 },
    "used on its own turn (r2 t1) → end of its turn NEXT round");
  assert.strictEqual(eff.getFlag("edha-content", "timedExpire"), undefined, "no intent needed — it stamped");
});

/* ---- 3. the catch-up pass ---------------------------------------------------------------------- */

test("the turn-change pass stamps an intent-carrying status, then expires it", async () => {
  const env = loadEngine();
  const eff = makeEffect("Braced (attacks at disadvantage)", "braced", { timedExpire: { expire: "owner", ownerUuid: "Actor.Trooper" } });
  const trooper = makeActor("Trooper", [eff]);
  env.fromUuid = async (u) => (u === "Actor.Trooper" ? trooper : null);
  captureChat(env);

  await env.edhaExpireTimedStatuses(makeCombat([makeActor("Other"), trooper], { round: 2, turn: 1 }));
  assert.deepStrictEqual({ ...eff.getFlag("edha-content", "expireAfter") }, { round: 3, turn: 1 },
    "caught up on the first turn change — the bug left this undefined forever");
  assert.strictEqual(eff.getFlag("edha-content", "timedExpire"), undefined, "the intent is consumed");

  const cards = captureChat(env);
  await env.edhaExpireTimedStatuses(makeCombat([makeActor("Other"), trooper], { round: 4, turn: 1 }));
  assert.strictEqual(eff.deleted, true, "and then it actually ends — Brace was immortal");
  assert.ok(/ends \(end of its turn\)/.test(cards.map(c => c.content).join("")));
});

test("an owner-relative intent expires on the OWNER's turn, not the carrier's", async () => {
  const env = loadEngine();
  const eff = makeEffect("Compelled", "compelled", { timedExpire: { expire: "owner", ownerUuid: "Actor.Tyrant" } });
  const victim = makeActor("Victim", [eff], { id: "Victim" });
  const tyrant = makeActor("Tyrant", [], { id: "Tyrant" });
  env.fromUuid = async (u) => (u === "Actor.Tyrant" ? tyrant : null);
  captureChat(env);

  // turn order: [Tyrant(0), Victim(1)]; we are at r5 t1 (the victim's turn).
  await env.edhaExpireTimedStatuses(makeCombat([tyrant, victim], { round: 5, turn: 1 }));
  assert.deepStrictEqual({ ...eff.getFlag("edha-content", "expireAfter") }, { round: 6, turn: 0 },
    "the OWNER is combatant 0 — the coordinate must be the tyrant's next turn, not the victim's");
});

test("POSITIVE CONTROL — an allowlisted status with no intent is still lazily stamped", async () => {
  const env = loadEngine();
  const eff = makeEffect("Slowed", "slowed");
  const victim = makeActor("Victim", [eff]);
  captureChat(env);

  await env.edhaExpireTimedStatuses(makeCombat([victim], { round: 3, turn: 0 }));
  assert.deepStrictEqual({ ...eff.getFlag("edha-content", "expireAfter") }, { round: 4, turn: 0 },
    "the pre-existing allowlist path must be untouched — this is the control the bench run measured");
});

/* ---- 4. Predictive Ward must not move ---------------------------------------------------------- */

test("NEGATIVE CONTROL — a `braced` with no intent (Predictive Ward) is never stamped or expired", async () => {
  const env = loadEngine();
  const ward = makeEffect("Predictive Ward — Attacks against have 1 disadvantage", "braced");
  const frostbinder = makeActor("Frostbinder", [ward]);
  captureChat(env);

  for (const r of [1, 2, 3, 9]) await env.edhaExpireTimedStatuses(makeCombat([frostbinder], { round: r, turn: 0 }));

  assert.strictEqual(ward.getFlag("edha-content", "expireAfter"), undefined,
    "the permanent ward must never acquire a coordinate — adding `braced` to EDHA_TIMED_STATUSES would have given it one");
  assert.strictEqual(ward.deleted, false, "…and must never be deleted");
});

test("the five timed status ids stay OUT of EDHA_TIMED_STATUSES on purpose", () => {
  const env = loadEngine();
  const onList = (id) => env.edhaIsTimedStatus({ statuses: [id] });   // the Set is a `const`, not a context property
  for (const id of ["braced", "tagged", "unstoppable", "compelled", "disoriented"]) {
    assert.ok(!onList(id),
      `${id} must NOT be in EDHA_TIMED_STATUSES — each has a legitimate untimed life; the timed ones ` +
      "carry a `timedExpire` intent instead. Adding it here is the fix that looks right and is not.");
  }
  for (const id of ["weakened", "immobilized", "slowed", "noactions", "noreactions"]) {
    assert.ok(onList(id), `${id} is auto-timed however it is applied — it must stay on the allowlist`);
  }
});
