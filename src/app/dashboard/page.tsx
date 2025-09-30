'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { createClient } from '@/utils/supabase'
import { Profile } from '@/types/database'
import {
  Sparkles,
  Trophy,
  Gift,
  Calendar,
  TrendingUp,
  Star,
  Target,
  Award,
  LogOut,
  User,
  Settings,
  Bell
} from 'lucide-react'

export default function Dashboard() {
  const { user: authUser, signOut } = useAuth()
  const { tenant } = useTenant()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserProfile() {
      if (authUser?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (error) {
            // If profile doesn't exist, create it
            if (error.code === 'PGRST116') {
              console.log('Profile not found, creating one...', error)
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: authUser.email,
                  full_name: authUser.user_metadata?.full_name || 'User',
                  roles: ['consumer'],
                  active_role: 'consumer',
                  level: 'Newbie',
                  points: 0,
                  streak: 0,
                  next_level_points: 1000
                })
                .select()
                .single()

              if (createError) {
                console.error('Error creating profile:', createError)
                throw createError
              }
              console.log('Profile created successfully:', newProfile)
              setProfile(newProfile)
            } else {
              console.error('Error fetching profile:', error)
              throw error
            }
          } else {
            console.log('Profile loaded successfully:', data)
            setProfile(data)
          }
        } catch (error) {
          console.error('Error fetching/creating profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserProfile()
  }, [authUser, supabase])

  // Redirect tech users to tech dashboard
  useEffect(() => {
    if (profile && profile.active_role === 'tech') {
      window.location.href = '/dashboard/tech'
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If profile is still null after loading, show error state
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
            <p className="text-gray-600 mb-4">There was an issue loading your profile data. Please try refreshing the page.</p>
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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Winksy.ai
              </h1>
            </div>
            
              <div className="flex items-center space-x-4">
                {profile && <RoleSwitcher profile={profile} />}
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <Link href="/dashboard/settings" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Settings className="w-5 h-5" />
                </Link>
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'User'}! 👋</h2>
            <p className="text-gray-600">You&apos;re doing great! Keep up the streak!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {profile?.points?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Points</p>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        {tenant && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {tenant.logo_url ? (
                  <Image
                    src={tenant.logo_url}
                    alt={tenant.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-600">{tenant.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  tenant.subscription_tier === 'pro'
                    ? 'bg-purple-100 text-purple-800'
                    : tenant.subscription_tier === 'enterprise'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tenant.subscription_tier.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">Subscription</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Level</span>
            </div>
            <div className="text-2xl font-bold">{profile?.level}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{profile?.points} pts</span>
                <span>{profile?.next_level_points || 1000} pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${profile?.next_level_points ? (profile.points / profile.next_level_points) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-pink-600" />
              <span className="text-sm font-medium text-gray-500">Daily Streak</span>
            </div>
            <div className="text-2xl font-bold">{profile?.streak || 0} Days</div>
            <p className="text-sm text-gray-600 mt-2">Keep it going! 🔥</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8 text-indigo-600" />
              <span className="text-sm font-medium text-gray-500">Next Reward</span>
            </div>
            <div className="text-2xl font-bold">500 pts</div>
            <p className="text-sm text-gray-600 mt-2">Until free applicator</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-sm font-medium text-gray-500">Rank</span>
            </div>
            <div className="text-2xl font-bold">#42</div>
            <p className="text-sm text-gray-600 mt-2">In your area</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/book" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
              <Calendar className="w-10 h-10 text-purple-600" />
              <div>
                <h4 className="font-semibold">Book Appointment</h4>
                <p className="text-sm text-gray-600">Find your perfect lash tech</p>
              </div>
            </Link>
            
            <Link href="/analyze" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all">
              <Sparkles className="w-10 h-10 text-pink-600" />
              <div>
                <h4 className="font-semibold">AI Lash Analysis</h4>
                <p className="text-sm text-gray-600">Get celebrity style match</p>
              </div>
            </Link>
            
            <Link href="/league" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Trophy className="w-10 h-10 text-indigo-600" />
              <div>
                <h4 className="font-semibold">Lash League</h4>
                <p className="text-sm text-gray-600">View challenges & compete</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-6">Today&apos;s Challenges</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Mink Monday</h4>
                  <p className="text-sm text-gray-600">Share a mink lash photo</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">+500 pts</div>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Start →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Referral Reward</h4>
                  <p className="text-sm text-gray-600">Invite a friend to join</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-pink-600">+1000 pts</div>
                <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                  Invite →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Review & Rate</h4>
                  <p className="text-sm text-gray-600">Rate your last appointment</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">+250 pts</div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Review →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
