"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getSupabaseAuthClient, getSession } from "@/lib/supabase-auth"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  // Helper function to set auth cookies
  const setAuthCookies = (accessToken: string, userData: any) => {
    // Set cookie for middleware to detect auth
    const cookieExpiry = "; max-age=3600; path=/; SameSite=Lax"
    document.cookie = `access_token=${accessToken}${cookieExpiry}`
    document.cookie = `user_data=${JSON.stringify(userData)}${cookieExpiry}`
  }

  useEffect(() => {
    const handleCallback = async () => {
      // Get hash from URL (Supabase OAuth returns tokens in hash fragment)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1)) // Remove # and parse
      const accessTokenFromHash = hashParams.get("access_token")

      // Check for tokens in URL hash
      if (accessTokenFromHash) {
        try {
          const client = getSupabaseAuthClient()
          const { data, error } = await client.auth.getSession()
          
          if (error) {
            console.error("❌ Supabase session error:", error)
            setError(error.message)
            return
          }
          
          if (data.session) {
            // Store the access token
            const accessToken = data.session.access_token
            localStorage.setItem("access_token", accessToken)
            
            // Get user info
            const user = data.session.user
            if (user) {
              const userData = {
                id: user.id,
                email: user.email,
                firstname: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || "",
                lastname: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              }
              localStorage.setItem("user_data", JSON.stringify(userData))
              localStorage.setItem("user", JSON.stringify(userData))
              
              // Set cookies for middleware
              setAuthCookies(accessToken, userData)
            }
            
            console.log("✅ Supabase OAuth successful, redirecting to /outils...")
            // Use window.location for full page redirect
            window.location.href = "/outils"
            return
          }
        } catch (err: any) {
          console.error("❌ OAuth session error:", err)
          setError(err.message || "Authentication failed")
        }
        return
      }
      
      // Check for code parameter (alternative OAuth flow)
      const code = searchParams.get("code")
      if (code) {
        try {
          const client = getSupabaseAuthClient()
          const { data, error } = await client.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error("❌ Supabase session exchange error:", error)
            setError(error.message)
            return
          }

          if (data.session) {
            const accessToken = data.session.access_token
            localStorage.setItem("access_token", accessToken)
            
            const user = data.session.user
            if (user) {
              const userData = {
                id: user.id,
                email: user.email,
                firstname: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || "",
                lastname: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              }
              localStorage.setItem("user_data", JSON.stringify(userData))
              localStorage.setItem("user", JSON.stringify(userData))
              setAuthCookies(accessToken, userData)
            }

            console.log("✅ Supabase OAuth successful, redirecting to /outils...")
            window.location.href = "/outils"
            return
          }
        } catch (err: any) {
          console.error("❌ OAuth callback error:", err)
          setError(err.message || "Authentication failed")
        }
      } else {
        // No tokens or code - check for existing session
        try {
          const session = await getSession()
          if (session) {
            const accessToken = session.access_token
            localStorage.setItem("access_token", accessToken)
            if (session.user) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                firstname: session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0] || "",
                lastname: session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
              }
              localStorage.setItem("user_data", JSON.stringify(userData))
              setAuthCookies(accessToken, userData)
            }
            window.location.href = "/outils"
            return
          } else {
            setError("No authentication data received")
          }
        } catch (err: any) {
          setError(err.message || "Authentication failed")
        }
      }
    }

    // Small delay to ensure component is mounted
    const timer = setTimeout(handleCallback, 100)
    return () => clearTimeout(timer)
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur d'authentification</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <Loader2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connexion en cours...</h2>
        <p className="text-gray-600 mt-2">Vous allez être redirigé vers votre tableau de bord.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="w-12 h-12 bg-blue-200 rounded-lg animate-pulse"></div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
