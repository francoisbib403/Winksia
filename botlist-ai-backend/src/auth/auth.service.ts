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
import { USER_OTP_ROLE, USER_ROLE, USER_STATUS } from 'src/user/enum';
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
    if (payload.role === 'AUTH') {
      const user = await this.userService.findOneByEmail(payload.email);
      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      return user;
    }
    throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
  }

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    if (await this.userService.checkEmail(dto.email)) {
      throw new ConflictException('Email already used');
    }

    const user = new User();
    Object.assign(user, dto, {
      status: USER_STATUS.ACTIVED,
      activate: false,
      role: USER_ROLE.ADMIN,
    });
    user.slug = await this.userService.searchSlug(user);
    const otp = this.generateOtp();
    Object.assign(user, {
      otp,
      otpRole: USER_OTP_ROLE.ACTIVATE,
      otpTimeGenerate: new Date(),
    });

    const savedUser = await this.userService.save(user);

    await this.mailService.sendDefault(
      dto.email,
      `${process.env.APP_NAME} code d'activation de compte`,
      'activate',
      { otp },
    );

    const payload: JwtPayload = {
      email: savedUser.email,
      role: TOKEN_ROLE.ACTIVATE,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '10m' });

    return { activationToken: token, user: savedUser };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user?.emailVerified) {
      throw new ForbiddenException('Account not activated');
    }

    if (user?.status === USER_STATUS.BLOCKED) {
      throw new ForbiddenException('Account blocked');
    }

    if (!user || !(await bcrypt.compare(dto.pwd, user.pwd))) {
      throw new HttpException('Invalid credentials.', HttpStatus.BAD_REQUEST);
    }

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

    const user = await this.userService.findOneByEmailAndFailed(payload.email);

    return this.generateTokens(user, session.ip, session.userAgent);
  }

  public async activate(token: string, otp: string): Promise<LoginResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalide activateToken');
    }

    if (payload.role !== TOKEN_ROLE.ACTIVATE) {
      throw new BadRequestException('Invalide activateToken');
    }

    const user = await this.userService.findOneByEmailAndFailed(payload.email);
    if (user.otp !== otp || user.otpRole !== USER_OTP_ROLE.ACTIVATE) {
      throw new BadRequestException('Bad otp code');
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.status = USER_STATUS.ACTIVED;
    user.otp = null;
    user.otpRole = null;
    user.otpTimeGenerate = null;
    const userSaved = await this.userService.save(user);
    return await this.generateTokens(userSaved);
  }

  async generateTokens(
    user: User,
    ip?: string,
    userAgent?: string,
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
      expiresIn: process.env.REFRESH_TOKEN_EXP,
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

  async sendActivationCode(
    dto: EmailDto,
  ): Promise<{ activationToken: string }> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const otp = this.generateOtp();
    Object.assign(user, {
      otp,
      otpRole: USER_OTP_ROLE.ACTIVATE,
      otpTimeGenerate: new Date(),
    });

    await this.userService.save(user);
    await this.mailService.sendDefault(
      dto.email,
      `${process.env.APP_NAME} code d'activation de compte`,
      'send-activation-code',
      { otp },
    );

    const payload: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.ACTIVATE,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '10m' });
    return { activationToken: token };
  }

  async sendResetCode(
    dto: EmailDto,
  ): Promise<{ verifyResetCodeToken: string }> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const otp = this.generateOtp();
    Object.assign(user, {
      otp,
      otpRole: USER_OTP_ROLE.RESET,
      otpTimeGenerate: new Date(),
    });

    await this.userService.save(user);
    await this.mailService.sendDefault(
      dto.email,
      `${process.env.APP_NAME} code de réinitialisation`,
      'send-reset-code',
      { otp },
    );

    const payload: JwtPayload = {
      email: user.email,
      role: TOKEN_ROLE.CODE_RESET,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '10m' });
    return { verifyResetCodeToken: token };
  }

  async verifyResetCode(
    dto: VerifyResetCodeDto,
  ): Promise<{ resetToken: string }> {
    const payload: JwtPayload = this.jwtService.verify(
      dto.verifyResetCodeToken,
    );
    if (payload.role !== TOKEN_ROLE.CODE_RESET) {
      throw new HttpException('Invalid token.', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOneByEmail(payload.email);
    if (!user || user.otp !== dto.otp || user.otpRole !== USER_OTP_ROLE.RESET) {
      throw new HttpException('Bad otp code.', HttpStatus.BAD_REQUEST);
    }

    Object.assign(user, {
      otp: null,
      otpRole: null,
      otpTimeGenerate: null,
    });

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

    user.pwd = dto.pwd;
    await user.hashPassword();
    const userSaved = await this.userService.save(user);

    return this.generateTokens(userSaved);
  }

  private generateOtp(): string {
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
  activationToken: string;
  user: User;
}
