import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/services/auth/auth.service';
import { setRefreshCookie } from '@/lib/services/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des champs requis
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }
    
    console.log('🔐 [API] Login attempt for email:', body.email);
    
    const result = await login({
      email: body.email,
      password: body.password,
    });
    
    console.log('✅ [API] Login successful for email:', body.email);
    
    // Définir le cookie refresh_token
    const response = setRefreshCookie(result.refreshToken);
    
    // Renvoyer la réponse avec les tokens
    return NextResponse.json({
      accessToken: result.accessToken,
      user: result.user,
    }, {
      status: 200,
      headers: response.headers,
    });
    
  } catch (error: any) {
    console.error('❌ [API] Login error:', error.message);
    
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Account not activated') {
      return NextResponse.json(
        { error: 'Compte non activé' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
