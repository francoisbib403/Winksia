import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { File } from 'src/file/entities/file.entity';
import { PricingModel, ToolStatus } from '../tools.enums';
import { Review } from '../../reviews/entities/review.entity';

@Entity('tools')
export class Tools {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 500, nullable: true })
  tagline: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  long_description: string;

  // Relation ManyToMany : un outil peut avoir plusieurs catégories
  @ManyToMany(() => Category, (category) => category.tools, {
    eager: true,
  })
  @JoinTable({
    name: 'tools_categories',
    joinColumn: { name: 'tool_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  category: Category[];
  
  @OneToMany(() => Review, (review) => review.tool)
  reviews: Review[];

  // Optionnel : garder une catégorie principale si nécessaire
  @ManyToOne(() => Category, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'primary_category_id' })
  primaryCategory: Category;

  @ManyToOne(() => Category, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Category;

  @Column({ type: 'enum', enum: PricingModel })
  pricing_model: PricingModel;

  @Column({
    type: 'enum',
    enum: ToolStatus,
    default: ToolStatus.DRAFT,
  })
  status: ToolStatus;

  @Column({ length: 500 })
  website_url: string;

  @ManyToOne(() => File, { nullable: true, eager: true })
  @JoinColumn({ name: 'logo_file_id' })
  logo: File;

  @ManyToOne(() => File, { nullable: true, eager: true })
  @JoinColumn({ name: 'demo_file_id' })
  demo: File;

  @ManyToMany(() => File, { eager: true })
  @JoinTable({
    name: 'tools_screenshots',
    joinColumn: { name: 'tool_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'file_id', referencedColumnName: 'id' },
  })
  screenshots: File[];

  @ManyToMany(() => File, { eager: true })
  @JoinTable({
    name: 'tools_videos',
    joinColumn: { name: 'tool_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'file_id', referencedColumnName: 'id' },
  })
  videos: File[];

  @Column({ default: false })
  api_available: boolean;

  @Column({ length: 500, nullable: true })
  api_documentation_url: string;

  @Column({ default: false })
  open_source: boolean;

  @Column({ default: false })
  self_hosted_available: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  tech_stack: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  supported_languages: string[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  supported_formats: Record<string, any>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  integrations: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  platforms: string[];

  @Column({ default: false })
  gdpr_compliant: boolean;

  @Column({ default: false })
  soc2_certified: boolean;

  @Column({ default: false })
  hipaa_compliant: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  data_residency: string[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  pricing_details: Record<string, any>;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  overall_rating: number;

  @Column({ type: 'int', nullable: true })
  performance_score: number;

  @Column({ type: 'int', nullable: true })
  ease_of_use_score: number;

  @Column({ type: 'int', nullable: true })
  value_for_money_score: number;

  @Column({ type: 'int', nullable: true })
  support_score: number;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  review_count: number;

  @Column({ type: 'int', default: 0 })
  bookmark_count: number;

  @Column({ type: 'int', default: 0 })
  click_count: number;

  @Column({ length: 255, nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  keywords: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  features: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  use_cases: string[];

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  verified_by: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'timestamp', nullable: true })
  featured_until: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_crawled_at: Date;
}