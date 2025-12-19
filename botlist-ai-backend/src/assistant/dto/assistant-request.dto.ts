import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PricingModel } from '../../tools/tools.enums';

// Classe enrichie pour les messages de contexte
export class ContextMessageDto {
  @ApiProperty({ 
    description: 'Rôle du message',
    enum: ['user', 'assistant'],
    example: 'user'
  })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({ 
    description: 'Contenu du message',
    example: 'J\'ai une petite entreprise de e-commerce et je cherche à automatiser mon service client'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    description: 'Timestamp du message',
    example: '2024-01-15T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  timestamp?: Date;

  @ApiProperty({ 
    description: 'Métadonnées du message (sentiment, intention détectée, etc.)',
    example: {
      sentiment: 'positive',
      detectedIntent: 'tool_search',
      technicalLevel: 'beginner'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    sentiment?: 'negative' | 'neutral' | 'positive';
    detectedIntent?: string;
    technicalLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

// Classe pour les préférences utilisateur
export class UserPreferencesDto {
  @ApiProperty({ 
    description: 'Secteur d\'activité',
    example: 'e-commerce',
    required: false
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ 
    description: 'Taille de l\'entreprise',
    enum: ['startup', 'sme', 'enterprise'],
    example: 'startup',
    required: false
  })
  @IsOptional()
  @IsEnum(['startup', 'sme', 'enterprise'])
  companySize?: 'startup' | 'sme' | 'enterprise';

  @ApiProperty({ 
    description: 'Niveau technique de l\'équipe',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'intermediate',
    required: false
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  technicalLevel?: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({ 
    description: 'Priorité principale',
    enum: ['price', 'features', 'ease_of_use', 'performance', 'integration', 'support'],
    example: 'ease_of_use',
    required: false
  })
  @IsOptional()
  @IsEnum(['price', 'features', 'ease_of_use', 'performance', 'integration', 'support'])
  priority?: 'price' | 'features' | 'ease_of_use' | 'performance' | 'integration' | 'support';

  @ApiProperty({ 
    description: 'Outils actuellement utilisés',
    example: ['shopify', 'gmail', 'slack'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentTools?: string[];

  @ApiProperty({ 
    description: 'Budget mensuel approximatif (en euros)',
    example: 500,
    required: false
  })
  @IsOptional()
  @IsNumber()
  monthlyBudget?: number;

  @ApiProperty({ 
    description: 'Préférences de déploiement',
    enum: ['cloud', 'on_premise', 'hybrid', 'no_preference'],
    example: 'cloud',
    required: false
  })
  @IsOptional()
  @IsEnum(['cloud', 'on_premise', 'hybrid', 'no_preference'])
  deploymentPreference?: 'cloud' | 'on_premise' | 'hybrid' | 'no_preference';

  @ApiProperty({ 
    description: 'Exigences de conformité',
    example: ['gdpr', 'hipaa'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceRequirements?: string[];

  @ApiProperty({ 
    description: 'Langues supportées requises',
    example: ['fr', 'en'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredLanguages?: string[];
}

// Classe enrichie pour la fourchette de prix
export class PriceRangeDto {
  @ApiProperty({ 
    description: 'Prix minimum (en euros)',
    example: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiProperty({ 
    description: 'Prix maximum (en euros)',
    example: 100,
    required: false
  })
  @IsOptional()  
  @IsNumber()
  max?: number;

  @ApiProperty({ 
    description: 'Type de facturation préféré',
    enum: ['monthly', 'yearly', 'per_use', 'one_time'],
    example: 'monthly',
    required: false
  })
  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'per_use', 'one_time'])
  billingType?: 'monthly' | 'yearly' | 'per_use' | 'one_time';

  @ApiProperty({ 
    description: 'Accepte les frais de setup',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  acceptsSetupFees?: boolean;
}

// Classe pour les exigences d'intégration
export class IntegrationRequirementsDto {
  @ApiProperty({ 
    description: 'Intégrations requises',
    example: ['shopify', 'mailchimp', 'slack'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  required?: string[];

  @ApiProperty({ 
    description: 'Intégrations souhaitées (nice-to-have)',
    example: ['zapier', 'hubspot'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred?: string[];

  @ApiProperty({ 
    description: 'Types d\'API requis',
    enum: ['rest', 'graphql', 'webhook', 'no_preference'],
    example: 'rest',
    required: false
  })
  @IsOptional()
  @IsEnum(['rest', 'graphql', 'webhook', 'no_preference'])
  apiType?: 'rest' | 'graphql' | 'webhook' | 'no_preference';

  @ApiProperty({ 
    description: 'Authentification préférée',
    enum: ['api_key', 'oauth', 'basic_auth', 'no_preference'],
    example: 'oauth',
    required: false
  })
  @IsOptional()
  @IsEnum(['api_key', 'oauth', 'basic_auth', 'no_preference'])
  authPreference?: 'api_key' | 'oauth' | 'basic_auth' | 'no_preference';
}

// Classe enrichie pour les filtres de l'assistant
export class AssistantFiltersDto {
  @ApiProperty({ 
    description: 'ID de la catégorie principale',
    example: 'uuid-category-123',
    required: false
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ 
    description: 'ID de la sous-catégorie',
    example: 'uuid-subcategory-456',
    required: false
  })
  @IsOptional()
  @IsUUID()
  subcategory_id?: string;

  @ApiProperty({ 
    description: 'Modèle de tarification',
    enum: PricingModel,
    example: PricingModel.FREEMIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(PricingModel)
  pricing_model?: PricingModel;

  @ApiProperty({ 
    description: 'Fourchette de prix enrichie',
    type: PriceRangeDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  price_range?: PriceRangeDto;

  @ApiProperty({ 
    description: 'Fonctionnalités recherchées',
    example: ['chatbot', 'analytics', 'automation', 'multilingual'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ 
    description: 'Cas d\'usage spécifiques',
    example: ['customer_support', 'lead_generation', 'content_creation'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  use_cases?: string[];

  @ApiProperty({ 
    description: 'Exigences d\'intégration détaillées',
    type: IntegrationRequirementsDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationRequirementsDto)
  integration_requirements?: IntegrationRequirementsDto;

  @ApiProperty({ 
    description: 'Plateformes supportées',
    example: ['web', 'mobile', 'desktop', 'api'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @ApiProperty({ 
    description: 'API disponible requise',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  api_available?: boolean;

  @ApiProperty({ 
    description: 'Open source requis',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  open_source?: boolean;

  @ApiProperty({ 
    description: 'Conformité RGPD requise',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  gdpr_compliant?: boolean;

  @ApiProperty({ 
    description: 'Note minimum requise sur 5',
    example: 4.0,
    minimum: 0,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  min_rating?: number;

  @ApiProperty({ 
    description: 'Nombre maximum de recommandations',
    example: 5,
    minimum: 1,
    maximum: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  max_results?: number;

  @ApiProperty({ 
    description: 'Inclure les outils en version bêta',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  include_beta?: boolean;

  @ApiProperty({ 
    description: 'Filtrer par région géographique',
    example: ['europe', 'usa'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geographic_restrictions?: string[];
}

// Classe pour les options de recherche avancée
export class SearchOptionsDto {
  @ApiProperty({ 
    description: 'Mode de recherche',
    enum: ['standard', 'detailed', 'quick', 'expert'],
    example: 'standard',
    required: false
  })
  @IsOptional()
  @IsEnum(['standard', 'detailed', 'quick', 'expert'])
  searchMode?: 'standard' | 'detailed' | 'quick' | 'expert';

  @ApiProperty({ 
    description: 'Inclure des exemples d\'intégration',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  includeIntegrationExamples?: boolean;

  @ApiProperty({ 
    description: 'Inclure des cas d\'usage détaillés',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  includeUseCaseExamples?: boolean;

  @ApiProperty({ 
    description: 'Générer des recommandations contextuelles',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  generateContextualRecommendations?: boolean;

  @ApiProperty({ 
    description: 'Niveau de détail souhaité pour les métriques',
    enum: ['basic', 'detailed', 'comprehensive'],
    example: 'detailed',
    required: false
  })
  @IsOptional()
  @IsEnum(['basic', 'detailed', 'comprehensive'])
  metricsDetail?: 'basic' | 'detailed' | 'comprehensive';

  @ApiProperty({ 
    description: 'Utiliser l\'IA pour améliorer les réponses',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  useAIEnhancement?: boolean;
}

// Classe principale enrichie pour les requêtes de l'assistant
export class AssistantRequestDto {
  @ApiProperty({
    description: 'Question détaillée de l\'utilisateur',
    example: 'Je cherche un outil IA pour automatiser le service client de ma boutique e-commerce. J\'utilise déjà Shopify et Slack, et j\'ai un budget de 200€/mois maximum.'
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Contexte de conversation enrichi',
    type: [ContextMessageDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContextMessageDto)
  context?: ContextMessageDto[];

  @ApiProperty({
    description: 'Filtres détaillés pour affiner la recherche',
    type: AssistantFiltersDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssistantFiltersDto)
  filters?: AssistantFiltersDto;

  @ApiProperty({
    description: 'Préférences utilisateur complètes',
    type: UserPreferencesDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  userPreferences?: UserPreferencesDto;

  @ApiProperty({
    description: 'Options de recherche avancée',
    type: SearchOptionsDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchOptionsDto)
  searchOptions?: SearchOptionsDto;

  @ApiProperty({
    description: 'Langue de la réponse',
    enum: ['fr', 'en', 'es', 'de'],
    default: 'fr',
    example: 'fr',
    required: false
  })
  @IsOptional()
  @IsEnum(['fr', 'en', 'es', 'de'])
  language?: string;

  @ApiProperty({
    description: 'ID de session pour le suivi de conversation',
    example: 'session-uuid-1234',
    required: false
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'Métadonnées de la requête',
    example: {
      userAgent: 'Mozilla/5.0...',
      ipCountry: 'FR',
      referrer: 'google.com',
      timestamp: '2024-01-15T10:00:00.000Z'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  requestMetadata?: {
    userAgent?: string;
    ipCountry?: string;
    referrer?: string;
    timestamp?: Date;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
  };
}