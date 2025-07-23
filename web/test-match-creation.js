#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testMatchCreation() {
  console.log('🏓 Testing Match Creation & Player Assignment...\n')
  
  try {
    // Get some players and courts first
    const { data: players } = await supabase
      .from('players')
      .select('id, first_name, last_name, skill_level')
      .limit(8)
    
    const { data: courts } = await supabase
      .from('courts')
      .select('id, name')
      .eq('status', 'active')
      .limit(2)
    
    console.log(`📊 Found ${players.length} players and ${courts.length} active courts`)
    
    // Create test matches
    const testMatches = [
      {
        title: 'Mixed Doubles Championship',
        match_type: 'Mixed Doubles',
        skill_level: 'Advanced',
        court_id: courts[0]?.id,
        date: '2025-07-15',
        time: '18:00',
        duration_minutes: 90,
        status: 'scheduled',
        max_players: 4,
        description: 'Advanced mixed doubles match for tournament practice'
      },
      {
        title: 'Beginner Friendly Doubles',
        match_type: 'Doubles', 
        skill_level: 'Beginner',
        court_id: courts[1]?.id,
        date: '2025-07-16',
        time: '19:00',
        duration_minutes: 60,
        status: 'scheduled',
        max_players: 4,
        description: 'Perfect for newcomers to learn doubles strategy'
      },
      {
        title: 'Singles Showdown',
        match_type: 'Singles',
        skill_level: 'Intermediate',
        court_id: courts[0]?.id,
        date: '2025-07-17',
        time: '17:30',
        duration_minutes: 45,
        status: 'scheduled',
        max_players: 2,
        description: 'Competitive singles match'
      }
    ]
    
    console.log('\n🆕 Creating test matches...')
    const { data: createdMatches, error: matchError } = await supabase
      .from('matches')
      .insert(testMatches)
      .select()
    
    if (matchError) {
      console.error('❌ Error creating matches:', matchError)
      return
    }
    
    console.log(`✅ Created ${createdMatches.length} matches:`)
    createdMatches.forEach(match => {
      console.log(`   - ${match.title} (${match.match_type}) on ${match.date}`)
    })
    
    // Assign players to matches
    console.log('\n👥 Assigning players to matches...')
    
    const playerAssignments = []
    
    // Assign 4 players to first match (Mixed Doubles)
    if (createdMatches[0] && players.length >= 4) {
      playerAssignments.push(
        { match_id: createdMatches[0].id, player_id: players[0].id, team: 'A' },
        { match_id: createdMatches[0].id, player_id: players[1].id, team: 'A' },
        { match_id: createdMatches[0].id, player_id: players[2].id, team: 'B' },
        { match_id: createdMatches[0].id, player_id: players[3].id, team: 'B' }
      )
    }
    
    // Assign 4 players to second match (Beginner Doubles)
    if (createdMatches[1] && players.length >= 8) {
      playerAssignments.push(
        { match_id: createdMatches[1].id, player_id: players[4].id, team: 'A' },
        { match_id: createdMatches[1].id, player_id: players[5].id, team: 'A' },
        { match_id: createdMatches[1].id, player_id: players[6].id, team: 'B' },
        { match_id: createdMatches[1].id, player_id: players[7].id, team: 'B' }
      )
    }
    
    // Assign 2 players to singles match
    if (createdMatches[2] && players.length >= 2) {
      playerAssignments.push(
        { match_id: createdMatches[2].id, player_id: players[0].id, team: 'A' },
        { match_id: createdMatches[2].id, player_id: players[2].id, team: 'B' }
      )
    }
    
    const { data: assignedPlayers, error: assignError } = await supabase
      .from('match_participants')
      .insert(playerAssignments)
      .select(`
        *,
        players(first_name, last_name),
        matches(title)
      `)
    
    if (assignError) {
      console.error('❌ Error assigning players:', assignError)
      return
    }
    
    console.log(`✅ Assigned ${assignedPlayers.length} players to matches:`)
    assignedPlayers.forEach(assignment => {
      console.log(`   - ${assignment.players.first_name} ${assignment.players.last_name} → ${assignment.matches.title} (Team ${assignment.team})`)
    })
    
    // Update match current_players count
    console.log('\n🔄 Updating match participant counts...')
    for (const match of createdMatches) {
      const participantCount = playerAssignments.filter(p => p.match_id === match.id).length
      await supabase
        .from('matches')
        .update({ current_players: participantCount })
        .eq('id', match.id)
    }
    
    console.log('✅ Match participant counts updated!')
    
    console.log('\n🎯 MATCH CREATION TEST COMPLETE!')
    console.log('Next: Check your web app at http://localhost:3000/matches to see the new matches!')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

testMatchCreation()
