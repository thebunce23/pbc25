import { createClient } from '../supabase'

export interface Match {
  id: string
  title: string
  match_type: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament'
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed'
  court_id?: string
  date: string
  time: string
  duration_minutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  max_players: number
  current_players: number
  description?: string
  notes?: string
  score: any
  created_by?: string
  created_at: string
  updated_at: string
  // Joined data
  court?: Court
  participants?: MatchParticipant[]
}

export interface MatchParticipant {
  id: string
  match_id: string
  player_id: string
  team: 'A' | 'B'
  status: 'registered' | 'confirmed' | 'cancelled' | 'no_show'
  joined_at: string
  player?: Player
}

export interface Court {
  id: string
  name: string
  type: string
  status: string
}

export interface Player {
  id: string
  first_name: string
  last_name: string
  skill_level: string
  email: string
}

export interface CreateMatchData {
  title: string
  match_type?: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament'
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed'
  court_id?: string
  date: string
  time: string
  duration_minutes?: number
  max_players?: number
  description?: string
  notes?: string
}

export interface UpdateMatchData {
  title?: string
  match_type?: 'Singles' | 'Doubles' | 'Mixed Doubles' | 'Tournament'
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed'
  court_id?: string
  date?: string
  time?: string
  duration_minutes?: number
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  max_players?: number
  description?: string
  notes?: string
  score?: any
}

export interface MatchFilters {
  status?: string
  court_id?: string
  player_id?: string
  date?: string
  skill_level?: string
  match_type?: string
}

export class MatchService {
  private supabase = createClient()

  // Get all matches with optional filters
  async getMatches(filters?: MatchFilters): Promise<{ matches: Match[], total: number }> {
    let query = this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(id, name, type, status),
        match_participants(
          id,
          team,
          status,
          player:players(id, first_name, last_name, skill_level, email)
        )
      `, { count: 'exact' })
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.court_id) {
      query = query.eq('court_id', filters.court_id)
    }

    if (filters?.date) {
      query = query.eq('date', filters.date)
    }

    if (filters?.skill_level) {
      query = query.eq('skill_level', filters.skill_level)
    }

    if (filters?.match_type) {
      query = query.eq('match_type', filters.match_type)
    }

    if (filters?.player_id) {
      // Filter matches where the player is a participant
      query = query.filter('match_participants.player_id', 'eq', filters.player_id)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      matches: data || [],
      total: count || 0
    }
  }

  // Get a single match by ID
  async getMatch(matchId: string): Promise<Match | null> {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(id, name, type, status),
        match_participants(
          id,
          team,
          status,
          player:players(id, first_name, last_name, skill_level, email)
        )
      `)
      .eq('id', matchId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return {
      ...data,
      participants: data.match_participants || [],
      current_players: data.match_participants?.length || 0
    }
  }

  // Create a new match
  async createMatch(matchData: CreateMatchData): Promise<Match> {
    const insertData = {
      title: matchData.title,
      match_type: matchData.match_type || 'Doubles',
      skill_level: matchData.skill_level || 'Mixed',
      court_id: matchData.court_id,
      date: matchData.date,
      time: matchData.time,
      duration_minutes: matchData.duration_minutes || 90,
      max_players: matchData.max_players || 4,
      description: matchData.description,
      notes: matchData.notes,
      status: 'scheduled',
      current_players: 0
    }

    const { data, error } = await this.supabase
      .from('matches')
      .insert(insertData)
      .select(`
        *,
        court:courts(id, name, type, status)
      `)
      .single()

    if (error) {
      throw error
    }

    return {
      ...data,
      participants: [],
      current_players: 0
    }
  }

  // Update a match
  async updateMatch(matchId: string, matchData: UpdateMatchData): Promise<Match> {
    const updateData: any = {}

    if (matchData.title !== undefined) updateData.title = matchData.title
    if (matchData.match_type !== undefined) updateData.match_type = matchData.match_type
    if (matchData.skill_level !== undefined) updateData.skill_level = matchData.skill_level
    if (matchData.court_id !== undefined) updateData.court_id = matchData.court_id
    if (matchData.date !== undefined) updateData.date = matchData.date
    if (matchData.time !== undefined) updateData.time = matchData.time
    if (matchData.duration_minutes !== undefined) updateData.duration_minutes = matchData.duration_minutes
    if (matchData.max_players !== undefined) updateData.max_players = matchData.max_players
    if (matchData.description !== undefined) updateData.description = matchData.description
    if (matchData.notes !== undefined) updateData.notes = matchData.notes
    if (matchData.score !== undefined) updateData.score = matchData.score
    if (matchData.status !== undefined) updateData.status = matchData.status

    const { data, error } = await this.supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .select(`
        *,
        court:courts(id, name, type, status),
        match_participants(
          id,
          team,
          status,
          player:players(id, first_name, last_name, skill_level, email)
        )
      `)
      .single()

    if (error) {
      throw error
    }

    return {
      ...data,
      participants: data.match_participants || [],
      current_players: data.match_participants?.length || 0
    }
  }

  // Delete a match
  async deleteMatch(matchId: string): Promise<void> {
    const { error } = await this.supabase
      .from('matches')
      .delete()
      .eq('id', matchId)

    if (error) {
      throw error
    }
  }

  // Add a player to a match
  async addPlayerToMatch(matchId: string, playerId: string, team: 'A' | 'B'): Promise<MatchParticipant> {
    // First check if match is full
    const match = await this.getMatch(matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    if (match.current_players >= match.max_players) {
      throw new Error('Match is full')
    }

    // Check if player is already in the match
    const existingParticipant = match.participants?.find(p => p.player_id === playerId)
    if (existingParticipant) {
      throw new Error('Player is already in this match')
    }

    const { data, error } = await this.supabase
      .from('match_participants')
      .insert({
        match_id: matchId,
        player_id: playerId,
        team: team,
        status: 'registered'
      })
      .select(`
        *,
        player:players(id, first_name, last_name, skill_level, email)
      `)
      .single()

    if (error) {
      throw error
    }

    // Update match current_players count
    await this.supabase
      .from('matches')
      .update({ current_players: match.current_players + 1 })
      .eq('id', matchId)

    return data
  }

  // Remove a player from a match
  async removePlayerFromMatch(matchId: string, playerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('match_participants')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', playerId)

    if (error) {
      throw error
    }

    // Update match current_players count
    const match = await this.getMatch(matchId)
    if (match) {
      await this.supabase
        .from('matches')
        .update({ current_players: Math.max(0, match.current_players - 1) })
        .eq('id', matchId)
    }
  }

  // Get upcoming matches
  async getUpcomingMatches(limit: number = 10): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(id, name, type, status),
        match_participants(
          id,
          team,
          status,
          player:players(id, first_name, last_name, skill_level, email)
        )
      `)
      .or(`date.gt.${today},and(date.eq.${today},time.gte.${now})`)
      .in('status', ['scheduled', 'in_progress'])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data || []).map(match => ({
      ...match,
      participants: match.match_participants || [],
      current_players: match.match_participants?.length || 0
    }))
  }

  // Get matches for a specific date
  async getMatchesForDate(date: string): Promise<Match[]> {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(id, name, type, status),
        match_participants(
          id,
          team,
          status,
          player:players(id, first_name, last_name, skill_level, email)
        )
      `)
      .eq('date', date)
      .order('time', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []).map(match => ({
      ...match,
      participants: match.match_participants || [],
      current_players: match.match_participants?.length || 0
    }))
  }

  // Check for court conflicts
  async checkCourtConflict(date: string, time: string, courtId: string, excludeMatchId?: string): Promise<boolean> {
    let query = this.supabase
      .from('matches')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .eq('court_id', courtId)
      .neq('status', 'cancelled')

    if (excludeMatchId) {
      query = query.neq('id', excludeMatchId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return (data || []).length > 0
  }
}

export const matchService = new MatchService()
