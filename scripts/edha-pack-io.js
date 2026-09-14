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

// ---------------------------------------------------------------------------------------------
// STRUCTURAL projection (TODO_REPO_HYGIENE item 140). `authorable()`/`fingerprint()` above are
// what a GM edits in Foundry and what foundry-extract.js round-trips into data/authored/ — the
// six fields. Everything else on a pack document is generator-owned per AUTHORING_WORKFLOW.md's
// split table (talent name, prerequisites, folder, the node graph -> source JSON, never Foundry).
// But a GM CAN still change some of those fields from inside Foundry — rename a talent, drag it
// to a different folder, add/remove a tree-node prerequisite or connection with the system's own
// tree editor — and until item 140 none of that moved the fingerprint at all, so the un-extracted-
// edits guard (below, and guardUnextracted() in foundry-build.js) never saw it: this is the exact
// blind spot AUTHORING_WORKFLOW.md's guard note has documented since 2026-07-24, and the one that
// bit Ben again 2026-09-13 (`Ghostly Walls` / `Adaptive Mutation`, ungated between a ⟳ Sync and an
// agent-run deploy — TODO_REPO_HYGIENE item 140's "Why").
//
// This does NOT close the round-trip gap — foundry-extract.js still cannot save a structural edit
// back into data/authored/ (structure stays source-JSON-owned, full stop; see AUTHORING_WORKFLOW.md
// "The guard") — it only lets the guard NOTICE one and abort instead of silently overwriting it.
//
// Deliberately NOT covered (stays blind — see AUTHORING_WORKFLOW.md's blind-spot note): a node's
// `position`/`size` (the tree editor's layout, which a GM may legitimately nudge without meaning
// anything structural), `sort`, the `path` item document, and the tree document's
// `viewBounds`/`background` — none of those change what a talent needs or unlocks, only how the
// canvas draws it, so fingerprinting them would only manufacture false aborts. The adversaries and
// items packs have no baseline/guard concept at all (their own wiring standards apply instead).
function structuralOf(doc) {
  if (doc.type === "talent") return { name: doc.name ?? null, folder: doc.folder ?? null };
  if (doc.type === "talent_tree") {
    const nodes = (doc.system && doc.system.nodes) || {};
    const out = {};
    for (const [nodeId, node] of Object.entries(nodes)) {
      out[nodeId] = {
        prerequisites: stableStringify(node?.prerequisites ?? {}),
        connections: stableStringify(node?.connections ?? {}),
      };
    }
    return out;
  }
  return null; // no structural projection defined for this doc type (e.g. "path")
}

// Everything the un-extracted-edits guard needs to remember about ONE pack document, so a later
// build (foundry-build.js) or deploy pre-flight (deploy-cycle.js) can notice a Foundry edit it
// would otherwise silently lose. `authored` exists only for a `talent` (the six round-tripped
// fields, unchanged shape/behaviour from before item 140); `structural` exists for either doc
// type this module knows how to project (structuralOf above) and is omitted for anything else.
// This is what both foundry-build.js's post-write baseline refresh and foundry-extract.js's
// writeBaseline() store per document — replacing the plain fingerprint-string baseline entry a
// pre-item-140 checkout may still have on disk (see diffUnextractedEdits below for how that old
// shape is still read safely rather than misread as "everything changed").
function snapshotDoc(doc) {
  const snap = {};
  if (doc.type === "talent") snap.authored = fingerprint(doc);
  const s = structuralOf(doc);
  if (s !== null) snap.structural = s;
  return snap;
}

// A talent-tree node only carries `uuid`/`talentId` (a compendium UUID and a slug) — never a
// display name — so a report a human reads has to resolve one. `byId`: docId -> live doc, built
// by the caller from the SAME live.items list being diffed (readPack's talent docs and the tree
// doc that references them always come from one pack, so this always resolves when the ref is
// valid).
function nodeTalentName(node, byId) {
  const m = /\.Item\.([^.]+)$/.exec(String(node?.uuid || ""));
  const doc = m && byId[m[1]];
  return (doc && doc.name) || node?.talentId || "(unknown talent)";
}

// THE shared comparison: live pack documents vs. their stored baseline snapshot (snapshotDoc
// above) -> every un-captured Foundry edit, named and classified by what fixes it. Used by BOTH
// foundry-build.js's own pre-write guard (guardUnextracted) and deploy-cycle.js's PRE-FLIGHT
// `un-extracted-edits` guard (scripts/lib/deploy-guards.js's checkUnextractedEdits) — one
// definition of "dirty" for both call sites, read-only (never mutates `liveDocs`).
//
//   kind: "content"    — one of the six authorable fields changed; `node foundry-extract.js
//                         <tree>` saves it, same remedy as before item 140.
//   kind: "structural" — name / folder / a node's prerequisites / a node's connections changed;
//                         NOT round-tripped by foundry-extract.js — the fix is hand-editing the
//                         source JSON (AUTHORING_WORKFLOW.md: "Structure changes go in the source
//                         JSON, full stop").
//
// A baseline value written before item 140 is a plain fingerprint STRING (the old shape) rather
// than `{authored, structural}` — treated like "doc not in baseline" for the structural half: the
// content comparison still runs (the string IS the old `authored` fingerprint), but there is no
// structural baseline to compare against yet, so nothing structural is reported for that doc until
// the next build/extract re-arms it. This mirrors guardUnextracted's existing "no baseline -> warn,
// don't abort" philosophy rather than flagging every pre-existing talent dirty the first time this
// ships.
function diffUnextractedEdits(liveDocs, baseline) {
  const dirty = []; // { name, field, kind, detail? }
  if (!baseline) return dirty;
  const byId = {};
  for (const d of liveDocs) if (d && d._id) byId[d._id] = d;

  for (const d of liveDocs) {
    const base = baseline[d._id];
    if (base === undefined) continue; // not in baseline (new doc, or a type the old baseline never wrote) — nothing captured to lose
    const baseAuthored = typeof base === "string" ? base : base.authored;
    const baseStructural = typeof base === "string" ? undefined : base.structural;

    if (d.type === "talent") {
      if (baseAuthored !== undefined && fingerprint(d) !== baseAuthored) {
        dirty.push({ name: d.name, field: "content", kind: "content" });
      }
      if (baseStructural) {
        const cur = structuralOf(d);
        if (cur.name !== baseStructural.name) {
          dirty.push({ name: baseStructural.name ?? d.name, field: "name", kind: "structural", detail: `renamed to "${cur.name}"` });
        }
        if (cur.folder !== baseStructural.folder) {
          dirty.push({ name: cur.name, field: "folder", kind: "structural" });
        }
      }
    } else if (d.type === "talent_tree" && baseStructural) {
      const nodes = (d.system && d.system.nodes) || {};
      for (const [nodeId, node] of Object.entries(nodes)) {
        const baseNode = baseStructural[nodeId];
        if (!baseNode) continue; // new node — nothing captured to lose
        const talentName = nodeTalentName(node, byId);
        const curPrereq = stableStringify(node?.prerequisites ?? {});
        const curConn = stableStringify(node?.connections ?? {});
        if (curPrereq !== baseNode.prerequisites) dirty.push({ name: talentName, field: "prerequisites", kind: "structural" });
        if (curConn !== baseNode.connections) dirty.push({ name: talentName, field: "connections", kind: "structural" });
      }
    }
  }
  return dirty;
}

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

module.exports = { authorable, authorableEffect, applyAuthorable, isEmptyAuthored, stableStringify, fingerprint, structuralOf, snapshotDoc, diffUnextractedEdits, readPack, slugify, AUTHORABLE_SYSTEM, requireClassicLevel };
