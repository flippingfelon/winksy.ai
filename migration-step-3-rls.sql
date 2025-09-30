CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lash techs: Public read, only techs can update their own
CREATE POLICY "Lash techs are viewable by everyone" ON public.lash_techs
  FOR SELECT USING (true);

CREATE POLICY "Techs can update own profile" ON public.lash_techs
  FOR UPDATE USING (auth.uid() = id);

-- Services: Public read, techs can manage their own services
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Techs can manage own services" ON public.services
  FOR ALL USING (auth.uid() = tech_id);

-- Bookings: Users can see their own bookings, techs can see bookings for their services
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Techs can view bookings for their services" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = bookings.service_id
      AND services.tech_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Points: Users can only see their own points
CREATE POLICY "Users can view own points" ON public.points
  FOR SELECT USING (auth.uid() = user_id);

-- User levels: Users can only see their own levels
CREATE POLICY "Users can view own levels" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Public read, users can create reviews for their completed bookings
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Tenants: Public read, only authenticated users can view active tenants
