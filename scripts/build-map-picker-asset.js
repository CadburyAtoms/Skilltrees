#!/usr/bin/env node
/* Generate the creation wizard's map-picker data asset (2026-07-19, Ben's bench ruling:
 * the "Where are you from?" step becomes a Thyrcross map).
 *
 *   node scripts/build-map-picker-asset.js
 *
 * Reads THE map truth (source-materials/maps/thyrcross.map.json) and writes
 * module-src/assets/thyrcross-nations.json: canvas size + per-nation name/region/polygon.
 * Everything is data-derived — the hover line is the map's own `region` field. The image half
 * of the asset (assets/thyrcross-map.jpg) is a downscaled copy of thyrcross-labeled.png,
 * regenerated only when the labeled map changes (see the delta that introduced it).
 * Deterministic output — commit the result; module-src-sync.js pushes both to the live module.
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
