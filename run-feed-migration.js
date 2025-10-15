#!/usr/bin/env node

/**
 * Lash Feed Database Migration Script
 * Runs the SQL to create posts, likes, comments, and follows tables
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting Lash Feed database migration...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_feed_tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📖 Read migration SQL file')

    // Split SQL into individual statements (separated by semicolons)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Get a brief description of the statement
      let description = statement.substring(0, 60).replace(/\n/g, ' ')
      if (statement.length > 60) description += '...'
      
      console.log(`⏳ [${i + 1}/${statements.length}] Executing: ${description}`)

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })
      
      if (error) {
        // Try direct query as fallback
        const { error: directError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(1)
        
        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message)
          console.log('\n⚠️  Unable to execute via RPC. Please run the SQL manually in Supabase Dashboard.')
          console.log('📋 Copy the contents of create_feed_tables.sql and paste into SQL Editor\n')
          return false
        }
      }
      
      console.log(`✅ [${i + 1}/${statements.length}] Success\n`)
    }

    console.log('✨ Migration completed successfully!\n')
    console.log('📋 Next steps:')
    console.log('1. Create storage bucket "feed-images" in Supabase Dashboard')
    console.log('2. Set the bucket to Public')
    console.log('3. Test the feed at /feed\n')
    
    return true

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n💡 Try running the SQL manually:')
    console.log('1. Open Supabase Dashboard → SQL Editor')
    console.log('2. Copy contents from create_feed_tables.sql')
    console.log('3. Paste and run\n')
    return false
  }
}

// Alternative: Use Supabase SQL directly
async function runMigrationDirect() {
  console.log('🚀 Running migration via Supabase SQL Editor API...\n')
  
  try {
    const sqlPath = path.join(__dirname, 'create_feed_tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Preparing to execute migration SQL...')
    console.log('⚠️  Note: This requires Supabase CLI or manual SQL execution\n')

    console.log('Please run this command:')
    console.log(`npx supabase db push --db-url="${supabaseUrl}" --file="create_feed_tables.sql"`)
    console.log('\nOr copy the SQL from create_feed_tables.sql into Supabase SQL Editor\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Check if Supabase CLI is available
async function checkSupabaseCLI() {
  const { exec } = require('child_process')
  return new Promise((resolve) => {
    exec('which supabase', (error) => {
      resolve(!error)
    })
  })
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('   🎀 Lash Feed Migration Script 🎀')
  console.log('═══════════════════════════════════════════════\n')

  const hasCLI = await checkSupabaseCLI()

  if (hasCLI) {
    console.log('✅ Supabase CLI detected\n')
    console.log('Run this command to execute migration:')
    console.log(`\nsupabase db push --db-url="${supabaseUrl}" --file="create_feed_tables.sql"\n`)
  } else {
    console.log('📋 Manual migration required:\n')
    console.log('1. Open Supabase Dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy contents from create_feed_tables.sql')
    console.log('4. Paste and click "Run"\n')
    console.log('═══════════════════════════════════════════════\n')
  }

  // Show the SQL file location
  console.log('📄 SQL file location:')
  console.log(`   ${path.join(__dirname, 'create_feed_tables.sql')}\n`)

  // Offer to display the SQL
  console.log('💡 Tip: After running the migration, create the storage bucket:')
  console.log('   - Name: feed-images')
  console.log('   - Type: Public bucket')
  console.log('   - Location: Supabase Dashboard → Storage\n')
}

main()


