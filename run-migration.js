const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_lash_map_images.sql');
    
    // Read the migration file
    const sql = fs.readFileSync('add_lash_map_images.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct approach
      console.log('⚠️  exec_sql not available, trying direct column check...');
      
      // Check if columns exist
      const { data: columns, error: checkError } = await supabase
        .from('lash_maps')
        .select('preview_image_url, reference_map_url')
        .limit(1);
      
      if (checkError) {
        if (checkError.message.includes('preview_image_url') || checkError.message.includes('reference_map_url')) {
          console.log('❌ Columns do not exist in database');
          console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
          console.log('------------------------------------------');
          console.log(sql);
          console.log('------------------------------------------');
          console.log('\n🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
          process.exit(1);
        } else {
          throw checkError;
        }
      } else {
        console.log('✅ Columns already exist in database!');
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('------------------------------------------');
    console.log(fs.readFileSync('add_lash_map_images.sql', 'utf8'));
    console.log('------------------------------------------');
    process.exit(1);
  }
}

runMigration();

