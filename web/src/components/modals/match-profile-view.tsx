'use client'

import { useState } from 'react'

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

import { Player, Participant, TeamId, DEFAULT_TEAM_A, DEFAULT_TEAM_B } from '@/types/match'
import { getTeamColors } from '@/lib/utils/match-utils'
import AddPlayerToMatchForm from '@/components/forms/add-player-to-match-form'

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
  max_players?: number
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
  const [addPlayerOpen, setAddPlayerOpen] = useState(false)

  if (!match) return null
  
  const handlePlayerAdded = () => {
    // Refresh the match data - in a real app, this would trigger a data reload
    // For now, we'll just close the form
    setAddPlayerOpen(false)
  }

  // Extract players from participants dynamically
  const teamGroups = new Map();
  match.participants?.forEach(p => {
    if (!teamGroups.has(p.team)) {
      teamGroups.set(p.team, []);
    }
    teamGroups.get(p.team).push(p.player);
  });
  const teamPlayerArrays = Array.from(teamGroups.values());
  const [teamAPlayers = [], teamBPlayers = []] = teamPlayerArrays;
  const teamIdsList = Array.from(teamGroups.keys());
  const [teamAId, teamBId] = teamIdsList;

  if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
    return null // Can't display match without both teams
  }

  const isDoublesMatch = teamAPlayers.length > 1 || teamBPlayers.length > 1

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
    if (match.status !== 'completed') return null
    
    // First check if match.winner is explicitly set to team ID
    if (match.winner === teamAId) {
      return {
        winnerTeam: teamAId,
        loserTeam: teamBId,
        winnerPlayers: teamAPlayers,
        loserPlayers: teamBPlayers
      }
    } else if (match.winner === teamBId) {
      return {
        winnerTeam: teamBId,
        loserTeam: teamAId,
        winnerPlayers: teamBPlayers,
        loserPlayers: teamAPlayers
      }
    }
    
    // If no explicit winner, try to determine from score
    if (!match.score) return null
    
    const scoreStr = typeof match.score === 'object' ? JSON.stringify(match.score) : match.score
    if (!scoreStr) return null
    
    // Simple logic to determine winner from score
    const games = scoreStr.split(', ')
    let teamAWins = 0
    let teamBWins = 0
    
    games.forEach(game => {
      const [teamAScore, teamBScore] = game.split('-').map(Number)
      if (teamAScore > teamBScore) teamAWins++
      else teamBWins++
    })
    
    if (teamAWins > teamBWins) {
      return {
        winnerTeam: teamAId,
        loserTeam: teamBId,
        winnerPlayers: teamAPlayers,
        loserPlayers: teamBPlayers
      }
    } else if (teamBWins > teamAWins) {
      return {
        winnerTeam: teamBId,
        loserTeam: teamAId,
        winnerPlayers: teamBPlayers,
        loserPlayers: teamAPlayers
      }
    }
    return null
  }

  const winner = getWinner()

  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${formatTime(new Date(`${date}T${time}`))}`
  }

  const getSkillDifference = () => {
    // Calculate average skill level for each team
    const teamAAvg = teamAPlayers.reduce((sum, player) => sum + player.skillLevel, 0) / teamAPlayers.length
    const teamBAvg = teamBPlayers.reduce((sum, player) => sum + player.skillLevel, 0) / teamBPlayers.length
    return Math.abs(teamAAvg - teamBAvg)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] max-w-[95vw] max-h-[85vh] top-[7.5vh] translate-y-0 overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {getStatusIcon(match.status)}
                </div>
                {isDoublesMatch ? (
                  `Team A vs Team B - ${match.match_type || 'Doubles'}`
                ) : (
                  `${teamAPlayers[0].firstName} ${teamAPlayers[0].lastName} vs ${teamBPlayers[0].firstName} ${teamBPlayers[0].lastName}`
                )}
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
                Winner: Team {winner.winnerTeam}
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

        {/* Add Player Form */}
        <AddPlayerToMatchForm
          open={addPlayerOpen}
          onOpenChange={setAddPlayerOpen}
          onSuccess={handlePlayerAdded}
          matchId={match.id}
          currentParticipants={match.participants || []}
          maxPlayers={match.max_players || 4}
        />

        {/* Players */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isDoublesMatch ? 'Teams' : 'Players'}
                </div>
                {match.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddPlayerOpen(true)}
                  >
                    Add Player
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Team A */}
                <div className="p-4 border rounded-lg">
                  <div className="text-center mb-3">
                    <div className={`w-12 h-12 ${getTeamColors(teamAId).background} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-lg font-medium ${getTeamColors(teamAId).text}`}>{teamAId}</span>
                    </div>
                    <div className={`font-medium ${getTeamColors(teamAId).text}`}>Team {teamAId}</div>
                  </div>
                  <div className="space-y-2">
                    {teamAPlayers.map((player, index) => (
                      <div key={index} className={`text-center p-2 ${getTeamColors(teamAId).lightBackground} rounded`}>
                        <div className="font-medium text-sm">{player.firstName} {player.lastName}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          Skill: {player.skillLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                  {winner && winner.winnerTeam === teamAId && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800 w-full justify-center">Winner</Badge>
                  )}
                </div>
                
                {/* Team B */}
                <div className="p-4 border rounded-lg">
                  <div className="text-center mb-3">
                    <div className={`w-12 h-12 ${getTeamColors(teamBId).background} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-lg font-medium ${getTeamColors(teamBId).text}`}>{teamBId}</span>
                    </div>
                    <div className={`font-medium ${getTeamColors(teamBId).text}`}>Team {teamBId}</div>
                  </div>
                  <div className="space-y-2">
                    {teamBPlayers.map((player, index) => (
                      <div key={index} className={`text-center p-2 ${getTeamColors(teamBId).lightBackground} rounded`}>
                        <div className="font-medium text-sm">{player.firstName} {player.lastName}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          Skill: {player.skillLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                  {winner && winner.winnerTeam === teamBId && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800 w-full justify-center">Winner</Badge>
                  )}
                </div>
              </div>
              
              <div className="text-center mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Avg Skill Level Difference</div>
                <div className="font-medium">{getSkillDifference().toFixed(1)} points</div>
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
                      🏆 Team {winner.winnerTeam} wins!
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
