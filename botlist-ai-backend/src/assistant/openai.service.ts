import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey: string | undefined; // Changé ici
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    console.log('🔑 OPENAI_API_KEY trouvée:', !!this.apiKey);
    console.log('🔑 Longueur clé:', this.apiKey?.length || 0);
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY non configurée - les réponses IA générales ne seront pas disponibles');
    }
  }

  async generateResponse(
    question: string,
    context: string[] = [],
    systemPrompt?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: systemPrompt || this.getDefaultSystemPrompt()
        },
        // Ajouter le contexte de conversation si disponible
        ...context.map(msg => ({
          role: 'user' as const,
          content: msg
        })),
        {
          role: 'user',
          content: question
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 300,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Erreur OpenAI API: ${response.status} - ${errorData}`);
        throw new Error(`Erreur OpenAI: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Aucune réponse générée par OpenAI');
      }

      return data.choices[0].message.content.trim();

    } catch (error) {
      this.logger.error('Erreur lors de l\'appel à OpenAI:', error);
      throw error;
    }
  }

  async generateToolRecommendationResponse(
    question: string,
    availableTools: any[],
    context: string[] = []
  ): Promise<string> {
    const toolsContext = availableTools.length > 0 
      ? `Outils disponibles dans notre base de données :\n${availableTools.map(tool => 
          `- ${tool.name}: ${tool.description} (Prix: ${tool.pricing_model})`
        ).join('\n')}\n\n`
      : '';

    const systemPrompt = `Tu es l'assistant IA de Winksia, un comparateur d'outils IA.

${toolsContext}Tes responsabilités :
1. Si la question concerne des outils IA spécifiques et que nous avons des outils correspondants, recommande-les
2. Si nous n'avons pas d'outils correspondants, donne des conseils généraux et suggère des types d'outils à chercher
3. Pour les questions générales sur l'IA, réponds de manière informative et utile
4. Reste toujours dans le contexte des outils IA et de l'aide aux entreprises
5. Sois concis mais informatif (maximum 300 mots)
6. Termine toujours par une suggestion d'action concrète

Format de réponse souhaité :
- Réponse claire et directe
- Points forts/avantages si applicable
- Suggestion d'action finale

Ton ton : Professionnel, utile, et orienté solutions.`;

    return this.generateResponse(question, context, systemPrompt);
  }

  private getDefaultSystemPrompt(): string {
    return `Tu es l'assistant IA de Winksia, un comparateur d'outils IA pour les entreprises.

Tes responsabilités :
- Aider les utilisateurs à comprendre les outils IA
- Donner des conseils sur l'adoption de l'IA en entreprise
- Répondre aux questions générales sur l'intelligence artificielle
- Orienter vers des solutions pratiques

Reste toujours professionnel, utile et concis (maximum 300 mots).
Termine par une suggestion d'action quand c'est pertinent.`;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}