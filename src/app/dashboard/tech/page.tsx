'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { createClient } from '@/utils/supabase'
import { Profile } from '@/types/database'
import {
  Sparkles,
  Eye,
  Play,
  Calendar,
  Users,
  ShoppingBag,
  LogOut,
  User,
  Settings,
  Bell,
  Star
} from 'lucide-react'

interface TechTile {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

const techTiles: TechTile[] = [
  {
    title: 'Lash Maps',
    description: 'Browse lash styles and techniques',
    icon: Eye,
    href: '/dashboard/tech/lash-maps',
    color: 'from-pink-500 to-purple-600'
  },
  {
    title: 'Training Videos',
    description: 'Learn and improve your skills',
    icon: Play,
    href: '/dashboard/tech/training',
    color: 'from-purple-500 to-pink-600'
  },
  {
    title: 'My Appointments',
    description: 'View upcoming bookings',
    icon: Calendar,
    href: '/dashboard/tech/appointments',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    title: 'My Clients',
    description: 'Manage your client list',
    icon: Users,
    href: '/dashboard/tech/clients',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    title: 'Order Supplies',
    description: 'Purchase lash products',
    icon: ShoppingBag,
    href: '/dashboard/tech/supplies',
    color: 'from-pink-600 to-red-500'
  }
]

export default function TechDashboard() {
  const { user: authUser, signOut } = useAuth()
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
                  full_name: authUser.user_metadata?.full_name || 'Tech',
                  roles: ['consumer', 'tech'],
                  active_role: 'tech',
                  level: 'Newbie'
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

  // Check if user has tech role active
  useEffect(() => {
    if (!loading && profile && profile.active_role !== 'tech') {
      // Redirect users with inactive tech role to regular dashboard
      window.location.href = '/dashboard'
    }
  }, [profile, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tech dashboard...</p>
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

  // If not a tech user, show access denied
  if (!profile.roles.includes('tech')) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">This dashboard is only available to lash technicians.</p>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow inline-block"
            >
              Go to Client Dashboard
            </Link>
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
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Winksy.ai
                  </h1>
                  <p className="text-xs text-gray-500">Tech Dashboard</p>
                </div>
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
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {profile?.full_name || 'Tech'}
                    </span>
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
                <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Tech'}! 👋</h2>
                <p className="text-gray-600">Ready to create some beautiful lashes today?</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Pro
                </div>
                <p className="text-sm text-gray-600 mt-1">Lash Technician</p>
              </div>
            </div>
          </div>

          {/* Tech Dashboard Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techTiles.map((tile, index) => (
              <Link
                key={index}
                href={tile.href}
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${tile.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <tile.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                  {tile.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  {tile.description}
                </p>
                <div className="mt-4 flex items-center text-purple-600 group-hover:text-purple-700 transition-colors">
                  <span className="text-sm font-medium">Explore</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-gray-600 mt-2">Appointments</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-pink-600" />
                <span className="text-sm font-medium text-gray-500">This Week</span>
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-gray-600 mt-2">Total Clients</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-gray-500">This Month</span>
              </div>
              <div className="text-2xl font-bold">$1,250</div>
              <p className="text-sm text-gray-600 mt-2">Revenue</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <span className="text-sm font-medium text-gray-500">Average</span>
              </div>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-sm text-gray-600 mt-2">Star Rating</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
