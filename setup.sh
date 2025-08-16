#!/bin/bash
# Local setup script (alternative to installer)

set -e

echo "📚 Setting up Claude Local Docs..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Fetch documentation
echo "Fetching documentation..."
node scripts/fetch-docs.js

# Build index
echo "Building search index..."
node scripts/index-docs.js

# Copy command to Claude
CLAUDE_COMMANDS="$HOME/.claude/commands"
if [ -d "$CLAUDE_COMMANDS" ]; then
    cp commands/docs.md "$CLAUDE_COMMANDS/docs.md"
    echo "✅ /docs command installed"
else
    echo "⚠️  Claude commands directory not found. Please manually copy commands/docs.md to ~/.claude/commands/"
fi

echo "\n✅ Setup complete!"
echo "Use /docs <query> in Claude to search documentation"