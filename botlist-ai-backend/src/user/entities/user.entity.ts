import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { USER_ROLE } from '../enum';
import { Exclude } from 'class-transformer';
import { SessionEntity } from 'src/session/entities/session.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ReviewComment } from '../../reviews/entities/review-comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  @Exclude()
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstname: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastname: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ name: 'company', type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 50,
    default: 'user',
    nullable: false,
  })
  role: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isActive: boolean;

  @Column({
    name: 'is_public_profile',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isPublicProfile: boolean;

  @Column({
    name: 'preferred_language',
    type: 'varchar',
    length: 10,
    default: 'fr',
    nullable: false,
  })
  preferredLanguage: string;

  @Column({
    name: 'email_notifications',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  emailNotifications: boolean;

  @Column({
    name: 'push_notifications',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  pushNotifications: boolean;

  @Column({
    name: 'theme',
    type: 'varchar',
    length: 20,
    default: 'light',
    nullable: false,
  })
  theme: string;

  @Column({ name: 'activation_code', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  activationCode: string | null;

  @Column({ name: 'activation_code_expires_at', type: 'timestamptz', nullable: true })
  @Exclude()
  activationCodeExpiresAt: Date | null;

  @Column({ name: 'reset_password_code', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  resetPasswordCode: string | null;

  @Column({ name: 'reset_password_code_expires_at', type: 'timestamptz', nullable: true })
  @Exclude()
  resetPasswordCodeExpiresAt: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  @Exclude()
  lastLoginAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt: Date;

  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    cascade: true,
  })
  sessions: SessionEntity[];

  @OneToMany(() => ReviewComment, (comment) => comment.user)
  reviewComments: ReviewComment[];
}
