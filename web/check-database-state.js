#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDatabaseState() {
  console.log('🔍 Checking current database state...\n')
  
  try {
    // Check players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, first_name, last_name, skill_level')
      .limit(5)
    
    if (!playersError) {
      console.log(`✅ PLAYERS: ${players.length} found (showing first 5)`)
      players.forEach(p => console.log(`   - ${p.first_name} ${p.last_name} (${p.skill_level})`))
    }

    // Check courts
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id, name, status')
    
    if (!courtsError) {
      console.log(`\n✅ COURTS: ${courts.length} found`)
      courts.forEach(c => console.log(`   - ${c.name} (${c.status})`))
    }

    // Check events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, event_type, start_date')
    
    if (!eventsError) {
      console.log(`\n✅ EVENTS: ${events.length} found`)
      events.forEach(e => console.log(`   - ${e.name} (${e.event_type}) - ${e.start_date}`))
    }

    // Check matches (if table exists)
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, title, match_type, status')
    
    if (!matchesError) {
      console.log(`\n✅ MATCHES: ${matches.length} found`)
      if (matches.length > 0) {
        matches.forEach(m => console.log(`   - ${m.title} (${m.match_type}) - ${m.status}`))
      } else {
        console.log('   (No matches yet - we\'ll create some!)')
      }
    }

    // Check bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
    
    if (!bookingsError) {
      console.log(`\n✅ BOOKINGS: ${bookings.length} found`)
      if (bookings.length > 0) {
        bookings.forEach(b => console.log(`   - ${b.start_time} to ${b.end_time} (${b.status})`))
      } else {
        console.log('   (No bookings yet - we\'ll create some!)')
      }
    }

    console.log('\n🎯 Ready to start testing features!')
    
  } catch (err) {
    console.error('💥 Error checking database:', err)
  }
}

checkDatabaseState()
