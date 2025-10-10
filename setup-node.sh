#!/bin/bash

# Node.js Setup Script for macOS
set -e

echo "🍺 Installing Homebrew (recommended for macOS)..."
echo "=================================================="
echo ""

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo ""
echo "📦 Installing Node.js via Homebrew..."
echo "======================================"
echo ""

# Add Homebrew to PATH for Apple Silicon Macs
if [[ $(uname -m) == 'arm64' ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

brew install node

echo ""
echo "✅ Node.js installed successfully!"
echo ""
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""
echo "🎉 You're ready to build the MCP server!"
echo ""
echo "Next steps:"
echo "1. cd mcp-server"
echo "2. npm install"
echo "3. npm run build"
echo "4. npm test"
echo "5. Restart Cursor"


