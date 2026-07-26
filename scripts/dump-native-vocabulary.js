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
{
  let bundle;
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
    "handlers and 17 events (that mistake is recorded in EDHA_EDITABILITY_AUDIT.md 9j).",
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
    "Refresh after a system upgrade: node scripts/dump-native-vocabulary.js",
  ],
  system: { id: systemJson.id, version: systemJson.version },
  generatedFrom: "systems/cosmere-rpg/lang/en.json + index.js (schemaFields)",
  counts: { events: events.length, handlers: handlers.length },
  handlerTargetChoices: targetChoices,
  updateActorTargetChoices: updateActorTargets,
  events,
  handlers,
};

const serialized = JSON.stringify(snapshot, null, 2) + "\n";

if (checkMode) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current.replace(/\r\n/g, "\n") !== serialized) {
    console.error("✗ data/native-vocabulary.json is stale — run: node scripts/dump-native-vocabulary.js");
    process.exit(1);
  }
  console.log(`✓ native-vocabulary in sync (${systemJson.id} ${systemJson.version}: ${events.length} events, ${handlers.length} handlers)`);
  process.exit(0);
}

fs.writeFileSync(OUT, serialized);
console.log(`✓ wrote data/native-vocabulary.json — ${systemJson.id} ${systemJson.version}: ${events.length} native events, ${handlers.length} native handlers`);
console.log(`  events:   ${events.map((e) => e.type).join(", ")}`);
console.log(`  handlers: ${handlers.map((h) => h.type).join(", ")}`);
