import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Tools } from 'src/tools/entities/tools.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string | null;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ length: 7, nullable: true })
  color_theme: string;

  @Column({ length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relation ManyToMany : une catégorie peut avoir plusieurs outils
  @ManyToMany(() => Tools, (tool) => tool.category)
  tools: Tools[];

  // Optionnel : garder la relation pour les outils ayant cette catégorie comme principale
  @OneToMany(() => Tools, (tool) => tool.primaryCategory)
  primaryTools: Tools[];
}