#!/usr/bin/env node
/* Generate the creation wizard's map-picker data asset (2026-07-19, Ben's bench ruling:
 * the "Where are you from?" step becomes a Thyrcross map).
 *
 *   node scripts/build-map-picker-asset.js
 *
 * Reads THE map truth (source-materials/maps/thyrcross.map.json) and writes
 * module-src/assets/thyrcross-nations.json: canvas size + per-nation name/region/polygon.
 * Everything is data-derived — the hover line is the map's own `region` field.
 * Deterministic output — commit the result; module-src-sync.js pushes both to the live module.
 *
 * ⚠️ THE IMAGE HALF IS NOT WRITTEN BY THIS SCRIPT, AND IT IS NOT A COPY OF thyrcross-labeled.png.
 * assets/thyrcross-map.jpg must be a downscale of the RAW BASE PAINTING (thyrcross.png), NOT of
 * thyrcross-labeled.png — the render toolchain's label overlay is what carries the nation letters
 * (A Kettavar … J Canticle) and the numbered city labels, and the wizard's map picker is meant to
 * be label-free (07-19s; the picker draws its own hover tooltips from the nations JSON above).
 * This docstring used to say "downscaled copy of thyrcross-labeled.png" and was never corrected by
 * the 07-19s fix, which is how TWO later re-registration passes (db79969, b114f7e) each silently
 * regenerated the labelled render and undid it. Audited 2026-07-27v: the committed jpg is labelled
 * again. Whether to regenerate it label-free is an open ruling — see the map defect row in
 * EDHA_FOUNDRY_TEST_CHECKLIST.md. Keep the aspect at canvas aspect (2236x2976 -> 0.7513).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "source-materials", "maps", "thyrcross.map.json"), "utf8"));
const out = {
  _generated: "scripts/build-map-picker-asset.js — DO NOT hand-edit; edit thyrcross.map.json and rerun",
  canvas_px: src.meta.canvas_px,
  nations: (src.nations ?? []).map(n => ({
    id: n.id, name: n.name, region: n.region ?? "", anchor_px: n.anchor_px ?? null, polygon: n.polygon ?? [],
  })).filter(n => Array.isArray(n.polygon) && n.polygon.length >= 3),
};
const dst = path.join(ROOT, "module-src", "assets", "thyrcross-nations.json");
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, JSON.stringify(out, null, 1) + "\n");
console.log(`✓ wrote ${path.relative(ROOT, dst)} (${out.nations.length} nations, canvas ${out.canvas_px.join("x")})`);
if (out.nations.length !== (src.nations ?? []).length)
  console.warn(`⚠ ${(src.nations ?? []).length - out.nations.length} nation(s) dropped for missing polygons — they will not be clickable on the map (dropdown fallback covers them).`);
