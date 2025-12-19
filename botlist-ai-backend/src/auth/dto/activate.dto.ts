import { IsJWT, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ActivateUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be a 4-digit number',
  })
  otp: string;

  @IsNotEmpty()
  @IsJWT()
  activateToken: string;
}
