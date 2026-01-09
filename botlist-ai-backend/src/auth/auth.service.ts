import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailDto } from './dto/email.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  JwtPayload,
  JwtRefreshPayload,
  TOKEN_ROLE,
} from './interfaces/payload.interface';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { generate } from 'otp-generator';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async validate(payload: JwtPayload): Promise<User> {
    if (payload.role === TOKEN_ROLE.AUTH) {
      const user = await this.userService.findOneByEmail(payload.email);
      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      return user;
    }
    throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
  }

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    console.log('📝 [AuthService] Registration attempt for email:', dto.email);
    
    if (await this.userService.checkEmail(dto.email)) {
      console.warn('⚠️ [AuthService] Email already exists:', dto.email);
      throw new ConflictException('Email already used');
    }

    console.log('✅ [AuthService] Creating new user for:', dto.email);
    const user = new User();
    user.email = dto.email;
    user.firstname = dto.firstname || '';
    user.lastname = dto.lastname || '';
    user.password = dto.password;
    user.isActive = true; // Users are active immediately (no email confirmation)
    user.role = 'user';

    const savedUser = await this.userService.save(user);
    console.log('✅ [AuthService] User created with ID:', savedUser.id);

    // Return directly with tokens (no activation email needed)
    const tokens = await this.generateTokens(user);
    console.log('✅ [AuthService] Tokens generated for user:', savedUser.id);
    return tokens;
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findOneByEmail(dto.email);
    
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account not activated');
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userService.save(user);

    return await this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let payload: JwtRefreshPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });
    } catch {
      throw new HttpException(
        'Refresh token invalide',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.sessionService.findValidSession(
      payload.sessionId,
    );

    if (!session || session.revokedAt) {
      throw new HttpException(
        'Session invalide ou expirée',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findOneByEmail(payload.email);

    return this.generateTokens(user, session.ip, session.userAgent);
  }

  public async activate(token: string, code: string): Promise<LoginResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid activation token');
    }

    if (payload.role !== TOKEN_ROLE.ACTIVATE) {
      throw new BadRequestException('Invalid activation token');
    }

    const user = await this.userService.findOneByEmail(payload.email);
    
    if (user.activationCode !== code) {
      throw new BadRequestException('Invalid activation code');
    }

    if (user.activationCodeExpiresAt && new Date() > user.activationCodeExpiresAt) {
      throw new BadRequestException('Activation code expired');
    }

    user.isActive = true;
    user.activationCode = null;
    user.activationCodeExpiresAt = null;
    
    const userSaved = await this.userService.save(user);
    return await this.generateTokens(userSaved);
  }

  async generateTokens(
    user: User,
    ip?: string | null,
    userAgent?: string | null,
  ): Promise<LoginResponse> {
    const session = await this.sessionService.create(user);

    const accessTokenPayload: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.AUTH,
    };

    const refreshTokenPayload: JwtRefreshPayload = {
      email: user.email,
      sessionId: session.id,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: process.env.REFRESH_TOKEN_EXP || '7d',
      secret: process.env.REFRESH_SECRET,
    });

    await this.sessionService.update(session.id, refreshToken, ip, userAgent);

    const accessToken = this.jwtService.sign(accessTokenPayload);

    return { refreshToken, accessToken, user };
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const payload: JwtRefreshPayload = this.jwtService.decode(refreshToken);
      if (payload?.sessionId) {
        await this.sessionService.revokeSession(payload?.sessionId);
      }
    }
    return { message: 'Logged out' };
  }

  async sendActivationCode(dto: EmailDto): Promise<{ activationToken: string }> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const activationCode = this.generateActivationCode();
    user.activationCode = activationCode;
    user.activationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userService.save(user);
    await this.mailService.sendDefault(
      dto.email,
      `${process.env.APP_NAME} - Code d'activation`,
      'send-activation-code',
      { activationCode },
    );

    const payload: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.ACTIVATE,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });
    return { activationToken: token };
  }

  async sendResetCode(dto: EmailDto): Promise<{ verifyResetCodeToken: string }> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const resetCode = this.generateActivationCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.userService.save(user);
    await this.mailService.sendDefault(
      dto.email,
      `${process.env.APP_NAME} - Code de réinitialisation`,
      'send-reset-code',
      { resetCode },
    );

    const payload: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.CODE_RESET,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { verifyResetCodeToken: token };
  }

  async verifyResetCode(dto: VerifyResetCodeDto): Promise<{ resetToken: string }> {
    const payload: JwtPayload = this.jwtService.verify(
      dto.verifyResetCodeToken,
    );
    if (payload.role !== TOKEN_ROLE.CODE_RESET) {
      throw new HttpException('Invalid token.', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOneByEmail(payload.email);
    if (!user || user.resetPasswordCode !== dto.otp || user.resetPasswordCodeExpiresAt! < new Date()) {
      throw new HttpException('Invalid or expired reset code.', HttpStatus.BAD_REQUEST);
    }

    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiresAt = null;

    await this.userService.save(user);

    const data: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.RESET,
    };

    const resetToken = this.jwtService.sign(data, { expiresIn: '10m' });
    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<LoginResponse> {
    const payload: JwtPayload = this.jwtService.verify(dto.resetToken);
    if (payload.role !== TOKEN_ROLE.RESET) {
      throw new HttpException('Invalid reset token.', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) throw new HttpException('User not found.', HttpStatus.NOT_FOUND);

    user.password = dto.password;
    await user.hashPassword();
    const userSaved = await this.userService.save(user);

    return this.generateTokens(userSaved);
  }

  private generateActivationCode(): string {
    return generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
  }
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
