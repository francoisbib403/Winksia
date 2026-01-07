"use client"

import { useState } from "react"
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  Sparkles,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { ToastProvider, useToast } from "@/components/Toast"

interface RegisterFormData {
  email: string
  firstname: string
  lastname: string
  password: string
  acceptTerms: boolean
}

const benefits = [
  "Accès à +1000 outils IA",
  "Comparaison détaillée",
  "Avis et évaluations",
  "Support prioritaire"
]

function RegisterContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const [form, setForm] = useState<RegisterFormData>({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    acceptTerms: false,
  })

  const inputSm = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
  const inputWithIcon = "pl-10 pr-3 " + inputSm

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialAuth = (provider: 'google' | 'microsoft') => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.location.href = `${baseUrl}/auth/${provider}`
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!form.acceptTerms) {
      addToast("Vous devez accepter les conditions d'utilisation", 'error')
      setIsLoading(false)
      return
    }

    try {
      const response = await apiClient.register({
        email: form.email,
        firstname: form.firstname,
        lastname: form.lastname,
        password: form.password
      })
      
      if (response.accessToken) {
        // Registration successful, save tokens and redirect
        localStorage.setItem('access_token', response.accessToken)
        localStorage.setItem('refresh_token', response.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(response.user))
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Redirect to outils page
        window.location.href = '/outils'
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      addToast(error.message || 'Erreur lors de l\'inscription', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex overflow-hidden">
      {/* Section gauche - Branding + Avantages */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center text-xl font-bold text-white mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-lg mr-3 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            WINKSIA
          </Link>

          <h1 className="text-2xl xl:text-3xl font-bold mb-4 leading-tight">
            Rejoignez notre communauté d'utilisateurs
          </h1>

          <p className="text-blue-100 mb-8 leading-relaxed">
            Créez votre compte gratuit et accédez à notre catalogue de plus de 1000 outils d'intelligence artificielle.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 bg-white/30 rounded-full border-2 border-white/50" />
                ))}
              </div>
              <div>
                <p className="text-sm text-blue-100">Plus de 10,000 utilisateurs</p>
                <p className="text-xs text-blue-200">nous font confiance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center text-2xl font-bold text-gray-900 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-2 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              WINKSIA
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={inputWithIcon}
                      placeholder="votre@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={form.firstname}
                        onChange={(e) => handleInputChange("firstname", e.target.value)}
                        className={inputWithIcon}
                        placeholder="John"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={form.lastname}
                      onChange={(e) => handleInputChange("lastname", e.target.value)}
                      className={inputSm}
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={inputWithIcon.replace("pl-10", "pl-10 pr-10")}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>

                {/* Séparateur */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou s'inscrire avec</span>
                  </div>
                </div>

                {/* Boutons sociaux */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('microsoft')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Microsoft</span>
                  </button>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={form.acceptTerms}
                    onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                    className="w-5 h-5 accent-[#fdc700] border-gray-300 rounded focus:ring-[#fdc700] mt-0.5" style={{ color: 'white' }}
                    disabled={isLoading}
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    J'accepte les{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      politique de confidentialité
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !form.email || !form.firstname || !form.lastname || !form.password || !form.acceptTerms}
                  className="w-full py-4 bg-[#fdc700] text-gray-900 font-semibold rounded-xl hover:bg-[#e6b300] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Créer le compte</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <ToastProvider>
      <RegisterContent />
    </ToastProvider>
  )
}
