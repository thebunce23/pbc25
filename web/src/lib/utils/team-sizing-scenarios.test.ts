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

describe('Team Sizing Scenarios - calculateOptimalTeamSizes', () => {
  describe('Player counts 6-20 with preferred team size 3', () => {
    const testCases = [
      // Perfect divisions
      { players: 6, expectedTeams: 2, expectedSizes: [3, 3], isOptimal: true },
      { players: 9, expectedTeams: 3, expectedSizes: [3, 3, 3], isOptimal: true },
      { players: 12, expectedTeams: 4, expectedSizes: [3, 3, 3, 3], isOptimal: true },
      { players: 15, expectedTeams: 5, expectedSizes: [3, 3, 3, 3, 3], isOptimal: true },
      { players: 18, expectedTeams: 6, expectedSizes: [3, 3, 3, 3, 3, 3], isOptimal: true },
      
      // Edge cases with remainder
      { players: 7, expectedTeams: 2, expectedSizes: [3, 4], isOptimal: false },
      { players: 8, expectedTeams: 2, expectedSizes: [3, 5], isOptimal: false },
      { players: 10, expectedTeams: 3, expectedSizes: [3, 3, 4], isOptimal: false },
      { players: 11, expectedTeams: 3, expectedSizes: [3, 3, 5], isOptimal: false },
      { players: 13, expectedTeams: 4, expectedSizes: [3, 3, 3, 4], isOptimal: false },
      { players: 14, expectedTeams: 4, expectedSizes: [3, 3, 3, 5], isOptimal: false },
      { players: 16, expectedTeams: 5, expectedSizes: [3, 3, 3, 3, 4], isOptimal: false },
      { players: 17, expectedTeams: 5, expectedSizes: [3, 3, 3, 3, 5], isOptimal: false },
      { players: 19, expectedTeams: 6, expectedSizes: [3, 3, 3, 3, 3, 4], isOptimal: false },
      { players: 20, expectedTeams: 6, expectedSizes: [3, 3, 3, 3, 3, 5], isOptimal: false },
    ]

    testCases.forEach(({ players, expectedTeams, expectedSizes, isOptimal }) => {
      test(`should handle ${players} players with preferred team size 3`, () => {
        const result = calculateOptimalTeamSizes(players, 3)
        
        expect(result.isValid).toBe(true)
        expect(result.teamSize).toBe(3)
        expect(result.teamCount).toBe(expectedTeams)
        expect(result.playersPerTeam).toEqual(expectedSizes)
        expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(players)
        
        // Check optimal status
        if (isOptimal) {
          expect(result.options[0].isOptimal).toBe(true)
        }
      })
    })
  })

  describe('Player counts 6-20 with preferred team size 4', () => {
    const testCases = [
      // Perfect divisions
      { players: 8, expectedTeams: 2, expectedSizes: [4, 4], isOptimal: true },
      { players: 12, expectedTeams: 3, expectedSizes: [4, 4, 4], isOptimal: true },
      { players: 16, expectedTeams: 4, expectedSizes: [4, 4, 4, 4], isOptimal: true },
      { players: 20, expectedTeams: 5, expectedSizes: [4, 4, 4, 4, 4], isOptimal: true },
      
      // Edge cases with remainder
      { players: 6, expectedTeams: 2, expectedSizes: [4, 4], isOptimal: false }, // Not enough for 2 teams of 4
      { players: 7, expectedTeams: 2, expectedSizes: [4, 4], isOptimal: false }, // Not enough for 2 teams of 4
      { players: 9, expectedTeams: 2, expectedSizes: [4, 5], isOptimal: false },
      { players: 10, expectedTeams: 2, expectedSizes: [4, 6], isOptimal: false },
      { players: 11, expectedTeams: 2, expectedSizes: [4, 7], isOptimal: false }, // Large remainder
      { players: 13, expectedTeams: 3, expectedSizes: [4, 4, 5], isOptimal: false },
      { players: 14, expectedTeams: 3, expectedSizes: [4, 4, 6], isOptimal: false },
      { players: 15, expectedTeams: 3, expectedSizes: [4, 4, 7], isOptimal: false }, // Large remainder
      { players: 17, expectedTeams: 4, expectedSizes: [4, 4, 4, 5], isOptimal: false },
      { players: 18, expectedTeams: 4, expectedSizes: [4, 4, 4, 6], isOptimal: false },
      { players: 19, expectedTeams: 4, expectedSizes: [4, 4, 4, 7], isOptimal: false }, // Large remainder
    ]

    testCases.forEach(({ players, expectedTeams, expectedSizes, isOptimal }) => {
      test(`should handle ${players} players with preferred team size 4`, () => {
        const result = calculateOptimalTeamSizes(players, 4)
        
        if (players < 8) {
          // Not enough players for 2 full teams of 4
          expect(result.isValid).toBe(false)
        } else {
          expect(result.isValid).toBe(true)
          expect(result.teamSize).toBe(4)
          expect(result.teamCount).toBe(expectedTeams)
          expect(result.playersPerTeam).toEqual(expectedSizes)
          expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(players)
          
          // Check optimal status
          if (isOptimal) {
            expect(result.options[0].isOptimal).toBe(true)
          }
        }
      })
    })
  })

  describe('Player counts 6-20 with preferred team size 5', () => {
    const testCases = [
      // Perfect divisions
      { players: 10, expectedTeams: 2, expectedSizes: [5, 5], isOptimal: true },
      { players: 15, expectedTeams: 3, expectedSizes: [5, 5, 5], isOptimal: true },
      { players: 20, expectedTeams: 4, expectedSizes: [5, 5, 5, 5], isOptimal: true },
      
      // Edge cases with remainder
      { players: 6, expectedTeams: 2, expectedSizes: [5, 5], isOptimal: false }, // Not enough for 2 teams of 5
      { players: 7, expectedTeams: 2, expectedSizes: [5, 5], isOptimal: false }, // Not enough for 2 teams of 5
      { players: 8, expectedTeams: 2, expectedSizes: [5, 5], isOptimal: false }, // Not enough for 2 teams of 5
      { players: 9, expectedTeams: 2, expectedSizes: [5, 5], isOptimal: false }, // Not enough for 2 teams of 5
      { players: 11, expectedTeams: 2, expectedSizes: [5, 6], isOptimal: false },
      { players: 12, expectedTeams: 2, expectedSizes: [5, 7], isOptimal: false }, // Large remainder
      { players: 13, expectedTeams: 2, expectedSizes: [5, 8], isOptimal: false }, // Large remainder
      { players: 14, expectedTeams: 2, expectedSizes: [5, 9], isOptimal: false }, // Large remainder
      { players: 16, expectedTeams: 3, expectedSizes: [5, 5, 6], isOptimal: false },
      { players: 17, expectedTeams: 3, expectedSizes: [5, 5, 7], isOptimal: false }, // Large remainder
      { players: 18, expectedTeams: 3, expectedSizes: [5, 5, 8], isOptimal: false }, // Large remainder
      { players: 19, expectedTeams: 3, expectedSizes: [5, 5, 9], isOptimal: false }, // Large remainder
    ]

    testCases.forEach(({ players, expectedTeams, expectedSizes, isOptimal }) => {
      test(`should handle ${players} players with preferred team size 5`, () => {
        const result = calculateOptimalTeamSizes(players, 5)
        
        if (players < 10) {
          // Not enough players for 2 full teams of 5
          expect(result.isValid).toBe(false)
        } else {
          expect(result.isValid).toBe(true)
          expect(result.teamSize).toBe(5)
          expect(result.teamCount).toBe(expectedTeams)
          expect(result.playersPerTeam).toEqual(expectedSizes)
          expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(players)
          
          // Check optimal status
          if (isOptimal) {
            expect(result.options[0].isOptimal).toBe(true)
          }
        }
      })
    })
  })

  describe('Edge cases where totalPlayers mod preferredSize ≠ 0', () => {
    test('should handle 7 players with preferred team size 3 (remainder 1)', () => {
      const result = calculateOptimalTeamSizes(7, 3)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(2)
      expect(result.playersPerTeam).toEqual([3, 4])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(7)
    })

    test('should handle 11 players with preferred team size 4 (remainder 3)', () => {
      const result = calculateOptimalTeamSizes(11, 4)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(2)
      expect(result.playersPerTeam).toEqual([4, 7])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(11)
    })

    test('should handle 13 players with preferred team size 5 (remainder 3)', () => {
      const result = calculateOptimalTeamSizes(13, 5)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(2)
      expect(result.playersPerTeam).toEqual([5, 8])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(13)
    })

    test('should handle 14 players with preferred team size 3 (remainder 2)', () => {
      const result = calculateOptimalTeamSizes(14, 3)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(4)
      expect(result.playersPerTeam).toEqual([3, 3, 3, 5])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(14)
    })

    test('should handle 18 players with preferred team size 4 (remainder 2)', () => {
      const result = calculateOptimalTeamSizes(18, 4)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(4)
      expect(result.playersPerTeam).toEqual([4, 4, 4, 6])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(18)
    })

    test('should handle 19 players with preferred team size 5 (remainder 4)', () => {
      const result = calculateOptimalTeamSizes(19, 5)
      expect(result.isValid).toBe(true)
      expect(result.teamCount).toBe(3)
      expect(result.playersPerTeam).toEqual([5, 5, 9])
      expect(result.playersPerTeam.reduce((sum, size) => sum + size, 0)).toBe(19)
    })
  })
})

describe('Team Sizing Scenarios - buildParticipantsForMatch', () => {
  describe('Player counts 6-20 with preferred team size 3', () => {
    const testCases = [
      // Perfect divisions
      { players: 6, expectedTeams: 2, expectedDistribution: { A: 3, B: 3 } },
      { players: 9, expectedTeams: 3, expectedDistribution: { A: 3, B: 3, C: 3 } },
      { players: 12, expectedTeams: 4, expectedDistribution: { A: 3, B: 3, C: 3, D: 3 } },
      { players: 15, expectedTeams: 5, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 3 } },
      { players: 18, expectedTeams: 6, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 3, F: 3 } },
      
      // Edge cases with remainder
      { players: 7, expectedTeams: 2, expectedDistribution: { A: 3, B: 4 } },
      { players: 8, expectedTeams: 2, expectedDistribution: { A: 3, B: 5 } },
      { players: 10, expectedTeams: 3, expectedDistribution: { A: 3, B: 3, C: 4 } },
      { players: 11, expectedTeams: 3, expectedDistribution: { A: 3, B: 3, C: 5 } },
      { players: 13, expectedTeams: 4, expectedDistribution: { A: 3, B: 3, C: 3, D: 4 } },
      { players: 14, expectedTeams: 4, expectedDistribution: { A: 3, B: 3, C: 3, D: 5 } },
      { players: 16, expectedTeams: 5, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 4 } },
      { players: 17, expectedTeams: 5, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 5 } },
      { players: 19, expectedTeams: 6, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 3, F: 4 } },
      { players: 20, expectedTeams: 6, expectedDistribution: { A: 3, B: 3, C: 3, D: 3, E: 3, F: 5 } },
    ]

    testCases.forEach(({ players, expectedTeams, expectedDistribution }) => {
      test(`should assign ${players} players correctly with preferred team size 3`, () => {
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, 3)
        
        expect(result.teamCount).toBe(expectedTeams)
        expect(result.participants.length).toBe(players)
        
        const actualDistribution = countPlayersPerTeam(result.participants)
        expect(actualDistribution).toEqual(expectedDistribution)
        
        // Verify all players are assigned unique team IDs
        const teamIds = Object.keys(actualDistribution)
        expect(teamIds).toHaveLength(expectedTeams)
        
        // Verify sequential assignment of players
        const playerIds = result.participants.map(p => p.playerId)
        expect(playerIds).toEqual(mockPlayers.map(p => p.id))
      })
    })
  })

  describe('Player counts 6-20 with preferred team size 4', () => {
    const testCases = [
      // Perfect divisions
      { players: 8, expectedTeams: 2, expectedDistribution: { A: 4, B: 4 } },
      { players: 12, expectedTeams: 3, expectedDistribution: { A: 4, B: 4, C: 4 } },
      { players: 16, expectedTeams: 4, expectedDistribution: { A: 4, B: 4, C: 4, D: 4 } },
      { players: 20, expectedTeams: 5, expectedDistribution: { A: 4, B: 4, C: 4, D: 4, E: 4 } },
      
      // Edge cases with remainder
      { players: 9, expectedTeams: 2, expectedDistribution: { A: 4, B: 5 } },
      { players: 10, expectedTeams: 2, expectedDistribution: { A: 4, B: 6 } },
      { players: 11, expectedTeams: 2, expectedDistribution: { A: 4, B: 7 } },
      { players: 13, expectedTeams: 3, expectedDistribution: { A: 4, B: 4, C: 5 } },
      { players: 14, expectedTeams: 3, expectedDistribution: { A: 4, B: 4, C: 6 } },
      { players: 15, expectedTeams: 3, expectedDistribution: { A: 4, B: 4, C: 7 } },
      { players: 17, expectedTeams: 4, expectedDistribution: { A: 4, B: 4, C: 4, D: 5 } },
      { players: 18, expectedTeams: 4, expectedDistribution: { A: 4, B: 4, C: 4, D: 6 } },
      { players: 19, expectedTeams: 4, expectedDistribution: { A: 4, B: 4, C: 4, D: 7 } },
    ]

    testCases.forEach(({ players, expectedTeams, expectedDistribution }) => {
      test(`should assign ${players} players correctly with preferred team size 4`, () => {
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, 4)
        
        if (players < 8) {
          // Handle insufficient players case
          expect(result.teamCount).toBe(2)
          expect(result.participants.length).toBe(players)
          
          const actualDistribution = countPlayersPerTeam(result.participants)
          const teamCounts = Object.values(actualDistribution)
          expect(teamCounts.length).toBe(2)
          expect(teamCounts.reduce((sum, count) => sum + count, 0)).toBe(players)
        } else {
          expect(result.teamCount).toBe(expectedTeams)
          expect(result.participants.length).toBe(players)
          
          const actualDistribution = countPlayersPerTeam(result.participants)
          expect(actualDistribution).toEqual(expectedDistribution)
          
          // Verify all players are assigned unique team IDs
          const teamIds = Object.keys(actualDistribution)
          expect(teamIds).toHaveLength(expectedTeams)
          
          // Verify sequential assignment of players
          const playerIds = result.participants.map(p => p.playerId)
          expect(playerIds).toEqual(mockPlayers.map(p => p.id))
        }
      })
    })
  })

  describe('Player counts 6-20 with preferred team size 5', () => {
    const testCases = [
      // Perfect divisions
      { players: 10, expectedTeams: 2, expectedDistribution: { A: 5, B: 5 } },
      { players: 15, expectedTeams: 3, expectedDistribution: { A: 5, B: 5, C: 5 } },
      { players: 20, expectedTeams: 4, expectedDistribution: { A: 5, B: 5, C: 5, D: 5 } },
      
      // Edge cases with remainder
      { players: 11, expectedTeams: 2, expectedDistribution: { A: 5, B: 6 } },
      { players: 12, expectedTeams: 2, expectedDistribution: { A: 5, B: 7 } },
      { players: 13, expectedTeams: 2, expectedDistribution: { A: 5, B: 8 } },
      { players: 14, expectedTeams: 2, expectedDistribution: { A: 5, B: 9 } },
      { players: 16, expectedTeams: 3, expectedDistribution: { A: 5, B: 5, C: 6 } },
      { players: 17, expectedTeams: 3, expectedDistribution: { A: 5, B: 5, C: 7 } },
      { players: 18, expectedTeams: 3, expectedDistribution: { A: 5, B: 5, C: 8 } },
      { players: 19, expectedTeams: 3, expectedDistribution: { A: 5, B: 5, C: 9 } },
    ]

    testCases.forEach(({ players, expectedTeams, expectedDistribution }) => {
      test(`should assign ${players} players correctly with preferred team size 5`, () => {
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, 5)
        
        if (players < 10) {
          // Handle insufficient players case
          expect(result.teamCount).toBe(2)
          expect(result.participants.length).toBe(players)
          
          const actualDistribution = countPlayersPerTeam(result.participants)
          const teamCounts = Object.values(actualDistribution)
          expect(teamCounts.length).toBe(2)
          expect(teamCounts.reduce((sum, count) => sum + count, 0)).toBe(players)
        } else {
          expect(result.teamCount).toBe(expectedTeams)
          expect(result.participants.length).toBe(players)
          
          const actualDistribution = countPlayersPerTeam(result.participants)
          expect(actualDistribution).toEqual(expectedDistribution)
          
          // Verify all players are assigned unique team IDs
          const teamIds = Object.keys(actualDistribution)
          expect(teamIds).toHaveLength(expectedTeams)
          
          // Verify sequential assignment of players
          const playerIds = result.participants.map(p => p.playerId)
          expect(playerIds).toEqual(mockPlayers.map(p => p.id))
        }
      })
    })
  })

  describe('Edge cases where totalPlayers mod preferredSize ≠ 0', () => {
    test('should handle 7 players with preferred team size 3 (remainder 1)', () => {
      const mockPlayers = createMockPlayers(7)
      const result = buildParticipantsForMatch(mockPlayers, 3)
      
      expect(result.teamCount).toBe(2)
      expect(result.participants.length).toBe(7)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 3, B: 4 })
    })

    test('should handle 11 players with preferred team size 4 (remainder 3)', () => {
      const mockPlayers = createMockPlayers(11)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(2)
      expect(result.participants.length).toBe(11)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 7 })
    })

    test('should handle 13 players with preferred team size 5 (remainder 3)', () => {
      const mockPlayers = createMockPlayers(13)
      const result = buildParticipantsForMatch(mockPlayers, 5)
      
      expect(result.teamCount).toBe(2)
      expect(result.participants.length).toBe(13)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 5, B: 8 })
    })

    test('should handle 14 players with preferred team size 3 (remainder 2)', () => {
      const mockPlayers = createMockPlayers(14)
      const result = buildParticipantsForMatch(mockPlayers, 3)
      
      expect(result.teamCount).toBe(4)
      expect(result.participants.length).toBe(14)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 3, B: 3, C: 3, D: 5 })
    })

    test('should handle 18 players with preferred team size 4 (remainder 2)', () => {
      const mockPlayers = createMockPlayers(18)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(4)
      expect(result.participants.length).toBe(18)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4, D: 6 })
    })

    test('should handle 19 players with preferred team size 5 (remainder 4)', () => {
      const mockPlayers = createMockPlayers(19)
      const result = buildParticipantsForMatch(mockPlayers, 5)
      
      expect(result.teamCount).toBe(3)
      expect(result.participants.length).toBe(19)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 5, B: 5, C: 9 })
    })
  })

  describe('Team ID assignment validation', () => {
    test('should assign correct team IDs for all scenarios', () => {
      const testCases = [
        { players: 6, preferredSize: 3, expectedTeamIds: ['A', 'B'] },
        { players: 9, preferredSize: 3, expectedTeamIds: ['A', 'B', 'C'] },
        { players: 12, preferredSize: 4, expectedTeamIds: ['A', 'B', 'C'] },
        { players: 15, preferredSize: 5, expectedTeamIds: ['A', 'B', 'C'] },
        { players: 20, preferredSize: 4, expectedTeamIds: ['A', 'B', 'C', 'D', 'E'] },
      ]

      testCases.forEach(({ players, preferredSize, expectedTeamIds }) => {
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, preferredSize)
        
        const assignedTeamIds = [...new Set(result.participants.map(p => p.team))].sort()
        expect(assignedTeamIds).toEqual(expectedTeamIds)
      })
    })
  })

  describe('Player assignment order validation', () => {
    test('should assign players sequentially to teams', () => {
      const mockPlayers = createMockPlayers(12)
      const result = buildParticipantsForMatch(mockPlayers, 3)
      
      // Check that players are assigned in order
      const playerIds = result.participants.map(p => p.playerId)
      expect(playerIds).toEqual(mockPlayers.map(p => p.id))
      
      // Check that first 3 players go to team A, next 3 to team B, etc.
      const teamAPlayers = result.participants.filter(p => p.team === 'A')
      const teamBPlayers = result.participants.filter(p => p.team === 'B')
      const teamCPlayers = result.participants.filter(p => p.team === 'C')
      const teamDPlayers = result.participants.filter(p => p.team === 'D')
      
      expect(teamAPlayers.map(p => p.playerId)).toEqual(['player-1', 'player-2', 'player-3'])
      expect(teamBPlayers.map(p => p.playerId)).toEqual(['player-4', 'player-5', 'player-6'])
      expect(teamCPlayers.map(p => p.playerId)).toEqual(['player-7', 'player-8', 'player-9'])
      expect(teamDPlayers.map(p => p.playerId)).toEqual(['player-10', 'player-11', 'player-12'])
    })
  })
})

describe('Comprehensive Edge Case Testing', () => {
  describe('Minimum player requirements', () => {
    test('should handle exactly 6 players (minimum) with different preferred sizes', () => {
      const mockPlayers = createMockPlayers(6)
      
      // With preferred size 3 - should work perfectly
      const result3 = buildParticipantsForMatch(mockPlayers, 3)
      expect(result3.teamCount).toBe(2)
      expect(result3.participants.length).toBe(6)
      
      // With preferred size 4 - should fallback to 2 teams
      const result4 = buildParticipantsForMatch(mockPlayers, 4)
      expect(result4.teamCount).toBe(2)
      expect(result4.participants.length).toBe(6)
      
      // With preferred size 5 - should fallback to 2 teams
      const result5 = buildParticipantsForMatch(mockPlayers, 5)
      expect(result5.teamCount).toBe(2)
      expect(result5.participants.length).toBe(6)
    })
  })

  describe('User reported failing cases', () => {
    test('should handle 12 players with preferred size 4 (user failing case)', () => {
      // This is the specific case the user reported as failing
      // Should create 3 teams of 4 players each, not 6 teams of 2
      const mockPlayers = createMockPlayers(12)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(3)
      expect(result.participants.length).toBe(12)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4 })
      
      // Verify no team has only 2 players
      const teamSizes = Object.values(distribution)
      expect(teamSizes.every(size => size >= 4)).toBe(true)
    })

    test('should handle 8 players with preferred size 4 (perfect division)', () => {
      const mockPlayers = createMockPlayers(8)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(2)
      expect(result.participants.length).toBe(8)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4 })
    })

    test('should handle 16 players with preferred size 4 (perfect division)', () => {
      const mockPlayers = createMockPlayers(16)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(4)
      expect(result.participants.length).toBe(16)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4, D: 4 })
    })
  })

  describe('Edge cases: 22 and 23 players', () => {
    test('should handle 22 players with preferred size 3', () => {
      const mockPlayers = createMockPlayers(22)
      const result = buildParticipantsForMatch(mockPlayers, 3)
      
      expect(result.teamCount).toBe(7)
      expect(result.participants.length).toBe(22)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 3, B: 3, C: 3, D: 3, E: 3, F: 3, G: 4 })
    })

    test('should handle 22 players with preferred size 4', () => {
      const mockPlayers = createMockPlayers(22)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(5)
      expect(result.participants.length).toBe(22)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4, D: 4, E: 6 })
    })

    test('should handle 22 players with preferred size 5', () => {
      const mockPlayers = createMockPlayers(22)
      const result = buildParticipantsForMatch(mockPlayers, 5)
      
      expect(result.teamCount).toBe(4)
      expect(result.participants.length).toBe(22)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 5, B: 5, C: 5, D: 7 })
    })

    test('should handle 23 players with preferred size 3', () => {
      const mockPlayers = createMockPlayers(23)
      const result = buildParticipantsForMatch(mockPlayers, 3)
      
      expect(result.teamCount).toBe(7)
      expect(result.participants.length).toBe(23)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 3, B: 3, C: 3, D: 3, E: 3, F: 3, G: 5 })
    })

    test('should handle 23 players with preferred size 4', () => {
      const mockPlayers = createMockPlayers(23)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(5)
      expect(result.participants.length).toBe(23)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4, D: 4, E: 7 })
    })

    test('should handle 23 players with preferred size 5', () => {
      const mockPlayers = createMockPlayers(23)
      const result = buildParticipantsForMatch(mockPlayers, 5)
      
      expect(result.teamCount).toBe(4)
      expect(result.participants.length).toBe(23)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 5, B: 5, C: 5, D: 8 })
    })
  })

  describe('Large team scenarios', () => {
    test('should handle 24 players with preferred size 4 (perfect division)', () => {
      const mockPlayers = createMockPlayers(24)
      const result = buildParticipantsForMatch(mockPlayers, 4)
      
      expect(result.teamCount).toBe(6)
      expect(result.participants.length).toBe(24)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 4, B: 4, C: 4, D: 4, E: 4, F: 4 })
    })

    test('should handle 25 players with preferred size 5 (perfect division)', () => {
      const mockPlayers = createMockPlayers(25)
      const result = buildParticipantsForMatch(mockPlayers, 5)
      
      expect(result.teamCount).toBe(5)
      expect(result.participants.length).toBe(25)
      
      const distribution = countPlayersPerTeam(result.participants)
      expect(distribution).toEqual({ A: 5, B: 5, C: 5, D: 5, E: 5 })
    })
  })

  describe('Maximum team size constraints', () => {
    test('should not create teams larger than reasonable limits', () => {
      const testCases = [
        { players: 19, preferredSize: 5 }, // Should create teams of [5, 5, 9] - large but acceptable
        { players: 17, preferredSize: 4 }, // Should create teams of [4, 4, 4, 5] - acceptable
        { players: 20, preferredSize: 3 }, // Should create teams of [3, 3, 3, 3, 3, 5] - acceptable
      ]

      testCases.forEach(({ players, preferredSize }) => {
        const mockPlayers = createMockPlayers(players)
        const result = buildParticipantsForMatch(mockPlayers, preferredSize)
        
        expect(result.participants.length).toBe(players)
        
        const distribution = countPlayersPerTeam(result.participants)
        const teamSizes = Object.values(distribution)
        
        // No team should be ridiculously large (more than 10 players)
        expect(Math.max(...teamSizes)).toBeLessThanOrEqual(10)
        
        // All teams should have at least 2 players
        expect(Math.min(...teamSizes)).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Consistency validation', () => {
    test('should produce consistent results across multiple runs', () => {
      const testCases = [
        { players: 11, preferredSize: 3 },
        { players: 14, preferredSize: 4 },
        { players: 17, preferredSize: 5 },
      ]

      testCases.forEach(({ players, preferredSize }) => {
        const mockPlayers = createMockPlayers(players)
        
        // Run the same test multiple times
        const results = Array.from({ length: 5 }, () => 
          buildParticipantsForMatch(mockPlayers, preferredSize)
        )
        
        // All results should be identical
        const first = results[0]
        results.forEach((result, index) => {
          expect(result.teamCount).toBe(first.teamCount)
          expect(result.participants.length).toBe(first.participants.length)
          expect(result.participants).toEqual(first.participants)
        })
      })
    })
  })
})
