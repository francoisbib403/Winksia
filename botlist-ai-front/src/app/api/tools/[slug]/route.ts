import { NextRequest, NextResponse } from 'next/server';

// Placeholder pour la récupération d'un outil par slug
// À implémenter avec la logique du backend NestJS

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log('📦 [API] GET /api/tools/', slug);
    
    // TODO: Implémenter avec tools.service.ts
    return NextResponse.json({
      tool: null,
      message: 'Route en cours d\'implémentation',
    });
    
  } catch (error: any) {
    console.error('❌ [API] GET /api/tools/[slug] error:', error.message);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'outil' },
      { status: 500 }
    );
  }
}
