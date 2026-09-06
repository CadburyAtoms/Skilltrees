/* REGRESSION — R-31: a PC's own Phantom Double token is labelled "(Illusion)"; an adversary's
 * veiled copy keeps its plain name.
 * (EDHA_RULINGS.md R-31, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * The copy-token spawner has always made TWO names: the ACTOR is "<X> (Illusion)" (so the sidebar
 * and the GM can tell the decoy apart) while the TOKEN carried the plain name — deliberately, and
 * for one reason: a fooled onlooker must not be able to read the answer off the canvas. That is
 * The Seeming's whole mechanic.
 *
 * But no veil applies in the PC direction. When a player casts Phantom Double there is nobody at
 * the table the token label is hiding from — the belief tests are rolled by the engine against
 * enemies, and the only person reading the label is the player who now has two identical tokens
 * and no way to tell which one is theirs. So: an adversary's copy stays veiled, a CHARACTER's
 * copy is labelled.
 *
 * The discriminator is the CASTER's `type` — a document property, not a talent name (iron rule
 * 2b), so the Mistheron and any future adversary Seeming inherit the veil for free and no rename
 * of either talent can unwire it.
 *
 * Mutation: drop the `caster?.type === "character"` conditional (back to the bare
 * `dupTok?.name ?? dup.name`) and the first case fails — "Tem parinaem" where
 * "Tem parinaem (Illusion)" is expected.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, captureChat } = require("./harness.js");

/* Drive the REAL spawner and capture the spec it hands edhaSummon — that spec IS what becomes the
 * prototype token, so the label under test is the shipped one, not a re-derivation. */
async function castCopy(env, { casterType, casterName, dupName, tokenName }) {
  const caster = mockActor({ name: casterName, id: casterName, type: casterType, system: { defenses: { cog: { value: 13 } } } });
  const dup = mockActor({ name: dupName, id: dupName, type: casterType });
  const spec = [];
  const world = stageWorld(env, { actors: [], placeables: [] });
  const prior = { summon: env.edhaSummon, art: env.edhaTokenArt, tok: env.edhaCasterToken };
  captureChat(env);
  env.edhaSummon = async (_owner, s) => { spec.push(s); };
  env.edhaTokenArt = () => "icons/svg/mystery-man.svg";
  env.edhaCasterToken = (a) => (a === dup
    ? { name: tokenName, document: { uuid: "Scene.s1.Token.t1", displayName: 20, disposition: -1 } }
    : { document: { uuid: "Scene.s1.Token.t9" } });
  try {
    await env.edhaCastPhantomDouble(caster, dup, { source: "Phantom Double" });
    return spec[0];
  } finally { Object.assign(env, { edhaSummon: prior.summon, edhaTokenArt: prior.art, edhaCasterToken: prior.tok }); world.undo(); }
}

test("R-31: a CHARACTER's copy — the token is labelled (Illusion)", async () => {
  const env = loadEngine();
  const spec = await castCopy(env, { casterType: "character", casterName: "Tem parinaem", dupName: "Tem parinaem", tokenName: "Tem parinaem" });
  assert.strictEqual(spec.tokenName, "Tem parinaem (Illusion)");
  assert.strictEqual(spec.name, "Tem parinaem (Illusion)", "the ACTOR label was already right and must not move");
});

test("R-31: the Mistheron's veiled copy keeps its PLAIN name — the Seeming is unchanged", async () => {
  const env = loadEngine();
  const spec = await castCopy(env, { casterType: "npc", casterName: "Mistheron", dupName: "Mistheron", tokenName: "Mistheron" });
  assert.strictEqual(spec.tokenName, "Mistheron", "an adversary's copy must be indistinguishable on the canvas");
  assert.strictEqual(spec.name, "Mistheron (Illusion)", "the ACTOR is still labelled — that is the GM's handle");
});

test("R-31: a PC copying an ALLY labels that ally's token, not their own name", async () => {
  const env = loadEngine();
  // Phantom Double's copyOf is "target-or-self", so the duplicated creature need not be the caster.
  const spec = await castCopy(env, { casterType: "character", casterName: "Tem parinaem", dupName: "Soggy Bottom", tokenName: "Soggy Bottom" });
  assert.strictEqual(spec.tokenName, "Soggy Bottom (Illusion)");
});

test("R-31: the token label falls back to the ACTOR name when the duplicate has no token", async () => {
  const env = loadEngine();
  const caster = mockActor({ name: "Tem parinaem", id: "pc", type: "character", system: { defenses: { cog: { value: 13 } } } });
  const dup = mockActor({ name: "Soggy Bottom", id: "ally", type: "character" });
  const spec = [];
  const world = stageWorld(env, { actors: [], placeables: [] });
  const prior = { summon: env.edhaSummon, art: env.edhaTokenArt, tok: env.edhaCasterToken };
  captureChat(env);
  env.edhaSummon = async (_o, s) => { spec.push(s); };
  env.edhaTokenArt = () => "";
  env.edhaCasterToken = () => null;
  try { await env.edhaCastPhantomDouble(caster, dup, {}); }
  finally { Object.assign(env, { edhaSummon: prior.summon, edhaTokenArt: prior.art, edhaCasterToken: prior.tok }); world.undo(); }
  assert.strictEqual(spec[0].tokenName, "Soggy Bottom (Illusion)");
});
