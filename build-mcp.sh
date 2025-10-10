#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building Supabase MCP Server${NC}"
echo "========================================"
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH${NC}"
    echo ""
    echo "Please install Node.js first:"
    echo "  - Via Homebrew: brew install node"
    echo "  - Via website: https://nodejs.org"
    echo ""
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Navigate to MCP server directory
cd "$(dirname "$0")/mcp-server" || {
    echo -e "${RED}❌ Error: Could not navigate to mcp-server directory${NC}"
    exit 1
}

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔨 Step 2: Building TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build TypeScript${NC}"
    exit 1
fi
echo -e "${GREEN}✅ TypeScript compiled successfully${NC}"
echo ""

# Check if the output file exists
if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}❌ Error: dist/index.js was not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build output verified: dist/index.js${NC}"
echo ""

# Check environment variables
echo -e "${BLUE}🔍 Step 3: Checking environment variables...${NC}"

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL is not set${NC}"
    ENV_MISSING=true
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL is set${NC}"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set${NC}"
    ENV_MISSING=true
else
    echo -e "${GREEN}✅ Supabase API key is set${NC}"
fi

if [ "$ENV_MISSING" = true ]; then
    echo ""
    echo -e "${YELLOW}📝 To set environment variables, add to your ~/.zshrc or ~/.bashrc:${NC}"
    echo ""
    echo "export NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'"
    echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    echo ""
    echo "Then run: source ~/.zshrc"
    echo ""
fi

echo ""
echo -e "${BLUE}🧪 Step 4: Testing the MCP server...${NC}"
echo ""

npm test

echo ""
echo -e "${GREEN}✨ Build Complete!${NC}"
echo "==================="
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. ${GREEN}Restart Cursor completely${NC} (Quit and reopen)"
echo ""
echo "2. Open this project in Cursor"
echo ""
echo "3. The MCP server should now appear in your MCP tools list"
echo ""
echo "4. Try asking Cursor AI:"
echo "   - 'Show me database stats'"
echo "   - 'List all tables'"
echo "   - 'Query the profiles table'"
echo ""
echo -e "${GREEN}🎉 Your Supabase MCP server is ready!${NC}"




