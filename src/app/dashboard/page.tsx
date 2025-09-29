'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const router = useRouter()
  
  // Mock user data - replace with actual Supabase data
  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    points: 2500,
    level: 'Enthusiast',
    streak: 7,
    nextLevelPoints: 5000,
    userType: 'consumer' // or 'tech'
  }

  const handleSignOut = () => {
    // TODO: Implement Supabase sign out
    router.push('/')
  }

  return (
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
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
              <p className="text-gray-600">You're doing great! Keep up the streak!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {user.points.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Points</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Level</span>
            </div>
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{user.points} pts</span>
                <span>{user.nextLevelPoints} pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${(user.points / user.nextLevelPoints) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-pink-600" />
              <span className="text-sm font-medium text-gray-500">Daily Streak</span>
            </div>
            <div className="text-2xl font-bold">{user.streak} Days</div>
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
          <h3 className="text-xl font-bold mb-6">Today's Challenges</h3>
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
  )
}
