/* scripts/lib/handler-type-guard.js — the build may never EMIT a rule whose `edha-*` handler type
 * the engine does not register (item 64, 2026-09-06).
 *
 * WHY. Item 48 (R-78) retired the `edha-aoe-template` handler, and `scripts/lint-refs.js` pass 9
 * holds every AUTHORED rule in `data/` to the engine's `registerItemEventHandlerType` calls. But a
 * rule the BUILD GENERATES from a side table never appears in `data/`, so pass 9 could not see
 * that `foundry-build.js`'s `aoeRule()` still minted `edha-aoe-template` — it was masked only
 * because Lay Foundation's authored overlay replaced the generated events. This guard sits at the
 * pack WRITERS instead: every document that reaches a pack (talent, path, culture, item, adversary
 * actor + embedded item) passes through `writePack` / `writeActorPack`, whatever generator or
 * overlay produced it, and the build fails BEFORE the pack exists.
 *
 * Only `edha-*` types are judged — the engine's registrations are the whole record for those.
 * Native cosmere-rpg types are lint-refs pass 2's report (native-vocabulary.json), not ours.
 *
 * Pure and dependency-free so tests/handler-type-guard.test.js can pin it on fixtures; the
 * registered set comes from scripts/handler-schemas.js `parseHandlerSchemas(engineSource)`.
 */
"use strict";

// Every handler type in a document's `system.events` — the DataModel map shape ({id: rule}) or the
// simplified adversary array shape ([{event, handler}]) — as [{ruleId, type}].
function ruleTypesOf(doc) {
  const ev = doc?.system?.events;
  const rules = Array.isArray(ev) ? ev : (ev && typeof ev === "object" ? Object.values(ev) : []);
  const out = [];
  rules.forEach((r, i) => {
    const type = r?.handler?.type;
    if (typeof type === "string" && type) out.push({ ruleId: r.id || String(i), type });
  });
  return out;
}

// docs: the documents about to be written; registered: Set/Map of engine-registered handler types
// (a Map's keys are used, so parseHandlerSchemas' result can be passed as-is).
// Returns { scanned, findings } — `scanned` counts every rule looked at, so a caller can assert the
// guard actually saw something; findings = [{ name, ruleId, type }].
function checkHandlerTypes(docs, registered) {
  const known = registered instanceof Map ? new Set(registered.keys()) : new Set(registered || []);
  const findings = [];
  let scanned = 0;
  for (const doc of docs || []) {
    for (const { ruleId, type } of ruleTypesOf(doc)) {
      scanned++;
      if (type.startsWith("edha-") && !known.has(type)) findings.push({ name: doc.name, ruleId, type });
    }
  }
  return { scanned, findings };
}

// One message per finding, in the shape the build throws.
function formatFindings(where, findings) {
  return findings.map(f =>
    `${where}: "${f.name}" rule ${f.ruleId} has handler type "${f.type}", which the engine never ` +
    `registers via registerItemEventHandlerType — the build would ship a rule nothing can execute`);
}

module.exports = { checkHandlerTypes, ruleTypesOf, formatFindings };
