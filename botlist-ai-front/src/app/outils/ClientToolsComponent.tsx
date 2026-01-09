"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search,
  X,
  ExternalLink,
  FileText,
  ChevronUp,
  ChevronDown,
  Headphones,
  BarChart2,
  PencilRuler,
  Settings,
  TrendingUp,
  Target,
  Filter,
  Check,
  Plus,
  Star,
  Zap,
  Globe,
  Clock,
  Shield,
  BarChart,
  Sparkles,
  Rocket,
  Layers,
  Share2,
  MessageSquare,
  MessageCircle,
  Smartphone,
  LogOut,
  User,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import AiAssistantModal from "@/components/ui/ai-assistant-modal"
import AllReviewsModal from "@/components/ui/all-reviews-modal"
import WriteReviewModal from "@/components/ui/write-review-modal"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { getFaviconUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

// ============================================
// Avatar Component with Initials
// ============================================

function UserAvatar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const getInitials = () => {
    if (!user) return '?';
    const firstname = user.firstname || '';
    const lastname = user.lastname || '';
    if (firstname && lastname) {
      return `${firstname[0]}${lastname[0]}`.toUpperCase();
    }
    if (firstname) {
      return firstname.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  const hasExternalAvatar = user?.avatar_url || user?.picture || user?.photo_url;

  return (
    <button
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
      type="button"
      onClick={onLogout}
    >
      {hasExternalAvatar ? (
        /* biome-ignore lint/performance/noImgElement: Using img for external avatar */
        <img
          alt={user?.firstname || 'User'}
          className="h-full w-full rounded-full object-cover"
          src={hasExternalAvatar}
        />
      ) : (
        <span className="text-sm">{getInitials()}</span>
      )}
    </button>
  );
}

// ============================================
// Types & Interfaces
// ============================================

interface Review {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
}

interface ToolDisplay {
  id: string
  slug?: string
  name: string
  company: string
  category: string
  allCategories: string[]
  description: string
  fullDescription: string
  tagline: string
  features: string[]
  rating: number
  reviews: number
  price: string
  priceType: string
  functions: string[]
  domains: string[]
  useCases: string[]
  advantages: string[]
  concerns: string[]
  businessValue: string
  roi: string
  integration: string
  capabilities: {
    [key: string]: number
  }
  featured: boolean
  userReviews?: Review[]
  website_url?: string
  logo_url?: string
}

interface Category {
  name: string
  count: number
}

interface ClientToolsComponentProps {
  initialTools: ToolDisplay[]
  categories: Category[]
}

// ============================================
// Utility Functions
// ============================================

const priceRanges = [
  { label: "Gratuit", value: "Gratuit", popular: true, color: "bg-green-100 text-green-700" },
  { label: "Freemium", value: "Freemium", popular: true, color: "bg-blue-100 text-blue-700" },
  { label: "Payant", value: "Payant", popular: true, color: "bg-purple-100 text-purple-700" },
]

const useCaseOptions = [
  "Rédaction de contenu",
  "Génération d'images",
  "Analyse de données",
  "Automatisation des tâches",
  "Service client / Chatbots",
  "Traduction",
  "Transcription audio/vidéo",
  "Recherche & veille",
  "Présentations",
  "Emails & communication",
]

const parseApiDate = (dateString: string): string => {
  try {
    let date: Date
    if (!isNaN(Number(dateString))) {
      date = new Date(Number(dateString))
    } else {
      date = new Date(dateString)
    }
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0]
    }
    return date.toISOString().split("T")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

const matchesPriceRange = (tool: ToolDisplay, selectedRangeValue: string) => {
  return tool.priceType === selectedRangeValue
}

function alphabeticalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
}

const getToolSlug = (tool: ToolDisplay): string => {
  if (tool.slug) return tool.slug
  return tool.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || tool.id
}

// ============================================
// Main Component
// ============================================

export default function ClientToolsComponent({ initialTools, categories }: ClientToolsComponentProps) {
  const router = useRouter()

  // ============================================
  // State Management
  // ============================================

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ============================================
  // Authentication Effects
  // ============================================

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
    // Note: If not authenticated, the middleware will redirect to login
    // We don't do client-side redirect here to avoid hydration issues
  }, []);

  const handleLogout = () => {
    // Unifie la déconnexion: efface cookies + storage et force un reload
    // Ajoute des logs pour valider l'effacement
    import('@/lib/logout').then(({ logoutClient }) => logoutClient('/'))
  };

  const [searchQuery, setSearchQuery] = useState("")
  const [filterSearch, setFilterSearch] = useState("")
  const [selectedTool, setSelectedTool] = useState<ToolDisplay | null>(null)
  const [selectedSecteur, setSelectedSecteur] = useState<string | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null)
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(true)
  const [showAllFunctions, setShowAllFunctions] = useState<Record<string, boolean>>({})
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<ToolDisplay[]>([])
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  const [toolsWithRealRatings, setToolsWithRealRatings] = useState<ToolDisplay[]>(initialTools)

  // ============================================
  // Memoized Data
  // ============================================

  const toolsSummaryForAI = useMemo(() => {
    return initialTools
      .map(
        (tool) =>
          `- ${tool.name} (${tool.category}): Fonctions [${tool.functions.join(", ")}], Domaines [${tool.domains.join(", ")}]. Description: ${tool.description.substring(0, 100)}...`,
      )
      .join("\n")
  }, [initialTools])

  const filteredTools = useMemo(() => {
    return toolsWithRealRatings.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.allCategories?.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.functions.some((func) => func.toLowerCase().includes(searchQuery.toLowerCase()))

      let matchesFilter = true

      if (selectedSecteur !== null) {
        matchesFilter =
          matchesFilter &&
          (tool.allCategories?.includes(selectedSecteur) || tool.category === selectedSecteur)
      }

      if (selectedUseCase !== null) {
        matchesFilter = matchesFilter && tool.useCases.includes(selectedUseCase)
      }

      if (selectedPricing !== null) {
        matchesFilter = matchesFilter && matchesPriceRange(tool, selectedPricing)
      }

      return matchesSearch && matchesFilter
    })
  }, [toolsWithRealRatings, searchQuery, selectedSecteur, selectedUseCase, selectedPricing])

  // ============================================
  // Filter Helper Functions
  // ============================================

  const getCategoryFunctions = useCallback(
    (categoryName: string) => {
      const functions = new Set<string>()
      initialTools.forEach((tool) => {
        if (tool.allCategories?.includes(categoryName)) {
          tool.functions.forEach((func) => functions.add(func))
        }
      })
      const filteredFunctions = Array.from(functions).filter((func) =>
        func.toLowerCase().includes(filterSearch.toLowerCase()),
      )
      return filteredFunctions.sort(alphabeticalCompare)
    },
    [initialTools, filterSearch],
  )

  const getAllUniqueDomains = useCallback(() => {
    const domains = new Set<string>()
    initialTools.forEach((tool) => {
      tool.domains.forEach((domain) => domains.add(domain))
    })
    const filteredDomains = Array.from(domains).filter((domain) =>
      domain.toLowerCase().includes(filterSearch.toLowerCase()),
    )
    return filteredDomains.sort(alphabeticalCompare)
  }, [initialTools, filterSearch])

  const getAllUniqueSecteurs = useCallback(() => {
    const names = (categories || []).map((c) => c.name)
    const unique = Array.from(new Set(names))
    if (unique.length === 0) {
      const fallback = [
        "Marketing & Communication",
        "Ressources Humaines",
        "Juridique & Conformité",
        "Finance & Comptabilité",
        "Ventes & CRM",
        "Design & Création",
        "Développement & IT",
        "Santé & Médical",
        "Éducation & Formation",
        "E-commerce & Retail",
        "Immobilier",
        "Consulting",
      ]
      return fallback
        .filter((name) => name.toLowerCase().includes(filterSearch.toLowerCase()))
        .sort(alphabeticalCompare)
    }
    const filtered = unique.filter((name) => name.toLowerCase().includes(filterSearch.toLowerCase()))
    return filtered.sort(alphabeticalCompare)
  }, [categories, filterSearch])

  const getAllUniqueUseCases = useCallback(() => {
    const filteredUseCases = useCaseOptions.filter((useCase) =>
      useCase.toLowerCase().includes(filterSearch.toLowerCase()),
    )
    return filteredUseCases.sort(alphabeticalCompare)
  }, [filterSearch])

  // ============================================
  // Icon Helpers
  // ============================================

  const getFunctionIcon = (functionName: string) => {
    const iconClass = "w-4 h-4"
    switch (functionName) {
      case "Conversation":
        return <MessageSquare className={iconClass} style={{ color: "#1e40af" }} />
      case "Traduction":
        return <Globe className={iconClass} style={{ color: "#2563eb" }} />
      case "Chatbot":
        return <MessageCircle className={iconClass} style={{ color: "#7c3aed" }} />
      case "Assistant virtuel":
        return <Smartphone className={iconClass} style={{ color: "#059669" }} />
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
      case "Productivité":
        return <Rocket className={iconClass} style={{ color: "#0ea5e9" }} />
      default:
        return <Layers className={iconClass} style={{ color: "#6366f1" }} />
    }
  }

  // ============================================
  // Event Handlers
  // ============================================

  const handleSecteurToggle = (secteurName: string) => {
    setSelectedSecteur((prev) => (prev === secteurName ? null : secteurName))
  }

  const handleUseCaseToggle = (useCaseName: string) => {
    setSelectedUseCase((prev) => (prev === useCaseName ? null : useCaseName))
  }

  const handlePricingToggle = (pricingValue: string) => {
    setSelectedPricing((prev) => (prev === pricingValue ? null : pricingValue))
  }

  const handleToggleToolForComparison = (tool: ToolDisplay) => {
    setSelectedToolsForComparison((prev) => {
      if (prev.some((t) => t.id === tool.id)) {
        return prev.filter((t) => t.id !== tool.id)
      } else if (prev.length < 3) {
        return [...prev, tool]
      }
      return prev
    })
  }

  const handleRemoveToolFromComparison = (toolId: string) => {
    setSelectedToolsForComparison((prev) => prev.filter((t) => t.id !== toolId))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterSearch("")
    setSelectedSecteur(null)
    setSelectedUseCase(null)
    setSelectedPricing(null)
    setShowAllFunctions({})
  }

  const checkUserAuthentication = (): boolean => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")
    return !!(token && userData)
  }

  const navigateToTool = (tool: ToolDisplay) => {
    const slug = getToolSlug(tool)
    router.push(`/outils/${slug}`)
  }

  // ============================================
  // Reviews Management
  // ============================================

  const loadToolReviews = async (toolId: string): Promise<Review[]> => {
    try {
      const reviewsData = await apiClient.getReviews(toolId)
      if (!reviewsData || reviewsData.length === 0) return []

      const reviewsForThisTool = reviewsData.filter((review) => review.tool?.id === toolId)

      return reviewsForThisTool.map((review) => ({
        id: review.id,
        user: `${review.user.firstname} ${review.user.lastname}`,
        avatar: `${review.user.firstname.charAt(0)}${review.user.lastname.charAt(0)}`,
        rating: review.rating,
        comment: review.comment,
        date: parseApiDate(review.created_at),
      }))
    } catch (error) {
      console.error("Erreur lors du chargement des reviews:", error)
      return []
    }
  }

  const handleToolDetailClick = async (tool: ToolDisplay) => {
    try {
      const realReviews = await loadToolReviews(tool.id)

      let finalRating: number = tool.rating || 0

      if (realReviews && realReviews.length > 0) {
        const validReviews = realReviews.filter(
          (review) =>
            typeof review.rating === "number" &&
            !isNaN(review.rating) &&
            isFinite(review.rating) &&
            review.rating >= 1 &&
            review.rating <= 5,
        )

        if (validReviews.length > 0) {
          const totalRating = validReviews.reduce((sum, review) => sum + review.rating, 0)
          const calculatedAverage = totalRating / validReviews.length
          if (typeof calculatedAverage === "number" && !isNaN(calculatedAverage) && isFinite(calculatedAverage)) {
            finalRating = calculatedAverage
          }
        }
      }

      const safeRating =
        typeof finalRating === "number" && !isNaN(finalRating) && isFinite(finalRating)
          ? Number(finalRating.toFixed(1))
          : 0

      setSelectedTool({
        ...tool,
        userReviews: realReviews || [],
        rating: safeRating,
        reviews: realReviews ? realReviews.length : 0,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
      setSelectedTool({
        ...tool,
        userReviews: [],
        rating: tool.rating || 0,
        reviews: 0,
      })
    }
  }

  const handleWriteReviewClick = () => {
    if (!checkUserAuthentication()) {
      alert("Vous devez être connecté pour écrire un avis")
      return
    }
    setIsWriteReviewModalOpen(true)
  }

  const handleAddReview = async (rating: number, comment: string) => {
    if (!selectedTool) return

    try {
      const userDataString = localStorage.getItem("user_data")
      if (!userDataString) {
        console.error("Utilisateur non connecté")
        return
      }

      const userData = JSON.parse(userDataString)

      const newReviewData = await apiClient.createReview({
        rating,
        comment,
        tool_id: selectedTool.id,
        user_id: userData.id,
      })

      const newReview: Review = {
        id: newReviewData.id,
        user: `${newReviewData.user.firstname} ${newReviewData.user.lastname}`,
        avatar: `${newReviewData.user.firstname.charAt(0)}${newReviewData.user.lastname.charAt(0)}`,
        rating: newReviewData.rating,
        comment: newReviewData.comment,
        date: parseApiDate(newReviewData.created_at),
      }

      setSelectedTool((prevTool) => {
        if (!prevTool) return null

        const updatedReviews = [...(prevTool.userReviews || []), newReview]
        const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0)
        const newOverallRating = totalRating / updatedReviews.length

        return {
          ...prevTool,
          userReviews: updatedReviews,
          rating: Number.parseFloat(newOverallRating.toFixed(1)),
          reviews: updatedReviews.length,
        }
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout de la review:", error)
    }
  }

  const loadAllToolsRatings = async () => {
    const updatedTools = await Promise.all(
      initialTools.map(async (tool) => {
        const reviews = await loadToolReviews(tool.id)
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
          const averageRating = totalRating / reviews.length
          return {
            ...tool,
            rating: Number.parseFloat(averageRating.toFixed(1)),
            reviews: reviews.length,
            userReviews: reviews,
          }
        }
        return tool
      }),
    )
    setToolsWithRealRatings(updatedTools)
  }

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    loadAllToolsRatings()
  }, [])

  useEffect(() => {
    try {
      const ids = selectedToolsForComparison.map((t) => t.id)
      localStorage.setItem("compare_tool_ids", ids.join(","))
      localStorage.setItem("compare_tools_data", JSON.stringify(selectedToolsForComparison))
    } catch {}
  }, [selectedToolsForComparison])

  useEffect(() => {
    const params = new URLSearchParams()

    if (selectedSecteur) {
      params.set("secteurs", selectedSecteur)
    }
    if (selectedUseCase) {
      params.set("use_cases", selectedUseCase)
    }
    if (selectedPricing) {
      params.set("pricing", selectedPricing)
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const url = `${baseUrl}/tools/realtime${params.toString() ? `?${params.toString()}` : ""}`

    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const apiTools = JSON.parse(e.data) as any[]

        const next = apiTools.map((t: any) => {
          const categoryNames = Array.isArray(t.category)
            ? t.category.map((c: any) => c?.name).filter(Boolean)
            : t.category?.name
              ? [t.category.name]
              : []

          const priceType =
            t.pricing_model === "free"
              ? "Gratuit"
              : t.pricing_model === "freemium"
                ? "Freemium"
                : t.pricing_model === "paid"
                  ? "Abonnement"
                  : t.pricing_model === "enterprise"
                    ? "Enterprise"
                    : t.pricing_model === "api_based"
                      ? "API"
                      : "Autre"

          const price =
            t.pricing_model === "free"
              ? "Gratuit"
              : t.pricing_model === "freemium"
                ? t.pricing_details?.startingPrice || "Freemium"
                : t.pricing_model === "paid"
                  ? t.pricing_details?.price || "Payant"
                  : t.pricing_model === "enterprise"
                    ? "Sur devis"
                    : t.pricing_model === "api_based"
                      ? t.pricing_details?.apiPrice || "Usage API"
                      : "Prix non spécifié"

          const features = Array.isArray(t.features) ? t.features : []
          const useCases = Array.isArray(t.use_cases) ? t.use_cases : []

          return {
            id: t.id,
            name: t.name,
            slug: t.slug,
            company: categoryNames[0] || "Non spécifié",
            category: categoryNames[0] || "Général",
            allCategories: categoryNames,
            description: t.description,
            fullDescription: t.long_description || t.description,
            tagline: t.tagline || "",
            features: features,
            rating: typeof t.overall_rating === "number" ? t.overall_rating : 0,
            reviews: typeof t.review_count === "number" ? t.review_count : 0,
            price,
            priceType,
            functions: features,
            domains: useCases,
            useCases,
            advantages: [],
            concerns: [],
            businessValue: "Améliore l'efficacité opérationnelle et réduit les coûts",
            roi: t.pricing_model === "free" ? "1-2 mois" : "3-6 mois",
            integration: `Intégration via API${t.api_available ? " disponible" : " limitée"}. ${t.integrations?.length ? `Compatible avec ${t.integrations.join(", ")}.` : ""}`,
            capabilities: {
              "Capacité IA": t.performance_score || 80,
              "Facilité d'usage": t.ease_of_use_score || 75,
              Intégration: t.integrations?.length ? Math.min(t.integrations.length * 20, 100) : 70,
              Sécurité: (t.gdpr_compliant ? 25 : 0) + (t.soc2_certified ? 25 : 0) + (t.hipaa_compliant ? 25 : 0) + 25,
              Évolutivité: t.value_for_money_score || 80,
            },
            featured: !!t.featured,
            website_url: t.website_url,
          } as ToolDisplay
        })

        setToolsWithRealRatings(next)
      } catch (err) {
        console.error("SSE parse error:", err)
      }
    }

    es.onerror = (err) => {
      console.error("SSE error:", err)
    }

    return () => {
      try {
        es.close()
      } catch {}
    }
  }, [selectedSecteur, selectedPricing])

  // ============================================
  // Computed Values
  // ============================================

  const activeFilterCount = (selectedSecteur ? 1 : 0) + (selectedUseCase ? 1 : 0) + (selectedPricing ? 1 : 0)
  const reviewsToDisplay = selectedTool?.userReviews?.slice(0, 2) || []
  const hasMoreReviews = (selectedTool?.userReviews?.length || 0) > 2

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ============================================ */}
      {/* Header */}
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f4f7fa] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            {/* Actions à droite */}
            <div className="flex items-center gap-6 justify-self-end ml-auto">
              <Link href="/outils" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Outils
              </Link>
              <Link href="/assistant" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Chat
              </Link>
              <Link href="/classement" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Classement
              </Link>
              {isAuthenticated && currentUser ? (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                      type="button"
                    >
                      <span className="text-sm">
                        {currentUser?.firstname && currentUser?.lastname
                          ? `${currentUser.firstname[0]}${currentUser.lastname[0]}`.toUpperCase()
                          : currentUser?.firstname?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "?"}
                      </span>
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="w-48 bg-white rounded-lg shadow-lg border p-2 z-50"
                      sideOffset={5}
                      align="end"
                    >
                      <div className="px-3 py-2 border-b mb-2">
                        <p className="font-medium text-gray-900 truncate">
                          {currentUser?.firstname && currentUser?.lastname
                            ? `${currentUser.firstname} ${currentUser.lastname}`
                            : currentUser?.firstname || currentUser?.email?.split("@")[0] || "Utilisateur"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <User size={16} />
                          <span>Mon profil</span>
                        </Link>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* ============================================ */}
        {/* Filters Sidebar */}
        {/* ============================================ */}
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            {/* Filter Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Effacer
                  </button>
                  <button
                    onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
                    className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {isFilterSectionOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {isFilterSectionOpen && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedSecteur && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {selectedSecteur}
                      <button onClick={() => setSelectedSecteur(null)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedUseCase && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {selectedUseCase}
                      <button onClick={() => setSelectedUseCase(null)} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedPricing && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      {priceRanges.find((r) => r.value === selectedPricing)?.label}
                      <button onClick={() => setSelectedPricing(null)} className="hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filter Content */}
            {isFilterSectionOpen && (
              <div className="p-5 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {/* Search in Filters */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Secteurs */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Secteurs d'activité</h4>
                  <select
                    value={selectedSecteur || ""}
                    onChange={(e) => setSelectedSecteur(e.target.value || null)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les secteurs</option>
                    {getAllUniqueSecteurs().map((secteur) => (
                      <option key={secteur} value={secteur}>
                        {secteur}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cas d'usage */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Cas d'usage</h4>
                  <select
                    value={selectedUseCase || ""}
                    onChange={(e) => setSelectedUseCase(e.target.value || null)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les cas d'usage</option>
                    {getAllUniqueUseCases().map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarification */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Tarification</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label
                        key={range.value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                          selectedPricing === range.value
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-slate-50 border border-transparent",
                        )}
                      >
                        <input
                          type="radio"
                          name="pricing"
                          value={range.value}
                          checked={selectedPricing === range.value}
                          onChange={() => setSelectedPricing(range.value === selectedPricing ? null : range.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{range.label}</span>
                        {range.popular && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 ml-auto">
                            Populaire
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================ */}
        {/* Main Content */}
        {/* ============================================ */}
        <main className="flex-1">
          {/* Results Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Découvrez les outils IA pour votre entreprise
            </h1>
            <p className="text-slate-600">
              <span className="font-semibold text-blue-600">{filteredTools.length} outils</span> disponibles pour
              optimiser votre productivité
            </p>
          </div>

          {/* Tools List */}
          <div className="space-y-4">
            {filteredTools.map((tool) => {
              const isToolSelectedForComparison = selectedToolsForComparison.some((t) => t.id === tool.id)
              const canAddMoreForComparison = selectedToolsForComparison.length < 3
              const slug = getToolSlug(tool)

              return (
                <div
                  key={tool.id}
                  onClick={() => navigateToTool(tool)}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {tool.website_url ? (
                        <img
                          src={getFaviconUrl(tool.website_url, 64)}
                          alt={tool.name}
                          className="w-14 h-14 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                          {tool.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {tool.featured && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                                <Star className="w-3 h-3 mr-1 fill-amber-500" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{tool.company}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5">
                              {renderStars(tool.rating)}
                            </span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <a
                            href={tool.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Visiter le site"
                          >
                            <ExternalLink className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleToolForComparison(tool)
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isToolSelectedForComparison
                                ? "bg-amber-100 text-amber-600"
                                : canAddMoreForComparison
                                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
                            )}
                            disabled={!isToolSelectedForComparison && !canAddMoreForComparison}
                          >
                            {isToolSelectedForComparison ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-sm mt-3 line-clamp-2">{tool.description}</p>

                      {/* Tagline & Features & Price - on one line */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                          {tool.tagline && (
                            <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 font-semibold text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors whitespace-nowrap">
                              {tool.tagline}
                            </span>
                          )}
                          {tool.features && tool.features.length > 0 && (
                            <>
                              {tool.features.slice(0, 2).map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 font-semibold text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors whitespace-nowrap"
                                >
                                  {feature}
                                </span>
                              ))}
                              {tool.features.length > 2 && (
                                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 font-semibold text-xs bg-slate-100 text-slate-600 whitespace-nowrap">
                                  +{tool.features.length - 2}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-lg font-bold text-slate-900 whitespace-nowrap flex-shrink-0">
                          {tool.price.split("-")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun outil trouvé</h3>
              <p className="text-slate-600 mb-4">Essayez d'ajuster vos filtres ou votre recherche</p>
              <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700">
                Effacer les filtres
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ============================================ */}
      {/* Comparison Bar */}
      {/* ============================================ */}
      {selectedToolsForComparison.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">
                {selectedToolsForComparison.length} outil{selectedToolsForComparison.length > 1 ? "s" : ""} sélectionné
                {selectedToolsForComparison.length > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                {selectedToolsForComparison.map((tool) => (
                  <div key={tool.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                    <span className="text-sm text-slate-700 truncate max-w-[120px]">{tool.name}</span>
                    <button
                      onClick={() => handleRemoveToolFromComparison(tool.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/outils/comparer"
              className="px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
              style={{ backgroundColor: "rgb(254, 243, 198)", color: "rgb(120, 53, 15)" }}
            >
              Comparer ({selectedToolsForComparison.length})
            </Link>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Modals */}
      {/* ============================================ */}
      <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />

      {selectedTool && (
        <>
          <AllReviewsModal
            isOpen={isAllReviewsModalOpen}
            onClose={() => setIsAllReviewsModalOpen(false)}
            toolName={selectedTool.name}
            reviews={selectedTool.userReviews || []}
            overallRating={selectedTool.rating}
            reviewCount={selectedTool.reviews}
          />
          <WriteReviewModal
            isOpen={isWriteReviewModalOpen}
            onClose={() => setIsWriteReviewModalOpen(false)}
            toolName={selectedTool.name}
            onAddReview={handleAddReview}
          />
        </>
      )}
    </div>
  )
}
