// lib/api-client.ts - API Client pour les routes Next.js locales
import axios from 'axios';

// Types pour les réponses API
export interface LoginResponse {
  refreshToken: string;
  accessToken: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    isActive: boolean;
    avatarUrl?: string;
    bio?: string;
    website?: string;
    company?: string;
    jobTitle?: string;
    isPublicProfile: boolean;
    preferredLanguage: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Types pour les reviews
export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  tool_id: string;
  user_id: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tool: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstname: string;
    lastname: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private instance: any;

  constructor() {
    // Utiliser une URL vide car les routes sont locales (/api/...)
    this.instance = axios.create({
      timeout: 15000,
      withCredentials: true, // Important pour les cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur pour les requêtes
    this.instance.interceptors.request.use(
      (config: any) => {
        // Le token d'accès est automatiquement géré par les cookies HTTP-only
        // Pas besoin de le lire depuis localStorage
        
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour les réponses
    this.instance.interceptors.response.use(
      (response: any) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;
        
        console.error('❌ API Error Details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        
        // Handle network errors
        if (error.code === 'ERR_NETWORK') {
          console.error('🌐 Network Error - API may be unreachable');
        }
        
        // Handle 401 with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshResponse = await this.instance.post('/api/auth/refresh');
            const newToken = refreshResponse.data.accessToken;
            
            if (newToken) {
              localStorage.setItem('access_token', newToken);
              localStorage.setItem('user_data', JSON.stringify(refreshResponse.data.user));
              
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Méthodes HTTP génériques - utilisent des URLs relatives locales
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  // Méthodes d'authentification
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    
    // Stocker le token d'accès pour les requêtes authentifiées
    if (typeof window !== 'undefined' && response.accessToken) {
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const result = await this.post<{ message: string }>('/api/auth/logout');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    
    return result;
  }

  async register(userData: {
    email: string;
    firstname?: string;
    lastname?: string;
    password: string;
  }): Promise<LoginResponse> {
    return this.post<LoginResponse>('/api/auth/register', userData);
  }

  async refreshToken(): Promise<{ accessToken: string; user: any }> {
    return this.post('/api/auth/refresh');
  }

  // Méthodes pour les utilisateurs
  async getUsers() {
    return this.get('/api/user');
  }

  async createUser(userData: any) {
    return this.post('/api/user', userData);
  }

  async updateUser(userId: string, userData: any) {
    return this.patch(`/api/user/${userId}`, userData);
  }

  async deleteUser(userId: string) {
    return this.delete(`/api/user/${userId}`);
  }

  // Méthodes pour les outils
  async getTools() {
    return this.get('/api/tools');
  }

  async createTool(toolData: any) {
    return this.post('/api/tools', toolData);
  }

  async updateTool(toolId: string, toolData: any) {
    return this.patch(`/api/tools/${toolId}`, toolData);
  }

  // Méthodes pour les catégories
  async getCategories() {
    return this.get('/api/categories');
  }

  async createCategory(categoryData: any) {
    return this.post('/api/categories', categoryData);
  }

  async updateCategory(categoryId: string, categoryData: any) {
    return this.patch(`/api/categories/${categoryId}`, categoryData);
  }

  // Méthodes pour les reviews
  async getReviews(toolId?: string): Promise<ReviewResponse[]> {
    const url = toolId ? `/api/reviews?tool_id=${toolId}` : '/api/reviews';
    return this.get(url);
  }

  async createReview(reviewData: CreateReviewRequest): Promise<ReviewResponse> {
    return this.post('/api/reviews', reviewData);
  }

  async updateReview(reviewId: string, reviewData: Partial<CreateReviewRequest>): Promise<ReviewResponse> {
    return this.patch(`/api/reviews/${reviewId}`, reviewData);
  }

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return this.delete(`/api/reviews/${reviewId}`);
  }

  async getToolReviews(toolId: string): Promise<ReviewResponse[]> {
    return this.get(`/api/tools/${toolId}/reviews`);
  }

  async updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED'): Promise<ReviewResponse> {
    return this.patch(`/api/reviews/${reviewId}/status`, { status });
  }

  async createReviewComment(commentData: {
    review_id: string;
    user_id: string;
    comment: string;
  }): Promise<any> {
    return this.post('/api/reviews/comments', commentData);
  }

  async getReviewComments(reviewId: string): Promise<any[]> {
    return this.get(`/api/reviews/${reviewId}/comments`);
  }

  // Health check
  async healthCheck() {
    return this.get('/api/health');
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Export pour une utilisation directe
export default apiClient;
