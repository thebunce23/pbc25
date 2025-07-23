-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now()
);

-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('Indoor', 'Outdoor')) NOT NULL,
  surface text NOT NULL,
  status text CHECK (status IN ('active', 'maintenance', 'inactive')) NOT NULL,
  description text,
  hourly_rate numeric NOT NULL,
  length numeric,
  width numeric,
  lighting boolean DEFAULT false,
  air_conditioning boolean DEFAULT false,
  accessibility boolean DEFAULT false,
  notes text,
  amenities text[],
  last_maintenance date,
  next_maintenance date,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  court_id uuid REFERENCES courts(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text CHECK (status IN ('confirmed', 'canceled')) NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES users(id),
  registration_date timestamptz DEFAULT now(),
  status text CHECK (status IN ('registered', 'attended', 'cancelled')) NOT NULL DEFAULT 'registered'
);

-- Add Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in read access" ON users
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in read access" ON courts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in users to insert their own bookings" ON bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow logged-in users to view their bookings" ON bookings
  FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in read access" ON events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in users to view their registrations" ON event_registrations
  FOR SELECT
  USING (user_id = auth.uid());

-- Sample Data
INSERT INTO courts (name, type, surface, status, description, hourly_rate, length, width, lighting, air_conditioning, accessibility, amenities)
VALUES 
  ('Court A', 'Indoor', 'Concrete', 'active', 'Main indoor court with excellent lighting', 25, 44, 20, true, true, true, ARRAY['Lighting', 'AC', 'Sound System']),
  ('Court B', 'Indoor', 'Synthetic', 'active', 'Premium synthetic surface court', 30, 44, 20, true, true, false, ARRAY['Lighting', 'AC', 'Premium Surface']),
  ('Court C', 'Outdoor', 'Asphalt', 'maintenance', 'Outdoor court with night lighting', 15, 44, 20, true, false, true, ARRAY['Lighting', 'Wheelchair Accessible']),
  ('Court D', 'Outdoor', 'Sport Court', 'active', 'Premium outdoor court with Sport Court surface', 20, 44, 20, true, false, true, ARRAY['Lighting', 'Premium Surface', 'Wheelchair Accessible']);