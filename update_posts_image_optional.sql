-- Make image_url optional for posts (allow text-only posts)

ALTER TABLE public.posts 
ALTER COLUMN image_url DROP NOT NULL;

-- Add comment explaining that image_url is now optional for tips and tutorials
COMMENT ON COLUMN public.posts.image_url IS 'Optional for tips and tutorials, typically required for looks and before-after posts';

