import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MetierService } from './metier.service';
import { CreateMetierDto } from './dto/create-metier.dto';
import { UpdateMetierDto } from './dto/update-metier.dto';

@Controller('metier')
export class MetierController {
  constructor(private readonly metierService: MetierService) {}

  @Post()
  create(@Body() createMetierDto: CreateMetierDto) {
    return this.metierService.create(createMetierDto);
  }

  @Get()
  findAll() {
    return this.metierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetierDto: UpdateMetierDto) {
    return this.metierService.update(+id, updateMetierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metierService.remove(+id);
  }
}
