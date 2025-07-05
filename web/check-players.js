#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPlayers() {
  console.log('🔍 Checking players in database...')
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching players:', error)
      return
    }
    
    console.log(`\n📊 Found ${data.length} players in the database:`)
    console.log('=' .repeat(80))
    
    data.forEach((player, index) => {
      console.log(`${index + 1}. ${player.first_name} ${player.last_name}`)
      console.log(`   Email: ${player.email}`)
      console.log(`   Skill: ${player.skill_level}`)
      console.log(`   Status: ${player.status}`)
      console.log(`   Created: ${player.created_at}`)
      console.log('   ' + '-'.repeat(40))
    })
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

checkPlayers()
