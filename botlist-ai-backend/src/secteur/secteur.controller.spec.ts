import { Test, TestingModule } from '@nestjs/testing';
import { SecteurController } from './secteur.controller';
import { SecteurService } from './secteur.service';

describe('SecteurController', () => {
  let controller: SecteurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecteurController],
      providers: [SecteurService],
    }).compile();

    controller = module.get<SecteurController>(SecteurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
