import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/services/auth/auth.service';
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
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }
    
    // Validation du mot de passe (minimum 6 caractères)
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }
    
    console.log('📝 [API] Registration attempt for email:', body.email);
    
    const result = await register({
      email: body.email,
      password: body.password,
      firstname: body.firstname,
      lastname: body.lastname,
    });
    
    console.log('✅ [API] Registration successful for email:', body.email);
    
    // Définir le cookie refresh_token
    const response = setRefreshCookie(result.refreshToken);
    
    // Renvoyer la réponse avec les tokens
    return NextResponse.json({
      accessToken: result.accessToken,
      user: result.user,
    }, {
      status: 201,
      headers: response.headers,
    });
    
  } catch (error: any) {
    console.error('❌ [API] Registration error:', error.message);
    
    if (error.message === 'Email already used') {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
