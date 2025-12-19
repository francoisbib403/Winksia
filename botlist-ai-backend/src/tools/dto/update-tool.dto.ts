import { PartialType } from '@nestjs/mapped-types';
import { CreateToolDto } from './create-tool.dto';
import {
  IsUUID,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export class UpdateToolDto extends PartialType(CreateToolDto) {
 @IsArray()
@IsUUID('4', { each: true })
@IsOptional()
category_ids?: string[];

  @IsUUID()
  @IsOptional()
  subcategory_id?: string;

  @IsUUID()
  @IsOptional()
  logo_file_id?: string;

  @IsUUID()
  @IsOptional()
  demo_file_id?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  screenshots?: string[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  videos?: string[];

  @IsUUID()
  @IsOptional()
  created_by?: string;

  @IsUrl()
  @IsOptional()
  website_url?: string;

  @IsUrl()
  @IsOptional()
  documentation_url?: string;

  @IsUrl()
  @IsOptional()
  github_url?: string;

  @IsUrl()
  @IsOptional()
  api_documentation_url?: string;
}
