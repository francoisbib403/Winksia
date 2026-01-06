import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tools } from '../../tools/entities/tools.entity';
import { User } from '../../user/entities/user.entity';
import { ReviewStatus } from '../enums/review-status.enum';
import { ReviewComment } from './review-comment.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @ManyToOne(() => Tools, (tool) => tool.reviews, { onDelete: 'CASCADE' })
  tool: Tools;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => ReviewComment, (comment) => comment.review)
  comments: ReviewComment[];
}
