"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  FileText,
  Star,
  MessageSquare,
  Check,
  Share2,
  Zap,
  Globe,
  Clock,
  Shield,
  BarChart,
  Sparkles,
  Rocket,
  Layers,
  X,
  TrendingUp,
  Target,
  Plus,
  Filter,
  Headphones,
  BarChart2,
  PencilRuler,
  Settings,
  ChevronRight,
} from "lucide-react"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import AllReviewsModal from "@/components/ui/all-reviews-modal"
import WriteReviewModal from "@/components/ui/write-review-modal"
import AiAssistantModal from "@/components/ui/ai-assistant-modal"
import ReviewComments from "@/components/ui/review-comments"
import { getFaviconUrl } from "@/lib/utils"
import LocalModeToggle from "@/components/ui/local-mode-toggle"

type ReviewComment = {
  id: string
  comment: string
  user: { id: string; firstname: string; lastname: string }
  created_at: string
}

type Review = {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
  comments?: ReviewComment[]
}

type ToolDisplay = {
  id: string
  slug?: string
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
  website_url?: string
  logo_url?: string
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
    ? categories[0]?.name || "Général"
    : categories?.name || "Général"
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
    website_url: tool.website_url,
    logo_url: tool.logo_url,
    slug: tool.slug || tool.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  }
}

const getFunctionIcon = (functionName: string) => {
  const iconClass = "w-4 h-4"
  switch (functionName) {
    case "Conversation":
      return <MessageSquare className={iconClass} style={{ color: "#1e40af" }} />
    case "Traduction":
      return <Globe className={iconClass} style={{ color: "#2563eb" }} />
    case "Chatbot":
      return <MessageSquare className={iconClass} style={{ color: "#7c3aed" }} />
    case "Assistant virtuel":
      return <Rocket className={iconClass} style={{ color: "#059669" }} />
    case "Génération d'images":
      return <Sparkles className={iconClass} style={{ color: "#db2777" }} />
    case "Analyse de données":
      return <BarChart className={iconClass} style={{ color: "#0891b2" }} />
    default:
      return <Zap className={iconClass} style={{ color: "#f59e0b" }} />
  }
}

const getDomainIcon = (domainName: string) => {
  const iconClass = "w-4 h-4"
  switch (domainName) {
    case "Service Client":
      return <Headphones className={iconClass} style={{ color: "#2563eb" }} />
    case "Analyse de Données":
      return <BarChart2 className={iconClass} style={{ color: "#0891b2" }} />
    case "Création de Contenu":
      return <PencilRuler className={iconClass} style={{ color: "#7c3aed" }} />
    case "Automatisation des Processus":
      return <Settings className={iconClass} style={{ color: "#64748b" }} />
    case "Ventes":
      return <TrendingUp className={iconClass} style={{ color: "#16a34a" }} />
    case "Marketing":
      return <Target className={iconClass} style={{ color: "#ea580c" }} />
    default:
      return <Layers className={iconClass} style={{ color: "#6366f1" }} />
  }
}

export default function ToolSlugPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ""

  const [tool, setTool] = useState<ToolDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)
  const [isToolSelectedForComparison, setIsToolSelectedForComparison] = useState(false)
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<ToolDisplay[]>([])

  // Check if tool is already in comparison
  useEffect(() => {
    try {
      const savedTools = localStorage.getItem('compare_tools_data')
      if (savedTools) {
        const parsed = JSON.parse(savedTools)
        setSelectedToolsForComparison(parsed)
        if (tool) {
          setIsToolSelectedForComparison(parsed.some((t: ToolDisplay) => t.id === tool.id))
        }
      }
    } catch {}
  }, [tool])

  const handleToggleToolForComparison = () => {
    if (!tool) return

    setSelectedToolsForComparison((prev) => {
      if (prev.some((t) => t.id === tool.id)) {
        const updated = prev.filter((t) => t.id !== tool.id)
        localStorage.setItem('compare_tools_data', JSON.stringify(updated))
        setIsToolSelectedForComparison(false)
        return updated
      } else if (prev.length < 3) {
        const updated = [...prev, tool]
        localStorage.setItem('compare_tools_data', JSON.stringify(updated))
        setIsToolSelectedForComparison(true)
        return updated
      }
      return prev
    })
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        let t: any
        try {
          t = await apiClient.get(`/tools/slug/${slug}`)
        } catch {
          try {
            t = await apiClient.get(`/tools/${slug}`)
          } catch {
            setError("Outil non trouvé")
            setLoading(false)
            return
          }
        }

        const adapted = adaptToolForDisplay(t)

        let reviews: Review[] = []

        try {
          let reviewsData: any[] = []
          const toolId = adapted.id
          try {
            reviewsData = await apiClient.get(`/reviews?tool_id=${toolId}`)
          } catch {
            try {
              reviewsData = await apiClient.get(`/reviews/tool/${toolId}`)
            } catch {}
          }

          const raw: any[] = Array.isArray(reviewsData) ? reviewsData : []
          const filteredRaw = raw.filter((r: any) => (r?.tool?.id ?? r?.tool_id) === toolId)
          const effective = filteredRaw.length > 0 ? filteredRaw : raw

          reviews = await Promise.all(
            effective.map(async (review: any) => {
              let comments: any[] = []
              try {
                comments = await apiClient.getReviewComments(review.id)
              } catch {}

              return {
                id: review.id,
                user: `${review.user?.firstname || ""} ${review.user?.lastname || ""}`.trim() || "Utilisateur",
                avatar: `${(review.user?.firstname || "U").charAt(0)}${(review.user?.lastname || "").charAt(0)}`,
                rating: review.rating,
                comment: review.comment,
                date: parseApiDate(review.created_at),
                comments: comments,
              }
            })
          )
        } catch (reviewErr) {
          console.warn("Failed to load reviews, continuing without reviews")
        }

        const safeRating = reviews.length
          ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1))
          : adapted.rating

        setTool({ ...adapted, userReviews: reviews, rating: safeRating, reviews: reviews.length || adapted.reviews })
        setAllReviews(reviews)
      } catch (e: any) {
        console.error("Error loading tool:", e)
        setError("Outil non trouvé ou erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

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
        comments: [],
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

  // ============================================
  // Loading State
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Same as Assistant page */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="w-full px-16 py-4">
            <div className="grid grid-cols-2 items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-4 justify-self-start">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">WINKSIA</span>
                </Link>
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'outil...</p>
          </div>
        </div>
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    )
  }

  // ============================================
  // Error State
  // ============================================
  if (error || !tool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Same as Assistant page */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="w-full px-16 py-4">
            <div className="grid grid-cols-2 items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-4 justify-self-start">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">WINKSIA</span>
                </Link>
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
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Outil non trouvé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/outils" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Retour aux outils
          </Link>
        </div>
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    )
  }

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* Header - Same as Assistant page */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-2 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">WINKSIA</span>
              </Link>
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
      {/* Breadcrumb */}
      {/* ============================================ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <Link href="/outils" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux outils</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium text-sm">{tool.name}</span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Hero Section */}
      {/* ============================================ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left: Logo & Basic Info */}
            <div className="flex items-start gap-6 flex-1">
              <div className="flex-shrink-0">
                {tool.website_url || tool.logo_url ? (
                  <img
                    src={getFaviconUrl(tool.website_url, 64)}
                    alt={tool.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/20">
                    {tool.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {tool.featured && (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      <Star className="w-3 h-3 mr-1 fill-amber-500" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                <p className="text-gray-500 mb-4">{tool.company} • {tool.allCategories?.join(" • ") || tool.category}</p>
                <div className="flex items-center gap-6">
                  {renderStars(tool.rating)}
                  <span className="text-gray-500">{tool.reviews} avis</span>
                </div>
              </div>
            </div>
            
            {/* Right: Price & Actions */}
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <span className="text-3xl font-bold text-gray-900">{tool.price}</span>
                <span className="text-gray-500 ml-2">/ {tool.priceType.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleToggleToolForComparison}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                    isToolSelectedForComparison
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                      : selectedToolsForComparison.length >= 3
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                  }`}
                  disabled={!isToolSelectedForComparison && selectedToolsForComparison.length >= 3}
                >
                  {isToolSelectedForComparison ? (
                    <>
                      <Check className="w-4 h-4" />
                      Sélectionné
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Comparer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Main Content */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">{tool.fullDescription}</p>
            </section>

            {/* Capabilities */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Évaluation des capacités
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tool.capabilities).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    {renderCapabilityBar(key, value)}
                  </div>
                ))}
              </div>
            </section>

            {/* Functions & Domains */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Fonctionnalités
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tool.functions.map((func, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {getFunctionIcon(func)}
                      {func}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Domaines d'application
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tool.domains.map((domain, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {getDomainIcon(domain)}
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-500" />
                Cas d'usage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tool.useCases.map((useCase, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Advantages & Concerns */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Avantages
                </h2>
                <ul className="space-y-2">
                  {tool.advantages.length > 0 ? (
                    tool.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2 text-green-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {adv}
                      </li>
                    ))
                  ) : (
                    <li className="text-green-600">Aucun avantage spécifique enregistré</li>
                  )}
                </ul>
              </div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Points d'attention
                </h2>
                <ul className="space-y-2">
                  {tool.concerns.length > 0 ? (
                    tool.concerns.map((concern, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        {concern}
                      </li>
                    ))
                  ) : (
                    <li className="text-amber-600">Aucun point d'attention spécifique enregistré</li>
                  )}
                </ul>
              </div>
            </section>

            {/* Business Value */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Valeur business
              </h2>
              <p className="text-white/90 mb-3">{tool.businessValue}</p>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="font-medium">ROI estimé : {tool.roi}</span>
              </div>
            </section>

            {/* Integration */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Intégration
              </h2>
              <p className="text-gray-600 leading-relaxed">{tool.integration}</p>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Avis utilisateurs ({tool.reviews})
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Écrire un avis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{tool.rating.toFixed(1)}/5</div>
                  {renderStars(tool.rating)}
                  <p className="text-gray-500 mt-2">{tool.reviews} avis collectés</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                  {[5, 4, 3, 2, 1].map((starCount) => {
                    const count = allReviews.filter((r) => r.rating === starCount).length
                    const percentage = tool.reviews > 0 ? (count / tool.reviews) * 100 : 0
                    return (
                      <div key={starCount} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-12">{starCount} ★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {(tool.userReviews || []).slice(0, 4).map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-3">
                      {review.avatar.startsWith("http") ? (
                        <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                          {review.avatar}
                        </div>
                      )}
                      <div>
                        <h5 className="font-semibold text-gray-900">{review.user}</h5>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{review.comment}</p>
                    <ReviewComments review={{ ...review, comments: review.comments || [] }} />
                  </div>
                ))}
              </div>

              {(tool.userReviews || []).length > 4 && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => setIsAllReviewsModalOpen(true)}>
                    Voir tous les {tool.reviews} avis
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">En résumé</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Note globale</span>
                    <div className="flex items-center gap-2">
                      {renderStars(tool.rating)}
                      <span className="font-semibold text-gray-900">{tool.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prix</span>
                    <span className="font-semibold text-gray-900">{tool.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type</span>
                    <Badge variant="secondary">{tool.priceType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Catégorie</span>
                    <span className="text-gray-900">{tool.allCategories?.[0] || tool.category}</span>
                  </div>
                </div>
                <hr className="my-4 border-gray-200" />
                {tool.website_url && (
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Essayer {tool.name}
                  </a>
                )}
              </div>

              {/* Similar Tools */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Outils similaires</h3>
                <p className="text-gray-500 text-sm mb-4">Découvrez d'autres outils dans la même catégorie</p>
                <Link
                  href="/outils"
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Voir tous les outils
                </Link>
              </div>

              {/* AI Assistant CTA */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Vous hésitez encore ?</h3>
                <p className="text-white/90 text-sm mb-4">Demandez à notre assistant IA de vous aider à choisir</p>
                <Link
                  href="/assistant"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-colors font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discuter avec l'assistant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Bottom Bar */}
      {selectedToolsForComparison.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  {selectedToolsForComparison.length} outil{selectedToolsForComparison.length > 1 ? 's' : ''} sélectionné{selectedToolsForComparison.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  {selectedToolsForComparison.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm text-gray-700 truncate max-w-[150px]">{t.name}</span>
                      <button
                        onClick={() => {
                          const updated = selectedToolsForComparison.filter((tool) => tool.id !== t.id)
                          setSelectedToolsForComparison(updated)
                          localStorage.setItem('compare_tools_data', JSON.stringify(updated))
                          if (t.id === tool.id) setIsToolSelectedForComparison(false)
                        }}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/outils/comparer"
                className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: "#f59e0b" }}
              >
                Comparer ({selectedToolsForComparison.length})
              </Link>
            </div>
          </div>
        </div>
      )}

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
      <LocalModeToggle />
    </div>
  )
}
