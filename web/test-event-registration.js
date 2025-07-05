#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testEventRegistration() {
  console.log('🎪 Testing Event Registration System...\n')
  
  try {
    // Get events and players
    const { data: events } = await supabase
      .from('events')
      .select('id, name, event_type, max_participants')
    
    const { data: players } = await supabase
      .from('players')
      .select('id, first_name, last_name, skill_level')
      .limit(15)
    
    console.log(`📊 Found ${events.length} events and ${players.length} players`)
    
    // Create test registrations
    const testRegistrations = []
    
    // Register players for Summer Tournament
    const tournamentEvent = events.find(e => e.name.includes('Tournament'))
    if (tournamentEvent && players.length >= 10) {
      console.log(`\n🏆 Registering players for: ${tournamentEvent.name}`)
      
      // Register 10 players for tournament
      for (let i = 0; i < 10; i++) {
        testRegistrations.push({
          event_id: tournamentEvent.id,
          user_id: null, // Since we don't have auth users yet
          registration_date: new Date().toISOString(),
          status: 'registered'
        })
      }
    }
    
    // Register players for Beginner Training
    const trainingEvent = events.find(e => e.name.includes('Training'))
    if (trainingEvent && players.length >= 5) {
      console.log(`📚 Registering players for: ${trainingEvent.name}`)
      
      // Register beginners and intermediates only
      const beginnerPlayers = players.filter(p => ['Beginner', 'Intermediate'].includes(p.skill_level)).slice(0, 5)
      
      beginnerPlayers.forEach(player => {
        testRegistrations.push({
          event_id: trainingEvent.id,
          user_id: null,
          registration_date: new Date().toISOString(),
          status: 'registered'
        })
      })
    }
    
    // Register players for Social Event
    const socialEvent = events.find(e => e.name.includes('Social'))
    if (socialEvent && players.length >= 8) {
      console.log(`🎉 Registering players for: ${socialEvent.name}`)
      
      // Register mixed skill levels for social event
      const socialPlayers = players.slice(0, 8)
      
      socialPlayers.forEach(player => {
        testRegistrations.push({
          event_id: socialEvent.id,
          user_id: null,
          registration_date: new Date().toISOString(),
          status: 'registered'
        })
      })
    }
    
    console.log(`\n📝 Creating ${testRegistrations.length} event registrations...`)
    
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .insert(testRegistrations)
      .select(`
        *,
        events(name, event_type)
      `)
    
    if (regError) {
      console.error('❌ Error creating registrations:', regError)
      return
    }
    
    console.log(`✅ Created ${registrations.length} registrations:`)
    
    // Group by event
    const regsByEvent = {}
    registrations.forEach(reg => {
      const eventName = reg.events.name
      if (!regsByEvent[eventName]) {
        regsByEvent[eventName] = []
      }
      regsByEvent[eventName].push(reg)
    })
    
    Object.entries(regsByEvent).forEach(([eventName, regs]) => {
      console.log(`\n   📋 ${eventName}: ${regs.length} registrations`)
      regs.forEach((reg, index) => {
        console.log(`      - Registration ${index + 1} (${reg.status})`)
      })
    })
    
    // Update event current_participants count
    console.log('\n🔄 Updating event participant counts...')
    
    for (const event of events) {
      const participantCount = registrations.filter(r => r.event_id === event.id).length
      
      await supabase
        .from('events')
        .update({ current_participants: participantCount })
        .eq('id', event.id)
    }
    
    console.log('✅ Event participant counts updated!')
    
    // Check if any events are full
    console.log('\n📊 Event capacity status:')
    for (const event of events) {
      const participantCount = registrations.filter(r => r.event_id === event.id).length
      const capacity = event.max_participants || 'Unlimited'
      const status = event.max_participants && participantCount >= event.max_participants ? '🔴 FULL' : '🟢 Available'
      
      console.log(`   ${event.name}: ${participantCount}/${capacity} ${status}`)
    }
    
    console.log('\n🎯 EVENT REGISTRATION TEST COMPLETE!')
    console.log('Next: Check your web app at http://localhost:3000/events to see the registrations!')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

testEventRegistration()
