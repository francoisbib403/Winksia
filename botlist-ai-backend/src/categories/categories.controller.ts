import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { USER_ROLE } from 'src/user/enum';
import { Public } from 'src/auth/jwt-auth.guard';        // ← importer ici
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Public()   
  @Post()
 // @Roles(USER_ROLE.ADMIN)
  //@UseGuards(AuthGuard(), RoleGuard)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }
  @Public()          // ← rend cette route accessible sans jeton
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
  @Public()          // ← rend cette route accessible sans jeton
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
  @Public()   
  @Put(':id')
  // @Roles(USER_ROLE.ADMIN)
  //@UseGuards(AuthGuard(), RoleGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }
  @Public()   
  @Delete(':id')
  //@Roles(USER_ROLE.ADMIN)
 // @UseGuards(AuthGuard(), RoleGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
