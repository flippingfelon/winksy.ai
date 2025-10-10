// SMS Message Templates for Appointments

interface AppointmentData {
  clientName: string
  date: string
  time: string
  techName?: string
  businessName?: string
  duration?: number
  lashMap?: string
  price?: number
  appointmentId?: string
}

// Get website URL from environment or use default
const getWebsiteUrl = () => {
  return process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://winksy.vercel.app'
}

const getBusinessName = () => {
  return process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Winksy Lash Studio'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Appointment Confirmation Message
export function getConfirmationMessage(data: AppointmentData): string {
  const businessName = data.businessName || getBusinessName()
  const techName = data.techName || 'your lash tech'
  const websiteUrl = getWebsiteUrl()
  
  let message = `✨ Appointment Confirmed!\n\n`
  message += `Hello ${data.clientName},\n\n`
  message += `Your lash appointment with ${techName} is confirmed:\n\n`
  message += `📅 ${formatDate(data.date)}\n`
  message += `🕐 ${formatTime(data.time)}`
  
  if (data.duration) {
    message += ` (${data.duration} min)`
  }
  
  if (data.lashMap) {
    message += `\n💎 Style: ${data.lashMap}`
  }
  
  if (data.price) {
    message += `\n💰 $${data.price.toFixed(2)}`
  }
  
  message += `\n\n📍 ${businessName}`
  
  // Add appointment link if ID is provided
  if (data.appointmentId) {
    message += `\n\n🔗 View details: ${websiteUrl}/dashboard/tech/appointments/${data.appointmentId}`
  } else {
    message += `\n\n🔗 ${websiteUrl}`
  }
  
  message += `\n\nSee you soon! Reply CANCEL to cancel.`
  
  return message
}

// 24-Hour Reminder Message
export function get24HourReminderMessage(data: AppointmentData): string {
  const businessName = data.businessName || getBusinessName()
  const websiteUrl = getWebsiteUrl()
  
  let message = `🔔 Reminder: Lash Appointment Tomorrow\n\n`
  message += `Hi ${data.clientName}!\n\n`
  message += `This is a friendly reminder about your appointment:\n\n`
  message += `📅 Tomorrow, ${formatDate(data.date)}\n`
  message += `🕐 ${formatTime(data.time)}`
  
  if (data.lashMap) {
    message += `\n💎 ${data.lashMap}`
  }
  
  message += `\n\n📍 ${businessName}`
  
  // Add appointment link if ID is provided
  if (data.appointmentId) {
    message += `\n\n🔗 View: ${websiteUrl}/dashboard/tech/appointments/${data.appointmentId}`
  } else {
    message += `\n\n🔗 ${websiteUrl}`
  }
  
  message += `\n\nWe can't wait to see you! Reply CONFIRM or CANCEL.`
  
  return message
}

// 1-Hour Reminder Message  
export function get1HourReminderMessage(data: AppointmentData): string {
  const businessName = data.businessName || getBusinessName()
  const websiteUrl = getWebsiteUrl()
  
  let message = `⏰ Your appointment is in 1 hour!\n\n`
  message += `Hi ${data.clientName},\n\n`
  message += `Quick reminder:\n`
  message += `🕐 ${formatTime(data.time)} today\n`
  message += `📍 ${businessName}\n`
  
  if (data.appointmentId) {
    message += `\n🔗 ${websiteUrl}/dashboard/tech/appointments/${data.appointmentId}`
  }
  
  message += `\n\nOn our way! See you soon ✨`
  
  return message
}

// Cancellation Confirmation
export function getCancellationMessage(data: AppointmentData): string {
  const websiteUrl = getWebsiteUrl()
  
  let message = `Appointment Cancelled\n\n`
  message += `Hi ${data.clientName},\n\n`
  message += `Your appointment on ${formatDate(data.date)} at ${formatTime(data.time)} has been cancelled.\n\n`
  message += `We hope to see you again soon!\n\n`
  message += `📅 Rebook anytime: ${websiteUrl}`
  
  return message
}

// Reschedule Message
export function getRescheduleMessage(data: AppointmentData & { newDate: string, newTime: string }): string {
  let message = `📅 Appointment Rescheduled\n\n`
  message += `Hi ${data.clientName},\n\n`
  message += `Your appointment has been rescheduled:\n\n`
  message += `New Date: ${formatDate(data.newDate)}\n`
  message += `New Time: ${formatTime(data.newTime)}\n\n`
  message += `See you then! ✨`
  
  return message
}

// Thank You / Follow-up Message (after appointment)
export function getThankYouMessage(data: AppointmentData): string {
  const websiteUrl = getWebsiteUrl()
  
  let message = `Thank you, ${data.clientName}! 💕\n\n`
  message += `We hope you love your new lashes! ✨\n\n`
  message += `Please take care of them and we'll see you for your fill in 2-3 weeks.\n\n`
  message += `📅 Book your next appointment: ${websiteUrl}\n\n`
  message += `Questions? Reply to this message anytime!`
  
  return message
}

// Generic custom message function
export function getCustomMessage(clientName: string, customText: string): string {
  return `Hi ${clientName},\n\n${customText}`
}

