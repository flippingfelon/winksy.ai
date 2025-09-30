-- Winksy.ai Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('user', 'tech')) DEFAULT 'user',
  level TEXT DEFAULT 'Newbie',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
