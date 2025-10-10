# Cursor MCP Setup Guide for Supabase

This guide will help you configure the Supabase MCP server in Cursor IDE.

## Quick Setup

### 1. Build the MCP Server

```bash
cd mcp-server
chmod +x setup-cursor.sh
./setup-cursor.sh
```

Or manually:

```bash
cd mcp-server
npm install
npm run build
npm test
```

### 2. Set Environment Variables

You need to set these environment variables. Choose one method:

#### Option A: In your shell profile (~/.zshrc or ~/.bashrc)

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://ixtfidglwgmapwcgdhlq.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

#### Option B: In a .env file (mcp-server/.env)

```bash
cd mcp-server
cat > .env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://ixtfidglwgmapwcgdhlq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

### 3. Configure Cursor

The MCP server is already configured in `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "supabase": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "${env:NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${env:SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

### 4. Restart Cursor

**Important:** You must restart Cursor completely for MCP changes to take effect.

1. Quit Cursor entirely (Cmd+Q on Mac, Alt+F4 on Windows)
2. Reopen Cursor
3. Open this project

### 5. Verify MCP Tools

Check if the Supabase MCP tools are available:

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Type "MCP" 
3. Look for MCP-related commands
4. Or check the AI chat - it should have access to these tools:
   - query_table
   - insert_row
   - update_row
   - delete_row
   - execute_rpc
   - get_database_stats
   - list_tables

## Alternative: Manual Cursor Settings Configuration

If the .vscode/settings.json doesn't work, you can configure it in Cursor's global settings:

1. Open Cursor Settings (Cmd+, / Ctrl+,)
2. Search for "MCP"
3. Click "Edit in settings.json"
4. Add this configuration:

```json
{
  "mcp.servers": {
    "supabase": {
      "command": "node",
      "args": ["/Users/hailee/Winksy/winksy.ai/mcp-server/dist/index.js"],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "https://ixtfidglwgmapwcgdhlq.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
      }
    }
  }
}
```

**Note:** Use absolute paths in global settings.

## Troubleshooting

### MCP Server Not Showing Up

1. **Check if Node.js is in PATH:**
   ```bash
   which node
   node --version
   ```

2. **Verify the build:**
   ```bash
   cd mcp-server
   ls -la dist/index.js
   ```

3. **Test manually:**
   ```bash
   cd mcp-server
   npm test
   ```

4. **Check Cursor logs:**
   - Help → Toggle Developer Tools
   - Look for MCP-related errors in the console

### Environment Variables Not Loading

If environment variables aren't being picked up:

1. **Set them in the .vscode/settings.json directly:**
   ```json
   {
     "mcp.servers": {
       "supabase": {
         "command": "node",
         "args": ["mcp-server/dist/index.js"],
         "env": {
           "NEXT_PUBLIC_SUPABASE_URL": "https://ixtfidglwgmapwcgdhlq.supabase.co",
           "SUPABASE_SERVICE_ROLE_KEY": "actual-key-here"
         }
       }
     }
   }
   ```

2. **Or use a .env file with dotenv:**
   Update the command to use dotenv:
   ```json
   {
     "mcp.servers": {
       "supabase": {
         "command": "node",
         "args": ["-r", "dotenv/config", "mcp-server/dist/index.js"],
         "env": {
           "DOTENV_CONFIG_PATH": "mcp-server/.env"
         }
       }
     }
   }
   ```

### Permission Issues

Make the setup script executable:
```bash
chmod +x mcp-server/setup-cursor.sh
```

## Testing the MCP Server

### Quick Test
```bash
cd mcp-server
npm test
```

### Interactive Test
```bash
npm run mcp:interactive
```

### Get Database Stats
```bash
npm run mcp:stats
```

## Usage Examples

Once configured, you can ask Cursor AI to:

- "Show me all lash techs from the database"
- "Count how many bookings we have"
- "List all services"
- "Query the profiles table"
- "Get database statistics"

The AI will automatically use the MCP tools to interact with your Supabase database!

## Security Notes

⚠️ **Important:**
- The SERVICE_ROLE_KEY has full database access
- Never commit this key to version control
- Consider using read-only keys for development
- Use RLS policies to protect sensitive data

## Next Steps

1. ✅ Build the MCP server
2. ✅ Set environment variables
3. ✅ Restart Cursor
4. ✅ Verify tools are available
5. 🚀 Start using natural language to query your database!

## Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [Cursor Documentation](https://docs.cursor.com)
- [Supabase Documentation](https://supabase.com/docs)





