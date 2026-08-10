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
// LAZY on purpose (2026-07-24): only readPack() touches LevelDB, but this used to resolve at
// module load, so importing the file at all required the native dep. That made the pure helpers
// (authorable / applyAuthorable / fingerprint) untestable anywhere classic-level isn't installed —
// including CI's `node tests/run.js` — which is why the empty-overlay wipe had no regression case
// until it had already cost 10 talents their behaviour. Resolve at first use instead.

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

// True for a value that carries no authored content: absent, or an empty object/array.
// WHY (bug found 2026-07-24): `authorable()` writes `events: {}` for every talent that had no
// rules when it was extracted, so almost every entry in data/authored/ asserts an empty `events`.
// The old test here was `!== undefined && !== null`, which `{}` PASSES — so that stale empty
// snapshot overwrote rules the generator had since learned to emit from the side tables, and the
// talent shipped with a blank Events tab. Proven by an A/B build (overlay on vs. off): it cost
// 10 talents their behaviour — Guardian Stance, Thorn Field, Shoulder the Oath, Lay Foundation,
// Death Ward, Necrotic Cascade, Set Charge, Fault Line, Warlord's Advance, Investiture of Command.
//
// An empty value is indistinguishable from "never authored", so it must not win. To deliberately
// strip generated behaviour, remove the side-table entry (the generator is the source for it) or
// rebuild with --force; do not rely on an empty overlay to mean "clear this".
function isEmptyAuthored(v) {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

// Apply an authored projection back onto a generated talent doc, in place.
// `proj` may be a full authorable() projection or a stored authored entry
// (which carries an extra `docId`/`name`; those are ignored here).
function applyAuthorable(doc, proj) {
  if (proj.img != null) doc.img = proj.img;
  doc.system = doc.system || {};
  for (const k of AUTHORABLE_SYSTEM) {
    // `events` is a map and `description`/`activation`/`damage` are objects that are meaningful
    // when populated; an empty one is a no-op snapshot, never an instruction to clear.
    if (!isEmptyAuthored(proj[k])) doc.system[k] = proj[k];
  }
  if (Array.isArray(proj.effects) && proj.effects.length) doc.effects = proj.effects.map(authorableEffect);
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
// works even while Foundry holds the lock. Returns { items:[], folders:[] } or null
// by default — see options below for the other consumer shape.
//
// options.prefixes (added 2026-08-10, folding in validate-adversaries.js's hand-rolled
// copy of this same temp-copy/open/iterate/cleanup dance): an array of raw LevelDB key
// prefixes (e.g. `["!actors!", "!actors.items!", "!actors.items.effects!", "!folders!"]`
// for the adversary pack, vs. this function's own default `!items!`/`!folders!` shape).
// When given, returns `{ [prefix]: [[key, value], ...] }` — the RAW key/value pairs for
// each requested prefix, in iteration order, with no reassembly and no re-indexing (the
// adversary pack's `!actors!`/`!folders!` docs are indexed by `_id` while its
// `!actors.items!`/`!actors.items.effects!` docs are looked up by the full raw key —
// that indexing choice stays the caller's, same as it was before this was shared).
// Prefixes here are mutually exclusive by construction (Foundry always terminates a
// collection-path segment with `!`, so e.g. `!actors!` never matches an
// `!actors.items!...` key) — a key matches at most one requested prefix.
//
// With no options (or options.prefixes omitted), behavior is UNCHANGED from before this
// parameter existed: the items[]/folders[] shape below, effect-ID arrays reassembled into
// full docs. `validate-packs.js` and `inspect-pack.js` call `readPack(packDir)` with no
// second argument and must keep getting exactly this.
async function readPack(packDir, options = {}) {
  if (!fs.existsSync(packDir)) return null;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "edha-pack-"));
  try {
    for (const f of fs.readdirSync(packDir)) {
      if (f === "LOCK") continue;
      const src = path.join(packDir, f);
      if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(tmp, f));
    }
    const { ClassicLevel } = requireClassicLevel();
    const db = new ClassicLevel(tmp, { keyEncoding: "utf8", valueEncoding: "json" });
    await db.open();

    if (options.prefixes) {
      const buckets = {};
      for (const p of options.prefixes) buckets[p] = [];
      for await (const [k, v] of db.iterator()) {
        for (const p of options.prefixes) {
          if (k.startsWith(p)) { buckets[p].push([k, v]); break; }
        }
      }
      await db.close();
      return buckets;
    }

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

module.exports = { authorable, authorableEffect, applyAuthorable, isEmptyAuthored, stableStringify, fingerprint, readPack, slugify, AUTHORABLE_SYSTEM, requireClassicLevel };
