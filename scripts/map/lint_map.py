"""Gazetteer lint — keeps the map data and the campaign docs from drifting apart.

Checks (exit 1 on any ERROR):
  1. Gazetteer integrity: canvas matches thyrcross.png; every nation has an anchor
     inside the canvas (and inside its own polygon, if traced); cities/sites in-canvas.
  2. City-nation containment: warns when a city marker falls outside every polygon.
  3. Doc drift: every "(x, y)"-style coordinate in the campaign docs must be in-canvas,
     and coordinates that name a site line must match the gazetteer within tolerance.
  4. Hydrology laws (the 2026-07-23 continental pass; pure geometry, no elevation):
     every waterway's mouth ANCHORS (within tolerance of its declared lake shore /
     parent channel / pan rim; sea mouths anchor via their basin's outlet_px);
     ONE outlet per lake (no undeclared waterway heads leaving a shore) and closed
     lakes have none; a lake with an outlet lists inflows; the flow graph is a DAG
     terminating at sea / pan / closed lake; basins and members cross-reference.
     Settlement water-reference resolution reports as a WARNING summary until the
     post-hydrology settlement refinement re-places the water towns (audit S3).

Usage: python scripts/map/lint_map.py
"""
import math
import os
import re
import sys

from PIL import Image

import maplib

DOCS = ["EDHA_CAMPAIGN_CANON.md", "EDHA_CAMPAIGN_OPENING.md", "EDHA_SESSION_1_SCRIPT.md"]
COORD_RE = re.compile(r"\((\d{3,4}),\s?(\d{3,4})\)")
TOL_PX = 25
TOL_MOUTH_PX = 15    # mouths are load-bearing: they anchor within ~24 km
TOL_HEAD_PX = 12     # a head this close to a lake shore = an outlet claim
TOL_OUTLET_SRC_PX = 35  # outlet sources vs schematic grown shores (wider slop:
                        # canon polylines — e.g. the Palewater head — are never
                        # re-snapped, and lake shores are morphological schematics)
WATER_TOWN_KM = 15   # water-driver towns should resolve within this (warn tier)

errors, warnings = [], []


def seg_dist(p, a, b):
    """Distance from point p to segment a-b."""
    px, py = p
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    dd = dx * dx + dy * dy
    if dd == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dd))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def polyline_dist(p, pts, closed=False):
    """Distance from point p to a polyline (or closed polygon ring)."""
    if len(pts) < 2:
        return math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) if pts else 1e9
    best = 1e9
    n = len(pts)
    for i in range(n if closed else n - 1):
        best = min(best, seg_dist(p, pts[i], pts[(i + 1) % n]))
    return best


def lint_hydrology(gaz, kpp):
    lakes = {l["id"]: l for l in gaz.get("lakes", [])}
    ways = {w["id"]: w for w in gaz.get("waterways", [])}
    basins = {b["id"]: b for b in gaz.get("basins", [])}
    if not lakes and not basins:
        return  # pre-hydrology gazetteer

    # -- waterway shape + mouth anchoring -----------------------------------
    for w in ways.values():
        pts = w.get("polyline") or []
        if len(pts) < 2:
            errors.append(f"waterway {w['id']}: polyline missing or degenerate")
            continue
        if not w.get("flow"):
            errors.append(f"waterway {w['id']}: no flow direction")
        mouth = w.get("mouth")
        if not mouth:
            errors.append(f"waterway {w['id']}: no mouth declaration")
            continue
        tail = pts[-1]
        kind, ref = mouth.get("type"), mouth.get("ref")
        if kind == "lake":
            lake = lakes.get(ref)
            if lake is None:
                errors.append(f"waterway {w['id']}: mouth lake {ref!r} not found")
            elif polyline_dist(tail, lake["shore"], closed=True) > TOL_MOUTH_PX:
                errors.append(f"waterway {w['id']}: mouth {tail} not on "
                              f"{ref}'s shore (tol {TOL_MOUTH_PX}px)")
        elif kind == "waterway":
            parent = ways.get(ref)
            if parent is None:
                errors.append(f"waterway {w['id']}: mouth waterway {ref!r} not found")
            elif polyline_dist(tail, parent["polyline"]) > TOL_MOUTH_PX:
                errors.append(f"waterway {w['id']}: mouth {tail} not on "
                              f"{ref}'s channel (tol {TOL_MOUTH_PX}px)")
        elif kind == "pan":
            basin = basins.get(ref)
            pan = (basin or {}).get("pan")
            if pan is None:
                errors.append(f"waterway {w['id']}: mouth pan {ref!r} not found")
            else:
                cx, cy = pan["center"]
                e = (((tail[0] - cx) / pan["rx_px"]) ** 2
                     + ((tail[1] - cy) / pan["ry_px"]) ** 2)
                if e > 1.6:  # at/inside the schematic rim, with slop
                    errors.append(f"waterway {w['id']}: mouth {tail} not at the "
                                  f"pan rim of {ref}")
        elif kind == "sea":
            pass  # anchored via the basin outlet_px check below
        else:
            errors.append(f"waterway {w['id']}: unknown mouth type {kind!r}")

    # -- lake laws -----------------------------------------------------------
    for lake in lakes.values():
        outlet = lake.get("outlet")
        if lake.get("closed"):
            if outlet:
                errors.append(f"lake {lake['id']}: closed but declares outlet "
                              f"{outlet!r}")
        elif not outlet:
            errors.append(f"lake {lake['id']}: no outlet and not marked closed")
        if outlet:
            ow = ways.get(outlet)
            if ow is None:
                errors.append(f"lake {lake['id']}: outlet {outlet!r} not found")
            elif polyline_dist(ow["polyline"][0], lake["shore"],
                               closed=True) > TOL_OUTLET_SRC_PX:
                errors.append(f"lake {lake['id']}: outlet {outlet}'s source "
                              f"{ow['polyline'][0]} is not on the shore")
            inflows = [i for i in lake.get("inflows", []) if i in ways]
            if not inflows and not lake.get("headwater"):
                errors.append(f"lake {lake['id']}: has an outlet but no inflow "
                              f"waterways (lakes with outflows get inflows; "
                              f"mark true headwater lakes 'headwater')")
            for i in inflows:
                m = ways[i].get("mouth", {})
                if not (m.get("type") == "lake" and m.get("ref") == lake["id"]):
                    errors.append(f"lake {lake['id']}: inflow {i}'s mouth does "
                                  f"not reference it")
        # one outlet per lake: no undeclared head may leave the shore
        for w in ways.values():
            if w["id"] == outlet or not w.get("polyline"):
                continue
            if polyline_dist(w["polyline"][0], lake["shore"],
                             closed=True) <= TOL_HEAD_PX:
                errors.append(f"lake {lake['id']}: {w['id']} sources on the "
                              f"shore but is not the declared outlet (ONE "
                              f"outlet per lake)")

    # -- the flow graph is a DAG into sea / pan / closed lake ---------------
    def terminates(wid, seen):
        if wid in seen:
            return f"cycle via {wid}"
        seen = seen | {wid}
        w = ways[wid]
        kind = w["mouth"].get("type")
        ref = w["mouth"].get("ref")
        if kind in ("sea", "pan"):
            return None
        if kind == "lake":
            lake = lakes.get(ref)
            if lake is None:
                return f"missing lake {ref}"
            if lake.get("closed"):
                return None
            out = lake.get("outlet")
            return terminates(out, seen) if out in ways else f"missing outlet of {ref}"
        if kind == "waterway":
            return terminates(ref, seen) if ref in ways else f"missing waterway {ref}"
        return f"unknown mouth {kind}"
    for w in ways.values():
        if not w.get("mouth") or not w.get("polyline"):
            continue
        problem = terminates(w["id"], frozenset())
        if problem:
            errors.append(f"waterway {w['id']}: flow does not terminate ({problem})")

    # -- basin cross-references ---------------------------------------------
    for b in basins.values():
        for wid in b.get("waterways", []):
            if wid not in ways:
                errors.append(f"basin {b['id']}: member waterway {wid!r} not found")
            elif ways[wid].get("basin") != b["id"]:
                errors.append(f"basin {b['id']}: member {wid}'s basin field says "
                              f"{ways[wid].get('basin')!r}")
        for lid in b.get("lakes", []):
            if lid not in lakes:
                errors.append(f"basin {b['id']}: member lake {lid!r} not found")
        out = b.get("outlet_px")
        if b.get("kind") in ("closed", "endorheic", "coastal-fringe"):
            if out:
                errors.append(f"basin {b['id']}: kind {b['kind']} but has an "
                              f"outlet_px")
        elif b.get("kind") == "marine-outlet":
            if not out:
                errors.append(f"basin {b['id']}: marine-outlet without outlet_px")
            else:
                tails = [tuple(ways[wid]["polyline"][-1])
                         for wid in b.get("waterways", []) if wid in ways
                         and ways[wid].get("mouth", {}).get("type") == "sea"]
                if tails and min(math.hypot(out[0] - t[0], out[1] - t[1])
                                 for t in tails) > TOL_MOUTH_PX:
                    errors.append(f"basin {b['id']}: outlet_px {out} matches no "
                                  f"member sea-mouth tail")
    for w in ways.values():
        if w.get("basin") and w["basin"] not in basins:
            errors.append(f"waterway {w['id']}: basin {w['basin']!r} not found")

    # -- settlement water references (warn tier until the refinement pass) --
    towns = (gaz.get("market_towns") or {}).get("towns", [])
    features = []
    for w in ways.values():
        if w.get("polyline"):
            features.append((w["polyline"], False))
        for hole in w.get("waterholes", []):
            features.append(([hole], False))
    for lake in lakes.values():
        features.append((lake["shore"], True))
    unresolved = []
    for t in towns:
        if t.get("driver") != "water":
            continue
        p = t["px"]
        d = min(polyline_dist(p, pts, closed) for pts, closed in features)
        if d * kpp > WATER_TOWN_KM:
            unresolved.append((t["id"], round(d * kpp)))
    if unresolved:
        unresolved.sort(key=lambda x: -x[1])
        sample = ", ".join(f"{i} ({d} km)" for i, d in unresolved[:5])
        warnings.append(
            f"{len(unresolved)} water-driver towns resolve to no waterway/lake/"
            f"waterhole within {WATER_TOWN_KM} km (coast not checked; audit-S3 "
            f"class, re-placed at the settlement refinement). Worst: {sample}")

    unpainted = sum(1 for w in ways.values() if w.get("painted") is False)
    if unpainted:
        print(f"NOTE  {unpainted} derived waterway course(s) not yet painted — "
              f"guide layer: scripts/map/hydro_overlay.py")


def in_canvas(p, wh):
    return 0 <= p[0] < wh[0] and 0 <= p[1] < wh[1]


def main():
    gaz = maplib.load_gazetteer()
    wh = gaz["meta"]["canvas_px"]

    base = os.path.join(os.path.dirname(maplib.GAZETTEER), "thyrcross.png")
    if os.path.exists(base):
        size = list(Image.open(base).size)
        if size != wh:
            errors.append(f"canvas mismatch: gazetteer {wh} vs thyrcross.png {size}")
    else:
        warnings.append("thyrcross.png not found beside the gazetteer")

    for nat in gaz["nations"]:
        a = nat["anchor_px"]
        if not in_canvas(a, wh):
            errors.append(f"nation {nat['id']}: anchor {a} outside canvas")
        poly = nat.get("polygon")
        if not poly:
            warnings.append(f"nation {nat['id']}: no traced polygon")
        elif not maplib.point_in_poly(a, poly):
            errors.append(f"nation {nat['id']}: anchor {a} not inside its own polygon")

    for city in gaz["cities"]:
        if not in_canvas(city["px"], wh):
            errors.append(f"{city['id']}: {city['px']} outside canvas")
        elif maplib.nation_at(gaz, city["px"]) is None:
            warnings.append(f"{city['id']} at {city['px']} is outside every nation polygon")

    site_by_coord = {}
    unpainted = 0
    for site in gaz["sites"]:
        if not in_canvas(site["px"], wh):
            errors.append(f"site {site['id']}: {site['px']} outside canvas")
        site_by_coord[site["id"]] = tuple(site["px"])
        if "painted" not in site:
            errors.append(f"site {site['id']}: missing 'painted' flag (is it on Ben's "
                          f"Thycross.procreate yet? see scripts/map/paint_overlay.py)")
        elif not site["painted"]:
            unpainted += 1
    for city in gaz["cities"]:
        if city.get("name") and "painted" not in city:
            errors.append(f"{city['id']} ('{city['name']}'): named cities need a 'painted' "
                          f"flag too (the name isn't lettered on Ben's map until painted)")
    if unpainted:
        print(f"NOTE  {unpainted} site(s) not yet painted on Thycross.procreate — "
              f"regenerate the guide layer with scripts/map/paint_overlay.py")

    repo = maplib.REPO
    for doc in DOCS:
        path = os.path.join(repo, doc)
        if not os.path.exists(path):
            continue
        text = open(path, encoding="utf-8").read()
        for m in COORD_RE.finditer(text):
            p = (int(m.group(1)), int(m.group(2)))
            if not in_canvas(p, wh):
                # plenty of non-coordinate "(123, 456)" text could false-positive;
                # only flag pairs that LOOK like on-map coordinates gone out of range
                if 100 <= p[0] <= 9999 and 100 <= p[1] <= 9999:
                    warnings.append(f"{doc}: coordinate-looking pair {p} outside canvas")
                continue
            line = text[text.rfind("\n", 0, m.start()) + 1: m.start()]
            for site in gaz["sites"]:
                name = site.get("name") or site["id"]
                if name.lower() in line.lower():
                    gx, gy = site_by_coord[site["id"]]
                    if abs(p[0] - gx) > TOL_PX or abs(p[1] - gy) > TOL_PX:
                        errors.append(f"{doc}: '{name}' coordinate {p} drifted from gazetteer ({gx}, {gy})")

    lint_hydrology(gaz, gaz["meta"]["km_per_px"])

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"lint_map: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
