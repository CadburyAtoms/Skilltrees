"""Flatten the Mistborn Handbook packs into one talent table for the comparison.
usage: python flatten-mistborn.py <jsonDir> <outFile>
"""
import json, re, sys, collections, html

src, out = sys.argv[1], sys.argv[2]

def strip_html(s):
    if not s: return ""
    s = re.sub(r"@UUID\[[^\]]*\]\{([^}]*)\}", r"\1", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()

def load(pack):
    d = json.load(open(f"{src}/{pack}.json", encoding="utf-8"))
    folders = {f["value"]["_id"]: f["value"] for f in d.get("folders", [])}
    def fpath(fid):
        out = []
        while fid and fid in folders:
            out.append(folders[fid]["name"]); fid = folders[fid].get("folder")
        return list(reversed(out))
    items = [i["value"] for i in d.get("items", [])]
    return items, fpath

def _rules(s):
    ev = s.get("events") or {}
    return list(ev.values()) if isinstance(ev, dict) else list(ev)

rows = []
trees = []
powers = []
for pack in ("metallic-arts", "metalborn-paths"):
    items, fpath = load(pack)
    byid = {i["_id"]: i for i in items}
    for it in items:
        s = it.get("system", {})
        path = fpath(it.get("folder"))
        if it["type"] == "talent_tree":
            nodes = s.get("nodes", {})
            trees.append({"pack": pack, "name": it["name"], "folder": path, "nodeCount": len(nodes), "nodes": nodes})
            continue
        if it["type"] == "power":
            powers.append({"pack": pack, "name": it["name"], "folder": path, "system": {k: s.get(k) for k in ("id", "type", "skill", "attribute", "die", "effectSize", "linkedSkills", "resources", "description") if k in s}})
            continue
        if it["type"] != "talent":
            continue
        emb = (s.get("__embedded") or {}).get("items") or []
        actions = [e for e in emb if e.get("type") == "action"]
        act = actions[0]["system"] if actions else None
        top_act = s.get("activation")
        top_dmg = s.get("damage")
        activation = (act or {}).get("activation") or top_act or {}
        damage = (act or {}).get("damage") or top_dmg or {}
        skilltest = (act or {}).get("skillTest") or {}
        cons = activation.get("consumption") or activation.get("consume") or []
        prereqs = s.get("prerequisites") or {}
        rel = s.get("relationships") or {}
        rows.append({
            "pack": pack,
            "name": it["name"],
            "folder": "/".join(path),
            "art": path[1] if len(path) > 1 and path[1] in ("Allomancy", "Feruchemy") else (path[2] if len(path) > 2 and path[2] in ("Allomancy", "Feruchemy") else ""),
            "metal": path[0] if pack == "metallic-arts" else "",
            "metalbornPath": path[0] if pack == "metalborn-paths" else "",
            "talentType": s.get("type"),
            "shape": "embedded" if actions else ("top-level" if top_act else "none"),
            "actionCount": len(actions),
            "activationType": activation.get("type"),
            "costValue": (activation.get("cost") or {}).get("value"),
            "costType": (activation.get("cost") or {}).get("type"),
            "consumption": [{"type": c.get("type"), "resource": c.get("resource"), "value": c.get("value")} for c in cons],
            "damageFormula": damage.get("formula"),
            "damageType": damage.get("type"),
            "skill": skilltest.get("skill") or (act or {}).get("skill") or top_act and top_act.get("skill"),
            "plotDie": skilltest.get("plotDie"),
            "modality": s.get("modality"),
            "eventsCount": len(_rules(s)),
            "events": [{"event": r.get("event"), "handler": (r.get("handler") or {}).get("type")} for r in _rules(s)],
            "effectsCount": len(it.get("effects") or []),
            "linkedSkills": s.get("linkedSkills"),
            "prerequisites": prereqs,
            "relationships": rel,
            "description": strip_html((s.get("description") or {}).get("value", "")),
            "_id": it["_id"],
        })

json.dump({"talents": rows, "trees": trees, "powers": powers}, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

print("talents", len(rows), "trees", len(trees), "powers", len(powers))
print("shape:", collections.Counter((r["pack"], r["shape"]) for r in rows).most_common())
print("art:", collections.Counter(r["art"] for r in rows).most_common())
print("activationType:", collections.Counter(str(r["activationType"]) for r in rows).most_common())
print("costType:", collections.Counter(f'{r["costValue"]} {r["costType"]}' for r in rows).most_common())
print("consumption resources:", collections.Counter(str([c["resource"] for c in r["consumption"]]) for r in rows).most_common(10))
print("damage formulas:", collections.Counter(str(r["damageFormula"]) for r in rows if r["damageFormula"]).most_common(20))
print("events handlers:", collections.Counter(e["handler"] for r in rows for e in r["events"]).most_common())
print("events types:", collections.Counter(e["event"] for r in rows for e in r["events"]).most_common())
print("talents with effects:", sum(1 for r in rows if r["effectsCount"]))
print("prereq keys sample:", [r["prerequisites"] for r in rows if r["prerequisites"]][:2])
print("tree sample:", trees[0]["name"], trees[0]["folder"], trees[0]["nodeCount"], json.dumps(list(trees[0]["nodes"].values())[:1])[:900])
print("power sample:", json.dumps(powers[0])[:700])
