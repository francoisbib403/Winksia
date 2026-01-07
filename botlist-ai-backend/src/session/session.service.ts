import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { SessionEntity } from './entities/session.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/user/entities/user.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SessionService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  /**
   * Crée une session avec le refresh token
   */
  async create(user: User): Promise<SessionEntity> {
    const session = new SessionEntity();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    Object.assign(session, {
      userId: user.id,
      token: null,
      refreshToken: null,
      deviceType: null,
      deviceName: null,
      ip: null,
      userAgent: null,
      isActive: true,
      expiresAt,
      lastUsedAt: null,
    });

    return this.supabaseHelper.create('user_sessions', session) as Promise<SessionEntity>;
  }

  /**
   * Mettre à jour une session avec le refresh token
   */
  async update(
    sessionId: string,
    refreshToken: string,
    ip?: string | null,
    userAgent?: string | null,
  ): Promise<SessionEntity> {
    const session = await this.findValidSession(sessionId);
    if (!session) {
      throw new HttpException(
        'Session invalide ou expirée',
        HttpStatus.UNAUTHORIZED,
      );
    }

    session.refreshToken = refreshToken;
    session.ip = ip || null;
    session.userAgent = userAgent || null;
    session.lastUsedAt = new Date();

    return this.supabaseHelper.update('user_sessions', sessionId, session) as Promise<SessionEntity>;
  }

  /**
   * Trouve une session valide par ID
   */
  async findValidSession(sessionId: string): Promise<SessionEntity | null> {
    const sessions = await this.supabaseHelper.findManyBy('user_sessions', 'id', sessionId);
    if (sessions.length === 0) return null;
    
    const session = sessions[0];
    if (session.revokedAt) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return null;
    if (!session.is_active) return null;
    
    return session as SessionEntity;
  }

  /**
   * Vérifie si un refresh token correspond à celui stocké
   */
  async validateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<User | null> {
    const session = await this.findValidSession(sessionId);
    if (!session) return null;

    if (session.refreshToken !== refreshToken) return null;

    return session.user;
  }

  /**
   * Révoque une session (ex: logout ou token volé)
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.supabaseHelper.update('user_sessions', sessionId, { 
      revokedAt: new Date(),
      isActive: false 
    });
  }

  /**
   * Révoque toutes les sessions d'un user (ex: logout global)
   */
  async revokeAllSessionsForUser(userId: string): Promise<void> {
    // Find all sessions for this user that are not revoked
    const sessions = await this.supabaseHelper.query(
      'user_sessions',
      (query: any) => query.select('*').eq('user_id', userId).is('revoked_at', 'null')
    );

    // Update all sessions to revoke them
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        await this.supabaseHelper.update('user_sessions', session.id, { 
          revokedAt: new Date(),
          isActive: false 
        });
      }
    }
  }

  /**
   * Supprime les sessions expirées (90 jours)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanup() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Find expired sessions
    const sessions = await this.supabaseHelper.query(
      'user_sessions',
      (query: any) => query.select('*').lt('created_at', ninetyDaysAgo.toISOString()).is('revoked_at', 'null')
    );

    console.log(`Sessions nettoyées : ${sessions ? sessions.length : 0}`);
  }
}
