'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Trophy,
  Coffee,
  GraduationCap,
  Settings,
  MapPin,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CalendarDays,
  Star,
  MoreVertical
} from 'lucide-react'
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns'
import EventForm from '@/components/events/event-form'
import EventDetailsModal from '@/components/modals/event-details-modal'
import EventsCalendar from '@/components/events/events-calendar'

export interface Event {
  id: string
  title: string
  description: string
  type: 'tournament' | 'social' | 'training' | 'maintenance' | 'meeting'
  category: string
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  location: string
  courtIds: string[]
  maxParticipants?: number
  currentParticipants: number
  registrationDeadline?: string
  cost: number
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled'
  skillLevel: 'all' | 'beginner' | 'intermediate' | 'advanced' | 'open'
  organizer: string
  contact: {
    name: string
    email: string
    phone?: string
  }
  prizes?: string[]
  requirements?: string[]
  equipment?: string[]
  rules?: string
  notes?: string
  images?: string[]
  registeredMembers: {
    id: string
    name: string
    email: string
    skillLevel: string
    registrationDate: string
    paymentStatus: 'pending' | 'paid' | 'refunded'
  }[]
  waitlist: {
    id: string
    name: string
    email: string
    skillLevel: string
    waitlistDate: string
  }[]
  createdAt: string
  updatedAt: string
}

// Mock courts data (imported from court system)
const mockCourts = [
  {
    id: '1',
    name: 'Court A',
    type: 'Indoor',
    status: 'active'
  },
  {
    id: '2', 
    name: 'Court B',
    type: 'Indoor',
    status: 'active'
  },
  {
    id: '3',
    name: 'Court C', 
    type: 'Outdoor',
    status: 'maintenance'
  },
  {
    id: '4',
    name: 'Court D',
    type: 'Outdoor', 
    status: 'active'
  }
]

// Mock booking data (imported from court booking system)
interface Booking {
  id: string
  courtId: string
  courtName: string
  title: string
  type: 'member' | 'club_event' | 'maintenance' | 'social' | 'tournament'
  startTime: string
  endTime: string
  date: string
  status: 'confirmed' | 'pending' | 'cancelled'
  memberName?: string
  memberEmail?: string
  description?: string
  isBlocked?: boolean
  createdBy: 'member' | 'club'
  participants?: number
  maxParticipants?: number
  cost?: number
}

const mockBookings: Booking[] = [
  {
    id: '1',
    courtId: '1',
    courtName: 'Court A',
    title: 'Weekly Club Tournament',
    type: 'tournament',
    startTime: '09:00',
    endTime: '17:00',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'confirmed',
    description: 'Weekly club tournament for all skill levels',
    createdBy: 'club',
    participants: 16,
    maxParticipants: 32,
    cost: 15
  },
  {
    id: '2',
    courtId: '2',
    courtName: 'Court B',
    title: 'Social Mixer Night',
    type: 'social',
    startTime: '18:00',
    endTime: '21:00',
    date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
    status: 'confirmed',
    description: 'Monthly social mixer with snacks and drinks',
    createdBy: 'club',
    participants: 8,
    maxParticipants: 20,
    cost: 0
  },
  {
    id: '3',
    courtId: '3',
    courtName: 'Court C',
    title: 'Court Maintenance',
    type: 'maintenance',
    startTime: '08:00',
    endTime: '12:00',
    date: format(new Date(Date.now() + 2 * 86400000), 'yyyy-MM-dd'), // Day after tomorrow
    status: 'confirmed',
    description: 'Surface repair and line painting',
    createdBy: 'club',
    isBlocked: true
  },
  {
    id: '4',
    courtId: '1',
    courtName: 'Court A',
    title: 'Member Booking - John Smith',
    type: 'member',
    startTime: '14:00',
    endTime: '16:00',
    date: format(new Date(Date.now() + 3 * 86400000), 'yyyy-MM-dd'),
    status: 'confirmed',
    memberName: 'John Smith',
    memberEmail: 'john@example.com',
    description: 'Practice session',
    createdBy: 'member',
    participants: 4,
    cost: 50
  },
  {
    id: '5',
    courtId: '2',
    courtName: 'Court B',
    title: 'Member Booking - Lisa Chen',
    type: 'member',
    startTime: '10:00',
    endTime: '11:30',
    date: format(new Date(), 'yyyy-MM-dd'), // Today
    status: 'confirmed',
    memberName: 'Lisa Chen',
    memberEmail: 'lisa@example.com',
    description: 'Morning training session',
    createdBy: 'member',
    participants: 2,
    cost: 30
  }
]

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekly Round Robin Tournament',
    description: 'Join us for our weekly round robin tournament. All skill levels welcome! Great opportunity to meet other players and improve your game.',
    type: 'tournament',
    category: 'Competition',
    startDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Courts A & B',
    courtIds: ['1', '2'],
    maxParticipants: 32,
    currentParticipants: 24,
    registrationDeadline: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    cost: 25,
    status: 'registration_open',
    skillLevel: 'all',
    organizer: 'Tournament Committee',
    contact: {
      name: 'Sarah Johnson',
      email: 'tournaments@pbc.com',
      phone: '(555) 123-4567'
    },
    prizes: ['$200 Winner', '$100 Runner-up', '$50 Third Place'],
    requirements: ['Club membership required', 'Bring your own paddle'],
    equipment: ['Balls provided', 'Water stations available'],
    rules: 'USAPA rules apply. Round robin format with bracket play for top 8.',
    registeredMembers: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        skillLevel: 'intermediate',
        registrationDate: '2024-12-01',
        paymentStatus: 'paid'
      }
    ],
    waitlist: [],
    createdAt: '2024-11-15',
    updatedAt: '2024-12-01'
  },
  {
    id: '2',
    title: 'Holiday Social Mixer',
    description: 'Come celebrate the holidays with fellow pickleball enthusiasts! Food, drinks, and fun games for the whole family.',
    type: 'social',
    category: 'Social',
    startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    startTime: '18:00',
    endTime: '22:00',
    location: 'Clubhouse & Court D',
    courtIds: ['4'],
    maxParticipants: 60,
    currentParticipants: 42,
    cost: 15,
    status: 'registration_open',
    skillLevel: 'all',
    organizer: 'Social Committee',
    contact: {
      name: 'Mike Wilson',
      email: 'social@pbc.com'
    },
    requirements: ['Bring a side dish to share'],
    equipment: ['Music and games provided'],
    registeredMembers: [],
    waitlist: [],
    createdAt: '2024-11-01',
    updatedAt: '2024-11-28'
  },
  {
    id: '3',
    title: 'Beginner Skills Clinic',
    description: 'Learn the fundamentals of pickleball in this comprehensive clinic designed for new players.',
    type: 'training',
    category: 'Education',
    startDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '12:00',
    location: 'Court C',
    courtIds: ['3'],
    maxParticipants: 12,
    currentParticipants: 8,
    cost: 20,
    status: 'registration_open',
    skillLevel: 'beginner',
    organizer: 'Coaching Staff',
    contact: {
      name: 'Lisa Chen',
      email: 'coaching@pbc.com',
      phone: '(555) 987-6543'
    },
    requirements: ['No experience necessary', 'Athletic wear recommended'],
    equipment: ['Paddles and balls provided', 'Bring water bottle'],
    registeredMembers: [],
    waitlist: [],
    createdAt: '2024-11-20',
    updatedAt: '2024-11-25'
  },
  {
    id: '4',
    title: 'Court Maintenance Day',
    description: 'Monthly court maintenance and cleaning. Courts will be unavailable during this time.',
    type: 'maintenance',
    category: 'Maintenance',
    startDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '16:00',
    location: 'All Courts',
    courtIds: ['1', '2', '3', '4'],
    currentParticipants: 0,
    cost: 0,
    status: 'published',
    skillLevel: 'all',
    organizer: 'Facilities Team',
    contact: {
      name: 'Bob Martinez',
      email: 'facilities@pbc.com'
    },
    notes: 'All courts will be closed. Club activities suspended.',
    registeredMembers: [],
    waitlist: [],
    createdAt: '2024-11-01',
    updatedAt: '2024-11-01'
  },
  {
    id: '5',
    title: 'Summer Championship',
    description: 'The biggest tournament of the year! Compete against the best players in the region.',
    type: 'tournament',
    category: 'Championship',
    startDate: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 23), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '18:00',
    location: 'All Courts',
    courtIds: ['1', '2', '3', '4'],
    maxParticipants: 64,
    currentParticipants: 12,
    registrationDeadline: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    cost: 75,
    status: 'registration_open',
    skillLevel: 'advanced',
    organizer: 'Tournament Committee',
    contact: {
      name: 'Sarah Johnson',
      email: 'tournaments@pbc.com',
      phone: '(555) 123-4567'
    },
    prizes: ['$1000 Winner', '$500 Runner-up', '$250 Semifinalists'],
    requirements: ['3.5+ skill level', 'Tournament experience preferred'],
    equipment: ['Bring your own paddle', 'Towels provided'],
    rules: 'Double elimination format. USAPA certified referees.',
    registeredMembers: [],
    waitlist: [],
    createdAt: '2024-10-15',
    updatedAt: '2024-11-30'
  }
]

const getEventTypeIcon = (type: Event['type']) => {
  switch (type) {
    case 'tournament':
      return Trophy
    case 'social':
      return Coffee
    case 'training':
      return GraduationCap
    case 'maintenance':
      return Settings
    case 'meeting':
      return Users
    default:
      return Calendar
  }
}

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'tournament':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'social':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'training':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'meeting':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: Event['status']) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'published':
      return 'bg-blue-100 text-blue-800'
    case 'registration_open':
      return 'bg-green-100 text-green-800'
    case 'registration_closed':
      return 'bg-yellow-100 text-yellow-800'
    case 'in_progress':
      return 'bg-orange-100 text-orange-800'
    case 'completed':
      return 'bg-purple-100 text-purple-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSkillLevelColor = (level: Event['skillLevel']) => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800'
    case 'advanced':
      return 'bg-red-100 text-red-800'
    case 'open':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSkillLevel, setFilterSkillLevel] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || event.type === filterType
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesSkillLevel = filterSkillLevel === 'all' || event.skillLevel === filterSkillLevel

    return matchesSearch && matchesType && matchesStatus && matchesSkillLevel
  })

  // Calculate stats
  const stats = {
    total: events.length,
    upcoming: events.filter(e => isAfter(parseISO(e.startDate), new Date())).length,
    registrationOpen: events.filter(e => e.status === 'registration_open').length,
    totalParticipants: events.reduce((sum, e) => sum + e.currentParticipants, 0),
    totalRevenue: events.reduce((sum, e) => sum + (e.currentParticipants * e.cost), 0)
  }

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'registeredMembers' | 'waitlist'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      currentParticipants: 0,
      registeredMembers: [],
      waitlist: [],
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    }
    setEvents(prev => [newEvent, ...prev])
    setIsEventFormOpen(false)
    console.log('Event created:', newEvent)
  }

  const handleEditEvent = (eventData: Partial<Event>) => {
    if (!editingEvent) return
    
    setEvents(prev => prev.map(event =>
      event.id === editingEvent.id
        ? { ...event, ...eventData, updatedAt: format(new Date(), 'yyyy-MM-dd') }
        : event
    ))
    setEditingEvent(null)
    setIsEventFormOpen(false)
    console.log('Event updated:', eventData)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId))
      console.log('Event deleted:', eventId)
    }
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEventDetailsOpen(true)
  }

  const handleEditEventClick = (event: Event) => {
    setEditingEvent(event)
    setIsEventFormOpen(true)
  }

  const renderEventCard = (event: Event) => {
    const TypeIcon = getEventTypeIcon(event.type)
    const isUpcoming = isAfter(parseISO(event.startDate), new Date())
    const isPast = isBefore(parseISO(event.startDate), new Date())
    const registrationFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants

    return (
      <Card key={event.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <TypeIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getSkillLevelColor(event.skillLevel)}>
                    {event.skillLevel.charAt(0).toUpperCase() + event.skillLevel.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {event.description}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditEventClick(event)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Event Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(parseISO(event.startDate), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
              {event.cost > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>${event.cost}</span>
                </div>
              )}
            </div>

            {/* Registration Info */}
            {event.maxParticipants && event.type !== 'maintenance' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Registration:</span>
                  <span className={registrationFull ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {event.currentParticipants}/{event.maxParticipants}
                    {registrationFull && ' (Full)'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      registrationFull ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewEvent(event)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {isUpcoming && event.status === 'registration_open' && !registrationFull && (
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                by {event.organizer}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout title="Events">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcoming} upcoming
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Registration</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registrationOpen}</div>
              <p className="text-xs text-muted-foreground">
                events accepting signups
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                total registrations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                from event fees
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Size</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round(stats.totalParticipants / stats.total) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                participants per event
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tournament">Tournaments</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registration_open">Open</SelectItem>
                <SelectItem value="registration_closed">Closed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSkillLevel} onValueChange={setFilterSkillLevel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="open">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-l-none"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
            
            <Button onClick={() => setIsEventFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Events List */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => renderEventCard(event))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterSkillLevel !== 'all'
                      ? 'No events match your current filters.'
                      : 'No events have been created yet.'}
                  </p>
                  <Button onClick={() => setIsEventFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <EventsCalendar
            events={filteredEvents}
            onEventClick={handleViewEvent}
            bookings={mockBookings}
            courts={mockCourts}
            onBookingClick={(booking) => {
              console.log('Booking clicked:', booking)
              // In a real app, this would open a booking details modal
            }}
          />
        )}

        {/* Event Form Modal */}
        <EventForm
          open={isEventFormOpen}
          onOpenChange={setIsEventFormOpen}
          onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
          event={editingEvent}
        />

        {/* Event Details Modal */}
        <EventDetailsModal
          open={isEventDetailsOpen}
          onOpenChange={setIsEventDetailsOpen}
          event={selectedEvent}
          onEdit={handleEditEventClick}
          onDelete={handleDeleteEvent}
        />
      </div>
    </DashboardLayout>
  )
}
