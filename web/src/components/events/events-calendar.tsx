'use client'

import React, { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays as addDaysToDate,
  subDays,
  startOfDay,
  endOfDay,
  isToday,
  startOfWeek as getWeekStart,
  endOfWeek as getWeekEnd
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Trophy, Coffee, GraduationCap, Settings, DollarSign, CalendarDays, Rows } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/app/events/page'

interface EventsCalendarProps {
  events: Event[]
  onEventClick: (event: Event) => void
  bookings?: Booking[]
  courts?: Court[]
  onBookingClick?: (booking: Booking) => void
}

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

interface Court {
  id: string
  name: string
  type: string
  status: string
}

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
    default:
      return Calendar
  }
}

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'tournament':
      return 'bg-yellow-500'
    case 'social':
      return 'bg-blue-500'
    case 'training':
      return 'bg-green-500'
    case 'maintenance':
      return 'bg-red-500'
    case 'meeting':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

type ViewMode = 'day' | 'week' | 'month'

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, onEventClick, bookings = [], courts = [], onBookingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.startDate), date) ||
      (event.endDate && parseISO(event.startDate) <= date && parseISO(event.endDate) >= date)
    )
  }

  const getBookingsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter(booking => booking.date === dateStr)
  }

  const getBookingTypeColor = (type: Booking['type']) => {
    switch (type) {
      case 'club_event':
        return 'bg-purple-500'
      case 'social':
        return 'bg-indigo-500'
      case 'tournament':
        return 'bg-orange-500'
      case 'maintenance':
        return 'bg-red-500'
      case 'member':
        return 'bg-emerald-500'
      default:
        return 'bg-gray-500'
    }
  }

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (viewMode) {
        case 'day':
          return direction === 'prev' ? subDays(prev, 1) : addDaysToDate(prev, 1)
        case 'week':
          return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
        case 'month':
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
        default:
          return prev
      }
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'week':
        const weekStart = getWeekStart(currentDate)
        const weekEnd = getWeekEnd(currentDate)
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      default:
        return ''
    }
  }

  const EventBadge = ({ event, size = 'sm' }: { event: Event; size?: 'sm' | 'md' | 'lg' }) => {
    const TypeIcon = getEventTypeIcon(event.type)
    const tooltipText = `${event.title} • ${event.startTime}-${event.endTime} • ${event.location}${event.cost > 0 ? ` • $${event.cost}` : ''}`
    
    const sizeClasses = {
      sm: 'text-xs p-1 gap-1',
      md: 'text-sm p-2 gap-2',
      lg: 'text-base p-3 gap-3'
    }
    
    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          onEventClick(event)
        }}
        title={tooltipText}
        className={`
          flex items-center rounded mb-1 cursor-pointer
          hover:opacity-80 transition-opacity text-white
          ${getEventTypeColor(event.type)} ${sizeClasses[size]}
        `}
      >
        <TypeIcon className={`flex-shrink-0 ${iconSizes[size]}`} />
        <span className="truncate flex-1 min-w-0">
          {event.title}
        </span>
        <span className="text-xs opacity-75">
          {event.startTime}
        </span>
      </div>
    )
  }

  const EventCard = ({ event }: { event: Event }) => {
    const TypeIcon = getEventTypeIcon(event.type)
    
    return (
      <Card 
        className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onEventClick(event)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg text-white ${getEventTypeColor(event.type)}`}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{event.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{event.startTime} - {event.endTime}</span>
                <MapPin className="w-3 h-3 ml-2" />
                <span className="truncate">{event.location}</span>
              </div>
              {event.cost > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${event.cost}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const BookingBadge = ({ booking, size = 'sm' }: { booking: Booking; size?: 'sm' | 'md' | 'lg' }) => {
    const tooltipText = `${booking.title} • ${booking.startTime}-${booking.endTime} • ${booking.courtName}${booking.memberName ? ` • ${booking.memberName}` : ''}`
    
    const sizeClasses = {
      sm: 'text-xs p-1 gap-1',
      md: 'text-sm p-2 gap-2',
      lg: 'text-base p-3 gap-3'
    }
    
    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          onBookingClick?.(booking)
        }}
        title={tooltipText}
        className={`
          flex items-center rounded mb-1 cursor-pointer
          hover:opacity-80 transition-opacity text-white
          ${getBookingTypeColor(booking.type)} ${sizeClasses[size]}
        `}
      >
        <MapPin className={`flex-shrink-0 ${iconSizes[size]}`} />
        <span className="truncate flex-1 min-w-0">
          {booking.title}
        </span>
        <span className="text-xs opacity-75">
          {booking.startTime}
        </span>
      </div>
    )
  }

  const DayView = () => {
    const dayEvents = getEventsForDay(currentDate).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )
    const dayBookings = getBookingsForDay(currentDate).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )
    
    // Generate time slots from 6 AM to 10 PM
    const timeSlots = []
    for (let hour = 6; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const displayTime = hour <= 12 ? `${hour === 12 ? 12 : hour}:00 ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12}:00 PM`
      timeSlots.push({ time, displayTime, hour })
    }
    
    const getEventsForTimeSlot = (hour: number) => {
      return dayEvents.filter(event => {
        const startHour = parseInt(event.startTime.split(':')[0])
        return startHour === hour
      })
    }
    
    const getBookingsForTimeSlot = (hour: number) => {
      return dayBookings.filter(booking => {
        const startHour = parseInt(booking.startTime.split(':')[0])
        return startHour === hour
      })
    }
    
    return (
      <div className="space-y-4">
        
        {/* Day Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dayEvents.length}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dayBookings.length}</div>
                <div className="text-sm text-gray-600">Court Bookings</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Time Slots */}
        <div className="space-y-0 border rounded-lg overflow-hidden">
          {timeSlots.map(({ time, displayTime, hour }) => {
            const slotEvents = getEventsForTimeSlot(hour)
            const slotBookings = getBookingsForTimeSlot(hour)
            const isCurrentHour = isToday(currentDate) && new Date().getHours() === hour
            const hasActivity = slotEvents.length > 0 || slotBookings.length > 0
            
            return (
              <div key={time} className={`flex border-b last:border-b-0 ${
                isCurrentHour ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}>
                {/* Time Label */}
                <div className="w-20 flex-shrink-0 p-2 text-xs font-medium text-gray-600 border-r bg-gray-50 flex items-center justify-center">
                  {displayTime}
                </div>
                
                {/* Activity Area */}
                <div className="flex-1 p-3 min-h-[60px]">
                  {hasActivity ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Events Column */}
                      <div>
                        {slotEvents.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">EVENTS</div>
                            <div className="space-y-1">
                              {slotEvents.map(event => (
                                <EventBadge key={event.id} event={event} size="md" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Bookings Column */}
                      <div>
                        {slotBookings.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">COURT BOOKINGS</div>
                            <div className="space-y-1">
                              {slotBookings.map(booking => (
                                <BookingBadge key={booking.id} booking={booking} size="md" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center h-full text-gray-400 text-sm">
                      {isCurrentHour && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="text-blue-600 font-medium">Current time</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Summary */}
        <div className="text-center py-4 text-sm text-gray-500">
          {dayEvents.length === 0 && dayBookings.length === 0 ? (
            'No events or bookings scheduled for this day'
          ) : (
            <div className="space-y-1">
              <div>{dayEvents.length} event{dayEvents.length === 1 ? '' : 's'} scheduled</div>
              <div>{dayBookings.length} court booking{dayBookings.length === 1 ? '' : 's'} confirmed</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const WeekView = () => {
    const weekStart = getWeekStart(currentDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    
    // Generate time slots from 6 AM to 10 PM
    const timeSlots = []
    for (let hour = 6; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const displayTime = hour <= 12 ? `${hour === 12 ? 12 : hour}:00 ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12}:00 PM`
      timeSlots.push({ time, displayTime, hour })
    }
    
    const getEventsForTimeSlot = (hour: number, day: Date) => {
      const dayEvents = getEventsForDay(day)
      return dayEvents.filter(event => {
        const startHour = parseInt(event.startTime.split(':')[0])
        return startHour === hour
      })
    }
    
    const getBookingsForTimeSlot = (hour: number, day: Date) => {
      const dayBookings = getBookingsForDay(day)
      return dayBookings.filter(booking => {
        const startHour = parseInt(booking.startTime.split(':')[0])
        return startHour === hour
      })
    }
    
    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-1 border-b pb-4">
          {/* Time column header */}
          <div className="text-center font-medium text-gray-600 text-sm">
            Time
          </div>
          
          {/* Day headers */}
          {weekDays.map(day => (
            <div 
              key={day.toISOString()} 
              className="text-center font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-50 transition-colors p-2 rounded"
              onClick={() => {
                setCurrentDate(day)
                setViewMode('day')
              }}
            >
              <div className={`${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg mt-1 ${
                isToday(day) ? 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline Grid */}
        <div className="border rounded-lg overflow-hidden">
          {timeSlots.map(({ time, displayTime, hour }) => {
            const isCurrentHour = new Date().getHours() === hour
            
            return (
              <div key={time} className={`grid grid-cols-8 border-b last:border-b-0 ${
                isCurrentHour ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}>
                {/* Time Label */}
                <div className="flex-shrink-0 p-2 text-xs font-medium text-gray-600 border-r bg-gray-50 flex items-center justify-center">
                  {displayTime}
                </div>
                
                {/* Day Columns */}
                {weekDays.map(day => {
                  const slotEvents = getEventsForTimeSlot(hour, day)
                  const slotBookings = getBookingsForTimeSlot(hour, day)
                  const hasActivity = slotEvents.length > 0 || slotBookings.length > 0
                  const isDayToday = isToday(day)
                  const isCurrentSlot = isDayToday && isCurrentHour
                  
                  return (
                    <div 
                      key={`${day.toISOString()}-${time}`}
                      className={`p-1 min-h-[50px] border-r last:border-r-0 cursor-pointer transition-colors ${
                        isCurrentSlot ? 'bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setCurrentDate(day)
                        setViewMode('day')
                      }}
                    >
                      {hasActivity ? (
                        <div className="space-y-1">
                          {/* Events */}
                          {slotEvents.map(event => (
                            <EventBadge key={event.id} event={event} size="sm" />
                          ))}
                          {/* Bookings */}
                          {slotBookings.map(booking => (
                            <BookingBadge key={booking.id} booking={booking} size="sm" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {isCurrentSlot && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        
        {/* Week Summary */}
        <div className="grid grid-cols-7 gap-2 pt-4">
          {weekDays.map(day => {
            const dayEvents = getEventsForDay(day)
            const dayBookings = getBookingsForDay(day)
            
            return (
              <Card key={day.toISOString()} className="p-2">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {format(day, 'MMM d')}
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    <div className="text-blue-600">
                      {dayEvents.length} events
                    </div>
                    <div className="text-green-600">
                      {dayBookings.length} bookings
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)

          return (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border border-gray-100 
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}
                hover:bg-gray-50 transition-colors cursor-pointer
              `}
              onClick={() => {
                setCurrentDate(day)
                setViewMode('day')
              }}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span 
                  className={`
                    text-sm font-medium
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isDayToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Event Count Badge */}
                {dayEvents.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    +{dayEvents.length - 3}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <EventBadge key={event.id} event={event} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {getViewTitle()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex rounded-md border mr-4">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="rounded-r-none"
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="rounded-none"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="rounded-l-none"
              >
                Month
              </Button>
            </div>
            
            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="min-h-[400px]">
          {viewMode === 'day' && <DayView />}
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'month' && <MonthView />}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-700">Event Types:</span>
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { type: 'tournament', label: 'Tournament' },
                { type: 'social', label: 'Social' },
                { type: 'training', label: 'Training' },
                { type: 'maintenance', label: 'Maintenance' },
                { type: 'meeting', label: 'Meeting' }
              ].map(({ type, label }) => {
                const TypeIcon = getEventTypeIcon(type as Event['type'])
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getEventTypeColor(type as Event['type'])}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventsCalendar
