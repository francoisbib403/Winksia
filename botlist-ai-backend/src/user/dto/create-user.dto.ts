import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { USER_AUTH_TYPE, USER_ROLE } from '../enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  role: USER_ROLE;

  @IsOptional()
  auth_type?: USER_AUTH_TYPE;

  @IsNotEmpty()
  @IsString()
  pwd: string;
}
