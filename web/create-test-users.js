#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestUsers() {
  console.log('👥 Creating test users for booking system...\n')
  
  try {
    const testUsers = [
      {
        email: 'alice.cooper@email.com',
        first_name: 'Alice',
        last_name: 'Cooper'
      },
      {
        email: 'bob.smith@email.com',
        first_name: 'Bob',
        last_name: 'Smith'
      },
      {
        email: 'carol.jones@email.com',
        first_name: 'Carol',
        last_name: 'Jones'
      },
      {
        email: 'david.brown@email.com',
        first_name: 'David',
        last_name: 'Brown'
      },
      {
        email: 'emma.wilson@email.com',
        first_name: 'Emma',
        last_name: 'Wilson'
      }
    ]
    
    const { data: users, error } = await supabase
      .from('users')
      .insert(testUsers)
      .select()
    
    if (error) {
      console.error('❌ Error creating users:', error)
      return
    }
    
    console.log(`✅ Created ${users.length} test users:`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`)
    })
    
    console.log('\n🎯 Test users created successfully!')
    console.log('Now you can run court booking tests!')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

createTestUsers()
