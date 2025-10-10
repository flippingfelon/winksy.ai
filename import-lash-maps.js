#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importLashMaps() {
  console.log('📥 Starting lash map import...\n')

  try {
    // Read the JSON file
    const filePath = path.join(__dirname, 'src', 'app', 'perplexityresults.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const maps = JSON.parse(fileContents)

    console.log(`Found ${maps.length} lash maps in JSON file\n`)

    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    }

    // Process each map
    for (const mapData of maps) {
      try {
        // Validate required fields
        if (!mapData.name || !mapData.category || !mapData.difficulty) {
          console.log(`⚠️  Skipping ${mapData.name || 'Unknown'}: Missing required fields`)
          result.errors.push(`Missing required fields for: ${mapData.name || 'Unknown'}`)
          continue
        }

        // Normalize category
        let category = mapData.category
        if (category === 'Classic') category = 'Natural'
        if (!['Natural', 'Volume', 'Mega Volume', 'Special/Celebrity Styles'].includes(category)) {
          category = 'Natural'
        }

        // Check if exists
        const { data: existing } = await supabase
          .from('lash_maps')
          .select('id, name')
          .eq('name', mapData.name)
          .maybeSingle()

        // Convert zones to specifications
        const specifications = {
          lengths: {},
          curl_options: [...new Set(mapData.zones.map(z => z.curl))].join(', '),
          diameter: [...new Set(mapData.zones.map(z => z.diameter))].join(', '),
          recommended_products: mapData.products,
          application_notes: mapData.application_notes,
          zones: mapData.zones
        }

        mapData.zones.forEach(zone => {
          const lengthNum = parseInt(zone.length)
          if (!isNaN(lengthNum)) {
            specifications.lengths[zone.zone] = lengthNum
          }
        })

        const lashMapData = {
          name: mapData.name,
          category: category,
          difficulty: mapData.difficulty,
          description: mapData.description,
          specifications: specifications,
          created_at: new Date().toISOString()
        }

        if (existing) {
          // Update
          const { error } = await supabase
            .from('lash_maps')
            .update(lashMapData)
            .eq('id', existing.id)

          if (error) throw error

          console.log(`✅ Updated: ${mapData.name}`)
          result.updated++
        } else {
          // Create
          const { error } = await supabase
            .from('lash_maps')
            .insert(lashMapData)

          if (error) throw error

          console.log(`✨ Created: ${mapData.name}`)
          result.created++
        }
      } catch (error) {
        console.log(`❌ Error processing ${mapData.name}: ${error.message}`)
        result.errors.push(`${mapData.name}: ${error.message}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Import Summary:')
    console.log('='.repeat(50))
    console.log(`✨ Created: ${result.created}`)
    console.log(`✅ Updated: ${result.updated}`)
    console.log(`⚠️  Skipped: ${result.skipped}`)
    console.log(`❌ Errors: ${result.errors.length}`)
    console.log('='.repeat(50))

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(err => console.log(`  - ${err}`))
    }

    console.log('\n✅ Import complete!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the import
importLashMaps()

