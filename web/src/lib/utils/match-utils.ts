import { 
  Player, 
  Participant, 
  FormattedTeams, 
  WinnerResult, 
  TeamId, 
  Team,
  DEFAULT_TEAM_A, 
  DEFAULT_TEAM_B, 
  DEFAULT_TEAMS 
} from '@/types/match'

/**
 * Format participants into team structure with display names
 * @param participants - Array of match participants
 * @returns Formatted team structure with display names
 */
export function formatTeams(participants: Participant[]): FormattedTeams | null {
  if (!participants || participants.length === 0) {
    return null
  }

  // Helper function to format player name (handles both firstName/lastName and first_name/last_name)
  const formatPlayerName = (player: Player): string => {
    const firstName = player.firstName || player.first_name
    const lastName = player.lastName || player.last_name
    return `${firstName} ${lastName}`
  }

  // Group players by team
  const teamGroups: { [key: TeamId]: Player[] } = {}
  participants.forEach(p => {
    if (p.player && p.team) {
      if (!teamGroups[p.team]) {
        teamGroups[p.team] = []
      }
      teamGroups[p.team].push(p.player)
    }
  })

  // Need at least one team with players
  const teamIds = Object.keys(teamGroups)
  if (teamIds.length === 0) {
    return null
  }

  // Create teams object
  const teams: { [key: TeamId]: Team } = {}
  teamIds.forEach(teamId => {
    const players = teamGroups[teamId]
    teams[teamId] = {
      id: teamId,
      players: players,
      displayName: players.map(formatPlayerName).join(', ')
    }
  })

  // Determine if this is a doubles match (any team has more than 1 player)
  const isDoublesMatch = Object.values(teams).some(team => team.players.length > 1)

  return {
    teams,
    isDoublesMatch,
    teamCount: teamIds.length
  }
}

/**
 * Determine the winner from score and participants
 * @param score - Match score (string, object, or null)
 * @param participants - Array of match participants
 * @param explicitWinner - Explicit winner team ID if set
 * @returns Winner information or null if no winner can be determined
 */
export function getWinnerFromScore(
  score: string | object | null,
  participants: Participant[],
  explicitWinner?: TeamId | null
): WinnerResult | null {
  const formattedTeams = formatTeams(participants)
  if (!formattedTeams) {
    return null
  }

  const { teams } = formattedTeams
  const teamIds = Object.keys(teams)

  // First check if winner is explicitly set
  if (explicitWinner && teams[explicitWinner]) {
    // For explicit winner, assume it's a two-team match for now
    const otherTeamId = teamIds.find(id => id !== explicitWinner)
    if (otherTeamId) {
      return {
        winnerTeam: explicitWinner,
        loserTeam: otherTeamId,
        winnerPlayers: teams[explicitWinner].players,
        loserPlayers: teams[otherTeamId].players
      }
    }
  }

  // If no explicit winner, try to determine from score
  if (!score) {
    return null
  }

  // For backward compatibility, handle traditional A vs B scoring
  const teamA = teams[DEFAULT_TEAM_A]
  const teamB = teams[DEFAULT_TEAM_B]
  
  if (!teamA || !teamB) {
    return null // Can't determine winner without both traditional teams
  }

  // Convert score to string for parsing
  const scoreStr = typeof score === 'object' ? JSON.stringify(score) : score
  if (!scoreStr) {
    return null
  }

  // Try to parse different score formats
  let teamAWins = 0
  let teamBWins = 0

  // Handle object format like { teamA: 6, teamB: 4 }
  if (typeof score === 'object' && score !== null) {
    const scoreObj = score as any
    if (scoreObj.teamA !== undefined && scoreObj.teamB !== undefined) {
      teamAWins = scoreObj.teamA > scoreObj.teamB ? 1 : 0
      teamBWins = scoreObj.teamB > scoreObj.teamA ? 1 : 0
    } else if (scoreObj.sets && Array.isArray(scoreObj.sets)) {
      // Handle sets format like { sets: [{ teamA: 6, teamB: 4 }, { teamA: 4, teamB: 6 }] }
      scoreObj.sets.forEach((set: any) => {
        if (set.teamA > set.teamB) teamAWins++
        else if (set.teamB > set.teamA) teamBWins++
      })
    }
  } else {
    // Handle string formats like "6-4, 4-6, 6-3" or "6-4"
    const games = scoreStr.split(',').map(game => game.trim())
    
    games.forEach(game => {
      const scoreParts = game.split('-').map(s => s.trim())
      if (scoreParts.length === 2) {
        const teamAScore = parseInt(scoreParts[0])
        const teamBScore = parseInt(scoreParts[1])
        
        if (!isNaN(teamAScore) && !isNaN(teamBScore)) {
          if (teamAScore > teamBScore) teamAWins++
          else if (teamBScore > teamAScore) teamBWins++
        }
      }
    })
  }

  // Determine winner based on wins
  if (teamAWins > teamBWins) {
    return {
      winnerTeam: DEFAULT_TEAM_A,
      loserTeam: DEFAULT_TEAM_B,
      winnerPlayers: teamA.players,
      loserPlayers: teamB.players
    }
  } else if (teamBWins > teamAWins) {
    return {
      winnerTeam: DEFAULT_TEAM_B,
      loserTeam: DEFAULT_TEAM_A,
      winnerPlayers: teamB.players,
      loserPlayers: teamA.players
    }
  }

  return null
}

/**
 * Format a match score for display
 * @param score - Match score (string, object, or null)
 * @returns Formatted score string or null
 */
export function formatScore(score: string | object | null): string | null {
  if (!score || (typeof score === 'object' && Object.keys(score).length === 0)) {
    return null
  }
  
  if (typeof score === 'object') {
    const scoreObj = score as any
    
    // Handle common score formats
    if (scoreObj.teamA !== undefined && scoreObj.teamB !== undefined) {
      return `${scoreObj.teamA} - ${scoreObj.teamB}`
    }
    
    // Handle sets format
    if (scoreObj.sets && Array.isArray(scoreObj.sets)) {
      return scoreObj.sets.map((set: any) => `${set.teamA}-${set.teamB}`).join(', ')
    }
    
    // Fallback to string representation
    return JSON.stringify(score)
  }
  
  return score
}

/**
 * Get team vs team display string
 * @param participants - Array of match participants
 * @returns Display string like "Team A vs Team B" or "Player 1 vs Player 2"
 */
export function getTeamVsDisplay(participants: Participant[]): string | null {
  const formattedTeams = formatTeams(participants)
  if (!formattedTeams) {
    return null
  }

  const { teams } = formattedTeams
  const teamIds = Object.keys(teams).sort() // Sort for consistent ordering

  if (teamIds.length === 2) {
    // Standard two-team match
    const team1 = teams[teamIds[0]]
    const team2 = teams[teamIds[1]]
    return `${team1.displayName} vs ${team2.displayName}`
  } else if (teamIds.length > 2) {
    // Multi-team match
    return teamIds.map(id => teams[id].displayName).join(' vs ')
  }

  return null
}

/**
 * Get team display name by team ID
 * @param participants - Array of match participants
 * @param teamId - Team ID to get display name for
 * @returns Display name for the team or null if not found
 */
export function getTeamDisplayName(participants: Participant[], teamId: TeamId): string | null {
  const formattedTeams = formatTeams(participants)
  if (!formattedTeams || !formattedTeams.teams[teamId]) {
    return null
  }
  return formattedTeams.teams[teamId].displayName
}

/**
 * Get players for a specific team
 * @param participants - Array of match participants
 * @param teamId - Team ID to get players for
 * @returns Array of players for the team
 */
export function getTeamPlayers(participants: Participant[], teamId: TeamId): Player[] {
  const formattedTeams = formatTeams(participants)
  if (!formattedTeams || !formattedTeams.teams[teamId]) {
    return []
  }
  return formattedTeams.teams[teamId].players
}

/**
 * Generate a sequence of team IDs
 * @param count - Number of team IDs to generate
 * @param customList - Optional custom list of team IDs to use instead of alphabet
 * @returns Array of team IDs
 */
export function getTeamIds(count: number, customList?: TeamId[]): TeamId[] {
  if (customList && customList.length >= count) {
    return customList.slice(0, count)
  }
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const teamIds: TeamId[] = []
  
  for (let i = 0; i < count && i < alphabet.length; i++) {
    teamIds.push(alphabet[i])
  }
  
  return teamIds
}

/**
 * Team color configuration
 */
export const TEAM_COLORS = {
  A: {
    background: 'bg-blue-100',
    text: 'text-blue-600',
    lightBackground: 'bg-blue-50',
    border: 'border-blue-200'
  },
  B: {
    background: 'bg-purple-100',
    text: 'text-purple-600',
    lightBackground: 'bg-purple-50',
    border: 'border-purple-200'
  },
  C: {
    background: 'bg-green-100',
    text: 'text-green-600',
    lightBackground: 'bg-green-50',
    border: 'border-green-200'
  },
  D: {
    background: 'bg-red-100',
    text: 'text-red-600',
    lightBackground: 'bg-red-50',
    border: 'border-red-200'
  },
  E: {
    background: 'bg-yellow-100',
    text: 'text-yellow-600',
    lightBackground: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  F: {
    background: 'bg-indigo-100',
    text: 'text-indigo-600',
    lightBackground: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  G: {
    background: 'bg-pink-100',
    text: 'text-pink-600',
    lightBackground: 'bg-pink-50',
    border: 'border-pink-200'
  },
  H: {
    background: 'bg-orange-100',
    text: 'text-orange-600',
    lightBackground: 'bg-orange-50',
    border: 'border-orange-200'
  }
} as const

/**
 * Get team colors based on team ID
 * @param teamId - Team ID to get colors for
 * @returns Team color configuration or default colors
 */
export function getTeamColors(teamId: TeamId) {
  return TEAM_COLORS[teamId as keyof typeof TEAM_COLORS] || {
    background: 'bg-gray-100',
    text: 'text-gray-600',
    lightBackground: 'bg-gray-50',
    border: 'border-gray-200'
  }
}

/**
 * Get team color classes based on index (for consistent color assignment)
 * @param index - Zero-based index of the team
 * @returns Team color configuration
 */
export function getTeamColorsByIndex(index: number) {
  const teamIds = Object.keys(TEAM_COLORS)
  const teamId = teamIds[index % teamIds.length]
  return getTeamColors(teamId as TeamId)
}
