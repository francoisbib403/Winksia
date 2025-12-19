


"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Users, Bot, Star, TrendingUp, DollarSign, MessageSquare, Eye, Settings, Search, Bell, Filter, MoreVertical, ArrowUp, ArrowDown, Calendar, Download, Plus, Zap, Globe, Shield, Activity, TypeIcon as type, type LucideIcon, X, Link, Code, Layers, CheckCircle, AlertCircle, UserPlus, UserIcon, Info, LogIn, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Imports des fonctions API
import { getAllTools, createTool, updateTool } from '@/lib/useTools';
import { Tool } from '@/types/tool';
import { getAllCategories, createCategory, updateCategory } from '@/lib/useCategories';
import { Category } from '@/types/categories';
import { updateUser, deleteUser, createUser, getAllUsers, getActiveUsers, User, ActiveUsersResponse } from '@/lib/useUsers';

// FONCTION DE LOGIN AMÉLIORÉE AVEC GESTION D'ERREURS
// NOUVELLE FONCTION À UTILISER
import { apiClient } from '@/lib/api-client';

const loginUser = async (email: string, password: string) => {
  try {
    console.log('🔄 Tentative de connexion à:', email);
    
    const response = await apiClient.login(email, password);
    
    console.log('✅ Réponse de connexion:', response);
    
    // La réponse de ton AuthService contient { refreshToken, accessToken, user }
    // On adapte pour que ce soit compatible avec ton frontend
    return {
      access_token: response.accessToken,  // Mapping pour ton frontend
      user: response.user
    };
  } catch (error: any) {
    console.error('❌ Erreur dans loginUser:', error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.data) {
      // Erreur API structurée
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message || error.response.data.error || 'Erreur de connexion';
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // Erreur réseau
      throw new Error('Impossible de contacter le serveur. Vérifiez que votre API est démarrée.');
    } else {
      // Autre erreur
      throw new Error(error.message || 'Erreur de connexion inconnue');
    }
  }
};
// Types
interface CreateToolPayload {
  name: string;
  slug: string;
  description: string;
  website_url: string;
category_ids: string[];
  pricing_model: string;
  status: string;
  tagline?: string;
  long_description?: string;
  subcategory_id?: string;
  logo_file_id?: string;
  demo_file_id?: string;
  documentation_url?: string;
  github_url?: string;
  api_available?: boolean;
  api_documentation_url?: string;
  open_source?: boolean;
  self_hosted_available?: boolean;
  gdpr_compliant?: boolean;
  soc2_certified?: boolean;
  hipaa_compliant?: boolean;
  tech_stack?: string[];
  supported_languages?: string[];
  integrations?: string[];
  platforms?: string[];
  data_residency?: string[];
  keywords?: string[];
  features?: string[];
  use_cases?: string[];
  screenshots?: string[];
  videos?: string[];
  supported_formats?: Record<string, any>;
  pricing_details?: Record<string, any>;
  created_by?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  color: string;
  prefix?: string;
}

interface ToolRowProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

enum PricingModel {
  FREE = 'free',
  FREEMIUM = 'freemium',
  PAID = 'paid',
  ENTERPRISE = 'enterprise',
  API_BASED = 'api_based'
}

enum ToolStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FLAGGED = 'flagged'
}

interface CreateToolFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  long_description: string;
  category_ids: string[];
  subcategory_id: string;
  pricing_model: PricingModel;
  status: ToolStatus;
  website_url: string;
  logo_file_id?: string;
  demo_file_id?: string;
  documentation_url: string;
  github_url: string;
  api_available: boolean;
  api_documentation_url: string;
  open_source: boolean;
  self_hosted_available: boolean;
  tech_stack: string[];
  supported_languages: string[];
  supported_formats: Record<string, any>;
  integrations: string[];
  platforms: string[];
  gdpr_compliant: boolean;
  soc2_certified: boolean;
  hipaa_compliant: boolean;
  data_residency: string[];
  pricing_details: Record<string, any>;
  overall_rating?: number;
  performance_score?: number;
  ease_of_use_score?: number;
  value_for_money_score?: number;
  support_score?: number;
  keywords: string[];
  features: string[];
  use_cases: string[];
  screenshots?: string[];
  videos?: string[];
  created_by?: string;
}

// États pour les inputs texte des champs array (pour gérer les virgules correctement)
interface ArrayInputStates {
  tech_stack: string;
  supported_languages: string;
  integrations: string;
  platforms: string;
  keywords: string;
  features: string;
  use_cases: string;
}

// Composant Modal de Catégorie optimisé
const CategoryModal: React.FC<{
  show: boolean;
  isEditing: boolean;
  categoryForm: Partial<Category>;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: keyof Category, value: any) => void;
}> = React.memo(({ show, isEditing, categoryForm, isSubmitting, onClose, onSave, onFormChange }) => {
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white";

  // Fonction de génération de slug mémorisée
  const generateSlugFromName = useCallback((name: string) =>
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''), []);

  // Gestionnaire de changement optimisé
  const handleChange = useCallback((field: keyof Category, value: any) => {
    if (field === 'name' && (!categoryForm.slug || categoryForm.slug === generateSlugFromName(categoryForm.name || ''))) {
      // Mettre à jour le nom et générer automatiquement le slug
      onFormChange('name', value);
      onFormChange('slug', generateSlugFromName(value || ''));
    } else {
      onFormChange(field, value);
    }
  }, [categoryForm.slug, categoryForm.name, generateSlugFromName, onFormChange]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} disabled={isSubmitting}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={categoryForm.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              placeholder="Ex: Génération de texte"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={categoryForm.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value)}
              className={inputClasses}
              placeholder="generation-de-texte"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Niveau</label>
              <input
                type="number"
                value={categoryForm.level ?? 0}
                onChange={(e) => handleChange('level', Number(e.target.value))}
                className={inputClasses}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Ordre</label>
              <input
                type="number"
                value={categoryForm.sort_order ?? 0}
                onChange={(e) => handleChange('sort_order', Number(e.target.value))}
                className={inputClasses}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={categoryForm.is_active ?? true}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-5 h-5"
              id="active-cat"
              disabled={isSubmitting}
            />
            <label htmlFor="active-cat" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
});

CategoryModal.displayName = 'CategoryModal';

// Composant Modal d'Outil optimisé avec gestion correcte des virgules
const CreateToolModal: React.FC<{
  show: boolean;
  isEditing: boolean;
  currentStep: number;
  formData: CreateToolFormData;
  arrayInputs: ArrayInputStates;
  categoriesData: Category[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onStepChange: (step: number) => void;
  onFormChange: (field: keyof CreateToolFormData, value: any) => void;
  onArrayInputChange: (field: keyof ArrayInputStates, value: string) => void;
}> = React.memo(({ 
  show, 
  isEditing, 
  currentStep, 
  formData, 
  arrayInputs,
  categoriesData, 
  isSubmitting, 
  onClose, 
  onSubmit, 
  onStepChange, 
  onFormChange,
  onArrayInputChange 
}) => {
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white";
  const selectClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white";
  const textareaClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500";

  const techStackOptions = ['Python', 'JavaScript', 'React', 'Vue.js', 'Node.js', 'TensorFlow', 'PyTorch', 'OpenAI API', 'Hugging Face'];

  const steps = [
    { id: 1, title: 'Informations de base', icon: Info },
    { id: 2, title: 'URLs & Liens', icon: Link },
    { id: 3, title: 'Caractéristiques', icon: Code },
    { id: 4, title: 'Finalisation', icon: CheckCircle }
  ];

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'outil *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className={inputClasses}
                  placeholder="Ex: ChatGPT, DALL-E..."
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug URL *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => onFormChange('slug', e.target.value)}
                  className={inputClasses}
                  placeholder="chatgpt-pro"
                  disabled={isEditing || isSubmitting}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Le slug ne peut pas être modifié après création
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phrase d'accroche
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => onFormChange('tagline', e.target.value)}
                className={inputClasses}
                placeholder="Assistant IA conversationnel avancé"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description courte *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                rows={3}
                className={textareaClasses}
                placeholder="Description concise de l'outil..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée
              </label>
              <textarea
                value={formData.long_description}
                onChange={(e) => onFormChange('long_description', e.target.value)}
                rows={5}
                className={textareaClasses}
                placeholder="Description complète avec fonctionnalités détaillées..."
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Catégories *
  </label>
  
  {/* Select dropdown */}
  <div className="relative">
    <select
      value=""
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (selectedValue && !formData.category_ids?.includes(selectedValue)) {
          const newIds = [...(formData.category_ids || []), selectedValue];
          onFormChange('category_ids', newIds);
        }
        // Reset select après sélection
        e.target.value = "";
      }}
      className={`${selectClasses} appearance-none pr-10`}
      disabled={isSubmitting}
    >
      <option value="">Sélectionner une catégorie...</option>
      {categoriesData
        .filter(cat => !formData.category_ids?.includes(cat.id))
        .map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
    </select>
    
    {/* Icône dropdown */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {/* Tags des catégories sélectionnées */}
  {formData.category_ids && formData.category_ids.length > 0 && (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {formData.category_ids.map(categoryId => {
          const category = categoriesData.find(cat => cat.id === categoryId);
          return category ? (
            <div
              key={categoryId}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200 transition-colors"
            >
              <span className="font-medium">{category.name}</span>
              <button
                type="button"
                onClick={() => {
                  const newIds = formData.category_ids?.filter(id => id !== categoryId) || [];
                  onFormChange('category_ids', newIds);
                }}
                className="ml-2 inline-flex items-center justify-center w-4 h-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-300 rounded-full transition-colors"
                disabled={isSubmitting}
                aria-label={`Retirer ${category.name}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : null;
        })}
      </div>
      
      {/* Bouton pour tout supprimer */}
      {formData.category_ids.length > 1 && (
        <button
          type="button"
          onClick={() => onFormChange('category_ids', [])}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
          disabled={isSubmitting}
        >
          Supprimer toutes les catégories
        </button>
      )}
    </div>
  )}

  {/* Message d'aide */}
  <p className="text-xs text-gray-500 mt-2">
    {formData.category_ids && formData.category_ids.length > 0
      ? `${formData.category_ids.length} catégorie${formData.category_ids.length > 1 ? 's' : ''} sélectionnée${formData.category_ids.length > 1 ? 's' : ''}`
      : "Sélectionnez une ou plusieurs catégories pour votre outil"
    }
  </p>
</div>
    {/* Votre autre champ ici */}
  </div>
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle de tarification *
                </label>
                <select
                  value={formData.pricing_model}
                  onChange={(e) => onFormChange('pricing_model', e.target.value)}
                  className={selectClasses}
                  disabled={isSubmitting}
                >
                  <option value={PricingModel.FREE}>Gratuit</option>
                  <option value={PricingModel.FREEMIUM}>Freemium</option>
                  <option value={PricingModel.PAID}>Payant</option>
                  <option value={PricingModel.ENTERPRISE}>Enterprise</option>
                  <option value={PricingModel.API_BASED}>Basé sur API</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web officiel *
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => onFormChange('website_url', e.target.value)}
                className={inputClasses}
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de documentation
                </label>
                <input
                  type="url"
                  value={formData.documentation_url}
                  onChange={(e) => onFormChange('documentation_url', e.target.value)}
                  className={inputClasses}
                  placeholder="https://docs.example.com"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub (si open source)
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => onFormChange('github_url', e.target.value)}
                  className={inputClasses}
                  placeholder="https://github.com/user/repo"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="api_available"
                  checked={formData.api_available}
                  onChange={(e) => onFormChange('api_available', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="api_available" className="text-sm font-medium text-gray-700">
                  API disponible
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="open_source"
                  checked={formData.open_source}
                  onChange={(e) => onFormChange('open_source', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="open_source" className="text-sm font-medium text-gray-700">
                  Open Source
                </label>
              </div>
            </div>
            {formData.api_available && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation API
                </label>
                <input
                  type="url"
                  value={formData.api_documentation_url}
                  onChange={(e) => onFormChange('api_documentation_url', e.target.value)}
                  className={inputClasses}
                  placeholder="https://api-docs.example.com"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stack technique (séparés par des virgules)
              </label>
              <input
                type="text"
                value={arrayInputs.tech_stack}
                onChange={(e) => onArrayInputChange('tech_stack', e.target.value)}
                className={inputClasses}
                placeholder="Python, TensorFlow, React, OpenAI API"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Suggestions: {techStackOptions.join(', ')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langues supportées (séparées par des virgules)
              </label>
              <input
                type="text"
                value={arrayInputs.supported_languages}
                onChange={(e) => onArrayInputChange('supported_languages', e.target.value)}
                className={inputClasses}
                placeholder="English, French, Spanish"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plateformes (séparées par des virgules)
              </label>
              <input
                type="text"
                value={arrayInputs.platforms}
                onChange={(e) => onArrayInputChange('platforms', e.target.value)}
                className={inputClasses}
                placeholder="Web, Mobile, Desktop, API"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intégrations disponibles
              </label>
              <input
                type="text"
                value={arrayInputs.integrations}
                onChange={(e) => onArrayInputChange('integrations', e.target.value)}
                className={inputClasses}
                placeholder="Slack, Zapier, Google Workspace"
                disabled={isSubmitting}
              />
            </div>
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Conformité et Sécurité</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="gdpr_compliant"
                    checked={formData.gdpr_compliant}
                    onChange={(e) => onFormChange('gdpr_compliant', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="gdpr_compliant" className="text-sm font-medium text-gray-700">
                    RGPD Conforme
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="soc2_certified"
                    checked={formData.soc2_certified}
                    onChange={(e) => onFormChange('soc2_certified', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="soc2_certified" className="text-sm font-medium text-gray-700">
                    SOC2 Certifié
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hipaa_compliant"
                    checked={formData.hipaa_compliant}
                    onChange={(e) => onFormChange('hipaa_compliant', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="hipaa_compliant" className="text-sm font-medium text-gray-700">
                    HIPAA Conforme
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonctionnalités principales (séparées par des virgules)
              </label>
              <textarea
                value={arrayInputs.features}
                onChange={(e) => onArrayInputChange('features', e.target.value)}
                rows={3}
                className={textareaClasses}
                placeholder="Text-to-video, Auto-editing, Voice synthesis"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cas d'usage (séparés par des virgules)
              </label>
              <textarea
                value={arrayInputs.use_cases}
                onChange={(e) => onArrayInputChange('use_cases', e.target.value)}
                rows={3}
                className={textareaClasses}
                placeholder="Marketing campaigns, Explainer videos, Social media content"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés SEO (séparés par des virgules)
              </label>
              <input
                type="text"
                value={arrayInputs.keywords}
                onChange={(e) => onArrayInputChange('keywords', e.target.value)}
                className={inputClasses}
                placeholder="génération vidéo, montage automatique, content marketing"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de publication
              </label>
              <select
                value={formData.status}
                onChange={(e) => onFormChange('status', e.target.value)}
                className={selectClasses}
                disabled={isSubmitting}
              >
                <option value={ToolStatus.PENDING}>En attente de validation</option>
                <option value={ToolStatus.PUBLISHED}>Publié</option>
              </select>
            </div>
           <div className="bg-gray-50 rounded-xl p-6">
  <h4 className="text-lg font-semibold text-gray-900 mb-3">Résumé de l'outil</h4>
  <div className="space-y-2 text-sm">
    <p><span className="font-medium">Nom:</span> {formData.name || 'Non défini'}</p>
    <p><span className="font-medium">Catégories:</span> {
      formData.category_ids && formData.category_ids.length > 0 
        ? formData.category_ids.map(id => 
            categoriesData.find(c => c.id === id)?.name
          ).filter(Boolean).join(', ') 
        : 'Non définies'
    }</p>
    <p><span className="font-medium">Prix:</span> {formData.pricing_model}</p>
    <p><span className="font-medium">Site web:</span> {formData.website_url || 'Non défini'}</p>
    <p><span className="font-medium">Statut:</span> {formData.status}</p>
  </div>
</div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, formData, arrayInputs, categoriesData, isSubmitting, onFormChange, onArrayInputChange, inputClasses, selectClasses, textareaClasses, techStackOptions]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isEditing ? 'Modifier l\'outil IA' : 'Ajouter un nouvel outil IA'}
              </h2>
              <p className="text-indigo-100">Étape {currentStep} sur 4</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {steps.map(step => (
              <span key={step.id} className="font-medium">{step.title}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-96 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => onStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              currentStep === 1 || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Précédent
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            {currentStep < 4 ? (
              <button
                onClick={() => onStepChange(currentStep + 1)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isEditing ? 'Modification...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{isEditing ? 'Modifier l\'outil' : 'Créer l\'outil'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CreateToolModal.displayName = 'CreateToolModal';

function Dashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Auth - CORRIGÉ POUR UTILISER VOTRE API
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Users - EXACTEMENT COMME DANS L'ANCIEN CODE
  const [usersData, setUsersData] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeUsersStats, setActiveUsersStats] = useState<ActiveUsersResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userForm, setUserForm] = useState<Partial<User>>({
    firstname: '',
    lastname: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    activate: true,
    auth_type: 'EMAIL'
  });

  // Categories
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    is_active: true,
    sort_order: 0,
    level: 0
  });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Tools
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools] = useState(false);
  const [formData, setFormData] = useState<CreateToolFormData>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    long_description: '',
    category_ids: [],
    subcategory_id: '',
    pricing_model: PricingModel.FREE,
    status: ToolStatus.DRAFT,
    website_url: '',
    logo_file_id: '',
    demo_file_id: '',
    documentation_url: '',
    github_url: '',
    api_available: false,
    api_documentation_url: '',
    open_source: false,
    self_hosted_available: false,
    tech_stack: [],
    supported_languages: [],
    supported_formats: {},
    integrations: [],
    platforms: [],
    gdpr_compliant: false,
    soc2_certified: false,
    hipaa_compliant: false,
    data_residency: [],
    pricing_details: {},
    keywords: [],
    features: [],
    use_cases: [],
    screenshots: [],
    videos: []
  });

  // États séparés pour les inputs texte des champs array (NOUVELLE SOLUTION)
  const [arrayInputs, setArrayInputs] = useState<ArrayInputStates>({
    tech_stack: '',
    supported_languages: '',
    integrations: '',
    platforms: '',
    keywords: '',
    features: '',
    use_cases: ''
  });

  // VÉRIFICATION DE L'AUTHENTIFICATION AU CHARGEMENT
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('Utilisateur connecté:', user);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  // Fonctions mémorisées pour éviter les re-renders
  const generateSlug = useCallback((name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const handleInputChange = useCallback((field: keyof CreateToolFormData, value: any) => {
    setFormData(prev => {
      const updated: CreateToolFormData = { ...prev, [field]: value } as any;
      if (field === 'name' && !isEditMode) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  }, [isEditMode, generateSlug]);

  // NOUVELLE fonction pour gérer les champs array avec virgules
  const handleArrayInputChange = useCallback((field: keyof ArrayInputStates, value: string) => {
    // Mettre à jour l'input texte directement (permet de taper librement avec virgules)
    setArrayInputs(prev => ({
      ...prev,
      [field]: value
    }));

    // Convertir en array pour les données du formulaire
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  }, []);

  // Fonction de gestion des changements de catégorie mémorisée
  const handleCategoryFormChange = useCallback((field: keyof Category, value: any) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      long_description: '',
       category_ids: [],
      subcategory_id: '',
      pricing_model: PricingModel.FREE,
      status: ToolStatus.DRAFT,
      website_url: '',
      logo_file_id: '',
      demo_file_id: '',
      documentation_url: '',
      github_url: '',
      api_available: false,
      api_documentation_url: '',
      open_source: false,
      self_hosted_available: false,
      tech_stack: [],
      supported_languages: [],
      supported_formats: {},
      integrations: [],
      platforms: [],
      gdpr_compliant: false,
      soc2_certified: false,
      hipaa_compliant: false,
      data_residency: [],
      pricing_details: {},
      overall_rating: 0,
      performance_score: 0,
      ease_of_use_score: 0,
      value_for_money_score: 0,
      support_score: 0,
      keywords: [],
      features: [],
      use_cases: [],
      screenshots: [],
      videos: [],
      created_by: ''
    });

    // Réinitialiser aussi les inputs array
    setArrayInputs({
      tech_stack: '',
      supported_languages: '',
      integrations: '',
      platforms: '',
      keywords: '',
      features: '',
      use_cases: ''
    });

    setCurrentStep(1);
    setIsEditMode(false);
    setSelectedTool(null);
  }, []);

  // Chargement des données
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const cats = await getAllCategories();
        setCategoriesData(cats);
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const toolsData = await getAllTools();
        setTools(toolsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // FONCTIONS USERS - EXACTEMENT COMME DANS L'ANCIEN CODE
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const [users, activeStats] = await Promise.all([
        getAllUsers(),
        getActiveUsers(30)
      ]);
      setUsersData(users);
      setActiveUsersStats(activeStats);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // FONCTIONS DE GESTION DES ACTIONS USERS - EXACTEMENT COMME DANS L'ANCIEN CODE
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user: User) => {
    console.log('Édition utilisateur:', user);
    setSelectedUser(user);
    setIsEditingUser(false);
    setUserForm({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      activate: user.activate ?? true,
      auth_type: user.auth_type || 'EMAIL'
    });
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    const displayName = user.firstname && user.lastname 
      ? `${user.firstname} ${user.lastname}`
      : user.email;
    if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer l'utilisateur "${displayName}" ?

Cette action est irréversible.`)) {
      try {
        await deleteUser(user.id);
        
        // Mettre à jour la liste locale
        setUsersData(prev => prev.filter(u => u.id !== user.id));
        
        alert('✅ Utilisateur supprimé avec succès !');
      } catch (error: any) {
        console.error('Erreur suppression:', error);
        alert(`❌ Erreur lors de la suppression: ${error.message}`);
      }
    }
  };

  const handleSaveUser = async (): Promise<void> => {
    if (!selectedUser) return;
    
    // Vérifier que les champs requis sont remplis
    if (!userForm.firstname || !userForm.lastname || !userForm.email) {
      alert('❌ Veuillez remplir tous les champs requis (prénom, nom, email)');
      return;
    }
    
    setIsEditingUser(true);
    try {
      // S'assurer que auth_type est présent
      const dataToSend = {
        ...userForm,
        auth_type: userForm.auth_type || 'EMAIL' // Valeur par défaut si manquante
      };
      
      console.log('Données à envoyer:', dataToSend);
      console.log('ID utilisateur:', selectedUser.id);
      
      const updatedUser = await updateUser(selectedUser.id, dataToSend);
      
      // Mettre à jour la liste locale
      setUsersData(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      // Fermer la modal
      setShowEditUserModal(false);
      setSelectedUser(null);
      setIsEditingUser(false);
      
      alert('✅ Utilisateur modifié avec succès !');
    } catch (error: any) {
      console.error('Erreur modification:', error);
      
      // Affichage détaillé de l'erreur
      if (error.response?.data) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message || error.response.data.error;
        alert(`❌ Erreur API: ${errorMessage}`);
      } else {
        alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
      }
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleCreateNewUser = () => {
    setSelectedUser(null);
    setIsEditingUser(false);
    setUserForm({
      firstname: '',
      lastname: '',
      email: '',
      role: 'USER',
      status: 'ACTIVE',
      activate: true,
      auth_type: 'EMAIL'
    });
    setShowEditUserModal(true);
  };

  const handleCreateUser = async () => {
    // Vérifier que les champs requis sont remplis
    if (!userForm.firstname || !userForm.lastname || !userForm.email) {
      alert('❌ Veuillez remplir tous les champs requis (prénom, nom, email)');
      return;
    }
    
    setIsEditingUser(true);
    try {
      // S'assurer que auth_type est présent
      const dataToSend = {
        ...userForm,
        auth_type: userForm.auth_type || 'EMAIL' // Valeur par défaut
      };
      
      console.log('Création utilisateur avec:', dataToSend);
      
      const newUser = await createUser(dataToSend);
      
      // Ajouter à la liste locale
      setUsersData(prev => [newUser, ...prev]);
      
      // Fermer la modal
      setShowEditUserModal(false);
      setIsEditingUser(false);
      
      alert('✅ Utilisateur créé avec succès !');
    } catch (error: any) {
      console.error('Erreur création:', error);
      
      // Affichage détaillé de l'erreur
      if (error.response?.data) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message || error.response.data.error;
        alert(`❌ Erreur API: ${errorMessage}`);
      } else {
        alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
      }
    } finally {
      setIsEditingUser(false);
    }
  };

  // Gestionnaires d'événements mémorisés
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const toolData: CreateToolPayload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        website_url: formData.website_url,
       category_ids: formData.category_ids,
        pricing_model: formData.pricing_model,
        status: formData.status,
        ...(formData.tagline && { tagline: formData.tagline }),
        ...(formData.long_description && { long_description: formData.long_description }),
        ...(formData.subcategory_id && { subcategory_id: formData.subcategory_id }),
        ...(formData.logo_file_id && { logo_file_id: formData.logo_file_id }),
        ...(formData.demo_file_id && { demo_file_id: formData.demo_file_id }),
        ...(formData.documentation_url && { documentation_url: formData.documentation_url }),
        ...(formData.github_url && { github_url: formData.github_url }),
        ...(formData.api_documentation_url && { api_documentation_url: formData.api_documentation_url }),
        api_available: formData.api_available,
        open_source: formData.open_source,
        self_hosted_available: formData.self_hosted_available,
        gdpr_compliant: formData.gdpr_compliant,
        soc2_certified: formData.soc2_certified,
        hipaa_compliant: formData.hipaa_compliant,
        ...(formData.tech_stack.length > 0 && { tech_stack: formData.tech_stack }),
        ...(formData.supported_languages.length > 0 && { supported_languages: formData.supported_languages }),
        ...(formData.integrations.length > 0 && { integrations: formData.integrations }),
        ...(formData.platforms.length > 0 && { platforms: formData.platforms }),
        ...(formData.data_residency.length > 0 && { data_residency: formData.data_residency }),
        ...(formData.keywords.length > 0 && { keywords: formData.keywords }),
        ...(formData.features.length > 0 && { features: formData.features }),
        ...(formData.use_cases.length > 0 && { use_cases: formData.use_cases }),
        ...(formData.screenshots && formData.screenshots.length > 0 && { screenshots: formData.screenshots }),
        ...(formData.videos && formData.videos.length > 0 && { videos: formData.videos }),
        ...(Object.keys(formData.supported_formats).length > 0 && { supported_formats: formData.supported_formats }),
        ...(Object.keys(formData.pricing_details).length > 0 && { pricing_details: formData.pricing_details }),
      };

      let result;
      if (isEditMode && selectedTool) {
        result = await updateTool(selectedTool.id, toolData as Partial<Tool>);
      } else {
        result = await createTool(toolData as Partial<Tool>);
      }

      const updatedTools = await getAllTools();
      setTools(updatedTools);
      setShowCreateModal(false);
      resetForm();
      alert(isEditMode ? 'Outil modifié avec succès !' : 'Outil créé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      if (error.response) {
        let errorMessages = '';
        if (Array.isArray(error.response.data?.message)) {
          errorMessages = error.response.data.message.join(', ');
        } else {
          errorMessages = error.response.data?.message || error.response.data?.error || 'Erreur inconnue';
        }
        alert(`Erreur lors de ${isEditMode ? 'la modification' : 'la création'}: ${errorMessages}`);
      } else if (error.request) {
        alert('Erreur: Pas de réponse du serveur. Vérifiez que votre API est démarrée.');
      } else {
        alert(`Erreur: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, selectedTool, resetForm]);

  const handleCategorySave = useCallback(async () => {
    setIsSubmittingCategory(true);
    try {
      if (isEditingCategory && selectedCategory) {
        const updated = await updateCategory(selectedCategory.id, categoryForm);
        setCategoriesData(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCategory(categoryForm);
        setCategoriesData(prev => [created, ...prev]);
      }
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setIsEditingCategory(false);
      setCategoryForm({
        name: '',
        slug: '',
        is_active: true,
        sort_order: 0,
        level: 0,
      } as any);
    } catch (e) {
      console.error('Erreur catégorie:', e);
      alert('Erreur lors de la sauvegarde de la catégorie');
    } finally {
      setIsSubmittingCategory(false);
    }
  }, [isEditingCategory, selectedCategory, categoryForm]);

  const handleEditTool = useCallback((tool: Tool) => {
    setFormData({
      name: tool.name || '',
      slug: tool.slug || '',
      tagline: tool.tagline || '',
      description: tool.description || '',
      long_description: tool.long_description || '',
     category_ids: (() => {
  if (!tool.category) return [];
  if (Array.isArray(tool.category)) {
    return tool.category.map((cat: Category) => cat.id);
  }
  return [(tool.category as Category).id];
})(),
      subcategory_id: tool.subcategory?.id || '',
      pricing_model: (tool.pricing_model as PricingModel) || PricingModel.FREE,
      status: (tool.status as ToolStatus) || ToolStatus.DRAFT,
      website_url: tool.website_url || '',
      logo_file_id: tool.logo?.id || '',
      demo_file_id: tool.demo?.id || '',
      documentation_url: tool.documentation_url || '',
      github_url: tool.github_url || '',
      api_available: tool.api_available || false,
      api_documentation_url: tool.api_documentation_url || '',
      open_source: tool.open_source || false,
      self_hosted_available: tool.self_hosted_available || false,
      tech_stack: tool.tech_stack || [],
      supported_languages: tool.supported_languages || [],
      supported_formats: tool.supported_formats || {},
      integrations: tool.integrations || [],
      platforms: tool.platforms || [],
      gdpr_compliant: tool.gdpr_compliant || false,
      soc2_certified: tool.soc2_certified || false,
      hipaa_compliant: tool.hipaa_compliant || false,
      data_residency: tool.data_residency || [],
      pricing_details: tool.pricing_details || {},
      keywords: tool.keywords || [],
      features: tool.features || [],
      use_cases: tool.use_cases || [],
      screenshots: (tool.screenshots || []).map((s: any) => typeof s === 'object' ? s.url || s.id : s),
      videos: (tool.videos || []).map((v: any) => typeof v === 'object' ? v.url || v.id : v),
      overall_rating: tool.overall_rating ?? 0,
      performance_score: tool.performance_score ?? 0,
      ease_of_use_score: tool.ease_of_use_score ?? 0,
      value_for_money_score: tool.value_for_money_score ?? 0,
      support_score: tool.support_score ?? 0,
      created_by: tool.created_by || '',
    });

    // Remplir aussi les inputs array avec les valeurs existantes
    setArrayInputs({
      tech_stack: (tool.tech_stack || []).join(', '),
      supported_languages: (tool.supported_languages || []).join(', '),
      integrations: (tool.integrations || []).join(', '),
      platforms: (tool.platforms || []).join(', '),
      keywords: (tool.keywords || []).join(', '),
      features: (tool.features || []).join(', '),
      use_cases: (tool.use_cases || []).join(', ')
    });

    setSelectedTool(tool);
    setIsEditMode(true);
    setCurrentStep(1);
    setShowCreateModal(true);
  }, []);

  const handleCreateTool = useCallback(() => {
    resetForm();
    setIsEditMode(false);
    setSelectedTool(null);
    setShowCreateModal(true);
  }, [resetForm]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const handleCloseCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    setIsEditingCategory(false);
    setSelectedCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      is_active: true,
      sort_order: 0,
      level: 0
    });
  }, []);

  // FONCTION DE LOGIN CORRIGÉE POUR UTILISER VOTRE API
  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      console.log('Tentative de connexion avec:', loginForm.email);
      
      const response = await loginUser(loginForm.email, loginForm.password);
      
      console.log('Réponse de connexion:', response);
      
      // Stocker le token et les données utilisateur
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
          setCurrentUser(response.user);
        }
        
        setIsAuthenticated(true);
        setShowLoginModal(false);
        setLoginForm({ email: '', password: '', remember: false });
        
        // Message de succès avec le nom de l'utilisateur
        const userName = response.user?.firstname 
          ? `${response.user.firstname} ${response.user.lastname || ''}`.trim()
          : response.user?.email || loginForm.email;
          
        alert(`✅ Connexion réussie ! Bienvenue ${userName}`);
        
        console.log('Utilisateur connecté:', response.user);
      } else {
        throw new Error('Token d\'accès manquant dans la réponse');
      }
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setCurrentUser(null);
      
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginForm.email, loginForm.password]);

  // FONCTION DE DÉCONNEXION
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setCurrentUser(null);
    alert('✅ Déconnexion réussie !');
  }, []);

  // Calculs des statistiques mémorisés
  const stats = useMemo(() => ({
    totalTools: tools.length,
    totalUsers: usersData.length || 0,
    totalReviews: tools.reduce((sum, tool) => sum + (tool.review_count || 0), 0),
    monthlyRevenue: 0,
    activeConversations: 0,
    averageRating: tools.length > 0 
      ? tools.reduce((sum, tool) => {
          const rating = tool.overall_rating && typeof tool.overall_rating === 'number'
            ? tool.overall_rating 
            : 0;
          return sum + rating;
        }, 0) / tools.length 
      : 0
  }), [tools, usersData.length]);

  const recentTools = useMemo(() => 
    tools
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4),
    [tools]
  );

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'tools', label: 'Outils IA', icon: Bot },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'reviews', label: 'Avis & Notes', icon: Star },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, change, icon: Icon, color, prefix = "" }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  ));

  StatCard.displayName = 'StatCard';

  // Composants simplifiés pour éviter les re-renders
  const ToolRow: React.FC<ToolRowProps> = React.memo(({ tool, onEdit }) => {
    const [showActions, setShowActions] = useState(false);
    
    return (
      <tr className="hover:bg-gray-50/50 transition-colors duration-200 relative">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{tool.name}</p>
              <p className="text-sm text-gray-500">{tool.category?.name || 'Non catégorisé'}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            tool.status === 'published' 
              ? 'bg-green-100 text-green-800'
              : tool.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {tool.status === 'published' ? 'Publié' :
              tool.status === 'pending' ? 'En attente' :
              'Brouillon'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="font-medium">
              {tool.overall_rating && typeof tool.overall_rating === 'number'
                ? tool.overall_rating.toFixed(1)
                : '0.0'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center text-gray-600">
            <Eye className="w-4 h-4 mr-1" />
            {tool.view_count ? tool.view_count.toLocaleString() : '0'}
          </div>
        </td>
        <td className="px-6 py-4 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-4 top-full mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                onClick={() => {
                  setShowActions(false);
                  onEdit(tool);
                }}
              >
                Modifier
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                onClick={() => {
                  setShowActions(false);
                  alert(`Supprimer ${tool.name}`);
                }}
              >
                Supprimer
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  });

  ToolRow.displayName = 'ToolRow';

  const CategoryRow: React.FC<{ category: Category; onEdit: (cat: Category) => void }> = React.memo(({ category, onEdit }) => {
    const [showActions, setShowActions] = useState(false);
    
    return (
      <tr className="hover:bg-gray-50/50 transition-colors duration-200 relative">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{category.name}</p>
              <p className="text-sm text-gray-500">{category.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">{category.level}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">{category.sort_order}</span>
          </div>
        </td>
        <td className="px-6 py-4 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-4 top-full mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                onClick={() => {
                  setShowActions(false);
                  onEdit(category);
                }}
              >
                Modifier
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                onClick={() => {
                  setShowActions(false);
                  alert(`Supprimer ${category.name}`);
                }}
              >
                Supprimer
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  });

  CategoryRow.displayName = 'CategoryRow';

  // COMPOSANT UserRow - EXACTEMENT COMME DANS L'ANCIEN CODE
  const UserRow: React.FC<{ user: User }> = ({ user }) => {
    const [showActions, setShowActions] = useState(false);
    
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getRoleColor = (role?: string) => {
      switch (role?.toUpperCase()) {
        case 'ADMIN':
          return 'bg-red-100 text-red-800';
        case 'AUTH':
          return 'bg-blue-100 text-blue-800';
        case 'USER':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusColor = (status?: string, activate?: boolean) => {
      if (!activate) return 'bg-gray-100 text-gray-800';
      switch (status?.toUpperCase()) {
        case 'BLOCKED':
          return 'bg-red-100 text-red-800';
        case 'ACTIVE':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-yellow-100 text-yellow-800';
      }
    };

    const displayName = user.firstname && user.lastname 
      ? `${user.firstname} ${user.lastname}`
      : user.email.split('@')[0];

    return (
      <tr className="hover:bg-gray-50/50 transition-colors duration-200 relative">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.slug && (
                <p className="text-xs text-gray-400">@{user.slug}</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {user.role || 'USER'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status, user.activate)}`}>
              {!user.activate ? 'Inactif' : user.status || 'Actif'}
            </span>
            {!user.activate && (
              <span className="text-red-500" title="Compte non activé">
                ⚠️
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {formatDate(user.created_at)}
        </td>
        <td className="px-6 py-4 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-4 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="py-2">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"
                  onClick={() => {
                    setShowActions(false);
                    handleViewUser(user);
                  }}
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Voir les détails</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"
                  onClick={() => {
                    setShowActions(false);
                    handleEditUser(user);
                  }}
                >
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Modifier</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"
                  onClick={() => {
                    setShowActions(false);
                    navigator.clipboard.writeText(user.email);
                    // Toast notification élégante
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    toast.textContent = '📧 Email copié dans le presse-papier !';
                    document.body.appendChild(toast);
                    setTimeout(() => document.body.removeChild(toast), 3000);
                  }}
                >
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span>Copier l'email</span>
                </button>
                
                {/* Séparateur */}
                <div className="border-t border-gray-100 my-1"></div>
                
                {/* Actions dangereuses */}
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-3"
                  onClick={() => {
                    setShowActions(false);
                    handleDeleteUser(user);
                  }}
                >
                  <X className="w-4 h-4" />
                  <span>Supprimer définitivement</span>
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>
    );
  };

  // COMPOSANTS MODALS USERS - EXACTEMENT COMME DANS L'ANCIEN CODE
  const UserDetailsModal = () => {
    if (!showUserDetailsModal || !selectedUser) return null;

    const displayName = selectedUser.firstname && selectedUser.lastname 
      ? `${selectedUser.firstname} ${selectedUser.lastname}`
      : 'Utilisateur';

    return (
      <AnimatePresence>
        <motion.div
          key="user-details-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <motion.div
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{displayName}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserDetailsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Informations personnelles
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Prénom:</span>
                      <span className="ml-2">{selectedUser.firstname || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Nom:</span>
                      <span className="ml-2">{selectedUser.lastname || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Slug:</span>
                      <span className="ml-2">{selectedUser.slug || 'Non généré'}</span>
                    </div>
                  </div>
                </div>
                {/* Statut et rôle */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Statut et permissions
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Rôle:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedUser.role?.toUpperCase() === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        selectedUser.role?.toUpperCase() === 'AUTH' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.role || 'USER'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Statut:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        !selectedUser.activate ? 'bg-gray-100 text-gray-800' :
                        selectedUser.status?.toUpperCase() === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {!selectedUser.activate ? 'Inactif' : selectedUser.status || 'Actif'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Compte activé:</span>
                      <span className="ml-2">{selectedUser.activate ? '✅ Oui' : '❌ Non'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type d'auth:</span>
                      <span className="ml-2">{selectedUser.auth_type || 'EMAIL'}</span>
                    </div>
                  </div>
                </div>
                {/* Dates */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Dates importantes
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Créé le:</span>
                      <span className="ml-2">
                        {selectedUser.created_at
                          ? new Date(selectedUser.created_at).toLocaleString('fr-FR')
                          : 'Non disponible'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Modifié le:</span>
                      <span className="ml-2">
                        {selectedUser.updated_at
                          ? new Date(selectedUser.updated_at).toLocaleString('fr-FR')
                          : 'Non disponible'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actions rapides */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Actions rapides
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowUserDetailsModal(false);
                        handleEditUser(selectedUser);
                      }}
                      className="w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✏️ Modifier cet utilisateur
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUser.email);
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                        toast.textContent = '📧 Email copié !';
                        document.body.appendChild(toast);
                        setTimeout(() => document.body.removeChild(toast), 3000);
                      }}
                      className="w-full text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      📧 Copier l'email
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowUserDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  handleEditUser(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // MODAL MODIFICATION/CRÉATION UTILISATEUR - EXACTEMENT COMME DANS L'ANCIEN CODE
  const EditUserModal = () => {
    if (!showEditUserModal) return null;

    const isCreating = !selectedUser;
    const title = isCreating ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur';

    const handleUserSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Soumission du formulaire utilisateur:', { isCreating, userForm }); // Debug
      
      if (isCreating) {
        await handleCreateUser();
      } else {
        await handleSaveUser();
      }
    };

    // Fonction pour gérer les changements de champs
    const handleFormChange = (field: keyof User, value: any) => {
      console.log(`Changement ${field}:`, value); // Debug
      setUserForm(prev => {
        const updated = { ...prev, [field]: value };
        console.log('Formulaire mis à jour:', updated); // Debug
        return updated;
      });
    };

    const handleCancel = () => {
      console.log('Annulation du modal');
      setShowEditUserModal(false);
      setSelectedUser(null);
      setIsEditingUser(false);
      setUserForm({
        firstname: '',
        lastname: '',
        email: '',
        role: 'USER',
        status: 'ACTIVE',
        activate: true,
        auth_type: 'EMAIL'
      });
    };

    const roles = [
      { value: 'USER', label: 'Utilisateur' },
      { value: 'AUTH', label: 'Authentifié' },
      { value: 'ADMIN', label: 'Administrateur' }
    ];

    const statuses = [
      { value: 'ACTIVE', label: 'Actif' },
      { value: 'BLOCKED', label: 'Bloqué' }
    ];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleCancel} // Clic sur le backdrop ferme le modal
        >
          <motion.div
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture
          >
            {/* Header */}
            <div className="flex justify-between items-start px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isCreating ? 'Créer un nouveau compte utilisateur' : 'Modifier les informations de l\'utilisateur'}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full transition-colors hover:bg-gray-100"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Formulaire */}
            <div className="px-6 py-6 space-y-6">
              {/* Informations personnelles */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={userForm.firstname || ''}
                      onChange={(e) => handleFormChange('firstname', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="John"
                      required
                      disabled={isEditingUser}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={userForm.lastname || ''}
                      onChange={(e) => handleFormChange('lastname', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Doe"
                      required
                      disabled={isEditingUser}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userForm.email || ''}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="john.doe@example.com"
                    required
                    disabled={isEditingUser}
                    autoComplete="email"
                  />
                </div>
                {/* NOUVEAU CHAMP AUTH_TYPE - À ajouter dans votre EditUserModal */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'authentification *
                  </label>
                  <select
                    value={userForm.auth_type || 'EMAIL'}
                    onChange={(e) => handleFormChange('auth_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    required
                    disabled={isEditingUser}
                  >
                    <option value="EMAIL">Email/Mot de passe</option>
                    <option value="GOOGLE">Google OAuth</option>
                    <option value="GITHUB">GitHub OAuth</option>
                    <option value="FACEBOOK">Facebook OAuth</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Méthode d'authentification utilisée par cet utilisateur
                  </p>
                </div>
              </div>
              {/* Permissions et statut */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Permissions et statut
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle *
                    </label>
                    <select
                      value={userForm.role || 'USER'}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                      required
                      disabled={isEditingUser}
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut *
                    </label>
                    <select
                      value={userForm.status || 'ACTIVE'}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                      required
                      disabled={isEditingUser}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.activate ?? true}
                      onChange={(e) => handleFormChange('activate', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      disabled={isEditingUser}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Compte activé
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Les comptes non activés ne peuvent pas se connecter
                  </p>
                </div>
              </div>
            </div>
            {/* Footer avec boutons */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={isEditingUser}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUserSubmit}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium"
                disabled={isEditingUser || !userForm.firstname || !userForm.lastname || !userForm.email}
              >
                {isEditingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isCreating ? 'Création...' : 'Modification...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{isCreating ? 'Créer l\'utilisateur' : 'Sauvegarder'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // STATISTIQUES AMÉLIORÉES - Composant EnhancedStatsCards
  const EnhancedStatsCards = () => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.activate && u.status !== 'BLOCKED').length;
    const adminUsers = usersData.filter(u => u.role?.toUpperCase() === 'ADMIN').length;
    const blockedUsers = usersData.filter(u => u.status?.toUpperCase() === 'BLOCKED' || !u.activate).length;
    const recentUsers = usersData.filter(u => {
      const createdDate = new Date(u.created_at || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Utilisateurs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500 bg-opacity-10">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-600">
              +{recentUsers} cette semaine
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Utilisateurs</h3>
          <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
        </div>
        {/* Utilisateurs Actifs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500 bg-opacity-10">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600">
              {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Utilisateurs Actifs</h3>
          <p className="text-2xl font-bold text-gray-900">{activeUsers.toLocaleString()}</p>
        </div>
        {/* Administrateurs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-500 bg-opacity-10">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Administrateurs</h3>
          <p className="text-2xl font-bold text-gray-900">{adminUsers.toLocaleString()}</p>
        </div>
        {/* Utilisateurs Bloqués */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500 bg-opacity-10">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-orange-600">
              {totalUsers > 0 ? Math.round((blockedUsers / totalUsers) * 100) : 0}%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Comptes Bloqués</h3>
          <p className="text-2xl font-bold text-gray-900">{blockedUsers.toLocaleString()}</p>
        </div>
        {/* Nouveaux cette semaine */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500 bg-opacity-10">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-purple-600">
              7 derniers jours
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Nouveaux Utilisateurs</h3>
          <p className="text-2xl font-bold text-gray-900">{recentUsers.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  // MISE À JOUR DE LA BARRE D'OUTILS
  const UsersToolbar = () => (
    <div className="p-6 border-b border-gray-200/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-500 mt-1">
            {usersData.length} utilisateur{usersData.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            disabled={loadingUsers}
          >
            <Activity className="w-4 h-4" />
            <span className="font-medium">
              {loadingUsers ? 'Chargement...' : 'Actualiser'}
            </span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtrer</span>
          </button>
          <button 
            onClick={() => {
              // Fonction d'export CSV basique
              const csvContent = "data:text/csv;charset=utf-8,"
                + "Prénom,Nom,Email,Rôle,Statut,Activé,Créé le\n"
                + usersData.map(user => 
                    `${user.firstname || ''},${user.lastname || ''},${user.email},${user.role || 'USER'},${user.status || 'ACTIVE'},${user.activate ? 'Oui' : 'Non'},${user.created_at || ''}`
                  ).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Exporter CSV</span>
          </button>
          <button 
            onClick={handleCreateNewUser}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Nouvel utilisateur</span>
          </button>
        </div>
      </div>
    </div>
  );

  // SECTION COMPLÈTE POUR L'ONGLET USERS - À INTÉGRER DANS LE JSX
  const UsersTabContent = () => (
    <div className="space-y-6">
      {/* Statistiques améliorées */}
      <EnhancedStatsCards />
      {/* Tableau des utilisateurs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
        <UsersToolbar />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                      <span className="text-gray-600">Chargement des utilisateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : usersData.length > 0 ? (
                usersData.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-sm">Créez votre premier utilisateur pour commencer</p>
                      </div>
                      <button
                        onClick={handleCreateNewUser}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Créer un utilisateur
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {usersData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de 1 à {usersData.length} sur {usersData.length} utilisateurs
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Précédent
              </button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Winksia</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700 shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600">Gérez votre plateforme Winksia en temps réel</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <button className="p-2 hover:bg-white/50 rounded-xl transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {/* BOUTON DE CONNEXION/DÉCONNEXION CORRIGÉ */}
                {isAuthenticated && currentUser ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {currentUser.firstname && currentUser.lastname 
                          ? `${currentUser.firstname} ${currentUser.lastname}`
                          : currentUser.email
                        }
                      </p>
                      <p className="text-xs text-gray-500">{currentUser.role || 'USER'}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-white/50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                      title="Se déconnecter"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {currentUser.firstname ? currentUser.firstname[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-white/50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                  >
                    <LogIn className="w-5 h-5 text-gray-600" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">Se connecter</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Outils IA Totaux"
                    value={stats.totalTools}
                    change={12}
                    icon={Bot}
                    color="bg-indigo-500"
                  />
                  <StatCard
                    title="Utilisateurs Actifs"
                    value={stats.totalUsers}
                    change={8}
                    icon={Users}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Revenus Mensuels"
                    value={stats.monthlyRevenue}
                    change={15}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    prefix="€"
                  />
                  <StatCard
                    title="Avis & Évaluations"
                    value={stats.totalReviews}
                    change={22}
                    icon={Star}
                    color="bg-yellow-500"
                  />
                  <StatCard
                    title="Conversations Actives"
                    value={stats.activeConversations}
                    change={-3}
                    icon={MessageSquare}
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="Note Moyenne"
                    value={parseFloat(stats.averageRating.toFixed(1))}
                    change={5}
                    icon={TrendingUp}
                    color="bg-purple-500"
                  />
                </div>

                {/* Recent Tools */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
                  <div className="p-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Outils Récents</h2>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors">
                          <Filter className="w-4 h-4" />
                          <span className="font-medium">Filtrer</span>
                        </button>
                        <button
                          onClick={handleCreateTool}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="font-medium">Ajouter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Outil
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Note
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vues
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-200/50">
                        {loadingTools ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center">
                              <div className="flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                                <span className="text-gray-600">Chargement des outils...</span>
                              </div>
                            </td>
                          </tr>
                        ) : recentTools.length > 0 ? (
                          recentTools.map((tool) => (
                            <ToolRow key={tool.id} tool={tool} onEdit={handleEditTool} />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              Aucun outil trouvé. Créez votre premier outil !
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Categories */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
                  <div className="p-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Catégories Récentes</h2>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors">
                          <Filter className="w-4 h-4" />
                          <span className="font-medium">Filtrer</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingCategory(false);
                            setSelectedCategory(null);
                            setCategoryForm({ name: '', slug: '', is_active: true, sort_order: 0, level: 0 });
                            setShowCategoryModal(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="font-medium">Ajouter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niveau
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ordre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-200/50">
                        {loadingCategories ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center">
                              <div className="flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                                <span className="text-gray-600">Chargement des catégories...</span>
                              </div>
                            </td>
                          </tr>
                        ) : categoriesData.slice(0, 4).length > 0 ? (
                          categoriesData.slice(0, 4).map((cat) => (
                            <CategoryRow key={cat.id} category={cat} onEdit={(c) => {
                              setSelectedCategory(c);
                              setIsEditingCategory(true);
                              setCategoryForm(c);
                              setShowCategoryModal(true);
                            }} />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              Aucune catégorie trouvée. Créez votre première catégorie !
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <Globe className="w-8 h-8 mb-4 opacity-80" />
                    <h3 className="text-lg font-bold mb-2">Gestion des Outils</h3>
                    <p className="text-indigo-100 mb-4">Ajoutez et modifiez les outils IA</p>
                    <button
                      onClick={handleCreateTool}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                      Gérer →
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <Shield className="w-8 h-8 mb-4 opacity-80" />
                    <h3 className="text-lg font-bold mb-2">Modération</h3>
                    <p className="text-emerald-100 mb-4">Validez les avis et contenus</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      Modérer →
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                    <Activity className="w-8 h-8 mb-4 opacity-80" />
                    <h3 className="text-lg font-bold mb-2">Analytics</h3>
                    <p className="text-orange-100 mb-4">Analysez les performances</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      Analyser →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <UsersTabContent />
            )}

            {activeTab !== 'overview' && activeTab !== 'users' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Section en développement</h3>
                <p className="text-gray-600 mb-6">Cette section sera bientôt disponible avec toutes ses fonctionnalités.</p>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  Revenir à l'accueil
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            key="login-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ y: 20, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden"
            >
              <div className="flex justify-between items-start px-6 py-4 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Se connecter</h2>
                  <p className="text-sm text-gray-500 mt-1">Accède à ton tableau de bord sécurisé</p>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleLoginSubmit} className="px-6 py-6 space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, remember: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    Se souvenir de moi
                  </label>
                  <button type="button" className="text-indigo-600 hover:underline font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl border text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={isLoggingIn}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:brightness-105 transition disabled:opacity-60"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <span>Se connecter</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateToolModal
        show={showCreateModal}
        isEditing={isEditMode}
        currentStep={currentStep}
        formData={formData}
        arrayInputs={arrayInputs}
        categoriesData={categoriesData}
        isSubmitting={isSubmitting}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmit}
        onStepChange={setCurrentStep}
        onFormChange={handleInputChange}
        onArrayInputChange={handleArrayInputChange}
      />

      <CategoryModal
        show={showCategoryModal}
        isEditing={isEditingCategory}
        categoryForm={categoryForm}
        isSubmitting={isSubmittingCategory}
        onClose={handleCloseCategoryModal}
        onSave={handleCategorySave}
        onFormChange={handleCategoryFormChange}
      />

      <UserDetailsModal />
      <EditUserModal />
    </div>
  );
}

export default Dashboard;
