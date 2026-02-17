-- ============================================
-- CAPTURE THE MOMENT PHOTO BOOTHS
-- Database Schema v1.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    referral_code VARCHAR(12) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    min_hours INTEGER DEFAULT 2,
    extra_hour_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed services
INSERT INTO services (slug, name, description, base_price, min_hours, extra_hour_price, display_order) VALUES
('stand-alone', 'Stand-Alone Photo Booth', 'Classic photo booth experience with instant digital delivery', 275.00, 2, 100.00, 1),
('360-booth', '360 Booth Experience', 'Premium 360-degree video capture with slow-motion effects', 495.00, 2, 150.00, 2);

-- ============================================
-- ADD-ONS TABLE
-- ============================================
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    price_type VARCHAR(20) DEFAULT 'flat' CHECK (price_type IN ('flat', 'per_hour', 'percentage')),
    compatible_services UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed add-ons
INSERT INTO add_ons (slug, name, description, price, price_type, display_order) VALUES
('premium-branding', 'Premium Branding Package', 'Custom overlay, start screen, and branded sharing page', 125.00, 'flat', 1),
('led-lighting', 'LED Ring Lighting Upgrade', 'Professional studio-quality lighting for flawless results', 75.00, 'flat', 2),
('extra-hour', 'Additional Hour', 'Extend your event coverage', 100.00, 'per_hour', 3),
('corporate-package', 'Corporate Package', 'Branding + dedicated gallery + usage rights', 200.00, 'flat', 4),
('holiday-premium', 'Holiday Premium', 'Peak season surcharge (Nov 15 - Jan 5)', 75.00, 'flat', 5);

-- ============================================
-- TIME_SLOTS TABLE
-- ============================================
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    locked_until TIMESTAMPTZ,
    locked_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, slot_date, start_time)
);

CREATE INDEX idx_time_slots_availability ON time_slots(service_id, slot_date, is_available);
CREATE INDEX idx_time_slots_locked ON time_slots(locked_until) WHERE locked_until IS NOT NULL;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    service_id UUID REFERENCES services(id) NOT NULL,

    -- Event details
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    event_type VARCHAR(100),
    event_name VARCHAR(255),
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_zip VARCHAR(10),

    -- Contact (for guest bookings)
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(255),

    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    extra_hours_price DECIMAL(10,2) DEFAULT 0,
    add_ons_price DECIMAL(10,2) DEFAULT 0,
    travel_fee DECIMAL(10,2) DEFAULT 0,
    travel_miles INTEGER,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_code VARCHAR(50),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_paid_at TIMESTAMPTZ,
    balance_due DECIMAL(10,2),
    balance_paid BOOLEAN DEFAULT FALSE,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN (
        'requested', 'held', 'approved', 'deposit_paid',
        'confirmed', 'completed', 'cancelled', 'expired', 'no_show'
    )),
    hold_expires_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,

    -- Referral tracking
    referral_code_used VARCHAR(12),
    referred_by UUID REFERENCES users(id),

    -- Notes
    client_notes TEXT,
    admin_notes TEXT,
    internal_notes TEXT,

    -- Metadata
    source VARCHAR(50) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_hold_expires ON bookings(hold_expires_at) WHERE status = 'held';
CREATE INDEX idx_bookings_service_date ON bookings(service_id, event_date);

-- Concurrency control: Prevent double-booking
CREATE UNIQUE INDEX idx_bookings_unique_slot
ON bookings(service_id, event_date, start_time)
WHERE status NOT IN ('cancelled', 'expired');

-- ============================================
-- BOOKING_ADD_ONS TABLE
-- ============================================
CREATE TABLE booking_add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_add_ons_booking ON booking_add_ons(booking_id);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) CHECK (payment_type IN ('deposit', 'balance', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded'
    )),
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_link VARCHAR(500),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    referred_booking_id UUID REFERENCES bookings(id),
    referred_user_id UUID REFERENCES users(id),

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'qualified', 'paid', 'expired', 'invalid'
    )),

    -- Payout
    payout_amount DECIMAL(10,2) DEFAULT 50.00,
    payout_method VARCHAR(50),
    payout_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES users(id),

    -- Validation
    qualified_at TIMESTAMPTZ,
    qualification_reason TEXT,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ============================================
-- SMS_LOGS TABLE
-- ============================================
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_body TEXT NOT NULL,
    direction VARCHAR(10) DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
    twilio_sid VARCHAR(50),
    status VARCHAR(20) DEFAULT 'queued',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_booking ON sms_logs(booking_id);
CREATE INDEX idx_sms_logs_type ON sms_logs(message_type);

-- ============================================
-- AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'cron')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'CTM';
    year_part TEXT := TO_CHAR(NOW(), 'YY');
    sequence_num INTEGER;
    booking_num TEXT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(booking_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM bookings
    WHERE booking_number LIKE prefix || year_part || '%';

    booking_num := prefix || year_part || LPAD(sequence_num::TEXT, 4, '0');
    RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Public read access for services and add-ons
CREATE POLICY "services_public_read" ON services
    FOR SELECT USING (true);

CREATE POLICY "add_ons_public_read" ON add_ons
    FOR SELECT USING (true);

-- Users policies
CREATE POLICY "users_read_own" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "bookings_insert_public" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_read_own" ON bookings
    FOR SELECT USING (
        user_id = auth.uid()
        OR contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Referrals policies
CREATE POLICY "referrals_read_own" ON referrals
    FOR SELECT USING (referrer_id = auth.uid());

-- Payments policies
CREATE POLICY "payments_read_own" ON payments
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM bookings
            WHERE user_id = auth.uid()
            OR contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
