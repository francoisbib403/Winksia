// Service pour gérer les outils IA via Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ToolSummary } from '@/types/tool';

export interface ToolsFilters {
  categoryId?: string;
  pricingModel?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

// Client Supabase standard (pas admin) pour les lectures
const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [ToolsService] Missing Supabase env vars');
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Cache pour les catégories
let categoriesCache: { id: string; name: string }[] | null = null;

async function getCategories(): Promise<{ id: string; name: string }[]> {
  if (categoriesCache) return categoriesCache;
  
  try {
    const client = getSupabaseClient();
    const { data } = await client
      .from('categories')
      .select('id, name');
    
    categoriesCache = (data || []) as { id: string; name: string }[];
    return categoriesCache;
  } catch (error: any) {
    console.error('❌ [ToolsService] Error loading categories:', error.message);
    return [];
  }
}

function getCategoryName(categoryId?: string): string {
  if (!categoryId) return 'Non catégorisé';
  const categories = categoriesCache || [];
  const cat = categories.find((c: any) => c.id === categoryId);
  return cat?.name || 'Non catégorisé';
}

/**
 * Récupère tous les outils avec possibilité de filtrage
 */
export async function getTools(filters?: ToolsFilters): Promise<ToolSummary[]> {
  try {
    const client = getSupabaseClient();
    await getCategories();

    let query = client
      .from('tools')
      .select('*')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('created_at', { ascending: false });

    if (filters?.featured) {
      query = query.eq('featured', true);
    }
    if (filters?.pricingModel) {
      query = query.eq('pricing_model', filters.pricingModel);
    }
    if (filters?.categoryId) {
      query = query.eq('primary_category_id', filters.categoryId);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,tagline.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.offset !== undefined) {
      const limit = filters.limit || 20;
      query = query.range(filters.offset, filters.offset + limit - 1);
    } else if (filters?.limit) {
      query = query.range(0, filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [ToolsService] Supabase error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform to ToolSummary format avec les features真实的
    const tools: ToolSummary[] = (data || []).map((tool: any) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline || '',
      description: tool.description,
      category: {
        id: tool.primary_category_id || '',
        name: getCategoryName(tool.primary_category_id),
      },
      pricing_model: tool.pricing_model,
      pricing_details: getPricingDetails(tool.pricing_model),
      website_url: tool.website_url,
      overall_rating: tool.overall_rating || 0,
      review_count: tool.review_count || 0,
      features: tool.features || [],
      use_cases: tool.use_cases || [],
      featured: tool.featured || false,
      created_at: tool.created_at,
      published_at: tool.published_at,
    }));

    return tools;
  } catch (error: any) {
    console.error('❌ [ToolsService] Exception:', error.message);
    return [];
  }
}

/**
 * Récupère un outil par son ID
 */
export async function getToolById(id: string): Promise<ToolSummary | null> {
  try {
    const client = getSupabaseClient();
    await getCategories();

    const { data, error } = await client
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const tool: any = data;
    return {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline || '',
      description: tool.description,
      category: {
        id: tool.primary_category_id || '',
        name: getCategoryName(tool.primary_category_id),
      },
      pricing_model: tool.pricing_model,
      pricing_details: getPricingDetails(tool.pricing_model),
      website_url: tool.website_url,
      overall_rating: tool.overall_rating || 0,
      review_count: tool.review_count || 0,
      features: tool.features || [],
      use_cases: tool.use_cases || [],
      featured: tool.featured || false,
      created_at: tool.created_at,
      published_at: tool.published_at,
    };
  } catch (error: any) {
    console.error('❌ [ToolsService] Exception:', error.message);
    return null;
  }
}

/**
 * Récupère un outil par son slug
 */
export async function getToolBySlug(slug: string): Promise<ToolSummary | null> {
  try {
    const client = getSupabaseClient();
    await getCategories();

    const { data, error } = await client
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    const tool: any = data;
    return {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline || '',
      description: tool.description,
      category: {
        id: tool.primary_category_id || '',
        name: getCategoryName(tool.primary_category_id),
      },
      pricing_model: tool.pricing_model,
      pricing_details: getPricingDetails(tool.pricing_model),
      website_url: tool.website_url,
      overall_rating: tool.overall_rating || 0,
      review_count: tool.review_count || 0,
      features: tool.features || [],
      use_cases: tool.use_cases || [],
      featured: tool.featured || false,
      created_at: tool.created_at,
      published_at: tool.published_at,
    };
  } catch (error: any) {
    console.error('❌ [ToolsService] Exception:', error.message);
    return null;
  }
}

/**
 * Compte le nombre total d'outils
 */
export async function countTools(filters?: ToolsFilters): Promise<number> {
  try {
    const client = getSupabaseClient();
    let query = client
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .not('published_at', 'is', null);

    if (filters?.featured) {
      query = query.eq('featured', true);
    }
    if (filters?.pricingModel) {
      query = query.eq('pricing_model', filters.pricingModel);
    }
    if (filters?.categoryId) {
      query = query.eq('primary_category_id', filters.categoryId);
    }

    const { count, error } = await query;

    if (error) {
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    return 0;
  }
}

/**
 * Helper pour générer les détails de tarification
 */
function getPricingDetails(pricingModel: string): { price: string; type: string } {
  switch (pricingModel) {
    case 'free':
      return { price: '0€', type: 'Gratuit' };
    case 'freemium':
      return { price: '0€+', type: 'Freemium' };
    case 'paid':
      return { price: 'Payant', type: 'Payant' };
    case 'enterprise':
      return { price: 'Sur devis', type: 'Enterprise' };
    default:
      return { price: 'N/A', type: pricingModel };
  }
}
