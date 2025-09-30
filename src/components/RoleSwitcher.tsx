'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase'
import { Profile } from '@/types/database'

interface RoleSwitcherProps {
  profile: Profile
  className?: string
}

export function RoleSwitcher({ profile, className = '' }: RoleSwitcherProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSwitching, setIsSwitching] = useState(false)
  const supabase = createClient()

  // Only show if user has both roles
  if (!profile.roles.includes('consumer') || !profile.roles.includes('tech')) {
    return null
  }

  const isTechActive = profile.active_role === 'tech'

  const handleRoleSwitch = async () => {
    if (!user || isSwitching) return

    setIsSwitching(true)

    try {
      const newRole = isTechActive ? 'consumer' : 'tech'

      // Update the active role in the database
      const { error } = await supabase
        .from('profiles')
        .update({ active_role: newRole })
        .eq('id', user.id)

      if (error) throw error

      // Redirect to appropriate dashboard
      const targetPath = newRole === 'tech' ? '/dashboard/tech' : '/dashboard'
      router.push(targetPath)

      // Force a page reload to ensure all context updates
      setTimeout(() => {
        window.location.href = targetPath
      }, 100)

    } catch (error) {
      console.error('Error switching roles:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className={`text-sm font-medium transition-colors ${
        !isTechActive ? 'text-purple-600' : 'text-gray-600'
      }`}>
        Consumer View
      </span>

      <button
        onClick={handleRoleSwitch}
        disabled={isSwitching}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${
          isTechActive ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isTechActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <span className={`text-sm font-medium transition-colors ${
        isTechActive ? 'text-purple-600' : 'text-gray-600'
      }`}>
        Tech View
      </span>

      {isSwitching && (
        <div className="ml-2">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}






