-- Capture The Moment - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE booking_status AS ENUM (
  'requested',
  'held',
  'approved',
  'deposit_paid',
  'confirmed',
  'completed',
  'cancelled',
  'expired',
  'no_show'
);

CREATE TYPE user_role AS ENUM ('client', 'admin');

CREATE TYPE price_type AS ENUM ('flat', 'per_hour', 'percentage');

CREATE TYPE payment_type AS ENUM ('deposit', 'balance', 'refund');

CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

CREATE TYPE referral_status AS ENUM ('pending', 'qualified', 'paid', 'expired', 'invalid');

CREATE TYPE sms_direction AS ENUM ('outbound', 'inbound');

CREATE TYPE actor_type AS ENUM ('user', 'system', 'cron');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  company_name TEXT,
  role user_role DEFAULT 'client',
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  min_hours INTEGER DEFAULT 2,
  extra_hour_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-ons table
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_type price_type DEFAULT 'flat',
  compatible_services TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  event_type TEXT,
  event_name TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_zip TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  company_name TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  extra_hours_price DECIMAL(10,2) DEFAULT 0,
  add_ons_price DECIMAL(10,2) DEFAULT 0,
  travel_fee DECIMAL(10,2) DEFAULT 0,
  travel_miles INTEGER,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,
  balance_due DECIMAL(10,2),
  balance_paid BOOLEAN DEFAULT false,
  status booking_status DEFAULT 'requested',
  hold_expires_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  referral_code_used TEXT,
  referred_by UUID REFERENCES users(id),
  client_notes TEXT,
  admin_notes TEXT,
  internal_notes TEXT,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking add-ons junction table
CREATE TABLE booking_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES add_ons(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time slots table
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  locked_until TIMESTAMPTZ,
  locked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_type payment_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_charge_id TEXT,
  payment_link TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referral_code TEXT NOT NULL,
  referred_booking_id UUID REFERENCES bookings(id),
  referred_user_id UUID REFERENCES users(id),
  status referral_status DEFAULT 'pending',
  payout_amount DECIMAL(10,2) DEFAULT 0,
  payout_method TEXT,
  payout_reference TEXT,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES users(id),
  qualified_at TIMESTAMPTZ,
  qualification_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS logs table
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction sms_direction DEFAULT 'outbound',
  twilio_sid TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_type actor_type DEFAULT 'user',
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_booking_add_ons_booking_id ON booking_add_ons(booking_id);
CREATE INDEX idx_time_slots_date_service ON time_slots(slot_date, service_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_sms_logs_booking_id ON sms_logs(booking_id);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'CTM-' || TO_CHAR(NOW(), 'YYMMDD') || '-' ||
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- ============================================
-- SEED DATA: Services
-- ============================================

INSERT INTO services (slug, name, description, base_price, min_hours, extra_hour_price, display_order) VALUES
  ('stand-alone', 'Stand-Alone Photo Booth', 'Classic photo booth experience with instant prints, digital copies, and customizable backdrops.', 450.00, 2, 150.00, 1),
  ('360-booth', '360 Video Booth', 'Immersive 360-degree video experience that captures every angle. Perfect for creating viral social media content.', 550.00, 2, 175.00, 2);

-- ============================================
-- SEED DATA: Add-ons
-- ============================================

INSERT INTO add_ons (slug, name, description, price, price_type, compatible_services, display_order) VALUES
  ('custom-backdrop', 'Custom Backdrop', 'Personalized backdrop with your event theme, logo, or design.', 150.00, 'flat', ARRAY['stand-alone', '360-booth'], 1),
  ('guest-book', 'Physical Guest Book', 'Beautiful keepsake album with prints and handwritten messages from your guests.', 75.00, 'flat', ARRAY['stand-alone'], 2),
  ('social-sharing', 'Social Media Station', 'Instant sharing to Instagram, TikTok, and email directly from the booth.', 100.00, 'flat', ARRAY['stand-alone', '360-booth'], 3),
  ('props-package', 'Premium Props Package', 'Upgraded selection of themed props, signs, and accessories.', 50.00, 'flat', ARRAY['stand-alone', '360-booth'], 4),
  ('attendant', 'Dedicated Attendant', 'Professional booth attendant to assist guests and ensure smooth operation.', 75.00, 'per_hour', ARRAY['stand-alone', '360-booth'], 5),
  ('extra-prints', 'Unlimited Prints', 'Unlimited photo prints for all guests (standard is 2 strips per session).', 125.00, 'flat', ARRAY['stand-alone'], 6),
  ('slow-motion', 'Slow Motion Mode', 'Add dramatic slow-motion effects to your 360 videos.', 75.00, 'flat', ARRAY['360-booth'], 7),
  ('led-platform', 'LED Light Platform', 'Elevated platform with customizable LED lighting effects.', 200.00, 'flat', ARRAY['360-booth'], 8);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to services and add-ons
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active add-ons" ON add_ons
  FOR SELECT USING (is_active = true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid() OR contact_email = auth.email());

-- Users can create bookings
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Users can view their booking add-ons
CREATE POLICY "Users can view own booking add-ons" ON booking_add_ons
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR contact_email = auth.email()
    )
  );

-- Public can view available time slots
CREATE POLICY "Public can view time slots" ON time_slots
  FOR SELECT USING (true);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR contact_email = auth.email()
    )
  );

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());
