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

if hasattr(sys.stdout, "reconfigure"):   # Windows cp1252 console can't print ✗ / ⚑ / —
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

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
# LEYLINE-ONLY: deity trees have no generator source here, so specialty-drift can't be machine-checked.
AUTH = {(t["path"], t["name"]): t.get("specialty") for t in json.load(open(ROOT / "data" / "leyline.json", encoding="utf-8"))}


def resolve(name):
    """A target name -> (file_path, cap, is_deity), or (None, None, None). Accepts a leyline color, a
    deity name, or a full stem (leyline-x / deity-x)."""
    cands = [(DATA / f"leyline-{name}.json", False), (DATA / f"deity-{name}.json", True),
             (DATA / f"{name}.json", name.startswith("deity-"))]
    for path, is_deity in cands:
        if path.exists():
            if is_deity:
                cap = json.load(open(path, encoding="utf-8")).get("_meta", {}).get("group", name.replace("deity-", "").title())
            else:
                cap = name.replace("leyline-", "").title()
            return path, cap, is_deity
    return None, None, None


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


def body(value):
    """Card rule text without the italic flavor line, trimmed for the checklist."""
    return strip_html(re.sub(r"<em>.*?</em>", "", value or "", flags=re.S))


# All talent names across every authored tree — used to mask LONGER names that contain the one
# being checked: a bare substring test false-passed "Edict" (inside Sovereignty's "Edict of the
# Fallen") and "Concord" (inside White's "Concordant Presence") — the Apex-Predator-shaped
# collision, caught 2026-07-03 on the Order pass.
ALL_NAMES = set()
for _p in DATA.glob("*.json"):
    try:
        ALL_NAMES |= set(json.load(open(_p, encoding="utf-8")).get("talents", {}).keys())
    except Exception:
        pass


def mentioned(nm, hay):
    """True if `nm` appears as a standalone name: word-bounded, and not merely inside a longer
    talent name (longer names are masked out first)."""
    for other in ALL_NAMES:
        if other != nm and nm in other:
            hay = hay.replace(other, "\x00")
    return re.search(rf"(?<![A-Za-z]){re.escape(nm)}(?![A-Za-z])", hay) is not None


# --- engine facts -------------------------------------------------------------
# A "contest site" is any call that actually rolls the opponent: the queued-contest core AND the
# direct foe-roll helpers (edhaFoeSkillVsColor / edhaSpeedVsRedProne / raw edhaRollOpposedSkill) —
# Civ's Bastion/Magnum and Destruction's Concussive Yield resolve through the latter.
_CW = 1800
contest_windows = [ENGINE[max(0, m.start() - _CW): m.start() + _CW]
                   for m in re.finditer(r"edhaQueueContest\s*\(|edhaFoeSkillVsColor\s*\(|edhaSpeedVsRedProne\s*\(|edhaRollOpposedSkill\s*\(", ENGINE)]

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
    # "tests Discipline vs. your Blue" — the foe rolls a SKILL against a DC off your color. The
    # lowercase "your" hid this from the pattern above (Order's Verdict/Sealed Edict shipped-risk).
    for m in re.finditer(r"\btests?\s+([A-Z][a-z]+)\s+vs\.?\s+your\s+([A-Z][a-z]+)", text):
        if m.group(2) in COLORS and m.group(1) not in DEFENSES and m.group(1) not in COLORS:
            hits.add(m.group(1))
    if re.search(r"\bopposed\b|\bcontest\b", text, re.I):
        hits.add("opposed/contest")
    return hits


def near_contest(name):
    return any(name in w for w in contest_windows)


def doc_contest(d):
    """True if the TALENT ITSELF carries the contest, i.e. an `edha-def-test` rule with vs="skill".

    Added 2026-07-24p, and the gate was wrong without it. `near_contest` looks for the talent's NAME
    beside an edhaQueueContest call in the engine — which is exactly the name-keyed wiring iron rule
    2b is removing. The first `vs: skill` conversion (Green's Territorial Instinct) therefore FAILED
    a gate it satisfies better than before: H1's executor calls edhaQueueContest + edhaRollOpposedSkill
    itself, so a rule on the document IS the contest core, with no name anywhere.
    (vs="defense"/"dc" don't need this — a static bar was never the soft-laziness case.)

    Widened 2026-07-25 (pass 2bX) for the SECOND document-carried contest form: an H3
    `edha-owner-list {op: annotate}` rule with riderSkill + riderColor (Inevitable Snare). The
    consuming resolver (Fate's snare spring) rolls the foe via edhaRollOpposedSkill off those
    fields, so the rule on the document IS the contest core — same finding as Territorial
    Instinct, one pass later (LESSONS §4: every gate that detects wiring by looking at the
    engine hits this once per new form)."""
    for ev in (d.get("events") or {}).values():
        h = (ev or {}).get("handler") or {}
        if h.get("type") == "edha-def-test" and h.get("vs") == "skill" and h.get("targetSkill"):
            return True
        if h.get("type") == "edha-owner-list" and h.get("op") == "annotate" and h.get("riderSkill") and h.get("riderColor"):
            return True
    return False


def is_test_gated(text):
    """Card resolves on a test/DC against a defense (success/fail matters), but not an opposed SKILL."""
    return bool(re.search(r"\bvs\.|\bDC\b", text) or re.search(r"on a success", text, re.I))


# --- the gate -----------------------------------------------------------------
def audit(color):
    fails, warns = [], []
    path, cap, is_deity = resolve(color)
    talents = json.load(open(path, encoding="utf-8"))["talents"]
    raw = path.read_text(encoding="utf-8")
    n = len(talents)
    if not is_deity and n != 25:
        fails.append(f"talent count {n} (expected 25)")
    elif is_deity:
        warns.append(f"deity tree: {n} authored override talents (extract-only — full roster lives in the pack; 25-count + specialty-drift not enforced)")

    fl = sum("<em>" in d["description"]["value"] for d in talents.values())
    leak = sum(("<em>" in d["description"].get("chat", "")) or ("<em>" in d["description"].get("short", ""))
               for d in talents.values())
    if fl != n:
        miss = [nm for nm, d in talents.items() if "<em>" not in d["description"]["value"]]
        fails.append(f"flavor {fl}/{n} — missing <em> line in description.value: {miss}")
    if leak:
        fails.append(f"flavor leaked into chat/short on {leak} card(s)")

    silent = [nm for nm, d in talents.items()
              if not (bool(d.get("events")) or bool(d.get("effects")) or mentioned(nm, ENGINE) or mentioned(nm, DOCS))]
    if silent:
        fails.append(f"silent (undocumented) cards: {silent}")

    # SOFT LAZINESS — opposed-skill card must be contest-wired (or explicitly exempt).
    lazy = [nm for nm, d in talents.items()
            if opposed_skill(strip_html(d["description"]["value"]))
            and not doc_contest(d) and not near_contest(nm) and nm not in exempt]
    if lazy:
        fails.append("SOFT LAZINESS — opposed-skill card(s) NOT routed through the contest core: "
                     f"{lazy}. Put an `edha-def-test` rule with vs=\"skill\" on the talent (the iron-rule-2b "
                     "form — see Green's Territorial Instinct), or add `CONTEST-EXEMPT: <name> — <reason>` "
                     "in the engine.")

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
    spec = AUTH.get((cap, name)) or cap   # deity: no generator specialty → group everything under the tree name
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
        if h.get("type") == "edha-def-test":
            bar = ({"skill": f"the foe's {h.get('targetSkill', '?')} (engine-rolled)",
                    "dc": f"DC {h.get('dc', '?')}"}.get(h.get("vs"), f"{str(h.get('def', 'cog')).upper()} defense"))
            payload = [r.get("handler", {}).get("type") for r in events.values()
                       if r.get("event") in ("edha-test-success", "edha-test-fail")]
            return spec, "event:def-test", (f"target, use, ROLL {h.get('skill', '?')} → the card must print "
                    f"SUCCESS/FAIL against {bar}, and "
                    + (f"fire {', '.join(sorted(set(payload)))} only on that branch" if payload
                       else "say so when the payload is table-run")), True
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
    if mentioned(name, ENGINE):
        return spec, "name-based", "confirm the named passive/active behavior fires (no per-card data to tweak)", False
    return spec, "MANUAL", "no automation — adjudicate by hand per the card text", True


def checklist(color):
    cap = color.title()
    path, _, _ = resolve(color)
    talents = json.load(open(path, encoding="utf-8"))["talents"]
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
    default = [p.stem.replace("leyline-", "") for p in DATA.glob("leyline-*.json")] \
            + [p.stem.replace("deity-", "") for p in DATA.glob("deity-*.json")]
    targets = args or sorted(default)
    any_fail = False
    print(f"Reference trees (the standard): {', '.join(REFERENCE)}")
    print("-" * 72)
    for c in targets:
        if not resolve(c)[0]:
            print(f"{c}: NO FILE — valid keys: {', '.join(sorted(default))}"); any_fail = True; continue
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
            if resolve(c)[0]:
                checklist(c)
    sys.exit(1 if any_fail else 0)


if __name__ == "__main__":
    main()
