'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { useClubSettings } from '@/contexts/club-settings-context'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AddPlayerForm from '@/components/forms/add-player-form'
import EditPlayerForm from '@/components/forms/edit-player-form'
import PlayerProfileView from '@/components/modals/player-profile-view'
import AdvancedFilters, { FilterCriteria } from '@/components/filters/advanced-filters'
import { playerService, Player } from '@/lib/services/player-service'

// Interface for component state (extending Player for additional UI fields)
interface UIPlayer extends Player {
  matchesPlayed?: number
  winRate?: number
}

const membershipStatusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  trial: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800'
}

// Helper function to convert skill level to number for filtering
const getSkillLevelNumber = (skillLevel: string): number => {
  switch (skillLevel) {
    case 'Beginner': return 1
    case 'Intermediate': return 2
    case 'Advanced': return 3
    case 'Professional': return 4
    default: return 1
  }
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<UIPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false)
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<UIPlayer | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>({})
  const { formatPhoneNumber, formatDate } = useClubSettings()

  // Load players from Supabase
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true)
        const playersData = await playerService.getPlayers()
        // Convert to UIPlayer format with additional fields
        const uiPlayers: UIPlayer[] = playersData.map(player => ({
          ...player,
          matchesPlayed: 0, // TODO: Calculate from matches table
          winRate: 0, // TODO: Calculate from matches table
        }))
        setPlayers(uiPlayers)
      } catch (error) {
        console.error('Error loading players:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  const filteredPlayers = players.filter(player => {
    const matchesSearch = searchTerm === '' || 
      player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || player.status === filterStatus
    
    // Advanced filters
    const skillLevelNum = getSkillLevelNumber(player.skill_level)
    const matchesAdvancedFilters = 
      (advancedFilters.skillLevelMin === undefined || skillLevelNum >= advancedFilters.skillLevelMin) &&
      (advancedFilters.skillLevelMax === undefined || skillLevelNum <= advancedFilters.skillLevelMax) &&
      (advancedFilters.membershipStatus === undefined || player.status === advancedFilters.membershipStatus) &&
      (advancedFilters.matchesPlayedMin === undefined || (player.matchesPlayed || 0) >= advancedFilters.matchesPlayedMin) &&
      (advancedFilters.winRateMin === undefined || (player.winRate || 0) >= advancedFilters.winRateMin) &&
      (advancedFilters.winRateMax === undefined || (player.winRate || 0) <= advancedFilters.winRateMax) &&
      (advancedFilters.joinDateFrom === undefined || new Date(player.join_date) >= new Date(advancedFilters.joinDateFrom)) &&
      (advancedFilters.joinDateTo === undefined || new Date(player.join_date) <= new Date(advancedFilters.joinDateTo))
    
    return matchesSearch && matchesFilter && matchesAdvancedFilters
  })

  const stats = {
    total: players.length,
    active: players.filter(p => p.status === 'active').length,
    trial: players.filter(p => p.membership_type === 'Trial').length,
    needWaiver: 0 // TODO: Add waiver functionality to database schema
  }

  const handleAddPlayer = async (playerData: any) => {
    try {
      // Map the form data to database schema
      const createData = {
        first_name: playerData.firstName,
        last_name: playerData.lastName,
        email: playerData.email,
        phone: playerData.phone,
        skill_level: playerData.skillLevel || 'Beginner',
        status: playerData.membershipStatus || 'active',
        membership_type: playerData.membershipType || 'Regular',
        emergency_contact: playerData.emergencyContactName || playerData.emergencyContactPhone ? {
          name: playerData.emergencyContactName,
          phone: playerData.emergencyContactPhone
        } : undefined,
        address: playerData.address,
        medical_info: playerData.healthConditions,
        notes: playerData.notes
      }

      const newPlayer = await playerService.createPlayer(createData)
      const uiPlayer: UIPlayer = {
        ...newPlayer,
        matchesPlayed: 0,
        winRate: 0
      }
      
      setPlayers(prev => [uiPlayer, ...prev])
      console.log('Player added:', newPlayer)
    } catch (error) {
      console.error('Error adding player:', error)
      // TODO: Show error message to user
    }
  }

  const handleEditPlayer = async (playerData: any) => {
    if (!selectedPlayer) return

    try {
      // Map the form data to database schema
      const updateData = {
        first_name: playerData.firstName,
        last_name: playerData.lastName,
        email: playerData.email,
        phone: playerData.phone,
        skill_level: playerData.skillLevel,
        status: playerData.membershipStatus,
        membership_type: playerData.membershipType,
        emergency_contact: playerData.emergencyContactName || playerData.emergencyContactPhone ? {
          name: playerData.emergencyContactName,
          phone: playerData.emergencyContactPhone
        } : undefined,
        address: playerData.address,
        medical_info: playerData.healthConditions,
        notes: playerData.notes
      }

      const updatedPlayer = await playerService.updatePlayer(selectedPlayer.id, updateData)
      const uiPlayer: UIPlayer = {
        ...updatedPlayer,
        matchesPlayed: selectedPlayer.matchesPlayed || 0,
        winRate: selectedPlayer.winRate || 0
      }
      
      setPlayers(prev => prev.map(player => 
        player.id === selectedPlayer.id ? uiPlayer : player
      ))
      console.log('Player updated:', updatedPlayer)
    } catch (error) {
      console.error('Error updating player:', error)
      // TODO: Show error message to user
    }
  }

  const handleViewProfile = (player: any) => {
    setSelectedPlayer(player)
    setIsProfileViewOpen(true)
  }

  const handleEditPlayerClick = (player: any) => {
    setSelectedPlayer(player)
    setIsEditPlayerOpen(true)
  }

  const handleEditFromProfile = () => {
    setIsProfileViewOpen(false)
    setIsEditPlayerOpen(true)
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      return
    }

    try {
      await playerService.deletePlayer(playerId)
      setPlayers(prev => prev.filter(player => player.id !== playerId))
      console.log('Player deleted:', playerId)
    } catch (error) {
      console.error('Error deleting player:', error)
      // TODO: Show error message to user
    }
  }

  return (
    <DashboardLayout title="Players">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trial}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Waiver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.needWaiver}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
<DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === 'all' ? 'All Status' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('trial')}>
                  Trial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <AdvancedFilters 
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              onClearFilters={() => setAdvancedFilters({})}
            />
          </div>
          
          <Button onClick={() => setIsAddPlayerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>Players ({loading ? '...' : filteredPlayers.length})</CardTitle>
            <CardDescription>
              Manage your club members and their information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-500">Loading players...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewProfile(player)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {player.first_name} {player.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{player.email}</p>
                      {player.phone && (
                        <p className="text-sm text-gray-500">{formatPhoneNumber(player.phone)}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Skill: {player.skill_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          Matches: {player.matchesPlayed || 0}
                        </span>
                        <span className="text-xs text-gray-500">
                          Win Rate: {player.winRate || 0}%
                        </span>
                        <span className="text-xs text-gray-500">
                          Joined: {formatDate(player.join_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={membershipStatusColors[player.status as keyof typeof membershipStatusColors]}>
                      {player.status}
                    </Badge>
                    
                    <Badge variant="secondary">
                      {player.membership_type}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditPlayerClick(player)
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlayer(player.id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPlayers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players found matching your criteria.</p>
                </div>
              )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Player Form */}
        <AddPlayerForm
          open={isAddPlayerOpen}
          onOpenChange={setIsAddPlayerOpen}
          onSubmit={handleAddPlayer}
        />
        
        {/* Edit Player Form */}
        <EditPlayerForm
          open={isEditPlayerOpen}
          onOpenChange={setIsEditPlayerOpen}
          onSubmit={handleEditPlayer}
          player={selectedPlayer}
        />
        
        {/* Player Profile View */}
        <PlayerProfileView
          open={isProfileViewOpen}
          onOpenChange={setIsProfileViewOpen}
          player={selectedPlayer}
          onEdit={handleEditFromProfile}
        />
      </div>
    </DashboardLayout>
  )
}
