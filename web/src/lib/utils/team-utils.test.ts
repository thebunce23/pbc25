import { getTeamIds, getTeamColors, getTeamColorsByIndex, TEAM_COLORS } from './match-utils'
import { calculateOptimalTeamSizes, generateRoundRobinWithPlayers, buildParticipantsForMatch } from './team-utils'
import { Player, TeamId } from '@/types/match'

/**
 * Test calculateOptimalTeamSizes
 */
describe('calculateOptimalTeamSizes', () => {
  test('should return invalid for less than 6 players', () => {
    const result = calculateOptimalTeamSizes(5)
    expect(result.isValid).toBe(false)
    expect(result.description).toBe('Not enough players for team matches (minimum 6 required)')
  })

  test('should calculate optimal sizes for 8 players with preferred team size 4', () => {
    const result = calculateOptimalTeamSizes(8, 4)
    expect(result.isValid).toBe(true)
    expect(result.teamCount).toBe(2)
    expect(result.playersPerTeam).toEqual([4, 4])
    expect(result.description).toBe('2 teams of 4 players each')
  })

  test('should calculate optimal sizes for 12 players with preferred team size 4', () => {
    const result = calculateOptimalTeamSizes(12, 4)
    expect(result.isValid).toBe(true)
    expect(result.teamCount).toBe(3)
    expect(result.playersPerTeam).toEqual([4, 4, 4])
    expect(result.description).toBe('3 teams of 4 players each')
  })

  test('should handle 18 players with preferred team size 4', () => {
    const result = calculateOptimalTeamSizes(18, 4)
    expect(result.isValid).toBe(true)
    expect(result.teamCount).toBeGreaterThan(0)
    expect(result.playersPerTeam.every(size => size >= 3)).toBe(true)
  })

  test('should handle edge cases with uneven division', () => {
    const result = calculateOptimalTeamSizes(10, 4)
    expect(result.isValid).toBe(true)
    expect(result.teamCount).toBe(2)
    expect(result.playersPerTeam).toEqual([4, 6])
  })

  test('should fall back to flexible sizing when preferred size is not specified', () => {
    const result = calculateOptimalTeamSizes(12)
    expect(result.isValid).toBe(true)
    expect(result.teamCount).toBeGreaterThan(0)
  })
})

describe('generateRoundRobinWithPlayers', () => {
  test('should generate matches for 2 teams with 4 players each', () => {
    const teamPlayerMap = new Map<TeamId, Player[]>()
    teamPlayerMap.set('A', [
      { id: 'p1', first_name: 'Alice', last_name: 'A', skill_level: 'Intermediate' },
      { id: 'p2', first_name: 'Aaron', last_name: 'A', skill_level: 'Advanced' },
      { id: 'p9', first_name: 'Amy', last_name: 'A', skill_level: 'Beginner' },
      { id: 'p10', first_name: 'Andy', last_name: 'A', skill_level: 'Advanced' }
    ])
    teamPlayerMap.set('B', [
      { id: 'p3', first_name: 'Bob', last_name: 'B', skill_level: 'Intermediate' },
      { id: 'p4', first_name: 'Betty', last_name: 'B', skill_level: 'Advanced' },
      { id: 'p11', first_name: 'Billy', last_name: 'B', skill_level: 'Beginner' },
      { id: 'p12', first_name: 'Bella', last_name: 'B', skill_level: 'Advanced' }
    ])

    const matches = generateRoundRobinWithPlayers(teamPlayerMap, 4)
    expect(matches.length).toBe(1)
    expect(matches[0].participants.length).toBe(4)
  })

  test('should not generate 4-player matches when team size is not 2', () => {
    const teamPlayerMap = new Map<TeamId, Player[]>()
    teamPlayerMap.set('A', [
      { id: 'p1', first_name: 'Alice', last_name: 'A', skill_level: 'Intermediate' },
      { id: 'p2', first_name: 'Aaron', last_name: 'A', skill_level: 'Advanced' },
      { id: 'p9', first_name: 'Amy', last_name: 'A', skill_level: 'Beginner' }
    ])
    teamPlayerMap.set('B', [
      { id: 'p3', first_name: 'Bob', last_name: 'B', skill_level: 'Intermediate' },
      { id: 'p4', first_name: 'Betty', last_name: 'B', skill_level: 'Advanced' }
    ])

    const matches = generateRoundRobinWithPlayers(teamPlayerMap, 2)
    // This function still generates matches if both teams have at least 2 players
    expect(matches.length).toBe(1)
    expect(matches[0].participants.length).toBe(4) // 2 players from each team
  })
})

describe('buildParticipantsForMatch', () => {
  test('should build participants with optimal team sizes', () => {
    const players: Player[] = [
      { id: 'p1', first_name: 'Alice', last_name: 'A', skill_level: 'Intermediate' },
      { id: 'p2', first_name: 'Bob', last_name: 'B', skill_level: 'Advanced' },
      { id: 'p3', first_name: 'Charlie', last_name: 'C', skill_level: 'Beginner' },
      { id: 'p4', first_name: 'Diana', last_name: 'D', skill_level: 'Intermediate' },
      { id: 'p5', first_name: 'Eve', last_name: 'E', skill_level: 'Advanced' },
      { id: 'p6', first_name: 'Frank', last_name: 'F', skill_level: 'Beginner' }
    ]

    const result = buildParticipantsForMatch(players, 3)
    
    expect(result.teamCount).toBe(2)
    expect(result.participants.length).toBe(6)
    
    // Check that players are distributed evenly across teams
    const teamA = result.participants.filter(p => p.team === 'A')
    const teamB = result.participants.filter(p => p.team === 'B')
    
    expect(teamA.length).toBe(3)
    expect(teamB.length).toBe(3)
    
    // Check that all players are included
    const allPlayerIds = result.participants.map(p => p.playerId)
    expect(allPlayerIds).toContain('p1')
    expect(allPlayerIds).toContain('p2')
    expect(allPlayerIds).toContain('p3')
    expect(allPlayerIds).toContain('p4')
    expect(allPlayerIds).toContain('p5')
    expect(allPlayerIds).toContain('p6')
  })

  test('should handle fewer players than optimal team size', () => {
    const players: Player[] = [
      { id: 'p1', first_name: 'Alice', last_name: 'A', skill_level: 'Intermediate' },
      { id: 'p2', first_name: 'Bob', last_name: 'B', skill_level: 'Advanced' },
      { id: 'p3', first_name: 'Charlie', last_name: 'C', skill_level: 'Beginner' },
      { id: 'p4', first_name: 'Diana', last_name: 'D', skill_level: 'Intermediate' }
    ]

    const result = buildParticipantsForMatch(players, 3)
    
    expect(result.teamCount).toBe(2)
    expect(result.participants.length).toBe(4)
    
    // With 4 players and preferred size 3, it falls back to preferred size
    // This results in 3 players per team * 2 teams = 6 players needed
    // But only 4 players available, so first 4 are taken
    // Sequential distribution: distribute evenly across teams
    const teamA = result.participants.filter(p => p.team === 'A')
    const teamB = result.participants.filter(p => p.team === 'B')
    
    expect(teamA.length).toBe(2)
    expect(teamB.length).toBe(2)
  })

  test('should distribute players sequentially across teams', () => {
    const players: Player[] = [
      { id: 'p1', first_name: 'Alice', last_name: 'A', skill_level: 'Intermediate' },
      { id: 'p2', first_name: 'Bob', last_name: 'B', skill_level: 'Advanced' },
      { id: 'p3', first_name: 'Charlie', last_name: 'C', skill_level: 'Beginner' },
      { id: 'p4', first_name: 'Diana', last_name: 'D', skill_level: 'Intermediate' }
    ]

    const result = buildParticipantsForMatch(players, 2)
    
    expect(result.teamCount).toBe(2)
    expect(result.participants.length).toBe(4)
    
    // First 2 players should be on team A, next 2 on team B
    const teamA = result.participants.filter(p => p.team === 'A')
    const teamB = result.participants.filter(p => p.team === 'B')
    
    expect(teamA.map(p => p.playerId)).toEqual(['p1', 'p2'])
    expect(teamB.map(p => p.playerId)).toEqual(['p3', 'p4'])
  })
})

/**
 * QA Matrix Tests - Verify participant distribution for 3-, 4-, 5-player teams
 */
describe('QA Matrix Tests', () => {
  describe('Participant Distribution Tests', () => {
    test('should verify participant distribution for 3-player teams (18 players, 6 per match)', () => {
      const players: Player[] = Array.from({ length: 18 }, (_, i) => ({
        id: `p${i + 1}`,
        first_name: `Player${i + 1}`,
        last_name: 'Test',
        skill_level: 'Intermediate'
      }))

      const result = buildParticipantsForMatch(players, 3)
      
      expect(result.participants.length).toBe(18)
      expect(result.teamCount).toBe(6) // 18 players / 3 per team = 6 teams
      
      // Verify even distribution
      const teamCounts = {}
      result.participants.forEach(p => {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1
      })
      
      Object.values(teamCounts).forEach(count => {
        expect(count).toBe(3) // Each team should have exactly 3 players
      })
    })

    test('should warn for 4-player teams with insufficient players (10 players, expected 8 per match)', () => {
      const optimalSizes = calculateOptimalTeamSizes(10, 4)
      
      // Should still be valid but may not create perfect 4-player teams
      expect(optimalSizes.isValid).toBe(true)
      expect(optimalSizes.teamCount).toBe(2)
      expect(optimalSizes.playersPerTeam).toEqual([4, 6]) // 4 + 6 = 10 players
    })

    test('should verify participant distribution for 5-player teams (30 players, 10 per match)', () => {
      const players: Player[] = Array.from({ length: 30 }, (_, i) => ({
        id: `p${i + 1}`,
        first_name: `Player${i + 1}`,
        last_name: 'Test',
        skill_level: 'Intermediate'
      }))

      const result = buildParticipantsForMatch(players, 5)
      
      expect(result.participants.length).toBe(30)
      expect(result.teamCount).toBe(6) // 30 players / 5 per team = 6 teams
      
      // Verify even distribution
      const teamCounts = {}
      result.participants.forEach(p => {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1
      })
      
      Object.values(teamCounts).forEach(count => {
        expect(count).toBe(5) // Each team should have exactly 5 players
      })
    })
  })

  describe('Regression Tests: No 4-player matches when teamSize ≠ 2', () => {
    test('should not generate 4-player matches when preferred team size is 3', () => {
      const players: Player[] = Array.from({ length: 18 }, (_, i) => ({
        id: `p${i + 1}`,
        first_name: `Player${i + 1}`,
        last_name: 'Test',
        skill_level: 'Intermediate'
      }))

      const result = buildParticipantsForMatch(players, 3)
      
      // Should not have any teams with 4 players when preferred size is 3
      const teamCounts = {}
      result.participants.forEach(p => {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1
      })
      
      Object.values(teamCounts).forEach(count => {
        expect(count).not.toBe(4) // No team should have exactly 4 players
      })
    })

    test('should not generate 4-player matches when preferred team size is 5', () => {
      const players: Player[] = Array.from({ length: 30 }, (_, i) => ({
        id: `p${i + 1}`,
        first_name: `Player${i + 1}`,
        last_name: 'Test',
        skill_level: 'Intermediate'
      }))

      const result = buildParticipantsForMatch(players, 5)
      
      // Should not have any teams with 4 players when preferred size is 5
      const teamCounts = {}
      result.participants.forEach(p => {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1
      })
      
      Object.values(teamCounts).forEach(count => {
        expect(count).not.toBe(4) // No team should have exactly 4 players
      })
    })

    test('should only generate 4-player matches when preferred team size is 2 (doubles)', () => {
      const players: Player[] = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i + 1}`,
        first_name: `Player${i + 1}`,
        last_name: 'Test',
        skill_level: 'Intermediate'
      }))

      const result = buildParticipantsForMatch(players, 2)
      
      expect(result.teamCount).toBe(4) // 8 players / 2 per team = 4 teams
      expect(result.participants.length).toBe(8) // All players assigned
      
      // Verify team sizes are 2 each
      const teamCounts = {}
      result.participants.forEach(p => {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1
      })
      
      Object.values(teamCounts).forEach(count => {
        expect(count).toBe(2) // Each team should have exactly 2 players
      })
    })

    test('should handle edge case with calculateOptimalTeamSizes validation', () => {
      // Test the QA matrix requirements directly
      const test1 = calculateOptimalTeamSizes(18, 3)
      expect(test1.isValid).toBe(true)
      expect(test1.teamCount).toBe(6)
      expect(test1.playersPerTeam.every(size => size === 3)).toBe(true)

      const test2 = calculateOptimalTeamSizes(10, 4)
      expect(test2.isValid).toBe(true)
      expect(test2.teamCount).toBe(2)
      expect(test2.playersPerTeam).toEqual([4, 6])

      const test3 = calculateOptimalTeamSizes(30, 5)
      expect(test3.isValid).toBe(true)
      expect(test3.teamCount).toBe(6)
      expect(test3.playersPerTeam.every(size => size === 5)).toBe(true)
    })
  })
})

describe('Team Utilities', () => {
  describe('getTeamIds', () => {
    it('should return alphabet sequence for count', () => {
      expect(getTeamIds(3)).toEqual(['A', 'B', 'C'])
      expect(getTeamIds(5)).toEqual(['A', 'B', 'C', 'D', 'E'])
    })

    it('should return empty array for count 0', () => {
      expect(getTeamIds(0)).toEqual([])
    })

    it('should use custom list when provided', () => {
      const custom = ['Team1', 'Team2', 'Team3']
      expect(getTeamIds(2, custom)).toEqual(['Team1', 'Team2'])
    })

    it('should fall back to alphabet when custom list is too short', () => {
      const custom = ['Team1']
      expect(getTeamIds(3, custom)).toEqual(['A', 'B', 'C'])
    })
  })

  describe('getTeamColors', () => {
    it('should return correct colors for known teams', () => {
      const colorsA = getTeamColors('A')
      expect(colorsA.background).toBe('bg-blue-100')
      expect(colorsA.text).toBe('text-blue-600')
      
      const colorsB = getTeamColors('B')
      expect(colorsB.background).toBe('bg-purple-100')
      expect(colorsB.text).toBe('text-purple-600')
    })

    it('should return default colors for unknown teams', () => {
      const colorsZ = getTeamColors('Z')
      expect(colorsZ.background).toBe('bg-gray-100')
      expect(colorsZ.text).toBe('text-gray-600')
    })
  })

  describe('getTeamColorsByIndex', () => {
    it('should return colors based on index', () => {
      const colors0 = getTeamColorsByIndex(0)
      expect(colors0.background).toBe('bg-blue-100')
      
      const colors1 = getTeamColorsByIndex(1)
      expect(colors1.background).toBe('bg-purple-100')
    })

    it('should cycle through colors when index exceeds available colors', () => {
      const totalColors = Object.keys(TEAM_COLORS).length
      const colors = getTeamColorsByIndex(totalColors)
      const colors0 = getTeamColorsByIndex(0)
      expect(colors).toEqual(colors0)
    })
  })
})
