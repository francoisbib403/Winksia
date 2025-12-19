"use client"

import React from "react"
import { X, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { renderStars } from "@/utils/renderers" // Assurez-vous que ce chemin est correct

interface Review {
  id: string
  user: string
  avatar: string // URL or initial for avatar
  rating: number
  comment: string
  date: string
}

interface AllReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  reviews: Review[]
  overallRating: number
  reviewCount: number
}

export default function AllReviewsModal({
  isOpen,
  onClose,
  toolName,
  reviews,
  overallRating,
  reviewCount,
}: AllReviewsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Avis Utilisateurs pour {toolName} ({reviewCount})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fermer les avis"
            className="text-gray-400 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Overall Rating Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {typeof overallRating === 'number' ? overallRating.toFixed(1) : '0.0'}/5
              </div>
              <p className="text-gray-600 mb-4">
                à partir de {reviewCount} avis
              </p>
              {renderStars(overallRating)}
            </div>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = reviews.filter(r => r.rating === starCount).length || 0;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={starCount} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{starCount} étoiles</span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  {review.avatar.startsWith("http") ? (
                    <img src={review.avatar || "/placeholder.svg?height=40&width=40&query=abstract%20user%20avatar"} alt={review.user} className="w-10 h-10 rounded-full object-cover" />
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun avis pour le moment. Soyez le premier à en laisser un !
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
