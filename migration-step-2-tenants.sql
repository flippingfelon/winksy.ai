
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
