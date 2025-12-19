import { Test, TestingModule } from '@nestjs/testing';
import { MetierService } from './metier.service';

describe('MetierService', () => {
  let service: MetierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetierService],
    }).compile();

    service = module.get<MetierService>(MetierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
