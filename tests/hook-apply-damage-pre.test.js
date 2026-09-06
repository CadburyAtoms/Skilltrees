/* HOOK-LAYER COVERAGE — the applyDamage PRE pass (TODO item 5, behaviour 2 of 3).
 *
 * `cosmere-rpg.preApplyDamage` is the one place the engine may change how much damage the SYSTEM
 * is about to write to HP. It does it the only way the system offers: by mutating the `damage`
 * object it was handed, IN PLACE — `damage.calculated` is read back by the system after every
 * hook returns. That makes the by-reference mutation the actual write under test, and it makes
 * this hook uniquely easy to break silently: reassign the parameter instead of its field, or
 * `return false`, and Foundry applies the untouched original with no error anywhere.
 *
 * The consumer pinned here is Temp HP absorption (`edhaGetTempHp`/`edhaWriteTempHp` — a module
 * FLAG, not a system resource, spent before deflect and before real HP). Three writes happen per
 * absorbed hit and all three are asserted:
 *   1. `damage.calculated` — reduced by what Temp HP soaked (what the system then applies to HP),
 *   2. `flags.edha-content.tempHp` — the remaining pool, or UNSET once it is spent out,
 *   3. the chat card that tells the table what absorbed what.
 *
 * Note the deliberate asymmetry the cases pin: healing arrives as `calculated <= 0`, and Temp HP
 * must neither absorb it nor be replenished by it.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, stageWorld, captureChat, sleep, eq } = require("./harness.js");

const env = loadEngine();

function warded({ value, source = "Death Ward", name = "Bench — Life" } = {}) {
  return mockActor({ name, id: name, type: "character", flags: value === null ? {} : { tempHp: { value, source } } });
}

const tempHpOf = (actor) => actor.flags["edha-content"].tempHp;

/* Fire the real registered `cosmere-rpg.preApplyDamage` chain, then let the void-dispatched flag
 * write settle. Returns the damage object the SYSTEM would go on to apply. */
async function applyDamage(actor, calculated, extra = {}) {
  const cards = captureChat(env);
  const damage = { calculated, ...extra };
  const world = stageWorld(env, { user: { id: "gm", isGM: true }, users: { activeGM: { isSelf: true } }, actors: [actor] });
  try {
    await fireHook(env, "cosmere-rpg.preApplyDamage", actor, damage);
    await sleep(0);   // edhaWriteTempHp is `void`-dispatched; its setFlag lands a microtask later
  } finally { world.undo(); }
  return { damage, cards };
}

/* ---- 1. Absorption: what reaches HP, and what is left in the pool --------------------------- */

test("Temp HP soaks part of a hit: `damage.calculated` drops by exactly what it absorbed", async () => {
  const actor = warded({ value: 5 });
  const { damage } = await applyDamage(actor, 8);
  assert.strictEqual(damage.calculated, 3,
    "8 in, 5 absorbed, 3 out — the system reads this field back BY REFERENCE after the hook returns");
});

test("...and any hit that BREAKS THROUGH necessarily empties the pool", async () => {
  const actor = warded({ value: 5 });
  await applyDamage(actor, 8);
  assert.strictEqual(tempHpOf(actor), undefined,
    "the two outcomes are exclusive by construction: damage reaches HP only once the pool is spent " +
    "out, so 'some carried through' and 'some pool remains' can never both be true after one hit");
});

test("a hit SMALLER than the pool is fully absorbed and leaves the remainder standing", async () => {
  const actor = warded({ value: 9 });
  const { damage } = await applyDamage(actor, 4);
  assert.strictEqual(damage.calculated, 0, "nothing carries through to HP");
  // `eq`, not deepStrictEqual: the flag object is built inside the vm realm.
  eq(tempHpOf(actor), { value: 5, source: "Death Ward" });   // the source rides the write — a
                                 // re-grant must not silently relabel whose ward this is.
});

/* ---- 2. Spending the pool out UNSETS the flag ----------------------------------------------- */

test("spending Temp HP to exactly zero UNSETS the flag rather than storing a zero", async () => {
  const actor = warded({ value: 4 });
  const { damage } = await applyDamage(actor, 4);
  assert.strictEqual(damage.calculated, 0);
  await sleep(0);
  assert.strictEqual(tempHpOf(actor), undefined,
    "a `{value: 0}` husk is a live flag that later reads as 'has Temp HP' — the write must remove it");
});

test("a second hit after the pool is gone is untouched — no negative absorption", async () => {
  const actor = warded({ value: 4 });
  await applyDamage(actor, 4);
  await sleep(0);
  const { damage, cards } = await applyDamage(actor, 6);
  assert.strictEqual(damage.calculated, 6, "with no pool the hook must be a no-op, not a reduction of 0 that still cards");
  assert.strictEqual(cards.length, 0);
});

/* ---- 3. The card ---------------------------------------------------------------------------- */

test("the absorption posts one card naming the amounts, spoken by the absorbing actor", async () => {
  const actor = warded({ value: 5 });
  const { cards } = await applyDamage(actor, 8);
  assert.strictEqual(cards.length, 1);
  assert.strictEqual(cards[0].owner, "Bench — Life");
  assert.ok(/absorbs <strong>5<\/strong> of 8 damage/.test(cards[0].content),
    "the card must state absorbed-of-incoming; 'Temp HP absorbed some' is not a table-readable number");
  assert.ok(/<strong>3<\/strong> carries through to HP/.test(cards[0].content));
  assert.ok(/Temp HP depleted/.test(cards[0].content), "5 of 5 spent — the table needs to know the ward is gone");
});

test("a fully-absorbed hit reports the leftover pool instead of 'depleted'", async () => {
  const actor = warded({ value: 9 });
  const { cards } = await applyDamage(actor, 4);
  assert.ok(/5 Temp HP left/.test(cards[0].content));
  assert.ok(!/carries through to HP/.test(cards[0].content), "nothing reached HP, so nothing should claim it did");
});

/* ---- 4. What must NOT be touched ------------------------------------------------------------ */

test("HEALING (calculated <= 0) never touches Temp HP and never replenishes it", async () => {
  for (const incoming of [0, -6]) {
    const actor = warded({ value: 5 });
    const { damage, cards } = await applyDamage(actor, incoming);
    assert.strictEqual(damage.calculated, incoming, `healing of ${incoming} must pass through unchanged`);
    eq(tempHpOf(actor), { value: 5, source: "Death Ward" });   // spent by damage only — healing into
      // the pool would make a ward permanent.
    assert.strictEqual(cards.length, 0);
  }
});

test("an actor with NO Temp HP is left completely alone", async () => {
  const actor = warded({ value: null });
  const { damage, cards } = await applyDamage(actor, 7);
  assert.strictEqual(damage.calculated, 7);
  assert.strictEqual(tempHpOf(actor), undefined);
  assert.strictEqual(cards.length, 0);
});

test("a stale `{value: 0}` pool is treated as no pool (edhaGetTempHp's floor), and is not carded", async () => {
  const actor = warded({ value: 0 });
  const { damage, cards } = await applyDamage(actor, 7);
  assert.strictEqual(damage.calculated, 7);
  assert.strictEqual(cards.length, 0, "a zero pool absorbing 0 damage would card every single hit");
});

test("the hook returns nothing falsy that would CANCEL the damage application", async () => {
  const actor = warded({ value: 5 });
  const cards = captureChat(env);
  const world = stageWorld(env, { user: { id: "gm", isGM: true }, users: { activeGM: { isSelf: true } }, actors: [actor] });
  let results;
  try {
    results = await fireHook(env, "cosmere-rpg.preApplyDamage", actor, { calculated: 8 });
    await sleep(0);
  } finally { world.undo(); }
  assert.ok(!results.includes(false),
    "returning false here would cancel the WHOLE application — the remainder must still reach HP " +
    "(the header says so in as many words: 'Do NOT return false')");
  assert.strictEqual(cards.length, 1);
});

/* ---- 5. Fractions and oversized hits -------------------------------------------------------- */

test("the pool floors to a whole number on write (no fractional Temp HP)", async () => {
  const actor = warded({ value: 5 });
  const { damage } = await applyDamage(actor, 2.5);
  assert.strictEqual(damage.calculated, 0, "2.5 is fully inside a 5-point pool");
  eq(tempHpOf(actor), { value: 2, source: "Death Ward" });   // 5 − 2.5 = 2.5, FLOORED to 2 — the
    // flag is an integer pool, and half a point is not spendable.
});

test("a hit far larger than the pool absorbs only what is there", async () => {
  const actor = warded({ value: 2 });
  const { damage } = await applyDamage(actor, 40);
  assert.strictEqual(damage.calculated, 38);
  await sleep(0);
  assert.strictEqual(tempHpOf(actor), undefined);
});
