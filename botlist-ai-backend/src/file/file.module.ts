import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { File } from './entities/file.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
