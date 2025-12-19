import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecteurService } from './secteur.service';
import { CreateSecteurDto } from './dto/create-secteur.dto';
import { UpdateSecteurDto } from './dto/update-secteur.dto';

@Controller('secteur')
export class SecteurController {
  constructor(private readonly secteurService: SecteurService) {}

  @Post()
  create(@Body() createSecteurDto: CreateSecteurDto) {
    return this.secteurService.create(createSecteurDto);
  }

  @Get()
  findAll() {
    return this.secteurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secteurService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecteurDto: UpdateSecteurDto) {
    return this.secteurService.update(+id, updateSecteurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secteurService.remove(+id);
  }
}
