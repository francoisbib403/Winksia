export default function StatsSection() {
  const stats = [
    {
      number: "500+",
      label: "Outils IA Référencés",
    },
    {
      number: "50+",
      label: "Catégories Métier",
    },
    {
      number: "10k+",
      label: "Entreprises accompagnées",
    },
    {
      number: "95%",
      label: "Taux de Satisfaction",
    },
  ]

  return (
    <section className="px-6 py-16 bg-white/10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="text-white">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{stat.number}</div>
              <div className="text-sm md:text-base font-medium opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
