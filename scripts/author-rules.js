#!/usr/bin/env node
/* scripts/author-rules.js — splice authored `events` / `effects` onto talents, safely.
 *
 * WHY THIS EXISTS. The rule-2b migration authors rules onto talents by the dozen, and three of this
 * repo's most-repeated gotchas are all mechanical:
 *   1. Rule ids and effect `_id`s are Foundry DocumentIdFields: EXACTLY 16 alphanumeric characters or
 *      the system SILENTLY DROPS the rule. Hand-counting has failed three times.
 *   2. Each authored JSON file has its own trailing-newline state (measured 2026-07-24u: SIX of the
 *      21 files have none — the CLAUDE.md note naming only deity-death.json under-states it) and they
 *      are all CRLF. Normalising either produces a whole-file diff that buries the real change.
 *   3. Writing markdown-ish text through a shell heredoc mangles backticks.
 * This script makes all three impossible instead of remembered: payloads come from a FILE, ids are
 * generated and asserted, and the file's own byte conventions are preserved.
 *
 * It also refuses to overwrite a talent that already carries rules, so a re-run cannot silently
 * clobber earlier work.
 *
 * usage:
 *   node scripts/author-rules.js <payload.json> [--dry-run]
 *
 * payload.json shape — one entry per talent:
 *   {
 *     "data/authored/leyline-black.json": {
 *       "Blood Price": {
 *         "events":  { "<16-char id>": { ...rule... } },     // optional
 *         "effects": [ { "_id": "<16-char id>", ... } ]       // optional
 *       }
 *     }
 *   }
 *
 * Ids may instead be written as "seed:<something>" and this script expands them to
 * `<seed>`.padEnd(16,"0"), throwing if the seed exceeds 16 chars or collides after truncation.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const payloadPath = args.find((a) => !a.startsWith("--"));
if (!payloadPath) {
  console.error("usage: node scripts/author-rules.js <payload.json> [--dry-run]");
  process.exit(2);
}

const ID_RE = /^[A-Za-z0-9]{16}$/;
const seen = new Set();

function makeId(raw, where) {
  let id = String(raw);
  if (id.startsWith("seed:")) {
    const seed = id.slice(5).replace(/[^A-Za-z0-9]/g, "");
    if (seed.length > 16) throw new Error(`${where}: seed "${seed}" is ${seed.length} chars — must be <= 16`);
    if (!seed.length) throw new Error(`${where}: empty seed`);
    id = seed.padEnd(16, "0");
  }
  if (!ID_RE.test(id)) {
    throw new Error(`${where}: id "${id}" is ${id.length} chars / non-alphanumeric — Foundry requires EXACTLY 16 alphanumeric or it silently drops the rule`);
  }
  if (seen.has(id)) throw new Error(`${where}: duplicate id "${id}" AFTER truncation — ids must be unique across the whole payload`);
  seen.add(id);
  return id;
}

// Normalise a rule/effect map, expanding seeds and keeping `id`/`_id` consistent with the key.
function normaliseEvents(events, talent) {
  const out = {};
  for (const [rawKey, rule] of Object.entries(events)) {
    const id = makeId(rawKey, `${talent} events[${rawKey}]`);
    if (rule.id !== undefined && rule.id !== rawKey && !String(rule.id).startsWith("seed:")) {
      throw new Error(`${talent}: rule key "${rawKey}" and inner id "${rule.id}" disagree`);
    }
    out[id] = { ...rule, id };
  }
  return out;
}
function normaliseEffects(effects, talent) {
  return effects.map((eff, i) => {
    if (eff._id === undefined) throw new Error(`${talent} effects[${i}]: missing _id`);
    return { ...eff, _id: makeId(eff._id, `${talent} effects[${i}]`) };
  });
}

const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
let touchedFiles = 0;
let touchedTalents = 0;
const report = [];

for (const [rel, talents] of Object.entries(payload)) {
  const abs = path.join(REPO_ROOT, rel);
  const raw = fs.readFileSync(abs, "utf8");
  // Capture this FILE's own conventions before parsing — they must survive the rewrite.
  const crlf = raw.includes("\r\n");
  const trailingNewline = raw.endsWith("\n");
  const doc = JSON.parse(raw);
  if (!doc.talents) throw new Error(`${rel}: no "talents" object`);

  for (const [name, add] of Object.entries(talents)) {
    const t = doc.talents[name];
    if (!t) throw new Error(`${rel}: talent "${name}" not found — check the exact spelling`);

    if (add.events) {
      const cur = t.events;
      const isEmpty = !cur || (typeof cur === "object" && !Object.keys(cur).length);
      if (!isEmpty) throw new Error(`${rel} / ${name}: already carries events — refusing to overwrite. Edit by hand if this is deliberate.`);
      t.events = normaliseEvents(add.events, name);
    }
    if (add.effects) {
      const cur = t.effects;
      const isEmpty = !cur || (Array.isArray(cur) && !cur.length);
      if (!isEmpty) throw new Error(`${rel} / ${name}: already carries effects — refusing to overwrite.`);
      t.effects = normaliseEffects(add.effects, name);
    }
    touchedTalents++;
    report.push(`  ${name.padEnd(26)} events=${add.events ? Object.keys(t.events).length : 0} effects=${add.effects ? t.effects.length : 0}`);
  }

  let out = JSON.stringify(doc, null, 2);
  if (crlf) out = out.replace(/\n/g, "\r\n");
  if (trailingNewline) out += crlf ? "\r\n" : "\n";
  if (!DRY) fs.writeFileSync(abs, out, "utf8");
  touchedFiles++;
  report.unshift(`${rel}  [${crlf ? "CRLF" : "LF"}, trailingNL=${trailingNewline}]`);
}

console.log(report.join("\n"));
console.log(`\n${DRY ? "DRY RUN — nothing written. " : ""}${touchedTalents} talent(s) across ${touchedFiles} file(s). ${seen.size} id(s), all 16 alphanumeric and unique.`);
