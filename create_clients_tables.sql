-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_id UUID NOT NULL REFERENCES public.lash_techs(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  last_appointment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_appointments table
CREATE TABLE IF NOT EXISTS public.client_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  lash_map_id UUID REFERENCES public.lash_maps(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  curl_used TEXT,
  diameter_used TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_tech_id ON public.clients(tech_id);
CREATE INDEX IF NOT EXISTS idx_clients_last_appointment ON public.clients(last_appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_appointments_client_id ON public.client_appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_appointments_date ON public.client_appointments(appointment_date DESC);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Techs can view their own clients"
  ON public.clients FOR SELECT
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can update their own clients"
  ON public.clients FOR UPDATE
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Techs can delete their own clients"
  ON public.clients FOR DELETE
  USING (tech_id IN (
    SELECT id FROM public.lash_techs 
    WHERE id = auth.uid()
  ));

-- RLS Policies for client_appointments table
CREATE POLICY "Techs can view appointments for their clients"
  ON public.client_appointments FOR SELECT
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE tech_id IN (
      SELECT id FROM public.lash_techs 
      WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Techs can insert appointments for their clients"
  ON public.client_appointments FOR INSERT
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients 
    WHERE tech_id IN (
      SELECT id FROM public.lash_techs 
      WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Techs can update appointments for their clients"
  ON public.client_appointments FOR UPDATE
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE tech_id IN (
      SELECT id FROM public.lash_techs 
      WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Techs can delete appointments for their clients"
  ON public.client_appointments FOR DELETE
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE tech_id IN (
      SELECT id FROM public.lash_techs 
      WHERE id = auth.uid()
    )
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_appointments_updated_at
  BEFORE UPDATE ON public.client_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update last_appointment_date on clients table
CREATE OR REPLACE FUNCTION update_client_last_appointment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients
  SET last_appointment_date = NEW.appointment_date
  WHERE id = NEW.client_id
    AND (last_appointment_date IS NULL OR last_appointment_date < NEW.appointment_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_appointment_trigger
  AFTER INSERT OR UPDATE ON public.client_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_last_appointment();

