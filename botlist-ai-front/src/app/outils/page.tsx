import ClientToolsComponent from './ClientToolsComponent'
export const dynamic = 'force-dynamic';

import { getAllTools } from "@/lib/useTools"
import type { Tool } from "@/types/tool" // Import Tool from your types directory

// Interface adaptée pour le frontend
interface ToolDisplay {
  id: string
  name: string
  company: string
  category: string
  allCategories: string[] // AJOUT : Pour le filtrage
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
  capabilities: {
    [key: string]: number
  }
  featured: boolean
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

  const generateTags = (tool: Tool) => {
    const tags = []
    if (tool.features && tool.features.length > 0) {
      tags.push(...tool.features.slice(0, 2))
    }
    if (tool.api_available) tags.push("API")
    if (tool.open_source) tags.push("Open Source")
    if (tool.gdpr_compliant) tags.push("GDPR")
    const remainingCount = (tool.features?.length || 0) - 2
    if (remainingCount > 0) {
      tags.push(`+${remainingCount} autres`)
    }
    return tags.slice(0, 3)
  }

  const calculateCapabilities = (tool: Tool) => {
    return {
      "Capacité IA": tool.performance_score || 80,
      "Facilité d'usage": tool.ease_of_use_score || 75,
      Intégration: tool.integrations?.length ? Math.min(tool.integrations.length * 20, 100) : 70,
      Sécurité: (tool.gdpr_compliant ? 25 : 0) + (tool.soc2_certified ? 25 : 0) + (tool.hipaa_compliant ? 25 : 0) + 25,
      Évolutivité: tool.value_for_money_score || 80,
    }
  }

  // CORRECTION : Fonctions pour gérer les catégories multiples avec vérification de type
  const getCategoryName = (tool: Tool) => {
    const categories = tool.category as any;
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].name;
    } else if (categories && typeof categories === 'object' && categories.name) {
      return categories.name;
    }
    return "Général";
  }

  const getCompanyName = (tool: Tool) => {
    const categories = tool.category as any;
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].name;
    } else if (categories && typeof categories === 'object' && categories.name) {
      return categories.name;
    }
    return "Non spécifié";
  }

  return {
    id: tool.id,
    name: tool.name,
    company: getCompanyName(tool), // CORRECTION : Utilise la fonction
    category: getCategoryName(tool), // CORRECTION : Utilise la fonction pour l'affichage
    // AJOUT : Toutes les catégories pour le filtrage
    allCategories: (() => {
      const categories = tool.category as any;
      if (Array.isArray(categories)) {
        return categories.map((c: any) => c.name).filter(Boolean);
      } else if (categories && typeof categories === 'object' && categories.name) {
        return [categories.name];
      }
      return [];
    })(),
    description: tool.description,
    fullDescription: tool.long_description || tool.description,
    rating: tool.overall_rating,
    reviews: tool.review_count,
    price: getPriceDisplay(tool.pricing_model, tool.pricing_details),
    priceType: getPriceType(tool.pricing_model),
    tags: generateTags(tool),
    functions: tool.features || [],
    domains: tool.use_cases || [],
    useCases: tool.use_cases || [],
    advantages: (tool.integrations as string[] | undefined)?.map((int: string) => `Intégration ${int}`) || [
      "Performance élevée",
      "Interface intuitive",
      "Support réactif",
    ],
    concerns: [
      tool.pricing_model === "enterprise" ? "Coût élevé" : "Abonnement requis",
      "Courbe d'apprentissage",
      "Configuration requise",
    ],
    businessValue: `Améliore l'efficacité opérationnelle et réduit les coûts de traitement`,
    roi: tool.pricing_model === "free" ? "1-2 mois" : "3-6 mois",
    integration: `Intégration via API${tool.api_available ? " disponible" : " limitée"}. ${
      tool.integrations?.length ? `Compatible avec ${tool.integrations.join(", ")}.` : ""
    }`,
    capabilities: calculateCapabilities(tool),
    featured: tool.featured,
  }
}

export default async function OutilsPage() {
  try {
    const apiTools = await getAllTools()
    
    if (!apiTools || apiTools.length === 0) {
      console.warn('Aucun outil trouvé depuis l\'API')
      return <ClientToolsComponent initialTools={[]} categories={[]} />
    }

    const tools = apiTools.map(adaptToolForDisplay)

    // Liste canonique des secteurs (affichée même si absents en DB)
    const ALL_SECTORS = [
      'Marketing & Contenu',
      'Cybersécurité',
      'Development',
      'Communication',
      'Finance & Comptabilité',
      'Productivity',
      'Productivité & Collaboration',
      'Design',
      'Marketing',
      'CRM & Ventes',
      'RH & Recrutement',
      'Analytics & Business Intelligence',
      'Vertical/Spécialisé',
      'Service Client & Chatbots',
      'Automatisation & RPA',
    ] as const

    // Compter les occurrences présentes dans les outils actuels
    const counts = new Map<string, number>()
    tools.forEach((tool) => {
      tool.allCategories.forEach((categoryName) => {
        counts.set(categoryName, (counts.get(categoryName) || 0) + 1)
      })
    })

    // Fusion: garder toute la liste avec compte réel si présent, sinon 0
    const categoryList = ALL_SECTORS.map((name) => ({
      name,
      count: counts.get(name) || 0,
    }))

    // Debug
    console.log('Tools loaded:', tools.length)
    console.log('Categories found:', categoryList)
    console.log('Sample tool data:', apiTools.slice(0, 2).map(t => ({
      name: t.name,
      categories: Array.isArray(t.category) 
        ? t.category.map((c: any) => c.name) 
        : t.category 
          ? [(t.category as any).name] 
          : [],
      subcategory: t.subcategory?.name
    })))

    return <ClientToolsComponent initialTools={tools} categories={categoryList} />
  } catch (error) {
    console.error('Erreur lors du chargement des outils:', error)
    return <ClientToolsComponent initialTools={[]} categories={[]} />
  }
}
