/* ============================================================================================
 * SHARED CORE (bannered 2026-09-05, item 23 — comment-only) — everything above the first tree
 * section: the registration bootstrap plus the cross-tree primitives that every one of the 15
 * tree sections below calls. Nothing here belongs to a colour or a deity. If a helper has two
 * consumers it lives here and the tree sections REUSE it rather than reinvent it (iron rule 2a),
 * so this is the first place to grep before writing a new one.
 *
 * The `--- ` sub-headers below are the real map; this banner exists so a cold reader — and the
 * #4 split — can see the seam between "shared" and "per-tree", which the file's own docblock
 * (about skill registration only) does not name.
 *
 * Owns, in file order:
 *   • debug tracer — edhaSetDebug · edhaDebugArg · edhaDebugOut · edhaDebugSave, plus the
 *     Hooks.on wrapper installed for THIS file's top-level execution only (restored at the
 *     bottom of the file), so only edha-content handlers carry the tracer.
 *   • registration bootstrap — registerContent · edhaRegisterStatuses · edhaRegisterCurrency ·
 *     EDHA_CURRENCY_SEED, run from module load + init + setup + ready (see the docblock above:
 *     the leyline skills must land before the Actor data model schema is first built).
 *   • Weakened + the TEST-MODIFIER RIDER — edhaNumOr · edhaD20RollActor · edhaWeakenedPreRoll ·
 *     edhaFoldDieMath · edhaTestCtxMatch · edhaTidyFormula · edhaStatusCsvMatch ·
 *     edhaTestRiderApply. The pre-roll injector every (dis)advantage talent ends up in.
 *   • the aggro ledger / pack advantage — edhaAggroRecord · edhaPackAdvantageApply.
 *   • generic timed-status EXPIRY — edhaTurnSeq · edhaCombatantTurnIndex · edhaNextTurnCoord ·
 *     edhaIsTimedStatus · edhaTimedStampPlan · edhaExpireTimedStatuses. One expiry pass for
 *     every "until the end of its next turn" status in the whole atlas.
 *   • the events-rule readers every handler starts from — edhaEventRules · edhaRuleOf.
 *   • passive damage riders — edhaRiderMatches · edhaHasCondition · edhaRiderParts ·
 *     edhaRiderBonus · edhaWrapRollDamage.
 *   • kindle light — edhaLightSpecFor · edhaLightSource · edhaLightTokensOf ·
 *     edhaApplyKindleLight · edhaClearKindleLights.
 *   • ISOLATED marker sync — edhaIsIsolated · edhaSyncIsolatedMarkers(+Soon) and its seven
 *     watchers (token move/create/delete, combat start/turn/end, an ally's HP crossing zero).
 *   • the applyDamage spine — edhaMarkOwner · edhaDealerOf · edhaAttackKind · edhaActorRuleOf ·
 *     edhaActorRulesOf · edhaDamageBonusPost · edhaWrapApplyDamage. THE hot path: every
 *     on-damage trigger in every tree lands in edhaWrapApplyDamage, so read it before adding
 *     another one — a new consumer almost always belongs inside it, not beside it.
 * ============================================================================================ */

/* --- EDHA test-debug tracer (2026-07-12) --------------------------------------------------------
 * edha.debug(true) → every edha-content hook handler logs a "[EDHA-TEST]" line as it fires
 * (hook name, handler, key args, thrown errors, false-returns), and incoming GM-relay socket
 * messages log too — so a saved console log shows whether a handler ran at all, even when it
 * bailed silently. Persists across F5 via localStorage("edha-debug"); edha.debug(false) stops it.
 * Off = zero behaviour change. Hooks.on is wrapped only during THIS file's top-level execution
 * (restored at the bottom of the file), so only edha-content handlers carry the tracer. */
let edhaDebugOn = false;
try { edhaDebugOn = localStorage.getItem("edha-debug") === "1"; } catch (e) {}
function edhaSetDebug(v) {
  edhaDebugOn = !!v;
  try { localStorage.setItem("edha-debug", edhaDebugOn ? "1" : "0"); } catch (e) {}
  console.log(`[EDHA-TEST] debug tracing ${edhaDebugOn ? "ON — handlers log as they fire; persists across reloads (edha.debug(false) to stop)" : "OFF"}`);
  return edhaDebugOn;
}
function edhaDebugArg(a) {
  try {
    if (a === null || typeof a !== "object") return String(a);
    const c = a.constructor?.name || "obj";
    const n = a.name ?? a.actor?.name ?? a.document?.name ?? a.parent?.name;
    if (n) return `${c}(${n})`;
    if (a.total !== undefined) return `${c}(total=${a.total})`;
    return c;
  } catch (e) { return "?"; }
}
// Full-session capture: the browser only retains the last ~1000 console lines logged while DevTools
// is CLOSED, which truncated both 07-12 pass-3 logs to their tails. Every tracer line is therefore
// ALSO kept in this in-memory buffer (while debug is ON), and edha.debugSave() downloads the whole
// session as a file — no DevTools required, complete from world load.
const edhaDebugBuf = [];
const EDHA_DEBUG_BUF_MAX = 50000;   // ~a full test session; oldest lines drop past this
function edhaDebugOut(msg) {
  console.log(msg);
  try {
    edhaDebugBuf.push(`${new Date().toISOString()} ${msg}`);
    if (edhaDebugBuf.length > EDHA_DEBUG_BUF_MAX) edhaDebugBuf.splice(0, edhaDebugBuf.length - EDHA_DEBUG_BUF_MAX);
  } catch (e) {}
}
function edhaDebugSave() {
  const name = `edha-debug-${new Date().toISOString().replace(/[:.]/g, "-")}.log`;
  const text = edhaDebugBuf.join("\n") || "(edha debug buffer is empty — turn tracing on with edha.debug(true) first)";
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    console.log(`[EDHA-TEST] saved ${edhaDebugBuf.length} buffered line(s) → ${name}`);
  } catch (e) { console.error("[EDHA-TEST] debugSave failed", e); }
  return name;
}
const edhaHooksOnRaw = Hooks.on;
Hooks.on = function (hook, fn, ...rest) {
  // Label = fn name + the REGISTRATION line in this file ("anon@L1035"), parsed from the stack at
  // registration time — 17 registered useItem arms all logged "(anonymous)" on the 07-12 pass,
  // which made one item-use unreadable. The line number maps each log line back to source.
  let regLine = "";
  try { const m = ((new Error()).stack?.split("\n")[2] || "").match(/:(\d+):\d+\)?\s*$/); if (m) regLine = `@L${m[1]}`; } catch (e) {}
  const label = (fn?.name || "anon") + regLine;
  const traced = function (...args) {
    if (!edhaDebugOn) return fn.apply(this, args);
    edhaDebugOut(`[EDHA-TEST] hook=${hook} fn=${label} args=[${args.map(edhaDebugArg).join(", ")}]`);
    let out;
    try { out = fn.apply(this, args); }
    catch (e) { edhaDebugOut(`[EDHA-TEST] hook=${hook} fn=${label} THREW ${e?.message ?? e}`); console.error(e); throw e; }
    if (out === false) edhaDebugOut(`[EDHA-TEST] hook=${hook} fn=${label} → returned false (cancels the ${hook})`);
    else if (out instanceof Promise) out.catch((e) => { edhaDebugOut(`[EDHA-TEST] hook=${hook} fn=${label} async ERROR ${e?.message ?? e}`); console.error(e); });
    return out;
  };
  return edhaHooksOnRaw.call(Hooks, hook, traced, ...rest);
};
Hooks.once("ready", () => {
  // Side listener for the GM relay: shows every socket message REACHING this client, so a dead
  // cross-actor feature splits into "emit never arrived" vs "arrived but the handler bailed".
  try { game.socket.on("module.edha-content", (data) => { if (edhaDebugOn) edhaDebugOut(`[EDHA-TEST] socket action=${data?.action} (this client isGM=${game.user?.isGM}) ${JSON.stringify(data?.payload ?? "")}`); }); } catch (e) {}
  if (edhaDebugOn) console.log("[EDHA-TEST] debug tracing is ON (persisted) — edha.debug(false) to disable");
});

const LEYLINE_SKILLS = {
  white: { label: "White", attribute: "wil" },
  blue:  { label: "Blue",  attribute: "int" },
  black: { label: "Black", attribute: "pre" },
  red:   { label: "Red",   attribute: "str" },
  green: { label: "Green", attribute: "awa" },
};

// Custom PATH TYPES so leyline/deity `path` items validate and the sheet shows their own
// "Leyline Path" / "Deity Path" sections (heroic paths already use the built-in "heroic" type).
const PATH_TYPES = { leyline: "Leyline", deity: "Deity" };

function registerContent(phase) {
  const COSMERE = globalThis.CONFIG?.COSMERE;
  if (!COSMERE || !COSMERE.skills) return false;
  let added = 0;
  for (const [key, def] of Object.entries(LEYLINE_SKILLS)) {
    if (!COSMERE.skills[key]) added++;
    COSMERE.skills[key] = { key, label: def.label, attribute: def.attribute, core: true };
    try {
      const attr = COSMERE.attributes?.[def.attribute];
      if (attr && Array.isArray(attr.skills) && !attr.skills.includes(key)) attr.skills.push(key);
    } catch (e) { /* non-fatal */ }
  }
  // path types
  try {
    if (COSMERE.paths?.types) {
      for (const [id, label] of Object.entries(PATH_TYPES)) {
        if (!COSMERE.paths.types[id]) COSMERE.paths.types[id] = { label };
      }
    }
    // also try the documented API if present
    const api = globalThis.cosmereRPG?.api || globalThis.game?.cosmereRPG?.api;
    if (api?.registerPathType) for (const [id, label] of Object.entries(PATH_TYPES)) { try { api.registerPathType({ id, label }); } catch (e) {} }
  } catch (e) { /* non-fatal */ }
  // E8: NO custom action section. The system already auto-creates a per-path "{path name} Actions"
  // group via its built-in `paths` dynamic generator (sortOrder 200; filter = talents with a Parent
  // relationship to that path). A path's granted talents (incl. its Key) land in that folder on their
  // own — e.g. "Blue Leyline Attunement" -> "Blue Actions", "Opportunist" -> "Agent Actions". An
  // earlier custom "Leyline Actions" section (sortOrder 50) wrongly intercepted leyline talents before
  // the path section could claim them, so it was removed. Nothing to register here.
  console.log(`Edha Content | [${phase}] skills(core)+${added} new; path types: ${Object.keys(PATH_TYPES).join(",")}; CONFIG.COSMERE.skills=${Object.keys(COSMERE.skills).length}, paths.types=${Object.keys(COSMERE.paths?.types || {}).join(",")}`);
  return true;
}
const registerLeylineSkills = registerContent;

// 1) Attempt immediately on module load (earliest possible — beats lazy schema build).
registerLeylineSkills("load");

// 2) Guaranteed-safe hooks (CONFIG.COSMERE is definitely present by init).
Hooks.once("init", () => registerLeylineSkills("init"));
Hooks.once("setup", () => registerLeylineSkills("setup"));

Hooks.once("ready", () => {
  const have = Object.keys(LEYLINE_SKILLS).filter(k => CONFIG?.COSMERE?.skills?.[k]?.core === true);
  console.log(`Edha Content | ready — leyline skills registered as core: ${have.join(", ") || "(NONE — registration failed)"}`);
});

/* --- Custom Edha STATUSES (Weakened / Diagnosed / Insight) -------------------------------------
 * The system maps CONFIG.COSMERE.statuses → CONFIG.statusEffects in its OWN init
 * (registerStatusEffects, index.js ~L28524), which runs BEFORE module init hooks. So we both add to
 * CONFIG.COSMERE.statuses (immunities/labels/condition checks) AND append the mapped entries to
 * CONFIG.statusEffects ourselves (token HUD + toggleStatusEffect). _id must be 16 alphanumerics.
 * NOTE: Black Draw Mana already checks CONFIG.COSMERE.statuses.weakened — registering the status
 * makes its Weaken-enemies rider auto-apply. Insight is STACKABLE (Gnothis counter, like Exhausted).
 */
const EDHA_STATUSES = {
  weakened:  { label: "Weakened",  icon: "icons/svg/downgrade.svg", condition: true,  _id: "condweakened0000" },
  diagnosed: { label: "Diagnosed", icon: "icons/svg/eye.svg",       condition: false, _id: "conddiagnosed000" },
  insight:   { label: "Insight",   icon: "icons/svg/book.svg",      condition: false, _id: "condinsight00000", stackable: true },
  omen:      { label: "Omen",      icon: "icons/svg/hazard.svg",    condition: false, _id: "condomen00000000" },   // Chaos (Maelith) — the fracture mark
  isolated:  { label: "Isolated",  icon: "icons/svg/net.svg",       condition: true,  _id: "condisolated0000" },   // inflictable Isolation (OR'd into edhaIsIsolated)
  exalted:    { label: "Exalted",    icon: "icons/svg/upgrade.svg", condition: false, _id: "condexalted00000" },   // Sovereignty (Verdannis) — damage die stepped UP
  diminished: { label: "Diminished", icon: "icons/svg/degen.svg",   condition: false, _id: "conddiminished00" },   // Sovereignty (Verdannis) — damage die stepped DOWN
  harvested:  { label: "Harvested Remain", icon: "icons/svg/skull.svg",  condition: false, _id: "condharvested000", tint: "#3a9d4a" },  // Death (Morrath) — corpse marked by Reaper's Harvest (green skull, beside the black defeated overlay)
  decaying:   { label: "Decaying",         icon: "icons/svg/poison.svg", condition: false, _id: "conddecaying0000", tint: "#3a9d4a" },  // Death (Morrath) — Consuming Decay (own id: never collides with real Black afflictions)
  cascadearmed: { label: "Cascade Armed (Necrotic Cascade)", icon: "icons/svg/explosion.svg", condition: false, _id: "condcascadearmed", tint: "#3a9d4a" },  // Death (Morrath) — 07-24r: the SCENE-ARMING marker, replacing the bespoke `cascadeArmed` flag. Same reasoning as `crowned`: a status is what a document-driven rule can both set (edha-self-status) and read (edha-watch requireSelfStatus), and it makes "am I armed?" visible on the token.
  compelled:  { label: "Compelled",  icon: "icons/svg/target.svg", condition: true, _id: "condcompelled000" },   // Power (Tyrith) — Kneel's control mark (NOT core prone — Ben R1, 07-02c); timed owner-relative
  frightened: { label: "Frightened", icon: "icons/svg/terror.svg", condition: true, _id: "condfrightened00" },   // Power (Tyrith) — GM-applied marker (nothing auto-inflicts it yet); Kneel's advantage passive + Absolute Authority's gate read it
  crowned:    { label: "Crowned (Crown of Thorns armed)", icon: "icons/svg/regen.svg", condition: false, _id: "condcrowned00000", tint: "#8b1a3a" },   // Power (Tyrith) — 07-24q: the SCENE-ARMING marker, replacing the bespoke `crownActive` flag. A status (not a flag) because it is what a document-driven rule can both set (edha-self-status) and read (edha-watch requireSelfStatus); also makes "am I armed?" visible on the token.
  edict:      { label: "Edict-Bound", icon: "icons/svg/padlock.svg", condition: false, _id: "condedict0000000", tint: "#4a7bd0" },  // Order (Tessavain) — bound by a declared Edict / Final Decree (blue padlock; shared across owners, cleared when NO owner's law still binds)
  covenant:   { label: "Covenant",    icon: "icons/svg/aura.svg",    condition: false, _id: "condcovenant0000", tint: "#e8e4d8" },  // Order (Tessavain) — pact ally marker (the +1-defenses proximity AE is separate, watcher-managed)
  concord:    { label: "Concord (allies' first strike)", icon: "icons/svg/dove.svg", condition: false, _id: "condconcord00000", tint: "#e8e4d8" },  // Order (Tessavain) — 2bV: the scene arm the list-member-hits damage-bonus reads (was the `concordActive` flag; a status so a document rule can set AND read it). Cleared by the Order scene reset.
  noactions:    { label: "Cannot Act (Hollow Command)",   icon: "icons/svg/paralysis.svg", condition: true, _id: "condnoactions000" },   // Black/Subjugation — Hollow Command landed; expires end of the target's next turn (Ben 07-05)
  noreactions:  { label: "No Reactions (Extract Thought)", icon: "icons/svg/daze.svg",     condition: true, _id: "condnoreactions0" },   // Black/Subjugation — Extract Thought landed; expires end of the OWNER's next turn (Ben 07-05)
  doubledipped: { label: "Double-Dipped", icon: "icons/svg/blood.svg", condition: false, _id: "conddoubledip000", tint: "#b03060" },   // Black/Ritual — Double Dip's scene mark made VISIBLE (Ben 07-12: "hard to tell whether you're contributing to the Reservoir or using from it"); cleared with the flag at scene end
  braced:     { label: "Braced (attacks at disadvantage)", icon: "icons/svg/shield.svg", condition: true,  _id: "condbraced000000" },   // 07-16b playtest pass — Trooper/Captain Brace (timed via explicit edhaApplyTimedStatus stamp) + Frostbinder's PERMANENT Predictive Ward marker; deliberately NOT in EDHA_TIMED_STATUSES (the Ward must never auto-expire)
  diagrammed: { label: "Vital Diagram",                    icon: "icons/svg/blood.svg",  condition: false, _id: "conddiagrammed00", tint: "#d04a4a" },   // 07-16b — the Stitchmother's anatomical mark; Scalpel-Strike's +4 rides whenTargetStatus on it (scene-long, GM-cleared)
  clearsight: { label: "Clearsight (veils suppressed nearby)", icon: "icons/svg/sun.svg", condition: false, _id: "condclearsight00", tint: "#3a9d4a" },   // Green (Instinct) — 07-25 pass 2bS: the SCENE-ARMING marker (edha-self-status writes it, edha-suppress-veil rules read it); enemy dark-veil markers in range stay down while it is up. Cleared at combat end (the Kindle-light convention).
  packsight:  { label: "Pack Sight (allies share your mark)",  icon: "icons/svg/eye.svg",   condition: false, _id: "condpacksight000", tint: "#8b1a3a" },   // Knowledge (Gnothis) — 07-25 pass 2bT: Pack Share's SCENE-ARMING marker (edha-self-status writes it, the ally-hits-counter-bearer damage-bonus rule reads it). Cleared with the counter state at combat end.
  packmind:   { label: "Pack Mind (pack strikes as one)",      icon: "icons/svg/sound.svg", condition: false, _id: "condpackmind0000", tint: "#8b1a3a" },   // Knowledge (Gnothis) — 07-25 pass 2bT: the second armed rider's SCENE-ARMING marker, same shape as packsight.
  predprimed: { label: "Primed Strike (next weapon hit)",      icon: "icons/svg/sword.svg", condition: false, _id: "condpredprimed00", tint: "#8b1a3a" },   // Knowledge (Gnothis) — 07-25 pass 2bT: the armed-next-weapon-hit marker (edha-self-status writes it; the armed-self-status damage-bonus rule CONSUMES it on the hit). Cleared with the counter state at combat end.
  warlord:     { label: "Warlord's Advance (next melee hit)", icon: "icons/svg/sword.svg",     condition: false, _id: "condwarlord00000", tint: "#8b1a3a" },  // Power (Tyrith) — 07-25 pass 2bU: armed-next-hit marker (the predprimed shape); a ranged hit stands down WITHOUT consuming (meleeOnly). Cleared at combat end.
  momentum:    { label: "Momentum of Victory (next weapon hit)", icon: "icons/svg/wingfoot.svg", condition: false, _id: "condmomentum0000", tint: "#8b1a3a" },  // Power (Tyrith) — 2bU: the free-Strike +tier arm. Cleared at combat end.
  fury:        { label: "Warlord's Fury (scene tally)",       icon: "icons/svg/blood.svg",     condition: false, _id: "condfury00000000", tint: "#8b1a3a" },  // Power (Tyrith) — 2bU: the scene arm whose @tally the tallyKills damage-bonus mode counts. Cleared at combat end.
  unstoppable: { label: "Unstoppable Advance",                icon: "icons/svg/stone-path.svg", condition: false, _id: "condunstoppable0", tint: "#8b1a3a" },  // Power (Tyrith) — 2bU: timed arm (end of your next turn); immuneStatuses shrugs Slowed/Immobilized/Prone; the token-move watch trample keys on it. Cleared at combat end.
  mantled:     { label: "Mantle of the Aspirant",             icon: "icons/svg/crown.svg",     condition: false, _id: "condmantled00000", tint: "#8b1a3a" },  // Power (Tyrith) — 2bU: the capstone's scene arm (melee spirit rider + ally test aura + damage redirect all read it). Cleared at combat end.
  withernext:  { label: "Withering Touch (next melee hit)", icon: "icons/magic/death/hand-withered-gray.webp", condition: false, _id: "condwithernext00", tint: "#3a9d4a" },  // Death (Morrath) — 2bW: the armed-next-melee-hit marker (the predprimed shape); edha-self-status writes it, the armed-self-status damage-bonus rule CONSUMES it on the hit (a definitively ranged hit stands down WITHOUT consuming). Cleared by the Death scene reset.
  "tagged":    { label: "Tagging Shot (next ranged hit)",   icon: "icons/svg/target.svg",    condition: false, _id: "condtagged000000", tint: "#8b6a1a" },  // heroic/Hunter — 2bX: the armed-next-ranged-hit marker (the predprimed shape); edha-self-status writes it, the armed-self-status damage-bonus rule CONSUMES it on the hit (a definitively melee hit stands down WITHOUT consuming — rangedOnly). Timed: expires end of the owner's next turn.
  quarry:      { label: "Quarry",                            icon: "icons/svg/target.svg",    condition: false, _id: "condquarry000000", tint: "#8b6a1a" },  // heroic/Hunter — 2bX: the marked-quarry token icon (the H3 `quarry` ledger's marker status, cap 1, follows the creature). Placed by Seek Quarry's H3 rule or Tagging Shot's placeList hit; cleared by the ledger's own unmark paths (Cold Eyes, eviction).
};
function edhaRegisterStatuses(phase) {
  try {
    const COSMERE = globalThis.CONFIG?.COSMERE;
    if (!COSMERE?.statuses || !Array.isArray(CONFIG.statusEffects)) return false;
    let added = 0;
    for (const [id, def] of Object.entries(EDHA_STATUSES)) {
      if (!COSMERE.statuses[id]) COSMERE.statuses[id] = { label: def.label, icon: def.icon, condition: def.condition, ...(def.stackable ? { stackable: true } : {}) };
      if (!CONFIG.statusEffects.some(s => s.id === id)) {
        // `stacks`, NOT `count`: ActiveEffectDataModel's schema is EXACTLY {isStackable, stacks},
        // so a `count` seed is silently dropped by the DataModel (2026-07-27h — the counter economy
        // read 0 for a year). The system's own registerStatusEffects seeds `count: 1` too and is
        // wrong in the same way; it gets away with it because CosmereActiveEffect#stacks falls back
        // to `?? 1`. We seed the real field so the stored document is truthful.
        CONFIG.statusEffects.push({ id, name: def.label, img: def.icon, _id: def._id, ...(def.tint ? { tint: def.tint } : {}), ...(def.stackable ? { system: { isStackable: true, stacks: 1 } } : {}) });
        added++;
      }
    }
    if (added) console.log(`Edha Content | [${phase}] custom statuses registered: ${Object.keys(EDHA_STATUSES).join(", ")}`);
    return true;
  } catch (e) { console.error("Edha Content | status registration failed", e); return false; }
}
Hooks.once("init",  () => edhaRegisterStatuses("init"));   // after the system's registerStatusEffects
Hooks.once("setup", () => edhaRegisterStatuses("setup"));  // belt-and-braces (idempotent)

/* --- Edha CURRENCY: the Ledger Standard (W25 — canon §5d, rulings 54/58) ------------------------
 * ONE registered currency, mechanical copper/silver/gold at 1:10:100. The flavor names (stroke/
 * seal/charter), ribbon-edge, and mint lore are DESCRIPTION-ONLY by ruling 54 — sheets, prices,
 * and loot always speak c/s/g so players never convert in their heads. Array order is
 * gold → silver → copper (big → normal → small, Ben's readability ruling) in case the sheet
 * renders denominations in array order; copper is base (conversionRate 1) so every anchor price
 * (canon §5d: bread 1c, day's labor 10c, sword 200c) is an integer. Registration mirrors the
 * leyline-skills pattern: documented api when present + direct CONFIG.COSMERE.currencies write,
 * idempotent, at load/init/setup (the actor DataModel derives its currency fields from the
 * registered set, so this must exist before actor schemas build).
 * ⚑ bench (ruling 54): (1) does the sheet order denominations by array position or
 * conversionRate; (2) can the Roshar "spheres" row be hidden/replaced or does it sit alongside;
 * (3) do PRE-EXISTING actors backfill the new currency field on load (new actors get it from
 * schema defaults).
 */
const EDHA_CURRENCY = {
  id: "edha",
  label: "Edha Coin",
  icon: "icons/svg/chest.svg",
  denominations: {
    primary: [
      { id: "gold",   label: "Gold",   unit: "g", conversionRate: 100 },
      { id: "silver", label: "Silver", unit: "s", conversionRate: 10 },
      { id: "copper", label: "Copper", unit: "c", conversionRate: 1, base: true },
    ],
  },
};
function edhaRegisterCurrency(phase) {
  const COSMERE = globalThis.CONFIG?.COSMERE;
  if (!COSMERE || !COSMERE.currencies) return false;
  const had = !!COSMERE.currencies[EDHA_CURRENCY.id];
  try {
    // The documented surface (schema dump 07-17c: game.system.api.registerCurrency) — let the
    // system do any wiring beyond the CONFIG entry (registries, sheet caches) when it exists.
    const api = globalThis.game?.system?.api;
    if (!had && api?.registerCurrency) api.registerCurrency({ ...EDHA_CURRENCY });
  } catch (e) { console.warn("Edha Content | registerCurrency api failed; using the CONFIG write", e); }
  if (!COSMERE.currencies[EDHA_CURRENCY.id]) {
    const { id, ...def } = EDHA_CURRENCY;
    COSMERE.currencies[id] = def; // same shape as the system's own 'spheres' entry
  }
  if (!had && COSMERE.currencies[EDHA_CURRENCY.id])
    console.log(`Edha Content | [${phase}] currency 'edha' registered (Gold/Silver/Copper, base=copper 1:10:100)`);
  return true;
}
edhaRegisterCurrency("load");
Hooks.once("init",  () => edhaRegisterCurrency("init"));
Hooks.once("setup", () => edhaRegisterCurrency("setup"));
/* Currency SEEDING (07-18j — the items dump answered bench 9–10): the sheet renders one derived,
 * uneditable field because actors ship `currency.<id>.denominations: []` — even the system's own
 * spheres. Per-denomination rows appear (and are editable) only once the array holds entries
 * ({id, amount} — element shape from the dump's character DataModel). New characters get seeded
 * gold→silver→copper at create (array order = the big→normal→small display order Ben ruled);
 * existing ones backfill once at ready (GM applier). ⚑ bench: the rows render editable; the
 * spheres row stays unseeded on purpose — note whether it still shows a dead row.
 */
const EDHA_CURRENCY_SEED = () => [{ id: "gold", amount: 0 }, { id: "silver", amount: 0 }, { id: "copper", amount: 0 }];
Hooks.on("preCreateActor", (doc) => {
  try {
    if (doc.type !== "character") return;
    if ((doc._source?.system?.currency?.edha?.denominations ?? []).length) return;
    doc.updateSource({ "system.currency.edha.denominations": EDHA_CURRENCY_SEED() });
  } catch (e) { /* non-fatal */ }
});
Hooks.once("ready", () => {
  try {
    if (!edhaDefBuffGmGate()) return;
    (async () => {
      let n = 0;
      for (const a of (game.actors?.filter?.(x => x.type === "character") ?? [])) {
        if ((a._source?.system?.currency?.edha?.denominations ?? []).length) continue;
        try { await a.update({ "system.currency.edha.denominations": EDHA_CURRENCY_SEED() }); n++; } catch (e) {}
      }
      if (n) console.log(`Edha Content | currency denominations seeded on ${n} character(s) (gold/silver/copper rows).`);
    })();
  } catch (e) { /* non-fatal */ }
});
Hooks.once("ready", () => {
  const ok = !!globalThis.CONFIG?.COSMERE?.currencies?.edha;
  console.log(`Edha Content | ready — currency 'edha' ${ok ? "registered" : "MISSING (registration failed)"}`);
});

/* --- Edha CULTURES: the ten nations, registered at `init` (fix pass 5, 2026-09-06) ---------------
 * Bench runs 32/33: every one of the ten Edha culture items logs
 * `CosmereItem [<id>] validation errors: system: id: <slug> is not a valid choice` on every pack
 * load, and the slug is DROPPED — all ten come back with `_source.system.id === "none"`.
 *
 * The cause is a CLOSED enum plus an EAGER schema. `scripts/foundry-build.js` writes
 * `system.id = slugify(name)` on each culture doc; the system's culture DataModel declares that
 * field as `IdItemMixin({ initial: "none", choices: () => ["none", ...Object.keys(
 * CONFIG.COSMERE.cultures)] })`, and its schema factory CALLS that function once, at
 * `defineSchema()` time, freezing whatever `CONFIG.COSMERE.cultures` held at that instant into the
 * StringField. `game.system.api.registerCulture()` afterwards updates `CONFIG.COSMERE.cultures` —
 * bench run 33 measured that it does — but the frozen `choices` array never sees it, so a runtime
 * registration is provably too late. The registration has to land BEFORE the first culture document
 * is constructed, i.e. in `init`, which is also where the system registers its own six.
 *
 * With the ten registered the ALREADY-BUILT pack becomes valid as-is: the docs still carry their
 * slugs, the slugs are now legal choices, the lenient load stops substituting `"none"`, and the two
 * system-side readers that were latently broken start working — a talent-tree node prerequisite of
 * type `culture` can finally name a nation instead of baking `"none"` and matching all ten. So this
 * is **ENGINE-ONLY (F5)** and there is NO pack rebuild owed. The alternative the run-33 row named as
 * a fallback — stop writing `system.id` in `foundry-build.js` — is REJECTED here: it needs a rebuild
 * AND it would make the culture-prereq surface permanently unusable.
 *
 * The ids are `slugify(name)` over the ten entries of `data/cultures.json`, which is the same
 * derivation the pack build uses. `data/cultures.json` is a GENERATOR INPUT and is not shipped into
 * the module, and `init` is far too early to read a compendium, so the list is carried here — and
 * `scripts/lint-refs.js` pass 22 fails the build if this table and `data/cultures.json` ever
 * disagree, in either direction. Add a nation there and the gate tells you to add it here.
 * 🤖 The ORDERING claim (this `init` callback runs before the culture schema is built) is the one
 * half no headless test can prove — it is a bench row for the next run. */
const EDHA_CULTURES = [
  { id: "kettavar", label: "Kettavar" },
  { id: "malcurr", label: "Malcurr" },
  { id: "corvaine", label: "Corvaine" },
  { id: "thalendor", label: "Thalendor" },
  { id: "goldenport", label: "Goldenport" },
  { id: "vorsk", label: "Vorsk" },
  { id: "lunavar", label: "Lunavar" },
  { id: "canticle", label: "Canticle" },
  { id: "sylvaneth", label: "Sylvaneth" },
  { id: "ashkar", label: "Ashkar" },
];
function edhaRegisterCultures(phase) {
  const COSMERE = globalThis.CONFIG?.COSMERE;
  if (!COSMERE || !COSMERE.cultures) return false;
  const api = globalThis.game?.system?.api;
  const added = [];
  for (const c of EDHA_CULTURES) {
    if (COSMERE.cultures[c.id]) continue;   // idempotent across init/setup, and never fights the system's own six
    try {
      // The documented surface first (it is what the system calls for its own cultures), so any
      // registry wiring beyond the CONFIG entry happens; the direct write is the fallback.
      if (api?.registerCulture) api.registerCulture({ id: c.id, label: c.label, source: "edha-content", priority: -1 });
    } catch (e) { console.warn(`Edha Content | registerCulture api failed for '${c.id}'; using the CONFIG write`, e); }
    if (!COSMERE.cultures[c.id]) COSMERE.cultures[c.id] = { label: c.label };
    if (COSMERE.cultures[c.id]) added.push(c.id);
  }
  if (added.length) console.log(`Edha Content | [${phase}] cultures registered: ${added.join(", ")}`);
  return true;
}
Hooks.once("init",  () => edhaRegisterCultures("init"));    // MUST be init — the culture DataModel freezes its `choices` at defineSchema()
Hooks.once("setup", () => edhaRegisterCultures("setup"));   // belt-and-braces (idempotent); still fixes CONFIG for the prereq dialog if init was somehow missed
Hooks.once("ready", () => {
  const have = EDHA_CULTURES.filter(c => globalThis.CONFIG?.COSMERE?.cultures?.[c.id]).length;
  console.log(`Edha Content | ready — Edha cultures registered: ${have}/${EDHA_CULTURES.length}${have === EDHA_CULTURES.length ? "" : " (culture items will log validation errors and load with system.id 'none')"}`);
});

/* --- WEAKENED mechanic (2026-06-11c; reworked 2026-06-13) ---------------------------------------
 * Ruling (Ben): a Weakened creature has DISADVANTAGE on EVERY physical test (str/spd attribute) while
 * the condition lasts, and Weakened ALWAYS falls off at the END of the creature's next turn. It is no
 * longer consumed by the first physical test (that was too weak — the Black tree's Weakened payoffs,
 * Spoils of Isolation / Sovereign of Solitude / Predatory Patience, need it to survive to the
 * attacker's turn). Disadvantage is applied via the system's d20 roll pipeline:
 * `cosmere-rpg.pre{Skill|Attack|Item}Roll` (roll, source, config) fires BEFORE the dialog/evaluate
 * (d20Roll, index.js ~L5266).
 *  ⚠ THE CHANNEL IS A **STRING** ENUM, and BOTH halves below are required. `AdvantageMode`
 *    (index.js L262-267) is `{None:"none", Advantage:"advantage", Disadvantage:"disadvantage"}` and
 *    `D20Roll.hasAdvantage` is `options.advantageMode === "advantage"` — a NUMBER (or any other
 *    string) reads as none and `configureModifiers()` leaves a plain `1d20`, with no error anywhere.
 *    Two sites shipped that way and neither ever worked: the retired `edhaStanceAdvPreRoll` and
 *    `edhaQuarryAdvPreRoll` (fixed 07-27l, after four bench attacks rolled `1d20 + 4`).
 *    **`scripts/lint-refs.js` pass 13 + `tests/advantage-channel.test.js` now gate both halves.**
 *  - Fast-forward rolls: the D20Roll is already built when preRoll fires → set
 *    roll.options.advantageMode and re-run configureModifiers() (idempotent: resets d20 number/mods).
 *  - Dialog rolls: configureDialog OVERWRITES options.advantageMode from data.skillTest.advantageMode
 *    (default None, ~L3577/3903) → wrap the instance's configureDialog to pre-seed disadvantage; the
 *    dialog opens with it selected and the GM can still toggle it off (override).
 *  - Expiry: handled by the generic timed-status pass below (NOT a post-roll consume), so disadvantage
 *    re-applies to every physical test until the condition expires at the end of the creature's next turn.
 */
const EDHA_PHYSICAL_ATTRS = new Set(["str", "spd"]);

/* PURE. Read a NUMBER that an author may legitimately have set to 0 — a free ability, a
 * whole-scene (0 ft) cue, a zero-distance push, a zeroed injury cost.
 *
 * `Number(x) || fallback` is WRONG for those, because 0 is falsy: it silently reverts a deliberate
 * authored 0 to the code's default. That shipped as a live bug — `edhaReknitClick` read
 * `Number(ds.edhaCost) || 2`, so a rule authoring `costTemporary: 0` rendered "−0 Investiture" on
 * the card (the generator uses a correct `== null` test) and then charged **2** on the click
 * (bench run 20, 2026-07-28f). Use this instead wherever the value comes from a rule's config, a
 * chat-card dataset, or a data file. Blank/absent/non-numeric falls back; 0 does not.
 *
 * NOT for runtime Foundry lookups (grid.size, actor.system.tier, a Math.hypot magnitude): 0 there
 * is a failed/degenerate read, and `|| fallback` is the right guard. The provenance of the value
 * decides, not the shape of the expression — see ENGINE_INDEX's ⛑ falsy-zero family. */
function edhaNumOr(v, fallback) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Resolve the rolling actor from a d20Roll config: Item/Attack rolls carry the item in data.source;
// plain skill rolls only identify the actor via messageData.speaker (set by rollSkill).
function edhaD20RollActor(config) {
  try {
    const src = config?.data?.source;
    if (src?.actor) return src.actor;                         // item / attack → owning actor
    if (src?.documentName === "Actor") return src;
    const spk = config?.messageData?.speaker;
    if (spk) return ChatMessage.getSpeakerActor(spk) ?? null; // skill test → speaker
  } catch (e) {}
  return null;
}

function edhaWeakenedPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.statuses?.has?.("weakened")) return;
    const attr = roll?.data?.skill?.attribute ?? config?.defaultAttribute;
    if (!EDHA_PHYSICAL_ATTRS.has(attr)) return;
    roll.options.advantageMode = "disadvantage";   // AdvantageMode.Disadvantage
    roll.options._edhaWeakened = true;
    roll.configureModifiers?.();
    const origDialog = roll.configureDialog?.bind(roll);
    if (origDialog) roll.configureDialog = async (data) => {
      try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "disadvantage"; } catch (e) {}
      return origDialog(data);
    };
  } catch (e) { console.error("Edha Content | Weakened pre-roll failed", e); }
}

for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaWeakenedPreRoll);   // disadvantage on every str/spd test while Weakened
}

/* --- TEST MODIFIER RIDER (2026-06-13) ----------------------------------------------------------
 * Predatory Patience: "+[Die] to the test when you attack a Weakened creature." The system can't be
 * told to boost an attack/skill TEST from a passive, but its skill-test dialog has a "Temporary Bonus"
 * field (name=temporaryMod) parsed as a standard Roll formula (index.js: new Roll('0 + ' + value)).
 * We inject the same way the system does on dialog-submit — append the resolved bonus term(s) to the
 * already-constructed (un-evaluated) D20Roll in the pre{Skill|Attack|Item}Roll hook, then resetFormula.
 * Works for fast-forward AND dialog rolls (we don't seed the field, so the dialog can't double-count),
 * and shows in the roll breakdown. Driven by each talent's own `edha-test-rider` rule (Events tab):
 * bonusFormula resolved against the roller's data; gated by appliesTo / whenTargetStatus / whenTargetIsolated.
 */
// Fold computed die math into plain dice so the roll breakdown reads clean: after replaceFormulaData a
// rider like "1d(2 * 3 + 2)" would show verbatim in the d20 breakdown (Ben, 07-05 Black pass). Evaluate
// the parenthetical faces/count numerically → "1d8". Leaves anything it can't safely evaluate alone.
function edhaFoldDieMath(f) {
  const evalOr = (expr) => { try { const v = Roll.safeEval(expr); return Number.isFinite(v) ? String(Math.max(1, Math.floor(v))) : null; } catch (e) { return null; } };
  let s = String(f);
  for (let i = 0; i < 4; i++) {
    const n = s
      .replace(/d\(([^()]+)\)/g, (m, expr) => { const v = evalOr(expr); return v == null ? m : `d${v}`; })
      .replace(/\(([^()]+)\)(?=d\d)/g, (m, expr) => { const v = evalOr(expr); return v == null ? m : v; });
    if (n === s) break;
    s = n;
  }
  return s;
}
// appliesTo gate for test riders. The SYSTEM's roll contexts are CAPITALIZED — getSkillTestRollData
// sets context: isAttack ? 'Attack' : 'Item', rollSkill sets 'Skill' — while authored appliesTo is
// lowercase. The 07-12 pass-2 gate compared them raw, so it rejected every roll and the Predatory
// Patience die vanished from ALL tests (pass-3 Fail). Case-normalized here; pure, pinned in tests/.
// "attack" also matches an ITEM-context roll whose source item carries damage (an attack talent
// rolling through the item path) — but never a skill test (Ben ruling 07-12: no riding Deception).
function edhaTestCtxMatch(appliesTo, rawCtx, sourceHasDamage) {
  const want = String(appliesTo ?? "").toLowerCase();
  if (!want || want === "any") return true;
  const ctx = String(rawCtx ?? "").toLowerCase();
  if (!ctx) return true;   // unknown context → don't gate (pre-07-12 behavior)
  return want === ctx || (want === "attack" && ctx === "item" && !!sourceHasDamage);
}
// Chat formula-bar DISPLAY normalizer (Ben pass 3: Withering Ray's bar read "2d20kh+6)"). Two
// independent uglinesses, root-caused against the system source: the system rebuilds formulas via
// Roll.getFormula — terms joined with NO separators (the space-less "2d20kh+6" is 100%
// reproducible on any advantage roll) — and an unbalanced ")" can ride in via the roll dialog's
// UNVALIDATED "Temporary Bonus" splice (best-evidence producer of the stray paren). Display-only
// repair: drop unmatched closers, space the top-level operators (flavor [labels] untouched). Pure.
function edhaTidyFormula(s) {
  let out = "", depth = 0;
  for (const ch of String(s ?? "")) {
    if (ch === "(") depth++;
    else if (ch === ")") { if (depth === 0) continue; depth--; }   // unmatched closer → drop
    out += ch;
  }
  let res = "", inFlavor = 0;
  for (const ch of out) {
    if (ch === "[") inFlavor++;
    else if (ch === "]") inFlavor = Math.max(0, inFlavor - 1);
    if (!inFlavor && (ch === "+" || ch === "-")) { res = res.replace(/\s+$/, "") + ` ${ch} `; continue; }
    res += ch;
  }
  return res.replace(/\s{2,}/g, " ").trim();
}
/* PURE (pinned in tests/): join ONE rider term onto a formula (item 66). A rider whose formula starts
 * with a minus is written as an EXPLICIT subtraction — `base - 1d6` — because `base + -1d6` is
 * parser-hostile; anything else joins as `base + term`. `label` (the rider's source) is appended as
 * the flavor `[label]` when given, so the breakdown still names who gave what. BOTH next-test paths
 * (`edhaNextTestPreRoll` on the d20 side, `edhaWrapRollDamage` on the damage side) call this — it is
 * the one place the sign of a rider is read. */
function edhaJoinRiderTerm(base, formula, label) {
  const f = String(formula ?? "").trim();
  const tag = label ? `[${label}]` : "";
  return f.startsWith("-") ? `${base} - ${f.slice(1).trim()}${tag}` : `${base} + ${f}${tag}`;
}
// Formula-bar tidy binding: moved into the ONE renderChatMessageHTML decorations hook (Job 1, pass
// 5.3, end of file, right before the debug-tracer Hooks.on restore).
/* PURE (pinned in tests/): "any of the comma-list" status gate (H13, 2bU). A single value behaves
 * exactly as the pre-2bU equality check did. Blank matches NOTHING — callers gate on the field
 * being set at all, so a blank reaching this is a caller bug, not "no filter". `statuses` is any
 * has()-bearing set (Actor#statuses) or an iterable. */
function edhaStatusCsvMatch(csv, statuses) {
  const want = String(csv || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!want.length || !statuses) return false;
  const has = typeof statuses.has === "function" ? (s) => statuses.has(s) : (s) => Array.from(statuses).includes(s);
  return want.some(has);
}
function edhaTestRiderApply(roll, source, config) {
  try {
    if (roll?.options?._edhaTestRider) return;                 // idempotent (a re-fired pre-roll)
    const actor = edhaD20RollActor(config);
    if (!actor?.items) return;
    const ctx = config?.data?.context;                         // 'Skill' | 'Attack' | 'Item' (system casing)
    const ttok = edhaUserTargetToken();
    const target = ttok?.actor ?? null;
    const parts = [];
    let mode = "";                                             // advantage/disadvantage from a mode rule
    const activeStance = edhaActiveStance(actor);              // null unless a stance marker is up
    for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-test-rider")) {
        if (!h.bonusFormula && !h.mode) continue;              // 07-24j: a rule may be mode-only
        // ⚑ bench: weapon attack vs Weakened gains the die; Extract Thought's Deception does not.
        if (!edhaTestCtxMatch(h.appliesTo, ctx, !!config?.data?.source?.system?.damage?.formula)) continue;
        if (h.whenTargetStatus && !edhaStatusCsvMatch(h.whenTargetStatus, target?.statuses)) continue;   // comma-list = any-of (H13)
        if (h.rangeColor && (!ttok || !edhaCasterToken(actor) || !edhaDeathInRange(actor, ttok, h.rangeColor))) continue;   // both tokens or no (H13)
        if (h.whenTargetIsolated && !(target && edhaIsIsolated(target))) continue;
        if (h.whenAttribute) { const a = roll?.data?.skill?.attribute ?? config?.defaultAttribute; if (!String(h.whenAttribute).split(/[,\s]+/).filter(Boolean).includes(a)) continue; }   // Burning Drive: Physical (str/spd)
        if (h.whenSkill && roll?.data?.skill?.id !== h.whenSkill) continue;                      // 07-24j: stance skill advantage (itm/ins/agi)
        if (h.unlessSkills && String(h.unlessSkills).split(/[,\s]+/).filter(Boolean).includes(roll?.data?.skill?.id)) continue;   // 2bY: exclude-list (Frenzied Tempo — Presence minus the casts)
        if (h.whileStanceActive && activeStance !== tal.name) continue;                          // 07-24j: only while THIS talent's stance is up
        if (h.whenFastTurn && !edhaIsFastTurn(actor)) continue;                                  // Momentum fast-turn payoffs
        if (h.whenSlowTurn && !edhaIsSlowTurn(actor)) continue;                                  // Calculated Patience (a real predicate, NOT !fast — see edhaIsSlowTurn)
        if (h.firstTestThisTurn && !edhaIsFirstTestThisTurn(actor)) continue;                    // Burning Drive: first test only
        if (h.unlessDisadvantage && roll?.options?.advantageMode === "disadvantage") continue;   // Apex Predator: never stomp an active disadvantage (07-25)
        const zoneNeed = Number(h.whenEnemiesInMyZone) || 0;                                     // Apex Predator: ≥N enemies in YOUR terrain (07-25)
        if (zoneNeed > 0 && edhaEnemiesInOwnedTerrain(actor).length < zoneNeed) continue;
        if (h.mode && !mode) mode = h.mode;                    // first matching mode wins; formulas still stack
        if (!h.bonusFormula) continue;
        const resolved = Roll.replaceFormulaData(h.bonusFormula, actor.getRollData(), { missing: "0" });
        if (resolved) parts.push(`${edhaFoldDieMath(resolved)}[${tal.name}]`);   // flavor label → the breakdown names the source talent
    }
    if (mode) {
      // ⚠ The system's enum is the STRING "advantage"/"disadvantage", and a DIALOG roll overwrites
      // roll.options from data.skillTest — so both halves are required (§ the pre-roll pipeline note
      // at the top of this file). The retired edhaStanceAdvPreRoll set `= 1` and wrapped neither,
      // which is why stance skill advantage never actually landed — and edhaQuarryAdvPreRoll made
      // the SAME two mistakes until 07-27l. Pinned: tests/advantage-channel.test.js + lint pass 13.
      roll.options.advantageMode = mode; roll.configureModifiers?.();
      const orig = roll.configureDialog?.bind(roll);
      if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = mode; } catch (e) {} return orig(data); };
      roll.options._edhaTestRider = true;   // guard BEFORE the parts check — a mode-only rule must
    }                                       // not re-wrap configureDialog on a re-fired pre-roll
    const rally = edhaRallyBonus(actor);                                                          // Battle Fever / Feeding Frenzy stack
    if (rally > 0) parts.push(`${rally}[Rally]`);
    if (!parts.length) return;
    const tempTerms = new Roll(`0 + ${parts.join(" + ")}`).terms;   // pre-resolved → no @-refs left
    roll.terms = roll.terms.concat(tempTerms.slice(1));             // drop the leading 0 operand
    roll.resetFormula();
    roll.options._edhaTestRider = true;
  } catch (e) { console.error("Edha Content | test-rider apply failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaTestRiderApply);   // +[Die] etc. to matching tests
}

/* --- The aggro ledger + pack advantage (07-16c, Ben's A2 ruling — Pack Tactics) -------------------
 * THE PUZZLE: Foundry targeting is per-USER and the GM owns every adversary — when hound A attacks,
 * no other hound "has a target" in Foundry's sense. THE FIX: the engine remembers each attacker
 * TOKEN's last attack target (the aggro ledger — written on every damaging item roll, per-token via
 * the synthetic-actor flag, cleared on combat end). `edha-pack-advantage` reads packmates' entries
 * at pre-roll: attacking a creature that a living same-item packmate last attacked → advantage,
 * stated on a whispered card. Post-roll recording means an attack never counts itself. Generic —
 * any pack/mob block authors the one rule. */
function edhaAggroRecord(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    if (!config?.data?.source?.system?.damage?.formula) return;   // damaging items only = attacks
    const target = edhaUserTargetToken(); if (!target?.actor) return;
    void edhaSetEdhaFlag(actor, "aggro", { targetUuid: target.actor.uuid, targetName: target.name, round: edhaCombatRoundOf(actor) });   // R-4/#28a: the ATTACKER's combat, not the viewed one
  } catch (e) { /* non-fatal */ }
}
function edhaPackAdvantageApply(roll, source, config) {
  try {
    if (roll?.options?._edhaPackAdv) return;
    const actor = edhaD20RollActor(config); if (!actor?.items) return;
    if (!config?.data?.source?.system?.damage?.formula) return;
    const target = edhaUserTargetToken(); if (!target?.actor) return;
    const myTok = edhaCasterToken(actor);
    for (const { item: tal } of edhaActorRulesOf(actor, "edha-pack-advantage")) {
        const mate = (canvas?.tokens?.placeables ?? []).find(t =>
          t !== myTok && t.actor && t.actor !== actor
          && (Number(t.actor.system?.resources?.hea?.value) || 0) > 0
          && t.actor.items?.some?.(i => edhaIsTalent(i) && i.name === tal.name)
          && t.actor.getFlag?.("edha-content", "aggro")?.targetUuid === target.actor.uuid);
        if (!mate) continue;
        roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
        const orig = roll.configureDialog?.bind(roll);
        if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
        roll.options._edhaPackAdv = true;
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐺 <strong>${tal.name}</strong>: ${mate.name} is also on ${target.name} — this attack rolls with <strong>advantage</strong>.</p>` });
        return;
    }
  } catch (e) { console.error("Edha Content | pack advantage failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaPackAdvantageApply);
  Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaAggroRecord);
}
Hooks.on("deleteCombat", (combat) => {
  try {
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a || edhaStillFightingElsewhere(a, guard)) continue;
      if (a.getFlag?.("edha-content", "aggro")) void a.unsetFlag("edha-content", "aggro");
    }
  } catch (e) {}
});

/* --- Generic timed-status EXPIRY (2026-06-13) --------------------------------------------------
 * Foundry/cosmere has no native "remove this status at the end of a turn" engine, so we run our own
 * on the core combat hooks (same pattern as the def-buff refresh below). An effect carrying
 * flags.edha-content.expireAfter = {round, turn} is removed once the combat pointer advances PAST that
 * coordinate (i.e. at the END of that turn). Weakened stamps itself on application (createActiveEffect,
 * GM-side) with the coordinate of the creature's NEXT turn:
 *   - applied before the creature acts this round (ti > current turn) → end of its turn THIS round;
 *   - applied on/after its turn (incl. its own turn) → end of its turn NEXT round.
 * Out of combat there is no turn structure, so it is not stamped on apply; it is lazily stamped (and
 * then expires normally) the first time the expiry pass sees it once combat is running.
 * Reusable: any future timed effect (e.g. Pyre/hazard durations) can set the same expireAfter flag.
 */
const EDHA_TURN_BASE = 10000;   // > any plausible combatant count, so the sequence stays monotonic across rounds
function edhaTurnSeq(round, turn) { return (Number(round) || 0) * EDHA_TURN_BASE + (Number(turn) || 0); }

