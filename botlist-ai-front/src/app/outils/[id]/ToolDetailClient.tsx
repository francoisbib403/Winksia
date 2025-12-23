"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, ArrowLeft, Bookmark, ExternalLink, FileText, Star, MessageSquare, Search, Heart, User, Bold, Italic, List, ChevronDown, ChevronUp } from "lucide-react"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import AllReviewsModal from "@/components/ui/all-reviews-modal"
import WriteReviewModal from "@/components/ui/write-review-modal"
import AiAssistantModal from "@/components/ui/ai-assistant-modal"
import { TransitionPanel } from "@/components/ui/transition-panel"
import { getFaviconUrl } from "@/lib/utils"

export type Review = {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
}

export type ToolDisplay = {
  id: string
  slug?: string
  name: string
  tagline?: string
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
  websiteUrl?: string
  logoUrl?: string
  demoUrl?: string
  screenshots?: string[]
  videos?: string[]
  api_available?: boolean
  open_source?: boolean
  self_hosted_available?: boolean
  integrations?: string[]
  platforms?: string[]
}

const parseApiDate = (dateString: string): string => {
  try {
    let date: Date
    if (!isNaN(Number(dateString))) date = new Date(Number(dateString))
    else date = new Date(dateString)
    if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0]
    return date.toISOString().split("T")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

export default function ToolDetailClient({ initialTool }: { initialTool: ToolDisplay }) {
  const router = useRouter()
  const [tool, setTool] = useState<ToolDisplay>(initialTool)
  const [allReviews, setAllReviews] = useState<Review[]>(initialTool.userReviews || [])
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<any[]>([])
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState<number>(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [isReviewFormExpanded, setIsReviewFormExpanded] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)

  const tabs = [
    {
      title: "Description",
      content: (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{tool.fullDescription}</p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Évaluation des Capacités</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tool.capabilities).map(([label, value]) => (
                <div key={label}>{renderCapabilityBar(label, value)}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Fonctions</h3>
              <div className="flex flex-wrap gap-2">
                {tool.functions.map((func, i) => (
                  <span key={`${func}-${i}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {func}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6">
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
          <div className="bg-white rounded-2xl p-6">
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
        </div>
      ),
    },
  ]

  // Init interactions from localStorage
  useEffect(() => {
    try {
      const upvotesStore = JSON.parse(localStorage.getItem("wks_upvotes") || "{}")
      const bookmarksStore: string[] = JSON.parse(localStorage.getItem("wks_bookmarks") || "[]")
      setHasUpvoted(!!upvotesStore[tool.id])
      setUpvoteCount(Number(upvotesStore[tool.id]?.count || 0))
      setIsBookmarked(bookmarksStore.includes(tool.id))
    } catch {}
  }, [tool.id])

  // Fetch reviews on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        let reviewsData: any[] = []
        try {
          reviewsData = await apiClient.get(`/reviews?tool_id=${tool.id}`)
        } catch {
          try {
            reviewsData = await apiClient.get(`/reviews/tool/${tool.id}`)
          } catch {}
        }
        const raw: any[] = Array.isArray(reviewsData) ? reviewsData : []
        const effective = raw.filter((r: any) => (r?.tool?.id ?? r?.tool_id) === tool.id)
        const reviews: Review[] = (effective.length ? effective : raw).map((review: any) => ({
          id: review.id,
          user: `${review.user?.firstname || ""} ${review.user?.lastname || ""}`.trim() || "Utilisateur",
          avatar: `${(review.user?.firstname || "U").charAt(0)}${(review.user?.lastname || "").charAt(0)}`,
          rating: review.rating,
          comment: review.comment,
          date: parseApiDate(review.created_at),
        }))
        const avg = reviews.length ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)) : tool.rating
        setAllReviews(reviews)
        setTool((prev) => ({ ...prev, userReviews: reviews, reviews: reviews.length || prev.reviews, rating: avg }))
      } catch {}
    }
    loadReviews()
  }, [tool.id])

  const toggleUpvote = () => {
    try {
      const store = JSON.parse(localStorage.getItem("wks_upvotes") || "{}")
      const prev = store[tool.id]?.count || 0
      if (store[tool.id]?.voted) {
        const next = Math.max(prev - 1, 0)
        store[tool.id] = { count: next, voted: false }
        setHasUpvoted(false)
        setUpvoteCount(next)
      } else {
        const next = prev + 1
        store[tool.id] = { count: next, voted: true }
        setHasUpvoted(true)
        setUpvoteCount(next)
      }
      localStorage.setItem("wks_upvotes", JSON.stringify(store))
    } catch {}
  }

  const toggleBookmark = () => {
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem("wks_bookmarks") || "[]")
      const exists = bookmarks.includes(tool.id)
      const next = exists ? bookmarks.filter((x) => x !== tool.id) : [...bookmarks, tool.id]
      localStorage.setItem("wks_bookmarks", JSON.stringify(next))
      setIsBookmarked(!exists)
    } catch {}
  }

  const handleVisitWebsite = () => {
    if (!tool?.websiteUrl) return
    window.open(tool.websiteUrl, "_blank")
  }

  const handleAddReview = async (rating: number, comment: string) => {
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
      setTool((prev) => ({ ...prev, userReviews: updated, reviews: updated.length, rating: avg }))
      setIsWriteReviewModalOpen(false)
    } catch (err) {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique à la page outils */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-3 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
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
            {/* Actions à droite (Boutons + Profile) */}
            <div className="flex items-center gap-3 justify-self-end ml-auto">
              <Link
                href="/outils"
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Outils
              </Link>
              <Link
                href="/assistant"
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Chat
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Rankings
              </Link>
              {selectedToolsForComparison.length >= 2 ? (
                <Link
                  href={`/outils/comparer`}
                  className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  Comparer ({selectedToolsForComparison.length})
                </Link>
              ) : null}
              {/* User Profile - Round Avatar */}
              <button className="w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-colors" style={{ backgroundColor: "#1e3a8a" }}>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start gap-4">
            <Link href="/outils" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {tool.websiteUrl ? (
                <img
                  src={getFaviconUrl(tool.websiteUrl, 64)}
                  alt={`${tool.name} favicon`}
                  className="w-10 h-10 rounded"
                  referrerPolicy="no-referrer"
                />
              ) : tool.logoUrl ? (
                <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-cover" />
              ) : (
                <Eye className="w-7 h-7 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{tool.name}</h1>
                {tool.featured && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">En vedette</span>
                )}
              </div>
              {tool.tagline && <p className="text-gray-700 mt-1">{tool.tagline}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">{(tool.allCategories || []).join(" • ") || tool.category}</span>
                <span className="text-gray-300">•</span>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={`${tag}-${i}`} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleUpvote}
                className={`px-4 py-3 rounded-xl font-semibold flex items-center gap-2 border transition ${hasUpvoted ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"}`}
              >
                <Heart className={`w-4 h-4 ${hasUpvoted ? "fill-white" : "text-rose-600"}`} />
                Upvote
                <span className="text-sm opacity-80">{upvoteCount}</span>
              </button>
              <button
                onClick={toggleBookmark}
                className={`p-3 rounded-xl border transition ${isBookmarked ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"}`}
                title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "" : "text-blue-600"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {(tool.screenshots && tool.screenshots.length > 0) || tool.demoUrl ? (
              <div className="bg-white rounded-2xl p-4">
                <div className="flex gap-4">
                  <div className="hidden md:flex md:flex-col gap-2 w-24">
                    {[...(tool.screenshots || []), ...(tool.demoUrl ? [tool.demoUrl] : [])].map((src, idx) => (
                      <button key={idx} onClick={() => setActiveMediaIndex(idx)} className={`h-16 w-24 rounded-lg overflow-hidden border ${activeMediaIndex === idx ? "border-blue-600" : "border-gray-200"}`}>
                        <img src={src} alt={`media-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-h-[240px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    {(() => {
                      const medias = [...(tool.screenshots || []), ...(tool.demoUrl ? [tool.demoUrl] : [])]
                      const src = medias[activeMediaIndex] || medias[0]
                      return src ? <img src={src} alt="media" className="w-full h-full object-cover" /> : null
                    })()}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-white rounded-2xl p-6">
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

            {/* Tabs */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="flex space-x-2 px-6 pt-6 pb-2 border-b border-gray-100">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <TransitionPanel
                  activeIndex={activeTab}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  variants={{
                    enter: { opacity: 0, y: -20, filter: "blur(4px)" },
                    center: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: 20, filter: "blur(4px)" },
                  }}
                >
                  {tabs.map((tab, index) => (
                    <div key={index}>{tab.content}</div>
                  ))}
                </TransitionPanel>
              </div>
            </div>

            {/* Reviews Section - Outside tabs, no background */}
            <div className="space-y-6">
              {/* Expandable Review Form */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setIsReviewFormExpanded(!isReviewFormExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Écrire un avis</span>
                  </div>
                  {isReviewFormExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>

                {isReviewFormExpanded && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {/* Star Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{reviewRating}/5</span>
                      </div>
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 p-2 bg-white border border-gray-200 rounded-t-lg">
                        <button
                          type="button"
                          onClick={() => setReviewText(prev => prev + "**texte en gras**")}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Gras"
                        >
                          <Bold className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewText(prev => prev + "*texte en italique*")}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Italique"
                        >
                          <Italic className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewText(prev => prev + "\n- Élément de liste")}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Liste"
                        >
                          <List className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Partagez votre expérience avec cet outil..."
                        className="w-full px-4 py-3 border border-t-0 border-gray-200 rounded-b-lg min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setIsReviewFormExpanded(false)
                          setReviewText("")
                          setReviewRating(5)
                        }}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          if (reviewText.trim()) {
                            handleAddReview(reviewRating, reviewText)
                            setIsReviewFormExpanded(false)
                            setReviewText("")
                            setReviewRating(5)
                          }
                        }}
                        disabled={!reviewText.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Publier l'avis
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {[
                  {
                    user: "Marie Dupont",
                    avatar: "MD",
                    rating: 5,
                    comment: "Excellent outil ! J'ai pu augmenter ma productivité de 40% depuis que je l'utilise. L'interface est intuitive et les fonctionnalités sont très complètes.",
                    date: "2024-12-15"
                  },
                  {
                    user: "Jean Martin",
                    avatar: "JM",
                    rating: 5,
                    comment: "Une révélation pour notre équipe. L'intégration avec nos outils existants s'est faite sans aucun problème. Je recommande vivement !",
                    date: "2024-12-10"
                  },
                  {
                    user: "Sophie Bernard",
                    avatar: "SB",
                    rating: 4,
                    comment: "Très bon produit dans l'ensemble. Quelques petites améliorations possibles au niveau de l'interface mobile, mais rien de bloquant.",
                    date: "2024-12-05"
                  },
                  {
                    user: "Pierre Leroy",
                    avatar: "PL",
                    rating: 5,
                    comment: "Le support client est exceptionnel. J'avais un problème technique qui a été résolu en moins de 2 heures. Bravo à l'équipe !",
                    date: "2024-11-28"
                  }
                ].map((review, index) => (
                  <div key={index} className="bg-white rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
                        {review.avatar}
                      </div>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-[220px] h-fit z-30">
            <div className="bg-white rounded-2xl p-6">
              <Button onClick={handleVisitWebsite} className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Visiter le site
              </Button>
              {tool.demoUrl && (
                <a href={tool.demoUrl} target="_blank" rel="noreferrer" className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FileText className="w-4 h-4" /> Voir la démo
                </a>
              )}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Tarification</div>
                <div className="text-lg font-semibold text-gray-900">{tool.price}</div>
                <div className="text-sm text-gray-500">{tool.priceType}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tool.api_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{tool.api_available ? "Disponible" : "Non"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open Source</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tool.open_source ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{tool.open_source ? "Oui" : "Non"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Self-hosted</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tool.self_hosted_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{tool.self_hosted_available ? "Disponible" : "Non"}</span>
                </div>
              </div>
            </div>

            {tool.integrations && tool.integrations.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Intégrations</h4>
                <div className="flex flex-wrap gap-2">
                  {tool.integrations.slice(0, 12).map((name, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs">{name}</span>
                  ))}
                </div>
              </div>
            )}

            {tool.platforms && tool.platforms.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Plateformes</h4>
                <div className="flex flex-wrap gap-2">
                  {tool.platforms.map((p, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs">{p}</span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modals */}
        <AllReviewsModal isOpen={isAllReviewsModalOpen} onClose={() => setIsAllReviewsModalOpen(false)} toolName={tool.name} reviews={tool.userReviews || []} overallRating={tool.rating} reviewCount={tool.reviews} />
        <WriteReviewModal isOpen={isWriteReviewModalOpen} onClose={() => setIsWriteReviewModalOpen(false)} toolName={tool.name} onAddReview={handleAddReview} />
        <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />
      </div>
    </div>
  )
}
