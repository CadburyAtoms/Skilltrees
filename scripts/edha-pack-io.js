/* scripts/edha-pack-io.js
 *
 * Shared helpers for the Foundry round-trip workflow, used by:
 *   - foundry-build.js   (overlay authored edits + guard against overwriting them)
 *   - foundry-extract.js (capture Foundry edits back into git-tracked source)
 *
 * The "authorable" projection is the subset of a `talent` document a user is
 * expected to edit in Foundry and that we round-trip faithfully. Everything else
 * (name, ids, prerequisites, folder, sort, the tree node graph, path items) stays
 * generator-owned — it is woven into deterministic ids and edges and must come
 * from the source atlas files, not from hand edits.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
// classic-level: prefer Foundry's bundled copy (Windows); fall back to a normal module
// resolution (NODE_PATH / local node_modules) so the scripts also run off-machine.
function requireClassicLevel() {
  const candidates = [
    "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
    "classic-level",
  ];
  for (const c of candidates) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error("classic-level not found — run on the Foundry machine or `npm install classic-level` (NODE_PATH supported).");
}
const { ClassicLevel } = requireClassicLevel();

// Fields we author/round-trip on a talent. (img is top-level; the rest live under system.)
const AUTHORABLE_SYSTEM = ["description", "activation", "damage", "events"];

// Project an embedded ActiveEffect to the fields we author. Drop volatile `_stats`
// so the guard does not false-fire when Foundry normalises effects on load.
// `duration`/`statuses`/`type` ARE round-tripped (needed for timed/ongoing effects
// and condition icons) but in a NORMALISED form so a Foundry-stamped default
// fingerprints identically to an absent field: duration keeps only non-null
// fields (and never the world-specific `combat` id), statuses are sorted,
// type defaults to "base".
const EFFECT_DURATION_FIELDS = ["seconds", "rounds", "turns", "startTime", "startRound", "startTurn"];
function authorableEffect(e) {
  const duration = {};
  for (const k of EFFECT_DURATION_FIELDS) {
    const v = e.duration?.[k];
    if (v !== null && v !== undefined) duration[k] = v;
  }
  return {
    _id: e._id ?? null,
    name: e.name ?? "",
    img: e.img ?? null,
    type: e.type ?? "base",
    changes: (e.changes || []).map(c => ({ key: c.key, mode: c.mode ?? 2, value: c.value })),
    duration,
    statuses: Array.isArray(e.statuses) ? [...e.statuses].sort() : [],
    disabled: !!e.disabled,
    transfer: e.transfer !== false,
    description: e.description ?? "",
    flags: e.flags ?? {},
  };
}

// The authorable projection of a whole talent doc.
function authorable(doc) {
  const s = doc.system || {};
  const out = { img: doc.img ?? null };
  for (const k of AUTHORABLE_SYSTEM) out[k] = s[k] ?? (k === "events" ? {} : null);
  out.effects = (doc.effects || []).map(authorableEffect);
  return out;
}

// Apply an authored projection back onto a generated talent doc, in place.
// `proj` may be a full authorable() projection or a stored authored entry
// (which carries an extra `docId`/`name`; those are ignored here).
function applyAuthorable(doc, proj) {
  if (proj.img != null) doc.img = proj.img;
  doc.system = doc.system || {};
  for (const k of AUTHORABLE_SYSTEM) {
    if (proj[k] !== undefined && proj[k] !== null) doc.system[k] = proj[k];
  }
  if (Array.isArray(proj.effects)) doc.effects = proj.effects.map(authorableEffect);
  return doc;
}

// Stable, key-sorted JSON for fingerprinting (order-independent).
function stableStringify(v) {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  if (typeof v === "object") {
    return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}
const fingerprint = doc => stableStringify(authorable(doc));

// Read a pack by copying it to a temp dir first (skipping the LOCK file), so it
// works even while Foundry holds the lock. Returns { items:[], folders:[] } or null.
async function readPack(packDir) {
  if (!fs.existsSync(packDir)) return null;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "edha-pack-"));
  try {
    for (const f of fs.readdirSync(packDir)) {
      if (f === "LOCK") continue;
      const src = path.join(packDir, f);
      if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(tmp, f));
    }
    const db = new ClassicLevel(tmp, { keyEncoding: "utf8", valueEncoding: "json" });
    await db.open();
    const items = [], folders = [];
    const effectsByParent = {};   // Foundry stores embedded effects as separate `!items.effects!<itemId>.<effectId>` keys
    for await (const [k, v] of db.iterator()) {
      if (k.startsWith("!items.effects!")) {
        const parentId = k.slice("!items.effects!".length).split(".")[0];
        (effectsByParent[parentId] = effectsByParent[parentId] || []).push(v);
      }
      else if (k.startsWith("!items!")) items.push(v);
      else if (k.startsWith("!folders!")) folders.push(v);
    }
    await db.close();
    // Reassemble: replace effect-ID-string arrays with the full effect docs (ordered as listed),
    // so fingerprints/authored projections see the same shape the generator emits.
    for (const it of items) {
      if (!Array.isArray(it.effects) || !it.effects.length) continue;
      if (typeof it.effects[0] !== "string") continue;                 // legacy inline shape — leave as-is
      const pool = effectsByParent[it._id] || [];
      it.effects = it.effects.map(id => pool.find(e => e._id === id)).filter(Boolean);
    }
    return { items, folders };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// slugify shared with the generator (kept identical so authored filenames are stable).
const slugify = s => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

module.exports = { authorable, authorableEffect, applyAuthorable, stableStringify, fingerprint, readPack, slugify, AUTHORABLE_SYSTEM };
