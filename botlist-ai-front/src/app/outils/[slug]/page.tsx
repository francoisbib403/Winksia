import { getToolBySlug } from "@/lib/useTools"
import Link from "next/link"
import ToolDetailClient from "./ToolDetailClient"
import type { ToolSummary } from "@/types/tool"

// Interface adaptée pour le frontend
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

// Fonction pour adapter les données de l'API
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

  // CORRECTION : Fonctions pour gérer les catégories multiples avec vérification de type
  const getCategoryName = (tool: any) => {
    const categories = tool.category as any
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].name
    } else if (categories && typeof categories === 'object' && categories.name) {
      return categories.name
    }
    return "Général"
  }

  return {
    id: tool.id,
    name: tool.name,
    tagline: tool.tagline || '',
    description: tool.description,
    fullDescription: tool.long_description || tool.description,
    pricing_model: tool.pricing_model || "paid",
    status: tool.status || "published",
    website_url: tool.website_url,
    api_available: tool.api_available || false,
    open_source: tool.open_source || false,
    features: tool.features || [],
    use_cases: tool.use_cases || [],
    integrations: tool.integrations || [],
    platforms: tool.platforms || [],
    overall_rating: tool.overall_rating,
    review_count: tool.review_count,
    category: getCategoryName(tool),
    rating: tool.overall_rating || 0,
    reviews: tool.review_count || 0,
    price: getPriceDisplay(tool.pricing_model, tool.pricing_details),
    priceType: getPriceType(tool.pricing_model),
    logo_url: tool.logo?.url || tool.logo_url || tool.logo,
    slug: tool.slug,
  }
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ToolSlugPage({ params }: PageProps) {
  try {
    const { slug } = await params

    if (!slug) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
            <p className="text-gray-600 mb-4">Le slug de l'outil est invalide.</p>
            <Link href="/outils" className="text-blue-600 hover:text-blue-700">
              Retour aux outils
            </Link>
          </div>
        </div>
      )
    }

    const apiTool = await getToolBySlug(slug)

    if (!apiTool) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
            <p className="text-gray-600 mb-4">L'outil "{slug}" n'existe pas.</p>
            <Link href="/outils" className="text-blue-600 hover:text-blue-700">
              Retour aux outils
            </Link>
          </div>
        </div>
      )
    }

    const tool = adaptToolForDisplay(apiTool)

    return <ToolDetailClient tool={tool} />
  } catch (error) {
    console.error("Erreur lors du chargement de l'outil:", error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">Une erreur est survenue lors du chargement de l'outil.</p>
          <Link href="/outils" className="text-blue-600 hover:text-blue-700">
            Retour aux outils
          </Link>
        </div>
      </div>
    )
  }
}
