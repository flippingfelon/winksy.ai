#!/usr/bin/env node

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as readline from 'readline';

interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class SupabaseMCPServer {
  private supabase: SupabaseClient | null = null;
  private initialized = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params);
        
        case 'tools/list':
          return this.handleToolsList(id);
        
        case 'tools/call':
          return await this.handleToolCall(id, params);
        
        case 'resources/list':
          return this.handleResourcesList(id);
        
        default:
          return this.errorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error: any) {
      return this.errorResponse(id, -32603, `Internal error: ${error.message}`);
    }
  }

  private handleInitialize(id: number | string, params: any): JsonRpcResponse {
    this.initialized = true;
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: {
          name: 'supabase-mcp-server',
          version: '1.0.0'
        }
      }
    };
  }

  private handleToolsList(id: number | string): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'query_table',
            description: 'Query data from a Supabase table with optional filters',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Name of the table to query'
                },
                select: {
                  type: 'string',
                  description: 'Columns to select (e.g., "*" or "id,name,email")',
                  default: '*'
                },
                filter: {
                  type: 'object',
                  description: 'Filter conditions (e.g., {column: "value"})',
                  additionalProperties: true
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of rows to return',
                  default: 100
                },
                orderBy: {
                  type: 'object',
                  description: 'Order by configuration (e.g., {column: "created_at", ascending: false})',
                  properties: {
                    column: { type: 'string' },
                    ascending: { type: 'boolean', default: true }
                  }
                }
              },
              required: ['table']
            }
          },
          {
            name: 'insert_row',
            description: 'Insert a new row into a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Name of the table'
                },
                data: {
                  type: 'object',
                  description: 'Data to insert',
                  additionalProperties: true
                }
              },
              required: ['table', 'data']
            }
          },
          {
            name: 'update_row',
            description: 'Update rows in a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Name of the table'
                },
                filter: {
                  type: 'object',
                  description: 'Filter to identify rows to update',
                  additionalProperties: true
                },
                data: {
                  type: 'object',
                  description: 'Data to update',
                  additionalProperties: true
                }
              },
              required: ['table', 'filter', 'data']
            }
          },
          {
            name: 'delete_row',
            description: 'Delete rows from a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Name of the table'
                },
                filter: {
                  type: 'object',
                  description: 'Filter to identify rows to delete',
                  additionalProperties: true
                }
              },
              required: ['table', 'filter']
            }
          },
          {
            name: 'execute_rpc',
            description: 'Execute a Supabase RPC (stored procedure/function)',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: {
                  type: 'string',
                  description: 'Name of the RPC function'
                },
                params: {
                  type: 'object',
                  description: 'Parameters to pass to the function',
                  additionalProperties: true
                }
              },
              required: ['function_name']
            }
          },
          {
            name: 'get_database_stats',
            description: 'Get statistics about the database (table counts, etc.)',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'list_tables',
            description: 'List all tables in the database',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      }
    };
  }

  private async handleToolCall(id: number | string, params: any): Promise<JsonRpcResponse> {
    if (!this.supabase) {
      return this.errorResponse(id, -32603, 'Supabase client not initialized. Check environment variables.');
    }

    const { name, arguments: args } = params;

    try {
      let result;

      switch (name) {
        case 'query_table':
          result = await this.queryTable(args);
          break;
        
        case 'insert_row':
          result = await this.insertRow(args);
          break;
        
        case 'update_row':
          result = await this.updateRow(args);
          break;
        
        case 'delete_row':
          result = await this.deleteRow(args);
          break;
        
        case 'execute_rpc':
          result = await this.executeRpc(args);
          break;
        
        case 'get_database_stats':
          result = await this.getDatabaseStats();
          break;
        
        case 'list_tables':
          result = await this.listTables();
          break;
        
        default:
          return this.errorResponse(id, -32601, `Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };
    } catch (error: any) {
      return this.errorResponse(id, -32603, `Tool execution error: ${error.message}`);
    }
  }

  private async queryTable(args: any) {
    const { table, select = '*', filter = {}, limit = 100, orderBy } = args;
    
    let query = this.supabase!.from(table).select(select).limit(limit);
    
    // Apply filters
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      data,
      count: data?.length || 0
    };
  }

  private async insertRow(args: any) {
    const { table, data } = args;
    
    const { data: result, error } = await this.supabase!
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    
    return {
      success: true,
      data: result
    };
  }

  private async updateRow(args: any) {
    const { table, filter, data } = args;
    
    let query = this.supabase!.from(table).update(data);
    
    // Apply filters
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
    
    const { data: result, error } = await query.select();
    
    if (error) throw error;
    
    return {
      success: true,
      data: result,
      count: result?.length || 0
    };
  }

  private async deleteRow(args: any) {
    const { table, filter } = args;
    
    let query = this.supabase!.from(table).delete();
    
    // Apply filters
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
    
    const { data: result, error } = await query.select();
    
    if (error) throw error;
    
    return {
      success: true,
      deleted: result?.length || 0
    };
  }

  private async executeRpc(args: any) {
    const { function_name, params = {} } = args;
    
    const { data, error } = await this.supabase!.rpc(function_name, params);
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  }

  private async getDatabaseStats() {
    try {
      const tables = ['profiles', 'lash_techs', 'bookings', 'services', 'reviews', 'points', 'user_levels'];
      const stats: any = {};
      
      for (const table of tables) {
        try {
          const { count, error } = await this.supabase!
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            stats[table] = count || 0;
          }
        } catch (err) {
          // Table might not exist, skip it
          stats[table] = 'N/A';
        }
      }
      
      return {
        success: true,
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async listTables() {
    // This is a simplified version - in production you'd query pg_tables
    const knownTables = [
      'profiles',
      'lash_techs',
      'bookings',
      'services',
      'reviews',
      'points',
      'user_levels',
      'lash_maps'
    ];
    
    return {
      success: true,
      tables: knownTables
    };
  }

  private handleResourcesList(id: number | string): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resources: []
      }
    };
  }

  private errorResponse(id: number | string, code: number, message: string): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }
}

// Main server execution
async function main() {
  const server = new SupabaseMCPServer();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    try {
      const request: JsonRpcRequest = JSON.parse(line);
      const response = await server.handleRequest(request);
      console.log(JSON.stringify(response));
    } catch (error: any) {
      console.error(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`
        }
      }));
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch(console.error);





