import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsBoolean,
  IsUUID,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';
import { PricingModel, ToolStatus } from '../tools.enums';

export class CreateToolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  long_description?: string;

 @IsArray()
@IsUUID('4', { each: true })
category_ids?: string[];

  @IsUUID()
  @IsOptional()
  subcategory_id?: string;

  @IsEnum(PricingModel)
  pricing_model: PricingModel;

  @IsEnum(ToolStatus)
  @IsOptional()
  status?: ToolStatus;

  @IsUrl()
  website_url: string;

  @IsUUID()
  @IsOptional()
  logo_file_id?: string;

  @IsUUID()
  @IsOptional()
  demo_file_id?: string;

  @IsUrl()
  @IsOptional()
  documentation_url?: string;

  @IsUrl()
  @IsOptional()
  github_url?: string;

  @IsBoolean()
  @IsOptional()
  api_available?: boolean;

  @IsUrl()
  @IsOptional()
  api_documentation_url?: string;

  @IsBoolean()
  @IsOptional()
  open_source?: boolean;

  @IsBoolean()
  @IsOptional()
  self_hosted_available?: boolean;

  @IsArray()
  @IsOptional()
  tech_stack?: string[];

  @IsArray()
  @IsOptional()
  supported_languages?: string[];

  @IsObject()
  @IsOptional()
  supported_formats?: Record<string, any>;

  @IsArray()
  @IsOptional()
  integrations?: string[];

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsBoolean()
  @IsOptional()
  gdpr_compliant?: boolean;

  @IsBoolean()
  @IsOptional()
  soc2_certified?: boolean;

  @IsBoolean()
  @IsOptional()
  hipaa_compliant?: boolean;

  @IsArray()
  @IsOptional()
  data_residency?: string[];

  @IsObject()
  @IsOptional()
  pricing_details?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  overall_rating?: number;

  @IsNumber()
  @IsOptional()
  performance_score?: number;

  @IsNumber()
  @IsOptional()
  ease_of_use_score?: number;

  @IsNumber()
  @IsOptional()
  value_for_money_score?: number;

  @IsNumber()
  @IsOptional()
  support_score?: number;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsOptional()
  use_cases?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  screenshots?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  videos?: string[];

  @IsUUID()
  @IsOptional()
  created_by?: string;
}
