#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing MCP Setup for Winksy.ai');
console.log('=====================================');
console.log('');

async function testMCPServer(serverName, command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Testing ${serverName}...`);

    const child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let output = '';
    let errorOutput = '';

    // Send initialize request
    setTimeout(() => {
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

      child.stdin.write(JSON.stringify(initRequest) + '\n');

      // Wait a bit then check for response
      setTimeout(() => {
        if (output.includes('result') || output.includes('error')) {
          console.log(`✅ ${serverName} responded successfully`);
          child.kill();
          resolve(true);
        } else {
          console.log(`❌ ${serverName} no response or error`);
          console.log('Output:', output.substring(0, 200));
          if (errorOutput) console.log('Errors:', errorOutput.substring(0, 200));
          child.kill();
          resolve(false);
        }
      }, 2000);
    }, 1000);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('error', (error) => {
      console.log(`❌ ${serverName} failed to start:`, error.message);
      resolve(false);
    });
  });
}

async function testAllMCPServers() {
  const results = [];

  // Test Supabase MCP
  const supabaseResult = await testMCPServer(
    'Supabase MCP',
    'node',
    ['dist/index.js'],
    '../mcp-server'
  );
  results.push({ name: 'Supabase MCP', status: supabaseResult });

  // Test Filesystem MCP
  const fsResult = await testMCPServer(
    'Filesystem MCP',
    'node',
    ['dist/index.js'],
    '../filesystem-mcp'
  );
  results.push({ name: 'Filesystem MCP', status: fsResult });

  // Test Memory MCP
  const memoryResult = await testMCPServer(
    'Memory MCP',
    'node',
    ['dist/index.js'],
    '../memory-mcp'
  );
  results.push({ name: 'Memory MCP', status: memoryResult });

  console.log('');
  console.log('📊 Test Results:');
  console.log('================');

  results.forEach(result => {
    const status = result.status ? '✅ Working' : '❌ Failed';
    console.log(`${result.name}: ${status}`);
  });

  const workingCount = results.filter(r => r.status).length;
  console.log('');
  console.log(`🎯 Summary: ${workingCount}/${results.length} MCP servers are working`);

  if (workingCount === results.length) {
    console.log('');
    console.log('🎉 All MCP servers are properly configured!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npm run cursor:mcp (unified interface)');
    console.log('2. Or use individual commands:');
    console.log('   - npm run mcp:interactive');
    console.log('   - npm run fs:search "pattern"');
    console.log('   - npm run memory:stats');
  } else {
    console.log('');
    console.log('⚠️  Some MCP servers need attention. Check the error messages above.');
  }
}

testAllMCPServers().catch(console.error);






