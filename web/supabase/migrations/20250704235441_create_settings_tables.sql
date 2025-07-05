-- Create club_settings table for club configuration
CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Pickleball Club',
  description text,
  country text DEFAULT 'US',
  address jsonb DEFAULT '{}',
  phone text,
  email text,
  website text,
  timezone text DEFAULT 'America/New_York',
  currency text DEFAULT 'USD',
  date_format text DEFAULT 'MM/dd/yyyy',
  time_format text DEFAULT '12h',
  operating_hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  match_reminders boolean DEFAULT true,
  event_announcements boolean DEFAULT true,
  maintenance_alerts boolean DEFAULT true,
  weekly_digest boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_advance_days integer DEFAULT 14,
  max_bookings_per_user integer DEFAULT 3,
  cancellation_hours integer DEFAULT 24,
  match_duration_minutes integer DEFAULT 90,
  court_maintenance_buffer integer DEFAULT 15,
  auto_release_minutes integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table for individual user settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read club settings" ON club_settings
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update club settings" ON club_settings
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notification settings" ON notification_settings
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read system settings" ON system_settings
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update system settings" ON system_settings
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL 
  USING (auth.uid() = user_id);

-- Insert default club settings
INSERT INTO club_settings (name, description, country, address, phone, email, website, timezone, operating_hours)
VALUES (
  'Sunshine Pickleball Club',
  'A friendly community pickleball club welcoming players of all skill levels.',
  'US',
  '{"street": "123 Recreation Way", "city": "Sunny City", "state": "California", "zipCode": "90210"}',
  '(555) 123-4567',
  'info@sunshinepcb.com',
  'https://sunshinepcb.com',
  'America/Los_Angeles',
  '{
    "monday": {"open": "06:00", "close": "22:00", "closed": false},
    "tuesday": {"open": "06:00", "close": "22:00", "closed": false},
    "wednesday": {"open": "06:00", "close": "22:00", "closed": false},
    "thursday": {"open": "06:00", "close": "22:00", "closed": false},
    "friday": {"open": "06:00", "close": "22:00", "closed": false},
    "saturday": {"open": "07:00", "close": "20:00", "closed": false},
    "sunday": {"open": "08:00", "close": "18:00", "closed": false}
  }'
)
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (booking_advance_days, max_bookings_per_user, cancellation_hours, match_duration_minutes, court_maintenance_buffer, auto_release_minutes)
VALUES (14, 3, 24, 90, 15, 10)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_club_settings_updated_at BEFORE UPDATE ON club_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
