import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Tools } from '../tools/entities/tools.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const tool = await this.supabaseHelper.findOne('tools', dto.tool_id);
    if (!tool) throw new NotFoundException('Tool not found');

    const user = await this.supabaseHelper.findOne('users', dto.user_id);
    if (!user) throw new NotFoundException('User not found');

    const reviewData = {
      rating: dto.rating,
      comment: dto.comment,
      tool_id: dto.tool_id,
      user_id: dto.user_id,
    };

    const review = await this.supabaseHelper.create('reviews', reviewData);
    
    // Attach related data for the response
    const reviewWithRelations = {
      ...review,
      tool,
      user,
    };

    return reviewWithRelations as Review;
  }

  async findAll(): Promise<Review[]> {
    const reviews = await this.supabaseHelper.findAll('reviews');
    
    // For each review, fetch related data
    const reviewsWithRelations = await Promise.all(
      reviews.map(async (review: any) => {
        const tool = await this.supabaseHelper.findOne('tools', review.tool_id);
        const user = await this.supabaseHelper.findOne('users', review.user_id);
        
        return {
          ...review,
          tool,
          user,
        };
      })
    );

    return reviewsWithRelations as Review[];
  }

  async findByTool(toolId: string): Promise<Review[]> {
    const reviews = await this.supabaseHelper.findManyBy('reviews', 'tool_id', toolId);
    
    // For each review, fetch user data
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review: any) => {
        const user = await this.supabaseHelper.findOne('users', review.user_id);
        
        return {
          ...review,
          user,
        };
      })
    );

    return reviewsWithUsers as Review[];
  }
}
