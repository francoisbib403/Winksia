import { NextRequest, NextResponse } from 'next/server';
import { findOneById, update, remove, toUserResponse } from '@/lib/services/user.service';
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

// GET /api/user/[id] - Récupérer un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('👤 [API] GET /api/user/', id);
    
    const user = await findOneById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: toUserResponse(user),
    });
    
  } catch (error: any) {
    console.error('❌ [API] GET /api/user/[id] error:', error.message);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/[id] - Modifier un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { user, error } = getAuthUser(request);
    
    if (error) {
      return error;
    }
    
    console.log('✏️ [API] PATCH /api/user/', id);
    
    const updatedUser = await update(id, {
      firstname: body.firstname,
      lastname: body.lastname,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      website: body.website,
      company: body.company,
      jobTitle: body.jobTitle,
      isPublicProfile: body.isPublicProfile,
      preferredLanguage: body.preferredLanguage,
      emailNotifications: body.emailNotifications,
      pushNotifications: body.pushNotifications,
      theme: body.theme,
    });
    
    return NextResponse.json({
      user: toUserResponse(updatedUser),
    });
    
  } catch (error: any) {
    console.error('❌ [API] PATCH /api/user/[id] error:', error.message);
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/[id] - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = getAuthUser(request);
    
    if (error) {
      return error;
    }
    
    console.log('🗑️ [API] DELETE /api/user/', id);
    
    await remove(id);
    
    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
    });
    
  } catch (error: any) {
    console.error('❌ [API] DELETE /api/user/[id] error:', error.message);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
