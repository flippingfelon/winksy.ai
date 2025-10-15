-- Make service_id nullable in bookings table
-- This allows appointments without a specific service selected

ALTER TABLE public.bookings 
ALTER COLUMN service_id DROP NOT NULL;

-- Also update the foreign key constraint to be more flexible
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

-- Add it back as nullable
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES public.services(id) 
ON DELETE SET NULL;


