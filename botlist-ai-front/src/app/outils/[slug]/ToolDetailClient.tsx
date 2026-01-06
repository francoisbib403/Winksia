"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  MessageSquare,
  Star,
  ThumbsUp,
  Globe,
  Users,
  Tag,
  Search,
  ImageIcon,
} from "lucide-react"
import { renderStars } from "@/utils/renderers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFaviconUrl } from "@/lib/utils"

interface ToolDisplay {
  id: string
  slug?: string
  name: string
  tagline?: string
  description: string
  fullDescription: string
  pricing_model: string
  status: string
  website_url?: string
  api_available?: boolean
  open_source?: boolean
  features?: string[]
  use_cases?: string[]
  integrations?: string[]
  platforms?: string[]
  overall_rating?: number
  review_count?: number
  category?: string
  rating: number
  reviews: number
  price: string
  priceType: string
  logo_url?: string
}

interface ToolDetailClientProps {
  tool: ToolDisplay
}

interface LinkPreviewData {
  url: string
  image: string
}

export default function ToolDetailClient({ tool }: ToolDetailClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isHunted, setIsHunted] = useState(false)
  const [huntCount, setHuntCount] = useState(tool.reviews || 0)
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    const fetchLinkPreview = async () => {
      if (!tool?.website_url) return

      setPreviewLoading(true)
      try {
        const { getLinkPreview } = await import("link-preview-js")
        const data = await getLinkPreview(tool.website_url!) as any
        setPreviewData({
          url: tool.website_url,
          image: data.images?.[0] || "",
        })
      } catch (error) {
        console.error("Failed to fetch link preview:", error)
        setPreviewData({ url: tool.website_url, image: "" })
      } finally {
        setPreviewLoading(false)
      }
    }

    fetchLinkPreview()
  }, [tool?.website_url])

  const handleHunt = () => {
    setIsHunted(!isHunted)
    setHuntCount(isHunted ? huntCount - 1 : huntCount + 1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/outils?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* Top Navigation */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-3 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">WINKSIA</span>
              </Link>
            </div>
            {/* Search Bar centré */}
            <div className="justify-self-center w-full max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f4f7fa] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </form>
            </div>
            {/* Actions à droite */}
            <div className="flex items-center gap-6 justify-self-end ml-auto">
              <Link href="/outils" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Outils
              </Link>
              <Link href="/assistant" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Chat
              </Link>
              <span className="text-gray-400 font-medium">Classement</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* Main Content */}
      {/* ============================================ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Product Hunt Style */}
        <div className="flex gap-6 mb-8">
          {/* Product Icon */}
          <div className="flex-shrink-0">
            {tool?.logo_url ? (
              <img
                src={tool.logo_url}
                alt={tool?.name || ""}
                className="w-24 h-24 rounded-2xl shadow-sm object-contain bg-white"
              />
            ) : tool?.website_url ? (
              <img
                src={getFaviconUrl(tool.website_url, 64)}
                alt={tool?.name || ""}
                className="w-auto h-16 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-sm">
                {(tool?.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{tool?.name}</h1>
            {tool?.tagline && (
              <p className="text-xl text-gray-600 mb-2">{tool.tagline}</p>
            )}
          </div>

          {/* Hunt Button */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleHunt}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isHunted
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isHunted ? "fill-current" : ""}`} />
              <span>{isHunted ? "Hunted!" : "Hunt this"}</span>
            </button>
            <span className="text-sm text-gray-500">{huntCount} upvotes</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 py-4 border-y border-gray-100 mb-8">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400 fill-gray-400" />
            <span className="font-semibold text-gray-900">{tool.rating.toFixed(1)}</span>
            <span className="text-gray-500">({tool.reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Globe className="w-5 h-5" />
            <span>{tool.price}</span>
          </div>
          {tool.api_available && (
            <Badge className="bg-green-100 text-green-700">API</Badge>
          )}
          {tool.open_source && (
            <Badge className="bg-purple-100 text-purple-700">Open Source</Badge>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Website Screenshot */}
            {tool?.website_url && previewData?.image ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={previewData.image}
                    alt={`${tool.name} - Aperçu`}
                    className="w-full aspect-video object-cover"
                  />
                </a>
              </div>
            ) : previewLoading ? (
              <div className="aspect-video w-full bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="animate-pulse flex items-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              </div>
            ) : null}

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">À propos</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {tool?.fullDescription || tool?.description || "Aucune description disponible."}
              </p>
            </section>

            {/* Features */}
            {tool?.features && tool.features.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Fonctionnalités</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Use Cases */}
            {tool?.use_cases && tool.use_cases.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Cas d'usage</h2>
                <ul className="space-y-2">
                  {tool.use_cases.map((useCase, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reviews Section - Placeholder for now */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Écrire un avis
                </Button>
              </div>

              {/* Rating Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{tool.rating.toFixed(1)}</div>
                    {renderStars(tool.rating)}
                    <p className="text-sm text-gray-500 mt-1">{tool.reviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((starCount) => (
                      <div key={starCount} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{starCount}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${(starCount / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-6">{Math.floor(tool.reviews * (starCount / 5))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* CTA Card */}
            <div className="bg-gray-50 rounded-2xl p-6">
              {tool?.website_url ? (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              ) : (
                <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold cursor-not-allowed opacity-50">
                  Website Coming Soon
                </button>
              )}
              <p className="text-center text-sm text-gray-500 mt-3">
                {tool?.price || "Free"} • {tool?.priceType || ""}
              </p>
            </div>

            {/* Maker Info */}
            <div className="border border-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Informations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prix</span>
                  <span className="text-gray-900 font-medium">{tool?.price || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900">{tool?.priceType || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Catégorie</span>
                  <span className="text-gray-900">{tool?.category || "—"}</span>
                </div>
                {tool?.api_available && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">API</span>
                    <span className="text-green-600">Disponible</span>
                  </div>
                )}
                {tool?.open_source && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Open Source</span>
                    <span className="text-purple-600">Oui</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {tool?.features && tool.features.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.features.slice(0, 5).map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {tool?.integrations && tool.integrations.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Intégrations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.integrations.map((integration, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-white/90 text-sm mb-4">Discutez avec notre assistant IA pour trouver le bon outil</p>
              <Link
                href="/assistant"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-colors font-medium text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Discuter
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">© 2024 Winksia. Tous droits réservés.</span>
            <div className="flex items-center gap-4">
              <Link href="/outils" className="text-gray-500 hover:text-gray-900 text-sm">Outils</Link>
              <Link href="/assistant" className="text-gray-500 hover:text-gray-900 text-sm">Assistant</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
