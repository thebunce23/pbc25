'use client'

import { useState, useEffect } from 'react'
import { useClubSettings, countries } from '@/contexts/club-settings-context'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { 
  Settings, 
  Building2, 
  Users, 
  Bell, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Save,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Flag
} from 'lucide-react'


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('club')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { 
    clubSettings, 
    updateClubSettings, 
    getSelectedCountry, 
    getCountryTimezones, 
    getCountryPhonePrefix, 
    getAddressLabels, 
    formatPhoneNumber 
  } = useClubSettings()

  const [courts, setCourts] = useState([
    { id: 1, name: 'Court A', type: 'Indoor', status: 'Active', surface: 'Concrete' },
    { id: 2, name: 'Court B', type: 'Indoor', status: 'Active', surface: 'Concrete' },
    { id: 3, name: 'Court C', type: 'Outdoor', status: 'Maintenance', surface: 'Asphalt' },
    { id: 4, name: 'Court D', type: 'Outdoor', status: 'Active', surface: 'Sport Court' }
  ])

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


  const handleSave = async (section: string) => {
    setSaveStatus('saving')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage for persistence (in a real app, this would be an API call)
      if (section === 'club') {
        localStorage.setItem('clubSettings', JSON.stringify(clubSettings))
      } else if (section === 'notifications') {
        localStorage.setItem('notificationSettings', JSON.stringify(notifications))
      } else if (section === 'system') {
        localStorage.setItem('systemSettings', JSON.stringify(systemSettings))
      }
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const tabs = [
    { id: 'club', label: 'Club Info', icon: Building2 },
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
            <Button size="sm" className="flex items-center gap-2">
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
                    variant={court.status === 'Active' ? 'default' : 'secondary'}
                    className={court.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {court.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
        {activeTab === 'courts' && renderCourtSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'system' && renderSystemSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
      </div>
    </DashboardLayout>
  )
}
