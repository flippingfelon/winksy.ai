-- Enable RLS on lash_techs table (if not already enabled)
ALTER TABLE public.lash_techs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Users can view own lash tech profile" ON public.lash_techs;
DROP POLICY IF EXISTS "Users can insert own lash tech profile" ON public.lash_techs;
DROP POLICY IF EXISTS "Users can update own lash tech profile" ON public.lash_techs;

-- Create new RLS policies
CREATE POLICY "Users can view own lash tech profile"
ON public.lash_techs FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own lash tech profile"
ON public.lash_techs FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own lash tech profile"
ON public.lash_techs FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.lash_techs TO authenticated;

-- Ensure the id column references profiles.id correctly
-- Check if foreign key constraint exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lash_techs_id_fkey'
        AND table_name = 'lash_techs'
    ) THEN
        ALTER TABLE public.lash_techs
        ADD CONSTRAINT lash_techs_id_fkey
        FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the setup
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'lash_techs';
