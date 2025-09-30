ALTER TABLE public.lash_techs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lash tech profile" ON public.lash_techs;
DROP POLICY IF EXISTS "Users can insert own lash tech profile" ON public.lash_techs;
DROP POLICY IF EXISTS "Users can update own lash tech profile" ON public.lash_techs;

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

GRANT SELECT, INSERT, UPDATE ON public.lash_techs TO authenticated;

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

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'lash_techs';
