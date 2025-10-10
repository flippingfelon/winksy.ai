#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing Supabase MCP Server');
console.log('================================\n');

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  console.error('\nPlease set these environment variables before running the test.');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   API Key: ${supabaseKey.substring(0, 20)}...`);
console.log('');

async function testMCP() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting MCP server...\n');

    const mcp = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: process.env
    });

    let responses = [];
    let currentResponse = '';

    mcp.stdout.on('data', (data) => {
      currentResponse += data.toString();
      
      // Try to parse complete JSON responses
      const lines = currentResponse.split('\n');
      currentResponse = lines.pop() || ''; // Keep incomplete line for next chunk
      
      lines.forEach(line => {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            responses.push(response);
            console.log('📨 Response received:', JSON.stringify(response, null, 2));
            console.log('');
          } catch (e) {
            // Not valid JSON, ignore
          }
        }
      });
    });

    // Test sequence
    setTimeout(() => {
      console.log('1️⃣  Sending initialize request...');
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };
      mcp.stdin.write(JSON.stringify(initRequest) + '\n');
    }, 500);

    setTimeout(() => {
      console.log('2️⃣  Requesting tools list...');
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      mcp.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1500);

    setTimeout(() => {
      console.log('3️⃣  Testing database stats...');
      const statsRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_database_stats',
          arguments: {}
        }
      };
      mcp.stdin.write(JSON.stringify(statsRequest) + '\n');
    }, 2500);

    setTimeout(() => {
      console.log('4️⃣  Listing tables...');
      const listTablesRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'list_tables',
          arguments: {}
        }
      };
      mcp.stdin.write(JSON.stringify(listTablesRequest) + '\n');
    }, 3500);

    setTimeout(() => {
      mcp.kill();
      
      console.log('');
      console.log('📊 Test Summary');
      console.log('================');
      console.log(`Total responses: ${responses.length}`);
      console.log('');

      const hasErrors = responses.some(r => r.error);
      
      if (hasErrors) {
        console.log('❌ Some tests failed');
        responses.filter(r => r.error).forEach(r => {
          console.log(`   Error in response ${r.id}: ${r.error.message}`);
        });
      } else if (responses.length >= 4) {
        console.log('✅ All tests passed!');
        console.log('');
        console.log('🎉 Your Supabase MCP server is working correctly!');
        console.log('');
        console.log('💡 Available tools:');
        const toolsResponse = responses.find(r => r.id === 2);
        if (toolsResponse?.result?.tools) {
          toolsResponse.result.tools.forEach(tool => {
            console.log(`   - ${tool.name}: ${tool.description}`);
          });
        }
      } else {
        console.log('⚠️  Incomplete test - received only', responses.length, 'responses');
      }
      
      resolve(responses);
    }, 5000);

    mcp.on('error', (error) => {
      console.error('❌ Failed to start MCP server:', error);
      reject(error);
    });
  });
}

testMCP().catch(console.error);





