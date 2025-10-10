import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { get24HourReminderMessage } from '@/utils/smsTemplates'

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

export async function GET(request: NextRequest) {
  try {
    // Verify API key for security (optional but recommended)
    const apiKey = request.headers.get('x-api-key')
    if (process.env.CRON_SECRET && apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Twilio is configured
    if (!accountSid || !authToken || !twilioPhone) {
      return NextResponse.json({
        message: 'Twilio not configured',
        reminders_sent: 0,
        configured: false
      })
    }

    // Get appointments that need reminders (24-48 hours before)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

    const { data: appointments, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:clients(id, client_name, phone),
        lash_map:lash_maps(name)
      `)
      .in('status', ['pending', 'confirmed'])
      .eq('reminder_sent', false)
      .gte('booking_date', tomorrowStr)
      .lte('booking_date', dayAfterTomorrowStr)

    if (error) throw error

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        message: 'No appointments need reminders',
        reminders_sent: 0,
        configured: true
      })
    }

    // Send reminders
    const client = twilio(accountSid, authToken)
    const results = []

    for (const appointment of appointments) {
      try {
        // Skip if no phone number
        if (!appointment.client?.phone) {
          console.log(`No phone number for appointment ${appointment.id}`)
          continue
        }

        // Format phone number
        let phone = appointment.client.phone.replace(/\D/g, '')
        if (phone.length === 10) {
          phone = `+1${phone}`
        } else if (!phone.startsWith('+')) {
          phone = `+${phone}`
        }

        // Generate message
        const message = get24HourReminderMessage({
          clientName: appointment.client.client_name || 'Client',
          date: appointment.booking_date,
          time: appointment.booking_time,
          lashMap: appointment.lash_map?.name,
          appointmentId: appointment.id
        })

        // Send SMS
        const twilioMessage = await client.messages.create({
          body: message,
          from: twilioPhone,
          to: phone
        })

        // Mark as sent in database
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', appointment.id)

        results.push({
          appointmentId: appointment.id,
          phone,
          status: 'sent',
          messageSid: twilioMessage.sid
        })

        console.log(`Reminder sent for appointment ${appointment.id}`)
      } catch (error: unknown) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          appointmentId: appointment.id,
          phone: appointment.client?.phone,
          status: 'failed',
          error: errorMessage
        })
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length

    return NextResponse.json({
      message: `Sent ${successCount} of ${results.length} reminders`,
      reminders_sent: successCount,
      results,
      configured: true
    })

  } catch (error: unknown) {
    console.error('Error in check-reminders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to check reminders'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

