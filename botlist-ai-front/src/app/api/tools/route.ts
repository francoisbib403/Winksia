import { NextRequest, NextResponse } from 'next/server';
import { getTools, countTools } from '@/lib/services/tools.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log('📦 [API] GET /api/tools - Listing all tools');
    
    // Extract query parameters for filtering
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('category_id') || undefined;
    const pricingModel = searchParams.get('pricing_model') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    
    const [tools, total] = await Promise.all([
      getTools({
        search,
        categoryId,
        pricingModel,
        featured,
        limit,
        offset,
      }),
      countTools({ search, categoryId, pricingModel, featured }),
    ]);
    
    // Retourner directement le tableau pour compatibilité avec le frontend
    return NextResponse.json(tools);
    
  } catch (error: any) {
    console.error('❌ [API] GET /api/tools error:', error.message);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des outils' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('➕ [API] POST /api/tools - Creating tool');
    
    // TODO: Implémenter avec auth guard et création via Supabase
    return NextResponse.json({
      message: 'Route en cours d\'implémentation',
    }, { status: 501 });
    
  } catch (error: any) {
    console.error('❌ [API] POST /api/tools error:', error.message);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'outil' },
      { status: 500 }
    );
  }
}
