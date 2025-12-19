"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2, Mail, User, Building, CheckCircle } from "lucide-react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin: () => void
  onRegistrationSuccess: (activationToken: string, email: string) => void
  initialEmail?: string
}

interface RegisterFormData {
  email: string
  username: string
  firstname: string
  lastname: string
  company?: string
  jobTitle?: string
  companySize?: string
  industry?: string
  pwd: string
  confirmPassword: string
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

export default function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
  onRegistrationSuccess,
  initialEmail,
}: RegisterModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    company: "",
    jobTitle: "",
    companySize: "",
    industry: "",
    pwd: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  useEffect(() => {
    if (isOpen && initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }))
    }
  }, [isOpen, initialEmail])

  // Classes standardisées avec texte/placeholder visibles
  const baseInput =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
  const baseInputSm =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
  const inputWithIcon = "pl-10 pr-3 " + baseInputSm
  const inputPassword = "pr-10 " + baseInputSm
  const selectClasses =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"

  const steps = [
    { id: 1, title: "Informations personnelles", icon: User },
    { id: 2, title: "Informations professionnelles", icon: Building },
    { id: 3, title: "Sécurité", icon: CheckCircle },
  ]

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const generateUsername = (firstname: string, lastname: string) => {
    return (firstname + lastname).toLowerCase().replace(/\s+/g, "")
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.firstname && formData.lastname)
      case 2:
        return true
      case 3:
        return !!(
          formData.pwd &&
          formData.confirmPassword &&
          formData.pwd === formData.confirmPassword &&
          formData.pwd.length >= 6 &&
          formData.acceptTerms
        )
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(3, prev + 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setError(null)

    try {
      const username = formData.username || generateUsername(formData.firstname, formData.lastname)

      setTimeout(() => {
        onRegistrationSuccess("demo-token", formData.email)
        setIsSubmitting(false)
      }, 2000)
    } catch (error: any) {
      console.error("Erreur inscription:", error)
      setError("Erreur lors de l'inscription")
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={inputWithIcon}
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => {
                    handleInputChange("firstname", e.target.value)
                    if (!formData.username) {
                      const newUsername = generateUsername(e.target.value, formData.lastname)
                      handleInputChange("username", newUsername)
                    }
                  }}
                  className={baseInputSm}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => {
                    handleInputChange("lastname", e.target.value)
                    if (!formData.username) {
                      const newUsername = generateUsername(formData.firstname, e.target.value)
                      handleInputChange("username", newUsername)
                    }
                  }}
                  className={baseInputSm}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={baseInput}
                placeholder="johndoe"
              />
              <p className="text-xs text-gray-500 mt-1">Sera généré automatiquement si laissé vide</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles</h3>
              <p className="text-sm text-gray-600">Ces informations nous aident à personnaliser votre expérience</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className={baseInput}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poste / Fonction</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className={baseInput}
                placeholder="Développeur, Chef de projet, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille d'entreprise</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleInputChange("companySize", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Sélectionner</option>
                  {companySizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Sélectionner</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Sécurité du compte</h3>
              <p className="text-sm text-gray-600">Créez un mot de passe sécurisé</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.pwd}
                  onChange={(e) => handleInputChange("pwd", e.target.value)}
                  className={inputPassword}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={inputPassword}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                J'accepte les{" "}
                <button type="button" className="text-indigo-600 hover:underline">
                  conditions d'utilisation
                </button>{" "}
                et la{" "}
                <button type="button" className="text-indigo-600 hover:underline">
                  politique de confidentialité
                </button>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 10, scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Créer un compte</h2>
                <p className="text-indigo-100">Étape {currentStep} sur 3</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? "bg-indigo-600" : "bg-gray-300"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              {steps.map((step) => (
                <span key={step.id} className="font-medium text-center w-20">
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Précédent
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Déjà un compte ?
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!validateStep(3) || isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Créer le compte</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
