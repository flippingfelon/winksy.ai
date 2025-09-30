'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Profile, LashTech } from '@/types/database'
import {
  Sparkles,
  ArrowLeft,
  User,
  Edit,
  MapPin,
  Calendar,
  Star,
  Briefcase
} from 'lucide-react'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lashTech, setLashTech] = useState<LashTech | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfileData() {
      if (authUser?.id) {
        try {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profileError) throw profileError
          setProfile(profileData)

          // If user is a tech, fetch lash tech data
          if (profileData.roles?.includes('tech')) {
            const { data: techData, error: techError } = await supabase
              .from('lash_techs')
              .select('*')
              .eq('id', authUser.id)
              .single()

            if (!techError) {
              setLashTech(techData)
            }
          }
        } catch (error) {
          console.error('Error fetching profile data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfileData()
  }, [authUser, supabase])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
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

  const hasConsumerRole = profile.roles?.includes('consumer')
  const hasTechRole = profile.roles?.includes('tech')

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
                    <p className="text-xs text-gray-500">My Profile</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/settings"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover border-4 border-purple-200"
                  />
                ) : (
                  <div className="w-30 h-30 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center border-4 border-purple-200">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'User'}
                </h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>

                {/* Roles */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {hasConsumerRole && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      👤 Consumer
                    </span>
                  )}
                  {hasTechRole && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                      💅 Lash Tech
                    </span>
                  )}
                </div>

                {/* Consumer Stats */}
                {hasConsumerRole && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {profile.points?.toLocaleString() || '0'}
                      </div>
                      <p className="text-sm text-gray-600">Points</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">
                        {profile.level || 'Newbie'}
                      </div>
                      <p className="text-sm text-gray-600">Level</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {profile.streak || 0}
                      </div>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        #{Math.floor(Math.random() * 100) + 1}
                      </div>
                      <p className="text-sm text-gray-600">Local Rank</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Information Section - Only for Tech Role */}
          {hasTechRole && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Business Information</h3>
                  <p className="text-gray-600">Your lash technician profile</p>
                </div>
              </div>

              {lashTech ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Business Details */}
                  <div className="space-y-4">
                    {lashTech.business_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <p className="text-gray-900 font-medium">{lashTech.business_name}</p>
                      </div>
                    )}

                    {lashTech.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location/Area
                        </label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{lashTech.location}</span>
                        </div>
                      </div>
                    )}

                    {lashTech.experience_years && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years of Experience
                        </label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{lashTech.experience_years} years</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specialties & Performance */}
                  <div className="space-y-4">
                    {lashTech.specialties && lashTech.specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialties
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {lashTech.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border border-purple-200"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (lashTech.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">
                          {lashTech.rating || 0}/5 ({lashTech.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Message for tech role but incomplete lash_techs profile
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Business Profile</h4>
                  <p className="text-gray-600 mb-6">
                    Set up your lash technician profile to attract clients and showcase your expertise.
                  </p>
                  <Link
                    href="/dashboard/settings"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow inline-flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Complete Business Profile</span>
                  </Link>
                </div>
              )}

              {/* Bio/Description - Show if exists */}
              {lashTech?.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio/Description
                  </label>
                  <p className="text-gray-900 leading-relaxed">{lashTech.bio}</p>
                </div>
              )}
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

            <Link
              href="/dashboard/settings"
              className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>
                  <p className="text-gray-600 text-sm">Update your information</p>
                </div>
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
