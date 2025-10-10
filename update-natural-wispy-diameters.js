#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function updateNaturalWispyDiameters() {
  // Use environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Updating Natural Wispy diameter options...');

  try {
    // Update the Natural Wispy map with dual diameter specifications
    const { data, error } = await supabase
      .from('lash_maps')
      .update({
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Light, feathery look that adds definition without volume. Create spikes by alternating lengths for natural wispy texture. Uses dual curl technique (C for spikes, CC for base) for enhanced wispy dimension. Choose diameter based on client\'s natural lash strength.',
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
          diameter: '0.15mm (strong lashes) or 0.10mm (weak lashes)',
          recommended_products: [
            '0.15mm Natural Lashes (for strong/healthy lashes)',
            '0.10mm Natural Lashes (for weak/thin lashes)',
            'Both diameters in BOTH C Curl AND CC Curl',
            'C Curl for spike/tall lashes (11mm, 10mm peaks)',
            'CC Curl for regular/shorter lashes (8mm, 9mm base)',
            'Lengths: 8mm, 9mm, 10mm, 11mm',
            'Lash adhesive',
            'Precision tweezers',
            'Assess client\'s natural lash strength first'
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
      console.log('📏 New diameter specifications:');
      console.log('Diameter:', data[0].specifications.diameter);
      console.log('🎯 Key Products:');
      data[0].specifications.recommended_products.slice(0, 4).forEach(product => {
        console.log(`   • ${product}`);
      });
      console.log('📝 Note: Choose diameter based on client\'s natural lash strength');
    } else {
      console.log('⚠️  Natural Wispy not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNaturalWispyDiameters();
