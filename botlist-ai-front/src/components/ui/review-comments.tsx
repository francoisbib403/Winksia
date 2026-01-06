"use client"

import React, { useState } from "react"
import { MessageCircle, Send, User, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"

type ReviewComment = {
  id: string
  comment: string
  user: {
    id: string
    firstname: string
    lastname: string
  }
  created_at: string
}

type ReviewWithComments = {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
  comments?: ReviewComment[]
}

interface ReviewCommentsProps {
  review: ReviewWithComments
  onCommentAdded?: (reviewId: string, comment: ReviewComment) => void
}

export default function ReviewComments({ review, onCommentAdded }: ReviewCommentsProps) {
  const [comments, setComments] = useState<ReviewComment[]>(review.comments || [])
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const parseApiDate = (dateString: string): string => {
    try {
      let date: Date
      if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString))
      } else {
        date = new Date(dateString)
      }
      if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0]
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return new Date().toISOString().split("T")[0]
    }
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return

    const userDataString = localStorage.getItem("user_data")
    if (!userDataString) {
      alert("Vous devez être connecté pour répondre à un avis")
      return
    }

    try {
      setIsLoading(true)
      const userData = JSON.parse(userDataString)

      const newComment = await apiClient.createReviewComment({
        review_id: review.id,
        user_id: userData.id,
        comment: replyText.trim(),
      })

      const formattedComment: ReviewComment = {
        id: newComment.id,
        comment: newComment.comment,
        user: newComment.user,
        created_at: new Date().toISOString(),
      }

      const updatedComments = [...comments, formattedComment]
      setComments(updatedComments)
      setReplyText("")
      setIsReplying(false)

      if (onCommentAdded) {
        onCommentAdded(review.id, formattedComment)
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de la réponse:", err)
      alert("Erreur lors de l'envoi de votre réponse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-3 ml-4 border-l-2 border-blue-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-medium text-sm text-gray-900">
                  {comment.user?.firstname || ""} {comment.user?.lastname || ""}
                </span>
                <span className="text-xs text-gray-500">
                  • {parseApiDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {isReplying ? (
        <div className="ml-4 space-y-3">
          <Textarea
            placeholder="Rédigez votre réponse..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 text-sm px-3 py-1.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Envoi...
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Répondre
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsReplying(false)
                setReplyText("")
              }}
              disabled={isLoading}
              className="text-gray-600 border-gray-300 hover:bg-gray-50 text-sm px-3 py-1.5"
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setIsReplying(true)}
          className="text-blue-600 hover:bg-blue-50 text-sm px-0 py-1"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Répondre à cet avis
        </Button>
      )}
    </div>
  )
}
