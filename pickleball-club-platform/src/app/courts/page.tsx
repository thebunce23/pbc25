'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, MapPin, Activity, Calendar, AlertTriangle, CalendarDays } from 'lucide-react'
import { useClubSettings } from '@/contexts/club-settings-context'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AddCourtForm from '@/components/forms/add-court-form'
import EditCourtForm from '@/components/forms/edit-court-form'
import CourtProfileView from '@/components/modals/court-profile-view'
import ModernBookingCalendar from '@/components/courts/modern-booking-calendar'
import ClubEventForm from '@/components/forms/club-event-form'
import BookingDetailsModal from '@/components/modals/booking-details-modal'
import type { Booking } from '@/components/courts/modern-booking-calendar'
import { format } from 'date-fns'

// Mock booking data
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
  }
]

// Mock data - replace with real data from your service
const mockCourts = [
  {
    id: '1',
    name: 'Court A',
    type: 'Indoor',
    surface: 'Concrete',
    status: 'active',
    dimensions: { length: 44, width: 20 },
    lighting: true,
    airConditioning: true,
    accessibility: true,
    description: 'Main indoor court with excellent lighting and climate control',
    hourlyRate: 25,
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2024-12-15',
    notes: 'Popular court, book in advance',
    amenities: ['Lighting', 'AC', 'Sound System', 'Wheelchair Accessible'],
    bookings: {
      today: 6,
      thisWeek: 28,
      thisMonth: 115
    }
  },
  {
    id: '2',
    name: 'Court B',
    type: 'Indoor',
    surface: 'Synthetic',
    status: 'active',
    dimensions: { length: 44, width: 20 },
    lighting: true,
    airConditioning: true,
    accessibility: false,
    description: 'Second indoor court with premium synthetic surface',
    hourlyRate: 30,
    lastMaintenance: '2024-11-20',
    nextMaintenance: '2024-12-20',
    notes: 'New synthetic surface installed',
    amenities: ['Lighting', 'AC', 'Premium Surface'],
    bookings: {
      today: 4,
      thisWeek: 22,
      thisMonth: 89
    }
  },
  {
    id: '3',
    name: 'Court C',
    type: 'Outdoor',
    surface: 'Asphalt',
    status: 'maintenance',
    dimensions: { length: 44, width: 20 },
    lighting: true,
    airConditioning: false,
    accessibility: true,
    description: 'Outdoor court with night lighting',
    hourlyRate: 15,
    lastMaintenance: '2024-12-01',
    nextMaintenance: '2024-12-10',
    notes: 'Under maintenance - surface repairs',
    amenities: ['Lighting', 'Wheelchair Accessible'],
    bookings: {
      today: 0,
      thisWeek: 5,
      thisMonth: 45
    }
  },
  {
    id: '4',
    name: 'Court D',
    type: 'Outdoor',
    surface: 'Sport Court',
    status: 'active',
    dimensions: { length: 44, width: 20 },
    lighting: true,
    airConditioning: false,
    accessibility: true,
    description: 'Premium outdoor court with Sport Court surface',
    hourlyRate: 20,
    lastMaintenance: '2024-10-30',
    nextMaintenance: '2024-01-30',
    notes: 'Weather dependent availability',
    amenities: ['Lighting', 'Premium Surface', 'Wheelchair Accessible'],
    bookings: {
      today: 3,
      thisWeek: 18,
      thisMonth: 72
    }
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
  unavailable: 'bg-red-100 text-red-800'
}

const statusLabels = {
  active: 'Active',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
  unavailable: 'Unavailable'
}

const typeColors = {
  Indoor: 'bg-blue-100 text-blue-800',
  Outdoor: 'bg-green-100 text-green-800'
}

const surfaceColors = {
  Concrete: 'bg-gray-100 text-gray-800',
  Asphalt: 'bg-slate-100 text-slate-800',
  Synthetic: 'bg-purple-100 text-purple-800',
  'Sport Court': 'bg-orange-100 text-orange-800'
}

export default function CourtsPage() {
  const [courts, setCourts] = useState(mockCourts)
  const [bookings, setBookings] = useState(mockBookings)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false)
  const [isEditCourtOpen, setIsEditCourtOpen] = useState(false)
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false)
  const [isClubEventOpen, setIsClubEventOpen] = useState(false)
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [activeTab, setActiveTab] = useState('courts')
  const { formatDate } = useClubSettings()

  const filteredCourts = courts.filter(court => {
    const matchesSearch = searchTerm === '' || 
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.surface.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || court.type === filterType
    const matchesStatus = filterStatus === 'all' || court.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: courts.length,
    active: courts.filter(c => c.status === 'active').length,
    indoor: courts.filter(c => c.type === 'Indoor').length,
    outdoor: courts.filter(c => c.type === 'Outdoor').length,
    maintenance: courts.filter(c => c.status === 'maintenance').length,
    totalBookings: courts.reduce((sum, court) => sum + court.bookings.today, 0),
    revenue: courts.reduce((sum, court) => sum + (court.bookings.today * court.hourlyRate), 0)
  }

  const handleAddCourt = async (courtData: any) => {
    const newCourt = {
      id: Math.random().toString(36).substr(2, 9),
      ...courtData,
      bookings: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    }

    setCourts(prev => [newCourt, ...prev])
    console.log('Court added:', newCourt)
  }

  const handleEditCourt = async (courtData: any) => {
    setCourts(prev => prev.map(court => 
      court.id === selectedCourt?.id 
        ? { ...court, ...courtData }
        : court
    ))
    console.log('Court updated:', courtData)
  }

  const handleViewProfile = (court: any) => {
    setSelectedCourt(court)
    setIsProfileViewOpen(true)
  }

  const handleEditCourtClick = (court: any) => {
    setSelectedCourt(court)
    setIsEditCourtOpen(true)
  }

  const handleEditFromProfile = () => {
    setIsProfileViewOpen(false)
    setIsEditCourtOpen(true)
  }

  const handleDeleteCourt = (courtId: string) => {
    setCourts(prev => prev.filter(court => court.id !== courtId))
  }

  const handleCreateBooking = (bookingData: Omit<Booking, 'id'>) => {
    const newBooking = {
      id: Math.random().toString(36).substr(2, 9),
      ...bookingData,
      courtName: courts.find(c => c.id === bookingData.courtId)?.name || 'Unknown Court'
    }
    setBookings(prev => [...prev, newBooking])
    console.log('Booking created:', newBooking)
  }

  const handleUpdateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, ...updates }
        : booking
    ))
    console.log('Booking updated:', updates)
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId))
    console.log('Booking deleted:', bookingId)
  }

  const handleCreateClubEvent = (eventData: any) => {
    // Create bookings for each selected court
    eventData.courtIds.forEach((courtId: string) => {
      const booking: Omit<Booking, 'id'> = {
        courtId,
        courtName: courts.find(c => c.id === courtId)?.name || 'Unknown Court',
        title: eventData.title,
        type: eventData.type,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        date: eventData.date,
        status: 'confirmed',
        description: eventData.description,
        createdBy: 'club',
        participants: 0,
        maxParticipants: eventData.maxParticipants,
        cost: eventData.cost,
        isBlocked: eventData.blockBookings
      }
      handleCreateBooking(booking)
    })
    setIsClubEventOpen(false)
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsBookingDetailsOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    // For now, just log. In a real app, this would open an edit form
    console.log('Edit booking:', booking)
    setIsBookingDetailsOpen(false)
  }

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ))
    console.log('Booking cancelled:', bookingId)
  }

  return (
    <DashboardLayout title="Courts & Bookings">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="courts">
              <MapPin className="w-4 h-4 mr-2" />
              Courts
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <CalendarDays className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courts" className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active, {stats.maintenance} maintenance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.totalBookings / (stats.active * 12)) * 100)}% utilization
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Court Types</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indoor}/{stats.outdoor}</div>
              <p className="text-xs text-muted-foreground">
                Indoor / Outdoor
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue}</div>
              <p className="text-xs text-muted-foreground">
                From court bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterType === 'all' ? 'All Types' : filterType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('Indoor')}>
                  Indoor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('Outdoor')}>
                  Outdoor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === 'all' ? 'All Status' : statusLabels[filterStatus as keyof typeof statusLabels]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('maintenance')}>
                  Maintenance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsAddCourtOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Court
            </Button>
            <Button variant="outline" onClick={() => setIsClubEventOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Club Event
            </Button>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <Card 
              key={court.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewProfile(court)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{court.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCourtClick(court)
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
                        handleDeleteCourt(court.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[court.status as keyof typeof statusColors]}>
                    {statusLabels[court.status as keyof typeof statusLabels]}
                  </Badge>
                  <Badge className={typeColors[court.type as keyof typeof typeColors]}>
                    {court.type}
                  </Badge>
                  <Badge className={surfaceColors[court.surface as keyof typeof surfaceColors]}>
                    {court.surface}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{court.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rate</div>
                    <div className="font-medium">${court.hourlyRate}/hour</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Today</div>
                    <div className="font-medium">{court.bookings.today} bookings</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {court.dimensions.length}' × {court.dimensions.width}'
                    </span>
                  </div>
                  {court.status === 'maintenance' && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Maintenance</span>
                    </div>
                  )}
                </div>

                {court.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {court.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {court.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{court.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {filteredCourts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No courts found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Add Court Form */}
        <AddCourtForm
          open={isAddCourtOpen}
          onOpenChange={setIsAddCourtOpen}
          onSubmit={handleAddCourt}
        />
        
        {/* Edit Court Form */}
        <EditCourtForm
          open={isEditCourtOpen}
          onOpenChange={setIsEditCourtOpen}
          onSubmit={handleEditCourt}
          court={selectedCourt}
        />
        
        {/* Court Profile View */}
        <CourtProfileView
          open={isProfileViewOpen}
          onOpenChange={setIsProfileViewOpen}
          court={selectedCourt}
          onEdit={handleEditFromProfile}
          onDelete={handleDeleteCourt}
        />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <ModernBookingCalendar
              courts={courts}
              bookings={bookings}
              onCreateBooking={handleCreateBooking}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              onViewBooking={handleViewBooking}
              onCreateClubEvent={() => setIsClubEventOpen(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Club Event Form */}
        <ClubEventForm
          open={isClubEventOpen}
          onOpenChange={setIsClubEventOpen}
          onSubmit={handleCreateClubEvent}
          courts={courts}
        />

        {/* Booking Details Modal */}
        <BookingDetailsModal
          open={isBookingDetailsOpen}
          onOpenChange={setIsBookingDetailsOpen}
          booking={selectedBooking}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onCancel={handleCancelBooking}
        />
      </div>
    </DashboardLayout>
  )
}
