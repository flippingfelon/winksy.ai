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
          service_id: string | null
          booking_date: string
          booking_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number | null
          tenant_id: string | null
          duration_minutes: number
          reminder_sent: boolean
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          client_id: string | null
          lash_map_id: string | null
          import_source: string | null
          external_event_id: string | null
          calendar_connection_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tech_id: string
          service_id?: string | null
          booking_date: string
          booking_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          tenant_id?: string | null
          duration_minutes?: number
          reminder_sent?: boolean
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          client_id?: string | null
          lash_map_id?: string | null
          import_source?: string | null
          external_event_id?: string | null
          calendar_connection_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tech_id?: string
          service_id?: string | null
          booking_date?: string
          booking_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          tenant_id?: string | null
          duration_minutes?: number
          reminder_sent?: boolean
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          client_id?: string | null
          lash_map_id?: string | null
          import_source?: string | null
          external_event_id?: string | null
          calendar_connection_id?: string | null
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
          specifications: {
            lengths?: { [key: string]: number }
            curl_options?: string
            diameter?: string
            recommended_products?: string[]
          } | null
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
          specifications?: {
            lengths?: { [key: string]: number }
            curl_options?: string
            diameter?: string
            recommended_products?: string[]
          } | null
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
          specifications?: {
            lengths?: { [key: string]: number }
            curl_options?: string
            diameter?: string
            recommended_products?: string[]
          } | null
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
      clients: {
        Row: {
          id: string
          tech_id: string
          client_name: string
          phone: string | null
          email: string | null
          last_appointment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tech_id: string
          client_name: string
          phone?: string | null
          email?: string | null
          last_appointment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tech_id?: string
          client_name?: string
          phone?: string | null
          email?: string | null
          last_appointment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_appointments: {
        Row: {
          id: string
          client_id: string
          lash_map_id: string | null
          custom_lash_map_id: string | null
          appointment_date: string
          curl_used: string | null
          diameter_used: string | null
          notes: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lash_map_id?: string | null
          custom_lash_map_id?: string | null
          appointment_date: string
          curl_used?: string | null
          diameter_used?: string | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          lash_map_id?: string | null
          custom_lash_map_id?: string | null
          appointment_date?: string
          curl_used?: string | null
          diameter_used?: string | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_lash_maps: {
        Row: {
          id: string
          tech_id: string
          name: string
          lengths: { [key: string]: number }
          curl_used: string | null
          diameter_used: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tech_id: string
          name: string
          lengths: { [key: string]: number }
          curl_used?: string | null
          diameter_used?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tech_id?: string
          name?: string
          lengths?: { [key: string]: number }
          curl_used?: string | null
          diameter_used?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          caption: string | null
          post_type: 'look' | 'tutorial' | 'tip' | 'before-after'
          lash_map_id: string | null
          likes_count: number
          comments_count: number
          is_tech_only: boolean
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          caption?: string | null
          post_type: 'look' | 'tutorial' | 'tip' | 'before-after'
          lash_map_id?: string | null
          likes_count?: number
          comments_count?: number
          is_tech_only?: boolean
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          caption?: string | null
          post_type?: 'look' | 'tutorial' | 'tip' | 'before-after'
          lash_map_id?: string | null
          likes_count?: number
          comments_count?: number
          is_tech_only?: boolean
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          comment_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          comment_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      calendar_connections: {
        Row: {
          id: string
          tech_id: string
          platform: 'google' | 'ical' | 'square' | 'booksy' | 'glossgenius' | 'other'
          connection_name: string | null
          connection_url: string | null
          access_token: string | null
          refresh_token: string | null
          calendar_id: string | null
          sync_direction: 'import_only' | 'two_way'
          is_active: boolean
          last_synced_at: string | null
          sync_frequency_minutes: number
          last_sync_status: string | null
          last_sync_error: string | null
          appointments_imported: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tech_id: string
          platform: 'google' | 'ical' | 'square' | 'booksy' | 'glossgenius' | 'other'
          connection_name?: string | null
          connection_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          calendar_id?: string | null
          sync_direction?: 'import_only' | 'two_way'
          is_active?: boolean
          last_synced_at?: string | null
          sync_frequency_minutes?: number
          last_sync_status?: string | null
          last_sync_error?: string | null
          appointments_imported?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tech_id?: string
          platform?: 'google' | 'ical' | 'square' | 'booksy' | 'glossgenius' | 'other'
          connection_name?: string | null
          connection_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          calendar_id?: string | null
          sync_direction?: 'import_only' | 'two_way'
          is_active?: boolean
          last_synced_at?: string | null
          sync_frequency_minutes?: number
          last_sync_status?: string | null
          last_sync_error?: string | null
          appointments_imported?: number
          created_at?: string
          updated_at?: string
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
export type Client = Tables<'clients'>
export type ClientAppointment = Tables<'client_appointments'>
export type CustomLashMap = Tables<'custom_lash_maps'>
export type Post = Tables<'posts'>
export type PostLike = Tables<'post_likes'>
export type PostComment = Tables<'post_comments'>
export type UserFollow = Tables<'user_follows'>
export type CalendarConnection = Tables<'calendar_connections'>

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
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientAppointmentInsert = Database['public']['Tables']['client_appointments']['Insert']
export type CustomLashMapInsert = Database['public']['Tables']['custom_lash_maps']['Insert']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostLikeInsert = Database['public']['Tables']['post_likes']['Insert']
export type PostCommentInsert = Database['public']['Tables']['post_comments']['Insert']
export type UserFollowInsert = Database['public']['Tables']['user_follows']['Insert']
export type CalendarConnectionInsert = Database['public']['Tables']['calendar_connections']['Insert']

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
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type ClientAppointmentUpdate = Database['public']['Tables']['client_appointments']['Update']
export type CustomLashMapUpdate = Database['public']['Tables']['custom_lash_maps']['Update']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type PostLikeUpdate = Database['public']['Tables']['post_likes']['Update']
export type PostCommentUpdate = Database['public']['Tables']['post_comments']['Update']
export type UserFollowUpdate = Database['public']['Tables']['user_follows']['Update']
export type CalendarConnectionUpdate = Database['public']['Tables']['calendar_connections']['Update']
