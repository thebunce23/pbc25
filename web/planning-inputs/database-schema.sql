-- Create tenants table
CREATE TABLE tenants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    subdomain text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create roles table
CREATE TABLE roles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hashed_password text,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create index for tenants on subdomain
CREATE INDEX ON tenants(subdomain);

-- Create RLS policies for data isolation
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Policy for tenants
CREATE POLICY "allow tenant member access" ON tenants
    USING (auth.uid() = id);

-- Policy for users
CREATE POLICY "allow tenant user access" ON users
    USING (tenant_id = auth.tenant_id());

-- Policy for roles
CREATE POLICY "allow tenant role access" ON roles
    USING (tenant_id = auth.tenant_id());

-- Create players table
CREATE TABLE players (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    emergency_contact_name text,
    emergency_contact_phone text,
    skill_level decimal(2,1) CHECK (skill_level >= 1.0 AND skill_level <= 5.0),
    preferred_playing_times text[],
    health_conditions text,
    profile_picture_url text,
    membership_status text DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'suspended', 'trial')),
    waiver_signed boolean DEFAULT false,
    waiver_signed_date timestamp with time zone,
    date_joined timestamp with time zone DEFAULT current_timestamp,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Create player statistics table
CREATE TABLE player_statistics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    matches_played integer DEFAULT 0,
    matches_won integer DEFAULT 0,
    matches_lost integer DEFAULT 0,
    total_points_scored integer DEFAULT 0,
    total_points_against integer DEFAULT 0,
    current_rating decimal(3,1),
    peak_rating decimal(3,1),
    rating_history jsonb DEFAULT '[]',
    last_played timestamp with time zone,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Create partner preferences table
CREATE TABLE partner_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    preferred_partner_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    preference_type text DEFAULT 'preferred' CHECK (preference_type IN ('preferred', 'avoided')),
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create indexes for players
CREATE INDEX ON players(tenant_id);
CREATE INDEX ON players(email);
CREATE INDEX ON players(membership_status);
CREATE INDEX ON players(skill_level);
CREATE INDEX ON player_statistics(player_id);
CREATE INDEX ON partner_preferences(player_id);

-- Enable RLS for player tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for players
CREATE POLICY "allow tenant player access" ON players
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "allow tenant player statistics access" ON player_statistics
    USING (player_id IN (SELECT id FROM players WHERE tenant_id = auth.tenant_id()));

CREATE POLICY "allow tenant partner preferences access" ON partner_preferences
    USING (player_id IN (SELECT id FROM players WHERE tenant_id = auth.tenant_id()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_timestamp;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create courts table
CREATE TABLE courts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    location text,
    surface_type text DEFAULT 'outdoor' CHECK (surface_type IN ('outdoor', 'indoor')),
    has_lights boolean DEFAULT false,
    operating_hours jsonb DEFAULT '{}',
    status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'closed')),
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Enable RLS for courts
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Policies for courts
CREATE POLICY "allow tenant court access" ON courts
    USING (tenant_id = auth.tenant_id());

-- Create indexes for courts
CREATE INDEX ON courts(tenant_id);
CREATE INDEX ON courts(status);

-- Triggers for courts updated_at
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create matches table
CREATE TABLE matches (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
    match_date date NOT NULL,
    match_time time NOT NULL,
    court_id uuid REFERENCES courts(id) ON DELETE SET NULL,
    player1_id uuid REFERENCES players(id) ON DELETE CASCADE,
    player2_id uuid REFERENCES players(id) ON DELETE CASCADE,
    score text,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Create tournaments table
CREATE TABLE tournaments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    location text,
    description text,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Enable RLS for matches and tournaments
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policies for matches
CREATE POLICY "allow tenant match access" ON matches
    USING (tenant_id = auth.tenant_id());

-- Policies for tournaments
CREATE POLICY "allow tenant tournament access" ON tournaments
    USING (tenant_id = auth.tenant_id());

-- Triggers for updated_at
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();