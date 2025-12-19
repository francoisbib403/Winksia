import { IsJWT, IsNotEmpty } from 'class-validator';

export class AuthCodeDto {
  @IsNotEmpty()
  @IsJWT()
  authToken: string;
}
