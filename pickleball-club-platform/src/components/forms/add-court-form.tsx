'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

const courtSchema = z.object({
  name: z.string().min(1, 'Court name is required'),
  type: z.enum(['Indoor', 'Outdoor']),
  surface: z.enum(['Concrete', 'Asphalt', 'Synthetic', 'Sport Court']),
  status: z.enum(['active', 'maintenance', 'inactive', 'unavailable']),
  description: z.string().optional(),
  hourlyRate: z.number().min(0, 'Rate must be positive'),
  dimensions: z.object({
    length: z.number().min(1, 'Length is required'),
    width: z.number().min(1, 'Width is required'),
  }),
  lighting: z.boolean(),
  airConditioning: z.boolean(),
  accessibility: z.boolean(),
  notes: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
})

type CourtFormData = z.infer<typeof courtSchema>

interface AddCourtFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CourtFormData) => void
}

const availableAmenities = [
  'Lighting',
  'AC',
  'Sound System',
  'Wheelchair Accessible',
  'Premium Surface',
  'Spectator Seating',
  'Equipment Storage',
  'Water Fountain',
  'Restrooms Nearby',
  'Parking Available'
]

export default function AddCourtForm({ open, onOpenChange, onSubmit }: AddCourtFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      status: 'active',
      type: 'Indoor',
      surface: 'Concrete',
      dimensions: { length: 44, width: 20 },
      lighting: false,
      airConditioning: false,
      accessibility: false,
      hourlyRate: 25,
      amenities: [],
    },
  })

  const selectedType = watch('type')
  const selectedStatus = watch('status')

  const handleFormSubmit = async (data: CourtFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const courtData = {
        ...data,
        amenities: selectedAmenities,
      }
      await onSubmit(courtData)
      reset()
      setSelectedAmenities([])
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the court')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setSelectedAmenities([])
    setError('')
    onOpenChange(false)
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Court</DialogTitle>
          <DialogDescription>
            Create a new court for your pickleball club.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Court Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Court A"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select court type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indoor">Indoor</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Surface and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surface">Surface *</Label>
              <Select
                value={watch('surface')}
                onValueChange={(value) => setValue('surface', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select surface type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Concrete">Concrete</SelectItem>
                  <SelectItem value="Asphalt">Asphalt</SelectItem>
                  <SelectItem value="Synthetic">Synthetic</SelectItem>
                  <SelectItem value="Sport Court">Sport Court</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensions and Rate */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (ft) *</Label>
              <Input
                id="length"
                type="number"
                {...register('dimensions.length', { valueAsNumber: true })}
                placeholder="44"
              />
              {errors.dimensions?.length && (
                <p className="text-sm text-red-600">{errors.dimensions.length.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (ft) *</Label>
              <Input
                id="width"
                type="number"
                {...register('dimensions.width', { valueAsNumber: true })}
                placeholder="20"
              />
              {errors.dimensions?.width && (
                <p className="text-sm text-red-600">{errors.dimensions.width.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                {...register('hourlyRate', { valueAsNumber: true })}
                placeholder="25.00"
              />
              {errors.hourlyRate && (
                <p className="text-sm text-red-600">{errors.hourlyRate.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the court"
              rows={2}
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Features</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lighting"
                  checked={watch('lighting')}
                  onCheckedChange={(checked) => setValue('lighting', !!checked)}
                />
                <Label htmlFor="lighting" className="text-sm">Lighting</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="airConditioning"
                  checked={watch('airConditioning')}
                  onCheckedChange={(checked) => setValue('airConditioning', !!checked)}
                />
                <Label htmlFor="airConditioning" className="text-sm">
                  {selectedType === 'Indoor' ? 'Air Conditioning' : 'Climate Control'}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={watch('accessibility')}
                  onCheckedChange={(checked) => setValue('accessibility', !!checked)}
                />
                <Label htmlFor="accessibility" className="text-sm">Wheelchair Accessible</Label>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Additional Amenities</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
            {selectedAmenities.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedAmenities.join(', ')}
              </p>
            )}
          </div>

          {/* Maintenance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastMaintenance">Last Maintenance</Label>
              <Input
                id="lastMaintenance"
                type="date"
                {...register('lastMaintenance')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextMaintenance">Next Maintenance</Label>
              <Input
                id="nextMaintenance"
                type="date"
                {...register('nextMaintenance')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional notes about the court"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding Court...' : 'Add Court'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
