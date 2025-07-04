import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Trophy, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  // Mock data - replace with real data from your backend
  const stats = [
    {
      title: 'Total Players',
      value: '247',
      change: '+12 from last month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Upcoming Events',
      value: '8',
      change: '3 this week',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Matches',
      value: '15',
      change: '5 in progress',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Court Utilization',
      value: '84%',
      change: '+5% from last week',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'match',
      description: 'John Smith vs Sarah Johnson - Court A',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'registration',
      description: 'Mike Chen registered for Weekly Tournament',
      time: '4 hours ago',
      status: 'new'
    },
    {
      id: 3,
      type: 'event',
      description: 'Summer Championship event created',
      time: '1 day ago',
      status: 'scheduled'
    },
    {
      id: 4,
      type: 'player',
      description: 'New player Lisa Wong joined the club',
      time: '2 days ago',
      status: 'new'
    }
  ]

  const upcomingMatches = [
    {
      id: 1,
      players: 'Alex Rivera vs Tom Wilson',
      court: 'Court B',
      time: '10:00 AM',
      date: 'Today'
    },
    {
      id: 2,
      players: 'Emma Davis vs Chris Lee',
      court: 'Court A',
      time: '2:00 PM',
      date: 'Today'
    },
    {
      id: 3,
      players: 'Rachel Green vs David Kim',
      court: 'Court C',
      time: '9:00 AM',
      date: 'Tomorrow'
    }
  ]

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'new' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
              <CardDescription>
                Next scheduled matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {match.players}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.court} • {match.date}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {match.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/players"
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Players</h3>
                  <p className="text-sm text-gray-500">Add or edit player profiles</p>
                </div>
              </a>
              
              <a
                href="/events"
                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Create Event</h3>
                  <p className="text-sm text-gray-500">Schedule tournaments or social play</p>
                </div>
              </a>
              
              <a
                href="/matches"
                className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Schedule Match</h3>
                  <p className="text-sm text-gray-500">Create new matches</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
