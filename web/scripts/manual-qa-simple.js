/**
 * Simple Manual QA script for team generation
 * Test team generation following the QA matrix:
 * | Preferred Team Size | Total Players | Expected per Match | Should generate |
 * | 3 | 18 | 6 | ✅ |
 * | 4 | 10 | 8 | Warn "not enough players" |
 * | 5 | 30 | 10 | ✅ |
 */

// Simple mock for testing without imports
function calculateOptimalTeamSizes(totalPlayers, preferredTeamSize) {
  // Not enough players for team matches
  if (totalPlayers < 6) {
    return {
      teamSize: 0,
      teamCount: 0,
      playersPerTeam: [],
      isValid: false,
      description: 'Not enough players for team matches (minimum 6 required)',
      options: []
    };
  }

  // Calculate team configurations based on preferred size
  const configurations = [];
  const size = preferredTeamSize || 3;
  const evenTeams = Math.floor(totalPlayers / size);
  const remainder = totalPlayers % size;
  
  if (evenTeams >= 2) {
    if (remainder === 0) {
      // Perfect division
      const playersPerTeam = Array(evenTeams).fill(size);
      configurations.push({
        teamSize: size,
        teamCount: evenTeams,
        playersPerTeam,
        description: `${evenTeams} teams of ${size} players each`,
        efficiency: 100,
        isOptimal: true
      });
    } else if (remainder >= 2) {
      // Mixed sizes
      const largerTeamSize = size + remainder;
      if (largerTeamSize <= 6) {
        const playersPerTeam = [
          ...Array(evenTeams - 1).fill(size),
          largerTeamSize
        ];
        configurations.push({
          teamSize: size,
          teamCount: evenTeams,
          playersPerTeam,
          description: `${evenTeams - 1} teams of ${size} players + 1 team of ${largerTeamSize} players`,
          efficiency: 100,
          isOptimal: false
        });
      }
    }
  }
  
  const bestConfiguration = configurations[0];
  
  if (!bestConfiguration) {
    return {
      teamSize: 0,
      teamCount: 0,
      playersPerTeam: [],
      isValid: false,
      description: 'Unable to create balanced teams with current player count',
      options: []
    };
  }

  return {
    teamSize: bestConfiguration.teamSize,
    teamCount: bestConfiguration.teamCount,
    playersPerTeam: bestConfiguration.playersPerTeam,
    isValid: true,
    description: bestConfiguration.description,
    options: configurations
  };
}

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
