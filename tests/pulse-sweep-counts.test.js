/* REGRESSION — R-32: the pulse's sweep card reports BOTH numbers — "swept N · newly <Status> M".
 * (EDHA_RULINGS.md R-32, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * `edhaRunPulse`'s status branch counted `applied` — every creature the sweep reached and was
 * ALLOWED to write to — and printed it as "affected N". `edhaToggleStatus` returns true whenever
 * the write was permitted, not whenever it changed anything, so a Black Draw Mana pulse over five
 * already-Weakened enemies reported "affected 5" and the board had not moved at all. The number
 * was never wrong; the WORD was. Intent and state are two facts and the card was printing one of
 * them under the other's name.
 *
 * So both go on the card, and both cards use the ruling's word: the public one and the GM's
 * behind-the-wall accounting whisper, which carried the same `applied` under the same "affected".
 *
 * The pulse's `edhaToggleStatus` call is NOT stubbed here — the enemies own themselves, so the
 * real owned branch runs and returns its real `true`. That matters: a suite that stubbed the
 * toggle to return "did it change" would prove a fix that was never made.
 *
 * Mutation: print `applied` alone again (drop `newlyNote`) and the first case fails — the card
 * reads "swept 5" with no "newly Weakened 0" to distinguish it from a pulse that landed.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, captureChat } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

function enemy(name, { weakened = false } = {}) {
  const a = mockActor({ name, id: name, statuses: weakened ? ["weakened"] : [], system: { resources: { hea: { value: 10 } } } });
  a.isOwner = true;                                       // the direct edhaToggleStatus branch
  a.toggled = [];
  a.toggleStatusEffect = async (id, { active } = {}) => { a.toggled.push({ id, active }); a.statuses.add(id); };
  return a;
}

/* Drive the shipped edhaRunPulse. Only the CANVAS is stubbed — the counting, the toggling and the
 * card text are the engine's own. */
async function pulse(env, enemies, { gmSkips = 0 } = {}) {
  const owner = mockActor({ name: "Bench — Black", id: "black" });
  owner.getRollData = () => ({ tier: 2 });
  const item = mockItem({ name: "Black Draw Mana", actor: owner });
  const ownTok = { id: "t0", center: { x: 0, y: 0 }, document: { disposition: 1 } };
  const toks = enemies.map((a, i) => ({ id: `t${i + 1}`, actor: a, document: { disposition: -1, hidden: false }, center: { x: 10 * i, y: 0 } }));
  // …plus `gmSkips` enemies the player cannot see, which is what opens the GM accounting whisper.
  const unseen = Array.from({ length: gmSkips }, (_, i) => ({ id: `h${i}`, actor: enemy(`Hidden ${i}`), document: { disposition: -1, hidden: true }, center: { x: 0, y: 50 } }));
  const cards = captureChat(env);
  const gmCards = [];
  const world = stageWorld(env, { actors: [owner], placeables: [ownTok, ...toks, ...unseen] });
  const prior = { tok: env.edhaCasterToken, ft: env.edhaAttuneFtColor, circ: env.edhaTokensInCircle, gm: env.edhaPostGmCard };
  env.edhaCasterToken = () => ownTok;
  env.edhaAttuneFtColor = () => 30;
  env.edhaTokensInCircle = () => [...toks, ...unseen];
  env.edhaPostGmCard = async (_o, html) => { gmCards.push(html); };
  try {
    await env.edhaRunPulse(item, { kind: "status", who: "enemies", statusId: "weakened", rangeColor: "black", visibleOnly: true });
    return { cards, gmCards };
  } finally { Object.assign(env, { edhaCasterToken: prior.tok, edhaAttuneFtColor: prior.ft, edhaTokensInCircle: prior.circ, edhaPostGmCard: prior.gm }); world.undo(); }
}

test("R-32: five ALREADY-Weakened enemies read 'swept 5 · newly Weakened 0'", async () => {
  const env = loadEngine();
  const { cards } = await pulse(env, Array.from({ length: 5 }, (_, i) => enemy(`Foe ${i}`, { weakened: true })));
  assert.strictEqual(cards.length, 1);
  const said = text(cards[0].content);
  assert.ok(said.includes("swept 5 · newly Weakened 0"), `the reported case: ${said}`);
  assert.ok(!said.includes("affected"), `the ambiguous word is back: ${said}`);
});

test("R-32: five FRESH enemies read 'swept 5 · newly Weakened 5' — the other end", async () => {
  const env = loadEngine();
  const { cards } = await pulse(env, Array.from({ length: 5 }, (_, i) => enemy(`Foe ${i}`)));
  assert.ok(text(cards[0].content).includes("swept 5 · newly Weakened 5"), text(cards[0].content));
});

test("R-32: a MIXED pulse separates the two numbers — 2 of 5 were fresh", async () => {
  const env = loadEngine();
  const { cards } = await pulse(env, [
    enemy("A", { weakened: true }), enemy("B", { weakened: true }), enemy("C", { weakened: true }),
    enemy("D"), enemy("E"),
  ]);
  const said = text(cards[0].content);
  assert.ok(said.includes("swept 5 · newly Weakened 2"), said);
  assert.ok(said.includes("of 5 enemies you can see within 30 ft"), `the visible-total clause survives: ${said}`);
});

test("R-32: the GM's behind-the-wall whisper carries the same pair, with the same word", async () => {
  const env = loadEngine();
  const { gmCards } = await pulse(env, Array.from({ length: 5 }, (_, i) => enemy(`Foe ${i}`, { weakened: true })), { gmSkips: 2 });
  assert.strictEqual(gmCards.length, 1, "the hidden enemies open the GM accounting card");
  const said = text(gmCards[0]);
  assert.ok(said.includes("swept 5 · newly Weakened 0"), said);
  assert.ok(said.includes("2 hidden"), `the skip accounting is untouched: ${said}`);
  assert.ok(!said.includes("affected"), `the ambiguous word is back on the GM card: ${said}`);
});

test("R-32: the toggle really does report success on an already-Weakened target — the root cause", async () => {
  // Pinned so nobody 'fixes' this by making edhaToggleStatus lie about what it did: its contract is
  // "was the write permitted", which every relay path depends on.
  const env = loadEngine();
  const foe = enemy("Foe", { weakened: true });
  assert.strictEqual(await env.edhaToggleStatus(foe, "weakened", true), true);
});
