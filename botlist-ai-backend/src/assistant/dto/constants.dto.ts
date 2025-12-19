// dto/constants.dto.ts - Constantes et utilitaires pour les DTOs

import { BadRequestException } from '@nestjs/common';

// Constantes pour les énumérations
export const PRICING_MODELS = {
  FREE: 'free',
  FREEMIUM: 'freemium',
  PAID: 'paid',
  ENTERPRISE: 'enterprise',
  API_BASED: 'api_based'
} as const;

export const BUSINESS_SIZES = {
  STARTUP: 'startup',
  SME: 'sme',
  ENTERPRISE: 'enterprise'
} as const;

export const PRIORITIES = {
  PRICE: 'price',
  FEATURES: 'features',
  EASE_OF_USE: 'ease_of_use',
  PERFORMANCE: 'performance',
  INTEGRATION: 'integration',
  SECURITY: 'security'
} as const;

export const INTEGRATION_TYPES = {
  NATIVE: 'native',
  API: 'api',
  WEBHOOK: 'webhook',
  ZAPIER: 'zapier',
  PLUGIN: 'plugin'
} as const;

export const COMPLEXITY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  COMPLEX: 'complex'
} as const;

export const RESPONSE_TYPES = {
  TOOL_RECOMMENDATION: 'tool_recommendation',
  GENERAL_ADVICE: 'general_advice',
  COMPARISON: 'comparison',
  IMPLEMENTATION_GUIDE: 'implementation_guide'
} as const;

export const SERVICE_HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
} as const;

export const TECH_EXPERTISE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
} as const;

export const BUDGET_RANGES = {
  FREE: 'free',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  ENTERPRISE: 'enterprise'
} as const;

export const REQUEST_SOURCES = {
  WEB: 'web',
  API: 'api',
  MOBILE: 'mobile'
} as const;

export const SUPPORT_LEVELS = {
  COMMUNITY: 'community',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

export const DEPLOYMENT_TYPES = {
  CLOUD: 'cloud',
  ON_PREMISE: 'on-premise',
  HYBRID: 'hybrid'
} as const;

export const MARKET_POSITIONS = {
  LEADER: 'leader',
  CHALLENGER: 'challenger',
  NICHE: 'niche',
  EMERGING: 'emerging'
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
  URGENT: 'urgent'
} as const;

// Types dérivés des constantes
export type PricingModel = typeof PRICING_MODELS[keyof typeof PRICING_MODELS];
export type BusinessSize = typeof BUSINESS_SIZES[keyof typeof BUSINESS_SIZES];
export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];
export type IntegrationType = typeof INTEGRATION_TYPES[keyof typeof INTEGRATION_TYPES];
export type ComplexityLevel = typeof COMPLEXITY_LEVELS[keyof typeof COMPLEXITY_LEVELS];
export type ResponseType = typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];
export type ServiceHealthStatus = typeof SERVICE_HEALTH_STATUS[keyof typeof SERVICE_HEALTH_STATUS];
export type TechExpertiseLevel = typeof TECH_EXPERTISE_LEVELS[keyof typeof TECH_EXPERTISE_LEVELS];
export type BudgetRange = typeof BUDGET_RANGES[keyof typeof BUDGET_RANGES];
export type RequestSource = typeof REQUEST_SOURCES[keyof typeof REQUEST_SOURCES];
export type SupportLevel = typeof SUPPORT_LEVELS[keyof typeof SUPPORT_LEVELS];
export type DeploymentType = typeof DEPLOYMENT_TYPES[keyof typeof DEPLOYMENT_TYPES];
export type MarketPosition = typeof MARKET_POSITIONS[keyof typeof MARKET_POSITIONS];
export type SentimentType = typeof SENTIMENT_TYPES[keyof typeof SENTIMENT_TYPES];

// Mapping des intégrations populaires avec métadonnées
export const POPULAR_INTEGRATIONS = new Map<string, {
  displayName: string;
  category: string;
  complexity: ComplexityLevel;
  setupTime: string;
  description: string;
}>([
  ['slack', {
    displayName: 'Slack',
    category: 'communication',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '15 min',
    description: 'Notifications et collaboration d\'équipe'
  }],
  ['teams', {
    displayName: 'Microsoft Teams',
    category: 'communication',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '20 min',
    description: 'Intégration Microsoft 365'
  }],
  ['salesforce', {
    displayName: 'Salesforce',
    category: 'crm',
    complexity: COMPLEXITY_LEVELS.MEDIUM,
    setupTime: '1-2 heures',
    description: 'Gestion de la relation client'
  }],
  ['hubspot', {
    displayName: 'HubSpot',
    category: 'marketing',
    complexity: COMPLEXITY_LEVELS.MEDIUM,
    setupTime: '45 min',
    description: 'Marketing et CRM automation'
  }],
  ['zapier', {
    displayName: 'Zapier',
    category: 'automation',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '10 min',
    description: 'Automatisation workflow no-code'
  }],
  ['google-workspace', {
    displayName: 'Google Workspace',
    category: 'productivity',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '30 min',
    description: 'Suite bureautique Google'
  }],
  ['microsoft-365', {
    displayName: 'Microsoft 365',
    category: 'productivity',
    complexity: COMPLEXITY_LEVELS.MEDIUM,
    setupTime: '45 min',
    description: 'Suite bureautique Microsoft'
  }],
  ['notion', {
    displayName: 'Notion',
    category: 'productivity',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '20 min',
    description: 'Gestion de connaissances et projets'
  }],
  ['trello', {
    displayName: 'Trello',
    category: 'project-management',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '15 min',
    description: 'Gestion de projet Kanban'
  }],
  ['asana', {
    displayName: 'Asana',
    category: 'project-management',
    complexity: COMPLEXITY_LEVELS.EASY,
    setupTime: '25 min',
    description: 'Coordination d\'équipe et tâches'
  }],
  ['stripe', {
    displayName: 'Stripe',
    category: 'payment',
    complexity: COMPLEXITY_LEVELS.MEDIUM,
    setupTime: '1 heure',
    description: 'Traitement de paiements'
  }],
  ['shopify', {
    displayName: 'Shopify',
    category: 'e-commerce',
    complexity: COMPLEXITY_LEVELS.MEDIUM,
    setupTime: '2 heures',
    description: 'Plateforme e-commerce'
  }]
]);

// Utilitaires de validation
export class DTOValidator {
  static isValidPricingModel(model: string): model is PricingModel {
    return Object.values(PRICING_MODELS).includes(model as any);
  }

  static isValidBusinessSize(size: string): size is BusinessSize {
    return Object.values(BUSINESS_SIZES).includes(size as any);
  }

  static isValidPriority(priority: string): priority is Priority {
    return Object.values(PRIORITIES).includes(priority as any);
  }

  static isValidIntegrationType(type: string): type is IntegrationType {
    return Object.values(INTEGRATION_TYPES).includes(type as any);
  }

  static isValidComplexityLevel(level: string): level is ComplexityLevel {
    return Object.values(COMPLEXITY_LEVELS).includes(level as any);
  }

  static isValidTechExpertiseLevel(level: string): level is TechExpertiseLevel {
    return Object.values(TECH_EXPERTISE_LEVELS).includes(level as any);
  }

  static isValidBudgetRange(range: string): range is BudgetRange {
    return Object.values(BUDGET_RANGES).includes(range as any);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateRating(rating: number): boolean {
    return rating >= 0 && rating <= 5;
  }

  static sanitizeString(input: string, maxLength = 500): string {
    return input?.trim().substring(0, maxLength) || '';
  }

  static sanitizeArray(input: any[], maxItems = 50): string[] {
    if (!Array.isArray(input)) return [];
    
    return input
      .filter(item => typeof item === 'string')
      .map(item => this.sanitizeString(item, 100))
      .filter(item => item.length > 0)
      .slice(0, maxItems);
  }

  static sanitizeFilters(filters: any): any {
    if (!filters || typeof filters !== 'object') return {};

    return {
      categories: this.sanitizeArray(filters.categories),
      pricingModels: this.sanitizeArray(filters.pricingModels).filter(this.isValidPricingModel),
      ratings: {
        min: typeof filters.ratings?.min === 'number' && this.validateRating(filters.ratings.min) 
          ? filters.ratings.min : undefined,
        max: typeof filters.ratings?.max === 'number' && this.validateRating(filters.ratings.max) 
          ? filters.ratings.max : undefined,
      },
      features: this.sanitizeArray(filters.features),
      integrations: this.sanitizeArray(filters.integrations),
      businessSize: this.isValidBusinessSize(filters.businessSize) ? filters.businessSize : undefined,
      deployment: filters.deployment,
      support: filters.support,
      compliance: this.sanitizeArray(filters.compliance),
      apiAvailable: typeof filters.apiAvailable === 'boolean' ? filters.apiAvailable : undefined,
      openSource: typeof filters.openSource === 'boolean' ? filters.openSource : undefined,
      freeTier: typeof filters.freeTier === 'boolean' ? filters.freeTier : undefined,
      trialAvailable: typeof filters.trialAvailable === 'boolean' ? filters.trialAvailable : undefined,
    };
  }

  static validateAssistantRequest(request: any): void {
    if (!request) {
      throw new BadRequestException('Request body is required');
    }

    if (!request.question || typeof request.question !== 'string') {
      throw new BadRequestException('Question is required and must be a string');
    }

    if (request.question.trim().length === 0) {
      throw new BadRequestException('Question cannot be empty');
    }

    if (request.question.length > 1000) {
      throw new BadRequestException('Question is too long (max 1000 characters)');
    }

    // Validation du contexte
    if (request.context && !Array.isArray(request.context)) {
      throw new BadRequestException('Context must be an array');
    }

    if (request.context && request.context.length > 20) {
      throw new BadRequestException('Context cannot have more than 20 messages');
    }

    // Validation des filtres
    if (request.filters) {
      if (request.filters.min_rating && !this.validateRating(request.filters.min_rating)) {
        throw new BadRequestException('Invalid rating value (must be between 0 and 5)');
      }

      if (request.filters.pricing_model && !this.isValidPricingModel(request.filters.pricing_model)) {
        throw new BadRequestException('Invalid pricing model');
      }
    }

    // Validation du profil utilisateur
    if (request.userProfile) {
      if (request.userProfile.businessSize && !this.isValidBusinessSize(request.userProfile.businessSize)) {
        throw new BadRequestException('Invalid business size');
      }

      if (request.userProfile.techExpertiseLevel && !this.isValidTechExpertiseLevel(request.userProfile.techExpertiseLevel)) {
        throw new BadRequestException('Invalid tech expertise level');
      }
    }
  }
}

// Utilitaires de transformation
export class DTOTransformer {
  static formatPrice(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatPercentage(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
    return `${Math.round(minutes / 1440)} jour(s)`;
  }

  static getIntegrationInfo(integrationKey: string) {
    return POPULAR_INTEGRATIONS.get(integrationKey.toLowerCase()) || {
      displayName: integrationKey,
      category: 'other',
      complexity: COMPLEXITY_LEVELS.MEDIUM,
      setupTime: 'Variable',
      description: 'Intégration tierce'
    };
  }

  static getBudgetRangeDescription(range: BudgetRange): string {
    switch (range) {
      case BUDGET_RANGES.FREE:
        return '0€ - Gratuit uniquement';
      case BUDGET_RANGES.LOW:
        return '0€ - 50€/mois';
      case BUDGET_RANGES.MEDIUM:
        return '50€ - 500€/mois';
      case BUDGET_RANGES.HIGH:
        return '500€ - 2000€/mois';
      case BUDGET_RANGES.ENTERPRISE:
        return '2000€+/mois - Solutions enterprise';
      default:
        return 'Budget non spécifié';
    }
  }

  static getBusinessSizeDescription(size: BusinessSize): string {
    switch (size) {
      case BUSINESS_SIZES.STARTUP:
        return '1-20 employés - Startup/TPE';
      case BUSINESS_SIZES.SME:
        return '21-250 employés - PME';
      case BUSINESS_SIZES.ENTERPRISE:
        return '250+ employés - Grande entreprise';
      default:
        return 'Taille non spécifiée';
    }
  }

  static getPriorityDescription(priority: Priority): string {
    switch (priority) {
      case PRIORITIES.PRICE:
        return 'Prix et rapport qualité/prix';
      case PRIORITIES.FEATURES:
        return 'Richesse fonctionnelle';
      case PRIORITIES.EASE_OF_USE:
        return 'Facilité d\'utilisation';
      case PRIORITIES.PERFORMANCE:
        return 'Performance et vitesse';
      case PRIORITIES.INTEGRATION:
        return 'Capacités d\'intégration';
      case PRIORITIES.SECURITY:
        return 'Sécurité et conformité';
      default:
        return 'Priorité non spécifiée';
    }
  }
}

// Factory pour créer des réponses type
export class ResponseFactory {
  static createSuccessResponse(data: any, message = 'Success'): any {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static createErrorResponse(error: string, code?: string): any {
    return {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString()
    };
  }

  static createHealthResponse(status: ServiceHealthStatus, details: any): any {
    return {
      status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      details
    };
  }
}