#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seedData() {
  // Use environment variables directly (they should be available from the running app)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🌱 Seeding popular lash maps...');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'seed-popular-lash-maps.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');

        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          console.warn('Warning executing statement:', error.message);
        }
      }
    }

    // Alternative: Insert the data directly
    console.log('📝 Inserting lash maps directly...');

    const lashMaps = [
      {
        name: 'Natural Doll Eye',
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Soft, rounded eye shape that enhances natural eye shape with subtle definition',
        specifications: {
          lengths: { "1": 7, "2": 9, "3": 11, "4": 9, "5": 7 },
          curl_options: 'C or CC',
          diameter: '0.15mm',
          recommended_products: [
            'Natural Length Lashes',
            'Light Volume Adhesive',
            'Natural Mascara'
          ]
        }
      },
      {
        name: 'Everyday Natural',
        category: 'Natural',
        difficulty: 'Beginner',
        description: 'Perfect for daily wear - subtle enhancement that looks completely natural',
        specifications: {
          lengths: { "1": 6, "2": 8, "3": 10, "4": 8, "5": 6 },
          curl_options: 'B or C',
          diameter: '0.12mm',
          recommended_products: [
            'Everyday Natural Lashes',
            'Clear Adhesive',
            'Transparent Mascara'
          ]
        }
      },
      {
        name: 'Bold Cat Eye',
        category: 'Volume',
        difficulty: 'Intermediate',
        description: 'Dramatic cat eye effect with defined outer corners for a bold, glamorous look',
        specifications: {
          lengths: { "1": 8, "2": 10, "3": 12, "4": 14, "5": 12 },
          curl_options: 'D or DD',
          diameter: '0.15mm',
          recommended_products: [
            'Cat Eye Lashes',
            'Volume Adhesive',
            'Bold Mascara',
            'Eyeliner - Winged'
          ]
        }
      },
      {
        name: 'Dramatic Doll',
        category: 'Volume',
        difficulty: 'Intermediate',
        description: 'Wide-eyed doll effect with maximum volume and length for special occasions',
        specifications: {
          lengths: { "1": 9, "2": 12, "3": 15, "4": 12, "5": 9 },
          curl_options: 'D or DD',
          diameter: '0.18mm',
          recommended_products: [
            'Dramatic Doll Lashes',
            'Strong Hold Adhesive',
            'Volume Mascara',
            'Eyeshadow Primer'
          ]
        }
      },
      {
        name: 'Fox Eye Natural',
        category: 'Special/Celebrity Styles',
        difficulty: 'Pro',
        description: 'Iconic fox eye shape that lifts and elongates the outer corners',
        specifications: {
          lengths: { "1": 7, "2": 9, "3": 11, "4": 13, "5": 11 },
          curl_options: 'CC or D',
          diameter: '0.15mm',
          recommended_products: [
            'Fox Eye Lashes',
            'Precision Adhesive',
            'Defining Mascara',
            'Brow Pencil'
          ]
        }
      },
      {
        name: 'Kim K Glam',
        category: 'Special/Celebrity Styles',
        difficulty: 'Pro',
        description: 'Kim Kardashian signature look - voluminous, textured, and glamorous',
        specifications: {
          lengths: { "1": 8, "2": 11, "3": 14, "4": 16, "5": 13 },
          curl_options: 'D or DD',
          diameter: '0.18mm',
          recommended_products: [
            'Kim K Glam Lashes',
            'Volume Adhesive',
            'Fiber Mascara',
            'Bronzer',
            'Highlighter'
          ]
        }
      },
      {
        name: 'Manga/Anime Eye',
        category: 'Special/Celebrity Styles',
        difficulty: 'Pro',
        description: 'Bold, dramatic eye shape inspired by anime characters with exaggerated features',
        specifications: {
          lengths: { "1": 10, "2": 14, "3": 18, "4": 20, "5": 16 },
          curl_options: 'DD or L',
          diameter: '0.20mm',
          recommended_products: [
            'Anime Style Lashes',
            'Heavy Duty Adhesive',
            'Bold Mascara',
            'White Eyeliner',
            'Graphic Eyeliner'
          ]
        }
      },
      {
        name: 'Natural Squirrel',
        category: 'Natural',
        difficulty: 'Intermediate',
        description: 'Textured, squirrel-like effect that adds dimension while maintaining natural appearance',
        specifications: {
          lengths: { "1": 7, "2": 9, "3": 11, "4": 9, "5": 7 },
          curl_options: 'C or CC',
          diameter: '0.15mm',
          recommended_products: [
            'Textured Natural Lashes',
            'Light Volume Adhesive',
            'Natural Mascara',
            'Brow Gel'
          ]
        }
      }
    ];

    // Insert the maps (skip if they already exist)
    for (const map of lashMaps) {
      // First check if the map already exists
      const { data: existing } = await supabase
        .from('lash_maps')
        .select('id')
        .eq('name', map.name)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${map.name} (already exists)`);
        continue;
      }

      const { error } = await supabase
        .from('lash_maps')
        .insert(map);

      if (error) {
        console.error(`❌ Error inserting ${map.name}:`, error.message);
      } else {
        console.log(`✅ Inserted ${map.name}`);
      }
    }

    // Update Natural Soft Cat Eye if needed
    const { error: updateError } = await supabase
      .from('lash_maps')
      .update({
        specifications: {
          lengths: { "1": 8, "2": 10, "3": 12, "4": 14, "5": 10 },
          curl_options: 'C or CC',
          diameter: '0.15mm',
          recommended_products: [
            'Natural Cat Eye Lashes',
            'Precision Adhesive',
            'Lengthening Mascara'
          ]
        }
      })
      .eq('name', 'Natural Soft Cat Eye')
      .is('specifications', null);

    if (updateError) {
      console.warn('Warning updating Natural Soft Cat Eye:', updateError.message);
    }

    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
