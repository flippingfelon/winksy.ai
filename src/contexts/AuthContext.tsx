'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, userType: 'consumer' | 'tech', tenantId?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Skip auth initialization if we're using placeholder values (build time)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setLoading(false)
      return
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, fullName: string, userType: 'consumer' | 'tech', tenantId?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            tenant_id: tenantId || 'demo-tenant-id', // Default to demo tenant for now
          },
        },
      })

      if (error) throw error

      // The profile creation is now automated via the database trigger
      // which includes tenant assignment and admin role creation

      if (data.user && !data.user.email_confirmed_at) {
        // User needs to confirm email
        alert('Please check your email to confirm your account!')
      } else {
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Signing in with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('AuthContext: Sign in error:', error)
        throw error
      }

      if (data.user) {
        console.log('AuthContext: Sign in successful, user:', data.user.id)
        router.push('/dashboard')
      } else {
        console.error('AuthContext: No user data returned')
      }
    } catch (error: unknown) {
      console.error('AuthContext: Sign in failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign in failed')
    }
  }

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      // OAuth will redirect automatically
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  const updateProfile = async (data: Record<string, unknown>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      if (error) throw error
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
