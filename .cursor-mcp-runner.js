#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Winksy.ai MCP Control Center');
console.log('===============================');
console.log('');

function showMenu() {
  console.log('Choose an MCP server to interact with:');
  console.log('');
  console.log('1. 🗄️  Supabase Database MCP');
  console.log('   - Query users, bookings, points');
  console.log('   - Get database statistics');
  console.log('   - Manage user profiles');
  console.log('');
  console.log('2. 📁 Filesystem MCP');
  console.log('   - Search code patterns');
  console.log('   - Read files');
  console.log('   - Analyze project structure');
  console.log('');
  console.log('3. 🧠 Memory MCP');
  console.log('   - Store project insights');
  console.log('   - Manage development tasks');
  console.log('   - Track conversation history');
  console.log('');
  console.log('4. 📊 Quick Database Stats');
  console.log('   - Get current database overview');
  console.log('');
  console.log('5. 🔍 Code Search');
  console.log('   - Find functions, components, patterns');
  console.log('');
  console.log('6. 💾 Memory Overview');
  console.log('   - Check current tasks and insights');
  console.log('');
  console.log('0. Exit');
  console.log('');
}

function handleChoice(choice) {
  const { spawn } = require('child_process');

  switch (choice) {
    case '1':
      console.log('🚀 Starting Supabase Database MCP...');
      console.log('Use these commands in your terminal:');
      console.log('  npm run mcp:interactive  # Interactive database operations');
      console.log('  npm run mcp:stats        # Database statistics');
      console.log('  npm run mcp:test         # Test connection');
      break;

    case '2':
      console.log('📁 Filesystem MCP Commands:');
      console.log('  npm run fs:search "pattern"  # Search for code patterns');
      console.log('  npm run fs:read "filename"   # Read specific files');
      console.log('  npm run fs:test              # Test filesystem MCP');
      break;

    case '3':
      console.log('🧠 Memory MCP Commands:');
      console.log('  npm run memory:stats         # Memory overview');
      console.log('  npm run memory:test          # Test memory system');
      console.log('  npm run memory:start         # Start memory server');
      break;

    case '4':
      console.log('📊 Getting database stats...');
      const dbStats = spawn('npm', ['run', 'mcp:stats'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      dbStats.on('close', (code) => {
        console.log('\n' + '='.repeat(50));
        setTimeout(() => askChoice(), 1000);
      });
      return;

    case '5':
      rl.question('Enter search pattern (e.g., "function", "useState", etc.): ', (pattern) => {
        if (!pattern.trim()) {
          console.log('❌ Please enter a search pattern.');
          setTimeout(() => askChoice(), 1000);
          return;
        }
        console.log(`🔍 Searching for "${pattern}"...`);
        const search = spawn('npm', ['run', 'fs:search', pattern], {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        search.on('close', (code) => {
          console.log('\n' + '='.repeat(50));
          setTimeout(() => askChoice(), 1000);
        });
      });
      return;

    case '6':
      console.log('💾 Getting memory overview...');
      const memoryStats = spawn('npm', ['run', 'memory:stats'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      memoryStats.on('close', (code) => {
        console.log('\n' + '='.repeat(50));
        setTimeout(() => askChoice(), 1000);
      });
      return;

    case '0':
      console.log('👋 Goodbye!');
      rl.close();
      return;

    default:
      console.log('❌ Invalid choice. Please try again.');
      setTimeout(() => askChoice(), 1000);
      return;
  }

  setTimeout(() => askChoice(), 2000);
}

function askChoice() {
  rl.question('Enter your choice (0-6): ', (answer) => {
    handleChoice(answer.trim());
  });
}

showMenu();
askChoice();
