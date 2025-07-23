#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use the anon key instead of service role to avoid RLS issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createPlayersAndData() {
  console.log('Attempting to create players table and add data...')
  
  try {
    // Try to insert one test player to see if table exists
    const testPlayer = {
      first_name: 'Test',
      last_name: 'Player',
      email: 'test.player@example.com',
      skill_level: 'Beginner',
      status: 'active',
      membership_type: 'Regular'
    }
    
    console.log('Testing if players table exists...')
    const { data: testData, error: testError } = await supabase
      .from('players')
      .insert([testPlayer])
      .select()
    
    if (testError) {
      console.error('Players table does not exist or has issues:', testError.message)
      console.log('\n📋 MANUAL STEPS REQUIRED:')
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
      console.log('2. Open SQL Editor')
      console.log('3. Run the SQL from: scripts/create-players-table.sql')
      console.log('4. Then re-run this script')
      return
    }
    
    console.log('✅ Players table exists! Adding sample data...')
    
    // Delete the test player
    await supabase
      .from('players')
      .delete()
      .eq('email', 'test.player@example.com')
    
    // Add the real sample players
    const samplePlayers = [
      { first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', phone: '555-0101', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Aggressive player' },
      { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@email.com', phone: '555-0102', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Great team player' },
      { first_name: 'Mike', last_name: 'Davis', email: 'mike.davis@email.com', phone: '555-0103', skill_level: 'Professional', status: 'active', membership_type: 'Premium', notes: 'Tournament player' },
      { first_name: 'Emily', last_name: 'Brown', email: 'emily.brown@email.com', phone: '555-0104', skill_level: 'Beginner', status: 'active', membership_type: 'Regular', notes: 'New to pickleball' },
      { first_name: 'David', last_name: 'Wilson', email: 'david.wilson@email.com', phone: '555-0105', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Consistent player' },
      { first_name: 'Jessica', last_name: 'Taylor', email: 'jessica.taylor@email.com', phone: '555-0106', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Quick reflexes' },
      { first_name: 'Robert', last_name: 'Anderson', email: 'robert.anderson@email.com', phone: '555-0107', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Strategic player' },
      { first_name: 'Lisa', last_name: 'Thomas', email: 'lisa.thomas@email.com', phone: '555-0108', skill_level: 'Beginner', status: 'active', membership_type: 'Regular', notes: 'Learning fast' },
      { first_name: 'Christopher', last_name: 'Jackson', email: 'chris.jackson@email.com', phone: '555-0109', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Powerful serves' },
      { first_name: 'Amanda', last_name: 'White', email: 'amanda.white@email.com', phone: '555-0110', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Good court coverage' },
      { first_name: 'James', last_name: 'Harris', email: 'james.harris@email.com', phone: '555-0111', skill_level: 'Professional', status: 'active', membership_type: 'Premium', notes: 'Former tennis pro' },
      { first_name: 'Nicole', last_name: 'Martin', email: 'nicole.martin@email.com', phone: '555-0112', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Improving rapidly' },
      { first_name: 'Kevin', last_name: 'Thompson', email: 'kevin.thompson@email.com', phone: '555-0113', skill_level: 'Beginner', status: 'active', membership_type: 'Regular', notes: 'Weekend warrior' },
      { first_name: 'Rachel', last_name: 'Garcia', email: 'rachel.garcia@email.com', phone: '555-0114', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Excellent positioning' },
      { first_name: 'Daniel', last_name: 'Martinez', email: 'daniel.martinez@email.com', phone: '555-0115', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Team captain material' },
      { first_name: 'Stephanie', last_name: 'Robinson', email: 'stephanie.robinson@email.com', phone: '555-0116', skill_level: 'Beginner', status: 'active', membership_type: 'Regular', notes: 'Enthusiastic learner' },
      { first_name: 'Mark', last_name: 'Clark', email: 'mark.clark@email.com', phone: '555-0117', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Competitive spirit' },
      { first_name: 'Jennifer', last_name: 'Rodriguez', email: 'jennifer.rodriguez@email.com', phone: '555-0118', skill_level: 'Intermediate', status: 'active', membership_type: 'Regular', notes: 'Steady and reliable' },
      { first_name: 'Brian', last_name: 'Lewis', email: 'brian.lewis@email.com', phone: '555-0119', skill_level: 'Beginner', status: 'active', membership_type: 'Regular', notes: 'Former badminton player' },
      { first_name: 'Ashley', last_name: 'Lee', email: 'ashley.lee@email.com', phone: '555-0120', skill_level: 'Advanced', status: 'active', membership_type: 'Premium', notes: 'Rising star' }
    ]
    
    const { data, error } = await supabase
      .from('players')
      .insert(samplePlayers)
      .select()
    
    if (error) {
      console.error('Error adding sample players:', error)
      console.log('Some players might already exist (email conflict)')
    } else {
      console.log(`🎉 Successfully added ${data.length} sample players!`)
      console.log('\nSample players added:')
      data.forEach(player => {
        console.log(`- ${player.first_name} ${player.last_name} (${player.skill_level})`)
      })
    }
    
  } catch (err) {
    console.error('Script error:', err)
  }
}

createPlayersAndData()
