import { calculateOptimalTeamSizes, buildParticipantsForMatch } from './src/lib/utils/team-utils.js';
import { Player } from './src/types/match';

// Test cases for different player counts and preferred team sizes
const testCases = [
  // Preferred team size 3
  { players: 9, preferredSize: 3, description: "9 players, prefer size 3" },
  { players: 10, preferredSize: 3, description: "10 players, prefer size 3" },
  { players: 12, preferredSize: 3, description: "12 players, prefer size 3" },
  { players: 15, preferredSize: 3, description: "15 players, prefer size 3" },
  
  // Preferred team size 4
  { players: 8, preferredSize: 4, description: "8 players, prefer size 4" },
  { players: 10, preferredSize: 4, description: "10 players, prefer size 4" },
  { players: 12, preferredSize: 4, description: "12 players, prefer size 4" },
  { players: 16, preferredSize: 4, description: "16 players, prefer size 4" },
  
  // Preferred team size 5
  { players: 10, preferredSize: 5, description: "10 players, prefer size 5" },
  { players: 12, preferredSize: 5, description: "12 players, prefer size 5" },
  { players: 15, preferredSize: 5, description: "15 players, prefer size 5" },
  { players: 20, preferredSize: 5, description: "20 players, prefer size 5" },
];

function createMockPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    first_name: `Player${i + 1}`,
    last_name: 'Test',
    skill_level: 'Intermediate' as any,
    email: `player${i + 1}@test.com`,
    phone: '',
    member_since: new Date().toISOString(),
    status: 'active' as any,
    profile_picture_url: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function countPlayersPerTeam(participants: any[]): Record<string, number> {
  return participants.reduce((acc, participant) => {
    acc[participant.team] = (acc[participant.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

console.log('=== TEAM DISTRIBUTION BUG REPRODUCTION REPORT ===\n');

let bugCount = 0;
let totalTests = 0;

testCases.forEach(({ players, preferredSize, description }) => {
  totalTests++;
  console.log(`\n--- ${description} ---`);
  
  try {
    // Test calculateOptimalTeamSizes
    const optimalSizes = calculateOptimalTeamSizes(players, preferredSize);
    console.log(`Expected teams: ${optimalSizes.teamCount}`);
    console.log(`Expected distribution: ${optimalSizes.playersPerTeam.join(', ')}`);
    console.log(`Valid: ${optimalSizes.isValid}`);
    
    // Test buildParticipantsForMatch
    const mockPlayers = createMockPlayers(players);
    const result = buildParticipantsForMatch(mockPlayers, preferredSize);
    const actualDistribution = countPlayersPerTeam(result.participants);
    
    console.log(`Actual teams: ${result.teamCount}`);
    console.log(`Actual distribution:`, actualDistribution);
    
    // Check for mismatches
    const expectedTeamSizes = optimalSizes.playersPerTeam.sort((a, b) => a - b);
    const actualTeamSizes = Object.values(actualDistribution).sort((a, b) => a - b);
    
    const sizesMismatch = JSON.stringify(expectedTeamSizes) !== JSON.stringify(actualTeamSizes);
    const teamCountMismatch = optimalSizes.teamCount !== result.teamCount;
    
    if (sizesMismatch || teamCountMismatch) {
      bugCount++;
      console.log('❌ BUG DETECTED: Mismatch between expected and actual team distribution!');
      if (teamCountMismatch) {
        console.log(`   Team count mismatch: expected ${optimalSizes.teamCount}, got ${result.teamCount}`);
      }
      if (sizesMismatch) {
        console.log(`   Size mismatch: expected [${expectedTeamSizes}], got [${actualTeamSizes}]`);
      }
    } else {
      console.log('✅ Distribution matches expected behavior');
    }
    
    // Additional checks
    const totalPlayersAssigned = Object.values(actualDistribution).reduce((sum, count) => sum + count, 0);
    if (totalPlayersAssigned !== players) {
      console.log(`❌ CRITICAL BUG: Player count mismatch! Expected ${players}, assigned ${totalPlayersAssigned}`);
      bugCount++;
    }
    
  } catch (error: any) {
    console.log(`❌ ERROR: ${error.message}`);
    bugCount++;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total tests: ${totalTests}`);
console.log(`Bugs found: ${bugCount}`);
console.log(`Success rate: ${((totalTests - bugCount) / totalTests * 100).toFixed(1)}%`);

if (bugCount > 0) {
  console.log('\n🚨 BUGS DETECTED: Team distribution logic has issues that need to be fixed.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed: Team distribution logic is working correctly.');
  process.exit(0);
}
