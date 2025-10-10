'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Booking, Client, LashMap, CalendarConnection } from '@/types/database'
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreVertical,
  ArrowLeft,
  Bell,
  RefreshCw,
  Link2
} from 'lucide-react'

type ViewMode = 'calendar' | 'year' | 'list'
type FilterMode = 'all' | 'upcoming' | 'today' | 'completed' | 'cancelled'

interface AppointmentWithDetails extends Booking {
  client?: Client | null
  lash_map?: LashMap | null
  client_name?: string
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterMode, setFilterMode] = useState<FilterMode>('upcoming')
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    pending: 0
  })
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchAppointments()
      fetchStats()
      fetchCalendarConnections()
    }
  }, [user, filterMode])

  async function fetchAppointments() {
    setLoading(true)
    try {
      // First check if the bookings table has the new columns
      const { error: testError } = await supabase
        .from('bookings')
        .select('id, duration_minutes, client_id')
        .limit(1)

      if (testError) {
        console.error('Database migration needed. Run update_bookings_table.sql')
        console.error('Error details:', testError)
        setMigrationNeeded(true)
        setAppointments([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('bookings')
        .select(`
          *,
          client:clients(id, client_name, phone, email),
          lash_map:lash_maps(id, name, category, difficulty)
        `)
        .eq('tech_id', user?.id || '')
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })

      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Apply filters
      if (filterMode === 'today') {
        query = query.eq('booking_date', today)
      } else if (filterMode === 'upcoming') {
        query = query
          .gte('booking_date', today)
          .in('status', ['pending', 'confirmed'])
      } else if (filterMode === 'completed') {
        query = query.eq('status', 'completed')
      } else if (filterMode === 'cancelled') {
        query = query.eq('status', 'cancelled')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching appointments:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        setAppointments([])
        setLoading(false)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Today's appointments
      const { count: todayCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tech_id', user?.id || '')
        .eq('booking_date', today)
        .in('status', ['pending', 'confirmed'])

      // This week's appointments
      const { count: weekCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tech_id', user?.id || '')
        .gte('booking_date', today)
        .lte('booking_date', weekFromNow)
        .in('status', ['pending', 'confirmed'])

      // Pending confirmations
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tech_id', user?.id || '')
        .eq('status', 'pending')
        .gte('booking_date', today)

      setStats({
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        pending: pendingCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function fetchCalendarConnections() {
    try {
      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('tech_id', user?.id || '')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet, silently fail
        console.log('Calendar connections not available yet')
        return
      }

      setCalendarConnections(data || [])
      
      // Get the most recent sync time
      if (data && data.length > 0) {
        const mostRecent = data.reduce((prev, current) => {
          if (!current.last_synced_at) return prev
          if (!prev || !prev.last_synced_at) return current
          return new Date(current.last_synced_at) > new Date(prev.last_synced_at) ? current : prev
        })
        setLastSyncTime(mostRecent.last_synced_at)
      }
    } catch (error) {
      console.log('Calendar connections feature not yet available')
    }
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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
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
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calendar functions
  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  function getAppointmentsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.booking_date === dateStr)
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/tech" className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  My Appointments
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/tech/appointments/calendar-sync"
                  className="bg-white text-purple-600 border-2 border-purple-600 px-4 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Connect Calendar</span>
                  {calendarConnections.length > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {calendarConnections.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/tech/appointments/new"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Appointment</span>
                </Link>
              </div>
            </div>

            {/* Calendar Sync Status */}
            {calendarConnections.length > 0 && lastSyncTime && (
              <div className="mt-3 flex items-center justify-end space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4" />
                <span>Last synced: {new Date(lastSyncTime).toLocaleTimeString()}</span>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    viewMode === 'calendar'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Month</span>
                </button>
                <button
                  onClick={() => setViewMode('year')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    viewMode === 'year'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Year</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                {(['all', 'upcoming', 'today', 'completed', 'cancelled'] as FilterMode[]).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setFilterMode(filter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                      filterMode === filter
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Migration Needed Banner */}
          {migrationNeeded && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🚀 Database Setup Required
                  </h3>
                  <p className="text-gray-700 mb-4">
                    The appointments feature needs database updates before you can use it.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
                    <p className="font-semibold text-gray-900 mb-2">Quick Setup (2 minutes):</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>Open your <strong>Supabase Dashboard</strong></li>
                      <li>Go to <strong>SQL Editor</strong></li>
                      <li>Copy the contents from <code className="bg-gray-100 px-2 py-1 rounded">update_bookings_table.sql</code></li>
                      <li>Paste and click <strong>Run</strong></li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">What gets added:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Duration tracking</li>
                      <li>• Client linking</li>
                      <li>• Lash map integration</li>
                      <li>• Reminder system</li>
                      <li>• Completion tracking</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    📖 See <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">APPOINTMENTS_SETUP.md</code> for detailed instructions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Today's Appointments</span>
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.today}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">This Week</span>
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.thisWeek}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Pending Confirmations</span>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            </div>
          </div>

          {/* Year View */}
          {viewMode === 'year' && (
            <div className="space-y-6">
              {/* Year Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, 0, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold">
                    {currentMonth.getFullYear()}
                  </h2>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, 0, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                
                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, monthIndex) => {
                    const monthDate = new Date(currentMonth.getFullYear(), monthIndex, 1)
                    const { daysInMonth: days, startingDayOfWeek: startDay } = getDaysInMonth(monthDate)
                    const monthAppointments = appointments.filter(apt => {
                      const aptDate = new Date(apt.booking_date)
                      return aptDate.getFullYear() === currentMonth.getFullYear() && 
                             aptDate.getMonth() === monthIndex
                    })
                    
                    return (
                      <div key={monthIndex} className="bg-gray-50 rounded-xl p-4">
                        {/* Month Name */}
                        <h3 className="font-bold text-center mb-3 text-gray-900">
                          {monthDate.toLocaleDateString('en-US', { month: 'long' })}
                        </h3>
                        
                        {/* Mini Calendar */}
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {/* Day headers */}
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center font-semibold text-gray-600 py-1">
                              {day}
                            </div>
                          ))}
                          
                          {/* Empty cells */}
                          {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          
                          {/* Days */}
                          {Array.from({ length: days }).map((_, dayIndex) => {
                            const day = dayIndex + 1
                            const date = new Date(currentMonth.getFullYear(), monthIndex, day)
                            const dateStr = date.toISOString().split('T')[0]
                            const dayApts = appointments.filter(apt => apt.booking_date === dateStr)
                            const isToday = date.toDateString() === new Date().toDateString()
                            
                            return (
                              <div
                                key={day}
                                onClick={() => {
                                  setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, day))
                                  setViewMode('calendar')
                                }}
                                className={`aspect-square flex items-center justify-center rounded cursor-pointer transition-colors ${
                                  isToday ? 'bg-purple-600 text-white font-bold' :
                                  dayApts.length > 0 ? 'bg-green-200 text-green-900 font-semibold hover:bg-green-300' :
                                  'hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {day}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Appointment Count */}
                        {monthAppointments.length > 0 && (
                          <div className="mt-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              {monthAppointments.length} appointment{monthAppointments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const dateAppointments = getAppointmentsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={day}
                      className={`aspect-square border rounded-lg p-2 ${
                        isToday ? 'bg-purple-50 border-purple-300' : 'border-gray-200'
                      } hover:bg-gray-50 transition-colors cursor-pointer`}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-semibold ${isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        <div className="flex-1 mt-1 space-y-1">
                          {dateAppointments.slice(0, 3).map(apt => (
                            <Link
                              key={apt.id}
                              href={`/dashboard/tech/appointments/${apt.id}`}
                              className={`block text-xs px-1 py-0.5 rounded truncate ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {formatTime(apt.booking_time)}
                            </Link>
                          ))}
                          {dateAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dateAppointments.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-6">Get started by adding your first appointment</p>
                  <Link
                    href="/dashboard/tech/appointments/new"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Appointment</span>
                  </Link>
                </div>
              ) : (
                appointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Client Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        {/* Appointment Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.client?.client_name || 
                               (appointment.notes?.split('\n')[0]) || 
                               'No Client Name'}
                            </h3>
                            {appointment.import_source && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                <Link2 className="w-3 h-3 mr-1" />
                                {appointment.import_source}
                              </span>
                            )}
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="capitalize">{appointment.status}</span>
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="w-4 h-4 text-purple-600" />
                              <span>{formatDate(appointment.booking_date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-pink-600" />
                              <span>{formatTime(appointment.booking_time)} ({appointment.duration_minutes} min)</span>
                            </div>
                          </div>

                          {appointment.lash_map && (
                            <div className="mt-2 inline-flex items-center space-x-1 text-sm text-purple-600 font-medium">
                              <span>Lash Map:</span>
                              <span>{appointment.lash_map.name}</span>
                            </div>
                          )}

                          {appointment.reminder_sent && (
                            <div className="mt-2 inline-flex items-center space-x-1 text-xs text-green-600">
                              <Bell className="w-3 h-3" />
                              <span>Reminder sent</span>
                            </div>
                          )}

                          {appointment.notes && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/tech/appointments/${appointment.id}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/dashboard/tech/appointments/${appointment.id}?edit=true`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

