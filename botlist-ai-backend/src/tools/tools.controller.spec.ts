import { Test, TestingModule } from '@nestjs/testing';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

describe('ToolsController', () => {
  let controller: ToolsController;
  let service: ToolsService;

  const mockTool = {
    id: 'uuid-test',
    name: 'Test Tool',
    slug: 'test-tool',
    description: 'A test AI tool',
    website_url: 'https://example.com',
    pricing_model: 'free',
    status: 'draft',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockToolsService = {
    create: jest.fn().mockResolvedValue(mockTool),
    findAll: jest.fn().mockResolvedValue([mockTool]),
    findOne: jest.fn().mockResolvedValue(mockTool),
    update: jest.fn().mockResolvedValue({ ...mockTool, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ message: 'deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolsController],
      providers: [
        {
          provide: ToolsService,
          useValue: mockToolsService,
        },
      ],
    }).compile();

    controller = module.get<ToolsController>(ToolsController);
    service = module.get<ToolsService>(ToolsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a tool', async () => {
    const dto: CreateToolDto = {
      name: 'Test Tool',
      slug: 'test-tool',
      description: 'A test AI tool',
      website_url: 'https://example.com',
      pricing_model: 'free',
    } as any;

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockTool);
  });

  it('should return all tools', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTool]);
  });

  it('should return one tool', async () => {
    const result = await controller.findOne('uuid-test');
    expect(service.findOne).toHaveBeenCalledWith('uuid-test');
    expect(result).toEqual(mockTool);
  });

  it('should update a tool', async () => {
    const dto: UpdateToolDto = { name: 'Updated' } as any;
    const result = await controller.update('uuid-test', dto);
    expect(service.update).toHaveBeenCalledWith('uuid-test', dto);
    expect(result.name).toBe('Updated');
  });

  it('should delete a tool', async () => {
    const result = await controller.remove('uuid-test');
    expect(service.remove).toHaveBeenCalledWith('uuid-test');
    expect(result).toEqual({ message: 'deleted' });
  });
});
