'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, startOfDay, addHours, differenceInMinutes } from 'date-fns'

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

interface CourtBookingManagerProps {
  courtId?: string
  bookings: Booking[]
  onCreateBooking: (booking: Omit<Booking, 'id'>) => void
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void
  onDeleteBooking: (bookingId: string) => void
}

const getBookingTypeColor = (type: string) => {
  switch (type) {
    case 'club_event':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'social':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'tournament':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'member':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const CourtBookingManager: React.FC<CourtBookingManagerProps> = ({
  courtId,
  bookings,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')

  // Filter bookings based on court and date
  const filteredBookings = bookings.filter(booking => {
    if (courtId && booking.courtId !== courtId) return false
    
    const bookingDate = new Date(booking.date)
    if (viewMode === 'day') {
      return isSameDay(bookingDate, selectedDate)
    } else {
      const weekStart = startOfWeek(selectedDate)
      const weekEnd = endOfWeek(selectedDate)
      return bookingDate >= weekStart && bookingDate <= weekEnd
    }
  })

  // Group bookings by date for week view
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.date
    if (!acc[date]) acc[date] = []
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Generate time slots (6 AM to 11 PM)
  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const hour = Math.floor(6 + i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${minute}`
  })

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfWeek(selectedDate), i)
  })

  const renderDayView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            disabled={isToday(selectedDate)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {timeSlots.map(time => {
          const dayBookings = filteredBookings.filter(booking => {
            const bookingStart = booking.startTime
            const bookingEnd = booking.endTime
            return time >= bookingStart && time < bookingEnd
          })

          return (
            <div key={time} className="flex items-center gap-4 min-h-[50px] border-b border-gray-100">
              <div className="w-16 text-sm text-gray-500 font-mono">
                {time}
              </div>
              <div className="flex-1 grid gap-2">
                {dayBookings.map(booking => (
                  <Card key={booking.id} className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getBookingTypeColor(booking.type)}>
                          {booking.type.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium">{booking.title}</span>
                        {booking.courtName && (
                          <span className="text-sm text-gray-500">
                            @ {booking.courtName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {booking.description && (
                      <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{booking.startTime} - {booking.endTime}</span>
                      {booking.memberName && (
                        <span>👤 {booking.memberName}</span>
                      )}
                      {booking.participants && (
                        <span>👥 {booking.participants}/{booking.maxParticipants || '∞'}</span>
                      )}
                    </div>
                  </Card>
                ))}
                {dayBookings.length === 0 && (
                  <div className="text-gray-400 text-sm">Available</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          >
            Next Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toISOString()} className="space-y-2">
            <div className="text-center">
              <div className="text-sm font-medium">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
            
            <div className="space-y-1">
              {(bookingsByDate[format(day, 'yyyy-MM-dd')] || []).map(booking => (
                <Card key={booking.id} className="p-2 text-xs">
                  <div className="font-medium truncate">{booking.title}</div>
                  <div className="text-gray-500">
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <Badge className={`${getBookingTypeColor(booking.type)} text-xs`}>
                    {booking.type.replace('_', ' ')}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderUpcoming = () => {
    const upcomingBookings = bookings
      .filter(booking => new Date(booking.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10)

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
        
        {upcomingBookings.map(booking => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.title}</span>
                    <Badge className={getBookingTypeColor(booking.type)}>
                      {booking.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(booking.date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.courtName}
                    </span>
                  </div>
                  
                  {booking.description && (
                    <p className="text-sm text-gray-600">{booking.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {booking.memberName && (
                      <span>Member: {booking.memberName}</span>
                    )}
                    {booking.participants && (
                      <span>{booking.participants}/{booking.maxParticipants || '∞'} participants</span>
                    )}
                    {booking.cost && (
                      <span>${booking.cost}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle edit booking
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteBooking(booking.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {upcomingBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No upcoming bookings
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Court Bookings</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            // Handle create club event
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Club Event
          </Button>
          <Button variant="outline" onClick={() => {
            // Handle block court
          }}>
            <XCircle className="w-4 h-4 mr-2" />
            Block Court
          </Button>
        </div>
      </div>

      <Tabs value={viewMode === 'day' ? 'day' : viewMode === 'week' ? 'week' : 'upcoming'} onValueChange={(value) => {
        if (value === 'day' || value === 'week') {
          setViewMode(value)
        }
      }}>
        <TabsList>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-4">
          {renderDayView()}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {renderWeekView()}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {renderUpcoming()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CourtBookingManager
