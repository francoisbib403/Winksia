import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './jwt-auth.guard';

@Controller('register')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  async register(@Body() dto: RegisterDto) {
    console.log('📝 [Register] Registration attempt for email:', dto.email);
    return this.authService.register(dto);
  }
}
