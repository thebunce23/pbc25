#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupPlayersTable() {
  console.log('Setting up players table...')
  
  try {
    // First, try to create the players table
    console.log('Creating players table...')
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS players (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          first_name text NOT NULL,
          last_name text NOT NULL,
          email text UNIQUE NOT NULL,
          phone text,
          date_of_birth date,
          gender text CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
          skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')) DEFAULT 'Beginner',
          position text,
          emergency_contact jsonb DEFAULT '{}',
          address jsonb DEFAULT '{}',
          medical_info text,
          status text CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
          membership_type text DEFAULT 'Regular',
          join_date date DEFAULT CURRENT_DATE,
          notes text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })
    
    if (createError) {
      console.error('Error creating table via RPC:', createError)
      
      // Try using the SQL Editor approach
      console.log('Trying direct SQL approach...')
      const { error: directError } = await supabase
        .from('_realtime')
        .select('*')
        .limit(1)
      
      // This will fail, but let's try a simpler approach
      console.log('Tables might not exist yet. Let me try another approach...')
      
      // Let's just try the insert and see what happens
      console.log('Attempting to insert directly...')
      const samplePlayer = {
        first_name: 'Test',
        last_name: 'Player',
        email: 'test@example.com',
        skill_level: 'Beginner',
        status: 'active',
        membership_type: 'Regular'
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('players')
        .insert([samplePlayer])
        .select()
      
      if (insertError) {
        console.error('Insert failed:', insertError)
        console.log('It seems the players table does not exist. Please check your Supabase dashboard.')
        return
      }
      
      console.log('Insert succeeded! Players table exists.')
      console.log('Inserted:', insertData)
      
    } else {
      console.log('Players table created successfully')
    }
    
    // Now try adding all the sample players
    console.log('Adding sample players...')
    
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
      }
      // Add more players as needed
    ]
    
    const { data, error } = await supabase
      .from('players')
      .insert(samplePlayers)
      .select()
    
    if (error) {
      console.error('Error adding players:', error)
    } else {
      console.log(`Successfully added ${data.length} players`)
    }
    
  } catch (err) {
    console.error('Script error:', err)
  }
}

setupPlayersTable()
