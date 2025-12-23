"use client";

import { LogOut, Eye } from "lucide-react";
import Link from "next/link"
import React, { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import OTPModal from './OTPModal';
import SuccessModal from './SuccessModal';
import LoginModal from './LoginModal';

export default function Header() {
  // ÉTATS D'AUTHENTIFICATION - IDENTIQUES AU DASHBOARD
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Registration flow data
  const [activationToken, setActivationToken] = useState("")
  const [registrationEmail, setRegistrationEmail] = useState("")

  // VÉRIFICATION DE L'AUTHENTIFICATION AU CHARGEMENT - IDENTIQUE AU DASHBOARD
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('Utilisateur connecté dans Header:', user);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user'); // Nettoyage ancien format
      }
    }
  }, []);

  const handleRegistrationSuccess = (token: string, email: string) => {
    setActivationToken(token)
    setRegistrationEmail(email)
    setIsRegisterModalOpen(false)
    setIsOTPModalOpen(true)
  }

  const handleOTPVerificationSuccess = () => {
    setIsOTPModalOpen(false)
    setIsSuccessModalOpen(true)
  }

  // FONCTION DE LOGIN SUCCESS CORRIGÉE
  const handleLoginSuccess = () => {
    // Récupérer les données depuis le nouveau format (priorité)
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('Login success - utilisateur connecté:', user);
        
        // Message de succès
        const userName = user.firstname && user.lastname 
          ? `${user.firstname} ${user.lastname}`
          : user.email;
        console.log(`✅ Connexion réussie ! Bienvenue ${userName}`);
        
      } catch (error) {
        console.error('Erreur lors du login success:', error);
      }
    } else {
      // Fallback vers l'ancien format si nécessaire
      const oldUserData = localStorage.getItem("user");
      if (oldUserData) {
        try {
          const user = JSON.parse(oldUserData);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur parsing ancien format user:', error);
        }
      }
    }
  }

  // FONCTION DE LOGOUT CORRIGÉE - IDENTIQUE AU DASHBOARD
  const handleLogout = () => {
    // Nettoyer tous les formats de stockage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user'); // Ancien format
    
    // Réinitialiser les états
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    console.log('✅ Déconnexion réussie !');
    
    // Optionnel: redirection ou toast
    // window.location.reload(); // Si vous voulez recharger la page
  }

  const openRegisterModal = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(true)
  }

  const openLoginModal = () => {
    setIsRegisterModalOpen(false)
    setIsLoginModalOpen(true)
  }

  // AFFICHAGE DU NOM UTILISATEUR AMÉLIORÉ
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    
    // Priorité: prénom/nom, sinon email avant @
    if (currentUser.firstname && currentUser.lastname) {
      return `${currentUser.firstname} ${currentUser.lastname}`;
    } else if (currentUser.firstname) {
      return currentUser.firstname;
    } else if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Utilisateur';
  };

  return (
    <>
      <header className="w-full px-6 py-4 bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">WINKSIA</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/outils" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Outils
            </Link>
            <Link href="/assistant" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Chat
            </Link>
            <Link href="#" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Rankings
            </Link>

            {/* SECTION UTILISATEUR CORRIGÉE */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    Bonjour, {getUserDisplayName()}
                  </span>
                  {currentUser.role && (
                    <div className="text-xs text-gray-400">
                      {currentUser.role}
                    </div>
                  )}
                </div>
                
                {/* Avatar utilisateur (optionnel) */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser.firstname 
                      ? currentUser.firstname[0].toUpperCase() 
                      : currentUser.email[0].toUpperCase()
                    }
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={openLoginModal}
                  className="px-4 py-2 text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={openRegisterModal}
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-all hover:scale-105"
                >
                  S'inscrire →
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onOpenLogin={openLoginModal}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenRegister={openRegisterModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerificationSuccess={handleOTPVerificationSuccess}
        email={registrationEmail}
        activationToken={activationToken}
      />

      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
    </>
  )
}