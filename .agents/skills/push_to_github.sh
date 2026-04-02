#!/bin/bash
# push_to_github.sh
# Pushes the current slayer-idle-main workspace to bearpixelmedia/slayer-idle on GitHub.
# Requires $GITHUB_PAT to be set in the environment.

set -e

REPO_DIR="/app/slayer-idle/slayer-idle-main"
GITHUB_REMOTE="https://x-access-token:${GITHUB_PAT}@github.com/bearpixelmedia/slayer-idle.git"
COMMIT_MSG="${1:-"GDE: sync game code changes"}"

cd "$REPO_DIR"

# Configure git identity
git config user.email "gde-agent@base44.com"
git config user.name "GDE Agent"

# Ensure github remote points to correct repo
git remote remove github 2>/dev/null || true
git remote add github "$GITHUB_REMOTE"

# Fetch latest from GitHub to detect conflicts
git fetch github 2>&1

# Stage all changes
git add src/ public/sprites/ 2>/dev/null || true

# Check if there's anything to commit
if git diff --cached --quiet; then
  echo "✅ Nothing to commit — workspace matches last commit."
else
  git commit -m "$COMMIT_MSG"
  echo "✅ Committed: $COMMIT_MSG"
fi

# Push to GitHub main
git push github HEAD:main
echo "✅ Pushed to github.com/bearpixelmedia/slayer-idle"
