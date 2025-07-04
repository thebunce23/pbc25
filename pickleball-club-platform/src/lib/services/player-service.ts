import { createServerClient } from '../supabase'

export interface Player {
  id: string
  tenantId: string
  userId?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  skillLevel?: number
  preferredPlayingTimes?: string[]
  healthConditions?: string
  profilePictureUrl?: string
  membershipStatus: 'active' | 'inactive' | 'suspended' | 'trial'
  waiverSigned: boolean
  waiverSignedDate?: string
  dateJoined: string
  createdAt: string
  updatedAt: string
}

export interface PlayerStatistics {
  id: string
  playerId: string
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  totalPointsScored: number
  totalPointsAgainst: number
  currentRating?: number
  peakRating?: number
  ratingHistory: any[]
  lastPlayed?: string
}

export interface CreatePlayerData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  skillLevel?: number
  preferredPlayingTimes?: string[]
  healthConditions?: string
  membershipStatus?: 'active' | 'inactive' | 'suspended' | 'trial'
}

export class PlayerService {
  private supabase = createServerClient()

  // Get all players for a tenant
  async getPlayers(tenantId: string, options?: {
    limit?: number
    offset?: number
    search?: string
    membershipStatus?: string
    skillLevel?: number
  }): Promise<{ players: Player[], total: number }> {
    let query = this.supabase
      .from('players')
      .select('*, player_statistics(*)', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (options?.search) {
      query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
    }

    if (options?.membershipStatus) {
      query = query.eq('membership_status', options.membershipStatus)
    }

    if (options?.skillLevel) {
      query = query.eq('skill_level', options.skillLevel)
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
      players: data || [],
      total: count || 0
    }
  }

  // Get a single player by ID
  async getPlayer(playerId: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*, player_statistics(*)')
      .eq('id', playerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // Create a new player
  async createPlayer(tenantId: string, playerData: CreatePlayerData): Promise<Player> {
    const { data, error } = await this.supabase
      .from('players')
      .insert({
        tenant_id: tenantId,
        first_name: playerData.firstName,
        last_name: playerData.lastName,
        email: playerData.email,
        phone: playerData.phone,
        emergency_contact_name: playerData.emergencyContactName,
        emergency_contact_phone: playerData.emergencyContactPhone,
        skill_level: playerData.skillLevel,
        preferred_playing_times: playerData.preferredPlayingTimes,
        health_conditions: playerData.healthConditions,
        membership_status: playerData.membershipStatus || 'active'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Create initial statistics record
    await this.supabase
      .from('player_statistics')
      .insert({
        player_id: data.id,
        current_rating: playerData.skillLevel ? playerData.skillLevel * 100 : null
      })

    return data
  }

  // Update a player
  async updatePlayer(playerId: string, playerData: Partial<CreatePlayerData>): Promise<Player> {
    const updateData: any = {}

    if (playerData.firstName) updateData.first_name = playerData.firstName
    if (playerData.lastName) updateData.last_name = playerData.lastName
    if (playerData.email !== undefined) updateData.email = playerData.email
    if (playerData.phone !== undefined) updateData.phone = playerData.phone
    if (playerData.emergencyContactName !== undefined) updateData.emergency_contact_name = playerData.emergencyContactName
    if (playerData.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = playerData.emergencyContactPhone
    if (playerData.skillLevel !== undefined) updateData.skill_level = playerData.skillLevel
    if (playerData.preferredPlayingTimes !== undefined) updateData.preferred_playing_times = playerData.preferredPlayingTimes
    if (playerData.healthConditions !== undefined) updateData.health_conditions = playerData.healthConditions
    if (playerData.membershipStatus !== undefined) updateData.membership_status = playerData.membershipStatus

    const { data, error } = await this.supabase
      .from('players')
      .update(updateData)
      .eq('id', playerId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete a player
  async deletePlayer(playerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('id', playerId)

    if (error) {
      throw error
    }
  }

  // Get player statistics
  async getPlayerStatistics(playerId: string): Promise<PlayerStatistics | null> {
    const { data, error } = await this.supabase
      .from('player_statistics')
      .select('*')
      .eq('player_id', playerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  // Update player statistics
  async updatePlayerStatistics(playerId: string, stats: Partial<PlayerStatistics>): Promise<PlayerStatistics> {
    const { data, error } = await this.supabase
      .from('player_statistics')
      .update(stats)
      .eq('player_id', playerId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Sign waiver for player
  async signWaiver(playerId: string): Promise<Player> {
    const { data, error } = await this.supabase
      .from('players')
      .update({
        waiver_signed: true,
        waiver_signed_date: new Date().toISOString()
      })
      .eq('id', playerId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Get players by skill level range
  async getPlayersBySkillLevel(tenantId: string, minLevel: number, maxLevel: number): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('skill_level', minLevel)
      .lte('skill_level', maxLevel)
      .eq('membership_status', 'active')
      .order('skill_level', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }

  // Search players
  async searchPlayers(tenantId: string, searchTerm: string): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('tenant_id', tenantId)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(20)

    if (error) {
      throw error
    }

    return data || []
  }

  // Get membership statistics
  async getMembershipStats(tenantId: string): Promise<{
    total: number
    active: number
    inactive: number
    trial: number
    suspended: number
  }> {
    const { data, error } = await this.supabase
      .from('players')
      .select('membership_status')
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }

    const stats = {
      total: data?.length || 0,
      active: 0,
      inactive: 0,
      trial: 0,
      suspended: 0
    }

    data?.forEach((player: any) => {
      stats[player.membership_status as keyof typeof stats]++
    })

    return stats
  }
}

export const playerService = new PlayerService()
