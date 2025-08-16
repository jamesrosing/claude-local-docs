#!/bin/bash
# Claude Local Docs Installer
# One-line installer for Claude Code local documentation system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Claude Local Docs Installer${NC}"
echo -e "${BLUE}================================${NC}\n"

# Configuration
DOCS_DIR="$HOME/.claude-docs"
GITHUB_REPO="https://github.com/jamesrosing/claude-local-docs.git"
CLAUDE_COMMANDS="$HOME/.claude/commands"

# Check for required tools
echo -e "${YELLOW}📋 Checking requirements...${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All requirements met${NC}\n"

# Clone or update repository
if [ -d "$DOCS_DIR" ]; then
    echo -e "${YELLOW}📁 Updating existing installation...${NC}"
    cd "$DOCS_DIR"
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone "$GITHUB_REPO" "$DOCS_DIR"
    cd "$DOCS_DIR"
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install --silent

# Fetch initial documentation
echo -e "\n${YELLOW}📚 Fetching Claude documentation...${NC}"
node scripts/fetch-docs.js

# Create search index
echo -e "\n${YELLOW}🔍 Building search index...${NC}"
node scripts/index-docs.js

# Create Claude commands directory if it doesn't exist
if [ ! -d "$CLAUDE_COMMANDS" ]; then
    mkdir -p "$CLAUDE_COMMANDS"
fi

# Install /docs command
echo -e "\n${YELLOW}⚙️  Installing /docs command...${NC}"
cp commands/docs.md "$CLAUDE_COMMANDS/docs.md"

# Create sync script
cat > "$DOCS_DIR/sync.sh" << 'EOF'
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
EOF
chmod +x "$DOCS_DIR/sync.sh"

# Set up cron job for auto-sync (every 3 hours)
echo -e "\n${YELLOW}⏰ Setting up auto-sync...${NC}"

# Check if crontab exists, create if not
crontab -l 2>/dev/null > /tmp/current_cron || true

# Remove any existing claude-docs entries
grep -v "claude-docs/sync.sh" /tmp/current_cron > /tmp/new_cron || true

# Add new cron job
echo "0 */3 * * * $DOCS_DIR/sync.sh > /dev/null 2>&1" >> /tmp/new_cron

# Install new crontab
crontab /tmp/new_cron
rm /tmp/current_cron /tmp/new_cron

echo -e "${GREEN}✅ Auto-sync scheduled every 3 hours${NC}"

# Add to shell configuration
SHELL_RC="${HOME}/.bashrc"
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_RC="${HOME}/.zshrc"
fi

if ! grep -q "CLAUDE_DOCS_DIR" "$SHELL_RC" 2>/dev/null; then
    echo -e "\n${YELLOW}🐚 Adding to shell configuration...${NC}"
    cat >> "$SHELL_RC" << 'EOF'

# Claude Local Docs
export CLAUDE_DOCS_DIR="$HOME/.claude-docs"
alias docs-sync="~/.claude-docs/sync.sh"
alias docs-search="node ~/.claude-docs/scripts/search.js"
EOF
    echo -e "${GREEN}✅ Shell configuration updated${NC}"
fi

# Final message
echo -e "\n${GREEN}🎉 Installation Complete!${NC}"
echo -e "\n📚 Documentation installed at: ${BLUE}$DOCS_DIR${NC}"
echo -e "🔍 Use ${BLUE}/docs <query>${NC} in Claude to search"
echo -e "🔄 Manual sync: ${BLUE}docs-sync${NC}"
echo -e "⏰ Auto-sync: Every 3 hours\n"

echo -e "${YELLOW}💡 Tip: Restart your shell or run 'source $SHELL_RC' to use aliases${NC}"