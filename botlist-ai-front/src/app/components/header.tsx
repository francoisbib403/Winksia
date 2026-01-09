"use client";

import { Eye, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link"
import React, { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import OTPModal from './OTPModal';
import SuccessModal from './SuccessModal';
import LoginModal from './LoginModal';
import * as Popover from '@radix-ui/react-popover';

// Fonction utilitaire pour supprimer tous les cookies
function deleteAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
  }
}

// Fonction pour effacer le localStorage complètement
function clearAllStorage() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.clear();
}

export default function Header() {
  // ÉTATS D'AUTHENTIFICATION - IDENTIQUES AU DASHBOARD
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // FONCTION DE LOGOUT UNIFIÉE
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 Déconnexion en cours...');
    // Utilise le helper commun (efface cookies + storage + refresh cookie côté serveur)
    const { logoutClient } = await import('@/lib/logout');
    await logoutClient('/');
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
            {/* SECTION UTILISATEUR AVEC MENU PROFILE */}
            {isAuthenticated && currentUser ? (
              <Popover.Root open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <Popover.Trigger asChild>
                  <button
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors relative"
                    type="button"
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
                </Popover.Trigger>
                
                <Popover.Portal>
                  <Popover.Content
                    className="w-56 bg-white rounded-lg shadow-lg border p-2 z-50"
                    sideOffset={5}
                    align="end"
                  >
                    {/* User info */}
                    <div className="px-3 py-2 border-b mb-2">
                      <p className="font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                    
                    {/* Menu items */}
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        <span>Mon profil</span>
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Administration</span>
                      </Link>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                    
                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
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