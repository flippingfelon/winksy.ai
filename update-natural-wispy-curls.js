#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function updateNaturalWispyCurls() {
  // Use environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Updating Natural Wispy to use dual curl technique...');

  try {
    // Update the Natural Wispy map with dual curl specifications
    const { data, error } = await supabase
      .from('lash_maps')
      .update({
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Light, feathery look that adds definition without volume. Create spikes by alternating lengths for natural wispy texture. Uses dual curl technique (C for spikes, CC for base) for enhanced wispy dimension',
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
          curl_options: 'C Curl for spikes (11mm, 10mm), CC Curl for base (8mm, 9mm)',
          diameter: '0.15mm',
          recommended_products: [
            '0.15mm Natural Lashes in BOTH C Curl AND CC Curl',
            'C Curl for spike/tall lashes (11mm, 10mm peaks)',
            'CC Curl for regular/shorter lashes (8mm, 9mm base)',
            'Lengths: 8mm, 9mm, 10mm, 11mm',
            'Lash adhesive',
            'Precision tweezers',
            'Mix curl types for natural wispy dimension'
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
      console.log('🌀 New dual curl specifications:');
      console.log('Curl Options:', data[0].specifications.curl_options);
      console.log('🎯 Recommended Products:');
      data[0].specifications.recommended_products.forEach(product => {
        console.log(`   • ${product}`);
      });
      console.log('📝 Description updated with dual curl technique');
    } else {
      console.log('⚠️  Natural Wispy not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNaturalWispyCurls();
