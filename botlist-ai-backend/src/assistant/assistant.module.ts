import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { OpenAIService } from './openai.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Tools } from '../tools/entities/tools.entity';
// import { Category } from '../categories/entities/category.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AssistantController],
  providers: [AssistantService, OpenAIService],
  exports: [AssistantService],
})
export class AssistantModule {}