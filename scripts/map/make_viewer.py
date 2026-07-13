"""Generate the click-to-coordinate map viewer (single self-contained HTML file).

Writes source-materials/maps/viewer.html with the gazetteer inlined (file:// blocks
fetch(), so the JSON is embedded at build time; the PNGs load as relative <img> tags,
which file:// allows). Open it by double-clicking — no server needed.

Features: pan (drag) / zoom (wheel), layer toggles (political fills, drawn borders,
city markers), live cursor readout (px + nation via point-in-polygon), click to pin a
coordinate and copy it as "(x, y)" for pasting into chat/docs.

Usage: python scripts/map/make_viewer.py
"""
import json
import os

import maplib

TEMPLATE = """<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Thyrcross map viewer</title>
<style>
 html,body{margin:0;height:100%;background:#10131c;color:#dde;font:14px/1.4 system-ui,sans-serif;overflow:hidden}
 #hud{position:fixed;top:0;left:0;right:0;z-index:10;background:#151a26ee;border-bottom:1px solid #2a3350;
      padding:8px 14px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
 #hud b{color:#ffd24d}
 #readout{font-family:ui-monospace,Consolas,monospace;min-width:340px}
 #pin{font-family:ui-monospace,Consolas,monospace;color:#7fd7ff}
 label{user-select:none;cursor:pointer}
 button{background:#2a3350;color:#dde;border:1px solid #3d4a75;border-radius:4px;padding:3px 10px;cursor:pointer}
 #stage{position:absolute;inset:0;top:46px;overflow:hidden;cursor:grab}
 #world{position:absolute;transform-origin:0 0}
 #world img{position:absolute;top:0;left:0;display:block;image-rendering:auto;pointer-events:none}
 #marker{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border:3px solid #ff3b3b;border-radius:50%;
         box-shadow:0 0 6px #000;pointer-events:none;display:none}
</style></head><body>
<div id="hud">
 <b>Thyrcross</b>
 <span id="readout">move the mouse over the map…</span>
 <label><input type="checkbox" id="tg-pol" checked> political</label>
 <label><input type="checkbox" id="tg-bor"> borders</label>
 <label><input type="checkbox" id="tg-cit"> cities</label>
 <span id="pin"></span>
 <button id="copy" style="display:none">copy (x, y)</button>
</div>
<div id="stage">
 <div id="world">
  <img id="base" src="thyrcross.png">
  <img id="pol" src="thyrcross-political.png" style="opacity:.35">
  <img id="bor" src="thyrcross-borders.png" style="display:none">
  <img id="cit" src="thyrcross-cities.png" style="display:none">
  <div id="marker"></div>
 </div>
</div>
<script>
const GAZ = __GAZETTEER__;
const KPP = GAZ.meta.km_per_px;
const stage = document.getElementById('stage'), world = document.getElementById('world');
const readout = document.getElementById('readout'), pinEl = document.getElementById('pin');
const marker = document.getElementById('marker'), copyBtn = document.getElementById('copy');
let scale = 0.35, ox = 20, oy = 20, panning = false, px0, py0, moved = 0, pinned = null;

function apply(){ world.style.transform = `translate(${ox}px,${oy}px) scale(${scale})`; }
apply();

function toMap(e){
  const r = stage.getBoundingClientRect();
  return [ (e.clientX - r.left - ox) / scale, (e.clientY - r.top - oy) / scale ];
}
function inPoly(p, poly){
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function nationAt(p){
  for (const n of GAZ.nations) if (n.polygon && inPoly(p, n.polygon)) return n;
  return null;
}
stage.addEventListener('mousedown', e => { panning = true; moved = 0; px0 = e.clientX; py0 = e.clientY; stage.style.cursor = 'grabbing'; });
window.addEventListener('mouseup', () => { panning = false; stage.style.cursor = 'grab'; });
window.addEventListener('mousemove', e => {
  if (panning){
    ox += e.clientX - px0; oy += e.clientY - py0;
    moved += Math.abs(e.clientX - px0) + Math.abs(e.clientY - py0);
    px0 = e.clientX; py0 = e.clientY; apply();
  }
  const [x, y] = toMap(e);
  if (x < 0 || y < 0 || x > GAZ.meta.canvas_px[0] || y > GAZ.meta.canvas_px[1]){ return; }
  const n = nationAt([x, y]);
  readout.textContent = `(${Math.round(x)}, ${Math.round(y)})  ·  ${(x*KPP).toFixed(0)},${(y*KPP).toFixed(0)} km  ·  ` + (n ? `${n.name} (${n.map_letter})` : 'open water');
});
stage.addEventListener('click', e => {
  if (moved > 6) return;             // it was a pan, not a click
  const [x, y] = toMap(e);
  pinned = [Math.round(x), Math.round(y)];
  marker.style.display = 'block'; marker.style.left = x + 'px'; marker.style.top = y + 'px';
  const n = nationAt([x, y]);
  pinEl.textContent = `pinned (${pinned[0]}, ${pinned[1]})` + (n ? ` in ${n.name}` : '');
  copyBtn.style.display = 'inline-block';
});
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(`(${pinned[0]}, ${pinned[1]})`);
  copyBtn.textContent = 'copied!'; setTimeout(() => copyBtn.textContent = 'copy (x, y)', 900);
});
stage.addEventListener('wheel', e => {
  e.preventDefault();
  const [mx, my] = toMap(e);
  const f = e.deltaY < 0 ? 1.15 : 1/1.15;
  scale = Math.min(4, Math.max(0.08, scale * f));
  const r = stage.getBoundingClientRect();
  ox = e.clientX - r.left - mx * scale; oy = e.clientY - r.top - my * scale;
  apply();
}, { passive: false });
document.getElementById('tg-pol').onchange = e => document.getElementById('pol').style.display = e.target.checked ? '' : 'none';
document.getElementById('tg-bor').onchange = e => document.getElementById('bor').style.display = e.target.checked ? '' : 'none';
document.getElementById('tg-cit').onchange = e => document.getElementById('cit').style.display = e.target.checked ? '' : 'none';
</script></body></html>
"""


def main():
    gaz = maplib.load_gazetteer()
    out = os.path.join(os.path.dirname(maplib.GAZETTEER), "viewer.html")
    html = TEMPLATE.replace("__GAZETTEER__", json.dumps(gaz, ensure_ascii=False))
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print(f"viewer -> {out}  (open by double-clicking; regenerate after gazetteer changes)")


if __name__ == "__main__":
    main()
