require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('Creating test users...')

  const testUsers = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    },
    {
      email: 'user@example.com', 
      password: 'user123',
      user_metadata: {
        full_name: 'Regular User',
        role: 'user'
      }
    },
    {
      email: 'demo@example.com',
      password: 'demo123',
      user_metadata: {
        full_name: 'Demo User',
        role: 'user'
      }
    }
  ]

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: user.user_metadata,
      email_confirm: true // Auto-confirm email
    })

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message)
    } else {
      console.log(`✅ Created user: ${user.email}`)
    }
  }

  console.log('Done!')
}

createTestUsers().catch(console.error)
