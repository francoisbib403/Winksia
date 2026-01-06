import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ReviewComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Review, (review) => review.comments, { onDelete: 'CASCADE' })
  review: Review;

  @Column({ type: 'uuid' })
  review_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  updated_at: Date;
}
