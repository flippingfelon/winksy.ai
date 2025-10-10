'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import { Client, LashMap } from '@/types/database'
import { Plus, Users, Calendar, Sparkles, ArrowUpDown } from 'lucide-react'

type ClientWithMap = Client & {
  last_map?: string | null
}

export default function ClientsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<ClientWithMap[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'alphabetical' | 'recent'>('recent')

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
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
        console.error('No tech profile found')
        return
      }

      // Get all clients
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          *
        `)
        .eq('tech_id', techData.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // For each client, get their most recent appointment's lash map name
      const clientsWithMaps = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { data: appointments } = await supabase
            .from('client_appointments')
            .select(`
              lash_map_id,
              lash_maps (
                name
              )
            `)
            .eq('client_id', client.id)
            .order('appointment_date', { ascending: false })
            .limit(1)

          const lastMap = null // TODO: Fix lash_maps type
          return {
            ...client,
            last_map: lastMap
          }
        })
      )

      setClients(clientsWithMaps)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.client_name.localeCompare(b.client_name)
    } else {
      // Sort by most recent appointment
      const aDate = a.last_appointment_date ? new Date(a.last_appointment_date).getTime() : 0
      const bDate = b.last_appointment_date ? new Date(b.last_appointment_date).getTime() : 0
      return bDate - aDate
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                My Clients
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manage your client appointments and lash history
              </p>
            </div>
            
            {/* Add New Client Button */}
            <button
              onClick={() => router.push('/dashboard/tech/clients/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add New Client
            </button>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 text-gray-700">
              <ArrowUpDown className="w-5 h-5" />
              <span className="font-medium">Sort by:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'recent'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'alphabetical'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alphabetical
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading clients...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && clients.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">Start building your client list by adding your first client</p>
            <button
              onClick={() => router.push('/dashboard/tech/clients/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Client
            </button>
          </div>
        )}

        {/* Clients Grid */}
        {!loading && clients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/dashboard/tech/clients/${client.id}`)}
              >
                <div className="p-6">
                  {/* Client Name */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {client.client_name}
                    </h3>
                    {client.email && (
                      <p className="text-sm text-gray-600 mt-1">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    )}
                  </div>

                  {/* Last Appointment Info */}
                  <div className="space-y-2 mb-4">
                    {client.last_appointment_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>
                          Last visit: {new Date(client.last_appointment_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {client.last_map && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                        <span>Last map: {client.last_map}</span>
                      </div>
                    )}

                    {!client.last_appointment_date && (
                      <div className="text-sm text-gray-500 italic">
                        No appointments yet
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg font-medium hover:from-purple-100 hover:to-pink-100 transition-all group-hover:shadow-md">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

