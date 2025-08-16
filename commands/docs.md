---
name: docs
description: Search local Claude documentation instantly
aliases: [doc, documentation, help]
allowed-tools: Read, Grep
---

# Local Documentation Search

Searches the local Claude Code documentation without web fetches.

## Pre-execution Hook

```bash
# Update docs if needed
if [ -d ~/.claude-docs ]; then
  cd ~/.claude-docs
  git fetch origin --quiet
  if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
    git pull --quiet
    node scripts/index-docs.js
  fi
fi
```

## Usage

```
/docs <search query>
```

## Examples

- `/docs MCP servers` - Find MCP documentation
- `/docs hooks configuration` - Learn about hooks
- `/docs slash commands` - Command documentation
- `/docs sdk api` - SDK reference

## Implementation

The command searches through locally cached documentation at `~/.claude-docs/content/` using a full-text search index. Results are ranked by relevance with title matches weighted highest.

## Search Process

1. Query parsing and term extraction
2. Index search with relevance scoring
3. Return top 5 most relevant documents
4. Display summaries and file paths
5. Read full documentation as needed