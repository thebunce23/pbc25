#!/usr/bin/env node

/**
 * Team Sizing Verification Script
 * Tests the team sizing algorithm with various player counts and team sizes
 * This script validates the logic that the UI implements
 */

const { calculateOptimalTeamSizes, buildParticipantsForMatch } = require('./src/lib/utils/team-utils');

// Mock player data for testing
function createMockPlayers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    first_name: `Player${i + 1}`,
    last_name: 'Test',
    skill_level: ['Beginner', 'Intermediate', 'Advanced'][i % 3]
  }));
}

// Helper function to count players per team
function countPlayersPerTeam(participants) {
  return participants.reduce((acc, participant) => {
    acc[participant.team] = (acc[participant.team] || 0) + 1;
    return acc;
  }, {});
}

// Test scenarios that match the manual QA testing
const testScenarios = [
  // Test 1: Team Size 3 Players
  {
    name: 'Team Size 3 - 20 Players',
    players: 20,
    teamSize: 3,
    expectedTeams: 6,
    expectedDistribution: [3, 3, 3, 3, 3, 5]
  },
  {
    name: 'Team Size 3 - 18 Players',
    players: 18,
    teamSize: 3,
    expectedTeams: 6,
    expectedDistribution: [3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Team Size 3 - 10 Players',
    players: 10,
    teamSize: 3,
    expectedTeams: 3,
    expectedDistribution: [3, 3, 4]
  },
  
  // Test 2: Team Size 4 Players
  {
    name: 'Team Size 4 - 16 Players',
    players: 16,
    teamSize: 4,
    expectedTeams: 4,
    expectedDistribution: [4, 4, 4, 4]
  },
  {
    name: 'Team Size 4 - 14 Players',
    players: 14,
    teamSize: 4,
    expectedTeams: 3,
    expectedDistribution: [4, 4, 6]
  },
  {
    name: 'Team Size 4 - 18 Players',
    players: 18,
    teamSize: 4,
    expectedTeams: 4,
    expectedDistribution: [4, 4, 4, 6]
  },
  
  // Test 3: Team Size 5 Players
  {
    name: 'Team Size 5 - 15 Players',
    players: 15,
    teamSize: 5,
    expectedTeams: 3,
    expectedDistribution: [5, 5, 5]
  },
  {
    name: 'Team Size 5 - 18 Players',
    players: 18,
    teamSize: 5,
    expectedTeams: 3,
    expectedDistribution: [5, 5, 8]
  },
  {
    name: 'Team Size 5 - 20 Players',
    players: 20,
    teamSize: 5,
    expectedTeams: 4,
    expectedDistribution: [5, 5, 5, 5]
  }
];

console.log('🏆 Team Sizing Algorithm Verification');
console.log('=====================================\n');

let passCount = 0;
let failCount = 0;

testScenarios.forEach((scenario, index) => {
  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(`Players: ${scenario.players}, Team Size: ${scenario.teamSize}`);
  
  try {
    // Test the optimal team sizes calculation
    const optimalSizes = calculateOptimalTeamSizes(scenario.players, scenario.teamSize);
    
    console.log(`Expected Teams: ${scenario.expectedTeams}`);
    console.log(`Actual Teams: ${optimalSizes.teamCount}`);
    console.log(`Expected Distribution: [${scenario.expectedDistribution.join(', ')}]`);
    console.log(`Actual Distribution: [${optimalSizes.playersPerTeam.join(', ')}]`);
    
    // Verify team count
    const teamCountMatch = optimalSizes.teamCount === scenario.expectedTeams;
    
    // Verify distribution
    const distributionMatch = JSON.stringify(optimalSizes.playersPerTeam) === JSON.stringify(scenario.expectedDistribution);
    
    // Verify total players
    const totalPlayersInTeams = optimalSizes.playersPerTeam.reduce((sum, size) => sum + size, 0);
    const totalPlayersMatch = totalPlayersInTeams === scenario.players;
    
    if (teamCountMatch && distributionMatch && totalPlayersMatch) {
      console.log('✅ PASS - Team sizing calculation correct\n');
      
      // Test the participant building
      const mockPlayers = createMockPlayers(scenario.players);
      const participantResult = buildParticipantsForMatch(mockPlayers, scenario.teamSize);
      
      const actualDistribution = countPlayersPerTeam(participantResult.participants);
      const actualTeamSizes = Object.values(actualDistribution).sort((a, b) => a - b);
      const expectedTeamSizes = scenario.expectedDistribution.sort((a, b) => a - b);
      
      const participantMatch = JSON.stringify(actualTeamSizes) === JSON.stringify(expectedTeamSizes);
      
      if (participantMatch) {
        console.log('✅ PASS - Participant assignment correct\n');
        passCount++;
      } else {
        console.log('❌ FAIL - Participant assignment incorrect');
        console.log(`Expected: [${expectedTeamSizes.join(', ')}]`);
        console.log(`Actual: [${actualTeamSizes.join(', ')}]\n`);
        failCount++;
      }
    } else {
      console.log('❌ FAIL - Team sizing calculation incorrect');
      if (!teamCountMatch) console.log(`  Team count mismatch: expected ${scenario.expectedTeams}, got ${optimalSizes.teamCount}`);
      if (!distributionMatch) console.log(`  Distribution mismatch`);
      if (!totalPlayersMatch) console.log(`  Total players mismatch: expected ${scenario.players}, got ${totalPlayersInTeams}`);
      console.log();
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}\n`);
    failCount++;
  }
});

console.log('=====================================');
console.log(`Results: ${passCount} passed, ${failCount} failed`);

if (failCount === 0) {
  console.log('🎉 All tests passed! Team sizing algorithm is working correctly.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the algorithm.');
  process.exit(1);
}
