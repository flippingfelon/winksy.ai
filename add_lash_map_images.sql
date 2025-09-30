-- Add image fields to existing lash_maps table
ALTER TABLE public.lash_maps
ADD COLUMN IF NOT EXISTS preview_image_url TEXT, -- Realistic finished look on an eye
ADD COLUMN IF NOT EXISTS reference_map_url TEXT; -- Technical diagram for application
