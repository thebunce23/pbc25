import { TeamId, MatchTemplate, Player, GeneratedParticipant } from '@/types/match';
import { getTeamIds } from './match-utils';

/**
 * Generate Round Robin Matches for a list of teams
 * @param teams - Array of team IDs to generate matches for
 * @returns Array of match templates for round robin format
 */
export function generateRoundRobinTeams(teams: TeamId[]): MatchTemplate[] {
  const matches: MatchTemplate[] = [];
  let matchIndex = 0;

  // Generate all possible pairings between teams
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `rr-match-${matchIndex}`,
        title: `Team ${teams[i]} vs Team ${teams[j]}`,
        match_type: 'Doubles',
        skill_level: 'Mixed',
        court_id: '',
        date: '',
        time: '',
        duration_minutes: 90,
        max_players: 4,
        description: `Round Robin: Team ${teams[i]} vs Team ${teams[j]}`,
        notes: 'Round Robin tournament match',
        participants: []
      });
      matchIndex++;
    }
  }
  return matches;
}

/**
 * Build participants for a match with a given team size.
 * 
 * **Team-Size Awareness**: This function respects the user's preferred team size setting
 * and uses calculateOptimalTeamSizes() to determine the best team configuration.
 * It will create teams that are as close to the preferred size as possible while
 * ensuring all players are included in balanced teams.
 *
 * @param players - The list of players available.
 * @param preferredTeamSize - The preferred team size (e.g., 3, 4, or 5 players per team).
 * @returns The generated participants and the team count.
 */
export function buildParticipantsForMatch(
  players: Player[],
  preferredTeamSize: number
): { participants: GeneratedParticipant[]; teamCount: number } {
  const optimalTeamSizes = calculateOptimalTeamSizes(players.length, preferredTeamSize);
  
  // For Round Robin: Use calculated playersPerTeam array to determine team assignments
  if (optimalTeamSizes.isValid && optimalTeamSizes.playersPerTeam.length > 0) {
    const playersPerTeam = optimalTeamSizes.playersPerTeam;
    const teamCount = optimalTeamSizes.teamCount; // Use the actual calculated team count
    const teamIds = getTeamIds(teamCount);
    
    const participants: GeneratedParticipant[] = [];
    let playerIndex = 0;
    
    // Assign players to teams based on calculated playersPerTeam array
    for (let i = 0; i < teamCount && playerIndex < players.length; i++) {
      const currentTeamSize = playersPerTeam[i] || preferredTeamSize;
      const maxPlayersForTeam = Math.min(currentTeamSize, players.length - playerIndex);
      
      for (let j = 0; j < maxPlayersForTeam && playerIndex < players.length; j++) {
        participants.push({
          playerId: players[playerIndex].id,
          team: teamIds[i]
        });
        playerIndex++;
      }
    }
    
    return {
      participants,
      teamCount
    };
  }
  
  // Fallback: Simple 2-team division for cases where optimal sizing isn't available
  const teamCount = 2;
  const playersPerTeam = Math.floor(players.length / teamCount);
  const selectedPlayers = players.slice(0, playersPerTeam * teamCount);
  const teamIds = getTeamIds(teamCount);

  const participants: GeneratedParticipant[] = [];
  selectedPlayers.forEach((player, index) => {
    const teamIndex = Math.floor(index / playersPerTeam);
    const teamId = teamIds[teamIndex];
    participants.push({
      playerId: player.id,
      team: teamId
    });
  });

  return {
    participants,
    teamCount
  };
}
/**
 * Placeholder for future bracket generation function
 * @param teams - Array of team IDs to generate bracket matches for
 * @returns Array of match templates for bracket tournament format
 * TODO: Implement bracket generation logic (single elimination, double elimination, etc.)
 */
export function generateBracketTeams(_teams: TeamId[]): MatchTemplate[] {
  // Placeholder implementation for future bracket tournament generation
  // This would include:
  // - Single elimination brackets
  // - Double elimination brackets
  // - Swiss system tournaments
  // - Seeded bracket generation
  return [];
}

/**
 * Team size calculation utilities for match generation
 * Provides optimal team sizing logic for both UI recommendations and match generation
 */

export interface TeamConfiguration {
  teamSize: number;
  teamCount: number;
  playersPerTeam: number[];
  description: string;
  efficiency: number;
  isOptimal: boolean;
}

export interface OptimalTeamSizeResult {
  teamSize: number;
  teamCount: number;
  playersPerTeam: number[];
  isValid: boolean;
  description: string;
  options: TeamConfiguration[];
}

/**
 * Calculate optimal team sizes for a given number of players
 * @param totalPlayers - Total number of players available
 * @param preferredTeamSize - Preferred team size (defaults to flexible sizing)
 * @returns Object containing team size recommendations and validation
 */
export function calculateOptimalTeamSizes(totalPlayers: number, preferredTeamSize?: number): OptimalTeamSizeResult {
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

  // Calculate the best team configuration
  const bestConfiguration = findBestTeamConfiguration(totalPlayers, preferredTeamSize);
  
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
    options: getAllTeamConfigurations(totalPlayers, preferredTeamSize) // Ensure options are included
  };
}

/**
 * Find the best team configuration for a given number of players
 * @param totalPlayers - Total number of players
 * @param preferredTeamSize - Preferred team size (defaults to flexible sizing)
 * @returns Best team configuration or null if none found
 */
function findBestTeamConfiguration(totalPlayers: number, preferredTeamSize?: number): TeamConfiguration | null {
  const configurations: TeamConfiguration[] = [];
  
  // Try different team sizes and combinations
  const minSize = preferredTeamSize || 3;
  const maxSize = preferredTeamSize || Math.min(6, Math.floor(totalPlayers / 2));
  
  for (let size = minSize; size <= maxSize; size++) {
    const evenTeams = Math.floor(totalPlayers / size);
    const remainder = totalPlayers % size;
    
    if (evenTeams >= 2) {
      if (remainder === 0) {
        // Perfect division - all teams same size
        const playersPerTeam = Array(evenTeams).fill(size);
        configurations.push({
          teamSize: size,
          teamCount: evenTeams,
          playersPerTeam,
          description: `${evenTeams} teams of ${size} players each`,
          efficiency: 100,
          isOptimal: true
        });
      } else if (remainder >= 3 && evenTeams >= 2) {
        // Mixed sizes - some teams larger
        const smallerTeams = evenTeams - 1;
        const largerTeamSize = size + remainder;
        
        if (largerTeamSize <= 6) {
          const playersPerTeam = [
            ...Array(smallerTeams).fill(size),
            largerTeamSize
          ];
          
          configurations.push({
            teamSize: size, // Base team size
            teamCount: evenTeams,
            playersPerTeam,
            description: `${smallerTeams} teams of ${size} players + 1 team of ${largerTeamSize} players`,
            efficiency: 100,
            isOptimal: false
          });
        }
      } else if (remainder >= 2 && evenTeams >= 1) {
        // Handle case where remainder is 2 - distribute to make one larger team
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
  }
  
  // Sort configurations by preference:
  // 1. Efficiency (higher is better)
  // 2. Optimal (perfect division preferred)
  // 3. Fewer unused players (though efficiency=100 means no unused players)
  configurations.sort((a, b) => {
    if (a.efficiency !== b.efficiency) return b.efficiency - a.efficiency;
    if (a.isOptimal !== b.isOptimal) return a.isOptimal ? -1 : 1;
    return a.teamCount - b.teamCount; // Prefer fewer teams if all else equal
  });
  
  return configurations[0] || null;
}

/**
 * Get all possible team configurations for a given number of players
 * Useful for showing alternative options in the UI
 * @param totalPlayers - Total number of players
 * @param preferredTeamSize - Preferred team size (defaults to flexible sizing)
 * @returns Array of all valid team configurations
 */
export function getAllTeamConfigurations(totalPlayers: number, preferredTeamSize?: number): TeamConfiguration[] {
  if (totalPlayers < 6) {
    return [];
  }

  const configurations: TeamConfiguration[] = [];
  
  // Try different team sizes
  const minSize = preferredTeamSize || 3;
  const maxSize = preferredTeamSize || Math.min(6, Math.floor(totalPlayers / 2));
  
  for (let size = minSize; size <= maxSize; size++) {
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
      } else if (remainder >= 3 && evenTeams >= 2) {
        // Mixed sizes
        const smallerTeams = evenTeams - 1;
        const largerTeamSize = size + remainder;
        
        if (largerTeamSize <= 6) {
          const playersPerTeam = [
            ...Array(smallerTeams).fill(size),
            largerTeamSize
          ];
          
          configurations.push({
            teamSize: size,
            teamCount: evenTeams,
            playersPerTeam,
            description: `${smallerTeams} teams of ${size} players + 1 team of ${largerTeamSize} players`,
            efficiency: 100,
            isOptimal: false
          });
        }
      } else if (remainder >= 2 && evenTeams >= 1) {
        // Handle case where remainder is 2 - distribute to make one larger team
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
  }
  
  // Sort by preference
  configurations.sort((a, b) => {
    if (a.efficiency !== b.efficiency) return b.efficiency - a.efficiency;
    if (a.isOptimal !== b.isOptimal) return a.isOptimal ? -1 : 1;
    return a.teamCount - b.teamCount;
  });
  
  return configurations;
}

/**
 * Generate Round Robin matches with player assignments
 * 
 * **Team-Size Awareness**: This function generates matches between teams that have already
 * been organized according to the user's preferred team size. The teams in the teamPlayerMap
 * should have been created using calculateOptimalTeamSizes() to ensure balanced team sizes.
 * Each match uses the first 2 players from each team for doubles matches.
 * 
 * @param teamPlayerMap - Map of team IDs to their players (teams should be pre-sized optimally)
 * @returns Array of match templates with player assignments
 */
export function generateRoundRobinWithPlayers(teamPlayerMap: Map<TeamId, Player[]>): MatchTemplate[] {
  const matches: MatchTemplate[] = [];
  const teamIds = Array.from(teamPlayerMap.keys());
  let matchIndex = 0;

  // Generate all possible pairings between teams
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const teamAId = teamIds[i];
      const teamBId = teamIds[j];
      const teamA = teamPlayerMap.get(teamAId)!;
      const teamB = teamPlayerMap.get(teamBId)!;
      
      // Create match with first 2 players from each team
      if (teamA.length >= 2 && teamB.length >= 2) {
        const participants: GeneratedParticipant[] = [
          { playerId: teamA[0].id, team: teamAId },
          { playerId: teamA[1].id, team: teamAId },
          { playerId: teamB[0].id, team: teamBId },
          { playerId: teamB[1].id, team: teamBId }
        ];
        
        matches.push({
          id: `rr-match-${matchIndex}`,
          title: `Team ${teamAId} vs Team ${teamBId}`,
          match_type: 'Doubles',
          skill_level: 'Mixed',
          court_id: '',
          date: '',
          time: '',
          duration_minutes: 90,
          max_players: 4,
          description: `Round Robin: Team ${teamAId} vs Team ${teamBId}`,
          notes: 'Round Robin tournament match',
          participants
        });
        matchIndex++;
      }
    }
  }
  return matches;
}
