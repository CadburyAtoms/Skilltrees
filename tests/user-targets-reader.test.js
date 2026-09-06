/* TODO_REPO_HYGIENE item 14 (2026-09-06) — the PLURAL target reader.
 *
 * ENGINE PASS 5.2 (R-64) built `edhaUserTargetToken`/`edhaUserTargetActor` for the sites that
 * wanted the FIRST target and drove lint-refs pass 20's `userTargets` ratchet from 63 to 10. The
 * ten that remained all wanted the WHOLE list — `Array.from(game.user?.targets ?? [])` (or the
 * spread spelling), then their own `.filter`/`.find`/`.some`/`.slice`. Item 14 gave that shape its
 * own reader, `edhaUserTargetTokens()`, and routed all nine call sites through it; the tenth
 * occurrence IS that reader's body, which is why the ratchet floors at 1 rather than 0.
 *
 * WHAT THIS FILE PROVES. The call-site rewrites are a PURE REFACTOR — `edhaUserTargetTokens()` is
 * character-for-character what each site inlined, so re-inlining a direct read at any of them
 * changes no behaviour and no behavioural test could notice. The mutation-sensitive pin is
 * therefore the LAST case here: it counts the idiom in the comment-stripped engine source exactly
 * as pass 20 does and asserts the single survivor sits inside the reader. Re-inline one site and
 * that case fails (and so does `node scripts/lint-refs.js`), which is the guarantee the migration
 * actually buys: ONE line to edit when Foundry renames `User#targets`.
 *
 * The cases above it are snapshot pins on two migrated sites (`edhaSovTargets`,
 * `edhaSetUserTargets`) plus the reader's own contract, so a future edit to the reader — adding a
 * filter, returning the live Set, memoizing — is caught by a red test rather than by a table.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld, codeOnly, readEngineSource } = require("./harness.js");

function tok(actor, disposition, id) {
  return { id: id ?? (actor?.name ?? "t"), actor, document: { disposition, uuid: `Token.${id ?? actor?.name}` } };
}

/* -------------------------------------------------------------------------------------------- */
/* The reader's own contract                                                                     */
/* -------------------------------------------------------------------------------------------- */

test("edhaUserTargetTokens: every targeted token, in order, as a plain Array", () => {
  const env = loadEngine();
  const ta = tok({ name: "A" }, 1, "a"), tb = tok({ name: "B" }, -1, "b");
  // A real User#targets is a Set, not an array — the shape the reader exists to normalize.
  const undo = stageWorld(env, { user: { targets: new Set([ta, tb]) } }).undo;
  try {
    const got = env.edhaUserTargetTokens();
    assert.ok(Array.isArray(got), "an Array, so callers may filter/slice/sort");
    assert.strictEqual(got.length, 2);
    assert.strictEqual(got[0], ta);
    assert.strictEqual(got[1], tb);
  } finally { undo(); }
});

test("edhaUserTargetTokens: [] — never undefined — with nothing targeted, and with no game.user at all", () => {
  const env = loadEngine();
  // NB: the array comes back with the vm realm's Array.prototype, so deepStrictEqual against a
  // host-realm [] fails on identity alone (harness.js's cross-realm note) — check the shape.
  let undo = stageWorld(env, { user: { targets: new Set() } }).undo;
  try {
    const got = env.edhaUserTargetTokens();
    assert.ok(Array.isArray(got) && got.length === 0, "nothing targeted: an empty array");
  } finally { undo(); }
  undo = stageWorld(env, { user: null }).undo;
  try {
    const got = env.edhaUserTargetTokens();
    assert.ok(Array.isArray(got) && got.length === 0, "pre-ready / headless: [], not a throw");
  } finally { undo(); }
});

test("edhaUserTargetTokens: a fresh snapshot each call — the caller cannot mutate the live target set", () => {
  const env = loadEngine();
  const ta = tok({ name: "A" }, 1, "a");
  const live = new Set([ta]);
  const undo = stageWorld(env, { user: { targets: live } }).undo;
  try {
    const first = env.edhaUserTargetTokens();
    first.pop();                                  // a caller's own .slice/.splice/.sort
    assert.strictEqual(first.length, 0);
    assert.strictEqual(live.size, 1, "the user's real targets are untouched");
    assert.strictEqual(env.edhaUserTargetTokens().length, 1, "and the next read still sees them");
    assert.notStrictEqual(env.edhaUserTargetTokens(), env.edhaUserTargetTokens(), "a new array per call");
  } finally { undo(); }
});

test("edhaUserTargetToken still returns the FIRST target — the singular reader now delegates to the plural one", () => {
  const env = loadEngine();
  const ta = tok({ name: "A" }, 1, "a"), tb = tok({ name: "B" }, 1, "b");
  let undo = stageWorld(env, { user: { targets: new Set([ta, tb]) } }).undo;
  try {
    assert.strictEqual(env.edhaUserTargetToken(), ta);
    assert.strictEqual(env.edhaUserTargetActor(), ta.actor);
  } finally { undo(); }
  undo = stageWorld(env, { user: { targets: new Set() } }).undo;
  try { assert.strictEqual(env.edhaUserTargetToken(), null); } finally { undo(); }
});

/* -------------------------------------------------------------------------------------------- */
/* Migrated site 1 — edhaSovTargets (reads the list, splits it by disposition)                    */
/* -------------------------------------------------------------------------------------------- */

test("edhaSovTargets: same ally/enemy split through the reader — owner excluded from allies, kept out of neither side by accident", () => {
  const env = loadEngine();
  const owner = { name: "Owner" };
  const otok = tok(owner, 1, "o");
  owner.getActiveTokens = () => [otok];            // edhaCasterToken's first branch
  const ally = tok({ name: "Ally" }, 1, "al");
  const foe = tok({ name: "Foe" }, -1, "fo");
  const undo = stageWorld(env, { user: { targets: new Set([otok, ally, foe]) } }).undo;
  try {
    const { allies, enemies } = env.edhaSovTargets(owner);
    assert.strictEqual(allies.map(t => t.id).join(","), "al", "the owner's own token is not one of its allies");
    assert.strictEqual(enemies.map(t => t.id).join(","), "fo");
    // edhaSovAlly / edhaSovEnemy are `const` arrows over this same split (not visible on the vm
    // env, which exposes hoisted declarations), so pinning the split pins both of them.
    assert.strictEqual(allies[0].actor, ally.actor);
    assert.strictEqual(enemies[0].actor, foe.actor);
  } finally { undo(); }
});

/* -------------------------------------------------------------------------------------------- */
/* Migrated site 2 — edhaSetUserTargets' clear-all branch (reads the list to release it)          */
/* -------------------------------------------------------------------------------------------- */

test("edhaSetUserTargets([]): releases EVERY currently-targeted token, reading the same list", () => {
  const env = loadEngine();
  const released = [];
  const mk = (id) => ({ id, setTarget: (on, opts) => released.push({ id, on, releaseOthers: opts?.releaseOthers }) });
  const t1 = mk("t1"), t2 = mk("t2");
  const undo = stageWorld(env, { user: { targets: new Set([t1, t2]) } }).undo;
  try {
    env.edhaSetUserTargets([]);
    assert.deepStrictEqual(released, [
      { id: "t1", on: false, releaseOthers: false },
      { id: "t2", on: false, releaseOthers: false },
    ], "both released, neither release clobbering the other");
  } finally { undo(); }
});

test("edhaSetUserTargets([tok]): still sets, with the first release-others (the non-migrated branch is untouched)", () => {
  const env = loadEngine();
  const calls = [];
  const t1 = { id: "t1", setTarget: (on, opts) => calls.push({ on, releaseOthers: opts?.releaseOthers }) };
  const t2 = { id: "t2", setTarget: (on, opts) => calls.push({ on, releaseOthers: opts?.releaseOthers }) };
  const undo = stageWorld(env, { user: { targets: new Set() } }).undo;
  try {
    env.edhaSetUserTargets([t1, t2]);
    assert.deepStrictEqual(calls, [{ on: true, releaseOthers: true }, { on: true, releaseOthers: false }]);
  } finally { undo(); }
});

/* -------------------------------------------------------------------------------------------- */
/* THE RATCHET PIN — the mutation-sensitive case (see the header)                                 */
/* -------------------------------------------------------------------------------------------- */

test("the engine reads game.user.targets in exactly ONE place, and that place is edhaUserTargetTokens", () => {
  // The same measurement scripts/lint-refs.js pass 20 makes: comment-stripped source, strings kept.
  const src = codeOnly(readEngineSource());
  const hits = src.match(/game\.user\??\.targets/g) || [];
  assert.strictEqual(hits.length, 1,
    `expected exactly 1 direct read of game.user.targets (edhaUserTargetTokens' own body), found ` +
    `${hits.length}. A new one means a site hand-rolled the read again — call edhaUserTargetTokens() ` +
    `(or edhaUserTargetToken() for the first target) instead. See scripts/engine-idiom-ratchet.json.`);

  const body = src.match(/function edhaUserTargetTokens\(\)\s*\{[^}]*\}/);
  assert.ok(body, "edhaUserTargetTokens is still a top-level function declaration");
  assert.ok(/game\.user\??\.targets/.test(body[0]),
    "the one surviving read is inside the reader itself, not somewhere else in the engine");
});
