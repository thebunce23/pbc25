'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventsPage() {
  const [events] = useState([
    {
      id: '1',
      title: 'Weekly Round Robin Tournament',
      description: 'Join us for our weekly round robin tournament. All skill levels welcome!',
      eventDate: '2024-12-07',
      status: 'open'
    }
  ])

  return (
    <DashboardLayout title="Events">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Events ({events.length})</CardTitle>
            <CardDescription>
              Manage club events, tournaments, and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg"
                >
                  <h3 className="font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    {event.eventDate} - {event.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
