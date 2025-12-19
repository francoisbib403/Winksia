"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2, LogIn, Info } from "lucide-react"
import { apiClient } from '@/lib/api-client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenRegister: () => void
  onLoginSuccess: () => void
}

// FONCTION DE LOGIN RÉELLE - IDENTIQUE AU DASHBOARD
const loginUser = async (email: string, password: string) => {
  try {
    console.log('🔄 Tentative de connexion à:', email);
    
    const response = await apiClient.login(email, password);
    
    console.log('✅ Réponse de connexion:', response);
    
    // La réponse de votre AuthService contient { refreshToken, accessToken, user }
    // On adapte pour que ce soit compatible avec votre frontend
    return {
      access_token: response.accessToken,  // Mapping pour votre frontend
      user: response.user
    };
  } catch (error: any) {
    console.error('❌ Erreur dans loginUser:', error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.data) {
      // Erreur API structurée
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message || error.response.data.error || 'Erreur de connexion';
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // Erreur réseau
      throw new Error('Impossible de contacter le serveur. Vérifiez que votre API est démarrée.');
    } else {
      // Autre erreur
      throw new Error(error.message || 'Erreur de connexion inconnue');
    }
  }
};

export default function LoginModal({ isOpen, onClose, onOpenRegister, onLoginSuccess }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    pwd: "",
    remember: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputBase =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder:text-gray-500"

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  // FONCTION DE SOUMISSION CORRIGÉE AVEC VRAIE API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('Tentative de connexion avec:', formData.email);
      
      // Appel à votre vraie API
      const response = await loginUser(formData.email, formData.pwd);
      
      console.log('Réponse de connexion:', response);
      
      // Stocker le token et les données utilisateur - IDENTIQUE AU DASHBOARD
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
          // Aussi stocker dans l'ancien format pour compatibilité
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        
        // Callback de succès
        onLoginSuccess();
        onClose();
        
        // Message de succès avec le nom de l'utilisateur
        const userName = response.user?.firstname 
          ? `${response.user.firstname} ${response.user.lastname || ''}`.trim()
          : response.user?.email || formData.email;
          
        // Vous pouvez utiliser un toast au lieu d'alert
        console.log(`✅ Connexion réussie ! Bienvenue ${userName}`);
        
      } else {
        throw new Error('Token d\'accès manquant dans la réponse');
      }
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user');
      
    } finally {
      setIsLoading(false);
    }
  }

  // Fonction pour réinitialiser le formulaire lors de la fermeture
  const handleClose = () => {
    setFormData({ email: "", pwd: "", remember: false });
    setError(null);
    setShowPassword(false);
    onClose();
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 10, scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Se connecter</h2>
                <p className="text-indigo-100">Accédez à votre compte Winksia</p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={inputBase}
                  placeholder="votre@email.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.pwd}
                    onChange={(e) => handleInputChange("pwd", e.target.value)}
                    className={`${inputBase} pr-12`}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => handleInputChange("remember", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.pwd}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <button
                onClick={() => {
                  handleClose();
                  onOpenRegister();
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                disabled={isLoading}
              >
                S'inscrire gratuitement
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}