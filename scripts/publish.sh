#!/usr/bin/env bash
# scripts/publish.sh — single-command publish for the Skilltrees atlas.
#
# Usage:  bash scripts/publish.sh ["commit message"]
#
# Validates data/*.json, stages them, commits, and pushes to origin.
# Exit codes:
#   0  success (or nothing to commit)
#   1  validation failure (no commit made)
#   2  git error
#
# Designed to run from Git Bash on Windows or any POSIX shell.

set -euo pipefail

# Resolve the repo root (this script lives in scripts/).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

MSG="${1:-atlas edits}"

if command -v node >/dev/null 2>&1; then
  echo "→ Validating data/*.json…"
  if ! node "$SCRIPT_DIR/validate.js"; then
    echo "✗ Validation failed. No commit made." >&2
    exit 1
  fi
else
  echo "! Node not found on PATH — skipping local validation." >&2
  echo "  Install Node 20 LTS from https://nodejs.org/ to enable it." >&2
  echo "  GitHub Actions will validate on push as a fallback." >&2
fi

echo "→ Staging data/…"
git add data

if git diff --cached --quiet; then
  echo "= No changes in data/. Nothing to commit."
  exit 0
fi

echo "→ Committing: $MSG"
git commit -m "$MSG"

echo "→ Pushing…"
if ! git push; then
  echo "✗ Push failed. Commit is local only." >&2
  exit 2
fi

echo "✓ Done. Live site rebuilds in ~30s; hard-refresh your browser tab to see edits."
