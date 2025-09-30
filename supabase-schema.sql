-- Winksy.ai Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  roles TEXT[] DEFAULT ARRAY['consumer'],
  active_role TEXT DEFAULT 'consumer',
  level TEXT DEFAULT 'Newbie',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_roles CHECK (roles <@ ARRAY['consumer', 'tech']),
  CONSTRAINT valid_active_role CHECK (active_role IN ('consumer', 'tech')),
  CONSTRAINT active_role_in_roles CHECK (active_role = ANY(roles))
);

-- Lash Technicians table
CREATE TABLE public.lash_techs (
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

-- Services offered by techs
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_id UUID REFERENCES public.lash_techs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  base_price DECIMAL(8, 2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings/Appointments
CREATE TABLE public.bookings (
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

-- Lash League Points System
CREATE TABLE public.points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT, -- 'booking', 'share', 'challenge', etc.
  reference_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User levels and achievements
CREATE TABLE public.user_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  level_name TEXT DEFAULT 'Newbie',
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table (represents different lash studios/businesses)
CREATE TABLE public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for subdomains: studio-slug.winksy.ai
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#a855f7', -- hex color for branding
  secondary_color TEXT DEFAULT '#ec4899',
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  features_enabled JSONB DEFAULT '{
    "bookings": true,
    "analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lash_techs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lash techs: Public read, only techs can update their own
CREATE POLICY "Lash techs are viewable by everyone" ON public.lash_techs
  FOR SELECT USING (true);

CREATE POLICY "Techs can update own profile" ON public.lash_techs
  FOR UPDATE USING (auth.uid() = id);

-- Services: Public read, techs can manage their own services
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Techs can manage own services" ON public.services
  FOR ALL USING (auth.uid() = tech_id);

-- Bookings: Users can see their own bookings, techs can see bookings for their services
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

-- Points: Users can only see their own points
CREATE POLICY "Users can view own points" ON public.points
  FOR SELECT USING (auth.uid() = user_id);

-- User levels: Users can only see their own levels
CREATE POLICY "Users can view own levels" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Public read, users can create reviews for their completed bookings
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

-- Tenants: Public read, only authenticated users can view active tenants
CREATE POLICY "Active tenants are viewable by everyone" ON public.tenants
  FOR SELECT USING (is_active = true);

-- Functions and Triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lash_techs
  BEFORE UPDATE ON public.lash_techs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_levels
  BEFORE UPDATE ON public.user_levels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_roles TEXT[];
  default_role TEXT;
BEGIN
  -- Check if user metadata specifies roles
  user_roles := CASE
    WHEN NEW.raw_user_meta_data->>'user_type' = 'tech' THEN ARRAY['consumer', 'tech']
    ELSE ARRAY['consumer']
  END;

  default_role := CASE
    WHEN NEW.raw_user_meta_data->>'user_type' = 'tech' THEN 'tech'
    ELSE 'consumer'
  END;

  INSERT INTO public.profiles (id, email, full_name, roles, active_role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', user_roles, default_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
