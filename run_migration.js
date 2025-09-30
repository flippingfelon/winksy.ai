const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables directly
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('temp_migration.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length === 0) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // If rpc doesn't work, try direct query
        const { error: queryError } = await supabase.from('_supabase_migration_temp').select('*').limit(0);
        if (queryError) {
          console.log('Using direct SQL execution...');
          // For complex DDL, we need to use the REST API or SQL editor
          console.log('Please run this SQL in Supabase SQL Editor:');
          console.log('=====================================');
          console.log(migrationSQL);
          console.log('=====================================');
          return;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying changes...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'profiles')
      .in('column_name', ['roles', 'active_role', 'level']);
    
    if (columnError) {
      console.error('Error verifying columns:', columnError);
    } else {
      console.log('New columns in profiles table:');
      console.table(columns);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    const migrationSQL = fs.readFileSync('temp_migration.sql', 'utf8');
    console.log(migrationSQL);
  }
}

runMigration();
