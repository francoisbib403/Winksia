import {
  IsJWT,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsJWT()
  resetToken: string;
}
