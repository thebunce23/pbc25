'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useClubSettings } from '@/contexts/club-settings-context'
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

const playerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  skillLevel: z.number().min(1).max(5).optional(),
  membershipStatus: z.enum(['active', 'inactive', 'trial', 'suspended']),
  membershipType: z.enum(['Regular', 'Premium', 'Trial', 'Social']),
  healthConditions: z.string().optional(),
  waiverSigned: z.boolean(),
})

type PlayerFormData = z.infer<typeof playerSchema>

interface Player {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  skill_level: string
  status: string
  membership_type?: string
  waiverSigned?: boolean
  join_date: string
  matchesPlayed?: number
  winRate?: number
  address?: any
  emergency_contact?: any
  medical_info?: string
  notes?: string
}

interface EditPlayerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PlayerFormData) => void
  player: Player | null
}

export default function EditPlayerForm({ open, onOpenChange, onSubmit, player }: EditPlayerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { getCountryPhonePrefix, getAddressLabels, formatPhoneNumber } = useClubSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      membershipStatus: 'active',
      membershipType: 'Regular',
      address: {},
      waiverSigned: false,
    },
  })

  const membershipStatus = watch('membershipStatus')
  const membershipType = watch('membershipType')
  const waiverSigned = watch('waiverSigned')

  // Reset form when player changes
  useEffect(() => {
    if (player) {
      setValue('firstName', player.first_name)
      setValue('lastName', player.last_name)
      setValue('email', player.email || '')
      setValue('phone', player.phone || '')
      setValue('address', player.address || {})
      // Extract emergency contact from database object
      const emergencyContact = player.emergency_contact || {}
      setValue('emergencyContactName', emergencyContact.name || '')
      setValue('emergencyContactPhone', emergencyContact.phone || '')
      // Convert skill level string to number for form
      const skillLevelMap: { [key: string]: number } = {
        'Beginner': 1,
        'Intermediate': 2, 
        'Advanced': 3,
        'Professional': 4
      }
      setValue('skillLevel', skillLevelMap[player.skill_level] || 1)
      setValue('membershipStatus', player.status as any)
      setValue('membershipType', player.membership_type as any)
      setValue('healthConditions', player.medical_info || '')
      setValue('waiverSigned', player.waiverSigned || false)
    }
  }, [player, setValue])

  const handleFormSubmit = async (data: PlayerFormData) => {
    setIsLoading(true)
    setError('')

    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the player')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setError('')
    onOpenChange(false)
  }

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Update {player.first_name} {player.last_name}'s information.
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
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  {getCountryPhonePrefix()}
                </div>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="rounded-l-none"
                  placeholder="123-456-7890"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Format: {formatPhoneNumber('123-456-7890')}
              </p>
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <Label className="text-base font-medium">Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {getAddressLabels().map(({ field, label }) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm text-muted-foreground">{label}</Label>
                  <Input
                    id={field}
                    {...register(`address.${field}` as any)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                {...register('emergencyContactPhone')}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          {/* Skill Level and Membership */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select onValueChange={(value) => setValue('skillLevel', parseFloat(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">1.0 - Beginner</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2.0">2.0 - Novice</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="3.0">3.0 - Intermediate</SelectItem>
                  <SelectItem value="3.5">3.5</SelectItem>
                  <SelectItem value="4.0">4.0 - Advanced</SelectItem>
                  <SelectItem value="4.5">4.5</SelectItem>
                  <SelectItem value="5.0">5.0 - Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipStatus">Membership Status</Label>
              <Select
                value={membershipStatus}
                onValueChange={(value) => setValue('membershipStatus', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipType">Membership Type</Label>
              <Select
                value={membershipType}
                onValueChange={(value) => setValue('membershipType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Waiver and Health */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="waiverSigned"
                type="checkbox"
                checked={waiverSigned}
                onChange={(e) => setValue('waiverSigned', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="waiverSigned">Waiver Signed</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthConditions">Health Conditions (Optional)</Label>
              <Textarea
                id="healthConditions"
                {...register('healthConditions')}
                placeholder="Any health conditions or notes"
                rows={3}
              />
            </div>
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
              {isLoading ? 'Updating Player...' : 'Update Player'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
