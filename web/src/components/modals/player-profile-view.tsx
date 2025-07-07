'use client'

import { useState } from 'react'
import { useClubSettings } from '@/contexts/club-settings-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Trophy,
  Target,
  Shield,
  AlertCircle,
  Clock,
  TrendingUp,
  Edit,
  Activity,
  Gamepad2,
  CreditCard,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowUp,
  Minus
} from 'lucide-react'

interface Player {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  skill_level: string
  status: string
  membership_type?: string
  waiverSigned?: boolean
  join_date: string
  matchesPlayed?: number
  winRate?: number
  avatar?: string
  rating?: number
  ratingHistory?: { date: string; rating: number }[]
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    [key: string]: string | undefined
  }
  emergencyContactName?: string
  emergencyContactPhone?: string
  healthConditions?: string
  preferredPartners?: string[]
  achievements?: string[]
  notes?: string
}

interface MatchHistory {
  id: string
  date: string
  opponent: string
  result: 'win' | 'loss'
  score: string
  duration: number
  court: string
  matchType: string
}

interface PaymentHistory {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  type: 'membership' | 'court_fee' | 'tournament' | 'lesson'
}

interface SkillProgress {
  date: string
  rating: number
  improvement: number
  notes?: string
}

interface PlayerProfileViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  onEdit?: () => void
}

const membershipStatusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  trial: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800'
}

// Mock data - in a real app, this would come from your API
const mockMatchHistory: MatchHistory[] = [
  {
    id: '1',
    date: '2024-12-01',
    opponent: 'Sarah Johnson',
    result: 'win',
    score: '11-9, 11-6',
    duration: 45,
    court: 'Court A',
    matchType: 'Doubles'
  },
  {
    id: '2',
    date: '2024-11-28',
    opponent: 'Mike Davis',
    result: 'loss',
    score: '8-11, 11-9, 9-11',
    duration: 62,
    court: 'Court B',
    matchType: 'Singles'
  },
  {
    id: '3',
    date: '2024-11-25',
    opponent: 'Emily Brown',
    result: 'win',
    score: '11-7, 11-4',
    duration: 38,
    court: 'Court A',
    matchType: 'Doubles'
  }
]

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: '1',
    date: '2024-12-01',
    description: 'Monthly Membership Fee',
    amount: 50,
    status: 'paid',
    type: 'membership'
  },
  {
    id: '2',
    date: '2024-11-28',
    description: 'Court Booking - Court A',
    amount: 25,
    status: 'paid',
    type: 'court_fee'
  },
  {
    id: '3',
    date: '2024-11-15',
    description: 'Tournament Entry',
    amount: 15,
    status: 'paid',
    type: 'tournament'
  }
]

const mockSkillProgress: SkillProgress[] = [
  { date: '2024-01-01', rating: 3.0, improvement: 0 },
  { date: '2024-03-01', rating: 3.2, improvement: 0.2 },
  { date: '2024-06-01', rating: 3.5, improvement: 0.3 },
  { date: '2024-09-01', rating: 3.7, improvement: 0.2 },
  { date: '2024-12-01', rating: 3.8, improvement: 0.1 }
]

export default function PlayerProfileView({ open, onOpenChange, player, onEdit }: PlayerProfileViewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { formatPhoneNumber, formatDate } = useClubSettings()

  if (!player) return null

  // Debug logging
  console.log('Player data in modal:', player)

  const fullAddress = player.address ? [
    player.address.street,
    player.address.city,
    player.address.state,
    player.address.zipCode
  ].filter(Boolean).join(', ') : ''


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`
  }

  const getSkillRating = (level: string) => {
    // Convert skill level to numeric rating
    const ratings: { [key: string]: number } = {
      'Beginner': 2.5,
      'Intermediate': 3.5,
      'Advanced': 4.2,
      'Professional': 5.0
    }
    return ratings[level] || 3.0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getResultIcon = (result: string) => {
    return result === 'win' 
      ? <Trophy className="h-4 w-4 text-yellow-600" />
      : <Target className="h-4 w-4 text-gray-500" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px] max-w-[95vw] max-h-[85vh] top-[7.5vh] translate-y-0 overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={player.avatar} alt={`${player.first_name || 'Unknown'} ${player.last_name || 'Player'}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                  {getInitials(player.first_name || 'U', player.last_name || 'P')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {player.first_name || 'Unknown'} {player.last_name || 'Player'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {player.skill_level} • Member since {formatDate(player.join_date)}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={membershipStatusColors[player.status as keyof typeof membershipStatusColors]}>
                    {player.status}
                  </Badge>
                  {player.membership_type && (
                    <Badge variant="outline">{player.membership_type}</Badge>
                  )}
                  {player.waiverSigned && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Match History</TabsTrigger>
            <TabsTrigger value="progress">Skill Progress</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <div className="text-2xl font-bold">{getSkillRating(player.skill_level)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Skill Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-green-600" />
                    <div className="text-2xl font-bold">{player.matchesPlayed || 12}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Matches Played</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <div className="text-2xl font-bold">{player.winRate || 68}%</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <div className="text-2xl font-bold">8</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This Month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMatchHistory.slice(0, 3).map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getResultIcon(match.result)}
                        <div>
                          <p className="font-medium">vs {match.opponent}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(match.date)} • {match.court}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                          {match.result === 'win' ? 'Won' : 'Lost'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{match.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{player.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{player.phone ? formatPhoneNumber(player.phone) : 'No phone'}</span>
                  </div>
                  {fullAddress && (
                    <div className="col-span-2 flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span className="text-sm">{fullAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Match History
                </CardTitle>
                <CardDescription>
                  Complete record of all matches played
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMatchHistory.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getResultIcon(match.result)}
                            <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                              {match.result === 'win' ? 'Victory' : 'Defeat'}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium">{match.matchType} vs {match.opponent}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(match.date)} • {match.court} • {match.duration} min
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">{match.score}</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Skill Development
                </CardTitle>
                <CardDescription>
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Rating */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{getSkillRating(player.skill_level)}</div>
                    <p className="text-lg font-medium">{player.skill_level}</p>
                    <p className="text-sm text-muted-foreground">Current Rating</p>
                  </div>

                  {/* Progress Chart */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Rating History</h4>
                    {mockSkillProgress.map((progress, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-20 text-sm text-muted-foreground">
                          {formatDate(progress.date)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{progress.rating}</span>
                            {progress.improvement > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <ArrowUp className="h-3 w-3" />
                                <span className="text-xs">+{progress.improvement}</span>
                              </div>
                            )}
                          </div>
                          <Progress value={(progress.rating / 5) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  All transactions and membership fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPaymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.date)} • {payment.type.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Emergency Contact */}
            {(player.emergencyContactName || player.emergencyContactPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {player.emergencyContactName && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{player.emergencyContactName}</span>
                    </div>
                  )}
                  {player.emergencyContactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhoneNumber(player.emergencyContactPhone)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Health Information */}
            {player.healthConditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm">{player.healthConditions}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Membership Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Membership Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <Badge className={membershipStatusColors[player.status as keyof typeof membershipStatusColors]}>
                        {player.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="mt-1 font-medium">{player.membership_type || 'Regular'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="mt-1 font-medium">{formatDate(player.join_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Waiver</label>
                    <p className={`mt-1 font-medium ${player.waiverSigned ? 'text-green-600' : 'text-red-600'}`}>
                      {player.waiverSigned ? 'Signed' : 'Not Signed'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {player.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{player.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
