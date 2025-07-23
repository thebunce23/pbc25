'use client'

import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Calendar, Target, Shield, Users } from 'lucide-react'

export interface FilterCriteria {
  skillLevelMin?: number
  skillLevelMax?: number
  membershipStatus?: string
  waiverSigned?: boolean
  joinDateFrom?: string
  joinDateTo?: string
  matchesPlayedMin?: number
  winRateMin?: number
  winRateMax?: number
}

interface AdvancedFiltersProps {
  filters: FilterCriteria
  onFiltersChange: (filters: FilterCriteria) => void
  onClearFilters: () => void
}

export default function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters)

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onClearFilters()
    setOpen(false)
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }

  const getActiveFilterLabels = () => {
    const labels = []
    if (filters.skillLevelMin || filters.skillLevelMax) {
      labels.push(`Skill: ${filters.skillLevelMin || 0}-${filters.skillLevelMax || 5}`)
    }
    if (filters.membershipStatus) {
      labels.push(`Status: ${filters.membershipStatus}`)
    }
    if (filters.waiverSigned !== undefined) {
      labels.push(`Waiver: ${filters.waiverSigned ? 'Signed' : 'Not Signed'}`)
    }
    if (filters.joinDateFrom || filters.joinDateTo) {
      labels.push('Date Range')
    }
    if (filters.matchesPlayedMin) {
      labels.push(`Min Matches: ${filters.matchesPlayedMin}`)
    }
    if (filters.winRateMin || filters.winRateMax) {
      labels.push(`Win Rate: ${filters.winRateMin || 0}%-${filters.winRateMax || 100}%`)
    }
    return labels
  }

  const activeFilterCount = getActiveFilterCount()
  const activeFilterLabels = getActiveFilterLabels()

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Narrow down your player search with specific criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Skill Level Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Skill Level Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="skillMin" className="text-xs text-muted-foreground">Minimum</Label>
                  <Select
                    value={localFilters.skillLevelMin?.toString() || ''}
                    onValueChange={(value) => updateFilter('skillLevelMin', value ? parseFloat(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2.0">2.0</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3.0">3.0</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="4.0">4.0</SelectItem>
                      <SelectItem value="4.5">4.5</SelectItem>
                      <SelectItem value="5.0">5.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="skillMax" className="text-xs text-muted-foreground">Maximum</Label>
                  <Select
                    value={localFilters.skillLevelMax?.toString() || ''}
                    onValueChange={(value) => updateFilter('skillLevelMax', value ? parseFloat(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2.0">2.0</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3.0">3.0</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="4.0">4.0</SelectItem>
                      <SelectItem value="4.5">4.5</SelectItem>
                      <SelectItem value="5.0">5.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Membership Status */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membership Status
              </Label>
              <Select
                value={localFilters.membershipStatus || ''}
                onValueChange={(value) => updateFilter('membershipStatus', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Waiver Status */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Waiver Status
              </Label>
              <Select
                value={localFilters.waiverSigned === undefined ? '' : localFilters.waiverSigned.toString()}
                onValueChange={(value) => updateFilter('waiverSigned', value === '' ? undefined : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any waiver status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any waiver status</SelectItem>
                  <SelectItem value="true">Waiver Signed</SelectItem>
                  <SelectItem value="false">Waiver Not Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Join Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Join Date Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={localFilters.joinDateFrom || ''}
                    onChange={(e) => updateFilter('joinDateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-xs text-muted-foreground">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={localFilters.joinDateTo || ''}
                    onChange={(e) => updateFilter('joinDateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Performance Metrics</Label>
              
              <div>
                <Label htmlFor="minMatches" className="text-sm">Minimum Matches Played</Label>
                <Input
                  id="minMatches"
                  type="number"
                  min="0"
                  value={localFilters.matchesPlayedMin || ''}
                  onChange={(e) => updateFilter('matchesPlayedMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="winRateMin" className="text-xs text-muted-foreground">Min Win Rate (%)</Label>
                  <Input
                    id="winRateMin"
                    type="number"
                    min="0"
                    max="100"
                    value={localFilters.winRateMin || ''}
                    onChange={(e) => updateFilter('winRateMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="winRateMax" className="text-xs text-muted-foreground">Max Win Rate (%)</Label>
                  <Input
                    id="winRateMax"
                    type="number"
                    min="0"
                    max="100"
                    value={localFilters.winRateMax || ''}
                    onChange={(e) => updateFilter('winRateMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Filters Display */}
      {activeFilterLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterLabels.map((label, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
