import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
