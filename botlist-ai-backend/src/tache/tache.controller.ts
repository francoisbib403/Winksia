import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TacheService } from './tache.service';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@Controller('tache')
export class TacheController {
  constructor(private readonly tacheService: TacheService) {}

  @Post()
  create(@Body() createTacheDto: CreateTacheDto) {
    return this.tacheService.create(createTacheDto);
  }

  @Get()
  findAll() {
    return this.tacheService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tacheService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTacheDto: UpdateTacheDto) {
    return this.tacheService.update(+id, updateTacheDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tacheService.remove(+id);
  }
}
