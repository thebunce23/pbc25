import { calculateOptimalTeamSizes, buildParticipantsForMatch } from './team-utils'
import { Player } from '@/types/match'

/**
 * Helper function to create mock players
 */
function createMockPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    first_name: `Player${i + 1}`,
    last_name: 'Test',
    skill_level: 'Intermediate'
  }))
}

/**
 * Helper function to count players per team from participants
 */
function countPlayersPerTeam(participants: any[]): Record<string, number> {
  return participants.reduce((acc, participant) => {
    acc[participant.team] = (acc[participant.team] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

describe('Team Generation Bug Reproduction Tests', () => {
  
  describe('BUG 1: Hard-coded defaults override preferred size', () => {
    test('calculateOptimalTeamSizes should work with less than 6 players when preferred size is 2', () => {
      // BUG: Function returns invalid for 4 players with preferred size 2
      // Expected: Should be valid since 2 teams of 2 players each = 4 total
      const result = calculateOptimalTeamSizes(4, 2)
      
      console.log('BUG 1 Test Result:', result)
      
      // This will currently FAIL due to hard-coded minimum of 6 players
      expect(result.isValid).toBe(true)  // Expected: true, Actual: false
      expect(result.teamCount).toBe(2)
      expect(result.playersPerTeam).toEqual([2, 2])
    })

    test('calculateOptimalTeamSizes should work with 5 players when preferred size is 2', () => {
      // BUG: Function returns invalid for 5 players with preferred size 2
      // Expected: Should be valid - could create 2 teams of 2 and 3 players
      const result = calculateOptimalTeamSizes(5, 2)
      
      console.log('BUG 1 Test Result (5 players):', result)
      
      // This will currently FAIL due to hard-coded minimum of 6 players
      expect(result.isValid).toBe(true)  // Expected: true, Actual: false
      expect(result.teamCount).toBe(2)
      expect(result.playersPerTeam).toEqual([2, 3])
    })
  })

  describe('BUG 2: Off-by-one errors in buildParticipantsForMatch', () => {
    test('buildParticipantsForMatch should handle 10 players with preferred size 3 correctly', () => {
      // BUG: The function may not correctly handle remainder logic
      // 10 players with preferred size 3 should create 3 teams of 3 + 1 team of 1
      // But logic might drop the single player team
      const players = createMockPlayers(10)
      const result = buildParticipantsForMatch(players, 3)
      
      console.log('BUG 2 Test Result (10 players, size 3):', {
        teamCount: result.teamCount,
        participantsCount: result.participants.length,
        distribution: countPlayersPerTeam(result.participants)
      })
      
      // Should include ALL players, not drop any
      expect(result.participants.length).toBe(10)  // All players should be included
      
      // Check that no players are dropped
      const playerIds = result.participants.map(p => p.playerId)
      const expectedPlayerIds = players.map(p => p.id)
      expect(playerIds.sort()).toEqual(expectedPlayerIds.sort())
    })

    test('buildParticipantsForMatch should handle 5 players with preferred size 2 correctly', () => {
      // BUG: May not handle edge case properly
      // 5 players with preferred size 2 should create teams, not return empty
      const players = createMockPlayers(5)
      const result = buildParticipantsForMatch(players, 2)
      
      console.log('BUG 2 Test Result (5 players, size 2):', {
        teamCount: result.teamCount,
        participantsCount: result.participants.length,
        distribution: countPlayersPerTeam(result.participants)
      })
      
      // Should create teams and include all players
      expect(result.teamCount).toBeGreaterThan(0)
      expect(result.participants.length).toBe(5)
    })
  })

  describe('BUG 3: Remainder handling divergence between functions', () => {
    test('calculateOptimalTeamSizes and buildParticipantsForMatch should agree on 11 players with size 4', () => {
      // BUG: Different remainder handling logic may cause divergence
      const players = createMockPlayers(11)
      
      const optimalSizes = calculateOptimalTeamSizes(11, 4)
      const participantsResult = buildParticipantsForMatch(players, 4)
      
      console.log('BUG 3 Test - calculateOptimalTeamSizes result:', optimalSizes)
      console.log('BUG 3 Test - buildParticipantsForMatch result:', {
        teamCount: participantsResult.teamCount,
        distribution: countPlayersPerTeam(participantsResult.participants)
      })
      
      // Both functions should produce consistent results
      expect(participantsResult.teamCount).toBe(optimalSizes.teamCount)
      
      // Team sizes should match between functions
      const actualTeamSizes = Object.values(countPlayersPerTeam(participantsResult.participants))
      expect(actualTeamSizes.sort()).toEqual(optimalSizes.playersPerTeam.sort())
    })

    test('Functions should agree on 14 players with size 5', () => {
      // BUG: Remainder handling may differ between functions
      const players = createMockPlayers(14)
      
      const optimalSizes = calculateOptimalTeamSizes(14, 5)
      const participantsResult = buildParticipantsForMatch(players, 5)
      
      console.log('BUG 3 Test (14 players) - calculateOptimalTeamSizes result:', optimalSizes)
      console.log('BUG 3 Test (14 players) - buildParticipantsForMatch result:', {
        teamCount: participantsResult.teamCount,
        distribution: countPlayersPerTeam(participantsResult.participants)
      })
      
      // Both functions should produce consistent results
      expect(participantsResult.teamCount).toBe(optimalSizes.teamCount)
      
      // All players should be assigned
      expect(participantsResult.participants.length).toBe(14)
    })
  })

  describe('BUG 4: Hard-coded minimum team size of 3 in createBalancedTeams', () => {
    test('createBalancedTeams should create teams smaller than 3 when preferred size is 2', () => {
      // This test requires us to test the createBalancedTeams function directly
      // BUG: Line 600 in page.tsx has `if (team.length >= 3)` which may reject smaller teams
      
      // We need to simulate this by checking if buildParticipantsForMatch works with size 2
      const players = createMockPlayers(6)
      const result = buildParticipantsForMatch(players, 2)
      
      console.log('BUG 4 Test Result (6 players, size 2):', {
        teamCount: result.teamCount,
        distribution: countPlayersPerTeam(result.participants)
      })
      
      // Should create 3 teams of 2 players each
      expect(result.teamCount).toBe(3)
      expect(result.participants.length).toBe(6)
      
      const distribution = countPlayersPerTeam(result.participants)
      Object.values(distribution).forEach(count => {
        expect(count).toBe(2)  // Each team should have exactly 2 players
      })
    })
  })

  describe('BUG 5: Preferred team size validation inconsistency', () => {
    test('buildParticipantsForMatch should respect preferred size even when optimal path fails', () => {
      // BUG: Lines 83-84 in buildParticipantsForMatch only use optimal sizes 
      // if optimalTeamSizes.teamSize === preferredTeamSize
      // This may cause it to ignore valid but non-optimal configurations
      
      const players = createMockPlayers(7)
      const result = buildParticipantsForMatch(players, 3)
      
      console.log('BUG 5 Test Result (7 players, size 3):', {
        teamCount: result.teamCount,
        distribution: countPlayersPerTeam(result.participants),
        optimalSizes: calculateOptimalTeamSizes(7, 3)
      })
      
      // Should create teams based on preferred size, not fall back to different logic
      expect(result.participants.length).toBe(7)
      expect(result.teamCount).toBeGreaterThan(0)
      
      // Should try to respect preferred team size as much as possible
      const distribution = countPlayersPerTeam(result.participants)
      const teamSizes = Object.values(distribution)
      const closestToPreferred = teamSizes.filter(size => size === 3)
      
      // At least some teams should be close to preferred size
      expect(closestToPreferred.length).toBeGreaterThan(0)
    })
  })

  describe('Integration Bug: End-to-end scenario reproduction', () => {
    test('should handle the specific failing runtime scenario', () => {
      // This test reproduces the exact scenario that's failing in runtime
      // Based on the task description, this should mirror the failing scenario
      
      // Scenario: User selects preferred team size but gets different behavior
      const scenarios = [
        { players: 8, preferredSize: 3, expectedBehavior: 'Should create 2 teams of 3 and 1 team of 2' },
        { players: 10, preferredSize: 4, expectedBehavior: 'Should create 2 teams of 4 and handle remainder' },
        { players: 12, preferredSize: 5, expectedBehavior: 'Should create 2 teams of 5 and handle remainder' }
      ]
      
      scenarios.forEach(({ players, preferredSize, expectedBehavior }) => {
        console.log(`\nTesting scenario: ${players} players, preferred size ${preferredSize}`)
        console.log(`Expected behavior: ${expectedBehavior}`)
        
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, preferredSize)
        
        console.log('Actual result:', {
          teamCount: result.teamCount,
          participantsCount: result.participants.length,
          distribution: countPlayersPerTeam(result.participants)
        })
        
        // Basic sanity checks
        expect(result.participants.length).toBe(players)
        expect(result.teamCount).toBeGreaterThan(0)
        
        // Check that the preferred size is respected where possible
        const distribution = countPlayersPerTeam(result.participants)
        const teamSizes = Object.values(distribution)
        
        // At least one team should be close to preferred size
        const teamsAtPreferredSize = teamSizes.filter(size => size === preferredSize)
        expect(teamsAtPreferredSize.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Specific Edge Cases from Runtime Issues', () => {
    test('should handle exactly 4 players with preferred size 2 (doubles scenario)', () => {
      // This is a common scenario that should work perfectly
      const players = createMockPlayers(4)
      const result = buildParticipantsForMatch(players, 2)
      
      console.log('Doubles scenario result:', {
        teamCount: result.teamCount,
        distribution: countPlayersPerTeam(result.participants)
      })
      
      expect(result.teamCount).toBe(2)
      expect(result.participants.length).toBe(4)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(Object.values(distribution)).toEqual([2, 2])
    })

    test('should handle 9 players with preferred size 3 (perfect division)', () => {
      // Perfect division case that should work flawlessly
      const players = createMockPlayers(9)
      const result = buildParticipantsForMatch(players, 3)
      
      console.log('Perfect division result:', {
        teamCount: result.teamCount,
        distribution: countPlayersPerTeam(result.participants)
      })
      
      expect(result.teamCount).toBe(3)
      expect(result.participants.length).toBe(9)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(Object.values(distribution)).toEqual([3, 3, 3])
    })
  })
})
