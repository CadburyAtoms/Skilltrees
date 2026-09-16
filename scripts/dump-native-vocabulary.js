#!/usr/bin/env node
/* scripts/dump-native-vocabulary.js — snapshot the cosmere-rpg SYSTEM's own event vocabulary.
 *
 * WHY THIS EXISTS (2026-07-24). The iron-rule-2b classification enumerated the handler vocabulary
 * by grepping `source: "edha-content"` in register-skills.js and reported "31 handler types / 10
 * events" as if that were everything an authored rule could use. It is not: the cosmere-rpg system
 * registers its OWN event system underneath, and edha-* types are additions to it. The real
 * vocabulary is 43 handlers / 27 events. A whole proposed handler was nearly built for behaviour
 * the system already shipped.
 *
 * The module's vocabulary is a SUBSET of what authored rules can use. Any "can a rule do X?"
 * question must be answered against BOTH halves.
 *
 * Ben's Foundry install is the only source of truth for the system half, and no session can launch
 * Foundry — but the install IS readable. This script snapshots it into a committed JSON file so a
 * fresh clone, CI, and every future session can see the native vocabulary without the install.
 *
 * USAGE
 *   node scripts/dump-native-vocabulary.js            # refresh data/native-vocabulary.json
 *   node scripts/dump-native-vocabulary.js --check    # non-zero if the snapshot is stale
 *   EDHA_FOUNDRY_DATA=<path> node scripts/dump-native-vocabulary.js
 *
 * NOT part of `npm run gates`: it needs Ben's Foundry install, which CI does not have. Re-run it
 * when the system version changes; the snapshot records which version it came from.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { matchBrace, topLevelKeys } = require("./handler-schemas.js");
const buildDoc = require("./lib/build-doc.js");

const REPO_ROOT = path.resolve(__dirname, "..");
const OUT = path.join(REPO_ROOT, "data", "native-vocabulary.json");
const FOUNDRY_DATA = process.env.EDHA_FOUNDRY_DATA
  || path.join(process.env.LOCALAPPDATA || path.join(process.env.HOME || "", "AppData", "Local"), "FoundryVTT", "Data");
const SYSTEM_DIR = path.join(FOUNDRY_DATA, "systems", "cosmere-rpg");

const checkMode = process.argv.includes("--check");

function fail(msg) {
  console.error(`✗ ${msg}`);
  console.error(`  Looked in: ${SYSTEM_DIR}`);
  console.error(`  Set EDHA_FOUNDRY_DATA to your Foundry Data directory if it lives elsewhere.`);
  process.exit(2);
}

/* ---- DOCUMENT SCHEMA top-level field names (added 2026-07-27h) ---------------------------------
 *
 * WHY. Three times now the engine has read or written a `system.<field>` that no cosmere DataModel
 * defines — `edhaAttackKind`'s `system.range` (07-26l), `edhaIsConstruct`'s `system.customType`
 * (07-26m), and the whole counter economy's `system.count` (07-27g). Foundry's SchemaField DELETES
 * unrecognised keys, so the write resolves without error, stores nothing, and every read is
 * `undefined` → 0/false/"". Nothing errors, no test catches it (a unit test that stubs the document
 * proves only that the engine agrees with itself), and the mechanic is simply inert. The `count`
 * instance survived a ⚑ "bench-verify this field name" comment for the whole life of the mechanic.
 *
 * This snapshot is the truth a headless session and CI can check against: the union of every
 * TOP-LEVEL field name declared by any schema literal in the system bundle (Actor, Item ×15,
 * ActiveEffect, Combatant, TalentTree nodes, the field mixins — all of them).
 *
 * WHY THE UNION AND NOT PER-TYPE. Resolving which DataModel a given engine expression is holding is
 * static type inference the linter cannot do in general (`x.system.foo` where x may be an actor, an
 * item or an effect). The union answers the weaker but decidable question — "is this field name
 * known to the system AT ALL?" — which is exactly the question all three bugs failed. It
 * over-approximates on purpose: a field real on a WEAPON but read off an ACTOR still passes. A pass
 * here means "not obviously dead", never "correct for this document".
 *
 * `systemSchemaFieldsByType` below (added 2026-09-15, TODO_REPO_HYGIENE item 182) is the sharpened
 * SIBLING this note used to say was out of reach: it groups the same fields by item TYPE wherever
 * that association CAN be recovered from the bundle text (a document-creation literal's own
 * `type:`, or a call site's identifier name — lint-refs.js pass 11 does the matching). It does not
 * replace this union — the union is still what every call site falls back to when its type cannot
 * be determined, which is most of them.
 *
 * TOP-LEVEL ONLY, deliberately: `range` is a real field NESTED under a weapon's `attack`, and the
 * 07-26l bug was reading it at the TOP level. Flattening all depths into one set would have waved
 * that bug through. */

function systemSchemaTopLevelFields(bundle) {
  const fields = new Set();
  const harvest = (openIdx) => {
    try { for (const k of topLevelKeys(bundle.slice(openIdx + 1, matchBrace(bundle, openIdx)))) fields.add(k); }
    catch (e) { /* an unparsable literal is skipped; the count assertion below is the rot alarm */ }
  };
  let sites = 0;
  // `const SCHEMA$x = (…) => ({ … })` and `const SCHEMA$x = { … }`
  for (const m of bundle.matchAll(/\bconst\s+SCHEMA[$\w]*\s*=\s*(?:\([^)]*\)\s*=>\s*\(\s*)?\{/g)) {
    harvest(m.index + m[0].length - 1); sites++;
  }
  // `function SCHEMA$x(…) { … return { … } … }` — every returned literal in the body
  for (const m of bundle.matchAll(/\bfunction\s+SCHEMA[$\w]*\s*\([^)]*\)\s*\{/g)) {
    const bodyOpen = m.index + m[0].length - 1;
    let bodyClose; try { bodyClose = matchBrace(bundle, bodyOpen); } catch (e) { continue; }
    const body = bundle.slice(bodyOpen, bodyClose + 1);
    for (const r of body.matchAll(/return\s*\{/g)) harvest(bodyOpen + r.index + r[0].length - 1);
    sites++;
  }
  // `defineSchema() { … }` — the classes that declare fields inline instead of via a SCHEMA const
  // (ActivationField's `activation`, the Activation subclass overrides).
  for (const m of bundle.matchAll(/defineSchema\s*\(\s*\)\s*\{/g)) {
    const bodyOpen = m.index + m[0].length - 1;
    let bodyClose; try { bodyClose = matchBrace(bundle, bodyOpen); } catch (e) { continue; }
    const body = bundle.slice(bodyOpen, bodyClose + 1);
    for (const r of body.matchAll(/(?:return|mergeObject\([^,]*,)\s*\{/g)) harvest(bodyOpen + r.index + r[0].length - 1);
    sites++;
  }
  // Rot alarm: the bundle has had 30+ schema literals since 2.0. A restructure that drops us to a
  // handful must fail LOUDLY here rather than silently shrink the allowed set (which would turn the
  // lint pass into a false-positive machine and get it disabled — the worst outcome).
  if (sites < 25 || fields.size < 50) {
    fail(`document-schema extraction found only ${sites} schema sites / ${fields.size} fields — the bundle restructured; re-derive the extraction before trusting this file`);
  }
  for (const probe of ["stacks", "isStackable", "resources", "attack", "damage", "events"]) {
    if (!fields.has(probe)) fail(`document-schema extraction is missing the known field "${probe}" — the extractor is wrong, not the system`);
  }
  for (const probe of ["count", "customType"]) {
    if (fields.has(probe)) fail(`document-schema extraction yielded "${probe}", which no cosmere DataModel defines — the extractor is over-harvesting (it must take TOP-LEVEL keys only)`);
  }
  return [...fields].sort();
}

/* ---- DERIVED-VALUE leaves (added 2026-07-27y) --------------------------------------------------
 *
 * WHY. Pass 11's family is "the field does not exist". This is its twin: "the field exists but is
 * an OBJECT, and the engine read it as a number". cosmere-rpg wraps a dozen derived stats in
 * `DerivedValueField` — a SchemaField carrying {derived, override, useOverride[, bonus]} plus a
 * getter-only `.value`. `Number(thatObject)` is NaN, so the near-universal `Number(x) || 0` idiom
 * silently yields **0**: no error, no warning, the mechanic just reads as dead.
 *
 * Bench run 16 (07-27x) found two engine sites; an independent sweep found a third the run's own
 * sweep had declared absent. Every belief test in the game rolled `1d20 + 0` instead of the
 * target's Perception, and every `edha-move {byHalfSpeed}` moved 0 ft.
 *
 * LEAF NAMES, not paths, deliberately — for the same decidability reason as the union above. The
 * paths are built at runtime by reducing over CONFIG key maps (`skills.<id>.mod`,
 * `movement.<type>.rate`, `defenses.<id>`), so they cannot be enumerated statically; the leaf NAME
 * is what a `Number(...)` expression actually terminates at, and that is the whole check.
 *
 * KNOWN GAP, stated so a green pass is not over-read: `constructDefenseSchema` builds the three
 * `system.defenses.<phy|cog|spi>` fields anonymously, so the defense ids are not harvested here.
 * Every engine defense read already terminates at `.value`/`.override`; if that changes, this is
 * the blind spot. */
function systemDerivedValueLeaves(bundle) {
  const leaves = new Set();
  for (const m of bundle.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*new DerivedValueField\(/g)) leaves.add(m[1]);
  // Rot alarm, same discipline as the schema harvest: 2.1.0 declares 12. A restructure that drops
  // us to a handful must fail LOUDLY rather than silently shrink the checked set.
  if (leaves.size < 8) {
    fail(`derived-value extraction found only ${leaves.size} leaves — the bundle restructured (did DerivedValueField get renamed?); re-derive the extraction before trusting this file`);
  }
  for (const probe of ["mod", "rate", "max", "deflect"]) {
    if (!leaves.has(probe)) fail(`derived-value extraction is missing the known leaf "${probe}" — the extractor is wrong, not the system`);
  }
  const anon = [...bundle.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*\([^)]*\)\s*=>\s*new DerivedValueField\(/g)].map((m) => m[1]);
  if (anon.length) console.warn(`  note: ${anon.length} DerivedValueField constructor(s) build fields anonymously (${anon.join(", ")}) — their leaf names are CONFIG ids and are not harvested; see the block comment.`);
  return [...leaves].sort();
}

/* ---- CONTENT VOCABULARY ids (added 2026-07-27j) ------------------------------------------------
 *
 * WHY. Bench run 9 found eight talents wired to cosmere SKILL ids that do not exist — `itm` for
 * Intimidation (`inm`), `per` for Perception/Persuasion (`prc`/`prs`), `ldr` for Leadership
 * (`lea`). Same disease as the dead `system.*` fields pass 11 gates, one layer over: an authored
 * `skill`/`whenSkill` that no vocabulary defines never matches anything, and an `@skills.itm.rank`
 * substitutes to 0. Both are SILENT — Sharp Eye was a total no-op, Synchronized Assault charged
 * 2 focus and did nothing, Feinting Strike drained "0" focus at Intimidation 3.
 *
 * The ids are TS `const enum` members, so they are inlined in the bundle in two shapes: a runtime
 * IIFE (`Skill["Intimidation"] = "inm"`) for the enums the system reflects over, and a comment
 * annotation (`"spd" /* Attribute.Speed *\/`) for the ones fully erased. Both are harvested.
 *
 * NOT the whole authoring vocabulary: EDHA registers five leyline SKILLS and ~30 STATUSES of its
 * own. Those are parsed live out of the engine by lint-refs pass 12, so adding one never means
 * editing a snapshot or a linter. */
function contentVocabulary(bundle) {
  const iife = (name) => {
    const out = {};
    for (const m of bundle.matchAll(new RegExp(`${name}\\["(\\w+)"\\]\\s*=\\s*"([\\w:.\\-]+)"`, "g"))) out[m[1]] = m[2];
    return out;
  };
  // TS `const enum` members survive only as `"value" /* Enum.Member */` annotations.
  const inlined = (name) => {
    const out = {};
    for (const m of bundle.matchAll(new RegExp(`"([\\w:.\\-]+)"\\s*/\\* ${name}\\.(\\w+) \\*/`, "g"))) out[m[2]] = m[1];
    return out;
  };
  const ids = (o) => [...new Set(Object.values(o))].sort();

  const vocab = {
    skills: ids(iife("Skill")),
    attributes: ids(inlined("Attribute")),
    attributeGroups: ids(inlined("AttributeGroup")),   // also the DEFENSE ids (phy/cog/spi)
    damageTypes: ids(iife("DamageType")),
    statuses: ids(inlined("Status")),
    resources: ids(inlined("Resource")),
  };

  // Rot alarms — a bundle restructure must fail LOUDLY rather than silently shrink an allowed set,
  // which would turn pass 12 into a false-positive machine and get it disabled (the worst outcome).
  const MIN = { skills: 18, attributes: 6, attributeGroups: 3, damageTypes: 5, statuses: 15, resources: 3 };
  for (const [k, min] of Object.entries(MIN)) {
    if (vocab[k].length < min) fail(`content vocabulary "${k}" yielded only ${vocab[k].length} ids (expected ≥ ${min}) — the bundle restructured; re-derive the extraction before trusting this file`);
  }
  // Known members, so a regex that matches the WRONG thing is caught rather than counted.
  const PROBES = { skills: ["inm", "prc", "prs", "lea"], attributes: ["spd", "str"], damageTypes: ["keen", "heal"], statuses: ["stunned", "prone"] };
  for (const [k, probes] of Object.entries(PROBES)) {
    for (const p of probes) if (!vocab[k].includes(p)) fail(`content vocabulary "${k}" is missing the known id "${p}" — the extractor is wrong, not the system`);
  }
  // The dead ids that started this. If any appears, the extraction is harvesting prose, not enums.
  for (const [k, dead] of Object.entries({ skills: ["itm", "per", "ldr"], attributes: ["speed"] })) {
    for (const d of dead) if (vocab[k].includes(d)) fail(`content vocabulary "${k}" yielded "${d}", which the cosmere system does not define — the extractor is over-harvesting`);
  }
  return vocab;
}

/* ---- PER-ITEM-TYPE top-level field sets (added 2026-09-15, TODO_REPO_HYGIENE item 182) --------
 *
 * WHY. `systemSchemaTopLevelFields` above is a UNION on purpose (see its own comment) — but that
 * over-approximation has a real cost, measured by the cosmere-rpg 3.1.0 compatibility check (item
 * 177, docs/analysis/cosmere-rpg-3.1.0-compatibility.md, break F8): at 3.1.0 the union still
 * contains `activation` and `damage` because `action` items declare them, even though the TALENT
 * DataModel no longer does (blocker B1) — so lint-refs.js pass 11 could not see a talent losing
 * them. This function is item 182's answer: the SAME field harvest, grouped by the item TYPE each
 * schema literal actually belongs to, wherever that association can be recovered from the bundle
 * text at all.
 *
 * METHOD, and its HONEST LIMIT. Names are NOT mangled in this bundle (see the top-of-file note —
 * `SCHEMA$x` consts survive, which is how the union harvest above already works), so a document
 * TYPE's DataModel class is expected to keep a name of the shape `<Name>ItemDataModel`
 * (`TalentItemDataModel`, `WeaponItemDataModel`, … — `TalentItemDataModel` and its mixins
 * (`ActivatableItemMixin`, `DamagingItemMixin`, `ResourcesItemMixin`, `LinkedSkillsMixin`) are the
 * only class/mixin names this repo has confirmed against the system's own TS source, in blocker B1
 * of the compatibility doc above). For each such class, this harvests its OWN `defineSchema()`
 * fields and unions in every mixin/base identifier named in its `extends` clause, resolved the
 * same way, up to a shallow depth (cycle- and depth-guarded) — because that is exactly how
 * activation/damage arrive on a talent TODAY (via mixins) and leave at 3.1.0 (the same mechanism,
 * different mixin list).
 *
 * THIS IS UNVERIFIED AGAINST A REAL BUNDLE and cannot be verified until item 187, when a 3.1.0
 * install first exists to run it against — unlike every other harvest in this file, which is
 * checked against Ben's actual install every time anyone runs `node scripts/dump-native-
 * vocabulary.js` and can therefore fail LOUDLY. This one WARNS on a shortfall instead: an empty or
 * tiny result must never block the union write real workflows depend on today, and a hard exit
 * here on an untested code path would be worse than the gap it is meant to close. Treat its output
 * as a lead to spot-check by hand at the 3.1.0 flip, not as ground truth. The parsing logic itself
 * (class/mixin resolution, not the association with real cosmere-rpg names) is pinned against
 * synthetic bundle text in tests/native-vocabulary-by-type.test.js, since there is no live 3.1.0
 * bundle to pin it against yet; the fixture lint-refs.js pass 11 is actually exercised against —
 * tests/fixtures/native-vocabulary-3.1.0.json — is hand-built from the compatibility doc, not
 * produced by this function, for the same reason. */
function systemSchemaFieldsByType(bundle) {
  // Every `defineSchema(){…}` found ANYWHERE in a class/mixin body text, own or nested (a mixin
  // function's body textually CONTAINS the class it returns) — harvested with the same two return
  // shapes the union harvest above recognises (`return {…}` and `mergeObject(x, {…})`).
  const ownFields = (body) => {
    const fields = new Set();
    for (const dm of body.matchAll(/defineSchema\s*\(\s*\)\s*\{/g)) {
      const bodyOpen = dm.index + dm[0].length - 1;
      let bodyClose; try { bodyClose = matchBrace(body, bodyOpen); } catch (e) { continue; }
      const inner = body.slice(bodyOpen, bodyClose + 1);
      for (const r of inner.matchAll(/(?:return|mergeObject\([^,]*,)\s*\{/g)) {
        const o = bodyOpen + r.index + r[0].length - 1;
        try { for (const k of topLevelKeys(body.slice(o + 1, matchBrace(body, o)))) fields.add(k); }
        catch (e) { /* an unparsable literal is skipped — best-effort, see the block comment */ }
      }
    }
    return fields;
  };

  // class Name [extends Expr] { … } — Expr may be a plain identifier or a mixin call chain
  // (`A(B(Base))`); every identifier token inside it is a candidate to resolve further.
  const classes = new Map();   // name -> { body, extendsIds: string[] }
  for (const m of bundle.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)\s*(?:extends\s+([^{]+?))?\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    let close; try { close = matchBrace(bundle, open); } catch (e) { continue; }
    const extendsIds = m[2] ? [...m[2].matchAll(/[A-Za-z_$][\w$]*/g)].map((x) => x[0]) : [];
    classes.set(m[1], { body: bundle.slice(open, close + 1), extendsIds });
  }
  // function Name(Base) { … } — the HOC-shaped HOC mixins (`function XMixin(Base) { return class
  // extends Base { … }; }`). Resolving the identifier by NAME (not by call site) is deliberately
  // permissive — see the block comment: this whole function over-approximates on purpose and warns
  // rather than fails.
  const fns = new Map();   // name -> body
  for (const m of bundle.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    let close; try { close = matchBrace(bundle, open); } catch (e) { continue; }
    fns.set(m[1], bundle.slice(open, close + 1));
  }

  const MAX_DEPTH = 6;
  function resolve(name, depth, visited) {
    if (visited.has(name) || depth > MAX_DEPTH) return new Set();
    visited.add(name);
    const fields = new Set();
    const cls = classes.get(name);
    if (cls) {
      for (const f of ownFields(cls.body)) fields.add(f);
      for (const id of cls.extendsIds) for (const f of resolve(id, depth + 1, visited)) fields.add(f);
      return fields;
    }
    const fnBody = fns.get(name);
    if (fnBody) {
      for (const f of ownFields(fnBody)) fields.add(f);
      // A HOC mixin's returned class may itself extend something (rare, but cheap to follow).
      const em = fnBody.match(/\bclass\s+extends\s+([A-Za-z_$][\w$]*)/);
      if (em) for (const f of resolve(em[1], depth + 1, visited)) fields.add(f);
      return fields;
    }
    return fields;   // unresolvable identifier (a core/foundry.mjs base this repo cannot read) — fine
  }

  const byType = {};
  for (const name of classes.keys()) {
    const tm = name.match(/^([A-Za-z]+)ItemDataModel$/);
    if (!tm) continue;
    const fields = resolve(name, 0, new Set());
    if (fields.size) byType[tm[1].toLowerCase()] = [...fields].sort();
  }

  const found = Object.keys(byType).length;
  if (found < 3) {
    console.warn(`  note: per-item-type field harvest found only ${found} type(s) (${Object.keys(byType).join(", ") || "none"}) ` +
      `— expected several (blocker B1 alone names talent/action; "Item ×15" per the compatibility ` +
      `doc). This is a best-effort, UNVERIFIED extraction (see the block comment above ` +
      `systemSchemaFieldsByType) — it warns rather than failing the whole snapshot, but a shortfall ` +
      `this large likely means the naming convention (<Name>ItemDataModel) or the mixin shape ` +
      `changed; spot-check by hand before trusting lint-refs.js pass 11's per-type check.`);
  }
  return byType;
}

/* Everything below reads Ben's Foundry install and writes data/native-vocabulary.json — guarded
 * behind `require.main === module` (TODO_REPO_HYGIENE item 182) so `require("./dump-native-
 * vocabulary.js")` from a test can reach `systemSchemaFieldsByType` (the one export below) without
 * immediately hitting the fail()/process.exit(2) path in a sandbox that has no Foundry install.
 * `node scripts/dump-native-vocabulary.js` still runs this exactly as before: require.main IS
 * module for a directly-executed script, so main() runs unconditionally on that path. */
function main() {

if (!fs.existsSync(SYSTEM_DIR)) fail("cosmere-rpg system not found — this script needs Ben's Foundry install.");

let systemJson, lang;
try { systemJson = JSON.parse(fs.readFileSync(path.join(SYSTEM_DIR, "system.json"), "utf8")); }
catch (e) { fail(`cannot read system.json — ${e.message}`); }
try { lang = JSON.parse(fs.readFileSync(path.join(SYSTEM_DIR, "lang", "en.json"), "utf8")); }
catch (e) { fail(`cannot read lang/en.json — ${e.message}`); }

// The bundle is minified, so i18n keys are the reliable index of what's registered: the system
// registers each type with label `COSMERE.Item.EventSystem.Event.{Types|Handler.Types}.<type>.…`,
// so every registered type necessarily has an entry here.
const ES = lang?.COSMERE?.Item?.EventSystem?.Event;
if (!ES?.Types || !ES?.Handler?.Types) {
  fail("lang/en.json has no COSMERE.Item.EventSystem.Event.{Types,Handler.Types} — did the system restructure its i18n? Re-derive the extraction before trusting this file.");
}

const labelOf = (v) => (typeof v === "string" ? v : (v?.Label ?? v?.label ?? ""));

const events = Object.entries(ES.Types)
  .map(([type, v]) => ({ type, label: labelOf(v) }))
  .sort((a, b) => a.type.localeCompare(b.type));

// ⚠ The i18n keys under each handler type are LABEL keys (PascalCase: Target, Changes, UUID),
// NOT the DataModel schema field names (camelCase: target, changes, uuid). Confusing the two
// nearly shipped a false lint on a correct rule and left lint pass 8 reading fields that don't
// exist (2026-07-26). Label keys are kept for the editor-chrome record; the AUTHORING surface is
// `schemaFields`, extracted from the system bundle's actual registerItemEventHandlerType calls.
const CHROME = new Set(["Title", "Description"]);
const handlers = Object.entries(ES.Handler.Types)
  .map(([type, v]) => ({
    type,
    label: labelOf(v?.Title) || type,
    labelKeys: Object.keys(v || {}).filter((k) => !CHROME.has(k)).sort(),
    schemaFields: [],
  }))
  .sort((a, b) => a.type.localeCompare(b.type));

// Extract each handler's real config-schema field names from the system bundle. The bundle is
// transpiled but not name-mangled: every registration is `registerItemEventHandlerType({ source:
// SYSTEM_ID, type: "<type>", … config: { schema: <inline object | const ref> … })`. A referenced
// const (update-item's SCHEMA$s) is resolved to its `const <id> = {` definition. Hard-fails if any
// lang-listed handler yields no schema — a bundle restructure must rot LOUDLY, not under-report.
let bundle;   // module-scope: the document-schema extraction below reads it too
{
  const bundlePath = path.join(SYSTEM_DIR, "index.js");
  try { bundle = fs.readFileSync(bundlePath, "utf8"); }
  catch (e) { fail(`cannot read the system bundle (${bundlePath}) — ${e.message}`); }
  const CALL = "registerItemEventHandlerType(";
  const byType = new Map();
  for (let idx = bundle.indexOf(CALL); idx !== -1; idx = bundle.indexOf(CALL, idx + CALL.length)) {
    const next = bundle.indexOf(CALL, idx + CALL.length);
    const slice = bundle.slice(idx, next === -1 ? bundle.length : next);
    const tm = slice.match(/type:\s*"([a-z-]+)"/);
    if (!tm) continue; // the API's own function definition, not a registration
    const cm = slice.match(/config:\s*\{\s*schema:\s*(\{|[A-Za-z_$][\w$]*)/);
    if (!cm) continue;
    let open;
    if (cm[1] === "{") {
      open = idx + cm.index + cm[0].length - 1;
    } else {
      const dm = bundle.match(new RegExp(`const ${cm[1].replace(/\$/g, "\\$")} = \\{`));
      if (!dm) fail(`handler "${tm[1]}": schema const ${cm[1]} not found in the bundle`);
      open = dm.index + dm[0].length - 1;
    }
    byType.set(tm[1], topLevelKeys(bundle.slice(open + 1, matchBrace(bundle, open))).sort());
  }
  for (const h of handlers) {
    if (!byType.has(h.type)) fail(`handler "${h.type}" is in lang/en.json but no schema was extracted from the bundle — did the registration shape change?`);
    h.schemaFields = byType.get(h.type);
  }
}
const targetChoices = ES.Handler?.General?.Target?.Choices
  ? Object.keys(ES.Handler.General.Target.Choices)
  : [];
// update-actor carries its own narrower Target choices — the parent/global split that decides
// which behaviour can be native at all (there is NO "current user target" native option).
const updateActorTargets = ES.Handler.Types["update-actor"]?.Target?.Choices
  ? Object.keys(ES.Handler.Types["update-actor"].Target.Choices)
  : [];

const snapshot = {
  _README: [
    "GENERATED by scripts/dump-native-vocabulary.js from Ben's Foundry install. Do not hand-edit.",
    "",
    "The cosmere-rpg SYSTEM's own event vocabulary. Authored talent rules (data/authored/*.json)",
    "may use these types alongside the module's edha-* types — the edha vocabulary is an ADDITION",
    "to this one, not the whole of it. Enumerating only register-skills.js under-counts by 12",
    "handlers and 17 events (that mistake is recorded in docs/archive/EDHA_EDITABILITY_AUDIT.md 9j).",
    "",
    "THE DIVIDING LINE: native handlers write SELF/OWNER state (update-actor Target is `parent` or a",
    "fixed `global` UUID). There is no native 'current user target'. Effects that must hit whoever",
    "the player is targeting need an edha-* handler, because those read game.user.targets.",
    "",
    "FIELD NAMES: `schemaFields` (camelCase, from the bundle's actual registrations) is the",
    "AUTHORING surface — what a rule's handler object may carry; anything else is silently dropped",
    "by Foundry's DataModel. `labelKeys` (PascalCase, from lang/en.json) is editor chrome only —",
    "NEVER author against it; the two were confused once and it miswired a gate (2026-07-26).",
    "",
    "`systemSchemaTopLevelFields` (added 07-27h) is the DOCUMENT side of the same trap: the union of",
    "every top-level field name any cosmere DataModel declares. A `system.<name>` path the engine",
    "reads or writes that is NOT in this list is DEAD — Foundry's SchemaField deletes unrecognised",
    "keys, so the write resolves and stores nothing. lint-refs pass 11 gates the engine and the build",
    "against it. It is a UNION, so a pass means 'not obviously dead', never 'right for this type'.",
    "",
    "`systemDerivedValueLeaves` (added 07-27y) is the TWIN of the dead-field trap: the field EXISTS",
    "but is a DerivedValueField OBJECT ({derived, override, useOverride[, bonus]} + a getter-only",
    "`.value`), so `Number(it)` is NaN and the `Number(x) || 0` idiom silently yields 0. Three engine",
    "sites shipped that way — every belief test rolled 1d20+0, every half-Speed move went 0 ft.",
    "Read `.value` (engine helper: edhaDerivedNum). lint-refs pass 17 gates it. LEAF NAMES only —",
    "the paths are built at runtime from CONFIG id maps and cannot be enumerated statically.",
    "",
    "`contentVocabulary` (added 07-27j) is the same trap at the CONTENT layer: the real cosmere id",
    "sets for skills, attributes, defenses (attributeGroups), damage types, statuses and resources.",
    "An authored `skill`/`whenSkill`/`status` outside these never matches anything and an",
    "`@skills.<id>` outside them substitutes to 0 — silently, both times. lint-refs pass 12 gates",
    "data/authored/*.json against it. EDHA's OWN additions (5 leyline skills, ~30 statuses) are NOT",
    "here — pass 12 parses those live out of register-skills.js, so adding one needs no snapshot.",
    "",
    "`systemSchemaFieldsByType` (added 2026-09-15, TODO_REPO_HYGIENE item 182) groups the SAME",
    "top-level fields by the item TYPE each schema literal belongs to, wherever that association",
    "can be recovered from the bundle text (see the function's own doc comment for the method and",
    "its honest limit) — so lint-refs.js pass 11 can check a `system.<field>` read against the type",
    "the call site holds instead of only the union, where it can tell which type that is. A type",
    "absent from this map (or this key absent entirely, as on every snapshot before this one) means",
    "pass 11 stays on the union for it, exactly as before item 182.",
    "",
    "Refresh after a system upgrade: node scripts/dump-native-vocabulary.js",
  ],
  system: { id: systemJson.id, version: systemJson.version },
  generatedFrom: "systems/cosmere-rpg/lang/en.json + index.js (schemaFields, systemSchemaTopLevelFields)",
  counts: { events: events.length, handlers: handlers.length },
  handlerTargetChoices: targetChoices,
  updateActorTargetChoices: updateActorTargets,
  systemSchemaTopLevelFields: systemSchemaTopLevelFields(bundle),
  systemSchemaFieldsByType: systemSchemaFieldsByType(bundle),
  systemDerivedValueLeaves: systemDerivedValueLeaves(bundle),
  contentVocabulary: contentVocabulary(bundle),
  events,
  handlers,
};

const serialized = JSON.stringify(snapshot, null, 2) + "\n";

buildDoc.emit(OUT, serialized, {
  checkMode,
  checkExitCode: 0,
  staleMessage: () => "✗ data/native-vocabulary.json is stale — run: node scripts/dump-native-vocabulary.js",
  upToDateMessage: () => `✓ native-vocabulary in sync (${systemJson.id} ${systemJson.version}: ${events.length} events, ${handlers.length} handlers)`,
  afterWrite: () => {
    console.log(`✓ wrote data/native-vocabulary.json — ${systemJson.id} ${systemJson.version}: ${events.length} native events, ${handlers.length} native handlers`);
    console.log(`  events:   ${events.map((e) => e.type).join(", ")}`);
    console.log(`  handlers: ${handlers.map((h) => h.type).join(", ")}`);
    console.log(`  document system fields (top level, union): ${snapshot.systemSchemaTopLevelFields.length}`);
    console.log(`  document system fields (per item type, best-effort — see the function's doc comment): ${Object.keys(snapshot.systemSchemaFieldsByType).length} type(s): ${Object.keys(snapshot.systemSchemaFieldsByType).join(", ") || "none"}`);
  },
});

}   // main()

if (require.main === module) {
  main();
}

// Exported for tests/native-vocabulary-by-type.test.js — the pure, no-install-needed half of this
// script (TODO_REPO_HYGIENE item 182). Nothing else requires this file.
module.exports = { systemSchemaFieldsByType };
