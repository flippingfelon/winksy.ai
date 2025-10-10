import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

export async function POST(request: NextRequest) {
  try {
    // Check if Twilio is configured
    if (!accountSid || !authToken || !twilioPhone) {
      return NextResponse.json(
        { 
          error: 'Twilio is not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your environment variables.',
          configured: false
        },
        { status: 200 } // Return 200 so UI can handle gracefully
      )
    }

    const body = await request.json()
    const { to, message, appointmentId, type } = body

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Format phone number (ensure it starts with +1 for US numbers)
    let formattedPhone = to.replace(/\D/g, '') // Remove non-digits
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}` // Add US country code
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)

    // Send SMS
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone
    })

    // Log success
    console.log('SMS sent successfully:', {
      sid: twilioMessage.sid,
      to: formattedPhone,
      type,
      appointmentId
    })

    return NextResponse.json({
      success: true,
      messageSid: twilioMessage.sid,
      configured: true
    })

  } catch (error: any) {
    console.error('Error sending SMS:', error)
    
    // Return specific error messages
    if (error.code === 21211) {
      return NextResponse.json(
        { error: 'Invalid phone number format', configured: true },
        { status: 400 }
      )
    }
    
    if (error.code === 21608) {
      return NextResponse.json(
        { error: 'The phone number is not verified. In Twilio trial mode, you can only send to verified numbers.', configured: true },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to send SMS',
        code: error.code,
        configured: true
      },
      { status: 500 }
    )
  }
}

