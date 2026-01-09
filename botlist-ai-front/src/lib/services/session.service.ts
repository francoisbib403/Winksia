// Service de session simplifié pour la gestion des sessions utilisateur
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string | null;
  device_type: string | null;
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
}

export interface CreateSessionData {
  userId: string;
  deviceType?: string | null;
  deviceName?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

export async function createSession(data: CreateSessionData): Promise<Session | null> {
  try {
    const client = getSupabaseClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 jours
    
    const sessionData = {
      user_id: data.userId,
      token: uuidv4(),
      refresh_token: null,
      device_type: data.deviceType || null,
      device_name: data.deviceName || null,
      ip_address: data.ip || null,
      user_agent: data.userAgent || null,
      is_active: true,
      expires_at: expiresAt,
      last_used_at: null,
    };
    
    const { data: session, error } = await client
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SessionService] Error creating session:', error.message);
      return null;
    }
    
    return session as Session;
  } catch (error: any) {
    console.error('❌ [SessionService] Exception:', error.message);
    return null;
  }
}

export async function findSessionByToken(token: string): Promise<Session | null> {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('user_sessions')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    const session = data as Session;
    
    // Vérifier si la session est valide
    if (!session.is_active) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return null;
    
    return session;
  } catch (error: any) {
    console.error('❌ [SessionService] Exception:', error.message);
    return null;
  }
}

export async function updateSessionLastUsed(sessionId: string): Promise<void> {
  try {
    const client = getSupabaseClient();
    await client
      .from('user_sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', sessionId);
  } catch (error: any) {
    console.error('❌ [SessionService] Error updating session:', error.message);
  }
}

export async function revokeSession(sessionId: string): Promise<void> {
  try {
    const client = getSupabaseClient();
    await client
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);
  } catch (error: any) {
    console.error('❌ [SessionService] Error revoking session:', error.message);
  }
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  try {
    const client = getSupabaseClient();
    await client
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);
  } catch (error: any) {
    console.error('❌ [SessionService] Error revoking sessions:', error.message);
  }
}

export async function deleteExpiredSessions(): Promise<number> {
  try {
    const client = getSupabaseClient();
    const now = new Date().toISOString();
    
    // Supprimer les sessions expirées
    const { error } = await client
      .from('user_sessions')
      .delete()
      .lt('expires_at', now);
    
    if (error) {
      console.error('❌ [SessionService] Error deleting expired sessions:', error.message);
      return 0;
    }
    
    return 1; // Simplifié
  } catch (error: any) {
    console.error('❌ [SessionService] Exception:', error.message);
    return 0;
  }
}
