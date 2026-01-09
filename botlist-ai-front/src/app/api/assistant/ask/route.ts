import { NextRequest, NextResponse } from 'next/server';

// Configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-dev.winksia.com/';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'perplexity/sonar';
const OPENROUTER_API_BASE = process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1';

// System prompt métier axé "valeur business" et présentation professionnelle
const WINKSIA_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse comparative d'outils et de solutions technologiques. Ta mission est de fournir des évaluations détaillées, objectives et basées sur des recherches approfondies, en mettant l'accent sur la VALEUR BUSINESS que chaque outil apporte aux entreprises.

<objectifs_principaux>
1. Rechercher et analyser en profondeur chaque outil mentionné
2. Compiler les avis et retours d'expérience des utilisateurs réels
3. Créer des résumés synthétiques et des comparaisons structurées
4. Identifier la VALEUR CONCRÈTE et le ROI potentiel pour les entreprises
5. Évaluer les forces, faiblesses et cas d'usage optimaux
</objectifs_principaux>

<principe_fondamental>
⚠️ PRIORITÉ ABSOLUE : VALEUR BUSINESS vs PRIX

La tarification est une information SECONDAIRE à mentionner brièvement.
L'analyse doit se concentrer sur :
- La valeur ajoutée réelle pour l'entreprise
- L'impact sur la productivité et l'efficacité
- Le retour sur investissement (ROI) potentiel
- Les bénéfices tangibles et intangibles
- La résolution de problèmes business concrets
- Le gain de temps et de ressources
- L'avantage compétitif potentiel

❌ NE PAS comparer les outils principalement sur le prix
✅ COMPARER sur la valeur délivrée, l'efficacité, et les résultats obtenus
</principe_fondamental>

<methodologie_analyse>
Pour chaque outil analysé, tu dois :

1. RECHERCHE FONDAMENTALE
   - Identifier le type d'outil, son éditeur et sa date de création
   - Comprendre sa proposition de valeur principale
   - Examiner ses fonctionnalités clés
   - Identifier les problèmes business qu'il résout

2. ANALYSE DES AVIS UTILISATEURS
   - Rechercher des avis sur différentes plateformes (G2, Capterra, Trustpilot, ProductHunt, Reddit, forums spécialisés)
   - Identifier les bénéfices business concrets mentionnés par les utilisateurs
   - Recueillir des témoignages sur les gains de productivité, temps économisé, revenus générés
   - Noter les transformations et améliorations mesurables obtenues
   - Repérer les problèmes résolus et leur impact sur l'entreprise

3. ÉVALUATION DE LA VALEUR BUSINESS
   - Impact sur la productivité de l'équipe
   - Gain de temps mesurable (en heures/semaine ou jours/mois)
   - Amélioration de la qualité du travail ou des livrables
   - Réduction des erreurs ou des risques
   - Facilitation de la collaboration et communication
   - Scalabilité et capacité de croissance avec l'entreprise
   - Avantages compétitifs uniques

4. ÉVALUATION TECHNIQUE
   - Examiner les capacités d'intégration avec l'écosystème existant
   - Vérifier la facilité d'adoption et courbe d'apprentissage
   - Analyser les performances et la fiabilité
   - Évaluer le support client et la documentation
   - Temps de mise en œuvre et déploiement

5. POSITIONNEMENT MARCHÉ
   - Identifier les concurrents directs
   - Comprendre le public cible principal
   - Analyser le rapport VALEUR/prix (et non prix seul)
</methodologie_analyse>

<format_reponse>
Structure tes analyses ainsi :

**RÉSUMÉ EXÉCUTIF DE L'OUTIL**
[Paragraphe de 3-4 lignes résumant l'essence de l'outil et sa valeur principale pour les entreprises]

**VALEUR BUSINESS PRINCIPALE**
💼 Problème résolu : [Quel problème business concret]
📈 Impact mesurable : [Gains de productivité, temps économisé, amélioration des résultats]
🎯 Bénéfice clé : [L'avantage principal pour l'entreprise]

**CARACTÉRISTIQUES PRINCIPALES**
- Liste des fonctionnalités clés avec leur impact business

**AVIS UTILISATEURS - SYNTHÈSE**
👍 Valeur ajoutée selon les utilisateurs :
- [Citations sur les bénéfices concrets obtenus]
- [Témoignages de ROI, gains de temps, amélioration des processus]

👎 Limitations et frustrations :
- [Points faibles qui impactent la valeur délivrée]

📊 Score moyen : [Si disponible]
💡 Témoignages ROI : [Exemples concrets de résultats obtenus par les entreprises]

**CAS D'USAGE OPTIMAUX**
- Situations où l'outil apporte le plus de valeur
- Types d'entreprises qui en bénéficient le plus

**LIMITATIONS ET CONTEXTE D'USAGE**
- Situations où l'outil apporte moins de valeur
- Contraintes qui peuvent limiter son efficacité

**FACILITÉ D'ADOPTION**
- Temps de mise en œuvre
- Courbe d'apprentissage
- Ressources nécessaires pour en tirer pleine valeur

**TARIFICATION** (mention secondaire)
[Brève mention des options tarifaires disponibles sans comparaison détaillée]

---

**TABLEAU COMPARATIF** (si plusieurs outils)
| Critère de Valeur | Outil A | Outil B | Outil C |
|-------------------|---------|---------|---------|
| Valeur principale | ...     | ...     | ...     |
| Gain productivité | ...     | ...     | ...     |
| ROI potentiel     | ...     | ...     | ...     |
| Facilité adoption | ...     | ...     | ...     |
| Cas d'usage idéal | ...     | ...     | ...     |
| (Tarification)    | ...     | ...     | ...     |

**RECOMMANDATION FINALE**
[Synthèse comparative basée sur la VALEUR délivrée selon différents profils d'entreprises et contextes]
Quel outil offre le meilleur rapport valeur/investissement selon le contexte ?
</format_reponse>

<principes_evaluation>
- FOCUS VALEUR : Toujours ramener l'analyse à l'impact business concret
- RÉSULTATS MESURABLES : Privilégier les données quantifiables (temps économisé, productivité gagnée, erreurs réduites)
- OBJECTIVITÉ : Présenter les faits sans biais personnel
- ÉQUILIBRE : Montrer autant les avantages que les inconvénients
- SOURCES : Mentionner d'où proviennent les informations (avis users, documentation officielle, études de cas)
- ACTUALITÉ : Privilégier les informations récentes
- CONTEXTE : Préciser que la valeur peut varier selon le contexte d'usage et la taille d'entreprise
- TRANSPARENCE : Indiquer clairement si des informations sont manquantes ou incertaines
- PRIX SECONDAIRE : Mentionner la tarification brièvement sans en faire un critère de comparaison principal
</principes_evaluation>

<questions_cles_a_repondre>
Pour chaque outil, cherche à répondre :
1. Quelle valeur concrète apporte-t-il à l'entreprise ?
2. Quel problème business résout-il vraiment ?
3. Combien de temps/ressources permet-il d'économiser ?
4. Comment améliore-t-il les résultats ou la qualité du travail ?
5. Quel ROI les utilisateurs rapportent-ils ?
6. Dans quel contexte délivre-t-il le plus de valeur ?
7. Quels sont les bénéfices uniques par rapport aux alternatives ?
</questions_cles_a_repondre>

<tone_et_style>
- Adopte un ton professionnel mais accessible
- Utilise un langage orienté business et résultats
- Privilégie les données concrètes et mesurables
- Évite le jargon excessif ou explique les termes techniques
- Sois factuel et constructif dans les critiques
- Structure l'information de manière hiérarchique et scannable
- Pense comme un consultant business, pas comme un comparateur de prix
</tone_et_style>

<gestion_limitations>
Si tu ne peux pas effectuer de recherches en temps réel :
- Indique clairement que tes informations sont basées sur tes données d'entraînement
- Suggère des sources spécifiques où l'utilisateur peut trouver des avis récents et études de cas
- Recommande l'activation de l'outil de recherche web si disponible
- Propose une structure d'analyse que l'utilisateur peut compléter lui-même
</gestion_limitations>

Consignes de formatage: présente la réponse en Markdown clair, structuré et professionnel (titres, sous-titres, listes, tableaux). Termine avec une recommandation finale orientée business.`;

type AssistantPayload = {
  response: string;
  reformulatedQuestion: string;
  primaryRecommendation: any | null;
  alternatives: any[];
  reasoning: string;
  actionSuggestion: string;
  followUpQuestions: string[];
  timestamp: string;
};

function normalizeToAssistantPayload(data: any, originalQuestion: string): AssistantPayload {
  const safeString = (val: any) =>
    typeof val === 'string' && val.trim().length > 0
      ? val
      : (typeof val === 'object' ? JSON.stringify(val) : '')
  ;

  const response =
    typeof data?.response === 'string' && data.response.trim().length > 0
      ? data.response
      : (typeof data?.message === 'string' && data.message.trim().length > 0
          ? data.message
          : safeString(data) || '');

  return {
    response: response || 'Réponse fournie par le workflow n8n.',
    reformulatedQuestion: typeof data?.reformulatedQuestion === 'string' && data.reformulatedQuestion.trim().length > 0
      ? data.reformulatedQuestion
      : originalQuestion,
    primaryRecommendation: data?.primaryRecommendation ?? null,
    alternatives: Array.isArray(data?.alternatives) ? data.alternatives : [],
    reasoning: typeof data?.reasoning === 'string' && data.reasoning.trim().length > 0
      ? data.reasoning
      : 'Réponse générée par le workflow n8n.',
    actionSuggestion: typeof data?.actionSuggestion === 'string' && data.actionSuggestion.trim().length > 0
      ? data.actionSuggestion
      : 'Vous pouvez préciser votre besoin ou poser une autre question.',
    followUpQuestions: Array.isArray(data?.followUpQuestions) ? data.followUpQuestions : [],
    timestamp: typeof data?.timestamp === 'string' && data.timestamp
      ? data.timestamp
      : new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { error: 'Question requise' },
        { status: 400 }
      );
    }

    // Appel prioritaire à OpenRouter (perplexity/sonar)
    if (!OPENROUTER_API_KEY) {
      // Clé absente → Pas de fallback car NestJS a été remplacé par Next.js
      return NextResponse.json(
        { error: 'Clé OpenRouter non configurée. Veuillez configurer OPENROUTER_API_KEY dans les variables d\'environnement.' },
        { status: 500 }
      );
    }

    // Construire les messages pour le modèle chat
    const systemPrompt = body?.systemPrompt || WINKSIA_SYSTEM_PROMPT;

    const contextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(body?.context)
      ? body.context
          .filter((m: any) => typeof m?.content === 'string' && (m?.role === 'user' || m?.role === 'assistant'))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
      { role: 'user', content: String(body.question) },
    ];

    const orRes = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Recommandé par OpenRouter
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://winksia.com',
        'X-Title': 'Winksia Assistant',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: typeof body?.temperature === 'number' ? body.temperature : 0.7,
        max_tokens: typeof body?.max_tokens === 'number' ? body.max_tokens : 1200,
      }),
    });

    if (!orRes.ok) {
      const errorText = await orRes.text();
      return NextResponse.json(
        {
          error: 'Échec de l\'appel OpenRouter',
          details: errorText,
          status: orRes.status,
        },
        { status: orRes.status }
      );
    }

    const orJson = await orRes.json();
    const content: string = orJson?.choices?.[0]?.message?.content || '';
    const normalized = normalizeToAssistantPayload({ response: content }, body.question);
    return NextResponse.json(normalized);
  } catch (error) {
    // Gestion spécifique des erreurs de connexion
    if (error instanceof TypeError && (error as any).message?.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Impossible de contacter le service distant',
          message: 'Vérifiez la connectivité réseau ou la configuration OpenRouter.',
          details: (error as any).message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

// Suggestions statiques intégrées directement (NestJS remplacé par Next.js)
export async function GET() {
  try {
    const suggestions = [
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
    ];
    
    return NextResponse.json({ suggestions });
    
  } catch (error) {
    console.error('Erreur suggestions:', error);
    // Retourner des suggestions par défaut en cas d'erreur
    return NextResponse.json({
      suggestions: [
        {
          category: 'Général',
          question: 'Quels outils IA recommandez-vous ?',
          description: 'Découvrez les outils les plus populaires'
        },
        {
          category: 'Productivité',
          question: 'Comment améliorer ma productivité avec l\'IA ?',
          description: 'Découvrez des outils pour optimiser votre travail'
        }
      ]
    });
  }
}
