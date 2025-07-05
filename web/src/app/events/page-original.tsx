'use client'

import { useState } from 'react'
import { Plus, Calendar, Users, MapPin, Clock, Filter, MoreHorizontal, Edit, Trash2, UserPlus, Eye } from 'lucide-react'
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
import EventForm from '@/components/events/event-form'

// Mock data - replace with real data from your service
const mockEvents = [
  {
    id: '1',
    title: 'Weekly Round Robin Tournament',
    description: 'Join us for our weekly round robin tournament. All skill levels welcome!',
    eventDate: '2024-12-07',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Main Courts',
    maxParticipants: 32,
    currentParticipants: 18,
    registrationDeadline: '2024-12-06',
    entryFee: 25.00,
    status: 'open',
    eventType: 'tournament',
    organizer: { id: '1', name: 'John Smith' },
    participants: [
      { id: '1', firstName: 'Sarah', lastName: 'Johnson', skillLevel: 4.0 },
      { id: '2', firstName: 'Mike', lastName: 'Chen', skillLevel: 3.5 }
    ]
  },
  {
    id: '2',
    title: 'Beginner Skills Workshop',
    description: 'Learn the fundamentals of pickleball with our certified instructors.',
    eventDate: '2024-12-05',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Court A & B',
    maxParticipants: 16,
    currentParticipants: 12,
    registrationDeadline: '2024-12-04',
    entryFee: 15.00,
    status: 'open',
    eventType: 'clinic',
    organizer: { id: '2', name: 'Lisa Wong' },
    participants: []
  },
  {
    id: '3',
    title: 'Holiday Social Mixer',
    description: 'Join fellow members for food, drinks, and casual games.',
    eventDate: '2024-12-15',
    startTime: '17:00',
    endTime: '21:00',
    location: 'Clubhouse & Courts',
    maxParticipants: 50,
    currentParticipants: 35,
    registrationDeadline: '2024-12-14',
    entryFee: 20.00,
    status: 'open',
    eventType: 'social',
    organizer: { id: '3', name: 'David Martinez' },
    participants: []
  },
  {
    id: '4',
    title: 'Advanced Strategy Session',
    description: 'Advanced techniques and strategy discussion for 4.0+ players.',
    eventDate: '2024-12-03',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Court C',
    maxParticipants: 8,
    currentParticipants: 8,
    registrationDeadline: '2024-12-02',
    entryFee: 10.00,
    status: 'full',
    eventType: 'clinic',
    organizer: { id: '1', name: 'John Smith' },
    participants: []
  },
  {
    id: '5',
    title: 'Monthly Championship',
    description: 'Championship tournament with prizes for winners.',
    eventDate: '2024-11-30',
    startTime: '08:00',
    endTime: '16:00',
    location: 'All Courts',
    maxParticipants: 64,
    currentParticipants: 45,
    registrationDeadline: '2024-11-29',
    entryFee: 50.00,
    status: 'completed',
    eventType: 'tournament',
    organizer: { id: '2', name: 'Lisa Wong' },
    participants: []
  }
]

const statusColors = {
  open: 'bg-green-100 text-green-800',
  full: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusLabels = {
  open: 'Open',
  full: 'Full',
  closed: 'Closed',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

const typeColors = {
  tournament: 'bg-blue-100 text-blue-800',
  clinic: 'bg-purple-100 text-purple-800',
  social: 'bg-orange-100 text-orange-800',
  league: 'bg-indigo-100 text-indigo-800'
}

const typeLabels = {
  tournament: 'Tournament',
  clinic: 'Clinic',
  social: 'Social',
  league: 'League'
}

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesType = filterType === 'all' || event.eventType === filterType
    const matchesDate = selectedDate === '' || event.eventDate === selectedDate
    return matchesStatus && matchesType && matchesDate
  })

  const stats = {
    total: events.length,
    open: events.filter(e => e.status === 'open').length,
    upcoming: events.filter(e => new Date(e.eventDate) > new Date()).length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.eventDate)
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= today && eventDate <= weekFromNow
    }).length
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

  const getParticipationRate = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  const handleCreateEvent = (eventData: {
    title: string
    description: string
    eventDate: string
    startTime: string
    endTime: string
    location: string
    maxParticipants: number
    registrationDeadline: string
    entryFee: number
    eventType: 'tournament' | 'clinic' | 'social' | 'league'
  }) => {
    const newEvent = {
      id: (events.length + 1).toString(),
      ...eventData,
      currentParticipants: 0,
      status: 'open' as const,
      organizer: { id: '1', name: 'Current User' },
      participants: []
    }
    setEvents([...events, newEvent])
  }

  return (
    <DashboardLayout title="Events">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Registration</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
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
                <DropdownMenuItem onClick={() => setFilterStatus('open')}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('full')}>
                  Full
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('closed')}>
                  Closed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterType === 'all' ? 'All Types' : typeLabels[filterType as keyof typeof typeLabels]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('tournament')}>
                  Tournament
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('clinic')}>
                  Clinic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('social')}>
                  Social
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('league')}>
                  League
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button onClick={() => setIsCreateEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Events ({filteredEvents.length})</CardTitle>
            <CardDescription>
              Manage club events, tournaments, and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[80px]">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(event.eventDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <Badge className={typeColors[event.eventType as keyof typeof typeColors]}>
                          {typeLabels[event.eventType as keyof typeof typeLabels]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {event.currentParticipants}/{event.maxParticipants} participants
                        </div>
                        {event.entryFee > 0 && (
                          <div className="font-medium">
                            ${event.entryFee}
                          </div>
                        )}
                      </div>
                      
                      {/* Participation Progress Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Registration</span>
                          <span>{getParticipationRate(event.currentParticipants, event.maxParticipants)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${getParticipationRate(event.currentParticipants, event.maxParticipants)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      {statusLabels[event.status as keyof typeof statusLabels]}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Participants
                        </DropdownMenuItem>
                        {event.status === 'open' && (
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Participant
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No events found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Quick View */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming This Week</CardTitle>
            <CardDescription>
              Quick overview of events happening this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter(event => {
                  const eventDate = new Date(event.eventDate)
                  const today = new Date()
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                  return eventDate >= today && eventDate <= weekFromNow
                })
                .map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium">{formatDate(event.eventDate)}</div>
                        <div className="text-xs text-gray-500">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                      </div>
                      <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                        {statusLabels[event.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>{event.location}</span>
                      <Badge className={typeColors[event.eventType as keyof typeof typeColors]}>
                        {typeLabels[event.eventType as keyof typeof typeLabels]}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {event.currentParticipants}/{event.maxParticipants} registered
                    </div>
                  </div>
                ))}
              
              {events.filter(event => {
                const eventDate = new Date(event.eventDate)
                const today = new Date()
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return eventDate >= today && eventDate <= weekFromNow
              }).length === 0 && (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  No events scheduled for this week
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Form Modal */}
        <EventForm
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onSubmit={handleCreateEvent}
          mode="create"
        />
      </div>
    </DashboardLayout>
  )
}
