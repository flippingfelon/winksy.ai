'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { CalendarConnection } from '@/types/database'
import {
  ArrowLeft,
  Link2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  Plus,
  Loader2
} from 'lucide-react'

export default function CalendarSyncPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'ical' as 'google' | 'ical' | 'square' | 'booksy' | 'glossgenius' | 'other',
    connection_name: '',
    connection_url: ''
  })
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchConnections()
    }
  }, [user])

  async function fetchConnections() {
    setLoading(true)
    try {
      // First check if the table exists
      const { error: tableCheckError } = await supabase
        .from('calendar_connections')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Calendar connections table does not exist. Please run the migration first.')
        console.error('Run: create_calendar_connections_table.sql in Supabase SQL Editor')
        console.error('Error details:', tableCheckError)
        setSetupNeeded(true)
        setConnections([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('tech_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
      setSetupNeeded(false)
    } catch (error) {
      console.error('Error fetching connections:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
      }
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddConnection() {
    if (!formData.connection_name || !formData.connection_url) {
      setSaveStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    try {
      const { error } = await supabase
        .from('calendar_connections')
        .insert({
          tech_id: user?.id || '',
          platform: formData.platform,
          connection_name: formData.connection_name,
          connection_url: formData.connection_url,
          is_active: true
        })

      if (error) throw error

      setSaveStatus({ type: 'success', message: 'Calendar connected successfully!' })
      setShowAddForm(false)
      setFormData({ platform: 'ical', connection_name: '', connection_url: '' })
      fetchConnections()
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Error adding connection:', error)
      setSaveStatus({ type: 'error', message: 'Failed to connect calendar' })
    }
  }

  async function handleSyncNow(connectionId: string) {
    setSyncing(connectionId)
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId })
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus({ 
          type: 'success', 
          message: `Synced ${data.imported_count || 0} appointments successfully!` 
        })
        fetchConnections()
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Sync failed' })
      }
    } catch (error) {
      console.error('Error syncing:', error)
      setSaveStatus({ type: 'error', message: 'Failed to sync calendar' })
    } finally {
      setSyncing(null)
      setTimeout(() => setSaveStatus(null), 5000)
    }
  }

  async function handleToggleActive(connectionId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('calendar_connections')
        .update({ is_active: !isActive })
        .eq('id', connectionId)

      if (error) throw error
      fetchConnections()
    } catch (error) {
      console.error('Error toggling connection:', error)
    }
  }

  async function handleDeleteConnection(connectionId: string) {
    if (!confirm('Are you sure you want to remove this calendar connection?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('id', connectionId)

      if (error) throw error
      setSaveStatus({ type: 'success', message: 'Calendar disconnected' })
      fetchConnections()
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Error deleting connection:', error)
      setSaveStatus({ type: 'error', message: 'Failed to disconnect calendar' })
    }
  }

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case 'google': return '🗓️'
      case 'square': return '⬛'
      case 'booksy': return '📱'
      case 'glossgenius': return '💅'
      default: return '📅'
    }
  }

  function getPlatformColor(platform: string) {
    switch (platform) {
      case 'google': return 'bg-blue-100 text-blue-800'
      case 'square': return 'bg-gray-100 text-gray-800'
      case 'booksy': return 'bg-pink-100 text-pink-800'
      case 'glossgenius': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/tech/appointments" className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Calendar Sync
                  </h1>
                  <p className="text-sm text-gray-600">Connect and sync your external calendars</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Calendar</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Setup Required Banner */}
          {setupNeeded && (
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">🚀 Database Setup Required</h3>
                  <p className="text-purple-100 mb-4">
                    The calendar sync feature needs a database table to be created. Follow these steps:
                  </p>
                  
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                    <h4 className="font-semibold mb-2">Step 1: Open Supabase SQL Editor</h4>
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-200 hover:text-white underline flex items-center space-x-1"
                    >
                      <span>https://supabase.com/dashboard</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                    <h4 className="font-semibold mb-2">Step 2: Run the Migration</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-purple-100">
                      <li>Click "SQL Editor" in the left sidebar</li>
                      <li>Open the file: <code className="bg-black/20 px-2 py-1 rounded">create_calendar_connections_table.sql</code></li>
                      <li>Copy ALL the contents</li>
                      <li>Paste into SQL Editor</li>
                      <li>Click "Run" or press Cmd/Ctrl + Enter</li>
                    </ol>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Step 3: Refresh This Page</h4>
                    <p className="text-sm text-purple-100">After running the SQL, refresh this page to start using calendar sync!</p>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Page</span>
                    </button>
                    <a
                      href="/CALENDAR_SYNC_QUICKSTART.md"
                      target="_blank"
                      className="text-white hover:text-purple-200 underline text-sm flex items-center space-x-1"
                    >
                      <span>View Full Setup Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {saveStatus && (
            <div className={`mb-6 p-4 rounded-xl ${
              saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {saveStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {saveStatus.message}
                </p>
              </div>
            </div>
          )}

          {/* Add Connection Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Calendar Connection</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calendar Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'google' | 'ical' | 'square' | 'booksy' | 'glossgenius' | 'other' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ical">iCal / Webcal Feed</option>
                    <option value="square">Square</option>
                    <option value="booksy">Booksy</option>
                    <option value="glossgenius">GlossGenius</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calendar Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., My Square Calendar"
                    value={formData.connection_name}
                    onChange={(e) => setFormData({ ...formData, connection_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    iCal Feed URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.connection_url}
                    onChange={(e) => setFormData({ ...formData, connection_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Find this in your calendar app's settings (usually under "Export" or "Sharing")
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddConnection}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Connect Calendar
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Help Links */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Need help finding your iCal URL?</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <Link href="#square-help" className="flex items-center space-x-1 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    <span>How to get iCal from Square</span>
                  </Link>
                  <Link href="#booksy-help" className="flex items-center space-x-1 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    <span>How to get iCal from Booksy</span>
                  </Link>
                  <Link href="#glossgenius-help" className="flex items-center space-x-1 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    <span>How to get iCal from GlossGenius</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Connected Calendars List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Connected Calendars ({connections.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No calendars connected yet</p>
                <p className="text-sm text-gray-400">Click "Add Calendar" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-3xl">{getPlatformIcon(connection.platform)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{connection.connection_name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(connection.platform)}`}>
                              {connection.platform.toUpperCase()}
                            </span>
                            {connection.is_active ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                Paused
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 break-all">
                            {connection.connection_url}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {connection.last_synced_at ? (
                              <>
                                <span className="flex items-center space-x-1">
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Last synced: {new Date(connection.last_synced_at).toLocaleString()}</span>
                                </span>
                                <span>•</span>
                                <span>{connection.appointments_imported} appointments</span>
                              </>
                            ) : (
                              <span className="text-yellow-600">Never synced</span>
                            )}
                          </div>

                          {connection.last_sync_status === 'error' && connection.last_sync_error && (
                            <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-700">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              {connection.last_sync_error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSyncNow(connection.id)}
                          disabled={syncing === connection.id || !connection.is_active}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sync now"
                        >
                          <RefreshCw className={`w-5 h-5 ${syncing === connection.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(connection.id, connection.is_active)}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                            connection.is_active
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {connection.is_active ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove connection"
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

          {/* Help Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div id="square-help" className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-gray-900 mb-3">Square</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Log in to Square Dashboard</li>
                <li>Go to Appointments → Settings</li>
                <li>Look for "Calendar Sync" or "Export"</li>
                <li>Copy the iCal URL</li>
                <li>Paste it above</li>
              </ol>
            </div>

            <div id="booksy-help" className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-gray-900 mb-3">Booksy</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Open Booksy for Business app</li>
                <li>Go to Settings → Calendar Settings</li>
                <li>Find "Export to Calendar"</li>
                <li>Select "iCal Format"</li>
                <li>Copy and paste the URL</li>
              </ol>
            </div>

            <div id="glossgenius-help" className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-gray-900 mb-3">GlossGenius</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Log in to GlossGenius</li>
                <li>Go to Settings → Calendar</li>
                <li>Find "Calendar Feed" section</li>
                <li>Copy the provided URL</li>
                <li>Paste it in the form above</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

