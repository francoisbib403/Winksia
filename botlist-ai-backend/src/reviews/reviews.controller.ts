import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('tool/:toolId')
  findByTool(@Param('toolId') toolId: string) {
    return this.reviewsService.findByTool(toolId);
  }

  // Review Comments Endpoints
  @Post('comments')
  createComment(@Body() dto: CreateReviewCommentDto) {
    return this.reviewsService.createComment(dto);
  }

  @Get(':reviewId/comments')
  getCommentsByReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.getCommentsByReviewId(reviewId);
  }
}
