import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { USER_ROLE } from 'src/user/enum';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard(), RoleGuard)
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Put(':id')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard(), RoleGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard(), RoleGuard)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }
}
