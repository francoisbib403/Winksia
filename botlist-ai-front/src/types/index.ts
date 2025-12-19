// types/index.ts
export type UserRole = 'user' | 'expert' | 'admin' | 'moderator';
export type SubscriptionStatus = 'free' | 'premium' | 'enterprise' | 'cancelled' | 'expired';
export type CompanySize = 'freelance' | 'startup' | 'sme' | 'enterprise' | 'corporation';
export type PricingModel = 'free' | 'freemium' | 'paid' | 'enterprise' | 'api_based';
export type ToolStatus = 'draft' | 'pending' | 'published' | 'archived' | 'flagged';

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  company?: string;
  job_title?: string;
  company_size?: CompanySize;
  industry?: string;
  role: UserRole;
  language: string;
  timezone: string;
  email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  icon?: string;
  color_theme?: string;
  image_url?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order: number;
  level: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: Date;
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  long_description?: string;
  category_id: string;
  subcategory_id?: string;
  pricing_model: PricingModel;
  status: ToolStatus;
  website_url: string;
  logo_url?: string;
  demo_url?: string;
  documentation_url?: string;
  github_url?: string;
  api_available: boolean;
  api_documentation_url?: string;
  open_source: boolean;
  self_hosted_available: boolean;
  tech_stack: string[];
  supported_languages: string[];
  supported_formats: Record<string, string[]>;
  integrations: string[];
  platforms: string[];
  gdpr_compliant: boolean;
  soc2_certified: boolean;
  hipaa_compliant: boolean;
  data_residency: string[];
  pricing_details: Record<string, any>;
  overall_rating: number;
  performance_score?: number;
  ease_of_use_score?: number;
  value_for_money_score?: number;
  support_score?: number;
  view_count: number;
  review_count: number;
  bookmark_count: number;
  click_count: number;
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  features: string[];
  use_cases: string[];
  screenshots: string[];
  videos: string[];
  created_by?: string;
  verified_by?: string;
  verified_at?: Date;
  featured: boolean;
  featured_until?: Date;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  last_crawled_at?: Date;
  
  // Relations
  category?: Category;
  tags?: Tag[];
}

export interface DashboardStats {
  totalTools: number;
  publishedTools: number;
  pendingTools: number;
  totalCategories: number;
  totalUsers: number;
  totalReviews: number;
  averageRating: number;
  monthlyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'tool_created' | 'tool_published' | 'review_added' | 'user_registered';
  title: string;
  description: string;
  user?: string;
  tool?: string;
  timestamp: Date;
}

export interface PopularTool {
  id: string;
  name: string;
  category: string;
  rating: number;
  views: number;
  status: ToolStatus;
}