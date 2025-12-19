import { Test, TestingModule } from '@nestjs/testing';
import { SecteurService } from './secteur.service';

describe('SecteurService', () => {
  let service: SecteurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecteurService],
    }).compile();

    service = module.get<SecteurService>(SecteurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
