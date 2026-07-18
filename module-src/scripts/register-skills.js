/* Edha Content — register custom Leyline skills into the Cosmere RPG system.
 * (rev 2026-06-13: Weakened reworked — falls off at the END of the creature's next turn (no longer
 *  consumed by the first physical test); generic combat-turn status-expiry pass via flags.edha-content.expireAfter.
 *  rev 2026-06-12: playtest-1 fixes — Weakened relay, summon ownership, Targeted Only,
 *  Lay Foundation takeover + mechanics, hazard visuals, Construct Slam skill test)
 *
 * The five leyline colors (White/Blue/Black/Red/Green) become rankable skills on the
 * character sheet, so talent prerequisites like "White 2+" resolve natively.
 *
 * IMPORTANT system behaviour (cosmere-rpg v2.0.4):
 *  - The actor skills schema is built from `CONFIG.COSMERE.skills` (getSkillsSchema).
 *  - Skills with `core: false` are treated as CUSTOM and stay LOCKED/hidden unless the
 *    actor has a Power that unlocks them. So leyline skills must be registered with
 *    `core: true` to behave like the 18 standard skills (always available, rankable).
 *  - We register as early as possible (module load + init + setup) so the registration
 *    lands before the Actor data model schema is first built.
 */

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
const earlyOk = registerLeylineSkills("load");

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
  compelled:  { label: "Compelled",  icon: "icons/svg/target.svg", condition: true, _id: "condcompelled000" },   // Power (Tyrith) — Kneel's control mark (NOT core prone — Ben R1, 07-02c); timed owner-relative
  frightened: { label: "Frightened", icon: "icons/svg/terror.svg", condition: true, _id: "condfrightened00" },   // Power (Tyrith) — GM-applied marker (nothing auto-inflicts it yet); Kneel's advantage passive + Absolute Authority's gate read it
  edict:      { label: "Edict-Bound", icon: "icons/svg/padlock.svg", condition: false, _id: "condedict0000000", tint: "#4a7bd0" },  // Order (Tessavain) — bound by a declared Edict / Final Decree (blue padlock; shared across owners, cleared when NO owner's law still binds)
  covenant:   { label: "Covenant",    icon: "icons/svg/aura.svg",    condition: false, _id: "condcovenant0000", tint: "#e8e4d8" },  // Order (Tessavain) — pact ally marker (the +1-defenses proximity AE is separate, watcher-managed)
  noactions:    { label: "Cannot Act (Hollow Command)",   icon: "icons/svg/paralysis.svg", condition: true, _id: "condnoactions000" },   // Black/Subjugation — Hollow Command landed; expires end of the target's next turn (Ben 07-05)
  noreactions:  { label: "No Reactions (Extract Thought)", icon: "icons/svg/daze.svg",     condition: true, _id: "condnoreactions0" },   // Black/Subjugation — Extract Thought landed; expires end of the OWNER's next turn (Ben 07-05)
  doubledipped: { label: "Double-Dipped", icon: "icons/svg/blood.svg", condition: false, _id: "conddoubledip000", tint: "#b03060" },   // Black/Ritual — Double Dip's scene mark made VISIBLE (Ben 07-12: "hard to tell whether you're contributing to the Reservoir or using from it"); cleared with the flag at scene end
  braced:     { label: "Braced (attacks at disadvantage)", icon: "icons/svg/shield.svg", condition: true,  _id: "condbraced000000" },   // 07-16b playtest pass — Trooper/Captain Brace (timed via explicit edhaApplyTimedStatus stamp) + Frostbinder's PERMANENT Predictive Ward marker; deliberately NOT in EDHA_TIMED_STATUSES (the Ward must never auto-expire)
  diagrammed: { label: "Vital Diagram",                    icon: "icons/svg/blood.svg",  condition: false, _id: "conddiagrammed00", tint: "#d04a4a" },   // 07-16b — the Stitchmother's anatomical mark; Scalpel-Strike's +4 rides whenTargetStatus on it (scene-long, GM-cleared)
};
function edhaRegisterStatuses(phase) {
  try {
    const COSMERE = globalThis.CONFIG?.COSMERE;
    if (!COSMERE?.statuses || !Array.isArray(CONFIG.statusEffects)) return false;
    let added = 0;
    for (const [id, def] of Object.entries(EDHA_STATUSES)) {
      if (!COSMERE.statuses[id]) COSMERE.statuses[id] = { label: def.label, icon: def.icon, condition: def.condition, ...(def.stackable ? { stackable: true } : {}) };
      if (!CONFIG.statusEffects.some(s => s.id === id)) {
        CONFIG.statusEffects.push({ id, name: def.label, img: def.icon, _id: def._id, ...(def.tint ? { tint: def.tint } : {}), ...(def.stackable ? { system: { isStackable: true, count: 1 } } : {}) });
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
Hooks.once("ready", () => {
  const ok = !!globalThis.CONFIG?.COSMERE?.currencies?.edha;
  console.log(`Edha Content | ready — currency 'edha' ${ok ? "registered" : "MISSING (registration failed)"}`);
});

/* --- WEAKENED mechanic (2026-06-11c; reworked 2026-06-13) ---------------------------------------
 * Ruling (Ben): a Weakened creature has DISADVANTAGE on EVERY physical test (str/spd attribute) while
 * the condition lasts, and Weakened ALWAYS falls off at the END of the creature's next turn. It is no
 * longer consumed by the first physical test (that was too weak — the Black tree's Weakened payoffs,
 * Spoils of Isolation / Sovereign of Solitude / Predatory Patience, need it to survive to the
 * attacker's turn). Disadvantage is applied via the system's d20 roll pipeline:
 * `cosmere-rpg.pre{Skill|Attack|Item}Roll` (roll, source, config) fires BEFORE the dialog/evaluate
 * (d20Roll, index.js ~L5266).
 *  - Fast-forward rolls: the D20Roll is already built when preRoll fires → set
 *    roll.options.advantageMode and re-run configureModifiers() (idempotent: resets d20 number/mods).
 *  - Dialog rolls: configureDialog OVERWRITES options.advantageMode from data.skillTest.advantageMode
 *    (default None, ~L3577/3903) → wrap the instance's configureDialog to pre-seed disadvantage; the
 *    dialog opens with it selected and the GM can still toggle it off (override).
 *  - Expiry: handled by the generic timed-status pass below (NOT a post-roll consume), so disadvantage
 *    re-applies to every physical test until the condition expires at the end of the creature's next turn.
 */
const EDHA_PHYSICAL_ATTRS = new Set(["str", "spd"]);

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
Hooks.on("renderChatMessageHTML", (msg, html) => {
  try {
    const root = html instanceof HTMLElement ? html : html?.[0];
    root?.querySelectorAll?.(".dice-formula").forEach(el => { const t = edhaTidyFormula(el.textContent); if (t && t !== el.textContent) el.textContent = t; });
  } catch (e) {}
});
function edhaTestRiderApply(roll, source, config) {
  try {
    if (roll?.options?._edhaTestRider) return;                 // idempotent (a re-fired pre-roll)
    const actor = edhaD20RollActor(config);
    if (!actor?.items) return;
    const ctx = config?.data?.context;                         // 'Skill' | 'Attack' | 'Item' (system casing)
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
    const parts = [];
    for (const tal of actor.items) {
      if (!edhaIsTalent(tal)) continue;
      for (const rule of edhaEventRules(tal)) {
        const h = rule?.handler;
        if (h?.type !== "edha-test-rider" || !h.bonusFormula) continue;
        // ⚑ bench: weapon attack vs Weakened gains the die; Extract Thought's Deception does not.
        if (!edhaTestCtxMatch(h.appliesTo, ctx, !!config?.data?.source?.system?.damage?.formula)) continue;
        if (h.whenTargetStatus && !target?.statuses?.has?.(h.whenTargetStatus)) continue;
        if (h.whenTargetIsolated && !(target && edhaIsIsolated(target))) continue;
        if (h.whenAttribute) { const a = roll?.data?.skill?.attribute ?? config?.defaultAttribute; if (!String(h.whenAttribute).split(/[,\s]+/).filter(Boolean).includes(a)) continue; }   // Burning Drive: Physical (str/spd)
        if (h.whenFastTurn && !edhaIsFastTurn(actor)) continue;                                  // Momentum fast-turn payoffs
        if (h.firstTestThisTurn && !edhaIsFirstTestThisTurn(actor)) continue;                    // Burning Drive: first test only
        const resolved = Roll.replaceFormulaData(h.bonusFormula, actor.getRollData(), { missing: "0" });
        if (resolved) parts.push(`${edhaFoldDieMath(resolved)}[${tal.name}]`);   // flavor label → the breakdown names the source talent
      }
    }
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
    const target = Array.from(game.user?.targets ?? [])[0] ?? null; if (!target?.actor) return;
    void edhaSetEdhaFlag(actor, "aggro", { targetUuid: target.actor.uuid, targetName: target.name, round: game.combat?.round ?? null });
  } catch (e) { /* non-fatal */ }
}
function edhaPackAdvantageApply(roll, source, config) {
  try {
    if (roll?.options?._edhaPackAdv) return;
    const actor = edhaD20RollActor(config); if (!actor?.items) return;
    if (!config?.data?.source?.system?.damage?.formula) return;
    const target = Array.from(game.user?.targets ?? [])[0] ?? null; if (!target?.actor) return;
    const myTok = edhaCasterToken(actor);
    for (const tal of actor.items) {
      if (!edhaIsTalent(tal)) continue;
      for (const rule of edhaEventRules(tal)) {
        if (rule?.handler?.type !== "edha-pack-advantage") continue;
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
    }
  } catch (e) { console.error("Edha Content | pack advantage failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaPackAdvantageApply);
  Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaAggroRecord);
}
Hooks.on("deleteCombat", () => {
  try { for (const tok of (canvas?.tokens?.placeables ?? [])) if (tok.actor?.getFlag?.("edha-content", "aggro")) void tok.actor.unsetFlag("edha-content", "aggro"); } catch (e) {}
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
function edhaCombatantTurnIndex(combat, actor) {
  if (!combat?.turns || !actor) return -1;
  const tokenId = actor.isToken ? actor.token?.id : null;
  return combat.turns.findIndex(c => tokenId ? c.tokenId === tokenId : c.actorId === actor.id);
}
function edhaNextTurnCoord(combat, ti) {
  const R = combat.round ?? 1, T = combat.turn ?? 0;
  return ti > T ? { round: R, turn: ti } : { round: R + 1, turn: ti };   // strictly after now → the creature's next turn
}
// Statuses that auto-expire at the END of the affected creature's next turn (Edha control convention).
// Weakened (Black disadvantage) and Immobilized (Sovereign of Solitude's movement-stop) both ride this.
const EDHA_TIMED_STATUSES = new Set(["weakened", "immobilized", "slowed", "noactions", "noreactions"]);   // noactions/noreactions: Black/Subjugation markers (07-05); owner-relative appliers overwrite the auto-stamp
function edhaIsTimedStatus(carrier) {
  try { for (const s of (carrier?.statuses ?? [])) if (EDHA_TIMED_STATUSES.has(s)) return true; } catch (e) {}
  return false;
}
// Stamp a timed status with its expiry coordinate the moment it is applied (any path: Sapping Hex, Black
// Draw Mana, Sovereign of Solitude, manual toggle, edha.toggleStatus). GM-side; out-of-combat applications
// are left for the pass.
Hooks.on("createActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!edhaIsTimedStatus(effect)) return;
    if (effect.getFlag?.("edha-content", "expireAfter")) return;
    const combat = game.combat; if (!combat?.started) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    const ti = edhaCombatantTurnIndex(combat, a); if (ti < 0) return;   // creature isn't in this combat
    void effect.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(combat, ti));
  } catch (e) { console.error("Edha Content | timed-status stamp failed", e); }
});
// Each turn change: drop any effect whose expireAfter has passed; lazily stamp un-stamped Weakened.
async function edhaExpireTimedStatuses(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const curSeq = edhaTurnSeq(combat.round, combat.turn);
  const turns = combat.turns ?? [];
  for (let i = 0; i < turns.length; i++) {
    const a = turns[i]?.actor; if (!a?.effects) continue;
    for (const e of [...a.effects]) {
      const exp = e.getFlag?.("edha-content", "expireAfter");
      if (exp) {
        if (curSeq > edhaTurnSeq(exp.round, exp.turn)) {
          const label = e.name || "Status";
          try { if (a.effects.get(e.id)) await e.delete(); } catch (x) { console.error("Edha Content | timed-status expire failed", x); }
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>💢 <strong>${label}</strong> on ${a.name} ends (end of its turn).</p>` });
        }
        continue;
      }
      if (edhaIsTimedStatus(e)) {   // applied out of combat / by hand → stamp now, expire normally
        try { await e.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(combat, i)); } catch (x) {}
      }
    }
  }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaExpireTimedStatuses(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaExpireTimedStatuses(combat); });
Hooks.once("ready", () => { try { if (game.combat?.started && edhaDefBuffGmGate()) void edhaExpireTimedStatuses(game.combat); } catch (e) {} });

/* --- Passive damage riders --------------------------------------------------------------------
 * Some talents add bonus damage to OTHER talents' rolls when owned (e.g. Kindle: "+Red modifier
 * to energy damage"). The system has no hook for this, so we wrap CosmereItem#rollDamage: for each
 * `edha-damage-rider` rule on the rolling actor's talents whose `appliesTo` matches the damage type,
 * we append its `bonusFormula` via the system's own `overrideFormula` option. The rider lives ON the
 * talent (Events tab, editable); this wrapper is only the generic applicator that reads it.
 */
let _edhaLastDealer = null;   // {actor,type,ts}: last damage roll — attributes card-applied damage for Kindle light

// All enabled event rules on an item (the on-talent behaviour store).
function edhaEventRules(item) {
  try { return (item?.hasEvents?.() ? item.enabledEvents : []) || []; }
  catch (e) { return []; }
}
// First enabled rule on the item with the given handler type (or null).
function edhaRuleOf(item, type) {
  for (const r of edhaEventRules(item)) if (r?.handler?.type === type) return r.handler;
  return null;
}
// Match a rider's appliesTo (comma-list string or "any") against a damage type.
function edhaRiderMatches(at, dtype) {
  if (!at || at === "any") return true;
  if (Array.isArray(at)) return at.includes(dtype);
  return String(at).split(/[,\s]+/).filter(Boolean).includes(dtype);
}

// Does this actor currently have any CONDITION status (per CONFIG.COSMERE.statuses[x].condition)?
function edhaHasCondition(actor) {
  try {
    for (const s of (actor?.statuses ?? [])) if (CONFIG.COSMERE?.statuses?.[s]?.condition) return true;
    return false;
  } catch (e) { return false; }
}
// Rider components as [{formula, name}] — the name labels the term so the table can SEE which talent
// added what (Ben pass 3, 07-12: "how can I tell if the Kindle bonus is applied?" — the answer must
// be on the roll/card, not in the GM's head). Same convention as the 07-05 roll-label family.
function edhaRiderParts(item, actor) {
  try {
    if (!actor || !item?.system?.damage) return [];
    const dtype = item.system.damage.type;
    if (!dtype) return [];
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;   // for target-conditional riders
    const parts = [];
    for (const tal of actor.items) {
      if (!edhaIsTalent(tal)) continue;
      for (const rule of edhaEventRules(tal)) {
        const h = rule?.handler;
        if (h?.type !== "edha-damage-rider" || !h.bonusFormula) continue;
        if (!edhaRiderMatches(h.appliesTo, dtype)) continue;
        // Conditional riders (Prognosis: "+[Tier][Die] when healing a creature that has a condition"):
        // only apply when the current target carries a condition / the named status.
        if (h.whenTargetCondition) { if (!target || !edhaHasCondition(target)) continue; }
        if (h.whenTargetStatus)    { if (!target || !target.statuses?.has?.(h.whenTargetStatus)) continue; }
        if (h.whenMovedTowardFt)   { if (!target || edhaMovedTowardFt(actor, target) < Number(h.whenMovedTowardFt)) continue; }   // Momentum's Edge: charged ≥ N ft toward it
        if (h.whenTargetFooled)    { if (!target || !edhaTargetFooled(actor, target)) continue; }   // Spearing Beak: only vs a believer in the roller's seeming
        parts.push({ formula: h.bonusFormula, name: tal.name });
      }
    }
    return parts;
  } catch (e) {
    console.error("Edha Content | rider bonus computation failed", e);
    return [];
  }
}
function edhaRiderBonus(item, actor) {
  const parts = edhaRiderParts(item, actor);
  return parts.length ? parts.map(p => `(${p.formula})[${p.name}]`).join(" + ") : null;   // flavor-labeled terms
}

// The wrapper logic, shared by the libWrapper and manual-patch paths. (Deal-damage TRIGGERS are
// dispatched natively by the system's event engine off cosmere-rpg.damageRoll — not from here.)
function edhaWrapRollDamage(originalCall, options = {}) {
  const bonus = edhaRiderBonus(this, this.actor);
  if (bonus) {
    const base = options.overrideFormula ?? this.system?.damage?.formula;
    if (base) options = { ...options, overrideFormula: `${base} + ${bonus}` };
  }
  // Sovereignty (Verdannis): a die-stepped roller (Exalted/Diminished) has its damage dice moved
  // along the d4–d12 ladder before the roll (riders included — they're the roller's own damage).
  const stepped = edhaSovStepOverride(this, options.overrideFormula ?? this.system?.damage?.formula);
  if (stepped) options = { ...options, overrideFormula: stepped };
  const result = originalCall(options);
  const item = this;
  try { Promise.resolve(result).then(() => { _edhaLastDealer = { actor: item.actor, item, type: item.system?.damage?.type, ts: Date.now() }; }).catch(() => {}); } catch (e) { /* non-fatal */ }
  return result;
}

Hooks.once("ready", async () => {
  // Wrap CosmereItem#rollDamage. Prefer libWrapper (update-resilient); fall back to a prototype patch.
  const ItemCls = CONFIG.Item?.documentClass;
  if (!ItemCls?.prototype?.rollDamage) {
    console.warn("Edha Content | CosmereItem#rollDamage not found — riders not wired.");
    return;
  }
  if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
    libWrapper.register("edha-content", "CONFIG.Item.documentClass.prototype.rollDamage",
      function (wrapped, options = {}) { return edhaWrapRollDamage.call(this, wrapped, options); }, "MIXED");
    console.log("Edha Content | damage riders wired via libWrapper.");
  } else {
    const orig = ItemCls.prototype.rollDamage;
    ItemCls.prototype.rollDamage = function (options = {}) {
      return edhaWrapRollDamage.call(this, (o) => orig.call(this, o), options);
    };
    console.log("Edha Content | damage riders wired via prototype patch (libWrapper not active).");
  }

  // GRAZE-CLONE GUARD (bench 07-17, Spearing Beak's dead icon — a FAMILY bug under system 2.1.0):
  // rollDamage clones the hit roll for graze ("@damage.dice" strips non-dice terms, incl. our
  // injected parenthetical rider), then DamageRoll#replaceDieResults copies die results by index
  // from the FULL hit roll into the SMALLER graze clone — the rider die overruns the clone's dice
  // array and the TypeError kills use() before any card posts. So EVERY rider-injected damage roll
  // (edha-damage-rider with a bonusFormula: Spearing Beak, Prognosis, Momentum's Edge, ...) died
  // silently on the sheet since the 2.1.0 upgrade. Guard: copy only into dice that exist — the
  // graze keeps mirroring the BASE damage dice, and the rider (a hit bonus) stays out of graze,
  // which is also the correct rule. Patched on the registered class so all entry points share it.
  try {
    const DR = (CONFIG.Dice?.rolls ?? []).find(r => typeof r?.prototype?.replaceDieResults === "function");
    if (DR && !DR.prototype.replaceDieResults._edhaGuarded) {
      const origRDR = DR.prototype.replaceDieResults;
      DR.prototype.replaceDieResults = function (sourceDicePool) {
        const have = this.dice?.length ?? 0;
        const pool = (sourceDicePool ?? []).slice(0, have);
        return origRDR.call(this, pool);
      };
      DR.prototype.replaceDieResults._edhaGuarded = true;
      console.log("Edha Content | DamageRoll graze-clone die-count guard installed.");
    } else if (!DR) {
      console.warn("Edha Content | DamageRoll.replaceDieResults not found — graze guard not installed (riders may crash rollDamage).");
    }
  } catch (e) { console.error("Edha Content | graze guard install failed", e); }
});

/* --- Kindle light: creatures you deal energy damage to shed light (5 ft) until end of scene --------
 * Driven by the talent's own `edha-damage-rider` rule: a rider with lightRadiusFt > 0 makes any
 * creature that takes that rider's damage type (from an owner of the rider) emit a flame light +
 * lose concealment. Wired by wrapping CosmereActor#applyDamage, so it catches bursts, chat-card
 * applies, and triggered damage alike.
 */
function edhaLightSpecFor(actor, dtype) {
  if (!actor?.items || !dtype) return null;
  for (const tal of actor.items) {
    if (!edhaIsTalent(tal)) continue;
    for (const rule of edhaEventRules(tal)) {
      const h = rule?.handler;
      if (h?.type !== "edha-damage-rider") continue;
      const radiusFt = Number(h.lightRadiusFt) || 0;
      if (radiusFt > 0 && edhaRiderMatches(h.appliesTo, dtype)) return { radiusFt };
    }
  }
  return null;
}
// Who dealt this damage? Trust an explicit source (burst / system originatingItem); else the recent
// damage-roll breadcrumb (type-matched, fresh); else the same heuristic the kill-trigger dispatch uses.
function edhaLightSource(options, dtype) {
  const test = (a) => { const a2 = a?.actor ?? a; const light = a2 ? edhaLightSpecFor(a2, dtype) : null; return light ? { actor: a2, light } : null; };
  if (options?.edhaSource) return test(options.edhaSource);                 // bursts — authoritative
  if (options?.originatingItem) return test(options.originatingItem.actor); // system apply — authoritative
  // 120s window (was 15s — Ben pass 3: Kindle's light never applied; at table pace the GM reads the
  // card before clicking Apply, and the breadcrumb had already expired).
  if (_edhaLastDealer && _edhaLastDealer.type === dtype && (Date.now() - _edhaLastDealer.ts) < 120000) { const h = test(_edhaLastDealer.actor); if (h) return h; }
  for (const a of edhaKillerCandidates()) { const h = test(a); if (h) return h; }
  return null;
}
async function edhaLightTokensOf(actor) {
  if (!actor) return [];
  if (actor.isToken && actor.token) return [actor.token];
  try { return actor.getActiveTokens?.(false, true) || []; } catch (e) { return []; }
}
async function edhaApplyKindleLight(targetActor, light) {
  try {
    const radius = Number(light?.radiusFt) || 5;
    for (const td of await edhaLightTokensOf(targetActor)) {
      if (!td?.update) continue;
      if (foundry.utils.getProperty(td, "flags.edha-content.kindleLit")) continue;   // already lit this scene
      const prev = td.light?.toObject ? td.light.toObject() : foundry.utils.deepClone(td.light ?? {});
      await td.update({
        light: { dim: radius, bright: Math.max(2.5, radius / 2), color: "#ff7a1a", alpha: 0.5, animation: { type: "flame", speed: 2, intensity: 2 } },
        "flags.edha-content.kindleLit": true,
        "flags.edha-content.kindleLightPrev": prev,
      });
    }
  } catch (e) { console.error("Edha Content | kindle light apply failed", e); }
}
// Restore the pre-Kindle light on every lit token (end of scene/encounter). GM-side.
async function edhaClearKindleLights() {
  try {
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: clearing Kindle lights is GM-side."); return 0; }
    let n = 0;
    for (const scene of game.scenes ?? []) {
      const updates = [];
      for (const td of scene.tokens) {
        if (!foundry.utils.getProperty(td, "flags.edha-content.kindleLit")) continue;
        const prev = foundry.utils.getProperty(td, "flags.edha-content.kindleLightPrev") ?? {};
        updates.push({ _id: td.id, light: prev, "flags.edha-content.-=kindleLit": null, "flags.edha-content.-=kindleLightPrev": null });
      }
      if (updates.length) { await scene.updateEmbeddedDocuments("Token", updates); n += updates.length; }
    }
    ui.notifications?.info(`Edha: cleared Kindle light from ${n} token(s).`);
    return n;
  } catch (e) { console.error("Edha Content | clear kindle lights failed", e); return 0; }
}
/* Apply-time state checks (v3; Isolated re-ruled 2026-07-05) --------------------------------------
 * Isolated = no living ally (same-disposition token) ADJACENT — within 5 ft, incl. diagonals — of the
 * victim's token (Ben's 07-05 ruling: text + engine + icon all say "within 5 feet"; the old 10 ft
 * center-to-center math played as adjacency-only at the table anyway).
 * Marked   = the victim carries an Edha status (diagnosed/insight) placed by an edha-apply-status
 *            rule; flags.edha-content.markedBy.{status} = { actorId, talent } names the marker owner.
 */
function edhaIsIsolated(actor, tok = null) {
  try {
    // Chaos (Maelith) — INFLICTED Isolation counts the same as positional. Positional marker icons
    // (flags.edha-content.isoMarker, placed by the sync below) are display-only and must NOT feed back.
    for (const e of (actor?.effects ?? []))
      if (e.statuses?.has?.("isolated") && !e.getFlag?.("edha-content", "isoMarker")) return true;
    tok = tok ?? actor?.getActiveTokens?.()[0] ?? (actor?.isToken ? actor.token?.object : null);
    if (!tok) return false;
    const disp = tok.document?.disposition ?? 0;
    return !(canvas?.tokens?.placeables ?? []).some(t =>
      t.id !== tok.id && t.actor
      && (t.document?.disposition ?? 0) === disp
      && (t.actor.system?.resources?.hea?.value ?? 1) > 0
      && edhaAdjacent(tok, t));
  } catch (e) { return false; }
}
/* --- ISOLATED marker sync (2026-07-05) -----------------------------------------------------------
 * "Sapping Hex works but the table can't SEE Isolated" (Ben). While a combat runs on the viewed scene,
 * the GM client keeps the registered `isolated` status icon in sync with POSITIONAL isolation for every
 * combatant: icon on when the creature has no living adjacent ally, off when it regains one. Marker
 * effects carry flags.edha-content.isoMarker so they never feed back into edhaIsIsolated (above) and
 * never collide with Maelith's INFLICTED Isolated (which has no isoMarker flag and is left alone).
 */
async function edhaSyncIsolatedMarkers() {
  try {
    if (!edhaDefBuffGmGate()) return;
    const combat = game.combat;
    const live = !!combat?.started && (!combat.scene || combat.scene.id === canvas?.scene?.id);
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      const a = t.actor; if (!a) continue;
      const marker = a.effects?.find?.(e => e.getFlag?.("edha-content", "isoMarker"));
      const inCombat = live && (combat.turns ?? []).some(c => (c.tokenId && c.tokenId === t.id) || c.actorId === a.id);
      const dead = (a.system?.resources?.hea?.value ?? 1) <= 0;
      const inflicted = (a.effects ?? []).some?.(e => e.statuses?.has?.("isolated") && !e.getFlag?.("edha-content", "isoMarker"));
      const want = inCombat && !dead && !inflicted && edhaIsIsolated(a, t);
      if (want && !marker) {
        try {
          await a.createEmbeddedDocuments("ActiveEffect", [{
            name: "Isolated", img: EDHA_STATUSES.isolated.icon, statuses: ["isolated"],
            description: "<p>No ally within 5 feet (positional — auto-synced by the engine while combat runs).</p>",
            flags: { "edha-content": { isoMarker: true } },
          }]);
        } catch (e) { /* perms */ }
      } else if (!want && marker) {
        try { if (a.effects.get(marker.id)) await marker.delete(); } catch (e) {}
      }
    }
  } catch (e) { console.error("Edha Content | isolated marker sync failed", e); }
}
const edhaSyncIsolatedMarkersSoon = foundry.utils.debounce(() => { void edhaSyncIsolatedMarkers(); }, 250);
Hooks.on("updateToken", (doc, changes) => { try { if (("x" in changes) || ("y" in changes) || ("disposition" in changes)) edhaSyncIsolatedMarkersSoon(); } catch (e) {} });
Hooks.on("createToken",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("deleteToken",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("combatStart",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("combatTurnChange",  () => edhaSyncIsolatedMarkersSoon());
Hooks.on("deleteCombat",      () => edhaSyncIsolatedMarkersSoon());   // combat over → the pass strips every marker
Hooks.on("updateActor", (a, changes) => { try { if (foundry.utils.getProperty(changes, "system.resources.hea.value") !== undefined) edhaSyncIsolatedMarkersSoon(); } catch (e) {} });   // an ally dying (or reviving) changes neighbours' isolation
function edhaMarkOwner(victim, status) {
  try {
    const m = victim?.flags?.["edha-content"]?.markedBy?.[status];
    return m?.actorId ? { owner: game.actors?.get(m.actorId) ?? null, talent: m.talent || "" } : null;
  } catch (e) { return null; }
}
// Who dealt this application? (authoritative options first, else the fresh rollDamage breadcrumb)
function edhaDealerOf(options) {
  const a = options?.edhaSource?.actor ?? options?.edhaSource ?? options?.originatingItem?.actor ?? null;
  if (a) return { actor: a, item: options?.originatingItem ?? null };
  if (_edhaLastDealer && (Date.now() - _edhaLastDealer.ts) < 15000) return { actor: _edhaLastDealer.actor, item: _edhaLastDealer.item ?? null };
  return null;
}
// Melee-vs-ranged discriminator (shared primitive): classify the dealing item so "melee only" riders
// can stand down on a definitive ranged attack. Returns "melee" | "ranged" | null; null = can't tell
// → consumers keep today's owner-judged behavior (fire + the GM-withhold note). Reads, in order: an
// explicit flags.edha-content.attackKind stamp (edhaSummon bakes one onto its attack action), then a
// weapon's system.range (⚑ the cosmere field shape is unverified until bench — a positive ranged
// distance reads "ranged"; an absent/none range reads "melee"; schema drift reads null). Thrown/reach
// is partial BY DESIGN — a thrown melee weapon reads "melee" and the owner judges.
function edhaAttackKind(item) {
  try {
    if (!item) return null;
    const stamped = item.flags?.["edha-content"]?.attackKind;
    if (stamped === "melee" || stamped === "ranged") return stamped;
    if (item.type !== "weapon") return null;
    const r = item.system?.range;
    if (r === undefined) return null;                       // schema drift — owner judges
    const units = String(r?.units ?? r?.unit ?? "").toLowerCase();
    if (units === "none" || units === "self" || units === "touch") return "melee";
    return (Number(r?.value) > 0) ? "ranged" : "melee";
  } catch (e) { return null; }
}
// First rule of the given handler type across an actor's talents → { item, handler } | null.
function edhaActorRuleOf(actor, type) {
  for (const tal of (actor?.items ?? [])) {
    if (!edhaIsTalent(tal)) continue;
    const h = edhaRuleOf(tal, type);
    if (h) return { item: tal, handler: h };
  }
  return null;
}
function edhaWrapApplyDamage(originalCall, instances, options = {}) {
  const target = this;
  const list = (Array.isArray(instances) ? instances : [instances]).filter(Boolean);
  let prevHp = null, maxHp = null, halfNote = null;
  try {
    const hea = target?.system?.resources?.hea;
    prevHp = Number(hea?.value) || 0;
    maxHp = Number(hea?.max?.value ?? hea?.max) || 0;
    // Necrotic Grasp: halve healing to a heal-cut-marked target BEFORE it lands.
    const hcf = edhaHealCutFactor(target);
    if (hcf != null) {
      let cut = false;
      for (const inst of list) if (inst.type === "heal" && Number(inst.amount) > 0) { inst.amount = Math.max(0, Math.floor(Number(inst.amount) * hcf)); cut = true; }
      if (cut) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🩸 <strong>${target.name}</strong> ${hcf === 0 ? "cannot regain HP (Withering Touch)" : "has their healing halved (Necrotic Grasp)"}.</p>` });
    }
    // WHITE / BULWARK passive pre-reductions (synchronous — must land before apply; dice roll via evaluateSync):
    //   Shield Wall — any attack on a victim adjacent to a Shield Wall owner who has ≥2 adjacent allies.
    //   Devoted Conduit — only on REDIRECTED damage (Shared Burden's "in their place" hit; ruling C1).
    try {
      const vtok = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
      if (vtok && list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) {
        let reduce = 0; const why = [];
        for (const owner of edhaCharacterOwnersOf("Shield Wall")) {
          if (owner === target) continue;
          const otok = edhaCasterToken(owner);
          if (!otok || (otok.document?.disposition ?? 1) !== (vtok.document?.disposition ?? 1) || !edhaAdjacent(otok, vtok)) continue;
          if (edhaAdjacentAllies(otok).length < 2) continue;
          const amt = Math.floor(edhaEvalSync(`(${Number(owner.system?.tier) || 1})d(2 * @skills.white.rank + 2)`, owner.getRollData()) / 2);
          if (amt > 0) { reduce += amt; why.push(`Shield Wall (${owner.name})`); }
          break;
        }
        if (options?.edhaRedirected) for (const owner of edhaCharacterOwnersOf("Devoted Conduit")) {
          if (owner === target || !edhaAllyInAttune(owner, vtok, "white")) continue;
          const amt = Math.floor(edhaEvalSync(`(${Number(owner.system?.tier) || 1})d(2 * @skills.white.rank + 2)`, owner.getRollData()) / 2);
          if (amt > 0) { reduce += amt; why.push(`Devoted Conduit (${owner.name})`); }
          break;
        }
        if (reduce > 0) {
          const done = edhaReduceInstances(list, reduce);
          if (done > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🛡️ <strong>${target.name}</strong>'s damage reduced by <strong>${done}</strong> — ${why.join(", ")}.</p>` });
        }
      }
      edhaLifeDeflectReduce(target, list);   // LIFE / Anaveth — Dense Tissue / Apex Form +Deflect (deflectable types)
    edhaFateHexmarkIncoming(target, list); // FATE / Olvarra — Hexmark adds +tier keen when the marked foe takes damage near your zones
    } catch (e) { console.error("Edha Content | Bulwark pre-reduce failed", e); }
    const dealer = edhaDealerOf(options);
    const dealing = list.some(i => (Number(i?.amount) > 0) && i?.type && i.type !== "heal");
    if (dealing && dealer?.actor && dealer.actor !== target) {
      // Severance-style damage CONVERSION: dealer owns an edha-damage-convert rule and the victim is
      // Isolated → instances change type (e.g. → vital, which bypasses default Deflect) BEFORE apply.
      const conv = edhaActorRuleOf(dealer.actor, "edha-damage-convert");
      if (conv?.handler && (!conv.handler.whenTargetIsolated || edhaIsIsolated(target))) {
        const to = conv.handler.toType || "vital";
        const changed = [];
        for (const inst of list) if (inst.type && inst.type !== "heal" && inst.type !== to) { changed.push(inst.type); inst.type = to; }
        if (changed.length) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🗡️ <strong>${conv.item.name}</strong>: ${target.name} is Isolated — ${changed.join("/")} damage becomes <strong>${to}</strong>.</p>` });
      }
      // Marked-target bonus damage (Vital Diagnosis: "+Tier vital vs the Diagnosed creature", any ally):
      // the victim's mark names its owner; the owner's edha-apply-status rule carries the bonus.
      for (const status of (target?.statuses ?? [])) {
        const mk = edhaMarkOwner(target, status);
        if (!mk?.owner) continue;
        const rule = edhaActorRuleOf(mk.owner, "edha-apply-status");
        const h = rule?.handler;
        if (!h || h.status !== status || !h.bonusDamageFormula) continue;
        const amt = edhaEvalSync(h.bonusDamageFormula, mk.owner.getRollData());
        if (amt > 0) {
          list.push({ amount: amt, type: h.bonusDamageType || "vital" });
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🎯 <strong>${rule.item.name}</strong> (${mk.owner.name}): +${amt} ${h.bonusDamageType || "vital"} vs the ${EDHA_STATUSES[status]?.label ?? status} target.</p>` });
        }
      }
      // GREEN / INSTINCT pre-pass bonuses (name-based; added to the single apply, no recursion):
      const dealtType0 = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "energy";
      //  Coordinated Hunt — you + ≥1 ally attacked this victim this round → +min(#attackers, Green rank).
      if (edhaOwnsTalent(dealer.actor, "Coordinated Hunt")) {
        const vtok3 = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
        const otok3 = edhaCasterToken(dealer.actor);
        if (vtok3 && otok3) {
          const atk = edhaFocusFireSet(vtok3);
          const ally = [...atk].some(id => { const t = canvas?.tokens?.get(id); return t && t.id !== otok3.id && (t.document?.disposition ?? 1) === (otok3.document?.disposition ?? 1); });
          if (atk.has(otok3.id) && ally) {
            const bonus = Math.min(atk.size, edhaColorRank(dealer.actor, "green"));
            if (bonus > 0) { list.push({ amount: bonus, type: dealtType0 }); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🐺 <strong>Coordinated Hunt</strong> (${dealer.actor.name}): +${bonus} ${dealtType0} (${atk.size} hunters on ${target.name}).</p>` }); }
          }
        }
      }
      //  Pack Pressure — within the strike window → +[Tier][Die].
      if (edhaPackPressureActive(dealer.actor)) {
        const amt = Math.max(0, Math.floor(edhaEvalSync(`(${Number(dealer.actor.system?.tier) || 1})d(2 * @skills.green.rank + 2)`, dealer.actor.getRollData())));
        if (amt > 0) { list.push({ amount: amt, type: dealtType0 }); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🐺 <strong>Pack Pressure</strong> (${dealer.actor.name}): +${amt} ${dealtType0} strike.</p>` }); }
      }
      edhaLifeOutgoingBonus(dealer.actor, list, dealer.item);   // LIFE / Anaveth — Bone Spurs (+keen, melee-gated) / Apex Form (+vital) on the buffed creature's hit
      edhaCivTemperedEdge(dealer, target, list);   // CIVILIZATION / Kethane — Tempered Edge rides the Construct's melee Slam (+[T][D red] energy + ignore deflect)
      edhaPowerDealerPre(dealer, target, list);    // POWER / Tyrith — Warlord's Advance / Momentum armed riders + Fury bonus + Mantle's melee spirit
      edhaGnosisDealerPre(dealer, target, list);   // KNOWLEDGE / Gnothis — Predatory Strike armed rider + Hunter's Discipline / Pack Share / The Pack Insight riders
      edhaOrderDealerPre(dealer, target, list);    // ORDER / Tessavain — Concord's first-attack-per-round Presence rider + the Covenant-break watch
    }
  } catch (e) { console.error("Edha Content | applyDamage pre-pass failed", e); }
  const result = originalCall(list, options);
  try {
    Promise.resolve(result).then(async () => {
      // DEATH / Morrath — Death Ward: the first lethal drop lands on 1 HP + Temp HP instead (see the Death section).
      await edhaDeathWardCheck(target, prevHp);
      // Kindle light (any damaging instance whose dealer has a light rider)
      for (const inst of list) {
        if (!(Number(inst?.amount) > 0) || !inst?.type || inst.type === "heal") continue;
        const src = edhaLightSource(options, inst.type);
        if (src) { void edhaApplyKindleLight(target, src.light); break; }
      }
      const dealer = edhaDealerOf(options);
      // Heal-overflow → Temp HP (Life Surge / Overgrowth): the healing talent carries an
      // edha-overflow-thp rule; overflow = (prev HP + heal) − max HP, set as Edha Temp HP.
      const healAmt = list.filter(i => i?.type === "heal").reduce((s, i) => s + Math.abs(Number(i.amount) || 0), 0);
      if (healAmt > 0 && maxHp > 0 && dealer?.item && edhaRuleOf(dealer.item, "edha-overflow-thp")) {
        const overflow = Math.max(0, prevHp + healAmt - maxHp);
        if (overflow > 0) {
          await edhaWriteTempHp(target, overflow, dealer.item.name);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>💚 <strong>${dealer.item.name}</strong> overflow: ${target.name} gains <strong>${overflow}</strong> Temp HP.</p>` });
        }
      }
      // Green / Restoration on-heal riders — you restored health to `target` with a Green talent.
      if (healAmt > 0 && dealer?.actor && dealer.item && edhaTalentColor(dealer.item) === "green")
        await edhaGreenHealRiders(dealer.actor, target, healAmt, prevHp);
      // Overgrowth (Life/Anaveth, 07-12): the healed creature grows natural armor — +1 Deflect,
      // stacking to 3, until combat ends. Was "manual" in the tree header; re-litigated (the Dread
      // Presence lesson): the deflect DerivedValueField takes a .bonus AE exactly like defenses do.
      if (healAmt > 0 && dealer?.item?.name === "Overgrowth" && edhaRuleOf(dealer.item, "edha-overflow-thp"))
        await edhaOvergrowthDeflectStack(target);
      const dealt = list.some(i => (Number(i?.amount) > 0) && i?.type && i.type !== "heal");
      // ON-HIT (real hit) dealer-side effects — Black/Ritual + retrofitted Isolation triggers.
      if (dealt && dealer?.actor && dealer.actor !== target) {
        await edhaDispatchOnHit(dealer, target, list);   // Sapping Hex, Predatory Patience, Dark Investiture
        await edhaWitherStrike(dealer, target);          // DEATH / Morrath — armed Withering Touch rides the next weapon hit
        // Necrotic Grasp: on a Black-talent hit, halve the target's healing (end of owner's next turn).
        const hc = edhaActorRuleOf(dealer.actor, "edha-heal-cut");
        if (hc?.handler) {
          const color = hc.handler.color || "black";
          if (!color || edhaTalentColor(dealer.item) === color) {
            await edhaApplyHealCut(target, dealer.actor, Number(hc.handler.fraction) || 0.5, hc.item.name);
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🩸 <strong>${hc.item.name}</strong>: ${target.name}'s healing is halved until the end of ${dealer.actor.name}'s next turn.</p>` });
          }
        }
        await edhaLifeVenomOnHit(dealer.actor, target, dealer.item);   // LIFE / Anaveth — Venom Glands (melee-gated) afflicts the foe on the buffed creature's hit
        await edhaCivConstructHitRiders(dealer, target, prevHp);   // CIVILIZATION / Kethane — Magnum Opus Colossus splash + Arsenal kill-chase prompt
        await edhaPowerDealerPost(dealer, target, prevHp);   // POWER / Tyrith — Warlord's Advance kill/survivor outcomes + Warlord's Fury tally
        await edhaGnosisDealerPost(dealer, target);   // KNOWLEDGE / Gnothis — Predatory Strike places 1 Insight; Pack Share / The Pack first-hit-per-round Insight
      }
      if (dealt) await edhaLifeRegenEndOnDamage(target, list);   // LIFE / Anaveth — Primal Regeneration ends on Vital/Spirit damage
      if (dealt) await edhaVoidSenseOnDamage(target, list);      // CHAOS / Maelith — Void Sense recovers 1 Inv when an Omen-bearer takes damage
      // Marked-damage triggers (Prognosis / Gnothis Insight regen): the mark's owner recovers a
      // resource when the marked creature takes damage from ANY source (once per round).
      if (dealt) {
        for (const status of (target?.statuses ?? [])) {
          const mk = edhaMarkOwner(target, status);
          if (!mk?.owner) continue;
          const rule = edhaActorRuleOf(mk.owner, "edha-marked-damage-trigger");
          const h = rule?.handler;
          if (!h || h.status !== status) continue;
          const spec = { oncePerRound: h.oncePerRound !== false };
          if (!edhaTriggerAllowed(mk.owner, rule.item.name, spec)) continue;
          await edhaMarkTriggerUsed(mk.owner, rule.item.name, spec);
          const resKey = h.resource || "inv", gain = Number(h.value) || 1;
          const res = mk.owner.system?.resources?.[resKey];
          const rmax = edhaResVal(res) ?? ((res?.value ?? 0) + gain);
          try { await mk.owner.update({ [`system.resources.${resKey}.value`]: Math.min(rmax, (res?.value ?? 0) + gain) }); } catch (e) { /* perms */ }
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: mk.owner }), content: `<p>🔮 <strong>${rule.item.name}</strong>: the ${EDHA_STATUSES[status]?.label ?? status} creature took damage — ${mk.owner.name} recovers ${gain} ${EDHA_RES_LABEL[resKey] || resKey}.</p>` });
        }
      }
      // HP-threshold prompt (Mender's Instinct): an ALLY character just dropped to ≤ half HP → offer
      // each owner of an edha-hp-threshold rule the reaction (chat-card button; heal lands on the ally).
      if (dealt && target?.type === "character" && maxHp > 0) {
        const newHp = Number(target.system?.resources?.hea?.value) || 0;
        const half = maxHp / 2;
        if (prevHp > half && newHp <= half) {
          for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
            const rule = edhaActorRuleOf(owner, "edha-hp-threshold");
            const h = rule?.handler;
            if (!h) continue;
            if (owner === target && h.includeSelf === false) continue;
            const spec = {
              effect: { kind: "heal", formula: h.healFormula || "0", target: "victim" },
              cost: h.costResource ? { resource: h.costResource, value: Number(h.costValue) || 0, optional: true } : null,
              oncePerRound: h.oncePerRound !== false,
              note: h.note || `${target.name} dropped to ${newHp}/${maxHp} HP — you may react to heal them.`,
            };
            edhaPostTriggerCard(owner, rule.item.name, spec, { victim: target });
          }
        }
      }
      // GM CUE CARDS (07-16, Ben: adversary ability text converts to hooks, not prose) — generic
      // `edha-gm-cue` sentinels: the victim's own "damaged"/"hp-below" cues, then same-side
      // "ally-drops" cues. Whispered to the GM at the crossing; the decision stays at the table.
      if (dealt) await edhaGmCueDamageSweep(target, prevHp, Number(target.system?.resources?.hea?.value) || 0, maxHp);
      // Thorns splash-back + the Suture Cradle discipline check (07-16b playtest pass).
      if (dealt) {
        const dealtAmt = list.filter(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal").reduce((s, i) => s + Number(i.amount), 0);
        await edhaThornsCheck(target, dealer, options);
        await edhaSutureCradleCheck(target, dealtAmt);
        await edhaChargeDamagedCheck(target);   // Set Charge's target-damaged arm (07-16c)
      }
      // WHITE / BULWARK — ally-damage reactions (heal-back / redirect / retaliate / revive cards).
      if (dealt) {
        const newHpB = Number(target.system?.resources?.hea?.value) || 0;
        void edhaBulwarkReactions(target, dealer, Math.max(0, prevHp - newHpB), prevHp, newHpB, !!options?.edhaRedirected);
        // ORDER / Tessavain — Shoulder the Oath: a Covenant ally lost HP → whispered Reaction card.
        void edhaOrderShoulderPrompt(target, dealer, Math.max(0, prevHp - newHpB), list, !!options?.edhaRedirected);
      }
      // POWER / Tyrith — Mantle of the Aspirant: the mantled owner takes damage → redirect prompt card.
      if (dealt && !options?.edhaRedirected) void edhaPowerMantleRedirectPrompt(target, list, prevHp);
    }).catch((e) => { console.error("Edha Content | applyDamage post-pass failed", e); });
  } catch (e) { /* non-fatal */ }
  return result;
}
Hooks.once("ready", () => {
  try {
    const ActorCls = CONFIG.Actor?.documentClass;
    if (!ActorCls?.prototype?.applyDamage) { console.warn("Edha Content | CosmereActor#applyDamage not found - Kindle light not wired."); return; }
    if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
      libWrapper.register("edha-content", "CONFIG.Actor.documentClass.prototype.applyDamage",
        function (wrapped, instances, options = {}) { return edhaWrapApplyDamage.call(this, wrapped, instances, options); }, "MIXED");
      console.log("Edha Content | Kindle light wired via libWrapper.");
    } else {
      const orig = ActorCls.prototype.applyDamage;
      ActorCls.prototype.applyDamage = function (instances, options = {}) { return edhaWrapApplyDamage.call(this, (i, o) => orig.call(this, i, o), instances, options); };
      console.log("Edha Content | Kindle light wired via prototype patch.");
    }
  } catch (e) { console.error("Edha Content | applyDamage wrap failed", e); }
});
// Auto-clear Kindle lights when an encounter ends (a reasonable "end of scene" trigger).
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearKindleLights(); } catch (e) {} });

/* ============================================================================================
 * BLACK / RITUAL tree engine (2026-06-13)
 *  - ON-HIT dispatch: fire edha-triggered-effect rules whose event is `edha-on-hit` when the dealer
 *    actually APPLIES damage (a real hit), NOT merely rolls it. cosmere rolls damage on every attack
 *    (hit or miss) — so deal-damage misfires on whiffs; apply-damage = the true hit. Powers Sapping
 *    Hex, Predatory Patience (Investiture), and Dark Investiture (affliction).
 *  - AFFLICTION damage engine: the system has the `afflicted` icon but NO per-turn damage. We store
 *    the rolled amount on the victim and auto-deal it at the start of its turns.
 *  - NECROTIC GRASP: on a Black-talent hit, mark the target "healing halved" (expires end of the
 *    OWNER's next turn — reuses the expiry pass with an owner-relative coordinate); the apply path
 *    halves heals to a marked target.
 *  - RITUAL HP COST keystone + RESERVE: pay HP on use; flag Blood Price advantage; bank Reserve.
 *  - Isolation movement talents — the 06-13 "manual by nature" classification is OVERTURNED piecewise
 *    as the hook inventory grows (the case-studies §4 lesson):
 *    · Dread Presence — ENFORCED since 07-05: preUpdateToken veto (willing moves only; edhaForced bypasses).
 *    · Cruel Step — WIRED 07-12: authored `use` rule on the edha-move executor (10 ft toward the target,
 *      requireTargetIsolated gate; halts at walls; Reactions ignored by rule).
 *    · Unnerving Approach — WIRED 07-12: on-use prompt card → edhaRunPush the chosen ally of your target
 *      [Size] ft directly away (see the Unnerving block below). The "moved adjacent" trigger itself stays
 *      trust-based: YOU declare the move by using the talent; the engine does the displacement.
 * ============================================================================================ */

/* --- Unnerving Approach (Black/Isolation — wired 2026-07-12) --------------------------------------
 * "Once per turn, when you move adjacent to an enemy, spend 1 Investiture. Choose one character
 * allied to that enemy within 10 ft and push it [Size] feet directly away, potentially leaving the
 * target Isolated." The move-adjacent trigger is trust-based (you use the talent after making the
 * move; the activation wires the 1 Inv). On use: target the enemy you approached → a whispered card
 * lists its living allies within 10 ft → click one → it is pushed [Size] ft (Black rank) directly
 * away from your target (edhaApplyMove: halts at walls; GM relay for unowned tokens), stranding the
 * target — the Isolated marker sync repaints on the move. Pass-2 note (07-12): the "all enemies
 * moved" report was a Foundry multi-token drag (every token selected), not this engine — nothing
 * was wired here before today. */
Hooks.on("cosmere-rpg.useItem", (item) => { try { if (item?.name === "Unnerving Approach" && item.actor) void edhaUnnervingApproachUse(item); } catch (e) { console.error("Edha Content | Unnerving Approach use failed", e); } });
async function edhaUnnervingApproachUse(item) {
  try {
    const actor = item.actor;
    if (!edhaOncePerTurnAllowed(actor, "Unnerving Approach")) { ui.notifications?.warn("Edha: Unnerving Approach is once per turn."); return; }
    const ttok = Array.from(game.user?.targets ?? [])[0] ?? null;
    if (!ttok?.actor) { ui.notifications?.warn("Edha: target the enemy you moved adjacent to, then use Unnerving Approach."); return; }
    const disp = ttok.document?.disposition ?? 0;
    const candidates = edhaTokensWithin(ttok, 10).filter(t =>
      t.id !== ttok.id && t.actor
      && (t.document?.disposition ?? 0) === disp
      && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
    if (!candidates.length) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>😨 <strong>Unnerving Approach</strong> — no living ally of ${ttok.actor.name} within 10 ft to push (it may already be Isolated).</p>` });
      return;
    }
    await edhaOncePerTurnMark(actor, "Unnerving Approach");
    const ft = EDHA_SIZE_FT[edhaColorRank(actor, "black")] || EDHA_SIZE_FT[1];
    const rows = candidates.map(t => `<button type="button" class="edha-unnerve-btn" data-edha-owner="${actor.uuid}" data-edha-target="${ttok.document.uuid}" data-edha-victim="${t.document.uuid}" data-edha-ft="${ft}">Push ${t.actor.name} (${ft} ft away from ${ttok.actor.name})</button>`);
    ChatMessage.create({
      whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card"><p>😨 <strong>Unnerving Approach</strong> — choose the ally of <strong>${ttok.actor.name}</strong> to push <strong>${ft} ft</strong> directly away:</p>${rows.join(" ")}</div>`,
    });
  } catch (e) { console.error("Edha Content | Unnerving Approach failed", e); }
}
async function edhaUnnerveClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tdoc = await fromUuid(btn.dataset.edhaTarget).catch(() => null);
    const vdoc = await fromUuid(btn.dataset.edhaVictim).catch(() => null);
    const ttok = tdoc?.object, vtok = vdoc?.object;
    const ft = Number(btn.dataset.edhaFt) || 5;
    if (!owner || !ttok || !vtok) { ui.notifications?.warn("Edha: token no longer on the canvas — push manually."); return; }
    const dx = vtok.center.x - ttok.center.x, dy = vtok.center.y - ttok.center.y, len = Math.hypot(dx, dy) || 1;
    const aim = { x: vtok.center.x + dx / len * ft * edhaPxPerFt(), y: vtok.center.y + dy / len * ft * edhaPxPerFt() };
    const { movedFt, collided } = await edhaApplyMove(vtok, aim, ft, { gapPx: 0, hostile: true });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-unnerve-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ pushed";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ pushed");   // survives refresh (card-persistence family)
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>😨 <strong>Unnerving Approach</strong> — ${vtok.actor?.name ?? "the ally"} is pushed <strong>${Math.round(movedFt)} ft</strong> directly away from ${ttok.actor?.name ?? "your target"}${collided ? " (stopped at an obstacle)" : ""}. <span style="opacity:.8">If no ally remains adjacent, the target is Isolated (the marker re-syncs on the move).</span></p>` });
  } catch (e) { console.error("Edha Content | Unnerving push failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-unnerve-btn").forEach(b => b.addEventListener("click", edhaUnnerveClick));
});

// ON-HIT dispatch: run the dealer's `edha-on-hit` triggered-effect rules against the creature actually
// hit. Owner-wide for passives (Sapping Hex/Predatory Patience); item-specific for attack talents that
// carry their own damage (Dark Investiture only afflicts on ITS OWN hit). Guarded against re-entrancy.
async function edhaDispatchOnHit(dealer, target, list) {
  const owner = dealer?.actor;
  if (!owner || _edhaInTrigger || owner === target) return;
  const dealtTypes = list.filter(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal").map(i => i.type);
  if (!dealtTypes.length) return;
  try { await edhaHeroicOnHit(owner, target, dealer); } catch (e) { console.error("Edha Content | heroic on-hit dispatch failed", e); }   // 07-18h: Tagging Shot / Feinting Strike
  for (const tal of owner.items) {
    if (!edhaIsTalent(tal)) continue;
    const itemSpecific = !!tal.system?.damage?.formula;   // attack talent → only when IT dealt the damage
    if (itemSpecific && dealer.item !== tal) continue;
    for (const rule of edhaEventRules(tal)) {
      // GM cue on the owner's own hit (Press the Line: allied Raider reaction shot, 07-16).
      if (rule?.event === "edha-on-hit" && rule?.handler?.type === "edha-gm-cue") {
        await edhaPostCueCard(owner, tal, rule.handler, ` <em>(hit ${target.name}.)</em>`);
        continue;
      }
      // Shockwave Slam: push the creature you just hit (Red movement pilot) — runs alongside triggered effects.
      if (rule?.event === "edha-on-hit" && rule?.handler?.type === "edha-push") {
        const hp = rule.handler;
        if (hp.whenDamageType && hp.whenDamageType !== "any" && !dealtTypes.some(dt => edhaRiderMatches(hp.whenDamageType, dt))) continue;
        await edhaRunPush(owner, target, hp);
        continue;
      }
      if (rule?.event !== "edha-on-hit" || rule?.handler?.type !== "edha-triggered-effect") continue;
      const h = rule.handler;
      if (h.whenDamageType && h.whenDamageType !== "any" && !dealtTypes.some(dt => edhaRiderMatches(h.whenDamageType, dt))) continue;
      if (h.whenTargetStatus && !target?.statuses?.has?.(h.whenTargetStatus)) continue;
      const spec = edhaTrigSpecFromCfg(h);
      const ctx = { victim: target };
      if (spec.cost?.optional) edhaPostTriggerCard(owner, tal.name, spec, ctx);
      else await edhaFireTrigger(owner, tal.name, spec, ctx);
    }
  }
}

/* --- GM cue cards (07-16): adversary ability text → a whispered reminder at its named hook -------
 * Generic handler `edha-gm-cue` (event edha-apply-watch; on-hit cues ride event edha-on-hit inside
 * edhaDispatchOnHit). Triggers: "damaged" (the owner took damage) · "hp-below" {atFraction} (the
 * owner crossed maxHp × fraction on this write — atFraction 0 = dropped to 0) · "ally-drops"
 * {rangeFt} (a same-side creature within range hit 0; 0/absent = whole scene) · "seeming-break"
 * (the owner's phantom copy broke — dispatched from the restore path) · "on-hit" (the owner's own
 * damaging item landed). The card carries the rule's `note` verbatim — author the cost into the
 * note ("Reaction, 1 Focus — ..."). oncePerRound defaults ON (reaction economy). Iron rule 3:
 * when the text names the hook, it gets a cue — a bare 'GM-run' label is no longer enough.
 * Consumers: Fade, Break ×2, Cover Their Retreat, Press the Line, the session-1 morale traits. */
function edhaCueRules(actor, trigger) {
  const out = [];
  for (const tal of (actor?.items ?? [])) {
    if (!edhaIsTalent(tal)) continue;
    for (const rule of edhaEventRules(tal)) {
      const h = rule?.handler;
      if (h?.type === "edha-gm-cue" && (h.trigger || "damaged") === trigger) out.push({ item: tal, h });
    }
  }
  return out;
}
async function edhaPostCueCard(owner, item, h, extra = "") {
  const key = `cue:${item.name}:${h.trigger || ""}`;
  if (h.oncePerRound !== false) {
    if (!edhaTriggerAllowed(owner, key, { oncePerRound: true })) return;
    await edhaMarkTriggerUsed(owner, key, { oncePerRound: true });
  }
  const gmIds = (game.users?.filter(u => u.active && u.isGM) ?? []).map(u => u.id);
  ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>⏰ <strong>${item.name}</strong> (${owner.name}): ${h.note || "trigger met."}${extra}</p></div>` });
}
// Pure crossing decision (pinned in tests/): did this write take HP from above maxHp×fraction to at/below it?
function edhaCueCrossed(prevHp, newHp, maxHp, atFraction) {
  const frac = Number(atFraction);
  const line = (Number(maxHp) || 0) * (Number.isFinite(frac) ? frac : 0.5);
  return prevHp > line && newHp <= line;
}
async function edhaGmCueDamageSweep(victim, prevHp, newHp, maxHp) {
  try {
    for (const { item, h } of edhaCueRules(victim, "damaged")) await edhaPostCueCard(victim, item, h);
    for (const { item, h } of edhaCueRules(victim, "hp-below")) {
      if (edhaCueCrossed(prevHp, newHp, maxHp, h.atFraction)) await edhaPostCueCard(victim, item, h);
    }
    if (prevHp > 0 && newHp <= 0) {
      const vTok = victim.getActiveTokens?.()[0] ?? null;
      const disp = vTok?.document?.disposition;
      for (const t of (canvas?.tokens?.placeables ?? [])) {
        if (!t.actor || t.actor === victim) continue;
        if (disp !== undefined && (t.document?.disposition ?? null) !== disp) continue;   // same side only
        for (const { item, h } of edhaCueRules(t.actor, "ally-drops")) {
          const ft = Number(h.rangeFt) || 0;
          if (ft > 0 && vTok && edhaTokenGapFt(t, vTok) > ft) continue;
          await edhaPostCueCard(t.actor, item, h, ` <em>(${victim.name} dropped${ft ? `, within ${ft} ft` : ""}.)</em>`);
        }
      }
    }
  } catch (e) { console.error("Edha Content | GM cue sweep failed", e); }
}
// Center-to-center distance in scene feet between two placeables.
function edhaTokenGapFt(a, b) {
  const gs = canvas?.scene?.grid?.size || 100, gd = canvas?.scene?.grid?.distance || 5;
  return Math.hypot((a.center?.x ?? 0) - (b.center?.x ?? 0), (a.center?.y ?? 0) - (b.center?.y ?? 0)) / gs * gd;
}
// Turn-based GM cues (07-16b playtest pass): "enemy-turn-start {rangeFt}" cues a reaction holder
// once when a hostile starts its turn in range (Reactive Strike — a per-ACTION cue would spam);
// "turn-end {everyNRounds}" cues at the END of the owner's own turn on matching rounds (Glyph
// Pulse's every-2-rounds aura). One GM client runs the sweep.
Hooks.on("combatTurnChange", (combat, prior, current) => {
  try { if (edhaDefBuffGmGate()) void edhaTurnCueSweep(combat, prior, current); } catch (e) { /* non-fatal */ }
});
async function edhaTurnCueSweep(combat, prior, current) {
  try {
    const tokOf = ref => combat?.combatants?.get?.(ref?.combatantId)?.token?.object ?? null;
    const curTok = tokOf(current) ?? combat?.combatant?.token?.object ?? null;
    if (curTok?.actor) {
      const disp = curTok.document?.disposition ?? 0;
      for (const t of (canvas?.tokens?.placeables ?? [])) {
        if (!t.actor || t === curTok || (t.document?.disposition ?? 0) === disp) continue;   // hostiles to the mover only
        for (const { item, h } of edhaCueRules(t.actor, "enemy-turn-start")) {
          const ft = Number(h.rangeFt) || 0;
          if (ft > 0 && edhaTokenGapFt(t, curTok) > ft + 2.5) continue;   // half-square slack for adjacency reads
          await edhaPostCueCard(t.actor, item, h, ` <em>(${curTok.name}'s turn starts in range.)</em>`);
        }
      }
    }
    const prevTok = tokOf(prior);
    if (prevTok?.actor) {
      for (const { item, h } of edhaCueRules(prevTok.actor, "turn-end")) {
        const n = Math.max(1, Number(h.everyNRounds) || 1);
        const round = Number(combat?.round) || 0;
        if (round % n !== 0) continue;
        await edhaPostCueCard(prevTok.actor, item, h, ` <em>(end of ${prevTok.name}'s turn, round ${round}.)</em>`);
      }
    }
  } catch (e) { console.error("Edha Content | turn cue sweep failed", e); }
}
// Thorns (07-16b, Cinder Coat): the victim's edha-thorns rules splash damage straight back at a
// melee/adjacent attacker — auto-applied (no decision to cue), chain-guarded (a thorns hit never
// triggers thorns in return).
async function edhaThornsCheck(victim, dealer, options) {
  try {
    if (options?.edhaThorns) return;
    const attacker = dealer?.actor; if (!attacker || attacker === victim) return;
    for (const tal of (victim?.items ?? [])) {
      if (!edhaIsTalent(tal)) continue;
      for (const rule of edhaEventRules(tal)) {
        const h = rule?.handler;
        if (h?.type !== "edha-thorns" || !h.formula) continue;
        if (h.meleeOnly !== false) {
          const vTok = victim.getActiveTokens?.()[0], aTok = attacker.getActiveTokens?.()[0];
          if (!vTok || !aTok || edhaTokenGapFt(aTok, vTok) > 7.5) continue;   // adjacent-ish (medium diagonals)
        }
        const roll = await (new Roll(String(h.formula), victim.getRollData?.() ?? {})).evaluate();
        try { await attacker.applyDamage([{ amount: roll.total, type: h.damageType || "energy" }], { chatMessage: false, edhaThorns: true }); } catch (e) { continue; }
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🔥 <strong>${tal.name}</strong>: ${attacker.name} takes <strong>${roll.total}</strong> ${h.damageType || "energy"} splash for striking ${victim.name} in melee.</p>` });
      }
    }
  } catch (e) { console.error("Edha Content | thorns check failed", e); }
}
// Suture Cradle (07-16b, Stitchmother — the one stateful playtest mechanic needing its own watcher):
// use with a target → the cradle marks it (flag on the CRADLER, token-actor safe); while marked,
// each damage the target takes forces the cradler's Discipline vs DC 10 + damage (contest core —
// never "trust the GM rolled"): keep or the cradle ends. Cleared on combat end.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Suture Cradle") return;
    const t = [...(game.user?.targets ?? [])][0] ?? null;
    if (!t?.actor) { ui.notifications?.warn("Edha: target the creature being cradled, then use Suture Cradle again."); return; }
    void edhaSetEdhaFlag(actor, "sutureCradle", { targetUuid: t.actor.uuid, targetName: t.name });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🪡 <strong>Suture Cradle</strong>: ${t.name} is cradled — when it takes damage, ${actor.name} must keep it (Discipline vs DC 10 + damage, auto-rolled). Sustained: 1 Investiture at the start of each of her turns (GM).</p>` });
  } catch (e) { console.error("Edha Content | Suture Cradle use failed", e); }
});
async function edhaSutureCradleCheck(victim, dealtAmount) {
  try {
    if (!victim || !(dealtAmount > 0)) return;
    const holders = [];   // scan canvas tokens (unlinked adversaries live as token actors, NOT in game.actors)
    for (const tok of (canvas?.tokens?.placeables ?? [])) if (tok.actor && !holders.includes(tok.actor)) holders.push(tok.actor);
    for (const a of (game.actors ?? [])) if (!holders.includes(a)) holders.push(a);
    for (const owner of holders) {
      if (owner.getFlag?.("edha-content", "sutureCradle")?.targetUuid !== victim.uuid) continue;
      const dc = 10 + Math.floor(dealtAmount);
      const total = await edhaRollOpposedSkill(owner, "dis");
      const keep = total >= dc;
      if (!keep) { try { await owner.unsetFlag("edha-content", "sutureCradle"); } catch (e) {} }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: keep
        ? `<p>🪡 <strong>Suture Cradle</strong>: ${victim.name} was hit — Discipline <strong>${total}</strong> ≥ DC ${dc}: the cradle <strong>holds</strong>.</p>`
        : `<p>🪡 <strong>Suture Cradle</strong>: ${victim.name} was hit — Discipline <strong>${total}</strong> &lt; DC ${dc}: the cradle <strong>ends</strong>.</p>` });
    }
  } catch (e) { console.error("Edha Content | suture cradle check failed", e); }
}
Hooks.on("deleteCombat", () => {
  try {
    for (const tok of (canvas?.tokens?.placeables ?? [])) if (tok.actor?.getFlag?.("edha-content", "sutureCradle")) void tok.actor.unsetFlag("edha-content", "sutureCradle");
    for (const a of (game.actors ?? [])) if (a.getFlag?.("edha-content", "sutureCradle")) void a.unsetFlag("edha-content", "sutureCradle");
  } catch (e) { /* non-fatal */ }
});

/* --- Afflictions: ongoing stored damage dealt at the start of the carrier's turn ----------------- */
function edhaGetAfflictions(actor) {
  try { const a = actor?.getFlag?.("edha-content", "afflictions"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
// Store a rolled affliction amount on a creature (so the turn engine can auto-deal it). GM-side write.
async function edhaAddAffliction(actor, amount, type, source) {
  amount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!actor || amount <= 0) return;
  const list = edhaGetAfflictions(actor);
  list.push({ amount, type: type || "vital", source: source || "" });
  try { await actor.setFlag("edha-content", "afflictions", list); }
  catch (e) { console.warn("Edha Content | could not store affliction (perms?) — auto-tick disabled for this one.", e); }
}
// Deal every stored affliction to a creature (its turn start). Caller sets the re-entrancy guard.
async function edhaTickAfflictions(actor) {
  const list = edhaGetAfflictions(actor);
  if (!actor || !list.length) return;
  if (!actor.statuses?.has?.("afflicted")) { try { await actor.unsetFlag("edha-content", "afflictions"); } catch (e) {} return; }
  for (const af of list) {
    const amt = Math.max(0, Math.floor(Number(af.amount) || 0));
    if (amt > 0) { try { await actor.applyDamage([{ amount: amt, type: af.type || "vital" }], { chatMessage: false }); } catch (e) {} }
  }
  const total = list.reduce((s, a) => s + (Math.max(0, Math.floor(Number(a.amount) || 0))), 0);
  if (total > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>☠️ <strong>Afflicted</strong> — ${actor.name} takes <strong>${total}</strong> ongoing vital damage (start of turn).</p>` });
}
async function edhaAfflictionTurnTick(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const actor = combat.combatant?.actor; if (!actor) return;
  _edhaInTrigger = true;   // affliction damage must not re-trigger on-hit / on-defeat dispatch
  try { await edhaTickAfflictions(actor); } finally { _edhaInTrigger = false; }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaAfflictionTurnTick(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaAfflictionTurnTick(combat); });
// When the Afflicted condition is removed (icon toggled off), drop its stored damage.
Hooks.on("deleteActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!effect?.statuses?.has?.("afflicted")) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    if (!a.statuses?.has?.("afflicted")) void a.unsetFlag("edha-content", "afflictions");
  } catch (e) { console.error("Edha Content | affliction cleanup failed", e); }
});

/* --- Necrotic Grasp: healing halved on a Black-talent hit (expires end of OWNER's next turn) ------
 * Fraction 0 = FULL heal block ("cannot regain HP" — Death/Withering Touch); Temp HP grants bypass
 * this path and still land (Ben R3, 07-02). */
function edhaHealCutFactor(actor) {
  let f = null;
  for (const e of (actor?.effects ?? [])) {
    const hc = e.getFlag?.("edha-content", "healCut");
    if (hc && Number(hc.fraction) >= 0 && Number(hc.fraction) < 1) f = (f == null) ? Number(hc.fraction) : Math.min(f, Number(hc.fraction));
  }
  return f;
}
async function edhaApplyHealCut(target, owner, fraction, byName) {
  try {
    const ex = target.effects?.filter(e => e.getFlag?.("edha-content", "healCut")) ?? [];   // refresh duration
    if (ex.length) { try { await target.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) {} }
    const combat = game.combat;
    const ti = (combat?.started && owner) ? edhaCombatantTurnIndex(combat, owner) : -1;
    const coord = ti >= 0 ? edhaNextTurnCoord(combat, ti) : null;   // end of the OWNER's next turn
    const full = Number(fraction) === 0;
    await target.createEmbeddedDocuments("ActiveEffect", [{
      name: `${byName} — ${full ? "No Healing" : "Healing Halved"}`,
      img: "icons/magic/death/hand-withered-gray.webp",
      changes: [],
      description: `<p>${full ? "Cannot regain HP" : "Healing received is halved"} (${byName}) until the end of ${owner?.name ?? "the caster"}'s next turn.</p>`,
      flags: { "edha-content": { healCut: { fraction, byName }, ...(coord ? { expireAfter: coord } : {}) } },
    }]);
  } catch (e) { console.error("Edha Content | heal-cut apply failed", e); }
}

/* --- RESERVE (Sanguine Reservoir): flag-based pseudo-resource, cap = ranks in Black --------------- */
function edhaReserveCap(actor) { return edhaColorRank(actor, "black"); }
function edhaGetReserve(actor) { return Math.max(0, Math.floor(Number(actor?.flags?.["edha-content"]?.reserve) || 0)); }
async function edhaSetReserve(actor, v) {
  v = Math.max(0, Math.min(edhaReserveCap(actor), Math.floor(Number(v) || 0)));
  try { if (v <= 0) await actor.unsetFlag("edha-content", "reserve"); else await actor.setFlag("edha-content", "reserve", v); }
  catch (e) { console.error("Edha Content | Reserve write failed", e); }
  return v;
}

/* --- RESERVE SPEND (2026-07-05, Ben-approved design) ----------------------------------------------
 * Two spend paths for the Reserve banked above:
 *  1. AS INVESTITURE (Sanguine Reservoir's own text): a "Pay from Reserve" checkbox injected into the
 *     system's Spend-Investiture dialog (ItemConsumeDialog). Checking it UNCHECKS the system's
 *     Investiture row(s) — so the system consumes nothing and there is no refund race — and deducts
 *     Reserve instead. Offered only when Reserve covers the full static cost.
 *  2. AS RITUAL HP (Double Dip): Double Dip's own use runs a Black-vs-Cognitive contest; success marks
 *     the target (flags.edha-content.doubleDipBy.<ownerId>, scene-scoped). edhaRitualHpCost then offers
 *     "pay from Reserve instead of HP?" when its talent targets a marked creature. Paying from Reserve
 *     is NOT losing health: no Blood Price advantage, nothing re-banked (stated on the card).
 */
Hooks.on("renderDialogV2", (app, element) => {
  try {
    if (!String(app?.id ?? "").endsWith(".consume")) return;
    const item = app.item; const actor = item?.actor;
    if (!actor || !edhaOwnsTalent(actor, "Sanguine Reservoir")) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root || root.querySelector(".edha-reserve-spend")) return;
    const invRows = [...root.querySelectorAll("#consumables .form-group")].filter(el => {
      const [type, res, min, max] = String(el.id).split("-");
      return type === "resource" && res === "inv" && min === max;   // static Investiture costs only
    });
    if (!invRows.length) return;
    const need = invRows.reduce((s, el) => s + (parseInt(String(el.id).split("-")[2]) || 0), 0);
    const reserve = edhaGetReserve(actor);
    if (need <= 0 || reserve < need) return;
    const consumables = root.querySelector("#consumables");
    const label = document.createElement("label");
    label.className = "edha-reserve-spend";
    label.style.cssText = "display:flex;align-items:center;gap:6px;margin:4px 0;padding:3px 6px;border:1px solid #7a2f2f88;border-radius:4px;background:#40101055;";
    // One <span> around the text: with display:flex on the label, bare inline nodes each become their
    // own flex item and the sentence shatters (Ben 07-12 screenshot). Flex = [checkbox][span].
    label.innerHTML = `<input type="checkbox" style="flex:0 0 auto"> <span>🩸 Pay from <strong>Reserve</strong> instead (${reserve}/${edhaReserveCap(actor)} banked — Investiture stays untouched)</span>`;
    consumables?.after(label);
    const box = label.querySelector("input");
    // Capture-phase on Continue: runs BEFORE the dialog's own action handler collates the checkboxes.
    const btn = root.querySelector('button[data-action="continue"]');
    btn?.addEventListener("click", () => {
      try {
        if (!box?.checked) return;
        for (const el of invRows) { const c = el.querySelector("input[type=checkbox]"); if (c) c.checked = false; }
        void edhaSetReserve(actor, edhaGetReserve(actor) - need).then(() => {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>Sanguine Reservoir</strong>: ${actor.name} pays <strong>${need}</strong> ${item.name} cost from Reserve (${edhaGetReserve(actor)}/${edhaReserveCap(actor)} left) — no Investiture spent.</p>` });
        });
      } catch (e) { console.error("Edha Content | Reserve spend failed", e); }
    }, true);
  } catch (e) { console.error("Edha Content | Reserve consume-dialog injection failed", e); }
});

// Double Dip — contest-resolved mark (its Black test vs the target's Cognitive defense; the approved
// contest pattern). Success → scene-scoped mark consumed by edhaRitualHpCost below.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor;
    if (!actor || item.name !== "Double Dip" || !edhaOwnsTalent(actor, "Double Dip")) return;
    const target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    const def = target ? edhaReadDefense(target, "cog") : null;
    if (!target || def == null) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>Double Dip</strong> — no readable target: target the creature and re-use, or (GM) apply the scene mark by hand.</p>` });
      return;
    }
    edhaQueueContest(actor, "black", async ({ total }) => {
      const ok = total >= def;
      if (ok) {
        const key = `doubleDipBy.${actor.id}`;
        if (target.isOwner) { try { await target.setFlag("edha-content", key, true); } catch (e) {} }
        else game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key, value: true } });
        try { await edhaToggleStatus(target, "doubledipped", true); } catch (e) {}   // visible marker (Ben 07-12) — cleared with the flag at scene end
      }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: ok
        ? `<p>🩸 <strong>Double Dip</strong>: Black <strong>${total}</strong> vs ${target.name}'s Cognitive (${def}) — for the scene, Ritual talents targeting ${target.name} may pay their HP cost from <strong>Reserve</strong>.</p>`
        : `<p>🩸 <strong>Double Dip</strong>: Black <strong>${total}</strong> vs ${target.name}'s Cognitive (${def}) — no effect.</p>` });
    });
  } catch (e) { console.error("Edha Content | Double Dip use failed", e); }
});
// Scene end: clear Double Dip marks (GM-side, same lifecycle as Charges/Reserve-style scene state).
Hooks.on("deleteCombat", async () => {
  try {
    if (!edhaDefBuffGmGate()) return;
    for (const a of (game.actors ?? [])) if (a.flags?.["edha-content"]?.doubleDipBy) { try { await a.unsetFlag("edha-content", "doubleDipBy"); await edhaToggleStatus(a, "doubledipped", false); } catch (e) {} }
  } catch (e) {}
});

/* --- RITUAL HP COST keystone: pay HP on use; flag Blood Price; bank Reserve ---------------------- */
async function edhaRitualHpCost(item, cfg) {
  try {
    const actor = item?.actor; if (!actor) return;
    const roll = await (new Roll(cfg.formula || "@tier", actor.getRollData())).evaluate();
    const amt = Math.max(0, Math.floor(roll.total));
    // Double Dip: the talent's target is marked by THIS owner and Reserve covers the price → offer to
    // pay from Reserve instead of HP. Not a health loss: no Blood Price flag, nothing banked.
    if (amt > 0) {
      const target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
      const marked = !!target?.flags?.["edha-content"]?.doubleDipBy?.[actor.id];
      const reserve = edhaGetReserve(actor);
      if (marked && reserve >= amt) {
        let useReserve = false;
        try {
          useReserve = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Double Dip — pay from Reserve?" },
            content: `<p><strong>${item.name}</strong> costs <strong>${amt}</strong> HP and targets a Double-Dipped creature.</p><p>Pay it from <strong>Reserve</strong> (${reserve}/${edhaReserveCap(actor)}) instead of health?</p>`,
            rejectClose: false,
          });
        } catch (e) { useReserve = false; }
        if (useReserve) {
          await edhaSetReserve(actor, reserve - amt);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>${item.name}</strong>: ${actor.name} pays <strong>${amt}</strong> from Reserve (Double Dip — ${edhaGetReserve(actor)}/${edhaReserveCap(actor)} left). No health lost: no Blood Price, nothing banked.</p>` });
          return;
        }
      }
    }
    if (amt > 0) {
      const cur = Number(actor.system?.resources?.hea?.value) || 0;
      try { await actor.update({ "system.resources.hea.value": Math.max(0, cur - amt) }); } catch (e) { /* perms */ }
    }
    const hasBlood = edhaOwnsTalent(actor, "Blood Price");
    if (hasBlood) { try { await actor.setFlag("edha-content", "bloodPriceAdv", true); } catch (e) {} }
    let banked = 0;
    if (amt > 0 && edhaOwnsTalent(actor, "Sanguine Reservoir")) {
      const before = edhaGetReserve(actor);
      banked = (await edhaSetReserve(actor, before + amt)) - before;
    }
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>🩸 <strong>${item.name}</strong>: ${actor.name} pays <strong>${amt}</strong> HP`
        + (hasBlood ? ` — <strong>advantage</strong> on your next Black test` : "")
        + (banked > 0 ? ` — banked <strong>${banked}</strong> Reserve (${edhaGetReserve(actor)}/${edhaReserveCap(actor)})` : "")
        + `.</p>`,
    });
  } catch (e) { console.error("Edha Content | ritual HP cost failed", e); }
}

/* --- BLOOD PRICE: advantage on your next Black test after paying ritual HP ----------------------- */
function edhaIsBlackTest(roll) { return roll?.data?.skill?.id === "black"; }
function edhaBloodPricePreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "bloodPriceAdv")) return;
    if (!edhaIsBlackTest(roll)) return;
    roll.options.advantageMode = "advantage";
    roll.configureModifiers?.();
    const origDialog = roll.configureDialog?.bind(roll);
    if (origDialog) roll.configureDialog = async (data) => {
      try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {}
      return origDialog(data);
    };
  } catch (e) { console.error("Edha Content | Blood Price pre-roll failed", e); }
}
function edhaBloodPriceConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "bloodPriceAdv")) return;
    if (!edhaIsBlackTest(roll)) return;
    void actor.unsetFlag("edha-content", "bloodPriceAdv");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>Blood Price</strong> — advantage spent on this Black test.</p>` });
  } catch (e) { console.error("Edha Content | Blood Price consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaBloodPricePreRoll);   // advantage on the next Black test
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaBloodPriceConsume);   // consume the flag once the test resolves
}

/* ============================================================================================
 * BLACK / SUBJUGATION tree engine (2026-06-13c) — focus economy + control flags.
 * NAME-BASED (like Blood Price / Sanguine Reservoir): these are fixed-canon passives with nothing to
 * tweak per-instance, so the engine keys off the talent name rather than a per-talent rule.
 *  - Focus watcher (preUpdateActor → updateActor, GM-side): a creature whose `foc` DROPS drives
 *    Whispered Doubt (enemy in range loses 1 more), Coercive Pressure (cognitive disadvantage),
 *    Predatory Insight (you regain 1 focus when any creature hits 0).
 *  - Cognitive disadvantage flag (Coercive Pressure) — mirror of the Weakened disadvantage, for int/wil.
 *  - Next-test advantage flag (Predatory Insight active half + reuses for any "advantage on next <skill>";
 *    round-stamped 07-05 so "this round" actually expires).
 * 2026-07-05 upgrades (Ben's Black test pass):
 *  - Hollow Command — contest-resolved (Deception vs Spiritual via edhaQueueContest); success applies the
 *    registered `noactions` marker (end of the TARGET's next turn) + auto-fires Siphoned Will (focus = tier).
 *    Owner-judged card only as the no-target/no-defense fallback.
 *  - Extract Thought — PASSIVE watcher on the owner's Deception tests: total vs the target's Spiritual →
 *    on success the target wears the registered `noreactions` marker (end of the OWNER's next turn).
 *    No synced target / unreadable defense → owner-judged click-card.
 *  - Puppeteer — turn-start cue: a combatant at 0 focus in a Puppeteer owner's Attunement Range starts its
 *    turn → whispered reaction card (spend 2 Focus + 1 Inv on click; the forced action itself is GM-run).
 *  - Predatory Insight active = the first `edha-opportunity-option` menu entry (see the Opportunity menu).
 * MANUAL by nature (no Foundry enforcement): the commanded/puppeted creature's forced ACTIONS themselves
 * (volition has no hook) — the markers/cards above make the states table-visible.
 * ============================================================================================ */
function edhaCharacterOwnersOf(name) {
  return (game.actors?.filter(a => a.type === "character" && edhaOwnsTalent(a, name)) ?? []);
}
function edhaWithinAttune(owner, targetTok) {
  const ot = edhaCasterToken(owner); if (!ot || !targetTok) return false;
  const ft = EDHA_ATTUNE_FT[edhaColorRank(owner, "black")] || EDHA_ATTUNE_FT[1];
  return edhaTokensWithin(ot, ft).some(t => t.id === targetTok.id);
}
function edhaDisposHostile(owner, target) {
  const ot = edhaCasterToken(owner), tt = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
  if (!ot || !tt) return true;   // unknown positions → treat as enemy (don't silently no-op)
  return (ot.document?.disposition ?? 0) !== (tt.document?.disposition ?? 0);
}
// Once per round, per (owner × talent × affected creature). Out of combat → unrestricted.
function edhaFocusOPRAllowed(owner, name, targetId) {
  const round = game.combat?.round; if (round == null) return true;
  return owner.getFlag?.("edha-content", "focusRound")?.[name]?.[targetId] !== round;
}
async function edhaFocusOPRMark(owner, name, targetId) {
  const round = game.combat?.round; if (round == null) return;
  const m = foundry.utils.deepClone(owner.getFlag("edha-content", "focusRound") ?? {});
  (m[name] ??= {})[targetId] = round;
  try { await owner.setFlag("edha-content", "focusRound", m); } catch (e) {}
}
async function edhaGainFocus(actor, n, source) {
  const foc = actor?.system?.resources?.foc; if (!foc) return;
  const max = edhaResVal(foc) ?? ((foc.value ?? 0) + n);
  const cur = Number(foc.value) || 0, next = Math.min(max, cur + n);
  if (next <= cur) return;
  _edhaInFocusWatch = true;
  try { await actor.update({ "system.resources.foc.value": next }, { edhaFocusWatch: true }); } finally { _edhaInFocusWatch = false; }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧠 <strong>${source}</strong>: ${actor.name} regains ${next - cur} focus.</p>` });
}
let _edhaInFocusWatch = false;
// Capture old→new focus on the in-flight update (the post hook only sees the new value).
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    const nf = foundry.utils.getProperty(changes, "system.resources.foc.value");
    if (nf === undefined) return;
    options.edhaFoc = { old: Number(actor.system?.resources?.foc?.value) || 0, new: Number(nf) || 0 };
  } catch (e) {}
});
Hooks.on("updateActor", async (actor, changes, options) => {
  try {
    if (options?.edhaFocusWatch || _edhaInFocusWatch) return;   // our own follow-up writes
    if (!edhaDefBuffGmGate()) return;
    const f = options?.edhaFoc;
    if (!f || f.new >= f.old) return;                            // only on a DECREASE
    await edhaRunFocusWatch(actor, f.old, f.new);
  } catch (e) { console.error("Edha Content | focus watch failed", e); }
});
// Predatory Insight (passive): any creature reaching 0 focus → each owner regains 1 focus (no range
// limit). Extracted so SECONDARY focus writes (Whispered Doubt's extra loss, tagged edhaFocusWatch and
// therefore invisible to the updateActor watcher) still fire it — the 07-05 test pass caught exactly
// that: an enemy taken to 0 BY Whispered Doubt never triggered the regain.
async function edhaPredInsightZeroGain(target) {
  for (const owner of edhaCharacterOwnersOf("Predatory Insight")) if (owner !== target) await edhaGainFocus(owner, 1, "Predatory Insight");
}
async function edhaRunFocusWatch(target, oldFoc, newFoc) {
  if (newFoc <= 0 && oldFoc > 0) await edhaPredInsightZeroGain(target);
  const ttok = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
  // Whispered Doubt: an enemy in your Attunement Range that spent focus loses 1 more (once/round/enemy).
  for (const owner of edhaCharacterOwnersOf("Whispered Doubt")) {
    if (owner === target || !ttok) continue;
    if (!edhaWithinAttune(owner, ttok) || !edhaDisposHostile(owner, target)) continue;
    if (!edhaFocusOPRAllowed(owner, "Whispered Doubt", target.id)) continue;
    const cur = Number(target.system?.resources?.foc?.value) || 0; if (cur <= 0) continue;
    await edhaFocusOPRMark(owner, "Whispered Doubt", target.id);
    _edhaInFocusWatch = true;
    try { await target.update({ "system.resources.foc.value": Math.max(0, cur - 1) }, { edhaFocusWatch: true }); } finally { _edhaInFocusWatch = false; }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🗣️ <strong>Whispered Doubt</strong> (${owner.name}): ${target.name} spends 1 additional focus.</p>` });
    if (cur - 1 <= 0) await edhaPredInsightZeroGain(target);   // OUR write bypasses the watcher — run the zero-check here
  }
  // Coercive Pressure: a creature in your Attunement Range that lost focus has disadvantage on its next
  // Cognitive (int/wil) test (once/round/creature) — consumed by the cog-disadvantage pre-roll below.
  for (const owner of edhaCharacterOwnersOf("Coercive Pressure")) {
    if (owner === target || !ttok) continue;
    // Adversaries only (Ben pass 3, 07-12): an ALLY spending focus must not hand the owner the debuff.
    const otok = edhaCasterToken(owner);
    if (!otok || (ttok.document?.disposition ?? 1) === (otok.document?.disposition ?? 1)) continue;
    if (!edhaWithinAttune(owner, ttok)) continue;
    if (!edhaFocusOPRAllowed(owner, "Coercive Pressure", target.id)) continue;
    await edhaFocusOPRMark(owner, "Coercive Pressure", target.id);
    try { await target.setFlag("edha-content", "cogDisadv", true); } catch (e) {}
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🪨 <strong>Coercive Pressure</strong> (${owner.name}): ${target.name} has disadvantage on its next Cognitive test.</p>` });
  }
}

// Cognitive disadvantage (Coercive Pressure) — mirror of Weakened, for int/wil tests; consumed after.
const EDHA_COG_ATTRS = new Set(["int", "wil"]);
function edhaCogTest(roll, config) { return EDHA_COG_ATTRS.has(roll?.data?.skill?.attribute ?? config?.defaultAttribute); }
function edhaCogDisadvPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "cogDisadv") || !edhaCogTest(roll, config)) return;
    roll.options.advantageMode = "disadvantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "disadvantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | cog-disadvantage pre-roll failed", e); }
}
function edhaCogDisadvConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "cogDisadv") || !edhaCogTest(roll, config)) return;
    void actor.unsetFlag("edha-content", "cogDisadv");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🪨 <strong>Coercive Pressure</strong> — disadvantage spent on this Cognitive test.</p>` });
  } catch (e) { console.error("Edha Content | cog-disadvantage consume failed", e); }
}
// "Advantage on your next <skill> test" flag (Predatory Insight → Deception). Consumed on the matching
// test. Flag shape: "dec" (legacy) OR { skill, round, source } — a round-stamped grant silently expires
// once the combat round moves on (the talent text says "this round"; the old flag lived forever).
function edhaAdvTestRead(actor) {
  const g = actor?.getFlag?.("edha-content", "advTest");
  if (!g) return null;
  const sk = typeof g === "string" ? g : g.skill;
  const round = (typeof g === "object" && g.round != null) ? g.round : null;
  if (round != null && game.combat?.round != null && game.combat.round !== round) {
    void actor.unsetFlag("edha-content", "advTest");   // stale — the granting round is over
    return null;
  }
  return sk ? { skill: sk, source: (typeof g === "object" && g.source) || "Predatory Insight" } : null;
}
function edhaAdvTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = edhaAdvTestRead(actor);
    if (!g || roll?.data?.skill?.id !== g.skill) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | adv-test pre-roll failed", e); }
}
function edhaAdvTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = edhaAdvTestRead(actor);
    if (!g || roll?.data?.skill?.id !== g.skill) return;
    void actor.unsetFlag("edha-content", "advTest");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>👁️ <strong>${g.source}</strong> — advantage spent on this ${g.skill.toUpperCase()} test.</p>` });
  } catch (e) { console.error("Edha Content | adv-test consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaCogDisadvPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaCogDisadvConsume);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaAdvTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaAdvTestConsume);
}
// On-use hooks (run on the using client): Predatory Insight active half + Hollow Command resolution.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    if (item.name === "Predatory Insight" && edhaOwnsTalent(actor, "Predatory Insight")) {
      // Direct-use fallback for the Opportunity menu (the menu card is the primary path, 07-05).
      void actor.setFlag("edha-content", "advTest", { skill: "dec", round: game.combat?.round ?? null, source: "Predatory Insight" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>👁️ <strong>Predatory Insight</strong>: advantage on your next Deception test this round (Opportunity spent — trusted).</p>` });
    }
    // Hollow Command — contest auto-resolution (2026-07-05, replacing the owner-judged Siphoned Will
    // confirm card): its own Deception test resolves vs the target's Spiritual defense. Success →
    // the target wears the registered "Cannot Act (Hollow Command)" marker (auto-expires at the end
    // of ITS next turn) and Siphoned Will auto-regains focus = tier. No target / unreadable defense →
    // the old owner-judged card (mark + focus in one click).
    if (item.name === "Hollow Command" && edhaOwnsTalent(actor, "Hollow Command")) {
      const target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
      const def = target ? edhaReadDefense(target, "spi") : null;
      const tier = Math.max(1, Number(actor.system?.tier) || 1);
      const hasSiphon = edhaOwnsTalent(actor, "Siphoned Will");
      if (target && def != null) {
        edhaQueueContest(actor, "dec", async ({ total }) => {
          const ok = total >= def;
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: ok
            ? `<p>🕳️ <strong>Hollow Command</strong>: Deception <strong>${total}</strong> vs ${target.name}'s Spiritual (${def}) — <strong>command lands</strong>. ${target.name} cannot take actions on its next turn (marker applied, auto-expires).</p>`
            : `<p>🕳️ <strong>Hollow Command</strong>: Deception <strong>${total}</strong> vs ${target.name}'s Spiritual (${def}) — the command fails.</p>` });
          if (!ok) return;
          await edhaApplyTimedStatus(target, "noactions", { owner: actor, expire: "target" });
          if (hasSiphon) await edhaGainFocus(actor, tier, "Siphoned Will");
        });
      } else if (hasSiphon || target) {
        // Owner-judged fallback: one click marks the target (if any) AND pays out Siphoned Will.
        edhaPostTriggerCard(actor, "Hollow Command", {
          effect: { kind: "status", statusId: "noactions", target: "prompt" },
          cost: null, oncePerRound: false,
          note: `No readable Spiritual defense — if the command landed, target the creature and click: it gains the Cannot Act marker${hasSiphon ? ` and you regain ${tier} focus (Siphoned Will)` : ""}.`,
          ...(hasSiphon ? { selfResourceGain: { resource: "foc", value: tier } } : {}),
        }, {});
      }
    }
  } catch (e) { console.error("Edha Content | Subjugation use-hook failed", e); }
});

// Extract Thought (2026-07-05 redesign, Ben-approved): PASSIVE — when the owner rolls a Deception test
// against a synced target, auto-resolve vs the target's Spiritual defense (Deception is a Spiritual
// skill; Hollow Command uses the same mapping). Success → the registered `noreactions` marker, expiring
// at the end of the OWNER's next turn. No target / unreadable defense → owner-judged click-card.
// Runs on the ROLLING client (targets are local); status application relays to the GM when needed.
function edhaExtractThoughtWatch(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor || !edhaOwnsTalent(actor, "Extract Thought")) return;
    if (roll?.data?.skill?.id !== "dec") return;
    const target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!target || target === actor) return;
    const total = Number(roll.total) || 0;
    const def = edhaReadDefense(target, "spi");
    if (def == null) {
      edhaPostTriggerCard(actor, "Extract Thought", {
        effect: { kind: "status", statusId: "noreactions", target: "prompt" },
        cost: null, oncePerRound: false,
        note: `No readable Spiritual defense — if your Deception test (${total}) succeeded, target the creature and click: no Reactions until the end of your next turn.`,
      }, { victim: target });
      return;
    }
    if (total < def) return;   // quiet on a miss — this fires on EVERY Deception test
    void edhaApplyTimedStatus(target, "noreactions", { owner: actor, expire: "owner" });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧵 <strong>Extract Thought</strong>: Deception <strong>${total}</strong> vs ${target.name}'s Spiritual (${def}) — ${target.name} cannot take Reactions until the end of ${actor.name}'s next turn (marker applied).</p>` });
  } catch (e) { console.error("Edha Content | Extract Thought watch failed", e); }
}
Hooks.on("cosmere-rpg.skillRoll", edhaExtractThoughtWatch);

// Puppeteer (2026-07-05): the tracker cue Ben asked for. GM-side, at each turn change: the new combatant
// has 0 focus and stands in a Puppeteer owner's (Black) Attunement Range → whisper the owner the
// Siphoned-Will-style reaction card. Clicking spends 2 Focus + 1 Investiture (the owner's own resources)
// and posts the public "chooses one of its actions" note — the chosen action itself stays GM-run.
async function edhaPuppeteerTurnCue(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const actor = combat.combatant?.actor; if (!actor) return;
    const foc = Number(actor.system?.resources?.foc?.value);
    if (!Number.isFinite(foc) || foc > 0) return;
    const ttok = combat.combatant?.token?.object ?? edhaCasterToken(actor);
    for (const owner of edhaCharacterOwnersOf("Puppeteer")) {
      if (owner === actor || !ttok) continue;
      if (!edhaWithinAttune(owner, ttok)) continue;
      edhaPostCoordReactionCard(owner, "Puppeteer", actor, {
        costs: [{ resource: "foc", value: 2 }, { resource: "inv", value: 1 }],
        prompt: `${actor.name} starts its turn at <strong>0 focus</strong> in your Attunement Range — you may choose one of its actions this turn (Reaction).`,
        result: `🎭 <strong>Puppeteer</strong> (${owner.name}): chooses one of ${actor.name}'s actions this turn (GM resolves the action).`,
      });
    }
  } catch (e) { console.error("Edha Content | Puppeteer turn cue failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaPuppeteerTurnCue(combat); });
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaPuppeteerTurnCue(combat); });

// Dread Presence (2026-07-05, was "manual by nature"): ENFORCED. A Weakened creature inside a Dread
// Presence owner's Attunement Range cannot WILLINGLY move closer to any of its allies — the drag is
// vetoed on the moving client (preUpdateToken runs there) with a warning naming the blocked ally.
// Engine-forced movement (push/slide/teleport relays) sets options.edhaForced and bypasses this.
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (options?.edhaForced) return;                              // pushes/slides are not willing movement
    if (!("x" in changes) && !("y" in changes)) return;
    const tok = doc.object, actor = doc.actor;
    if (!tok || !actor?.statuses?.has?.("weakened")) return;
    if (!edhaCharacterOwnersOf("Dread Presence").some(o => o !== actor && edhaWithinAttune(o, tok))) return;
    const gs = (doc.parent?.grid?.size || 100), gd = (doc.parent?.grid?.distance || 5);
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const oldC = { x: doc.x + w, y: doc.y + h };
    const newC = { x: (changes.x ?? doc.x) + w, y: (changes.y ?? doc.y) + h };
    const disp = doc.disposition ?? 0;
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      if (t.id === doc.id || !t.actor) continue;
      if ((t.document?.disposition ?? 0) !== disp) continue;
      if ((t.actor.system?.resources?.hea?.value ?? 1) <= 0) continue;
      const dOld = Math.hypot(t.center.x - oldC.x, t.center.y - oldC.y);
      const dNew = Math.hypot(t.center.x - newC.x, t.center.y - newC.y);
      if (dNew < dOld - 1) {                                       // measurably closer to this ally
        ui.notifications?.warn(`Dread Presence: ${actor.name} is Weakened and cannot willingly move closer to ${t.actor.name}. (Engine-forced movement bypasses this.)`);
        return false;
      }
    }
  } catch (e) { console.error("Edha Content | Dread Presence veto failed", e); }
});

/* ============================================================================================
 * OPPORTUNITY-SPEND MENU (2026-07-05) — SHARED PRIMITIVE (Ben-approved design; first consumer:
 * Predatory Insight; later trees just author a rule). When any of the roller's tests resolves with an
 * Opportunity (plot die success OR d20 in the Opportunity range — the system's roll.opportunitiesCount),
 * a menu card posts on the ROLLING client listing that actor's `edha-opportunity-option` rules (one
 * button each; the listed resource cost is deducted on click — the Opportunity itself is trusted, per
 * the cost convention) plus the CANON spends as a text reminder (SR p.9). One spend per card: clicking
 * a button disables the whole menu. The card only posts when the actor owns at least one talent option
 * (canon-only Opportunities would be noise on every natural 20).
 * ============================================================================================ */
const EDHA_OPP_PENDING = {};   // pid -> [{ itemName, label, costResource, costValue, kind, skill, note }]
function edhaOpportunityOptions(actor) {
  const out = [];
  for (const tal of (actor?.items ?? [])) {
    if (!edhaIsTalent(tal)) continue;
    for (const rule of edhaEventRules(tal)) {
      const h = rule?.handler;
      if (h?.type !== "edha-opportunity-option" || !h.label) continue;
      out.push({ itemName: tal.name, label: h.label, costResource: h.costResource || "", costValue: Number(h.costValue) || 0, kind: h.kind || "note", skill: h.skill || "", note: h.note || "" });
    }
  }
  return out;
}
function edhaOpportunityMenuWatch(roll, source, config) {
  try {
    let opp = 0; try { opp = roll?.opportunitiesCount || 0; } catch (e) {}
    if (opp <= 0) return;
    const actor = edhaD20RollActor(config); if (!actor) return;
    const options = edhaOpportunityOptions(actor);
    if (!options.length) return;
    const pid = foundry.utils.randomID();
    EDHA_OPP_PENDING[pid] = options;
    const btns = options.map((o, i) => {
      const cost = o.costValue > 0 ? ` — spend ${o.costValue} ${EDHA_RES_LABEL[o.costResource] || o.costResource}` : "";
      return `<button type="button" class="edha-opp-btn" data-edha-actor="${actor.uuid}" data-edha-pid="${pid}" data-edha-idx="${i}" title="${o.note || ""}">${o.itemName}: ${o.label}${cost}</button>`;
    }).join("");
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card edha-opp-card">`
        + `<p>🎲 <strong>Opportunity!</strong> ${actor.name} rolled ${opp > 1 ? `${opp} Opportunities` : "an Opportunity"} — spend it on:</p>`
        + btns
        + `<p style="opacity:.75;font-size:.85em;margin-top:4px">Canon spends (table-run): Aid an Ally · Collect Yourself · Critically Hit · Influence the Narrative.</p>`
        + `</div>`,
    });
  } catch (e) { console.error("Edha Content | Opportunity menu failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaOpportunityMenuWatch);
async function edhaOpportunityClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const ref = await fromUuid(btn.dataset.edhaActor).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
    const o = EDHA_OPP_PENDING[btn.dataset.edhaPid]?.[Number(btn.dataset.edhaIdx)];
    if (!o) { ui.notifications?.info("Edha: this Opportunity menu has expired (posted before the last reload)."); btn.disabled = true; return; }
    if (o.costValue > 0 && (o.costResource === "inv" || o.costResource === "foc")) {
      const res = owner.system?.resources?.[o.costResource], cur = res?.value ?? 0;
      if (cur < o.costValue) { ui.notifications?.warn(`Edha: ${owner.name} lacks ${o.costValue} ${EDHA_RES_LABEL[o.costResource]}.`); return; }
      try { await owner.update({ [`system.resources.${o.costResource}.value`]: Math.max(0, cur - o.costValue) }); } catch (e) {}
    }
    if (o.kind === "adv-next-test" && o.skill) {
      await owner.setFlag("edha-content", "advTest", { skill: o.skill, round: game.combat?.round ?? null, source: o.itemName });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>${o.itemName}</strong>: Opportunity spent — advantage on ${owner.name}'s next ${o.skill.toUpperCase()} test this round.</p>` });
    } else {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎲 <strong>${o.itemName}</strong>: Opportunity spent — ${o.note || o.label}</p>` });
    }
    // one spend per Opportunity card — disable the whole menu
    const card = btn.closest(".edha-opp-card");
    card?.querySelectorAll("button").forEach(b => { b.disabled = true; });
    btn.textContent = `${o.itemName} — spent`;
  } catch (e) { console.error("Edha Content | Opportunity click failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-opp-btn").forEach(b => b.addEventListener("click", edhaOpportunityClick));
});

/* ============================================================================================
 * WHITE / COORDINATION tree engine (2026-06-14) — Plot Die ("raise the stakes") + ally support.
 * The tree's signature is granting allies a Plot Die and manipulating Complications. The Plot Die
 * injects EXACTLY like advantage: D20Roll.hasPlotDie reads options.plotDie and configureModifiers()
 * pushes the PlotDie term (system index.js ~L3780 / L4017), so this mirrors the advTest flag pattern.
 * NAME-BASED (like the Subjugation block): fixed-canon passives with nothing to tweak per-instance, so
 * the engine keys off the talent NAME — the talents stay events:{} (ENGINE-ONLY; module-src-sync push,
 * NO pack rebuild). Mending Aura is the one exception (its own edha-burst rule, already authored).
 *
 *  - Plot-die grant flag (flags.edha-content.plotDieNext = { skill:<id>|null, source:<talent> }):
 *    the pre-roll injector adds the Plot Die to the recipient's next (optionally skill-gated) test.
 *  - Grant card: a Coordination owner picks an in-range ally → that ally's next test raises the stakes
 *    (cross-actor flag write via the GM `set-flag` relay). Drives Guiding Signal + Concordant Presence.
 *  - Coordination watcher (post-roll, GM-gated, whispered to the owner): an ally-in-range test drives
 *    Concordant Presence (success → grant card), Shared Conviction (+White mod), Pillar of Order
 *    (Complication → negate). "Success" / "would fail" are OWNER-JUDGED — Foundry skill tests carry no
 *    DC, so the owner clicks the button only when it actually matters (ruling 1c).
 *  - Beacon of Stability — extends the White Draw Mana rider (edhaDrawMana) with a cleanse card.
 *  - Designate mark (Tool A2, 07-14): Guiding Signal designates an OPPOSING token; plotDieMark on
 *    the designator + target-gated injection in the plot-die pre-roll/consume pair.
 *  - Ordered Advance (07-14, was manual): use arms a round-window; the updateToken watcher posts
 *    the allies-within-10ft half-Speed card on each move. (Provoke itself stays un-enforced —
 *    no reaction system exists to suppress.)
 *  - Manual by nature: Unity of Purpose (aid is untracked → edha.raiseStakes API + a note).
 * ============================================================================================ */

/* --- Tool A: the Plot-Die grant primitive ------------------------------------------------------- */
// "Raise the stakes on your next (optionally skill-gated) test." Mirrors edhaAdvTest{PreRoll,Consume}.
function edhaPlotDieInject(roll) {
  roll.options.plotDie = true; roll.configureModifiers?.();      // adds the PlotDie term on fast-forward rolls
  const orig = roll.configureDialog?.bind(roll);                 // dialog rolls: pre-check the "Raise the Stakes" box
  if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.raiseStakes = true; data.plotDie ??= {}; } catch (e) {} return orig(data); };
}
function edhaPlotDiePreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (g) {
      if (g.skill && roll?.data?.skill?.id !== g.skill) return;   // skill-gated grant waits for the matching test
      return edhaPlotDieInject(roll);
    }
    if (edhaFindMarkGrant(actor)) return edhaPlotDieInject(roll); // designate mark: ally testing the marked target
  } catch (e) { console.error("Edha Content | plot-die pre-roll failed", e); }
}
function edhaPlotDieConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (g) {
      if (g.skill && roll?.data?.skill?.id !== g.skill) return;
      void actor.unsetFlag("edha-content", "plotDieNext");
      const skl = g.skill ? ` ${String(g.skill).toUpperCase()}` : "";
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>${g.source || "Raise the Stakes"}</strong> — ${actor.name} raises the stakes on this${skl} test (Plot Die added).</p>` });
      return;
    }
    const mk = edhaFindMarkGrant(actor);
    if (mk) {
      void edhaSetEdhaFlag(mk.designator, "plotDieMark", null);   // one grant — clear the designator's mark (GM relay)
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>${mk.mark.source || "Raise the Stakes"}</strong> (${mk.designator.name}) — ${actor.name} raises the stakes on this test against <strong>${mk.mark.targetName || "the designated target"}</strong> (Plot Die added).</p>` });
    }
  } catch (e) { console.error("Edha Content | plot-die consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaPlotDiePreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaPlotDieConsume);
}

// In-range ally helpers (same disposition as the owner, within the owner's <color> Attunement Range).
function edhaAttuneFtColor(owner, color) { return EDHA_ATTUNE_FT[edhaColorRank(owner, color)] || EDHA_ATTUNE_FT[1]; }
function edhaAlliesInAttune(owner, color) {
  const ot = edhaCasterToken(owner); if (!ot) return [];
  const disp = ot.document?.disposition ?? 1, ft = edhaAttuneFtColor(owner, color);
  return edhaTokensWithin(ot, ft).filter(t => t.actor && (t.document?.disposition ?? 1) === disp);
}
function edhaAllyInAttune(owner, tok, color) {
  if (!tok) return false;
  const ot = edhaCasterToken(owner); if (!ot || ot.id === tok.id) return false;
  if ((tok.document?.disposition ?? 1) !== (ot.document?.disposition ?? 1)) return false;
  return edhaTokensWithin(ot, edhaAttuneFtColor(owner, color)).some(t => t.id === tok.id);
}

// Generic edha-content flag write with the GM relay (a player rarely owns another actor).
// Pass value null to clear. Returns false only when no write path exists.
async function edhaSetEdhaFlag(actor, key, value) {
  try {
    if (actor.isOwner) { await actor.setFlag("edha-content", key, value); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online for this."); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: actor.uuid, key, value } });
    return true;
  } catch (e) { console.error(`Edha Content | set flag ${key} failed`, e); return false; }
}
// Is a round-scoped window ({ round, combatId }) still open? Armed OUT of combat = open until
// consumed; armed IN combat = open only during that combat's same round. Pure — pinned in tests/.
function edhaRoundWindowValid(mark, combat) {
  if (!mark) return false;
  if (mark.combatId) return !!combat && combat.id === mark.combatId && Number(combat.round) === Number(mark.round);
  return true;
}
// Set the plotDieNext flag on a target actor; cross-actor writes relay to the GM (a player rarely owns
// another PC). source/skill are stored for the consume note + the skill gate.
async function edhaGrantPlotDie(actor, { skill = null, source = "Raise the Stakes" } = {}) {
  return edhaSetEdhaFlag(actor, "plotDieNext", { skill: skill || null, source });
}
// console/macro API: edha.raiseStakes(tokenOrActorOrName, skillId?, source?) — manual Unity of Purpose etc.
function edhaResolveActorArg(arg) {
  if (!arg) return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
  if (arg.documentName === "Actor") return arg;
  if (arg.actor) return arg.actor;                                // a token
  if (typeof arg === "string") return game.actors?.getName?.(arg) ?? null;
  return null;
}
async function edhaRaiseStakesApi(actorArg, skill = null, source = "Raise the Stakes") {
  const a = edhaResolveActorArg(actorArg);
  if (!a) { ui.notifications?.warn("Edha: select a token or pass an actor/name to raiseStakes."); return false; }
  const ok = await edhaGrantPlotDie(a, { skill, source });
  if (ok) ChatMessage.create({ content: `<p>🎲 <strong>${source}</strong>: ${a.name}'s next ${skill ? String(skill).toUpperCase() + " " : ""}test raises the stakes.</p>` });
  return ok;
}

// Whisper recipients for a Coordination card: the owner's player(s) + the GM (so the owner sees the
// prompt without flooding the public log).
function edhaWhisperIds(owner) {
  return (game.users?.filter(u => u.active && (u.isGM || owner.testUserPermission?.(u, "OWNER"))) ?? []).map(u => u.id);
}

// Why did an in-range sweep come back empty? Accounts for the cause instead of a bare "none in
// range" (07-12b sweep-transparency convention — the bare message cost a bench cycle on 07-14:
// it can't distinguish no-token-on-scene / wrong side / genuinely out of range).
function edhaSweepEmptyNote(owner, ft, sameSide) {
  try {
    const ot = edhaCasterToken(owner);
    if (!ot) return `${owner.name} has no token on the current scene — use the talent from a PLACED token's sheet (a compendium or sidebar sheet has no position to measure from).`;
    const scene = ot.scene ?? canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
    const disp = ot.document?.disposition ?? 1;
    const cands = (canvas?.tokens?.placeables ?? []).filter(t => t.id !== ot.id && t.actor && (((t.document?.disposition ?? 1) === disp) === sameSide));
    if (!cands.length) return `No ${sameSide ? "same-side" : "opposing"} tokens on the scene at all.`;
    const dists = cands.map(t => ({ t, d: Math.hypot((t.center?.x ?? 0) - ot.center.x, (t.center?.y ?? 0) - ot.center.y) / gs * gd })).sort((a, b) => a.d - b.d);
    return `No ${sameSide ? "allies" : "targets"} within ${ft} ft — nearest (${dists[0].t.actor.name}) is ${Math.round(dists[0].d)} ft away; ${cands.length} candidate${cands.length === 1 ? "" : "s"} on the scene.`;
  } catch (e) { return "No candidates in range."; }
}

// Plot-die grant card: pick an in-range ally to receive a Plot Die on their next (skill-gated) test.
// Payload lives in data-* attributes (NOT a client-local map) — the watcher posts these GM-side but the
// OWNER's client clicks them, so the data has to travel with the chat HTML.
function edhaPostPlotGrantCard(owner, name, { skill = null, allies = null, whisperToOwner = false, note = "", gate = null } = {}) {
  try {
    const list = (allies ?? edhaAlliesInAttune(owner, "white"));
    const skillLabel = skill ? ` (next ${String(skill).toUpperCase()} test)` : " (next test)";
    const gateAttr = gate ? ` data-edha-gate="${encodeURIComponent(JSON.stringify(gate))}"` : "";
    let body;
    if (!list.length) {
      body = `<p style="opacity:.8">${edhaSweepEmptyNote(owner, edhaAttuneFtColor(owner, "white"), true)}</p>`;
    } else {
      body = list.map(t =>
        `<button type="button" class="edha-plotgrant-btn" data-edha-ally="${t.actor.uuid}" data-edha-skill="${skill || ""}" data-edha-source="${encodeURIComponent(name)}"${gateAttr}>${t.name || t.actor.name}</button>`
      ).join(" ");   // TOKEN name — two unlinked "Trooper" drops share an actor name (Ben's 07-14 screenshot)
    }
    const data = {
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🎲 <strong>${name}</strong> — grant Raise the Stakes${skillLabel} to an ally:</p>`
        + (note ? `<p style="opacity:.85;font-size:.9em">${note}</p>` : "") + body + `</div>`,
    };
    if (whisperToOwner) data.whisper = edhaWhisperIds(owner);
    ChatMessage.create(data);
  } catch (e) { console.error("Edha Content | plot-grant card failed", e); }
}
async function edhaPlotGrantClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const ref = await fromUuid(btn.dataset.edhaAlly).catch(() => null); const ally = ref?.actor ?? ref;
    if (!ally) return;
    const skill = btn.dataset.edhaSkill || null;
    const src = decodeURIComponent(btn.dataset.edhaSource || "Raise the Stakes");
    // Concordant Presence gates the grant on the first ally actually succeeding: prompt for the DC.
    let gate = null; try { gate = btn.dataset.edhaGate ? JSON.parse(decodeURIComponent(btn.dataset.edhaGate)) : null; } catch (e) {}
    if (gate) {
      const dc = await edhaPromptDC(`${src} — did the first test succeed?`, `${gate.rollerName || "The ally"} rolled <strong>${gate.rollerTotal}</strong>. Enter the test's DC; the Plot Die is granted only on a success.`);
      if (typeof dc === "number" && Number(gate.rollerTotal) < dc) {
        ui.notifications?.info(`${gate.rollerName || "The ally"} fell short of DC ${dc} — no Plot Die granted.`);
        btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-plotgrant-btn").forEach(b => b.disabled = true);
        btn.textContent = "no success — no grant"; return;
      }
    }
    await edhaGrantPlotDie(ally, { skill, source: src });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-plotgrant-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${ally.name}`;
    ChatMessage.create({ content: `<p>🎲 <strong>${src}</strong>: ${ally.name}'s next ${skill ? String(skill).toUpperCase() + " " : ""}test raises the stakes.</p>` });
  } catch (e) { console.error("Edha Content | plot-grant click failed", e); }
}
/* --- Tool A2: the designate-mark primitive (Guiding Signal shape, Ben 07-14) ---------------------
 * "Designate a character within Attunement Range; the NEXT ally who tests against them this round
 * raises the stakes." The card lists OPPOSING tokens in range (when the Line-Caller runs it, the
 * PCs; when a PC runs it, the adversaries). Clicking stores a round-scoped `plotDieMark` on the
 * DESIGNATOR; the plot-die pre-roll/consume pair injects for the first same-side roller whose
 * user-targets include the marked token, then clears the mark (GM relay). One flag, no per-ally
 * writes. Any later "mark an enemy, reward allies engaging it" talent is one designate call. */
function edhaPostDesignateCard(owner, name, { color = "white", note = "" } = {}) {
  try {
    const ot = edhaCasterToken(owner);
    const ft = edhaAttuneFtColor(owner, color);
    const targets = ot ? edhaTokensWithin(ot, ft).filter(t => t.actor && (t.document?.disposition ?? 1) !== (ot.document?.disposition ?? 1)) : [];
    const body = !targets.length
      ? `<p style="opacity:.8">${edhaSweepEmptyNote(owner, ft, false)}</p>`
      : targets.map(t => `<button type="button" class="edha-designate-btn" data-edha-target="${t.document.uuid}" data-edha-owner="${owner.uuid}" data-edha-source="${encodeURIComponent(name)}">${t.name || t.actor.name}</button>`).join(" ");   // TOKEN name — duplicate unlinked drops share an actor name
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🎯 <strong>${name}</strong> — designate a character within ${ft} ft:</p>`
        + (note ? `<p style="opacity:.85;font-size:.9em">${note}</p>` : "") + body + `</div>`,
    });
  } catch (e) { console.error("Edha Content | designate card failed", e); }
}
async function edhaDesignateClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const ownerRef = await fromUuid(btn.dataset.edhaOwner).catch(() => null);
    const owner = ownerRef?.actor ?? ownerRef; if (!owner) return;
    const tDoc = await fromUuid(btn.dataset.edhaTarget).catch(() => null); if (!tDoc) return;
    const src = decodeURIComponent(btn.dataset.edhaSource || "Guiding Signal");
    const c = game.combat ?? null;
    const ok = await edhaSetEdhaFlag(owner, "plotDieMark", { target: btn.dataset.edhaTarget, targetName: tDoc.name, source: src, round: c ? Number(c.round) : null, combatId: c?.id ?? null });
    if (!ok) return;
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-designate-btn").forEach(b => b.disabled = true);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎯 <strong>${src}</strong>: ${owner.name} designates <strong>${tDoc.name}</strong> — the next ally to test against them this round raises the stakes. <span style="opacity:.8">(target ${tDoc.name}'s token when rolling)</span></p>` });
  } catch (e) { console.error("Edha Content | designate click failed", e); }
}
// The mark grant a roller qualifies for: some same-side DESIGNATOR (not the roller) holds a live
// plotDieMark whose marked token is among the rolling user's targets.
function edhaFindMarkGrant(actor) {
  try {
    const rTok = edhaCasterToken(actor); if (!rTok) return null;
    const rDisp = rTok.document?.disposition ?? 1;
    const targeted = new Set([...(game.user?.targets ?? [])].map(t => t.document?.uuid).filter(Boolean));
    if (!targeted.size) return null;
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor; if (!a || a.uuid === actor.uuid || t.id === rTok.id) continue;
      if ((t.document?.disposition ?? 1) !== rDisp) continue;
      const m = a.getFlag?.("edha-content", "plotDieMark");
      if (!m || !edhaRoundWindowValid(m, game.combat ?? null)) continue;
      if (targeted.has(m.target)) return { designator: a, mark: m };
    }
    return null;
  } catch (e) { return null; }
}

function edhaBindPlotGrantButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-plotgrant-btn").forEach(b => b.addEventListener("click", edhaPlotGrantClick));
  root?.querySelectorAll?.(".edha-designate-btn").forEach(b => b.addEventListener("click", edhaDesignateClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindPlotGrantButtons(html));

/* --- Tool B: the Coordination post-roll watcher (Concordant Presence / Shared Conviction / Pillar) - */
// Once-per-round gate, parallel to the focus economy's (keyed off a separate "coordRound" store).
function edhaCoordOPRAllowed(owner, name, key) {
  const round = game.combat?.round; if (round == null) return true;
  return owner.getFlag?.("edha-content", "coordRound")?.[name]?.[key] !== round;
}
async function edhaCoordOPRMark(owner, name, key) {
  const round = game.combat?.round; if (round == null) return;
  const m = foundry.utils.deepClone(owner.getFlag("edha-content", "coordRound") ?? {});
  (m[name] ??= {})[key] = round;
  try { await owner.setFlag("edha-content", "coordRound", m); } catch (e) {}
}
// The kept (active) d20 natural result — for Shared Conviction's "plausible failure" heuristic.
function edhaKeptD20Nat(roll) {
  const d = roll?.dice?.find(x => x.faces === 20); if (!d) return null;
  const r = d.results?.find(x => x.active) ?? d.results?.[0];
  return r ? (Number(r.result) || 0) : null;
}

/* ============================================================================================
 * CONTESTED-ROLL RESOLUTION (2026-06-15) — make a talent's own skill_test a REAL pass/fail instead
 * of a "compare it yourself" reminder. A talent's useItem QUEUES a contest (capturing the current
 * target); the talent's skill_test roll is caught by the watcher below; whichever lands second
 * resolves it. Order-independent: for a skill_test activation useItem fires first, then the roll —
 * but a TTL breadcrumb tolerates either order (and a slow roll dialog). Contest kinds:
 *   • defense  — success = (Blue/White total ≥ target.system.defenses.<key>.value)
 *   • opposed  — auto-roll the target's own skill (e.g. Athletics) and compare
 *   • prompt   — ask the GM for a DC (used where a plain test has no static defense)
 * When there is no target or the defense can't be read, it falls back to the talent's manual card.
 * ============================================================================================ */
const EDHA_CONTEST_TTL = 120000;     // a talent's roll may follow its use by this long (slow roll dialog)
const EDHA_CONTEST_BACK = 8000;      // ...or precede it by this long, if the system fires useItem after the roll
const _edhaContestQueue = new Map();   // ownerId -> { color, onResolve, ts }
const _edhaLastRoll     = new Map();   // ownerId -> { skill, total, nat, ts, used }

function edhaReadDefense(actor, key) {
  if (!actor || !key) return null;
  const v = Number(foundry.utils.getProperty(actor, `system.defenses.${key}.value`));
  return Number.isFinite(v) ? v : null;
}
// Queue a contest the moment a talent is used (captures game.user.targets reliably on the owner's client).
// The talent's own skill_test roll is matched by edhaContestWatch — order-independent (see edhaTryResolveContest).
function edhaQueueContest(owner, color, onResolve) {
  if (!owner) return;
  _edhaContestQueue.set(owner.id, { color, onResolve, ts: Date.now() });
  void edhaTryResolveContest(owner.id);
}
function edhaContestWatch(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    _edhaLastRoll.set(actor.id, { skill: roll?.data?.skill?.id ?? null, total: Number(roll.total) || 0, nat: edhaKeptD20Nat(roll) ?? 0, ts: Date.now(), used: false });
    if (_edhaContestQueue.has(actor.id)) void edhaTryResolveContest(actor.id);
  } catch (e) { console.error("Edha Content | contest watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaContestWatch);

async function edhaTryResolveContest(ownerId) {
  const q = _edhaContestQueue.get(ownerId); if (!q) return;
  if (Date.now() - q.ts > EDHA_CONTEST_TTL) { _edhaContestQueue.delete(ownerId); return; }   // gave up waiting for a roll
  const r = _edhaLastRoll.get(ownerId);
  if (!r || r.used) return;                                          // wait for the talent's own roll
  if (q.color && r.skill && r.skill !== q.color) return;            // a different test — keep waiting for the talent's
  const dt = r.ts - q.ts;                                           // ≥0: roll after the use (normal); <0: roll before it
  if (dt >= 0 ? dt > EDHA_CONTEST_TTL : -dt > EDHA_CONTEST_BACK) return;   // must be the roll tied to THIS use
  r.used = true;
  _edhaContestQueue.delete(ownerId);
  try { await q.onResolve({ total: r.total, nat: r.nat }); } catch (e) { console.error("Edha Content | contest resolve failed", e); }
}

// GM-only DC prompt (DialogV2 in v13, Dialog fallback). Returns: a Number (DC entered), null (blank), or
// undefined (the GM chose "judge it" / closed → caller treats as owner-judged).
async function edhaPromptDC(title, hint) {
  const content = `<p>${hint}</p><p><label>Difficulty (DC): <input type="number" name="edhaDC" style="width:6em" autofocus></label></p>`;
  const DV2 = foundry.applications?.api?.DialogV2;
  if (DV2) {
    try {
      return await DV2.wait({
        window: { title }, content, rejectClose: false,
        buttons: [
          { action: "ok", label: "Resolve", default: true, callback: (ev, btn) => { const v = Number(btn.form.elements.edhaDC?.value); return Number.isFinite(v) && btn.form.elements.edhaDC?.value !== "" ? v : null; } },
          { action: "judge", label: "No DC — judge it", callback: () => undefined },
        ],
      });
    } catch (e) { return undefined; }
  }
  return await new Promise((resolve) => new Dialog({
    title, content,
    buttons: {
      ok: { label: "Resolve", callback: (h) => { const el = (h[0] ?? h).querySelector("[name=edhaDC]"); const v = Number(el?.value); resolve(Number.isFinite(v) && el?.value !== "" ? v : null); } },
      judge: { label: "No DC — judge it", callback: () => resolve(undefined) },
    }, default: "ok", close: () => resolve(undefined),
  }).render(true));
}

// Roll a target's own skill for an OPPOSED contest (e.g. Redirect Momentum: Blue vs the mover's Athletics).
// The modifier is rank + the linked attribute (cosmere skills don't expose a flat `.mod` in roll data, so
// we mirror edhaWhiteMod's rank+attr approach). attrId defaults to the skill's natural attribute.
const EDHA_SKILL_ATTR = { ath: "str", prc: "awa", sur: "awa", dec: "pre", lea: "pre", dis: "wil" };   // dis (Discipline) → wil per foundry-build.js's SKILL_ATTR (Order's Sealed Edict/Verdict contests)
async function edhaRollOpposedSkill(target, skillId, attrId = null) {
  try {
    const data = target.getRollData?.() ?? {};
    const attr = attrId || EDHA_SKILL_ATTR[skillId] || null;
    const parts = ["1d20"];                                         // rollData shape mirrors edhaWhiteMod: @skills.<id>.rank + @attr.<id>
    if (foundry.utils.getProperty(data, `skills.${skillId}.rank`) != null) parts.push(`@skills.${skillId}.rank`);
    if (attr && foundry.utils.getProperty(data, `attr.${attr}`) != null) parts.push(`@attr.${attr}`);
    let roll;
    try { roll = await (new Roll(parts.join(" + "), data)).evaluate(); }
    catch (e) { roll = await (new Roll("1d20", data)).evaluate(); }
    return Number(roll.total) || 0;
  } catch (e) { return 0; }
}

// Rewrite an already-rendered roll's displayed total (Voice of Authority / Bound by Word "actually changes
// the result in Foundry"). Editing another actor's message needs the GM, so relay when we aren't one.
function edhaFindRecentRollMessage(actor, total) {
  const want = Math.round(Number(total));
  const msgs = game.messages?.contents ?? [];
  for (let i = msgs.length - 1; i >= 0 && i >= msgs.length - 50; i--) {
    const m = msgs[i]; if (!m?.rolls?.length) continue;
    const spk = ChatMessage.getSpeakerActor(m.speaker);
    if (actor && spk && spk.id !== actor.id) continue;
    if (Math.round(Number(m.rolls[0].total)) === want) return m;
  }
  return null;
}
async function edhaApplyRollRewrite(message, newTotal, noteHtml) {
  try {
    if (!message?.rolls?.length) return false;
    const r = message.rolls[0];
    try { r._total = Number(newTotal); } catch (e) {}
    const json = (typeof r.toJSON === "function") ? r.toJSON() : foundry.utils.deepClone(r);
    json.total = Number(newTotal);
    const amend = noteHtml ? `<div class="edha-roll-amend" style="opacity:.9;font-size:.9em;border-top:1px solid #8884;margin-top:4px;padding-top:3px">${noteHtml}</div>` : "";
    await message.update({ rolls: [JSON.stringify(json)], content: (message.content || "") + amend });
    return true;
  } catch (e) { console.error("Edha Content | roll rewrite failed", e); return false; }
}
// Rewrite by actor+oldTotal; GM does it directly, a player relays to the GM. Returns true if applied locally.
async function edhaRewriteOrRelay(actor, oldTotal, newTotal, noteHtml) {
  const msg = edhaFindRecentRollMessage(actor, oldTotal);
  if (msg && (game.user?.isGM || msg.isOwner)) return await edhaApplyRollRewrite(msg, newTotal, noteHtml);
  if (game.users?.activeGM) {
    try { game.socket.emit("module.edha-content", { action: "rewrite-roll", payload: { actorUuid: actor?.uuid ?? null, oldTotal, newTotal, noteHtml } }); return true; }
    catch (e) {}
  }
  return false;
}

// A whispered "you may react" card for a Coordination owner. Click → deduct the owner's OWN cost(s)
// (owner-owned → no relay) + post the result note. The 1-reaction-per-round economy is approximated by
// a once/round/owner/talent gate (the broader cross-talent reaction limit stays GM-tracked).
function edhaPostCoordReactionCard(owner, name, roller, { costs = [], prompt = "", result = "", contest = null } = {}) {
  try {
    if (!edhaCoordOPRAllowed(owner, name, "_react")) return;       // already reacted with this talent this round
    const costLabel = costs.length ? costs.map(c => `${c.value} ${EDHA_RES_LABEL[c.resource] || c.resource}`).join(" + ") : "";
    const contestAttr = contest ? ` data-edha-contest="${encodeURIComponent(JSON.stringify(contest))}"` : "";
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>⚡ <strong>${name}</strong> — ${prompt}</p>`
        + `<button type="button" class="edha-coordreact-btn" data-edha-owner="${owner.uuid}" data-edha-name="${encodeURIComponent(name)}" data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}" data-edha-result="${encodeURIComponent(result)}"${contestAttr}>Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | coord reaction card failed", e); }
}
async function edhaCoordReactClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const ref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
    const name = decodeURIComponent(btn.dataset.edhaName || "");
    let costs = []; try { costs = JSON.parse(decodeURIComponent(btn.dataset.edhaCosts || "[]")) || []; } catch (e) {}
    let contest = null; try { contest = btn.dataset.edhaContest ? JSON.parse(decodeURIComponent(btn.dataset.edhaContest)) : null; } catch (e) {}
    let result = decodeURIComponent(btn.dataset.edhaResult || "");
    if (!edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} was already used this round.`); btn.disabled = true; return; }
    // Shared Conviction (and any boost contest): prompt for the DC and report whether the boost saves the test.
    if (contest) {
      const dc = await edhaPromptDC(`${name} — did the test fail?`, `${contest.allyName || "The ally"} rolled <strong>${contest.rollTotal}</strong>; your modifier raises it to <strong>${contest.boostedTotal}</strong>. Enter the test's DC to resolve.`);
      if (typeof dc === "number") {
        if (contest.rollTotal >= dc) { ui.notifications?.info(`${contest.allyName || "The ally"} already meets DC ${dc} — no boost needed.`); btn.disabled = true; btn.textContent = "not needed"; return; }
        result = contest.boostedTotal >= dc
          ? `✊ <strong>${name}</strong> (${owner.name}): +modifier turns ${contest.rollTotal} into <strong>${contest.boostedTotal}</strong> — now meets DC ${dc} (<strong>success</strong>).`
          : `✊ <strong>${name}</strong> (${owner.name}): +modifier raises ${contest.rollTotal} to <strong>${contest.boostedTotal}</strong>, still short of DC ${dc}.`;
      }
    }
    await edhaCoordOPRMark(owner, name, "_react");
    for (const c of costs) { try { const res = owner.system?.resources?.[c.resource], cur = res?.value ?? 0; await owner.update({ [`system.resources.${c.resource}.value`]: Math.max(0, cur - c.value) }); } catch (e) {} }
    btn.disabled = true; btn.textContent = `${name} used`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>${result}</p>` });
  } catch (e) { console.error("Edha Content | coord react click failed", e); }
}
function edhaBindCoordReactButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-coordreact-btn").forEach(b => b.addEventListener("click", edhaCoordReactClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindCoordReactButtons(html));

// One GM client inspects each completed ally-in-range test and surfaces the matching Coordination cards.
async function edhaCoordWatch(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;                              // exactly one GM posts the (whispered) cards
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller) ?? roller.getActiveTokens?.()[0]; if (!rtok) return;
    const skillId = roll?.data?.skill?.id ?? null;
    let comps = 0; try { comps = roll.complicationsCount || 0; } catch (e) {}
    const nat = edhaKeptD20Nat(roll);

    // Concordant Presence — an ally-in-range test → offer to grant a same-skill Plot Die to the next ally.
    // Once per (owner, skill, round): one prompt per skill per round; the owner clicks ONLY if it succeeded.
    if (skillId) for (const owner of edhaCharacterOwnersOf("Concordant Presence")) {
      if (owner === roller || !edhaAllyInAttune(owner, rtok, "white")) continue;
      // 07-12 ruling (Ben, pass 3): visible allies only — "too strong otherwise" (it was triggering
      // through walls). Both the triggering ally and the grant recipients must be seen (edhaCanSee).
      const cpTok = edhaCasterToken(owner);
      if (!edhaCanSee(cpTok, rtok)) continue;
      if (!edhaCoordOPRAllowed(owner, "Concordant Presence", skillId)) continue;
      const allies = edhaAlliesInAttune(owner, "white").filter(t => t.actor !== roller && edhaCanSee(cpTok, t));
      if (!allies.length) continue;
      await edhaCoordOPRMark(owner, "Concordant Presence", skillId);
      edhaPostPlotGrantCard(owner, "Concordant Presence", { skill: skillId, allies, whisperToOwner: true,
        note: `${roller.name} just tested ${String(skillId).toUpperCase()} → ${Number(roll.total) || 0}. On a success, grant the next ally's ${String(skillId).toUpperCase()} test the Plot Die.`,
        gate: { rollerTotal: Number(roll.total) || 0, rollerName: roller.name } });
    }

    // Pillar of Order — an ally-in-range rolled a Complication → spend 1 Inv to change it to a blank face.
    if (comps > 0) for (const owner of edhaCharacterOwnersOf("Pillar of Order")) {
      if (owner === roller || !edhaAllyInAttune(owner, rtok, "white")) continue;
      edhaPostCoordReactionCard(owner, "Pillar of Order", roller, {
        costs: [{ resource: "inv", value: 1 }],
        prompt: `${roller.name} rolled a Complication. Spend 1 Investiture to change it to a blank face.`,
        result: `🛡️ <strong>Pillar of Order</strong> (${owner.name}): ${roller.name}'s Complication is negated (blank face).`,
      });
    }

    // Shared Conviction — an ally-in-range test that PLAUSIBLY failed (Complication or low d20) → spend
    // 2 Focus + 1 Investiture to add your White modifier (rank + WIL). The owner judges actual failure.
    if (skillId && (comps > 0 || (nat != null && nat <= 10))) for (const owner of edhaCharacterOwnersOf("Shared Conviction")) {
      if (owner === roller || !edhaAllyInAttune(owner, rtok, "white")) continue;
      let mod = 0; try { mod = Math.floor((await (new Roll("@skills.white.rank + @attr.wil", owner.getRollData())).evaluate()).total) || 0; } catch (e) {}
      const rollTotal = Number(roll.total) || 0, newTotal = rollTotal + mod;
      edhaPostCoordReactionCard(owner, "Shared Conviction", roller, {
        costs: [{ resource: "foc", value: 2 }, { resource: "inv", value: 1 }],
        prompt: `${roller.name} tested ${String(skillId).toUpperCase()} → <strong>${roll.total}</strong>. If they would fail, add your White modifier (+${mod}) → <strong>${newTotal}</strong>.`,
        result: `✊ <strong>Shared Conviction</strong> (${owner.name}): +${mod} to ${roller.name}'s ${String(skillId).toUpperCase()} test → <strong>${newTotal}</strong>.`,
        contest: { rollTotal, boostedTotal: newTotal, allyName: roller.name },
      });
    }
  } catch (e) { console.error("Edha Content | coordination watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaCoordWatch);

/* --- Beacon of Stability — cleanse a condition from an in-range ally on Draw Mana ----------------- */
// Posted by edhaDrawMana's White rider when the owner has Beacon of Stability (name-based).
function edhaConditionLabel(id) {
  const raw = CONFIG.COSMERE?.conditions?.[id]?.label ?? CONFIG.COSMERE?.statuses?.[id]?.label
    ?? (CONFIG.statusEffects ?? []).find(s => s.id === id)?.name ?? id;
  return game.i18n?.localize(raw) ?? raw;
}
function edhaPostBeaconCard(owner, allyTokens) {
  try {
    const rows = [];
    for (const t of (allyTokens || [])) {
      const a = t.actor; if (!a) continue;
      for (const c of [...(a.statuses ?? [])]) {
        if (!c || c === (CONFIG.specialStatusEffects?.DEFEATED || "dead")) continue;
        rows.push(`<button type="button" class="edha-beacon-btn" data-edha-owner="${owner.uuid}" data-edha-ally="${a.uuid}" data-edha-status="${c}">${a.name}: ${edhaConditionLabel(c)}</button>`);
      }
    }
    if (!rows.length) return;                                       // nothing to cleanse → no card
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🕊️ <strong>Beacon of Stability</strong> — spend 1 Investiture to remove a condition from an ally in range:</p>${rows.join(" ")}</div>`,
    });
  } catch (e) { console.error("Edha Content | Beacon card failed", e); }
}
async function edhaBeaconClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const aref = await fromUuid(btn.dataset.edhaAlly).catch(() => null); const ally = aref?.actor ?? aref;
    const statusId = btn.dataset.edhaStatus;
    if (!owner || !ally || !statusId) return;
    const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
    try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - 1) }); } catch (e) {}
    await edhaToggleStatus(ally, statusId, false);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-beacon-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ cleansed`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🕊️ <strong>Beacon of Stability</strong>: removed <strong>${edhaConditionLabel(statusId)}</strong> from ${ally.name} (−1 Investiture).</p>` });
  } catch (e) { console.error("Edha Content | Beacon click failed", e); }
}
function edhaBindBeaconButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-beacon-btn").forEach(b => b.addEventListener("click", edhaBeaconClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindBeaconButtons(html));

/* --- White / Coordination ACTIVE-ability use hooks (Guiding Signal, Ordered Advance) -------------- */
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    // Guiding Signal: cost paid by the activation → designate a TARGET (an opposing token in range);
    // the next ally testing against it this round gets the Plot Die (card text is canon — the old
    // pick-an-ally grant card was engine drift, Ben 07-14).
    if (item.name === "Guiding Signal" && edhaOwnsTalent(actor, "Guiding Signal")) {
      edhaPostDesignateCard(actor, "Guiding Signal", { color: "white",
        note: "The next ally to test against the designated character this round raises the stakes (have them target the token when rolling)." });
    }
    // Ordered Advance: cost paid by the activation → arm a round-window; the updateToken watcher below
    // posts the allies-within-10ft movement card each time the owner then moves (Ben 07-14 — was a
    // bare GM-narrated round note).
    if (item.name === "Ordered Advance" && edhaOwnsTalent(actor, "Ordered Advance")) {
      const c = game.combat ?? null;
      void edhaSetEdhaFlag(actor, "orderedAdvance", { round: c ? Number(c.round) : null, combatId: c?.id ?? null });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🚶 <strong>Ordered Advance</strong> (${actor.name}): this round, whenever ${actor.name} moves, a card will list the allies within 10 ft who may move half their Speed without provoking Reactions.</p>` });
    }
  } catch (e) { console.error("Edha Content | White use-hook failed", e); }
});

// Half walking Speed in ft, floored to the 2.5-ft half-square (adversary rates live under
// .override, PC rates under .value — take whichever resolves). Pure — pinned in tests/.
function edhaHalfSpeed(actor) {
  const r = actor?.system?.movement?.walk?.rate;
  const v = (r && typeof r === "object") ? Number(r.value ?? r.override) : Number(r);
  return Math.floor(((Number.isFinite(v) && v > 0 ? v : 25) / 2) / 2.5) * 2.5;
}
// Ordered Advance movement watcher: while the owner's round-window is armed, every move it makes
// posts the card enumerating the allies within 10 ft of where it stopped (with each one's
// half-Speed), or accounts for why nobody qualified. Initiating client only (updateToken fires
// everywhere); engine-driven forced movement is not the drilled advance and is skipped.
Hooks.on("updateToken", (doc, change, options, userId) => {
  try {
    if (userId !== game.user?.id) return;
    if (change?.x === undefined && change?.y === undefined) return;
    if (options?.edhaForcedMove) return;
    const actor = doc.actor; if (!actor) return;
    const m = actor.getFlag?.("edha-content", "orderedAdvance");
    if (!edhaRoundWindowValid(m, game.combat ?? null)) return;
    const scene = doc.parent; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
    const cx = doc.x + (doc.width * gs) / 2, cy = doc.y + (doc.height * gs) / 2;   // destination center (doc already updated)
    const disp = doc.disposition ?? 1;
    const allies = (canvas?.tokens?.placeables ?? []).filter(t => {
      if (t.id === doc.id || !t.actor) return false;
      if ((t.document?.disposition ?? 1) !== disp) return false;
      return (Math.hypot((t.center?.x ?? 0) - cx, (t.center?.y ?? 0) - cy) / gs * gd) <= 10;
    });
    const content = allies.length
      ? `<div class="edha-trigger-card"><p>🚶 <strong>Ordered Advance</strong> — ${actor.name} moved; allies within 10 ft may move half their Speed without provoking Reactions:</p><ul>${allies.map(t => `<li><strong>${t.actor.name}</strong> — up to ${edhaHalfSpeed(t.actor)} ft</li>`).join("")}</ul></div>`
      : `<p>🚶 <strong>Ordered Advance</strong> — ${actor.name} moved, but no allies were within 10 ft of where it stopped.</p>`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
  } catch (e) { console.error("Edha Content | Ordered Advance movement card failed", e); }
});

/* ============================================================================================
 * WHITE / BULWARK tree engine (2026-06-14) — damage mitigation / redirection / retaliation.
 * Center of gravity is the applyDamage wrapper. PASSIVES pre-reduce in the wrapper (no consent needed):
 * Shield Wall (any attack on a wall-protected adjacent ally) + Devoted Conduit (only on REDIRECTED
 * damage — Shared Burden's "in their place" hit; ruling C1) — both wired in the pre-pass above. OPTIONAL
 * REACTIONS can't cleanly intervene before a synchronous apply, so they use the Mender's-Instinct model:
 * a whispered post-damage card that heals back / redirects / retaliates / revives (ruling A). Tests are
 * OWNER-JUDGED — the card acts on click; the player rolls the White test and clicks only on success
 * (ruling D). NAME-BASED; the talents stay events:{}. Hardy is the lone data-side AE (hea.max.bonus +=
 * @level — pack rebuild). Guardian Stance stays a manual toggled-OFF +1 Deflect AE (ruling E).
 * ============================================================================================ */
function edhaAdjacent(tokA, tokB) {
  if (!tokA || !tokB) return false;
  const gs = (tokA.scene ?? canvas?.scene)?.grid?.size || 100;
  const dx = Math.abs((tokA.center?.x ?? 0) - (tokB.center?.x ?? 0)) / gs;
  const dy = Math.abs((tokA.center?.y ?? 0) - (tokB.center?.y ?? 0)) / gs;
  return Math.max(dx, dy) <= 1.05;   // Chebyshev ≤ 1 square (orthogonal + diagonal), small epsilon
}
function edhaAdjacentAllies(ownerTok) {
  const disp = ownerTok?.document?.disposition ?? 1;
  return (canvas?.tokens?.placeables ?? []).filter(t => t.id !== ownerTok.id && t.actor
    && (t.document?.disposition ?? 1) === disp && (t.actor?.system?.resources?.hea?.value ?? 1) > 0 && edhaAdjacent(ownerTok, t));
}

/* --- Guardian Stance auto-toggle (07-12 pass 3 — ruling E re-litigated) ----------------------------
 * "While an ally is adjacent to you, you both gain +1 Deflect." Was a manual toggled-OFF AE (ruling E,
 * pre-watcher era); adjacency is fully watchable (the def-buff/Isolated-marker pattern), so a GM-side
 * sweep now manages a +1 Deflect AE (system.deflect.bonus — the same DerivedValueField .bonus the
 * defense buffs use; the sheet's "Armor" label is just the deflect SOURCE config, not a wrong key) on
 * the owner and every adjacent living ally, applied/removed as tokens move. The talent's old manual
 * AE was removed from the authored data so the two can't double-stack. */
let _edhaGuardTimer = null;
function edhaGuardianSweepSoon() {
  if (!edhaDefBuffGmGate()) return;
  if (!edhaCharacterOwnersOf("Guardian Stance").length) return;
  clearTimeout(_edhaGuardTimer);
  _edhaGuardTimer = setTimeout(() => { void edhaGuardianStanceSweep(); }, 250);
}
async function edhaGuardianStanceSweep() {
  try {
    const want = new Set();   // actor ids that should carry the buff right now
    for (const owner of edhaCharacterOwnersOf("Guardian Stance")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((owner.system?.resources?.hea?.value ?? 1) <= 0) continue;
      const allies = edhaAdjacentAllies(otok);
      if (!allies.length) continue;
      want.add(owner.id);
      for (const t of allies) if (t.actor) want.add(t.actor.id);
    }
    const seen = new Set();
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor; if (!a || seen.has(a.id)) continue;
      seen.add(a.id);
      const has = (a.effects ?? []).find(e => e.getFlag?.("edha-content", "guardianStance"));
      if (want.has(a.id) && !has) {
        await a.createEmbeddedDocuments("ActiveEffect", [{
          name: "Guardian Stance (+1 Deflect)", img: "icons/magic/defensive/shield-barrier-blue.webp",
          changes: [{ key: "system.deflect.bonus", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 }],
          description: "<p>+1 Deflect while the Guardian Stance adjacency holds (auto-managed — moves apart to remove).</p>",
          flags: { "edha-content": { guardianStance: true } },
        }]);
      } else if (!want.has(a.id) && has) {
        await a.deleteEmbeddedDocuments("ActiveEffect", [has.id]);
      }
    }
  } catch (e) { console.error("Edha Content | Guardian Stance sweep failed", e); }
}
Hooks.on("updateToken", (doc, changes) => { try { if ("x" in changes || "y" in changes) edhaGuardianSweepSoon(); } catch (e) {} });
Hooks.on("createToken", () => edhaGuardianSweepSoon());
Hooks.on("deleteToken", () => edhaGuardianSweepSoon());
Hooks.on("combatStart", () => edhaGuardianSweepSoon());
Hooks.once("ready", () => edhaGuardianSweepSoon());
// Subtract `amount` total HP-damage from the non-heal instances (in place); returns the amount removed.
function edhaReduceInstances(list, amount) {
  let rem = Math.max(0, Math.floor(amount)), done = 0;
  for (const inst of list) {
    if (rem <= 0) break;
    if (!inst || inst.type === "heal" || !(Number(inst.amount) > 0)) continue;
    const cut = Math.min(rem, Number(inst.amount));
    inst.amount = Number(inst.amount) - cut; rem -= cut; done += cut;
  }
  return done;
}
// Cross-actor heal/damage: do it directly if we own the target, else relay to the GM (burst-apply).
async function edhaCrossHeal(actor, amount) {
  if (!actor || !(amount > 0)) return;
  if (actor.isOwner) { await edhaHealActor(actor, amount); return; }
  try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: actor.uuid, amount, heal: true }] } }); } catch (e) {}
}
async function edhaCrossDamage(actor, amount, type, opts = {}) {
  if (!actor || !(amount > 0)) return;
  if (actor.isOwner) { try { await actor.applyDamage([{ amount, type }], { chatMessage: false, ...opts }); } catch (e) {} return; }
  try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: actor.uuid, amount, type }] } }); } catch (e) {}
}
// Post a GM-ONLY whispered card that must never reach the players. A whisper is ALWAYS visible to its
// author, so a player who authored a "GM-only" card would see exactly the information it means to hide
// (Black Draw Mana's behind-a-wall / hidden enemy counts — 07-12b ruling, 07-17 playtest regression).
// The card is therefore CREATED BY THE GM: directly if we're the GM, else relayed. No GM online → no
// one to hide it from and no one to post it, so nothing is created.
async function edhaPostGmCard(actor, content) {
  try {
    if (game.user?.isGM) {
      const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
      if (gmIds.length && content) await ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor }), content });
      return;
    }
    if (!game.users?.activeGM) return;
    game.socket.emit("module.edha-content", { action: "gm-card", payload: { actorUuid: actor?.uuid ?? null, content } });
  } catch (e) { console.error("Edha Content | GM card post failed", e); }
}

// Post-damage reaction cards (whispered, GM-posted). `redirected` short-circuits so Shared Burden's own
// redirected hit doesn't cascade into more reactions.
async function edhaBulwarkReactions(victim, dealer, dealtAmt, prevHp, newHp, redirected) {
  try {
    if (!edhaDefBuffGmGate() || redirected || dealtAmt <= 0) return;
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0]; if (!vtok) return;
    const vdisp = vtok.document?.disposition ?? 1;
    const attacker = (dealer?.actor && dealer.actor !== victim) ? dealer.actor : null;
    const atok = attacker ? (edhaCasterToken(attacker) ?? attacker.getActiveTokens?.()[0]) : null;
    const allyOwnerTok = (owner) => { const o = edhaCasterToken(owner); return (o && owner !== victim && (o.document?.disposition ?? 1) === vdisp) ? o : null; };

    for (const owner of edhaCharacterOwnersOf("Interposing Shield")) {            // ally within 10 ft
      const otok = allyOwnerTok(owner); if (!otok) continue;
      if (!edhaTokensWithin(otok, 10).some(t => t.id === vtok.id)) continue;
      const amt = Math.min(dealtAmt, Math.floor(edhaEvalSync("1d(2 * @skills.white.rank + 2)", owner.getRollData()) / 2));
      if (amt <= 0) continue;
      edhaPostBulwarkCard(owner, "Interposing Shield", { victim, action: "heal-ally", amount: amt, costs: [{ resource: "inv", value: 1 }],
        prompt: `${victim.name} took ${dealtAmt} damage within 10 ft. Spend 1 Inv → move up to 10 ft toward them and reduce it by <strong>${amt}</strong> (half [Die]).` });
    }
    for (const owner of edhaCharacterOwnersOf("Shared Burden")) {                 // adjacent ally
      const otok = allyOwnerTok(owner); if (!otok || !edhaAdjacent(otok, vtok)) continue;
      const half = Math.floor(dealtAmt / 2); if (half <= 0) continue;
      edhaPostBulwarkCard(owner, "Shared Burden", { victim, action: "redirect", amount: half, costs: [{ resource: "inv", value: 2 }],
        prompt: `${victim.name} took ${dealtAmt} damage adjacent to you. Spend 2 Inv → take <strong>${half}</strong> of it in their place.` });
    }
    if (attacker && atok) for (const owner of edhaCharacterOwnersOf("Retributive Guard")) {  // adjacent ally hit by an enemy in range
      const otok = allyOwnerTok(owner); if (!otok || !edhaAdjacent(otok, vtok)) continue;
      if ((atok.document?.disposition ?? 1) === (otok.document?.disposition ?? 1)) continue;
      if (!edhaTokensWithin(otok, edhaAttuneFtColor(owner, "white")).some(t => t.id === atok.id)) continue;
      const amt = Math.floor(edhaEvalSync(`(${Number(owner.system?.tier) || 1})d(2 * @skills.white.rank + 2)`, owner.getRollData()));
      if (amt <= 0) continue;
      edhaPostBulwarkCard(owner, "Retributive Guard", { attacker, action: "retaliate", amount: amt, costs: [{ resource: "inv", value: 1 }],
        prompt: `${victim.name} (adjacent) was hit by ${attacker.name}. Spend 1 Inv → test White vs Spiritual; on a success deal <strong>${amt}</strong> spirit to ${attacker.name}.` });
    }
    for (const owner of edhaCharacterOwnersOf("Lifeline")) {                      // your linked creature took damage
      if (owner === victim) continue;
      if (owner.getFlag?.("edha-content", "lifeline")?.targetUuid !== victim.uuid) continue;
      edhaPostLifelineCard(owner, victim, dealtAmt);                              // owner-judged: take up to half as Spirit, heal them [T][D]
    }
    if (newHp <= 0 && prevHp > 0) for (const owner of edhaCharacterOwnersOf("Unbreakable Line")) {  // adjacent ally dropped to 0
      const otok = allyOwnerTok(owner); if (!otok || !edhaAdjacent(otok, vtok)) continue;
      const dc = Math.max(1, Math.ceil(dealtAmt / 2));
      edhaPostBulwarkCard(owner, "Unbreakable Line", { victim, action: "revive", amount: 1, costs: [{ resource: "inv", value: 3 }], oncePerRound: true,
        prompt: `${victim.name} (adjacent) dropped to 0. Spend 3 Inv → test White DC ${dc}; on a success they drop to <strong>1</strong> health instead.` });
    }
  } catch (e) { console.error("Edha Content | Bulwark reactions failed", e); }
}
function edhaPostBulwarkCard(owner, name, { victim = null, attacker = null, action = "", amount = 0, costs = [], prompt = "", oncePerRound = false } = {}) {
  try {
    if (oncePerRound && !edhaCoordOPRAllowed(owner, name, "_react")) return;
    const costLabel = costs.length ? costs.map(c => `${c.value} ${EDHA_RES_LABEL[c.resource] || c.resource}`).join(" + ") : "";
    const attrs = [`data-edha-owner="${owner.uuid}"`, `data-edha-name="${encodeURIComponent(name)}"`, `data-edha-action="${action}"`,
      `data-edha-amount="${amount}"`, `data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}"`, `data-edha-once="${oncePerRound ? 1 : 0}"`];
    if (victim) attrs.push(`data-edha-victim="${victim.uuid}"`);
    if (attacker) attrs.push(`data-edha-attacker="${attacker.uuid}"`);
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🛡️ <strong>${name}</strong> — ${prompt}</p>`
        + `<button type="button" class="edha-bulwark-btn" ${attrs.join(" ")}>Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Bulwark card failed", e); }
}
async function edhaBulwarkClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    const name = decodeURIComponent(ds.edhaName || ""), action = ds.edhaAction || "";
    const amount = Math.max(0, Math.floor(Number(ds.edhaAmount) || 0)), once = ds.edhaOnce === "1";
    let costs = []; try { costs = JSON.parse(decodeURIComponent(ds.edhaCosts || "[]")) || []; } catch (e) {}
    if (once && !edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} already used this round.`); btn.disabled = true; return; }
    const vref = ds.edhaVictim ? await fromUuid(ds.edhaVictim).catch(() => null) : null; const victim = vref?.actor ?? vref;
    const aref = ds.edhaAttacker ? await fromUuid(ds.edhaAttacker).catch(() => null) : null; const attacker = aref?.actor ?? aref;
    if (once) await edhaCoordOPRMark(owner, name, "_react");
    for (const c of costs) { try { const res = owner.system?.resources?.[c.resource], cur = res?.value ?? 0; await owner.update({ [`system.resources.${c.resource}.value`]: Math.max(0, cur - c.value) }); } catch (e) {} }
    let note = "";
    if (action === "heal-ally" && victim) { await edhaCrossHeal(victim, amount); note = `${owner.name} reduces ${victim.name}'s damage by ${amount} and moves up to 10 ft toward them (Interposing Shield).`; }
    else if (action === "redirect" && victim) {
      await edhaCrossHeal(victim, amount);
      try { await owner.applyDamage([{ amount, type: "vital" }], { chatMessage: false, edhaRedirected: true }); } catch (e) {}
      note = `${owner.name} takes ${amount} in ${victim.name}'s place (Shared Burden).`;
    }
    else if (action === "retaliate" && attacker) { await edhaCrossDamage(attacker, amount, "spirit", { edhaSource: owner }); note = `${owner.name} deals ${amount} spirit to ${attacker.name} (Retributive Guard — on a successful White test).`; }
    else if (action === "revive" && victim) { const cur = Number(victim.system?.resources?.hea?.value) || 0; await edhaCrossHeal(victim, Math.max(1, 1 - cur)); note = `${victim.name} drops to 1 health instead of 0 (Unbreakable Line — on a successful White test).`; }
    else { note = "(no valid target — re-target and retry)"; }
    btn.disabled = true; btn.textContent = `${name} used`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🛡️ <strong>${name}</strong>: ${note}</p>` });
  } catch (e) { console.error("Edha Content | Bulwark click failed", e); }
}
function edhaBindBulwarkButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-bulwark-btn").forEach(b => b.addEventListener("click", edhaBulwarkClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindBulwarkButtons(html));

/* ============================================================================================
 * WHITE / ACCORD tree engine (2026-06-14c) — social control: Disoriented/Determined, accords, disadvantage.
 * The most narrative White tree (influence / verbal accords / objective tests have no Foundry events), so
 * several talents are owner-judged cards or manual. NAME-BASED; Disoriented auto-expires at the END OF THE
 * OWNER'S NEXT TURN (owner-relative, reusing the timed-status expiry pass — ruling A). Unyielding Accord is
 * a drag-onto-ally +1 Cog/Spi template AE (data-side — pack rebuild). Determined / Disoriented are native
 * cosmere conditions (toggle the icon; the mechanical rules are GM-applied).
 *  - Collective Resolve → Determined to in-range allies (on use).
 *  - Counterpoint / Overwhelming Authority → on-use card applies Disoriented (owner-judged success; D).
 *  - Voice of Authority → card on an enemy's in-range attack re-rolls it as disadvantage (ruling E).
 *  - Terms of Accord → card forges an accord (stores the owner's White mod); Bound by Word → card lets a
 *    partner adopt that modifier on an objective test (ruling B).
 *  - Disciplined Mind + Unyielding Accord = manual (ruling C; Unyielding ships a draggable +1 Cog/Spi AE).
 * ============================================================================================ */

// Apply a status with an owner-relative (or self) timed expiry; relays to the GM when we lack perms.
async function edhaApplyTimedStatus(target, statusId, { owner = null, expire = "owner" } = {}) {
  try {
    if (target.isOwner) {
      await target.toggleStatusEffect?.(statusId, { active: true });
      if (expire && game.combat?.started) {
        const eff = [...(target.effects ?? [])].find(e => e.statuses?.has?.(statusId));
        const who = (expire === "owner" && owner) ? owner : target;
        const ti = edhaCombatantTurnIndex(game.combat, who);
        if (eff && ti >= 0) await eff.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(game.combat, ti));
      }
      return true;
    }
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to apply ${statusId}.`); return false; }
    game.socket.emit("module.edha-content", { action: "apply-timed-status", payload: { targetUuid: target.uuid, statusId, ownerUuid: owner?.uuid, expire } });
    return true;
  } catch (e) { console.error("Edha Content | apply timed status failed", e); return false; }
}
function edhaWhiteMod(actor) { return Math.floor(edhaEvalSync("@skills.white.rank + @attr.wil", actor.getRollData())) || 0; }

// Counterpoint — a White-test Reaction with no static defense (the contest is against the enemy's influence
// result). We auto-resolve: queue the talent's own White test, then prompt the GM for the DC and, on a
// success, spend 1 Investiture, negate the influence, and Disorient the enemy until the end of the owner's
// next turn. No target, or the GM declines a DC → fall back to the manual Disorient card.
function edhaCounterpointContest(owner, target) {
  if (!target) { edhaPostDisorientCard(owner, "Counterpoint", null); return; }
  edhaQueueContest(owner, "white", async ({ total }) => {
    const dc = await edhaPromptDC("Counterpoint — White vs the enemy's influence", `${owner.name} rolled White <strong>${total}</strong>. Enter the influence test's result (the DC) to resolve.`);
    if (typeof dc !== "number") { edhaPostDisorientCard(owner, "Counterpoint", target); return; }
    if (total >= dc) {
      const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
      try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - 1) }); } catch (e) {}
      await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🗣️ <strong>Counterpoint</strong>: White <strong>${total}</strong> ≥ DC ${dc} — the influence is <strong>negated</strong>; ${target.name} is <strong>Disoriented</strong> until the end of ${owner.name}'s next turn (−1 Investiture).</p>` });
    } else {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🗣️ <strong>Counterpoint</strong>: White <strong>${total}</strong> &lt; DC ${dc} — the influence stands.</p>` });
    }
  });
}

// Counterpoint / Overwhelming Authority — on-use card that Disorients the influenced target (owner-judged).
function edhaPostDisorientCard(owner, name, target) {
  try {
    const attrs = [`data-edha-owner="${owner.uuid}"`, `data-edha-name="${encodeURIComponent(name)}"`];
    if (target) attrs.push(`data-edha-target="${target.uuid}"`);
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🗣️ <strong>${name}</strong> — on a success, Disorient ${target ? target.name : "the target"} until the end of your next turn.</p>`
        + `<button type="button" class="edha-accord-disorient-btn" ${attrs.join(" ")}>Disorient${target ? ` ${target.name}` : " (target one first)"}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | disorient card failed", e); }
}
async function edhaAccordDisorientClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    const name = decodeURIComponent(ds.edhaName || "");
    let target = null;
    if (ds.edhaTarget) { const r = await fromUuid(ds.edhaTarget).catch(() => null); target = r?.actor ?? r; }
    if (!target) target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!target) { ui.notifications?.warn("Edha: target the enemy, then click."); return; }
    await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
    btn.disabled = true; btn.textContent = "Disoriented";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🗣️ <strong>${name}</strong>: ${target.name} is <strong>Disoriented</strong> until the end of ${owner.name}'s next turn.</p>` });
  } catch (e) { console.error("Edha Content | disorient click failed", e); }
}

// Terms of Accord — forge an accord with a chosen in-range character (stores the owner's White mod so
// Bound by Word can offer it). The +1 to objective tests is GM-narrated.
function edhaPostAccordCard(owner) {
  try {
    const allies = edhaAlliesInAttune(owner, "white");
    const mod = edhaWhiteMod(owner), hasBound = edhaOwnsTalent(owner, "Bound by Word");
    const body = allies.length
      ? allies.map(t => `<button type="button" class="edha-accord-forge-btn" data-edha-owner="${owner.uuid}" data-edha-partner="${t.actor.uuid}" data-edha-mod="${mod}" data-edha-bound="${hasBound ? 1 : 0}">${t.actor.name}</button>`).join(" ")
      : `<p style="opacity:.8">No characters in Attunement Range.</p>`;
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🤝 <strong>Terms of Accord</strong> — forge an accord (you both gain +1 to objective tests for the scene${hasBound ? "; they may use your White modifier via Bound by Word" : ""}):</p>${body}</div>`,
    });
  } catch (e) { console.error("Edha Content | accord card failed", e); }
}
async function edhaAccordForgeClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const pref = await fromUuid(ds.edhaPartner).catch(() => null); const partner = pref?.actor ?? pref;
    if (!owner || !partner) return;
    const mod = Number(ds.edhaMod) || 0, bound = ds.edhaBound === "1";
    const accord = { ownerUuid: owner.uuid, ownerName: owner.name, ownerWhiteMod: mod, boundByWord: bound };
    if (partner.isOwner) { try { await partner.setFlag("edha-content", "accord", accord); } catch (e) {} }
    else game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: partner.uuid, key: "accord", value: accord } });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-accord-forge-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${partner.name}`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🤝 <strong>Terms of Accord</strong>: ${owner.name} & ${partner.name} share an objective — both +1 to objective tests (scene)${bound ? `; ${partner.name} may use ${owner.name}'s White modifier (+${mod}) on objective tests` : ""}.</p>` });
  } catch (e) { console.error("Edha Content | accord forge click failed", e); }
}

// Voice of Authority — re-roll an enemy's in-range attack as disadvantage (card; ruling E).
function edhaPostVoiceCard(owner, attacker, origNat, origTotal) {
  try {
    if (!edhaCoordOPRAllowed(owner, "Voice of Authority", "_react")) return;
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>📢 <strong>Voice of Authority</strong> — ${attacker.name} made a hostile action (rolled <strong>${origTotal}</strong>). If it targets an ally, spend 1 Inv → impose disadvantage.</p>`
        + `<button type="button" class="edha-accord-voice-btn" data-edha-owner="${owner.uuid}" data-edha-attacker="${attacker.uuid}" data-edha-nat="${origNat}" data-edha-total="${origTotal}">Use Voice of Authority — spend 1 Investiture</button></div>`,
    });
  } catch (e) { console.error("Edha Content | voice card failed", e); }
}
async function edhaAccordVoiceClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    if (!edhaCoordOPRAllowed(owner, "Voice of Authority", "_react")) { ui.notifications?.info("Voice of Authority already used this round."); btn.disabled = true; return; }
    await edhaCoordOPRMark(owner, "Voice of Authority", "_react");
    const aref = ds.edhaAttacker ? await fromUuid(ds.edhaAttacker).catch(() => null) : null; const attacker = aref?.actor ?? aref;
    const origNat = Number(ds.edhaNat) || 0, origTotal = Number(ds.edhaTotal) || 0;
    const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
    try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - 1) }); } catch (e) {}
    const newRoll = await (new Roll("1d20")).evaluate(); const newNat = Number(newRoll.total) || 0;
    const keptNat = Math.min(origNat, newNat), newTotal = origTotal - origNat + keptNat;
    btn.disabled = true; btn.textContent = "Voice of Authority used";
    const amend = `📢 <strong>Voice of Authority</strong>: disadvantage — d20 ${origNat} vs ${newNat} → keep <strong>${keptNat}</strong>; total <strong>${newTotal}</strong> (was ${origTotal}).`;
    const rewrote = attacker ? await edhaRewriteOrRelay(attacker, origTotal, newTotal, amend) : false;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📢 <strong>Voice of Authority</strong>: ${attacker ? attacker.name + "'s" : "the"} attack rolls disadvantage — kept d20 <strong>${keptNat}</strong> (of ${origNat}/${newNat}); result <strong>${newTotal}</strong> (was ${origTotal})${rewrote ? " — <em>updated on its roll card.</em>" : " — <em>GM applies the lower.</em>"}</p>` });
  } catch (e) { console.error("Edha Content | voice click failed", e); }
}

// Bound by Word — an accord partner may use the accord-maker's White modifier on an objective test (ruling B).
function edhaPostBoundCard(partner, accord, origNat, origTotal, skillId) {
  try {
    const newTotal = origNat + (Number(accord.ownerWhiteMod) || 0);
    ChatMessage.create({
      whisper: edhaWhisperIds(partner),
      speaker: ChatMessage.getSpeaker({ actor: partner }),
      content: `<div class="edha-trigger-card"><p>🤝 <strong>Bound by Word</strong> — if this ${String(skillId).toUpperCase()} test pursues your accord with ${accord.ownerName}, use their White modifier (+${accord.ownerWhiteMod}) in place of your own → <strong>${newTotal}</strong> (was ${origTotal}).</p>`
        + `<button type="button" class="edha-accord-bound-btn" data-edha-partner="${partner.uuid}" data-edha-total="${newTotal}" data-edha-was="${origTotal}">Use ${accord.ownerName}'s White modifier</button></div>`,
    });
  } catch (e) { console.error("Edha Content | bound card failed", e); }
}
async function edhaAccordBoundClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const pref = await fromUuid(ds.edhaPartner).catch(() => null); const partner = pref?.actor ?? pref; if (!partner) return;
    btn.disabled = true; btn.textContent = "Bound by Word applied";
    const newTotal = Number(ds.edhaTotal) || 0, wasTotal = Number(ds.edhaWas) || 0;
    const amend = `🤝 <strong>Bound by Word</strong>: using the accord-maker's White modifier → total <strong>${newTotal}</strong> (was ${wasTotal}).`;
    const rewrote = await edhaRewriteOrRelay(partner, wasTotal, newTotal, amend);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: partner }), content: `<p>🤝 <strong>Bound by Word</strong>: ${partner.name}'s result is <strong>${newTotal}</strong> (was ${wasTotal})${rewrote ? " — <em>updated on the roll card.</em>" : " — <em>GM applies the higher.</em>"}</p>` });
  } catch (e) { console.error("Edha Content | bound click failed", e); }
}

// Accord watchers (GM-gated, whispered): enemy attacks → Voice of Authority; accord-partner tests → Bound by Word.
async function edhaAccordWatchAttack(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller) ?? roller.getActiveTokens?.()[0]; if (!rtok) return;
    const origTotal = Number(roll.total) || 0, origNat = edhaKeptD20Nat(roll) ?? 0;
    for (const owner of edhaCharacterOwnersOf("Voice of Authority")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((otok.document?.disposition ?? 1) === (rtok.document?.disposition ?? 1)) continue;   // roller must be an enemy
      if (!edhaTokensWithin(otok, edhaAttuneFtColor(owner, "white")).some(t => t.id === rtok.id)) continue;
      edhaPostVoiceCard(owner, roller, origNat, origTotal);
    }
  } catch (e) { console.error("Edha Content | accord attack watch failed", e); }
}
async function edhaAccordWatchSkill(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const accord = roller.getFlag?.("edha-content", "accord");
    if (!accord?.boundByWord) return;
    const skillId = roll?.data?.skill?.id ?? "test";
    if (!edhaCoordOPRAllowed(roller, "Bound by Word", skillId)) return;
    await edhaCoordOPRMark(roller, "Bound by Word", skillId);
    edhaPostBoundCard(roller, accord, edhaKeptD20Nat(roll) ?? 0, Number(roll.total) || 0, skillId);
  } catch (e) { console.error("Edha Content | accord skill watch failed", e); }
}
Hooks.on("cosmere-rpg.attackRoll", edhaAccordWatchAttack);
Hooks.on("cosmere-rpg.itemRoll",   edhaAccordWatchAttack);
Hooks.on("cosmere-rpg.skillRoll",  edhaAccordWatchSkill);

// Accord active-ability use hooks (Collective Resolve, Terms of Accord, Counterpoint, Overwhelming Authority).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    if (item.name === "Collective Resolve" && edhaOwnsTalent(actor, "Collective Resolve")) {
      const allies = edhaAlliesInAttune(actor, "white");
      (async () => { for (const t of allies) await edhaToggleStatus(t.actor, "determined", true); })();
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>✨ <strong>Collective Resolve</strong> (${actor.name}): ${allies.length} ally(ies) within range gain <strong>Determined</strong>.</p>` });
    }
    if (item.name === "Terms of Accord" && edhaOwnsTalent(actor, "Terms of Accord")) edhaPostAccordCard(actor);
    if (item.name === "Overwhelming Authority" && edhaOwnsTalent(actor, "Overwhelming Authority")) {
      edhaPostDisorientCard(actor, "Overwhelming Authority", [...(game.user?.targets ?? [])][0]?.actor ?? null);
    }
    if (item.name === "Counterpoint" && edhaOwnsTalent(actor, "Counterpoint")) {
      edhaCounterpointContest(actor, [...(game.user?.targets ?? [])][0]?.actor ?? null);
    }
  } catch (e) { console.error("Edha Content | Accord use-hook failed", e); }
});
function edhaBindAccordButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-accord-disorient-btn").forEach(b => b.addEventListener("click", edhaAccordDisorientClick));
  root?.querySelectorAll?.(".edha-accord-forge-btn").forEach(b => b.addEventListener("click", edhaAccordForgeClick));
  root?.querySelectorAll?.(".edha-accord-voice-btn").forEach(b => b.addEventListener("click", edhaAccordVoiceClick));
  root?.querySelectorAll?.(".edha-accord-bound-btn").forEach(b => b.addEventListener("click", edhaAccordBoundClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindAccordButtons(html));

/* ============================================================================================
 * BLUE / CALCULATION tree engine (2026-06-14d) — cognitive control: impose/grant a test (dis)advantage
 * + Disorient. NAME-BASED, and every talent fires off its own `cosmere-rpg.useItem` (the OWNER's client,
 * where they hold their target), so there is NO GM-gating and NO pack rebuild. Each talent's cost is
 * consumed by its own activation (Foundry), so the cards only APPLY the effect — "success" is owner-judged
 * (the standing ruling: Foundry tests have no DC). Generic reusable primitive:
 *   flags.edha-content.nextTestMod = { mode:"advantage"|"disadvantage", count, skill:<id>|null,
 *   attr:<csv>|null, targetUuid:<uuid>|null, source } — a counted, optional-skill mirror of the Black
 * advTest / cogDisadv flags; consumed one test at a time. targetUuid (2026-07-04, the Power backlog
 * item) binds the mod to tests whose synced target IS that creature ("advantage vs THAT target") —
 * generalizable to any future target-bound rider.
 *   - Subtle Suggestion   → Disorient the influenced target (reuse the Accord disorient card).
 *   - Pattern Recognition → on use, disadvantage on the target's next test.
 *   - Probability Cascade → on use, disadvantage on a creature's next TWO tests.
 *   - False Premise (skill_test) → on use (after the Blue test), disadvantage on the target's next test.
 *   - Anticipate          → on use, ADVANTAGE on the next test of you or an in-network ally.
 *   - Counterspell (skill_test)  → on use, a reminder card (Blue total vs the target's Cognitive defense;
 *     on a success the activated talent fails — GM-adjudicated). Its own roll + cost are native.
 *   - Composed = +tier max-focus ActiveEffect (data-side, already authored). Baleful = manual passive.
 * ============================================================================================ */

// Counted, optional-skill (dis)advantage on a creature's next test(s). Write locally or relay to the GM.
async function edhaSetNextTestMod(target, mod) {
  try {
    if (target.isOwner) { await target.setFlag("edha-content", "nextTestMod", mod); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to affect that creature's next test."); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "nextTestMod", value: mod } });
    return true;
  } catch (e) { console.error("Edha Content | set next-test mod failed", e); return false; }
}
function edhaNextTestMatches(mod, roll, actor = null) {
  if (!mod) return false;
  if (mod.skill && roll?.data?.skill?.id !== mod.skill) return false;
  if (mod.attr) { const a = roll?.data?.skill?.attribute; if (!String(mod.attr).split(/[,\s]+/).filter(Boolean).includes(a)) return false; }   // attribute-gated (Red Key: str/spd)
  if (mod.targetUuid) {                                     // target-bound ("vs THAT creature") — consumes only against it
    const t = actor ? edhaTargetsOfRoller(actor)[0] : null;
    if ((t?.actor?.uuid ?? null) !== mod.targetUuid) return false;
  }
  return true;
}
function edhaNextTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const mod = actor?.getFlag?.("edha-content", "nextTestMod");
    if (!edhaNextTestMatches(mod, roll, actor)) return;
    if (mod.mode) {   // gated (07-16b): a formula-only mod (Probability Net) must not force disadvantage
      const m = mod.mode === "advantage" ? "advantage" : "disadvantage";
      roll.options.advantageMode = m; roll.configureModifiers?.();
      const orig = roll.configureDialog?.bind(roll);
      if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = m; } catch (e) {} return orig(data); };
    }
    // Dice/flat modifier on the next test (Probability Net's −1d6) — same term-concat mechanism as
    // the test riders, flavor-labeled so the breakdown names the source.
    if (mod.formula && !roll.options._edhaNextTestFormula) {
      const resolved = edhaFoldDieMath(Roll.replaceFormulaData(String(mod.formula), actor?.getRollData?.() ?? {}, { missing: "0" })).trim();
      const label = mod.source || "Next-test mod";
      // A leading minus becomes an explicit subtraction — "0 + -1d6" is parser-hostile.
      const expr = resolved.startsWith("-") ? `0 - ${resolved.slice(1)}[${label}]` : `0 + ${resolved}[${label}]`;
      roll.terms = roll.terms.concat(new Roll(expr).terms.slice(1));
      roll.resetFormula();
      roll.options._edhaNextTestFormula = true;
    }
  } catch (e) { console.error("Edha Content | next-test mod pre-roll failed", e); }
}
function edhaNextTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const mod = actor?.getFlag?.("edha-content", "nextTestMod");
    if (!edhaNextTestMatches(mod, roll, actor)) return;
    const left = Math.max(0, (Number(mod.count) || 1) - 1);
    if (left <= 0) void actor.unsetFlag("edha-content", "nextTestMod");
    else void actor.setFlag("edha-content", "nextTestMod", { ...mod, count: left });
    const word = mod.mode ? (mod.mode === "advantage" ? "advantage" : "disadvantage") : (mod.formula || "a modifier");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔮 <strong>${mod.source || "Calculation"}</strong> — ${word} on this test${left > 0 ? ` (${left} more)` : ""}.</p>` });
  } catch (e) { console.error("Edha Content | next-test mod consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaNextTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaNextTestConsume);
}

// Decisive Command (heroic / Leader) — 1 Action, 1 Focus (paid natively): give the ally you target a
// d4 command die on their next test. Wired engine-only (name-based useItem) so no pack rebuild / ⟳ Sync
// is needed; reuses the nextTestMod.formula pipeline — the SAME mechanism as Probability Net's −1d6,
// inverted to a friendly bonus. The d4 is added automatically to the ally's next d20 test and the
// nextTestMod consume-card labels it. (07-17 playtest: the die never appeared because the talent was
// unwired — events:{}.) The "they CHOOSE which roll to add it to" nuance is auto-applied to the next
// test — the beneficial default; the GM can decline it by clearing the flag.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    if (item?.name !== "Decisive Command") return;
    const owner = item?.actor; if (!owner) return;
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
    const range = edhaOwnsTalent(owner, "Authority") ? 40 : 20;   // Authority doubles Leader ranges
    if (!target) { ui.notifications?.warn(`Edha: Decisive Command — target the ally (within ${range} ft) first, then use it again.`); return; }
    const die = edhaCommandDie(owner);                             // d4 stepped up by owned Command upgrades (07-18h)
    void edhaSetNextTestMod(target, { source: "Decisive Command", count: 1, formula: die });
    const extras = [];
    if (edhaOwnsTalent(owner, "Relentless March")) extras.push(`+10 ft movement this round and they ignore Exhausted/Slowed/Surprised (<strong>Relentless March</strong> — honor-system)`);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎖️ <strong>Decisive Command</strong>: <strong>${target.name}</strong> gains a <strong>${die.replace("1d", "d")} command die</strong> on their next test (added automatically)${extras.length ? "<br>• " + extras.join("<br>• ") : ""}</p>` });
  } catch (e) { console.error("Edha Content | Decisive Command failed", e); }
});

/* --- Stances (heroic modality talents — 07-18 bench: "stances aren't wired at all") -------------
 * The free system carries `modality:"stance"` on the talent DataModel but ships NO machinery (its
 * own stance AEs are inert empty-changes markers). Generic rule, keyed on the field rather than
 * names so future stances wire themselves: USING a stance talent ENTERS that stance — one marker
 * ActiveEffect on the actor (talent's name + img, `edha-content.stanceOf` flag) — and any other
 * stance ends first (one stance at a time). Using it again while active LEAVES the stance
 * (toggle). The marker is the visible/queryable state (token icon + sheet + `edhaActiveStance`);
 * each stance's mechanical rider (Vigilant's Dodge/Reactive-Strike discount, Flamestance's
 * Intimidation advantage, …) is wired separately as its hook is named — §9j backlog. Runs on the
 * using client (useItem is client-local); players own their actors, so the writes are permitted.
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
    // deflect/defense changes apply exactly while it exists and vanish on leave/swap.
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: item.name, img: item.img, disabled: false, transfer: false,
      description: item.system?.description?.chat || item.system?.description?.value || "",
      changes: EDHA_STANCE_CHANGES[item.name] || [],
      flags: { "edha-content": { stanceOf: item.name } },
    }]);
    ui.notifications?.info(`Edha: ${actor.name} enters ${item.name}${others.length ? ` (${others.map(o => o.name).join(", ")} ended)` : ""}.`);
  }
}
// Numeric while-in-stance riders (07-18h). Only the decision-free numeric halves live here; each
// stance's situational half is in the HEROIC header ledger below (trusted/cue).
const EDHA_STANCE_CHANGES = {
  "Stonestance": [{ key: "system.deflect.bonus", mode: 2, value: "1" }],
  "Vinestance":  [{ key: "system.defenses.phy.bonus", mode: 2, value: "1" }, { key: "system.defenses.cog.bonus", mode: 2, value: "1" }],
  "Bloodstance": [{ key: "system.defenses.phy.bonus", mode: 2, value: "-2" }, { key: "system.defenses.cog.bonus", mode: 2, value: "-2" }, { key: "system.defenses.spi.bonus", mode: 2, value: "-2" }],
};
// While-in-stance skill advantage (Flamestance → Intimidation, Ironstance → Insight, Windstance →
// Agility): injected on the pre-roll pipeline like Weakened's disadvantage.
const EDHA_STANCE_SKILL_ADV = { "Flamestance": "itm", "Ironstance": "ins", "Windstance": "agi" };
function edhaStanceAdvPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const stance = edhaActiveStance(actor); if (!stance) return;
    const skill = EDHA_STANCE_SKILL_ADV[stance]; if (!skill) return;
    if (roll?.data?.skill?.id !== skill) return;
    roll.options.advantageMode = 1;
    try { roll.configureModifiers?.(); } catch (e) {}
  } catch (e) { /* non-fatal */ }
}
for (const cap of ["Skill", "Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaStanceAdvPreRoll);
// Practiced Kata: start each combat in Vigilant Stance unless Surprised (owner-side, per owner).
Hooks.on("combatStart", (combat) => {
  try {
    for (const c of combat?.combatants ?? []) {
      const a = c?.actor;
      if (!a || !a.isOwner || a.type !== "character") continue;
      if (!edhaOwnsTalent(a, "Practiced Kata") || a.statuses?.has?.("surprised")) continue;
      const vs = a.items.find(i => edhaIsTalent(i) && i.name === "Vigilant Stance");
      if (vs && edhaActiveStance(a) !== "Vigilant Stance") void edhaToggleStance(vs);
    }
  } catch (e) { console.error("Edha Content | Practiced Kata combat-start failed", e); }
});
Hooks.on("cosmere-rpg.useItem", (item) => {
  try { if (edhaIsTalent(item) && item.system?.modality === "stance" && item.actor) void edhaToggleStance(item); }
  catch (e) { console.error("Edha Content | stance toggle failed", e); }
});

/* ============================== HEROIC PATHS — full wiring pass (07-18h) =========================
 * All 133 unique heroic talents accounted for (iron rule 3). WIRED here (name-based, engine-only)
 * or in authored events/effects; everything else is enumerated per path below as TRUSTED (action-
 * economy/Opportunity classes the table runs on honor — §9i's rework owns them) or MANUAL (no
 * nameable Foundry hook — each with its reason).
 *
 * ⚠ RE-CLASSIFICATION IN FLIGHT (Ben, 07-18, mid-pass): **Cosmere Advanced Encounters is
 * installed** (per-combatant action/reaction tracker — NOT yet referenced anywhere in this repo)
 * and the 07-05 **Opportunity-spend menu** exists. Therefore: every "TRUSTED (§9i)" label below
 * that concerns granted/spent actions, reactions, reaction-loss, or action-cost discounts
 * RE-CLASSES to **CAE-WIREABLE** (gated on capturing the module's api/flag surface — the items
 * dump gains a CAE section); every "Opportunity adder/spender" RE-CLASSES to an
 * `edha-opportunity-option` rule (our own primitive, wire-now). After that re-wire, MANUAL
 * genuinely shrinks to: motivation-knowledge (Sleuth's Instincts — the intent precedent),
 * disguise/identity beats, GM strength-reads ("weaker targets"), the crafting/fabrial cluster
 * (no subsystem in the free system), the animal-companion cluster (no companion actor yet), and
 * Shardplate/Shardblade gear. Read the labels below through that lens until the re-wire lands.
 *
 * AGENT — wired: Cheap Shot (on-hit Stunned, authored), Subtle Takedown (on-hit cue, authored),
 *   Risky Behavior (use → raise stakes on next test). TRUSTED: Opportunist/Double Down/Sure
 *   Outcome/Watchful Eye (the plot-die reroll cluster — the plot die is rolled and rerolled in the
 *   player's hands; edha.raiseStakes exists for stakes), Fast Talker/Quick Analysis/Trickster's
 *   Hand (2-actions-for-X grants — §9i action economy), High Society/Underworld Contacts +
 *   Plausible Excuse (Opportunity adders — Opportunity is NEVER auto-deducted, card-layer rule 2).
 *   MANUAL: Cover Story/Mercurial Façade (narrative identity; the Surprised-on-discovery is a
 *   table beat), Sleuth's Instincts + Get 'Em Talking's motivation payoff (NO NAMEABLE HOOK: a
 *   character's motivation is not data — the Fate intent-reveal precedent), Close the Case (rolls;
 *   "backs down" is narrative — contest gate posts the result), Shadow Step (rolls vs each enemy —
 *   gate below posts per-enemy results; "hidden" placement stays the GM's), Baleful (NPC focus
 *   spending isn't module-visible — cue on the card text).
 * ENVOY — wired: Rousing Presence cluster (Determined + owned-rider options card: Instill
 *   Confidence/Devoted Presence/Stalwart Presence/Rallying Shout/Lessons in Patience), Steadfast
 *   Challenge (contest vs Spi → Disoriented + counted disadvantage-vs-owner; Calm Appeal rides the
 *   success card), Galvanize (recovery-die focus restore), Collected/Composed/Customary Garb (AEs,
 *   data). TRUSTED: Foresight (+1 reaction — §9i), Practiced Oratory (multi-target by focus spent),
 *   Practical Demonstration/Sage Counsel/Sound Advice (free-action RP grants — the card is posted
 *   on RP use regardless of trigger route), Applied Motivation (rides only engine focus-restores —
 *   folded into edhaGainFocus below), Inspired Zeal (an ally SPENDING Determined isn't hookable —
 *   cue in header), Well Dressed (attire + first-test tracking — table read). MANUAL: Peaceful
 *   Solution (ending combat is the GM's), Withering Retort (pre-attack reaction timing — cue note
 *   on card).
 * HUNTER — wired: the QUARRY core (Seek Quarry sets it; advantage on attacks vs your quarry;
 *   Tagging Shot marks on hit; Cold Eyes pays 1 focus + re-prompt on quarry defeat; Pack Hunting
 *   adds Survival ranks to a packmate's next test vs the quarry), Startling Blow (on-hit
 *   Surprised, authored), Hardy/Surefooted (AEs, data). TRUSTED: Exploit Weakness/Unrelenting
 *   Salvo/Backstep/Sidestep/Swift Strikes (action-economy cadences — §9i), Steady Aim (range +
 *   flat damage read off the card at roll time). MANUAL: the animal-companion cluster (Animal
 *   Bond/Feral Connection/Hunter's Edge/Protective Bond — NO COMPANION ACTOR exists in the free
 *   system; §9j names the companion-actor build), Deadly Trap/Experienced Trapper (trap placement
 *   is GM-side terrain — the talent rolls; hazard Regions are the named future hook), Killing
 *   Edge (item expert-trait edits — gear pass), Shadowing (cue on card; senses are table reads),
 *   Sharp Eye (WIRED below — contest → data reveal card).
 * LEADER — wired: the COMMAND-DIE cluster (die size scales with owned upgrades; Confident/
 *   Demonstrative/Shrewd self-add cards; Decisive Command carries Relentless March's +10-move
 *   rider and Authority's doubled range on the card), Valiant Intervention + Tactical Ploy +
 *   Synchronized Assault + Set at Odds + Turning Point + Grand Deception (contest gates below),
 *   Resilient Hero (HP-floor veto), Focused Mind/Hardy/Customary Garb/Well Dressed (AEs/data).
 *   TRUSTED: Combat Coordination (free DC after a Strike — DC's own card does the work), Through
 *   the Fray/Resolute Stand (granted reactions/targets — §9i), Cutthroat Tactics (the ally's
 *   plot-die choice), Rumormonger/Well Supplied (Opportunity adders). MANUAL: Imposing Posture
 *   (NPC influence-resist isn't module-visible — the Pack Tactics class), Authority's ally-count
 *   doubling (whoever the card reaches).
 * SCHOLAR — wired: Field Medicine (DC 15 engine roll → recovery-die + Medicine heal; Resuscitation
 *   button on the card), Sharp Eye-class reveal (Scholar's is Sharp Eye on Hunter — Scholar gets
 *   Turning Point's gate), Anatomical Insight (on-hit cue, authored), Know Your Moment (round-
 *   window defense buff, authored 07-17b), Swift Healer/Applied Medicine (heal riders, authored),
 *   Clear Mind (AE), Contingency (plot-die edit — card reminder on ally Complication is future
 *   work; cue class), Overwhelm with Details (self next-test formula card). TRUSTED: Strategize
 *   (advantage hand-off), Overcharge (fabrial stakes — see MANUAL), Deep Contemplation (Erudition
 *   reassign is a sheet edit). MANUAL: the ERUDITION expertise cluster (Erudition/Deep Study/
 *   Emotional Intelligence/Mind and Body — expertise grants are sheet edits; the creator's culture
 *   work owns expertise UX) and the CRAFTING/FABRIAL cluster (Efficient Engineer/Experimental
 *   Tinkering/Fine Handiwork/Inventive Design/Prized Acquisition/Overcharge — NO NAMEABLE HOOK:
 *   the free system ships no crafting/fabrial subsystem), Ongoing Care (rest-time, rolls fine),
 *   Keen Insight (Gain Advantage isn't a hookable item — cue class).
 * WARRIOR — wired: the STANCE machine + numeric stance riders (above), stance skill-advantage
 *   (Flame/Iron/Wind), Practiced Kata combat-start, Feinting Strike (on-hit focus drain, Wary-
 *   aware), Shattering Blow (on-hit push, authored), Meteoric Leap (on-hit cue, authored),
 *   Devastating Blow/Wit's End (tier formulas, data), Wary (Surprised veto below + drain
 *   reduction), Hardy/Surefooted (AEs). TRUSTED: Vigilant Stance's Dodge/Reactive-Strike discount
 *   + Stonestance's extra-action tax + Flame/Wind extra-action halves (system action costs aren't
 *   modifiable — §9i), Defensive Position/Formation Drills (Brace modifiers — §9i), Cautious
 *   Advance (movement + granted actions). MANUAL: Precise Parry (hit→graze is the GM's
 *   adjudication — the Combat Training NO-HOOK class), Shard Training (Shardplate/Shardblade
 *   gear is paid content), Vinestance's reaction test (cue on card; numeric half is wired).
 * CONTEST-EXEMPT: none — every opposed line above is vs a DEFENSE (gated below) or a fixed DC.
 */
// -- Quarry core -------------------------------------------------------------------------------
async function edhaSetQuarry(owner, target) {
  if (!owner || !target) return;
  try { await owner.setFlag("edha-content", "quarryUuid", target.uuid); } catch (e) { return; }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎯 <strong>Quarry</strong>: ${owner.name} marks <strong>${target.name}</strong> — advantage on tests to find, attack, and study them.</p>` });
}
function edhaQuarryOf(owner) { return owner?.getFlag?.("edha-content", "quarryUuid") ?? null; }
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.name === "Seek Quarry") {
      const t = [...(game.user?.targets ?? [])][0]?.actor ?? null;
      if (!t) { ui.notifications?.warn("Edha: Seek Quarry — target the creature first, then use it again."); return; }
      void edhaSetQuarry(actor, t);
    }
    if (item.name === "Pack Hunting") {
      const ally = [...(game.user?.targets ?? [])][0]?.actor ?? null;
      if (!ally) { ui.notifications?.warn("Edha: Pack Hunting — target the ALLY first, then use it again."); return; }
      const ranks = Number(actor.system?.skills?.sur?.rank) || 0;
      void edhaSetNextTestMod(ally, { source: "Pack Hunting", count: 1, formula: String(ranks) });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐺 <strong>Pack Hunting</strong>: ${ally.name}'s next roll against ${actor.name}'s quarry gains <strong>+${ranks}</strong> (applied automatically; use it on the attack or damage roll).</p>` });
    }
  } catch (e) { console.error("Edha Content | quarry use failed", e); }
});
// Advantage on ATTACKS against your quarry ("find and study" rolls stay the table's call — flag it).
function edhaQuarryAdvPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const q = edhaQuarryOf(actor); if (!q) return;
    const t = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!t || t.uuid !== q) return;
    roll.options.advantageMode = 1;
    try { roll.configureModifiers?.(); } catch (e) {}
  } catch (e) { /* non-fatal */ }
}
for (const cap of ["Attack"]) Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaQuarryAdvPreRoll);
// Cold Eyes: your quarry hit 0 HP → recover 1 focus + re-prompt (rides the defeat updateActor class).
Hooks.on("updateActor", (actor, changes) => {
  try {
    const hea = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hea === undefined || hea > 0) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return; // ONE applier
    for (const pc of game.actors?.filter?.(a => a.type === "character") ?? []) {
      if (edhaQuarryOf(pc) !== actor.uuid || !edhaOwnsTalent(pc, "Cold Eyes")) continue;
      void pc.unsetFlag("edha-content", "quarryUuid");
      void edhaGainFocus(pc, 1, "Cold Eyes");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: pc }), content: `<p>🎯 <strong>Cold Eyes</strong>: ${pc.name}'s quarry is down — choose a new quarry (use Seek Quarry).</p>` });
    }
  } catch (e) { console.error("Edha Content | Cold Eyes failed", e); }
});
// -- Heroic on-hit (engine side): Tagging Shot quarry-mark; Feinting Strike focus drain ----------
async function edhaHeroicOnHit(owner, target, dealer) {
  try {
    const item = dealer?.item;
    if (item?.name === "Tagging Shot" && edhaOwnsTalent(owner, "Tagging Shot")) await edhaSetQuarry(owner, target);
    if (item?.name === "Feinting Strike" && edhaOwnsTalent(owner, "Feinting Strike")) {
      const ranks = Number(owner.system?.skills?.itm?.rank) || 0;
      if (ranks > 0) await edhaDrainFocus(target, ranks, "Feinting Strike");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🗡️ <strong>Feinting Strike</strong>: on this HIT ${target.name} loses <strong>${ranks}</strong> focus and their Reaction (reaction loss is honor-system). <em>On a graze, halve the focus loss by hand — grazes aren't engine-visible.</em></p>` });
    }
  } catch (e) { console.error("Edha Content | heroic on-hit failed", e); }
}
// Focus DRAIN with Wary's reduction (involuntary loss − Discipline ranks, floor 0 loss reduction).
async function edhaDrainFocus(actor, n, source) {
  const foc = actor?.system?.resources?.foc; if (!foc) return;
  let loss = Math.max(0, Number(n) || 0);
  if (edhaOwnsTalent(actor, "Wary")) {
    const red = Number(actor.system?.skills?.dis?.rank) || 0;
    if (red > 0) { loss = Math.max(0, loss - red); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🛡️ <strong>Wary</strong>: involuntary focus loss reduced by ${red}.</p>` }); }
  }
  if (!loss) return;
  const cur = Number(foc.value) || 0, next = Math.max(0, cur - loss);
  if (next === cur) return;
  // Runs on the damage-applying client (the GM applies hits), so a direct write has permission —
  // the same pattern as Whispered Doubt's extra-loss write. Tagged so the focus watcher skips it,
  // then the zero-check runs by hand (the 07-05 Predatory Insight lesson).
  try { await actor.update({ "system.resources.foc.value": next }, { edhaFocusWatch: true }); } catch (e) { return; }
  if (next <= 0 && cur > 0) await edhaPredInsightZeroGain(actor);
}
// Wary: cannot be Surprised while holding focus — veto the status AE at creation.
Hooks.on("preCreateActiveEffect", (eff) => {
  try {
    const a = eff?.parent;
    if (!a?.system?.resources || !eff?.statuses?.has?.("surprised") && !(Array.isArray(eff?._source?.statuses) && eff._source.statuses.includes("surprised"))) return;
    if (!edhaOwnsTalent(a, "Wary")) return;
    if ((Number(a.system.resources.foc?.value) || 0) > 0) {
      ui.notifications?.info(`Edha: Wary — ${a.name} can't be Surprised while they have focus.`);
      return false;
    }
  } catch (e) { /* non-fatal */ }
});
// -- Rousing Presence cluster (Envoy) ------------------------------------------------------------
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Rousing Presence") return;
    if (!edhaOwnsTalent(actor, "Rousing Presence")) return;
    const t = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!t) { ui.notifications?.warn("Edha: Rousing Presence — target the ally first, then use it again."); return; }
    (async () => {
      const focusedInstead = edhaOwnsTalent(actor, "Instill Confidence");
      await edhaToggleStatus(t, "determined", true);
      const extras = [];
      if (edhaOwnsTalent(actor, "Lessons in Patience")) { await edhaGainFocus(t, 1, "Lessons in Patience"); extras.push("+1 focus (Lessons in Patience)"); }
      if (focusedInstead) extras.push("owner may swap Determined → <strong>Focused</strong> (Instill Confidence — toggle by hand)");
      if (edhaOwnsTalent(actor, "Devoted Presence")) extras.push("spend 1 focus to clear Prone/Slowed/Stunned/Surprised (Devoted Presence — toggle off by hand, deduct the focus)");
      if (edhaOwnsTalent(actor, "Stalwart Presence")) extras.push("spend 1 focus for +2 to one defense until scene end (Stalwart Presence — GM applies)");
      if (edhaOwnsTalent(actor, "Rallying Shout") && (Number(t.system?.resources?.hea?.value) || 0) <= 0) extras.push(`<strong>Rallying Shout</strong>: revive — heal recovery die + ${Number(actor.system?.skills?.ldr?.rank) || 0} (Leadership)`);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>📣 <strong>Rousing Presence</strong>: <strong>${t.name}</strong> is <strong>Determined</strong> until the end of the scene${extras.length ? "<br>• " + extras.join("<br>• ") : ""}</p>` });
    })();
  } catch (e) { console.error("Edha Content | Rousing Presence failed", e); }
});
// Galvanize: the targeted ally rolls their recovery die and recovers that much focus.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Galvanize") return;
    const t = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!t) { ui.notifications?.warn("Edha: Galvanize — target the ally first, then use it again."); return; }
    (async () => {
      const die = t.system?.recovery?.die?.value || t.system?.recovery?.die || "1d8"; // ⚑ recovery-die path unverified
      const r = new Roll(String(die).match(/^d/) ? `1${die}` : String(die));
      await r.evaluate();
      await edhaGainFocus(t, Number(r.total) || 0, "Galvanize");
    })();
  } catch (e) { console.error("Edha Content | Galvanize failed", e); }
});
// -- Contest gates: vs-defense tests whose effects must ride the RESULT (kill soft laziness) -----
// Each entry: the talent's own roll (skill) is captured; success = total ≥ the target's defense.
const EDHA_HEROIC_DEFTESTS = {
  "Steadfast Challenge": { skill: "dis", def: "spi", apply: async (owner, target) => {
    await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
    edhaPostCalcTestCard(owner, "Steadfast Challenge", { mode: "disadvantage", count: 1, candidates: [target], prompt: `${target.name} takes a disadvantage on tests against ${owner.name}.`, icon: "🗣️" });
    if (edhaOwnsTalent(owner, "Calm Appeal")) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🕊️ <strong>Calm Appeal</strong>: spend 1 focus to pacify ${target.name}; resisting costs them +${Number(owner.system?.skills?.dis?.rank) || 0} focus (GM tracks).</p>` });
  } },
  "Valiant Intervention": { skill: "ath", def: "spi", apply: async (owner, target) => {
    edhaPostCalcTestCard(owner, "Valiant Intervention", { mode: "disadvantage", count: 1, candidates: [target], prompt: `${target.name} takes a disadvantage on tests against ${owner.name}'s allies${edhaOwnsTalent(owner, "Resolute Stand") ? " — Resolute Stand: no Reactive Strikes; spend focus to add targets (GM applies)" : ""}.`, icon: "🛡️" });
  } },
  "Tactical Ploy": { skill: "dec", def: "cog", apply: async (owner, target) => {
    await edhaSetNextTestMod(target, { source: "Tactical Ploy", count: 1, formula: "-1d4" });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎭 <strong>Tactical Ploy</strong>: ${target.name} loses one Reaction (honor-system) and takes <strong>−1d4</strong> on their next cognitive/spiritual test (auto-applied to their next test — GM waives it if the next test is physical).</p>` });
  } },
  "Synchronized Assault": { skill: "ldr", def: "cog", apply: async (owner, target) => {
    const n = Number(owner.system?.skills?.ldr?.rank) || 1;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>⚔️ <strong>Synchronized Assault</strong> succeeds: up to <strong>${n}</strong> allies gain an Action for an extra Strike against ${target.name} (granted actions are §9i honor-system — strike away).</p>` });
  }, applyFail: async (owner, target) => {
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>⚔️ <strong>Synchronized Assault</strong> fails: only ONE ally gains the extra Strike against ${target.name}.</p>` });
  } },
  "Set at Odds": { skill: "ldr", def: "spi", apply: async (owner, target) => {
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🐍 <strong>Set at Odds</strong> succeeds vs ${target.name}'s group: the targets turn <strong>hostile to each other</strong> (GM runs the fallout).</p>` });
  } },
  "Turning Point": { skill: "ded", def: "cog", apply: async (owner, target) => {
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>♟️ <strong>Turning Point</strong> succeeds vs ${target.name}: you and your allies gain an Action on your next turns (§9i honor-system).</p>` });
  } },
  "Sharp Eye": { skill: "per", def: "cog", apply: async (owner, target) => {
    const s = target.system, low = (o) => Object.entries(o || {}).sort((a, b) => (Number(a[1]?.value) || 0) - (Number(b[1]?.value) || 0))[0]?.[0] ?? "?";
    const half = (r) => (Number(r?.value) || 0) <= ((edhaResVal(r) ?? 0) / 2);
    ChatMessage.create({ whisper: [game.user.id], speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>Sharp Eye</strong> on ${target.name} — pick ONE to learn: lowest attribute <strong>${low(s?.attributes)}</strong> · lowest defense <strong>${low(s?.defenses)}</strong> · below half — health: <strong>${half(s?.resources?.hea) ? "yes" : "no"}</strong>, focus: <strong>${half(s?.resources?.foc) ? "yes" : "no"}</strong>, Investiture: <strong>${half(s?.resources?.inv) ? "yes" : "no"}</strong>. (Whispered to you; share only the one you chose.)</p>` });
  } },
};
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const g = EDHA_HEROIC_DEFTESTS[item.name]; if (!g || !edhaOwnsTalent(actor, item.name)) return;
    const target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!target) { ui.notifications?.warn(`Edha: ${item.name} — target the creature first, then use it (the roll resolves against their defense).`); return; }
    edhaQueueContest(actor, g.skill, async ({ total }) => {
      const dc = edhaReadDefense(target, g.def);
      const ok = total >= dc;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${item.name}</strong>: ${total} vs ${target.name}'s ${g.def.toUpperCase()} ${dc} — <strong>${ok ? "SUCCESS" : "FAIL"}</strong>.</p>` });
      if (ok) await g.apply(actor, target);
      else if (g.applyFail) await g.applyFail(actor, target);
    });
  } catch (e) { console.error("Edha Content | heroic def-test failed", e); }
});
// Grand Deception + Field Medicine: fixed-DC self-rolls (the DC is ON the card, so the engine
// resolves it — the §9c "DCs aren't exposed" blocker is about SYSTEM-rolled tests, not these).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.name === "Grand Deception" && edhaOwnsTalent(actor, "Grand Deception")) {
      edhaQueueContest(actor, "dec", async ({ total }) => {
        const ok = total >= 15;
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎭 <strong>Grand Deception</strong>: ${total} vs DC 15 — <strong>${ok ? "the ruse lands" : "FAIL"}</strong>${ok ? " (reveal the changed detail)" : ""}.</p>` });
      });
    }
    if (item.name === "Field Medicine" && edhaOwnsTalent(actor, "Field Medicine")) {
      const t = [...(game.user?.targets ?? [])][0]?.actor ?? null;
      if (!t) { ui.notifications?.warn("Edha: Field Medicine — target the patient first, then use it."); return; }
      edhaQueueContest(actor, "med", async ({ total }) => {
        const ok = total >= 10 + 5; // DC 15 on the card
        if (!ok) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>⚕️ <strong>Field Medicine</strong>: ${total} vs DC 15 — <strong>FAIL</strong> (the focus is spent).</p>` }); return; }
        const die = t.system?.recovery?.die?.value || t.system?.recovery?.die || "1d8"; // ⚑ recovery-die path unverified
        const med = Number(actor.system?.skills?.med?.rank) || 0;
        const r = new Roll(`${String(die).match(/^d/) ? "1" + die : die} + ${med}`);
        await r.evaluate();
        await edhaCrossHeal(t, Number(r.total) || 0);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>⚕️ <strong>Field Medicine</strong>: ${total} vs DC 15 — <strong>SUCCESS</strong>: ${t.name} heals <strong>${r.total}</strong> (recovery die + ${med} Medicine)${edhaOwnsTalent(actor, "Resuscitation") ? " — <strong>Resuscitation</strong>: spend 3 focus to revive an Unconscious/just-dead patient instead" : ""}.</p>` });
      });
    }
  } catch (e) { console.error("Edha Content | heroic DC roll failed", e); }
});
// -- Command-die cluster (Leader) ----------------------------------------------------------------
// Die size scales with owned upgrades (Confident/Demonstrative/Shrewd Command each step it: d4→d6→d8→d10).
function edhaCommandDie(actor) {
  const ups = ["Confident Command", "Demonstrative Command", "Shrewd Command"].filter(n => edhaOwnsTalent(actor, n)).length;
  return `1d${4 + 2 * ups}`;
}
// The self-add halves: use one of the upgrade talents → your own next test gains the command die.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!["Confident Command", "Demonstrative Command", "Shrewd Command"].includes(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    const die = edhaCommandDie(actor);
    void edhaSetNextTestMod(actor, { source: item.name, count: 1, formula: die });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎖️ <strong>${item.name}</strong>: your next roll gains <strong>${die}</strong> (the card's skill list is honor-system — GM waives it on a non-matching test).</p>` });
  } catch (e) { console.error("Edha Content | command-die self-add failed", e); }
});
// Risky Behavior (Agent): raise the stakes on your next test (1 focus, paid natively).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Risky Behavior") return;
    if (!edhaOwnsTalent(actor, "Risky Behavior")) return;
    void edhaRaiseStakesApi(actor, null, "Risky Behavior");   // posts its own card
  } catch (e) { console.error("Edha Content | Risky Behavior failed", e); }
});
// Resilient Hero (Leader): the first time health would hit 0, it becomes your Athletics modifier
// instead — a pre-update veto with a once-per-long-rest flag (GM clears with the rest).
Hooks.on("preUpdateActor", (actor, changes) => {
  try {
    if (actor?.type !== "character" || !edhaOwnsTalent(actor, "Resilient Hero")) return;
    const hea = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hea === undefined || hea > 0) return;
    if (actor.getFlag("edha-content", "resilientSpent")) return;
    const mod = Math.max(1, Number(actor.system?.skills?.ath?.mod) || (Number(actor.system?.skills?.ath?.rank) || 0) + (Number(actor.system?.attributes?.str?.value) || 0) || 1);
    foundry.utils.setProperty(changes, "system.resources.hea.value", mod);
    void actor.setFlag("edha-content", "resilientSpent", true);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💪 <strong>Resilient Hero</strong>: instead of dropping, ${actor.name} holds at <strong>${mod}</strong> health (spent until a long rest — GM: clear with <code>actor.unsetFlag("edha-content","resilientSpent")</code>).</p>` });
  } catch (e) { console.error("Edha Content | Resilient Hero failed", e); }
});
// Overwhelm with Details (Scholar): your Lore modifier rides your next cognitive/spiritual test.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Overwhelm with Details") return;
    if (!edhaOwnsTalent(actor, "Overwhelm with Details")) return;
    const mod = Number(actor.system?.skills?.lor?.mod) || (Number(actor.system?.skills?.lor?.rank) || 0);
    void edhaSetNextTestMod(actor, { source: "Overwhelm with Details", count: 1, formula: String(mod) });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>📚 <strong>Overwhelm with Details</strong>: your next cognitive/spiritual test gains <strong>+${mod}</strong> (Lore — GM waives on a physical test).</p>` });
  } catch (e) { console.error("Edha Content | Overwhelm with Details failed", e); }
});

// A card that applies a counted (dis)advantage to a chosen creature's next test(s). `candidates` = actors
// to list as buttons; pass null to fall back to a single "target the creature, then click" button.
function edhaPostCalcTestCard(owner, name, { mode = "disadvantage", count = 1, candidates = null, prompt = "", icon = "🔮" } = {}) {
  try {
    const word = mode === "advantage" ? "advantage" : "disadvantage";
    const tail = count > 1 ? ` next ${count} tests` : " next test";
    const btn = (uuid, label) => `<button type="button" class="edha-calc-test-btn" data-edha-owner="${owner.uuid}" data-edha-target="${uuid}" data-edha-mode="${mode}" data-edha-count="${count}" data-edha-name="${encodeURIComponent(name)}">${label}</button>`;
    let body;
    if (candidates && candidates.length) body = candidates.map(a => btn(a.uuid, a.name)).join(" ");
    else if (candidates && !candidates.length) body = `<p style="opacity:.8">No eligible creatures in range.</p>`;
    else body = btn("", "Target the creature, then click");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>${icon} <strong>${name}</strong> — ${prompt || `${word} on the target's${tail}`}:</p>${body}</div>`,
    });
  } catch (e) { console.error("Edha Content | calc test card failed", e); }
}
async function edhaCalcTestClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    let target = null;
    if (ds.edhaTarget) { const r = await fromUuid(ds.edhaTarget).catch(() => null); target = r?.actor ?? r; }
    if (!target) target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!target) { ui.notifications?.warn("Edha: target the creature, then click."); return; }
    const mode = ds.edhaMode === "advantage" ? "advantage" : "disadvantage";
    const count = Math.max(1, Number(ds.edhaCount) || 1);
    const name = decodeURIComponent(ds.edhaName || "Calculation");
    await edhaSetNextTestMod(target, { mode, count, skill: null, source: name });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-calc-test-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${target.name}`;
    const word = mode === "advantage" ? "advantage" : "disadvantage";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🔮 <strong>${name}</strong>: ${target.name}'s next ${count > 1 ? count + " tests have" : "test has"} ${word}.</p>` });
  } catch (e) { console.error("Edha Content | calc test click failed", e); }
}
function edhaBindCalcButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-calc-test-btn").forEach(b => b.addEventListener("click", edhaCalcTestClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindCalcButtons(html));

// Counterspell — its own skill_test rolls Blue + pays the cost; we auto-resolve Blue vs the target's
// Cognitive defense and post the verdict (the activated talent fails on a success). Falls back to a manual
// note only when no target / defense is readable.
function edhaPostCounterspellCard(owner, target) {
  const def = target ? edhaReadDefense(target, "cog") : null;
  if (!target || def == null) {                                       // no auto-contest possible → honest reminder
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🪞 <strong>Counterspell</strong> — target the activating creature and use it again to auto-resolve Blue vs its Cognitive defense${def != null ? ` (<strong>${def}</strong>)` : ""}.</p></div>`,
    });
    return;
  }
  edhaQueueContest(owner, "blue", async ({ total }) => {
    const success = total >= def;
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: success
        ? `<p>🪞 <strong>Counterspell</strong>: Blue <strong>${total}</strong> ≥ ${target.name}'s Cognitive defense (${def}) — <strong>the activated talent fails.</strong></p>`
        : `<p>🪞 <strong>Counterspell</strong>: Blue <strong>${total}</strong> &lt; ${target.name}'s Cognitive defense (${def}) — the talent resolves as normal.</p>`,
    });
  });
}

// Every Calculation talent fires off its own activation (owner's client; the cost is already consumed by
// Foundry). The cards only apply the effect — success is owner-judged (Foundry tests have no DC).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;
    switch (item.name) {
      case "Subtle Suggestion":
        if (edhaOwnsTalent(actor, "Subtle Suggestion")) edhaPostDisorientCard(actor, "Subtle Suggestion", target0());
        break;
      case "Pattern Recognition":
        if (edhaOwnsTalent(actor, "Pattern Recognition")) {
          const t = target0();
          edhaPostCalcTestCard(actor, "Pattern Recognition", { mode: "disadvantage", count: 1, candidates: t ? [t] : null,
            prompt: "if you succeeded on a Cognitive test against this character, impose disadvantage on their next test" });
        }
        break;
      case "Probability Cascade":
        if (edhaOwnsTalent(actor, "Probability Cascade")) {
          const t = target0();
          edhaPostCalcTestCard(actor, "Probability Cascade", { mode: "disadvantage", count: 2, candidates: t ? [t] : null,
            prompt: "give the target disadvantage on its next two tests" });
        }
        break;
      case "False Premise":
        if (edhaOwnsTalent(actor, "False Premise")) {
          const t = target0(), def = t ? edhaReadDefense(t, "cog") : null;
          if (!t || def == null) {                                   // no auto-contest → manual card
            edhaPostCalcTestCard(actor, "False Premise", { mode: "disadvantage", count: 1, candidates: t ? [t] : null,
              prompt: "target the creature and use again to auto-resolve Blue vs its Cognitive defense" });
          } else {
            edhaQueueContest(actor, "blue", async ({ total }) => {
              if (total >= def) {
                await edhaSetNextTestMod(t, { mode: "disadvantage", count: 1, skill: null, source: "False Premise" });
                ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔮 <strong>False Premise</strong>: Blue <strong>${total}</strong> ≥ ${t.name}'s Cognitive defense (${def}) — disadvantage on its next test.</p>` });
              } else {
                ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔮 <strong>False Premise</strong>: Blue <strong>${total}</strong> &lt; ${t.name}'s Cognitive defense (${def}) — no effect.</p>` });
              }
            });
          }
        }
        break;
      case "Anticipate":
        if (edhaOwnsTalent(actor, "Anticipate")) {
          const allies = edhaAlliesInAttune(actor, "blue").map(t => t.actor).filter(a => a && a !== actor);
          edhaPostCalcTestCard(actor, "Anticipate", { mode: "advantage", count: 1, candidates: [actor, ...allies], icon: "🛡️",
            prompt: "grant advantage on the resistance test of you or an ally in your Telepathic Network" });
        }
        break;
      case "Counterspell":
        if (edhaOwnsTalent(actor, "Counterspell")) edhaPostCounterspellCard(actor, target0());
        break;
    }
  } catch (e) { console.error("Edha Content | Calculation use-hook failed", e); }
});

/* ============================================================================================
 * BLUE / ILLUSION tree engine (2026-06-14e) — a mostly NARRATIVE tree (illusions, positioning, cover).
 * NAME-BASED, driven off `cosmere-rpg.useItem` on the owner's client; engine-only (NO pack rebuild). The
 * three "summon" talents spawn REAL friendly tokens via the shared `edhaSummon` engine (specs built in
 * code, since two of them are dynamic). Rulings (Ben, 06-14e): Barricade = HP 2[Die], no defenses, no
 * attack, sustain-multiple; Phantom Double = HP 1 copy of the chosen creature, dies on any hit, max 1,
 * belief ENGINE-ROLLED since 07-14 (Perception vs the CASTER's Cognitive defense, direction-aware
 * visibility, no advantage rider — see the belief-loop block below; The Seeming shares the path);
 * Holographic Illusion = a no-stats
 * token sized to [Size]; Living Image marks illusions mobile (upkeep PROMPTED at turn start with a
 * one-click pay since 07-16c — was manual); Redirect Momentum = a
 * reminder card; Ghostly Walls immobilizes owner-relative (+ Absolute Stillness Weakened rider).
 * The GM summon relay (was backlog — wired 2026-07-04): a player without ACTOR_CREATE no longer
 * gets a warn — edhaSummon bakes the spec owner-side and relays `summon-actor` to the primary GM
 * (SHARED with Death/Risen Servant + Civ/Forge Construct; canonical entry in EDHA_FOUNDRY_HANDOFF.md §9).
 * ============================================================================================ */
function edhaSizeFt(owner) { return EDHA_SIZE_FT[edhaColorRank(owner, "blue")] || EDHA_SIZE_FT[1]; }
function edhaTokenArt(actor) {
  const tok = actor?.getActiveTokens?.()[0];
  return tok?.document?.texture?.src || actor?.prototypeToken?.texture?.src || actor?.img || "icons/svg/mystery-man.svg";
}
// Is this target currently taken in by the caster's active seeming? Reads the caster's phantom
// copy's per-observer belief ledger (phantomBelief.fooled — token-doc uuids written by the sweep).
// Powers the `whenTargetFooled` damage-rider condition (Spearing Beak "+1d6 against a character
// who is taken in by the seeming", 07-16). Pure decision separated + pinned in tests/.
function edhaTargetFooledIn(belief, tokenUuids) {
  const fooled = new Set((belief?.fooled || []).map(r => r?.uuid).filter(Boolean));
  return (tokenUuids || []).some(u => fooled.has(u));
}
// Copy ownership is TOKEN-KEYED when both sides know their token (07-16, Ben: "we need a per-bird
// seeming" — unlinked adversary tokens can share one world actor id, so actor-id keying made two
// Mistherons share the max-1 slot). Actor-id fallback covers tokenless casters and pre-16 copies.
// Pure decision — pinned in tests/.
function edhaPhantomOwnedBy(copyFlags, casterTokUuid, casterId) {
  const ct = copyFlags?.phantomCasterTok ?? null;
  if (ct && casterTokUuid) return ct === casterTokUuid;
  return copyFlags?.summoner === casterId;
}
function edhaPhantomCopiesOf(caster) {
  const tokUuid = edhaCasterToken(caster)?.document?.uuid ?? null;
  return game.actors?.filter(a => a.getFlag?.("edha-content", "phantomDouble")
    && edhaPhantomOwnedBy(a.flags?.["edha-content"] ?? {}, tokUuid, caster.id)) ?? [];
}
function edhaTargetFooled(caster, target) {
  try {
    if (!caster || !target) return false;
    const copy = edhaPhantomCopiesOf(caster)[0];
    if (!copy) return false;
    return edhaTargetFooledIn(copy.getFlag("edha-content", "phantomBelief"),
      (target.getActiveTokens?.() ?? []).map(t => t?.document?.uuid));
  } catch (e) { return false; }
}

// Max-one sustain for Phantom Double — PER CASTER TOKEN (07-16): drop this token's existing
// illusion before making a new one; a second bird's cast no longer clears the first bird's copy.
// TOKEN-FIRST (bench 07-17): deleting only the ACTOR leaves the copy's token ORPHANED on the
// scene — Foundry never cascades actor→token — so a recast stacked its new token exactly on the
// leftover and read as "no new token created". Delete the tokens (the generic last-token summon
// cleanup then deletes the actor, same shape as edhaCivDismantleGM); direct actor-delete only for
// a tokenless copy.
async function edhaClearPhantomDoubles(caster) {
  for (const a of edhaPhantomCopiesOf(caster)) {
    try {
      let hadToken = false;
      for (const sc of (game.scenes ?? [])) {
        const toks = sc.tokens.filter(t => t.actorId === a.id);
        if (toks.length) { hadToken = true; await sc.deleteEmbeddedDocuments("Token", toks.map(t => t.id)); }
      }
      if (!hadToken) await a.delete().catch(() => {});   // deleteActor hook restores original visibility
    } catch (e) { /* copy already gone */ }
  }
}

/* --- The illusion belief loop (Phantom Double / The Seeming rework, Ben 07-14) -------------------
 * Spec: the copy (1 HP, dies on any hit, max 1) appears ADJACENT to the duplicated creature; every
 * enemy that can SEE it tests Perception vs the CASTER's Cognitive defense (engine-rolled — iron
 * rule 3). Failure = only the copy is real to them; success = the copy is empty air. Copy dying or
 * being deleted restores everything. No advantage rider (dropped, Ben 07-14).
 * Visibility is a CLIENT VEIL (Ben 07-14 — one PC per computer, GM on his own machine): each
 * player's client filters its own canvas through the belief flag via a Token#isVisible wrap
 * (see "The client veil" block below) — fooled players don't render the ORIGINAL, seers don't
 * render the COPY, the GM renders everything; no token document is ever hidden. Observers that
 * are GM-run (a PC cast it) need no veil — the GM accounting card carries who's fooled.
 * The sweep runs on the ACTIVE GM's client via createToken (summons can materialize through the GM
 * relay, so the caster's client may never see the token). Late viewers: the GM card's re-test
 * button rolls only the not-yet-tested. */
async function edhaCastPhantomDouble(caster, dup, { source = "Phantom Double" } = {}) {
  await edhaClearPhantomDoubles(caster);
  const dupTok = edhaCasterToken(dup);
  const dc = Number(caster.system?.defenses?.cog?.value ?? caster.system?.defenses?.cog?.override) || 10;
  await edhaSummon(caster, {
    name: `${dup.name} (Illusion)`, img: edhaTokenArt(dup),
    tokenName: dupTok?.name ?? dup.name,   // the TOKEN label must not say "(Illusion)" — it's what fooled players read
    displayName: dupTok?.document?.displayName,   // hover-name behaves exactly like the real token (bench 07-17)
    hpFormula: "1", speed: 0, defensePenalty: 99,
    anchorTok: dupTok ?? undefined,
    disposition: dupTok?.document?.disposition,
    extraFlags: { phantomDouble: true, phantomOf: dupTok?.document?.uuid ?? null, phantomDC: dc, phantomSource: source,
      phantomCasterTok: edhaCasterToken(caster)?.document?.uuid ?? null },   // per-token ownership (07-16)
  });
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: caster }), content: `<p>🌫️ <strong>${source}</strong> (${caster.name}): an illusory copy of ${dup.name} appears beside them — 1 HP, any hit breaks it. Belief tests roll on the GM's side.</p>` });
}
async function edhaPhantomBeliefSweep(copyDoc, { initial = false } = {}) {
  try {
    const copyActor = copyDoc?.actor; if (!copyActor) return;
    const dc = Number(copyActor.getFlag("edha-content", "phantomDC")) || 10;
    const source = copyActor.getFlag("edha-content", "phantomSource") || "Phantom Double";
    const belief = foundry.utils.deepClone(copyActor.getFlag("edha-content", "phantomBelief") || { fooled: [], saw: [] });
    const tested = new Set([...belief.fooled, ...belief.saw].map(r => r.uuid));
    const copyTok = copyDoc.object ?? canvas?.tokens?.get?.(copyDoc.id); if (!copyTok) return;
    const disp = copyDoc.disposition ?? 1;
    const fresh = (canvas?.tokens?.placeables ?? []).filter(t =>
      t.id !== copyDoc.id && t.actor && (t.document?.disposition ?? 1) !== disp
      && !tested.has(t.document.uuid) && edhaCanSee(t, copyTok));
    const gmIds = (game.users?.filter(u => u.active && u.isGM) ?? []).map(u => u.id);
    if (!fresh.length && initial) {
      ChatMessage.create({ whisper: gmIds, content: `<div class="edha-trigger-card"><p>🌫️ <strong>${source}</strong> — no enemy can see the copy yet (DC ${dc}). Re-test when one does:</p><button type="button" class="edha-illusion-retest" data-edha-copy="${copyActor.uuid}">Re-test viewers</button></div>` });
      return;
    }
    for (const t of fresh) {
      const mod = Number(t.actor.system?.skills?.prc?.mod ?? t.actor.system?.skills?.prc?.rank) || 0;
      const roll = await (new Roll(`1d20 + ${mod}`)).evaluate();
      const fooled = roll.total < dc;
      (fooled ? belief.fooled : belief.saw).push({ uuid: t.document.uuid, name: t.name, total: roll.total, player: !!t.actor.hasPlayerOwner });
      if (t.actor.hasPlayerOwner) {   // each player learns only their own character's truth
        const ids = (game.users?.filter(u => u.active && !u.isGM && t.actor.testUserPermission?.(u, "OWNER")) ?? []).map(u => u.id);
        if (ids.length) ChatMessage.create({ whisper: ids, content: fooled
          ? `<p>🌫️ <strong>${t.name}</strong> (Perception ${roll.total}) is taken in — <strong>${copyDoc.name}</strong> looks completely real.</p>`
          : `<p>👁️ <strong>${t.name}</strong> (Perception ${roll.total}) sees through it — <strong>${copyDoc.name}</strong> is empty air.</p>` });
      }
    }
    // Visibility is CLIENT-VEILED (Ben 07-14: one PC per computer, GM on his own machine): the
    // belief flag written here is read by edhaPhantomClientHidden on every player's client —
    // fooled players' clients don't render the ORIGINAL, seers' clients don't render the COPY,
    // the GM renders everything. No token document is ever actually hidden.
    await copyActor.setFlag("edha-content", "phantomBelief", belief);
    const row = r => `<li>${r.name}: Perception ${r.total} vs ${dc}</li>`;
    ChatMessage.create({ whisper: gmIds, content: `<div class="edha-trigger-card"><p>🌫️ <strong>${source}</strong> — belief vs DC ${dc}:</p>`
      + (belief.fooled.length ? `<p><strong>Fooled</strong> (their client shows only the copy):</p><ul>${belief.fooled.map(row).join("")}</ul>` : "")
      + (belief.saw.length ? `<p><strong>See through it</strong> (their client shows only the original):</p><ul>${belief.saw.map(row).join("")}</ul>` : "")
      + `<button type="button" class="edha-illusion-retest" data-edha-copy="${copyActor.uuid}">Re-test new viewers</button></div>` });
    ChatMessage.create({ content: `<p>🌫️ <strong>${source}</strong>: ${belief.fooled.length + belief.saw.length} onlooker(s) tested — ${belief.fooled.length} taken in, ${belief.saw.length} see through it.</p>` });
  } catch (e) { console.error("Edha Content | phantom belief sweep failed", e); }
}
async function edhaIllusionRetestClick(ev) {
  try {
    ev.preventDefault();
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: the belief re-test is GM-side."); return; }
    const copyActor = await fromUuid(ev.currentTarget.dataset.edhaCopy).catch(() => null);
    const doc = copyActor?.getActiveTokens?.()[0]?.document; if (!doc) { ui.notifications?.warn("Edha: the illusion's token is gone."); return; }
    await edhaPhantomBeliefSweep(doc);
  } catch (e) { console.error("Edha Content | illusion re-test failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-illusion-retest").forEach(b => b.addEventListener("click", edhaIllusionRetestClick));
});
// The sweep entry point: illusions can materialize on the GM client via the summon relay, so the
// ACTIVE GM's client owns the belief roll (works for GM-cast adversary seemings too).
Hooks.on("createToken", (doc, options, userId) => {
  try {
    if (game.user !== game.users?.activeGM) return;
    if (!doc.actor?.getFlag?.("edha-content", "phantomDouble")) return;
    setTimeout(() => { void edhaPhantomBeliefSweep(doc, { initial: true }); }, 250);   // let the placeable land for LOS
  } catch (e) { /* non-fatal */ }
});
// Break/restore: the copy dying (HP-sync deletes it) or being deleted by hand un-hides the
// original and announces the break. Guard set: deleteToken may cascade into deleteActor.
const _edhaPhantomRestored = new Set();
async function edhaPhantomRestore(copyActor) {
  if (_edhaPhantomRestored.has(copyActor.id)) return;
  _edhaPhantomRestored.add(copyActor.id);
  try {
    // Nothing to un-hide — the veil is client-side and dies with the copy's flags; announce only.
    ChatMessage.create({ content: `<p>🌫️ <strong>${copyActor.getFlag("edha-content", "phantomSource") || "Phantom Double"}</strong>: the illusion breaks — the real one stands plainly seen.</p>` });
    // Seeming-break GM cues (07-16): the summoner's own reactions to its copy breaking (Fade).
    // Resolve the CASTER TOKEN first (per-bird — unlinked tokens share a world actor id); the
    // token's synthetic actor carries the right name and per-token cue gates.
    const casterTokUuid = copyActor.getFlag("edha-content", "phantomCasterTok");
    const casterTokDoc = casterTokUuid ? await fromUuid(casterTokUuid).catch(() => null) : null;
    const summoner = casterTokDoc?.actor ?? game.actors?.get(copyActor.getFlag("edha-content", "summoner")) ?? null;
    if (summoner) for (const { item, h } of edhaCueRules(summoner, "seeming-break")) await edhaPostCueCard(summoner, item, h);
  } catch (e) { console.error("Edha Content | phantom restore failed", e); }
}
Hooks.on("deleteActor", (actor) => {
  try {
    if (actor.getFlag?.("edha-content", "phantomDouble")) canvas?.perception?.update?.({ refreshVision: true });   // every client drops its veil
    if (game.user !== game.users?.activeGM) return;
    if (actor.getFlag?.("edha-content", "phantomDouble")) void edhaPhantomRestore(actor);
  } catch (e) { /* non-fatal */ }
});
Hooks.on("deleteToken", (doc) => {
  try {
    const a = doc.actor;
    if (a?.getFlag?.("edha-content", "phantomDouble")) canvas?.perception?.update?.({ refreshVision: true });
    if (game.user !== game.users?.activeGM) return;
    // Announce/restore only — the ACTOR deletion belongs to the generic last-token summon cleanup
    // (phantom copies are summons); a second delete here raced it into server-side
    // "Actor does not exist" errors (Ben's 07-17 log, 22:29:04), and `void a.delete()` inside
    // try/catch can't even catch its own async rejection.
    if (a?.getFlag?.("edha-content", "phantomDouble")) void edhaPhantomRestore(a);
  } catch (e) { /* non-fatal */ }
});

/* --- The client veil (Ben 07-14: one PC per computer, GM on his own) -----------------------------
 * True per-viewer visibility: each PLAYER client filters its own canvas through the belief flag —
 * a fooled player's client does not render the ORIGINAL token; a seer's client does not render
 * the COPY; the GM client renders everything. Implemented as a wrap of the Token#isVisible getter
 * (walks the proto chain for the descriptor); no token document is ever hidden, so nothing can
 * desync — the veil lives and dies with the copy's flags. */
// PURE (pinned in tests/): should a client owning `ownedUuids` observer-tokens hide `tokUuid`?
function edhaPhantomVeilHides(belief, ownedUuids, tokUuid, origUuid, copyTokUuid) {
  const owned = new Set(ownedUuids || []);
  const mineFooled = (belief?.fooled || []).some(r => owned.has(r.uuid));
  const mineSaw = (belief?.saw || []).some(r => owned.has(r.uuid));
  if (mineFooled && !mineSaw && !!origUuid && tokUuid === origUuid) return true;   // fooled: the original doesn't exist for you
  if (mineSaw && tokUuid === copyTokUuid) return true;                             // saw through: the copy is empty air
  return false;
}
function edhaPhantomClientHidden(tok) {
  try {
    if (!canvas?.ready || game.user?.isGM) return false;
    const tokUuid = tok?.document?.uuid; if (!tokUuid) return false;
    for (const c of canvas.tokens?.placeables ?? []) {
      const belief = c.actor?.getFlag?.("edha-content", "phantomBelief");
      if (!belief) continue;
      const ownedUuids = [...(belief.fooled || []), ...(belief.saw || [])].map(r => r.uuid).filter(u => {
        try { return !!fromUuidSync(u)?.actor?.testUserPermission?.(game.user, "OWNER"); } catch (e) { return false; }
      });
      if (edhaPhantomVeilHides(belief, ownedUuids, tokUuid, c.actor.getFlag("edha-content", "phantomOf"), c.document.uuid)) return true;
    }
    return false;
  } catch (e) { return false; }
}
Hooks.once("init", function edhaPatchPhantomVeil() {
  try {
    const TokenCls = foundry.canvas?.placeables?.Token ?? globalThis.Token;
    let proto = TokenCls?.prototype, desc = null;
    while (proto && !desc) { desc = Object.getOwnPropertyDescriptor(proto, "isVisible"); if (!desc) proto = Object.getPrototypeOf(proto); }
    if (!desc?.get) { console.warn("Edha Content | Token#isVisible getter not found — phantom client veil disabled (belief cards still work)"); return; }
    const orig = desc.get;
    Object.defineProperty(TokenCls.prototype, "isVisible", {
      configurable: true,
      get: function () { if (edhaPhantomClientHidden(this)) return false; if (edhaSenseRevealShows(this)) return true; return orig.call(this); },
    });
  } catch (e) { console.error("Edha Content | phantom veil patch failed", e); }
});
// Belief changed (sweep/re-test wrote the flag) → every client re-evaluates its veil.
Hooks.on("updateActor", (actor, changes) => {
  try {
    if (!actor.getFlag?.("edha-content", "phantomDouble")) return;
    if (foundry.utils.getProperty(changes, "flags.edha-content.phantomBelief") === undefined) return;
    canvas?.perception?.update?.({ refreshVision: true });
  } catch (e) { /* non-fatal */ }
});

// Living Image upkeep (07-16c, Ben E17 — was "track manually"): at the owner's turn start, while
// they have living summoned illusions, whisper the upkeep prompt with a one-click payment (1 Inv
// per COMPLEX illusion — which images count as complex stays the table's call; simple ones free).
Hooks.on("combatTurnChange", (combat) => {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one client posts
    const a = combat?.combatant?.actor; if (!a || !edhaOwnsTalent(a, "Living Image")) return;
    const ills = game.actors?.filter(x => x.getFlag?.("edha-content", "summon") && x.getFlag?.("edha-content", "summoner") === a.id
      && (Number(x.system?.resources?.hea?.value) || 0) > 0) ?? [];
    if (!ills.length) return;
    const ids = (game.users?.filter(u => u.active && (u.isGM || a.testUserPermission?.(u, "OWNER"))) ?? []).map(u => u.id);
    ChatMessage.create({ whisper: ids, speaker: ChatMessage.getSpeaker({ actor: a }),
      content: `<div class="edha-trigger-card"><p>🎭 <strong>Living Image</strong> (${a.name}) — turn start with ${ills.length} illusion(s) up (${ills.map(i => i.name).join(", ")}): <strong>1 Investiture per COMPLEX illusion</strong> to maintain (simple images are free — the table calls which is which). Unpaid complex illusions fade (delete the token).</p><button type="button" class="edha-upkeep-inv-btn" data-actor="${a.uuid}">Pay 1 Investiture</button></div>` });
  } catch (e) { /* non-fatal */ }
});
async function edhaUpkeepInvClick(ev) {
  try {
    ev.preventDefault();
    const ref = await fromUuid(ev.currentTarget.dataset.actor).catch(() => null); const a = ref?.actor ?? ref; if (!a) return;
    const inv = a.system?.resources?.inv, cur = Number(inv?.value) || 0;
    if (cur < 1) { ui.notifications?.warn(`Edha: ${a.name} has no Investiture left to pay upkeep.`); return; }
    await a.update({ "system.resources.inv.value": cur - 1 });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🎭 <strong>Living Image</strong>: ${a.name} pays 1 Investiture of upkeep (${cur - 1} left).</p>` });
  } catch (e) { console.error("Edha Content | living-image upkeep failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-upkeep-inv-btn").forEach(b => b.addEventListener("click", edhaUpkeepInvClick));
});

// Ghostly Walls — its own skill_test rolls Blue; we auto-resolve Blue vs the target's Cognitive defense and,
// on a success, Immobilize it (move 0) until the END of the owner's next turn (owner-relative); with Absolute
// Stillness the target ALSO becomes Weakened (Physical disadvantage). Manual button only when no target/def.
async function edhaGhostlyWallsApply(owner, target, stillness) {
  await edhaApplyTimedStatus(target, "immobilized", { owner, expire: "owner" });
  if (stillness) await edhaApplyTimedStatus(target, "weakened", { owner, expire: "owner" });
}
function edhaPostGhostlyWallsCard(owner, target) {
  const stillness = edhaOwnsTalent(owner, "Absolute Stillness");
  const def = target ? edhaReadDefense(target, "cog") : null;
  if (!target || def == null) {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧱 <strong>Ghostly Walls</strong> — target the creature and use again to auto-resolve Blue vs its Cognitive defense, or immobilize manually${stillness ? " (Absolute Stillness: also Weakened)" : ""}:</p>`
        + `<button type="button" class="edha-illusion-immob-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target ? target.uuid : ""}" data-edha-stillness="${stillness ? 1 : 0}">Immobilize${target ? ` ${target.name}` : " (target one first)"}</button></div>`,
    });
    return;
  }
  edhaQueueContest(owner, "blue", async ({ total }) => {
    if (total >= def) {
      await edhaGhostlyWallsApply(owner, target, stillness);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧱 <strong>Ghostly Walls</strong>: Blue <strong>${total}</strong> ≥ ${target.name}'s Cognitive defense (${def}) — movement <strong>0</strong> until the end of ${owner.name}'s next turn${stillness ? "; also <strong>disadvantage on Physical tests</strong> (Absolute Stillness); GM: it cannot take Reactions" : ""}.</p>` });
    } else {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧱 <strong>Ghostly Walls</strong>: Blue <strong>${total}</strong> &lt; ${target.name}'s Cognitive defense (${def}) — no effect.</p>` });
    }
  });
}
async function edhaIllusionImmobClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    let target = null;
    if (ds.edhaTarget) { const r = await fromUuid(ds.edhaTarget).catch(() => null); target = r?.actor ?? r; }
    if (!target) target = [...(game.user?.targets ?? [])][0]?.actor ?? null;
    if (!target) { ui.notifications?.warn("Edha: target the creature, then click."); return; }
    await edhaApplyTimedStatus(target, "immobilized", { owner, expire: "owner" });
    const stillness = ds.edhaStillness === "1";
    if (stillness) await edhaApplyTimedStatus(target, "weakened", { owner, expire: "owner" });
    btn.disabled = true; btn.textContent = "Immobilized";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧱 <strong>Ghostly Walls</strong>: ${target.name}'s movement is <strong>0</strong> until the end of ${owner.name}'s next turn${stillness ? " — and it has <strong>disadvantage on Physical tests</strong> (Absolute Stillness); GM: it cannot take Reactions" : ""}.</p>` });
  } catch (e) { console.error("Edha Content | ghostly walls click failed", e); }
}
function edhaBindIllusionButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-illusion-immob-btn").forEach(b => b.addEventListener("click", edhaIllusionImmobClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindIllusionButtons(html));

Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;
    switch (item.name) {
      case "Ghostly Walls":
        if (edhaOwnsTalent(actor, "Ghostly Walls")) edhaPostGhostlyWallsCard(actor, target0());
        break;
      case "Redirect Momentum":
        if (edhaOwnsTalent(actor, "Redirect Momentum")) {
          const t = target0(), ft = edhaSizeFt(actor);
          if (!t) {
            ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
              content: `<div class="edha-trigger-card"><p>💨 <strong>Redirect Momentum</strong> — target the mover and use again to auto-resolve Blue vs its Athletics (success → reduce its remaining move by <strong>${ft} ft</strong> or push it <strong>${ft} ft</strong>).</p></div>` });
          } else {
            edhaQueueContest(actor, "blue", async ({ total }) => {                 // opposed: roll the mover's Athletics
              const opp = await edhaRollOpposedSkill(t, "ath");
              const success = total >= opp;
              ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
                content: success
                  ? `<p>💨 <strong>Redirect Momentum</strong>: Blue <strong>${total}</strong> ≥ ${t.name}'s Athletics <strong>${opp}</strong> — reduce its remaining movement by <strong>${ft} ft</strong>, or push it <strong>${ft} ft</strong> (GM positions the token).</p>`
                  : `<p>💨 <strong>Redirect Momentum</strong>: Blue <strong>${total}</strong> &lt; ${t.name}'s Athletics <strong>${opp}</strong> — it keeps its momentum.</p>` });
            });
          }
        }
        break;
      case "Phantom Barricade":
        if (edhaOwnsTalent(actor, "Phantom Barricade")) {
          void edhaSummon(actor, {
            name: "Phantom Barricade", img: "icons/magic/defensive/barrier-shield-dome-blue.webp",
            hpFormula: "2d(2 * @skills.blue.rank + 2)", speed: 0, defensePenalty: 99,
          });
        }
        break;
      case "Phantom Double":
        if (edhaOwnsTalent(actor, "Phantom Double")) {
          void edhaCastPhantomDouble(actor, target0() ?? actor, { source: "Phantom Double" });   // belief loop (Ben 07-14)
        }
        break;
      case "The Seeming":   // the mistheron's ruling-40 adaptation — self-only, same belief loop
        // (07-16: this case was UNREACHABLE until the hook gate above went flag-aware — the
        // bespoke adversary item is action-typed and needed the build's adversaryTalent flag.)
        if (edhaOwnsTalent(actor, "The Seeming")) void edhaCastPhantomDouble(actor, actor, { source: "The Seeming" });
        break;
      case "Holographic Illusion":
        if (edhaOwnsTalent(actor, "Holographic Illusion")) {
          void edhaSummon(actor, {
            name: "Holographic Illusion", img: "icons/magic/perception/silhouette-stealth-shadow.webp",
            hpFormula: "1", speed: 0, defensePenalty: 99, tokenSizeFt: edhaSizeFt(actor),
          });
        }
        break;
      case "Living Image":
        if (edhaOwnsTalent(actor, "Living Image")) {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎭 <strong>Living Image</strong> (${actor.name}): your illusions may now move up to your movement rate and interact with the environment. Complex illusions cost 1 Investiture per round to maintain — the engine prompts you at each of your turn starts while you have illusions up.</p>` });
        }
        break;
    }
  } catch (e) { console.error("Edha Content | Illusion use-hook failed", e); }
});

/* ============================================================================================
 * BLUE / FORESIGHT tree engine (2026-06-14f) — prediction + initiative. Mostly MANUAL (hidden
 * declarations, fast/slow-turn choices, telepathy have no Foundry hooks); the automatable half REUSES
 * the Calculation `nextTestMod` flag + the reminder-card pattern. Engine-only off `useItem`; NO rebuild.
 *   - Intercept → on use, disadvantage on the designated creature's next test (nextTestMod, owner-judged).
 *   - Reactive Analysis → on use, advantage on YOUR next test (nextTestMod on self, owner-judged).
 *   - Read Intent (skill_test) → on use, a reminder card (Blue vs Cognitive defense; GM reveals intent).
 *   - Collected = +2 Cog/Spi defenses AE (data-side, already authored). Forewarned / Telepathic Network /
 *     Probable Outcome = manual. Calculated Patience = manual + the `edha.calculatedPatience()` toggle.
 * ============================================================================================ */
// Read Intent — its own skill_test rolls Blue; we auto-resolve Blue vs the target's Cognitive defense and
// post the verdict (on a success the GM reveals the creature's intended action — that reveal stays narrative).
function edhaPostReadIntentCard(owner, target) {
  const def = target ? edhaReadDefense(target, "cog") : null;
  if (!target || def == null) {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🔮 <strong>Read Intent</strong> — target the creature and use again to auto-resolve Blue vs its Cognitive defense${def != null ? ` (<strong>${def}</strong>)` : ""}.</p></div>`,
    });
    return;
  }
  edhaQueueContest(owner, "blue", async ({ total }) => {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: total >= def
        ? `<p>🔮 <strong>Read Intent</strong>: Blue <strong>${total}</strong> ≥ ${target.name}'s Cognitive defense (${def}) — <strong>success.</strong> GM: reveal the action ${target.name} intends to take next round.</p>`
        : `<p>🔮 <strong>Read Intent</strong>: Blue <strong>${total}</strong> &lt; ${target.name}'s Cognitive defense (${def}) — its intent stays hidden.</p>`,
    });
  });
}
// edha.calculatedPatience(tokenOrActorOrName?) — grant advantage on your next test (use when you take a
// slow turn; there's no fast/slow-turn hook). Reuses the nextTestMod flag.
async function edhaCalculatedPatienceApi(actorArg) {
  const a = edhaResolveActorArg(actorArg);
  if (!a) { ui.notifications?.warn("Edha: select a token or pass an actor/name to calculatedPatience."); return false; }
  const ok = await edhaSetNextTestMod(a, { mode: "advantage", count: 1, skill: null, source: "Calculated Patience" });
  if (ok) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🧘 <strong>Calculated Patience</strong>: ${a.name}'s next test gains advantage (slow turn).</p>` });
  return ok;
}

Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;
    switch (item.name) {
      case "Intercept":
        if (edhaOwnsTalent(actor, "Intercept")) {
          const t = target0();
          edhaPostCalcTestCard(actor, "Intercept", { mode: "disadvantage", count: 1, candidates: t ? [t] : null,
            prompt: "impose disadvantage on the creature you designated with Forewarned (its declared action)" });
        }
        break;
      case "Reactive Analysis":
        if (edhaOwnsTalent(actor, "Reactive Analysis")) {
          void edhaSetNextTestMod(actor, { mode: "advantage", count: 1, skill: null, source: "Reactive Analysis" });
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>📈 <strong>Reactive Analysis</strong> (${actor.name}): advantage on your next test against the creature that just failed.</p>` });
        }
        break;
      case "Read Intent":
        if (edhaOwnsTalent(actor, "Read Intent")) edhaPostReadIntentCard(actor, target0());
        break;
    }
  } catch (e) { console.error("Edha Content | Foresight use-hook failed", e); }
});

/* ============================================================================================
 * RED / MOMENTUM + FRENZY tree engine (2026-06-15)
 * Pilot: this is the FIRST tree to ENFORCE forced/granted movement (auto-move the caster, push +
 * wall-collision on a target) rather than GM-narrating it (the convention used by Ordered Advance,
 * Redirect Momentum, Ghostly Walls, Living Image). See FORCED_MOVEMENT_PILOT.md for the porting plan.
 * Reused, NOT reinvented:
 *  - fast/slow turn: read combatant.getFlag("cosmere-rpg","turnSpeed") (no event, but readable at
 *    pre-roll / on-damage time — all the fast-turn talents gate a test or a deal-damage trigger).
 *  - test/(dis)advantage: the Calculation nextTestMod flag (edhaSetNextTestMod / pre-roll injector).
 *  - focus drain: the Whispered-Doubt focus-write pattern. plot die: the plotDieNext flag.
 *  - damage/affliction/status payloads: the edha-triggered-effect machinery.
 * New here: edha-move / edha-push handlers, the moved-toward + fast-turn + first-test rider gates,
 * and the rally stack (Battle Fever / Feeding Frenzy).
 * ============================================================================================ */

// --- Fast/slow turn (read-only; the cosmere system has no toggle event) --------------------------
function edhaCombatantOf(actor) {
  try {
    const combat = game.combat; if (!combat?.started || !actor) return null;
    const tokenId = actor.isToken ? actor.token?.id : null;
    return combat.combatants.find(c => tokenId ? c.tokenId === tokenId : c.actorId === actor.id) ?? null;
  } catch (e) { return null; }
}
function edhaIsFastTurn(actor) {
  try {
    const c = edhaCombatantOf(actor); if (!c) return false;
    const ts = c.getFlag?.("cosmere-rpg", "turnSpeed");
    if (ts == null) return false;                              // default Slow
    return String(ts).toLowerCase().includes("fast");          // TurnSpeed.Fast enum (string or "fast")
  } catch (e) { return false; }
}

// --- First test this turn (Burning Drive). Client-local: the rider fires on the owner's own roll. --
const _edhaTestedThisTurn = new Set();   // actorIds that have already rolled a test this turn
function edhaStampTested(roll, source, config) { try { const a = edhaD20RollActor(config); if (a) _edhaTestedThisTurn.add(a.id); } catch (e) {} }
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaStampTested);
Hooks.on("combatTurnChange", () => _edhaTestedThisTurn.clear());
Hooks.on("combatStart",      () => _edhaTestedThisTurn.clear());
function edhaIsFirstTestThisTurn(actor) { return !!actor && !_edhaTestedThisTurn.has(actor.id); }

// --- Net distance moved toward a creature this turn (Momentum's Edge) -----------------------------
const _edhaTurnStartPos = new Map();   // tokenId -> {x,y} at the moment that token's turn began
function edhaStampTurnStart(combat) {
  try { const tok = combat?.combatant?.token; if (tok) _edhaTurnStartPos.set(tok.id, { x: tok.x, y: tok.y }); } catch (e) {}
}
Hooks.on("combatTurnChange", (combat) => edhaStampTurnStart(combat));
Hooks.on("combatStart",      (combat) => edhaStampTurnStart(combat));
function edhaPxPerFt() { const s = canvas?.scene; return (s?.grid?.size || 100) / (s?.grid?.distance || 5); }
function edhaMovedTowardFt(actor, target) {
  try {
    const tok = edhaCasterToken(actor), ttok = target ? (edhaCasterToken(target) ?? target.getActiveTokens?.()[0]) : null;
    if (!tok || !ttok) return 0;
    const start = _edhaTurnStartPos.get(tok.id);
    if (!start) return 0;
    const cur = { x: tok.document.x, y: tok.document.y };
    const mv = { x: cur.x - start.x, y: cur.y - start.y };
    const dir = { x: ttok.center.x - tok.center.x, y: ttok.center.y - tok.center.y };
    const dlen = Math.hypot(dir.x, dir.y) || 1;
    const projPx = (mv.x * dir.x + mv.y * dir.y) / dlen;        // displacement projected onto the line to the target
    return Math.max(0, projPx / edhaPxPerFt());
  } catch (e) { return 0; }
}

// --- Once per turn (Unstoppable) -----------------------------------------------------------------
function edhaTurnSeqNow() { const c = game.combat; return c?.started ? edhaTurnSeq(c.round, c.turn) : null; }
function edhaOncePerTurnAllowed(actor, key) { const s = edhaTurnSeqNow(); if (s == null) return true; return actor.getFlag?.("edha-content", "oncePerTurn")?.[key] !== s; }
async function edhaOncePerTurnMark(actor, key) {
  const s = edhaTurnSeqNow(); if (s == null) return;
  const m = foundry.utils.deepClone(actor.getFlag("edha-content", "oncePerTurn") ?? {}); m[key] = s;
  try { await actor.setFlag("edha-content", "oncePerTurn", m); } catch (e) {}
}

// --- Movement primitives (the pilot) -------------------------------------------------------------
// Move from origin toward aim, capped at maxFt, halted at the first MOVEMENT wall. Degrades to the
// full move if the collision backend is unavailable (logged, never throws).
// Is another (visible, living-actor) token occupying the square a move would end on? Engine moves
// must never stack tokens (Ben R2, 07-12 — pass-2's Unnerving pushes left Troopers stacked, and a
// stacked pair later read as a phantom third Flame Surge target). Overlap = bound-box centers closer
// than the tokens' combined half-sizes. Manual GM drags are deliberately NOT policed (R2: engine only).
function edhaTokenAtDest(movingTok, center) {
  try {
    const gs = canvas?.scene?.grid?.size || 100;
    const selfId = movingTok?.id ?? movingTok?.document?.id;
    for (const t of canvas?.tokens?.placeables ?? []) {
      if (!t?.actor || t.id === selfId || t.document?.hidden) continue;
      const minSep = ((t.w || gs) + (movingTok?.w || gs)) / 2 - 2;
      if (Math.abs(t.center.x - center.x) < minSep && Math.abs(t.center.y - center.y) < minSep) return t;
    }
  } catch (e) {}
  return null;
}
function edhaComputeMove(origin, aim, maxFt, movingTok = null) {
  const ppf = edhaPxPerFt();
  const dx = aim.x - origin.x, dy = aim.y - origin.y, len = Math.hypot(dx, dy);
  if (len < 1) return { dest: { ...origin }, movedFt: 0, collided: false };
  const travel = Math.min(len, maxFt * ppf);
  let dest = { x: origin.x + dx / len * travel, y: origin.y + dy / len * travel };
  let collided = false;
  try {
    const hit = CONFIG.Canvas?.polygonBackends?.move?.testCollision?.(origin, dest, { type: "move", mode: "closest" });
    if (hit) { collided = true; dest = { x: hit.x, y: hit.y }; }
  } catch (e) { /* no movement backend → travel the full distance */ }
  // Occupied destination → step back toward the origin one grid square at a time until clear (R2).
  if (movingTok) {
    try {
      const gs = canvas?.scene?.grid?.size || 100;
      let d = Math.hypot(dest.x - origin.x, dest.y - origin.y);
      while (d > 1 && edhaTokenAtDest(movingTok, dest)) {
        collided = true;
        const nd = Math.max(0, d - gs);
        dest = { x: origin.x + dx / len * nd, y: origin.y + dy / len * nd };
        d = nd;
      }
    } catch (e) {}
  }
  return { dest, movedFt: Math.hypot(dest.x - origin.x, dest.y - origin.y) / ppf, collided };
}
// Write a token to a CENTER destination — directly if we own it, else relay to the GM (push vs an enemy).
// Every engine-driven relocation (edha-move/edha-push slides, Trade Routes teleport) funnels through
// here and stamps `options.edhaForced`, so move watchers can tell an engine move from a walk; GM
// hand-drags carry no stamp and stay ambiguous (Order's violation prompt covers those).
async function edhaMoveTokenTo(tok, centerDest, { teleport = false, hostile = false } = {}) {
  // `hostile` (07-16c, Dense Tissue): pushes/pulls AGAINST the victim's volition stamp
  // options.edhaHostileMove so immunity vetoes can tell them from willing engine slides
  // (Cruel Step / Trade Routes), which stamp only edhaForced.
  const doc = tok.document ?? tok;
  const gs = canvas?.scene?.grid?.size || 100;
  const w = tok.w || ((doc.width || 1) * gs), h = tok.h || ((doc.height || 1) * gs);
  const x = Math.round(centerDest.x - w / 2), y = Math.round(centerDest.y - h / 2);
  const opts = hostile ? { edhaForced: true, edhaHostileMove: true } : { edhaForced: true };
  if (doc.isOwner) {
    try {
      // Teleport (Trade Routes): v13 animates plain updates along a WALL-CONSTRAINED walk path — the
      // pass-3 teleport got stuck on a wall. "displace" is core's own unconstrained teleport action
      // (walls: null, no animation — the same action Region teleports use).
      if (teleport && typeof doc.move === "function") { await doc.move({ x, y, action: "displace" }, opts); return true; }
      await doc.update({ x, y }, { animate: !teleport, teleport, ...opts }); return true;
    } catch (e) {}
  }   // engine push/slide = not willing movement (Order violation watcher + Dread Presence veto both read this)
  if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "move-token", payload: { tokenUuid: doc.uuid, x, y, teleport, hostile } }); return true; } catch (e) {} }
  return false;
}
// Slide `tok` toward `destCenter`, optionally stopping `gapPx` short (so a charge lands adjacent, not on top).
async function edhaApplyMove(tok, destCenter, maxFt, { gapPx = 0, hostile = false } = {}) {
  const origin = tok.center;
  let aim = destCenter;
  if (gapPx > 0) {
    const dx = destCenter.x - origin.x, dy = destCenter.y - origin.y, len = Math.hypot(dx, dy) || 1;
    aim = { x: destCenter.x - dx / len * gapPx, y: destCenter.y - dy / len * gapPx };
  }
  const r = edhaComputeMove(origin, aim, maxFt, tok);
  await edhaMoveTokenTo(tok, r.dest, { hostile });
  return r;
}
function edhaSpeedFt(actor) { return Math.max(0, Number(foundry.utils.getProperty(actor, "system.movement.walk.rate")) || 0); }
function edhaMoveAllowanceFt(actor, cfg) {
  if (cfg.byHalfSpeed) return Math.floor(edhaSpeedFt(actor) / 2);
  if (cfg.bySize) return EDHA_SIZE_FT[edhaColorRank(actor, "red")] || EDHA_SIZE_FT[1];
  return Number(cfg.distanceFt) || 0;
}

// edha-move executor body: relocate the caster toward their current target, ignoring Reactions.
async function edhaRunMove(item, cfg) {
  try {
    const actor = item?.actor; if (!actor) return;
    if (cfg.whenFastTurn && !edhaIsFastTurn(actor)) return;
    const key = item.name;
    if (cfg.oncePerTurn && !edhaOncePerTurnAllowed(actor, key)) return;
    const maxFt = edhaMoveAllowanceFt(actor, cfg);
    const tok = edhaCasterToken(actor);
    const ttok = Array.from(game.user?.targets ?? [])[0] ?? null;
    // Cruel Step (07-12): the slide is only legal toward an ISOLATED target — warn and stand down
    // otherwise (the activation cost has already been paid; the GM can refund if it was a misclick).
    if (cfg.requireTargetIsolated && ttok?.actor && !edhaIsIsolated(ttok.actor, ttok)) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🚫 <strong>${item.name}</strong> — ${ttok.actor.name} is not Isolated (a living ally is adjacent): no move. <span style="opacity:.8">(GM may refund the cost if this was a mistarget.)</span></p>` });
      return;
    }
    if (cfg.oncePerTurn) await edhaOncePerTurnMark(actor, key);
    if (!tok || !ttok) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💨 <strong>${item.name}</strong> — ${actor.name} may move up to <strong>${maxFt} ft</strong> without provoking Reactions. <span style="opacity:.8">(no target selected — position manually)</span></p>` });
      return;
    }
    const { movedFt, collided } = await edhaApplyMove(tok, ttok.center, maxFt, { gapPx: (tok.w || 0) / 2 });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💨 <strong>${item.name}</strong> — ${actor.name} moves <strong>${Math.round(movedFt)} ft</strong> toward ${ttok.actor?.name ?? "the target"}${collided ? " (stopped at an obstacle)" : ""}, ignoring Reactions.</p>` });
  } catch (e) { console.error("Edha Content | edha-move failed", e); }
}

// edha-push executor body (Shockwave Slam): shove the victim directly away from the attacker; if it
// slams into a wall, deal the collision damage.
async function edhaRunPush(owner, victim, cfg) {
  try {
    if (!owner || !victim) return;
    // Dense Tissue (07-16c, Ben E16 — was "volition, no hook"): the mutation makes its bearer
    // immune to forced movement, and every engine push comes through here — refuse cleanly.
    if (victim.getFlag?.("edha-content", "mutation")?.kind === "denseTissue") {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🧬 <strong>Dense Tissue</strong>: ${victim.name} is immune to forced movement — the push does nothing.</p>` });
      return;
    }
    const otok = edhaCasterToken(owner), vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0];
    if (!otok || !vtok) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Shockwave Slam"}</strong> — push ${victim.name} (no token on canvas — apply manually).</p>` });
      return;
    }
    const maxFt = cfg.bySize ? (EDHA_SIZE_FT[edhaColorRank(owner, "red")] || EDHA_SIZE_FT[1]) : (Number(cfg.distanceFt) || 5);
    const dx = vtok.center.x - otok.center.x, dy = vtok.center.y - otok.center.y, len = Math.hypot(dx, dy) || 1;
    const aim = { x: vtok.center.x + dx / len * (maxFt * edhaPxPerFt()), y: vtok.center.y + dy / len * (maxFt * edhaPxPerFt()) };
    const { movedFt, collided } = await edhaApplyMove(vtok, aim, maxFt, { gapPx: 0, hostile: true });
    let dmgTxt = "";
    if (collided && cfg.collisionFormula) {
      const roll = await (new Roll(cfg.collisionFormula, owner.getRollData())).evaluate();
      const amt = Math.max(0, Math.floor(roll.total));
      if (amt > 0) { await edhaCrossDamage(victim, amt, cfg.collisionType || "impact", { edhaSource: owner }); dmgTxt = ` and slams into an obstacle for <strong>${amt} ${cfg.collisionType || "impact"}</strong>`; }
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Shockwave Slam"}</strong> — ${victim.name} is pushed <strong>${Math.round(movedFt)} ft</strong>${dmgTxt}.</p>` });
  } catch (e) { console.error("Edha Content | edha-push failed", e); }
}

// --- Rally stack (Battle Fever / Feeding Frenzy): +1 to your tests, capped at Red rank, time-boxed --
function edhaRallyBonus(actor) {
  try { const r = actor?.getFlag?.("edha-content", "rally"); return r ? Math.min(Number(r.count) || 0, edhaColorRank(actor, "red")) : 0; }
  catch (e) { return 0; }
}
async function edhaRallyBump(actor, resetOn = "turn") {
  const cap = edhaColorRank(actor, "red"); if (cap <= 0) return 0;
  const cur = edhaRallyBonus(actor); if (cur >= cap) return cur;
  try { await actor.setFlag("edha-content", "rally", { count: cur + 1, resetOn }); } catch (e) {}
  return cur + 1;
}
async function edhaRallyClear(actor) { try { if (actor?.getFlag?.("edha-content", "rally")) await actor.unsetFlag("edha-content", "rally"); } catch (e) {} }
// Battle Fever: the owner's own damage feeds the frenzy (enforced). Allies-in-range sharing is narrated.
function edhaRallyOnDeal(actor) {
  try {
    if (!actor?.items) return;
    for (const tal of actor.items) {
      if (!edhaIsTalent(tal)) continue;
      const h = edhaRuleOf(tal, "edha-rally-stack"); if (!h) continue;
      if ((h.trigger || "deal-damage") !== "deal-damage") continue;
      void edhaRallyBump(actor, h.resetOn || "turn").then((n) => {
        if (n > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔥 <strong>${tal.name}</strong> — ${actor.name} (and allies in Attunement Range) gain <strong>+${n}</strong> to their next test (max ${edhaColorRank(actor, "red")}). <span style="opacity:.8">Allies: apply +${n} yourselves.</span></p>` });
      });
      break;
    }
  } catch (e) { console.error("Edha Content | rally-on-deal failed", e); }
}
// Console/macro hook for the no-engine-hook trigger (Feeding Frenzy: "an enemy attacks another enemy").
async function edhaRallyApi(actorArg) {
  const a = edhaResolveActorArg(actorArg); if (!a) { ui.notifications?.warn("Edha: select a token or pass an actor/name to rally()."); return 0; }
  const tal = a.items?.find(i => edhaIsTalent(i) && edhaRuleOf(i, "edha-rally-stack"));
  const h = tal ? edhaRuleOf(tal, "edha-rally-stack") : null;
  const n = await edhaRallyBump(a, h?.resetOn || "round");
  if (n > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🔥 <strong>${tal?.name || "Frenzy"}</strong> — ${a.name} gains <strong>+${n}</strong> to its next test.</p>` });
  return n;
}
// Reset: "start of your turn" (resetOn turn) at each turn change; "start of round" (resetOn round) at the round flip.
Hooks.on("combatTurnChange", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const newRound = (combat?.turn ?? 0) === 0;
    const cur = combat?.combatant?.actor;
    for (const t of (combat?.turns ?? [])) {
      const a = t?.actor; if (!a) continue;
      const r = a.getFlag?.("edha-content", "rally"); if (!r) continue;
      if (r.resetOn === "round") { if (newRound) void edhaRallyClear(a); }
      else if (a === cur) void edhaRallyClear(a);                 // resetOn "turn" → clears when its own turn begins
    }
  } catch (e) { console.error("Edha Content | rally reset failed", e); }
});

// --- Breaking Point: a creature in your Attunement Range struck a 2nd time in a round → Disoriented --
// Cross-actor (the Red mage reacts to OTHERS taking damage), so it's a GM-side applyDamage watcher,
// name-based, once per round per creature — same shape as the Black focus watchers.
function edhaWithinAttuneColor(owner, targetTok, color) {
  const ot = edhaCasterToken(owner); if (!ot || !targetTok) return false;
  return edhaTokensWithin(ot, edhaAttuneFtColor(owner, color)).some(t => t.id === targetTok.id);
}
async function edhaBreakingPointWatch(victim, damage) {
  try {
    if (!edhaDefBuffGmGate() || _edhaInTrigger) return;
    if (!victim || (Number(damage?.dealt) || 0) <= 0) return;
    const owners = edhaCharacterOwnersOf("Breaking Point"); if (!owners.length) return;
    const round = game.combat?.round; if (round == null) return;
    const key = `bpHits.${round}`;
    const hits = (Number(victim.getFlag?.("edha-content", key)) || 0) + 1;
    try { await victim.setFlag("edha-content", key, hits); } catch (e) {}
    if (hits !== 2) return;                                       // only the 2nd hit of the round triggers
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0]; if (!vtok) return;
    for (const owner of owners) {
      if (owner === victim) continue;
      if (!edhaWithinAttuneColor(owner, vtok, "red") || !edhaDisposHostile(owner, victim)) continue;
      await edhaApplyTimedStatus(victim, "disoriented", { owner, expire: "owner" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🌀 <strong>Breaking Point</strong> (${owner.name}): ${victim.name} is struck a 2nd time this round and becomes <strong>Disoriented</strong>. <span style="opacity:.8">(You may spend 1 Investiture.)</span></p>` });
      break;                                                       // one application per victim
    }
  } catch (e) { console.error("Edha Content | Breaking Point watch failed", e); }
}
Hooks.on("cosmere-rpg.applyDamage", (target, damage) => { try { void edhaBreakingPointWatch(target, damage); } catch (e) {} });

// --- Frenzied Tempo: advantage on Influence (Presence) tests during a fast turn (passive, owner-side) --
function edhaFrenziedTempoPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor || !edhaOwnsTalent(actor, "Frenzied Tempo")) return;
    if (!edhaIsFastTurn(actor)) return;
    const skill = roll?.data?.skill;
    const attr = skill?.attribute ?? config?.defaultAttribute;
    if (attr !== "pre" || EDHA_LEY_COLORS.includes(skill?.id)) return;   // Presence-based Influence skills only (not leyline casts)
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | Frenzied Tempo pre-roll failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.pre${ctx.charAt(0).toUpperCase() + ctx.slice(1)}Roll`, edhaFrenziedTempoPreRoll);

// --- Cross-actor focus loss (Shatter Focus) ------------------------------------------------------
async function edhaCrossFocusLoss(target, n = 1) {
  if (!target) return;
  const cur = Number(target.system?.resources?.foc?.value) || 0; if (cur <= 0) return;
  const next = Math.max(0, cur - n);
  if (target.isOwner) { try { await target.update({ "system.resources.foc.value": next }); } catch (e) {} return; }
  if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "set-resource", payload: { actorUuid: target.uuid, path: "system.resources.foc.value", value: next } }); } catch (e) {} }
}

// --- NAME-BASED use dispatch for the activated Frenzy/Momentum talents (owner's client; no rebuild) --
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;
    switch (item.name) {
      case "Shatter Focus": {                                     // Reaction: a creature in range failed a test → it loses 1 focus
        const t = target0();
        if (!t) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧠 <strong>Shatter Focus</strong> — target the creature that failed, then re-use (it loses 1 focus).</p>` }); break; }
        void edhaCrossFocusLoss(t, 1);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧠 <strong>Shatter Focus</strong> (${actor.name}): ${t.name} loses <strong>1 focus</strong>.</p>` });
        break;
      }
      case "Emotional Overload": {                                // disadvantage on the target's next (non-attack) test
        const t = target0();
        if (!t) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>😖 <strong>Emotional Overload</strong> — target the creature, then re-use.</p>` }); break; }
        void edhaSetNextTestMod(t, { mode: "disadvantage", count: 1, skill: null, source: "Emotional Overload" });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>😖 <strong>Emotional Overload</strong> (${actor.name}): disadvantage on ${t.name}'s next test. <span style="opacity:.8">(GM: only a non-attack test.)</span></p>` });
        break;
      }
      case "Reckless Gambit": {                                   // grant advantage to an ally's next test; it becomes Exhausted
        const t = target0();
        if (!t) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>Reckless Gambit</strong> — target the creature, then re-use.</p>` }); break; }
        void edhaSetNextTestMod(t, { mode: "advantage", count: 1, skill: null, source: "Reckless Gambit" });
        void edhaToggleStatus(t, "exhausted", true);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>Reckless Gambit</strong> (${actor.name}): ${t.name} gains advantage on its next test, then becomes <strong>Exhausted</strong> (−2).</p>` });
        break;
      }
      case "Reckless Momentum":                                   // spend Opportunity → Plot Die on your next test this turn
        void edhaGrantPlotDie(actor, { skill: null, source: "Reckless Momentum" });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>Reckless Momentum</strong> (${actor.name}): spend an Opportunity to roll the Plot Die on your next test this turn.</p>` });
        break;
      case "Incite": {                                            // forced action — the one genuine engine gap (volition)
        const t = target0();
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🗯️ <strong>Incite</strong> (${actor.name}): on a success vs ${t ? t.name + "'s" : "the target's"} Spiritual, it must Strike the nearest creature or <strong>lose its Reaction</strong>. <span style="opacity:.8">(GM resolves the forced action.)</span></p>` });
        break;
      }
    }
  } catch (e) { console.error("Edha Content | Momentum/Frenzy use-hook failed", e); }
});

/* --- Defense-buff talents (e.g. Know Your Moment): +N defenses for a combat-timing window ----------
 * Driven by the talent's own `edha-defense-buff` rule (Events tab — amount/defenses/window editable
 * there). "round-until-turn" = a toggled ActiveEffect (+amount to each defense's .bonus, which the
 * DerivedValueField folds into .value) that's ON from the start of each round until the owner takes
 * its turn. The cosmere system has NO turn hooks, so we use Foundry core combat hooks and RECOMPUTE
 * every combatant's state on each turn/round change by initiative order: anyone later in the order
 * than the current turn hasn't acted yet this round → +N; the current/earlier actors → none.
 * That captures the round boundary for free (turn resets to 0 → everyone but the new first re-arms). GM-side.
 */
Hooks.once("ready", () => {
  try { if (game.combat?.started && edhaDefBuffGmGate()) void edhaRefreshDefBuffs(game.combat); }   // restore state after a mid-combat reload
  catch (e) { console.warn("Edha Content | def-buff restore failed", e); }
});
function edhaDefBuffGmGate() { return !!game.user?.isGM && !(game.users?.activeGM && !game.users.activeGM.isSelf); }   // exactly one GM writes
function edhaDefBuffFor(actor) {
  if (!actor?.items) return null;
  for (const tal of actor.items) {
    if (!edhaIsTalent(tal)) continue;
    const h = edhaRuleOf(tal, "edha-defense-buff");
    if (h && (h.window || "round-until-turn") === "round-until-turn") {
      return { name: tal.name, spec: { amount: h.amount, defenses: String(h.defenses || "phy, cog, spi").split(/[\s,]+/).filter(Boolean), label: h.label || `${tal.name} (Ready)`, img: h.img } };
    }
  }
  return null;
}
async function edhaApplyDefBuff(actor) {
  const hit = edhaDefBuffFor(actor); if (!hit) return;
  if (actor.effects.find(e => e.getFlag?.("edha-content", "defBuff"))) return;          // already armed
  const s = hit.spec; const amt = Number(s.amount) || 2;
  const defs = (Array.isArray(s.defenses) && s.defenses.length) ? s.defenses : ["phy", "cog", "spi"];
  const changes = defs.map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(amt), priority: 20 }));
  try {
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: s.label || hit.name, img: s.img || "icons/svg/shield.svg", changes,
      description: `<p>+${amt} to ${defs.map(d => d.toUpperCase()).join("/")} defense until you take your turn (${hit.name}).</p>`,
      flags: { "edha-content": { defBuff: hit.name } },
    }]);
  } catch (e) { console.error("Edha Content | def-buff apply failed", e); }
}
async function edhaRemoveDefBuff(actor) {
  const ex = actor?.effects?.filter(e => e.getFlag?.("edha-content", "defBuff")) ?? [];
  if (ex.length) { try { await actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) { console.error("Edha Content | def-buff remove failed", e); } }
}
// Single source of truth: re-derive every combatant's buff state from initiative order vs the current turn.
async function edhaRefreshDefBuffs(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const curTurn = combat.turn ?? 0; const turns = combat.turns ?? [];
  for (let i = 0; i < turns.length; i++) {
    const a = turns[i]?.actor; if (!a) continue;
    if (i > curTurn) await edhaApplyDefBuff(a);   // later in initiative → hasn't acted this round → +N
    else await edhaRemoveDefBuff(a);              // acting now or already acted → no bonus
  }
}
Hooks.on("combatStart", (combat) => { if (edhaDefBuffGmGate()) void edhaRefreshDefBuffs(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaRefreshDefBuffs(combat); });
Hooks.on("deleteCombat", (combat) => { if (!edhaDefBuffGmGate()) return; for (const c of (combat?.combatants ?? [])) if (c.actor) void edhaRemoveDefBuff(c.actor); });

/* --- J: name the resource-consume popup --------------------------------------------------------
 * When you use a talent that has a cost (e.g. Searing Bolt → "Spend 1 Investiture"), the system
 * shows ItemConsumeDialog. The cost lives on the talent ITSELF (system.activation.consume), so the
 * popup is that talent's own cost — NOT a rider or another talent. But the system never passes a
 * title to the dialog, so it reads the generic "Consume Resource" with no clue which talent it is
 * for. When two talents both cost 1 Investiture (e.g. Searing Bolt and Arc Flash) that's ambiguous.
 * We patch the dialog's window title to the talent name. (ItemConsumeDialog stores `this.item`;
 * ApplicationV2 fires `render<ClassName>`, so `renderItemConsumeDialog` is reliable.)
 */
function edhaSetConsumeTitle(app, element) {
  try {
    const item = app?.item;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    if (!item || !root) return;
    const titleEl = root.querySelector(".window-title")
      || root.closest?.(".application, .window-app")?.querySelector(".window-title");
    if (titleEl) titleEl.textContent = `${item.name} — Consume Resource`;
  } catch (e) {
    console.error("Edha Content | consume-dialog title patch failed", e);
  }
}
// Primary (most-derived class) + a defensive fallback on the DialogV2 base, in case the bundler
// renames the subclass. Both are idempotent (they just set text).
Hooks.on("renderItemConsumeDialog", edhaSetConsumeTitle);
Hooks.on("renderDialogV2", (app, element) => { if ("item" in (app ?? {})) edhaSetConsumeTitle(app, element); });

/* --- Talent budget (level-up restriction) — Edha house rules ---------------------------------
 * The cosmere system does NOT enforce a talent limit: clicking an available tree node adds the
 * talent on prereqs alone (no level/budget check). We enforce an Edha-specific budget, derived
 * from the Stormlight starter-rules "Character Advancement" table (with the per-tier "ancestry
 * bonus talent" repurposed as a general leyline/deity/heroic talent, since Edha drops ancestry):
 *
 *   • Level 1 (character creation): 4 talents — 2 Key talents (one Heroic + one Leyline path) plus
 *     one talent per tree. KEYS COUNT toward the total, and may ONLY be taken at level 1.
 *   • Each level after 1: +1 talent, PLUS a bonus talent at every tier breakpoint (levels 6/11/16/21).
 *
 *   Closed form:  allowed(L) = L + 3 + floor((L-1)/5)
 *     L1=4  L2=5  L5=8 | L6=10  L10=14 | L11=16  L15=20 | L16=22  L20=26 | L21=28
 *
 * Tune the formula / Key rule here. (L21 RAW gives "+1 skill OR +1 talent"; we grant the talent.)
 */
function edhaIsKeyTalent(item) {
  try { if (item?.getFlag?.("edha-content", "specialty") === "Key") return true; } catch (e) { /* temp doc */ }
  return item?.flags?.["edha-content"]?.specialty === "Key";
}
function edhaAllowedTalents(actor) {
  const L = Math.max(1, Number(actor?.system?.level) || 1);
  return L + 3 + Math.floor((L - 1) / 5);
}
function edhaCountTalents(actor) {
  // Every talent counts toward the total budget, Keys included (the 4-at-L1 figure includes 2 Keys).
  return actor.items.filter(i => i.type === "talent").length;   // type-strict: twins never count (PC budget)
}
Hooks.on("preCreateItem", (item) => {
  try {
    if (globalThis.edhaSkipBudget === true) return true; // GM bypass for bulk imports/pregens: edha.skipBudget(true) … (false)
    if (item.type !== "talent") return true;            // type-strict: only talents have a budget
    const actor = item.parent;
    if (!actor || actor.type !== "character") return true; // only on character actors
    const level = Math.max(1, Number(actor.system?.level) || 1);
    // Key talents may only be taken at level 1 (character creation); never after.
    if (edhaIsKeyTalent(item) && level > 1) {
      ui.notifications?.warn("Key talents can only be taken at level 1 (character creation).");
      return false;
    }
    const allowed = edhaAllowedTalents(actor);
    const current = edhaCountTalents(actor);
    if (current >= allowed) {
      ui.notifications?.warn(
        `Talent limit reached: a level ${level} character may have ${allowed} talent${allowed === 1 ? "" : "s"} (already has ${current}). Raise the character's level to take more.`
      );
      return false; // cancel creation — blocks tree-click AND drag-drop
    }
  } catch (e) {
    console.error("Edha Content | talent budget check failed", e);
  }
  return true;
});

/* --- E6: "Heroic Path" / "Leyline Path" pick slots on the character sheet --------------------
 * Inject two labeled empty slots into the lineage area for whichever path type the character is
 * missing. Clicking a slot opens the matching Edha compendium so the player can drag the path onto
 * the sheet. (CharacterSheet is an ApplicationV2; its render hook fires for the whole class chain,
 * so `renderCharacterSheet(app, element)` is reliable; `element` is the root HTMLElement.)
 */
const EDHA_PATH_SLOTS = [
  { type: "heroic",  pack: "edha-content.edha-heroic",  label: "Heroic Path" },
  { type: "leyline", pack: "edha-content.edha-leyline", label: "Leyline Path" },
  { type: "deity",   pack: "edha-content.edha-deity",   label: "Deity Path — Optional" },
];
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    const actor = app?.actor;
    if (!root || !actor || actor.type !== "character") return;
    const lineage = root.querySelector(".lineage");
    if (!lineage) return;
    // Idempotent: drop any slots from a previous render pass.
    lineage.querySelectorAll(".edha-path-slot").forEach(n => n.remove());
    const paths = actor.items.filter(i => i.type === "path");
    const anchor = lineage.querySelector("app-character-paths-list");
    let insertAfter = anchor;
    for (const slot of EDHA_PATH_SLOTS) {
      if (paths.some(p => p.system?.type === slot.type)) continue; // already has this path type
      const div = document.createElement("div");
      div.className = "path drop-area edha-path-slot";
      div.dataset.edhaPack = slot.pack;
      div.innerHTML = `<span>${slot.label}</span>`;
      div.addEventListener("click", () => {
        const pack = game.packs?.get(slot.pack);
        if (pack) pack.render(true);
        else ui.notifications?.warn(`Edha Content | compendium "${slot.pack}" not found.`);
      });
      if (insertAfter && insertAfter.parentNode === lineage) insertAfter.after(div);
      else lineage.appendChild(div);
      insertAfter = div; // keep heroic above leyline
    }
  } catch (e) {
    console.error("Edha Content | path-slot injection failed", e);
  }
});

/* --- J2: Budget readout ("remaining points") panel in the sheet header --------------------
 * Shows how many talent points, attribute points, and skill ranks remain for the actor's level.
 * Injected into .level-details in the sheet header — always visible regardless of active tab.
 *
 * Advancement rules (CONFIG.COSMERE.advancement.rules[]):
 *   Each entry has { level, attributePoints?, skillRanks, … }.
 *   We sum the fields for all rules whose .level <= actor's level to get cumulative grants.
 *   Attributes: initial=0, so actor.system.attributes[k].value IS the points spent.
 *   Skills:     initial=0, so actor.system.skills[k].rank IS the ranks spent.
 */
function edhaGetBudget(actor) {
  const level = Math.max(1, Number(actor.system?.level) || 1);
  const rules = CONFIG.COSMERE?.advancement?.rules ?? [];
  let attrGranted = 0, skillGranted = 0;
  for (const rule of rules) {
    if ((rule.level ?? 0) <= level) {
      attrGranted  += rule.attributePoints ?? 0;
      skillGranted += rule.skillRanks      ?? 0;
    }
  }
  const ATTR_KEYS = ["str", "spd", "int", "wil", "awa", "pre"];
  const attrSpent  = ATTR_KEYS.reduce((s, k) => s + (actor.system?.attributes?.[k]?.value ?? 0), 0);
  const skillSpent = Object.values(actor.system?.skills ?? {}).reduce((s, sk) => s + (sk.rank ?? 0), 0);
  return { attrGranted, attrSpent, skillGranted, skillSpent,
           talentGranted: edhaAllowedTalents(actor), talentSpent: edhaCountTalents(actor) };
}

/* --- Readable-Dark sheet QoL (2026-07-12c design handoff, engine side) --------------------------
 * The palette itself is pure CSS (styles/edha.css). Two behaviors need the engine:
 *  1. Height clamp relax — the system's CharacterSheet clamps resize to MAX_HEIGHT 900 (and pins
 *     width via MIN=MAX 800; width stays pinned — the two-column layout is designed for it). We lift
 *     MAX_HEIGHT on the real class at first render so the window drags taller; the edha.css
 *     `.sheet-content { flex:1 }` rule makes the content column fill the extra height.
 *  2. Optional per-user sheet scale (90–130%, default 100) — CSS zoom on the window content, for
 *     players who want everything bigger independent of the palette. Client-scoped setting.
 */
Hooks.once("init", () => {
  try {
    game.settings.register("edha-content", "sheetScale", {
      name: "Actor sheet scale (%)",
      hint: "Uniform zoom on the character sheet content, per user. 100 = default size.",
      scope: "client", config: true, type: Number,
      range: { min: 90, max: 130, step: 5 }, default: 100,
      onChange: () => { try { for (const app of foundry.applications.instances.values()) if (app?.actor?.type === "character") app.render(); } catch (e) {} },
    });
  } catch (e) { console.error("Edha Content | sheetScale setting registration failed", e); }
});
Hooks.on("renderCharacterSheet", (app) => {
  try {
    const cls = app?.constructor;
    const k = (Number(game.settings.get("edha-content", "sheetScale")) || 100) / 100;
    // CSS zoom shrinks the LOGICAL viewport: at 130% the pinned 800-px frame leaves ~615 logical px
    // and the sheet spills out the bottom (Ben's 07-12 "Outlaw sheet scale 130" capture). Scale the
    // system's frame pins (class statics read in _onPosition) by k so the zoomed content keeps its
    // designed 800-px logical layout, and resize the window whenever the applied scale changes.
    if (cls) {
      if (Number.isFinite(cls.MIN_WIDTH)) cls.MIN_WIDTH = Math.round(800 * k);
      if (Number.isFinite(cls.MAX_WIDTH)) cls.MAX_WIDTH = Math.round(800 * k);
      if (Number.isFinite(cls.MIN_HEIGHT)) cls.MIN_HEIGHT = Math.round(728 * k);
      if (Number.isFinite(cls.MAX_HEIGHT) && cls.MAX_HEIGHT < 4000) cls.MAX_HEIGHT = 4000;   // was 900
    }
    const wc = app?.element?.querySelector?.(".window-content");
    if (wc) wc.style.zoom = k === 1 ? "" : String(k);
    const prev = app._edhaSheetScale || 1;
    if (prev !== k) {
      app._edhaSheetScale = k;
      const h = Math.round((app.position?.height || 728) / prev * k);
      app.setPosition({ width: Math.round(800 * k), height: Math.min(h, Math.round((window.innerHeight || 1200) * 0.95)) });
    }
  } catch (e) { /* cosmetic only — never block the sheet render */ }
});

function edhaBudgetRow(label, spent, granted) {
  const rem = granted - spent;
  const cls = rem < 0 ? " edha-budget-over" : rem === 0 ? " edha-budget-full" : "";
  return `<div class="edha-budget-row${cls}"><span class="edha-budget-label">${label}</span><span class="edha-budget-value">${rem} / ${granted}</span></div>`;
}

Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    const actor = app?.actor;
    if (!root || !actor || actor.type !== "character") return;
    root.querySelector(".edha-budget-panel")?.remove();
    const b = edhaGetBudget(actor);
    const thp = edhaGetTempHp(actor);
    const reserve = edhaGetReserve(actor), reserveCap = edhaReserveCap(actor);
    const panel = document.createElement("div");
    panel.className = "edha-budget-panel";
    panel.title = "Remaining budget (remaining / total) — Talents | Attribute points | Skill ranks";
    panel.innerHTML =
      (thp ? `<div class="edha-budget-row edha-thp" title="Temporary HP (${thp.source || "—"}) — absorbed before normal HP; cannot be healed, only replaced"><span class="edha-budget-label">Temp HP</span><span class="edha-budget-value">${thp.value}</span></div>` : "") +
      edhaBudgetRow("Talents",    b.talentSpent, b.talentGranted) +
      edhaBudgetRow("Attr pts",   b.attrSpent,   b.attrGranted)   +
      edhaBudgetRow("Skill rnks", b.skillSpent,  b.skillGranted);
    // G: one-click "Sync Talents" — re-pull roll data from the packs onto this actor's talents
    // (fixes stale snapshots after a content rebuild). Lives in the budget bar so it's always visible.
    const syncBtn = document.createElement("button");
    syncBtn.type = "button";
    syncBtn.className = "edha-sync-btn";
    syncBtn.title = "Re-sync this character's Edha talents from the compendium packs (fixes stale rolls after a content rebuild).";
    syncBtn.textContent = "⟳ Sync Talents";
    syncBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      Promise.resolve(edhaSyncNow(actor)).then((r) => { if (r) app.render(false); });
    });
    panel.appendChild(syncBtn);
    // Insert as a slim bar between the sheet header and the main content — always visible.
    const sheetHeader = root.querySelector(".sheet-header");
    if (sheetHeader) sheetHeader.after(panel);
    else root.querySelector(".sheet-content")?.before(panel);

    // Reserve readout beside the resource bars (Ben 07-05: it used to sit in the budget bar next to
    // talent/skill/attr points; it belongs with Investiture/Focus/Health). Spending happens through the
    // "Pay from Reserve" option in the Spend-Investiture dialog / the ritual-HP Double Dip prompt.
    root.querySelector(".edha-reserve-bar")?.remove();
    if (reserveCap > 0 && edhaOwnsTalent(actor, "Sanguine Reservoir")) {
      const invRes = root.querySelector(".resource.inv");
      if (invRes) {
        const rbar = document.createElement("div");
        rbar.className = "edha-reserve-bar";
        rbar.title = "Reserve (Sanguine Reservoir) — banked from ritual HP paid (cap = ranks in Black). Spend it in place of Investiture via the Spend-Investiture dialog, or in place of ritual HP vs a Double-Dipped target.";
        // Readable Dark (07-12 design handoff): pill lifted from near-black red to the spec values.
        rbar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:2px 8px;margin:2px 0;border:1px solid rgba(160,80,80,0.6);border-radius:4px;background:rgba(122,47,47,0.28);color:#d8cfb6;font-size:0.9em;";
        rbar.innerHTML = `<span style="opacity:.9">🩸 Reserve</span><span><strong>${reserve}</strong> / ${reserveCap}</span>`;
        invRes.after(rbar);
      }
    }

    // Ritual HP costs in the Actions tab's cost column (Ben 07-05: Withering Ray's HP price was only in
    // the description). Display-only — the deduction itself stays on the talent's edha-ritual-hp-cost
    // event; consume entries can't carry a die formula, so this paints the label into the consume cell.
    try {
      for (const row of root.querySelectorAll(".item[data-item-id]")) {
        const it = actor.items.get(row.dataset.itemId);
        const hpRule = it && edhaIsTalent(it) ? edhaRuleOf(it, "edha-ritual-hp-cost") : null;
        if (!hpRule) continue;
        const cell = row.querySelector(".detail.wide");
        if (!cell || cell.querySelector(".edha-hp-cost")) continue;
        const f = String(hpRule.formula || "");
        // Resolve against THIS actor so the cell shows the real price (Ben 07-12: "[DIE] is not
        // calculated to be the actor's black die") — "½d8 HP" / "2 HP", not the template.
        let label = /floor\(\(1d/.test(f) ? "½[Die] HP" : f === "@tier" ? "[Tier] HP" : "HP";
        try {
          const folded = edhaFoldDieMath(Roll.replaceFormulaData(f, actor.getRollData(), { missing: "0" }));
          const half = folded.match(/^floor\(\((\d*d\d+)\)\s*\/\s*2\)$/);
          if (half) label = `½${half[1]} HP`;
          else if (/^\d+(\.\d+)?$/.test(folded)) label = `${Math.floor(Number(folded))} HP`;
          else if (/^\d*d\d+$/.test(folded)) label = `${folded} HP`;
        } catch (e) { /* keep the template label */ }
        const span = document.createElement("span");
        span.className = "edha-hp-cost";
        span.title = hpRule.note || "This talent costs health on use (auto-deducted).";
        span.style.cssText = "color:#c66;white-space:nowrap;";
        const existing = cell.textContent?.trim();
        span.textContent = (existing && existing !== "—" ? " + " : "") + label;
        if (!existing || existing === "—") { const dash = cell.querySelector("span"); if (dash && dash.textContent.trim() === "—") dash.remove(); }
        cell.appendChild(span);
      }
    } catch (e) { console.error("Edha Content | HP-cost column paint failed", e); }

    // K: overlay a cyan Temp HP bar on the green Health bar (clipped to the bar shape by .inner's mask).
    const healthInner = root.querySelector(".resource.hea .bar .container .inner") || root.querySelector(".resource.hea .inner");
    if (healthInner) {
      healthInner.querySelector(".edha-thp-bar")?.remove();
      if (thp) {
        const heaMax = actor.system?.resources?.hea?.max;
        const maxHp = (heaMax && typeof heaMax === "object" ? heaMax.value : heaMax) || 0;
        if (maxHp > 0) {
          const pct = Math.min(100, (thp.value / maxHp) * 100);
          const tbar = document.createElement("div");
          tbar.className = "edha-thp-bar";
          tbar.style.width = pct + "%";
          tbar.title = `Temp HP: ${thp.value} (absorbed before normal HP)`;
          healthInner.appendChild(tbar);
        }
      }
    }
  } catch (e) {
    console.error("Edha Content | budget panel failed", e);
  }
});

/* When an Edha path is added to a character, open its tree (the path sheet's Talents tab) so the
 * player can immediately pick a talent. The Key talent is granted separately by the path's own
 * add-to-actor event. Only the user who created it opens the window. */
Hooks.on("createItem", (item, options, userId) => {
  try {
    if (game.user?.id !== userId) return;
    if (item?.type !== "path" || item.parent?.type !== "character") return;
    if (!["heroic", "leyline", "deity"].includes(item.system?.type)) return;
    setTimeout(() => { try { item.sheet?.render(true); } catch (e) { /* sheet may be gone */ } }, 150);
  } catch (e) {
    console.error("Edha Content | open-tree-on-drop failed", e);
  }
});

/* --- G: "Sync Edha Talents" utility -----------------------------------------------------------
 * Talents already on an actor are SNAPSHOTS frozen at add-time; a pack rebuild does NOT update
 * them, so after editing roll data (talent-rolls.json) the owned copies keep stale activation/
 * damage and won't roll. This re-pulls the content fields from the three Edha packs onto the
 * actor's talents, matched by exact name. It DELIBERATELY does not touch system.relationships
 * (the talent's Parent link to its path, which drives the per-path Actions grouping).
 */
const EDHA_SRC_PACKS = ["edha-content.edha-leyline", "edha-content.edha-deity", "edha-content.edha-heroic"];

// Source map for syncing. Keyed two ways: "<atlas>|<group>|<name>" (exact tree identity — 28 talent
// names collide across trees, so name alone is ambiguous) and plain name as a fallback.
function edhaSrcKey(atlas, group, name) { return `${atlas ?? ""}|${group ?? ""}|${name}`; }
async function edhaBuildSourceMap() {
  const byName = new Map();
  for (const packId of EDHA_SRC_PACKS) {
    const pack = game.packs?.get(packId);
    if (!pack) continue;
    let docs = await pack.getDocuments();
    // Right after a pack write the collection can return a PARTIAL set (cache mid-invalidation) —
    // retry with backoff until the doc count matches the pack index (max 5 tries).
    for (let tries = 0; pack.index?.size && docs.length < pack.index.size && tries < 5; tries++) {
      await new Promise(r => setTimeout(r, 300 + tries * 200));
      docs = await pack.getDocuments();
    }
    if (pack.index?.size && docs.length < pack.index.size) console.warn(`Edha Content | sync: ${packId} returned ${docs.length}/${pack.index.size} docs after retries — re-run ⟳ Sync.`);
    for (const d of docs) {
      if (d.type !== "talent") continue;   // type-strict: compendium source docs are talent-typed
      const f = d.flags?.["edha-content"] ?? {};
      byName.set(edhaSrcKey(f.atlas, f.group, d.name), d);
      byName.set(d.name, d);
    }
  }
  return byName;
}
// Resolve an owned talent's pack source: exact tree identity first, then name.
function edhaSrcFor(byName, item) {
  const f = item.flags?.["edha-content"] ?? {};
  return byName.get(edhaSrcKey(f.atlas, f.group, item.name)) ?? byName.get(item.name);
}

async function edhaSyncActorTalents(actor, byName) {
  if (!actor) return { updated: 0, missing: [] };
  byName ??= await edhaBuildSourceMap();
  const updates = [], missing = [], effectPrunes = [];
  for (const item of actor.items) {
    if (item.type !== "talent") continue;   // type-strict: ⟳ Sync snapshots PC talents only (twins re-drag)
    const src = edhaSrcFor(byName, item);
    if (!src) { missing.push(item.name); continue; }
    const so = src.toObject();             // plain data (not the live DataModel)
    // Item updates MERGE object fields, so stale event rules would linger forever. Replace wholesale:
    // emit a `-=<id>` deletion for every existing rule that the pack source no longer carries.
    const newEvents = foundry.utils.deepClone(so.system.events ?? {});
    for (const oldId of Object.keys(item._source?.system?.events ?? {})) {
      if (!(oldId in newEvents)) newEvents[`-=${oldId}`] = null;
    }
    // Same for embedded ActiveEffects: updating merges/adds by _id but never deletes, so prune any
    // owned effect the pack source doesn't have (after the update applies).
    const srcEffIds = new Set((so.effects ?? []).map(e => e._id));
    const stale = item.effects.filter(e => !srcEffIds.has(e.id)).map(e => e.id);
    if (stale.length) effectPrunes.push({ item, stale });
    updates.push({
      _id: item.id,
      img: so.img,
      "system.activation": so.system.activation,   // cost/consume + skill_test config
      "system.damage": so.system.damage,           // formula/type → makes the roll fire
      "system.description": so.system.description,  // refreshed prose
      "system.events": newEvents,                  // native event rules (replaced wholesale via -= deletions)
      effects: so.effects ?? [],                   // passive ActiveEffects (e.g. +Speed); merged by _id
      "flags.edha-content": so.flags?.["edha-content"] ?? {}, // specialty flag (budget Key check)
    });
  }
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  for (const { item, stale } of effectPrunes) {
    try { await item.deleteEmbeddedDocuments("ActiveEffect", stale); }
    catch (e) { console.warn(`Edha Content | could not prune stale effect(s) on ${item.name}`, e); }
  }
  return { updated: updates.length, missing };
}

async function edhaSyncAllCharacters() {
  const byName = await edhaBuildSourceMap();
  let total = 0; const results = [];
  for (const a of (game.actors?.filter(a => a.type === "character") ?? [])) {
    const r = await edhaSyncActorTalents(a, byName);
    total += r.updated; results.push({ name: a.name, ...r });
  }
  console.log("Edha Content | synced all characters:", results);
  return { total, results };
}

// One-click entrypoint: resolve an actor (passed → controlled token → player character), sync, notify.
async function edhaSyncNow(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token (or set a player character) to sync."); return null; }
  const r = await edhaSyncActorTalents(actor);
  ui.notifications?.info(
    `Edha: synced ${r.updated} talent(s) on ${actor.name}` +
    (r.missing.length ? ` — ${r.missing.length} not found in packs (see console).` : ".")
  );
  if (r.missing.length) console.warn("Edha Content | talents not found in any Edha pack:", r.missing);
  return r;
}

/* --- Adversary pack sync (2026-07-18b) — replaces the per-deploy "re-drag every adversary" -----
 * World adversary actors are snapshots frozen at drag-time; a pack rebuild updates only the
 * COMPENDIUM, so every deploy used to end with re-dragging each placed adversary. This syncs a
 * world adversary IN PLACE to fresh-drag parity while KEEPING its actor id — the actual win over
 * a re-drag: scene tokens stay attached, holding their position/HP/combat state (unlinked-token
 * damage lives in the token delta, which the sync never touches).
 *   - Items: every pack-built copy (edha-content-flagged) or source-colliding item is deleted and
 *     re-created from the pack source WITH its pack `_id` (build ids are deterministic sha1 fids,
 *     so token-delta references keep resolving); hand-added items (no flag) survive.
 *   - Actor data: `system` + `prototypeToken` replaced WHOLESALE (recursive:false — a merge would
 *     keep removed skills/overrides forever); `img` + `flags.edha-content` refreshed. Name,
 *     folder, ownership, and sort stay the world actor's own.
 *   - Placed tokens: token docs are placement-time copies an actor update never touches, so the
 *     prototype's token-level fields (texture / sight / disposition / bars / display / size) are
 *     pushed onto every scene token of this actor — vision-model and art changes land without
 *     re-placing.
 * Matching: `_stats.compendiumSource` (stamped on drag; stays valid across rebuilds because pack
 * ids are deterministic) → legacy flags.core.sourceId → exact-name lookup in the adversary pack.
 * Bulk sync SKIPS a world copy whose name differs from its resolved source (a rename = a
 * customized variant); the sheet button syncs whatever it resolves (explicit intent). GM-only. */
const EDHA_ADV_PACK_ID = "edha-content.edha-adversaries";

// Pure decision: which owned items does a pack sync replace? Pack-built copies (edha-content-
// flagged) plus anything colliding with a source item by id or name drop and re-create from
// source; the rest (hand-added) survive. Items are plain {id, name, flags} shapes. (Pinned in tests/.)
function edhaAdvSyncPlan(ownedItems, srcItems) {
  const srcIds = new Set(srcItems.map(i => i._id));
  const srcNames = new Set(srcItems.map(i => i.name));
  const drop = [], keep = [];
  for (const it of ownedItems) {
    ((it.flags?.["edha-content"] != null || srcIds.has(it.id) || srcNames.has(it.name)) ? drop : keep).push(it.id);
  }
  return { drop, keep };
}

async function edhaAdvSrcFor(actor) {
  const pack = game.packs?.get(EDHA_ADV_PACK_ID);
  if (!pack) return null;
  const uuid = actor?._stats?.compendiumSource || actor?.flags?.core?.sourceId || "";
  if (typeof uuid === "string" && uuid.startsWith(`Compendium.${EDHA_ADV_PACK_ID}.`)) {
    try { const d = await fromUuid(uuid); if (d) return d; } catch (e) { /* entry renamed/removed — fall through to name */ }
  }
  const entry = pack.index?.find?.(e => e.name === actor?.name);
  return entry ? await pack.getDocument(entry._id) : null;
}

async function edhaSyncAdversaryActor(actor, src) {
  if (!actor || actor.type !== "adversary" || actor.pack) return null;   // world actors only — the compendium doc IS the source
  src ??= await edhaAdvSrcFor(actor);
  if (!src) return { synced: false, name: actor?.name, reason: "no pack source (name not in edha-adversaries)" };
  const so = src.toObject();
  const { drop } = edhaAdvSyncPlan(actor.items.map(i => ({ id: i.id, name: i.name, flags: i.flags })), so.items);
  if (drop.length) await actor.deleteEmbeddedDocuments("Item", drop);
  if (so.items.length) await actor.createEmbeddedDocuments("Item", so.items, { keepId: true });
  // Wholesale replace = fresh-drag parity (importFromJSON semantics, minus name/folder/ownership).
  await actor.update({ img: so.img, system: so.system, prototypeToken: so.prototypeToken }, { recursive: false, diff: false });
  await actor.update({ "flags.edha-content": so.flags?.["edha-content"] ?? {} });
  const proto = so.prototypeToken ?? {};
  let tokens = 0;
  for (const scene of game.scenes ?? []) {
    const updates = (scene.tokens ?? []).filter(t => t.actorId === actor.id).map(t => ({
      _id: t.id,
      texture: foundry.utils.deepClone(proto.texture),
      sight: foundry.utils.deepClone(proto.sight),
      disposition: proto.disposition, displayName: proto.displayName, displayBars: proto.displayBars,
      bar1: foundry.utils.deepClone(proto.bar1), bar2: foundry.utils.deepClone(proto.bar2),
      width: proto.width, height: proto.height,
    }));
    if (updates.length) { await scene.updateEmbeddedDocuments("Token", updates); tokens += updates.length; }
  }
  return { synced: true, name: actor.name, items: so.items.length, dropped: drop.length, tokens };
}

async function edhaSyncAllAdversaries() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: adversary sync is GM-only."); return null; }
  if (!game.packs?.get(EDHA_ADV_PACK_ID)) { ui.notifications?.warn("Edha: the edha-adversaries pack was not found."); return null; }
  const synced = [], skipped = [], missing = [];
  for (const a of (game.actors?.filter(a => a.type === "adversary") ?? [])) {
    const src = await edhaAdvSrcFor(a);
    if (!src) { missing.push(a.name); continue; }
    if (src.name !== a.name) { skipped.push(`${a.name} (source: ${src.name})`); continue; }   // renamed = customized variant — sheet button syncs it explicitly
    const r = await edhaSyncAdversaryActor(a, src);
    if (r?.synced) synced.push(`${a.name} (${r.items} items${r.tokens ? `, ${r.tokens} token${r.tokens === 1 ? "" : "s"}` : ""})`);
  }
  console.log("Edha Content | adversary sync:", { synced, skipped, missing });
  ui.notifications?.info(
    `Edha: synced ${synced.length} adversar${synced.length === 1 ? "y" : "ies"} from the pack` +
    (skipped.length ? `, skipped ${skipped.length} renamed` : "") +
    (missing.length ? `, ${missing.length} with no pack source` : "") + " (details in console)."
  );
  return { synced, skipped, missing };
}

// GM button on the adversary sheet (the system's sheet class IS `AdversarySheet` — Ben's 07-12
// console evidence — so AppV2 fires renderAdversarySheet; ⚑ bench-verify the injection point).
Hooks.on("renderAdversarySheet", (app, element) => {
  try {
    if (!game.user?.isGM) return;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    let actor = app?.actor;
    if (!root || !actor || actor.type !== "adversary" || actor.pack) return;
    if (actor.isToken) actor = game.actors?.get(actor.token?.actorId) ?? null;   // sync the BASE — the token re-derives through its delta
    if (!actor) return;
    root.querySelector(".edha-adv-sync-bar")?.remove();
    const bar = document.createElement("div");
    bar.className = "edha-adv-sync-bar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn";
    btn.textContent = "⟳ Sync from Pack";
    btn.title = "Re-pull this adversary from the edha-adversaries compendium (stats, abilities, token settings) — replaces the post-deploy re-drag. Placed tokens keep position and HP.";
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      btn.disabled = true;
      Promise.resolve(edhaSyncAdversaryActor(actor)).then((r) => {
        btn.disabled = false;
        if (r?.synced) { ui.notifications?.info(`Edha: ${r.name} synced from the pack (${r.items} items, ${r.tokens} placed token${r.tokens === 1 ? "" : "s"}).`); app.render(false); }
        else if (r) ui.notifications?.warn(`Edha: ${r.name} — ${r.reason}.`);
      }).catch((e) => { btn.disabled = false; console.error("Edha Content | adversary sync failed", e); });
    });
    bar.appendChild(btn);
    const sheetHeader = root.querySelector(".sheet-header");
    if (sheetHeader) sheetHeader.after(bar);
    else (root.querySelector(".sheet-content") ?? root).prepend(bar);
  } catch (e) { console.error("Edha Content | adversary sync button failed", e); }
});

// GM bulk button in the Actors sidebar footer — the ONE post-deploy click that replaces the
// re-drag list.
Hooks.on("renderActorDirectory", (app, element) => {
  try {
    if (!game.user?.isGM) return;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    if (!root || root.querySelector(".edha-adv-sync-all-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn edha-adv-sync-all-btn";
    btn.textContent = "⟳ Sync Adversaries from Pack";
    btn.title = "After a deploy: re-pull every world adversary (and its placed tokens) from the rebuilt edha-adversaries pack — replaces re-dragging them. Renamed copies are skipped; sync those from their own sheet.";
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      btn.disabled = true;
      Promise.resolve(edhaSyncAllAdversaries()).finally(() => { btn.disabled = false; });
    });
    (root.querySelector(".directory-footer") ?? root).append(btn);
  } catch (e) { console.error("Edha Content | adversary sync-all button failed", e); }
});

/* --- K: Edha-custom Temporary HP ---------------------------------------------------------------
 * House rules: only ONE source of Temp HP at a time (a new grant OVERWRITES the old, even if
 * smaller); incoming damage is removed from Temp HP BEFORE normal HP; Temp HP cannot be healed,
 * only replaced or spent. Stored on the actor as flags.edha-content.tempHp = {value, source}.
 *
 * Absorption hooks the system's cancelable `cosmere-rpg.preApplyDamage(actor, damage)`. The system
 * passes `damage` BY REFERENCE and, right after the hook, applies `damage.calculated` to health —
 * so reducing it here makes Temp HP soak first. Healing arrives as calculated <= 0 and is ignored,
 * so Temp HP is never replenished by healing.
 *
 * Granting is auto-on-use: a talent's own `edha-temp-hp` rule (Events tab) rolls its formula on use
 * and sets the result as the target's Temp HP (native executor below).
 */
function edhaGetTempHp(actor) {
  const t = actor?.flags?.["edha-content"]?.tempHp;
  if (!t) return null;
  const value = Math.max(0, Math.floor(Number(t.value) || 0));
  return value > 0 ? { value, source: t.source || "" } : null;
}
async function edhaWriteTempHp(actor, value, source) {
  if (!actor) return 0;
  value = Math.max(0, Math.floor(Number(value) || 0));
  try {
    if (value <= 0) await actor.unsetFlag("edha-content", "tempHp");
    else await actor.setFlag("edha-content", "tempHp", { value, source: source || "" });
  } catch (e) { console.error("Edha Content | Temp HP write failed", e); }
  return value;
}
// Public: set (replace) an actor's Temp HP — overwrites any existing source.
async function edhaSetTempHp(actor, amount, source) {
  const v = await edhaWriteTempHp(actor, amount, source);
  ui.notifications?.info(`Edha: ${actor?.name ?? "actor"} now has ${v} Temp HP${source ? ` (${source})` : ""}.`);
  return v;
}

// Absorption — damage hits Temp HP before normal HP. Do NOT return false (let the remainder through).
Hooks.on("cosmere-rpg.preApplyDamage", (actor, damage) => {
  try {
    const thp = edhaGetTempHp(actor);
    if (!thp) return;
    const incoming = Number(damage?.calculated) || 0;
    if (incoming <= 0) return;                       // healing / zero never touches Temp HP
    const absorbed = Math.min(thp.value, incoming);
    damage.calculated = incoming - absorbed;          // by reference → system applies the remainder
    const left = thp.value - absorbed;
    const toHp = incoming - absorbed;
    void edhaWriteTempHp(actor, left, thp.source);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-thp-msg"><strong>${actor.name}</strong>'s Temp HP absorbs <strong>${absorbed}</strong> of ${incoming} damage` +
               (toHp > 0 ? ` — <strong>${toHp}</strong> carries through to HP` : "") +
               (left > 0 ? ` · ${left} Temp HP left.</div>` : ` · Temp HP depleted.</div>`),
    });
  } catch (e) { console.error("Edha Content | Temp HP absorption failed", e); }
});

// Auto-apply: when a registered THP talent is used, roll its formula and set the target's Temp HP.
function edhaThpTarget(item, mode) {
  if (mode === "self") return { actor: item.actor ?? null, via: "self" };
  const targeted = Array.from(game.user?.targets ?? []);
  if (targeted[0]?.actor) return { actor: targeted[0].actor, via: "target" };
  const sel = canvas?.tokens?.controlled?.[0]?.actor;
  if (sel && sel !== item.actor) return { actor: sel, via: "selected token" };
  return { actor: item.actor ?? null, via: "caster (no target)" };
}
/* --- L: Summon tokens -------------------------------------------------------------------------
 * A talent's own `edha-summon` rule (Events tab) spawns an `adversary` token on the scene, scaled
 * to the caster: HP = a rolled formula, defenses = caster − penalty, a baked melee attack, speed,
 * and condition immunities (only those the system knows). One fresh actor per summon (organized in
 * an "Edha Summons" folder), auto-deleted when its last token is removed. GM-side (actor creation
 * needs create permission); player-triggered summons would need a GM relay (future).
 */
async function edhaSummonFolder() {
  let f = game.folders?.find(x => x.type === "Actor" && x.name === "Edha Summons");
  if (!f) { try { f = await Folder.create({ name: "Edha Summons", type: "Actor" }); } catch (e) { /* perms */ } }
  return f ?? null;
}

// Summon a spec-defined creature. The spec is baked ENTIRELY owner-side (HP rolled, formulas
// resolved vs the caster, ownership stamped incl. the summoning user); document creation runs
// directly when this user can create actors, else via the `summon-actor` GM relay (shared
// primitive, backlog 9a — mirrors burst-apply/place-hazard-region), so a player without
// ACTOR_CREATE gets a real token instead of a warn.
async function edhaSummon(caster, spec) {
  try {
    if (!caster || !spec) return null;
    const scene = canvas?.scene;
    if (!scene) { ui.notifications?.warn("Edha: no active scene to summon onto."); return null; }
    const rollData = caster.getRollData();
    const hpRoll = await (new Roll(spec.hpFormula || "(@tier)d6", rollData)).evaluate();
    const hp = Math.max(1, hpRoll.total);
    const atk = spec.attack || {};
    const atkFormula = atk.damageFormula ? Roll.replaceFormulaData(atk.damageFormula, rollData, { missing: "0" }) : null;
    const pen = Number(spec.defensePenalty) || 0;
    const dval = (k) => Math.max(0, (caster.system?.defenses?.[k]?.value ?? 0) - pen);
    const cond = {}; const skipped = [];
    for (const c of (spec.conditionImmunities || [])) {
      if (CONFIG.COSMERE?.statuses?.[c]) cond[c] = true; else skipped.push(c);
    }
    const ov = (n) => ({ override: n, useOverride: true });
    // (The "Edha Summons" folder is resolved in edhaSummonCreateGM — players can't create folders.)
    // Explicit ownership: copy the caster's player-owner entries (plus the summoning user) so the
    // player can move the token, see the combat-tracker Activate button (requires combatant.isOwner),
    // and roll the summon's items immediately — no relog needed (2026-06-11 playtest: Forgemaster).
    const ownership = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
    for (const [uid, lvl] of Object.entries(caster.ownership ?? {})) {
      if (uid !== "default" && lvl >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ownership[uid] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    }
    if (game.user?.id) ownership[game.user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    const tokSq = spec.tokenSizeFt ? Math.max(1, Math.round(Number(spec.tokenSizeFt) / (scene.grid?.distance || 5))) : null;
    const actorData = {
      name: `${spec.name} (${caster.name})`,
      type: "adversary",
      ownership,
      img: spec.img,
      folder: null,
      // displayName: summons hover-show their name like every built token (bench 07-17: the Seeming
      // copy showed NO name on hover — the unset field defaults to NONE). Adversary-standard
      // OWNER_HOVER (20) unless the spec overrides (phantom copies inherit the duplicated token's
      // mode so the copy reads exactly like the real one).
      prototypeToken: { name: spec.tokenName ?? spec.name, actorLink: true, displayName: Number.isFinite(Number(spec.displayName)) ? Number(spec.displayName) : (CONST.TOKEN_DISPLAY_MODES?.OWNER_HOVER ?? 20), disposition: spec.disposition ?? CONST.TOKEN_DISPOSITIONS.FRIENDLY, texture: { src: spec.img }, ...(tokSq ? { width: tokSq, height: tokSq } : {}) },
      system: {
        tier: caster.system?.tier ?? 1,
        resources: { hea: { value: hp, max: ov(hp) } },
        defenses: { phy: ov(dval("phy")), cog: ov(dval("cog")), spi: ov(dval("spi")) },
        movement: { walk: { rate: ov(Number(spec.speed) || 25) } },
        // Attack competence: the summon rolls its OWN tests (Construct Slam was damage-only at the
        // 2026-06-11 playtest). Rank scales with the caster's tier; str attribute backs the test.
        skills: { ath: { rank: Math.min(5, Math.max(1, Number(caster.system?.tier) || 1)) } },
        ...(Number(spec.deflect) > 0 ? { deflect: { override: Number(spec.deflect), useOverride: true, source: "armor",
          types: { energy: true, impact: true, keen: true, spirit: false, vital: false, heal: false } } } : {}),
        immunities: { condition: cond },
        description: { value: `<p>Summoned by ${caster.name}.</p>` + (skipped.length ? `<p>Also immune to: ${skipped.join(", ")} (tracked manually — not native conditions).</p>` : "") },
      },
      items: [
        ...(atkFormula ? [{
          name: atk.name || "Attack",
          type: "action",
          img: spec.img,
          flags: { "edha-content": { attackKind: atk.range === "ranged" ? "ranged" : "melee" } },   // read by edhaAttackKind
          system: {
            description: { value: `<p>${atk.range === "ranged" ? "Ranged" : "Melee"} attack — ${atk.damageType || "keen"} damage. Rolls Athletics vs the target's Physical defense.</p>` },
            // skill_test → use() rolls a d20 Athletics test (+ rank from tier) alongside the damage,
            // instead of bare damage with no to-hit (Construct Slam fix, 2026-06-11 playtest).
            activation: { type: "skill_test", cost: { value: 1, type: "act" }, skill: atk.skill || "ath", attribute: "str" },
            damage: { formula: atkFormula, type: atk.damageType || "keen" },
          },
        }] : []),
        // Extra baked items (e.g. Siege Form's ranged attack) — damage formulas resolved vs the caster.
        // A damage-bearing extra item is an ATTACK: build it like the primary (skill_test rolls a d20
        // Athletics to-hit alongside the damage) so it isn't a no-roll utility (07-17 playtest: Siege
        // Cannon rolled no to-hit at all, unlike Construct Slam). The native target+auto-test-defense
        // flow still rides the weapon migration (Ben 07-17); this only brings the die to parity.
        ...((spec.extraItems || []).map(x => {
          const isAtk = !!x.damageFormula;
          const ranged = x.range === "ranged" || /\branged\b/i.test(x.description || "");
          // attackKind → read by edhaAttackKind; requiresSummonEffect → the mode gate below
          // (bench 07-17: Siege Cannon fired with Siege Form toggled OFF).
          const xFlags = {
            ...(isAtk ? { attackKind: ranged ? "ranged" : "melee" } : {}),
            ...(x.requiresEffect ? { requiresSummonEffect: x.requiresEffect } : {}),
          };
          return {
            name: x.name || "Ability", type: x.type || "action", img: x.img || spec.img,
            ...(Object.keys(xFlags).length ? { flags: { "edha-content": xFlags } } : {}),
            system: {
              description: { value: x.description || "" },
              activation: isAtk
                ? { type: "skill_test", cost: { value: Number(x.actions) || 1, type: "act" }, skill: x.skill || "ath", attribute: x.attribute || "str" }
                : { type: "utility", cost: { value: Number(x.actions) || 1, type: "act" } },
              damage: x.damageFormula ? { formula: Roll.replaceFormulaData(x.damageFormula, rollData, { missing: "0" }), type: x.damageType || "keen" } : { formula: null, type: null },
            },
          };
        })),
      ],
      // Baked toggled-off ActiveEffects (e.g. "Siege Form": Speed 0 + extra deflect) — the player
      // toggles them on the summon's sheet when the mode is active.
      effects: (spec.bakedEffects || []).map(e => ({
        name: e.label || e.name || "Effect", img: e.icon || e.img || "icons/svg/upgrade.svg",
        type: "base", disabled: e.disabled !== false, transfer: true,
        changes: (e.changes || []).map(c => ({ key: c.key, mode: c.mode ?? 2, value: String(c.value ?? "") })),
        description: e.description || "", statuses: [],
        flags: { "edha-content": { summonEffect: true } },
      })),
      flags: { "edha-content": { summon: true, summoner: caster.id, ...(spec.extraFlags || {}) } },
    };
    const ct = spec.anchorTok ?? caster.getActiveTokens?.()[0];   // anchorTok: place beside a token other than the caster's (Phantom Double of an ally)
    const gs = scene.grid?.size ?? 100;
    const payload = {
      actorData, sceneId: scene.id,
      x: ct ? ct.document.x + gs : Math.round((canvas?.dimensions?.sceneWidth ?? 1000) / 2),
      y: ct ? ct.document.y : Math.round((canvas?.dimensions?.sceneHeight ?? 1000) / 2),
      casterId: caster.id, actsAfterCaster: !!spec.actsAfterCaster,
      cardHtml: `<p><strong>${caster.name}</strong> summons <strong>${spec.name}</strong> — HP ${hp}, defenses ${dval("phy")}/${dval("cog")}/${dval("spi")}` +
                (atkFormula ? `, ${atk.name || "attack"} ${atkFormula} ${atk.damageType || "keen"}` : "") + `.</p>`,
    };
    if (game.user?.can("ACTOR_CREATE")) return await edhaSummonCreateGM(payload);
    if (game.users?.activeGM) {
      game.socket.emit("module.edha-content", { action: "summon-actor", payload });
      ui.notifications?.info(`Edha: ${spec.name} — summon relayed to the GM.`);
      return null;   // the documents materialize on the GM client; callers don't use the return
    }
    ui.notifications?.warn(`Edha: summoning ${spec.name} needs a GM online (you lack actor-create permission).`);
    return null;
  } catch (e) {
    console.error("Edha Content | summon failed", e);
    ui.notifications?.error(`Edha: summon failed — ${e.message}`);
    return null;
  }
}
// The create half of edhaSummon — runs wherever document creation is possible: directly on an
// owner with ACTOR_CREATE, or on the primary GM via the `summon-actor` relay. The payload arrives
// fully baked; nothing here re-rolls or re-resolves against the caster.
async function edhaSummonCreateGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId) ?? canvas?.scene;
    if (!scene || !p?.actorData) return null;
    p.actorData.folder = (await edhaSummonFolder())?.id ?? null;
    const summon = await Actor.create(p.actorData);
    if (!summon) return null;
    const tdoc = await summon.getTokenDocument({ x: p.x, y: p.y });
    const [newToken] = await scene.createEmbeddedDocuments("Token", [tdoc.toObject()]);
    if (p.actsAfterCaster && game.combat && newToken) {
      const cc = game.combat.combatants.find(c => c.actorId === p.casterId);
      try {
        await game.combat.createEmbeddedDocuments("Combatant", [{ tokenId: newToken.id, sceneId: scene.id, actorId: summon.id, initiative: cc?.initiative ?? null }]);
      } catch (e) { /* no combat or perms */ }
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: game.actors?.get(p.casterId) ?? null }), content: p.cardHtml });
    return summon;
  } catch (e) {
    console.error("Edha Content | summon create failed", e);
    ui.notifications?.error(`Edha: summon failed — ${e.message}`);
    return null;
  }
}

// Cleanup: when a summon's last token is removed, delete its one-off actor.
Hooks.on("deleteToken", async (tokenDoc) => {
  try {
    if (!game.user?.isGM) return;
    const actor = game.actors?.get(tokenDoc.actorId);
    if (!actor?.getFlag?.("edha-content", "summon")) return;
    const stillUsed = (game.scenes ?? []).some(sc => sc.tokens.some(t => t.actorId === actor.id && t.id !== tokenDoc.id));
    if (!stillUsed) await actor.delete();
  } catch (e) { console.error("Edha Content | summon cleanup failed", e); }
});

/* --- Mode-gated summon items (REUSABLE primitive, bench 07-17) --------------------------------------
 * An extra baked item whose spec carries `requiresEffect: "<baked effect name>"` can only be used
 * while that summonEffect is toggled ON (first consumer: Siege Cannon requires Siege Form — Ben:
 * "i was able to use siege cannon with the siege form toggled off"). The builder stamps the flag;
 * the NAME SHIM below covers constructs summoned from talent specs authored before the flag
 * existed, so the gate is live on relaunch + re-summon with no deity rebuild / ⟳ Sync. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor;
    if (!actor?.getFlag?.("edha-content", "summon")) return;
    const req = item.getFlag?.("edha-content", "requiresSummonEffect")
      ?? (/^Siege Cannon/.test(item.name || "") ? "Siege Form" : null);   // name shim (pre-flag specs)
    if (!req) return;
    const eff = actor.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === req);
    if (!eff || eff.disabled) {
      ui.notifications?.warn(`Edha: ${item.name} needs ${req} active — toggle it on first. Nothing spent.`);
      return false;
    }
  } catch (e) { console.error("Edha Content | summon mode gate failed", e); }
});

/* --- Injury tool (shared primitive, backlog 9a): create an injury Item, rolled or typed -------------
 * Creation is the inverse of the Reknit delete-item relay: owner-side create when we own the target,
 * else the `create-item` GM relay. Type picking: a RollTable named like "Injuries" wins when one
 * exists (world tables first, then compendia) so the table CONTENT stays a GM design call; else the
 * EDHA_INJURY_FALLBACK list — PLACEHOLDER CONTENT (Ben-approved default, 2026-07-04): six generic
 * entries keyed by damage type. Creating a world RollTable named "Injuries" replaces the list
 * without touching the engine. Consumers: Death/Raise Dead (+1 injury), Life/Apex Form (Injury when
 * it ends — the edhaClearLifeState scene-clear). */
const EDHA_INJURY_FALLBACK = [
  { type: "keen",   name: "Deep Laceration" },
  { type: "impact", name: "Broken Bones" },
  { type: "energy", name: "Severe Burns" },
  { type: "spirit", name: "Spiritual Fracture" },
  { type: "vital",  name: "Necrotic Scarring" },
  { type: null,     name: "Lingering Wound" },   // no/unknown damage type
];
async function edhaFindInjuryTable() {
  try {
    const world = game.tables?.find(t => /injur/i.test(t.name || ""));
    if (world) return world;
    for (const pack of (game.packs ?? [])) {
      if (pack.documentName !== "RollTable") continue;
      const idx = await pack.getIndex();
      const hit = idx.find(e => /injur/i.test(e.name || ""));
      if (hit) return await pack.getDocument(hit._id);
    }
  } catch (e) { /* no tables — fall back */ }
  return null;
}
// The create half — retried bare on schema drift (the injury system schema is unverified until bench).
async function edhaCreateItemDocs(actor, itemData) {
  try { await actor.createEmbeddedDocuments("Item", [itemData]); return true; }
  catch (e) {
    try { await actor.createEmbeddedDocuments("Item", [{ name: itemData.name, type: itemData.type }]); return true; }
    catch (e2) { console.error("Edha Content | item create failed", e2); return false; }
  }
}
async function edhaCreateItemCross(actor, itemData) {
  if (!actor || !itemData) return false;
  if (actor.isOwner) return edhaCreateItemDocs(actor, itemData);
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to add ${itemData.name}.`); return false; }
  try { game.socket.emit("module.edha-content", { action: "create-item", payload: { actorUuid: actor.uuid, itemData } }); return true; } catch (e) { return false; }
}
// Add ONE injury Item to `target`; returns the injury's name (for cards) or null.
async function edhaAddInjury(target, { source = "Injury", damageType = null } = {}) {
  try {
    if (!target) return null;
    let name = null, note = "";
    const table = await edhaFindInjuryTable();
    if (table) {
      const { results } = await table.roll();
      const r = results?.[0];
      const raw = r?.description ?? r?.text ?? r?.name ?? "";
      name = String(raw).replace(/<[^>]*>/g, "").trim() || null;
      if (name) note = ` (rolled on "${table.name}")`;
    }
    if (!name) {
      name = (EDHA_INJURY_FALLBACK.find(e => e.type === damageType) ?? EDHA_INJURY_FALLBACK[EDHA_INJURY_FALLBACK.length - 1]).name;
      note = ` (placeholder — create a world RollTable named "Injuries" to replace the built-in list)`;
    }
    const itemData = {
      name, type: "injury", img: "icons/skills/wounds/injury-triple-slash-bleed.webp",
      system: { description: { value: `<p>Inflicted by <strong>${source}</strong>${note}. Duration/severity per the injuries rules — GM adjudicates.</p>` } },
    };
    return (await edhaCreateItemCross(target, itemData)) ? name : null;
  } catch (e) { console.error("Edha Content | add injury failed", e); return null; }
}

/* --- TRIGGERED talent effects ------------------------------------------------------------------
 * A talent's own `edha-triggered-effect` rule (Events tab) fires a secondary effect on a combat
 * event: `edha-deal-damage` (any of your items rolled damage) or `edha-on-defeat` (a creature you
 * damaged dropped to 0 HP) — both dispatched NATIVELY by the system's event engine.
 * Effects (kind): damage / damage-aoe (actor.applyDamage), heal (+ optional resourceGain), thp
 * (edhaWriteTempHp), affliction (toggle the 'afflicted' status + chat the ongoing amount).
 * Optional costs post a chat-card button (canvas stays clickable for targeting). oncePerRound
 * is tracked per combat round. A re-entrancy guard stops a trigger's own damage from chaining kills.
 */
let _edhaInTrigger = false;   // re-entrancy guard: true while resolving any trigger effect
// Optional-cost trigger cards (native + legacy) stash their resolved spec here, keyed by a per-card
// id embedded in the button, so the click handler fires the exact rule that posted it.
const EDHA_TRIG_PENDING = {};

const EDHA_RES_LABEL = { inv: "Investiture", foc: "Focus", opportunity: "an Opportunity" };

// Is this item a talent for ownership/behavior purposes? PC talents are `talent`-type; adversary
// tree-talent embeds are ACTION-TYPED TWINS (the adversary sheet only renders trait/weapon/action
// sections) carrying `flags.edha-content.adversaryTalent` — the W23 pipe-cleaner fallback (2026-07-14).
// NOT used by edhaCountTalents: embedded twins never count toward a PC talent budget.
function edhaIsTalent(i) {
  return i?.type === "talent" || i?.flags?.["edha-content"]?.adversaryTalent === true;   // type-strict: the predicate itself
}
function edhaOwnsTalent(actor, name) {
  return !!actor?.items?.some(i => edhaIsTalent(i) && i.name === name);
}
function edhaResVal(res) { return (res && typeof res.max === "object") ? res.max.value : res?.max; }

function edhaTriggerAllowed(owner, name, spec) {
  if (!spec.oncePerRound) return true;
  const round = game.combat?.round;
  if (round == null) return true;                                   // no combat → unrestricted
  return owner.getFlag?.("edha-content", "trigRound")?.[name] !== round;
}
async function edhaMarkTriggerUsed(owner, name, spec) {
  if (!spec.oncePerRound) return;
  const round = game.combat?.round;
  if (round == null) return;
  const tr = foundry.utils.deepClone(owner.getFlag("edha-content", "trigRound") ?? {});
  tr[name] = round;
  try { await owner.setFlag("edha-content", "trigRound", tr); } catch (e) { /* perms */ }
}

// Yes/No prompt for an optional cost; best-effort deduct inv/foc; opportunity is trusted (player pays).
async function edhaResolveCost(owner, name, spec) {
  const cost = spec.cost;
  if (!cost) return true;
  if (cost.optional) {
    let ok = false;
    try {
      ok = await foundry.applications.api.DialogV2.confirm({
        window: { title: `${name} — Triggered Effect` },
        content: `<p>You may spend <strong>${cost.value} ${EDHA_RES_LABEL[cost.resource] || cost.resource}</strong> for <strong>${name}</strong>.</p>`
               + `<p style="opacity:.8">Target the secondary creature now (the canvas stays clickable), then choose Yes.</p>`
               + (spec.note ? `<p style="opacity:.8">${spec.note}</p>` : ""),
        modal: false, rejectClose: false,        // NON-modal so you can re-target on the canvas while it's open
      });
    } catch (e) { ok = false; }
    if (!ok) return false;
  }
  if (cost.resource === "inv" || cost.resource === "foc") {
    const res = owner.system?.resources?.[cost.resource];
    const cur = res?.value ?? 0;
    if (cur < cost.value) ui.notifications?.warn(`Edha: ${owner.name} lacks ${cost.value} ${EDHA_RES_LABEL[cost.resource]} for ${name} (proceeding anyway).`);
    try { await owner.update({ [`system.resources.${cost.resource}.value`]: Math.max(0, cur - cost.value) }); } catch (e) { /* perms */ }
  }
  return true;
}

// Tokens within `ft` of a center token (Euclidean on centers → grid distance).
function edhaTokensWithin(centerTok, ft) {
  const scene = centerTok?.scene ?? canvas?.scene;
  const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  const cx = centerTok.center?.x, cy = centerTok.center?.y;
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (t.id === centerTok.id || !t.actor) return false;
    const px = Math.hypot((t.center?.x ?? 0) - cx, (t.center?.y ?? 0) - cy);
    return (px / gs * gd) <= ft;
  });
}

// Illumination test (Ben 07-16c — supersedes ruling R4's "darkness stays GM-judged" clause; the
// rules text is unchanged and saved: Character_Building_Rules.md §Senses Range): is this scene
// point LIT? Lit = scene daylight (global light enabled and darkness at/below its threshold, or
// darkness < 0.5 with no global-light config) OR inside any active light source's polygon (ambient
// lights + token emitters). Fails open (lit) — a missing lighting backend must never blind a
// talent. ⚑ bench: the 0.5 daylight threshold is a feel dial.
function edhaPointIlluminated(x, y) {
  try {
    const env = canvas?.scene?.environment;
    const darkness = Number(canvas?.environment?.darknessLevel ?? env?.darknessLevel ?? 0);
    const gl = env?.globalLight;
    if (gl?.enabled && darkness <= Number(gl.darkness?.max ?? 1)) return true;
    if (darkness < 0.5) return true;   // bright scene = daylight, assumed seen
    for (const src of (canvas?.effects?.lightSources ?? [])) {
      if (src?.active === false) continue;
      if (src?.shape?.contains?.(x, y)) return true;
    }
    return false;
  } catch (e) { return true; }
}
// Senses Range in ft (Character_Building_Rules.md §Senses Range): the system's derived value when
// present, else the AWA table — 0→10, 1→15, 2–3→20, 4→25, 5+→30. Pure table pinned in tests/.
function edhaSensesRangeFtFromAwa(awa) {
  const a = Number(awa) || 0;
  return a >= 5 ? 30 : a === 4 ? 25 : a >= 2 ? 20 : a === 1 ? 15 : 10;
}
function edhaSensesRangeFt(actor) {
  const s = actor?.system?.senses?.range;
  const v = (s && typeof s === "object") ? Number(s.value ?? s.override) : Number(s);
  if (Number.isFinite(v) && v > 0) return v;
  return edhaSensesRangeFtFromAwa(actor?.system?.attributes?.awa?.value);
}

// Line of sight (shared primitive): can `viewer` (token) see `target` (token)? A hidden target is
// never seen; a sight-blocking-wall ray between centers decides; and (Ben 07-16c) a target standing
// in DARKNESS is seen only within the viewer's Senses Range — "in daylight, it is assumed you can
// see; if it is dark, you see to your Senses Range (derived from Awareness)". Deliberately NOT the
// native canvas.visibility.testVisibility — that answers only for the CURRENT user's vision sources,
// and consumers (Lawkeeper's Eye) run on the ATTACKER's client asking about the OWNER's view; the
// wall ray + light polygons are deterministic on every client. Fails open (true) — vision-less
// tokens, no scene, or a missing backend must never silently disable a talent.
function edhaCanSee(viewer, target) {
  try {
    const vt = viewer?.center ? viewer : viewer?.object ?? null;
    const tt = target?.center ? target : target?.object ?? null;
    if (!vt?.center || !tt?.center) return true;
    if (tt.document?.hidden) {
      if (edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${tt.name ?? "target"} is GM-HIDDEN → unseen (right-click the token → toggle visibility if that's stale)`);
      return false;
    }
    // Darkness gate (07-16c): unlit target → the viewer's Senses Range is the sight limit.
    if (!edhaPointIlluminated(tt.center.x, tt.center.y)) {
      const ft = edhaSensesRangeFt(vt.actor);
      if (edhaTokenGapFt(vt, tt) > ft) {
        if (edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${tt.name ?? "target"} is in darkness beyond ${vt.name ?? "viewer"}'s Senses Range (${ft} ft) → unseen`);
        return false;
      }
    }
    // v13 gotcha (bench-probed 07-12): a "sight"-type collision test ALSO collides with darkness-
    // source edges and the scene-border rectangle unless told otherwise — the darkness EDGE ruling
    // is unchanged (darkness handled by the gate above, not by edges; the scene border is not a
    // wall), so both stay excluded here.
    const hit = CONFIG.Canvas?.polygonBackends?.sight?.testCollision?.(vt.center, tt.center,
      { type: "sight", mode: "any", edgeOptions: { darkness: false, innerBounds: false } });
    if (hit && edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${vt.name ?? "viewer"} → ${tt.name ?? "target"} blocked by a sight wall`);
    return !hit;
  } catch (e) { return true; }
}

/* --- Dark-veil sweep (07-16c, Veil — the A1 ruling): while the owner's token stands UNLIT, its
 * named marker AE auto-enables; re-lit → auto-disables ONLY what the engine enabled (flagged
 * autoVeil — a GM's manual cover toggle is never fought; cover stays a table read, light is data).
 * Generic handler `edha-dark-veil` {effectName}; debounced GM-side on token moves + lighting. */
let _edhaDarkVeilTimer = null;
function edhaDarkVeilSoon() { try { clearTimeout(_edhaDarkVeilTimer); _edhaDarkVeilTimer = setTimeout(() => { void edhaDarkVeilSweep(); }, 300); } catch (e) {} }
async function edhaDarkVeilSweep() {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one applier
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      for (const tal of (a.items ?? [])) {
        if (!edhaIsTalent(tal)) continue;
        for (const rule of edhaEventRules(tal)) {
          const h = rule?.handler;
          if (h?.type !== "edha-dark-veil") continue;
          const effName = h.effectName || tal.name;
          const eff = [...(a.effects ?? [])].find(e => String(e.name || e.label || "").startsWith(effName));
          if (!eff) continue;
          const unlit = !edhaPointIlluminated(tok.center.x, tok.center.y);
          if (unlit && eff.disabled) {
            await eff.update({ disabled: false, "flags.edha-content.autoVeil": true });
            ChatMessage.create({ whisper: (game.users?.filter(u => u.active && u.isGM) ?? []).map(u => u.id), content: `<p>🌒 <strong>${tal.name}</strong>: ${tok.name} stands in darkness — the marker is ON (auto).</p>` });
          } else if (!unlit && !eff.disabled && eff.getFlag?.("edha-content", "autoVeil")) {
            await eff.update({ disabled: true, "flags.edha-content.autoVeil": false });
          }
        }
      }
    }
  } catch (e) { console.error("Edha Content | dark-veil sweep failed", e); }
}
Hooks.on("updateToken", (doc, changes) => { try { if ("x" in changes || "y" in changes) edhaDarkVeilSoon(); } catch (e) {} });
Hooks.on("updateScene", (scene, changes) => { try { if (changes.environment !== undefined || changes.darkness !== undefined) edhaDarkVeilSoon(); } catch (e) {} });
for (const h of ["createAmbientLight", "updateAmbientLight", "deleteAmbientLight"]) Hooks.on(h, () => edhaDarkVeilSoon());

// Sense-through-obstruction reveals (07-16c, the B5/B6 rulings): a client whose user owns Void
// Sense renders OMEN-bearing tokens through walls/fog; Reaper's Harvest owners render HARVESTED
// remains. Rides the phantom-veil Token#isVisible wrap (force-SHOW half). GM-hidden always stays
// hidden — a deliberate GM hide is never revealed; the GM client is untouched (sees all anyway).
const EDHA_SENSE_REVEALS = [
  { talent: "Void Sense", status: "omen" },
  { talent: "Reaper's Harvest", status: "harvested" },
];
function edhaSenseRevealShows(tok) {
  try {
    if (!canvas?.ready || game.user?.isGM) return false;
    const a = tok?.actor; if (!a || tok.document?.hidden) return false;
    for (const spec of EDHA_SENSE_REVEALS) {
      if (!a.statuses?.has?.(spec.status)) continue;
      for (const mine of (game.actors?.filter(x => x.testUserPermission?.(game.user, "OWNER")) ?? [])) {
        if (edhaOwnsTalent(mine, spec.talent)) return true;
      }
    }
    return false;
  } catch (e) { return false; }
}
// The marks appearing/leaving must re-evaluate every client's canvas.
for (const h of ["createActiveEffect", "deleteActiveEffect"]) Hooks.on(h, (eff) => {
  try {
    const ids = [...(eff?.statuses ?? [])];
    if (ids.some(s => EDHA_SENSE_REVEALS.some(r => r.status === s))) canvas?.perception?.update?.({ refreshVision: true });
  } catch (e) {}
});

// Resolve the actor list an effect lands on.
function edhaEffectTargets(owner, eff, ctx) {
  switch (eff.target) {
    case "self": return [owner];
    case "victim": case "triggering": return ctx.victim ? [ctx.victim] : [];
    case "near-victim": {
      const vtok = ctx.victim?.getActiveTokens?.()[0];
      if (!vtok) return [];
      return edhaTokensWithin(vtok, Number(eff.radius) || 5).map(t => t.actor).filter(a => a && a !== owner);
    }
    default: // "prompt" → your current targets
      return Array.from(game.user?.targets ?? []).map(t => t.actor).filter(Boolean);
  }
}

// Toggle a status on an actor, relaying to the GM when the local user lacks permission (player
// trigger vs a GM-owned enemy). Mirrors the burst-apply relay pattern.
async function edhaToggleStatus(actor, statusId, active = true) {
  try {
    if (actor.isOwner) { await actor.toggleStatusEffect?.(statusId, { active }); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to apply ${statusId}.`); return false; }
    game.socket.emit("module.edha-content", { action: "toggle-status", payload: { actorUuid: actor.uuid, statusId, active } });
    return true;
  } catch (e) { console.error("Edha Content | toggle status failed", e); return false; }
}

// Post an engine roll as a LABELED chat card. The system's chat template does not render a plain roll's
// `flavor`, which is why Predator's Due showed up as an anonymous die (Ben, 07-05) — so the label goes in
// the message CONTENT above the rendered dice: every engine card names its source talent and what it did.
async function edhaRollCard(owner, name, roll, text) {
  const speaker = ChatMessage.getSpeaker({ actor: owner });
  let dice = "";
  try { dice = await roll.render(); } catch (e) {}
  return ChatMessage.create({ speaker, rolls: [roll], sound: CONFIG.sounds?.dice, content: `<p>⚡ <strong>${name}</strong> (${owner.name}) — ${text}</p>${dice}` });
}
async function edhaRunTriggerEffect(owner, name, spec, ctx) {
  const eff = spec.effect; if (!eff) return;
  const rollData = owner.getRollData();
  // Fold BEFORE constructing: the rendered card's formula bar shows the Roll's own formula string, so
  // "(3)d(2 * 3 + 2)" must become "3d8" here — folding only the breakdown missed this surface (Ben 07-12,
  // Predator's Due; same family as the 07-05 roll-label fixes).
  const roll = await (new Roll(edhaFoldDieMath(Roll.replaceFormulaData(eff.formula || "0", rollData, { missing: "0" })))).evaluate();
  const amt = Math.max(0, Math.floor(roll.total));
  const speaker = ChatMessage.getSpeaker({ actor: owner });
  const rolled = (roll.dice?.length ?? 0) > 0;   // a flat "0" formula posts NO naked roll card (the 07-05 "blank card" bug)
  const gainNote = eff.resourceGain ? `${eff.resourceGain.value} ${EDHA_RES_LABEL[eff.resourceGain.resource] || eff.resourceGain.resource}` : "";

  if (eff.kind === "heal") {
    // target "victim"/"triggering" → heal the context creature (Mender's Instinct); default → owner.
    const healee = ((eff.target === "victim" || eff.target === "triggering") && ctx.victim) ? ctx.victim : owner;
    const hea = healee.system?.resources?.hea;
    const prevHealee = Number(hea?.value) || 0;
    const max = edhaResVal(hea) ?? (hea?.value ?? 0) + amt;
    if (amt > 0) {
      try { await healee.update({ "system.resources.hea.value": Math.min(max, (hea?.value ?? 0) + amt) }); }
      catch (e) { // no perms on the healee (another player's PC) → relay as a burst-style heal hit
        try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: healee.uuid, amount: amt, type: "heal", heal: true }] } }); } catch (e2) {}
      }
    }
    if (eff.resourceGain) {
      const r = eff.resourceGain, res = owner.system?.resources?.[r.resource];
      const rmax = edhaResVal(res) ?? (res?.value ?? 0) + r.value;
      try { await owner.update({ [`system.resources.${r.resource}.value`]: Math.min(rmax, (res?.value ?? 0) + r.value) }); } catch (e) {}
    }
    // Next-test modifier payoff (Flashpoint: advantage on your next Red test — ENFORCED 07-12; was a
    // "manual reminder" until the nextTestMod primitive was re-checked against it. Generic: any
    // trigger card can arm one).
    if (eff.nextTestMod) {
      try { await edhaSetNextTestMod(owner, { mode: eff.nextTestMod.mode || "advantage", count: 1, skill: eff.nextTestMod.skill || null, attr: eff.nextTestMod.attr || null, source: name }); } catch (e) {}
    }
    // The card says WHY it fired (Ben 07-12: "we should know why it's happening") — the rule's note.
    const why = spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : "";
    const what = [amt > 0 || !gainNote ? `${healee.name} regains <strong>${amt}</strong> health` : "", gainNote ? `${owner.name} regains <strong>${gainNote}</strong>` : ""].filter(Boolean).join("; ") + "." + why;
    if (rolled && amt > 0) await edhaRollCard(owner, name, roll, what);
    else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${what}</p>` });
    // Green / Restoration on-heal riders if this heal came from a Green talent (e.g. Mender's Instinct).
    const healTal = owner.items?.find?.(i => edhaIsTalent(i) && i.name === name);
    if (amt > 0 && healTal && edhaTalentColor(healTal) === "green") await edhaGreenHealRiders(owner, healee, amt, prevHealee);
    return;
  }
  if (eff.kind === "thp") {
    const tgt = edhaEffectTargets(owner, eff, ctx)[0] ?? owner;
    await edhaWriteTempHp(tgt, amt, name);
    if (rolled) await edhaRollCard(owner, name, roll, `${tgt.name} gains <strong>${amt}</strong> Temp HP.`);
    else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${tgt.name} gains <strong>${amt}</strong> Temp HP.</p>` });
    return;
  }
  let targets = edhaEffectTargets(owner, eff, ctx);
  if (spec.whenTargetIsolated) targets = targets.filter(a => edhaIsIsolated(a));   // state filter (Sapping Hex)
  if (eff.kind === "status") {
    // Apply an Edha/native status to each (state-filtered) target — e.g. Sapping Hex → Weakened.
    // statusExpire "owner"/"target" (07-16b) stamps timed expiry instead of a permanent toggle
    // (Frost Lance: Slowed until the end of the TARGET's next turn).
    if (!targets.length) { ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — no ${spec.whenTargetIsolated ? "Isolated " : ""}target to affect (target a token, then re-fire).</p>` }); return; }
    for (const a of targets) {
      if (eff.statusExpire) await edhaApplyTimedStatus(a, eff.statusId || "weakened", { owner, expire: eff.statusExpire });
      else await edhaToggleStatus(a, eff.statusId || "weakened", true);
    }
    if (spec.selfResourceGain) {   // e.g. the Hollow Command fallback card also pays Siphoned Will's focus
      const r = spec.selfResourceGain;
      if (r.resource === "foc") await edhaGainFocus(owner, r.value, name);
      else { const res = owner.system?.resources?.[r.resource]; const rmax = edhaResVal(res) ?? (res?.value ?? 0) + r.value; try { await owner.update({ [`system.resources.${r.resource}.value`]: Math.min(rmax, (res?.value ?? 0) + r.value) }); } catch (e) {} }
    }
    const label = game.i18n?.localize(EDHA_STATUSES[eff.statusId]?.label ?? CONFIG.COSMERE?.statuses?.[eff.statusId]?.label ?? eff.statusId) ?? eff.statusId;
    ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — ${targets.map(a => a.name).join(", ")} ${targets.length > 1 ? "are" : "is"} <strong>${label}</strong>${spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : ""}.</p>` });
    return;
  }
  if (eff.kind === "affliction") {
    for (const a of targets) {
      try { await a.toggleStatusEffect?.("afflicted", { active: true }); await edhaAddAffliction(a, amt, eff.damageType, name); } catch (e) {}
    }
    await edhaRollCard(owner, name, roll, `${targets.map(a => a.name).join(", ") || "(target a token)"} is <strong>Afflicted [${amt} ${eff.damageType}]</strong> — auto-deals at the start of its turns until the condition is removed.`);
    return;
  }
  // damage / damage-aoe — apply silently, post one combined message with the dice.
  for (const a of targets) { try { await a.applyDamage([{ amount: amt, type: eff.damageType }], { chatMessage: false }); } catch (e) { console.error("Edha Content | trigger applyDamage failed", e); } }
  await edhaRollCard(owner, name, roll, `<strong>${amt} ${eff.damageType}</strong> to ${targets.map(a => a.name).join(", ") || "(no target — target a token, then re-fire)"}.`);
}

// One owner × one trigger: gate (round + cost), mark, resolve (guarded against re-entrancy).
async function edhaFireTrigger(owner, name, spec, ctx) {
  if (!edhaTriggerAllowed(owner, name, spec)) return;
  if (!(await edhaResolveCost(owner, name, spec))) return;
  await edhaMarkTriggerUsed(owner, name, spec);
  _edhaInTrigger = true;
  try { await edhaRunTriggerEffect(owner, name, spec, ctx); }
  finally { _edhaInTrigger = false; }
}

// Post a clickable chat card for an optional-cost trigger (respects once-per-round before posting).
// A chat-card BUTTON is reliable: always visible in the log, never blocks canvas targeting (unlike a
// modal dialog), and can't render hidden behind a sheet (unlike a non-modal dialog).
function edhaPostTriggerCard(owner, name, spec, ctx) {
  try {
    if (!edhaTriggerAllowed(owner, name, spec)) return;
    const cost = spec.cost;
    const costLabel = cost ? `${cost.value} ${EDHA_RES_LABEL[cost.resource] || cost.resource}` : "";
    const pid = foundry.utils.randomID();
    EDHA_TRIG_PENDING[pid] = { spec, ctx: ctx || {} };
    // Ben pass 3 (07-12, Mender's Instinct): the card was wordy AND told you to target the creature
    // when the effect already knows its recipient (victim/self) — the instruction only appears when
    // the effect actually reads your user targets.
    const needsTargeting = !["victim", "triggering", "self"].includes(spec.effect?.target);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content:
        `<div class="edha-trigger-card">` +
        `<p>⚡ <strong>${name}</strong>${costLabel ? ` — <strong>${costLabel}</strong>` : ""}${spec.note ? ` <span style="opacity:.85;font-size:.9em">${spec.note}</span>` : ""}</p>` +
        (needsTargeting ? `<p style="opacity:.85;font-size:.9em">Target the creature on the canvas, then click below.</p>` : "") +
        `<button type="button" class="edha-trigger-btn" data-edha-name="${name}" data-edha-actor="${owner.uuid}" data-edha-spec="${pid}">Fire ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button>` +
        `</div>`,
    });
  } catch (e) { console.error("Edha Content | trigger card post failed", e); }
}
function edhaDeductCost(owner, cost) {
  if (!cost) return;
  if (cost.resource === "inv" || cost.resource === "foc") {
    const res = owner.system?.resources?.[cost.resource], cur = res?.value ?? 0;
    if (cur < cost.value) ui.notifications?.warn(`Edha: ${owner.name} lacks ${cost.value} ${EDHA_RES_LABEL[cost.resource]} (firing anyway).`);
    owner.update({ [`system.resources.${cost.resource}.value`]: Math.max(0, cur - cost.value) });
  }
  // opportunity: trusted (no auto-deduct)
}
async function edhaTriggerCardClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const name = btn.dataset.edhaName;
    const owner = await fromUuid(btn.dataset.edhaActor);
    const pending = EDHA_TRIG_PENDING[btn.dataset.edhaSpec];
    const spec = pending?.spec, ctx = pending?.ctx || {};
    if (!owner || !spec) return;
    if (!edhaTriggerAllowed(owner, name, spec)) { ui.notifications?.info(`${name} was already used this round.`); btn.disabled = true; return; }
    edhaDeductCost(owner, spec.cost);
    await edhaMarkTriggerUsed(owner, name, spec);
    _edhaInTrigger = true;
    try { await edhaRunTriggerEffect(owner, name, spec, ctx); } finally { _edhaInTrigger = false; }
    btn.disabled = true; btn.textContent = `${name} fired`;
    void edhaMarkCardResolved(edhaMessageIdOf(btn), `${name} fired ✓`);   // survives refresh (card-persistence family)
  } catch (e) { console.error("Edha Content | trigger card click failed", e); }
}
function edhaBindTriggerButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-trigger-btn").forEach(b => b.addEventListener("click", edhaTriggerCardClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindTriggerButtons(html));  // Foundry v13 (renderChatMessage is deprecated — single bind avoids double-fire)

/* --- Card-state persistence (REUSABLE, Ben pass 3 07-12) ------------------------------------------
 * Flame Surge's "Detonating…" reverted to a live "Detonate" button on refresh: one-shot chat-card
 * button state lived only in the DOM. A resolved card now stamps a flag ON THE MESSAGE; the render
 * hook below re-disables its buttons (relabeling the first) on every client, forever. Cards that are
 * MEANT to stay clickable (Trade Routes' once-per-turn Teleport, Puppeteer cues) simply never call it. */
async function edhaMarkCardResolved(messageId, label) {
  try {
    if (!messageId) return;
    const msg = game.messages?.get(messageId); if (!msg) return;
    if (msg.isAuthor || game.user?.isGM) await msg.setFlag("edha-content", "cardResolved", { label: label || "Resolved ✓" });
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "resolve-card", payload: { messageId, label } });
  } catch (e) {}
}
function edhaMessageIdOf(btn) { return btn?.closest?.("[data-message-id]")?.dataset?.messageId ?? null; }
Hooks.on("renderChatMessageHTML", (msg, html) => {
  try {
    const r = msg?.getFlag?.("edha-content", "cardResolved"); if (!r) return;
    const root = html instanceof HTMLElement ? html : html?.[0];
    const btns = root?.querySelectorAll?.("button") ?? [];
    btns.forEach(b => { b.disabled = true; });
    if (btns[0] && r.label) btns[0].textContent = r.label;
  } catch (e) {}
});

/* --- Single-target gate (REUSABLE primitive — Ben ruling R1, 07-12) --------------------------------
 * Talents in this set affect ONE creature; with several tokens targeted the system rolls/applies for
 * all of them (Withering Ray rolled twice; Verdant Mend healed a stale target). With >1 target the
 * use is cancelled BEFORE any cost and a whispered picker card lists the current targets — R1: a
 * prompt, never a hard block (a stray extra target can be off-screen/overlapped and invisible).
 * Clicking retargets to that one token and re-uses the talent. Add future single-target talents here. */
const EDHA_SINGLE_TARGET = new Set(["Withering Ray", "Verdant Mend"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item) || !EDHA_SINGLE_TARGET.has(item.name)) return;
    const targets = Array.from(game.user?.targets ?? []);
    if (targets.length <= 1) return;
    const btns = targets.map(t => `<button type="button" class="edha-pick-target-btn" data-edha-item="${item.uuid}" data-edha-token="${t.id}">${t.name}</button>`).join(" ");
    ChatMessage.create({ whisper: [game.user.id], speaker: ChatMessage.getSpeaker({ actor: item.actor }),
      content: `<div class="edha-trigger-card"><p>🎯 <strong>${item.name}</strong> is single-target, but <strong>${targets.length}</strong> tokens are targeted. Pick one:</p><p>${btns}</p></div>` });
    return false;
  } catch (e) { console.error("Edha Content | single-target gate failed", e); }
});
// Set the local user's targets (REUSABLE primitive): Foundry v13 REMOVED User#updateTokenTargets
// (zero hits in 13.351's foundry.mjs) — the supported client API is Token#setTarget. The first
// token releases the previous target set; an empty list clears it. Every engine retarget goes
// through here so the next core rename breaks ONE line.
function edhaSetUserTargets(tokens) {
  const list = (tokens || []).filter(t => typeof t?.setTarget === "function");
  if (!list.length) { for (const t of Array.from(game.user?.targets ?? [])) t.setTarget(false, { releaseOthers: false }); return; }
  list.forEach((t, i) => t.setTarget(true, { releaseOthers: i === 0 }));
}
async function edhaPickTargetClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const item = await fromUuid(btn.dataset.edhaItem).catch(() => null);
    const tok = canvas?.tokens?.get(btn.dataset.edhaToken);
    if (!item || !tok) { ui.notifications?.warn("Edha: token or talent no longer available — retarget and re-use."); return; }
    edhaSetUserTargets([tok]);
    await edhaMarkCardResolved(edhaMessageIdOf(btn), `✓ ${tok.name}`);
    await item.use();
  } catch (e) { console.error("Edha Content | single-target pick failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-pick-target-btn").forEach(b => b.addEventListener("click", edhaPickTargetClick));
});

// Presumed-killer candidates for on-defeat events (the applyDamage hook only names the victim).
function edhaKillerCandidates() {
  const set = new Set();
  for (const t of (canvas?.tokens?.controlled ?? [])) if (t.actor) set.add(t.actor);
  if (game.user?.character) set.add(game.user.character);
  if (!set.size && game.user?.isGM) { const a = game.combat?.combatant?.actor; if (a) set.add(a); }
  return [...set];
}

// Defeated overlay TIED TO HP: a non-PC at 0 HP shows the skull; healing it above 0 (or a manual HP
// edit) removes it. updateActor catches every HP change (applyDamage does actor.update, and manual
// sheet edits too), so the skull stays in sync with health. PCs use the system's injury/death rules.
Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!game.user?.isGM || actor.type === "character") return;
    const hp = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hp === undefined) return;                                   // only react to HP changes
    // Phantom Double (Blue/Illusion): any hit drops its 1 HP → the illusion ends; remove it outright.
    if (hp <= 0 && actor.getFlag?.("edha-content", "phantomDouble")) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🌫️ <strong>Phantom Double</strong>: the illusion of ${actor.name} is struck and dissipates.</p>` });
      try { await actor.delete(); } catch (e) {}                     // deleting the one-off actor removes its token
      return;
    }
    const dead = CONFIG.specialStatusEffects?.DEFEATED || "dead";
    const has = !!actor.statuses?.has?.(dead);
    if (hp <= 0 && !has) await actor.toggleStatusEffect(dead, { active: true, overlay: true });
    else if (hp > 0 && has) await actor.toggleStatusEffect(dead, { active: false, overlay: true });
  } catch (e) { console.error("Edha Content | defeated HP-sync failed", e); }
});

/* --- Targeting: Attunement Range preview + AoE templates (Foundry core MeasuredTemplates) ----
 * The cosmere system has NO range/area support, so this is built on Foundry core. Range scales off
 * the talent's leyline COLOR rank (derived at runtime from the talent's damage formula / activation
 * skill / path — no per-talent data needed). [Size] AoE talents are listed in data/talent-targeting.json.
 *   • Attunement Range PREVIEW: a per-talent ⊙ button (injected into Actions-tab rows) draws a range
 *     ring centered on your token and reports how many tokens are in range. Manual: preview, then target.
 *   • AoE: using a listed area talent drops a [Size] circle on your target and AUTO-TARGETS the captured
 *     tokens, so the talent's own damage/heal card applies to all of them with one Apply click.
 */
const EDHA_ATTUNE_FT = [0, 15, 30, 60, 90, 120];     // Attunement Range by color rank (index = rank)
const EDHA_SIZE_FT   = [0, 2.5, 5, 10, 15, 20];      // [Size] by color rank
const EDHA_LEY_COLORS = ["white", "blue", "black", "red", "green"];
const EDHA_COLOR_HEX = { white: "#cfd8dc", blue: "#3a7bd5", black: "#7b2fb5", red: "#d23b2e", green: "#3a9d4a" };
const EDHA_RANGE_RING_HEX = "#bfe3ff";   // Attunement Range boundary — distinct from any leyline color

// Resolve the leyline color that scales a talent's range/size.
function edhaTalentColor(item) {
  const f = item?.system?.damage?.formula || "";
  for (const c of EDHA_LEY_COLORS) if (f.includes(`@skills.${c}.`)) return c;
  const sk = item?.system?.activation?.skill;
  if (EDHA_LEY_COLORS.includes(sk)) return sk;
  for (const r of edhaEventRules(item)) { const c = r?.handler?.color; if (EDHA_LEY_COLORS.includes(c)) return c; }   // color set on the talent's own rule
  const p = item?.system?.path;
  if (EDHA_LEY_COLORS.includes(p)) return p;
  return null;
}
function edhaColorRank(actor, color) { return Math.max(0, Math.min(5, Number(actor?.system?.skills?.[color]?.rank) || 0)); }
function edhaCasterToken(actor) { return actor?.getActiveTokens?.()[0] ?? (canvas?.tokens?.controlled ?? []).find(t => t.actor === actor) ?? null; }

// Token renumbering: core appendNumber counts scene tokens BY WORLD actorId — and every
// compendium→canvas drop creates a fresh world actor (client tokens.mjs _onDropActorData), so
// repeated drops all land as "(1)". When a numbered name collides with an existing scene token,
// re-number by NAME pattern instead. Pure resolver — pinned in tests/.
function edhaNextTokenName(proposed, existingNames) {
  const m = /^(.*) \((\d+)\)$/.exec(proposed); if (!m) return null;     // only names core already numbered
  const esc = m[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pat = new RegExp(`^${esc} \\((\\d+)\\)$`);
  const used = new Set();
  for (const n of existingNames) { const mm = pat.exec(n); if (mm) used.add(Number(mm[1])); }
  if (!used.has(Number(m[2]))) return null;                            // no collision — core numbered it fine
  let i = 1; while (used.has(i)) i++;
  return `${m[1]} (${i})`;
}
Hooks.on("preCreateToken", (doc, data) => {
  try {
    const scene = doc.parent; if (!scene || !data?.name) return;
    const fixed = edhaNextTokenName(data.name, scene.tokens.map(t => t.name));
    if (fixed) doc.updateSource({ name: fixed });
  } catch (e) { console.error("Edha Content | token renumber failed", e); }
});

async function edhaDrawCircle(cx, cy, ft, hex, ttlMs = 12000) {
  const scene = canvas?.scene; if (!scene) return null;
  try {
    const [doc] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: cx, y: cy, distance: ft, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, flags: { "edha-content": { ephemeral: ttlMs > 0 } },
    }]);
    if (doc && ttlMs > 0) setTimeout(() => { try { if (doc.parent?.templates?.get(doc.id)) doc.delete()?.catch(() => {}); } catch (e) {} }, ttlMs);  // only delete if it still exists (no "does not exist" toast)
    return doc;
  } catch (e) { console.error("Edha Content | template draw failed (player template perms?)", e); return null; }
}
function edhaTokensInCircle(cx, cy, ft, excludeId) {
  const scene = canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (!t.actor || t.id === excludeId) return false;
    const px = Math.hypot((t.center?.x ?? 0) - cx, (t.center?.y ?? 0) - cy);
    return (px / gs * gd) <= ft;
  });
}

// Manual range preview: draw the Attunement Range ring + report in-range token count.
async function edhaShowRange(item) {
  try {
    if (typeof item === "string") {
      const a = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
      item = a?.items?.find(i => edhaIsTalent(i) && i.name === item);
    }
    const actor = item?.actor; if (!actor) { ui.notifications?.warn("Edha: no talent/actor for range preview."); return; }
    const color = edhaTalentColor(item);
    if (!color) { ui.notifications?.warn(`Edha: ${item.name} has no leyline color to scale range from.`); return; }
    const rank = edhaColorRank(actor, color);
    const ft = EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1];
    const tok = edhaCasterToken(actor);
    if (!tok) { ui.notifications?.warn("Edha: select/drop your token to preview range."); return; }
    await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_COLOR_HEX[color]);
    const n = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id).length;
    ui.notifications?.info(`${item.name}: Attunement Range ${ft} ft (${color} rank ${rank}) — ${n} token(s) in range. Ring clears in 12s.`);
  } catch (e) { console.error("Edha Content | showRange failed", e); }
}

// AoE: drop a [Size] circle at your target and auto-target captured tokens for the talent's card.
// (Spec comes from the talent's own edha-aoe-template rule via the native executor.)
async function edhaPlaceAoe(item, spec) {
  try {
    const area = spec?.area; const actor = item?.actor;
    if (!area || !actor) return;
    const color = spec.color || edhaTalentColor(item) || "red";
    const rank = edhaColorRank(actor, color);
    const ft = area.sizeByRank ? (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]) : (Number(area.sizeFt) || EDHA_SIZE_FT[1]);
    const center = Array.from(game.user?.targets ?? [])[0] ?? edhaCasterToken(actor);
    if (!center) { ui.notifications?.warn(`Edha: target the ${item.name} burst center (or select your token).`); return; }
    const cx = center.center.x, cy = center.center.y;
    await edhaDrawCircle(cx, cy, ft, EDHA_COLOR_HEX[color] || "#d23b2e");
    const affects = spec.affects || "enemies";
    const casterDisp = edhaCasterToken(actor)?.document?.disposition ?? 1;
    let caught = edhaTokensInCircle(cx, cy, ft, null);
    if (affects !== "all" && affects !== "none") {
      caught = caught.filter(t => {
        const same = (t.document?.disposition ?? 1) === casterDisp;
        return affects === "allies" ? same : !same;
      });
    }
    if (affects !== "none") { try { edhaSetUserTargets(caught); } catch (e) {} edhaCheckMultiHit(actor, item, caught.length); }
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: affects === "none"
        ? `<p><strong>${item.name}</strong> — ${ft} ft area placed (terrain). Damage triggers on entry (GM-applied).</p>`
        : `<p><strong>${item.name}</strong> — ${ft} ft burst: <strong>${caught.length}</strong> ${affects} captured &amp; targeted (${caught.map(t => t.name).join(", ") || "none"}). Click <em>Apply</em> on the ${item.name} card to ${affects === "allies" ? "heal" : "damage"} all of them.</p>`,
    });
  } catch (e) { console.error("Edha Content | AoE place failed", e); }
}
// Inject a ⊙ range-preview button into each color-scaled talent row in the Actions tab.
Hooks.on("renderCharacterSheet", (app, element) => {
  try {
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    const actor = app?.actor; if (!root || !actor || actor.type !== "character") return;
    root.querySelectorAll(".item[data-item-id]").forEach(row => {
      if (row.querySelector(".edha-range-btn")) return;
      const item = actor.items.get(row.dataset.itemId);
      if (!item || item.type !== "talent" || !edhaTalentColor(item)) return;   // type-strict: character-sheet injector (adversary sheet ≠ this app)
      const btn = document.createElement("a");
      btn.className = "edha-range-btn";
      btn.title = `Preview Attunement Range for ${item.name}`;
      btn.style.cssText = "margin-right:4px;cursor:pointer;opacity:.85;";
      btn.innerHTML = '<i class="fa-regular fa-circle-dot"></i>';
      btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); void edhaShowRange(item); });
      (row.querySelector(".controls, .item-controls, .action-controls") || row).prepend(btn);
    });
  } catch (e) { console.error("Edha Content | range-button injection failed", e); }
});

/* --- Point-targeted AoE bursts ----------------------------------------------------------------
 * The old AoE centred the circle on a TARGETED TOKEN (game.user.targets[0]) and fired on the `use`
 * event, which the system queues in postRoll — i.e. AFTER the single-target card was already posted.
 * Net result: you had to target an actor (couldn't pick a square) and only that one actor took damage
 * unless you then clicked Apply with "Prioritise Targeted" on. Both complaints traced to that design.
 *
 * New model: talents flagged with a `burst` spec in talent-targeting.json are intercepted at
 * `preUseItem` (returning false cancels the default single-target flow entirely — no card, no auto
 * damage). We consume the cost, drop a [Size] circle template at the caster, and the player DRAGS it to
 * any point in Attunement Range (true point targeting), then clicks Detonate: every creature under it is
 * captured and takes the talent's [Tier][Die] — enemies for damage, allies for heals — with an auto
 * Athletics-vs-colour save for half where the talent calls for one. Terrain talents also drop a
 * scene-long dangerous-terrain Region at the point. Runtime-only; no pack rebuild.
 */
const EDHA_BURST_PENDING = {};

// Click-to-place a point on the canvas (drag-free): resolves a grid-snapped world {x,y}, or null on
// cancel. Reads canvas.mousePosition (continuously updated to world coords) on a capture-phase pointer
// down on the #board canvas, so it fires even over tokens without needing the Templates layer active.
function edhaPickPoint(promptText) {
  return new Promise((resolve) => {
    const view = document.getElementById("board");
    if (!view || !canvas?.ready) { resolve(null); return; }
    ui.notifications?.info(promptText || "Click a point on the map (right-click to cancel).");
    let done = false;
    const finish = (pt) => {
      if (done) return; done = true;
      try { view.removeEventListener("pointerdown", onDown, true); } catch (e) {}
      try { view.removeEventListener("contextmenu", onCtx, true); } catch (e) {}
      try { window.removeEventListener("keydown", onKey, true); } catch (e) {}
      resolve(pt);
    };
    const snap = (p) => {
      try { const s = canvas.grid.getSnappedPoint({ x: p.x, y: p.y }, { mode: CONST.GRID_SNAPPING_MODES?.CENTER ?? 1, resolution: 1 }); return Number.isFinite(s?.x) ? s : p; }
      catch (e) { return p; }
    };
    const onDown = (ev) => {
      if (ev.button === 2) return;                 // right-click handled by contextmenu (cancel)
      if (ev.button !== 0) return;                 // left-click only
      const mp = canvas.mousePosition;             // PIXI.Point in world coords, kept current by the canvas
      if (!mp || !Number.isFinite(mp.x)) { finish(null); return; }
      finish(snap({ x: mp.x, y: mp.y }));
    };
    const onCtx = (ev) => { try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {} finish(null); };
    const onKey = (ev) => { if (ev.key === "Escape") finish(null); };
    view.addEventListener("pointerdown", onDown, true);
    view.addEventListener("contextmenu", onCtx, true);
    window.addEventListener("keydown", onKey, true);
  });
}

// Evaluate a flat (non-dice) formula like "@skills.red.mod" to a number against roll data.
function edhaEvalSync(formula, rd) {
  try { const r = new Roll(Roll.replaceFormulaData(String(formula ?? "0"), rd, { missing: "0" })); r.evaluateSync(); return Number(r.total) || 0; }
  catch (e) { return 0; }
}
function edhaConsumeList(item) {
  return (item?.system?.activation?.consume || []).filter(c => c?.type === "resource" && c.resource)
    .map(c => ({ resource: c.resource, amount: Number(c.value?.min ?? c.value?.actual ?? c.value ?? 0) || 0 }))
    .filter(c => c.amount > 0);
}
// Deduct the talent's activation cost; returns false (and warns) if the actor can't pay.
function edhaConsumeCost(item) {
  try {
    const actor = item?.actor; const list = edhaConsumeList(item);
    for (const c of list) {
      const cur = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
      if (cur < c.amount) { ui.notifications?.warn(`Edha: ${actor.name} needs ${c.amount} ${EDHA_RES_LABEL[c.resource] || c.resource} for ${item.name}.`); return false; }
    }
    const updates = {};
    for (const c of list) {
      const cur = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
      updates[`system.resources.${c.resource}.value`] = Math.max(0, cur - c.amount);
    }
    if (Object.keys(updates).length) actor.update(updates);
    return true;
  } catch (e) { console.error("Edha Content | burst consume failed", e); return true; }
}
function edhaRefundCost(item) {
  try {
    const actor = item?.actor; const updates = {};
    for (const c of edhaConsumeList(item)) {
      const res = foundry.utils.getProperty(actor, `system.resources.${c.resource}`);
      const cur = Number(res?.value) || 0, max = Number(res?.max?.value ?? res?.max);
      updates[`system.resources.${c.resource}.value`] = Number.isFinite(max) ? Math.min(max, cur + c.amount) : cur + c.amount;
    }
    if (Object.keys(updates).length) actor.update(updates);
  } catch (e) { /* non-fatal */ }
}

// Drop a draggable [Size] template + a range ring, then post the Detonate card.
async function edhaCastBurst(item, spec) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor) return;
    if (!scene) { ui.notifications?.warn("Edha: need an active scene to place a burst."); return; }
    const color = spec.color || edhaTalentColor(item) || "red";
    const rank = edhaColorRank(actor, color);
    const area = spec.area || {};
    const sizeFt = area.sizeByRank ? (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]) : (Number(area.sizeFt) || EDHA_SIZE_FT[1]);
    const b = spec.burst || {};
    const rangeFt = b.rangeByRank ? (EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1]) : (Number(b.rangeFt) || EDHA_ATTUNE_FT[rank] || 60);
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    if (!edhaConsumeCost(item)) return;
    // Show the Attunement Range boundary in a DISTINCT pale-blue (so it doesn't blend with the red
    // burst), then CLICK to place the burst point — no dragging or Templates-layer switching needed.
    const tok = edhaCasterToken(actor);
    const ox = tok?.center?.x ?? (scene.dimensions?.width ?? 1000) / 2;
    const oy = tok?.center?.y ?? (scene.dimensions?.height ?? 1000) / 2;
    let ring = null;
    try { ring = await edhaDrawCircle(ox, oy, rangeFt, EDHA_RANGE_RING_HEX, 0); } catch (e) {}
    const pt = await edhaPickPoint(`Click the ${item.name} burst center (right-click to cancel). Attunement Range ${rangeFt} ft.`);
    if (!pt) { try { if (ring && scene.templates?.get(ring.id)) void ring.delete()?.catch(() => {}); } catch (e) {} edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: sizeFt, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, flags: { "edha-content": { burst: item.name } },
    }]);
    const pid = foundry.utils.randomID();
    EDHA_BURST_PENDING[pid] = { itemUuid: item.uuid, templateId: tpl?.id, ringId: ring?.id, spec, sizeFt, color };
    const affects = spec.affects || "enemies";
    const verb = affects === "allies" ? "heal" : (affects === "none" ? "drop terrain on" : "hit");
    const saveTxt = b.save ? ` Enemies auto-roll Athletics vs your ${(b.save.vs || color).toUpperCase()} for half.` : "";
    const termTxt = b.terrain ? " Leaves dangerous terrain (GM-side)." : "";
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content:
        `<div class="edha-burst-card">` +
        `<p>\u{1F4A5} <strong>${item.name}</strong> — ${sizeFt} ft burst (Attunement Range ${rangeFt} ft).</p>` +
        `<p style="opacity:.85;font-size:.9em">Burst placed — click Detonate to ${verb} everyone inside.${saveTxt}${termTxt} (Cancel refunds &amp; lets you re-place.)</p>` +
        `<button type="button" class="edha-burst-btn" data-edha-burst="${pid}">Detonate ${item.name}</button> ` +
        `<button type="button" class="edha-burst-cancel" data-edha-burst="${pid}">Cancel (refund)</button>` +
        `</div>`,
    });
  } catch (e) { console.error("Edha Content | cast burst failed", e); }
}

// Resolve a placed burst: capture tokens under the template, roll, apply, drop terrain, clean up.
async function edhaBurstDetonate(pid, messageId = null) {
  const P = EDHA_BURST_PENDING[pid];
  if (!P) { ui.notifications?.info("That burst was already resolved."); void edhaMarkCardResolved(messageId, "Detonated ✓"); return; }
  delete EDHA_BURST_PENDING[pid];   // claim immediately so a double-bound click can't resolve twice
  try {
    const scene = canvas?.scene;
    const item = await fromUuid(P.itemUuid).catch(() => null);
    const actor = item?.actor;
    const tplDoc = scene?.templates?.get(P.templateId);
    if (!actor || !tplDoc) { ui.notifications?.warn("Edha: burst template missing — re-cast the talent."); delete EDHA_BURST_PENDING[pid]; return; }
    const cx = tplDoc.x, cy = tplDoc.y;
    const spec = P.spec; const b = spec.burst || {}; const affects = spec.affects || "enemies"; const sizeFt = P.sizeFt;
    const casterDisp = edhaCasterToken(actor)?.document?.disposition ?? 1;
    let caught = edhaTokensInCircle(cx, cy, sizeFt, null);
    if (affects === "enemies") caught = caught.filter(t => (t.document?.disposition ?? 1) !== casterDisp);
    else if (affects === "allies") caught = caught.filter(t => (t.document?.disposition ?? 1) === casterDisp);
    else if (affects === "none") caught = [];
    const rd = actor.getRollData();
    const rolls = []; const lines = []; const hits = [];
    const dmgF = item.system?.damage?.formula || "0";
    const dtype = item.system?.damage?.type || "energy";

    if (b.heal) {
      const hr = await new Roll(Roll.replaceFormulaData(dmgF, rd, { missing: "0" })).evaluate();
      rolls.push(hr);
      const amt = Math.max(0, Math.floor(hr.total));
      for (const t of caught) {
        hits.push({ actorUuid: t.actor.uuid, amount: amt, type: "heal", heal: true });
        lines.push(`${t.name}: +${amt} HP (capped at max)`);
      }
    } else if (affects !== "none") {
      const dice = await new Roll(edhaFoldDieMath(Roll.replaceFormulaData(dmgF, rd, { missing: "0" }))).evaluate();
      rolls.push(dice);
      let mod = 0;
      const skillModVal = b.addSkillMod ? edhaEvalSync(`@skills.${b.addSkillMod}.mod`, rd) : 0;   // match the system's full-hit skill mod
      mod += skillModVal;
      // Riders (Kindle etc.) — evaluated per part so the card can SAY which talent added what
      // (Ben pass 3: Set Charge's total was opaque; "how can I tell if Kindle is applied?").
      const riderVals = edhaRiderParts(item, actor)
        .map(rp => ({ name: rp.name, val: Math.floor(edhaEvalSync(rp.formula, rd)) }))
        .filter(r => Number.isFinite(r.val) && r.val !== 0);
      for (const r of riderVals) mod += r.val;
      const full = Math.max(0, Math.floor(dice.total) + mod);
      lines.push(`= ${dice.total} (${dice.formula})${skillModVal ? ` + ${skillModVal} (${b.addSkillMod})` : ""}${riderVals.map(r => ` + ${r.val} (${r.name})`).join("")} → <strong>${full} ${dtype}</strong>`);
      let dc = null;
      if (b.save) { const dcRoll = await new Roll(`1d20 + @skills.${b.save.vs || P.color}.mod`, rd).evaluate(); rolls.push(dcRoll); dc = dcRoll.total; }
      for (const t of caught) {
        let amt = full, note = "";
        if (b.save) {
          const sv = await new Roll(Roll.replaceFormulaData(`1d20 + @skills.${b.save.skill || "ath"}.mod`, t.actor.getRollData(), { missing: "0" })).evaluate();
          const saved = sv.total >= dc; if (saved) amt = Math.floor(full / 2);
          note = ` (save ${sv.total} vs ${dc} → ${saved ? "half" : "full"})`;
        }
        hits.push({ actorUuid: t.actor.uuid, amount: amt, type: dtype, heal: false });
        lines.push(`${t.name}: ${amt} ${dtype}${note}`);
      }
    }

    const terrain = b.terrain ? { sceneId: scene.id, x: cx, y: cy, sizeFt, color: P.color, formula: dmgF, type: dtype === "heal" ? "energy" : dtype, casterActorUuid: actor.uuid } : null;
    if (terrain) lines.push("(dangerous terrain placed)");

    const verb = b.heal ? "healed" : (affects === "none" ? "" : "hit");
    const body = lines.length ? lines.join("<br>") : (affects === "none" ? "terrain placed." : "no creatures under the burst.");
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls, content: `<div class="edha-burst-card"><p>\u{1F4A5} <strong>${item.name}</strong> ${verb}:</p><p style="font-size:.95em">${body}</p></div>` });
    if (affects !== "none") edhaCheckMultiHit(actor, item, caught.length);   // Flashpoint-style 2+-hit prompt
    void edhaMarkCardResolved(messageId, "Detonated ✓");   // persist the spent state ON the card (survives refresh)
    // Privileged writes (apply damage/heal to GM-owned tokens, drop terrain Regions): do them directly
    // if we are the GM, otherwise relay to the GM's client via socket so PLAYERS can Detonate too.
    const payload = { hits, terrain, casterActorUuid: actor.uuid };
    if (game.user?.isGM) { await edhaApplyBurstResults(payload); }
    else if (hits.length || terrain) {
      if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply burst damage/terrain.");
      try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) { console.error("Edha Content | burst socket emit failed", e); }
    }
    try { const t = scene.templates?.get(P.templateId); if (t) await t.delete().catch(() => {}); } catch (e) {}
    try { const r = scene.templates?.get(P.ringId); if (r) await r.delete().catch(() => {}); } catch (e) {}
    delete EDHA_BURST_PENDING[pid];
  } catch (e) { console.error("Edha Content | burst detonate failed", e); }
}
function edhaBurstCancel(pid) {
  const P = EDHA_BURST_PENDING[pid]; if (!P) return;
  const scene = canvas?.scene;
  try { void scene?.templates?.get(P.templateId)?.delete()?.catch(() => {}); } catch (e) {}
  try { void scene?.templates?.get(P.ringId)?.delete()?.catch(() => {}); } catch (e) {}
  fromUuid(P.itemUuid).then(item => { if (item) edhaRefundCost(item); }).catch(() => {});
  delete EDHA_BURST_PENDING[pid];
  ui.notifications?.info("Burst canceled — cost refunded.");
}
// Privileged writes for a resolved burst — runs on a GM client (directly when the caster IS the GM, or
// via the socket relay when a player detonates). Applies pre-rolled damage/heal and drops terrain.
async function edhaApplyBurstResults(payload) {
  try {
    const p = payload || {};
    const casterRef = p.casterActorUuid ? await fromUuid(p.casterActorUuid).catch(() => null) : null;
    const caster = casterRef?.actor ?? casterRef;   // pass as edhaSource so the Kindle-light wrapper can attribute it
    for (const h of (p.hits || [])) {
      const ref = await fromUuid(h.actorUuid).catch(() => null);
      const target = ref?.actor ?? ref;            // accept an Actor (or, defensively, a token doc)
      if (!target?.update) continue;
      if (h.heal) {
        const cur = Number(target.system?.resources?.hea?.value) || 0;
        const max = Number(target.system?.resources?.hea?.max?.value) || (cur + h.amount);
        await target.update({ "system.resources.hea.value": Math.min(max, cur + h.amount) });
      } else {
        try { await target.applyDamage([{ amount: h.amount, type: h.type }], { chatMessage: false, edhaSource: caster }); } catch (e) { console.error("Edha Content | burst applyDamage failed", e); }
      }
    }
    const tr = p.terrain;
    if (tr) {
      const scene = game.scenes?.get(tr.sceneId);
      const ref = await fromUuid(tr.casterActorUuid).catch(() => null);
      const caster = ref?.actor ?? ref;
      if (scene && caster) {
        if (tr.color === "green") {           // Green = ENFORCED difficult terrain (+Thorn Field keen if owned)
          await edhaCreateGreenTerrain(caster, scene, tr.x, tr.y, tr.sizeFt);
        } else {                              // Red/other = dangerous terrain (damage on enter), now owner-tagged
          const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
          const radiusPx = Math.max(Math.round(gs / 2), Math.round((tr.sizeFt / gd) * gs));
          const baked = Roll.replaceFormulaData(tr.formula || "(@tier)d6", caster.getRollData(), { missing: "0" });
          const [trRegion] = await scene.createEmbeddedDocuments("Region", [{
            name: `${caster.name} — Dangerous Terrain`, color: EDHA_COLOR_HEX[tr.color] || "#d23b2e",
            shapes: [{ type: "circle", x: tr.x, y: tr.y, radius: radiusPx, hole: false }],
            behaviors: [{ type: "edha-content.hazard", name: "Dangerous Terrain", system: { damageFormula: baked, damageType: tr.type || "energy", sourceName: `Dangerous Terrain — ${caster.name}` } }],
            flags: { "edha-content": { hazard: true, scope: "scene", terrain: { ownerUuid: caster.uuid, color: tr.color } } },
          }]);
          if (trRegion) await edhaHazardVisual(scene, tr.x, tr.y, radiusPx, EDHA_COLOR_HEX[tr.color] || "#d23b2e", trRegion.id, "🔥");
        }
      }
    }
  } catch (e) { console.error("Edha Content | apply burst results failed", e); }
}
// Socket relay: a player's Detonate emits the resolved writes; only the primary active GM applies them.
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!game.user?.isGM) return;
        if (game.users?.activeGM && !game.users.activeGM.isSelf) return;   // exactly one GM applies
        if (data?.action === "burst-apply") { await edhaApplyBurstResults(data.payload); return; }
        if (data?.action === "foundation-place") { await edhaFoundationPlace(data.payload); return; }   // players lack DRAWING_CREATE
        if (data?.action === "summon-actor") { await edhaSummonCreateGM(data.payload); return; }        // players lack ACTOR_CREATE — spec baked owner-side
        if (data?.action === "create-item") {                          // injury tool → add an Item GM-side (inverse of delete-item)
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a && p.itemData) await edhaCreateItemDocs(a, p.itemData);
          return;
        }
        if (data?.action === "toggle-status") {
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a?.toggleStatusEffect) await a.toggleStatusEffect(p.statusId, { active: p.active !== false });
          return;
        }
        if (data?.action === "apply-status-mark") {
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (!a) return;
          if (a.toggleStatusEffect) await a.toggleStatusEffect(p.statusId, { active: true });
          if (p.mark) await a.setFlag("edha-content", `markedBy.${p.statusId}`, p.mark);
          return;
        }
        if (data?.action === "set-flag") {                            // cross-actor flag write (e.g. plot-die grant onto an ally)
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a && p.key) await a.setFlag("edha-content", p.key, p.value);
          return;
        }
        if (data?.action === "apply-timed-status") {                   // status + owner-relative expiry (Disoriented)
          const p = data.payload || {};
          const tref = await fromUuid(p.targetUuid).catch(() => null); const t = tref?.actor ?? tref;
          if (!t?.toggleStatusEffect) return;
          await t.toggleStatusEffect(p.statusId, { active: true });
          if (p.expire && game.combat?.started) {
            const eff = [...(t.effects ?? [])].find(e => e.statuses?.has?.(p.statusId));
            let who = t;
            if (p.expire === "owner" && p.ownerUuid) { const oref = await fromUuid(p.ownerUuid).catch(() => null); who = oref?.actor ?? oref ?? t; }
            const ti = edhaCombatantTurnIndex(game.combat, who);
            if (eff && ti >= 0) await eff.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(game.combat, ti));
          }
          return;
        }
        if (data?.action === "move-token") {                          // GM-applied forced movement (Red push pilot)
          const p = data.payload || {};
          const td = await fromUuid(p.tokenUuid).catch(() => null);
          // Socket options don't ride the emit — re-stamp edhaForced on the GM-side write (this relay
          // only ever carries engine-driven moves). Order's violation watcher + Dread Presence's veto read it.
          const mvOpts = p.hostile ? { edhaForced: true, edhaHostileMove: true } : { edhaForced: true };
          if (p.teleport && typeof td?.move === "function") { await td.move({ x: p.x, y: p.y, action: "displace" }, mvOpts); return; }
          if (td?.update) await td.update({ x: p.x, y: p.y }, { animate: !p.teleport, teleport: !!p.teleport, ...mvOpts });
          return;
        }
        if (data?.action === "remove-terrain") {                      // player extinguish (07-12 region rework)
          const p = data.payload || {};
          try { await game.scenes?.get(p.sceneId)?.regions?.get(p.regionId)?.delete(); } catch (e) {}
          return;
        }
        if (data?.action === "set-resource") {                        // cross-actor resource write (Shatter Focus)
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a && p.path) await a.update({ [p.path]: p.value });
          return;
        }
        if (data?.action === "rewrite-roll") {                         // Voice of Authority / Bound by Word — change a rendered roll's total
          const p = data.payload || {};
          const aref = p.actorUuid ? await fromUuid(p.actorUuid).catch(() => null) : null;
          const a = aref?.actor ?? aref;
          const msg = edhaFindRecentRollMessage(a, p.oldTotal);
          if (msg) await edhaApplyRollRewrite(msg, p.newTotal, p.noteHtml);
          return;
        }
        if (data?.action === "green-terrain") {                        // player Green Draw Mana → drop enforced terrain GM-side
          const p = data.payload || {};
          const scene = game.scenes?.get(p.sceneId);
          const oref = await fromUuid(p.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref;
          if (scene && owner) await edhaCreateGreenTerrain(owner, scene, p.cx, p.cy, p.sizeFt);
          return;
        }
        if (data?.action === "grow-terrain") {                         // Spreading Roots expand → GM-side Region update
          const p = data.payload || {};
          await edhaGrowTerrain(p.sceneId, p.regionId, p.sizeFt);
          return;
        }
        if (data?.action === "delete-item") {                          // Reknit Form → remove an injury Item GM-side
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null); const a = ref?.actor ?? ref;
          if (a?.deleteEmbeddedDocuments && p.itemId) await a.deleteEmbeddedDocuments("Item", [p.itemId]);
          return;
        }
        if (data?.action === "place-fate-snare") {                     // FATE Snare → arm its trigger Region GM-side (players lack Region create)
          const p = data.payload || {};
          const scene = game.scenes?.get(p.sceneId);
          const oref = await fromUuid(p.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref;
          if (scene && owner) await edhaFateCreateSnareRegionGM(scene, owner, p.x, p.y, p.snareId);
          return;
        }
        if (data?.action === "delete-fate-snare") {                    // FATE Snare sprung/moved → drop its trigger Region GM-side
          const p = data.payload || {};
          const scene = game.scenes?.get(p.sceneId);
          const r = scene ? edhaFateFindSnareRegion(scene, p.snareId) : null;
          if (r) await scene.deleteEmbeddedDocuments("Region", [r.id]);
          return;
        }
        if (data?.action === "gm-card") {                              // GM-only card a player must not author (Black Draw Mana behind-a-wall counts)
          const p = data.payload || {};
          const aref = p.actorUuid ? await fromUuid(p.actorUuid).catch(() => null) : null;
          const a = aref?.actor ?? aref;
          const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
          if (gmIds.length && p.content) await ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor: a }), content: p.content });
          return;
        }
        if (data?.action === "resolve-card") {                         // card-persistence: a non-author clicked a one-shot card
          const p = data.payload || {};
          const m = game.messages?.get(p.messageId);
          if (m) await m.setFlag("edha-content", "cardResolved", { label: p.label || "Resolved ✓" });
          return;
        }
        if (data?.action === "gnosis-set-insight") {                   // KNOWLEDGE Insight write GM-side (player lacks perms on the bearer)
          const p = data.payload || {};
          const ref = await fromUuid(p.targetUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a) await edhaGnosisApplyInsightGM(a, Number(p.count) || 0, p.mark || null);
          return;
        }
      } catch (e) { console.error("Edha Content | socket relay failed", e); }
    });
  } catch (e) { console.error("Edha Content | socket registration failed", e); }
});
function edhaBindBurstButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-burst-btn").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; btn.textContent = "Detonating…"; void edhaBurstDetonate(btn.dataset.edhaBurst, edhaMessageIdOf(btn));
  }));
  root?.querySelectorAll?.(".edha-burst-cancel").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; edhaBurstCancel(btn.dataset.edhaBurst); void edhaMarkCardResolved(edhaMessageIdOf(btn), "Cancelled — refunded ✓");
  }));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindBurstButtons(html));   // Foundry v13 (renderChatMessage is deprecated — single bind avoids double-detonate)
// Map a talent's flat `edha-burst` rule config to the burst spec edhaCastBurst expects.
function edhaBurstSpecFromCfg(h) {
  return {
    color: h.color || null,
    affects: h.affects || "enemies",
    area: { shape: "circle", sizeByRank: !!h.sizeByRank, sizeFt: Number(h.sizeFt) || 0 },
    burst: {
      rangeByRank: !!h.rangeByRank, rangeFt: Number(h.rangeFt) || 0,
      save: h.saveSkill ? { skill: h.saveSkill, vs: h.saveVs || h.color || "" } : null,
      addSkillMod: h.addSkillMod || "", heal: !!h.heal, terrain: !!h.terrain,
    },
  };
}
// Intercept burst talents BEFORE the default single-target flow rolls/posts anything. The burst
// CONFIG lives on the talent (its edha-burst rule); this hook is only the engine glue.
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-burst");
    if (!h) return;                 // only burst-rule talents are taken over
    void edhaCastBurst(item, edhaBurstSpecFromCfg(h));
    return false;                   // cancel the system's default use() (no card, no auto damage)
  } catch (e) { console.error("Edha Content | preUseItem burst intercept failed", e); }
});

/* ============================================================================================
 * DESTRUCTION (Razkael, deity) tree engine (2026-06-16) — the "Charge" lifecycle + dangerous terrain.
 * First deity tree wired; reuses the Red/hazard machinery wholesale (no side-engine):
 *   • damage/heal writes → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • dangerous terrain   → edhaDropHazard → edhaPlaceHazardRegionGM (circle OR line), the same
 *     edha-content.hazard Region behavior + edhaHazardVisual that Pyre/Fault Line already use.
 *   • opposed Speed test   → edhaSpeedVsRedProne (engine ROLLS each foe's Speed vs the owner's Red DC,
 *     then applies the core "prone" status on a failure — NOT a "trust the player" reminder card).
 *   • per-actor state      → setFlag("edha-content","charges") list, mirroring the Reserve/affliction
 *     flag pattern; cleared at scene/combat end.
 * CHARGE MODEL (Ben, 06-16): Set Charge drops a click-to-placed marker template, tracked in the owner
 * flag (cap = tier; oldest fizzles past cap). Detonation resolves burst damage + drops terrain at each
 * marker's REAL position via the card's Detonate / Detonate-All buttons (free) or via Cascading
 * Failure / The Unmooring (their own Inv cost + bonuses). Concussive Yield rides EVERY detonation.
 * RULINGS (Ben, 06-16): trigger conditions ("when target moves/takes damage/enters") are DECLARED
 * TEXT fired by the Detonate action (no auto-hook); zone "merge" is a damage-bump + GM-merge note
 * (no polygon union); the Prone test is engine-rolled per foe.
 * Now wired (no longer GM-eyeballed): ignore-deflect (Pinpoint primary + The Unmooring) bumps the hit by
 * the target's deflect so applyDamage nets to ignoring it; Fault Line TRIPLES damage vs Constructs;
 * Combustion Chain AUTO-fires off the defeat HP-sync hook when a foe drops in your terrain; Walking Ruin
 * drops terrain off updateToken; +10 ft Speed is a transfer AE.
 * Hooks/tools still to build (engine backlog — NOT silently dropped; each names the hook it needs):
 *   • Fault Line "triple damage to structures" — needs object/structure damage targets (no actor for a
 *     wall today); Constructs ARE wired.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Pinpoint "terrain moves with the target" — the detonation centers the terrain on the primary
 *     target, tags followTokenUuid, and an updateToken watcher recenters Region + visual while the
 *     target lives (⚑ bench: a Region moved ONTO a token may not fire tokenEnter — turn-start still hits).
 *   • Pyre "spreads to one adjacent flammable square each turn" — end-of-owner-turn (the Bone-Garden
 *     combat.previous shape) whispers a FREE confirm card per Pyre zone; the button is the
 *     Spreading-Roots +5 ft Region-grow ("flammable" stays GM-judged — the confirm IS the judgment).
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Set Charge triggers — WIRED 07-16c (Ben E18, superseding the 06-16 "declared text" ruling):
 *     the arm card binds "target moves" / "target takes damage" / "a creature enters (10 ft)" to
 *     real watchers that whisper a Detonate prompt; detonation stays the owner's click. "Manual"
 *     remains a valid arm for genuinely narrative conditions.
 * ============================================================================================ */

const EDHA_CHARGE_DMG = "(@tier)d(2 * @skills.red.rank + 2)";   // [Tier][Die] energy — the Charge/terrain default
// Deflect (reduced by applyDamage on energy/impact/keen) — adding it back to a hit nets to "ignores deflect".
function edhaDeflectOf(actor) { return Math.max(0, Number(actor?.system?.deflect?.value) || 0); }
function edhaIsConstruct(actor) { return String(actor?.system?.customType || "").toLowerCase() === "construct"; }

function edhaGetCharges(owner) {
  const c = owner?.getFlag?.("edha-content", "charges");
  return Array.isArray(c) ? c.filter(x => x && (x.sceneId === (canvas?.scene?.id))) : [];
}
async function edhaSetCharges(owner, list) {
  try { if (!list?.length) await owner.unsetFlag("edha-content", "charges"); else await owner.setFlag("edha-content", "charges", list); }
  catch (e) { console.error("Edha Content | set charges failed", e); }
}
// Enemy (different-disposition, alive) tokens within `ft` of a point — the burst capture, reused.
function edhaEnemyTokensInCircle(owner, cx, cy, ft) {
  const disp = edhaCasterToken(owner)?.document?.disposition ?? 1;
  return edhaTokensInCircle(cx, cy, ft, null).filter(t =>
    (t.document?.disposition ?? 1) !== disp && (t.actor?.system?.resources?.hea?.value ?? 1) > 0);
}
// Enemy tokens inside a length×width line that starts at (cx,cy) and runs toward (px,py).
function edhaEnemyTokensInLine(owner, cx, cy, px, py, lengthFt, widthFt) {
  const scene = canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  const lenPx = (lengthFt / gd) * gs, halfW = ((widthFt / gd) * gs) / 2;
  let dx = px - cx, dy = py - cy; const mag = Math.hypot(dx, dy) || 1; dx /= mag; dy /= mag;   // unit direction
  const disp = edhaCasterToken(owner)?.document?.disposition ?? 1;
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (!t.actor || (t.document?.disposition ?? 1) === disp || (t.actor?.system?.resources?.hea?.value ?? 1) <= 0) return false;
    const vx = (t.center?.x ?? 0) - cx, vy = (t.center?.y ?? 0) - cy;
    const proj = vx * dx + vy * dy;                       // distance along the line
    const perp = Math.abs(vx * -dy + vy * dx);            // distance off the centreline
    return proj >= -halfW && proj <= lenPx + halfW && perp <= halfW;
  });
}

// Engine-resolved "each foe tests <skill> vs. your <color>; on a failure, <onFail>" — the generalized
// Destruction Concussive-Yield helper (2026-07-02, Civilization pass). Rolls the owner's color DC ONCE
// (1d20 + @skills.<color>.mod), then ROLLS each foe's skill (engine rolls the foe — never trust-the-player)
// and runs onFail(token) per failure. Callers: Concussive Yield / Fault Line (Speed vs Red → Prone),
// Bastion (Agility vs Red → Slowed), Magnum Opus (Agility vs Red → Prone).
async function edhaFoeSkillVsColor(owner, tokens, { skill = "spd", label = null, color = "red", sourceName = "", failText = "fails", okText = "resists", icon = "💥", onFail = null } = {}) {
  try {
    const uniq = [...new Map((tokens || []).map(t => [t.id, t])).values()];
    if (!uniq.length) return;
    const dcRoll = await new Roll(`1d20 + @skills.${color}.mod`, owner.getRollData()).evaluate();
    const dc = Number(dcRoll.total) || 0;
    const skillName = label || skill;
    const colorName = color.charAt(0).toUpperCase() + color.slice(1);
    const lines = [];
    for (const t of uniq) {
      const opp = await edhaRollOpposedSkill(t.actor, skill);
      const failed = opp < dc;
      if (failed && onFail) await onFail(t);
      lines.push(`${t.name}: ${skillName} <strong>${opp}</strong> vs your ${colorName} <strong>${dc}</strong> — ${failed ? `<strong>${failText}</strong>` : okText}`);
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: [dcRoll],
      content: `<div class="edha-trigger-card"><p>${icon} <strong>${sourceName}</strong> — ${skillName} vs your ${colorName}:</p><p style="font-size:.95em">${lines.join("<br>")}</p></div>` });
  } catch (e) { console.error("Edha Content | foe-skill-vs-color failed", e); }
}
// Destruction's original wrapper (Concussive Yield + Fault Line) — unchanged behavior.
async function edhaSpeedVsRedProne(owner, tokens, sourceName) {
  return edhaFoeSkillVsColor(owner, tokens, { skill: "spd", label: "Speed", color: "red", sourceName,
    failText: "Prone", okText: "stays up", onFail: (t) => edhaToggleStatus(t.actor, "prone", true) });
}

/* --- Dangerous-terrain placement (circle OR line), GM-side with a player→GM relay ------------------ */
async function edhaPlaceHazardRegionGM(scene, owner, shape, bakedFormula, type, color, label, extraFlags = null) {
  try {
    if (!scene || !owner || !shape) return null;
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Dangerous Terrain`, color: hex,
      shapes: [{ ...shape, hole: false }],
      behaviors: [{ type: "edha-content.hazard", name: "Dangerous Terrain", system: { damageFormula: bakedFormula || "1d6", damageType: type || "energy", sourceName: `Dangerous Terrain — ${owner.name}` } }],
      flags: { "edha-content": { hazard: true, scope: "scene", terrain: { ownerUuid: owner.uuid, color }, ...(extraFlags || {}) } },
    }]);
    if (!region) return null;
    if (shape.type === "circle") {
      await edhaHazardVisual(scene, shape.x, shape.y, shape.radius, hex, region.id, label || "🔥");
    } else if (shape.type === "rectangle") {   // line: a player-visible rotated rectangle Drawing
      try {
        await scene.createEmbeddedDocuments("Drawing", [{
          x: shape.x, y: shape.y, rotation: shape.rotation || 0,
          shape: { type: "r", width: shape.width, height: shape.height },
          strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
          fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
          text: label || "🔥 Dangerous Terrain", fontSize: 18, textColor: hex, textAlpha: 0.9,
          flags: { "edha-content": { hazardVisual: { regionId: region.id } } },
        }]);
      } catch (e) {}
    }
    return region;
  } catch (e) { console.error("Edha Content | place hazard region failed", e); return null; }
}
// Drop a hazard: bake the formula against the OWNER, then write GM-side (direct or via socket for players).
// `extraFlags` merges into the Region's edha-content flags (e.g. Pinpoint's followTokenUuid).
async function edhaDropHazard(owner, scene, shape, formulaRaw, type, color, label, extraFlags = null) {
  const baked = Roll.replaceFormulaData(formulaRaw || EDHA_CHARGE_DMG, owner.getRollData(), { missing: "0" });
  if (game.user?.isGM) return edhaPlaceHazardRegionGM(scene, owner, shape, baked, type, color, label, extraFlags);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to place dangerous terrain."); return null; }
  try { game.socket.emit("module.edha-content", { action: "place-hazard-region", payload: { sceneId: scene.id, ownerUuid: owner.uuid, shape, baked, type, color, label, extraFlags } }); } catch (e) {}
  return null;
}

/* --- Charge marker + the Detonate card ------------------------------------------------------------ */
async function edhaSetChargeMarker(owner, item) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene to set a Charge."); return; }
    if (!edhaConsumeCost(item)) return;
    const sizeFt = 10;   // Set Charge detonation radius
    const hex = EDHA_COLOR_HEX.red;
    const pt = await edhaPickPoint(`Click where to place the ${item.name} (right-click to cancel).`);
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: sizeFt, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, fillAlpha: 0.12, flags: { "edha-content": { charge: item.name } },
    }]);
    const list = foundry.utils.deepClone(edhaGetCharges(owner));
    const cap = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
    list.push({ id: foundry.utils.randomID(), sceneId: scene.id, templateId: tpl?.id, x: pt.x, y: pt.y, sizeFt,
                pinpoint: false, formula: item.system?.damage?.formula || EDHA_CHARGE_DMG, type: item.system?.damage?.type || "energy" });
    while (list.length > cap) { const drop = list.shift(); try { void scene.templates?.get(drop.templateId)?.delete()?.catch(() => {}); } catch (e) {} }
    await edhaSetCharges(owner, list);
    edhaPostChargesCard(owner);
    edhaPostChargeArmCard(owner, list[list.length - 1], list.length);
  } catch (e) { console.error("Edha Content | set charge failed", e); }
}
/* --- Charge trigger arming + watchers (07-16c, Ben E18 — supersedes the 06-16 "declared text,
 * no auto-hook" ruling: all three declared conditions ARE nameable hooks now). Arm a trigger on
 * the freshly placed Charge; the watchers whisper a Detonate prompt (the same edha-charge-btn
 * machinery) the moment it fires — detonation stays the owner's click, never automatic. */
function edhaPostChargeArmCard(owner, charge, n) {
  if (!charge) return;
  const mk = (kind, label) => `<button type="button" class="edha-charge-arm" data-owner="${owner.uuid}" data-charge="${charge.id}" data-kind="${kind}">${label}</button>`;
  ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>🧨 <strong>Set Charge #${n}</strong> — arm its trigger (for the target-bound arms, TARGET the creature first; the engine prompts you to detonate when it fires):</p>` +
      `${mk("enter", "A creature enters the blast (10 ft)")} ${mk("target-moves", "My TARGET moves")} ${mk("target-damaged", "My TARGET takes damage")} ${mk("manual", "Manual (table call)")}</div>` });
}
async function edhaChargeArmClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.owner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    const list = foundry.utils.deepClone(edhaGetCharges(owner));
    const ch = list.find(c => c.id === ds.charge); if (!ch) { ui.notifications?.warn("Edha: that Charge is gone (past the cap or detonated)."); return; }
    if (ds.kind === "manual") delete ch.trig;
    else if (ds.kind === "enter") ch.trig = { kind: "enter" };
    else {
      const t = Array.from(game.user?.targets ?? [])[0] ?? null;
      if (!t?.actor) { ui.notifications?.warn("Edha: target the creature first, then click the arm button."); return; }
      ch.trig = { kind: ds.kind, targetUuid: t.actor.uuid, targetName: t.name };
    }
    await edhaSetCharges(owner, list);
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
    btn.textContent += " ✓";
  } catch (e) { console.error("Edha Content | charge arm failed", e); }
}
async function edhaChargeTrigFire(owner, chargeId, why) {
  try {
    const list = foundry.utils.deepClone(edhaGetCharges(owner));
    const idx = list.findIndex(c => c.id === chargeId); if (idx < 0) return;
    if (!list[idx].trig || list[idx].trig.fired) return;
    list[idx].trig.fired = true;   // one prompt per arm — re-arm from the card if it should watch again
    await edhaSetCharges(owner, list);
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧨 <strong>Set Charge trigger</strong>: ${why} — detonate?</p><button type="button" class="edha-charge-btn" data-owner="${owner.uuid}" data-charge="${chargeId}">Detonate #${idx + 1}</button></div>` });
  } catch (e) { console.error("Edha Content | charge trigger fire failed", e); }
}
Hooks.on("updateToken", (doc, changes) => {
  try {
    if (!("x" in changes) && !("y" in changes)) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one watcher
    const moverActor = doc.actor; if (!moverActor) return;
    const gs = doc.parent?.grid?.size || 100, gd = doc.parent?.grid?.distance || 5;
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const newC = { x: (changes.x ?? doc.x) + w, y: (changes.y ?? doc.y) + h };
    for (const owner of (game.actors ?? [])) {
      const charges = edhaGetCharges(owner); if (!charges.length) continue;
      for (const ch of charges) {
        const trig = ch.trig; if (!trig || trig.fired) continue;
        if (trig.kind === "target-moves" && trig.targetUuid === moverActor.uuid) { void edhaChargeTrigFire(owner, ch.id, `<strong>${trig.targetName}</strong> moved`); continue; }
        if (trig.kind === "enter" && Math.hypot(newC.x - ch.x, newC.y - ch.y) / gs * gd <= (ch.sizeFt || 10)) {
          void edhaChargeTrigFire(owner, ch.id, `<strong>${doc.name}</strong> entered the blast radius`);
        }
      }
    }
  } catch (e) { /* non-fatal */ }
});
// The target-damaged arm is checked from the applyDamage post-pass (edhaChargeDamagedCheck).
async function edhaChargeDamagedCheck(victim) {
  try {
    if (!victim) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;
    for (const owner of (game.actors ?? [])) {
      for (const ch of edhaGetCharges(owner)) {
        if (ch.trig?.kind === "target-damaged" && !ch.trig.fired && ch.trig.targetUuid === victim.uuid) {
          void edhaChargeTrigFire(owner, ch.id, `<strong>${ch.trig.targetName}</strong> took damage`);
        }
      }
    }
  } catch (e) { /* non-fatal */ }
}
function edhaPostChargesCard(owner) {
  const list = edhaGetCharges(owner);
  if (!list.length) return;
  const rows = list.map((c, i) =>
    `<button type="button" class="edha-charge-btn" data-owner="${owner.uuid}" data-charge="${c.id}">Detonate #${i + 1}${c.pinpoint ? " ⊕" : ""}</button>`).join(" ");
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
    content:
      `<div class="edha-burst-card"><p>🧨 <strong>Charges set:</strong> ${list.length} (cap = tier).</p>` +
      `<p style="opacity:.85;font-size:.9em">Declare each Charge's trigger at the table; detonate as a Free Action on your turn. ⊕ = Pinpoint.</p>` +
      `${rows} <button type="button" class="edha-charge-all" data-owner="${owner.uuid}">Detonate ALL</button></div>` });
}

// Core: detonate the given charges, roll/apply damage, run Concussive Yield, drop terrain at each.
async function edhaResolveCharges(owner, charges, { radiusFt = null, bonusFormula = "", ignoreDeflect = false, doubleCaughtFormula = "", merged = false, mergeFormula = "", label = "Detonation" } = {}) {
  try {
    const scene = canvas?.scene; if (!scene || !charges?.length) { ui.notifications?.info("No active Charges to detonate."); return; }
    const rd = owner.getRollData();
    const allRolls = [], hits = [], lines = [], everyCaught = [];
    const countById = new Map();
    const pinTalent = owner.items?.find(i => edhaIsTalent(i) && i.name === "Pinpoint Charge");
    for (const ch of charges) {
      const sizeFt = radiusFt || ch.sizeFt || 10;
      const caught = edhaEnemyTokensInCircle(owner, ch.x, ch.y, sizeFt);
      for (const t of caught) { countById.set(t.id, (countById.get(t.id) || 0) + 1); everyCaught.push(t); }
      const dice = await new Roll(Roll.replaceFormulaData((ch.formula || EDHA_CHARGE_DMG) + (bonusFormula || ""), rd, { missing: "0" })).evaluate();
      allRolls.push(dice);
      const amt = Math.max(0, Math.floor(dice.total));
      for (const t of caught) {
        const a = amt + (ignoreDeflect ? edhaDeflectOf(t.actor) : 0);   // The Unmooring ignores deflect
        hits.push({ actorUuid: t.actor.uuid, amount: a, type: ch.type || "energy", heal: false });
        lines.push(`${t.name}: ${a} ${ch.type || "energy"}${ignoreDeflect && edhaDeflectOf(t.actor) ? " (deflect ignored)" : ""}`);
      }
      if (ch.pinpoint && pinTalent && caught[0]) {   // Pinpoint: extra keen to the primary target, ignoring its deflect
        const pin = await new Roll(Roll.replaceFormulaData(pinTalent.system?.damage?.formula || "(@tier)d6", rd, { missing: "0" })).evaluate();
        allRolls.push(pin);
        const pa = Math.max(0, Math.floor(pin.total)) + edhaDeflectOf(caught[0].actor);
        hits.push({ actorUuid: caught[0].actor.uuid, amount: pa, type: pinTalent.system?.damage?.type || "keen", heal: false });
        lines.push(`${caught[0].name}: +${pa} keen (Pinpoint — ignores deflect)`);
      }
      // Terrain at the marker (bumped formula if a merge talent fired). A Pinpoint's terrain is
      // instead CENTERED on the primary target and tagged to FOLLOW it while it lives (the card:
      // "if the target survives, the dangerous terrain moves with the target for the scene").
      const pin0 = (ch.pinpoint && pinTalent && caught[0]) ? caught[0] : null;
      await edhaDropHazard(owner, scene,
        { type: "circle", x: pin0 ? pin0.center.x : ch.x, y: pin0 ? pin0.center.y : ch.y, radius: edhaFtToPx(sizeFt) },
        merged ? (mergeFormula || EDHA_CHARGE_DMG) : (ch.formula || EDHA_CHARGE_DMG), ch.type || "energy", "red", merged ? "🔥 Merged Hazard" : "🔥",
        pin0 ? { followTokenUuid: pin0.document?.uuid ?? null } : null);
    }
    // Cascading Failure: a foe caught in 2+ detonations takes an extra [Tier][Die].
    if (doubleCaughtFormula) {
      for (const [id, n] of countById) {
        if (n < 2) continue;
        const t = everyCaught.find(x => x.id === id); if (!t) continue;
        const extra = await new Roll(Roll.replaceFormulaData(doubleCaughtFormula, rd, { missing: "0" })).evaluate();
        allRolls.push(extra);
        hits.push({ actorUuid: t.actor.uuid, amount: Math.max(0, Math.floor(extra.total)), type: "energy", heal: false });
        lines.push(`${t.name}: +${Math.max(0, Math.floor(extra.total))} energy (caught in ${n} blasts)`);
      }
    }
    // Apply damage (GM direct, else relay), post the summary, then Concussive Yield + cleanup.
    const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (hits.length) { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply detonation damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: allRolls,
      content: `<div class="edha-burst-card"><p>💥 <strong>${label}</strong> — ${charges.length} Charge(s)${ignoreDeflect ? " (ignores deflect — GM applies full)" : ""}:</p><p style="font-size:.95em">${lines.length ? lines.join("<br>") : "no creatures caught"}</p>${merged ? `<p style="opacity:.8;font-size:.9em">Dangerous-terrain zones merge into one contiguous hazard (GM treats overlapping zones as one).</p>` : ""}</div>` });
    if (edhaOwnsTalent(owner, "Concussive Yield")) await edhaSpeedVsRedProne(owner, everyCaught, "Concussive Yield");
    // Remove the detonated charges + their markers.
    const dets = new Set(charges.map(c => c.id));
    for (const c of charges) { try { void scene.templates?.get(c.templateId)?.delete()?.catch(() => {}); } catch (e) {} }
    await edhaSetCharges(owner, edhaGetCharges(owner).filter(c => !dets.has(c.id)));
  } catch (e) { console.error("Edha Content | resolve charges failed", e); }
}
function edhaFtToPx(ft) { const s = canvas?.scene; const gs = s?.grid?.size || 100, gd = s?.grid?.distance || 5; return Math.max(Math.round(gs / 2), Math.round((ft / gd) * gs)); }

async function edhaDetonateOne(ownerUuid, chargeId) {
  const ref = await fromUuid(ownerUuid).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
  const ch = edhaGetCharges(owner).find(c => c.id === chargeId); if (!ch) { ui.notifications?.info("That Charge is already gone."); return; }
  await edhaResolveCharges(owner, [ch], { label: "Detonate Charge" });
  edhaPostChargesCard(owner);
}
async function edhaDetonateAllFree(ownerUuid) {
  const ref = await fromUuid(ownerUuid).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
  await edhaResolveCharges(owner, edhaGetCharges(owner), { label: "Detonate All" });
}
function edhaBindChargeButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-charge-arm").forEach(btn => btn.addEventListener("click", edhaChargeArmClick));
  root?.querySelectorAll?.(".edha-charge-btn").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; void edhaDetonateOne(btn.dataset.owner, btn.dataset.charge);
  }));
  root?.querySelectorAll?.(".edha-charge-all").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; void edhaDetonateAllFree(btn.dataset.owner);
  }));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindChargeButtons(html));

/* --- Destruction dispatch — intercept at preUseItem (cancel the default single-target flow, manage cost
 * ourselves), mirroring the edha-burst takeover so there's no stray default card / damage roll. --------- */
const EDHA_DESTRUCTION_TALENTS = new Set(["Set Charge", "Pinpoint Charge", "Cascading Failure", "The Unmooring", "Fault Line", "Combustion Chain", "Walking Ruin"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!EDHA_DESTRUCTION_TALENTS.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Set Charge": void edhaSetChargeMarker(actor, item); break;   // consumes 1 Inv inside; refunds on cancel
      case "Fault Line": void edhaFaultLine(actor, item); break;          // consumes 2 Inv inside; refunds on cancel

      case "Pinpoint Charge": {
        const list = foundry.utils.deepClone(edhaGetCharges(actor));
        const last = [...list].reverse().find(c => !c.pinpoint);
        if (!last) { ui.notifications?.warn("Edha: place a Charge first, then declare it a Pinpoint Charge."); break; }
        if (!edhaConsumeCost(item)) break;
        last.pinpoint = true; void edhaSetCharges(actor, list).then(() => edhaPostChargesCard(actor));
        break;
      }
      case "Cascading Failure": {
        const list = edhaGetCharges(actor);
        if (!list.length) { ui.notifications?.warn("Edha: no active Charges to detonate."); break; }
        if (!edhaConsumeCost(item)) break;
        void edhaResolveCharges(actor, list, { label: "Cascading Failure",
          doubleCaughtFormula: item.system?.damage?.formula || EDHA_CHARGE_DMG,
          merged: list.length >= 2, mergeFormula: EDHA_CHARGE_DMG });
        break;
      }
      case "The Unmooring": {
        if (actor.getFlag("edha-content", "unmooringUsed")) { ui.notifications?.warn("Edha: The Unmooring is once per scene."); break; }
        const list = edhaGetCharges(actor);
        if (!list.length) { ui.notifications?.warn("Edha: no active Charges to detonate."); break; }
        if (!edhaConsumeCost(item)) break;
        void actor.setFlag("edha-content", "unmooringUsed", true);
        void edhaResolveCharges(actor, list, { label: "The Unmooring", radiusFt: 15, ignoreDeflect: true,
          bonusFormula: " + @attr.int", merged: true, mergeFormula: EDHA_CHARGE_DMG });
        break;
      }
      case "Combustion Chain":
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🔥 <strong>Combustion Chain</strong> is armed — it fires automatically (Reaction) when a character drops to 0 HP in your dangerous terrain. You can also trigger it by hand here.</p><button type="button" class="edha-combustion" data-owner="${actor.uuid}">Spread &amp; ignite (GM positions)</button></div>` });
        break;
      case "Walking Ruin": {
        const on = !actor.getFlag("edha-content", "walkingRuin");
        void actor.setFlag("edha-content", "walkingRuin", on);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p>🏚️ <strong>Walking Ruin</strong> ${on ? "active" : "ended"} — ${on ? "spaces you move through become dangerous terrain (this scene)." : "no longer leaving terrain."} (+10 ft Speed is passive.)</p>` });
        break;
      }
    }
    return false;   // cancel the system's default use() for every Destruction talent (no stray card/roll)
  } catch (e) { console.error("Edha Content | Destruction preUse-hook failed", e); }
});

// Fault Line: a 60 ft × 5 ft line of [Tier][Die] + Str energy, Speed-vs-Red → Prone, leaves a line hazard.
async function edhaFaultLine(owner, item) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene for Fault Line."); return; }
    const tok = edhaCasterToken(owner); if (!tok) { ui.notifications?.warn("Edha: drop/select your token first."); return; }
    if (!edhaConsumeCost(item)) return;
    const cx = tok.center.x, cy = tok.center.y;
    const pt = await edhaPickPoint("Click the direction the Fault Line runs (60 ft from you).");
    if (!pt) { edhaRefundCost(item); ui.notifications?.info("Fault Line canceled — cost refunded."); return; }
    const lengthFt = 60, widthFt = 5;
    const caught = edhaEnemyTokensInLine(owner, cx, cy, pt.x, pt.y, lengthFt, widthFt);
    const rd = owner.getRollData();
    const dice = await new Roll(Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_CHARGE_DMG, rd, { missing: "0" })).evaluate();
    const amt = Math.max(0, Math.floor(dice.total));
    const dtype = item.system?.damage?.type || "energy";
    const hits = caught.map(t => ({ actorUuid: t.actor.uuid, amount: edhaIsConstruct(t.actor) ? amt * 3 : amt, type: dtype, heal: false }));   // structures/Constructs take triple
    const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (hits.length) { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply Fault Line."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
    // Line dangerous terrain: a rotated rectangle, one end at the caster, running 60 ft toward the click.
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const lenPx = Math.round((lengthFt / gd) * gs), wPx = Math.round((widthFt / gd) * gs);
    const ang = Math.atan2(pt.y - cy, pt.x - cx), angleDeg = ang * 180 / Math.PI;
    const ccx = cx + Math.cos(ang) * lenPx / 2, ccy = cy + Math.sin(ang) * lenPx / 2;   // line centre
    await edhaDropHazard(owner, scene, { type: "rectangle", x: ccx - lenPx / 2, y: ccy - wPx / 2, width: lenPx, height: wPx, rotation: angleDeg },
      item.system?.damage?.formula || EDHA_CHARGE_DMG, item.system?.damage?.type || "energy", "red", "🔥 Fault Line");
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: [dice],
      content: `<div class="edha-burst-card"><p>💥 <strong>Fault Line</strong> — ${caught.length} in the line take <strong>${amt}</strong> energy (Constructs ×3). Structures take triple too (GM-side, no actor for a wall).</p></div>` });
    await edhaSpeedVsRedProne(owner, caught, "Fault Line");
  } catch (e) { console.error("Edha Content | Fault Line failed", e); }
}

// Walking Ruin: while active this scene, drop a small dangerous-terrain patch where the token was.
Hooks.on("preUpdateToken", (tokenDoc, changes) => {
  try {
    if (!(("x" in changes) || ("y" in changes))) return;
    tokenDoc._edhaPrevCenter = { x: tokenDoc.object?.center?.x ?? null, y: tokenDoc.object?.center?.y ?? null };
  } catch (e) {}
});
Hooks.on("updateToken", (tokenDoc, changes) => {
  try {
    if (!(("x" in changes) || ("y" in changes))) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // ONE applier — avoid a per-client double-drop
    const actor = tokenDoc.actor; if (!actor || !edhaOwnsTalent(actor, "Walking Ruin") || !actor.getFlag("edha-content", "walkingRuin")) return;
    const prev = tokenDoc._edhaPrevCenter; if (!prev || prev.x == null) return;
    const scene = tokenDoc.parent ?? canvas?.scene; if (!scene) return;
    // one patch per move step, at the vacated square; skip if a Walking-Ruin patch is already there
    const near = (scene.regions ?? []).some(r => r.getFlag?.("edha-content", "terrain")?.ownerUuid === actor.uuid
      && (r.shapes ?? []).some(s => s.type === "circle" && Math.hypot((s.x ?? 0) - prev.x, (s.y ?? 0) - prev.y) < (scene.grid?.size || 100) / 2));
    if (near) return;
    void edhaDropHazard(actor, scene, { type: "circle", x: prev.x, y: prev.y, radius: Math.round((scene.grid?.size || 100) / 2) }, EDHA_CHARGE_DMG, "energy", "red", "🏚️");
  } catch (e) { console.error("Edha Content | Walking Ruin move-terrain failed", e); }
});

// Pinpoint Charge: terrain tagged followTokenUuid recenters on the primary target as it moves —
// "if the target survives, the dangerous terrain moves with the target" (a downed target stops
// carrying the blaze; the Region stays where it fell). Was backlog; wired 2026-07-04.
Hooks.on("updateToken", (tokenDoc, changes) => {
  try {
    if (!(("x" in changes) || ("y" in changes))) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // ONE applier
    const scene = tokenDoc.parent ?? canvas?.scene; if (!scene) return;
    if ((Number(tokenDoc.actor?.system?.resources?.hea?.value) || 0) <= 0) return;
    for (const region of (scene.regions ?? [])) {
      if (region.getFlag?.("edha-content", "followTokenUuid") !== tokenDoc.uuid) continue;
      void edhaRecenterTerrain(scene, region, tokenDoc);
    }
  } catch (e) { console.error("Edha Content | Pinpoint terrain-follow failed", e); }
});
async function edhaRecenterTerrain(scene, region, tokenDoc) {
  try {
    const gs = scene.grid?.size || 100;
    const cx = Math.round(tokenDoc.x + ((tokenDoc.width || 1) * gs) / 2);
    const cy = Math.round(tokenDoc.y + ((tokenDoc.height || 1) * gs) / 2);
    const shapes = foundry.utils.deepClone(region.shapes ?? []);
    const c = shapes.find(s => s.type === "circle" && !s.hole); if (!c) return;
    c.x = cx; c.y = cy;
    await region.update({ shapes });
    const draw = (scene.drawings ?? []).find(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
    if (draw) await draw.update({ x: cx - (Number(c.radius) || 0), y: cy - (Number(c.radius) || 0) });   // the grow-terrain visual-sync shape
  } catch (e) { console.error("Edha Content | terrain recenter failed", e); }
}

/* --- Pyre — "at the end of each of your turns, the dangerous terrain spreads to one adjacent
 * flammable square" (was backlog; wired 2026-07-04). End-of-the-owner's-turn detection = the
 * Bone-Garden combat.previous shape; the spread itself = the Spreading-Roots +5 ft Region-grow
 * (edhaGrowTerrain), fired from a whispered confirm card so "flammable" stays GM-judged — the
 * radius grow over-covers a single square, so the GM treats non-flammable directions as unburned
 * (the zone-merge convention). The confirm is FREE (data-edha-free — no Investiture). ------------- */
async function edhaPyreTurnEnd(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const actor = combat.turns?.[prevTurn]?.actor; if (!actor || !edhaOwnsTalent(actor, "Pyre")) return;
    const scene = canvas?.scene; if (!scene) return;
    const zones = (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "sourceItem") === "Pyre"
      && r.getFlag?.("edha-content", "sourceOwnerUuid") === actor.uuid);
    for (const region of zones) {
      // 07-12 rework (Ben): expansion is SQUARE-BY-SQUARE and the GM picks the square, so the
      // confirm card whispers to the GM; the owner also gets an Extinguish control on the card
      // ("turn off this magic fire before it burns the building down with us inside").
      const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
      ChatMessage.create({
        whisper: [...new Set([...gmIds, ...edhaWhisperIds(actor)])], speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div class="edha-trigger-card"><p>🔥 <strong>Pyre</strong> — end of ${actor.name}'s turn: the blaze spreads to one adjacent <em>flammable</em> square (GM judges flammability; non-flammable directions stay unburned).</p>`
          + `<button type="button" class="edha-spread-sq-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="Pyre">Spread — GM clicks the square it burns into</button>`
          + `<button type="button" class="edha-extinguish-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="Pyre">Extinguish (put the fire out)</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | Pyre spread failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaPyreTurnEnd(combat); });

// Combustion Chain reaction-card button: spread the owner's zones (GM-positioned).
Hooks.on("renderChatMessageHTML", (msg, html) => {
  try {
    const root = html instanceof HTMLElement ? html : html?.[0];
    root?.querySelectorAll?.(".edha-combustion").forEach(btn => btn.addEventListener("click", async (ev) => {
      ev.preventDefault(); btn.disabled = true;
      const ref = await fromUuid(btn.dataset.owner).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>🔥 <strong>Combustion Chain</strong>: each of ${owner.name}'s dangerous-terrain zones spreads 5 ft, and a 10 ft zone ignites on the fallen character. GM grows the Regions / drops the new zone.</p>` });
    }));
  } catch (e) {}
});

// Combustion Chain AUTO-fire: when a foe drops to 0 HP inside YOUR dangerous terrain, offer the reaction
// off the same HP-sync the defeated-overlay uses. Drops a fresh 10 ft hazard on the body automatically.
Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!game.user?.isGM || actor.type === "character") return;
    const hp = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hp === undefined || hp > 0) return;
    const tok = edhaCasterToken(actor); if (!tok) return;
    for (const owner of edhaCharacterOwnersOf("Combustion Chain")) {
      if (!edhaTokenInOwnedTerrain(tok, owner)) continue;            // only if the body fell in THIS owner's terrain
      const scene = tok.scene ?? canvas?.scene;
      await edhaDropHazard(owner, scene, { type: "circle", x: tok.center.x, y: tok.center.y, radius: edhaFtToPx(10) }, EDHA_CHARGE_DMG, "energy", "red", "🔥 Combustion");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🔥 <strong>Combustion Chain</strong> (${owner.name}): ${actor.name} fell in your dangerous terrain — a 10 ft zone ignites on the body. Your existing zones each spread 5 ft.<button type="button" class="edha-combustion" data-owner="${owner.uuid}" style="display:block;margin-top:4px">Spread your zones 5 ft (GM grows the Regions)</button></p></div>` });
    }
  } catch (e) { console.error("Edha Content | Combustion Chain auto-fire failed", e); }
});

// Socket: GM-side line/circle hazard placement for players (mirrors burst-apply).
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;
        if (data?.action !== "place-hazard-region") return;
        const p = data.payload || {}; const scene = game.scenes?.get(p.sceneId);
        const oref = await fromUuid(p.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref;
        if (scene && owner) await edhaPlaceHazardRegionGM(scene, owner, p.shape, p.baked, p.type, p.color, p.label, p.extraFlags ?? null);
      } catch (e) { console.error("Edha Content | place-hazard-region relay failed", e); }
    });
  } catch (e) {}
});

// Scene / combat end: fizzle Charges, clear markers, and reset the once-per-scene + Walking-Ruin flags.
async function edhaClearCharges() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      if (a.getFlag?.("edha-content", "charges")) await a.unsetFlag("edha-content", "charges");
      if (a.getFlag?.("edha-content", "unmooringUsed")) await a.unsetFlag("edha-content", "unmooringUsed");
      if (a.getFlag?.("edha-content", "walkingRuin")) await a.unsetFlag("edha-content", "walkingRuin");
    }
    for (const scene of game.scenes ?? []) {
      const stale = (scene.templates ?? []).filter(t => t.getFlag?.("edha-content", "charge"));
      if (stale.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", stale.map(t => t.id));
    }
  } catch (e) { console.error("Edha Content | clear charges failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearCharges(); } catch (e) {} });

/* ============================================================================================
 * LIFE (Anaveth, deity) tree engine (2026-06-17) — a Blue/Green healer-buffer. Reuses the Green heal
 * machinery wholesale (edhaCrossHeal, the Resurgent-Growth regrowth-queue pattern, edhaAddAffliction,
 * the Bulwark redirect cards, edha-overflow-thp) — NO side-engine, NO new data handler or sidecar.
 * Colors Blue/Green; tag prefix "Life (Anaveth)."; build `foundry-build deity` → pack `edha-deity`.
 *
 * Wired via AUTHORED data events (already in deity-life.json — pack-built; NOT touched by this section):
 *   • Vital Diagnosis  — edha-apply-status (Diagnosed + @tier vital vs the marked creature, any ally).
 *   • Life Surge       — base heal + edha-overflow-thp (healing beyond max HP → Temp HP).
 *   • Overgrowth       — base heal + edha-overflow-thp; the +1 Deflect (stacks to 3) stays manual.
 *   • Prognosis        — edha-damage-rider (+[T][D] heal vs a conditioned creature) +
 *                        edha-marked-damage-trigger (recover 1 Inv when a Diagnosed creature is hit).
 *
 * Wired NAME-BASED here (talents stay events:{} — ENGINE-ONLY, NO pack rebuild; F5/relaunch). Every
 * caster-scaled buff is BAKED on use and parked as owner-relative state (mirroring the Charge / Reserve
 * / affliction flag pattern), then read by the SAME applyDamage pre/post-pass and the combatTurnChange
 * turn-start pass the leyline trees use:
 *   • Adaptive Mutation — on use, a whispered card stamps a `mutation` flag on the willing target (one
 *     per creature; scene). Bone Spurs (+tier keen) rides edhaLifeOutgoingBonus in the damage PRE-pass;
 *     Venom Glands (Afflicted ½[T][D] vital) rides edhaLifeVenomOnHit in the POST-pass (reuses
 *     edhaAddAffliction); Dense Tissue (+2 Deflect) subtracts from deflectable incoming via
 *     edhaLifeDeflectReduce (the mirror of the ignore-deflect trick — "+deflect = subtract from
 *     energy/impact/keen").
 *   • Primal Regeneration / Apex Form regen — a `lifeRegen` entry parked on the OWNER (like the
 *     Resurgent-Growth queue); edhaResolveLifeRegen heals the target at the START OF THE TARGET'S turn
 *     via edhaCrossHeal. Primal pays Tier+1 (or [T][D]+1 when the target carries a mutation) and ENDS if
 *     the target takes Vital/Spirit damage (edhaLifeRegenEndOnDamage); Apex pays [T][D] and persists.
 *   • Apex Form (capstone) — an `apexForm` flag on the willing target (may be self): +2 Deflect
 *     (edhaLifeDeflectReduce) + +tier vital on its attacks (edhaLifeOutgoingBonus) + the regen entry.
 *   • Surgical Precision — the base skill_test heal (2×[T][D] hit / [T][D] graze via grazeOverride) is
 *     the system's; the cleanse rides cosmere-rpg.damageRoll and is GATED ON THE REAL ROLL — it fires
 *     only when the roll is NOT a graze (the success branch), then posts a cleanse card
 *     (Weakened/Disoriented/Slowed). Test is vs Physical (a DEFENSE) → base pipeline, NOT the contest core.
 *   • Lifeline — on use, links a chosen creature to the owner (`lifeline` flag). When the linked
 *     creature takes damage, edhaBulwarkReactions offers the owner an owner-judged redirect card (take
 *     UP TO half as Spirit — Spirit already ignores Deflect — and the linked creature heals [T][D];
 *     once per round). Reuses the Shared-Burden redirect (heal the victim back + applyDamage the owner).
 *
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Bone Spurs / Venom Glands "melee" clause — edhaAttackKind gates both: a definitive ranged hit
 *     stands the rider down (carded); unknown (non-weapon dealer / schema drift) still fires with
 *     the GM-withhold note. ⚑ bench-verify the cosmere weapon system.range shape.
 *   • Apex Form "takes an Injury when the effect ends" — edhaAddInjury fires from the apexForm
 *     scene-clear in edhaClearLifeState (GM-side); type keyed "vital", world "Injuries" table wins.
 *   (Shared backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9, consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Adaptive Mutation Dense Tissue "immune to forced movement" — WIRED 07-16c (Ben E16): every
 *     engine push refuses at edhaRunPush + an edhaHostileMove preUpdateToken veto backstop
 *     (willing slides stamp only edhaForced and pass).
 *   • Apex Form "active mutations doubled" — WIRED 07-16c (Ben E19): Bone Spurs keen, Venom
 *     amount, and Dense Tissue's deflect all ×2 while the dealer/bearer carries apexForm.
 *   • Overgrowth's +1 Deflect — WIRED 07-12 (the AE stack, edhaOvergrowthDeflectStack; this line
 *     was stale until 07-16c). (Vital Diagnosis's "know its exact HP/defenses"
 *     was UPGRADED 2026-07-04: on use, Knowledge's whispered HP/conditions/defense snapshot
 *     (edhaGnosisRevealLines, built AFTER Life declared this manual) posts for the synced target.)
 *   • CONTEST-EXEMPT: none — Surgical Precision tests vs a DEFENSE (base pipeline), not an opposed skill.
 * ============================================================================================ */
// Overgrowth's "+1 Deflect (stacks to 3)" — one AE per creature, its bonus stepped 1→2→3 per heal
// (key system.deflect.bonus, the same DerivedValueField .bonus fold the defense buffs use). "End of
// scene" = cleared when combat ends (the Kindle-light convention). Called from the applyDamage
// heal post-pass; the applying client just healed the target, so it can write the AE too.
async function edhaOvergrowthDeflectStack(target) {
  try {
    const ex = (target.effects ?? []).find(e => e.getFlag?.("edha-content", "overgrowthDeflect"));
    const cur = ex ? (Number(ex.getFlag("edha-content", "overgrowthDeflect")) || 1) : 0;
    if (cur >= 3) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🌿 <strong>Overgrowth</strong>: ${target.name}'s natural armor is already at <strong>+3 Deflect</strong> (max).</p>` }); return; }
    const n = cur + 1;
    const changes = [{ key: "system.deflect.bonus", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(n), priority: 20 }];
    if (ex) await ex.update({ name: `Overgrowth (+${n} Deflect)`, changes, "flags.edha-content.overgrowthDeflect": n });
    else await target.createEmbeddedDocuments("ActiveEffect", [{
      name: `Overgrowth (+${n} Deflect)`, img: "icons/magic/nature/barrier-shield-wood-vines.webp", changes,
      description: `<p>Natural armor from Overgrowth: +${n} Deflect (stacks to 3) until the end of the scene.</p>`,
      flags: { "edha-content": { overgrowthDeflect: n } },
    }]);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🌿 <strong>Overgrowth</strong>: ${target.name} grows natural armor — <strong>+${n} Deflect</strong>${n >= 3 ? " (max)" : " (stacks to 3)"} until end of scene.</p>` });
  } catch (e) { console.error("Edha Content | Overgrowth deflect stack failed", e); }
}
Hooks.on("deleteCombat", () => {   // end of encounter ≈ end of scene (Kindle-light convention)
  try {
    if (!game.user?.isGM) return;
    for (const t of canvas?.tokens?.placeables ?? []) {
      const ex = t.actor?.effects?.filter(e => e.getFlag?.("edha-content", "overgrowthDeflect")) ?? [];
      if (ex.length) void t.actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id));
    }
  } catch (e) {}
});

const EDHA_LIFE_GREEN_DIE = "(@tier)d(2 * @skills.green.rank + 2)";   // [Tier][Die] on the Green heal track
const EDHA_LIFE_CLEANSE = ["weakened", "disoriented", "slowed"];      // Surgical Precision cleanse set
const EDHA_MUTATION_LABEL = { boneSpurs: "Bone Spurs", venomGlands: "Venom Glands", denseTissue: "Dense Tissue" };
const _edhaSurgicalDebounce = new Map();   // dedupe the twin (main + graze) damageRoll fire per use

// Cross-actor flag write (self → setFlag; else relay to the GM via the generic set-flag socket).
async function edhaSetActorFlagCross(actor, key, value) {
  if (!actor || !key) return;
  if (actor.isOwner) { try { await actor.setFlag("edha-content", key, value); } catch (e) {} return; }
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to apply that to ${actor.name}.`); return; }
  try { game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: actor.uuid, key, value } }); } catch (e) {}
}

/* --- Buff reads for the applyDamage pre/post-pass (called from the central wrapper) ---------------- */
// Extra Deflect granted by Dense Tissue / Apex Form (read off the buffed creature when IT takes damage).
function edhaLifeBonusDeflect(actor) {
  let d = 0;
  const a = actor?.getFlag?.("edha-content", "apexForm");
  const m = actor?.getFlag?.("edha-content", "mutation");
  if (m?.deflect) d += (a ? 2 : 1) * (Number(m.deflect) || 0);   // Apex Form doubles active mutations (07-16c)
  if (a?.deflect) d += Number(a.deflect) || 0;
  return Math.max(0, d);
}
// +Deflect = subtract from deflectable (energy/impact/keen) incoming instances, before they apply.
function edhaLifeDeflectReduce(target, list) {
  try {
    const d = edhaLifeBonusDeflect(target); if (d <= 0 || !list?.length) return;
    let left = d, done = 0;
    for (const inst of list) {
      if (left <= 0) break;
      if (!inst || inst.type === "heal" || !["energy", "impact", "keen"].includes(inst.type)) continue;
      const cur = Math.max(0, Math.floor(Number(inst.amount) || 0));
      const cut = Math.min(cur, left); inst.amount = cur - cut; left -= cut; done += cut;
    }
    if (done > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🧬 <strong>${target.name}</strong>'s natural armor absorbs <strong>${done}</strong> (Life — Dense Tissue / Apex Form +Deflect).</p>` });
  } catch (e) { console.error("Edha Content | Life deflect-reduce failed", e); }
}
// Bone Spurs (+tier keen, melee — edhaAttackKind-gated) / Apex Form (+tier vital): a bonus instance
// on the BUFFED creature's hit. A definitive ranged hit stands the Spurs down; unknown = owner-judged.
// Apex Form DOUBLES active mutations (07-16c, Ben E19 — was a GM ruling on the numbers).
function edhaLifeOutgoingBonus(dealerActor, list, dealerItem = null) {
  try {
    if (!dealerActor || !list?.length) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;   // only ride a real hit
    const m = dealerActor.getFlag?.("edha-content", "mutation");
    const apexDbl = dealerActor.getFlag?.("edha-content", "apexForm") ? 2 : 1;
    if (m?.kind === "boneSpurs" && m.keen > 0) {
      const kind = edhaAttackKind(dealerItem);
      if (kind === "ranged") {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🦴 <strong>Bone Spurs</strong> (Life): ranged attack — the melee rider stands down.</p>` });
      } else {
        list.push({ amount: Math.floor(m.keen) * apexDbl, type: "keen" });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🦴 <strong>Bone Spurs</strong> (Life): +${Math.floor(m.keen) * apexDbl} keen on the strike${apexDbl > 1 ? " (doubled — Apex Form)" : ""}${kind === "melee" ? " (melee — auto-checked)" : " (melee — GM withholds on a ranged attack)"}.</p>` });
      }
    }
    const a = dealerActor.getFlag?.("edha-content", "apexForm");
    if (a?.vital > 0) {
      list.push({ amount: Math.floor(a.vital), type: "vital" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🌟 <strong>Apex Form</strong> (Life): +${Math.floor(a.vital)} vital on the strike.</p>` });
    }
  } catch (e) { console.error("Edha Content | Life outgoing-bonus failed", e); }
}
// Venom Glands (melee — edhaAttackKind-gated): the buffed creature's hit afflicts the foe (½[T][D]
// vital, baked at apply). A definitive ranged hit doesn't envenom; unknown = owner-judged.
async function edhaLifeVenomOnHit(dealerActor, victim, dealerItem = null) {
  try {
    const m = dealerActor?.getFlag?.("edha-content", "mutation");
    if (m?.kind !== "venomGlands" || !(m.venom > 0) || !victim) return;
    const kind = edhaAttackKind(dealerItem);
    if (kind === "ranged") {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🐍 <strong>Venom Glands</strong> (Life): ranged attack — the venom needs a melee hit.</p>` });
      return;
    }
    const venomDbl = dealerActor.getFlag?.("edha-content", "apexForm") ? 2 : 1;   // Apex Form doubles active mutations (07-16c)
    await edhaToggleStatus(victim, "afflicted", true);
    await edhaAddAffliction(victim, Math.floor(m.venom) * venomDbl, "vital", "Venom Glands");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🐍 <strong>Venom Glands</strong> (Life): ${victim.name} is Afflicted — ${Math.floor(m.venom) * venomDbl} ongoing vital${venomDbl > 1 ? " (doubled — Apex Form)" : ""}${kind === "melee" ? " (melee — auto-checked)" : " (melee — GM withholds on a ranged attack)"}.</p>` });
  } catch (e) { console.error("Edha Content | Venom Glands failed", e); }
}

// Dense Tissue forced-movement VETO (07-16c, Ben E16 — backstop to the edhaRunPush early-out):
// any HOSTILE engine move (options.edhaHostileMove, stamped by pushes/pulls) against a Dense
// Tissue bearer is refused at the document layer. Willing engine slides (edhaForced only) pass.
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (!options?.edhaHostileMove) return;
    if (!("x" in changes) && !("y" in changes)) return;
    if (doc.actor?.getFlag?.("edha-content", "mutation")?.kind !== "denseTissue") return;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: doc.actor }), content: `<p>🧬 <strong>Dense Tissue</strong>: ${doc.name} is immune to forced movement — the push does nothing.</p>` });
    return false;
  } catch (e) { /* fail-open */ }
});

/* --- Primal Regeneration / Apex Form — start-of-turn regen, parked on the OWNER (regrowth pattern) -- */
async function edhaAddLifeRegen(owner, entry) {
  try {
    const list = foundry.utils.deepClone(owner.getFlag("edha-content", "lifeRegen") ?? []);
    const next = list.filter(e => !(e.targetUuid === entry.targetUuid && e.sourceName === entry.sourceName));
    next.push(entry);
    await owner.setFlag("edha-content", "lifeRegen", next);
  } catch (e) { /* perms */ }
}
async function edhaResolveLifeRegen(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const cur = combat.combatant?.actor; if (!cur) return;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const list = owner.getFlag?.("edha-content", "lifeRegen"); if (!list?.length) continue;
      for (const e of list) {
        if (e.targetUuid !== cur.uuid) continue;
        let formula = e.formula;
        if (e.mutationBonus && cur.getFlag?.("edha-content", "mutation")) formula = `${EDHA_LIFE_GREEN_DIE} + 1`;
        const roll = await new Roll(Roll.replaceFormulaData(formula, owner.getRollData(), { missing: "0" })).evaluate();
        const amt = Math.max(0, Math.floor(roll.total));
        if (amt > 0) { await edhaCrossHeal(cur, amt); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🌿 <strong>${e.sourceName}</strong> (${owner.name}): ${cur.name} regenerates <strong>${amt}</strong> HP.</p>` }); }
      }
    }
  } catch (e) { console.error("Edha Content | Life regen resolve failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaResolveLifeRegen(combat); });
// Primal Regeneration ends if the target takes Vital or Spirit damage (drop matching entries everywhere).
async function edhaLifeRegenEndOnDamage(victim, list) {
  try {
    if (!victim || !list?.some(i => Number(i?.amount) > 0 && (i.type === "vital" || i.type === "spirit"))) return;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const l = owner.getFlag?.("edha-content", "lifeRegen"); if (!l?.length) continue;
      const keep = l.filter(e => !(e.targetUuid === victim.uuid && e.endOnVitalSpirit));
      if (keep.length !== l.length) {
        try { await owner.setFlag("edha-content", "lifeRegen", keep); } catch (e) {}
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🥀 <strong>Primal Regeneration</strong> on ${victim.name} ends — it took Vital/Spirit damage.</p>` });
      }
    }
  } catch (e) { console.error("Edha Content | Life regen end-check failed", e); }
}

/* --- Adaptive Mutation — whispered choose-a-mutation card → bake the rider onto the target ---------- */
function edhaPostMutationCard(owner, target) {
  try {
    const t = target ?? owner;
    const opts = [["boneSpurs", "Bone Spurs (+Tier keen, melee)"], ["venomGlands", "Venom Glands (Afflicted ½[T][D] vital)"], ["denseTissue", "Dense Tissue (+2 Deflect)"]];
    const rows = opts.map(([k, l]) => `<button type="button" class="edha-mutation-btn" data-edha-owner="${owner.uuid}" data-edha-target="${t.uuid}" data-edha-kind="${k}">${l}</button>`).join(" ");
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧬 <strong>Adaptive Mutation</strong> — choose ${t.name}'s adaptation (scene; one per creature):</p>${rows}</div>` });
  } catch (e) { console.error("Edha Content | Mutation card failed", e); }
}
async function edhaMutationClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target || !ds.edhaKind) return;
    const kind = ds.edhaKind, rd = owner.getRollData();
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", rd)) || 1);
    let venom = 0;
    if (kind === "venomGlands") { const r = await new Roll(`floor((${EDHA_LIFE_GREEN_DIE}) / 2)`, rd).evaluate(); venom = Math.max(0, Math.floor(r.total)); }
    const flag = { kind, sceneId: canvas?.scene?.id ?? null, ownerUuid: owner.uuid,
      keen: kind === "boneSpurs" ? tier : 0, venom, deflect: kind === "denseTissue" ? 2 : 0 };
    await edhaSetActorFlagCross(target, "mutation", flag);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-mutation-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ applied";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧬 <strong>Adaptive Mutation</strong>: ${target.name} gains <strong>${EDHA_MUTATION_LABEL[kind]}</strong> for the scene.</p>` });
  } catch (e) { console.error("Edha Content | Mutation click failed", e); }
}

/* --- Apex Form / Primal Regeneration — apply the buff(s) to the willing target --------------------- */
async function edhaApplyApexForm(owner, target) {
  try {
    const t = target ?? owner, rd = owner.getRollData();
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", rd)) || 1);
    await edhaSetActorFlagCross(t, "apexForm", { deflect: 2, vital: tier, ownerUuid: owner.uuid, sceneId: canvas?.scene?.id ?? null });
    await edhaAddLifeRegen(owner, { targetUuid: t.uuid, formula: EDHA_LIFE_GREEN_DIE, endOnVitalSpirit: false, sourceName: "Apex Form", mutationBonus: false });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🌟 <strong>Apex Form</strong>: ${t.name} regenerates [Tier][Die] at the start of its turns, gains +2 Deflect, and adds +${tier} vital to its attacks (scene). Active mutations are doubled (GM); ${t.name} takes an Injury when it ends (auto at scene end).</p>` });
  } catch (e) { console.error("Edha Content | Apex Form apply failed", e); }
}
async function edhaApplyPrimalRegen(owner, target) {
  try {
    const t = target ?? owner;
    await edhaAddLifeRegen(owner, { targetUuid: t.uuid, formula: "@tier + 1", endOnVitalSpirit: true, sourceName: "Primal Regeneration", mutationBonus: true });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🌱 <strong>Primal Regeneration</strong>: ${t.name} regenerates Tier+1 (or [Tier][Die]+1 with an active mutation) at the start of its turns — ends if it takes Vital or Spirit damage.</p>` });
  } catch (e) { console.error("Edha Content | Primal Regeneration apply failed", e); }
}

/* --- Lifeline — link a creature; offer the owner-judged redirect when it's hit -------------------- */
async function edhaLinkLifeline(owner, target) {
  try {
    const t = target ?? owner;
    await owner.setFlag("edha-content", "lifeline", { targetUuid: t.uuid, sceneId: canvas?.scene?.id ?? null });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🩸 <strong>Lifeline</strong>: ${owner.name} is bound to ${t.name} for the scene — when ${t.name} takes damage, ${owner.name} may take up to half as Spirit and heal them [Tier][Die] (once per round).</p>` });
  } catch (e) { console.error("Edha Content | Lifeline link failed", e); }
}
function edhaPostLifelineCard(owner, victim, dealtAmt) {
  try {
    const half = Math.floor(dealtAmt / 2); if (half <= 0) return;
    if (!edhaCoordOPRAllowed(owner, "Lifeline", "_react")) return;
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🩸 <strong>Lifeline</strong> — ${victim.name} took ${dealtAmt} damage. Take up to <strong>${half}</strong> of it as Spirit (ignores Deflect); ${victim.name} then heals [Tier][Die]. (Once per round.)</p>`
        + `<input type="number" class="edha-lifeline-amt" value="${half}" min="0" max="${half}" style="width:4em">`
        + `<button type="button" class="edha-lifeline-btn" data-edha-owner="${owner.uuid}" data-edha-victim="${victim.uuid}" data-edha-max="${half}">Absorb &amp; heal</button></div>` });
  } catch (e) { console.error("Edha Content | Lifeline card failed", e); }
}
async function edhaLifelineClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const vref = await fromUuid(ds.edhaVictim).catch(() => null); const victim = vref?.actor ?? vref;
    if (!owner || !victim) return;
    if (!edhaCoordOPRAllowed(owner, "Lifeline", "_react")) { ui.notifications?.info("Lifeline already used this round."); btn.disabled = true; return; }
    const max = Math.max(0, Math.floor(Number(ds.edhaMax) || 0));
    const input = btn.closest(".edha-trigger-card")?.querySelector(".edha-lifeline-amt");
    const amt = Math.min(max, Math.max(0, Math.floor(Number(input?.value) || 0)));
    btn.disabled = true;
    if (amt <= 0) { btn.textContent = "no absorb"; return; }
    await edhaCoordOPRMark(owner, "Lifeline", "_react");
    await edhaCrossHeal(victim, amt);                                   // undo the redirected portion on the victim
    await edhaCrossDamage(owner, amt, "spirit", { edhaRedirected: true });   // owner takes it as Spirit (Spirit ignores Deflect)
    const heal = Math.max(0, Math.floor((await new Roll(EDHA_LIFE_GREEN_DIE, owner.getRollData()).evaluate()).total));
    if (heal > 0) await edhaCrossHeal(victim, heal);
    btn.textContent = "Lifeline used";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🩸 <strong>Lifeline</strong> (${owner.name}): took <strong>${amt}</strong> Spirit in ${victim.name}'s place; ${victim.name} heals <strong>${heal}</strong>.</p>` });
  } catch (e) { console.error("Edha Content | Lifeline click failed", e); }
}

/* --- Surgical Precision — cleanse on a SUCCESSFUL heal-test (gated on the non-graze damageRoll) ----- */
function edhaPostLifeCleanseCard(owner, target) {
  try {
    const present = EDHA_LIFE_CLEANSE.filter(c => [...(target.statuses ?? [])].includes(c));
    if (!present.length) return;
    const rows = present.map(c => `<button type="button" class="edha-lifecleanse-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-status="${c}">${edhaConditionLabel(c)}</button>`).join(" ");
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🩺 <strong>Surgical Precision</strong> — success: remove one condition from ${target.name}:</p>${rows}</div>` });
  } catch (e) { console.error("Edha Content | Surgical Precision card failed", e); }
}
async function edhaLifeCleanseClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target || !ds.edhaStatus) return;
    await edhaToggleStatus(target, ds.edhaStatus, false);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-lifecleanse-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ cleansed";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🩺 <strong>Surgical Precision</strong> (${owner.name}): removed <strong>${edhaConditionLabel(ds.edhaStatus)}</strong> from ${target.name}.</p>` });
  } catch (e) { console.error("Edha Content | Surgical Precision click failed", e); }
}
Hooks.on("cosmere-rpg.damageRoll", (roll, item) => {
  try {
    const actor = item?.actor;
    if (!actor || item?.name !== "Surgical Precision" || !edhaOwnsTalent(actor, "Surgical Precision")) return;
    if (roll?.options?.graze) return;                                  // graze = the "failure: heal only" branch — no cleanse
    const key = item.uuid ?? item.id ?? item.name, now = Date.now();
    if (now - (_edhaSurgicalDebounce.get(key) || 0) < 600) return;     // one cleanse per use (dedupe the twin fire)
    _edhaSurgicalDebounce.set(key, now);
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? actor;
    edhaPostLifeCleanseCard(actor, target);
  } catch (e) { console.error("Edha Content | Surgical Precision cleanse hook failed", e); }
});

/* --- Life dispatch (on-use buffs/links) + button binding + scene cleanup --------------------------- */
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const tgt = () => Array.from(game.user?.targets ?? [])[0]?.actor ?? actor;
    switch (item.name) {
      case "Adaptive Mutation":    if (edhaOwnsTalent(actor, "Adaptive Mutation"))    edhaPostMutationCard(actor, tgt()); break;
      case "Apex Form":            if (edhaOwnsTalent(actor, "Apex Form"))            void edhaApplyApexForm(actor, tgt()); break;
      case "Primal Regeneration":  if (edhaOwnsTalent(actor, "Primal Regeneration"))  void edhaApplyPrimalRegen(actor, tgt()); break;
      case "Lifeline":             if (edhaOwnsTalent(actor, "Lifeline"))             void edhaLinkLifeline(actor, tgt()); break;
      case "Vital Diagnosis": {    // "know its exact HP/defenses" — Knowledge's whispered snapshot, dropped in (was manual; 2026-07-04)
        if (!edhaOwnsTalent(actor, "Vital Diagnosis")) break;
        const t = Array.from(game.user?.targets ?? [])[0]?.actor;
        if (t && t !== actor) ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🩺 <strong>Vital Diagnosis</strong> — the read on ${t.name}:</p>${edhaGnosisRevealLines(t, { cog: true })}</div>` });
        break;
      }
    }
  } catch (e) { console.error("Edha Content | Life use-hook failed", e); }
});
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  root.querySelectorAll?.(".edha-mutation-btn").forEach(b => b.addEventListener("click", edhaMutationClick));
  root.querySelectorAll?.(".edha-lifeline-btn").forEach(b => b.addEventListener("click", edhaLifelineClick));
  root.querySelectorAll?.(".edha-lifecleanse-btn").forEach(b => b.addEventListener("click", edhaLifeCleanseClick));
});
async function edhaClearLifeState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors ?? [])) {
      for (const k of ["mutation", "apexForm", "lifeline", "lifeRegen"]) {
        if (!a.getFlag?.("edha-content", k)) continue;
        // Apex Form's price lands when it ends (scene end IS the end) — the shared injury tool
        // creates the Item GM-side (was "GM: takes an Injury" on the apply card).
        if (k === "apexForm") {
          const injName = await edhaAddInjury(a, { source: "Apex Form (ended)", damageType: "vital" });
          if (injName) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🌟 <strong>Apex Form</strong> ends — ${a.name} takes an injury: <strong>${injName}</strong>.</p>` });
        }
        await a.unsetFlag("edha-content", k);
      }
    }
  } catch (e) { console.error("Edha Content | clear Life state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearLifeState(); } catch (e) {} });

/* ============================================================================================
 * CHAOS (Maelith, deity) tree engine (2026-06-18) — the "Omen" fracture lifecycle. ENGINE-ONLY,
 * NO pack rebuild (all 9 talents keep events:{}; the damage formulas already live on the items —
 * read item.system.damage.formula). Reuses existing primitives wholesale — NO side-engine, NO new
 * data handler or sidecar table:
 *   • Omen = the MARKED pattern — a registered `omen` status + flags.edha-content.markedBy.omen,
 *     exactly like Diagnosed/Insight. So "bears your Omen" is a status check, the cap (= tier) counts
 *     your omen-marked enemies, the icon shows the bearer's location (Void Sense flavor), and Void
 *     Sense's Inv-recovery rides the SAME damage post-pass the existing marked-damage triggers use.
 *   • damage writes  → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • Isolated       → a registered, INFLICTABLE `isolated` status OR'd into edhaIsIsolated, so
 *     Maelith's applied-Isolation flows through the Black tree's Isolation engine (Severance vital-
 *     conversion, Spoils of Isolation, whenTargetIsolated) — one small additive change, shared.
 *   • Disorient      → edhaApplyTimedStatus("disoriented") (engine convention: expires at the END of
 *     the owner's next turn; the cards say "start of your next turn" — close enough, and the only
 *     timed expiry the engine offers).
 *   • reroll-lower   → edhaRewriteOrRelay (the Voice-of-Authority roll-rewrite); the kept d20 is lowered.
 *   • per-actor state→ owner once/round gate (edhaTriggerAllowed); statuses cleared at scene/combat
 *     end (deleteCombat), mirroring the Charge / Reserve / Life-flag pattern.
 * OMEN MODEL (Ben, 06-18): cap = tier; placements past the cap are lost. Every ACTIVE talent is a
 * preUseItem TAKEOVER (cancel the default single-target flow, pay the cost ourselves, refund on
 * cancel) — mirroring Destruction — so the color test is ROLLED (1d20 + @skills.<color>.mod) and
 * GATED against the target's defense via edhaReadDefense (NOT "trust the player"): the effect lands
 * only when total >= the defense. Cascade Collapse rolls once and gates EACH bearer against ITS OWN
 * Cognitive (Ben, 06-18). Attunement Range = EDHA_ATTUNE_FT[Blue rank] (Omens are Blue-placed).
 * Wired here (no longer GM-eyeballed):
 *   • Entropy Strike / Spreading Omen — Blue vs Cognitive → place Omen(s) on a success (+ Entropy
 *     Strike's own spirit damage). Spreading Omen also marks the nearest other enemy within 10 ft.
 *   • Isolating Pressure / Isolating Ruin — Black vs Physical → inflict Isolated (timed); the vital
 *     damage is the Omen payoff (remove the Omen, deal the bonus). Ruin also deals its base hit.
 *   • Cascade Collapse — Blue, per-bearer vs Cognitive → remove your Omens in range; each bearer
 *     takes spirit + Disorient.
 *   • Unweaving — Black vs Spiritual → on a success the Omen payoff (remove + Disorient) fires; the
 *     buff/stance/sustained DISPEL is a GM card (no hook enumerates arbitrary active effects).
 *   • Void Sense — name-based: once/round, when an enemy bearing YOUR Omen takes damage from any
 *     source, recover 1 Investiture (rides the damage post-pass; reuses edhaTriggerAllowed).
 *   • Shatter Focus — Reaction: remove your Omen on the targeted enemy and reroll-take-lower its most
 *     recent test (edhaRewriteOrRelay lowers the kept d20).
 *   • Unravel Everything (capstone) — place an Omen on every enemy in range up to the cap, then
 *     detonate all: spirit + Disorient, or 2[T][D] vital to bearers that are Isolated.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Shatter Focus auto-prompt — the contest-watch Roll hooks whisper the owner the Reaction when
 *     an Omen-bearing foe rolls a test (never auto-fires; the native use pays the cost). Spam-gated:
 *     Omen-bearers only, once per foe per turn, plus a Mute button (a real use re-arms). ⚑ bench:
 *     reassess spam live.
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Unweaving's dispel — "end one magical buff, stance, or sustained effect" has no hook to
 *     enumerate arbitrary active effects; the success posts a GM card and the GM removes one.
 *   • Void Sense's "sense the location through any obstruction" — WIRED 07-16c (Ben's B5 ruling):
 *     the client-veil force-SHOW half (edhaSenseRevealShows) renders Omen-bearers to Void Sense
 *     owners' clients through walls/fog (GM-hidden stays hidden).
 *   • CONTEST-EXEMPT: none — every Chaos test is vs a DEFENSE (Cognitive/Physical/Spiritual), resolved
 *     by rolling the color test and comparing to edhaReadDefense, not an opposed SKILL.
 * ============================================================================================ */

const EDHA_CHAOS_BLUE_DIE = "(@tier)d(2 * @skills.blue.rank + 2)";   // [Tier][Die] on the Blue track — Unravel's Isolated 2[T][D]

function edhaChaosAttuneFt(owner) { return EDHA_ATTUNE_FT[edhaColorRank(owner, "blue")] || EDHA_ATTUNE_FT[1]; }
function edhaOmenCap(owner) { return Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1); }
function edhaBearsMyOmen(owner, actor) {
  return !!(actor?.statuses?.has?.("omen")) && (actor?.flags?.["edha-content"]?.markedBy?.omen?.actorId === owner?.id);
}
// Tokens on the active scene whose Omen belongs to `owner`.
function edhaMyOmenTokens(owner) {
  return (canvas?.tokens?.placeables ?? []).filter(t => edhaBearsMyOmen(owner, t.actor));
}
function edhaRollColorTest(owner, color) { return new Roll(`1d20 + @skills.${color}.mod`, owner.getRollData()).evaluate(); }
async function edhaChaosBakeDamage(owner, formula) {
  const roll = await new Roll(Roll.replaceFormulaData(formula || EDHA_CHAOS_BLUE_DIE, owner.getRollData(), { missing: "0" })).evaluate();
  return { roll, amt: Math.max(0, Math.floor(roll.total)) };
}
async function edhaChaosApplyHits(owner, hits) {
  if (!hits?.length) return;
  const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
  if (game.user?.isGM) await edhaApplyBurstResults(payload);
  else { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply the damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
}
function edhaChaosCard(owner, rolls, html) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [], content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaChaosTestLine(item, color, total, def, ok) {
  const cl = color ? color[0].toUpperCase() + color.slice(1) : "";
  return `<p>🩸 <strong>${item.name}</strong> — ${cl} <strong>${total}</strong> vs ${def == null ? "?" : def}: <strong>${ok ? "success" : "fail"}</strong></p>`;
}

/* --- Omen place / remove (the Marked pattern) ------------------------------------------------------ */
async function edhaPlaceOmen(owner, target, talentName, { silent = false } = {}) {
  if (!target) return false;
  if (edhaBearsMyOmen(owner, target)) return true;                       // already yours — never double-mark
  if (edhaMyOmenTokens(owner).length >= edhaOmenCap(owner)) {
    if (!silent) edhaChaosCard(owner, null, `<p>🩸 <strong>Omen</strong> not placed on ${target.name} — you are at your cap of ${edhaOmenCap(owner)} (= tier).</p>`);
    return false;
  }
  const mark = { actorId: owner.id, talent: talentName };
  if (target.isOwner) { await target.toggleStatusEffect?.("omen", { active: true }); await target.setFlag("edha-content", "markedBy.omen", mark); }
  else if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "apply-status-mark", payload: { actorUuid: target.uuid, statusId: "omen", mark } }); } catch (e) {} }
  else { ui.notifications?.warn(`Edha: a GM must be online to place an Omen on ${target.name}.`); return false; }
  if (!silent) edhaChaosCard(owner, null, `<p>🩸 <strong>Omen</strong> placed on <strong>${target.name}</strong> (by ${owner.name}).</p>`);
  return true;
}
async function edhaRemoveOmen(owner, target) {
  if (!target) return;
  await edhaToggleStatus(target, "omen", false);
  if (target.isOwner) { try { await target.unsetFlag("edha-content", "markedBy.omen"); } catch (e) {} }
  else if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "markedBy.omen", value: null } }); } catch (e) {} }
}

/* --- Single-target test talents ------------------------------------------------------------------- */
function edhaChaosTarget() { return Array.from(game.user?.targets ?? [])[0]?.actor ?? null; }

async function edhaEntropyStrike(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target an enemy for Entropy Strike."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "blue"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    const rolls = [roll]; let res = "";
    if (ok) {
      await edhaPlaceOmen(owner, target, item.name, { silent: true });
      const { roll: dr, amt } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr);
      await edhaChaosApplyHits(owner, [{ actorUuid: target.uuid, amount: amt, type: item.system?.damage?.type || "spirit", heal: false }]);
      res = `<p>${target.name}: <strong>Omen</strong> placed + ${amt} ${item.system?.damage?.type || "spirit"}.</p>`;
    }
    edhaChaosCard(owner, rolls, edhaChaosTestLine(item, "blue", total, def, ok) + res);
  } catch (e) { console.error("Edha Content | Entropy Strike failed", e); }
}

async function edhaSpreadingOmen(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target an enemy for Spreading Omen."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "blue"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    let res = "";
    if (ok) {
      await edhaPlaceOmen(owner, target, item.name, { silent: true });
      let extra = null;
      const ttok = target.getActiveTokens?.()[0];
      if (ttok) {
        const near = edhaEnemyTokensInCircle(owner, ttok.center.x, ttok.center.y, 10)
          .filter(t => t.actor !== target && !edhaBearsMyOmen(owner, t.actor));
        near.sort((a, b) => Math.hypot(a.center.x - ttok.center.x, a.center.y - ttok.center.y) - Math.hypot(b.center.x - ttok.center.x, b.center.y - ttok.center.y));
        extra = near[0]?.actor ?? null;
      }
      const p2 = extra ? await edhaPlaceOmen(owner, extra, item.name, { silent: true }) : false;
      res = `<p>Omen placed on <strong>${target.name}</strong>${p2 ? ` and <strong>${extra.name}</strong>` : " (no second enemy within 10 ft, or cap reached)"}.</p>`;
    }
    edhaChaosCard(owner, [roll], edhaChaosTestLine(item, "blue", total, def, ok) + res);
  } catch (e) { console.error("Edha Content | Spreading Omen failed", e); }
}

async function edhaIsolatingPressure(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target an enemy for Isolating Pressure."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "phy");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    const rolls = [roll]; let res = "";
    if (ok) {
      await edhaApplyTimedStatus(target, "isolated", { owner, expire: "owner" });
      res = `<p>${target.name} is <strong>Isolated</strong>`;
      if (edhaBearsMyOmen(owner, target)) {
        await edhaRemoveOmen(owner, target);
        const { roll: dr, amt } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr);
        await edhaChaosApplyHits(owner, [{ actorUuid: target.uuid, amount: amt, type: item.system?.damage?.type || "vital", heal: false }]);
        res += `; Omen shattered — ${amt} ${item.system?.damage?.type || "vital"}`;
      }
      res += ".</p>";
    }
    edhaChaosCard(owner, rolls, edhaChaosTestLine(item, "black", total, def, ok) + res);
  } catch (e) { console.error("Edha Content | Isolating Pressure failed", e); }
}

async function edhaIsolatingRuin(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target an enemy for Isolating Ruin."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "phy");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    const rolls = [roll]; let res = "";
    if (ok) {
      await edhaApplyTimedStatus(target, "isolated", { owner, expire: "target" });
      const dtype = item.system?.damage?.type || "vital";
      const { roll: dr, amt } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr);
      const hits = [{ actorUuid: target.uuid, amount: amt, type: dtype, heal: false }];
      res = `<p>${target.name} is <strong>Isolated</strong> + ${amt} ${dtype}`;
      if (edhaBearsMyOmen(owner, target)) {
        await edhaRemoveOmen(owner, target);
        const { roll: dr2, amt: amt2 } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr2);
        hits.push({ actorUuid: target.uuid, amount: amt2, type: dtype, heal: false });
        res += `; Omen shattered — +${amt2} ${dtype}`;
      }
      await edhaChaosApplyHits(owner, hits);
      res += ".</p>";
    }
    edhaChaosCard(owner, rolls, edhaChaosTestLine(item, "black", total, def, ok) + res);
  } catch (e) { console.error("Edha Content | Isolating Ruin failed", e); }
}

async function edhaUnweaving(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target an enemy for Unweaving."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "spi");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    let res = "";
    if (ok) {
      // Pick-one dispel card (07-16c, Ben E15 — was "no hook enumerates these"; target.effects IS
      // enumerable): every enabled effect on the target becomes a button; the GM clicks the one
      // that counts as magical (adjudication stays at the table, removal is one click).
      const effs = [...(target.effects ?? [])].filter(e => !e.disabled);
      const btns = effs.map(e => `<button type="button" class="edha-unweave-btn" data-eff="${e.uuid}">${String(e.name || e.label || "effect").replace(/</g, "&lt;")}</button>`).join(" ");
      ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🧵 <strong>Unweaving</strong> — success: end ONE magical buff, stance, or sustained effect on <strong>${target.name}</strong> (GM picks — what counts as magical is the table's call):</p>${btns || `<p><em>No active effects found on ${target.name} — narrate the unraveling.</em></p>`}</div>` });
      res = `<p>Success — the GM ends one effect on ${target.name}.`;
      if (edhaBearsMyOmen(owner, target)) {
        await edhaRemoveOmen(owner, target);
        await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
        res += ` Omen shattered — ${target.name} is <strong>Disoriented</strong>.`;
      }
      res += "</p>";
    }
    edhaChaosCard(owner, [roll], edhaChaosTestLine(item, "black", total, def, ok) + res);
  } catch (e) { console.error("Edha Content | Unweaving failed", e); }
}
async function edhaUnweaveClick(ev) {
  try {
    ev.preventDefault();
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: the Unweaving pick is GM-side."); return; }
    const eff = await fromUuid(ev.currentTarget.dataset.eff).catch(() => null);
    if (!eff) { ui.notifications?.info("Edha: that effect is already gone."); return; }
    const name = eff.name || eff.label || "the effect", who = eff.parent?.name || "the target";
    await eff.delete();
    ev.currentTarget.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
    void edhaMarkCardResolved(edhaMessageIdOf(ev.currentTarget), "Unwoven ✓");
    ChatMessage.create({ content: `<p>🧵 <strong>Unweaving</strong>: <strong>${name}</strong> unravels from ${who}.</p>` });
  } catch (e) { console.error("Edha Content | unweave click failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-unweave-btn").forEach(b => b.addEventListener("click", edhaUnweaveClick));
});

/* --- Cascade Collapse — one Blue roll, gate EACH Omen-bearer in range vs ITS OWN Cognitive --------- */
async function edhaCascadeCollapse(owner, item) {
  try {
    const tok = edhaCasterToken(owner); if (!tok) { ui.notifications?.warn("Edha: select/drop your token for Cascade Collapse."); return; }
    if (!edhaConsumeCost(item)) return;
    const ft = edhaChaosAttuneFt(owner);
    const bearers = edhaTokensInCircle(tok.center.x, tok.center.y, ft, null).filter(t => edhaBearsMyOmen(owner, t.actor));
    const roll = await edhaRollColorTest(owner, "blue"); const total = Number(roll.total) || 0;
    const rolls = [roll], hits = [], lines = [];
    for (const t of bearers) {
      const def = edhaReadDefense(t.actor, "cog");
      if (def != null && total < def) { lines.push(`${t.name}: resists (Cognitive ${def})`); continue; }
      await edhaRemoveOmen(owner, t.actor);
      const { roll: dr, amt } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr);
      hits.push({ actorUuid: t.actor.uuid, amount: amt, type: item.system?.damage?.type || "spirit", heal: false });
      await edhaApplyTimedStatus(t.actor, "disoriented", { owner, expire: "owner" });
      lines.push(`${t.name}: ${amt} ${item.system?.damage?.type || "spirit"} + <strong>Disoriented</strong>`);
    }
    await edhaChaosApplyHits(owner, hits);
    edhaChaosCard(owner, rolls,
      `<p>🩸 <strong>${item.name}</strong> — Blue <strong>${total}</strong>, removing your Omens within ${ft} ft:</p><p style="font-size:.95em">${lines.length ? lines.join("<br>") : "no Omen-bearers in range"}</p>`);
  } catch (e) { console.error("Edha Content | Cascade Collapse failed", e); }
}

/* --- Unravel Everything (capstone) — mark all in range up to cap, then detonate every Omen --------- */
async function edhaUnravelEverything(owner, item) {
  try {
    const tok = edhaCasterToken(owner); if (!tok) { ui.notifications?.warn("Edha: select/drop your token for Unravel Everything."); return; }
    if (!edhaConsumeCost(item)) return;
    const ft = edhaChaosAttuneFt(owner);
    for (const t of edhaEnemyTokensInCircle(owner, tok.center.x, tok.center.y, ft)) {
      if (edhaMyOmenTokens(owner).length >= edhaOmenCap(owner)) break;
      await edhaPlaceOmen(owner, t.actor, item.name, { silent: true });
    }
    const bearers = edhaMyOmenTokens(owner);
    const rolls = [], hits = [], lines = [];
    const dtype = item.system?.damage?.type || "spirit";
    for (const t of bearers) {
      const isolated = edhaIsIsolated(t.actor);
      await edhaRemoveOmen(owner, t.actor);
      if (isolated) {
        const { roll: dr, amt } = await edhaChaosBakeDamage(owner, `2 * (${EDHA_CHAOS_BLUE_DIE})`); rolls.push(dr);
        hits.push({ actorUuid: t.actor.uuid, amount: amt, type: "vital", heal: false });
        lines.push(`${t.name}: ${amt} vital (Isolated — 2[T][D])`);
      } else {
        const { roll: dr, amt } = await edhaChaosBakeDamage(owner, item.system?.damage?.formula); rolls.push(dr);
        hits.push({ actorUuid: t.actor.uuid, amount: amt, type: dtype, heal: false });
        await edhaApplyTimedStatus(t.actor, "disoriented", { owner, expire: "owner" });
        lines.push(`${t.name}: ${amt} ${dtype} + <strong>Disoriented</strong>`);
      }
    }
    await edhaChaosApplyHits(owner, hits);
    edhaChaosCard(owner, rolls,
      `<p>🩸 <strong>${item.name}</strong> — every Omen in ${ft} ft unravels at once:</p><p style="font-size:.95em">${lines.length ? lines.join("<br>") : "no enemies in range to mark"}</p>`);
  } catch (e) { console.error("Edha Content | Unravel Everything failed", e); }
}

/* --- Shatter Focus (Reaction) — remove your Omen, reroll-take-lower the foe's most recent test ----- */
function edhaLatestRollMessageOf(actor) {
  const msgs = game.messages?.contents ?? [];
  for (let i = msgs.length - 1; i >= 0 && i >= msgs.length - 50; i--) {
    const m = msgs[i]; if (!m?.rolls?.length) continue;
    const spk = ChatMessage.getSpeakerActor(m.speaker);
    if (spk && actor && spk.id === actor.id) return m;
  }
  return null;
}
async function edhaShatterFocus(owner, item) {
  try {
    const target = edhaChaosTarget(); if (!target) { ui.notifications?.warn("Edha: target the enemy who is making the test."); return; }
    if (!edhaBearsMyOmen(owner, target)) { ui.notifications?.warn(`Edha: ${target.name} bears no Omen of yours.`); return; }
    if (!edhaConsumeCost(item)) return;
    await edhaRemoveOmen(owner, target);
    const msg = edhaLatestRollMessageOf(target);
    if (!msg) { edhaChaosCard(owner, null, `<p>🩸 <strong>Shatter Focus</strong>: Omen removed from ${target.name}. No recent test found — the GM imposes the reroll-take-lower by hand.</p>`); return; }
    const oldRoll = msg.rolls[0];
    const oldTotal = Number(oldRoll.total) || 0;
    const oldNat = Number(edhaKeptD20Nat(oldRoll)) || 0;
    const reroll = await new Roll("1d20").evaluate();
    const newNat = Number(reroll.total) || 0;
    if (oldNat && newNat >= oldNat) {
      edhaChaosCard(owner, [reroll], `<p>🩸 <strong>Shatter Focus</strong>: Omen removed from ${target.name}; reroll d20 = <strong>${newNat}</strong> ≥ kept ${oldNat} — the original test stands.</p>`);
      return;
    }
    const newTotal = oldTotal - (oldNat - newNat);
    await edhaRewriteOrRelay(target, oldTotal, newTotal, `<em>Shatter Focus</em> (${owner.name}): reroll d20 ${oldNat}→${newNat}; total ${oldTotal}→<strong>${newTotal}</strong> (take the lower).`);
    edhaChaosCard(owner, [reroll], `<p>🩸 <strong>Shatter Focus</strong>: Omen removed from ${target.name}; rerolled the d20 ${oldNat}→<strong>${newNat}</strong> — ${target.name}'s test drops to <strong>${newTotal}</strong>.</p>`);
  } catch (e) { console.error("Edha Content | Shatter Focus failed", e); }
}

/* --- Shatter Focus AUTO-PROMPT (was backlog; wired 2026-07-04, Ben-approved shape) ------------------
 * On every foe TEST (the contest-watch Roll hooks — they fire once, on the rolling client), whisper
 * the Reaction reminder to the owner whose Omen the roller bears. This never auto-fires: the owner
 * still uses the talent natively (cost + reroll flow unchanged). Spam controls: (1) only Omen-bearers
 * prompt at all, (2) once per foe per turn (the Order prompt-gate shape), (3) the card's Mute button
 * sets shatterPromptOff — using Shatter Focus re-arms the prompts. ⚑ bench: reassess spam live. */
const _edhaShatterPrompted = new Map();
function edhaShatterPromptGate(key) {
  const c = game.combat;
  const tag = c?.started ? `r${c.round}t${c.turn}` : null;
  const prev = _edhaShatterPrompted.get(key);
  if (tag != null) { if (prev === tag) return false; _edhaShatterPrompted.set(key, tag); return true; }
  const now = Date.now();
  if (typeof prev === "number" && now - prev < 30000) return false;
  _edhaShatterPrompted.set(key, now); return true;
}
function edhaChaosShatterPrompt(roll, source, config) {
  try {
    const foe = edhaD20RollActor(config); if (!foe) return;
    if (!foe.statuses?.has?.("omen")) return;                 // fast path — only Omen-bearers can prompt
    const mk = foe.flags?.["edha-content"]?.markedBy?.omen;
    const owner = mk?.actorId ? game.actors?.get(mk.actorId) : null;
    if (!owner || owner === foe) return;
    if (!edhaOwnsTalent(owner, "Shatter Focus") || owner.getFlag?.("edha-content", "shatterPromptOff")) return;
    const otok = edhaCasterToken(owner), ftok = edhaCasterToken(foe);
    if (otok && ftok && (otok.document?.disposition ?? 1) === (ftok.document?.disposition ?? 1)) return;   // enemies only
    if (!edhaShatterPromptGate(`${owner.id}:${foe.id}`)) return;
    ChatMessage.create({
      whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🩸 <strong>Shatter Focus</strong> — ${foe.name} (your Omen-bearer) just rolled a test (kept total <strong>${Number(roll?.total) || "?"}</strong>). React? Target ${foe.name} and use <strong>Shatter Focus</strong>: the Omen is removed and the test rerolls-take-lower.</p>`
        + `<button type="button" class="edha-shatter-mute" data-edha-owner="${owner.uuid}">🔇 Mute these prompts (using Shatter Focus re-arms them)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Shatter Focus prompt failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaChaosShatterPrompt);
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-shatter-mute").forEach(b => b.addEventListener("click", async (ev) => {
    ev.preventDefault(); b.disabled = true;
    const ref = await fromUuid(b.dataset.edhaOwner).catch(() => null); const owner = ref?.actor ?? ref; if (!owner) return;
    try { await owner.setFlag("edha-content", "shatterPromptOff", true); } catch (e) {}
    b.textContent = "Prompts muted";
  }));
});

/* --- Void Sense (passive) — once/round, an Omen-bearer taking damage refunds the owner 1 Inv ------- */
async function edhaVoidSenseOnDamage(victim, list) {
  try {
    if (!victim?.statuses?.has?.("omen")) return;
    if (!list?.some(i => Number(i?.amount) > 0 && i?.type !== "heal")) return;
    const mk = victim.flags?.["edha-content"]?.markedBy?.omen;
    const owner = mk?.actorId ? game.actors?.get(mk.actorId) : null;
    if (!owner || !edhaOwnsTalent(owner, "Void Sense")) return;
    const spec = { oncePerRound: true };
    if (!edhaTriggerAllowed(owner, "Void Sense", spec)) return;
    await edhaMarkTriggerUsed(owner, "Void Sense", spec);
    const res = owner.system?.resources?.inv; const rmax = edhaResVal(res) ?? ((res?.value ?? 0) + 1);
    try { await owner.update({ "system.resources.inv.value": Math.min(rmax, (res?.value ?? 0) + 1) }); } catch (e) { /* perms */ }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>Void Sense</strong>: an Omen-bearer (${victim.name}) took damage — ${owner.name} recovers 1 Investiture.</p>` });
  } catch (e) { console.error("Edha Content | Void Sense failed", e); }
}

/* --- Chaos dispatch — preUseItem TAKEOVER (cancel the default single-target flow) ------------------ */
const EDHA_CHAOS_TALENTS = new Set(["Entropy Strike", "Spreading Omen", "Isolating Pressure", "Isolating Ruin", "Unweaving", "Cascade Collapse", "Shatter Focus", "Unravel Everything"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!EDHA_CHAOS_TALENTS.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Entropy Strike":      void edhaEntropyStrike(actor, item); break;
      case "Spreading Omen":      void edhaSpreadingOmen(actor, item); break;
      case "Isolating Pressure":  void edhaIsolatingPressure(actor, item); break;
      case "Isolating Ruin":      void edhaIsolatingRuin(actor, item); break;
      case "Unweaving":           void edhaUnweaving(actor, item); break;
      case "Cascade Collapse":    void edhaCascadeCollapse(actor, item); break;
      case "Shatter Focus":       if (actor.getFlag?.("edha-content", "shatterPromptOff")) void actor.unsetFlag("edha-content", "shatterPromptOff");   // a real use re-arms the auto-prompts
                                  void edhaShatterFocus(actor, item); break;
      case "Unravel Everything":  void edhaUnravelEverything(actor, item); break;
    }
    return false;   // cancel the system's default use() for every active Chaos talent (no stray card/roll)
  } catch (e) { console.error("Edha Content | Chaos preUse-hook failed", e); }
});

// Clear Omen / inflicted-Isolated statuses + markedBy at scene/combat end (GM-side), like the Charge/Life flags.
async function edhaClearChaosState() {
  try {
    if (!game.user?.isGM) return;
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      const a = t.actor; if (!a) continue;
      if (a.statuses?.has?.("omen")) await a.toggleStatusEffect?.("omen", { active: false });
      if (a.statuses?.has?.("isolated")) await a.toggleStatusEffect?.("isolated", { active: false });
      if (a.flags?.["edha-content"]?.markedBy?.omen) { try { await a.unsetFlag("edha-content", "markedBy.omen"); } catch (e) {} }
    }
  } catch (e) { console.error("Edha Content | clear Chaos state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearChaosState(); } catch (e) {} });

/* ============================================================================================
 * FATE (Olvarra, deity) tree engine (2026-06-18) — the "Ordained Ground + Snare" zone lifecycle.
 * ENGINE-ONLY, NO pack rebuild (all 9 talents keep events:{}; the damage formulas already live on
 * the items — read item.system.damage.formula). Colors Green/White; tag prefix "Fate (Olvarra).";
 * build `foundry-build deity` → pack `edha-deity`. Reuses existing primitives wholesale — NO
 * side-engine, NO new data handler or sidecar table:
 *   • placed markers → owner setFlag state (fateOrdained / fateSnares; cap = tier; oldest fizzles),
 *     click-placed via edhaPickPoint + a MeasuredTemplate, EXACTLY the Destruction Charge lifecycle;
 *     cleared at scene/combat end (deleteCombat).
 *   • damage writes  → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • Snare trigger  → a v13 Region (edha-content.fate-snare behavior) on tokenEnter + tokenMoveIn, so
 *     a foe that PASSES THROUGH the square springs it, not just one that stops; reuses the hazard-Region
 *     machinery (GM-applier gated, player→GM relay to arm/drop it). The green template stays the visual.
 *   • Restrained / Disoriented → edhaApplyTimedStatus (flags.edha-content.expireAfter auto-expiry,
 *     owner-relative for Restrained / target-relative for Disorient), the leyline timed-status pass.
 *   • opposed Speed test (Inevitable Snare) → engine ROLLS the owner's Green DC and ROLLS each foe's
 *     Speed (edhaRollOpposedSkill) — the edhaSpeedVsRedProne pattern, NOT a "trust the player" card.
 *   • Hexmark        → a flags.edha-content.markedBy.hexmark mark (the Diagnosed/Omen marked pattern);
 *     +tier keen rides the applyDamage PRE-pass when the marked foe takes damage near your zones (no
 *     recursion — it adds to the in-progress single apply, like Pack Pressure).
 *   • turn-start buff→ combatTurnChange: an ally beginning its turn on an Ordained square gets +1 all
 *     defenses (a self-cleaning flagged AE, mirroring edhaApplyDefBuff) and, if you own Bulwark
 *     Ground, Temp HP = tier (edhaGrantTempHpCross). Action-grants (Aid-at-range, free Strike,
 *     Reactive Strike) post a PROMPT CARD naming who may act — the action itself is taken by hand.
 * MODEL (Ben, 06-18): Attunement Range = EDHA_ATTUNE_FT[Green rank] (zones are Green-placed). Every
 * ACTIVE talent is a preUseItem TAKEOVER (cancel the default flow, pay the cost ourselves, refund on
 * cancel), mirroring Destruction/Chaos — no stray card/roll.
 * Wired here (no longer GM-eyeballed):
 *   • Ordained Ground / Snare — click-place a 5 ft zone (cap = tier). Snares auto-spring on an enemy
 *     entering OR passing through for [T][D] + Awareness keen + Restrained, then are consumed.
 *   • Inevitable Snare — flags the last-placed Snare (+1 Inv); on trigger +[T][D] keen AND the foe
 *     tests Speed vs your Green (engine-rolled) → Disoriented on a fail.
 *   • Bulwark Ground — Temp HP = tier on the turn-start pass, AND attacks against an ally on your
 *     Ordained Ground can't benefit from advantage (a DEFENDER-keyed pre-roll injector, edhaBulwark-
 *     NoAdvantage — the inverse of the Apex/Black advantage pipeline; reads the attacker's synced target).
 *   • Hexmark — Reaction card on a Snare trigger marks the foe; +tier keen near your zones thereafter.
 *   • Read the Threads — the reposition half is wired (slide a zone via a card); foresight is manual.
 *   • Foreknown Strike / Thread of Inevitability — scene buffs whose Snare-springs reuse the trigger
 *     resolver via card buttons; the free Strike/Aid grants post prompt cards.
 * Hooks/tools still to build (engine backlog — named, not dropped): none tree-local.
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Read the Threads foresight — "learn its intended action/movement": an NPC's intent is not data
 *     anywhere in Foundry, so no hook can ever exist (RECLASSIFIED from backlog → manual, Ben-approved
 *     2026-07-03c); the success posts a card and the GM reveals it.
 *   • Weave the Thread / Thread of Inevitability free Reactive Strike & Strike/Aid grants, Ordained's
 *     Aid-at-range — Foundry has no hook to force another creature's action; each posts a prompt card.
 *   • Thread of Inevitability's "declared event" — a table call; the resolution button springs the zones.
 *   • CONTEST-EXEMPT: none — the only opposed SKILL test (Inevitable Snare's Speed vs your Green) is
 *     engine-rolled via edhaRollOpposedSkill; every other effect is auto-on-trigger or a turn-start buff.
 * ============================================================================================ */

const EDHA_FATE_GREEN_DIE = "(@tier)d(2 * @skills.green.rank + 2)";       // [Tier][Die] on the Green track
const EDHA_FATE_SNARE_DMG = `${EDHA_FATE_GREEN_DIE} + @attr.awa`;         // Snare default: [T][D] + Awareness keen

function edhaFateTier(owner) { return Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1); }
function edhaFateAttuneFt(owner) { return EDHA_ATTUNE_FT[edhaColorRank(owner, "green")] || EDHA_ATTUNE_FT[1]; }
function edhaFateGridHalfPx() { const s = canvas?.scene; return (s?.grid?.size || 100) / 2; }
function edhaTokenDocCenter(tok) {
  const c = tok?.object?.center; if (c && c.x != null) return { x: c.x, y: c.y };
  const gs = canvas?.scene?.grid?.size || 100;
  return { x: (tok?.x ?? 0) + ((tok?.width ?? 1) * gs) / 2, y: (tok?.y ?? 0) + ((tok?.height ?? 1) * gs) / 2 };
}
function edhaSameSquare(cx, cy, sq) { return Math.hypot(cx - (sq?.x ?? 0), cy - (sq?.y ?? 0)) < edhaFateGridHalfPx(); }

// Owner-flag marker lists, scene-filtered (mirrors edhaGetCharges).
function edhaGetFateList(owner, key) { const c = owner?.getFlag?.("edha-content", key); return Array.isArray(c) ? c.filter(x => x && x.sceneId === (canvas?.scene?.id)) : []; }
async function edhaSetFateList(owner, key, list) {
  try { if (!list?.length) await owner.unsetFlag("edha-content", key); else await owner.setFlag("edha-content", key, list); }
  catch (e) { console.error("Edha Content | set fate list failed", e); }
}
const edhaGetOrdained = (o) => edhaGetFateList(o, "fateOrdained");
const edhaGetSnares = (o) => edhaGetFateList(o, "fateSnares");

async function edhaFateApplyHits(owner, hits) {
  if (!hits?.length) return;
  const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
  if (game.user?.isGM) await edhaApplyBurstResults(payload);
  else { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply the damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
}
function edhaFateCard(owner, rolls, html) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [], content: `<div class="edha-burst-card">${html}</div>` });
}
// True if any of the owner's Ordained squares OR unsprung Snares lies within `ft` of (cx,cy).
function edhaFateZonesNear(owner, cx, cy, ft) {
  const r = edhaFtToPx(ft);
  return [...edhaGetOrdained(owner), ...edhaGetSnares(owner)].some(z => Math.hypot((z.x ?? 0) - cx, (z.y ?? 0) - cy) <= r);
}
// Nearest living enemy token (of the owner) within `ft` of a point — for spring-in-place triggers.
function edhaFateNearestEnemyAt(owner, x, y, ft) {
  const disp = edhaCasterToken(owner)?.document?.disposition ?? 1;
  const r = edhaFtToPx(ft);
  const cands = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && (t.document?.disposition ?? 1) !== disp
    && (t.actor?.system?.resources?.hea?.value ?? 1) > 0 && Math.hypot(t.center.x - x, t.center.y - y) <= r);
  cands.sort((a, b) => Math.hypot(a.center.x - x, a.center.y - y) - Math.hypot(b.center.x - x, b.center.y - y));
  return cands[0]?.actor ?? null;
}

/* --- Snare trigger Region (v13) — a full-cell rectangle whose fate-snare behavior fires on
 * tokenEnter + tokenMoveIn (so a PASS-THROUGH springs it). The green MeasuredTemplate stays the
 * player-visible marker; this invisible Region is purely the trigger. GM creates it; players relay. */
async function edhaFateCreateSnareRegionGM(scene, owner, x, y, snareId) {
  try {
    if (!scene || !owner) return null;
    const gs = scene.grid?.size || 100;
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Snare`, color: EDHA_COLOR_HEX.green || "#5fb04f",
      shapes: [{ type: "rectangle", x: x - gs / 2, y: y - gs / 2, width: gs, height: gs, hole: false }],
      behaviors: [{ type: "edha-content.fate-snare", name: "Snare Trigger", system: { ownerUuid: owner.uuid, snareId } }],
      flags: { "edha-content": { fateSnare: true, snareId, owner: owner.uuid } },
    }]);
    return region ?? null;
  } catch (e) { console.error("Edha Content | create snare region failed", e); return null; }
}
async function edhaFateDropSnareRegion(owner, scene, x, y, snareId) {
  if (!scene) return null;
  if (game.user?.isGM) return edhaFateCreateSnareRegionGM(scene, owner, x, y, snareId);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to arm the Snare's trigger zone."); return null; }
  try { game.socket.emit("module.edha-content", { action: "place-fate-snare", payload: { sceneId: scene.id, ownerUuid: owner.uuid, x, y, snareId } }); } catch (e) {}
  return null;
}
function edhaFateFindSnareRegion(scene, snareId) {
  return (scene?.regions ?? []).find(r => r.getFlag?.("edha-content", "fateSnare") && r.getFlag("edha-content", "snareId") === snareId) ?? null;
}
async function edhaFateDeleteSnareRegion(scene, snareId) {
  try {
    if (!scene) return;
    if (game.user?.isGM) { const r = edhaFateFindSnareRegion(scene, snareId); if (r) await scene.deleteEmbeddedDocuments("Region", [r.id]); return; }
    if (!game.users?.activeGM) return;
    game.socket.emit("module.edha-content", { action: "delete-fate-snare", payload: { sceneId: scene.id, snareId } });
  } catch (e) { console.error("Edha Content | delete snare region failed", e); }
}

/* --- Place an Ordained Ground / Snare marker (preUse takeover) ------------------------------------- */
async function edhaFatePlaceMarker(owner, item, kind) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn(`Edha: need an active scene for ${item.name}.`); return; }
    if (!edhaConsumeCost(item)) return;
    const isSnare = kind === "snare";
    const hex = EDHA_COLOR_HEX[isSnare ? "green" : "white"] || "#5fb04f";
    const gd = scene.grid?.distance || 5;
    const pt = await edhaPickPoint(`Click the 5 ft square for ${item.name} (right-click to cancel).`);
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: gd / 2, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, fillAlpha: 0.12, flags: { "edha-content": { fateMarker: kind, owner: owner.uuid } },
    }]);
    const key = isSnare ? "fateSnares" : "fateOrdained";
    const list = foundry.utils.deepClone(edhaGetFateList(owner, key));
    const cap = edhaFateTier(owner);
    const entry = { id: foundry.utils.randomID(), sceneId: scene.id, templateId: tpl?.id, x: pt.x, y: pt.y };
    if (isSnare) { entry.inevitable = false; entry.formula = item.system?.damage?.formula || EDHA_FATE_SNARE_DMG; entry.type = item.system?.damage?.type || "keen"; }
    list.push(entry);
    while (list.length > cap) { const drop = list.shift(); try { void scene.templates?.get(drop.templateId)?.delete()?.catch(() => {}); } catch (e) {} if (isSnare && drop) await edhaFateDeleteSnareRegion(scene, drop.id); }
    await edhaSetFateList(owner, key, list);
    if (isSnare) await edhaFateDropSnareRegion(owner, scene, pt.x, pt.y, entry.id);
    edhaFateCard(owner, null, isSnare
      ? `<p>🪢 <strong>Snare</strong> set (${list.length}/${cap}). The first enemy to end movement on it springs it: [T][D] + Awareness keen + <strong>Restrained</strong>.</p>`
      : `<p>✦ <strong>Ordained Ground</strong> set (${list.length}/${cap}). Allies beginning their turn on it gain +1 all defenses${edhaOwnsTalent(owner, "Bulwark Ground") ? ` and Temp HP = ${cap} (Bulwark)` : ""}, and may Aid at up to 30 ft.</p>`);
  } catch (e) { console.error("Edha Content | Fate place marker failed", e); }
}

// Inevitable Snare — flag the last-placed Snare (+1 Inv), mirroring Pinpoint Charge.
function edhaFateInevitable(actor, item) {
  const list = foundry.utils.deepClone(edhaGetSnares(actor));
  const last = [...list].reverse().find(s => !s.inevitable);
  if (!last) { ui.notifications?.warn("Edha: place a Snare first, then declare it Inevitable."); return; }
  if (!edhaConsumeCost(item)) return;
  last.inevitable = true;
  void edhaSetFateList(actor, "fateSnares", list).then(() => edhaFateCard(actor, null,
    `<p>⛓️ <strong>Inevitable Snare</strong> — your last Snare now deals +[T][D] keen and forces a Speed-vs-your-Green test (→ Disoriented on a fail) when it springs.</p>`));
}

/* --- Spring a Snare (shared by the auto-enter trigger + the Foreknown/Thread manual triggers) ------ */
async function edhaFateSpringSnare(owner, snare, triggerActor, { source = "Snare", bonusFormula = "" } = {}) {
  try {
    const scene = canvas?.scene; if (!scene || !snare) return;
    // consume the snare (drop from the flag + delete its template) BEFORE applying so it can't re-fire
    await edhaSetFateList(owner, "fateSnares", edhaGetSnares(owner).filter(s => s.id !== snare.id));
    try { void scene.templates?.get(snare.templateId)?.delete()?.catch(() => {}); } catch (e) {}
    await edhaFateDeleteSnareRegion(scene, snare.id);
    if (!triggerActor) { edhaFateCard(owner, null, `<p>🪢 <strong>${source}</strong> sprang with no creature in the square.</p>`); return; }
    const rd = owner.getRollData();
    const rolls = [];
    const baseRoll = await new Roll(Roll.replaceFormulaData((snare.formula || EDHA_FATE_SNARE_DMG) + (bonusFormula || ""), rd, { missing: "0" })).evaluate();
    rolls.push(baseRoll); let amt = Math.max(0, Math.floor(baseRoll.total));
    if (snare.inevitable) {
      const ir = await new Roll(Roll.replaceFormulaData(EDHA_FATE_GREEN_DIE, rd, { missing: "0" })).evaluate();
      rolls.push(ir); amt += Math.max(0, Math.floor(ir.total));
    }
    await edhaFateApplyHits(owner, [{ actorUuid: triggerActor.uuid, amount: amt, type: snare.type || "keen", heal: false }]);
    await edhaApplyTimedStatus(triggerActor, "restrained", { owner, expire: "owner" });
    let extra = "";
    if (snare.inevitable) {   // Inevitable Snare — the foe's Speed vs your Green, engine-rolled → Disoriented on a fail
      const dcRoll = await new Roll("1d20 + @skills.green.mod", rd).evaluate(); rolls.push(dcRoll);
      const dc = Number(dcRoll.total) || 0;
      const spd = await edhaRollOpposedSkill(triggerActor, "spd");
      const failed = spd < dc;
      if (failed) await edhaApplyTimedStatus(triggerActor, "disoriented", { owner, expire: "target" });
      extra = `<br>Speed <strong>${spd}</strong> vs your Green <strong>${dc}</strong> — ${failed ? "<strong>Disoriented</strong>" : "resists"}.`;
    }
    edhaFateCard(owner, rolls, `<p>🪢 <strong>${snare.inevitable ? "Inevitable " : ""}${source}</strong> springs on <strong>${triggerActor.name}</strong>: ${amt} ${snare.type || "keen"} + <strong>Restrained</strong> (until the start of your next turn).${extra}</p>`);
    if (edhaOwnsTalent(owner, "Hexmark")) edhaFatePostHexmarkCard(owner, triggerActor);
  } catch (e) { console.error("Edha Content | Fate spring snare failed", e); }
}

/* --- Hexmark (the marked pattern) ----------------------------------------------------------------- */
function edhaFatePostHexmarkCard(owner, target) {
  ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>🎯 <strong>Hexmark</strong> (Reaction) — mark <strong>${target.name}</strong>? For the scene it takes +${edhaFateTier(owner)} keen whenever it takes damage near your Ordained Ground / unsprung Snares.</p>`
      + `<button type="button" class="edha-fate-hexmark" data-owner="${owner.uuid}" data-target="${target.uuid}">Hexmark ${target.name}</button></div>` });
}
async function edhaFateApplyHexmark(owner, target) {
  if (!owner || !target) return;
  await edhaSetActorFlagCross(target, "markedBy.hexmark", { actorId: owner.id });
  edhaFateCard(owner, null, `<p>🎯 <strong>Hexmark</strong> on <strong>${target.name}</strong> — +${edhaFateTier(owner)} keen near your zones (this scene).</p>`);
}
// applyDamage PRE-pass rider: +tier keen when a Hexmarked foe takes damage near the marker owner's zones.
function edhaFateHexmarkIncoming(target, list) {
  try {
    const mk = target?.flags?.["edha-content"]?.markedBy?.hexmark;
    const owner = mk?.actorId ? game.actors?.get(mk.actorId) : null;
    if (!owner || !edhaOwnsTalent(owner, "Hexmark")) return;
    if (!list?.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;
    const ttok = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
    if (!ttok?.center || !edhaFateZonesNear(owner, ttok.center.x, ttok.center.y, 10)) return;
    const bonus = edhaFateTier(owner);
    if (bonus > 0) { list.push({ amount: bonus, type: "keen" }); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎯 <strong>Hexmark</strong> (${owner.name}): +${bonus} keen to ${target.name} near your zones.</p>` }); }
  } catch (e) { console.error("Edha Content | Hexmark rider failed", e); }
}

/* --- Read the Threads — foresight (manual) + slide a zone (engine) --------------------------------- */
function edhaFateReadThreads(actor, item) {
  if (!edhaConsumeCost(item)) return;
  const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
  const markers = [...edhaGetOrdained(actor).map((m, i) => ({ key: "fateOrdained", id: m.id, label: `Ordained #${i + 1}` })),
                   ...edhaGetSnares(actor).map((m, i) => ({ key: "fateSnares", id: m.id, label: `Snare #${i + 1}` }))];
  const btns = markers.map(m => `<button type="button" class="edha-fate-reposition" data-owner="${actor.uuid}" data-key="${m.key}" data-id="${m.id}">Move ${m.label} ≤10 ft</button>`).join(" ");
  ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="edha-trigger-card"><p>🧵 <strong>Read the Threads</strong>${target ? ` — ${target.name}` : ""}: the GM reveals its intended action and movement this turn. Then you may slide one zone ≤10 ft into its path:</p>${btns || `<p style="opacity:.8">(no active zones to move)</p>`}</div>` });
}
async function edhaFateReposition(owner, key, id) {
  const list = foundry.utils.deepClone(edhaGetFateList(owner, key));
  const m = list.find(x => x.id === id); if (!m) { ui.notifications?.info("That zone is gone."); return; }
  const pt = await edhaPickPoint("Click the new square (≤10 ft — range is owner-judged).");
  if (!pt) return;
  m.x = pt.x; m.y = pt.y;
  try { await canvas?.scene?.templates?.get(m.templateId)?.update({ x: pt.x, y: pt.y }); } catch (e) {}
  if (key === "fateSnares") { await edhaFateDeleteSnareRegion(canvas?.scene, id); await edhaFateDropSnareRegion(owner, canvas?.scene, pt.x, pt.y, id); }
  await edhaSetFateList(owner, key, list);
  edhaFateCard(owner, null, `<p>🧵 <strong>Read the Threads</strong> — zone slid into place.</p>`);
}

/* --- Foreknown Strike — scene buff: allies may free-action spring a Snare for +[T][D] -------------- */
function edhaFateForeknown(actor, item) {
  if (!edhaConsumeCost(item)) return;
  void actor.setFlag("edha-content", "fateForeknown", { sceneId: canvas?.scene?.id });
  const sn = edhaGetSnares(actor);
  const btns = sn.map((s, i) => `<button type="button" class="edha-fate-springsnare" data-owner="${actor.uuid}" data-snare="${s.id}">Spring Snare #${i + 1}${s.inevitable ? " ⛓️" : ""}</button>`).join(" ");
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="edha-burst-card"><p>🪡 <strong>Foreknown Strike</strong> (this scene): an ally on your Ordained Ground may, as a Free Action, spring any one unsprung Snare within 30 ft (treating its centre as the trigger) for +[T][D]. Click a button when an ally elects to:</p>${btns || `<p style="opacity:.8">(no unsprung Snares)</p>`}</div>` });
}
async function edhaFateSpringFromCard(owner, snareId, bonusFormula, source) {
  const snare = edhaGetSnares(owner).find(s => s.id === snareId);
  if (!snare) { ui.notifications?.info("That Snare is already sprung."); return; }
  await edhaFateSpringSnare(owner, snare, edhaFateNearestEnemyAt(owner, snare.x, snare.y, 5), { source, bonusFormula });
}

/* --- Weave the Thread — link two Ordained squares (scene; grants are manual) ----------------------- */
function edhaFateWeave(actor, item) {
  const ord = edhaGetOrdained(actor);
  if (ord.length < 2) { ui.notifications?.warn("Edha: you need two active Ordained Ground squares to weave."); return; }
  if (!edhaConsumeCost(item)) return;
  const list = foundry.utils.deepClone(ord);
  list[list.length - 1].linked = true; list[list.length - 2].linked = true;
  void edhaSetFateList(actor, "fateOrdained", list);
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="edha-trigger-card"><p>🪢 <strong>Weave the Thread</strong> (this scene): your two most-recent Ordained squares are linked. An ally on either may Aid as a Free Action (once/round), and when an enemy springs any Snare within 30 ft of either, an ally on either may make a free Reactive Strike against it (GM/players execute the granted actions).</p></div>` });
}

/* --- Thread of Inevitability (capstone) — declared event springs every zone (once/scene) ----------- */
function edhaFateThread(actor, item) {
  if (actor.getFlag("edha-content", "fateThreadUsed")) { ui.notifications?.warn("Edha: Thread of Inevitability is once per scene."); return; }
  if (!edhaConsumeCost(item)) return;
  void actor.setFlag("edha-content", "fateThreadUsed", true);
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="edha-trigger-card"><p>🪧 <strong>Thread of Inevitability</strong> — declare the event that will come to pass. When it does, click to spring every unsprung Snare and rally every Ordained ally:</p><button type="button" class="edha-fate-thread" data-owner="${actor.uuid}">The event occurs — resolve</button></div>` });
}
async function edhaFateThreadResolve(owner) {
  for (const s of [...edhaGetSnares(owner)]) await edhaFateSpringSnare(owner, s, edhaFateNearestEnemyAt(owner, s.x, s.y, 5), { source: "Thread of Inevitability" });
  const n = edhaGetOrdained(owner).length;
  edhaFateCard(owner, null, `<p>🪧 <strong>Thread of Inevitability</strong> resolves — every unsprung Snare has sprung, and each of your ${n} Ordained ally(ies) may make a free Strike or Aid against the nearest enemy within 30 ft (GM/players execute).</p>`);
}

/* --- Ordained Ground turn-start buff (+1 all defenses; Bulwark Temp HP; Aid-at-range grant) -------- */
async function edhaFateRemoveOrdainedBuff(actor) {
  const ex = actor?.effects?.filter(e => e.getFlag?.("edha-content", "fateOrdainedBuff")) ?? [];
  if (ex.length) { try { await actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) {} }
}
async function edhaFateApplyOrdainedBuff(actor) {
  if (actor.effects?.find(e => e.getFlag?.("edha-content", "fateOrdainedBuff"))) return;
  const changes = ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 }));
  try {
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: "Ordained Ground", img: "icons/magic/time/hourglass-tilted-glowing-gold.webp", changes,
      description: "<p>+1 to all defenses until the start of your next turn (Ordained Ground).</p>",
      flags: { "edha-content": { fateOrdainedBuff: true } },
    }]);
  } catch (e) { console.error("Edha Content | Ordained buff apply failed", e); }
}
async function edhaFateTurnStart(combat) {
  try {
    if (!combat?.started) return;
    const tok = combat.combatant?.token; if (!tok) return;
    const ally = tok.actor; if (!ally) return;
    await edhaFateRemoveOrdainedBuff(ally);   // expire last round's buff at the start of this actor's turn
    const c = edhaTokenDocCenter(tok);
    const adisp = tok.disposition ?? 1;
    let buffed = false;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const squares = edhaGetOrdained(owner); if (!squares.length) continue;
      const otok = edhaCasterToken(owner);
      if (otok && (otok.document?.disposition ?? 1) !== adisp) continue;   // allies only (same disposition as the owner)
      if (!squares.some(sq => edhaSameSquare(c.x, c.y, sq))) continue;
      if (!buffed) { await edhaFateApplyOrdainedBuff(ally); buffed = true; }
      if (edhaOwnsTalent(owner, "Bulwark Ground")) await edhaGrantTempHpCross(ally, edhaFateTier(owner), "Bulwark Ground");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>✦ <strong>Ordained Ground</strong> (${owner.name}): ${ally.name} begins its turn ordained — +1 all defenses${edhaOwnsTalent(owner, "Bulwark Ground") ? `, Temp HP ${edhaFateTier(owner)}` : ""}, and may take the Aid action at up to 30 ft (execute by hand).</p>` });
    }
  } catch (e) { console.error("Edha Content | Fate turn-start failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaFateTurnStart(combat); });
Hooks.on("combatStart", (combat) => { if (edhaDefBuffGmGate()) void edhaFateTurnStart(combat); });

/* --- Bulwark Ground — attacks against an ally standing on your Ordained Ground can't benefit from
 * advantage. The INVERSE of the Black pre-roll pipeline (edhaApexPreRoll): it keys off the DEFENDER —
 * the attacker's synced target (edhaTargetsOfRoller), not the roller. If a target stands on a Bulwark
 * owner's Ordained square, any "advantage" on the incoming attack is neutralized to none; disadvantage
 * is left untouched (the card removes a benefit, it never grants one). The GM can still re-toggle in
 * the dialog (same override philosophy as Weakened). Attack/item rolls only — skill tests aren't attacks. */
function edhaTokenOnAnyOrdained(owner, tok) {
  return !!tok?.center && edhaGetOrdained(owner).some(sq => edhaSameSquare(tok.center.x, tok.center.y, sq));
}
function edhaBulwarkGuardOf(tok) {
  if (!tok?.actor) return null;
  for (const owner of edhaCharacterOwnersOf("Bulwark Ground")) {
    if (!edhaGetOrdained(owner).length) continue;
    const otok = edhaCasterToken(owner);
    const ally = tok.actor === owner || (otok && (tok.document?.disposition ?? 1) === (otok.document?.disposition ?? 1));   // the protected creature is the owner's ally (or the owner)
    if (ally && edhaTokenOnAnyOrdained(owner, tok)) return owner;
  }
  return null;
}
function edhaBulwarkNoAdvantage(roll, source, config) {
  try {
    if (roll?.options?._edhaBulwarkNoAdv) return;                       // idempotent (a re-fired pre-roll)
    if (roll?.options?.advantageMode !== "advantage") return;           // only NEUTRALIZE advantage — never grant or stomp disadvantage
    const attacker = edhaD20RollActor(config); if (!attacker) return;
    const targets = edhaTargetsOfRoller(attacker);
    const guarded = targets.find(t => edhaBulwarkGuardOf(t)); if (!guarded) return;
    const owner = edhaBulwarkGuardOf(guarded);
    roll.options.advantageMode = "none"; roll.options._edhaBulwarkNoAdv = true; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "none"; } catch (e) {} return orig(data); };
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>✦ <strong>Bulwark Ground</strong> (${owner.name}): ${guarded.name ?? "the target"} stands on Ordained Ground — this attack can't benefit from advantage.</p>` });
  } catch (e) { console.error("Edha Content | Bulwark no-advantage pre-roll failed", e); }
}
for (const ctx of ["attack", "item"]) { const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1); Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaBulwarkNoAdvantage); }

/* --- Snare auto-trigger: handled by the edha-content.fate-snare Region behavior (above) on
 * tokenEnter + tokenMoveIn, so a foe that walks THROUGH the square springs it — not just one that
 * stops. The Region is armed at placement (edhaFateDropSnareRegion) and dropped on spring/scene-end. */

/* --- Fate chat-card buttons ----------------------------------------------------------------------- */
Hooks.on("renderChatMessageHTML", (msg, html) => {
  try {
    const root = html instanceof HTMLElement ? html : html?.[0];
    root?.querySelectorAll?.(".edha-fate-hexmark").forEach(btn => btn.addEventListener("click", async (ev) => {
      ev.preventDefault(); btn.disabled = true;
      const o = await fromUuid(btn.dataset.owner).catch(() => null); const owner = o?.actor ?? o;
      const t = await fromUuid(btn.dataset.target).catch(() => null); const target = t?.actor ?? t;
      if (owner && target) await edhaFateApplyHexmark(owner, target);
    }));
    root?.querySelectorAll?.(".edha-fate-reposition").forEach(btn => btn.addEventListener("click", async (ev) => {
      ev.preventDefault(); btn.disabled = true;
      const o = await fromUuid(btn.dataset.owner).catch(() => null); const owner = o?.actor ?? o;
      if (owner) await edhaFateReposition(owner, btn.dataset.key, btn.dataset.id);
    }));
    root?.querySelectorAll?.(".edha-fate-springsnare").forEach(btn => btn.addEventListener("click", async (ev) => {
      ev.preventDefault(); btn.disabled = true;
      const o = await fromUuid(btn.dataset.owner).catch(() => null); const owner = o?.actor ?? o;
      if (owner) await edhaFateSpringFromCard(owner, btn.dataset.snare, ` + (${EDHA_FATE_GREEN_DIE})`, "Foreknown Strike");
    }));
    root?.querySelectorAll?.(".edha-fate-thread").forEach(btn => btn.addEventListener("click", async (ev) => {
      ev.preventDefault(); btn.disabled = true;
      const o = await fromUuid(btn.dataset.owner).catch(() => null); const owner = o?.actor ?? o;
      if (owner) await edhaFateThreadResolve(owner);
    }));
  } catch (e) {}
});

/* --- Fate dispatch — preUseItem TAKEOVER (cancel the default single-target flow) ------------------- */
const EDHA_FATE_TALENTS = new Set(["Ordained Ground", "Snare", "Read the Threads", "Inevitable Snare", "Foreknown Strike", "Weave the Thread", "Thread of Inevitability"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!EDHA_FATE_TALENTS.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Ordained Ground":        void edhaFatePlaceMarker(actor, item, "ordained"); break;
      case "Snare":                  void edhaFatePlaceMarker(actor, item, "snare"); break;
      case "Inevitable Snare":       edhaFateInevitable(actor, item); break;
      case "Read the Threads":       edhaFateReadThreads(actor, item); break;
      case "Foreknown Strike":       edhaFateForeknown(actor, item); break;
      case "Weave the Thread":       edhaFateWeave(actor, item); break;
      case "Thread of Inevitability": edhaFateThread(actor, item); break;
    }
    return false;   // cancel the system's default use() for every active Fate talent (no stray card/roll)
  } catch (e) { console.error("Edha Content | Fate preUse-hook failed", e); }
});
// Bulwark Ground (passive — rides the turn-start pass) and Hexmark (Reaction — fires from the Snare card)
// are NOT taken over here; they have no active single-target use to cancel.

// Clear Fate markers / flags / buffs at scene/combat end (GM-side), like the Charge/Chaos state.
async function edhaClearFateState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["fateOrdained", "fateSnares", "fateForeknown", "fateThreadUsed"]) if (a.getFlag?.("edha-content", key)) await a.unsetFlag("edha-content", key);
      await edhaFateRemoveOrdainedBuff(a);
    }
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      const a = t.actor; if (a?.flags?.["edha-content"]?.markedBy?.hexmark) { try { await a.unsetFlag("edha-content", "markedBy.hexmark"); } catch (e) {} }
    }
    for (const scene of game.scenes ?? []) {
      const stale = (scene.templates ?? []).filter(t => t.getFlag?.("edha-content", "fateMarker"));
      if (stale.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", stale.map(t => t.id));
      const staleRgn = (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "fateSnare"));
      if (staleRgn.length) await scene.deleteEmbeddedDocuments("Region", staleRgn.map(r => r.id));
    }
  } catch (e) { console.error("Edha Content | clear Fate state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearFateState(); } catch (e) {} });

/* ============================================================================================
 * SOVEREIGNTY (Verdannis, deity) tree engine (2026-07-01) — the "damage die step" lifecycle.
 * ENGINE + a PROSE-ONLY data change (the 7 die-step cards now say "damage die size" — Ben's ruling
 * 07-01: tests are always d20 in this system; the stepped die is the DAMAGE die, min d4 / max d12 =
 * the [Tier][Die] ladder). Colors Black/White; tag prefix "Sovereignty (Verdannis)."; build
 * `foundry-build deity` → pack `edha-deity`. Attunement Range: BLACK rank for the debuff side,
 * WHITE rank for the buff side + ally-facing checks (Ben, R2). Reuses existing primitives wholesale
 * — NO side-engine, NO new data handler or sidecar table:
 *   • die step      = ONE new reusable primitive: flags.edha-content.dieStep = [{key, steps, scope,
 *     ownerId, castRound, expire}] on the affected creature + registered `exalted`/`diminished`
 *     statuses (the Omen/Isolated marked pattern) + a rewrite in the EXISTING CosmereItem#rollDamage
 *     wrapper (edhaSovStepOverride): bake the formula, move every die on the d4→d6→d8→d10→d12
 *     ladder by the net steps (entries STACK — Ben R6; the d4/d12 clamp is the only rail; dice off
 *     the ladder are left alone). scope:"attack" gates to weapon/attack items (Edict of the Fallen).
 *   • timed expiry  → entry.expire = {round,turn} owner-relative next-turn coordinate (the
 *     edhaApplyTimedStatus convention: "start of your next turn" lands end-of-owner-next-turn) —
 *     swept on combatTurnChange; "scene" entries + statuses cleared on deleteCombat (Chaos pattern).
 *   • defense gates → every ACTIVE test talent is a preUseItem TAKEOVER (cancel default, pay via
 *     edhaConsumeCost, refund on bad targeting) that ROLLS 1d20 + Black and GATES on
 *     edhaReadDefense (NOT trust-the-player) — the Chaos dispatch, verbatim.
 *   • cross-actor   → set-flag / toggle-status socket relays; THP → edhaGrantTempHpCross (keeps the
 *     higher — "does not stack" for free); Inv recovery → the Void Sense resource write.
 * Wired here (no longer GM-eyeballed):
 *   • Censure — Black vs Cognitive → −1 step (all damage) until the start of your next turn.
 *   • Decree of Ruin — Black vs Cognitive → −1 step for the SCENE on success, timed on failure;
 *     once per creature per scene (a per-owner sovDecreeBy stamp; repeat = warned, no cost).
 *   • Edict of the Fallen — Black vs Spiritual → −2 steps on ATTACK damage for the scene + the
 *     failed-attack THP rider (each detected failed attack test → allies in White range gain
 *     THP = your Tier); failure → timed −1 step (all damage).
 *   • Exalt — willing ally → +1 step until the start of your next turn.
 *   • Investiture of Authority — willing ally → +1 step for the SCENE, REPLACING your Exalt entry;
 *     once per ally per scene (sovInvestBy stamp).
 *   • Sovereign's Favor (passive) — rides the Exalt handler: THP = [Tier][Die on White] on the ally.
 *   • Sovereign's Balance — ally +1 / enemy −1 until your next turn; the GM-side hit watcher
 *     (ally attack ≥ enemy Physical defense, cast round only) EXTENDS both one round, once.
 *   • Sovereignty (capstone) — ally +2 / enemy −2 for the scene, once per scene (sovereigntyUsed);
 *     each detected ally→enemy hit posts the "no reactions until the start of its next turn" card.
 *   • Expose (passive) — a diminished-by-you (Censure/Decree — Ben R3) creature FAILS a test →
 *     you recover 1 Investiture (no cap — Ben R4): auto on detected failed ATTACK tests (total vs
 *     the synced target's Physical defense, the Voice-of-Authority watcher read), owner-click card
 *     on other tests (Foundry tests carry no DC); a failed attack whose target is your ally in
 *     White range also posts the Reactive Strike prompt card (the Fate action-grant pattern).
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • Failed NON-attack-test auto-detect — needs DCs Foundry tests don't carry; the owner-click
 *     Expose card is the shape until the system grows DCs.
 *   • Hit detection reads the enemy's PHYSICAL defense (attacks vs Cog/Spi defenses would need the
 *     item to expose its target defense — none does today); misreads err toward not firing.
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • "Willing" ally consent (owner-judged at targeting time).
 *   • The Reactive Strike itself + Sovereignty's reaction-denial — Foundry has no hook to force or
 *     forbid another creature's action; both post prompt cards (detection IS wired).
 *   • CONTEST-EXEMPT: none — every Sovereignty test is vs a DEFENSE (Cognitive/Spiritual), resolved
 *     by rolling the Black test and comparing to edhaReadDefense, never an opposed SKILL.
 * Known limit: engine-side damage that bypasses rollDamage (burst/hazard/triggered formulas other
 * deity engines bake themselves) does not step; the standard weapon/talent damage path does.
 * ============================================================================================ */

const EDHA_SOV_LADDER = [4, 6, 8, 10, 12];   // the damage-die ladder ([Tier][Die] = d(2·rank+2), ranks 1–5)
const EDHA_SOV_DEBUFF_KEYS = new Set(["censure", "decree"]);   // Expose rides these (Ben R3)

function edhaSovSteps(actor) {
  const l = actor?.flags?.["edha-content"]?.dieStep;
  return Array.isArray(l) ? l.filter(e => e && Number(e.steps)) : [];
}
async function edhaSovSetSteps(target, list) {
  const value = list?.length ? list : null;
  try {
    if (target.isOwner) { if (value) await target.setFlag("edha-content", "dieStep", value); else await target.unsetFlag("edha-content", "dieStep"); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to (un)step ${target.name}'s damage die.`); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "dieStep", value } });
    return true;
  } catch (e) { console.error("Edha Content | set dieStep failed", e); return false; }
}
// Keep the exalted/diminished token icons in sync with the entry list (idempotent toggles).
async function edhaSovSyncStatuses(target, list) {
  const up = (list ?? []).some(e => Number(e.steps) > 0), down = (list ?? []).some(e => Number(e.steps) < 0);
  if (up !== !!target.statuses?.has?.("exalted")) await edhaToggleStatus(target, "exalted", up);
  if (down !== !!target.statuses?.has?.("diminished")) await edhaToggleStatus(target, "diminished", down);
}
// The owner-relative timed expiry: the coordinate of the OWNER's next turn ("start of your next
// turn" lands end-of-owner-next-turn, the engine convention). Out of combat → "owner-next", lazily
// stamped by the sweep once combat runs.
function edhaSovTimedExpire(owner) {
  const c = game.combat; if (!c?.started) return "owner-next";
  const ti = edhaCombatantTurnIndex(c, owner);
  return ti >= 0 ? edhaNextTurnCoord(c, ti) : "owner-next";
}
async function edhaSovAddStep(owner, target, entry) {
  const list = [...edhaSovSteps(target), { ...entry, ownerId: owner.id, castRound: game.combat?.round ?? null }];
  const ok = await edhaSovSetSteps(target, list);
  if (ok) await edhaSovSyncStatuses(target, list);
  return ok;
}

/* --- The damage-die rewrite (called from the rollDamage wrapper) ----------------------------------- */
function edhaSovStepFaces(faces, steps) {
  const i = EDHA_SOV_LADDER.indexOf(Number(faces));
  if (i < 0) return null;                                   // off-ladder die (d3/d20/d100) — leave it alone
  return EDHA_SOV_LADDER[Math.max(0, Math.min(EDHA_SOV_LADDER.length - 1, i + steps))];
}
function edhaSovIsAttackItem(item) {
  return item?.type === "weapon" || !!item?.system?.attack || String(item?.system?.activation?.type || "").includes("attack");
}
function edhaSovNetSteps(actor, isAttack) {
  let n = 0;
  for (const e of edhaSovSteps(actor)) { if (e.scope === "attack" && !isAttack) continue; n += Number(e.steps) || 0; }
  return n;   // entries stack (Ben R6); the d4/d12 face clamp is the only rail
}
// Bake the formula against the roller, then move every ladder die by `steps`. One pass handles both
// the [Tier][Die] shape ("(1)d(2 * 3 + 2)" post-bake) and plain "2d8"; the [^A-Za-z_.] guard keeps
// "round(" / "@attr.spd" out. Returns null when nothing on the ladder changed (keep the native roll).
function edhaSovStepFormula(formulaRaw, actor, steps) {
  let baked;
  try { baked = Roll.replaceFormulaData(String(formulaRaw), actor?.getRollData?.() ?? {}, { missing: "0" }); } catch (e) { return null; }
  let changed = false;
  const out = baked.replace(/(^|[^A-Za-z_.])d\s*(?:\(([^()]+)\)|(\d+))/gi, (m, pre, expr, num) => {
    const f = expr != null ? Math.floor(edhaEvalSync(expr, {})) : Number(num);
    const nf = edhaSovStepFaces(f, steps);
    if (nf == null || nf === f) return m;
    changed = true;
    return `${pre}d${nf}`;
  });
  return changed ? out : null;
}
function edhaSovStepOverride(item, base) {
  try {
    const actor = item?.actor; if (!actor || !base) return null;
    const steps = edhaSovNetSteps(actor, edhaSovIsAttackItem(item));
    return steps ? edhaSovStepFormula(base, actor, steps) : null;
  } catch (e) { return null; }
}

/* --- Cards / targeting ------------------------------------------------------------------------------ */
function edhaSovCard(owner, rolls, html) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [], content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaSovTestLine(item, total, def, ok) {
  return `<p>👑 <strong>${item.name}</strong> — Black <strong>${total}</strong> vs ${def == null ? "?" : def}: <strong>${ok ? "success" : "fail"}</strong></p>`;
}
// Split the user's current targets by disposition relative to the owner.
function edhaSovTargets(owner) {
  const otok = edhaCasterToken(owner);
  const disp = otok?.document?.disposition ?? 1;
  const toks = Array.from(game.user?.targets ?? []);
  return {
    allies: toks.filter(t => t.actor && t.actor !== owner && (t.document?.disposition ?? 1) === disp),
    enemies: toks.filter(t => t.actor && (t.document?.disposition ?? 1) !== disp),
  };
}
const edhaSovEnemy = (owner) => edhaSovTargets(owner).enemies[0]?.actor ?? null;
const edhaSovAlly = (owner) => edhaSovTargets(owner).allies[0]?.actor ?? null;

/* --- The Black-vs-defense debuff actives ------------------------------------------------------------ */
async function edhaSovCensure(owner, item) {
  try {
    const target = edhaSovEnemy(owner); if (!target) { ui.notifications?.warn("Edha: target an enemy for Censure."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    await edhaCrownPing(owner, target);   // POWER / Tyrith — Crown of Thorns: a Black talent tested vs Cognitive (fires on the test, success or fail)
    if (ok) await edhaSovAddStep(owner, target, { key: "censure", steps: -1, scope: "all", source: item.name, expire: edhaSovTimedExpire(owner) });
    edhaSovCard(owner, [roll], edhaSovTestLine(item, total, def, ok) + (ok ? `<p>${target.name} is <strong>Diminished</strong> — damage die −1 step until the start of your next turn.</p>` : ""));
  } catch (e) { console.error("Edha Content | Censure failed", e); }
}
async function edhaSovDecree(owner, item) {
  try {
    const target = edhaSovEnemy(owner); if (!target) { ui.notifications?.warn("Edha: target an enemy for Decree of Ruin."); return; }
    if (target.flags?.["edha-content"]?.sovDecreeBy?.[owner.id]) { ui.notifications?.warn(`Edha: Decree of Ruin was already used on ${target.name} this scene.`); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    await edhaCrownPing(owner, target);   // POWER / Tyrith — Crown of Thorns: a Black talent tested vs Cognitive (fires on the test, success or fail)
    await edhaSovAddStep(owner, target, ok
      ? { key: "decree", steps: -1, scope: "all", source: item.name, expire: "scene" }
      : { key: "decree", steps: -1, scope: "all", source: item.name, expire: edhaSovTimedExpire(owner) });
    // once/creature/scene — stamped on use (success OR failure), cleared with the scene state
    if (target.isOwner) { try { await target.setFlag("edha-content", `sovDecreeBy.${owner.id}`, true); } catch (e) {} }
    else if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: `sovDecreeBy.${owner.id}`, value: true } }); } catch (e) {} }
    edhaSovCard(owner, [roll], edhaSovTestLine(item, total, def, ok)
      + `<p>${target.name} is <strong>Diminished</strong> — damage die −1 step ${ok ? "for the <strong>scene</strong>" : "until the start of your next turn"}.</p>`);
  } catch (e) { console.error("Edha Content | Decree of Ruin failed", e); }
}
async function edhaSovEdict(owner, item) {
  try {
    const target = edhaSovEnemy(owner); if (!target) { ui.notifications?.warn("Edha: target an enemy for Edict of the Fallen."); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "spi");
    const roll = await edhaRollColorTest(owner, "black"); const total = Number(roll.total) || 0; const ok = def == null ? true : total >= def;
    await edhaSovAddStep(owner, target, ok
      ? { key: "edict", steps: -2, scope: "attack", source: item.name, expire: "scene" }
      : { key: "edict", steps: -1, scope: "all", source: item.name, expire: edhaSovTimedExpire(owner) });
    edhaSovCard(owner, [roll], edhaSovTestLine(item, total, def, ok) + (ok
      ? `<p>${target.name} is <strong>Diminished</strong> — attack damage die −2 steps for the <strong>scene</strong>; each failed attack test grants your allies in range THP = your Tier.</p>`
      : `<p>${target.name} is <strong>Diminished</strong> — damage die −1 step until the start of your next turn.</p>`));
  } catch (e) { console.error("Edha Content | Edict of the Fallen failed", e); }
}

/* --- The buff actives (no test; "willing" is owner-judged at targeting time) ------------------------ */
async function edhaSovExalt(owner, item) {
  try {
    const ally = edhaSovAlly(owner); if (!ally) { ui.notifications?.warn("Edha: target a willing ally for Exalt."); return; }
    if (!edhaConsumeCost(item)) return;
    await edhaSovAddStep(owner, ally, { key: "exalt", steps: 1, scope: "all", source: item.name, expire: edhaSovTimedExpire(owner) });
    let favor = "";
    if (edhaOwnsTalent(owner, "Sovereign's Favor")) {   // rider: THP = [Tier][Die on White]; edhaGrantTempHpCross keeps the higher (never stacks)
      const fr = await new Roll(Roll.replaceFormulaData("(@tier)d(2 * @skills.white.rank + 2)", owner.getRollData(), { missing: "0" })).evaluate();
      const thp = Math.max(0, Math.floor(fr.total));
      await edhaGrantTempHpCross(ally, thp, "Sovereign's Favor");
      favor = ` <strong>Sovereign's Favor</strong>: ${thp} temporary HP.`;
    }
    edhaSovCard(owner, null, `<p>👑 <strong>Exalt</strong>: ${ally.name} is <strong>Exalted</strong> — damage die +1 step until the start of your next turn.${favor}</p>`);
  } catch (e) { console.error("Edha Content | Exalt failed", e); }
}
async function edhaSovInvestiture(owner, item) {
  try {
    const ally = edhaSovAlly(owner); if (!ally) { ui.notifications?.warn("Edha: target a willing ally for Investiture of Authority."); return; }
    if (ally.flags?.["edha-content"]?.sovInvestBy?.[owner.id]) { ui.notifications?.warn(`Edha: Investiture of Authority was already used on ${ally.name} this scene.`); return; }
    if (!edhaConsumeCost(item)) return;
    // "replacing any existing Exalt on that target" — drop YOUR timed exalt entries, then add the scene one
    const list = edhaSovSteps(ally).filter(e => !(e.key === "exalt" && e.ownerId === owner.id));
    list.push({ key: "investiture", steps: 1, scope: "all", ownerId: owner.id, castRound: game.combat?.round ?? null, source: item.name, expire: "scene" });
    const ok = await edhaSovSetSteps(ally, list);
    if (ok) await edhaSovSyncStatuses(ally, list);
    if (ally.isOwner) { try { await ally.setFlag("edha-content", `sovInvestBy.${owner.id}`, true); } catch (e) {} }
    else if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: ally.uuid, key: `sovInvestBy.${owner.id}`, value: true } }); } catch (e) {} }
    edhaSovCard(owner, null, `<p>👑 <strong>Investiture of Authority</strong>: ${ally.name} is <strong>Exalted</strong> — damage die +1 step for the <strong>scene</strong> (replaces your Exalt).</p>`);
  } catch (e) { console.error("Edha Content | Investiture of Authority failed", e); }
}
async function edhaSovBalance(owner, item) {
  try {
    const ally = edhaSovAlly(owner), enemy = edhaSovEnemy(owner);
    if (!ally || !enemy) { ui.notifications?.warn("Edha: target one willing ally AND one enemy for Sovereign's Balance."); return; }
    if (!edhaConsumeCost(item)) return;
    const pairId = foundry.utils.randomID();
    await edhaSovAddStep(owner, ally, { key: "balance", steps: 1, scope: "all", pairId, source: item.name, expire: edhaSovTimedExpire(owner) });
    await edhaSovAddStep(owner, enemy, { key: "balance", steps: -1, scope: "all", pairId, source: item.name, expire: edhaSovTimedExpire(owner) });
    edhaSovCard(owner, null, `<p>👑 <strong>Sovereign's Balance</strong>: ${ally.name} +1 / ${enemy.name} −1 damage-die step until the start of your next turn. If ${ally.name} hits ${enemy.name} this round, both extend one round (auto-detected).</p>`);
  } catch (e) { console.error("Edha Content | Sovereign's Balance failed", e); }
}
async function edhaSovCapstone(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "sovereigntyUsed")) { ui.notifications?.warn("Edha: Sovereignty was already used this scene."); return; }
    const ally = edhaSovAlly(owner), enemy = edhaSovEnemy(owner);
    if (!ally || !enemy) { ui.notifications?.warn("Edha: target one willing ally AND one enemy for Sovereignty."); return; }
    if (!edhaConsumeCost(item)) return;
    const pairId = foundry.utils.randomID();
    await edhaSovAddStep(owner, ally, { key: "sovereign", steps: 2, scope: "all", pairId, source: item.name, expire: "scene" });
    await edhaSovAddStep(owner, enemy, { key: "sovereign", steps: -2, scope: "all", pairId, source: item.name, expire: "scene" });
    try { await owner.setFlag("edha-content", "sovereigntyUsed", true); } catch (e) {}
    edhaSovCard(owner, null, `<p>👑 <strong>Sovereignty</strong>: for the scene, ${ally.name} +2 / ${enemy.name} −2 damage-die steps. Each time ${ally.name} hits ${enemy.name}, it cannot take reactions until the start of its next turn (card posts on each detected hit).</p>`);
  } catch (e) { console.error("Edha Content | Sovereignty failed", e); }
}

/* --- GM-side watchers: Expose + the Edict of the Fallen THP (failed tests) and Balance/Sovereignty (hits) - */
// Attack-fail read: the roller's synced target's PHYSICAL defense (see the section-header backlog note).
function edhaSovAttackRead(roller, roll) {
  const targets = edhaTargetsOfRoller(roller);
  const ta = targets[0]?.actor ?? null;
  const def = ta ? edhaReadDefense(ta, "phy") : null;
  if (def == null) return null;
  return { target: ta, targetTok: targets[0], def, failed: (Number(roll.total) || 0) < def };
}
async function edhaSovRecoverInv(owner, sourceName, victimName) {
  try {
    const res = owner.system?.resources?.inv; const rmax = edhaResVal(res) ?? ((res?.value ?? 0) + 1);
    await owner.update({ "system.resources.inv.value": Math.min(rmax, (res?.value ?? 0) + 1) });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>${sourceName}</strong>: ${victimName} failed a test — ${owner.name} recovers 1 Investiture.</p>` });
  } catch (e) { console.error("Edha Content | Sovereignty Inv recovery failed", e); }
}
// Expose's owner-click fallback for NON-attack tests (Foundry tests carry no DC — owner judges).
function edhaSovPostExposeCard(owner, victim, total) {
  ChatMessage.create({
    whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>👁️ <strong>Expose</strong>: <strong>${victim.name}</strong> (Diminished by you) rolled a test — total <strong>${total}</strong>. If it FAILED, click to recover 1 Investiture.</p>
      <button type="button" class="edha-sov-expose-btn" data-edha-owner="${owner.uuid}" data-edha-victim="${victim.name}">It failed — recover 1 Investiture</button></div>`,
  });
}
async function edhaSovExposeClick(ev) {
  try {
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    if (!owner) return;
    btn.disabled = true; btn.textContent = "✓ recovered";
    await edhaSovRecoverInv(owner, "Expose", btn.dataset.edhaVictim || "the creature");
  } catch (e) { console.error("Edha Content | Expose click failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-sov-expose-btn").forEach(b => b.addEventListener("click", edhaSovExposeClick));
});

// One GM client inspects each completed test by a die-stepped creature.
async function edhaSovRollWatch(ctx, roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const entries = edhaSovSteps(roller); if (!entries.length) return;
    const isAttackCtx = ctx !== "skill";
    const read = isAttackCtx ? edhaSovAttackRead(roller, roll) : null;

    // ---- Expose (Censure/Decree debuffs) — Inv recovery + the Reactive Strike prompt
    const exposeOwners = new Set(entries.filter(e => e.steps < 0 && EDHA_SOV_DEBUFF_KEYS.has(e.key)).map(e => e.ownerId));
    for (const oid of exposeOwners) {
      const owner = game.actors?.get(oid);
      if (!owner || !edhaOwnsTalent(owner, "Expose")) continue;
      if (read) {                                       // readable attack → auto-resolve the failure
        if (!read.failed) continue;
        await edhaSovRecoverInv(owner, "Expose", roller.name);
        if (read.targetTok && edhaAllyInAttune(owner, read.targetTok, "white")) {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<div class="edha-trigger-card"><p>👁️ <strong>Expose</strong>: ${roller.name}'s attack on <strong>${read.target.name}</strong> failed — ${read.target.name} may make a <strong>Reactive Strike</strong> against it (take it by hand).</p></div>` });
        }
      } else {                                          // non-attack test / unreadable target → owner-judged click card
        edhaSovPostExposeCard(owner, roller, Number(roll.total) || 0);
      }
    }

    // ---- Edict of the Fallen — a failed attack test grants the owner's in-range allies THP = tier
    if (read?.failed) {
      for (const e of entries.filter(x => x.key === "edict" && x.scope === "attack")) {
        const owner = game.actors?.get(e.ownerId); if (!owner) continue;
        const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
        const allies = edhaAlliesInAttune(owner, "white");
        for (const t of allies) await edhaGrantTempHpCross(t.actor, tier, "Edict of the Fallen");
        if (allies.length) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>👑 <strong>Edict of the Fallen</strong>: ${roller.name} failed an attack test — ${allies.length} ally(ies) in range gain ${tier} temporary HP.</p>` });
      }
    }

    // ---- Balance extension / Sovereignty no-reactions — the exalted half HITS the paired enemy
    if (!read || read.failed) return;
    const plus = entries.filter(e => e.steps > 0 && (e.key === "balance" || e.key === "sovereign"));
    if (!plus.length) return;
    const minus = edhaSovSteps(read.target).filter(e => e.steps < 0 && (e.key === "balance" || e.key === "sovereign"));
    for (const pe of plus) for (const me of minus) {
      if (!pe.pairId || pe.pairId !== me.pairId || pe.ownerId !== me.ownerId) continue;
      const owner = game.actors?.get(pe.ownerId);
      if (pe.key === "sovereign") {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner ?? roller }),
          content: `<div class="edha-trigger-card"><p>👑 <strong>Sovereignty</strong>: ${roller.name} hit <strong>${read.target.name}</strong> — it cannot take <strong>reactions</strong> until the start of its next turn (GM-enforced).</p></div>` });
        continue;
      }
      // balance — extend both entries one round, once, cast round only
      if (pe.extended || (game.combat?.round ?? null) !== pe.castRound) continue;
      if (typeof pe.expire !== "object" || typeof me.expire !== "object") continue;   // out-of-combat cast — nothing to extend
      const bump = (a, entry) => {
        const list = edhaSovSteps(a).map(x => (x.pairId === entry.pairId && x.key === "balance")
          ? { ...x, extended: true, expire: { ...x.expire, round: (Number(x.expire.round) || 0) + 1 } } : x);
        return a.setFlag("edha-content", "dieStep", list);
      };
      await bump(roller, pe); await bump(read.target, me);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner ?? roller }),
        content: `<p>👑 <strong>Sovereign's Balance</strong>: ${roller.name} hit ${read.target.name} — both effects extend one additional round.</p>` });
    }
  } catch (e) { console.error("Edha Content | Sovereignty roll watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, (r, s, c) => edhaSovRollWatch(ctx, r, s, c));

/* --- Timed sweep (combatTurnChange) + scene cleanup (deleteCombat) ---------------------------------- */
async function edhaSovSweep(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curSeq = edhaTurnSeq(combat.round, combat.turn);
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      const list = edhaSovSteps(a); if (!list.length) continue;
      let changed = false; const keep = [];
      for (const e of list) {
        if (e.expire === "owner-next") {   // cast out of combat — stamp the owner's next turn now
          const owner = game.actors?.get(e.ownerId);
          const ti = owner ? edhaCombatantTurnIndex(combat, owner) : -1;
          if (ti >= 0) { keep.push({ ...e, expire: edhaNextTurnCoord(combat, ti) }); changed = true; } else keep.push(e);
          continue;
        }
        if (e.expire && typeof e.expire === "object" && curSeq > edhaTurnSeq(e.expire.round, e.expire.turn)) { changed = true; continue; }   // expired
        keep.push(e);   // "scene" entries wait for deleteCombat
      }
      if (!changed) continue;
      if (keep.length) await a.setFlag("edha-content", "dieStep", keep); else await a.unsetFlag("edha-content", "dieStep");
      await edhaSovSyncStatuses(a, keep);
    }
  } catch (e) { console.error("Edha Content | Sovereignty sweep failed", e); }
}
Hooks.on("combatTurnChange", (c) => { if (edhaDefBuffGmGate()) void edhaSovSweep(c); });

async function edhaClearSovState() {
  try {
    if (!game.user?.isGM) return;
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      for (const key of ["dieStep", "sovDecreeBy", "sovInvestBy"]) if (a.getFlag?.("edha-content", key)) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      if (a.statuses?.has?.("exalted")) await a.toggleStatusEffect?.("exalted", { active: false });
      if (a.statuses?.has?.("diminished")) await a.toggleStatusEffect?.("diminished", { active: false });
    }
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      if (a.getFlag?.("edha-content", "sovereigntyUsed")) { try { await a.unsetFlag("edha-content", "sovereigntyUsed"); } catch (e) {} }
    }
  } catch (e) { console.error("Edha Content | clear Sovereignty state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearSovState(); } catch (e) {} });

/* --- Sovereignty dispatch — preUseItem TAKEOVER (cancel the default flow; Chaos/Fate pattern) ------- */
const EDHA_SOV_TALENTS = new Set(["Censure", "Decree of Ruin", "Edict of the Fallen", "Exalt", "Investiture of Authority", "Sovereign's Balance", "Sovereignty"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!EDHA_SOV_TALENTS.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Censure":                  void edhaSovCensure(actor, item); break;
      case "Decree of Ruin":           void edhaSovDecree(actor, item); break;
      case "Edict of the Fallen":      void edhaSovEdict(actor, item); break;
      case "Exalt":                    void edhaSovExalt(actor, item); break;
      case "Investiture of Authority": void edhaSovInvestiture(actor, item); break;
      case "Sovereign's Balance":      void edhaSovBalance(actor, item); break;
      case "Sovereignty":              void edhaSovCapstone(actor, item); break;
    }
    return false;   // cancel the system's default use() for every active Sovereignty talent (no stray card/roll)
  } catch (e) { console.error("Edha Content | Sovereignty preUse-hook failed", e); }
});
// Expose + Sovereign's Favor are passives — no takeover; they ride the roll watcher / Exalt handler.

/* ============================================================================================
 * DEATH (Morrath, deity) tree engine (2026-07-02) — the "Harvested Remains" economy.
 * Colors Black/Green; tag prefix "Death (Morrath)."; build `foundry-build deity` → pack `edha-deity`.
 * Attunement Range follows each talent's die color (Ben R0, 07-02): BLACK ranges Withering Touch /
 * Consuming Decay / Death Ward / Necrotic Cascade; GREEN ranges Bone Garden / Risen Servant and
 * Reaper's Harvest's corpse radius. Reuses existing primitives wholesale — NO side-engine, NO new
 * data handler or sidecar table:
 *   • Remains       = flags.edha-content.remains, an ORDERED corpse-ref list on the owner (the
 *     Destruction Charge-list pattern): cap = tier, oldest fizzles past cap, spending pops the
 *     oldest; unset reads as the scene-start freebie (Reaper's Harvest owners only); cleared on
 *     deleteCombat. Marked corpses wear the new `harvested` status (green-tinted skull — Ben R1).
 *   • defeat signal = ONE GM-side preUpdateActor→updateActor watcher (the focus-watcher shape)
 *     that fires only on a live→0 HP crossing; PC drops NEVER count (Ben R2, tree-wide), summons
 *     and Death-Warded creatures are skipped. Reaper's Harvest + Necrotic Cascade both ride it.
 *   • cross-actor   → set-flag / toggle-status / burst-apply relays; damage under _edhaInTrigger.
 * Wired here (no longer GM-eyeballed):
 *   • Withering Touch — use arms `witherNext` (1 Inv via activation); your next WEAPON hit
 *     (applyDamage post-pass = a real hit; melee-ness edhaAttackKind-gated) auto-deals the talent's own
 *     [T][D black]+Wil vital AND full-blocks healing until the start of your next turn
 *     (edhaApplyHealCut fraction 0 — the widened Necrotic Grasp primitive; Temp HP still lands,
 *     Ben R3: THP is not "regaining HP"). Don't also click the card's damage roll.
 *   • Reaper's Harvest (passive) — a qualifying drop in Green range → +1 Investiture + the corpse
 *     joins the Remains list (harvested icon). Sense-through-obstruction is narrative (manual).
 *   • Consuming Decay — preUseItem TAKEOVER: ENFORCES the target gate (Weakened or below half HP,
 *     in Black range, one instance per character — any owner), pays 2 Inv, stamps flags.decay +
 *     the `decaying` status (own id — never collides with real Black afflictions, Ben R4); a
 *     GM-side combatTurnChange tick (the affliction-tick shape) RE-ROLLS [T][D black] vital at the
 *     start of the target's turns and heals the owner half. Removing the icon ends the decay.
 *   • Bone Garden — preUseItem TAKEOVER: 1 Inv + 1 Remain, click-to-place (Green range-checked) a
 *     10 ft SQUARE Region carrying the NATIVE modifyMovementCost walk×2 (the enforced Green-
 *     Territory difficult terrain) + a turnEndDamage flag; a combatTurnChange check (the
 *     Spreading-Roots shape) deals [T][D green] keen to ANY creature — allies and the owner too
 *     (Ben R5) — that ends its turn inside. Terrain persists until the GM clears the map (the
 *     Destruction/Green terrain convention).
 *   • Death Ward — preUseItem TAKEOVER (replaces the old on-use THP data event — Ben R6): willing
 *     = same-disposition target; unwilling → ROLLS 1d20+Black and GATES on edhaReadDefense(spi)
 *     (never trust-the-player; a failed test still spends the cost). Success stamps
 *     flags.deathWard; the applyDamage POST-pass restores the first lethal drop to 1 HP, rolls
 *     [T][D black]+Pre Temp HP (edhaGrantTempHpCross), clears the ward. The defeat watcher skips
 *     warded creatures (no false harvest/cascade on a saved drop).
 *   • Necrotic Cascade — use arms `cascadeArmed` for the scene (replaces the old killer-only
 *     edha-on-defeat data event — Ben R7; the 1 Inv deducts via the normal activation); ANY
 *     qualifying drop in Black range → one [T][D black] spirit roll (the talent's own formula)
 *     applied to each enemy within 10 ft of the body. The _edhaCascadeBusy latch keeps nested
 *     kills from chaining (Ben's original ruling kept); nested drops still HARVEST.
 *   • Risen Servant — the authored edha-summon data event STAYS (spec confirmed as authored —
 *     Ben R8: Athletics-vs-Physical to-hit scaled by tier; Frightened/Compelled aren't native
 *     conditions → sheet-noted manual). The engine adds the gates: refuse PRE-cost without a
 *     Remain or at the sustain cap (= tier active Risen Servants); the Remain spends on use.
 *   • Raise Dead — preUseItem TAKEOVER: once per scene (raiseDeadUsed), target a token at 0 HP
 *     ("died within the last hour" + touch = owner-judged, the Sovereignty "willing" convention);
 *     4 Inv, optional Remain confirm; restores to 1 HP via the burst-apply heal relay (the
 *     defeated overlay self-clears on the HP-sync), Disoriented until the end of ITS next turn
 *     (edhaApplyTimedStatus, expire target), initiative moved onto the caster's (GM-side;
 *     card-noted for players). The +1 injury auto-creates via edhaAddInjury (2026-07-04).
 *   • Speak with the Fallen — the 2 Inv wires via activation.consume; use prompts "spend a
 *     Remain, or you are touching remains ≤24 h old (owner-judged)" and posts the 3-questions
 *     card. The Q&A itself is table narrative.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Withering Touch melee-ness — edhaAttackKind gates the rider: a definitive ranged weapon hit
 *     is skipped and the arm STAYS for the next melee hit; unknown = owner-judged as before.
 *   • GM summon relay — Risen Servant now materializes via `summon-actor` for players without
 *     actor-create permission (spec baked owner-side; SHARED, wired in edhaSummon).
 *   • Raise Dead "+one additional injury" — edhaAddInjury auto-creates it (world "Injuries" table
 *     wins, else the placeholder list; created via the create-item relay when the target isn't ours).
 *   (Shared backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9, consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Reaper's Harvest sense-through-obstruction — WIRED 07-16c (Ben's B6 ruling): Harvested
 *     Remains render to the owner's client through walls/fog via edhaSenseRevealShows.
 *   • Speak with the Fallen's Q&A ("truthfully but
 *     briefly") + its +2 Inv repeat cost (trusted, card-noted); Raise Dead's died-within-the-hour
 *     / touching-the-remains judgment; Death Ward's "willing" consent (owner-judged at targeting);
 *     Risen Servant's one-attack-per-turn cadence (action economy, trusted).
 *   • CONTEST-EXEMPT: none — the tree's only test (Death Ward) is vs a DEFENSE (Spiritual),
 *     resolved by rolling Black and comparing to edhaReadDefense, never an opposed SKILL.
 * ============================================================================================ */

const EDHA_DEATH_BLACK_DIE = "(@tier)d(2 * @skills.black.rank + 2)";
const EDHA_DEATH_GREEN_DIE = "(@tier)d(2 * @skills.green.rank + 2)";

function edhaDeathCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaDeathTier(owner) { return Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1); }
function edhaDeathTalent(owner, name) { return owner.items.find(i => edhaIsTalent(i) && i.name === name) ?? null; }
// Range gate vs a target TOKEN (unknown positions don't hard-block — the owner judged the targeting).
function edhaDeathInRange(owner, targetTok, color) {
  const otok = edhaCasterToken(owner); if (!otok || !targetTok) return true;
  return edhaTokensWithin(otok, edhaAttuneFtColor(owner, color)).some(t => t.id === targetTok.id);
}

/* --- The Remains list (cap = tier; oldest first; unset = the scene-start freebie) ------------------- */
function edhaRemainsList(owner) {
  const l = owner?.flags?.["edha-content"]?.remains;
  if (Array.isArray(l)) return l;
  return edhaOwnsTalent(owner, "Reaper's Harvest") ? [{ tokenUuid: null }] : [];   // "You begin each scene with 1"
}
async function edhaSetRemains(owner, list) {
  try { await owner.setFlag("edha-content", "remains", list); }   // [] ≠ unset: the freebie stays spent
  catch (e) { console.error("Edha Content | Remains write failed", e); }
}
async function edhaUnmarkRemain(entry) {
  if (!entry?.tokenUuid) return;
  try {
    const ref = await fromUuid(entry.tokenUuid).catch(() => null);
    const a = ref?.actor ?? ref;
    if (a?.statuses?.has?.("harvested")) await edhaToggleStatus(a, "harvested", false);
  } catch (e) {}
}
async function edhaSpendRemain(owner, source) {
  const list = foundry.utils.deepClone(edhaRemainsList(owner));
  if (!list.length) { ui.notifications?.warn(`Edha: ${owner.name} has no Harvested Remains for ${source}.`); return false; }
  const spent = list.shift();   // oldest first (the Destruction Charge convention)
  await edhaSetRemains(owner, list);
  await edhaUnmarkRemain(spent);
  edhaDeathCard(owner, null, `<p>💀 <strong>${source}</strong>: a Harvested Remain is consumed — <strong>${list.length}</strong> remain${list.length === 1 ? "" : "s"} left.</p>`, { whisper: true });
  return true;
}
// GM-side (called from the defeat watcher): mark the corpse + push it onto the owner's list.
async function edhaGainRemain(owner, victim) {
  const cap = edhaDeathTier(owner);
  const list = foundry.utils.deepClone(edhaRemainsList(owner));
  const vtok = edhaCasterToken(victim) ?? victim?.getActiveTokens?.()[0];
  list.push({ tokenUuid: vtok?.document?.uuid ?? null });
  while (list.length > cap) await edhaUnmarkRemain(list.shift());   // oldest fizzles past cap
  await edhaSetRemains(owner, list);
  if (victim && !victim.statuses?.has?.("harvested")) await edhaToggleStatus(victim, "harvested", true);
  return list.length;
}

/* --- The defeat watcher: live→0 crossing feeds Reaper's Harvest + Necrotic Cascade ------------------ */
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    const nh = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (nh === undefined) return;
    options.edhaHea = { old: Number(actor.system?.resources?.hea?.value) || 0, new: Number(nh) || 0 };
  } catch (e) {}
});
let _edhaCascadeBusy = false;
Hooks.on("updateActor", async (victim, changes, options) => {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one applier
    const h = options?.edhaHea;
    if (!h || h.new > 0 || h.old <= 0) return;                     // only a live→0 crossing counts
    if (victim.type === "character") return;                       // PC drops don't count (Ben R2)
    if (victim.getFlag?.("edha-content", "summon")) return;        // summons dissolve — no corpse
    if (victim.getFlag?.("edha-content", "deathWard")) return;     // the Ward restores them (post-pass)
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0]; if (!vtok) return;
    // Reaper's Harvest — +1 Investiture + mark the corpse (Green range).
    for (const owner of edhaCharacterOwnersOf("Reaper's Harvest")) {
      if (!edhaDeathInRange(owner, vtok, "green") || !edhaCasterToken(owner)) continue;
      const res = owner.system?.resources?.inv; const rmax = edhaResVal(res) ?? ((res?.value ?? 0) + 1);
      try { await owner.update({ "system.resources.inv.value": Math.min(rmax, (res?.value ?? 0) + 1) }); } catch (e) {}
      const n = await edhaGainRemain(owner, victim);
      edhaDeathCard(owner, null, `<p>💀 <strong>Reaper's Harvest</strong>: ${victim.name} falls — ${owner.name} recovers 1 Investiture and marks the corpse. Remains: <strong>${n}</strong> (cap = tier).</p>`, { whisper: true });
    }
    // Necrotic Cascade — armed for the scene → [T][D black] spirit to enemies within 10 ft of the body.
    if (_edhaCascadeBusy) return;                                  // nested kills don't auto-chain
    for (const owner of edhaCharacterOwnersOf("Necrotic Cascade")) {
      if (!owner.getFlag?.("edha-content", "cascadeArmed")) continue;
      if (!edhaDeathInRange(owner, vtok, "black") || !edhaCasterToken(owner)) continue;
      const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, 10)
        .filter(t => t.actor && t.actor !== victim && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
      if (!foes.length) continue;
      const formula = edhaDeathTalent(owner, "Necrotic Cascade")?.system?.damage?.formula || EDHA_DEATH_BLACK_DIE;
      const dr = await new Roll(Roll.replaceFormulaData(formula, owner.getRollData(), { missing: "0" })).evaluate();
      const amt = Math.max(0, Math.floor(dr.total));
      if (amt <= 0) continue;
      _edhaCascadeBusy = true;
      try {
        await edhaApplyBurstResults({ casterActorUuid: owner.uuid,
          hits: foes.map(t => ({ actorUuid: t.actor.uuid, amount: amt, type: "spirit", heal: false })) });
      } finally { _edhaCascadeBusy = false; }
      edhaDeathCard(owner, [dr], `<p>💀 <strong>Necrotic Cascade</strong>: ${victim.name} drops — <strong>${amt}</strong> spirit to ${foes.map(t => t.name).join(", ")} (within 10 ft of the body).</p>`);
    }
  } catch (e) { console.error("Edha Content | Death defeat watcher failed", e); }
});

/* --- Withering Touch — armed strike rider (fires from the applyDamage post-pass on a real hit) ------ */
async function edhaWitherArm(owner) {
  try {
    await owner.setFlag("edha-content", "witherNext", true);
    edhaDeathCard(owner, null, `<p>🥀 <strong>Withering Touch</strong>: ${owner.name}'s next melee weapon hit withers — the talent's [Tier][Die]+Willpower vital is applied automatically, and the target cannot regain HP until the start of ${owner.name}'s next turn (a ranged hit is skipped and the touch stays armed). Don't also roll the card's damage by hand.</p>`);
  } catch (e) { console.error("Edha Content | Withering Touch arm failed", e); }
}
async function edhaWitherStrike(dealer, target) {
  try {
    const owner = dealer?.actor;
    if (!owner?.getFlag?.("edha-content", "witherNext")) return;
    if (dealer.item?.type !== "weapon") return;                    // rides the next WEAPON hit
    if (edhaAttackKind(dealer.item) === "ranged") return;          // melee-gated — stays ARMED for the next melee hit (unknown = owner-judged)
    try { await owner.unsetFlag("edha-content", "witherNext"); } catch (e) {}
    const tal = edhaDeathTalent(owner, "Withering Touch");
    const formula = tal?.system?.damage?.formula || `${EDHA_DEATH_BLACK_DIE} + @attr.wil`;
    const dr = await new Roll(Roll.replaceFormulaData(formula, owner.getRollData(), { missing: "0" })).evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    _edhaInTrigger = true;   // the rider's own damage must not re-trigger on-hit dispatch
    try { if (amt > 0) await target.applyDamage([{ amount: amt, type: tal?.system?.damage?.type || "vital" }], { chatMessage: false }); }
    finally { _edhaInTrigger = false; }
    await edhaApplyHealCut(target, owner, 0, "Withering Touch");   // fraction 0 = cannot regain HP (Temp HP still lands — Ben R3)
    edhaDeathCard(owner, [dr], `<p>🥀 <strong>Withering Touch</strong>: +<strong>${amt}</strong> vital to ${target.name}, who cannot regain HP until the start of ${owner.name}'s next turn.</p>`);
  } catch (e) { console.error("Edha Content | Withering Touch strike failed", e); }
}

/* --- Consuming Decay — enforced target gate + a per-turn re-rolled drain (affliction-tick shape) ---- */
async function edhaConsumingDecay(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const target = toks[0]?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target the creature for Consuming Decay."); return; }
    if (!edhaDeathInRange(owner, toks[0], "black")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Black).`); return; }
    const hea = target.system?.resources?.hea;
    const hp = Number(hea?.value) || 0, max = Number(hea?.max?.value ?? hea?.max) || 0;
    if (!(target.statuses?.has?.("weakened") || (max > 0 && hp < max / 2))) {
      ui.notifications?.warn(`Edha: ${target.name} must be Weakened or below half HP for Consuming Decay.`); return;
    }
    if (target.getFlag?.("edha-content", "decay")) { ui.notifications?.warn(`Edha: ${target.name} is already decaying (one instance per character).`); return; }
    if (!target.isOwner && !game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to afflict Consuming Decay."); return; }
    if (!edhaConsumeCost(item)) return;
    const formula = Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_DEATH_BLACK_DIE, owner.getRollData(), { missing: "0" });
    const value = { ownerId: owner.id, ownerName: owner.name, formula, type: item.system?.damage?.type || "vital" };
    if (target.isOwner) await target.setFlag("edha-content", "decay", value);
    else game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "decay", value } });
    await edhaToggleStatus(target, "decaying", true);
    edhaDeathCard(owner, null, `<p>🦠 <strong>Consuming Decay</strong>: ${target.name} is <strong>Decaying</strong> — for the scene it takes [Tier][Die] vital at the start of each of its turns, and ${owner.name} regains half the damage as HP. Remove the icon to end it.</p>`);
  } catch (e) { console.error("Edha Content | Consuming Decay failed", e); }
}
async function edhaDecayTurnTick(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const actor = combat.combatant?.actor; if (!actor) return;
    const d = actor.getFlag?.("edha-content", "decay"); if (!d) return;
    if (!actor.statuses?.has?.("decaying")) { try { await actor.unsetFlag("edha-content", "decay"); } catch (e) {} return; }   // icon removed = decay ended
    if ((actor.system?.resources?.hea?.value ?? 0) <= 0) return;   // corpses don't decay further
    const dr = await new Roll(d.formula || "0").evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    if (amt > 0) {
      _edhaInTrigger = true;   // the tick's damage must not re-trigger on-hit / native dispatch
      try { await actor.applyDamage([{ amount: amt, type: d.type || "vital" }], { chatMessage: false }); }
      finally { _edhaInTrigger = false; }
    }
    const owner = game.actors?.get(d.ownerId);
    const back = Math.floor(amt / 2);
    let healed = "";
    if (owner && back > 0 && (Number(owner.system?.resources?.hea?.value) || 0) > 0) {
      const ohea = owner.system.resources.hea;
      const omax = Number(ohea?.max?.value ?? ohea?.max) || 0;
      const next = Math.min(omax || Infinity, (Number(ohea?.value) || 0) + back);
      try { await owner.update({ "system.resources.hea.value": next }); healed = ` ${owner.name} regains <strong>${back}</strong> HP.`; } catch (e) {}
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls: [dr],
      content: `<p>🦠 <strong>Consuming Decay</strong> — ${actor.name} takes <strong>${amt}</strong> ${d.type || "vital"} (start of turn).${healed}</p>` });
  } catch (e) { console.error("Edha Content | Consuming Decay tick failed", e); }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaDecayTurnTick(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaDecayTurnTick(combat); });
// Removing the Decaying icon ends the decay (mirrors the affliction cleanup hook).
Hooks.on("deleteActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!effect?.statuses?.has?.("decaying")) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    if (!a.statuses?.has?.("decaying")) void a.unsetFlag("edha-content", "decay");
  } catch (e) { console.error("Edha Content | decay cleanup failed", e); }
});

/* --- Bone Garden — 10 ft square: enforced difficult terrain + end-of-turn keen -------------------- */
async function edhaPlaceBoneGardenGM(scene, owner, shape, baked, type) {
  try {
    if (!scene || !owner || !shape) return null;
    const hex = EDHA_COLOR_HEX.green;
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Bone Garden`, color: hex,
      shapes: [{ ...shape, hole: false }],
      behaviors: [{ type: "modifyMovementCost", name: "Difficult Terrain", system: { difficulties: { walk: 2 } } }],
      flags: { "edha-content": { scope: "scene", terrain: { ownerUuid: owner.uuid, color: "green" },
               turnEndDamage: { formula: baked, type: type || "keen", source: `Bone Garden — ${owner.name}` } } },
    }]);
    if (!region) return null;
    try {
      await scene.createEmbeddedDocuments("Drawing", [{
        x: shape.x, y: shape.y, rotation: 0,
        shape: { type: "r", width: shape.width, height: shape.height },
        strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
        fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
        text: "🦴 Bone Garden", fontSize: 18, textColor: hex, textAlpha: 0.9,
        flags: { "edha-content": { hazardVisual: { regionId: region.id } } },
      }]);
    } catch (e) {}
    return region;
  } catch (e) { console.error("Edha Content | place Bone Garden failed", e); return null; }
}
async function edhaBoneGarden(owner, item) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene for Bone Garden."); return; }
    if (edhaRemainsList(owner).length < 1) { ui.notifications?.warn(`Edha: ${owner.name} has no Harvested Remain to plant.`); return; }
    if (!game.user?.isGM && !game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to plant a Bone Garden."); return; }
    const pt = await edhaPickPoint(`Click the center of the 10 ft Bone Garden square (right-click to cancel).`);
    if (!pt) { ui.notifications?.info("Bone Garden canceled — nothing spent."); return; }
    const otok = edhaCasterToken(owner);
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    if (otok) {
      const distFt = (Math.hypot(pt.x - otok.center.x, pt.y - otok.center.y) / gs) * gd;
      const ft = edhaAttuneFtColor(owner, "green");
      if (distFt > ft) { ui.notifications?.warn(`Edha: that square is ${Math.round(distFt)} ft away — outside your ${ft} ft Attunement Range (Green). Nothing spent.`); return; }
    }
    if (!edhaConsumeCost(item)) return;
    if (!(await edhaSpendRemain(owner, item.name))) { edhaRefundCost(item); return; }
    const sidePx = Math.round((10 / gd) * gs);
    const shape = { type: "rectangle", x: Math.round(pt.x - sidePx / 2), y: Math.round(pt.y - sidePx / 2), width: sidePx, height: sidePx, rotation: 0 };
    const baked = Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_DEATH_GREEN_DIE, owner.getRollData(), { missing: "0" });
    const type = item.system?.damage?.type || "keen";
    if (game.user?.isGM) await edhaPlaceBoneGardenGM(scene, owner, shape, baked, type);
    else game.socket.emit("module.edha-content", { action: "bone-garden", payload: { sceneId: scene.id, ownerUuid: owner.uuid, shape, baked, type } });
    edhaDeathCard(owner, null, `<p>🦴 <strong>Bone Garden</strong>: a 10 ft square of grasping bone — enforced difficult terrain for the scene; ANY creature that ends its turn inside takes <strong>${baked}</strong> ${type} (auto-applied).</p>`);
  } catch (e) { console.error("Edha Content | Bone Garden failed", e); }
}
// End-of-turn damage: the creature whose turn just ended is standing in a Bone Garden (Spreading-Roots shape).
async function edhaBoneGardenTurnEnd(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const tdoc = combat.turns?.[prevTurn]?.token; const tok = tdoc?.object; if (!tok?.actor) return;
    if ((tok.actor.system?.resources?.hea?.value ?? 1) <= 0) return;
    const scene = tok.scene ?? canvas?.scene;
    for (const region of (scene?.regions ?? [])) {
      const cfg = region.getFlag?.("edha-content", "turnEndDamage"); if (!cfg) continue;
      if (!edhaPointInRegion(region, tok.center?.x ?? 0, tok.center?.y ?? 0)) continue;
      const dr = await new Roll(cfg.formula || "0").evaluate();
      const amt = Math.max(0, Math.floor(dr.total));
      if (amt <= 0) continue;
      _edhaInTrigger = true;
      try { await tok.actor.applyDamage([{ amount: amt, type: cfg.type || "keen" }], { chatMessage: false }); }
      finally { _edhaInTrigger = false; }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: tok.actor }), rolls: [dr],
        content: `<p>🦴 <strong>${tok.actor.name}</strong> ends its turn in the ${cfg.source || "Bone Garden"} — takes <strong>${amt}</strong> ${cfg.type || "keen"}.</p>` });
    }
  } catch (e) { console.error("Edha Content | Bone Garden turn-end failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaBoneGardenTurnEnd(combat); });
// Player → GM relay for the Region write.
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;
        if (data?.action !== "bone-garden") return;
        const p = data.payload || {}; const scene = game.scenes?.get(p.sceneId);
        const oref = await fromUuid(p.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref;
        if (scene && owner) await edhaPlaceBoneGardenGM(scene, owner, p.shape, p.baked, p.type);
      } catch (e) { console.error("Edha Content | bone-garden relay failed", e); }
    });
  } catch (e) {}
});

/* --- Death Ward — willing free / unwilling Black vs Spiritual; the save fires in the post-pass ------ */
async function edhaDeathWardCast(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const target = toks[0]?.actor;
    if (!target) { ui.notifications?.warn("Edha: target the character for Death Ward."); return; }
    if (!edhaDeathInRange(owner, toks[0], "black")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Black).`); return; }
    if (target.getFlag?.("edha-content", "deathWard")) { ui.notifications?.warn(`Edha: ${target.name} already bears a Death Ward.`); return; }
    if (!target.isOwner && !game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to ward another's character."); return; }
    if (!edhaConsumeCost(item)) return;
    const willing = !edhaDisposHostile(owner, target);   // same disposition = willing (owner-judged at targeting)
    let rolls = null, line = "";
    if (!willing) {
      const def = edhaReadDefense(target, "spi");
      const roll = await edhaRollColorTest(owner, "black");
      const total = Number(roll.total) || 0, ok = def == null ? true : total >= def;
      rolls = [roll];
      line = `<p>💀 <strong>${item.name}</strong> — Black <strong>${total}</strong> vs Spiritual ${def ?? "?"}: <strong>${ok ? "success" : "fail"}</strong></p>`;
      if (!ok) { edhaDeathCard(owner, rolls, line + `<p>No ward takes hold.</p>`); return; }   // cost stays spent
    }
    const baked = Roll.replaceFormulaData(item.system?.damage?.formula || `${EDHA_DEATH_BLACK_DIE} + @attr.pre`, owner.getRollData(), { missing: "0" });
    const value = { ownerId: owner.id, ownerName: owner.name, formula: baked };
    if (target.isOwner) await target.setFlag("edha-content", "deathWard", value);
    else game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "deathWard", value } });
    edhaDeathCard(owner, rolls, line + `<p>${target.name} bears a <strong>Death Ward</strong> — the first time they would drop to 0 HP this scene, they drop to 1 HP instead and gain [Tier][Die]+Presence Temp HP. The ward then ends.</p>`);
  } catch (e) { console.error("Edha Content | Death Ward failed", e); }
}
// Called from the applyDamage POST-pass on EVERY application (cheap flag read). Runs on the applying
// client — the one that just wrote the target's HP, so it can write it back.
async function edhaDeathWardCheck(target, prevHp) {
  try {
    const ward = target?.getFlag?.("edha-content", "deathWard"); if (!ward) return;
    const hp = Number(target.system?.resources?.hea?.value) || 0;
    if (hp > 0 || prevHp <= 0) return;                             // only the lethal drop fires it
    try { await target.unsetFlag("edha-content", "deathWard"); } catch (e) {}
    const dr = await new Roll(ward.formula || "0").evaluate();
    const thp = Math.max(0, Math.floor(dr.total));
    if (target.isOwner || game.user?.isGM) await target.update({ "system.resources.hea.value": 1 });
    else game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: target.uuid, amount: 1, heal: true }] } });
    await edhaGrantTempHpCross(target, thp, "Death Ward");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), rolls: [dr],
      content: `<p>💀 <strong>Death Ward</strong> (${ward.ownerName}): ${target.name} drops to <strong>1 HP</strong> instead of 0 and gains <strong>${thp}</strong> Temp HP. The ward ends.</p>` });
  } catch (e) { console.error("Edha Content | Death Ward check failed", e); }
}

/* --- Necrotic Cascade arm / Raise Dead / Speak with the Fallen -------------------------------------- */
async function edhaCascadeArm(owner) {
  try {
    await owner.setFlag("edha-content", "cascadeArmed", true);
    edhaDeathCard(owner, null, `<p>💀 <strong>Necrotic Cascade</strong> armed for the scene: when a creature drops to 0 HP within ${owner.name}'s Attunement Range (Black), each enemy within 10 ft of it takes [Tier][Die] spirit (auto-applied; nested kills don't chain).</p>`);
  } catch (e) { console.error("Edha Content | Necrotic Cascade arm failed", e); }
}
async function edhaRaiseDead(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "raiseDeadUsed")) { ui.notifications?.warn("Edha: Raise Dead was already used this scene."); return; }
    const toks = Array.from(game.user?.targets ?? []); const tok = toks[0]; const target = tok?.actor;
    if (!target) { ui.notifications?.warn("Edha: target the remains (a token at 0 HP) for Raise Dead."); return; }
    if ((target.system?.resources?.hea?.value ?? 1) > 0) { ui.notifications?.warn(`Edha: ${target.name} is not at 0 HP.`); return; }
    if (!edhaConsumeCost(item)) return;   // "died within the last hour" + touch = owner-judged at targeting
    let remainNote = "";
    if (edhaRemainsList(owner).length > 0) {
      let yes = false;
      try {
        yes = await foundry.applications.api.DialogV2.confirm({
          window: { title: "Raise Dead" },
          content: `<p>Does a <strong>Harvested Remain</strong> represent ${target.name}? (It is consumed.)</p>`,
          modal: false, rejectClose: false,
        });
      } catch (e) { yes = false; }
      if (yes && await edhaSpendRemain(owner, item.name)) remainNote = " A Harvested Remain is consumed.";
    }
    try { await owner.setFlag("edha-content", "raiseDeadUsed", true); } catch (e) {}
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: target.uuid, amount: 1, heal: true }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "target" });   // until the end of ITS next turn
    let initNote = " GM: move its combatant onto the caster's initiative.";
    const c = game.combat;
    if (c?.started) {
      const oc = c.combatants.find(x => x.actorId === owner.id);
      const tc = c.combatants.find(x => x.tokenId === tok.id || x.actorId === target.id);
      if (oc && tc && game.user?.isGM) { try { await tc.update({ initiative: oc.initiative }); initNote = ""; } catch (e) {} }
    } else initNote = "";
    // The "+one additional injury" — auto-created via the shared injury tool (was a GM-facing card).
    const injName = await edhaAddInjury(target, { source: "Raise Dead" });
    const injNote = injName ? ` The raising leaves its mark: <strong>${injName}</strong> (injury added).` : ` <strong>GM: add ONE additional injury</strong> to ${target.name}.`;
    edhaDeathCard(owner, null, `<p>⚰️ <strong>Raise Dead</strong>: ${target.name} returns to life at <strong>1 HP</strong>, <strong>Disoriented</strong> until the end of its next turn, acting on ${owner.name}'s initiative.${remainNote}${injNote}${initNote} <span style="opacity:.8">(Once per scene.)</span></p>`);
  } catch (e) { console.error("Edha Content | Raise Dead failed", e); }
}
async function edhaSpeakWithFallen(owner, item) {
  try {
    let spent = false;
    if (edhaRemainsList(owner).length > 0) {
      let yes = false;
      try {
        yes = await foundry.applications.api.DialogV2.confirm({
          window: { title: "Speak with the Fallen" },
          content: `<p>Spend a <strong>Harvested Remain</strong>? (Otherwise you must be touching the remains of a character that died within the last 24 hours — owner-judged.)</p>`,
          modal: false, rejectClose: false,
        });
      } catch (e) { yes = false; }
      if (yes) spent = await edhaSpendRemain(owner, item.name);
    }
    edhaDeathCard(owner, null, `<p>🕯️ <strong>Speak with the Fallen</strong>: ask up to <strong>3 questions</strong> — the spirit answers truthfully but briefly. ${spent ? "A Harvested Remain is consumed." : "Touching remains that died within 24 h (owner-judged)."} <span style="opacity:.8">Each additional use on the same remains within 24 h costs +2 Investiture (not auto-deducted).</span></p>`);
  } catch (e) { console.error("Edha Content | Speak with the Fallen failed", e); }
}

/* --- Death dispatch: takeovers + pre-cost gates + post-use riders ----------------------------------- */
const EDHA_DEATH_TAKEOVER = new Set(["Consuming Decay", "Bone Garden", "Death Ward", "Raise Dead"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.name === "Risen Servant" && edhaOwnsTalent(actor, "Risen Servant")) {   // gate, NOT a takeover
      if (edhaRemainsList(actor).length < 1) { ui.notifications?.warn("Edha: Risen Servant needs a Harvested Remain."); return false; }
      const active = (game.actors ?? []).filter(a => a.getFlag?.("edha-content", "summon")
        && a.getFlag?.("edha-content", "summoner") === actor.id && String(a.name || "").startsWith("Risen Servant")).length;
      if (active >= edhaDeathTier(actor)) { ui.notifications?.warn(`Edha: ${actor.name} already sustains ${active} Risen Servant(s) (cap = tier).`); return false; }
      return;   // native flow proceeds: cost + the authored edha-summon rule; the Remain spends on use
    }
    if (item.name === "Necrotic Cascade" && edhaOwnsTalent(actor, "Necrotic Cascade")
        && actor.getFlag?.("edha-content", "cascadeArmed")) { ui.notifications?.warn("Edha: Necrotic Cascade is already armed this scene."); return false; }
    if (!EDHA_DEATH_TAKEOVER.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Consuming Decay": void edhaConsumingDecay(actor, item); break;
      case "Bone Garden":     void edhaBoneGarden(actor, item); break;
      case "Death Ward":      void edhaDeathWardCast(actor, item); break;
      case "Raise Dead":      void edhaRaiseDead(actor, item); break;
    }
    return false;   // cancel the system's default use() (no stray card/roll); costs paid via edhaConsumeCost
  } catch (e) { console.error("Edha Content | Death preUse-hook failed", e); }
});
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || !edhaOwnsTalent(actor, item.name)) return;
    if (item.name === "Withering Touch") void edhaWitherArm(actor);
    else if (item.name === "Necrotic Cascade") void edhaCascadeArm(actor);
    else if (item.name === "Risen Servant") void edhaSpendRemain(actor, "Risen Servant");
    else if (item.name === "Speak with the Fallen") void edhaSpeakWithFallen(actor, item);
  } catch (e) { console.error("Edha Content | Death useItem-hook failed", e); }
});

/* --- Scene cleanup (deleteCombat): the whole Death state resets ------------------------------------- */
async function edhaClearDeathState() {
  try {
    if (!game.user?.isGM) return;
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      for (const key of ["decay", "deathWard"]) if (a.getFlag?.("edha-content", key)) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      for (const s of ["decaying", "harvested"]) if (a.statuses?.has?.(s)) { try { await a.toggleStatusEffect?.(s, { active: false }); } catch (e) {} }
    }
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["remains", "cascadeArmed", "raiseDeadUsed", "witherNext"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
    }
  } catch (e) { console.error("Edha Content | clear Death state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearDeathState(); } catch (e) {} });

/* ============================================================================================
 * CIVILIZATION (Kethane, deity) tree engine (2026-07-02) — Foundations + the Combat Construct.
 * Colors Red/White; tag prefix "Civilization (Kethane)."; build `foundry-build deity` → pack `edha-deity`.
 * Die colors (Ben R0, 07-02: the split across the two branches is MIXED, so the ambiguous rider goes
 * Red): WHITE backs the body — Construct HP + Slam + Siege Cannon (as authored), Magnum Opus's bonus
 * HP, Lay Foundation's Attunement Range, Bonds of Community's THP (= edhaWhiteMod, the Accord helper);
 * RED backs the offense — Bastion's enter-damage + save DC, Magnum's splash + save DC, and Tempered
 * Edge's rider. Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 *   • Foundations    = the PRE-STANDARD 2026-06-12 Lay Foundation takeover (audited vs the card this
 *     pass — KEPT: gold 10 ft Drawings, tier sustain cap, begin-turn defense buff, refund-on-cancel).
 *     Its stale edha-aoe-template authored event (dead since the takeover) was REMOVED (Ben R2 — the
 *     Death R6/R7 "old wiring" precedent). Magnum upgrades the buff +1→+2 via `civFoundationBonus`.
 *   • Combat Construct = the PRE-STANDARD authored edha-summon spec (audited vs the card — KEPT
 *     byte-identical, Ben R8, incl. the baked Siege Form effect + Siege Cannon). The engine ADDS the
 *     gates the card demands: sustain ONE = using Forge Construct again REPLACES the live Construct
 *     (Ben R1 — dismantle relay `civ-dismantle`, then the native flow reforges).
 *   • dealer riders  → the applyDamage wrapper pre/post-pass (edhaDealerOf), the Green-Instinct
 *     injection shape; defeat signal → the SHARED live→0 HP stamp (Death's preUpdateActor hook) with
 *     a Civilization-only consumer; foe tests → edhaFoeSkillVsColor (the generalized Destruction
 *     Concussive-Yield helper — owner rolls the color DC, the ENGINE rolls each foe, never
 *     trust-the-player); cross-actor → set-flag / toggle-status / burst-apply / move-token relays.
 * Wired here (no longer GM-eyeballed):
 *   • Lay Foundation — the 06-12 takeover stays (see its own block further down). White range.
 *   • Forge Construct — authored edha-summon stays; preUseItem adds the R1 replace gate.
 *   • Tempered Edge (passive) — applyDamage PRE-pass on the Construct's melee Slam: +[T][D red]
 *     energy (edhaEvalSync vs the SUMMONER) + the hit is bumped by the target's deflect (the
 *     Pinpoint-Charge ignore-deflect fact). Siege Cannon (ranged) is deliberately excluded.
 *   • Siege Form — preUseItem TAKEOVER: gates (live Construct, not already sieged), pays 1 Inv via
 *     activation, toggles the BAKED "Siege Form" effect ON; the card's button ends it (Free, toggle
 *     OFF). The spec itself is untouched (Ben R8).
 *   • Arsenal — preUseItem GATE (live Construct or refused pre-cost; 2 Inv via activation); use arms
 *     `arsenalActive` on the Construct + an indicator AE ("2 attacks/turn" — cadence TRUSTED, the
 *     Risen Servant precedent). The kill-chase rides the applyDamage POST-pass: the Construct drops
 *     a character live→0 → whispered prompt ("move up to 15 ft + free Strike" — player-executed).
 *   • Bastion — preUseItem TAKEOVER: gates (≥1 Foundation), pays 2 Inv; each Foundation gains a
 *     fortified Region (`civ-fortify` relay): NATIVE modifyMovementCost walk×2 (Ben R3: the native
 *     behavior is disposition-BLIND — allies see the ×2 too; the GM compensates allied movement by
 *     hand; a disposition-filtered cost function is named backlog) + the NEW `edha-content.fortified`
 *     enter check (tokenEnter/tokenMoveIn, the Fate-Snare shape): an ENEMY entering takes the baked
 *     [T][D red] impact and rolls Agility vs your Red → Slowed until the start of its next turn
 *     (expiry stamped at the CURRENT turn coord — right whenever it entered on its own move; a
 *     forced-move entry off-turn clears early, card-noted). Foundations laid while Bastion holds
 *     come up fortified (Ben R4). The Construct standing in a fortified Foundation wears a +2
 *     all-defenses AE (updateToken sweep, the Walking-Ruin move-watcher shape).
 *   • Trade Routes — preUseItem TAKEOVER: gates (≥2 Foundations), pays 1 Inv, click one Foundation
 *     then the other; the pair is linked (`civ-link` relay stamps the drawings + "⇄"). The card's
 *     Teleport button moves the clicking ally's token to the paired square (edhaMoveTokenTo — owner
 *     writes directly, else the move-token relay; Ben R6). Once per turn TRUSTED (card-noted).
 *   • Bonds of Community (Reaction) — ANY non-summon creature (PCs/allies COUNT — Ben R5; Death's
 *     PC-skip was a Death-tree ruling) dropping live→0 inside one of your Foundations → whispered
 *     Reaction prompt; Apply grants every standing ally in any of your Foundations Temp HP = your
 *     White mod (edhaGrantTempHpCross, keeps-higher) + advantage on its next attack test
 *     (edhaGrantAdvAttack, the Green primitive). Reaction economy (one/round) TRUSTED.
 *   • Magnum Opus (capstone) — preUseItem TAKEOVER: gates (live Construct, once/scene `magnumUsed`),
 *     pays 3 Inv. The Construct becomes a Colossus: +2×[T][D white] HP (value + max override), +2
 *     all-defenses AE, `colossus` flag; its hits SPLASH the talent's [T][D red] energy to each enemy
 *     within 10 ft of the target — the target INCLUDED (Ben R7a) — each rolling Agility vs your Red
 *     → Prone (applyDamage POST-pass + edhaFoeSkillVsColor). Allies in Foundations get the buff
 *     upgrade +1→+2 for the scene (Ben R7b, `civFoundationBonus`). Reach 10 ft is card-noted (no
 *     system reach field — see backlog).
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • A real reach field for the Colossus — no cosmere system support; card-noted manual until then.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • GM summon relay — Forge Construct now materializes via `summon-actor` for players without
 *     actor-create permission (spec baked owner-side; SHARED, wired in edhaSummon).
 *   • Disposition-filtered movement cost — the enemy-cost EXPERIMENT (a ModifyMovementCost subclass
 *     that returns no effect for the owner's side). No-ship-on-failure terms: registration failure
 *     or a wrong resolver name both degrade to Ben R3's shipped-blind behavior. ⚑ bench go/no-go:
 *     ruler ×2 for an enemy, ×1 for an ally, inside a fortified Foundation.
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Arsenal's extra-attack + free-Strike cadence and Bonds' one-Reaction-per-round (action economy
 *     isn't tracked — trusted, card-noted); Trade Routes' once-per-turn teleport cadence (trusted);
 *     Bastion's difficult terrain for ALLIED NPC movement (GM compensates — Ben R3).
 *   • CONTEST-EXEMPT: none — both tests (Bastion, Magnum Opus) are foe-skill-vs-your-Red, ENGINE-
 *     rolled per foe via edhaFoeSkillVsColor; Trade Routes' teleport is willing movement (no test).
 * ============================================================================================ */

const EDHA_CIV_RED_DIE = "(@tier)d(2 * @skills.red.rank + 2)";
const EDHA_CIV_WHITE_DIE = "(@tier)d(2 * @skills.white.rank + 2)";
function edhaCivTalent(owner, name) { return owner?.items?.find(i => edhaIsTalent(i) && i.name === name) ?? null; }
function edhaCivIsConstruct(a) { return !!a?.getFlag?.("edha-content", "summon") && String(a?.name || "").startsWith("Combat Construct"); }
function edhaCivSummonerOf(summon) { const id = summon?.getFlag?.("edha-content", "summoner"); return id ? (game.actors?.get(id) ?? null) : null; }
function edhaCivConstructOf(owner) {
  return (game.actors ?? []).find(a => edhaCivIsConstruct(a)
    && a.getFlag?.("edha-content", "summoner") === owner?.id
    && (Number(a.system?.resources?.hea?.value) || 0) > 0) ?? null;
}
// Point-in-Foundation (the Drawing square) — the containment math of edhaFoundationAtPoint without the
// disposition filter (Bonds/Trade Routes check ownership + disposition themselves).
function edhaCivPointInFoundation(d, x, y) {
  const w = d.shape?.width ?? 0, h = d.shape?.height ?? 0;
  return x >= d.x && x <= d.x + w && y >= d.y && y <= d.y + h;
}
function edhaCivCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}

/* --- Tempered Edge — applyDamage PRE-pass rider on the Construct's melee Slam ----------------------- */
function edhaCivTemperedEdge(dealer, target, list) {
  try {
    if (_edhaInTrigger) return;
    const c = dealer?.actor; if (!edhaCivIsConstruct(c)) return;
    if ((dealer.item?.name || "") !== "Construct Slam") return;        // melee attacks only — Siege Cannon (ranged) excluded
    const owner = edhaCivSummonerOf(c); if (!owner || !edhaOwnsTalent(owner, "Tempered Edge")) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;
    const amt = Math.max(0, Math.floor(edhaEvalSync(EDHA_CIV_RED_DIE, owner.getRollData())));
    if (amt > 0) list.push({ amount: amt, type: "energy" });
    const defl = Number(target?.system?.deflect?.value) || 0;          // ignore deflect = bump the hit (the Pinpoint-Charge fact)
    if (defl > 0) list.push({ amount: defl, type: "impact" });
    if (amt > 0 || defl > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: c }),
      content: `<p>⚒️ <strong>Tempered Edge</strong> (${owner.name}): +<strong>${amt}</strong> energy${defl > 0 ? ` and the Slam ignores ${target.name}'s deflect (+${defl})` : ""}.</p>` });
  } catch (e) { console.error("Edha Content | Tempered Edge rider failed", e); }
}

/* --- Magnum Opus splash + Arsenal kill-chase — applyDamage POST-pass on the Construct's hits -------- */
let _edhaCivSplashBusy = false;
async function edhaCivConstructHitRiders(dealer, target, prevHp) {
  try {
    if (_edhaInTrigger) return;
    const c = dealer?.actor; if (!edhaCivIsConstruct(c)) return;
    const owner = edhaCivSummonerOf(c); if (!owner) return;
    // Magnum Opus — Colossus splash: [T][D red] energy to each enemy within 10 ft of the target (target included, Ben R7a).
    if (c.getFlag?.("edha-content", "colossus") && edhaOwnsTalent(owner, "Magnum Opus") && !_edhaCivSplashBusy) {
      const vtok = edhaCasterToken(target) ?? target.getActiveTokens?.()[0];
      if (vtok) {
        const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, 10)
          .filter(t => t.actor && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
        if (foes.length) {
          const formula = edhaCivTalent(owner, "Magnum Opus")?.system?.damage?.formula || EDHA_CIV_RED_DIE;
          const dr = await new Roll(Roll.replaceFormulaData(formula, owner.getRollData(), { missing: "0" })).evaluate();
          const amt = Math.max(0, Math.floor(dr.total));
          if (amt > 0) {
            _edhaCivSplashBusy = true;
            try {
              const payload = { casterActorUuid: owner.uuid, hits: foes.map(t => ({ actorUuid: t.actor.uuid, amount: amt, type: "energy", heal: false })) };
              if (game.user?.isGM) await edhaApplyBurstResults(payload);
              else game.socket.emit("module.edha-content", { action: "burst-apply", payload });
            } finally { _edhaCivSplashBusy = false; }
            edhaCivCard(owner, [dr], `<p>🗿 <strong>Magnum Opus</strong>: the Colossus's blow shakes the ground — <strong>${amt}</strong> energy to ${foes.map(t => t.name).join(", ")} (within 10 ft of ${target.name}).</p>`);
            await edhaFoeSkillVsColor(owner, foes, { skill: "agi", label: "Agility", color: "red", sourceName: "Magnum Opus",
              failText: "Prone", okText: "stays up", icon: "🗿", onFail: (t) => edhaToggleStatus(t.actor, "prone", true) });
          }
        }
      }
    }
    // Arsenal — the Construct reduces a character live→0: whispered chase prompt (move 15 ft + free Strike, player-executed).
    if (c.getFlag?.("edha-content", "arsenalActive")
        && (Number(prevHp) || 0) > 0 && (Number(target?.system?.resources?.hea?.value) || 0) <= 0) {
      edhaCivCard(owner, null, `<p>⚙️ <strong>Arsenal</strong>: the Construct reduces ${target.name} to 0 HP — you may immediately command it to <strong>move up to 15 ft</strong> and make a <strong>free Strike</strong> against a character within reach (move the token + use Construct Slam; the strike costs nothing — trusted).</p>`, { whisper: true });
    }
  } catch (e) { console.error("Edha Content | Civilization construct riders failed", e); }
}

/* --- Bastion — fortified Foundations: Region per square, enter-damage + save, Construct +2 ---------- */
async function edhaCivBastion(owner, item) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene for Bastion."); return; }
    const founds = edhaFoundationsOn(scene, owner.id);
    if (!founds.length) { ui.notifications?.warn("Edha: Bastion needs at least one active Foundation. Nothing spent."); return; }
    if (!game.user?.isGM && !game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to fortify Foundations."); return; }
    if (!edhaConsumeCost(item)) return;
    await owner.setFlag("edha-content", "bastionActive", true);   // Ben R4: Foundations laid later fortify on placement
    const payload = {
      sceneId: scene.id, ownerUuid: owner.uuid, drawingIds: founds.map(d => d.id),
      baked: Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_CIV_RED_DIE, owner.getRollData(), { missing: "0" }),
      type: item.system?.damage?.type || "impact",
      disposition: edhaCasterToken(owner)?.document?.disposition ?? 1,
    };
    if (game.user?.isGM) await edhaCivFortifyGM(payload);
    else game.socket.emit("module.edha-content", { action: "civ-fortify", payload });
    edhaCivCard(owner, null, `<p>⛨ <strong>Bastion</strong>: ${owner.name}'s Foundations grow teeth — for the scene they are <strong>fortified</strong>: enemies treat them as difficult terrain (ruler shows ×2 for everyone — GM compensates allied movement, Ben R3), an enemy ENTERING takes <strong>${payload.baked}</strong> ${payload.type} and rolls Agility vs your Red or is <strong>Slowed</strong> until the start of its next turn, and your Combat Construct standing inside gains <strong>+2 to all defenses</strong>.</p>`);
  } catch (e) { console.error("Edha Content | Bastion failed", e); }
}
// GM-side: one fortified Region per Foundation drawing (idempotent per drawing).
async function edhaCivFortifyGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    const oref = await fromUuid(p.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    for (const id of (p.drawingIds || [])) {
      const d = scene.drawings.get(id);
      if (!d?.getFlag?.("edha-content", "foundation")) continue;
      if ((scene.regions ?? []).some(r => r.getFlag?.("edha-content", "fortified")?.drawingId === id)) continue;
      await scene.createEmbeddedDocuments("Region", [{
        name: `${owner.name} — Fortified Foundation`, color: EDHA_COLOR_HEX.red,
        shapes: [{ type: "rectangle", x: d.x, y: d.y, width: d.shape?.width ?? 0, height: d.shape?.height ?? 0, rotation: 0, hole: false }],
        behaviors: [
          // The enemy-cost EXPERIMENT when it registered (allies pass free); else Ben R3's native
          // disposition-blind cost — allies see ×2 too and the GM compensates by hand.
          _edhaEnemyCostRegistered
            ? { type: "edha-content.enemy-cost", name: "Difficult Terrain (enemies only)", system: { difficulties: { walk: 2 }, ownerDisposition: Number(p.disposition ?? 1) } }
            : { type: "modifyMovementCost", name: "Difficult Terrain (enemies — Ben R3)", system: { difficulties: { walk: 2 } } },
          { type: "edha-content.fortified", name: "Fortified (enter)", system: { ownerUuid: p.ownerUuid, disposition: Number(p.disposition ?? 1), damageFormula: p.baked, damageType: p.type || "impact" } },
        ],
        flags: { "edha-content": { scope: "scene", fortified: { ownerUuid: p.ownerUuid, drawingId: id, disposition: Number(p.disposition ?? 1) } } },
      }]);
      try { await d.update({ text: "⛨ Foundation (fortified)", strokeColor: EDHA_COLOR_HEX.red }); } catch (e) {}
    }
    await edhaCivBastionSweep(scene);
  } catch (e) { console.error("Edha Content | fortify failed", e); }
}
// The Construct standing in a fortified Foundation of its summoner wears +2 to all defenses.
async function edhaCivBastionSweep(scene) {
  try {
    scene = scene ?? canvas?.scene; if (!scene) return;
    for (const tokDoc of (scene.tokens ?? [])) {
      const a = tokDoc.actor; if (!a || !edhaCivIsConstruct(a)) continue;
      const owner = edhaCivSummonerOf(a); if (!owner) continue;
      const gs = scene.grid?.size || 100;
      const cx = tokDoc.x + (tokDoc.width ?? 1) * gs / 2, cy = tokDoc.y + (tokDoc.height ?? 1) * gs / 2;
      const inside = (scene.regions ?? []).some(r =>
        r.getFlag?.("edha-content", "fortified")?.ownerUuid === owner.uuid && edhaPointInRegion(r, cx, cy));
      const existing = a.effects?.filter(e => e.getFlag?.("edha-content", "civBastionBuff")) ?? [];
      if (inside && !existing.length) {
        await a.createEmbeddedDocuments("ActiveEffect", [{
          name: "Bastion (+2 defenses)", img: "icons/magic/defensive/shield-barrier-blue.webp",
          changes: ["phy", "cog", "spi"].map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "2", priority: 20 })),
          description: "<p>Standing in a fortified Foundation: +2 to all defenses (auto-applied while inside).</p>",
          flags: { "edha-content": { civBastionBuff: true } },
        }]);
      } else if (!inside && existing.length) {
        await a.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
      }
    }
  } catch (e) { console.error("Edha Content | Bastion sweep failed", e); }
}
Hooks.on("updateToken", (tokenDoc, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (changed?.x === undefined && changed?.y === undefined) return;
    if (!edhaCivIsConstruct(tokenDoc?.actor)) return;
    void edhaCivBastionSweep(tokenDoc.parent);
  } catch (e) { console.error("Edha Content | Bastion move-watch failed", e); }
});
// The enter check (the Fate-Snare shape): an ENEMY of the Foundation's owner entering (or passing
// through) takes the baked [T][D red] impact and rolls Agility vs the owner's Red → Slowed until the
// start of its next turn. tokenEnter + tokenMoveIn can double-fire on one entry → 1 s debounce.
const _edhaCivEnterGuard = new Map();
class EdhaCivFortifiedRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      events: this._createEventsField({ events: ["tokenEnter", "tokenMoveIn"], initial: ["tokenEnter", "tokenMoveIn"] }),
      ownerUuid: new FF.StringField({ required: true, initial: "", label: "Foundation owner UUID" }),
      disposition: new FF.NumberField({ required: true, initial: 1, label: "Owner disposition (allies pass free)" }),
      damageFormula: new FF.StringField({ required: true, initial: "1d6", label: "Baked enter damage" }),
      damageType: new FF.StringField({ required: true, initial: "impact", label: "Damage type" }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (game.users?.activeGM && !game.users.activeGM.isSelf) return;   // one applier (the primary GM)
      const tokDoc = event?.data?.token; const actor = tokDoc?.actor; if (!actor) return;
      if ((actor.system?.resources?.hea?.value ?? 1) <= 0) return;
      if ((tokDoc.disposition ?? 1) === this.disposition) return;        // allies of the owner pass free
      const key = `${this.parent?.id ?? "r"}:${tokDoc.id}`;
      const now = Date.now();
      if (now - (_edhaCivEnterGuard.get(key) || 0) < 1000) return;       // tokenEnter + tokenMoveIn double-fire
      _edhaCivEnterGuard.set(key, now);
      const oref = await fromUuid(this.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
      const dr = await new Roll(this.damageFormula || "0").evaluate();
      const amt = Math.max(0, Math.floor(dr.total));
      if (amt > 0) {
        _edhaInTrigger = true;
        try { await actor.applyDamage([{ amount: amt, type: this.damageType || "impact" }], { chatMessage: false }); }
        finally { _edhaInTrigger = false; }
      }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls: [dr],
        content: `<p>⛨ <strong>${actor.name}</strong> enters ${owner.name}'s fortified Foundation — takes <strong>${amt}</strong> ${this.damageType || "impact"}.</p>` });
      const tok = tokDoc.object;
      if (tok) await edhaFoeSkillVsColor(owner, [tok], { skill: "agi", label: "Agility", color: "red", sourceName: "Bastion",
        failText: "Slowed", okText: "keeps pace", icon: "⛨",
        onFail: async (t) => {
          await edhaToggleStatus(t.actor, "slowed", true);
          // "until the start of its next turn": stamp the CURRENT coord — the expiry pass clears it when
          // the pointer advances past this turn (right whenever it entered on its own move; a forced-move
          // entry off-turn clears early — card-noted).
          const combat = game.combat;
          if (combat?.started) {
            const eff = [...(t.actor.effects ?? [])].find(e => e.statuses?.has?.("slowed"));
            if (eff) { try { await eff.setFlag("edha-content", "expireAfter", { round: combat.round, turn: combat.turn }); } catch (e) {} }
          }
        } });
    } catch (e) { console.error("Edha Content | fortified enter check failed", e); }
  }
}

/* --- EXPERIMENT (backlog 9b — Ben-approved timebox, 2026-07-04): disposition-filtered movement cost.
 * Goal: Bastion's fortified Foundations read ×2 walk cost for ENEMIES only (Ben R3 shipped the
 * native modifyMovementCost blind — the GM compensates allied movement by hand). Approach: subclass
 * the NATIVE type and return no terrain effect for tokens on the owner's side. The v13 terrain
 * pipeline could NOT be verified from this session (no Foundry), so the experiment ships
 * belt-and-braces on the no-ship-on-failure terms:
 *   • registration is try/caught and edhaCivFortifyGM uses the custom type ONLY if it registered —
 *     any throw leaves the shipped-blind R3 behavior byte-identical;
 *   • the subclass overrides BOTH plausible effect-resolver names; if neither is the real one, the
 *     inherited native behavior applies to everyone — i.e. exactly today's R3 state, never worse.
 * ⚑ bench (the go/no-go): ruler over a fortified Foundation shows ×2 for an enemy token and ×1 for
 * an allied token. If allies still read ×2, DELETE this block + the enemy-cost branch in
 * edhaCivFortifyGM and the R3 fallback stands (it never left). ------------------------------------ */
let _edhaEnemyCostRegistered = false;
function edhaBuildEnemyCostBehavior() {
  const Base = foundry.data?.regionBehaviors?.ModifyMovementCostRegionBehaviorType;
  if (!Base) return null;
  class EdhaEnemyCostRegionBehavior extends Base {
    static defineSchema() {
      const FF = foundry.data.fields;
      return { ...super.defineSchema(), ownerDisposition: new FF.NumberField({ required: false, initial: 1, label: "Owner disposition (that side passes free)" }) };
    }
    _edhaAllied(token) {
      try { const doc = token?.document ?? token; return (doc?.disposition ?? null) === (Number(this.ownerDisposition) ?? 1); }
      catch (e) { return false; }
    }
    // v13 terrain pipeline — the resolver name is bench-unverified, so cover both candidates; each
    // passes enemies through to the native cost and returns "no effect" for the owner's side.
    _getTerrainEffects(token, ...args) {
      if (this._edhaAllied(token)) return [];
      return super._getTerrainEffects?.(token, ...args) ?? [];
    }
    getTerrainEffects(token, ...args) {
      if (this._edhaAllied(token)) return [];
      return super.getTerrainEffects?.(token, ...args) ?? [];
    }
  }
  return EdhaEnemyCostRegionBehavior;
}

/* --- Trade Routes — link two Foundations; the card's Teleport button carries allies ----------------- */
async function edhaCivTradeRoutes(owner, item) {
  try {
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene for Trade Routes."); return; }
    const founds = edhaFoundationsOn(scene, owner.id);
    if (founds.length < 2) { ui.notifications?.warn("Edha: Trade Routes needs two active Foundations. Nothing spent."); return; }
    if (!game.user?.isGM && !game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to link Foundations."); return; }
    if (!edhaConsumeCost(item)) return;
    const pick = async (label) => {
      const pt = await edhaPickPoint(`Click inside the ${label} Foundation to link (right-click to cancel).`);
      if (!pt) return null;
      return edhaFoundationsOn(scene, owner.id).find(d => edhaCivPointInFoundation(d, pt.x, pt.y)) ?? false;
    };
    const a = await pick("FIRST");
    if (a === null) { edhaRefundCost(item); ui.notifications?.info("Trade Routes cancelled — Investiture refunded."); return; }
    if (a === false) { edhaRefundCost(item); ui.notifications?.warn("Edha: that point is not inside one of your Foundations. Refunded."); return; }
    const b = await pick("SECOND");
    if (b === null) { edhaRefundCost(item); ui.notifications?.info("Trade Routes cancelled — Investiture refunded."); return; }
    if (b === false || b.id === a.id) { edhaRefundCost(item); ui.notifications?.warn("Edha: pick a DIFFERENT Foundation of yours for the second end. Refunded."); return; }
    const linkId = foundry.utils.randomID();
    const payload = { sceneId: scene.id, drawingIds: [a.id, b.id], linkId };
    if (game.user?.isGM) await edhaCivLinkGM(payload);
    else game.socket.emit("module.edha-content", { action: "civ-link", payload });
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-burst-card"><p>🛤️ <strong>Trade Routes</strong>: two of ${owner.name}'s Foundations are <strong>linked</strong> for the scene — an ally standing in either may teleport to the other as a Free Action, <strong>once per turn</strong> (trusted).</p>`
        + `<button type="button" class="edha-civ-btn" data-edha-action="teleport" data-edha-link="${linkId}" data-edha-scene="${scene.id}">Teleport (stand in a linked Foundation, then click)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Trade Routes failed", e); }
}
async function edhaCivLinkGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    for (const id of (p.drawingIds || [])) {
      const d = scene.drawings.get(id); if (!d?.getFlag?.("edha-content", "foundation")) continue;
      const text = String(d.text || "Foundation");
      await d.update({ "flags.edha-content.foundation.link": p.linkId, text: text.includes("⇄") ? text : `${text} ⇄` });
    }
  } catch (e) { console.error("Edha Content | foundation link failed", e); }
}
async function edhaCivTeleportClick(ev) {
  try {
    const btn = ev.currentTarget;
    const linkId = btn.dataset.edhaLink, sceneId = btn.dataset.edhaScene;
    if (canvas?.scene?.id !== sceneId) { ui.notifications?.warn("Edha: view the linked Foundations' scene first."); return; }
    const scene = canvas.scene;
    const pair = (scene.drawings ?? []).filter(d => d.getFlag?.("edha-content", "foundation")?.link === linkId);
    if (pair.length !== 2) { ui.notifications?.warn("Edha: that trade route no longer stands (a Foundation crumbled)."); return; }
    const tok = canvas.tokens?.controlled?.[0] ?? (game.user?.character ? edhaCasterToken(game.user.character) : null);
    if (!tok?.actor) { ui.notifications?.warn("Edha: select your token first."); return; }
    if ((tok.actor.system?.resources?.hea?.value ?? 1) <= 0) { ui.notifications?.warn("Edha: the fallen don't walk the roads."); return; }
    const from = pair.find(d => edhaCivPointInFoundation(d, tok.center.x, tok.center.y));
    if (!from) { ui.notifications?.warn("Edha: stand inside one of the linked Foundations first."); return; }
    const disp = from.getFlag("edha-content", "foundation")?.disposition;
    if (disp !== undefined && (tok.document?.disposition ?? 1) !== disp) { ui.notifications?.warn("Edha: the linked roads carry allies only."); return; }
    const dest = pair.find(d => d.id !== from.id);
    // Ben (pass 3, 07-12): a teleport, not a walk — the traveler CLICKS their arrival point inside the
    // destination Foundation, the token is displaced there (no pathing, no wall snag, no stacking).
    const center = { x: dest.x + (dest.shape?.width ?? 0) / 2, y: dest.y + (dest.shape?.height ?? 0) / 2 };
    let arrive = await edhaPickPoint("Click your arrival point inside the linked Foundation (right-click for its center).");
    if (arrive && !edhaCivPointInFoundation(dest, arrive.x, arrive.y)) { ui.notifications?.warn("Edha: that point is outside the linked Foundation — arriving at its center instead."); arrive = null; }
    arrive ??= center;
    if (edhaTokenAtDest(tok, arrive)) { ui.notifications?.warn("Edha: that square is occupied — pick a clear square."); return; }
    await edhaMoveTokenTo(tok, arrive, { teleport: true });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: tok.actor }),
      content: `<p>🛤️ <strong>${tok.actor.name}</strong> steps through the trade route to the linked Foundation (Free Action — once per turn, trusted).</p>` });
  } catch (e) { console.error("Edha Content | trade-route teleport failed", e); }
}

/* --- Bonds of Community — Reaction prompt off the SHARED live→0 HP stamp (Death's preUpdateActor) --- */
Hooks.on("updateActor", async (victim, changes, options) => {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one applier
    const h = options?.edhaHea;
    if (!h || h.new > 0 || h.old <= 0) return;                     // only a live→0 crossing counts
    if (victim.getFlag?.("edha-content", "summon")) return;        // summons dissolve — the city doesn't mourn them
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0]; if (!vtok) return;
    const scene = vtok.document?.parent ?? canvas?.scene;
    for (const owner of edhaCharacterOwnersOf("Bonds of Community")) {
      const founds = edhaFoundationsOn(scene, owner.id);
      if (!founds.some(d => edhaCivPointInFoundation(d, vtok.center.x, vtok.center.y))) continue;
      // PCs/allies COUNT (Ben R5) — any non-summon creature dropping inside your Foundation qualifies.
      ChatMessage.create({
        whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🏛️ <strong>Bonds of Community</strong> — ${victim.name} drops to 0 HP inside your Foundation. <strong>Reaction</strong> (one per round — trusted): each standing ally in any of your Foundations gains <strong>Temp HP = your White mod</strong> and <strong>advantage on its next attack test</strong>.</p>`
          + `<button type="button" class="edha-civ-btn" data-edha-action="bonds" data-edha-owner="${owner.uuid}">Use Reaction — the city strikes together</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | Bonds of Community watcher failed", e); }
});
async function edhaCivBondsClick(ev) {
  try {
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    if (!owner) return;
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) rallies the city."); return; }
    const scene = canvas?.scene; const founds = edhaFoundationsOn(scene, owner.id);
    if (!founds.length) { ui.notifications?.warn("Edha: no Foundations stand."); return; }
    const disp = edhaCasterToken(owner)?.document?.disposition ?? 1;
    const thp = Math.max(0, edhaWhiteMod(owner));
    const allies = (canvas?.tokens?.placeables ?? []).filter(t => t.actor
      && (t.document?.disposition ?? 1) === disp
      && (t.actor.system?.resources?.hea?.value ?? 0) > 0
      && founds.some(d => edhaCivPointInFoundation(d, t.center.x, t.center.y)));
    if (!allies.length) { ui.notifications?.info("Edha: no standing allies in your Foundations."); return; }
    for (const t of allies) {
      if (thp > 0) await edhaGrantTempHpCross(t.actor, thp, "Bonds of Community");
      await edhaGrantAdvAttack(t.actor, "Bonds of Community");
    }
    btn.disabled = true; btn.textContent = "The city answered.";
    edhaCivCard(owner, null, `<p>🏛️ <strong>Bonds of Community</strong>: ${allies.map(t => t.name).join(", ")} gain${allies.length === 1 ? "s" : ""} <strong>${thp}</strong> Temp HP and <strong>advantage on their next attack test</strong>.</p>`);
  } catch (e) { console.error("Edha Content | Bonds of Community apply failed", e); }
}

/* --- Siege Form — the talent drives the BAKED toggle (spec untouched — Ben R8) ---------------------- */
async function edhaCivSiegeForm(owner, item) {
  try {
    const c = edhaCivConstructOf(owner);
    if (!c) { ui.notifications?.warn("Edha: Siege Form needs a live Combat Construct. Nothing spent."); return; }
    const eff = c.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === "Siege Form");
    if (!eff) { ui.notifications?.warn("Edha: this Construct carries no baked Siege Form effect — reforge it (older summon). Nothing spent."); return; }
    if (!eff.disabled) { ui.notifications?.warn("Edha: the Construct is already in Siege Form. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    await eff.update({ disabled: false });
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-burst-card"><p>🏰 <strong>Siege Form</strong>: the Construct kneels — <strong>Speed 0, deflect 3</strong> for the scene; use the baked <strong>Siege Cannon</strong> (60 ft, energy) instead of Construct Slam.</p>`
        + `<button type="button" class="edha-civ-btn" data-edha-action="siege-end" data-edha-construct="${c.uuid}">End Siege Form (Free Action)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Siege Form failed", e); }
}
async function edhaCivSiegeEndClick(ev) {
  try {
    const btn = ev.currentTarget;
    const cref = await fromUuid(btn.dataset.edhaConstruct).catch(() => null); const c = cref?.actor ?? cref;
    if (!c) { ui.notifications?.warn("Edha: that Construct is gone."); return; }
    if (!c.isOwner) { ui.notifications?.warn("Edha: only the Construct's owner (or the GM) ends Siege Form."); return; }
    const eff = c.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === "Siege Form");
    if (!eff || eff.disabled) { ui.notifications?.info("Edha: Siege Form is not active."); return; }
    await eff.update({ disabled: true });
    btn.disabled = true;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: c }), content: `<p>🏰 <strong>${c.name}</strong> rises from Siege Form (Free Action) — Speed and deflect return to normal.</p>` });
  } catch (e) { console.error("Edha Content | Siege Form end failed", e); }
}

/* --- Magnum Opus — the Construct becomes a Colossus (once per scene) -------------------------------- */
async function edhaCivMagnumOpus(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "magnumUsed")) { ui.notifications?.warn("Edha: Magnum Opus was already used this scene. Nothing spent."); return; }
    const c = edhaCivConstructOf(owner);
    if (!c) { ui.notifications?.warn("Edha: Magnum Opus needs a live Combat Construct. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    await owner.setFlag("edha-content", "magnumUsed", true);
    await owner.setFlag("edha-content", "civFoundationBonus", 2);   // Ben R7b: the Foundation begin-turn buff upgrades +1→+2 for the scene
    const baked = Roll.replaceFormulaData(EDHA_CIV_WHITE_DIE, owner.getRollData(), { missing: "0" });
    const dr = await new Roll(baked).evaluate();
    const bonusHp = 2 * Math.max(0, Math.floor(dr.total));         // "[Tier][Die] x 2 additional HP" — one roll, doubled
    const hea = c.system?.resources?.hea;
    const curMax = Number(hea?.max?.value ?? hea?.max?.override) || 0;
    await c.update({
      "system.resources.hea.max.override": curMax + bonusHp, "system.resources.hea.max.useOverride": true,
      "system.resources.hea.value": (Number(hea?.value) || 0) + bonusHp,
    });
    await c.setFlag("edha-content", "colossus", true);
    await c.createEmbeddedDocuments("ActiveEffect", [{
      name: "Colossus (Magnum Opus)", img: "icons/creatures/magical/construct-golem-stone-blue.webp",
      changes: ["phy", "cog", "spi"].map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "2", priority: 20 })),
      description: "<p>Colossus for the scene: +2 to all defenses; <strong>reach 10 ft</strong> (manual — no system reach field); its attacks splash [Tier][Die red] energy to each enemy within 10 ft of the target, who roll Agility vs the summoner's Red or fall Prone (engine-rolled).</p>",
      flags: { "edha-content": { civColossus: true } },
    }]);
    edhaCivCard(owner, [dr], `<p>🗿 <strong>Magnum Opus</strong>: the Construct transforms into a <strong>Colossus</strong> — +<strong>${bonusHp}</strong> HP, +2 to all defenses, reach 10 ft (manual), splashing attacks (engine-rolled). Allies in your Foundations now gain <strong>+2</strong> to all defenses at their turn start (upgraded for the scene). <span style="opacity:.8">(Once per scene.)</span></p>`);
  } catch (e) { console.error("Edha Content | Magnum Opus failed", e); }
}

/* --- Arsenal — arm the Construct (extra attack indicator + the kill-chase watcher above) ------------ */
async function edhaCivArsenalArm(owner) {
  try {
    const c = edhaCivConstructOf(owner); if (!c) return;
    await c.setFlag("edha-content", "arsenalActive", true);
    if (!c.effects?.some(e => e.getFlag?.("edha-content", "civArsenal"))) {
      await c.createEmbeddedDocuments("ActiveEffect", [{
        name: "Arsenal (2 attacks/turn)", img: "icons/tools/smithing/anvil.webp",
        changes: [],
        description: "<p>For the scene: one ADDITIONAL attack per turn (action economy trusted). When the Construct reduces a character to 0 HP, its summoner is prompted: move up to 15 ft + a free Strike.</p>",
        flags: { "edha-content": { civArsenal: true } },
      }]);
    }
    edhaCivCard(owner, null, `<p>⚙️ <strong>Arsenal</strong>: the Construct gains an <strong>additional attack per turn</strong> for the scene (trusted — use Construct Slam twice), and kills prompt the <strong>15 ft move + free Strike</strong> chase.</p>`);
  } catch (e) { console.error("Edha Content | Arsenal arm failed", e); }
}

/* --- Forge Construct replace (Ben R1) — the GM dismantles the old one, the native flow reforges ----- */
async function edhaCivDismantleGM(actorId) {
  try {
    const a = game.actors?.get(actorId); if (!a?.getFlag?.("edha-content", "summon")) return;
    let hadToken = false;
    for (const sc of (game.scenes ?? [])) {
      const toks = sc.tokens.filter(t => t.actorId === actorId);
      if (toks.length) { hadToken = true; await sc.deleteEmbeddedDocuments("Token", toks.map(t => t.id)); }   // last-token cleanup deletes the actor
    }
    if (!hadToken) { try { await a.delete(); } catch (e) {} }
  } catch (e) { console.error("Edha Content | dismantle failed", e); }
}

/* --- Civilization dispatch: takeovers + pre-cost gates + post-use riders ---------------------------- */
const EDHA_CIV_TAKEOVER = new Set(["Bastion", "Trade Routes", "Siege Form", "Magnum Opus"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.name === "Forge Construct" && edhaOwnsTalent(actor, "Forge Construct")) {   // R1 replace gate, NOT a takeover
      const cur = edhaCivConstructOf(actor);
      if (cur) {
        if (game.user?.isGM) void edhaCivDismantleGM(cur.id);
        else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "civ-dismantle", payload: { actorId: cur.id } });
        else { ui.notifications?.warn("Edha: a GM must be online to dismantle the old Construct. Nothing spent."); return false; }
        ui.notifications?.info(`Edha: ${actor.name}'s old Combat Construct is dismantled — reforging (sustain ONE, Ben R1).`);
      }
      return;   // native flow proceeds: cost + the authored edha-summon rule
    }
    if (item.name === "Arsenal" && edhaOwnsTalent(actor, "Arsenal")) {                   // gate, NOT a takeover
      const c = edhaCivConstructOf(actor);
      if (!c) { ui.notifications?.warn("Edha: Arsenal needs a live Combat Construct. Nothing spent."); return false; }
      if (c.getFlag?.("edha-content", "arsenalActive")) { ui.notifications?.warn("Edha: Arsenal is already active this scene. Nothing spent."); return false; }
      return;   // native flow pays the 2 Inv; the useItem hook arms it
    }
    if (!EDHA_CIV_TAKEOVER.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Bastion":     void edhaCivBastion(actor, item); break;
      case "Trade Routes": void edhaCivTradeRoutes(actor, item); break;
      case "Siege Form":  void edhaCivSiegeForm(actor, item); break;
      case "Magnum Opus": void edhaCivMagnumOpus(actor, item); break;
    }
    return false;   // cancel the system's default use() (no stray card/roll); costs paid via edhaConsumeCost
  } catch (e) { console.error("Edha Content | Civilization preUse-hook failed", e); }
});
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || !edhaOwnsTalent(actor, item.name)) return;
    if (item.name === "Arsenal") void edhaCivArsenalArm(actor);
  } catch (e) { console.error("Edha Content | Civilization useItem-hook failed", e); }
});

/* --- Chat buttons + player→GM relays ----------------------------------------------------------------- */
function edhaBindCivButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  root.querySelectorAll?.(".edha-civ-btn").forEach(b => {
    const act = b.dataset.edhaAction;
    if (act === "bonds") b.addEventListener("click", edhaCivBondsClick);
    else if (act === "teleport") b.addEventListener("click", edhaCivTeleportClick);
    else if (act === "siege-end") b.addEventListener("click", edhaCivSiegeEndClick);
  });
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindCivButtons(html));
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;
        if (data?.action === "civ-fortify") { await edhaCivFortifyGM(data.payload || {}); return; }
        if (data?.action === "civ-link") { await edhaCivLinkGM(data.payload || {}); return; }
        if (data?.action === "civ-dismantle") { await edhaCivDismantleGM(data.payload?.actorId); return; }
      } catch (e) { console.error("Edha Content | Civilization relay failed", e); }
    });
  } catch (e) {}
});

/* --- Scene cleanup (deleteCombat): the Civilization scene state resets ------------------------------- */
async function edhaClearCivState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["bastionActive", "magnumUsed", "civFoundationBonus"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
    }
    for (const a of (game.actors ?? []).filter(x => edhaCivIsConstruct(x))) {
      for (const key of ["arsenalActive", "colossus"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
      const fx = a.effects?.filter(e => e.getFlag?.("edha-content", "civBastionBuff") || e.getFlag?.("edha-content", "civArsenal") || e.getFlag?.("edha-content", "civColossus")) ?? [];
      if (fx.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", fx.map(e => e.id)); } catch (e) {} }
    }
    // Fortified Regions + Foundation links ride the Drawings and follow the terrain convention
    // (persist until the GM clears the map) — deleting a Foundation drawing takes its Region along.
  } catch (e) { console.error("Edha Content | clear Civilization state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearCivState(); } catch (e) {} });

/* ============================================================================================
 * POWER (Tyrith, deity) tree engine (2026-07-02c) — dominate (Black control) → kill → escalate (Red).
 * Colors Black/Red; tag prefix "Power (Tyrith)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-02c): BLACK = the control tests + their ranges (Kneel, Absolute
 * Authority), Crown of Thorns, Investiture of Command's [Die] + ally range, Mantle's ally aura +
 * redirect range; RED = the kinetic dice — Warlord's Advance rider + Unstoppable Advance (both
 * authored formulas FIXED black→red this pass, the roll-data note was already "Red [Die]").
 * Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 *   • control tests  → preUseItem TAKEOVERS that ROLL 1d20+Black and GATE on edhaReadDefense(cog)
 *     (the Sovereignty/Chaos dispatch — never trust-the-player; a failed test stays spent).
 *   • kinetic riders → the applyDamage wrapper pre/post-pass with edhaDealerOf (the Withering-Touch
 *     armed-strike + Tempered-Edge injection shapes); kill/half-HP detection reads the same
 *     prevHp→newHp crossing the shared live→0 stamp uses.
 *   • cross-actor    → edhaGrantTempHpCross / edhaGrantAdvAttack / edhaApplyTimedStatus /
 *     burst-apply relays; timed expiry = the {round,turn} coordinate convention.
 * PRE-STANDARD WIRING audited vs the cards this pass (the Death R6/R7 / Civ R2 process) — both REDONE:
 *   • Warlord's Advance's authored edha-on-defeat rider was a documented HEURISTIC ("GM adjudicates
 *     kill attribution — decline if the kill came from another talent") → REMOVED (Ben R6); the
 *     armed-strike rider below attributes for real. • Investiture of Command's authored edha-temp-hp
 *     event granted the FIRST ally only, self-damage manual → REMOVED (Ben R5); takeover below.
 * Wired here (no longer GM-eyeballed):
 *   • Kneel — TAKEOVER: 1 Inv, Black vs Cognitive (edhaReadDefense) → the NEW `compelled` status
 *     (Ben R1 — NOT core prone; own id like harvested/decaying) until the start of your next turn
 *     (owner-relative expiry). The move-toward-or-nothing clause is forced volition (manual, carded).
 *     The advantage clause is a wired PASSIVE (Ben R2): a pre{Attack|Item}Roll injector — you own
 *     Kneel + the synced target bears compelled/frightened/weakened + stands in Black range →
 *     advantage (the Weakened-disadvantage shape). `frightened` is registered as a GM-applied marker.
 *   • Warlord's Advance — use arms `warlordNext` (1 Inv via activation, the witherNext shape); your
 *     next WEAPON hit (melee owner-judged) consumes it in the PRE-pass — +[T][D red] impact rolled
 *     into the SAME application so the kill check includes the rider. POST-pass on that hit:
 *     live→0 → Temp HP = tier (edhaGrantTempHpCross) + the whispered 10 ft free-move prompt;
 *     survivor → edhaSetNextTestMod advantage on your next Presence-attribute test (the Red-Key
 *     attr-gate; "vs that target / until your next turn" binding is card-noted — the flag is counted).
 *   • Crown of Thorns — use arms `crownActive` for the scene (2 Inv via activation);
 *     edhaCrownPing(owner, target) fires on every ENGINE-resolved Black/Red-talent vs-Cognitive test:
 *     in-tree (Kneel, Absolute Authority) plus the Sovereignty Censure/Decree sites (Ben R4 — same
 *     PC can own both trees; Edict of the Fallen is vs Spiritual, excluded). Ping = Presence (@attr.pre) spirit via
 *     burst-apply (spirit bypasses deflect = "cannot be reduced", card-noted). Tests the engine does
 *     NOT resolve get the owner-click ping button on the arming card (the Sovereignty-Expose shape).
 *   • Absolute Authority — TAKEOVER: ENFORCES the target gate (bears compelled/frightened/weakened,
 *     in Black range — the Consuming-Decay gate shape, refused pre-cost), 2 Inv, Black vs Cognitive.
 *     Success → the "you choose its next action (no direct self-harm)" card (forced volition —
 *     manual, Ben R3); failure → Weakened until the end of ITS next turn (edhaApplyTimedStatus,
 *     expire target). Both branches ping Crown of Thorns.
 *   • Momentum of Victory — name-based useItem: 1 Inv via activation, Opportunity in the Cost header
 *     but NEVER auto-deducted (the standing convention — trusted); posts the move-15-ft + free-Strike
 *     card and arms `momentumNext`: your next WEAPON hit gets +@tier impact (the item's own authored
 *     formula) in the PRE-pass, consumed on fire. The movement + Strike are player-executed.
 *   • Unstoppable Advance — name-based useItem arm (1 Inv via activation): `unstoppable` flag with
 *     the baked [T][D red], an empty hit-list, and the end-of-your-next-turn expiry coordinate.
 *     The tree's ONE new small handler (Ben R8): a GM-side MOVE-THROUGH watcher — preUpdateToken
 *     stamps the prior position (the HP-stamp shape), updateToken samples the segment against
 *     enemy-occupied squares (edhaSegPointDist); each enemy is hit ONCE per activation, its own
 *     [T][D red] roll (the Bone-Garden per-creature convention), applied via edhaApplyBurstResults
 *     with real attribution (trample drops feed Warlord's Fury). The can't-be-Slowed/Immobilized/
 *     Prone clause is ENFORCED: a createActiveEffect watcher deletes those statuses while armed.
 *     "May move through enemy spaces" isn't blocked by core Foundry (card-noted). Swept on
 *     combatTurnChange; out-of-combat arms are stamped lazily (the Sovereignty convention).
 *   • Investiture of Command — TAKEOVER (replaces the old first-ally-only data event — Ben R5):
 *     validates up to 3 targeted same-disposition allies in Black range (refused pre-cost on zero),
 *     2 Inv, ONE shared [T][D black] roll (the Necrotic-Cascade convention) → each ally gains that
 *     Temp HP (edhaGrantTempHpCross, keeps-higher) + advantage on its next attack test
 *     (edhaGrantAdvAttack, the Green primitive); then the caster takes tier spirit under
 *     _edhaInTrigger (spirit bypasses deflect = "cannot be reduced").
 *   • Warlord's Fury — use arms `fury = {belowHalf:[], kills:0}` for the scene (2 Inv via
 *     activation; re-arm refused pre-cost). POST-pass, you are the dealer: a HOSTILE non-summon
 *     NON-character victim (Ben R7 — no PC/ally farming, the Death-R2 spirit) crossing below half
 *     max HP counts once (the id set); a live→0 crossing adds 1 more (one blow can do both).
 *     PRE-pass: your WEAPON hits get +min(belowHalf+kills, 2×tier) in the dealt type.
 *   • Mantle of the Aspirant (capstone) — TAKEOVER: once/scene (`mantleUsed`), 3 Inv; then:
 *     (a) +2 all defenses = a scene AE (the Colossus shape); (b) melee +tier spirit = the PRE-pass
 *     rider on your WEAPON hits (melee owner-judged); (c) allies in Black range +1 to all tests =
 *     the NEW flat-bonus pre-roll injector (Ben R9a — appends a +1 NumericTerm to the d20 roll,
 *     live-computed ally-in-range check; ⚑ bench-verify against configureModifiers rebuilds);
 *     (d) the damage REDIRECT (Ben R9b — no intercept hook exists) = watcher-plus-prompt (the
 *     Sovereignty-Expose / Civ-Bonds shape): the mantled owner takes damage → whispered card with a
 *     budget = min(tier, HP lost); each click targets a willing ally in Black range (consent
 *     owner-judged, the Sovereignty convention), prompts an amount, applies it to the ally with
 *     edhaRedirected:true (Devoted-Conduit honest) and heals the wearer back the same.
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • The Mantle +1 injector vs dialog-roll rebuilds — if configureModifiers/configureDialog wipes
 *     appended terms, fall back to an AE if the system grows a per-skill bonus key (named fallback).
 *   • Waypointed drags for the move-through watcher — v13 fires updateToken per movement operation;
 *     multi-waypoint paths are sampled as one straight segment per update (bench-verify).
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Melee-ness of weapon hits — edhaAttackKind gates Warlord's Advance (stays armed on a ranged
 *     hit), Warlord's Fury, and the Mantle melee spirit; unknown = owner-judged as before.
 *   • The Presence-advantage rider is now TARGET-BOUND — nextTestMod carries targetUuid and the
 *     injector/consumer fire only with the survivor as the synced target (generalizable to any
 *     future "advantage vs THAT creature" rider).
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Kneel's move-toward-or-nothing — ENFORCED 07-16c (Ben D11): kneelBy stamp + preUpdateToken
 *     veto (only distance-closing moves pass; edhaForced bypasses; stamp dies with the status).
 *     Absolute Authority's chosen ACTION stays forced-volition manual (the D10 class — no movement
 *     semantics to veto; say the word if it should freeze movement too).
 *   • Momentum's Opportunity cost (trusted) + its movement/Strike;
 *     Warlord's Advance's 10 ft free move (prompted, player-executed); "willing" ally consent
 *     (owner-judged).
 *   • CONTEST-EXEMPT: none — both tests (Kneel, Absolute Authority) are vs a DEFENSE (Cognitive),
 *     rolled by the engine and gated on edhaReadDefense, never an opposed SKILL.
 * ============================================================================================ */

const EDHA_POWER_BLACK_DIE = "(@tier)d(2 * @skills.black.rank + 2)";
const EDHA_POWER_RED_DIE = "(@tier)d(2 * @skills.red.rank + 2)";
const EDHA_POWER_PREY = ["compelled", "frightened", "weakened"];   // Kneel's advantage set + Absolute Authority's gate

function edhaPowerCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaPowerTalent(owner, name) { return owner?.items?.find(i => edhaIsTalent(i) && i.name === name) ?? null; }
function edhaPowerTestLine(item, total, def, ok) {
  return `<p>👑 <strong>${item.name}</strong> — Black <strong>${total}</strong> vs Cognitive ${def == null ? "?" : def}: <strong>${ok ? "success" : "fail"}</strong></p>`;
}

/* --- Crown of Thorns — the vs-Cognitive ping (Presence spirit, "cannot be reduced") ----------------- */
async function edhaCrownPing(owner, target) {
  try {
    if (!owner?.getFlag?.("edha-content", "crownActive") || !edhaOwnsTalent(owner, "Crown of Thorns")) return;
    if (!target || target === owner) return;
    const amt = Math.max(0, Math.floor(edhaEvalSync("@attr.pre", owner.getRollData())));
    if (amt <= 0) return;
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: target.uuid, amount: amt, type: "spirit", heal: false }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    else { ui.notifications?.warn("Edha: a GM must be online for Crown of Thorns' spirit damage."); return; }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🌹 <strong>Crown of Thorns</strong>: ${target.name} defies ${owner.name}'s Cognitive test — <strong>${amt}</strong> spirit (Presence; spirit bypasses deflect).</p>` });
  } catch (e) { console.error("Edha Content | Crown of Thorns ping failed", e); }
}
async function edhaPowerCrownArm(owner) {
  try {
    await owner.setFlag("edha-content", "crownActive", true);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-burst-card"><p>🌹 <strong>Crown of Thorns</strong> armed for the scene: whenever one of ${owner.name}'s Black or Red talents tests against a character's Cognitive, that character takes <strong>spirit = Presence</strong> (auto on engine-resolved tests — Kneel, Absolute Authority, Censure, Decree of Ruin). For a Black/Red vs-Cognitive test the engine did NOT resolve: target the character, then click.</p>`
        + `<button type="button" class="edha-power-btn" data-edha-action="crown-ping" data-edha-owner="${owner.uuid}">Crown ping (target the character first)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Crown of Thorns arm failed", e); }
}
async function edhaPowerCrownClick(ev) {
  try {
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    if (!owner) return;
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the crown's wearer (or the GM) pings."); return; }
    if (!owner.getFlag?.("edha-content", "crownActive")) { ui.notifications?.warn("Edha: Crown of Thorns is not armed (scene ended?)."); return; }
    const target = Array.from(game.user?.targets ?? [])[0]?.actor;
    if (!target) { ui.notifications?.warn("Edha: target the character whose Cognitive was tested, then click."); return; }
    await edhaCrownPing(owner, target);
  } catch (e) { console.error("Edha Content | Crown ping click failed", e); }
}

/* --- Kneel + Absolute Authority — Black vs Cognitive takeovers (edhaReadDefense — never trusted) ---- */
async function edhaPowerKneel(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const target = toks[0]?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target the character for Kneel. Nothing spent."); return; }
    if (!edhaDeathInRange(owner, toks[0], "black")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Black). Nothing spent.`); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "black");
    const total = Number(roll.total) || 0, ok = def == null ? true : total >= def;
    await edhaCrownPing(owner, target);
    if (ok) {
      await edhaApplyTimedStatus(target, "compelled", { owner, expire: "owner" });
      // Move-toward-or-nothing ENFORCED (Ben 07-16c, D11 — was forced-volition manual): stamp who
      // compels; the preUpdateToken veto below blocks any willing move that doesn't close distance.
      await edhaSetEdhaFlag(target, "kneelBy", { ownerTokUuid: edhaCasterToken(owner)?.document?.uuid ?? null, ownerName: owner.name });
      const ids = (game.users?.filter(u => u.active && (u.isGM || target.testUserPermission?.(u, "OWNER"))) ?? []).map(u => u.id);
      if (ids.length) ChatMessage.create({ whisper: ids, speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>⛓️ <strong>Kneel</strong>: ${target.name} is Compelled — next action, <strong>move toward ${owner.name}</strong> or <strong>do nothing</strong>. Movement in any other direction is blocked until it wears off.</p>` });
    }
    edhaPowerCard(owner, [roll], edhaPowerTestLine(item, total, def, ok) + (ok
      ? `<p>${target.name} is <strong>Compelled</strong> until the start of ${owner.name}'s next turn — it must spend its next action either moving toward ${owner.name} or doing nothing (movement ENFORCED — only distance-closing moves pass). ${owner.name} has advantage on attack tests against Compelled/Frightened/Weakened characters in range (auto).</p>`
      : `<p>${target.name} keeps their feet.</p>`));
  } catch (e) { console.error("Edha Content | Kneel failed", e); }
}
async function edhaPowerAbsoluteAuthority(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const target = toks[0]?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target the character for Absolute Authority. Nothing spent."); return; }
    if (!EDHA_POWER_PREY.some(s => target.statuses?.has?.(s))) {
      ui.notifications?.warn(`Edha: ${target.name} must be Compelled, Frightened, or Weakened for Absolute Authority. Nothing spent.`); return;
    }
    if (!edhaDeathInRange(owner, toks[0], "black")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Black). Nothing spent.`); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "black");
    const total = Number(roll.total) || 0, ok = def == null ? true : total >= def;
    await edhaCrownPing(owner, target);
    if (!ok) await edhaApplyTimedStatus(target, "weakened", { owner, expire: "target" });   // until the end of ITS next turn
    edhaPowerCard(owner, [roll], edhaPowerTestLine(item, total, def, ok) + (ok
      ? `<p><strong>${owner.name} chooses ${target.name}'s action on its next turn</strong> (it cannot be forced to directly harm itself) — forced volition, GM-run.</p>`
      : `<p>${target.name} resists — but is <strong>Weakened</strong> until the end of its next turn.</p>`));
  } catch (e) { console.error("Edha Content | Absolute Authority failed", e); }
}
// Kneel's standing advantage (passive of OWNING the talent): attack tests vs a compelled/frightened/
// weakened synced target in Black range roll with advantage (the Weakened-disadvantage shape).
function edhaPowerKneelAdv(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor || !edhaOwnsTalent(actor, "Kneel")) return;
    const t = edhaTargetsOfRoller(actor)[0]; const ta = t?.actor; if (!ta || ta === actor) return;
    if (!EDHA_POWER_PREY.some(s => ta.statuses?.has?.(s))) return;
    const otok = edhaCasterToken(actor); if (!otok) return;
    if (!edhaTokensWithin(otok, edhaAttuneFtColor(actor, "black")).some(x => x.id === t.id)) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | Kneel advantage pre-roll failed", e); }
}
for (const ctx of ["Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaPowerKneelAdv);
// Kneel's move-toward-or-nothing VETO (07-16c, Ben D11 — the Dread Presence shape): while
// Compelled with a kneelBy stamp, a willing move must CLOSE distance to the compeller's token;
// anything else is blocked on the moving client. Engine-forced movement (edhaForced) bypasses.
// The stamp dies with the status (deleteActiveEffect) and at combat end; a stale stamp without
// the status is inert (the veto checks both).
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (options?.edhaForced) return;
    if (!("x" in changes) && !("y" in changes)) return;
    const actor = doc.actor;
    if (!actor?.statuses?.has?.("compelled")) return;
    const kb = actor.getFlag?.("edha-content", "kneelBy"); if (!kb?.ownerTokUuid) return;
    const oTok = (fromUuidSync?.(kb.ownerTokUuid) ?? null)?.object ?? null; if (!oTok?.center) return;
    const gs = (doc.parent?.grid?.size || 100);
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const oldD = Math.hypot(doc.x + w - oTok.center.x, doc.y + h - oTok.center.y);
    const newD = Math.hypot((changes.x ?? doc.x) + w - oTok.center.x, (changes.y ?? doc.y) + h - oTok.center.y);
    if (newD < oldD - 1) return;   // closing distance — allowed
    ui.notifications?.warn(`Edha: ${doc.name} is Compelled (Kneel) — it may only move toward ${kb.ownerName || "the compeller"}, or stay put.`);
    return false;
  } catch (e) { /* fail-open */ }
});
Hooks.on("deleteActiveEffect", (eff) => {
  try { if (eff?.statuses?.has?.("compelled") && eff.parent?.getFlag?.("edha-content", "kneelBy")) void eff.parent.unsetFlag("edha-content", "kneelBy"); } catch (e) {}
});
Hooks.on("deleteCombat", () => {
  try { for (const a of (game.actors ?? [])) if (a.getFlag?.("edha-content", "kneelBy")) void a.unsetFlag("edha-content", "kneelBy"); } catch (e) {}
});

/* --- The dealer riders: Warlord's Advance / Momentum arms + Fury bonus + Mantle spirit (PRE-pass) --- */
let _edhaWarlordHit = null;   // {ownerId, targetUuid, ts} — carries the armed hit from the pre- to the post-pass
function edhaPowerDealerPre(dealer, target, list) {
  try {
    if (_edhaInTrigger) return;
    const owner = dealer?.actor; if (!owner?.getFlag || owner === target) return;
    if (dealer.item?.type !== "weapon") return;                        // rides WEAPON hits
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;   // a real hit
    const rd = owner.getRollData?.() ?? {};
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", rd)) || 1);
    const dealtType = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "impact";
    // Melee gate (edhaAttackKind): a definitive ranged hit stands the melee riders down — Warlord's
    // Advance stays ARMED, Fury/Mantle just don't add. Unknown (null) = owner-judged, fires as before.
    const meleeOk = edhaAttackKind(dealer.item) !== "ranged";
    // Warlord's Advance — armed rider; PRE-pass so the kill check sees the rider damage.
    if (meleeOk && owner.getFlag("edha-content", "warlordNext")) {
      void owner.unsetFlag("edha-content", "warlordNext");
      const tal = edhaPowerTalent(owner, "Warlord's Advance");
      const amt = Math.max(0, Math.floor(edhaEvalSync(tal?.system?.damage?.formula || EDHA_POWER_RED_DIE, rd)));
      if (amt > 0) list.push({ amount: amt, type: tal?.system?.damage?.type || "impact" });
      _edhaWarlordHit = { ownerId: owner.id, targetUuid: target.uuid, ts: Date.now() };
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>👑 <strong>Warlord's Advance</strong>: +<strong>${amt}</strong> impact on the hit.</p>` });
    }
    // Momentum of Victory — armed +tier on the free Strike.
    if (owner.getFlag("edha-content", "momentumNext")) {
      void owner.unsetFlag("edha-content", "momentumNext");
      const tal = edhaPowerTalent(owner, "Momentum of Victory");
      const amt = Math.max(0, Math.floor(edhaEvalSync(tal?.system?.damage?.formula || "@tier", rd)));
      if (amt > 0) list.push({ amount: amt, type: tal?.system?.damage?.type || "impact" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>👑 <strong>Momentum of Victory</strong>: +<strong>${amt}</strong> impact on the Strike.</p>` });
    }
    // Warlord's Fury — + current tally (capped at tier × 2) on melee attacks while armed.
    const fury = owner.getFlag("edha-content", "fury");
    if (fury && meleeOk) {
      const bonus = Math.min((fury.belowHalf?.length || 0) + (Number(fury.kills) || 0), 2 * tier);
      if (bonus > 0) {
        list.push({ amount: bonus, type: dealtType });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>🗡️ <strong>Warlord's Fury</strong>: +<strong>${bonus}</strong> ${dealtType} (the blade remembers).</p>` });
      }
    }
    // Mantle of the Aspirant — melee attacks deal +tier spirit while the mantle holds.
    if (meleeOk && owner.getFlag("edha-content", "mantleActive")) {
      list.push({ amount: tier, type: "spirit" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>👑 <strong>Mantle of the Aspirant</strong>: +<strong>${tier}</strong> spirit on the blow.</p>` });
    }
  } catch (e) { console.error("Edha Content | Power dealer pre-pass failed", e); }
}
/* --- POST-pass: Warlord's Advance outcomes + the Fury tally ----------------------------------------- */
async function edhaPowerDealerPost(dealer, target, prevHp) {
  try {
    const owner = dealer?.actor; if (!owner?.getFlag) return;
    const hp = Number(target?.system?.resources?.hea?.value) || 0;
    const hea = target?.system?.resources?.hea;
    const maxHp = Number(hea?.max?.value ?? hea?.max) || 0;
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData?.() ?? {})) || 1);
    // Warlord's Advance — resolve the hit we armed in the pre-pass (same application).
    if (_edhaWarlordHit && _edhaWarlordHit.ownerId === owner.id && _edhaWarlordHit.targetUuid === target.uuid
        && (Date.now() - _edhaWarlordHit.ts) < 15000) {
      _edhaWarlordHit = null;
      if (prevHp > 0 && hp <= 0) {
        await edhaGrantTempHpCross(owner, tier, "Warlord's Advance");
        edhaPowerCard(owner, null, `<p>👑 <strong>Warlord's Advance</strong>: ${target.name} falls — ${owner.name} gains <strong>${tier}</strong> Temp HP and may <strong>move up to 10 ft as a Free Action</strong> (move the token — player-executed).</p>`, { whisper: true });
      } else {
        await edhaSetNextTestMod(owner, { mode: "advantage", attr: "pre", count: 1, targetUuid: target.uuid, source: "Warlord's Advance" });
        edhaPowerCard(owner, null, `<p>👑 <strong>Warlord's Advance</strong>: ${target.name} survives — advantage on your next <strong>Presence</strong> test <strong>against ${target.name}</strong> (target-bound — fires only with ${target.name} targeted; until the start of your next turn, trusted).</p>`, { whisper: true });
      }
    }
    // Warlord's Fury — tally hostile non-summon NPC drops (Ben R7): below-half once per victim, +1 per kill.
    const fury = owner.getFlag("edha-content", "fury");
    if (fury && target !== owner && target.type !== "character"
        && !target.getFlag?.("edha-content", "summon") && edhaDisposHostile(owner, target)) {
      const f = foundry.utils.deepClone(fury); f.belowHalf = f.belowHalf || []; f.kills = Number(f.kills) || 0;
      let changed = false;
      if (maxHp > 0 && prevHp > maxHp / 2 && hp <= maxHp / 2 && !f.belowHalf.includes(target.id)) { f.belowHalf.push(target.id); changed = true; }
      if (prevHp > 0 && hp <= 0) { f.kills += 1; changed = true; }
      if (changed) {
        await owner.setFlag("edha-content", "fury", f);
        const bonus = Math.min(f.belowHalf.length + f.kills, 2 * tier);
        edhaPowerCard(owner, null, `<p>🗡️ <strong>Warlord's Fury</strong>: the tally rises — melee bonus now <strong>+${bonus}</strong> (cap ${2 * tier}).</p>`, { whisper: true });
      }
    }
  } catch (e) { console.error("Edha Content | Power dealer post-pass failed", e); }
}

/* --- Unstoppable Advance — armed flag + the move-through watcher (the tree's one new handler) ------- */
async function edhaPowerUnstoppableArm(owner, item) {
  try {
    const baked = Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_POWER_RED_DIE, owner.getRollData(), { missing: "0" });
    let expire = null;   // out-of-combat arms are stamped lazily by the sweep (the Sovereignty convention)
    const c = game.combat;
    if (c?.started) { const ti = edhaCombatantTurnIndex(c, owner); if (ti >= 0) expire = edhaNextTurnCoord(c, ti); }
    await owner.setFlag("edha-content", "unstoppable", { baked, type: item.system?.damage?.type || "impact", hit: [], expire });
    edhaPowerCard(owner, null, `<p>🏃 <strong>Unstoppable Advance</strong>: until the end of ${owner.name}'s next turn they cannot be Slowed, Immobilized, or knocked Prone (engine-shrugged) and may move through enemy spaces (core Foundry doesn't block token overlap) — each enemy whose space they pass through takes <strong>${baked}</strong> impact (auto, once per enemy).</p>`);
  } catch (e) { console.error("Edha Content | Unstoppable Advance arm failed", e); }
}
function edhaSegPointDist(a, b, p) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  const t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2)) : 0;
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}
// preUpdateToken stamps the prior position (the shared-HP-stamp shape) so updateToken sees the segment.
Hooks.on("preUpdateToken", (tokenDoc, changed, options) => {
  try {
    if (changed?.x === undefined && changed?.y === undefined) return;
    options.edhaPrevPos = { x: tokenDoc.x, y: tokenDoc.y };
  } catch (e) {}
});
Hooks.on("updateToken", (tokenDoc, changed, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;                                  // one applier (the primary GM)
    if (!options?.edhaPrevPos) return;
    const owner = tokenDoc?.actor;
    if (!owner?.getFlag?.("edha-content", "unstoppable")) return;
    void edhaPowerTrample(tokenDoc, owner, options.edhaPrevPos);
  } catch (e) { console.error("Edha Content | Unstoppable move-watch failed", e); }
});
async function edhaPowerTrample(tokenDoc, owner, prev) {
  try {
    const cfg = owner.getFlag("edha-content", "unstoppable"); if (!cfg) return;
    const scene = tokenDoc.parent; if (!scene) return;
    const gs = scene.grid?.size || 100;
    const w = (tokenDoc.width ?? 1) * gs, h = (tokenDoc.height ?? 1) * gs;
    const p0 = { x: prev.x + w / 2, y: prev.y + h / 2 };
    const p1 = { x: tokenDoc.x + w / 2, y: tokenDoc.y + h / 2 };
    if (p0.x === p1.x && p0.y === p1.y) return;
    const disp = tokenDoc.disposition ?? 1;
    const hitIds = new Set(cfg.hit || []);
    const victims = [];
    for (const t of (scene.tokens ?? [])) {
      if (t.id === tokenDoc.id || !t.actor) continue;
      if ((t.disposition ?? 0) === disp) continue;                     // enemy spaces only
      if ((t.actor.system?.resources?.hea?.value ?? 0) <= 0) continue;
      if (hitIds.has(t.id)) continue;                                  // once per enemy per activation
      const ew = (t.width ?? 1) * gs;
      const c = { x: t.x + ew / 2, y: t.y + ((t.height ?? 1) * gs) / 2 };
      if (edhaSegPointDist(p0, p1, c) <= ew / 2 + 1) victims.push(t);  // the path crosses its space
    }
    if (!victims.length) return;
    for (const t of victims) hitIds.add(t.id);
    await owner.setFlag("edha-content", "unstoppable", { ...cfg, hit: [...hitIds] });
    for (const t of victims) {
      const dr = await new Roll(cfg.baked || "0").evaluate();
      const amt = Math.max(0, Math.floor(dr.total)); if (amt <= 0) continue;
      await edhaApplyBurstResults({ casterActorUuid: owner.uuid, hits: [{ actorUuid: t.actor.uuid, amount: amt, type: cfg.type || "impact", heal: false }] });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: [dr],
        content: `<p>🏃 <strong>Unstoppable Advance</strong>: ${owner.name} drives through ${t.name} — <strong>${amt}</strong> ${cfg.type || "impact"}.</p>` });
    }
  } catch (e) { console.error("Edha Content | Unstoppable trample failed", e); }
}
// The can't-be clause is ENFORCED: Slowed/Immobilized/Prone landing on an armed owner is shrugged off.
Hooks.on("createActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    if (!a.getFlag?.("edha-content", "unstoppable")) return;
    const blocked = [...(effect.statuses ?? [])].filter(s => ["slowed", "immobilized", "prone"].includes(s));
    if (!blocked.length) return;
    void effect.delete().then(() => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }),
      content: `<p>🏃 <strong>Unstoppable Advance</strong>: ${a.name} cannot be ${blocked.join("/")} — the condition is shrugged off.</p>` })).catch(() => {});
  } catch (e) { console.error("Edha Content | Unstoppable immunity failed", e); }
});
// Expiry sweep: the armed flag ends after the owner's next turn; out-of-combat arms stamp lazily.
async function edhaPowerUnstoppableSweep(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curSeq = edhaTurnSeq(combat.round, combat.turn);
    for (const cb of (combat.combatants ?? [])) {
      const a = cb.actor; const cfg = a?.getFlag?.("edha-content", "unstoppable"); if (!cfg) continue;
      if (!cfg.expire) {
        const ti = edhaCombatantTurnIndex(combat, a);
        if (ti >= 0) { try { await a.setFlag("edha-content", "unstoppable", { ...cfg, expire: edhaNextTurnCoord(combat, ti) }); } catch (e) {} }
        continue;
      }
      if (curSeq > edhaTurnSeq(cfg.expire.round, cfg.expire.turn)) {
        try { await a.unsetFlag("edha-content", "unstoppable"); } catch (e) {}
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🏃 <strong>Unstoppable Advance</strong> on ${a.name} ends.</p>` });
      }
    }
  } catch (e) { console.error("Edha Content | Unstoppable sweep failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaPowerUnstoppableSweep(combat); });

/* --- Investiture of Command — takeover: up to 3 allies, ONE shared roll, self spirit ---------------- */
async function edhaPowerInvestiture(owner, item) {
  try {
    const otok = edhaCasterToken(owner);
    const disp = otok?.document?.disposition ?? 1;
    const allies = Array.from(game.user?.targets ?? [])
      .filter(t => t.actor && t.actor !== owner
        && (t.document?.disposition ?? 1) === disp
        && (t.actor.system?.resources?.hea?.value ?? 0) > 0
        && edhaDeathInRange(owner, t, "black"))
      .slice(0, 3);
    if (!allies.length) { ui.notifications?.warn("Edha: target up to 3 allies in your Attunement Range (Black) for Investiture of Command. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    const dr = await new Roll(Roll.replaceFormulaData(EDHA_POWER_BLACK_DIE, owner.getRollData(), { missing: "0" })).evaluate();
    const thp = Math.max(0, Math.floor(dr.total));
    for (const t of allies) {
      if (thp > 0) await edhaGrantTempHpCross(t.actor, thp, "Investiture of Command");
      await edhaGrantAdvAttack(t.actor, "Investiture of Command");
    }
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
    _edhaInTrigger = true;   // the self-cost must not re-trigger dealer riders
    try { await owner.applyDamage([{ amount: tier, type: "spirit" }], { chatMessage: false }); }
    finally { _edhaInTrigger = false; }
    edhaPowerCard(owner, [dr], `<p>👑 <strong>Investiture of Command</strong>: ${allies.map(t => t.name).join(", ")} gain${allies.length === 1 ? "s" : ""} <strong>${thp}</strong> Temp HP and <strong>advantage on their next attack test</strong> (one shared roll). ${owner.name} takes <strong>${tier}</strong> spirit (cannot be reduced — spirit bypasses deflect).</p>`);
  } catch (e) { console.error("Edha Content | Investiture of Command failed", e); }
}

/* --- Warlord's Fury / Momentum / Warlord's Advance arms --------------------------------------------- */
async function edhaPowerFuryArm(owner) {
  try {
    await owner.setFlag("edha-content", "fury", { belowHalf: [], kills: 0 });
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
    edhaPowerCard(owner, null, `<p>🗡️ <strong>Warlord's Fury</strong> armed for the scene: ${owner.name}'s melee attacks gain +1 per hostile character reduced below half HP (once each) and +1 per kill — capped at <strong>${2 * tier}</strong>. The tally rides your hits automatically (PC/ally/summon drops don't count).</p>`);
  } catch (e) { console.error("Edha Content | Warlord's Fury arm failed", e); }
}
async function edhaPowerMomentumArm(owner, item) {
  try {
    await owner.setFlag("edha-content", "momentumNext", true);
    edhaPowerCard(owner, null, `<p>👑 <strong>Momentum of Victory</strong> (Free — 1 Investiture + an <strong>Opportunity</strong>, not auto-deducted): move up to <strong>15 ft</strong> and make a free melee Strike against a character within reach (move the token + roll the weapon — player-executed). The Strike's hit gains <strong>+tier</strong> impact automatically.</p>`);
  } catch (e) { console.error("Edha Content | Momentum of Victory arm failed", e); }
}
async function edhaPowerWarlordArm(owner) {
  try {
    await owner.setFlag("edha-content", "warlordNext", true);
    edhaPowerCard(owner, null, `<p>👑 <strong>Warlord's Advance</strong>: make a melee weapon attack — the next weapon hit auto-adds the talent's [Tier][Die red] impact. A kill grants Temp HP + the 10 ft move prompt; a survivor grants advantage on your next Presence test. Don't also roll the card's damage by hand.</p>`);
  } catch (e) { console.error("Edha Content | Warlord's Advance arm failed", e); }
}

/* --- Mantle of the Aspirant — capstone: AE + melee spirit + ally aura + redirect prompts ------------ */
async function edhaPowerMantle(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "mantleUsed")) { ui.notifications?.warn("Edha: Mantle of the Aspirant was already worn this scene. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    await owner.setFlag("edha-content", "mantleUsed", true);
    await owner.setFlag("edha-content", "mantleActive", true);
    await owner.createEmbeddedDocuments("ActiveEffect", [{
      name: "Mantle of the Aspirant", img: item.img || "icons/equipment/head/crown-gold-red.webp",
      changes: ["phy", "cog", "spi"].map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "2", priority: 20 })),
      description: "<p>For the scene: +2 to all defenses; melee attacks deal +tier spirit (auto); allies in Black Attunement Range gain +1 to all tests (auto-injected); when you take damage you may redirect up to tier of it to willing allies in range (prompted).</p>",
      flags: { "edha-content": { powerMantle: true } },
    }]);
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
    edhaPowerCard(owner, null, `<p>👑 <strong>Mantle of the Aspirant</strong>: for the scene ${owner.name} gains <strong>+2 to all defenses</strong>, their melee attacks deal <strong>+${tier} spirit</strong> (auto), allies in Attunement Range (Black) gain <strong>+1 to all tests</strong> (auto-injected), and when ${owner.name} takes damage a redirect prompt offers to pass up to <strong>${tier}</strong> of it to willing allies in range. <span style="opacity:.8">(Once per scene.)</span></p>`);
  } catch (e) { console.error("Edha Content | Mantle of the Aspirant failed", e); }
}
// The ally aura: +1 flat on every d20 test rolled by an ally in Black range of a mantled owner.
// ⚑ appends a NumericTerm — bench-verify dialog rolls don't rebuild terms (named backlog fallback: AE).
function edhaPowerMantleAura(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const tok = edhaCasterToken(actor); if (!tok) return;
    for (const owner of edhaCharacterOwnersOf("Mantle of the Aspirant")) {
      if (owner === actor || !owner.getFlag?.("edha-content", "mantleActive")) continue;   // "allies" — the wearer is excluded
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((otok.document?.disposition ?? 1) !== (tok.document?.disposition ?? 1)) continue;
      if (!edhaTokensWithin(otok, edhaAttuneFtColor(owner, "black")).some(x => x.id === tok.id)) continue;
      const T = foundry.dice?.terms ?? {};
      if (!T.OperatorTerm || !T.NumericTerm) return;
      roll.terms.push(new T.OperatorTerm({ operator: "+" }), new T.NumericTerm({ number: 1, options: { flavor: "Mantle of the Aspirant" } }));
      roll._formula = Roll.getFormula(roll.terms);
      break;
    }
  } catch (e) { console.error("Edha Content | Mantle aura failed", e); }
}
for (const ctx of ["Skill", "Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaPowerMantleAura);
// The redirect prompt (posted from the applyDamage post-pass on the mantled owner).
async function edhaPowerMantleRedirectPrompt(target, list, prevHp) {
  try {
    if (!target?.getFlag?.("edha-content", "mantleActive") || !edhaOwnsTalent(target, "Mantle of the Aspirant")) return;
    const hp = Number(target.system?.resources?.hea?.value) || 0;
    const lost = Math.max(0, prevHp - hp); if (lost <= 0) return;    // fully absorbed (Temp HP) → nothing to pass on
    const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", target.getRollData())) || 1);
    const budget = Math.min(tier, lost);
    const type = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "impact";
    ChatMessage.create({
      whisper: edhaWhisperIds(target), speaker: ChatMessage.getSpeaker({ actor: target }),
      content: `<div class="edha-trigger-card"><p>👑 <strong>Mantle of the Aspirant</strong> — ${target.name} takes ${lost} damage. You may redirect up to <strong>${budget}</strong> of it to one or more <strong>willing</strong> allies in Attunement Range (Black; consent owner-judged): target an ally, then click (repeat until the budget is spent).</p>`
        + `<button type="button" class="edha-power-btn" data-edha-action="mantle-redirect" data-edha-owner="${target.uuid}" data-edha-left="${budget}" data-edha-type="${type}">Redirect (up to ${budget})</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Mantle redirect prompt failed", e); }
}
async function edhaPowerRedirectClick(ev) {
  try {
    const btn = ev.currentTarget;
    const oref = await fromUuid(btn.dataset.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    if (!owner) return;
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the mantle's wearer (or the GM) redirects."); return; }
    let left = Number(btn.dataset.edhaLeft) || 0;
    if (left <= 0) { btn.disabled = true; return; }
    const otok = edhaCasterToken(owner); const disp = otok?.document?.disposition ?? 1;
    const at = Array.from(game.user?.targets ?? []).find(t => t.actor && t.actor !== owner
      && (t.document?.disposition ?? 1) === disp
      && (t.actor.system?.resources?.hea?.value ?? 0) > 0
      && edhaDeathInRange(owner, t, "black"));
    if (!at) { ui.notifications?.warn("Edha: target a willing ally in your Attunement Range (Black) first."); return; }
    let amt = left;
    try {
      const v = await foundry.applications.api.DialogV2.prompt({
        window: { title: "Mantle of the Aspirant — redirect" },
        content: `<p>Redirect how much to <strong>${at.actor.name}</strong>? (1–${left})</p><input type="number" name="amt" value="${left}" min="1" max="${left}" autofocus>`,
        ok: { callback: (_e, button) => Number(button.form?.elements?.amt?.value) },
        modal: false, rejectClose: false,
      });
      if (v == null || Number.isNaN(Number(v))) return;
      amt = Math.max(1, Math.min(left, Math.floor(Number(v))));
    } catch (e) { return; }
    const type = btn.dataset.edhaType || "impact";
    // The ally takes it in the wearer's place (edhaRedirected keeps Devoted Conduit honest when direct).
    if (at.actor.isOwner || game.user?.isGM) {
      try { await at.actor.applyDamage([{ amount: amt, type }], { chatMessage: false, edhaRedirected: true }); } catch (e) {}
    } else if (game.users?.activeGM) {
      game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: at.actor.uuid, amount: amt, type, heal: false }] } });   // relay path can't carry the redirected flag (card-noted)
    } else { ui.notifications?.warn("Edha: a GM must be online to redirect to that ally."); return; }
    // The wearer takes that much less — heal the redirected amount back.
    const hea = owner.system?.resources?.hea;
    const omax = Number(hea?.max?.value ?? hea?.max) || 0;
    try { await owner.update({ "system.resources.hea.value": Math.min(omax || Infinity, (Number(hea?.value) || 0) + amt) }); } catch (e) {}
    left -= amt;
    btn.dataset.edhaLeft = String(left);
    if (left <= 0) { btn.disabled = true; btn.textContent = "Redirect spent."; } else { btn.textContent = `Redirect (up to ${left} left)`; }
    edhaPowerCard(owner, null, `<p>👑 <strong>Mantle of the Aspirant</strong>: ${at.actor.name} shoulders <strong>${amt}</strong> ${type} in ${owner.name}'s place${left > 0 ? ` (${left} redirect left on this hit)` : ""}.</p>`);
  } catch (e) { console.error("Edha Content | Mantle redirect failed", e); }
}

/* --- Power dispatch: takeovers + pre-cost gates + post-use arms ------------------------------------- */
const EDHA_POWER_TAKEOVER = new Set(["Kneel", "Absolute Authority", "Investiture of Command", "Mantle of the Aspirant"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    // Re-arm gates (refused pre-cost) for the name-based scene arms.
    if (item.name === "Crown of Thorns" && edhaOwnsTalent(actor, "Crown of Thorns")
        && actor.getFlag?.("edha-content", "crownActive")) { ui.notifications?.warn("Edha: Crown of Thorns is already armed this scene."); return false; }
    if (item.name === "Warlord's Fury" && edhaOwnsTalent(actor, "Warlord's Fury")
        && actor.getFlag?.("edha-content", "fury")) { ui.notifications?.warn("Edha: Warlord's Fury is already armed this scene."); return false; }
    if (item.name === "Unstoppable Advance" && edhaOwnsTalent(actor, "Unstoppable Advance")
        && actor.getFlag?.("edha-content", "unstoppable")) { ui.notifications?.warn("Edha: Unstoppable Advance is already active."); return false; }
    if (!EDHA_POWER_TAKEOVER.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Kneel":                  void edhaPowerKneel(actor, item); break;
      case "Absolute Authority":     void edhaPowerAbsoluteAuthority(actor, item); break;
      case "Investiture of Command": void edhaPowerInvestiture(actor, item); break;
      case "Mantle of the Aspirant": void edhaPowerMantle(actor, item); break;
    }
    return false;   // cancel the system's default use() (no stray card/roll); costs paid via edhaConsumeCost
  } catch (e) { console.error("Edha Content | Power preUse-hook failed", e); }
});
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || !edhaOwnsTalent(actor, item.name)) return;
    if (item.name === "Warlord's Advance") void edhaPowerWarlordArm(actor);
    else if (item.name === "Crown of Thorns") void edhaPowerCrownArm(actor);
    else if (item.name === "Momentum of Victory") void edhaPowerMomentumArm(actor, item);
    else if (item.name === "Unstoppable Advance") void edhaPowerUnstoppableArm(actor, item);
    else if (item.name === "Warlord's Fury") void edhaPowerFuryArm(actor);
  } catch (e) { console.error("Edha Content | Power useItem-hook failed", e); }
});

/* --- Chat buttons ------------------------------------------------------------------------------------ */
function edhaBindPowerButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  root.querySelectorAll?.(".edha-power-btn").forEach(b => {
    const act = b.dataset.edhaAction;
    if (act === "crown-ping") b.addEventListener("click", edhaPowerCrownClick);
    else if (act === "mantle-redirect") b.addEventListener("click", edhaPowerRedirectClick);
  });
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindPowerButtons(html));

/* --- Scene cleanup (deleteCombat): the whole Power state resets -------------------------------------- */
async function edhaClearPowerState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["crownActive", "warlordNext", "momentumNext", "fury", "unstoppable", "mantleActive", "mantleUsed"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
      const fx = a.effects?.filter(e => e.getFlag?.("edha-content", "powerMantle")) ?? [];
      if (fx.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", fx.map(e => e.id)); } catch (e) {} }
    }
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      for (const s of ["compelled", "frightened"]) if (a.statuses?.has?.(s)) { try { await a.toggleStatusEffect?.(s, { active: false }); } catch (e) {} }
    }
  } catch (e) { console.error("Edha Content | clear Power state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearPowerState(); } catch (e) {} });

/* ============================================================================================
 * KNOWLEDGE (Gnothis, deity) tree engine (2026-07-03) — study (Green) → the Insight economy → strike
 * (Red kinetic, scaled per Insight).
 * Colors Red/Green; tag prefix "Knowledge (Gnothis)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-03, the Sovereignty R2/Death R0/Civ R0/Power R0 precedent): GREEN backs
 * EVERY "Attunement Range" check tree-wide (study/stack side — Studied Mark's target range, Accumulate's
 * turn-start range, Pack Share/The Pack/Death Mark/Hunter's Discipline/The Final Study's ally range);
 * RED backs every [Tier][Die] damage payload (Predatory Strike, Killing Blow, The Final Study, Death
 * Mark's ally burst).
 * NAME COLLISION resolved (Ben R2, 07-03): the capstone "Apex Predator" collided with Green/Instinct's
 * already-wired "Apex Predator" (≥3 enemies in your terrain → advantage, edhaOwnsTalent bare-name match
 * at the Green/Instinct pre-roll injector). RENAMED to "The Final Study" (domain.json, talent-rolls.json,
 * deity-knowledge.json) rather than gating on color — Green's card is untouched.
 * Reuses existing primitives wholesale — NO side-engine, NO new sidecar table beyond the one new
 * Insight-economy primitive this tree needs:
 *   • Insight        = ONE new primitive (the tree's own, like Death's Remains / Power's Fury): the
 *     ALREADY-REGISTERED stackable `insight` status is the visible bearer marker AND (Ben R1, 07-03)
 *     drives the actual count via `effect.system.count` (⚑ bench-verify field name — see below), set
 *     directly (not incremental toggling) so it's exact regardless of any toggle-increment behavior.
 *     A pointer-only owner flag `flags.edha-content.gnothisBearer = targetUuid` names "my current
 *     bearer" (an inherently owner-scoped invariant — multiple Gnothis PCs each track their own).
 *     Placing Insight on a DIFFERENT creature clears the old bearer to 0 first (Studied Mark's literal
 *     text, applied tree-wide since Insight is the shared resource); cap 5; `markedBy.insight` set on
 *     the bearer (the Diagnosed/Omen marked pattern) so the EXISTING generic marked-damage dispatch
 *     picks it up for free (Accumulate — see below). Cleared at scene end (deleteCombat), like
 *     omen/decaying/compelled.
 *   • defense test    → Killing Blow / The Final Study are preUseItem TAKEOVERS that ROLL 1d20+Red and
 *     GATE on edhaReadDefense(phy) (the Kneel/Sovereignty dispatch — never trust-the-player); the target
 *     is resolved from the owner's OWN bearer pointer (no re-targeting needed — "the creature bearing
 *     your Insight" is unambiguous).
 *   • weapon riders   → the applyDamage wrapper pre/post-pass with edhaDealerOf (the Withering-Touch
 *     armed-strike shape for Predatory Strike; the Tempered-Edge/Pack-Pressure hand-written-check shape
 *     for Hunter's Discipline / Pack Share / The Pack — deliberately NOT the generic edha-apply-status
 *     multi-owner dispatch, since Studied Mark and Pack Share would otherwise collide on
 *     edhaActorRuleOf's first-match lookup across the SAME owner's talents).
 *   • on-kill transfer → rides the SHARED live→0 HP stamp (Death's preUpdateActor hook, the Civ
 *     Bonds-of-Community consumer shape) with a Knowledge-only updateActor consumer; NO disposition/
 *     type gate (Ben R6 — unlike Death/Civ/Power's kill-tally precedent, this is a resource TRANSFER,
 *     not a farming tally, so any bearer (PC or NPC) dropping to 0 counts).
 *   • info reveals    → Studied Mark / Pack Share post a WHISPERED snapshot card (current/max HP,
 *     `actor.statuses` conditions, `edhaReadDefense` for Phys/Cog/Spi) — never trust-the-player to peek.
 *   • cross-actor      → the tree's own `gnosis-set-insight` socket relay (mirrors apply-status-mark/
 *     set-flag) + burst-apply for damage; the once-per-round gate reuses the EXISTING generic
 *     edhaTriggerAllowed/edhaMarkTriggerUsed pair (no new gate primitive).
 * PRE-STANDARD WIRING: none — the authored file is clean (no pre-standard events beyond the ONE new
 * Accumulate marked-watch event added this pass, generator-reproducible — see talent-state.json).
 * Wired here (no longer silent):
 *   • Studied Mark — TAKEOVER: 1 Inv, target in Green range → `edhaGnosisSetInsight(owner, target, 2)`
 *     (clears any prior bearer) + the whispered HP/conditions/Phys+Spirit-defense reveal card.
 *   • Predatory Strike — use arms `predatoryStrikeNext` (1 Inv via activation, the Warlord's-Advance
 *     shape); your next WEAPON hit's PRE-pass adds ONE [T][D red] roll × max(Insight-on-target, 1);
 *     POST-pass places 1 Insight on the actual hit target.
 *   • Killing Blow — TAKEOVER: 2 Inv, target = your bearer (refused pre-cost if none); Red vs Physical.
 *     Success: ONE [T][D red] roll × Insight count, then clears all Insight. Failure: ONE [T][D red]
 *     roll (×1), removes 1 Insight.
 *   • The Final Study (capstone) — TAKEOVER: once/scene (`finalStudyUsed`), 3 Inv; same test shape as
 *     Killing Blow; success ALSO posts a prompt naming allies in Green range for a free Strike
 *     (player-executed — the Fate/Power action-grant convention).
 *   • Accumulate — TWO clauses: (a) start-of-turn tick (`combatTurnChange`, the Resurgent-Growth/
 *     Consuming-Decay shape) — +1 Insight on the bearer if in Green range, capped at 5; (b) damage→Inv
 *     recovery — DATA-SIDE, reuses the EXISTING generic `edha-marked-damage-trigger` dispatch verbatim
 *     (Prognosis is the literal worked example); a new `talent-state.json` entry + the matching computed
 *     event hand-written into `deity-knowledge.json` using the SAME `fid()` hash the generator would
 *     produce (verified byte-reproducible against Prognosis's real id) — pack rebuild deferred.
 *   • Pack Share — TAKEOVER arming `packShareActive` for the scene (1 Inv via activation) + a whispered
 *     reveal snapshot to allies in range. Hand-written dealer PRE-pass: an ALLY (not the owner) hitting
 *     the bearer in Green range gets +Tier vital (POST-pass places 1 Insight on the FIRST such hit each
 *     round — edhaTriggerAllowed/edhaMarkTriggerUsed, oncePerRound, keyed per-owner-per-talent).
 *   • Hunter's Discipline — hand-written dealer PRE-pass: the OWNER's OWN hit on the bearer gets +Tier
 *     vital (owner-only, unlike Pack Share's ally-only). On-kill: the shared live→0 consumer posts a
 *     candidate prompt (any creature in Green range) transferring floor(slain Insight / 2) on click.
 *   • The Pack — same shape as Pack Share, but the rider is dynamic (+Insight COUNT vital, read live at
 *     the hit, not a flat @tier) via `thePackActive`; its own independent once-per-round Insight trigger.
 *   • Death Mark — on-kill: the shared live→0 consumer posts a candidate prompt transferring the FULL
 *     slain Insight count on click, PLUS a per-ally whispered burst prompt: each ally in Green range may
 *     click to deal ONE [T][D red] roll (baked off the OWNER's own Tier/Red rank, Ben R4 — the Pack-Share
 *     "your Tier" precedent, not the acting ally's) to any enemy of their choice.
 * Ruling (Ben, 07-03): Hunter's Discipline + Death Mark can both be owned (Death Mark's prereq is
 * "Hunter's Discipline OR Killing Blow") and both fire on the SAME on-kill event — R9: both prompts fire
 * independently (no compounding-prevention); the single-bearer rule means whichever is clicked LAST just
 * wins. Pack Share + The Pack can both be armed for the same scene — R10: additive (both cost their own
 * action+Inv to arm, no exclusivity in the card text). Each talent's "first ally to hit" Insight trigger
 * is tracked independently (R11) — matches how oncePerRound gates work elsewhere (per-ability, not
 * shared).
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • The `effect.system.count` field name is a best-guess (⚑ TOP bench-verify item in this tree) — the
 *     registered stackable status's actual schema field could be `stacks`/`value`/`amount` instead;
 *     named fallback: swap the field once confirmed in Foundry's console (one-line fix, everything else
 *     is unaffected since all reads/writes go through edhaGnosisInsightOn/edhaGnosisSetInsight).
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • The Final Study's / Death Mark's "free Strike"/"deals damage to any enemy of their choice" — the
 *     ENEMY CHOICE is player-made (prompted, not auto-targeted); the Strike/attack itself is
 *     player-executed. "Willing"/consent is not a clause in this tree (no forced-volition cards).
 *   • CONTEST-EXEMPT: none — Killing Blow / The Final Study test vs a DEFENSE (Physical), rolled by the
 *     engine and gated on edhaReadDefense, never an opposed SKILL.
 * ============================================================================================ */

const EDHA_GNOSIS_RED_DIE = "(@tier)d(2 * @skills.red.rank + 2)";

function edhaGnosisCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaGnosisTalent(owner, name) { return owner?.items?.find(i => edhaIsTalent(i) && i.name === name) ?? null; }
function edhaGnosisTestLine(item, total, def, ok) {
  return `<p>📖 <strong>${item.name}</strong> — Red <strong>${total}</strong> vs Physical ${def == null ? "?" : def}: <strong>${ok ? "success" : "fail"}</strong></p>`;
}

/* --- The Insight economy: pointer-only owner flag + the registered stackable status's own count ----- */
function edhaGnosisBearerUuid(owner) { return owner?.getFlag?.("edha-content", "gnothisBearer") ?? null; }
async function edhaGnosisBearerOf(owner) {
  const uuid = edhaGnosisBearerUuid(owner); if (!uuid) return null;
  const ref = await fromUuid(uuid).catch(() => null);
  return ref?.actor ?? ref ?? null;
}
function edhaGnosisIsBearer(owner, target) { return !!(owner && target && edhaGnosisBearerUuid(owner) === target.uuid); }
// Read the count only if `target` IS this owner's current bearer (a rival Gnothis PC's mark on the
// same creature never leaks into this owner's math — the single shared `insight` status is per-creature).
function edhaGnosisInsightOn(owner, target) {
  if (!edhaGnosisIsBearer(owner, target)) return 0;
  const eff = target.effects?.find(e => e.statuses?.has?.("insight"));
  return Math.max(0, Math.floor(Number(eff?.system?.count) || 0));   // ⚑ system.count — bench-verify (see header)
}
// GM-side write: create/update/delete the `insight` effect to exactly `count` + set/clear markedBy.insight.
async function edhaGnosisApplyInsightGM(target, count, mark) {
  try {
    const eff = target.effects?.find(e => e.statuses?.has?.("insight"));
    if (count <= 0) {
      if (eff) { try { await eff.delete(); } catch (e) {} }
      try { await target.unsetFlag("edha-content", "markedBy.insight"); } catch (e) {}
      return;
    }
    if (eff) { try { await eff.update({ "system.count": count }); } catch (e) {} }
    else {
      await target.toggleStatusEffect?.("insight", { active: true });
      const created = target.effects?.find(e => e.statuses?.has?.("insight"));
      if (created) { try { await created.update({ "system.count": count }); } catch (e) {} }
    }
    if (mark) { try { await target.setFlag("edha-content", "markedBy.insight", mark); } catch (e) {} }
  } catch (e) { console.error("Edha Content | Gnosis apply Insight (GM) failed", e); }
}
async function edhaGnosisWriteInsight(target, count, mark) {
  if (target.isOwner) { await edhaGnosisApplyInsightGM(target, count, mark); return true; }
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to place Insight on ${target.name}.`); return false; }
  game.socket.emit("module.edha-content", { action: "gnosis-set-insight", payload: { targetUuid: target.uuid, count, mark } });
  return true;
}
// The one state-changing primitive: transfers the bearer (clears the OLD bearer to 0 first if `target`
// differs — Studied Mark's literal text, applied tree-wide), clamps 0–5, writes the new bearer + pointer.
async function edhaGnosisSetInsight(owner, target, count) {
  try {
    const n = Math.max(0, Math.min(5, Math.floor(Number(count) || 0)));
    const prevUuid = edhaGnosisBearerUuid(owner);
    if (prevUuid && prevUuid !== target?.uuid) {
      const ref = await fromUuid(prevUuid).catch(() => null);
      const prev = ref?.actor ?? ref;
      if (prev) await edhaGnosisWriteInsight(prev, 0, null);
    }
    if (!target || n <= 0) {
      if (target) await edhaGnosisWriteInsight(target, 0, null);
      try { await owner.unsetFlag("edha-content", "gnothisBearer"); } catch (e) {}
      return 0;
    }
    await edhaGnosisWriteInsight(target, n, { actorId: owner.id, talent: "Gnothis Insight" });
    try { await owner.setFlag("edha-content", "gnothisBearer", target.uuid); } catch (e) {}
    return n;
  } catch (e) { console.error("Edha Content | Gnosis set Insight failed", e); return 0; }
}
async function edhaGnosisAddInsight(owner, target, delta) {
  return edhaGnosisSetInsight(owner, target, edhaGnosisInsightOn(owner, target) + (Number(delta) || 0));
}
async function edhaGnosisClearInsight(owner) { return edhaGnosisSetInsight(owner, null, 0); }

// Whispered HP/conditions/defenses snapshot (never trust-the-player to peek). `cog:false` = Studied
// Mark's own text ("Physical and Spiritual defenses" only); Pack Share's is the full three.
function edhaGnosisRevealLines(target, { cog = true } = {}) {
  const hea = target.system?.resources?.hea;
  const hp = `${Number(hea?.value) || 0}/${Number(hea?.max?.value ?? hea?.max) || 0}`;
  const conds = [...(target.statuses ?? [])].map(s => edhaConditionLabel(s));
  const phy = edhaReadDefense(target, "phy"), cogV = edhaReadDefense(target, "cog"), spi = edhaReadDefense(target, "spi");
  const defParts = [`Physical <strong>${phy ?? "?"}</strong>`];
  if (cog) defParts.push(`Cognitive <strong>${cogV ?? "?"}</strong>`);
  defParts.push(`Spiritual <strong>${spi ?? "?"}</strong>`);
  return `<p>${target.name} — HP <strong>${hp}</strong>; conditions: ${conds.length ? conds.join(", ") : "none"}; defenses — ${defParts.join(", ")}. <span style="opacity:.7">(snapshot at cast — may change.)</span></p>`;
}

/* --- Studied Mark — TAKEOVER: place 2 Insight (clears any prior bearer) + the reveal card ------------ */
async function edhaGnosisStudiedMark(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const targetTok = toks[0]; const target = targetTok?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target a creature for Studied Mark. Nothing spent."); return; }
    if (!edhaDeathInRange(owner, targetTok, "green")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Green). Nothing spent.`); return; }
    if (!edhaConsumeCost(item)) return;
    await edhaGnosisSetInsight(owner, target, 2);
    edhaGnosisCard(owner, null, `<p>📖 <strong>Studied Mark</strong>: ${target.name} bears <strong>2 Insight</strong> (any prior bearer is cleared).</p>${edhaGnosisRevealLines(target, { cog: false })}`, { whisper: true });
  } catch (e) { console.error("Edha Content | Studied Mark failed", e); }
}

/* --- Predatory Strike — armed weapon-hit rider (Warlord's-Advance shape) ------------------------------ */
async function edhaGnosisPredatoryStrikeArm(owner) {
  try {
    await owner.setFlag("edha-content", "predatoryStrikeNext", true);
    edhaGnosisCard(owner, null, `<p>📖 <strong>Predatory Strike</strong>: make a melee or ranged weapon attack — the next hit auto-adds [Tier][Die] Vital per Insight on the target (min 1), then places 1 Insight on it. Don't also roll the card's damage by hand.</p>`);
  } catch (e) { console.error("Edha Content | Predatory Strike arm failed", e); }
}

/* --- Killing Blow / The Final Study — TAKEOVERS: Red vs Physical against your bearer ------------------ */
async function edhaGnosisKillingBlowLike(owner, item, { onceFlag = null } = {}) {
  const bearer = await edhaGnosisBearerOf(owner);
  if (!bearer) { ui.notifications?.warn(`Edha: you have no creature bearing your Insight for ${item.name}. Nothing spent.`); return; }
  if (!edhaConsumeCost(item)) return;
  if (onceFlag) await owner.setFlag("edha-content", onceFlag, true);
  const n = Math.max(1, edhaGnosisInsightOn(owner, bearer));
  const def = edhaReadDefense(bearer, "phy");
  const roll = await edhaRollColorTest(owner, "red");
  const total = Number(roll.total) || 0, ok = def == null ? true : total >= def;
  const formula = item.system?.damage?.formula || EDHA_GNOSIS_RED_DIE;
  const dr = await new Roll(Roll.replaceFormulaData(formula, owner.getRollData(), { missing: "0" })).evaluate();
  const base = Math.max(0, Math.floor(dr.total));
  const amt = ok ? base * n : base;
  if (amt > 0) {
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: bearer.uuid, amount: amt, type: "vital", heal: false }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    else { ui.notifications?.warn(`Edha: a GM must be online to apply ${item.name}'s damage.`); }
  }
  if (ok) await edhaGnosisClearInsight(owner); else await edhaGnosisAddInsight(owner, bearer, -1);
  return { bearer, n, total, def, ok, amt, roll, dr };
}
async function edhaGnosisKillingBlow(owner, item) {
  try {
    const r = await edhaGnosisKillingBlowLike(owner, item); if (!r) return;
    edhaGnosisCard(owner, [r.roll, r.dr], edhaGnosisTestLine(item, r.total, r.def, r.ok)
      + `<p>${r.bearer.name} takes <strong>${r.amt}</strong> vital${r.ok ? ` (${r.n} Insight, all removed)` : " (1 Insight removed)"}.</p>`);
  } catch (e) { console.error("Edha Content | Killing Blow failed", e); }
}
async function edhaGnosisFinalStudy(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "finalStudyUsed")) { ui.notifications?.warn("Edha: The Final Study was already used this scene. Nothing spent."); return; }
    const r = await edhaGnosisKillingBlowLike(owner, item, { onceFlag: "finalStudyUsed" }); if (!r) return;
    let extra = "";
    if (r.ok) {
      const allies = edhaAlliesInAttune(owner, "green").map(t => t.actor).filter(a => a && a !== owner);
      extra = allies.length
        ? `<p>Each ally in Attunement Range may immediately make a <strong>free Strike</strong> against any enemy within reach (player-executed): ${allies.map(a => a.name).join(", ")}.</p>`
        : `<p style="opacity:.8">No allies in Attunement Range for the free Strike.</p>`;
    }
    edhaGnosisCard(owner, [r.roll, r.dr], edhaGnosisTestLine(item, r.total, r.def, r.ok)
      + `<p>${r.bearer.name} takes <strong>${r.amt}</strong> vital${r.ok ? ` (${r.n} Insight, all removed)` : " (1 Insight removed)"}.</p>` + extra);
  } catch (e) { console.error("Edha Content | The Final Study failed", e); }
}

/* --- Accumulate — start-of-turn tick (the damage→Inv clause is a data-side marked-watch event) ------- */
async function edhaGnosisAccumulateTick(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curActor = combat.combatant?.actor; if (!curActor || !edhaOwnsTalent(curActor, "Accumulate")) return;
    const bearer = await edhaGnosisBearerOf(curActor); if (!bearer) return;
    const btok = edhaCasterToken(bearer);
    if (!edhaDeathInRange(curActor, btok, "green")) return;
    const cur = edhaGnosisInsightOn(curActor, bearer);
    if (cur >= 5) return;
    await edhaGnosisAddInsight(curActor, bearer, 1);
    edhaGnosisCard(curActor, null, `<p>📖 <strong>Accumulate</strong>: +1 Insight on ${bearer.name} (now <strong>${edhaGnosisInsightOn(curActor, bearer)}</strong>).</p>`);
  } catch (e) { console.error("Edha Content | Accumulate tick failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaGnosisAccumulateTick(combat); });

/* --- Pack Share / The Pack — armed ally riders (hand-written, NOT the generic multi-owner dispatch) -- */
async function edhaGnosisPackShareArm(owner) {
  try {
    await owner.setFlag("edha-content", "packShareActive", true);
    const bearer = await edhaGnosisBearerOf(owner);
    const reveal = bearer ? edhaGnosisRevealLines(bearer, { cog: true }) : `<p style="opacity:.8">No creature currently bears your Insight.</p>`;
    // Public, not whispered — Pack Share explicitly extends this knowledge to allies (possibly other
    // players' controlled PCs), so whispering to only the caster would hide it from who needs to see it.
    edhaGnosisCard(owner, null, `<p>📖 <strong>Pack Share</strong> armed for the scene: allies in Attunement Range (Green) deal +Tier vital on attacks against ${bearer ? bearer.name : "the Insight bearer"}, and the first ally to hit it each round places 1 Insight.</p>${reveal}`);
  } catch (e) { console.error("Edha Content | Pack Share arm failed", e); }
}
async function edhaGnosisThePackArm(owner) {
  try {
    await owner.setFlag("edha-content", "thePackActive", true);
    const bearer = await edhaGnosisBearerOf(owner);
    const n = bearer ? edhaGnosisInsightOn(owner, bearer) : 0;
    edhaGnosisCard(owner, null, `<p>📖 <strong>The Pack</strong> armed for the scene: allies in Attunement Range (Green) deal +<strong>${n}</strong> vital (your current Insight count, live) on attacks against ${bearer ? bearer.name : "the Insight bearer"}; the first ally to hit it each round places 1 Insight.</p>`);
  } catch (e) { console.error("Edha Content | The Pack arm failed", e); }
}

/* --- Dealer PRE-pass: Predatory Strike / Hunter's Discipline / Pack Share / The Pack ------------------ */
let _edhaGnosisPredatoryHit = null;   // {ownerId, targetUuid, ts} — carries the armed hit pre → post
function edhaGnosisDealerPre(dealer, target, list) {
  try {
    if (_edhaInTrigger) return;
    const owner = dealer?.actor; if (!owner || owner === target) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;   // a REAL hit only — never a miss

    // Predatory Strike — armed rider; the OWNER's own weapon hit.
    if (dealer.item?.type === "weapon" && owner.getFlag?.("edha-content", "predatoryStrikeNext")) {
      void owner.unsetFlag("edha-content", "predatoryStrikeNext");
      const tal = edhaGnosisTalent(owner, "Predatory Strike");
      const n = Math.max(1, edhaGnosisInsightOn(owner, target));
      const amt = Math.max(0, Math.floor(edhaEvalSync(tal?.system?.damage?.formula || EDHA_GNOSIS_RED_DIE, owner.getRollData()))) * n;
      if (amt > 0) list.push({ amount: amt, type: "vital" });
      _edhaGnosisPredatoryHit = { ownerId: owner.id, targetUuid: target.uuid, ts: Date.now() };
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📖 <strong>Predatory Strike</strong>: +<strong>${amt}</strong> vital (${n} Insight).</p>` });
    }
    // Hunter's Discipline (passive) — the OWNER's own hit on the bearer: +Tier vital.
    if (edhaOwnsTalent(owner, "Hunter's Discipline") && edhaGnosisIsBearer(owner, target)) {
      const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData())) || 1);
      list.push({ amount: tier, type: "vital" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📖 <strong>Hunter's Discipline</strong>: +<strong>${tier}</strong> vital (the hunt continues).</p>` });
    }
    // Pack Share / The Pack (armed) — an ALLY (not the owner) hits the bearer in the arming owner's Green range.
    const otok = edhaCasterToken(owner);
    for (const gOwner of edhaCharacterOwnersOf("Pack Share")) {
      if (gOwner === owner || !gOwner.getFlag?.("edha-content", "packShareActive")) continue;
      if (!edhaGnosisIsBearer(gOwner, target) || !otok || !edhaAllyInAttune(gOwner, otok, "green")) continue;
      const tier = Math.max(1, Math.floor(edhaEvalSync("@tier", gOwner.getRollData())) || 1);
      list.push({ amount: tier, type: "vital" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: gOwner }), content: `<p>📖 <strong>Pack Share</strong> (${gOwner.name}): +<strong>${tier}</strong> vital on ${owner.name}'s hit.</p>` });
    }
    for (const gOwner of edhaCharacterOwnersOf("The Pack")) {
      if (gOwner === owner || !gOwner.getFlag?.("edha-content", "thePackActive")) continue;
      if (!edhaGnosisIsBearer(gOwner, target) || !otok || !edhaAllyInAttune(gOwner, otok, "green")) continue;
      const n = edhaGnosisInsightOn(gOwner, target); if (n <= 0) continue;
      list.push({ amount: n, type: "vital" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: gOwner }), content: `<p>📖 <strong>The Pack</strong> (${gOwner.name}): +<strong>${n}</strong> vital on ${owner.name}'s hit (Insight count).</p>` });
    }
  } catch (e) { console.error("Edha Content | Gnosis dealer pre-pass failed", e); }
}
/* --- Dealer POST-pass: Predatory Strike places 1 Insight; Pack Share / The Pack first-hit gate ------- */
async function edhaGnosisDealerPost(dealer, target) {
  try {
    const owner = dealer?.actor; if (!owner) return;
    if (_edhaGnosisPredatoryHit && _edhaGnosisPredatoryHit.ownerId === owner.id && _edhaGnosisPredatoryHit.targetUuid === target.uuid
        && (Date.now() - _edhaGnosisPredatoryHit.ts) < 15000) {
      _edhaGnosisPredatoryHit = null;
      await edhaGnosisAddInsight(owner, target, 1);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📖 <strong>Predatory Strike</strong>: 1 Insight placed on ${target.name} (now <strong>${edhaGnosisInsightOn(owner, target)}</strong>).</p>` });
    }
    const otok = edhaCasterToken(owner);
    for (const gOwner of edhaCharacterOwnersOf("Pack Share")) {
      if (gOwner === owner || !gOwner.getFlag?.("edha-content", "packShareActive")) continue;
      if (!edhaGnosisIsBearer(gOwner, target) || !otok || !edhaAllyInAttune(gOwner, otok, "green")) continue;
      if (!edhaTriggerAllowed(gOwner, "Pack Share", { oncePerRound: true })) continue;
      await edhaMarkTriggerUsed(gOwner, "Pack Share", { oncePerRound: true });
      await edhaGnosisAddInsight(gOwner, target, 1);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: gOwner }), content: `<p>📖 <strong>Pack Share</strong> (${gOwner.name}): ${owner.name}'s hit places 1 Insight on ${target.name}.</p>` });
    }
    for (const gOwner of edhaCharacterOwnersOf("The Pack")) {
      if (gOwner === owner || !gOwner.getFlag?.("edha-content", "thePackActive")) continue;
      if (!edhaGnosisIsBearer(gOwner, target) || !otok || !edhaAllyInAttune(gOwner, otok, "green")) continue;
      if (!edhaTriggerAllowed(gOwner, "The Pack", { oncePerRound: true })) continue;
      await edhaMarkTriggerUsed(gOwner, "The Pack", { oncePerRound: true });
      await edhaGnosisAddInsight(gOwner, target, 1);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: gOwner }), content: `<p>📖 <strong>The Pack</strong> (${gOwner.name}): ${owner.name}'s hit places 1 Insight on ${target.name}.</p>` });
    }
  } catch (e) { console.error("Edha Content | Gnosis dealer post-pass failed", e); }
}

/* --- On-kill transfer: the shared live→0 HP stamp (Death's preUpdateActor hook) ----------------------- */
function edhaGnosisCandidatesInRange(owner, excludeTok) {
  const otok = edhaCasterToken(owner); if (!otok) return [];
  const ft = edhaAttuneFtColor(owner, "green");
  return edhaTokensWithin(otok, ft).filter(t => t.actor && t.id !== excludeTok?.id && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
}
function edhaGnosisPostTransferCard(owner, sourceName, amount, candidates) {
  try {
    if (!candidates.length) {
      edhaGnosisCard(owner, null, `<p>📖 <strong>${sourceName}</strong>: no creature in Attunement Range to receive the <strong>${amount}</strong> transferred Insight.</p>`, { whisper: true });
      return;
    }
    const rows = candidates.map(t => `<button type="button" class="edha-gnosis-transfer-btn" data-edha-owner="${owner.uuid}" data-edha-target="${t.actor.uuid}" data-edha-amount="${amount}" data-edha-name="${encodeURIComponent(sourceName)}">${t.actor.name}</button>`).join(" ");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>📖 <strong>${sourceName}</strong> — Free Action: place <strong>${amount}</strong> Insight on a new creature in Attunement Range:</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | Gnosis transfer card failed", e); }
}
async function edhaGnosisTransferClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target) return;
    const amount = Number(ds.edhaAmount) || 0;
    await edhaGnosisSetInsight(owner, target, amount);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-gnosis-transfer-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${target.name}`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📖 <strong>${decodeURIComponent(ds.edhaName || "Gnosis")}</strong>: ${target.name} now bears <strong>${amount}</strong> Insight.</p>` });
  } catch (e) { console.error("Edha Content | Gnosis transfer click failed", e); }
}
function edhaGnosisPostAllyBurstCard(owner, allyTokens) {
  try {
    const names = allyTokens.map(t => t.actor.name).join(", ");
    const rows = allyTokens.map(t => `<button type="button" class="edha-gnosis-burst-btn" data-edha-owner="${owner.uuid}" data-edha-ally="${t.actor.uuid}">${t.actor.name} strikes</button>`).join(" ");
    // Public, not whispered — each ally's OWN controller needs to see and click their own button ("any
    // enemy of their choice" is a per-ally decision, possibly a different player than the Gnothis owner).
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>📖 <strong>Death Mark</strong>: each ally in Attunement Range (${names}) deals <strong>[Tier][Die]</strong> Vital (${owner.name}'s dice) to any enemy of their choice. Target the enemy, then click for the ally dealing the blow:</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | Death Mark burst card failed", e); }
}
async function edhaGnosisBurstClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const aref = await fromUuid(ds.edhaAlly).catch(() => null); const ally = aref?.actor ?? aref;
    const target = Array.from(game.user?.targets ?? [])[0]?.actor;
    if (!owner || !ally) return;
    if (!target) { ui.notifications?.warn("Edha: target the enemy, then click."); return; }
    const dr = await new Roll(Roll.replaceFormulaData(EDHA_GNOSIS_RED_DIE, owner.getRollData(), { missing: "0" })).evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: target.uuid, amount: amt, type: "vital", heal: false }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    else { ui.notifications?.warn("Edha: a GM must be online to apply Death Mark's burst."); return; }
    btn.disabled = true; btn.textContent = `✓ ${ally.name} → ${target.name}`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ally }), rolls: [dr], content: `<p>📖 <strong>Death Mark</strong>: ${ally.name} deals <strong>${amt}</strong> vital to ${target.name}.</p>` });
  } catch (e) { console.error("Edha Content | Death Mark burst click failed", e); }
}
Hooks.on("updateActor", async (victim, changes, options) => {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;   // one applier
    const h = options?.edhaHea;
    if (!h || h.new > 0 || h.old <= 0) return;   // only a live→0 crossing counts
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0];
    // Hunter's Discipline — half (rounded down) of the slain's Insight, transferred on click.
    for (const owner of edhaCharacterOwnersOf("Hunter's Discipline")) {
      if (!edhaGnosisIsBearer(owner, victim)) continue;
      const slainCount = edhaGnosisInsightOn(owner, victim);
      const transferAmt = Math.floor(slainCount / 2);
      if (transferAmt > 0) edhaGnosisPostTransferCard(owner, "Hunter's Discipline", transferAmt, edhaGnosisCandidatesInRange(owner, vtok));
    }
    // Death Mark — the FULL slain Insight count, transferred on click, PLUS the ally burst prompt.
    for (const owner of edhaCharacterOwnersOf("Death Mark")) {
      if (!edhaGnosisIsBearer(owner, victim)) continue;
      const slainCount = edhaGnosisInsightOn(owner, victim);
      if (slainCount > 0) edhaGnosisPostTransferCard(owner, "Death Mark", slainCount, edhaGnosisCandidatesInRange(owner, vtok));
      const allies = edhaAlliesInAttune(owner, "green").filter(t => t.actor && t.actor !== owner);
      if (allies.length) edhaGnosisPostAllyBurstCard(owner, allies);
    }
  } catch (e) { console.error("Edha Content | Gnosis on-kill watcher failed", e); }
});

/* --- Knowledge dispatch: takeovers + arm gates + name-based arms -------------------------------------- */
const EDHA_GNOSIS_TAKEOVER = new Set(["Studied Mark", "Killing Blow", "The Final Study"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.name === "Predatory Strike" && edhaOwnsTalent(actor, "Predatory Strike")
        && actor.getFlag?.("edha-content", "predatoryStrikeNext")) { ui.notifications?.warn("Edha: Predatory Strike is already armed — make the attack first."); return false; }
    if (item.name === "Pack Share" && edhaOwnsTalent(actor, "Pack Share")
        && actor.getFlag?.("edha-content", "packShareActive")) { ui.notifications?.warn("Edha: Pack Share is already armed this scene."); return false; }
    if (item.name === "The Pack" && edhaOwnsTalent(actor, "The Pack")
        && actor.getFlag?.("edha-content", "thePackActive")) { ui.notifications?.warn("Edha: The Pack is already armed this scene."); return false; }
    if (!EDHA_GNOSIS_TAKEOVER.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Studied Mark":    void edhaGnosisStudiedMark(actor, item); break;
      case "Killing Blow":    void edhaGnosisKillingBlow(actor, item); break;
      case "The Final Study": void edhaGnosisFinalStudy(actor, item); break;
    }
    return false;   // cancel the system's default use() — costs paid via edhaConsumeCost
  } catch (e) { console.error("Edha Content | Knowledge preUse-hook failed", e); }
});
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || !edhaOwnsTalent(actor, item.name)) return;
    if (item.name === "Predatory Strike") void edhaGnosisPredatoryStrikeArm(actor);
    else if (item.name === "Pack Share") void edhaGnosisPackShareArm(actor);
    else if (item.name === "The Pack") void edhaGnosisThePackArm(actor);
  } catch (e) { console.error("Edha Content | Knowledge useItem-hook failed", e); }
});

/* --- Chat buttons --------------------------------------------------------------------------------------- */
function edhaBindGnosisButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  root.querySelectorAll?.(".edha-gnosis-transfer-btn").forEach(b => b.addEventListener("click", edhaGnosisTransferClick));
  root.querySelectorAll?.(".edha-gnosis-burst-btn").forEach(b => b.addEventListener("click", edhaGnosisBurstClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindGnosisButtons(html));

/* --- Scene cleanup (deleteCombat): Insight + the whole Knowledge state resets ------------------------- */
async function edhaClearGnosisState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["gnothisBearer", "predatoryStrikeNext", "packShareActive", "thePackActive", "finalStudyUsed"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
    }
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      const eff = a.effects?.find(e => e.statuses?.has?.("insight"));
      if (eff) { try { await eff.delete(); } catch (e) {} }
      if (a.flags?.["edha-content"]?.markedBy?.insight) { try { await a.unsetFlag("edha-content", "markedBy.insight"); } catch (e) {} }
    }
  } catch (e) { console.error("Edha Content | clear Gnosis state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearGnosisState(); } catch (e) {} });

/* ============================================================================================
 * ORDER (Tessavain, deity) tree engine (2026-07-03) — the LAST of the 15 trees: declare law
 * (Blue Edicts — prohibition → consequence) + keep faith (White Covenants — pacts → protection).
 * Colors Blue/White; tag prefix "Order (Tessavain)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-03 — the Sovereignty R2 → Knowledge R0 precedent): BLUE backs every
 * Edict-side Attunement Range (Edict placement, Verdict's target, Final Decree's enemy net) and
 * every [Tier][Die] damage payload (all four authored formulas are blue; "+ @attr.int" preserved on
 * Edict + Final Decree ONLY); WHITE backs every Covenant-side range (Covenant proximity, Bear
 * Witness, Shoulder the Oath's reaction range) and the flat "your White" values (= White RANK) —
 * EXCEPT Final Decree's Witness THP die, which is [Tier][Die on WHITE] (a Covenant-side buff, the
 * Sovereign's-Favor precedent, Ben R0/R9). Concord's "your Presence" bakes off the OWNER (the
 * Pack-Share/Death-Mark "your Tier" precedent).
 * NAME COLLISIONS found + root-caused this pass (Ben R10): "Edict" ⊂ Sovereignty's "Edict of the
 * Fallen" and "Concord" ⊂ White's "Concordant Presence" made audit.py's substring silent-card check
 * FALSE-PASS both (100% unwired yet absent from the FAIL list). AUDITOR-side only — engine name
 * matches are exact, nothing misfired at runtime — so the fix is in audit.py (longer-name masking +
 * word boundaries), NOT a rename: "Edict"/"Concord" are load-bearing words in this tree's own cards
 * (unlike the Knowledge capstone, which had nothing referencing it and was renamed).
 * Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 *   • Edicts + Covenants = the tree's signature lists (the Charge/Remains/Foundation worked
 *     pattern): owner flags `edicts` [{id,targetUuid,proh,sealed}] / `covenants` [{id,allyUuid}],
 *     cap = tier each, OLDEST FIZZLES past cap (Ben R1/R2); registered `edict` / `covenant` marker
 *     statuses (the harvested/compelled row); everything clears on deleteCombat ("unviolated
 *     Edicts fade at the end of the scene" — scene = the combat, tree convention).
 *   • VIOLATION MODEL (Ben R1): declaring "it took the prohibited action" is VOLITION (the Kneel/
 *     Absolute-Authority manual-clause precedent) — an owner/GM "⚖ Violated" button on the card —
 *     but the engine WATCHES the three canonical prohibitions and PROMPTS: "move from its space"
 *     (the shared preUpdateToken `edhaPrevPos` stamp → updateToken), "activate Investiture" (a
 *     preUpdateActor inv-value stamp → updateActor, the `edhaHea` shape — Investiture spends ARE
 *     detectable, checked before declaring it manual), "attack <chosen ally>" (the Sovereignty
 *     attack-test watcher shape: cosmere-rpg attack/item roll + synced target). Once the button
 *     fires, the CONSEQUENCE is fully engine-resolved.
 *   • defense test  → Verdict is a preUseItem TAKEOVER rolling Blue (edhaRollColorTest) and gating
 *     on edhaReadDefense(cog) — the Kneel/Killing-Blow dispatch, never trust-the-player.
 *   • opposed skill → Sealed Edict / Verdict's "tests Discipline vs. your Blue" run through
 *     edhaFoeSkillVsColor (skill "dis" — EDHA_SKILL_ATTR gained dis:"wil", verified against
 *     foundry-build.js's own SKILL_ATTR map); NEVER applied on trust.
 *   • damage writes → edhaOrderApplyHits → edhaApplyBurstResults / the burst-apply relay; statuses
 *     → edhaApplyTimedStatus (Disoriented expire:"owner", Weakened expire:"target") / edhaToggleStatus.
 *   • THP/advantage → edhaGrantTempHpCross (keeps-higher, never stacks) + edhaGrantAdvAttack.
 *   • proximity AE  → Covenant's "+1 all defenses while within White range of each other" is a
 *     GM-side watcher-managed AE (the def-buff AE shape; refresh on combatTurnChange + token moves,
 *     debounced — the Civ construct-in-Foundation move-watcher shape). The OWNER wears ONE +1 while
 *     ≥1 partner is in range (pacts don't compound on the same head); an ally covenanted by TWO
 *     different Order PCs wears one +1 per owner (distinct pacts — AEs keyed per owner).
 *   • start of ROUND → Bear Witness needs the pass's ONE new primitive: a round-boundary check on
 *     the existing combatStart/combatTurnChange hooks (everything prior was start-of-YOUR-turn:
 *     Accumulate/Resurgent Growth/Consuming Decay) — extract-ready for future start-of-round cards.
 *   • once-per-round → edhaTriggerAllowed/edhaMarkTriggerUsed (Concord, keyed per ally) +
 *     edhaCoordOPRAllowed/Mark (Shoulder the Oath's Reaction — the Lifeline gate; break-watch spam gate).
 * PRE-STANDARD WIRING: Shoulder the Oath's authored edha-temp-hp event was the documented partial
 * ("the hook grants the targeted ally; apply your own + the damage redirect manually") — REDONE
 * (Ben R4, the Death R6/R7 / Civ R2 / Power R5/R6 process): event removed (deity-order.json
 * events:{}, talent-thp.json row SUPERSEDED), rewired below as the post-damage Reaction card.
 * Wired here (no longer silent — all 9):
 *   • Edict (1 Action, 1 Inv) — TAKEOVER: synced target in Blue range (refused pre-cost),
 *     prohibition picker (move / attack <chosen ally> / activate Investiture / free text) → list
 *     entry + `edict` icon + the card (Violated button; Lawkeeper's GM-reveal line when owned).
 *     Violation: ONE [T][D blue]+Int spirit roll (the item's own formula) + Disoriented until the
 *     start of the owner's next turn; entry consumed; icon cleared unless another Edict/Decree
 *     (any Order owner) still binds the target. Repeat casts on the SAME target are legal
 *     (different prohibitions, each its own entry).
 *   • Covenant (1 Action, 1 Inv) — TAKEOVER: targeted willing ALLY, touch ENFORCED (≤5 ft,
 *     edhaAdjacent — Ben R2), repeat-with-same-ally refused pre-cost → list entry + `covenant`
 *     icon + the proximity AE. Aid at any range within Attunement Range = carded manual (the Fate
 *     Ordained-Ground Aid precedent). "Deliberately attacks the other" = volition: the dealer
 *     pre-pass DETECTS partner-damages-partner and PROMPTS; the Break button dissolves it.
 *   • Bear Witness (passive) — start of each ROUND: every covenanted ally within White range gains
 *     THP = White rank (keeps-higher). Allies only — the owner is not "an ally in a Covenant with you".
 *   • Shoulder the Oath (Reaction, no cost) — post-pass: a covenanted ally LOST HP with the owner in
 *     White range → whispered Reaction card (once/round). Click: owner takes floor(D/2) as the SAME
 *     type (edhaRedirected:true — Devoted-Conduit honest), the ally heals back min(D, floor(D/2) +
 *     White), BOTH gain White-rank THP. Damage fully eaten by Temp HP prompts nothing (the Mantle
 *     precedent); D = HP actually lost.
 *   • Lawkeeper's Eye (passive) — advantage clause WIRED: a defender-keyed pre-roll injector (the
 *     Bulwark-Ground shape, inverted to GRANT): any attacker of the owner's disposition whose
 *     synced target is Edict/Decree-bound by an owner of this talent attacks with advantage.
 *     "While you can see" = owner-judged (no LOS primitive — carded, named backlog).
 *   • Sealed Edict (Free, 1 Inv) — TAKEOVER: seals your most recent unsealed Edict (the
 *     Inevitable-Snare flag-the-last shape; refused pre-cost with none). On that Edict's violation
 *     the engine ALSO rolls the target's Discipline vs your Blue (edhaFoeSkillVsColor); a failure
 *     adds [T][D blue] spirit (its own formula) + Weakened until the end of ITS next turn.
 *   • Verdict (2 Actions, 2 Inv) — TAKEOVER: synced target must be YOUR Edict-bound + in Blue range
 *     (refused pre-cost). ONE engine Blue roll vs Cognitive: success → that Edict resolves through
 *     the SAME violation resolver (damage + Disoriented + Sealed rider, consumed), then each OTHER
 *     enemy within 10 ft rolls Discipline vs your Blue — failures take ONE shared [T][D blue]
 *     spirit roll + Disoriented until the start of your next turn. Failure → card, cost spent.
 *   • Concord (2 Actions, 2 Inv) — TAKEOVER: refused pre-cost with zero Covenants or already formed
 *     (`concordActive`, scene). Aid-grant Free Action = carded manual. Each covenanted ally's FIRST
 *     damaging hit on an enemy each round gains +owner's Presence, same type as the hit (Ben R8;
 *     the rider rides damage application, so a clean miss leaves it armed for the next hit),
 *     once/round per ally, the owner's own attacks excluded.
 *   • Final Decree (3 Actions, 3 Inv, capstone) — TAKEOVER: once/scene (`finalDecreeUsed`), refused
 *     pre-cost. Prohibition picker; SNAPSHOTS every enemy in Blue range as decree-bound (`edict`
 *     icon, NOT counted vs the Edict cap — "as if bound", not sustained) + every covenanted ally as
 *     a Witness. Watchers prompt; the button fires with the targeted violator: (1) EVERY active
 *     Edict resolves individually — own roll, own target, own Sealed rider, all consumed (Ben R9.1,
 *     the literal reading); (2) ONE shared [T][D white] roll → THP to every Witness (keeps-higher)
 *     + advantage on its next attack test; (3) ONE shared [T][D blue]+Int spirit roll to each enemy
 *     within 10 ft of the violator — violator INCLUDED (the Magnum-Opus R7a precedent); decree ends.
 * Multi-owner / stacking (second-pass checked — the Knowledge R9–R11 lesson): per-owner lists (the
 * shared `edict` icon clears only when NO owner's law still binds); Lawkeeper + Kneel advantage
 * don't compound (advantage is binary); a Verdict resolution and a watcher prompt can't double-fire
 * (the resolver consumes the list entry first — a stale button warns and no-ops); Concord's
 * once-per-round is per-owner-per-ally; Bear Witness / Shoulder THP keep-higher; Final Decree's
 * batch skips already-dead Edict targets (entry still consumed).
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Line-of-sight for Lawkeeper's "while you can see" — edhaCanSee (hidden target / sight-wall
 *     ray, deterministic on every client) gates the advantage injector; darkness stays GM-judged.
 *   • The voluntary-vs-forced movement stamp — engine movers stamp options.edhaForced via
 *     edhaMoveTokenTo + the move-token relay; the move watcher SKIPS stamped moves (a push is not
 *     "taking the action") and still PROMPT-not-fires on unstamped ones (walks / GM hand-drags).
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Lawkeeper's Eye's "learn the bound character's intended action" — an NPC's intent is not data
 *     anywhere in Foundry, so no hook can ever exist (RECLASSIFIED from backlog → manual with Fate's
 *     Read the Threads, Ben-approved 2026-07-03c); the Edict card carries the GM-reveal line.
 *   • Covenant/Concord's Aid grants (no hook can take another creature's action — prompt cards);
 *     the ally's "willing"-ness; Edict prohibitions beyond the three canonical kinds (free-text
 *     declarations are watched by no hook — the Violated button covers them).
 *   • CONTEST-EXEMPT: none — every test in this tree is engine-rolled: Verdict's Blue vs Cognitive
 *     via edhaReadDefense, and both Discipline-vs-your-Blue clauses via edhaFoeSkillVsColor ("dis").
 * ============================================================================================ */

const EDHA_ORDER_BLUE_DIE = "(@tier)d(2 * @skills.blue.rank + 2)";
const EDHA_ORDER_WHITE_DIE = "(@tier)d(2 * @skills.white.rank + 2)";

function edhaOrderCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}
function edhaOrderTalent(owner, name) { return owner?.items?.find(i => edhaIsTalent(i) && i.name === name) ?? null; }
function edhaOrderTokenOf(actorUuid) { return (canvas?.tokens?.placeables ?? []).find(t => t.actor?.uuid === actorUuid) ?? null; }
function edhaOrderTier(owner) { return Math.max(1, Math.floor(edhaEvalSync("@tier", owner.getRollData?.() ?? {})) || 1); }
function edhaGetEdicts(owner) { return owner?.getFlag?.("edha-content", "edicts") ?? []; }
function edhaGetCovenants(owner) { return owner?.getFlag?.("edha-content", "covenants") ?? []; }
async function edhaOrderApplyHits(owner, hits) {
  if (!hits?.length) return;
  const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
  if (game.user?.isGM) await edhaApplyBurstResults(payload);
  else { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply the damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
}

/* --- The shared `edict` bound-marker: set on bind, cleared only when NO owner's law still binds ----- */
function edhaOrderStillBound(actorUuid) {
  for (const owner of edhaCharacterOwnersOf("Edict"))
    if (edhaGetEdicts(owner).some(e => e.targetUuid === actorUuid)) return true;
  for (const owner of edhaCharacterOwnersOf("Final Decree"))
    if ((owner.getFlag?.("edha-content", "decree")?.bound ?? []).includes(actorUuid)) return true;
  return false;
}
async function edhaOrderRefreshBoundIcon(target) {
  try {
    if (!target) return;
    const want = edhaOrderStillBound(target.uuid);
    const has = !!target.statuses?.has?.("edict");
    if (want && !has) await edhaToggleStatus(target, "edict", true);
    if (!want && has) await edhaToggleStatus(target, "edict", false);
  } catch (e) {}
}

/* --- The prohibition picker (Edict + Final Decree): three canonical kinds + free text --------------- */
const EDHA_ORDER_PROH_LABEL = { move: "move from its space", invest: "activate Investiture" };
function edhaOrderPickProhibition(owner, title) {
  return new Promise((resolve) => {
    const otok = edhaCasterToken(owner); const disp = otok?.document?.disposition ?? 1;
    const allies = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t.actor !== owner && (t.document?.disposition ?? 1) === disp);
    const opts = allies.map(t => `<option value="${t.actor.uuid}">${t.name}</option>`).join("");
    new Dialog({
      title: title || "Edict — declare ONE prohibited action",
      content: `<form>
        <p><label><input type="radio" name="edhaProhKind" value="move" checked> Move from its space</label></p>
        <p><label><input type="radio" name="edhaProhKind" value="attack"> Attack a chosen ally:</label> <select name="edhaProhAlly">${opts || `<option value="">(no allied tokens)</option>`}</select></p>
        <p><label><input type="radio" name="edhaProhKind" value="invest"> Activate Investiture</label></p>
        <p><label><input type="radio" name="edhaProhKind" value="other"> Other:</label> <input type="text" name="edhaProhText" placeholder="describe the prohibited action" style="width:100%"></p>
      </form>`,
      buttons: {
        ok: {
          label: "Declare", callback: (h) => {
            const el = h[0] ?? h;
            const kind = el.querySelector("[name=edhaProhKind]:checked")?.value || "other";
            const allyUuid = kind === "attack" ? (el.querySelector("[name=edhaProhAlly]")?.value || null) : null;
            const allyName = allyUuid ? (allies.find(t => t.actor.uuid === allyUuid)?.name ?? "the chosen ally") : null;
            const custom = (el.querySelector("[name=edhaProhText]")?.value || "").trim();
            const text = kind === "attack" ? `attack ${allyName}` : (EDHA_ORDER_PROH_LABEL[kind] || custom || "the declared action");
            resolve({ kind, allyUuid, text });
          },
        },
        cancel: { label: "Cancel", callback: () => resolve(null) },
      }, default: "ok", close: () => resolve(null),
    }).render(true);
  });
}

/* --- Edict — place a prohibition (takeover); the consequence fires via the shared resolver ---------- */
async function edhaOrderEdict(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const target = toks[0]?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target the character for Edict. Nothing spent."); return; }
    if (!edhaDeathInRange(owner, toks[0], "blue")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Blue). Nothing spent.`); return; }
    const proh = await edhaOrderPickProhibition(owner);
    if (!proh) return;                                        // cancelled — nothing spent
    if (!edhaConsumeCost(item)) return;
    const list = foundry.utils.deepClone(edhaGetEdicts(owner));
    const entry = { id: foundry.utils.randomID(), targetUuid: target.uuid, targetName: target.name, proh, sealed: false };
    list.push(entry);
    let fizzled = null;
    while (list.length > edhaOrderTier(owner)) fizzled = list.shift();   // cap = tier; oldest fizzles (Ben R1)
    await owner.setFlag("edha-content", "edicts", list);
    await edhaToggleStatus(target, "edict", true);
    if (fizzled) {
      const fref = await fromUuid(fizzled.targetUuid).catch(() => null); const fa = fref?.actor ?? fref;
      if (fa) await edhaOrderRefreshBoundIcon(fa);
      edhaOrderCard(owner, null, `<p>⚖️ The oldest Edict (${fizzled.targetName}: "<em>${fizzled.proh.text}</em>") fades — you sustain at most ${edhaOrderTier(owner)} (tier).</p>`, { whisper: true });
    }
    const lawkeeper = edhaOwnsTalent(owner, "Lawkeeper's Eye")
      ? `<p>👁️ <strong>Lawkeeper's Eye</strong>: the GM reveals ${target.name}'s intended action on its next turn (no AI-intent hook — GM narrates); you and your allies have <strong>advantage</strong> on attack tests against it while you can see it (auto — hidden/wall LOS checked; darkness GM-judged).</p>` : "";
    const sealNote = edhaOwnsTalent(owner, "Sealed Edict")
      ? `<p style="opacity:.8">You may use <strong>Sealed Edict</strong> (Free Action, 1 Inv) to notarize it.</p>` : "";
    edhaOrderCard(owner, null,
      `<p>⚖️ <strong>Edict</strong> — ${owner.name} binds <strong>${target.name}</strong>: it must not <strong>${proh.text}</strong>. `
      + `First violation: <strong>[Tier][Die]+Int spirit</strong> + Disoriented until the start of ${owner.name}'s next turn; the Edict is then consumed. Unviolated Edicts fade at scene end.</p>${lawkeeper}${sealNote}`
      + `<button type="button" class="edha-order-btn" data-edha-action="violated" data-edha-owner="${owner.uuid}" data-edha-edict="${entry.id}">⚖ Violated — resolve the Edict</button>`);
  } catch (e) { console.error("Edha Content | Edict failed", e); }
}

/* --- The violation resolver (shared: the Violated button, Verdict, Final Decree's batch) ------------ */
async function edhaOrderResolveViolation(owner, edictId, { via = "declared violation" } = {}) {
  try {
    const list = foundry.utils.deepClone(edhaGetEdicts(owner));
    const idx = list.findIndex(e => e.id === edictId);
    if (idx < 0) { ui.notifications?.info("Edha: that Edict is no longer active."); return false; }
    const [e] = list.splice(idx, 1);                          // consume FIRST — a racing second click no-ops
    await owner.setFlag("edha-content", "edicts", list);
    const tref = await fromUuid(e.targetUuid).catch(() => null); const target = tref?.actor ?? tref;
    if (!target) { edhaOrderCard(owner, null, `<p>⚖️ The Edict on ${e.targetName} resolves — the target is gone; the Edict is consumed.</p>`); return true; }
    const alive = (Number(target.system?.resources?.hea?.value) || 0) > 0;
    const tal = edhaOrderTalent(owner, "Edict");
    const dr = await new Roll(Roll.replaceFormulaData(tal?.system?.damage?.formula || (EDHA_ORDER_BLUE_DIE + " + @attr.int"), owner.getRollData(), { missing: "0" })).evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    if (alive && amt > 0) await edhaOrderApplyHits(owner, [{ actorUuid: target.uuid, amount: amt, type: tal?.system?.damage?.type || "spirit", heal: false }]);
    if (alive) await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
    edhaOrderCard(owner, [dr], `<p>⚖️ <strong>Edict violated</strong> (${via}) — ${target.name} broke "<em>${e.proh.text}</em>": <strong>${amt}</strong> spirit + <strong>Disoriented</strong> until the start of ${owner.name}'s next turn. The Edict is consumed.</p>`);
    if (e.sealed && alive) await edhaOrderSealedRider(owner, target);
    await edhaOrderRefreshBoundIcon(target);
    return true;
  } catch (e2) { console.error("Edha Content | Edict violation resolve failed", e2); return false; }
}
// Sealed Edict's rider: the violator tests Discipline vs your Blue (engine rolls the foe) — never trusted.
async function edhaOrderSealedRider(owner, target) {
  try {
    const ttok = edhaOrderTokenOf(target.uuid); if (!ttok) return;
    const stal = edhaOrderTalent(owner, "Sealed Edict");
    await edhaFoeSkillVsColor(owner, [ttok], {
      skill: "dis", label: "Discipline", color: "blue", sourceName: "Sealed Edict", icon: "⚖️",
      failText: "breaks — +[Tier][Die] spirit + Weakened", okText: "holds firm",
      onFail: async (t) => {
        const sr = await new Roll(Roll.replaceFormulaData(stal?.system?.damage?.formula || EDHA_ORDER_BLUE_DIE, owner.getRollData(), { missing: "0" })).evaluate();
        const sa = Math.max(0, Math.floor(sr.total));
        if (sa > 0) await edhaOrderApplyHits(owner, [{ actorUuid: t.actor.uuid, amount: sa, type: stal?.system?.damage?.type || "spirit", heal: false }]);
        await edhaApplyTimedStatus(t.actor, "weakened", { owner, expire: "target" });   // until the end of ITS next turn
        edhaOrderCard(owner, [sr], `<p>⚖️ <strong>Sealed Edict</strong>: ${t.actor.name} takes an additional <strong>${sa}</strong> spirit and is <strong>Weakened</strong> until the end of its next turn.</p>`);
      },
    });
  } catch (e) { console.error("Edha Content | Sealed Edict rider failed", e); }
}

/* --- Sealed Edict — notarize your most recent unsealed Edict (the Inevitable-Snare shape) ----------- */
async function edhaOrderSealEdict(owner, item) {
  try {
    const list = foundry.utils.deepClone(edhaGetEdicts(owner));
    const e = [...list].reverse().find(x => !x.sealed);
    if (!e) { ui.notifications?.warn("Edha: no unsealed Edict to notarize. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    e.sealed = true;
    await owner.setFlag("edha-content", "edicts", list);
    edhaOrderCard(owner, null, `<p>⚖️ <strong>Sealed Edict</strong> — the Edict on <strong>${e.targetName}</strong> ("<em>${e.proh.text}</em>") is notarized: on violation it also tests <strong>Discipline vs your Blue</strong> (engine-rolled) — failure = +[Tier][Die] spirit + Weakened until the end of its next turn.</p>`);
  } catch (e2) { console.error("Edha Content | Sealed Edict failed", e2); }
}

/* --- Covenant — the pact (takeover) + the proximity defense AE + break handling --------------------- */
async function edhaOrderCovenant(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const atok = toks[0]; const ally = atok?.actor;
    const otok = edhaCasterToken(owner);
    if (!ally || ally === owner) { ui.notifications?.warn("Edha: target the willing ally for Covenant. Nothing spent."); return; }
    if (!otok || (atok.document?.disposition ?? 1) !== (otok.document?.disposition ?? 1)) { ui.notifications?.warn(`Edha: ${ally.name} is not an ally. Nothing spent.`); return; }
    if (!edhaAdjacent(otok, atok)) { ui.notifications?.warn(`Edha: Covenant requires touch — move adjacent to ${ally.name} first. Nothing spent.`); return; }
    if (edhaGetCovenants(owner).some(c => c.allyUuid === ally.uuid)) { ui.notifications?.warn(`Edha: you already hold a Covenant with ${ally.name}. Nothing spent.`); return; }
    if (!edhaConsumeCost(item)) return;
    const list = foundry.utils.deepClone(edhaGetCovenants(owner));
    const entry = { id: foundry.utils.randomID(), allyUuid: ally.uuid, allyName: ally.name };
    list.push(entry);
    let fizzled = null;
    while (list.length > edhaOrderTier(owner)) fizzled = list.shift();   // cap = tier; oldest fizzles (Ben R2)
    await owner.setFlag("edha-content", "covenants", list);
    await edhaToggleStatus(ally, "covenant", true);
    if (fizzled) {
      edhaOrderCard(owner, null, `<p>🤝 The oldest Covenant (${fizzled.allyName}) dissolves — you sustain at most ${edhaOrderTier(owner)} (tier).</p>`, { whisper: true });
      await edhaOrderDropCovenantIcon(fizzled.allyUuid);
    }
    edhaOrderCard(owner, null,
      `<p>🤝 <strong>Covenant</strong> — ${owner.name} and <strong>${ally.name}</strong> are bound for the scene: <strong>+1 to all defenses</strong> while within Attunement Range (White) of each other (auto), and each may take the <strong>Aid action</strong> targeting the other at any range within Attunement Range (execute by hand). It ends if either deliberately attacks the other.</p>`
      + `<button type="button" class="edha-order-btn" data-edha-action="break-covenant" data-edha-owner="${owner.uuid}" data-edha-cov="${entry.id}">Break the Covenant</button>`);
    edhaOrderCovenantRefreshSoon();
  } catch (e) { console.error("Edha Content | Covenant failed", e); }
}
async function edhaOrderBreakCovenant(owner, covId, why) {
  try {
    const list = foundry.utils.deepClone(edhaGetCovenants(owner));
    const idx = list.findIndex(c => c.id === covId);
    if (idx < 0) { ui.notifications?.info("Edha: that Covenant is no longer active."); return; }
    const [c] = list.splice(idx, 1);
    await owner.setFlag("edha-content", "covenants", list);
    await edhaOrderDropCovenantIcon(c.allyUuid);
    edhaOrderCard(owner, null, `<p>🤝 The Covenant between ${owner.name} and <strong>${c.allyName}</strong> ends${why ? ` (${why})` : ""}.</p>`);
    edhaOrderCovenantRefreshSoon();
  } catch (e) { console.error("Edha Content | break Covenant failed", e); }
}
// Clear the ally's `covenant` icon — unless ANOTHER Order PC still covenants them (the AE sweep is separate).
async function edhaOrderDropCovenantIcon(allyUuid) {
  try {
    const aref = await fromUuid(allyUuid).catch(() => null); const ally = aref?.actor ?? aref; if (!ally) return;
    const still = edhaCharacterOwnersOf("Covenant").some(o => edhaGetCovenants(o).some(c => c.allyUuid === allyUuid));
    if (!still && ally.statuses?.has?.("covenant")) await edhaToggleStatus(ally, "covenant", false);
  } catch (e) {}
}

/* --- The Covenant proximity AE: +1 all defenses while owner↔ally within White range (GM-side) ------- */
function edhaOrderCovBuffSpec(ownerName, ownerId) {
  return {
    name: `Covenant (${ownerName})`, img: "icons/svg/aura.svg",
    changes: ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 })),
    description: `<p>+1 to all defenses while within Attunement Range (White) of your Covenant partner (Order engine — auto-managed, do not toggle by hand).</p>`,
    flags: { "edha-content": { covBuff: ownerId } },
  };
}
async function edhaOrderRefreshCovenantBuffs() {
  try {
    if (!edhaDefBuffGmGate()) return;
    // Desired state: actorUuid → Set(ownerId). The owner wears ONE +1 while ≥1 partner is in range;
    // an ally covenanted by two different Order PCs wears one +1 per owner (distinct pacts).
    const want = new Map();
    const add = (uuid, oid) => { if (!want.has(uuid)) want.set(uuid, new Set()); want.get(uuid).add(oid); };
    for (const owner of edhaCharacterOwnersOf("Covenant")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      const ft = edhaAttuneFtColor(owner, "white");
      let any = false;
      for (const c of edhaGetCovenants(owner)) {
        const atok = edhaOrderTokenOf(c.allyUuid); if (!atok) continue;
        if (!edhaTokensWithin(otok, ft).some(t => t.id === atok.id)) continue;
        add(c.allyUuid, owner.id); any = true;
      }
      if (any) add(owner.uuid, owner.id);
    }
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      const wantSet = want.get(a.uuid) ?? new Set();
      const have = (a.effects ?? []).filter(e => e.getFlag?.("edha-content", "covBuff"));
      const stale = have.filter(e => !wantSet.has(e.getFlag("edha-content", "covBuff")));
      if (stale.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", stale.map(e => e.id)); } catch (e) {} }
      const haveIds = new Set(have.map(e => e.getFlag("edha-content", "covBuff")));
      for (const oid of wantSet) {
        if (haveIds.has(oid)) continue;
        const owner = game.actors?.get(oid);
        try { await a.createEmbeddedDocuments("ActiveEffect", [edhaOrderCovBuffSpec(owner?.name ?? "?", oid)]); } catch (e) {}
      }
    }
  } catch (e) { console.error("Edha Content | Covenant proximity refresh failed", e); }
}
let _edhaOrderCovTimer = null;
function edhaOrderCovenantRefreshSoon() {
  try {
    if (_edhaOrderCovTimer) clearTimeout(_edhaOrderCovTimer);
    _edhaOrderCovTimer = setTimeout(() => { _edhaOrderCovTimer = null; void edhaOrderRefreshCovenantBuffs(); }, 250);
  } catch (e) {}
}
Hooks.on("combatTurnChange", () => { if (edhaDefBuffGmGate()) edhaOrderCovenantRefreshSoon(); });
Hooks.on("updateToken", (tokenDoc, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (changed?.x === undefined && changed?.y === undefined) return;
    edhaOrderCovenantRefreshSoon();
  } catch (e) {}
});
Hooks.on("updateActor", (actor, changes) => {   // a player's covenant create/break lands GM-side via this
  try {
    if (!edhaDefBuffGmGate()) return;
    if (foundry.utils.getProperty(changes, "flags.edha-content.covenants") === undefined) return;
    edhaOrderCovenantRefreshSoon();
  } catch (e) {}
});

/* --- Bear Witness — the engine's FIRST start-of-ROUND consumer (round boundary on core hooks) ------- */
const _edhaOrderRoundSeen = new Map();   // combat.id → last round handled (module-local; re-stamped on reload)
async function edhaOrderRoundTick(combat) {
  try {
    if (!edhaDefBuffGmGate()) return;
    combat = combat || game.combat; if (!combat?.started) return;
    const round = combat.round ?? 1;
    const seen = _edhaOrderRoundSeen.get(combat.id);
    if (seen === round) return;
    _edhaOrderRoundSeen.set(combat.id, round);
    if (seen === undefined && round > 1) return;              // mid-combat reload — stamp only, never double-grant
    for (const owner of edhaCharacterOwnersOf("Bear Witness")) {
      const white = edhaColorRank(owner, "white"); if (white <= 0) continue;
      const covs = edhaGetCovenants(owner); if (!covs.length) continue;
      const granted = [];
      for (const c of covs) {
        const atok = edhaOrderTokenOf(c.allyUuid); if (!atok?.actor) continue;
        if ((Number(atok.actor.system?.resources?.hea?.value) || 0) <= 0) continue;
        if (!edhaAllyInAttune(owner, atok, "white")) continue;
        await edhaGrantTempHpCross(atok.actor, white, "Bear Witness");
        granted.push(atok.actor.name);
      }
      if (granted.length) edhaOrderCard(owner, null, `<p>🕊️ <strong>Bear Witness</strong> (round ${round}): ${granted.join(", ")} gain${granted.length > 1 ? "" : "s"} <strong>${white}</strong> Temp HP (your White).</p>`);
    }
  } catch (e) { console.error("Edha Content | Bear Witness round tick failed", e); }
}
Hooks.on("combatStart", (c) => { try { _edhaOrderRoundSeen.delete(c?.id); } catch (e) {} void edhaOrderRoundTick(c); });
Hooks.on("combatTurnChange", (c) => void edhaOrderRoundTick(c));
Hooks.on("deleteCombat", (c) => { try { _edhaOrderRoundSeen.delete(c?.id); } catch (e) {} });

/* --- Shoulder the Oath — the redone Reaction (post-pass prompt; Ben R4) ----------------------------- */
function edhaOrderShoulderPrompt(victim, dealer, dealtAmt, list, redirected) {
  try {
    if (!edhaDefBuffGmGate() || redirected || dealtAmt <= 0) return;
    const vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0]; if (!vtok) return;
    const dtype = (list ?? []).find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "vital";
    for (const owner of edhaCharacterOwnersOf("Shoulder the Oath")) {
      if (owner === victim || (dealer?.actor && dealer.actor === owner)) continue;
      if (!edhaGetCovenants(owner).some(c => c.allyUuid === victim.uuid)) continue;
      if (!edhaAllyInAttune(owner, vtok, "white")) continue;
      if (!edhaCoordOPRAllowed(owner, "Shoulder the Oath", "_react")) continue;
      const white = edhaColorRank(owner, "white");
      const half = Math.floor(dealtAmt / 2);
      const heal = Math.min(dealtAmt, half + white);
      ChatMessage.create({
        whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🤝 <strong>Shoulder the Oath</strong> — your Covenant ally <strong>${victim.name}</strong> took <strong>${dealtAmt}</strong> ${dtype}. Reaction: take <strong>${half}</strong> of it yourself (same type), ${victim.name} heals back <strong>${heal}</strong> (half + your White), and BOTH of you gain <strong>${white}</strong> Temp HP. (Once per round.)</p>`
          + `<button type="button" class="edha-order-btn" data-edha-action="shoulder" data-edha-owner="${owner.uuid}" data-edha-victim="${victim.uuid}" data-edha-half="${half}" data-edha-heal="${heal}" data-edha-type="${dtype}" data-edha-white="${white}">Use Shoulder the Oath</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | Shoulder the Oath prompt failed", e); }
}

/* --- Lawkeeper's Eye — advantage vs YOUR Edict/Decree-bound synced target (defender-keyed) ---------- */
function edhaOrderLawkeeperAdv(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const t = edhaTargetsOfRoller(actor)[0]; const ta = t?.actor; if (!ta || ta === actor) return;
    if (!ta.statuses?.has?.("edict")) return;                 // fast path: bound by no one
    const atok = edhaCasterToken(actor); if (!atok) return;
    for (const owner of edhaCharacterOwnersOf("Lawkeeper's Eye")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((atok.document?.disposition ?? 1) !== (otok.document?.disposition ?? 1)) continue;   // "you and your allies"
      const bound = edhaGetEdicts(owner).some(e => e.targetUuid === ta.uuid)
        || (owner.getFlag?.("edha-content", "decree")?.bound ?? []).includes(ta.uuid);
      if (!bound) continue;
      if (!edhaCanSee(otok, t)) continue;                       // "while you can see it" — wall LOS (edhaCanSee)
      roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
      const orig = roll.configureDialog?.bind(roll);
      if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
      return;
    }
  } catch (e) { console.error("Edha Content | Lawkeeper advantage pre-roll failed", e); }
}
for (const ctx of ["Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaOrderLawkeeperAdv);

/* --- Verdict — Blue vs Cognitive (engine-rolled), then the 10 ft Discipline court ------------------- */
async function edhaOrderVerdict(owner, item) {
  try {
    const toks = Array.from(game.user?.targets ?? []); const ttok = toks[0]; const target = ttok?.actor;
    if (!target || target === owner) { ui.notifications?.warn("Edha: target the Edict-bound character for Verdict. Nothing spent."); return; }
    const e = edhaGetEdicts(owner).find(x => x.targetUuid === target.uuid);
    if (!e) { ui.notifications?.warn(`Edha: ${target.name} is not bound by one of your Edicts. Nothing spent.`); return; }
    if (!edhaDeathInRange(owner, ttok, "blue")) { ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (Blue). Nothing spent.`); return; }
    if (!edhaConsumeCost(item)) return;
    const def = edhaReadDefense(target, "cog");
    const roll = await edhaRollColorTest(owner, "blue");
    const total = Number(roll.total) || 0, ok = def == null ? true : total >= def;
    edhaOrderCard(owner, [roll], `<p>⚖️ <strong>Verdict</strong> — Blue <strong>${total}</strong> vs ${target.name}'s Cognitive ${def == null ? "?" : def}: <strong>${ok ? "success" : "fail"}</strong>${ok ? "" : " — the court is denied (cost spent)."}</p>`);
    if (!ok) return;
    await edhaOrderResolveViolation(owner, e.id, { via: "Verdict" });
    const foes = edhaEnemyTokensInCircle(owner, ttok.center.x, ttok.center.y, 10).filter(t => t.actor && t.actor !== target);   // "each OTHER enemy"
    if (!foes.length) return;
    const dr = await new Roll(Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_ORDER_BLUE_DIE, owner.getRollData(), { missing: "0" })).evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    edhaOrderCard(owner, [dr], `<p>⚖️ <strong>Verdict</strong> — the court turns on the accomplices (${foes.length} within 10 ft): one shared roll, <strong>${amt}</strong> spirit to each who fails Discipline vs your Blue.</p>`);
    await edhaFoeSkillVsColor(owner, foes, {
      skill: "dis", label: "Discipline", color: "blue", sourceName: "Verdict", icon: "⚖️",
      failText: `fails — ${amt} spirit + Disoriented`, okText: "stands firm",
      onFail: async (t) => {
        if (amt > 0) await edhaOrderApplyHits(owner, [{ actorUuid: t.actor.uuid, amount: amt, type: item.system?.damage?.type || "spirit", heal: false }]);
        await edhaApplyTimedStatus(t.actor, "disoriented", { owner, expire: "owner" });
      },
    });
  } catch (e2) { console.error("Edha Content | Verdict failed", e2); }
}

/* --- Concord — scene arm; the first-attack Presence rider lives in the dealer PRE-pass -------------- */
async function edhaOrderConcord(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "concordActive")) { ui.notifications?.warn("Edha: your Concord is already formed this scene. Nothing spent."); return; }
    if (!edhaGetCovenants(owner).length) { ui.notifications?.warn("Edha: you have no active Covenants to bind into a Concord. Nothing spent."); return; }
    if (!edhaConsumeCost(item)) return;
    await owner.setFlag("edha-content", "concordActive", true);
    const pre = Math.max(0, Math.floor(edhaEvalSync("@attr.pre", owner.getRollData())));
    const names = edhaGetCovenants(owner).map(c => c.allyName).join(", ");
    edhaOrderCard(owner, null,
      `<p>🕊️ <strong>Concord</strong> — for the scene, ${owner.name}'s Covenants (${names}) speak as one:</p>`
      + `<p>• Any Covenant ally may, as a <strong>Free Action</strong> on its turn, grant any other Covenant ally the benefit of the <strong>Aid action</strong> (execute by hand — no hook grants another creature's action).</p>`
      + `<p>• Each Covenant ally's <strong>first attack each round</strong> deals <strong>+${pre}</strong> damage (your Presence, same type as the hit — auto).</p>`);
  } catch (e) { console.error("Edha Content | Concord failed", e); }
}

/* --- The dealer PRE-pass: Concord's rider + the Covenant-break watch (synchronous — list mutation) -- */
function edhaOrderDealerPre(dealer, target, list) {
  try {
    if (_edhaInTrigger) return;
    const da = dealer?.actor; if (!da?.getFlag || da === target) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;
    const dealtType = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "impact";
    for (const owner of edhaCharacterOwnersOf("Concord")) {
      if (!owner.getFlag?.("edha-content", "concordActive")) continue;
      if (da === owner) continue;                                          // "each Covenant ALLY" — not the lawgiver
      if (!edhaGetCovenants(owner).some(c => c.allyUuid === da.uuid)) continue;
      if (!edhaDisposHostile(owner, target)) continue;                     // an attack ON AN ENEMY
      const key = `Concord:${da.id}`; const spec = { oncePerRound: true };
      if (!edhaTriggerAllowed(owner, key, spec)) continue;
      void edhaMarkTriggerUsed(owner, key, spec);
      const pre = Math.max(0, Math.floor(edhaEvalSync("@attr.pre", owner.getRollData())));
      if (pre > 0) {
        list.push({ amount: pre, type: dealtType });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🕊️ <strong>Concord</strong> (${owner.name}): +<strong>${pre}</strong> ${dealtType} on ${da.name}'s first attack this round.</p>` });
      }
    }
    // Covenant break — "deliberately attacks" is a table call: DETECT partner-damages-partner, PROMPT.
    for (const owner of edhaCharacterOwnersOf("Covenant")) {
      for (const c of edhaGetCovenants(owner)) {
        const pair = (da === owner && target.uuid === c.allyUuid) || (da.uuid === c.allyUuid && target === owner);
        if (!pair) continue;
        if (!edhaCoordOPRAllowed(owner, "CovenantWatch", c.id)) continue;  // one prompt per pact per round
        void edhaCoordOPRMark(owner, "CovenantWatch", c.id);
        ChatMessage.create({
          whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<div class="edha-trigger-card"><p>🤝 <strong>Covenant watch</strong>: ${da.name} damaged ${target.name} — if that was a DELIBERATE attack, the Covenant ends (owner-judged; incidental/area damage may not count).</p>`
            + `<button type="button" class="edha-order-btn" data-edha-action="break-covenant" data-edha-owner="${owner.uuid}" data-edha-cov="${c.id}">It was deliberate — break the Covenant</button></div>`,
        });
      }
    }
  } catch (e) { console.error("Edha Content | Order dealer pre-pass failed", e); }
}

/* --- The violation watchers: detect the three canonical prohibitions, PROMPT (never auto-fire) ------ */
const _edhaOrderPrompted = new Map();   // "<ownerId>:<edictId|decree>:<kind>[:<actorId>]" → round tag / ts
function edhaOrderPromptGate(key) {
  const round = game.combat?.round;
  const prev = _edhaOrderPrompted.get(key);
  if (round != null) {
    if (prev === `r${round}`) return false;
    _edhaOrderPrompted.set(key, `r${round}`); return true;
  }
  const now = Date.now();
  if (typeof prev === "number" && now - prev < 30000) return false;
  _edhaOrderPrompted.set(key, now); return true;
}
function edhaOrderPromptViolation(owner, { edictId = null, decree = false, prohText = "", what = "" }) {
  const btn = decree
    ? `<button type="button" class="edha-order-btn" data-edha-action="decree-violated" data-edha-owner="${owner.uuid}">⚖ It violated the Decree — resolve (target the violator first)</button>`
    : `<button type="button" class="edha-order-btn" data-edha-action="violated" data-edha-owner="${owner.uuid}" data-edha-edict="${edictId}">⚖ It violated the Edict — resolve</button>`;
  ChatMessage.create({
    whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>⚖️ <strong>${decree ? "Final Decree" : "Edict"} watch</strong>: ${what} — if that was VOLUNTARY (forced movement/compulsion doesn't count), it just violated "<em>${prohText}</em>".</p>${btn}</div>`,
  });
}
// (a) "move from its space" — rides the shared preUpdateToken edhaPrevPos stamp. Engine-forced
// slides (edha-push, edhaMoveTokenTo — options.edhaForced) are definitively NOT voluntary, so they
// don't even prompt; unstamped moves (walks, GM hand-drags) stay ambiguous → the prompt fires.
Hooks.on("updateToken", (tokenDoc, changed, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!options?.edhaPrevPos) return;
    if (options?.edhaForced) return;
    const mover = tokenDoc?.actor; if (!mover) return;
    void edhaOrderMoveWatch(mover);
  } catch (e) {}
});
async function edhaOrderMoveWatch(mover) {
  try {
    for (const owner of edhaCharacterOwnersOf("Edict")) {
      for (const e of edhaGetEdicts(owner)) {
        if (e.targetUuid !== mover.uuid || e.proh.kind !== "move") continue;
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:move`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${mover.name}</strong> moved from its space` });
      }
    }
    for (const owner of edhaCharacterOwnersOf("Final Decree")) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "move" || !d.bound?.includes(mover.uuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:move:${mover.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${mover.name}</strong> (Decree-bound) moved from its space` });
    }
  } catch (e) { console.error("Edha Content | Order move watch failed", e); }
}
// (b) "activate Investiture" — an inv-value stamp (the edhaHea shape); only a SPEND (decrease) counts.
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    const ni = foundry.utils.getProperty(changes, "system.resources.inv.value");
    if (ni === undefined) return;
    options.edhaOrderInv = { old: Number(actor.system?.resources?.inv?.value) || 0, new: Number(ni) || 0 };
  } catch (e) {}
});
Hooks.on("updateActor", (actor, changes, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const iv = options?.edhaOrderInv;
    if (!iv || iv.new >= iv.old) return;
    void edhaOrderInvestWatch(actor);
  } catch (e) {}
});
async function edhaOrderInvestWatch(spender) {
  try {
    for (const owner of edhaCharacterOwnersOf("Edict")) {
      for (const e of edhaGetEdicts(owner)) {
        if (e.targetUuid !== spender.uuid || e.proh.kind !== "invest") continue;
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:invest`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${spender.name}</strong> spent Investiture` });
      }
    }
    for (const owner of edhaCharacterOwnersOf("Final Decree")) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "invest" || !d.bound?.includes(spender.uuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:invest:${spender.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${spender.name}</strong> (Decree-bound) spent Investiture` });
    }
  } catch (e) { console.error("Edha Content | Order Investiture watch failed", e); }
}
// (c) "attack <chosen ally>" — the Sovereignty roll-watch shape (attack/item test + synced target).
async function edhaOrderAttackWatch(ctx, roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const ta = edhaTargetsOfRoller(roller)[0]?.actor ?? null;
    for (const owner of edhaCharacterOwnersOf("Edict")) {
      for (const e of edhaGetEdicts(owner)) {
        if (e.targetUuid !== roller.uuid || e.proh.kind !== "attack") continue;
        if (e.proh.allyUuid && (!ta || ta.uuid !== e.proh.allyUuid)) continue;   // attacked someone else (or unknown) — no prompt
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:attack`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${roller.name}</strong> made an attack${ta ? ` on <strong>${ta.name}</strong>` : ""}` });
      }
    }
    for (const owner of edhaCharacterOwnersOf("Final Decree")) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "attack" || !d.bound?.includes(roller.uuid)) continue;
      if (d.proh.allyUuid && (!ta || ta.uuid !== d.proh.allyUuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:attack:${roller.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${roller.name}</strong> (Decree-bound) attacked${ta ? ` <strong>${ta.name}</strong>` : ""}` });
    }
  } catch (e) { console.error("Edha Content | Order attack watch failed", e); }
}
for (const ctx of ["attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, (r, s, c) => edhaOrderAttackWatch(ctx, r, s, c));

/* --- Final Decree — the scene-wide law (takeover) + its batch resolution ---------------------------- */
async function edhaOrderFinalDecree(owner, item) {
  try {
    if (owner.getFlag?.("edha-content", "finalDecreeUsed")) { ui.notifications?.warn("Edha: Final Decree is once per scene. Nothing spent."); return; }
    const otok = edhaCasterToken(owner);
    if (!otok) { ui.notifications?.warn("Edha: no token for the caster. Nothing spent."); return; }
    const ft = edhaAttuneFtColor(owner, "blue");
    const foes = edhaTokensWithin(otok, ft).filter(t => t.actor && (t.document?.disposition ?? 1) !== (otok.document?.disposition ?? 1)
      && (Number(t.actor.system?.resources?.hea?.value) || 0) > 0);
    if (!foes.length) { ui.notifications?.warn("Edha: no enemies within your Attunement Range (Blue). Nothing spent."); return; }
    const proh = await edhaOrderPickProhibition(owner, "Final Decree — name ONE prohibited action (binds every enemy in range)");
    if (!proh) return;                                        // cancelled — nothing spent
    if (!edhaConsumeCost(item)) return;
    await owner.setFlag("edha-content", "finalDecreeUsed", true);
    const witnesses = edhaGetCovenants(owner).map(c => ({ uuid: c.allyUuid, name: c.allyName }));
    await owner.setFlag("edha-content", "decree", { proh, bound: foes.map(t => t.actor.uuid), witnesses });
    for (const t of foes) void edhaToggleStatus(t.actor, "edict", true);
    edhaOrderCard(owner, null,
      `<p>⚖️ <strong>FINAL DECREE</strong> — ${owner.name} speaks the law: every enemy in Attunement Range (${foes.map(t => t.name).join(", ")}) must not <strong>${proh.text}</strong>.`
      + (witnesses.length ? ` Witnesses: ${witnesses.map(w => w.name).join(", ")}.` : " (No Covenant allies stand Witness.)")
      + `</p><p>The FIRST violation: every active Edict triggers, every Witness gains [Tier][Die] Temp HP + advantage on its next attack test, and each enemy within 10 ft of the violator takes [Tier][Die]+Int spirit.</p>`
      + `<button type="button" class="edha-order-btn" data-edha-action="decree-violated" data-edha-owner="${owner.uuid}">⚖ Violated — resolve (target the violator first)</button>`);
  } catch (e) { console.error("Edha Content | Final Decree failed", e); }
}
async function edhaOrderResolveDecree(owner, violator) {
  try {
    const d = owner.getFlag?.("edha-content", "decree");
    if (!d) { ui.notifications?.info("Edha: no active Decree."); return; }
    if (!d.bound?.includes(violator.uuid)) { ui.notifications?.warn(`Edha: ${violator.name} is not bound by the Decree — target the violator.`); return; }
    await owner.unsetFlag("edha-content", "decree");          // consume FIRST — a racing second click no-ops
    for (const e of [...edhaGetEdicts(owner)]) await edhaOrderResolveViolation(owner, e.id, { via: "Final Decree" });
    const rolls = [];
    let wLine = "no Witnesses stood";
    if (d.witnesses?.length) {                                // ONE shared [T][D white] roll (Ben R0/R9)
      const wr = await new Roll(Roll.replaceFormulaData(EDHA_ORDER_WHITE_DIE, owner.getRollData(), { missing: "0" })).evaluate();
      rolls.push(wr);
      const thp = Math.max(0, Math.floor(wr.total));
      const names = [];
      for (const w of d.witnesses) {
        const ref = await fromUuid(w.uuid).catch(() => null); const a = ref?.actor ?? ref; if (!a) continue;
        if (thp > 0) await edhaGrantTempHpCross(a, thp, "Final Decree");
        await edhaGrantAdvAttack(a, "Final Decree");
        names.push(a.name);
      }
      if (names.length) wLine = `${names.join(", ")} gain <strong>${thp}</strong> Temp HP + advantage on their next attack test`;
    }
    const tal = edhaOrderTalent(owner, "Final Decree");       // ONE shared [T][D blue]+Int roll, violator INCLUDED (R9/Magnum R7a)
    const dr = await new Roll(Roll.replaceFormulaData(tal?.system?.damage?.formula || (EDHA_ORDER_BLUE_DIE + " + @attr.int"), owner.getRollData(), { missing: "0" })).evaluate();
    rolls.push(dr);
    const amt = Math.max(0, Math.floor(dr.total));
    const vtok = edhaOrderTokenOf(violator.uuid);
    let hitNames = [];
    if (vtok && amt > 0) {
      const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, 10);
      await edhaOrderApplyHits(owner, foes.map(t => ({ actorUuid: t.actor.uuid, amount: amt, type: tal?.system?.damage?.type || "spirit", heal: false })));
      hitNames = foes.map(t => t.name);
    }
    for (const uuid of (d.bound ?? [])) {                     // decree binding ends — clear icons where no real Edict remains
      const ref = await fromUuid(uuid).catch(() => null); const a = ref?.actor ?? ref;
      if (a) await edhaOrderRefreshBoundIcon(a);
    }
    edhaOrderCard(owner, rolls,
      `<p>⚖️ <strong>FINAL DECREE</strong> — <strong>${violator.name}</strong> broke the law ("<em>${d.proh?.text}</em>"): every active Edict has triggered; ${wLine}; ${hitNames.length ? `${hitNames.join(", ")} take <strong>${amt}</strong> spirit (within 10 ft of the violator, violator included)` : "no enemies stood within 10 ft of the violator"}. The Decree is spent.</p>`);
  } catch (e) { console.error("Edha Content | Final Decree resolve failed", e); }
}

/* --- Order dispatch: the six takeovers (exact-name matches — "Edict of the Fallen" / "Concordant
 * Presence" can NOT land here; the audit-side substring collision was fixed in audit.py) ------------- */
const EDHA_ORDER_TAKEOVER = new Set(["Edict", "Covenant", "Sealed Edict", "Verdict", "Concord", "Final Decree"]);
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!EDHA_ORDER_TAKEOVER.has(item.name) || !edhaOwnsTalent(actor, item.name)) return;
    switch (item.name) {
      case "Edict":        void edhaOrderEdict(actor, item); break;
      case "Covenant":     void edhaOrderCovenant(actor, item); break;
      case "Sealed Edict": void edhaOrderSealEdict(actor, item); break;
      case "Verdict":      void edhaOrderVerdict(actor, item); break;
      case "Concord":      void edhaOrderConcord(actor, item); break;
      case "Final Decree": void edhaOrderFinalDecree(actor, item); break;
    }
    return false;   // cancel the system's default use() — costs paid via edhaConsumeCost (cancel → nothing spent)
  } catch (e) { console.error("Edha Content | Order preUse-hook failed", e); }
});

/* --- Chat buttons ------------------------------------------------------------------------------------ */
async function edhaOrderBtnClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    if (!owner.isOwner && !game.user?.isGM) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) resolves this."); return; }
    const action = ds.edhaAction;
    if (action === "violated") {
      btn.disabled = true;
      const ok = await edhaOrderResolveViolation(owner, ds.edhaEdict, { via: "declared violation" });
      btn.textContent = ok ? "⚖ resolved" : "⚖ (already gone)";
    } else if (action === "decree-violated") {
      const violator = Array.from(game.user?.targets ?? [])[0]?.actor;
      if (!violator) { ui.notifications?.warn("Edha: target the violator, then click."); return; }
      btn.disabled = true;
      await edhaOrderResolveDecree(owner, violator);
      btn.textContent = "⚖ resolved";
    } else if (action === "break-covenant") {
      btn.disabled = true;
      await edhaOrderBreakCovenant(owner, ds.edhaCov, "deliberate attack / declared");
      btn.textContent = "broken";
    } else if (action === "shoulder") {
      if (!edhaCoordOPRAllowed(owner, "Shoulder the Oath", "_react")) { ui.notifications?.info("Shoulder the Oath already used this round."); btn.disabled = true; return; }
      const vref = await fromUuid(ds.edhaVictim).catch(() => null); const victim = vref?.actor ?? vref; if (!victim) return;
      await edhaCoordOPRMark(owner, "Shoulder the Oath", "_react");
      btn.disabled = true; btn.textContent = "Oath shouldered";
      const half = Math.max(0, Math.floor(Number(ds.edhaHalf) || 0));
      const heal = Math.max(0, Math.floor(Number(ds.edhaHeal) || 0));
      const white = Math.max(0, Math.floor(Number(ds.edhaWhite) || 0));
      const type = ds.edhaType || "vital";
      if (half > 0) await edhaCrossDamage(owner, half, type, { edhaRedirected: true });
      if (heal > 0) await edhaCrossHeal(victim, heal);
      if (white > 0) { await edhaGrantTempHpCross(owner, white, "Shoulder the Oath"); await edhaGrantTempHpCross(victim, white, "Shoulder the Oath"); }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🤝 <strong>Shoulder the Oath</strong>: ${owner.name} takes <strong>${half}</strong> ${type} in ${victim.name}'s place; ${victim.name} heals <strong>${heal}</strong>; both gain <strong>${white}</strong> Temp HP.</p>` });
    }
  } catch (e) { console.error("Edha Content | Order button failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-order-btn").forEach(b => b.addEventListener("click", edhaOrderBtnClick));
});

/* --- Scene cleanup (deleteCombat): the whole Order state resets --------------------------------------- */
async function edhaClearOrderState() {
  try {
    if (!game.user?.isGM) return;
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      for (const key of ["edicts", "covenants", "concordActive", "finalDecreeUsed", "decree"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { await a.unsetFlag("edha-content", key); } catch (e) {} }
      }
    }
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      if (a.statuses?.has?.("edict")) { try { await a.toggleStatusEffect?.("edict", { active: false }); } catch (e) {} }
      if (a.statuses?.has?.("covenant")) { try { await a.toggleStatusEffect?.("covenant", { active: false }); } catch (e) {} }
      const buffs = (a.effects ?? []).filter(e => e.getFlag?.("edha-content", "covBuff"));
      if (buffs.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", buffs.map(e => e.id)); } catch (e) {} }
    }
    _edhaOrderPrompted.clear();
  } catch (e) { console.error("Edha Content | clear Order state failed", e); }
}
Hooks.on("deleteCombat", () => { try { if (game.user?.isGM) void edhaClearOrderState(); } catch (e) {} });

/* ============================================================================================
 * GREEN / TERRITORY tree engine (2026-06-16) — difficult terrain as an ENFORCED map Region.
 * "Difficult terrain" = a Foundry v13 Region carrying the NATIVE `modifyMovementCost` behavior
 * (walk ×2 = real engine-enforced movement cost) + a player-visible Drawing + an ownership tag
 * (flags.edha-content.terrain = {ownerUuid, color}) so "YOUR terrain" is queryable. If the creator
 * owns Thorn Field, the SAME Region also gets the edha-content.hazard behavior (½[Tier][Die] keen on
 * enter / turn-start) — Thorn Field rides on terrain created by its owners (Ben, 06-16). Creators:
 * Green Draw Mana + Sudden Growth. Membership talents: Apex Predator (≥3 enemies in → advantage on
 * Physical tests), Pack Sense (an ally attacks a target in → +Green mod), Spreading Roots (a turn ends
 * in → expand).
 * Wired via contest core (reuses edhaQueueContest / edhaRollOpposedSkill / edhaReadDefense):
 *   • Grasping Vines — Green vs Physical defense (static); success → Restrained (maintain by 1 Inv/turn).
 *   • Territorial Instinct — Green vs Survival (opposed roll, Reaction); success → Immobilized (timed).
 * ENGINE-mostly; the data-side bits (pack rebuild) are Apex Predator's data-fix, Sudden Growth's
 * edha-burst event, and Thorn Field's event removal.
 * Manual by nature (no Foundry hook): none in this specialty.
 * ============================================================================================ */

// GM-side: create ONE green difficult-terrain Region (enforced walk ×2 + owner tag + optional Thorn-Field
// keen) plus its player-visible drawing. Returns the Region (or null). All Region writes are GM-only, so
// the player paths relay here via the burst-apply / green-terrain socket actions.
async function edhaCreateGreenTerrain(owner, scene, cx, cy, sizeFt) {
  try {
    if (!owner || !scene) return null;
    const gd = scene.grid?.distance || 5;
    // SQUARE region (07-12 rework — Ben: Green terrain follows Pyre's lead) — sizeFt square, snapped.
    const sq = edhaSnapCellRect(scene, cx, cy, Math.max(1, Math.round(Number(sizeFt) / gd)));
    const hasThorn = edhaOwnsTalent(owner, "Thorn Field");
    const behaviors = [{ type: "modifyMovementCost", name: "Difficult Terrain", system: { difficulties: { walk: 2 } } }];
    if (hasThorn) {   // Thorn Field (passive): terrain you create also deals ½[Tier][Die] keen on enter / turn-start.
      const baked = Roll.replaceFormulaData("floor((@tier)d(2 * @skills.green.rank + 2) / 2)", owner.getRollData(), { missing: "0" });
      behaviors.push({ type: "edha-content.hazard", name: "Thorn Field", system: { damageFormula: baked, damageType: "keen", sourceName: `Thorn Field — ${owner.name}` } });
    }
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Difficult Terrain`, color: EDHA_COLOR_HEX.green,
      shapes: [{ type: "rectangle", x: sq.x, y: sq.y, width: sq.w, height: sq.h, rotation: 0, hole: false }],
      behaviors,
      flags: { "edha-content": { hazard: hasThorn, scope: "scene", terrain: { ownerUuid: owner.uuid, color: "green" } } },
    }]);
    if (region) await edhaSquareVisual(scene, sq.x, sq.y, sq.w, sq.h, EDHA_COLOR_HEX.green, region.id, hasThorn ? "🌿 Thorn Field" : "🌿 Difficult Terrain");
    return region ?? null;
  } catch (e) { console.error("Edha Content | create green terrain failed", e); return null; }
}
// Player → GM relay to drop green terrain (Green Draw Mana, used by a player who can't write Regions).
async function edhaDropGreenTerrain(owner, scene, cx, cy, sizeFt) {
  if (game.user?.isGM) return edhaCreateGreenTerrain(owner, scene, cx, cy, sizeFt);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to place difficult terrain."); return null; }
  try { game.socket.emit("module.edha-content", { action: "green-terrain", payload: { ownerUuid: owner.uuid, sceneId: scene.id, cx, cy, sizeFt } }); } catch (e) {}
  return null;
}

/* --- "Your difficult terrain" membership (the Territory spine) ----------------------------------- */
function edhaOwnedTerrainRegions(owner, scene) {
  scene = scene || canvas?.scene; if (!owner || !scene) return [];
  return (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "terrain")?.ownerUuid === owner.uuid);
}
function edhaPointInRegion(region, x, y) {
  for (const s of (region.shapes ?? [])) {
    if (s.hole) continue;
    if (s.type === "circle") { if (Math.hypot(x - s.x, y - s.y) <= (Number(s.radius) || 0)) return true; }
    else if (s.type === "rectangle" && !(Number(s.rotation) || 0)) {   // square terrain (07-12) — no canvas object needed
      if (x >= s.x && x <= s.x + (Number(s.width) || 0) && y >= s.y && y <= s.y + (Number(s.height) || 0)) return true;
    }
    else { try { if (region.object?.testPoint?.({ x, y }, 0)) return true; } catch (e) {} }
  }
  return false;
}
function edhaTokenInOwnedTerrain(tok, owner) {
  if (!tok) return false;
  return edhaOwnedTerrainRegions(owner, tok.scene ?? canvas?.scene).some(r => edhaPointInRegion(r, tok.center?.x ?? 0, tok.center?.y ?? 0));
}
function edhaEnemiesInOwnedTerrain(owner) {
  const ot = edhaCasterToken(owner); const disp = ot?.document?.disposition ?? 1;
  const regions = edhaOwnedTerrainRegions(owner);
  if (!regions.length) return [];
  return (canvas?.tokens?.placeables ?? []).filter(t => t.actor
    && (t.document?.disposition ?? 1) !== disp
    && (t.actor?.system?.resources?.hea?.value ?? 1) > 0
    && regions.some(r => edhaPointInRegion(r, t.center?.x ?? 0, t.center?.y ?? 0)));
}
function edhaSameDisposition(owner, tok) {
  const ot = edhaCasterToken(owner); if (!ot || !tok || ot.id === tok.id) return false;
  return (tok.document?.disposition ?? 1) === (ot.document?.disposition ?? 1);
}
function edhaGreenMod(actor) { return Math.floor(edhaEvalSync("@skills.green.mod", actor.getRollData())) || 0; }

/* --- Apex Predator — ≥3 enemies in your terrain → advantage on your Physical (str/spd) tests ------ */
const EDHA_PHYS_ATTRS = new Set(["str", "spd"]);
function edhaPhysTest(roll, config) { return EDHA_PHYS_ATTRS.has(roll?.data?.skill?.attribute ?? config?.defaultAttribute); }
function edhaApexPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    if (roll?.options?.advantageMode === "disadvantage") return;       // don't stomp an active disadvantage (e.g. Weakened)
    if (!edhaOwnsTalent(actor, "Apex Predator") || !edhaPhysTest(roll, config)) return;
    if (edhaEnemiesInOwnedTerrain(actor).length < 3) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | Apex Predator pre-roll failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) { const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1); Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaApexPreRoll); }

/* --- Pack Sense — an ally attacks a target in your terrain → spend 1 Inv to add your Green mod ----- */
// The roller's target travels via synced user targets (target pips are broadcast to all clients).
function edhaTargetsOfRoller(roller) {
  const toks = new Set();
  for (const u of (game.users ?? [])) { if (!u.active || !roller.testUserPermission?.(u, "OWNER")) continue; for (const t of (u.targets ?? [])) toks.add(t); }
  return [...toks];
}
async function edhaPackSenseWatch(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller) ?? roller.getActiveTokens?.()[0]; if (!rtok) return;
    const targets = edhaTargetsOfRoller(roller); if (!targets.length) return;
    for (const owner of edhaCharacterOwnersOf("Pack Sense")) {
      if (owner === roller || !edhaSameDisposition(owner, rtok)) continue;        // the attacker is your ally
      if (!targets.some(t => edhaTokenInOwnedTerrain(t, owner))) continue;        // attacking a creature in your terrain
      const mod = edhaGreenMod(owner);
      edhaPostCoordReactionCard(owner, "Pack Sense", roller, {
        costs: [{ resource: "inv", value: 1 }],
        prompt: `${roller.name} attacks a creature in your difficult terrain. Spend 1 Investiture to add your Green modifier (+${mod}) to their result.`,
        result: `🐺 <strong>Pack Sense</strong> (${owner.name}): +${mod} to ${roller.name}'s attack.`,
      });
    }
  } catch (e) { console.error("Edha Content | Pack Sense watch failed", e); }
}
for (const ctx of ["attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaPackSenseWatch);

/* --- Spreading Roots — a creature ends its turn in your terrain → spend 1 Inv to expand it --------- */
function edhaPostSpreadCard(owner, regionId, sceneId, sizeFt) {
  try {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🌱 <strong>Spreading Roots</strong> — a creature ended its turn in your difficult terrain. Spend 1 Investiture to expand it ${sizeFt} ft.</p>`
        + `<button type="button" class="edha-spread-btn" data-edha-owner="${owner.uuid}" data-edha-region="${regionId}" data-edha-scene="${sceneId}" data-edha-size="${sizeFt}">Expand terrain (−1 Investiture)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Spreading Roots card failed", e); }
}
async function edhaGrowTerrain(sceneId, regionId, sizeFt) {
  try {
    const scene = game.scenes?.get(sceneId); const region = scene?.regions?.get(regionId); if (!region) return;
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const addPx = Math.round((Number(sizeFt) / gd) * gs);
    const shapes = foundry.utils.deepClone(region.shapes ?? []);
    const c = shapes.find(s => s.type === "circle" && !s.hole);
    const r0 = shapes.find(s => s.type === "rectangle" && !s.hole);
    if (c) {                                    // legacy circle terrain
      c.radius = (Number(c.radius) || 0) + addPx;
      await region.update({ shapes });
      const draw = (scene.drawings ?? []).find(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
      if (draw) { const r = c.radius; await draw.update({ x: c.x - r, y: c.y - r, "shape.width": r * 2, "shape.height": r * 2 }); }
    } else if (r0) {                            // square terrain (07-12 rework): grow symmetrically, stays square
      r0.x -= addPx / 2; r0.y -= addPx / 2; r0.width += addPx; r0.height += addPx;
      await region.update({ shapes });
      const draw = (scene.drawings ?? []).find(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
      if (draw) await draw.update({ x: r0.x, y: r0.y, "shape.width": r0.width, "shape.height": r0.height });
    }
  } catch (e) { console.error("Edha Content | grow terrain failed", e); }
}
async function edhaSpreadClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref; if (!owner) return;
    const free = ds.edhaFree === "1";                        // Pyre's turn-end spread costs nothing
    if (!free) {
      const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
      try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - 1) }); } catch (e) {}
    }
    if (game.user?.isGM) await edhaGrowTerrain(ds.edhaScene, ds.edhaRegion, Number(ds.edhaSize));
    else { try { game.socket.emit("module.edha-content", { action: "grow-terrain", payload: { sceneId: ds.edhaScene, regionId: ds.edhaRegion, sizeFt: Number(ds.edhaSize) } }); } catch (e) {} }
    btn.disabled = true; btn.textContent = "Terrain expanded";
    const label = ds.edhaLabel || "Spreading Roots";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>${free ? "🔥" : "🌱"} <strong>${label}</strong> (${owner.name}): the terrain expands ${ds.edhaSize} ft${free ? "" : " (−1 Investiture)"}.</p>` });
  } catch (e) { console.error("Edha Content | terrain-spread click failed", e); }
}
function edhaBindSpreadButtons(html) { const root = html instanceof HTMLElement ? html : html?.[0]; root?.querySelectorAll?.(".edha-spread-btn").forEach(b => b.addEventListener("click", edhaSpreadClick)); }
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindSpreadButtons(html));
// Square-by-square spread (07-12 rework): the GM clicks the adjacent square the fire burns into.
async function edhaSpreadSquareClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    if (!game.user?.isGM) { ui.notifications?.info("Edha: the GM picks the spread square."); return; }
    const pt = await edhaPickPoint(`Click the adjacent square the ${ds.edhaLabel || "terrain"} spreads into (right-click to cancel).`);
    if (!pt) return;
    const grown = await edhaGrowTerrainSquareGM(ds.edhaScene, ds.edhaRegion, pt.x, pt.y);
    if (!grown) return;   // warned already (occupied / not adjacent) — button stays live for a re-pick
    btn.disabled = true; btn.textContent = "✓ Spread";
    ChatMessage.create({ content: `<p>🔥 <strong>${ds.edhaLabel || "Terrain"}</strong> spreads one square.</p>` });
  } catch (e) { console.error("Edha Content | square-spread click failed", e); }
}
// Player extinguish (07-12 rework): the region + its visuals go away; players relay through the GM.
async function edhaExtinguishClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    await edhaRemoveTerrain(ds.edhaScene, ds.edhaRegion);
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
    btn.textContent = "✓ Extinguished";
    ChatMessage.create({ content: `<p>💨 <strong>${ds.edhaLabel || "The terrain"}</strong> is put out.</p>` });
  } catch (e) { console.error("Edha Content | extinguish click failed", e); }
}
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-spread-sq-btn").forEach(b => b.addEventListener("click", edhaSpreadSquareClick));
  root?.querySelectorAll?.(".edha-extinguish-btn").forEach(b => b.addEventListener("click", edhaExtinguishClick));
});
async function edhaSpreadingRootsCheck(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const tdoc = combat.turns?.[prevTurn]?.token; const tok = tdoc?.object; if (!tok) return;   // creature whose turn just ended
    const scene = tok.scene ?? canvas?.scene;
    for (const owner of edhaCharacterOwnersOf("Spreading Roots")) {
      const region = edhaOwnedTerrainRegions(owner, scene).find(r => edhaPointInRegion(r, tok.center?.x ?? 0, tok.center?.y ?? 0));
      if (!region) continue;
      if (!edhaCoordOPRAllowed(owner, "Spreading Roots", "_spread")) continue;     // one offer per owner per round
      await edhaCoordOPRMark(owner, "Spreading Roots", "_spread");
      const sizeFt = EDHA_SIZE_FT[edhaColorRank(owner, "green")] || EDHA_SIZE_FT[1];
      edhaPostSpreadCard(owner, region.id, scene.id, sizeFt);
    }
  } catch (e) { console.error("Edha Content | Spreading Roots check failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaSpreadingRootsCheck(combat); });

/* --- Grasping Vines / Territorial Instinct — engine-resolved contests via the contest core ----------
 * Both talents are explicit OPPOSED tests; wiring mirrors Blue's Redirect Momentum (edhaQueueContest).
 * edhaApplyConditionToTarget remains a shared helper (also called from other paths). */
async function edhaApplyConditionToTarget(owner, statusId, name, { timed = false, note = "" } = {}) {
  const target = Array.from(game.user?.targets ?? [])[0]?.actor;
  if (!target) { ui.notifications?.warn(`Edha: target the enemy before using ${name}.`); return; }
  if (timed) await edhaApplyTimedStatus(target, statusId, { owner, expire: "target" });
  else await edhaToggleStatus(target, statusId, true);
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🌿 <strong>${name}</strong> (${owner.name}): ${target.name} is <strong>${edhaConditionLabel(statusId)}</strong>.${note ? ` <span style="opacity:.8">${note}</span>` : ""}</p>` });
}
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;

    // Grasping Vines — Green vs Physical defense (static). Success → Restrained (maintain by 1 Inv/turn).
    if (item.name === "Grasping Vines" && edhaOwnsTalent(actor, "Grasping Vines")) {
      const t = target0();
      if (!t) {
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🌿 <strong>Grasping Vines</strong> — target the enemy and use again to auto-resolve Green vs its Physical defense (success → Restrained).</p></div>` });
      } else {
        edhaQueueContest(actor, "green", async ({ total }) => {
          const def = edhaReadDefense(t, "phy");
          if (def == null) {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🌿 <strong>Grasping Vines</strong>: could not read ${t.name}'s Physical defense — GM adjudicates.</p>` });
            return;
          }
          const success = total >= def;
          if (success) {
            await edhaToggleStatus(t, "restrained", true);
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🌿 <strong>Grasping Vines</strong>: Green <strong>${total}</strong> ≥ ${t.name}'s Physical defense <strong>${def}</strong> — ${t.name} is <strong>Restrained</strong>. Spend 1 Investiture at the start of each of your turns to maintain the vines.</p>` });
          } else {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🌿 <strong>Grasping Vines</strong>: Green <strong>${total}</strong> &lt; ${t.name}'s Physical defense <strong>${def}</strong> — the vines fail to take hold.</p>` });
          }
        });
      }
    }

    // Territorial Instinct — Green vs Survival (opposed roll, Reaction). Success → Immobilized (timed, expire on target).
    if (item.name === "Territorial Instinct" && edhaOwnsTalent(actor, "Territorial Instinct")) {
      const t = target0();
      if (!t) {
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🌿 <strong>Territorial Instinct</strong> — target the enemy and use again to auto-resolve Green vs its Survival (success → movement 0 this turn).</p></div>` });
      } else {
        edhaQueueContest(actor, "green", async ({ total }) => {
          const opp = await edhaRollOpposedSkill(t, "sur");
          const success = total >= opp;
          if (success) {
            await edhaApplyTimedStatus(t, "immobilized", { owner: actor, expire: "target" });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🌿 <strong>Territorial Instinct</strong>: Green <strong>${total}</strong> ≥ ${t.name}'s Survival <strong>${opp}</strong> — ${t.name} is <strong>Immobilized</strong> (movement 0 this turn).</p>` });
          } else {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🌿 <strong>Territorial Instinct</strong>: Green <strong>${total}</strong> &lt; ${t.name}'s Survival <strong>${opp}</strong> — it breaks free.</p>` });
          }
        });
      }
    }
  } catch (e) { console.error("Edha Content | Territory use-hook failed", e); }
});

/* ============================================================================================
 * GREEN / RESTORATION tree engine (2026-06-16) — the "green-heal" trigger family + injuries.
 * Three talents fire "when you restore health with a Green talent": Resurgent Growth (auto regrowth at
 * the START of YOUR next turn = tier + Green mod, range-checked), Vital Surge (card → 1 Inv → THP =
 * ½[Tier][Die] when the target was below half), Natural Recovery (card → Opportunity → cleanse one of
 * Afflicted/Disoriented/Stunned/Weakened). Detected at the two green heal chokepoints: the applyDamage
 * heal post-pass (Verdant Mend + any heal instance) and the trigger-heal path (Mender's Instinct).
 * Reknit Form deletes an injury Item (2 Inv temporary / 3 Inv permanent). Hardy = data-side +@level
 * max-HP AE (clone). Collected + Verdant Mend already done.
 * ============================================================================================ */
const EDHA_NATREC_CONDITIONS = ["afflicted", "disoriented", "stunned", "weakened"];   // Natural Recovery cleanse set

// Dispatched whenever a Green talent restores health to `target` (healer = the talent owner).
async function edhaGreenHealRiders(healer, target, amount, prevHp) {
  try {
    if (!healer || !target || !(amount > 0)) return;
    if (target !== healer && edhaOwnsTalent(healer, "Resurgent Growth") && edhaSameDisposition(healer, edhaCasterToken(target)))
      await edhaQueueRegrowth(healer, target);                       // heal an ally → regrow at your next turn
    if (edhaOwnsTalent(healer, "Vital Surge")) {                     // target was below half → optional THP
      const maxHp = edhaResVal(target.system?.resources?.hea) || 0;
      if (prevHp != null && maxHp > 0 && prevHp < maxHp / 2) edhaPostVitalSurgeCard(healer, target);
    }
    if (edhaOwnsTalent(healer, "Natural Recovery")) edhaPostNaturalRecoveryCard(healer, target);   // optional cleanse
  } catch (e) { console.error("Edha Content | green-heal riders failed", e); }
}

/* --- Resurgent Growth — queue regrowth, resolve at the owner's next turn start (range-checked) ----- */
async function edhaQueueRegrowth(owner, target) {
  try {
    const list = foundry.utils.deepClone(owner.getFlag("edha-content", "regrowth") ?? []);
    if (!list.some(e => e.targetUuid === target.uuid)) list.push({ targetUuid: target.uuid });
    await owner.setFlag("edha-content", "regrowth", list);
  } catch (e) { /* perms */ }
}
async function edhaResolveRegrowth(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curActor = combat.combatant?.actor; if (!curActor || !edhaOwnsTalent(curActor, "Resurgent Growth")) return;
    const list = curActor.getFlag("edha-content", "regrowth"); if (!list?.length) return;
    const otok = edhaCasterToken(curActor), ft = edhaAttuneFtColor(curActor, "green");
    const amount = Math.max(0, Math.floor(edhaEvalSync("@tier + @skills.green.mod", curActor.getRollData())));
    for (const e of list) {
      const ref = await fromUuid(e.targetUuid).catch(() => null); const t = ref?.actor ?? ref; if (!t) continue;
      const ttok = edhaCasterToken(t);
      if (otok && ttok && !edhaTokensWithin(otok, ft).some(x => x.id === ttok.id)) continue;   // left range → skip
      if (amount > 0) { await edhaCrossHeal(t, amount); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: curActor }), content: `<p>🌿 <strong>Resurgent Growth</strong> (${curActor.name}): ${t.name} regains <strong>${amount}</strong> health.</p>` }); }
    }
    try { await curActor.unsetFlag("edha-content", "regrowth"); } catch (e) {}
  } catch (e) { console.error("Edha Content | resolve regrowth failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaResolveRegrowth(combat); });

/* --- Vital Surge — card: spend 1 Inv to grant THP = ½[Tier][Die] (target was below half) ----------- */
async function edhaGrantTempHpCross(target, amount, source) {
  const final = Math.max(edhaGetTempHp(target)?.value ?? 0, Math.max(0, Math.floor(amount)));   // THP doesn't stack — keep the higher
  if (target.isOwner) { await edhaWriteTempHp(target, final, source); return; }
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to grant Temp HP."); return; }
  try { game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: target.uuid, key: "tempHp", value: { value: final, source: source || "" } } }); } catch (e) {}
}
function edhaPostVitalSurgeCard(owner, target) {
  try {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>💚 <strong>Vital Surge</strong> — ${target.name} was below half HP. Spend 1 Investiture to grant Temp HP = ½[Tier][Die].</p>`
        + `<button type="button" class="edha-vitalsurge-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}">Grant Temp HP (−1 Investiture)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | Vital Surge card failed", e); }
}
async function edhaVitalSurgeClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target) return;
    const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
    try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - 1) }); } catch (e) {}
    const roll = await new Roll("floor((@tier)d(2 * @skills.green.rank + 2) / 2)", owner.getRollData()).evaluate();
    const amt = Math.max(0, Math.floor(roll.total));
    await edhaGrantTempHpCross(target, amt, "Vital Surge");
    btn.disabled = true; btn.textContent = "Temp HP granted";
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: owner }), flavor: `💚 Vital Surge — ${amt} Temp HP → ${target.name} (−1 Investiture).` });
  } catch (e) { console.error("Edha Content | Vital Surge click failed", e); }
}

/* --- Natural Recovery — card: spend an Opportunity to cleanse one condition from the target -------- */
function edhaPostNaturalRecoveryCard(owner, target) {
  try {
    const present = EDHA_NATREC_CONDITIONS.filter(c => [...(target.statuses ?? [])].includes(c));
    if (!present.length) return;
    const rows = present.map(c => `<button type="button" class="edha-natrec-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-status="${c}">${edhaConditionLabel(c)}</button>`).join(" ");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🍃 <strong>Natural Recovery</strong> — spend an Opportunity to remove a condition from ${target.name}:</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | Natural Recovery card failed", e); }
}
async function edhaNaturalRecoveryClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target || !ds.edhaStatus) return;
    await edhaToggleStatus(target, ds.edhaStatus, false);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-natrec-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ cleansed";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🍃 <strong>Natural Recovery</strong> (${owner.name}): removed <strong>${edhaConditionLabel(ds.edhaStatus)}</strong> from ${target.name} (spend an Opportunity).</p>` });
  } catch (e) { console.error("Edha Content | Natural Recovery click failed", e); }
}

/* --- Reknit Form — delete an injury Item (2 Inv temporary / 3 Inv permanent) ----------------------- */
function edhaInjuryIsPermanent(inj) { return String(inj?.system?.type || "").includes("permanent") || /permanent/i.test(inj?.name || ""); }
function edhaPostReknitCard(owner) {
  try {
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? owner;   // touch a creature (default: self)
    const injuries = (target.items ?? []).filter(i => i.type === "injury" && String(i.system?.type || "") !== "death");
    if (!injuries.length) { ui.notifications?.info(`Edha: ${target.name} has no removable injuries.`); return; }
    const rows = injuries.map(inj => {
      const cost = edhaInjuryIsPermanent(inj) ? 3 : 2;
      return `<button type="button" class="edha-reknit-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-injury="${inj.id}" data-edha-cost="${cost}">${inj.name} (−${cost} Investiture)</button>`;
    }).join(" ");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🩹 <strong>Reknit Form</strong> — remove an injury from ${target.name} (2 Inv temporary · 3 Inv permanent):</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | Reknit card failed", e); }
}
async function edhaDeleteItemCross(actor, itemId) {
  if (!actor || !itemId) return;
  if (actor.isOwner) { try { await actor.deleteEmbeddedDocuments("Item", [itemId]); } catch (e) {} return; }
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to remove that injury."); return; }
  try { game.socket.emit("module.edha-content", { action: "delete-item", payload: { actorUuid: actor.uuid, itemId } }); } catch (e) {}
}
async function edhaReknitClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const oref = await fromUuid(ds.edhaOwner).catch(() => null); const owner = oref?.actor ?? oref;
    const tref = await fromUuid(ds.edhaTarget).catch(() => null); const target = tref?.actor ?? tref;
    if (!owner || !target) return;
    const cost = Number(ds.edhaCost) || 2;
    const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
    try { await owner.update({ "system.resources.inv.value": Math.max(0, cur - cost) }); } catch (e) {}
    const label = target.items?.get?.(ds.edhaInjury)?.name || "injury";
    await edhaDeleteItemCross(target, ds.edhaInjury);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-reknit-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ healed";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🩹 <strong>Reknit Form</strong> (${owner.name}): removed <strong>${label}</strong> from ${target.name} (−${cost} Investiture).</p>` });
  } catch (e) { console.error("Edha Content | Reknit click failed", e); }
}

function edhaBindRestorationButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  root.querySelectorAll?.(".edha-vitalsurge-btn").forEach(b => b.addEventListener("click", edhaVitalSurgeClick));
  root.querySelectorAll?.(".edha-natrec-btn").forEach(b => b.addEventListener("click", edhaNaturalRecoveryClick));
  root.querySelectorAll?.(".edha-reknit-btn").forEach(b => b.addEventListener("click", edhaReknitClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindRestorationButtons(html));
Hooks.on("cosmere-rpg.useItem", (item) => {
  try { const actor = item?.actor; if (actor && item.name === "Reknit Form" && edhaOwnsTalent(actor, "Reknit Form")) edhaPostReknitCard(actor); }
  catch (e) { console.error("Edha Content | Reknit use-hook failed", e); }
});

/* ============================================================================================
 * GREEN / INSTINCT tree engine (2026-06-16) — pack tactics: advantage-granting, focus-fire, forced
 * movement, a strike window. ENGINE-ONLY / name-based (talents stay events:{}, NO pack rebuild —
 * F5/relaunch). Reusable primitive: `advAttackNext` (advantage on your next attack), a mirror of
 * advTest. Coordinated Hunt + Pack Pressure inject a bonus damage instance in the applyDamage PRE-pass
 * (single call, no recursion).
 * Wired via contest core (reuses edhaQueueContest / edhaRollOpposedSkill):
 *   • Drive the Prey — Green vs Survival (opposed roll); success → Slowed (timed). Forced move-away
 *     and ally Reactive Strikes are GM-narrated (Manual by nature — no movement/reaction hook).
 * Manual by nature (no Foundry hook): Predator's Instinct (track/fear), Natural Order (narrative
 * scene debuff). Packmate's Warning UPGRADED from truly-manual (2026-07-04): the edhaCanSee ward
 * injector applies the +2-defense-vs-unseen as −2 on the qualifying attack roll.
 * ============================================================================================ */

// "Advantage on your next attack" flag (Pack Hunter / Scent the Weak), consumed on the next attack.
async function edhaGrantAdvAttack(actor, source) {
  try {
    if (actor.isOwner) { await actor.setFlag("edha-content", "advAttackNext", source || true); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to grant attack advantage."); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: actor.uuid, key: "advAttackNext", value: source || true } });
    return true;
  } catch (e) { return false; }
}
function edhaAdvAttackPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "advAttackNext")) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | adv-attack pre-roll failed", e); }
}
function edhaAdvAttackConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const src = actor?.getFlag?.("edha-content", "advAttackNext"); if (!src) return;
    void actor.unsetFlag("edha-content", "advAttackNext");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐾 <strong>${typeof src === "string" ? src : "Pack tactics"}</strong> — advantage spent on this attack.</p>` });
  } catch (e) { console.error("Edha Content | adv-attack consume failed", e); }
}
for (const ctx of ["attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaAdvAttackPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaAdvAttackConsume);
}

/* --- Coordinated Hunt — focus-fire tracker (who attacked whom this round; GM-side) ----------------- */
let _edhaFocusFire = { round: -1, byTarget: {} };
function edhaRecordFocusFire(attackerTok, targetToks) {
  const round = game.combat?.round ?? 0;
  if (_edhaFocusFire.round !== round) _edhaFocusFire = { round, byTarget: {} };
  for (const tt of targetToks) (_edhaFocusFire.byTarget[tt.id] ??= new Set()).add(attackerTok.id);
}
function edhaFocusFireSet(targetTok) {
  const round = game.combat?.round ?? 0;
  return (_edhaFocusFire.round === round) ? (_edhaFocusFire.byTarget[targetTok.id] ?? new Set()) : new Set();
}
async function edhaFocusFireWatch(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller); if (!rtok) return;
    const targets = edhaTargetsOfRoller(roller); if (targets.length) edhaRecordFocusFire(rtok, targets);
  } catch (e) {}
}
for (const ctx of ["attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaFocusFireWatch);

// Pack Pressure strike window — active until the start of the owner's next turn.
function edhaPackPressureActive(actor) {
  const pp = actor?.getFlag?.("edha-content", "packPressure");
  if (!pp || !game.combat?.started) return false;
  return edhaTurnSeq(game.combat.round, game.combat.turn) < edhaTurnSeq(pp.round, pp.turn);
}

/* --- Instinct on-use abilities -------------------------------------------------------------------- */
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    const otok = edhaCasterToken(actor), disp = otok?.document?.disposition ?? 1;
    // Pack Hunter — you + each ally adjacent to the targeted enemy gain advantage on your next attack.
    if (item.name === "Pack Hunter" && edhaOwnsTalent(actor, "Pack Hunter")) {
      void edhaGrantAdvAttack(actor, "Pack Hunter");
      const enemyTok = Array.from(game.user?.targets ?? [])[0]; let n = 1;
      if (enemyTok && otok) for (const t of (canvas?.tokens?.placeables ?? [])) {
        if (t.id === otok.id || !t.actor || (t.document?.disposition ?? 1) !== disp || !edhaAdjacent(t, enemyTok)) continue;
        void edhaGrantAdvAttack(t.actor, "Pack Hunter"); n++;
      }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐾 <strong>Pack Hunter</strong> (${actor.name}): ${n} hunter(s) gain advantage on their next attack${enemyTok ? ` against ${enemyTok.name}` : ""}.</p>` });
    }
    // Scent the Weak — name the lowest-HP creature in range; advantage on your next attack (once/round).
    if (item.name === "Scent the Weak" && edhaOwnsTalent(actor, "Scent the Weak")) {
      const ft = edhaAttuneFtColor(actor, "green");
      const enemies = otok ? edhaTokensWithin(otok, ft).filter(t => (t.document?.disposition ?? 1) !== disp && (t.actor?.system?.resources?.hea?.value ?? 1) > 0) : [];
      enemies.sort((a, b) => (a.actor?.system?.resources?.hea?.value ?? 0) - (b.actor?.system?.resources?.hea?.value ?? 0));
      const low = enemies[0];
      if (low && edhaCoordOPRAllowed(actor, "Scent the Weak", "_scent")) { void edhaCoordOPRMark(actor, "Scent the Weak", "_scent"); void edhaGrantAdvAttack(actor, "Scent the Weak"); }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: low ? `<p>🩸 <strong>Scent the Weak</strong> (${actor.name}): lowest HP in range = <strong>${low.name}</strong> (${low.actor?.system?.resources?.hea?.value} HP). Advantage on your first attack against it this round.</p>` : `<p>🩸 <strong>Scent the Weak</strong> (${actor.name}): no creatures in Attunement Range.</p>` });
    }
    // Drive the Prey — Green vs Survival (opposed roll). Success → Slowed (timed). Forced move-away
    // and ally Reactive Strikes are Manual by nature (GM-narrated; no Foundry movement/reaction hook).
    if (item.name === "Drive the Prey" && edhaOwnsTalent(actor, "Drive the Prey")) {
      const t = target0();
      if (!t) {
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🐺 <strong>Drive the Prey</strong> — target the enemy and use again to auto-resolve Green vs its Survival (success → Slowed; forced move-away and ally Reactive Strikes are GM-narrated).</p></div>` });
      } else {
        edhaQueueContest(actor, "green", async ({ total }) => {
          const opp = await edhaRollOpposedSkill(t, "sur");
          const success = total >= opp;
          if (success) {
            await edhaApplyTimedStatus(t, "slowed", { owner: actor, expire: "target" });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🐺 <strong>Drive the Prey</strong>: Green <strong>${total}</strong> ≥ ${t.name}'s Survival <strong>${opp}</strong> — ${t.name} is <strong>Slowed</strong>. It must move away from you on its next turn; allies may make Reactive Strikes if it moves within their reach (GM-narrated).</p>` });
          } else {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🐺 <strong>Drive the Prey</strong>: Green <strong>${total}</strong> &lt; ${t.name}'s Survival <strong>${opp}</strong> — it doesn't break.</p>` });
          }
        });
      }
    }
    // Pack Pressure — a +[Tier][Die] strike window until the start of your next turn (movement GM-narrated).
    if (item.name === "Pack Pressure" && edhaOwnsTalent(actor, "Pack Pressure")) {
      const coord = game.combat?.started ? edhaNextTurnCoord(game.combat, edhaCombatantTurnIndex(game.combat, actor)) : { round: 0, turn: 0 };
      void actor.setFlag("edha-content", "packPressure", coord);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐺 <strong>Pack Pressure</strong> (${actor.name}): you + allies within 15 ft may Move ½ Speed without provoking (GM-narrated). Until the start of your next turn, your Strikes deal +[Tier][Die].</p>` });
    }
    // Manual / narrative (no Foundry hook): Natural Order. (Packmate's Warning upgraded to the
    // edhaCanSee ward injector, 2026-07-04 — the on-use card below just restates the passive.)
    if (item.name === "Packmate's Warning" && edhaOwnsTalent(actor, "Packmate's Warning"))
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>📣 <strong>Packmate's Warning</strong> (${actor.name}): an ally within 10 ft targeted by an attack they can't see gains <strong>+2 defense</strong> against it (auto — the attack roll takes −2 when the ally can't see the attacker: hidden, or wall LOS; darkness GM-judged).</p>` });
    if (item.name === "Natural Order" && edhaOwnsTalent(actor, "Natural Order"))
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>⚖️ <strong>Natural Order</strong> (${actor.name}): for the scene, enemies in Attunement Range can't benefit from illusions, magical concealment, or advantage from deception (GM-narrated).</p>` });
  } catch (e) { console.error("Edha Content | Instinct use-hook failed", e); }
});

/* --- Packmate's Warning — +2 defense vs attacks the ally can't see (−2 on the attack roll) ---------- */
// Defender-keyed pre-roll injector (the Lawkeeper shape + the Mantle NumericTerm append; was truly-
// manual until edhaCanSee existed, upgraded 2026-07-04): an attack roll whose synced target is an
// ally within 10 ft of a Packmate owner AND cannot see the attacker (hidden, or a sight-blocking
// wall) takes −2 — the roll-side equivalent of "+2 defense against it". The owner itself is excluded
// ("an ally"). ⚑ NumericTerm append — same bench caveat as the Mantle aura (dialog rebuilds).
function edhaGreenPackmateWard(roll, source, config) {
  try {
    const attacker = edhaD20RollActor(config); if (!attacker) return;
    const atok = edhaCasterToken(attacker); if (!atok) return;
    const dtok = edhaTargetsOfRoller(attacker)[0]; const da = dtok?.actor; if (!da || da === attacker) return;
    if (edhaCanSee(dtok, atok)) return;                       // the defender SEES the attack — no ward
    for (const owner of edhaCharacterOwnersOf("Packmate's Warning")) {
      if (owner === da) continue;                             // "an ally" — the owner itself is excluded
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((otok.document?.disposition ?? 1) !== (dtok.document?.disposition ?? 1)) continue;
      if (!edhaTokensWithin(otok, 10).some(x => x.id === dtok.id)) continue;
      const T = foundry.dice?.terms ?? {};
      if (!T.OperatorTerm || !T.NumericTerm) return;
      roll.terms.push(new T.OperatorTerm({ operator: "-" }), new T.NumericTerm({ number: 2, options: { flavor: "Packmate's Warning (+2 defense)" } }));
      roll._formula = Roll.getFormula(roll.terms);
      break;
    }
  } catch (e) { console.error("Edha Content | Packmate's Warning ward failed", e); }
}
for (const ctx of ["Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaGreenPackmateWard);

/* --- Draw Mana — universal leyline action; rider determined by the owned Leyline Key(s) ---------
 * Canon: "1 Action: recover Investiture equal to your Tier and trigger your leyline color's Attunement
 * rider." The Draw Mana action is granted by every leyline path (foundry-build pathEvents); the per-color
 * effect lives on the Key talent. On use we recover Investiture and apply each owned Key's rider.
 *   White → heal allies in range (= Tier)    Black → Weaken enemies in range (status if native, else note)
 *   Green → place [Size] difficult terrain    Blue/Red → advantage on next Cognitive/Physical test (ENFORCED via nextTestMod, attr-gated — Blue wired 2026-07-03c)
 */
const EDHA_DRAW_MANA = {
  "White Leyline Attunement": { color: "white", kind: "heal-allies" },
  "Blue Leyline Attunement":  { color: "blue",  kind: "next-test-adv", attr: "int, wil", label: "Cognitive (int/wil) test" },   // enforced via nextTestMod (2026-07-03c — was a manual note; mirrors the Red Key)
  "Black Leyline Attunement": { color: "black", kind: "weaken-enemies" },
  "Red Leyline Attunement":   { color: "red",   kind: "next-test-adv", attr: "str, spd", label: "Physical (str/spd) test", reactionNote: "lose your Reaction until the start of your next turn" },
  "Green Leyline Attunement": { color: "green", kind: "terrain" },
};
async function edhaHealActor(actor, amt) {
  const hea = actor?.system?.resources?.hea; if (!hea) return;
  const max = (hea.max && typeof hea.max === "object") ? hea.max.value : hea.max;
  await actor.update({ "system.resources.hea.value": Math.min(max ?? ((hea.value || 0) + amt), (hea.value || 0) + amt) });
}
async function edhaDrawMana(item) {
  try {
    const actor = item?.actor; if (!actor) return;
    const tier = Number(actor.system?.tier) || 1;
    const inv = actor.system?.resources?.inv;
    if (inv) { const max = (inv.max && typeof inv.max === "object") ? inv.max.value : inv.max; await actor.update({ "system.resources.inv.value": Math.min(max ?? ((inv.value || 0) + tier), (inv.value || 0) + tier) }); }
    const lines = [`recover ${tier} Investiture`];
    const owned = new Set(actor.items.filter(i => edhaIsTalent(i)).map(i => i.name));
    const tok = edhaCasterToken(actor);
    const disp = tok?.document?.disposition ?? 1;
    for (const [keyName, r] of Object.entries(EDHA_DRAW_MANA)) {
      if (!owned.has(keyName)) continue;
      const rank = edhaColorRank(actor, r.color);
      const ft = EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1];
      if (r.kind === "heal-allies" && tok) {
        // 07-12 ruling (Ben, pass 3): the pulse heals allies you can SEE — same visible gate as the
        // Black Weaken (it was "healing everyone", through walls). Same skip accounting on the card.
        const alliesInRange = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id)
          .filter(t => (t.document?.disposition ?? 1) === disp && t.actor);
        const wSkips = { hidden: 0, wall: 0 };
        const allies = alliesInRange.filter(t => {
          if (t.document?.hidden) { wSkips.hidden++; return false; }
          if (!edhaCanSee(tok, t)) { wSkips.wall++; return false; }
          return true;
        });
        // 07-17 playtest: a PLAYER doesn't own their allies' actors, so the direct edhaHealActor
        // update threw "lack permission to edit actor" (same class the Black weaken already relays).
        // edhaCrossHeal heals owned targets directly and relays the rest to the GM (burst-apply).
        for (const a of allies) await edhaCrossHeal(a.actor, tier);
        await edhaHealActor(actor, tier);   // self is always owned — no relay needed
        const wSkipBits = [];
        if (wSkips.hidden) wSkipBits.push(`${wSkips.hidden} hidden`);
        if (wSkips.wall) wSkipBits.push(`${wSkips.wall} behind a wall`);
        lines.push(`White: healed ${allies.length + 1} of ${alliesInRange.length + 1} ally(ies) ${tier} HP within ${ft} ft (visible)${wSkipBits.length ? ` — skipped ${wSkipBits.join(", ")}` : ""}`);
        // Beacon of Stability: on Draw Mana, spend 1 Investiture to remove a condition from an ally in range.
        if (edhaOwnsTalent(actor, "Beacon of Stability")) { try { edhaPostBeaconCard(actor, allies); lines.push("Beacon of Stability: cleanse a condition from an ally (1 Inv — see the card)"); } catch (e) {} }
      } else if (r.kind === "weaken-enemies" && tok) {
        // The 07-05 pass caught the missing gate: ALL enemies in range were Weakened. Only ISOLATED
        // enemies (no living ally within 5 ft — edhaIsIsolated, checked per token) qualify.
        // 07-12 ruling (Ben): line of sight required — the pulse doesn't reach through walls/doors
        // (edhaCanSee: sight-wall ray; darkness stays GM-judged). Card text updated to match.
        // 07-12 pass-3 lesson: the sweep silently skipped two GM-HIDDEN tokens and the card just said
        // "Weakened 0" — every skip is accounted for. 07-12b ruling (Ben): the PLAYER card must not
        // reveal what they can't see (hidden / wall-obscured enemy counts are GM information) — the
        // public card accounts only for visible enemies; the full accounting whispers to the GM.
        const inRange = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id)
          .filter(t => (t.document?.disposition ?? 1) !== disp && t.actor);
        const skips = { ally: 0, hidden: 0, wall: 0 };
        // Unseen checks FIRST so the ally-adjacent count covers only enemies the player can see.
        const enemies = inRange.filter(t => {
          if (t.document?.hidden) { skips.hidden++; return false; }
          if (!edhaCanSee(tok, t)) { skips.wall++; return false; }
          if (!edhaIsIsolated(t.actor, t)) { skips.ally++; return false; }
          return true;
        });
        const wkId = CONFIG.COSMERE?.statuses?.weakened ? "weakened" : null;
        let applied = 0;
        // Players don't own enemy actors — edhaToggleStatus relays to the GM client when needed
        // (direct toggleStatusEffect threw permission errors at the table, 2026-06-11 playtest).
        if (wkId) for (const e of enemies) { try { if (await edhaToggleStatus(e.actor, wkId, true)) applied++; } catch (x) {} }
        const visTotal = inRange.length - skips.hidden - skips.wall;   // what the player can see
        const skipNote = skips.ally ? ` — skipped ${skips.ally} with an ally adjacent` : "";
        lines.push(wkId ? `Black: Weakened ${applied} of ${visTotal} enem${visTotal === 1 ? "y" : "ies"} you can see within ${ft} ft (Isolated)${skipNote}` : `Black: Weaken Isolated enemies you can see within ${ft} ft (apply manually — Weakened isn't a native status)${skipNote}`);
        if (skips.hidden || skips.wall) {
          const unseen = [];
          if (skips.hidden) unseen.push(`${skips.hidden} hidden`);
          if (skips.wall) unseen.push(`${skips.wall} behind a wall`);
          // GM-only — MUST be posted by the GM, never authored by the using player (a whisper is
          // visible to its author, so a player would otherwise see these counts on their own screen).
          edhaPostGmCard(actor, `<p>🕵️ <strong>Draw Mana (Black)</strong> full sweep for the GM: ${inRange.length} enem${inRange.length === 1 ? "y" : "ies"} in range, Weakened ${applied} — also skipped ${unseen.join(", ")} (not shown to the player).</p>`);
        }
      } else if (r.kind === "terrain" && tok) {
        // 07-12 rework (Ben pass 3: "centered on the actor's token, not placeable"): click-to-place
        // a SQUARE within Attunement Range, same UX as Lay Foundation (range ring while picking).
        const sizeFt = EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1];
        let ring = null;
        try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_RANGE_RING_HEX, 0); } catch (e) {}
        const pt = await edhaPickPoint(`Click where the ${sizeFt} ft difficult-terrain square grows (right-click to cancel). Attunement Range ${ft} ft.`);
        try { if (ring) await ring.delete(); } catch (e) {}
        const gd0 = canvas?.scene?.grid?.distance || 5, gs0 = canvas?.scene?.grid?.size || 100;
        if (pt && Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs0 * gd0 <= ft + gd0 / 2) {
          await edhaDropGreenTerrain(actor, canvas?.scene, pt.x, pt.y, sizeFt);
          lines.push(`Green: ${sizeFt} ft difficult-terrain square placed${edhaOwnsTalent(actor, "Thorn Field") ? " (Thorn Field: ½[Tier][Die] keen)" : ""}`);
        } else {
          if (pt) ui.notifications?.warn(`Edha: that point is beyond Attunement Range (${ft} ft) — terrain not placed.`);
          lines.push(`Green: terrain NOT placed (${pt ? "out of range" : "cancelled"})`);
        }
      } else if (r.kind === "next-test-adv") {
        // Red Key: advantage on your next Physical test (enforced via the nextTestMod flag, attribute-gated).
        await edhaSetNextTestMod(actor, { mode: "advantage", count: 1, skill: null, attr: r.attr || null, source: keyName });
        lines.push(`${r.color[0].toUpperCase() + r.color.slice(1)}: advantage on your next ${r.label || "test"}${r.reactionNote ? ` (${r.reactionNote} — GM-tracked)` : ""}`);
      } else if (r.kind === "note") {
        lines.push(`${r.color[0].toUpperCase() + r.color.slice(1)}: ${r.text} (apply manually)`);
      }
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${actor.name}</strong> Draws Mana — ${lines.join("; ")}.</p>` });
  } catch (e) { console.error("Edha Content | Draw Mana failed", e); }
}
Hooks.on("cosmere-rpg.useItem", (item) => { try { if (item?.name === "Draw Mana") void edhaDrawMana(item); } catch (e) { console.error("Edha Content | Draw Mana hook failed", e); } });

// Granted-via-path means a character who added their leyline path BEFORE this update won't retroactively
// have Draw Mana. This adds it from the leyline pack (or re-add the leyline path to grant it normally).
async function edhaGrantDrawMana(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token to grant Draw Mana."); return; }
  if (actor.items.some(i => i.name === "Draw Mana")) { ui.notifications?.info(`${actor.name} already has Draw Mana.`); return; }
  const pack = game.packs?.get("edha-content.edha-leyline");
  const src = (await pack?.getDocuments?.() ?? []).find(d => d.name === "Draw Mana");
  if (!src) { ui.notifications?.warn("Edha: Draw Mana not in the leyline pack yet (rebuild needed)."); return; }
  await actor.createEmbeddedDocuments("Item", [src.toObject()]);
  ui.notifications?.info(`Edha: granted Draw Mana to ${actor.name}.`);
}

/* --- Lay Foundation (Kethane/Civilization) — full takeover (2026-06-12) ------------------------
 * Canon text: "Spend 1 Investiture and designate a 10 ft square in Attunement Range as a Foundation
 * for the scene. Allies that begin their turn in a Foundation gain +1 to all defenses until the
 * start of their next turn. You may sustain up to your tier Foundations."
 * Playtest problems (2026-06-11): the old edha-aoe-template rule left the system's default use flow
 * running (one click → endless placement until relog) and the Foundation was visual-only.
 * New model: preUseItem takeover (returning false cancels the default flow entirely — exactly ONE
 * placement per use, right-click cancels + refunds). The Foundation itself is a player-visible
 * DRAWING (gold 10 ft square) placed on the primary GM client (players usually lack DRAWING_CREATE),
 * which also enforces the tier sustain cap by crumbling the oldest. Mechanics ride the cosmere
 * activation flags: when a combatant is Activated (= begins its turn), the GM client applies/removes
 * a +1 phy/cog/spi ActiveEffect based on whether its token sits in a friendly Foundation — which is
 * precisely "begin your turn in a Foundation → +1 all defenses until the start of your next turn".
 */
const EDHA_FOUNDATION_HEX = "#e8c060";
function edhaFoundationsOn(scene, casterId = null) {
  return (scene?.drawings ?? []).filter(d => {
    const f = d.getFlag?.("edha-content", "foundation");
    return f && (!casterId || f.casterId === casterId);
  });
}
// The Foundation drawing whose square contains the point (for a same-disposition creature), if any.
function edhaFoundationAtPoint(scene, x, y, disposition) {
  return edhaFoundationsOn(scene).find(d => {
    const f = d.getFlag("edha-content", "foundation");
    if (f.disposition !== undefined && f.disposition !== disposition) return false;
    const w = d.shape?.width ?? 0, h = d.shape?.height ?? 0;
    return x >= d.x && x <= d.x + w && y >= d.y && y <= d.y + h;
  }) ?? null;
}
async function edhaLayFoundation(item) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor || !scene) return;
    const tok = edhaCasterToken(actor);
    const color = edhaTalentColor(item) || "white";
    const rangeFt = EDHA_ATTUNE_FT[edhaColorRank(actor, color)] || EDHA_ATTUNE_FT[1];
    if (!edhaConsumeCost(item)) return;
    // Show Attunement Range while picking the point (same UX as bursts).
    let ring = null;
    if (tok) { try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, rangeFt, EDHA_RANGE_RING_HEX, 0); } catch (e) {} }
    const pt = await edhaPickPoint(`Click the center of the 10 ft Foundation square (right-click to cancel). Attunement Range ${rangeFt} ft.`);
    try { if (ring) await ring.delete(); } catch (e) {}
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — Investiture refunded.`); return; }
    if (tok) {
      const gs0 = scene.grid?.size || 100, gd0 = scene.grid?.distance || 5;
      const distFt = Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs0 * gd0;
      if (distFt > rangeFt + gd0 / 2) { edhaRefundCost(item); ui.notifications?.warn(`Edha: that point is ${Math.round(distFt)} ft away — beyond Attunement Range (${rangeFt} ft). Refunded.`); return; }
    }
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const sizePx = Math.max(gs, Math.round((10 / gd) * gs));           // 10 ft square (2×2 on a 5 ft grid)
    const x = Math.round((pt.x - sizePx / 2) / gs) * gs;               // snap so edges sit on grid lines
    const y = Math.round((pt.y - sizePx / 2) / gs) * gs;
    const payload = {
      sceneId: scene.id, x, y, size: sizePx,
      casterId: actor.id, casterName: actor.name,
      disposition: tok?.document?.disposition ?? 1,
      maxSustained: Math.max(1, Number(actor.system?.tier) || 1),
    };
    if (game.user?.isGM) await edhaFoundationPlace(payload);
    else {
      if (!game.users?.activeGM) { edhaRefundCost(item); ui.notifications?.warn("Edha: a GM must be online to place a Foundation. Refunded."); return; }
      game.socket.emit("module.edha-content", { action: "foundation-place", payload });
    }
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>🧱 <strong>${actor.name}</strong> lays a <strong>Foundation</strong> — allies that begin their turn in it gain <strong>+1 to all defenses</strong> until the start of their next turn (scene; sustains up to ${payload.maxSustained}).</p>`,
    });
  } catch (e) { console.error("Edha Content | Lay Foundation failed", e); }
}
// GM-side: enforce the tier sustain cap (oldest crumbles), then create the player-visible drawing.
async function edhaFoundationPlace(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    const existing = edhaFoundationsOn(scene, p.casterId)
      .sort((a, b) => (a.getFlag("edha-content", "foundation")?.ts ?? 0) - (b.getFlag("edha-content", "foundation")?.ts ?? 0));
    const over = existing.length - (Math.max(1, Number(p.maxSustained) || 1) - 1);
    if (over > 0) {
      await scene.deleteEmbeddedDocuments("Drawing", existing.slice(0, over).map(d => d.id));
      ChatMessage.create({ content: `<p>🧱 ${p.casterName}'s oldest Foundation crumbles (sustain cap ${p.maxSustained}).</p>` });
    }
    const [drawing] = await scene.createEmbeddedDocuments("Drawing", [{
      x: p.x, y: p.y,
      shape: { type: "r", width: p.size, height: p.size },
      strokeColor: EDHA_FOUNDATION_HEX, strokeWidth: 4, strokeAlpha: 1,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: EDHA_FOUNDATION_HEX, fillAlpha: 0.15,
      text: "Foundation", fontSize: Math.max(16, Math.round(p.size / 5)), textColor: EDHA_FOUNDATION_HEX, textAlpha: 0.9,
      flags: { "edha-content": { foundation: { casterId: p.casterId, casterName: p.casterName, disposition: p.disposition, ts: Date.now() } } },
    }]);
    // CIVILIZATION / Bastion (Ben R4, 07-02): while Bastion holds, Foundations laid later come up fortified.
    const caster = game.actors?.get(p.casterId);
    if (drawing && caster?.getFlag?.("edha-content", "bastionActive")) {
      const bastion = caster.items?.find(i => edhaIsTalent(i) && i.name === "Bastion");
      await edhaCivFortifyGM({
        sceneId: scene.id, ownerUuid: caster.uuid, drawingIds: [drawing.id],
        baked: Roll.replaceFormulaData(bastion?.system?.damage?.formula || EDHA_CIV_RED_DIE, caster.getRollData(), { missing: "0" }),
        type: bastion?.system?.damage?.type || "impact", disposition: p.disposition,
      });
    }
  } catch (e) { console.error("Edha Content | foundation place failed", e); }
}
// CIVILIZATION / Bastion: a Foundation drawing that crumbles (sustain cap / GM clear) takes its
// fortified Region along, and any Construct standing there loses the Bastion buff on the next sweep.
Hooks.on("deleteDrawing", async (drawingDoc) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!drawingDoc?.getFlag?.("edha-content", "foundation")) return;
    const scene = drawingDoc.parent; if (!scene) return;
    const dead = (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "fortified")?.drawingId === drawingDoc.id);
    if (dead.length) await scene.deleteEmbeddedDocuments("Region", dead.map(r => r.id));
    await edhaCivBastionSweep(scene);
  } catch (e) { console.error("Edha Content | fortified-foundation cleanup failed", e); }
});
// Takeover: cancel the system's default use flow (this is what caused the endless placement loop).
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item) || item.name !== "Lay Foundation") return;
    void edhaLayFoundation(item);
    return false;
  } catch (e) { console.error("Edha Content | Lay Foundation intercept failed", e); }
});
// Ben (pass 3, 07-12): starting combat INSIDE a Foundation gave no bonus until the second turn —
// the activation-flag watcher below only sees flags CHANGING, and nobody's has changed yet at
// combat start. Sweep every combatant then: anyone standing in a Foundation is buffed until their
// first real turn-start re-derives it.
Hooks.on("combatStart", (combat) => {
  try { if (edhaDefBuffGmGate()) for (const c of (combat?.combatants ?? [])) void edhaFoundationTurnStart(c); }
  catch (e) { console.error("Edha Content | foundation combat-start sweep failed", e); }
});
// Mechanics: cosmere "turns" are activation flags (markActivated), not core combat.turn — so a
// combatant beginning its turn surfaces as flags.cosmere-rpg.activated flipping to true.
Hooks.on("updateCombatant", (combatant, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const act = foundry.utils.getProperty(changed, "flags.cosmere-rpg.activated");
    const boss = foundry.utils.getProperty(changed, "flags.cosmere-rpg.bossFastActivated");
    if (act !== true && boss !== true) return;
    void edhaFoundationTurnStart(combatant);
  } catch (e) { console.error("Edha Content | foundation turn-start hook failed", e); }
});
async function edhaFoundationTurnStart(combatant) {
  try {
    const actor = combatant?.actor; const tokDoc = combatant?.token;
    if (!actor || !tokDoc) return;
    const scene = tokDoc.parent; const gs = scene?.grid?.size || 100;
    const cx = tokDoc.x + (tokDoc.width ?? 1) * gs / 2, cy = tokDoc.y + (tokDoc.height ?? 1) * gs / 2;
    const inside = edhaFoundationAtPoint(scene, cx, cy, tokDoc.disposition);
    const existing = actor.effects.filter(e => e.getFlag?.("edha-content", "foundationBuff"));
    // Magnum Opus (Civilization) upgrades the buff to +2 for the scene (Ben R7b, 07-02): read the
    // Foundation's caster; a stale-value buff is recreated so mid-combat upgrades land next turn-start.
    const caster = inside ? game.actors?.get(inside.getFlag("edha-content", "foundation")?.casterId) : null;
    const bonus = Math.max(1, Number(caster?.getFlag?.("edha-content", "civFoundationBonus")) || 1);
    const stale = existing.filter(e => (Number(e.getFlag?.("edha-content", "foundationBuff")?.bonus) || 1) !== bonus);
    if (inside && stale.length) await actor.deleteEmbeddedDocuments("ActiveEffect", stale.map(e => e.id));
    if (inside && (!existing.length || stale.length === existing.length)) {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: `Foundation (+${bonus} defenses)`, img: "icons/tools/smithing/anvil.webp",
        changes: ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(bonus), priority: 20 })),
        description: `<p>Began the turn in a Foundation: +${bonus} to all defenses until the start of your next turn.</p>`,
        flags: { "edha-content": { foundationBuff: { bonus } } },
      }]);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧱 <strong>${actor.name}</strong> begins their turn in a Foundation — +${bonus} to all defenses until the start of their next turn.</p>` });
    } else if (!inside && existing.length) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
    }
  } catch (e) { console.error("Edha Content | foundation turn-start failed", e); }
}
// Cleanup: buffs end with combat; Foundations themselves are scene-long (delete the drawings to clear).
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    for (const c of (combat?.combatants ?? [])) {
      const ex = c.actor?.effects?.filter(e => e.getFlag?.("edha-content", "foundationBuff")) ?? [];
      if (ex.length) void c.actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id));
    }
  } catch (e) { console.error("Edha Content | foundation combat cleanup failed", e); }
});

/* --- Investiture max derivation (Edha canon: 2 + max(Awareness, Presence)) --------------------
 * Base cosmere has NO Investiture-max derivation (it's Surge-gated → 0/manual for leyline mages), so
 * players had to set it by hand. We derive it for CHARACTER actors by wrapping prepareDerivedData and
 * writing system.resources.inv.max.value after the system's own prep. Characters always use the canon
 * formula (manual inv overrides on PCs are intentionally ignored); adversaries/NPCs are left untouched.
 */
const _edhaInvPersisted = new Set();   // actor ids whose source inv override we've already persisted this session
function edhaDeriveInvestiture(actor) {
  try {
    if (actor?.type !== "character") return;                 // PCs only; NPC/adversary inv stays manual
    const inv = actor.system?.resources?.inv; if (!inv?.max) return;
    const awa = Number(actor.system?.attributes?.awa?.value) || 0;
    const pre = Number(actor.system?.attributes?.pre?.value) || 0;
    const derived = 2 + Math.max(awa, pre);
    try { inv.max.value = derived; }                                       // plain field: set directly
    catch (e) { try { inv.max.override = derived; inv.max.useOverride = true; } catch (e2) {} }  // DerivedValueField: .value is getter-only → use override
    try { if (typeof inv.value === "number" && inv.value > derived) inv.value = derived; } catch (e) {}  // clamp current
    // PERSIST the override to the actor's SOURCE (once per session): the system's own prepare clamps
    // inv.value against the SOURCE max BEFORE our runtime override applies, so an actor without a
    // persisted source override gets its current Inv clamped to 0 on every prepare (2026-06-11 gotcha).
    try {
      const src = actor._source?.system?.resources?.inv?.max;
      if (game?.ready && actor.id && src && (!src.useOverride || Number(src.override) !== derived) && !_edhaInvPersisted.has(actor.id) && actor.isOwner) {
        _edhaInvPersisted.add(actor.id);
        setTimeout(() => { actor.update({ "system.resources.inv.max.override": derived, "system.resources.inv.max.useOverride": true }).catch(() => {}); }, 0);
      }
    } catch (e) { /* non-fatal */ }
  } catch (e) { console.error("Edha Content | Investiture derivation failed", e); }
}

/* --- Edha sheet derivations: HP = system + 1; Speed = 20 + 5 × SPD ------------------------------
 * The Edha reference sheets derive these differently from the cosmere system; the pregens carried
 * per-actor hacks (hea.max.bonus:1 / movement override). Now derived for ALL characters:
 *  • HP: +1 to hea.max.bonus IN MEMORY — skipped while the actor's SOURCE still carries a manual
 *    bonus (legacy pregens), so nothing double-applies until edha.migrateDerivations() strips them.
 *  • Speed: override = 20 + 5×SPD + (current bonus) — keeps AE speed buffs (Walking Ruin) additive.
 *    Skipped while the actor's SOURCE carries its own movement override (legacy pregens).
 */
function edhaDeriveSheetStats(actor) {
  try {
    if (actor?.type !== "character") return;
    // HP = system + 1
    const heaMax = actor.system?.resources?.hea?.max;
    const srcHeaBonus = Number(actor._source?.system?.resources?.hea?.max?.bonus) || 0;
    if (heaMax && srcHeaBonus === 0) {
      try { heaMax.bonus = (Number(heaMax.bonus) || 0) + 1; } catch (e) { /* getter-only safety */ }
    }
    // Speed = 20 + 5 × SPD. Do NOT fold rate.bonus into the override — the DerivedValueField's
    // value getter adds .bonus ON TOP of the override, so folding it in double-counted every
    // speed AE (07-18 bench: Surefooted's +10 displayed as +20). AE buffs stay additive via the
    // getter itself.
    const rate = actor.system?.movement?.walk?.rate;
    const srcRate = actor._source?.system?.movement?.walk?.rate;
    if (rate && !(srcRate?.useOverride)) {
      const spd = Number(actor.system?.attributes?.spd?.value) || 0;
      try { rate.override = 20 + 5 * spd; rate.useOverride = true; } catch (e) { /* non-fatal */ }
    }
  } catch (e) { console.error("Edha Content | sheet-stat derivation failed", e); }
}
// One-time migration: strip the pregens' per-actor HP bonus / movement override so the derivations
// above take over (run once from the console as GM: edha.migrateDerivations()).
async function edhaMigrateDerivations() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: migration is GM-only."); return; }
  let n = 0;
  for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
    const u = {};
    if ((Number(a._source?.system?.resources?.hea?.max?.bonus) || 0) !== 0) u["system.resources.hea.max.bonus"] = 0;
    if (a._source?.system?.movement?.walk?.rate?.useOverride) u["system.movement.walk.rate.useOverride"] = false;
    if (Object.keys(u).length) { try { await a.update(u); n++; } catch (e) { console.warn(`Edha | migration failed on ${a.name}`, e); } }
  }
  ui.notifications?.info(`Edha: derivation migration done — ${n} character(s) updated (HP/Speed now derived).`);
  return n;
}

/* --- PC token defaults (07-18 bench: new "Test Warrior" had a hidden name + short sight) --------
 * Foundry's blank prototype token (displayName NONE, sight range 0) is wrong for Edha PCs: the
 * sight model (07-16c) gives every creature its Senses Range, and a PC's name should read on
 * hover. NEW character actors get displayName HOVER(30) + sight enabled in the cosmere "sense"
 * vision mode (attenuation 0.1 — the exact shape the world PCs and the 07-17c adversary builds
 * carry), range = Senses Range from AWA. An updateActor watcher keeps the range in step when AWA
 * changes (prototype + placed tokens, single GM applier). `edha.fixPcTokens()` retrofits
 * EXISTING characters and their placed tokens (run once for Test / Test Warrior).
 */
function edhaPcSightShape(actor) {
  const awa = Number(actor?.system?.attributes?.awa?.value) || 0;
  return { enabled: true, range: edhaSensesRangeFtFromAwa(awa), visionMode: "sense", attenuation: 0.1 };
}
Hooks.on("preCreateActor", (doc, data) => {
  try {
    if (doc.type !== "character") return;
    if (data?.prototypeToken?.sight?.range) return; // imported/duplicated actors keep their own config
    doc.updateSource({ prototypeToken: { displayName: 30, sight: edhaPcSightShape(doc) } });
  } catch (e) { console.error("Edha Content | PC token defaults failed", e); }
});
Hooks.on("updateActor", (actor, changes) => {
  try {
    if (actor.type !== "character") return;
    if (changes?.system?.attributes?.awa === undefined) return;
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return; // ONE applier (§10)
    const range = edhaPcSightShape(actor).range;
    void actor.update({ "prototypeToken.sight.range": range });
    for (const sc of game.scenes ?? []) {
      const toks = sc.tokens?.filter?.(t => t.actorId === actor.id) ?? [];
      if (toks.length) void sc.updateEmbeddedDocuments("Token", toks.map(t => ({ _id: t.id, "sight.range": range })));
    }
  } catch (e) { console.error("Edha Content | PC sight-range sync failed", e); }
});
async function edhaFixPcTokens() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: PC token fix is GM-only."); return; }
  let n = 0;
  for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
    const sight = edhaPcSightShape(a);
    try { await a.update({ "prototypeToken.displayName": 30, "prototypeToken.sight": sight }); n++; } catch (e) { console.warn(`Edha | token fix failed on ${a.name}`, e); }
    for (const sc of game.scenes ?? []) {
      const toks = sc.tokens?.filter?.(t => t.actorId === a.id) ?? [];
      if (toks.length) { try { await sc.updateEmbeddedDocuments("Token", toks.map(t => ({ _id: t.id, displayName: 30, sight }))); } catch (e) {} }
    }
  }
  ui.notifications?.info(`Edha: PC token defaults applied to ${n} character(s) (+ placed tokens).`);
  return n;
}
Hooks.once("ready", () => {
  const ActorCls = CONFIG.Actor?.documentClass;
  if (!ActorCls?.prototype?.prepareDerivedData) { console.warn("Edha Content | Actor#prepareDerivedData not found — Investiture derivation not wired."); return; }
  if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
    libWrapper.register("edha-content", "CONFIG.Actor.documentClass.prototype.prepareDerivedData",
      function (wrapped, ...args) { const r = wrapped(...args); edhaDeriveInvestiture(this); edhaDeriveSheetStats(this); return r; }, "WRAPPER");
    console.log("Edha Content | Edha derivations (Investiture, HP+1, Speed) wired via libWrapper.");
  } else {
    const orig = ActorCls.prototype.prepareDerivedData;
    ActorCls.prototype.prepareDerivedData = function (...args) { const r = orig.apply(this, args); edhaDeriveInvestiture(this); edhaDeriveSheetStats(this); return r; };
    console.log("Edha Content | Edha derivations (Investiture, HP+1, Speed) wired via prototype patch.");
  }
  // Refresh already-loaded actors so the new max shows immediately.
  for (const a of (game.actors ?? [])) { if (a.type === "character") { try { a.prepareData(); a.sheet?.rendered && a.sheet.render(false); } catch (e) {} } }
});

/* --- Apply-damage targeting: make the chat Apply buttons follow TARGETS ONLY -------------------
 * History: default 0 (SelectedOnly) broke AoE (Apply ignored targets). We then used 4 (Prioritise
 * Targeted), but its fallback-to-selected meant a player with NO target and their own token selected
 * damaged THEMSELVES (2026-06-11 playtest: Searing Bolt self-hits, all players). Now force
 * 1 (TargetedOnly): no target → Apply does nothing. GM workflow note: target (T) tokens before
 * clicking Apply — selecting them no longer counts. AoE still works (it auto-TARGETS caught tokens). */
Hooks.once("ready", async () => {
  try {
    if (!game.user?.isGM) return;
    const cur = game.settings.get("cosmere-rpg", "applyButtonsTo");
    if (cur !== 1) {
      await game.settings.set("cosmere-rpg", "applyButtonsTo", 1);   // Targeted Only — no self-hit fallback
      ui.notifications?.info("Edha: set 'Apply damage/healing to' → Targeted Only (no fallback to your selected token).");
      console.log(`Edha Content | applyButtonsTo ${cur} → 1 (Targeted Only).`);
    }
  } catch (e) { console.warn("Edha Content | could not set applyButtonsTo", e); }
});
async function edhaFixSettings() {
  try { await game.settings.set("cosmere-rpg", "applyButtonsTo", 1); ui.notifications?.info("Edha: 'Apply damage/healing to' = Targeted Only."); }
  catch (e) { ui.notifications?.warn("Edha: couldn't set applyButtonsTo (GM only)."); }
}

// Testing helper: clear an actor's once-per-round trigger locks without advancing a combat round.
async function edhaResetTriggers(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token to reset its triggers."); return; }
  try { await actor.unsetFlag("edha-content", "trigRound"); ui.notifications?.info(`Edha: reset once-per-round triggers on ${actor.name}.`); }
  catch (e) { console.error("Edha Content | resetTriggers failed", e); }
}

/* ==============================================================================================
 * NATIVE EVENT SYSTEM  (Edha behaviours hosted on the talent's own system.events / effects)
 * ----------------------------------------------------------------------------------------------
 * Talents carry their behaviour as native cosmere-rpg event rules — visible and editable on the
 * talent's Events tab — instead of (only) the parallel global hooks above. The generator emits
 * these rules from the data/talent-*.json tables. The executors below REUSE the existing helper
 * logic, so behaviour is identical; only the trigger path becomes native + inspectable.
 *
 * Registered at `init` (after the system's init exposes cosmereRPG.api): Foundry v13 initializes
 * world documents BEFORE the "setup" hook, so event/handler types must exist by end of init or
 * owned talents fail schema validation and are dropped. The system wires per-type hooks at
 * `ready` (index.js ~L11975). Handlers/behaviours are read at fire time, so timing is loose.
 * ============================================================================================ */

// Resolve the presumed killer for an on-defeat event (the hook only names the victim).
function edhaResolveKiller(victim) {
  for (const t of (canvas?.tokens?.controlled ?? [])) if (t.actor && t.actor !== victim) return t.actor;
  if (game.user?.character && game.user.character !== victim) return game.user.character;
  if (game.user?.isGM) { const a = game.combat?.combatant?.actor; if (a && a !== victim) return a; }
  return null;
}

// Build the legacy trigger `spec` (consumed by edhaFireTrigger/edhaRunTriggerEffect) from a native
// edha-triggered-effect handler's flat config fields.
function edhaTrigSpecFromCfg(cfg) {
  return {
    effect: {
      kind: cfg.kind, formula: cfg.formula, damageType: cfg.damageType,
      target: cfg.target, radius: cfg.radius, statusId: cfg.statusId || "",
      statusExpire: cfg.statusExpire || "",   // "owner"/"target" → timed stamp instead of a permanent toggle (07-16b)
      resourceGain: cfg.resourceGainResource ? { resource: cfg.resourceGainResource, value: cfg.resourceGainValue || 0 } : null,
    },
    cost: cfg.costResource ? { resource: cfg.costResource, value: cfg.costValue || 0, optional: !!cfg.costOptional } : null,
    oncePerRound: !!cfg.oncePerRound,
    whenTargetIsolated: !!cfg.whenTargetIsolated,
    note: cfg.note || "",
  };
}

// Temp HP grant from a native edha-temp-hp rule (mirrors the legacy useItem THP path).
async function edhaApplyTempHp(item, cfg) {
  if (!item?.actor || !cfg?.formula) return;
  const { actor: target, via } = edhaThpTarget(item, cfg.target || "targeted");
  if (!target) { ui.notifications?.warn(`Edha: ${item.name} found no target for Temp HP.`); return; }
  const roll = await (new Roll(cfg.formula, item.actor.getRollData())).evaluate();
  await edhaWriteTempHp(target, roll.total, item.name);
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), flavor: `${item.name} — Temp HP → <strong>${target.name}</strong> (${via}): ${roll.total}, replacing any previous.` });
}

/* --- Dangerous terrain: Foundry v13 Region with the edha-content.hazard behaviour ------------- */
/* Regions render as GM-only overlays — at the 2026-06-11 playtest, players walked into Demolisher's
 * Pyre because the fire was INVISIBLE to them. Every hazard Region now gets a paired player-visible
 * Drawing (flame-colored circle); deleting the Region (or the GM clearing terrain) removes it too. */
async function edhaHazardVisual(scene, cx, cy, radiusPx, hex, regionId, label) {
  try {
    const [d] = await scene.createEmbeddedDocuments("Drawing", [{
      x: cx - radiusPx, y: cy - radiusPx,
      shape: { type: "e", width: radiusPx * 2, height: radiusPx * 2 },
      strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
      text: label || "🔥 Dangerous Terrain", fontSize: Math.max(16, Math.round(radiusPx / 3)), textColor: hex, textAlpha: 0.9,
      flags: { "edha-content": { hazardVisual: { regionId } } },
    }]);
    return d ?? null;
  } catch (e) { console.error("Edha Content | hazard visual failed", e); return null; }
}
Hooks.on("deleteRegion", (region) => {
  try {
    if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;
    const scene = region.parent; if (!scene) return;
    const paired = (scene.drawings ?? []).filter(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
    if (paired.length) void scene.deleteEmbeddedDocuments("Drawing", paired.map(d => d.id));
  } catch (e) { console.error("Edha Content | hazard visual cleanup failed", e); }
});
/* --- SQUARE terrain toolkit (2026-07-12 region rework, Ben pass 3: "I do not like circular Pyre
 * regions. Make them the same shape as the Foundation … expansion square-by-square … a way to
 * remove the region by the player") --------------------------------------------------------------
 * Regions hold MULTIPLE rectangle shapes — square-by-square growth = pushing one grid-cell rect
 * per expansion, each with its own small visual Drawing (same hazardVisual.regionId flag, so the
 * deleteRegion sweep above clears them all). */
function edhaSnapCellRect(scene, x, y, cells = 1) {
  const gs = scene?.grid?.size || 100;
  const w = gs * cells;
  return { x: Math.round((x - w / 2) / gs) * gs, y: Math.round((y - w / 2) / gs) * gs, w, h: w };
}
async function edhaSquareVisual(scene, x, y, w, h, hex, regionId, label) {
  try {
    const [d] = await scene.createEmbeddedDocuments("Drawing", [{
      x, y, shape: { type: "r", width: w, height: h },
      strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
      text: label || "", fontSize: Math.max(14, Math.round(w / 5)), textColor: hex, textAlpha: 0.9,
      flags: { "edha-content": { hazardVisual: { regionId } } },
    }]);
    return d ?? null;
  } catch (e) { console.error("Edha Content | square visual failed", e); return null; }
}
function edhaRectsOf(region) { return (region?.shapes ?? []).filter(s => s.type === "rectangle" && !s.hole); }
function edhaRectAdjacent(region, r) {   // touching or overlapping any existing rect (Chebyshev on bounds)
  return edhaRectsOf(region).some(s =>
    r.x <= s.x + s.width + 1 && r.x + r.w >= s.x - 1 && r.y <= s.y + s.height + 1 && r.y + r.h >= s.y - 1);
}
function edhaRectCovered(region, r) {    // the cell's center is already inside an existing rect
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return edhaRectsOf(region).some(s => cx >= s.x && cx <= s.x + s.width && cy >= s.y && cy <= s.y + s.height);
}
// GM-side: add one grid cell to a square-terrain Region + its visual. Returns true if grown.
async function edhaGrowTerrainSquareGM(sceneId, regionId, x, y) {
  try {
    const scene = game.scenes?.get(sceneId); const region = scene?.regions?.get(regionId); if (!region) return false;
    const cell = edhaSnapCellRect(scene, x, y, 1);
    if (edhaRectCovered(region, cell)) { ui.notifications?.warn("Edha: that square is already burning."); return false; }
    if (!edhaRectAdjacent(region, cell)) { ui.notifications?.warn("Edha: pick a square ADJACENT to the existing terrain."); return false; }
    const shapes = foundry.utils.deepClone(region.shapes ?? []);
    shapes.push({ type: "rectangle", x: cell.x, y: cell.y, width: cell.w, height: cell.h, rotation: 0, hole: false });
    await region.update({ shapes });
    const hex = region.color?.css ?? region.color ?? "#d23b2e";
    await edhaSquareVisual(scene, cell.x, cell.y, cell.w, cell.h, typeof hex === "string" ? hex : "#d23b2e", region.id, "");
    return true;
  } catch (e) { console.error("Edha Content | square grow failed", e); return false; }
}
// Remove a terrain Region entirely (its visuals follow via the deleteRegion sweep). Player-safe:
// non-GMs relay ("turn off this magic fire before it burns the building down with us inside").
async function edhaRemoveTerrain(sceneId, regionId) {
  if (game.user?.isGM) { try { await game.scenes?.get(sceneId)?.regions?.get(regionId)?.delete(); } catch (e) {} return; }
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to remove the terrain."); return; }
  try { game.socket.emit("module.edha-content", { action: "remove-terrain", payload: { sceneId, regionId } }); } catch (e) {}
}
class EdhaHazardRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      events: this._createEventsField({ events: ["tokenEnter", "tokenTurnStart"], initial: ["tokenEnter", "tokenTurnStart"] }),
      damageFormula: new FF.StringField({ required: true, initial: "1d6", label: "Damage formula (baked dice)" }),
      damageType: new FF.StringField({ required: true, initial: "energy", label: "Damage type" }),
      sourceName: new FF.StringField({ required: false, initial: "", label: "Source" }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (game.users?.activeGM && !game.users.activeGM.isSelf) return;   // one applier (the primary GM)
      const actor = event?.data?.token?.actor;
      if (!actor) return;
      const roll = await (new Roll(this.damageFormula || "0")).evaluate();
      const amt = Math.max(0, Math.floor(roll.total));
      if (amt <= 0) return;
      await actor.applyDamage?.([{ amount: amt, type: this.damageType || "energy" }], { chatMessage: false });
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p>🔥 <strong>${actor.name}</strong> takes <strong>${amt}</strong> ${this.damageType || "energy"} from dangerous terrain${this.sourceName ? ` (${this.sourceName})` : ""}.</p>`,
      });
    } catch (e) { console.error("Edha Content | hazard region event failed", e); }
  }
}

// FATE / Olvarra — Snare trigger Region. Fires on tokenEnter (stops on the square) AND tokenMoveIn (a
// PASS-THROUGH along the move path), so a foe that merely crosses the square springs the Snare. Mirrors
// the hazard behavior; carries the owner + snareId so it can resolve the right Snare and gate to enemies.
class EdhaFateSnareRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      events: this._createEventsField({ events: ["tokenEnter", "tokenMoveIn"], initial: ["tokenEnter", "tokenMoveIn"] }),
      ownerUuid: new FF.StringField({ required: true, initial: "", label: "Snare owner UUID" }),
      snareId: new FF.StringField({ required: true, initial: "", label: "Snare id" }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (game.users?.activeGM && !game.users.activeGM.isSelf) return;   // one applier (the primary GM)
      const actor = event?.data?.token?.actor; if (!actor) return;
      if ((actor.system?.resources?.hea?.value ?? 1) <= 0) return;       // dead tokens don't spring traps
      const oref = await fromUuid(this.ownerUuid).catch(() => null); const owner = oref?.actor ?? oref;
      if (!owner) return;
      const snare = edhaGetSnares(owner).find(s => s.id === this.snareId); if (!snare) return;   // already sprung / stale
      const otok = edhaCasterToken(owner), mtok = actor.getActiveTokens?.()[0];
      if (otok && mtok && (mtok.document?.disposition ?? 1) === (otok.document?.disposition ?? 1)) return;   // only ENEMIES of the owner spring it
      await edhaFateSpringSnare(owner, snare, actor, { source: "Snare" });
    } catch (e) { console.error("Edha Content | fate-snare region event failed", e); }
  }
}

// Place a scene-scoped dangerous-terrain Region centred on the caster's target (GM-side).
async function edhaPlaceHazard(item, cfg) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor || !scene) return null;
    if (!game.user?.isGM) { ui.notifications?.warn(`Edha: placing ${item.name}'s dangerous terrain is GM-side (ask your GM).`); return null; }
    const color = cfg.color || edhaTalentColor(item) || "red";
    const rank = edhaColorRank(actor, color);
    const sizeFt = cfg.sizeByRank ? (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]) : (Number(cfg.sizeFt) || EDHA_SIZE_FT[2]);
    const center = Array.from(game.user?.targets ?? [])[0] ?? edhaCasterToken(actor);
    if (!center) { ui.notifications?.warn(`Edha: target a token/point for ${item.name}'s dangerous terrain.`); return null; }
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    // SQUARE region (07-12 rework, Ben: same shape as the Foundation) — sizeFt square, grid-snapped.
    const sq = edhaSnapCellRect(scene, center.center.x, center.center.y, Math.max(1, Math.round(sizeFt / gd)));
    const baked = Roll.replaceFormulaData(cfg.damageFormula || "(@tier)d6", actor.getRollData(), { missing: "0" });
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${item.name} — Dangerous Terrain`,
      color: hex,
      shapes: [{ type: "rectangle", x: sq.x, y: sq.y, width: sq.w, height: sq.h, rotation: 0, hole: false }],
      behaviors: [{
        type: "edha-content.hazard", name: "Dangerous Terrain",
        system: { damageFormula: baked, damageType: cfg.damageType || "energy", sourceName: `${item.name} — ${actor.name}` },
      }],
      flags: { "edha-content": { hazard: true, scope: "scene", sourceItem: item.name, sourceOwnerUuid: actor.uuid } },   // sourceItem read by the Pyre spread watcher
    }]);
    if (region) await edhaSquareVisual(scene, sq.x, sq.y, sq.w, sq.h, hex, region.id, `🔥 ${item.name}`);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card"><p>🔥 <strong>${item.name}</strong> leaves a <strong>${sizeFt} ft square</strong> of dangerous terrain — ${baked} ${cfg.damageType || "energy"} on enter / start of turn, for the scene.</p>`
        + (region ? `<button type="button" class="edha-extinguish-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="${item.name}">Extinguish (put the fire out)</button>` : "") + `</div>`,
    });
    return region;
  } catch (e) { console.error("Edha Content | place hazard failed", e); return null; }
}

function edhaRegisterNativeEventSystem() {
  const api = globalThis.cosmereRPG?.api || globalThis.game?.cosmereRPG?.api;
  // Region behaviour type (dangerous terrain) — declared in module.json documentTypes.
  try {
    if (CONFIG.RegionBehavior) {
      CONFIG.RegionBehavior.dataModels ??= {};
      CONFIG.RegionBehavior.typeLabels ??= {};
      CONFIG.RegionBehavior.dataModels["edha-content.hazard"] = EdhaHazardRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.hazard"] = "Edha: Dangerous Terrain";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.hazard"] = "fa-solid fa-fire";
      CONFIG.RegionBehavior.dataModels["edha-content.fate-snare"] = EdhaFateSnareRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.fate-snare"] = "Edha: Snare Trigger";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.fate-snare"] = "fa-solid fa-link";
      CONFIG.RegionBehavior.dataModels["edha-content.fortified"] = EdhaCivFortifiedRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.fortified"] = "Edha: Fortified Foundation";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.fortified"] = "fa-solid fa-chess-rook";
      // EXPERIMENT (no-ship-on-failure): the disposition-filtered movement cost — its own try so a
      // throw here can never take the three types above down with it.
      try {
        const EnemyCost = edhaBuildEnemyCostBehavior();
        if (EnemyCost) {
          CONFIG.RegionBehavior.dataModels["edha-content.enemy-cost"] = EnemyCost;
          CONFIG.RegionBehavior.typeLabels["edha-content.enemy-cost"] = "Edha: Difficult Terrain (enemies only)";
          if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.enemy-cost"] = "fa-solid fa-person-walking-dashed-line-arrow-right";
          _edhaEnemyCostRegistered = true;
        }
      } catch (e) { console.warn("Edha Content | enemy-cost experiment NOT registered — Bastion keeps the native blind cost (Ben R3)", e); }
    }
  } catch (e) { console.warn("Edha Content | hazard region behaviour registration failed", e); }

  if (!api?.registerItemEventType || !api?.registerItemEventHandlerType) {
    console.warn("Edha Content | cosmereRPG API not available — native event/handler types NOT registered.");
    return false;
  }
  const FF = foundry.data.fields;
  const choices = (...vals) => vals.reduce((o, v) => (o[v] = v || "(none)", o), {});

  /* ---- EVENT TYPES ---- */
  // The system fires cosmere-rpg.damageRoll TWICE per rollDamage (main roll + graze roll), so one
  // logical "you dealt damage" would dispatch twice. Debounce per rolling item: only the first fire
  // within 400ms counts (graze rolls also carry options.graze when distinguishable).
  const _edhaDealDebounce = new Map();
  api.registerItemEventType({
    source: "edha-content", type: "edha-deal-damage",
    label: "Edha: After You Deal Damage", description: "Fires after any of your items rolls damage.",
    hook: "cosmere-rpg.damageRoll",
    condition: (roll, src) => {
      try {
        if (!src?.actor) return false;                       // only owned items can trigger owner rules
        if (roll?.options?.graze) return false;              // explicit graze marker (when present)
        const key = src.uuid ?? src.id ?? src.name;
        const now = Date.now(), last = _edhaDealDebounce.get(key) || 0;
        if (now - last < 400) return false;                  // second fire of the same roll (graze)
        _edhaDealDebounce.set(key, now);
        return true;
      } catch (e) { return false; }
    },
    transform: (roll, src) => ({ document: src?.actor ?? src, options: { roll, sourceItem: src } }),
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-on-defeat",
    label: "Edha: When You Defeat a Creature", description: "Fires for you when a creature you damage drops to 0 HP.",
    hook: "cosmere-rpg.applyDamage",
    condition: (target, damage) => {
      try {
        if (_edhaInTrigger) return false;                    // a trigger's own damage must not chain kills
        if ((Number(damage?.dealt) || 0) <= 0) return false; // healing / zero never defeats
        return (target?.system?.resources?.hea?.value ?? 1) <= 0;
      } catch (e) { return false; }
    },
    transform: (target, damage) => ({ document: edhaResolveKiller(target) ?? target, options: { victim: target, damage } }),
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-take-damage",
    label: "Edha: After You Take Damage", description: "Fires for the victim after damage is applied to them.",
    hook: "cosmere-rpg.applyDamage",
    condition: (target, damage) => {
      try {
        if (_edhaInTrigger) return false;
        return (Number(damage?.dealt) || 0) > 0;
      } catch (e) { return false; }
    },
    transform: (target, damage) => ({ document: target, options: { damage, victim: target } }),
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-apply-watch",
    label: "Edha: Damage/Heal-Application Watcher", description: "Config-only rule read by the apply-damage engine (overflow Temp HP, damage conversion, marked-target triggers, HP-threshold prompts).",
    hook: "edha-content.noop-apply-watch", // sentinel: never fired; the applyDamage wrapper reads these rules
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-pre-deal-damage",
    label: "Edha: Passive Damage Rider", description: "Adds bonus damage to your matching damage rolls (applied automatically by the system).",
    hook: "edha-content.noop-rider",   // sentinel: never fired; the rollDamage wrapper reads this rule
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-pre-test",
    label: "Edha: Test Modifier Rider", description: "Adds a bonus to your matching skill/attack TEST (applied automatically via the system's temporary modifier).",
    hook: "edha-content.noop-test-rider",   // sentinel: never fired; the pre{Skill|Attack|Item}Roll injector reads this rule
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-on-hit",
    label: "Edha: When You Hit (Apply Damage)", description: "Fires when YOUR attack actually deals damage to a creature (a real hit — not just a roll). Pair with an Edha: Triggered Effect.",
    hook: "edha-content.noop-on-hit",   // sentinel: never fired by the system; the applyDamage wrapper dispatches these
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-pre-use",
    label: "Edha: Takes Over Item Use", description: "This talent's use is taken over by a custom resolution (e.g. a point-targeted burst). The engine reads this rule's config.",
    hook: "edha-content.noop-pre-use", // sentinel: never fired; the preUseItem takeover reads this rule
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-combat-timing",
    label: "Edha: Combat-Timed Passive", description: "Active during a combat-timing window (e.g. round start until your turn). The engine's combat hooks read this rule's config.",
    hook: "edha-content.noop-combat-timing", // sentinel: never fired; the combat hooks read this rule
  });
  api.registerItemEventType({
    source: "edha-content", type: "edha-opportunity",
    label: "Edha: When You Roll an Opportunity", description: "Adds an entry to the Opportunity-spend menu card that posts when any of your tests shows an Opportunity (plot die or d20 range). Pair with an Edha: Opportunity Option.",
    hook: "edha-content.noop-opportunity",   // sentinel: never fired; the post-roll Opportunity watcher reads these rules
  });

  /* ---- HANDLER TYPES (config schemas auto-render in the rule editor) ---- */
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-triggered-effect",
    label: "Edha: Triggered Effect", description: "Deal damage / AoE / heal / Temp HP / affliction when this rule fires.",
    config: { schema: {
      whenDamageType: new FF.StringField({ required: false, initial: "any", label: "Only when you dealt damage type(s)", hint: "'any' or a comma-list: energy, impact, keen, spirit, vital (deal-damage rules only)" }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 5 ft of the target (Black tree; 07-05 ruling)." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. weakened — checks the victim (or your current target) before firing. Predatory Patience: Investiture only vs Weakened." }),
      kind: new FF.StringField({ required: true, initial: "damage", choices: choices("damage", "damage-aoe", "heal", "thp", "affliction", "status"), label: "Effect kind" }),
      statusId: new FF.StringField({ required: false, blank: true, initial: "", label: "Status to apply (kind=status)", hint: "e.g. weakened, afflicted, slowed" }),
      statusExpire: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "owner", "target"), label: "Status expiry (kind=status)", hint: "owner/target = expires end of that side's next turn (timed stamp); blank = until removed" }),
      formula: new FF.StringField({ required: true, initial: "", label: "Formula", hint: "[Tier][Die] = (@tier)d(2 * @skills.<color>.rank + 2)" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital", "heal"), label: "Damage type" }),
      target: new FF.StringField({ required: true, initial: "prompt", choices: choices("self", "victim", "near-victim", "prompt"), label: "Target" }),
      radius: new FF.NumberField({ required: false, initial: 0, label: "AoE radius (ft)" }),
      resourceGainResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc"), label: "Resource gained" }),
      resourceGainValue: new FF.NumberField({ required: false, initial: 0, label: "Resource gained amount" }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc", "opportunity"), label: "Cost resource" }),
      costValue: new FF.NumberField({ required: false, initial: 0, label: "Cost amount" }),
      costOptional: new FF.BooleanField({ required: false, initial: false, label: "Optional cost (prompt)" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: false, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown to players)" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item; const owner = item?.actor;
        if (!owner || _edhaInTrigger) return;
        // Damage-type filter (deal-damage rules): match the triggering roll's damage type.
        const dtype = event.options?.roll?.options?.damageType ?? event.options?.sourceItem?.system?.damage?.type;
        if (this.whenDamageType && this.whenDamageType !== "any" && dtype && !edhaRiderMatches(this.whenDamageType, dtype)) return;
        // Target-status gate (Predatory Patience: Investiture only on a hit vs a Weakened creature). For
        // deal-damage/use events there's no event victim → fall back to your current target.
        if (this.whenTargetStatus) {
          const tgt = event.options?.victim ?? Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
          if (!tgt?.statuses?.has?.(this.whenTargetStatus)) return;
        }
        const spec = edhaTrigSpecFromCfg(this);
        const ctx = { victim: event.options?.victim ?? null };
        // Optional-cost triggers (Arc Flash, Afterburn) need the player to target a 2nd creature and decide
        // → a chat-card button. Unconditional triggers fire immediately.
        if (spec.cost?.optional) edhaPostTriggerCard(owner, item.name, spec, ctx);
        else await edhaFireTrigger(owner, item.name, spec, ctx);
      } catch (e) { console.error("Edha Content | edha-triggered-effect executor failed", e); }
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-damage-rider",
    label: "Edha: Damage Rider", description: "Passively adds bonus damage to your matching damage rolls.",
    config: { schema: {
      appliesTo: new FF.StringField({ required: true, initial: "any", label: "Applies to damage type(s)", hint: "'any' or a comma-list: energy, impact, keen, spirit, vital, heal" }),
      bonusFormula: new FF.StringField({ required: true, initial: "", label: "Bonus formula", hint: "e.g. @skills.red.mod or (1 + @tier)" }),
      whenTargetCondition: new FF.BooleanField({ required: false, initial: false, label: "Only when the target has a condition", hint: "Prognosis: heal riders that apply only vs conditioned creatures (checks your current target)." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. diagnosed, weakened (checks your current target)" }),
      whenMovedTowardFt: new FF.NumberField({ required: false, initial: 0, label: "Only after charging ≥ N ft toward the target this turn", hint: "Momentum's Edge: net displacement toward your current target this turn must be ≥ this (0 = off). Bonus = your Speed via @movement.walk.rate." }),
      whenTargetFooled: new FF.BooleanField({ required: false, initial: false, label: "Only when the target believes your seeming", hint: "Spearing Beak: reads the caster's phantom-copy belief ledger (edhaTargetFooled). MUST be declared here — an unregistered schema field is silently STRIPPED by the DataModel (bench 07-17: the built rule carried it, the loaded rule didn't, so the +1d6 would have applied unconditionally)." }),
      lightRadiusFt: new FF.NumberField({ required: false, initial: 0, label: "Damaged creatures shed light (ft, 0 = none)", hint: "Kindle: creatures that take this damage type from you emit a flame light of this radius until end of scene." }),
    } },
    executor: async function () { /* applied by the rollDamage wrapper (edhaRiderBonus reads this rule) */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-test-rider",
    label: "Edha: Test Modifier Rider", description: "Passively adds a bonus to your matching skill/attack TEST (injected as the system's temporary modifier).",
    config: { schema: {
      appliesTo: new FF.StringField({ required: true, initial: "any", choices: choices("any", "attack", "skill", "item"), label: "Applies to test type", hint: "'any' or one of: attack, skill, item" }),
      bonusFormula: new FF.StringField({ required: true, initial: "", label: "Bonus formula", hint: "[Die] = 1d(2 * @skills.<color>.rank + 2). Resolved against your roll data, then added to the d20 test." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. weakened (checks your current target). Predatory Patience uses weakened." }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 5 ft of the target (Black tree; 07-05 ruling)." }),
      whenAttribute: new FF.StringField({ required: false, blank: true, initial: "", label: "Only on tests of these attribute(s)", hint: "comma-list of str, spd, int, wil, awa, pre. Burning Drive: 'str, spd' (Physical)." }),
      whenFastTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on a Fast turn", hint: "Reads combatant turnSpeed (Momentum fast-turn payoffs)." }),
      firstTestThisTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on your first test this turn", hint: "Burning Drive." }),
    } },
    executor: async function () { /* applied by the pre-roll injector (edhaTestRiderApply reads this rule) */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-move",
    label: "Edha: Forced Movement (caster)", description: "Relocate the caster toward their current target, ignoring Reactions, halting at walls. PILOT (Red): enforced, not GM-narrated.",
    config: { schema: {
      bySize: new FF.BooleanField({ required: false, initial: true, label: "Distance = [Size] (scales with Red rank)" }),
      byHalfSpeed: new FF.BooleanField({ required: false, initial: false, label: "Distance = half your Speed", hint: "Unstoppable. Reads system.movement.walk.rate." }),
      distanceFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed distance (ft, if neither above)" }),
      whenFastTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on a Fast turn", hint: "Unstoppable." }),
      oncePerTurn: new FF.BooleanField({ required: false, initial: false, label: "Once per turn" }),
      requireTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Target must be Isolated", hint: "Cruel Step. No living ally adjacent to the target (edhaIsIsolated); otherwise warn + no move." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { try { await edhaRunMove(event.item, this); } catch (e) { console.error("Edha Content | edha-move executor failed", e); } },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-push",
    label: "Edha: Push Target + Collision", description: "Shove the creature you hit away from you (wall-aware); on a wall collision, deal the collision damage. PILOT (Red). Pair with event edha-on-hit.",
    config: { schema: {
      whenDamageType: new FF.StringField({ required: false, initial: "impact", label: "Only when you dealt damage type(s)", hint: "'any' or a comma-list. Shockwave Slam: impact (melee)." }),
      bySize: new FF.BooleanField({ required: false, initial: true, label: "Push distance = [Size] (scales with Red rank)" }),
      distanceFt: new FF.NumberField({ required: false, initial: 5, label: "Fixed push distance (ft, if not by size)" }),
      collisionFormula: new FF.StringField({ required: false, blank: true, initial: "floor((@tier)d(2 * @skills.red.rank + 2) / 2)", label: "Collision damage formula (blank = none)" }),
      collisionType: new FF.StringField({ required: false, initial: "impact", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Collision damage type" }),
      note: new FF.StringField({ required: false, initial: "Shockwave Slam", label: "Note" }),
    } },
    executor: async function () { /* config-only: edhaDispatchOnHit reads this rule and calls edhaRunPush */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-rally-stack",
    label: "Edha: Rally Stack", description: "A stacking +1-to-your-tests counter (max = Red rank) that resets each turn or round. Battle Fever / Feeding Frenzy. Allies-in-range sharing is narrated.",
    config: { schema: {
      trigger: new FF.StringField({ required: true, initial: "deal-damage", choices: choices("deal-damage", "manual"), label: "Bump on", hint: "deal-damage = your damage feeds it (Battle Fever); manual = bumped by edha.rally() (Feeding Frenzy: enemy-attacks-enemy has no hook)." }),
      resetOn: new FF.StringField({ required: true, initial: "turn", choices: choices("turn", "round"), label: "Resets at start of", hint: "Battle Fever: turn. Feeding Frenzy: round." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { try { if ((this.trigger || "deal-damage") === "deal-damage") edhaRallyOnDeal(event.item?.actor); } catch (e) { console.error("Edha Content | edha-rally-stack executor failed", e); } },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-burst",
    label: "Edha: Point-Targeted Burst", description: "Click-to-place a burst template, then Detonate: capture everyone inside, roll once, auto-save for half, apply, optionally drop terrain.",
    config: { schema: {
      sizeByRank: new FF.BooleanField({ required: false, initial: true, label: "Size scales with leyline rank" }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed size (ft, if not by rank)" }),
      affects: new FF.StringField({ required: true, initial: "enemies", choices: choices("enemies", "allies", "all", "none"), label: "Affects" }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Color (scaling/override)" }),
      rangeByRank: new FF.BooleanField({ required: false, initial: true, label: "Placement range = Attunement Range (by rank)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed placement range (ft, if not by rank)" }),
      saveSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Save skill (blank = no save)", hint: "e.g. ath — each captured enemy rolls this vs your save DC for half damage" }),
      saveVs: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Save DC vs your color" }),
      addSkillMod: new FF.StringField({ required: false, blank: true, initial: "", label: "Add skill mod to damage", hint: "e.g. red — matches the system's skill_test full-hit damage" }),
      heal: new FF.BooleanField({ required: false, initial: false, label: "Heal (instead of damage)" }),
      terrain: new FF.BooleanField({ required: false, initial: false, label: "Leave dangerous terrain at the point" }),
    } },
    executor: async function () { /* config-only: the preUseItem takeover reads this rule (edhaBurstRule) */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-defense-buff",
    label: "Edha: Combat-Timed Defense Buff", description: "Grants +N to the listed defenses during a combat-timing window (managed automatically by the combat tracker).",
    config: { schema: {
      amount: new FF.NumberField({ required: true, initial: 2, label: "Bonus amount" }),
      defenses: new FF.StringField({ required: true, initial: "phy, cog, spi", label: "Defenses (comma list)", hint: "any of: phy, cog, spi" }),
      window: new FF.StringField({ required: true, initial: "round-until-turn", choices: choices("round-until-turn"), label: "Active window" }),
      label: new FF.StringField({ required: false, initial: "", label: "Effect name (shown on the actor)" }),
      img: new FF.StringField({ required: false, initial: "icons/svg/shield.svg", label: "Effect icon" }),
    } },
    executor: async function () { /* config-only: the combat hooks read this rule (edhaDefBuffFor) */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-aoe-template",
    label: "Edha: AoE Template", description: "Drop a [Size] burst on use and auto-target the captured tokens for this talent's card.",
    config: { schema: {
      sizeByRank: new FF.BooleanField({ required: false, initial: true, label: "Size scales with leyline rank" }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed size (ft, if not by rank)" }),
      affects: new FF.StringField({ required: true, initial: "enemies", choices: choices("enemies", "allies", "all", "none"), label: "Affects" }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Color (scaling/override)" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaPlaceAoe(item, { area: { shape: "circle", sizeByRank: !!this.sizeByRank, sizeFt: this.sizeFt }, affects: this.affects || "enemies", color: this.color || null });
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-place-hazard",
    label: "Edha: Place Dangerous Terrain", description: "Drop a scene-long dangerous-terrain Region that damages tokens on enter / start of turn.",
    config: { schema: {
      sizeByRank: new FF.BooleanField({ required: false, initial: false, label: "Size scales with leyline rank" }),
      sizeFt: new FF.NumberField({ required: false, initial: 10, label: "Size (ft)" }),
      damageFormula: new FF.StringField({ required: true, initial: "(@tier)d(2 * @skills.red.rank + 2)", label: "Damage formula" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      color: new FF.StringField({ required: false, blank: true, initial: "red", choices: choices("white", "blue", "black", "red", "green"), label: "Color" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaPlaceHazard(item, this); },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-temp-hp",
    label: "Edha: Grant Temp HP", description: "Roll a formula on use and set it as the target's Edha Temp HP.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "", label: "Temp HP formula" }),
      target: new FF.StringField({ required: true, initial: "targeted", choices: choices("targeted", "self"), label: "Target" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaApplyTempHp(item, this); },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-ritual-hp-cost",
    label: "Edha: Ritual HP Cost", description: "On use, the caster loses health = formula. Flags Blood Price's advantage and (with Sanguine Reservoir) banks the lost HP as Reserve.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "@tier", label: "HP lost (formula)", hint: "Rolled on use. e.g. @tier, or floor((1d(2 * @skills.black.rank + 2)) / 2) for 'half [Die]'." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaRitualHpCost(item, this); },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-opportunity-option",
    label: "Edha: Opportunity Option", description: "An entry on the Opportunity-spend menu card (posts when one of your tests rolls an Opportunity). Pair with event Edha: When You Roll an Opportunity. The Opportunity itself is trusted (never auto-deducted); the listed resource cost IS deducted on click.",
    config: { schema: {
      label: new FF.StringField({ required: true, initial: "", label: "Menu label", hint: "What the button offers, e.g. 'Advantage on your next Deception test this round'." }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc"), label: "Cost resource (besides the Opportunity)" }),
      costValue: new FF.NumberField({ required: false, initial: 0, label: "Cost amount" }),
      kind: new FF.StringField({ required: true, initial: "adv-next-test", choices: choices("adv-next-test", "note"), label: "Effect", hint: "adv-next-test = advantage on your next <skill> test this round; note = post the note (table-run)." }),
      skill: new FF.StringField({ required: false, blank: true, initial: "", label: "Skill id (adv-next-test)", hint: "e.g. dec (Deception), ath (Athletics)" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown on the card / posted for kind=note)" }),
    } },
    executor: async function () { /* config-only: the post-roll Opportunity watcher reads this rule (edhaOpportunityMenuWatch) */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-heal-cut",
    label: "Edha: Halve Healing On Hit (Necrotic Grasp)", description: "When you hit a creature with a matching-color attack, its healing received is halved until the end of your next turn. Applied automatically at damage application.",
    config: { schema: {
      color: new FF.StringField({ required: false, blank: true, initial: "black", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only on this color's attacks", hint: "blank = any of your attacks; 'black' = Black-talent hits only (Necrotic Grasp)." }),
      fraction: new FF.NumberField({ required: false, initial: 0.5, label: "Healing multiplier", hint: "0.5 = halved." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-summon",
    label: "Edha: Summon", description: "Spawn a token scaled to the caster when this talent is used.",
    config: { schema: {
      summonName: new FF.StringField({ required: true, initial: "", label: "Summon name" }),
      img: new FF.StringField({ required: false, initial: "", label: "Token image" }),
      hpFormula: new FF.StringField({ required: true, initial: "(@tier)d6", label: "HP formula" }),
      speed: new FF.NumberField({ required: false, initial: 25, label: "Speed (ft)" }),
      defensePenalty: new FF.NumberField({ required: false, initial: 2, label: "Defenses = caster − N" }),
      deflect: new FF.NumberField({ required: false, initial: 0, label: "Deflect (0 = none)" }),
      conditionImmunities: new FF.StringField({ required: false, initial: "", label: "Condition immunities (comma list)" }),
      attackName: new FF.StringField({ required: false, initial: "Attack", label: "Attack name" }),
      attackFormula: new FF.StringField({ required: false, initial: "", label: "Attack damage formula" }),
      attackType: new FF.StringField({ required: false, initial: "keen", label: "Attack damage type" }),
      attackRange: new FF.StringField({ required: false, initial: "melee", choices: choices("melee", "ranged"), label: "Attack range" }),
      actsAfterCaster: new FF.BooleanField({ required: false, initial: true, label: "Acts on caster's initiative" }),
      bakedEffectsJson: new FF.StringField({ required: false, blank: true, initial: "", label: "Baked ActiveEffects (JSON array — advanced)", hint: "Toggled-off mode effects on the summon, e.g. Siege Form. [{label, icon, disabled, changes:[{key,mode,value}], description}]" }),
      extraItemsJson: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra abilities (JSON array — advanced)", hint: "Additional baked actions, e.g. a Siege-Form ranged attack. [{name, actions, damageFormula, damageType, description}]" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      const pj = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
      await edhaSummon(item.actor, {
        name: this.summonName || item.name, img: this.img,
        hpFormula: this.hpFormula, speed: this.speed, defensePenalty: this.defensePenalty, deflect: this.deflect,
        conditionImmunities: String(this.conditionImmunities || "").split(/[,\s]+/).filter(Boolean),
        attack: this.attackFormula ? { name: this.attackName || "Attack", damageFormula: this.attackFormula, damageType: this.attackType || "keen", range: this.attackRange || "melee" } : null,
        actsAfterCaster: !!this.actsAfterCaster,
        bakedEffects: pj(this.bakedEffectsJson), extraItems: pj(this.extraItemsJson),
      });
    },
  });

  /* ---- v3 HANDLER TYPES (state marks, sweeps, apply-engine watchers) ---- */
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-apply-status",
    label: "Edha: Mark / Apply Status to Target", description: "On use, applies a status to your targeted creature and records you as the mark's owner. Optional: allies' damage vs the marked creature gains bonus damage.",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "diagnosed", label: "Status", hint: "e.g. diagnosed, weakened, insight" }),
      bonusDamageFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Bonus damage vs the marked target (flat formula)", hint: "Vital Diagnosis: @tier — added to ANY damage applied to the marked creature" }),
      bonusDamageType: new FF.StringField({ required: false, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Bonus damage type" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown in chat)" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaApplyStatusMark(item, this);
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-status-sweep",
    label: "Edha: Damage All [Status] Creatures In Range", description: "On use, every creature in range with the status takes the damage; optionally gain Temp HP equal to the total dealt (Spoils of Isolation).",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "weakened", label: "Status filter" }),
      rangeByRank: new FF.BooleanField({ required: false, initial: true, label: "Range = Attunement Range (by color rank)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed range (ft, if not by rank)" }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Color (range scaling)" }),
      damageFormula: new FF.StringField({ required: true, initial: "@tier", label: "Damage per creature (formula)" }),
      damageType: new FF.StringField({ required: false, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      thpFromTotal: new FF.BooleanField({ required: false, initial: false, label: "Gain Temp HP = total damage dealt" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaStatusSweep(item, this);
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-overflow-thp",
    label: "Edha: Heal Overflow Becomes Temp HP", description: "When this talent's healing would exceed the target's max HP, the excess becomes Edha Temp HP (applied automatically).",
    config: { schema: { note: new FF.StringField({ required: false, initial: "", label: "Note" }) } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-damage-convert",
    label: "Edha: Convert Damage Type vs State", description: "Your damage changes type when the victim matches a state (Severance: vs Isolated → vital). Applied automatically at damage application.",
    config: { schema: {
      toType: new FF.StringField({ required: true, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Convert to type" }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: true, label: "Only vs Isolated targets" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-marked-damage-trigger",
    label: "Edha: When Your Marked Creature Takes Damage", description: "When the creature bearing your mark/status takes damage from any source, you recover a resource (once per round). Applied automatically.",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "diagnosed", label: "Watched status (your mark)" }),
      resource: new FF.StringField({ required: true, initial: "inv", choices: choices("inv", "foc"), label: "Resource recovered" }),
      value: new FF.NumberField({ required: true, initial: 1, label: "Amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-gm-cue",
    label: "Edha: GM Cue Card", description: "Whispers the GM a reminder card when the trigger crosses (damaged / hp-below / ally-drops / seeming-break / on-hit / enemy-turn-start / turn-end). Config-only: the engine's watchers read this rule. REGISTRATION IS LOAD-BEARING — an unregistered handler type is silently dropped by the DataModel, exactly like a bad rule id.",
    config: { schema: {
      trigger: new FF.StringField({ required: true, initial: "damaged", choices: choices("damaged", "hp-below", "ally-drops", "seeming-break", "on-hit", "enemy-turn-start", "turn-end"), label: "Trigger" }),
      atFraction: new FF.NumberField({ required: false, initial: 0.5, label: "HP fraction crossed (hp-below; 0 = the drop)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Range ft (ally-drops / enemy-turn-start; 0 = anywhere)" }),
      everyNRounds: new FF.NumberField({ required: false, initial: 1, label: "Every N rounds (turn-end)" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Card text (author the cost into it)" }),
    } },
    executor: async function () { /* config-only: the engine's cue watchers read this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-pack-advantage",
    label: "Edha: Pack Advantage (Aggro Ledger)", description: "Attacking a creature that a living packmate (another token carrying this same item) last attacked → this attack rolls with advantage. Config-only: the pre-roll pipeline reads this rule via the aggro ledger.",
    config: { schema: {
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function () { /* config-only: the pack-advantage pre-roll reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-dark-veil",
    label: "Edha: Marker Auto-On In Darkness", description: "While the owner's token stands unlit, the named marker AE auto-enables (re-lit auto-disables only engine-enabled markers — a GM's manual cover toggle is never fought). Config-only: the dark-veil sweep reads this rule.",
    config: { schema: {
      effectName: new FF.StringField({ required: false, blank: true, initial: "", label: "Marker AE name prefix (blank = this item's name)" }),
    } },
    executor: async function () { /* config-only: the dark-veil sweep reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-self-status",
    label: "Edha: Apply Status To Yourself (On Use)", description: "On use, the user gains the status — timed (expires end of your next turn) or until removed. Brace-class defensive stances.",
    config: { schema: {
      statusId: new FF.StringField({ required: true, initial: "braced", label: "Status id" }),
      timed: new FF.BooleanField({ required: false, initial: true, label: "Expires (end of your next turn)" }),
    } },
    executor: async function (event) {
      const actor = event.item?.actor; if (!actor) return;
      if (this.timed !== false) await edhaApplyTimedStatus(actor, this.statusId || "braced", { owner: actor, expire: "owner" });
      else await edhaToggleStatus(actor, this.statusId || "braced", true);
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-next-test-mod",
    label: "Edha: Modify Target's Next Test (On Use)", description: "On use, the current target's next test gains (dis)advantage and/or a dice/flat modifier (Probability Net's −1d6). Rides the nextTestMod pipeline; counted, target consumes on their next test.",
    config: { schema: {
      mode: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "advantage", "disadvantage"), label: "Advantage mode" }),
      formula: new FF.StringField({ required: false, blank: true, initial: "", label: "Modifier formula (e.g. -1d6)" }),
      count: new FF.NumberField({ required: false, initial: 1, label: "Tests affected" }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
      if (!target) { ui.notifications?.warn(`Edha: ${item.name} — target the creature, then use again.`); return; }
      const mod = { source: item.name, count: Math.max(1, Number(this.count) || 1) };
      if (this.mode) mod.mode = this.mode;
      if (this.formula) mod.formula = this.formula;
      await edhaSetNextTestMod(target, mod);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎲 <strong>${item.name}</strong>: ${target.name}'s next test${this.mode ? ` is at <strong>${this.mode}</strong>` : ""}${this.mode && this.formula ? " and" : ""}${this.formula ? ` takes <strong>${this.formula}</strong>` : ""}.</p>` });
    },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-thorns",
    label: "Edha: Melee Splash-Back (Thorns)", description: "When a melee attacker damages the owner, the attacker takes the splash automatically (Cinder Coat). Config-only: the applyDamage wrapper reads this rule.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "1d4", label: "Splash formula" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      meleeOnly: new FF.BooleanField({ required: false, initial: true, label: "Melee/adjacent attackers only" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-hp-threshold",
    label: "Edha: When An Ally Drops To Half HP", description: "Posts a reaction prompt (chat-card button) when an ally character drops to half HP or below: optionally pay the cost to heal them. Applied automatically.",
    config: { schema: {
      healFormula: new FF.StringField({ required: true, initial: "", label: "Heal formula", hint: "[Tier][Die] = (@tier)d(2 * @skills.<color>.rank + 2)" }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "inv", choices: choices("", "inv", "foc", "opportunity"), label: "Cost resource" }),
      costValue: new FF.NumberField({ required: false, initial: 1, label: "Cost amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      includeSelf: new FF.BooleanField({ required: false, initial: false, label: "Also prompt when YOU drop to half" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown on the prompt)" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  });
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-multi-hit",
    label: "Edha: When You Hit Two Or More Creatures", description: "When a matching talent of yours captures 2+ creatures (burst/AoE), posts the talent's choice prompt (Flashpoint). Applied automatically.",
    config: { schema: {
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only talents of this color" }),
      resourceGainResource: new FF.StringField({ required: false, blank: true, initial: "inv", choices: choices("", "inv", "foc"), label: "Resource regained (button option)" }),
      resourceGainValue: new FF.NumberField({ required: false, initial: 1, label: "Resource amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Choice text (shown on the prompt)" }),
    } },
    executor: async function () { /* config-only: the burst/AoE engine reads this rule */ },
  });

  console.log("Edha Content | native event system registered (events: edha-deal-damage, edha-on-defeat, edha-take-damage [+sentinels: apply-watch, pre-deal-damage, pre-test, on-hit, pre-use, combat-timing]; handlers: triggered-effect, damage-rider, test-rider, burst, defense-buff, aoe-template, place-hazard, temp-hp, ritual-hp-cost, heal-cut, summon, apply-status, status-sweep, overflow-thp, damage-convert, marked-damage-trigger, hp-threshold, multi-hit; region: edha-content.hazard, edha-content.fate-snare).");
  return true;
}

/* --- v3 executors: status marks + status sweeps ------------------------------------------------ */
// Apply a status to the user's targeted creature and record the mark owner on the victim
// (flags.edha-content.markedBy.<status> = { actorId, talent }). GM-relayed when needed.
async function edhaApplyStatusMark(item, cfg) {
  try {
    const owner = item.actor;
    const victim = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
    if (!victim) { ui.notifications?.warn(`Edha: target a creature for ${item.name}.`); return; }
    const status = cfg.status || "diagnosed";
    const mark = { actorId: owner.id, talent: item.name };
    if (victim.isOwner) {
      await victim.toggleStatusEffect?.(status, { active: true });
      await victim.setFlag("edha-content", `markedBy.${status}`, mark);
    } else if (game.users?.activeGM) {
      game.socket.emit("module.edha-content", { action: "apply-status-mark", payload: { actorUuid: victim.uuid, statusId: status, mark } });
    } else { ui.notifications?.warn(`Edha: a GM must be online to mark ${victim.name}.`); return; }
    const label = EDHA_STATUSES[status]?.label ?? status;
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🎯 <strong>${item.name}</strong>: <strong>${victim.name}</strong> is <strong>${label}</strong> (by ${owner.name})` +
        (cfg.bonusDamageFormula ? ` — damage against it gains +${edhaEvalSync(cfg.bonusDamageFormula, owner.getRollData())} ${cfg.bonusDamageType || "vital"} (auto-applied)` : "") +
        `.${cfg.note ? ` <span style="opacity:.8">${cfg.note}</span>` : ""}</p>`,
    });
  } catch (e) { console.error("Edha Content | apply status mark failed", e); }
}
// Damage every creature in range bearing a status; optionally Temp HP = total dealt (Spoils of Isolation).
async function edhaStatusSweep(item, cfg) {
  try {
    const actor = item.actor;
    const tok = edhaCasterToken(actor);
    if (!tok) { ui.notifications?.warn(`Edha: select/drop your token to use ${item.name}.`); return; }
    const color = cfg.color || edhaTalentColor(item) || "black";
    const rank = edhaColorRank(actor, color);
    const ft = cfg.rangeByRank ? (EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1]) : (Number(cfg.rangeFt) || 30);
    const status = cfg.status || "weakened";
    const victims = edhaTokensWithin(tok, ft).map(t => t.actor).filter(a => a && a !== actor && a.statuses?.has?.(status));
    const label = EDHA_STATUSES[status]?.label ?? status;
    if (!victims.length) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${item.name}</strong> — no ${label} creature within ${ft} ft.</p>` });
      return;
    }
    const amt = Math.max(0, Math.floor(edhaEvalSync(cfg.damageFormula || "@tier", actor.getRollData())));
    const hits = victims.map(v => ({ actorUuid: v.uuid, amount: amt, type: cfg.damageType || "vital", heal: false }));
    const payload = { hits, casterActorUuid: actor.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else {
      if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to apply the damage."); return; }
      game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    }
    const total = amt * victims.length;
    if (cfg.thpFromTotal && total > 0) await edhaWriteTempHp(actor, total, item.name);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>☠️ <strong>${item.name}</strong> — ${amt} ${cfg.damageType || "vital"} to each ${label} creature within ${ft} ft: ${victims.map(v => v.name).join(", ")}` +
        (cfg.thpFromTotal ? ` — <strong>${actor.name}</strong> gains <strong>${total}</strong> Temp HP (total dealt)` : "") + `.</p>`,
    });
  } catch (e) { console.error("Edha Content | status sweep failed", e); }
}
// Multi-hit prompt (Flashpoint): called by the burst/AoE engine with the number of captured creatures.
function edhaCheckMultiHit(actor, item, count) {
  try {
    if (!actor || !(count >= 2)) return;
    const rule = edhaActorRuleOf(actor, "edha-multi-hit");
    const h = rule?.handler;
    if (!h) return;
    const color = h.color || "";
    if (color && edhaTalentColor(item) !== color) return;
    const spec = {
      effect: { kind: "heal", formula: "0", target: "self",
        resourceGain: h.resourceGainResource ? { resource: h.resourceGainResource, value: Number(h.resourceGainValue) || 1 } : null,
        // Ben pass 3 (07-12): the advantage half was a "manual reminder" — the nextTestMod primitive
        // already existed (Red/Blue attunement), so the click now ARMS it (skill-gated to the color).
        nextTestMod: color ? { mode: "advantage", skill: color } : null },
      cost: null,   // free choice — the chat-card button is just the confirm
      oncePerRound: h.oncePerRound !== false,
      note: h.note || `${item.name} hit ${count} creatures — choose: all affected lose a Reaction (manual), OR click to regain ${Number(h.resourceGainValue) || 1} ${EDHA_RES_LABEL[h.resourceGainResource] || h.resourceGainResource || "Investiture"} + advantage on your next ${color || "matching"} test this turn (armed on click).`,
    };
    edhaPostTriggerCard(actor, rule.item.name, spec, {});
  } catch (e) { console.error("Edha Content | multi-hit check failed", e); }
}
// Register at init — AFTER the system's own init exposes cosmereRPG.api + CONFIG.COSMERE (system
// scripts load before module scripts, so its init listener runs first), but BEFORE world documents
// initialize. Foundry v13's setupGame() runs initializeDocuments() BEFORE the "setup" hook, so a
// setup-time registration is too late: owned talents carrying edha-* event rules fail schema
// validation ("edha-deal-damage is not a valid choice") and get dropped from their actors.
Hooks.once("init", () => { try { edhaRegisterNativeEventSystem(); } catch (e) { console.error("Edha Content | native event system registration failed", e); } });

// Expose the sync API for macros / console: game.modules.get("edha-content").api.syncNow() OR edha.syncNow()
Hooks.once("ready", () => {
  // summon: looks up the named TALENT on the caster and reads its own edha-summon rule.
  const summonByTalent = (caster, name) => {
    const tal = caster?.items?.find(i => edhaIsTalent(i) && i.name === name);
    const h = tal ? edhaRuleOf(tal, "edha-summon") : null;
    if (!h) { ui.notifications?.warn(`Edha: ${name} has no edha-summon rule on ${caster?.name ?? "actor"}.`); return null; }
    const pj = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    return edhaSummon(caster, {
      name: h.summonName || name, img: h.img, hpFormula: h.hpFormula, speed: h.speed, defensePenalty: h.defensePenalty, deflect: h.deflect,
      conditionImmunities: String(h.conditionImmunities || "").split(/[,\s]+/).filter(Boolean),
      attack: h.attackFormula ? { name: h.attackName || "Attack", damageFormula: h.attackFormula, damageType: h.attackType || "keen", range: h.attackRange || "melee" } : null,
      actsAfterCaster: !!h.actsAfterCaster,
      bakedEffects: pj(h.bakedEffectsJson), extraItems: pj(h.extraItemsJson),
    });
  };
  const api = { syncNow: edhaSyncNow, syncActorTalents: edhaSyncActorTalents, syncAllCharacters: edhaSyncAllCharacters, syncAdversary: edhaSyncAdversaryActor, syncAllAdversaries: edhaSyncAllAdversaries, setTempHp: edhaSetTempHp, getTempHp: edhaGetTempHp, summon: summonByTalent, showRange: edhaShowRange, aoe: edhaPlaceAoe, drawMana: edhaDrawMana, grantDrawMana: edhaGrantDrawMana, resetTriggers: edhaResetTriggers, fixSettings: edhaFixSettings, clearKindleLights: edhaClearKindleLights, refreshDefBuffs: edhaRefreshDefBuffs, migrateDerivations: edhaMigrateDerivations, fixPcTokens: edhaFixPcTokens, isIsolated: edhaIsIsolated, toggleStatus: edhaToggleStatus, raiseStakes: edhaRaiseStakesApi, calculatedPatience: edhaCalculatedPatienceApi, rally: edhaRallyApi, skipBudget: (v) => { globalThis.edhaSkipBudget = !!v; return globalThis.edhaSkipBudget; }, debug: edhaSetDebug, debugSave: edhaDebugSave, debugsave: edhaDebugSave };   // lowercase alias — Ben typed edha.debugsave() at the 07-12 bench and got a TypeError
  const mod = game.modules?.get("edha-content");
  if (mod) mod.api = api;
  globalThis.edha = Object.assign(globalThis.edha || {}, api);
  console.log("Edha Content | sync API ready — edha.syncNow() / edha.syncAllCharacters() / edha.syncAllAdversaries() / edha.debug(true) test tracing / edha.debugSave() full-log download / game.modules.get('edha-content').api");
});

// EDHA test-debug tracer: all edha-content registrations are done — restore the untraced
// Hooks.on so later registrations (other modules, late system wiring) are NOT traced.
Hooks.on = edhaHooksOnRaw;
// end of file (v3 engine pass 2026-06-11)
