#!/bin/bash

echo "🚀 Setting up Supabase MCP Server for Cursor"
echo "=============================================="
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the mcp-server directory"
  exit 1
fi

# Step 2: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Build the TypeScript code
echo "🔨 Step 2: Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Failed to build TypeScript"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Step 4: Check environment variables
echo "🔍 Step 3: Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL is not set"
  echo "   Please set it in your shell or .env file"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY is not set"
  echo "   Please set it in your shell or .env file"
fi
echo ""

# Step 5: Test the server
echo "🧪 Step 4: Testing the MCP server..."
npm test
echo ""

# Step 6: Instructions
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Make sure your environment variables are set:"
echo "   export NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'"
echo "   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
echo ""
echo "2. The MCP server is configured in .vscode/settings.json"
echo ""
echo "3. Restart Cursor to load the MCP server"
echo ""
echo "4. Check Cursor's MCP tools list (Cmd/Ctrl + Shift + P → 'MCP')"
echo ""
echo "5. You should see these tools available:"
echo "   - query_table"
echo "   - insert_row"
echo "   - update_row"
echo "   - delete_row"
echo "   - execute_rpc"
echo "   - get_database_stats"
echo "   - list_tables"
echo ""
echo "🎉 Your Supabase MCP server is ready!"





