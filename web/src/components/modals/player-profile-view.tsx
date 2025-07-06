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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Shield,
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
  Edit
} from 'lucide-react'

interface Player {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  skill_level: string
  status: string
  waiverSigned?: boolean
  join_date: string
  matchesPlayed?: number
  winRate?: number
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

export default function PlayerProfileView({ open, onOpenChange, player, onEdit }: PlayerProfileViewProps) {
  const { formatPhoneNumber, formatDate } = useClubSettings()

  if (!player) return null

  const fullAddress = player.address ? [
    player.address.street,
    player.address.city,
    player.address.state,
    player.address.zipCode
  ].filter(Boolean).join(', ') : ''

  const getSkillLevelDescription = (level: string) => {
    // The skill level is already a string description
    return level
  }

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-600'
    if (winRate >= 50) return 'text-blue-600'
    return 'text-orange-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {player.first_name?.charAt(0) || ''}{player.last_name?.charAt(0) || ''}
                  </span>
                </div>
                {player.first_name} {player.last_name}
              </DialogTitle>
              <DialogDescription>
                Member since {formatDate(player.join_date)}
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

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="flex items-center gap-4">
            <Badge className={membershipStatusColors[player.status as keyof typeof membershipStatusColors]}>
              {player.status}
            </Badge>
            {!player.waiverSigned && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No Waiver
              </Badge>
            )}
            {player.waiverSigned && (
              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Waiver Signed
              </Badge>
            )}
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{player.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{player.phone ? formatPhoneNumber(player.phone) : 'No phone provided'}</span>
              </div>
              {fullAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{fullAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Player Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Player Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Skill Level</span>
                  </div>
                  <div className="text-2xl font-bold">{player.skill_level}</div>
                  <div className="text-xs text-muted-foreground">{getSkillLevelDescription(player.skill_level)}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Matches</span>
                  </div>
                  <div className="text-2xl font-bold">{player.matchesPlayed || 0}</div>
                  <div className="text-xs text-muted-foreground">Total played</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                  </div>
                  <div className={`text-2xl font-bold ${getWinRateColor(player.winRate || 0)}`}>
                    {player.winRate || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success rate</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Member</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.floor((new Date().getTime() - new Date(player.join_date).getTime()) / (1000 * 3600 * 24 * 30))}</div>
                  <div className="text-xs text-muted-foreground">Months</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {(player.emergencyContactName || player.emergencyContactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Health Information
                </CardTitle>
                <CardDescription>
                  Important health considerations for this player
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-orange-50 border border-orange-200 rounded-lg p-3">
                  {player.healthConditions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Membership Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Membership Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={membershipStatusColors[player.membershipStatus as keyof typeof membershipStatusColors]}>
                  {player.membershipStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Join Date</span>
                <span className="text-sm">{formatDate(player.dateJoined)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Waiver Status</span>
                <span className={`text-sm ${player.waiverSigned ? 'text-green-600' : 'text-red-600'}`}>
                  {player.waiverSigned ? 'Signed' : 'Not Signed'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
