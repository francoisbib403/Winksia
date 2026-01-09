// Supabase client for authentication (uses anon key for OAuth)
import { createClient, SupabaseClient, Session, Provider } from '@supabase/supabase-js';

let supabaseAuthClient: SupabaseClient | null = null;

export function getSupabaseAuthClient(): SupabaseClient {
  if (!supabaseAuthClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    
    supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We'll handle session storage ourselves
        autoRefreshToken: false,
      },
    });
  }
  
  return supabaseAuthClient;
}

// OAuth provider type for our app
export type OAuthProvider = 'google' | 'azure';

// Sign in with OAuth provider (Azure/Microsoft, Google, etc.)
export async function signInWithOAuth(provider: OAuthProvider) {
  const client = getSupabaseAuthClient();
  
  const { data, error } = await client.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      scopes: 'openid profile email',
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Exchange OAuth code for session
export async function exchangeCodeForSession(code: string) {
  const client = getSupabaseAuthClient();
  
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const client = getSupabaseAuthClient();
  const { data: { session } } = await client.auth.getSession();
  return session;
}

// Sign out
export async function signOut() {
  const client = getSupabaseAuthClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}
