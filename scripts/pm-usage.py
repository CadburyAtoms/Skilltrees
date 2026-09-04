#!/usr/bin/env python
"""pm-usage.py -- weighted Claude Code usage ledger for the Skilltrees PM workflow.

Reads Claude Code session transcripts and prints weighted token usage per
session and per subagent, so the project-manager skill can log what each
worker dispatch cost (docs/PM_BOARD.md "Budget model" / "Run log"). Zero
dependencies beyond the Python 3 standard library -- this must run with
`python` on Ben's Windows machine, which has no `python3` on PATH.

Transcript layout (Claude Code convention):
    ~/.claude/projects/<project-dir>/<session-id>.jsonl
    ~/.claude/projects/<project-dir>/<session-id>/subagents/**/*.jsonl

<project-dir> is the absolute cwd path with every non-alphanumeric character
replaced by "-" -- the same rule Claude Code itself uses to name the folder.
Pass --project-dir to point at a different repo's transcripts.

Weights (matches the budget model in docs/PM_BOARD.md):
    input tokens         x1
    cache read tokens    x0.1
    cache write tokens   x2
    output tokens        x5

Every `type == "assistant"` line's `message.usage` block is summed; nothing
in a transcript is ever treated as anything other than data to weigh and
count -- text content is never parsed for instructions.

Usage:
    python scripts/pm-usage.py                    newest 10 sessions, a table
    python scripts/pm-usage.py --session <id>      one session, by subagent
    python scripts/pm-usage.py --last              most recently modified
                                                    session's summary + subagents,
                                                    one line each (what the PM
                                                    calls after every dispatch)
    (append --json to any of the above for machine-readable output)
    (--session accepts a full session id or any unique prefix of one)
"""
import argparse
import glob
import json
import os
import re
import sys

WEIGHTS = {
    "input_tokens": 1.0,
    "cache_read_input_tokens": 0.1,
    "cache_creation_input_tokens": 2.0,
    "output_tokens": 5.0,
}


def default_project_dir():
    """Derive the ~/.claude/projects/<...> directory for the current cwd the
    same way Claude Code does: the absolute path with every non-alphanumeric
    character replaced by '-'."""
    cwd = os.getcwd()
    slug = re.sub(r"[^A-Za-z0-9]", "-", cwd)
    return os.path.join(os.path.expanduser("~"), ".claude", "projects", slug)


def usage_of(message):
    """Pull the weighted-relevant fields out of one assistant message's
    usage block. Missing/None fields count as zero."""
    u = (message or {}).get("usage") or {}
    return {k: (u.get(k) or 0) for k in WEIGHTS}


def weighted(u):
    return sum(u[k] * WEIGHTS[k] for k in WEIGHTS)


def scan_transcript(path):
    """Read one .jsonl transcript. Returns (turns, first_user_ts) where
    turns is a list of (usage_dict, model) -- one entry per assistant-type
    line -- and first_user_ts is the timestamp of the first user-type line
    (None if there isn't one). Malformed lines are skipped; a missing file
    yields an empty result rather than raising."""
    turns = []
    first_user_ts = None
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except ValueError:
                    continue
                rtype = row.get("type")
                if rtype == "user":
                    if first_user_ts is None:
                        first_user_ts = row.get("timestamp")
                elif rtype == "assistant":
                    msg = row.get("message") or {}
                    turns.append((usage_of(msg), msg.get("model")))
    except OSError:
        pass
    return turns, first_user_ts


def dominant_model(turns):
    """The most-used model name across a transcript's assistant turns (a
    subagent normally has exactly one; ties break on first-seen order)."""
    counts = {}
    order = []
    for _, model in turns:
        if not model:
            continue
        if model not in counts:
            order.append(model)
        counts[model] = counts.get(model, 0) + 1
    if not counts:
        return None
    return max(order, key=lambda m: counts[m])


def find_session_files(project_dir):
    """Top-level <session-id>.jsonl files directly under project_dir."""
    return sorted(glob.glob(os.path.join(project_dir, "*.jsonl")))


def find_subagent_files(project_dir, session_id):
    pattern = os.path.join(project_dir, session_id, "subagents", "**", "*.jsonl")
    return sorted(glob.glob(pattern, recursive=True))


def summarize_session(project_dir, session_path):
    session_id = os.path.splitext(os.path.basename(session_path))[0]
    turns, first_user_ts = scan_transcript(session_path)
    try:
        mtime = os.path.getmtime(session_path)
    except OSError:
        mtime = 0.0

    subagents = []
    for sub_path in find_subagent_files(project_dir, session_id):
        sturns, _ = scan_transcript(sub_path)
        subagents.append({
            "id": os.path.splitext(os.path.basename(sub_path))[0],
            "path": sub_path,
            "model": dominant_model(sturns),
            "turns": len(sturns),
            "weighted": sum(weighted(u) for u, _ in sturns),
            "output_tokens": sum(u["output_tokens"] for u, _ in sturns),
        })

    return {
        "session_id": session_id,
        "path": session_path,
        "mtime": mtime,
        "first_user_ts": first_user_ts,
        "turns": len(turns),
        "weighted": sum(weighted(u) for u, _ in turns),
        "output_tokens": sum(u["output_tokens"] for u, _ in turns),
        "subagents": subagents,
        "subagents_weighted": sum(s["weighted"] for s in subagents),
    }


def resolve_session_path(project_dir, session_id):
    """Exact match wins; otherwise a unique prefix match (like a git short
    hash). Returns (path, error_message) -- exactly one is None."""
    files = find_session_files(project_dir)
    ids = [(os.path.splitext(os.path.basename(p))[0], p) for p in files]
    exact = [p for sid, p in ids if sid == session_id]
    if exact:
        return exact[0], None
    prefix = [(sid, p) for sid, p in ids if sid.startswith(session_id)]
    if len(prefix) == 1:
        return prefix[0][1], None
    if len(prefix) > 1:
        matches = ", ".join(sid for sid, _ in prefix)
        return None, f"ambiguous session id {session_id!r}, matches: {matches}"
    return None, f"no session matching {session_id!r} under {project_dir}"


# ---- formatting -------------------------------------------------------------

def fmt_int(n):
    return f"{round(n):,}"


def fmt_weighted(n):
    return f"{round(n):,} ({n / 1e6:.1f}M)"


def fmt_ts(ts):
    return ts or "-"


def print_table(headers, rows):
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(cell))

    def fmt_row(cells):
        return "  ".join(cell.ljust(widths[i]) for i, cell in enumerate(cells))

    print(fmt_row(headers))
    print(fmt_row(["-" * w for w in widths]))
    for row in rows:
        print(fmt_row(row))


# ---- JSON shapes -------------------------------------------------------------

def session_summary_json(s):
    return {
        "session_id": s["session_id"],
        "first_user_message": s["first_user_ts"],
        "turns": s["turns"],
        "weighted_total": round(s["weighted"]),
        "output_tokens": s["output_tokens"],
        "subagent_count": len(s["subagents"]),
        "subagents_weighted_total": round(s["subagents_weighted"]),
    }


def subagent_json(sub):
    return {
        "id": sub["id"],
        "model": sub["model"],
        "turns": sub["turns"],
        "weighted_total": round(sub["weighted"]),
        "output_tokens": sub["output_tokens"],
    }


# ---- modes -------------------------------------------------------------

def cmd_default(project_dir, as_json):
    files = find_session_files(project_dir)
    sessions = [summarize_session(project_dir, p) for p in files]
    sessions.sort(key=lambda s: s["mtime"], reverse=True)
    top = sessions[:10]

    if as_json:
        print(json.dumps([session_summary_json(s) for s in top], indent=2))
        return 0

    if not top:
        print(f"pm-usage: no session transcripts under {project_dir}", file=sys.stderr)
        return 1

    headers = ["SESSION", "FIRST MESSAGE", "TURNS", "WEIGHTED", "OUTPUT TOKENS",
               "SUBAGENTS", "SUBAGENTS WEIGHTED"]
    rows = []
    for s in top:
        rows.append([
            s["session_id"],
            fmt_ts(s["first_user_ts"]),
            fmt_int(s["turns"]),
            fmt_weighted(s["weighted"]),
            fmt_int(s["output_tokens"]),
            fmt_int(len(s["subagents"])),
            fmt_weighted(s["subagents_weighted"]) if s["subagents"] else "-",
        ])
    print_table(headers, rows)
    return 0


def print_session_detail(s, as_json):
    subs = sorted(s["subagents"], key=lambda sub: sub["weighted"], reverse=True)

    if as_json:
        payload = session_summary_json(s)
        payload["subagents"] = [subagent_json(sub) for sub in subs]
        print(json.dumps(payload, indent=2))
        return

    print(f"SESSION {s['session_id']}")
    print(f"  first message   {fmt_ts(s['first_user_ts'])}")
    print(f"  turns           {fmt_int(s['turns'])}")
    print(f"  weighted total  {fmt_weighted(s['weighted'])}")
    print(f"  output tokens   {fmt_int(s['output_tokens'])}")
    if subs:
        print(f"  subagents       {fmt_int(len(subs))} (weighted {fmt_weighted(s['subagents_weighted'])})")
        print()
        print("SUBAGENTS")
        id_w = max(len(sub["id"]) for sub in subs)
        model_w = max(len(sub["model"] or "-") for sub in subs)
        for sub in subs:
            print(
                f"  {sub['id']:<{id_w}}  {(sub['model'] or '-'):<{model_w}}  "
                f"turns={fmt_int(sub['turns']):>6}  weighted={fmt_weighted(sub['weighted'])}"
            )
    else:
        print("  subagents       0")


def cmd_session(project_dir, session_id, as_json):
    path, err = resolve_session_path(project_dir, session_id)
    if err:
        print(f"pm-usage: {err}", file=sys.stderr)
        return 1
    s = summarize_session(project_dir, path)
    print_session_detail(s, as_json)
    return 0


def cmd_last(project_dir, as_json):
    files = find_session_files(project_dir)
    if not files:
        print(f"pm-usage: no session transcripts under {project_dir}", file=sys.stderr)
        return 1
    latest = max(files, key=os.path.getmtime)
    s = summarize_session(project_dir, latest)
    print_session_detail(s, as_json)
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Weighted Claude Code usage ledger for the Skilltrees PM workflow.",
    )
    parser.add_argument(
        "--project-dir",
        help="Override the ~/.claude/projects/<...> transcripts directory "
             "(default: derived from the current working directory).",
    )
    parser.add_argument(
        "--session", metavar="ID",
        help="Show one session's breakdown by subagent. Accepts a full "
             "session id or any unique prefix of one.",
    )
    parser.add_argument(
        "--last", action="store_true",
        help="Show the most recently modified session's summary and its "
             "subagents, one line each.",
    )
    parser.add_argument(
        "--json", action="store_true",
        help="Emit JSON instead of a table/text report.",
    )
    args = parser.parse_args(argv)

    project_dir = os.path.abspath(args.project_dir) if args.project_dir else default_project_dir()
    if not os.path.isdir(project_dir):
        print(f"pm-usage: no transcripts directory at {project_dir}", file=sys.stderr)
        return 1

    if args.session:
        return cmd_session(project_dir, args.session, args.json)
    if args.last:
        return cmd_last(project_dir, args.json)
    return cmd_default(project_dir, args.json)


if __name__ == "__main__":
    sys.exit(main())
