'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Client, LashMap } from '@/types/database'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Save,
  AlertCircle,
  Sparkles,
  Plus
} from 'lucide-react'

export default function NewAppointmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [lashMaps, setLashMaps] = useState<LashMap[]>([])
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    booking_date: '',
    booking_time: '',
    lash_map_id: '',
    duration_minutes: 120,
    status: 'pending' as 'pending' | 'confirmed',
    notes: '',
    total_price: 0,
    // New client fields (if adding new)
    new_client_name: '',
    new_client_phone: '',
    new_client_email: ''
  })

  const [showNewClientForm, setShowNewClientForm] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchLashMaps()
  }, [user])

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('tech_id', user?.id || '')
        .order('client_name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  async function fetchLashMaps() {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .order('name')

      if (error) throw error
      setLashMaps(data || [])
    } catch (error) {
      console.error('Error fetching lash maps:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let clientId = formData.client_id

      // Create new client if needed
      if (showNewClientForm && formData.new_client_name) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            tech_id: user?.id || '',
            client_name: formData.new_client_name,
            phone: formData.new_client_phone || null,
            email: formData.new_client_email || null
          })
          .select()
          .single()

        if (clientError) throw clientError
        clientId = newClient.id
      }

      if (!clientId) {
        alert('Please select or create a client')
        setLoading(false)
        return
      }

      // Create appointment
      const appointmentData: any = {
        tech_id: user?.id || '',
        user_id: user?.id || '', // For now, same as tech_id
        client_id: clientId,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        lash_map_id: formData.lash_map_id || null,
        duration_minutes: formData.duration_minutes,
        status: formData.status,
        notes: formData.notes || null,
        total_price: formData.total_price || null
      }

      // Only add service_id if we have one (to avoid empty string issues)
      if (formData.lash_map_id) {
        appointmentData.service_id = formData.lash_map_id
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('bookings')
        .insert(appointmentData)
        .select()
        .single()

      if (appointmentError) {
        console.error('Appointment error details:', appointmentError)
        throw appointmentError
      }

      // Success!
      router.push('/dashboard/tech/appointments')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/tech/appointments" className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  New Appointment
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>Client</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showNewClientForm ? 'Select Existing' : 'Add New Client'}</span>
                </button>
              </div>

              {showNewClientForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.new_client_name}
                      onChange={(e) => setFormData({ ...formData, new_client_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.new_client_phone}
                      onChange={(e) => setFormData({ ...formData, new_client_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.new_client_email}
                      onChange={(e) => setFormData({ ...formData, new_client_email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              ) : (
                <select
                  required={!showNewClientForm}
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.client_name} {client.phone && `- ${client.phone}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Date & Time</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Service Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lash Map / Service
                  </label>
                  <select
                    value={formData.lash_map_id}
                    onChange={(e) => setFormData({ ...formData, lash_map_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a lash map (optional)</option>
                    {lashMaps.map(map => (
                      <option key={map.id} value={map.id}>
                        {map.name} - {map.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 120 })}
                      min={30}
                      step={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.total_price}
                      onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
                      min={0}
                      step={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'confirmed' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Add any special notes or requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/dashboard/tech/appointments"
                className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Appointment'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}

