'use client'

import { useState } from 'react'
import { Plus, Calendar, MapPin, Users, Filter, Edit, Trash2, Play } from 'lucide-react'
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
import EditMatchForm from '@/components/forms/edit-match-form'
import MatchProfileView from '@/components/modals/match-profile-view'

// Mock data - replace with real data from your service
const mockMatches = [
  {
    id: '1',
    matchDate: '2024-12-03',
    matchTime: '10:00',
    court: { id: '1', name: 'Court A' },
    player1: { id: '1', firstName: 'John', lastName: 'Smith', skillLevel: 3.5 },
    player2: { id: '2', firstName: 'Sarah', lastName: 'Johnson', skillLevel: 4.0 },
    status: 'scheduled',
    tournament: null,
    score: null
  },
  {
    id: '2',
    matchDate: '2024-12-03',
    matchTime: '14:00',
    court: { id: '2', name: 'Court B' },
    player1: { id: '3', firstName: 'Mike', lastName: 'Chen', skillLevel: 2.5 },
    player2: { id: '4', firstName: 'Lisa', lastName: 'Wong', skillLevel: 3.0 },
    status: 'in_progress',
    tournament: { id: '1', name: 'Weekly Tournament' },
    score: '11-7, 8-11'
  },
  {
    id: '3',
    matchDate: '2024-12-02',
    matchTime: '16:00',
    court: { id: '1', name: 'Court A' },
    player1: { id: '1', firstName: 'John', lastName: 'Smith', skillLevel: 3.5 },
    player2: { id: '3', firstName: 'Mike', lastName: 'Chen', skillLevel: 2.5 },
    status: 'completed',
    tournament: null,
    score: '11-9, 11-6'
  },
  {
    id: '4',
    matchDate: '2024-12-04',
    matchTime: '09:00',
    court: { id: '3', name: 'Court C' },
    player1: { id: '2', firstName: 'Sarah', lastName: 'Johnson', skillLevel: 4.0 },
    player2: { id: '4', firstName: 'Lisa', lastName: 'Wong', skillLevel: 3.0 },
    status: 'scheduled',
    tournament: null,
    score: null
  }
]

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

export default function MatchesPage() {
  const [matches, setMatches] = useState(mockMatches)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [isEditMatchOpen, setIsEditMatchOpen] = useState(false)
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const filteredMatches = matches.filter(match => {
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus
    const matchesDate = selectedDate === '' || match.matchDate === selectedDate
    return matchesStatus && matchesDate
  })

  const stats = {
    total: matches.length,
    scheduled: matches.filter(m => m.status === 'scheduled').length,
    inProgress: matches.filter(m => m.status === 'in_progress').length,
    completed: matches.filter(m => m.status === 'completed').length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleEditMatch = async (matchData: any) => {
    // Update match in the list
    setMatches(prev => prev.map(match => 
      match.id === selectedMatch?.id 
        ? { ...match, ...matchData }
        : match
    ))
    console.log('Match updated:', matchData)
  }

  const handleViewProfile = (match: any) => {
    setSelectedMatch(match)
    setIsProfileViewOpen(true)
  }

  const handleEditMatchClick = (match: any) => {
    setSelectedMatch(match)
    setIsEditMatchOpen(true)
  }

  const handleEditFromProfile = () => {
    setIsProfileViewOpen(false)
    setIsEditMatchOpen(true)
  }

  const handleDeleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(match => match.id !== matchId))
  }

  return (
    <DashboardLayout title="Matches">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === 'all' ? 'All Status' : statusLabels[filterStatus as keyof typeof statusLabels]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('scheduled')}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('in_progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button onClick={() => alert('Schedule Match functionality will be implemented')}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Match
          </Button>
        </div>

        {/* Matches List */}
        <Card>
          <CardHeader>
            <CardTitle>Matches ({filteredMatches.length})</CardTitle>
            <CardDescription>
              Manage scheduled and completed matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewProfile(match)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(match.matchDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(match.matchTime)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {match.player1.firstName} {match.player1.lastName} vs {match.player2.firstName} {match.player2.lastName}
                        </h3>
                        {match.tournament && (
                          <Badge variant="outline" className="text-xs">
                            {match.tournament.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {match.court?.name || 'TBD'}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {match.player1.skillLevel} vs {match.player2.skillLevel}
                        </div>
                        {match.score && (
                          <div className="flex items-center">
                            <span className="font-medium">Score: {match.score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={statusColors[match.status as keyof typeof statusColors]}>
                      {statusLabels[match.status as keyof typeof statusLabels]}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditMatchClick(match)
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
                          handleDeleteMatch(match.id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredMatches.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No matches found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Matches Quick View */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>
              Quick view of today&apos;s matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches
                .filter(match => match.matchDate === new Date().toISOString().split('T')[0])
                .map((match) => (
                  <div key={match.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{formatTime(match.matchTime)}</span>
                      <Badge className={statusColors[match.status as keyof typeof statusColors]}>
                        {statusLabels[match.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      {match.player1.firstName} {match.player1.lastName} vs {match.player2.firstName} {match.player2.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {match.court?.name || 'TBD'}
                    </div>
                  </div>
                ))}
              
              {matches.filter(match => match.matchDate === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  No matches scheduled for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Edit Match Form */}
        <EditMatchForm
          open={isEditMatchOpen}
          onOpenChange={setIsEditMatchOpen}
          onSubmit={handleEditMatch}
          match={selectedMatch}
        />
        
        {/* Match Profile View */}
        <MatchProfileView
          open={isProfileViewOpen}
          onOpenChange={setIsProfileViewOpen}
          match={selectedMatch}
          onEdit={handleEditFromProfile}
        />
      </div>
    </DashboardLayout>
  )
}
