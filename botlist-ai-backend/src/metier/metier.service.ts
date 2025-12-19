import { Injectable } from '@nestjs/common';
import { CreateMetierDto } from './dto/create-metier.dto';
import { UpdateMetierDto } from './dto/update-metier.dto';

@Injectable()
export class MetierService {
  create(createMetierDto: CreateMetierDto) {
    return 'This action adds a new metier';
  }

  findAll() {
    return `This action returns all metier`;
  }

  findOne(id: number) {
    return `This action returns a #${id} metier`;
  }

  update(id: number, updateMetierDto: UpdateMetierDto) {
    return `This action updates a #${id} metier`;
  }

  remove(id: number) {
    return `This action removes a #${id} metier`;
  }
}
