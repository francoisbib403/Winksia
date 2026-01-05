"use client"
import { useState, useMemo, useEffect } from "react"
import {
  Search,
  MessageSquare,
  Bookmark,
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
  Cloud,
  Brain,
  MessageCircle,
  Smartphone,
  Filter,
  Check,
  Plus,
  ArrowLeft,
  Star,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import AiAssistantModal from "@/components/ui/ai-assistant-modal" // Chemin d'importation corrigé
import AllReviewsModal from "@/components/ui/all-reviews-modal" // Nouveau chemin d'importation
import WriteReviewModal from "@/components/ui/write-review-modal" // Nouveau chemin d'importation
import Link from "next/link"
import { Button } from "@/components/ui/button" // Import de Button
import { apiClient } from "@/lib/api-client"

import { getFaviconUrl } from "@/lib/utils"

interface Review {
  id: string
  user: string
  avatar: string // URL or initial for avatar
  rating: number
  comment: string
  date: string
}

interface ToolDisplay {
  id: string
  name: string
  company: string
  category: string
   allCategories: string[] // AJOUT : Pour le filtrage
  description: string
  fullDescription: string
  tagline?: string // Tagline de l'outil
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
  capabilities: {
    [key: string]: number
  }
  featured: boolean
  userReviews?: Review[] // Add userReviews to ToolDisplay
  website_url?: string
}

interface Category {
  name: string
  count: number
}

interface ClientToolsComponentProps {
  initialTools: ToolDisplay[]
  categories: Category[]
}

const priceRanges = [
  { label: "Gratuit", value: "Gratuit", dbValue: "included", popular: true },
  { label: "Freemium", value: "Freemium", dbValue: "freemium", popular: true },
  { label: "Payant", value: "Payant", dbValue: "paid", popular: true },
  { label: "Open Source", value: "Open Source", dbValue: "open_source" },
]
// Les options de secteurs sont dérivées des catégories réelles reçues via props
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
   "Emails & communication"
 ]

// 2. FONCTION UTILITAIRE - Ajouter après tes imports, AVANT le composant
const parseApiDate = (dateString: string): string => {
  try {
    let date: Date

    if (!isNaN(Number(dateString))) {
      date = new Date(Number(dateString))
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      console.warn("Date invalide reçue de l'API:", dateString)
      return new Date().toISOString().split("T")[0]
    }

    return date.toISOString().split("T")[0]
  } catch (error) {
    console.warn("Erreur lors du parsing de la date:", dateString, error)
    return new Date().toISOString().split("T")[0]
  }
}

const matchesPriceRange = (tool: ToolDisplay, selectedRangeValue: string) => {
  return tool.priceType === selectedRangeValue
}

// Fonction pour convertir la valeur UI vers la valeur DB
const getDbValueFromUiValue = (uiValue: string) => {
  const range = priceRanges.find(r => r.value === uiValue)
  return range?.dbValue || uiValue
}

export default function ClientToolsComponent({ initialTools, categories }: ClientToolsComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSearch, setFilterSearch] = useState("")
  const [selectedTool, setSelectedTool] = useState<ToolDisplay | null>(null)
  const [selectedSecteur, setSelectedSecteur] = useState<string | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null)
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(true)
  const [showAllFunctions, setShowAllFunctions] = useState<Record<string, boolean>>({})
  const [showAllDomains, setShowAllDomains] = useState(false)
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<ToolDisplay[]>([])
  // Suppression du modal de comparaison: on bascule vers une page dédiée
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false) // New state for All Reviews Modal
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false) // New state for Write Review Modal
  const [toolsWithRealRatings, setToolsWithRealRatings] = useState<ToolDisplay[]>(initialTools)

  // Génère un résumé concis des outils pour l'assistant IA
  const toolsSummaryForAI = useMemo(() => {
    return initialTools
      .map(
        (tool) =>
          `- ${tool.name} (${tool.category}): Fonctions [${tool.functions.join(", ")}], Domaines [${tool.domains.join(", ")}]. Description: ${tool.description.substring(0, 100)}...`,
      )
      .join("\n")
  }, [initialTools])

  // Filtrage des outils
  const filteredTools = useMemo(() => {
    return toolsWithRealRatings.filter((tool) => {
   const matchesSearch =
  tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
  tool.allCategories?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
  tool.functions.some((func) => func.toLowerCase().includes(searchQuery.toLowerCase()))
  
      let matchesFilter = true
      
      // Apply all filters simultaneously
      if (selectedSecteur !== null) {
        matchesFilter = matchesFilter && (
          tool.allCategories?.includes(selectedSecteur) ||
          tool.category === selectedSecteur
        )
      }
      
      if (selectedUseCase !== null) {
        matchesFilter = matchesFilter && tool.useCases.includes(selectedUseCase)
      }
      
      if (selectedPricing !== null) {
        matchesFilter = matchesFilter && matchesPriceRange(tool, selectedPricing)
      }

      return matchesSearch && matchesFilter
    })
  }, [initialTools, searchQuery, selectedSecteur, selectedUseCase, selectedPricing])

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
    setShowAllDomains(false)
  }

  /**
   * Compare deux chaînes de caractères de façon alphabétique.
   */
  function alphabeticalCompare(a: string, b: string): number {
    return a.localeCompare(b, undefined, {
      sensitivity: "base",
      numeric: true,
    })
  }

  const getCategoryFunctions = (categoryName: string) => {
  const functions = new Set<string>()
  initialTools.forEach((tool) => {
    // CORRECTION : Vérifier dans toutes les catégories
    if (tool.allCategories?.includes(categoryName)) {
      tool.functions.forEach((func) => functions.add(func))
    }
  })
  const filteredFunctions = Array.from(functions).filter((func) =>
    func.toLowerCase().includes(filterSearch.toLowerCase()),
  )
  return filteredFunctions.sort(alphabeticalCompare)
}
  const getAllUniqueDomains = () => {
    const domains = new Set<string>()
    initialTools.forEach((tool) => {
      tool.domains.forEach((domain) => domains.add(domain))
    })
    const filteredDomains = Array.from(domains).filter((domain) =>
      domain.toLowerCase().includes(filterSearch.toLowerCase()),
    )
    // idem pour les domaines
    return filteredDomains.sort(alphabeticalCompare)
  }

  const getAllUniqueSecteurs = () => {
    // Utiliser les catégories réelles passées au composant, sinon fallback statique
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
  }
  const getAllUniqueUseCases = () => {
    const filteredUseCases = useCaseOptions.filter((useCase) =>
      useCase.toLowerCase().includes(filterSearch.toLowerCase()),
    )
    return filteredUseCases.sort(alphabeticalCompare)
  }

  const getFunctionIcon = (functionName: string) => {
    switch (functionName) {
      case "Conversation":
        return <MessageSquare className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Traduction":
        return <Brain className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Chatbot":
        return <MessageCircle className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Assistant virtuel":
        return <Smartphone className="w-4 h-4" style={{ color: "#2563eb" }} />
      default:
        return <FileText className="w-4 h-4" style={{ color: "#2563eb" }} />
    }
  }

  const getDomainIcon = (domainName: string) => {
    switch (domainName) {
      case "Service Client":
        return <Headphones className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Analyse de Données":
        return <BarChart2 className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Création de Contenu":
        return <PencilRuler className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Automatisation des Processus":
        return <Settings className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Ventes":
        return <TrendingUp className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Marketing":
        return <Target className="w-4 h-4" style={{ color: "#2563eb" }} />
      case "Productivité":
        return <Cloud className="w-4 h-4" style={{ color: "#2563eb" }} />
      default:
        return <FileText className="w-4 h-4" style={{ color: "#2563eb" }} />
    }
  }

  const getIconBg = (name: string) => {
    return "#dbeafe"
  }

  const activeFilterCount = (selectedSecteur ? 1 : 0) + (selectedUseCase ? 1 : 0) + (selectedPricing ? 1 : 0)

  const checkUserAuthentication = (): boolean => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")
    return !!(token && userData)
  }

  // ✅ Fonction pour charger les reviews d'un outil
  // ✅ REMPLACEZ votre fonction loadToolReviews par celle-ci pour debug :

  const loadToolReviews = async (toolId: string) => {
    try {
      console.log(`🔄 === DÉBUT DEBUG REVIEWS ===`)
      console.log(`🎯 Tool ID demandé: "${toolId}"`)

      // Test 1: Vérifier l'URL construite
      const testUrl = `/reviews?tool_id=${toolId}`
      console.log(`🔗 URL qui sera appelée: ${testUrl}`)

      // Test 2: Appel API avec debug
      console.log(`📞 Appel API en cours...`)
      const reviewsData = await apiClient.getReviews(toolId)
      console.log(`📥 Données brutes reçues:`, reviewsData)
      console.log(`📊 Nombre total de reviews reçues:`, reviewsData?.length || 0)

      // Test 3: Vérifier le contenu des reviews
      if (reviewsData && reviewsData.length > 0) {
        console.log(`🔍 Première review pour analyse:`, reviewsData[0])
        console.log(`🏷️ Tool ID de la première review:`, reviewsData[0]?.tool?.id)

        // Test 4: Filtrage explicite
        const reviewsForThisTool = reviewsData.filter((review) => {
          const reviewToolId = review.tool?.id
          console.log(`🆔 Comparaison: review.tool.id="${reviewToolId}" vs toolId="${toolId}"`)
          return reviewToolId === toolId
        })

        console.log(`🎯 Reviews filtrées pour cet outil:`, reviewsForThisTool.length)

        const reviews: Review[] = reviewsForThisTool.map((review) => ({
          id: review.id,
          user: `${review.user.firstname} ${review.user.lastname}`,
          avatar: `${review.user.firstname.charAt(0)}${review.user.lastname.charAt(0)}`,
          rating: review.rating,
          comment: review.comment,
          date: parseApiDate(review.created_at),
        }))

        console.log(`✅ Reviews finales à afficher:`, reviews)
        console.log(`🔄 === FIN DEBUG REVIEWS ===`)
        return reviews
      }

      console.log(`⚠️ Aucune review trouvée`)
      console.log(`🔄 === FIN DEBUG REVIEWS ===`)
      return []
    } catch (error) {
      console.error("❌ Erreur lors du chargement des reviews:", error)
      console.log(`🔄 === FIN DEBUG REVIEWS (ERREUR) ===`)
      return []
    }
  }

  // ✅ Fonction pour ouvrir les détails d'un outil (AVEC les vraies reviews)
  const handleToolDetailClick = async (tool: ToolDisplay) => {
    console.log(`🔍 Ouverture des détails pour: ${tool.name}`)

    try {
      // ✅ TOUJOURS charger les vraies reviews depuis l'API
      const realReviews = await loadToolReviews(tool.id)
      console.log(`📥 Reviews chargées: ${realReviews.length}`)

      // Calcul de la note moyenne
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

      // ✅ FORCER la mise à jour avec les vraies reviews
      setSelectedTool({
        ...tool,
        userReviews: realReviews || [], // ✅ VRAIES REVIEWS ICI
        rating: safeRating,
        reviews: realReviews ? realReviews.length : 0,
      })
    } catch (error) {
      console.error("❌ Erreur lors du chargement des détails de l'outil:", error)
      setSelectedTool({
        ...tool,
        userReviews: [],
        rating: tool.rating || 0,
        reviews: 0,
      })
    }
  }
  // ✅ Fonction pour gérer l'écriture d'avis
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

      console.log("📤 Envoi de la review:", {
        rating,
        comment,
        tool_id: selectedTool.id,
        user_id: userData.id,
      })

      const newReviewData = await apiClient.createReview({
        rating,
        comment,
        tool_id: selectedTool.id,
        user_id: userData.id,
      })

      console.log("📥 Réponse de l'API:", newReviewData)

      const newReview: Review = {
        id: newReviewData.id,
        user: `${newReviewData.user.firstname} ${newReviewData.user.lastname}`,
        avatar: `${newReviewData.user.firstname.charAt(0)}${newReviewData.user.lastname.charAt(0)}`,
        rating: newReviewData.rating,
        comment: newReviewData.comment,
        date: parseApiDate(newReviewData.created_at),
      }

      // ✅ MISE À JOUR IMMÉDIATE DU STATE LOCAL
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

      console.log("✅ Review ajoutée avec succès !")
    } catch (error: any) {
      console.error("❌ Erreur lors de l'ajout de la review:", error)
    }
  }

  const reviewsToDisplay = selectedTool?.userReviews?.slice(0, 2) || []
  const hasMoreReviews = (selectedTool?.userReviews?.length || 0) > 2

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
  useEffect(() => {
    loadAllToolsRatings()
  }, [])

  // Persist selection pour la page de comparaison
  useEffect(() => {
    try {
      const ids = selectedToolsForComparison.map((t) => t.id)
      localStorage.setItem('compare_tool_ids', ids.join(','))
      localStorage.setItem('compare_tools_data', JSON.stringify(selectedToolsForComparison))
    } catch {}
  }, [selectedToolsForComparison])

  /* SSE realtime subscription */
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedSecteur) {
      // Remplace 'categories' par 'secteurs'
      params.set('secteurs', selectedSecteur);
    }
    if (selectedUseCase) {
      // Remplace 'tags' par 'use_cases'
      params.set('use_cases', selectedUseCase);
    }
    if (selectedPricing) {
      // Convertir la valeur UI vers la valeur DB
      const dbValue = getDbValueFromUiValue(selectedPricing)
      params.set('pricing_model', dbValue);
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/tools/realtime${params.toString() ? `?${params.toString()}` : ''}`;

    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const apiTools = JSON.parse(e.data) as any[];

        const next = apiTools.map((t: any) => {
          const categoryNames = Array.isArray(t.category)
            ? t.category.map((c: any) => c?.name).filter(Boolean)
            : (t.category?.name ? [t.category.name] : []);

          const priceType = t.pricing_model === 'free' ? 'Gratuit'
                        : t.pricing_model === 'freemium' ? 'Freemium'
                        : t.pricing_model === 'paid' ? 'Abonnement'
                        : t.pricing_model === 'enterprise' ? 'Enterprise'
                        : t.pricing_model === 'api_based' ? 'API'
                        : 'Autre';

          const price = t.pricing_model === 'free' ? 'Gratuit'
                      : t.pricing_model === 'freemium' ? (t.pricing_details?.startingPrice || 'Freemium')
                      : t.pricing_model === 'paid' ? (t.pricing_details?.price || 'Payant')
                      : t.pricing_model === 'enterprise' ? 'Sur devis'
                      : t.pricing_model === 'api_based' ? (t.pricing_details?.apiPrice || 'Usage API')
                      : 'Prix non spécifié';

          const features = Array.isArray(t.features) ? t.features : [];
          const useCases = Array.isArray(t.use_cases) ? t.use_cases : [];
          const tags = [
            ...features.slice(0, 2),
            ...(t.api_available ? ['API'] : []),
            ...(t.open_source ? ['Open Source'] : []),
          ].slice(0, 3);

          return {
            id: t.id,
            name: t.name,
            company: categoryNames[0] || 'Non spécifié',
            category: categoryNames[0] || 'Général',
            allCategories: categoryNames,
            description: t.description,
            fullDescription: t.long_description || t.description,
            tagline: t.tagline || '', // Tagline de l'outil
            rating: typeof t.overall_rating === 'number' ? t.overall_rating : 0,
            reviews: typeof t.review_count === 'number' ? t.review_count : 0,
            price,
            priceType,
            tags,
            functions: features,
            domains: useCases,
            useCases,
            advantages: [],
            concerns: [],
            businessValue: "Améliore l'efficacité opérationnelle et réduit les coûts",
            roi: t.pricing_model === 'free' ? '1-2 mois' : '3-6 mois',
            integration: `Intégration via API${t.api_available ? ' disponible' : ' limitée'}. ${t.integrations?.length ? `Compatible avec ${t.integrations.join(', ')}.` : ''}`,
            capabilities: {
              "Capacité IA": t.performance_score || 80,
              "Facilité d'usage": t.ease_of_use_score || 75,
              Intégration: t.integrations?.length ? Math.min(t.integrations.length * 20, 100) : 70,
              Sécurité: (t.gdpr_compliant ? 25 : 0) + (t.soc2_certified ? 25 : 0) + (t.hipaa_compliant ? 25 : 0) + 25,
              Évolutivité: t.value_for_money_score || 80,
            },
            featured: !!t.featured,
            website_url: t.website_url,
          } as any; // ToolDisplay
        });

        setToolsWithRealRatings(next);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE error:', err);
    };

    return () => {
      try { es.close(); } catch {}
    };
  }, [selectedSecteur, selectedPricing /*, selectedUseCase*/]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Moved from app/page.tsx to allow comparison button interaction */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-3 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">WINKSIA</span>
              </Link>
            </div>
            {/* Search Bar - centré */}
            <div className="justify-self-center w-full max-w-2xl">
              {/* SearchBar component would go here if it were a separate client component */}
              {/* For now, assuming it's part of this component or a simple input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    console.log("Main Search Input Value:", e.target.value)
                    setSearchQuery(e.target.value)
                  }}
                  placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            {/* Actions à droite (Comparer + Assistant IA) */}
            <div className="flex items-center gap-3 justify-self-end ml-auto">
              {/* Boutons texte de navigation */}
              <div className="flex items-center gap-6">
                <Link href="/outils" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                  Outils
                </Link>
                <Link href="/assistant" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                  Chat
                </Link>
                <span className="text-gray-400 font-medium">Classement</span>
                {selectedToolsForComparison.length >= 2 && (
                  <Link
                    href={`/assistant?compare=1`}
                    className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    Comparer ({selectedToolsForComparison.length})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Bloc Filtres: sticky pour se comporter comme un header fixé */}
        <div className="w-80 flex-shrink-0 sticky top-24 self-start">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-h-[calc(100vh-7rem)] overflow-auto">
            {" "}
            {/* Enhanced card styling */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-900" /> {/* Navy blue icons */}
                Filtres
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-900 text-white text-xs font-medium">
                    {" "}
                    {/* Navy blue badge */}
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-blue-900 hover:text-blue-700 text-sm font-medium">
                  {" "}
                  {/* Navy blue text */}
                  Effacer
                </button>
                <button
                  onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {isFilterSectionOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {isFilterSectionOpen && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSecteur && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      {selectedSecteur}
                      <button
                        onClick={() => setSelectedSecteur(null)}
                        className="ml-2 -mr-1 text-blue-700 hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                  {selectedUseCase && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {selectedUseCase}
                      <button
                        onClick={() => setSelectedUseCase(null)}
                        className="ml-2 -mr-1 text-green-700 hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                  {selectedPricing && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                      {priceRanges.find((range) => range.value === selectedPricing)?.label}
                      <button
                        onClick={() => setSelectedPricing(null)}
                        className="ml-2 -mr-1 text-yellow-700 hover:text-yellow-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Rechercher dans les filtres..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Secteurs Filter Select */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Secteurs d'activité</h4>
                  <select
                    value={selectedSecteur || ""}
                    onChange={(e) => setSelectedSecteur(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner un secteur...</option>
                    {getAllUniqueSecteurs().map((secteur) => (
                      <option key={secteur} value={secteur}>
                        {secteur}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cas d'usage Filter Select */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Cas d'usage populaires</h4>
                  <select
                    value={selectedUseCase || ""}
                    onChange={(e) => setSelectedUseCase(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner un cas d'usage...</option>
                    {getAllUniqueUseCases().map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarification Filter Select */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Modèles de tarification</h4>
                  <select
                    value={selectedPricing || ""}
                    onChange={(e) => setSelectedPricing(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner un modèle...</option>
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}{range.popular ? " (Populaire)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Découvrez les Outils IA pour Votre Entreprise
            </h1>
            <p className="text-gray-600">
              <span className="font-medium">{filteredTools.length} outils trouvés</span> • Solutions IA professionnelles
              pour dirigeants d';entreprise
            </p>
          </div>
          {/* Tools List: one tool per row */}
          <div className="grid grid-cols-1 gap-6">
            {filteredTools.map((tool) => {
              const isToolSelectedForComparison = selectedToolsForComparison.some((t) => t.id === tool.id)
              const canAddMoreForComparison = selectedToolsForComparison.length < 3
              // Ternaire extraite dans une variable indépendante
              const comparisonButtonClasses = (() => {
                if (isToolSelectedForComparison) {
                  return "bg-green-100 text-green-600 hover:bg-green-200"
                }
                if (canAddMoreForComparison) {
                  return "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }
                return "bg-gray-100 text-gray-400 cursor-not-allowed"
              })()
              return (
                <Link
                  key={tool.id}
                  href={`/outils/${tool.id}`}
                  className="block"
                  aria-label={`Voir le détail de ${tool.name}`}
                >
                <div
                  className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-auto flex flex-col cursor-pointer"
                >
                  {" "}
                  {/* Enhanced card styling with better shadows */}
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {tool.website_url && (
                          <img src={getFaviconUrl(tool.website_url, 32)} alt="favicon" className="w-5 h-5 rounded" />
                        )}
                        <h3
                        title={tool.name}
                        className="text-lg font-bold text-gray-900 mb-1 break-all md:break-words hyphens-auto leading-tight overflow-hidden"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2 as any, WebkitBoxOrient: "vertical" as any }}
                      >
                        {tool.name}
                      </h3>
                      </div>
                    <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                      {tool.category} • {renderStars(tool.rating)}
                    </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* TODO: bookmark action */ }}
                      >
                        <Bookmark className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleToolForComparison(tool) }}
                        className={`p-2 rounded-lg transition-colors ${comparisonButtonClasses}`}
                        disabled={!isToolSelectedForComparison && !canAddMoreForComparison}
                        style={{
                          backgroundColor: isToolSelectedForComparison ? "#f59e0b" : "#f3f4f6", // Yellow when selected
                          color: isToolSelectedForComparison ? "white" : "#6b7280",
                        }}
                      >
                        {isToolSelectedForComparison ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {/* Contenu variable (aligné horizontalement) */}
                  <div className="flex-1 flex flex-col lg:flex-row gap-4">
                    {/* Colonne gauche: titre/sous-titre déjà dans l'entête, ici description + tags */}
                    <div className="flex-1 min-w-0">
                      {/* Description (clamp 3 lignes) */}
                      <p
                        className="text-gray-700 text-sm leading-relaxed mb-3"
                        style={{ display: "-webkit-box", WebkitLineClamp: 3 as any, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}
                      >
                        {tool.description}
                      </p>
                      {/* Tagline et Features */}
                      <div className="space-y-2">
                        {/* Tagline en vert */}
                        {tool.tagline && (
                          <div>
                            <span
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            >
                              {tool.tagline}
                            </span>
                          </div>
                        )}
                        {/* Features en bleu */}
                        <div className="flex flex-wrap gap-2">
                          {tool.functions.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Colonne droite: prix en bas */}
                    <div className="w-full lg:w-48 flex-shrink-0 flex flex-col justify-start lg:justify-end">
                      {/* Price */}
                      <div className="mb-3 lg:mb-2">
                        <span className="font-bold text-lg" style={{ color: '#f59e0b' }}>
                          {tool.priceType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              )
            })}
          </div>
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun outil trouvé pour votre recherche</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-white rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: "#f59e0b" }} // Yellow accent for clear filters
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Tool Detail Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedTool.website_url && (
                      <img src={getFaviconUrl(selectedTool.website_url, 32)} alt="favicon" className="w-6 h-6 rounded" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTool.name}</h2>
                  </div>
                 <p className="text-gray-600 mb-4">
  {selectedTool.company} • {
    selectedTool.allCategories && selectedTool.allCategories.length > 0 
      ? selectedTool.allCategories.join(' • ')
      : selectedTool.category
  }
</p>
                  <div className="flex items-center justify-between">
                    <div>{renderStars(selectedTool.rating)}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">{selectedTool.price}</div>
                      <div className="text-sm text-gray-600">{selectedTool.priceType}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                    Comparer
                  </button>
                  <button
                    onClick={() => setSelectedTool(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedTool.fullDescription}</p>
              </div>
              {/* Capabilities Evaluation */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Évaluation des Capacités</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(selectedTool.capabilities as Record<string, number>).map(
                    ([key, value]: [string, number]) => (
                      <div key={key}>{renderCapabilityBar(key, value)}</div>
                    ),
                  )}
                </div>
              </div>
              {/* Functions and Domains */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tagline</h3>
                  {selectedTool.tagline && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {selectedTool.tagline}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.functions.map((func, i) => (
                      <span
                        key={`${func}-${i}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Use Cases */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cas d';usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTool.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Advantages and Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-green-600 mb-4">Avantages</h3>
                  <div className="space-y-3">
                    {selectedTool.advantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-600 mb-4">Points d'attention</h3>
                  <div className="space-y-3">
                    {selectedTool.concerns.map((concern, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{concern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Valeur Business</h3>
                <p className="text-blue-800 mb-3">{selectedTool.businessValue}</p>
                <p className="text-blue-700 font-medium">
                  <span className="font-bold">ROI estimé :</span> {selectedTool.roi}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Conseils d'intégration</h3>
                <p className="text-gray-700 leading-relaxed">{selectedTool.integration}</p>
              </div>

              {/* Reviews Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Avis Utilisateurs ({selectedTool.reviews})</h3>
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={() => {
                    
                      setIsWriteReviewModalOpen(true)
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Écrire un avis
                  </Button>
                </div>

                {/* Overall Rating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {typeof selectedTool.rating === "number" ? selectedTool.rating.toFixed(1) : "0.0"}/5
                    </div>
                    <p className="text-gray-600 mb-4">à partir de {selectedTool.reviews} avis</p>
                    {renderStars(selectedTool.rating)}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                    {[5, 4, 3, 2, 1].map((starCount) => {
                      const count = selectedTool.userReviews?.filter((r) => r.rating === starCount).length || 0
                      const percentage = selectedTool.reviews > 0 ? (count / selectedTool.reviews) * 100 : 0
                      return (
                        <div key={starCount} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">{starCount} étoiles</span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-600">({count})</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Individual Reviews (limited display) */}
                <div className="space-y-6">
                  {reviewsToDisplay.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4 mb-3">
                        {review.avatar.startsWith("http") ? (
                          <img
                            src={review.avatar || "/placeholder.svg?height=40&width=40&query=abstract%20user%20avatar"}
                            alt={review.user}
                            className="w-10 h-10 rounded-full object-cover"
                          />
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
                  {hasMoreReviews && (
                    <div className="text-center mt-4">
                      <Button variant="outline" onClick={() => setIsAllReviewsModalOpen(true)}>
                        Voir tous les {selectedTool.reviews} avis
                      </Button>
                    </div>
                  )}
                  {selectedTool.userReviews?.length === 0 && !isWriteReviewModalOpen && (
                    <div className="text-center py-8 text-gray-500">
                      Soyez le premier à laisser un avis pour cet outil !
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Voir la Démo
                </button>
                <button className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Demander un Devis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de comparaison supprimé au profit d'une page dédiée */}

      {/* AI Assistant Modal */}
      <AiAssistantModal isOpen={isAiAssistantModalOpen} onClose={() => setIsAiAssistantModalOpen(false)} />

      {/* All Reviews Modal */}
      {selectedTool && (
        <AllReviewsModal
          isOpen={isAllReviewsModalOpen}
          onClose={() => setIsAllReviewsModalOpen(false)}
          toolName={selectedTool.name}
          reviews={selectedTool.userReviews || []}
          overallRating={selectedTool.rating}
          reviewCount={selectedTool.reviews}
        />
      )}

      {/* Write Review Modal */}
      {selectedTool && (
        <WriteReviewModal
          isOpen={isWriteReviewModalOpen}
          onClose={() => setIsWriteReviewModalOpen(false)}
          toolName={selectedTool.name}
          onAddReview={handleAddReview}
        />
      )}

    </div>
  )
}
