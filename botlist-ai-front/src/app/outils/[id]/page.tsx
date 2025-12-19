"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Eye, ArrowLeft, Bookmark, ExternalLink, FileText, Star, MessageSquare, Search, ChevronUp, ChevronDown, Filter, Check, Plus, Cloud, Target, TrendingUp, Settings, PencilRuler, BarChart2, Headphones, MessageCircle, Smartphone, Brain, X } from "lucide-react"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import AllReviewsModal from "@/components/ui/all-reviews-modal"
import WriteReviewModal from "@/components/ui/write-review-modal"
import AiAssistantModal from "@/components/ui/ai-assistant-modal"

type Review = {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
}

type ToolDisplay = {
  id: string
  name: string
  company: string
  category: string
  allCategories: string[]
  description: string
  fullDescription: string
  rating: number
  reviews: number
  price: string
  priceType: string
  tags: string[]
  functions: string[]
  domains: string[]
  useCases: string[]
  advantages: string[]
  concerns: string[]
  businessValue: string
  roi: string
  integration: string
  capabilities: Record<string, number>
  featured: boolean
  userReviews?: Review[]
}

const parseApiDate = (dateString: string): string => {
  try {
    let date: Date
    if (!isNaN(Number(dateString))) {
      date = new Date(Number(dateString))
    } else {
      date = new Date(dateString)
    }
    if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0]
    return date.toISOString().split("T")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

const adaptToolForDisplay = (tool: any): ToolDisplay => {
  const getPriceDisplay = (pricingModel: string, pricingDetails?: any) => {
    switch (pricingModel) {
      case "free":
        return "Gratuit"
      case "freemium":
        return pricingDetails?.startingPrice || "Freemium"
      case "paid":
        return pricingDetails?.price || "Payant"
      case "enterprise":
        return "Sur devis"
      case "api_based":
        return pricingDetails?.apiPrice || "Usage API"
      default:
        return "Prix non spécifié"
    }
  }

  const getPriceType = (pricingModel: string) => {
    switch (pricingModel) {
      case "free":
        return "Gratuit"
      case "freemium":
        return "Freemium"
      case "paid":
        return "Abonnement"
      case "enterprise":
        return "Enterprise"
      case "api_based":
        return "API"
      default:
        return "Autre"
    }
  }

  const calculateCapabilities = (t: any) => ({
    "Capacité IA": t.performance_score || 80,
    "Facilité d'usage": t.ease_of_use_score || 75,
    Intégration: t.integrations?.length ? Math.min(t.integrations.length * 20, 100) : 70,
    Sécurité: (t.gdpr_compliant ? 25 : 0) + (t.soc2_certified ? 25 : 0) + (t.hipaa_compliant ? 25 : 0) + 25,
    Évolutivité: t.value_for_money_score || 80,
  })

  const categories = tool.category as any
  const categoryName = Array.isArray(categories)
    ? (categories[0]?.name || "Général")
    : (categories?.name || "Général")
  const allCategories = Array.isArray(categories)
    ? categories.map((c: any) => c?.name).filter(Boolean)
    : categories?.name
      ? [categories.name]
      : []

  return {
    id: tool.id,
    name: tool.name,
    company: categoryName || "Non spécifié",
    category: categoryName || "Général",
    allCategories,
    description: tool.description,
    fullDescription: tool.long_description || tool.description,
    rating: typeof tool.overall_rating === "number" ? tool.overall_rating : 0,
    reviews: typeof tool.review_count === "number" ? tool.review_count : 0,
    price: getPriceDisplay(tool.pricing_model, tool.pricing_details),
    priceType: getPriceType(tool.pricing_model),
    tags: [
      ...(Array.isArray(tool.features) ? tool.features.slice(0, 2) : []),
      ...(tool.api_available ? ["API"] : []),
      ...(tool.open_source ? ["Open Source"] : []),
    ].slice(0, 3),
    functions: Array.isArray(tool.features) ? tool.features : [],
    domains: Array.isArray(tool.use_cases) ? tool.use_cases : [],
    useCases: Array.isArray(tool.use_cases) ? tool.use_cases : [],
    advantages: [],
    concerns: [],
    businessValue: "Améliore l'efficacité opérationnelle et réduit les coûts",
    roi: tool.pricing_model === "free" ? "1-2 mois" : "3-6 mois",
    integration: `Intégration via API${tool.api_available ? " disponible" : " limitée"}. ${
      tool.integrations?.length ? `Compatible avec ${tool.integrations.join(", ")}.` : ""
    }`,
    capabilities: calculateCapabilities(tool),
    featured: !!tool.featured,
  }
}

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ""

  const [tool, setTool] = useState<ToolDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  // Etats pour reproduire le même header que la page outils
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<any[]>([])
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const t = await apiClient.get(`/tools/${id}`)
        const adapted = adaptToolForDisplay(t)

        // Load reviews
        let reviewsData: any[] = []
        try {
          // Prefer query by tool id if available
          reviewsData = await apiClient.get(`/reviews?tool_id=${id}`)
        } catch {
          try {
            reviewsData = await apiClient.get(`/reviews/tool/${id}`)
          } catch {}
        }

        const raw: any[] = Array.isArray(reviewsData) ? reviewsData : []
        const filteredRaw = raw.filter((r: any) => (r?.tool?.id ?? r?.tool_id) === id)
        const effective = filteredRaw.length > 0 ? filteredRaw : raw

        const reviews: Review[] = effective.map((review: any) => ({
          id: review.id,
          user: `${review.user?.firstname || ""} ${review.user?.lastname || ""}`.trim() || "Utilisateur",
          avatar: `${(review.user?.firstname || "U").charAt(0)}${(review.user?.lastname || "").charAt(0)}`,
          rating: review.rating,
          comment: review.comment,
          date: parseApiDate(review.created_at),
        }))

        const safeRating = reviews.length
          ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1))
          : adapted.rating

        setTool({ ...adapted, userReviews: reviews, rating: safeRating, reviews: reviews.length || adapted.reviews })
        setAllReviews(reviews)
      } catch (e: any) {
        console.error(e)
        setError("Impossible de charger l'outil demandé")
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleAddReview = async (rating: number, comment: string) => {
    if (!tool) return
    try {
      const userDataString = localStorage.getItem("user_data")
      if (!userDataString) return alert("Vous devez être connecté pour écrire un avis")
      const userData = JSON.parse(userDataString)
      const newReviewData = await apiClient.createReview({ rating, comment, tool_id: tool.id, user_id: userData.id })
      const newReview: Review = {
        id: newReviewData.id,
        user: `${newReviewData.user.firstname} ${newReviewData.user.lastname}`,
        avatar: `${newReviewData.user.firstname.charAt(0)}${newReviewData.user.lastname.charAt(0)}`,
        rating: newReviewData.rating,
        comment: newReviewData.comment,
        date: parseApiDate(newReviewData.created_at),
      }
      const updated = [...allReviews, newReview]
      const avg = Number((updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1))
      setAllReviews(updated)
      setTool((prev) => (prev ? { ...prev, userReviews: updated, reviews: updated.length, rating: avg } : prev))
      setIsWriteReviewModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header identique à la page outils */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-3 items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-4 justify-self-start">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#1e3a8a" }}
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Winksia</h1>
                  </div>
                </div>
              </div>
              {/* Search Bar centré */}
              <div className="justify-self-center w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              {/* Actions à droite */}
              <div className="flex items-center gap-3 justify-self-end ml-auto">
                {selectedToolsForComparison.length >= 1 && (
                  <button
                    onClick={() => {}}
                    className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    Comparer ({selectedToolsForComparison.length})
                  </button>
                )}
                <Link
                  href="/assistant"
                  className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  <MessageSquare className="w-5 h-5" />
                  Assistant IA
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-16">Chargement...</div>
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header identique à la page outils */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-3 items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e3a8a" }}>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Winksia</h1>
                  </div>
                </div>
              </div>
              <div className="justify-self-center w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-self-end ml-auto">
                <Link
                  href="/assistant"
                  className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  <MessageSquare className="w-5 h-5" />
                  Assistant IA
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-16 text-red-600">{error || "Outil introuvable"}</div>
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique à la page outils */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Winksia</h1>
                </div>
              </div>
            </div>
            {/* Search Bar centré */}
            <div className="justify-self-center w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            {/* Actions à droite */}
            <div className="flex items-center gap-3 justify-self-end ml-auto">
              {selectedToolsForComparison.length >= 1 && (
                <button
                  onClick={() => {}}
                  className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  Comparer ({selectedToolsForComparison.length})
                </button>
              )}
              <Link
                href="/assistant"
                className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: "#1e3a8a" }}
              >
                <MessageSquare className="w-5 h-5" />
                Assistant IA
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau outil + retour */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/outils" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tool.name}</h1>
                <p className="text-sm text-gray-600">{tool.company} • {(tool.allCategories || []).join(" • ") || tool.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu détaillé */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Résumé haut */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="mb-2">{renderStars(tool.rating)}</div>
              <p className="text-gray-700 leading-relaxed">{tool.description}</p>
            </div>
            <div className="text-right min-w-[160px]">
              <div className="text-2xl font-bold text-green-600 mb-1">{tool.price}</div>
              <div className="text-sm text-gray-600">{tool.priceType}</div>
            </div>
          </div>
        </div>

        {/* Description complète */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{tool.fullDescription}</p>
        </div>

        {/* Capacités */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Évaluation des Capacités</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(tool.capabilities).map(([label, value]) => (
              <div key={label}>{renderCapabilityBar(label, value)}</div>
            ))}
          </div>
        </div>

        {/* Fonctions et domaines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fonctions</h3>
            <div className="flex flex-wrap gap-2">
              {tool.functions.map((func, i) => (
                <span key={`${func}-${i}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {func}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Domaines d'application</h3>
            <div className="flex flex-wrap gap-2">
              {tool.domains.map((domain, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cas d'usage */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cas d'usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.useCases.map((useCase, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                <span className="text-gray-700">{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Valeur business / Intégration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Valeur Business</h3>
            <p className="text-blue-800 mb-3">{tool.businessValue}</p>
            <p className="text-blue-700 font-medium">
              <span className="font-bold">ROI estimé :</span> {tool.roi}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Conseils d'intégration</h3>
            <p className="text-gray-700 leading-relaxed">{tool.integration}</p>
          </div>
        </div>

        {/* Avis utilisateurs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Avis Utilisateurs ({tool.reviews})</h3>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
              onClick={() => setIsWriteReviewModalOpen(true)}
            >
              <Star className="w-4 h-4 mr-2" />
              Écrire un avis
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{tool.rating.toFixed(1)}/5</div>
              <p className="text-gray-600 mb-4">à partir de {tool.reviews} avis</p>
              {renderStars(tool.rating)}
            </div>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = allReviews.filter((r) => r.rating === starCount).length
                const percentage = tool.reviews > 0 ? (count / tool.reviews) * 100 : 0
                return (
                  <div key={starCount} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{starCount} étoiles</span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">({count})</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            {(tool.userReviews || []).slice(0, 4).map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  {review.avatar.startsWith("http") ? (
                    <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold">
                      {review.avatar}
                    </div>
                  )}
                  <div>
                    <h5 className="font-semibold text-gray-900">{review.user}</h5>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 ml-1">{review.rating}/5</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                <p className="text-xs text-gray-500 text-right">{review.date}</p>
              </div>
            ))}

            {(tool.userReviews || []).length > 4 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setIsAllReviewsModalOpen(true)}>
                  Voir tous les {tool.reviews} avis
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <a
            href="#"
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" /> Voir la Démo
          </a>
          <a
            href="#"
            className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" /> Demander un Devis
          </a>
        </div>

        {/* Modals */}
        <AllReviewsModal
          isOpen={isAllReviewsModalOpen}
          onClose={() => setIsAllReviewsModalOpen(false)}
          toolName={tool.name}
          reviews={tool.userReviews || []}
          overallRating={tool.rating}
          reviewCount={tool.reviews}
        />

        <WriteReviewModal
          isOpen={isWriteReviewModalOpen}
          onClose={() => setIsWriteReviewModalOpen(false)}
          toolName={tool.name}
          onAddReview={handleAddReview}
        />
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    </div>
  )
}
