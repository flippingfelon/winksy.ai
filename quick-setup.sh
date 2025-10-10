#!/bin/bash

# One-command Node.js + MCP setup
set -e

echo "🚀 Quick Node.js + MCP Setup for macOS"
echo "======================================="

# Install Homebrew
echo "🍺 Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH
if [[ $(uname -m) == 'arm64' ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
fi

# Install Node.js
echo "📦 Installing Node.js..."
brew install node

# Build MCP server
echo "🔨 Building MCP server..."
cd "$(dirname "$0")/mcp-server"
npm install
npm run build
npm test

echo ""
echo "✅ Setup complete! Restart Cursor to use Supabase MCP tools."


