'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Profile, LashTech } from '@/types/database'
import {
  Sparkles,
  ArrowLeft,
  User,
  Settings as SettingsIcon,
  Check,
  Loader2,
  Briefcase,
  Save,
  AlertCircle,
  X
} from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lashTech, setLashTech] = useState<LashTech | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [isTechEnabled, setIsTechEnabled] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Business profile form state
  const [businessName, setBusinessName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const supabase = createClient()

  // Specialty options
  const specialtyOptions = [
    'Volume Lashes',
    'Classic Lashes',
    'Mega Volume',
    'Hybrid Sets',
    'Lash Lifts',
    'Russian Volume',
    '3D Volume',
    'Mega Volume Lashes',
    'Lash Extensions',
    'Lash Tinting',
    'Lash Perming',
    'Brow Lamination',
    'Microblading',
    'Lash Removal',
    'Eyelash Treatments'
  ]

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        try {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) throw profileError
          setProfile(profileData)
          setIsTechEnabled(profileData.roles?.includes('tech') || false)

          // Fetch lash tech data if user is a tech
          if (profileData.roles?.includes('tech')) {
            const { data: techData, error: techError } = await supabase
              .from('lash_techs')
              .select('*')
              .eq('id', user.id)
              .single()

            if (!techError && techData) {
              setLashTech(techData)

              // Populate form fields with existing data
              setBusinessName(techData.business_name || '')
              setLocation(techData.location || '')
              setBio(techData.bio || '')
              setExperienceYears(techData.experience_years?.toString() || '')
              setSelectedSpecialties(techData.specialties || [])
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const handleSaveBusinessProfile = async () => {
    if (!user || savingBusiness) return

    // Check if user has tech role
    if (!profile?.roles?.includes('tech')) {
      setMessage({
        type: 'error',
        text: 'You must enable the technician role before saving business profile information.'
      })
      return
    }

    setSavingBusiness(true)
    setMessage(null)

    try {
      const businessData = {
        id: user.id,
        business_name: businessName.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        specialties: selectedSpecialties.length > 0 ? selectedSpecialties : null
      }

      console.log('🔄 Saving business profile for user:', user.id)
      console.log('👤 User auth info:', {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
        user_metadata: user.user_metadata
      })
      console.log('📝 Business data to save:', businessData)

      // Validate data before upsert
      if (!user.id) {
        throw new Error('User ID is required')
      }

      if (businessData.id !== user.id) {
        console.error('❌ ID mismatch:', { userId: user.id, businessDataId: businessData.id })
        throw new Error('Business data ID does not match user ID')
      }

      // Check current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('🔐 Current session:', sessionData?.session ? 'Active' : 'None')
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
      }
      if (sessionData?.session?.access_token) {
        console.log('🔑 Has access token:', !!sessionData.session.access_token)
      }

      // Test database connection first
      try {
        const { data: testData, error: testError } = await supabase
          .from('lash_techs')
          .select('id')
          .limit(1)

        if (testError) {
          console.error('❌ Database connection test failed:', testError)
          console.error('❌ Test error details:', {
            message: testError.message,
            code: testError.code,
            details: testError.details,
            hint: testError.hint
          })
        } else {
          console.log('✅ Database connection OK, found', testData?.length || 0, 'records')
        }
      } catch (connError) {
        console.error('❌ Database connection error:', connError)
        throw new Error(`Database connection failed: ${connError instanceof Error ? connError.message : 'Unknown error'}`)
      }

      console.log('🔍 Supabase client check:', {
        hasFrom: typeof supabase.from === 'function',
        supabaseType: typeof supabase
      })

      let upsertData, error

      try {
        console.log('🚀 Making Supabase upsert call...')

        // Intercept the request
        const query = supabase
          .from('lash_techs')
          .upsert(businessData, {
            onConflict: 'id'
          })
          .select()

        console.log('📡 Supabase query object:', query)

        const result = await query

        console.log('📨 Raw response from Supabase:', result)
        console.log('📨 Response type:', typeof result)
        console.log('📨 Response keys:', Object.keys(result))
        console.log('📨 Response has data:', 'data' in result)
        console.log('📨 Response has error:', 'error' in result)

        upsertData = result.data
        error = result.error

        console.log('📊 Extracted data:', upsertData)
        console.log('📊 Extracted error:', error)
        console.log('📊 Raw upsert result:', result)
      } catch (syncError) {
        console.error('❌ Synchronous error during upsert:', syncError)
        console.error('❌ Sync error type:', typeof syncError)
        console.error('❌ Sync error instanceof Error:', syncError instanceof Error)
        error = syncError
        upsertData = null
      }

      console.log('📊 Upsert response data:', upsertData)

      if (error) {
        console.error('❌ Supabase upsert error:', error)
        console.error('❌ Error type:', typeof error)
        console.error('❌ Error constructor:', error?.constructor?.name)
        console.error('❌ Error instanceof Error:', error instanceof Error)
        console.error('❌ Error keys:', error ? Object.keys(error) : 'No keys')
        console.error('❌ Error toString:', error?.toString?.())
        console.error('❌ Error prototype:', Object.getPrototypeOf(error))
        console.error('❌ Error is empty object:', error && Object.keys(error).length === 0)

        // Try to extract error details safely
        try {
          const errorDetails = {
            message: (error && typeof error === 'object' && 'message' in error) ? error.message : 'No message',
            details: (error && typeof error === 'object' && 'details' in error) ? error.details : 'No details',
            hint: (error && typeof error === 'object' && 'hint' in error) ? error.hint : 'No hint',
            code: (error && typeof error === 'object' && 'code' in error) ? error.code : 'No code',
            fullError: JSON.stringify(error, null, 2)
          }
          console.error('❌ Error details:', errorDetails)

          // Check for common Supabase error patterns
          const errorCode = (error && typeof error === 'object' && 'code' in error) ? error.code : null
          const errorMessage = (error && typeof error === 'object' && 'message' in error) ? error.message : null

          if (errorCode === '23505') {
            console.error('❌ Unique constraint violation - record already exists')
          } else if (errorCode === '23503') {
            console.error('❌ Foreign key constraint violation')
          } else if (errorCode === '42501') {
            console.error('❌ Insufficient privilege - RLS policy violation')
          } else if (errorMessage && typeof errorMessage === 'string' && errorMessage.includes('JWT')) {
            console.error('❌ Authentication error - invalid JWT token')
          }

        } catch (logError) {
          console.error('❌ Could not parse error details:', logError)
          console.error('❌ Raw error object:', error)
        }

        throw error
      }

      console.log('✅ Business profile upsert completed successfully')

      // Refresh the lash tech data to get the latest from database
      const { data: refreshedData, error: refreshError } = await supabase
        .from('lash_techs')
        .select('*')
        .eq('id', user.id)
        .single()

      if (refreshError) {
        console.error('❌ Error refreshing data:', refreshError)
      } else if (refreshedData) {
        setLashTech(refreshedData)
        console.log('🔄 Refreshed lash tech data:', refreshedData)
      }

      setMessage({
        type: 'success',
        text: 'Business profile saved successfully!'
      })

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)

    } catch (error) {
      console.error('❌ Error saving business profile:', error)
      console.error('❌ Error type:', typeof error)

      if (error instanceof Error) {
        console.error('❌ Error constructor:', error.constructor.name)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
      } else {
        console.error('❌ Error constructor:', error?.constructor?.name)
      }

      // More specific error messages
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }

      setMessage({
        type: 'error',
        text: `Failed to save business profile: ${errorMessage}. Please check the console for details.`
      })
    } finally {
      setSavingBusiness(false)
    }
  }

  const handleTechRoleToggle = async () => {
    if (!user || !profile || saving) return

    setSaving(true)

    try {
      const newRoles = isTechEnabled
        ? ['consumer'] // Remove tech role
        : ['consumer', 'tech'] // Add tech role

      const newActiveRole = isTechEnabled ? 'consumer' : 'tech'

      // Update profile roles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          roles: newRoles,
          active_role: newActiveRole
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // If enabling tech role, create lash_techs entry
      if (!isTechEnabled) {
        const { error: techError } = await supabase
          .from('lash_techs')
          .insert({
            id: user.id,
            business_name: null,
            rating: 0,
            review_count: 0,
            is_verified: false
          })

        if (techError && techError.code !== '23505') { // Ignore duplicate key error
          console.warn('Could not create lash_techs entry:', techError)
        }
      }

      // Update local state
      setProfile({
        ...profile,
        roles: newRoles as ('consumer' | 'tech')[],
        active_role: newActiveRole
      })
      setIsTechEnabled(!isTechEnabled)

      // Show success message
      console.log(isTechEnabled ? 'Tech role disabled' : 'Tech role enabled successfully!')

      // If enabling tech role, redirect to tech dashboard after a brief delay
      if (!isTechEnabled) {
        setTimeout(() => {
          router.push('/dashboard/tech')
        }, 1000)
      }

    } catch (error) {
      console.error('Error updating roles:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load profile</h2>
            <p className="text-gray-600 mb-4">There was an issue loading your profile data.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Winksy.ai
                    </h1>
                    <p className="text-xs text-gray-500">Settings</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {profile?.full_name || 'User'}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-gray-600">Manage your account preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Current Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        role === 'consumer'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {role === 'consumer' ? '👤 Consumer' : '💅 Lash Tech'}
                      {profile.active_role === role && (
                        <Check className="w-4 h-4 ml-1" />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Role Toggle */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      id="tech-role"
                      checked={isTechEnabled}
                      onChange={handleTechRoleToggle}
                      disabled={saving}
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="tech-role" className="text-sm font-medium text-gray-900 cursor-pointer">
                      I&apos;m also a lash technician
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable this if you provide lash services. You&apos;ll get access to the tech dashboard with appointment management, client tools, and more.
                    </p>
                    {saving && (
                      <div className="flex items-center mt-2 text-purple-600">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Updating your roles...</span>
                      </div>
                    )}
                    {!isTechEnabled && !saving && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800">
                          🎉 <strong>Pro Tip:</strong> Enable your tech role to access exclusive lash technician features like appointment management, client tools, and professional resources!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Profile Section - Only for Tech Role */}
          {isTechEnabled && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Business Profile</h2>
                  <p className="text-gray-600">Set up your lash technician profile</p>
                </div>
              </div>

              {/* Success/Error Message */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>{message.text}</span>
                  <button
                    onClick={() => setMessage(null)}
                    className="ml-auto hover:opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {/* Business Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your business or studio name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/Area
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Seattle, WA or Downtown Miami"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio/Description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-vertical"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g., 3"
                    className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => handleSpecialtyToggle(specialty)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          selectedSpecialties.includes(specialty)
                            ? 'bg-purple-100 border-purple-300 text-purple-800'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedSpecialties.length > 0 ? selectedSpecialties.join(', ') : 'None'}
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveBusinessProfile}
                    disabled={savingBusiness}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {savingBusiness ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{savingBusiness ? 'Saving...' : 'Save Business Profile'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Back to Dashboard</h3>
                  <p className="text-gray-600 text-sm">Return to your main dashboard</p>
                </div>
                <ArrowLeft className="w-6 h-6 text-purple-600" />
              </div>
            </Link>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-sm">Contact our support team</p>
                </div>
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}






