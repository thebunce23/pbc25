// Court Service - Connects settings and courts pages
import { createClient } from '@/lib/supabase/client'

export interface Court {
  id: string
  name: string
  type: 'Indoor' | 'Outdoor'
  surface: string
  status: 'active' | 'maintenance' | 'inactive'
  dimensions?: {
    length: number
    width: number
  }
  lighting: boolean
  airConditioning?: boolean
  accessibility: boolean
  description: string
  hourlyRate: number
  lastMaintenance?: string
  nextMaintenance?: string
  notes?: string
  amenities: string[]
  bookings?: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

class CourtService {
  private static instance: CourtService
  private courts: Court[] = []
  private supabase = createClient()

  private constructor() {
    // Initialize with empty array, load on demand
  }

  public static getInstance(): CourtService {
    if (!CourtService.instance) {
      CourtService.instance = new CourtService()
    }
    return CourtService.instance
  }

  // Load courts from Supabase
  async loadCourts(): Promise<void> {
    try {
      // Check if we're using a mock client (development mode)
      const queryBuilder = this.supabase.from('courts').select('*')
      
      let result
      if (queryBuilder.order) {
        // Real Supabase client
        result = await queryBuilder.order('name')
      } else {
        // Mock client - return sample data for development
        console.log('Using mock court data for development')
        result = {
          data: [
            {
              id: 'mock-court-1',
              name: 'Court A',
              type: 'Indoor',
              surface: 'Hard Court',
              status: 'active',
              description: 'Main indoor court',
              hourly_rate: 25,
              lighting: true,
              air_conditioning: true,
              accessibility: true,
              amenities: ['Water fountain', 'Seating']
            },
            {
              id: 'mock-court-2',
              name: 'Court B',
              type: 'Outdoor',
              surface: 'Asphalt',
              status: 'active',
              description: 'Outdoor practice court',
              hourly_rate: 20,
              lighting: false,
              air_conditioning: false,
              accessibility: true,
              amenities: ['Benches']
            }
          ],
          error: null
        }
      }

      const { data, error } = result

      if (error) {
        console.error('Error loading courts:', error)
        return
      }

      // Transform Supabase data to our Court interface
      this.courts = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        surface: row.surface,
        status: row.status,
        dimensions: row.length && row.width ? { length: row.length, width: row.width } : undefined,
        lighting: row.lighting || false,
        airConditioning: row.air_conditioning || false,
        accessibility: row.accessibility || false,
        description: row.description || '',
        hourlyRate: row.hourly_rate || 25,
        lastMaintenance: row.last_maintenance,
        nextMaintenance: row.next_maintenance,
        notes: row.notes,
        amenities: row.amenities || [],
        bookings: { today: 0, thisWeek: 0, thisMonth: 0 } // TODO: Calculate from bookings table
      }))
    } catch (error) {
      console.error('Error loading courts:', error)
      this.courts = []
    }
  }

  // Get all courts
  async getAllCourts(): Promise<Court[]> {
    if (this.courts.length === 0) {
      await this.loadCourts()
    }
    return [...this.courts]
  }

  // Get courts by status
  async getCourtsByStatus(status: Court['status']): Promise<Court[]> {
    const courts = await this.getAllCourts()
    return courts.filter(court => court.status === status)
  }

  // Get bookable courts (active and maintenance for club events)
  async getBookableCourts(): Promise<Court[]> {
    const courts = await this.getAllCourts()
    return courts.filter(court => court.status !== 'inactive')
  }

  // Get active courts only
  async getActiveCourts(): Promise<Court[]> {
    const courts = await this.getAllCourts()
    return courts.filter(court => court.status === 'active')
  }

  // Get court by ID
  async getCourtById(id: string): Promise<Court | undefined> {
    const courts = await this.getAllCourts()
    return courts.find(court => court.id === id)
  }

  // Add new court
  async addCourt(court: Omit<Court, 'id'>): Promise<Court | null> {
    try {
      const courtData = {
        name: court.name,
        type: court.type,
        surface: court.surface,
        status: court.status,
        description: court.description,
        hourly_rate: court.hourlyRate,
        length: court.dimensions?.length,
        width: court.dimensions?.width,
        lighting: court.lighting,
        air_conditioning: court.airConditioning,
        accessibility: court.accessibility,
        notes: court.notes,
        amenities: court.amenities,
        last_maintenance: court.lastMaintenance,
        next_maintenance: court.nextMaintenance
      }

      const { data, error } = await this.supabase
        .from('courts')
        .insert([courtData])
        .select()
        .single()

      if (error) {
        console.error('Error adding court:', error)
        return null
      }

      // Refresh local cache
      await this.loadCourts()
      
      return this.courts.find(c => c.id === data.id) || null
    } catch (error) {
      console.error('Error adding court:', error)
      return null
    }
  }

  // Update court
  async updateCourt(id: string, updates: Partial<Court>): Promise<Court | null> {
    try {
      const updateData: any = {}
      
      if (updates.name) updateData.name = updates.name
      if (updates.type) updateData.type = updates.type
      if (updates.surface) updateData.surface = updates.surface
      if (updates.status) updateData.status = updates.status
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.hourlyRate) updateData.hourly_rate = updates.hourlyRate
      if (updates.dimensions?.length) updateData.length = updates.dimensions.length
      if (updates.dimensions?.width) updateData.width = updates.dimensions.width
      if (updates.lighting !== undefined) updateData.lighting = updates.lighting
      if (updates.airConditioning !== undefined) updateData.air_conditioning = updates.airConditioning
      if (updates.accessibility !== undefined) updateData.accessibility = updates.accessibility
      if (updates.notes !== undefined) updateData.notes = updates.notes
      if (updates.amenities) updateData.amenities = updates.amenities
      if (updates.lastMaintenance !== undefined) updateData.last_maintenance = updates.lastMaintenance
      if (updates.nextMaintenance !== undefined) updateData.next_maintenance = updates.nextMaintenance

      const { error } = await this.supabase
        .from('courts')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Error updating court:', error)
        return null
      }

      // Refresh local cache
      await this.loadCourts()
      
      return this.courts.find(c => c.id === id) || null
    } catch (error) {
      console.error('Error updating court:', error)
      return null
    }
  }

  // Delete court
  async deleteCourt(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('courts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting court:', error)
        return false
      }

      // Refresh local cache
      await this.loadCourts()
      
      return true
    } catch (error) {
      console.error('Error deleting court:', error)
      return false
    }
  }

  // Update booking stats (TODO: implement with real booking calculations)
  async updateBookingStats(courtId: string, bookingStats: Partial<Court['bookings']>) {
    const court = await this.getCourtById(courtId)
    if (court && court.bookings) {
      court.bookings = { ...court.bookings, ...bookingStats }
      // Note: This is just updating local cache
      // In a real implementation, booking stats would be calculated from the bookings table
    }
  }

  // Subscribe to court changes (using Supabase real-time)
  onChange(callback: (courts: Court[]) => void) {
    const subscription = this.supabase
      .channel('courts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courts'
      }, async () => {
        await this.loadCourts()
        callback(this.courts)
      })
      .subscribe()
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
    }
  }
}

export default CourtService.getInstance()
