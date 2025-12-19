import { Module } from '@nestjs/common';
import { TacheService } from './tache.service';
import { TacheController } from './tache.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Tache } from './entities/tache.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TacheController],
  providers: [TacheService],
  exports: [TacheService],
})
export class TacheModule {}
