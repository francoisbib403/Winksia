import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';
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
        const comments = await this.getCommentsForReview(review.id);
        
        return {
          ...review,
          tool,
          user,
          comments,
        };
      })
    );

    return reviewsWithRelations as Review[];
  }

  async findByTool(toolId: string): Promise<Review[]> {
    const reviews = await this.supabaseHelper.findManyBy('reviews', 'tool_id', toolId);
    
    // For each review, fetch user data and comments
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review: any) => {
        const user = await this.supabaseHelper.findOne('users', review.user_id);
        const comments = await this.getCommentsForReview(review.id);
        
        return {
          ...review,
          user,
          comments,
        };
      })
    );

    return reviewsWithUsers as Review[];
  }

  // Review Comments Methods
  async createComment(dto: CreateReviewCommentDto): Promise<any> {
    const review = await this.supabaseHelper.findOne('reviews', dto.review_id);
    if (!review) throw new NotFoundException('Review not found');

    const user = await this.supabaseHelper.findOne('users', dto.user_id);
    if (!user) throw new NotFoundException('User not found');

    const commentData = {
      review_id: dto.review_id,
      user_id: dto.user_id,
      comment: dto.comment,
    };

    const comment = await this.supabaseHelper.create('review_comments', commentData);
    
    return {
      ...comment,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }

  async getCommentsForReview(reviewId: string): Promise<any[]> {
    const comments = await this.supabaseHelper.findManyBy('review_comments', 'review_id', reviewId);
    
    // Fetch user data for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment: any) => {
        const user = await this.supabaseHelper.findOne('users', comment.user_id);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
          } : null,
        };
      })
    );

    return commentsWithUsers;
  }

  async getCommentsByReviewId(reviewId: string): Promise<any[]> {
    return this.getCommentsForReview(reviewId);
  }
}
