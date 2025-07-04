'use client'

import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EventFormData {
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
}

interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => void
  initialData?: Partial<EventFormData>
  mode: 'create' | 'edit'
}

export default function EventForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {},
  mode = 'create' 
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    eventDate: initialData.eventDate || '',
    startTime: initialData.startTime || '',
    endTime: initialData.endTime || '',
    location: initialData.location || '',
    maxParticipants: initialData.maxParticipants || 20,
    registrationDeadline: initialData.registrationDeadline || '',
    entryFee: initialData.entryFee || 0,
    eventType: initialData.eventType || 'tournament'
  })

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})

  const handleChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Must allow at least 1 participant'
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required'
    }

    if (formData.registrationDeadline && formData.eventDate && 
        formData.registrationDeadline > formData.eventDate) {
      newErrors.registrationDeadline = 'Registration deadline must be before event date'
    }

    if (formData.entryFee < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 20,
        registrationDeadline: '',
        entryFee: 0,
        eventType: 'tournament'
      })
      setErrors({})
    }
  }

  const handleClose = () => {
    onClose()
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill out the details below to create a new club event.'
              : 'Update the event details below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Event Information</h3>
            
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the event..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => handleChange('eventType', value as EventFormData['eventType'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="clinic">Clinic/Workshop</SelectItem>
                  <SelectItem value="social">Social Event</SelectItem>
                  <SelectItem value="league">League Play</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className={errors.eventDate ? 'border-red-500' : ''}
                />
                {errors.eventDate && <p className="text-sm text-red-500 mt-1">{errors.eventDate}</p>}
              </div>

              <div>
                <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  className={errors.registrationDeadline ? 'border-red-500' : ''}
                />
                {errors.registrationDeadline && <p className="text-sm text-red-500 mt-1">{errors.registrationDeadline}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* Location and Logistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Logistics</h3>
            
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Court A, Main Courts, Clubhouse"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Max Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value) || 0)}
                  className={errors.maxParticipants ? 'border-red-500' : ''}
                />
                {errors.maxParticipants && <p className="text-sm text-red-500 mt-1">{errors.maxParticipants}</p>}
              </div>

              <div>
                <Label htmlFor="entryFee">Entry Fee ($)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entryFee}
                  onChange={(e) => handleChange('entryFee', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.entryFee ? 'border-red-500' : ''}
                />
                {errors.entryFee && <p className="text-sm text-red-500 mt-1">{errors.entryFee}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Event' : 'Update Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
