import { Test, TestingModule } from '@nestjs/testing';
import { MetierController } from './metier.controller';
import { MetierService } from './metier.service';

describe('MetierController', () => {
  let controller: MetierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetierController],
      providers: [MetierService],
    }).compile();

    controller = module.get<MetierController>(MetierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
