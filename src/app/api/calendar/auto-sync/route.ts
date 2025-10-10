import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Verify API key for security (optional but recommended)
    const apiKey = request.headers.get('x-api-key')
    if (process.env.CRON_SECRET && apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get connections that need syncing
    const { data: connections, error } = await supabase
      .from('calendar_connections_needing_sync')
      .select('*')

    if (error) throw error

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        message: 'No calendars need syncing',
        synced_count: 0
      })
    }

    // Sync each connection
    const results = []
    for (const connection of connections) {
      try {
        // Call the sync API for each connection
        const response = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/api/calendar/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionId: connection.id })
        })

        const data = await response.json()

        results.push({
          connectionId: connection.id,
          connectionName: connection.connection_name,
          status: data.success ? 'synced' : 'failed',
          imported: data.imported_count || 0,
          error: data.error || null
        })

        console.log(`Synced calendar ${connection.connection_name}: ${data.imported_count || 0} appointments`)
      } catch (error: unknown) {
        console.error(`Error syncing calendar ${connection.id}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          connectionId: connection.id,
          connectionName: connection.connection_name,
          status: 'failed',
          error: errorMessage
        })
      }
    }

    const successCount = results.filter(r => r.status === 'synced').length

    return NextResponse.json({
      message: `Synced ${successCount} of ${results.length} calendars`,
      synced_count: successCount,
      results
    })

  } catch (error: unknown) {
    console.error('Error in auto-sync:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to auto-sync calendars'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

