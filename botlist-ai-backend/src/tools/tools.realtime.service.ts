import { MessageEvent } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SupabaseHelper } from '../supabase/supabase-helper';

@Injectable()
export class ToolsRealtimeService {
  constructor(private readonly supabaseHelper: SupabaseHelper) {}

  realtimeStream(filters: {
    categories?: string[];
    tags?: string[];               // mapped to use_cases JSONB (contains)
    pricing_model?: string;
    api_available?: boolean;
    open_source?: boolean;
  }): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const client = this.supabaseHelper.getAdminClient();

      const emit = async () => {
        try {
          const data = await this.queryToolsRealtime(filters);
          subscriber.next({ data } as MessageEvent);
        } catch (err: any) {
          console.error('Realtime emit failed:', err?.message || err);
        }
      };

      const channel = client
        .channel(`tools-realtime-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => emit())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tools_categories' }, () => emit())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tools_tags' }, () => emit())
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await emit();
          }
        });

      return () => {
        try { client.removeChannel(channel); } catch {}
      };
    });
  }

  private async queryToolsRealtime(filters: {
    categories?: string[];
    tags?: string[];
    pricing_model?: string;
    api_available?: boolean;
    open_source?: boolean;
  }): Promise<any[]> {
    let categoryIds: string[] = [];
    if (filters.categories && filters.categories.length > 0) {
      const { data: cats, error: catErr } = await this.supabaseHelper
        .getAdminClient()
        .from('categories')
        .select('id,name')
        .in('name', filters.categories);
      if (!catErr && Array.isArray(cats)) {
        categoryIds = (cats as any[]).map((c: any) => c.id);
      }
    }

    let query = this.supabaseHelper.getAdminClient()
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.pricing_model) query = query.eq('pricing_model', filters.pricing_model);
    if (typeof filters.api_available === 'boolean') query = query.eq('api_available', filters.api_available);
    if (typeof filters.open_source === 'boolean') query = query.eq('open_source', filters.open_source);
    if (categoryIds.length > 0) query = query.in('primary_category_id', categoryIds);
    if (filters.tags && filters.tags.length > 0) query = query.contains('use_cases', filters.tags);

    const { data: tools, error } = await query;
    if (error) throw new Error(error.message);

    for (const tool of tools as any[]) {
      try {
        if ((tool as any).primary_category_id) {
          (tool as any).category = await this.supabaseHelper.findOne('categories', (tool as any).primary_category_id);
        }
      } catch {}
    }

    return tools as any[];
  }
}
