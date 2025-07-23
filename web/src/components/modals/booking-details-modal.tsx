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
  User,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'

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

interface BookingDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onEdit: (booking: Booking) => void
  onDelete: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
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

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  open,
  onOpenChange,
  booking,
  onEdit,
  onDelete,
  onCancel
}) => {
  if (!booking) return null

  const canEdit = booking.createdBy === 'club' || booking.type === 'member'
  const canCancel = booking.status === 'confirmed' && new Date(booking.date) > new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {booking.title}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getBookingTypeColor(booking.type)}>
                {booking.type.replace('_', ' ')}
              </Badge>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Date:</span>
                <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Time:</span>
                <span>{booking.startTime} - {booking.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Court:</span>
                <span>{booking.courtName}</span>
              </div>
            </div>

            <div className="space-y-3">
              {booking.memberName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Member:</span>
                  <span>{booking.memberName}</span>
                </div>
              )}

              {booking.participants !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Participants:</span>
                  <span>{booking.participants}/{booking.maxParticipants || '∞'}</span>
                </div>
              )}

              {booking.cost !== undefined && booking.cost > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Cost:</span>
                  <span>${booking.cost}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {booking.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">Description</span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {booking.description}
              </p>
            </div>
          )}

          {/* Contact Information (for member bookings) */}
          {booking.memberEmail && (
            <div>
              <h4 className="font-medium text-sm mb-2">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{booking.memberEmail}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div>
            <h4 className="font-medium text-sm mb-2">Booking Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created by:</span>
                <span className="ml-2 capitalize">{booking.createdBy}</span>
              </div>
              <div>
                <span className="text-gray-500">Booking ID:</span>
                <span className="ml-2 font-mono">{booking.id}</span>
              </div>
            </div>
          </div>

          {/* Special Notices */}
          {booking.isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-800">
                <span className="font-medium">Court Blocked</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This booking blocks member reservations during the specified time.
              </p>
            </div>
          )}

          {booking.type === 'maintenance' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="font-medium">Maintenance Scheduled</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                The court will be unavailable for member use during this maintenance window.
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(booking)
                  onOpenChange(false)
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </Button>
            )}

            {canCancel && onCancel && (
              <Button
                variant="outline"
                onClick={() => {
                  onCancel(booking.id)
                  onOpenChange(false)
                }}
                className="flex items-center gap-2"
              >
                Cancel Booking
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this booking?')) {
                  onDelete(booking.id)
                  onOpenChange(false)
                }
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BookingDetailsModal
