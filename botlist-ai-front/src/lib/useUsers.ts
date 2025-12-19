// lib/useUsers.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-dev.winksia.com/';

// ⚠️ ATTENTION: Ce token a le rôle "AUTH" mais votre backend nécessite "ADMIN" pour GET /user
// Vous devrez créer un token avec rôle ADMIN ou modifier temporairement votre backend
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imphc29ubWFtcG91eWEucHJvQGdtYWlsLmNvbSIsInJvbGUiOiJBVVRIIiwiaWF0IjoxNzU0MzAyODQ0LCJleHAiOjE3NTczMDI4NDR9.juqer9n91qXPcV-zYxAliFeELzYmONzyfrIQ0nAAUTA';

const authHeader = {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
};

/**
 * Réponse pour les utilisateurs actifs
 */
export interface ActiveUsersResponse {
  active_users: number;
  previous_period?: number;
}

/**
 * Interface User mise à jour selon votre entité NestJS
 */
export interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  role?: string;
  status?: string;
  activate?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Récupérer tous les utilisateurs depuis /user (NestJS)
 * ATTENTION: Nécessite un token avec rôle ADMIN
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('🔄 Appel API getAllUsers:', `${API_BASE_URL}/user`);
    console.log('🔑 Token utilisé (début):', TOKEN.substring(0, 50) + '...');
    
    const response = await axios.get<User[]>(
      `${API_BASE_URL}/user`, // CORRIGÉ: /users -> /user
      authHeader
    );
    
    console.log('✅ Utilisateurs récupérés:', response.data.length);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erreur getAllUsers:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: `${API_BASE_URL}/user`,
      headers: error.response?.config?.headers
    });
    
    // Messages d'erreur spécifiques
    if (error.response?.status === 403) {
      console.error('🚫 Erreur 403: Token sans rôle ADMIN requis');
      throw new Error('Accès refusé: Votre token doit avoir le rôle ADMIN pour accéder aux utilisateurs');
    }
    
    if (error.response?.status === 401) {
      console.error('🔐 Erreur 401: Token invalide ou expiré');  
      throw new Error('Non autorisé: Token invalide ou expiré');
    }
    
    if (error.response?.status === 404) {
      console.error('🔍 Erreur 404: Route non trouvée');
      throw new Error('Route non trouvée: Vérifiez que votre API est démarrée sur ' + API_BASE_URL);
    }
    
    throw error;
  }
};

/**
 * Récupérer le nombre d'utilisateurs actifs
 * Cette route n'existe pas dans votre backend, on simule avec tous les users
 */
export const getActiveUsers = async (days = 30): Promise<ActiveUsersResponse> => {
  try {
    console.log('🔄 Simulation getActiveUsers (route non disponible dans le backend)');
    
    // Votre backend n'a pas cette route, on récupère tous les users
    const allUsers = await getAllUsers();
    
    // Simulation: utilisateurs actifs = activate: true ET status != 'BLOCKEd'
    const activeUsers = allUsers.filter(user => 
      user.activate === true && user.status !== 'BLOCKEd'
    ).length;
    
    // Simulation du pourcentage de croissance (85% de la valeur actuelle)
    const previousPeriod = Math.max(1, Math.floor(activeUsers * 0.85));
    
    console.log('📊 Stats calculées:', { activeUsers, previousPeriod });
    
    return {
      active_users: activeUsers,
      previous_period: previousPeriod
    };
    
  } catch (error) {
    console.error('❌ Erreur getActiveUsers:', error);
    // En cas d'erreur, retourner des données par défaut
    return {
      active_users: 0,
      previous_period: 0
    };
  }
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await axios.get<User>(
      `${API_BASE_URL}/user/${id}`, // CORRIGÉ: /users -> /user
      authHeader
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur getUserById:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 * Utilise la route /user/me de votre backend
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await axios.get<User>(
      `${API_BASE_URL}/user/me`,
      authHeader
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur getCurrentUser:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Créer un nouvel utilisateur (nécessite rôle ADMIN)
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await axios.post<User>(
      `${API_BASE_URL}/user`,
      userData,
      authHeader
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur createUser:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mettre à jour un utilisateur (nécessite rôle ADMIN)
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await axios.patch<User>(
      `${API_BASE_URL}/user/${id}`,
      userData,
      authHeader
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur updateUser:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Supprimer un utilisateur (nécessite rôle ADMIN)
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/user/${id}`,
      authHeader
    );
    console.log('✅ Utilisateur supprimé:', id);
  } catch (error: any) {
    console.error('❌ Erreur deleteUser:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Changer le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (currentPwd: string, newPwd: string): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/user/change-password`,
      { pwd: currentPwd, newPwd },
      authHeader
    );
    console.log('✅ Mot de passe changé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur changePassword:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction utilitaire pour vérifier le token
export const checkTokenValidity = (): boolean => {
  try {
    const payload = JSON.parse(atob(TOKEN.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('🔍 Vérification du token:', {
      email: payload.email,
      role: payload.role,
      exp: new Date(payload.exp * 1000).toLocaleString(),
      isExpired: payload.exp < currentTime
    });
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('❌ Token invalide:', error);
    return false;
  }
};

// Fonction pour obtenir les infos du token
export const getTokenInfo = () => {
  try {
    const payload = JSON.parse(atob(TOKEN.split('.')[1]));
    return {
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      isExpired: payload.exp < Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    return null;
  }
};