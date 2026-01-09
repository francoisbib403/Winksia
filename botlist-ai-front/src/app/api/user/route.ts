import { NextRequest, NextResponse } from 'next/server';
import { findAll, toUserResponse } from '@/lib/services/user.service';
import * as jwtService from '@/lib/services/auth/jwt';
import { TOKEN_ROLE, JwtPayload } from '@/types/auth';

// Middleware pour vérifier l'authentification
function getAuthUser(request: NextRequest): { user: any; error: NextResponse | null } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = jwtService.verifyAccessToken(token) as JwtPayload;
    
    if (payload.role !== TOKEN_ROLE.AUTH) {
      return { user: null, error: NextResponse.json({ error: 'Token invalide' }, { status: 401 }) };
    }
    
    return { user: payload, error: null };
  } catch {
    return { user: null, error: NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 }) };
  }
}

// GET /api/user - Lister tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    
    if (error) {
      return error;
    }
    
    // Vérifier que l'utilisateur est admin
    // Note: Vous pouvez ajouter une vérification de rôle ici
    
    console.log('📋 [API] GET /api/user - Listing all users');
    
    const users = await findAll();
    
    return NextResponse.json({
      users: users.map(u => toUserResponse(u)),
    });
    
  } catch (error: any) {
    console.error('❌ [API] GET /api/user error:', error.message);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
