import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SupabaseHelper {
  constructor(private readonly supabaseService: SupabaseService) {}

  getAdminClient() {
    return this.supabaseService.getAdminClient();
  }

  // Generic CRUD operations for any table
  async create(tableName: string, data: any) {
    const { data: result, error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${tableName}: ${error.message}`);
    }

    return result;
  }

  async findAll(tableName: string, options?: { orderBy?: string; ascending?: boolean }) {
    let query = this.supabaseService.getAdminClient().from(tableName).select('*');
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find all ${tableName}: ${error.message}`);
    }

    return data || [];
  }

  async findOne(tableName: string, id: string) {
    const { data, error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to find ${tableName} with id ${id}: ${error.message}`);
    }

    return data;
  }

  async findOneBy(tableName: string, field: string, value: any) {
    const { data, error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .select('*')
      .eq(field, value)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to find ${tableName} by ${field}: ${error.message}`);
    }

    return data;
  }

  async findManyBy(tableName: string, field: string, value: any) {
    const { data, error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .select('*')
      .eq(field, value);

    if (error) {
      throw new Error(`Failed to find ${tableName} by ${field}: ${error.message}`);
    }

    return data || [];
  }

  async update(tableName: string, id: string, data: any) {
    const { data: result, error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${tableName} with id ${id}: ${error.message}`);
    }

    return result;
  }

  async remove(tableName: string, id: string) {
    const { error } = await this.supabaseService.getAdminClient()
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${tableName} with id ${id}: ${error.message}`);
    }

    return { deleted: true };
  }

  // Custom query for complex operations
  async query(tableName: string, queryBuilder: any) {
    const { data, error } = await queryBuilder(this.supabaseService.getAdminClient().from(tableName));

    if (error) {
      throw new Error(`Query failed for ${tableName}: ${error.message}`);
    }

    return data;
  }
}