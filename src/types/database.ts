// Database types for Winksy.ai
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          roles: ('consumer' | 'tech')[]
          active_role: 'consumer' | 'tech'
          level: string
          points: number
          streak: number
          next_level_points: number
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          roles?: ('consumer' | 'tech')[]
          active_role?: 'consumer' | 'tech'
          level?: string
          points?: number
          streak?: number
          next_level_points?: number
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          roles?: ('consumer' | 'tech')[]
          active_role?: 'consumer' | 'tech'
          level?: string
          points?: number
          streak?: number
          next_level_points?: number
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          primary_color: string
          secondary_color: string
          website_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          timezone: string
          currency: string
          is_active: boolean
          subscription_tier: string
          features_enabled: Record<string, boolean>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          timezone?: string
          currency?: string
          is_active?: boolean
          subscription_tier?: string
          features_enabled?: Record<string, boolean>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          timezone?: string
          currency?: string
          is_active?: boolean
          subscription_tier?: string
          features_enabled?: Record<string, boolean>
          created_at?: string
          updated_at?: string
        }
      }
      lash_techs: {
        Row: {
          id: string
          business_name: string | null
          bio: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          experience_years: number | null
          specialties: string[] | null
          portfolio_urls: string[] | null
          license_number: string | null
          insurance_info: string | null
          rating: number | null
          review_count: number | null
          is_verified: boolean
          availability_schedule: Record<string, unknown> | null
          pricing: Record<string, unknown> | null
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          experience_years?: number | null
          specialties?: string[] | null
          portfolio_urls?: string[] | null
          license_number?: string | null
          insurance_info?: string | null
          rating?: number | null
          review_count?: number | null
          is_verified?: boolean
          availability_schedule?: Record<string, unknown> | null
          pricing?: Record<string, unknown> | null
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          experience_years?: number | null
          specialties?: string[] | null
          portfolio_urls?: string[] | null
          license_number?: string | null
          insurance_info?: string | null
          rating?: number | null
          review_count?: number | null
          is_verified?: boolean
          availability_schedule?: Record<string, unknown> | null
          pricing?: Record<string, unknown> | null
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          tech_id: string
          name: string
          description: string | null
          duration_minutes: number | null
          base_price: number | null
          category: string | null
          tenant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tech_id: string
          name: string
          description?: string | null
          duration_minutes?: number | null
          base_price?: number | null
          category?: string | null
          tenant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tech_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number | null
          base_price?: number | null
          category?: string | null
          tenant_id?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          tech_id: string
          service_id: string
          booking_date: string
          booking_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number | null
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tech_id: string
          service_id: string
          booking_date: string
          booking_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tech_id?: string
          service_id?: string
          booking_date?: string
          booking_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      points: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string | null
          reference_type: string | null
          reference_id: string | null
          expires_at: string | null
          tenant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason?: string | null
          reference_type?: string | null
          reference_id?: string | null
          expires_at?: string | null
          tenant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string | null
          reference_type?: string | null
          reference_id?: string | null
          expires_at?: string | null
          tenant_id?: string | null
          created_at?: string
        }
      }
      user_levels: {
        Row: {
          id: string
          user_id: string
          level_name: string
          current_level: number
          total_points: number
          badges: string[]
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level_name?: string
          current_level?: number
          total_points?: number
          badges?: string[]
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level_name?: string
          current_level?: number
          total_points?: number
          badges?: string[]
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          tenant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          tenant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          tenant_id?: string | null
          created_at?: string
        }
      }
      lash_maps: {
        Row: {
          id: string
          name: string
          category: 'Natural' | 'Volume' | 'Mega Volume' | 'Special/Celebrity Styles'
          difficulty: 'Beginner' | 'Intermediate' | 'Pro'
          description: string | null
          image_url: string | null
          video_url: string | null
          specifications: Record<string, unknown> | null
          preview_image_url: string | null
          reference_map_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'Natural' | 'Volume' | 'Mega Volume' | 'Special/Celebrity Styles'
          difficulty: 'Beginner' | 'Intermediate' | 'Pro'
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          specifications?: Record<string, unknown> | null
          preview_image_url?: string | null
          reference_map_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'Natural' | 'Volume' | 'Mega Volume' | 'Special/Celebrity Styles'
          difficulty?: 'Beginner' | 'Intermediate' | 'Pro'
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          specifications?: Record<string, unknown> | null
          preview_image_url?: string | null
          reference_map_url?: string | null
          created_at?: string
        }
      }
      tenant_admins: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager'
          permissions: Record<string, boolean>
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'manager'
          permissions?: Record<string, boolean>
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager'
          permissions?: Record<string, boolean>
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type Profile = Tables<'profiles'>
export type Tenant = Tables<'tenants'>
export type LashTech = Tables<'lash_techs'>
export type LashMap = Tables<'lash_maps'>
export type Service = Tables<'services'>
export type Booking = Tables<'bookings'>
export type Point = Tables<'points'>
export type UserLevel = Tables<'user_levels'>
export type Review = Tables<'reviews'>
export type TenantAdmin = Tables<'tenant_admins'>

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type LashTechInsert = Database['public']['Tables']['lash_techs']['Insert']
export type LashMapInsert = Database['public']['Tables']['lash_maps']['Insert']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type PointInsert = Database['public']['Tables']['points']['Insert']
export type UserLevelInsert = Database['public']['Tables']['user_levels']['Insert']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type TenantAdminInsert = Database['public']['Tables']['tenant_admins']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']
export type LashTechUpdate = Database['public']['Tables']['lash_techs']['Update']
export type LashMapUpdate = Database['public']['Tables']['lash_maps']['Update']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type PointUpdate = Database['public']['Tables']['points']['Update']
export type UserLevelUpdate = Database['public']['Tables']['user_levels']['Update']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
export type TenantAdminUpdate = Database['public']['Tables']['tenant_admins']['Update']
