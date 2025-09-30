-- Create lash_maps table for the Lash Maps feature
CREATE TABLE IF NOT EXISTS public.lash_maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Natural', 'Volume', 'Mega Volume', 'Special/Celebrity Styles')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Pro')),
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.lash_maps ENABLE ROW LEVEL SECURITY;

-- Create policies for lash_maps
CREATE POLICY "Lash maps are viewable by authenticated users"
ON public.lash_maps FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can manage lash maps"
ON public.lash_maps FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert sample data
INSERT INTO public.lash_maps (name, category, difficulty, description, image_url) VALUES
-- Natural Maps - Beginner
('Classic Natural', 'Natural', 'Beginner', 'Simple, even length lashes that blend seamlessly with natural growth', '/images/lash-maps/classic-natural.jpg'),
('Everyday Natural', 'Natural', 'Beginner', 'Subtle enhancement that maintains your natural lash appearance', '/images/lash-maps/everyday-natural.jpg'),
('Natural Wispy', 'Natural', 'Beginner', 'Light, feathery look that adds definition without volume', '/images/lash-maps/natural-wispy.jpg'),

-- Natural Maps - Intermediate
('Natural Glam', 'Natural', 'Intermediate', 'Natural look with a touch of glamour for special occasions', '/images/lash-maps/natural-glam.jpg'),
('Open Eye Natural', 'Natural', 'Intermediate', 'Eye-opening effect that enhances your natural eye shape', '/images/lash-maps/open-eye-natural.jpg'),
('Textured Natural', 'Natural', 'Intermediate', 'Varied lengths for dimension and a textured, natural appearance', '/images/lash-maps/textured-natural.jpg'),

-- Natural Maps - Pro
('Natural Starburst', 'Natural', 'Pro', 'Complex fan placement for dramatic yet natural enhancement', '/images/lash-maps/natural-starburst.jpg'),
('Natural Hybrid', 'Natural', 'Pro', 'Mixed classic and volume techniques for sophisticated results', '/images/lash-maps/natural-hybrid.jpg'),
('Customized Natural', 'Natural', 'Pro', 'Tailored to face shape with personalized length and curl patterns', '/images/lash-maps/customized-natural.jpg'),

-- Volume Maps
('Classic Volume', 'Volume', 'Beginner', 'Beautiful volume lashes for everyday wear', '/images/lash-maps/classic-volume.jpg'),
('Wispy Volume', 'Volume', 'Beginner', 'Light volume with wispy effect', '/images/lash-maps/wispy-volume.jpg'),
('Dramatic Volume', 'Volume', 'Intermediate', 'Bold volume lashes for special occasions', '/images/lash-maps/dramatic-volume.jpg'),
('Hybrid Volume', 'Volume', 'Intermediate', 'Mix of volume and natural styles', '/images/lash-maps/hybrid-volume.jpg'),
('Russian Volume', 'Volume', 'Pro', 'Advanced volume technique for maximum fullness', '/images/lash-maps/russian-volume.jpg'),
('Volume Fan', 'Volume', 'Pro', 'Fan-style volume lashes', '/images/lash-maps/volume-fan.jpg'),

-- Mega Volume Maps
('Mega Glam', 'Mega Volume', 'Intermediate', 'High volume for glamorous looks', '/images/lash-maps/mega-glam.jpg'),
('Mega Drama', 'Mega Volume', 'Pro', 'Maximum volume for dramatic effects', '/images/lash-maps/mega-drama.jpg'),
('Mega Fan', 'Mega Volume', 'Pro', 'Fan-style mega volume lashes', '/images/lash-maps/mega-fan.jpg'),
('Mega Hybrid', 'Mega Volume', 'Intermediate', 'Mega volume with hybrid techniques', '/images/lash-maps/mega-hybrid.jpg'),

-- Special/Celebrity Styles
('Kim K Glam', 'Special/Celebrity Styles', 'Pro', 'Kim Kardashian inspired glamorous look', '/images/lash-maps/kim-k-glam.jpg'),
('Bella Hadid', 'Special/Celebrity Styles', 'Pro', 'Bella Hadid signature cat-eye effect', '/images/lash-maps/bella-hadid.jpg'),
('Cardi B Bold', 'Special/Celebrity Styles', 'Pro', 'Cardi B inspired bold and dramatic', '/images/lash-maps/cardi-b-bold.jpg'),
('Kylie Jenner', 'Special/Celebrity Styles', 'Intermediate', 'Kylie Jenner signature wispy look', '/images/lash-maps/kylie-jenner.jpg'),
('Red Carpet', 'Special/Celebrity Styles', 'Pro', 'Glamorous red carpet ready lashes', '/images/lash-maps/red-carpet.jpg'),
('Bridal Glam', 'Special/Celebrity Styles', 'Intermediate', 'Perfect for wedding day beauty', '/images/lash-maps/bridal-glam.jpg');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lash_maps TO authenticated;
