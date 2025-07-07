'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Users,
  TrendingUp,
  Star,
  Wrench
} from 'lucide-react'

export interface Court {
  id: string
  name: string
  type: string
  surface: string
  status: 'available' | 'occupied' | 'maintenance'
  description?: string
  dimensions?: string
  lighting: boolean
  covered: boolean
  amenities: string[]
  maintenanceSchedule?: string
  bookings?: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  rating?: number
  lastMaintenance?: string
  nextMaintenance?: string
}

interface CourtProfileViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  court: Court | null
  onEdit: (court: Court) => void
  onDelete: (courtId: string) => void
}

const CourtProfileView: React.FC<CourtProfileViewProps> = ({
  open,
  onOpenChange,
  court,
  onEdit,
  onDelete,
}) => {
  if (!court) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] max-w-[95vw] max-h-[85vh] top-[7.5vh] translate-y-0 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {court.name}
            </span>
            <Badge className={getStatusColor(court.status)}>
              {court.status.charAt(0).toUpperCase() + court.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
          {/* Court Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <p className="text-sm">{court.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Surface</h3>
              <p className="text-sm">{court.surface}</p>
            </div>
            {court.dimensions && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Dimensions</h3>
                <p className="text-sm">{court.dimensions}</p>
              </div>
            )}
            {court.rating && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{court.rating}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Features</h3>
            <div className="flex flex-wrap gap-2">
              {court.lighting && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Lighting
                </Badge>
              )}
              {court.covered && (
                <Badge variant="secondary" className="text-xs">
                  Covered
                </Badge>
              )}
            </div>
          </div>

          {/* Amenities */}
          {court.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {court.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {court.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-sm text-gray-700">{court.description}</p>
            </div>
          )}

          <Separator />

          {/* Booking Statistics */}
          {court.bookings && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Booking Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{court.bookings.today}</div>
                  <div className="text-xs text-blue-600">Today</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{court.bookings.thisWeek}</div>
                  <div className="text-xs text-green-600">This Week</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{court.bookings.thisMonth}</div>
                  <div className="text-xs text-purple-600">This Month</div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Info */}
          {(court.lastMaintenance || court.nextMaintenance || court.maintenanceSchedule) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Maintenance
              </h3>
              <div className="space-y-2">
                {court.lastMaintenance && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Last Maintenance:</span>
                    <span>{court.lastMaintenance}</span>
                  </div>
                )}
                {court.nextMaintenance && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Next Maintenance:</span>
                    <span>{court.nextMaintenance}</span>
                  </div>
                )}
                {court.maintenanceSchedule && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Schedule:</span>
                    <span>{court.maintenanceSchedule}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onEdit(court)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Court
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(court.id)
                onOpenChange(false)
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Court
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CourtProfileView
