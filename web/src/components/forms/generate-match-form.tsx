'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { matchService, type CreateMatchData } from '@/lib/services/match-service'
import courtService, { type Court } from '@/lib/services/court-service'
import { playerService, type Player } from '@/lib/services/player-service'

interface GenerateMatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (match: any) => void
}

export default function GenerateMatchForm({ open, onOpenChange, onSubmit }: GenerateMatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [courts, setCourts] = useState<Court[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateMatchData>({
    title: '',
    match_type: 'Doubles',
    skill_level: 'Mixed',
    court_id: '',
    date: '',
    time: '',
    duration_minutes: 90,
    max_players: 4,
    description: '',
    notes: ''
  })

  // Load courts and players when dialog opens
  useEffect(() => {
    if (open) {
      loadCourts()
      loadPlayers()
      // Set default date to today
      const today = new Date().toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, date: today }))
    }
  }, [open])

  const loadCourts = async () => {
    try {
      const courtsData = await courtService.getAllCourts()
      setCourts(courtsData)
    } catch (error) {
      console.error('Failed to load courts:', error)
    }
  }

  const loadPlayers = async () => {
    try {
      const playersData = await playerService.getPlayers({ status: 'active' })
      setPlayers(playersData)
    } catch (error) {
      console.error('Failed to load players:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields')
      return
    }

    if (selectedPlayers.length === 0) {
      alert('Please select at least one player for the match')
      return
    }

    if (selectedPlayers.length < formData.max_players) {
      const confirm = window.confirm(
        `You've selected ${selectedPlayers.length} players but the match allows up to ${formData.max_players}. Do you want to continue?`
      )
      if (!confirm) return
    }

    try {
      setLoading(true)
      
      // Add selected players to the match data
      const matchData = {
        ...formData,
        participants: selectedPlayers.map(playerId => ({ player_id: playerId }))
      }
      
      const newMatch = await matchService.createMatch(matchData)
      onSubmit(newMatch)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('Failed to create match. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      match_type: 'Doubles',
      skill_level: 'Mixed',
      court_id: '',
      date: '',
      time: '',
      duration_minutes: 90,
      max_players: 4,
      description: '',
      notes: ''
    })
    setSelectedPlayers([])
  }

  const handleInputChange = (field: keyof CreateMatchData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Update max players based on match type
  useEffect(() => {
    if (formData.match_type === 'Singles') {
      setFormData(prev => ({ ...prev, max_players: 2 }))
    } else {
      setFormData(prev => ({ ...prev, max_players: 4 }))
    }
  }, [formData.match_type])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate New Match</DialogTitle>
          <DialogDescription>
            Create a new match for players to join
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Match Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Morning Doubles"
                required
              />
            </div>
            <div>
              <Label htmlFor="match_type">Match Type</Label>
              <Select value={formData.match_type} onValueChange={(value) => handleInputChange('match_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Doubles">Doubles</SelectItem>
                  <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                  <SelectItem value="Tournament">Tournament</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skill_level">Skill Level</Label>
              <Select value={formData.skill_level} onValueChange={(value) => handleInputChange('skill_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="court_id">Court</Label>
              <Select value={formData.court_id} onValueChange={(value) => handleInputChange('court_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select court" />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                min="30"
                max="180"
              />
            </div>
            <div>
              <Label htmlFor="max_players">Max Players</Label>
              <Input
                id="max_players"
                type="number"
                value={formData.max_players}
                onChange={(e) => handleInputChange('max_players', parseInt(e.target.value))}
                min="2"
                max="8"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Available Players ({selectedPlayers.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlayers(players.map(p => p.id))}
                  disabled={players.length === 0}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlayers([])}
                  disabled={selectedPlayers.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2 bg-gray-50">
              {players.length === 0 ? (
                <p className="text-sm text-gray-500">Loading players...</p>
              ) : (
                players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={player.id}
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlayers(prev => [...prev, player.id])
                        } else {
                          setSelectedPlayers(prev => prev.filter(id => id !== player.id))
                        }
                      }}
                    />
                    <Label htmlFor={player.id} className="text-sm cursor-pointer flex-1">
                      {player.first_name} {player.last_name}
                      <span className="text-gray-500 ml-2">({player.skill_level})</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select players who are present today. Only selected players will be available for match generation.
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for the match"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Internal notes (not visible to players)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Generate Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
