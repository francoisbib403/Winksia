// lib/api-client.ts
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
    status: string;
    activate: boolean;
    auth_type: string;
    slug?: string;
    created_at: string;
    updated_at: string;
    emailVerified?: boolean;
    emailVerifiedAt?: string;
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
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      timeout: 15000,
      withCredentials: true,
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
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
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshResponse = await this.instance.post('/auth/refresh');
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
        
        console.error('❌ API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: (error.config?.baseURL || '') + (error.config?.url || ''),
          message: error.message,
        });
        
        return Promise.reject(error);
      }
    );
  }

  // Méthodes HTTP génériques
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
    const response = await this.post<LoginResponse>('/auth/login', {
      email,
      pwd: password,
    });
    
    if (typeof window !== 'undefined' && response.accessToken) {
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const result = await this.post<{ message: string }>('/auth/logout');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    
    return result;
  }

  async register(userData: {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    company?: string;
    jobTitle?: string;
    companySize?: string;
    industry?: string;
    pwd: string;
  }) {
    return this.post('/auth/register', userData);
  }

  async refreshToken(): Promise<{ accessToken: string; user: any }> {
    return this.post('/auth/refresh');
  }

  // Méthodes pour les utilisateurs
  async getUsers() {
    return this.get('/user');
  }

  async createUser(userData: any) {
    return this.post('/user', userData);
  }

  async updateUser(userId: string, userData: any) {
    return this.patch(`/user/${userId}`, userData);
  }

  async deleteUser(userId: string) {
    return this.delete(`/user/${userId}`);
  }

  // Méthodes pour les outils
  async getTools() {
    return this.get('/tools');
  }

  async createTool(toolData: any) {
    return this.post('/tools', toolData);
  }

  async updateTool(toolId: string, toolData: any) {
    return this.patch(`/tools/${toolId}`, toolData);
  }

  // Méthodes pour les catégories
  async getCategories() {
    return this.get('/categories');
  }

  async createCategory(categoryData: any) {
    return this.post('/categories', categoryData);
  }

  async updateCategory(categoryId: string, categoryData: any) {
    return this.patch(`/categories/${categoryId}`, categoryData);
  }

  // 🆕 MÉTHODES POUR LES REVIEWS
 // ✅ DANS api-client.ts - VÉRIFIEZ QUE CETTE MÉTHODE EXISTE ET FILTRE BIEN
async getReviews(toolId?: string): Promise<ReviewResponse[]> {
  const url = toolId ? `/reviews?tool_id=${toolId}` : '/reviews';
  return this.get(url);
}

  async createReview(reviewData: CreateReviewRequest): Promise<ReviewResponse> {
    return this.post('/reviews', reviewData);
  }

  async updateReview(reviewId: string, reviewData: Partial<CreateReviewRequest>): Promise<ReviewResponse> {
    return this.patch(`/reviews/${reviewId}`, reviewData);
  }

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return this.delete(`/reviews/${reviewId}`);
  }

  // Méthode pour récupérer les reviews d'un outil spécifique
  async getToolReviews(toolId: string): Promise<ReviewResponse[]> {
    return this.get(`/tools/${toolId}/reviews`);
  }

  // Méthode pour approuver/rejeter une review (admin)
  async updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED'): Promise<ReviewResponse> {
    return this.patch(`/reviews/${reviewId}/status`, { status });
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Export pour une utilisation directe
export default apiClient;
