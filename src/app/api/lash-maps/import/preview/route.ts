import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'src', 'app', 'perplexityresults.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const maps = JSON.parse(fileContents)

    // Validate the data
    if (!Array.isArray(maps)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format: expected an array'
      }, { status: 400 })
    }

    // Basic validation of each map
    const validatedMaps = maps.filter(map => {
      return map.name && map.category && map.difficulty && map.description
    })

    if (validatedMaps.length < maps.length) {
      console.warn(`Filtered out ${maps.length - validatedMaps.length} invalid maps`)
    }

    return NextResponse.json({
      success: true,
      maps: validatedMaps,
      total: validatedMaps.length
    })

  } catch (error: unknown) {
    console.error('Error loading preview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to load preview'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

