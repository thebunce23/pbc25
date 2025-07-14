'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { playerService } from '@/lib/services/player-service'
import { matchService } from '@/lib/services/match-service'
import { Player, TeamId } from '@/types/match'
import { getTeamIds, getTeamColors } from '@/lib/utils/match-utils'

interface AddPlayerToMatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  matchId: string
  currentParticipants: Array<{ player: Player; team: TeamId }>
  maxPlayers: number
}

interface FormData {
  playerId: string
  team: TeamId
}

export default function AddPlayerToMatchForm({
  open,
  onOpenChange,
  onSuccess,
  matchId,
  currentParticipants,
  maxPlayers
}: AddPlayerToMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      playerId: '',
      team: ''
    }
  })

  const selectedPlayerId = watch('playerId')
  const selectedTeam = watch('team')

  // Load available players when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailablePlayers()
    }
  }, [open])

  const loadAvailablePlayers = async () => {
    try {
      const players = await playerService.getPlayers({ status: 'active' })
      const participantIds = currentParticipants.map(p => p.player.id)
      const available = players.filter(p => !participantIds.includes(p.id))
      setAvailablePlayers(available)
    } catch (error) {
      console.error('Failed to load players:', error)
    }
  }

  // Get teams in the match and available teams
  const getTeamsInMatch = (): TeamId[] => {
    const teams = new Set(currentParticipants.map(p => p.team))
    return Array.from(teams)
  }

  const getAvailableTeams = (): TeamId[] => {
    const teamsInMatch = getTeamsInMatch()
    const teamPlayerCounts = new Map<TeamId, number>()
    
    // Count players per team
    currentParticipants.forEach(p => {
      teamPlayerCounts.set(p.team, (teamPlayerCounts.get(p.team) || 0) + 1)
    })

    // For a match, we typically want up to 2 teams
    const maxTeams = Math.ceil(maxPlayers / 2)
    const allPossibleTeams = getTeamIds(maxTeams)
    
    // Return teams that exist in match or can be added
    return allPossibleTeams.filter(teamId => {
      const playerCount = teamPlayerCounts.get(teamId) || 0
      const maxPlayersPerTeam = Math.ceil(maxPlayers / 2)
      return playerCount < maxPlayersPerTeam
    })
  }

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError('')

    try {
      await matchService.addPlayerToMatch(matchId, data.playerId, data.team)
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (err: any) {
      setError(err.message || 'Failed to add player to match')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setError('')
    onOpenChange(false)
  }

  const canAddMorePlayers = currentParticipants.length < maxPlayers
  const availableTeams = getAvailableTeams()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Player to Match</DialogTitle>
          <DialogDescription>
            Select a player and team to add to this match ({currentParticipants.length}/{maxPlayers} players)
          </DialogDescription>
        </DialogHeader>

        {!canAddMorePlayers && (
          <Alert>
            <AlertDescription>
              This match is full. Remove a player before adding a new one.
            </AlertDescription>
          </Alert>
        )}

        {canAddMorePlayers && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current Players */}
            <div className="space-y-2">
              <Label>Current Players</Label>
              <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                {currentParticipants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {participant.player.first_name} {participant.player.last_name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`${getTeamColors(participant.team).background} ${getTeamColors(participant.team).text}`}
                    >
                      Team {participant.team}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Selection */}
            <div className="space-y-2">
              <Label htmlFor="playerId">Select Player *</Label>
              <Select
                value={selectedPlayerId}
                onValueChange={(value) => setValue('playerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {player.skill_level}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availablePlayers.length === 0 && (
                <p className="text-sm text-gray-500">
                  No available players (all active players are already in this match)
                </p>
              )}
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <Label htmlFor="team">Select Team *</Label>
              <Select
                value={selectedTeam}
                onValueChange={(value) => setValue('team', value as TeamId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((teamId) => {
                    const playersInTeam = currentParticipants.filter(p => p.team === teamId).length
                    const maxPlayersPerTeam = Math.ceil(maxPlayers / 2)
                    const teamColors = getTeamColors(teamId)
                    
                    return (
                      <SelectItem key={teamId} value={teamId}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${teamColors.background}`}></div>
                          Team {teamId}
                          <span className="text-xs text-gray-500">
                            ({playersInTeam}/{maxPlayersPerTeam})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedPlayerId || !selectedTeam || !canAddMorePlayers}
              >
                {isLoading ? 'Adding Player...' : 'Add Player'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
