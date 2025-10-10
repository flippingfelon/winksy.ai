#!/bin/bash

# Quick build script for MCP server
set -e

echo "🔨 Building Supabase MCP Server..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Compiling TypeScript..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "Run 'npm test' to test the server"




