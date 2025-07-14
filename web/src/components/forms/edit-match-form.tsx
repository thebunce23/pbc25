'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useClubSettings } from '@/contexts/club-settings-context'
import { Textarea } from '@/components/ui/textarea'
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
import courtService, { type Court } from '@/lib/services/court-service'

const matchSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  matchType: z.enum(['Singles', 'Doubles', 'Mixed Doubles', 'Tournament']),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Mixed']),
  matchDate: z.string().min(1, 'Date is required'),
  matchTime: z.string().min(1, 'Time is required'),
  courtId: z.string().optional(),
  maxPlayers: z.number().min(2, 'At least 2 players required').max(8, 'Maximum 8 players allowed'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  tournamentId: z.string().optional(),
  score: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
})

type MatchFormData = z.infer<typeof matchSchema>

import { Player, Participant, TeamId, DEFAULT_TEAM_A, DEFAULT_TEAM_B } from '@/types/match'

interface Match {
  id: string
  title: string
  match_type: string
  skill_level: string
  date: string
  time: string
  court?: { id: string; name: string }
  participants?: Participant[]
  status: string
  score?: string | object | null
  duration_minutes?: number
  max_players: number
  notes?: string
  description?: string
}

interface EditMatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: MatchFormData) => void
  match: Match | null
}

// Court data will be loaded from the service

const mockPlayers = [
  { id: '1', first_name: 'John', last_name: 'Smith', skill_level: '3.5' },
  { id: '2', first_name: 'Sarah', last_name: 'Johnson', skill_level: '4.0' },
  { id: '3', first_name: 'Mike', last_name: 'Chen', skill_level: '2.5' },
  { id: '4', first_name: 'Lisa', last_name: 'Wong', skill_level: '3.0' },
]

const mockTournaments = [
  { id: '1', name: 'Weekly Tournament' },
  { id: '2', name: 'Summer Championship' },
  { id: '3', name: 'Club Finals' },
]

export default function EditMatchForm({ open, onOpenChange, onSubmit, match }: EditMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [courts, setCourts] = useState<Court[]>([])
  const { formatDate, formatTime } = useClubSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      title: '',
      matchType: 'Doubles' as const,
      skillLevel: 'Mixed' as const,
      matchDate: '',
      matchTime: '',
      courtId: '',
      maxPlayers: 4,
      status: 'scheduled' as const,
      tournamentId: 'none',
      score: '',
      notes: '',
      description: ''
    },
  })

  const selectedStatus = watch('status')
  const selectedMatchType = watch('matchType')
  const selectedMaxPlayers = watch('maxPlayers')

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      setValue('title', match.title || '')
      setValue('matchType', (match.match_type as any) || 'Doubles')
      setValue('skillLevel', (match.skill_level as any) || 'Mixed')
      setValue('matchDate', match.date || '')
      setValue('matchTime', match.time || '')
      setValue('courtId', match.court?.id || '')
      setValue('maxPlayers', match.max_players || 4)
      setValue('status', (match.status as any) || 'scheduled')
      setValue('tournamentId', 'none') // No tournament field in current data
      
      // Handle score properly
      const scoreValue = match.score 
        ? (typeof match.score === 'object' ? JSON.stringify(match.score) : String(match.score))
        : ''
      setValue('score', scoreValue)
      
      setValue('duration', match.duration_minutes || undefined)
      setValue('notes', match.notes || '')
      setValue('description', match.description || '')
    } else {
      // Reset form when no match
      reset({
        title: '',
        matchType: 'Doubles' as const,
        skillLevel: 'Mixed' as const,
        matchDate: '',
        matchTime: '',
        courtId: '',
        maxPlayers: 4,
        status: 'scheduled' as const,
        tournamentId: 'none',
        score: '',
        notes: '',
        description: ''
      })
    }
  }, [match, setValue, reset])

  // Load courts when dialog opens
  useEffect(() => {
    if (open) {
      loadCourts()
    }
  }, [open])

  const loadCourts = async () => {
    try {
      const courtsData = await courtService.getAllCourts()
      setCourts(courtsData)
    } catch (error) {
      console.error('Failed to load courts:', error)
    }
  }

  const handleFormSubmit = async (data: MatchFormData) => {
    setIsLoading(true)
    setError('')

    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the match')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setError('')
    onOpenChange(false)
  }

  // Remove the early return - dialog should render even without a match
  // if (!match) return null

  // Helper function to safely get player names from participants
  const getPlayerFromParticipants = (team: TeamId) => {
    return match?.participants?.find(p => p.team === team)?.player
  }
  
  // Get all teams in the match
  const getTeamsInMatch = () => {
    if (!match?.participants) return [];
    const teams = new Set(match.participants.map(p => p.team));
    return Array.from(teams);
  }

  const getPlayerName = (playerId: string) => {
    const player = mockPlayers.find(p => p.id === playerId)
    return player ? `${player.first_name} ${player.last_name}` : 'Unknown Player'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            {(() => {
              if (match) {
                const teamsInMatch = getTeamsInMatch();
                if (teamsInMatch.length >= 2) {
                  const team1Player = getPlayerFromParticipants(teamsInMatch[0]);
                  const team2Player = getPlayerFromParticipants(teamsInMatch[1]);
                  if (team1Player && team2Player) {
                    return `Update match details for ${team1Player.first_name} ${team1Player.last_name} vs ${team2Player.first_name} ${team2Player.last_name}`;
                  }
                }
                return `Update match details for ${match.title || 'this match'}`;
              }
              return 'Update match details';
            })()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Match Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Morning Doubles Match"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Match Type and Skill Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type *</Label>
              <Select
                value={selectedMatchType}
                onValueChange={(value) => {
                  setValue('matchType', value as any)
                  // Auto-adjust max players based on match type
                  if (value === 'Singles') {
                    setValue('maxPlayers', 2)
                  } else if (value === 'Doubles' || value === 'Mixed Doubles') {
                    setValue('maxPlayers', 4)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Doubles">Doubles</SelectItem>
                  <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                  <SelectItem value="Tournament">Tournament</SelectItem>
                </SelectContent>
              </Select>
              {errors.matchType && (
                <p className="text-sm text-red-600">{errors.matchType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level *</Label>
              <Select
                value={watch('skillLevel')}
                onValueChange={(value) => setValue('skillLevel', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              {errors.skillLevel && (
                <p className="text-sm text-red-600">{errors.skillLevel.message}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchDate">Date *</Label>
              <Input
                id="matchDate"
                type="date"
                {...register('matchDate')}
              />
              {errors.matchDate && (
                <p className="text-sm text-red-600">{errors.matchDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchTime">Time *</Label>
              <Input
                id="matchTime"
                type="time"
                {...register('matchTime')}
              />
              {errors.matchTime && (
                <p className="text-sm text-red-600">{errors.matchTime.message}</p>
              )}
            </div>
          </div>

          {/* Court */}
          <div className="space-y-2">
            <Label htmlFor="courtId">Court *</Label>
            <Select
              value={watch('courtId')}
              onValueChange={(value) => setValue('courtId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courtId && (
              <p className="text-sm text-red-600">{errors.courtId.message}</p>
            )}
          </div>

          {/* Max Players and Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Maximum Players *</Label>
              <Input
                id="maxPlayers"
                type="number"
                min="2"
                max="8"
                {...register('maxPlayers', { valueAsNumber: true })}
              />
              {errors.maxPlayers && (
                <p className="text-sm text-red-600">{errors.maxPlayers.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {selectedMatchType === 'Singles' ? 'Singles matches typically have 2 players' :
                 selectedMatchType === 'Doubles' || selectedMatchType === 'Mixed Doubles' ? 'Doubles matches typically have 4 players' :
                 'Tournament matches can have various player counts'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Brief description of the match"
              />
            </div>
          </div>

          {/* Current Participants */}
          {match && match.participants && match.participants.length > 0 && (
            <div className="space-y-2">
              <Label>Current Participants ({match.participants.length}/{selectedMaxPlayers})</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 gap-2">
                  {match.participants.map((participant, index) => (
                    <div key={participant.player.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        <span className="font-medium">{participant.player.first_name} {participant.player.last_name}</span>
                        <span className="text-gray-500 ml-2">(Team {participant.team})</span>
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {participant.player.skill_level || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status and Tournament */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournamentId">Tournament (Optional)</Label>
              <Select
                value={watch('tournamentId') || 'none'}
                onValueChange={(value) => setValue('tournamentId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tournament</SelectItem>
                  {mockTournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Score and Duration (show only if match is completed or in progress) */}
          {(selectedStatus === 'completed' || selectedStatus === 'in_progress') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  {...register('score')}
                  placeholder="e.g., 11-9, 11-6"
                />
                <p className="text-xs text-muted-foreground">
                  Format: Game1Score1-Game1Score2, Game2Score1-Game2Score2
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="e.g., 45"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional notes about the match"
              rows={3}
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating Match...' : 'Update Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
