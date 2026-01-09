import type { ToolSummary } from '@/types/tool';
import { getLocalToolsAsSummary, checkLocalMode } from './localTools';
import { getTools as getToolsFromSupabase } from './services/tools.service';

export const getAllTools = async (): Promise<ToolSummary[]> => {
  // Vérifier si on est en mode local (uniquement côté client)
  if (typeof window !== 'undefined' && checkLocalMode()) {
    return getLocalToolsAsSummary();
  }
  
  // Mode SSR ou client normal - utiliser le service directement
  // pour éviter les appels HTTP internes qui peuvent échouer
  try {
    const tools = await getToolsFromSupabase();
    return tools;
  } catch (err: any) {
    console.warn('[useTools.getAllTools] Error fetching tools:', err?.message || err);
    return [];
  }
};

export const getToolById = async (id: string): Promise<ToolSummary | null> => {
  if (typeof window !== 'undefined' && checkLocalMode()) {
    const localTools = getLocalToolsAsSummary();
    return localTools.find((t: ToolSummary) => t.id === id) || null;
  }
  
  const { getToolById: getFromSupabase } = await import('./services/tools.service');
  return getFromSupabase(id);
};

export const getToolBySlug = async (slug: string): Promise<ToolSummary | null> => {
  if (typeof window !== 'undefined' && checkLocalMode()) {
    const localTools = getLocalToolsAsSummary();
    return localTools.find((t: ToolSummary) => t.slug === slug || t.id === slug) || null;
  }
  
  const { getToolBySlug: getFromSupabase } = await import('./services/tools.service');
  return getFromSupabase(slug);
};

// Functions for admin panel - these should be implemented with proper API calls
export const createTool = async (data: any): Promise<any> => {
  throw new Error('createTool is not implemented in useTools. It should call the backend API.');
};

export const updateTool = async (id: string, data: any): Promise<any> => {
  throw new Error('updateTool is not implemented in useTools. It should call the backend API.');
};
