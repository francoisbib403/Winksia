// Outils pour les cookies HTTP-only
import { NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

export function setRefreshCookie(token: string): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = new NextResponse(JSON.stringify({ message: 'OK' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE / 1000, // Convertir en secondes
    path: '/',
  });
  
  return response;
}

export function clearRefreshCookie(): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = new NextResponse(JSON.stringify({ message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

export function getRefreshToken(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  const cookie = cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  return cookie?.value || null;
}

export function getAccessToken(headers: { get: (name: string) => string | null }): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}
