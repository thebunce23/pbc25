#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createAdminUser() {
  console.log('👑 Creating admin user for PBC25...\n')
  
  const adminEmail = 'admin@pbc25.com'
  const adminPassword = 'admin123!' // You can change this
  
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: 'PBC25 Admin',
        role: 'admin'
      }
    })
    
    if (error) {
      console.error('❌ Error creating admin user:', error)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 User ID:', data.user.id)
    
    console.log('\n🚀 You can now login to your app with:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')
    
  } catch (err) {
    console.error('💥 Script error:', err)
  }
}

createAdminUser()
