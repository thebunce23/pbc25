'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Country and timezone data (reused from settings)
export const countries = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phonePrefix: '+1',
    currency: 'USD',
    addressFormat: ['street', 'city', 'state', 'zipCode'],
    timezones: [
      { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
      { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
      { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKST/AKDT)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phonePrefix: '+1',
    currency: 'CAD',
    addressFormat: ['street', 'city', 'province', 'postalCode'],
    timezones: [
      { value: 'America/St_Johns', label: 'Newfoundland Time (NST/NDT)' },
      { value: 'America/Halifax', label: 'Atlantic Time (AST/ADT)' },
      { value: 'America/Toronto', label: 'Eastern Time (EST/EDT)' },
      { value: 'America/Winnipeg', label: 'Central Time (CST/CDT)' },
      { value: 'America/Edmonton', label: 'Mountain Time (MST/MDT)' },
      { value: 'America/Vancouver', label: 'Pacific Time (PST/PDT)' }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phonePrefix: '+44',
    currency: 'GBP',
    addressFormat: ['street', 'city', 'county', 'postcode'],
    timezones: [
      { value: 'Europe/London', label: 'British Time (GMT/BST)' }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phonePrefix: '+61',
    currency: 'AUD',
    addressFormat: ['street', 'city', 'state', 'postcode'],
    timezones: [
      { value: 'Australia/Perth', label: 'Western Australia (AWST/AWDT)' },
      { value: 'Australia/Adelaide', label: 'South Australia (ACST/ACDT)' },
      { value: 'Australia/Darwin', label: 'Northern Territory (ACST)' },
      { value: 'Australia/Brisbane', label: 'Queensland (AEST)' },
      { value: 'Australia/Sydney', label: 'New South Wales (AEST/AEDT)' },
      { value: 'Australia/Melbourne', label: 'Victoria (AEST/AEDT)' },
      { value: 'Australia/Hobart', label: 'Tasmania (AEST/AEDT)' }
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    phonePrefix: '+64',
    currency: 'NZD',
    addressFormat: ['street', 'city', 'region', 'postcode'],
    timezones: [
      { value: 'Pacific/Auckland', label: 'New Zealand (NZST/NZDT)' }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phonePrefix: '+49',
    currency: 'EUR',
    addressFormat: ['street', 'city', 'state', 'zipCode'],
    timezones: [
      { value: 'Europe/Berlin', label: 'Central European Time (CET/CEST)' }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    phonePrefix: '+33',
    currency: 'EUR',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Paris', label: 'Central European Time (CET/CEST)' }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    phonePrefix: '+34',
    currency: 'EUR',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Madrid', label: 'Central European Time (CET/CEST)' },
      { value: 'Atlantic/Canary', label: 'Western European Time (WET/WEST)' }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    phonePrefix: '+39',
    currency: 'EUR',
    addressFormat: ['street', 'city', 'region', 'zipCode'],
    timezones: [
      { value: 'Europe/Rome', label: 'Central European Time (CET/CEST)' }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    phonePrefix: '+81',
    currency: 'JPY',
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
    currency: 'SGD',
    addressFormat: ['street', 'district', 'city', 'postalCode'],
    timezones: [
      { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phonePrefix: '+91',
    currency: 'INR',
    addressFormat: ['street', 'city', 'state', 'pinCode'],
    timezones: [
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' }
    ]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    phonePrefix: '+27',
    currency: 'ZAR',
    addressFormat: ['street', 'city', 'province', 'postalCode'],
    timezones: [
      { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' }
    ]
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    phonePrefix: '+55',
    currency: 'BRL',
    addressFormat: ['street', 'city', 'state', 'cep'],
    timezones: [
      { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT/BRST)' },
      { value: 'America/Manaus', label: 'Amazon Time (AMT/AMST)' },
      { value: 'America/Noronha', label: 'Fernando de Noronha Time (FNT)' }
    ]
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    phonePrefix: '+52',
    currency: 'MXN',
    addressFormat: ['street', 'city', 'state', 'postalCode'],
    timezones: [
      { value: 'America/Mexico_City', label: 'Central Time (CST/CDT)' },
      { value: 'America/Tijuana', label: 'Pacific Time (PST/PDT)' },
      { value: 'America/Cancun', label: 'Eastern Time (EST)' }
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
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
}

const ClubSettingsContext = createContext<ClubSettingsContextType | undefined>(undefined)

export function ClubSettingsProvider({ children }: { children: ReactNode }) {
  const getCountryCurrency = (countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode)
    return country?.currency || 'USD'
  }

  const getDefaultSettings = (): ClubSettings => {
    const defaultCountry = 'US'
    return {
      name: 'Sunshine Pickleball Club',
      description: 'A friendly community pickleball club welcoming players of all skill levels.',
      country: defaultCountry,
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
      currency: getCountryCurrency(defaultCountry),
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
    }
  }

  const [clubSettings, setClubSettings] = useState<ClubSettings>(getDefaultSettings())

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { default: settingsService } = await import('@/lib/services/settings-service')
        const settings = await settingsService.getClubSettings()
        if (settings) {
          // Auto-set currency based on country if currency hasn't been explicitly set
          const country = countries.find(c => c.code === settings.country)
          if (country && country.currency) {
            const expectedCurrency = country.currency
            // Auto-update currency if:
            // 1. No currency is set, OR  
            // 2. Currency is still the database default 'USD' but country is not US
            const shouldUpdateCurrency = 
              !settings.currency || 
              (settings.currency === 'USD' && settings.country !== 'US')
              
            if (shouldUpdateCurrency) {
              console.log(`Auto-updating currency from ${settings.currency || 'none'} to ${expectedCurrency} for country ${settings.country}`)
              settings.currency = expectedCurrency
              // Save the updated currency back to the database
              await settingsService.updateClubSettings(settings)
            }
          }
          setClubSettings(settings)
        }
      } catch (error) {
        console.error('Error loading settings from Supabase:', error)
      }
    }

    loadSettings()
  }, [])

  const updateClubSettings = async (newSettings: Partial<ClubSettings>) => {
    setClubSettings(prev => {
      const updated = { ...prev, ...newSettings }
      
      // If country is changing, automatically update timezone and currency
      if (newSettings.country && newSettings.country !== prev.country) {
        const country = countries.find(c => c.code === newSettings.country)
        if (country) {
          if (country.timezones.length > 0) {
            updated.timezone = country.timezones[0].value
          }
          if (country.currency) {
            updated.currency = country.currency
          }
        }
      }
      
      // Save to Supabase (async, don't wait)
      const saveToSupabase = async () => {
        try {
          const { default: settingsService } = await import('@/lib/services/settings-service')
          await settingsService.updateClubSettings(updated)
        } catch (error) {
          console.error('Error saving settings to Supabase:', error)
        }
      }
      saveToSupabase()
      
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

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No date provided'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid date'
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

  const formatTime = (time: Date | string | null | undefined) => {
    if (!time) return 'No time provided'
    const timeObj = typeof time === 'string' ? new Date(time) : time
    if (!timeObj || isNaN(timeObj.getTime())) return 'Invalid time'
    const { timeFormat } = clubSettings
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: clubSettings.timezone,
      hour12: timeFormat === '12h'
    }
    
    return timeObj.toLocaleTimeString(undefined, options)
  }

  const getCurrencySymbol = () => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      CAD: '$',
      EUR: '€',
      GBP: '£',
      AUD: '$',
      NZD: '$',
      JPY: '¥',
      SGD: '$',
      INR: '₹',
      ZAR: 'R',
      BRL: 'R$',
      MXN: '$'
    }
    return currencySymbols[clubSettings.currency] || '$'
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return getCurrencySymbol() + '0'
    
    // For currencies that don't typically show decimals
    const noDecimalCurrencies = ['JPY']
    const minimumFractionDigits = noDecimalCurrencies.includes(clubSettings.currency) ? 0 : 2
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: clubSettings.currency,
        minimumFractionDigits,
        maximumFractionDigits: noDecimalCurrencies.includes(clubSettings.currency) ? 0 : 2
      }).format(amount)
    } catch (error) {
      // Fallback if currency is not supported
      return getCurrencySymbol() + amount.toFixed(minimumFractionDigits)
    }
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
    formatTime,
    formatCurrency,
    getCurrencySymbol
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
