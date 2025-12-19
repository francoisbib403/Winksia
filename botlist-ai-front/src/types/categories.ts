// types/categories.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
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

// Interface pour les catégories affichées dans les listes ou les menus
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color_theme?: string;
  image_url?: string;
  is_active: boolean;
}

// Interface pour la création ou modification de catégorie
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  parent_id?: string;
  icon?: string;
  color_theme?: string;
  image_url?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
  level?: number;
  is_active?: boolean;
}

// Interface pour les filtres de recherche de catégories
export interface CategoryFilters {
  search?: string;
  parent_id?: string;
  level?: number;
  is_active?: boolean;
  sort_by?: 'name' | 'created_at' | 'sort_order';
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
export interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  category_id?: string;
  created_at: Date;
  updated_at: Date;
}
