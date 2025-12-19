import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { USER_AUTH_TYPE } from '../enum';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  pwd: string;

  @IsNotEmpty()
  auth_type: USER_AUTH_TYPE;
}
