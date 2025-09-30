-- Multi-Tenant Extensions for Winksy.ai
-- Run these queries AFTER running the base supabase-schema.sql

-- ============================================================================
-- TENANT MANAGEMENT TABLES
-- ============================================================================

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
  subscription_status TEXT DEFAULT 'active',
  max_users INTEGER DEFAULT 10,
  max_techs INTEGER DEFAULT 5,
  features_enabled JSONB DEFAULT '{
    "bookings": true,
    "analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant admins (users who can manage a tenant)
CREATE TABLE public.tenant_admins (
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

-- ============================================================================
-- ADD TENANT_ID TO EXISTING TABLES
-- ============================================================================

-- Add tenant_id to profiles
ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to lash_techs
ALTER TABLE public.lash_techs ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to services
ALTER TABLE public.services ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to bookings
ALTER TABLE public.bookings ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to points
ALTER TABLE public.points ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to user_levels
ALTER TABLE public.user_levels ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to reviews
ALTER TABLE public.reviews ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- ============================================================================
-- UPDATE RLS POLICIES FOR MULTI-TENANCY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_admins ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a function to check if user is tenant admin
CREATE OR REPLACE FUNCTION auth.is_tenant_admin(tenant_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_admins ta
    WHERE ta.user_id = auth.uid()
    AND (tenant_uuid IS NULL OR ta.tenant_id = tenant_uuid)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- MULTI-TENANT RLS POLICIES
-- ============================================================================

-- Tenants: Public read, only tenant admins can update
CREATE POLICY "Tenants are viewable by everyone" ON public.tenants
  FOR SELECT USING (true);

CREATE POLICY "Tenant admins can update their tenant" ON public.tenants
  FOR UPDATE USING (
    auth.is_tenant_admin(id) OR
    id = auth.get_current_tenant_id()
  );

-- Tenant admins: Only tenant owners can manage admins
CREATE POLICY "Tenant admins viewable by tenant members" ON public.tenant_admins
  FOR SELECT USING (
    tenant_id = auth.get_current_tenant_id() OR
    auth.is_tenant_admin(tenant_id)
  );

CREATE POLICY "Tenant owners can manage admins" ON public.tenant_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tenant_admins ta
      WHERE ta.tenant_id = tenant_admins.tenant_id
      AND ta.user_id = auth.uid()
      AND ta.role = 'owner'
    )
  );

-- Profiles: Users can see profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id = auth.get_current_tenant_id() OR
    auth.is_tenant_admin(tenant_id)
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lash techs: Tenant members can view, techs can update their own
CREATE POLICY "Tenant members can view lash techs" ON public.lash_techs
  FOR SELECT USING (
    tenant_id = auth.get_current_tenant_id() OR
    auth.is_tenant_admin(tenant_id)
  );

CREATE POLICY "Techs can update their own profile" ON public.lash_techs
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tenant admins can manage techs" ON public.lash_techs
  FOR ALL USING (auth.is_tenant_admin(tenant_id));

-- Services: Tenant members can view, tenant admins can manage
CREATE POLICY "Tenant members can view services" ON public.services
  FOR SELECT USING (
    tenant_id = auth.get_current_tenant_id() OR
    auth.is_tenant_admin(tenant_id)
  );

CREATE POLICY "Tenant admins can manage services" ON public.services
  FOR ALL USING (auth.is_tenant_admin(tenant_id));

-- Bookings: Users can view their own, techs can view their bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id = auth.get_current_tenant_id()
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = auth.get_current_tenant_id()
  );

CREATE POLICY "Tenant admins can manage all bookings" ON public.bookings
  FOR ALL USING (auth.is_tenant_admin(tenant_id));

-- Points: Users can only see their own points
CREATE POLICY "Users can view their own points" ON public.points
  FOR SELECT USING (
    user_id = auth.uid() AND
    tenant_id = auth.get_current_tenant_id()
  );

CREATE POLICY "System can create points" ON public.points
  FOR INSERT WITH CHECK (tenant_id = auth.get_current_tenant_id());

-- User levels: Users can see their own, tenant admins can see all
CREATE POLICY "Users can view their own levels" ON public.user_levels
  FOR SELECT USING (
    user_id = auth.uid() AND
    tenant_id = auth.get_current_tenant_id()
  );

CREATE POLICY "Tenant admins can view all levels" ON public.user_levels
  FOR SELECT USING (auth.is_tenant_admin(tenant_id));

-- Reviews: Public read within tenant, users can create reviews
CREATE POLICY "Tenant members can view reviews" ON public.reviews
  FOR SELECT USING (
    tenant_id = auth.get_current_tenant_id() OR
    auth.is_tenant_admin(tenant_id)
  );

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reviews.booking_id
      AND b.user_id = auth.uid()
      AND b.tenant_id = auth.get_current_tenant_id()
    )
  );

-- ============================================================================
-- TENANT CREATION TRIGGER
-- ============================================================================

-- Function to create initial tenant admin when profile is created
CREATE OR REPLACE FUNCTION public.handle_tenant_admin_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first user for a tenant, make them the owner
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_admins
    WHERE tenant_id = NEW.tenant_id
  ) THEN
    INSERT INTO public.tenant_admins (tenant_id, user_id, role, permissions)
    VALUES (
      NEW.tenant_id,
      NEW.id,
      'owner',
      '{
        "manage_users": true,
        "manage_services": true,
        "view_analytics": true,
        "manage_settings": true,
        "manage_admins": true
      }'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tenant admin creation
CREATE TRIGGER handle_tenant_admin_creation_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.tenant_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_tenant_admin_creation();

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert a default tenant for development
INSERT INTO public.tenants (
  name,
  slug,
  description,
  primary_color,
  secondary_color,
  features_enabled
) VALUES (
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
);

-- Note: After running this schema, you'll need to:
-- 1. Update existing profiles to have tenant_id
-- 2. Update auth signup to include tenant selection
-- 3. Update the app to handle tenant context

-- To assign existing profiles to the demo tenant:
-- UPDATE public.profiles SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'demo-studio') WHERE tenant_id IS NULL;






