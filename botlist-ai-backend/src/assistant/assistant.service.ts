import { Injectable, Logger } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Tools } from '../tools/entities/tools.entity';
import { Category } from '../categories/entities/category.entity';
import { AssistantRequestDto } from './dto/assistant-request.dto';
import { AssistantResponseDto, RecommendedToolDto } from './dto/assistant-response.dto';
import { PricingModel, ToolStatus } from '../tools/tools.enums';
import { OpenAIService } from './openai.service';

interface UserIntent {
  keywords: string[];
  categories: string[];
  features: string[];
  useCases: string[];
  pricingPreference?: PricingModel;
  businessSize?: 'startup' | 'sme' | 'enterprise';
  priority: 'price' | 'features' | 'ease_of_use' | 'performance' | 'integration';
  isGeneralQuestion: boolean; // Nouvelle propriété
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly supabaseHelper: SupabaseHelper,
    private readonly openAIService: OpenAIService,
  ) {}

  async processQuestion(request: AssistantRequestDto): Promise<AssistantResponseDto> {
    const { question, filters, context } = request;

    try {
      console.log('🚀 DÉBUT TRAITEMENT QUESTION:', question);
      
      // 1. Analyser la question et extraire les intentions
      const analysis = await this.analyzeUserIntent(question);
      
      // Log pour debug
      console.log('🔧 OpenAI configuré:', this.openAIService.isConfigured());
      console.log('❓ Question générale détectée:', analysis.isGeneralQuestion);
      
      // 2. Si c'est une question générale, utiliser OpenAI directement
      if (analysis.isGeneralQuestion && this.openAIService.isConfigured()) {
        console.log('✅ Passage par handleGeneralQuestion avec OpenAI');
        return this.handleGeneralQuestion(question, context, analysis);
      } else {
        console.log('❌ Pas de passage par OpenAI - Raisons:');
        console.log('   - Question générale:', analysis.isGeneralQuestion);
        console.log('   - OpenAI configuré:', this.openAIService.isConfigured());
      }
      
      // 3. Récupérer les données pertinentes de la base de données
      const [tools, categories] = await Promise.all([
        this.getRelevantTools(analysis, filters),
        this.getAllCategories()
      ]);

      console.log('🔍 Outils trouvés:', tools.length);

      // 4. Si aucun outil trouvé, utiliser OpenAI pour donner des conseils généraux
      if (tools.length === 0 && this.openAIService.isConfigured()) {
        console.log('🤖 Aucun outil trouvé, passage par handleNoToolsFoundWithAI');
        return this.handleNoToolsFoundWithAI(question, context, analysis);
      } else if (tools.length === 0) {
        console.log('📝 Aucun outil trouvé, réponse standard (pas d\'OpenAI)');
      }

      // 5. Sélectionner les meilleures recommandations
      const recommendations = this.selectBestTools(tools, analysis);

      // 6. Construire la réponse avec ou sans amélioration IA
      const response = await this.buildResponse(
        question,
        analysis,
        recommendations,
        categories,
        tools
      );

      console.log('✅ FIN TRAITEMENT QUESTION');
      return response;

    } catch (error) {
      this.logger.error(`Erreur lors du traitement de la question: ${error.message}`);
      return this.buildErrorResponse(question, error.message);
    }
  }

  private async handleGeneralQuestion(
    question: string, 
    context: any[] | undefined, 
    analysis: UserIntent
  ): Promise<AssistantResponseDto> {
    try {
      const contextMessages = context?.map(msg => msg.content) || [];
      const aiResponse = await this.openAIService.generateResponse(
        question, 
        contextMessages
      );

      return {
        response: aiResponse,
        reformulatedQuestion: question,
        primaryRecommendation: null,
        alternatives: [],
        reasoning: "Réponse générée par IA pour question générale",
        actionSuggestion: "N'hésitez pas à poser des questions plus spécifiques sur les outils IA !",
        followUpQuestions: [
          "Quels types d'outils IA cherchez-vous ?",
          "Dans quel domaine voulez-vous utiliser l'IA ?",
          "Avez-vous un budget spécifique pour ces outils ?"
        ],
        timestamp: new Date(),
        sources: {
          internal: false,
          apis: [],
          external: ['OpenAI GPT-3.5']
        }
      };
    } catch (error) {
      this.logger.error('Erreur OpenAI:', error);
      // Fallback sur la logique normale si OpenAI échoue
      return this.buildNoResultsResponse(question, analysis);
    }
  }

  private async handleNoToolsFoundWithAI(
    question: string,
    context: any[] | undefined,
    analysis: UserIntent
  ): Promise<AssistantResponseDto> {
    try {
      // Récupérer quelques outils populaires pour donner du contexte à l'IA
      const popularTools = await this.supabaseHelper.query(
        'tools',
        (query: any) => query
          .select('*')
          .eq('status', ToolStatus.PUBLISHED)
          .order('overall_rating', { ascending: false })
          .limit(10)
      );

      const contextMessages = context?.map(msg => msg.content) || [];
      const aiResponse = await this.openAIService.generateToolRecommendationResponse(
        question,
        popularTools,
        contextMessages
      );

      return {
        response: aiResponse,
        reformulatedQuestion: question,
        primaryRecommendation: null,
        alternatives: [],
        reasoning: "Aucun outil spécifique trouvé, conseils générés par IA",
        actionSuggestion: "Explorez notre catalogue d'outils ou précisez vos besoins",
        followUpQuestions: [
          "Pouvez-vous préciser votre secteur d'activité ?",
          "Quel est votre budget approximatif ?",
          "Préférez-vous des solutions cloud ou sur site ?"
        ],
        timestamp: new Date(),
        sources: {
          internal: true,
          apis: ['/tools'],
          external: ['OpenAI GPT-3.5']
        }
      };
    } catch (error) {
      this.logger.error('Erreur OpenAI pour outils non trouvés:', error);
      return this.buildNoResultsResponse(question, analysis);
    }
  }

  private async analyzeUserIntent(question: string): Promise<UserIntent> {
    const questionLower = question.toLowerCase().trim();
    
    // Détecter les questions générales sur l'IA
    const generalAIKeywords = [
      'qu\'est-ce que l\'ia', 'what is ai', 'intelligence artificielle',
      'comment fonctionne', 'expliquer', 'définition', 'principe',
      'avantages de l\'ia', 'inconvénients', 'risques', 'éthique',
      'futur de l\'ia', 'tendances', 'évolution', 'impact'
    ];

    // Détecter les salutations et questions très générales
    const greetingsAndGeneral = [
      'salut', 'hello', 'bonjour', 'bonsoir', 'hi', 'hey',
      'comment ça va', 'comment allez-vous', 'ça va',
      'aide-moi', 'help', 'peux-tu m\'aider', 'pouvez-vous m\'aider',
      'qu\'est-ce que tu peux faire', 'que fais-tu', 'qui es-tu'
    ];

    const isGeneralQuestion = 
      // Mots-clés explicites sur l'IA
      generalAIKeywords.some(keyword => questionLower.includes(keyword)) ||
      
      // Salutations et questions générales
      greetingsAndGeneral.some(greeting => questionLower.includes(greeting)) ||
      
      // Questions très courtes (moins de 3 mots)
      questionLower.split(' ').length <= 2 ||
      
      // Questions qui ne mentionnent pas d'outils spécifiques
      (
        !questionLower.includes('outil') && 
        !questionLower.includes('solution') && 
        !questionLower.includes('plateforme') &&
        !questionLower.includes('logiciel') &&
        !questionLower.includes('app') &&
        !questionLower.includes('software') &&
        (questionLower.includes('comment') || questionLower.includes('pourquoi') || 
         questionLower.includes('qu\'est') || questionLower.includes('what') ||
         questionLower.includes('expliquer') || questionLower.includes('définir'))
      );
    
    // Mots-clés pour différents domaines
    const categoryKeywords = {
      marketing: ['marketing', 'publicité', 'campagne', 'réseaux sociaux', 'seo', 'content', 'email'],
      design: ['design', 'graphique', 'logo', 'créatif', 'visuel', 'image', 'photo','vidéo'],
      analytics: ['analyse', 'données', 'statistiques', 'reporting', 'dashboard', 'kpi'],
      customer_service: ['service client', 'support', 'chatbot', 'helpdesk', 'ticket'],
      finance: ['finance', 'comptabilité', 'facture', 'budget', 'investissement'],
      hr: ['ressources humaines', 'recrutement', 'rh', 'talent', 'paie'],
      sales: ['vente', 'commercial', 'crm', 'lead', 'prospect'],
      productivity: ['productivité', 'organisation', 'gestion', 'projet', 'task'],
      development: ['développement', 'code', 'programmation', 'api', 'software'],
      content: ['contenu', 'rédaction', 'blog', 'article', 'copywriting']
    };

    // Mots-clés pour les préférences de prix
    const pricingKeywords = {
      [PricingModel.FREE]: ['gratuit', 'free', 'sans coût'],
      [PricingModel.FREEMIUM]: ['freemium', 'essai gratuit', 'version gratuite'],
      [PricingModel.PAID]: ['payant', 'abonnement', 'mensuel'],
      [PricingModel.ENTERPRISE]: ['entreprise', 'grande entreprise', 'corporate'],
      [PricingModel.API_BASED]: ['api', 'usage', 'pay per use']
    };

    // Mots-clés pour la taille d'entreprise
    const businessSizeKeywords = {
      startup: ['startup', 'jeune entreprise', 'nouvelle entreprise'],
      sme: ['pme', 'petite entreprise', 'moyenne entreprise'],
      enterprise: ['grande entreprise', 'corporation', 'multinational']
    };

    const analysis: UserIntent = {
      keywords: questionLower.split(' ').filter(word => word.length > 2),
      categories: [],
      features: [],
      useCases: [],
      priority: 'features',
      isGeneralQuestion
    };

    // Log pour debug
    console.log(`Question: "${question}" -> isGeneralQuestion: ${isGeneralQuestion}`);

    // Détecter les catégories
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        analysis.categories.push(category);
      }
    }

    // Détecter les préférences de prix
    for (const [pricing, keywords] of Object.entries(pricingKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        analysis.pricingPreference = pricing as PricingModel;
        break;
      }
    }

    // Détecter la taille d'entreprise
    for (const [size, keywords] of Object.entries(businessSizeKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        analysis.businessSize = size as any;
        break;
      }
    }

    // Détecter la priorité
    if (questionLower.includes('pas cher') || questionLower.includes('économique') || questionLower.includes('budget')) {
      analysis.priority = 'price';
    } else if (questionLower.includes('facile') || questionLower.includes('simple') || questionLower.includes('intuitif')) {
      analysis.priority = 'ease_of_use';
    } else if (questionLower.includes('performance') || questionLower.includes('rapide') || questionLower.includes('efficace')) {
      analysis.priority = 'performance';
    } else if (questionLower.includes('intégration') || questionLower.includes('connecter') || questionLower.includes('synchroniser')) {
      analysis.priority = 'integration';
    }

    return analysis;
  }

  // ... (reste des méthodes inchangées)
  private async getRelevantTools(analysis: UserIntent, filters?: any): Promise<Tools[]> {
    let query: any = this.supabaseHelper.getAdminClient()
      .from('tools')
      .select('*')
      .eq('status', ToolStatus.PUBLISHED);

    // Filtres basés sur l'analyse
    if (analysis.categories.length > 0) {
      // This would need to be adapted based on your actual schema
      // For now, we'll use a simple approach
      query = query.or(analysis.categories.map(cat => `category.ilike.%${cat}%`).join(','));
    }

    if (analysis.pricingPreference) {
      query = query.eq('pricing_model', analysis.pricingPreference);
    }

    // Filtres additionnels
    if (filters) {
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.subcategory_id) {
        query = query.eq('subcategory_id', filters.subcategory_id);
      }
      if (filters.pricing_model) {
        query = query.eq('pricing_model', filters.pricing_model);
      }
      if (filters.api_available !== undefined) {
        query = query.eq('api_available', filters.api_available);
      }
      if (filters.open_source !== undefined) {
        query = query.eq('open_source', filters.open_source);
      }
      if (filters.min_rating) {
        query = query.gte('overall_rating', filters.min_rating);
      }
    }

    // Recherche par mots-clés dans le nom, description, features, use_cases
    if (analysis.keywords.length > 0) {
      const keywordConditions = analysis.keywords.map(keyword => 
        `name.ilike.%${keyword}%,description.ilike.%${keyword}%,tagline.ilike.%${keyword}%`
      ).join(',');
      
      query = query.or(keywordConditions);
    }

    // Tri basé sur la priorité
    switch (analysis.priority) {
      case 'price':
        query = query.order('value_for_money_score', { ascending: false });
        break;
      case 'ease_of_use':
        query = query.order('ease_of_use_score', { ascending: false });
        break;
      case 'performance':
        query = query.order('performance_score', { ascending: false });
        break;
      default:
        query = query.order('overall_rating', { ascending: false });
    }

    query = query.order('overall_rating', { ascending: false }).limit(20);

    const { data, error } = await query;
    
    if (error) {
      this.logger.error('Error fetching tools:', error);
      return [];
    }

    return data as Tools[];
  }

  private async getAllCategories(): Promise<Category[]> {
    const categories = await this.supabaseHelper.findAll('categories', {
      orderBy: 'sort_order',
      ascending: true,
    });
    
    // Filter for active categories
    return categories.filter((cat: any) => cat.is_active) as Category[];
  }

  private selectBestTools(tools: Tools[], analysis: UserIntent): { primary: Tools | null; alternatives: Tools[] } {
    if (tools.length === 0) {
      return { primary: null, alternatives: [] };
    }

    // Le premier outil est le principal (meilleur score selon les critères)
    const primary = tools[0];
    
    // Les alternatives sont les 2-3 suivants
    const alternatives = tools.slice(1, 4);

    return { primary, alternatives };
  }

  private async buildResponse(
    originalQuestion: string,
    analysis: UserIntent,
    recommendations: { primary: Tools | null; alternatives: Tools[] },
    categories: Category[],
    allTools: Tools[] = []
  ): Promise<AssistantResponseDto> {
    
    const { primary, alternatives } = recommendations;

    if (!primary) {
      return this.buildNoResultsResponse(originalQuestion, analysis);
    }

    // Reformuler la question
    const reformulatedQuestion = this.reformulateQuestion(originalQuestion, analysis);

    // Construire la réponse principale
    const primaryTool = this.formatToolRecommendation(primary);
    const alternativeTools = alternatives.map(tool => this.formatToolRecommendation(tool));

    // Explication du choix (potentiellement améliorée par IA)
    let reasoning = this.buildReasoning(primary, analysis);
    
    // Si OpenAI est configuré, améliorer le raisonnement
    if (this.openAIService.isConfigured() && allTools.length > 1) {
      try {
        const enhancedReasoning = await this.openAIService.generateResponse(
          `Pourquoi recommander ${primary.name} pour "${originalQuestion}" parmi ces outils: ${allTools.slice(0, 5).map(t => t.name).join(', ')} ?`,
          [],
          `Tu es un expert en outils IA. Explique brièvement (50 mots max) pourquoi cet outil est le meilleur choix. Sois factuel et précis.`
        );
        reasoning = enhancedReasoning;
      } catch (error) {
        this.logger.warn('Impossible d\'améliorer le raisonnement avec IA:', error.message);
      }
    }

    // Suggestion d'action
    const actionSuggestion = this.buildActionSuggestion(primary);

    // Questions de suivi
    const followUpQuestions = this.generateFollowUpQuestions(primary, analysis);

    // Réponse formatée
    const response = this.formatResponse(
      reformulatedQuestion,
      primaryTool,
      alternativeTools,
      reasoning,
      actionSuggestion
    );

    return {
      response,
      reformulatedQuestion,
      primaryRecommendation: primaryTool,
      alternatives: alternativeTools,
      reasoning,
      actionSuggestion,
      followUpQuestions,
      timestamp: new Date(),
      sources: {
        internal: true,
        apis: ['/tools', '/categories'],
        external: this.openAIService.isConfigured() ? ['OpenAI GPT-3.5'] : []
      }
    };
  }

  private formatToolRecommendation(tool: Tools): RecommendedToolDto {
    return {
      id: tool.id,
      name: tool.name,
      price: this.formatPrice(tool.pricing_model, tool.pricing_details),
      strengths: this.extractStrengths(tool),
      url: tool.website_url,
      rating: tool.overall_rating
      // logo retiré temporairement
    };
  }

  private formatPrice(pricingModel: PricingModel, pricingDetails?: any): string {
    switch (pricingModel) {
      case PricingModel.FREE:
        return 'Gratuit';
      case PricingModel.FREEMIUM:
        return 'Freemium (gratuit avec options payantes)';
      case PricingModel.PAID:
        return pricingDetails?.starting_price ? 
          `À partir de ${pricingDetails.starting_price}` : 
          'Payant';
      case PricingModel.ENTERPRISE:
        return 'Sur devis (Enterprise)';
      case PricingModel.API_BASED:
        return 'Facturation à l\'usage (API)';
      default:
        return 'Prix non spécifié';
    }
  }

  private extractStrengths(tool: Tools): string[] {
    const strengths: string[] = [];
    
    if (tool.overall_rating >= 4.5) strengths.push('Très bien noté');
    if (tool.ease_of_use_score >= 4.5) strengths.push('Facile à utiliser');
    if (tool.performance_score >= 4.5) strengths.push('Haute performance');
    if (tool.value_for_money_score >= 4.5) strengths.push('Excellent rapport qualité/prix');
    if (tool.api_available) strengths.push('API disponible');
    if (tool.open_source) strengths.push('Open source');
    if (tool.gdpr_compliant) strengths.push('Conforme RGPD');
    if (tool.integrations && tool.integrations.length > 0) {
      strengths.push(`${tool.integrations.length} intégrations`);
    }

    return strengths.slice(0, 4); // Limiter à 4 points forts
  }

  private reformulateQuestion(question: string, analysis: UserIntent): string {
    if (analysis.categories.length > 0) {
      const category = analysis.categories[0];
      return `Recherche d'outils IA pour ${category}`;
    }
    return question;
  }

  private buildReasoning(tool: Tools, analysis: UserIntent): string {
    let reasoning = `${tool.name} est recommandé car `;
    const reasons: string[] = [];

    if (tool.overall_rating >= 4.5) {
      reasons.push('il est très bien noté par les utilisateurs');
    }

    switch (analysis.priority) {
      case 'price':
        if (tool.value_for_money_score >= 4.0) {
          reasons.push('il offre un excellent rapport qualité/prix');
        }
        break;
      case 'ease_of_use':
        if (tool.ease_of_use_score >= 4.0) {
          reasons.push('il est particulièrement facile à utiliser');
        }
        break;
      case 'performance':
        if (tool.performance_score >= 4.0) {
          reasons.push('il affiche de très bonnes performances');
        }
        break;
    }

    if (tool.features && tool.features.length > 0) {
      reasons.push(`il propose ${tool.features.length} fonctionnalités avancées`);
    }

    if (reasons.length === 0) {
      reasons.push('il correspond à vos critères de recherche');
    }

    return reasoning + reasons.join(', ') + '.';
  }

  private buildActionSuggestion(tool: Tools): string {
    if (tool.pricing_model === PricingModel.FREE || tool.pricing_model === PricingModel.FREEMIUM) {
      return `Essayez ${tool.name} gratuitement dès maintenant.`;
    }
    return `Visitez le site de ${tool.name} pour en savoir plus et demander une démonstration.`;
  }

  private generateFollowUpQuestions(tool: Tools, analysis: UserIntent): string[] {
    const questions: string[] = [];
   if (tool.category && tool.category.length > 0) {
  const categoryNames = tool.category.map(cat => cat.name).join(', ');
  questions.push(`Quels autres outils recommandez-vous pour ${categoryNames} ?`);
}
    if (tool.integrations && tool.integrations.length > 0) {
      questions.push(`${tool.name} s'intègre-t-il avec mes outils actuels ?`);
    }
    
    questions.push(`Quels sont les inconvénients de ${tool.name} ?`);
    questions.push('Pouvez-vous me montrer des alternatives moins chères ?');

    return questions.slice(0, 3);
  }

  private formatResponse(
    question: string,
    primaryTool: RecommendedToolDto,
    alternatives: RecommendedToolDto[],
    reasoning: string,
    actionSuggestion: string
  ): string {
    let response = `**${question}**\n\n`;
    
    response += `🎯 **Recommandation principale : ${primaryTool.name}**\n`;
    response += `💰 Prix : ${primaryTool.price}\n`;
    response += `⭐ Note : ${primaryTool.rating}/5\n`;
    response += `✨ Points forts : ${primaryTool.strengths.join(', ')}\n\n`;
    
    response += `**Pourquoi ce choix ?**\n${reasoning}\n\n`;
    
    if (alternatives.length > 0) {
      response += `**Alternatives intéressantes :**\n`;
      alternatives.forEach((alt, index) => {
        response += `${index + 1}. **${alt.name}** - ${alt.price} (${alt.rating}/5)\n`;
      });
      response += '\n';

      // Ajout OBLIGATOIRE d'un tableau comparatif quand il y a au moins 2 outils
      const toolsForTable: RecommendedToolDto[] = [primaryTool, ...alternatives];
      response += `**Tableau comparatif (obligatoire dès qu'il y a ≥ 2 outils)**\n`;
      response += this.buildComparisonTable(toolsForTable);
      response += '\n';
    }
    
    response += `**💡 Suggestion :** ${actionSuggestion}`;
    
    return response;
  }

  private buildComparisonTable(tools: RecommendedToolDto[]): string {
    // Colonnes: Outil | Valeur principale (points forts 1) | Note | Facilité (si présente dans strengths) | (Tarification) | URL
    // On reste conservateur avec les données disponibles
    const headers = ['Outil', 'Valeur principale', 'Note', 'Points forts (sélection)', '(Tarification)', 'URL'];
    const sep = headers.map(() => '---');
    const lines: string[] = [];
    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${sep.join(' | ')} |`);
    for (const t of tools) {
      const mainStrength = (t.strengths && t.strengths.length > 0) ? t.strengths[0] : '';
      const strengthsPreview = (t.strengths || []).slice(0, 3).join(', ');
      const url = t.url ? `[Lien](${t.url})` : '';
      lines.push(`| ${t.name} | ${mainStrength} | ${t.rating ?? ''} | ${strengthsPreview} | ${t.price} | ${url} |`);
    }
    return lines.join('\n');
  }

  private buildErrorResponse(question: string, error: string): AssistantResponseDto {
    return {
      response: "Désolé, je rencontre une difficulté technique pour traiter votre demande. Pouvez-vous reformuler votre question ?",
      reformulatedQuestion: question,
      primaryRecommendation: null,
      alternatives: [],
      reasoning: "Erreur technique",
      actionSuggestion: "Veuillez réessayer avec une question plus précise",
      followUpQuestions: [
        "Quel type d'outil IA recherchez-vous ?",
        "Dans quel domaine souhaitez-vous utiliser l'IA ?",
        "Avez-vous un budget spécifique ?"
      ],
      timestamp: new Date(),
      sources: {
        internal: false,
        apis: [],
        external: []
      }
    };
  }

  private buildNoResultsResponse(question: string, analysis: UserIntent): AssistantResponseDto {
    return {
      response: "Je n'ai pas trouvé d'outils correspondant exactement à vos critères. Pouvez-vous préciser votre recherche ou élargir vos critères ?",
      reformulatedQuestion: question,
      primaryRecommendation: null,
      alternatives: [],
      reasoning: "Aucun outil ne correspond aux critères spécifiés",
      actionSuggestion: "Essayez de reformuler votre question ou d'élargir vos critères de recherche",
      followUpQuestions: [
        "Quels sont vos critères les plus importants ?",
        "Accepteriez-vous des outils payants ?",
        "Dans quelle catégorie cherchez-vous ?"
      ],
      timestamp: new Date(),
      sources: {
        internal: true,
        apis: ['/tools', '/categories'],
        external: []
      }
    };
  }
}
