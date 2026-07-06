#!/usr/bin/env bash
# Purge the deleted PDFs/PNGs from ALL git history (TODO_REPO_HYGIENE item 2, step 2).
#
# ███ DESTRUCTIVE — READ BEFORE RUNNING ███
# This rewrites every commit and FORCE-PUSHES main. After it runs:
#   - every other clone of this repo must be re-cloned (or hard-reset),
#   - every open branch/PR must be rebased onto the rewritten history.
# Run it ONLY on Ben's machine, ONLY when no branches/PRs are open, from a
# FRESH clone (git-filter-repo refuses to run on a clone with extra state).
#
# Prereq: pip install git-filter-repo   (https://github.com/newren/git-filter-repo)
#
# Usage:
#   cd <fresh clone of Skilltrees>
#   CONFIRM_HISTORY_REWRITE=yes bash scripts/purge-binaries-from-history.sh

set -euo pipefail

if [ "${CONFIRM_HISTORY_REWRITE:-}" != "yes" ]; then
  echo "Refusing to run: set CONFIRM_HISTORY_REWRITE=yes after reading the header." >&2
  exit 1
fi
command -v git-filter-repo >/dev/null 2>&1 || {
  echo "git-filter-repo not found — install it first (pip install git-filter-repo)." >&2
  exit 1
}

# Strip every PDF and screenshot PNG that ever lived under source-materials/,
# plus the root-level superseded atlas snapshots if they're gone from HEAD.
git filter-repo \
  --invert-paths \
  --path-glob 'source-materials/**/*.pdf' \
  --path-glob 'source-materials/**/*.png' \
  --path 'Leyline Atlas v-pre-tierdie.html' \
  --path 'Leyline Atlas v-pre-wireup.html'

# filter-repo removes the origin remote as a safety measure; re-add and push.
git remote add origin https://github.com/CadburyAtoms/Skilltrees.git
git push --force-with-lease origin main

echo "Done. Tell every open session/clone to re-clone. Check repo size on GitHub"
echo "(Settings → may take a gc cycle on GitHub's side to shrink)."
