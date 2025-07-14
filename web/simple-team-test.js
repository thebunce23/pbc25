// Simple test to manually check the team distribution logic
console.log('=== MANUAL TEAM DISTRIBUTION TEST ===\n');

// Test case scenarios that should reveal the bug
const scenarios = [
  {
    name: "12 players, prefer 3 per team",
    players: 12,
    preferredSize: 3,
    expectedTeams: 4,
    expectedSizes: [3, 3, 3, 3]
  },
  {
    name: "10 players, prefer 4 per team", 
    players: 10,
    preferredSize: 4,
    expectedTeams: 2,
    expectedSizes: [4, 6]
  },
  {
    name: "15 players, prefer 5 per team",
    players: 15,
    preferredSize: 5,
    expectedTeams: 3,
    expectedSizes: [5, 5, 5]
  }
];

scenarios.forEach(scenario => {
  console.log(`\n📋 Testing: ${scenario.name}`);
  console.log(`   Expected: ${scenario.expectedTeams} teams with sizes [${scenario.expectedSizes.join(', ')}]`);
  console.log('   Status: Ready for manual UI testing');
});

console.log('\n🚀 Next steps:');
console.log('1. Open http://localhost:3000/matches/generate in browser');
console.log('2. Select the specified number of players for each scenario');
console.log('3. Set the preferred team size');
console.log('4. Generate team matches');
console.log('5. Verify the team distribution matches expectations');
console.log('6. Document any mismatches as bugs');

console.log('\n✅ Manual test scenarios prepared. Server should be running on localhost:3000');
