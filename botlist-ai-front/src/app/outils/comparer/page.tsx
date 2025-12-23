"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Search, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"
import { apiClient } from "@/lib/api-client"
import { getAllTools } from "@/lib/useTools"

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
  capabilities: Record<string, number>
  featured: boolean
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
  const categories = tool.category as any
  const categoryName = Array.isArray(categories)
    ? (categories[0]?.name || "Général")
    : (categories?.name || "Général")
  const allCategories = Array.isArray(categories)
    ? categories.map((c: any) => c?.name).filter(Boolean)
    : categories?.name
      ? [categories.name]
      : []
  const capabilities = {
    "Capacité IA": tool.performance_score || 80,
    "Facilité d'usage": tool.ease_of_use_score || 75,
    Intégration: tool.integrations?.length ? Math.min(tool.integrations.length * 20, 100) : 70,
    Sécurité: (tool.gdpr_compliant ? 25 : 0) + (tool.soc2_certified ? 25 : 0) + (tool.hipaa_compliant ? 25 : 0) + 25,
    Évolutivité: tool.value_for_money_score || 80,
  }
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
    capabilities,
    featured: !!tool.featured,
  }
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const idsParam = searchParams.get("ids") || ""
  const dataParam = searchParams.get("data") || ""
  const ids = useMemo(() => decodeURIComponent(idsParam).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 2), [idsParam])

  const [tools, setTools] = useState<ToolDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false)
  const [iaLoading, setIaLoading] = useState(false)
  const [iaError, setIaError] = useState<string | null>(null)
  const [iaResult, setIaResult] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      if (ids.length === 0) return
      setLoading(true)
      setError(null)
      try {
        // 0) Si des données sont passées en query (data=base64 JSON), les utiliser directement
        if (dataParam) {
          try {
            const json = decodeURIComponent(dataParam)
            const parsed = JSON.parse(decodeURIComponent(escape(atob(json))))
            if (Array.isArray(parsed) && parsed.length > 0) {
              const adaptedFromParam = parsed.map((t: any) => ({
                id: t.id,
                name: t.name,
                company: t.company,
                category: t.category,
                allCategories: t.allCategories || [],
                description: t.description,
                fullDescription: t.fullDescription || t.description,
                rating: t.rating || 0,
                reviews: t.reviews || 0,
                price: t.price,
                priceType: t.priceType,
                tags: t.tags || [],
                functions: t.functions || [],
                domains: t.domains || [],
                useCases: t.useCases || [],
                capabilities: t.capabilities || {},
                featured: !!t.featured,
              }))
              setTools(adaptedFromParam)
              setLoading(false)
              return
            }
          } catch {}
        }
        // 1) Essai de chargement direct par ID
        const settled = await Promise.allSettled(ids.map((id) => apiClient.get(`/tools/${id}`)))
        const ok = settled.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled").map((r) => r.value)

        let adapted = ok.map(adaptToolForDisplay)

        // 2) Fallback: charger toute la liste et filtrer par IDs si aucun résultat direct
        if (adapted.length === 0) {
          try {
            const all = await getAllTools()
            const filtered = all.filter((t: any) =>
              ids.includes(String(t.id)) || (t.slug && ids.includes(String(t.slug)))
            )
            adapted = filtered.map(adaptToolForDisplay)
          } catch {
            // ignore, on gérera l'erreur après
          }
        }

        // 3) Fallback localStorage: utiliser la sélection persistée issue de la page Outils
        if (adapted.length === 0 && typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('compare_tools_data')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                adapted = parsed.map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  company: t.company,
                  category: t.category,
                  allCategories: t.allCategories || [],
                  description: t.description,
                  fullDescription: t.fullDescription || t.description,
                  rating: t.rating || 0,
                  reviews: t.reviews || 0,
                  price: t.price,
                  priceType: t.priceType,
                  tags: t.tags || [],
                  functions: t.functions || [],
                  domains: t.domains || [],
                  useCases: t.useCases || [],
                  capabilities: t.capabilities || {},
                  featured: !!t.featured,
                }))
              }
            }
          } catch {}
        }

        setTools(adapted)
        if (adapted.length === 0) {
          setError("Impossible de charger les outils à comparer")
        }
      } catch (e: any) {
        setError("Impossible de charger les outils à comparer")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ids])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-3 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#051e63ff" }}>
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
              {/* User Profile - Round Avatar */}
              <button className="w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-colors" style={{ backgroundColor: "#1e3a8a" }}>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Comparer les outils</h2>
          <Link
            href="/outils"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600"
            aria-label="Retour aux outils"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {ids.length === 0 && (
          <div className="p-6 border rounded-xl bg-white">Sélectionnez des outils depuis la page Outils pour lancer une comparaison.</div>
        )}

        {error && <div className="p-6 border rounded-xl bg-red-50 text-red-700">{error}</div>}
        {loading && <div className="p-6 border rounded-xl bg-white">Chargement…</div>}

        {tools.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Analyse IA (Mistral)</h3>
              <Button
                onClick={async () => {
                  try {
                    setIaLoading(true); setIaError(null); setIaResult(null)
                    const res = await fetch('/api/mistral/compare', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tools, question: '' })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data?.error || 'Erreur IA')
                    setIaResult(data)
                  } catch (e: any) {
                    setIaError(e?.message || 'Erreur IA')
                  } finally {
                    setIaLoading(false)
                  }
                }}
                disabled={iaLoading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {iaLoading ? 'Analyse en cours…' : "Lancer l'analyse IA"}
              </Button>
            </div>
            {iaError && <div className="text-red-600 text-sm">{iaError}</div>}
            {iaResult && (
              <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(iaResult, null, 2)}</pre>
            )}
          </div>
        )}

        {tools.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3
                  title={tool.name}
                  className="text-xl font-bold text-gray-900 mb-1 break-all md:break-words hyphens-auto leading-tight overflow-hidden"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2 as any, WebkitBoxOrient: "vertical" as any }}
                >
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{tool.company} • {(tool.allCategories || []).join(" • ") || tool.category}</p>
                <div className="mb-4 flex items-center justify-between">
                  <div>{renderStars(tool.rating)}</div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold">{tool.price}</div>
                    <div className="text-sm text-gray-600">{tool.priceType}</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6" style={{ display: "-webkit-box", WebkitLineClamp: 4 as any, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{tool.fullDescription}</p>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(tool.capabilities).map(([k, v]) => (
                    <div key={k}>{renderCapabilityBar(k, v as number)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
