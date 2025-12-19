import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNumber, IsDate, IsBoolean, IsObject, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Nouvelle classe pour les exemples d'intégration
export class IntegrationExampleDto {
  @ApiProperty({ 
    description: 'Nom de l\'intégration',
    example: 'Webhook Slack' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Description de l\'intégration',
    example: 'Envoyer des notifications automatiques vers un channel Slack' 
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Niveau de difficulté',
    enum: ['easy', 'medium', 'complex'],
    example: 'easy'
  })
  @IsEnum(['easy', 'medium', 'complex'])
  difficulty: 'easy' | 'medium' | 'complex';

  @ApiProperty({ 
    description: 'Temps estimé de mise en place',
    example: '15 min' 
  })
  @IsString()
  estimatedTime: string;

  @ApiProperty({ 
    description: 'Exemple de code (optionnel)',
    example: 'const webhook = "https://hooks.slack.com/...";',
    required: false
  })
  @IsOptional()
  @IsString()
  codeExample?: string;

  @ApiProperty({ 
    description: 'Documentation ou lien vers le guide',
    example: 'https://api.example.com/docs/slack-integration',
    required: false
  })
  @IsOptional()
  @IsString()
  documentationUrl?: string;
}

// Classe enrichie pour les recommandations d'outils
export class RecommendedToolDto {
  @ApiProperty({ 
    description: 'ID unique de l\'outil',
    example: 'uuid-1234-5678-9012' 
  })
  @IsString()
  id: string;

  @ApiProperty({ 
    description: 'Nom de l\'outil IA',
    example: 'ChatGPT' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Information de prix formatée avec emoji',
    example: '🎁 Freemium (gratuit + options payantes)' 
  })
  @IsString()
  price: string;

  @ApiProperty({ 
    description: 'Points forts principaux avec emojis',
    example: ['⭐ Excellent rating utilisateurs', '🚀 Interface intuitive', '🔗 API disponible'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @ApiProperty({ 
    description: 'URL du site web de l\'outil',
    example: 'https://openai.com/chatgpt',
    required: false 
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ 
    description: 'Note globale sur 5',
    example: 4.8,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ 
    description: 'URL du logo de l\'outil',
    example: 'https://example.com/logo.png',
    required: false 
  })
  @IsOptional()
  @IsString()
  logo?: string;

  // Nouvelles propriétés enrichies
  @ApiProperty({ 
    description: 'Exemples concrets d\'intégration',
    type: [IntegrationExampleDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegrationExampleDto)
  integrationExamples?: IntegrationExampleDto[];

  @ApiProperty({ 
    description: 'Exemples de cas d\'usage spécifiques',
    example: [
      'Automatiser vos campagnes email avec des messages personnalisés',
      'Générer du contenu pour vos réseaux sociaux'
    ],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  useCaseExamples?: string[];

  @ApiProperty({ 
    description: 'Temps estimé de mise en place',
    example: '1-2h',
    required: false
  })
  @IsOptional()
  @IsString()
  estimatedSetupTime?: string;

  @ApiProperty({ 
    description: 'Niveau de la courbe d\'apprentissage',
    enum: ['facile', 'modérée', 'avancée'],
    example: 'facile',
    required: false
  })
  @IsOptional()
  @IsEnum(['facile', 'modérée', 'avancée'])
  learningCurve?: 'facile' | 'modérée' | 'avancée';

  @ApiProperty({ 
    description: 'Score de pertinence pour cette recherche (0-5)',
    example: 4.2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  relevanceScore?: number;

  @ApiProperty({ 
    description: 'Tags contextuels pour cette recherche',
    example: ['recommandé-débutants', 'intégration-facile', 'roi-rapide'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contextualTags?: string[];

  @ApiProperty({ 
    description: 'Informations sur le support et la communauté',
    example: {
      hasFreeTrial: true,
      communitySize: 'large',
      supportQuality: 'excellent',
      documentationQuality: 'comprehensive'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  supportInfo?: {
    hasFreeTrial?: boolean;
    communitySize?: 'small' | 'medium' | 'large';
    supportQuality?: 'basic' | 'good' | 'excellent';
    documentationQuality?: 'basic' | 'good' | 'comprehensive';
  };
}

// Classe pour les métriques de performance de la recherche
export class SearchPerformanceDto {
  @ApiProperty({ 
    description: 'Temps de traitement en millisecondes',
    example: 1250
  })
  @IsNumber()
  processingTime: number;

  @ApiProperty({ 
    description: 'Nombre d\'outils évalués',
    example: 15
  })
  @IsNumber()
  toolsEvaluated: number;

  @ApiProperty({ 
    description: 'Score de confiance de la recommandation (0-100)',
    example: 87
  })
  @IsNumber()
  confidenceScore: number;

  @ApiProperty({ 
    description: 'Algorithme de scoring utilisé',
    example: 'enhanced_contextual_v2'
  })
  @IsString()
  scoringAlgorithm: string;

  @ApiProperty({ 
    description: 'Indicateurs de qualité de l\'analyse',
    example: {
      intentDetectionAccuracy: 'high',
      categoryMatchPrecision: 'excellent',
      integrationRelevance: 'medium'
    }
  })
  @IsObject()
  qualityIndicators: {
    intentDetectionAccuracy: 'low' | 'medium' | 'high';
    categoryMatchPrecision: 'poor' | 'good' | 'excellent';
    integrationRelevance: 'low' | 'medium' | 'high';
  };
}

// Classe enrichie pour les sources de données
export class ResponseSourcesDto {
  @ApiProperty({ 
    description: 'Indique si les données proviennent des APIs internes',
    example: true 
  })
  @IsBoolean()
  internal: boolean;

  @ApiProperty({ 
    description: 'Liste des APIs internes utilisées',
    example: ['/tools', '/categories', '/integrations'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  apis: string[];

  @ApiProperty({ 
    description: 'Sources externes utilisées',
    example: ['OpenAI GPT-3.5', 'Industry Reports'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  external?: string[];

  @ApiProperty({ 
    description: 'Bases de données consultées',
    example: ['tools_db', 'categories_cache', 'user_preferences'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  databases?: string[];

  @ApiProperty({ 
    description: 'Timestamp de dernière mise à jour des données',
    example: '2024-01-15T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  lastUpdated?: Date;
}

// Classe pour les recommandations contextuelles
export class ContextualRecommendationDto {
  @ApiProperty({ 
    description: 'Type de recommandation contextuelle',
    enum: ['industry_specific', 'budget_optimized', 'integration_focused', 'beginner_friendly'],
    example: 'industry_specific'
  })
  @IsEnum(['industry_specific', 'budget_optimized', 'integration_focused', 'beginner_friendly'])
  type: 'industry_specific' | 'budget_optimized' | 'integration_focused' | 'beginner_friendly';

  @ApiProperty({ 
    description: 'Titre de la recommandation',
    example: 'Spécialement pour le e-commerce'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Description de pourquoi cette recommandation est pertinente',
    example: 'Ces outils sont optimisés pour les boutiques en ligne et s\'intègrent parfaitement avec Shopify'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Outils recommandés pour ce contexte',
    type: [String],
    example: ['tool-uuid-1', 'tool-uuid-2']
  })
  @IsArray()
  @IsString({ each: true })
  toolIds: string[];

  @ApiProperty({ 
    description: 'Score de priorité (0-10)',
    example: 8
  })
  @IsNumber()
  priority: number;
}

// Classe principale enrichie pour la réponse de l'assistant
export class AssistantResponseDto {
  @ApiProperty({ 
    description: 'Réponse formatée de l\'assistant en markdown enrichi',
    example: '# Recherche d\'outils IA pour marketing\n\n## 🎯 Recommandation Principale...'
  })
  @IsString()
  response: string;

  @ApiProperty({ 
    description: 'Question reformulée et contextualisée',
    example: 'Recherche d\'outils IA pour le marketing digital dans le secteur e-commerce (solution facile à utiliser)'
  })
  @IsString()
  reformulatedQuestion: string;

  @ApiProperty({ 
    description: 'Outil principal recommandé avec informations enrichies',
    type: RecommendedToolDto,
    nullable: true
  })
  @ValidateNested()
  @Type(() => RecommendedToolDto)
  @IsOptional()
  primaryRecommendation: RecommendedToolDto | null;

  @ApiProperty({ 
    description: 'Liste des alternatives recommandées',
    type: [RecommendedToolDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedToolDto)
  alternatives: RecommendedToolDto[];

  @ApiProperty({ 
    description: 'Explication détaillée et contextualisée du choix',
    example: 'HubSpot AI est notre recommandation principale car il bénéficie d\'une excellente réputation utilisateur, il offre le meilleur rapport qualité/prix de notre sélection, il s\'intègre nativement avec Shopify.'
  })
  @IsString()
  reasoning: string;

  @ApiProperty({ 
    description: 'Plan d\'action étape par étape',
    example: '🎯 **Action immédiate** : Testez HubSpot AI avec leur version gratuite\n🔗 **Étape 2** : Configurez l\'intégration avec Shopify\n📚 **Étape 3** : Suivez leur guide de démarrage rapide (15-30 min)'
  })
  @IsString()
  actionSuggestion: string;

  @ApiProperty({ 
    description: 'Questions de suivi intelligentes et contextualisées',
    example: [
      'Comment HubSpot AI s\'intègre-t-il concrètement avec Shopify ?',
      'HubSpot AI est-il adapté pour une startup comme la mienne ?',
      'Quelles sont les limites actuelles de HubSpot AI ?',
      'Quel budget mensuel prévoir pour HubSpot AI dans mon cas ?'
    ],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  followUpQuestions: string[];

  @ApiProperty({ 
    description: 'Timestamp de génération de la réponse',
    example: '2024-01-15T14:30:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ 
    description: 'Informations détaillées sur les sources de données',
    type: ResponseSourcesDto
  })
  @ValidateNested()
  @Type(() => ResponseSourcesDto)
  @IsObject()
  sources: ResponseSourcesDto;

  // Nouvelles propriétés enrichies
  @ApiProperty({ 
    description: 'Métriques de performance de la recherche',
    type: SearchPerformanceDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchPerformanceDto)
  performance?: SearchPerformanceDto;

  @ApiProperty({ 
    description: 'Recommandations contextuelles supplémentaires',
    type: [ContextualRecommendationDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContextualRecommendationDto)
  contextualRecommendations?: ContextualRecommendationDto[];

  @ApiProperty({ 
    description: 'Niveau de confiance global de la réponse (0-100)',
    example: 85,
    required: false
  })
  @IsOptional()
  @IsNumber()
  confidenceLevel?: number;

  @ApiProperty({ 
    description: 'Suggestions d\'amélioration de la recherche',
    example: [
      'Précisez votre budget pour des recommandations plus ciblées',
      'Mentionnez vos outils actuels pour de meilleures suggestions d\'intégration'
    ],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchImprovementSuggestions?: string[];

  @ApiProperty({ 
    description: 'Tags de classification de la réponse',
    example: ['marketing', 'e-commerce', 'beginner-friendly', 'integration-focused'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseTags?: string[];

  @ApiProperty({ 
    description: 'Liens vers des ressources complémentaires',
    example: {
      tutorialVideos: ['https://youtube.com/watch?v=123'],
      blogArticles: ['https://blog.winksia.com/hubspot-ai-guide'],
      comparisons: ['https://winksia.com/compare/hubspot-vs-mailchimp'],
      documentation: ['https://docs.hubspot.com/ai-features']
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  additionalResources?: {
    tutorialVideos?: string[];
    blogArticles?: string[];
    comparisons?: string[];
    documentation?: string[];
  };
}