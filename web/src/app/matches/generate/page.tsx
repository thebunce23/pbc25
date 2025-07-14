'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Target, Shuffle, Play, Save, Plus, Minus, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { matchService } from '@/lib/services/match-service'
import courtService from '@/lib/services/court-service'
import { playerService } from '@/lib/services/player-service'
import { 
  CreateMatchData, 
  Court, 
  Player, 
  GeneratedParticipant, 
  MatchTemplate, 
  TeamId
} from '@/types/match'
import { getTeamIds } from '@/lib/utils/match-utils'
import { calculateOptimalTeamSizes, generateRoundRobinWithPlayers, buildParticipantsForMatch } from '@/lib/utils/team-utils'

// Color palette for team assignments
const colorPalette = [
  { background: 'bg-blue-100', text: 'text-blue-600', lightBackground: 'bg-blue-50' },
  { background: 'bg-purple-100', text: 'text-purple-600', lightBackground: 'bg-purple-50' },
  { background: 'bg-green-100', text: 'text-green-600', lightBackground: 'bg-green-50' },
  { background: 'bg-pink-100', text: 'text-pink-600', lightBackground: 'bg-pink-50' },
  { background: 'bg-yellow-100', text: 'text-yellow-600', lightBackground: 'bg-yellow-50' }
]

interface GenerationSettings {
  balanceSkills: boolean
  allowMixedSkills: boolean
  preferSimilarRatings: boolean
  maxSkillDifference: number
  prioritizeActiveMembers: boolean
  includeNewMembers: boolean
}

export default function GenerateMatchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courts, setCourts] = useState<Court[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([])
  const [matchTemplates, setMatchTemplates] = useState<MatchTemplate[]>([])
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    balanceSkills: true,
    allowMixedSkills: true,
    preferSimilarRatings: false,
    maxSkillDifference: 2,
    prioritizeActiveMembers: true,
    includeNewMembers: true
  })
  
  const [activeTab, setActiveTab] = useState('single')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [matchDuration, setMatchDuration] = useState(90)
  const [breakBetweenMatches] = useState(15)
  const [teamSize, setTeamSize] = useState(4)

  // Single match form data
  const [singleMatchData, setSingleMatchData] = useState<CreateMatchData>({
    title: '',
    match_type: 'Doubles',
    skill_level: 'Mixed',
    court_id: '',
    date: '',
    time: '',
    duration_minutes: 90,
    max_players: 4,
    description: '',
    notes: ''
  })

  useEffect(() => {
    loadInitialData()
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    setSingleMatchData(prev => ({ ...prev, date: today }))
  }, [])

  // Update max_players when teamSize changes
  useEffect(() => {
    setSingleMatchData(prev => ({ ...prev, max_players: teamSize * 2 }))
  }, [teamSize])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [courtsData, playersData] = await Promise.all([
        courtService.getAllCourts(),
        playerService.getPlayers({ status: 'active' })
      ])
      setCourts(courtsData)
      setPlayers(playersData)
      setAvailablePlayers(playersData.map(p => p.id))
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMatchTemplate = () => {
    const newTemplate: MatchTemplate = {
      id: Date.now().toString(),
      title: `Match ${matchTemplates.length + 1}`,
      match_type: 'Doubles',
      skill_level: 'Mixed',
      court_id: '',
      date: selectedDate,
      time: startTime,
      duration_minutes: matchDuration,
      max_players: teamSize * 2, // Compute max_players based on teamSize
      description: '',
      notes: '',
      participants: [] // Will be populated with team assignments when players are added
    }
    setMatchTemplates([...matchTemplates, newTemplate])
  }

  const removeMatchTemplate = (id: string) => {
    setMatchTemplates(matchTemplates.filter(t => t.id !== id))
  }

  const updateMatchTemplate = (id: string, field: keyof MatchTemplate, value: string | number) => {
    setMatchTemplates(matchTemplates.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  const generateTimeSlots = () => {
    const slots = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    while (start < end) {
      slots.push(start.toTimeString().slice(0, 5))
      start.setMinutes(start.getMinutes() + matchDuration + breakBetweenMatches)
    }
    
    return slots
  }

  const generateBalancedMatches = () => {
const timeSlots = generateTimeSlots()
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    const optimal = calculateOptimalTeamSizes(availablePlayersList.length, teamSize)
    const playersNeeded = optimal.teamSize * 2
    
    if (availablePlayersList.length < playersNeeded) {
      alert(`Need at least ${playersNeeded} players to generate matches`)
      return
    }

    // Group players by skill level if balance skills is enabled
    // const playersBySkill = generationSettings.balanceSkills 
    //   ? groupPlayersBySkill(availablePlayersList)
    //   : { Mixed: availablePlayersList }

    const newTemplates: MatchTemplate[] = []
    let playerPool = [...availablePlayersList]

    timeSlots.forEach((timeSlot, slotIndex) => {
      courts.forEach((court, courtIndex) => {
if (playerPool.length >= playersNeeded) {
          const matchPlayers = selectPlayersForMatch(playerPool, playersNeeded)
          if (matchPlayers.length >= playersNeeded) {
            // Assign teams based on dynamic teamIds
const { participants } = buildParticipantsForMatch(matchPlayers, optimal.teamSize)
            
            const template: MatchTemplate = {
              id: `${slotIndex}-${courtIndex}-${Date.now()}`,
              title: `${timeSlot} - ${court.name}`,
              match_type: 'Doubles',
              skill_level: determineBestSkillLevel(participants),
court_id: court.id,
              date: selectedDate,
              time: timeSlot,
              duration_minutes: matchDuration,
              max_players: playersNeeded,
              description: `Auto-generated match for ${timeSlot}`,
              notes: 'Generated using intelligent player matching',
              participants
            }
            newTemplates.push(template)
            
// Remove selected players from pool (based on actual participants)
            const usedPlayerIds = participants.map(p => p.playerId)
            playerPool = playerPool.filter(p => !usedPlayerIds.includes(p.id))
          }
        }
      })
    })

    setMatchTemplates(newTemplates)
  }

  // Unused for now - keeping for reference
  // const groupPlayersBySkill = (playersList: Player[]) => {
  //   return playersList.reduce((groups, player) => {
  //     const skill = player.skill_level || 'Mixed'
  //     if (!groups[skill]) groups[skill] = []
  //     groups[skill].push(player)
  //     return groups
  //   }, {} as Record<string, Player[]>)
  // }

const selectPlayersForMatch = (playerPool: Player[], count: number = 4) => {
    if (!generationSettings.balanceSkills) {
      return playerPool.slice(0, count)
    }

    // Try to balance skills
    const shuffled = [...playerPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const determineBestSkillLevel = (participants: GeneratedParticipant[]) => {
    const matchPlayers = participants.map(p => players.find(player => player.id === p.playerId)).filter(Boolean) as Player[]
    const skills = matchPlayers.map(p => p.skill_level).filter(Boolean)
    if (skills.length === 0) return 'Mixed'
    
    const skillCounts = skills.reduce((counts, skill) => {
      counts[skill] = (counts[skill] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    const mostCommon = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    return mostCommon || 'Mixed'
  }

  const generateMixedFormat = () => {
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    if (availablePlayersList.length < 4) {
      alert('Need at least 4 players to generate mixed format matches')
      return
    }

    const timeSlots = generateTimeSlots()
    const newTemplates: MatchTemplate[] = []
    let playerPool = [...availablePlayersList]
    let matchIndex = 0

    // Calculate optimal mix based on player count
    const totalPlayers = playerPool.length
    const { doublesMatches, singlesMatches } = calculateOptimalMix(totalPlayers)
    
    // Shuffle players to ensure fairness
    playerPool = playerPool.sort(() => Math.random() - 0.5)

    // Generate doubles matches first
    for (let i = 0; i < doublesMatches && playerPool.length >= 4; i++) {
      const timeSlot = timeSlots[Math.floor(matchIndex / courts.length)] || startTime
      const court = courts[matchIndex % courts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 4) // Take first 4 players
        // Assign teams for doubles based on dynamic teamIds
const { participants } = buildParticipantsForMatch(matchPlayers, 2)
        
        const template: MatchTemplate = {
          id: `mixed-d-${i}-${Date.now()}`,
          title: `Doubles Match ${i + 1}`,
          match_type: 'Doubles',
          skill_level: determineBestSkillLevel(participants),
          court_id: court.id,
          date: selectedDate,
          time: timeSlot,
          duration_minutes: matchDuration,
          max_players: 4,
          description: `Mixed format - Doubles ${i + 1}`,
          notes: 'Part of mixed format generation',
          participants
        }
        newTemplates.push(template)
        matchIndex++
      }
    }

    // Generate singles matches
    for (let i = 0; i < singlesMatches && playerPool.length >= 2; i++) {
      const timeSlot = timeSlots[Math.floor(matchIndex / courts.length)] || startTime
      const court = courts[matchIndex % courts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 2) // Take first 2 players
        // Assign teams for singles based on dynamic teamIds
const { participants } = buildParticipantsForMatch(matchPlayers, 2)
        
        const template: MatchTemplate = {
          id: `mixed-s-${i}-${Date.now()}`,
          title: `Singles Match ${i + 1}`,
          match_type: 'Singles',
          skill_level: determineBestSkillLevel(participants),
          court_id: court.id,
          date: selectedDate,
          time: timeSlot,
          duration_minutes: matchDuration,
          max_players: 2,
          description: `Mixed format - Singles ${i + 1}`,
          notes: 'Part of mixed format generation',
          participants
        }
        newTemplates.push(template)
        matchIndex++
      }
    }

    // Handle any remaining players with additional matches
    if (playerPool.length >= 4) {
      // Create another doubles match if 4+ players remain
      const timeSlot = timeSlots[Math.floor(matchIndex / courts.length)] || startTime
      const court = courts[matchIndex % courts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 4)
        // Assign teams for extra doubles based on dynamic teamIds
        const { participants } = buildParticipantsForMatch(matchPlayers, 2)
        
        const template: MatchTemplate = {
          id: `mixed-extra-d-${Date.now()}`,
          title: `Extra Doubles Match`,
          match_type: 'Doubles',
          skill_level: determineBestSkillLevel(participants),
          court_id: court.id,
          date: selectedDate,
          time: timeSlot,
          duration_minutes: matchDuration,
          max_players: 4,
          description: 'Mixed format - Extra doubles for remaining players',
          notes: 'Part of mixed format generation',
          participants
        }
        newTemplates.push(template)
        matchIndex++
      }
    } else if (playerPool.length >= 2) {
      // Create a singles match if 2-3 players remain
      const timeSlot = timeSlots[Math.floor(matchIndex / courts.length)] || startTime
      const court = courts[matchIndex % courts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 2)
        // Assign teams for extra singles based on dynamic teamIds
const { participants } = buildParticipantsForMatch(matchPlayers, 1)
        
        const template: MatchTemplate = {
          id: `mixed-extra-s-${Date.now()}`,
          title: `Extra Singles Match`,
          match_type: 'Singles',
          skill_level: determineBestSkillLevel(participants),
          court_id: court.id,
          date: selectedDate,
          time: timeSlot,
          duration_minutes: matchDuration,
          max_players: 2,
          description: 'Mixed format - Extra singles for remaining players',
          notes: 'Part of mixed format generation',
          participants
        }
        newTemplates.push(template)
      }
    }

    setMatchTemplates(newTemplates)
  }

  const calculateOptimalMix = (totalPlayers: number) => {
    // Logic to determine optimal mix of doubles and singles matches
    if (totalPlayers < 4) {
      return { doublesMatches: 0, singlesMatches: Math.floor(totalPlayers / 2) }
    }
    
    // For your example: 10 players = 2 doubles (8 players) + 1 singles (2 players)
    if (totalPlayers >= 10) {
      const doublesMatches = Math.floor(totalPlayers * 0.8 / 4) // 80% in doubles
      const remainingPlayers = totalPlayers - (doublesMatches * 4)
      const singlesMatches = Math.floor(remainingPlayers / 2)
      return { doublesMatches, singlesMatches }
    }
    
    // For smaller groups, prioritize doubles
    if (totalPlayers >= 8) {
      return { doublesMatches: 1, singlesMatches: Math.floor((totalPlayers - 4) / 2) }
    }
    
    if (totalPlayers >= 6) {
      return { doublesMatches: 1, singlesMatches: 1 }
    }
    
    // For 4-5 players, just one doubles match
    return { doublesMatches: 1, singlesMatches: 0 }
  }


  const generateTeamMatches = () => {
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    if (availablePlayersList.length < 6) {
      alert('Need at least 6 players to generate team matches (minimum 3 per team)')
      return
    }

    // Sort players by skill level for better team balancing
    const sortedPlayers = sortPlayersBySkill(availablePlayersList)
    const teams = createBalancedTeams(sortedPlayers)
    
    if (teams.length < 2) {
      alert('Not enough players to create balanced teams')
      return
    }

    // 1. Use optimal-team result to compute teamIds
    const teamCount = teams.length
    const teamIds = getTeamIds(teamCount)
    
    // 2. Distribute players into Map<TeamId, Player[]>
    const teamPlayerMap = new Map<TeamId, Player[]>()
    for (let i = 0; i < teams.length; i++) {
      teamPlayerMap.set(teamIds[i], teams[i])
    }

    // 3. Generate round-robin matches with player assignments using the helper
    const roundRobinMatches = generateRoundRobinWithPlayers(teamPlayerMap)
    
    // 4. Enhance the matches with time slots and court assignments
    const enhancedMatches = enhanceMatchesWithTimeAndCourt(roundRobinMatches)
    
    setMatchTemplates(enhancedMatches)
  }

  const enhanceMatchesWithTimeAndCourt = (matches: MatchTemplate[]): MatchTemplate[] => {
    const timeSlots = generateTimeSlots()
    let courtIndex = 0
    
    return matches.map((match, index) => {
      // Assign time and court
      const timeSlot = timeSlots[Math.floor(index / courts.length)] || startTime
      const court = courts[courtIndex % courts.length]
      
      if (court) {
        return {
          ...match,
          id: `team-match-${index}`,
          court_id: court.id,
          date: selectedDate,
          time: timeSlot
        }
      }
      
      courtIndex++
      return match
    })
  }

  // Unused function - keeping for reference
  /*
  const generateRoundRobinMatches = (teamPlayerMap: Map<TeamId, Player[]>, teamIds: TeamId[]): MatchTemplate[] => {
    const timeSlots = generateTimeSlots()
    const newTemplates: MatchTemplate[] = []
    let matchIndex = 0

    // Generate full round-robin between all teams
    for (let teamAIndex = 0; teamAIndex < teamIds.length - 1; teamAIndex++) {
      for (let teamBIndex = teamAIndex + 1; teamBIndex < teamIds.length; teamBIndex++) {
        const teamAId = teamIds[teamAIndex]
        const teamBId = teamIds[teamBIndex]
        const teamA = teamPlayerMap.get(teamAId)!
        const teamB = teamPlayerMap.get(teamBId)!
        
        // Generate multiple matches between these teams with different player combinations
        const teamMatches = generateTeamVsTeamMatches(teamA, teamB)
        
        teamMatches.forEach(matchPlayers => {
          const timeSlot = timeSlots[Math.floor(matchIndex / courts.length)] || startTime
          const court = courts[matchIndex % courts.length]
          
          if (court && matchPlayers.length >= 4) {
            // 4. Store template.participants with correct dynamic team values
            const participants: GeneratedParticipant[] = [
              { playerId: matchPlayers[0].id, team: teamAId },
              { playerId: matchPlayers[1].id, team: teamAId },
              { playerId: matchPlayers[2].id, team: teamBId },
              { playerId: matchPlayers[3].id, team: teamBId }
            ]

            const template: MatchTemplate = {
              id: `team-${teamAId}-${teamBId}-${matchIndex}-${Date.now()}`,
              title: `Team ${teamAId} vs Team ${teamBId} - Match ${Math.floor(matchIndex / teamMatches.length) + 1}`,
              match_type: 'Doubles',
              skill_level: determineBestSkillLevel(participants),
              court_id: court.id,
              date: selectedDate,
              time: timeSlot,
              duration_minutes: matchDuration,
              max_players: 4,
              description: `Team ${teamAId} vs Team ${teamBId} - ${getMatchDescription(matchPlayers, teamA, teamB)}`,
              notes: `Team match: ${getTeamPlayersDescription(teamA)} vs ${getTeamPlayersDescription(teamB)}`,
              participants
            }
            newTemplates.push(template)
            matchIndex++
          }
        })
      }
    }

    return newTemplates
  }
  */

  const sortPlayersBySkill = (playersList: Player[]) => {
    const skillOrder = { 'Professional': 5, 'Advanced': 4, 'Intermediate': 3, 'Beginner': 2, '': 1 }
    return [...playersList].sort((a, b) => {
      const skillA = skillOrder[a.skill_level as keyof typeof skillOrder] || 1
      const skillB = skillOrder[b.skill_level as keyof typeof skillOrder] || 1
      return skillB - skillA // Higher skill first
    })
  }

  const createBalancedTeams = (sortedPlayers: Player[]) => {
    const teams: Player[][] = []
    const totalPlayers = sortedPlayers.length
    const optimalSizes = calculateOptimalTeamSizes(totalPlayers, teamSize)
    
    if (!optimalSizes.isValid) {
      return teams
    }
    
    let playerIndex = 0
    
    // Use the playersPerTeam array to create teams with the specified sizes
    for (let i = 0; i < optimalSizes.playersPerTeam.length && playerIndex < totalPlayers; i++) {
      const currentTeamSize = optimalSizes.playersPerTeam[i]
      const team = []
      
      for (let j = 0; j < currentTeamSize && playerIndex < totalPlayers; j++) {
        team.push(sortedPlayers[playerIndex])
        playerIndex++
      }
      
      if (team.length >= 3) {
        teams.push(team)
      }
    }
    
    return teams
  }


  // Unused for now - keeping for reference
  // const generateTeamVsTeamMatches = (teamA: Player[], teamB: Player[]) => {
  //   const matches: Player[][] = []
  //   
  //   // Match 1: Top 2 players from each team
  //   if (teamA.length >= 2 && teamB.length >= 2) {
  //     matches.push([teamA[0], teamA[1], teamB[0], teamB[1]])
  //   }
  //   
  //   // Match 2: Mix of players (1st + 3rd vs 1st + 3rd, or 2nd + 3rd vs 2nd + 3rd)
  //   if (teamA.length >= 3 && teamB.length >= 3) {
  //     matches.push([teamA[0], teamA[2], teamB[0], teamB[2]])
  //   }
  //   
  //   // Match 3: Remaining players if teams have 4 players
  //   if (teamA.length >= 4 && teamB.length >= 4) {
  //     matches.push([teamA[1], teamA[3], teamB[1], teamB[3]])
  //   }
  //   
  //   return matches
  // }

  // Unused for now - keeping for reference
  // const getMatchDescription = (matchPlayers: Player[], teamA: Player[], teamB: Player[]) => {
  //   const teamAPlayers = matchPlayers.filter(p => teamA.some(ta => ta.id === p.id))
  //   const teamBPlayers = matchPlayers.filter(p => teamB.some(tb => tb.id === p.id))
  //   
  //   const teamAPos = teamAPlayers.map(p => teamA.findIndex(ta => ta.id === p.id) + 1)
  //   const teamBPos = teamBPlayers.map(p => teamB.findIndex(tb => tb.id === p.id) + 1)
  //   
  //   return `Players ${teamAPos.join(' & ')} vs Players ${teamBPos.join(' & ')}`
  // }

  // const getTeamPlayersDescription = (team: Player[]) => {
  //   return team.map((p, i) => `${i + 1}. ${p.first_name} ${p.last_name}`).join(', ')
  // }

  const generateRoundRobin = () => {
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    if (availablePlayersList.length < 4) {
      alert('Need at least 4 players for round robin')
      return
    }

    // Generate all possible combinations of 4 players
    const combinations = []
    for (let i = 0; i < availablePlayersList.length - 3; i++) {
      for (let j = i + 1; j < availablePlayersList.length - 2; j++) {
        for (let k = j + 1; k < availablePlayersList.length - 1; k++) {
          for (let l = k + 1; l < availablePlayersList.length; l++) {
            combinations.push([
              availablePlayersList[i],
              availablePlayersList[j], 
              availablePlayersList[k],
              availablePlayersList[l]
            ])
          }
        }
      }
    }

    const timeSlots = generateTimeSlots()
    const newTemplates: MatchTemplate[] = []

    combinations.slice(0, timeSlots.length * courts.length).forEach((combo, index) => {
      const timeSlot = timeSlots[Math.floor(index / courts.length)] || startTime
      const court = courts[index % courts.length]
      
      if (court) {
        // Assign teams for round robin based on dynamic teamIds
const { participants } = buildParticipantsForMatch(combo, 2)
        
        const template: MatchTemplate = {
          id: `rr-${index}-${Date.now()}`,
          title: `Round Robin ${index + 1}`,
          match_type: 'Doubles',
          skill_level: determineBestSkillLevel(participants),
          court_id: court.id,
          date: selectedDate,
          time: timeSlot,
          duration_minutes: matchDuration,
          max_players: 4,
          description: `Round robin match ${index + 1}`,
          notes: 'Part of round robin tournament',
          participants
        }
        newTemplates.push(template)
      }
    })

    setMatchTemplates(newTemplates)
  }

  const handleCreateSingleMatch = async () => {
    if (!singleMatchData.title || !singleMatchData.date || !singleMatchData.time) {
      alert('Please fill in all required fields')
      return
    }

    // Validate that max_players aligns with participant count
    if (singleMatchData.max_players && singleMatchData.max_players !== teamSize * 2) {
      alert(`Max players (${singleMatchData.max_players}) should equal team size × 2 (${teamSize * 2})`)
      return
    }

    try {
      setLoading(true)
      await matchService.createMatch(singleMatchData)
      router.push('/matches')
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('Failed to create match. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAllMatches = async () => {
    if (matchTemplates.length === 0) {
      alert('No matches to create')
      return
    }

    try {
      setLoading(true)
const promises = matchTemplates.map(async template => {
        const matchData = {
          ...template,
        };
        delete (matchData as Record<string, unknown>).id;

        const match = await matchService.createMatch(matchData);

        const participantPromises = template.participants.map(participant => {
          return matchService.addPlayerToMatch(match.id, participant.playerId, participant.team);
        });

        await Promise.all(participantPromises);
      });

      await Promise.all(promises);
      router.push('/matches')
    } catch (error) {
      console.error('Failed to create matches:', error)
      alert('Failed to create some matches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Generate Matches">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/matches">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matches
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Generate Matches</h1>
              <p className="text-gray-600">Create single matches or generate multiple matches automatically</p>
            </div>
          </div>
        </div>

        {/* Available Players Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Available Players ({availablePlayers.length} selected)
            </CardTitle>
            <CardDescription>
              Select which players are available today for match generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAvailablePlayers(players.map(p => p.id))}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAvailablePlayers([])}
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {players.map((player) => (
                <div key={player.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={player.id}
                    checked={availablePlayers.includes(player.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAvailablePlayers(prev => [...prev, player.id])
                      } else {
                        setAvailablePlayers(prev => prev.filter(id => id !== player.id))
                      }
                    }}
                  />
                  <Label htmlFor={player.id} className="text-sm cursor-pointer flex-1">
                    {player.first_name} {player.last_name}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {player.skill_level}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Match</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
          </TabsList>

          {/* Single Match Tab */}
          <TabsContent value="single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Single Match</CardTitle>
                <CardDescription>Create a single match with custom settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="single-title">Match Title *</Label>
                    <Input
                      id="single-title"
                      value={singleMatchData.title}
                      onChange={(e) => setSingleMatchData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Morning Doubles"
                    />
                  </div>
                  <div>
                    <Label htmlFor="single-type">Match Type</Label>
                    <Select 
                      value={singleMatchData.match_type} 
                      onValueChange={(value) => setSingleMatchData(prev => ({ ...prev, match_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Singles">Singles</SelectItem>
                        <SelectItem value="Doubles">Doubles</SelectItem>
                        <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                        <SelectItem value="Tournament">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="single-skill">Skill Level</Label>
                    <Select 
                      value={singleMatchData.skill_level} 
                      onValueChange={(value) => setSingleMatchData(prev => ({ ...prev, skill_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="single-court">Court</Label>
                    <Select 
                      value={singleMatchData.court_id} 
                      onValueChange={(value) => setSingleMatchData(prev => ({ ...prev, court_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select court" />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="single-max-players">Max Players</Label>
                    <Input
                      id="single-max-players"
                      type="number"
                      value={singleMatchData.max_players}
                      onChange={(e) => setSingleMatchData(prev => ({ ...prev, max_players: parseInt(e.target.value) }))}
                      min="2"
                      max="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="single-date">Date *</Label>
                    <Input
                      id="single-date"
                      type="date"
                      value={singleMatchData.date}
                      onChange={(e) => setSingleMatchData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="single-time">Time *</Label>
                    <Input
                      id="single-time"
                      type="time"
                      value={singleMatchData.time}
                      onChange={(e) => setSingleMatchData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="single-duration">Duration (minutes)</Label>
                    <Input
                      id="single-duration"
                      type="number"
                      value={singleMatchData.duration_minutes}
                      onChange={(e) => setSingleMatchData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                      min="30"
                      max="180"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="single-description">Description</Label>
                  <Textarea
                    id="single-description"
                    value={singleMatchData.description}
                    onChange={(e) => setSingleMatchData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleCreateSingleMatch}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Match'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Generation Tab */}
          <TabsContent value="bulk" className="space-y-6">
            {/* Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Generation Settings</CardTitle>
                <CardDescription>Configure automatic match generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bulk-date">Date</Label>
                    <Input
                      id="bulk-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="match-duration">Match Duration (min)</Label>
                    <Input
                      id="match-duration"
                      type="number"
                      value={matchDuration}
                      onChange={(e) => setMatchDuration(parseInt(e.target.value))}
                      min="30"
                      max="180"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Player Matching</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="balance-skills"
                          checked={generationSettings.balanceSkills}
                          onCheckedChange={(checked) => 
                            setGenerationSettings(prev => ({ ...prev, balanceSkills: !!checked }))
                          }
                        />
                        <Label htmlFor="balance-skills" className="text-sm">Balance skill levels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mixed-skills"
                          checked={generationSettings.allowMixedSkills}
                          onCheckedChange={(checked) => 
                            setGenerationSettings(prev => ({ ...prev, allowMixedSkills: !!checked }))
                          }
                        />
                        <Label htmlFor="mixed-skills" className="text-sm">Allow mixed skill levels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="similar-ratings"
                          checked={generationSettings.preferSimilarRatings}
                          onCheckedChange={(checked) => 
                            setGenerationSettings(prev => ({ ...prev, preferSimilarRatings: !!checked }))
                          }
                        />
                        <Label htmlFor="similar-ratings" className="text-sm">Prefer similar ratings</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Player Selection</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prioritize-active"
                          checked={generationSettings.prioritizeActiveMembers}
                          onCheckedChange={(checked) => 
                            setGenerationSettings(prev => ({ ...prev, prioritizeActiveMembers: !!checked }))
                          }
                        />
                        <Label htmlFor="prioritize-active" className="text-sm">Prioritize active members</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-new"
                          checked={generationSettings.includeNewMembers}
                          onCheckedChange={(checked) => 
                            setGenerationSettings(prev => ({ ...prev, includeNewMembers: !!checked }))
                          }
                        />
                        <Label htmlFor="include-new" className="text-sm">Include new members</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Team Configuration */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-900 mb-3">🏆 Team Match Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="team-size" className="text-sm font-medium">Preferred Team Size</Label>
                        <Select 
                          value={teamSize.toString()} 
                          onValueChange={(value) => setTeamSize(parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Players per Team</SelectItem>
                            <SelectItem value="4">4 Players per Team</SelectItem>
                            <SelectItem value="5">5 Players per Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Recommendation for {availablePlayers.length} Players</Label>
                        <div className="text-sm">
                          {(() => {
                            const recommendation = calculateOptimalTeamSizes(availablePlayers.length, teamSize)
                            return (
                              <div className={`p-2 rounded ${recommendation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {recommendation.description}
                              </div>
                            )
                          })()}
                        </div>
                        {(() => {
                          const options = calculateOptimalTeamSizes(availablePlayers.length, teamSize).options
                          return options.length > 1 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View other options</summary>
                              <div className="mt-2 space-y-1">
                                {options.slice(1).map((option, index) => (
                                  <div key={index} className="text-gray-600">
                                    • {option.description}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Generation Options:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• <strong>Balanced:</strong> Creates matches of the same type with skill balancing</li>
                      <li>• <strong>Mixed Format:</strong> Intelligently mixes singles and doubles (e.g., 10 players → 2 doubles + 1 singles)</li>
                      <li>• <strong>Team Matches (Round Robin):</strong> Creates teams with optimal sizes, generates all possible team vs team matches</li>
                      <li>• <strong>Bracket Tournament:</strong> Creates elimination-style tournament (coming soon)</li>
                      <li>• <strong>Round Robin:</strong> Generates all possible player combinations for tournament play</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button onClick={generateBalancedMatches} variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Generate Balanced Matches
                    </Button>
                    <Button onClick={generateMixedFormat} variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Generate Mixed Format
                    </Button>
                    <Button onClick={generateTeamMatches} variant="outline">
                      <Trophy className="h-4 w-4 mr-2" />
                      Generate Team Matches (Round Robin)
                    </Button>
                    <Button onClick={() => alert('Bracket generation coming soon!')} variant="outline" disabled>
                      <Trophy className="h-4 w-4 mr-2" />
                      Generate Bracket Tournament
                    </Button>
                    <Button onClick={generateRoundRobin} variant="outline">
                      <Shuffle className="h-4 w-4 mr-2" />
                      Generate Round Robin
                    </Button>
                    <Button onClick={addMatchTemplate} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual Match
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teams Section */}
            {matchTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Team Assignments
                  </CardTitle>
                  <CardDescription>
                    Players organized by teams for the generated matches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Extract unique teams from all matches with their match details
                    const teamData = new Map<string, {
                      players: Set<string>,
                      matches: MatchTemplate[],
                      opponents: Set<string>
                    }>()
                    
                    matchTemplates.forEach(template => {
                      // Group participants by team for this match
                      const teamGroups = new Map<string, string[]>()
                      template.participants.forEach(participant => {
                        if (!teamGroups.has(participant.team)) {
                          teamGroups.set(participant.team, [])
                        }
                        teamGroups.get(participant.team)!.push(participant.playerId)
                      })
                      
                      // Update team data with this match
                      Array.from(teamGroups.keys()).forEach(teamId => {
                        if (!teamData.has(teamId)) {
                          teamData.set(teamId, {
                            players: new Set(),
                            matches: [],
                            opponents: new Set()
                          })
                        }
                        
                        const team = teamData.get(teamId)!
                        // Add players
                        teamGroups.get(teamId)!.forEach(playerId => team.players.add(playerId))
                        // Add this match
                        team.matches.push(template)
                        // Add opponents
                        Array.from(teamGroups.keys()).forEach(opponentId => {
                          if (opponentId !== teamId) {
                            team.opponents.add(opponentId)
                          }
                        })
                      })
                    })
                    
                    return (
                      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:gap-6 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                        {Array.from(teamData.entries()).map(([teamId, data], teamIndex) => {
                          const color = colorPalette[teamIndex % colorPalette.length]
                          const teamPlayersArray = Array.from(data.players).map(playerId => 
                            players.find(p => p.id === playerId)
                          ).filter(Boolean)
                          
                          return (
                            <div key={teamId} className={`border rounded-lg p-4 ${color.lightBackground}`}>
                              <div className="text-center mb-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${color.background} ${color.text}`}>
                                  <span className="text-xl font-bold">{teamId}</span>
                                </div>
                                <h3 className="font-semibold text-lg">Team {teamId}</h3>
                                <p className="text-sm text-gray-500">{teamPlayersArray.length} players • {data.matches.length} matches</p>
                              </div>
                              
                              {/* Team Players */}
                              <div className="space-y-2 mb-4">
                                <h4 className="font-medium text-sm text-gray-700">Players:</h4>
                                {teamPlayersArray.map((player) => (
                                  <div key={player!.id} className={`p-2 rounded text-center bg-white border`}>
                                    <div className="font-medium text-sm">
                                      {player!.first_name} {player!.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {player!.skill_level}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Team Matches */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-700">Matches:</h4>
                                {data.matches.map((match) => {
                                  const opponent = Array.from(data.opponents).find(opponentId => 
                                    match.participants.some(p => p.team === opponentId)
                                  )
                                  
                                  return (
                                    <div key={match.id} className="p-2 rounded bg-white border text-sm">
                                      <div className="font-medium">
                                        vs Team {opponent}
                                      </div>
                                      <div className="text-xs text-gray-500 flex justify-between">
                                        <span>{match.time}</span>
                                        <span>{courts.find(c => c.id === match.court_id)?.name || 'TBD'}</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📋 For Event Organizers:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Share team assignments with players before matches begin</li>
                      <li>• Each team will play multiple matches throughout the event</li>
                      <li>• Players stay with their assigned team for all matches</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Match Templates */}
            {matchTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Matches ({matchTemplates.length})</CardTitle>
                  <CardDescription>Review team matchups and match schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matchTemplates.map((template, index) => (
                      <div key={template.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Match {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMatchTemplate(template.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={template.title}
                              onChange={(e) => updateMatchTemplate(template.id, 'title', e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Time</Label>
                            <Input
                              type="time"
                              value={template.time}
                              onChange={(e) => updateMatchTemplate(template.id, 'time', e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Court</Label>
                            <Select
                              value={template.court_id}
                              onValueChange={(value) => updateMatchTemplate(template.id, 'court_id', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {courts.map((court) => (
                                  <SelectItem key={court.id} value={court.id}>
                                    {court.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          {(() => {
                            // Group participants by team
                            const teamGroups = new Map<string, GeneratedParticipant[]>()
                            template.participants.forEach(p => {
                              if (!teamGroups.has(p.team)) {
                                teamGroups.set(p.team, [])
                              }
                              teamGroups.get(p.team)!.push(p)
                            })
                            
                            return Array.from(teamGroups.entries()).map(([teamId, participants]) => (
                              <div key={teamId} className="mb-1">
                                <strong>Team {teamId}:</strong> {participants
                                  .map(p => {
                                    const player = players.find(player => player.id === p.playerId)
                                    return player ? `${player.first_name} ${player.last_name}` : 'Unknown'
                                  })
                                  .join(', ')}
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setMatchTemplates([])}>
                      Clear All
                    </Button>
                    <Button onClick={handleCreateAllMatches} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Creating...' : `Create ${matchTemplates.length} Matches`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tournament Tab */}
          <TabsContent value="tournament" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Generation</CardTitle>
                <CardDescription>Create tournament brackets and elimination matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tournament generation coming soon!</p>
                  <p className="text-sm">This will include bracket generation, elimination rounds, and championship matches.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
