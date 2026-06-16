#!/usr/bin/env python3
"""Leyline tree consistency + soft-laziness audit, and the in-Foundry test worklist.

    python3 .claude/skills/leyline-tree-authoring/audit.py [color ...]              # gate (exit!=0 on FAIL)
    python3 .claude/skills/leyline-tree-authoring/audit.py [color ...] --checklist  # in-Foundry test plan

The gate is the mechanical enforcement of SKILL.md. Passing it does NOT mean a talent works — it
means nothing is provably wrong on paper. The `--checklist` mode exists for the part the gate can't
do: it lists every talent grouped by its real specialty (= its Foundry folder) and tells you what to
click and watch, flagging (⚑) the cards where the engine does NOT guarantee the outcome — contests
you must roll, owner-judged "act on click" cards, conditional AEs you must toggle, and manual cards.
Those ⚑ rows are where bugs hide; spend your in-Foundry time there.
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

# Authoritative specialty per (Color, Talent) — the generator source, i.e. the actual Foundry folders.
AUTH = {(t["path"], t["name"]): t.get("specialty") for t in json.load(open(ROOT / "data" / "leyline.json"))}


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


def body(value):
    """Card rule text without the italic flavor line, trimmed for the checklist."""
    return strip_html(re.sub(r"<em>.*?</em>", "", value or "", flags=re.S))


# --- engine facts -------------------------------------------------------------
_CW = 1800
contest_windows = [ENGINE[max(0, m.start() - _CW): m.start() + _CW]
                   for m in re.finditer(r"edhaQueueContest\s*\(", ENGINE)]

exempt = set()
for line in re.findall(r"CONTEST-EXEMPT:\s*(.+)", ENGINE):
    name = re.split(r"\s+[—-]\s+", line.strip())[0].strip().strip('"`*')
    if name:
        exempt.add(name)

# A test/attack vs a static DEFENSE or a color value is resolved by the base attack/damage pipeline;
# only an opposed test vs another creature's SKILL needs the contest core (engine rolls the foe).
DEFENSES = {"Physical", "Cognitive", "Spiritual"}
COLORS = {p.stem.replace("leyline-", "").title() for p in DATA.glob("leyline-*.json")}


def opposed_skill(text):
    hits = set()
    for m in re.finditer(r"\bvs\.?\s+([A-Z][a-z]+)", text):
        if m.group(1) not in DEFENSES and m.group(1) not in COLORS:
            hits.add(m.group(1))
    if re.search(r"\bopposed\b|\bcontest\b", text, re.I):
        hits.add("opposed/contest")
    return hits


def near_contest(name):
    return any(name in w for w in contest_windows)


def is_test_gated(text):
    """Card resolves on a test/DC against a defense (success/fail matters), but not an opposed SKILL."""
    return bool(re.search(r"\bvs\.|\bDC\b", text) or re.search(r"on a success", text, re.I))


# --- the gate -----------------------------------------------------------------
def audit(color):
    fails, warns = [], []
    cap = color.title()
    talents = json.load(open(DATA / f"leyline-{color}.json"))["talents"]
    raw = (DATA / f"leyline-{color}.json").read_text(encoding="utf-8")
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
        fails.append(f"flavor leaked into chat/short on {leak} card(s)")

    silent = [nm for nm, d in talents.items()
              if not (bool(d.get("events")) or bool(d.get("effects")) or nm in ENGINE or nm in DOCS)]
    if silent:
        fails.append(f"silent (undocumented) cards: {silent}")

    # SOFT LAZINESS — opposed-skill card must be contest-wired (or explicitly exempt).
    lazy = [nm for nm, d in talents.items()
            if opposed_skill(strip_html(d["description"]["value"]))
            and not near_contest(nm) and nm not in exempt]
    if lazy:
        fails.append("SOFT LAZINESS — opposed-skill card(s) NOT routed through the contest core: "
                     f"{lazy}. Wire via edhaQueueContest + edhaRollOpposedSkill (see Blue's Redirect "
                     "Momentum), or add `CONTEST-EXEMPT: <name> — <reason>` in the engine.")

    # Tag drift vs the AUTHORITATIVE specialty (the Foundry folder) — a hard FAIL, no grandfathering.
    drift = []
    for nm in talents:
        auth = AUTH.get((cap, nm))
        for tag in set(re.findall(rf'"(?:description|note)": "{cap}/([A-Za-z]+)\.', raw)):
            # only consider tags that belong to THIS talent's records
            if f'{cap}/{tag}.' in json.dumps(talents[nm]) and auth and tag.lower() != auth.lower():
                drift.append(f"{nm}: tagged {cap}/{tag} but specialty is {auth}")
    if drift:
        fails.append("specialty tag drift (rename to the real specialty): " + "; ".join(drift))

    return fl, n, leak, len(lazy), fails, warns


# --- the in-Foundry test worklist ---------------------------------------------
def classify(color, name, d):
    """(specialty, wiring, verify-directive, needs_hand_check) — hard signals only, no proximity guessing."""
    cap = color.title()
    spec = AUTH.get((cap, name), "?")
    text = body(d["description"]["value"])
    effects, events = d.get("effects"), d.get("events")
    if effects:
        e = effects[0]
        if e.get("transfer") and not e.get("disabled"):
            return spec, "AE auto", "confirm the effect is on the sheet and the stat change applies", False
        return spec, "AE conditional", "you must toggle/drag it — confirm the bonus holds only while it qualifies", True
    if events:
        ev = list(events.values())[0]
        h = ev.get("handler", {}) or {}
        what = h.get("statusId") or h.get("kind") or h.get("type", "effect")
        note = ev.get("note") or ""
        hand = bool(re.search(r"owner-judged|trusted|by hand|GM-|narrat", note, re.I))
        d_ = f"use it → expect '{what}' applied" + (f"; CAVEAT: {note.split('.')[0]}" if hand else "")
        return spec, f"event:{ev.get('event','use')}", d_, hand
    if opposed_skill(text):
        return spec, "opposed-skill test", "ROLL the opposed test — engine rolls the foe; confirm it applies ONLY on success", True
    if is_test_gated(text):
        return spec, "test-gated", "confirm the effect applies on a SUCCESS and does NOTHING on a failure (engine-gated or you click only on success)", True
    if name in exempt:
        return spec, "MANUAL (exempt)", "declared no-hook contest — adjudicate by hand", True
    if name in ENGINE:
        return spec, "name-based", "confirm the named passive/active behavior fires (no per-card data to tweak)", False
    return spec, "MANUAL", "no automation — adjudicate by hand per the card text", True


def checklist(color):
    cap = color.title()
    talents = json.load(open(DATA / f"leyline-{color}.json"))["talents"]
    rows = [(name, *classify(color, name, d), body(d["description"]["value"])) for name, d in talents.items()]
    order = {"Key": 0}
    by_spec = {}
    for name, spec, wiring, verify, hand, rule in rows:
        by_spec.setdefault(spec, []).append((name, wiring, verify, hand, rule))
    print(f"\n## {cap} — in-Foundry test worklist  (⚑ = engine can't guarantee it; verify by hand)")
    for spec in sorted(by_spec, key=lambda s: (order.get(s, 1), s)):
        print(f"\n### {spec}")
        for name, wiring, verify, hand, rule in by_spec[spec]:
            mark = "⚑" if hand else " "
            print(f"- [ ] {mark} **{name}** [{wiring}] — {verify}")
            print(f"        rule: {rule[:150]}")
    handn = sum(1 for r in rows if r[4])
    print(f"\n{cap}: {len(rows)} talents, {handn} need hands-on verification (⚑).")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_checklist = "--checklist" in sys.argv
    targets = args or sorted(p.stem.replace("leyline-", "") for p in DATA.glob("leyline-*.json"))
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
    print("FAILs block commit. Passing the gate ≠ working — run with --checklist and test the ⚑ rows in Foundry.")
    if do_checklist:
        for c in targets:
            if (DATA / f"leyline-{c}.json").exists():
                checklist(c)
    sys.exit(1 if any_fail else 0)


if __name__ == "__main__":
    main()
