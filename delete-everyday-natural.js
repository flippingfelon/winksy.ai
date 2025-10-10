#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function deleteEverydayNatural() {
  // Use environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🗑️  Removing Everyday Natural lash map...');

  try {
    // First, check if it exists
    const { data: existing, error: checkError } = await supabase
      .from('lash_maps')
      .select('id, name')
      .eq('name', 'Everyday Natural');

    if (checkError) {
      console.error('❌ Error checking for Everyday Natural:', checkError.message);
      process.exit(1);
    }

    if (!existing || existing.length === 0) {
      console.log('ℹ️  Everyday Natural not found in database (already removed)');
      return;
    }

    console.log(`📍 Found Everyday Natural with ID: ${existing[0].id}`);

    // Delete the map
    const { data, error } = await supabase
      .from('lash_maps')
      .delete()
      .eq('name', 'Everyday Natural')
      .select();

    if (error) {
      console.error('❌ Error deleting Everyday Natural:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully deleted Everyday Natural!');
      console.log('🗑️  Removed:', data[0].name);
    } else {
      console.log('⚠️  No records were deleted');
    }

    // Verify it's gone
    const { data: verifyData, error: verifyError } = await supabase
      .from('lash_maps')
      .select('name')
      .eq('name', 'Everyday Natural');

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError.message);
    } else if (verifyData && verifyData.length === 0) {
      console.log('✅ Verified: Everyday Natural is completely removed from database');
    } else {
      console.log('⚠️  Warning: Everyday Natural may still exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteEverydayNatural();
