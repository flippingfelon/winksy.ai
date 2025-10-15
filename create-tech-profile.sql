-- Create a lash_techs entry for your user account
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users

-- First, check if you already have a lash_techs entry
SELECT * FROM public.lash_techs WHERE id = auth.uid();

-- If you don't have one, run this to create it:
INSERT INTO public.lash_techs (id)
SELECT auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM public.lash_techs WHERE id = auth.uid()
);

-- Verify it was created:
SELECT * FROM public.lash_techs WHERE id = auth.uid();


