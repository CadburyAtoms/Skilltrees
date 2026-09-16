"""Spreadsheet -> JSON for the official heroic + Radiant talent list.

    python docs/analysis/talent-comparison/official-talents.py <outFile>

Reads `source-materials/legacy-uploads/CosmereRPG Talents.xlsx` (Sheet1: Path, Specialty, Name,
Action, Cost, Prerequisites, Description, Tags — 374 rows: 6 heroic paths x ~25, 9 Radiant orders x 25)
and writes one JSON list. Needs openpyxl. Written 2026-09-16.
"""
import json, os, sys
import openpyxl

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SRC = os.path.join(REPO, "source-materials", "legacy-uploads", "CosmereRPG Talents.xlsx")

def main(out):
    ws = openpyxl.load_workbook(SRC, read_only=True, data_only=True)["Sheet1"]
    rows = list(ws.iter_rows(values_only=True))
    hdr = [str(h) for h in rows[0]]
    talents = [dict(zip(hdr, r)) for r in rows[1:] if r and r[2]]
    with open(out, "w", encoding="utf-8") as f:
        json.dump(talents, f, indent=1, ensure_ascii=False)
    heroic = {"Agent", "Envoy", "Hunter", "Scholar", "Warrior", "Leader"}
    print("official talents", len(talents), "heroic", sum(1 for t in talents if t["Path"] in heroic),
          "radiant", sum(1 for t in talents if t["Path"] not in heroic))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(2)
    main(sys.argv[1])
