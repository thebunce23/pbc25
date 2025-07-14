/**
 * Manual QA script for team generation
 * Test team generation following the QA matrix:
 * | Preferred Team Size | Total Players | Expected per Match | Should generate |
 * | 3 | 18 | 6 | ✅ |
 * | 4 | 10 | 8 | Warn "not enough players" |
 * | 5 | 30 | 10 | ✅ |
 */

// Import the functions (adjust paths as needed)
const { calculateOptimalTeamSizes } = require('../src/lib/utils/team-utils.ts');

console.log('=== Manual QA: Team Generation Matrix ===\n');

// Test cases from the QA matrix
const testMatrix = [
  { players: 18, teamSize: 3, expectedPerMatch: 6, shouldGenerate: true },
  { players: 10, teamSize: 4, expectedPerMatch: 8, shouldGenerate: false },
  { players: 30, teamSize: 5, expectedPerMatch: 10, shouldGenerate: true }
];

testMatrix.forEach((test, index) => {
  console.log(`\n--- Test ${index + 1}: ${test.players} players, team size ${test.teamSize} ---`);
  
  const result = calculateOptimalTeamSizes(test.players, test.teamSize);
  
  console.log(`Valid configuration: ${result.isValid}`);
  console.log(`Description: ${result.description}`);
  console.log(`Team count: ${result.teamCount}`);
  console.log(`Players per team: [${result.playersPerTeam.join(', ')}]`);
  
  // Calculate expected results
  const totalPlayersInTeams = result.playersPerTeam.reduce((sum, size) => sum + size, 0);
  const playersPerMatch = result.teamCount === 2 ? totalPlayersInTeams : Math.min(4, totalPlayersInTeams); // Assuming 2 teams per match
  
  console.log(`\nExpected vs Actual:`);
  console.log(`  Expected per match: ${test.expectedPerMatch}`);
  console.log(`  Actual per match: ${playersPerMatch}`);
  console.log(`  Should generate: ${test.shouldGenerate ? 'Yes' : 'No (warn not enough players)'}`);
  console.log(`  Actually generates: ${result.isValid ? 'Yes' : 'No'}`);
  
  console.log(`\nValidation:`);
  console.log(`  Total players assigned: ${totalPlayersInTeams}`);
  console.log(`  All players assigned: ${totalPlayersInTeams === test.players ? '✓' : '✗'}`);
  console.log(`  All teams have ≥3 players: ${result.playersPerTeam.every(size => size >= 3) ? '✓' : '✗'}`);
  console.log(`  Test expectation match: ${result.isValid === test.shouldGenerate ? '✓' : '✗'}`);
  
  if (!test.shouldGenerate && result.isValid) {
    console.log('  ⚠️  WARNING: Expected "not enough players" but got valid configuration');
  }
  if (test.shouldGenerate && !result.isValid) {
    console.log('  ❌ ERROR: Expected valid configuration but got invalid result');
  }
});

console.log('\n=== QA Complete ===');
