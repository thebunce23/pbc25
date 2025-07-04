'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarDays, Clock, MapPin, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

const clubEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  type: z.enum(['club_event', 'social', 'tournament', 'maintenance'], {
    required_error: 'Event type is required',
  }),
  courtIds: z.array(z.string()).min(1, 'At least one court must be selected'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  description: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  cost: z.number().min(0).optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  recurringEndDate: z.string().optional(),
  blockBookings: z.boolean().default(true),
  allowMemberBookings: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
})

interface Court {
  id: string
  name: string
  type: string
  status: string
}

interface ClubEventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (eventData: any) => void
  courts: Court[]
  editEvent?: any
}

const eventTypeLabels = {
  club_event: 'Club Event',
  social: 'Social Activity',
  tournament: 'Tournament',
  maintenance: 'Maintenance'
}

const eventTypeDescriptions = {
  club_event: 'Official club events like meetings, training sessions, or competitions',
  social: 'Social gatherings, mixers, BBQs, and informal activities',
  tournament: 'Organized tournaments and competitive events',
  maintenance: 'Court maintenance, repairs, or facility work'
}

const ClubEventForm: React.FC<ClubEventFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  courts,
  editEvent,
}) => {
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [isRecurring, setIsRecurring] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(clubEventSchema),
    defaultValues: {
      type: 'club_event',
      blockBookings: true,
      allowMemberBookings: false,
      requireApproval: false,
      isRecurring: false,
      cost: 0,
    }
  })

  const watchedType = watch('type')
  const watchedIsRecurring = watch('isRecurring')

  React.useEffect(() => {
    if (editEvent) {
      // Populate form with edit data
      Object.keys(editEvent).forEach(key => {
        setValue(key as any, editEvent[key])
      })
      setSelectedCourts(editEvent.courtIds || [])
      setIsRecurring(editEvent.isRecurring || false)
    }
  }, [editEvent, setValue])

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
        isRecurring,
        id: editEvent?.id || Math.random().toString(36).substr(2, 9),
        status: 'confirmed',
        createdBy: 'club',
      }

      // If it's a recurring event, generate multiple bookings
      if (isRecurring && data.recurringPattern && data.recurringEndDate) {
        // This would generate multiple events based on the pattern
        eventData.isRecurring = true
      }

      await onSubmit(eventData)
      reset()
      setSelectedCourts([])
      setIsRecurring(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating event:', error)
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

  // Show all courts except those that are permanently unavailable
  // For club events, we can schedule maintenance or use courts under maintenance
  const availableCourts = courts.filter(court => court.status !== 'inactive')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {editEvent ? 'Edit Event' : 'Create Club Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Event Title */}
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

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Event Type *</Label>
            <Select onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">
                        {eventTypeDescriptions[value as keyof typeof eventTypeDescriptions]}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Court Selection */}
          <div className="space-y-2">
            <Label>Select Courts *</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border rounded-md">
              {availableCourts.map((court) => (
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

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter event description..."
              rows={3}
            />
          </div>

          {/* Event Settings */}
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

          {/* Recurring Event */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => {
                  setIsRecurring(checked as boolean)
                  setValue('isRecurring', checked as boolean)
                }}
              />
              <Label htmlFor="isRecurring">Recurring Event</Label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurringPattern">Repeat Pattern</Label>
                  <Select onValueChange={(value) => setValue('recurringPattern', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringEndDate">End Date</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    {...register('recurringEndDate')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Booking Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Booking Options</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blockBookings"
                {...register('blockBookings')}
                defaultChecked={true}
              />
              <Label htmlFor="blockBookings" className="text-sm">
                Block member bookings during this time
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowMemberBookings"
                {...register('allowMemberBookings')}
              />
              <Label htmlFor="allowMemberBookings" className="text-sm">
                Allow members to book remaining spots
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireApproval"
                {...register('requireApproval')}
              />
              <Label htmlFor="requireApproval" className="text-sm">
                Require club approval for participation
              </Label>
            </div>
          </div>

          {/* Warning for Maintenance */}
          {watchedType === 'maintenance' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maintenance events will automatically block all member bookings and mark the courts as unavailable.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : editEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ClubEventForm
