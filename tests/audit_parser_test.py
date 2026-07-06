#!/usr/bin/env python3
"""Unit tests for audit.py's text parsers (the gate's own logic).

    python3 tests/audit_parser_test.py

The opposed-skill detector and the name-mention masker have each had shipped-risk bugs patched
into them (the "tests X vs. your <color>" miss on Order's Verdict; the Apex-Predator-shaped
substring collision on "Edict"/"Concord"). These pin that behavior. Imports audit.py as a
module — its main() only runs under __main__, so import is side-effect-free beyond reading
repo files that must exist anyway.
"""
import importlib.util
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
AUDIT = ROOT / ".claude" / "skills" / "leyline-tree-authoring" / "audit.py"

spec = importlib.util.spec_from_file_location("audit", AUDIT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

failures = []


def check(name, fn):
    try:
        fn()
        print(f"  ✓ {name}")
    except AssertionError as e:
        failures.append(name)
        print(f"  ✗ {name}\n    {e}")


# --- opposed_skill: which cards MUST route through the contest core -------------
def t_opposed_basic():
    assert audit.opposed_skill("The target tests vs. Athletics") == {"Athletics"}
    assert audit.opposed_skill("make an opposed Athletics test") == {"opposed/contest"}


def t_defense_is_not_opposed():
    # A test vs a static DEFENSE resolves through the base pipeline, not the contest core.
    assert audit.opposed_skill("attack vs. Physical") == set()
    assert audit.opposed_skill("test vs. Cognitive and vs. Spiritual") == set()


def t_color_is_not_opposed():
    # vs your leyline color = a DC off your skill, no foe roll.
    for color in ("White", "Blue", "Black", "Red", "Green"):
        assert audit.opposed_skill(f"vs. {color}") == set(), color


def t_tests_skill_vs_your_color():
    # The Order Verdict/Sealed Edict shape: the FOE rolls a skill against a DC off your color —
    # lowercase "your" hid it from the plain pattern; this shipped-risk case must stay caught.
    assert audit.opposed_skill("the creature tests Discipline vs. your Blue") == {"Discipline"}
    assert audit.opposed_skill("it tests Deception vs. your Black DC") == {"Deception"}


def t_contest_keyword():
    assert "opposed/contest" in audit.opposed_skill("win the contest to hold the door")


# --- mentioned: word-bounded, longer-name-masked engine/doc mention check --------
def t_mentioned_word_bounded():
    audit.ALL_NAMES.add("Rally")
    assert audit.mentioned("Rally", "the Rally handler fires") is True
    assert audit.mentioned("Rally", "Rallying cry text only") is False


def t_mentioned_masks_longer_names():
    # The Apex-Predator-shaped collision (2026-07-03): "Edict" inside "Edict of the Fallen"
    # must NOT count as a mention of the shorter name.
    audit.ALL_NAMES.update({"Edict", "Edict of the Fallen"})
    assert audit.mentioned("Edict", 'case "Edict of the Fallen": grantBoon()') is False
    assert audit.mentioned("Edict", 'case "Edict": sealIt()') is True


# --- strip_html / body / is_test_gated -------------------------------------------
def t_strip_html():
    assert audit.strip_html("<p>Deal <strong>2d6</strong>\n damage.</p>") == "Deal 2d6 damage."


def t_body_removes_flavor():
    v = "<p><em>Whispers coil around you.</em></p><p>Deal 2d6 damage.</p>"
    assert audit.body(v) == "Deal 2d6 damage."


def t_test_gated():
    assert audit.is_test_gated("test vs. Physical") is True
    assert audit.is_test_gated("beat DC 15") is True
    assert audit.is_test_gated("On a success, the door opens") is True
    assert audit.is_test_gated("gain 2 focus") is False


check("opposed_skill: bare skill after vs. / opposed keyword", t_opposed_basic)
check("opposed_skill: static defenses are NOT contests", t_defense_is_not_opposed)
check("opposed_skill: leyline colors are NOT contests", t_color_is_not_opposed)
check("opposed_skill: 'tests <Skill> vs. your <color>' IS a contest (Order shipped-risk)", t_tests_skill_vs_your_color)
check("opposed_skill: contest/opposed keywords flag", t_contest_keyword)
check("mentioned: word-bounded matching", t_mentioned_word_bounded)
check("mentioned: longer talent names are masked first", t_mentioned_masks_longer_names)
check("strip_html flattens tags and whitespace", t_strip_html)
check("body drops the <em> flavor line", t_body_removes_flavor)
check("is_test_gated: vs./DC/on-a-success shapes", t_test_gated)

print(f"\n{10 - len(failures)} passed, {len(failures)} failed.")
sys.exit(1 if failures else 0)
