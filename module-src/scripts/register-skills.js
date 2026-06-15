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
};
function edhaRegisterStatuses(phase) {
  try {
    const COSMERE = globalThis.CONFIG?.COSMERE;
    if (!COSMERE?.statuses || !Array.isArray(CONFIG.statusEffects)) return false;
    let added = 0;
    for (const [id, def] of Object.entries(EDHA_STATUSES)) {
      if (!COSMERE.statuses[id]) COSMERE.statuses[id] = { label: def.label, icon: def.icon, condition: def.condition, ...(def.stackable ? { stackable: true } : {}) };
      if (!CONFIG.statusEffects.some(s => s.id === id)) {
        CONFIG.statusEffects.push({ id, name: def.label, img: def.icon, _id: def._id, ...(def.stackable ? { system: { isStackable: true, count: 1 } } : {}) });
        added++;
      }
    }
    if (added) console.log(`Edha Content | [${phase}] custom statuses registered: ${Object.keys(EDHA_STATUSES).join(", ")}`);
    return true;
  } catch (e) { console.error("Edha Content | status registration failed", e); return false; }
}
Hooks.once("init",  () => edhaRegisterStatuses("init"));   // after the system's registerStatusEffects
Hooks.once("setup", () => edhaRegisterStatuses("setup"));  // belt-and-braces (idempotent)

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
function edhaTestRiderApply(roll, source, config) {
  try {
    if (roll?.options?._edhaTestRider) return;                 // idempotent (a re-fired pre-roll)
    const actor = edhaD20RollActor(config);
    if (!actor?.items) return;
    const ctx = config?.data?.context;                         // "skill" | "attack" | "item"
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
    const parts = [];
    for (const tal of actor.items) {
      if (tal.type !== "talent") continue;
      for (const rule of edhaEventRules(tal)) {
        const h = rule?.handler;
        if (h?.type !== "edha-test-rider" || !h.bonusFormula) continue;
        if (h.appliesTo && h.appliesTo !== "any" && ctx && h.appliesTo !== ctx) continue;
        if (h.whenTargetStatus && !target?.statuses?.has?.(h.whenTargetStatus)) continue;
        if (h.whenTargetIsolated && !(target && edhaIsIsolated(target))) continue;
        if (h.whenAttribute) { const a = roll?.data?.skill?.attribute ?? config?.defaultAttribute; if (!String(h.whenAttribute).split(/[,\s]+/).filter(Boolean).includes(a)) continue; }   // Burning Drive: Physical (str/spd)
        if (h.whenFastTurn && !edhaIsFastTurn(actor)) continue;                                  // Momentum fast-turn payoffs
        if (h.firstTestThisTurn && !edhaIsFirstTestThisTurn(actor)) continue;                    // Burning Drive: first test only
        const resolved = Roll.replaceFormulaData(h.bonusFormula, actor.getRollData(), { missing: "0" });
        if (resolved) parts.push(resolved);
      }
    }
    const rally = edhaRallyBonus(actor);                                                          // Battle Fever / Feeding Frenzy stack
    if (rally > 0) parts.push(String(rally));
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
const EDHA_TIMED_STATUSES = new Set(["weakened", "immobilized"]);
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
function edhaRiderBonus(item, actor) {
  try {
    if (!actor || !item?.system?.damage) return null;
    const dtype = item.system.damage.type;
    if (!dtype) return null;
    const target = Array.from(game.user?.targets ?? [])[0]?.actor ?? null;   // for target-conditional riders
    const parts = [];
    for (const tal of actor.items) {
      if (tal.type !== "talent") continue;
      for (const rule of edhaEventRules(tal)) {
        const h = rule?.handler;
        if (h?.type !== "edha-damage-rider" || !h.bonusFormula) continue;
        if (!edhaRiderMatches(h.appliesTo, dtype)) continue;
        // Conditional riders (Prognosis: "+[Tier][Die] when healing a creature that has a condition"):
        // only apply when the current target carries a condition / the named status.
        if (h.whenTargetCondition) { if (!target || !edhaHasCondition(target)) continue; }
        if (h.whenTargetStatus)    { if (!target || !target.statuses?.has?.(h.whenTargetStatus)) continue; }
        if (h.whenMovedTowardFt)   { if (!target || edhaMovedTowardFt(actor, target) < Number(h.whenMovedTowardFt)) continue; }   // Momentum's Edge: charged ≥ N ft toward it
        parts.push(h.bonusFormula);
      }
    }
    return parts.length ? parts.join(" + ") : null;
  } catch (e) {
    console.error("Edha Content | rider bonus computation failed", e);
    return null;
  }
}

// The wrapper logic, shared by the libWrapper and manual-patch paths. (Deal-damage TRIGGERS are
// dispatched natively by the system's event engine off cosmere-rpg.damageRoll — not from here.)
function edhaWrapRollDamage(originalCall, options = {}) {
  const bonus = edhaRiderBonus(this, this.actor);
  if (bonus) {
    const base = options.overrideFormula ?? this.system?.damage?.formula;
    if (base) options = { ...options, overrideFormula: `${base} + ${bonus}` };
  }
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
    if (tal.type !== "talent") continue;
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
  if (_edhaLastDealer && _edhaLastDealer.type === dtype && (Date.now() - _edhaLastDealer.ts) < 15000) { const h = test(_edhaLastDealer.actor); if (h) return h; }
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
/* Apply-time state checks (v3) ------------------------------------------------------------------
 * Isolated = no ally (same-disposition token) within 10 ft of the victim's token (Black tree).
 * Marked   = the victim carries an Edha status (diagnosed/insight) placed by an edha-apply-status
 *            rule; flags.edha-content.markedBy.{status} = { actorId, talent } names the marker owner.
 */
function edhaIsIsolated(actor) {
  try {
    const tok = actor?.getActiveTokens?.()[0] ?? (actor?.isToken ? actor.token?.object : null);
    if (!tok) return false;
    const disp = tok.document?.disposition ?? 0;
    return !edhaTokensWithin(tok, 10).some(t => (t.document?.disposition ?? 0) === disp && (t.actor?.system?.resources?.hea?.value ?? 1) > 0);
  } catch (e) { return false; }
}
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
// First rule of the given handler type across an actor's talents → { item, handler } | null.
function edhaActorRuleOf(actor, type) {
  for (const tal of (actor?.items ?? [])) {
    if (tal.type !== "talent") continue;
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
      if (cut) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🩸 <strong>${target.name}</strong>'s healing is halved (Necrotic Grasp).</p>` });
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
    }
  } catch (e) { console.error("Edha Content | applyDamage pre-pass failed", e); }
  const result = originalCall(list, options);
  try {
    Promise.resolve(result).then(async () => {
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
      const dealt = list.some(i => (Number(i?.amount) > 0) && i?.type && i.type !== "heal");
      // ON-HIT (real hit) dealer-side effects — Black/Ritual + retrofitted Isolation triggers.
      if (dealt && dealer?.actor && dealer.actor !== target) {
        await edhaDispatchOnHit(dealer, target, list);   // Sapping Hex, Predatory Patience, Dark Investiture
        // Necrotic Grasp: on a Black-talent hit, halve the target's healing (end of owner's next turn).
        const hc = edhaActorRuleOf(dealer.actor, "edha-heal-cut");
        if (hc?.handler) {
          const color = hc.handler.color || "black";
          if (!color || edhaTalentColor(dealer.item) === color) {
            await edhaApplyHealCut(target, dealer.actor, Number(hc.handler.fraction) || 0.5, hc.item.name);
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🩸 <strong>${hc.item.name}</strong>: ${target.name}'s healing is halved until the end of ${dealer.actor.name}'s next turn.</p>` });
          }
        }
      }
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
      // WHITE / BULWARK — ally-damage reactions (heal-back / redirect / retaliate / revive cards).
      if (dealt) {
        const newHpB = Number(target.system?.resources?.hea?.value) || 0;
        void edhaBulwarkReactions(target, dealer, Math.max(0, prevHp - newHpB), prevHp, newHpB, !!options?.edhaRedirected);
      }
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
 * ============================================================================================ */

// ON-HIT dispatch: run the dealer's `edha-on-hit` triggered-effect rules against the creature actually
// hit. Owner-wide for passives (Sapping Hex/Predatory Patience); item-specific for attack talents that
// carry their own damage (Dark Investiture only afflicts on ITS OWN hit). Guarded against re-entrancy.
async function edhaDispatchOnHit(dealer, target, list) {
  const owner = dealer?.actor;
  if (!owner || _edhaInTrigger || owner === target) return;
  const dealtTypes = list.filter(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal").map(i => i.type);
  if (!dealtTypes.length) return;
  for (const tal of owner.items) {
    if (tal.type !== "talent") continue;
    const itemSpecific = !!tal.system?.damage?.formula;   // attack talent → only when IT dealt the damage
    if (itemSpecific && dealer.item !== tal) continue;
    for (const rule of edhaEventRules(tal)) {
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

/* --- Necrotic Grasp: healing halved on a Black-talent hit (expires end of OWNER's next turn) ------ */
function edhaHealCutFactor(actor) {
  let f = null;
  for (const e of (actor?.effects ?? [])) {
    const hc = e.getFlag?.("edha-content", "healCut");
    if (hc && Number(hc.fraction) > 0 && Number(hc.fraction) < 1) f = (f == null) ? Number(hc.fraction) : Math.min(f, Number(hc.fraction));
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
    await target.createEmbeddedDocuments("ActiveEffect", [{
      name: `${byName} — Healing Halved`,
      img: "icons/magic/death/hand-withered-gray.webp",
      changes: [],
      description: `<p>Healing received is halved (${byName}) until the end of ${owner?.name ?? "the caster"}'s next turn.</p>`,
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

/* --- RITUAL HP COST keystone: pay HP on use; flag Blood Price; bank Reserve ---------------------- */
async function edhaRitualHpCost(item, cfg) {
  try {
    const actor = item?.actor; if (!actor) return;
    const roll = await (new Roll(cfg.formula || "@tier", actor.getRollData())).evaluate();
    const amt = Math.max(0, Math.floor(roll.total));
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
 *  - Next-test advantage flag (Predatory Insight active half + reuses for any "advantage on next <skill>").
 *  - Siphoned Will — Hollow Command has no success hook, so its use posts a one-click focus-confirm card.
 * MANUAL by nature (no Foundry enforcement): Hollow Command/Puppeteer action-denial + forced actions,
 * Extract Thought reaction-denial.
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
async function edhaRunFocusWatch(target, oldFoc, newFoc) {
  // Predatory Insight: any creature reaching 0 focus → each owner regains 1 focus (no range limit).
  if (newFoc <= 0 && oldFoc > 0) {
    for (const owner of edhaCharacterOwnersOf("Predatory Insight")) if (owner !== target) await edhaGainFocus(owner, 1, "Predatory Insight");
  }
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
  }
  // Coercive Pressure: a creature in your Attunement Range that lost focus has disadvantage on its next
  // Cognitive (int/wil) test (once/round/creature) — consumed by the cog-disadvantage pre-roll below.
  for (const owner of edhaCharacterOwnersOf("Coercive Pressure")) {
    if (owner === target || !ttok) continue;
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
// "Advantage on your next <skill> test" flag (Predatory Insight → Deception). Consumed on the matching test.
function edhaAdvTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const sk = actor?.getFlag?.("edha-content", "advTest");
    if (!sk || roll?.data?.skill?.id !== sk) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | adv-test pre-roll failed", e); }
}
function edhaAdvTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const sk = actor?.getFlag?.("edha-content", "advTest");
    if (!sk || roll?.data?.skill?.id !== sk) return;
    void actor.unsetFlag("edha-content", "advTest");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>👁️ <strong>Predatory Insight</strong> — advantage spent on this ${sk.toUpperCase()} test.</p>` });
  } catch (e) { console.error("Edha Content | adv-test consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaCogDisadvPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaCogDisadvConsume);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaAdvTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaAdvTestConsume);
}
// On-use hooks (run on the using client): Predatory Insight active half + Siphoned Will confirm card.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    if (item.name === "Predatory Insight" && edhaOwnsTalent(actor, "Predatory Insight")) {
      void actor.setFlag("edha-content", "advTest", "dec");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>👁️ <strong>Predatory Insight</strong>: advantage on your next Deception test (spend the Opportunity).</p>` });
    }
    // Siphoned Will: Hollow Command has no "success" hook → post a one-click confirm to regain focus = tier.
    if (item.name === "Hollow Command" && edhaOwnsTalent(actor, "Siphoned Will")) {
      const tier = Math.max(1, Number(actor.system?.tier) || 1);
      edhaPostTriggerCard(actor, "Siphoned Will", {
        effect: { kind: "heal", formula: "0", target: "self", resourceGain: { resource: "foc", value: tier } },
        cost: null, oncePerRound: false,
        note: `If Hollow Command landed, click to regain ${tier} focus (Siphoned Will).`,
      }, {});
    }
  } catch (e) { console.error("Edha Content | Subjugation use-hook failed", e); }
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
 *  - Manual by nature: Unity of Purpose (aid is untracked → edha.raiseStakes API + a note), Ordered
 *    Advance (no opportunity-attack hook → cost wired by activation + a round-marker note on use).
 * ============================================================================================ */

/* --- Tool A: the Plot-Die grant primitive ------------------------------------------------------- */
// "Raise the stakes on your next (optionally skill-gated) test." Mirrors edhaAdvTest{PreRoll,Consume}.
function edhaPlotDiePreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (!g) return;
    if (g.skill && roll?.data?.skill?.id !== g.skill) return;     // skill-gated grant waits for the matching test
    roll.options.plotDie = true; roll.configureModifiers?.();      // adds the PlotDie term on fast-forward rolls
    const orig = roll.configureDialog?.bind(roll);                 // dialog rolls: pre-check the "Raise the Stakes" box
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.raiseStakes = true; data.plotDie ??= {}; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | plot-die pre-roll failed", e); }
}
function edhaPlotDieConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (!g) return;
    if (g.skill && roll?.data?.skill?.id !== g.skill) return;
    void actor.unsetFlag("edha-content", "plotDieNext");
    const skl = g.skill ? ` ${String(g.skill).toUpperCase()}` : "";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>${g.source || "Raise the Stakes"}</strong> — ${actor.name} raises the stakes on this${skl} test (Plot Die added).</p>` });
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

// Set the plotDieNext flag on a target actor; cross-actor writes relay to the GM (a player rarely owns
// another PC). source/skill are stored for the consume note + the skill gate.
async function edhaGrantPlotDie(actor, { skill = null, source = "Raise the Stakes" } = {}) {
  const value = { skill: skill || null, source };
  try {
    if (actor.isOwner) { await actor.setFlag("edha-content", "plotDieNext", value); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to grant Raise the Stakes."); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: actor.uuid, key: "plotDieNext", value } });
    return true;
  } catch (e) { console.error("Edha Content | grant plot die failed", e); return false; }
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

// Plot-die grant card: pick an in-range ally to receive a Plot Die on their next (skill-gated) test.
// Payload lives in data-* attributes (NOT a client-local map) — the watcher posts these GM-side but the
// OWNER's client clicks them, so the data has to travel with the chat HTML.
function edhaPostPlotGrantCard(owner, name, { skill = null, allies = null, whisperToOwner = false, note = "" } = {}) {
  try {
    const list = (allies ?? edhaAlliesInAttune(owner, "white"));
    const skillLabel = skill ? ` (next ${String(skill).toUpperCase()} test)` : " (next test)";
    let body;
    if (!list.length) {
      body = `<p style="opacity:.8">No allies in Attunement Range (move into range, then re-trigger).</p>`;
    } else {
      body = list.map(t =>
        `<button type="button" class="edha-plotgrant-btn" data-edha-ally="${t.actor.uuid}" data-edha-skill="${skill || ""}" data-edha-source="${encodeURIComponent(name)}">${t.actor.name}</button>`
      ).join(" ");
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
    await edhaGrantPlotDie(ally, { skill, source: src });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-plotgrant-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${ally.name}`;
    ChatMessage.create({ content: `<p>🎲 <strong>${src}</strong>: ${ally.name}'s next ${skill ? String(skill).toUpperCase() + " " : ""}test raises the stakes.</p>` });
  } catch (e) { console.error("Edha Content | plot-grant click failed", e); }
}
function edhaBindPlotGrantButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-plotgrant-btn").forEach(b => b.addEventListener("click", edhaPlotGrantClick));
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

// A whispered "you may react" card for a Coordination owner. Click → deduct the owner's OWN cost(s)
// (owner-owned → no relay) + post the result note. The 1-reaction-per-round economy is approximated by
// a once/round/owner/talent gate (the broader cross-talent reaction limit stays GM-tracked).
function edhaPostCoordReactionCard(owner, name, roller, { costs = [], prompt = "", result = "" } = {}) {
  try {
    if (!edhaCoordOPRAllowed(owner, name, "_react")) return;       // already reacted with this talent this round
    const costLabel = costs.length ? costs.map(c => `${c.value} ${EDHA_RES_LABEL[c.resource] || c.resource}`).join(" + ") : "";
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>⚡ <strong>${name}</strong> — ${prompt}</p>`
        + `<button type="button" class="edha-coordreact-btn" data-edha-owner="${owner.uuid}" data-edha-name="${encodeURIComponent(name)}" data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}" data-edha-result="${encodeURIComponent(result)}">Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button></div>`,
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
    const result = decodeURIComponent(btn.dataset.edhaResult || "");
    if (!edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} was already used this round.`); btn.disabled = true; return; }
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
      if (!edhaCoordOPRAllowed(owner, "Concordant Presence", skillId)) continue;
      const allies = edhaAlliesInAttune(owner, "white").filter(t => t.actor !== roller);
      if (!allies.length) continue;
      await edhaCoordOPRMark(owner, "Concordant Presence", skillId);
      edhaPostPlotGrantCard(owner, "Concordant Presence", { skill: skillId, allies, whisperToOwner: true,
        note: `${roller.name} just tested ${String(skillId).toUpperCase()}. If they SUCCEEDED, grant the next ally's ${String(skillId).toUpperCase()} test the Plot Die.` });
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
      const newTotal = (Number(roll.total) || 0) + mod;
      edhaPostCoordReactionCard(owner, "Shared Conviction", roller, {
        costs: [{ resource: "foc", value: 2 }, { resource: "inv", value: 1 }],
        prompt: `${roller.name} tested ${String(skillId).toUpperCase()} → <strong>${roll.total}</strong>. If they would fail, add your White modifier (+${mod}) → <strong>${newTotal}</strong>.`,
        result: `✊ <strong>Shared Conviction</strong> (${owner.name}): +${mod} to ${roller.name}'s ${String(skillId).toUpperCase()} test → <strong>${newTotal}</strong>.`,
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
    // Guiding Signal: cost paid by the activation → post the (free) grant card to designate the recipient.
    if (item.name === "Guiding Signal" && edhaOwnsTalent(actor, "Guiding Signal")) {
      edhaPostPlotGrantCard(actor, "Guiding Signal", { skill: null,
        note: "Designate a character; grant the next ally who tests against it the Plot Die." });
    }
    // Ordered Advance: cost paid by the activation; the movement permission is GM-narrated → a round note.
    if (item.name === "Ordered Advance" && edhaOwnsTalent(actor, "Ordered Advance")) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🚶 <strong>Ordered Advance</strong> (${actor.name}): this round, when you move, allies within 10 ft may move half their Speed without provoking Reactions. <span style="opacity:.8">(movement is GM-narrated)</span></p>` });
    }
  } catch (e) { console.error("Edha Content | White use-hook failed", e); }
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
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📢 <strong>Voice of Authority</strong>: ${attacker ? attacker.name + "'s" : "the"} attack rolls disadvantage — d20 ${origNat} vs ${newNat} → keep <strong>${keptNat}</strong>; result <strong>${newTotal}</strong> (was ${origTotal}). GM applies the lower.</p>` });
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
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: partner }), content: `<p>🤝 <strong>Bound by Word</strong>: ${partner.name}'s result is <strong>${ds.edhaTotal}</strong> (was ${ds.edhaWas}). GM applies the higher.</p>` });
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
    if ((item.name === "Counterpoint" || item.name === "Overwhelming Authority") && edhaOwnsTalent(actor, item.name)) {
      edhaPostDisorientCard(actor, item.name, [...(game.user?.targets ?? [])][0]?.actor ?? null);
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
 *   flags.edha-content.nextTestMod = { mode:"advantage"|"disadvantage", count, skill:<id>|null, source }
 * a counted, optional-skill mirror of the Black advTest / cogDisadv flags; consumed one test at a time.
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
function edhaNextTestMatches(mod, roll) { return !!mod && (!mod.skill || roll?.data?.skill?.id === mod.skill); }
function edhaNextTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const mod = actor?.getFlag?.("edha-content", "nextTestMod");
    if (!edhaNextTestMatches(mod, roll)) return;
    const m = mod.mode === "advantage" ? "advantage" : "disadvantage";
    roll.options.advantageMode = m; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = m; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | next-test mod pre-roll failed", e); }
}
function edhaNextTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const mod = actor?.getFlag?.("edha-content", "nextTestMod");
    if (!edhaNextTestMatches(mod, roll)) return;
    const left = Math.max(0, (Number(mod.count) || 1) - 1);
    if (left <= 0) void actor.unsetFlag("edha-content", "nextTestMod");
    else void actor.setFlag("edha-content", "nextTestMod", { ...mod, count: left });
    const word = mod.mode === "advantage" ? "advantage" : "disadvantage";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔮 <strong>${mod.source || "Calculation"}</strong> — ${word} on this test${left > 0 ? ` (${left} more)` : ""}.</p>` });
  } catch (e) { console.error("Edha Content | next-test mod consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaNextTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaNextTestConsume);
}

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

// Counterspell reminder — its own skill_test rolls Blue + pays the cost; the adjudication is owner/GM-judged.
function edhaPostCounterspellCard(owner, target) {
  try {
    const def = target ? (Number(foundry.utils.getProperty(target, "system.defenses.cog.value")) || null) : null;
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🪞 <strong>Counterspell</strong> — compare your Blue test to ${target ? `${target.name}'s` : "the activating creature's"} Cognitive defense${def != null ? ` (<strong>${def}</strong>)` : ""}. On a success, the activated talent fails (GM adjudicates).</p></div>`,
    });
  } catch (e) { console.error("Edha Content | counterspell card failed", e); }
}

// Every Calculation talent fires off its own activation (owner's client; the cost is already consumed by
// Foundry). The cards only apply the effect — success is owner-judged (Foundry tests have no DC).
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || item.type !== "talent") return;
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
          const t = target0();
          edhaPostCalcTestCard(actor, "False Premise", { mode: "disadvantage", count: 1, candidates: t ? [t] : null,
            prompt: "if your Blue test beat their Cognitive defense, impose disadvantage on their next test" });
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
 * the Perception-vs-Blue-defense + conditional advantage are MANUAL; Holographic Illusion = a no-stats
 * token sized to [Size]; Living Image marks illusions mobile (upkeep manual); Redirect Momentum = a
 * reminder card; Ghostly Walls immobilizes owner-relative (+ Absolute Stillness Weakened rider).
 * ============================================================================================ */
function edhaSizeFt(owner) { return EDHA_SIZE_FT[edhaColorRank(owner, "blue")] || EDHA_SIZE_FT[1]; }
function edhaTokenArt(actor) {
  const tok = actor?.getActiveTokens?.()[0];
  return tok?.document?.texture?.src || actor?.prototypeToken?.texture?.src || actor?.img || "icons/svg/mystery-man.svg";
}
// Max-one sustain for Phantom Double: drop the caster's existing illusion before making a new one.
async function edhaClearPhantomDoubles(caster) {
  for (const a of (game.actors?.filter(x => x.getFlag?.("edha-content", "phantomDouble") && x.getFlag?.("edha-content", "summoner") === caster.id) ?? [])) {
    try { await a.delete(); } catch (e) {}
  }
}

// Ghostly Walls — on a judged Blue success, Immobilize the target (move 0) until the END of the owner's
// next turn (owner-relative); with Absolute Stillness, the target ALSO becomes Weakened (Physical disadv.).
function edhaPostGhostlyWallsCard(owner, target) {
  try {
    const def = target ? (Number(foundry.utils.getProperty(target, "system.defenses.cog.value")) || null) : null;
    const stillness = edhaOwnsTalent(owner, "Absolute Stillness");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧱 <strong>Ghostly Walls</strong> — if your Blue test beat ${target ? `${target.name}'s` : "the target's"} Cognitive defense${def != null ? ` (<strong>${def}</strong>)` : ""}, set its movement to <strong>0</strong> until the end of your next turn${stillness ? " (Absolute Stillness: also disadvantage on Physical tests; it cannot take Reactions)" : ""}.</p>`
        + `<button type="button" class="edha-illusion-immob-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target ? target.uuid : ""}" data-edha-stillness="${stillness ? 1 : 0}">Immobilize${target ? ` ${target.name}` : " (target one first)"}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | ghostly walls card failed", e); }
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
    const actor = item?.actor; if (!actor || item.type !== "talent") return;
    const target0 = () => [...(game.user?.targets ?? [])][0]?.actor ?? null;
    switch (item.name) {
      case "Ghostly Walls":
        if (edhaOwnsTalent(actor, "Ghostly Walls")) edhaPostGhostlyWallsCard(actor, target0());
        break;
      case "Redirect Momentum":
        if (edhaOwnsTalent(actor, "Redirect Momentum")) {
          const t = target0(), ft = edhaSizeFt(actor);
          ChatMessage.create({
            whisper: edhaWhisperIds(actor),
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<div class="edha-trigger-card"><p>💨 <strong>Redirect Momentum</strong> — compare your Blue test to ${t ? `${t.name}'s` : "the mover's"} Athletics. On a success, reduce its remaining movement by <strong>${ft} ft</strong> or push it <strong>${ft} ft</strong> in any direction (GM applies).</p></div>`,
          });
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
          const dup = target0() ?? actor;
          (async () => {
            await edhaClearPhantomDoubles(actor);                    // max active 1
            await edhaSummon(actor, {
              name: `${dup.name} (Illusion)`, img: edhaTokenArt(dup),
              hpFormula: "1", speed: 0, defensePenalty: 99, extraFlags: { phantomDouble: true },
            });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🌫️ <strong>Phantom Double</strong> (${actor.name}): an illusory copy of ${dup.name} appears. Characters test Perception vs your Blue defense (GM); on a failure they treat it as real, and the duplicated creature gains advantage against them. Any hit on the illusion ends it.</p>` });
          })();
        }
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
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎭 <strong>Living Image</strong> (${actor.name}): your illusions may now move up to your movement rate and interact with the environment. Complex illusions cost 1 Investiture per round to maintain (track manually).</p>` });
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
// Read Intent — its own skill_test rolls Blue + pays the cost; the reveal is GM narration.
function edhaPostReadIntentCard(owner, target) {
  try {
    const def = target ? (Number(foundry.utils.getProperty(target, "system.defenses.cog.value")) || null) : null;
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🔮 <strong>Read Intent</strong> — compare your Blue test to ${target ? `${target.name}'s` : "the creature's"} Cognitive defense${def != null ? ` (<strong>${def}</strong>)` : ""}. On a success, the GM reveals what action that creature intends to take next round.</p></div>`,
    });
  } catch (e) { console.error("Edha Content | read intent card failed", e); }
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
    const actor = item?.actor; if (!actor || item.type !== "talent") return;
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
function edhaComputeMove(origin, aim, maxFt) {
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
  return { dest, movedFt: Math.hypot(dest.x - origin.x, dest.y - origin.y) / ppf, collided };
}
// Write a token to a CENTER destination — directly if we own it, else relay to the GM (push vs an enemy).
async function edhaMoveTokenTo(tok, centerDest) {
  const doc = tok.document ?? tok;
  const gs = canvas?.scene?.grid?.size || 100;
  const w = tok.w || ((doc.width || 1) * gs), h = tok.h || ((doc.height || 1) * gs);
  const x = Math.round(centerDest.x - w / 2), y = Math.round(centerDest.y - h / 2);
  if (doc.isOwner) { try { await doc.update({ x, y }, { animate: true }); return true; } catch (e) {} }
  if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "move-token", payload: { tokenUuid: doc.uuid, x, y } }); return true; } catch (e) {} }
  return false;
}
// Slide `tok` toward `destCenter`, optionally stopping `gapPx` short (so a charge lands adjacent, not on top).
async function edhaApplyMove(tok, destCenter, maxFt, { gapPx = 0 } = {}) {
  const origin = tok.center;
  let aim = destCenter;
  if (gapPx > 0) {
    const dx = destCenter.x - origin.x, dy = destCenter.y - origin.y, len = Math.hypot(dx, dy) || 1;
    aim = { x: destCenter.x - dx / len * gapPx, y: destCenter.y - dy / len * gapPx };
  }
  const r = edhaComputeMove(origin, aim, maxFt);
  await edhaMoveTokenTo(tok, r.dest);
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
    const otok = edhaCasterToken(owner), vtok = edhaCasterToken(victim) ?? victim.getActiveTokens?.()[0];
    if (!otok || !vtok) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Shockwave Slam"}</strong> — push ${victim.name} (no token on canvas — apply manually).</p>` });
      return;
    }
    const maxFt = cfg.bySize ? (EDHA_SIZE_FT[edhaColorRank(owner, "red")] || EDHA_SIZE_FT[1]) : (Number(cfg.distanceFt) || 5);
    const dx = vtok.center.x - otok.center.x, dy = vtok.center.y - otok.center.y, len = Math.hypot(dx, dy) || 1;
    const aim = { x: vtok.center.x + dx / len * (maxFt * edhaPxPerFt()), y: vtok.center.y + dy / len * (maxFt * edhaPxPerFt()) };
    const { movedFt, collided } = await edhaApplyMove(vtok, aim, maxFt, { gapPx: 0 });
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
      if (tal.type !== "talent") continue;
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
  const tal = a.items?.find(i => i.type === "talent" && edhaRuleOf(i, "edha-rally-stack"));
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
    const actor = item?.actor; if (!actor || item.type !== "talent") return;
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
    if (tal.type !== "talent") continue;
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
  return actor.items.filter(i => i.type === "talent").length;
}
Hooks.on("preCreateItem", (item) => {
  try {
    if (globalThis.edhaSkipBudget === true) return true; // GM bypass for bulk imports/pregens: edha.skipBudget(true) … (false)
    if (item.type !== "talent") return true;            // only talents have a budget
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
      ((reserve > 0 || reserveCap > 0) ? `<div class="edha-budget-row edha-reserve" title="Reserve (Sanguine Reservoir) - banked from ritual HP paid (cap = ranks in Black). Spend it as Investiture (tracked manually)."><span class="edha-budget-label">Reserve</span><span class="edha-budget-value">${reserve} / ${reserveCap}</span></div>` : "") +
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
      if (d.type !== "talent") continue;
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
    if (item.type !== "talent") continue;
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

async function edhaSummon(caster, spec) {
  try {
    if (!caster || !spec) return null;
    if (!game.user?.can("ACTOR_CREATE")) {
      ui.notifications?.warn(`Edha: summoning ${spec.name} needs actor-create permission (ask your GM).`);
      return null;
    }
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
    const folder = await edhaSummonFolder();
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
      folder: folder?.id ?? null,
      prototypeToken: { name: spec.name, actorLink: true, disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, texture: { src: spec.img }, ...(tokSq ? { width: tokSq, height: tokSq } : {}) },
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
          system: {
            description: { value: `<p>${atk.range === "ranged" ? "Ranged" : "Melee"} attack — ${atk.damageType || "keen"} damage. Rolls Athletics vs the target's Physical defense.</p>` },
            // skill_test → use() rolls a d20 Athletics test (+ rank from tier) alongside the damage,
            // instead of bare damage with no to-hit (Construct Slam fix, 2026-06-11 playtest).
            activation: { type: "skill_test", cost: { value: 1, type: "act" }, skill: atk.skill || "ath", attribute: "str" },
            damage: { formula: atkFormula, type: atk.damageType || "keen" },
          },
        }] : []),
        // Extra baked items (e.g. Siege Form's ranged attack) — damage formulas resolved vs the caster.
        ...((spec.extraItems || []).map(x => ({
          name: x.name || "Ability", type: x.type || "action", img: x.img || spec.img,
          system: {
            description: { value: x.description || "" },
            activation: { type: "utility", cost: { value: Number(x.actions) || 1, type: "act" } },
            damage: x.damageFormula ? { formula: Roll.replaceFormulaData(x.damageFormula, rollData, { missing: "0" }), type: x.damageType || "keen" } : { formula: null, type: null },
          },
        }))),
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
    const summon = await Actor.create(actorData);
    if (!summon) return null;
    const ct = caster.getActiveTokens?.()[0];
    const gs = scene.grid?.size ?? 100;
    const x = ct ? ct.document.x + gs : Math.round((canvas?.dimensions?.sceneWidth ?? 1000) / 2);
    const y = ct ? ct.document.y : Math.round((canvas?.dimensions?.sceneHeight ?? 1000) / 2);
    const tdoc = await summon.getTokenDocument({ x, y });
    const [newToken] = await scene.createEmbeddedDocuments("Token", [tdoc.toObject()]);
    if (spec.actsAfterCaster && game.combat && newToken) {
      const cc = game.combat.combatants.find(c => c.actorId === caster.id);
      try {
        await game.combat.createEmbeddedDocuments("Combatant", [{ tokenId: newToken.id, sceneId: scene.id, actorId: summon.id, initiative: cc?.initiative ?? null }]);
      } catch (e) { /* no combat or perms */ }
    }
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: caster }),
      content: `<p><strong>${caster.name}</strong> summons <strong>${spec.name}</strong> — HP ${hp}, defenses ${dval("phy")}/${dval("cog")}/${dval("spi")}` +
               (atkFormula ? `, ${atk.name || "attack"} ${atkFormula} ${atk.damageType || "keen"}` : "") + `.</p>`,
    });
    return summon;
  } catch (e) {
    console.error("Edha Content | summon failed", e);
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

function edhaOwnsTalent(actor, name) {
  return !!actor?.items?.some(i => i.type === "talent" && i.name === name);
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

async function edhaRunTriggerEffect(owner, name, spec, ctx) {
  const eff = spec.effect; if (!eff) return;
  const rollData = owner.getRollData();
  const roll = await (new Roll(eff.formula || "0", rollData)).evaluate();
  const amt = Math.max(0, Math.floor(roll.total));
  const speaker = ChatMessage.getSpeaker({ actor: owner });

  if (eff.kind === "heal") {
    // target "victim"/"triggering" → heal the context creature (Mender's Instinct); default → owner.
    const healee = ((eff.target === "victim" || eff.target === "triggering") && ctx.victim) ? ctx.victim : owner;
    const hea = healee.system?.resources?.hea;
    const max = edhaResVal(hea) ?? (hea?.value ?? 0) + amt;
    try { await healee.update({ "system.resources.hea.value": Math.min(max, (hea?.value ?? 0) + amt) }); }
    catch (e) { // no perms on the healee (another player's PC) → relay as a burst-style heal hit
      try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: healee.uuid, amount: amt, type: "heal", heal: true }] } }); } catch (e2) {}
    }
    if (eff.resourceGain) {
      const r = eff.resourceGain, res = owner.system?.resources?.[r.resource];
      const rmax = edhaResVal(res) ?? (res?.value ?? 0) + r.value;
      try { await owner.update({ [`system.resources.${r.resource}.value`]: Math.min(rmax, (res?.value ?? 0) + r.value) }); } catch (e) {}
    }
    await roll.toMessage({ speaker, flavor: `${name} — heal ${amt}${eff.resourceGain ? ` + ${eff.resourceGain.value} ${EDHA_RES_LABEL[eff.resourceGain.resource] || eff.resourceGain.resource}` : ""} to ${healee.name}.` });
    return;
  }
  if (eff.kind === "thp") {
    const tgt = edhaEffectTargets(owner, eff, ctx)[0] ?? owner;
    await edhaWriteTempHp(tgt, amt, name);
    await roll.toMessage({ speaker, flavor: `${name} — ${amt} Temp HP → ${tgt.name}.` });
    return;
  }
  let targets = edhaEffectTargets(owner, eff, ctx);
  if (spec.whenTargetIsolated) targets = targets.filter(a => edhaIsIsolated(a));   // state filter (Sapping Hex)
  if (eff.kind === "status") {
    // Apply an Edha/native status to each (state-filtered) target — e.g. Sapping Hex → Weakened.
    if (!targets.length) { ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — no ${spec.whenTargetIsolated ? "Isolated " : ""}target to affect (target a token, then re-fire).</p>` }); return; }
    for (const a of targets) await edhaToggleStatus(a, eff.statusId || "weakened", true);
    const label = game.i18n?.localize(EDHA_STATUSES[eff.statusId]?.label ?? CONFIG.COSMERE?.statuses?.[eff.statusId]?.label ?? eff.statusId) ?? eff.statusId;
    ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — ${targets.map(a => a.name).join(", ")} ${targets.length > 1 ? "are" : "is"} <strong>${label}</strong>${spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : ""}.</p>` });
    return;
  }
  if (eff.kind === "affliction") {
    for (const a of targets) {
      try { await a.toggleStatusEffect?.("afflicted", { active: true }); await edhaAddAffliction(a, amt, eff.damageType, name); } catch (e) {}
    }
    await roll.toMessage({ speaker, flavor: `${name} — Afflicted [${amt} ${eff.damageType}] on ${targets.map(a => a.name).join(", ") || "(target a token)"} — auto-deals at the start of its turns until the condition is removed.` });
    return;
  }
  // damage / damage-aoe — apply silently, post one combined message with the dice.
  for (const a of targets) { try { await a.applyDamage([{ amount: amt, type: eff.damageType }], { chatMessage: false }); } catch (e) { console.error("Edha Content | trigger applyDamage failed", e); } }
  await roll.toMessage({ speaker, flavor: `${name} — ${amt} ${eff.damageType} to ${targets.map(a => a.name).join(", ") || "(no target — target a token, then re-fire)"}` });
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
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content:
        `<div class="edha-trigger-card">` +
        `<p>⚡ <strong>${name}</strong> available${costLabel ? ` — may spend <strong>${costLabel}</strong>` : ""}.</p>` +
        (spec.note ? `<p style="opacity:.85;font-size:.9em">${spec.note}</p>` : "") +
        `<p style="opacity:.85;font-size:.9em">Target the creature on the canvas, then click below.</p>` +
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
  } catch (e) { console.error("Edha Content | trigger card click failed", e); }
}
function edhaBindTriggerButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-trigger-btn").forEach(b => b.addEventListener("click", edhaTriggerCardClick));
}
Hooks.on("renderChatMessageHTML", (msg, html) => edhaBindTriggerButtons(html));  // Foundry v13 (renderChatMessage is deprecated — single bind avoids double-fire)

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
      item = a?.items?.find(i => i.type === "talent" && i.name === item);
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
    if (affects !== "none") { try { game.user?.updateTokenTargets(caught.map(t => t.id)); } catch (e) {} edhaCheckMultiHit(actor, item, caught.length); }
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
      if (!item || item.type !== "talent" || !edhaTalentColor(item)) return;
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
async function edhaBurstDetonate(pid) {
  const P = EDHA_BURST_PENDING[pid];
  if (!P) { ui.notifications?.info("That burst was already resolved."); return; }
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
      const dice = await new Roll(Roll.replaceFormulaData(dmgF, rd, { missing: "0" })).evaluate();
      rolls.push(dice);
      let mod = 0;
      if (b.addSkillMod) mod += edhaEvalSync(`@skills.${b.addSkillMod}.mod`, rd);   // match the system's full-hit skill mod
      const riderF = edhaRiderBonus(item, actor);                                    // Kindle etc. still apply
      if (riderF) mod += edhaEvalSync(riderF, rd);
      const full = Math.max(0, Math.floor(dice.total) + mod);
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
        const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
        const radiusPx = Math.max(Math.round(gs / 2), Math.round((tr.sizeFt / gd) * gs));
        const baked = Roll.replaceFormulaData(tr.formula || "(@tier)d6", caster.getRollData(), { missing: "0" });
        const [trRegion] = await scene.createEmbeddedDocuments("Region", [{
          name: `${caster.name} — Dangerous Terrain`, color: EDHA_COLOR_HEX[tr.color] || "#d23b2e",
          shapes: [{ type: "circle", x: tr.x, y: tr.y, radius: radiusPx, hole: false }],
          behaviors: [{ type: "edha-content.hazard", name: "Dangerous Terrain", system: { damageFormula: baked, damageType: tr.type || "energy", sourceName: `Dangerous Terrain — ${caster.name}` } }],
          flags: { "edha-content": { hazard: true, scope: "scene" } },
        }]);
        if (trRegion) await edhaHazardVisual(scene, tr.x, tr.y, radiusPx, EDHA_COLOR_HEX[tr.color] || "#d23b2e", trRegion.id, "🔥");
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
          if (td?.update) await td.update({ x: p.x, y: p.y }, { animate: true });
          return;
        }
        if (data?.action === "set-resource") {                        // cross-actor resource write (Shatter Focus)
          const p = data.payload || {};
          const ref = await fromUuid(p.actorUuid).catch(() => null);
          const a = ref?.actor ?? ref;
          if (a && p.path) await a.update({ [p.path]: p.value });
          return;
        }
      } catch (e) { console.error("Edha Content | socket relay failed", e); }
    });
  } catch (e) { console.error("Edha Content | socket registration failed", e); }
});
function edhaBindBurstButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.querySelectorAll?.(".edha-burst-btn").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; btn.textContent = "Detonating…"; void edhaBurstDetonate(btn.dataset.edhaBurst);
  }));
  root?.querySelectorAll?.(".edha-burst-cancel").forEach(btn => btn.addEventListener("click", (ev) => {
    ev.preventDefault(); btn.disabled = true; edhaBurstCancel(btn.dataset.edhaBurst);
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
    if (item?.type !== "talent") return;
    const h = edhaRuleOf(item, "edha-burst");
    if (!h) return;                 // only burst-rule talents are taken over
    void edhaCastBurst(item, edhaBurstSpecFromCfg(h));
    return false;                   // cancel the system's default use() (no card, no auto damage)
  } catch (e) { console.error("Edha Content | preUseItem burst intercept failed", e); }
});

/* --- Draw Mana — universal leyline action; rider determined by the owned Leyline Key(s) ---------
 * Canon: "1 Action: recover Investiture equal to your Tier and trigger your leyline color's Attunement
 * rider." The Draw Mana action is granted by every leyline path (foundry-build pathEvents); the per-color
 * effect lives on the Key talent. On use we recover Investiture and apply each owned Key's rider.
 *   White → heal allies in range (= Tier)    Black → Weaken enemies in range (status if native, else note)
 *   Green → place [Size] difficult terrain    Blue/Red → advantage on next test (manual reminder)
 */
const EDHA_DRAW_MANA = {
  "White Leyline Attunement": { color: "white", kind: "heal-allies" },
  "Blue Leyline Attunement":  { color: "blue",  kind: "note", text: "advantage on your next Cognitive test" },
  "Black Leyline Attunement": { color: "black", kind: "weaken-enemies" },
  "Red Leyline Attunement":   { color: "red",   kind: "note", text: "advantage on your next Physical test; lose your Reaction until your next turn" },
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
    const owned = new Set(actor.items.filter(i => i.type === "talent").map(i => i.name));
    const tok = edhaCasterToken(actor);
    const disp = tok?.document?.disposition ?? 1;
    for (const [keyName, r] of Object.entries(EDHA_DRAW_MANA)) {
      if (!owned.has(keyName)) continue;
      const rank = edhaColorRank(actor, r.color);
      const ft = EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1];
      if (r.kind === "heal-allies" && tok) {
        const allies = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id).filter(t => (t.document?.disposition ?? 1) === disp);
        for (const a of allies) await edhaHealActor(a.actor, tier);
        await edhaHealActor(actor, tier);
        lines.push(`White: heal ${allies.length + 1} ally(ies) ${tier} HP within ${ft} ft`);
        // Beacon of Stability: on Draw Mana, spend 1 Investiture to remove a condition from an ally in range.
        if (edhaOwnsTalent(actor, "Beacon of Stability")) { try { edhaPostBeaconCard(actor, allies); lines.push("Beacon of Stability: cleanse a condition from an ally (1 Inv — see the card)"); } catch (e) {} }
      } else if (r.kind === "weaken-enemies" && tok) {
        const enemies = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id).filter(t => (t.document?.disposition ?? 1) !== disp);
        const wkId = CONFIG.COSMERE?.statuses?.weakened ? "weakened" : null;
        let applied = 0;
        // Players don't own enemy actors — edhaToggleStatus relays to the GM client when needed
        // (direct toggleStatusEffect threw permission errors at the table, 2026-06-11 playtest).
        if (wkId) for (const e of enemies) { try { if (await edhaToggleStatus(e.actor, wkId, true)) applied++; } catch (x) {} }
        lines.push(wkId ? `Black: Weakened ${applied} enemy(ies) within ${ft} ft (skip any with an ally within 10 ft)` : `Black: Weaken enemies within ${ft} ft (apply manually — Weakened isn't a native status)`);
      } else if (r.kind === "terrain" && tok) {
        const sizeFt = EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1];
        await edhaDrawCircle(tok.center.x, tok.center.y, sizeFt, EDHA_COLOR_HEX.green, 0);
        lines.push(`Green: ${sizeFt} ft difficult terrain placed on you (drag it to a point in range)`);
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
    await scene.createEmbeddedDocuments("Drawing", [{
      x: p.x, y: p.y,
      shape: { type: "r", width: p.size, height: p.size },
      strokeColor: EDHA_FOUNDATION_HEX, strokeWidth: 4, strokeAlpha: 1,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: EDHA_FOUNDATION_HEX, fillAlpha: 0.15,
      text: "Foundation", fontSize: Math.max(16, Math.round(p.size / 5)), textColor: EDHA_FOUNDATION_HEX, textAlpha: 0.9,
      flags: { "edha-content": { foundation: { casterId: p.casterId, casterName: p.casterName, disposition: p.disposition, ts: Date.now() } } },
    }]);
  } catch (e) { console.error("Edha Content | foundation place failed", e); }
}
// Takeover: cancel the system's default use flow (this is what caused the endless placement loop).
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (item?.type !== "talent" || item.name !== "Lay Foundation") return;
    void edhaLayFoundation(item);
    return false;
  } catch (e) { console.error("Edha Content | Lay Foundation intercept failed", e); }
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
    if (inside && !existing.length) {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: "Foundation (+1 defenses)", img: "icons/tools/smithing/anvil.webp",
        changes: ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 })),
        description: "<p>Began the turn in a Foundation: +1 to all defenses until the start of your next turn.</p>",
        flags: { "edha-content": { foundationBuff: true } },
      }]);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧱 <strong>${actor.name}</strong> begins their turn in a Foundation — +1 to all defenses until the start of their next turn.</p>` });
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
    // Speed = 20 + 5 × SPD (+ effect bonuses)
    const rate = actor.system?.movement?.walk?.rate;
    const srcRate = actor._source?.system?.movement?.walk?.rate;
    if (rate && !(srcRate?.useOverride)) {
      const spd = Number(actor.system?.attributes?.spd?.value) || 0;
      try { rate.override = 20 + 5 * spd + (Number(rate.bonus) || 0); rate.useOverride = true; } catch (e) { /* non-fatal */ }
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
 * Registered at `setup` so our event types land BEFORE the system wires its per-type hooks at
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
    const radiusPx = Math.max(Math.round(gs / 2), Math.round((sizeFt / gd) * gs));
    const baked = Roll.replaceFormulaData(cfg.damageFormula || "(@tier)d6", actor.getRollData(), { missing: "0" });
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${item.name} — Dangerous Terrain`,
      color: EDHA_COLOR_HEX[color] || "#d23b2e",
      shapes: [{ type: "circle", x: center.center.x, y: center.center.y, radius: radiusPx, hole: false }],
      behaviors: [{
        type: "edha-content.hazard", name: "Dangerous Terrain",
        system: { damageFormula: baked, damageType: cfg.damageType || "energy", sourceName: `${item.name} — ${actor.name}` },
      }],
      flags: { "edha-content": { hazard: true, scope: "scene" } },
    }]);
    if (region) await edhaHazardVisual(scene, center.center.x, center.center.y, radiusPx, EDHA_COLOR_HEX[color] || "#d23b2e", region.id, `🔥 ${item.name}`);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>🔥 <strong>${item.name}</strong> leaves <strong>${sizeFt} ft</strong> of dangerous terrain — ${baked} ${cfg.damageType || "energy"} on enter / start of turn, for the scene.</p>`,
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

  /* ---- HANDLER TYPES (config schemas auto-render in the rule editor) ---- */
  api.registerItemEventHandlerType({
    source: "edha-content", type: "edha-triggered-effect",
    label: "Edha: Triggered Effect", description: "Deal damage / AoE / heal / Temp HP / affliction when this rule fires.",
    config: { schema: {
      whenDamageType: new FF.StringField({ required: false, initial: "any", label: "Only when you dealt damage type(s)", hint: "'any' or a comma-list: energy, impact, keen, spirit, vital (deal-damage rules only)" }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 10 ft of the target (Black tree)." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. weakened — checks the victim (or your current target) before firing. Predatory Patience: Investiture only vs Weakened." }),
      kind: new FF.StringField({ required: true, initial: "damage", choices: choices("damage", "damage-aoe", "heal", "thp", "affliction", "status"), label: "Effect kind" }),
      statusId: new FF.StringField({ required: false, blank: true, initial: "", label: "Status to apply (kind=status)", hint: "e.g. weakened, afflicted, slowed" }),
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
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 10 ft of the target (Black tree)." }),
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

  console.log("Edha Content | native event system registered (events: edha-deal-damage, edha-on-defeat, edha-take-damage [+sentinels: apply-watch, pre-deal-damage, pre-test, on-hit, pre-use, combat-timing]; handlers: triggered-effect, damage-rider, test-rider, burst, defense-buff, aoe-template, place-hazard, temp-hp, ritual-hp-cost, heal-cut, summon, apply-status, status-sweep, overflow-thp, damage-convert, marked-damage-trigger, hp-threshold, multi-hit; region: edha-content.hazard).");
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
        resourceGain: h.resourceGainResource ? { resource: h.resourceGainResource, value: Number(h.resourceGainValue) || 1 } : null },
      cost: null,   // free choice — the chat-card button is just the confirm
      oncePerRound: h.oncePerRound !== false,
      note: h.note || `${item.name} hit ${count} creatures — choose: all affected lose a Reaction (manual), OR click to regain ${Number(h.resourceGainValue) || 1} ${EDHA_RES_LABEL[h.resourceGainResource] || h.resourceGainResource || "Investiture"} + advantage on your next ${color || "matching"} test this turn (manual reminder).`,
    };
    edhaPostTriggerCard(actor, rule.item.name, spec, {});
  } catch (e) { console.error("Edha Content | multi-hit check failed", e); }
}
// Register at setup — before the system wires per-type hooks at `ready`.
Hooks.once("setup", () => { try { edhaRegisterNativeEventSystem(); } catch (e) { console.error("Edha Content | native event system registration failed", e); } });

// Expose the sync API for macros / console: game.modules.get("edha-content").api.syncNow() OR edha.syncNow()
Hooks.once("ready", () => {
  // summon: looks up the named TALENT on the caster and reads its own edha-summon rule.
  const summonByTalent = (caster, name) => {
    const tal = caster?.items?.find(i => i.type === "talent" && i.name === name);
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
  const api = { syncNow: edhaSyncNow, syncActorTalents: edhaSyncActorTalents, syncAllCharacters: edhaSyncAllCharacters, setTempHp: edhaSetTempHp, getTempHp: edhaGetTempHp, summon: summonByTalent, showRange: edhaShowRange, aoe: edhaPlaceAoe, drawMana: edhaDrawMana, grantDrawMana: edhaGrantDrawMana, resetTriggers: edhaResetTriggers, fixSettings: edhaFixSettings, clearKindleLights: edhaClearKindleLights, refreshDefBuffs: edhaRefreshDefBuffs, migrateDerivations: edhaMigrateDerivations, isIsolated: edhaIsIsolated, toggleStatus: edhaToggleStatus, raiseStakes: edhaRaiseStakesApi, calculatedPatience: edhaCalculatedPatienceApi, rally: edhaRallyApi, skipBudget: (v) => { globalThis.edhaSkipBudget = !!v; return globalThis.edhaSkipBudget; } };
  const mod = game.modules?.get("edha-content");
  if (mod) mod.api = api;
  globalThis.edha = Object.assign(globalThis.edha || {}, api);
  console.log("Edha Content | sync API ready — edha.syncNow() / edha.syncAllCharacters() / game.modules.get('edha-content').api");
});
// end of file (v3 engine pass 2026-06-11)
