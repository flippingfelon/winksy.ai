-- Update bookings table for appointment management system

-- Add new columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lash_map_id UUID REFERENCES public.lash_maps(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_lash_map_id_idx ON public.bookings(lash_map_id);
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_reminder_sent_idx ON public.bookings(reminder_sent);

-- Add check constraint for status
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- Update RLS policies for bookings (techs can manage their own appointments)
DROP POLICY IF EXISTS "Techs can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can delete their own bookings" ON public.bookings;

CREATE POLICY "Techs can view their own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = tech_id OR auth.uid() = user_id
  );

CREATE POLICY "Techs can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() = tech_id
  );

CREATE POLICY "Techs can update their own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = tech_id
  );

CREATE POLICY "Techs can delete their own bookings" ON public.bookings
  FOR DELETE USING (
    auth.uid() = tech_id
  );

-- Create function to automatically update completed_at when status changes
CREATE OR REPLACE FUNCTION update_booking_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = timezone('utc'::text, now());
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = timezone('utc'::text, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_completion_trigger ON public.bookings;

CREATE TRIGGER booking_completion_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW 
EXECUTE FUNCTION update_booking_completion();

-- Create view for upcoming appointments needing reminders
CREATE OR REPLACE VIEW upcoming_appointments_for_reminders AS
SELECT 
  b.*,
  p.full_name as client_name,
  p.email as client_email,
  c.phone as client_phone
FROM public.bookings b
LEFT JOIN public.profiles p ON b.user_id = p.id
LEFT JOIN public.clients c ON b.client_id = c.id
WHERE 
  b.status IN ('pending', 'confirmed')
  AND b.reminder_sent = false
  AND b.booking_date >= CURRENT_DATE
  AND b.booking_date <= CURRENT_DATE + INTERVAL '2 days';

