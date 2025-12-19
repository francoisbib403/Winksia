export enum PricingModel {
  FREE = 'free',
  FREEMIUM = 'freemium',
  PAID = 'paid',
  ENTERPRISE = 'enterprise',
  API_BASED = 'api_based',
}

export enum ToolStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FLAGGED = 'flagged',
}


export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  long_description?: string;
 
  // Relations
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug?: string;
  };
 
  // Pricing & Status
  pricing_model: PricingModel;
  status: ToolStatus;
  pricing_details?: Record<string, any>;
 
  // URLs & Media
  website_url: string;
  github_url?: string; // Added this missing property
  documentation_url?: string; // Added this missing property
  logo?: {
    id: string;
    url: string;
    filename: string;
  };
  demo?: {
    id: string;
    url: string;
    filename: string;
  };
  screenshots?: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
 
  // Technical Features
  api_available: boolean;
  api_documentation_url?: string;
  open_source: boolean;
  self_hosted_available: boolean;
  tech_stack: string[];
  supported_languages: string[];
  supported_formats: Record<string, any>;
  integrations: string[];
  platforms: string[];
 
  // Compliance & Security
  gdpr_compliant: boolean;
  soc2_certified: boolean;
  hipaa_compliant: boolean;
  data_residency: string[];
 
  // Ratings & Scores
  overall_rating: number;
  performance_score?: number;
  ease_of_use_score?: number;
  value_for_money_score?: number;
  support_score?: number;
 
  // Analytics
  view_count: number;
  review_count: number;
  bookmark_count: number;
  click_count: number;
 
  // SEO & Content
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  features: string[];
  use_cases: string[];
 
  // Management
  created_by?: string;
  verified_by?: string;
  verified_at?: Date;
  featured: boolean;
  featured_until?: Date;
 
  // Timestamps
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  last_crawled_at?: Date;
}

// Interface pour les données simplifiées (comme dans votre composant React)
export interface ToolSummary {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  pricing_model: string;
  pricing_details?: Record<string, any>;
  website_url: string;
  github_url?: string; // Added for consistency
  documentation_url?: string; // Added for consistency
  logo?: {
    id: string;
    url: string;
  };
  overall_rating: number;
  review_count: number;
  features: string[];
  use_cases: string[];
  featured: boolean;
  created_at: Date;
  published_at?: Date;
}

// Interface pour les filtres de recherche
export interface ToolFilters {
  search?: string;
  category_id?: string;
  subcategory_id?: string;
  pricing_model?: string;
  features?: string[];
  platforms?: string[];
  rating_min?: number;
  rating_max?: number;
  open_source?: boolean;
  api_available?: boolean;
  gdpr_compliant?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'rating' | 'created_at' | 'view_count';
  sort_order?: 'ASC' | 'DESC';
}

// Interface pour les statistiques d'un outil
export interface ToolStats {
  view_count: number;
  review_count: number;
  bookmark_count: number;
  click_count: number;
  overall_rating: number;
  performance_score?: number;
  ease_of_use_score?: number;
  value_for_money_score?: number;
  support_score?: number;
}