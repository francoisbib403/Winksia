// Types d'interfaces améliorés pour les DTOs

export interface IntegrationExample {
  name: string;
  type: 'native' | 'api' | 'webhook' | 'zapier' | 'plugin';
  description: string;
  setupComplexity: 'easy' | 'medium' | 'complex';
  useCase: string;
  estimatedSetupTime?: string;
  technicalRequirements?: string[];
  documentation?: string;
}

export interface RecommendedToolDto {
  id: number;
  name: string;
  price: string;
  strengths: string[];
  url: string;
  rating: number;
  integrationExamples?: IntegrationExample[];
  implementationComplexity?: 'low' | 'medium' | 'high';
  supportLevel?: 'community' | 'standard' | 'premium' | 'enterprise';
  securityFeatures?: string[];
  scalabilityScore?: number;
  userCount?: number;
  lastUpdated?: Date;
}

export interface AssistantRequestDto {
  question: string;
  filters?: {
    category_id?: number;
    subcategory_id?: number;
    pricing_model?: string;
    api_available?: boolean;
    open_source?: boolean;
    min_rating?: number;
    max_price?: number;
    integration_requirements?: string[];
    business_size?: 'startup' | 'sme' | 'enterprise';
    industry?: string;
    use_case?: string;
    priority?: 'price' | 'features' | 'ease_of_use' | 'performance' | 'integration' | 'security';
  };
  context?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  }>;
  userProfile?: {
    businessSize?: 'startup' | 'sme' | 'enterprise';
    industry?: string;
    techExpertiseLevel?: 'beginner' | 'intermediate' | 'expert';
    currentTools?: string[];
    budget?: {
      range: 'free' | 'low' | 'medium' | 'high' | 'enterprise';
      amount?: number;
      currency?: string;
    };
  };
  requestMetadata?: {
    sessionId?: string;
    userId?: string;
    source?: 'web' | 'api' | 'mobile';
    locale?: string;
    timezone?: string;
  };
}

export interface AssistantResponseDto {
  response: string;
  reformulatedQuestion: string;
  primaryRecommendation: RecommendedToolDto | null;
  alternatives: RecommendedToolDto[];
  reasoning: string;
  actionSuggestion: string;
  followUpQuestions: string[];
  timestamp: Date;
  sources: {
    internal: boolean;
    apis: string[];
    external: string[];
  };
  
  // Nouvelles propriétés enrichies
  confidenceScore?: number;
  responseType?: 'tool_recommendation' | 'general_advice' | 'comparison' | 'implementation_guide';
  estimatedImplementationTime?: string;
  budgetEstimate?: {
    range: string;
    details: string;
  };
  riskFactors?: string[];
  successMetrics?: string[];
  
  // Méta-informations
  processingTime?: number;
  aiEnhanced?: boolean;
  cacheHit?: boolean;
  
  // Intégrations et implémentation
  integrationGuide?: {
    priority: IntegrationExample[];
    optional: IntegrationExample[];
    advanced: IntegrationExample[];
  };
  
  // Analyse comparative si applicable
  competitorAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    marketPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  };
  
  // ROI et business case
  businessImpact?: {
    timeToValue: string;
    expectedROI: string;
    keyBenefits: string[];
    implementationCost: string;
  };
}

export interface ToolComparisonDto {
  tool1: RecommendedToolDto;
  tool2: RecommendedToolDto;
  comparisonCriteria: string[];
  winner?: {
    overall: 'tool1' | 'tool2' | 'tie';
    byCategory: Record<string, 'tool1' | 'tool2' | 'tie'>;
  };
  analysis: string;
  recommendation: string;
  useCase: {
    tool1BestFor: string[];
    tool2BestFor: string[];
  };
}

export interface ImplementationGuideDto {
  toolId: number;
  toolName: string;
  phases: Array<{
    name: string;
    duration: string;
    tasks: string[];
    prerequisites: string[];
    deliverables: string[];
    risks: string[];
  }>;
  totalTimeline: string;
  budgetBreakdown: {
    software: string;
    implementation: string;
    training: string;
    maintenance: string;
  };
  successFactors: string[];
  commonPitfalls: string[];
  supportResources: string[];
}

export interface ROIAnalysisDto {
  toolId: number;
  toolName: string;
  analysis: {
    initialCosts: {
      software: number;
      implementation: number;
      training: number;
      other: number;
    };
    recurringCosts: {
      monthly: number;
      annual: number;
    };
    expectedBenefits: {
      timeSavings: {
        hoursPerWeek: number;
        valuePerHour: number;
        annualValue: number;
      };
      costReductions: {
        description: string;
        annualSavings: number;
      }[];
      revenueIncrease: {
        description: string;
        annualIncrease: number;
      }[];
    };
    paybackPeriod: string;
    roi12Months: number;
    roi36Months: number;
  };
  assumptions: string[];
  recommendations: string[];
}

export interface UserIntentAnalysisDto {
  keywords: string[];
  categories: string[];
  features: string[];
  useCases: string[];
  pricingPreference?: string;
  businessSize?: 'startup' | 'sme' | 'enterprise';
  priority: 'price' | 'features' | 'ease_of_use' | 'performance' | 'integration' | 'security';
  isGeneralQuestion: boolean;
  confidence: number;
  detectedIntegrations: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  complexity: 'simple' | 'medium' | 'complex';
  industryContext?: string;
  technicalLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface SearchFiltersDto {
  categories?: string[];
  pricingModels?: string[];
  ratings?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  integrations?: string[];
  businessSize?: 'startup' | 'sme' | 'enterprise';
  deployment?: 'cloud' | 'on-premise' | 'hybrid';
  support?: 'community' | 'standard' | 'premium' | 'enterprise';
  compliance?: string[]; // GDPR, SOX, HIPAA, etc.
  apiAvailable?: boolean;
  openSource?: boolean;
  freeTier?: boolean;
  trialAvailable?: boolean;
}

export interface AIServiceHealthDto {
  openAI: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    configured: boolean;
    requestCount: number;
    errorRate: number;
    averageResponseTime: number;
    lastError?: string;
  };
  cache: {
    size: number;
    hitRate: number;
    lastClear?: Date;
  };
  performance: {
    totalRequests: number;
    successRate: number;
    averageProcessingTime: number;
  };
}

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

// Utilitaires de validation
export class DTOValidator {
  static isValidPricingModel(model: string): boolean {
    return Object.values(PRICING_MODELS).includes(model as any);
  }

  static isValidBusinessSize(size: string): boolean {
    return Object.values(BUSINESS_SIZES).includes(size as any);
  }

  static isValidPriority(priority: string): boolean {
    return Object.values(PRIORITIES).includes(priority as any);
  }

  static sanitizeFilters(filters: any): SearchFiltersDto {
    return {
      categories: Array.isArray(filters.categories) ? filters.categories : [],
      pricingModels: Array.isArray(filters.pricingModels) ? filters.pricingModels : [],
      ratings: {
        min: typeof filters.ratings?.min === 'number' ? filters.ratings.min : undefined,
        max: typeof filters.ratings?.max === 'number' ? filters.ratings.max : undefined,
      },
      features: Array.isArray(filters.features) ? filters.features : [],
      integrations: Array.isArray(filters.integrations) ? filters.integrations : [],
      businessSize: this.isValidBusinessSize(filters.businessSize) ? filters.businessSize : undefined,
      deployment: filters.deployment,
      support: filters.support,
      compliance: Array.isArray(filters.compliance) ? filters.compliance : [],
      apiAvailable: typeof filters.apiAvailable === 'boolean' ? filters.apiAvailable : undefined,
      openSource: typeof filters.openSource === 'boolean' ? filters.openSource : undefined,
      freeTier: typeof filters.freeTier === 'boolean' ? filters.freeTier : undefined,
      trialAvailable: typeof filters.trialAvailable === 'boolean' ? filters.trialAvailable : undefined,
    };
  }
}