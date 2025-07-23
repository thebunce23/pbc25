-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')) DEFAULT 'Beginner',
  position text,
  emergency_contact jsonb DEFAULT '{}',
  address jsonb DEFAULT '{}',
  medical_info text,
  status text CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  membership_type text DEFAULT 'Regular',
  join_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  match_type text CHECK (match_type IN ('Singles', 'Doubles', 'Mixed Doubles', 'Tournament')) DEFAULT 'Doubles',
  skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Mixed')) DEFAULT 'Mixed',
  court_id uuid REFERENCES courts(id),
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer DEFAULT 90,
  status text CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  max_players integer DEFAULT 4,
  current_players integer DEFAULT 0,
  description text,
  notes text,
  score jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create match_participants table
CREATE TABLE IF NOT EXISTS match_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  team text CHECK (team IN ('A', 'B')) DEFAULT 'A',
  status text CHECK (status IN ('registered', 'confirmed', 'cancelled', 'no_show')) DEFAULT 'registered',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(match_id, player_id)
);

-- Update events table with more comprehensive fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type text CHECK (event_type IN ('Tournament', 'League', 'Social', 'Training', 'Maintenance', 'Special')) DEFAULT 'Social';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS skill_level text CHECK (skill_level IN ('All', 'Beginner', 'Intermediate', 'Advanced')) DEFAULT 'All';
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS current_participants integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS entry_fee numeric DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requirements text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS prizes text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft';
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS court_ids uuid[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view players" ON players
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own player profile" ON players
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view matches" ON matches
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Match creators can update their matches" ON matches
  FOR UPDATE 
  USING (auth.uid() = created_by);

ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view match participants" ON match_participants
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join/leave matches" ON match_participants
  FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM players WHERE id = player_id));

-- Update event registration policies
CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their event registrations" ON event_registrations
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
INSERT INTO players (first_name, last_name, email, phone, skill_level, status, membership_type)
VALUES 
  ('John', 'Doe', 'john.doe@example.com', '(555) 123-4567', 'Intermediate', 'active', 'Premium'),
  ('Jane', 'Smith', 'jane.smith@example.com', '(555) 234-5678', 'Advanced', 'active', 'Regular'),
  ('Mike', 'Johnson', 'mike.johnson@example.com', '(555) 345-6789', 'Beginner', 'active', 'Regular'),
  ('Sarah', 'Wilson', 'sarah.wilson@example.com', '(555) 456-7890', 'Intermediate', 'active', 'Premium')
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO events (name, event_type, start_date, end_date, description, location, skill_level, max_participants, entry_fee, status, organizer)
VALUES 
  ('Summer Tournament', 'Tournament', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '32 days', 'Annual summer pickleball tournament for all skill levels', 'Main Courts', 'All', 32, 25.00, 'registration_open', 'Club Management'),
  ('Beginner Training Session', 'Training', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'Training session for new players', 'Court A', 'Beginner', 8, 0, 'registration_open', 'Coach Smith'),
  ('Friday Night Social', 'Social', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'Weekly social games and fun', 'All Courts', 'All', 20, 0, 'registration_open', 'Social Committee')
ON CONFLICT DO NOTHING;

-- Insert sample matches
INSERT INTO matches (title, match_type, skill_level, court_id, date, time, description, created_by)
SELECT 
  'Doubles Match - ' || courts.name,
  'Doubles',
  'Mixed',
  courts.id,
  CURRENT_DATE + INTERVAL '3 days',
  '18:00',
  'Casual doubles game on ' || courts.name,
  (SELECT id FROM auth.users LIMIT 1)
FROM courts 
WHERE courts.status = 'active'
LIMIT 2
ON CONFLICT DO NOTHING;
