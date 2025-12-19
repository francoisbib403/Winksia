"use client"
import { MessageSquare, X, Send, Sparkles, Star, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  recommendations?: {
    primary?: RecommendedTool
    alternatives?: RecommendedTool[]
  }
}

interface RecommendedTool {
  id: string
  name: string
  price: string
  strengths: string[]
  url?: string
  rating?: number
  logo?: string
}

interface AiAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant Winksia. Je peux vous aider à trouver les outils IA parfaits pour vos besoins métier. Que cherchez-vous à accomplir ?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = [
    "Quels outils IA sont les meilleurs pour le service client ?",
    "Montrez-moi des solutions économiques pour PME",
    "Quels outils s'intègrent bien avec Microsoft 365 ?",
    "Quelles sont les meilleures plateformes d'analyse IA ?",
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          context: messages.slice(-5) // Envoie les 5 derniers messages comme contexte
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        recommendations: {
          primary: data.primaryRecommendation,
          alternatives: data.alternatives
        }
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erreur:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const renderToolCard = (tool: RecommendedTool, isPrimary: boolean = false) => (
    <div className={`p-4 rounded-lg border ${isPrimary ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'} mt-3`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {tool.logo && (
              <img src={tool.logo} alt={tool.name} className="w-6 h-6 rounded" />
            )}
            <h4 className="font-semibold text-gray-900">{tool.name}</h4>
            {isPrimary && <Sparkles className="w-4 h-4 text-blue-600" />}
          </div>
          <p className="text-sm text-gray-600 mb-2">{tool.price}</p>
          {tool.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{tool.rating}/5</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {tool.strengths.slice(0, 3).map((strength, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
        {tool.url && (
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => window.open(tool.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assistant Winksia</h2>
              <p className="text-sm text-gray-600">
                Votre expert IA pour trouver les meilleures solutions pour votre entreprise
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-xl ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Affichage des recommandations */}
                {message.recommendations?.primary && (
                  <div className="mt-4">
                    {renderToolCard(message.recommendations.primary, true)}
                    {message.recommendations.alternatives && message.recommendations.alternatives.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Alternatives :</p>
                        {message.recommendations.alternatives.map((tool, index) => (
                          <div key={tool.id} className="mb-2">
                            {renderToolCard(tool)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-xl max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions - Only show if no messages sent yet */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Questions suggérées :</p>
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 bg-transparent"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                placeholder="Posez votre question sur les outils IA..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="resize-none pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2"
              style={{ backgroundColor: "#4922f6ff" }}
            >
              <Send className="w-4 h-4" />
              Envoyer
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Appuyez sur Entrée pour envoyer • L'assistant peut faire des erreurs, vérifiez les informations importantes
          </p>
        </div>
      </div>
    </div>
  )
}