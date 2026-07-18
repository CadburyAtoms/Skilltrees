#!/usr/bin/env node
/* Edha → Foundry generator (v2).
 *
 * Builds the `edha-content` module to MIRROR the cosmere-rpg "Heroic Paths" compendium model:
 *   - one compendium per atlas: edha-leyline, edha-deity, edha-heroic
 *   - inside each: a FOLDER per path (color / deity / heroic path), with SPECIALTY SUBFOLDERS
 *   - each path folder contains: a `path` Item (links its tree + grants the Key talent),
 *     the combined `talent_tree` Item (Key + specialty columns), and the `talent` Items
 *     (filed under their specialty subfolder; the Key talent sits in the path folder).
 *
 * Sources (Skilltrees data/): leyline.json (5 colors), domain.json (10 deities),
 * cosmere.json (6 heroic paths × Key+3 specialties — the COMPLETE set the shipped system lacks).
 *
 * Usage:  node foundry-build.js [leyline|deity|heroic|adversaries|items|all]   (default: all)
 * Schema verified against cosmere-rpg v2.0.4 shipped heroic-paths pack.
 */
const fs = require("fs");
const crypto = require("crypto");
// classic-level + paths are overridable so the build can run off the Foundry machine
// (e.g. a sandbox where the folders are mounted elsewhere): EDHA_DATA / EDHA_MODROOT.
function requireClassicLevel() {
  const candidates = [
    "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
    "classic-level",
  ];
  for (const c of candidates) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error("classic-level not found — run on the Foundry machine or `npm install classic-level` (NODE_PATH supported).");
}
const { ClassicLevel } = requireClassicLevel();

const DATA = process.env.EDHA_DATA || "C:/Users/benhe/OneDrive/Documentos/Worldbuilding/Claude Design/skilltrees/data";
const MODROOT = process.env.EDHA_MODROOT || "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content";
const MODID = "edha-content";
const SCOPE = (process.argv[2] || "all").toLowerCase();
const CORE = "13.351", SYSID = "cosmere-rpg", SYSVER = "2.1.0", NOW = Date.now();
const SX = 1100, SY = 1500, PAD = 60;
// Talent-tree sheet window size (system.display drives the Application window dims).
const DISPLAY_W = 1100, DISPLAY_H = 900;

const ATLAS_PACK = { leyline: "edha-leyline", deity: "edha-deity", heroic: "edha-heroic" };
// Warrior stances are MODALITY talents (one active at a time — the system's stance switcher keys on
// system.modality === "stance"). The authored overlay schema doesn't carry modality (07-18: adding it
// would churn every fingerprint), so the 7 stance talents are name-mapped here instead. Verified from
// the 07-17 heroic dump: the system pack ships Vigilant/Flame/Ironstance with modality "stance"; the
// free tier lacks the other four, but they are stances by the same card text.
const STANCE_TALENTS = new Set(["Vigilant Stance", "Flamestance", "Ironstance", "Bloodstance", "Stonestance", "Windstance", "Vinestance"]);
const ADV_PACK = "edha-adversaries";
const ITEMS_PACK = "edha-items";
const slugifyItem = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Default item icons by item flavour (all verified to exist under public/icons; a 404 = blank item icon).
const ADV_ITEM_ICON = {
  melee:   "icons/skills/melee/strike-blade-knife-white-red.webp",
  ranged:  "icons/skills/ranged/arrow-flying-white-blue.webp",
  heal:    "icons/magic/life/heart-cross-strong-green.webp",
  utility: "icons/magic/control/buff-flight-wings-blue.webp",
  trait:   "icons/sundries/books/book-worn-brown.webp",
};
// Leyline rank by role (ruling 40 default, Ben 2026-07-14): minion 1 / rival 2 / boss 3 per attuned
// color — dice scale d4/d6/d8 and Attunement Range 15/30/60 ft. Explicit `skills` entries override.
const ROLE_LEYLINE_RANK = { minion: 1, rival: 2, boss: 3 };
// Adversary art auto-detect dir (under MODROOT); filenames are contractual — see EDHA_ADVERSARY_ART_WISHLIST.md.
const ADV_ART_DIR = "art/adversaries";

// ---------- reference maps ----------
const STD_SKILL = { agility:"agi", athletics:"ath", "heavy weaponry":"hwp", "light weaponry":"lwp", stealth:"stl", thievery:"thv", crafting:"cra", deduction:"ded", discipline:"dis", intimidation:"inm", lore:"lor", medicine:"med", deception:"dec", insight:"ins", leadership:"lea", perception:"prc", persuasion:"prs", survival:"sur" };
const LEYLINE_SKILL = { white:"white", blue:"blue", black:"black", red:"red", green:"green" };
const SKILL_ATTR = { white:"wil", blue:"int", black:"pre", red:"str", green:"awa", agi:"spd", ath:"str", hwp:"str", lwp:"spd", stl:"spd", thv:"spd", cra:"int", ded:"int", dis:"wil", inm:"wil", lor:"int", med:"int", dec:"pre", ins:"awa", lea:"pre", prc:"awa", prs:"pre", sur:"awa" };
const ATTR_ALIASES = { STR:"str", STRENGTH:"str", SPD:"spd", SPEED:"spd", INT:"int", INTELLECT:"int", WIL:"wil", WILLPOWER:"wil", AWA:"awa", AWARENESS:"awa", PRE:"pre", PRESENCE:"pre" };

// NOTE: all paths verified to exist in Foundry's public/icons. Broken paths => node sprite never draws.
const COLOR_ICON = { white:"icons/magic/holy/saint-glass-portrait-halo.webp", blue:"icons/magic/water/orb-water-bubbles.webp", black:"icons/magic/unholy/orb-glowing-purple.webp", red:"icons/magic/fire/orb-vortex.webp", green:"icons/magic/nature/leaf-glow-triple-green.webp" };
const DEITY_ICON = "icons/magic/symbols/runes-star-pentagon-orange.webp";
const HEROIC_ICON = p => `systems/cosmere-rpg/assets/icons/stormlight/paths/${p.toLowerCase()}.webp`;
// Rich path descriptions (leyline by color slug, deity by domain name, heroic verbatim by path name).
const DESCRIPTIONS = JSON.parse(fs.readFileSync(`${DATA}/path-descriptions.json`, "utf-8"));
// Per-talent skill-test + damage roll data (keyed by talent name). Talents present here become
// rollable (d20 skill test + damage); absent talents keep the default non-rolling behaviour.
// The leading "_README" key documents the schema and is ignored at lookup time.
const TALENT_ROLLS = (() => { try { return JSON.parse(fs.readFileSync(`${DATA}/talent-rolls.json`, "utf-8")); } catch { return {}; } })();
// Behaviour tables — these are now generator INPUTS: each entry is emitted as a native `system.events`
// rule (or `effects` ActiveEffect) on its talent, so the talent describes/runs itself through the engine.
// (They are also still copied to the module for the legacy fallback that handles not-yet-migrated trees.)
const loadTable = f => { try { return JSON.parse(fs.readFileSync(`${DATA}/${f}`, "utf-8")); } catch { return {}; } };
const TALENT_TRIGGERS  = loadTable("talent-triggers.json");
const TALENT_RIDERS    = loadTable("talent-riders.json");
const TALENT_TARGETING = loadTable("talent-targeting.json");
const TALENT_THP       = loadTable("talent-thp.json");
const TALENT_SUMMONS   = loadTable("talent-summons.json");
const TALENT_HAZARDS   = loadTable("talent-hazards.json");   // dangerous terrain (Region behaviour)
const TALENT_EFFECTS   = loadTable("talent-effects.json");   // passive ActiveEffects (e.g. +Speed)
const TALENT_DEF_BUFFS = loadTable("talent-defense-buffs.json"); // timed defense buffs (Know Your Moment)
const TALENT_STATE     = loadTable("talent-state.json");     // v3 state mechanics: marks, sweeps, converts, hp-thresholds, multi-hit, marked-damage watchers
const ADV_EFFECTS      = loadTable("adversary-effects.json"); // adversary item ActiveEffects (baked into the edha-adversaries pack)
// Per-talent thematic icons (keyword map + per-specialty fallback). All paths verified under public/icons.
const { pickTalentIcon } = require("./talent-icons.js");
// Round-trip helpers: overlay Foundry-authored edits + guard against overwriting them.
const { applyAuthorable, fingerprint, readPack } = require("./edha-pack-io.js");
// Foundry-authored overrides (data/authored/*.json, captured by foundry-extract.js). Each maps a
// talent (by docId, falling back to name) to an authorable projection — description/activation/damage/
// events/effects/img — that OVERLAYS the generated talent so edits made directly in Foundry win and
// persist across rebuilds. Talents with no override fall back to the generator + side-file behaviour.
const AUTHORED = (() => {
  const byId = {}, byName = {};
  let files = [];
  try { files = fs.readdirSync(`${DATA}/authored`).filter(f => f.endsWith(".json")); } catch { return { byId, byName, count: 0 }; }
  let count = 0;
  for (const f of files) {
    let j; try { j = JSON.parse(fs.readFileSync(`${DATA}/authored/${f}`, "utf-8")); } catch { continue; }
    for (const [name, entry] of Object.entries(j.talents || {})) {
      if (entry && entry.docId) byId[entry.docId] = entry;
      byName[name] = entry; count++;
    }
  }
  return { byId, byName, count };
})();

const ACTION_CANON = { "∞":"Passive", "Passive":"Passive", "◇":"Free Action", "Free Action":"Free Action", "★":"Special", "Special":"Special", "⟲":"Reaction", "Reaction":"Reaction", "1 Action":"1 Action", "Action":"1 Action", "2 Actions":"2 Actions", "3 Actions":"3 Actions" };
function activationSpec(action) {
  const a = ACTION_CANON[(action || "").trim()] || "Special";
  switch (a) {
    case "Passive":     return { type:"none",    cost:{ value:null },              tip:"Always Active", glyph:"8" };
    case "1 Action":    return { type:"utility", cost:{ value:1, type:"act" },     tip:"One Action",    glyph:"1" };
    case "2 Actions":   return { type:"utility", cost:{ value:2, type:"act" },     tip:"Two Actions",   glyph:"2" };
    case "3 Actions":   return { type:"utility", cost:{ value:3, type:"act" },     tip:"Three Actions", glyph:"3" };
    case "Free Action": return { type:"utility", cost:{ value:null, type:"fre" },  tip:"Free Action",   glyph:"0" };
    case "Reaction":    return { type:"utility", cost:{ value:null, type:"rea" },  tip:"Reaction",      glyph:"r" };
    case "Special":     return { type:"utility", cost:{ value:null, type:"spe" },  tip:"Special Action",glyph:"*" };
  }
}

// Layer skill-test + damage onto a talent's base activation/damage when the talent has roll data.
// Returns { activation, damage }. Base activation cost/consume from activationSpec is preserved;
// only the type is promoted to "skill_test" and skill/attribute/modifierFormula + damage are added.
// Talents with no roll-data entry get the default non-rolling activation and an empty damage block.
function rollData(talentName, baseActivation, consume) {
  const activation = { type: baseActivation.type, cost: baseActivation.cost, consume, flavor: "", plotDie: false, uses: null, opportunity: null, complication: null };
  const r = TALENT_ROLLS[talentName];
  if (!r) return { activation, damage: { formula: null, type: null } };
  // testSkill present → promote to a d20 skill test (the engine then also adds that skill's mod to damage).
  // testSkill absent → damage-only roll (heal / AoE / secondary damage): keep the base activation type,
  // just attach the damage block, so rollDamage fires with NO skill modifier (raw [Tier][Die]).
  if (r.testSkill) {
    activation.type = "skill_test";
    activation.skill = r.testSkill;
    activation.attribute = r.testAttribute || "default";
    if (r.modifierFormula) activation.modifierFormula = r.modifierFormula;
  }
  return {
    activation,
    damage: r.damageFormula ? {
      formula: r.damageFormula,
      grazeOverrideFormula: r.grazeOverrideFormula ?? null,
      type: r.damageType ?? null,
      skill: r.damageSkill ?? null,
      attribute: r.damageAttribute ?? null,
    } : { formula: null, type: null },
  };
}

// ---------- native event/effect emission ----------
// Each behaviour table entry → a native `system.events` rule (handled by our registered event/handler
// types in register-skills.js) so it's visible + editable on the talent's Events tab. Passive numeric
// buffs → `effects` ActiveEffects (Effects tab). Rule shape mirrors the proven pathEvents() output.
const TRIG_EVENT = { "deal-damage": "edha-deal-damage", "kill": "edha-on-defeat", "take-damage": "edha-take-damage" };
const ruleId = (t, kind) => fid(`rule:${t.docId}:${kind}`);
function triggerRule(t, spec) {
  const ev = TRIG_EVENT[spec.on];
  if (!ev) return null;            // unknown trigger event → skip (warn in the report)
  const e = spec.effect || {};
  const when = spec.when?.damageType;
  return { id: ruleId(t, "trigger"), description: spec.note || `Triggered ${e.kind || "effect"}.`, event: ev, handler: {
    type: "edha-triggered-effect",
    whenDamageType: (!when || when === "any") ? "any" : (Array.isArray(when) ? when.join(", ") : when),
    whenTargetIsolated: !!spec.when?.targetIsolated,
    kind: e.kind || "damage", formula: e.formula || "", damageType: e.damageType || "energy",
    target: e.target || "prompt", radius: e.radius || 0, statusId: e.statusId || "",
    resourceGainResource: e.resourceGain?.resource || "", resourceGainValue: e.resourceGain?.value || 0,
    costResource: spec.cost?.resource || "", costValue: spec.cost?.value || 0, costOptional: !!spec.cost?.optional,
    oncePerRound: !!spec.oncePerRound, note: spec.note || "",
  } };
}
// v3 STATE rules (talent-state.json): one entry may emit one rule of its kind.
//   mark         → edha-apply-status (on use): apply status + record owner; optional party bonus dmg
//   sweep        → edha-status-sweep (on use): damage all [status] creatures in range (+THP=total)
//   convert      → edha-damage-convert (sentinel): damage type conversion vs Isolated (Severance)
//   marked-watch → edha-marked-damage-trigger (sentinel): resource regen when your marked creature takes damage
//   hp-threshold → edha-hp-threshold (sentinel): reaction prompt when an ally drops to half HP
//   multi-hit    → edha-multi-hit (sentinel): prompt when a matching talent hits 2+ creatures
function stateRule(t, spec) {
  const k = spec.kind;
  if (k === "mark") return { id: ruleId(t, "mark"), description: spec.note || `On use, marks the target (${spec.status}).`, event: "use", handler: {
    type: "edha-apply-status", status: spec.status || "diagnosed",
    bonusDamageFormula: spec.bonusDamageFormula || "", bonusDamageType: spec.bonusDamageType || "vital", note: spec.note || "",
  } };
  if (k === "sweep") return { id: ruleId(t, "sweep"), description: spec.note || `On use, damages every ${spec.status} creature in range.`, event: "use", handler: {
    type: "edha-status-sweep", status: spec.status || "weakened",
    rangeByRank: spec.rangeByRank !== false, rangeFt: spec.rangeFt || 0, color: spec.color || "",
    damageFormula: spec.damageFormula || "@tier", damageType: spec.damageType || "vital", thpFromTotal: !!spec.thpFromTotal,
  } };
  if (k === "convert") return { id: ruleId(t, "convert"), description: spec.note || `Damage converts to ${spec.toType || "vital"} vs Isolated targets.`, event: "edha-apply-watch", handler: {
    type: "edha-damage-convert", toType: spec.toType || "vital", whenTargetIsolated: spec.whenTargetIsolated !== false,
  } };
  if (k === "marked-watch") return { id: ruleId(t, "markedwatch"), description: spec.note || `Recover ${spec.value || 1} ${spec.resource || "inv"} when your ${spec.status} creature takes damage.`, event: "edha-apply-watch", handler: {
    type: "edha-marked-damage-trigger", status: spec.status || "diagnosed", resource: spec.resource || "inv", value: spec.value || 1, oncePerRound: spec.oncePerRound !== false,
  } };
  if (k === "hp-threshold") return { id: ruleId(t, "hpthresh"), description: spec.note || `Reaction prompt when an ally drops to half HP.`, event: "edha-apply-watch", handler: {
    type: "edha-hp-threshold", healFormula: spec.healFormula || "", costResource: spec.cost?.resource ?? "inv", costValue: spec.cost?.value ?? 1,
    oncePerRound: spec.oncePerRound !== false, includeSelf: !!spec.includeSelf, note: spec.note || "",
  } };
  if (k === "multi-hit") return { id: ruleId(t, "multihit"), description: spec.note || `Prompt when this color's talents hit 2+ creatures.`, event: "edha-apply-watch", handler: {
    type: "edha-multi-hit", color: spec.color || "", resourceGainResource: spec.resourceGain?.resource ?? "inv", resourceGainValue: spec.resourceGain?.value ?? 1,
    oncePerRound: spec.oncePerRound !== false, note: spec.note || "",
  } };
  if (k === "overflow-thp") return { id: ruleId(t, "overflow"), description: spec.note || `Heal overflow becomes Temp HP.`, event: "edha-apply-watch", handler: {
    type: "edha-overflow-thp", note: spec.note || "",
  } };
  return null;
}
function riderRule(t, spec) {
  const at = Array.isArray(spec.appliesTo) ? spec.appliesTo.join(", ") : (spec.appliesTo || "any");
  return { id: ruleId(t, "rider"), description: spec.note || `Adds ${spec.bonusFormula} to your ${at} damage.`, event: "edha-pre-deal-damage", handler: {
    type: "edha-damage-rider", appliesTo: at, bonusFormula: spec.bonusFormula || "",
    whenTargetCondition: !!spec.whenTargetCondition,    // only when the current target has a condition (Prognosis heal rider)
    whenTargetStatus: spec.whenTargetStatus || "",      // only when the current target has this status
    lightRadiusFt: Number(spec.light?.radiusFt) || 0,   // >0: damaged creatures shed a flame light of this radius (Kindle)
  } };
}
function aoeRule(t, spec) {
  const a = spec.area || {};
  const sizeTxt = a.sizeByRank ? "[Size]" : `${a.sizeFt || 0} ft`;
  return { id: ruleId(t, "aoe"), description: `On use, drops a ${sizeTxt} burst and auto-targets ${spec.affects || "enemies"}.`, event: "use", handler: {
    type: "edha-aoe-template", sizeByRank: !!a.sizeByRank, sizeFt: a.sizeFt || 0, affects: spec.affects || "enemies", color: spec.color || "",
  } };
}
// Point-targeted burst (preUseItem takeover): the rule is the CONFIG the engine reads — size,
// placement range, save, heal/terrain — all editable on the talent's Events tab.
function burstRule(t, spec) {
  const a = spec.area || {}, b = spec.burst || {};
  const sizeTxt = a.sizeByRank ? "[Size]" : `${a.sizeFt || 0} ft`;
  return { id: ruleId(t, "burst"), description: `Point-targeted ${sizeTxt} burst (click-to-place, Detonate to resolve). Affects ${spec.affects || "enemies"}.`, event: "edha-pre-use", handler: {
    type: "edha-burst",
    sizeByRank: !!a.sizeByRank, sizeFt: a.sizeFt || 0,
    affects: spec.affects || "enemies", color: spec.color || "",
    rangeByRank: !!b.rangeByRank, rangeFt: b.rangeFt || 0,
    saveSkill: b.save?.skill || "", saveVs: b.save?.vs || "",
    addSkillMod: b.addSkillMod || "", heal: !!b.heal, terrain: !!b.terrain,
  } };
}
// Combat-timed defense buff (Know Your Moment): the rule holds amount/defenses/window — editable
// on the talent. The engine's combat hooks read it and toggle the matching ActiveEffect.
function defenseBuffRule(t, spec) {
  const defs = (Array.isArray(spec.defenses) && spec.defenses.length) ? spec.defenses.join(", ") : "phy, cog, spi";
  return { id: ruleId(t, "defbuff"), description: spec.note || `+${spec.amount ?? 2} to ${defs} defenses from the start of each round until you take your turn.`, event: "edha-combat-timing", handler: {
    type: "edha-defense-buff", amount: Number(spec.amount) || 2, defenses: defs,
    window: spec.window || "round-until-turn", label: spec.label || `${t.name} (Ready)`, img: spec.img || "icons/svg/shield.svg",
  } };
}
function thpRule(t, spec) {
  return { id: ruleId(t, "thp"), description: spec.note || `On use, grants ${spec.formula} Temp HP to the ${spec.target || "targeted"} creature.`, event: "use", handler: {
    type: "edha-temp-hp", formula: spec.formula || "", target: spec.target || "targeted",
  } };
}
function summonRule(t, spec) {
  const a = spec.attack || {};
  return { id: ruleId(t, "summon"), description: spec.note || `On use, summons ${spec.name || t.name}.`, event: "use", handler: {
    type: "edha-summon", summonName: spec.name || t.name, img: spec.img || "", hpFormula: spec.hpFormula || "(@tier)d6",
    speed: spec.speed || 25, defensePenalty: spec.defensePenalty || 2, deflect: spec.deflect || 0, conditionImmunities: (spec.conditionImmunities || []).join(", "),
    attackName: a.name || "Attack", attackFormula: a.damageFormula || "", attackType: a.damageType || "keen", attackRange: a.range || "melee",
    actsAfterCaster: !!spec.actsAfterCaster,
    bakedEffectsJson: spec.bakedEffects ? JSON.stringify(spec.bakedEffects) : "",   // toggled-off mode AEs on the summon (Siege Form)
    extraItemsJson: spec.extraItems ? JSON.stringify(spec.extraItems) : "",         // extra baked abilities (Siege-Form ranged attack)
  } };
}
function hazardRule(t, spec) {
  return { id: ruleId(t, "hazard"), description: spec.description || `On use, leaves dangerous terrain for the scene.`, event: spec.event || "use", handler: {
    type: "edha-place-hazard", sizeByRank: !!spec.sizeByRank, sizeFt: spec.sizeFt || 10,
    damageFormula: spec.damageFormula || "(@tier)d(2 * @skills.red.rank + 2)", damageType: spec.damageType || "energy", color: spec.color || "red",
  } };
}
function talentEvents(t) {
  const rules = {};
  const add = r => { if (r) rules[r.id] = r; };
  if (TALENT_TRIGGERS[t.name])         add(triggerRule(t, TALENT_TRIGGERS[t.name]));
  if (TALENT_RIDERS[t.name])           add(riderRule(t, TALENT_RIDERS[t.name]));
  const tgt = TALENT_TARGETING[t.name];
  if (tgt?.burst)                      add(burstRule(t, tgt));       // burst supersedes the on-use AoE template
  else if (tgt?.area)                  add(aoeRule(t, tgt));
  if (TALENT_THP[t.name])              add(thpRule(t, TALENT_THP[t.name]));
  if (TALENT_SUMMONS[t.name])          add(summonRule(t, TALENT_SUMMONS[t.name]));
  if (TALENT_HAZARDS[t.name])          add(hazardRule(t, TALENT_HAZARDS[t.name]));
  if (TALENT_DEF_BUFFS[t.name])        add(defenseBuffRule(t, TALENT_DEF_BUFFS[t.name]));
  const st = TALENT_STATE[t.name];
  if (st) for (const spec of (Array.isArray(st) ? st : [st])) add(stateRule(t, spec));   // a talent may carry several state rules
  return rules;
}
const aeChange = c => ({ key: c.key, mode: c.mode ?? 2, value: String(c.value ?? "") });
function talentEffects(t) {
  const spec = TALENT_EFFECTS[t.name];
  if (!spec) return [];
  // Full ActiveEffect source docs. NOTE (root cause of the old "stripped on load" issue): Foundry
  // LevelDB packs store embedded effects as SEPARATE `!items.effects!<itemId>.<effectId>` keys, with
  // the parent item's `effects` field holding only the ID strings — writePack() does that split.
  // Inline effect objects in the item doc are silently ignored on compendium load.
  return (Array.isArray(spec) ? spec : [spec]).map((e, i) => ({
    _id: fid(`ae:${t.docId}:${i}`),
    name: e.label || t.name,
    img: e.icon || "icons/svg/upgrade.svg",
    type: "base",
    system: {},
    changes: (e.changes || []).map(aeChange),
    disabled: !!e.disabled,   // conditional passives bake toggled-OFF (player enables on the actor)
    transfer: e.transfer !== false,        // transfer:false = apply-to-TARGET template (drag onto the victim's sheet)
    description: e.description || "",
    origin: null,
    tint: "#ffffff",
    statuses: Array.isArray(e.statuses) ? e.statuses : [],   // token-icon statuses (e.g. ["slowed"])
    sort: 0,
    flags: { "edha-content": { passive: true } },
    _stats: stats(),
  }));
}

// ---------- helpers ----------
const G = (o, ...keys) => { for (const k of keys) if (o[k] != null && o[k] !== "") return o[k]; return ""; };
const fid = seed => crypto.createHash("sha1").update(seed).digest("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 16);
const slugify = s => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const paras = t => { t = String(t || "").trim(); return t ? t.split(/\n{2,}/).map(p => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("") : ""; };
const iconSpan = s => `<span class="cosmere-icon" data-tooltip="${s.tip}" aria-label="${s.tip}">${s.glyph}</span>`;

function parseCost(costStr) {
  const out = { consume: [], costText: null };
  let c = String(costStr || "").replace(/investiure/ig, "Investiture").trim();
  if (!c || /^[—-]$/.test(c)) return out;
  const shown = [];
  for (const part of c.split(/\s*[;,+]\s*/).map(s => s.trim()).filter(Boolean)) {
    let m;
    if ((m = part.match(/^(\d+)\s*Investiture$/i))) { out.consume.push({ type:"resource", resource:"inv", value:{ min:+m[1], max:+m[1], actual:0 } }); shown.push(`${m[1]} Investiture`); }
    else if ((m = part.match(/^(\d+)\s*Focus$/i))) { out.consume.push({ type:"resource", resource:"foc", value:{ min:+m[1], max:+m[1], actual:0 } }); shown.push(`${m[1]} Focus`); }
    else shown.push(part);
  }
  out.costText = shown.length ? shown.join(", ") : null;
  return out;
}
function prereqGroups(s) {
  if (!s || /^\s*[—-]\s*$/.test(s)) return [];
  return s.split(/\s*[;,]\s*|\s+and\s+/i).map(p => p.trim()).filter(Boolean).map(part => part.split(/\s+or\s+/i).map(x => x.trim()).filter(Boolean));
}
function classifyToken(tok, index, heroicIds, localByName) {
  const t = tok.trim();
  const m = t.match(/^([A-Za-z][A-Za-z\s]*?)\s+(?:rank\s+)?(\d+)\s*\+?$/i);
  if (m) {
    const word = m[1].trim(), rank = +m[2], up = word.toUpperCase(), low = word.toLowerCase();
    if (ATTR_ALIASES[up]) return { kind:"attribute", attribute:ATTR_ALIASES[up], rank };
    if (LEYLINE_SKILL[low]) return { kind:"skill", skill:LEYLINE_SKILL[low], rank };
    if (STD_SKILL[low]) return { kind:"skill", skill:STD_SKILL[low], rank };
    return { kind:"narrative", text:t };
  }
  // Tree-LOCAL resolution first (07-18 bench: 28 talent names collide across trees, and the global
  // byName index is first-writer-wins — Warrior's "Combat Training" prose prereq resolved to the
  // HUNTER copy, so owning the Warrior copy never satisfied it). A prereq names its own tree's
  // copy whenever one exists; the global index is the cross-tree fallback.
  const local = localByName && localByName[t.toLowerCase()];
  if (local) return { kind:"talent", slug:local.slug, uuid:local.uuid, label:local.name };
  const hit = index.byName[t.toLowerCase()];
  if (hit) return { kind:"talent", slug:hit.slug, uuid:hit.uuid, label:hit.name };
  if (heroicIds[t]) return { kind:"talent", slug:slugify(t), uuid:`Compendium.cosmere-rpg.heroic-paths.Item.${heroicIds[t]}`, label:t, external:true };
  return { kind:"narrative", text:t };
}
function norm(raw, atlas, group, treeId) {
  return {
    atlas, group, treeId,
    name: G(raw, "name", "Name", "Talent Name"),
    action: G(raw, "action", "Action", "Action Type"),
    cost: G(raw, "cost", "Cost") || "—",
    prereqs: G(raw, "prerequisites", "Prerequisites"),
    description: G(raw, "description", "Description"),
    flavor: G(raw, "flavor", "Flavor Text", "Flavor"),
    tags: G(raw, "tags", "Tags"),
    specialty: G(raw, "specialty", "Specialty", "Tree"),
    layout: raw.layout && typeof raw.layout.x === "number" ? { x: raw.layout.x, y: raw.layout.y } : null,
    connections: Array.isArray(raw.connections) ? raw.connections.slice() : null,
  };
}

const LEYLINE_COLORS = ["White", "Blue", "Black", "Red", "Green"];
const HEROIC_PATHS = ["Agent", "Envoy", "Hunter", "Leader", "Scholar", "Warrior"];

function buildTrees() {
  const trees = [];
  // ALL atlases are always ASSEMBLED (in memory) so adversary `talents` references can resolve
  // under any scope — SCOPE gates which packs get WRITTEN (see toWrite in main), not assembly.
  const want = () => true;
  if (want("leyline")) {
    const ley = JSON.parse(fs.readFileSync(`${DATA}/leyline.json`, "utf-8"));
    for (const color of LEYLINE_COLORS) {
      const id = `leyline/${color}`;
      const talents = ley.filter(t => (t.path || t.Path) === color).map(r => norm(r, "leyline", color, id));
      trees.push({ id, atlas:"leyline", pack:ATLAS_PACK.leyline, group:color, color:color.toLowerCase(), treeName:`${color} Leyline`, talents });
    }
  }
  if (want("deity")) {
    const dom = JSON.parse(fs.readFileSync(`${DATA}/domain.json`, "utf-8"));
    const byDeity = {};
    for (const r of dom) (byDeity[r.Deity] = byDeity[r.Deity] || []).push(r);
    for (const deity of Object.keys(byDeity)) {
      // Display by DOMAIN (e.g. "Chaos"), not deity name ("Maelith"). Folder + path Item = domain;
      // tree = "<Domain> Talents" (mirrors heroic "Agent" vs "Agent Talents"). Deity name lives only in the description.
      const rows = byDeity[deity], id = `deity/${deity}`, domain = rows[0].Domain;
      const color = slugify(((rows[0].Colors || "white").split(/[\/,]/)[0] || "white").trim());
      trees.push({ id, atlas:"deity", pack:ATLAS_PACK.deity, group:domain, deity, domain, color, treeName:`${domain} Talents`, talents: rows.map(r => norm(r, "deity", domain, id)) });
    }
  }
  if (want("heroic")) {
    const cos = JSON.parse(fs.readFileSync(`${DATA}/cosmere.json`, "utf-8"));
    for (const path of HEROIC_PATHS) {
      const id = `heroic/${path}`;
      const talents = cos.filter(t => (t.Path || t.path) === path).map(r => norm(r, "heroic", path, id));
      trees.push({ id, atlas:"heroic", pack:ATLAS_PACK.heroic, group:path, color:"", treeName:`${path} Talents`, icon:HEROIC_ICON(path), talents });
    }
  }
  return trees;
}

function talentImg(tree) {
  if (tree.atlas === "leyline") return COLOR_ICON[tree.color] || DEITY_ICON;
  if (tree.atlas === "heroic") return tree.icon;
  return DEITY_ICON;
}
function pathDescription(tree) {
  // Heroic: verbatim canon text (includes its own specialty + Key sections) — no append.
  if (tree.atlas === "heroic") return DESCRIPTIONS.heroic[tree.group] || `<p><em>The ${esc(tree.group)} heroic path.</em></p>`;
  // Leyline (by color) / deity (by domain): authored prose, then append the Key-talent note when a Key exists.
  let h = (tree.atlas === "leyline" ? DESCRIPTIONS.leyline[tree.color] : DESCRIPTIONS.deity[tree.group]) || "";
  if (tree.keyName && tree.keyUuid) h += `<h3>Key Talent</h3><p>@UUID[${tree.keyUuid}]{${esc(tree.keyName)}} unlocks this path.</p>`;
  return h;
}
// Draw Mana — ONE universal leyline ACTION (type "action" so it never counts toward the talent budget),
// granted by every leyline path alongside the Key. Per-color rider lives on the Key talent (applied at runtime).
const DRAW_MANA_DOCID = fid("core:draw-mana");
const DRAW_MANA_UUID = `Compendium.${MODID}.${ATLAS_PACK.leyline}.Item.${DRAW_MANA_DOCID}`;
function pathEvents(tree) {
  const ev = {};
  if (tree.keyUuid) {
    const g = fid(`ev:grant:${tree.id}`), r = fid(`ev:remove:${tree.id}`);
    ev[g] = { id:g, description:"Grant Key Talent", event:"add-to-actor", handler:{ type:"grant-items", allowDuplicates:false, increaseQuantity:false, items:[{ uuid:tree.keyUuid }] } };
    ev[r] = { id:r, description:"Remove Key Talent", event:"remove-from-actor", handler:{ type:"remove-items", reduceQuantity:false, items:[tree.keyUuid] } };
  }
  if (tree.atlas === "leyline") {
    const g = fid(`ev:grantdm:${tree.id}`), r = fid(`ev:removedm:${tree.id}`);
    ev[g] = { id:g, description:"Grant Draw Mana", event:"add-to-actor", handler:{ type:"grant-items", allowDuplicates:false, increaseQuantity:false, items:[{ uuid:DRAW_MANA_UUID }] } };
    ev[r] = { id:r, description:"Remove Draw Mana", event:"remove-from-actor", handler:{ type:"remove-items", reduceQuantity:false, items:[DRAW_MANA_UUID] } };
  }
  return ev;
}

// ---------- main ----------
(async () => {
  const heroicIds = (() => { try { return JSON.parse(fs.readFileSync("C:/tmp/heroic_ids.json", "utf-8")); } catch { return {}; } })();
  const trees = buildTrees();

  // Pass 1: ids/slugs/uuids + specialties + key + global name index
  const index = { byName: {} };
  const usedSlugs = new Set();
  for (const tree of trees) {
    const specs = new Set();
    for (const t of tree.talents) {
      let s = slugify(t.name);
      if (usedSlugs.has(s)) s = slugify(`${tree.group}-${t.name}`);
      while (usedSlugs.has(s)) s = `${s}-x`;
      usedSlugs.add(s);
      t.slug = s;
      t.docId = fid(`talent:${tree.id}:${t.name}`);
      t.nodeId = fid(`node:${tree.id}:${t.name}`);
      t.uuid = `Compendium.${MODID}.${tree.pack}.Item.${t.docId}`;
      t.isKey = (t.specialty === "Key");
      if (t.isKey) { tree.keyName = t.name; tree.keyUuid = t.uuid; tree.keyDocId = t.docId; }
      else if (t.specialty) specs.add(t.specialty);
      const k = t.name.toLowerCase();
      if (!index.byName[k]) index.byName[k] = { slug:t.slug, uuid:t.uuid, name:t.name };
    }
    // Deity domains have a single specialty (== the domain): drop the redundant subfolder, file talents in the domain folder.
    tree.specialtyList = tree.atlas === "deity" ? [] : [...specs];
    tree.treeDocId = fid(`tree:${tree.id}`);
    tree.treeUuid = `Compendium.${MODID}.${tree.pack}.Item.${tree.treeDocId}`;
    tree.pathDocId = fid(`path:${tree.id}`);
    tree.pathFolderId = fid(`folder:${tree.pack}:${tree.id}`);
  }

  // Output accumulators, per pack
  const out = {}; // pack -> { items:[], folders:[] }
  for (const pack of Object.values(ATLAS_PACK)) out[pack] = { items: [], folders: [] };

  const report = { talents:0, trees:0, paths:0, edges:0, skillPrereqs:0, narrative:0, rollable:0, events:0, effects:0, authored:0, unresolved:[] };
  const backgrounds = []; // { file, content } SVGs to write after packs

  for (const tree of trees) {
    const P = out[tree.pack];
    // folders: path folder + specialty subfolders
    P.folders.push(folderDoc(tree.pathFolderId, tree.group, null));
    const specFolder = {};
    for (const spec of tree.specialtyList) {
      const sid = fid(`folder:${tree.pack}:${tree.id}:${spec}`);
      specFolder[spec] = sid;
      P.folders.push(folderDoc(sid, spec, tree.pathFolderId));
    }

    const nodes = {};
    const nameToNode = {};
    tree.talents.forEach(t => { nameToNode[t.name.toLowerCase()] = t; });

    let sortT = 0;
    for (const t of tree.talents) {
      const spec = activationSpec(t.action);
      const { consume, costText } = parseCost(t.cost);

      // edges (connections array authoritative; else prereq-string talent tokens)
      let edgeNames = Array.isArray(t.connections) ? t.connections : null;
      if (!edgeNames) {
        edgeNames = [];
        for (const grp of prereqGroups(t.prereqs)) for (const tok of grp) {
          const c = classifyToken(tok, index, heroicIds);
          if (c.kind === "talent") edgeNames.push(c.label);
        }
      }
      const edgeSources = [];
      for (const nm of edgeNames) { const s = nameToNode[String(nm).toLowerCase()]; if (s) edgeSources.push(s); else report.unresolved.push(`${tree.id}::${t.name}-conn->${nm}`); }

      const talentPrereqs = {}, nodePrereqs = {}, nodeConns = {};
      // All parent edges share ONE managed talent prereq whose `talents` map holds every parent.
      // The cosmere sheet evaluates `prereq.talents.some(...)` (OR) WITHIN a talent prereq but
      // `.every(...)` (AND) ACROSS separate prereqs — so one-prereq-per-parent meant a node with
      // two parents required BOTH. Grouping them into a single prereq makes any one parent unlock it
      // (OR), exactly mirroring the system's own addConnection(), which appends each new edge's talent
      // to the existing managed prereq rather than creating a second one.
      if (edgeSources.length) {
        const pid = fid(`edge:${tree.id}:${t.name}`);
        const talents = {};
        for (const src of edgeSources) {
          talents[src.slug] = { id:src.slug, uuid:src.uuid, label:src.name, _id:src.slug };
          nodeConns[src.nodeId] = { id:src.nodeId, prerequisiteId:pid, _id:src.nodeId };
          report.edges++;
        }
        nodePrereqs[pid] = { id:pid, type:"talent", managed:true, attribute:"str", value:1, talents, _id:pid };
      }
      for (const group of prereqGroups(t.prereqs)) {
        const clauses = group.map(tok => classifyToken(tok, index, heroicIds, nameToNode));
        const pid = fid(`pr:${tree.id}:${t.name}:${group.join("|")}`);
        const talentClauses = clauses.filter(c => c.kind === "talent");
        if (talentClauses.length) {
          // NOTE (07-18 bench): a prose clause that is also a drawn edge yields the same-named
          // prereq on both the tree node (managed edge) and the talent doc (prose) — that display
          // is tolerable; the BUG was the prose clause resolving to another tree's same-named copy
          // (global first-writer byName), which made it unsatisfiable. classifyToken now resolves
          // tree-local first, so both entries point at the same copy and both pass together.
          talentPrereqs[pid] = { type:"talent", attribute:"str", value:1, rank:1, mode: talentClauses.length > 1 ? "any-of" : "all", talents: talentClauses.map(c => ({ id:c.slug, uuid:c.uuid, label:c.label })) };
          const notDrawn = talentClauses.filter(c => !edgeSources.some(s => s.slug === c.slug));
          if (notDrawn.length) nodePrereqs[pid] = { id:pid, type:"talent", managed:false, attribute:"str", value:1, talents:Object.fromEntries(notDrawn.map(c => [c.slug, { id:c.slug, uuid:c.uuid, label:c.label, _id:c.slug }])), _id:pid };
        } else {
          const c = clauses[0];
          if (c.kind === "skill") { talentPrereqs[pid] = { type:"skill", skill:c.skill, rank:c.rank, attribute:SKILL_ATTR[c.skill]||"str", value:1, talents:[] }; nodePrereqs[pid] = { id:pid, type:"skill", managed:false, skill:c.skill, rank:c.rank, attribute:SKILL_ATTR[c.skill]||"str", value:1, _id:pid }; report.skillPrereqs++; }
          else if (c.kind === "attribute") { talentPrereqs[pid] = { type:"attribute", attribute:c.attribute, value:c.rank, talents:[] }; nodePrereqs[pid] = { id:pid, type:"attribute", managed:false, attribute:c.attribute, value:c.rank, _id:pid }; }
          else { const text = group.join(" or "); talentPrereqs[pid] = { type:"connection", description:text, attribute:"str", value:1, rank:1, talents:[] }; nodePrereqs[pid] = { id:pid, type:"connection", managed:false, description:text, attribute:"str", value:1, _id:pid }; report.narrative++; }
        }
      }

      const descValue = `<p><strong>Activation:</strong> ${iconSpan(spec)}</p>` + (costText ? `<p><strong>Cost:</strong> ${esc(costText)}</p>` : "") + (t.flavor ? `<p><em>${esc(t.flavor)}</em></p>` : "") + (paras(t.description) || "");
      const descShort = `<p><strong>Activation:</strong> ${iconSpan(spec)}</p>` + (paras(t.description) || "");
      const { activation, damage } = rollData(t.name, spec, consume);
      if (TALENT_ROLLS[t.name]) report.rollable++;
      const events = talentEvents(t);
      const effects = talentEffects(t);
      if (Object.keys(events).length) report.events++;
      if (effects.length) report.effects++;
      const talentDoc = {
        folder: (t.isKey || !t.specialty) ? tree.pathFolderId : (specFolder[t.specialty] || tree.pathFolderId),
        name: t.name, type: "talent", _id: t.docId, img: pickTalentIcon({ name: t.name, specialty: t.specialty, fallback: talentImg(tree) }),
        system: {
          id: t.slug, type: "path",
          description: { value: descValue, chat: descShort, short: descShort },
          activation,
          damage,
          path: tree.color || slugify(tree.group), hasPath: false, specialty: "", hasSpecialty: false, ancestry: null, hasAncestry: false,
          prerequisites: talentPrereqs, prerequisitesMet: false, modality: STANCE_TALENTS.has(t.name) ? "stance" : null,
          events,
        },
        effects, sort: (sortT += 100000), ownership: { default: 0 },
        flags: { "edha-content": { atlas: tree.atlas, group: tree.group, specialty: t.specialty, tags: t.tags } },
        _stats: stats(),
      };
      // Overlay Foundry-authored edits (description/activation/damage/events/effects/img). Authored wins
      // over both the generator and the side-file tables, so in-Foundry edits captured by foundry-extract.js
      // persist. Structural fields (name/ids/prerequisites/folder/node graph) stay generator-owned.
      const ovr = AUTHORED.byId[t.docId] || AUTHORED.byName[t.name];
      if (ovr) { applyAuthorable(talentDoc, ovr); report.authored++; }
      P.items.push(talentDoc);
      report.talents++;

      const lay = t.layout || { x: 0.5, y: 0.5 };
      nodes[t.nodeId] = { id: t.nodeId, type: "talent", position: { x: Math.round(lay.x * SX), y: Math.round(lay.y * SY) }, talentId: t.slug, uuid: t.uuid, size: { width: 50, height: 50 }, showName: false, prerequisites: nodePrereqs, connections: nodeConns };
    }

    // center tree on origin
    const xs = Object.values(nodes).map(n => n.position.x), ys = Object.values(nodes).map(n => n.position.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = Math.round((minX + maxX) / 2), cy = Math.round((minY + maxY) / 2);
    for (const n of Object.values(nodes)) { n.position.x -= cx; n.position.y -= cy; }
    const w = (maxX - minX) + 50, h = (maxY - minY) + 50;
    const contentW = w + 2 * PAD, contentH = h + 2 * PAD;
    // The cosmere tree sheet frames the initial view so its visible-region CENTER = viewBounds.{x,y}
    // (worldToView: screen = P*zoom − _view.x, with _view.x = (viewBounds.x − viewBounds.width/2)*zoom).
    // Nodes are centered on origin, so x=y=0 centers the tree. Expand the rect to the window aspect
    // ratio so BOTH axes stay centered regardless of the fit-zoom.
    const A = DISPLAY_W / DISPLAY_H;
    const vb = {
      x: 0, y: 0,
      width: Math.max(contentW, Math.round(contentH * A)),
      height: Math.max(contentH, Math.round(contentW / A)),
    };

    // combined talent_tree — background sprite tightly wraps the centered content (its corner is the
    // top-left of the content box, independent of the viewBounds framing rect).
    const bgCorner = { x: -Math.round(contentW / 2), y: -Math.round(contentH / 2) };
    const bgSvg = generateBackgroundSvg(tree, contentW, contentH, bgCorner, nodes);
    const bgFile = bgSvg ? `${tree.id.replace("/", "-")}.svg` : null;
    // Only write background files for in-scope atlases (assembly runs for all — see buildTrees).
    if (bgSvg && bgFile && (SCOPE === "all" || SCOPE === tree.atlas)) backgrounds.push({ file: bgFile, content: bgSvg });
    const bg = bgFile
      ? { img: `modules/${MODID}/backgrounds/${bgFile}`, width: contentW, height: contentH, position: bgCorner }
      : { img: null, width: 0, height: 0, position: { x: 0, y: 0 } };
    P.items.push({
      folder: tree.pathFolderId, name: tree.treeName, type: "talent_tree", _id: tree.treeDocId, img: talentImg(tree),
      system: { nodes, viewBounds: vb, display: { width: DISPLAY_W, height: DISPLAY_H }, background: bg },
      effects: [], sort: 0, ownership: { default: 0 },
      flags: { "cosmere-rpg": { sheet: { mode: "view" } }, "edha-content": { atlas: tree.atlas, group: tree.group } },
      _stats: stats(),
    });
    report.trees++;

    // path item
    const pathImg = tree.atlas === "heroic" ? tree.icon : (tree.atlas === "leyline" ? (COLOR_ICON[tree.color] || DEITY_ICON) : DEITY_ICON);
    P.items.push({
      folder: tree.pathFolderId, name: tree.group, type: "path", _id: tree.pathDocId, img: pathImg,
      system: {
        id: slugify(tree.group), type: tree.atlas,
        description: { value: pathDescription(tree), chat: pathDescription(tree), short: pathDescription(tree) },
        talentTree: tree.treeUuid,
        events: pathEvents(tree),
      },
      effects: [], sort: 0, ownership: { default: 0 }, flags: { "edha-content": { atlas: tree.atlas } }, _stats: stats(),
    });
    report.paths++;
  }

  // Draw Mana — one universal leyline action item (granted by every leyline path via pathEvents;
  // ALSO embedded on every attuned adversary — ruling 49). type "action" (not talent) → exempt from
  // the talent budget; rider effect applied at runtime by the Key.
  if (SCOPE === "all" || SCOPE === "leyline") {
    out[ATLAS_PACK.leyline].items.push(drawManaItemDoc({ _id: DRAW_MANA_DOCID, sort: -10, flags: { "edha-content": { core: true, drawMana: true } } }));
  }

  const FORCE = process.argv.includes("--force");
  const BASELINE_DIR = `${DATA}/authored/.baselines`;
  // Every atlas is assembled above; only in-scope packs are written (or the guard would block
  // scope=adversaries on unrelated un-extracted talent edits, and pack writes would be surprises).
  const PACK_ATLAS = Object.fromEntries(Object.entries(ATLAS_PACK).map(([a, p]) => [p, a]));
  const toWrite = Object.entries(out).filter(([pack, d]) => d.items.length && (SCOPE === "all" || SCOPE === PACK_ATLAS[pack]));
  // GUARD pre-flight: check EVERY pack before writing ANY, so a dirty pack can't leave a half-rebuilt set.
  const dirtyByPack = {};
  for (const [pack] of toWrite) {
    const guard = await guardUnextracted(pack, `${MODROOT}/packs/${pack}`, BASELINE_DIR);
    if (guard.dirty.length) dirtyByPack[pack] = guard.dirty;
  }
  if (Object.keys(dirtyByPack).length && !FORCE) {
    console.error(`\n✗ ABORT — un-extracted Foundry edits would be destroyed by this build (nothing was written):`);
    for (const [pack, names] of Object.entries(dirtyByPack)) {
      console.error(`  ${pack}: ${names.length} talent(s)`);
      names.slice(0, 40).forEach(n => console.error("    - " + n));
      console.error(`    save:  node foundry-extract.js ${pack.replace(/^edha-/, "")}`);
    }
    console.error(`\n  Or discard them and rebuild from source:  re-run with --force`);
    process.exit(1);
  }
  if (Object.keys(dirtyByPack).length && FORCE) {
    for (const [pack, names] of Object.entries(dirtyByPack)) console.warn(`  [guard] --force: discarding ${names.length} un-extracted Foundry edit(s) in ${pack}.`);
  }
  for (const [pack, data] of toWrite) {
    const packDir = `${MODROOT}/packs/${pack}`;
    await writePack(packDir, data.items, data.folders);
    // Refresh the guard baseline = exactly what we just wrote.
    const bl = {};
    for (const d of data.items) if (d.type === "talent") bl[d._id] = fingerprint(d);
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
    fs.writeFileSync(`${BASELINE_DIR}/${pack}.json`, JSON.stringify(bl, null, 0));
  }

  // Adversaries (Actor pack) — built when scope is "all" or "adversaries".
  let advReport = null;
  if (SCOPE === "all" || SCOPE === "adversaries") {
    // Talent index for adversary `talents` embeds: name (lowercase) → built talent docs.
    // Assembled across ALL atlases (buildTrees ignores scope), so refs resolve under any scope.
    const talentByName = new Map();
    for (const pack of Object.values(ATLAS_PACK)) {
      for (const it of out[pack].items) {
        if (it.type !== "talent") continue;
        const k = it.name.toLowerCase();
        if (!talentByName.has(k)) talentByName.set(k, []);
        talentByName.get(k).push(it);
      }
    }
    // Refs are "Talent Name" or the self-documenting "Group/Talent Name" (e.g. "White/Guiding Signal").
    // Unknown or ambiguous refs are HARD build errors — a typo here must never ship a talent-less actor.
    const resolveTalentDoc = (ref, advName) => {
      const m = /^(.+?)\/(.+)$/.exec(String(ref).trim());
      const name = (m ? m[2] : String(ref)).trim().toLowerCase();
      let cands = talentByName.get(name) || [];
      if (m) cands = cands.filter(d => String(d.flags?.["edha-content"]?.group).toLowerCase() === m[1].trim().toLowerCase());
      if (!cands.length) throw new Error(`adversaries.json (${advName}): talent "${ref}" not found in any tree`);
      if (cands.length > 1) throw new Error(`adversaries.json (${advName}): talent "${ref}" is ambiguous (${cands.map(d => d.flags?.["edha-content"]?.group).join(", ")}) — qualify as "Group/Talent Name"`);
      return cands[0];
    };
    const adv = buildAdversaries(resolveTalentDoc);
    await writeActorPack(`${MODROOT}/packs/${ADV_PACK}`, adv.actors, adv.items, adv.folders);
    advReport = { actors: adv.actors.length, items: adv.items.length, talents: adv.talentEmbeds };
  }

  // Items (edha-items — opened 2026-07-18, §9j rescope): the Edha-authored gear in data/items.json.
  // Prices are native price.value + price.denomination against the registered `edha` currency
  // (canon §5d). No baseline guard: items have no Foundry-authored round-trip yet (foundry-extract
  // doesn't cover them). The shipped-gear mirror lands in data/items.json AFTER Ben commits the
  // items dump (scripts/items-dump-console.js) — this scope builds whatever the file holds.
  let itemsReport = null;
  if (SCOPE === "all" || SCOPE === "items") {
    const itemsSrc = JSON.parse(fs.readFileSync(`${DATA}/items.json`, "utf-8"));
    const docs = [], ifolders = [];
    const folderId = {};
    for (const fname of itemsSrc._meta.folders || []) {
      folderId[fname] = fid(`folder:${ITEMS_PACK}:${fname}`);
      ifolders.push(folderDoc(folderId[fname], fname, null));
    }
    let sortI = 0;
    for (const it of itemsSrc.items) {
      const slug = slugifyItem(it.name);
      const priceLine = it.price?.value
        ? `<p><strong>Price</strong> ${it.price.value} ${({ copper: "c", silver: "s", gold: "g" })[it.price.denomination] || it.price.denomination}; <strong>Weight</strong> ${it.weight ?? 0} lb.;</p>`
        : "";
      const description = { value: priceLine + (it.description || ""), chat: "", short: "" };
      const price = { value: it.price?.value ?? 0, currency: "edha", denomination: { primary: it.price?.denomination || "copper" } };
      const base = {
        folder: folderId[it.folder] || null, name: it.name, type: it.type, _id: fid(`item:${slug}`),
        img: it.img || "icons/svg/item-bag.svg", sort: (sortI += 100000), ownership: { default: 0 },
        flags: { "edha-content": { item: true } }, effects: [], _stats: stats(),
      };
      if (it.type === "weapon") {
        base.system = {
          id: it.weaponId || slug, type: it.weaponType || "light_wpn", description,
          equipped: false, alwaysEquipped: false, equip: { type: "hold" },
          activation: { type: "skill_test", cost: { value: 1, type: "act" }, skill: it.skill || "lwp", attribute: "str", modifierFormula: "", consume: [], flavor: "", plotDie: false, uses: null },
          damage: { skill: it.skill || "lwp", formula: it.damage?.formula || null, type: it.damage?.type || null, attribute: null },
          attack: { type: "melee", range: { value: it.range?.value ?? 5, unit: it.range?.unit || "ft" } },
          traits: {}, expertise: false, quantity: 1, weight: { value: it.weight ?? 0, unit: "lb" }, price,
        };
      } else {
        base.system = {
          type: "basic", description, quantity: 1,
          weight: { value: it.weight ?? 0, unit: "lb" }, price,
        };
      }
      docs.push(base);
    }
    await writePack(`${MODROOT}/packs/${ITEMS_PACK}`, docs, ifolders);
    itemsReport = { items: docs.length, folders: ifolders.length };
  }

  if (backgrounds.length) {
    const bgDir = `${MODROOT}/backgrounds`;
    fs.mkdirSync(bgDir, { recursive: true });
    for (const { file, content } of backgrounds) fs.writeFileSync(`${bgDir}/${file}`, content, "utf8");
  }

  // NOTE: the behaviour tables are GENERATOR INPUTS ONLY. They are no longer copied into the module —
  // the runtime reads behaviour exclusively from each talent's own system.events / effects. Clean up
  // any stale copies from older builds so nothing can silently fall back to them.
  const modDataDir = `${MODROOT}/data`;
  try {
    if (fs.existsSync(modDataDir)) {
      for (const f of fs.readdirSync(modDataDir)) if (f.startsWith("talent-") && f.endsWith(".json")) fs.rmSync(`${modDataDir}/${f}`);
    }
  } catch (e) { console.warn(`  (module data cleanup: ${e.message})`); }

  console.log(`Edha build v2 (scope=${SCOPE}):`);
  console.log(`  talents:${report.talents} trees:${report.trees} paths:${report.paths} edges:${report.edges} skillPrereqs:${report.skillPrereqs} narrative:${report.narrative} rollable:${report.rollable} events:${report.events} effects:${report.effects} authored-overlays:${report.authored}`);
  for (const [pack, d] of toWrite) console.log(`  ${pack}: ${d.items.length} items, ${d.folders.length} folders`);
  if (advReport) console.log(`  ${ADV_PACK}: ${advReport.actors} adversaries, ${advReport.items} embedded items (${advReport.talents || 0} tree-talent embeds)`);
  if (itemsReport) console.log(`  ${ITEMS_PACK}: ${itemsReport.items} items, ${itemsReport.folders} folders`);
  if (backgrounds.length) console.log(`  backgrounds: ${backgrounds.length} SVGs written to ${MODROOT}/backgrounds`);
  if (report.unresolved.length) { console.log(`  unresolved edge refs: ${report.unresolved.length}`); report.unresolved.slice(0, 12).forEach(u => console.log("    -", u)); }
})().catch(e => { console.error(e); process.exit(1); });

function stats() { return { coreVersion: CORE, systemId: SYSID, systemVersion: SYSVER, createdTime: NOW, modifiedTime: NOW, lastModifiedBy: null, compendiumSource: null, duplicateSource: null, exportSource: null }; }
function folderDoc(id, name, parent, type = "Item") { return { _id: id, name, type, folder: parent, description: "", sorting: "m", color: null, sort: 0, flags: {}, _stats: stats() }; }
// Generate an SVG background with specialty column-header labels for trees that have specialties.
// Coordinates: world point P maps to SVG pixel (P − corner); the centered-tree origin (0,0) lands at
// SVG (−corner.x, −corner.y). SVG canvas is the content box (contentW × contentH).
function generateBackgroundSvg(tree, contentW, contentH, corner, nodes) {
  if (!tree.specialtyList || tree.specialtyList.length === 0) return null;
  const ox = -corner.x, oy = -corner.y;
  const specStats = {};
  for (const t of tree.talents) {
    if (!t.specialty || t.specialty === "Key") continue;
    const node = nodes[t.nodeId];
    if (!node) continue;
    const { x, y } = node.position;
    if (!specStats[t.specialty]) specStats[t.specialty] = { xs: [], minY: Infinity };
    specStats[t.specialty].xs.push(x);
    specStats[t.specialty].minY = Math.min(specStats[t.specialty].minY, y);
  }
  const labels = [];
  for (const spec of tree.specialtyList) {
    const s = specStats[spec];
    if (!s || !s.xs.length) continue;
    const avgX = s.xs.reduce((a, b) => a + b, 0) / s.xs.length;
    const svgX = ox + avgX;
    const svgY = Math.max(20, oy + s.minY - 55);
    labels.push(
      `  <text x="${svgX.toFixed(0)}" y="${svgY.toFixed(0)}" text-anchor="middle"` +
      ` font-family="'Didact Gothic',sans-serif" font-size="20" font-weight="bold"` +
      ` fill="white" stroke="#1a1a2e" stroke-width="4" paint-order="stroke fill">${esc(spec)}</text>`
    );
  }
  if (!labels.length) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${contentW}" height="${contentH}" viewBox="0 0 ${contentW} ${contentH}">\n${labels.join("\n")}\n</svg>`;
}
// Detect talents whose on-disk authorable content differs from the last build/extract baseline —
// i.e. edits made directly in Foundry that foundry-extract.js has not yet captured. The builder
// aborts rather than wipe them. Returns { dirty:[names], hadBaseline }.
async function guardUnextracted(pack, packDir, baselineDir) {
  let baseline = null;
  try { baseline = JSON.parse(fs.readFileSync(`${baselineDir}/${pack}.json`, "utf-8")); } catch {}
  if (!baseline) {
    console.warn(`  [guard] no baseline for ${pack} — cannot verify prior Foundry edits. If you have unsaved edits, Ctrl-C and run: node foundry-extract.js baseline`);
    return { dirty: [], hadBaseline: false };
  }
  let live = null;
  try { live = await readPack(packDir); }
  catch (e) { console.warn(`  [guard] could not read ${pack} (${e.code || e.message}) — guard skipped for this pack.`); return { dirty: [], hadBaseline: true }; }
  if (!live) return { dirty: [], hadBaseline: true };
  const dirty = [];
  for (const d of live.items) {
    if (d.type !== "talent") continue;
    const base = baseline[d._id];
    if (base === undefined) continue;            // doc not in baseline (newly added) — nothing captured to lose
    if (fingerprint(d) !== base) dirty.push(d.name);
  }
  return { dirty, hadBaseline: true };
}
async function writePack(dir, docs, folders) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const db = new ClassicLevel(dir, { keyEncoding: "utf8", valueEncoding: "json" });
  await db.open();
  const batch = db.batch();
  for (const f of folders) batch.put(`!folders!${f._id}`, f);
  for (const d of docs) {
    // Foundry stores embedded ActiveEffects as separate `!items.effects!<itemId>.<effectId>` keys;
    // the parent item's `effects` field is an array of ID STRINGS. Inline objects are ignored on load.
    const effs = Array.isArray(d.effects) ? d.effects.filter(e => e && typeof e === "object") : [];
    if (effs.length) {
      for (const e of effs) batch.put(`!items.effects!${d._id}.${e._id}`, e);
      batch.put(`!items!${d._id}`, { ...d, effects: effs.map(e => e._id) });
    } else {
      batch.put(`!items!${d._id}`, d);
    }
  }
  await batch.write();
  await db.close();
}

// ===================== Adversaries (Actor compendium) =====================
// Reads data/adversaries.json and builds the `edha-adversaries` pack: one `adversary` actor per
// entry with embedded `action`/`trait` items. Schema mirrors the cosmere companions-and-adversaries
// pack. LevelDB actor format: `!actors!<id>` holds the actor (its `items` field = array of item id
// STRINGS), and each embedded item is a SEPARATE `!actors.items!<actorId>.<itemId>` key.
function cap(s) { s = String(s || ""); return s ? s[0].toUpperCase() + s.slice(1) : s; }
function stripFlat(f) { return String(f || "").replace(/\s*[+-]\s*\d+\s*$/, "").trim(); } // "1d6+2" -> "1d6"
function rangeLabel(r) {
  // "Reach 5 ft." / "Range 60 ft." pass through; bare "melee" -> "Reach 5 ft.".
  const t = String(r || "").trim();
  if (!t || /^melee$/i.test(t)) return "Reach 5 ft.";
  if (/^ranged$/i.test(t)) return "Range";
  return t.replace(/^(reach|range)\b/i, m => cap(m.toLowerCase()));
}

function advItemDoc(advName, raw, sort) {
  const kind = raw.kind === "trait" ? "trait" : raw.kind === "weapon" ? "weapon" : "action";
  const costStr = raw.cost || (kind === "trait" ? "Passive" : "1 Action");
  const spec = activationSpec(costStr);
  const { consume, costText } = parseCost(raw.consume);
  const isAttack = raw.attack != null;           // damage optional: a grab/grapple attack rolls to-hit only
  const isHeal = !isAttack && raw.damage;        // damage-only roll (heal/AoE) — raw dice, no skill mod
  const ranged = /\brange\b/i.test(raw.range || "");
  const skill = raw.skill || (ranged ? "lwp" : "hwp");
  const attribute = SKILL_ATTR[skill] || "str";

  const activation = {
    type: spec.type, cost: spec.cost, consume,
    flavor: "", plotDie: false, opportunity: null, complication: null, uses: null,
    attribute: isAttack ? attribute : "default",
  };
  let damage = { formula: null, type: null };
  if (isAttack) {
    activation.type = "skill_test";
    activation.skill = skill;
    activation.modifierFormula = String(raw.attack); // flat attack bonus -> added to the d20 test as a part
    if (raw.damage) damage = { formula: raw.damage, grazeOverrideFormula: raw.graze ?? "", type: raw.damageType ?? null, skill: null, attribute: null };
  } else if (isHeal) {
    damage = { formula: raw.damage, grazeOverrideFormula: raw.graze ?? "", type: raw.damageType ?? null, skill: null, attribute: null };
  }

  let descValue;
  if (isAttack) {
    const head = [`<strong>Attack</strong> +${raw.attack}`, `<strong>${rangeLabel(raw.range)}</strong>`, `<strong>Targets</strong> ${esc(raw.targets || "one")}`];
    descValue = `<p>${head.join("; ")};</p>`;
    if (raw.damage) {
      const typeCap = cap(raw.damageType), grazeF = raw.graze || stripFlat(raw.damage);
      descValue +=
        `<p><strong>Graze</strong> [[damage ${grazeF} ${typeCap} average]];</p>` +
        `<p><strong>Hit</strong> [[damage ${raw.damage} ${typeCap} average]]${raw.rider ? `. ${raw.rider}` : ""}</p>`;
    } else if (raw.rider) {
      descValue += `<p><strong>Hit</strong> ${raw.rider}</p>`;     // no-damage attack (grab): the rider IS the hit effect
    }
    descValue +=
      (costText ? `<p><strong>Cost:</strong> ${esc(costText)}</p>` : "") +
      (raw.uses ? `<p><strong>Uses:</strong> ${esc(raw.uses)}</p>` : "");
  } else if (isHeal) {
    const typeCap = cap(raw.damageType);
    descValue =
      `<p><strong>Activation:</strong> ${iconSpan(spec)}${costText ? ` (${esc(costText)})` : ""}</p>` +
      `<p>Restores [[damage ${raw.damage} ${typeCap} average]] to the target.</p>` +
      (raw.rider ? `<p>${raw.rider}</p>` : "") +
      (raw.uses ? `<p><strong>Uses:</strong> ${esc(raw.uses)}</p>` : "");
  } else {
    descValue =
      `<p><strong>Activation:</strong> ${iconSpan(spec)}${costText ? ` (${esc(costText)})` : ""}</p>` +
      (raw.text || "") +
      (raw.uses ? `<p><strong>Uses:</strong> ${esc(raw.uses)}</p>` : "");
  }

  const img = kind === "trait" ? ADV_ITEM_ICON.trait
    : isAttack ? (ranged ? ADV_ITEM_ICON.ranged : ADV_ITEM_ICON.melee)
    : isHeal ? ADV_ITEM_ICON.heal : ADV_ITEM_ICON.utility;

  // kind:"weapon" — GROUND-TRUTHED against the 07-15 schema dump + system 2.1.0 source (the
  // ⚑⚑ pipe-cleaner guesses are corrected, bench 07-17): system.type is the weapon CATEGORY
  // (light_wpn / heavy_wpn — a StringField WITH choices, so the old slug guess only survived via
  // Foundry's lenient-load fallback to the initial), system.id is the registry/custom id slug,
  // range lives at attack.range {value, long, unit} (the old top-level `range` and `weaponId`
  // fields simply stripped), damage.skill mirrors the weapon skill (sample: Longsword), and the
  // expertise flag is `expertise`, not `expert`. Same skill_test + modifierFormula roll as the
  // action shape so the PDF attack numbers are preserved regardless of the actor's skill ranks.
  const weaponRangeVal = (() => { const m = /(\d+)/.exec(raw.range || ""); return m ? Number(m[1]) : null; })();
  const weaponType = raw.weaponType || (skill === "lwp" ? "light_wpn" : "heavy_wpn");

  // Bespoke abilities may carry native event rules — the SAME edha-* event/handler vocabulary
  // as PC talents, so adversary text converts to hooks instead of rotting as prose (The Seeming
  // lesson, 07-16). Authored as a SIMPLIFIED array (`"events": [{event, handler, description?}]`);
  // the build emits the DataModel map shape with deterministic 16-char ids (hand-authored ids
  // were the Cruel Step silent-drop failure mode — see lint-refs pass 1).
  const events = {};
  (raw.events || []).forEach((e, i) => {
    const id = fid(`adv:${advName}:rule:${raw.name}:${i}`);
    events[id] = { id, description: e.description || "", event: e.event, handler: e.handler };
  });

  const system = kind === "trait"
    ? { description: { value: descValue, chat: "", short: "" }, activation, events }
    : kind === "weapon"
    ? { id: raw.weaponId || slugify(raw.name), type: weaponType,
        description: { value: descValue, chat: "", short: "" }, activation,
        damage: { ...damage, skill },
        equipped: true, alwaysEquipped: false,
        attack: { type: ranged ? "ranged" : "melee", range: ranged && weaponRangeVal ? { value: weaponRangeVal, long: null, unit: "ft" } : { value: null, long: null, unit: "ft" } },
        traits: {}, expertise: false, events }
    : { id: slugify(raw.name), type: "basic", description: { value: descValue, chat: "", short: "" }, activation, damage, modality: null, ancestry: null, events };

  const itemId = fid(`adv:${advName}:item:${raw.name}`);
  // Baked ActiveEffects from adversary-effects.json (advName → itemName → [effects]). Same conventions
  // as PC talents: transfer:true toggled-off = conditional mode; transfer:false = apply-to-target
  // template (drag onto the victim's sheet); statuses give the token icon.
  const effects = ((ADV_EFFECTS[advName] || {})[raw.name] || []).map((e, i) => ({
    _id: fid(`advae:${advName}:${raw.name}:${i}`),
    name: e.name || e.label || raw.name,
    img: e.img || e.icon || "icons/svg/aura.svg",
    type: "base", system: {},
    changes: (e.changes || []).map(c => ({ key: c.key, mode: c.mode ?? 2, value: String(c.value ?? "") })),
    disabled: !!e.disabled,
    transfer: e.transfer !== false,
    description: e.description || "",
    origin: null, tint: "#ffffff",
    statuses: Array.isArray(e.statuses) ? e.statuses : [],
    duration: e.duration && e.duration.value != null ? { value: e.duration.value, units: e.duration.units || "rounds" } : {},
    sort: 0, flags: { "edha-content": { adversaryEffect: true } }, _stats: stats(),
  }));

  // Bespoke abilities (trait/action kinds) are the adversary's OWN talents — flag them
  // `adversaryTalent` like the tree-talent twins, so the engine's flag-aware `edhaIsTalent`
  // gates admit them to name-keyed useItem automation (The Seeming, 07-16: the 07-14o engine
  // case was unreachable because the bespoke item carried no flag and the hook gate was
  // type-strict). Weapons stay unflagged — attacks are equipment, not talents.
  const abilityFlags = kind === "weapon"
    ? { adversary: advName }
    : { adversary: advName, adversaryTalent: true };
  return {
    __parent: fid(`adv:${advName}`),
    _id: itemId,
    name: raw.name, type: kind, img,
    system, effects, folder: null, sort, ownership: { default: 0 },
    flags: { "edha-content": abilityFlags }, _stats: stats(),
  };
}

function advSkills(adv) {
  const skills = {};
  for (const c of adv.leylines || []) skills[String(c).toLowerCase()] = { rank: ROLE_LEYLINE_RANK[adv.role || "rival"] || 1 };
  for (const [id, rank] of Object.entries(adv.skills || {})) skills[id] = { rank: Number(rank) || 0 };
  return skills;
}

function advActorSystem(adv) {
  const ov = n => ({ override: n, useOverride: true });
  const sys = {
    size: adv.size || "medium",
    type: adv.creatureType === "custom" ? { id: "custom", custom: adv.customType || "", subtype: "" } : { id: adv.creatureType || "humanoid" },
    tier: adv.tier ?? 1,
    role: adv.role || "rival",
    defenses: { phy: ov(adv.defenses.phy), cog: ov(adv.defenses.cog), spi: ov(adv.defenses.spi) },
    resources: {
      hea: { value: adv.hp, max: ov(adv.hp) },
      foc: { value: adv.foc || 0, max: ov(adv.foc || 0) },
      // Attuned adversaries default to the PC derivation, 2 + max(awa, pre), with attributes 0 → 2
      // (ruling 49: same economy as the players — Draw Mana needs a pool to recover into).
      // An explicit `inv` in the block always wins.
      inv: (() => { const n = adv.inv ?? ((adv.leylines || []).length ? 2 : 0); return { value: n, max: ov(n) }; })(),
    },
    biography: adv.biography || "",
  };
  if (adv.deflect != null) {
    const t = adv.deflectTypes || ["energy", "impact", "keen"];
    sys.deflect = { override: adv.deflect, useOverride: true, source: "armor",
      types: { energy: t.includes("energy"), impact: t.includes("impact"), keen: t.includes("keen"), spirit: t.includes("spirit"), vital: t.includes("vital"), heal: false } };
  }
  if (adv.movement != null) sys.movement = { walk: { rate: ov(adv.movement) } };
  // Senses Range override (07-16c): the block's `senses` (ft) lands on the sheet too — the engine's
  // edhaSensesRangeFt reads system.senses.range first, AWA table second. ⚑ senses DataModel shape
  // is unverified from the repo (schema dump pending); a dropped field degrades to the AWA default.
  if (adv.senses != null) sys.senses = { range: ov(adv.senses) };
  if (adv.conditionImmunities?.length) sys.immunities = { condition: Object.fromEntries(adv.conditionImmunities.map(c => [c, true])) };
  const skills = advSkills(adv);
  if (Object.keys(skills).length) sys.skills = skills;   // leyline colors are core skills (register-skills.js) — same shape as the 18 standard ones
  return sys;
}

// Art auto-detect (W23, Ben requirement #1): if Ben has dropped final art into the live module dir,
// use it; otherwise fall back to the JSON's placeholder icon. Filenames are contractual — they're
// listed per creature in EDHA_ADVERSARY_ART_WISHLIST.md. Drop files + rebuild; no data edit needed.
function advArt(advName) {
  const slug = slugify(advName);
  const found = suffix => {
    for (const ext of ["jpg", "jpeg", "webp", "png"]) {
      const rel = `${ADV_ART_DIR}/${slug}-${suffix}.${ext}`;
      try { if (fs.existsSync(`${MODROOT}/${rel}`)) return `modules/${MODID}/${rel}`; } catch (e) {}
    }
    return null;
  };
  return { portrait: found("portrait"), token: found("token") };
}

// The universal Draw Mana action doc (shared by the leyline pack + adversary embeds — ruling 49).
function drawManaItemDoc({ _id, folder = null, sort = 0, flags = {} } = {}) {
  return {
    folder, name: "Draw Mana", type: "action", _id,
    img: "icons/magic/light/explosion-star-glow-blue.webp",
    system: {
      id: "draw-mana", type: "basic",
      description: { value: `<p><strong>Activation:</strong> <span class="cosmere-icon" data-tooltip="One Action">1</span></p><p>Recover Investiture equal to your Tier, and trigger your leyline color's Attunement rider (the effect of each Leyline Key you hold).</p>`, chat: "", short: "" },
      activation: { type: "utility", cost: { value: 1, type: "act" }, consume: [], flavor: "", plotDie: false, uses: null, opportunity: null, complication: null },
      damage: { formula: null, type: null }, modality: null, ancestry: null, events: {},
    },
    effects: [], sort, ownership: { default: 0 },
    flags, _stats: stats(),
  };
}

function advPrototypeToken(adv, token) {
  const dim = adv.size === "large" ? 2 : 1;
  // Token sight = the SAME shape the system gives PC tokens (Ben's 07-17 ruling: "They need the
  // same vision rules as players (unless the adversary has a bespoke rule)"). The 07-16c build set
  // only {enabled, range} and left visionMode at Foundry's "basic" — stricter than PCs, whose
  // prototype tokens carry the cosmere "sense" visionMode (verified against Ben's world: enabled,
  // range = Senses Range, visionMode "sense", attenuation 0.1) — hence "can't see anything beyond
  // 10 ft unless lit". Range stays Senses Range (adversary AWA 0 → 10 ft; a block's explicit
  // `senses` (ft) is the bespoke override and wins).
  return {
    name: adv.name, displayName: 20, actorLink: false,
    appendNumber: adv.role === "minion" || (adv.count || 1) > 1,
    width: dim, height: dim,
    texture: { src: token, anchorX: 0.5, anchorY: 0.5, fit: "contain", scaleX: 1, scaleY: 1, tint: "#ffffff" },
    disposition: -1, displayBars: 50,   // ALWAYS show health bars (visible feedback that damage landed / lethal)
    bar1: { attribute: "resources.hea" }, bar2: { attribute: null },
    sight: { enabled: true, range: Number(adv.senses) > 0 ? Number(adv.senses) : 10, visionMode: "sense", attenuation: 0.1 }, flags: {},
  };
}

function buildAdversaries(resolveTalent) {
  const advData = JSON.parse(fs.readFileSync(`${DATA}/adversaries.json`, "utf-8"));
  // Folder layout (W23, Ben requirement #2): entries with a `folder` field are grouped in their own
  // Actor subfolder under the "Edha Adversaries" root; entries without one keep the legacy
  // "Playtest Adversaries" top-level folder (the original 9, untouched).
  const playtestFolderId = fid("advfolder:playtest");
  const rootFolderId = fid("advfolder:root");
  const folders = [folderDoc(playtestFolderId, "Playtest Adversaries", null, "Actor")];
  const groupFolder = {};    // folder name -> folder id
  const actors = [], items = [];
  let sortA = 0, talentEmbeds = 0;
  for (const [name, adv] of Object.entries(advData)) {
    if (name.startsWith("_")) continue;
    adv.name = name;
    const actorId = fid(`adv:${name}`);
    let folderId = playtestFolderId;
    if (adv.folder) {
      if (!folders.some(f => f._id === rootFolderId)) folders.push(folderDoc(rootFolderId, "Edha Adversaries", null, "Actor"));
      if (!groupFolder[adv.folder]) {
        groupFolder[adv.folder] = fid(`advfolder:${adv.folder}`);
        folders.push(folderDoc(groupFolder[adv.folder], adv.folder, rootFolderId, "Actor"));
      }
      folderId = groupFolder[adv.folder];
    }
    const art = advArt(name);
    const img = art.portrait || adv.img;
    const tokenImg = art.token || art.portrait || adv.token || adv.img;
    let sortI = 0;
    const myItems = (adv.items || []).map(raw => advItemDoc(name, raw, (sortI += 100000)));
    // Tree-talent embeds (ruling 40): ACTION-TYPED TWINS of the built talent docs. The adversary
    // sheet renders exactly three item sections — trait / weapon / action (AdversaryActionsListComponent
    // filters `item.type === type`) — so a genuine `talent`-type embed is invisible on the sheet
    // (⚑⚑ pipe-cleaner, failed 2026-07-14 bench). The twin keeps name/img/description/activation/
    // damage/events (the action DataModel carries the same Activatable/Damaging/Modality/Events
    // mixins), so name-based `useItem` automation is unchanged; ownership gates go through the
    // flag-aware `edhaIsTalent` in the engine (`adversaryTalent: true`).
    // No prereq filtering: embedding bypasses the tree UI by design (Ben 2026-07-14).
    // Ruling 49 (Ben 2026-07-14): every attuned adversary runs the SAME leyline economy as a PC —
    // each `leylines` color auto-embeds its Key ("<Color> Leyline Attunement") and the actor gets
    // the universal Draw Mana action (the engine's rider iterates owned Keys, disposition-based).
    const talentRefs = [...(adv.talents || [])];
    for (const color of adv.leylines || []) {
      const key = `${color.charAt(0).toUpperCase()}${color.slice(1)} Leyline Attunement`;
      if (!talentRefs.some(r => r === key || r.endsWith(`/${key}`))) talentRefs.push(key);
    }
    if ((adv.leylines || []).length) {
      const dm = drawManaItemDoc({ _id: fid(`adv:${name}:drawmana`), sort: (sortI += 100000), flags: { "edha-content": { adversary: name, drawMana: true } } });
      dm.__parent = actorId;
      myItems.push(dm);
    }
    for (const ref of talentRefs) {
      const src = resolveTalent(ref, name);
      const s = JSON.parse(JSON.stringify(src.system));       // deep copy — never mutate the pack doc
      const doc = {
        __parent: actorId,
        _id: fid(`adv:${name}:talent:${src.name}`),
        name: src.name, type: "action", img: src.img,
        // Action schema: Id + Typed("basic") + Description + Activatable + Damaging + Modality + Events.
        // Talent-only fields (path/prerequisites/specialty/ancestry) are dropped — the DataModel would
        // strip them anyway, and prereqs are bypassed by design.
        system: { id: s.id, type: "basic", description: s.description, activation: s.activation, damage: s.damage, modality: s.modality ?? null, events: s.events || {} },
        effects: JSON.parse(JSON.stringify(src.effects || [])),
        folder: null, sort: (sortI += 100000), ownership: { default: 0 },
        flags: { ...(src.flags ? JSON.parse(JSON.stringify(src.flags)) : {}), "edha-content": { ...((src.flags || {})["edha-content"] || {}), adversary: name, adversaryTalent: true, talent: src.name } },
        _stats: stats(),
      };
      myItems.push(doc);
      talentEmbeds++;
    }
    items.push(...myItems);
    actors.push({
      _id: actorId,
      folder: folderId, name, type: "adversary", img,
      system: advActorSystem(adv),
      prototypeToken: advPrototypeToken(adv, tokenImg),
      items: myItems.map(it => it._id),
      effects: [], ownership: { default: 0 }, sort: (sortA += 100000),
      flags: { "edha-content": { playtest: !adv.folder, count: adv.count || 1 } },
      _stats: stats(),
    });
  }
  return { actors, items, folders, talentEmbeds };
}

async function writeActorPack(dir, actors, items, folders) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const db = new ClassicLevel(dir, { keyEncoding: "utf8", valueEncoding: "json" });
  await db.open();
  const batch = db.batch();
  for (const f of folders) batch.put(`!folders!${f._id}`, f);
  for (const a of actors) batch.put(`!actors!${a._id}`, a);
  for (const it of items) {
    const { __parent, ...doc } = it;
    // Item-embedded ActiveEffects live as SEPARATE `!actors.items.effects!<actorId>.<itemId>.<effectId>`
    // keys, with the item's `effects` field holding only the ID strings (same split as talent packs;
    // verified against the system's companions-and-adversaries pack). Inline objects are dropped on load.
    const effs = Array.isArray(doc.effects) ? doc.effects.filter(e => e && typeof e === "object") : [];
    if (effs.length) {
      for (const e of effs) batch.put(`!actors.items.effects!${__parent}.${it._id}.${e._id}`, e);
      batch.put(`!actors.items!${__parent}.${it._id}`, { ...doc, effects: effs.map(e => e._id) });
    } else {
      batch.put(`!actors.items!${__parent}.${it._id}`, doc);
    }
  }
  await batch.write();
  await db.close();
}
