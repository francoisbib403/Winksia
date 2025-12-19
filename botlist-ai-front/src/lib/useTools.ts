import axios from 'axios';
import { Tool, ToolSummary } from '@/types/tool';
import { getLocalToolsAsSummary, useLocalMode } from './localTools';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

// Create a preconfigured axios instance with a sane timeout to avoid SSR hangs
const http = axios.create({
  baseURL: API_BASE_URL,
  // Fail fast in dev to avoid "page qui bloque" when backend is down/slow
  timeout: 5000,
});

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${TOKEN}` }
});

export const getAllTools = async (): Promise<ToolSummary[]> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && useLocalMode()) {
    return getLocalToolsAsSummary();
  }
  
  // Mode API normal avec timeout + fallback
  try {
    const response = await http.get<ToolSummary[]>('/tools');
    return response.data;
  } catch (err: any) {
    // Ne pas bloquer le rendu SSR si l'API est indisponible
    console.warn('[useTools.getAllTools] API indisponible ou lente, fallback []:', err?.message || err);
    return [];
  }
};

export const getToolById = async (id: string): Promise<ToolSummary> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && useLocalMode()) {
    const localTools = getLocalToolsAsSummary();
    const tool = localTools.find(t => t.id === id);
    if (!tool) {
      throw new Error(`Outil avec l'ID ${id} non trouvé en mode local`);
    }
    return tool;
  }
  
  // Mode API normal avec timeout
  const response = await http.get<ToolSummary>(`/tools/${id}`);
  return response.data;
};

export const createTool = async (data: Partial<ToolSummary>): Promise<ToolSummary> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && useLocalMode()) {
    const newTool: ToolSummary = {
      id: `local-${Date.now()}`,
      name: data.name || 'Nouvel outil',
      slug: data.slug || 'nouvel-outil',
      tagline: data.tagline || 'Description de l\'outil',
      description: data.description || 'Description de l\'outil',
      category: data.category || { id: 'default', name: 'Catégorie' },
      pricing_model: data.pricing_model || 'free',
      pricing_details: data.pricing_details || { price: '0€', type: 'Gratuit' },
      website_url: data.website_url || '#',
      overall_rating: data.overall_rating || 0,
      review_count: data.review_count || 0,
      features: data.features || [],
      use_cases: data.use_cases || [],
      featured: data.featured || false,
      created_at: new Date(),
      published_at: new Date(),
      ...data
    };
    
    // Pour le mode local, on utilise le format LocalTool en interne
    const { addLocalTool } = require('./localTools');
    const localTool = {
      id: newTool.id,
      name: newTool.name,
      company: 'Entreprise locale',
      category: newTool.category?.name || 'Catégorie',
      allCategories: [newTool.category?.name || 'Catégorie'],
      description: newTool.description,
      fullDescription: newTool.tagline || newTool.description,
      rating: newTool.overall_rating,
      reviews: newTool.review_count,
      price: newTool.pricing_details?.price || '0€',
      priceType: newTool.pricing_details?.type || 'Gratuit',
      tags: [],
      functions: newTool.features || [],
      domains: [],
      useCases: newTool.use_cases || [],
      advantages: [],
      concerns: [],
      businessValue: 'Valeur business à définir',
      roi: 'ROI à évaluer',
      integration: 'Intégration à spécifier',
      capabilities: {},
      featured: newTool.featured
    };
    
    addLocalTool(localTool);
    return newTool;
  }
  
  // Mode API normal
  const response = await http.post<ToolSummary>(
    `/tools`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const updateTool = async (id: string, data: Partial<ToolSummary>): Promise<ToolSummary> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && useLocalMode()) {
    const { updateLocalTool, getLocalToolsAsSummary } = require('./localTools');
    
    // Mise à jour en format LocalTool
    const localData: any = {};
    if (data.name) localData.name = data.name;
    if (data.description) localData.description = data.description;
    if (data.tagline) localData.fullDescription = data.tagline;
    if (data.overall_rating !== undefined) localData.rating = data.overall_rating;
    if (data.review_count !== undefined) localData.reviews = data.review_count;
    if (data.features) localData.functions = data.features;
    if (data.use_cases) localData.useCases = data.use_cases;
    if (data.featured !== undefined) localData.featured = data.featured;
    
    updateLocalTool(id, localData);
    const updatedTools = getLocalToolsAsSummary();
    const updatedTool = updatedTools.find((t: ToolSummary) => t.id === id);
    if (!updatedTool) {
      throw new Error(`Outil avec l'ID ${id} non trouvé après mise à jour`);
    }
    return updatedTool;
  }
  
  // Mode API normal
  const response = await http.patch<ToolSummary>(
    `/tools/${id}`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const deleteTool = async (id: string): Promise<{ message: string }> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && useLocalMode()) {
    const { deleteLocalTool } = require('./localTools');
    deleteLocalTool(id);
    return { message: `Outil ${id} supprimé avec succès en mode local` };
  }
  
  // Mode API normal
  const response = await http.delete<{ message: string }>(
    `/tools/${id}`,
    getAuthHeader()
  );
  return response.data;
};
