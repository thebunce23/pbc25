-- Create players table manually
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

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Allow authenticated users to view players" ON players
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert players" ON players
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own player profile" ON players
  FOR ALL 
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Insert sample players
INSERT INTO players (first_name, last_name, email, phone, date_of_birth, gender, skill_level, position, status, membership_type, notes)
VALUES 
  ('John', 'Smith', 'john.smith@email.com', '555-0101', '1985-03-15', 'Male', 'Intermediate', 'Right', 'active', 'Regular', 'Aggressive player'),
  ('Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0102', '1990-07-22', 'Female', 'Advanced', 'Left', 'active', 'Premium', 'Great team player'),
  ('Mike', 'Davis', 'mike.davis@email.com', '555-0103', '1978-11-08', 'Male', 'Professional', 'Right', 'active', 'Premium', 'Tournament player'),
  ('Emily', 'Brown', 'emily.brown@email.com', '555-0104', '1992-05-14', 'Female', 'Beginner', 'Right', 'active', 'Regular', 'New to pickleball'),
  ('David', 'Wilson', 'david.wilson@email.com', '555-0105', '1988-09-30', 'Male', 'Intermediate', 'Left', 'active', 'Regular', 'Consistent player'),
  ('Jessica', 'Taylor', 'jessica.taylor@email.com', '555-0106', '1995-12-03', 'Female', 'Advanced', 'Right', 'active', 'Premium', 'Quick reflexes'),
  ('Robert', 'Anderson', 'robert.anderson@email.com', '555-0107', '1982-04-18', 'Male', 'Intermediate', 'Right', 'active', 'Regular', 'Strategic player'),
  ('Lisa', 'Thomas', 'lisa.thomas@email.com', '555-0108', '1987-08-25', 'Female', 'Beginner', 'Left', 'active', 'Regular', 'Learning fast'),
  ('Christopher', 'Jackson', 'chris.jackson@email.com', '555-0109', '1991-01-12', 'Male', 'Advanced', 'Right', 'active', 'Premium', 'Powerful serves'),
  ('Amanda', 'White', 'amanda.white@email.com', '555-0110', '1983-06-07', 'Female', 'Intermediate', 'Left', 'active', 'Regular', 'Good court coverage'),
  ('James', 'Harris', 'james.harris@email.com', '555-0111', '1979-10-16', 'Male', 'Professional', 'Right', 'active', 'Premium', 'Former tennis pro'),
  ('Nicole', 'Martin', 'nicole.martin@email.com', '555-0112', '1994-03-29', 'Female', 'Intermediate', 'Right', 'active', 'Regular', 'Improving rapidly'),
  ('Kevin', 'Thompson', 'kevin.thompson@email.com', '555-0113', '1986-07-04', 'Male', 'Beginner', 'Left', 'active', 'Regular', 'Weekend warrior'),
  ('Rachel', 'Garcia', 'rachel.garcia@email.com', '555-0114', '1989-11-21', 'Female', 'Advanced', 'Right', 'active', 'Premium', 'Excellent positioning'),
  ('Daniel', 'Martinez', 'daniel.martinez@email.com', '555-0115', '1984-02-14', 'Male', 'Intermediate', 'Right', 'active', 'Regular', 'Team captain material'),
  ('Stephanie', 'Robinson', 'stephanie.robinson@email.com', '555-0116', '1993-08-11', 'Female', 'Beginner', 'Left', 'active', 'Regular', 'Enthusiastic learner'),
  ('Mark', 'Clark', 'mark.clark@email.com', '555-0117', '1981-05-26', 'Male', 'Advanced', 'Right', 'active', 'Premium', 'Competitive spirit'),
  ('Jennifer', 'Rodriguez', 'jennifer.rodriguez@email.com', '555-0118', '1990-12-09', 'Female', 'Intermediate', 'Left', 'active', 'Regular', 'Steady and reliable'),
  ('Brian', 'Lewis', 'brian.lewis@email.com', '555-0119', '1987-04-02', 'Male', 'Beginner', 'Right', 'active', 'Regular', 'Former badminton player'),
  ('Ashley', 'Lee', 'ashley.lee@email.com', '555-0120', '1996-09-17', 'Female', 'Advanced', 'Right', 'active', 'Premium', 'Rising star')
ON CONFLICT (email) DO NOTHING;
