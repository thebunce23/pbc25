'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Trophy,
  Coffee,
  GraduationCap,
  Settings,
  Mail,
  Phone,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Award
} from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import type { Event } from '@/app/events/page'

interface EventDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
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

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete
}) => {
  if (!event) return null

  const TypeIcon = getEventTypeIcon(event.type)
  const isUpcoming = isAfter(parseISO(event.startDate), new Date())
  const isPast = isBefore(parseISO(event.startDate), new Date())
  const registrationFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants
  const hasWaitlist = event.waitlist && event.waitlist.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <TypeIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{event.title}</h2>
                <p className="text-sm text-gray-600">{event.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-gray-600">
                    {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                    {event.endDate && ` - ${format(parseISO(event.endDate), 'MMMM d, yyyy')}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-gray-600">{event.startTime} - {event.endTime}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-gray-600">{event.location}</div>
                </div>
              </div>

              {event.cost > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Cost</div>
                    <div className="text-gray-600">${event.cost}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Organizer</div>
                  <div className="text-gray-600">{event.organizer}</div>
                </div>
              </div>

              {event.maxParticipants && (
                <div className="flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className={`text-gray-600 ${registrationFull ? 'text-red-600 font-medium' : ''}`}>
                      {event.currentParticipants}/{event.maxParticipants}
                      {registrationFull && ' (Full)'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {event.registrationDeadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Registration Deadline</div>
                    <div className="text-gray-600">
                      {format(parseISO(event.registrationDeadline), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Progress */}
          {event.maxParticipants && event.type !== 'maintenance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Registration Status</h3>
                <span className={`text-sm ${registrationFull ? 'text-red-600' : 'text-green-600'}`}>
                  {event.currentParticipants}/{event.maxParticipants} registered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    registrationFull ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              {hasWaitlist && (
                <p className="text-sm text-orange-600">
                  {event.waitlist.length} people on waitlist
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Contact Person</div>
                  <div className="text-gray-600">{event.contact.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-gray-600">{event.contact.email}</div>
                </div>
              </div>

              {event.contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-gray-600">{event.contact.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tournament Details */}
          {event.type === 'tournament' && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tournament Details
                </h3>
                
                {event.prizes && event.prizes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Prizes
                    </h4>
                    <div className="space-y-1">
                      {event.prizes.map((prize, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{prize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.rules && (
                  <div>
                    <h4 className="font-medium mb-2">Rules & Format</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {event.rules}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Requirements & Equipment */}
          {((event.requirements && event.requirements.length > 0) || (event.equipment && event.equipment.length > 0)) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Requirements
                    </h4>
                    <div className="space-y-2">
                      {event.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.equipment && event.equipment.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Equipment & Amenities</h4>
                    <div className="space-y-2">
                      {event.equipment.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Additional Notes */}
          {event.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Additional Notes
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {event.notes}
                </p>
              </div>
            </>
          )}

          {/* Event Status Indicators */}
          {event.type === 'maintenance' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Court Maintenance</span>
              </div>
              <p className="text-sm text-red-700">
                The selected courts will be unavailable during this maintenance window. All member bookings will be blocked.
              </p>
            </div>
          )}

          {event.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Event Cancelled</span>
              </div>
              <p className="text-sm text-red-700">
                This event has been cancelled. Registered participants have been notified.
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {isUpcoming && event.status === 'registration_open' && !registrationFull && (
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register for Event
                </Button>
              )}
              {isUpcoming && event.status === 'registration_open' && registrationFull && (
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(event)
                  onOpenChange(false)
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this event?')) {
                    onDelete(event.id)
                    onOpenChange(false)
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>

          {/* Meta Information */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Created: {format(parseISO(event.createdAt), 'MMM d, yyyy')}</span>
              <span>Last updated: {format(parseISO(event.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventDetailsModal
