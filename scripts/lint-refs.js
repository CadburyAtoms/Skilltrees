#!/usr/bin/env node
/* scripts/lint-refs.js — cross-reference linter for the data↔engine contract.
 *
 * All Edha automation is joined by strings: authored `events` rules name an engine handler
 * type, and the engine names talents it automates. Nothing in Foundry errors when either side
 * dangles — a typo'd handler type silently does nothing (the "silent manual card" failure mode
 * iron rule 3 exists to kill), and a talent renamed in an extract silently orphans its
 * engine automation. This linter machine-checks those joints:
 *
 *   1. Authored file shape — top-level keys, and each talent restricted to the overlay
 *      whitelist (docId/img/description/activation/damage/events/effects — per CLAUDE.md).
 *   2. Every `edha-*` event name and handler `type`, every handler `kind`, and every
 *      non-empty `statusId` used in data/authored/*.json appears as a quoted literal in
 *      register-skills.js (i.e. some dispatch/consumer site exists).
 *   3. Every talent-name literal the engine compares against (`.name === "X"`,
 *      `edhaOwnsTalent(actor, "X")`, `edhaCharacterOwnersOf("X")`) resolves to a talent in
 *      data/authored/* or the structure files — or is on the explicit non-talent allowlist.
 *
 * Zero dependencies. Exit 0 clean, 1 on any error. Runs in CI next to validate.js; add it to
 * the local gates when a change touches authored events or engine name-based automation.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const ENGINE_PATH = path.join(REPO_ROOT, "module-src", "scripts", "register-skills.js");
const AUTHORED_DIR = path.join(REPO_ROOT, "data", "authored");

// Talent overlay whitelist (CLAUDE.md: "description, activation, damage, events, effects, img
// ONLY" — plus docId, the extract's document id).
const TALENT_KEYS = new Set(["docId", "img", "description", "activation", "damage", "events", "effects"]);
const TOP_KEYS = new Set(["_meta", "talents"]);

// Engine name-literals that are NOT talents — each entry says what it really is.
const NAME_ALLOWLIST = new Set([
  "Draw Mana",     // cosmere-rpg system action item (the leyline Draw Mana riders key off it)
  "Edha Summons",  // the engine's own summon folder name (edhaEnsureSummonFolder)
  "Food (ration, 1 day)",  // edha-items GEAR name (the kit grant's rations lookup) — not a talent
]);

const engine = fs.readFileSync(ENGINE_PATH, "utf8");
const errors = [];
const err = (m) => errors.push(m);

// Quoted-literal presence in the engine ('x' or "x" or `x`).
function inEngine(lit) {
  return engine.includes(`"${lit}"`) || engine.includes(`'${lit}'`) || engine.includes("`" + lit + "`");
}

// --- pass 1+2: authored files -------------------------------------------------
const talentNames = new Set();
for (const file of fs.readdirSync(AUTHORED_DIR).filter((f) => f.endsWith(".json")).sort()) {
  const rel = `data/authored/${file}`;
  let doc;
  try { doc = JSON.parse(fs.readFileSync(path.join(AUTHORED_DIR, file), "utf8")); }
  catch (e) { err(`${rel}: invalid JSON — ${e.message}`); continue; }

  for (const k of Object.keys(doc)) if (!TOP_KEYS.has(k)) err(`${rel}: unexpected top-level key "${k}"`);
  const talents = doc.talents || {};
  for (const [name, t] of Object.entries(talents)) {
    talentNames.add(name);
    for (const k of Object.keys(t)) {
      if (!TALENT_KEYS.has(k)) err(`${rel} (${name}): key "${k}" outside the authored-overlay whitelist [${[...TALENT_KEYS].join(", ")}]`);
    }
    for (const [evId, ev] of Object.entries(t.events || {})) {
      // The system's event-rule `id` is a Foundry DocumentIdField — anything that isn't exactly
      // 16 alphanumeric chars fails document validation and the rule is SILENTLY dropped (the
      // 07-12 pass-3b Cruel Step bug: "CruelStepMove01" was 15 chars and the talent went inert).
      if (!/^[a-zA-Z0-9]{16}$/.test(evId)) {
        err(`${rel} (${name}) event ${evId}: rule id must be exactly 16 alphanumeric chars (Foundry DocumentIdField) — the system silently drops invalid rules`);
      }
      if (ev?.id !== evId) {
        err(`${rel} (${name}) event ${evId}: inner "id" (${ev?.id}) doesn't match the rule key`);
      }
      const evName = ev?.event;
      if (typeof evName === "string" && evName.startsWith("edha-") && !inEngine(evName)) {
        err(`${rel} (${name}) event ${evId}: event "${evName}" has no dispatch site in register-skills.js`);
      }
      const h = ev?.handler || {};
      const type = h.type;
      if (typeof type === "string" && type.startsWith("edha-") && !inEngine(type)) {
        err(`${rel} (${name}) event ${evId}: handler type "${type}" has no dispatch site in register-skills.js`);
      }
      if (typeof h.kind === "string" && h.kind && !inEngine(h.kind)) {
        err(`${rel} (${name}) event ${evId}: handler kind "${h.kind}" is not consumed anywhere in register-skills.js`);
      }
      if (typeof h.statusId === "string" && h.statusId && !inEngine(h.statusId)) {
        err(`${rel} (${name}) event ${evId}: statusId "${h.statusId}" is unknown to register-skills.js (typo?)`);
      }
    }
  }
}

// --- the full talent-name universe (authored + the three structure files) ------
for (const rel of ["data/leyline.json", "data/domain.json", "data/cosmere.json"]) {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), "utf8")); }
  catch (e) { err(`${rel}: invalid JSON — ${e.message}`); continue; }
  for (const r of rows) {
    const n = r?.name || r?.["Talent Name"] || r?.Name;
    if (typeof n === "string" && n.trim()) talentNames.add(n.trim());
  }
}
// Bespoke adversary abilities (data/adversaries.json items) are talents for automation purposes
// since 07-16: foundry-build flags trait/action kinds `adversaryTalent`, so engine name-keyed
// automation (The Seeming) legitimately targets them — they join the resolvable-name universe.
{
  const rel = "data/adversaries.json";
  try {
    const advData = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), "utf8"));
    for (const [advName, adv] of Object.entries(advData)) {
      if (advName.startsWith("_")) continue;
      for (const it of adv.items || []) {
        if (it?.kind !== "weapon" && typeof it?.name === "string" && it.name.trim()) talentNames.add(it.name.trim());
        // Bespoke-ability event rules (simplified array form) join the same data↔engine checks
        // as authored talents — a typo'd handler type on an adversary is the identical silent
        // failure mode.
        for (const [j, ev] of (Array.isArray(it?.events) ? it.events : []).entries()) {
          const where = `${rel} (${advName} / ${it.name}) events[${j}]`;
          const evName = ev?.event;
          if (typeof evName === "string" && evName.startsWith("edha-") && !inEngine(evName)) {
            err(`${where}: event "${evName}" has no dispatch site in register-skills.js`);
          }
          const h = ev?.handler || {};
          if (typeof h.type === "string" && h.type.startsWith("edha-") && !inEngine(h.type)) {
            err(`${where}: handler type "${h.type}" has no dispatch site in register-skills.js`);
          }
          if (typeof h.kind === "string" && h.kind && !inEngine(h.kind)) {
            err(`${where}: handler kind "${h.kind}" is not consumed anywhere in register-skills.js`);
          }
          if (typeof h.statusId === "string" && h.statusId && !inEngine(h.statusId)) {
            err(`${where}: statusId "${h.statusId}" is unknown to register-skills.js (typo?)`);
          }
        }
      }
    }
  } catch (e) { err(`${rel}: invalid JSON — ${e.message}`); }
}

// --- pass 3: engine name-literals must resolve --------------------------------
const nameLits = new Map(); // literal -> first line number
function collect(re) {
  let m;
  while ((m = re.exec(engine)) !== null) {
    const lit = m[1];
    if (!nameLits.has(lit)) nameLits.set(lit, engine.slice(0, m.index).split("\n").length);
  }
}
collect(/\.name\s*(?:===|!==)\s*"([^"]+)"/g);
collect(/edhaOwnsTalent\([^,()]+,\s*"([^"]+)"\)/g);
collect(/edhaCharacterOwnersOf\("([^"]+)"\)/g);

for (const [lit, line] of [...nameLits.entries()].sort((a, b) => a[1] - b[1])) {
  if (talentNames.has(lit) || NAME_ALLOWLIST.has(lit)) continue;
  err(`register-skills.js:${line}: name literal "${lit}" resolves to no talent in data/ ` +
      `(renamed in an extract? if it's genuinely not a talent, add it to NAME_ALLOWLIST in scripts/lint-refs.js with a reason)`);
}

// --- pass 5: no silent manual adversary cards (Ben's 07-16 wiring standard) ----
// An adversary ability whose text names a trigger must carry native automation, an events rule,
// name-keyed engine wiring, or an explicit "NO NAMEABLE HOOK: <reason>" line. A bare 'GM-run'
// label is exactly the soft laziness that left The Seeming dead — lint refuses it.
{
  const TRIGGER_RE = /\bwhen(ever)?\b|\btriggered\b|\beach time\b|\bevery \d|\bfirst time\b|\bon a hit\b|\breduced below\b|\bdrops? to\b|\ban ally drops\b/i;
  try {
    const advData = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "data/adversaries.json"), "utf8"));
    for (const [advName, adv] of Object.entries(advData)) {
      if (advName.startsWith("_")) continue;
      for (const it of adv.items || []) {
        if (!it || it.kind === "weapon") continue;
        const prose = `${it.text || ""} ${it.rider || ""}`;
        if (!TRIGGER_RE.test(prose)) continue;                          // no trigger named → conscious-use is fine
        if (Array.isArray(it.events) && it.events.length) continue;     // wired via native rules
        if (inEngine(it.name)) continue;                                // name-keyed engine wiring
        if (/NO NAMEABLE HOOK/i.test(prose)) continue;                  // explicit, reasoned exemption
        err(`data/adversaries.json (${advName} / ${it.name}): text names a trigger but the ability has no events, ` +
            `no engine name-wiring, and no "NO NAMEABLE HOOK: <reason>" line — wire it or justify it (Ben 07-16)`);
      }
    }
  } catch (e) { /* reported by the earlier adversaries.json pass */ }
}

// --- pass 4: no raw talent-type gates (the unreachable-case family, 07-16) -----
// The Seeming's engine case was dead code for two days because a `useItem` hook gated on
// `item.type !== "talent"` while adversary abilities are action-typed twins/bespoke items.
// Every talent-type comparison must go through `edhaIsTalent(...)`; a deliberately strict
// site (PC talent budget, ⟳ Sync, pack scans) carries a `type-strict` marker comment.
engine.split("\n").forEach((lineText, i) => {
  if (!/[?.]type\s*[!=]==\s*["']talent["']/.test(lineText)) return;
  if (lineText.includes("type-strict")) return;
  err(`register-skills.js:${i + 1}: raw talent-type comparison — use edhaIsTalent(...) so adversary ` +
      `abilities (action-typed, adversaryTalent-flagged) aren't silently excluded; if strictness is ` +
      `deliberate, add a "type-strict: <reason>" comment on the line`);
});

// --- report --------------------------------------------------------------------
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error${errors.length === 1 ? "" : "s"}.`);
  process.exit(1);
}
console.log(`✓ lint-refs: ${talentNames.size} talent names, ${nameLits.size} engine name-literals resolved, authored overlays clean.`);
