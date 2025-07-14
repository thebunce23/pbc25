// Core Team Types
export type TeamId = string; // e.g. 'A', 'B', 'C', 'D', etc.

// Player Types
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  firstName?: string;
  lastName?: string;
  skill_level: string | number;
  email?: string;
}

// Participant Types
export interface Participant {
  id: string;
  player: Player;
  team: TeamId;
  status?: string;
  player_id?: string;
  match_id?: string;
  joined_at?: string;
}

// Match Participant (for service layer)
export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  team: TeamId;
  status: 'registered' | 'confirmed' | 'cancelled' | 'no_show';
  joined_at: string;
  player?: Player;
}

// Team Structure
export interface Team {
  id: TeamId;
  players: Player[];
  displayName: string;
}

// Updated FormattedTeams interface for multiple teams
export interface FormattedTeams {
  teams: { [key: TeamId]: Team };
  isDoublesMatch: boolean;
  teamCount: number;
}

// Winner/Results Types
export interface WinnerResult {
  winnerTeam: TeamId;
  loserTeam: TeamId;
  winnerPlayers: Player[];
  loserPlayers: Player[];
}

// Generated Participant for match creation
export interface GeneratedParticipant {
  playerId: string;
  team: TeamId;
}

// Match Template for generation
export interface MatchTemplate {
  id: string;
  title: string;
  match_type: string;
  skill_level: string;
  court_id: string;
  date: string;
  time: string;
  duration_minutes: number;
  max_players: number;
  description: string;
  notes: string;
  participants: GeneratedParticipant[];
}

// Court Types
export interface Court {
  id: string;
  name: string;
  type: string;
  status: string;
}

// Match Types
export interface Match {
  id: string;
  title: string;
  match_type: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament';
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  court_id?: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  max_players: number;
  current_players: number;
  description?: string;
  notes?: string;
  score: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  court?: Court;
  participants?: MatchParticipant[];
  winner?: TeamId | null;
  tournament?: { id: string; name: string } | null;
}

// Create Match Data
export interface CreateMatchData {
  title: string;
  match_type?: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament';
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  court_id?: string;
  date: string;
  time: string;
  duration_minutes?: number;
  max_players?: number;
  description?: string;
  notes?: string;
  participants?: Array<{ player_id: string; team: TeamId }>;
}

// Update Match Data
export interface UpdateMatchData {
  title?: string;
  match_type?: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament';
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  court_id?: string;
  date?: string;
  time?: string;
  duration_minutes?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  max_players?: number;
  description?: string;
  notes?: string;
  score?: any;
}

// Match Filters
export interface MatchFilters {
  status?: string;
  court_id?: string;
  player_id?: string;
  date?: string;
  skill_level?: string;
  match_type?: string;
}

// Default team IDs for backward compatibility
export const DEFAULT_TEAMS: TeamId[] = ['A', 'B'];
export const DEFAULT_TEAM_A: TeamId = 'A';
export const DEFAULT_TEAM_B: TeamId = 'B';

// Helper type guards
export const isValidTeamId = (teamId: any): teamId is TeamId => {
  return typeof teamId === 'string' && teamId.length > 0;
};

export const isDefaultTeam = (teamId: TeamId): boolean => {
  return DEFAULT_TEAMS.includes(teamId);
};
