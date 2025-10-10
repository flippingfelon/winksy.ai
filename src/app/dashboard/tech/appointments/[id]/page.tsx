'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Booking, Client, LashMap, ClientAppointment } from '@/types/database'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Save,
  Sparkles,
  Phone,
  Mail,
  DollarSign,
  MessageSquare,
  Send,
  Bell
} from 'lucide-react'
import { getConfirmationMessage, get24HourReminderMessage, formatDate, formatTime } from '@/utils/smsTemplates'

interface AppointmentWithDetails extends Booking {
  client?: Client | null
  lash_map?: LashMap | null
}

export default function AppointmentDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [sendingSMS, setSendingSMS] = useState(false)
  const [smsStatus, setSmsStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchAppointment()
    }
  }, [params.id, user])

  async function fetchAppointment() {
    setLoading(true)
    try {
      if (!user?.id) {
        console.error('User not logged in')
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(id, client_name, phone, email, notes),
          lash_map:lash_maps(id, name, category, difficulty, description)
        `)
        .eq('id', params.id as string)
        .eq('tech_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching appointment:', error)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        throw error
      }
      
      setAppointment(data)
    } catch (error) {
      console.error('Error fetching appointment:', error)
      alert('Appointment not found or you do not have permission to view it.')
      router.push('/dashboard/tech/appointments')
    } finally {
      setLoading(false)
    }
  }

  async function markAsComplete() {
    if (!appointment) return

    setActionLoading(true)
    try {
      // Update appointment status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', appointment.id)

      if (updateError) throw updateError

      // If there's a lash map, save to client history
      if (appointment.lash_map_id && appointment.client_id) {
        const { error: historyError } = await supabase
          .from('client_appointments')
          .insert({
            client_id: appointment.client_id,
            lash_map_id: appointment.lash_map_id,
            appointment_date: appointment.booking_date,
            notes: appointment.notes || null
          })

        if (historyError) console.error('Error saving to history:', historyError)
      }

      // Update client's last appointment date
      if (appointment.client_id) {
        await supabase
          .from('clients')
          .update({ last_appointment_date: appointment.booking_date })
          .eq('id', appointment.client_id)
      }

      setShowCompleteModal(false)
      router.push('/dashboard/tech/appointments?filter=completed')
    } catch (error) {
      console.error('Error marking complete:', error)
      alert('Failed to mark appointment as complete')
    } finally {
      setActionLoading(false)
    }
  }

  async function cancelAppointment() {
    if (!appointment) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellationReason || null
        })
        .eq('id', appointment.id)

      if (error) throw error

      setShowCancelModal(false)
      router.push('/dashboard/tech/appointments?filter=cancelled')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment')
    } finally {
      setActionLoading(false)
    }
  }

  async function deleteAppointment() {
    if (!appointment || !confirm('Are you sure you want to delete this appointment? This cannot be undone.')) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', appointment.id)

      if (error) throw error

      router.push('/dashboard/tech/appointments')
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Failed to delete appointment')
    } finally {
      setActionLoading(false)
    }
  }

  async function sendConfirmationSMS() {
    if (!appointment?.client?.phone) {
      setSmsStatus({ 
        type: 'error', 
        message: 'Client phone number not available. This appointment was imported from your calendar and does not have client contact information.' 
      })
      return
    }

    setSendingSMS(true)
    setSmsStatus(null)

    try {
      const clientName = appointment.client?.client_name || 
                        (appointment.notes?.split('\n')[0]) || 
                        'Client'
      
      const message = getConfirmationMessage({
        clientName: clientName,
        date: appointment.booking_date,
        time: appointment.booking_time,
        duration: appointment.duration_minutes,
        lashMap: appointment.lash_map?.name,
        price: appointment.total_price || undefined,
        appointmentId: appointment.id
      })

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appointment.client.phone,
          message,
          appointmentId: appointment.id,
          type: 'confirmation'
        })
      })

      const data = await response.json()

      if (!data.configured) {
        setSmsStatus({ 
          type: 'error', 
          message: 'SMS not configured. See setup instructions below.' 
        })
        return
      }

      if (data.success) {
        setSmsStatus({ type: 'success', message: 'Confirmation sent successfully!' })
        
        // Update the appointment to mark confirmation sent
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', appointment.id)
        
        setTimeout(() => setSmsStatus(null), 5000)
      } else {
        setSmsStatus({ type: 'error', message: data.error || 'Failed to send confirmation' })
      }
    } catch (error) {
      console.error('Error sending confirmation:', error)
      setSmsStatus({ type: 'error', message: 'Failed to send confirmation' })
    } finally {
      setSendingSMS(false)
    }
  }

  async function send24HourReminder() {
    if (!appointment?.client?.phone) {
      setSmsStatus({ 
        type: 'error', 
        message: 'Client phone number not available. This appointment was imported from your calendar and does not have client contact information.' 
      })
      return
    }

    setSendingSMS(true)
    setSmsStatus(null)

    try {
      const clientName = appointment.client?.client_name || 
                        (appointment.notes?.split('\n')[0]) || 
                        'Client'
      
      const message = get24HourReminderMessage({
        clientName: clientName,
        date: appointment.booking_date,
        time: appointment.booking_time,
        lashMap: appointment.lash_map?.name,
        appointmentId: appointment.id
      })

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appointment.client.phone,
          message,
          appointmentId: appointment.id,
          type: 'reminder'
        })
      })

      const data = await response.json()

      if (!data.configured) {
        setSmsStatus({ 
          type: 'error', 
          message: 'SMS not configured. See setup instructions below.' 
        })
        return
      }

      if (data.success) {
        setSmsStatus({ type: 'success', message: 'Reminder sent successfully!' })
        
        // Update the appointment to mark reminder sent
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', appointment.id)
        
        setTimeout(() => setSmsStatus(null), 5000)
      } else {
        setSmsStatus({ type: 'error', message: data.error || 'Failed to send reminder' })
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      setSmsStatus({ type: 'error', message: 'Failed to send reminder' })
    } finally {
      setSendingSMS(false)
    }
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointment...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!appointment) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/tech/appointments" className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Appointment Details
                </h1>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Client Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {appointment.client?.client_name || 
                     (appointment.notes?.split('\n')[0]) || 
                     'No Client Name'}
                  </h2>
                  {appointment.import_source && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                      <span className="mr-1">📅</span>
                      Imported from {appointment.import_source}
                    </span>
                  )}
                  <div className="space-y-1 text-sm text-gray-600">
                    {appointment.client?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.client.phone}</span>
                      </div>
                    )}
                    {appointment.client?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{appointment.client.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {appointment.client_id && (
                <Link
                  href={`/dashboard/tech/clients/${appointment.client_id}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View Full Profile →
                </Link>
              )}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold">{formatDate(appointment.booking_date)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-pink-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-lg font-semibold">
                    {formatTime(appointment.booking_time)} ({appointment.duration_minutes} min)
                  </p>
                </div>
              </div>
            </div>

            {appointment.total_price && (
              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Price</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${appointment.total_price.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Lash Map Details */}
          {appointment.lash_map && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Lash Map</span>
              </h3>
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {appointment.lash_map.name}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                    {appointment.lash_map.category}
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full font-medium">
                    {appointment.lash_map.difficulty}
                  </span>
                </div>
                {appointment.lash_map.description && (
                  <p className="text-gray-600">{appointment.lash_map.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Notes</span>
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}

          {/* SMS Notifications */}
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Send className="w-5 h-5 text-purple-600" />
                <span>Send Text Notifications</span>
              </h3>

              {/* SMS Status Messages */}
              {smsStatus && (
                <div className={`mb-4 p-4 rounded-xl ${
                  smsStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{smsStatus.message}</p>
                </div>
              )}

              {/* Client Phone Display */}
              {appointment.client?.phone ? (
                <>
                  <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>Sending to: {appointment.client.phone}</span>
                    {appointment.reminder_sent && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Notification sent
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={sendConfirmationSMS}
                      disabled={sendingSMS}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      <span>{sendingSMS ? 'Sending...' : 'Send Confirmation'}</span>
                    </button>

                    <button
                      onClick={send24HourReminder}
                      disabled={sendingSMS}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Bell className="w-5 h-5" />
                      <span>{sendingSMS ? 'Sending...' : 'Send Reminder'}</span>
                    </button>
                  </div>

                  {/* Message Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Message Preview:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {getConfirmationMessage({
                        clientName: appointment.client?.client_name || 
                                   (appointment.notes?.split('\n')[0]) || 
                                   'Client',
                        date: appointment.booking_date,
                        time: appointment.booking_time,
                        duration: appointment.duration_minutes,
                        lashMap: appointment.lash_map?.name,
                        price: appointment.total_price || undefined,
                        appointmentId: appointment.id
                      })}
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No phone number on file for this client. Add a phone number to the client profile to send text notifications.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark Complete</span>
                </button>

                <Link
                  href={`/dashboard/tech/appointments/${appointment.id}/edit`}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>

              <button
                onClick={deleteAppointment}
                disabled={actionLoading}
                className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Appointment</span>
              </button>
            </div>
          )}
        </main>

        {/* Complete Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Mark as Complete</h3>
              <p className="text-gray-600 mb-6">
                This will mark the appointment as completed and save the details to the client's history.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsComplete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Cancel Appointment</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for cancellation (optional):
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none mb-6"
                placeholder="Reason for cancellation..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={cancelAppointment}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

