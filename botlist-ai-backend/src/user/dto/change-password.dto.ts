import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  pwd: string;

  @IsNotEmpty()
  @IsString()
  newPwd: string;
}
