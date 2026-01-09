// Service d'authentification
import * as userService from '../user.service';
import * as sessionService from '../session.service';
import * as jwtService from './jwt';
import { TOKEN_ROLE, LoginResponse, RegisterResponse, JwtPayload, JwtRefreshPayload } from '@/types/auth';

// DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface EmailDto {
  email: string;
}

export interface VerifyResetCodeDto {
  verifyResetCodeToken: string;
  otp: string;
}

export interface ResetPasswordDto {
  resetToken: string;
  password: string;
}

export interface ActivateUserDto {
  activateToken: string;
  otp: string;
}

export async function validate(payload: JwtPayload): Promise<userService.User | null> {
  if (payload.role !== TOKEN_ROLE.AUTH) {
    return null;
  }
  
  const user = await userService.findOneByEmail(payload.email);
  return user;
}

export async function register(dto: RegisterDto): Promise<RegisterResponse> {
  console.log('📝 [AuthService] Registration attempt for email:', dto.email);
  
  const existing = await userService.checkEmail(dto.email);
  if (existing) {
    console.warn('⚠️ [AuthService] Email already exists:', dto.email);
    throw new Error('Email already used');
  }
  
  console.log('✅ [AuthService] Creating new user for:', dto.email);
  const user = await userService.create(dto);
  console.log('✅ [AuthService] User created with ID:', user.id);
  
  const tokens = await generateTokens(user);
  console.log('✅ [AuthService] Tokens generated for user:', user.id);
  
  return {
    ...tokens,
    user: userService.toUserResponse(user),
  };
}

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const user = await userService.findOneByEmail(dto.email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account not activated');
  }
  
  const isValidPassword = await verifyPassword(user.password, dto.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  // Update last login
  await userService.updateLastLogin(user.id);
  
  const tokens = await generateTokens(user);
  
  return {
    ...tokens,
    user: userService.toUserResponse(user),
  };
}

export async function refresh(refreshToken: string): Promise<LoginResponse> {
  if (!refreshToken) {
    throw new Error('Refresh token missing');
  }
  
  let payload: JwtRefreshPayload;
  try {
    payload = jwtService.verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Refresh token invalide');
  }
  
  const user = await userService.findOneByEmail(payload.email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Générer de nouveaux tokens
  const result = await generateTokens(user);
  return {
    ...result,
    user: userService.toUserResponse(user),
  };
}

export async function logout(refreshToken: string): Promise<void> {
  // La session sera invalidée côté client en supprimant le cookie
  // Si la table de sessions existe, on peut révoquer la session
  if (refreshToken) {
    try {
      const payload = jwtService.decodeToken(refreshToken) as JwtRefreshPayload;
      if (payload?.sessionId && payload.sessionId !== 'no-session') {
        await sessionService.revokeSession(payload.sessionId);
      }
    } catch {
      // Ignore les erreurs de décodage
    }
  }
}

export async function activate(token: string, code: string): Promise<LoginResponse> {
  let payload: JwtPayload;
  try {
    payload = jwtService.verifyAccessToken(token);
  } catch {
    throw new Error('Invalid activation token');
  }
  
  if (payload.role !== TOKEN_ROLE.ACTIVATE) {
    throw new Error('Invalid activation token');
  }
  
  const user = await userService.findOneByEmail(payload.email);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.activationCode !== code) {
    throw new Error('Invalid activation code');
  }
  
  if (user.activationCodeExpiresAt && new Date(user.activationCodeExpiresAt) < new Date()) {
    throw new Error('Activation code expired');
  }
  
  // Activate user
  await userService.update(user.id, {});
  
  const result = await generateTokens(user);
  return {
    ...result,
    user: userService.toUserResponse(user),
  };
}

export async function sendActivationCode(email: string): Promise<{ activationToken: string }> {
  const user = await userService.findOneByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Note: Would need to save activation code to DB
  // For now, just return the token
  
  const payload: JwtPayload = {
    email: user.email,
    role: TOKEN_ROLE.ACTIVATE,
  };
  
  const token = jwtService.signAccessToken(payload);
  return { activationToken: token };
}

export async function sendResetCode(email: string): Promise<{ verifyResetCodeToken: string }> {
  const user = await userService.findOneByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Note: Would need to send email and save reset code to DB
  
  const payload: JwtPayload = {
    email: user.email,
    role: TOKEN_ROLE.CODE_RESET,
  };
  
  const token = jwtService.signAccessToken(payload);
  return { verifyResetCodeToken: token };
}

export async function verifyResetCode(dto: VerifyResetCodeDto): Promise<{ resetToken: string }> {
  let payload: JwtPayload;
  try {
    payload = jwtService.verifyAccessToken(dto.verifyResetCodeToken);
  } catch {
    throw new Error('Invalid token');
  }
  
  if (payload.role !== TOKEN_ROLE.CODE_RESET) {
    throw new Error('Invalid token');
  }
  
  // Note: Would need to verify OTP against DB
  
  const resetPayload: JwtPayload = {
    email: payload.email,
    role: TOKEN_ROLE.RESET,
  };
  
  const resetToken = jwtService.signAccessToken(resetPayload);
  return { resetToken };
}

export async function resetPassword(dto: ResetPasswordDto): Promise<LoginResponse> {
  let payload: JwtPayload;
  try {
    payload = jwtService.verifyAccessToken(dto.resetToken);
  } catch {
    throw new Error('Invalid reset token');
  }
  
  if (payload.role !== TOKEN_ROLE.RESET) {
    throw new Error('Invalid reset token');
  }
  
  const user = await userService.findOneByEmail(payload.email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Note: Would need to update password in DB
  
  const result = await generateTokens(user);
  return {
    ...result,
    user: userService.toUserResponse(user),
  };
}

async function generateTokens(
  user: userService.User,
  ip?: string,
  userAgent?: string
): Promise<Omit<LoginResponse, 'user'>> {
  const session = await sessionService.createSession({
    userId: user.id,
    ip: ip || null,
    userAgent: userAgent || null,
  });
  
  // Si la session ne peut pas être créée (table manquante), on continue sans session
  const sessionId = session?.id || 'no-session';
  
  const accessTokenPayload: JwtPayload = {
    email: user.email,
    role: TOKEN_ROLE.AUTH,
  };
  
  const refreshTokenPayload: JwtRefreshPayload = {
    email: user.email,
    sessionId: sessionId,
  };
  
  const refreshToken = jwtService.signRefreshToken(refreshTokenPayload);
  
  const accessToken = jwtService.signAccessToken(accessTokenPayload);
  
  return { accessToken, refreshToken };
}

function generateActivationCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

async function verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(plainPassword, hashedPassword);
}
