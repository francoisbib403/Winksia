import { LucideIcon } from 'lucide-react'

interface Activity {
  id: number
  type: string
  message: string
  user: string
  time: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'red' | 'purple' | 'yellow'
}

interface RecentActivityProps {
  activities: Activity[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getColorClasses = (color: Activity['color']) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Activité récente
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Voir tout
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getColorClasses(activity.color)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {activity.user}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Il y a {activity.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}