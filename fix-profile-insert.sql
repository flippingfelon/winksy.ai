-- Add INSERT policy for profiles table

-- Drop and recreate the INSERT policy
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
