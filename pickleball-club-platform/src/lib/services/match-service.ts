import { createServerClient } from '../supabase'

export interface Match {
  id: string
  tenantId: string
  tournamentId?: string
  matchDate: string
  matchTime: string
  courtId?: string
  player1Id: string
  player2Id: string
  score?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  // Joined data
  court?: Court
  player1?: Player
  player2?: Player
  tournament?: Tournament
}

export interface Court {
  id: string
  tenantId: string
  name: string
  location?: string
  surfaceType: 'outdoor' | 'indoor'
  hasLights: boolean
  operatingHours: any
  status: 'active' | 'maintenance' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface Tournament {
  id: string
  tenantId: string
  name: string
  startDate: string
  endDate?: string
  location?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Player {
  id: string
  firstName: string
  lastName: string
  skillLevel?: number
}

export interface CreateMatchData {
  matchDate: string
  matchTime: string
  courtId?: string
  player1Id: string
  player2Id: string
  tournamentId?: string
}

export interface UpdateMatchData {
  matchDate?: string
  matchTime?: string
  courtId?: string
  score?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export class MatchService {
  private supabase = createServerClient()

  // Get all matches for a tenant
  async getMatches(tenantId: string, options?: {
    limit?: number
    offset?: number
    status?: string
    courtId?: string
    playerId?: string
    date?: string
  }): Promise<{ matches: Match[], total: number }> {
    let query = this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('match_date', { ascending: true })
      .order('match_time', { ascending: true })

    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.courtId) {
      query = query.eq('court_id', options.courtId)
    }

    if (options?.playerId) {
      query = query.or(`player1_id.eq.${options.playerId},player2_id.eq.${options.playerId}`)
    }

    if (options?.date) {
      query = query.eq('match_date', options.date)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
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
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `)
      .eq('id', matchId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Create a new match
  async createMatch(tenantId: string, matchData: CreateMatchData): Promise<Match> {
    // Check for conflicts before creating
    const conflicts = await this.checkMatchConflicts(
      tenantId,
      matchData.matchDate,
      matchData.matchTime,
      matchData.courtId,
      [matchData.player1Id, matchData.player2Id]
    )

    if (conflicts.length > 0) {
      throw new Error(`Match conflicts detected: ${conflicts.join(', ')}`)
    }

    const { data, error } = await this.supabase
      .from('matches')
      .insert({
        tenant_id: tenantId,
        match_date: matchData.matchDate,
        match_time: matchData.matchTime,
        court_id: matchData.courtId,
        player1_id: matchData.player1Id,
        player2_id: matchData.player2Id,
        tournament_id: matchData.tournamentId
      })
      .select(`
        *,
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Update a match
  async updateMatch(matchId: string, matchData: UpdateMatchData): Promise<Match> {
    const updateData: any = {}

    if (matchData.matchDate !== undefined) updateData.match_date = matchData.matchDate
    if (matchData.matchTime !== undefined) updateData.match_time = matchData.matchTime
    if (matchData.courtId !== undefined) updateData.court_id = matchData.courtId
    if (matchData.score !== undefined) updateData.score = matchData.score
    if (matchData.status !== undefined) updateData.status = matchData.status

    const { data, error } = await this.supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .select(`
        *,
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `)
      .single()

    if (error) {
      throw error
    }

    return data
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

  // Check for match conflicts (court or player double-booking)
  async checkMatchConflicts(
    tenantId: string,
    matchDate: string,
    matchTime: string,
    courtId?: string,
    playerIds?: string[]
  ): Promise<string[]> {
    const conflicts: string[] = []

    // Check court conflicts
    if (courtId) {
      const { data: courtConflicts } = await this.supabase
        .from('matches')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('match_date', matchDate)
        .eq('match_time', matchTime)
        .eq('court_id', courtId)
        .neq('status', 'cancelled')

      if (courtConflicts && courtConflicts.length > 0) {
        conflicts.push('Court is already booked at this time')
      }
    }

    // Check player conflicts
    if (playerIds && playerIds.length > 0) {
      const { data: playerConflicts } = await this.supabase
        .from('matches')
        .select('player1_id, player2_id')
        .eq('tenant_id', tenantId)
        .eq('match_date', matchDate)
        .eq('match_time', matchTime)
        .neq('status', 'cancelled')

      if (playerConflicts) {
        const bookedPlayerIds = new Set([
          ...playerConflicts.map(m => m.player1_id),
          ...playerConflicts.map(m => m.player2_id)
        ])

        const conflictingPlayers = playerIds.filter(id => bookedPlayerIds.has(id))
        if (conflictingPlayers.length > 0) {
          conflicts.push('One or more players are already scheduled at this time')
        }
      }
    }

    return conflicts
  }

  // Get matches for a specific player
  async getPlayerMatches(tenantId: string, playerId: string, options?: {
    limit?: number
    status?: string
  }): Promise<Match[]> {
    let query = this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `)
      .eq('tenant_id', tenantId)
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .order('match_date', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  }

  // Get upcoming matches
  async getUpcomingMatches(tenantId: string, limit: number = 10): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        court:courts(*),
        player1:players!player1_id(id, first_name, last_name, skill_level),
        player2:players!player2_id(id, first_name, last_name, skill_level),
        tournament:tournaments(*)
      `)
      .eq('tenant_id', tenantId)
      .gte('match_date', today)
      .in('status', ['scheduled', 'in_progress'])
      .order('match_date', { ascending: true })
      .order('match_time', { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  }

  // Get match statistics for a player
  async getPlayerMatchStats(tenantId: string, playerId: string): Promise<{
    total: number
    won: number
    lost: number
    upcoming: number
  }> {
    const { data: allMatches } = await this.supabase
      .from('matches')
      .select('status, score, player1_id, player2_id')
      .eq('tenant_id', tenantId)
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)

    if (!allMatches) {
      return { total: 0, won: 0, lost: 0, upcoming: 0 }
    }

    const stats = {
      total: allMatches.length,
      won: 0,
      lost: 0,
      upcoming: 0
    }

    allMatches.forEach(match => {
      if (match.status === 'scheduled' || match.status === 'in_progress') {
        stats.upcoming++
      } else if (match.status === 'completed' && match.score) {
        // Simple win/loss logic - you can enhance this based on your scoring system
        const isPlayer1 = match.player1_id === playerId
        // This is a simplified example - implement your actual scoring logic
        if (match.score.includes('W') || match.score.includes('win')) {
          if (isPlayer1) stats.won++
          else stats.lost++
        }
      }
    })

    return stats
  }
}

export const matchService = new MatchService()
