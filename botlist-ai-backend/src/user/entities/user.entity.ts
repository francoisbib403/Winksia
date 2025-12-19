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
import { USER_AUTH_TYPE, USER_OTP_ROLE, USER_ROLE, USER_STATUS } from '../enum';
import { Exclude } from 'class-transformer';
import { SessionEntity } from 'src/session/entities/session.entity';
import { Review } from '../../reviews/entities/review.entity';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'USERNAME',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  username: string;

  @Column({
    name: 'SLUG',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  slug: string;

  @Column({ name: 'FIRSTNAME', type: 'varchar', length: 255, nullable: false })
  firstname: string;

  @Column({ name: 'LASTNAME', type: 'varchar', length: 255, nullable: false })
  lastname: string;

  @Column({ name: 'COMPANY', type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ name: 'JOB_TITLE', type: 'varchar', length: 255, nullable: true })
  jobTitle: string;

  @Column({ name: 'COMPANY_SIZE', type: 'varchar', length: 50, nullable: true })
  companySize: string;

  @Column({ name: 'INDUSTRY', type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({
    name: 'ROLE',
    type: 'enum',
    enum: USER_ROLE,
    default: USER_ROLE.USER,
  })
  role: USER_ROLE;

  @Column({
    name: 'LANGUAGE',
    type: 'varchar',
    length: 5,
    default: 'fr',
    nullable: false,
  })
  language: string;

  @Column({
    name: 'TIMEZONE',
    type: 'varchar',
    length: 50,
    default: 'Europe/Paris',
    nullable: false,
  })
  timezone: string;

  @Column({
    name: 'PREFERENCES',
    type: 'jsonb',
    default: () => "'{}'",
    nullable: false,
  })
  preferences: Record<string, any>;

  @Column({
    name: 'PWD',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @Exclude()
  pwd: string;

  @Column({
    name: 'EMAIL_VERIFIED',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  emailVerified: boolean;

  @Column({
    name: 'EMAIL_VERIFIED_AT',
    type: 'timestamp',
    nullable: true,
  })
  @Exclude()
  emailVerifiedAt: Date;

  @Column({
    name: 'LAST_LOGIN_AT',
    type: 'timestamp',
    nullable: true,
  })
  @Exclude()
  lastLoginAt: Date;

  @Column({
    name: 'STATUS',
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.BLOCKED,
    nullable: false,
  })
  status: USER_STATUS;

  @Column({ name: 'OTP', type: 'varchar', length: 10, nullable: true })
  @Exclude()
  otp: string | null;

  @Column({
    name: 'OTP_ROLE',
    type: 'enum',
    enum: USER_OTP_ROLE,
    nullable: true,
  })
  @Exclude()
  otpRole: USER_OTP_ROLE | null;

  @Column({
    name: 'AUTH_TYPE',
    type: 'enum',
    enum: USER_AUTH_TYPE,
    default: USER_AUTH_TYPE.SIMPLE,
    nullable: true,
  })
  @Exclude()
  authType: USER_AUTH_TYPE;

  @Column({ name: 'OTP_TIME_GENERATE', type: 'timestamptz', nullable: true })
  @Exclude()
  otpTimeGenerate: Date | null;

  @CreateDateColumn({
    name: 'CREATION_DATE',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'UPDATED_DATE',
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt: Date;

  @BeforeInsert() async hashPassword() {
    this.pwd = await bcrypt.hash(this.pwd, 10);
  }

  @OneToMany(() => Review, (review) => review.user)
reviews: Review[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    cascade: true,
  })
  sessions: SessionEntity[];
}
