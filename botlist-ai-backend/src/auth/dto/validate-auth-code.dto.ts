import { IsJWT, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ValidateAuthCodeDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be a 6-digit number',
  })
  otp: string;

  @IsNotEmpty()
  @IsJWT()
  authToken: string;
}
