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

// Mock data - replace with real data from your service
const mockPlayers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    skillLevel: 3.5,
    membershipStatus: 'active',
    waiverSigned: true,
    dateJoined: '2024-01-15',
    matchesPlayed: 42,
    winRate: 68
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    skillLevel: 4.0,
    membershipStatus: 'active',
    waiverSigned: true,
    dateJoined: '2024-02-01',
    matchesPlayed: 38,
    winRate: 73
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@email.com',
    phone: '(555) 345-6789',
    skillLevel: 2.5,
    membershipStatus: 'trial',
    waiverSigned: false,
    dateJoined: '2024-06-15',
    matchesPlayed: 5,
    winRate: 40
  },
  {
    id: '4',
    firstName: 'Lisa',
    lastName: 'Wong',
    email: 'lisa.wong@email.com',
    phone: '(555) 456-7890',
    skillLevel: 3.0,
    membershipStatus: 'active',
    waiverSigned: true,
    dateJoined: '2024-03-10',
    matchesPlayed: 28,
    winRate: 64
  }
]

const membershipStatusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  trial: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800'
}

export default function PlayersPage() {
  const [players, setPlayers] = useState(mockPlayers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false)
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>({})
  const { formatPhoneNumber, formatDate } = useClubSettings()

  const filteredPlayers = players.filter(player => {
    const matchesSearch = searchTerm === '' || 
      player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || player.membershipStatus === filterStatus
    
    // Advanced filters
    const matchesAdvancedFilters = 
      (advancedFilters.skillLevelMin === undefined || player.skillLevel >= advancedFilters.skillLevelMin) &&
      (advancedFilters.skillLevelMax === undefined || player.skillLevel <= advancedFilters.skillLevelMax) &&
      (advancedFilters.membershipStatus === undefined || player.membershipStatus === advancedFilters.membershipStatus) &&
      (advancedFilters.waiverSigned === undefined || player.waiverSigned === advancedFilters.waiverSigned) &&
      (advancedFilters.matchesPlayedMin === undefined || player.matchesPlayed >= advancedFilters.matchesPlayedMin) &&
      (advancedFilters.winRateMin === undefined || player.winRate >= advancedFilters.winRateMin) &&
      (advancedFilters.winRateMax === undefined || player.winRate <= advancedFilters.winRateMax) &&
      (advancedFilters.joinDateFrom === undefined || new Date(player.dateJoined) >= new Date(advancedFilters.joinDateFrom)) &&
      (advancedFilters.joinDateTo === undefined || new Date(player.dateJoined) <= new Date(advancedFilters.joinDateTo))
    
    return matchesSearch && matchesFilter && matchesAdvancedFilters
  })

  const stats = {
    total: players.length,
    active: players.filter(p => p.membershipStatus === 'active').length,
    trial: players.filter(p => p.membershipStatus === 'trial').length,
    needWaiver: players.filter(p => !p.waiverSigned).length
  }

  const handleAddPlayer = async (playerData: any) => {
    // Generate a new ID for the player
    const newPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: playerData.firstName,
      lastName: playerData.lastName,
      email: playerData.email || '',
      phone: playerData.phone || '',
      skillLevel: playerData.skillLevel || 0,
      membershipStatus: playerData.membershipStatus,
      waiverSigned: playerData.waiverSigned || false,
      dateJoined: new Date().toISOString().split('T')[0],
      matchesPlayed: 0,
      winRate: 0,
      address: playerData.address,
      emergencyContactName: playerData.emergencyContactName,
      emergencyContactPhone: playerData.emergencyContactPhone,
      healthConditions: playerData.healthConditions
    }

    // Add to players list
    setPlayers(prev => [newPlayer, ...prev])
    console.log('Player added:', newPlayer)
  }

  const handleEditPlayer = async (playerData: any) => {
    // Update player in the list
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer?.id 
        ? { ...player, ...playerData }
        : player
    ))
    console.log('Player updated:', playerData)
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

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId))
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
            <CardTitle>Players ({filteredPlayers.length})</CardTitle>
            <CardDescription>
              Manage your club members and their information
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {player.firstName} {player.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{player.email}</p>
                      {player.phone && (
                        <p className="text-sm text-gray-500">{formatPhoneNumber(player.phone)}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Skill: {player.skillLevel}
                        </span>
                        <span className="text-xs text-gray-500">
                          Matches: {player.matchesPlayed}
                        </span>
                        <span className="text-xs text-gray-500">
                          Win Rate: {player.winRate}%
                        </span>
                        <span className="text-xs text-gray-500">
                          Joined: {formatDate(player.dateJoined)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={membershipStatusColors[player.membershipStatus as keyof typeof membershipStatusColors]}>
                      {player.membershipStatus}
                    </Badge>
                    
                    {!player.waiverSigned && (
                      <Badge variant="destructive">No Waiver</Badge>
                    )}
                    
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
