import { Module } from '@nestjs/common';
import { MetierService } from './metier.service';
import { MetierController } from './metier.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Metier } from './entities/metier.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MetierController],
  providers: [MetierService],
  exports: [MetierService],
})
export class MetierModule {}
