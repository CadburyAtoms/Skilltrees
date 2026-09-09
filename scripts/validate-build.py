#!/usr/bin/env python3
"""validate-build.py — check a character or adversary build against the live talent data.

WHY THIS EXISTS. On 2026-09-09 a level-up handout shipped with three picks Foundry would
have refused, because the checker behind it read only each talent's `prerequisites` STRING.
It is not the whole gate: **`connections` are managed prerequisites too** (iron rule 7).
`Thorn Field` has no prose prereq beyond "Green 2+", but `connections: ["Grasping Vines"]`
means a character without Grasping Vines cannot take it. This tool models the same
requirement graph `scripts/validate.js` does, so a planned build can be checked before it
reaches a player's sheet — or an adversary's talent list before it reaches the pack.

THE REQUIREMENT MODEL (mirrors scripts/validate.js, which mirrors foundry-build.js):
  * every `connections` entry that resolves INSIDE THE SAME TREE becomes ONE managed
    prereq group, satisfied by owning ANY one of them (OR within the group);
  * each prose prerequisite GROUP (split on ";" and "," then on " or ") is its own group;
  * AND across groups. A talent with no groups is a root.

Also enforced, for character mode (from the system's own advancement table):
  * 1 talent and 2 skill ranks per level; attribute points at levels 3, 6 and 9;
  * max skill rank 2 up to level 5, 3 from level 6;
  * a "purchase" that does not raise a rank is flagged (it silently wastes the rank).

NARRATIVE PREREQS are recognised, not failed: the data carries eight of them ("Patron in
high society", "a companion", "Animal companion", "A patron", "Title granting you command
of 5+ people", "Access to a Shardblade and Shardplate", ...). They are GM calls, so they
are reported as GATE lines and do not fail the run.

USAGE
  python scripts/validate-build.py                     # self-test: the bundled builds
  python scripts/validate-build.py <spec.json>         # check a character build spec
  python scripts/validate-build.py --adversaries       # check every adversary's talents

SPEC SHAPE (character mode) — a list of builds, or one build:
  {"name": "...",
   "start_skills":  {"green": 1, "hwp": 2},        # skill id -> rank held at level 1
   "start_talents": ["Erudition", "Pack Hunter"],  # talents held at level 1
   "levels": [{"lv": 2, "talent": "Grasping Vines", "tree": "Green",
               "ranks": {"green": 2, "sur": 1}}, ...]}
`tree` disambiguates a name that exists in more than one tree ("Collected" is in five);
it accepts either the tree name (Green, Envoy, Order) or the specialty (Surgeon, Bulwark).

Exit code 0 when everything passes, 1 otherwise.
"""
import json, io, os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, "data")

def _load(name):
    with io.open(os.path.join(DATA, name), encoding="utf-8") as fh:
        return json.load(fh)

LEY, HER, DOM = _load("leyline.json"), _load("cosmere.json"), _load("domain.json")

TALENTS = []
for _t in LEY: TALENTS.append({**_t, "atlas": "leyline", "tree": _t.get("path")})
for _t in HER: TALENTS.append({**_t, "atlas": "heroic",  "tree": _t.get("path")})
for _t in DOM: TALENTS.append({**_t, "atlas": "deity",   "tree": _t.get("domain")})

BY_TREE = {}
for _t in TALENTS:
    BY_TREE.setdefault((_t["atlas"], _t["tree"]), {})[_t["name"].strip().lower()] = _t
ALL_NAMES = {t["name"].strip().lower() for t in TALENTS}

# scripts/foundry-build.js STD_SKILL + LEYLINE_SKILL, plus the short forms a planner writes.
SKILL_ALIASES = {
    "agility": "agi", "athletics": "ath", "heavy weaponry": "hwp", "heavy wpn": "hwp",
    "light weaponry": "lwp", "light wpn": "lwp", "stealth": "stl", "thievery": "thv",
    "crafting": "cra", "deduction": "ded", "discipline": "dis", "intimidation": "inm",
    "lore": "lor", "medicine": "med", "deception": "dec", "insight": "ins",
    "leadership": "lea", "perception": "prc", "persuasion": "prs", "survival": "sur",
}
# scripts/foundry-build.js ROLE_LEYLINE_RANK — an adversary's colour rank comes from its ROLE.
ROLE_LEYLINE_RANK = {"minion": 1, "rival": 2, "boss": 3}

def norm_skill(s):
    s = str(s).strip().lower()
    return SKILL_ALIASES.get(s, s)

def rank_cap(level):
    """The system's advancement table: max skill rank 2 through level 5, 3 from level 6."""
    return 2 if level < 6 else 3

def find(name, tree=None):
    hits = [t for t in TALENTS if t["name"].strip().lower() == str(name).strip().lower()]
    if tree and len(hits) > 1:
        narrowed = [t for t in hits
                    if (t.get("tree") or "").lower() == str(tree).strip().lower()
                    or (t.get("specialty") or "").lower() == str(tree).strip().lower()]
        if len(narrowed) == 1:
            return narrowed[0], hits
    return (hits[0] if len(hits) == 1 else None), hits

def prose_groups(pr):
    pr = (pr or "").strip()
    if pr in ("", "—", "-", "None", "none"):
        return []
    out = []
    for chunk in re.split(r"[;,]", pr):
        chunk = chunk.strip()
        if chunk:
            out.append([m.strip() for m in re.split(r"\s+or\s+", chunk, flags=re.I) if m.strip()])
    return out

def is_narrative(atom):
    a = str(atom).strip().strip(".").lower()
    return bool(a) and a not in ALL_NAMES and not re.match(r"^.+\s+\d+\s*\+$", a)

def atom_ok(atom, skills, taken):
    atom = str(atom).strip().strip(".").strip()
    if not atom:
        return True, "free", False
    if is_narrative(atom):
        return True, 'GATE: "%s" needs the GM\'s yes' % atom, True
    m = re.match(r"^(.*?)\s+(\d+)\s*\+$", atom)
    if m:
        sk, need = norm_skill(m.group(1)), int(m.group(2))
        have = skills.get(sk, 0)
        return have >= need, "%s %d/%d" % (m.group(1), have, need), False
    held = atom.lower() in taken
    return held, '"%s"%s' % (atom, "" if held else " NOT HELD"), False

def groups_for(t):
    """connections (same-tree only, OR within) first, then one group per prose clause."""
    groups = []
    tree_names = BY_TREE.get((t["atlas"], t["tree"]), {})
    conn = [c for c in (t.get("connections") or []) if str(c).strip().lower() in tree_names]
    if conn:
        groups.append(("connections", conn))
    for g in prose_groups(t.get("prerequisites")):
        groups.append(("prose", g))
    return groups

def check_gates(t, skills, taken):
    notes, ok, gated = [], True, False
    for kind, members in groups_for(t):
        res = [atom_ok(m, skills, taken) for m in members]
        notes.append("%s[%s]" % (kind, " OR ".join(r[1] for r in res)))
        if any(r[2] for r in res):
            gated = True
        if not any(r[0] for r in res):
            ok = False
    return ok, notes, gated

# ---------------------------------------------------------------- character mode
def validate_build(build, verbose=True):
    print("=" * 78)
    print("BUILD:", build.get("name", "(unnamed)"))
    skills = {norm_skill(k): v for k, v in (build.get("start_skills") or {}).items()}
    taken = {str(t).strip().lower() for t in (build.get("start_talents") or [])}
    ok_all = True
    for step in build.get("levels", []):
        lv = step.get("lv")
        cap = rank_cap(lv)
        spent = 0
        for sk, newval in (step.get("ranks") or {}).items():
            sk = norm_skill(sk)
            cur = skills.get(sk, 0)
            if newval <= cur:
                print("  L%-2s !! %s -> %s is not an increase (already %s)" % (lv, sk, newval, cur))
                ok_all = False
            spent += max(0, newval - cur)
            if newval > cap:
                print("  L%-2s !! %s rank %s exceeds the cap of %s at this level" % (lv, sk, newval, cap))
                ok_all = False
            skills[sk] = max(cur, newval)
        if spent > 2:
            print("  L%-2s !! spent %d skill ranks (max 2 per level)" % (lv, spent))
            ok_all = False
        t, hits = find(step.get("talent"), step.get("tree"))
        if t is None:
            where = ["%s/%s/%s" % (h["atlas"], h["tree"], h.get("specialty")) for h in hits]
            print("  L%-2s !! \"%s\" %s%s" % (lv, step.get("talent"),
                  "NOT FOUND" if not hits else "is AMBIGUOUS - name the tree",
                  (": " + ", ".join(where)) if hits else ""))
            ok_all = False
            continue
        good, notes, gated = check_gates(t, skills, taken)
        if not good:
            ok_all = False
        if verbose or not good:
            print("  L%-2s %s%-24s [%s/%s/%s] %s" % (
                lv, "ok " if good else "!! ", t["name"], t["atlas"], t["tree"],
                t.get("specialty"), "; ".join(notes) if notes else "ROOT (no gates)"))
        taken.add(t["name"].strip().lower())
    print("  FINAL SKILLS:", {k: v for k, v in sorted(skills.items()) if v})
    print("  RESULT:", "PASS" if ok_all else "FAIL")
    return ok_all

# ---------------------------------------------------------------- adversary mode
def validate_adversaries():
    """List which of an adversary's talents a PC could not have reached the same way.

    **This is information, never an error (R-94).** Ben, 2026-09-09: "I'm fine with
    adversaries skipping around on talent trees and rank requirements." Nothing in the
    repo enforces adversary prereqs -- scripts/validate.js only checks that a talent ref
    RESOLVES -- and that is deliberate: an NPC exists to be interesting, not legal.

    The report is still worth printing, because it tells you what a statblock is actually
    costing the players: a minion carrying a talent a PC would need two picks and a rank-2
    skill to reach is stronger than its role advertises. Sometimes that is the design;
    sometimes it is an accident. An adversary's colour rank comes from its ROLE
    (minion 1 / rival 2 / boss 3), so role is the lever if you want to change it.
    """
    advs = _load("adversaries.json")
    print("=" * 78)
    print("ADVERSARY TALENT CHECK")
    n_checked = n_flagged = 0
    for name, adv in advs.items():
        if name == "_README" or not isinstance(adv, dict):
            continue
        listed = adv.get("talents") or []
        if not listed:
            continue
        n_checked += 1
        role = adv.get("role", "rival")
        skills = {norm_skill(k): int(v) for k, v in (adv.get("skills") or {}).items()}
        for c in (adv.get("leylines") or []):
            skills[str(c).lower()] = ROLE_LEYLINE_RANK.get(role, 1)
        # every listed talent is held, so intra-list prereqs resolve
        taken = set()
        for entry in listed:
            taken.add(str(entry).split("/")[-1].strip().lower())
        for c in (adv.get("leylines") or []):
            taken.add("%s leyline attunement" % str(c).lower())
        print("  %s (%s, tier %s, leylines=%s -> colour rank %s)"
              % (name, role, adv.get("tier"), adv.get("leylines") or [], ROLE_LEYLINE_RANK.get(role, 1)))
        for entry in listed:
            tree, _, tname = str(entry).rpartition("/")
            t, hits = find(tname, tree or None)
            if t is None:
                print("      MISSING  %s -- resolves to no talent (this one IS an error)" % entry)
                n_flagged += 1
                continue
            good, notes, _ = check_gates(t, skills, taken)
            if not good:
                n_flagged += 1
            print("      %s%-22s %s" % ("    " if good else "off-tree ", t["name"],
                                        "; ".join(notes) if notes else "ROOT"))
    print("  %d adversaries with talents; %d marked 'off-tree' -- reachable by the GM's "
          "licence (R-94), not by a PC's ladder. Informational only." % (n_checked, n_flagged))
    return True

# ---------------------------------------------------------------- entry point
def main(argv):
    if "--adversaries" in argv:
        return 0 if validate_adversaries() else 1
    path = next((a for a in argv[1:] if not a.startswith("-")), None)
    if path is None:
        path = os.path.join(REPO, "docs", "levelup-builds.json")
        print("(no spec given -- self-testing against %s)" % os.path.relpath(path, REPO))
    with io.open(path, encoding="utf-8") as fh:
        spec = json.load(fh)
    builds = spec if isinstance(spec, list) else [spec]
    results = [validate_build(b) for b in builds]
    print()
    print("ALL BUILDS:", "PASS" if all(results) else "FAIL")
    return 0 if all(results) else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv))
