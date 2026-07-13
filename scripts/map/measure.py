"""Query the Thyrcross gazetteer: distances, travel times, and locate-a-point.

Usage:
  python scripts/map/measure.py dist --from elmsworth --to withervale [--via border-river] [--mode barge_down]
  python scripts/map/measure.py route session-1-relief-run
  python scripts/map/measure.py locate --at 1400,2280
  python scripts/map/measure.py list
"""
import argparse

import maplib


def fmt_km(km):
    return f"{km:,.0f} km ({km * 0.621371:,.0f} mi)"


def days_line(gaz, km, mode=None):
    modes = gaz["meta"]["travel_modes_km_per_day"]
    out = []
    for m, speed in modes.items():
        if m.startswith("_"):
            continue
        if mode and m != mode:
            continue
        out.append(f"{m} {km / speed:.1f} d")
    return " | ".join(out)


def leg_km(gaz, frm, to, via=None):
    kpp = gaz["meta"]["km_per_px"]
    _, _, a = maplib.find_place(gaz, frm)
    _, _, b = maplib.find_place(gaz, to)
    straight = maplib.dist_px(a, b) * kpp
    if via:
        wway = next(w for w in gaz["waterways"] if w["id"] == via)
        along, offa, offb = maplib.along_polyline_px(wway["polyline"], a, b)
        return straight, along * kpp, (offa * kpp, offb * kpp), wway
    return straight, None, None, None


def cmd_dist(gaz, args):
    straight, along, offs, wway = leg_km(gaz, args.frm, args.to, args.via)
    print(f"{args.frm} -> {args.to}")
    print(f"  straight-line: {fmt_km(straight)}   [{days_line(gaz, straight, args.mode)}]")
    if along is not None:
        print(f"  along {wway['id']}: {fmt_km(along)}   [{days_line(gaz, along, args.mode)}]")
        print(f"  (endpoints sit {offs[0]:.0f} km / {offs[1]:.0f} km off the channel)")


def cmd_route(gaz, args):
    route = next(r for r in gaz["routes"] if r["id"] == args.route_id)
    mode = route.get("mode")
    via = route.get("via")
    total_straight = total_along = 0.0
    print(f"route {route['id']} ({route.get('name', '')}), mode={mode}")
    for frm, to in route["legs"]:
        straight, along, offs, _ = leg_km(gaz, frm, to, via)
        total_straight += straight
        line = f"  {frm} -> {to}: {fmt_km(straight)} straight"
        if along is not None:
            total_along += along
            line += f", {fmt_km(along)} along channel"
        print(line)
    print(f"  TOTAL straight: {fmt_km(total_straight)}   [{days_line(gaz, total_straight, mode)}]")
    if via:
        print(f"  TOTAL along:    {fmt_km(total_along)}   [{days_line(gaz, total_along, mode)}]")


def cmd_locate(gaz, args):
    p = tuple(int(v) for v in args.at.split(","))
    kpp = gaz["meta"]["km_per_px"]
    nat = maplib.nation_at(gaz, p)
    print(f"({p[0]}, {p[1]}):")
    print(f"  nation: {nat['name'] + ' (' + nat['map_letter'] + ')' if nat else 'none (sea / unclaimed)'}")
    places = [("site", s, tuple(s["px"])) for s in gaz["sites"]]
    places += [("city", c, tuple(c["px"])) for c in gaz["cities"]]
    places.sort(key=lambda t: maplib.dist_px(t[2], p))
    for kind, obj, q in places[:3]:
        d = maplib.dist_px(q, p) * kpp
        print(f"  nearest {kind}: {obj.get('name', obj['id'])} at {q}, {fmt_km(d)}")
    for wway in gaz["waterways"]:
        _, off = maplib.nearest_vertex(wway["polyline"], p)
        print(f"  {wway['id']}: {fmt_km(off * kpp)} away")


def cmd_list(gaz, _args):
    print("nations:", ", ".join(f"{n['map_letter']}={n['id']}" for n in gaz["nations"]))
    print("sites:  ", ", ".join(s["id"] for s in gaz["sites"]))
    print("waterways:", ", ".join(w["id"] for w in gaz["waterways"]) or "(none)")
    print("routes: ", ", ".join(r["id"] for r in gaz["routes"]) or "(none)")
    print(f"cities: {len(gaz['cities'])} markers")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("dist")
    d.add_argument("--from", dest="frm", required=True)
    d.add_argument("--to", required=True)
    d.add_argument("--via", help="waterway id for along-channel distance")
    d.add_argument("--mode", help="only show this travel mode")
    r = sub.add_parser("route")
    r.add_argument("route_id")
    l = sub.add_parser("locate")
    l.add_argument("--at", required=True, help="x,y full-res px")
    sub.add_parser("list")
    args = ap.parse_args()
    gaz = maplib.load_gazetteer()
    {"dist": cmd_dist, "route": cmd_route, "locate": cmd_locate, "list": cmd_list}[args.cmd](gaz, args)


if __name__ == "__main__":
    main()
