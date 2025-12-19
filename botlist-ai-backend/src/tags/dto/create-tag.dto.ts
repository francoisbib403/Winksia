import { IsString, IsOptional, IsHexColor, IsInt } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  usage_count?: number;
}
