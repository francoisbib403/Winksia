import { IsJWT, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be a 6-digit number',
  })
  otp: string;

  @IsNotEmpty()
  @IsJWT()
  verifyResetCodeToken: string;
}
