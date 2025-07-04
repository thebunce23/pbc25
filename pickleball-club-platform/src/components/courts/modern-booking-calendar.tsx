'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Filter,
  Grid3X3,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parse, differenceInMinutes } from 'date-fns'

export interface Booking {
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

interface Court {
  id: string
  name: string
  type: string
  status: string
}

interface ModernBookingCalendarProps {
  courts: Court[]
  bookings: Booking[]
  onCreateBooking: (booking: Omit<Booking, 'id'>) => void
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void
  onDeleteBooking: (bookingId: string) => void
  onViewBooking?: (booking: Booking) => void
  onCreateClubEvent?: () => void
}

const getBookingTypeColor = (type: string) => {
  switch (type) {
    case 'club_event':
      return { bg: 'bg-purple-500', text: 'text-white', light: 'bg-purple-100 text-purple-800' }
    case 'social':
      return { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-100 text-blue-800' }
    case 'tournament':
      return { bg: 'bg-orange-500', text: 'text-white', light: 'bg-orange-100 text-orange-800' }
    case 'maintenance':
      return { bg: 'bg-red-500', text: 'text-white', light: 'bg-red-100 text-red-800' }
    case 'member':
      return { bg: 'bg-green-500', text: 'text-white', light: 'bg-green-100 text-green-800' }
    default:
      return { bg: 'bg-gray-500', text: 'text-white', light: 'bg-gray-100 text-gray-800' }
  }
}

const ModernBookingCalendar: React.FC<ModernBookingCalendarProps> = ({
  courts,
  bookings,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking,
  onViewBooking,
  onCreateClubEvent
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [newBookingSlot, setNewBookingSlot] = useState<{court: Court, date: Date, time: string} | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [timeRange, setTimeRange] = useState({ start: 6, end: 22 }) // 6 AM to 10 PM

  // Generate time slots based on range
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < timeRange.end) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }, [timeRange])

  // Show all courts except inactive ones
  // This allows booking on courts under maintenance (for maintenance events)
  const activeCourts = courts.filter(court => court.status !== 'inactive')

  // Generate days based on view mode
  const days = useMemo(() => {
    if (viewMode === 'day') {
      return [selectedDate]
    } else {
      return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i))
    }
  }, [selectedDate, viewMode])

  // Filter bookings for current view
  const viewBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      const isInDateRange = days.some(day => isSameDay(bookingDate, day))
      const matchesFilter = filterType === 'all' || booking.type === filterType
      return isInDateRange && matchesFilter
    })
  }, [bookings, days, filterType])

  // Calculate booking position and height
  const getBookingStyle = (booking: Booking) => {
    const startTime = parse(booking.startTime, 'HH:mm', new Date())
    const endTime = parse(booking.endTime, 'HH:mm', new Date())
    const duration = differenceInMinutes(endTime, startTime)
    
    const slotHeight = 60 // pixels per 30-min slot
    const height = (duration / 30) * slotHeight
    
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const slotsFromStart = ((startHour - timeRange.start) * 2) + (startMinute / 30)
    const top = slotsFromStart * slotHeight
    
    return { height: `${height}px`, top: `${top}px` }
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const colors = getBookingTypeColor(booking.type)
    const style = getBookingStyle(booking)
    
    return (
      <div
        className={`absolute left-1 right-1 ${colors.bg} ${colors.text} rounded-md p-2 border border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10 overflow-hidden`}
        style={style}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedBooking(booking)
          setShowBookingDetails(true)
        }}
      >
        <div className="text-xs font-medium truncate">{booking.title}</div>
        <div className="text-xs opacity-90">
          {booking.startTime} - {booking.endTime}
        </div>
        {booking.memberName && (
          <div className="text-xs opacity-80 truncate">{booking.memberName}</div>
        )}
        {booking.participants && (
          <div className="text-xs opacity-80">
            {booking.participants}/{booking.maxParticipants || '∞'}
          </div>
        )}
      </div>
    )
  }

  const TimeSlotCell = ({ court, day, time }: { court: Court, day: Date, time: string }) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const cellBookings = viewBookings.filter(booking => 
      booking.courtId === court.id && 
      booking.date === dayStr &&
      booking.startTime <= time &&
      booking.endTime > time
    )

    const handleCellClick = () => {
      // Check if there are existing bookings in this slot
      if (cellBookings.length === 0) {
        setNewBookingSlot({ court, date: day, time })
        if (onCreateClubEvent) {
          onCreateClubEvent()
        }
      }
    }

    return (
      <div 
        className="relative h-[60px] border-r border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors group"
        onClick={handleCellClick}
      >
        {/* Time slot bookings */}
        {cellBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
        
        {/* Add booking button on hover */}
        {cellBookings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCellClick()
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6" />
            Court Schedule
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="club_event">Club Event</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'day' ? -1 : -7))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="px-4 py-2 bg-gray-50 rounded-md">
            <span className="font-medium">
              {viewMode === 'day' 
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
              }
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'day' ? 1 : 7))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Legend:</span>
          {Object.entries({
            member: 'Member',
            club_event: 'Club Event', 
            social: 'Social',
            tournament: 'Tournament',
            maintenance: 'Maintenance'
          }).map(([type, label]) => {
            const colors = getBookingTypeColor(type)
            return (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${colors.bg}`}></div>
                <span className="text-xs">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Main Header Row */}
            <div className="grid border-b-2 border-gray-300 bg-gray-50" style={{ gridTemplateColumns: `140px repeat(${activeCourts.length}, 1fr)` }}>
              <div className="p-4 border-r-2 border-gray-300 font-medium bg-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Time</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(viewMode === 'day' ? selectedDate : startOfWeek(selectedDate), 'MMM d')}
                  {viewMode === 'week' && ` - ${format(endOfWeek(selectedDate), 'MMM d')}`}
                </div>
              </div>
              
              {/* Court Headers */}
              {activeCourts.map(court => {
                const courtBookings = viewBookings.filter(b => b.courtId === court.id)
                const todayBookings = courtBookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd'))
                
                return (
                  <div key={court.id} className="p-4 border-r border-gray-300 text-center bg-white">
                    <div className="font-bold text-lg text-gray-900">{court.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{court.type} • {court.status}</div>
                    
                    {/* Court stats */}
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {todayBookings.length} today
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        ${court.type === 'Indoor' ? '25' : '15'}/hr
                      </div>
                    </div>
                    
                    {/* Quick status indicator */}
                    <div className={`mt-2 h-1 rounded ${
                      court.status === 'maintenance' ? 'bg-red-400' :
                      todayBookings.length > 8 ? 'bg-orange-400' :
                      todayBookings.length > 4 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                  </div>
                )
              })}
            </div>

            {/* Day Headers (for week view) */}
            {viewMode === 'week' && (
              <div className="grid border-b border-gray-200 bg-gray-25" style={{ gridTemplateColumns: `140px repeat(${activeCourts.length}, 1fr)` }}>
                <div className="p-2 border-r border-gray-300 bg-gray-100">
                  <div className="text-xs text-gray-500">Select Day</div>
                </div>
                {activeCourts.map(court => (
                  <div key={court.id} className="border-r border-gray-300">
                    <div className="grid grid-cols-7 gap-0">
                      {days.map(day => (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 text-center text-xs cursor-pointer hover:bg-blue-50 ${
                            isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-600'
                          }`}
                          onClick={() => {
                            setSelectedDate(day)
                            setViewMode('day')
                          }}
                        >
                          <div className="font-medium">{format(day, 'EEE')}</div>
                          <div>{format(day, 'd')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Time Grid */}
            <div className="relative">
              {timeSlots.map((time, timeIndex) => {
                const isHourMark = time.endsWith(':00')
                
                return (
                  <div 
                    key={time} 
                    className={`grid border-b ${
                      isHourMark ? 'border-gray-300' : 'border-gray-100'
                    }`} 
                    style={{ gridTemplateColumns: `140px repeat(${activeCourts.length}, 1fr)` }}
                  >
                    {/* Time Label */}
                    <div className={`p-3 border-r border-gray-300 text-sm flex items-center ${
                      isHourMark ? 'bg-gray-50 font-medium' : 'bg-gray-25'
                    }`}>
                      <div className="text-right w-full">
                        <div className={isHourMark ? 'text-gray-900' : 'text-gray-500'}>
                          {format(parse(time, 'HH:mm', new Date()), isHourMark ? 'h a' : 'h:mm')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Court Time Slots */}
                    {activeCourts.map(court => {
                      const currentDay = viewMode === 'day' ? selectedDate : new Date() // Default to today for week view
                      
                      return (
                        <div key={`${court.id}-${time}`} className="relative border-r border-gray-200">
                          {viewMode === 'day' ? (
                            <TimeSlotCell court={court} day={currentDay} time={time} />
                          ) : (
                            <div className="h-[60px] relative">
                              {/* Week view - show aggregated bookings for all days */}
                              {days.map(day => {
                                const dayStr = format(day, 'yyyy-MM-dd')
                                const dayBookings = viewBookings.filter(booking => 
                                  booking.courtId === court.id && 
                                  booking.date === dayStr &&
                                  booking.startTime <= time &&
                                  booking.endTime > time
                                )
                                
                                if (dayBookings.length === 0) return null
                                
                                const booking = dayBookings[0]
                                const colors = getBookingTypeColor(booking.type)
                                const dayIndex = days.findIndex(d => isSameDay(d, day))
                                const width = `${100/7}%`
                                const left = `${(dayIndex * 100)/7}%`
                                
                                return (
                                  <div
                                    key={day.toISOString()}
                                    className={`absolute top-1 bottom-1 ${colors.bg} rounded-sm opacity-80 cursor-pointer hover:opacity-100 transition-opacity`}
                                    style={{ width, left }}
                                    onClick={() => {
                                      setSelectedDate(day)
                                      setViewMode('day')
                                    }}
                                    title={`${booking.title} - ${format(day, 'EEE MMM d')}`}
                                  >
                                    <div className="text-xs text-white p-1 truncate">
                                      {booking.title}
                                    </div>
                                  </div>
                                )
                              })}
                              
                              {/* Click to create booking */}
                              <div 
                                className="absolute inset-0 hover:bg-blue-50 cursor-pointer transition-colors group"
                                onClick={() => {
                                  setNewBookingSlot({ court, date: new Date(), time })
                                  if (onCreateClubEvent) {
                                    onCreateClubEvent()
                                  }
                                }}
                              >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white shadow-sm">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Booking Info */}
      {selectedBooking && !showBookingDetails && (
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selectedBooking.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedBooking(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge className={getBookingTypeColor(selectedBooking.type).light}>
                {selectedBooking.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{selectedBooking.status}</Badge>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {format(new Date(selectedBooking.date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {selectedBooking.startTime} - {selectedBooking.endTime}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {selectedBooking.courtName}
              </div>
            </div>

            <div className="flex gap-1 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowBookingDetails(true)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this booking?')) {
                    onDeleteBooking(selectedBooking.id)
                    setSelectedBooking(null)
                  }
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModernBookingCalendar
