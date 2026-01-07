import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'token', type: 'varchar', length: 255, nullable: true })
  token: string | null;

  @Column({ name: 'refresh_token', type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType: string | null;

  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true })
  deviceName: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  ])
  user: User;
}
