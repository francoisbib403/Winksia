import { Search, BarChart3, MessageCircle, Shield, TrendingUp, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Recherche Intelligente",
      description: "Trouvez l'outil IA parfait grâce à notre moteur de recherche avancé et nos filtres intelligents.",
      iconColor: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      icon: BarChart3,
      title: "Comparaison Détaillée",
      description: "Comparez jusqu'à 3 outils côte à côte avec des métriques business et techniques complètes.",
      iconColor: "#059669",
      bgColor: "#d1fae5",
    },
    {
      icon: MessageCircle,
      title: "Assistant IA Intégré",
      description: "Notre assistant IA vous guide dans le choix des meilleures solutions pour vos besoins spécifiques.",
      iconColor: "#7c3aed",
      bgColor: "#e9d5ff",
    },
    {
      icon: Shield,
      title: "Évaluation Sécurisée",
      description: "Chaque outil est évalué selon des critères de sécurité et de conformité stricts.",
      iconColor: "#dc2626",
      bgColor: "#fecaca",
    },
    {
      icon: TrendingUp,
      title: "ROI Calculé",
      description: "Estimations de retour sur investissement et analyses de coûts pour chaque solution.",
      iconColor: "#ea580c",
      bgColor: "#fed7aa",
    },
    {
      icon: Users,
      title: "Recommandations Expertes",
      description: "Bénéficiez de l'expertise de nos consultants et de recommandations personnalisées.",
      iconColor: "#7c3aed",
      bgColor: "#e9d5ff",
    },
  ]

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Pourquoi choisir Winksia ?</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Notre plateforme combine expertise humaine et intelligence artificielle pour vous offrir la meilleure
            expérience de découverte d'outils IA.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <IconComponent className="w-8 h-8" style={{ color: feature.iconColor }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
