import { getAllTools, getToolById } from "@/lib/useTools"
import ToolDetailClient, { ToolDisplay as ClientToolDisplay } from "./ToolDetailClient"

export const dynamic = "force-dynamic"

const adaptToolForDisplay = (tool: any): ClientToolDisplay => {
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
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
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
    integration: `Intégration via API${tool.api_available ? " disponible" : " limitée"}. ${tool.integrations?.length ? `Compatible avec ${tool.integrations.join(", ")}.` : ""}`,
    capabilities: calculateCapabilities(tool),
    featured: !!tool.featured,
    websiteUrl: tool.website_url,
    logoUrl: tool.logo?.url || tool.logo?.path || undefined,
    demoUrl: tool.demo?.url || tool.demo?.path || undefined,
    screenshots: Array.isArray(tool.screenshots) ? tool.screenshots.map((f: any) => f?.url || f?.path).filter(Boolean) : [],
    videos: Array.isArray(tool.videos) ? tool.videos.map((f: any) => f?.url || f?.path).filter(Boolean) : [],
    api_available: !!tool.api_available,
    open_source: !!tool.open_source,
    self_hosted_available: !!tool.self_hosted_available,
    integrations: Array.isArray(tool.integrations) ? tool.integrations : [],
    platforms: Array.isArray(tool.platforms) ? tool.platforms : [],
  }
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const idOrSlug = params.id
  let tool: any | null = null

  try {
    tool = await getToolById(idOrSlug)
  } catch {}

  if (!tool) {
    try {
      const all = await getAllTools()
      const match = all.find((t: any) => t.slug === idOrSlug || t.id === idOrSlug)
      if (match) tool = await getToolById(match.id)
    } catch {}
  }

  if (!tool) {
    return <div className="max-w-7xl mx-auto px-6 py-16 text-red-600">Outil introuvable</div>
  }

  const adapted = adaptToolForDisplay(tool)
  return <ToolDetailClient initialTool={adapted} />
}

