'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  website_url?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  timezone: string
  currency: string
  is_active: boolean
  subscription_tier: string
  features_enabled: Record<string, boolean>
}

interface TenantContextType {
  tenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
  setTenantById: (id: string) => void
  setTenantBySlug: (slug: string) => void
  refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

// Default demo tenant for development
const DEMO_TENANT: Tenant = {
  id: 'demo-tenant-id',
  name: 'Demo Lash Studio',
  slug: 'demo-studio',
  description: 'A beautiful lash studio for demo purposes',
  primary_color: '#a855f7',
  secondary_color: '#ec4899',
  timezone: 'UTC',
  currency: 'USD',
  is_active: true,
  subscription_tier: 'pro',
  features_enabled: {
    bookings: true,
    analytics: true,
    custom_branding: true,
    api_access: true,
  },
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(DEMO_TENANT)
  const [tenants, setTenants] = useState<Tenant[]>([DEMO_TENANT])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Load available tenants
  useEffect(() => {
    async function loadTenants() {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('is_active', true)

        if (error) throw error

        if (data && data.length > 0) {
          setTenants(data)
          // If no tenant is set, use the first one
          if (!tenant || tenant.id === 'demo-tenant-id') {
            setTenant(data[0])
          }
        }
      } catch (error) {
        console.error('Error loading tenants:', error)
        // Fallback to demo tenant
        setTenant(DEMO_TENANT)
      }
    }

    loadTenants()
  }, [supabase, tenant])

  const setTenantById = (id: string) => {
    const foundTenant = tenants.find(t => t.id === id)
    if (foundTenant) {
      setTenant(foundTenant)
      // Store in localStorage for persistence
      localStorage.setItem('selectedTenantId', id)
    }
  }

  const setTenantBySlug = (slug: string) => {
    const foundTenant = tenants.find(t => t.slug === slug)
    if (foundTenant) {
      setTenant(foundTenant)
      localStorage.setItem('selectedTenantId', foundTenant.id)
    }
  }

  const refreshTenant = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant.id)
        .single()

      if (error) throw error

      if (data) {
        setTenant(data)
      }
    } catch (error) {
      console.error('Error refreshing tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load tenant from localStorage on mount
  useEffect(() => {
    const storedTenantId = localStorage.getItem('selectedTenantId')
    if (storedTenantId && storedTenantId !== 'demo-tenant-id') {
      setTenantById(storedTenantId)
    }
  }, [tenants, setTenantById])

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenants,
        loading,
        setTenantById,
        setTenantBySlug,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
