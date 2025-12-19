import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  jobTitle: string;

  @IsOptional()
  @IsString()
  companySize: string;

  @IsOptional()
  @IsString()
  industry: string;

  @IsNotEmpty()
  @IsString()
  pwd: string;
}
