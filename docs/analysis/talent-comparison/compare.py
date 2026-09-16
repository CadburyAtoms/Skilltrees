"""The comparison tables: Mistborn (Allomancy / Feruchemy / Metalborn paths), Radiant, official
heroic, and Edha's three atlases.

    python docs/analysis/talent-comparison/compare.py <mistborn-talents.json> <official-talents.json> <all-talents.json>

Prints C.1 action mix, C.2 cost, C.3 damage, C.4 depth / gating, and the per-tree appendix of
`docs/analysis/talent-comparison-mistborn-radiant.md`. Written 2026-09-16.
"""
import collections, json, re, sys

ACT = {"∞": "Passive", "Passive": "Passive", "◇": "Free", "Free Action": "Free", "★": "Special", "Special": "Special",
       "⟲": "Reaction", "Reaction": "Reaction", "1 Action": "1 Action", "Action": "1 Action",
       "2 Actions": "2 Actions", "3 Actions": "3 Actions"}
COLS = ["Passive", "Special", "1 Action", "2 Actions", "3 Actions", "Free", "Reaction"]
HEROIC = {"Agent", "Envoy", "Hunter", "Scholar", "Warrior", "Leader"}
DICE = re.compile(r"\b\d+d\d+\b")

def pct(n, d): return round(100 * n / d) if d else 0

# --- Mistborn -------------------------------------------------------------------------------------
def mb_action(r):
    a, ct, cv = r["activationType"], r["costType"], r["costValue"]
    if a in (None, "none"): return "Passive"
    if ct == "spe" or ct in (None, "none"): return "Special"
    if ct == "rea": return "Reaction"
    if ct == "fre": return "Free"
    return {1: "1 Action", 2: "2 Actions", 3: "3 Actions"}.get(cv, "1 Action")

def mb_families(M):
    T = M["talents"]
    return [("Mistborn — Allomancy", [r for r in T if r["art"] == "Allomancy"], mb_action),
            ("Mistborn — Feruchemy", [r for r in T if r["art"] == "Feruchemy"], mb_action),
            ("Mistborn — Metalborn paths", [r for r in T if r["pack"] == "metalborn-paths"], mb_action)]

# --- spreadsheet ------------------------------------------------------------------------------------
def xl_action(r): return ACT.get(str(r["Action"]).strip(), "Special")
def xl_families(X):
    return [("Radiant", [t for t in X if t["Path"] not in HEROIC], xl_action),
            ("Official heroic", [t for t in X if t["Path"] in HEROIC], xl_action)]

# --- Edha -------------------------------------------------------------------------------------------
def ed_action(r): return ACT.get((r["action"] or "").strip(), "Special")
def ed_families(A):
    return [("Edha leyline", [r for r in A if r["atlas"] == "leyline"], ed_action),
            ("Edha deity", [r for r in A if r["atlas"] == "deity"], ed_action),
            ("Edha heroic", [r for r in A if r["atlas"] == "heroic"], ed_action)]

def c1(families):
    print("\n== C.1 action mix (% of n) ==")
    print("family | n | " + " | ".join(COLS) + " | Pass+Spec")
    for name, rows, f in families:
        c = collections.Counter(f(r) for r in rows); n = len(rows)
        print(f"{name} | {n} | " + " | ".join(str(pct(c[k], n)) for k in COLS) + f" | {pct(c['Passive'] + c['Special'], n)}")

def c2(M, X, A):
    print("\n== C.2 cost ==")
    for name, rows, _ in mb_families(M):
        costed = [r for r in rows if r["consumption"]]
        by = collections.Counter(c["resource"] or c["type"] for r in costed for c in r["consumption"])
        print(f"{name}: costed {pct(len(costed), len(rows))}% — " + ", ".join(f"{k} {pct(v, len(rows))}%" for k, v in by.most_common()))
    for name, rows, _ in xl_families(X):
        costed = [t for t in rows if t["Cost"] not in (None, "None", "")]
        by = collections.Counter(str(t["Cost"]) for t in costed)
        print(f"{name}: costed {pct(len(costed), len(rows))}% — " + ", ".join(f"{k} {pct(v, len(rows))}%" for k, v in by.most_common(8)))
    for name, rows, _ in ed_families(A):
        costed = [r for r in rows if r.get("consumes")]
        by = collections.Counter(f'{c["resource"]}{c["value"]["min"]}' for r in costed for c in r["consumes"])
        print(f"{name}: costed {pct(len(costed), len(rows))}% — " + ", ".join(f"{k} {pct(v, len(rows))}%" for k, v in by.most_common(8)))

def c3(M, X, A):
    print("\n== C.3 damage ==")
    for name, rows, _ in mb_families(M):
        f = [r for r in rows if r["damageFormula"]]
        dice = collections.Counter(m for r in rows for m in DICE.findall(r["description"]))
        print(f"{name}: formulas {len(f)}/{len(rows)} {[ (r['name'], r['damageFormula']) for r in f ]}; prose 'damage' {sum(1 for r in rows if re.search(r'\bdamage\b', r['description'], re.I))}; dice {dice.most_common(6)}")
    for name, rows, _ in xl_families(X):
        dice = collections.Counter(m for t in rows for m in DICE.findall(t["Description"] or ""))
        print(f"{name}: prose 'damage' {sum(1 for t in rows if re.search(r'\bdamage\b', t['Description'] or '', re.I))}/{len(rows)}; dice {dice.most_common(6)}")
    for name, rows, _ in ed_families(A):
        f = [r for r in rows if r["isDamageFormula"]]; h = [r for r in rows if r["isHealFormula"]]
        print(f"{name}: damage formulas {len(f)}/{len(rows)}, heal {len(h)}; formulas {collections.Counter(r['damageFormula'] for r in f).most_common(5)}")

def c4(M, X, A):
    print("\n== C.4 depth and gating ==")
    # Mistborn: depth through managed talent prerequisites inside each tree; rank gates from skill prereqs
    depth, rank = [], []
    for t in M["trees"]:
        nodes = {n["talentId"]: n for n in t["nodes"].values() if n.get("type") == "talent"}
        def d(tid, seen=()):
            n = nodes.get(tid); best = 0
            for p in (n.get("prerequisites") or {}).values() if n else []:
                if p.get("type") == "talent":
                    for tk in (p.get("talents") or {}):
                        if tk in nodes and tk not in seen: best = max(best, 1 + d(tk, seen + (tid,)))
            return best
        for tid, n in nodes.items():
            depth.append(d(tid))
            rank.append(max([p.get("rank", 0) for p in (n.get("prerequisites") or {}).values() if p.get("type") == "skill"], default=0))
    print("Mistborn depth", sorted(collections.Counter(depth).items()), "| skill-rank gate", sorted(collections.Counter(rank).items()))
    rad = [t for t in X if t["Path"] not in HEROIC]; byname = {t["Name"]: t for t in rad}
    def rd(t, seen=()):
        best = 0
        for part in re.split(r";|,| or ", str(t["Prerequisites"] or "")):
            part = part.strip()
            if part in byname and part not in seen: best = max(best, 1 + rd(byname[part], seen + (t["Name"],)))
        return best
    print("Radiant depth", sorted(collections.Counter(rd(t) for t in rad).items()),
          "| ideal-gated", sum(1 for t in rad if "Ideal" in str(t["Prerequisites"])), "| talent-gated", sum(1 for t in rad if rd(t) > 0))
    for name, rows, _ in ed_families(A):
        print(f"{name} depth", sorted(collections.Counter(r["depth"] for r in rows).items()),
              "| earliest level", sorted(collections.Counter(r["earliestLevel"] for r in rows).items()))

def appendix(A):
    print("\n== Appendix: per Edha tree ==")
    print("tree | n | Pass% | Spec% | 1A | 2A | 3A | Free | Reac | costed% | inv | foc | dmgF | healF | avgDepth | maxDepth | L6")
    for tree in sorted(set(r["tree"] for r in A), key=lambda t: (t.split("/")[0], t)):
        rs = [r for r in A if r["tree"] == tree]; n = len(rs)
        c = collections.Counter(ed_action(r) for r in rs)
        costed = sum(1 for r in rs if r.get("consumes"))
        inv = sum(cc["value"]["min"] for r in rs for cc in (r.get("consumes") or []) if cc["resource"] == "inv")
        foc = sum(cc["value"]["min"] for r in rs for cc in (r.get("consumes") or []) if cc["resource"] == "foc")
        print(f"{tree} | {n} | {pct(c['Passive'], n)} | {pct(c['Special'], n)} | {c['1 Action']} | {c['2 Actions']} | {c['3 Actions']} | {c['Free']} | {c['Reaction']} | {pct(costed, n)} | {inv} | {foc} | "
              f"{sum(1 for r in rs if r['isDamageFormula'])} | {sum(1 for r in rs if r['isHealFormula'])} | {round(sum(r['depth'] for r in rs) / n, 2)} | {max(r['depth'] for r in rs)} | {sum(1 for r in rs if r['earliestLevel'] >= 6)}")

def main(mb, xl, ed):
    M = json.load(open(mb, encoding="utf-8")); X = json.load(open(xl, encoding="utf-8")); A = json.load(open(ed, encoding="utf-8"))
    c1(mb_families(M) + xl_families(X) + ed_families(A)); c2(M, X, A); c3(M, X, A); c4(M, X, A); appendix(A)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(2)
    main(*sys.argv[1:])
