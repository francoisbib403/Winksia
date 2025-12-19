export enum TOKEN_ROLE {
  AUTH = 'AUTH',
  AUTH_ADMIN = 'AUTH_ADMIN',
  ACTIVATE = 'ACTIVATE',
  CODE_RESET = 'CODE_RESET',
  RESET = 'RESET',
  CODE_EMAIL = 'CODE_EMAIL',
  TWO_FACTOR = 'TWO_FACTOR',
  EMAIL = 'EMAIL',
}

export interface JwtPayload {
  email: string;
  role: TOKEN_ROLE;
}

export interface JwtRefreshPayload {
  email: string;
  sessionId: string;
}