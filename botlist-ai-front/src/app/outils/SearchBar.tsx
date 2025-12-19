"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export default function SearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    
    // Créer les nouveaux paramètres de recherche
    const params = new URLSearchParams(searchParams.toString())
    
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    
    // Mettre à jour l'URL sans recharger la page
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearSearch = () => {
    setSearchQuery('')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Rechercher des outils IA, catégories ou cas d'usage..."
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}