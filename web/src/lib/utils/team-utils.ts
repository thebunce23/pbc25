export function generateTeamVsTeamMatches(teamPlayerMap: Map<TeamId, Player[]>, preferredTeamSize: number): MatchTemplate[] {
  console.log('🎯 [DATA FLOW] generateTeamVsTeamMatches called with:', {
    teamPlayerMapSize: teamPlayerMap.size,
    preferredTeamSize,
    teamIds: Array.from(teamPlayerMap.keys()),
    teamSizes: Array.from(teamPlayerMap.values()).map(team => team.length)
  });

  const matches: MatchTemplate[] = [];
  const teamIds = Array.from(teamPlayerMap.keys());
  let matchIndex = 0;

  // Iterate over pairs of teams (Team A vs Team B, Team C vs Team D, etc.)
  for (let i = 0; i < teamIds.length; i += 2) {
    if (i + 1 < teamIds.length) {
      const teamAId = teamIds[i];
      const teamBId = teamIds[i + 1];
      const teamA = teamPlayerMap.get(teamAId)!;
      const teamB = teamPlayerMap.get(teamBId)!;

      // Generate balanced matches between these two teams
      const maxMatchesPerTeamPair = Math.min(teamA.length, teamB.length);
      const playersPerMatch = Math.min(2, maxMatchesPerTeamPair); // 2 players per team for doubles
      
      // Create different player combinations for multiple matches
      for (let j = 0; j < maxMatchesPerTeamPair && j + playersPerMatch <= teamA.length; j += playersPerMatch) {
        const participants: GeneratedParticipant[] = [];

        // Add 2 players from Team A
        for (let k = 0; k < playersPerMatch && j + k < teamA.length; k++) {
          participants.push({ playerId: teamA[j + k].id, team: teamAId });
        }

        // Add 2 players from Team B
        for (let k = 0; k < playersPerMatch && j + k < teamB.length; k++) {
          participants.push({ playerId: teamB[j + k].id, team: teamBId });
        }

        // Only create match if we have enough players
        if (participants.length === playersPerMatch * 2) {
          const matchNumber = Math.floor(j / playersPerMatch) + 1;
          matches.push({
            id: `tvsm-${matchIndex}`,
            title: `Team ${teamAId} vs Team ${teamBId} - Match ${matchNumber}`,
            match_type: 'Doubles',
            skill_level: 'Mixed',
            court_id: '',
            date: '',
            time: '',
            duration_minutes: 90,
            max_players: 4,
            description: `Team vs Team: ${teamAId} vs ${teamBId} - Match ${matchNumber}`,
            notes: 'Paired team match with balanced player assignments',
            participants
          });
          matchIndex++;
        }
      }
    }
  }
  console.log('🎯 [DATA FLOW] generateTeamVsTeamMatches result:', {
    matchesCount: matches.length,
    matches: matches.map(m => ({ id: m.id, title: m.title, participantsCount: m.participants.length, max_players: m.max_players }))
  });
  return matches;
}

import { TeamId, MatchTemplate, Player, GeneratedParticipant } from '@/types/match';
import { getTeamIds } from './match-utils';

/**
 * Parameters for team creation functions
 */
export interface TeamCreationParams {
  players: Player[];
  preferredTeamSize: number;
  balanceSkills?: boolean;
  allowMixedSkills?: boolean;
  maxSkillDifference?: number;
}

/**
 * Parameters for match generation functions
 */
export interface MatchGenerationParams {
  players: Player[];
  preferredTeamSize: number;
  balanceSkills?: boolean;
  allowMixedSkills?: boolean;
  maxSkillDifference?: number;
  teamPlayerMap?: Map<TeamId, Player[]>;
}

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
  console.log('🎯 [DATA FLOW] buildParticipantsForMatch called with:', {
    playersCount: players.length,
    preferredTeamSize
  })
  const optimalTeamSizes = calculateOptimalTeamSizes(players.length, preferredTeamSize);
  console.log('🎯 [DATA FLOW] buildParticipantsForMatch got optimalTeamSizes:', optimalTeamSizes)
  
  // Use optimal team sizes only if they're valid AND match the preferred team size
  if (optimalTeamSizes.isValid && 
      optimalTeamSizes.teamSize === preferredTeamSize && 
      optimalTeamSizes.playersPerTeam.length > 0) {
    const playersPerTeam = optimalTeamSizes.playersPerTeam;
    const teamCount = optimalTeamSizes.teamCount;
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
    
    const result = {
      participants,
      teamCount
    };
    console.log('🎯 [DATA FLOW] buildParticipantsForMatch result (optimal path):', {
      participantsCount: result.participants.length,
      teamCount: result.teamCount,
      participants: result.participants
    })
    return result;
  }
  
  // Fallback: Use preferred team size to create teams
  // Calculate how many full teams we can create with the preferred size
  const fullTeamCount = Math.floor(players.length / preferredTeamSize);
  const remainder = players.length % preferredTeamSize;
  
  // Need at least 2 teams for a match
  if (fullTeamCount < 2) {
    // Not enough players for 2 full teams of preferred size
    // Try to respect preferred team size when possible; only drop to 2-person teams if necessary
    
    // Calculate minimum viable team size (2 players per team)
    const minTeamSize = 2;
    const minPlayersForMatch = minTeamSize * 2;  // 2 teams × 2 players each
    
    // Check if we have enough players for at least 2 teams with preferred size
    if (players.length >= preferredTeamSize * 2) {
      // We can create 2 teams with preferred size (or close to it)
      const teamCount = 2;
      const playersPerTeam = Math.floor(players.length / teamCount);
      const remainder = players.length % teamCount;
      
      // Distribute players as evenly as possible between 2 teams
      const playersPerTeamArray = [playersPerTeam, playersPerTeam];
      if (remainder > 0) {
        playersPerTeamArray[0] += remainder; // Add remainder to first team
      }
      
      const teamIds = getTeamIds(teamCount);
      const participants: GeneratedParticipant[] = [];
      let playerIndex = 0;
      
      // Assign players to teams
      for (let i = 0; i < teamCount && playerIndex < players.length; i++) {
        const currentTeamSize = playersPerTeamArray[i];
        for (let j = 0; j < currentTeamSize && playerIndex < players.length; j++) {
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
    } else if (players.length >= minPlayersForMatch) {
      // Fall back to minimum viable team size (2 players per team)
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
    } else {
      // Not enough players even for minimum viable match (4 players total)
      // Return empty result to indicate insufficient players
      return {
        participants: [],
        teamCount: 0
      };
    }
  }
  
  // Create playersPerTeam array with preferred size for each full team
  // and add remainder to the final team
  const playersPerTeam = Array(fullTeamCount).fill(preferredTeamSize);
  if (remainder > 0) {
    playersPerTeam[playersPerTeam.length - 1] += remainder;
  }
  
  const teamCount = fullTeamCount;
  const teamIds = getTeamIds(teamCount);
  
  const participants: GeneratedParticipant[] = [];
  let playerIndex = 0;
  
  // Assign players to teams based on preferred team size pattern
  for (let i = 0; i < teamCount && playerIndex < players.length; i++) {
    const currentTeamSize = playersPerTeam[i];
    
    for (let j = 0; j < currentTeamSize && playerIndex < players.length; j++) {
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
/**
 * Placeholder for future bracket generation function
 * @param teams - Array of team IDs to generate bracket matches for
 * @returns Array of match templates for bracket tournament format
 * TODO: Implement bracket generation logic (single elimination, double elimination, etc.)
 */
export function generateBracketTeams(teams: TeamId[]): MatchTemplate[] {
  // Placeholder implementation for future bracket tournament generation
  // This would include:
  // - Single elimination brackets
  // - Double elimination brackets
  // - Swiss system tournaments
  // - Seeded bracket generation
  
  // For now, return empty array to avoid unused parameter warning
  // Future implementation will use the teams parameter
  console.log(`Bracket generation not yet implemented for ${teams.length} teams`);
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
 * @param teamCountPreference - Preference for odd/even team counts ('auto', 'odd', 'even')
 * @returns Object containing team size recommendations and validation
 */
export function calculateOptimalTeamSizes(totalPlayers: number, preferredTeamSize?: number, teamCountPreference: 'auto' | 'odd' | 'even' = 'auto'): OptimalTeamSizeResult {
  console.log('🎯 [DATA FLOW] calculateOptimalTeamSizes called with:', {
    totalPlayers,
    preferredTeamSize,
    teamCountPreference
  })
  
// Adjust the condition to handle cases where remaining possible teams might align with preferred team size
  const minPlayersNeeded = preferredTeamSize ? preferredTeamSize * 2 : 6;
  
  if (totalPlayers < minPlayersNeeded) {
    const result = {
      teamSize: 0,
      teamCount: 0,
      playersPerTeam: [],
      isValid: false,
      description: `Not enough players for team matches (minimum ${minPlayersNeeded} required)`,
      options: []
    };
    console.log('🎯 [DATA FLOW] calculateOptimalTeamSizes result (insufficient players):', result)
    return result;
  }

  // Calculate the best team configuration with strict preferred team size
  if (preferredTeamSize) {
    const baseTeamCount = Math.floor(totalPlayers / preferredTeamSize);
    const remainder = totalPlayers % preferredTeamSize;

    if (baseTeamCount >= 2) {
      // Apply team count preference logic
      const adjustedTeamCount = applyTeamCountPreference(baseTeamCount, totalPlayers, preferredTeamSize, teamCountPreference);
      
      let playersPerTeam: number[];
      let description: string;
      
      if (adjustedTeamCount !== baseTeamCount) {
        // Recalculate distribution with adjusted team count
        const playersPerTeamBase = Math.floor(totalPlayers / adjustedTeamCount);
        const newRemainder = totalPlayers % adjustedTeamCount;
        
        playersPerTeam = Array(adjustedTeamCount).fill(playersPerTeamBase);
        
        // Distribute remainder players to first few teams
        for (let i = 0; i < newRemainder; i++) {
          playersPerTeam[i]++;
        }
        
        const teamCountPref = teamCountPreference === 'odd' ? 'odd' : teamCountPreference === 'even' ? 'even' : 'optimal';
        description = `${adjustedTeamCount} teams (${teamCountPref} preference) with ${playersPerTeam.join(', ')} players`;
      } else {
        // Use original calculation
        playersPerTeam = Array(baseTeamCount).fill(preferredTeamSize);
        
        if (remainder > 0) {
          // Add remainder to the last team instead of creating a new team
          playersPerTeam[playersPerTeam.length - 1] += remainder;
        }
        
        description = remainder === 0
          ? `${baseTeamCount} teams of ${preferredTeamSize} players each`
          : `${baseTeamCount - 1} teams of ${preferredTeamSize} players + 1 team of ${preferredTeamSize + remainder} players`;
      }

      const result = {
        teamSize: preferredTeamSize,
        teamCount: adjustedTeamCount,
        playersPerTeam,
        isValid: true,
        description,
        options: [
          {
            teamSize: preferredTeamSize,
            teamCount: adjustedTeamCount,
            playersPerTeam,
            description,
            efficiency: 100,
            isOptimal: remainder === 0 && adjustedTeamCount === baseTeamCount
          }
        ]
      };
      console.log('🎯 [DATA FLOW] calculateOptimalTeamSizes result (preferred size):', result)
      return result;
    } else {
      return {
        teamSize: 0,
        teamCount: 0,
        playersPerTeam: [],
        isValid: false,
        description: 'Not enough players to form more than one full team of preferred size',
        options: []
      };
    }
  }

  // Fallback to flexible size calculation if no specific preferred size
  const bestConfiguration = findBestTeamConfiguration(totalPlayers);

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
    options: getAllTeamConfigurations(totalPlayers) // Ensure options are included
  };
}

/**
 * Apply team count preference to adjust the number of teams
 * @param baseTeamCount - The base number of teams calculated
 * @param totalPlayers - Total number of players
 * @param preferredTeamSize - Preferred team size per team
 * @param teamCountPreference - User's preference for odd/even team counts
 * @returns Adjusted team count that respects the preference
 */
function applyTeamCountPreference(
  baseTeamCount: number,
  totalPlayers: number,
  preferredTeamSize: number,
  teamCountPreference: 'auto' | 'odd' | 'even'
): number {
  if (teamCountPreference === 'auto') {
    return baseTeamCount;
  }
  
  const isCurrentOdd = baseTeamCount % 2 === 1;
  const isCurrentEven = baseTeamCount % 2 === 0;
  
  // If current count already matches preference, return as-is
  if ((teamCountPreference === 'odd' && isCurrentOdd) || 
      (teamCountPreference === 'even' && isCurrentEven)) {
    return baseTeamCount;
  }
  
  // Try to adjust team count to match preference
  const minViableTeamCount = 2;
  const maxViableTeamCount = Math.floor(totalPlayers / 3); // Minimum 3 players per team
  
  if (teamCountPreference === 'odd') {
    // Try odd numbers around the base count
    const candidates = [];
    
    // Try reducing by 1 (if base is even)
    if (baseTeamCount - 1 >= minViableTeamCount) {
      candidates.push(baseTeamCount - 1);
    }
    
    // Try increasing by 1 (if base is even)
    if (baseTeamCount + 1 <= maxViableTeamCount) {
      candidates.push(baseTeamCount + 1);
    }
    
    // Find the closest odd number
    const oddCandidates = candidates.filter(count => count % 2 === 1);
    if (oddCandidates.length > 0) {
      // Prefer the one closest to base count
      return oddCandidates.reduce((closest, current) => 
        Math.abs(current - baseTeamCount) < Math.abs(closest - baseTeamCount) ? current : closest
      );
    }
  }
  
  if (teamCountPreference === 'even') {
    // Try even numbers around the base count
    const candidates = [];
    
    // Try reducing by 1 (if base is odd)
    if (baseTeamCount - 1 >= minViableTeamCount) {
      candidates.push(baseTeamCount - 1);
    }
    
    // Try increasing by 1 (if base is odd)
    if (baseTeamCount + 1 <= maxViableTeamCount) {
      candidates.push(baseTeamCount + 1);
    }
    
    // Find the closest even number
    const evenCandidates = candidates.filter(count => count % 2 === 0);
    if (evenCandidates.length > 0) {
      // Prefer the one closest to base count
      return evenCandidates.reduce((closest, current) => 
        Math.abs(current - baseTeamCount) < Math.abs(closest - baseTeamCount) ? current : closest
      );
    }
  }
  
  // If we can't find a suitable adjustment, return the base count
  return baseTeamCount;
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
  if (preferredTeamSize) {
    const evenTeams = Math.floor(totalPlayers / preferredTeamSize);
    const remainder = totalPlayers % preferredTeamSize;

    if (evenTeams >= 2) {
      const playersPerTeam = Array(evenTeams).fill(preferredTeamSize);
      if (remainder > 0) {
        // Add remainder to the last team instead of creating a new team
        playersPerTeam[playersPerTeam.length - 1] += remainder;
      }
      
      const description = remainder === 0
        ? `${evenTeams} teams of ${preferredTeamSize} players each`
        : `${evenTeams - 1} teams of ${preferredTeamSize} players + 1 team of ${preferredTeamSize + remainder} players`;
      
      configurations.push({
        teamSize: preferredTeamSize,
        teamCount: evenTeams,
        playersPerTeam,
        description,
        efficiency: 100,
        isOptimal: remainder === 0
      });
    }
  } else {
    const minSize = 3;
    const maxSize = Math.min(6, Math.floor(totalPlayers / 2));

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
  const minPlayersNeeded = preferredTeamSize ? preferredTeamSize * 2 : 6;
  if (totalPlayers < minPlayersNeeded) {
    return [];
  }

  const configurations: TeamConfiguration[] = [];
  
  // When preferredTeamSize is specified, only return configurations with that exact team size
  if (preferredTeamSize) {
    const size = preferredTeamSize;
    const evenTeams = Math.floor(totalPlayers / size);
    const remainder = totalPlayers % size;
    
    if (evenTeams >= 2) {
      const playersPerTeam = Array(evenTeams).fill(size);
      if (remainder > 0) {
        // Add remainder to the last team instead of creating a new team
        playersPerTeam[playersPerTeam.length - 1] += remainder;
      }
      
      const description = remainder === 0
        ? `${evenTeams} teams of ${size} players each`
        : `${evenTeams - 1} teams of ${size} players + 1 team of ${size + remainder} players`;
      
      configurations.push({
        teamSize: size,
        teamCount: evenTeams,
        playersPerTeam,
        description,
        efficiency: 100,
        isOptimal: remainder === 0
      });
    }
  } else {
    // Try different team sizes for flexible sizing
    const minSize = 3;
    const maxSize = Math.min(6, Math.floor(totalPlayers / 2));
    
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
 * Each match uses different player combinations from each team to maximize playing time.
 * 
 * @param teamPlayerMap - Map of team IDs to their players (teams should be pre-sized optimally)
 * @param preferredTeamSize - The preferred team size (used for validation and future enhancements)
 * @returns Array of match templates with player assignments
 */
export function generateRoundRobinWithPlayers(
  teamPlayerMap: Map<TeamId, Player[]>,
  preferredTeamSize: number
): MatchTemplate[] {
  console.log('🎯 [DATA FLOW] generateRoundRobinWithPlayers called with:', {
    teamPlayerMapSize: teamPlayerMap.size,
    preferredTeamSize,
    teamIds: Array.from(teamPlayerMap.keys()),
    teamSizes: Array.from(teamPlayerMap.values()).map(team => team.length)
  })
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
      
      // Create multiple matches with different player combinations
      const minPlayersPerTeam = Math.min(preferredTeamSize, teamA.length, teamB.length);
      const playersPerMatch = Math.min(2, minPlayersPerTeam); // 2 players per team for doubles
      
      if (minPlayersPerTeam >= 1) {
        // Calculate how many different matches we can create between these teams
        const maxMatches = Math.floor(Math.min(teamA.length, teamB.length) / playersPerMatch);
        
        // Create multiple matches with different player combinations
        for (let matchRound = 0; matchRound < maxMatches; matchRound++) {
          const participants: GeneratedParticipant[] = [];
          
          // Add players from Team A (rotate through different players)
          for (let k = 0; k < playersPerMatch; k++) {
            const playerIndex = (matchRound * playersPerMatch + k) % teamA.length;
            participants.push({
              playerId: teamA[playerIndex].id,
              team: teamAId
            });
          }
          
          // Add players from Team B (rotate through different players)
          for (let k = 0; k < playersPerMatch; k++) {
            const playerIndex = (matchRound * playersPerMatch + k) % teamB.length;
            participants.push({
              playerId: teamB[playerIndex].id,
              team: teamBId
            });
          }
          
          const matchType = playersPerMatch === 1 ? 'Singles' : 'Doubles';
          const maxPlayers = playersPerMatch * 2; // Team A players + Team B players
          const matchNumber = matchRound + 1;
          
          matches.push({
            id: `rr-match-${matchIndex}`,
            title: `Team ${teamAId} vs Team ${teamBId} - Match ${matchNumber}`,
            match_type: matchType,
            skill_level: 'Mixed',
            court_id: '',
            date: '',
            time: '',
            duration_minutes: 90,
            max_players: maxPlayers,
            description: `Round Robin: Team ${teamAId} vs Team ${teamBId} - Match ${matchNumber}`,
            notes: 'Round Robin tournament match with player rotation',
            participants
          });
          matchIndex++;
        }
      }
    }
  }
  console.log('🎯 [DATA FLOW] generateRoundRobinWithPlayers result:', {
    matchesCount: matches.length,
    matches: matches.map(m => ({ id: m.id, title: m.title, participantsCount: m.participants.length, max_players: m.max_players }))
  })
  return matches;
}
