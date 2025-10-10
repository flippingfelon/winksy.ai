-- Create calendar_connections table for external calendar integrations
CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'ical', 'square', 'booksy', 'glossgenius', 'other')),
  connection_name TEXT, -- User-friendly name (e.g., "My Square Calendar")
  connection_url TEXT, -- iCal feed URL
  access_token TEXT, -- For OAuth (encrypted in production)
  refresh_token TEXT, -- For OAuth refresh
  calendar_id TEXT, -- External calendar identifier
  sync_direction TEXT DEFAULT 'import_only' CHECK (sync_direction IN ('import_only', 'two_way')),
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_frequency_minutes INTEGER DEFAULT 60, -- How often to auto-sync
  last_sync_status TEXT, -- 'success', 'error', 'pending'
  last_sync_error TEXT, -- Error message if sync failed
  appointments_imported INTEGER DEFAULT 0, -- Count of imported appointments
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_calendar_connections_tech_id ON public.calendar_connections(tech_id);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_active ON public.calendar_connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_calendar_connections_sync ON public.calendar_connections(last_synced_at, is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_calendar_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calendar_connections_updated_at ON public.calendar_connections;
CREATE TRIGGER calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_connections_updated_at();

-- Add source tracking to bookings table (to identify imported appointments)
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS import_source TEXT, -- 'manual', 'google', 'ical', 'square', etc.
  ADD COLUMN IF NOT EXISTS external_event_id TEXT, -- ID from external calendar
  ADD COLUMN IF NOT EXISTS calendar_connection_id UUID REFERENCES public.calendar_connections(id) ON DELETE SET NULL;

-- Add index for external event tracking
CREATE INDEX IF NOT EXISTS idx_bookings_external_event ON public.bookings(external_event_id, calendar_connection_id);
CREATE INDEX IF NOT EXISTS idx_bookings_import_source ON public.bookings(import_source);

-- Enable RLS on calendar_connections
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own calendar connections
DROP POLICY IF EXISTS "Users can view own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can view own calendar connections"
  ON public.calendar_connections FOR SELECT
  USING (auth.uid() = tech_id);

DROP POLICY IF EXISTS "Users can insert own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can insert own calendar connections"
  ON public.calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = tech_id);

DROP POLICY IF EXISTS "Users can update own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can update own calendar connections"
  ON public.calendar_connections FOR UPDATE
  USING (auth.uid() = tech_id);

DROP POLICY IF EXISTS "Users can delete own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can delete own calendar connections"
  ON public.calendar_connections FOR DELETE
  USING (auth.uid() = tech_id);

-- Create a view for active connections that need syncing
CREATE OR REPLACE VIEW public.calendar_connections_needing_sync AS
SELECT 
  c.*,
  EXTRACT(EPOCH FROM (now() - COALESCE(c.last_synced_at, c.created_at))) / 60 AS minutes_since_sync
FROM public.calendar_connections c
WHERE 
  c.is_active = true
  AND (
    c.last_synced_at IS NULL 
    OR (EXTRACT(EPOCH FROM (now() - c.last_synced_at)) / 60) > c.sync_frequency_minutes
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_connections TO authenticated;
GRANT SELECT ON public.calendar_connections_needing_sync TO authenticated;

-- Notification function
NOTIFY pgrst, 'reload schema';

COMMENT ON TABLE public.calendar_connections IS 'Stores connections to external calendar services for importing appointments';
COMMENT ON COLUMN public.bookings.import_source IS 'Source of the appointment: manual, google, ical, square, booksy, glossgenius';
COMMENT ON COLUMN public.bookings.external_event_id IS 'External calendar event ID for syncing';

