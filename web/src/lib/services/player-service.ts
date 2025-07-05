import { createClient } from '../supabase'

export interface Player {
  id: string
  user_id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  position?: string
  emergency_contact?: any
  address?: any
  medical_info?: string
  status: 'active' | 'inactive' | 'suspended'
  membership_type: string
  join_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreatePlayerData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  position?: string
  emergency_contact?: any
  address?: any
  medical_info?: string
  status?: 'active' | 'inactive' | 'suspended'
  membership_type?: string
  notes?: string
}

export interface UpdatePlayerData extends Partial<CreatePlayerData> {}

export interface PlayerFilters {
  skill_level?: string
  status?: string
  membership_type?: string
  search?: string
}

class PlayerService {
  private supabase = createClient()

  // Get all players
  async getPlayers(filters?: PlayerFilters): Promise<Player[]> {
    let query = this.supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    if (filters?.skill_level) {
      query = query.eq('skill_level', filters.skill_level)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.membership_type) {
      query = query.eq('membership_type', filters.membership_type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching players:', error)
      throw error
    }

    return data || []
  }

  // Get a single player by ID
  async getPlayer(playerId: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching player:', error)
      throw error
    }

    return data
  }

  // Create a new player
  async createPlayer(playerData: CreatePlayerData): Promise<Player> {
    const { data, error } = await this.supabase
      .from('players')
      .insert({
        ...playerData,
        status: playerData.status || 'active',
        membership_type: playerData.membership_type || 'Regular',
        skill_level: playerData.skill_level || 'Beginner'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating player:', error)
      throw error
    }

    return data
  }

  // Update a player
  async updatePlayer(playerId: string, playerData: UpdatePlayerData): Promise<Player> {
    const { data, error } = await this.supabase
      .from('players')
      .update(playerData)
      .eq('id', playerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating player:', error)
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
      console.error('Error deleting player:', error)
      throw error
    }
  }

  // Get player statistics for dashboard
  async getPlayerStats(): Promise<{
    total: number
    active: number
    new_this_month: number
    by_skill_level: Record<string, number>
  }> {
    // Get total players
    const { count: total } = await this.supabase
      .from('players')
      .select('*', { count: 'exact', head: true })

    // Get active players
    const { count: active } = await this.supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get new players this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: new_this_month } = await this.supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Get players by skill level
    const { data: skillData } = await this.supabase
      .from('players')
      .select('skill_level')

    const by_skill_level: Record<string, number> = {
      'Beginner': 0,
      'Intermediate': 0,
      'Advanced': 0,
      'Professional': 0
    }

    skillData?.forEach((player) => {
      if (player.skill_level && by_skill_level.hasOwnProperty(player.skill_level)) {
        by_skill_level[player.skill_level]++
      }
    })

    return {
      total: total || 0,
      active: active || 0,
      new_this_month: new_this_month || 0,
      by_skill_level
    }
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, callback)
      .subscribe()
  }
}

export const playerService = new PlayerService()
