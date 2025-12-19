import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseHelper } from './supabase-helper';

@Module({
  providers: [SupabaseService, SupabaseHelper],
  exports: [SupabaseService, SupabaseHelper],
})
export class SupabaseModule {}