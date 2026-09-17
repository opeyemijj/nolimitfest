-- ==============================================================================
-- NO LIMIT FEST - SUPABASE POSTGRESQL PRODUCTION SCHEMA & SEED DATA
-- ==============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ==============================================================================

-- 1. Users & Staff Access
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'GATE_STAFF', -- 'SUPER_ADMIN', 'ORGANIZER', 'GATE_STAFF'
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Site Configuration & Global Brand Settings
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  default_whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  marquee_text TEXT NOT NULL,
  age_limit TEXT NOT NULL,
  socials JSONB NOT NULL DEFAULT '{}',
  organizers JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Festival Tour Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  dates TEXT NOT NULL,
  time TEXT NOT NULL,
  year TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  stages_count INTEGER NOT NULL DEFAULT 1,
  expected_attendance TEXT NOT NULL,
  is_current_edition BOOLEAN NOT NULL DEFAULT false,
  experiences JSONB NOT NULL DEFAULT '[]',
  partners JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ticket Tiers & Hospitality Packages
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'phase', 'group', 'table', 'vvip'
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  capacity INTEGER NOT NULL DEFAULT 100,
  sold_count INTEGER NOT NULL DEFAULT 0,
  pax_per_unit INTEGER NOT NULL DEFAULT 1,
  badge TEXT,
  description TEXT,
  perks JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  popular BOOLEAN NOT NULL DEFAULT false,
  is_vvip BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders & Transactions
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  event_id TEXT NOT NULL REFERENCES events(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT,
  notes TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED'
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Individual Tickets & Pass Registry
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL REFERENCES ticket_tiers(id),
  ticket_code TEXT UNIQUE NOT NULL,
  qr_hash TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'CHECKED_IN', 'CANCELLED'
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Gate Entrance Check-In Audit Logs
CREATE TABLE IF NOT EXISTS check_in_logs (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result TEXT NOT NULL, -- 'SUCCESS', 'DUPLICATE', 'INVALID', 'NOT_FOUND'
  staff_email TEXT NOT NULL,
  device_info TEXT
);

-- 8. Lineup & Artists
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  genre TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT NOT NULL,
  image TEXT NOT NULL,
  bio TEXT NOT NULL,
  stage TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  spotify_url TEXT,
  instagram_url TEXT,
  is_headliner BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Stages
CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  genres JSONB NOT NULL DEFAULT '[]',
  capacity TEXT NOT NULL,
  production JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_tiers_event ON ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS) policies or leave open for server role
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Allow public read for storefront tables
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read ticket_tiers" ON ticket_tiers FOR SELECT USING (true);
CREATE POLICY "Public read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read stages" ON stages FOR SELECT USING (true);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- Allow full access to service_role
CREATE POLICY "Service full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service full access site_config" ON site_config FOR ALL USING (true);
CREATE POLICY "Service full access events" ON events FOR ALL USING (true);
CREATE POLICY "Service full access ticket_tiers" ON ticket_tiers FOR ALL USING (true);
CREATE POLICY "Service full access orders" ON orders FOR ALL USING (true);
CREATE POLICY "Service full access tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Service full access check_in_logs" ON check_in_logs FOR ALL USING (true);
CREATE POLICY "Service full access artists" ON artists FOR ALL USING (true);
CREATE POLICY "Service full access stages" ON stages FOR ALL USING (true);
CREATE POLICY "Service full access faqs" ON faqs FOR ALL USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Default Staff Accounts
-- admin@nolimitfest.com / admin12345!
-- gate@nolimitfest.com / gate12345!
INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES
('usr-admin-01', 'Festival Director', 'admin@nolimitfest.com', '4e58ea5a8d9a4214ba36ce92a34e06bc:8974567e9f3b89b4f971844b2ffb384d7285149d8c368ff66c30f40d68f237194f48b111ec81005b63795b871c50b691bf7df98e27c7562ad8ae63ef6ec3b2a2', 'SUPER_ADMIN', 1),
('usr-gate-01', 'Helipad Gate Staff', 'gate@nolimitfest.com', '98e98341b528a42bfa5cf612bc4f9d01:a07e2c918c5e93345cb5f7f8976f6ea3a58d1976a4dfc0dfeb014c274d8eb34421b93ea06b9b8b7e28df95c8ba761e389df0f4e24ef7806f0e2b96120bcf5e40', 'GATE_STAFF', 1)
ON CONFLICT (id) DO NOTHING;

-- Global Site Config
INSERT INTO site_config (id, name, short_name, tagline, description, default_whatsapp, email, marquee_text, age_limit, socials, organizers) VALUES
('global', 'No Limit Fest', 'NLF', 'Beyond Boundaries', 'The Premier Multi-City Afro-Fusion & Urban Festival. Featuring RUGER Live in Dubai on October 24th, 2026.', '+971 50 688 5946', 'contact@nolimitfest.com', '★ MUSIC, ENERGY, NO LIMIT ★ HEADLINER RUGER LIVE AT HELIPAD BY FROZEN CHERRY DUBAI ★ SATURDAY 24TH OCTOBER 2026 ★ PHASE 0 EARLY BIRD TICKETS SELLING FAST ★ VIP TABLES & SQUAD PASSES AVAILABLE', 'Strictly 21+ (Valid Emirates ID or Passport required)', '{"instagram": "https://instagram.com/nolimitfest", "twitter": "https://twitter.com/nolimitfest"}', '[{"name": "No Limit Entertainment", "role": "Executive Producer", "logo": "/images/logo.png"}]')
ON CONFLICT (id) DO NOTHING;

-- Tour Events
INSERT INTO events (id, slug, name, edition, city, country, flag, region, status, dates, time, year, venue, address, tagline, description, hero_image, stages_count, expected_attendance, is_current_edition) VALUES
('dubai-2026', 'dubai', 'No Limit Fest Dubai', 'Official 1st Edition • Live in Dubai', 'Dubai', 'United Arab Emirates', '🇦🇪', 'Middle East / GCC', 'active', 'Saturday 24th October 2026', '6:00 PM Till Late', '2026', 'Helipad by Frozen Cherry, Dubai', 'Helipad by Frozen Cherry, Dubai, UAE', 'Headliner RUGER Live at Helipad by Frozen Cherry • Saturday 24th Oct • 6PM Till Late', 'No Limit Fest unleashes in Dubai on Saturday, October 24th, 2026 at the breathtaking Helipad by Frozen Cherry! Headlined by global Afrobeats superstar RUGER performing his massive chart-topping hits live.', '/images/artists/ruger.jpg', 2, '5,000+ Exclusive Guests', true),
('doha-2027', 'doha', 'No Limit Fest Doha', '2nd Edition • Live in Qatar', 'Doha', 'Qatar', '🇶🇦', 'Middle East / GCC', 'announced', 'February 2027', '7:00 PM Till Late', '2027', 'Katara Cultural Village', 'Katara Beach, Doha, Qatar', 'The Gulf Rhythm Takes Doha • Winter 2027', 'Experience the sonic energy of urban music and Afrobeats in Qatar.', '/images/events/doha.jpg', 2, '7,500+ Attendees', false),
('oman-2027', 'oman', 'No Limit Fest Muscat', '3rd Edition • Sultanate of Oman', 'Muscat', 'Oman', '🇴🇲', 'Middle East / GCC', 'waitlist', 'April 2027', '6:30 PM Till Late', '2027', 'Oman Convention & Exhibition Centre', 'Madinat Al Irfan, Muscat', 'Mountain Horizons, Ocean Waves & Heavy Bass', 'Muscat opens its dramatic amphitheatre to No Limit Fest.', '/images/events/muscat.jpg', 2, '6,000+ Attendees', false),
('bahrain-2027', 'bahrain', 'No Limit Fest Bahrain', '4th Edition • Island Vibes', 'Manama', 'Bahrain', '🇧🇭', 'Middle East / GCC', 'waitlist', 'May 2027', '7:00 PM Till Late', '2027', 'Marassi Beach, Diyar Al Muharraq', 'Marassi Beach, Manama, Bahrain', 'Island Energy Meets Global Afrobeats Beats', 'Beachside festival stages bringing together Afrobeats and amapiano.', '/images/events/bahrain.jpg', 2, '8,000+ Attendees', false),
('saudi-2027', 'saudi-arabia', 'No Limit Fest Riyadh', '5th Edition • Kingdom Stage', 'Riyadh', 'Saudi Arabia', '🇸🇦', 'Middle East / GCC', 'announced', 'October 2027', '8:00 PM Till Late', '2027', 'Boulevard City Amphitheater', 'Riyadh, Kingdom of Saudi Arabia', 'The Sound of the Next Era', 'A monumental fusion of culture, urban beats, and world-class concert production.', '/images/events/riyadh.jpg', 3, '15,000+ Attendees', false),
('london-2027', 'london', 'No Limit Fest London', 'European Showcase • Summer 2027', 'London', 'United Kingdom', '🇬🇧', 'International', 'waitlist', 'July 2027', '1:00 PM - 10:30 PM', '2027', 'Victoria Park, London', 'Victoria Park, Hackney, London E9', 'The Capital Welcomes the Global Sound', 'London summer open-air festival experience celebrating Afro-fusion culture.', '/images/events/london.jpg', 3, '25,000+ Attendees', false),
('miami-2027', 'miami', 'No Limit Fest Miami', 'US Tour Launch • Art & Sound', 'Miami', 'United States', '🇺🇸', 'International', 'waitlist', 'November 2027', '4:00 PM Till Late', '2027', 'Bayfront Park Amphitheater', '301 Biscayne Blvd, Miami, FL', 'Tropical Rhythms, Ocean Breeze & Afro-Caribbean Energy', 'The American gateway to Afro-fusion and Caribbean soundscapes.', '/images/events/miami.jpg', 2, '18,000+ Attendees', false),
('lagos-2027', 'lagos', 'No Limit Fest Lagos', 'Homecoming Edition • Detty December', 'Lagos', 'Nigeria', '🇳🇬', 'International', 'waitlist', 'December 2027', '5:00 PM Till Sunrise', '2027', 'Eko Atlantic City', 'Victoria Island, Lagos, Nigeria', 'The Origin. The Energy. The Homecoming.', 'The motherland celebration where the global movement originated.', '/images/events/lagos.jpg', 3, '30,000+ Attendees', false),
('tokyo-2028', 'tokyo', 'No Limit Fest Tokyo', 'Asia Premiere • Future Rhythm', 'Tokyo', 'Japan', '🇯🇵', 'International', 'waitlist', 'Spring 2028', '3:00 PM - 10:00 PM', '2028', 'Yoyogi Park Outdoor Stage', 'Shibuya, Tokyo, Japan', 'Where Ancient Tradition Meets Future Bass', 'The boundary-shattering premiere of Afrobeats and Amapiano in Tokyo.', '/images/events/tokyo.jpg', 2, '12,000+ Attendees', false)
ON CONFLICT (id) DO NOTHING;

-- Ticket Tiers for Dubai 2026
INSERT INTO ticket_tiers (id, event_id, name, category, price, currency, capacity, sold_count, pax_per_unit, badge, description, perks, status, popular, is_vvip, sort_order) VALUES
('tier-dxb-early-bird', 'dubai-2026', 'Early Bird', 'phase', 129, 'AED', 500, 48, 1, 'Now Selling • Limited', 'Lowest available entry price for early supporters. Instant access to Helipad festival grounds.', '["Full festival admission", "Access to main stage & Ruger headline set", "Rapid entry turnstiles"]', 'active', true, false, 1),
('tier-dxb-phase-1', 'dubai-2026', 'Phase 1 General Admission', 'phase', 150, 'AED', 800, 0, 1, 'Upcoming', 'First tier general release pass.', '["Full festival admission", "Access to food village & brand activations"]', 'upcoming', false, false, 2),
('tier-dxb-phase-2', 'dubai-2026', 'Phase 2 General Admission', 'phase', 175, 'AED', 1000, 0, 1, 'Upcoming', 'Second tier general release pass.', '["Full festival admission", "Access to food village & brand activations"]', 'upcoming', false, false, 3),
('tier-dxb-squad-4', 'dubai-2026', 'Squad Pack (4 Passes)', 'group', 480, 'AED', 100, 12, 4, 'Save 15%', 'Four General Admission wristbands for you and your crew.', '["4x Full Festival Wristbands", "Fast-track group turnstile entry", "15% discount bundled"]', 'active', true, false, 15),
('tier-dxb-squad-6', 'dubai-2026', 'Squad Pack (6 Passes)', 'group', 690, 'AED', 80, 8, 6, 'Save 20%', 'Six General Admission wristbands for larger groups.', '["6x Full Festival Wristbands", "Fast-track group turnstile entry", "20% discount bundled"]', 'active', false, false, 16),
('tier-dxb-table-6', 'dubai-2026', 'VIP Table for 6', 'table', 2500, 'AED', 20, 5, 6, 'VIP Hospitality', 'Dedicated high-top VIP table with elevated views of the main stage.', '["Dedicated elevated table for 6", "1x Premium Bottle included", "VIP Host & dedicated security"]', 'active', true, false, 30),
('tier-dxb-table-10', 'dubai-2026', 'VIP Cabana for 10', 'vvip', 5000, 'AED', 10, 3, 10, 'Ultra Luxury', 'Private festival cabana right in front of the skyline backdrop.', '["Private luxury cabana for 10", "2x Premium Champagne / Spirits", "Dedicated valet & butler service"]', 'active', false, true, 40)
ON CONFLICT (id) DO NOTHING;

