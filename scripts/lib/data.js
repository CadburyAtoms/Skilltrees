#!/usr/bin/env node
/* scripts/lib/data.js — shared data-loading primitives for the Skilltrees build/lint/validate
 * scripts.
 *
 * Added 2026-08-10 (hygiene campaign), for two reasons:
 *
 *   1. loadJson's read-error-vs-parse-error semantics (originally validate.js's own private
 *      helper) THROW rather than returning null/undefined — a caller that wants to keep going
 *      past a bad file must catch that explicitly, which is the point. Two other scripts had
 *      quietly re-implemented a WEAKER version: check-2b-classification.js's own loader caught,
 *      pushed to an errors array, and returned null, and a later line dereferenced the null
 *      result unguarded; lint-refs.js had SIX near-identical authored-overlay walks that did
 *      `catch (e) { continue; }` with no reporting at all — a broken JSON file was invisible to
 *      those passes, which then reported SUCCESS on files they never read. One throwing
 *      implementation, reused, makes "silently skip a broken file" impossible by construction.
 *
 *   2. buildTrees()/normRow() (the "normalize a row across the three atlas key dialects and group
 *      into trees" pipeline) lived only in foundry-build.js, uncallable from anywhere else because
 *      that file hard-requires classic-level at load and runs a top-level async IIFE. Moved here
 *      verbatim so future consumers (and tests) can load the atlas tree structure without dragging
 *      in the pack-writing half of the builder.
 *
 * Zero dependency on classic-level: edha-pack-io.js (required below, for `slugify`) resolves
 * classic-level LAZILY inside readPack() only, so requiring it here to grab one pure string helper
 * does not require classic-level to be installed.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { REPO_ROOT, DATA, ATLAS_PACK } = require("./paths.js");
const { slugify } = require("../edha-pack-io.js");

// ---------- loadJson ----------
// Same semantics as validate.js's original loadJson (kept there untouched — this is a shared
// copy, not a replacement of it): a read failure and a parse failure get DIFFERENT messages, each
// carrying the file's path, and both THROW instead of returning null. `rel` may be repo-relative
// (resolved against REPO_ROOT, matching validate.js) or an absolute path (used as-is) — the latter
// is what buildTrees() below needs, since atlas files live under DATA, which may be EDHA_DATA-
// overridden to a directory outside this repo entirely.
function loadJson(rel) {
  const p = path.isAbsolute(rel) ? rel : path.join(REPO_ROOT, rel);
  let raw;
  try { raw = fs.readFileSync(p, "utf8"); }
  catch (e) { throw new Error(`Could not read ${rel}: ${e.message}`); }
  try { return JSON.parse(raw); }
  catch (e) { throw new Error(`Invalid JSON in ${rel}: ${e.message}`); }
}

// ---------- authored overlays ----------
// data/authored/<atlas>-<group>.json — one file per tree: { _meta, talents: { <name>: {...} } }.
// CRITICAL: a file that fails to parse THROWS (via loadJson) — it is never silently skipped. A
// caller that wants to collect errors across multiple files (lint-refs.js) must catch per file
// itself; this iterator's contract is "every file is read, or you find out immediately".
function forEachAuthoredRule(cb) {
  const dir = path.join(REPO_ROOT, "data", "authored");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const rel = `data/authored/${file}`;
    const doc = loadJson(rel);
    for (const [talentName, talent] of Object.entries(doc.talents || {})) {
      cb({ file, talentName, talent });
    }
  }
}

// ---------- adversaries ----------
// data/adversaries.json — { <advName>: { items: [...] }, "_...": <metadata> }. "_"-prefixed keys
// are metadata, not adversaries (the convention validate.js / foundry-build.js already use).
function forEachAdversaryRule(cb) {
  const adv = loadJson("data/adversaries.json");   // THROWS on a broken file
  for (const [advName, a] of Object.entries(adv)) {
    if (advName.startsWith("_")) continue;
    for (const item of a.items || []) cb({ advName, adv: a, item });
  }
}

// ---------- shared atlas constants ----------
const LEYLINE_COLORS = ["White", "Blue", "Black", "Red", "Green"];
const HEROIC_PATHS = ["Agent", "Envoy", "Hunter", "Leader", "Scholar", "Warrior"];

// ---------- atlas normalization / tree assembly ----------
// Moved VERBATIM from foundry-build.js (2026-08-10) — this was the canonical "normalize a row
// across the three atlas key dialects and group into trees" implementation; foundry-build.js now
// requires it from here instead of keeping a local copy. Only the module plumbing changed (fs
// reads point at DATA imported from ./paths.js instead of a file-local constant; `path` in the
// heroic loop renamed `path_` to avoid shadowing the `path` module required above).
//
// 2026-09-05 (TODO_REPO_HYGIENE #22): there are no longer THREE key dialects to reconcile.
// data/leyline.json, data/domain.json and data/cosmere.json all speak the one lowercase dialect
// (`name` / `action` / `cost` / `prerequisites` / `description` / `flavor` / `tags` / `specialty`
// / `path` / `deity` / `domain` / `colors` / `atlas` / `layout` / `connections`), so the old
// multi-key getter `G(raw, "flavor", "Flavor Text", "Flavor")` and every alias it carried are
// gone. `validate.js` now REJECTS the retired capitalized keys by name, so a file cannot drift
// back to them unnoticed — the aliases are not load-bearing fallbacks any more, they were the
// reason validate.js could not check real field names.
//
// What is left is not alias reconciliation: it is (a) injecting the tree coordinates the caller
// knows and the row does not (atlas / group / treeId), (b) the ONE deliberate rename
// `prerequisites` → `prereqs` (the in-memory talent shape foundry-build.js consumes), (c) the
// `cost` default "—", and (d) sanitising `layout` / `connections` into a fresh, well-typed shape.
const val = (v) => (v == null || v === "" ? "" : v);

// The "name" projection, factored out because it is also the shape validate.js's own (separately
// maintained) rowName() computes — see validate.js:19-21.
function rowName(row) {
  return val(row.name);
}

function normRow(raw, atlas, group, treeId) {
  return {
    atlas, group, treeId,
    name: rowName(raw),
    action: val(raw.action),
    cost: val(raw.cost) || "—",
    prereqs: val(raw.prerequisites),
    description: val(raw.description),
    flavor: val(raw.flavor),
    tags: val(raw.tags),
    specialty: val(raw.specialty),
    layout: raw.layout && typeof raw.layout.x === "number" ? { x: raw.layout.x, y: raw.layout.y } : null,
    connections: Array.isArray(raw.connections) ? raw.connections.slice() : null,
  };
}

// Heroic path icon — the one other foundry-build.js local buildTrees() closed over (besides DATA/
// ATLAS_PACK/norm/slugify, all otherwise accounted for). Moved alongside it rather than left
// behind: it's a pure one-liner used only inside buildTrees (verified — no other reference in
// foundry-build.js).
const HEROIC_ICON = (p) => `systems/cosmere-rpg/assets/icons/stormlight/paths/${p.toLowerCase()}.webp`;

function buildTrees() {
  const trees = [];
  // ALL atlases are always ASSEMBLED (in memory) so adversary `talents` references can resolve
  // under any scope — SCOPE (a foundry-build.js concern) gates which packs get WRITTEN, not
  // assembly.
  const want = () => true;
  if (want("leyline")) {
    const ley = JSON.parse(fs.readFileSync(`${DATA}/leyline.json`, "utf-8"));
    for (const color of LEYLINE_COLORS) {
      const id = `leyline/${color}`;
      const talents = ley.filter(t => t.path === color).map(r => normRow(r, "leyline", color, id));
      trees.push({ id, atlas:"leyline", pack:ATLAS_PACK.leyline, group:color, color:color.toLowerCase(), treeName:`${color} Leyline`, talents });
    }
  }
  if (want("deity")) {
    const dom = JSON.parse(fs.readFileSync(`${DATA}/domain.json`, "utf-8"));
    const byDeity = {};
    for (const r of dom) (byDeity[r.deity] = byDeity[r.deity] || []).push(r);
    for (const deity of Object.keys(byDeity)) {
      // Display by DOMAIN (e.g. "Chaos"), not deity name ("Maelith"). Folder + path Item = domain;
      // tree = "<Domain> Talents" (mirrors heroic "Agent" vs "Agent Talents"). Deity name lives only in the description.
      const rows = byDeity[deity], id = `deity/${deity}`, domain = rows[0].domain;
      const color = slugify(((rows[0].colors || "white").split(/[\/,]/)[0] || "white").trim());
      trees.push({ id, atlas:"deity", pack:ATLAS_PACK.deity, group:domain, deity, domain, color, treeName:`${domain} Talents`, talents: rows.map(r => normRow(r, "deity", domain, id)) });
    }
  }
  if (want("heroic")) {
    const cos = JSON.parse(fs.readFileSync(`${DATA}/cosmere.json`, "utf-8"));
    for (const path_ of HEROIC_PATHS) {
      const id = `heroic/${path_}`;
      const talents = cos.filter(t => t.path === path_).map(r => normRow(r, "heroic", path_, id));
      trees.push({ id, atlas:"heroic", pack:ATLAS_PACK.heroic, group:path_, color:"", treeName:`${path_} Talents`, icon:HEROIC_ICON(path_), talents });
    }
  }
  return trees;
}

// loadAtlases: the name the task brief for this module uses for "load the three data files +
// buildTrees -> the tree list". buildTrees() already IS exactly that (it reads leyline/domain/
// cosmere itself) — this is an alias, not a second implementation.
function loadAtlases() {
  return buildTrees();
}

module.exports = {
  loadJson,
  forEachAuthoredRule,
  forEachAdversaryRule,
  LEYLINE_COLORS,
  HEROIC_PATHS,
  normRow,
  rowName,
  buildTrees,
  loadAtlases,
};
