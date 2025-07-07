'use client'

import { useState, useEffect } from 'react'
import { useClubSettings, countries } from '@/contexts/club-settings-context'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import AddCourtForm from '@/components/forms/add-court-form'
import EditCourtForm from '@/components/forms/edit-court-form'
import {
  Settings,
  Building2,
  Users,
  Bell,
  Shield,
  Clock,
  MapPin,
  Save,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign
} from 'lucide-react'


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('club')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { 
    clubSettings, 
    updateClubSettings, 
    getCountryTimezones, 
    getCountryPhonePrefix, 
    getAddressLabels, 
    formatPhoneNumber 
  } = useClubSettings()

  const [courts, setCourts] = useState([
    { 
      id: '1', 
      name: 'Court A', 
      type: 'Indoor', 
      status: 'active', 
      surface: 'Concrete',
      description: 'Main indoor court with premium surface',
      hourlyRate: 25,
      dimensions: { length: 44, width: 20 },
      lighting: true,
      airConditioning: true,
      accessibility: true,
      amenities: ['Lighting', 'AC', 'Sound System'],
      notes: 'Recently renovated',
      lastMaintenance: '2024-06-01',
      nextMaintenance: '2024-07-01'
    },
    { 
      id: '2', 
      name: 'Court B', 
      type: 'Indoor', 
      status: 'active', 
      surface: 'Concrete',
      description: 'Secondary indoor court',
      hourlyRate: 25,
      dimensions: { length: 44, width: 20 },
      lighting: true,
      airConditioning: true,
      accessibility: false,
      amenities: ['Lighting', 'AC'],
      notes: '',
      lastMaintenance: '2024-06-15',
      nextMaintenance: '2024-07-15'
    },
    { 
      id: '3', 
      name: 'Court C', 
      type: 'Outdoor', 
      status: 'maintenance', 
      surface: 'Asphalt',
      description: 'Outdoor court with natural lighting',
      hourlyRate: 20,
      dimensions: { length: 44, width: 20 },
      lighting: true,
      airConditioning: false,
      accessibility: true,
      amenities: ['Lighting', 'Wheelchair Accessible'],
      notes: 'Surface needs repair',
      lastMaintenance: '2024-05-01',
      nextMaintenance: '2024-08-01'
    },
    { 
      id: '4', 
      name: 'Court D', 
      type: 'Outdoor', 
      status: 'active', 
      surface: 'Sport Court',
      description: 'Premium outdoor court',
      hourlyRate: 30,
      dimensions: { length: 44, width: 20 },
      lighting: true,
      airConditioning: false,
      accessibility: true,
      amenities: ['Lighting', 'Premium Surface', 'Wheelchair Accessible'],
      notes: 'Premium court with sport court surface',
      lastMaintenance: '2024-06-01',
      nextMaintenance: '2024-09-01'
    }
  ])

  // Court management state
  const [showAddCourt, setShowAddCourt] = useState(false)
  const [showEditCourt, setShowEditCourt] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<Record<string, unknown> | null>(null)

  // Court management handlers
  const handleAddCourt = async (courtData: Record<string, unknown>) => {
    // Import court service dynamically to avoid SSR issues
    const { default: courtService } = await import('@/lib/services/court-service')
    
    const newCourt = await courtService.addCourt(courtData)
    if (newCourt) {
      // Refresh the courts list
      const updatedCourts = await courtService.getAllCourts()
      setCourts(updatedCourts)
    }
  }

  const handleEditCourt = async (courtData: Record<string, unknown>) => {
    if (!selectedCourt) return
    
    // Import court service dynamically to avoid SSR issues
    const { default: courtService } = await import('@/lib/services/court-service')
    
    const updatedCourt = await courtService.updateCourt(selectedCourt.id, courtData)
    if (updatedCourt) {
      // Refresh the courts list
      const updatedCourts = await courtService.getAllCourts()
      setCourts(updatedCourts)
    }
  }

  const handleDeleteCourt = async (courtId: string) => {
    if (confirm('Are you sure you want to delete this court?')) {
      // Import court service dynamically to avoid SSR issues
      const { default: courtService } = await import('@/lib/services/court-service')
      
      const deleted = await courtService.deleteCourt(courtId)
      if (deleted) {
        // Refresh the courts list
        const updatedCourts = await courtService.getAllCourts()
        setCourts(updatedCourts)
      }
    }
  }

  const openEditCourt = (court: Record<string, unknown>) => {
    setSelectedCourt(court)
    setShowEditCourt(true)
  }

  // Load courts from Supabase on mount
  useEffect(() => {
    const loadCourtsFromSupabase = async () => {
      try {
        const { default: courtService } = await import('@/lib/services/court-service')
        const loadedCourts = await courtService.getAllCourts()
        setCourts(loadedCourts)
      } catch (error) {
        console.error('Error loading courts:', error)
      }
    }

    loadCourtsFromSupabase()
  }, [])

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    matchReminders: true,
    eventAnnouncements: true,
    maintenanceAlerts: true,
    weeklyDigest: true
  })

  const [systemSettings, setSystemSettings] = useState({
    bookingAdvanceDays: 14,
    maxBookingsPerUser: 3,
    cancellationHours: 24,
    matchDurationMinutes: 90,
    courtMaintenanceBuffer: 15,
    autoReleaseMinutes: 10
  })

  const [membershipTypes, setMembershipTypes] = useState([
    {
      id: '1',
      name: 'Regular',
      description: 'Standard membership with full access',
      monthlyFee: 50,
      initializationFee: 100,
      courtBookingRate: 25,
      features: ['Court booking', 'Tournament access', 'Club events'],
      maxAdvanceBookingDays: 14,
      maxActiveBookings: 3,
      isActive: true
    },
    {
      id: '2',
      name: 'Premium',
      description: 'Premium membership with priority access',
      monthlyFee: 75,
      initializationFee: 150,
      courtBookingRate: 20,
      features: ['Priority court booking', 'Free guest passes', 'Tournament access', 'Club events', 'Personal training discount'],
      maxAdvanceBookingDays: 21,
      maxActiveBookings: 5,
      isActive: true
    },
    {
      id: '3',
      name: 'Student',
      description: 'Discounted membership for students',
      monthlyFee: 30,
      initializationFee: 50,
      courtBookingRate: 20,
      features: ['Court booking', 'Tournament access', 'Club events'],
      maxAdvanceBookingDays: 7,
      maxActiveBookings: 2,
      isActive: true
    },
    {
      id: '4',
      name: 'Social',
      description: 'Event-only membership (pricing set per event)',
      monthlyFee: 0,
      initializationFee: 25,
      courtBookingRate: 0,
      features: ['Event participation', 'Social activities'],
      maxAdvanceBookingDays: 0,
      maxActiveBookings: 0,
      isActive: true
    }
  ])

  const [pricingSettings, setPricingSettings] = useState({
    courtBookingRates: {
      peak: 30,
      offPeak: 25,
      weekend: 35
    },
    tournamentFees: {
      individual: 25,
      doubles: 40,
      mixed: 35
    },
    lessonRates: {
      individual: 60,
      group: 25,
      clinic: 15
    },
    guestFees: {
      dayPass: 15,
      courtHour: 10
    },
    lateFees: {
      noShow: 25,
      lateCancellation: 10
    },
    currency: 'USD',
    taxRate: 8.5
  })


  const handleSave = async (section: string) => {
    setSaveStatus('saving')
    
    try {
      const { default: settingsService } = await import('@/lib/services/settings-service')
      let success = false
      
      if (section === 'club') {
        success = await settingsService.updateClubSettings(clubSettings)
      } else if (section === 'notifications') {
        // For now, use a mock user ID. In a real app, get from auth context
        const mockUserId = 'user-123'
        success = await settingsService.updateNotificationSettings(mockUserId, notifications)
      } else if (section === 'system') {
        success = await settingsService.updateSystemSettings(systemSettings)
      } else if (section === 'membership') {
        success = await settingsService.updateMembershipTypes(membershipTypes)
      } else if (section === 'pricing') {
        success = await settingsService.updatePricingSettings(pricingSettings)
      }
      
      if (success) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const tabs = [
    { id: 'club', label: 'Club Info', icon: Building2 },
    { id: 'membership', label: 'Membership & Pricing', icon: CreditCard },
    { id: 'courts', label: 'Courts', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const renderClubSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Club Information
          </CardTitle>
          <CardDescription>
            Basic information about your pickleball club
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Club Name and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clubName">Club Name</Label>
              <Input 
                id="clubName"
                value={clubSettings.name}
                onChange={(e) => updateClubSettings({name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <select 
                id="country"
                value={clubSettings.country}
                onChange={(e) => updateClubSettings({country: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={clubSettings.description}
              onChange={(e) => updateClubSettings({description: e.target.value})}
              rows={3}
            />
          </div>

          {/* Country-aware Address Fields */}
          <div>
            <Label>Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {getAddressLabels().map(({ field, label }) => (
                <div key={field}>
                  <Label htmlFor={field} className="text-sm text-muted-foreground">{label}</Label>
                  <Input 
                    id={field}
                    value={clubSettings.address[field as keyof typeof clubSettings.address] || ''}
                    onChange={(e) => updateClubSettings({
                      address: {
                        ...clubSettings.address,
                        [field]: e.target.value
                      }
                    })}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information with Country Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  {getCountryPhonePrefix()}
                </div>
                <Input 
                  id="phone"
                  type="tel"
                  value={clubSettings.phone}
                  onChange={(e) => updateClubSettings({phone: e.target.value})}
                  className="rounded-l-none"
                  placeholder="123-456-7890"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Format: {formatPhoneNumber('123-456-7890', clubSettings.country)}
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={clubSettings.email}
                onChange={(e) => updateClubSettings({email: e.target.value})}
                placeholder="info@yourclub.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                type="url"
                value={clubSettings.website}
                onChange={(e) => updateClubSettings({website: e.target.value})}
                placeholder="https://yourclub.com"
              />
            </div>
          </div>

          {/* Timezone and Localization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select 
                id="timezone"
                value={clubSettings.timezone}
                onChange={(e) => updateClubSettings({timezone: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {getCountryTimezones().map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <select 
                id="dateFormat"
                value={clubSettings.dateFormat}
                onChange={(e) => updateClubSettings({dateFormat: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="MM/dd/yyyy">MM/dd/yyyy (US)</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy (UK/AU)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (ISO)</option>
                <option value="dd.MM.yyyy">dd.MM.yyyy (DE)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <select 
                id="timeFormat"
                value={clubSettings.timeFormat}
                onChange={(e) => updateClubSettings({timeFormat: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('club')}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            Set your club's operating hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(clubSettings.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24 capitalize font-medium">{day}</div>
                <div className="flex items-center gap-2 flex-1">
                  <Input 
                    type="time" 
                    value={hours.open}
                    className="w-32"
                    disabled={hours.closed}
                  />
                  <span>to</span>
                  <Input 
                    type="time" 
                    value={hours.close}
                    className="w-32"
                    disabled={hours.closed}
                  />
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={hours.closed}
                      className="rounded"
                    />
                    Closed
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => handleSave('hours')}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Hours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCourtSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Court Management
            </div>
            <Button 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowAddCourt(true)}
            >
              <Plus className="h-4 w-4" />
              Add Court
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your pickleball courts and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium">{court.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{court.type}</span>
                      <span>•</span>
                      <span>{court.surface}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={court.status === 'active' ? 'default' : 'secondary'}
                    className={court.status === 'active' ? 'bg-green-100 text-green-800' : court.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    {court.status === 'active' ? 'Active' : court.status === 'maintenance' ? 'Maintenance' : court.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditCourt(court)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCourt(court.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <input 
                type="checkbox" 
                id="emailNotifications"
                checked={notifications.emailNotifications}
                onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
              </div>
              <input 
                type="checkbox" 
                id="smsNotifications"
                checked={notifications.smsNotifications}
                onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                className="rounded"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="matchReminders">Match Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded about upcoming matches</p>
              </div>
              <input 
                type="checkbox" 
                id="matchReminders"
                checked={notifications.matchReminders}
                onChange={(e) => setNotifications({...notifications, matchReminders: e.target.checked})}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="eventAnnouncements">Event Announcements</Label>
                <p className="text-sm text-muted-foreground">Notifications about club events and tournaments</p>
              </div>
              <input 
                type="checkbox" 
                id="eventAnnouncements"
                checked={notifications.eventAnnouncements}
                onChange={(e) => setNotifications({...notifications, eventAnnouncements: e.target.checked})}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                <p className="text-sm text-muted-foreground">Court maintenance and closure notifications</p>
              </div>
              <input 
                type="checkbox" 
                id="maintenanceAlerts"
                checked={notifications.maintenanceAlerts}
                onChange={(e) => setNotifications({...notifications, maintenanceAlerts: e.target.checked})}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Weekly summary of club activities</p>
              </div>
              <input 
                type="checkbox" 
                id="weeklyDigest"
                checked={notifications.weeklyDigest}
                onChange={(e) => setNotifications({...notifications, weeklyDigest: e.target.checked})}
                className="rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('notifications')}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Configure booking rules and system behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bookingAdvanceDays">Booking Advance Days</Label>
              <Input 
                id="bookingAdvanceDays"
                type="number"
                value={systemSettings.bookingAdvanceDays}
                onChange={(e) => setSystemSettings({...systemSettings, bookingAdvanceDays: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">How many days in advance can members book courts</p>
            </div>

            <div>
              <Label htmlFor="maxBookingsPerUser">Max Bookings Per User</Label>
              <Input 
                id="maxBookingsPerUser"
                type="number"
                value={systemSettings.maxBookingsPerUser}
                onChange={(e) => setSystemSettings({...systemSettings, maxBookingsPerUser: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">Maximum active bookings per member</p>
            </div>

            <div>
              <Label htmlFor="cancellationHours">Cancellation Notice (Hours)</Label>
              <Input 
                id="cancellationHours"
                type="number"
                value={systemSettings.cancellationHours}
                onChange={(e) => setSystemSettings({...systemSettings, cancellationHours: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">Minimum hours notice required for cancellation</p>
            </div>

            <div>
              <Label htmlFor="matchDurationMinutes">Default Match Duration (Minutes)</Label>
              <Input 
                id="matchDurationMinutes"
                type="number"
                value={systemSettings.matchDurationMinutes}
                onChange={(e) => setSystemSettings({...systemSettings, matchDurationMinutes: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">Default duration for match bookings</p>
            </div>

            <div>
              <Label htmlFor="courtMaintenanceBuffer">Maintenance Buffer (Minutes)</Label>
              <Input 
                id="courtMaintenanceBuffer"
                type="number"
                value={systemSettings.courtMaintenanceBuffer}
                onChange={(e) => setSystemSettings({...systemSettings, courtMaintenanceBuffer: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">Time buffer between bookings for court maintenance</p>
            </div>

            <div>
              <Label htmlFor="autoReleaseMinutes">Auto-release Time (Minutes)</Label>
              <Input 
                id="autoReleaseMinutes"
                type="number"
                value={systemSettings.autoReleaseMinutes}
                onChange={(e) => setSystemSettings({...systemSettings, autoReleaseMinutes: parseInt(e.target.value)})}
              />
              <p className="text-sm text-muted-foreground mt-1">Auto-release unclaimed reservations after this time</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('system')}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMembershipSettings = () => (
    <div className="space-y-6">
      {/* Membership Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membership Types
            </div>
            <Button 
              size="sm" 
              onClick={() => {
                const newMembership = {
                  id: Date.now().toString(),
                  name: 'New Membership',
                  description: 'New membership type',
                  monthlyFee: 50,
                  initializationFee: 100,
                  courtBookingRate: 25,
                  features: ['Court booking'],
                  maxAdvanceBookingDays: 14,
                  maxActiveBookings: 3,
                  isActive: true
                }
                setMembershipTypes([...membershipTypes, newMembership])
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Membership
            </Button>
          </CardTitle>
          <CardDescription>
            Configure membership types, descriptions, fees, and booking privileges. Event-only members pay per event at rates set in each event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Init Fee</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court Rate ($/hr)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Days</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Active</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {membershipTypes.map((membership, index) => (
                  <tr key={membership.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        <Input 
                          value={membership.name}
                          onChange={(e) => {
                            const updated = [...membershipTypes]
                            updated[index].name = e.target.value
                            setMembershipTypes(updated)
                          }}
                          className="font-medium text-sm"
                          placeholder="Membership name"
                        />
                        <Input 
                          value={membership.description}
                          onChange={(e) => {
                            const updated = [...membershipTypes]
                            updated[index].description = e.target.value
                            setMembershipTypes(updated)
                          }}
                          className="text-xs text-gray-600"
                          placeholder="Description"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <Input 
                        type="number"
                        value={membership.monthlyFee}
                        onChange={(e) => {
                          const updated = [...membershipTypes]
                          updated[index].monthlyFee = parseFloat(e.target.value) || 0
                          setMembershipTypes(updated)
                        }}
                        className="w-20 text-sm"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Input 
                        type="number"
                        value={membership.initializationFee}
                        onChange={(e) => {
                          const updated = [...membershipTypes]
                          updated[index].initializationFee = parseFloat(e.target.value) || 0
                          setMembershipTypes(updated)
                        }}
                        className="w-20 text-sm"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Input 
                        type="number"
                        value={membership.courtBookingRate}
                        onChange={(e) => {
                          const updated = [...membershipTypes]
                          updated[index].courtBookingRate = parseFloat(e.target.value) || 0
                          setMembershipTypes(updated)
                        }}
                        className="w-20 text-sm"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Input 
                        type="number"
                        value={membership.maxAdvanceBookingDays}
                        onChange={(e) => {
                          const updated = [...membershipTypes]
                          updated[index].maxAdvanceBookingDays = parseInt(e.target.value) || 0
                          setMembershipTypes(updated)
                        }}
                        className="w-16 text-sm"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Input 
                        type="number"
                        value={membership.maxActiveBookings}
                        onChange={(e) => {
                          const updated = [...membershipTypes]
                          updated[index].maxActiveBookings = parseInt(e.target.value) || 0
                          setMembershipTypes(updated)
                        }}
                        className="w-16 text-sm"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={membership.isActive}
                          onChange={(e) => {
                            const updated = [...membershipTypes]
                            updated[index].isActive = e.target.checked
                            setMembershipTypes(updated)
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{membership.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this membership type?")) {
                            setMembershipTypes(membershipTypes.filter(m => m.id !== membership.id))
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Settings
          </CardTitle>
          <CardDescription>
            Set rates for courts, tournaments, lessons and fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Court Rates */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">Court Booking</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Peak Hours</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.courtBookingRates.peak}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        courtBookingRates: { ...pricingSettings.courtBookingRates, peak: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/hour</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Off-Peak</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.courtBookingRates.offPeak}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        courtBookingRates: { ...pricingSettings.courtBookingRates, offPeak: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/hour</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Weekend</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.courtBookingRates.weekend}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        courtBookingRates: { ...pricingSettings.courtBookingRates, weekend: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/hour</td>
                </tr>
                
                {/* Tournament Fees */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">Tournament</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Individual</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.tournamentFees.individual}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        tournamentFees: { ...pricingSettings.tournamentFees, individual: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ entry</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Doubles</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.tournamentFees.doubles}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        tournamentFees: { ...pricingSettings.tournamentFees, doubles: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ entry</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Mixed Doubles</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.tournamentFees.mixed}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        tournamentFees: { ...pricingSettings.tournamentFees, mixed: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ entry</td>
                </tr>
                
                {/* Lesson Rates */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">Lessons</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Individual</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.lessonRates.individual}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        lessonRates: { ...pricingSettings.lessonRates, individual: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/hour</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Group</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.lessonRates.group}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        lessonRates: { ...pricingSettings.lessonRates, group: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/person/hour</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Clinic</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.lessonRates.clinic}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        lessonRates: { ...pricingSettings.lessonRates, clinic: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/person/session</td>
                </tr>
                
                {/* Guest & Late Fees */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">Guest Fees</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Day Pass</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.guestFees.dayPass}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        guestFees: { ...pricingSettings.guestFees, dayPass: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ per day</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Court Hour</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.guestFees.courtHour}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        guestFees: { ...pricingSettings.guestFees, courtHour: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$/hour</td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">Penalties</td>
                  <td className="px-4 py-3 text-sm text-gray-600">No-Show</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.lateFees.noShow}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        lateFees: { ...pricingSettings.lateFees, noShow: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ fee</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Late Cancellation</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      value={pricingSettings.lateFees.lateCancellation}
                      onChange={(e) => setPricingSettings({
                        ...pricingSettings,
                        lateFees: { ...pricingSettings.lateFees, lateCancellation: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">$ fee</td>
                </tr>
                
                {/* General Settings */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">General</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Currency</td>
                  <td className="px-4 py-3">
                    <select 
                      value={pricingSettings.currency}
                      onChange={(e) => setPricingSettings({ ...pricingSettings, currency: e.target.value })}
                      className="w-20 h-8 text-sm border rounded px-2"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">Code</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-600">Tax Rate</td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number"
                      step="0.1"
                      value={pricingSettings.taxRate}
                      onChange={(e) => setPricingSettings({ ...pricingSettings, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button 
          onClick={() => handleSave('membership')}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saveStatus === 'saving' ? 'Saving...' : 'Save Membership & Pricing'}
        </Button>
      </div>
    </div>
  )

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Configuration
          </CardTitle>
          <CardDescription>
            Set rates for courts, tournaments, lessons and other services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Court Booking Rates */}
          <div>
            <h4 className="font-medium mb-4">Court Booking Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="peakRate">Peak Hours ($/hour)</Label>
                <Input 
                  id="peakRate"
                  type="number"
                  value={pricingSettings.courtBookingRates.peak}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    courtBookingRates: {
                      ...pricingSettings.courtBookingRates,
                      peak: parseFloat(e.target.value) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">Monday-Friday 6-8am, 5-10pm</p>
              </div>
              <div>
                <Label htmlFor="offPeakRate">Off-Peak Hours ($/hour)</Label>
                <Input 
                  id="offPeakRate"
                  type="number"
                  value={pricingSettings.courtBookingRates.offPeak}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    courtBookingRates: {
                      ...pricingSettings.courtBookingRates,
                      offPeak: parseFloat(e.target.value) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">Monday-Friday 8am-5pm</p>
              </div>
              <div>
                <Label htmlFor="weekendRate">Weekend Rate ($/hour)</Label>
                <Input 
                  id="weekendRate"
                  type="number"
                  value={pricingSettings.courtBookingRates.weekend}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    courtBookingRates: {
                      ...pricingSettings.courtBookingRates,
                      weekend: parseFloat(e.target.value) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">Saturday-Sunday all day</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tournament Fees */}
          <div>
            <h4 className="font-medium mb-4">Tournament Entry Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="individualTournament">Individual ($)</Label>
                <Input 
                  id="individualTournament"
                  type="number"
                  value={pricingSettings.tournamentFees.individual}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    tournamentFees: {
                      ...pricingSettings.tournamentFees,
                      individual: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="doublesTournament">Doubles ($)</Label>
                <Input 
                  id="doublesTournament"
                  type="number"
                  value={pricingSettings.tournamentFees.doubles}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    tournamentFees: {
                      ...pricingSettings.tournamentFees,
                      doubles: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="mixedTournament">Mixed Doubles ($)</Label>
                <Input 
                  id="mixedTournament"
                  type="number"
                  value={pricingSettings.tournamentFees.mixed}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    tournamentFees: {
                      ...pricingSettings.tournamentFees,
                      mixed: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Lesson Rates */}
          <div>
            <h4 className="font-medium mb-4">Lesson Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="individualLesson">Individual Lesson ($/hour)</Label>
                <Input 
                  id="individualLesson"
                  type="number"
                  value={pricingSettings.lessonRates.individual}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    lessonRates: {
                      ...pricingSettings.lessonRates,
                      individual: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="groupLesson">Group Lesson ($/person/hour)</Label>
                <Input 
                  id="groupLesson"
                  type="number"
                  value={pricingSettings.lessonRates.group}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    lessonRates: {
                      ...pricingSettings.lessonRates,
                      group: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="clinicRate">Clinic ($/person/session)</Label>
                <Input 
                  id="clinicRate"
                  type="number"
                  value={pricingSettings.lessonRates.clinic}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    lessonRates: {
                      ...pricingSettings.lessonRates,
                      clinic: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Guest Fees */}
          <div>
            <h4 className="font-medium mb-4">Guest Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayPass">Day Pass ($)</Label>
                <Input 
                  id="dayPass"
                  type="number"
                  value={pricingSettings.guestFees.dayPass}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    guestFees: {
                      ...pricingSettings.guestFees,
                      dayPass: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="guestCourtHour">Guest Court Fee ($/hour)</Label>
                <Input 
                  id="guestCourtHour"
                  type="number"
                  value={pricingSettings.guestFees.courtHour}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    guestFees: {
                      ...pricingSettings.guestFees,
                      courtHour: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Late Fees */}
          <div>
            <h4 className="font-medium mb-4">Late Fees & Penalties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="noShowFee">No-Show Fee ($)</Label>
                <Input 
                  id="noShowFee"
                  type="number"
                  value={pricingSettings.lateFees.noShow}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    lateFees: {
                      ...pricingSettings.lateFees,
                      noShow: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="lateCancellation">Late Cancellation Fee ($)</Label>
                <Input 
                  id="lateCancellation"
                  type="number"
                  value={pricingSettings.lateFees.lateCancellation}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    lateFees: {
                      ...pricingSettings.lateFees,
                      lateCancellation: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* General Settings */}
          <div>
            <h4 className="font-medium mb-4">General Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select 
                  id="currency"
                  value={pricingSettings.currency}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    currency: e.target.value
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input 
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={pricingSettings.taxRate}
                  onChange={(e) => setPricingSettings({
                    ...pricingSettings,
                    taxRate: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('pricing')}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Pricing Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Manage security settings and user permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Security Notice</h4>
              <p className="text-sm mt-1">
                Security settings are managed at the platform level. Contact your administrator for changes.
              </p>
            </div>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Additional security for admin accounts</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Enabled
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
              </div>
              <Badge variant="outline">
                30 minutes
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Data Backup</Label>
                <p className="text-sm text-muted-foreground">Automatic daily backups</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        {/* Save Status Alert */}
        {saveStatus === 'saved' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-green-800">
              <h4 className="font-medium">Settings Saved</h4>
              <p className="text-sm mt-1">Your changes have been saved successfully.</p>
            </div>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-red-800">
              <h4 className="font-medium">Save Failed</h4>
              <p className="text-sm mt-1">There was an error saving your changes. Please try again.</p>
            </div>
          </Alert>
        )}

        {/* Settings Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        {activeTab === 'club' && renderClubSettings()}
        {activeTab === 'membership' && renderMembershipSettings()}
        {activeTab === 'courts' && renderCourtSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'system' && renderSystemSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
      </div>

      {/* Court Management Modals */}
      <AddCourtForm 
        open={showAddCourt}
        onOpenChange={setShowAddCourt}
        onSubmit={handleAddCourt}
      />
      
      <EditCourtForm 
        open={showEditCourt}
        onOpenChange={setShowEditCourt}
        onSubmit={handleEditCourt}
        court={selectedCourt}
      />
    </DashboardLayout>
  )
}
