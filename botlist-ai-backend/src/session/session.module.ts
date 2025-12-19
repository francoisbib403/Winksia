import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { SessionEntity } from './entities/session.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
