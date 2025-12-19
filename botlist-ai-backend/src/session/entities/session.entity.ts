import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('session')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @Column('uuid', { name: 'ID_USER' })
  idUser: string;

  @Column({ name: 'IP', type: 'varchar', length: 255, nullable: true })
  ip?: string;

  @Column({ name: 'HASH', type: 'varchar', length: 255, nullable: true })
  hash: string;

  @Column({ name: 'USER_AGENT', type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @CreateDateColumn({ name: 'CREATED_DATE', type: 'timestamptz', nullable: false })
  createdDate: Date;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    {
      name: 'ID_USER',
      referencedColumnName: 'id',
    },
  ])
  user: User;
}
