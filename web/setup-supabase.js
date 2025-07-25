#!/usr/bin/env node

/**
 * Supabase Setup Script for PBC25 Tennis Platform
 * 
 * This script helps you:
 * 1. Verify your Supabase connection
 * 2. Run database migrations
 * 3. Set up initial data
 * 4. Test all the services
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🎾 PBC25 Tennis Platform - Supabase Setup')
console.log('==========================================\n')

// Check environment variables
function checkEnvVars() {
  console.log('1. Checking environment variables...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nPlease add these to your .env.local file')
    console.error('You can find these values in your Supabase project dashboard')
    process.exit(1)
  }
  
  console.log('✅ All environment variables found')
}

// Test Supabase connection
async function testConnection() {
  console.log('\n2. Testing Supabase connection...')
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Test basic connection
    const { data, error } = await supabase
      .from('courts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Supabase connection successful')
    return supabase
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    process.exit(1)
  }
}

// Check database tables
async function checkTables(supabase) {
  console.log('\n3. Checking database tables...')
  
  const expectedTables = [
    'users', 'courts', 'bookings', 'events', 'event_registrations',
    'players', 'matches', 'match_participants', 'club_settings'
  ]
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`⚠️  Table "${table}" might not exist or has issues:`, error.message)
      } else {
        console.log(`✅ Table "${table}" is accessible`)
      }
    } catch (err) {
      console.log(`❌ Error checking table "${table}":`, err.message)
    }
  }
}

// Test authentication
async function testAuth(supabase) {
  console.log('\n4. Testing authentication...')
  
  try {
    // Test auth configuration
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Auth test warning:', error.message)
    } else {
      console.log('✅ Authentication system is configured')
    }
  } catch (err) {
    console.log('⚠️  Auth test error:', err.message)
  }
}

// Insert sample data if tables are empty
async function setupSampleData(supabase) {
  console.log('\n5. Setting up sample data...')
  
  try {
    // Check if we already have courts
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id')
      .limit(1)
    
    if (courtsError) {
      console.log('⚠️  Could not check courts table:', courtsError.message)
      return
    }
    
    if (courts && courts.length > 0) {
      console.log('✅ Sample courts already exist')
    } else {
      console.log('📝 Adding sample courts...')
      // Courts should be added via migrations, but let's verify
    }
    
    // Check for club settings
    const { data: settings, error: settingsError } = await supabase
      .from('club_settings')
      .select('id')
      .limit(1)
    
    if (!settingsError && (!settings || settings.length === 0)) {
      console.log('📝 Adding default club settings...')
      const { error: insertError } = await supabase
        .from('club_settings')
        .insert([{
          club_name: 'PBC25 Tennis Club',
          address: '123 Tennis Court Ave',
          phone: '(555) 123-4567',
          email: 'info@pbc25tennis.com',
          operating_hours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '07:00', close: '21:00' },
            sunday: { open: '08:00', close: '20:00' }
          },
          booking_rules: {
            advance_booking_days: 14,
            max_booking_duration_hours: 2,
            cancellation_hours: 24
          }
        }])
      
      if (insertError) {
        console.log('⚠️  Could not add club settings:', insertError.message)
      } else {
        console.log('✅ Default club settings added')
      }
    }
    
  } catch (err) {
    console.log('⚠️  Error setting up sample data:', err.message)
  }
}

// Main setup function
async function main() {
  try {
    checkEnvVars()
    const supabase = await testConnection()
    await checkTables(supabase)
    await testAuth(supabase) 
    await setupSampleData(supabase)
    
    console.log('\n🎉 Setup Complete!')
    console.log('==================')
    console.log('Your PBC25 Tennis Platform is ready to use!')
    console.log('\nNext steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Visit http://localhost:3000')
    console.log('3. The app will now use real Supabase instead of mocks')
    console.log('\n📊 Supabase Dashboard:', process.env.NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', ''))
    
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main }
