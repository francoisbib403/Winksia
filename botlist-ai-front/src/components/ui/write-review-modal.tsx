"use client"
import React, { useState } from "react"
import { X, Star, Loader2, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  onAddReview: (rating: number, comment: string) => Promise<void>
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  toolName,
  onAddReview,
}: WriteReviewModalProps) {
  const [newReviewRating, setNewReviewRating] = useState(0)
  const [newReviewComment, setNewReviewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (newReviewRating > 0 && newReviewComment.trim() !== "") {
      try {
        setIsLoading(true)
        setError(null)
        
        await onAddReview(newReviewRating, newReviewComment.trim())
        
        // Afficher le message de succès
        setIsSuccess(true)
        
        // Fermer la modal après 2 secondes
        setTimeout(() => {
          setNewReviewRating(0)
          setNewReviewComment("")
          setIsSuccess(false)
          setIsLoading(false)
          onClose()
        }, 2000)
        
      } catch (err) {
        setError("Erreur lors de l'envoi de votre avis. Veuillez réessayer.")
        setIsLoading(false)
      }
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setNewReviewRating(0)
      setNewReviewComment("")
      setIsSuccess(false)
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Écrire un avis pour {toolName}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Fermer le formulaire d'avis"
            className="text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Avis envoyé avec succès !</h3>
                <p className="text-green-700">Merci pour votre retour. La modal va se fermer automatiquement.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Review Form */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <label htmlFor="review-rating" className="block text-sm font-medium text-gray-700 mb-2">
              Votre note
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= newReviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  } ${isLoading || isSuccess ? "cursor-not-allowed opacity-50" : "hover:text-yellow-400"}`}
                  onClick={() => {
                    if (!isLoading && !isSuccess) {
                      setNewReviewRating(star)
                    }
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
              Votre commentaire
            </label>
            <Textarea
              id="review-comment"
              placeholder="Partagez votre expérience avec cet outil..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              rows={6}
              disabled={isLoading || isSuccess}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3 shadow-sm">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
            className="disabled:opacity-50"
          >
            {isSuccess ? "Fermer" : "Annuler"}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={newReviewRating === 0 || newReviewComment.trim() === "" || isLoading || isSuccess}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi...
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Envoyé !
              </div>
            ) : (
              "Soumettre l'avis"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}