"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Trophy,
  Star,
  TrendingUp,
  ExternalLink,
  Filter,
  X,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { getFaviconUrl } from "@/lib/utils"
import { renderStars } from "@/utils/renderers"
import { cn } from "@/lib/utils"
import {
  LogOut,
  User,
} from "lucide-react"

interface ToolDisplay {
  id: string
  slug?: string
  name: string
  company: string
  category: string
  allCategories: string[]
  description: string
  rating: number
  reviews: number
  price: string
  priceType: string
  functions: string[]
  domains: string[]
  website_url?: string
  logo_url?: string
}

export default function ClassementPage() {
  const router = useRouter()

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Auth effects
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erreur parsing user data:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    setIsAuthenticated(false)
    setCurrentUser(null)
    window.location.href = '/'
  }

  const [tools, setTools] = useState<ToolDisplay[]>([])
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating")

  useEffect(() => {
    const loadTools = async () => {
      try {
        const allTools = await apiClient.getTools()
        
        const formattedTools: ToolDisplay[] = allTools.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          company: Array.isArray(t.category) 
            ? t.category.map((c: any) => c?.name).filter(Boolean).join(", ") 
            : t.category?.name || "Non spécifié",
          category: Array.isArray(t.category) 
            ? t.category.map((c: any) => c?.name).filter(Boolean)[0] || "Général"
            : t.category?.name || "Général",
          allCategories: Array.isArray(t.category) 
            ? t.category.map((c: any) => c?.name).filter(Boolean)
            : [],
          description: t.description,
          rating: typeof t.overall_rating === "number" ? t.overall_rating : 0,
          reviews: typeof t.review_count === "number" ? t.review_count : 0,
          price: t.pricing_model === "free" ? "Gratuit" : 
                 t.pricing_model === "freemium" ? "Freemium" :
                 t.pricing_model === "paid" ? "Payant" : "Sur devis",
          priceType: t.pricing_model || "unknown",
          functions: Array.isArray(t.features) ? t.features : [],
          domains: Array.isArray(t.use_cases) ? t.use_cases : [],
          website_url: t.website_url,
          logo_url: t.logo_url,
        }))

        setTools(formattedTools)
      } catch (error) {
        console.error("Erreur chargement outils:", error)
      }
    }

    loadTools()
  }, [])

  const filteredTools = tools
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "reviews") return b.reviews - a.reviews
      return a.name.localeCompare(b.name)
    })

  const getToolSlug = (tool: ToolDisplay): string => {
    if (tool.slug) return tool.slug
    return tool.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || tool.id
  }

  const navigateToTool = (tool: ToolDisplay) => {
    const slug = getToolSlug(tool)
    router.push(`/outils/${slug}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">WINKSIA</span>
            </Link>
            {/* Actions à droite */}
            <div className="flex items-center gap-6">
              <Link href="/outils" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Outils
              </Link>
              <Link href="/assistant" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
                Chat
              </Link>
              <span className="text-gray-900 font-medium">Classement</span>
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

      {/* ============================================ */}
      {/* Main Content */}
      {/* ============================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Classement des outils IA
              </h1>
              <p className="text-slate-600 mt-1">
                Découvrez les outils les mieux notés par notre communauté
              </p>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSortBy("rating")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                sortBy === "rating"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
            >
              <Star className="w-4 h-4" />
              Par note
            </button>
            <button
              onClick={() => setSortBy("reviews")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                sortBy === "reviews"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Par secteurs d’activité
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                sortBy === "name"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
            >
              <Filter className="w-4 h-4" />
              Alphabétique
            </button>
          </div>
        </div>

        {/* Tools Ranking */}
        <div className="space-y-4">
          {filteredTools.map((tool, index) => (
            <div
              key={tool.id}
              onClick={() => navigateToTool(tool)}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                  index === 0 ? "bg-amber-100 text-amber-600" :
                  index === 1 ? "bg-slate-200 text-slate-600" :
                  index === 2 ? "bg-orange-100 text-orange-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  #{index + 1}
                </div>

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
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{tool.company}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5">
                          {renderStars(tool.rating)}
                        </span>
                        <span className="text-slate-400">({tool.reviews} avis)</span>
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
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm mt-3 line-clamp-2">{tool.description}</p>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-lg font-bold text-slate-900">{tool.price}</span>
                    {tool.functions.slice(0, 2).map((func, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 font-semibold text-xs bg-blue-100 text-blue-700"
                      >
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun outil trouvé</h3>
            <p className="text-slate-600">Aucun outil n'est disponible pour le moment</p>
          </div>
        )}
      </main>
    </div>
  )
}
