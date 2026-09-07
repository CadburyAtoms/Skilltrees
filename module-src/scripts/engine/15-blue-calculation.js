/* ============================================================================================
 * BLUE / CALCULATION tree engine (2026-06-14d) — cognitive control: impose/grant a test (dis)advantage
 * + Disorient. NAME-BASED, and every talent fires off its own `cosmere-rpg.useItem` (the OWNER's client,
 * where they hold their target), so there is NO GM-gating and NO pack rebuild. Each talent's cost is
 * consumed by its own activation (Foundry), so the cards only APPLY the effect — "success" is owner-judged
 * (the standing ruling: Foundry tests have no DC). Generic reusable primitive:
 *   flags.edha-content.nextTestMod = [ { mode:"advantage"|"disadvantage", count, skill:<id>|null,
 *   attr:<csv>|null, targetUuid:<uuid>|null, round:<n>|null, source } ] — a LIST since item 49
 * (Ben's R-15(b)); it was one object until then, which is why a second rider overwrote the first.
 * A counted, optional-skill mirror of the Black advTest / cogDisadv flags; consumed one test at a
 * time, per entry. targetUuid (2026-07-04, the Power backlog
 * item) binds the mod to tests whose synced target IS that creature ("advantage vs THAT target") —
 * generalizable to any future target-bound rider.
 *   - Subtle Suggestion   → Disorient the influenced target (reuse the Accord disorient card).
 *   - Pattern Recognition → on use, disadvantage on the target's next test.
 *   - Probability Cascade → on use, disadvantage on a creature's next TWO tests.
 *   - False Premise (skill_test) → on use (after the Blue test), disadvantage on the target's next test.
 *   - Anticipate          → on use, ADVANTAGE on the next test of you or an in-network ally.
 *   - Counterspell (skill_test)  → ON ITS DOCUMENT since 07-24p (iron rule 2b): `edha-def-test`
 *     blue vs cog, engine-resolved, verdict on the card. Its own roll + cost are native.
 *   - Composed = +tier max-focus ActiveEffect (data-side, already authored). Baleful = manual passive.
 * ============================================================================================ */

// Counted, optional-skill (dis)advantage on a creature's next test(s). Write locally or relay to the GM.
/* ONE application per banked use — the cross-path claim (2026-07-27j, bench run 9 defect 3).
 *
 * Pack Hunting's card offers its bonus on "your ally's attack OR damage roll" and the row's spec is
 * "either, whichever comes first — NOT both". The rule declares `appliesTo: "either"` correctly and
 * the bench still saw ONE banked use ride both: `1d20 + 4 + 3[Pack Hunting]` on the attack with its
 * own card, then `1d6 + 3 + 4` on the damage, and only then a consume.
 *
 * The cause is not the `appliesTo` gate — that works, and run 3 verified Predatory Patience
 * honouring it. It is that the pipeline has TWO independent consumers reading one document flag,
 * and the d20 half APPLIES at `pre<Ctx>Roll` but does not CONSUME until `<ctx>Roll`. A weapon
 * Strike rolls its damage inside that window, so `edhaWrapRollDamage` reads a flag that is applied
 * but not yet spent. Neither consumer awaits its own unset either (both are `void`ed, and the
 * damage wrapper is synchronous — it must build overrideFormula before the roll, so it CANNOT
 * await). No promise queue can fix a synchronous reader; the guard has to be an in-memory claim,
 * the same shape `_edhaLastRoll.used` already uses for the contest queue.
 *
 * Deliberately narrow: only `either` mods can be seen by both paths at all (`edhaNextTestMatches`
 * rejects a `test` mod on the damage path and a `damage` mod on a d20), so the guard is inert for
 * every other consumer — including the one `count: 2` mod in the data, Probability Cascade, which
 * is `test`-only and must keep applying to two separate tests. Same-path re-entry stays allowed, so
 * the guard can never remove a bonus today's behaviour grants. TTL'd because a cancelled roll dialog
 * would otherwise leave a claim standing; expiring it costs at most one re-applied bonus, where the
 * opposite failure is an unbounded one. */
const EDHA_NEXTMOD_CLAIM_TTL = 4000;
const _edhaNextModClaim = new Map();   // `${actorId}|${gid}` → { gid, path, ts }
function edhaNextModGid(mod) {
  return String(mod?.gid || `${mod?.source ?? ""}|${mod?.formula ?? ""}|${mod?.mode ?? ""}|${mod?.count ?? 1}`);
}
/* PURE (pinned in tests/): may `path` ("test" | "damage") apply this mod, given the actor's claim? */
function edhaNextModPathOk(claim, mod, path, now = Date.now()) {
  if (String(mod?.appliesTo || "test") !== "either") return true;        // single-path mod: nothing to guard
  if (!claim || (now - (Number(claim.ts) || 0)) > EDHA_NEXTMOD_CLAIM_TTL) return true;
  if (claim.gid !== edhaNextModGid(mod)) return true;                    // a DIFFERENT banked use
  return claim.path === path;                                            // the other path already took it
}
/* Item 49: the claim map is keyed per (actor, GRANT), not per actor. With one slot an actor could
 * only ever hold one banked use, so `actorId` WAS the grant; with a list two `either` riders can sit
 * on the same creature and a per-actor key would let the first one's claim veto the second's. */
function edhaNextModClaimKey(actor, mod) { return `${actor?.id ?? ""}|${edhaNextModGid(mod)}`; }
function edhaNextModClaimSweep(now = Date.now()) {   // bounded: TTL'd claims are dead, drop them
  for (const [k, c] of _edhaNextModClaim) if ((now - (Number(c?.ts) || 0)) > EDHA_NEXTMOD_CLAIM_TTL) _edhaNextModClaim.delete(k);
}
function edhaNextModClaimOk(actor, mod, path) {
  if (!actor) return true;
  const key = edhaNextModClaimKey(actor, mod);
  if (!edhaNextModPathOk(_edhaNextModClaim.get(key), mod, path)) return false;
  if (String(mod?.appliesTo || "test") === "either") _edhaNextModClaim.set(key, { gid: edhaNextModGid(mod), path, ts: Date.now() });
  return true;
}

/* ---- THE NEXT-TEST MOD LIST (item 49 — Ben's R-15(b): "that needs to be a list not one slot") ---
 *
 * `flags.edha-content.nextTestMod` is an ARRAY of mod entries. It was ONE object, so the second
 * writer silently overwrote the first: Coercive Pressure's Cognitive disadvantage and Probability
 * Net's −1d6 on the same victim could not coexist, and neither could the Command die and anything
 * else. Every writer now APPENDS (edhaSetNextTestMod), every reader applies EVERY live entry, and a
 * consumer decrements/removes only its own.
 *
 * An entry keeps the shape the pipeline has always used, which already carries all four parts the
 * ruling names: `source` (who granted it), the KIND (`mode` advantage/disadvantage and/or `formula`),
 * the VALUE (`formula` / `count`), and the EXPIRY (`round`, stamped by `expireEndOfRound`). Renaming
 * those fields would break the authored `edha-next-test-mod` schema, its pinned tests, and every mod
 * already stored on a live actor, for no behavioural gain — the SLOT is what became a list.
 *
 * Folding (what "all entries apply" means):
 *   · (dis)advantage — boolean OR per direction. Any live matching entry granting advantage sets it;
 *     any granting disadvantage sets it. BOTH directions present = the roll is left exactly as the
 *     player configured it (the system's AdvantageMode is one scalar and the table rule is that they
 *     cancel); we write nothing rather than picking a winner or stomping a manual choice.
 *   · `formula` — SUMMED. Every matching entry's term is concatenated onto the roll, each flavored
 *     with its own source, so the breakdown still names who gave what.
 *   · `count` — per entry. Each matching entry spends one of its own uses on the test.
 * Gating is unchanged and stays PER ENTRY: `edhaNextTestMatches` filters skill / attr / round /
 * targetUuid / quarryUuid / appliesTo for each one independently.
 *
 * EXPIRY is per entry and is PRUNED ON READ (R-20 + R-57). A round-stamped entry whose round has
 * moved on can never match again, so it is dropped from the flag rather than left to accumulate —
 * that stale-flag side effect is exactly what R-57 flagged and what the single slot could only clear
 * by being overwritten. An UNSTAMPED entry is not expiry-bound: it waits until it is consumed.
 *
 * LEGACY MIGRATION: a stored single object reads as a one-entry list (`edhaNextModList`), so no
 * actor carrying the old shape breaks, and the first write-back normalises it to an array.
 */
const EDHA_NEXTMOD_CAP = 12;   // a bound, not a design limit — an unbounded flag is the R-57 failure again
/* PURE (pinned in tests/): read whatever is stored as a LIST. Array → itself; a legacy single object
 * → one entry; anything else (null, a wiped flag, garbage) → empty. */
function edhaNextModList(value) {
  if (Array.isArray(value)) return value.filter((m) => m && typeof m === "object");
  if (value && typeof value === "object") return [value];
  return [];
}
/* PURE: is this entry DEAD — can it never apply again? Today only the round stamp expires, and the
 * predicate is deliberately the SAME comparison `edhaNextTestMatches` makes, so pruning can never
 * drop an entry that would still have matched. Out of combat (round null) a stamp stays inert. */
function edhaNextModExpired(mod, round) {
  return !!(mod && mod.round != null && round != null && Number(round) !== Number(mod.round));
}
/* PURE: split a list into what is still live and how many entries died. */
function edhaNextModPrune(list, round) {
  const live = [];
  let pruned = 0;
  for (const m of edhaNextModList(list)) { if (edhaNextModExpired(m, round)) pruned++; else live.push(m); }
  return { live, pruned };
}
// Write the list back (null when empty — every reader treats a missing flag and [] alike). Routed
// through edhaSetEdhaFlag so a cross-actor clear RELAYS; the old consumers called unsetFlag on the
// bearer directly, which silently did nothing for a victim the roller does not own.
async function edhaWriteNextMods(actor, list) {
  return edhaSetEdhaFlag(actor, "nextTestMod", (list && list.length) ? list : null);
}
/* THE reader. Returns the live entries, pruning expired ones off the document as a side effect
 * (R-57) and normalising a legacy single object to an array on first read. `round` is a parameter so
 * the fold stays testable with no combat object. */
function edhaNextModsOf(actor, round = undefined) {
  const stored = actor?.getFlag?.("edha-content", "nextTestMod");
  const raw = edhaNextModList(stored);
  if (!raw.length) return [];
  if (round === undefined) round = edhaCombatRoundOf(actor);
  const { live, pruned } = edhaNextModPrune(raw, round);
  if (pruned || !Array.isArray(stored)) void edhaWriteNextMods(actor, live);   // prune-on-read + legacy migration
  return live;
}
async function edhaSetNextTestMod(target, mod) {
  try {
    // Stamp a fresh identity so a NEW grant is never mistaken for the one a stale claim holds.
    // Done before the socket emit so the owner and the relayed write agree on the same gid.
    try { if (mod && !mod.gid) mod.gid = foundry.utils.randomID(); } catch (e) { /* non-fatal */ }
    try { edhaNextModClaimSweep(); } catch (e) { /* non-fatal */ }
    // APPEND (item 49). Read-modify-write on the bearer's document: flags are replicated to every
    // client, so this is correct even when the write itself relays to the GM. Expired entries are
    // dropped in the same pass, so a grant also tidies.
    const cur = edhaNextModPrune(target?.getFlag?.("edha-content", "nextTestMod"), edhaCombatRoundOf(target)).live;
    const { list } = edhaListPush(cur, mod, { cap: EDHA_NEXTMOD_CAP, evict: "oldest" });
    return await edhaSetEdhaFlag(target, "nextTestMod", list);   // Job 6a: routed through the canonical helper
  } catch (e) { console.error("Edha Content | set next-test mod failed", e); return false; }
}
function edhaNextTestMatches(mod, roll, actor = null, round = undefined, wantDamage = false) {
  if (!mod) return false;
  // "…this round" (07-24r). A mod stamped with the round it was granted in silently stops matching
  // once the round moves on — the behaviour Predatory Insight's bespoke `advTest` flag had and this
  // pipeline did not, which is the only reason a private second flag existed. Round is a parameter so
  // the helper stays pinnable; out of combat there is no round and the stamp is inert.
  if (round === undefined) round = edhaCombatRoundOf(actor);   // R-4/#28a: the ROLLER's combat, not the viewed one
  if (mod.round != null && round != null && round !== mod.round) return false;
  // COMMA-LIST (07-24w, Ben's q12 ruling to ENFORCE the Command skill lists). This was a scalar
  // compare, so an authored "itm, lea, per" could never match any skill id and the gate silently
  // passed nothing — worse than either behaviour. Mirrors the `attr` split on the next line.
  if (mod.skill) {
    const want = String(mod.skill).split(/[,\s]+/).filter(Boolean);
    if (want.length && !want.includes(roll?.data?.skill?.id)) return false;
  }
  if (mod.attr) { const a = roll?.data?.skill?.attribute; if (!String(mod.attr).split(/[,\s]+/).filter(Boolean).includes(a)) return false; }   // attribute-gated (Red Key: str/spd)
  if (mod.targetUuid) {                                     // target-bound ("vs THAT creature") — consumes only against it
    const t = actor ? edhaTargetsOfRoller(actor)[0] : null;
    if ((t?.actor?.uuid ?? null) !== mod.targetUuid) return false;
  }
  /* QUARRY-bound (07-24x, Ben's q15(a) ruling). Pack Hunting's bonus goes ON THE ALLY but is only
   * valid against the GRANTER's quarry — a different creature from either party, so `targetUuid`
   * (which binds to the granter's own current target, i.e. the ally) cannot express it. The granter's
   * quarry uuid is stamped at grant time and checked against whoever the ROLLER is targeting.
   *
   * Fails CLOSED: no quarry stamped means the mod never matches. That is deliberate — the card says
   * "against your quarry", so a bonus with no quarry to check is not a bonus. The pre-cost veto
   * refuses the use outright, so this branch should never be reached with an empty stamp. */
  if (mod.quarryUuid) {
    const t = actor ? edhaTargetsOfRoller(actor)[0] : null;
    if ((t?.actor?.uuid ?? null) !== mod.quarryUuid) return false;
  }
  /* WHICH ROLL it rides (07-24x, Ben's q15(b) ruling to BUILD damage-roll support). `test` (default,
   * and every pre-07-24x consumer) = d20 tests only. `damage` = damage rolls only. `either` = both,
   * whichever the ally rolls first — Pack Hunting's card says "attack or damage roll".
   * `wantDamage` is passed by the damage path; a d20 caller leaves it undefined. */
  const applies = mod.appliesTo || "test";
  if (wantDamage === true && applies === "test") return false;
  if (wantDamage !== true && applies === "damage") return false;
  return true;
}
/* The damage-roll half of the next-test pipeline (07-24x). Kept as two small named helpers beside the
 * d20 pair so the shapes stay comparable: match, then consume. `roll` is faked as an object carrying
 * no skill id, which is correct — a damage roll has no skill, so a `skill`-gated mod must not match it
 * (and `edhaNextTestMatches` rejects a missing id, as its pinned test asserts). */
function edhaNextTestDamageMods(actor, item) {
  return edhaNextModsOf(actor).filter((m) => edhaNextTestMatches(m, { data: {} }, actor, undefined, true));
}
/* PURE (pinned in tests/): spend one use of each mod in `taken`, leaving every other entry alone.
 * Returns the list to store — this is what "a consumer clears ONLY its own entry" means. */
function edhaNextModSpend(list, taken) {
  const spend = new Set((taken || []).map((m) => edhaNextModGid(m)));
  const next = [];
  for (const m of edhaNextModList(list)) {
    if (!spend.has(edhaNextModGid(m))) { next.push(m); continue; }
    const left = Math.max(0, (Number(m.count) || 1) - 1);
    if (left > 0) next.push({ ...m, count: left });
  }
  return next;
}
async function edhaNextTestConsumeDamage(actor, mods) {
  try {
    const taken = Array.isArray(mods) ? mods : [mods];
    await edhaWriteNextMods(actor, edhaNextModSpend(edhaNextModsOf(actor), taken));
    for (const mod of taken) {
      const left = Math.max(0, (Number(mod.count) || 1) - 1);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p>🔮 <strong>${mod.source || "Calculation"}</strong> — <strong>${mod.formula}</strong> added to this damage roll${left > 0 ? ` (${left} more)` : ""}.</p>` });
    }
  } catch (e) { console.error("Edha Content | next-test damage consume failed", e); }
}
/* PURE (pinned in tests/): fold a list of MATCHING entries into the one advantageMode the system can
 * hold. Boolean-OR per direction; both directions present cancel to null, which the caller reads as
 * "write nothing" — a mixed pair must not stomp whatever the player set on the dialog themselves. */
function edhaNextModFoldMode(mods) {
  let adv = false, dis = false;
  for (const m of mods || []) {
    if (m?.mode === "advantage") adv = true;
    else if (m?.mode === "disadvantage") dis = true;
  }
  if (adv && dis) return null;
  return adv ? "advantage" : (dis ? "disadvantage" : null);
}
function edhaNextTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    // EVERY live entry that matches this roll AND is not already claimed by the damage half (07-27j).
    // The claim is taken here, so it is filtered rather than checked once for a single slot.
    const mods = edhaNextModsOf(actor)
      .filter((m) => edhaNextTestMatches(m, roll, actor))
      .filter((m) => edhaNextModClaimOk(actor, m, "test"));
    if (!mods.length) return;
    const m = edhaNextModFoldMode(mods);   // gated (07-16b): a formula-only mod (Probability Net) must not force disadvantage
    if (m) {
      roll.options.advantageMode = m; roll.configureModifiers?.();
      const orig = roll.configureDialog?.bind(roll);
      if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = m; } catch (e) {} return orig(data); };
    }
    // Dice/flat modifiers on the next test (Probability Net's −1d6) — same term-concat mechanism as
    // the test riders, flavor-labeled so the breakdown names each source. Item 49: they SUM, so every
    // matching entry appends its own term; the guard flag still stops a re-entrant hook doubling them.
    if (!roll.options._edhaNextTestFormula) {
      let added = false;
      for (const mod of mods) {
        if (!mod.formula) continue;
        const resolved = edhaFoldDieMath(Roll.replaceFormulaData(String(mod.formula), actor?.getRollData?.() ?? {}, { missing: "0" })).trim();
        const label = mod.source || "Next-test mod";
        const expr = edhaJoinRiderTerm("0", resolved, label);   // a leading minus → explicit subtraction (item 66: the one shared join)
        roll.terms = roll.terms.concat(new Roll(expr).terms.slice(1));
        added = true;
      }
      if (added) { roll.resetFormula(); roll.options._edhaNextTestFormula = true; }
    }
  } catch (e) { console.error("Edha Content | next-test mod pre-roll failed", e); }
}
function edhaNextTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const list = edhaNextModsOf(actor);
    const taken = list.filter((m) => edhaNextTestMatches(m, roll, actor));
    if (!taken.length) return;
    void edhaWriteNextMods(actor, edhaNextModSpend(list, taken));   // only the entries that applied are spent
    for (const mod of taken) {
      const left = Math.max(0, (Number(mod.count) || 1) - 1);
      const word = mod.mode ? (mod.mode === "advantage" ? "advantage" : "disadvantage") : (mod.formula || "a modifier");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔮 <strong>${mod.source || "Calculation"}</strong> — ${word} on this test${left > 0 ? ` (${left} more)` : ""}.</p>` });
    }
  } catch (e) { console.error("Edha Content | next-test mod consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaNextTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaNextTestConsume);
}

/* --- Decisive Command + the command-die cluster — CONVERTED 07-24w (iron rule 2b) --------------------
 * Was this hook plus `edhaCommandDie` and a second hook for the three upgrades' self-add. All five
 * talents now live on their own documents (data/authored/heroic-leader.json):
 *   Decisive Command ....... edha-next-test-mod {target, formula 1d(4 + 2 * @owned)}
 *   Confident Command ...... edha-next-test-mod {self, same die, skill "itm,lea,per"}
 *   Demonstrative Command .. same, skill "ath,agi,lea"
 *   Shrewd Command ......... same, skill "dec,ins,lea"
 *   Relentless March ....... edha-note rider on Decisive Command (whenOwnsTalent)
 *
 * TWO widenings made it expressible, and neither could be skipped:
 *   · `skill` became a COMMA-LIST. It was a scalar compare, so an authored "itm, lea, per" would have
 *     matched no skill id at all and the gate would have passed silently — worse than either
 *     behaviour. Ben ruled 07-24w to ENFORCE these lists, which the old card text called honour-system.
 *   · `@owned` + `ownedFrom`. The die is sized by HOW MANY of the three upgrades you own, and nothing
 *     in roll data exposes an owned-talent count, so no literal formula on any one document can say
 *     it. Talent names in `ownedFrom` are AUTHORED data — legitimate, like `whenOwnsTalent`; the
 *     rule-2b smell is names in engine code.
 *
 * ⚑ AUTHORITY converted as a SIXTH talent, and the reason is worth recording. Its card doubles Leader
 * range and ally count; the engine enforced NEITHER — the doubled range was computed into a warning
 * string and the variable was then dead, and Decisive Command has no distance check at all. Deleting
 * this hook therefore removed Authority's ONLY presence, which would have left it with an empty
 * document and no engine code — the state iron rule 2b calls a bug rather than a style choice. So it
 * ships as an `edha-note` rider that says MORE than the old string did (it names the ally count, which
 * the engine never surfaced). Whether either half becomes ENFORCED is open as §9m q13; the reminder is
 * the honest interim, not the answer. */

/* --- Stances (heroic modality talents — 07-18 bench: "stances aren't wired at all") -------------
 * The free system carries `modality:"stance"` on the talent DataModel but ships NO machinery (its
 * own stance AEs are inert empty-changes markers). Generic rule, keyed on the field rather than
 * names so future stances wire themselves: USING a stance talent ENTERS that stance — one marker
 * ActiveEffect on the actor (talent's name + img, `edha-content.stanceOf` flag) — and any other
 * stance ends first (one stance at a time). Using it again while active LEAVES the stance
 * (toggle). The marker is the visible/queryable state (token icon + sheet + `edhaActiveStance`).
 * Runs on the using client (useItem is client-local); players own their actors, so the writes are
 * permitted.
 *
 * IRON RULE 2b (07-24j) — the six stance talents came OFF the engine. Both name-keyed tables are
 * gone; each stance's mechanical rider now lives on its own talent, editable in Foundry:
 *   - numeric while-active riders (Stone/Vine/Blood) → ONE ActiveEffect on the talent flagged
 *     `edha-content.stanceRider`, `transfer: false`; `edhaStanceRiderChanges` copies its changes
 *     onto the marker at enter (see below);
 *   - skill advantage (Flame → Intimidation, Iron → Insight, Wind → Agility) → an `edha-test-rider`
 *     rule with `mode: advantage`, `whenSkill`, `whileStanceActive`, injected by the ONE pre-roll
 *     rider pipeline (`edhaTestRiderApply`) instead of a second bespoke pre-roll hook.
 * ENGINE-OWNED here: nothing. Nothing in this section knows a talent name.
 * Each stance's SITUATIONAL half (Flamestance's lone-enemy Action, Ironstance's Reactive Strike on
 * a graze/miss, Windstance's Disengage Action, Vinestance's push-on-melee, Vigilant's Dodge/
 * Reactive-Strike discount) stays in the HEROIC header ledger below — those are CAE action-economy
 * grants, queued on the `edha-cae-grant` handler (audit §9k H5), not on this section.
 */
function edhaActiveStance(actor) {
  try { return (actor?.effects ?? []).find(e => e.getFlag?.("edha-content", "stanceOf"))?.name ?? null; }
  catch (e) { return null; }
}
async function edhaToggleStance(item) {
  const actor = item.actor; if (!actor) return;
  const stances = (actor.effects ?? []).filter(e => e.getFlag?.("edha-content", "stanceOf"));
  const mine = stances.find(e => e.getFlag("edha-content", "stanceOf") === item.name);
  const others = stances.filter(e => e !== mine);
  if (others.length) await actor.deleteEmbeddedDocuments("ActiveEffect", others.map(e => e.id));
  if (mine) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", [mine.id]);
    ui.notifications?.info(`Edha: ${actor.name} leaves ${item.name}.`);
  } else {
    // No `statuses` at create (§10 gotcha — creating WITH statuses throws on cosmere v2.1.0).
    // Numeric stance riders bake into the marker itself (07-18h): the marker IS the stance, so
    // deflect/defense changes apply exactly while it exists and vanish on leave/swap. Since
    // 07-24j those changes are READ OFF THE TALENT (iron rule 2b) instead of a name-keyed table.
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: item.name, img: item.img, disabled: false, transfer: false,
      description: item.system?.description?.chat || item.system?.description?.value || "",
      changes: edhaStanceRiderChanges(item),
      flags: { "edha-content": { stanceOf: item.name } },
    }]);
    ui.notifications?.info(`Edha: ${actor.name} enters ${item.name}${others.length ? ` (${others.map(o => o.name).join(", ")} ended)` : ""}.`);
  }
}
/* The stance's numeric while-active riders, read off the TALENT's own Effects tab (iron rule 2b,
 * 07-24j — this replaced the name-keyed EDHA_STANCE_CHANGES table). Author ONE ActiveEffect on the
 * stance talent flagged `edha-content.stanceRider` with `transfer: false`: it sits on the item
 * where Ben can edit the numbers, never applies by itself, and the marker copies its changes on
 * enter. A stance with no such effect simply has no numeric rider (Flame/Iron/Wind — their half is
 * an edha-test-rider `mode` rule instead). New stances wire themselves; nothing here knows a name. */
function edhaStanceRiderChanges(item) {
  try {
    const eff = (item?.effects ?? []).find(e => e.getFlag?.("edha-content", "stanceRider"));
    return (eff?.changes ?? []).map(c => ({ key: c.key, mode: c.mode ?? 2, value: c.value }));
  } catch (e) { return []; }
}
/* --- CAE bridge (07-18j — Cosmere Advanced Encounters, v1.3.1 captured in the items dump) ------
 * CAE exposes NO api, but its per-combatant tracker state is plain flags:
 *   flags["cosmere-advanced-encounters"] = { actionsAvailableGroups:[{max,remaining,used,name}],
 *     reactionsAvailable:[{max,remaining,used,name}], actionsUsed/reactionsUsed/freeActionsUsed…}
 * Granting = pushing a NAMED group ("Edha: <talent>") so provenance shows on the tracker and the
 * player clicks it down as usual; burning = decrementing the base reaction group. Writes need
 * Combat-document perms (GM) → `cae-flag` socket relay from player clients. Groups live on the
 * combatant, so everything self-cleans when the encounter ends. No combat / CAE disabled → the
 * grant falls back to the plain chat note (the pre-CAE behavior).
 */
const EDHA_CAE_ID = "cosmere-advanced-encounters";
function edhaCaeCombatant(actor) {
  // R-4/#28a: PREFER the actor's own combat, fall back to the viewed one. This is a LOOKUP, not a
  // gate — its empty answer downgrades the grant to a plain chat note, so it must never be the thing
  // that silences a live grant. Narrowing it to `edhaInActiveCombat` alone would do exactly that.
  try { return (edhaInActiveCombat(actor) ?? game.combat)?.combatants?.find?.(c => c.actor === actor || c.actorId === actor?.id) ?? null; }
  catch (e) { return null; }
}
/* SERIALISED since 2026-07-27j (bench run 9 defect 2) — this is the H3 owner-list write race in a
 * second place, and it had simply never been put through the queue.
 *
 * The CAE tracker state is a read-modify-write on a combatant flag: deepClone(getFlag) → push/
 * decrement → setFlag, with an async server round-trip in the middle and no isolation. At combat
 * start Foresight and Sidestep both fire on `edha-combat-timing` in the same tick; both read the
 * SAME pre-write `actionsAvailableGroups`, both push onto their own clone, and the last setFlag
 * wins — two "(on the tracker)" cards, ONE group written. The bench proved it directly: two
 * Through the Fray uses in one tick produced two success cards and one group.
 *
 * Fixed at the SHARED level (the 07-26n rule), reusing `edhaOwnerListQueue` unchanged — its key is
 * `${uuid}::${key}`, so passing the COMBATANT and the CAE flag key gives exactly the right scope.
 * Serialising on the flag key also fixes the third case in the blast radius: `burn-reaction` and a
 * `reaction` grant both write `reactionsAvailable`, so they now queue against each other instead
 * of racing. The combatant is resolved OUTSIDE the queue and the getFlag re-read happens INSIDE
 * it — queueing only the write fixes nothing. No task here awaits another queued task, so the
 * deadlock rule is respected. */
async function edhaCaeApplyGM(p) {
  try {
    const a = await edhaResolveActorRef(p.actorUuid);
    const c = edhaCaeCombatant(a); if (!c) return;
    const key = (p.kind === "burn-reaction" || p.kind === "reaction") ? "reactionsAvailable" : "actionsAvailableGroups";
    await edhaOwnerListQueue(c, key, async () => {
      const groups = foundry.utils.deepClone(c.getFlag(EDHA_CAE_ID, key) ?? []);   // fresh read INSIDE the queue
      if (p.kind === "burn-reaction") {
        const g = groups.find(x => (x.remaining ?? 0) > 0);
        if (!g) return;
        g.remaining -= 1; g.used = (g.used ?? 0) + 1;
      } else {
        groups.push({ max: p.n || 1, remaining: p.n || 1, used: 0, name: `Edha: ${p.label || "grant"}` });
      }
      await c.setFlag(EDHA_CAE_ID, key, groups);
    });
  } catch (e) { console.error("Edha Content | CAE apply failed", e); }
}
async function edhaCaeGrant(actor, kind, n, label) {   // kind: "action" | "reaction" | "burn-reaction"
  if (!actor) return false;
  if (!game.modules?.get?.(EDHA_CAE_ID)?.active || !edhaCaeCombatant(actor)) return false;   // caller posts its own chat either way
  const payload = { actorUuid: actor.uuid, kind, n, label };
  if (game.user?.isGM) { await edhaCaeApplyGM(payload); return true; }
  if (!game.users?.activeGM) return false;
  game.socket.emit("module.edha-content", { action: "cae-flag", payload });
  return true;
}
// EDHA_CAE_USE_GRANTS and its hook retired 07-24n — every row was `on use, grant N of a kind with
// a label`, which is the `edha-cae-grant` handler on event `use` (iron rule 2b).
// Through the Fray retired 07-24n -> edha-cae-grant, kind reaction, target=target (iron rule 2b).
// Foresight + Sidestep retired 07-24n -> edha-cae-grant on event edha-combat-timing; Sidestep's
// armour gate is the handler's whenDeflectBelow field (iron rule 2b).

/* --- Starting kits (07-18j — §9j #4; ruling 59 + the primer text) -------------------------------
 * `edha.grantStartingKit(actor, "Warrior")` (GM console, or the player's own actor): grants the
 * common base + the path pack from the edha-items compendium + the 5-silver purse (writes the
 * seeded denominations). The WEAPON slot stays the player's pick from the pack (≤ 2 gold,
 * usable-skill rule — the card says so). Nation purse-flavor stays primer-guided (form, not value).
 */
// weapons: the PATH-CURATED weapon-slot list (Ben's 07-19 ruling: "pick your heroic path, that
// informs what appears on the kit's weapon slot" — one weapon granted, never ×2). Omitted =
// every ≤2g non-plot weapon (Warrior's "weapon of choice"). Lists Ben-approved 07-19.
const EDHA_KITS = {
  "Agent":   { items: ["Lockpick", "Wax (1 block)", "Papers (genuine or otherwise)"], note: "dark travel clothes; lamp-black", weapons: ["Knife", "Sidesword", "Staff"] },
  "Envoy":   { items: ["Clothing (fine)", "Ink Pen", "Ink (1-ounce bottle)", "Wax (1 block)"], note: "letter of credit (1 g — write it on the sheet)", weapons: ["Sidesword", "Knife", "Staff"] },
  "Hunter":  { items: ["Shortbow", "Quiver (20 arrows)", "Knife", "Leather", "Rope (50 feet)", "Snare Kit", "Flint and Steel", "Spyglass", "Trophy String", "Journal (blank)"], note: "a week of rations below", rations: 7, weapons: ["Shortspear", "Longspear", "Axe"] },
  "Leader":  { items: ["Sidesword", "Leather", "Signal Horn", "Written Commission"], note: "write the commission's one line", weapons: ["Longsword", "Longspear", "Mace"] },
  "Scholar": { items: ["Staff", "Journal (blank)", "Ink Pen", "Chalk (5 sticks)", "Candle", "Book (reference)"], note: "the traveling library: name your three volumes (Book ×3 if you want them physical)", weapons: ["Knife", "Mace"] },
  "Warrior": { items: ["Leather", "Shield", "Whetstone", "Mess Kit", "Regimental Token"], note: "weapon of choice from the weapon slot (≤ 2 g, a weapon you can actually use)" },
};
const EDHA_KIT_BASE = ["Clothing (common)", "Backpack", "Bedroll", "Flint and Steel"];
async function edhaGrantStartingKit(actorArg, pathName, { force = false } = {}) {
  const a = edhaResolveActorArg(actorArg);
  const kit = EDHA_KITS[pathName];
  if (!a || !kit) { ui.notifications?.warn(`Edha: grantStartingKit(actor, path) — path is one of ${Object.keys(EDHA_KITS).join("/")}.`); return false; }
  const prior = a.getFlag?.("edha-content", "kitPath");
  if (prior && !force) { ui.notifications?.info(`Edha: ${a.name} already received the ${prior} starting kit — edha.grantStartingKit(actor, path, {force:true}) to re-grant.`); return false; }
  const pack = game.packs.get("edha-content.edha-items");
  if (!pack) { ui.notifications?.warn("Edha: the edha-items compendium is missing — deploy/rebuild first."); return false; }
  const docs = await pack.getDocuments();
  const wanted = [...new Set([...EDHA_KIT_BASE, ...kit.items])];
  const found = [], missing = [];
  for (const name of wanted) {
    const doc = docs.find(x => x.name === name);
    if (doc) found.push(edhaCleanPackCopy(doc)); else missing.push(name);   // mirror items can carry dump relationships — strip (07-19r)
  }
  if (kit.rations) { const r = docs.find(x => x.name === "Food (ration, 1 day)"); if (r) { const o = edhaCleanPackCopy(r); o.system.quantity = kit.rations; found.push(o); } }
  // kitItem stamps let a creation restart wipe still-held kit gear (07-18l).
  for (const o of found) foundry.utils.setProperty(o, "flags.edha-content.kitItem", true);
  // Direct array create — edhaCreateItemDocs takes ONE doc and was double-wrapping the array,
  // so the kit items never landed (07-18l fix, pre-bench).
  try { await a.createEmbeddedDocuments("Item", found); }
  catch (e) { console.error("Edha Content | kit item create failed", e); ui.notifications?.warn("Edha: kit items failed to create — see console."); return false; }
  // The 5-silver purse — write the seeded denominations (bench 9–10 wiring, 07-18j).
  try {
    const den = foundry.utils.deepClone(a._source?.system?.currency?.edha?.denominations ?? []);
    const silver = den.find(x => x.id === "silver");
    if (silver) { silver.amount = (Number(silver.amount) || 0) + 5; await a.update({ "system.currency.edha.denominations": den }); }
  } catch (e) { console.warn("Edha | purse write failed", e); }
  try { await a.setFlag("edha-content", "kitPath", pathName); } catch (e) { /* flag is best-effort */ }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🎒 <strong>${pathName} starting kit</strong> for ${a.name}: ${found.length} items + <strong>5 silver</strong>.${missing.length ? `<br>Missing from the pack (add by hand): ${missing.join(", ")}.` : ""}<br><em>Weapon slot: pick any weapon ≤ 2 g that you have the skill or expertise to use. ${kit.note}. Nation purse-flavor: see the primer.</em></p>` });
  return true;
}

// Orphan-token combat guard (07-18i — Ben's live report: "combat isn't starting"). A combatant
// whose token has NO actor (world actor deleted — the 07-17c duplicate-purge workflow leaves
// exactly these tokens behind) crashes combat data-prep: Advanced Encounters' initiative getter
// reads actor.system for speed-sorting with no null guard, so the whole encounter fails to
// initialize. Veto the combatant at creation with a NAMED warning instead — combat starts with
// everyone real, and the toast says which token to delete.
Hooks.on("preCreateCombatant", (combatant) => {
  try {
    if (combatant?.actor) return;
    const tname = combatant?.token?.name || combatant?.name || "(unknown token)";
    ui.notifications?.warn(`Edha: "${tname}" has no actor behind it (deleted world actor?) — skipped from combat. Delete the orphaned token.`);
    return false;
  } catch (e) { /* never block combat on a guard failure */ }
});
// Practiced Kata retired 07-24n -> edha-enter-stance on event edha-combat-timing. Now runs on the
// single GM applier like every other combat-timing rule, instead of owner-side (iron rule 2b).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try { if (edhaIsTalent(item) && item.system?.modality === "stance" && item.actor) void edhaToggleStance(item); }
  catch (e) { console.error("Edha Content | stance toggle failed", e); }
});

