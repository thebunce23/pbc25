export function generateTeamVsTeamMatches(
  teamPlayerMap: Map<TeamId, Player[]>, 
  preferredTeamSize: number, 
  rotationOptions?: PlayerRotationOptions
): MatchTemplate[] {
  console.log('🎯 [DATA FLOW] generateTeamVsTeamMatches called with:', {
    teamPlayerMapSize: teamPlayerMap.size,
    preferredTeamSize,
    rotationOptions,
    teamIds: Array.from(teamPlayerMap.keys()),
    teamSizes: Array.from(teamPlayerMap.values()).map(team => team.length)
  });

  const matches: MatchTemplate[] = [];
  const teamIds = Array.from(teamPlayerMap.keys());
  let matchIndex = 0;
  
  // Create global player rest tracker for all teams
  const globalPlayerRestTracker = new Map<string, number>(); // playerId -> consecutive games count
  
  // Initialize tracker for all players
  teamPlayerMap.forEach((players, teamId) => {
    players.forEach(player => {
      globalPlayerRestTracker.set(player.id, 0);
    });
  });

  // Iterate over pairs of teams (Team A vs Team B, Team C vs Team D, etc.)
  for (let i = 0; i < teamIds.length; i += 2) {
    if (i + 1 < teamIds.length) {
      const teamAId = teamIds[i];
      const teamBId = teamIds[i + 1];
      const teamA = teamPlayerMap.get(teamAId)!;
      const teamB = teamPlayerMap.get(teamBId)!;

      const rotationType = rotationOptions?.playerRotation || 'head-to-head';
      const numberOfRounds = rotationOptions?.numberOfRounds || 1;
      const playersPerMatch = 2; // 2 players per team for doubles
      
      if (rotationType === 'all-combinations') {
        // Generate proper all-combinations schedule with partnership constraints
        const allCombinationsMatches = generateAllCombinationsSchedule(
          teamA, teamAId, teamB, teamBId, numberOfRounds
        );
        
        allCombinationsMatches.forEach((roundMatches, roundIndex) => {
          roundMatches.forEach((matchParticipants, courtIndex) => {
            const participants: GeneratedParticipant[] = [];
            
            // Add participants for this match
            matchParticipants.forEach(player => {
              participants.push({
                playerId: player.id,
                team: player.teamId
              });
            });
            
            const roundNumber = roundIndex + 1;
            const courtNumber = courtIndex + 1;
            matches.push({
              id: `tvsm-${matchIndex}`,
              title: `${teamAId} vs ${teamBId} - Round ${roundNumber} Court ${courtNumber}`,
              match_type: 'Doubles',
              skill_level: 'Mixed',
              court_id: `court-${courtNumber}`,
              date: '',
              time: '',
              duration_minutes: 90,
              max_players: 4,
              description: `Team vs Team: ${teamAId} vs ${teamBId} - Round ${roundNumber}, Court ${courtNumber} (All Combinations)`,
              notes: `Round ${roundNumber}, Court ${courtNumber} - Each player partners with teammates exactly twice`,
              participants
            });
            matchIndex++;
            
            // Update global rest tracker
            updateGlobalPlayerRestTracker(participants, globalPlayerRestTracker);
          });
        });
        } else {
          // Default head-to-head rotation with global player rest enforcement
          for (let j = 0; j < numberOfRounds; j++) {
            const participants: GeneratedParticipant[] = [];

            // Select players from Team A considering global rest
            const teamASelectedPlayers = selectPlayersWithGlobalRest(teamA, teamAId, playersPerMatch, globalPlayerRestTracker);
            teamASelectedPlayers.forEach(player => {
              participants.push({ playerId: player.id, team: teamAId });
            });

            // Select players from Team B considering global rest
            const teamBSelectedPlayers = selectPlayersWithGlobalRest(teamB, teamBId, playersPerMatch, globalPlayerRestTracker);
            teamBSelectedPlayers.forEach(player => {
              participants.push({ playerId: player.id, team: teamBId });
            });

            // Only create match if we have enough players
            if (participants.length === playersPerMatch * 2) {
              const matchNumber = j + 1;
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
                description: `Team vs Team: ${teamAId} vs ${teamBId} - Match ${matchNumber} (Head-to-Head)`,
                notes: 'Paired team match with balanced player assignments',
                participants
              });
              matchIndex++;
              
              // Update global rest tracker
              updateGlobalPlayerRestTracker(participants, globalPlayerRestTracker);
            }
          }
      }
    }
  }
  
  // Log final player game counts
  console.log('🔄 Final player consecutive game counts:', 
    Array.from(globalPlayerRestTracker.entries()).reduce((acc, [playerId, count]) => {
      const player = Array.from(teamPlayerMap.values()).flat().find(p => p.id === playerId);
      if (player) {
        acc[`${player.first_name} ${player.last_name}`] = count;
      }
      return acc;
    }, {} as Record<string, number>)
  );
  
  console.log('🎯 [DATA FLOW] generateTeamVsTeamMatches result:', {
    matchesCount: matches.length,
    matches: matches.map(m => ({ id: m.id, title: m.title, participantsCount: m.participants.length, max_players: m.max_players }))
  });
  return matches;
}

import { TeamId, MatchTemplate, Player, GeneratedParticipant } from '@/types/match';
import { getTeamIds } from './match-utils';

/**
 * Create a player rotation schedule that ensures no player plays more than 2 consecutive matches
 * @param teamSize - Number of players in the team
 * @param numberOfRounds - Total number of rounds to schedule
 * @param playersPerMatch - Number of players needed per match from this team
 * @returns Array of arrays, each containing player indices for that round
 */
function createPlayerRotationSchedule(teamSize: number, numberOfRounds: number, playersPerMatch: number): number[][] {
  const schedule: number[][] = [];
  const playerRestTracker = new Array(teamSize).fill(0); // Track consecutive games for each player
  const maxConsecutiveGames = 2;
  
  for (let round = 0; round < numberOfRounds; round++) {
    const roundPlayers: number[] = [];
    const availablePlayers: number[] = [];
    
    // Find players who can play (haven't reached max consecutive games)
    for (let i = 0; i < teamSize; i++) {
      if (playerRestTracker[i] < maxConsecutiveGames) {
        availablePlayers.push(i);
      }
    }
    
    // If not enough available players, reset some players' rest counters
    if (availablePlayers.length < playersPerMatch) {
      // Reset players who have been resting the longest
      const restingPlayers = [];
      for (let i = 0; i < teamSize; i++) {
        if (playerRestTracker[i] >= maxConsecutiveGames) {
          restingPlayers.push(i);
        }
      }
      
      // Reset enough resting players to fill the match
      const playersToReset = Math.min(restingPlayers.length, playersPerMatch - availablePlayers.length);
      for (let i = 0; i < playersToReset; i++) {
        playerRestTracker[restingPlayers[i]] = 0;
        availablePlayers.push(restingPlayers[i]);
      }
    }
    
    // Select players for this round, prioritizing those who have rested longer
    // Sort available players by their rest count (ascending - those who rested more get priority)
    availablePlayers.sort((a, b) => {
      // If both are at 0 consecutive games, prefer those who haven't played recently
      if (playerRestTracker[a] === 0 && playerRestTracker[b] === 0) {
        return 0; // Equal priority, will be selected in order
      }
      return playerRestTracker[a] - playerRestTracker[b];
    });
    
    // Select the required number of players
    for (let i = 0; i < Math.min(playersPerMatch, availablePlayers.length); i++) {
      roundPlayers.push(availablePlayers[i]);
    }
    
    // If still not enough players, fill with round-robin
    while (roundPlayers.length < playersPerMatch && roundPlayers.length < teamSize) {
      const fallbackIndex = (round * playersPerMatch + roundPlayers.length) % teamSize;
      if (!roundPlayers.includes(fallbackIndex)) {
        roundPlayers.push(fallbackIndex);
      } else {
        // Find first player not already selected
        for (let i = 0; i < teamSize; i++) {
          if (!roundPlayers.includes(i)) {
            roundPlayers.push(i);
            break;
          }
        }
      }
    }
    
    schedule.push(roundPlayers);
    
    // Update rest tracker
    for (let i = 0; i < teamSize; i++) {
      if (roundPlayers.includes(i)) {
        // Player is playing this round, increment consecutive count
        playerRestTracker[i]++;
      } else {
        // Player is resting, reset consecutive count
        playerRestTracker[i] = 0;
      }
    }
  }
  
  console.log('🔄 Player rotation schedule:', {
    teamSize,
    numberOfRounds,
    playersPerMatch,
    schedule: schedule.map((round, idx) => ({ round: idx + 1, players: round })),
    playerGameCounts: schedule.reduce((acc, round) => {
      round.forEach(playerId => {
        acc[playerId] = (acc[playerId] || 0) + 1;
      });
      return acc;
    }, {} as Record<number, number>)
  });
  
  return schedule;
}

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
 * Player rotation options for team matches
 */
export interface PlayerRotationOptions {
  playerRotation: 'head-to-head' | 'all-combinations';
  numberOfRounds: number;
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
/**
 * Select players considering global rest across all matches
 * @param players - List of players to select from
 * @param teamId - Team identifier
 * @param playersPerMatch - Number of players needed in the match
 * @param restTracker - Global rest tracker for players
 * @returns Selected players
 */
function selectPlayersWithGlobalRest(players: Player[], teamId: TeamId, playersPerMatch: number, restTracker: Map<string, number>): Player[] {
  const availablePlayers: Player[] = [];
  const restingPlayers: Player[] = [];

  // Determine available and resting players
  players.forEach(player => {
    const playerId = player.id;
    const consecutiveGames = restTracker.get(playerId) || 0;
    if (consecutiveGames < 2) {
      availablePlayers.push(player);
    } else {
      restingPlayers.push(player);
    }
  });

  // If not enough available, use some resting players
  if (availablePlayers.length < playersPerMatch) {
    const needed = playersPerMatch - availablePlayers.length;
    restingPlayers.sort((a, b) => (restTracker.get(a.id) || 0) - (restTracker.get(b.id) || 0));
    availablePlayers.push(...restingPlayers.slice(0, needed));
  }

  // Sort available by least consecutive games first
  availablePlayers.sort((a, b) => (restTracker.get(a.id) || 0) - (restTracker.get(b.id) || 0));

  return availablePlayers.slice(0, playersPerMatch);
}

/**
 * Update global rest tracker after matches
 * @param participants - Participants in the match
 * @param restTracker - Global rest tracker for players
 */
function updateGlobalPlayerRestTracker(participants: GeneratedParticipant[], restTracker: Map<string, number>) {
  participants.forEach(participant => {
    const playerId = participant.playerId;
    const currentCount = restTracker.get(playerId) || 0;
    restTracker.set(playerId, currentCount + 1);
  });

  // Reset rest counter if the player was resting
  const allPlayerIds = Array.from(restTracker.keys());
  allPlayerIds.forEach(playerId => {
    if (!participants.some(p => p.playerId === playerId)) {
      restTracker.set(playerId, 0);
    }
  });
}








/**
 * Player with team identifier for scheduling
 */
interface ScheduledPlayer {
  id: string;
  first_name: string;
  last_name: string;
  teamId: TeamId;
}

/**
 * Generate proper all-combinations schedule ensuring each player partners with teammates exactly twice
 * @param teamA - Players from team A
 * @param teamAId - Team A identifier
 * @param teamB - Players from team B  
 * @param teamBId - Team B identifier
 * @param maxRounds - Maximum number of rounds to generate
 * @returns Array of rounds, each containing array of matches (court assignments)
 */
function generateAllCombinationsSchedule(
  teamA: Player[], 
  teamAId: TeamId, 
  teamB: Player[], 
  teamBId: TeamId,
  maxRounds: number
): ScheduledPlayer[][][] {
  // Convert players to scheduled players with team info
  const scheduledTeamA: ScheduledPlayer[] = teamA.map(p => ({ ...p, teamId: teamAId }));
  const scheduledTeamB: ScheduledPlayer[] = teamB.map(p => ({ ...p, teamId: teamBId }));
  
  // Generate all unique pair combinations for each team
  const teamAPairs = generatePlayerCombinations(scheduledTeamA, 2);
  const teamBPairs = generatePlayerCombinations(scheduledTeamB, 2);
  
  console.log(`🎾 All combinations scheduling:`, {
    teamA: teamA.length,
    teamB: teamB.length,
    teamAPairs: teamAPairs.length,
    teamBPairs: teamBPairs.length
  });
  
  // Create complete match list: every Team A pair vs every Team B pair
  const allMatches: { teamAPair: ScheduledPlayer[], teamBPair: ScheduledPlayer[] }[] = [];
  
  for (const teamAPair of teamAPairs) {
    for (const teamBPair of teamBPairs) {
      allMatches.push({ teamAPair, teamBPair });
    }
  }
  
  console.log(`🎾 Total possible matches: ${allMatches.length}`);
  
  // Track player consecutive games to prevent more than 2 in a row
  const playerConsecutiveGames = new Map<string, number>();
  [...scheduledTeamA, ...scheduledTeamB].forEach(player => {
    playerConsecutiveGames.set(player.id, 0);
  });
  
  const rounds: ScheduledPlayer[][][] = [];
  const scheduledMatches = new Set<string>();
  
  let roundIndex = 0;
  // Remove maxRounds constraint for all-combinations - we want to schedule ALL matches
  while (scheduledMatches.size < allMatches.length) {
    const roundMatches: ScheduledPlayer[][] = [];
    const roundPlayers = new Set<string>();
    
    // Try to schedule up to 2 matches per round (2 courts)
    for (let courtIndex = 0; courtIndex < 2 && roundMatches.length < 2; courtIndex++) {
      let bestMatch = null;
      let bestScore = -1000; // Start with very low score
      
      // Find the best available match for this court
      for (const match of allMatches) {
        const matchKey = `${match.teamAPair.map(p => p.id).sort().join(',')}vs${match.teamBPair.map(p => p.id).sort().join(',')}`;
        
        if (scheduledMatches.has(matchKey)) continue;
        
        const allMatchPlayers = [...match.teamAPair, ...match.teamBPair];
        
        // Check if any player is already scheduled in this round
        if (allMatchPlayers.some(player => roundPlayers.has(player.id))) continue;
        
        // Check consecutive games constraint (max 2) - but allow if no other options
        const hasPlayersAtLimit = allMatchPlayers.some(player => (playerConsecutiveGames.get(player.id) || 0) >= 2);
        
        // Calculate priority score (prioritize players who have played less)
        const totalConsecutiveGames = allMatchPlayers.reduce((sum, player) => 
          sum + (playerConsecutiveGames.get(player.id) || 0), 0
        );
        
        let score = -totalConsecutiveGames; // Lower consecutive games = higher priority
        
        // Penalize matches with players at the limit, but don't exclude them entirely
        if (hasPlayersAtLimit) {
          score -= 100; // Heavy penalty but still allow
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { match, matchKey };
        }
      }
      
      if (bestMatch) {
        const { match, matchKey } = bestMatch;
        const allMatchPlayers = [...match.teamAPair, ...match.teamBPair];
        
        roundMatches.push(allMatchPlayers);
        scheduledMatches.add(matchKey);
        
        // Mark players as scheduled for this round
        allMatchPlayers.forEach(player => roundPlayers.add(player.id));
        
        // Update consecutive games counter
        allMatchPlayers.forEach(player => {
          const current = playerConsecutiveGames.get(player.id) || 0;
          playerConsecutiveGames.set(player.id, current + 1);
        });
        
        console.log(`🎾 Round ${roundIndex + 1} Court ${courtIndex + 1}: ${match.teamAPair.map(p => p.first_name).join(' & ')} vs ${match.teamBPair.map(p => p.first_name).join(' & ')}`);
      }
    }
    
    if (roundMatches.length > 0) {
      rounds.push(roundMatches);
      
      // Reset consecutive games for players not playing this round
      const playingThisRound = new Set(roundMatches.flat().map(p => p.id));
      playerConsecutiveGames.forEach((count, playerId) => {
        if (!playingThisRound.has(playerId)) {
          playerConsecutiveGames.set(playerId, 0);
        }
      });
      
      console.log(`🎾 Round ${roundIndex + 1} Complete: Scheduled ${roundMatches.length} matches, Total scheduled: ${scheduledMatches.size}/${allMatches.length}`);
    } else {
      // If we can't schedule any matches in this round, we need to reset some player counters
      console.log(`🎾 Round ${roundIndex + 1}: No matches could be scheduled, forcing reset`);
      
      // Reset all players who have played 2+ consecutive games
      let resetCount = 0;
      playerConsecutiveGames.forEach((count, playerId) => {
        if (count >= 2) {
          playerConsecutiveGames.set(playerId, 0);
          resetCount++;
        }
      });
      
      console.log(`🎾 Reset ${resetCount} players from consecutive game limits`);
      
      // If still no progress after reset, something is wrong
      if (resetCount === 0) {
        console.warn('⚠️ No matches could be scheduled and no players to reset - breaking loop');
        break;
      }
    }
    
    roundIndex++;
    
    // Safety break to prevent infinite loops (much higher limit)
    if (roundIndex > allMatches.length * 3) {
      console.warn('⚠️ Breaking out of scheduling loop - may not have scheduled all matches');
      break;
    }
  }
  
  // Log final scheduling statistics
  console.log('🎾 Final All-Combinations Schedule:', {
    totalRounds: rounds.length,
    totalMatchesScheduled: scheduledMatches.size,
    totalPossibleMatches: allMatches.length,
    completionRate: `${Math.round(scheduledMatches.size / allMatches.length * 100)}%`
  });
  
  return rounds;
}

/**
 * Generate all unique combinations of players for a team
 * @param players - Array of players from a team
 * @param size - Number of players to select for each combination
 * @returns Array of all unique player combinations
 */
function generatePlayerCombinations<T>(players: T[], size: number): T[][] {
  if (size > players.length || size <= 0) return [];
  if (size === 1) return players.map(p => [p]);
  
  const combinations: T[][] = [];
  
  function backtrack(start: number, current: T[]) {
    if (current.length === size) {
      combinations.push([...current]);
      return;
    }
    
    for (let i = start; i < players.length; i++) {
      current.push(players[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return combinations;
}

export function generateRoundRobinWithPlayers(
  teamPlayerMap: Map<TeamId, Player[]>,
  preferredTeamSize: number,
  rotationOptions?: PlayerRotationOptions
): MatchTemplate[] {
  console.log('🎯 [DATA FLOW] generateRoundRobinWithPlayers called with:', {
    teamPlayerMapSize: teamPlayerMap.size,
    preferredTeamSize,
    rotationOptions,
    teamIds: Array.from(teamPlayerMap.keys()),
    teamSizes: Array.from(teamPlayerMap.values()).map(team => team.length)
  })
  const matches: MatchTemplate[] = [];
  const teamIds = Array.from(teamPlayerMap.keys());
  let matchIndex = 0;
  
  // Create global player rest tracker for all teams
  const globalPlayerRestTracker = new Map<string, number>(); // playerId -> consecutive games count
  
  // Initialize tracker for all players
  teamPlayerMap.forEach((players, teamId) => {
    players.forEach(player => {
      globalPlayerRestTracker.set(player.id, 0);
    });
  });

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
        const rotationType = rotationOptions?.playerRotation || 'head-to-head';
        const numberOfRounds = rotationOptions?.numberOfRounds || 1;
        
        if (rotationType === 'all-combinations') {
          // Generate all unique combinations for doubles (2 players per team)
          const teamACombinations = generatePlayerCombinations(teamA, playersPerMatch);
          const teamBCombinations = generatePlayerCombinations(teamB, playersPerMatch);
          
          // To ensure each player plays with teammates exactly twice, we need to duplicate combinations
          const teamAExpandedCombinations = [...teamACombinations, ...teamACombinations];
          const teamBExpandedCombinations = [...teamBCombinations, ...teamBCombinations];
          
          console.log(`🔄 All combinations for Round Robin ${teamAId} vs ${teamBId}:`, {
            teamASize: teamA.length,
            teamBSize: teamB.length,
            teamACombinations: teamACombinations.length,
            teamBCombinations: teamBCombinations.length,
            teamAExpandedCombinations: teamAExpandedCombinations.length,
            teamBExpandedCombinations: teamBExpandedCombinations.length,
            playersPerMatch
          });
          
          // Create matches for all combination pairs, respecting numberOfRounds limit
          const maxMatches = Math.min(
            teamAExpandedCombinations.length,
            teamBExpandedCombinations.length,
            numberOfRounds
          );
          
          for (let comboIndex = 0; comboIndex < maxMatches; comboIndex++) {
            const participants: GeneratedParticipant[] = [];
            
            // Add players from Team A combination
            teamAExpandedCombinations[comboIndex].forEach(player => {
              participants.push({
                playerId: player.id,
                team: teamAId
              });
            });
            
            // Add players from Team B combination
            teamBExpandedCombinations[comboIndex].forEach(player => {
              participants.push({
                playerId: player.id,
                team: teamBId
              });
            });
            
            const matchType = playersPerMatch === 1 ? 'Singles' : 'Doubles';
            const maxPlayers = playersPerMatch * 2;
            const matchNumber = comboIndex + 1;
            
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
              description: `Round Robin: Team ${teamAId} vs Team ${teamBId} - Match ${matchNumber} (All Combinations)`,
              notes: 'Round Robin tournament match with all player combinations for balanced play',
              participants
            });
            matchIndex++;
            
            // Update global rest tracker
            updateGlobalPlayerRestTracker(participants, globalPlayerRestTracker);
          }
        } else {
          // Default head-to-head rotation with global player rest enforcement
          for (let matchRound = 0; matchRound < numberOfRounds; matchRound++) {
            const participants: GeneratedParticipant[] = [];
            
            // Select players from Team A considering global rest
            const teamASelectedPlayers = selectPlayersWithGlobalRest(teamA, teamAId, playersPerMatch, globalPlayerRestTracker);
            teamASelectedPlayers.forEach(player => {
              participants.push({ playerId: player.id, team: teamAId });
            });
            
            // Select players from Team B considering global rest
            const teamBSelectedPlayers = selectPlayersWithGlobalRest(teamB, teamBId, playersPerMatch, globalPlayerRestTracker);
            teamBSelectedPlayers.forEach(player => {
              participants.push({ playerId: player.id, team: teamBId });
            });
            
            const matchType = playersPerMatch === 1 ? 'Singles' : 'Doubles';
            const maxPlayers = playersPerMatch * 2;
            const matchNumber = matchRound + 1;
            
            // Only create match if we have enough players
            if (participants.length === playersPerMatch * 2) {
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
                description: `Round Robin: Team ${teamAId} vs Team ${teamBId} - Match ${matchNumber} (Head-to-Head)`,
                notes: 'Round Robin tournament match with global player rotation',
                participants
              });
              matchIndex++;
              
              // Update global rest tracker
              updateGlobalPlayerRestTracker(participants, globalPlayerRestTracker);
            }
          }
        }
      }
    }
  }
  
  // Log final player game counts
  console.log('🔄 Final player consecutive game counts (Round Robin):', 
    Array.from(globalPlayerRestTracker.entries()).reduce((acc, [playerId, count]) => {
      const player = Array.from(teamPlayerMap.values()).flat().find(p => p.id === playerId);
      if (player) {
        acc[`${player.first_name} ${player.last_name}`] = count;
      }
      return acc;
    }, {} as Record<string, number>)
  );
  
  console.log('🎯 [DATA FLOW] generateRoundRobinWithPlayers result:', {
    matchesCount: matches.length,
    matches: matches.map(m => ({ id: m.id, title: m.title, participantsCount: m.participants.length, max_players: m.max_players }))
  })
  return matches;
}
