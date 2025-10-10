'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import { Client, ClientAppointment, LashMap, CustomLashMap } from '@/types/database'
import { ArrowLeft, Plus, Calendar, Sparkles, Phone, Mail, FileText, Image, Edit, Trash2 } from 'lucide-react'
import CustomLashMapBuilder from '@/components/CustomLashMapBuilder'

type AppointmentWithMap = ClientAppointment & {
  lash_maps?: LashMap | null
  custom_lash_maps?: CustomLashMap | null
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const supabase = createClient()
  
  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithMap[]>([])
  const [lashMaps, setLashMaps] = useState<LashMap[]>([])
  const [customLashMaps, setCustomLashMaps] = useState<CustomLashMap[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [showCustomMapBuilder, setShowCustomMapBuilder] = useState(false)
  
  const [appointmentForm, setAppointmentForm] = useState({
    appointment_date: new Date().toISOString().split('T')[0],
    lash_map_id: '',
    custom_lash_map_name: '',
    curl_used: '',
    diameter_used: '',
    notes: '',
    photo_url: ''
  })

  useEffect(() => {
    loadClientData()
    loadLashMaps()
    loadCustomLashMaps()
  }, [clientId])

  async function loadClientData() {
    try {
      setLoading(true)
      
      // Load client info
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      setClient(clientData)

      // Load appointments with lash map details
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('client_appointments')
        .select(`
          *,
          lash_maps (*),
          custom_lash_maps (*)
        `)
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })

      if (appointmentsError) throw appointmentsError
      setAppointments(appointmentsData || [])
    } catch (error) {
      console.error('Error loading client data:', error)
      alert('Error loading client data')
    } finally {
      setLoading(false)
    }
  }

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

  async function loadCustomLashMaps() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('custom_lash_maps')
        .select('*')
        .eq('tech_id', user.id)
        .order('name')

      if (error) throw error
      setCustomLashMaps(data || [])
    } catch (error) {
      console.error('Error loading custom lash maps:', error)
    }
  }

  async function saveCustomLashMap(customMap: {
    name: string
    lengths: { [key: string]: number }
    curl_used: string
    diameter_used: string
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in to save custom maps')
        return
      }

      const { data, error } = await supabase
        .from('custom_lash_maps')
        .insert({
          tech_id: user.id,
          name: customMap.name,
          lengths: customMap.lengths,
          curl_used: customMap.curl_used,
          diameter_used: customMap.diameter_used
        })
        .select()
        .single()

      if (error) throw error

      alert('Custom lash map saved successfully!')
      setCustomLashMaps([...customLashMaps, data])
      setShowCustomMapBuilder(false)
      
      // Set the newly created custom map as selected
      setAppointmentForm({
        ...appointmentForm,
        lash_map_id: `custom-${data.id}`,
        custom_lash_map_name: '',
        curl_used: data.curl_used || '',
        diameter_used: data.diameter_used || ''
      })
    } catch (error: unknown) {
      console.error('Error saving custom lash map:', error)
      if (error instanceof Error) {
        alert(`Error saving custom map: ${error.message}`)
      } else {
        alert('Error saving custom map')
      }
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      // Determine if this is a custom lash map
      const isCustomMap = appointmentForm.lash_map_id.startsWith('custom-')
      const customMapId = isCustomMap ? appointmentForm.lash_map_id.replace('custom-', '') : null
      const libraryMapId = !isCustomMap && appointmentForm.lash_map_id ? appointmentForm.lash_map_id : null

      const { error } = await supabase
        .from('client_appointments')
        .insert({
          client_id: clientId,
          lash_map_id: libraryMapId,
          custom_lash_map_id: customMapId,
          appointment_date: new Date(appointmentForm.appointment_date).toISOString(),
          curl_used: appointmentForm.curl_used || null,
          diameter_used: appointmentForm.diameter_used || null,
          notes: appointmentForm.notes || null,
          photo_url: appointmentForm.photo_url || null
        })

      if (error) throw error

      alert('Appointment added successfully!')
      setShowNewAppointment(false)
      setAppointmentForm({
        appointment_date: new Date().toISOString().split('T')[0],
        lash_map_id: '',
        custom_lash_map_name: '',
        curl_used: '',
        diameter_used: '',
        notes: '',
        photo_url: ''
      })
      loadClientData()
    } catch (error: unknown) {
      console.error('Error adding appointment:', error)
      if (error instanceof Error) {
        alert(`Error adding appointment: ${error.message}`)
      } else {
        alert('Error adding appointment')
      }
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const { error } = await supabase
        .from('client_appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) throw error

      alert('Appointment deleted successfully!')
      loadClientData()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Error deleting appointment')
    }
  }

  function handleEditAppointment(appointment: AppointmentWithMap) {
    setEditingAppointmentId(appointment.id)
    
    // Determine which map ID to use
    let mapId = ''
    if (appointment.custom_lash_map_id) {
      mapId = `custom-${appointment.custom_lash_map_id}`
    } else if (appointment.lash_map_id) {
      mapId = appointment.lash_map_id
    }
    
    setAppointmentForm({
      appointment_date: new Date(appointment.appointment_date).toISOString().split('T')[0],
      lash_map_id: mapId,
      custom_lash_map_name: '',
      curl_used: appointment.curl_used || '',
      diameter_used: appointment.diameter_used || '',
      notes: appointment.notes || '',
      photo_url: appointment.photo_url || ''
    })
    setShowNewAppointment(false)
  }

  async function handleUpdateAppointment(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingAppointmentId) return

    try {
      // Determine if this is a custom lash map
      const isCustomMap = appointmentForm.lash_map_id.startsWith('custom-')
      const customMapId = isCustomMap ? appointmentForm.lash_map_id.replace('custom-', '') : null
      const libraryMapId = !isCustomMap && appointmentForm.lash_map_id ? appointmentForm.lash_map_id : null

      const { error } = await supabase
        .from('client_appointments')
        .update({
          lash_map_id: libraryMapId,
          custom_lash_map_id: customMapId,
          appointment_date: new Date(appointmentForm.appointment_date).toISOString(),
          curl_used: appointmentForm.curl_used || null,
          diameter_used: appointmentForm.diameter_used || null,
          notes: appointmentForm.notes || null,
          photo_url: appointmentForm.photo_url || null
        })
        .eq('id', editingAppointmentId)

      if (error) throw error

      alert('Appointment updated successfully!')
      setEditingAppointmentId(null)
      setAppointmentForm({
        appointment_date: new Date().toISOString().split('T')[0],
        lash_map_id: '',
        custom_lash_map_name: '',
        curl_used: '',
        diameter_used: '',
        notes: '',
        photo_url: ''
      })
      loadClientData()
    } catch (error: unknown) {
      console.error('Error updating appointment:', error)
      if (error instanceof Error) {
        alert(`Error updating appointment: ${error.message}`)
      } else {
        alert('Error updating appointment')
      }
    }
  }

  function handleCancelEdit() {
    setEditingAppointmentId(null)
    setAppointmentForm({
      appointment_date: new Date().toISOString().split('T')[0],
      lash_map_id: '',
      custom_lash_map_name: '',
      curl_used: '',
      diameter_used: '',
      notes: '',
      photo_url: ''
    })
  }

  const selectedMap = lashMaps.find(m => m.id === appointmentForm.lash_map_id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading client details...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
          <button
            onClick={() => router.push('/dashboard/tech/clients')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            Back to Clients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/tech/clients')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Clients
          </button>
          
          {/* Client Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {client.client_name}
                </h1>
                <div className="space-y-1">
                  {client.email && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </p>
                  )}
                  {client.last_appointment_date && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last visit: {new Date(client.last_appointment_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                {client.notes && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700"><strong>Client Notes:</strong> {client.notes}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowNewAppointment(!showNewAppointment)
                  setEditingAppointmentId(null)
                  setAppointmentForm({
                    appointment_date: new Date().toISOString().split('T')[0],
                    lash_map_id: '',
                    custom_lash_map_name: '',
                    curl_used: '',
                    diameter_used: '',
                    notes: '',
                    photo_url: ''
                  })
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Custom Lash Map Builder */}
        {showCustomMapBuilder && (
          <div className="mb-8">
            <CustomLashMapBuilder onSave={saveCustomLashMap} />
            <button
              onClick={() => setShowCustomMapBuilder(false)}
              className="mt-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* New/Edit Appointment Form */}
        {(showNewAppointment || editingAppointmentId) && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAppointmentId ? 'Edit Appointment' : 'Add New Appointment'}
            </h2>
            <form onSubmit={editingAppointmentId ? handleUpdateAppointment : handleAddAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentForm.appointment_date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lash Map Used
                  </label>
                  <select
                    value={appointmentForm.lash_map_id}
                    onChange={(e) => {
                      if (e.target.value === 'create-new-custom') {
                        setShowCustomMapBuilder(true)
                        setShowNewAppointment(false)
                        setEditingAppointmentId(null)
                      } else {
                        setAppointmentForm({ 
                          ...appointmentForm, 
                          lash_map_id: e.target.value,
                          custom_lash_map_name: ''
                        })
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a lash map (optional)</option>
                    
                    {/* Library Maps */}
                    <optgroup label="📚 Library Maps">
                      {lashMaps.map((map) => (
                        <option key={map.id} value={map.id}>
                          {map.name}
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Custom Maps */}
                    {customLashMaps.length > 0 && (
                      <optgroup label="✨ My Custom Maps">
                        {customLashMaps.map((map) => (
                          <option key={map.id} value={`custom-${map.id}`}>
                            {map.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {/* Create New */}
                    <option value="create-new-custom">➕ Create New Custom Map</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curl Used
                  </label>
                  <select
                    value={appointmentForm.curl_used}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, curl_used: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select curl type</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="CC">CC</option>
                    <option value="D">D</option>
                    <option value="DD">DD</option>
                    <option value="L">L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diameter Used
                  </label>
                  <select
                    value={appointmentForm.diameter_used}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, diameter_used: e.target.value })}
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
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    rows={3}
                    placeholder="Any notes about this appointment..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={appointmentForm.photo_url}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, photo_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (editingAppointmentId) {
                      handleCancelEdit()
                    } else {
                      setShowNewAppointment(false)
                    }
                  }}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  {editingAppointmentId ? 'Update Appointment' : 'Add Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointment History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment History</h2>
          
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-600 mb-6">Start tracking this client's lash journey</p>
              <button
                onClick={() => setShowNewAppointment(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {(appointment.lash_maps || appointment.custom_lash_maps) && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-600" />
                            <div>
                              <p className="text-sm text-gray-500">Lash Map</p>
                              <p className="font-medium text-gray-900">
                                {appointment.custom_lash_maps 
                                  ? `${appointment.custom_lash_maps.name} ✨` 
                                  : appointment.lash_maps?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {appointment.curl_used && (
                          <div>
                            <p className="text-sm text-gray-500">Curl</p>
                            <p className="font-medium text-gray-900">{appointment.curl_used}</p>
                          </div>
                        )}
                        
                        {appointment.diameter_used && (
                          <div>
                            <p className="text-sm text-gray-500">Diameter</p>
                            <p className="font-medium text-gray-900">{appointment.diameter_used}</p>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-600 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              {appointment.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {appointment.photo_url && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="w-4 h-4 text-purple-600" />
                            <p className="text-sm font-medium text-gray-700">Photo</p>
                          </div>
                          <img
                            src={appointment.photo_url}
                            alt="Appointment result"
                            className="rounded-lg max-w-md w-full h-auto"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit appointment"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

