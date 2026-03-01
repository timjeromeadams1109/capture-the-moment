-- Capture The Moment - Admin RLS Policies
-- Run this AFTER schema.sql in Supabase SQL Editor

-- ============================================
-- ADMIN HELPER FUNCTION
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN POLICIES
-- ============================================

-- Users: Admin can do everything
CREATE POLICY "Admin full access to users" ON users
  FOR ALL USING (is_admin());

-- Services: Admin can manage all services
CREATE POLICY "Admin full access to services" ON services
  FOR ALL USING (is_admin());

-- Add-ons: Admin can manage all add-ons
CREATE POLICY "Admin full access to add-ons" ON add_ons
  FOR ALL USING (is_admin());

-- Bookings: Admin can do everything
CREATE POLICY "Admin full access to bookings" ON bookings
  FOR ALL USING (is_admin());

-- Booking add-ons: Admin can do everything
CREATE POLICY "Admin full access to booking add-ons" ON booking_add_ons
  FOR ALL USING (is_admin());

-- Time slots: Admin can manage all time slots
CREATE POLICY "Admin full access to time slots" ON time_slots
  FOR ALL USING (is_admin());

-- Payments: Admin can do everything
CREATE POLICY "Admin full access to payments" ON payments
  FOR ALL USING (is_admin());

-- Referrals: Admin can do everything
CREATE POLICY "Admin full access to referrals" ON referrals
  FOR ALL USING (is_admin());

-- SMS logs: Admin can do everything
CREATE POLICY "Admin full access to sms logs" ON sms_logs
  FOR ALL USING (is_admin());

-- Audit logs: Admin can view all, system can insert
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SERVICE ROLE BYPASS
-- Note: Service role key bypasses RLS by default
-- These policies ensure the admin client works correctly
-- ============================================
