"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseAuthClient } from "@/lib/supabase-auth"

export default function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")

  useEffect(() => {
    const handleCallback = async () => {
      // Get hash from URL (Supabase OAuth returns tokens in hash fragment)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessTokenFromHash = hashParams.get("access_token")

      if (accessTokenFromHash) {
        try {
          const client = getSupabaseAuthClient()
          const { data, error } = await client.auth.getSession()
          
          if (error) {
            console.error("❌ Supabase session error:", error)
            setStatus("error")
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
              
              // Set cookies for middleware
              const cookieExpiry = "; max-age=3600; path=/; SameSite=Lax"
              document.cookie = `access_token=${accessToken}${cookieExpiry}`
              document.cookie = `user_data=${JSON.stringify(userData)}${cookieExpiry}`
            }
            
            console.log("✅ OAuth successful, redirecting to /outils...")
            window.location.href = "/outils"
            return
          }
        } catch (err: any) {
          console.error("❌ OAuth session error:", err)
          setStatus("error")
        }
      }
    }

    handleCallback()
  }, [])

  // Don't render anything visible - just process in background
  return null
}
