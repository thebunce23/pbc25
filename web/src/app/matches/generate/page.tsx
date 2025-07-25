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
import { getTeamIds, getTeamColorsByIndex } from '@/lib/utils/match-utils'
import { calculateOptimalTeamSizes, generateRoundRobinWithPlayers, buildParticipantsForMatch, generateTeamVsTeamMatches } from '@/lib/utils/team-utils'

interface GenerationSettings {
  balanceSkills: boolean
  allowMixedSkills: boolean
  preferSimilarRatings: boolean
  maxSkillDifference: number
  prioritizeActiveMembers: boolean
  includeNewMembers: boolean
}

// Local storage key for saved settings
const SETTINGS_STORAGE_KEY = 'matchGenerationSettings'

// Default settings
const DEFAULT_SETTINGS = {
  startTime: '09:00',
  endTime: '17:00',
  matchDuration: 90,
  includeBreaks: true,
  breakBetweenMatches: 15,
  scoringSystem: 'duration' as 'duration' | 'points',
  pointsToWin: 21,
  teamSize: 4,
  teamCountPreference: 'auto' as 'auto' | 'odd' | 'even',
  teamFormat: 'round-robin' as 'round-robin' | 'team-vs-team',
  playerRotation: 'head-to-head' as 'head-to-head' | 'all-combinations',
  numberOfRounds: 1,
  generationSettings: {
    balanceSkills: true,
    allowMixedSkills: true,
    preferSimilarRatings: false,
    maxSkillDifference: 2,
    prioritizeActiveMembers: true,
    includeNewMembers: true
  }
}

// Load settings from localStorage
const loadSavedSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsedSettings = JSON.parse(saved)
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_SETTINGS, ...parsedSettings }
    }
  } catch (error) {
    console.warn('Failed to load saved match generation settings:', error)
  }
  
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
const saveSettings = (settings: typeof DEFAULT_SETTINGS) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    console.log('💾 Match generation settings saved')
  } catch (error) {
    console.warn('Failed to save match generation settings:', error)
  }
}

export default function GenerateMatchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courts, setCourts] = useState<Court[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([])
  const [matchTemplates, setMatchTemplates] = useState<MatchTemplate[]>([])
  
  // Load saved settings or use defaults
  const savedSettings = loadSavedSettings()
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>(savedSettings.generationSettings)
  
  const [activeTab, setActiveTab] = useState('single')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState(savedSettings.startTime)
  const [endTime, setEndTime] = useState(savedSettings.endTime)
  const [matchDuration, setMatchDuration] = useState(savedSettings.matchDuration)
  const [includeBreaks, setIncludeBreaks] = useState(savedSettings.includeBreaks)
  const [breakBetweenMatches, setBreakBetweenMatches] = useState(savedSettings.breakBetweenMatches)
  const [scoringSystem, setScoringSystem] = useState<'duration' | 'points'>(savedSettings.scoringSystem)
  const [pointsToWin, setPointsToWin] = useState(savedSettings.pointsToWin)
  const [teamSize, setTeamSize] = useState(savedSettings.teamSize)
  const [teamCountPreference, setTeamCountPreference] = useState<'auto' | 'odd' | 'even'>(savedSettings.teamCountPreference)
  const [teamFormat, setTeamFormat] = useState<'round-robin' | 'team-vs-team'>(savedSettings.teamFormat)
  const [playerRotation, setPlayerRotation] = useState<'head-to-head' | 'all-combinations'>(savedSettings.playerRotation)
  const [numberOfRounds, setNumberOfRounds] = useState(savedSettings.numberOfRounds)
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  
  useEffect(() => {
    console.log('🎯 [DATA FLOW] teamSize state changed:', teamSize)
    saveCurrentSettings()
  }, [teamSize])
  
  useEffect(() => {
    console.log('🎯 [DATA FLOW] teamCountPreference state changed:', teamCountPreference)
    saveCurrentSettings()
  }, [teamCountPreference])
  
  // Auto-save settings when any configuration changes
  useEffect(() => {
    saveCurrentSettings()
  }, [startTime, endTime, matchDuration, includeBreaks, breakBetweenMatches, scoringSystem, pointsToWin, teamFormat, playerRotation, numberOfRounds])
  
  // Auto-save generation settings when they change
  useEffect(() => {
    saveCurrentSettings()
  }, [generationSettings])

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
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    setSingleMatchData(prev => ({ ...prev, date: today }))
    
    // Show a subtle indication that saved settings were loaded
    const savedSettings = loadSavedSettings()
    if (localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      console.log('📋 Loaded saved match generation settings')
    }
  }, [])

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
      setSelectedCourts(courtsData.map(c => c.id))
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
      max_players: teamSize * 2,
      description: '',
      notes: '',
      participants: []
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

  const sortPlayersBySkill = (playersList: Player[]) => {
    const skillOrder = { 'Professional': 5, 'Advanced': 4, 'Intermediate': 3, 'Beginner': 2, '': 1 }
    return [...playersList].sort((a, b) => {
      const skillA = skillOrder[a.skill_level as keyof typeof skillOrder] || 1
      const skillB = skillOrder[b.skill_level as keyof typeof skillOrder] || 1
      return skillB - skillA // Higher skill first
    })
  }

  const createBalancedTeams = (sortedPlayers: Player[], preferredTeamSize?: number) => {
    const teams: Player[][] = []
    const totalPlayers = sortedPlayers.length
    const teamSizeToUse = preferredTeamSize || teamSize
    
    // For team matches, we need equal-sized teams to ensure fair matches
    // Calculate how many complete teams we can make with the preferred size
    const completeTeamsCount = Math.floor(totalPlayers / teamSizeToUse)
    const remainingPlayers = totalPlayers % teamSizeToUse
    
    // We need at least 2 teams for matches
    if (completeTeamsCount < 2) {
      // Try to create 2 teams by adjusting team size
      if (totalPlayers >= 6) { // Minimum 3 players per team
        const adjustedTeamSize = Math.floor(totalPlayers / 2)
        const remainder = totalPlayers % 2
        
        // Create 2 teams with as equal sizes as possible
        teams.push([])
        teams.push([])
        
        // Distribute players evenly
        for (let i = 0; i < totalPlayers; i++) {
          const teamIndex = i < adjustedTeamSize + remainder ? 0 : 1
          teams[teamIndex].push(sortedPlayers[i])
        }
      }
      return teams
    }
    
    // Initialize teams with equal sizes
    for (let i = 0; i < completeTeamsCount; i++) {
      teams.push([])
    }
    
    // Distribute players using round-robin for skill balance
    // First, distribute players to make complete equal-sized teams
    let playerIndex = 0
    for (let round = 0; round < teamSizeToUse; round++) {
      for (let teamIndex = 0; teamIndex < completeTeamsCount && playerIndex < totalPlayers; teamIndex++) {
        teams[teamIndex].push(sortedPlayers[playerIndex])
        playerIndex++
      }
    }
    
    // Handle remaining players by distributing them evenly across teams
    // This ensures teams remain as equal as possible in size
    let teamIndex = 0
    while (playerIndex < totalPlayers) {
      teams[teamIndex].push(sortedPlayers[playerIndex])
      playerIndex++
      teamIndex = (teamIndex + 1) % teams.length
    }
    
    console.log('🎯 [TEAM CREATION] Created balanced teams:', {
      totalPlayers,
      teamSizeToUse,
      teamsCreated: teams.length,
      teamSizes: teams.map(t => t.length),
      teams: teams.map((team, idx) => ({
        teamIndex: idx,
        size: team.length,
        players: team.map(p => `${p.first_name} ${p.last_name}`)
      }))
    })
    
    return teams
  }

  const enhanceMatchesWithTimeAndCourt = (matches: MatchTemplate[]): MatchTemplate[] => {
    const timeSlots = generateTimeSlots()
    const availableCourts = courts.filter(court => selectedCourts.includes(court.id))
    let courtIndex = 0
    
    return matches.map((match, index) => {
      // Assign time and court
      const timeSlot = timeSlots[Math.floor(index / availableCourts.length)] || startTime
      const court = availableCourts[courtIndex % availableCourts.length]
      
      if (court) {
        courtIndex++
        return {
          ...match,
          id: `team-match-${index}`,
          court_id: court.id,
          date: selectedDate,
          time: timeSlot
        }
      }
      
      return match
    })
  }

  const generateBalancedMatches = (params?: { preferredTeamSize?: number }) => {
    const preferredTeamSize = params?.preferredTeamSize || teamSize
    const timeSlots = generateTimeSlots()
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    const optimal = calculateOptimalTeamSizes(availablePlayersList.length, preferredTeamSize)
    const playersNeeded = optimal.teamSize * 2
    
    if (availablePlayersList.length < playersNeeded) {
      alert(`Need at least ${playersNeeded} players to generate matches`)
      return
    }

    const newTemplates: MatchTemplate[] = []
    let playerPool = [...availablePlayersList]

    const availableCourts = courts.filter(court => selectedCourts.includes(court.id))
    
    timeSlots.forEach((timeSlot, slotIndex) => {
      availableCourts.forEach((court, courtIndex) => {
        if (playerPool.length >= playersNeeded) {
          const matchPlayers = selectPlayersForMatch(playerPool, playersNeeded)
          if (matchPlayers.length >= playersNeeded) {
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
              notes: `Generated using intelligent player matching${scoringSystem === 'points' ? ` • First to ${pointsToWin} points` : ''}`,
              participants
            }
            newTemplates.push(template)
            
            const usedPlayerIds = participants.map(p => p.playerId)
            playerPool = playerPool.filter(p => !usedPlayerIds.includes(p.id))
          }
        }
      })
    })

    setMatchTemplates(newTemplates)
  }

  const generateMixedFormat = (params?: { preferredTeamSize?: number }) => {
    const preferredTeamSize = params?.preferredTeamSize || teamSize
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

    const availableCourts = courts.filter(court => selectedCourts.includes(court.id))
    
    // Generate doubles matches first
    for (let i = 0; i < doublesMatches && playerPool.length >= 4; i++) {
      const timeSlot = timeSlots[Math.floor(matchIndex / availableCourts.length)] || startTime
      const court = availableCourts[matchIndex % availableCourts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 4) // Take first 4 players
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
      const timeSlot = timeSlots[Math.floor(matchIndex / availableCourts.length)] || startTime
      const court = availableCourts[matchIndex % availableCourts.length]
      
      if (court) {
        const matchPlayers = playerPool.splice(0, 2) // Take first 2 players
        const { participants } = buildParticipantsForMatch(matchPlayers, 1)
        
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

    setMatchTemplates(newTemplates)
  }

  const generateTeamMatches = (params?: { preferredTeamSize?: number }) => {
    const preferredTeamSize = params?.preferredTeamSize || teamSize
    const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
    
    if (availablePlayersList.length < 6) {
      alert('Need at least 6 players to generate team matches (minimum 3 per team)')
      return
    }

    // Sort players by skill level for better team balancing
    const sortedPlayers = sortPlayersBySkill(availablePlayersList)
    const teams = createBalancedTeams(sortedPlayers, preferredTeamSize)
    
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

    // Calculate optimal number of rounds based on available time slots
    const timeSlots = generateTimeSlots()
    const availableCourts = courts.filter(court => selectedCourts.includes(court.id))
    const totalTimeSlots = timeSlots.length * availableCourts.length
    
    // Calculate base matches needed (one round of team matchups)
    let baseMatchesNeeded = 0
    if (teamFormat === 'team-vs-team') {
      // Team vs Team: pairs of teams play against each other
      baseMatchesNeeded = Math.floor(teams.length / 2)
    } else {
      // Round Robin: all possible team pairings
      baseMatchesNeeded = (teams.length * (teams.length - 1)) / 2
    }
    
    // Calculate how many rounds we can fit in the available time slots
    const optimalRounds = baseMatchesNeeded > 0 ? Math.max(1, Math.floor(totalTimeSlots / baseMatchesNeeded)) : numberOfRounds
    
    console.log('🎯 [ROUNDS CALCULATION]:', {
      timeSlots: timeSlots.length,
      availableCourts: availableCourts.length,
      totalTimeSlots,
      baseMatchesNeeded,
      requestedRounds: numberOfRounds,
      optimalRounds
    })
    
    // 4. Generate matches based on selected team format
    let matches: MatchTemplate[]
    if (teamFormat === 'team-vs-team') {
      matches = generateTeamVsTeamMatches(
        teamPlayerMap, 
        preferredTeamSize,
        {
          playerRotation: playerRotation,
          numberOfRounds: optimalRounds
        }
      )
    } else {
      matches = generateRoundRobinWithPlayers(
        teamPlayerMap, 
        preferredTeamSize,
        {
          playerRotation: playerRotation,
          numberOfRounds: optimalRounds
        }
      )
    }
    
    // 4. Enhance the matches with time slots and court assignments
    const enhancedMatches = enhanceMatchesWithTimeAndCourt(matches)
    
    setMatchTemplates(enhancedMatches)
  }

  const generateRoundRobin = (params?: { preferredTeamSize?: number }) => {
    const preferredTeamSize = params?.preferredTeamSize || teamSize
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
    const availableCourts = courts.filter(court => selectedCourts.includes(court.id))
    const newTemplates: MatchTemplate[] = []

    combinations.slice(0, timeSlots.length * availableCourts.length).forEach((combo, index) => {
      const timeSlot = timeSlots[Math.floor(index / availableCourts.length)] || startTime
      const court = availableCourts[index % availableCourts.length]
      
      if (court) {
        const { participants } = buildParticipantsForMatch(combo, preferredTeamSize)
        
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

  // Save current settings to localStorage
  const saveCurrentSettings = () => {
    const currentSettings = {
      startTime,
      endTime,
      matchDuration,
      includeBreaks,
      breakBetweenMatches,
      scoringSystem,
      pointsToWin,
      teamSize,
      teamCountPreference,
      teamFormat,
      playerRotation,
      numberOfRounds,
      generationSettings
    }
    saveSettings(currentSettings)
  }

  const handleCreateSingleMatch = async () => {
    if (!singleMatchData.title || !singleMatchData.date || !singleMatchData.time) {
      alert('Please fill in all required fields')
      return
    }

    if (singleMatchData.max_players && singleMatchData.max_players !== teamSize * 2) {
      alert(`Max players (${singleMatchData.max_players}) should equal team size × 2 (${teamSize * 2})`)
      return
    }

    try {
      setLoading(true)
      await matchService.createMatch(singleMatchData)
      
      // Save settings after successful match creation
      saveCurrentSettings()
      
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
      
      // Save settings after successful bulk match creation
      saveCurrentSettings()
      
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
                data-cy="select-all-players"
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Match</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
          </TabsList>

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

          <TabsContent value="bulk" className="space-y-6">
            {/* Step 1: Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  Schedule & Duration
                </CardTitle>
                <CardDescription>When and how long should matches run?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bulk-date" className="text-sm font-medium">Date</Label>
                    <Input
                      id="bulk-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time" className="text-sm font-medium">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm font-medium">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="match-duration" className="text-sm font-medium">Duration (min)</Label>
                    <Input
                      id="match-duration"
                      type="number"
                      value={matchDuration}
                      onChange={(e) => setMatchDuration(parseInt(e.target.value))}
                      min="30"
                      max="180"
                      disabled={scoringSystem === 'points'}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-breaks"
                      checked={includeBreaks}
                      onCheckedChange={(checked) => setIncludeBreaks(!!checked)}
                    />
                    <Label htmlFor="include-breaks" className="text-sm">Include {breakBetweenMatches}min breaks</Label>
                  </div>
                  {includeBreaks && (
                    <Input
                      type="number"
                      value={breakBetweenMatches}
                      onChange={(e) => setBreakBetweenMatches(parseInt(e.target.value))}
                      min="0"
                      max="60"
                      className="w-20"
                    />
                  )}
                  <div className="flex items-center space-x-2 ml-auto">
                    <Label className="text-sm">Scoring:</Label>
                    <Select value={scoringSystem} onValueChange={(value) => setScoringSystem(value as 'duration' | 'points')}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                      </SelectContent>
                    </Select>
                    {scoringSystem === 'points' && (
                      <Input
                        type="number"
                        value={pointsToWin}
                        onChange={(e) => setPointsToWin(parseInt(e.target.value))}
                        className="w-16"
                      />
                    )}
                  </div>
                </div>
                
                {/* Settings persistence indicator */}
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Settings will be saved after creating matches
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Match Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  Choose Match Type
                </CardTitle>
                <CardDescription>What style of matches do you want to generate?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => generateBalancedMatches()} 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Target className="h-8 w-8 text-blue-500" />
                    <div className="text-center">
                      <div className="font-medium">Balanced</div>
                      <div className="text-xs text-gray-500">Skill-balanced doubles matches</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => generateMixedFormat()} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-200"
                  >
                    <Users className="h-8 w-8 text-green-500" />
                    <div className="text-center">
                      <div className="font-medium">Mixed Format</div>
                      <div className="text-xs text-gray-500">Singles + doubles mix</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => generateTeamMatches()} 
                    variant="outline" 
                    data-cy="generate-team-matches"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-yellow-50 hover:border-yellow-200"
                  >
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div className="text-center">
                      <div className="font-medium">Team Matches</div>
                      <div className="text-xs text-gray-500">Organized team competitions</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => generateRoundRobin()} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
                  >
                    <Shuffle className="h-8 w-8 text-purple-500" />
                    <div className="text-center">
                      <div className="font-medium">Round Robin</div>
                      <div className="text-xs text-gray-500">All player combinations</div>
                    </div>
                  </Button>
                </div>

                {/* Manual Match Generation */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Manual Match Creation
                      </h4>
                      <p className="text-sm text-gray-600">Create empty matches that you can configure manually</p>
                    </div>
                    <Button onClick={addMatchTemplate} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Empty Match
                    </Button>
                  </div>
                  {matchTemplates.length > 0 && (
                    <div className="text-sm text-gray-600">
                      📝 {matchTemplates.length} manual match{matchTemplates.length !== 1 ? 'es' : ''} created
                    </div>
                  )}
                </div>

                {/* Team Match Options - Only show when relevant */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Team Match Options
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Team Size</Label>
                      <Select value={teamSize.toString()} onValueChange={(value) => setTeamSize(parseInt(value))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Players</SelectItem>
                          <SelectItem value="4">4 Players</SelectItem>
                          <SelectItem value="5">5 Players</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Team Count</Label>
                      <Select value={teamCountPreference} onValueChange={(value) => setTeamCountPreference(value as 'auto' | 'odd' | 'even')}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="odd">Odd Teams</SelectItem>
                          <SelectItem value="even">Even Teams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Format</Label>
                      <Select value={teamFormat} onValueChange={(value) => setTeamFormat(value as 'round-robin' | 'team-vs-team')}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round-robin">Round Robin</SelectItem>
                          <SelectItem value="team-vs-team">Team vs Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Player Rotation Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm font-medium">Player Rotation</Label>
                      <Select value={playerRotation} onValueChange={(value) => setPlayerRotation(value as 'head-to-head' | 'all-combinations')}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="head-to-head">Head-to-Head</SelectItem>
                          <SelectItem value="all-combinations">All Combinations</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {playerRotation === 'head-to-head' 
                          ? 'Players rotate sequentially through rounds' 
                          : 'Generate matches using all possible player combinations'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Number of Rounds</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNumberOfRounds(Math.max(1, numberOfRounds - 1))}
                          disabled={numberOfRounds <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={numberOfRounds}
                          onChange={(e) => setNumberOfRounds(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          max="10"
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNumberOfRounds(Math.min(10, numberOfRounds + 1))}
                          disabled={numberOfRounds >= 10}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {playerRotation === 'all-combinations' 
                          ? 'Maximum combinations to generate' 
                          : 'Number of rounds with player rotation'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Courts & Advanced Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  Courts & Advanced Options
                </CardTitle>
                <CardDescription>Select courts and configure advanced settings (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Court Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Available Courts ({selectedCourts.length} selected)</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourts(courts.map(c => c.id))}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourts([])}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {courts.map((court) => (
                      <div key={court.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                        <Checkbox
                          id={`court-${court.id}`}
                          checked={selectedCourts.includes(court.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCourts(prev => [...prev, court.id])
                            } else {
                              setSelectedCourts(prev => prev.filter(id => id !== court.id))
                            }
                          }}
                        />
                        <Label htmlFor={`court-${court.id}`} className="text-sm cursor-pointer flex-1">
                          {court.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Options - Collapsible */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="transform transition-transform group-open:rotate-90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    Advanced Player Matching Options
                  </summary>
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </details>
                
                {/* Reset to defaults button */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const defaults = DEFAULT_SETTINGS
                      setStartTime(defaults.startTime)
                      setEndTime(defaults.endTime)
                      setMatchDuration(defaults.matchDuration)
                      setIncludeBreaks(defaults.includeBreaks)
                      setBreakBetweenMatches(defaults.breakBetweenMatches)
                      setScoringSystem(defaults.scoringSystem)
                      setPointsToWin(defaults.pointsToWin)
                      setTeamSize(defaults.teamSize)
                      setTeamCountPreference(defaults.teamCountPreference)
                      setTeamFormat(defaults.teamFormat)
                      setPlayerRotation(defaults.playerRotation)
                      setNumberOfRounds(defaults.numberOfRounds)
                      setGenerationSettings(defaults.generationSettings)
                    }}
                    className="text-xs"
                  >
                    Reset to Defaults
                  </Button>
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
                          const color = getTeamColorsByIndex(teamIndex)
                          const teamPlayersArray = Array.from(data.players).map(playerId => 
                            players.find(p => p.id === playerId)
                          ).filter(Boolean)
                          
                          return (
                            <div key={teamId} className={`border rounded-lg p-4 ${color.lightBackground}`} data-cy="team-card">
                              <div className="text-center mb-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${color.background} ${color.text}`}>
                                  <span className="text-xl font-bold" data-cy="team-id">{teamId}</span>
                                </div>
                                <h3 className="font-semibold text-lg">Team {teamId}</h3>
                                <p className="text-sm text-gray-500">{teamPlayersArray.length} players • {data.matches.length} matches</p>
                              </div>
                              
                              {/* Team Players */}
                              <div className="space-y-2 mb-4">
                                <h4 className="font-medium text-sm text-gray-700">Players:</h4>
                                {teamPlayersArray.map((player) => (
                                  <div key={player!.id} className={`p-2 rounded text-center bg-white border`} data-cy="team-player">
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
                              <div className="space-y-2" data-cy="team-matches">
                                <h4 className="font-medium text-sm text-gray-700">Matches:</h4>
                                {data.matches.map((match) => {
                                  // Get the players from this team that are actually playing in this match
                                  const thisTeamPlayers = match.participants
                                    .filter(p => p.team === teamId)
                                    .map(p => players.find(player => player.id === p.playerId))
                                    .filter(Boolean)
                                  
                                  // Get the opponent team and their players in this match
                                  const opponentTeamId = Array.from(data.opponents).find(opponentId => 
                                    match.participants.some(p => p.team === opponentId)
                                  )
                                  const opponentPlayers = match.participants
                                    .filter(p => p.team === opponentTeamId)
                                    .map(p => players.find(player => player.id === p.playerId))
                                    .filter(Boolean)
                                  
                                  return (
                                    <div key={match.id} className="p-2 rounded bg-white border text-sm">
                                      <div className="font-medium mb-1">
                                        vs Team {opponentTeamId}
                                      </div>
                                      <div className="text-xs mb-2">
                                        <div className="mb-1">
                                          <span className="font-medium text-blue-600">Playing:</span> {thisTeamPlayers.map(p => `${p!.first_name} ${p!.last_name}`).join(', ')}
                                        </div>
                                        <div>
                                          <span className="font-medium text-red-600">vs:</span> {opponentPlayers.map(p => `${p!.first_name} ${p!.last_name}`).join(', ')}
                                        </div>
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

            {matchTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Matches ({matchTemplates.length})</CardTitle>
                  <CardDescription>Review generated matches and schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matchTemplates.map((template, index) => (
                      <div key={template.id} className="border rounded-lg p-4 space-y-3" data-cy="match-template">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium" data-cy="match-title">Match {index + 1}</h4>
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

                        <div className="text-sm text-gray-600" data-cy="match-participants">
                          {(() => {
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
