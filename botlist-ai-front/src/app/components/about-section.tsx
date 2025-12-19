import { Award, Lightbulb, Users, Check } from "lucide-react"

export default function AboutSection() {
  const missionPoints = [
    "Démocratiser l'accès aux technologies IA pour toutes les entreprises",
    "Simplifier le processus de sélection et d'adoption des outils IA",
    "Accompagner la transformation digitale avec expertise et bienveillance",
  ]

  const values = [
    {
      icon: Award,
      title: "Expertise",
      subtitle: "10+ ans d'expérience",
      iconColor: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      subtitle: "Veille technologique",
      iconColor: "#059669",
      bgColor: "#d1fae5",
    },
    {
      icon: Users,
      title: "Accompagnement",
      subtitle: "Support personnalisé",
      iconColor: "#7c3aed",
      bgColor: "#e9d5ff",
    },
  ]

  return (
    <section className="px-6 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Text Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">À propos de Winksia</h2>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <span className="font-bold text-gray-900">Winksia</span> est née de la conviction que chaque entreprise
                mérite d'accéder aux meilleures solutions d'intelligence artificielle, adaptées à ses besoins
                spécifiques.
              </p>

              <p className="text-lg">
                Notre équipe d'experts en IA et en transformation digitale a créé cette plateforme pour démocratiser
                l'accès aux technologies d'intelligence artificielle et accompagner les dirigeants dans leurs choix
                stratégiques.
              </p>

              <p className="text-lg">
                Avec plus de 500 outils référencés et analysés, nous vous aidons à identifier en un clin d'œil les
                solutions qui transformeront réellement votre business.
              </p>
            </div>
          </div>

          {/* Right Column - Mission Box */}
          <div>
            <div
              className="rounded-2xl p-8 text-white"
              style={{
                background: "linear-gradient(135deg, #06285dff 0%, #07235fff 100%)",
              }}
            >
              <h3 className="text-2xl font-bold mb-6">Notre Mission</h3>
              <div className="space-y-4">
                {missionPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-white/95 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: value.bgColor }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: value.iconColor }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.subtitle}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
