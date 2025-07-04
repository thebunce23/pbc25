'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Country and timezone data (reused from settings)
export const countries = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phonePrefix: '+1',
    addressFormat: ['street', 'city', 'state', 'zipCode'],
    timezones: [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phonePrefix: '+1',
    addressFormat: ['street', 'city', 'province', 'postalCode'],
    timezones: [
      { value: 'America/St_Johns', label: 'Newfoundland Time (NT)' },
      { value: 'America/Halifax', label: 'Atlantic Time (AT)' },
      { value: 'America/Toronto', label: 'Eastern Time (ET)' },
      { value: 'America/Winnipeg', label: 'Central Time (CT)' },
      { value: 'America/Edmonton', label: 'Mountain Time (MT)' },
      { value: 'America/Vancouver', label: 'Pacific Time (PT)' }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phonePrefix: '+44',
    addressFormat: ['street', 'city', 'county', 'postcode'],
    timezones: [
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phonePrefix: '+61',
    addressFormat: ['street', 'city', 'state', 'postcode'],
    timezones: [
      { value: 'Australia/Perth', label: 'Australian Western Time (AWST)' },
      { value: 'Australia/Adelaide', label: 'Australian Central Time (ACST)' },
      { value: 'Australia/Darwin', label: 'Australian Central Time (ACST)' },
      { value: 'Australia/Brisbane', label: 'Australian Eastern Time (AEST)' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' },
      { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AEST)' }
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    phonePrefix: '+64',
    addressFormat: ['street', 'city', 'region', 'postcode'],
    timezones: [
      { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST)' }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phonePrefix: '+49',
    addressFormat: ['street', 'city', 'state', 'zipCode'],
    timezones: [
      { value: 'Europe/Berlin', label: 'Central European Time (CET)' }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    phonePrefix: '+33',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Paris', label: 'Central European Time (CET)' }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    phonePrefix: '+34',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Madrid', label: 'Central European Time (CET)' },
      { value: 'Atlantic/Canary', label: 'Western European Time (WET)' }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    phonePrefix: '+39',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Rome', label: 'Central European Time (CET)' }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    phonePrefix: '+81',
    addressFormat: ['prefecture', 'city', 'street', 'zipCode'],
    timezones: [
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    phonePrefix: '+65',
    addressFormat: ['street', 'district', 'city', 'postalCode'],
    timezones: [
      { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' }
    ]
  }
]

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

interface ClubSettingsContextType {
  clubSettings: ClubSettings
  updateClubSettings: (settings: Partial<ClubSettings>) => void
  getSelectedCountry: () => typeof countries[0]
  getCountryTimezones: () => typeof countries[0]['timezones']
  getCountryPhonePrefix: () => string
  getAddressLabels: () => { field: string; label: string }[]
  formatPhoneNumber: (phone: string, countryCode?: string) => string
  formatDate: (date: Date | string) => string
  formatTime: (time: Date | string) => string
}

const ClubSettingsContext = createContext<ClubSettingsContextType | undefined>(undefined)

export function ClubSettingsProvider({ children }: { children: ReactNode }) {
  const getDefaultSettings = (): ClubSettings => ({
    name: 'Sunshine Pickleball Club',
    description: 'A friendly community pickleball club welcoming players of all skill levels.',
    country: 'US',
    address: {
      street: '123 Recreation Way',
      city: 'Sunny City',
      state: 'California',
      zipCode: '90210'
    },
    phone: '(555) 123-4567',
    email: 'info@sunshinepcb.com',
    website: 'https://sunshinepcb.com',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '07:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: false }
    }
  })

  const [clubSettings, setClubSettings] = useState<ClubSettings>(getDefaultSettings())

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clubSettings')
      if (saved) {
        try {
          const parsedSettings = JSON.parse(saved)
          setClubSettings(parsedSettings)
        } catch (error) {
          console.error('Error loading saved settings:', error)
        }
      }
    }
  }, [])

  const updateClubSettings = (newSettings: Partial<ClubSettings>) => {
    setClubSettings(prev => {
      const updated = { ...prev, ...newSettings }
      
      // If country is changing, automatically update timezone to first available
      if (newSettings.country && newSettings.country !== prev.country) {
        const country = countries.find(c => c.code === newSettings.country)
        if (country && country.timezones.length > 0) {
          updated.timezone = country.timezones[0].value
        }
      }
      
      return updated
    })
  }

  const getSelectedCountry = () => countries.find(c => c.code === clubSettings.country) || countries[0]
  
  const getCountryTimezones = () => getSelectedCountry().timezones
  
  const getCountryPhonePrefix = () => getSelectedCountry().phonePrefix
  
  const getAddressLabels = () => {
    const format = getSelectedCountry().addressFormat
    const labels: Record<string, string> = {
      street: 'Street Address',
      city: 'City',
      state: 'State/Province',
      province: 'Province',
      county: 'County',
      region: 'Region',
      prefecture: 'Prefecture',
      district: 'District',
      zipCode: 'Zip Code',
      postalCode: 'Postal Code',
      postcode: 'Postcode'
    }
    return format.map(field => ({ field, label: labels[field] || field }))
  }

  const formatPhoneNumber = (phone: string, countryCode?: string) => {
    const country = countries.find(c => c.code === (countryCode || clubSettings.country))
    if (!country || !phone) return phone
    
    // Simple formatting - in a real app, use a library like libphonenumber
    const prefix = country.phonePrefix
    if (phone.startsWith(prefix)) return phone
    if (phone.startsWith('+')) return phone
    return `${prefix} ${phone}`
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const { dateFormat } = clubSettings
    
    // Simple date formatting based on dateFormat
    const options: Intl.DateTimeFormatOptions = {
      timeZone: clubSettings.timezone
    }
    
    switch (dateFormat) {
      case 'MM/dd/yyyy':
        options.month = '2-digit'
        options.day = '2-digit'
        options.year = 'numeric'
        return dateObj.toLocaleDateString('en-US', options)
      case 'dd/MM/yyyy':
        options.day = '2-digit'
        options.month = '2-digit'
        options.year = 'numeric'
        return dateObj.toLocaleDateString('en-GB', options)
      case 'yyyy-MM-dd':
        return dateObj.toISOString().split('T')[0]
      case 'dd.MM.yyyy':
        options.day = '2-digit'
        options.month = '2-digit'
        options.year = 'numeric'
        return dateObj.toLocaleDateString('de-DE', options)
      default:
        return dateObj.toLocaleDateString()
    }
  }

  const formatTime = (time: Date | string) => {
    const timeObj = typeof time === 'string' ? new Date(time) : time
    const { timeFormat } = clubSettings
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: clubSettings.timezone,
      hour12: timeFormat === '12h'
    }
    
    return timeObj.toLocaleTimeString(undefined, options)
  }

  const value = {
    clubSettings,
    updateClubSettings,
    getSelectedCountry,
    getCountryTimezones,
    getCountryPhonePrefix,
    getAddressLabels,
    formatPhoneNumber,
    formatDate,
    formatTime
  }

  return (
    <ClubSettingsContext.Provider value={value}>
      {children}
    </ClubSettingsContext.Provider>
  )
}

export function useClubSettings() {
  const context = useContext(ClubSettingsContext)
  if (context === undefined) {
    throw new Error('useClubSettings must be used within a ClubSettingsProvider')
  }
  return context
}
