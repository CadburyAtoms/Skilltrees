#!/usr/bin/env bash
# scripts/install-hooks.sh — install the tracked pre-commit hook into .git/hooks.
#
# Run once, after cloning:
#   bash scripts/install-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_SRC="$REPO_ROOT/scripts/pre-commit"
HOOK_DST="$REPO_ROOT/.git/hooks/pre-commit"

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "✓ Installed pre-commit hook at .git/hooks/pre-commit"
echo "  (a shim that execs scripts/pre-commit-body — edit the body directly, no reinstall needed)"
echo "  Bypass with git commit --no-verify if needed."
