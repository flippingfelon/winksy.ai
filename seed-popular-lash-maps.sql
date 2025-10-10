-- Seed popular lash maps (excluding Open Eye Natural)
-- This will add the maps requested by the user

-- First, ensure the specifications column supports the new structure
-- The specifications column is already JSONB so it should work

INSERT INTO public.lash_maps (name, category, difficulty, description, specifications) VALUES
-- Natural Doll Eye
('Natural Doll Eye', 'Natural', 'Beginner',
 'Soft, rounded eye shape that enhances natural eye shape with subtle definition',
 '{
   "lengths": {"1": 7, "2": 9, "3": 11, "4": 9, "5": 7},
   "curl_options": "C or CC",
   "diameter": "0.15mm",
   "recommended_products": [
     "Natural Length Lashes",
     "Light Volume Adhesive",
     "Natural Mascara"
   ]
 }'),

-- Everyday Natural
('Everyday Natural', 'Natural', 'Beginner',
 'Perfect for daily wear - subtle enhancement that looks completely natural',
 '{
   "lengths": {"1": 6, "2": 8, "3": 10, "4": 8, "5": 6},
   "curl_options": "B or C",
   "diameter": "0.12mm",
   "recommended_products": [
     "Everyday Natural Lashes",
     "Clear Adhesive",
     "Transparent Mascara"
   ]
 }'),

-- Bold Cat Eye
('Bold Cat Eye', 'Volume', 'Intermediate',
 'Dramatic cat eye effect with defined outer corners for a bold, glamorous look',
 '{
   "lengths": {"1": 8, "2": 10, "3": 12, "4": 14, "5": 12},
   "curl_options": "D or DD",
   "diameter": "0.15mm",
   "recommended_products": [
     "Cat Eye Lashes",
     "Volume Adhesive",
     "Bold Mascara",
     "Eyeliner - Winged"
   ]
 }'),

-- Dramatic Doll
('Dramatic Doll', 'Volume', 'Intermediate',
 'Wide-eyed doll effect with maximum volume and length for special occasions',
 '{
   "lengths": {"1": 9, "2": 12, "3": 15, "4": 12, "5": 9},
   "curl_options": "D or DD",
   "diameter": "0.18mm",
   "recommended_products": [
     "Dramatic Doll Lashes",
     "Strong Hold Adhesive",
     "Volume Mascara",
     "Eyeshadow Primer"
   ]
 }'),

-- Fox Eye Natural
('Fox Eye Natural', 'Special/Celebrity Styles', 'Pro',
 'Iconic fox eye shape that lifts and elongates the outer corners',
 '{
   "lengths": {"1": 7, "2": 9, "3": 11, "4": 13, "5": 11},
   "curl_options": "CC or D",
   "diameter": "0.15mm",
   "recommended_products": [
     "Fox Eye Lashes",
     "Precision Adhesive",
     "Defining Mascara",
     "Brow Pencil"
   ]
 }'),

-- Kim K Glam
('Kim K Glam', 'Special/Celebrity Styles', 'Pro',
 'Kim Kardashian signature look - voluminous, textured, and glamorous',
 '{
   "lengths": {"1": 8, "2": 11, "3": 14, "4": 16, "5": 13},
   "curl_options": "D or DD",
   "diameter": "0.18mm",
   "recommended_products": [
     "Kim K Glam Lashes",
     "Volume Adhesive",
     "Fiber Mascara",
     "Bronzer",
     "Highlighter"
   ]
 }'),

-- Manga/Anime Eye
('Manga/Anime Eye', 'Special/Celebrity Styles', 'Pro',
 'Bold, dramatic eye shape inspired by anime characters with exaggerated features',
 '{
   "lengths": {"1": 10, "2": 14, "3": 18, "4": 20, "5": 16},
   "curl_options": "DD or L",
   "diameter": "0.20mm",
   "recommended_products": [
     "Anime Style Lashes",
     "Heavy Duty Adhesive",
     "Bold Mascara",
     "White Eyeliner",
     "Graphic Eyeliner"
   ]
 }'),

-- Natural Squirrel
('Natural Squirrel', 'Natural', 'Intermediate',
 'Textured, squirrel-like effect that adds dimension while maintaining natural appearance',
 '{
   "lengths": {"1": 7, "2": 9, "3": 11, "4": 9, "5": 7},
   "curl_options": "C or CC",
   "diameter": "0.15mm",
   "recommended_products": [
     "Textured Natural Lashes",
     "Light Volume Adhesive",
     "Natural Mascara",
     "Brow Gel"
   ]
 }')

ON CONFLICT (name) DO NOTHING;

-- Update Natural Soft Cat Eye if it exists to include specifications
UPDATE public.lash_maps
SET specifications = '{
  "lengths": {"1": 8, "2": 10, "3": 12, "4": 14, "5": 10},
  "curl_options": "C or CC",
  "diameter": "0.15mm",
  "recommended_products": [
    "Natural Cat Eye Lashes",
    "Precision Adhesive",
    "Lengthening Mascara"
  ]
}'
WHERE name = 'Natural Soft Cat Eye' AND specifications IS NULL;

-- Verify the data was inserted
SELECT name, category, difficulty, specifications
FROM public.lash_maps
WHERE name IN (
  'Natural Doll Eye',
  'Everyday Natural',
  'Bold Cat Eye',
  'Dramatic Doll',
  'Fox Eye Natural',
  'Kim K Glam',
  'Manga/Anime Eye',
  'Natural Squirrel',
  'Natural Soft Cat Eye'
)
ORDER BY category, difficulty, name;
