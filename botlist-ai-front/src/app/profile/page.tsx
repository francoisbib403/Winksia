"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/header";
import UserAccountAvatar, { UserData } from "@/app/components/UserAccountAvatar";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les données utilisateur
    const userData = localStorage.getItem("user_data") || localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erreur parsing user data:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleProfileSave = (updatedUser: UserData) => {
    // Sauvegarder les données mises à jour
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setMessage("Profil mis à jour avec succès !");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vous n'êtes pas connecté
          </h1>
          <a
            href="/login"
            className="px-6 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Préparer les données pour UserAccountAvatar
  const userData: UserData = {
    name: user.firstname && user.lastname 
      ? `${user.firstname} ${user.lastname}`
      : user.firstname || user.email?.split("@")[0] || "Utilisateur",
    email: user.email || "",
    avatar: user.avatar_url || user.picture || user.photo_url || "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mon Profil
        </h1>
        
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-6 mb-8">
            <UserAccountAvatar
              user={userData}
              onProfileSave={handleProfileSave}
              onLogout={handleLogout}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {userData.name}
              </h2>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du compte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <p className="text-gray-900">{user.firstname || "-"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <p className="text-gray-900">{user.lastname || "-"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user.email || "-"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <p className="text-gray-900 capitalize">{user.role || "Utilisateur"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membre depuis
                </label>
                <p className="text-gray-900">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dernière connexion
                </label>
                <p className="text-gray-900">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
