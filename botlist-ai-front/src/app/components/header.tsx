"use client";

import { Eye, LogOut } from "lucide-react";
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

  // FONCTION POUR OBTENIR LES INITIALES
  const getUserInitials = () => {
    if (!currentUser) return '?';
    const firstname = currentUser.firstname || '';
    const lastname = currentUser.lastname || '';
    if (firstname && lastname) {
      return `${firstname[0]}${lastname[0]}`.toUpperCase();
    }
    if (firstname) {
      return firstname.slice(0, 2).toUpperCase();
    }
    if (currentUser.email) {
      return currentUser.email[0].toUpperCase();
    }
    return '?';
  };

  // VÉRIFIER SI L'UTILISATEUR A UN VRAI AVATAR (URL EXTERNE COMME GOOGLE)
  const hasExternalAvatar = currentUser?.avatar_url || currentUser?.picture || currentUser?.photo_url;

  return (
    <>
      <header className="w-full px-16 py-4 bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="grid grid-cols-3 items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-4 justify-self-start">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">WINKSIA</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 justify-self-center">
            <a href="#" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Accueil
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              À propos
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Témoignage
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Buttons */}
          <div className="flex items-center gap-3 justify-self-end">
            {/* SECTION UTILISATEUR AVEC AVATAR PERSONNALISÉ */}
            {isAuthenticated && currentUser ? (
              <button
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
                type="button"
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-controls="radix-_r_0_"
                data-state="closed"
                onClick={handleLogout}
              >
                {hasExternalAvatar ? (
                  /* biome-ignore lint/performance/noImgElement: Using img for external avatar */
                  <img
                    alt={getUserDisplayName()}
                    className="h-full w-full rounded-full object-cover"
                    src={hasExternalAvatar}
                  />
                ) : (
                  <span className="text-sm">{getUserInitials()}</span>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-all hover:scale-105"
                >
                  S'inscrire →
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
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