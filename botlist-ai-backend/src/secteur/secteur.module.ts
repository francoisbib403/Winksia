import { Module } from '@nestjs/common';
import { SecteurService } from './secteur.service';
import { SecteurController } from './secteur.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Secteur } from './entities/secteur.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SecteurController],
  providers: [SecteurService],
  exports: [SecteurService],
})
export class SecteurModule {}
