# Claude Local Docs 📚

> Local documentation system for Claude Code - instant access to Anthropic docs without web fetches

## Features

- ⚡ **10ms local access** vs 500ms+ web fetches
- 🔄 **Auto-sync every 3 hours** via GitHub Actions
- 🔍 **Full-text search** across all documentation
- 📦 **One-line installation** for immediate setup
- 🎯 **Git-based updates** with version control
- 💾 **Works offline** after initial sync

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/tacit-code/claude-local-docs/main/install.sh | bash
```

## What It Does

1. **Downloads** all Claude Code documentation locally to `~/.claude-docs`
2. **Indexes** content for instant searching
3. **Integrates** with Claude via `/docs` command
4. **Syncs** automatically every 3 hours
5. **Updates** on-demand when you use `/docs`

## Usage

After installation, use the `/docs` command in Claude:

```
/docs how to create custom commands
/docs MCP server setup
/docs hooks configuration
```

## Documentation Coverage

30+ pages from docs.anthropic.com including:
- Getting Started guides
- SDK documentation
- MCP (Model Context Protocol)
- Hooks and Commands
- Deployment options
- Security and Administration

## Manual Installation

```bash
# Clone the repository
git clone https://github.com/tacit-code/claude-local-docs.git ~/.claude-docs

# Run setup
cd ~/.claude-docs
./setup.sh
```

## Architecture

```
~/.claude-docs/
├── content/          # Markdown documentation files
├── scripts/          # Fetcher and indexer scripts  
├── hooks/           # Git hooks for updates
└── docs-index.json  # Searchable index
```

## Sync Mechanism

- **GitHub Action**: Fetches latest docs every 3 hours
- **Pre-hook**: Updates before each `/docs` command
- **Manual**: Run `~/.claude-docs/sync.sh` anytime

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT - See LICENSE file