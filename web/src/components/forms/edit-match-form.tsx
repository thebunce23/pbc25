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

const matchSchema = z.object({
  matchDate: z.string().min(1, 'Date is required'),
  matchTime: z.string().min(1, 'Time is required'),
  courtId: z.string().min(1, 'Court is required'),
  player1Id: z.string().min(1, 'Player 1 is required'),
  player2Id: z.string().min(1, 'Player 2 is required'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  tournamentId: z.string().optional(),
  score: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
})

type MatchFormData = z.infer<typeof matchSchema>

interface Match {
  id: string
  matchDate: string
  matchTime: string
  court: { id: string; name: string }
  player1: { id: string; firstName: string; lastName: string; skillLevel: number }
  player2: { id: string; firstName: string; lastName: string; skillLevel: number }
  status: string
  tournament?: { id: string; name: string } | null
  score?: string | null
  duration?: number | null
  notes?: string | null
}

interface EditMatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: MatchFormData) => void
  match: Match | null
}

// Mock data - in a real app, this would come from your API
const mockCourts = [
  { id: '1', name: 'Court A' },
  { id: '2', name: 'Court B' },
  { id: '3', name: 'Court C' },
  { id: '4', name: 'Court D' },
]

const mockPlayers = [
  { id: '1', firstName: 'John', lastName: 'Smith', skillLevel: 3.5 },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', skillLevel: 4.0 },
  { id: '3', firstName: 'Mike', lastName: 'Chen', skillLevel: 2.5 },
  { id: '4', firstName: 'Lisa', lastName: 'Wong', skillLevel: 3.0 },
]

const mockTournaments = [
  { id: '1', name: 'Weekly Tournament' },
  { id: '2', name: 'Summer Championship' },
  { id: '3', name: 'Club Finals' },
]

export default function EditMatchForm({ open, onOpenChange, onSubmit, match }: EditMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
      status: 'scheduled',
    },
  })

  const selectedStatus = watch('status')
  const selectedPlayer1 = watch('player1Id')
  const selectedPlayer2 = watch('player2Id')

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      setValue('matchDate', match.matchDate)
      setValue('matchTime', match.matchTime)
      setValue('courtId', match.court.id)
      setValue('player1Id', match.player1.id)
      setValue('player2Id', match.player2.id)
      setValue('status', match.status as any)
      setValue('tournamentId', match.tournament?.id || '')
      setValue('score', match.score || '')
      setValue('duration', match.duration || undefined)
      setValue('notes', match.notes || '')
    }
  }, [match, setValue])

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

  if (!match) return null

  const getPlayerName = (playerId: string) => {
    const player = mockPlayers.find(p => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update match details for {match.player1.firstName} {match.player1.lastName} vs {match.player2.firstName} {match.player2.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                {mockCourts.map((court) => (
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

          {/* Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1Id">Player 1 *</Label>
              <Select
                value={selectedPlayer1}
                onValueChange={(value) => setValue('player1Id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player 1" />
                </SelectTrigger>
                <SelectContent>
                  {mockPlayers
                    .filter(player => player.id !== selectedPlayer2)
                    .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName} (Skill: {player.skillLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.player1Id && (
                <p className="text-sm text-red-600">{errors.player1Id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2Id">Player 2 *</Label>
              <Select
                value={selectedPlayer2}
                onValueChange={(value) => setValue('player2Id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player 2" />
                </SelectTrigger>
                <SelectContent>
                  {mockPlayers
                    .filter(player => player.id !== selectedPlayer1)
                    .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName} (Skill: {player.skillLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.player2Id && (
                <p className="text-sm text-red-600">{errors.player2Id.message}</p>
              )}
            </div>
          </div>

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
                value={watch('tournamentId') || ''}
                onValueChange={(value) => setValue('tournamentId', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Tournament</SelectItem>
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
