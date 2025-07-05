import { createClient } from '@/lib/supabase/client'

export interface ClubSettings {
  name: string
  description: string
  country: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    [key: string]: string
  }
  phone: string
  email: string
  website: string
  timezone: string
  currency: string
  dateFormat: string
  timeFormat: string
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  matchReminders: boolean
  eventAnnouncements: boolean
  maintenanceAlerts: boolean
  weeklyDigest: boolean
}

export interface SystemSettings {
  bookingAdvanceDays: number
  maxBookingsPerUser: number
  cancellationHours: number
  matchDurationMinutes: number
  courtMaintenanceBuffer: number
  autoReleaseMinutes: number
}

class SettingsService {
  private static instance: SettingsService
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  // Club Settings Methods
  async getClubSettings(): Promise<ClubSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('club_settings')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching club settings:', error)
        return null
      }

      if (!data) return null

      return {
        name: data.name,
        description: data.description,
        country: data.country,
        address: data.address || {},
        phone: data.phone,
        email: data.email,
        website: data.website,
        timezone: data.timezone,
        currency: data.currency,
        dateFormat: data.date_format,
        timeFormat: data.time_format,
        operatingHours: data.operating_hours || {}
      }
    } catch (error) {
      console.error('Error fetching club settings:', error)
      return null
    }
  }

  async updateClubSettings(settings: Partial<ClubSettings>): Promise<boolean> {
    try {
      const updateData: any = {}
      
      if (settings.name) updateData.name = settings.name
      if (settings.description !== undefined) updateData.description = settings.description
      if (settings.country) updateData.country = settings.country
      if (settings.address) updateData.address = settings.address
      if (settings.phone) updateData.phone = settings.phone
      if (settings.email) updateData.email = settings.email
      if (settings.website) updateData.website = settings.website
      if (settings.timezone) updateData.timezone = settings.timezone
      if (settings.currency) updateData.currency = settings.currency
      if (settings.dateFormat) updateData.date_format = settings.dateFormat
      if (settings.timeFormat) updateData.time_format = settings.timeFormat
      if (settings.operatingHours) updateData.operating_hours = settings.operatingHours

      const { error } = await this.supabase
        .from('club_settings')
        .update(updateData)
        .eq('id', (await this.getClubSettingsId()))

      if (error) {
        console.error('Error updating club settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating club settings:', error)
      return false
    }
  }

  private async getClubSettingsId(): Promise<string> {
    const { data, error } = await this.supabase
      .from('club_settings')
      .select('id')
      .single()

    if (error || !data) {
      throw new Error('Could not find club settings')
    }

    return data.id
  }

  // Notification Settings Methods
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching notification settings:', error)
        return null
      }

      if (!data) {
        // Return default settings if none exist
        return {
          emailNotifications: true,
          smsNotifications: false,
          matchReminders: true,
          eventAnnouncements: true,
          maintenanceAlerts: true,
          weeklyDigest: true
        }
      }

      return {
        emailNotifications: data.email_notifications,
        smsNotifications: data.sms_notifications,
        matchReminders: data.match_reminders,
        eventAnnouncements: data.event_announcements,
        maintenanceAlerts: data.maintenance_alerts,
        weeklyDigest: data.weekly_digest
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      return null
    }
  }

  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      const updateData: any = {}
      
      if (settings.emailNotifications !== undefined) updateData.email_notifications = settings.emailNotifications
      if (settings.smsNotifications !== undefined) updateData.sms_notifications = settings.smsNotifications
      if (settings.matchReminders !== undefined) updateData.match_reminders = settings.matchReminders
      if (settings.eventAnnouncements !== undefined) updateData.event_announcements = settings.eventAnnouncements
      if (settings.maintenanceAlerts !== undefined) updateData.maintenance_alerts = settings.maintenanceAlerts
      if (settings.weeklyDigest !== undefined) updateData.weekly_digest = settings.weeklyDigest

      const { error } = await this.supabase
        .from('notification_settings')
        .upsert({ user_id: userId, ...updateData })

      if (error) {
        console.error('Error updating notification settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    }
  }

  // System Settings Methods
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('system_settings')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching system settings:', error)
        return null
      }

      if (!data) return null

      return {
        bookingAdvanceDays: data.booking_advance_days,
        maxBookingsPerUser: data.max_bookings_per_user,
        cancellationHours: data.cancellation_hours,
        matchDurationMinutes: data.match_duration_minutes,
        courtMaintenanceBuffer: data.court_maintenance_buffer,
        autoReleaseMinutes: data.auto_release_minutes
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
      return null
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
    try {
      const updateData: any = {}
      
      if (settings.bookingAdvanceDays) updateData.booking_advance_days = settings.bookingAdvanceDays
      if (settings.maxBookingsPerUser) updateData.max_bookings_per_user = settings.maxBookingsPerUser
      if (settings.cancellationHours) updateData.cancellation_hours = settings.cancellationHours
      if (settings.matchDurationMinutes) updateData.match_duration_minutes = settings.matchDurationMinutes
      if (settings.courtMaintenanceBuffer) updateData.court_maintenance_buffer = settings.courtMaintenanceBuffer
      if (settings.autoReleaseMinutes) updateData.auto_release_minutes = settings.autoReleaseMinutes

      const { error } = await this.supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', (await this.getSystemSettingsId()))

      if (error) {
        console.error('Error updating system settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating system settings:', error)
      return false
    }
  }

  private async getSystemSettingsId(): Promise<string> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('id')
      .single()

    if (error || !data) {
      throw new Error('Could not find system settings')
    }

    return data.id
  }

  // User Preferences Methods
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error)
        return {}
      }

      return data?.preferences || {}
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return {}
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({ user_id: userId, preferences })

      if (error) {
        console.error('Error updating user preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  // Real-time subscriptions
  subscribeToClubSettings(callback: (settings: ClubSettings) => void) {
    const subscription = this.supabase
      .channel('club_settings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'club_settings'
      }, async () => {
        const settings = await this.getClubSettings()
        if (settings) callback(settings)
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  subscribeToSystemSettings(callback: (settings: SystemSettings) => void) {
    const subscription = this.supabase
      .channel('system_settings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_settings'
      }, async () => {
        const settings = await this.getSystemSettings()
        if (settings) callback(settings)
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }
}

export default SettingsService.getInstance()
