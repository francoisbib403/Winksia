import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Tools } from './entities/tools.entity dddd';
// import { Category } from '../categories/entities/category.entity';
// import { File } from '../file/entities/file.entity';
import { SupabaseModule } from '../supabase/supabase.module';
import { ToolsRealtimeService } from './tools.realtime.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ToolsController],
  providers: [ToolsService, ToolsRealtimeService],
  exports: [ToolsService, ToolsRealtimeService],
})
export class ToolsModule {}
