import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { AssistantRequestDto } from './dto/assistant-request.dto';
import { AssistantResponseDto } from './dto/assistant-response.dto';
import { Public } from '../auth/jwt-auth.guard'; // Import depuis votre guard

@ApiTags('Assistant IA')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Public() // ← Marque cette route comme publique
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Poser une question à l\'assistant IA Winksia',
    description: 'L\'assistant analyse votre question et recommande les meilleurs outils IA selon vos besoins'
  })
  @ApiBody({
    type: AssistantRequestDto,
    examples: {
      marketing: {
        summary: 'Question marketing',
        value: {
          question: "Quel est le meilleur outil IA pour le marketing digital ?",
          filters: {
            pricing_model: "freemium",
            min_rating: 4.0
          }
        }
      },
      analytics: {
        summary: 'Question analyse de données',
        value: {
          question: "Je cherche un outil d'analyse de données économique pour ma PME",
          filters: {
            price_range: {
              max: 100
            }
          }
        }
      },
      general: {
        summary: 'Question générale',
        value: {
          question: "Quels outils IA recommandez-vous pour automatiser mon service client ?",
          context: [
            {
              role: "user",
              content: "J'ai une petite entreprise de e-commerce",
              timestamp: "2024-01-15T10:00:00Z"
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Réponse de l\'assistant avec recommandations',
    type: AssistantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données de requête invalides',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur interne du serveur',
  })
  async askQuestion(
    @Body() request: AssistantRequestDto,
  ): Promise<AssistantResponseDto> {
    return this.assistantService.processQuestion(request);
  }

  @Public() // ← Marque cette route comme publique aussi
  @Post('suggestions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir des suggestions de questions',
    description: 'Retourne une liste de questions suggérées pour aider l\'utilisateur'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des questions suggérées',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              question: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getSuggestions() {
    return {
      suggestions: [
        {
          category: 'Marketing',
          question: 'Quels outils IA sont les meilleurs pour le service client ?',
          description: 'Découvrez les solutions d\'IA conversationnelle et de support automatisé'
        },
        {
          category: 'Analyse',
          question: 'Montrez-moi des solutions économiques pour PME',
          description: 'Trouvez des outils d\'analyse de données adaptés aux petites entreprises'
        },
        {
          category: 'Productivité',
          question: 'Quels outils s\'intègrent bien avec Microsoft 365 ?',
          description: 'Optimisez votre workflow avec des outils compatibles Office'
        },
        {
          category: 'Design',
          question: 'Quelles sont les meilleures plateformes d\'IA créative ?',
          description: 'Explorez les outils de génération d\'images et de design automatisé'
        },
        {
          category: 'Développement',
          question: 'Quels sont les meilleurs outils de code IA pour développeurs ?',
          description: 'Accélérez votre développement avec l\'IA assistée'
        },
        {
          category: 'Finance',
          question: 'Existe-t-il des outils IA pour la gestion financière ?',
          description: 'Automatisez votre comptabilité et analyse financière'
        }
      ]
    };
  }
}