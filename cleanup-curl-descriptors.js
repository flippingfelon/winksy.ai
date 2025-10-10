#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function cleanupCurlDescriptors() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Cleaning up verbose curl descriptors...');

  try {
    // Get all lash maps with specifications
    const { data: maps, error: fetchError } = await supabase
      .from('lash_maps')
      .select('id, name, specifications')
      .not('specifications', 'is', null);

    if (fetchError) throw fetchError;

    let updatedCount = 0;

    for (const map of maps) {
      let updated = false;
      const specs = map.specifications;

      // Clean up curl_options if it contains " curl" or " Curl"
      if (specs.curl_options && (specs.curl_options.includes(' curl') || specs.curl_options.includes(' Curl'))) {
        specs.curl_options = specs.curl_options
          .replace(/ curl/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        updated = true;
        console.log(`  Cleaned ${map.name}: "${map.specifications.curl_options}" → "${specs.curl_options}"`);
      }

      if (updated) {
        const { error: updateError } = await supabase
          .from('lash_maps')
          .update({ specifications: specs })
          .eq('id', map.id);

        if (updateError) {
          console.error(`  ❌ Failed to update ${map.name}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`\n✅ Cleanup complete! Updated ${updatedCount} lash map(s)`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupCurlDescriptors();

