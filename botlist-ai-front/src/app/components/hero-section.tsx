import { Search } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="px-6 py-16 md:py-24 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">Winksia</h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-yellow-400">La bonne IA, en un clin d'œil</h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-white max-w-3xl mx-auto mb-12 leading-relaxed">
          Découvrez, comparez et choisissez les meilleures solutions d'intelligence artificielle pour votre entreprise.
          Notre plateforme vous guide vers les outils IA qui transformeront vraiment votre business.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-medium text-lg transition-all hover:scale-105">
            Demander une démo →
          </button>
          <Link
            href="/outils"
            className="px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-blue-900 rounded-lg font-medium text-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Découvrir les Outils IA
          </Link>
        </div>
      </div>
    </section>
  )
}
