-- Create custom_lash_maps table for techs to create their own lash maps
CREATE TABLE IF NOT EXISTS public.custom_lash_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_id UUID NOT NULL REFERENCES public.lash_techs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lengths JSONB NOT NULL,
  curl_used TEXT,
  diameter_used TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_lash_maps_tech_id ON public.custom_lash_maps(tech_id);

-- Enable Row Level Security
ALTER TABLE public.custom_lash_maps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_lash_maps table
CREATE POLICY "Techs can view their own custom lash maps"
  ON public.custom_lash_maps FOR SELECT
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can insert their own custom lash maps"
  ON public.custom_lash_maps FOR INSERT
  WITH CHECK (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can update their own custom lash maps"
  ON public.custom_lash_maps FOR UPDATE
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can delete their own custom lash maps"
  ON public.custom_lash_maps FOR DELETE
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_custom_lash_maps_updated_at
  BEFORE UPDATE ON public.custom_lash_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add custom_lash_map_id to client_appointments table
ALTER TABLE public.client_appointments
ADD COLUMN IF NOT EXISTS custom_lash_map_id UUID REFERENCES public.custom_lash_maps(id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_client_appointments_custom_lash_map_id 
  ON public.client_appointments(custom_lash_map_id);

