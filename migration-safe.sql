-- Safe Migration for Existing Database
-- Run this in your Supabase SQL editor if you have existing tables

-- Step 1: Create any missing core tables first

-- Create lash_techs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lash_techs (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  bio TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  experience_years INTEGER,
  specialties TEXT[],
  portfolio_urls TEXT[],
  license_number TEXT,
  insurance_info TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  availability_schedule JSONB,
  pricing JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_id UUID REFERENCES public.lash_techs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  base_price DECIMAL(8, 2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tech_id UUID REFERENCES public.lash_techs(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  total_price DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_levels table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  level_name TEXT DEFAULT 'Newbie',
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create tenants table and related tables
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#a855f7',
  secondary_color TEXT DEFAULT '#ec4899',
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'free',
  features_enabled JSONB DEFAULT '{
    "bookings": true,
    "analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tenant_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'manager')) DEFAULT 'admin',
  permissions JSONB DEFAULT '{
    "manage_users": true,
    "manage_services": true,
    "view_analytics": true,
    "manage_settings": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Step 3: Migrate user_type to roles/active_role system and add missing columns

-- Migrate existing user_type to new roles system
DO $$
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'roles') THEN
        ALTER TABLE public.profiles ADD COLUMN roles TEXT[] DEFAULT ARRAY['consumer'];
        RAISE NOTICE 'Added roles column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'active_role') THEN
        ALTER TABLE public.profiles ADD COLUMN active_role TEXT DEFAULT 'consumer';
        RAISE NOTICE 'Added active_role column to profiles table';
    END IF;

    -- Migrate existing user_type data to new system
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        -- Update existing records based on user_type
        UPDATE public.profiles
        SET
          roles = CASE
            WHEN user_type = 'tech' THEN ARRAY['consumer', 'tech']
            ELSE ARRAY['consumer']
          END,
          active_role = CASE
            WHEN user_type = 'tech' THEN 'tech'
            ELSE 'consumer'
          END
        WHERE roles = ARRAY['consumer'] OR roles IS NULL; -- Only update if not already migrated

        -- Drop the old column
        ALTER TABLE public.profiles DROP COLUMN user_type;
        RAISE NOTICE 'Migrated user_type to roles/active_role system and dropped old column';
    END IF;

    -- Add level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'level') THEN
        ALTER TABLE public.profiles ADD COLUMN level TEXT DEFAULT 'Newbie';
        RAISE NOTICE 'Added level column to profiles table';
    END IF;
END $$;

-- Add tenant_id columns to all tables (if they don't exist)
DO $$
BEGIN
    -- Profiles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to profiles table';
    END IF;

    -- Lash techs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'lash_techs' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.lash_techs ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to lash_techs table';
    END IF;

    -- Services table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'services' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.services ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to services table';
    END IF;

    -- Bookings table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bookings' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.bookings ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to bookings table';
    END IF;

    -- Points table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'points' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.points ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to points table';
    END IF;

    -- User levels table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_levels' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.user_levels ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to user_levels table';
    END IF;

    -- Reviews table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'reviews' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.reviews ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
        RAISE NOTICE 'Added tenant_id column to reviews table';
    END IF;
END $$;

-- Step 4: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lash_techs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create/update RLS policies

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lash techs policies
DROP POLICY IF EXISTS "Lash techs are viewable by everyone" ON public.lash_techs;
DROP POLICY IF EXISTS "Techs can update own profile" ON public.lash_techs;

CREATE POLICY "Lash techs are viewable by everyone" ON public.lash_techs
  FOR SELECT USING (true);

CREATE POLICY "Techs can update own profile" ON public.lash_techs
  FOR UPDATE USING (auth.uid() = id);

-- Services policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Techs can manage own services" ON public.services;

CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Techs can manage own services" ON public.services
  FOR ALL USING (auth.uid() = tech_id);

-- Bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can view bookings for their services" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Techs can view bookings for their services" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = bookings.service_id
      AND services.tech_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Points policies
DROP POLICY IF EXISTS "Users can view own points" ON public.points;

CREATE POLICY "Users can view own points" ON public.points
  FOR SELECT USING (auth.uid() = user_id);

-- User levels policies
DROP POLICY IF EXISTS "Users can view own levels" ON public.user_levels;

CREATE POLICY "Users can view own levels" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Tenants policies
DROP POLICY IF EXISTS "Active tenants are viewable by everyone" ON public.tenants;

CREATE POLICY "Active tenants are viewable by everyone" ON public.tenants
  FOR SELECT USING (is_active = true);

-- Tenant admins policies (basic policy for now)
DROP POLICY IF EXISTS "Tenant admins viewable by members" ON public.tenant_admins;

CREATE POLICY "Tenant admins viewable by members" ON public.tenant_admins
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    ) OR auth.uid() IN (
      SELECT user_id FROM public.tenant_admins WHERE tenant_id = tenant_admins.tenant_id
    )
  );

-- Step 5: Create/update functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers (only if they don't exist)
DO $$
BEGIN
    -- Check and create triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_profiles') THEN
        CREATE TRIGGER handle_updated_at_profiles
          BEFORE UPDATE ON public.profiles
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_lash_techs') THEN
        CREATE TRIGGER handle_updated_at_lash_techs
          BEFORE UPDATE ON public.lash_techs
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_bookings') THEN
        CREATE TRIGGER handle_updated_at_bookings
          BEFORE UPDATE ON public.bookings
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_user_levels') THEN
        CREATE TRIGGER handle_updated_at_user_levels
          BEFORE UPDATE ON public.user_levels
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_tenants') THEN
        CREATE TRIGGER handle_updated_at_tenants
          BEFORE UPDATE ON public.tenants
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, level)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'Newbie');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Step 6: Insert default tenant for development (only if no tenants exist)
INSERT INTO public.tenants (
  name,
  slug,
  description,
  primary_color,
  secondary_color,
  features_enabled
) SELECT
  'Demo Lash Studio',
  'demo-studio',
  'A beautiful lash studio for demo purposes',
  '#a855f7',
  '#ec4899',
  '{
    "bookings": true,
    "analytics": true,
    "custom_branding": true,
    "api_access": true
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.tenants LIMIT 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Created all missing tables (lash_techs, services, bookings, points, user_levels, reviews)';
    RAISE NOTICE 'Added level column to profiles table with default value ''Newbie''';
    RAISE NOTICE 'Created tenants table with all specified columns';
    RAISE NOTICE 'Added tenant_id columns to all tables for multi-tenancy';
    RAISE NOTICE 'Updated all RLS policies and triggers';
END $$;
