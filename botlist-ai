// Types pour l'authentification JWT
export enum TOKEN_ROLE {
  AUTH = 'AUTH',
  AUTH_ADMIN = 'AUTH_ADMIN',
  ACTIVATE = 'ACTIVATE',
  CODE_RESET = 'CODE_RESET',
  RESET = 'RESET',
  CODE_EMAIL = 'CODE_EMAIL',
  TWO_FACTOR = 'TWO_FACTOR',
  EMAIL = 'EMAIL',
}

export interface JwtPayload {
  email: string;
  role: TOKEN_ROLE;
}

export interface JwtRefreshPayload {
  email: string;
  sessionId: string;
}

// Types pour les réponses d'authentification
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

// Type utilisateur pour les réponses API
export interface UserResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  role: string;
  isActive: boolean;
  isPublicProfile: boolean;
  preferredLanguage: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

// Conversion de l'entité User (format DB) vers UserResponse
export function userToResponse(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname || user.first_name || '',
    lastname: user.lastname || user.last_name || '',
    avatarUrl: user.avatarUrl || user.avatar_url,
    bio: user.bio,
    website: user.website,
    company: user.company,
    jobTitle: user.job_title || user.jobTitle,
    role: user.role || 'user',
    isActive: user.isActive ?? user.is_active ?? false,
    isPublicProfile: user.isPublicProfile ?? user.is_public_profile ?? true,
    preferredLanguage: user.preferredLanguage ?? user.preferred_language ?? 'fr',
    emailNotifications: user.emailNotifications ?? user.email_notifications ?? true,
    pushNotifications: user.pushNotifications ?? user.push_notifications ?? false,
    theme: user.theme || 'light',
    createdAt: user.createdAt || user.created_at,
    updatedAt: user.updatedAt || user.updated_at,
  };
}
