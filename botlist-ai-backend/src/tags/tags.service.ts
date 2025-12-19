import { Injectable } from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = await this.supabaseHelper.create('tags', createTagDto);
    return tag as Tag;
  }

  async findAll(): Promise<Tag[]> {
    const tags = await this.supabaseHelper.findAll('tags');
    return tags as Tag[];
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.supabaseHelper.findOne('tags', id);
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    return tag as Tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.supabaseHelper.update('tags', id, updateTagDto);
    return tag as Tag;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.supabaseHelper.remove('tags', id);
    return { message: `Tag ${id} deleted successfully` };
  }
}
