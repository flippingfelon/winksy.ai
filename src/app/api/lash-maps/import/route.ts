import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

interface ZoneData {
  zone: string
  length: string
  curl: string
  diameter: string
}

interface LashMapJSON {
  name: string
  category: 'Natural' | 'Volume' | 'Mega Volume' | 'Special/Celebrity Styles' | 'Classic' | string
  difficulty: 'Beginner' | 'Intermediate' | 'Pro'
  description: string
  zones: ZoneData[]
  products: string[]
  application_notes: string
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase with service role key for admin operations (server-side)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { mode } = await request.json()

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'src', 'app', 'perplexityresults.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const maps: LashMapJSON[] = JSON.parse(fileContents)

    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      details: [] as Array<{
        name: string
        action: 'created' | 'updated' | 'skipped' | 'error'
        message?: string
      }>
    }

    // Process each map
    for (const mapData of maps) {
      try {
        // Validate required fields
        if (!mapData.name || !mapData.category || !mapData.difficulty) {
          result.errors.push(`Missing required fields for map: ${mapData.name || 'Unknown'}`)
          result.details.push({
            name: mapData.name || 'Unknown',
            action: 'error',
            message: 'Missing required fields'
          })
          continue
        }

        // Normalize category to match database enum
        let category: string = mapData.category
        if (category === 'Classic') {
          category = 'Natural'
        }
        if (!['Natural', 'Volume', 'Mega Volume', 'Special/Celebrity Styles'].includes(category)) {
          category = 'Natural' // Default fallback
        }

        // Check if map already exists
        const { data: existing, error: checkError } = await supabase
          .from('lash_maps')
          .select('id, name')
          .eq('name', mapData.name)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        // Convert zones array to specifications format
        const specifications = {
          lengths: {} as Record<string, number>,
          curl_options: [...new Set(mapData.zones.map(z => z.curl))].join(', '),
          diameter: [...new Set(mapData.zones.map(z => z.diameter))].join(', '),
          recommended_products: mapData.products,
          application_notes: mapData.application_notes,
          zones: mapData.zones
        }

        // Create lengths map from zones
        mapData.zones.forEach(zone => {
          const lengthNum = parseInt(zone.length)
          if (!isNaN(lengthNum)) {
            specifications.lengths[zone.zone] = lengthNum
          }
        })

        // Prepare the lash map data
        const lashMapData = {
          name: mapData.name,
          category: category as 'Natural' | 'Volume' | 'Mega Volume' | 'Special/Celebrity Styles',
          difficulty: mapData.difficulty as 'Beginner' | 'Intermediate' | 'Pro',
          description: mapData.description,
          specifications: specifications,
          created_at: new Date().toISOString()
        }

        if (existing) {
          // Map exists
          if (mode === 'skip') {
            result.skipped++
            result.details.push({
              name: mapData.name,
              action: 'skipped',
              message: 'Already exists'
            })
            continue
          } else if (mode === 'create-only') {
            result.errors.push(`Map already exists: ${mapData.name}`)
            result.details.push({
              name: mapData.name,
              action: 'error',
              message: 'Already exists (create-only mode)'
            })
            continue
          } else if (mode === 'update') {
            // Update existing
            const { error: updateError } = await supabase
              .from('lash_maps')
              .update(lashMapData)
              .eq('id', existing.id)

            if (updateError) throw updateError

            result.updated++
            result.details.push({
              name: mapData.name,
              action: 'updated',
              message: 'Successfully updated'
            })
          }
        } else {
          // Create new
          const { error: insertError } = await supabase
            .from('lash_maps')
            .insert(lashMapData)

          if (insertError) throw insertError

          result.created++
          result.details.push({
            name: mapData.name,
            action: 'created',
            message: 'Successfully created'
          })
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Error processing ${mapData.name}: ${errorMessage}`)
        result.details.push({
          name: mapData.name,
          action: 'error',
          message: errorMessage
        })
      }
    }

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error: unknown) {
    console.error('Error importing lash maps:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to import'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

