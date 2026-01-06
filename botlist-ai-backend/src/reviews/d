import { IsString, IsUUID } from 'class-validator';

export class CreateReviewCommentDto {
  @IsUUID()
  review_id: string;

  @IsUUID()
  user_id: string;

  @IsString()
  comment: string;
}
