"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Heart
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

interface LoginFormData {
  email: string
  firstname: string
  lastname: string
  password: string
  remember: boolean
}

interface RegisterFormData {
  email: string
  firstname: string
  lastname: string
  password: string
  acceptTerms: boolean
}

const companySizes = [
  { value: "1-10", label: "1-10 employés" },
  { value: "11-50", label: "11-50 employés" },
  { value: "51-200", label: "51-200 employés" },
  { value: "201-1000", label: "201-1000 employés" },
  { value: "1000+", label: "1000+ employés" },
]

const industries = [
  { value: "technology", label: "Technologie" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "marketing", label: "Marketing" },
  { value: "consulting", label: "Conseil" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Autre" },
]

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    remember: false,
  })

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    acceptTerms: false,
  })

  // Classes CSS réutilisables
  const inputBase = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder:text-gray-500"
  const inputSm = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
  const inputWithIcon = "pl-10 pr-3 " + inputSm
  const inputPassword = "pr-10 " + inputSm
  const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"

  const handleInputChange = (formType: "login" | "register", field: string, value: string | boolean) => {
    if (formType === "login") {
      setLoginForm(prev => ({ ...prev, [field]: value }))
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }))
    }
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(loginForm.email, loginForm.password)
      
      if (response.accessToken) {
        localStorage.setItem('access_token', response.accessToken)
        localStorage.setItem('user_data', JSON.stringify(response.user))
        localStorage.setItem("user", JSON.stringify(response.user))
        
        // Redirection après connexion réussie
        window.location.href = '/outils'
      } else {
        throw new Error('Token d\'accès manquant')
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Erreur de connexion')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = (provider: 'google' | 'microsoft') => {
    // Redirection vers l'API d'authentification sociale
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.location.href = `${baseUrl}/auth/${provider}`
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulation d'inscription - à remplacer par l'API réelle
      setTimeout(() => {
        alert('Inscription réussie ! Vérifiez votre email.')
        setIsLogin(true)
        setIsLoading(false)
      }, 2000)
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      setError('Erreur lors de l\'inscription')
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex overflow-hidden items-center">
      {/* Section gauche - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center text-xl font-bold text-gray-900 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            WINKSIA
          </Link>

          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Votre assistant IA pour découvrir les meilleurs outils
          </h1>

          <p className="text-base xl:text-lg text-gray-600 mb-6 leading-relaxed">
            Découvrez, comparez et adoptez les outils d'intelligence artificielle les plus adaptés à votre entreprise.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sécurisé et privé</h3>
                <p className="text-gray-600">Vos données sont protégées avec les plus hauts standards</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Installation rapide</h3>
                <p className="text-gray-600">Accédez immédiatement à plus de 1000 outils IA</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Support dédié</h3>
                <p className="text-gray-600">Notre équipe vous accompagne dans votre transformation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaires */}
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
            {/* Toggle buttons */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  isLogin
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LogIn className="w-5 h-5 inline mr-2" />
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  !isLogin
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Inscription
              </button>
            </div>

            {/* Formulaire de connexion */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => handleInputChange("login", "email", e.target.value)}
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
                            value={loginForm.firstname}
                            onChange={(e) => handleInputChange("login", "firstname", e.target.value)}
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
                          value={loginForm.lastname}
                          onChange={(e) => handleInputChange("login", "lastname", e.target.value)}
                          className={inputSm}
                          placeholder="Doe"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => handleInputChange("login", "password", e.target.value)}
                          className={inputWithIcon.replace("pl-10", "pl-10 pr-10")}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
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
                    </div>

                    {/* Séparateur */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou continuer avec</span>
                      </div>
                    </div>

                    {/* Boutons sociaux */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('google')}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                    <button
                      type="submit"
                      disabled={isLoading || !loginForm.email || !loginForm.firstname || !loginForm.lastname || !loginForm.password}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          <span>Se connecter</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Pas encore de compte ?{" "}
                      <button
                        onClick={switchMode}
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        S'inscrire gratuitement
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Formulaire d'inscription simplifié
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => handleInputChange("register", "email", e.target.value)}
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
                            value={registerForm.firstname}
                            onChange={(e) => handleInputChange("register", "firstname", e.target.value)}
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
                          value={registerForm.lastname}
                          onChange={(e) => handleInputChange("register", "lastname", e.target.value)}
                          className={inputSm}
                          placeholder="Doe"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={(e) => handleInputChange("register", "password", e.target.value)}
                          className={inputWithIcon.replace("pl-10", "pl-10 pr-10")}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
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
                    </div>

                    {/* Séparateur */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou continuer avec</span>
                      </div>
                    </div>

                    {/* Boutons sociaux */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('google')}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        checked={registerForm.acceptTerms}
                        onChange={(e) => handleInputChange("register", "acceptTerms", e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        required
                        disabled={isLoading}
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                        J'accepte les{" "}
                        <button type="button" className="text-blue-600 hover:underline">
                          conditions d'utilisation
                        </button>{" "}
                        et la{" "}
                        <button type="button" className="text-blue-600 hover:underline">
                          politique de confidentialité
                        </button>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !registerForm.email || !registerForm.firstname || !registerForm.lastname || !registerForm.password || !registerForm.acceptTerms}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                      <button
                        onClick={switchMode}
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        Se connecter
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              En vous connectant, vous acceptez nos{" "}
              <button className="text-blue-600 hover:underline">Conditions d'utilisation</button>{" "}
              et notre{" "}
              <button className="text-blue-600 hover:underline">Politique de confidentialité</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}