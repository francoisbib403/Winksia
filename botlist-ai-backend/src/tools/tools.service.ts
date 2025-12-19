import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Tools } from './entities/tools.entity';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Category } from '../categories/entities/category.entity';
import { File } from '../file/entities/file.entity';
import slugify from 'slugify';

@Injectable()
export class ToolsService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (
      await this.supabaseHelper.findOneBy('tools', 'slug', slug)
    ) {
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  }

  async create(createToolDto: CreateToolDto): Promise<Tools> {
    const {
      category_ids,
      subcategory_id,
      screenshots,
      videos,
      logo_file_id,
      demo_file_id,
      name,
      slug,
      ...rest
    } = createToolDto;

    if (slug) {
      const existing = await this.supabaseHelper.findOneBy('tools', 'slug', slug);
      if (existing) {
        throw new ConflictException(`Un outil avec le slug "${slug}" existe déjà.`);
      }
    }

    // Gérer les catégories multiples
    let categories: Category[] = [];
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        const category = await this.supabaseHelper.findOne('categories', categoryId);
        if (!category) {
          throw new NotFoundException(
            `Catégorie avec l'ID "${categoryId}" introuvable.`
          );
        }
        categories.push(category as Category);
      }
    }

    const subcategory = subcategory_id
      ? await this.supabaseHelper.findOne('categories', subcategory_id)
      : undefined;

    const screenshotFiles: File[] = [];
    if (screenshots?.length) {
      for (const screenshotId of screenshots) {
        const file = await this.supabaseHelper.findOne('files', screenshotId);
        if (file) {
          screenshotFiles.push(file as File);
        }
      }
    }

    const videoFiles: File[] = [];
    if (videos?.length) {
      for (const videoId of videos) {
        const file = await this.supabaseHelper.findOne('files', videoId);
        if (file) {
          videoFiles.push(file as File);
        }
      }
    }

    const logo = logo_file_id
      ? await this.supabaseHelper.findOne('files', logo_file_id)
      : undefined;

    const demo = demo_file_id
      ? await this.supabaseHelper.findOne('files', demo_file_id)
      : undefined;

    const finalSlug = slug || await this.generateUniqueSlug(name);

    const toolData = {
      ...rest,
      name,
      slug: finalSlug,
      category_ids,
      subcategory_id,
      screenshots,
      videos,
      logo_file_id,
      demo_file_id,
    };

    const tool = await this.supabaseHelper.create('tools', toolData);
    
    // Manually attach related data for the response
    const toolWithRelations = {
      ...tool,
      category: categories,
      subcategory,
      screenshots: screenshotFiles,
      videos: videoFiles,
      logo,
      demo,
    };

    return toolWithRelations as Tools;
  }

  async findAll(): Promise<Tools[]> {
    try {
      const tools = await this.supabaseHelper.findAll('tools', {
        orderBy: 'created_at',
        ascending: false,
      });

      // For each tool, fetch related data with error handling
      const toolsWithRelations = await Promise.all(
        tools.map(async (tool: any) => {
          try {
            // Get categories from the junction table or direct relation
            let categories: any[] = [];
            try {
              if (tool.category_ids && Array.isArray(tool.category_ids)) {
                // Fetch categories from category_ids array
                for (const categoryId of tool.category_ids) {
                  try {
                    const category = await this.supabaseHelper.findOne('categories', categoryId);
                    if (category) {
                      categories.push(category);
                    }
                  } catch (catError) {
                    console.warn(`Failed to fetch category ${categoryId}:`, catError.message);
                  }
                }
              } else {
                // Try to get categories from junction table
                const junctionData = await this.supabaseHelper.getAdminClient()
                  .from('tools_categories')
                  .select('category_id, categories(*)')
                  .eq('tool_id', tool.id);
                
                if (junctionData.data && !junctionData.error) {
                  categories = junctionData.data
                    .map((item: any) => item.categories)
                    .filter(Boolean);
                }
              }
            } catch (catError) {
              console.warn(`Categories fetch failed for tool ${tool.id}:`, catError.message);
            }

            // Fallback: if no categories resolved, try primary_category_id
            if ((!categories || categories.length === 0) && (tool as any).primary_category_id) {
              try {
                const primaryCat = await this.supabaseHelper.findOne('categories', (tool as any).primary_category_id);
                if (primaryCat) {
                  categories = [primaryCat];
                }
              } catch (primaryCatError) {
                console.warn(`Failed to fetch primary_category_id ${(tool as any).primary_category_id}:`, primaryCatError.message);
              }
            }

            // Get subcategory
            let subcategory = null;
            if (tool.subcategory_id) {
              try {
                subcategory = await this.supabaseHelper.findOne('categories', tool.subcategory_id);
              } catch (subError) {
                console.warn(`Failed to fetch subcategory ${tool.subcategory_id}:`, subError.message);
              }
            }

            // Get screenshots
            let screenshots: File[] = [];
            if (tool.screenshots && Array.isArray(tool.screenshots)) {
              screenshots = await this.getToolFiles(tool.screenshots);
            }

            // Get videos
            let videos: File[] = [];
            if (tool.videos && Array.isArray(tool.videos)) {
              videos = await this.getToolFiles(tool.videos);
            }

            // Get logo
            let logo = null;
            if (tool.logo_file_id) {
              try {
                logo = await this.supabaseHelper.findOne('files', tool.logo_file_id);
              } catch (logoError) {
                console.warn(`Failed to fetch logo ${tool.logo_file_id}:`, logoError.message);
              }
            }

            // Get demo
            let demo = null;
            if (tool.demo_file_id) {
              try {
                demo = await this.supabaseHelper.findOne('files', tool.demo_file_id);
              } catch (demoError) {
                console.warn(`Failed to fetch demo ${tool.demo_file_id}:`, demoError.message);
              }
            }

            return {
              ...tool,
              category: categories,
              subcategory,
              screenshots,
              videos,
              logo,
              demo,
            };
          } catch (toolError) {
            console.error(`Error processing tool ${tool.id}:`, toolError);
            // Return tool with minimum data to avoid total failure
            return {
              ...tool,
              category: [],
              subcategory: null,
              screenshots: [],
              videos: [],
              logo: null,
              demo: null,
            };
          }
        })
      );

      return toolsWithRelations as Tools[];
    } catch (error) {
      // Check if the error is related to missing tables
      if (error.message && error.message.includes('Could not find the table')) {
        console.error('Database tables not initialized. Please run database initialization first.');
        // Return empty array instead of throwing error
        return [];
      }
      
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Tools> {
    const tool = await this.supabaseHelper.findOne('tools', id);
    if (!tool) {
      throw new NotFoundException(`Outil IA avec l'ID "${id}" introuvable`);
    }

    const categories = await this.getToolCategories(tool.id);
    const subcategory = (tool as any).subcategory_id
      ? await this.supabaseHelper.findOne('categories', (tool as any).subcategory_id)
      : null;
    const screenshots = await this.getToolFiles((tool as any).screenshots || []);
    const videos = await this.getToolFiles((tool as any).videos || []);
    const logo = (tool as any).logo_file_id
      ? await this.supabaseHelper.findOne('files', (tool as any).logo_file_id)
      : null;
    const demo = (tool as any).demo_file_id
      ? await this.supabaseHelper.findOne('files', (tool as any).demo_file_id)
      : null;

    const toolWithRelations = {
      ...tool,
      category: categories,
      subcategory,
      screenshots,
      videos,
      logo,
      demo,
    };

    return toolWithRelations as Tools;
  }

  async update(id: string, updateToolDto: UpdateToolDto): Promise<Tools> {
    const {
      category_ids,
      subcategory_id,
      screenshots,
      videos,
      logo_file_id,
      demo_file_id,
      name,
      slug,
      ...rest
    } = updateToolDto;

    const tool = await this.findOne(id);

    // Vérifie unicité du slug si fourni
    if (slug) {
      const existing = await this.supabaseHelper.query(
        'tools',
        (query: any) => query.select('*').eq('slug', slug).neq('id', id)
      );
      if (existing && existing.length > 0) {
        throw new ConflictException(`Un outil avec le slug "${slug}" existe déjà.`);
      }
      (tool as any).slug = slug;
    } else if (name && name !== (tool as any).name) {
      (tool as any).slug = await this.generateUniqueSlug(name, id);
    }

    // Gérer les catégories multiples dans update
    if (category_ids !== undefined) {
      if (category_ids.length > 0) {
        const categories: Category[] = [];
        for (const categoryId of category_ids) {
          const category = await this.supabaseHelper.findOne('categories', categoryId);
          if (!category) {
            throw new NotFoundException(
              `Catégorie avec l'ID "${categoryId}" introuvable.`
            );
          }
          categories.push(category as Category);
        }
        (tool as any).category_ids = category_ids;
        (tool as any).category = categories;
      } else {
        (tool as any).category_ids = [];
        (tool as any).category = [];
      }
    }

    if (subcategory_id) {
      const subcategory = await this.supabaseHelper.findOne('categories', subcategory_id);
      if (!subcategory) {
        throw new NotFoundException(`Sous-catégorie avec l'ID "${subcategory_id}" introuvable.`);
      }
      (tool as any).subcategory_id = subcategory_id;
      (tool as any).subcategory = subcategory;
    }

    if (screenshots !== undefined) {
      (tool as any).screenshots = screenshots;
      const screenshotFiles = await this.getToolFiles(screenshots);
      (tool as any).screenshots = screenshotFiles;
    }

    if (videos !== undefined) {
      (tool as any).videos = videos;
      const videoFiles = await this.getToolFiles(videos);
      (tool as any).videos = videoFiles;
    }

    if (logo_file_id) {
      const logo = await this.supabaseHelper.findOne('files', logo_file_id);
      if (!logo) {
        throw new NotFoundException(`Fichier logo avec l'ID "${logo_file_id}" introuvable.`);
      }
      (tool as any).logo_file_id = logo_file_id;
      (tool as any).logo = logo;
    }

    if (demo_file_id) {
      const demo = await this.supabaseHelper.findOne('files', demo_file_id);
      if (!demo) {
        throw new NotFoundException(`Fichier démo avec l'ID "${demo_file_id}" introuvable.`);
      }
      (tool as any).demo_file_id = demo_file_id;
      (tool as any).demo = demo;
    }

    Object.assign(tool, rest);
    if (name) (tool as any).name = name;

    const updatedTool = await this.supabaseHelper.update('tools', id, tool);
    return updatedTool as Tools;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.supabaseHelper.remove('tools', id);
    return { message: `Outil IA avec l'ID "${id}" supprimé avec succès.` };
  }

  // Helper methods to fetch related data with error handling
  private async getToolCategories(toolId: string): Promise<Category[]> {
    try {
      // First try to get category_ids from the tool
      const tool = await this.supabaseHelper.findOne('tools', toolId);
      if (!tool) {
        return [];
      }

      const categories: Category[] = [];
      
      // Try category_ids array first
      if ((tool as any).category_ids && Array.isArray((tool as any).category_ids)) {
        for (const categoryId of (tool as any).category_ids) {
          try {
            const category = await this.supabaseHelper.findOne('categories', categoryId);
            if (category) {
              categories.push(category as Category);
            }
          } catch (catError) {
            console.warn(`Failed to fetch category ${categoryId}:`, catError.message);
          }
        }
        // If still empty, try primary_category_id fallback
        if (categories.length === 0 && (tool as any).primary_category_id) {
          try {
            const primaryCat = await this.supabaseHelper.findOne('categories', (tool as any).primary_category_id);
            if (primaryCat) {
              categories.push(primaryCat as Category);
            }
          } catch (primaryCatError) {
            console.warn(`Failed to fetch primary_category_id ${(tool as any).primary_category_id}:`, primaryCatError.message);
          }
        }
        return categories;
      }

      // If no category_ids, try junction table
      const junctionData = await this.supabaseHelper.getAdminClient()
        .from('tools_categories')
        .select('category_id, categories(*)')
        .eq('tool_id', toolId);
      
      if (junctionData.data && !junctionData.error) {
        const cats = junctionData.data
          .map((item: any) => item.categories)
          .filter(Boolean) as Category[];
        if (cats.length > 0) return cats;
      }

      // Final fallback: primary_category_id
      if ((tool as any).primary_category_id) {
        try {
          const primaryCat = await this.supabaseHelper.findOne('categories', (tool as any).primary_category_id);
          if (primaryCat) {
            return [primaryCat as Category];
          }
        } catch (primaryCatError) {
          console.warn(`Failed to fetch primary_category_id ${(tool as any).primary_category_id}:`, primaryCatError.message);
        }
      }

      return categories;
    } catch (error) {
      console.error(`Error fetching categories for tool ${toolId}:`, error);
      return [];
    }
  }

  private async getToolFiles(fileIds: string[]): Promise<File[]> {
    const files: File[] = [];
    if (!Array.isArray(fileIds)) {
      return files;
    }
    
    for (const fileId of fileIds) {
      try {
        const file = await this.supabaseHelper.findOne('files', fileId);
        if (file) {
          files.push(file as File);
        }
      } catch (fileError) {
        console.warn(`Failed to fetch file ${fileId}:`, fileError.message);
      }
    }
    return files;
  }
}
