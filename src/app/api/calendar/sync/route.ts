import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import ical from 'node-ical'

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 })
    }

    // Get connection details
    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    if (!connection.connection_url) {
      return NextResponse.json({ error: 'No calendar URL configured' }, { status: 400 })
    }

    // Normalize URL (convert webcal:// to https://)
    let calendarUrl = connection.connection_url
    if (calendarUrl.startsWith('webcal://')) {
      calendarUrl = calendarUrl.replace('webcal://', 'https://')
    }

    // Fetch and parse iCal feed
    let events
    try {
      // Try with node-ical first
      events = await ical.async.fromURL(calendarUrl)
    } catch (error: any) {
      console.error('Error fetching iCal with node-ical, trying fetch:', error)
      
      // Fallback: Try with fetch API (works better for some Google Calendar URLs)
      try {
        const response = await fetch(calendarUrl, {
          headers: {
            'User-Agent': 'Winksy Calendar Sync/1.0',
            'Accept': 'text/calendar, application/ics'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const icsText = await response.text()
        
        // Parse the ICS text
        events = ical.parseICS(icsText)
      } catch (fetchError: any) {
        console.error('Error fetching with fetch API:', fetchError)
        
        // Update connection with error
        await supabase
          .from('calendar_connections')
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: 'error',
            last_sync_error: fetchError.message || 'Failed to fetch calendar'
          })
          .eq('id', connectionId)

        return NextResponse.json({ 
          error: 'Failed to fetch calendar feed',
          details: fetchError.message,
          hint: 'Make sure the URL is correct and starts with https://. For Google Calendar, use the "Secret address in iCal format" from Settings.'
        }, { status: 500 })
      }
    }

    // Process events and create bookings
    let imported = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const [uid, event] of Object.entries(events)) {
      try {
        // Skip non-event entries
        if (!event || event.type !== 'VEVENT') {
          continue
        }

        // Extract event details
        const summary = event.summary || 'Untitled Appointment'
        const description = event.description || ''
        const startDate = event.start
        const endDate = event.end

        if (!startDate) {
          skipped++
          continue
        }

        // Calculate duration
        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000) // Default 1 hour
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

        // Format date and time
        const bookingDate = start.toISOString().split('T')[0]
        const bookingTime = start.toTimeString().slice(0, 5) // HH:MM format

        // Try to match existing client by name from event summary
        let clientId = null
        const { data: matchedClient } = await supabase
          .from('clients')
          .select('id')
          .eq('tech_id', connection.tech_id)
          .ilike('client_name', `%${summary.split(' ')[0]}%`) // Match first word
          .limit(1)
          .single()
        
        if (matchedClient) {
          clientId = matchedClient.id
        }

        // Check if this event already exists
        const { data: existing } = await supabase
          .from('bookings')
          .select('id')
          .eq('external_event_id', uid)
          .eq('calendar_connection_id', connectionId)
          .single()

        // Combine summary and description for notes, with summary first
        const combinedNotes = description 
          ? `${summary}\n\n${description}` 
          : summary

        const bookingData = {
          tech_id: connection.tech_id,
          user_id: connection.tech_id, // For now, tech is also the user
          booking_date: bookingDate,
          booking_time: bookingTime,
          duration_minutes: durationMinutes,
          notes: combinedNotes,
          client_id: clientId, // Link to client if found
          status: 'confirmed' as const,
          import_source: connection.platform,
          external_event_id: uid,
          calendar_connection_id: connectionId
        }

        if (existing) {
          // Update existing booking
          const { error: updateError } = await supabase
            .from('bookings')
            .update(bookingData)
            .eq('id', existing.id)

          if (updateError) {
            console.error('Error updating booking:', updateError)
            errors.push(`Failed to update: ${summary}`)
          } else {
            updated++
          }
        } else {
          // Create new booking
          const { error: insertError } = await supabase
            .from('bookings')
            .insert(bookingData)

          if (insertError) {
            console.error('Error inserting booking:', insertError)
            errors.push(`Failed to import: ${summary}`)
          } else {
            imported++
          }
        }
      } catch (error: any) {
        console.error('Error processing event:', error)
        errors.push(`Error processing event: ${error.message}`)
      }
    }

    // Update connection with sync status
    await supabase
      .from('calendar_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: errors.length > 0 ? 'error' : 'success',
        last_sync_error: errors.length > 0 ? errors.join('; ') : null,
        appointments_imported: connection.appointments_imported + imported
      })
      .eq('id', connectionId)

    return NextResponse.json({
      success: true,
      imported_count: imported,
      updated_count: updated,
      skipped_count: skipped,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Error in calendar sync:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}

