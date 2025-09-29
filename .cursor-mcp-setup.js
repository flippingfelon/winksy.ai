#!/usr/bin/env node

/**
 * Cursor MCP Integration Setup
 * Provides easy access to Winksy.ai database operations from Cursor
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Cursor MCP Integration for Winksy.ai\n');

// Check if MCP server exists
const mcpPath = path.join(__dirname, 'mcp-server');
const fs = require('fs');

if (!fs.existsSync(mcpPath)) {
  console.log('❌ MCP server not found. Please run setup from the correct directory.');
  process.exit(1);
}

// Start MCP server in background
console.log('📡 Starting MCP server...');
const mcpProcess = spawn('npm', ['start'], {
  cwd: mcpPath,
  detached: true,
  stdio: 'ignore'
});

mcpProcess.unref();

console.log('✅ MCP server started in background');
console.log('\n🛠️  Available MCP Tools:');
console.log('• get_database_stats - System analytics');
console.log('• get_user_profile - User information');
console.log('• get_lash_tech_profile - Technician details');
console.log('• list_bookings - Appointment management');
console.log('• create_booking - Schedule appointments');
console.log('• add_points - Reward system');
console.log('• query_database - Custom SQL queries');
console.log('\n🧪 Test Commands:');
console.log('• npm run mcp:test - Interactive testing');
console.log('• npm run mcp:stats - Database statistics');
console.log('• npm run mcp:query "SELECT * FROM profiles LIMIT 5"');
console.log('\n🎯 Ready for Cursor integration!');

// Keep process alive briefly to show messages
setTimeout(() => {
  console.log('\n💡 Tip: Use Cursor\'s terminal to run MCP commands');
  process.exit(0);
}, 2000);
