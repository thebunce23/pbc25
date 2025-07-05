#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCourtBooking() {
  console.log('🏓 Testing Court Booking System...\n')
  
  try {
    // Get courts and users
    const { data: courts } = await supabase
      .from('courts')
      .select('id, name, status, hourly_rate')
      .eq('status', 'active')
    
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(5)
    
    console.log(`📊 Found ${courts.length} active courts and ${users.length} users`)
    
    // Create test bookings for the next few days
    const testBookings = []
    const today = new Date()
    
    // Create various booking scenarios
    const bookingScenarios = [
      {
        court: courts[0],
        user: users[0],
        day: 1, // tomorrow
        hour: 18, // 6 PM
        duration: 1.5, // 1.5 hours
        description: 'Evening practice session'
      },
      {
        court: courts[0],
        user: users[1],
        day: 2, // day after tomorrow
        hour: 19, // 7 PM  
        duration: 1, // 1 hour
        description: 'Singles match'
      },
      {
        court: courts[1],
        user: users[0],
        day: 1, // tomorrow
        hour: 20, // 8 PM
        duration: 2, // 2 hours
        description: 'Doubles tournament practice'
      },
      {
        court: courts[1],
        user: users[2],
        day: 3, // 3 days from now
        hour: 17, // 5 PM
        duration: 1, // 1 hour
        description: 'Skills training'
      },
      {
        court: courts[0],
        user: users[3],
        day: 5, // 5 days from now
        hour: 9, // 9 AM weekend
        duration: 3, // 3 hours
        description: 'Weekend tournament'
      }
    ]
    
    console.log('\\n📅 Creating test bookings...')
    
    bookingScenarios.forEach((scenario, index) => {
      if (scenario.court && scenario.user) {
        const bookingDate = new Date(today)
        bookingDate.setDate(today.getDate() + scenario.day)
        
        const startTime = new Date(bookingDate)
        startTime.setHours(scenario.hour, 0, 0, 0)
        
        const endTime = new Date(startTime)
        endTime.setHours(startTime.getHours() + Math.floor(scenario.duration))
        endTime.setMinutes(startTime.getMinutes() + ((scenario.duration % 1) * 60))
        
        testBookings.push({
          user_id: scenario.user.id,
          court_id: scenario.court.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed'
        })
        
        console.log(`   ${index + 1}. ${scenario.user.first_name} books ${scenario.court.name}`)
        console.log(`      📅 ${bookingDate.toDateString()} ${scenario.hour}:00 - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`)
        console.log(`      💰 Cost: $${(scenario.court.hourly_rate * scenario.duration).toFixed(2)}`)
      }
    })
    
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .insert(testBookings)
      .select(`
        *,
        courts(name, hourly_rate),
        users(first_name, last_name)
      `)
    
    if (bookingError) {
      console.error('❌ Error creating bookings:', bookingError)
      return
    }
    
    console.log(`\\n✅ Created ${bookings.length} bookings successfully!`)
    
    // Display booking summary
    console.log('\\n📋 Booking Summary:')
    console.log('=' .repeat(80))
    
    bookings.forEach((booking, index) => {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      const duration = (endTime - startTime) / (1000 * 60 * 60) // hours
      const cost = booking.courts.hourly_rate * duration
      
      console.log(`${index + 1}. ${booking.users.first_name} ${booking.users.last_name}`)
      console.log(`   Court: ${booking.courts.name}`)
      console.log(`   Date: ${startTime.toDateString()}`)
      console.log(`   Time: ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`)
      console.log(`   Duration: ${duration} hours`)
      console.log(`   Cost: $${cost.toFixed(2)}`)
      console.log(`   Status: ${booking.status}`)
      console.log('   ' + '-'.repeat(40))
    })
    
    // Test booking conflicts
    console.log('\\n🔍 Testing booking conflict detection...')
    
    // Try to book the same time slot
    const conflictBooking = {
      user_id: users[1]?.id,
      court_id: testBookings[0].court_id, 
      start_time: testBookings[0].start_time,
      end_time: testBookings[0].end_time,
      status: 'confirmed'
    }
    
    const { data: conflictTest, error: conflictError } = await supabase
      .from('bookings')
      .insert([conflictBooking])
      .select()
    
    if (conflictError) {
      console.log('❌ Conflict booking prevented (as expected)')
      console.log('   This would require application-level conflict checking')
    } else {
      console.log('⚠️  Conflict booking was allowed - need to add conflict prevention')
    }
    
    // Check court availability for tomorrow
    console.log('\\n📅 Checking court availability for tomorrow...')
    
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)
    
    const { data: tomorrowBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        courts(name)
      `)
      .gte('start_time', tomorrowStart.toISOString())
      .lte('start_time', tomorrowEnd.toISOString())
    
    console.log(`Found ${tomorrowBookings?.length || 0} bookings for tomorrow:`)
    tomorrowBookings?.forEach(booking => {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      console.log(`   ${booking.courts.name}: ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`)
    })
    
    console.log('\\n🎯 COURT BOOKING TEST COMPLETE!')
    console.log('Next: Check your web app at http://localhost:3000/courts to see the bookings!')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

testCourtBooking()
