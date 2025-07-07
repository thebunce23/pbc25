'use client'

import { useClubSettings } from '@/contexts/club-settings-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Target,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  Flag,
  Timer
} from 'lucide-react'

interface Player {
  id: string
  firstName: string
  lastName: string
  skillLevel: number
}

interface Participant {
  player: Player
  team: 'A' | 'B'
}

interface Match {
  id: string
  date: string
  time: string
  court?: { id: string; name: string }
  participants?: Participant[]
  status: string
  tournament?: { id: string; name: string } | null
  score?: string | object | null
  winner?: string | null
  duration_minutes?: number | null
  notes?: string | null
}

interface MatchProfileViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: Match | null
  onEdit?: () => void
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusLabels = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export default function MatchProfileView({ open, onOpenChange, match, onEdit }: MatchProfileViewProps) {
  const { formatDate, formatTime } = useClubSettings()

  if (!match) return null

  // Extract players from participants
  const teamAPlayer = match.participants?.find(p => p.team === 'A')?.player
  const teamBPlayer = match.participants?.find(p => p.team === 'B')?.player

  if (!teamAPlayer || !teamBPlayer) {
    return null // Can't display match without both players
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getWinner = () => {
    if (match.status !== 'completed' || !match.score) return null
    
    const scoreStr = typeof match.score === 'object' ? JSON.stringify(match.score) : match.score
    if (!scoreStr) return null
    
    // Simple logic to determine winner from score
    const games = scoreStr.split(', ')
    let player1Wins = 0
    let player2Wins = 0
    
    games.forEach(game => {
      const [p1Score, p2Score] = game.split('-').map(Number)
      if (p1Score > p2Score) player1Wins++
      else player2Wins++
    })
    
    if (player1Wins > player2Wins) {
      return {
        winner: `${teamAPlayer.firstName} ${teamAPlayer.lastName}`,
        loser: `${teamBPlayer.firstName} ${teamBPlayer.lastName}`
      }
    } else if (player2Wins > player1Wins) {
      return {
        winner: `${teamBPlayer.firstName} ${teamBPlayer.lastName}`,
        loser: `${teamAPlayer.firstName} ${teamAPlayer.lastName}`
      }
    }
    return null
  }

  const winner = getWinner()

  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${formatTime(new Date(`${date}T${time}`))}`
  }

  const getSkillDifference = () => {
    return Math.abs(teamAPlayer.skillLevel - teamBPlayer.skillLevel)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] max-w-[95vw] h-auto max-h-[90vh] overflow-hidden flex flex-col fixed top-[5vh] left-1/2 transform -translate-x-1/2">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {getStatusIcon(match.status)}
                </div>
                {teamAPlayer.firstName} {teamAPlayer.lastName} vs {teamBPlayer.firstName} {teamBPlayer.lastName}
              </DialogTitle>
              <DialogDescription>
                {formatDateTime(match.date, match.time)}
              </DialogDescription>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="mt-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
          {/* Status Overview */}
          <div className="flex items-center gap-4">
            <Badge className={statusColors[match.status as keyof typeof statusColors]}>
              {statusLabels[match.status as keyof typeof statusLabels]}
            </Badge>
            {match.tournament && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {match.tournament.name}
              </Badge>
            )}
            {winner && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Winner: {winner.winner}
              </Badge>
            )}
          </div>

          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Match Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(match.date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">{formatTime(new Date(`${match.date}T${match.time}`))}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Court</div>
                  <div className="font-medium">{match.court?.name || 'TBD'}</div>
                </div>
              </div>

              {match.duration_minutes && (
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{match.duration_minutes} minutes</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Players */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-medium text-blue-600">
                      {teamAPlayer.firstName.charAt(0)}{teamAPlayer.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="font-medium">{teamAPlayer.firstName} {teamAPlayer.lastName}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    Skill: {teamAPlayer.skillLevel}
                  </div>
                  {winner && winner.winner === `${teamAPlayer.firstName} ${teamAPlayer.lastName}` && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Winner</Badge>
                  )}
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-medium text-purple-600">
                      {teamBPlayer.firstName.charAt(0)}{teamBPlayer.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="font-medium">{teamBPlayer.firstName} {teamBPlayer.lastName}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    Skill: {teamBPlayer.skillLevel}
                  </div>
                  {winner && winner.winner === `${teamBPlayer.firstName} ${teamBPlayer.lastName}` && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Winner</Badge>
                  )}
                </div>
              </div>
              
              <div className="text-center mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Skill Level Difference</div>
                <div className="font-medium">{getSkillDifference()} points</div>
              </div>
            </CardContent>
          </Card>

          {/* Score */}
          {match.score && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {typeof match.score === 'object' ? JSON.stringify(match.score) : match.score}
                  </div>
                  {winner && (
                    <div className="text-lg text-green-600 font-medium">
                      🏆 {winner.winner} wins!
                    </div>
                  )}
                </div>
                
                {(() => {
                  const scoreStr = typeof match.score === 'object' ? JSON.stringify(match.score) : match.score;
                  return scoreStr && scoreStr.includes(',') && (
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">Game Breakdown:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {scoreStr.split(', ').map((game, index) => (
                          <div key={index} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-muted-foreground">Game {index + 1}</div>
                            <div className="font-medium">{game}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {match.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                  {match.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Match Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Match Type</div>
                  <div className="font-medium">{match.tournament ? 'Tournament' : 'Casual'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Competitive Level</div>
                  <div className="font-medium">
                    {getSkillDifference() < 0.5 ? 'Very Close' : 
                     getSkillDifference() < 1.0 ? 'Close' : 'Mismatched'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{match.status.replace('_', ' ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
