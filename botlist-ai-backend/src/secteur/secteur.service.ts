import { Injectable } from '@nestjs/common';
import { CreateSecteurDto } from './dto/create-secteur.dto';
import { UpdateSecteurDto } from './dto/update-secteur.dto';

@Injectable()
export class SecteurService {
  create(createSecteurDto: CreateSecteurDto) {
    return 'This action adds a new secteur';
  }

  findAll() {
    return `This action returns all secteur`;
  }

  findOne(id: number) {
    return `This action returns a #${id} secteur`;
  }

  update(id: number, updateSecteurDto: UpdateSecteurDto) {
    return `This action updates a #${id} secteur`;
  }

  remove(id: number) {
    return `This action removes a #${id} secteur`;
  }
}
