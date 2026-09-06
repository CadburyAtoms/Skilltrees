# Handoff: Actor Sheet Readability — "Readable Dark" (Option 1b)

## Overview
Readability pass on the cosmere-rpg actor sheet as themed by the **edha** module. The chosen direction (option **1b** in the design review) keeps the current dark layout and all cosmere-rpg chrome exactly as-is, and changes **only CSS custom values**: panels lifted from near-black navy to a slate blue, body text softened off pure white (kills halation), faded labels raised to AA contrast, and two font-size bumps (skill list, edha budget bar). It pairs with a small engine-side window-resize patch.

**No layout, markup, or template changes.** This should land as ~15 lines of CSS variable overrides in the edha module stylesheet plus the resize patch.

## About the Design Files
`Actor Page Options.dc.html` in this bundle is a **design reference created in HTML** — a prototype recreating the actor sheet to compare palettes. It is **not production code**. Do not copy its markup. The task is to apply the equivalent values inside the real codebase: locate the corresponding colors/sizes in the edha module's CSS (and, where edha doesn't already override them, add overrides scoped to the actor sheet) rather than editing the cosmere-rpg system files. The mock's asset paths (`src/assets/...`) mirror cosmere-rpg 2.0.4 asset paths and are for reference only.

## Fidelity
**High-fidelity for values, not for markup.** Every color and font-size below is final and should be matched exactly. The mock's DOM structure only approximates the real Handlebars templates — map each value by **semantic role** (listed below) onto whatever selector/variable the real CSS uses for that role.

## The Change: token-by-token (current → target)

Semantic roles, with the value currently rendered on the dark actor sheet and the new target value. Where cosmere-rpg already defines a CSS variable for the role, override the variable in edha's stylesheet (scoped to the actor sheet application); otherwise add a scoped rule.

### Sheet surface
- **Sheet background**: `#081127` + dark texture image → **`#1a2338`, texture image removed** (solid color; keep the top/bottom painted banners as-is)
- **Sheet border / metallic accent** (frame, corner masks, level ring, attribute-box borders): `#beaa8a` → **`#cbb995`**

### Panel / container fills (lightened one step, hue kept)
- **Raised panel**: `#1d2945` → **`#2d3a58`**
- **Recessed / input / attribute-box fill**: `#0d172f` → **`#212d48`**
- **Alternate row / secondary fill**: `#141d30` → **`#273452`**
- **Chip / tab fill**: `#21293d` → **`#323d58`**
- **Muted stroke / divider**: `#5b616e` → **`#7c86a0`**

### Text
- **Primary text**: `#ffffff` → **`#e8ebf3`** (from ~19:1 to ~13:1 against the new panels — removes halation on the light-on-dark serif)
- **Secondary text** (icons, small caps headers): `#f0f0e0` → **`#dcdac8`**
- **Faded labels** (diamond separators, skill attribute tags, placeholder text): `#857d6a` → **`#a89d82`** (was ~3.4:1, failing WCAG AA; target is ~6:1, passes AA)
- **Accent text**: `#beaa8a` → **`#cbb995`**

### Type-size bumps (the two failing sizes)
- **Skill-list text**: `10px` → **`11.5px`**
- **Edha budget bar** (Talents / Attr pts / Skill rnks strip + ⟳ Sync Talents button): `11px` → **`13.5px`**
- Everything else (name 48px, level 28px, section headers, etc.) unchanged.

### Edha overlay components
Budget bar strip:
- background: `rgba(0,0,0,0.35)` → **`rgba(0,0,0,0.28)`**
- text: `#c8bfa8` → **`#d8cfb6`**
- bottom hairline: `rgba(255,255,255,0.08)` → **`rgba(255,255,255,0.10)`**
- muted "0 / N" counters: `#777777` → **`#8a92a5`**
- over-budget counter stays `#f06060` (reads fine on the new bg)

⟳ Sync Talents button (and sibling ghost buttons):
- background: `rgba(255,255,255,0.06)` → **`rgba(255,255,255,0.08)`**
- border: `rgba(255,255,255,0.15)` → **`rgba(255,255,255,0.18)`**

Reserve pill (🩸 Reserve 2 / 3):
- background: `rgba(64,16,16,0.55)` → **`rgba(122,47,47,0.28)`**
- border: `rgba(122,47,47,0.55)` → **`rgba(160,80,80,0.6)`**
- text: `#c8bfa8` → **`#d8cfb6`**

## Engine-side patch (same PR)
Current actor sheet window is fixed at 850×1000. Also apply:
1. **`window.resizable: true`** in the actor sheet's application options.
2. **Vertical growth**: sheet content column should flex to fill the window height when the user drags it taller (no letterboxing / fixed inner height).
3. **Optional sheet-scale setting**: a client-scoped module setting (e.g. 90%–130%, default 100%) applying a uniform scale to the sheet content for users who want everything bigger, independent of the palette change.

## Interactions & Behavior
None change. Hover/active states, roll handlers, edha sync logic, rest buttons — all untouched. Verify hover states that lighten a panel fill still produce a visible delta against the new lighter fills; if a hover color was hardcoded relative to `#0d172f`-era fills, shift it up proportionally.

## Design Tokens (final palette summary)
- `#1a2338` sheet · `#2d3a58` / `#212d48` / `#273452` / `#323d58` panels · `#7c86a0` strokes
- `#cbb995` accent · `#a89d82` faded label · `#e8ebf3` primary text · `#dcdac8` secondary text · `#d8cfb6` budget text
- Fonts unchanged: Laski Sans (body), Penumbra Serif Std / SC (display) — already in cosmere-rpg.

## Assets
No new assets. One asset **removed from use** on the dark theme: the sheet background texture image (`texture_sheet_cosmere_dark.webp`-equivalent) — sheet becomes solid `#1a2338`. Banners and all SVG masks/icons unchanged.

## Files in this bundle
- `README.md` — this spec (self-sufficient; implement from this)
- `option-1b-readable-dark.png` — screenshot of the selected direction. **Caveat:** the capture flattens CSS `mask:` shapes into solid squares (level badge, corner ornaments, resource bars) — those are ornament artifacts, not design changes; all masked chrome keeps its current shapes. Trust it for palette, contrast, and type sizes.
- `Actor Page Options.dc.html` — the design review file. Option `1a` = current baseline, `1b` = the selected target, `1c` = a rejected light-parchment direction. Search for `id="1b"` to find the target's CSS variable block; the `--*` variable names in it are mock shorthand for the semantic roles above, not real repo names.
