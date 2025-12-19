import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 7, default: '#6366f1' })
  color: string;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
