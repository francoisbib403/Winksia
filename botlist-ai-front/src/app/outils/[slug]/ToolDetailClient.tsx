"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  MessageSquare,
  Star,
  ThumbsUp,
  Globe,
  Users,
  Tag,
  Search,
  ImageIcon,
  Bold,
  Italic,
  List,
  Send,
  MessageCircle,
  Reply,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { renderStars } from "@/utils/renderers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFaviconUrl } from "@/lib/utils"

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

interface ToolDetailClientProps {
  tool: ToolDisplay
}

interface LinkPreviewData {
  url: string
  image: string
}

interface ReviewComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  rating: number
  createdAt: string
  likes: number
  replies: ReviewComment[]
}

// Sample reviews data
const sampleReviews: ReviewComment[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Marie Dupont',
    userAvatar: '',
    content: 'Cet outil a révolutionné notre façon de travailler ! L\'interface est intuitive et les fonctionnalités d\'IA sont impressionnantes. Je recommande vivement pour toute équipe marketing.',
    rating: 5,
    createdAt: '2024-01-15',
    likes: 24,
    replies: [
      {
        id: 'r1',
        userId: 'u2',
        userName: 'Thomas Martin',
        userAvatar: '',
        content: 'Totalement d\'accord ! Je l\'utilise depuis 3 mois et gain de temps considérable.',
        rating: 0,
        createdAt: '2024-01-16',
        likes: 8,
        replies: []
      }
    ]
  },
  {
    id: '2',
    userId: 'u3',
    userName: 'Sophie Bernard',
    userAvatar: '',
    content: 'Très bon outil, mais la courbe d\'apprentissage est un peu raide au début. Une fois qu\'on maîtrise les bases, c\'est un gain de productivité énorme.',
    rating: 4,
    createdAt: '2024-01-10',
    likes: 12,
    replies: []
  },
  {
    id: '3',
    userId: 'u4',
    userName: 'Lucas Petit',
    userAvatar: '',
    content: 'Le meilleur outil d\'IA que j\'ai testé cette année. La génération de contenu est rapide et pertinente.',
    rating: 5,
    createdAt: '2024-01-08',
    likes: 18,
    replies: []
  },
  {
    id: '4',
    userId: 'u5',
    userName: 'Emma Wilson',
    userAvatar: '',
    content: 'Excellente intégration avec nos outils existants. Le support client est très réactif.',
    rating: 5,
    createdAt: '2024-01-05',
    likes: 15,
    replies: []
  },
  {
    id: '5',
    userId: 'u6',
    userName: 'Antoine Garcia',
    userAvatar: '',
    content: 'Bon outil, mais j\'attends encore quelques fonctionnalités comme l\'export PDF.',
    rating: 4,
    createdAt: '2024-01-03',
    likes: 9,
    replies: []
  },
  {
    id: '6',
    userId: 'u7',
    userName: 'Julie Moreau',
    userAvatar: '',
    content: 'Parfait pour créer du contenu rapidement. Les templates sont très utiles.',
    rating: 5,
    createdAt: '2024-01-01',
    likes: 21,
    replies: []
  },
  {
    id: '7',
    userId: 'u8',
    userName: 'Nicolas Durand',
    userAvatar: '',
    content: 'Un peu cher pour les petites équipes, mais la qualité est au rendez-vous.',
    rating: 4,
    createdAt: '2023-12-28',
    likes: 7,
    replies: []
  },
  {
    id: '8',
    userId: 'u9',
    userName: 'Camille Leroy',
    userAvatar: '',
    content: 'Interface moderne et fluide. J\'utilise cet outil quotidiennement pour mes créations.',
    rating: 5,
    createdAt: '2023-12-25',
    likes: 14,
    replies: []
  }
]

export default function ToolDetailClient({ tool }: ToolDetailClientProps) {
  const router = useRouter()
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isHunted, setIsHunted] = useState(false)
  const [huntCount, setHuntCount] = useState(tool.reviews || 0)
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [reviews, setReviews] = useState<ReviewComment[]>(sampleReviews)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set())
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 3
  const maxVisibleReplies = 3

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
      }
    }
  }, [])

  const handleLogout = () => {
    // Unifie la déconnexion: efface cookies + storage et force un reload
    // Ajoute des logs pour valider l'effacement
    import('@/lib/logout').then(({ logoutClient }) => logoutClient('/'))
  }

  const getUserInitials = () => {
    if (!currentUser) return '?'
    const firstname = currentUser.firstname || ''
    const lastname = currentUser.lastname || ''
    if (firstname && lastname) {
      return `${firstname[0]}${lastname[0]}`.toUpperCase()
    }
    if (firstname) {
      return firstname.slice(0, 2).toUpperCase()
    }
    if (currentUser.email) {
      return currentUser.email[0].toUpperCase()
    }
    return '?'
  }

  useEffect(() => {
    const fetchLinkPreview = async () => {
      if (!tool?.website_url) return

      setPreviewLoading(true)
      try {
        const { getLinkPreview } = await import("link-preview-js")
        const data = await getLinkPreview(tool.website_url!) as any
        setPreviewData({
          url: tool.website_url,
          image: data.images?.[0] || "",
        })
      } catch (error) {
        console.error("Failed to fetch link preview:", error)
        setPreviewData({ url: tool.website_url, image: "" })
      } finally {
        setPreviewLoading(false)
      }
    }

    fetchLinkPreview()
  }, [tool?.website_url])

  const handleHunt = () => {
    setIsHunted(!isHunted)
    setHuntCount(isHunted ? huntCount - 1 : huntCount + 1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/outils?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLikeReview = (reviewId: string, isReply: boolean = false, parentId?: string) => {
    setLikedReviews(prev => {
      const newLiked = new Set(prev)
      const likeId = isReply ? `${parentId}-${reviewId}` : reviewId
      if (newLiked.has(likeId)) {
        newLiked.delete(likeId)
        if (isReply && parentId) {
          setReviews(prev => prev.map(r => {
            if (r.id === parentId) {
              return {
                ...r,
                replies: r.replies.map(rep => 
                  rep.id === reviewId ? { ...rep, likes: rep.likes - 1 } : rep
                )
              }
            }
            return r
          }))
        } else {
          setReviews(prev => prev.map(r => 
            r.id === reviewId ? { ...r, likes: r.likes - 1 } : r
          ))
        }
      } else {
        newLiked.add(likeId)
        if (isReply && parentId) {
          setReviews(prev => prev.map(r => {
            if (r.id === parentId) {
              return {
                ...r,
                replies: r.replies.map(rep => 
                  rep.id === reviewId ? { ...rep, likes: rep.likes + 1 } : rep
                )
              }
            }
            return r
          }))
        } else {
          setReviews(prev => prev.map(r => 
            r.id === reviewId ? { ...r, likes: r.likes + 1 } : r
          ))
        }
      }
      return newLiked
    })
  }

  const handleSubmitReply = (parentId: string, isNested: boolean = false, grandparentId?: string) => {
    if (!replyContent.trim()) return
    
    const newReply: ReviewComment = {
      id: `reply-${Date.now()}`,
      userId: 'current-user',
      userName: 'Vous',
      userAvatar: '',
      content: replyContent,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: []
    }

    if (isNested && grandparentId) {
      setReviews(prev => prev.map(r => {
        if (r.id === grandparentId) {
          return {
            ...r,
            replies: r.replies.map(rep => {
              if (rep.id === parentId) {
                return { ...rep, replies: [...rep.replies, newReply] }
              }
              return rep
            })
          }
        }
        return r
      }))
    } else {
      setReviews(prev => prev.map(review => {
        if (review.id === parentId) {
          return { ...review, replies: [...review.replies, newReply] }
        }
        return review
      }))
    }

    setReplyContent('')
    setReplyingTo(null)
  }

  const toggleReplies = (reviewId: string) => {
    setExpandedReplies(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(reviewId)) {
        newExpanded.delete(reviewId)
      } else {
        newExpanded.add(reviewId)
      }
      return newExpanded
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = reviews.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
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
                      <span className="text-sm">{getUserInitials()}</span>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Product Hunt Style */}
        <div className="flex gap-6 mb-8">
          {/* Product Icon */}
          <div className="flex-shrink-0">
            {tool?.logo_url ? (
              <img
                src={tool.logo_url}
                alt={tool?.name || ""}
                className="w-24 h-24 rounded-2xl shadow-sm object-contain bg-white"
              />
            ) : tool?.website_url ? (
              <img
                src={getFaviconUrl(tool.website_url, 64)}
                alt={tool?.name || ""}
                className="w-auto h-16 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-sm">
                {(tool?.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{tool?.name}</h1>
            {tool?.tagline && (
              <p className="text-xl text-gray-600 mb-2">{tool.tagline}</p>
            )}
          </div>

          {/* Like Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleHunt}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isHunted
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isHunted ? "fill-current" : ""}`} />
              <span>{isHunted ? "Liked" : "Like"}</span>
            </button>
            <span className="text-lg font-semibold text-gray-900">{huntCount}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 py-4 border-y border-gray-100 mb-8">
          <div className="flex items-center gap-2 text-gray-500">
            <Tag className="w-5 h-5" />
            <span>{tool.category || 'Général'}</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${star <= Math.round(tool.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="font-semibold text-gray-900 ml-2">{tool.rating.toFixed(1)}</span>
            <span className="text-gray-500">({tool.reviews})</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {tool?.fullDescription || tool?.description || "Aucune description disponible."}
              </p>
            </section>

            {/* Website Screenshot */}
            {tool?.website_url && previewData?.image ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={previewData.image}
                    alt={`${tool.name} - Aperçu`}
                    className="w-full aspect-video object-cover"
                  />
                </a>
              </div>
            ) : previewLoading ? (
              <div className="aspect-video w-full bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="animate-pulse flex items-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              </div>
            ) : null}

            {/* Features */}
            {tool?.features && tool.features.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Fonctionnalités</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Use Cases */}
            {tool?.use_cases && tool.use_cases.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Cas d'usage</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.use_cases.map((useCase, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                      {useCase}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Avis Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Avis</h2>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {showReviewForm ? 'Annuler' : 'Écrire un avis'}
                </Button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Partagez votre expérience</h3>
                  
                  {/* Star Rating with Half Stars */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="relative focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= (hoverRating || userRating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                          {/* Half star indicator */}
                          {(hoverRating || userRating) >= star - 0.5 && (hoverRating || userRating) < star && (
                            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                              <Star 
                                className="w-8 h-8 text-yellow-400 fill-yellow-400" 
                              />
                            </div>
                          )}
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {userRating > 0 ? `${userRating}/5` : 'Sélectionnez une note'}
                      </span>
                    </div>
                  </div>

                  {/* Markdown Editor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre avis</label>
                    
                    {/* Markdown Toolbar */}
                    <div className="flex items-center gap-1 p-2 bg-white border border-gray-300 rounded-t-lg border-b-0">
                      <button
                        type="button"
                        onClick={() => setReviewContent(reviewContent + '**texte**')}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Gras"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewContent(reviewContent + '*texte*')}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Italique"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewContent(reviewContent + '\n- item')}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Liste"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Partagez votre expérience avec cet outil... (Vous pouvez utiliser **gras**, *italique*, et des listes)"
                      className="w-full h-40 p-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      // TODO: Submit review to API
                      console.log('Submit review:', { rating: userRating, content: reviewContent })
                      setShowReviewForm(false)
                      setUserRating(0)
                      setReviewContent('')
                    }}
                    disabled={userRating === 0 || !reviewContent.trim()}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publier mon avis
                  </Button>
                </div>
              )}

              {/* Rating Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{tool.rating.toFixed(1)}</div>
                    {renderStars(tool.rating)}
                    <p className="text-sm text-gray-500 mt-1">{tool.reviews} avis</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((starCount) => (
                      <div key={starCount} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{starCount}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${(starCount / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-6">{Math.floor(tool.reviews * (starCount / 5))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Reviews List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Avis des utilisateurs</h3>
                  <span className="text-sm text-gray-500">{reviews.length} avis</span>
                </div>
                
                {currentReviews.map((review) => (
                  <div key={review.id} className="rounded-xl p-4">
                    {/* Review Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {review.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{review.userName}</span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="mt-3 text-gray-700">{review.content}</p>

                    {/* Review Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => handleLikeReview(review.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          likedReviews.has(review.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                        <span>{review.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Répondre</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {review.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                        {review.replies.slice(0, expandedReplies.has(review.id) ? review.replies.length : maxVisibleReplies).map((reply) => (
                          <div key={reply.id} className="pt-3 border-t border-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                                {reply.userName.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 text-sm">{reply.userName}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                                
                                {/* Reply Actions */}
                                <div className="flex items-center gap-3 mt-2">
                                  <button
                                    onClick={() => handleLikeReview(reply.id, true, review.id)}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      likedReviews.has(`${review.id}-${reply.id}`) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${likedReviews.has(`${review.id}-${reply.id}`) ? 'fill-current' : ''}`} />
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button
                                    onClick={() => setReplyingTo(`${review.id}-${reply.id}`)}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    <Reply className="w-3 h-3" />
                                    <span>Répondre</span>
                                  </button>
                                </div>

                                {/* Nested Replies */}
                                {reply.replies.length > 0 && (
                                  <div className="mt-3 pl-3 border-l border-gray-200 space-y-2">
                                    {reply.replies.map((nestedReply) => (
                                      <div key={nestedReply.id} className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs">
                                          {nestedReply.userName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800 text-xs">{nestedReply.userName}</span>
                                            <span className="text-xs text-gray-400">
                                              {formatDate(nestedReply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="mt-0.5 text-xs text-gray-600">{nestedReply.content}</p>
                                          <button
                                            onClick={() => handleLikeReview(nestedReply.id, true, reply.id)}
                                            className={`flex items-center gap-1 mt-1 text-xs transition-colors ${
                                              likedReviews.has(`${reply.id}-${nestedReply.id}`) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                            }`}
                                          >
                                            <ThumbsUp className={`w-3 h-3 ${likedReviews.has(`${reply.id}-${nestedReply.id}`) ? 'fill-current' : ''}`} />
                                            <span>{nestedReply.likes}</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Nested Reply Form */}
                                {replyingTo === `${review.id}-${reply.id}` && (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Répondre..."
                                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(reply.id, true, review.id)}
                                    />
                                    <Button
                                      onClick={() => handleSubmitReply(reply.id, true, review.id)}
                                      size="sm"
                                      className="px-2 py-1"
                                      disabled={!replyContent.trim()}
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {review.replies.length > maxVisibleReplies && (
                          <button
                            onClick={() => toggleReplies(review.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            {expandedReplies.has(review.id) 
                              ? 'Voir moins'
                              : `Voir ${review.replies.length - maxVisibleReplies} réponses de plus`
                            }
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === review.id && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Écrivez votre réponse..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(review.id)}
                        />
                        <Button
                          onClick={() => handleSubmitReply(review.id)}
                          size="sm"
                          disabled={!replyContent.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* CTA Card */}
            <div className="bg-gray-50 rounded-2xl p-6">
              {tool?.website_url ? (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              ) : (
                <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold cursor-not-allowed opacity-50">
                  Website Coming Soon
                </button>
              )}
            </div>

            {/* Maker Info */}
            <div className="border border-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Informations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prix</span>
                  <span className="text-gray-900 font-medium">{tool?.price || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900">{tool?.priceType || "—"}</span>
                </div>
                {tool?.api_available && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">API</span>
                    <span className="text-green-600">Disponible</span>
                  </div>
                )}
                {tool?.open_source && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Open Source</span>
                    <span className="text-purple-600">Oui</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {tool?.features && tool.features.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.features.slice(0, 5).map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {tool?.integrations && tool.integrations.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Intégrations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.integrations.map((integration, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-white/90 text-sm mb-4">Discutez avec notre assistant IA pour trouver le bon outil</p>
              <Link
                href="/assistant"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-white/90 transition-colors font-medium text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Discuter
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
