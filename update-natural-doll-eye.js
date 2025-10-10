#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function updateNaturalDollEye() {
  // Use environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Updating Natural Doll Eye specifications...');

  try {
    // Update the Natural Doll Eye map with 7-zone specifications
    const { data, error } = await supabase
      .from('lash_maps')
      .update({
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Natural doll-eye effect with centered peak for wide, open eyes',
        specifications: {
          lengths: {
            "1": 8,  // Inner
            "2": 9,  // Inner-Mid
            "3": 10, // Center-Inner
            "4": 11, // Center (peak)
            "5": 10, // Center-Outer
            "6": 9,  // Outer-Mid
            "7": 8   // Outer
          },
          curl_options: 'C or CC',
          diameter: '0.15mm',
          recommended_products: [
            '0.15mm Natural Lashes',
            'C or CC Curl',
            'Lengths: 8mm, 9mm, 10mm, 11mm',
            'Lash adhesive',
            'Natural tweezers'
          ]
        }
      })
      .eq('name', 'Natural Doll Eye')
      .select();

    if (error) {
      console.error('❌ Error updating Natural Doll Eye:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated Natural Doll Eye!');
      console.log('📊 New specifications:');
      console.log(JSON.stringify(data[0].specifications, null, 2));
    } else {
      console.log('⚠️  Natural Doll Eye not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNaturalDollEye();
