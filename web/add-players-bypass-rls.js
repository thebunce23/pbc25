#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use service role key which bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

async function addPlayers() {
  console.log('🚀 Adding 20 players to Supabase (with service role key)...')
  
  try {
    // Using service role key should bypass RLS
    const { data, error } = await supabase
      .from('players')
      .insert(samplePlayers)
      .select()
    
    if (error) {
      console.error('❌ Error adding players:')
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Code:', error.code)
      return
    }
    
    console.log(`🎉 Successfully added ${data.length} players!`)
    console.log('\n📊 Players added:')
    data.forEach((player, index) => {
      console.log(`${index + 1}. ${player.first_name} ${player.last_name} (${player.skill_level})`)
    })
    
    console.log('\n✨ All done! Your Supabase database now has 20 sample players.')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

addPlayers()
