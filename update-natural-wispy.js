#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function updateNaturalWispy() {
  // Use environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Updating Natural Wispy to 7-zone spiky pattern...');

  try {
    // Update the Natural Wispy map with 7-zone spiky specifications
    const { data, error } = await supabase
      .from('lash_maps')
      .update({
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Light, feathery look that adds definition without volume. Create spikes by alternating lengths for natural wispy texture',
        specifications: {
          lengths: {
            "1": 8,  // Inner
            "2": 9,  // Inner-Mid
            "3": 9,  // Center-Inner
            "4": 11, // Center (spike)
            "5": 9,  // Center-Outer
            "6": 9,  // Outer-Mid
            "7": 10  // Outer (slight spike)
          },
          curl_options: 'C',
          diameter: '0.15mm',
          recommended_products: [
            '0.15mm Natural Lashes',
            'C Curl',
            'Lengths: 8mm, 9mm, 10mm, 11mm',
            'Lash adhesive',
            'Precision tweezers'
          ]
        }
      })
      .eq('name', 'Natural Wispy')
      .select();

    if (error) {
      console.error('❌ Error updating Natural Wispy:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated Natural Wispy!');
      console.log('📊 New 7-zone spiky specifications:');
      console.log(JSON.stringify(data[0].specifications, null, 2));
      console.log('🎯 Spiky Pattern: 8-9-9-11-9-9-10mm');
      console.log('📝 Note: Create spikes by alternating lengths for natural wispy texture');
    } else {
      console.log('⚠️  Natural Wispy not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNaturalWispy();
