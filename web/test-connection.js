#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('Testing Supabase connection...')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  try {
    console.log('\nTesting connection with users table...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('Users table error:', error)
    } else {
      console.log('✅ Users table accessible!')
    }

    console.log('\nChecking what tables exist...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables')
      .select()
    
    if (tablesError) {
      console.log('Schema query failed, trying alternative...')
      // Try to list some known tables
      const knownTables = ['users', 'events', 'courts', 'bookings']
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1)
          
          if (!error) {
            console.log(`✅ Table "${table}" exists`)
          }
        } catch (e) {
          console.log(`❌ Table "${table}" does not exist or has issues`)
        }
      }
    }

  } catch (err) {
    console.log('Connection test failed:', err.message)
  }
}

testConnection()
