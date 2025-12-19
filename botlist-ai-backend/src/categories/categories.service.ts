import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (
      await this.supabaseHelper.findOneBy('categories', 'slug', slug)
    ) {
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const { name, slug } = dto;

    if (slug) {
      const existing = await this.supabaseHelper.findOneBy('categories', 'slug', slug);
      if (existing) {
        throw new ConflictException(`Une catégorie avec le slug "${slug}" existe déjà.`);
      }
    }

    const finalSlug = slug || await this.generateUniqueSlug(name);

    const category = await this.supabaseHelper.create('categories', {
      ...dto,
      slug: finalSlug,
    });

    return category as Category;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.supabaseHelper.findAll('categories', {
      orderBy: 'sort_order',
      ascending: true,
    });
    
    return categories as Category[];
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.supabaseHelper.findOne('categories', id);
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable.`);
    }
    return category as Category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const { name, slug } = dto;

    // Vérification de l'unicité du slug
    if (slug) {
      const existing = await this.supabaseHelper.query(
        'categories',
        (query: any) => query.select('*').eq('slug', slug).neq('id', id)
      );
      if (existing && existing.length > 0) {
        throw new ConflictException(`Une catégorie avec le slug "${slug}" existe déjà.`);
      }
      category.slug = slug;
    } else if (name && name !== category.name) {
      category.slug = await this.generateUniqueSlug(name, id);
    }

    Object.assign(category, dto);

    const updatedCategory = await this.supabaseHelper.update('categories', id, category);
    return updatedCategory as Category;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.supabaseHelper.remove('categories', id);
    return { message: `Catégorie ${id} supprimée avec succès.` };
  }
}
