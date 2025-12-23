import { Star } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Winksia nous a fait gagner des mois dans notre recherche d'outils IA. La plateforme est intuitive et les recommandations sont parfaitement adaptées à nos besoins.",
      name: "Marie Dubois",
      title: "Directrice Innovation",
      company: "TechCorp France",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "Excellent outil pour comparer les solutions IA. Les analyses de ROI nous ont aidés à justifier nos investissements auprès de la direction.",
      name: "Pierre Martin",
      title: "CTO",
      company: "InnovateLab",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "Le chat de Winksia comprend vraiment nos enjeux métier. Nous avons trouvé la solution parfaite pour notre service client en quelques minutes.",
      name: "Sophie Laurent",
      title: "Responsable Digital",
      company: "RetailPlus",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const renderStars = () => {
    return (
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    )
  }

  return (
    <section className="px-6 py-16 md:py-24 bg-blue-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-6">Ce que disent nos clients</h2>
          <p className="text-lg md:text-xl text-blue-100">
            Plus de 10 000 entreprises nous font confiance pour leurs projets IA
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              {/* Stars */}
              {renderStars()}

              {/* Quote */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">"{testimonial.quote}"</blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={`Avatar de ${testimonial.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.title} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
