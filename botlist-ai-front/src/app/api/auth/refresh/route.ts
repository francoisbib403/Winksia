import { NextRequest, NextResponse } from 'next/server';
import { refresh } from '@/lib/services/auth/auth.service';
import { getRefreshToken, setRefreshCookie } from '@/lib/services/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le refresh token depuis les cookies
    const refreshToken = getRefreshToken(request.cookies);
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token manquant' },
        { status: 401 }
      );
    }
    
    console.log('🔄 [API] Token refresh attempt');
    
    const result = await refresh(refreshToken);
    
    console.log('✅ [API] Token refresh successful');
    
    // Définir le nouveau cookie refresh_token
    const response = setRefreshCookie(result.refreshToken);
    
    // Renvoyer la réponse avec les nouveaux tokens
    return NextResponse.json({
      accessToken: result.accessToken,
      user: result.user,
    }, {
      status: 200,
      headers: response.headers,
    });
    
  } catch (error: any) {
    console.error('❌ [API] Token refresh error:', error.message);
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors du refresh du token' },
      { status: 401 }
    );
  }
}
