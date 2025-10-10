#!/bin/bash

# Manual Node.js Setup Script for macOS
set -e

echo "📦 Manual Node.js Installation for macOS"
echo "=========================================="
echo ""

echo "This script will download and install Node.js manually."
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Detect architecture
ARCH=$(uname -m)
if [[ $ARCH == 'arm64' ]]; then
    NODE_URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-darwin-arm64.tar.gz"
    NODE_DIR="node-v20.11.1-darwin-arm64"
elif [[ $ARCH == 'x86_64' ]]; then
    NODE_URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-darwin-x64.tar.gz"
    NODE_DIR="node-v20.11.1-darwin-x64"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

echo "🔄 Downloading Node.js for $ARCH..."
curl -O $NODE_URL

echo "📦 Extracting Node.js..."
tar -xf node-v20.11.1-darwin-*.tar.gz

echo "🔧 Installing Node.js to /usr/local..."
sudo mkdir -p /usr/local/lib/nodejs
sudo mv $NODE_DIR /usr/local/lib/nodejs/

echo "🔗 Creating symlinks..."
sudo ln -sf /usr/local/lib/nodejs/$NODE_DIR/bin/node /usr/local/bin/node
sudo ln -sf /usr/local/lib/nodejs/$NODE_DIR/bin/npm /usr/local/bin/npm
sudo ln -sf /usr/local/lib/nodejs/$NODE_DIR/bin/npx /usr/local/bin/npx

echo "🧹 Cleaning up..."
rm node-v20.11.1-darwin-*.tar.gz

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


