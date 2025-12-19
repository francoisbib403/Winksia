import {
  IsJWT,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  pwd: string;

  @IsNotEmpty()
  @IsJWT()
  resetToken: string;
}
