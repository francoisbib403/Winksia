// Service JWT pour l'authentification
import jwt from 'jsonwebtoken';
import { JwtPayload, JwtRefreshPayload, TOKEN_ROLE } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-super-secret-refresh-key';
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP || '7d';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function signRefreshToken(payload: JwtRefreshPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXP });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtRefreshPayload;
}

export function decodeToken(token: string): JwtPayload | JwtRefreshPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JwtPayload | JwtRefreshPayload;
  } catch {
    return null;
  }
}

// Vérifier si le token est un token d'authentification valide
export function isValidAuthToken(payload: JwtPayload): boolean {
  return payload.role === TOKEN_ROLE.AUTH;
}

// Vérifier si le token est un token de refresh valide
export function isValidRefreshToken(payload: JwtRefreshPayload): boolean {
  return !!payload.email && !!payload.sessionId;
}
