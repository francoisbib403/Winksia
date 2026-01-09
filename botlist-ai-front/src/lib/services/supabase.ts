// Service Supabase pour les opérations de base de données
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
  
  return supabaseAdmin;
}

// Generic CRUD operations
export async function create<T>(tableName: string, data: any): Promise<T> {
  const client = getSupabaseAdminClient();
  const { data: result, error } = await client
    .from(tableName)
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create ${tableName}: ${error.message}`);
  }
  
  return result as T;
}

export async function findAll<T>(tableName: string, options?: { 
  orderBy?: string; 
  ascending?: boolean;
}): Promise<T[]> {
  const client = getSupabaseAdminClient();
  let query = client.from(tableName).select('*');
  
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to find all ${tableName}: ${error.message}`);
  }
  
  return (data || []) as T[];
}

export async function findOne<T>(tableName: string, id: string): Promise<T | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to find ${tableName} with id ${id}: ${error.message}`);
  }
  
  return data as T | null;
}

export async function findOneBy<T>(tableName: string, field: string, value: any): Promise<T | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(tableName)
    .select('*')
    .eq(field, value)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to find ${tableName} by ${field}: ${error.message}`);
  }
  
  return data as T | null;
}

export async function findManyBy<T>(tableName: string, field: string, value: any): Promise<T[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(tableName)
    .select('*')
    .eq(field, value);
  
  if (error) {
    throw new Error(`Failed to find ${tableName} by ${field}: ${error.message}`);
  }
  
  return (data || []) as T[];
}

export async function update<T>(tableName: string, id: string, data: any): Promise<T> {
  const client = getSupabaseAdminClient();
  const { data: result, error } = await client
    .from(tableName)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update ${tableName} with id ${id}: ${error.message}`);
  }
  
  return result as T;
}

export async function remove(tableName: string, id: string): Promise<void> {
  const client = getSupabaseAdminClient();
  const { error } = await client
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Failed to delete ${tableName} with id ${id}: ${error.message}`);
  }
}

// Custom query for complex operations
export async function query<T>(tableName: string, queryBuilder: (query: any) => any): Promise<T[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await queryBuilder(client.from(tableName));
  
  if (error) {
    throw new Error(`Query failed for ${tableName}: ${error.message}`);
  }
  
  return (data || []) as T[];
}
