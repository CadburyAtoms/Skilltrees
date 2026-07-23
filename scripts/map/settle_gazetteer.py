#!/usr/bin/env python3
"""settle_gazetteer.py — commit the world settlement layer with populations.

The ruling-161 close: frontier/points-of-light saturation — the mapped
settlement layer is ~complete (~10% unmapped hamlets), and national populations
derive BOTTOM-UP from it (derived-beats-prose, Ben's method ruling 159):

  towns_total = N x avg_town_size (dial)   [Zipf-spread 2-10k, key towns inflated]
  national    = (towns_total + cities_total) / 0.9

Reads the world_settlement sidecar + gazetteer, assigns per-town populations
(rank-size within the 2-10k market band; water/junction towns rank first —
"inflate the key ones", Ben 2026-07-22), rewrites `market_towns`, adds
`meta.population_ledgers`, and updates each nation's `land_budget`.

Usage: python scripts/map/settle_gazetteer.py <world-sidecar.json> [--write]
Without --write it prints the before/after table and touches nothing.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GAZ = ROOT / "source-materials/maps/thyrcross.map.json"

# City-tier totals per nation. thalendor/corvaine are the walked rosters
# (rulings 151/152); the rest are PROVISIONAL (flagged) pending their passes.
CITY_TOTALS = {
    "thalendor": (116_000, "ruling 151 roster (Heartholt 50k, Elmsworth 18k, city-21 14k, city-30/32 12k, city-33 10k)"),
    "corvaine": (241_000, "ruling 152 roster (Aldercourt 100k, city-22 30k, city-13 22k, city-10 18k, city-31 15k, +4 mints)"),
    "malcurr": (100_000, "PROVISIONAL - 4 glyphs (Kenmere, Brandmere +2), sizes unwalked"),
    "lunavar": (50_000, "PROVISIONAL - 2 glyphs, sizes unwalked"),
    "goldenport": (120_000, "PROVISIONAL - 3 glyphs (Goldenport city +2), sizes unwalked"),
    "canticle": (70_000, "PROVISIONAL - Arcanta + Portavere, sizes unwalked"),
    "vorsk": (25_000, "PROVISIONAL - Kragmoot +1, sizes unwalked"),
    "kettavar": (14_000, "PROVISIONAL - Maelstrand + city-02, sizes unwalked"),
}
AVG_TOWN = {"thalendor": 3000, "corvaine": 4000, "malcurr": 3500, "lunavar": 3000,
            "goldenport": 4000, "canticle": 3000, "vorsk": 3000, "kettavar": 2500}
DRIVER_RANK = {"water": 0, "junction": 0, "specialty": 1, "fort": 2, "shrine": 2}
BAND = (2000, 10000)
UNMAPPED = 0.10          # hamlet share (ruling 161)
SEED = 161


def zipf_sizes(n, total, rng):
    """Rank-size populations in the market band summing EXACTLY to total."""
    raw = [(i + 1) ** -0.6 for i in range(n)]
    lo_c, hi_c = 1.0, 1e7
    for _ in range(60):
        c = (lo_c + hi_c) / 2
        s = sum(min(BAND[1], max(BAND[0], c * r)) for r in raw)
        if s < total:
            lo_c = c
        else:
            hi_c = c
    sizes = [min(BAND[1], max(BAND[0], round((lo_c + hi_c) / 2 * r / 50) * 50))
             for r in raw]
    sizes[0] += total - sum(sizes)   # close exactly on the top town
    return sizes


def main():
    sidecar = json.load(open(sys.argv[1]))
    write = "--write" in sys.argv
    gaz = json.load(open(GAZ))
    rng = random.Random(SEED)

    towns_by_nation = {}
    for t in sidecar["towns"]:
        towns_by_nation.setdefault(t["nation"], []).append(t)

    ledgers, all_towns = {}, []
    print(f"{'nation':<12}{'towns':>6}{'town pop':>10}{'cities':>9}{'villages':>10}"
          f"{'NATIONAL':>10}  old (r85)")
    OLD = {"thalendor": "14.5M", "corvaine": "18.0M", "malcurr": "7.8M",
           "lunavar": "11.6M", "goldenport": "13.2M", "canticle": "8.0M",
           "vorsk": "3.2M", "kettavar": "780k"}
    for nation, towns in sorted(towns_by_nation.items()):
        towns.sort(key=lambda t: (DRIVER_RANK[t["driver"]], rng.random()))
        towns_total = len(towns) * AVG_TOWN[nation]
        sizes = zipf_sizes(len(towns), towns_total, rng)
        for t, s in zip(towns, sizes):
            t["pop"] = s
        cities_total, cities_basis = CITY_TOTALS[nation]
        mapped = towns_total + cities_total
        national = round(mapped / (1 - UNMAPPED) / 1000) * 1000
        villages = national - mapped
        ledgers[nation] = {
            "cities_total": cities_total, "cities_basis": cities_basis,
            "towns": len(towns), "towns_total": towns_total,
            "villages_unmapped_est": villages, "national_total": national,
            "_basis": "ruling 161: bottom-up from the settlement layer; frontier "
                      "saturation, ~10% unmapped hamlets; town sizes rank-size in "
                      "the 2-10k market band, key (water/junction) towns inflated",
        }
        all_towns.extend(towns)
        print(f"{nation:<12}{len(towns):>6}{towns_total:>10,}{cities_total:>9,}"
              f"{villages:>10,}{national:>10,}  {OLD[nation]}")

    total = sum(v["national_total"] for v in ledgers.values())
    print(f"{'CONTINENT':<12}{sum(len(t) for t in towns_by_nation.values()):>6}"
          f"{'':>10}{'':>9}{'':>10}{total:>10,}  ~83M")

    if not write:
        print("\n(dry run - pass --write to update the gazetteer)")
        return

    towns_out = []
    for i, t in enumerate(sorted(all_towns, key=lambda t: (t["nation"], -t["pop"])), 1):
        row = {"id": f"mt-{i:03d}", "px": t["px"], "nation": t["nation"],
               "driver": t["driver"], "pop": t["pop"]}
        if t.get("seed"):
            row["palewater_region"] = True
        towns_out.append(row)
    gaz["market_towns"] = {
        "_basis": "Ruling 161 world settlement layer (world_settlement.py + "
                  "settle_gazetteer.py, seeds 157/161): every nation's full mapped "
                  "roster, driver-tagged (r155/157), populations rank-size 2-10k "
                  "summing to the ledger. palewater_region=true rows carry the "
                  "region-canvas provenance (draft-4 west-bank pass). ashkar + "
                  "sylvaneth pending their walks. Unnamed; ruling-118 naming "
                  "passes label session-relevant subsets.",
        "towns": towns_out,
    }
    gaz["meta"]["population_ledgers"] = {
        "_note": "Ruling 161: cities + towns + villages_unmapped = national, "
                 "EXACT. Frontier/points-of-light saturation (~0.8/km2 "
                 "continental). Supersedes the ruling-85 land-budget populations "
                 "(rulings 26/27/85 method retired by the 2026-07-22 audit - see "
                 "lore-forge Phase 4b demand-side ledger).",
        **ledgers,
    }
    for nat in gaz["nations"]:
        if nat["id"] in ledgers:
            lb = nat.setdefault("land_budget", {})
            lb["population"] = ledgers[nat["id"]]["national_total"]
            lb["population_basis"] = (
                "ruling 161 bottom-up (settlement layer / frontier saturation); "
                "supersedes the ruling-85 top-down figure. Clearing now derives "
                "FROM population (demand-side ledger, lore-forge Phase 4b).")
    json.dump(gaz, open(GAZ, "w"), indent=1)
    print(f"\nwrote {GAZ}: {len(towns_out)} towns, {len(ledgers)} ledgers")


if __name__ == "__main__":
    main()
