"use client";

import React, { useState } from 'react';
import RegisterModal from './RegisterModal';
import OTPModal from './OTPModal';
import SuccessModal from './SuccessModal';
import LoginModal from './LoginModal'; // Tu peux créer celui-ci ou utiliser celui du dashboard









import { useAuth } from '@/context/auth-context';

export default function NewsletterSection() {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [activationToken, setActivationToken] = useState("")
  const [userEmail, setUserEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setUserEmail(email)
    setShowRegisterModal(true)
  }

  const handleRegistrationSuccess = (token: string, email: string) => {
    setActivationToken(token)
    setUserEmail(email)
    setShowRegisterModal(false)
    setShowOTPModal(true)
  }

  const handleOTPVerificationSuccess = () => {
    setShowOTPModal(false)
    setShowSuccessModal(true)
  }

  const handleOpenLogin = () => {
    setShowRegisterModal(false)
    setShowOTPModal(false)
    setShowSuccessModal(false)
    setShowLoginModal(true)
  }

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem("user")
    if (userData) {
      login(JSON.parse(userData))
    }
    handleCloseAll()
  }

  const handleCloseAll = () => {
    setShowRegisterModal(false)
    setShowLoginModal(false)
    setShowOTPModal(false)
    setShowSuccessModal(false)
    setActivationToken("")
    setUserEmail("")
  }

  return (
    <>
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-12 text-center text-white"
            style={{
              background: "linear-gradient(135deg, #0d0785ff 0%, #042862ff 50%, #01287dff 100%)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Rejoignez la communauté Winksia</h2>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Découvrez, évaluez et partagez les meilleurs outils IA. Créez votre compte pour accéder à toutes les
              fonctionnalités.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 px-6 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Inscription..." : "S'inscrire"}
                </button>
              </form>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <p className="text-white font-medium">✅ Inscription réussie !</p>
                  <p className="text-white/80 text-sm mt-1">
                    Merci de votre confiance. Vous recevrez bientôt notre newsletter.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <p className="text-sm text-white/70">
                Déjà membre ?{" "}
                <button onClick={() => setShowLoginModal(true)} className="text-white font-semibold hover:underline">
                  Se connecter
                </button>
              </p>
              <p className="text-xs text-white/60">Gratuit • Pas de spam • Plus de 1000+ outils IA</p>
            </div>
          </div>
        </div>
      </section>

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleCloseAll}
        onOpenLogin={handleOpenLogin}
        onRegistrationSuccess={handleRegistrationSuccess}
        initialEmail={userEmail}
      />

      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseAll}
        email={userEmail}
        activationToken={activationToken}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />

      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseAll} />

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseAll}
        onOpenRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

