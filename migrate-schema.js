#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting database migration...');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          // Continue with other statements
        }
      } catch (err) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }

    console.log('✅ Migration completed!');

    // Verify the schema was applied
    console.log('🔍 Verifying schema...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'tenants', 'lash_techs', 'services', 'bookings', 'points', 'user_levels', 'reviews']);

    if (tableError) {
      console.error('❌ Error verifying schema:', tableError.message);
    } else {
      console.log('📊 Tables created:', tables?.map(t => t.table_name).join(', '));

      // Check if level column exists in profiles
      const { data: profileColumns, error: profileError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'profiles')
        .eq('column_name', 'level');

      if (profileError) {
        console.error('❌ Error checking profiles table:', profileError.message);
      } else if (profileColumns && profileColumns.length > 0) {
        console.log('✅ Level column added to profiles table');
      } else {
        console.log('⚠️  Level column not found in profiles table');
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();






