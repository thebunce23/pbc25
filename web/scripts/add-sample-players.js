#!/usr/bin/env node

// This script adds sample players to the database using the existing player service
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const samplePlayers = [
  {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '555-0101',
    date_of_birth: '1985-03-15',
    gender: 'Male',
    skill_level: 'Intermediate',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Aggressive player'
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson', 
    email: 'sarah.johnson@email.com',
    phone: '555-0102',
    date_of_birth: '1990-07-22',
    gender: 'Female',
    skill_level: 'Advanced',
    position: 'Left',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Great team player'
  },
  {
    first_name: 'Mike',
    last_name: 'Davis',
    email: 'mike.davis@email.com',
    phone: '555-0103',
    date_of_birth: '1978-11-08',
    gender: 'Male',
    skill_level: 'Professional',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Tournament player'
  },
  {
    first_name: 'Emily',
    last_name: 'Brown',
    email: 'emily.brown@email.com',
    phone: '555-0104',
    date_of_birth: '1992-05-14',
    gender: 'Female',
    skill_level: 'Beginner',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'New to pickleball'
  },
  {
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '555-0105',
    date_of_birth: '1988-09-30',
    gender: 'Male',
    skill_level: 'Intermediate',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Consistent player'
  },
  {
    first_name: 'Jessica',
    last_name: 'Taylor',
    email: 'jessica.taylor@email.com',
    phone: '555-0106',
    date_of_birth: '1995-12-03',
    gender: 'Female',
    skill_level: 'Advanced',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Quick reflexes'
  },
  {
    first_name: 'Robert',
    last_name: 'Anderson',
    email: 'robert.anderson@email.com',
    phone: '555-0107',
    date_of_birth: '1982-04-18',
    gender: 'Male',
    skill_level: 'Intermediate',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Strategic player'
  },
  {
    first_name: 'Lisa',
    last_name: 'Thomas',
    email: 'lisa.thomas@email.com',
    phone: '555-0108',
    date_of_birth: '1987-08-25',
    gender: 'Female',
    skill_level: 'Beginner',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Learning fast'
  },
  {
    first_name: 'Christopher',
    last_name: 'Jackson',
    email: 'chris.jackson@email.com',
    phone: '555-0109',
    date_of_birth: '1991-01-12',
    gender: 'Male',
    skill_level: 'Advanced',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Powerful serves'
  },
  {
    first_name: 'Amanda',
    last_name: 'White',
    email: 'amanda.white@email.com',
    phone: '555-0110',
    date_of_birth: '1983-06-07',
    gender: 'Female',
    skill_level: 'Intermediate',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Good court coverage'
  },
  {
    first_name: 'James',
    last_name: 'Harris',
    email: 'james.harris@email.com',
    phone: '555-0111',
    date_of_birth: '1979-10-16',
    gender: 'Male',
    skill_level: 'Professional',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Former tennis pro'
  },
  {
    first_name: 'Nicole',
    last_name: 'Martin',
    email: 'nicole.martin@email.com',
    phone: '555-0112',
    date_of_birth: '1994-03-29',
    gender: 'Female',
    skill_level: 'Intermediate',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Improving rapidly'
  },
  {
    first_name: 'Kevin',
    last_name: 'Thompson',
    email: 'kevin.thompson@email.com',
    phone: '555-0113',
    date_of_birth: '1986-07-04',
    gender: 'Male',
    skill_level: 'Beginner',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Weekend warrior'
  },
  {
    first_name: 'Rachel',
    last_name: 'Garcia',
    email: 'rachel.garcia@email.com',
    phone: '555-0114',
    date_of_birth: '1989-11-21',
    gender: 'Female',
    skill_level: 'Advanced',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Excellent positioning'
  },
  {
    first_name: 'Daniel',
    last_name: 'Martinez',
    email: 'daniel.martinez@email.com',
    phone: '555-0115',
    date_of_birth: '1984-02-14',
    gender: 'Male',
    skill_level: 'Intermediate',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Team captain material'
  },
  {
    first_name: 'Stephanie',
    last_name: 'Robinson',
    email: 'stephanie.robinson@email.com',
    phone: '555-0116',
    date_of_birth: '1993-08-11',
    gender: 'Female',
    skill_level: 'Beginner',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Enthusiastic learner'
  },
  {
    first_name: 'Mark',
    last_name: 'Clark',
    email: 'mark.clark@email.com',
    phone: '555-0117',
    date_of_birth: '1981-05-26',
    gender: 'Male',
    skill_level: 'Advanced',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Competitive spirit'
  },
  {
    first_name: 'Jennifer',
    last_name: 'Rodriguez',
    email: 'jennifer.rodriguez@email.com',
    phone: '555-0118',
    date_of_birth: '1990-12-09',
    gender: 'Female',
    skill_level: 'Intermediate',
    position: 'Left',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Steady and reliable'
  },
  {
    first_name: 'Brian',
    last_name: 'Lewis',
    email: 'brian.lewis@email.com',
    phone: '555-0119',
    date_of_birth: '1987-04-02',
    gender: 'Male',
    skill_level: 'Beginner',
    position: 'Right',
    status: 'active',
    membership_type: 'Regular',
    notes: 'Former badminton player'
  },
  {
    first_name: 'Ashley',
    last_name: 'Lee',
    email: 'ashley.lee@email.com',
    phone: '555-0120',
    date_of_birth: '1996-09-17',
    gender: 'Female',
    skill_level: 'Advanced',
    position: 'Right',
    status: 'active',
    membership_type: 'Premium',
    notes: 'Rising star'
  }
]

async function addSamplePlayers() {
  console.log('Adding sample players...')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')
  
  try {
    // First, check what tables exist
    console.log('Checking what tables exist...')
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables')
    
    if (tablesError) {
      console.log('RPC call failed, trying direct query...')
      // Try a more direct approach to check tables
      const { data: directData, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (directError) {
        console.error('Cannot check tables:', directError)
        // Let's just try to check if players table exists by querying it
        console.log('Trying to query players table directly...')
        const { data: testData, error: testError } = await supabase
          .from('players')
          .select('count')
          .limit(1)
        
        if (testError) {
          console.error('Players table test failed:', testError)
          return
        }
        
        console.log('Players table exists!')
      } else {
        console.log('Available tables:', directData.map(t => t.table_name))
      }
    } else {
      console.log('Available tables:', tablesData)
    }
    
    // Now try to insert players
    const { data, error } = await supabase
      .from('players')
      .insert(samplePlayers)
      .select()
    
    if (error) {
      console.error('Error adding players:')
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Code:', error.code)
      return
    }
    
    console.log(`Successfully added ${data.length} players:`)
    data.forEach(player => {
      console.log(`- ${player.first_name} ${player.last_name} (${player.skill_level})`)
    })
    
  } catch (err) {
    console.error('Script error:', err)
  }
}

addSamplePlayers()
