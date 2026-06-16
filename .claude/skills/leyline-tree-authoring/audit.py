#!/usr/bin/env python3
"""Leyline tree consistency + soft-laziness audit (one command, can't be skipped half-way).

Usage:
    python3 .claude/skills/leyline-tree-authoring/audit.py [color ...]

No args => audit every data/authored/leyline-*.json that exists.
Exits non-zero if ANY tree reports a FAIL, so it can gate a commit / CI.

This is the mechanical enforcement of the SKILL.md rules. The headline check is
SOFT LAZINESS: a talent whose card text describes an opposed/contested test
("... vs. ...", "opposed", "contest") MUST be routed through the contest core
(`edhaQueueContest`) in register-skills.js — not applied on use and trusted.
The only escape is a genuine no-hook contest, declared explicitly in the engine
with a comment `CONTEST-EXEMPT: <Talent Name> — <reason>`.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "authored"
ENGINE = (ROOT / "module-src" / "scripts" / "register-skills.js").read_text(encoding="utf-8")
DOCS = ""
for d in ("EDHA_FOUNDRY_HANDOFF.md", "EDHA_FOUNDRY_TEST_CHECKLIST.md"):
    p = ROOT / d
    if p.exists():
        DOCS += p.read_text(encoding="utf-8")

REFERENCE = ["black", "white", "red", "blue", "green"]   # the trees authored as the standard


def strip_html(s):
    return re.sub(r"<[^>]+>", " ", s or "")


# --- engine facts -------------------------------------------------------------
# Specialty names per color, harvested from the section headers ("BLACK / RITUAL tree engine",
# "RED / MOMENTUM + FRENZY tree engine"). Used to catch tag drift (e.g. Green/Mending vs Restoration).
specialties = {}
for m in re.finditer(r"\b([A-Z]+)\s*/\s*([A-Z +/]+?)\s+tree engine", ENGINE):
    col = m.group(1).lower()
    for part in re.split(r"[+/]", m.group(2)):
        part = part.strip()
        if part:
            specialties.setdefault(col, set()).add(part.title())

# Text windows around every contest resolution — a talent is "contest-wired" if its name
# appears near an edhaQueueContest call.
_CW = 1800
contest_windows = [ENGINE[max(0, m.start() - _CW): m.start() + _CW]
                   for m in re.finditer(r"edhaQueueContest\s*\(", ENGINE)]

# Declared exemptions: `CONTEST-EXEMPT: <Talent Name> — <reason>`
exempt = set()
for line in re.findall(r"CONTEST-EXEMPT:\s*(.+)", ENGINE):
    name = re.split(r"\s+[—-]\s+", line.strip())[0].strip().strip('"`*')
    if name:
        exempt.add(name)

# What needs the contest core: an opposed test against another creature's SKILL — only the engine can
# roll the opponent (edhaRollOpposedSkill). A test/attack against a static DEFENSE (Physical/Cognitive/
# Spiritual) or a color value is resolved by the base attack/damage pipeline, so "vs. <Defense>" /
# "vs. <Color>" are NOT soft laziness. Colors come from the tree filenames so all 15 stay covered.
DEFENSES = {"Physical", "Cognitive", "Spiritual"}
COLORS = {p.stem.replace("leyline-", "").title() for p in DATA.glob("leyline-*.json")}


def opposed_skill(text):
    """Return the opposed-SKILL targets in a card's text (empty => nothing the contest core must resolve)."""
    hits = set()
    for m in re.finditer(r"\bvs\.?\s+([A-Z][a-z]+)", text):
        w = m.group(1)
        if w in DEFENSES or w in COLORS:
            continue
        hits.add(w)
    if re.search(r"\bopposed\b|\bcontest\b", text, re.I):
        hits.add("opposed/contest")
    return hits


def audit(color):
    fails, warns = [], []
    path = DATA / f"leyline-{color}.json"
    talents = json.load(open(path))["talents"]
    n = len(talents)
    if n != 25:
        fails.append(f"talent count {n} (expected 25)")

    fl = sum("<em>" in d["description"]["value"] for d in talents.values())
    leak = sum(("<em>" in d["description"].get("chat", "")) or ("<em>" in d["description"].get("short", ""))
               for d in talents.values())
    if fl != n:
        miss = [nm for nm, d in talents.items() if "<em>" not in d["description"]["value"]]
        fails.append(f"flavor {fl}/{n} — missing <em> line in description.value: {miss}")
    if leak:
        fails.append(f"flavor leaked into chat/short on {leak} card(s) (flavor belongs in value only)")

    silent = [nm for nm, d in talents.items()
              if not (bool(d.get("events")) or bool(d.get("effects")) or nm in ENGINE or nm in DOCS)]
    if silent:
        fails.append(f"silent (undocumented) cards: {silent}")

    # SOFT LAZINESS — the headline check.
    lazy = []
    for nm, d in talents.items():
        if opposed_skill(strip_html(d["description"]["value"])):
            wired = any(nm in w for w in contest_windows)
            if not wired and nm not in exempt:
                lazy.append(nm)
    if lazy:
        fails.append("SOFT LAZINESS — opposed-skill card(s) NOT routed through the contest core: "
                     f"{lazy}. Wire each via edhaQueueContest + edhaRollOpposedSkill (see Blue's Redirect "
                     "Momentum), or, if there is genuinely no Foundry hook, add `CONTEST-EXEMPT: <name> — "
                     "<reason>` in the engine.")

    # Tag drift — tag specialty must match a real section-header specialty for this color.
    cap = color.title()
    tagspec = set(re.findall(rf'"(?:description|note)":\s*"{cap}/([A-Za-z]+)\.', path.read_text(encoding="utf-8")))
    known = specialties.get(color, set())
    bad = sorted(t for t in tagspec if t not in known)
    if bad:
        warns.append(f"tag specialty {bad} has no matching engine section header {sorted(known) or '(none found)'} "
                     "— rename the tag to the real specialty name, or add the missing section header")

    return fl, n, leak, len(lazy), fails, warns


def main():
    targets = sys.argv[1:] or sorted(p.stem.replace("leyline-", "")
                                     for p in DATA.glob("leyline-*.json"))
    any_fail = False
    print(f"Reference trees (the standard): {', '.join(REFERENCE)}")
    print("-" * 72)
    for c in targets:
        if not (DATA / f"leyline-{c}.json").exists():
            print(f"{c}: NO FILE"); any_fail = True; continue
        fl, n, leak, nlazy, fails, warns = audit(c)
        status = "FAIL" if fails else ("WARN" if warns else "PASS")
        print(f"[{status}] {c}: {fl}/{n} flavor, leak {leak}, unwired opposed-skill cards {nlazy}")
        for f in fails:
            print(f"    ✗ {f}")
        for w in warns:
            print(f"    ! {w}")
        any_fail = any_fail or bool(fails)
    print("-" * 72)
    print("FAILs block commit. ✗ = fix required, ! = reconcile/justify.")
    sys.exit(1 if any_fail else 0)


if __name__ == "__main__":
    main()
