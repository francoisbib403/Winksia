import { Injectable } from '@nestjs/common';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@Injectable()
export class TacheService {
  create(createTacheDto: CreateTacheDto) {
    return 'This action adds a new tache';
  }

  findAll() {
    return `This action returns all tache`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tache`;
  }

  update(id: number, updateTacheDto: UpdateTacheDto) {
    return `This action updates a #${id} tache`;
  }

  remove(id: number) {
    return `This action removes a #${id} tache`;
  }
}
