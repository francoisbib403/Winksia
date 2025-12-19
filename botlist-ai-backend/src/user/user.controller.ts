import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/role/role.guard';
import { USER_ROLE } from './enum';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  async findMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  @UseGuards(AuthGuard())
  async updateMe(@Body() dto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.update(user.id, dto);
  }

  @Post('change-password')
  async changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(user, dto.pwd, dto.newPwd);
  }

  @Get(':id')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete('me')
  async removeMe(@GetUser() user: User) {
    await this.userService.remove(user.id);
    return { message: 'User deleted.' };
  }
  

  @Delete(':id')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted.' };
  }
}
