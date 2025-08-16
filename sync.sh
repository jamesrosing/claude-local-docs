#!/bin/bash
# Sync Claude documentation
cd ~/.claude-docs
git fetch origin
if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
    echo "Updating documentation..."
    git pull --quiet
    node scripts/fetch-docs.js
    node scripts/index-docs.js
    echo "Documentation updated successfully"
else
    echo "Documentation is up to date"
fi
