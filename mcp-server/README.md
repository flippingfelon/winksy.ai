# Supabase MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with direct access to your Supabase database.

## Features

- **Query Tables**: Retrieve data with filters, ordering, and limits
- **Insert Rows**: Add new data to any table
- **Update Rows**: Modify existing records
- **Delete Rows**: Remove records with filters
- **Execute RPC**: Call Supabase stored procedures/functions
- **Database Stats**: Get table counts and statistics
- **List Tables**: View all available tables

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Set Environment Variables

Create a `.env` file or export these variables:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Test the Server

```bash
npm test
```

## Usage

### Start the Server

```bash
npm start
```

### Available Tools

#### 1. query_table
Query data from a table with optional filtering and ordering.

**Parameters:**
- `table` (required): Table name
- `select` (optional): Columns to select (default: "*")
- `filter` (optional): Filter conditions as key-value pairs
- `limit` (optional): Maximum rows to return (default: 100)
- `orderBy` (optional): Order configuration with `column` and `ascending` properties

**Example:**
```json
{
  "name": "query_table",
  "arguments": {
    "table": "profiles",
    "select": "id,email,full_name",
    "filter": { "role": "lash_tech" },
    "limit": 10,
    "orderBy": { "column": "created_at", "ascending": false }
  }
}
```

#### 2. insert_row
Insert a new row into a table.

**Parameters:**
- `table` (required): Table name
- `data` (required): Object with column-value pairs

**Example:**
```json
{
  "name": "insert_row",
  "arguments": {
    "table": "bookings",
    "data": {
      "user_id": "123",
      "tech_id": "456",
      "service_id": "789",
      "booking_date": "2024-12-01T10:00:00Z"
    }
  }
}
```

#### 3. update_row
Update existing rows.

**Parameters:**
- `table` (required): Table name
- `filter` (required): Filter to identify rows
- `data` (required): Data to update

**Example:**
```json
{
  "name": "update_row",
  "arguments": {
    "table": "bookings",
    "filter": { "id": "booking-123" },
    "data": { "status": "confirmed" }
  }
}
```

#### 4. delete_row
Delete rows from a table.

**Parameters:**
- `table` (required): Table name
- `filter` (required): Filter to identify rows

**Example:**
```json
{
  "name": "delete_row",
  "arguments": {
    "table": "bookings",
    "filter": { "id": "booking-123" }
  }
}
```

#### 5. execute_rpc
Execute a Supabase RPC function.

**Parameters:**
- `function_name` (required): Name of the function
- `params` (optional): Parameters to pass

**Example:**
```json
{
  "name": "execute_rpc",
  "arguments": {
    "function_name": "get_nearby_techs",
    "params": { "lat": 40.7128, "lng": -74.0060 }
  }
}
```

#### 6. get_database_stats
Get statistics about database tables.

**Example:**
```json
{
  "name": "get_database_stats",
  "arguments": {}
}
```

#### 7. list_tables
List all available tables.

**Example:**
```json
{
  "name": "list_tables",
  "arguments": {}
}
```

## Integration with Cursor

To use this MCP server in Cursor, add it to your Cursor configuration:

### From the Main Project

```bash
# Test the server
npm run mcp:test

# Start the server
npm run mcp:start

# Run interactive mode
npm run mcp:interactive

# Get database stats
npm run mcp:stats
```

## Development

### Watch Mode

```bash
npm run dev
```

This will watch for TypeScript changes and recompile automatically.

### Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript output
├── test-mcp.js          # Test script
├── package.json
├── tsconfig.json
└── README.md
```

## Security Notes

- Always use the **service role key** for full database access
- Be cautious with delete and update operations
- Consider implementing additional validation for production use
- Row Level Security (RLS) policies still apply when using the anon key

## Troubleshooting

### Environment Variables Not Found
Make sure your environment variables are set:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Build Errors
Clean the dist folder and rebuild:
```bash
rm -rf dist
npm run build
```

### Connection Errors
Verify your Supabase credentials and network connectivity.

## License

MIT





