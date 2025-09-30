-- Run this in Supabase SQL Editor to migrate the schema

-- Add new columns and migrate data
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

-- Add constraints (only if they don't exist)
DO $$
BEGIN
    -- Add check constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'profiles_valid_roles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT valid_roles CHECK (roles <@ ARRAY['consumer', 'tech']);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'profiles_valid_active_role'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT valid_active_role CHECK (active_role IN ('consumer', 'tech'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'profiles_active_role_in_roles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT active_role_in_roles CHECK (active_role = ANY(roles));
    END IF;
END $$;

-- Add INSERT policy for profiles
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
