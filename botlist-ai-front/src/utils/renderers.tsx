import { Star } from "lucide-react"

export const renderStars = (rating: number, reviews?: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="text-sm font-medium text-gray-900 ml-1">{rating}</span>
      {reviews !== undefined && <span className="text-sm text-gray-500">({reviews} avis)</span>}
    </div>
  )
}

export const renderCapabilityBar = (label: string, percentage: number) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
