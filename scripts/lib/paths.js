#!/usr/bin/env node
/* scripts/lib/paths.js — shared location constants for the Skilltrees build/lint/validate scripts.
 *
 * Added 2026-08-10 (hygiene campaign): every consumer independently hard-coded DATA / MODROOT /
 * ATLAS_PACK, and at least one copy had already drifted — foundry-extract.js's own DATA/MODROOT
 * had NO env override, unlike foundry-build.js's EDHA_DATA/EDHA_MODROOT (see foundry-extract.js's
 * 2026-07-26c comment on BASELINE_DIR describing the scratch-modroot fix this hole half-applied:
 * a session extracting into a scratch modroot would silently read/write Ben's LIVE modroot
 * instead). One shared copy here closes that gap for every future consumer instead of relying on
 * each new file remembering to add the override.
 *
 * REPO_ROOT is resolved from THIS file's own location (scripts/lib/paths.js -> repo root is two
 * levels up), so it is correct regardless of the process's cwd — same technique validate.js uses
 * from scripts/.
 *
 * All six formerly-independent consumers — foundry-build.js, inspect-pack.js, module-src-sync.js,
 * sync-art.js, validate-packs.js, and validate-adversaries.js — are migrated onto this module as
 * of 2026-09-05 (item 11; lint-refs.js pass 21's foundry-path-literal shrink list is now empty).
 * Add a new consumer onto this module rather than a new local copy.
 */
"use strict";
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");

// DATA: foundry-build.js's own default used to be an ABSOLUTE OneDrive literal
// ("C:/Users/benhe/OneDrive/Documentos/Worldbuilding/Claude Design/skilltrees/data") — equivalent
// to REPO_ROOT + "/data" on this machine today (Windows paths are case-insensitive, so the
// "skilltrees" vs "Skilltrees" casing difference doesn't matter), but not portable off it. The
// repo-relative form below resolves to the identical directory here and works on any checkout.
const DATA = process.env.EDHA_DATA || path.join(REPO_ROOT, "data");

// MODROOT: Ben's live Foundry module install. No repo-relative equivalent exists — this is a
// machine-local Foundry Data directory, so the literal itself (matching foundry-build.js:34 /
// foundry-extract.js:29 verbatim) is the correct default.
const MODROOT = process.env.EDHA_MODROOT || "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content";

// ATLAS_PACK: the three atlas compendium names — identical copies lived in foundry-build.js
// (~line 48 pre-move) and foundry-extract.js (~line 34).
const ATLAS_PACK = { leyline: "edha-leyline", deity: "edha-deity", heroic: "edha-heroic" };

module.exports = { REPO_ROOT, DATA, MODROOT, ATLAS_PACK };
