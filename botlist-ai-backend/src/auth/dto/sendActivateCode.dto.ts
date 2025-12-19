import { IsNotEmpty, IsEmail } from 'class-validator';

export class SendActivateCodeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
