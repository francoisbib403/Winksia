import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { SessionEntity } from './entities/session.entity';
import * as bcrypt from 'bcryptjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  /**
   * Crée une session avec le hash du refresh token
   */
  async create(user: User): Promise<SessionEntity> {
    const session = new SessionEntity();
    Object.assign(session, {
      hash: null,
      ip: null,
      userAgent: null,
      user,
    });

    return this.supabaseHelper.create('sessions', session) as Promise<SessionEntity>;
  }

  /**
   * Mettre à jour une session avec le hash du refresh token
   */
  async update(
    sessionId: string,
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<SessionEntity> {
    const session = await this.findValidSession(sessionId);
    if (!session) {
      throw new HttpException(
        'Session invalide ou expirée',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const hash = await bcrypt.hash(token, 10);
    session.hash = hash;
    session.ip = ip;
    session.userAgent = userAgent;

    return this.supabaseHelper.update('sessions', sessionId, session) as Promise<SessionEntity>;
  }

  /**
   * Trouve une session valide par ID
   */
  async findValidSession(sessionId: string): Promise<SessionEntity | null> {
    const sessions = await this.supabaseHelper.findManyBy('sessions', 'id', sessionId);
    if (sessions.length === 0) return null;
    
    const session = sessions[0];
    if (session.revokedAt) return null;
    
    return session as SessionEntity;
  }

  /**
   * Vérifie si un refresh token correspond au hash stocké
   */
  async validateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<User | null> {
    const session = await this.findValidSession(sessionId);
    if (!session) return null;

    const isMatch = await bcrypt.compare(refreshToken, session.hash);
    if (!isMatch) return null;

    return session.user;
  }

  /**
   * Révoque une session (ex: logout ou token volé)
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.supabaseHelper.update('sessions', sessionId, { revokedAt: new Date() });
  }

  /**
   * Révoque toutes les sessions d'un user (ex: logout global)
   */
  async revokeAllSessionsForUser(userId: string): Promise<void> {
    // Find all sessions for this user that are not revoked
    const sessions = await this.supabaseHelper.query(
      'sessions',
      (query: any) => query.select('*').eq('user_id', userId).is('revoked_at', 'null')
    );

    // Update all sessions to revoke them
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        await this.supabaseHelper.update('sessions', session.id, { revokedAt: new Date() });
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
      'sessions',
      (query: any) => query.select('*').lt('created_at', ninetyDaysAgo.toISOString()).is('revoked_at', 'null')
    );

    console.log(`Sessions nettoyées : ${sessions ? sessions.length : 0}`);
  }
}
