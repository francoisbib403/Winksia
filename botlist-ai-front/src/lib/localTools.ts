'use client';

import { Tool, ToolSummary } from '@/types/tool';
import { useState, useEffect, useCallback } from 'react';

// Clé pour le localStorage
const LOCAL_STORAGE_KEY = 'winksia_tools_cache';

// Interface pour les outils locaux (plus simple que l'interface Tool complète)
interface LocalTool {
  id: string;
  name: string;
  company: string;
  category: string;
  allCategories: string[];
  description: string;
  fullDescription: string;
  rating: number;
  reviews: number;
  price: string;
  priceType: string;
  tags: string[];
  functions: string[];
  domains: string[];
  useCases: string[];
  advantages: string[];
  concerns: string[];
  businessValue: string;
  roi: string;
  integration: string;
  capabilities: Record<string, number>;
  featured: boolean;
}

// Outils de démonstration pour tester rapidement
const DEMO_TOOLS: LocalTool[] = [
  {
    id: 'demo-1',
    name: 'ChatGPT Pro',
    company: 'OpenAI',
    category: 'Assistant IA',
    allCategories: ['Développement & IT', 'Marketing & Communication'],
    description: 'Assistant IA conversationnel avancé pour le développement et la rédaction',
    fullDescription: 'ChatGPT Pro est un assistant IA conversationnel de pointe qui excelle dans la génération de code, la rédaction de contenu technique, le débogage et l\'analyse de problèmes complexes. Idéal pour les développeurs et les équipes techniques.',
    rating: 4.5,
    reviews: 128,
    price: '20€',
    priceType: 'Payant',
    tags: ['IA Conversationnelle', 'Génération de Code', 'Débogage'],
    functions: ['Conversation', 'Assistant virtuel', 'Rédaction de contenu'],
    domains: ['Développement', 'Analyse de Données', 'Service Client'],
    useCases: ['Rédaction de contenu', 'Analyse de données', 'Service client / Chatbots'],
    advantages: [
      'Excellent pour la génération de code',
      'Support de nombreux langages de programmation',
      'Interface intuitive et rapide'
    ],
    concerns: [
      'Limitations sur les très longs conversations',
      'Coût mensuel à considérer',
      'Parfois trop verbeux dans les réponses'
    ],
    businessValue: 'Augmente la productivité des développeurs de 40% en automatisant les tâches répétitives et en fournissant des solutions rapides aux problèmes techniques.',
    roi: '3-6 mois',
    integration: 'API REST, SDK Python/JavaScript, intégration avec VS Code et autres IDE populaires',
    capabilities: {
      'Génération de Code': 95,
      'Analyse Technique': 90,
      'Conversation': 85,
      'Vitesse': 90,
      'Précision': 88
    },
    featured: true
  },
  {
    id: 'demo-2',
    name: 'Midjourney',
    company: 'Midjourney Inc.',
    category: 'Génération d\'images',
    allCategories: ['Design & Création', 'Marketing & Communication'],
    description: 'Générateur d\'images IA de haute qualité pour les créatifs',
    fullDescription: 'Midjourney est un outil de génération d\'images par IA qui crée des visuels époustouflants à partir de descriptions textuelles. Parfait pour les designers, les marketeurs et les artistes cherchant à explorer rapidement des concepts visuels.',
    rating: 4.8,
    reviews: 256,
    price: '10€',
    priceType: 'Freemium',
    tags: ['Génération d\'Images', 'Design', 'Art IA'],
    functions: ['Génération d\'images', 'Création artistique'],
    domains: ['Création de Contenu', 'Marketing', 'Design'],
    useCases: ['Génération d\'images', 'Rédaction de contenu', 'Marketing & Communication'],
    advantages: [
      'Qualité d\'image exceptionnelle',
      'Style artistique unique',
      'Communauté active et inspirante'
    ],
    concerns: [
      'Courbe d\'apprentissage pour les prompts',
      'Coût peut s\'accumuler rapidement',
      'Moins de contrôle précis que d\'outils concurrents'
    ],
    businessValue: 'Réduit les coûts de production visuelle de 60% et accélère les cycles de création de concepts de 75%.',
    roi: '2-4 mois',
    integration: 'Discord, API web, intégrations avec les outils de design populaires',
    capabilities: {
      'Qualité d\'Image': 95,
      'Créativité': 92,
      'Vitesse': 85,
      'Variété de Styles': 90,
      'Facilité d\'Usage': 78
    },
    featured: true
  },
  {
    id: 'demo-3',
    name: 'Notion AI',
    company: 'Notion',
    category: 'Productivité',
    allCategories: ['Finance & Comptabilité', 'Ressources Humaines', 'Ventes & CRM'],
    description: 'Assistant IA intégré pour la gestion de connaissances et la productivité',
    fullDescription: 'Notion AI transforme votre espace de travail en un assistant intelligent capable de rédiger, résumer, organiser et analyser directement dans vos documents. Parfait pour les équipes cherchant à centraliser leurs connaissances.',
    rating: 4.3,
    reviews: 189,
    price: '0€',
    priceType: 'Freemium',
    tags: ['Productivité', 'Gestion de Connaissances', 'Collaboration'],
    functions: ['Assistant virtuel', 'Rédaction de contenu', 'Analyse de données'],
    domains: ['Productivité', 'Gestion de Projet', 'Documentation'],
    useCases: ['Rédaction de contenu', 'Analyse de données', 'Automatisation des tâches'],
    advantages: [
      'Intégration parfaite avec l\'écosystème Notion',
      'Interface collaborative',
      'Polyvalence des fonctionnalités'
    ],
    concerns: [
      'Nécessite une bonne structure de base',
      'Performance variable selon la complexité',
      'Fonctionnalités avancées payantes'
    ],
    businessValue: 'Centralise la connaissance d\'entreprise et améliore la collaboration inter-équipes de 35%.',
    roi: '4-8 mois',
    integration: 'Écosystème Notion complet, API web, synchronisation avec les outils populaires',
    capabilities: {
      'Organisation': 90,
      'Collaboration': 88,
      'Rédaction': 85,
      'Analyse': 82,
      'Intégration': 92
    },
    featured: false
  },
  {
    id: 'demo-4',
    name: 'GitHub Copilot',
    company: 'GitHub/Microsoft',
    category: 'Développement',
    allCategories: ['Développement & IT'],
    description: 'Assistant IA de codage en temps réel pour les développeurs',
    fullDescription: 'GitHub Copilot est un assistant IA de codage qui suggère des lignes de code et des fonctions entières directement dans votre éditeur. Entraîné sur des milliards de lignes de code, il comprend le contexte et propose des solutions pertinentes.',
    rating: 4.6,
    reviews: 342,
    price: '10€',
    priceType: 'Payant',
    tags: ['Développement', 'IA de Code', 'Productivité'],
    functions: ['Génération de Code', 'Assistant virtuel', 'Débogage'],
    domains: ['Développement', 'Analyse de Données', 'Automatisation'],
    useCases: ['Rédaction de contenu', 'Analyse de données', 'Automatisation des tâches'],
    advantages: [
      'Intégration transparente avec les IDE',
      'Apprentissage contextuel',
      'Support de nombreux langages'
    ],
    concerns: [
      'Dépendance potentielle à l\'outil',
      'Coût additionnel pour les équipes',
      'Parfois génère du code redondant'
    ],
    businessValue: 'Accélère le développement de 30-50% et réduit les erreurs de codage de 25%.',
    roi: '3-5 mois',
    integration: 'VS Code, JetBrains IDEs, Neovim, GitHub ecosystem',
    capabilities: {
      'Génération de Code': 92,
      'Contexte': 88,
      'Vitesse': 90,
      'Précision': 85,
      'Apprentissage': 87
    },
    featured: true
  },
  {
    id: 'demo-5',
    name: 'Jasper AI',
    company: 'Jasper',
    category: 'Marketing de contenu',
    allCategories: ['Marketing & Communication', 'Ventes & CRM'],
    description: 'Plateforme IA pour la création de contenu marketing à grande échelle',
    fullDescription: 'Jasper AI est une plateforme complète de création de contenu marketing qui utilise l\'IA pour générer des articles, des publicités, des emails et des posts réseaux sociaux. Conçue spécifiquement pour les équipes marketing.',
    rating: 4.4,
    reviews: 198,
    price: '39€',
    priceType: 'Payant',
    tags: ['Marketing', 'Contenu', 'Rédaction'],
    functions: ['Rédaction de contenu', 'Assistant virtuel', 'Traduction'],
    domains: ['Marketing', 'Création de Contenu', 'Ventes'],
    useCases: ['Rédaction de contenu', 'Emails & communication', 'Marketing & Communication'],
    advantages: [
      'Spécialisé pour le marketing',
      'Templates prédéfinis',
      'Tonalité adaptable'
    ],
    concerns: [
      'Coût élevé pour les petites entreprises',
      'Nécessite des ajustements manuels',
      'Moins créatif que des rédacteurs humains'
    ],
    businessValue: 'Augmente la production de contenu marketing de 300% et réduit les coûts de 40%.',
    roi: '2-3 mois',
    integration: 'CMS populaires, outils de marketing, API REST',
    capabilities: {
      'Rédaction Marketing': 90,
      'Variété de Contenu': 88,
      'Vitesse': 92,
      'SEO': 85,
      'Adaptation': 87
    },
    featured: false
  }
];

// Fonctions pour gérer le cache local
export const getLocalTools = (): LocalTool[] => {
  if (typeof window === 'undefined') return DEMO_TOOLS;
  
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du cache local:', error);
  }
  
  // Si pas de cache, sauvegarder les outils de démo
  setLocalTools(DEMO_TOOLS);
  return DEMO_TOOLS;
};

export const setLocalTools = (tools: LocalTool[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tools));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache local:', error);
  }
};

export const addLocalTool = (tool: LocalTool): void => {
  const tools = getLocalTools();
  const updatedTools = [...tools, { ...tool, id: `local-${Date.now()}` }];
  setLocalTools(updatedTools);
};

export const updateLocalTool = (id: string, updates: Partial<LocalTool>): void => {
  const tools = getLocalTools();
  const updatedTools = tools.map(tool => 
    tool.id === id ? { ...tool, ...updates } : tool
  );
  setLocalTools(updatedTools);
};

export const deleteLocalTool = (id: string): void => {
  const tools = getLocalTools();
  const updatedTools = tools.filter(tool => tool.id !== id);
  setLocalTools(updatedTools);
};

export const clearLocalTools = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// Convertir les outils locaux vers le format ToolSummary attendu par le composant
export const convertToToolSummary = (localTool: LocalTool): ToolSummary => {
  return {
    id: localTool.id,
    name: localTool.name,
    slug: localTool.name.toLowerCase().replace(/\s+/g, '-'),
    tagline: localTool.description,
    description: localTool.description,
    category: {
      id: localTool.category.toLowerCase().replace(/\s+/g, '-'),
      name: localTool.category
    },
    pricing_model: localTool.priceType.toLowerCase().replace(/\s+/g, '_'),
    pricing_details: {
      price: localTool.price,
      type: localTool.priceType
    },
    website_url: '#',
    overall_rating: localTool.rating,
    review_count: localTool.reviews,
    features: localTool.functions,
    use_cases: localTool.useCases,
    featured: localTool.featured,
    created_at: new Date(),
    published_at: new Date()
  };
};

export const getLocalToolsAsSummary = (): ToolSummary[] => {
  const localTools = getLocalTools();
  return localTools.map(convertToToolSummary);
};

// Fonction pour basculer entre mode local et API
export const useLocalMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('winksia_local_mode') === 'true';
};

export const setLocalMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('winksia_local_mode', enabled.toString());
};

// Hook React pour utiliser les outils locaux
export const useLocalTools = () => {
  const [tools, setTools] = useState<LocalTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    const localMode = useLocalMode();
    setIsLocalMode(localMode);
    
    if (localMode) {
      const localTools = getLocalTools();
      setTools(localTools);
      setIsLoading(false);
    }
  }, []);

  const addTool = useCallback((tool: LocalTool) => {
    addLocalTool(tool);
    setTools((prev: LocalTool[]) => [...prev, { ...tool, id: `local-${Date.now()}` }]);
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<LocalTool>) => {
    updateLocalTool(id, updates);
    setTools((prev: LocalTool[]) => prev.map((tool: LocalTool) => 
      tool.id === id ? { ...tool, ...updates } : tool
    ));
  }, []);

  const deleteTool = useCallback((id: string) => {
    deleteLocalTool(id);
    setTools((prev: LocalTool[]) => prev.filter((tool: LocalTool) => tool.id !== id));
  }, []);

  const toggleLocalMode = useCallback((enabled: boolean) => {
    setLocalMode(enabled);
    setIsLocalMode(enabled);
    if (enabled) {
      const localTools = getLocalTools();
      setTools(localTools);
    }
  }, []);

  return {
    tools,
    isLoading,
    isLocalMode,
    addTool,
    updateTool,
    deleteTool,
    toggleLocalMode,
    clearTools: () => {
      clearLocalTools();
      setTools([]);
    }
  };
};