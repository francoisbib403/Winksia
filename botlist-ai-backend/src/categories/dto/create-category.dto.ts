import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsHexColor,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsHexColor()
  @IsOptional()
  color_theme?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  meta_title?: string;

  @IsString()
  @IsOptional()
  meta_description?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
