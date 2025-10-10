'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import { LashMap } from '@/types/database'
import { ArrowLeft, Save, Upload, Calendar, User, Phone, Mail, FileText, Sparkles } from 'lucide-react'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [lashMaps, setLashMaps] = useState<LashMap[]>([])
  
  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    email: '',
    appointment_date: new Date().toISOString().split('T')[0],
    lash_map_id: '',
    custom_lash_map_name: '',
    curl_used: '',
    diameter_used: '',
    notes: '',
    photo_url: ''
  })

  useEffect(() => {
    loadLashMaps()
  }, [])

  async function loadLashMaps() {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .order('name')

      if (error) throw error
      setLashMaps(data || [])
    } catch (error) {
      console.error('Error loading lash maps:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Get the current tech's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data: techData } = await supabase
        .from('lash_techs')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!techData) {
        alert('Tech profile not found')
        return
      }

      // Create the client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          tech_id: techData.id,
          client_name: formData.client_name,
          phone: formData.phone || null,
          email: formData.email || null,
          notes: formData.notes || null
        })
        .select()
        .single()

      if (clientError) throw clientError

      // Create the first appointment
      // Handle custom lash map
      const isCustomMap = formData.lash_map_id === 'custom'
      const notesWithCustomMap = isCustomMap && formData.custom_lash_map_name
        ? `Custom Map: ${formData.custom_lash_map_name}${formData.notes ? '\n\n' + formData.notes : ''}`
        : formData.notes || null

      const { error: appointmentError } = await supabase
        .from('client_appointments')
        .insert({
          client_id: clientData.id,
          lash_map_id: isCustomMap ? null : (formData.lash_map_id || null),
          appointment_date: new Date(formData.appointment_date).toISOString(),
          curl_used: formData.curl_used || null,
          diameter_used: formData.diameter_used || null,
          notes: notesWithCustomMap,
          photo_url: formData.photo_url || null
        })

      if (appointmentError) throw appointmentError

      alert('Client added successfully!')
      router.push(`/dashboard/tech/clients/${clientData.id}`)
    } catch (error: unknown) {
      console.error('Error adding client:', error)
      if (error instanceof Error) {
        alert(`Error adding client: ${error.message}`)
      } else {
        alert('Error adding client')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get the selected lash map's specifications
  const selectedMap = lashMaps.find(m => m.id === formData.lash_map_id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Clients
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Add New Client
          </h1>
          <p className="text-gray-600">Create a new client profile and record their first appointment</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Client Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">First Appointment Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Lash Map Used
                </label>
                <select
                  value={formData.lash_map_id}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      lash_map_id: e.target.value,
                      custom_lash_map_name: e.target.value === 'custom' ? formData.custom_lash_map_name : ''
                    })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select a lash map (optional)</option>
                  {lashMaps.map((map) => (
                    <option key={map.id} value={map.id}>
                      {map.name} - {map.category} ({map.difficulty})
                    </option>
                  ))}
                  <option value="custom">Custom Lash Map</option>
                </select>
                
                {/* Custom lash map name input */}
                {formData.lash_map_id === 'custom' && (
                  <input
                    type="text"
                    required
                    value={formData.custom_lash_map_name}
                    onChange={(e) => setFormData({ ...formData, custom_lash_map_name: e.target.value })}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="Enter custom lash map name"
                  />
                )}
              </div>

              {/* Show curl and diameter options from selected map */}
              {selectedMap && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Curl Used
                    </label>
                    <select
                      value={formData.curl_used}
                      onChange={(e) => setFormData({ ...formData, curl_used: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select curl type</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="CC">CC</option>
                      <option value="D">D</option>
                      <option value="DD">DD</option>
                      <option value="L">L</option>
                      {selectedMap.specifications?.curl_options && (
                        <option value={selectedMap.specifications.curl_options}>
                          {selectedMap.specifications.curl_options} (Recommended)
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diameter Used
                    </label>
                    <select
                      value={formData.diameter_used}
                      onChange={(e) => setFormData({ ...formData, diameter_used: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select diameter</option>
                      <option value="0.03mm">0.03mm</option>
                      <option value="0.05mm">0.05mm</option>
                      <option value="0.07mm">0.07mm</option>
                      <option value="0.10mm">0.10mm</option>
                      <option value="0.12mm">0.12mm</option>
                      <option value="0.15mm">0.15mm</option>
                      <option value="0.18mm">0.18mm</option>
                      <option value="0.20mm">0.20mm</option>
                      {selectedMap.specifications?.diameter && (
                        <option value={selectedMap.specifications.diameter}>
                          {selectedMap.specifications.diameter} (Recommended)
                        </option>
                      )}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Notes & Photo</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  rows={4}
                  placeholder="Any special notes about this appointment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a URL to a photo of the finished look
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

