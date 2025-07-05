#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkEventTable() {
  console.log('🔍 Checking event_registrations table structure...\n')
  
  try {
    // Try to insert a minimal test record to see what fields are required
    const testReg = {
      event_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      user_id: '00000000-0000-0000-0000-000000000000'
    }
    
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([testReg])
      .select()
    
    if (error) {
      console.log('Error details:', error)
      console.log('\nThis helps us understand the table structure.')
    } else {
      console.log('Test insert worked:', data)
    }
    
    // Also try to get any existing registrations to see the structure
    const { data: existing, error: existingError } = await supabase
      .from('event_registrations')
      .select('*')
      .limit(1)
    
    if (!existingError && existing.length > 0) {
      console.log('\nExisting registration structure:')
      console.log(Object.keys(existing[0]))
    } else {
      console.log('\nNo existing registrations found')
    }
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

checkEventTable()
