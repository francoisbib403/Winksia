import { Test, TestingModule } from '@nestjs/testing';
import { ToolsService } from './tools.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tools } from './entities/tools.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockTool = {
  id: 'uuid-test',
  name: 'Test Tool',
  slug: 'test-tool',
  description: 'Description',
  website_url: 'https://example.com',
  pricing_model: 'free',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('ToolsService', () => {
  let service: ToolsService;
  let repo: Repository<Tools>;

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockTool),
    save: jest.fn().mockResolvedValue(mockTool),
    find: jest.fn().mockResolvedValue([mockTool]),
    findOne: jest.fn().mockResolvedValue(mockTool),
    merge: jest.fn().mockImplementation((oldTool, updates) => ({
      ...oldTool,
      ...updates,
    })),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolsService,
        {
          provide: getRepositoryToken(Tools),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ToolsService>(ToolsService);
    repo = module.get<Repository<Tools>>(getRepositoryToken(Tools));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a tool', async () => {
    const dto = { name: 'Test Tool' } as any;
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(mockTool);
    expect(result).toEqual(mockTool);
  });

  it('should return all tools', async () => {
    const result = await service.findAll();
    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([mockTool]);
  });

  it('should return one tool by id', async () => {
    const result = await service.findOne('uuid-test');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-test' } });
    expect(result).toEqual(mockTool);
  });

  it('should throw if tool not found', async () => {
    repo.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('not-found')).rejects.toThrow(NotFoundException);
  });

  it('should update a tool', async () => {
    const updateDto = { name: 'Updated Tool' } as any;
    const result = await service.update('uuid-test', updateDto);
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Updated Tool');
  });

  it('should remove a tool', async () => {
    const result = await service.remove('uuid-test');
    expect(repo.remove).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Outil IA avec l\'ID "uuid-test" supprimé avec succès.' });
  });
});
