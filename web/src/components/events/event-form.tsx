'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Trophy,
  Coffee,
  GraduationCap,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import type { Event } from '@/app/events/page'

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Event description is required'),
  type: z.enum(['tournament', 'social', 'training', 'maintenance', 'meeting'], {
    required_error: 'Event type is required',
  }),
  category: z.string().min(1, 'Category is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  courtIds: z.array(z.string()).min(1, 'At least one court must be selected'),
  maxParticipants: z.number().min(1).optional(),
  registrationDeadline: z.string().optional(),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  status: z.enum(['draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled']),
  skillLevel: z.enum(['all', 'beginner', 'intermediate', 'advanced', 'open']),
  organizer: z.string().min(1, 'Organizer is required'),
  contact: z.object({
    name: z.string().min(1, 'Contact name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
  }),
  prizes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  rules: z.string().optional(),
  notes: z.string().optional(),
})

interface EventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (eventData: any) => void
  event?: Event | null
}

const eventTypes = [
  { value: 'tournament', label: 'Tournament', icon: Trophy, description: 'Competitive events and tournaments' },
  { value: 'social', label: 'Social Event', icon: Coffee, description: 'Social gatherings and mixers' },
  { value: 'training', label: 'Training/Clinic', icon: GraduationCap, description: 'Skills training and clinics' },
  { value: 'maintenance', label: 'Maintenance', icon: Settings, description: 'Court maintenance and facility work' },
  { value: 'meeting', label: 'Meeting', icon: Users, description: 'Club meetings and announcements' },
]

const skillLevels = [
  { value: 'all', label: 'All Levels', description: 'Open to all skill levels' },
  { value: 'beginner', label: 'Beginner', description: '1.0 - 2.5 skill level' },
  { value: 'intermediate', label: 'Intermediate', description: '3.0 - 3.5 skill level' },
  { value: 'advanced', label: 'Advanced', description: '4.0+ skill level' },
  { value: 'open', label: 'Open', description: 'No skill level restrictions' },
]

const eventStatuses = [
  { value: 'draft', label: 'Draft', description: 'Event is being prepared' },
  { value: 'published', label: 'Published', description: 'Event is visible but registration not open' },
  { value: 'registration_open', label: 'Registration Open', description: 'Accepting registrations' },
  { value: 'registration_closed', label: 'Registration Closed', description: 'No longer accepting registrations' },
  { value: 'in_progress', label: 'In Progress', description: 'Event is currently happening' },
  { value: 'completed', label: 'Completed', description: 'Event has finished' },
  { value: 'cancelled', label: 'Cancelled', description: 'Event has been cancelled' },
]

// Mock courts data - in a real app, this would come from a service
const mockCourts = [
  { id: '1', name: 'Court A', type: 'Indoor' },
  { id: '2', name: 'Court B', type: 'Indoor' },
  { id: '3', name: 'Court C', type: 'Outdoor' },
  { id: '4', name: 'Court D', type: 'Outdoor' },
]

const EventForm: React.FC<EventFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  event,
}) => {
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [isMultiDay, setIsMultiDay] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'tournament',
      category: '',
      status: 'draft',
      skillLevel: 'all',
      cost: 0,
      courtIds: [],
      contact: {
        name: '',
        email: '',
        phone: '',
      },
      prizes: [],
      requirements: [],
      equipment: [],
    }
  })

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes'
  })

  const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
    control,
    name: 'requirements'
  })

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control,
    name: 'equipment'
  })

  const watchedType = watch('type')
  const watchedStatus = watch('status')

  useEffect(() => {
    if (event) {
      // Populate form with event data
      Object.keys(event).forEach(key => {
        if (key === 'courtIds') {
          setSelectedCourts(event[key] || [])
          setValue(key as any, event[key])
        } else if (key === 'endDate') {
          setIsMultiDay(!!event[key])
          setValue(key as any, event[key] || '')
        } else if (['prizes', 'requirements', 'equipment'].includes(key)) {
          setValue(key as any, event[key] || [])
        } else {
          setValue(key as any, event[key])
        }
      })
    } else {
      // Reset form for new event
      reset()
      setSelectedCourts([])
      setIsMultiDay(false)
    }
  }, [event, setValue, reset])

  const handleCourtToggle = (courtId: string) => {
    const newSelected = selectedCourts.includes(courtId)
      ? selectedCourts.filter(id => id !== courtId)
      : [...selectedCourts, courtId]
    
    setSelectedCourts(newSelected)
    setValue('courtIds', newSelected)
  }

  const onFormSubmit = async (data: any) => {
    try {
      const eventData = {
        ...data,
        courtIds: selectedCourts,
        endDate: isMultiDay ? data.endDate : undefined,
        prizes: data.prizes || [],
        requirements: data.requirements || [],
        equipment: data.equipment || [],
      }

      await onSubmit(eventData)
      reset()
      setSelectedCourts([])
      setIsMultiDay(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting event:', error)
    }
  }

  // Generate time options (6 AM to 11 PM in 30-minute intervals)
  const timeOptions = Array.from({ length: 34 }, (_, i) => {
    const hour = Math.floor(6 + i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    const time24 = `${hour.toString().padStart(2, '0')}:${minute}`
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    const time12 = `${hour12}:${minute} ${period}`
    return { value: time24, label: time12 }
  })

  const selectedEventType = eventTypes.find(type => type.value === watchedType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter event title..."
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="e.g., Competition, Social, Education..."
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level *</Label>
                <Select onValueChange={(value) => setValue('skillLevel', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.skillLevel && (
                  <p className="text-sm text-red-600">{errors.skillLevel.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Event Status *</Label>
                <Select onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div>
                          <div className="font-medium">{status.label}</div>
                          <div className="text-xs text-gray-500">{status.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer *</Label>
                <Input
                  id="organizer"
                  {...register('organizer')}
                  placeholder="e.g., Tournament Committee, Social Committee..."
                />
                {errors.organizer && (
                  <p className="text-sm text-red-600">{errors.organizer.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    {...register('maxParticipants', { valueAsNumber: true })}
                    placeholder="No limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    {...register('cost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the event, what to expect, who should attend..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMultiDay"
                checked={isMultiDay}
                onCheckedChange={(checked) => setIsMultiDay(checked as boolean)}
              />
              <Label htmlFor="isMultiDay">Multi-day event</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              {isMultiDay && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Select onValueChange={(value) => setValue('startTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startTime && (
                  <p className="text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Select onValueChange={(value) => setValue('endTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.endTime && (
                  <p className="text-sm text-red-600">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location and Courts */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g., Court A, Clubhouse, All Courts..."
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Courts *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-md">
                {mockCourts.map((court) => (
                  <div key={court.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`court-${court.id}`}
                      checked={selectedCourts.includes(court.id)}
                      onCheckedChange={() => handleCourtToggle(court.id)}
                    />
                    <Label htmlFor={`court-${court.id}`} className="text-sm">
                      {court.name} ({court.type})
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCourts.length === 0 && (
                <p className="text-sm text-red-600">At least one court must be selected</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  {...register('contact.name')}
                  placeholder="Contact person"
                />
                {errors.contact?.name && (
                  <p className="text-sm text-red-600">{errors.contact.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contact.email')}
                  placeholder="contact@example.com"
                />
                {errors.contact?.email && (
                  <p className="text-sm text-red-600">{errors.contact.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  {...register('contact.phone')}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventForm
