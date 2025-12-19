import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Review } from './entities/review.entity';
// import { Tools } from '../tools/entities/tools.entity';
// import { User } from '../user/entities/user.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
