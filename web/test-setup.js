const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestPlayers() {
  const players = [];
  
  // Add 18 players for testing different team sizes
  for (let i = 1; i <= 18; i++) {
    players.push({
      first_name: `Player${i}`,
      last_name: 'Test',
      email: `player${i}@test.com`,
      phone: `555-000-${i.toString().padStart(4, '0')}`,
      skill_level: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
      status: 'active',
      membership_type: 'regular',
      notes: `Test player ${i} for manual QA`
    });
  }
  
  console.log('Adding test players...');
  const { data, error } = await supabase
    .from('players')
    .insert(players)
    .select();
  
  if (error) {
    console.error('Error adding players:', error);
    return;
  }
  
  console.log(`Successfully added ${data.length} test players`);
  console.log('Players:', data.map(p => `${p.first_name} ${p.last_name}`));
}

addTestPlayers().catch(console.error);
